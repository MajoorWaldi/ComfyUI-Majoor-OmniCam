"""Resolve multi-view scan input into a bounded list of ``ViewSample``.

Image batches and video are kept on separate code paths so the image-only
security assumptions (no arbitrary paths, managed roots only) are never
weakened by the video path.
"""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

import numpy as np

from ..errors import ReconSourceInvalidError, ReconSourceUnsupportedError
from .sampling import uniform_sample_indices
from .types import ViewSample

VIDEO_EXTENSIONS = frozenset({".mp4", ".mov", ".mkv", ".webm", ".avi"})


def _to_bhwc(images: Any) -> np.ndarray:
    arr = images.detach().cpu().numpy() if hasattr(images, "detach") else np.asarray(images)
    arr = np.asarray(arr)
    if arr.ndim == 3:  # H, W, C -> single frame
        arr = arr[None, ...]
    if arr.ndim != 4:
        raise ReconSourceInvalidError(f"IMAGE batch must be 3D or 4D, got shape {arr.shape}")
    return arr


def image_batch_fingerprint(images: Any) -> str:
    """Order-sensitive digest of the pixel bytes -- part of the cache key."""
    arr = _to_bhwc(images)
    digest = hashlib.sha256()
    digest.update(str(arr.shape).encode())
    digest.update(np.ascontiguousarray(arr).tobytes())
    return digest.hexdigest()[:20]


def sample_image_batch(images: Any, *, max_views: int) -> list[ViewSample]:
    """Uniformly pick up to ``max_views`` frames from a queued IMAGE batch.

    Original per-view dimensions are preserved. No file is written here; the
    tensor already lives in managed ComfyUI memory.
    """
    arr = _to_bhwc(images)
    count = arr.shape[0]
    if count == 0:
        raise ReconSourceInvalidError("IMAGE batch is empty")
    indices = uniform_sample_indices(count, max_views)
    samples: list[ViewSample] = []
    for view_index, frame in enumerate(indices):
        img = arr[frame]
        samples.append(
            ViewSample(
                view_index=view_index,
                image=img,
                source_frame=int(frame),
                width=int(img.shape[1]),
                height=int(img.shape[0]),
            )
        )
    return samples


def _resolve_managed_video(value: str, roots: list[Path]) -> Path:
    raw = Path(str(value).split(" [")[0].strip())
    if raw.is_absolute() or ".." in raw.parts:
        raise ReconSourceInvalidError("video reference must be a managed relative path")
    for root in roots:
        candidate = (root / raw).resolve()
        try:
            candidate.relative_to(root.resolve())
        except ValueError:
            continue
        if candidate.is_file():
            return candidate
    raise ReconSourceInvalidError(f"managed video {value!r} was not found under an allowed root")


def sample_video_scan(
    value: str,
    *,
    roots: list[Path],
    max_views: int,
) -> list[ViewSample]:
    """Decode only the selected frames of a managed video into RGB arrays."""
    path = _resolve_managed_video(value, roots)
    if path.suffix.lower() not in VIDEO_EXTENSIONS:
        raise ReconSourceUnsupportedError(
            f"video extension {path.suffix!r} is not one of {sorted(VIDEO_EXTENSIONS)}"
        )
    try:
        import av
    except ImportError as exc:  # pragma: no cover - PyAV present in the scan CI job
        raise ReconSourceUnsupportedError("PyAV is required to read video scans") from exc

    with av.open(str(path)) as container:
        stream = container.streams.video[0]
        total = stream.frames or 0
        if total <= 0:
            # Fall back to a decode-count pass for containers without frame counts.
            total = sum(1 for _ in container.decode(video=0))
            container.seek(0)
        wanted = set(uniform_sample_indices(total, max_views))
        samples: list[ViewSample] = []
        for frame_index, frame in enumerate(container.decode(video=0)):
            if frame_index not in wanted:
                continue
            rgb = frame.to_ndarray(format="rgb24")
            samples.append(
                ViewSample(
                    view_index=len(samples),
                    image=rgb,
                    source_frame=frame_index,
                    width=int(rgb.shape[1]),
                    height=int(rgb.shape[0]),
                )
            )
            if len(samples) == len(wanted):
                break
    if not samples:
        raise ReconSourceInvalidError("no frames could be decoded from the video scan")
    return samples
