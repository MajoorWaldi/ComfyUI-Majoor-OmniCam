"""Memory-bounded frame sampling for ComfyUI ``VIDEO`` inputs.

The sampling plan is computed from VIDEO metadata before any pixels are
decoded.  Each uniform sample is trimmed to one source-frame interval so a
file-backed VideoInput can seek instead of materialising the full clip.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    import torch


@dataclass(frozen=True, slots=True)
class VideoMetadata:
    frame_count: int
    frame_rate: float
    width: int
    height: int


def inspect_video(video: Any) -> VideoMetadata:
    """Read the current ComfyUI VIDEO metadata contract without decoding."""
    fps = max(1e-6, float(video.get_frame_rate()))
    frame_count = max(0, int(video.get_frame_count()))
    width, height = video.get_dimensions()
    return VideoMetadata(frame_count, fps, int(width), int(height))


def sampling_indices(total: int, start_frame: int, end_frame: int, max_frames: int,
                     mode: str) -> list[int]:
    if total <= 0:
        return []
    start = min(max(0, int(start_frame)), total - 1)
    stop = total if int(end_frame) <= 0 else min(total, max(start + 1, int(end_frame) + 1))
    count = min(max(1, int(max_frames)), stop - start)
    if mode != "uniform" or count >= stop - start:
        return list(range(start, start + count))
    if count == 1:
        return [start]
    span = stop - start - 1
    return [start + round(index * span / (count - 1)) for index in range(count)]


def resampling_indices(
    total_frames: int,
    source_fps: float,
    target_fps: float,
    *,
    max_seconds: float | None = None,
    max_frames: int | None = None,
) -> list[int]:
    """Map a source clip onto a duration-preserving target frame clock."""
    if total_frames <= 0:
        return []
    if source_fps <= 0 or target_fps <= 0:
        raise ValueError("frame rates must be positive")
    duration = total_frames / source_fps
    if max_seconds is not None:
        duration = min(duration, max(0.0, float(max_seconds)))
    target_count = max(1, round(duration * target_fps))
    if max_frames is not None:
        target_count = min(target_count, max(1, int(max_frames)))
    return [
        min(total_frames - 1, round(index * source_fps / target_fps))
        for index in range(target_count)
    ]


def contiguous_ranges(indices: list[int]) -> list[tuple[int, int]]:
    """Return inclusive start / exclusive stop ranges covering unique sorted indices."""
    if not indices:
        return []
    unique = sorted(list(set(indices)))
    ranges = []
    start = unique[0]
    for i in range(1, len(unique)):
        if unique[i] != unique[i-1] + 1:
            ranges.append((start, unique[i-1] + 1))
            start = unique[i]
    ranges.append((start, unique[-1] + 1))
    return ranges


def _decode_trim(video: Any, start_frame: int, frame_count: int, fps: float) -> torch.Tensor:
    trimmed = video.as_trimmed(
        start_time=float(start_frame) / fps,
        duration=max(1, int(frame_count)) / fps,
        strict_duration=False,
    )
    return trimmed.get_components().images[:frame_count]


def sample_video_frames(video: Any, *, start_frame: int = 0, end_frame: int = 0,
                        max_frames: int = 32, mode: str = "uniform") -> torch.Tensor:
    """Decode only the planned source ranges and return an IMAGE batch."""
    import torch

    metadata = inspect_video(video)
    indices = sampling_indices(
        metadata.frame_count, start_frame, end_frame, max_frames, mode
    )
    if not indices:
        return torch.empty((0, metadata.height, metadata.width, 3), dtype=torch.float32)
    if mode != "uniform" or indices == list(range(indices[0], indices[0] + len(indices))):
        return _decode_trim(video, indices[0], len(indices), metadata.frame_rate)
    batches = [_decode_trim(video, frame, 1, metadata.frame_rate) for frame in indices]
    batches = [batch for batch in batches if batch.shape[0]]
    if not batches:
        return torch.empty((0, metadata.height, metadata.width, 3), dtype=torch.float32)
    return torch.cat(batches, dim=0)


def resample_video_frames(
    video: Any,
    *,
    target_fps: float,
    max_seconds: float | None = None,
    max_frames: int | None = None,
) -> torch.Tensor:
    """Decode a VIDEO on a new clock while preserving its elapsed duration."""
    import torch

    metadata = inspect_video(video)
    indices = resampling_indices(
        metadata.frame_count,
        metadata.frame_rate,
        target_fps,
        max_seconds=max_seconds,
        max_frames=max_frames,
    )
    if not indices:
        return torch.empty((0, metadata.height, metadata.width, 3), dtype=torch.float32)

    ranges = contiguous_ranges(indices)
    frame_to_out: dict[int, list[int]] = {}
    for out_idx, src_idx in enumerate(indices):
        frame_to_out.setdefault(src_idx, []).append(out_idx)

    out = torch.empty((len(indices), metadata.height, metadata.width, 3), dtype=torch.float32)

    for r_start, r_stop in ranges:
        count = r_stop - r_start
        batch = _decode_trim(video, r_start, count, metadata.frame_rate)
        for i in range(batch.shape[0]):
            src_idx = r_start + i
            if src_idx in frame_to_out:
                for out_idx in frame_to_out[src_idx]:
                    out[out_idx].copy_(batch[i])

    return out

