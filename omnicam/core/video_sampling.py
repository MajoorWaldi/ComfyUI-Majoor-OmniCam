"""Memory-bounded frame sampling for ComfyUI ``VIDEO`` inputs.

The sampling plan is computed from VIDEO metadata before any pixels are
decoded.  Each uniform sample is trimmed to one source-frame interval so a
file-backed VideoInput can seek instead of materialising the full clip.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

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
