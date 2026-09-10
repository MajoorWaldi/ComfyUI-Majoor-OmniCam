"""Post-solve refinement, decoupled from execution.

``POST /majoor/omnicam/extractor/refine`` takes the immutable raw solve the
queued Extractor emitted plus the current cleanup-desk settings and returns a
freshly refined canonical track. It runs ``build_refined_track`` -- no decode,
no solver, no GPU, no job id, no manager, no background task -- which is why a
slider can be dragged and the track updates without re-running TRACK.
"""

from __future__ import annotations

import json
from typing import Any

from aiohttp import web

from ..comfy_compat.server import PromptServer
from ..http_json import read_bounded_json_object
from .raw_solve_io import RawSolveDecodeError, raw_solve_from_dict
from .refine.pipeline import build_refined_track
from .refine.types import RefinementSettings

#: A raw solve for a long clip is large; refuse rather than silently truncate.
MAX_REFINE_BYTES = 4 * 1024 * 1024


class RefineRequestError(ValueError):
    """A refine request the server refuses, with the client-facing status."""

    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = int(status)
        self.message = str(message)


def refine_from_raw(body: Any) -> dict[str, Any]:
    """Pure refine: ``{raw_solve, settings}`` -> ``{refined_track, ...}``."""
    if not isinstance(body, dict):
        raise RefineRequestError(400, "Expected a JSON object")
    try:
        encoded = len(json.dumps(body).encode("utf-8"))
    except (TypeError, ValueError) as exc:
        raise RefineRequestError(400, "Request body is not valid JSON") from exc
    if encoded > MAX_REFINE_BYTES:
        raise RefineRequestError(
            413,
            "This solve is too large for live refine; press TRACK again with the "
            "cleanup settings you want.",
        )
    try:
        raw = raw_solve_from_dict(body.get("raw_solve"))
    except RawSolveDecodeError as exc:
        raise RefineRequestError(400, str(exc)) from exc

    settings = RefinementSettings.from_dict(body.get("settings"))
    try:
        track = build_refined_track(
            raw_poses=raw.poses,
            settings=settings,
            source_fps=raw.source_fps,
            duration_frames=raw.duration_frames,
            width=raw.width,
            height=raw.height,
            vertical_fov=raw.vertical_fov,
            backend=raw.backend,
            confidence=raw.coverage,
            frame_step=raw.frame_step,
            intrinsics_source=raw.intrinsics_source,
            warnings=raw.warnings,
        )
    except ValueError as exc:
        raise RefineRequestError(400, str(exc)) from exc

    metadata = track.get("metadata") or {}
    resolved = (metadata.get("refinement") or {}).get("resolved_alignment")
    return {
        "refined_track": track,
        "fingerprint": str(metadata.get("extractor_fingerprint", "")),
        "key_count": len(track.get("keyframes", [])),
        "resolved_alignment": resolved,
    }


@PromptServer.instance.routes.post("/majoor/omnicam/extractor/refine")
async def refine_route(request: web.Request) -> web.Response:
    body = await read_bounded_json_object(request, max_bytes=MAX_REFINE_BYTES, allow_empty=False)
    try:
        return web.json_response(refine_from_raw(body))
    except RefineRequestError as exc:
        if exc.status == 413:
            raise web.HTTPRequestEntityTooLarge(
                max_size=MAX_REFINE_BYTES, actual_size=MAX_REFINE_BYTES + 1
            ) from exc
        raise web.HTTPBadRequest(text=exc.message) from exc
