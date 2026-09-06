"""Source camera reconstruction from geometry evidence intrinsics."""

from __future__ import annotations

import torch

from omnicam.reconstruction.coordinates import fov_from_intrinsics
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import GeometryEvidence, ReconstructedCamera

DEFAULT_FOV_DEGREES = 53.0


def reconstruct_camera_from_evidence(
    evidence: GeometryEvidence,
    settings: ReconstructionSettings,
    *,
    width: float = 1280.0,
    height: float = 720.0,
    batch_index: int = 0,
) -> ReconstructedCamera:
    """Reconstruct single-image source camera at origin pointing down -Z."""
    fov_x = DEFAULT_FOV_DEGREES
    fov_y = DEFAULT_FOV_DEGREES

    w = width
    h = height
    if evidence.image is not None and isinstance(evidence.image, torch.Tensor):
        if evidence.image.ndim == 4:
            h = float(evidence.image.shape[1])
            w = float(evidence.image.shape[2])
        elif evidence.image.ndim == 3:
            h = float(evidence.image.shape[0])
            w = float(evidence.image.shape[1])
    elif evidence.points is not None and isinstance(evidence.points, torch.Tensor):
        if evidence.points.ndim == 4:
            h = float(evidence.points.shape[1])
            w = float(evidence.points.shape[2])
        elif evidence.points.ndim == 3:
            h = float(evidence.points.shape[0])
            w = float(evidence.points.shape[1])

    if settings.recover_fov and evidence.intrinsics is not None:
        intrinsics = evidence.intrinsics
        if isinstance(intrinsics, torch.Tensor) and intrinsics.ndim == 3:
            k = intrinsics[batch_index] if batch_index < intrinsics.shape[0] else intrinsics[0]
        else:
            k = intrinsics
        try:
            fov_x, fov_y = fov_from_intrinsics(k, width=w, height=h)
        except (ValueError, TypeError, IndexError, ZeroDivisionError):
            fov_x = DEFAULT_FOV_DEGREES
            fov_y = DEFAULT_FOV_DEGREES

    scale_mode = "metric_prediction" if evidence.scale_mode == "metric_prediction" else "relative"

    return ReconstructedCamera(
        position=(0.0, 0.0, 0.0),
        target=(0.0, 0.0, -1.0),
        fov_x_degrees=float(fov_x),
        fov_y_degrees=float(fov_y),
        near=0.01,
        far=10000.0,
        scale_mode=scale_mode,
    )
