"""Lightweight shot editing on top of the Director's multi-camera document.

Convention: one camera track = one shot. The editor UI stays thin (a menu,
not a dedicated panel); this module holds the pure operations so they are
unit-testable and reusable from nodes.
"""

from __future__ import annotations

import copy
from typing import Any


def camera_shots(editor_state: dict[str, Any]) -> list[dict[str, Any]]:
    """Return the shot list derived from the editor cameras, in authored order."""
    cameras = editor_state.get("cameras")
    if not isinstance(cameras, list):
        return []
    duration = int(editor_state.get("duration_frames", 120))
    shots = []
    for index, camera in enumerate(cameras):
        if not isinstance(camera, dict):
            continue
        keyframes = camera.get("keyframes") if isinstance(camera.get("keyframes"), list) else []
        shots.append(
            {
                "index": index,
                "id": camera.get("id", f"camera_{index + 1}"),
                "name": camera.get("name", f"Shot {index + 1:03d}"),
                "duration_frames": duration,
                "key_count": len(keyframes),
                "handles": dict(camera.get("handles", {"in": 0, "out": 0})),
            }
        )
    return shots


def set_shot_handles(editor_state: dict[str, Any], camera_id: str, handle_in: int, handle_out: int) -> dict[str, Any]:
    """Store per-shot handle margins on the camera entry (returns a copy)."""
    state = copy.deepcopy(editor_state)
    for camera in state.get("cameras", []):
        if isinstance(camera, dict) and camera.get("id") == camera_id:
            camera["handles"] = {"in": max(0, int(handle_in)), "out": max(0, int(handle_out))}
            return state
    raise ValueError(f"Unknown camera id: {camera_id}")


def reorder_shots(editor_state: dict[str, Any], ordered_ids: list[str]) -> dict[str, Any]:
    """Reorder the camera list; unknown or missing ids are rejected."""
    state = copy.deepcopy(editor_state)
    cameras = state.get("cameras", [])
    by_id = {camera.get("id"): camera for camera in cameras if isinstance(camera, dict)}
    if set(ordered_ids) != set(by_id):
        raise ValueError("Shot order must list every existing camera exactly once")
    state["cameras"] = [by_id[camera_id] for camera_id in ordered_ids]
    return state


def duplicate_shot(editor_state: dict[str, Any], camera_id: str, new_id: str) -> dict[str, Any]:
    """Duplicate a camera track as a new shot appended after the source."""
    state = copy.deepcopy(editor_state)
    cameras = state.get("cameras", [])
    if any(camera.get("id") == new_id for camera in cameras):
        raise ValueError(f"Camera id already exists: {new_id}")
    for index, camera in enumerate(cameras):
        if isinstance(camera, dict) and camera.get("id") == camera_id:
            copy_camera = copy.deepcopy(camera)
            copy_camera["id"] = new_id
            copy_camera["name"] = f"{camera.get('name', 'Shot')} Copy"
            cameras.insert(index + 1, copy_camera)
            return state
    raise ValueError(f"Unknown camera id: {camera_id}")


def shots_to_sequence_settings(editor_state: dict[str, Any]) -> list[dict[str, Any]]:
    """Adapter settings list for the Sequence Builder, preserving handles."""
    settings = []
    for camera in editor_state.get("cameras", []):
        if not isinstance(camera, dict):
            continue
        handles = camera.get("handles", {}) if isinstance(camera.get("handles"), dict) else {}
        settings.append(
            {
                "handle_in": max(0, int(handles.get("in", 0))),
                "handle_out": max(0, int(handles.get("out", 0))),
                "adapter_settings": camera.get("adapter_settings", {}) if isinstance(camera.get("adapter_settings"), dict) else {},
                "reference": camera.get("reference"),
            }
        )
    return settings
