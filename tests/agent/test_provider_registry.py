"""Tests for the Provider Registry and each adapter's wire translation
(design spec sections 3, 10, 11). Every adapter's HTTP call is monkeypatched
at the network guard so no real socket is ever opened."""

from __future__ import annotations

import json

import pytest

from omnicam.agent.providers.models import ProviderConfig
from omnicam.agent.providers.network import GuardedResponse, NetworkPolicyError
from omnicam.agent.providers.registry import PROVIDERS, get_provider, provider_capabilities


def test_provider_capabilities_never_include_a_credential():
    for capability in provider_capabilities():
        assert "credential" not in capability
        assert "api_key" not in capability
        assert {"id", "label", "requires_credential", "supports_model_discovery", "default_base_url"} <= capability.keys()


def test_ollama_is_the_only_provider_that_never_requires_a_credential():
    capabilities = {c["id"]: c for c in provider_capabilities()}
    assert capabilities["ollama"]["requires_credential"] is False
    assert capabilities["openai_compatible"]["requires_credential"] is False
    assert capabilities["openai"]["requires_credential"] is True
    assert capabilities["anthropic"]["requires_credential"] is True


def test_get_provider_rejects_an_unknown_id():
    with pytest.raises(KeyError):
        get_provider("not-a-real-provider")


def _config(provider_id, base_url=""):
    return ProviderConfig(provider_id=provider_id, model="test-model", base_url=base_url)


def _patch_guarded_request(monkeypatch, module, status, body: bytes, *, calls: list | None = None):
    async def fake(*args, **kwargs):
        if calls is not None:
            calls.append(kwargs)
        return GuardedResponse(status=status, body=body)

    monkeypatch.setattr(module, "guarded_request", fake)


@pytest.mark.asyncio
async def test_openai_complete_extracts_output_text(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai as openai_module

    body = json.dumps({
        "model": "gpt-test",
        "output_text": "hello from openai",
        "usage": {"input_tokens": 3, "output_tokens": 5},
    }).encode("utf-8")
    _patch_guarded_request(monkeypatch, openai_module, 200, body)

    result = await get_provider("openai").complete("hi", _config("openai"), "sk-x")
    assert result.text == "hello from openai"
    assert result.model == "gpt-test"
    assert result.usage == {"input_tokens": 3, "output_tokens": 5}


@pytest.mark.asyncio
async def test_openai_list_models(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai as openai_module

    body = json.dumps({"data": [{"id": "gpt-4o"}, {"id": "gpt-4o-mini"}]}).encode("utf-8")
    _patch_guarded_request(monkeypatch, openai_module, 200, body)

    models = await get_provider("openai").list_models(_config("openai"), "sk-x")
    assert models == ["gpt-4o", "gpt-4o-mini"]


@pytest.mark.asyncio
async def test_anthropic_complete_extracts_text_blocks(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import anthropic as anthropic_module

    body = json.dumps({
        "model": "claude-test",
        "content": [{"type": "text", "text": "hello "}, {"type": "text", "text": "from anthropic"}],
        "usage": {"input_tokens": 2, "output_tokens": 4},
    }).encode("utf-8")
    _patch_guarded_request(monkeypatch, anthropic_module, 200, body)

    result = await get_provider("anthropic").complete("hi", _config("anthropic"), "sk-ant")
    assert result.text == "hello from anthropic"
    assert result.usage == {"input_tokens": 2, "output_tokens": 4}


@pytest.mark.asyncio
async def test_openai_official_base_url_is_never_flagged_custom(monkeypatch):
    # Regression: native adapters used to hardcode is_custom_endpoint=False
    # unconditionally, which happened to be correct here but for the wrong
    # reason -- assert it explicitly for the empty/default base_url case.
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai as openai_module

    calls: list = []
    _patch_guarded_request(monkeypatch, openai_module, 200, b'{"output_text":"hi"}', calls=calls)
    await get_provider("openai").complete("hi", _config("openai", base_url=""), "sk-x")
    assert calls[0]["is_custom_endpoint"] is False


@pytest.mark.asyncio
async def test_openai_custom_base_url_is_flagged_custom_for_complete_and_list_models(monkeypatch):
    # A user-supplied base_url (e.g. a self-hosted proxy) must be subjected
    # to the custom-endpoint network policy, not silently treated as the
    # official OpenAI endpoint (design spec section 12 / Task 1).
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai as openai_module

    calls: list = []
    config = _config("openai", base_url="https://my-openai-proxy.example.com/v1")
    _patch_guarded_request(monkeypatch, openai_module, 200, b'{"output_text":"hi"}', calls=calls)
    await get_provider("openai").complete("hi", config, "sk-x")
    assert calls[0]["is_custom_endpoint"] is True

    calls.clear()
    _patch_guarded_request(monkeypatch, openai_module, 200, b'{"data":[]}', calls=calls)
    await get_provider("openai").list_models(config, "sk-x")
    assert calls[0]["is_custom_endpoint"] is True


@pytest.mark.asyncio
async def test_openai_remote_custom_endpoint_makes_zero_http_calls_without_opt_in(monkeypatch):
    # End-to-end through the *real* guarded_request/validate_provider_url --
    # a blocked remote custom endpoint must never reach session.request().
    pytest.importorskip("aiohttp")
    monkeypatch.delenv("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS", raising=False)
    import aiohttp

    from omnicam.agent.providers.network import NetworkPolicyError

    class _NeverCalledSession:
        def __init__(self, *a, **kw):
            self.calls = []

        async def __aenter__(self):
            return self

        async def __aexit__(self, *exc):
            return False

        def request(self, *a, **kw):
            self.calls.append((a, kw))
            raise AssertionError("session.request() must never be called for a blocked endpoint")

    monkeypatch.setattr(aiohttp, "ClientSession", _NeverCalledSession)

    config = _config("openai", base_url="https://my-openai-proxy.example.com/v1")
    with pytest.raises(NetworkPolicyError) as excinfo:
        await get_provider("openai").complete("hi", config, "sk-x")
    assert excinfo.value.code == "REMOTE_CUSTOM_PROVIDER_BLOCKED"


@pytest.mark.asyncio
async def test_anthropic_custom_base_url_is_flagged_custom(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import anthropic as anthropic_module

    calls: list = []
    config = _config("anthropic", base_url="https://claude-proxy.example.com")
    _patch_guarded_request(monkeypatch, anthropic_module, 200, b'{"content":[]}', calls=calls)
    await get_provider("anthropic").complete("hi", config, "sk-ant")
    assert calls[0]["is_custom_endpoint"] is True

    calls.clear()
    _patch_guarded_request(monkeypatch, anthropic_module, 200, b'{"data":[]}', calls=calls)
    await get_provider("anthropic").list_models(config, "sk-ant")
    assert calls[0]["is_custom_endpoint"] is True


@pytest.mark.asyncio
async def test_anthropic_official_base_url_is_never_flagged_custom(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import anthropic as anthropic_module

    calls: list = []
    _patch_guarded_request(monkeypatch, anthropic_module, 200, b'{"content":[]}', calls=calls)
    await get_provider("anthropic").complete("hi", _config("anthropic", base_url=""), "sk-ant")
    assert calls[0]["is_custom_endpoint"] is False


@pytest.mark.asyncio
async def test_ollama_complete_reads_message_content(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import ollama as ollama_module

    body = json.dumps({
        "model": "qwen3",
        "message": {"role": "assistant", "content": "hello from ollama"},
        "prompt_eval_count": 7,
        "eval_count": 9,
    }).encode("utf-8")
    _patch_guarded_request(monkeypatch, ollama_module, 200, body)

    result = await get_provider("ollama").complete("hi", _config("ollama"), None)
    assert result.text == "hello from ollama"
    assert result.usage == {"input_tokens": 7, "output_tokens": 9}


@pytest.mark.asyncio
async def test_ollama_complete_forces_json_output(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import ollama as ollama_module

    captured = {}

    async def fake_guarded_request(session, method, url, *, json_body=None, **kwargs):
        captured.update(json_body or {})
        body = json.dumps({"model": "qwen3", "message": {"role": "assistant", "content": "{}"}}).encode("utf-8")
        return GuardedResponse(status=200, body=body)

    monkeypatch.setattr(ollama_module, "guarded_request", fake_guarded_request)

    await get_provider("ollama").complete("hi", _config("ollama"), None)
    # format="json" keeps the model's output syntactically parseable even
    # when it ignores the system prompt's "no markdown fences" instruction.
    assert captured["format"] == "json"
    assert captured["stream"] is False


@pytest.mark.asyncio
async def test_ollama_list_models_reads_tags(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import ollama as ollama_module

    body = json.dumps({"models": [{"name": "qwen3:latest"}, {"name": "llama3:8b"}]}).encode("utf-8")
    _patch_guarded_request(monkeypatch, ollama_module, 200, body)

    models = await get_provider("ollama").list_models(_config("ollama"), None)
    assert models == ["qwen3:latest", "llama3:8b"]


@pytest.mark.asyncio
async def test_openai_compatible_complete_reads_chat_completion_choice(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai_compat as compat_module

    body = json.dumps({
        "model": "local-model",
        "choices": [{"message": {"content": "hello from lm studio"}}],
        "usage": {"prompt_tokens": 1, "completion_tokens": 2},
    }).encode("utf-8")
    _patch_guarded_request(monkeypatch, compat_module, 200, body)

    result = await get_provider("openai_compatible").complete(
        "hi", _config("openai_compatible", "http://127.0.0.1:1234/v1"), None
    )
    assert result.text == "hello from lm studio"
    assert result.usage == {"input_tokens": 1, "output_tokens": 2}


@pytest.mark.asyncio
async def test_openai_compatible_list_models_degrades_to_empty_on_404(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai_compat as compat_module

    _patch_guarded_request(monkeypatch, compat_module, 404, b"not found")

    models = await get_provider("openai_compatible").list_models(
        _config("openai_compatible", "http://127.0.0.1:1234/v1"), None
    )
    assert models == []


@pytest.mark.asyncio
async def test_ollama_probe_succeeds_on_2xx(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import ollama as ollama_module

    _patch_guarded_request(monkeypatch, ollama_module, 200, json.dumps({"models": []}).encode("utf-8"))
    await get_provider("ollama").probe(_config("ollama"), None)  # must not raise


@pytest.mark.asyncio
async def test_ollama_probe_raises_on_error_status(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import ollama as ollama_module

    _patch_guarded_request(monkeypatch, ollama_module, 500, b"boom")
    with pytest.raises(NetworkPolicyError):
        await get_provider("ollama").probe(_config("ollama"), None)


@pytest.mark.asyncio
async def test_openai_probe_succeeds_on_2xx(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai as openai_module

    _patch_guarded_request(monkeypatch, openai_module, 200, json.dumps({"data": []}).encode("utf-8"))
    await get_provider("openai").probe(_config("openai"), "sk-x")  # must not raise


@pytest.mark.asyncio
async def test_openai_probe_raises_on_bad_credential(monkeypatch):
    # Reachable server, invalid credential: a real config/credential error,
    # never a silent ok:true.
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai as openai_module

    _patch_guarded_request(monkeypatch, openai_module, 401, b'{"error":"invalid_api_key"}')
    with pytest.raises(NetworkPolicyError):
        await get_provider("openai").probe(_config("openai"), "sk-bad")


@pytest.mark.asyncio
async def test_openai_probe_uses_custom_endpoint_policy(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai as openai_module

    calls: list = []
    _patch_guarded_request(monkeypatch, openai_module, 200, b'{"data":[]}', calls=calls)
    config = _config("openai", "https://my-openai-proxy.example.com/v1")
    await get_provider("openai").probe(config, "sk-x")
    assert calls[0]["is_custom_endpoint"] is True


@pytest.mark.asyncio
async def test_anthropic_probe_succeeds_on_2xx(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import anthropic as anthropic_module

    _patch_guarded_request(monkeypatch, anthropic_module, 200, json.dumps({"data": []}).encode("utf-8"))
    await get_provider("anthropic").probe(_config("anthropic"), "sk-ant")  # must not raise


@pytest.mark.asyncio
async def test_anthropic_probe_raises_on_bad_credential(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import anthropic as anthropic_module

    _patch_guarded_request(monkeypatch, anthropic_module, 401, b'{"error":"authentication_error"}')
    with pytest.raises(NetworkPolicyError):
        await get_provider("anthropic").probe(_config("anthropic"), "sk-bad")


@pytest.mark.asyncio
async def test_openai_compatible_probe_succeeds_when_discovery_unsupported(monkeypatch):
    # A compatible server that doesn't implement /models at all is still a
    # genuinely reachable server -- Test must report ok:true for it.
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai_compat as compat_module

    _patch_guarded_request(monkeypatch, compat_module, 404, b"not found")
    await get_provider("openai_compatible").probe(
        _config("openai_compatible", "http://127.0.0.1:1234/v1"), None
    )  # must not raise

    _patch_guarded_request(monkeypatch, compat_module, 405, b"method not allowed")
    await get_provider("openai_compatible").probe(
        _config("openai_compatible", "http://127.0.0.1:1234/v1"), None
    )  # must not raise


@pytest.mark.asyncio
async def test_openai_compatible_probe_raises_on_network_policy_error(monkeypatch):
    # This is the exact "dead LM Studio endpoint" case: unlike list_models(),
    # probe() must never swallow a genuine connectivity/policy failure.
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai_compat as compat_module

    async def fake_guarded_request(*args, **kwargs):
        raise NetworkPolicyError("REMOTE_CUSTOM_PROVIDER_BLOCKED", "blocked")

    monkeypatch.setattr(compat_module, "guarded_request", fake_guarded_request)
    with pytest.raises(NetworkPolicyError):
        await get_provider("openai_compatible").probe(
            _config("openai_compatible", "http://10.0.0.5:1234/v1"), None
        )


@pytest.mark.asyncio
async def test_openai_compatible_probe_raises_on_other_error_status(monkeypatch):
    pytest.importorskip("aiohttp")
    from omnicam.agent.providers import openai_compat as compat_module

    _patch_guarded_request(monkeypatch, compat_module, 500, b"internal error")
    with pytest.raises(NetworkPolicyError):
        await get_provider("openai_compatible").probe(
            _config("openai_compatible", "http://127.0.0.1:1234/v1"), None
        )


def test_every_provider_id_is_registered():
    assert set(PROVIDERS.keys()) == {"openai", "openai_compatible", "anthropic", "ollama"}
