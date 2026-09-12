"""Tests for centralized public error redaction (design spec section 13
hardening, Task 3)."""

from __future__ import annotations

from omnicam.agent.protocol import AgentProtocolError
from omnicam.agent.providers.network import NetworkPolicyError
from omnicam.agent.providers.public_errors import public_planner_error, public_provider_error
from omnicam.agent.providers.secret_store import SecretStoreError

_MALICIOUS = RuntimeError("request failed sk-super-secret Authorization: Bearer secret")


def test_provider_error_redacts_an_unknown_exception():
    public = public_provider_error(_MALICIOUS)
    assert public.code == "PROVIDER_UNREACHABLE"
    assert public.status == 502
    assert "sk-super-secret" not in public.message
    assert "Bearer secret" not in public.message


def test_provider_error_preserves_network_policy_error():
    error = NetworkPolicyError("REMOTE_CUSTOM_PROVIDER_BLOCKED", "blocked")
    public = public_provider_error(error)
    assert public.code == "REMOTE_CUSTOM_PROVIDER_BLOCKED"
    assert public.status == 400
    assert public.message == "blocked"


def test_provider_error_preserves_secret_store_error():
    error = SecretStoreError("CREDENTIAL_MANAGED_BY_ENV", "managed by env")
    public = public_provider_error(error)
    assert public.code == "CREDENTIAL_MANAGED_BY_ENV"
    assert public.status == 409
    assert public.message == "managed by env"


def test_provider_error_preserves_agent_protocol_error_status():
    error = AgentProtocolError("UNKNOWN_PROVIDER", "no such provider", 404)
    public = public_provider_error(error)
    assert public.code == "UNKNOWN_PROVIDER"
    assert public.status == 404
    assert public.message == "no such provider"


def test_planner_error_redacts_an_unknown_exception():
    public = public_planner_error(_MALICIOUS)
    assert public.code == "PLANNER_FAILED"
    assert public.status == 502
    assert "sk-super-secret" not in public.message
    assert "Bearer secret" not in public.message


def test_planner_error_preserves_agent_protocol_error():
    error = AgentProtocolError("UNKNOWN_SESSION", "no such session", 404)
    public = public_planner_error(error)
    assert public.code == "UNKNOWN_SESSION"
    assert public.status == 404


def test_planner_error_preserves_network_policy_error():
    error = NetworkPolicyError("REMOTE_CUSTOM_PROVIDER_BLOCKED", "blocked")
    public = public_planner_error(error)
    assert public.code == "REMOTE_CUSTOM_PROVIDER_BLOCKED"
    assert public.status == 400
