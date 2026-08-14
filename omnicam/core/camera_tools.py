from __future__ import annotations

import math
import random
from dataclasses import asdict
from itertools import pairwise
from typing import Any

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


def locked_camera(track: OmniCamTrack) -> OmniCamTrack:
    """Locked-camera preset: freeze the frame-0 camera for the whole duration."""
    start = track.sample(0)
    keys = [
        CameraKeyframe(0, start, "linear"),
        CameraKeyframe(track.duration_frames - 1, CameraState.from_dict(asdict(start)), "linear"),
    ]
    return _copy_track(track, keys)


def validate_zero_motion(track: OmniCamTrack, tolerance: float = 1e-6) -> bool:
    """Return True when every sampled camera matches the first frame within tolerance."""
    reference = track.sample(0)
    for _, camera in track.samples():
        for field in ("position", "target"):
            if any(abs(getattr(camera, field)[i] - getattr(reference, field)[i]) > tolerance for i in range(3)):
                raise ValueError(f"Camera motion detected in a locked track: {field} drifts at runtime")
        for field in ("fov", "roll", "zoom"):
            if abs(getattr(camera, field) - getattr(reference, field)) > tolerance:
                raise ValueError(f"Camera motion detected in a locked track: {field} changes over time")
    return True


def _angular_speed(cameras: list[CameraState], fps: int) -> list[float]:
    speeds = [0.0]
    for previous, current in pairwise(cameras):
        forward_a = _normalize([previous.target[i] - previous.position[i] for i in range(3)])
        forward_b = _normalize([current.target[i] - current.position[i] for i in range(3)])
        angle = math.degrees(math.acos(max(-1.0, min(1.0, sum(forward_a[i] * forward_b[i] for i in range(3))))))
        speeds.append(angle * fps)
    return speeds


def motion_health_check(track: OmniCamTrack, limits: dict[str, float] | None = None, subject: list[float] | None = None) -> dict[str, Any]:
    """Measure speed, angular speed, acceleration, jerk, FOV drift and framing loss.

    ``limits`` carries model-specific recommended maxima supplied by adapters
    (keys: max_speed, max_angular_speed, max_acceleration, max_jerk,
    max_fov_change). The core never hardcodes model semantics: without limits
    the report is purely descriptive. Framing loss counts frames where the
    subject point (the ``subject`` object when present) leaves the image.
    """
    limits = limits or {}
    cameras = [track.sample(frame) for frame in range(track.duration_frames)]
    speeds = motion_speed_profile(track)
    angular = _angular_speed(cameras, track.fps)
    accelerations = [0.0, *[abs(b - a) * track.fps for a, b in pairwise(speeds)]]
    jerks = [0.0, *[abs(b - a) * track.fps for a, b in pairwise(accelerations)]]
    fovs = [camera.fov for camera in cameras]
    framing_loss = 0
    from .projection import project_point

    if subject is None:
        subject_object = next((obj for obj in track.objects if obj.get("id") == "subject"), None)
        subject = list(subject_object.get("position", [0.0, 1.5, 0.0])) if isinstance(subject_object, dict) else [0.0, 1.5, 0.0]
    for camera in cameras:
        projected = project_point(subject, camera, track.width, track.height)
        if projected is None or not (0 <= projected[0] < track.width and 0 <= projected[1] < track.height):
            framing_loss += 1
    report = {
        "max_speed": max(speeds, default=0.0),
        "max_angular_speed": max(angular, default=0.0),
        "max_acceleration": max(accelerations, default=0.0),
        "max_jerk": max(jerks, default=0.0),
        "max_fov_change": max(fovs, default=0.0) - min(fovs, default=0.0),
        "framing_loss_frames": framing_loss,
        "duration_frames": track.duration_frames,
        "fps": track.fps,
        "violations": [],
    }
    metric_keys = ("max_speed", "max_angular_speed", "max_acceleration", "max_jerk", "max_fov_change")
    for metric in metric_keys:
        recommended = limits.get(metric)
        if recommended is not None and report[metric] > float(recommended):
            report["violations"].append({"metric": metric, "value": report[metric], "recommended_max": float(recommended)})
    if framing_loss and limits.get("allow_framing_loss") is not True:
        report["violations"].append({"metric": "framing_loss_frames", "value": framing_loss, "recommended_max": 0})
    report["ok"] = not report["violations"]
    return report


def retime_to_speed(track: OmniCamTrack, target_speed: float) -> OmniCamTrack:
    """Re-time the track so the peak camera translation speed matches target_speed.

    Timing is normalized by stretching the keyframe spacing and the track
    duration; frame values are re-quantized. Tracks already at or below the
    target are returned unchanged.
    """
    target_speed = max(1e-6, float(target_speed))
    peak = max(motion_speed_profile(track), default=0.0)
    if peak <= target_speed or peak <= 0.0:
        return track
    scale = peak / target_speed
    payload = track.to_dict()
    payload["duration_frames"] = max(track.duration_frames, round(track.duration_frames * scale))
    keys = []
    used: set[int] = set()
    for key in track.keyframes:
        frame = min(payload["duration_frames"] - 1, max(0, round(key.frame * scale)))
        while frame in used and frame < payload["duration_frames"] - 1:
            frame += 1
        used.add(frame)
        keys.append({"frame": frame, "camera": asdict(key.camera), "interpolation": key.interpolation})
    payload["keyframes"] = keys
    return OmniCamTrack.from_dict(payload)
