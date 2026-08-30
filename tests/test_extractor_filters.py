"""Smoothing and camera-aware key reduction for solved trajectories."""

import math
from itertools import pairwise

import pytest

from omnicam.core.camera_math import quaternion_from_euler
from omnicam.extractor.filters import (
    enforce_quaternion_continuity,
    is_static_solve,
    simplify_pose_sequence,
    smooth_positions,
    smooth_rotations,
    smoothing_radius,
)
from omnicam.extractor.transforms import quaternion_angle_degrees, quaternion_dot
from omnicam.extractor.types import PoseSample

IDENTITY = [0.0, 0.0, 0.0, 1.0]


def _aim_error_degrees(first, last, sample):
    """Angle between a sample's aim and the aim the Director would interpolate."""
    from omnicam.core.camera_pose import camera_payload_from_pose

    a, b, s = (camera_payload_from_pose(p.position, p.quaternion_xyzw, fov=53.0)
               for p in (first, last, sample))
    span = last.source_frame - first.source_frame
    t = (sample.source_frame - first.source_frame) / span
    aim = [(a["target"][i] + (b["target"][i] - a["target"][i]) * t)
           - (a["position"][i] + (b["position"][i] - a["position"][i]) * t) for i in range(3)]
    length = math.sqrt(sum(v * v for v in aim))
    actual = [s["target"][i] - s["position"][i] for i in range(3)]
    dot = sum((aim[i] / length) * actual[i] for i in range(3))
    return math.degrees(math.acos(max(-1.0, min(1.0, dot))))


def pose(frame, position, quaternion=IDENTITY):
    return PoseSample(
        source_frame=frame,
        timestamp_seconds=frame / 24.0,
        position=[float(value) for value in position],
        quaternion_xyzw=list(quaternion),
    )


def dolly(count, step=0.1):
    return [pose(index, [0.0, 0.0, -step * index]) for index in range(count)]


def pan(count, degrees_per_frame=1.0):
    return [
        pose(index, [0.0, 0.0, 0.0], quaternion_from_euler([0.0, degrees_per_frame * index, 0.0]))
        for index in range(count)
    ]


# ---------------------------------------------------------------------------
# Smoothing
# ---------------------------------------------------------------------------

def test_zero_smoothing_is_lossless():
    poses = dolly(12)
    assert smoothing_radius(0.0) == 0
    for original, smoothed in zip(poses, smooth_positions(poses, 0.0), strict=True):
        assert smoothed.position == original.position
    for original, smoothed in zip(poses, smooth_rotations(poses, 0.0), strict=True):
        assert smoothed.quaternion_xyzw == original.quaternion_xyzw


def test_smoothing_reduces_jitter_without_shifting_the_ramp():
    clean = dolly(21)
    noisy = [
        pose(p.source_frame, [p.position[0], (-1) ** index * 0.02, p.position[2]])
        for index, p in enumerate(clean)
    ]
    smoothed = smooth_positions(noisy, 0.5)
    noisy_error = max(abs(p.position[1]) for p in noisy[1:-1])
    smoothed_error = max(abs(p.position[1]) for p in smoothed[1:-1])
    assert smoothed_error < noisy_error * 0.5


def test_smoothing_does_not_lag_a_constant_velocity_move():
    """A centred window reproduces a linear ramp exactly; a causal one would trail it."""
    poses = dolly(31)
    smoothed = smooth_positions(poses, 1.0)
    for original, result in zip(poses, smoothed, strict=True):
        assert result.position[2] == pytest.approx(original.position[2], abs=1e-9)


def test_smoothing_preserves_the_first_and_last_pose_exactly():
    poses = dolly(15)
    smoothed = smooth_positions(poses, 0.8)
    assert smoothed[0].position == poses[0].position
    assert smoothed[-1].position == poses[-1].position


def test_quaternion_sign_flip_does_not_create_rotation_jump():
    poses = pan(5, 2.0)
    flipped = [
        pose(p.source_frame, p.position,
             [-c for c in p.quaternion_xyzw] if index % 2 else p.quaternion_xyzw)
        for index, p in enumerate(poses)
    ]
    continuous = enforce_quaternion_continuity(flipped)
    for previous, current in pairwise(continuous):
        assert quaternion_dot(previous.quaternion_xyzw, current.quaternion_xyzw) > 0.0
    smoothed = smooth_rotations(flipped, 0.6)
    for index, result in enumerate(smoothed):
        assert quaternion_angle_degrees(result.quaternion_xyzw, poses[index].quaternion_xyzw) < 5.0


def test_rotation_smoothing_returns_unit_quaternions():
    for result in smooth_rotations(pan(21, 3.0), 0.9):
        length = math.sqrt(sum(component ** 2 for component in result.quaternion_xyzw))
        assert length == pytest.approx(1.0, abs=1e-9)


# ---------------------------------------------------------------------------
# Key reduction
# ---------------------------------------------------------------------------

def test_simplify_keeps_first_and_last_pose():
    poses = dolly(30)
    reduced = simplify_pose_sequence(poses, position_tolerance=1.0, rotation_tolerance_deg=10.0)
    assert reduced[0].source_frame == 0
    assert reduced[-1].source_frame == 29


def test_simplify_removes_collinear_constant_speed_samples():
    poses = dolly(30)
    reduced = simplify_pose_sequence(poses, position_tolerance=0.01, rotation_tolerance_deg=0.25)
    assert len(reduced) == 2


def test_simplify_keeps_a_direction_change():
    forward = [pose(index, [0.0, 0.0, -0.1 * index]) for index in range(11)]
    back = [pose(11 + index, [0.0, 0.0, -1.0 + 0.1 * (index + 1)]) for index in range(10)]
    reduced = simplify_pose_sequence(forward + back, position_tolerance=0.01, rotation_tolerance_deg=0.25)
    assert [p.source_frame for p in reduced] == [0, 10, 20]


def test_simplify_keeps_rotation_change_even_when_position_is_linear():
    poses = [
        pose(index, [0.0, 0.0, 0.0],
             quaternion_from_euler([0.0, 0.0 if index < 10 else (index - 10) * 4.0, 0.0]))
        for index in range(20)
    ]
    reduced = simplify_pose_sequence(poses, position_tolerance=100.0, rotation_tolerance_deg=1.0)
    assert len(reduced) > 2
    assert any(p.source_frame == 10 for p in reduced), "the pan onset must survive"


def test_simplify_respects_the_position_tolerance():
    poses = [pose(index, [0.0, math.sin(index * 0.4) * 0.5, -0.1 * index]) for index in range(40)]
    loose = simplify_pose_sequence(poses, position_tolerance=0.5, rotation_tolerance_deg=90.0)
    tight = simplify_pose_sequence(poses, position_tolerance=0.005, rotation_tolerance_deg=90.0)
    assert len(loose) < len(tight) <= len(poses)


def test_zero_rotation_tolerance_keeps_nonidentical_rotations():
    # Accelerating, so no sample sits on the chord between its neighbours.
    poses = [
        pose(index, [0.0, 0.0, 0.0], quaternion_from_euler([0.0, 0.2 * index * index, 0.0]))
        for index in range(9)
    ]
    reduced = simplify_pose_sequence(poses, position_tolerance=0.0, rotation_tolerance_deg=0.0)
    assert len(reduced) == len(poses)


def test_zero_tolerance_only_drops_samples_the_interpolation_reproduces_exactly():
    """A constant-rate pan is symmetric, so its midpoint really is on the chord.

    Dropping it is lossless rather than a tolerance leak, and the test pins that
    distinction so a future reducer cannot quietly start dropping more.
    """
    poses = pan(9, 0.5)
    reduced = simplify_pose_sequence(poses, position_tolerance=0.0, rotation_tolerance_deg=0.0)
    retained = {p.source_frame for p in reduced}
    dropped = [p for p in poses if p.source_frame not in retained]
    assert len(dropped) == 1
    for sample in dropped:
        before = max((p for p in reduced if p.source_frame < sample.source_frame),
                     key=lambda p: p.source_frame)
        after = min((p for p in reduced if p.source_frame > sample.source_frame),
                    key=lambda p: p.source_frame)
        assert _aim_error_degrees(before, after, sample) < 1e-6


def test_zero_tolerance_still_drops_identical_samples():
    poses = [pose(index, [0.0, 0.0, 0.0]) for index in range(9)]
    reduced = simplify_pose_sequence(poses, position_tolerance=0.0, rotation_tolerance_deg=0.0)
    assert len(reduced) == 2


def test_simplify_preserves_source_frame_numbers():
    poses = [pose(index * 3, [0.0, math.sin(index) * 0.4, -0.1 * index]) for index in range(20)]
    reduced = simplify_pose_sequence(poses, position_tolerance=0.01, rotation_tolerance_deg=0.25)
    assert all(p.source_frame % 3 == 0 for p in reduced)
    assert [p.source_frame for p in reduced] == sorted(p.source_frame for p in reduced)


# ---------------------------------------------------------------------------
# Static solves
# ---------------------------------------------------------------------------

def test_a_tripod_solve_is_recognised_as_static():
    poses = [pose(index, [0.0, 0.0, 1e-7 * index]) for index in range(24)]
    assert is_static_solve(poses)


def test_a_slow_pan_is_not_static():
    assert not is_static_solve(pan(24, 0.5))


def test_a_slow_dolly_is_not_static():
    assert not is_static_solve(dolly(24, 0.001))
