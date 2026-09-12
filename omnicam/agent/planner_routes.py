"""HTTP surface for the built-in OmniCam Agent planner (design spec sections
30-31).

    POST /majoor/omnicam/agent/v1/plan
    POST /majoor/omnicam/agent/v1/apply-plan

Both are browser-callback routes: the Director's own Agent panel calls them
for the session it already registered over the existing Agent bridge. No
credential is ever accepted in the request body -- it is resolved
server-side from the SecretStore/environment, exactly like the provider
test/models routes.
"""

from __future__ import annotations

try:
    from aiohttp import web
except ImportError:  # pragma: no cover - aiohttp ships with ComfyUI
    web = None  # type: ignore[assignment]

from ..comfy_compat.server import PromptServer
from ..http_json import read_bounded_json_object
from .broker import BROKER
from .planner import run_planner
from .planner_schema import PLANNER_OPERATIONS, PLANNER_QUERIES
from .protocol import AgentProtocolError, bounded_string
from .providers.models import PROVIDER_IDS, ProviderConfig
from .providers.secret_store import SECRET_STORE

MAX_PLAN_JSON_BYTES = 64 * 1024
MAX_INSTRUCTION_CHARS = 4000


def _error_response(error: AgentProtocolError) -> web.Response:
    return web.json_response({"error": {"code": error.code, "message": error.message}}, status=error.status)


def _request_user_id(request: web.Request) -> str:
    return PromptServer.instance.user_manager.get_request_user_id(request)


def _clamp_int(value: object, fallback: int, minimum: int, maximum: int) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        value = fallback
    return max(minimum, min(maximum, value))


def _provider_config_from_body(body: dict) -> tuple[ProviderConfig, int]:
    provider_body = body.get("provider")
    if not isinstance(provider_body, dict):
        raise AgentProtocolError("BAD_REQUEST", "provider must be an object")

    provider_id = provider_body.get("id")
    if provider_id not in PROVIDER_IDS:
        raise AgentProtocolError("UNKNOWN_PROVIDER", f"Unknown provider: {provider_id!r}")

    model = provider_body.get("model")
    if not isinstance(model, str):
        model = ""
    base_url = provider_body.get("base_url")
    if not isinstance(base_url, str):
        base_url = ""

    max_output_tokens = _clamp_int(provider_body.get("max_output_tokens"), 4096, 512, 32768)
    max_planner_steps = _clamp_int(provider_body.get("max_planner_steps"), 6, 1, 12)
    timeout_seconds = _clamp_int(provider_body.get("timeout_seconds"), 120, 15, 300)

    config = ProviderConfig(
        provider_id=provider_id,
        model=model,
        base_url=base_url,
        max_output_tokens=max_output_tokens,
        timeout_seconds=timeout_seconds,
    )
    return config, max_planner_steps


async def create_plan(request: web.Request) -> web.Response:
    try:
        body = await read_bounded_json_object(request, max_bytes=MAX_PLAN_JSON_BYTES)
        session_id = bounded_string(body.get("session_id"), "session_id", 64)
        instruction = bounded_string(body.get("instruction"), "instruction", MAX_INSTRUCTION_CHARS)
        config, max_planner_steps = _provider_config_from_body(body)

        # Fail fast, before spending an LLM call, if the Director session this
        # plan would target is not actually live.
        BROKER.require_session(session_id)

        owner_id = _request_user_id(request)
        credential = SECRET_STORE.resolve(request, config.provider_id)

        result = await run_planner(
            session_id=session_id,
            owner_id=owner_id,
            instruction=instruction,
            provider_config=config,
            credential=credential,
            max_planner_steps=max_planner_steps,
            operations=list(PLANNER_OPERATIONS),
            queries=list(PLANNER_QUERIES),
        )

        if result.finished:
            return web.json_response({"ok": True, "finished": True, "message": result.message or ""})

        plan = result.plan
        if plan is None:  # pragma: no cover - result.finished is False iff a plan exists
            raise AgentProtocolError("PLANNER_FAILED", "Planner produced neither a plan nor a finish message", 502)
        preview = plan.preview
        return web.json_response({
            "ok": True,
            "plan_id": plan.plan_id,
            "revision": preview.get("revision", plan.base_revision),
            "description": plan.transaction.get("description", ""),
            "changes": preview.get("changes", []),
            "warnings": preview.get("warnings", []),
            "truncated": bool(preview.get("truncated", False)),
        })
    except AgentProtocolError as error:
        return _error_response(error)
    except Exception as error:  # noqa: BLE001 - never let a provider/planner crash surface as a 500
        return web.json_response(
            {"ok": False, "error": {"code": "PLANNER_FAILED", "message": str(error)}}, status=502
        )


async def apply_plan(request: web.Request) -> web.Response:
    try:
        body = await read_bounded_json_object(request, max_bytes=1024)
        plan_id = bounded_string(body.get("plan_id"), "plan_id", 64)
        owner_id = _request_user_id(request)

        from .plan_store import PLAN_STORE

        plan = PLAN_STORE.get(plan_id)
        # A plan owned by someone else is reported exactly like a missing one
        # -- existence must not leak across users.
        if plan is None or plan.owner_id != owner_id:
            raise AgentProtocolError("UNKNOWN_PLAN", "No such pending plan (it may have expired)", 404)

        BROKER.require_session(plan.session_id)

        apply_transaction = {**plan.transaction, "validateOnly": False}
        result = await BROKER.dispatch(plan.session_id, "transaction", apply_transaction)

        PLAN_STORE.consume(plan_id)

        if not result.get("ok"):
            error = result.get("error") or {}
            if error.get("code") == "STALE_REVISION":
                raise AgentProtocolError(
                    "STALE_PLAN", "The Director changed after this preview. Generate a new preview.", 409
                )
            return web.json_response({"ok": False, "error": error})

        return web.json_response({"ok": True, "revision": result.get("revision"), "applied": result.get("applied")})
    except AgentProtocolError as error:
        return _error_response(error)
    except Exception as error:  # noqa: BLE001
        return web.json_response(
            {"ok": False, "error": {"code": "APPLY_FAILED", "message": str(error)}}, status=502
        )


if web is not None:
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/plan")(create_plan)
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/apply-plan")(apply_plan)
