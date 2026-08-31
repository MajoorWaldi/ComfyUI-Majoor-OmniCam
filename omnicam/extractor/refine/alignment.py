"""One global world rotation for a solved trajectory.

A monocular solve has no idea where the ground is. Its Y axis is wherever the
first frame happened to be pointing, so a handheld shot that started tilted
comes back with a tilted world. Fixing that is a legitimate *correction*, and
it is a single transform applied to the whole solve.

It is deliberately not per-key. Rotating one key relative to its neighbours is
authoring, and this module refuses to be the place that happens.
"""

from __future__ import annotations

import math
from collections.abc import Sequence

from ...core.camera_math import multiply_quaternions, quaternion_from_euler, rotate_quaternion
from ..transforms import normalize_quaternion
from ..types import PoseSample

IDENTITY_QUATERNION = [0.0, 0.0, 0.0, 1.0]


def alignment_quaternion(pitch_degrees: float, yaw_degrees: float, roll_degrees: float) -> list[float]:
    """World rotation from the three offsets the panel exposes.

    Pitch is about X, yaw about Y, roll about Z, composed in that order, which
    is the same XYZ convention :mod:`omnicam.core.camera_math` uses everywhere
    else. Reusing it means an alignment round-trips through the Director's
    Euler helpers without surprises.
    """
    return normalize_quaternion(
        quaternion_from_euler([float(pitch_degrees), float(yaw_degrees), float(roll_degrees)])
    )


def is_identity(quaternion: Sequence[float] | None, tolerance: float = 1e-9) -> bool:
    if quaternion is None:
        return True
    normalized = normalize_quaternion(quaternion)
    # w = +-1 is identity either way, so compare on the vector part.
    return all(abs(float(component)) <= tolerance for component in normalized[:3])


def apply_global_rotation(
    poses: Sequence[PoseSample],
    quaternion: Sequence[float] | None,
) -> list[PoseSample]:
    """Rotate the whole world around the origin.

    Positions rotate and orientations pre-multiply, so every distance and every
    relative angle inside the trajectory is preserved exactly. The shot is the
    same shot, seen from a differently levelled world.
    """
    if is_identity(quaternion):
        return [
            PoseSample(
                source_frame=pose.source_frame,
                timestamp_seconds=pose.timestamp_seconds,
                position=[float(value) for value in pose.position],
                quaternion_xyzw=normalize_quaternion(pose.quaternion_xyzw),
                valid=pose.valid,
            )
            for pose in poses
        ]
    rotation = normalize_quaternion(quaternion)  # type: ignore[arg-type]
    return [
        PoseSample(
            source_frame=pose.source_frame,
            timestamp_seconds=pose.timestamp_seconds,
            position=rotate_quaternion([float(value) for value in pose.position], rotation),
            quaternion_xyzw=normalize_quaternion(
                multiply_quaternions(rotation, normalize_quaternion(pose.quaternion_xyzw))
            ),
            valid=pose.valid,
        )
        for pose in poses
    ]


def estimate_up_correction(poses: Sequence[PoseSample]) -> list[float] | None:
    """A levelling rotation from the solve's own average camera up vector.

    This is a heuristic and is offered as a button, never applied silently: a
    shot that is genuinely tilted throughout is indistinguishable from a tilted
    world reconstruction, and only the user knows which one they filmed. Returns
    ``None`` when the estimate would be meaningless.
    """
    if len(poses) < 2:
        return None
    accumulated = [0.0, 0.0, 0.0]
    for pose in poses:
        up = rotate_quaternion([0.0, 1.0, 0.0], normalize_quaternion(pose.quaternion_xyzw))
        for axis in range(3):
            accumulated[axis] += float(up[axis])
    length = math.sqrt(sum(component * component for component in accumulated))
    if length < 1e-6:
        return None
    average = [component / length for component in accumulated]

    world_up = [0.0, 1.0, 0.0]
    dot = max(-1.0, min(1.0, sum(average[axis] * world_up[axis] for axis in range(3))))
    if dot > 1.0 - 1e-9:
        return list(IDENTITY_QUATERNION)
    axis = [  # type: ignore[assignment]
        average[1] * world_up[2] - average[2] * world_up[1],
        average[2] * world_up[0] - average[0] * world_up[2],
        average[0] * world_up[1] - average[1] * world_up[0],
    ]
    axis_length = math.sqrt(sum(component * component for component in axis))  # type: ignore[attr-defined]
    if axis_length < 1e-9:
        return None
    angle = math.acos(dot)
    sine = math.sin(angle * 0.5)
    return normalize_quaternion(
        [axis[0] / axis_length * sine, axis[1] / axis_length * sine, axis[2] / axis_length * sine,  # type: ignore[index]
         math.cos(angle * 0.5)]
    )
