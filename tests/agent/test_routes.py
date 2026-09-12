"""Route/security tests for OmniCam Agent v1.

Handlers are invoked directly with aiohttp's make_mocked_request so a
request's remote address and headers can be controlled precisely -- no live
ComfyUI or real socket is needed.
"""

from __future__ import annotations

import json
from unittest.mock import Mock

import pytest
from aiohttp import web
from aiohttp.streams import StreamReader
from aiohttp.test_utils import make_mocked_request

from omnicam.agent import routes as agent_routes
from omnicam.agent.broker import BROKER
from omnicam.agent.protocol import AGENT_PROTOCOL
from omnicam.comfy_compat.server import PromptServer


def _json_request(method, path, body, *, remote="127.0.0.1", headers=None):
    payload = json.dumps(body).encode("utf-8")
    request = make_mocked_request(
        method,
        path,
        headers=headers or {},
        payload=_stream_of(payload),
    )
    return request.clone(remote=remote)


def _stream_of(data: bytes) -> StreamReader:
    stream = StreamReader(Mock(), limit=2**20, loop=None)
    stream.feed_data(data)
    stream.feed_eof()
    return stream


@pytest.fixture(autouse=True)
def _reset_broker():
    BROKER._sessions.clear()
    BROKER._pending.clear()
    PromptServer.instance.sockets.clear()
    yield
    BROKER._sessions.clear()
    BROKER._pending.clear()
    PromptServer.instance.sockets.clear()


def _connect_socket(client_id="client_1"):
    """Simulate ComfyUI's own WebSocket transport having a live browser tab
    for this client_id -- what agent_session_register now requires."""
    PromptServer.instance.sockets[client_id] = Mock()


async def _call(handler, request):
    """Invoke a route handler, treating a raised HTTPException as its response
    (mirroring what aiohttp's own dispatch does for a real request)."""
    try:
        return await handler(request)
    except web.HTTPException as response:
        return response


def _register(*, client_id="client_1", node_id="42"):
    return BROKER.register(
        client_id=client_id,
        node_id=node_id,
        label="OmniCam Director 42",
        director_api=1,
        revision=0,
        operations=(),
        queries=(),
    )


# -- loopback enforcement -----------------------------------------------------

@pytest.mark.asyncio
async def test_capabilities_allowed_from_127_0_0_1_with_header():
    request = make_mocked_request(
        "GET", "/majoor/omnicam/agent/v1/capabilities", headers={"X-OmniCam-Agent": "1"}
    ).clone(remote="127.0.0.1")
    response = await agent_routes.agent_capabilities(request)
    assert response.status == 200
    body = json.loads(response.body)
    assert body["protocol"] == AGENT_PROTOCOL


@pytest.mark.asyncio
async def test_capabilities_allowed_from_ipv6_loopback():
    request = make_mocked_request(
        "GET", "/majoor/omnicam/agent/v1/capabilities", headers={"X-OmniCam-Agent": "1"}
    ).clone(remote="::1")
    response = await agent_routes.agent_capabilities(request)
    assert response.status == 200


@pytest.mark.asyncio
async def test_capabilities_rejected_from_a_lan_ip():
    request = make_mocked_request(
        "GET", "/majoor/omnicam/agent/v1/capabilities", headers={"X-OmniCam-Agent": "1"}
    ).clone(remote="192.168.1.50")
    response = await _call(agent_routes.agent_capabilities, request)
    assert response.status == 403


@pytest.mark.asyncio
async def test_capabilities_rejected_without_the_protocol_header():
    request = make_mocked_request("GET", "/majoor/omnicam/agent/v1/capabilities").clone(remote="127.0.0.1")
    response = await _call(agent_routes.agent_capabilities, request)
    assert response.status == 403


@pytest.mark.asyncio
async def test_sessions_list_rejected_from_a_lan_ip():
    request = make_mocked_request(
        "GET", "/majoor/omnicam/agent/v1/sessions", headers={"X-OmniCam-Agent": "1"}
    ).clone(remote="10.0.0.5")
    response = await _call(agent_routes.agent_sessions, request)
    assert response.status == 403


@pytest.mark.asyncio
async def test_sessions_list_never_leaks_the_token():
    _register()
    request = make_mocked_request(
        "GET", "/majoor/omnicam/agent/v1/sessions", headers={"X-OmniCam-Agent": "1"}
    ).clone(remote="127.0.0.1")
    response = await agent_routes.agent_sessions(request)
    body = json.loads(response.body)
    assert len(body["sessions"]) == 1
    assert "token" not in body["sessions"][0]


# -- browser callback routes do not require loopback -------------------------

@pytest.mark.asyncio
async def test_registration_does_not_require_loopback():
    _connect_socket("client_1")
    body = {
        "protocol": AGENT_PROTOCOL,
        "client_id": "client_1",
        "node_id": "42",
        "label": "OmniCam Director 42",
        "director_api": 1,
        "revision": 0,
        "operations": [],
        "queries": [],
    }
    request = _json_request("POST", "/majoor/omnicam/agent/v1/session/register", body, remote="203.0.113.9")
    response = await agent_routes.agent_session_register(request)
    assert response.status == 200
    result = json.loads(response.body)
    assert result["session_id"]
    assert result["session_token"]


# -- registration requires a live ComfyUI browser socket ----------------------

@pytest.mark.asyncio
async def test_registration_accepted_for_a_live_socket():
    _connect_socket("client_1")
    body = {
        "protocol": AGENT_PROTOCOL,
        "client_id": "client_1",
        "node_id": "42",
        "label": "OmniCam Director 42",
        "director_api": 1,
        "revision": 0,
        "operations": [],
        "queries": [],
    }
    request = _json_request("POST", "/majoor/omnicam/agent/v1/session/register", body)
    response = await agent_routes.agent_session_register(request)
    assert response.status == 200


@pytest.mark.asyncio
async def test_registration_rejected_for_an_unknown_socket():
    body = {
        "protocol": AGENT_PROTOCOL,
        "client_id": "not-actually-connected",
        "node_id": "42",
        "label": "OmniCam Director 42",
        "director_api": 1,
        "revision": 0,
        "operations": [],
        "queries": [],
    }
    request = _json_request("POST", "/majoor/omnicam/agent/v1/session/register", body)
    response = await agent_routes.agent_session_register(request)
    assert response.status == 409
    assert json.loads(response.body)["error"]["code"] == "UNKNOWN_CLIENT"


@pytest.mark.asyncio
async def test_registration_rejects_wrong_protocol():
    body = {
        "protocol": "not-the-protocol",
        "client_id": "c",
        "node_id": "1",
        "label": "x",
        "director_api": 1,
        "revision": 0,
    }
    request = _json_request("POST", "/majoor/omnicam/agent/v1/session/register", body)
    response = await agent_routes.agent_session_register(request)
    assert response.status == 400
    assert json.loads(response.body)["error"]["code"] == "BAD_PROTOCOL"


@pytest.mark.asyncio
async def test_registration_rejects_too_many_advertised_operations():
    body = {
        "protocol": AGENT_PROTOCOL,
        "client_id": "c",
        "node_id": "1",
        "label": "x",
        "director_api": 1,
        "revision": 0,
        "operations": [f"op_{i}" for i in range(200)],
        "queries": [],
    }
    request = _json_request("POST", "/majoor/omnicam/agent/v1/session/register", body)
    response = await agent_routes.agent_session_register(request)
    assert response.status == 400
    assert json.loads(response.body)["error"]["code"] == "BAD_REQUEST"


@pytest.mark.asyncio
async def test_registration_rejects_a_negative_revision():
    body = {
        "protocol": AGENT_PROTOCOL,
        "client_id": "c",
        "node_id": "1",
        "label": "x",
        "director_api": 1,
        "revision": -1,
        "operations": [],
        "queries": [],
    }
    request = _json_request("POST", "/majoor/omnicam/agent/v1/session/register", body)
    response = await agent_routes.agent_session_register(request)
    assert response.status == 400


@pytest.mark.asyncio
async def test_oversized_json_body_is_rejected():
    request = _json_request(
        "POST",
        "/majoor/omnicam/agent/v1/session/register",
        {"protocol": AGENT_PROTOCOL, "client_id": "c" * (2 * 1024 * 1024)},
    )
    with pytest.raises(web.HTTPRequestEntityTooLarge):
        await agent_routes.agent_session_register(request)


# -- external transaction route requires baseRevision -------------------------

@pytest.mark.asyncio
async def test_external_transaction_without_base_revision_is_rejected():
    session = _register()
    body = {
        "session_id": session.session_id,
        "transaction": {"version": 1, "id": "tx_1", "description": "x", "operations": []},
    }
    request = _json_request(
        "POST", "/majoor/omnicam/agent/v1/transaction", body, headers={"X-OmniCam-Agent": "1"}
    ).clone(remote="127.0.0.1")
    response = await agent_routes.agent_transaction(request)
    assert response.status == 400
    assert json.loads(response.body)["error"]["code"] == "BASE_REVISION_REQUIRED"


@pytest.mark.asyncio
async def test_external_transaction_route_requires_loopback():
    body = {
        "session_id": "whatever",
        "transaction": {"baseRevision": 0},
    }
    request = _json_request(
        "POST", "/majoor/omnicam/agent/v1/transaction", body, headers={"X-OmniCam-Agent": "1"}
    ).clone(remote="8.8.8.8")
    response = await _call(agent_routes.agent_transaction, request)
    assert response.status == 403
