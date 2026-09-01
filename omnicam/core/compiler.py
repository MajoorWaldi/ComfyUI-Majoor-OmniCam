"""Canonical Editor State to Track compiler entrypoint."""

from __future__ import annotations

from typing import Any

from .editor_state import EDITOR_STATE_TYPE, editor_state_to_track
from .migrations import EDITOR_STATE_SCHEMA, migrate_payload
from .motion_scene import MotionScene
from .sequence import SEQUENCE_TARGET, resolve_cuts
from .track import OmniCamTrack
from .validation import validate_editor_state


def compile_editor_state(payload: dict[str, Any], camera_id: str | None = None) -> OmniCamTrack:
    """Migrate, validate, select the playblast camera and compile canonical data."""
    return OmniCamTrack.from_dict(editor_state_to_track(payload, camera_id=camera_id, validate=True))


def compile_editor_scene(payload: dict[str, Any]) -> MotionScene:
    """Compile the complete multi-camera editor document into a MotionScene."""
    state = validate_editor_state(migrate_payload(payload, EDITOR_STATE_SCHEMA))
    raw_cameras = state.get("cameras")
    if isinstance(raw_cameras, list) and raw_cameras:
        cameras = raw_cameras
    else:
        cameras = [
            {
                "id": "camera_1",
                "name": "Camera 1",
                "enabled": True,
                "camera": state.get("camera", {}),
                "keyframes": state.get("keyframes", []),
            }
        ]

    active_camera_id = str(state.get("active_camera_id") or cameras[0]["id"])
    raw_playblast_target = str(state.get("playblast_camera_id") or active_camera_id)
    camera_ids = {str(camera["id"]) for camera in cameras}
    playblast_camera_id = (
        raw_playblast_target if raw_playblast_target in camera_ids else active_camera_id
    )
    fps = float(state["fps"])
    duration_seconds = float(state["duration_frames"]) / fps
    cuts = [
        {
            "camera_id": cut["camera_id"],
            "time_seconds": float(cut["start"]) / fps,
            "end_time_seconds": float(cut["end"] + 1) / fps,
        }
        for cut in resolve_cuts(state)
    ]

    scene_payload = {
        "version": 1,
        "timeline": {
            "duration_seconds": duration_seconds,
            "authoring_fps": fps,
        },
        "canvas": {"width": state["width"], "height": state["height"]},
        "cameras": [
            {
                "id": str(camera["id"]),
                "label": str(camera.get("name") or camera["id"]),
                "enabled": camera.get("enabled", True),
                "track": editor_state_to_track(
                    {**state, "cameras": cameras},
                    camera_id=str(camera["id"]),
                    validate=False,
                ),
            }
            for camera in cameras
        ],
        "active_camera_id": active_camera_id,
        "playblast_camera_id": playblast_camera_id,
        "objects": state.get("objects", []),
        "motion_layers": state.get("motion_layers", []),
        "cuts": cuts,
        "metadata": {
            **state.get("metadata", {}),
            "source_schema": EDITOR_STATE_TYPE,
            **(
                {"playblast_target": SEQUENCE_TARGET}
                if raw_playblast_target == SEQUENCE_TARGET
                else {}
            ),
        },
    }
    return MotionScene.from_dict(scene_payload)
