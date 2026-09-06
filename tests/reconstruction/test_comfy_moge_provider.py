"""Tests for native ComfyUI MoGe provider adapter."""

from __future__ import annotations

from unittest.mock import MagicMock

import torch

from omnicam.reconstruction.providers.comfy_moge import ComfyMoGeProvider
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import ReconstructionSource


def test_capabilities_when_modules_absent(monkeypatch):
    provider = ComfyMoGeProvider()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: None)

    caps = provider.capabilities()
    assert caps.available is False
    assert "not available" in caps.reason.lower()


def test_capabilities_when_checkpoint_missing(monkeypatch):
    provider = ComfyMoGeProvider()
    mock_module = MagicMock()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: mock_module)
    monkeypatch.setattr(provider, "_get_checkpoints", lambda: [])

    caps = provider.capabilities()
    assert caps.available is False
    assert "models/geometry_estimation" in caps.reason


def test_capabilities_when_available(monkeypatch):
    provider = ComfyMoGeProvider()
    mock_module = MagicMock()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: mock_module)
    monkeypatch.setattr(provider, "_get_checkpoints", lambda: ["moge_v2_vit_large.safetensors"])

    caps = provider.capabilities()
    assert caps.available is True
    assert caps.recommended is True
    assert caps.metadata["checkpoints"] == ["moge_v2_vit_large.safetensors"]


def test_reconstruct_with_stubbed_nodes(tmp_path, monkeypatch):
    img_file = tmp_path / "photo.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfake")

    provider = ComfyMoGeProvider()

    # Stub modules and loaders
    mock_module = MagicMock()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: mock_module)
    monkeypatch.setattr(provider, "_get_checkpoints", lambda: ["test_model.safetensors"])
    monkeypatch.setattr(provider, "_load_image_tensor", lambda p: torch.zeros((1, 32, 32, 3), dtype=torch.float32))

    # Stub model and inference execution
    mock_model = MagicMock()
    mock_module.LoadMoGeModel.execute.return_value = MagicMock(outputs=[mock_model])

    mock_geom = {
        "points": torch.zeros((1, 32, 32, 3)),
        "depth": torch.zeros((1, 32, 32)),
        "intrinsics": torch.eye(3).unsqueeze(0),
        "mask": torch.ones((1, 32, 32), dtype=torch.bool),
        "normal": torch.zeros((1, 32, 32, 3)),
        "image": torch.zeros((1, 32, 32, 3)),
    }
    mock_module.MoGeInference.execute.return_value = MagicMock(outputs=[mock_geom])

    source = ReconstructionSource(kind="annotated_input", value="photo.png")
    settings = ReconstructionSettings(provider="comfy_moge", quality="balanced", recover_fov=True)

    progress_events = []

    def on_progress(stage, pct, msg):
        progress_events.append((stage, pct, msg))

    evidence = provider.reconstruct(
        source,
        settings,
        progress=on_progress,
        resolved_path=img_file,
    )

    assert evidence.coordinate_system == "opencv_x_right_y_down_z_forward"
    assert evidence.provider_version == "native-core"
    assert evidence.points.shape == (1, 32, 32, 3)
    assert len(progress_events) >= 1

    # Verify MoGeInference was called with resolution_level=7 for balanced quality
    mock_module.MoGeInference.execute.assert_called_once()
    call_args = mock_module.MoGeInference.execute.call_args[0]
    # resolution_level is 3rd arg in execute(cls, moge_model, image, resolution_level, ...)
    assert call_args[2] == 7


def test_reconstruct_with_node_output_args(tmp_path, monkeypatch):
    class FakeNodeOutput:
        def __init__(self, *args):
            self.args = args

    img_file = tmp_path / "photo.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfake")

    provider = ComfyMoGeProvider()
    mock_module = MagicMock()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: mock_module)
    monkeypatch.setattr(provider, "_get_checkpoints", lambda: ["test_model.safetensors"])
    monkeypatch.setattr(provider, "_load_image_tensor", lambda p: torch.zeros((1, 16, 16, 3), dtype=torch.float32))

    mock_model = MagicMock()
    mock_module.LoadMoGeModel.execute.return_value = FakeNodeOutput(mock_model)

    mock_geom = {
        "points": torch.zeros((1, 16, 16, 3)),
        "depth": torch.zeros((1, 16, 16)),
        "intrinsics": torch.eye(3).unsqueeze(0),
        "mask": torch.ones((1, 16, 16), dtype=torch.bool),
        "normal": torch.zeros((1, 16, 16, 3)),
        "image": torch.zeros((1, 16, 16, 3)),
    }
    mock_module.MoGeInference.execute.return_value = FakeNodeOutput(mock_geom)

    source = ReconstructionSource(kind="annotated_input", value="photo.png")
    settings = ReconstructionSettings(provider="comfy_moge", quality="high")

    evidence = provider.reconstruct(source, settings, resolved_path=img_file)
    assert evidence.points.shape == (1, 16, 16, 3)
    call_args = mock_module.MoGeInference.execute.call_args[0]
    assert call_args[2] == 9  # high quality = level 9
