"""Wire constants, loopback enforcement and small bounded-string validation
shared by the OmniCam Agent v1 broker and its routes."""

from __future__ import annotations

import ipaddress
from dataclasses import dataclass

from aiohttp import web

AGENT_PROTOCOL = "omnicam-agent/1"
AGENT_SCHEMA_VERSION = 1
AGENT_EVENT = "majoor.omnicam.agent.request"

MAX_AGENT_JSON_BYTES = 1024 * 1024
MAX_SESSIONS = 64
MAX_PENDING_REQUESTS = 128

REQUEST_TIMEOUT_SECONDS = 8.0
HEARTBEAT_SECONDS = 10.0
SESSION_TTL_SECONDS = 45.0

MAX_ADVERTISED_OPERATIONS = 128
MAX_ADVERTISED_QUERIES = 128


@dataclass(slots=True)
class AgentProtocolError(Exception):
    """A structured, JSON-serializable Agent-facing error."""

    code: str
    message: str
    status: int = 400

    def __str__(self) -> str:
        return self.message


def is_loopback_remote(remote: str | None) -> bool:
    """True when ``remote`` (an aiohttp ``request.remote``) is 127.0.0.1/::1."""
    if not remote:
        return False

    try:
        address = ipaddress.ip_address(remote)
    except ValueError:
        return False

    if address.is_loopback:
        return True

    mapped = getattr(address, "ipv4_mapped", None)
    return bool(mapped and mapped.is_loopback)


def require_local_agent(request: web.Request) -> None:
    """Guard for the *external* Agent routes: loopback peer, explicit header.

    A legitimate ComfyUI browser callback does not need this -- it can be
    remote relative to the server -- so this is only used on the routes an
    external Agent process calls directly.
    """
    if not is_loopback_remote(request.remote):
        raise web.HTTPForbidden(text="OmniCam Agent v1 external control is loopback-only")

    if request.headers.get("X-OmniCam-Agent") != "1":
        raise web.HTTPForbidden(text="Missing OmniCam Agent protocol header")


def bounded_string(value: object, name: str, limit: int) -> str:
    """A required, non-empty string within ``limit`` characters."""
    if not isinstance(value, str):
        raise AgentProtocolError("BAD_REQUEST", f"{name} must be a string")

    value = value.strip()

    if not value or len(value) > limit:
        raise AgentProtocolError("BAD_REQUEST", f"{name} must contain 1..{limit} characters")

    return value
