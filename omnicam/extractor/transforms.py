"""The one coordinate boundary between a solver and OmniCam.

Every backend hands the pipeline camera-to-world poses in its own declared
basis. This module is the single place where a basis flip, an origin
normalization or a scale is allowed to happen -- scattering axis flips through
the backends is how a tracker ends up mirrored in one code path and not
another.

OmniCam convention, and therefore the output convention of everything here:

    right-handed, Y up, camera looks down its local -Z
"""

from __future__ import annotations

import math
from collections.abc import Sequence

from ..core.camera_math import multiply_quaternions, rotate_quaternion
from ..core.camera_pose import camera_payload_from_pose, normalize_quaternion_xyzw
from .types import PoseSample

Vec3 = list[float]

IDENTITY_QUATERNION: Vec3 = [0.0, 0.0, 0.0, 1.0]


def normalize_quaternion(q: Sequence[float]) -> list[float]:
    """Re-exported for the extractor's own callers; see :mod:`omnicam.core.camera_pose`."""
    return normalize_quaternion_xyzw(q)


def quaternion_conjugate(q: Sequence[float]) -> list[float]:
    """Inverse rotation of a unit quaternion."""
    x, y, z, w = normalize_quaternion_xyzw(q)
    return [-x, -y, -z, w]


def quaternion_dot(a: Sequence[float], b: Sequence[float]) -> float:
    return sum(float(a[i]) * float(b[i]) for i in range(4))


def quaternion_angle_degrees(a: Sequence[float], b: Sequence[float]) -> float:
    """Shortest-arc angle between two orientations, in degrees.

    ``q`` and ``-q`` are the same orientation, hence the absolute value.
    """
    dot = min(1.0, abs(quaternion_dot(normalize_quaternion_xyzw(a), normalize_quaternion_xyzw(b))))
    return math.degrees(2.0 * math.acos(dot))


def quaternion_slerp(a: Sequence[float], b: Sequence[float], t: float) -> list[float]:
    """Shortest-arc spherical interpolation; falls back to lerp when nearly parallel."""
    qa = normalize_quaternion_xyzw(a)
    qb = normalize_quaternion_xyzw(b)
    dot = quaternion_dot(qa, qb)
    if dot < 0.0:
        qb = [-component for component in qb]
        dot = -dot
    factor = max(0.0, min(1.0, float(t)))
    if dot > 0.9995:
        return normalize_quaternion_xyzw([qa[i] + (qb[i] - qa[i]) * factor for i in range(4)])
    theta = math.acos(max(-1.0, min(1.0, dot)))
    sin_theta = math.sin(theta)
    scale_a = math.sin((1.0 - factor) * theta) / sin_theta
    scale_b = math.sin(factor * theta) / sin_theta
    return normalize_quaternion_xyzw([qa[i] * scale_a + qb[i] * scale_b for i in range(4)])


def convert_opencv_c2w_to_omnicam(
    position: Sequence[float],
    quaternion_xyzw: Sequence[float],
) -> tuple[list[float], list[float]]:
    """Re-express an OpenCV-basis camera-to-world pose in OmniCam's basis.

    OpenCV cameras are ``+X right, +Y down, +Z forward``; OmniCam is
    ``+X right, +Y up, -Z forward``. Both bases differ by ``C = diag(1, -1, -1)``,
    a 180 degree turn about X, and the transform has to be applied on *both*
    sides -- ``T_omni = C @ T_cv @ C`` -- because the world axes and the camera
    axes are both being restated. For a quaternion that conjugation reduces to
    negating the Y and Z parts, and for the translation to negating Y and Z.
    """
    x, y, z, w = normalize_quaternion_xyzw(quaternion_xyzw)
    converted_position = [float(position[0]), -float(position[1]), -float(position[2])]
    return converted_position, [x, -y, -z, w]


def convert_pose_sequence(poses: Sequence[PoseSample], basis: str) -> list[PoseSample]:
    """Apply one backend basis conversion to a whole camera-to-world sequence."""
    if basis == "omnicam":
        return [
            PoseSample(
                source_frame=pose.source_frame,
                timestamp_seconds=pose.timestamp_seconds,
                position=[float(value) for value in pose.position],
                quaternion_xyzw=normalize_quaternion_xyzw(pose.quaternion_xyzw),
                valid=pose.valid,
            )
            for pose in poses
        ]
    if basis != "opencv":
        raise ValueError(f"unknown backend basis {basis!r}; expected 'opencv' or 'omnicam'")
    converted = []
    for pose in poses:
        position, quaternion = convert_opencv_c2w_to_omnicam(pose.position, pose.quaternion_xyzw)
        converted.append(
            PoseSample(
                source_frame=pose.source_frame,
                timestamp_seconds=pose.timestamp_seconds,
                position=position,
                quaternion_xyzw=quaternion,
                valid=pose.valid,
            )
        )
    return converted


def relative_to_first_pose(poses: Sequence[PoseSample]) -> list[PoseSample]:
    """Re-anchor the sequence so frame 0 sits at the world origin, unrotated.

    ``T_rel[i] = inverse(T[0]) @ T[i]``. Monocular translation has no world
    anchor anyway, so this is the only origin that means anything.
    """
    if not poses:
        return []
    first = poses[0]
    inverse_rotation = quaternion_conjugate(first.quaternion_xyzw)
    origin = [float(value) for value in first.position]
    normalized = []
    for pose in poses:
        offset = [float(pose.position[axis]) - origin[axis] for axis in range(3)]
        normalized.append(
            PoseSample(
                source_frame=pose.source_frame,
                timestamp_seconds=pose.timestamp_seconds,
                position=rotate_quaternion(offset, inverse_rotation),
                quaternion_xyzw=normalize_quaternion_xyzw(
                    multiply_quaternions(inverse_rotation, normalize_quaternion_xyzw(pose.quaternion_xyzw))
                ),
                valid=pose.valid,
            )
        )
    return normalized


def scale_positions(poses: Sequence[PoseSample], motion_scale: float) -> list[PoseSample]:
    """Scale translation only. Scaling orientation is meaningless and would shear the solve."""
    factor = float(motion_scale)
    if not math.isfinite(factor):
        raise ValueError("motion_scale must be finite")
    return [
        PoseSample(
            source_frame=pose.source_frame,
            timestamp_seconds=pose.timestamp_seconds,
            position=[component * factor for component in pose.position],
            quaternion_xyzw=list(pose.quaternion_xyzw),
            valid=pose.valid,
        )
        for pose in poses
    ]


def pose_to_camera_payload(
    pose: PoseSample,
    *,
    fov: float,
    near: float = 0.01,
    far: float = 10000.0,
) -> dict[str, object]:
    """Canonical OmniCam camera object for one normalized pose."""
    return camera_payload_from_pose(
        pose.position, pose.quaternion_xyzw, fov=fov, near=near, far=far
    )


def pose_is_finite(pose: PoseSample) -> bool:
    """A solver that emits NaN must not be allowed to poison a canonical track."""
    values = list(pose.position) + list(pose.quaternion_xyzw)
    if any(not math.isfinite(float(value)) for value in values):
        return False
    length = math.sqrt(sum(float(component) ** 2 for component in pose.quaternion_xyzw))
    return length > 1e-6
