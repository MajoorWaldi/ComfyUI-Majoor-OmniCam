"""Tests for the Agent provider network policy (design spec section 12)."""

from __future__ import annotations

import pytest

from omnicam.agent.providers.network import (
    MAX_RESPONSE_BYTES,
    NetworkPolicyError,
    guarded_request,
    validate_provider_url,
)


def test_official_openai_endpoint_is_accepted():
    assert validate_provider_url("https://api.openai.com/v1/responses", is_custom_endpoint=False)


def test_official_anthropic_endpoint_is_accepted():
    assert validate_provider_url("https://api.anthropic.com/v1/messages", is_custom_endpoint=False)


def test_ollama_loopback_is_accepted():
    assert validate_provider_url("http://127.0.0.1:11434/api/chat", is_custom_endpoint=True)
    assert validate_provider_url("http://localhost:11434/api/chat", is_custom_endpoint=True)


def test_openai_compatible_loopback_is_accepted():
    assert validate_provider_url("http://127.0.0.1:1234/v1/chat/completions", is_custom_endpoint=True)


def test_file_scheme_is_rejected():
    with pytest.raises(NetworkPolicyError) as excinfo:
        validate_provider_url("file:///etc/passwd", is_custom_endpoint=False)
    assert excinfo.value.code == "BAD_SCHEME"


def test_ftp_scheme_is_rejected():
    with pytest.raises(NetworkPolicyError) as excinfo:
        validate_provider_url("ftp://example.com/x", is_custom_endpoint=False)
    assert excinfo.value.code == "BAD_SCHEME"


def test_embedded_url_credentials_are_rejected():
    with pytest.raises(NetworkPolicyError) as excinfo:
        validate_provider_url("http://user:pass@127.0.0.1:11434/api/chat", is_custom_endpoint=True)
    assert excinfo.value.code == "BAD_URL"


def test_remote_custom_provider_is_blocked_by_default(monkeypatch):
    monkeypatch.delenv("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS", raising=False)
    with pytest.raises(NetworkPolicyError) as excinfo:
        validate_provider_url("http://192.168.1.50:1234/v1/chat/completions", is_custom_endpoint=True)
    assert excinfo.value.code == "REMOTE_CUSTOM_PROVIDER_BLOCKED"


def test_remote_custom_provider_allowed_by_server_policy(monkeypatch):
    monkeypatch.setenv("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS", "1")
    assert validate_provider_url("http://192.168.1.50:1234/v1/chat/completions", is_custom_endpoint=True)


def test_a_hardcoded_official_endpoint_is_never_gated_as_custom():
    # openai/anthropic's own hardcoded endpoints are not "custom" even though
    # they are remote -- only a caller-supplied base_url is gated.
    assert validate_provider_url("https://api.openai.com/v1/models", is_custom_endpoint=False)


class _FakeContentStream:
    def __init__(self, chunks: list[bytes]):
        self._chunks = chunks

    async def iter_chunked(self, size):
        for chunk in self._chunks:
            yield chunk


class _FakeResponse:
    def __init__(self, status, chunks, content_length=None):
        self.status = status
        self.content = _FakeContentStream(chunks)
        self.content_length = content_length

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False


class _FakeSession:
    def __init__(self, response):
        self._response = response
        self.calls = []

    def request(self, method, url, **kwargs):
        self.calls.append((method, url, kwargs))
        return self._response


@pytest.mark.asyncio
async def test_guarded_request_returns_body_and_status():
    # guarded_request() builds a real aiohttp.ClientTimeout even against a
    # fake session -- aiohttp ships with ComfyUI but is not a declared dev
    # dependency of this repo, so skip where it was never installed.
    pytest.importorskip("aiohttp")
    session = _FakeSession(_FakeResponse(200, [b'{"ok":true}']))
    result = await guarded_request(
        session, "POST", "http://127.0.0.1:11434/api/chat", is_custom_endpoint=True
    )
    assert result.status == 200
    assert result.body == b'{"ok":true}'
    assert session.calls[0][2]["allow_redirects"] is False


@pytest.mark.asyncio
async def test_guarded_request_rejects_a_redirect():
    pytest.importorskip("aiohttp")
    session = _FakeSession(_FakeResponse(302, []))
    with pytest.raises(NetworkPolicyError) as excinfo:
        await guarded_request(session, "GET", "http://127.0.0.1:11434/api/tags", is_custom_endpoint=True)
    assert excinfo.value.code == "REDIRECT_BLOCKED"


@pytest.mark.asyncio
async def test_guarded_request_rejects_an_oversized_response():
    pytest.importorskip("aiohttp")
    session = _FakeSession(_FakeResponse(200, [b"x" * (MAX_RESPONSE_BYTES + 1)]))
    with pytest.raises(NetworkPolicyError) as excinfo:
        await guarded_request(session, "GET", "http://127.0.0.1:11434/api/tags", is_custom_endpoint=True)
    assert excinfo.value.code == "RESPONSE_TOO_LARGE"


@pytest.mark.asyncio
async def test_guarded_request_rejects_an_oversized_content_length_header():
    pytest.importorskip("aiohttp")
    session = _FakeSession(_FakeResponse(200, [], content_length=MAX_RESPONSE_BYTES + 1))
    with pytest.raises(NetworkPolicyError) as excinfo:
        await guarded_request(session, "GET", "http://127.0.0.1:11434/api/tags", is_custom_endpoint=True)
    assert excinfo.value.code == "RESPONSE_TOO_LARGE"
