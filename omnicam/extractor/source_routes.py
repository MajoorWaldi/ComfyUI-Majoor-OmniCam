"""The Extractor source-inspection HTTP surface.

Two routes, neither of which queues a prompt or starts any job:

* ``POST /majoor/omnicam/extractor/source`` -- resolve and measure a source
  (frame count, rate, dimensions) so the panel scrubber has a real range
  before anything is solved;
* ``POST /majoor/omnicam/extractor/frame`` -- one bounded managed-source JPEG
  for browsers without native video decode.

These survived the retirement of the out-of-queue solve scheduler
(``omnicam/extractor/jobs/``): they are read-only inspection, not execution.
The pure validators here are tested without a server.
"""

from __future__ import annotations

import json
from typing import Any

from aiohttp import web

from ..comfy_compat.server import PromptServer
from ..http_json import read_bounded_json_object
from .preview_frame import PreviewFrame, PreviewFrameError, decode_preview_frame
from .source_resolver import (
    SourceResolutionError,
    describe_video_file,
    resolve_interactive_video_source,
)

MAX_REQUEST_BYTES = 256 * 1024
SOURCE_KINDS = ("annotated_input", "managed")


class SourceApiError(Exception):
    """A request the server refuses, with the status the client should see."""

    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = int(status)
        self.message = str(message)


def _validate_request_size(body: Any) -> None:
    try:
        encoded = len(json.dumps(body, ensure_ascii=False).encode("utf-8"))
    except (TypeError, ValueError) as exc:
        raise SourceApiError(400, "Request body is not valid JSON") from exc
    if encoded > MAX_REQUEST_BYTES:
        raise SourceApiError(413, "Request body is too large")


def validate_source(source: Any) -> dict[str, Any]:
    if not isinstance(source, dict):
        raise SourceApiError(400, "Expected a video source object")
    kind = str(source.get("kind", ""))
    if kind not in SOURCE_KINDS:
        raise SourceApiError(400, f"Unsupported video source kind: {kind!r}")
    value = source.get("value")
    if not isinstance(value, str) or not value.strip():
        raise SourceApiError(400, "A video source needs a reference value")
    if len(value) > 1024:
        raise SourceApiError(400, "Video source reference is too long")
    return {"kind": kind, "value": value}


def _preview_integer(body: dict[str, Any], name: str, default: int) -> int:
    try:
        return int(body.get(name, default))
    except (TypeError, ValueError, OverflowError) as exc:
        raise SourceApiError(400, f"Invalid preview setting: {name}") from exc


def validate_preview_request(body: Any) -> tuple[dict[str, Any], int, int]:
    if not isinstance(body, dict):
        raise SourceApiError(400, "Expected a JSON object")
    _validate_request_size(body)
    source = validate_source(body.get("source"))
    frame = max(0, _preview_integer(body, "frame", 0))
    max_dimension = _preview_integer(body, "max_dimension", 640)
    if max_dimension <= 0:
        raise SourceApiError(400, "max_dimension must be a positive integer")
    return source, frame, max(64, min(1920, max_dimension))


def describe_source(body: Any) -> dict[str, Any]:
    """Resolve and measure a source without starting anything."""
    if not isinstance(body, dict):
        raise SourceApiError(400, "Expected a JSON object")
    _validate_request_size(body)
    source = validate_source(body.get("source"))
    try:
        path = resolve_interactive_video_source(source, validate_metadata=False)
        info = describe_video_file(path)
    except SourceResolutionError as exc:
        raise SourceApiError(400, str(exc)) from exc
    return {"source": source, "info": info}


def preview_frame_response(body: Any) -> PreviewFrame:
    source, frame, max_dimension = validate_preview_request(body)
    try:
        return decode_preview_frame(source, frame, max_dimension)
    except (PreviewFrameError, SourceResolutionError) as exc:
        raise SourceApiError(400, str(exc)) from exc


# --- aiohttp bindings -------------------------------------------------------

_STATUS_EXCEPTIONS = {
    400: web.HTTPBadRequest,
    403: web.HTTPForbidden,
    404: web.HTTPNotFound,
    409: web.HTTPConflict,
}


def _raise(exc: SourceApiError) -> None:
    if exc.status == 413:
        raise web.HTTPRequestEntityTooLarge(
            max_size=MAX_REQUEST_BYTES, actual_size=MAX_REQUEST_BYTES + 1
        ) from exc
    raise _STATUS_EXCEPTIONS.get(exc.status, web.HTTPBadRequest)(text=exc.message) from exc


async def _body(request: web.Request) -> dict:
    return await read_bounded_json_object(
        request, max_bytes=MAX_REQUEST_BYTES, allow_empty=True
    )


@PromptServer.instance.routes.post("/majoor/omnicam/extractor/source")
async def describe_source_route(request: web.Request):
    try:
        return web.json_response(describe_source(await _body(request)))
    except SourceApiError as exc:
        _raise(exc)


@PromptServer.instance.routes.post("/majoor/omnicam/extractor/frame")
async def preview_frame_route(request: web.Request) -> web.Response:
    try:
        preview = preview_frame_response(await _body(request))
    except SourceApiError as exc:
        _raise(exc)
    return web.Response(
        body=preview.data,
        content_type=preview.mime_type,
        headers={
            "Cache-Control": "private, max-age=300",
            "X-OmniCam-Frame": str(preview.frame),
            "X-OmniCam-Frame-Count": str(preview.frame_count),
            "X-OmniCam-Width": str(preview.width),
            "X-OmniCam-Height": str(preview.height),
        },
    )
