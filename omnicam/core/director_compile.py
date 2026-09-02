"""Build a MotionScene from a Director's raw editor state.

Shared by the Director node's own ``execute()`` -- where ``upstream_track``
comes from a connected, freshly-solved Extractor -- and the Monitor's live
preflight route, which has no upstream import to offer and always passes
``upstream_track=None``. One function means the two can never quietly
disagree about what a Director's current widgets compile to; before this
existed, that logic lived inline in the node and a route built to reuse it
would have been reimplementing it from memory.
"""

from __future__ import annotations

import json
from typing import Any

from .compiler import compile_editor_scene
from .editor_state import editor_state_to_track
from .motion_scene import MotionScene
from .sequence import sequence_recording_path, targets_sequence
from .track import OmniCamTrack
from .upstream_track import resolve_director_camera_track


def parse_director_state(state_json: str) -> dict[str, Any]:
    """The Director's own JSON contract: invalid JSON is a ``ValueError``."""
    try:
        parsed = json.loads(state_json) if state_json else {}
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid OmniCam state JSON: {exc}") from exc
    return parsed if isinstance(parsed, dict) else {}


def compile_director_motion_scene(
    raw_state: dict[str, Any],
    *,
    width: int,
    height: int,
    fps: int,
    duration_seconds: float,
    render_mode: str,
    card_asset: str = "",
    recording_path: str = "",
    upstream_track: dict[str, Any] | None = None,
) -> tuple[MotionScene, str]:
    """The MotionScene a Director with this state and these queue widgets compiles to.

    Returns the scene plus the recording path it resolved -- the exact
    ``active_recording_path`` selection ``playblast_video`` is built from --
    so a caller that also needs the playblast file does not have to re-derive
    which camera's recording, or the sequence's, is authoritative.
    """
    authoritative_state = {
        **raw_state,
        "width": int(width),
        "height": int(height),
        "fps": int(fps),
        "duration_frames": max(1, round(float(duration_seconds) * int(fps))),
        "render_mode": str(render_mode),
    }
    effective_track = resolve_director_camera_track(
        local_track=editor_state_to_track(authoritative_state, validate=True),
        upstream_track=upstream_track,
        width=int(width),
        height=int(height),
        render_mode=str(render_mode),
    )
    effective_track.update(
        {
            "fps": int(fps),
            "duration_frames": authoritative_state["duration_frames"],
            "width": int(width),
            "height": int(height),
            "render_mode": str(render_mode),
        }
    )
    track = OmniCamTrack.from_dict(effective_track)
    scene = compile_editor_scene(authoritative_state)
    selected_camera_id = str(track.metadata.get("camera_id") or scene.playblast_camera_id)
    selected_camera = next(
        (camera for camera in scene.cameras if camera.id == selected_camera_id),
        None,
    )
    if selected_camera is None:
        selected_camera = next(
            camera for camera in scene.cameras if camera.id == scene.playblast_camera_id
        )
    selected_camera.track = track

    edit_is_target = targets_sequence(authoritative_state)
    if edit_is_target and sequence_recording_path(authoritative_state):
        active_recording_path = sequence_recording_path(authoritative_state)
    else:
        raw_cameras = raw_state.get("cameras")
        raw_selected = next(
            (
                camera
                for camera in raw_cameras
                if isinstance(camera, dict) and camera.get("id") == scene.playblast_camera_id
            ),
            None,
        ) if isinstance(raw_cameras, list) else None
        active_recording_path = str(
            (raw_selected or {}).get("recording_path") or recording_path
        )

    scene.metadata.update(
        {
            "card_asset": card_asset,
            "recording_path": active_recording_path,
            "generator": "ComfyUI-Majoor-OmniCam",
        }
    )
    validated_scene = MotionScene.from_dict(scene.to_dict())
    return validated_scene, active_recording_path
