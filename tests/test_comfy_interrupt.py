"""Comfy job cancellation propagates into a queued solve and its DPVO child.

A queued Extractor solve polls a ComfyInterruptControl at every bounded wait.
When ComfyUI cancels the job, that poll raises, the solver abandons through its
existing cooperative-stop path, the spawned DPVO child is reaped, and the frame
exchange directory is removed.
"""

from __future__ import annotations

import numpy as np
import pytest

from omnicam.comfy_compat import interrupt as interrupt_mod
from omnicam.comfy_compat.interrupt import ComfyInterruptControl, check_interrupted


class _Interrupted(RuntimeError):
    """Stand-in for comfy.model_management.InterruptProcessingException."""


@pytest.fixture(autouse=True)
def _reset_interrupt_cache(monkeypatch):
    # Never touch the real ComfyUI primitive from a unit test.
    monkeypatch.setattr(interrupt_mod, "_LOOKED", False)
    monkeypatch.setattr(interrupt_mod, "_CHECK", None)


def test_check_interrupted_calls_the_resolved_primitive(monkeypatch):
    calls = []
    monkeypatch.setattr(interrupt_mod, "_LOOKED", True)
    monkeypatch.setattr(interrupt_mod, "_CHECK", lambda: calls.append(1))
    check_interrupted()
    check_interrupted()
    assert calls == [1, 1]


def test_check_interrupted_is_a_no_op_without_comfyui(monkeypatch):
    monkeypatch.setattr(interrupt_mod, "_LOOKED", True)
    monkeypatch.setattr(interrupt_mod, "_CHECK", None)
    check_interrupted()  # must not raise


def test_resolution_is_attempted_once_then_latched(monkeypatch):
    real_import = __builtins__["__import__"] if isinstance(__builtins__, dict) else __import__
    comfy_import_attempts = []

    def counting_import(name, *args, **kwargs):
        if name.startswith("comfy"):
            comfy_import_attempts.append(name)
            raise ImportError("no comfy in this test")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr("builtins.__import__", counting_import)
    check_interrupted()
    check_interrupted()
    check_interrupted()
    assert interrupt_mod._LOOKED is True
    assert len(comfy_import_attempts) == 1  # resolved once, then cached as None


def test_control_checkpoint_propagates_the_interruption():
    control = ComfyInterruptControl(check=lambda: (_ for _ in ()).throw(_Interrupted()))
    with pytest.raises(_Interrupted):
        control.checkpoint()


def test_control_cancelled_is_true_only_when_the_check_raises():
    assert ComfyInterruptControl(check=lambda: None).cancelled() is False
    raising = ComfyInterruptControl(check=lambda: (_ for _ in ()).throw(_Interrupted()))
    assert raising.cancelled() is True


def test_a_cancelled_dpvo_solve_reaps_the_child_and_clears_the_exchange(monkeypatch, tmp_path):
    from omnicam.extractor.backends.dpvo import DpvoBackend
    from omnicam.extractor.intrinsics import resolve_intrinsics
    from omnicam.extractor.types import VideoFrameSample

    frames = [
        VideoFrameSample(
            source_frame=i,
            timestamp_seconds=i / 24.0,
            rgb=np.zeros((48, 64, 3), dtype=np.uint8),
        )
        for i in range(3)
    ]
    intrinsics = resolve_intrinsics(
        width=64, height=48, lens_mode="auto",
        fov_degrees=53.0, focal_length_mm=24.0, sensor_width_mm=36.0,
    )

    # The control passes the pre-exchange checkpoint, then raises once the fake
    # runner polls it -- exactly where a real Comfy cancel would land mid-solve.
    ticks = {"n": 0}

    def check():
        ticks["n"] += 1
        if ticks["n"] >= 2:
            raise _Interrupted()

    reaped = []

    class Runner:
        def solve(self, request, *, progress, control, on_source_frame,
                  on_features, on_finalizing, pre_release_guard=None):
            try:
                control.checkpoint()  # -> raises _Interrupted, like a real cancel
                raise AssertionError("unreachable: the cancel must abort the solve")
            finally:
                # A real DpvoProcessRunner reaps its spawned child here.
                reaped.append(True)

    monkeypatch.setattr(DpvoBackend, "availability", classmethod(lambda cls: _ok()))
    monkeypatch.setattr(
        "omnicam.extractor.backends.dpvo._managed_exchange_root", lambda: tmp_path
    )

    with pytest.raises(_Interrupted):
        DpvoBackend(runner_factory=Runner).solve(
            frames, intrinsics, control=ComfyInterruptControl(check=check),
        )

    assert reaped == [True]  # the runner's own cleanup path ran
    assert list(tmp_path.iterdir()) == []  # exchange directory removed by the backend


def _ok():
    from omnicam.extractor.backends.base import BackendAvailability

    return BackendAvailability(True)
