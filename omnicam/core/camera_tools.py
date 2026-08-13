from __future__ import annotations

import math
import random
from dataclasses import asdict
from itertools import pairwise

from .track import CameraKeyframe, CameraState, OmniCamTrack

CAMERA_PRESETS = ("orbit_left", "orbit_right", "dolly_in", "dolly_out", "crane_up", "crane_down", "truck_left", "truck_right", "pedestal_up", "pedestal_down", "pan_left", "pan_right", "tilt_up", "tilt_down", "product_360")


def _copy_track(track: OmniCamTrack, keyframes: list[CameraKeyframe]) -> OmniCamTrack:
    payload = track.to_dict()
    payload["keyframes"] = [
        {"frame": key.frame, "camera": asdict(key.camera), "interpolation": key.interpolation}
        for key in keyframes
    ]
    return OmniCamTrack.from_dict(payload)


def _normalize(vector: list[float]) -> list[float]:
    magnitude = math.sqrt(sum(value * value for value in vector))
    return [value / max(1e-12, magnitude) for value in vector]


def _basis(camera: CameraState) -> tuple[list[float], list[float], list[float]]:
    forward = _normalize([camera.target[i] - camera.position[i] for i in range(3)])
    horizontal = [forward[2], 0.0, -forward[0]]
    right = _normalize(horizontal) if any(abs(value) > 1e-9 for value in horizontal) else [1.0, 0.0, 0.0]
    up = [
        right[1] * forward[2] - right[2] * forward[1],
        right[2] * forward[0] - right[0] * forward[2],
        right[0] * forward[1] - right[1] * forward[0],
    ]
    return right, _normalize(up), forward


def _offset(camera: CameraState, delta: list[float], move_target: bool = True) -> CameraState:
    payload = asdict(camera)
    payload["position"] = [camera.position[i] + delta[i] for i in range(3)]
    if move_target:
        payload["target"] = [camera.target[i] + delta[i] for i in range(3)]
    return CameraState.from_dict(payload)


def apply_camera_preset(track: OmniCamTrack, preset: str, amount: float = 1.0) -> OmniCamTrack:
    if preset not in CAMERA_PRESETS:
        raise ValueError(f"Unknown OmniCam camera preset: {preset}")
    start = track.sample(0)
    right, up, forward = _basis(start)
    end = CameraState.from_dict(asdict(start))
    distance = math.sqrt(sum((start.position[i] - start.target[i]) ** 2 for i in range(3)))
    if preset.startswith("orbit_") or preset == "product_360":
        angle = (2.0 * math.pi if preset == "product_360" else math.radians(90.0)) * amount
        if preset == "orbit_right":
            angle = -angle
        offset = [start.position[i] - start.target[i] for i in range(3)]
        sample_count = max(3, math.ceil(abs(angle) / (math.pi / 8.0)) + 1)
        keys = []
        for index in range(sample_count):
            progress = index / (sample_count - 1)
            sample_angle = angle * progress
            camera = CameraState.from_dict(asdict(start))
            if preset == "product_360" and index == sample_count - 1:
                camera.position = list(start.position)
            else:
                camera.position = [
                    start.target[0] + offset[0] * math.cos(sample_angle) + offset[2] * math.sin(sample_angle),
                    start.position[1],
                    start.target[2] - offset[0] * math.sin(sample_angle) + offset[2] * math.cos(sample_angle),
                ]
            frame = round((track.duration_frames - 1) * progress)
            keys.append(CameraKeyframe(frame, camera, "linear"))
        return _copy_track(track, keys)
    elif preset.startswith("dolly_"):
        sign = 1.0 if preset == "dolly_in" else -1.0
        end = _offset(start, [value * distance * 0.5 * amount * sign for value in forward], move_target=False)
    elif preset.startswith("crane_"):
        sign = 1.0 if preset == "crane_up" else -1.0
        end = _offset(start, [value * distance * 0.5 * amount * sign for value in up], move_target=False)
    elif preset.startswith("truck_"):
        sign = -1.0 if preset == "truck_left" else 1.0
        end = _offset(start, [value * distance * 0.5 * amount * sign for value in right])
    elif preset.startswith("pedestal_"):
        sign = 1.0 if preset == "pedestal_up" else -1.0
        end = _offset(start, [0.0, distance * 0.5 * amount * sign, 0.0])
    elif preset.startswith("pan_"):
        sign = -1.0 if preset == "pan_left" else 1.0
        end.target = [start.target[i] + right[i] * distance * 0.5 * amount * sign for i in range(3)]
    elif preset.startswith("tilt_"):
        sign = 1.0 if preset == "tilt_up" else -1.0
        end.target = [start.target[i] + up[i] * distance * 0.5 * amount * sign for i in range(3)]
    return _copy_track(track, [CameraKeyframe(0, start, "ease"), CameraKeyframe(track.duration_frames - 1, end, "ease")])


def add_camera_shake(track: OmniCamTrack, amplitude: float = 0.03, frequency: int = 4, seed: int = 0) -> OmniCamTrack:
    rng = random.Random(seed)
    step = max(1, round(track.fps / max(1, frequency)))
    frames = sorted(set(range(0, track.duration_frames, step)) | {track.duration_frames - 1})
    keys = []
    for frame in frames:
        camera = track.sample(frame)
        right, up, _ = _basis(camera)
        delta = [
            (right[i] * rng.uniform(-amplitude, amplitude) + up[i] * rng.uniform(-amplitude, amplitude))
            for i in range(3)
        ]
        shaken = _offset(camera, delta)
        shaken.roll += rng.uniform(-amplitude * 10.0, amplitude * 10.0)
        keys.append(CameraKeyframe(frame, shaken, "ease"))
    return _copy_track(track, keys)


def constrain_look_at(track: OmniCamTrack, target: list[float]) -> OmniCamTrack:
    keys = []
    for key in track.keyframes:
        camera = CameraState.from_dict(asdict(key.camera))
        camera.target = [float(value) for value in target]
        keys.append(CameraKeyframe(key.frame, camera, key.interpolation))
    return _copy_track(track, keys)


def follow_track_target(track: OmniCamTrack) -> OmniCamTrack:
    start = track.sample(0)
    offset = [start.position[i] - start.target[i] for i in range(3)]
    keys = []
    for key in track.keyframes:
        camera = CameraState.from_dict(asdict(key.camera))
        camera.position = [camera.target[i] + offset[i] for i in range(3)]
        keys.append(CameraKeyframe(key.frame, camera, key.interpolation))
    return _copy_track(track, keys)


def constrain_arc(track: OmniCamTrack, target: list[float] | None = None) -> OmniCamTrack:
    center = target or track.sample(0).target
    radius = math.sqrt(sum((track.sample(0).position[i] - center[i]) ** 2 for i in range(3)))
    keys = []
    for key in track.keyframes:
        camera = CameraState.from_dict(asdict(key.camera))
        direction = _normalize([camera.position[i] - center[i] for i in range(3)])
        camera.position = [center[i] + direction[i] * radius for i in range(3)]
        camera.target = list(center)
        keys.append(CameraKeyframe(key.frame, camera, key.interpolation))
    return _copy_track(track, keys)


def animate_fov(track: OmniCamTrack, multiplier: float = 1.0) -> OmniCamTrack:
    start = CameraState.from_dict(asdict(track.sample(0)))
    end = CameraState.from_dict(asdict(track.sample(track.duration_frames - 1)))
    end.fov = max(5.0, min(150.0, start.fov / max(0.05, multiplier)))
    return _copy_track(track, [CameraKeyframe(0, start, "ease"), CameraKeyframe(track.duration_frames - 1, end, "ease")])


def motion_speed_profile(track: OmniCamTrack) -> list[float]:
    cameras = [track.sample(frame) for frame in range(track.duration_frames)]
    speeds = [0.0]
    for previous, current in pairwise(cameras):
        distance = math.sqrt(sum((current.position[i] - previous.position[i]) ** 2 for i in range(3)))
        speeds.append(distance * track.fps)
    return speeds


def smooth_camera_path(track: OmniCamTrack, radius: int = 2) -> OmniCamTrack:
    radius = max(1, int(radius))
    samples = [track.sample(frame) for frame in range(track.duration_frames)]
    keys = []
    for frame, camera in enumerate(samples):
        lo = max(0, frame - radius)
        hi = min(track.duration_frames, frame + radius + 1)
        window = samples[lo:hi]
        smoothed = CameraState.from_dict(asdict(camera))
        smoothed.position = [sum(item.position[axis] for item in window) / len(window) for axis in range(3)]
        smoothed.target = [sum(item.target[axis] for item in window) / len(window) for axis in range(3)]
        keys.append(CameraKeyframe(frame, smoothed, "linear"))
    return _copy_track(track, keys)


def apply_dolly_zoom(track: OmniCamTrack) -> OmniCamTrack:
    start = track.sample(0)
    base_distance = math.sqrt(sum((start.position[i] - start.target[i]) ** 2 for i in range(3)))
    base_tangent = math.tan(math.radians(start.fov) * 0.5)
    keys = []
    for key in track.keyframes:
        camera = CameraState.from_dict(asdict(key.camera))
        distance = math.sqrt(sum((camera.position[i] - camera.target[i]) ** 2 for i in range(3)))
        camera.fov = math.degrees(2.0 * math.atan(base_tangent * base_distance / max(distance, 1e-6)))
        keys.append(CameraKeyframe(key.frame, camera, key.interpolation))
    return _copy_track(track, keys)
