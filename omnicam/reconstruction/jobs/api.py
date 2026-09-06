"""HTTP-independent API layer for reconstruction jobs."""

from __future__ import annotations

import json
import re
from collections.abc import Callable
from typing import Any

from ..settings import ReconstructionSettings
from ..types import ReconstructionSource
from .manager import (
    JobAccessDeniedError,
    JobLimitReachedError,
    JobNotFoundError,
    ReconstructionJobManager,
)
from .types import DONE, ReconstructionJob

MAX_REQUEST_BYTES = 256 * 1024
ALLOWED_START_KEYS = frozenset({"node_id", "client_id", "source", "settings"})
_CLIENT_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")


class ReconstructionApiError(Exception):
    """API-level request validation or handling error with an HTTP status code."""

    def __init__(self, status: int, message: str, *, code: str = "RECON_REQUEST_INVALID") -> None:
        super().__init__(message)
        self.status = int(status)
        self.message = str(message)
        self.code = str(code)

    def to_dict(self) -> dict[str, dict[str, str]]:
        return {"error": {"code": self.code, "message": self.message}}


def validate_client_id(value: Any) -> str:
    """Validate ComfyUI client token string."""
    if not isinstance(value, str) or not _CLIENT_ID_PATTERN.fullmatch(value):
        raise ReconstructionApiError(400, "Invalid client id")
    return value


def validate_start_payload(body: Any) -> dict[str, Any]:
    """Validate the JSON request payload for starting a reconstruction job."""
    if not isinstance(body, dict):
        raise ReconstructionApiError(400, "Expected a JSON object payload")

    try:
        encoded = len(json.dumps(body, ensure_ascii=False).encode("utf-8"))
    except (TypeError, ValueError) as exc:
        raise ReconstructionApiError(400, "Payload is not valid JSON") from exc

    if encoded > MAX_REQUEST_BYTES:
        raise ReconstructionApiError(413, "Request body is too large")

    unknown_keys = set(body.keys()) - ALLOWED_START_KEYS
    if unknown_keys:
        raise ReconstructionApiError(400, f"Unexpected request keys: {sorted(unknown_keys)}")

    node_id = str(body.get("node_id", "")).strip()
    if not node_id or len(node_id) > 128:
        raise ReconstructionApiError(400, "A valid node_id is required")

    client_id = validate_client_id(body.get("client_id", ""))

    source_data = body.get("source")
    if not isinstance(source_data, dict):
        raise ReconstructionApiError(400, "A valid source object is required")
    try:
        source_obj = ReconstructionSource.from_dict(source_data)
    except Exception as exc:
        raise ReconstructionApiError(400, f"Invalid reconstruction source: {exc}") from exc

    settings_data = body.get("settings", {})
    if not isinstance(settings_data, dict):
        raise ReconstructionApiError(400, "settings must be an object")
    try:
        settings_obj = ReconstructionSettings.from_dict(settings_data)
    except Exception as exc:
        raise ReconstructionApiError(400, f"Invalid reconstruction settings: {exc}") from exc

    return {
        "node_id": node_id,
        "client_id": client_id,
        "source": source_obj,
        "settings": settings_obj,
    }


def handle_start_job(
    manager: ReconstructionJobManager,
    payload: dict[str, Any],
    *,
    on_event: Callable[[str, ReconstructionJob], None] | None = None,
) -> dict[str, Any]:
    """Validate payload and launch background reconstruction job."""
    validated = validate_start_payload(payload)
    try:
        job = manager.start_job(
            node_id=validated["node_id"],
            client_id=validated["client_id"],
            source=validated["source"],
            settings=validated["settings"],
            on_event=on_event,
        )
    except JobLimitReachedError as err:
        raise ReconstructionApiError(429, str(err), code="RECON_JOB_LIMIT") from err
    return job.to_dict()


def handle_get_status(
    manager: ReconstructionJobManager,
    job_id: str,
    client_id: str | None = None,
) -> dict[str, Any]:
    """Return status envelope for a job."""
    try:
        job = manager.get_job(job_id, client_id=client_id)
        return job.to_dict()
    except JobNotFoundError as err:
        raise ReconstructionApiError(404, str(err), code="RECON_JOB_NOT_FOUND") from err
    except JobAccessDeniedError as err:
        raise ReconstructionApiError(403, str(err), code="RECON_ACCESS_DENIED") from err


def handle_get_result(
    manager: ReconstructionJobManager,
    job_id: str,
    client_id: str | None = None,
) -> dict[str, Any]:
    """Return reconstruction result if complete, or current progress state if still running."""
    try:
        job = manager.get_job(job_id, client_id=client_id)
        if job.state == DONE and job.result is not None:
            return {
                "job_id": job.job_id,
                "state": job.state,
                "stage": job.stage,
                "progress": job.progress,
                "motion_scene": job.result.motion_scene,
                "summary": job.result.summary,
                "warnings": list(job.result.warnings),
                "error": None,
            }
        return {
            "job_id": job.job_id,
            "state": job.state,
            "stage": job.stage,
            "progress": job.progress,
            "motion_scene": None,
            "summary": None,
            "warnings": list(job.warnings),
            "error": job.error,
        }
    except JobNotFoundError as err:
        raise ReconstructionApiError(404, str(err), code="RECON_JOB_NOT_FOUND") from err
    except JobAccessDeniedError as err:
        raise ReconstructionApiError(403, str(err), code="RECON_ACCESS_DENIED") from err


def handle_stop_job(
    manager: ReconstructionJobManager,
    job_id: str,
    client_id: str | None = None,
) -> dict[str, Any]:
    """Request a stop on an active job."""
    try:
        job = manager.stop_job(job_id, client_id=client_id)
        return {
            "job_id": job.job_id,
            "state": job.state,
            "message": "Stop requested",
        }
    except JobNotFoundError as err:
        raise ReconstructionApiError(404, str(err), code="RECON_JOB_NOT_FOUND") from err
    except JobAccessDeniedError as err:
        raise ReconstructionApiError(403, str(err), code="RECON_ACCESS_DENIED") from err


def handle_delete_job(
    manager: ReconstructionJobManager,
    job_id: str,
    client_id: str | None = None,
) -> dict[str, Any]:
    """Delete a job from memory."""
    try:
        manager.delete_job(job_id, client_id=client_id)
        return {"deleted": True, "job_id": job_id}
    except JobNotFoundError as err:
        raise ReconstructionApiError(404, str(err), code="RECON_JOB_NOT_FOUND") from err
    except JobAccessDeniedError as err:
        raise ReconstructionApiError(403, str(err), code="RECON_ACCESS_DENIED") from err
