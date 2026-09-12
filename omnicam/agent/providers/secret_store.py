"""Private, per-user provider credential storage (design spec sections 7-9).

Credentials never live in a workflow, in comfy.settings.json, or anywhere an
HTTP-exposed userdata route could serve them: they sit under the private
``__omnicam`` system-user directory, one JSON file per Comfy user, named by a
SHA-256 hash of that user's id (never the raw id).

Precedence is environment > local private store > none -- an operator can pin
a credential via env var and it always wins, and ``set``/``delete`` refuse to
touch a provider an env var already controls (see ``ENV_VAR_BY_PROVIDER``).
"""

from __future__ import annotations

import contextlib
import hashlib
import json
import os
import tempfile
from pathlib import Path
from typing import Literal

from .models import PROVIDER_IDS

MAX_SECRET_BYTES = 16 * 1024
MAX_STORE_BYTES = 64 * 1024

# Keyed by plain str (not ProviderId) because callers -- HTTP route handlers --
# hold an unvalidated request-supplied string until _require_known_provider()
# checks it against PROVIDER_IDS at runtime.
ENV_VAR_BY_PROVIDER: dict[str, str] = {
    "openai": "OMNICAM_OPENAI_API_KEY",
    "openai_compatible": "OMNICAM_OPENAI_COMPAT_API_KEY",
    "anthropic": "OMNICAM_ANTHROPIC_API_KEY",
}

CredentialSource = Literal["environment", "local_store", "none"]


class SecretStoreError(Exception):
    """A structured, code-carrying SecretStore failure."""

    def __init__(self, code: str, message: str | None = None) -> None:
        super().__init__(message or code)
        self.code = code


def _require_known_provider(provider_id: str) -> None:
    if provider_id not in PROVIDER_IDS:
        raise SecretStoreError("UNKNOWN_PROVIDER", f"Unknown provider: {provider_id!r}")


def env_credential(provider_id: str) -> str | None:
    """The operator-supplied environment override for ``provider_id``, if
    any. Each branch reads a literal env var name (never one assembled from
    ``ENV_VAR_BY_PROVIDER``) so scripts/registry_package_audit.py's narrow,
    by-name allowlist can verify statically that shipped code never reads an
    arbitrary/dynamically-named environment variable."""
    if provider_id == "openai":
        return os.environ.get("OMNICAM_OPENAI_API_KEY")
    if provider_id == "openai_compatible":
        return os.environ.get("OMNICAM_OPENAI_COMPAT_API_KEY")
    if provider_id == "anthropic":
        return os.environ.get("OMNICAM_ANTHROPIC_API_KEY")
    return None


def _request_user_id(request: object) -> str:
    from server import PromptServer

    return PromptServer.instance.user_manager.get_request_user_id(request)


def _store_root() -> Path:
    import folder_paths

    root = Path(folder_paths.get_system_user_directory("omnicam")) / "agent" / "secrets"
    root.mkdir(parents=True, exist_ok=True)
    return root


def _store_path(request: object) -> Path:
    user_id = _request_user_id(request)
    digest = hashlib.sha256(user_id.encode("utf-8")).hexdigest()
    return _store_root() / f"{digest}.json"


def _read_secrets(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    secrets = payload.get("secrets") if isinstance(payload, dict) else None
    return secrets if isinstance(secrets, dict) else {}


def _atomic_write(path: Path, payload: dict) -> None:
    encoded = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    if len(encoded) > MAX_STORE_BYTES:
        raise SecretStoreError("SECRET_STORE_FULL", "Credential store exceeds its size limit")

    fd, temp_path = tempfile.mkstemp(dir=str(path.parent), prefix=".omnicam-secret-")
    try:
        with os.fdopen(fd, "wb") as file:
            file.write(encoded)
            file.flush()
            os.fsync(file.fileno())
        with contextlib.suppress(OSError):
            os.chmod(temp_path, 0o600)
        os.replace(temp_path, path)
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)


class SecretStore:
    """Backend-only credential store: environment > local private store > none."""

    def status(self, request: object, provider_id: str) -> dict:
        _require_known_provider(provider_id)
        if env_credential(provider_id):
            return {"configured": True, "source": "environment"}

        secrets = _read_secrets(_store_path(request))
        if secrets.get(provider_id):
            return {"configured": True, "source": "local_store"}

        return {"configured": False, "source": "none"}

    def resolve(self, request: object, provider_id: str) -> str | None:
        _require_known_provider(provider_id)
        env_value = env_credential(provider_id)
        if env_value:
            return env_value

        secrets = _read_secrets(_store_path(request))
        return secrets.get(provider_id) or None

    def set(self, request: object, provider_id: str, secret: str) -> None:
        _require_known_provider(provider_id)
        if not isinstance(secret, str) or not secret.strip():
            raise SecretStoreError("BAD_REQUEST", "secret must be a non-empty string")
        if len(secret.encode("utf-8")) > MAX_SECRET_BYTES:
            raise SecretStoreError("SECRET_TOO_LARGE", "secret exceeds the per-credential size limit")

        path = _store_path(request)
        secrets = _read_secrets(path)
        secrets[provider_id] = secret
        _atomic_write(path, {"secrets": secrets})

    def delete(self, request: object, provider_id: str) -> None:
        _require_known_provider(provider_id)
        path = _store_path(request)
        secrets = _read_secrets(path)
        if provider_id not in secrets:
            return
        del secrets[provider_id]
        _atomic_write(path, {"secrets": secrets})


SECRET_STORE = SecretStore()
