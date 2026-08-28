from __future__ import annotations

import math
import random
from dataclasses import asdict
from itertools import pairwise
from typing import Any

from .camera_math import camera_basis
from .camera_math import focal_length_to_fov as _focal_to_fov
from .camera_math import fov_to_focal_length as _fov_to_focal
from .track import CameraKeyframe, CameraState, OmniCamTrack

CAMERA_PRESETS = ("orbit_left", "orbit_right", "dolly_in", "dolly_out", "crane_up", "crane_down", "truck_left", "truck_right", "pedestal_up", "pedestal_down", "pan_left", "pan_right", "tilt_up", "tilt_down", "product_360")


def _copy_track(track: OmniCamTrack, keyframes: list[CameraKeyframe]) -> OmniCamTrack:
    payload = track.to_dict()
    payload["keyframes"] = [
        {
            "frame": key.frame, "camera": asdict(key.camera), "interpolation": key.interpolation,
            **({"tangents": key.tangents} if key.tangents else {}),
            **({"references": key.references} if key.references else {}),
        }
        for key in keyframes
    ]
    return OmniCamTrack.from_dict(payload)


def _normalize(vector: list[float]) -> list[float]:
    magnitude = math.sqrt(sum(value * value for value in vector))
    return [value / max(1e-12, magnitude) for value in vector]


def _basis(camera: CameraState) -> tuple[list[float], list[float], list[float]]:
    return camera_basis(camera.position, camera.target, camera.roll)


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
        keys.append(CameraKeyframe(key.frame, camera, key.interpolation, key.tangents, key.references))
    return _copy_track(track, keys)


def follow_track_target(track: OmniCamTrack) -> OmniCamTrack:
    start = track.sample(0)
    offset = [start.position[i] - start.target[i] for i in range(3)]
    keys = []
    for key in track.keyframes:
        camera = CameraState.from_dict(asdict(key.camera))
        camera.position = [camera.target[i] + offset[i] for i in range(3)]
        keys.append(CameraKeyframe(key.frame, camera, key.interpolation, key.tangents, key.references))
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
        keys.append(CameraKeyframe(key.frame, camera, key.interpolation, key.tangents, key.references))
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
        keys.append(CameraKeyframe(key.frame, camera, key.interpolation, key.tangents, key.references))
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
        keys.append({
            "frame": frame, "camera": asdict(key.camera), "interpolation": key.interpolation,
            **({"tangents": key.tangents} if key.tangents else {}),
            **({"references": key.references} if key.references else {}),
        })
    payload["keyframes"] = keys
    return OmniCamTrack.from_dict(payload)


def fov_to_focal_length(fov_degrees: float, sensor_height_mm: float = 24.0) -> float:
    """Convert canonical vertical FOV to focal length using sensor height."""
    return _fov_to_focal(fov_degrees, sensor_height_mm)


def focal_length_to_fov(focal_length_mm: float, sensor_height_mm: float = 24.0) -> float:
    """Convert focal length to canonical vertical FOV using sensor height."""
    return _focal_to_fov(focal_length_mm, sensor_height_mm)


def analyze_camera_trajectory(track: OmniCamTrack) -> dict[str, Any]:
    """Analyze a canonical OmniCam track to extract cinematic motion metadata.

    Detects translation intent (dolly/truck/crane), rotation (pan/tilt/roll),
    orbital arcs, optical dynamics (dolly zoom / vertigo), and lens classification.
    """
    duration = max(1, track.duration_frames)
    cameras = [track.sample(frame) for frame in range(duration)]
    start_cam, end_cam = cameras[0], cameras[-1]
    path_length = dolly_amount = truck_amount = crane_amount = 0.0
    angular_distance = 0.0
    pan_degrees = tilt_degrees = 0.0
    for previous, current in pairwise(cameras):
        delta = [current.position[i] - previous.position[i] for i in range(3)]
        path_length += math.sqrt(sum(value * value for value in delta))
        right, up, forward = _basis(previous)
        dolly_amount += sum(delta[i] * forward[i] for i in range(3))
        truck_amount += sum(delta[i] * right[i] for i in range(3))
        crane_amount += sum(delta[i] * up[i] for i in range(3))
        forward_a = _normalize([previous.target[i] - previous.position[i] for i in range(3)])
        forward_b = _normalize([current.target[i] - current.position[i] for i in range(3)])
        angular_distance += math.degrees(math.acos(max(-1.0, min(1.0, sum(forward_a[i] * forward_b[i] for i in range(3))))))
        yaw_a, yaw_b = math.atan2(forward_a[0], -forward_a[2]), math.atan2(forward_b[0], -forward_b[2])
        pan_degrees += math.degrees((yaw_b - yaw_a + math.pi) % (2.0 * math.pi) - math.pi)
        pitch_a = math.asin(max(-1.0, min(1.0, forward_a[1])))
        pitch_b = math.asin(max(-1.0, min(1.0, forward_b[1])))
        tilt_degrees += math.degrees(pitch_b - pitch_a)

    # Distance to target
    start_dist_to_target = math.sqrt(sum((start_cam.position[i] - start_cam.target[i]) ** 2 for i in range(3)))
    end_dist_to_target = math.sqrt(sum((end_cam.position[i] - end_cam.target[i]) ** 2 for i in range(3)))
    dist_to_target_delta = end_dist_to_target - start_dist_to_target

    # Integrate signed per-frame azimuth deltas: a closed 360° orbit must not
    # collapse to zero merely because its first and last positions coincide.
    azimuths = [math.atan2(cam.position[0] - cam.target[0], cam.position[2] - cam.target[2]) for cam in cameras]
    orbit_radians = sum((b - a + math.pi) % (2.0 * math.pi) - math.pi for a, b in pairwise(azimuths))
    orbit_degrees = math.degrees(orbit_radians)

    # Optical analysis
    start_focal_mm = fov_to_focal_length(start_cam.fov)
    end_focal_mm = fov_to_focal_length(end_cam.fov)
    fov_delta = end_cam.fov - start_cam.fov

    # Lens categorization
    avg_focal_mm = (start_focal_mm + end_focal_mm) / 2.0
    if avg_focal_mm < 20.0:
        lens_type = "ultra-wide lens"
    elif avg_focal_mm < 30.0:
        lens_type = "wide-angle lens"
    elif avg_focal_mm < 60.0:
        lens_type = "standard 50mm lens"
    elif avg_focal_mm < 110.0:
        lens_type = "portrait 85mm lens"
    else:
        lens_type = "telephoto lens"

    # Dolly zoom (vertigo effect) detection
    # Distance decreases while FOV increases (push-in + zoom-out), or vice-versa
    is_dolly_zoom = (
        abs(fov_delta) > 5.0
        and abs(dist_to_target_delta) > 0.5
        and ((dist_to_target_delta < 0 and fov_delta > 0) or (dist_to_target_delta > 0 and fov_delta < 0))
    )

    # Speed metrics
    speeds = motion_speed_profile(track)
    accelerations = [0.0, *[(b - a) * track.fps for a, b in pairwise(speeds)]]
    jerks = [0.0, *[(b - a) * track.fps for a, b in pairwise(accelerations)]]
    distances = [math.sqrt(sum((cam.position[i] - cam.target[i]) ** 2 for i in range(3))) for cam in cameras]
    fovs = [cam.fov for cam in cameras]

    def correlation(left: list[float], right: list[float]) -> float:
        mean_left, mean_right = sum(left) / len(left), sum(right) / len(right)
        centered_left = [value - mean_left for value in left]
        centered_right = [value - mean_right for value in right]
        denominator = math.sqrt(sum(v * v for v in centered_left) * sum(v * v for v in centered_right))
        return 0.0 if denominator < 1e-12 else sum(a * b for a, b in zip(centered_left, centered_right, strict=True)) / denominator

    path_curvature = 0.0
    segments = [[b.position[i] - a.position[i] for i in range(3)] for a, b in pairwise(cameras)]
    for previous, current in pairwise(segments):
        len_a = math.sqrt(sum(v * v for v in previous))
        len_b = math.sqrt(sum(v * v for v in current))
        if len_a > 1e-9 and len_b > 1e-9:
            cosine = sum(previous[i] * current[i] for i in range(3)) / (len_a * len_b)
            path_curvature += math.degrees(math.acos(max(-1.0, min(1.0, cosine))))
    peak_speed = max(speeds, default=0.0)
    avg_speed = sum(speeds) / max(1, len(speeds))
    pacing = "slow and steady" if peak_speed < 1.0 else ("moderate speed" if peak_speed < 3.0 else "fast dynamic")

    # Movements tags
    movements: list[str] = []
    if is_dolly_zoom:
        movements.append("vertigo dolly-zoom effect")
    else:
        if abs(orbit_degrees) > 20.0:
            direction = "clockwise" if orbit_degrees < 0 else "counter-clockwise"
            movements.append(f"{abs(round(orbit_degrees))}° {direction} orbit around subject")
        if abs(dolly_amount) > 0.5:
            movements.append("push-in (dolly forward)" if dolly_amount > 0 else "pull-back (dolly backward)")
        if abs(truck_amount) > 0.5:
            movements.append("truck right" if truck_amount > 0 else "truck left")
        if abs(crane_amount) > 0.5:
            movements.append("crane up" if crane_amount > 0 else "crane down")

    roll_delta = end_cam.roll - start_cam.roll
    if abs(roll_delta) > 5.0:
        movements.append(f"{round(roll_delta)}° Dutch roll tilt")

    if abs(pan_degrees) > 5.0:
        movements.append("pan right" if pan_degrees > 0 else "pan left")
    if abs(tilt_degrees) > 5.0:
        movements.append("tilt up" if tilt_degrees > 0 else "tilt down")
    if abs(fov_delta) > 2.0 and path_length < 0.05:
        movements.append("optical zoom out" if fov_delta > 0 else "optical zoom in")

    if not movements:
        movements.append("static framing with subtle floating motion")

    motion_tags = []
    if abs(orbit_degrees) > 20.0:
        motion_tags.append("orbit_left" if orbit_degrees > 0 else "orbit_right")
    if abs(dolly_amount) > 0.5:
        motion_tags.append("dolly_in" if dolly_amount > 0 else "dolly_out")
    if abs(truck_amount) > 0.5:
        motion_tags.append("truck_right" if truck_amount > 0 else "truck_left")
    if abs(crane_amount) > 0.5:
        motion_tags.append("pedestal_up" if crane_amount > 0 else "pedestal_down")
    if abs(pan_degrees) > 5.0:
        motion_tags.append("pan_right" if pan_degrees > 0 else "pan_left")
    if abs(tilt_degrees) > 5.0:
        motion_tags.append("tilt_up" if tilt_degrees > 0 else "tilt_down")
    if abs(roll_delta) > 5.0:
        motion_tags.append("roll")
    optical = "zoom_out" if fov_delta > 2.0 else ("zoom_in" if fov_delta < -2.0 else "locked")
    if not motion_tags:
        motion_tags.append("zoom_only" if optical != "locked" else ("locked_shot" if path_length < 0.01 and angular_distance < 1.0 else "floating"))
    classification = {
        "primary": motion_tags[0],
        "secondary": motion_tags[1:],
        "optical": optical,
        "compound": len(motion_tags) > 1,
    }

    return {
        "movements": movements,
        "primary_movement": movements[0],
        "classification": classification,
        "pacing": pacing,
        "lens_type": lens_type,
        "start_focal_mm": round(start_focal_mm, 1),
        "end_focal_mm": round(end_focal_mm, 1),
        "start_fov": round(start_cam.fov, 1),
        "end_fov": round(end_cam.fov, 1),
        "is_dolly_zoom": is_dolly_zoom,
        "orbit_degrees": round(orbit_degrees, 1),
        "dolly_amount": round(dolly_amount, 2),
        "truck_amount": round(truck_amount, 2),
        "crane_amount": round(crane_amount, 2),
        "roll_degrees": round(roll_delta, 2),
        "peak_speed": round(peak_speed, 2),
        "avg_speed": round(avg_speed, 2),
        "path_length": round(path_length, 3),
        "angular_distance_degrees": round(angular_distance, 2),
        "pan_degrees": round(pan_degrees, 2),
        "tilt_degrees": round(tilt_degrees, 2),
        "peak_acceleration": round(max((abs(v) for v in accelerations), default=0.0), 2),
        "peak_jerk": round(max((abs(v) for v in jerks), default=0.0), 2),
        "integrated_curvature_degrees": round(path_curvature, 2),
        "fov_distance_correlation": round(correlation(fovs, distances), 4),
        "fov_speed_correlation": round(correlation(fovs, speeds), 4),
        "duration_seconds": round(duration / max(1, track.fps), 2),
    }


def build_cinematic_motion_prompt(
    track: OmniCamTrack,
    base_prompt: str = "",
    style: str = "universal",
    include_technical_specs: bool = True,
) -> str:
    """Generate a rich, director-level cinematic motion prompt describing the camera path.

    Formulated specifically for high-adherence video diffusion models (MiniMax H3,
    Kling, Luma Dream Machine, HunyuanVideo, Wan 2.1, LTX).
    """
    analysis = analyze_camera_trajectory(track)
    movements_desc = ", ".join(analysis["movements"])
    lens_desc = f"shot on a {analysis['start_focal_mm']}mm {analysis['lens_type']}"

    style_lower = (style or "universal").lower()

    if style_lower == "h3":
        # MiniMax H3 / Hailuo Omni Reference prompt structure
        camera_prompt = (
            f"The camera executes a {analysis['pacing']} {movements_desc}, {lens_desc}. "
            "Maintain smooth camera trajectory, continuous spatial depth, realistic parallax progression, "
            f"and stable subject framing at {track.fps}fps."
        )
    elif style_lower == "kling":
        # Kling AI camera prompt syntax
        kling_moves = []
        if analysis["is_dolly_zoom"]:
            kling_moves.append("Zoom in, Camera move back (Vertigo)")
        else:
            if abs(analysis["orbit_degrees"]) > 20.0:
                kling_moves.append("Orbit around subject" if analysis["orbit_degrees"] > 0 else "Orbit counter-clockwise")
            if abs(analysis["dolly_amount"]) > 0.5:
                kling_moves.append("Push in" if analysis["dolly_amount"] > 0 else "Pull out")
            if abs(analysis["truck_amount"]) > 0.5:
                kling_moves.append("Truck right" if analysis["truck_amount"] > 0 else "Truck left")
            if abs(analysis["crane_amount"]) > 0.5:
                kling_moves.append("Crane up" if analysis["crane_amount"] > 0 else "Crane down")
        if not kling_moves:
            kling_moves.append("Static shot")
        camera_prompt = f"Camera Movement: {', '.join(kling_moves)}. Lens: {analysis['start_focal_mm']}mm. Pace: {analysis['pacing']}."
    elif style_lower == "luma":
        # Luma Dream Machine camera syntax
        luma_moves = []
        if analysis["is_dolly_zoom"]:
            luma_moves.append("dolly zoom vertigo effect")
        else:
            if abs(analysis["orbit_degrees"]) > 20.0:
                luma_moves.append("orbit camera around subject")
            if abs(analysis["dolly_amount"]) > 0.5:
                luma_moves.append("push forward into scene" if analysis["dolly_amount"] > 0 else "dolly backward pulling away")
            if abs(analysis["truck_amount"]) > 0.5:
                luma_moves.append("truck camera right" if analysis["truck_amount"] > 0 else "truck camera left")
            if abs(analysis["crane_amount"]) > 0.5:
                luma_moves.append("pedestal crane camera up" if analysis["crane_amount"] > 0 else "crane camera down")
        if not luma_moves:
            luma_moves.append("smooth handheld cinematic floating camera")
        camera_prompt = f"Camera motion: {', '.join(luma_moves)}, {analysis['pacing']}, cinematic {analysis['start_focal_mm']}mm lens."
    elif style_lower == "hunyuan":
        # HunyuanVideo natural language cinematic description
        camera_prompt = (
            f"Film captured with a cinematic camera performing {movements_desc}. "
            f"Equipped with a {analysis['start_focal_mm']}mm {analysis['lens_type']}, delivering {analysis['pacing']} movement, "
            "clear multi-planar depth separation, and fluid motion blur."
        )
    elif style_lower == "wan":
        # Wan 2.1 motion prompt cues
        camera_prompt = (
            f"Dynamic camera movement: {movements_desc}, {analysis['pacing']} pace, {lens_desc}. "
            "Accurate optical flow, physical 3D scene coherence, smooth trajectory."
        )
    else:
        # Universal director prompt
        camera_prompt = f"Cinematic {analysis['pacing']} camera motion, {movements_desc}, {lens_desc}"
        if include_technical_specs:
            camera_prompt += f", smooth fluid motion blur, {track.fps}fps, strong spatial parallax and geometric depth consistency"

    if base_prompt and base_prompt.strip():
        return f"{base_prompt.strip()}. {camera_prompt}" if not base_prompt.strip().endswith(".") else f"{base_prompt.strip()} {camera_prompt}"
    return camera_prompt if camera_prompt.endswith(".") else f"{camera_prompt}."
