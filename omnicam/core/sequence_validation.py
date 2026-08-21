"""Validation and sanitization for OmniCam Sequencer editorial state (Schema v2)."""

from __future__ import annotations

import copy
import math
import re
from typing import Any

from .validation import validate_track_payload

SEQUENCE_STATE_SCHEMA_VERSION = 2
MAX_SHOTS = 32
MAX_AUDIO_TRACKS = 16
MAX_SOURCE_FRAMES = 14_400
MAX_RETIME_KEYS = 256
MAX_TEXT_LENGTH = 4_096
_SLOT_RE = re.compile(
    r"^(?:(?:shot|audio|collection_shot)[0-9]+|audio_from_collection_shot[0-9]+)$"
)


def _bounded_int(value: Any, default: int, minimum: int, maximum: int) -> int:
    try:
        result = int(value)
    except (TypeError, ValueError, OverflowError):
        result = default
    return max(minimum, min(maximum, result))


def _bounded_float(value: Any, default: float, minimum: float, maximum: float) -> float:
    try:
        result = float(value)
    except (TypeError, ValueError, OverflowError):
        result = default
    if not math.isfinite(result):
        result = default
    return max(minimum, min(maximum, result))


def _text(value: Any, default: str = "") -> str:
    return str(default if value is None else value)[:MAX_TEXT_LENGTH]


def _slot(value: Any, default: str) -> str:
    candidate = str(value or default)
    return candidate if _SLOT_RE.fullmatch(candidate) else default


def _sanitize_curve(raw: Any) -> dict[str, Any]:
    keys = raw.get("keys", []) if isinstance(raw, dict) else []
    clean = []
    for key in keys[:MAX_RETIME_KEYS] if isinstance(keys, list) else []:
        if not isinstance(key, dict):
            continue
        interpolation = str(key.get("interpolation", "bezier"))
        if interpolation not in {"constant", "linear", "bezier"}:
            interpolation = "bezier"
        clean.append({
            "frame": _bounded_float(key.get("frame"), 0.0, 0.0, float(MAX_SOURCE_FRAMES)),
            "value": _bounded_float(key.get("value"), 1.0, 0.01, 100.0),
            "interpolation": interpolation,
            "tangents": key.get("tangents", {}) if isinstance(key.get("tangents"), dict) else {},
        })
    clean.sort(key=lambda item: item["frame"])
    return {"keys": clean or [{"frame": 0.0, "value": 1.0, "interpolation": "constant", "tangents": {}}]}


def create_default_sequence_state(fps_num: int = 24, fps_den: int = 1) -> dict[str, Any]:
    """Create a clean default sequence state document."""
    return {
        "schema_version": SEQUENCE_STATE_SCHEMA_VERSION,
        "timeline": {
            "fps_num": max(1, int(fps_num)),
            "fps_den": max(1, int(fps_den)),
            "playhead_frame": 0,
        },
        "shot_order": [],
        "shots": {},
        "audio_tracks": {},
    }


def validate_shot_entry(shot_id: str, raw_shot: dict[str, Any], default_source_slot: str = "shot1") -> dict[str, Any]:
    """Sanitize and validate an individual shot dictionary."""
    if not isinstance(raw_shot, dict):
        raw_shot = {}

    name = _text(raw_shot.get("name") or shot_id)
    source_slot = _slot(raw_shot.get("source_slot"), default_source_slot)
    enabled = bool(raw_shot.get("enabled", True))

    source = raw_shot.get("source", {}) if isinstance(raw_shot.get("source"), dict) else {}
    src_dur = _bounded_int(source.get("duration_frames"), 120, 1, MAX_SOURCE_FRAMES)
    src_fps_n = _bounded_int(source.get("fps_num"), 24, 1, 1000)
    src_fps_d = _bounded_int(source.get("fps_den"), 1, 1, 1001)

    trim = raw_shot.get("trim", {}) if isinstance(raw_shot.get("trim"), dict) else {}
    in_frame = _bounded_int(trim.get("in_frame"), 0, 0, src_dur - 1)
    out_frame = _bounded_int(trim.get("out_frame"), src_dur - 1, in_frame, src_dur - 1)

    retime = raw_shot.get("retime", {}) if isinstance(raw_shot.get("retime"), dict) else {}
    retime_enabled = bool(retime.get("enabled", False))
    retime_mode = str(retime.get("mode", "absolute_speed"))
    if retime_mode not in {"absolute_speed", "fit_duration"}:
        retime_mode = "absolute_speed"
    retime_interp = str(retime.get("interpolation", "blend"))
    if retime_interp not in {"nearest", "blend"}:
        retime_interp = "blend"
    curve = _sanitize_curve(retime.get("curve"))

    tl = raw_shot.get("timeline", {}) if isinstance(raw_shot.get("timeline"), dict) else {}
    start_f = _bounded_int(tl.get("start_frame"), 0, 0, MAX_SOURCE_FRAMES * MAX_SHOTS)
    dur_f = _bounded_int(tl.get("duration_frames"), out_frame - in_frame + 1, 1, MAX_SOURCE_FRAMES)
    end_f = start_f + dur_f - 1

    return {
        "id": str(shot_id),
        "name": name,
        "source_slot": source_slot,
        "enabled": enabled,
        "source": {
            "duration_frames": src_dur,
            "fps_num": src_fps_n,
            "fps_den": src_fps_d,
        },
        "trim": {
            "in_frame": in_frame,
            "out_frame": out_frame,
        },
        "retime": {
            "enabled": retime_enabled,
            "mode": retime_mode,
            "interpolation": retime_interp,
            "curve": curve,
        },
        "timeline": {
            "start_frame": start_f,
            "duration_frames": dur_f,
            "end_frame": end_f,
        },
        "prompt": _text(raw_shot.get("prompt", "")),
        "description": _text(raw_shot.get("description", "")),
        "tags": [_text(tag, "") for tag in raw_shot.get("tags", [])[:64]] if isinstance(raw_shot.get("tags"), list) else [],
        "camera_track": validate_track_payload(raw_shot["camera_track"]) if isinstance(raw_shot.get("camera_track"), dict) else None,
        "metadata": copy.deepcopy(raw_shot.get("metadata", {})) if isinstance(raw_shot.get("metadata"), dict) else {},
    }


def validate_audio_entry(audio_id: str, raw_audio: dict[str, Any], default_source_slot: str = "audio1") -> dict[str, Any]:
    """Sanitize and validate an individual audio track dictionary."""
    if not isinstance(raw_audio, dict):
        raw_audio = {}

    name = _text(raw_audio.get("name") or audio_id)
    source_slot = _slot(raw_audio.get("source_slot"), default_source_slot)
    enabled = bool(raw_audio.get("enabled", True))

    tl = raw_audio.get("timeline", {}) if isinstance(raw_audio.get("timeline"), dict) else {}
    start_frame = _bounded_int(tl.get("start_frame"), 0, 0, MAX_SOURCE_FRAMES * MAX_SHOTS)

    trim = raw_audio.get("trim", {}) if isinstance(raw_audio.get("trim"), dict) else {}
    in_seconds = _bounded_float(trim.get("in_seconds"), 0.0, 0.0, 86_400.0)
    out_seconds = _bounded_float(trim.get("out_seconds"), in_seconds, in_seconds, 86_400.0) if trim.get("out_seconds") is not None else None

    gain_db = _bounded_float(raw_audio.get("gain_db"), 0.0, -96.0, 24.0)
    pan = _bounded_float(raw_audio.get("pan"), 0.0, -1.0, 1.0)

    fade = raw_audio.get("fade", {}) if isinstance(raw_audio.get("fade"), dict) else {}
    fade_in = _bounded_float(fade.get("in_seconds"), 0.0, 0.0, 3_600.0)
    fade_out = _bounded_float(fade.get("out_seconds"), 0.0, 0.0, 3_600.0)

    linked = raw_audio.get("linked_shot_id")
    linked_shot_id = str(linked) if linked else None
    audio_retime_mode = str(raw_audio.get("audio_retime_mode", "fixed"))
    if audio_retime_mode not in {"follow_video", "fixed", "mute_when_retimed"}:
        audio_retime_mode = "fixed"

    return {
        "id": str(audio_id),
        "name": name,
        "source_slot": source_slot,
        "enabled": enabled,
        "timeline": {"start_frame": start_frame},
        "trim": {"in_seconds": in_seconds, "out_seconds": out_seconds},
        "gain_db": gain_db,
        "pan": pan,
        "fade": {"in_seconds": fade_in, "out_seconds": fade_out},
        "linked_shot_id": linked_shot_id,
        "audio_retime_mode": audio_retime_mode,
        "mute": bool(raw_audio.get("mute", False)),
        "solo": bool(raw_audio.get("solo", False)),
    }


def validate_sequence_state(payload: dict[str, Any] | None) -> dict[str, Any]:
    """Validate and normalize a sequence state document, upgrading schema v1 if needed."""
    if not payload or not isinstance(payload, dict):
        return create_default_sequence_state()

    state = copy.deepcopy(payload)
    tl = state.get("timeline", {}) if isinstance(state.get("timeline"), dict) else {}
    fps_n = _bounded_int(tl.get("fps_num", state.get("fps", 24)), 24, 1, 1000)
    fps_d = _bounded_int(tl.get("fps_den", 1), 1, 1, 1001)
    playhead = _bounded_int(tl.get("playhead_frame"), 0, 0, MAX_SOURCE_FRAMES * MAX_SHOTS)

    raw_shots = state.get("shots", {})
    shot_order = state.get("shot_order", [])

    sanitized_shots: dict[str, dict[str, Any]] = {}
    sanitized_order: list[str] = []

    if isinstance(raw_shots, list):
        # Migration from list-based shots (v1 sequence)
        for idx, shot in enumerate(raw_shots[:MAX_SHOTS]):
            sid = f"shot_{idx + 1:03d}"
            sanitized_shots[sid] = validate_shot_entry(sid, shot, f"shot{idx + 1}")
            sanitized_order.append(sid)
    elif isinstance(raw_shots, dict):
        for sid, shot in list(raw_shots.items())[:MAX_SHOTS]:
            if isinstance(shot, dict):
                sanitized_shots[str(sid)] = validate_shot_entry(str(sid), shot, "shot1")

        if isinstance(shot_order, list) and shot_order:
            for sid in shot_order:
                sid_str = str(sid)
                if sid_str in sanitized_shots and sid_str not in sanitized_order:
                    sanitized_order.append(sid_str)
        # Add any missing shots to order
        for sid in sanitized_shots:
            if sid not in sanitized_order:
                sanitized_order.append(sid)

    raw_audio = state.get("audio_tracks", {})
    sanitized_audio: dict[str, dict[str, Any]] = {}
    if isinstance(raw_audio, dict):
        for aid, audio in list(raw_audio.items())[:MAX_AUDIO_TRACKS]:
            if isinstance(audio, dict):
                sanitized_audio[str(aid)] = validate_audio_entry(str(aid), audio, "audio1")

    return {
        "schema_version": SEQUENCE_STATE_SCHEMA_VERSION,
        "timeline": {
            "fps_num": fps_n,
            "fps_den": fps_d,
            "playhead_frame": playhead,
        },
        "shot_order": sanitized_order,
        "shots": sanitized_shots,
        "audio_tracks": sanitized_audio,
    }
