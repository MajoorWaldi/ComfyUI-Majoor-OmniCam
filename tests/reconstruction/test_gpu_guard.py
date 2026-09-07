"""Tests for the reconstruction per-stage GPU guard (plan Task 19)."""

from __future__ import annotations

import pytest

from omnicam.reconstruction.errors import ReconCancelledError, ReconGpuContentionError
from omnicam.reconstruction.gpu_guard import GpuStageGuard


class _Cancel:
    def __init__(self, cancelled=False):
        self._c = cancelled

    def is_cancelled(self):
        return self._c


def test_checkpoint_passes_when_idle():
    GpuStageGuard(execution_probe=lambda: False, cancel=_Cancel()).checkpoint()  # no raise


def test_checkpoint_raises_on_contention():
    with pytest.raises(ReconGpuContentionError):
        GpuStageGuard(execution_probe=lambda: True).checkpoint()


def test_checkpoint_raises_on_cancel_before_probe():
    calls = []
    guard = GpuStageGuard(execution_probe=lambda: calls.append(1) or True, cancel=_Cancel(True))
    with pytest.raises(ReconCancelledError):
        guard.checkpoint()
    assert calls == []  # cancel short-circuits, probe never runs


def test_broken_probe_does_not_mask_the_run():
    def _boom():
        raise RuntimeError("probe exploded")

    GpuStageGuard(execution_probe=_boom).checkpoint()  # treated as not-busy, no raise
