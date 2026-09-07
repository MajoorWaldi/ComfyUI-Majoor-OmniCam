"""Multi-view / video-scan reconstruction support (VGGT-backed)."""

from __future__ import annotations

from .sampling import choose_segmentation_views, uniform_sample_indices
from .types import (
    MultiViewEvidence,
    ViewCameraEvidence,
    ViewSample,
)

__all__ = [
    "MultiViewEvidence",
    "ViewCameraEvidence",
    "ViewSample",
    "choose_segmentation_views",
    "uniform_sample_indices",
]
