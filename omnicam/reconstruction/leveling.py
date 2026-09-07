"""Re-level a reconstructed scene so a confidently-detected floor is horizontal.

The blockout / scan pipelines fit objects in the geometry provider's own frame.
When that frame is tilted (a hand-held photo shot slightly downward), the floor
plane and the box proxies diverge and every object ends up floating at a
constant height. Rather than patch each proxy, one rigid rotation is applied to
*everything* -- points, camera, planes -- so the ground normal becomes world up
and the rest of the pipeline runs in a level frame.

Only applied when the ground is trustworthy and its tilt is in a sane band: a
sub-degree tilt is RANSAC noise (skip), a >``MAX_LEVEL_DEGREES`` tilt is almost
always a mis-detection (skip and keep the raw frame).
"""

from __future__ import annotations

import math
from typing import Any

import numpy as np

#: Ground confidence below which re-levelling is not attempted.
MIN_GROUND_CONFIDENCE = 0.60
#: Tilts outside this band are left alone (noise / mis-detection).
MIN_LEVEL_DEGREES = 1.0
MAX_LEVEL_DEGREES = 30.0

_UP = np.array([0.0, 1.0, 0.0])


def level_rotation_from_normal(
    ground_normal: tuple[float, float, float],
) -> np.ndarray | None:
    """3x3 rotation taking ``ground_normal`` onto world +Y, or ``None`` if the
    tilt is outside the trusted band."""
    n = np.asarray(ground_normal, dtype=np.float64)
    ln = float(np.linalg.norm(n))
    if ln < 1e-9:
        return None
    n = n / ln
    if n[1] < 0:  # normal should point up; flip a floor fitted upside down
        n = -n

    dot = float(np.clip(np.dot(n, _UP), -1.0, 1.0))
    angle = math.degrees(math.acos(dot))
    if angle < MIN_LEVEL_DEGREES or angle > MAX_LEVEL_DEGREES:
        return None

    axis = np.cross(n, _UP)
    axis_len = float(np.linalg.norm(axis))
    if axis_len < 1e-9:
        return None
    axis = axis / axis_len

    theta = math.acos(dot)
    ax, ay, az = axis
    k = np.array([[0.0, -az, ay], [az, 0.0, -ax], [-ay, ax, 0.0]])
    return np.eye(3) + math.sin(theta) * k + (1.0 - math.cos(theta)) * (k @ k)


def apply_rotation_to_points(points: np.ndarray, rot: np.ndarray) -> np.ndarray:
    pts = np.asarray(points, dtype=np.float64)
    flat = pts.reshape(-1, 3) @ rot.T
    return flat.reshape(pts.shape).astype(np.float32, copy=False)


def _rot_vec(rot: np.ndarray, v: Any) -> tuple[float, float, float]:
    out = rot @ np.asarray(v, dtype=np.float64)
    return (float(out[0]), float(out[1]), float(out[2]))


def apply_rotation_to_camera(camera: Any, rot: np.ndarray) -> Any:
    """Return a copy of ``camera`` with its position and target rotated."""
    from .types import ReconstructedCamera

    return ReconstructedCamera(
        fov_x_degrees=camera.fov_x_degrees,
        fov_y_degrees=camera.fov_y_degrees,
        position=_rot_vec(rot, camera.position),
        target=_rot_vec(rot, camera.target),
        near=camera.near,
        far=camera.far,
        scale_mode=camera.scale_mode,
    )


def apply_rotation_to_plane(plane: Any, rot: np.ndarray) -> Any:
    from .types import ReconstructedPlane

    return ReconstructedPlane(
        plane_type=plane.plane_type,
        center=_rot_vec(rot, plane.center),
        normal=_rot_vec(rot, plane.normal),
        size=(float(plane.size[0]), float(plane.size[1])),
        confidence=float(plane.confidence),
        inlier_ratio=float(getattr(plane, "inlier_ratio", 0.0)),
    )


def apply_rotation_to_view_camera(view_cam: Any, rot: np.ndarray) -> Any:
    """Level a multi-view ``ViewCameraEvidence``.

    ``extrinsic_camera_from_world`` maps world -> camera, so a world rotation
    ``p_new = R p_old`` becomes ``E_new = E_old @ R_hom^T``.
    """
    from .multiview.types import ViewCameraEvidence

    e = np.asarray(view_cam.extrinsic_camera_from_world, dtype=np.float64)
    if e.shape == (3, 4):
        e4 = np.eye(4)
        e4[:3, :4] = e
        e = e4
    r_hom = np.eye(4)
    r_hom[:3, :3] = rot
    e_new = e @ r_hom.T
    return ViewCameraEvidence(
        view_index=view_cam.view_index,
        width=view_cam.width,
        height=view_cam.height,
        extrinsic_camera_from_world=e_new,
        intrinsics=np.asarray(view_cam.intrinsics, dtype=np.float64),
        source_frame=view_cam.source_frame,
    )


def level_scan_evidence(
    *,
    points_world: np.ndarray,
    cameras: list[Any],
    planes: list[Any],
    ground: Any | None,
) -> tuple[np.ndarray, list[Any], list[Any], bool]:
    """Re-level a scan: rotate the per-view point maps, every view camera and
    the fitted planes together. Same trust gate as :func:`level_scene`."""
    if ground is None or float(getattr(ground, "confidence", 0.0)) < MIN_GROUND_CONFIDENCE:
        return points_world, cameras, planes, False
    rot = level_rotation_from_normal(tuple(ground.normal))
    if rot is None:
        return points_world, cameras, planes, False
    return (
        apply_rotation_to_points(points_world, rot),
        [apply_rotation_to_view_camera(c, rot) for c in cameras],
        [apply_rotation_to_plane(p, rot) for p in planes],
        True,
    )


def level_scene(
    *,
    points: np.ndarray,
    camera: Any,
    planes: list[Any],
    ground: Any | None,
) -> tuple[np.ndarray, Any, list[Any], bool]:
    """Rotate points / camera / planes into a level frame.

    Returns ``(points, camera, planes, was_levelled)``. When the ground is
    missing, low-confidence or outside the trusted tilt band, the inputs are
    returned unchanged with ``was_levelled=False``.
    """
    if ground is None or float(getattr(ground, "confidence", 0.0)) < MIN_GROUND_CONFIDENCE:
        return points, camera, planes, False
    rot = level_rotation_from_normal(tuple(ground.normal))
    if rot is None:
        return points, camera, planes, False
    return (
        apply_rotation_to_points(points, rot),
        apply_rotation_to_camera(camera, rot),
        [apply_rotation_to_plane(p, rot) for p in planes],
        True,
    )
