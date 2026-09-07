"""Compile a :class:`BlockoutScene` into a validated MotionScene v1 dict.

The output hierarchy is deliberately explicit so Director adoption can lock the
room and reference while leaving blockout objects editable:

    reconstruction_root (null)
      reconstruction_room       (null)  -> ground / wall proxies
      reconstruction_blockout   (null)  -> closed semantic primitives
      reconstruction_reference  (null)  -> optional dense mesh (hybrid only)

No dense model output is copied into the scene: object ``reconstruction``
metadata carries only bounded scalars/strings the validator re-checks.
"""

from __future__ import annotations

from typing import Any

from ...core.motion_scene import MotionScene
from .room_shell import build_room_proxies
from .types import BlockoutObject, BlockoutScene

_ROOT_ID = "reconstruction_root"
_ROOM_ID = "reconstruction_room"
_BLOCKOUT_ID = "reconstruction_blockout"
_REFERENCE_ID = "reconstruction_reference"
_ASSETS_ID = "reconstruction_assets"


def _null(object_id: str, name: str, parent_id: str | None = None) -> dict[str, Any]:
    node: dict[str, Any] = {
        "id": object_id,
        "name": name,
        "type": "null",
        "position": [0.0, 0.0, 0.0],
        "rotation": [0.0, 0.0, 0.0],
        "size": [1.0, 1.0, 1.0],
        "material_mode": "neutral",
        "keyframes": [],
        "enabled": True,
        "locked": True,
    }
    if parent_id:
        node["parent_id"] = parent_id
    return node


def _room_object(proxy: Any, provider_summary: dict[str, Any], source_kind: str) -> dict[str, Any]:
    return {
        "id": proxy.object_id,
        "name": proxy.object_id.replace("_", " ").title(),
        "type": proxy.primitive,
        "parent_id": _ROOM_ID,
        "position": list(proxy.position),
        "rotation": list(proxy.rotation),
        "size": list(proxy.size),
        "material_mode": "neutral",
        "keyframes": [],
        "enabled": True,
        "locked": True,
        "reconstruction": {
            "version": 2,
            "role": "room",
            "provider": str(provider_summary.get("segmentation", "")) or "reconstruction",
            "source_kind": source_kind,
            "confidence": float(proxy.confidence),
        },
    }


def _blockout_object(obj: BlockoutObject, provider_summary: dict[str, Any], source_kind: str) -> dict[str, Any]:
    return {
        "id": obj.object_id,
        "name": obj.label or obj.object_id,
        "type": obj.primitive,
        "parent_id": _BLOCKOUT_ID,
        "position": [float(v) for v in obj.position],
        "rotation": [float(v) for v in obj.rotation],
        "size": [max(0.01, float(v)) for v in obj.size],
        "material_mode": "neutral",
        "keyframes": [],
        "enabled": True,
        "locked": False,  # blockout objects are the editable product
        "reconstruction": {
            "version": 2,
            "role": "blockout_object",
            "provider": str(provider_summary.get("segmentation", "")) or "reconstruction",
            "source_kind": source_kind,
            "confidence": obj.confidence,
            "semantic": obj.semantic_class,
            "axis_confidence": obj.axis_confidence.to_dict(),
            "completion_provider": obj.completion_provider,
        },
    }


def _asset_object(
    placement: Any, provider_summary: dict[str, Any], source_kind: str
) -> dict[str, Any]:
    """A retrieved GLB prop standing in the fitted box of one blockout object."""
    return {
        "id": f"{placement.source_object_id}_asset",
        "name": (placement.semantic_class or "asset").replace("_", " ").title(),
        "type": "glb",
        "parent_id": _ASSETS_ID,
        "position": [float(v) for v in placement.position],
        "rotation": [float(v) for v in placement.rotation],
        "size": [max(0.01, float(v)) for v in placement.size],
        "material_mode": "textured",
        "keyframes": [],
        "enabled": True,
        "locked": False,
        "asset": str(placement.asset_ref),
        "reconstruction": {
            "version": 2,
            "role": "asset_proxy",
            "provider": "asset_library",
            "source_kind": source_kind,
            "confidence": float(placement.confidence),
            "semantic": placement.semantic_class,
            "category": placement.category,
            "pose": placement.pose,
            "source_object_id": placement.source_object_id,
        },
    }


def _reference_object(asset: dict[str, Any], provider_summary: dict[str, Any], source_kind: str) -> dict[str, Any]:
    # The dense mesh is built from the RAW geometry evidence; the pipeline hands
    # over the same similarity (scale, level rotation, recentre offset) it
    # applied to the blockout so the two stay superimposed from the source view.
    xf = asset.get("transform") or {}
    return {
        "id": "reconstruction_reference_mesh",
        "name": "Dense Reference",
        "type": "glb",
        "parent_id": _REFERENCE_ID,
        "position": [float(v) for v in xf.get("position", [0.0, 0.0, 0.0])],
        "rotation": [float(v) for v in xf.get("rotation", [0.0, 0.0, 0.0])],
        "size": [float(v) for v in xf.get("size", [1.0, 1.0, 1.0])],
        "material_mode": "textured" if asset.get("textured") else "neutral",
        "keyframes": [],
        "enabled": True,
        "locked": True,
        "asset": str(asset.get("asset_path", "")),
        "reconstruction": {
            "version": 2,
            "role": "reference",
            "provider": str(provider_summary.get("geometry", "")) or "reconstruction",
            "source_kind": source_kind,
            "confidence": float(asset.get("confidence", 0.0)),
        },
    }


def _camera_track(
    blockout: BlockoutScene,
    *,
    width: int,
    height: int,
    fps: float,
    duration_seconds: float,
) -> dict[str, Any]:
    if blockout.scan_camera_track:
        # Already a full track dict built by the scan camera-track task.
        track = dict(blockout.scan_camera_track)
        track.setdefault("schema_version", 1)
        track.setdefault("objects", [])
        track.setdefault("metadata", {})
        track["width"], track["height"] = width, height
        return track

    total_frames = max(1, round(duration_seconds * fps))
    cam = blockout.source_camera
    if cam is not None:
        position = [float(v) for v in cam.position]
        target = [float(v) for v in cam.target]
        fov = float(cam.fov_y_degrees)
        near, far = float(cam.near), float(cam.far)
    else:
        position, target, fov, near, far = [0.0, 0.0, 0.0], [0.0, 0.0, -1.0], 50.0, 0.01, 10000.0

    return {
        "schema_version": 1,
        "fps": int(fps),
        "duration_frames": total_frames,
        "width": width,
        "height": height,
        "render_mode": "omni_ref",
        "keyframes": [
            {
                "frame": 0,
                "camera": {
                    "position": position,
                    "target": target,
                    "fov": fov,
                    "roll": 0.0,
                    "camera_type": "perspective",
                    "zoom": 1.0,
                    "near": near,
                    "far": far,
                },
                "interpolation": "hold",
            }
        ],
        "objects": [],
        "metadata": {},
    }


def compile_blockout_scene(
    blockout: BlockoutScene,
    *,
    canvas_width: int,
    canvas_height: int,
    source_asset_ref: str = "",
    source_kind: str = "single_image",
    mode: str = "blockout",
    duration_seconds: float = 5.0,
    fps: float = 24.0,
    asset_placements: list[Any] | None = None,
    asset_mode: str = "off",
) -> dict[str, Any]:
    """Return a fully validated MotionScene v1 dictionary.

    ``asset_placements`` (from :mod:`omnicam.reconstruction.asset_library`) adds
    a ``reconstruction_assets`` branch of retrieved GLB props. ``asset_mode``
    ``"replace"`` also hides the blockout box each prop stands in for; ``"proxy"``
    keeps both.
    """
    width = int(canvas_width)
    height = int(canvas_height)
    provider_summary = dict(blockout.provider_summary)
    placements = list(asset_placements or [])
    replaced_ids = (
        {str(p.source_object_id) for p in placements} if asset_mode == "replace" else set()
    )

    objects: list[dict[str, Any]] = [
        _null(_ROOT_ID, "Reconstructed Scene"),
        _null(_ROOM_ID, "Room", _ROOT_ID),
        _null(_BLOCKOUT_ID, "Blockout", _ROOT_ID),
    ]

    for proxy in build_room_proxies(list(blockout.room_planes)):
        objects.append(_room_object(proxy, provider_summary, source_kind))

    for obj in blockout.objects:
        node = _blockout_object(obj, provider_summary, source_kind)
        if obj.object_id in replaced_ids:
            node["enabled"] = False  # the retrieved GLB takes its place
        objects.append(node)

    if placements:
        objects.append(_null(_ASSETS_ID, "Assets", _ROOT_ID))
        for placement in placements:
            objects.append(_asset_object(placement, provider_summary, source_kind))

    if blockout.reference_asset:
        objects.append(_null(_REFERENCE_ID, "Reference", _ROOT_ID))
        objects.append(_reference_object(blockout.reference_asset, provider_summary, source_kind))

    camera_track = _camera_track(
        blockout, width=width, height=height, fps=fps, duration_seconds=duration_seconds
    )
    # A scan trajectory is a recovered path, not something to re-author: label it
    # accordingly and mark it locked so Director adoption keeps it read-only
    # (docs/NODES.md promises a read-only Scan Camera).
    is_scan_track = mode == "scan" and blockout.scan_camera_track is not None
    camera_item = {
        "id": "camera_1",
        "label": "Scan Camera" if is_scan_track else "Source Camera",
        "enabled": True,
        "locked": bool(is_scan_track),
        "track": camera_track,
    }

    # A supplied scan track carries its own length; the scene timeline has to
    # agree with it or MotionScene validation rejects the pair.
    track_fps = float(camera_track.get("fps", fps)) or fps
    track_frames = int(camera_track.get("duration_frames", round(duration_seconds * fps)))
    effective_duration = track_frames / track_fps if track_fps else duration_seconds

    capped_warnings = [str(w)[:240] for w in blockout.warnings[:32]]

    scene_payload = {
        "version": 1,
        "timeline": {
            "duration_seconds": float(effective_duration),
            "authoring_fps": float(track_fps),
        },
        "canvas": {"width": width, "height": height},
        "cameras": [camera_item],
        "active_camera_id": "camera_1",
        "playblast_camera_id": "camera_1",
        "objects": objects,
        "motion_layers": [],
        "cuts": [],
        "metadata": {
            "reconstruction": {
                "version": 2,
                "provider": provider_summary.get("geometry", ""),
                "source_kind": source_kind,
                "source_asset": source_asset_ref,
                "mode": mode,
                "coordinate_system": "gltf_y_up_z_back",
                "provider_summary": provider_summary,
                "asset_mode": asset_mode if placements else "off",
                "asset_count": len(placements),
                "warnings": capped_warnings,
            }
        },
    }

    return MotionScene.from_dict(scene_payload).to_dict()
