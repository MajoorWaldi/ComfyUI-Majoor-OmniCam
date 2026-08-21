"""Multi-track audio mixer handling gain, pan, offsets, mute/solo."""

from __future__ import annotations

import math
from typing import Any

from .fades import apply_audio_fades
from .trim import trim_audio_waveform


def mix_audio_tracks(
    track_payloads: list[dict[str, Any]],
    target_sample_rate: int = 44100,
    total_duration_seconds: float = 0.0,
) -> dict[str, Any] | None:
    """Mix multiple audio track entries into a single stereo ComfyUI audio dictionary."""
    try:
        import torch
    except ImportError:
        return None

    if not track_payloads:
        return None

    sr = max(1, int(target_sample_rate))
    max_duration = max(0.0, float(total_duration_seconds))

    # Check for solo tracks
    has_solo = any(bool(t.get("solo", False)) for t in track_payloads if t.get("enabled", True))

    active_tracks = []
    for t in track_payloads:
        if not t.get("enabled", True):
            continue
        if has_solo and not t.get("solo", False):
            continue
        if t.get("mute", False):
            continue
        wave = t.get("waveform")
        if wave is not None and isinstance(wave, torch.Tensor):
            active_tracks.append(t)

    if not active_tracks:
        # Return silence if no tracks active
        silence_samples = int(round(max_duration * sr))
        silence = torch.zeros((1, 2, silence_samples), dtype=torch.float32)
        return {"waveform": silence, "sample_rate": sr}

    # Determine total output samples needed
    max_end_sample = max(1, int(round(max_duration * sr)))

    output_buffer = torch.zeros((2, max(1, max_end_sample)), dtype=torch.float32)

    for t in active_tracks:
        wave = t["waveform"].clone().float()
        track_sr = int(t.get("sample_rate", sr))

        # Flatten batch dims if present [1, C, N] -> [C, N] or [N] -> [1, N]
        if wave.ndim == 3 and wave.shape[0] == 1:
            wave = wave.squeeze(0)
        if wave.ndim == 1:
            wave = wave.unsqueeze(0)

        # Resample if needed
        if track_sr != sr and wave.shape[-1] > 1:
            try:
                import torchaudio.transforms as T

                resampler = T.Resample(track_sr, sr)
                wave = resampler(wave)
            except Exception:
                # Basic linear interpolation resample
                new_len = int(round(wave.shape[-1] * sr / track_sr))
                wave = torch.nn.functional.interpolate(wave.unsqueeze(0), size=new_len, mode="linear", align_corners=False).squeeze(0)

        # Trim
        trim_in = float(t.get("trim_in_seconds", 0.0))
        trim_out = t.get("trim_out_seconds")
        wave = trim_audio_waveform(wave, sr, trim_in, trim_out)

        target_duration = t.get("target_duration_seconds")
        if target_duration is not None and wave.shape[-1] > 1:
            target_samples = max(1, int(round(float(target_duration) * sr)))
            wave = torch.nn.functional.interpolate(
                wave.unsqueeze(0), size=target_samples, mode="linear", align_corners=False
            ).squeeze(0)

        # Fades
        fade_in = float(t.get("fade_in_seconds", 0.0))
        fade_out = float(t.get("fade_out_seconds", 0.0))
        wave = apply_audio_fades(wave, sr, fade_in, fade_out)

        # Ensure stereo [2, N]
        if wave.shape[0] == 1:
            wave = wave.repeat(2, 1)
        elif wave.shape[0] > 2:
            wave = wave[:2]

        # Gain (dB -> linear scale)
        gain_db = float(t.get("gain_db", 0.0))
        gain_linear = math.pow(10.0, gain_db / 20.0)

        # Pan (-1.0 left, 0.0 center, 1.0 right)
        pan = max(-1.0, min(1.0, float(t.get("pan", 0.0))))
        angle = (pan + 1.0) * (math.pi / 4.0)  # 0 to pi/2
        pan_left = math.cos(angle) * math.sqrt(2.0)
        pan_right = math.sin(angle) * math.sqrt(2.0)

        wave[0] *= gain_linear * pan_left
        wave[1] *= gain_linear * pan_right

        # Mix into output buffer at start position
        start_sample = max(0, int(round(float(t.get("start_seconds", 0.0)) * sr)))
        clip_len = wave.shape[-1]
        end_sample = min(output_buffer.shape[-1], start_sample + clip_len)
        chunk_len = end_sample - start_sample

        if chunk_len > 0:
            output_buffer[:, start_sample:end_sample] += wave[:, :chunk_len]

    # Normalize/soft-clip if exceeding [-1.0, 1.0]
    peak = torch.max(torch.abs(output_buffer))
    if peak > 1.0:
        output_buffer /= peak

    return {
        "waveform": output_buffer.unsqueeze(0),  # [1, 2, N]
        "sample_rate": sr,
    }
