"""The extraction pipeline: fixed stage order, from decoded frames to a track."""

import numpy as np
import pytest
from extractor_backend_double import RecordingBackend

from omnicam.extractor.backends.base import SolveError
from omnicam.extractor.pipeline import extract_camera_track, solve_raw_poses
from omnicam.extractor.types import BackendSolveResult


def test_pipeline_gives_the_backend_solver_resolution_intrinsics(clip):
    backend = RecordingBackend()
    extract_camera_track(video=clip, max_dimension=160, backend=backend)
    assert backend.seen_intrinsics.width == 160
    assert backend.seen_intrinsics.height == 90
    assert backend.seen_intrinsics.cx == pytest.approx(80.0)
    # Halving the frames halves the focal length in pixels.
    assert backend.seen_intrinsics.fy == pytest.approx(45.0 / np.tan(np.radians(53.0) / 2), rel=1e-6)
    assert backend.seen_frames[0].rgb.shape[:2] == (90, 160)


def test_pipeline_writes_the_source_lens_not_the_solver_lens(clip):
    result = extract_camera_track(video=clip, max_dimension=160, backend=RecordingBackend())
    assert result.track["keyframes"][0]["camera"]["fov"] == pytest.approx(53.0, abs=1e-6)
    assert (result.track["width"], result.track["height"]) == (320, 180)


def test_pipeline_normalizes_the_origin(clip):
    result = extract_camera_track(video=clip, backend=RecordingBackend(), normalize_origin=True)
    first = result.track["keyframes"][0]["camera"]
    assert first["position"] == pytest.approx([0.0, 0.0, 0.0], abs=1e-9)
    assert first["target"] == pytest.approx([0.0, 0.0, -1.0], abs=1e-9)
    assert first["roll"] == pytest.approx(0.0, abs=1e-9)


def test_pipeline_keeps_the_solved_origin_when_asked(clip):
    result = extract_camera_track(video=clip, backend=RecordingBackend(), normalize_origin=False)
    # The OpenCV -> OmniCam conversion negates Y and Z, and nothing re-anchors.
    assert result.track["keyframes"][0]["camera"]["position"] == pytest.approx([1.0, -2.0, -3.0])


def test_pipeline_converts_the_backend_basis(clip):
    """A backend moving along OpenCV +Z is moving along OmniCam -Z: forwards."""
    result = extract_camera_track(
        video=clip, backend=RecordingBackend(), normalize_origin=True, simplify_keys=False,
        position_smoothing=0.0, rotation_smoothing=0.0,
    )
    last = result.track["keyframes"][-1]["camera"]["position"]
    assert last[2] < -0.5
    assert last[0] == pytest.approx(0.0, abs=1e-9)


def test_pipeline_applies_motion_scale_to_translation_only(clip):
    plain = extract_camera_track(video=clip, backend=RecordingBackend(), simplify_keys=False,
                                 position_smoothing=0.0, rotation_smoothing=0.0)
    scaled = extract_camera_track(video=clip, backend=RecordingBackend(), motion_scale=4.0,
                                  simplify_keys=False, position_smoothing=0.0, rotation_smoothing=0.0)
    a = plain.track["keyframes"][-1]["camera"]
    b = scaled.track["keyframes"][-1]["camera"]
    assert b["position"][2] == pytest.approx(a["position"][2] * 4.0, rel=1e-6)
    assert b["roll"] == pytest.approx(a["roll"], abs=1e-9)
    assert scaled.track["metadata"]["motion_scale"] == 4.0


def test_pipeline_simplifies_a_straight_move_to_two_keys(clip):
    result = extract_camera_track(video=clip, backend=RecordingBackend(), simplify_keys=True)
    assert len(result.track["keyframes"]) == 2
    assert result.track["metadata"]["raw_key_count"] == 24
    assert result.track["metadata"]["simplified_key_count"] == 2


def test_pipeline_can_keep_every_solved_sample(clip):
    result = extract_camera_track(video=clip, backend=RecordingBackend(), simplify_keys=False)
    assert len(result.track["keyframes"]) == 24


def test_pipeline_preserves_source_frames_under_frame_step(clip):
    result = extract_camera_track(video=clip, backend=RecordingBackend(), frame_step=4,
                                  simplify_keys=False)
    assert [key["frame"] for key in result.track["keyframes"]] == [0, 4, 8, 12, 16, 20]
    assert result.track["duration_frames"] == 24
    assert result.track["metadata"]["frame_step"] == 4


def test_pipeline_reports_coverage_as_confidence_and_carries_warnings(clip):
    result = extract_camera_track(video=clip, backend=RecordingBackend(coverage=0.75))
    assert result.confidence == pytest.approx(0.75)
    assert result.track["metadata"]["confidence_kind"] == "solver_coverage"
    assert "solver said so" in result.track["metadata"]["warnings"]


def test_pipeline_stamps_a_fingerprint_matching_the_track(clip):
    result = extract_camera_track(video=clip, backend=RecordingBackend())
    assert result.fingerprint == result.track["metadata"]["extractor_fingerprint"]
    again = extract_camera_track(video=clip, backend=RecordingBackend())
    assert again.fingerprint == result.fingerprint


def test_pipeline_fingerprint_moves_with_the_settings(clip):
    a = extract_camera_track(video=clip, backend=RecordingBackend())
    b = extract_camera_track(video=clip, backend=RecordingBackend(), motion_scale=2.0)
    assert a.fingerprint != b.fingerprint


def test_pipeline_rejects_a_solver_that_returns_one_pose(clip):
    class Stingy(RecordingBackend):
        def solve(self, frames, intrinsics, *, progress=None, control=None, observer=None):
            result = super().solve(frames, intrinsics)
            return BackendSolveResult(poses=result.poses[:1], backend="fake", coverage=0.1)

    with pytest.raises(SolveError, match="at least 2"):
        extract_camera_track(video=clip, backend=Stingy())


def test_pipeline_rejects_a_non_finite_solve(clip):
    class Broken(RecordingBackend):
        def solve(self, frames, intrinsics, *, progress=None, control=None, observer=None):
            result = super().solve(frames, intrinsics)
            result.poses[3].position = [float("nan"), 0.0, 0.0]
            return result

    with pytest.raises(SolveError, match="invalid pose at frame 3"):
        extract_camera_track(video=clip, backend=Broken())


def test_pipeline_reports_progress(clip):
    seen = []

    class Reporting(RecordingBackend):
        def solve(self, frames, intrinsics, *, progress=None, control=None, observer=None):
            if progress:
                progress(1, len(frames))
            return super().solve(frames, intrinsics)

    extract_camera_track(video=clip, backend=Reporting(), progress=lambda d, t: seen.append((d, t)))
    assert seen == [(1, 24)]


def test_live_observer_receives_omnicam_basis_not_backend_basis(clip):
    seen = []

    class Observed(RecordingBackend):
        def solve(self, frames, intrinsics, *, progress=None, control=None, observer=None):
            result = super().solve(frames, intrinsics)
            observer.pose(result.poses[0])
            return result

    class Observer:
        def pose(self, value):
            seen.append(value)

    solve_raw_poses(video=clip, backend=Observed(), observer=Observer())

    assert seen[0].position == pytest.approx([1.0, -2.0, -3.0])


def test_pipeline_report_is_human_readable(clip):
    result = extract_camera_track(video=clip, backend=RecordingBackend())
    assert "OmniCam Extractor" in result.report
    assert "camera keys" in result.report


