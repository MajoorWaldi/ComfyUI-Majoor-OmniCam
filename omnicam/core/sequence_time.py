"""OMNICAM_SEQUENCE_TIME schema, builder and prompt timing generators."""

from __future__ import annotations

import json
from typing import Any

from .retime import build_retime_map

SEQUENCE_TIME_SCHEMA_VERSION = 1


def _format_time_seconds(seconds: float) -> str:
    """Format seconds into MM:SS.mmm."""
    mins = int(seconds // 60)
    secs = seconds % 60
    return f"{mins:02d}:{secs:06.3f}"


def _format_timecode(frame: int, fps: float) -> str:
    """Format frame into standard SMPTE timecode HH:MM:SS:FF."""
    effective_fps = max(1.0, float(fps))
    total_secs = int(frame // effective_fps)
    ff = int(frame % effective_fps)
    hh = total_secs // 3600
    mm = (total_secs % 3600) // 60
    ss = total_secs % 60
    return f"{hh:02d}:{mm:02d}:{ss:02d}:{ff:02d}"


def build_sequence_time(sequence_state: dict[str, Any], fps_num: int = 24, fps_den: int = 1) -> dict[str, Any]:
    """Build canonical OMNICAM_SEQUENCE_TIME dictionary from sequence state."""
    fps_n = max(1, int(fps_num))
    fps_d = max(1, int(fps_den))
    fps_float = fps_n / fps_d

    raw_shots = sequence_state.get("shots", {})
    shot_order = sequence_state.get("shot_order", [])
    if not shot_order and isinstance(raw_shots, dict):
        shot_order = list(raw_shots.keys())

    timeline_shots: list[dict[str, Any]] = []
    current_timeline_frame = 0

    for shot_id in shot_order:
        shot = raw_shots.get(shot_id) if isinstance(raw_shots, dict) else None
        if not isinstance(shot, dict) or not shot.get("enabled", True):
            continue

        name = str(shot.get("name") or shot_id)
        source_meta = shot.get("source", {})
        trim = shot.get("trim", {})
        in_frame = int(trim.get("in_frame", 0))
        source_duration = int(source_meta.get("duration_frames", 120))
        out_frame = int(trim.get("out_frame", source_duration - 1))
        trimmed_source_duration = max(1, out_frame - in_frame + 1)
        source_fps = max(1.0, float(source_meta.get("fps_num", fps_n)) / max(1.0, float(source_meta.get("fps_den", 1))))
        speed_scale = source_fps / fps_float

        retime_cfg = shot.get("retime", {})
        retime_enabled = bool(retime_cfg.get("enabled", False))
        retime_mode = str(retime_cfg.get("mode", "absolute_speed"))

        if retime_enabled:
            retime_map = build_retime_map(
                retime_cfg.get("curve"),
                source_duration=trimmed_source_duration,
                target_duration=shot.get("timeline", {}).get("duration_frames"),
                mode=retime_mode,
                speed_scale=speed_scale,
            )
            duration_frames = retime_map.output_duration
            retime_info = {
                "enabled": True,
                "mode": retime_mode,
                "average_speed": round(retime_map.average_speed, 3),
                "minimum_speed": round(retime_map.minimum_speed, 3),
                "maximum_speed": round(retime_map.maximum_speed, 3),
            }
        else:
            duration_frames = max(1, int(round(trimmed_source_duration / speed_scale)))
            retime_info = {
                "enabled": False,
                "mode": "none",
                "average_speed": 1.0,
                "minimum_speed": 1.0,
                "maximum_speed": 1.0,
            }

        start_frame = current_timeline_frame
        end_frame = start_frame + duration_frames - 1
        start_seconds = start_frame / fps_float
        end_seconds = (end_frame + 1) / fps_float
        duration_seconds = duration_frames / fps_float

        timeline_shots.append(
            {
                "id": str(shot_id),
                "name": name,
                "timeline": {
                    "start_frame": start_frame,
                    "end_frame": end_frame,
                    "start_seconds": round(start_seconds, 3),
                    "end_seconds": round(end_seconds, 3),
                    "duration_frames": duration_frames,
                    "duration_seconds": round(duration_seconds, 3),
                },
                "source": {
                    "in_frame": in_frame,
                    "out_frame": out_frame,
                },
                "retime": retime_info,
                "prompt": str(shot.get("prompt", "")),
                "description": str(shot.get("description", "")),
                "tags": list(shot.get("tags", [])),
            }
        )
        current_timeline_frame += duration_frames

    total_duration_frames = current_timeline_frame
    total_duration_seconds = total_duration_frames / fps_float

    raw_audio = sequence_state.get("audio_tracks", {})
    audio_list: list[dict[str, Any]] = []
    for audio_id, audio in raw_audio.items():
        if not isinstance(audio, dict) or not audio.get("enabled", True):
            continue
        start_f = int(audio.get("timeline", {}).get("start_frame", 0))
        trim_in = float(audio.get("trim", {}).get("in_seconds", 0.0))
        trim_out = audio.get("trim", {}).get("out_seconds")
        start_s = start_f / fps_float
        source_duration = max(0.0, float(trim_out) - trim_in) if trim_out is not None else max(0.0, total_duration_seconds - start_s)
        end_s = start_s + source_duration
        audio_list.append(
            {
                "id": str(audio_id),
                "name": str(audio.get("name") or audio_id),
                "start_seconds": round(start_s, 3),
                "end_seconds": round(end_s, 3),
            }
        )

    return {
        "schema_version": SEQUENCE_TIME_SCHEMA_VERSION,
        "fps_num": fps_n,
        "fps_den": fps_d,
        "duration": {
            "frames": total_duration_frames,
            "seconds": round(total_duration_seconds, 3),
        },
        "shots": timeline_shots,
        "audio": audio_list,
    }


def sequence_time_to_json(sequence_time: dict[str, Any]) -> str:
    """Format sequence time dict as pretty-printed JSON."""
    return json.dumps(sequence_time, indent=2)


def sequence_time_to_prompt(sequence_time: dict[str, Any], format: str = "seconds") -> str:
    """Generate prompt timing text for prompt conditioning and multi-shot descriptions."""
    fmt = format.lower().strip()
    fps = sequence_time.get("fps_num", 24) / max(1, sequence_time.get("fps_den", 1))
    shots = sequence_time.get("shots", [])
    if not shots:
        return ""

    lines = []
    for shot in shots:
        name = shot.get("name", "Shot")
        tl = shot.get("timeline", {})
        start_s = tl.get("start_seconds", 0.0)
        end_s = tl.get("end_seconds", 0.0)
        start_f = tl.get("start_frame", 0)
        end_f = tl.get("end_frame", 0)
        dur_f = tl.get("duration_frames", 0)
        dur_s = tl.get("duration_seconds", 0.0)
        prompt_desc = shot.get("prompt") or shot.get("description") or ""

        if fmt == "seconds":
            header = f"[{_format_time_seconds(start_s)} - {_format_time_seconds(end_s)}] {name}"
            if prompt_desc:
                lines.append(f"{header}: {prompt_desc}")
            else:
                lines.append(header)
        elif fmt == "timecode":
            header = f"[{_format_timecode(start_f, fps)} - {_format_timecode(end_f, fps)}] {name}"
            if prompt_desc:
                lines.append(f"{header}: {prompt_desc}")
            else:
                lines.append(header)
        elif fmt == "frames":
            header = f"[Frame {start_f} - {end_f}] {name}"
            if prompt_desc:
                lines.append(f"{header}: {prompt_desc}")
            else:
                lines.append(header)
        elif fmt == "verbose":
            entry = [
                f"{name}",
                f"Timeline: {start_s:.3f}s → {end_s:.3f}s",
                f"Frames: {start_f} → {end_f}",
                f"Duration: {dur_f} frames / {dur_s:.3f} sec",
            ]
            retime = shot.get("retime", {})
            if retime.get("enabled"):
                entry.append(f"Retimed: {retime.get('minimum_speed', 1.0):.2f}x → {retime.get('maximum_speed', 1.0):.2f}x (avg {retime.get('average_speed', 1.0):.2f}x)")
            if prompt_desc:
                entry.append(f"Prompt: {prompt_desc}")
            lines.append("\n".join(entry))
        else:
            lines.append(f"[{_format_time_seconds(start_s)} - {_format_time_seconds(end_s)}] {name}")

    separator = "\n\n" if fmt == "verbose" else "\n"
    return separator.join(lines)
