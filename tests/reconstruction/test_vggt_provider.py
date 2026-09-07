"""Tests for the VGGT provider capability gate + Omega variant (Tasks 22, 34)."""

from __future__ import annotations

import pytest

from omnicam.reconstruction.errors import ReconProviderUnavailableError, ReconRequestInvalidError
from omnicam.reconstruction.providers.vggt import VggtProvider
from omnicam.reconstruction.providers.vggt_omega import VggtOmegaResearchProvider


def _make_checkpoint(root, name="VGGT-1B-Commercial"):
    sub = root / name
    sub.mkdir(parents=True)
    (sub / "model.pt").write_bytes(b"weights")
    return sub / "model.pt"


def test_capability_false_without_vggt_package(tmp_path):
    _make_checkpoint(tmp_path)
    caps = VggtProvider(
        model_root=tmp_path, has_vggt_package=False, cuda_available=True
    ).capabilities()
    assert caps.available is False
    assert "vggt" in caps.reason.lower()


def test_capability_false_without_checkpoint(tmp_path):
    caps = VggtProvider(
        model_root=tmp_path, has_vggt_package=True, cuda_available=True
    ).capabilities()
    assert caps.available is False
    assert "checkpoint" in caps.reason.lower()


def test_capability_false_without_cuda(tmp_path):
    _make_checkpoint(tmp_path)
    caps = VggtProvider(
        model_root=tmp_path, has_vggt_package=True, cuda_available=False
    ).capabilities()
    assert caps.available is False
    assert "cuda" in caps.reason.lower()


def test_capability_true_when_everything_present(tmp_path):
    _make_checkpoint(tmp_path)
    caps = VggtProvider(
        model_root=tmp_path, has_vggt_package=True, cuda_available=True
    ).capabilities()
    assert caps.available is True
    assert caps.modes == ["scan"]
    assert caps.metadata["commercial_use"] is True
    assert caps.metadata["auto_select"] is True
    assert "VGGT-1B-Commercial" in caps.metadata["checkpoints"]


def test_auto_prefers_commercial_checkpoint(tmp_path):
    _make_checkpoint(tmp_path, "VGGT-Other")
    _make_checkpoint(tmp_path, "VGGT-1B-Commercial")
    provider = VggtProvider(model_root=tmp_path, has_vggt_package=True, cuda_available=True)
    assert provider.resolve_checkpoint("auto").parent.name == "VGGT-1B-Commercial"
    with pytest.raises(ReconRequestInvalidError):
        provider.resolve_checkpoint("VGGT-Nonexistent")


def test_resolve_checkpoint_raises_when_none_installed(tmp_path):
    with pytest.raises(ReconProviderUnavailableError):
        VggtProvider(model_root=tmp_path).resolve_checkpoint("auto")


def test_omega_is_noncommercial_and_not_auto_selected(tmp_path):
    _make_checkpoint(tmp_path, "VGGT-Omega")
    caps = VggtOmegaResearchProvider(
        model_root=tmp_path, has_vggt_package=True, cuda_available=True
    ).capabilities()
    assert caps.available is True
    assert caps.metadata["commercial_use"] is False
    assert caps.metadata["auto_select"] is False
    assert caps.metadata["license_label"] == "FAIR Noncommercial Research License"
    assert caps.recommended is False


def test_registry_exposes_vggt_providers():
    from omnicam.reconstruction.providers import list_providers

    ids = list_providers()
    assert "vggt" in ids
    assert "vggt_omega_research" in ids


def test_noncommercial_checkpoint_reports_commercial_use_false(tmp_path):
    # The freely-downloadable research checkpoint is "VGGT-1B" (no -Commercial
    # suffix); its presence must not make the panel say commercial use is OK.
    _make_checkpoint(tmp_path, "VGGT-1B")
    caps = VggtProvider(
        model_root=tmp_path, has_vggt_package=True, cuda_available=True
    ).capabilities()
    assert caps.available is True
    assert caps.metadata["commercial_use"] is False
    assert caps.metadata["auto_select"] is False
    assert "VGGT-1B" in caps.metadata["noncommercial_checkpoints"]
    # auto still resolves it (it is the only one installed)
    assert VggtProvider(model_root=tmp_path).resolve_checkpoint("auto").parent.name == "VGGT-1B"


def test_preprocess_resizes_to_a_multiple_of_the_patch_size():
    # Real VGGT asserts H and W are multiples of 14; the fake providers never
    # hit this path, so pin it here.
    import numpy as np

    from omnicam.reconstruction.providers.vggt import _preprocess_vggt_samples

    class _S:
        def __init__(self, h, w):
            self.image = np.random.default_rng(0).random((h, w, 3)).astype("float32")

    batch = _preprocess_vggt_samples([_S(140, 180), _S(200, 200), _S(90, 300)])
    v, c, h, w = batch.shape
    assert v == 3 and c == 3
    assert h % 14 == 0 and w % 14 == 0
    assert w == 518  # width pinned to target
    assert float(batch.min()) >= 0.0 and float(batch.max()) <= 1.0
