"""Request handling for interactive solves, with no HTTP framework in sight.

Keeping the rules here rather than in the aiohttp handlers means the whole
security surface -- enum validation, numeric clamping, ownership, payload size
-- is unit-testable without standing up a server, and the route module stays a
thin binding that cannot accidentally grow logic of its own.
"""

from __future__ import annotations

import json
import re
from typing import Any

from ..preview_frame import PreviewFrame, PreviewFrameError, decode_preview_frame
from ..refine.types import RefinementSettings
from ..source_resolver import (
    SourceResolutionError,
    describe_video_file,
    resolve_interactive_video_source,
)
from .manager import (
    JobAccessDeniedError,
    JobNotFoundError,
    SolveJobManager,
    SolveSlotBusyError,
)
from .types import COMPLETED
from .worker import job_result

MAX_REQUEST_BYTES = 256 * 1024
METHODS = ("auto", "dpvo", "opencv_sift")
LENS_MODES = ("auto", "fov", "focal_mm")
SOURCE_KINDS = ("annotated_input", "managed")
_CLIENT_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")


class ApiError(Exception):
    """A request the server refuses, with the status the client should see."""

    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = int(status)
        self.message = str(message)


def validate_client_id(value: Any) -> str:
    """Accept a bounded ComfyUI client token, never arbitrary request text."""
    if not isinstance(value, str) or not _CLIENT_ID_PATTERN.fullmatch(value):
        raise ApiError(400, "Invalid client id")
    return value


def _number(settings: dict[str, Any], name: str, default: float, low: float, high: float) -> float:
    try:
        value = float(settings.get(name, default))
    except (TypeError, ValueError) as exc:
        raise ApiError(400, f"Invalid solve setting: {name}") from exc
    if value != value or value in (float("inf"), float("-inf")):
        raise ApiError(400, f"Invalid solve setting: {name}")
    if not low <= value <= high:
        raise ApiError(400, f"Solve setting out of range: {name}")
    return value


def _integer(settings: dict[str, Any], name: str, default: int, low: int, high: int) -> int:
    try:
        value = int(settings.get(name, default))
    except (TypeError, ValueError) as exc:
        raise ApiError(400, f"Invalid solve setting: {name}") from exc
    if not low <= value <= high:
        raise ApiError(400, f"Solve setting out of range: {name}")
    return value


def validate_request_size(body: Any) -> None:
    try:
        encoded = len(json.dumps(body, ensure_ascii=False).encode("utf-8"))
    except (TypeError, ValueError) as exc:
        raise ApiError(400, "Request body is not valid JSON") from exc
    if encoded > MAX_REQUEST_BYTES:
        raise ApiError(413, "Request body is too large")


def validate_source(source: Any) -> dict[str, Any]:
    if not isinstance(source, dict):
        raise ApiError(400, "Expected a video source object")
    kind = str(source.get("kind", ""))
    if kind not in SOURCE_KINDS:
        raise ApiError(400, f"Unsupported video source kind: {kind!r}")
    value = source.get("value")
    if not isinstance(value, str) or not value.strip():
        raise ApiError(400, "A video source needs a reference value")
    if len(value) > 1024:
        raise ApiError(400, "Video source reference is too long")
    return {"kind": kind, "value": value}


def _preview_integer(body: dict[str, Any], name: str, default: int) -> int:
    try:
        return int(body.get(name, default))
    except (TypeError, ValueError, OverflowError) as exc:
        raise ApiError(400, f"Invalid preview setting: {name}") from exc


def validate_preview_request(body: Any) -> tuple[dict[str, Any], int, int]:
    """Validate the compact, browser-facing single-frame request."""
    if not isinstance(body, dict):
        raise ApiError(400, "Expected a JSON object")
    validate_request_size(body)
    source = validate_source(body.get("source"))
    frame = max(0, _preview_integer(body, "frame", 0))
    max_dimension = _preview_integer(body, "max_dimension", 640)
    if max_dimension <= 0:
        raise ApiError(400, "max_dimension must be a positive integer")
    return source, frame, max(64, min(1920, max_dimension))


def validate_settings(settings: Any) -> dict[str, Any]:
    """Whitelist and clamp the solver settings a browser may choose."""
    if settings is None:
        settings = {}
    if not isinstance(settings, dict):
        raise ApiError(400, "Solve settings must be an object")
    allowed = {
        "method", "lens_mode", "fov_degrees", "focal_length_mm", "sensor_width_mm",
        "max_dimension", "frame_step", "refine",
    }
    unknown = set(settings) - allowed
    if unknown:
        raise ApiError(400, f"Unknown solve setting: {sorted(unknown)[0]}")
    method = str(settings.get("method", "dpvo"))
    if method not in METHODS:
        raise ApiError(400, f"Unsupported solve method: {method!r}")
    lens_mode = str(settings.get("lens_mode", "auto"))
    if lens_mode not in LENS_MODES:
        raise ApiError(400, f"Unsupported lens mode: {lens_mode!r}")
    refine = RefinementSettings.from_dict(settings.get("refine")).to_dict()
    return {
        "method": method,
        "lens_mode": lens_mode,
        "fov_degrees": _number(settings, "fov_degrees", 53.0, 10.0, 140.0),
        "focal_length_mm": _number(settings, "focal_length_mm", 24.0, 1.0, 300.0),
        "sensor_width_mm": _number(settings, "sensor_width_mm", 36.0, 4.0, 70.0),
        "max_dimension": _integer(settings, "max_dimension", 640, 320, 1920),
        "frame_step": _integer(settings, "frame_step", 1, 1, 10),
        "refine": refine,
    }


def _node_id(body: dict[str, Any]) -> str:
    node_id = str(body.get("node_id", ""))
    if not node_id or len(node_id) > 64:
        raise ApiError(400, "A solve must name the Extractor node that started it")
    return node_id


def _lookup(manager: SolveJobManager, job_id: str, client_id: str):
    try:
        return manager.get(job_id, client_id=client_id)
    except JobNotFoundError as exc:
        raise ApiError(404, f"Unknown OmniCam solve job: {job_id}") from exc
    except JobAccessDeniedError as exc:
        raise ApiError(403, str(exc)) from exc


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------

def start_job(manager: SolveJobManager, body: Any, *, client_id: str) -> dict[str, Any]:
    """Create and start a solve. Nothing here touches the ComfyUI prompt queue."""
    if not isinstance(body, dict):
        raise ApiError(400, "Expected a JSON object")
    validate_request_size(body)
    if not client_id:
        raise ApiError(400, "A solve must be started by an identified client")
    client_id = validate_client_id(client_id)
    source = validate_source(body.get("source"))
    settings = validate_settings(body.get("settings"))
    try:
        job = manager.start(
            client_id=client_id, node_id=_node_id(body), source_ref=source, settings=settings,
        )
    except SolveSlotBusyError as exc:
        raise ApiError(409, str(exc)) from exc
    except SourceResolutionError as exc:
        raise ApiError(400, str(exc)) from exc
    return job.status()


def describe_source(body: Any) -> dict[str, Any]:
    """Resolve and measure a source without starting anything.

    The panel needs the frame count and rate before the first solve, or its
    scrubber has no range and its readout reads 0 / 0 -- a preview you cannot
    move through is not a preview.
    """
    if not isinstance(body, dict):
        raise ApiError(400, "Expected a JSON object")
    validate_request_size(body)
    source = validate_source(body.get("source"))
    try:
        path = resolve_interactive_video_source(source, validate_metadata=False)
        info = describe_video_file(path)
    except SourceResolutionError as exc:
        raise ApiError(400, str(exc)) from exc
    return {"source": source, "info": info}


def preview_frame_response(body: Any) -> PreviewFrame:
    """Decode one bounded JPEG frame without creating an interactive solve job."""
    source, frame, max_dimension = validate_preview_request(body)
    try:
        return decode_preview_frame(source, frame, max_dimension)
    except (PreviewFrameError, SourceResolutionError) as exc:
        raise ApiError(400, str(exc)) from exc


def job_status(manager: SolveJobManager, job_id: str, *, client_id: str) -> dict[str, Any]:
    """The authoritative state. A dropped WebSocket is recovered through this."""
    return _lookup(manager, job_id, client_id).status()


def stop_job(manager: SolveJobManager, job_id: str, *, client_id: str) -> dict[str, Any]:
    job = _lookup(manager, job_id, client_id)
    manager.stop(job)
    return job.status()


def delete_job(manager: SolveJobManager, job_id: str, *, client_id: str) -> dict[str, Any]:
    job = _lookup(manager, job_id, client_id)
    deleted = manager.delete(job.job_id)
    return {"job_id": job.job_id, "deleted": deleted, "state": job.state}


def refine_job(manager: SolveJobManager, job_id: str, body: Any, *, client_id: str) -> dict[str, Any]:
    """Re-derive the refined track from the stored raw solve.

    No decode, no solver, no GPU: this is why a slider can be dragged live.
    """
    if body is not None and not isinstance(body, dict):
        raise ApiError(400, "Expected a JSON object")
    validate_request_size(body or {})
    job = _lookup(manager, job_id, client_id)
    if job.state != COMPLETED or job.raw_solve is None:
        raise ApiError(409, f"Job {job.job_id} is {job.state}; only a COMPLETED solve can be refined.")

    from ..pipeline import refine_raw_solve

    settings = RefinementSettings.from_dict((body or {}).get("settings"))
    try:
        job.refined_track = refine_raw_solve(job.raw_solve, settings)
    except ValueError as exc:
        raise ApiError(400, str(exc)) from exc
    job.refine_settings = settings.to_dict()
    metadata = job.refined_track.get("metadata") or {}
    resolved = (metadata.get("refinement") or {}).get("resolved_alignment")
    return {
        "job_id": job.job_id,
        "refined_track": job.refined_track,
        "refine_settings": job.refine_settings,
        "fingerprint": str(metadata.get("extractor_fingerprint", "")),
        "key_count": len(job.refined_track.get("keyframes", [])),
        "resolved_alignment": resolved,
    }


def result_payload(manager: SolveJobManager, job_id: str, *, client_id: str) -> dict[str, Any]:
    job = _lookup(manager, job_id, client_id)
    try:
        return job_result(job)
    except ValueError as exc:
        raise ApiError(409, str(exc)) from exc
