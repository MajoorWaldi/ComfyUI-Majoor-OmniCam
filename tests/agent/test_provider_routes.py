"""Tests for the OmniCam Agent v1 provider configuration HTTP routes
(design spec section 13). Uses aiohttp's make_mocked_request the same way
tests/agent/test_routes.py does -- no live ComfyUI or real socket needed.
"""

from __future__ import annotations

import json

import pytest
from aiohttp.test_utils import make_mocked_request

from omnicam.agent import provider_routes
from omnicam.agent.providers import secret_store as store_module
from omnicam.agent.providers.registry import PROVIDERS


@pytest.fixture(autouse=True)
def _isolated_store(tmp_path, monkeypatch):
    root = tmp_path / "__omnicam" / "agent" / "secrets"
    root.mkdir(parents=True)
    monkeypatch.setattr(store_module, "_store_root", lambda: root)
    monkeypatch.setattr(store_module, "_request_user_id", lambda request: "user_a")
    monkeypatch.delenv("OMNICAM_OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("OMNICAM_ANTHROPIC_API_KEY", raising=False)
    yield root


def _json_request(method, path, body, *, match_info=None):
    from unittest.mock import Mock

    from aiohttp.streams import StreamReader

    payload = json.dumps(body).encode("utf-8")
    stream = StreamReader(Mock(), limit=2**20, loop=None)
    stream.feed_data(payload)
    stream.feed_eof()
    request = make_mocked_request(method, path, payload=stream)
    if match_info:
        request.match_info.update(match_info)
    return request


def _plain_request(method, path, *, match_info=None):
    request = make_mocked_request(method, path)
    if match_info:
        request.match_info.update(match_info)
    return request


@pytest.mark.asyncio
async def test_list_providers_never_includes_a_credential():
    response = await provider_routes.list_providers(_plain_request("GET", "/majoor/omnicam/agent/v1/providers"))
    body = json.loads(response.body)
    assert len(body["providers"]) == 4
    for provider in body["providers"]:
        assert "credential" not in provider


@pytest.mark.asyncio
async def test_status_for_an_unknown_provider_is_404():
    request = _plain_request(
        "GET", "/majoor/omnicam/agent/v1/providers/nope/status", match_info={"provider": "nope"}
    )
    response = await provider_routes.provider_status(request)
    assert response.status == 404
    assert json.loads(response.body)["error"]["code"] == "UNKNOWN_PROVIDER"


@pytest.mark.asyncio
async def test_status_reports_not_configured_then_configured():
    status_request = _plain_request(
        "GET", "/majoor/omnicam/agent/v1/providers/anthropic/status", match_info={"provider": "anthropic"}
    )
    before = json.loads((await provider_routes.provider_status(status_request)).body)
    assert before == {"provider": "anthropic", "configured": False, "source": "none"}

    put_request = _json_request(
        "PUT", "/majoor/omnicam/agent/v1/providers/anthropic/credential",
        {"secret": "sk-ant-123"}, match_info={"provider": "anthropic"},
    )
    put_response = await provider_routes.set_provider_credential(put_request)
    assert put_response.status == 200
    put_body = json.loads(put_response.body)
    assert put_body == {"provider": "anthropic", "configured": True, "source": "local_store"}
    assert "secret" not in put_body
    assert "sk-ant-123" not in put_response.body.decode("utf-8")


@pytest.mark.asyncio
async def test_credential_write_never_echoes_the_secret_back():
    put_request = _json_request(
        "PUT", "/majoor/omnicam/agent/v1/providers/openai/credential",
        {"secret": "sk-super-secret"}, match_info={"provider": "openai"},
    )
    response = await provider_routes.set_provider_credential(put_request)
    assert "sk-super-secret" not in response.body.decode("utf-8")


@pytest.mark.asyncio
async def test_delete_credential_resets_status():
    put_request = _json_request(
        "PUT", "/majoor/omnicam/agent/v1/providers/openai/credential",
        {"secret": "sk-1"}, match_info={"provider": "openai"},
    )
    await provider_routes.set_provider_credential(put_request)

    delete_request = _plain_request(
        "DELETE", "/majoor/omnicam/agent/v1/providers/openai/credential", match_info={"provider": "openai"}
    )
    response = await provider_routes.delete_provider_credential(delete_request)
    body = json.loads(response.body)
    assert body == {"provider": "openai", "configured": False, "source": "none"}


@pytest.mark.asyncio
async def test_env_managed_credential_cannot_be_written_or_deleted(monkeypatch):
    monkeypatch.setenv("OMNICAM_OPENAI_API_KEY", "env-secret")

    put_request = _json_request(
        "PUT", "/majoor/omnicam/agent/v1/providers/openai/credential",
        {"secret": "sk-1"}, match_info={"provider": "openai"},
    )
    put_response = await provider_routes.set_provider_credential(put_request)
    assert put_response.status == 409
    assert json.loads(put_response.body)["error"]["code"] == "CREDENTIAL_MANAGED_BY_ENV"

    delete_request = _plain_request(
        "DELETE", "/majoor/omnicam/agent/v1/providers/openai/credential", match_info={"provider": "openai"}
    )
    delete_response = await provider_routes.delete_provider_credential(delete_request)
    assert delete_response.status == 409
    assert json.loads(delete_response.body)["error"]["code"] == "CREDENTIAL_MANAGED_BY_ENV"


@pytest.mark.asyncio
async def test_provider_test_route_never_receives_scene_data(monkeypatch):
    calls = []

    class _FakeProvider:
        async def list_models(self, config, credential):
            calls.append((config, credential))
            return ["model-a"]

    monkeypatch.setitem(PROVIDERS, "ollama", _FakeProvider())

    request = _json_request(
        "POST", "/majoor/omnicam/agent/v1/providers/ollama/test",
        {"model": "qwen3", "base_url": "http://127.0.0.1:11434"},
        match_info={"provider": "ollama"},
    )
    response = await provider_routes.test_provider(request)
    assert response.status == 200
    assert json.loads(response.body) == {"ok": True}
    assert len(calls) == 1
    config, _credential = calls[0]
    assert config.model == "qwen3"
    # No scene/state keys ever reach the provider config.
    assert not hasattr(config, "scene")
    assert not hasattr(config, "state")


@pytest.mark.asyncio
async def test_provider_test_route_reports_failure_without_raising(monkeypatch):
    class _FailingProvider:
        async def list_models(self, config, credential):
            raise RuntimeError("connection refused")

    monkeypatch.setitem(PROVIDERS, "ollama", _FailingProvider())

    request = _json_request(
        "POST", "/majoor/omnicam/agent/v1/providers/ollama/test", {}, match_info={"provider": "ollama"}
    )
    response = await provider_routes.test_provider(request)
    body = json.loads(response.body)
    assert body["ok"] is False
    assert body["error"]["code"] == "PROVIDER_UNREACHABLE"


@pytest.mark.asyncio
async def test_list_models_route_returns_models(monkeypatch):
    class _FakeProvider:
        async def list_models(self, config, credential):
            return ["a", "b"]

    monkeypatch.setitem(PROVIDERS, "ollama", _FakeProvider())

    request = _json_request(
        "POST", "/majoor/omnicam/agent/v1/providers/ollama/models", {}, match_info={"provider": "ollama"}
    )
    response = await provider_routes.list_provider_models(request)
    assert json.loads(response.body) == {"models": ["a", "b"]}
