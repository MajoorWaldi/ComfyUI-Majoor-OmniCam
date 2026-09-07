"""Single-image semantic blockout orchestrator.

Geometry evidence (MoGe / fake) + semantic instance masks (SAM3 / fake) ->
deterministic closed primitives + a room shell, compiled to MotionScene v1.
The dense depth mesh is kept only as an optional reference in ``hybrid`` mode.
"""

from __future__ import annotations

import contextlib
import time
from pathlib import Path
from typing import Any

import numpy as np

from ..blockout.compiler import compile_blockout_scene
from ..blockout.object_fitter import fit_blockout_object
from ..blockout.types import BlockoutScene
from ..cache import CacheEntry, lookup_cache, write_cache_manifest
from ..camera import reconstruct_camera_from_evidence, resolve_source_dimensions
from ..coordinates import opencv_points_to_omnicam
from ..errors import (
    ReconCancelledError,
    ReconEmptyGeometryError,
    ReconInferenceFailedError,
    ReconSourceInvalidError,
)
from ..fingerprint import compute_reconstruction_fingerprint
from ..geometry import EmptyGeometryError, MeshTooLargeError, build_proxy_mesh
from ..leveling import level_scene
from ..planes import detect_planes, scale_planes
from ..providers.base import CancelToken, ProgressSink, ReconstructionProvider
from ..segmentation.base import SegmentationProvider
from ..segmentation.taxonomy import resolve_semantic_labels
from ..settings import ReconstructionSettings
from ..source import ReconstructionSourceResolutionError, resolve_reconstruction_source
from ..types import ReconstructionSource
from .base import (
    GpuContentionGuard,
    PipelineOutput,
    hash_source_file,
    make_progress_gate,
    stage_cache_version,
)


def _evidence_points_omnicam(evidence: Any) -> np.ndarray:
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


def run_single_blockout_pipeline(
    *,
    source: ReconstructionSource,
    settings: ReconstructionSettings,
    geometry_provider: ReconstructionProvider,
    segmentation_provider: SegmentationProvider,
    completion_provider: Any | None = None,
    progress: ProgressSink | None = None,
    cancel: CancelToken | None = None,
    input_root: Path | str | None = None,
    triangulate_fn: Any | None = None,
    save_glb_fn: Any | None = None,
    gpu_guard: GpuContentionGuard | None = None,
) -> PipelineOutput:
    start_time = time.time()
    report, _check = make_progress_gate(progress, cancel, gpu_guard)
    resolved_mode = settings.resolved_mode()
    is_hybrid = resolved_mode == "hybrid"

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
        provider=geometry_provider.provider_id,
        settings=settings,
    )

    # Cache version spans BOTH the geometry checkpoint the run will actually
    # load and the segmentation checkpoint -- checking geometry alone would
    # serve a stale blockout after the SAM3 checkpoint was swapped.
    provider_version = stage_cache_version(
        geometry_provider, settings, segmentation_provider=segmentation_provider
    )

    report("PREPARING", 0.08, "Checking reconstruction cache")
    cached = lookup_cache(
        fingerprint=fp,
        provider=geometry_provider.provider_id,
        provider_version=provider_version,
        input_root=input_root,
        # Blockout has no environment.glb; the manifest + blockout.json sidecar
        # back the hit so repeated runs actually reuse the result.
        require_glb=is_hybrid,
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

    # 1. Geometry -------------------------------------------------------- #
    report("INFER_GEOMETRY", 0.10, "Estimating geometry")

    def _geo_progress(_stage: str, sub: float, msg: str) -> None:
        report("INFER_GEOMETRY", 0.10 + max(0.0, min(1.0, sub)) * 0.26, msg)

    try:
        evidence = geometry_provider.reconstruct(
            source=source, settings=settings, progress=_geo_progress, cancel=cancel
        )
    except RuntimeError as exc:
        if "cancelled" in str(exc).lower():
            raise ReconCancelledError("Inference cancelled") from exc
        raise ReconInferenceFailedError(f"Inference failed: {exc}") from exc
    if evidence is None or evidence.points is None:
        raise ReconEmptyGeometryError("Geometry provider returned no points")

    points_omnicam = _evidence_points_omnicam(evidence)

    # 2. Segmentation -------------------------------------------------- #
    report("SEGMENT_SCENE", 0.40, "Detecting semantic instances")
    labels = resolve_semantic_labels(settings.semantic_labels)

    def _seg_progress(_stage: str, sub: float, msg: str) -> None:
        report("SEGMENT_SCENE", 0.40 + max(0.0, min(1.0, sub)) * 0.16, msg)

    instances = segmentation_provider.segment(
        evidence.image, labels, settings, progress=_seg_progress, cancel=cancel
    )

    # 3. Layout ------------------------------------------------------- #
    report("ANALYZE_LAYOUT", 0.58, "Fitting room shell")
    camera = reconstruct_camera_from_evidence(evidence, settings)
    source_width, source_height = resolve_source_dimensions(evidence)
    planes = scale_planes(detect_planes(evidence, settings, seed=fp), settings.scene_scale)
    ground = next((p for p in planes if p.plane_type == "ground"), None)

    # Re-level: rotate points + camera + planes together so a confident,
    # gently-tilted floor becomes world-horizontal. Objects are then fitted in
    # a level frame instead of floating at a constant height above a slanted
    # ground.
    points_omnicam, camera, planes, was_levelled = level_scene(
        points=points_omnicam, camera=camera, planes=planes, ground=ground
    )
    if was_levelled:
        ground = next((p for p in planes if p.plane_type == "ground"), None)

    # 4. Fit closed primitives -------------------------------------- #
    report("FIT_BLOCKOUT", 0.66, "Fitting closed primitives")
    objects = []
    for inst in instances:
        obj = fit_blockout_object(
            inst,
            points_omnicam,
            ground=ground,
            scene_scale=settings.scene_scale,
            seed=inst.instance_id,
        )
        if obj is not None:
            objects.append(obj)
    objects.sort(key=lambda o: o.confidence, reverse=True)
    objects = objects[: settings.max_blockout_objects]

    # 5. Completion (bounded, optional) --------------------------- #
    if completion_provider is not None and settings.completion_policy != "off":
        report("COMPLETE_OBJECTS", 0.78, "Completing hidden dimensions")
        from ..completion.apply import apply_completion_policy

        objects = apply_completion_policy(
            objects,
            evidence=evidence,
            instances=instances,
            settings=settings,
            provider=completion_provider,
            cancel=cancel,
        )

    # 6. Hybrid reference mesh ----------------------------------- #
    reference_asset = None
    if is_hybrid:
        report("BUILD_REFERENCE", 0.84, "Building dense reference mesh")
        try:
            proxy_mesh = build_proxy_mesh(
                evidence=evidence, settings=settings, triangulate_fn=triangulate_fn
            )
        except (EmptyGeometryError, MeshTooLargeError):
            proxy_mesh = None
        if proxy_mesh is not None:
            from ..asset_writer import write_reconstruction_assets

            annotated_asset, _, _ = write_reconstruction_assets(
                fingerprint=fp,
                mesh=proxy_mesh,
                summary={"provider": geometry_provider.provider_id, "role": "reference"},
                input_root=input_root,
                save_glb_fn=save_glb_fn,
            )
            reference_asset = {
                "asset_path": annotated_asset,
                "confidence": float(evidence.confidence),
                "textured": proxy_mesh.texture is not None,
            }

    # 7. Compile ------------------------------------------------- #
    report("SAVE_ASSETS", 0.90, "Compiling blockout scene")
    provider_summary = {
        "geometry": geometry_provider.provider_id,
        "segmentation": getattr(segmentation_provider, "provider_id", "unknown"),
        "completion": getattr(completion_provider, "provider_id", "none"),
        "instances": len(instances),
        "objects": len(objects),
        "levelled": bool(was_levelled),
    }
    blockout = BlockoutScene(
        objects=objects,
        room_planes=planes,
        source_camera=camera,
        scan_camera_track=None,
        reference_asset=reference_asset,
        provider_summary=provider_summary,
        warnings=list(evidence.warnings),
    )
    motion_scene = compile_blockout_scene(
        blockout,
        canvas_width=int(source_width),
        canvas_height=int(source_height),
        source_asset_ref=source.value,
        source_kind="single_image",
        mode=resolved_mode,
    )

    summary = {
        "provider": geometry_provider.provider_id,
        "mode": settings.mode,
        "resolved_mode": resolved_mode,
        "confidence": round(float(evidence.confidence), 4),
        "instance_count": len(instances),
        "blockout_object_count": len(objects),
        "object_count": len(motion_scene.get("objects", [])),
        "motion_scene": motion_scene,
        "provider_summary": provider_summary,
        "warnings": list(evidence.warnings),
    }

    # Persist the light blockout sidecar and a manifest so a repeated run
    # (same fingerprint + model identities) reuses the result instead of
    # re-inferring. The hybrid path also has a GLB; plain blockout is gated on
    # the sidecar (see lookup_cache require_glb=False).
    with contextlib.suppress(OSError, ValueError):
        from ..asset_writer import write_blockout_json

        write_blockout_json(
            fingerprint=fp,
            blockout={
                "objects": [o.to_dict() for o in objects],
                "room": [p.to_dict() for p in planes],
                "source_camera": camera.to_dict() if camera is not None else None,
                "provider_summary": provider_summary,
            },
            input_root=input_root,
        )
        cache_entry = CacheEntry(
            cache_version=1,
            fingerprint=fp,
            provider=geometry_provider.provider_id,
            provider_version=provider_version,
            asset=reference_asset["asset_path"] if reference_asset else "",
            summary=summary,
            created_at=time.time(),
        )
        write_cache_manifest(cache_entry, input_root=input_root)

    report("FINALIZING", 1.0, "Blockout complete")
    _ = start_time
    return PipelineOutput(
        motion_scene=motion_scene,
        summary=summary,
        warnings=list(evidence.warnings),
        fingerprint=fp,
    )
