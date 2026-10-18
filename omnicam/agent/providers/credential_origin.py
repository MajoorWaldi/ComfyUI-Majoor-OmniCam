"""Native credentials are only valid for their provider's fixed HTTPS origin."""

from urllib.parse import urlsplit

from .network import NetworkPolicyError


def require_native_origin(configured_url: str, official_url: str) -> str:
    value = (configured_url or official_url).rstrip("/")
    try:
        actual, official = urlsplit(value), urlsplit(official_url)
        matches = (
            actual.scheme == "https" and actual.hostname == official.hostname
            and actual.port in (None, 443) and not actual.username and not actual.password
            and not actual.query and not actual.fragment
            and actual.path.rstrip("/") == official.path.rstrip("/")
        )
    except ValueError:
        matches = False
    if not matches:
        raise NetworkPolicyError(
            "CREDENTIAL_ORIGIN_MISMATCH",
            "Native providers use their official HTTPS endpoint; configure a separate compatible provider for proxies",
        )
    return value
