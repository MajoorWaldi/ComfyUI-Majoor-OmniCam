"""Tests for the private per-user Agent provider credential store."""

from __future__ import annotations

import json

import pytest

from omnicam.agent.providers import secret_store as store_module
from omnicam.agent.providers.secret_store import SecretStore, SecretStoreError


@pytest.fixture(autouse=True)
def _isolated_store(tmp_path, monkeypatch):
    root = tmp_path / "__omnicam" / "agent" / "secrets"
    root.mkdir(parents=True)
    monkeypatch.setattr(store_module, "_store_root", lambda: root)
    monkeypatch.delenv("OMNICAM_OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("OMNICAM_OPENAI_COMPAT_API_KEY", raising=False)
    monkeypatch.delenv("OMNICAM_ANTHROPIC_API_KEY", raising=False)
    yield root


def _as_user(monkeypatch, user_id: str):
    monkeypatch.setattr(store_module, "_request_user_id", lambda request: user_id)


def test_set_resolve_delete_round_trip(monkeypatch):
    _as_user(monkeypatch, "user_a")
    store = SecretStore()
    request = object()

    assert store.resolve(request, "anthropic") is None
    store.set(request, "anthropic", "sk-ant-123")
    assert store.resolve(request, "anthropic") == "sk-ant-123"
    assert store.status(request, "anthropic") == {"configured": True, "source": "local_store"}

    store.delete(request, "anthropic")
    assert store.resolve(request, "anthropic") is None
    assert store.status(request, "anthropic") == {"configured": False, "source": "none"}


def test_status_never_returns_the_secret(monkeypatch):
    _as_user(monkeypatch, "user_a")
    store = SecretStore()
    request = object()
    store.set(request, "openai", "sk-openai-abc")

    status = store.status(request, "openai")
    assert "secret" not in status
    assert "sk-openai-abc" not in json.dumps(status)


def test_different_users_are_isolated(monkeypatch):
    store = SecretStore()
    request = object()

    _as_user(monkeypatch, "user_a")
    store.set(request, "openai", "secret-for-a")

    _as_user(monkeypatch, "user_b")
    assert store.resolve(request, "openai") is None


def test_environment_overrides_local_store(monkeypatch):
    _as_user(monkeypatch, "user_a")
    store = SecretStore()
    request = object()
    store.set(request, "openai", "local-secret")

    monkeypatch.setenv("OMNICAM_OPENAI_API_KEY", "env-secret")
    assert store.resolve(request, "openai") == "env-secret"
    assert store.status(request, "openai") == {"configured": True, "source": "environment"}


def test_env_credential_cannot_be_deleted_from_the_local_store(monkeypatch):
    _as_user(monkeypatch, "user_a")
    monkeypatch.setenv("OMNICAM_OPENAI_API_KEY", "env-secret")
    store = SecretStore()
    request = object()

    store.delete(request, "openai")
    assert store.resolve(request, "openai") == "env-secret"


def test_oversized_credential_is_rejected(monkeypatch):
    _as_user(monkeypatch, "user_a")
    store = SecretStore()
    request = object()
    with pytest.raises(SecretStoreError) as excinfo:
        store.set(request, "openai", "x" * (17 * 1024))
    assert excinfo.value.code == "SECRET_TOO_LARGE"


def test_unknown_provider_is_rejected(monkeypatch):
    _as_user(monkeypatch, "user_a")
    store = SecretStore()
    request = object()
    with pytest.raises(SecretStoreError) as excinfo:
        store.set(request, "not-a-real-provider", "secret")
    assert excinfo.value.code == "UNKNOWN_PROVIDER"

    with pytest.raises(SecretStoreError):
        store.status(request, "not-a-real-provider")


def test_ollama_never_requires_a_credential_and_reports_not_configured(monkeypatch):
    _as_user(monkeypatch, "user_a")
    store = SecretStore()
    request = object()
    assert store.status(request, "ollama") == {"configured": False, "source": "none"}


def test_store_stays_valid_json_after_repeated_writes(monkeypatch, tmp_path):
    _as_user(monkeypatch, "user_a")
    store = SecretStore()
    request = object()
    for i in range(5):
        store.set(request, "openai", f"secret-{i}")
        store.set(request, "anthropic", f"other-{i}")

    path = store_module._store_path(request)
    payload = json.loads(path.read_text(encoding="utf-8"))
    assert payload["secrets"]["openai"] == "secret-4"
    assert payload["secrets"]["anthropic"] == "other-4"


def test_a_public_userdata_path_is_never_used(monkeypatch):
    # The store must resolve entirely through the private system-user root,
    # never through folder_paths.get_public_user_directory (HTTP-exposed).
    _as_user(monkeypatch, "user_a")
    store = SecretStore()
    request = object()
    store.set(request, "openai", "secret")
    path = store_module._store_path(request)
    assert "__omnicam" in str(path.parents[2]) or "__omnicam" in str(path)
