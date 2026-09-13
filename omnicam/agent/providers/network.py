"""SSRF-hardened HTTP guard shared by every provider adapter (design spec
section 12): URL scheme/shape policy, a remote-custom-host allowlist gate,
no redirects, and bounded response reading. Every adapter's HTTP call must
go through ``guarded_request`` rather than calling aiohttp directly, and
every session it calls it with must come from ``guarded_client_session()``
rather than a bare ``aiohttp.ClientSession()`` -- that is what pins DNS
resolution against ``_is_sensitive_address()`` at actual connection time.
"""

from __future__ import annotations

import ipaddress
import os
from dataclasses import dataclass
from urllib.parse import urlsplit, urlunsplit

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


def _is_sensitive_address(host: str) -> bool:
    """True for a literal IP that is categorically unsafe as an Agent
    provider target -- unspecified (0.0.0.0/::), multicast, link-local
    (including the 169.254.169.254 cloud-metadata address every major
    provider uses), or otherwise IANA-reserved. Blocked unconditionally,
    even when OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS=1 (design spec
    Task 10) -- unlike the RFC1918 LAN allowance, there is no legitimate
    provider use case this would ever break.

    Only literal IP addresses are checked here, not DNS names -- a hostname
    that merely resolves to a sensitive address (DNS rebinding) is instead
    caught at actual connection time by _PinnedResolver, which every
    provider adapter goes through via guarded_client_session()."""
    try:
        addr = ipaddress.ip_address(host)
    except ValueError:
        return False
    return addr.is_unspecified or addr.is_multicast or addr.is_link_local or addr.is_reserved


def allow_remote_custom_providers() -> bool:
    return os.environ.get("OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS") == "1"


def _canonical_base_url(value: str) -> str:
    parsed = urlsplit(value.strip())
    return urlunsplit((
        parsed.scheme.lower(),
        parsed.netloc.lower(),
        parsed.path.rstrip("/"),
        "",
        "",
    ))


def endpoint_is_custom(configured_base_url: str | None, official_base_url: str) -> bool:
    """True when ``configured_base_url`` is a caller-supplied override that
    differs from the provider's own hardcoded ``official_base_url`` -- an
    empty/unset value always means "use the official default" and is never
    custom. Query strings and fragments are ignored so they can't be used to
    disguise a genuinely different host as official, nor falsely flag the
    official URL itself as custom."""
    value = (configured_base_url or "").strip()
    if not value:
        return False
    return _canonical_base_url(value) != _canonical_base_url(official_base_url)


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

    if _is_sensitive_address(host):
        raise NetworkPolicyError(
            "SENSITIVE_TARGET_BLOCKED",
            "This destination is blocked regardless of remote-provider policy",
        )

    if is_custom_endpoint and not _is_loopback_host(host) and not allow_remote_custom_providers():
        raise NetworkPolicyError(
            "REMOTE_CUSTOM_PROVIDER_BLOCKED",
            "Remote custom provider endpoints are disabled; set "
            "OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS=1 to allow them",
        )

    return url


def clamp_timeout_seconds(requested: int) -> float:
    return max(1.0, min(float(requested), MAX_TOTAL_TIMEOUT_SECONDS))


class _PinnedResolver:
    """Wraps aiohttp's normal DNS resolver and rejects any resolved address
    ``_is_sensitive_address()`` would reject.

    ``validate_provider_url()`` only ever sees the literal host from the
    URL -- a hostname that merely *resolves* to a sensitive address (DNS
    rebinding: a name that answers something safe at validation time and
    169.254.169.254 a moment later) sails straight through it. This
    resolver closes that gap by validating the exact addresses aiohttp is
    about to connect to, at connection time, with nothing in between for a
    rebinding attacker to race.
    """

    def __init__(self) -> None:
        from aiohttp.resolver import DefaultResolver

        self._inner = DefaultResolver()

    async def resolve(self, host, port=0, family=0):
        results = await self._inner.resolve(host, port, family=family)
        for result in results:
            if _is_sensitive_address(result["host"]):
                raise NetworkPolicyError(
                    "SENSITIVE_TARGET_BLOCKED",
                    "This destination resolves to a blocked address",
                )
        return results

    async def close(self) -> None:
        await self._inner.close()


def guarded_client_session():
    """An ``aiohttp.ClientSession`` whose connector resolves through
    ``_PinnedResolver`` -- use this instead of a bare
    ``aiohttp.ClientSession()`` everywhere a provider adapter makes an
    outbound request, so DNS rebinding is caught at the actual connection,
    not just the literal-IP case ``validate_provider_url()`` already
    covers."""
    import aiohttp

    return aiohttp.ClientSession(connector=aiohttp.TCPConnector(resolver=_PinnedResolver()))


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
