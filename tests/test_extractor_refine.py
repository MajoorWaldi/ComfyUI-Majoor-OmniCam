"""Non-destructive refinement: raw stays raw, refined is derived and deterministic."""

import math
from itertools import pairwise

import pytest

from omnicam.core.camera_math import quaternion_from_euler
from omnicam.core.validation import validate_track_payload
from omnicam.extractor.pipeline import RawSolve, refine_raw_solve
from omnicam.extractor.refine.alignment import (
    alignment_quaternion,
    apply_global_rotation,
    estimate_up_correction,
    is_identity,
)
from omnicam.extractor.refine.pipeline import (
    apply_spike_actions,
    apply_trim,
    build_refined_track,
    refine_poses,
)
from omnicam.extractor.refine.types import RefinementSettings
from omnicam.extractor.transforms import quaternion_angle_degrees
from omnicam.extractor.types import PoseSample

IDENTITY = [0.0, 0.0, 0.0, 1.0]


def pose(frame, position, quaternion=IDENTITY):
    return PoseSample(
        source_frame=frame, timestamp_seconds=frame / 24.0,
        position=[float(value) for value in position], quaternion_xyzw=list(quaternion),
    )


def raw_poses(count=20, step=0.1):
    return [pose(index, [0.5, 1.0, 2.0 - step * index]) for index in range(count)]


def raw_solve(poses=None):
    poses = raw_poses() if poses is None else poses
    return RawSolve(
        poses=poses, backend="fake", coverage=0.9, source_fps=24.0,
        duration_frames=max(24, poses[-1].source_frame + 1), width=1920, height=1080,
        vertical_fov=53.0, intrinsics_source="auto_53deg_vertical_fov", frame_step=1,
        warnings=["monocular"], sampled_frame_count=len(poses),
    )


def distances(poses):
    return [
        math.dist(a.position, b.position)
        for a, b in pairwise(poses)
    ]


# ---------------------------------------------------------------------------
# Raw immutability
# ---------------------------------------------------------------------------

def test_raw_poses_are_never_modified_by_refinement():
    poses = raw_poses()
    snapshot = [(list(p.position), list(p.quaternion_xyzw)) for p in poses]
    for settings in (
        RefinementSettings(),
        RefinementSettings(motion_scale=7.0, position_smoothing=1.0, rotation_smoothing=1.0),
        RefinementSettings(trim_start_frame=4, trim_end_frame=12),
        RefinementSettings(spike_actions={5: "interpolate", 6: "exclude"}),
        RefinementSettings(global_rotation_xyzw=alignment_quaternion(12.0, 30.0, 4.0)),
    ):
        refine_poses(poses, settings)
    assert [(list(p.position), list(p.quaternion_xyzw)) for p in poses] == snapshot


def test_refinement_is_deterministic():
    poses = raw_poses()
    settings = RefinementSettings(position_smoothing=0.4, rotation_smoothing=0.3, motion_scale=2.5)
    first = refine_poses(poses, settings)
    second = refine_poses(poses, settings)
    assert [p.position for p in first] == [p.position for p in second]
    assert [p.quaternion_xyzw for p in first] == [p.quaternion_xyzw for p in second]


def test_default_refinement_normalizes_the_origin():
    refined = refine_poses(raw_poses(), RefinementSettings(simplify_keys=False, position_smoothing=0.0))
    assert refined[0].position == pytest.approx([0.0, 0.0, 0.0], abs=1e-9)


def test_disabling_normalization_keeps_the_solved_origin():
    refined = refine_poses(
        raw_poses(),
        RefinementSettings(normalize_origin=False, simplify_keys=False, position_smoothing=0.0),
    )
    assert refined[0].position == pytest.approx([0.5, 1.0, 2.0], abs=1e-9)


# ---------------------------------------------------------------------------
# Individual corrections
# ---------------------------------------------------------------------------

def test_motion_scale_changes_translation_only():
    settings = RefinementSettings(motion_scale=4.0, simplify_keys=False, position_smoothing=0.0,
                                  rotation_smoothing=0.0)
    plain = refine_poses(raw_poses(), RefinementSettings(simplify_keys=False, position_smoothing=0.0,
                                                        rotation_smoothing=0.0))
    scaled = refine_poses(raw_poses(), settings)
    assert scaled[-1].position[2] == pytest.approx(plain[-1].position[2] * 4.0, rel=1e-9)
    assert quaternion_angle_degrees(scaled[-1].quaternion_xyzw, plain[-1].quaternion_xyzw) < 1e-9


def test_smoothing_reduces_jitter_without_retracking():
    """Jitter is frame-to-frame variation, so that is what has to shrink.

    Measuring the absolute height would be measuring the origin, which
    normalization has already moved.
    """
    noisy = [
        pose(index, [0.0, (-1) ** index * 0.05, -0.1 * index]) for index in range(21)
    ]
    smoothed = refine_poses(noisy, RefinementSettings(position_smoothing=0.6, simplify_keys=False))

    def variation(poses):
        return sum(abs(b.position[1] - a.position[1]) for a, b in pairwise(poses))

    assert variation(smoothed) < variation(noisy) * 0.25


def test_key_reduction_collapses_a_straight_move():
    refined = refine_poses(raw_poses(), RefinementSettings(position_smoothing=0.0, rotation_smoothing=0.0))
    assert len(refined) == 2


def test_key_reduction_can_be_switched_off():
    refined = refine_poses(raw_poses(), RefinementSettings(simplify_keys=False))
    assert len(refined) == 20


# ---------------------------------------------------------------------------
# Trim
# ---------------------------------------------------------------------------

def test_trim_keeps_only_the_requested_window():
    trimmed = apply_trim(raw_poses(), 5, 12)
    assert [p.source_frame for p in trimmed] == list(range(5, 13))


def test_an_open_ended_trim_runs_to_the_end():
    trimmed = apply_trim(raw_poses(), 15, 0)
    assert [p.source_frame for p in trimmed] == list(range(15, 20))


def test_a_trim_that_would_empty_the_shot_is_ignored():
    """Dragging a handle past the far end must not delete the camera."""
    assert len(apply_trim(raw_poses(), 900, 950)) == 20


def test_trim_affects_the_refined_track_only():
    poses = raw_poses()
    refine_poses(poses, RefinementSettings(trim_start_frame=5, trim_end_frame=10))
    assert [p.source_frame for p in poses] == list(range(20))


# ---------------------------------------------------------------------------
# Spike actions
# ---------------------------------------------------------------------------

def test_interpolate_replaces_a_bad_sample_from_its_neighbours():
    poses = raw_poses()
    poses[10].position = [9.0, 9.0, 9.0]
    fixed = apply_spike_actions(poses, {10: "interpolate"})
    expected = [
        (poses[9].position[axis] + poses[11].position[axis]) / 2 for axis in range(3)
    ]
    assert fixed[10].position == pytest.approx(expected, abs=1e-9)


def test_interpolate_bridges_a_run_of_bad_frames():
    poses = raw_poses()
    for index in (10, 11, 12):
        poses[index].position = [50.0, 50.0, 50.0]
    fixed = apply_spike_actions(poses, {index: "interpolate" for index in (10, 11, 12)})
    for index in (10, 11, 12):
        # Repaired from the clean frames outside the run, not from each other.
        assert abs(fixed[index].position[0] - 0.5) < 1e-6


def test_interpolate_slerps_orientation():
    poses = [
        pose(index, [0.0, 0.0, 0.0], quaternion_from_euler([0.0, index * 4.0, 0.0]))
        for index in range(9)
    ]
    poses[4].quaternion_xyzw = quaternion_from_euler([0.0, 170.0, 0.0])
    fixed = apply_spike_actions(poses, {4: "interpolate"})
    expected = quaternion_from_euler([0.0, 16.0, 0.0])
    assert quaternion_angle_degrees(fixed[4].quaternion_xyzw, expected) < 1e-6


def test_exclude_drops_the_sample_entirely():
    fixed = apply_spike_actions(raw_poses(), {7: "exclude"})
    assert 7 not in [p.source_frame for p in fixed]
    assert len(fixed) == 19


def test_ignore_leaves_the_sample_alone():
    poses = raw_poses()
    poses[3].position = [9.0, 9.0, 9.0]
    fixed = apply_spike_actions(poses, {3: "ignore"})
    assert fixed[3].position == [9.0, 9.0, 9.0]


def test_a_bad_first_frame_is_repaired_from_the_only_side_available():
    poses = raw_poses()
    poses[0].position = [99.0, 99.0, 99.0]
    fixed = apply_spike_actions(poses, {0: "interpolate"})
    assert fixed[0].position == pytest.approx(poses[1].position)


def test_spike_actions_never_touch_the_raw_list():
    poses = raw_poses()
    apply_spike_actions(poses, {5: "interpolate", 6: "exclude"})
    assert len(poses) == 20
    assert poses[5].position == [0.5, 1.0, 2.0 - 0.5]


# ---------------------------------------------------------------------------
# Global alignment
# ---------------------------------------------------------------------------

def test_global_alignment_preserves_relative_shape():
    poses = [pose(index, [math.sin(index * 0.3), index * 0.05, -0.2 * index]) for index in range(20)]
    rotated = apply_global_rotation(poses, alignment_quaternion(17.0, -40.0, 8.0))
    for before, after in zip(distances(poses), distances(rotated), strict=True):
        assert after == pytest.approx(before, abs=1e-9)


def test_global_alignment_preserves_relative_orientation():
    poses = [
        pose(index, [0.0, 0.0, -0.1 * index], quaternion_from_euler([0.0, index * 3.0, 0.0]))
        for index in range(10)
    ]
    rotated = apply_global_rotation(poses, alignment_quaternion(0.0, 0.0, 25.0))
    for index in range(1, 10):
        before = quaternion_angle_degrees(poses[index - 1].quaternion_xyzw, poses[index].quaternion_xyzw)
        after = quaternion_angle_degrees(rotated[index - 1].quaternion_xyzw, rotated[index].quaternion_xyzw)
        assert after == pytest.approx(before, abs=1e-6)


def test_an_identity_alignment_changes_nothing():
    poses = raw_poses()
    assert is_identity(None)
    assert is_identity(IDENTITY)
    unchanged = apply_global_rotation(poses, None)
    assert [p.position for p in unchanged] == [p.position for p in poses]


def test_a_yaw_alignment_turns_the_world_around_up():
    rotated = apply_global_rotation([pose(0, [1.0, 0.0, 0.0])], alignment_quaternion(0.0, 90.0, 0.0))
    assert rotated[0].position == pytest.approx([0.0, 0.0, -1.0], abs=1e-9)


def test_estimating_up_from_a_level_solve_is_a_no_op():
    correction = estimate_up_correction(raw_poses())
    assert correction is not None
    assert is_identity(correction, tolerance=1e-6)


def test_estimating_up_levels_a_rolled_solve():
    rolled = quaternion_from_euler([0.0, 0.0, 20.0])
    poses = [pose(index, [0.0, 0.0, -0.1 * index], rolled) for index in range(10)]
    correction = estimate_up_correction(poses)
    levelled = apply_global_rotation(poses, correction)
    from omnicam.core.camera_math import rotate_quaternion

    up = rotate_quaternion([0.0, 1.0, 0.0], levelled[0].quaternion_xyzw)
    assert up == pytest.approx([0.0, 1.0, 0.0], abs=1e-6)


def test_estimating_up_from_too_little_data_returns_nothing():
    assert estimate_up_correction([]) is None
    assert estimate_up_correction([pose(0, [0.0, 0.0, 0.0])]) is None


# ---------------------------------------------------------------------------
# Refined track
# ---------------------------------------------------------------------------

def test_a_refined_track_is_canonical_and_fingerprinted():
    track = refine_raw_solve(raw_solve(), RefinementSettings())
    assert validate_track_payload(track) == track
    assert track["metadata"]["extractor_fingerprint"]
    assert track["metadata"]["refinement"]["motion_scale"] == 1.0


def test_changing_a_setting_changes_the_fingerprint():
    a = refine_raw_solve(raw_solve(), RefinementSettings())
    b = refine_raw_solve(raw_solve(), RefinementSettings(motion_scale=2.0))
    assert a["metadata"]["extractor_fingerprint"] != b["metadata"]["extractor_fingerprint"]


def test_the_same_settings_reproduce_the_same_fingerprint():
    a = refine_raw_solve(raw_solve(), RefinementSettings(position_smoothing=0.3))
    b = refine_raw_solve(raw_solve(), RefinementSettings(position_smoothing=0.3))
    assert a["metadata"]["extractor_fingerprint"] == b["metadata"]["extractor_fingerprint"]


def test_a_refined_track_keeps_the_source_timeline():
    track = refine_raw_solve(raw_solve(), RefinementSettings(simplify_keys=False))
    assert [key["frame"] for key in track["keyframes"]] == list(range(20))
    assert track["fps"] == 24
    assert (track["width"], track["height"]) == (1920, 1080)


def test_refining_an_empty_solve_is_refused():
    with pytest.raises(ValueError, match="no camera poses"):
        build_refined_track(
            raw_poses=[], settings=RefinementSettings(), source_fps=24.0, duration_frames=10,
            width=1280, height=720, vertical_fov=53.0, backend="fake", confidence=0.5,
            frame_step=1, intrinsics_source="auto_53deg_vertical_fov",
        )


# ---------------------------------------------------------------------------
# Settings hygiene
# ---------------------------------------------------------------------------

def test_settings_from_an_untrusted_body_are_clamped():
    settings = RefinementSettings.from_dict({
        "position_smoothing": 99.0, "rotation_smoothing": -5.0, "motion_scale": 1e9,
        "trim_start_frame": -20, "position_tolerance": "nonsense",
    })
    assert settings.position_smoothing == 1.0
    assert settings.rotation_smoothing == 0.0
    assert settings.motion_scale == 100.0
    assert settings.trim_start_frame == 0
    assert settings.position_tolerance == 0.01


def test_settings_reject_a_non_finite_scale():
    assert RefinementSettings.from_dict({"motion_scale": float("nan")}).motion_scale == 1.0


def test_settings_reject_unknown_spike_actions():
    settings = RefinementSettings.from_dict({"spike_actions": {"4": "delete_everything", "5": "exclude"}})
    assert settings.spike_actions == {5: "exclude"}


def test_settings_reject_a_malformed_alignment():
    assert RefinementSettings.from_dict({"global_rotation_xyzw": [1, 2]}).global_rotation_xyzw is None
    assert RefinementSettings.from_dict({"global_rotation_xyzw": "spin"}).global_rotation_xyzw is None


def test_settings_round_trip_through_a_dict():
    original = RefinementSettings(motion_scale=3.0, spike_actions={4: "interpolate"},
                                  global_rotation_xyzw=[0.0, 0.0, 0.0, 1.0])
    restored = RefinementSettings.from_dict(original.to_dict())
    assert restored.motion_scale == 3.0
    assert restored.spike_actions == {4: "interpolate"}
    assert restored.global_rotation_xyzw == [0.0, 0.0, 0.0, 1.0]


def test_estimate_up_levels_the_world_without_a_manual_angle():
    from omnicam.core.camera_math import rotate_quaternion

    rolled = quaternion_from_euler([0.0, 0.0, 25.0])
    poses = [pose(index, [0.0, 0.0, -0.1 * index], rolled) for index in range(12)]
    refined = refine_poses(poses, RefinementSettings(
        estimate_up=True, simplify_keys=False, position_smoothing=0.0, rotation_smoothing=0.0,
    ))
    up = rotate_quaternion([0.0, 1.0, 0.0], refined[0].quaternion_xyzw)
    assert up == pytest.approx([0.0, 1.0, 0.0], abs=1e-6)


def test_an_explicit_alignment_overrules_the_estimate():
    from omnicam.extractor.refine.pipeline import resolve_alignment

    explicit = alignment_quaternion(0.0, 0.0, 10.0)
    settings = RefinementSettings(estimate_up=True, global_rotation_xyzw=explicit)
    assert resolve_alignment(raw_poses(), settings) == explicit


def test_the_refined_track_records_what_the_estimate_resolved_to():
    rolled = quaternion_from_euler([0.0, 0.0, 25.0])
    poses = [pose(index, [0.0, 0.0, -0.1 * index], rolled) for index in range(12)]
    track = refine_raw_solve(raw_solve(poses), RefinementSettings(estimate_up=True))
    resolved = track["metadata"]["refinement"]["resolved_alignment"]
    assert isinstance(resolved, list) and len(resolved) == 4


def test_no_alignment_resolves_to_nothing():
    track = refine_raw_solve(raw_solve(), RefinementSettings())
    assert track["metadata"]["refinement"]["resolved_alignment"] is None
