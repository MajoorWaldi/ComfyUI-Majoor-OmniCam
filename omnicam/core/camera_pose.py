"""Rigid camera pose (position + quaternion) to canonical OmniCam camera payload.

OmniCam stores a camera as ``position`` + ``target`` + ``roll`` rather than a
transform, because that is what the editor manipulates. Every importer that
starts from a transform -- glTF, FBX, a solved trajectory -- needs the same
conversion, and the roll extraction in particular is easy to get subtly wrong.
It lives here once so all of them agree.
"""

from __future__ import annotations

import math
from collections.abc import Sequence

from .camera_math import camera_quaternion, rotate_quaternion

Vec3 = list[float]


def normalize_quaternion_xyzw(quaternion: Sequence[float]) -> list[float]:
    """Unit quaternion in ``[x, y, z, w]`` order; a degenerate input yields identity."""
    values = [float(component) for component in quaternion]
    if len(values) != 4:
        raise ValueError("a quaternion must have four components in x, y, z, w order")
    length = math.sqrt(sum(component * component for component in values))
    if not math.isfinite(length) or length < 1e-9:
        return [0.0, 0.0, 0.0, 1.0]
    return [component / length for component in values]


def forward_from_quaternion(quaternion: Sequence[float]) -> Vec3:
    """The camera's viewing direction: local -Z rotated into world space."""
    return rotate_quaternion([0.0, 0.0, -1.0], quaternion)


def roll_from_quaternion(position: Sequence[float], target: Sequence[float],
                         quaternion: Sequence[float]) -> float:
    """Signed roll in degrees between the pose's up vector and the zero-roll reference.

    ``camera_quaternion`` builds the orientation OmniCam would use for this
    position/target with no roll; the angle between that reference up and the
    pose's actual up, measured around the viewing direction, is the roll the
    payload has to carry for the round trip to be lossless.

    The negation matters: ``apply_roll`` turns the up vector *towards* -right,
    so a positive OmniCam roll is a negative rotation about the viewing
    direction. Reporting the raw signed angle inverted the roll of every camera
    imported from a plain transform, which nothing caught because the glTF
    round trip carries the canonical track in ``extras`` and never exercises
    this path.
    """
    up = rotate_quaternion([0.0, 1.0, 0.0], quaternion)
    forward = forward_from_quaternion(quaternion)
    reference = camera_quaternion(position, target, 0.0)
    reference_up = rotate_quaternion(
        [0.0, 1.0, 0.0], [reference["x"], reference["y"], reference["z"], reference["w"]]
    )
    cross = [
        reference_up[1] * up[2] - reference_up[2] * up[1],
        reference_up[2] * up[0] - reference_up[0] * up[2],
        reference_up[0] * up[1] - reference_up[1] * up[0],
    ]
    dot = sum(a * b for a, b in zip(reference_up, up, strict=True))
    sign = sum(c * f for c, f in zip(cross, forward, strict=True))
    return math.degrees(math.atan2(-sign, max(-1.0, min(1.0, dot))))


def camera_payload_from_pose(
    position: Sequence[float],
    quaternion: Sequence[float],
    *,
    fov: float,
    near: float = 0.01,
    far: float = 10000.0,
    camera_type: str = "perspective",
    zoom: float = 1.0,
) -> dict[str, object]:
    """A canonical OmniCam ``camera`` object for a camera-to-world pose.

    The target sits one unit down the viewing direction: it encodes orientation,
    not a focus distance.
    """
    rotation = normalize_quaternion_xyzw(quaternion)
    origin = [float(value) for value in position]
    forward = forward_from_quaternion(rotation)
    target = [origin[axis] + forward[axis] for axis in range(3)]
    return {
        "position": origin,
        "target": target,
        "fov": float(fov),
        "roll": roll_from_quaternion(origin, target, rotation),
        "camera_type": str(camera_type),
        "zoom": float(zoom),
        "near": float(near),
        "far": float(far),
    }
