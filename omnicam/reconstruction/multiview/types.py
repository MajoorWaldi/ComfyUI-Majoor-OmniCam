"""Multi-view evidence DTOs.

Dense fields (``images``, ``depth``, ``points_world`` ...) are transient
provider output consumed by fusion/compilation. They never enter MotionScene
JSON or the persisted scan manifest -- only the bounded camera list does.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

OMNICAM_COORDS = "omnicam_x_right_y_up_z_back"
OPENCV_COORDS = "opencv_x_right_y_down_z_forward"


@dataclass(slots=True)
class ViewSample:
    view_index: int
    image: Any
    source_frame: int | None
    width: int
    height: int


@dataclass(slots=True)
class ViewCameraEvidence:
    view_index: int
    width: int
    height: int
    extrinsic_camera_from_world: Any  # 4x4 (or 3x4) OpenCV [R|t]
    intrinsics: Any  # 3x3 pixel intrinsics
    source_frame: int | None = None

    def to_summary(self) -> dict[str, Any]:
        """JSON-light row for the scan manifest (no dense tensors)."""
        import numpy as np

        return {
            "view_index": int(self.view_index),
            "width": int(self.width),
            "height": int(self.height),
            "source_frame": (None if self.source_frame is None else int(self.source_frame)),
            "extrinsic_camera_from_world": np.asarray(
                self.extrinsic_camera_from_world, dtype=float
            ).tolist(),
            "intrinsics": np.asarray(self.intrinsics, dtype=float).tolist(),
        }


@dataclass(slots=True)
class MultiViewEvidence:
    images: Any
    depth: Any
    depth_confidence: Any
    points_world: Any
    point_confidence: Any
    cameras: list[ViewCameraEvidence]
    provider_id: str
    provider_version: str
    coordinate_system: str = OPENCV_COORDS
    scale_mode: str = "relative"
    warnings: list[str] = field(default_factory=list)
