"""Tests for native ComfyUI MoGe provider adapter."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest
import torch

from omnicam.reconstruction.providers.comfy_moge import ComfyMoGeProvider, clear_moge_model_cache
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import ReconstructionSource


@pytest.fixture(autouse=True)
def _reset_moge_model_cache():
    # The model cache is module-level (a fresh provider instance can't carry
    # it -- see providers/__init__.py::get_provider), and several tests below
    # reuse the same checkpoint name without mocking folder_paths, which all
    # degrade to the identical {"name": checkpoint_name} identity. Without
    # this reset, whichever of those tests runs first would seed a cache
    # entry the rest silently reuse instead of calling their own stubbed
    # LoadMoGeModel.execute.
    clear_moge_model_cache()
    yield
    clear_moge_model_cache()


def test_get_moge_module_returns_none_when_comfy_extras_is_absent(monkeypatch):
    # Simulate a ComfyUI without the native MoGe node.
    import sys

    monkeypatch.setitem(sys.modules, "comfy_extras.nodes_moge", None)
    monkeypatch.delitem(sys.modules, "comfy_extras.nodes_moge")
    real_import = __import__

    def fail_moge(name, *args, **kwargs):
        if name == "comfy_extras.nodes_moge" or name == "comfy_extras":
            raise ImportError("no native MoGe here")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr("builtins.__import__", fail_moge)
    assert ComfyMoGeProvider()._get_moge_module() is None


def test_get_moge_module_returns_the_native_module_when_present(monkeypatch):
    import sys
    import types

    stub = types.ModuleType("comfy_extras.nodes_moge")
    stub.LoadMoGeModel = object
    pkg = sys.modules.get("comfy_extras") or types.ModuleType("comfy_extras")
    monkeypatch.setitem(sys.modules, "comfy_extras", pkg)
    monkeypatch.setitem(sys.modules, "comfy_extras.nodes_moge", stub)
    monkeypatch.setattr(pkg, "nodes_moge", stub, raising=False)

    assert ComfyMoGeProvider()._get_moge_module() is stub


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
    # Always present, even when the file can't actually be stat'd (as here) --
    # the cache-key mechanism (pipeline._resolve_provider_version) needs at
    # least a name to build a version string from.
    assert caps.metadata["active_checkpoint"]["name"] == "moge_v2_vit_large.safetensors"


def test_checkpoint_identity_reads_real_size_and_mtime(tmp_path, monkeypatch):
    """The cache key changing with the checkpoint (not staying a fixed "1.0")
    depends on this reading a real, distinguishing size/mtime -- not just
    echoing the filename back."""
    checkpoint_file = tmp_path / "moge-2-vitl-normal.pt"
    checkpoint_file.write_bytes(b"x" * 1234)

    import folder_paths

    monkeypatch.setattr(folder_paths, "get_full_path_or_raise", lambda *a: str(checkpoint_file))

    provider = ComfyMoGeProvider()
    identity = provider._checkpoint_identity("moge-2-vitl-normal.pt")

    assert identity["name"] == "moge-2-vitl-normal.pt"
    assert identity["size"] == 1234
    assert identity["mtime_ns"] == checkpoint_file.stat().st_mtime_ns


def test_checkpoint_identity_degrades_gracefully_when_unresolvable(monkeypatch):
    import folder_paths

    def raise_missing(*_a):
        raise FileNotFoundError("no such checkpoint")

    monkeypatch.setattr(folder_paths, "get_full_path_or_raise", raise_missing)

    provider = ComfyMoGeProvider()
    identity = provider._checkpoint_identity("ghost.safetensors")

    assert identity == {"name": "ghost.safetensors"}


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


def _stub_provider_for_cache_test(monkeypatch, checkpoint_file, image_size=16):
    provider = ComfyMoGeProvider()
    mock_module = MagicMock()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: mock_module)
    monkeypatch.setattr(provider, "_get_checkpoints", lambda: [checkpoint_file.name])
    monkeypatch.setattr(
        provider, "_load_image_tensor", lambda p: torch.zeros((1, image_size, image_size, 3), dtype=torch.float32)
    )

    import folder_paths

    monkeypatch.setattr(folder_paths, "get_full_path_or_raise", lambda *a: str(checkpoint_file))

    mock_model = MagicMock()
    mock_module.LoadMoGeModel.execute.return_value = MagicMock(outputs=[mock_model])
    mock_geom = {
        "points": torch.zeros((1, image_size, image_size, 3)),
        "depth": torch.zeros((1, image_size, image_size)),
        "intrinsics": torch.eye(3).unsqueeze(0),
        "mask": torch.ones((1, image_size, image_size), dtype=torch.bool),
        "normal": torch.zeros((1, image_size, image_size, 3)),
        "image": torch.zeros((1, image_size, image_size, 3)),
    }
    mock_module.MoGeInference.execute.return_value = MagicMock(outputs=[mock_geom])
    return provider, mock_module


def test_reconstruct_reuses_the_model_across_consecutive_cache_misses(tmp_path, monkeypatch):
    """A second reconstruction against the same checkpoint must not reload it
    from disk -- LoadMoGeModel.execute (state-dict read + MoGeModel(sd)
    construction) only runs once for two calls."""
    img_file = tmp_path / "photo.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfake")
    checkpoint_file = tmp_path / "moge_v2.safetensors"
    checkpoint_file.write_bytes(b"weights")

    provider, mock_module = _stub_provider_for_cache_test(monkeypatch, checkpoint_file)
    source = ReconstructionSource(kind="annotated_input", value="photo.png")
    settings = ReconstructionSettings(provider="comfy_moge")

    provider.reconstruct(source, settings, resolved_path=img_file)
    provider.reconstruct(source, settings, resolved_path=img_file)

    mock_module.LoadMoGeModel.execute.assert_called_once()
    assert mock_module.MoGeInference.execute.call_count == 2


def test_reconstruct_reloads_the_model_when_the_checkpoint_file_changes(tmp_path, monkeypatch):
    """A checkpoint replaced on disk (new size/mtime, same name) must not
    serve the stale in-memory model -- this mirrors the cache-key reasoning
    already applied to the on-disk GLB cache in pipeline.py."""
    img_file = tmp_path / "photo.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfake")
    checkpoint_file = tmp_path / "moge_v2.safetensors"
    checkpoint_file.write_bytes(b"weights-v1")

    provider, mock_module = _stub_provider_for_cache_test(monkeypatch, checkpoint_file)
    source = ReconstructionSource(kind="annotated_input", value="photo.png")
    settings = ReconstructionSettings(provider="comfy_moge")

    provider.reconstruct(source, settings, resolved_path=img_file)
    checkpoint_file.write_bytes(b"weights-v2-different-length")
    provider.reconstruct(source, settings, resolved_path=img_file)

    assert mock_module.LoadMoGeModel.execute.call_count == 2


def test_reconstruct_auto_checkpoint_picks_the_first_one(tmp_path, monkeypatch):
    img_file = tmp_path / "photo.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfake")
    ckpt_a = tmp_path / "model_a.safetensors"
    ckpt_a.write_bytes(b"a")

    provider = ComfyMoGeProvider()
    mock_module = MagicMock()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: mock_module)
    monkeypatch.setattr(provider, "_get_checkpoints", lambda: ["model_a.safetensors", "model_b.safetensors"])
    monkeypatch.setattr(provider, "_load_image_tensor", lambda p: torch.zeros((1, 8, 8, 3), dtype=torch.float32))

    import folder_paths

    monkeypatch.setattr(folder_paths, "get_full_path_or_raise", lambda *a: str(ckpt_a))

    mock_module.LoadMoGeModel.execute.return_value = MagicMock(outputs=[MagicMock()])
    mock_module.MoGeInference.execute.return_value = MagicMock(outputs=[{
        "points": torch.zeros((1, 8, 8, 3)),
        "depth": torch.zeros((1, 8, 8)),
        "intrinsics": torch.eye(3).unsqueeze(0),
        "mask": torch.ones((1, 8, 8), dtype=torch.bool),
        "normal": torch.zeros((1, 8, 8, 3)),
        "image": torch.zeros((1, 8, 8, 3)),
    }])

    source = ReconstructionSource(kind="annotated_input", value="photo.png")
    settings = ReconstructionSettings(provider="comfy_moge")  # checkpoint defaults to "auto"
    provider.reconstruct(source, settings, resolved_path=img_file)

    mock_module.LoadMoGeModel.execute.assert_called_once_with("model_a.safetensors")


def test_reconstruct_honors_an_explicit_checkpoint_selection(tmp_path, monkeypatch):
    img_file = tmp_path / "photo.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfake")
    ckpt_b = tmp_path / "model_b.safetensors"
    ckpt_b.write_bytes(b"b")

    provider = ComfyMoGeProvider()
    mock_module = MagicMock()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: mock_module)
    monkeypatch.setattr(provider, "_get_checkpoints", lambda: ["model_a.safetensors", "model_b.safetensors"])
    monkeypatch.setattr(provider, "_load_image_tensor", lambda p: torch.zeros((1, 8, 8, 3), dtype=torch.float32))

    import folder_paths

    monkeypatch.setattr(folder_paths, "get_full_path_or_raise", lambda *a: str(ckpt_b))

    mock_module.LoadMoGeModel.execute.return_value = MagicMock(outputs=[MagicMock()])
    mock_module.MoGeInference.execute.return_value = MagicMock(outputs=[{
        "points": torch.zeros((1, 8, 8, 3)),
        "depth": torch.zeros((1, 8, 8)),
        "intrinsics": torch.eye(3).unsqueeze(0),
        "mask": torch.ones((1, 8, 8), dtype=torch.bool),
        "normal": torch.zeros((1, 8, 8, 3)),
        "image": torch.zeros((1, 8, 8, 3)),
    }])

    source = ReconstructionSource(kind="annotated_input", value="photo.png")
    settings = ReconstructionSettings(provider="comfy_moge", checkpoint="model_b.safetensors")
    provider.reconstruct(source, settings, resolved_path=img_file)

    mock_module.LoadMoGeModel.execute.assert_called_once_with("model_b.safetensors")


def test_reconstruct_rejects_an_unknown_checkpoint_selection(tmp_path, monkeypatch):
    from omnicam.reconstruction.errors import ReconModelMissingError

    img_file = tmp_path / "photo.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfake")

    provider = ComfyMoGeProvider()
    mock_module = MagicMock()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: mock_module)
    monkeypatch.setattr(provider, "_get_checkpoints", lambda: ["model_a.safetensors"])

    source = ReconstructionSource(kind="annotated_input", value="photo.png")
    settings = ReconstructionSettings(provider="comfy_moge", checkpoint="ghost.safetensors")

    with pytest.raises(ReconModelMissingError, match="ghost"):
        provider.reconstruct(source, settings, resolved_path=img_file)
    mock_module.LoadMoGeModel.execute.assert_not_called()


def test_reconstruct_runs_native_calls_under_an_executing_context(tmp_path, monkeypatch):
    """LoadMoGeModel/MoGeInference run outside ComfyUI's prompt queue, but core's
    own comfy.utils.ProgressBar assumes one is always active and falls back to
    PromptServer.instance.last_prompt_id when it isn't -- an attribute that does
    not exist until a real prompt has executed at least once. Without
    CurrentNodeContext, a fresh server crashes with AttributeError the first
    time Scene Reconstruct runs (see get_executing_context() below: it must be
    non-None *during* both native calls, exactly where MoGeInference's internal
    ProgressBar would otherwise read it).
    """
    pytest.importorskip("comfy_execution")
    from comfy_execution.utils import get_executing_context

    img_file = tmp_path / "photo.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfake")

    provider = ComfyMoGeProvider()
    mock_module = MagicMock()
    monkeypatch.setattr(provider, "_get_moge_module", lambda: mock_module)
    monkeypatch.setattr(provider, "_get_checkpoints", lambda: ["test_model.safetensors"])
    monkeypatch.setattr(provider, "_load_image_tensor", lambda p: torch.zeros((1, 8, 8, 3), dtype=torch.float32))

    contexts_seen = []

    def load_model(*_args, **_kwargs):
        contexts_seen.append(get_executing_context())
        return MagicMock(outputs=[MagicMock()])

    def infer(*_args, **_kwargs):
        contexts_seen.append(get_executing_context())
        return MagicMock(outputs=[{
            "points": torch.zeros((1, 8, 8, 3)),
            "depth": torch.zeros((1, 8, 8)),
            "intrinsics": torch.eye(3).unsqueeze(0),
            "mask": torch.ones((1, 8, 8), dtype=torch.bool),
            "normal": torch.zeros((1, 8, 8, 3)),
            "image": torch.zeros((1, 8, 8, 3)),
        }])

    mock_module.LoadMoGeModel.execute.side_effect = load_model
    mock_module.MoGeInference.execute.side_effect = infer

    assert get_executing_context() is None  # sanity: nothing is active beforehand

    source = ReconstructionSource(kind="annotated_input", value="photo.png")
    settings = ReconstructionSettings(provider="comfy_moge")
    provider.reconstruct(source, settings, resolved_path=img_file)

    assert len(contexts_seen) == 2
    assert all(ctx is not None for ctx in contexts_seen)
    assert all(ctx.prompt_id and ctx.node_id for ctx in contexts_seen)
    assert get_executing_context() is None  # and cleaned up afterward
