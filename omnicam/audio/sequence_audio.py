"""Sequence audio assembler connecting timeline slots and editor tracks."""

from __future__ import annotations

from typing import Any

from .mixer import mix_audio_tracks


def assemble_sequence_audio(
    sequence_state: dict[str, Any],
    audio_inputs: dict[str, Any],
    fps: float = 24.0,
    total_duration_seconds: float = 0.0,
    sequence_time: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    """Assemble and mix all connected audio inputs based on sequence state."""
    raw_audio_tracks = sequence_state.get("audio_tracks", {})
    if not raw_audio_tracks and not audio_inputs:
        return _silence(total_duration_seconds)

    track_payloads = []
    fps_val = max(1.0, float(fps))
    shot_times = {shot.get("id"): shot.get("timeline", {}) for shot in (sequence_time or {}).get("shots", [])}

    # Process explicitly authored tracks in sequence state
    for audio_id, track_def in raw_audio_tracks.items():
        if not isinstance(track_def, dict) or not track_def.get("enabled", True):
            continue
        source_slot = str(track_def.get("source_slot") or "audio1")
        slot_data = audio_inputs.get(source_slot)
        if slot_data is None or not isinstance(slot_data, dict):
            continue

        waveform = slot_data.get("waveform")
        sample_rate = int(slot_data.get("sample_rate", 44100))

        linked_shot_id = track_def.get("linked_shot_id")
        linked_timing = shot_times.get(linked_shot_id, {})
        retime_mode = str(track_def.get("audio_retime_mode", "fixed"))
        linked_shot = sequence_state.get("shots", {}).get(linked_shot_id, {})
        if retime_mode == "mute_when_retimed" and linked_shot.get("retime", {}).get("enabled"):
            continue
        start_frame = int(linked_timing.get("start_frame", track_def.get("timeline", {}).get("start_frame", 0))) if linked_shot_id else int(track_def.get("timeline", {}).get("start_frame", 0))
        start_seconds = start_frame / fps_val

        trim = track_def.get("trim", {})
        fade = track_def.get("fade", {})

        track_payloads.append(
            {
                "id": audio_id,
                "name": str(track_def.get("name") or audio_id),
                "enabled": bool(track_def.get("enabled", True)),
                "waveform": waveform,
                "sample_rate": sample_rate,
                "start_seconds": start_seconds,
                "trim_in_seconds": float(trim.get("in_seconds", 0.0)),
                "trim_out_seconds": float(trim["out_seconds"]) if trim.get("out_seconds") is not None else None,
                "gain_db": float(track_def.get("gain_db", 0.0)),
                "pan": float(track_def.get("pan", 0.0)),
                "fade_in_seconds": float(fade.get("in_seconds", 0.0)),
                "fade_out_seconds": float(fade.get("out_seconds", 0.0)),
                "mute": bool(track_def.get("mute", False)),
                "solo": bool(track_def.get("solo", False)),
                "target_duration_seconds": linked_timing.get("duration_seconds") if linked_shot_id and retime_mode == "follow_video" else None,
            }
        )

    # If state has no tracks configured but audio_inputs are connected, auto-mix connected slots at start 0.0
    if not track_payloads and audio_inputs:
        for slot_name, slot_data in sorted(audio_inputs.items()):
            if slot_data is None or not isinstance(slot_data, dict):
                continue
            waveform = slot_data.get("waveform")
            sample_rate = int(slot_data.get("sample_rate", 44100))
            if waveform is not None:
                track_payloads.append(
                    {
                        "id": slot_name,
                        "name": slot_name,
                        "enabled": True,
                        "waveform": waveform,
                        "sample_rate": sample_rate,
                        "start_seconds": 0.0,
                        "trim_in_seconds": 0.0,
                        "trim_out_seconds": None,
                        "gain_db": 0.0,
                        "pan": 0.0,
                        "fade_in_seconds": 0.0,
                        "fade_out_seconds": 0.0,
                        "mute": False,
                        "solo": False,
                    }
                )

    if not track_payloads:
        return _silence(total_duration_seconds)

    return mix_audio_tracks(track_payloads, target_sample_rate=44100, total_duration_seconds=total_duration_seconds)


def _silence(duration_seconds: float, sample_rate: int = 44100) -> dict[str, Any]:
    import torch

    count = max(1, int(round(max(0.0, float(duration_seconds)) * sample_rate)))
    return {"waveform": torch.zeros((1, 2, count), dtype=torch.float32), "sample_rate": sample_rate}
