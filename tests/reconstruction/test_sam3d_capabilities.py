"""SAM3D capability gate + inference adapter (plan Tasks 30, 31)."""

from __future__ import annotations

import numpy as np
import pytest

from omnicam.reconstruction.completion.sam3d_objects import Sam3dObjectsCompletionProvider
from omnicam.reconstruction.errors import ReconInferenceFailedError, ReconProviderUnavailableError


def _config(tmp_path):
    (tmp_path / "pipeline.yaml").write_text("model: sam3d\n", encoding="utf-8")
    return tmp_path


def _provider(tmp_path, **over):
    kw = dict(
        config_root=_config(tmp_path),
        system="Linux",
        cuda_available=True,
        vram_gb=40.0,
        has_package=True,
    )
    kw.update(over)
    return Sam3dObjectsCompletionProvider(**kw)


def test_capability_requires_linux(tmp_path):
    caps = _provider(tmp_path, system="Windows").capabilities()
    assert caps.available is False
    assert "linux" in caps.reason.lower()


def test_capability_requires_cuda(tmp_path):
    caps = _provider(tmp_path, cuda_available=False).capabilities()
    assert caps.available is False
    assert "cuda" in caps.reason.lower()


def test_capability_requires_32gb_vram_no_override(tmp_path):
    caps = _provider(tmp_path, vram_gb=24.0).capabilities()
    assert caps.available is False
    assert "32" in caps.reason


def test_capability_requires_package(tmp_path):
    caps = _provider(tmp_path, has_package=False).capabilities()
    assert caps.available is False
    assert "package" in caps.reason.lower()


def test_capability_requires_pipeline_config(tmp_path):
    empty = tmp_path / "empty"
    empty.mkdir()
    caps = _provider(tmp_path, config_root=empty).capabilities()
    assert caps.available is False
    assert "pipeline" in caps.reason.lower()


def test_capability_available_when_everything_present(tmp_path):
    caps = _provider(tmp_path).capabilities()
    assert caps.available is True
    assert caps.metadata["min_vram_gb"] == 32.0


def test_complete_raises_on_unsupported_machine(tmp_path):
    provider = _provider(tmp_path, system="Windows")
    with pytest.raises(ReconProviderUnavailableError):
        provider.complete(np.zeros((8, 8, 3), np.uint8), np.ones((8, 8), bool), seed=1)


class _FakeGS:
    def __init__(self, xyz, opacity):
        self.get_xyz = xyz
        self.get_opacity = opacity


class _FakeInference:
    def __init__(self, config, compile=False):
        self.config = config

    def __call__(self, image, mask, *, seed):
        xyz = np.random.default_rng(seed).random((200, 3)).astype("float32")
        opacity = np.concatenate([np.ones(150), np.zeros(50)]).astype("float32")
        return {"gs": _FakeGS(xyz, opacity)}


def test_inference_adapter_returns_active_points(tmp_path):
    provider = _provider(tmp_path, inference_class=_FakeInference)
    out = provider.complete(np.zeros((16, 16, 3), np.uint8), np.ones((16, 16), bool), seed=7)
    assert out.provider_id == "sam3d_objects"
    assert len(out.points_local) == 150  # only opacity > 0.5
    assert out.confidence == pytest.approx(0.75)


def test_inference_adapter_rejects_too_few_points(tmp_path):
    class _Sparse(_FakeInference):
        def __call__(self, image, mask, *, seed):
            return {"gs": _FakeGS(np.zeros((10, 3), "float32"), np.ones(10, "float32"))}

    provider = _provider(tmp_path, inference_class=_Sparse)
    with pytest.raises(ReconInferenceFailedError):
        provider.complete(np.zeros((8, 8, 3), np.uint8), np.ones((8, 8), bool), seed=1)
