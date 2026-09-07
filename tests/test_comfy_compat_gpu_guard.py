"""Tests for the shared throttled GPU-contention probe."""

from __future__ import annotations

import pytest

from omnicam.comfy_compat.gpu_guard import GpuContentionDetected, GpuContentionGuard


class FakeClock:
    def __init__(self, start: float = 0.0) -> None:
        self.now = start

    def __call__(self) -> float:
        return self.now

    def advance(self, seconds: float) -> None:
        self.now += seconds


def test_unarmed_guard_never_raises_even_when_the_probe_says_busy():
    guard = GpuContentionGuard(execution_probe=lambda: True)
    guard.check()  # no exception: never armed


def test_no_probe_wired_is_a_clean_noop():
    guard = GpuContentionGuard(execution_probe=None)
    guard.arm()
    guard.check()  # no exception: nothing to ask


def test_armed_guard_raises_once_probe_reports_busy_after_the_poll_interval():
    clock = FakeClock()
    probe_calls = []

    def probe():
        probe_calls.append(clock.now)
        return True

    guard = GpuContentionGuard(execution_probe=probe, clock=clock, poll_seconds=0.5)
    guard.arm()

    # Not immediately: arming schedules the first probe half a second out.
    guard.check()
    assert probe_calls == []

    clock.advance(0.5)
    with pytest.raises(GpuContentionDetected):
        guard.check()
    assert probe_calls == [0.5]


def test_check_is_throttled_between_polls():
    clock = FakeClock()
    probe_calls = []

    def probe():
        probe_calls.append(clock.now)
        return False

    guard = GpuContentionGuard(execution_probe=probe, clock=clock, poll_seconds=0.5)
    guard.arm()
    clock.advance(0.5)

    for _ in range(5):
        guard.check()
        clock.advance(0.05)  # well inside one poll interval

    assert len(probe_calls) == 1


def test_force_check_bypasses_throttling_and_the_armed_flag():
    guard = GpuContentionGuard(execution_probe=lambda: True)
    # Never armed, but force=True must still probe.
    with pytest.raises(GpuContentionDetected):
        guard.check(force=True)


def test_a_probe_that_raises_never_stops_a_healthy_job():
    def broken_probe():
        raise RuntimeError("PromptServer is mid-teardown")

    guard = GpuContentionGuard(execution_probe=broken_probe)
    guard.arm()
    guard.check(force=True)  # no exception: a broken probe degrades to inert


def test_idle_gpu_never_raises():
    guard = GpuContentionGuard(execution_probe=lambda: False)
    guard.arm()
    guard.check(force=True)
