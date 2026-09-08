"""Ground-relative oriented bounding box fitting.

Yaw-only: the box stays upright (its local Y is world up) and only rotates
around the vertical axis. Unconstrained 3D PCA is deliberately avoided -- on a
noisy masked chair or table it happily returns a tilted box, which then renders
as furniture leaning into the floor.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

_UP = np.array([0.0, 1.0, 0.0])


@dataclass(slots=True)
class RobustObb:
    center: np.ndarray  # (3,) world-space, y = mid-height
    size: np.ndarray  # (3,) full extents along local (x=width, y=height, z=depth)
    yaw_degrees: float  # rotation about world up, degrees
    planar_anisotropy: float  # 0..1, how elongated the ground footprint is
    sample_count: int


def _percentile_extent(values: np.ndarray, lo: float = 5.0, hi: float = 95.0) -> tuple[float, float]:
    p_lo = float(np.percentile(values, lo))
    p_hi = float(np.percentile(values, hi))
    return p_lo, p_hi


def fit_ground_relative_obb(points: np.ndarray, up: tuple[float, float, float] = (0.0, 1.0, 0.0)) -> RobustObb:
    """Fit an upright, yaw-only oriented box to ``points`` (``(N, 3)``).

    ``up`` is accepted for symmetry with the rest of the pipeline but the fit
    assumes a world already rotated so up is +Y (OmniCam anchor convention);
    a non-Y ``up`` is treated as +Y.
    """
    pts = np.asarray(points, dtype=np.float64)
    if pts.ndim != 2 or pts.shape[1] != 3:
        raise ValueError(f"points must be (N, 3); got {pts.shape}")
    if len(pts) < 3:
        raise ValueError("need at least 3 points to fit an OBB")
    del up  # see docstring

    xz = pts[:, [0, 2]]
    center2 = np.median(xz, axis=0)
    centered = xz - center2

    cov = np.cov(centered.T)
    values, vectors = np.linalg.eigh(cov)
    order = np.argsort(values)[::-1]
    major = vectors[:, order[0]]
    major_val = float(values[order[0]])
    minor_val = float(values[order[1]])

    # atan2(dx, dz): yaw measured from +Z toward +X, matching wall_yaw_from_normal.
    yaw = math.degrees(math.atan2(major[0], major[1]))

    cos_y = math.cos(math.radians(yaw))
    sin_y = math.sin(math.radians(yaw))
    # Rotate footprint into the local frame (inverse yaw).
    local_x = centered[:, 0] * cos_y - centered[:, 1] * sin_y
    local_z = centered[:, 0] * sin_y + centered[:, 1] * cos_y

    x_lo, x_hi = _percentile_extent(local_x)
    z_lo, z_hi = _percentile_extent(local_z)
    y_lo, y_hi = _percentile_extent(pts[:, 1])

    width = max(x_hi - x_lo, 1e-6)
    depth = max(z_hi - z_lo, 1e-6)
    height = max(y_hi - y_lo, 1e-6)

    # Local-frame centre offset back to world.
    local_cx = 0.5 * (x_lo + x_hi)
    local_cz = 0.5 * (z_lo + z_hi)
    world_cx = center2[0] + (local_cx * cos_y + local_cz * sin_y)
    world_cz = center2[1] + (-local_cx * sin_y + local_cz * cos_y)
    center = np.array([world_cx, 0.5 * (y_lo + y_hi), world_cz])

    total = major_val + minor_val
    anisotropy = 0.0 if total <= 1e-12 else float((major_val - minor_val) / total)

    return RobustObb(
        center=center,
        size=np.array([width, height, depth]),
        yaw_degrees=float(yaw),
        planar_anisotropy=max(0.0, min(1.0, anisotropy)),
        sample_count=len(pts),
    )
