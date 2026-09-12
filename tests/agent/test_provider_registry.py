"""Tests for the Provider Registry and each adapter's wire translation
(design spec sections 3, 10, 11). Every adapter's HTTP call is monkeypatched
at the network guard so no real socket is ever opened."""

from __future__ import annotations

import json

import pytest

from omnicam.agent.providers.models import ProviderConfig
from omnicam.agent.providers.network import GuardedResponse
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


def _patch_guarded_request(monkeypatch, module, status, body: bytes):
    async def fake(*args, **kwargs):
        return GuardedResponse(status=status, body=body)

    monkeypatch.setattr(module, "guarded_request", fake)


@pytest.mark.asyncio
async def test_openai_complete_extracts_output_text(monkeypatch):
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
    from omnicam.agent.providers import openai as openai_module

    body = json.dumps({"data": [{"id": "gpt-4o"}, {"id": "gpt-4o-mini"}]}).encode("utf-8")
    _patch_guarded_request(monkeypatch, openai_module, 200, body)

    models = await get_provider("openai").list_models(_config("openai"), "sk-x")
    assert models == ["gpt-4o", "gpt-4o-mini"]


@pytest.mark.asyncio
async def test_anthropic_complete_extracts_text_blocks(monkeypatch):
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
async def test_ollama_complete_reads_message_content(monkeypatch):
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
async def test_ollama_list_models_reads_tags(monkeypatch):
    from omnicam.agent.providers import ollama as ollama_module

    body = json.dumps({"models": [{"name": "qwen3:latest"}, {"name": "llama3:8b"}]}).encode("utf-8")
    _patch_guarded_request(monkeypatch, ollama_module, 200, body)

    models = await get_provider("ollama").list_models(_config("ollama"), None)
    assert models == ["qwen3:latest", "llama3:8b"]


@pytest.mark.asyncio
async def test_openai_compatible_complete_reads_chat_completion_choice(monkeypatch):
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
    from omnicam.agent.providers import openai_compat as compat_module

    _patch_guarded_request(monkeypatch, compat_module, 404, b"not found")

    models = await get_provider("openai_compatible").list_models(
        _config("openai_compatible", "http://127.0.0.1:1234/v1"), None
    )
    assert models == []


def test_every_provider_id_is_registered():
    assert set(PROVIDERS.keys()) == {"openai", "openai_compatible", "anthropic", "ollama"}
