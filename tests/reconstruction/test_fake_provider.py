"""Tests for fake provider protocol conformance and evidence output."""

from __future__ import annotations

import pytest
import torch

from omnicam.reconstruction.providers.base import ReconstructionProvider
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import ReconstructionSource

from .fakes import FakeCancelToken, FakeReconstructionProvider


def test_fake_provider_protocol_conformance():
    provider: ReconstructionProvider = FakeReconstructionProvider()
    assert provider.provider_id == "fake"
    caps = provider.capabilities()
    assert caps.available is True
    assert "geometry" in caps.modes
    assert "annotated_input" in caps.source_kinds


def test_fake_provider_evidence_structure():
    provider = FakeReconstructionProvider(grid_size=16)
    source = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings(provider="fake")

    progress_events = []

    def on_progress(stage, pct, msg):
        progress_events.append((stage, pct, msg))

    evidence = provider.reconstruct(source, settings, progress=on_progress)

    assert len(progress_events) == 2
    assert progress_events[0][0] == "INFER_GEOMETRY"
    assert progress_events[1][1] == 0.52

    assert evidence.coordinate_system == "opencv_x_right_y_down_z_forward"
    assert evidence.points.shape == (1, 16, 16, 3)
    assert evidence.depth.shape == (1, 16, 16)
    assert evidence.intrinsics.shape == (1, 3, 3)
    assert evidence.mask.shape == (1, 16, 16)
    assert evidence.normals.shape == (1, 16, 16, 3)
    assert evidence.image.shape == (1, 16, 16, 3)
    assert evidence.points.dtype == torch.float32
    assert evidence.confidence > 0.8


def test_fake_provider_handles_cancellation():
    provider = FakeReconstructionProvider()
    token = FakeCancelToken()
    token.cancel()

    with pytest.raises(RuntimeError, match="cancelled"):
        provider.reconstruct(
            ReconstructionSource(kind="annotated_input", value="room.png"),
            ReconstructionSettings(provider="fake"),
            cancel=token,
        )


def test_fake_provider_simulated_failure():
    provider = FakeReconstructionProvider(fail=True)
    with pytest.raises(RuntimeError, match="Fake provider inference failure"):
        provider.reconstruct(
            ReconstructionSource(kind="annotated_input", value="room.png"),
            ReconstructionSettings(provider="fake"),
        )
