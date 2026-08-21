"""Unit tests for audio trim, fades, and multi-track mixing."""

import torch

from omnicam.audio.fades import apply_audio_fades
from omnicam.audio.mixer import mix_audio_tracks
from omnicam.audio.trim import trim_audio_waveform


def test_audio_trim():
    sr = 44100
    wave = torch.ones((2, sr * 2))  # 2 seconds
    trimmed = trim_audio_waveform(wave, sr, in_seconds=0.5, out_seconds=1.5)
    assert trimmed.shape == (2, sr * 1)


def test_audio_fades():
    sr = 1000
    wave = torch.ones((2, 1000))
    faded = apply_audio_fades(wave, sr, fade_in_seconds=0.1, fade_out_seconds=0.1)
    # Start sample should be 0, end sample near 0
    assert faded[0, 0] == 0.0
    assert faded[0, -1] == 0.0
    assert faded[0, 500] == 1.0


def test_audio_mixer_multitrack_gain_pan_solo():
    sr = 44100
    wave1 = torch.ones((1, sr))
    wave2 = torch.ones((1, sr)) * 0.5

    tracks = [
        {"id": "t1", "enabled": True, "waveform": wave1, "sample_rate": sr, "start_seconds": 0.0, "gain_db": -6.0, "pan": -1.0},
        {"id": "t2", "enabled": True, "waveform": wave2, "sample_rate": sr, "start_seconds": 0.5, "gain_db": 0.0, "pan": 1.0},
    ]
    mixed = mix_audio_tracks(tracks, target_sample_rate=sr, total_duration_seconds=2.0)
    assert mixed is not None
    assert mixed["sample_rate"] == sr
    assert mixed["waveform"].shape[1] == 2  # stereo
    assert mixed["waveform"].shape[2] == sr * 2


def test_audio_mixer_clips_tracks_to_sequence_duration():
    sr = 100
    wave = torch.ones((1, sr * 5))
    mixed = mix_audio_tracks(
        [{"enabled": True, "waveform": wave, "sample_rate": sr, "start_seconds": 1.0}],
        target_sample_rate=sr,
        total_duration_seconds=2.0,
    )
    assert mixed["waveform"].shape[-1] == sr * 2
