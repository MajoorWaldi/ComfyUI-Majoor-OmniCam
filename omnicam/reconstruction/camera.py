"""Source camera reconstruction from geometry evidence intrinsics."""

from __future__ import annotations

import torch

from .coordinates import fov_from_intrinsics
from .settings import ReconstructionSettings
from .types import GeometryEvidence, ReconstructedCamera

DEFAULT_FOV_DEGREES = 53.0


def resolve_source_dimensions(
    evidence: GeometryEvidence,
    *,
    default_width: float = 1280.0,
    default_height: float = 720.0,
) -> tuple[float, float]:
    """The source photo's actual pixel dimensions, read off the evidence tensors.

    Falls back to the batched-guess defaults only when neither the image nor
    the point map is a tensor -- a fake/test provider, say. Shared by camera
    reconstruction (which needs it to un-normalize intrinsics) and the scene
    builder (which needs it so the canvas matches the photo instead of always
    landing on a 1280x720 landscape default).
    """
    w = default_width
    h = default_height
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
    return w, h


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

    w, h = resolve_source_dimensions(evidence, default_width=width, default_height=height)

    if settings.recover_fov and evidence.intrinsics is not None:
        intrinsics = evidence.intrinsics
        if isinstance(intrinsics, torch.Tensor) and intrinsics.ndim == 3:
            k = intrinsics[batch_index] if batch_index < intrinsics.shape[0] else intrinsics[0]
        else:
            k = intrinsics
        # Normalized intrinsics describe a unit image plane, so the projection
        # width and height are 1.0 rather than the pixel dimensions.
        k_width, k_height = (1.0, 1.0) if evidence.normalized_intrinsics else (w, h)
        try:
            fov_x, fov_y = fov_from_intrinsics(k, width=k_width, height=k_height)
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
