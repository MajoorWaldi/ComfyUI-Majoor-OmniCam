from __future__ import annotations

import math

from ..core.track import CameraState, OmniCamTrack


def _normalize(value: list[float]) -> list[float]:
    length = math.sqrt(sum(component * component for component in value))
    return [component / max(length, 1e-12) for component in value]


def _cross(a: list[float], b: list[float]) -> list[float]:
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ]


def camera_to_wan_c2w(camera: CameraState) -> list[list[float]]:
    """Convert Three/OmniCam's Y-up look-at camera to Wan's +Z-forward camera matrix."""
    forward = _normalize([camera.target[i] - camera.position[i] for i in range(3)])
    right_axis = _cross(forward, [0.0, 1.0, 0.0])
    right = _normalize(right_axis) if any(abs(value) > 1e-9 for value in right_axis) else [1.0, 0.0, 0.0]
    up = _normalize(_cross(right, forward))
    roll = math.radians(camera.roll)
    rolled_right = [right[i] * math.cos(roll) + up[i] * math.sin(roll) for i in range(3)]
    rolled_up = [up[i] * math.cos(roll) - right[i] * math.sin(roll) for i in range(3)]
    down = [-component for component in rolled_up]
    return [
        [rolled_right[0], down[0], forward[0], camera.position[0]],
        [rolled_right[1], down[1], forward[1], camera.position[1]],
        [rolled_right[2], down[2], forward[2], camera.position[2]],
        [0.0, 0.0, 0.0, 1.0],
    ]


def track_to_wan_camera_params(track: OmniCamTrack, length: int | None = None) -> list[list[float]]:
    length = max(1, int(length or track.duration_frames))
    params = []
    for index in range(length):
        frame = 0.0 if length == 1 else index * (track.duration_frames - 1) / (length - 1)
        camera = track.sample(frame)
        focal_y = 0.5 / math.tan(math.radians(camera.fov) * 0.5)
        focal_x = focal_y * track.height / track.width
        row = [0.0, focal_x, focal_y, 0.5, 0.5, 0.0, 0.0]
        row.extend(value for matrix_row in camera_to_wan_c2w(camera) for value in matrix_row)
        params.append(row)
    return params
