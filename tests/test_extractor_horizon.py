"""Extractor per-pose horizon stabilization."""

import math

import pytest

from omnicam.core.camera_math import quaternion_from_euler
from omnicam.core.camera_pose import camera_payload_from_pose, forward_from_quaternion
from omnicam.extractor.refine.horizon import stabilize_horizon
from omnicam.extractor.types import PoseSample


def pose(frame: int, roll: float) -> PoseSample:
    return PoseSample(
        source_frame=frame,
        timestamp_seconds=frame / 24.0,
        position=[1.0, 2.0, -0.1 * frame],
        quaternion_xyzw=quaternion_from_euler([0.0, 0.0, roll]),
    )


def canonical_roll(sample: PoseSample) -> float:
    payload = camera_payload_from_pose(sample.position, sample.quaternion_xyzw, fov=53.0)
    return float(payload["roll"])


def test_zero_strength_preserves_pose_values():
    source = [pose(0, 20.0), pose(1, -12.0)]
    out = stabilize_horizon(source, 0.0)
    assert [p.position for p in out] == [p.position for p in source]
    assert [p.quaternion_xyzw for p in out] == [p.quaternion_xyzw for p in source]
    assert out is not source


def test_full_strength_removes_canonical_roll_and_preserves_forward():
    source = pose(0, 35.0)
    before = forward_from_quaternion(source.quaternion_xyzw)
    out = stabilize_horizon([source], 1.0)[0]
    after = forward_from_quaternion(out.quaternion_xyzw)
    assert canonical_roll(out) == pytest.approx(0.0, abs=1e-6)
    assert after == pytest.approx(before, abs=1e-6)
    assert out.position == source.position


def test_half_strength_halves_canonical_roll():
    source = pose(0, 40.0)
    before = canonical_roll(source)
    out = stabilize_horizon([source], 0.5)[0]
    assert canonical_roll(out) == pytest.approx(before * 0.5, abs=1e-5)


def test_strength_is_clamped():
    source = pose(0, 25.0)
    assert canonical_roll(stabilize_horizon([source], 9.0)[0]) == pytest.approx(0.0, abs=1e-6)
    assert canonical_roll(stabilize_horizon([source], -4.0)[0]) == pytest.approx(canonical_roll(source), abs=1e-6)


def test_source_is_never_mutated():
    source = [pose(i, math.sin(i) * 20.0) for i in range(8)]
    snapshot = [(list(p.position), list(p.quaternion_xyzw)) for p in source]
    stabilize_horizon(source, 0.7)
    assert [(p.position, p.quaternion_xyzw) for p in source] == snapshot
