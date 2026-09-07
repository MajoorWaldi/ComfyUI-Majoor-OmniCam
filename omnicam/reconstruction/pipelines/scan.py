"""Multi-view / video scan orchestrator (VGGT geometry + cross-view fusion)."""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np

from ..blockout.compiler import compile_blockout_scene
from ..blockout.fusion import FusionCandidate, fuse_candidates
from ..blockout.masked_points import extract_masked_points
from ..blockout.obb import fit_ground_relative_obb
from ..blockout.primitive_resolver import rule_for_label
from ..blockout.types import AxisConfidence, BlockoutObject, BlockoutScene
from ..errors import (
    ReconBlockoutEmptyError,
    ReconSourceSetInvalidError,
    ReconTooManyViewsError,
)
from ..leveling import (
    _translate_view_camera,
    level_scan_evidence,
    recenter_translation,
)
from ..multiview.camera_track import _pose, build_scan_camera_track
from ..multiview.sampling import choose_segmentation_views, uniform_sample_indices
from ..planes import detect_planes
from ..segmentation.taxonomy import resolve_semantic_labels
from ..settings import ReconstructionSettings
from ..types import ReconstructedCamera, ReconstructionSource
from .base import GpuContentionGuard, PipelineOutput, make_progress_gate

_MIN_SAMPLES = 20
#: Performance bounds (design doc section 20, multi-view / Balanced).
_MAX_INSTANCES_BEFORE_FUSION = 96
_MAX_SCAN_OBJECTS = 32
#: Hard ceiling on submitted views regardless of preset.
_ABSOLUTE_MAX_VIEWS = 128


def _scale_view_camera(view_cam: Any, factor: float) -> Any:
    """Scale a world->camera extrinsic's translation by ``factor`` (world
    similarity about the origin: ``[R | t] -> [R | factor * t]``)."""
    from ..multiview.types import ViewCameraEvidence

    e = np.asarray(view_cam.extrinsic_camera_from_world, dtype=float)
    if e.shape == (3, 4):
        e = np.vstack([e, [0.0, 0.0, 0.0, 1.0]])
    e = e.copy()
    e[:3, 3] = e[:3, 3] * float(factor)
    return ViewCameraEvidence(
        view_index=view_cam.view_index,
        width=view_cam.width,
        height=view_cam.height,
        extrinsic_camera_from_world=e,
        intrinsics=np.asarray(view_cam.intrinsics, dtype=float),
        source_frame=view_cam.source_frame,
    )


def _scan_fingerprint(samples: list[Any], settings: Any, provider_summary: dict[str, Any]) -> str:
    """Plain-hex, content-addressed scan key.

    Ordered view pixels + the settings that change the geometry/segmentation
    result + the provider ids. Two clips that sample the same frame indices no
    longer share a folder, and the token passes the asset writer's
    ``^[0-9a-fA-F]{1,64}$`` gate.
    """
    import hashlib

    from ..multiview.source import image_batch_fingerprint

    digest = hashlib.sha256()
    try:
        stacked = np.stack([np.asarray(s.image) for s in samples], axis=0)
        digest.update(image_batch_fingerprint(stacked).encode())
    except (ValueError, TypeError):
        for s in samples:
            digest.update(np.ascontiguousarray(np.asarray(s.image)).tobytes())
    for key in (
        "provider", "mode", "quality", "scene_scale", "semantic_labels",
        "min_instance_area_ratio", "instance_iou_dedup", "max_blockout_objects",
        "vggt_checkpoint", "vggt_max_views", "vggt_segmentation_views", "source_mode",
        "sam3_checkpoint", "sam3_threshold",
    ):
        digest.update(f"{key}={getattr(settings, key, '')}".encode())
    digest.update(
        f"geo={provider_summary.get('geometry')}|seg={provider_summary.get('segmentation')}".encode()
    )
    return digest.hexdigest()[:40]


def _resize_hwc(src: np.ndarray, target_hw: tuple[int, int]) -> np.ndarray:
    """Nearest-neighbour resize of an HWC uint8/float image to ``(H, W)``."""
    from PIL import Image

    arr = np.asarray(src)
    if arr.dtype != np.uint8:
        arr = (np.clip(arr, 0.0, 1.0) * 255.0).astype(np.uint8) if arr.max() <= 1.5 else arr.astype(np.uint8)
    pil = Image.fromarray(arr[..., :3]).resize((target_hw[1], target_hw[0]), Image.NEAREST)
    return np.asarray(pil)


def _seg_view_image(evidence: Any, samples: list[Any], view_index: int, target_hw: tuple[int, int]) -> np.ndarray:
    """The image to segment for ``view_index``, in the SAME pixel grid as
    ``points_world[view_index]``.

    A geometry provider that resizes its input (real VGGT: 518-wide, patch
    aligned) must hand back the preprocessed frames on ``evidence.images``; the
    mask then lines up with the point map. Providers that run at native
    resolution (the fake, and any that leaves ``images`` unset) fall back to a
    resize of the source frame onto the point-map grid.
    """
    imgs = getattr(evidence, "images", None)
    if imgs is not None:
        return np.asarray(imgs)[view_index]
    src = np.asarray(samples[view_index].image)
    if src.shape[:2] == tuple(target_hw):
        return src
    return _resize_hwc(src, target_hw)


def _anchor_source_camera(view_cam: Any, *, width: int, height: int) -> ReconstructedCamera:
    """Build a MotionScene source camera from the anchor view (image-set scan)."""
    import math

    position, forward = _pose(view_cam)
    fy = float(np.asarray(view_cam.intrinsics, dtype=float)[1, 1])
    fov_y = math.degrees(2.0 * math.atan((height * 0.5) / fy)) if fy > 1e-6 else 50.0
    fx = float(np.asarray(view_cam.intrinsics, dtype=float)[0, 0])
    fov_x = math.degrees(2.0 * math.atan((width * 0.5) / fx)) if fx > 1e-6 else fov_y
    target = position + forward
    return ReconstructedCamera(
        fov_x_degrees=fov_x,
        fov_y_degrees=fov_y,
        position=(float(position[0]), float(position[1]), float(position[2])),
        target=(float(target[0]), float(target[1]), float(target[2])),
    )


@dataclass(slots=True)
class _ScanGeometryEvidence:
    """detect_planes only needs ``points`` + ``coordinate_system``."""

    points: Any
    coordinate_system: str = "omnicam_x_right_y_up_z_back"
    image: Any = None
    intrinsics: Any = None
    confidence: float = 0.9
    warnings: list[str] = field(default_factory=list)


def _blockout_from_fused(fused: Any, index: int, scene_scale: float) -> BlockoutObject:
    rule = rule_for_label(fused.label)
    obb = fused.obb
    scale = float(scene_scale) if scene_scale and scene_scale > 0 else 1.0
    width = max(0.01, float(obb.size[0]) * scale)
    height = max(0.01, float(obb.size[1]) * scale)
    observed_depth = float(obb.size[2]) * scale
    footprint = max(width, observed_depth, 1e-6)
    depth = max(observed_depth, rule.min_depth_factor * footprint, 0.01)
    center = obb.center * scale

    depth_ratio = min(1.0, observed_depth / max(depth, 1e-6))
    yaw_conf = min(1.0, max(0.0, obb.planar_anisotropy))
    score = float(max(0.0, min(1.0, fused.score)))
    # Objects seen from more views earn a modest depth-confidence bump.
    multiview_bonus = min(0.25, 0.08 * max(0, len(fused.source_views) - 1))
    axis = AxisConfidence(
        width=min(1.0, score * 1.05),
        height=min(1.0, score * 1.05),
        depth=min(1.0, min(score, depth_ratio) + multiview_bonus),
        yaw=min(score, yaw_conf),
    )
    overall = 0.25 * (axis.width + axis.height + axis.depth + axis.yaw)
    return BlockoutObject(
        object_id=f"scan_{fused.label}_{index}".replace(" ", "_")[:80],
        label=fused.label,
        semantic_class=str(fused.label).strip().lower()[:64],
        primitive=rule.primitive,
        position=(float(center[0]), float(center[1]), float(center[2])),
        rotation=(0.0, float(obb.yaw_degrees), 0.0),
        size=(width, height, depth),
        confidence=float(max(0.0, min(1.0, overall))),
        axis_confidence=axis,
        source_instance_ids=list(fused.source_instance_ids),
    )


def run_scan_pipeline(
    *,
    source: ReconstructionSource | None,
    settings: ReconstructionSettings,
    geometry_provider: Any,
    segmentation_provider: Any,
    samples: list[Any] | None = None,
    completion_provider: Any | None = None,
    asset_library: Any | None = None,
    asset_mode: str = "off",
    source_fps: float = 24.0,
    progress: Any | None = None,
    cancel: Any | None = None,
    input_root: Path | str | None = None,
    gpu_guard: GpuContentionGuard | None = None,
) -> PipelineOutput:
    start_time = time.time()
    report, _check = make_progress_gate(progress, cancel, gpu_guard)
    track_fps = float(source_fps) if source_fps and source_fps > 0 else 24.0

    report("PREPARING", 0.02, "Preparing scan")

    # 1. Register views -------------------------------------------------- #
    report("REGISTER_VIEWS", 0.08, "Registering scan views")
    if samples is None:
        raise ReconSourceSetInvalidError(
            "scan pipeline needs pre-resolved samples in this build"
        )
    if len(samples) < 2:
        raise ReconSourceSetInvalidError(
            f"scan needs at least 2 views; got {len(samples)}"
        )

    geom_views, seg_view_count = settings.scan_view_counts()
    if len(samples) > _ABSOLUTE_MAX_VIEWS:
        raise ReconTooManyViewsError(
            f"{len(samples)} views submitted; the hard ceiling is {_ABSOLUTE_MAX_VIEWS}"
        )
    # A video scan drives a read-only trajectory Scan Camera; an unordered
    # image set only contributes its anchor camera (design doc 10.6).
    is_video_scan = settings.source_mode == "video_scan"

    # Trim to the preset's geometry-view budget (uniform, deterministic).
    if len(samples) > geom_views:
        keep = set(uniform_sample_indices(len(samples), geom_views))
        samples = [s for i, s in enumerate(samples) if i in keep]

    # 2. VGGT geometry ---------------------------------------------- #
    report("INFER_GEOMETRY", 0.20, "Running VGGT")
    if gpu_guard is not None:
        # Same as single-blockout: arm the contention probe so a ComfyUI
        # workflow grabbing the GPU mid-scan is noticed at the next report().
        gpu_guard.arm()
    evidence = geometry_provider.reconstruct_views(samples, settings, cancel=cancel)
    cameras = list(evidence.cameras)
    points_world = np.asarray(evidence.points_world, dtype=float)  # [V, H, W, 3]
    # Everything downstream (masks, fov, canvas) works in the point-map pixel
    # grid so a provider that resized its input cannot desync masks / intrinsics.
    _model_h, _model_w = int(points_world.shape[1]), int(points_world.shape[2])
    width, height = _model_w, _model_h

    # scene_scale as ONE similarity about the origin on points AND every view
    # camera, so objects (fitted with scene_scale=1.0 below) share the camera
    # frame instead of being scaled in isolation.
    _scale = float(settings.scene_scale)
    if _scale > 0 and abs(_scale - 1.0) > 1e-9:
        points_world = points_world * _scale
        cameras = [_scale_view_camera(c, _scale) for c in cameras]

    # 2b. Re-level + recentre the whole scan (points + every view camera) so a
    # confident, gently-tilted floor is world-horizontal AND the scene sits on
    # Director's grid at the origin, before any object is fitted. A cheap early
    # plane pass provides the ground; the real room shell is fitted on the
    # transformed points below.
    _early_planes = detect_planes(
        _ScanGeometryEvidence(points=points_world.reshape(-1, 1, 3)), settings, seed="scan-level"
    )
    _early_ground = next((p for p in _early_planes if p.plane_type == "ground"), None)
    points_world, cameras, _lvl_planes, was_levelled = level_scan_evidence(
        points_world=points_world, cameras=cameras, planes=_early_planes, ground=_early_ground
    )
    _ground_for_center = next((p for p in _lvl_planes if p.plane_type == "ground"), None)
    _offset = recenter_translation(_ground_for_center, points_world)
    if np.any(np.abs(_offset) > 1e-6):
        points_world = (points_world + _offset).astype(float)
        cameras = [_translate_view_camera(c, _offset) for c in cameras]

    # 3. Segmentation on selected key views --------------------- #
    report("SEGMENT_SCENE", 0.45, "Segmenting key views")
    labels = resolve_semantic_labels(settings.semantic_labels)
    seg_views = choose_segmentation_views(len(cameras), seg_view_count)
    candidates: list[FusionCandidate] = []
    for view_index in seg_views:
        view_points = points_world[view_index]
        view_img = _seg_view_image(evidence, samples, view_index, (_model_h, _model_w))
        instances = segmentation_provider.segment(view_img, labels, settings, cancel=cancel)
        for inst in instances:
            pts = extract_masked_points(view_points, inst.mask, erode_pixels=1)
            if len(pts) < _MIN_SAMPLES:
                continue
            obb = fit_ground_relative_obb(pts)
            candidates.append(
                FusionCandidate(
                    instance_id=f"v{view_index}_{inst.instance_id}",
                    label=inst.label,
                    points=pts,
                    center=obb.center,
                    size=obb.size,
                    yaw=obb.yaw_degrees,
                    score=inst.score,
                    view_index=view_index,
                )
            )

    # 4. Fuse across views ------------------------------------- #
    report("FUSE_VIEWS", 0.62, "Fusing cross-view instances")
    if len(candidates) > _MAX_INSTANCES_BEFORE_FUSION:
        candidates = sorted(candidates, key=lambda c: -c.score)[:_MAX_INSTANCES_BEFORE_FUSION]
    fused = fuse_candidates(candidates)

    # 5. Room shell ------------------------------------------ #
    # points_world (and the candidate points feeding fusion) are already in the
    # scaled frame, so planes and objects are fitted at scene_scale=1.0 here.
    report("ANALYZE_LAYOUT", 0.70, "Fitting room shell")
    geo = _ScanGeometryEvidence(points=points_world.reshape(-1, 1, 3))
    planes = detect_planes(geo, settings, seed="scan")

    # 6. Fit primitives ------------------------------------ #
    report("FIT_BLOCKOUT", 0.80, "Fitting closed primitives")
    objects = [_blockout_from_fused(f, i, 1.0) for i, f in enumerate(fused)]
    objects.sort(key=lambda o: o.confidence, reverse=True)
    objects = objects[: min(settings.max_blockout_objects, _MAX_SCAN_OBJECTS)]
    if not objects:
        raise ReconBlockoutEmptyError("scan produced no usable blockout objects")

    # 6b. Optional bounded completion.
    # Scan fusion merges per-view masks away, so image+mask completion cannot be
    # located per object here yet -- single-image blockout is the completion
    # path. Report it as an explicit "unsupported" state, not silence.
    completion_status: dict[str, Any] = {"state": "disabled", "requested": 0, "applied": 0, "reason": ""}
    if settings.completion_policy != "off":
        report("COMPLETE_OBJECTS", 0.86, "Completion not available for scan objects")
        completion_status = {
            "state": "unsupported",
            "requested": len(objects),
            "applied": 0,
            "reason": "scan fusion drops the per-view masks completion needs; use Blockout for completion",
        }

    # 7. Camera ------------------------------------ #
    # Video scan -> one read-only trajectory Scan Camera track. Unordered image
    # set -> only the anchor source camera; the rest of the poses live in the
    # scan_evidence manifest (design doc 10.6).
    scan_track = None
    source_camera = None
    if is_video_scan:
        report("SAVE_ASSETS", 0.90, "Building scan camera track")
        duration_frames = max(
            (int(s.source_frame) + 1 for s in samples if s.source_frame is not None),
            default=len(samples),
        )
        scan_track = build_scan_camera_track(
            cameras,
            fps=track_fps,
            duration_frames=duration_frames,
            width=width,
            height=height,
        )
    else:
        report("SAVE_ASSETS", 0.90, "Placing anchor camera")
        source_camera = _anchor_source_camera(cameras[0], width=width, height=height)

    asset_placements: list[Any] = []
    if asset_library is not None and asset_mode != "off":
        report("SAVE_ASSETS", 0.91, "Retrieving library assets")
        from ..asset_library import resolve_placements

        asset_placements = resolve_placements(objects, asset_library)

    provider_summary = {
        "geometry": getattr(geometry_provider, "provider_id", "vggt"),
        "segmentation": getattr(segmentation_provider, "provider_id", "unknown"),
        "completion": getattr(completion_provider, "provider_id", "none"),
        "completion_status": completion_status,
        "views": len(cameras),
        "segmentation_views": list(seg_views),
        "objects": len(objects),
        "levelled": bool(was_levelled),
        "scan_kind": "video" if is_video_scan else "image_set",
        "asset_mode": asset_mode if asset_placements else "off",
        "assets": len(asset_placements),
    }
    blockout = BlockoutScene(
        objects=objects,
        room_planes=planes,
        source_camera=source_camera,
        scan_camera_track=scan_track,
        reference_asset=None,
        provider_summary=provider_summary,
        warnings=list(getattr(evidence, "warnings", [])),
    )
    motion_scene = compile_blockout_scene(
        blockout,
        canvas_width=width,
        canvas_height=height,
        source_asset_ref=source.value if source is not None else "",
        source_kind="multi_view",
        mode="scan",
        fps=track_fps,
        asset_placements=asset_placements,
        asset_mode=asset_mode,
    )

    # Content-addressed fingerprint: the ordered view pixels + the settings that
    # change the result + the model identities. Two clips that happen to sample
    # the same frame indices no longer collide, and a plain-hex token satisfies
    # the asset writer. Write failures propagate as a warning, not a silent drop.
    fp_token = _scan_fingerprint(samples, settings, provider_summary)
    try:
        from ..asset_writer import write_blockout_json, write_scan_evidence_json

        write_blockout_json(
            fingerprint=fp_token,
            blockout={
                "objects": [o.to_dict() for o in objects],
                "room": [p.to_dict() for p in planes],
                "source_camera": None,
                "provider_summary": provider_summary,
            },
            input_root=input_root,
        )
        write_scan_evidence_json(
            fingerprint=fp_token,
            cameras=[c.to_summary() for c in cameras],
            max_views=settings.vggt_max_views,
            input_root=input_root,
            extra={"segmentation_views": list(seg_views), "fps": track_fps},
        )
    except (OSError, ValueError) as exc:  # AssetWriterSecurityError is a ValueError
        blockout.warnings.append(f"scan sidecars not written: {exc}")

    summary = {
        "provider": provider_summary["geometry"],
        "mode": "scan",
        "resolved_mode": "scan",
        "view_count": len(cameras),
        "blockout_object_count": len(objects),
        "object_count": len(motion_scene.get("objects", [])),
        "motion_scene": motion_scene,
        "provider_summary": provider_summary,
        "fingerprint": fp_token,
        "warnings": list(blockout.warnings),
    }
    report("FINALIZING", 1.0, "Scan complete")
    _ = start_time
    return PipelineOutput(
        motion_scene=motion_scene,
        summary=summary,
        warnings=list(blockout.warnings),
        fingerprint=fp_token,
    )
