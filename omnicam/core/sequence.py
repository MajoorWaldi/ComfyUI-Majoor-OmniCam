from __future__ import annotations

import json
from typing import Any

from .track import OmniCamTrack

SEQUENCE_SCHEMA_VERSION = 1


def build_sequence(tracks: list[dict[str, Any]], names: list[str] | None = None, settings: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    shots = []
    cursor = 0
    sequence_fps = None
    names = names or []
    settings = settings or []
    for index, payload in enumerate(tracks):
        track = OmniCamTrack.from_dict(payload)
        if sequence_fps is None:
            sequence_fps = track.fps
        elif track.fps != sequence_fps:
            raise ValueError("All OmniCam sequence shots must use the same fps")
        shot_settings = settings[index] if index < len(settings) and isinstance(settings[index], dict) else {}
        shots.append(
            {
                "index": index,
                "name": names[index] if index < len(names) and names[index] else f"Shot {index + 1:03d}",
                "start_frame": cursor,
                "end_frame": cursor + track.duration_frames - 1,
                "duration_frames": track.duration_frames,
                "track": track.to_dict(),
                "handles": {"in": max(0, int(shot_settings.get("handle_in", 0))), "out": max(0, int(shot_settings.get("handle_out", 0)))},
                "adapter_settings": shot_settings.get("adapter_settings", {}) if isinstance(shot_settings.get("adapter_settings"), dict) else {},
                "reference": shot_settings.get("reference"),
            }
        )
        cursor += track.duration_frames
    return {
        "schema_version": SEQUENCE_SCHEMA_VERSION,
        "fps": sequence_fps or 24,
        "duration_frames": cursor,
        "shots": shots,
        "metadata": {},
    }


def validate_sequence(payload: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise TypeError("OmniCam sequence must be an object")
    if int(payload.get("schema_version", 0)) != SEQUENCE_SCHEMA_VERSION:
        raise ValueError(f"Unsupported OmniCam sequence schema: {payload.get('schema_version')}")
    raw_shots = payload.get("shots")
    if not isinstance(raw_shots, list) or not raw_shots:
        raise ValueError("OmniCam sequence requires at least one shot")
    tracks = []
    names = []
    for shot in raw_shots:
        if not isinstance(shot, dict) or not isinstance(shot.get("track"), dict):
            raise TypeError("Each OmniCam shot requires a camera track")
        tracks.append(shot["track"])
        names.append(str(shot.get("name", "")))
    settings = [
        {
            "handle_in": shot.get("handles", {}).get("in", 0) if isinstance(shot.get("handles"), dict) else 0,
            "handle_out": shot.get("handles", {}).get("out", 0) if isinstance(shot.get("handles"), dict) else 0,
            "adapter_settings": shot.get("adapter_settings", {}),
            "reference": shot.get("reference"),
        }
        for shot in raw_shots
    ]
    normalized = build_sequence(tracks, names, settings)
    normalized["metadata"] = payload.get("metadata", {}) if isinstance(payload.get("metadata"), dict) else {}
    return normalized


def sequence_to_json(payload: dict[str, Any]) -> str:
    return json.dumps(validate_sequence(payload), indent=2)


def playblast_manifest(payload: dict[str, Any]) -> list[dict[str, Any]]:
    sequence = validate_sequence(payload)
    return [
        {
            "shot": shot["name"],
            "start_frame": shot["start_frame"],
            "end_frame": shot["end_frame"],
            "recording_path": shot["track"].get("metadata", {}).get("recording_path", ""),
        }
        for shot in sequence["shots"]
    ]
