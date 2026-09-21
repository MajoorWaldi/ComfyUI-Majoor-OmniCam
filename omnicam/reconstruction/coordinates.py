"""Coordinate basis conversion and intrinsics projection math."""

from __future__ import annotations

import math
from typing import Any

import numpy as np


def evidence_points_omnicam(evidence: Any) -> np.ndarray:
    """A ``GeometryEvidence``'s point map as a plain OmniCam-frame array.

    Used wherever a pipeline needs the raw points just to detect a ground
    plane / leveling rotation, decoupled from whatever a geometry-specific
    consumer (mesh triangulation, blockout fitting) does with the same
    evidence.
    """
    pts = evidence.points
    if hasattr(pts, "detach"):
        pts = pts.detach().cpu()
    arr = np.asarray(pts)
    if arr.ndim == 4:
        arr = arr[0]
    if evidence.coordinate_system == "opencv_x_right_y_down_z_forward":
        converted = opencv_points_to_omnicam(evidence.points)
        if hasattr(converted, "detach"):
            converted = converted.detach().cpu().numpy()
        converted = np.asarray(converted)
        if converted.ndim == 4:
            converted = converted[0]
        return converted.astype(np.float32, copy=False)
    return arr.astype(np.float32, copy=False)


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
