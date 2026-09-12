"""Centralized, safe browser-facing error redaction for Agent routes (design
spec section 13 hardening, Task 3).

Provider/planner routes must never let ``str(error)`` from a generic
exception handler reach the browser: even though today's curated exceptions
(NetworkPolicyError, SecretStoreError, AgentProtocolError) happen to produce
credential-free messages, the contract must not silently depend on every
future provider library or refactor continuing to raise safe strings. Any
*unknown* exception is mapped to a fixed, generic message instead; only the
three curated types keep their own stable code/message.
"""

from __future__ import annotations

from dataclasses import dataclass

from ..protocol import AgentProtocolError
from .network import NetworkPolicyError
from .secret_store import SecretStoreError


@dataclass(frozen=True, slots=True)
class PublicAgentError:
    code: str
    message: str
    status: int


def public_provider_error(error: Exception) -> PublicAgentError:
    if isinstance(error, NetworkPolicyError):
        return PublicAgentError(error.code, str(error), 400)
    if isinstance(error, SecretStoreError):
        return PublicAgentError(error.code, str(error), 409)
    if isinstance(error, AgentProtocolError):
        return PublicAgentError(error.code, error.message, error.status)
    return PublicAgentError(
        "PROVIDER_UNREACHABLE",
        "Provider request failed. Check the endpoint, credential and server logs.",
        502,
    )


def public_planner_error(error: Exception) -> PublicAgentError:
    if isinstance(error, AgentProtocolError):
        return PublicAgentError(error.code, error.message, error.status)
    if isinstance(error, NetworkPolicyError):
        return PublicAgentError(error.code, str(error), 400)
    if isinstance(error, SecretStoreError):
        return PublicAgentError(error.code, str(error), 409)
    return PublicAgentError(
        "PLANNER_FAILED",
        "Agent planning failed before a safe preview could be produced.",
        502,
    )
