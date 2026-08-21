"""Frame interpolation algorithms for retime sampling (nearest, blend)."""

from __future__ import annotations

from typing import Any


def interpolate_frames(frame_a: Any, frame_b: Any, alpha: float, mode: str = "blend") -> Any:
    """Interpolate between two video frames using nearest or blend mode."""
    if frame_a is None:
        return frame_b
    if frame_b is None:
        return frame_a

    clamped_alpha = max(0.0, min(1.0, float(alpha)))

    if mode == "nearest" or clamped_alpha <= 1e-4:
        return frame_a
    if clamped_alpha >= 0.9999:
        return frame_b

    # Tensor / Array blend
    try:
        import torch

        if isinstance(frame_a, torch.Tensor) and isinstance(frame_b, torch.Tensor):
            return torch.lerp(frame_a, frame_b, clamped_alpha)
    except ImportError:
        pass

    try:
        # Fallback numeric/numpy
        return (1.0 - clamped_alpha) * frame_a + clamped_alpha * frame_b
    except Exception:
        return frame_a if clamped_alpha < 0.5 else frame_b
