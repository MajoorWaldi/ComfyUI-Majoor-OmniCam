"""HTTP surface for OmniCam Agent v1.

    GET  /majoor/omnicam/agent/v1/capabilities        loopback only
    GET  /majoor/omnicam/agent/v1/sessions             loopback only
    POST /majoor/omnicam/agent/v1/query                loopback only
    POST /majoor/omnicam/agent/v1/transaction           loopback only
    POST /majoor/omnicam/agent/v1/session/register      browser callback
    POST /majoor/omnicam/agent/v1/session/heartbeat     browser callback
    POST /majoor/omnicam/agent/v1/session/close         browser callback
    POST /majoor/omnicam/agent/v1/reply                 browser callback

The "loopback only" routes are the ones an external Agent process calls
directly and require ``X-OmniCam-Agent: 1`` from 127.0.0.1/::1
(``require_local_agent``). The "browser callback" routes are called by the
live Director's own JS bridge -- possibly over a remote ComfyUI connection --
and are instead authenticated by the session's bearer token.

Registered from ``omnicam/routes.py`` after its helpers exist, like
``routes_scenes``.
"""

from __future__ import annotations

try:
    from aiohttp import web
except ImportError:  # pragma: no cover - aiohttp ships with ComfyUI
    # Every handler below still defines cleanly (its `web.*` annotations are
    # lazily-evaluated strings; see the __future__ import) so this module --
    # and anything that imports it -- stays importable in a plain unit-test
    # environment. Only the actual route *registration* at the bottom is
    # skipped: there is nothing meaningful to register without aiohttp.
    web = None  # type: ignore[assignment]

from ..comfy_compat.server import PromptServer
from ..http_json import read_bounded_json_object
from .broker import BROKER
from .protocol import (
    AGENT_PROTOCOL,
    AGENT_SCHEMA_VERSION,
    MAX_ADVERTISED_OPERATIONS,
    MAX_ADVERTISED_QUERIES,
    MAX_AGENT_JSON_BYTES,
    REQUEST_TIMEOUT_SECONDS,
    SESSION_TTL_SECONDS,
    AgentProtocolError,
    bounded_string,
    require_local_agent,
)


def _error_response(error: AgentProtocolError) -> web.Response:
    return web.json_response({"error": {"code": error.code, "message": error.message}}, status=error.status)


def _string_list(value: object, *, name: str, max_items: int, item_limit: int) -> tuple[str, ...]:
    if not isinstance(value, list) or len(value) > max_items:
        raise AgentProtocolError("BAD_REQUEST", f"{name} must be a list of at most {max_items} strings")
    return tuple(bounded_string(item, name, item_limit) for item in value)


async def agent_capabilities(request: web.Request) -> web.Response:
    try:
        require_local_agent(request)
    except AgentProtocolError as error:
        return _error_response(error)

    return web.json_response(
        {
            "protocol": AGENT_PROTOCOL,
            "schema_version": AGENT_SCHEMA_VERSION,
            "transport": "promptserver-ws-bridge",
            "external_access": "loopback-only",
            "request_timeout_seconds": REQUEST_TIMEOUT_SECONDS,
            "session_ttl_seconds": SESSION_TTL_SECONDS,
        }
    )


async def agent_sessions(request: web.Request) -> web.Response:
    try:
        require_local_agent(request)
    except AgentProtocolError as error:
        return _error_response(error)

    return web.json_response({"sessions": BROKER.list_sessions()})


async def agent_query(request: web.Request) -> web.Response:
    try:
        require_local_agent(request)
        body = await read_bounded_json_object(request, max_bytes=MAX_AGENT_JSON_BYTES)
        session_id = bounded_string(body.get("session_id"), "session_id", 64)
        query_request = body.get("request")
        if not isinstance(query_request, dict):
            raise AgentProtocolError("BAD_REQUEST", "request must be an object")
        result = await BROKER.dispatch(session_id, "query", query_request)
        return web.json_response(result)
    except AgentProtocolError as error:
        return _error_response(error)


async def agent_transaction(request: web.Request) -> web.Response:
    try:
        require_local_agent(request)
        body = await read_bounded_json_object(request, max_bytes=MAX_AGENT_JSON_BYTES)
        session_id = bounded_string(body.get("session_id"), "session_id", 64)
        transaction = body.get("transaction")
        if not isinstance(transaction, dict):
            raise AgentProtocolError("BAD_REQUEST", "transaction must be an object")

        # The external Agent path never gets the backwards-compatible
        # no-revision mode: a caller outside the browser has no other way to
        # observe that the scene changed under it.
        base_revision = transaction.get("baseRevision")
        if not isinstance(base_revision, int) or isinstance(base_revision, bool) or base_revision < 0:
            raise AgentProtocolError(
                "BASE_REVISION_REQUIRED", "External Agent transactions require a non-negative integer baseRevision"
            )

        result = await BROKER.dispatch(session_id, "transaction", transaction)
        return web.json_response(result)
    except AgentProtocolError as error:
        return _error_response(error)


async def agent_session_register(request: web.Request) -> web.Response:
    try:
        body = await read_bounded_json_object(request, max_bytes=MAX_AGENT_JSON_BYTES)

        protocol = body.get("protocol")
        if protocol != AGENT_PROTOCOL:
            raise AgentProtocolError("BAD_PROTOCOL", f"Unsupported Agent protocol: {protocol!r}")

        client_id = bounded_string(body.get("client_id"), "client_id", 200)
        node_id = bounded_string(body.get("node_id"), "node_id", 80)
        label = bounded_string(body.get("label"), "label", 120)

        director_api = body.get("director_api")
        if not isinstance(director_api, int) or isinstance(director_api, bool):
            raise AgentProtocolError("BAD_REQUEST", "director_api must be an integer")

        revision = body.get("revision")
        if not isinstance(revision, int) or isinstance(revision, bool) or revision < 0:
            raise AgentProtocolError("BAD_REQUEST", "revision must be a non-negative integer")

        operations = _string_list(body.get("operations", []), name="operations", max_items=MAX_ADVERTISED_OPERATIONS, item_limit=100)
        queries = _string_list(body.get("queries", []), name="queries", max_items=MAX_ADVERTISED_QUERIES, item_limit=100)

        session = BROKER.register(
            client_id=client_id,
            node_id=node_id,
            label=label,
            director_api=director_api,
            revision=revision,
            operations=operations,
            queries=queries,
        )
        return web.json_response({"session_id": session.session_id, "session_token": session.token})
    except AgentProtocolError as error:
        return _error_response(error)


async def agent_session_heartbeat(request: web.Request) -> web.Response:
    try:
        body = await read_bounded_json_object(request, max_bytes=MAX_AGENT_JSON_BYTES)
        session_id = bounded_string(body.get("session_id"), "session_id", 64)
        session_token = bounded_string(body.get("session_token"), "session_token", 128)
        revision = body.get("revision")
        if not isinstance(revision, int) or isinstance(revision, bool) or revision < 0:
            raise AgentProtocolError("BAD_REQUEST", "revision must be a non-negative integer")
        BROKER.heartbeat(session_id, session_token, revision)
        return web.json_response({"ok": True})
    except AgentProtocolError as error:
        return _error_response(error)


async def agent_session_close(request: web.Request) -> web.Response:
    try:
        body = await read_bounded_json_object(request, max_bytes=MAX_AGENT_JSON_BYTES)
        session_id = bounded_string(body.get("session_id"), "session_id", 64)
        session_token = bounded_string(body.get("session_token"), "session_token", 128)
        BROKER.close(session_id, session_token)
        return web.json_response({"ok": True})
    except AgentProtocolError as error:
        return _error_response(error)


async def agent_reply(request: web.Request) -> web.Response:
    try:
        body = await read_bounded_json_object(request, max_bytes=MAX_AGENT_JSON_BYTES)
        session_id = bounded_string(body.get("session_id"), "session_id", 64)
        session_token = bounded_string(body.get("session_token"), "session_token", 128)
        request_id = bounded_string(body.get("request_id"), "request_id", 64)
        result = body.get("result")
        if not isinstance(result, dict):
            raise AgentProtocolError("BAD_REQUEST", "result must be an object")
        BROKER.reply(session_id, session_token, request_id, result)
        return web.json_response({"ok": True})
    except AgentProtocolError as error:
        return _error_response(error)


# Registration is skipped (rather than crashing) when aiohttp is unavailable
# -- see the try/except at the top of this module. In a real ComfyUI process
# aiohttp always ships, so this only matters for a bare unit-test environment.
if web is not None:
    PromptServer.instance.routes.get("/majoor/omnicam/agent/v1/capabilities")(agent_capabilities)
    PromptServer.instance.routes.get("/majoor/omnicam/agent/v1/sessions")(agent_sessions)
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/query")(agent_query)
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/transaction")(agent_transaction)
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/session/register")(agent_session_register)
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/session/heartbeat")(agent_session_heartbeat)
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/session/close")(agent_session_close)
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/reply")(agent_reply)
