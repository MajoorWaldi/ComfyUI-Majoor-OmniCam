"""Spike detection: catching broken frames without libelling a fast camera."""

import pytest

from omnicam.core.camera_math import quaternion_from_euler
from omnicam.extractor.jobs.types import QualitySample
from omnicam.extractor.refine.spikes import detect_pose_spikes, robust_scores
from omnicam.extractor.types import PoseSample

IDENTITY = [0.0, 0.0, 0.0, 1.0]


def pose(frame, position, quaternion=IDENTITY):
    return PoseSample(
        source_frame=frame, timestamp_seconds=frame / 24.0,
        position=[float(value) for value in position], quaternion_xyzw=list(quaternion),
    )


def steady_dolly(count=30, step=0.1):
    return [pose(index, [0.0, 0.0, -step * index]) for index in range(count)]


def frames_of(anomalies, kind=None):
    return sorted({a.frame for a in anomalies if kind is None or a.kind == kind})


# ---------------------------------------------------------------------------
# What must not be flagged
# ---------------------------------------------------------------------------

def test_a_slow_steady_move_is_clean():
    assert detect_pose_spikes(steady_dolly(step=0.02)) == []


def test_a_consistently_fast_move_is_not_a_spike():
    """The whole point: fast is not broken."""
    assert detect_pose_spikes(steady_dolly(step=5.0)) == []


def test_a_fast_steady_pan_is_not_a_spike():
    poses = [
        pose(index, [0.0, 0.0, 0.0], quaternion_from_euler([0.0, index * 12.0, 0.0]))
        for index in range(30)
    ]
    assert detect_pose_spikes(poses) == []


def test_a_smooth_acceleration_is_not_a_spike():
    poses = [pose(index, [0.0, 0.0, -0.002 * index * index]) for index in range(30)]
    assert frames_of(detect_pose_spikes(poses), "translation") == []


def test_a_static_camera_is_clean():
    assert detect_pose_spikes([pose(index, [0.0, 0.0, 0.0]) for index in range(20)]) == []


def test_too_few_poses_are_never_analysed():
    assert detect_pose_spikes(steady_dolly(2)) == []


# ---------------------------------------------------------------------------
# What must be flagged
# ---------------------------------------------------------------------------

def test_a_translation_jump_is_flagged_on_the_frame_that_jumped():
    poses = steady_dolly(30)
    for index in range(17, 30):
        poses[index].position[2] -= 6.0
    assert 17 in frames_of(detect_pose_spikes(poses), "translation")


def test_a_rotation_jump_is_flagged():
    poses = [
        pose(index, [0.0, 0.0, 0.0],
             quaternion_from_euler([0.0, index * 0.5 + (60.0 if index >= 12 else 0.0), 0.0]))
        for index in range(30)
    ]
    assert 12 in frames_of(detect_pose_spikes(poses), "rotation")


def test_a_lower_sigma_flags_more():
    poses = steady_dolly(30)
    poses[15].position[2] -= 0.35
    strict = detect_pose_spikes(poses, translation_sigma=1.0, rotation_sigma=1.0)
    lenient = detect_pose_spikes(poses, translation_sigma=40.0, rotation_sigma=40.0)
    assert len(strict) >= len(lenient)


def test_a_coverage_collapse_is_reported_from_backend_numbers():
    samples = [QualitySample(frame=index, coverage=0.95) for index in range(20)]
    samples[8] = QualitySample(frame=8, coverage=0.2, inliers=11, state="bad")
    anomalies = detect_pose_spikes(steady_dolly(20), quality_samples=samples)
    coverage = [a for a in anomalies if a.kind == "coverage"]
    assert [a.frame for a in coverage] == [8]
    assert "20%" in coverage[0].detail


def test_anomalies_are_sorted_and_serializable():
    poses = steady_dolly(30)
    poses[9].position[0] += 4.0
    poses[20].position[1] -= 4.0
    anomalies = detect_pose_spikes(poses)
    assert [a.frame for a in anomalies] == sorted(a.frame for a in anomalies)
    payload = anomalies[0].to_dict()
    assert set(payload) == {"frame", "kind", "severity", "detail"}
    assert isinstance(payload["frame"], int)


# ---------------------------------------------------------------------------
# Statistics
# ---------------------------------------------------------------------------

def test_robust_scores_are_not_dragged_by_the_outlier_they_measure():
    scores, median = robust_scores([1.0] * 20 + [50.0])
    assert median == pytest.approx(1.0)
    assert scores[-1] > 4.0


def test_identical_values_score_zero_rather_than_dividing_by_zero():
    scores, median = robust_scores([2.0] * 10)
    assert median == pytest.approx(2.0)
    assert all(score == 0.0 for score in scores)


def test_empty_input_is_handled():
    assert robust_scores([]) == ([], 0.0)
