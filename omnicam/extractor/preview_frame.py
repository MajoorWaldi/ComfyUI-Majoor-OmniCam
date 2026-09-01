"""Decode one browser-safe JPEG frame from a validated extractor source."""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from typing import Any

from .source_resolver import resolve_interactive_video_source

MIN_PREVIEW_DIMENSION = 64
MAX_PREVIEW_DIMENSION = 1920


class PreviewFrameError(ValueError):
    """A source cannot produce a browser fallback frame."""


@dataclass(frozen=True, slots=True)
class PreviewFrame:
    """One JPEG image and the timeline metadata the browser needs to place it."""

    data: bytes
    mime_type: str
    frame: int
    frame_count: int
    width: int
    height: int


def _bounded_dimension(value: Any) -> int:
    try:
        dimension = int(value)
    except (TypeError, ValueError) as exc:
        raise PreviewFrameError("max_dimension must be a positive integer") from exc
    if dimension <= 0:
        raise PreviewFrameError("max_dimension must be a positive integer")
    return max(MIN_PREVIEW_DIMENSION, min(MAX_PREVIEW_DIMENSION, dimension))


def _requested_frame(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise PreviewFrameError("frame must be an integer") from exc


def _preview_size(width: int, height: int, max_dimension: int) -> tuple[int, int]:
    if width <= 0 or height <= 0:
        raise PreviewFrameError("The video reports no usable dimensions")
    scale = min(1.0, max_dimension / float(max(width, height)))
    return max(1, round(width * scale)), max(1, round(height * scale))


def _video_stream(container):
    stream = next((item for item in container.streams if item.type == "video"), None)
    if stream is None:
        raise PreviewFrameError("This file contains no video stream")
    return stream


def decode_preview_frame(source_ref: Any, frame: Any, max_dimension: Any) -> PreviewFrame:
    """Resolve, clamp, decode, resize, and JPEG-encode one timeline frame.

    The source resolver remains the trust boundary: callers provide the same
    ComfyUI-managed reference accepted by interactive solve routes, never a
    filesystem path.
    """
    bounded_dimension = _bounded_dimension(max_dimension)
    requested_frame = _requested_frame(frame)
    path = resolve_interactive_video_source(source_ref)
    try:
        import av
    except ImportError as exc:  # pragma: no cover - ComfyUI ships PyAV
        raise PreviewFrameError("PyAV is unavailable, so video frames cannot be decoded") from exc

    try:
        with av.open(str(path)) as container:
            stream = _video_stream(container)
            frame_count = max(0, int(stream.frames or 0))
            target_frame = max(0, requested_frame)
            if frame_count:
                target_frame = min(target_frame, frame_count - 1)

            # Explicitly seek to the start of the selected stream. This is the
            # portable baseline for timeline-indexed clips; decoding continues
            # from that keyframe until the requested image is reached.
            container.seek(0, stream=stream)
            selected = None
            decoded_count = 0
            for index, decoded in enumerate(container.decode(stream)):
                decoded_count = index + 1
                if index == target_frame:
                    selected = decoded
                    if frame_count:
                        break
                elif not frame_count and index < target_frame:
                    selected = decoded

            if selected is None:
                if decoded_count <= 0:
                    raise PreviewFrameError("This file contains no decodable video frames")
                # Containers without a frame count need a full decode to find
                # the last valid frame when a caller scrubs past the end.
                target_frame = decoded_count - 1
                container.seek(0, stream=stream)
                selected = next(container.decode(stream), None)
                for _index, decoded in enumerate(container.decode(stream), start=1):
                    selected = decoded
                if selected is None:  # pragma: no cover - guarded above
                    raise PreviewFrameError("This file contains no decodable video frames")
            if not frame_count:
                frame_count = decoded_count

            width, height = _preview_size(int(selected.width), int(selected.height), bounded_dimension)
            rgb = selected.reformat(width=width, height=height, format="rgb24")
            output = BytesIO()
            rgb.to_image().save(output, format="JPEG", quality=85, optimize=True)
    except PreviewFrameError:
        raise
    except Exception as exc:
        raise PreviewFrameError(f"Video frame could not be decoded: {exc}") from exc

    return PreviewFrame(
        data=output.getvalue(),
        mime_type="image/jpeg",
        frame=target_frame,
        frame_count=frame_count,
        width=width,
        height=height,
    )
