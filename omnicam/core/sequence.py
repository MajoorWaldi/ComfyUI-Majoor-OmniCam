"""Multi-camera edit over the shared timeline.

Mirrors ``web-src/director/sequence.js``: every camera is animated on the same
timeline and the edit partitions it, so a cut only stores where it *starts* --
its end is the next cut's start, or the last frame.

The proxy video is recorded by the browser with the edit already applied (the
playblast follows the cuts), so nothing here assembles video. What it does
produce is the *merged camera track*, so an exported trajectory describes the
edit rather than whichever single camera happened to be selected.
"""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

# Sentinel stored in the editor's playblast_camera_id when the target is the edit.
SEQUENCE_TARGET = "__sequence__"


def resolve_cuts(state: dict[str, Any]) -> list[dict[str, Any]]:
    """Ordered cuts that fall inside the timeline, with their ends resolved.

    Cuts beyond the end are dropped from the result but never from the state:
    shortening a shot hides them, lengthening it brings them back.
    """
    sequence = state.get("sequence")
    if not isinstance(sequence, dict):
        return []
    duration = max(1, int(state.get("duration_frames") or 1))
    last_frame = duration - 1
    known = {
        str(camera.get("id"))
        for camera in (state.get("cameras") or [])
        if isinstance(camera, dict) and camera.get("id")
    }
    seen: set[int] = set()
    cuts: list[dict[str, Any]] = []
    for cut in sequence.get("cuts") or []:
        if not isinstance(cut, dict):
            continue
        camera_id = str(cut.get("camera_id") or "")
        if known and camera_id not in known:
            continue
        try:
            start = max(0, round(float(cut.get("start") or 0)))
        except (TypeError, ValueError):
            continue
        if start > last_frame or start in seen:
            continue
        seen.add(start)
        cuts.append({"camera_id": camera_id, "start": start})
    cuts.sort(key=lambda cut: cut["start"])
    if cuts:
        cuts[0]["start"] = 0
    return [
        {
            "camera_id": cut["camera_id"],
            "start": cut["start"],
            "end": cuts[index + 1]["start"] - 1 if index + 1 < len(cuts) else last_frame,
        }
        for index, cut in enumerate(cuts)
    ]


def sequence_enabled(state: dict[str, Any]) -> bool:
    sequence = state.get("sequence")
    return bool(isinstance(sequence, dict) and sequence.get("enabled")) and bool(resolve_cuts(state))


def sequence_recording_path(state: dict[str, Any]) -> str:
    sequence = state.get("sequence")
    if not isinstance(sequence, dict):
        return ""
    return str(sequence.get("recording_path") or "")


def targets_sequence(state: dict[str, Any]) -> bool:
    """True when the editor recorded the edit rather than a single camera."""
    return state.get("playblast_camera_id") == SEQUENCE_TARGET and sequence_enabled(state)


def merge_cut_tracks(tracks_by_camera: dict[str, Any], cuts: list[dict[str, Any]], base_track: Any) -> dict[str, Any]:
    """One keyframe per frame, sampled from whichever camera owns that frame.

    A cut is a discontinuity, so a sparse interpolated track cannot describe it:
    the frames on either side of a boundary belong to different cameras. Baking
    every frame is the only honest representation, and it is what an exported
    glTF/USD/CHAN needs in order to match the proxy.
    """
    payload = base_track.to_dict()
    keyframes: list[dict[str, Any]] = []
    for cut in cuts:
        track = tracks_by_camera.get(cut["camera_id"])
        if track is None:
            continue
        for frame in range(int(cut["start"]), int(cut["end"]) + 1):
            keyframes.append({
                "frame": frame,
                "camera": asdict(track.sample(frame)),
                "interpolation": "linear",
            })
    if keyframes:
        payload["keyframes"] = keyframes
    payload["metadata"] = {
        **(payload.get("metadata") or {}),
        "sequence_cuts": cuts,
        "camera_id": SEQUENCE_TARGET,
        "camera_name": "Sequence",
    }
    return payload
