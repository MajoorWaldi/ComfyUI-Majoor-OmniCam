"""Depth-mesh reconstruction orchestrator.

This is the historical single-image MoGe path: geometry inference -> proxy mesh
-> camera + planes -> GLB asset -> MotionScene. The mesh, camera and planes are
then re-levelled and recentred exactly like the blockout/scan pipelines
(see ``..leveling``), so the Source Camera ends up anchored to the recovered
floor on Director's grid instead of always sitting at the raw evidence origin.
"""

from __future__ import annotations

import time
from collections.abc import Callable
from pathlib import Path
from typing import Any

import numpy as np
import torch

from ..asset_writer import write_reconstruction_assets
from ..cache import CacheEntry, lookup_cache, write_cache_manifest
from ..camera import reconstruct_camera_from_evidence, resolve_source_dimensions
from ..coordinates import evidence_points_omnicam
from ..errors import (
    ReconCancelledError,
    ReconEmptyGeometryError,
    ReconInferenceFailedError,
    ReconMeshTooLargeError,
    ReconSourceInvalidError,
)
from ..fingerprint import compute_reconstruction_fingerprint
from ..geometry import EmptyGeometryError, MeshTooLargeError, build_proxy_mesh
from ..leveling import level_rotation_from_normal, level_scene, recenter_scene
from ..planes import detect_planes, scale_planes
from ..providers.base import CancelToken, ProgressSink, ReconstructionProvider
from ..scene_builder import build_reconstructed_scene
from ..settings import ReconstructionSettings
from ..source import ReconstructionSourceResolutionError, resolve_reconstruction_source
from ..types import (
    ReconstructedAsset,
    ReconstructedCamera,
    ReconstructionMetrics,
    ReconstructionResult,
    ReconstructionSource,
)
from .base import (
    GpuContentionGuard,
    PipelineOutput,
    geometry_provider_version,
    hash_source_file,
    make_progress_gate,
)


def run_depth_mesh_pipeline(
    *,
    source: ReconstructionSource,
    settings: ReconstructionSettings,
    provider: ReconstructionProvider,
    progress: ProgressSink | None = None,
    cancel: CancelToken | None = None,
    input_root: Path | str | None = None,
    triangulate_fn: Callable[..., Any] | None = None,
    save_glb_fn: Callable[..., Any] | None = None,
    gpu_guard: GpuContentionGuard | None = None,
) -> PipelineOutput:
    start_time = time.time()
    report, _check_cancel = make_progress_gate(progress, cancel, gpu_guard)

    report("PREPARING", 0.02, "Resolving source image")

    try:
        resolved_path = resolve_reconstruction_source(
            source,
            roots=[Path(input_root).resolve()] if input_root is not None else None,
        )
    except ReconstructionSourceResolutionError as exc:
        raise ReconSourceInvalidError(str(exc)) from exc

    try:
        source_fp = hash_source_file(resolved_path)
    except OSError as exc:
        raise ReconSourceInvalidError(f"Cannot read image file {resolved_path}: {exc}") from exc

    fp = compute_reconstruction_fingerprint(
        source_fingerprint=source_fp,
        provider=provider.provider_id,
        settings=settings,
    )

    report("PREPARING", 0.08, "Checking reconstruction cache")

    # Key the cache on the checkpoint settings.checkpoint actually selects, not
    # whichever one folder_paths happens to list first.
    provider_version = geometry_provider_version(provider, settings)

    cached = lookup_cache(
        fingerprint=fp,
        provider=provider.provider_id,
        provider_version=provider_version,
        input_root=input_root,
    )
    if cached is not None and "motion_scene" in cached.summary:
        report("FINALIZING", 1.0, "Reconstruction loaded from cache")
        return PipelineOutput(
            motion_scene=cached.summary["motion_scene"],
            summary=cached.summary,
            warnings=list(cached.summary.get("warnings", [])),
            fingerprint=fp,
        )

    if gpu_guard is not None:
        gpu_guard.arm()
    report("INFER_GEOMETRY", 0.10, "Starting geometry estimation")

    def inference_progress(_stage: str, sub_pct: float, sub_msg: str) -> None:
        scaled = 0.10 + sub_pct * (0.52 - 0.10)
        report("INFER_GEOMETRY", min(0.52, max(0.10, scaled)), sub_msg)

    try:
        evidence = provider.reconstruct(
            source=source,
            settings=settings,
            progress=inference_progress,
            cancel=cancel,
        )
    except RuntimeError as exc:
        if "cancelled" in str(exc).lower():
            raise ReconCancelledError("Inference cancelled") from exc
        raise ReconInferenceFailedError(f"Inference failed: {exc}") from exc

    if evidence is None or evidence.points is None:
        raise ReconEmptyGeometryError("Provider returned empty 3D geometry points")

    report("BUILD_MESH", 0.55, "Building proxy mesh")
    try:
        proxy_mesh = build_proxy_mesh(
            evidence=evidence,
            settings=settings,
            triangulate_fn=triangulate_fn,
        )
    except EmptyGeometryError as exc:
        raise ReconEmptyGeometryError(str(exc)) from exc
    except MeshTooLargeError as exc:
        raise ReconMeshTooLargeError(str(exc)) from exc

    report("BUILD_MESH", 0.68, f"Mesh generated ({proxy_mesh.triangle_count} triangles)")

    report("ANALYZE_LAYOUT", 0.72, "Reconstructing camera and detecting layout")
    camera = reconstruct_camera_from_evidence(evidence, settings)
    source_width, source_height = resolve_source_dimensions(evidence)
    planes = scale_planes(detect_planes(evidence, settings, seed=fp), settings.scene_scale)

    # scene_scale as one similarity about the origin on the camera + the points
    # used to detect the ground, matching the mesh's own internal scaling in
    # build_proxy_mesh and the planes already scaled above.
    scale = float(settings.scene_scale)
    points_omnicam = evidence_points_omnicam(evidence)
    if scale > 0 and abs(scale - 1.0) > 1e-9:
        points_omnicam = (points_omnicam.astype(np.float64) * scale).astype(np.float32)
        camera = ReconstructedCamera(
            fov_x_degrees=camera.fov_x_degrees,
            fov_y_degrees=camera.fov_y_degrees,
            position=tuple(float(v) * scale for v in camera.position),
            target=tuple(float(v) * scale for v in camera.target),
            near=camera.near,
            far=camera.far,
            scale_mode=camera.scale_mode,
        )
    ground_plane = next((p for p in planes if p.plane_type == "ground"), None)

    # Re-level (a confident, gently-tilted floor becomes world-horizontal) and
    # recentre (the floor drops onto Director's grid at the origin) the camera
    # and planes exactly like the blockout/scan pipelines (see ..leveling).
    # The environment mesh keeps its own vertices in the raw evidence frame
    # until here; the identical rigid transform is applied to it below so it
    # stays superimposed on the camera instead of the Source Camera always
    # sitting at literal (0, 0, 0) regardless of the photo.
    _pre_level_ground = ground_plane
    _, camera, planes, was_levelled = level_scene(
        points=points_omnicam, camera=camera, planes=planes, ground=ground_plane
    )
    level_rot = (
        level_rotation_from_normal(tuple(_pre_level_ground.normal))
        if was_levelled and _pre_level_ground is not None
        else None
    )
    if was_levelled:
        ground_plane = next((p for p in planes if p.plane_type == "ground"), None)
    _, camera, planes, recenter_offset = recenter_scene(
        points=points_omnicam, camera=camera, planes=planes, ground=ground_plane
    )

    ground_plane = next((p for p in planes if p.plane_type == "ground"), None)
    ground_conf = ground_plane.confidence if ground_plane else 0.0

    if level_rot is not None:
        rot_t = torch.as_tensor(level_rot, dtype=proxy_mesh.vertices.dtype)
        proxy_mesh.vertices = proxy_mesh.vertices @ rot_t.T
        if proxy_mesh.normals is not None:
            proxy_mesh.normals = proxy_mesh.normals @ rot_t.T
    if np.any(np.abs(recenter_offset) > 1e-6):
        offset_t = torch.as_tensor(recenter_offset, dtype=proxy_mesh.vertices.dtype)
        proxy_mesh.vertices = proxy_mesh.vertices + offset_t

    report("SAVE_ASSETS", 0.84, "Saving bounded GLB environment proxy")
    asset_summary = {
        "provider": provider.provider_id,
        "provider_version": provider_version,
        "triangles": proxy_mesh.triangle_count,
        "confidence": evidence.confidence,
    }
    annotated_asset, _, _ = write_reconstruction_assets(
        fingerprint=fp,
        mesh=proxy_mesh,
        summary=asset_summary,
        input_root=input_root,
        save_glb_fn=save_glb_fn,
    )

    env_asset = ReconstructedAsset(
        role="environment",
        asset_path=annotated_asset,
        triangle_count=proxy_mesh.triangle_count,
        textured=proxy_mesh.texture is not None,
        confidence=evidence.confidence,
    )

    report("FINALIZING", 0.93, "Assembling MotionScene")

    duration = time.time() - start_time
    metrics = ReconstructionMetrics(
        duration_seconds=round(duration, 3),
        triangle_count=proxy_mesh.triangle_count,
        ground_confidence=ground_conf,
        warnings_count=len(evidence.warnings),
    )

    result = ReconstructionResult(
        provider=provider.provider_id,
        mode=settings.mode,
        camera=camera,
        environment_asset=env_asset,
        planes=planes,
        metrics=metrics,
        warnings=list(evidence.warnings),
        confidence=evidence.confidence,
        source_width=int(source_width),
        source_height=int(source_height),
    )

    motion_scene = build_reconstructed_scene(
        result,
        source_asset_ref=source.value,
        canvas_width=int(source_width),
        canvas_height=int(source_height),
    )

    summary = {
        "provider": provider.provider_id,
        "mode": settings.mode,
        "triangle_count": proxy_mesh.triangle_count,
        "camera_fov_x": round(camera.fov_x_degrees, 1),
        "confidence": round(evidence.confidence, 4),
        "ground_confidence": round(ground_conf, 2),
        "object_count": len(motion_scene.get("objects", [])),
        "motion_scene": motion_scene,
        "warnings": list(evidence.warnings),
    }

    cache_entry = CacheEntry(
        cache_version=1,
        fingerprint=fp,
        provider=provider.provider_id,
        provider_version=provider_version,
        asset=annotated_asset,
        summary=summary,
        created_at=time.time(),
    )
    write_cache_manifest(cache_entry, input_root=input_root)

    report("FINALIZING", 1.00, "Reconstruction complete")

    return PipelineOutput(
        motion_scene=motion_scene,
        summary=summary,
        warnings=list(evidence.warnings),
        fingerprint=fp,
    )
