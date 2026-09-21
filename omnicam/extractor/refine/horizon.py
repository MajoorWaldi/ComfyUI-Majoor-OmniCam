"""Per-pose horizon stabilization for an Extractor camera solve.

This is intentionally different from global Level Horizon: alignment rotates
one whole solve into a corrected world basis; stabilization damps only each
pose's residual canonical roll after that global correction.
"""

from __future__ import annotations

from collections.abc import Sequence

from ...core.camera_math import camera_quaternion
from ...core.camera_pose import camera_payload_from_pose
from ..types import PoseSample


def stabilize_horizon(poses: Sequence[PoseSample], strength: float) -> list[PoseSample]:
    """Damp canonical camera roll while preserving position and look direction.

    ``strength=0`` preserves every pose. ``strength=1`` rebuilds each pose with
    zero canonical roll in OmniCam's Y-up camera basis. No Euler smoothing is
    involved, so wrap and gimbal behaviour stay in the existing quaternion math.
    """
    amount = max(0.0, min(1.0, float(strength)))
    output: list[PoseSample] = []
    for pose in poses:
        position = [float(value) for value in pose.position]
        quaternion = [float(value) for value in pose.quaternion_xyzw]
        if amount > 0.0:
            payload = camera_payload_from_pose(position, quaternion, fov=53.0)
            target_value = payload["target"]
            roll_value = payload["roll"]
            if not isinstance(target_value, list) or not isinstance(roll_value, (int, float)):
                raise ValueError("canonical camera payload has invalid target/roll")
            target = [float(value) for value in target_value]
            roll = float(roll_value) * (1.0 - amount)
            rebuilt = camera_quaternion(position, target, roll)
            quaternion = [rebuilt["x"], rebuilt["y"], rebuilt["z"], rebuilt["w"]]
        output.append(PoseSample(
            source_frame=pose.source_frame,
            timestamp_seconds=pose.timestamp_seconds,
            position=position,
            quaternion_xyzw=quaternion,
            valid=pose.valid,
        ))
    return output
