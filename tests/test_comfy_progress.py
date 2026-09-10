"""High-level Comfy execution progress adapter.

The Extractor reports coarse progress through ComfyUI's own execution API so
the frontend node bar stays authoritative. This adapter must forward value and
max, never move backward, never raise, and map solve phases onto fixed
percentage bands.
"""

from __future__ import annotations

import pytest

from omnicam.comfy_compat.progress import (
    CAMERA_TRACK_PHASES,
    SCENE_RECONSTRUCT_PHASES,
    ExecutionProgress,
)


def test_execution_progress_forwards_value_and_max():
    calls = []
    progress = ExecutionProgress(setter=lambda **kwargs: calls.append(kwargs))
    progress.update(3, 10)
    assert calls == [{"value": 3.0, "max_value": 10.0}]


def test_execution_progress_is_monotonic():
    calls = []
    progress = ExecutionProgress(setter=lambda **kwargs: calls.append(kwargs))
    progress.update(40, 100)
    progress.update(20, 100)  # a late/low report must be dropped
    progress.update(41, 100)
    assert [call["value"] for call in calls] == [40.0, 41.0]


def test_execution_progress_clamps_into_range():
    calls = []
    progress = ExecutionProgress(setter=lambda **kwargs: calls.append(kwargs))
    progress.update(250, 100)
    progress.update(-5, 100)
    assert calls == [{"value": 100.0, "max_value": 100.0}]


def test_execution_progress_never_raises_when_the_sink_throws():
    def boom(**_kwargs):
        raise RuntimeError("sink down")

    progress = ExecutionProgress(setter=boom)
    progress.update(10, 100)  # must not propagate


def test_execution_progress_is_silent_without_a_sink():
    ExecutionProgress(setter=None).update(10, 100)  # no ComfyUI -> no-op, no error


def test_phase_maps_a_fraction_into_its_band():
    calls = []
    progress = ExecutionProgress(setter=lambda **kwargs: calls.append(kwargs))
    progress.phase(CAMERA_TRACK_PHASES["tracking"], 0.5)  # 5..85 -> 45
    assert calls[-1] == {"value": 45.0, "max_value": 100.0}
    progress.phase_done(CAMERA_TRACK_PHASES["solver"])  # -> 97
    assert calls[-1] == {"value": 97.0, "max_value": 100.0}


def test_frame_reporter_has_the_solver_callback_shape():
    calls = []
    progress = ExecutionProgress(setter=lambda **kwargs: calls.append(kwargs))
    report = progress.frame_reporter(CAMERA_TRACK_PHASES["tracking"])
    report(0, 0)  # zero-length clip must not divide by zero
    report(80, 160)  # halfway through tracking -> 45
    assert calls[-1]["value"] == pytest.approx(45.0)


def test_phase_bands_cover_zero_to_one_hundred_without_gaps():
    for bands in (CAMERA_TRACK_PHASES, SCENE_RECONSTRUCT_PHASES):
        ordered = sorted(bands.values())
        assert ordered[0][0] == 0.0
        assert ordered[-1][1] == 100.0
        for (_, end), (start, _) in zip(ordered, ordered[1:]):
            assert end == start
