"""Depth-mesh reconstruction orchestrator.

This is the historical single-image MoGe path: geometry inference -> proxy mesh
-> camera + planes -> GLB asset -> MotionScene. It is unchanged behaviour; the
facade in ``reconstruction.pipeline`` routes ``mode in {geometry, depth_mesh}``
here.
"""

from __future__ import annotations

import time
from collections.abc import Callable
from pathlib import Path
from typing import Any

from ..asset_writer import write_reconstruction_assets
from ..cache import CacheEntry, lookup_cache, write_cache_manifest
from ..camera import reconstruct_camera_from_evidence, resolve_source_dimensions
from ..errors import (
    ReconCancelledError,
    ReconEmptyGeometryError,
    ReconInferenceFailedError,
    ReconMeshTooLargeError,
    ReconSourceInvalidError,
)
from ..fingerprint import compute_reconstruction_fingerprint
from ..geometry import EmptyGeometryError, MeshTooLargeError, build_proxy_mesh
from ..planes import detect_planes, scale_planes
from ..providers.base import CancelToken, ProgressSink, ReconstructionProvider
from ..scene_builder import build_reconstructed_scene
from ..settings import ReconstructionSettings
from ..source import ReconstructionSourceResolutionError, resolve_reconstruction_source
from ..types import (
    ReconstructedAsset,
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

    ground_plane = next((p for p in planes if p.plane_type == "ground"), None)
    ground_conf = ground_plane.confidence if ground_plane else 0.0

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
