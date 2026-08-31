"""Streaming frame decode for the extractor.

A solve wants a few hundred small uint8 frames, not the whole clip as float32
tensors: a two-minute 4K source would be tens of gigabytes that way. So this
module goes through the current ComfyUI ``VIDEO`` contract --
``get_stream_source()`` plus the metadata accessors -- and decodes with PyAV,
downscaling inside the decoder and keeping only the sampled frames.

Two things it is strict about:

* **source timeline frames.** With ``frame_step=2`` the solved keys land on
  source frames 0, 2, 4, ... and never on solver indices 0, 1, 2. A track whose
  frame numbers do not line up with the footage is worse than no track.
* **variable frame rate.** VFR sources get their frames placed by presentation
  time against a stable nominal FPS, collisions resolved, and a warning.
"""

from __future__ import annotations

import logging
from collections.abc import Iterator
from dataclasses import dataclass, field
from fractions import Fraction
from typing import Any

logger = logging.getLogger(__name__)

MIN_SOLVER_DIMENSION = 32
MAX_SOLVER_RGB_BYTES = 512 * 1024**2


@dataclass(slots=True, frozen=True)
class VideoInfo:
    width: int
    height: int
    fps: float
    frame_count: int
    variable_frame_rate: bool = False


@dataclass(slots=True, frozen=True)
class SolverScale:
    """How the solver's frames relate to the source resolution."""

    width: int
    height: int
    scale_x: float
    scale_y: float


@dataclass(slots=True)
class DecodedFrames:
    info: VideoInfo
    scale: SolverScale
    frames: list[Any] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


class VideoDecodeError(RuntimeError):
    """The clip could not be decoded into something solvable."""


class FileVideoSource:
    """The ``VIDEO`` contract, backed by a file an interactive solve resolved.

    An interactive solve has a path, not a ComfyUI ``VIDEO`` object -- that only
    exists while a graph executes. Rather than growing a second decode path,
    this adapter presents the handful of accessors :func:`decode_solver_frames`
    actually uses, so both paths decode through exactly the same code.
    """

    __slots__ = ("_fps", "_frame_count", "_height", "_path", "_width")

    def __init__(self, path, *, width=0, height=0, fps=0.0, frame_count=0) -> None:
        self._path = str(path)
        self._width, self._height = int(width), int(height)
        self._fps, self._frame_count = float(fps), int(frame_count)
        if not (self._width and self._height and self._fps > 0):
            self._probe()

    def _probe(self) -> None:
        import av

        with av.open(self._path) as container:
            stream = next((item for item in container.streams if item.type == "video"), None)
            if stream is None:
                raise VideoDecodeError(f"{self._path} contains no video stream")
            self._width = self._width or int(stream.width or 0)  # type: ignore[attr-defined]
            self._height = self._height or int(stream.height or 0)  # type: ignore[attr-defined]
            self._fps = self._fps or float(stream.average_rate or 0)
            if not self._frame_count:
                frames = int(stream.frames or 0)
                if frames <= 0 and stream.duration and stream.time_base and self._fps > 0:
                    frames = int(float(stream.duration * stream.time_base) * self._fps)
                self._frame_count = max(0, frames)

    def get_stream_source(self) -> str:
        return self._path

    def get_dimensions(self) -> tuple[int, int]:
        return self._width, self._height

    def get_frame_rate(self) -> float:
        return self._fps

    def get_frame_count(self) -> int:
        return self._frame_count

    def get_active_trim_window(self) -> tuple[float, float]:
        return 0.0, 0.0


def _nominal_fps(video: Any) -> float:
    try:
        rate = video.get_frame_rate()
    except Exception as exc:
        raise VideoDecodeError(f"OmniCam Extractor could not read the video frame rate: {exc}") from exc
    value = float(Fraction(rate)) if isinstance(rate, Fraction) else float(rate)
    if not (value > 0.0):
        raise VideoDecodeError("OmniCam Extractor needs a video with a positive frame rate.")
    return value


def inspect_video(video: Any) -> VideoInfo:
    """Read the ``VIDEO`` metadata contract without decoding any pixels."""
    width, height = video.get_dimensions()
    try:
        frame_count = max(0, int(video.get_frame_count()))
    except Exception as exc:  # noqa: BLE001 - frame counts are optional in some containers
        logger.debug("OmniCam Extractor could not read the video frame count: %s", exc)
        frame_count = 0
    return VideoInfo(width=int(width), height=int(height), fps=_nominal_fps(video), frame_count=frame_count)


def solver_scale(info: VideoInfo, max_dimension: int) -> SolverScale:
    """Fit the source into ``max_dimension`` while keeping the aspect ratio.

    Never upscales: feeding a solver interpolated pixels invents detail it will
    then track. The short edge has a floor too, but it is applied as a *factor*
    -- clamping the axes independently would stretch the image, and a solve
    against a stretched frame silently contradicts the intrinsics.
    """
    largest = max(1, info.width, info.height)
    smallest = max(1, min(info.width, info.height))
    limit = max(MIN_SOLVER_DIMENSION, int(max_dimension))
    factor = min(1.0, limit / float(largest))
    factor = max(factor, min(1.0, MIN_SOLVER_DIMENSION / float(smallest)))
    # Even dimensions keep the chroma-subsampled formats PyAV rescales through
    # from having to round for us.
    width = max(2, 2 * round(info.width * factor / 2))
    height = max(2, 2 * round(info.height * factor / 2))
    return SolverScale(
        width=width,
        height=height,
        scale_x=width / max(1.0, float(info.width)),
        scale_y=height / max(1.0, float(info.height)),
    )


def _trim_window(video: Any) -> tuple[float, float]:
    try:
        start, duration = video.get_active_trim_window()
    except Exception:  # noqa: BLE001 - only trimmable VIDEO implementations expose this
        return 0.0, 0.0
    return max(0.0, float(start)), max(0.0, float(duration))


def _decoded_stream(container, scale: SolverScale) -> Iterator[tuple[float, Any]]:
    """Yield ``(presentation_seconds, rgb_array)`` for every frame in the clip."""
    import numpy as np

    stream = container.streams.video[0]
    stream.thread_type = "AUTO"
    time_base = float(stream.time_base) if stream.time_base else 0.0
    for index, frame in enumerate(container.decode(stream)):
        if frame.pts is not None and time_base:
            seconds = float(frame.pts) * time_base
        elif frame.time is not None:
            seconds = float(frame.time)
        else:
            seconds = float(index) / max(1e-6, float(stream.average_rate or 1))
        converted = frame.reformat(width=scale.width, height=scale.height, format="rgb24")
        yield seconds, np.ascontiguousarray(converted.to_ndarray())


def decode_solver_frames(
    video: Any,
    *,
    frame_step: int,
    max_dimension: int,
    max_frames: int = 4096,
    max_decoded_bytes: int = MAX_SOLVER_RGB_BYTES,
) -> DecodedFrames:
    """Decode the sampled frames a backend will solve, tagged with source frames."""
    try:
        import av
    except ImportError as exc:  # PyAV ships with ComfyUI; a broken install must say so plainly
        raise VideoDecodeError(
            "OmniCam Extractor needs PyAV to read video frames, and it could not be imported."
        ) from exc

    from .types import VideoFrameSample

    info = inspect_video(video)
    scale = solver_scale(info, max_dimension)
    bytes_per_frame = scale.width * scale.height * 3
    memory_frame_limit = max(0, int(max_decoded_bytes) // max(1, bytes_per_frame))
    if memory_frame_limit < 2:
        raise VideoDecodeError(
            "OmniCam Extractor solver resolution leaves room for fewer than two frames "
            "inside the raw RGB memory budget; lower max_dimension."
        )
    frame_limit = min(max(1, int(max_frames)), memory_frame_limit)
    step = max(1, int(frame_step))
    start_time, trim_duration = _trim_window(video)
    end_time = start_time + trim_duration if trim_duration > 0.0 else float("inf")

    source = video.get_stream_source()
    warnings: list[str] = []
    by_frame: dict[int, Any] = {}
    variable = False
    collisions = 0
    decoded = 0

    try:
        with av.open(source) as container:
            for seconds, rgb in _decoded_stream(container, scale):
                if seconds < start_time - 1e-9 or seconds > end_time + 1e-9:
                    continue
                relative = seconds - start_time
                # The timeline frame comes from presentation time so a VFR clip
                # lands where it actually plays; for CFR this is just the index.
                timeline_frame = max(0, round(relative * info.fps))
                if timeline_frame != decoded:
                    variable = True
                decoded += 1
                if timeline_frame % step:
                    continue
                if timeline_frame in by_frame:
                    collisions += 1
                if timeline_frame not in by_frame and len(by_frame) >= frame_limit:
                    if memory_frame_limit <= int(max_frames):
                        raise VideoDecodeError(
                            "OmniCam Extractor would exceed its raw RGB memory budget. "
                            "Trim the clip, raise frame_step, or lower max_dimension."
                        )
                    raise VideoDecodeError(
                        f"OmniCam Extractor would have to solve more than {max_frames} frames. "
                        "Trim the clip or raise frame_step."
                    )
                by_frame[timeline_frame] = VideoFrameSample(
                    source_frame=timeline_frame,
                    timestamp_seconds=relative,
                    rgb=rgb,
                )
    except VideoDecodeError:
        raise
    except Exception as exc:
        raise VideoDecodeError(f"OmniCam Extractor could not decode this video: {exc}") from exc

    if len(by_frame) < 2:
        raise VideoDecodeError(
            "OmniCam Extractor needs at least 2 usable frames. "
            "The clip is too short, or frame_step skipped past its end."
        )

    if variable:
        warnings.append(
            f"This clip has a variable frame rate. Frames were placed on a {info.fps:g} fps timeline "
            "by presentation time, so key spacing is approximate."
        )
    if collisions:
        warnings.append(
            f"{collisions} decoded frames landed on a timeline frame that was already taken; "
            "the last one won."
        )

    resolved = VideoInfo(
        width=info.width,
        height=info.height,
        fps=info.fps,
        frame_count=info.frame_count or (max(by_frame) + 1),
        variable_frame_rate=variable,
    )
    return DecodedFrames(
        info=resolved,
        scale=scale,
        frames=[by_frame[frame] for frame in sorted(by_frame)],
        warnings=warnings,
    )
