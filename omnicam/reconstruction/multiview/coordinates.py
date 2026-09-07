"""Bring VGGT cameras + points into OmniCam anchor coordinates.

One global rigid transform, derived from view 0, is applied to everything --
never a per-camera conversion, which is how orbit direction gets mirrored.

OpenCV camera 0:  x right, y down, z forward
OmniCam anchor:   x right, y up,   z backward

The axis flip is a 180-degree rotation about X (``diag(1, -1, -1)``) -- a proper
rotation, det = +1, so no reflection is ever introduced.
"""

from __future__ import annotations

import numpy as np

from .types import OMNICAM_COORDS, MultiViewEvidence, ViewCameraEvidence

#: OpenCV-camera -> OmniCam-camera axis flip, homogeneous.
CV_TO_OMNICAM = np.diag([1.0, -1.0, -1.0, 1.0])


def _as_4x4(extrinsic: object) -> np.ndarray:
    m = np.asarray(extrinsic, dtype=float)
    if m.shape == (4, 4):
        return m.copy()
    if m.shape == (3, 4):
        out = np.eye(4)
        out[:3, :4] = m
        return out
    raise ValueError(f"extrinsic must be 3x4 or 4x4, got {m.shape}")


def anchor_transform(extrinsic0_camera_from_world: object) -> np.ndarray:
    """The world->world rigid transform ``T = F @ E0`` (homogeneous 4x4)."""
    return CV_TO_OMNICAM @ _as_4x4(extrinsic0_camera_from_world)


def _rigid_inv(m: np.ndarray) -> np.ndarray:
    r = m[:3, :3]
    t = m[:3, 3]
    out = np.eye(4)
    out[:3, :3] = r.T
    out[:3, 3] = -r.T @ t
    return out


def transform_points_world(points: np.ndarray, transform: np.ndarray) -> np.ndarray:
    """Apply a homogeneous 4x4 to an ``(..., 3)`` array of world points."""
    pts = np.asarray(points, dtype=float)
    flat = pts.reshape(-1, 3)
    homo = np.concatenate([flat, np.ones((len(flat), 1))], axis=1)
    out = homo @ transform.T
    return out[:, :3].reshape(pts.shape)


def normalize_camera(
    camera: ViewCameraEvidence, transform: np.ndarray
) -> tuple[ViewCameraEvidence, np.ndarray]:
    """Return the camera in OmniCam coords plus its world-space position."""
    e_cv = _as_4x4(camera.extrinsic_camera_from_world)
    e_omni = CV_TO_OMNICAM @ e_cv @ _rigid_inv(transform)
    world_from_cam = _rigid_inv(e_omni)
    position = world_from_cam[:3, 3]
    return (
        ViewCameraEvidence(
            view_index=camera.view_index,
            width=camera.width,
            height=camera.height,
            extrinsic_camera_from_world=e_omni,
            intrinsics=np.asarray(camera.intrinsics, dtype=float),
            source_frame=camera.source_frame,
        ),
        position,
    )


def normalize_vggt_evidence(evidence: MultiViewEvidence) -> MultiViewEvidence:
    """Rewrite ``evidence`` so view 0 is the OmniCam anchor at the origin."""
    if not evidence.cameras:
        return evidence
    transform = anchor_transform(evidence.cameras[0].extrinsic_camera_from_world)

    new_cameras = [normalize_camera(cam, transform)[0] for cam in evidence.cameras]

    new_points = evidence.points_world
    if new_points is not None:
        arr = np.asarray(
            new_points.detach().cpu().numpy() if hasattr(new_points, "detach") else new_points,
            dtype=float,
        )
        new_points = transform_points_world(arr, transform)

    return MultiViewEvidence(
        images=evidence.images,
        depth=evidence.depth,
        depth_confidence=evidence.depth_confidence,
        points_world=new_points,
        point_confidence=evidence.point_confidence,
        cameras=new_cameras,
        provider_id=evidence.provider_id,
        provider_version=evidence.provider_version,
        coordinate_system=OMNICAM_COORDS,
        scale_mode=evidence.scale_mode,
        warnings=list(evidence.warnings),
    )


def camera_world_position(camera: ViewCameraEvidence) -> np.ndarray:
    """World-space position of an already-normalized camera."""
    return _rigid_inv(_as_4x4(camera.extrinsic_camera_from_world))[:3, 3]
