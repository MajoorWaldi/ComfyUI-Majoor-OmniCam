"""Smoothing and key reduction for a solved camera trajectory.

Two jobs, both deliberately offline:

* a solve is noisy, and the noise is high-frequency jitter a director never
  wants -- but a causal filter would lag the motion, which is worse than the
  jitter, so the smoothing here is centred and symmetric;
* a solve emits one sample per frame, and a 240-key camera is unusable in the
  Director timeline -- so the reducer drops samples an interpolation can
  reproduce inside a tolerance the user controls.

Everything is deterministic: the same poses and the same settings always
produce the same keys, because the fingerprint downstream depends on it.
"""

from __future__ import annotations

import math
from collections.abc import Sequence

from ..core.camera_pose import camera_payload_from_pose
from .transforms import normalize_quaternion, quaternion_angle_degrees, quaternion_dot
from .types import PoseSample

# A solve below both of these has no motion worth keying: the residual is
# solver noise, not camera movement.
STATIC_TRANSLATION_EPSILON = 1e-5
STATIC_ROTATION_EPSILON_DEG = 0.01


def _copy(pose: PoseSample, position: list[float], quaternion: list[float]) -> PoseSample:
    return PoseSample(
        source_frame=pose.source_frame,
        timestamp_seconds=pose.timestamp_seconds,
        position=position,
        quaternion_xyzw=quaternion,
        valid=pose.valid,
    )


def enforce_quaternion_continuity(poses: Sequence[PoseSample]) -> list[PoseSample]:
    """Flip signs so neighbouring quaternions stay on the same hemisphere.

    A quaternion and its negation describe the same orientation, but averaging
    across a sign flip swings the camera through a half turn. Every filter
    below assumes this has already run.
    """
    result: list[PoseSample] = []
    previous: list[float] | None = None
    for pose in poses:
        quaternion = normalize_quaternion(pose.quaternion_xyzw)
        if previous is not None and quaternion_dot(previous, quaternion) < 0.0:
            quaternion = [-component for component in quaternion]
        previous = quaternion
        result.append(_copy(pose, [float(value) for value in pose.position], quaternion))
    return result


def smoothing_radius(strength: float) -> int:
    """Window half-width for a 0..1 strength. Zero strength means no window at all."""
    value = max(0.0, min(1.0, float(strength)))
    if value <= 0.0:
        return 0
    return max(1, round(1 + value * 8))


def _window_radius(index: int, last: int, radius: int) -> int:
    """Shrink the window near the ends so it never becomes one-sided.

    Truncating a symmetric window against the first or last sample turns it
    into a causal one, which drags the start of every move backwards -- a
    constant-velocity dolly came out curved at both ends. Clamping the radius
    keeps the window balanced, reproduces a linear ramp exactly, and makes the
    endpoints exact for free (radius 0).
    """
    return min(radius, index, last - index)


def _triangular_weight(offset: int, radius: int) -> float:
    return float(radius + 1 - abs(offset))


def smooth_positions(poses: Sequence[PoseSample], strength: float) -> list[PoseSample]:
    """Centred triangular blur over the translation channel; endpoints stay exact."""
    radius = smoothing_radius(strength)
    if radius == 0 or len(poses) < 3:
        return [_copy(p, [float(v) for v in p.position], list(p.quaternion_xyzw)) for p in poses]
    last = len(poses) - 1
    smoothed: list[PoseSample] = []
    for index, pose in enumerate(poses):
        window = _window_radius(index, last, radius)
        if window == 0:
            smoothed.append(_copy(pose, [float(v) for v in pose.position], list(pose.quaternion_xyzw)))
            continue
        total = 0.0
        accumulator = [0.0, 0.0, 0.0]
        for offset in range(-window, window + 1):
            weight = _triangular_weight(offset, window)
            total += weight
            for axis in range(3):
                accumulator[axis] += float(poses[index + offset].position[axis]) * weight
        position = [component / total for component in accumulator]
        smoothed.append(_copy(pose, position, list(pose.quaternion_xyzw)))
    return smoothed


def smooth_rotations(poses: Sequence[PoseSample], strength: float) -> list[PoseSample]:
    """Weighted quaternion average over the same centred window, then renormalized.

    Averaging quaternions componentwise is only valid for orientations that are
    close together, which is exactly the case inside a smoothing window once
    :func:`enforce_quaternion_continuity` has run. Euler angles are never
    smoothed here: they gimbal-lock and wrap, and a filter cannot tell a wrap
    apart from a real 360 degree pan.
    """
    radius = smoothing_radius(strength)
    if radius == 0 or len(poses) < 3:
        return [_copy(p, [float(v) for v in p.position], list(p.quaternion_xyzw)) for p in poses]
    continuous = enforce_quaternion_continuity(poses)
    last = len(continuous) - 1
    smoothed: list[PoseSample] = []
    for index, pose in enumerate(continuous):
        window = _window_radius(index, last, radius)
        if window == 0:
            smoothed.append(_copy(pose, list(pose.position), list(pose.quaternion_xyzw)))
            continue
        accumulator = [0.0, 0.0, 0.0, 0.0]
        reference = pose.quaternion_xyzw
        for offset in range(-window, window + 1):
            weight = _triangular_weight(offset, window)
            quaternion = continuous[index + offset].quaternion_xyzw
            # Align to the window's own centre, not just to the neighbour
            # before it: a long window can otherwise straddle a hemisphere
            # boundary and average two opposite signs into a shorter vector.
            if quaternion_dot(reference, quaternion) < 0.0:
                quaternion = [-component for component in quaternion]
            for component in range(4):
                accumulator[component] += quaternion[component] * weight
        smoothed.append(_copy(pose, list(pose.position), normalize_quaternion(accumulator)))
    return smoothed


def is_static_solve(poses: Sequence[PoseSample]) -> bool:
    """True when the whole solve stays inside the static thresholds."""
    if len(poses) < 2:
        return True
    first = poses[0]
    for pose in poses[1:]:
        distance = math.sqrt(
            sum((float(pose.position[axis]) - float(first.position[axis])) ** 2 for axis in range(3))
        )
        if distance > STATIC_TRANSLATION_EPSILON:
            return False
        if quaternion_angle_degrees(first.quaternion_xyzw, pose.quaternion_xyzw) > STATIC_ROTATION_EPSILON_DEG:
            return False
    return True


def _shortest_angle_delta(a: float, b: float) -> float:
    return (float(b) - float(a) + 540.0) % 360.0 - 180.0


def _lerp_angle(a: float, b: float, t: float) -> float:
    return float(a) + _shortest_angle_delta(a, b) * t


def _reduction_samples(poses: Sequence[PoseSample]) -> list[dict[str, object]]:
    """Pre-compute each pose the way the Director will store and replay it.

    The plan's error model slerps the endpoint quaternions, but nothing
    downstream ever does that: OmniCam keys carry ``position``/``target``/
    ``roll`` and :mod:`omnicam.core.track` interpolates those three channels
    linearly. Scoring against a slerp would have declared a constant-rate pan
    perfectly reproducible by two keys, while the Director would actually lerp
    the target along the chord and swing the camera off the arc. So the error
    below is measured against the reconstruction that will really happen.
    """
    return [camera_payload_from_pose(p.position, p.quaternion_xyzw, fov=53.0) for p in poses]


def _segment_error(
    poses: Sequence[PoseSample],
    samples: Sequence[dict[str, object]],
    start: int,
    end: int,
    index: int,
    position_tolerance: float,
    rotation_tolerance_deg: float,
) -> float:
    """Normalized error of one sample against the interpolation of its endpoints."""
    span = float(poses[end].source_frame - poses[start].source_frame)
    offset = float(poses[index].source_frame - poses[start].source_frame)
    t = 0.0 if abs(span) < 1e-9 else offset / span
    first, last, sample = samples[start], samples[end], samples[index]

    predicted_position = [
        first["position"][axis] + (last["position"][axis] - first["position"][axis]) * t
        for axis in range(3)
    ]
    predicted_target = [
        first["target"][axis] + (last["target"][axis] - first["target"][axis]) * t
        for axis in range(3)
    ]
    position_error = math.sqrt(
        sum((sample["position"][axis] - predicted_position[axis]) ** 2 for axis in range(3))
    )

    predicted_aim = [predicted_target[axis] - predicted_position[axis] for axis in range(3)]
    actual_aim = [sample["target"][axis] - sample["position"][axis] for axis in range(3)]
    predicted_length = math.sqrt(sum(component ** 2 for component in predicted_aim))
    if predicted_length < 1e-9:
        # The lerped chord collapsed onto the camera: the endpoints look in
        # opposite directions, so no interpolation can describe this segment.
        aim_error = 180.0
    else:
        dot = sum(
            (predicted_aim[axis] / predicted_length) * actual_aim[axis] for axis in range(3)
        )
        aim_error = math.degrees(math.acos(max(-1.0, min(1.0, dot))))
    roll_error = abs(_shortest_angle_delta(_lerp_angle(first["roll"], last["roll"], t), sample["roll"]))
    rotation_error = max(aim_error, roll_error)

    return max(
        position_error / max(float(position_tolerance), 1e-9),
        rotation_error / max(float(rotation_tolerance_deg), 1e-9),
    )


def simplify_pose_sequence(
    poses: Sequence[PoseSample],
    *,
    position_tolerance: float,
    rotation_tolerance_deg: float,
) -> list[PoseSample]:
    """Camera-aware recursive reduction over position *and* orientation together.

    Running an RDP pass per axis would happily delete the sample where the
    camera whips through a pan, because X, Y and Z were each individually
    linear there. The score below is the worse of the two normalized errors, so
    a channel inside tolerance can never hide a channel that is not.

    A tolerance of zero makes that channel lossless: any non-identical sample
    scores far above one and is retained.
    """
    total = len(poses)
    if total <= 2:
        return list(poses)

    samples = _reduction_samples(poses)
    keep = [False] * total
    keep[0] = keep[total - 1] = True
    stack = [(0, total - 1)]
    while stack:
        start, end = stack.pop()
        if end - start < 2:
            continue
        worst_index, worst_score = -1, 0.0
        for index in range(start + 1, end):
            score = _segment_error(
                poses, samples, start, end, index, position_tolerance, rotation_tolerance_deg
            )
            if score > worst_score:
                worst_index, worst_score = index, score
        if worst_index >= 0 and worst_score > 1.0:
            keep[worst_index] = True
            stack.append((start, worst_index))
            stack.append((worst_index, end))
    return [pose for pose, retained in zip(poses, keep, strict=True) if retained]
