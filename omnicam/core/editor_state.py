"""OMNICAM_EDITOR_STATE: the Director's editor document, kept distinct from the
canonical MAJOOR_OMNICAM_TRACK wire format.

The editor document carries every authored camera track, the selection of the
active and playblast cameras, scene objects and UI preferences. The canonical
track is the model-facing contract; this module defines the explicit conversion
from editor state to the primary track so the two schemas can evolve
independently.
"""

from __future__ import annotations

import math
from typing import Any

from .migrations import EDITOR_STATE_SCHEMA, TRACK_SCHEMA, migrate_payload
from .validation import DEFAULT_LIMITS, TrackLimits, validate_editor_state

EDITOR_STATE_TYPE = "OMNICAM_EDITOR_STATE"
EDITOR_STATE_SCHEMA_VERSION = 1


def _look_at_constraint(camera: dict[str, Any], objects: list[dict[str, Any]]) -> dict[str, Any]:
    object_id = camera.get("target_object_id")
    if not isinstance(object_id, str) or not object_id:
        return {}
    raw_offset = camera.get("target_offset", [0, 0, 0])
    offset = []
    for index in range(3):
        try:
            value = float(raw_offset[index])
        except (IndexError, TypeError, ValueError):
            value = 0.0
        offset.append(value if math.isfinite(value) else 0.0)
    target = next((obj for obj in objects if obj.get("id") == object_id), None)
    status = "missing_target" if target is None else ("disabled_target" if target.get("enabled", True) is False else "active")
    return {"look_at": {"object_id": object_id, "offset": offset, "space": "world", "status": status}}


def select_track_camera(payload: dict[str, Any], camera_id: str | None = None) -> dict[str, Any]:
    """Pick the camera sub-track that becomes the canonical primary track.

    Priority: explicit camera_id → playblast_camera_id → active_camera_id → first camera.
    """
    cameras = payload.get("cameras")
    if not isinstance(cameras, list) or not cameras:
        # Legacy or minimal payloads carry the primary track at the top level.
        return {
            "id": payload.get("active_camera_id", "camera_1"), "name": "Camera 1",
            "camera": payload.get("camera", {}), "keyframes": payload.get("keyframes", []),
            "target_object_id": payload.get("target_object_id"), "target_offset": payload.get("target_offset", [0, 0, 0]),
        }
    for wanted in (camera_id, payload.get("playblast_camera_id"), payload.get("active_camera_id")):
        if wanted is None:
            continue
        for camera in cameras:
            if isinstance(camera, dict) and camera.get("id") == wanted:
                return camera
        if camera_id is not None and wanted == camera_id:
            raise ValueError(f"Unknown OmniCam camera id: {camera_id}")
    return cameras[0]


def editor_state_to_track(payload: dict[str, Any], camera_id: str | None = None, *, validate: bool = True, limits: TrackLimits | None = None) -> dict[str, Any]:
    """Explicitly convert an OMNICAM_EDITOR_STATE document to a MAJOOR_OMNICAM_TRACK payload."""
    state = migrate_payload(payload, EDITOR_STATE_SCHEMA)
    if validate:
        state = validate_editor_state(state, limits or DEFAULT_LIMITS)
    camera = select_track_camera(state, camera_id)
    objects = state.get("objects", [])
    constraints = _look_at_constraint(camera, objects)
    track = {
        "schema_version": 1,
        "fps": state.get("fps", 24),
        "duration_frames": state.get("duration_frames", 120),
        "width": state.get("width", 1280),
        "height": state.get("height", 720),
        "render_mode": state.get("render_mode", "omni_ref"),
        "camera": camera.get("camera"),
        "keyframes": camera.get("keyframes", []),
        "objects": objects,
        **({"constraints": constraints} if constraints else {}),
        "metadata": {
            **(state.get("metadata") if isinstance(state.get("metadata"), dict) else {}),
            "source_schema": EDITOR_STATE_SCHEMA,
            "camera_id": camera.get("id"),
            "camera_name": camera.get("name"),
        },
    }
    return migrate_payload(track, TRACK_SCHEMA)
