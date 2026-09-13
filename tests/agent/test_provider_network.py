"""Tests for the Agent provider network policy (design spec section 12)."""

from __future__ import annotations

import pytest

from omnicam.agent.providers.network import (
    MAX_RESPONSE_BYTES,
    NetworkPolicyError,
    _PinnedResolver,
    endpoint_is_custom,
    guarded_client_session,
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


def test_ipv4_link_local_metadata_target_is_blocked_even_with_opt_in(monkeypatch):
    # 169.254.169.254 is the cloud-metadata IP on AWS/GCP/Azure -- never a
    # legitimate Agent provider target, and must stay blocked regardless of
    # OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS (design spec Task 10).
    monkeypatch.setenv("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS", "1")
    with pytest.raises(NetworkPolicyError) as excinfo:
        validate_provider_url("http://169.254.169.254/latest/meta-data/", is_custom_endpoint=True)
    assert excinfo.value.code == "SENSITIVE_TARGET_BLOCKED"


def test_ipv4_link_local_range_is_blocked_even_with_opt_in(monkeypatch):
    monkeypatch.setenv("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS", "1")
    with pytest.raises(NetworkPolicyError) as excinfo:
        validate_provider_url("http://169.254.1.1:1234/v1", is_custom_endpoint=True)
    assert excinfo.value.code == "SENSITIVE_TARGET_BLOCKED"


def test_ipv6_link_local_is_blocked_even_with_opt_in(monkeypatch):
    monkeypatch.setenv("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS", "1")
    with pytest.raises(NetworkPolicyError) as excinfo:
        validate_provider_url("http://[fe80::1]:1234/v1", is_custom_endpoint=True)
    assert excinfo.value.code == "SENSITIVE_TARGET_BLOCKED"


def test_unspecified_address_is_blocked_even_with_opt_in(monkeypatch):
    monkeypatch.setenv("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS", "1")
    with pytest.raises(NetworkPolicyError) as excinfo:
        validate_provider_url("http://[::]:1234/v1", is_custom_endpoint=True)
    assert excinfo.value.code == "SENSITIVE_TARGET_BLOCKED"


def test_multicast_address_is_blocked_even_with_opt_in(monkeypatch):
    monkeypatch.setenv("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS", "1")
    with pytest.raises(NetworkPolicyError) as excinfo:
        validate_provider_url("http://224.0.0.1:1234/v1", is_custom_endpoint=True)
    assert excinfo.value.code == "SENSITIVE_TARGET_BLOCKED"


def test_rfc1918_lan_target_is_still_allowed_with_opt_in():
    # Sensitive-address blocking must not swallow the existing, intentional
    # RFC1918 allowance once the operator opts in to remote custom providers.
    import os

    old = os.environ.get("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS")
    os.environ["OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS"] = "1"
    try:
        assert validate_provider_url("http://10.0.0.5:1234/v1", is_custom_endpoint=True)
        assert validate_provider_url("http://192.168.1.50:1234/v1", is_custom_endpoint=True)
    finally:
        if old is None:
            os.environ.pop("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS", None)
        else:
            os.environ["OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS"] = old


def test_loopback_is_still_allowed_alongside_sensitive_address_blocking():
    assert validate_provider_url("http://127.0.0.1:11434/api/chat", is_custom_endpoint=True)


def test_a_hardcoded_official_endpoint_is_never_gated_as_custom():
    # openai/anthropic's own hardcoded endpoints are not "custom" even though
    # they are remote -- only a caller-supplied base_url is gated.
    assert validate_provider_url("https://api.openai.com/v1/models", is_custom_endpoint=False)


def test_endpoint_is_custom_empty_means_official():
    assert endpoint_is_custom("", "https://api.openai.com/v1") is False
    assert endpoint_is_custom(None, "https://api.openai.com/v1") is False
    assert endpoint_is_custom("   ", "https://api.openai.com/v1") is False


def test_endpoint_is_custom_explicit_official_url_is_not_custom():
    assert endpoint_is_custom("https://api.openai.com/v1", "https://api.openai.com/v1") is False
    # trailing slash / case differences must not falsely flag it as custom.
    assert endpoint_is_custom("https://API.OpenAI.com/v1/", "https://api.openai.com/v1") is False


def test_endpoint_is_custom_different_openai_host_is_custom():
    assert endpoint_is_custom("http://127.0.0.1:1234/v1", "https://api.openai.com/v1") is True
    assert endpoint_is_custom("https://my-openai-proxy.example.com/v1", "https://api.openai.com/v1") is True


def test_endpoint_is_custom_different_anthropic_host_is_custom():
    assert endpoint_is_custom("http://127.0.0.1:1234", "https://api.anthropic.com") is True
    assert endpoint_is_custom("https://claude-proxy.example.com", "https://api.anthropic.com") is True


def test_endpoint_is_custom_ignores_query_string_and_fragment():
    # A query string/fragment must never turn an otherwise-official URL into
    # a false "custom" classification, nor mask a genuinely different host.
    assert endpoint_is_custom("https://api.openai.com/v1?foo=bar", "https://api.openai.com/v1") is False


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


class _FakeInnerResolver:
    def __init__(self, results):
        self._results = results

    async def resolve(self, host, port=0, family=0):
        return self._results

    async def close(self):
        pass


@pytest.mark.asyncio
async def test_pinned_resolver_blocks_a_hostname_that_resolves_to_a_sensitive_address():
    # DNS rebinding: validate_provider_url() only ever sees the literal
    # hostname, never what it resolves to -- this is the layer that closes
    # that gap, at the exact moment aiohttp would otherwise connect.
    pytest.importorskip("aiohttp")
    resolver = _PinnedResolver()
    resolver._inner = _FakeInnerResolver([{"hostname": "rebind.example.test", "host": "169.254.169.254", "port": 80}])
    with pytest.raises(NetworkPolicyError) as excinfo:
        await resolver.resolve("rebind.example.test", 80)
    assert excinfo.value.code == "SENSITIVE_TARGET_BLOCKED"


@pytest.mark.asyncio
async def test_pinned_resolver_passes_through_a_safe_address():
    pytest.importorskip("aiohttp")
    resolver = _PinnedResolver()
    resolver._inner = _FakeInnerResolver([{"hostname": "api.example.test", "host": "93.184.216.34", "port": 443}])
    results = await resolver.resolve("api.example.test", 443)
    assert results[0]["host"] == "93.184.216.34"


@pytest.mark.asyncio
async def test_guarded_client_session_uses_a_pinned_resolver():
    pytest.importorskip("aiohttp")
    async with guarded_client_session() as session:
        assert isinstance(session.connector._resolver, _PinnedResolver)


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
