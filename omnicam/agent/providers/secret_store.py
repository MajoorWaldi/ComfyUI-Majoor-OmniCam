"""Private, per-user provider credential storage (design spec sections 7-9).

Credentials never live in a workflow, in comfy.settings.json, or anywhere an
HTTP-exposed userdata route could serve them: they sit under the private
``__omnicam`` system-user directory, one JSON file per Comfy user, named by a
SHA-256 hash of that user's id (never the raw id).
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

CredentialSource = Literal["local_store", "none"]


class SecretStoreError(Exception):
    """A structured, code-carrying SecretStore failure."""

    def __init__(self, code: str, message: str | None = None) -> None:
        super().__init__(message or code)
        self.code = code


def _require_known_provider(provider_id: str) -> None:
    if provider_id not in PROVIDER_IDS:
        raise SecretStoreError("UNKNOWN_PROVIDER", f"Unknown provider: {provider_id!r}")


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
    """Backend-only credential store: local private store, or none."""

    def status(self, request: object, provider_id: str) -> dict:
        _require_known_provider(provider_id)
        secrets = _read_secrets(_store_path(request))
        if secrets.get(provider_id):
            return {"configured": True, "source": "local_store"}

        return {"configured": False, "source": "none"}

    def resolve(self, request: object, provider_id: str) -> str | None:
        _require_known_provider(provider_id)
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
