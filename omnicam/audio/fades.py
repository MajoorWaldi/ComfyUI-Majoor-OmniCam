"""Volume fade envelopes for audio clips."""

from __future__ import annotations

from typing import Any


def apply_audio_fades(
    waveform: Any,
    sample_rate: int,
    fade_in_seconds: float = 0.0,
    fade_out_seconds: float = 0.0,
) -> Any:
    """Apply linear fade-in and fade-out envelopes to waveform tensor."""
    if waveform is None:
        return None

    try:
        import torch

        if not isinstance(waveform, torch.Tensor):
            return waveform

        sr = max(1, int(sample_rate))
        num_samples = waveform.shape[-1]
        if num_samples <= 1:
            return waveform

        fade_in_n = min(num_samples // 2, int(round(fade_in_seconds * sr)))
        fade_out_n = min(num_samples // 2, int(round(fade_out_seconds * sr)))

        if fade_in_n <= 0 and fade_out_n <= 0:
            return waveform

        out_wave = waveform.clone()

        if fade_in_n > 0:
            ramp_in = torch.linspace(0.0, 1.0, fade_in_n, dtype=waveform.dtype, device=waveform.device)
            out_wave[..., :fade_in_n] *= ramp_in

        if fade_out_n > 0:
            ramp_out = torch.linspace(1.0, 0.0, fade_out_n, dtype=waveform.dtype, device=waveform.device)
            out_wave[..., num_samples - fade_out_n :] *= ramp_out

        return out_wave
    except Exception:
        return waveform
