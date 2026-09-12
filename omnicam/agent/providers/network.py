"""SSRF-hardened HTTP guard shared by every provider adapter (design spec
section 12): URL scheme/shape policy, a remote-custom-host allowlist gate,
no redirects, and bounded response reading. Every adapter's HTTP call must
go through ``guarded_request`` rather than calling aiohttp directly.
"""

from __future__ import annotations

import ipaddress
import os
from dataclasses import dataclass
from urllib.parse import urlsplit

ALLOWED_SCHEMES = {"http", "https"}
CONNECT_TIMEOUT_SECONDS = 10.0
MAX_TOTAL_TIMEOUT_SECONDS = 300.0
MAX_RESPONSE_BYTES = 2 * 1024 * 1024

LOCAL_HOSTS = {"127.0.0.1", "localhost", "::1", "0.0.0.0"}  # noqa: S104 - loopback allowlist, not a bind address


class NetworkPolicyError(Exception):
    def __init__(self, code: str, message: str | None = None) -> None:
        super().__init__(message or code)
        self.code = code


def _is_loopback_host(host: str) -> bool:
    if host.lower() in LOCAL_HOSTS:
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def allow_remote_custom_providers() -> bool:
    return os.environ.get("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS") == "1"


def validate_provider_url(url: str, *, is_custom_endpoint: bool) -> str:
    """Validate ``url`` against the Agent provider network policy and return
    it unchanged. Raises NetworkPolicyError otherwise.

    ``is_custom_endpoint`` marks a caller-supplied base URL (openai_compatible,
    or an overridden base_url for any provider) as opposed to a provider's own
    hardcoded official endpoint -- only custom endpoints are subject to the
    remote-host gate.
    """
    try:
        parts = urlsplit(url)
    except ValueError as error:
        raise NetworkPolicyError("BAD_URL", f"Could not parse URL: {error}") from error

    if parts.scheme not in ALLOWED_SCHEMES:
        raise NetworkPolicyError("BAD_SCHEME", f"Unsupported URL scheme: {parts.scheme!r}")

    if parts.username or parts.password:
        raise NetworkPolicyError("BAD_URL", "URL must not carry embedded credentials")

    if parts.fragment:
        raise NetworkPolicyError("BAD_URL", "URL must not carry a fragment")

    host = parts.hostname
    if not host:
        raise NetworkPolicyError("BAD_URL", "URL is missing a host")

    if is_custom_endpoint and not _is_loopback_host(host) and not allow_remote_custom_providers():
        raise NetworkPolicyError(
            "REMOTE_CUSTOM_PROVIDER_BLOCKED",
            "Remote custom provider endpoints are disabled; set "
            "OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS=1 to allow them",
        )

    return url


def clamp_timeout_seconds(requested: int) -> float:
    return max(1.0, min(float(requested), MAX_TOTAL_TIMEOUT_SECONDS))


@dataclass(frozen=True, slots=True)
class GuardedResponse:
    status: int
    body: bytes


async def guarded_request(
    session,
    method: str,
    url: str,
    *,
    is_custom_endpoint: bool,
    headers: dict[str, str] | None = None,
    json_body: object | None = None,
    timeout_seconds: int = 120,
) -> GuardedResponse:
    """Issue one HTTP request through aiohttp with the Agent network policy
    applied: validated URL/host, no redirects, connect/total timeouts, and a
    hard cap on how much response body is ever read into memory."""
    import aiohttp

    validate_provider_url(url, is_custom_endpoint=is_custom_endpoint)

    timeout = aiohttp.ClientTimeout(
        total=clamp_timeout_seconds(timeout_seconds),
        connect=CONNECT_TIMEOUT_SECONDS,
    )

    async with session.request(
        method,
        url,
        headers=headers,
        json=json_body,
        timeout=timeout,
        allow_redirects=False,
    ) as response:
        if 300 <= response.status < 400:
            raise NetworkPolicyError("REDIRECT_BLOCKED", "Provider responded with a redirect")

        content_length = response.content_length
        if content_length is not None and content_length > MAX_RESPONSE_BYTES:
            raise NetworkPolicyError("RESPONSE_TOO_LARGE", "Provider response exceeds the size limit")

        body = bytearray()
        async for chunk in response.content.iter_chunked(64 * 1024):
            body.extend(chunk)
            if len(body) > MAX_RESPONSE_BYTES:
                raise NetworkPolicyError("RESPONSE_TOO_LARGE", "Provider response exceeds the size limit")

        return GuardedResponse(status=response.status, body=bytes(body))
