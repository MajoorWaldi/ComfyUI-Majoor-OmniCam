"""OTIO / EDL interchange for OmniCam sequences.

Exports a MAJOOR_OMNICAM_SEQUENCE as CMX3600-style EDL text or OTIO-compatible
JSON. Imports reconstruct the shot skeleton (names, order, durations, handles)
from those formats; camera tracks are not carried by EDL/OTIO, so imported
shots keep empty tracks to be re-authored or merged with existing shots.
"""

from __future__ import annotations

import re
from typing import Any

from .sequence import validate_sequence


def _timecode(frame: int, fps: int) -> str:
    frame = max(0, int(frame))
    fps = max(1, int(fps))
    seconds, ff = divmod(frame, fps)
    minutes, ss = divmod(seconds, 60)
    hours, mm = divmod(minutes, 60)
    return f"{hours:02d}:{mm:02d}:{ss:02d}:{ff:02d}"


def _parse_timecode(value: str, fps: int) -> int:
    parts = value.strip().split(":")
    if len(parts) != 4:
        raise ValueError(f"Invalid EDL timecode: {value}")
    hours, minutes, seconds, frames = (int(part) for part in parts)
    return ((hours * 60 + minutes) * 60 + seconds) * fps + frames


def sequence_to_edl(sequence: dict[str, Any], title: str = "OMNICAM SEQUENCE") -> str:
    """Export a validated sequence as CMX3600-style EDL (one V cut per shot)."""
    seq = validate_sequence(sequence)
    fps = seq["fps"]
    lines = [f"TITLE: {title}", "FCM: NON-DROP FRAME", ""]
    for position, shot in enumerate(seq["shots"], start=1):
        handle_in = shot.get("handles", {}).get("in", 0)
        handle_out = shot.get("handles", {}).get("out", 0)
        source_in = shot["start_frame"] - handle_in
        source_out = shot["end_frame"] + 1 + handle_out
        record_in = shot["start_frame"] - handle_in
        record_out = shot["end_frame"] + 1 + handle_out
        lines.append(
            f"{position:03d}  AX       V     C        "
            f"{_timecode(source_in, fps)} {_timecode(source_out, fps)} "
            f"{_timecode(record_in, fps)} {_timecode(record_out, fps)}"
        )
        lines.append(f"* SHOT: {shot['name']}")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def sequence_to_otio(sequence: dict[str, Any], name: str = "OmniCam Sequence") -> dict[str, Any]:
    """Export a validated sequence as an OTIO-1.0-compatible JSON dict."""
    seq = validate_sequence(sequence)
    fps = seq["fps"]
    clips = []
    for shot in seq["shots"]:
        duration = shot["duration_frames"]
        clips.append(
            {
                "OTIO_SCHEMA": "Clip.2",
                "name": shot["name"],
                "source_range": {
                    "OTIO_SCHEMA": "TimeRange.1",
                    "start_time": {"OTIO_SCHEMA": "RationalTime.1", "value": shot["start_frame"], "rate": fps},
                    "duration": {"OTIO_SCHEMA": "RationalTime.1", "value": duration, "rate": fps},
                },
                "metadata": {"omnicam": {"handles": shot.get("handles", {}), "adapter_settings": shot.get("adapter_settings", {})}},
            }
        )
    return {
        "OTIO_SCHEMA": "Timeline.1",
        "name": name,
        "global_start_time": {"OTIO_SCHEMA": "RationalTime.1", "value": 0, "rate": fps},
        "tracks": {
            "OTIO_SCHEMA": "Stack.1",
            "name": "shots",
            "children": [
                {
                    "OTIO_SCHEMA": "Track.1",
                    "name": "V1",
                    "kind": "Video",
                    "children": clips,
                }
            ],
        },
        "metadata": {"omnicam": {"schema_version": seq["schema_version"], "fps": fps, "duration_frames": seq["duration_frames"]}},
    }


def edl_to_shots(text: str, fps: int = 24) -> list[dict[str, Any]]:
    """Parse a CMX3600-style EDL into a shot skeleton list."""
    shots: list[dict[str, Any]] = []
    event_re = re.compile(r"^(\d{3,})\s+\S+\s+\S+\s+\S+\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)")
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("* SHOT:"):
            # CMX3600 comments annotate the event they follow.
            if shots:
                shots[-1]["name"] = stripped.split(":", 1)[1].strip()
            continue
        match = event_re.match(stripped)
        if not match:
            continue
        record_in = _parse_timecode(match.group(4), fps)
        record_out = _parse_timecode(match.group(5), fps)
        shots.append(
            {
                "name": f"Shot {len(shots) + 1:03d}",
                "duration_frames": max(1, record_out - record_in),
            }
        )
    if not shots:
        raise ValueError("No EDL events found")
    return shots


def otio_to_shots(payload: dict[str, Any], fps: int | None = None) -> list[dict[str, Any]]:
    """Parse an OTIO JSON dict (as produced by sequence_to_otio) into shot skeletons."""
    if not isinstance(payload, dict) or "Timeline" not in str(payload.get("OTIO_SCHEMA", "")):
        raise ValueError("Not an OTIO Timeline payload")
    tracks = payload.get("tracks", {})
    children = tracks.get("children", [])
    video_tracks = [track for track in children if isinstance(track, dict) and track.get("kind", "Video") == "Video"]
    if not video_tracks:
        raise ValueError("OTIO timeline has no video track")
    shots: list[dict[str, Any]] = []
    for clip in video_tracks[0].get("children", []):
        duration_info = clip.get("source_range", {}).get("duration", {})
        rate = fps or int(duration_info.get("rate", 24)) or 24
        shots.append({"name": clip.get("name") or f"Shot {len(shots) + 1:03d}", "duration_frames": max(1, int(duration_info.get("value", rate)))})
    if not shots:
        raise ValueError("OTIO timeline has no clips")
    return shots
