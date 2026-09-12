"""HTTP surface for OmniCam Agent v1 provider configuration (design spec
section 13).

    GET    /majoor/omnicam/agent/v1/providers
    GET    /majoor/omnicam/agent/v1/providers/{provider}/status
    PUT    /majoor/omnicam/agent/v1/providers/{provider}/credential
    DELETE /majoor/omnicam/agent/v1/providers/{provider}/credential
    POST   /majoor/omnicam/agent/v1/providers/{provider}/test
    POST   /majoor/omnicam/agent/v1/providers/{provider}/models

These are browser-callback routes (the Director's own Settings/Agent UI
talking to its own backend) -- unlike the external Agent's loopback-only
control routes, they carry no scene data and never see or return a raw
credential, only {"configured": bool, "source": "environment"|"local_store"|"none"}.
"""

from __future__ import annotations

try:
    from aiohttp import web
except ImportError:  # pragma: no cover - aiohttp ships with ComfyUI
    web = None  # type: ignore[assignment]

from ..comfy_compat.server import PromptServer
from ..http_json import read_bounded_json_object
from .protocol import AgentProtocolError
from .providers.models import PROVIDER_IDS, ProviderConfig
from .providers.registry import get_provider, provider_capabilities
from .providers.secret_store import ENV_VAR_BY_PROVIDER, SECRET_STORE, SecretStoreError

MAX_PROVIDER_JSON_BYTES = 64 * 1024
MAX_CREDENTIAL_BYTES = 16 * 1024


def _error_response(error: AgentProtocolError) -> web.Response:
    return web.json_response({"error": {"code": error.code, "message": error.message}}, status=error.status)


def _require_provider(provider_id: str) -> None:
    if provider_id not in PROVIDER_IDS:
        raise AgentProtocolError("UNKNOWN_PROVIDER", f"Unknown provider: {provider_id!r}", 404)


def _require_env_unmanaged(provider_id: str) -> None:
    import os

    env_var = ENV_VAR_BY_PROVIDER.get(provider_id)
    if env_var and os.environ.get(env_var):
        raise AgentProtocolError(
            "CREDENTIAL_MANAGED_BY_ENV",
            f"{provider_id} credential is managed by the {env_var} environment variable",
            409,
        )


async def list_providers(request: web.Request) -> web.Response:
    return web.json_response({"providers": provider_capabilities()})


async def provider_status(request: web.Request) -> web.Response:
    provider_id = request.match_info["provider"]
    try:
        _require_provider(provider_id)
        status = SECRET_STORE.status(request, provider_id)
        return web.json_response({"provider": provider_id, **status})
    except AgentProtocolError as error:
        return _error_response(error)
    except SecretStoreError as error:
        return _error_response(AgentProtocolError(error.code, str(error), 400))


async def set_provider_credential(request: web.Request) -> web.Response:
    provider_id = request.match_info["provider"]
    try:
        _require_provider(provider_id)
        _require_env_unmanaged(provider_id)
        body = await read_bounded_json_object(request, max_bytes=MAX_CREDENTIAL_BYTES + 1024)
        secret = body.get("secret")
        if not isinstance(secret, str) or not secret:
            raise AgentProtocolError("BAD_REQUEST", "secret must be a non-empty string")
        SECRET_STORE.set(request, provider_id, secret)
        status = SECRET_STORE.status(request, provider_id)
        return web.json_response({"provider": provider_id, **status})
    except AgentProtocolError as error:
        return _error_response(error)
    except SecretStoreError as error:
        return _error_response(AgentProtocolError(error.code, str(error), 400))


async def delete_provider_credential(request: web.Request) -> web.Response:
    provider_id = request.match_info["provider"]
    try:
        _require_provider(provider_id)
        _require_env_unmanaged(provider_id)
        SECRET_STORE.delete(request, provider_id)
        status = SECRET_STORE.status(request, provider_id)
        return web.json_response({"provider": provider_id, **status})
    except AgentProtocolError as error:
        return _error_response(error)
    except SecretStoreError as error:
        return _error_response(AgentProtocolError(error.code, str(error), 400))


def _config_from_body(provider_id: str, body: dict) -> ProviderConfig:
    model = body.get("model")
    if not isinstance(model, str):
        model = ""
    base_url = body.get("base_url")
    if not isinstance(base_url, str):
        base_url = ""
    timeout_seconds = body.get("timeout_seconds", 120)
    if not isinstance(timeout_seconds, int) or isinstance(timeout_seconds, bool):
        timeout_seconds = 120
    return ProviderConfig(
        provider_id=provider_id,  # type: ignore[arg-type]
        model=model,
        base_url=base_url,
        timeout_seconds=timeout_seconds,
    )


async def test_provider(request: web.Request) -> web.Response:
    provider_id = request.match_info["provider"]
    try:
        _require_provider(provider_id)
        body = await read_bounded_json_object(request, max_bytes=MAX_PROVIDER_JSON_BYTES, allow_empty=True)
        config = _config_from_body(provider_id, body)
        credential = SECRET_STORE.resolve(request, provider_id)
        provider = get_provider(provider_id)
        # A test call never sends scene data -- it only proves connectivity by
        # listing models (or, if the server doesn't support that, a cheap
        # zero-length completion would leak too much; list_models is the only
        # scene-free probe every adapter implements).
        await provider.list_models(config, credential)
        return web.json_response({"ok": True})
    except AgentProtocolError as error:
        return _error_response(error)
    except Exception as error:  # noqa: BLE001 - surfaced as a structured, safe failure
        return web.json_response({"ok": False, "error": {"code": "PROVIDER_UNREACHABLE", "message": str(error)}})


async def list_provider_models(request: web.Request) -> web.Response:
    provider_id = request.match_info["provider"]
    try:
        _require_provider(provider_id)
        body = await read_bounded_json_object(request, max_bytes=MAX_PROVIDER_JSON_BYTES, allow_empty=True)
        config = _config_from_body(provider_id, body)
        credential = SECRET_STORE.resolve(request, provider_id)
        provider = get_provider(provider_id)
        models = await provider.list_models(config, credential)
        return web.json_response({"models": models})
    except AgentProtocolError as error:
        return _error_response(error)
    except Exception as error:  # noqa: BLE001
        return _error_response(AgentProtocolError("PROVIDER_UNREACHABLE", str(error), 502))


if web is not None:
    PromptServer.instance.routes.get("/majoor/omnicam/agent/v1/providers")(list_providers)
    PromptServer.instance.routes.get("/majoor/omnicam/agent/v1/providers/{provider}/status")(provider_status)
    PromptServer.instance.routes.put("/majoor/omnicam/agent/v1/providers/{provider}/credential")(set_provider_credential)
    PromptServer.instance.routes.delete("/majoor/omnicam/agent/v1/providers/{provider}/credential")(delete_provider_credential)
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/providers/{provider}/test")(test_provider)
    PromptServer.instance.routes.post("/majoor/omnicam/agent/v1/providers/{provider}/models")(list_provider_models)
