"""Shared OmniCamTrack builders for the H3 scene-coverage test suite.

These build tracks directly (no ComfyUI import) so the geometry, prompt and
representability tests stay importable without torch.
"""

from __future__ import annotations

import math

from omnicam.core.camera_tools import apply_camera_preset
from omnicam.core.track import CameraKeyframe, CameraState, OmniCamTrack

START_POSITION = [0.0, 0.0, 5.0]
START_TARGET = [0.0, 0.0, 0.0]
START_FOV = 35.0
START_ROLL = 0.0


def base_track(frames: int = 124, fps: int = 24) -> OmniCamTrack:
    camera = {"position": list(START_POSITION), "target": list(START_TARGET), "fov": START_FOV, "roll": START_ROLL}
    return OmniCamTrack.from_dict(
        {
            "duration_frames": frames,
            "fps": fps,
            "keyframes": [
                {"frame": 0, "camera": camera, "interpolation": "linear"},
                {"frame": frames - 1, "camera": dict(camera), "interpolation": "linear"},
            ],
        }
    )


def orbit_track(degrees: float = 90.0, frames: int = 124, fps: int = 24) -> OmniCamTrack:
    preset = "orbit_right" if degrees < 0 else "orbit_left"
    amount = abs(degrees) / 90.0
    return apply_camera_preset(base_track(frames, fps), preset, amount=amount)


def _rotated_camera(angle_degrees: float, *, elevation_offset: float = 0.0, fov_delta: float = 0.0, roll_delta: float = 0.0, radius_ratio: float = 1.0) -> CameraState:
    anchor = START_TARGET
    offset = [START_POSITION[i] - anchor[i] for i in range(3)]
    angle = math.radians(angle_degrees)
    position = [
        anchor[0] + (offset[0] * math.cos(angle) + offset[2] * math.sin(angle)) * radius_ratio,
        anchor[1] + offset[1] + elevation_offset,
        anchor[2] + (-offset[0] * math.sin(angle) + offset[2] * math.cos(angle)) * radius_ratio,
    ]
    return CameraState.from_dict(
        {
            "position": position,
            "target": list(START_TARGET),
            "fov": START_FOV + fov_delta,
            "roll": START_ROLL + roll_delta,
        }
    )


def reverse_orbit_track(frames: int = 124, fps: int = 24, forward_degrees: float = 60.0, back_degrees: float = 20.0) -> OmniCamTrack:
    mid = frames // 2
    keyframes = [
        CameraKeyframe(0, _rotated_camera(0.0), "linear"),
        CameraKeyframe(mid, _rotated_camera(forward_degrees), "linear"),
        CameraKeyframe(frames - 1, _rotated_camera(back_degrees), "linear"),
    ]
    return OmniCamTrack.from_dict(
        {
            "duration_frames": frames,
            "fps": fps,
            "keyframes": [
                {"frame": key.frame, "camera": {"position": key.camera.position, "target": key.camera.target, "fov": key.camera.fov, "roll": key.camera.roll}, "interpolation": key.interpolation}
                for key in keyframes
            ],
        }
    )


def track_with_moving_target(frames: int = 124, fps: int = 24, drift_ratio: float = 0.2) -> OmniCamTrack:
    start_radius = math.dist(START_POSITION, START_TARGET)
    drift = drift_ratio * start_radius
    return OmniCamTrack.from_dict(
        {
            "duration_frames": frames,
            "fps": fps,
            "keyframes": [
                {"frame": 0, "camera": {"position": list(START_POSITION), "target": list(START_TARGET), "fov": START_FOV, "roll": START_ROLL}, "interpolation": "linear"},
                {"frame": frames - 1, "camera": {"position": list(START_POSITION), "target": [START_TARGET[0] + drift, START_TARGET[1], START_TARGET[2]], "fov": START_FOV, "roll": START_ROLL}, "interpolation": "linear"},
            ],
        }
    )


def mild_drift_orbit_track(frames: int = 124, fps: int = 24) -> OmniCamTrack:
    start_radius = math.dist(START_POSITION, START_TARGET)
    drift = 0.02 * start_radius
    mid = frames // 2
    keyframes = [
        {"frame": 0, "camera": {"position": list(START_POSITION), "target": list(START_TARGET), "fov": START_FOV, "roll": START_ROLL}, "interpolation": "linear"},
        {
            "frame": mid,
            "camera": {
                "position": _rotated_camera(90.0, roll_delta=1.5).position,
                "target": [START_TARGET[0] + drift * 0.5, START_TARGET[1], START_TARGET[2]],
                "fov": START_FOV + 1.5,
                "roll": 1.5,
            },
            "interpolation": "linear",
        },
        {
            "frame": frames - 1,
            "camera": {
                "position": _rotated_camera(180.0, roll_delta=2.0).position,
                "target": [START_TARGET[0] + drift, START_TARGET[1], START_TARGET[2]],
                "fov": START_FOV + 2.0,
                "roll": 2.0,
            },
            "interpolation": "linear",
        },
    ]
    return OmniCamTrack.from_dict({"duration_frames": frames, "fps": fps, "keyframes": keyframes})


def pan_in_place_track(frames: int = 124, fps: int = 24) -> OmniCamTrack:
    start_radius = math.dist(START_POSITION, START_TARGET)
    angle = math.radians(90.0)
    end_target = [
        START_TARGET[0] + start_radius * math.sin(angle),
        START_TARGET[1],
        START_TARGET[2] - (start_radius - start_radius * math.cos(angle)),
    ]
    return OmniCamTrack.from_dict(
        {
            "duration_frames": frames,
            "fps": fps,
            "keyframes": [
                {"frame": 0, "camera": {"position": list(START_POSITION), "target": list(START_TARGET), "fov": START_FOV, "roll": START_ROLL}, "interpolation": "linear"},
                {"frame": frames - 1, "camera": {"position": list(START_POSITION), "target": end_target, "fov": START_FOV, "roll": START_ROLL}, "interpolation": "linear"},
            ],
        }
    )
