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
    ReconBlockoutEmptyError,
    ReconCancelledError,
    ReconEmptyGeometryError,
    ReconInferenceFailedError,
    ReconNoInstancesError,
    ReconSourceInvalidError,
)
from ..fingerprint import compute_reconstruction_fingerprint
from ..geometry import EmptyGeometryError, MeshTooLargeError, build_proxy_mesh
from ..leveling import level_rotation_from_normal, level_scene, recenter_scene
from ..planes import detect_planes, scale_planes
from ..providers.base import CancelToken, ProgressSink, ReconstructionProvider
from ..segmentation.base import SegmentationProvider
from ..segmentation.taxonomy import resolve_semantic_labels
from ..settings import ReconstructionSettings
from ..source import ReconstructionSourceResolutionError, resolve_reconstruction_source
from ..types import ReconstructedCamera, ReconstructionSource
from .base import (
    GpuContentionGuard,
    PipelineOutput,
    hash_source_file,
    make_progress_gate,
    stage_cache_version,
)

#: Two proxy boxes count as the same object when their centres sit within this
#: fraction of the larger box's max dimension and their volumes are within ~1.7x.
_DEDUPE_CENTRE_FRACTION = 0.40
_DEDUPE_VOLUME_RATIO = 1.75
#: A proxy whose largest side is more than this fraction of the whole scene
#: diagonal is a mis-segmented wall / background, not furniture.
_MAX_OBJECT_SPAN_FRACTION = 0.45
#: ...and one that is also *thick in every axis* by this fraction is a solid
#: blob covering the background (a real object is compact along at least one
#: axis relative to the scene).
_BLOB_MIN_SPAN_FRACTION = 0.18


def _finite_extent(points: np.ndarray) -> float:
    """Robust diagonal of the finite point cloud -- 2nd/98th percentile per
    axis, so a handful of far MoGe outliers do not inflate it."""
    flat = np.asarray(points, dtype=float).reshape(-1, 3)
    flat = flat[np.isfinite(flat).all(axis=1)]
    if len(flat) < 8:
        return 0.0
    lo = np.percentile(flat, 2, axis=0)
    hi = np.percentile(flat, 98, axis=0)
    return float(np.linalg.norm(hi - lo))


def _dedupe_and_bound_objects(objects: list[Any], *, scene_extent: float) -> list[Any]:
    """Drop near-duplicate proxies (keep the most confident) and reject any that
    span most of the scene. ``objects`` must already be confidence-sorted desc."""
    span_cap = scene_extent * _MAX_OBJECT_SPAN_FRACTION if scene_extent > 0 else float("inf")
    blob_floor = scene_extent * _BLOB_MIN_SPAN_FRACTION if scene_extent > 0 else float("inf")
    kept: list[Any] = []
    for obj in objects:
        size = np.abs(np.asarray(obj.size, dtype=float))
        if float(size.max()) > span_cap and float(size.min()) > blob_floor:
            continue  # big in every axis -> a background blob, not furniture
        centre = np.asarray(obj.position, dtype=float)
        vol = float(np.prod(np.clip(size, 1e-4, None)))
        duplicate = False
        for other in kept:
            o_size = np.abs(np.asarray(other.size, dtype=float))
            o_centre = np.asarray(other.position, dtype=float)
            ref = max(float(size.max()), float(o_size.max()), 1e-4)
            if float(np.linalg.norm(centre - o_centre)) > _DEDUPE_CENTRE_FRACTION * ref:
                continue
            o_vol = float(np.prod(np.clip(o_size, 1e-4, None)))
            ratio = max(vol, o_vol) / max(min(vol, o_vol), 1e-9)
            if ratio <= _DEDUPE_VOLUME_RATIO:
                other.source_instance_ids = list(
                    {*other.source_instance_ids, *obj.source_instance_ids}
                )
                duplicate = True
                break
        if not duplicate:
            kept.append(obj)
    return kept


def _compose_reference_transform(
    scene_scale: float, level_rot: np.ndarray | None, offset: Any
) -> dict[str, list[float]]:
    """TRS for the Hybrid reference mesh's object node, so ``T @ R @ S`` applied
    by the Director reproduces ``p_final = R @ (scene_scale * p_raw) + offset``."""
    from ..rotation_utils import euler_xyz_degrees_from_matrix

    off = np.asarray(offset, dtype=float).reshape(3) if offset is not None else np.zeros(3)
    rot = level_rot if level_rot is not None else np.eye(3)
    rx, ry, rz = euler_xyz_degrees_from_matrix(np.asarray(rot, dtype=float))
    s = float(scene_scale) if scene_scale and scene_scale > 0 else 1.0
    return {
        "position": [float(off[0]), float(off[1]), float(off[2])],
        "rotation": [float(rx), float(ry), float(rz)],
        "size": [s, s, s],
    }


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
    asset_library: Any | None = None,
    asset_mode: str = "off",
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
        geometry_provider,
        settings,
        segmentation_provider=segmentation_provider,
        asset_library=asset_library if asset_mode != "off" else None,
        completion_provider=(
            completion_provider if settings.completion_policy != "off" else None
        ),
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
    if not instances:
        raise ReconNoInstancesError(
            "Segmentation found no instances for the requested labels; "
            "try a lower sam3_threshold, different labels, or Depth Mesh mode"
        )

    # 3. Layout ------------------------------------------------------- #
    report("ANALYZE_LAYOUT", 0.58, "Fitting room shell")
    camera = reconstruct_camera_from_evidence(evidence, settings)
    source_width, source_height = resolve_source_dimensions(evidence)
    planes = scale_planes(detect_planes(evidence, settings, seed=fp), settings.scene_scale)

    # scene_scale as ONE similarity about the origin, applied to points + camera
    # to match the planes (already scaled above) -- before any levelling /
    # recentring so every component stays in the same frame. Objects are then
    # fitted with scene_scale=1.0 (the points they read are already scaled).
    s = float(settings.scene_scale)
    if s > 0 and abs(s - 1.0) > 1e-9:
        points_omnicam = (points_omnicam.astype(np.float64) * s).astype(np.float32)
        camera = ReconstructedCamera(
            fov_x_degrees=camera.fov_x_degrees,
            fov_y_degrees=camera.fov_y_degrees,
            position=tuple(float(v) * s for v in camera.position),  # type: ignore[arg-type]
            target=tuple(float(v) * s for v in camera.target),  # type: ignore[arg-type]
            near=camera.near,
            far=camera.far,
            scale_mode=camera.scale_mode,
        )
    ground = next((p for p in planes if p.plane_type == "ground"), None)

    # Re-level: rotate points + camera + planes together so a confident,
    # gently-tilted floor becomes world-horizontal. Objects are then fitted in
    # a level frame instead of floating at a constant height above a slanted
    # ground. Capture the rotation so the Hybrid dense mesh (built from the raw
    # evidence) can be placed in the same frame.
    _pre_level_ground = ground
    points_omnicam, camera, planes, was_levelled = level_scene(
        points=points_omnicam, camera=camera, planes=planes, ground=ground
    )
    _level_rot = (
        level_rotation_from_normal(tuple(_pre_level_ground.normal))
        if was_levelled and _pre_level_ground is not None
        else None
    )
    if was_levelled:
        ground = next((p for p in planes if p.plane_type == "ground"), None)

    # Drop the whole scene onto Director's grid at the origin: the floor plane
    # goes to Y=0 and the room is centred at XZ=(0,0). Without this the blockout
    # sits wherever MoGe put it -- in front of the camera at negative Z and
    # below the grid.
    points_omnicam, camera, planes, _recenter_offset = recenter_scene(
        points=points_omnicam, camera=camera, planes=planes, ground=ground
    )
    ground = next((p for p in planes if p.plane_type == "ground"), None)

    # Composite similarity taking a point in the RAW evidence frame to the final
    # scene frame:  p_final = R @ (scene_scale * p_raw) + recenter_offset.
    # The Hybrid reference mesh is built from raw evidence, so it carries this
    # exact transform on its object node to stay superimposed on the blockout.
    _mesh_transform = _compose_reference_transform(s, _level_rot, _recenter_offset)

    # 4. Fit closed primitives -------------------------------------- #
    report("FIT_BLOCKOUT", 0.66, "Fitting closed primitives")
    objects = []
    for inst in instances:
        obj = fit_blockout_object(
            inst,
            points_omnicam,
            ground=ground,
            scene_scale=1.0,  # points_omnicam is already in the scaled frame
            seed=inst.instance_id,
        )
        if obj is not None:
            objects.append(obj)
    objects.sort(key=lambda o: o.confidence, reverse=True)
    # SAM3 gives semantically-adjacent labels (tv/monitor/door/window, or
    # person/armchair) overlapping masks on the same surface -- their 3D proxies
    # then collapse to one box. Drop the near-duplicates (highest confidence
    # wins) and reject a proxy that spans most of the scene (a mis-segmented
    # wall / background, not furniture).
    scene_extent = _finite_extent(points_omnicam)
    objects = _dedupe_and_bound_objects(objects, scene_extent=scene_extent)
    objects = objects[: settings.max_blockout_objects]
    if not objects:
        raise ReconBlockoutEmptyError(
            f"{len(instances)} instance(s) segmented but none produced a usable "
            "3D proxy (too few masked points that were finite in the depth map)"
        )

    # 5. Completion (bounded, optional) --------------------------- #
    completion_status: dict[str, Any] = {"state": "disabled", "requested": 0, "applied": 0, "reason": ""}
    if settings.completion_policy != "off":
        report("COMPLETE_OBJECTS", 0.78, "Completing hidden dimensions")
        from ..completion.apply import apply_completion_policy

        objects, _outcome = apply_completion_policy(
            objects,
            evidence=evidence,
            instances=instances,
            settings=settings,
            provider=completion_provider,
            cancel=cancel,
        )
        completion_status = _outcome.to_dict()
        if _outcome.warning:
            evidence.warnings.append(_outcome.warning)

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
                "transform": _mesh_transform,
            }

    # 6b. Asset-library retrieval (optional) -------------------- #
    asset_placements: list[Any] = []
    if asset_mode != "off":
        report("SAVE_ASSETS", 0.88, "Retrieving library assets")
        from ..asset_library import resolve_placements

        # The unified asset catalog is the single source of truth; the blockout
        # library stays a compatibility fallback (unified-assets design spec
        # section 33) -- mirrors the multi-view scan pipeline.
        catalog = None
        try:
            from ...assets import load_catalog

            catalog = load_catalog(input_root=input_root)
        except Exception:  # noqa: BLE001 - no catalog is a supported state
            catalog = None
        asset_placements = resolve_placements(
            objects, asset_library, catalog=catalog, input_root=input_root
        )

    # 7. Compile ------------------------------------------------- #
    report("SAVE_ASSETS", 0.90, "Compiling blockout scene")
    provider_summary = {
        "geometry": geometry_provider.provider_id,
        "segmentation": getattr(segmentation_provider, "provider_id", "unknown"),
        "completion": getattr(completion_provider, "provider_id", "none"),
        "completion_status": completion_status,
        "instances": len(instances),
        "objects": len(objects),
        "levelled": bool(was_levelled),
        "asset_mode": asset_mode if asset_placements else "off",
        "assets": len(asset_placements),
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
        asset_placements=asset_placements,
        asset_mode=asset_mode,
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
