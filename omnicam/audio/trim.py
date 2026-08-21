"""Audio trimming helpers based on sample ranges or seconds."""

from __future__ import annotations

from typing import Any


def trim_audio_waveform(
    waveform: Any,
    sample_rate: int,
    in_seconds: float = 0.0,
    out_seconds: float | None = None,
) -> Any:
    """Trim audio waveform tensor according to in_seconds and out_seconds."""
    if waveform is None:
        return None

    try:
        import torch

        if not isinstance(waveform, torch.Tensor):
            return waveform

        sr = max(1, int(sample_rate))
        total_samples = waveform.shape[-1]

        start_sample = max(0, min(total_samples, int(round(in_seconds * sr))))
        if out_seconds is not None:
            end_sample = max(start_sample, min(total_samples, int(round(out_seconds * sr))))
        else:
            end_sample = total_samples

        if start_sample >= end_sample:
            # Return 1 frame / empty sample of silence
            shape = list(waveform.shape)
            shape[-1] = 1
            return torch.zeros(shape, dtype=waveform.dtype, device=waveform.device)

        return waveform[..., start_sample:end_sample]
    except Exception:
        return waveform
