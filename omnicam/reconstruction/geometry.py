"""Bounded 3D proxy mesh generation and decimation control."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

import torch

from .coordinates import flip_winding, opencv_points_to_omnicam
from .settings import QUALITY_PRESETS, ReconstructionSettings
from .types import GeometryEvidence


class MeshTooLargeError(ValueError):
    """The generated mesh exceeds the allowed triangle budget."""


class EmptyGeometryError(ValueError):
    """The provider generated no valid vertices or faces."""


@dataclass(slots=True)
class ProxyMesh:
    vertices: torch.Tensor
    faces: torch.Tensor
    uvs: torch.Tensor | None = None
    texture: Any = None
    triangle_count: int = 0


def build_proxy_mesh(
    evidence: GeometryEvidence,
    settings: ReconstructionSettings,
    *,
    batch_index: int = 0,
    triangulate_fn: Callable[..., Any] | None = None,
) -> ProxyMesh:
    """Triangulate evidence point map into a bounded proxy mesh with adaptive decimation."""
    if evidence.points is None:
        raise EmptyGeometryError("GeometryEvidence contains no 3D points")

    points = evidence.points
    if isinstance(points, torch.Tensor):
        if points.ndim == 4:
            if batch_index >= points.shape[0]:
                raise IndexError(f"batch_index {batch_index} out of range ({points.shape[0]})")
            pts = points[batch_index]
        elif points.ndim == 3:
            pts = points
        else:
            raise ValueError(f"Expected 3D or 4D points tensor, got shape {tuple(points.shape)}")
    else:
        pts = torch.as_tensor(points)

    edge_depth = None
    if evidence.depth is not None:
        depth = evidence.depth
        if isinstance(depth, torch.Tensor) and depth.ndim == 3:
            edge_depth = depth[batch_index] if batch_index < depth.shape[0] else None
        else:
            edge_depth = depth

    if triangulate_fn is None:
        try:
            from comfy.ldm.moge.geometry import triangulate_grid_mesh

            triangulate_fn = triangulate_grid_mesh
        except Exception as exc:  # pragma: no cover
            raise RuntimeError(f"Could not import comfy.ldm.moge.geometry.triangulate_grid_mesh: {exc}") from exc

    preset = QUALITY_PRESETS.get(settings.quality, {})
    initial_decimation = int(preset.get("initial_decimation", 1))
    discontinuity = float(settings.discontinuity_threshold)
    budget = int(settings.triangle_budget)

    decimation = max(1, initial_decimation)
    verts = None
    faces = None
    uvs = None

    while True:
        verts, faces, uvs = triangulate_fn(
            pts,
            decimation=decimation,
            discontinuity_threshold=discontinuity,
            depth=edge_depth,
        )
        if verts.shape[0] == 0 or faces.shape[0] == 0:
            raise EmptyGeometryError("Triangulation produced an empty mesh; check discontinuity_threshold")

        tri_count = int(faces.shape[0])
        if tri_count <= budget:
            break

        if decimation >= 8:
            raise MeshTooLargeError(
                f"Generated mesh has {tri_count} triangles, exceeding budget {budget} even at maximum decimation (8)"
            )

        decimation += 1

    # Apply coordinate conversion if evidence is in OpenCV convention
    if evidence.coordinate_system == "opencv_x_right_y_down_z_forward":
        verts = opencv_points_to_omnicam(verts)
        faces = flip_winding(faces)

    # Apply scene scale
    scale = float(settings.scene_scale)
    if scale != 1.0:
        verts = verts * scale

    # Resolve texture
    texture = None
    if settings.source_texture and evidence.image is not None:
        img = evidence.image
        if isinstance(img, torch.Tensor) and img.ndim == 4:
            texture = img[batch_index : batch_index + 1] if batch_index < img.shape[0] else img[:1]
        else:
            texture = img

    return ProxyMesh(
        vertices=verts,
        faces=faces,
        uvs=uvs,
        texture=texture,
        triangle_count=int(faces.shape[0]),
    )
