"""Monocular camera-motion extraction for OmniCam.

The package is deliberately isolated from ComfyUI: everything below solves,
converts and filters camera poses with plain Python/NumPy so it can be unit
tested without a running server. ``omnicam/nodes/extractor.py`` is the only
ComfyUI boundary.
"""

from __future__ import annotations

from .types import (
    BackendSolveResult,
    CameraIntrinsics,
    ExtractionResult,
    PoseSample,
    VideoFrameSample,
)

__all__ = [
    "BackendSolveResult",
    "CameraIntrinsics",
    "ExtractionResult",
    "PoseSample",
    "VideoFrameSample",
]
