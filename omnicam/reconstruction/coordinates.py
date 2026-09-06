"""Coordinate basis conversion and intrinsics projection math."""

from __future__ import annotations

import math
from typing import Any


def opencv_points_to_omnicam(points: Any) -> Any:
    """Convert points from OpenCV coordinate system (X right, Y down, Z forward)
    to OmniCam/glTF coordinate system (X right, Y up, Z back).
    """
    if hasattr(points, "clone"):
        converted = points.clone()
    elif hasattr(points, "copy"):
        converted = points.copy()
    else:
        import numpy as np

        converted = np.array(points, copy=True)
    converted[..., 1] *= -1
    converted[..., 2] *= -1
    return converted


def flip_winding(faces: Any) -> Any:
    """Flip triangle vertex winding order (CCW <-> CW)."""
    return faces[..., [0, 2, 1]]


def fov_from_intrinsics(k: Any, *, width: float, height: float) -> tuple[float, float]:
    """Derive horizontal (fov_x) and vertical (fov_y) field of view in degrees
    from camera intrinsic matrix [[fx, 0, cx], [0, fy, cy], [0, 0, 1]].
    """
    fx = float(k[0][0])
    fy = float(k[1][1])
    if fx <= 0.0 or fy <= 0.0:
        raise ValueError(f"Intrinsics focal lengths must be positive, got fx={fx}, fy={fy}")
    if width <= 0.0 or height <= 0.0:
        raise ValueError(f"Image dimensions must be positive, got width={width}, height={height}")
    fov_x = math.degrees(2.0 * math.atan(width / (2.0 * fx)))
    fov_y = math.degrees(2.0 * math.atan(height / (2.0 * fy)))
    return fov_x, fov_y
