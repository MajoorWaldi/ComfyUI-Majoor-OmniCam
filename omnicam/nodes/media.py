"""One socket that accepts a ComfyUI ``VIDEO`` or an ``IMAGE`` batch.

Every OmniCam media socket is a ``MultiType`` union rather than a single type,
because the footage a camera track describes reaches a graph both ways: as a
decoded clip from a loader, and as the frame batch a generator just produced.
Forcing an ``ImageToVideo`` node in between bought nothing -- the conversion is
mechanical -- so it happens here instead, once, at the node boundary.

The coercions are deliberately asymmetric:

* an ``IMAGE`` becomes a VIDEO in memory, with no file behind it;
* a VIDEO becomes an ``IMAGE`` by *sampling*, never by decoding the whole clip;
* the extractor needs a real file to seek in, so :func:`solve_source` encodes an
  ``IMAGE`` batch into ComfyUI's managed temp storage before solving it.

A bare ``IMAGE`` batch carries no timing, so :data:`DEFAULT_IMAGE_FPS` names the
rate one is read at. A node that already knows the graph's frame rate should
pass its own.
"""

from __future__ import annotations

from fractions import Fraction
from typing import Any

import torch
from comfy_api.latest import IO, InputImpl, VideoComponents

from ..core.video_sampling import sample_video_frames
from ..extractor.materialize import materialize_video_reference
from .base import resolve_video

#: The union every OmniCam media socket declares, in socket-type order.
MEDIA_TYPES = [IO.Video, IO.Image]

#: The rate an ``IMAGE`` batch is read at when the node knows no better.
DEFAULT_IMAGE_FPS = 24.0

#: Frames sampled from a VIDEO when a caller asks for images without a budget.
DEFAULT_IMAGE_SAMPLE = 32


def media_input(id: str, **kwargs) -> IO.MultiType.Input:
    """Declare a socket that takes either a VIDEO or an IMAGE batch."""
    return IO.MultiType.Input(id, MEDIA_TYPES, **kwargs)


def is_image_batch(value: Any) -> bool:
    """True for an ``IMAGE`` tensor, false for a VIDEO or for nothing."""
    return isinstance(value, torch.Tensor)


def as_video(value: Any, *, fps: float = DEFAULT_IMAGE_FPS):
    """Return ``value`` as a ComfyUI VIDEO, wrapping an IMAGE batch in memory."""
    if value is None:
        return None
    if not is_image_batch(value):
        return value
    images = value if value.ndim == 4 else value.unsqueeze(0)
    return InputImpl.VideoFromComponents(
        VideoComponents(images=images, frame_rate=Fraction(float(fps)).limit_denominator(100000)),
    )


def as_image_batch(value: Any, *, max_frames: int = DEFAULT_IMAGE_SAMPLE,
                   mode: str = "uniform") -> torch.Tensor | None:
    """Return ``value`` as an IMAGE batch, sampling a VIDEO rather than decoding it."""
    if value is None:
        return None
    if is_image_batch(value):
        images = value if value.ndim == 4 else value.unsqueeze(0)
        return images if max_frames <= 0 or images.shape[0] <= max_frames else images[:max_frames]
    return sample_video_frames(value, max_frames=max_frames, mode=mode)


def image_twin(video: Any, *, max_frames: int = DEFAULT_IMAGE_SAMPLE):
    """A best-effort IMAGE sample of a graph's VIDEO output, never a crash.

    Several OmniCam nodes emit an IMAGE twin next to a VIDEO output so a graph
    can take frames without a conversion node in between. That twin is
    cosmetic: a placeholder value or an undecodable clip must not abort the
    execution that already produced the VIDEO output it mirrors.
    """
    if video is None:
        return None
    try:
        return as_image_batch(video, max_frames=max_frames)
    except Exception:  # noqa: BLE001 - a sampling failure degrades to no twin
        return None


def solve_source(value: Any, *, fps: float = DEFAULT_IMAGE_FPS):
    """Return ``(video, annotated_reference)`` for a solve that needs a real file.

    The extractor seeks inside its source, so an ``IMAGE`` batch cannot be
    solved where it lives: it is encoded into ComfyUI temp first, and the solve
    reads the same managed file the browser will preview.
    """
    if value is None:
        return None, ""
    reference = materialize_video_reference(as_video(value, fps=fps))
    if not is_image_batch(value):
        return value, reference
    encoded = resolve_video(reference)
    if encoded is None:
        raise ValueError("The connected IMAGE batch could not be encoded into a solvable video")
    return encoded, reference
