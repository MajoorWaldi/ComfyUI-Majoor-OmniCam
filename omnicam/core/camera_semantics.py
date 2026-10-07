"""Deterministic cinematic semantics derived from canonical camera geometry."""

from __future__ import annotations

import math
from typing import Any

from .camera_math import fov_to_focal_length
from .projection import project_point
from .camera_math import rotate_quaternion
from .track import CameraState, OmniCamTrack, sample_object_world_transform
from .validation import LIGHT_TYPES
from ..guides.model import CameraViewSemantic, FramingSemantic

SENSOR_HEIGHT_MM = 24.0
NON_SUBJECT_TYPES = LIGHT_TYPES | {"null", "ground"}
SHOT_THRESHOLDS = (
    (0.92, "extreme_close_up"),
    (0.72, "close_up"),
    (0.55, "medium_close_up"),
    (0.38, "medium_shot"),
    (0.25, "medium_long_shot"),
    (0.15, "full_shot"),
    (0.07, "wide_shot"),
    (0.00, "extreme_wide_shot"),
)


def classify_shot(coverage_y: float) -> str:
    coverage = max(0.0, float(coverage_y))
    return next(name for threshold, name in SHOT_THRESHOLDS if coverage >= threshold)


def classify_roll(roll: float) -> str:
    value = abs(float(roll))
    if value < 3.0:
        return "level"
    if value < 8.0:
        return "subtle_dutch"
    if value < 25.0:
        return "dutch"
    return "extreme_dutch"


def classify_lens(focal_mm: float) -> str:
    if focal_mm < 20:
        return "ultra_wide"
    if focal_mm < 32:
        return "wide"
    if focal_mm < 60:
        return "normal"
    if focal_mm < 100:
        return "short_telephoto"
    if focal_mm < 180:
        return "telephoto"
    return "long_telephoto"


def _horizontal_viewpoint(azimuth: float) -> str:
    if azimuth <= -157.5 or azimuth > 157.5:
        return "back"
    if azimuth > 112.5:
        return "rear_right_three_quarter"
    if azimuth > 67.5:
        return "right_profile"
    if azimuth > 22.5:
        return "front_right_three_quarter"
    if azimuth >= -22.5:
        return "front"
    if azimuth >= -67.5:
        return "front_left_three_quarter"
    if azimuth >= -112.5:
        return "left_profile"
    return "rear_left_three_quarter"


def _vertical_angle(elevation: float) -> str:
    if elevation < -45:
        return "extreme_low"
    if elevation < -20:
        return "low"
    if elevation < -7:
        return "slight_low"
    if elevation <= 7:
        return "eye_level"
    if elevation <= 20:
        return "slight_high"
    if elevation <= 65:
        return "high"
    return "overhead"


def _subject_object(objects: list[dict[str, Any]], subject_id: str | None) -> dict[str, Any] | None:
    enabled = [obj for obj in objects if isinstance(obj, dict) and obj.get("enabled", True)]
    if subject_id:
        explicit = next((obj for obj in enabled if obj.get("id") == subject_id), None)
        if explicit and explicit.get("type") not in NON_SUBJECT_TYPES:
            return explicit
    tagged = next((obj for obj in enabled if obj.get("semantic") == "subject" and obj.get("type") not in NON_SUBJECT_TYPES), None)
    if tagged:
        return tagged
    identified = next((obj for obj in enabled if obj.get("id") == "subject" and obj.get("type") not in NON_SUBJECT_TYPES), None)
    if identified:
        return identified
    return next((obj for obj in enabled if obj.get("type") in {"human", "card", "model", "glb"}), None)


def _framing(camera: CameraState, subject: dict[str, Any], objects: list[dict[str, Any]], width: int, height: int, frame: float) -> FramingSemantic:
    transform = sample_object_world_transform(objects, subject, frame)
    size = transform["size"]
    corners = [[x * size[0] * 0.5, y * size[1] * 0.5, z * size[2] * 0.5] for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]
    projected = []
    for corner in corners:
        world = rotate_quaternion(corner, transform["quaternion"])
        world = [world[i] + transform["position"][i] for i in range(3)]
        point = project_point(world, camera, width, height)
        if point is not None:
            projected.append(point)
    if not projected:
        return FramingSemantic(shot_type="extreme_wide_shot", clipped=True, subject_id=str(subject.get("id") or ""))
    xs, ys = [point[0] for point in projected], [point[1] for point in projected]
    min_x, max_x, min_y, max_y = min(xs), max(xs), min(ys), max(ys)
    coverage_x = max(0.0, (max_x - min_x) / max(1, width))
    coverage_y = max(0.0, (max_y - min_y) / max(1, height))
    center_x = (min_x + max_x) * 0.5 / max(1, width)
    center_y = (min_y + max_y) * 0.5 / max(1, height)
    clipped = len(projected) != len(corners) or min_x < 0 or max_x > width or min_y < 0 or max_y > height
    return FramingSemantic(
        shot_type=classify_shot(coverage_y), coverage_x=coverage_x, coverage_y=coverage_y,
        coverage_area=coverage_x * coverage_y, center_offset_x=center_x - 0.5,
        center_offset_y=center_y - 0.5, clipped=clipped, subject_id=str(subject.get("id") or ""),
    )


def analyze_camera_view(camera: CameraState, *, objects: list[dict[str, Any]], width: int, height: int, frame: float, subject_id: str | None = None) -> CameraViewSemantic:
    dx = camera.position[0] - camera.target[0]
    dy = camera.position[1] - camera.target[1]
    dz = camera.position[2] - camera.target[2]
    horizontal = math.hypot(dx, dz)
    distance = math.sqrt(dx * dx + dy * dy + dz * dz)
    azimuth = math.degrees(math.atan2(dx, dz))
    elevation = math.degrees(math.atan2(dy, max(1e-9, horizontal)))
    subject = _subject_object(objects, subject_id)
    return CameraViewSemantic(
        viewpoint=_horizontal_viewpoint(azimuth), vertical_angle=_vertical_angle(elevation),
        roll_style=classify_roll(camera.roll), distance=distance,
        focal_length_mm=fov_to_focal_length(camera.fov, SENSOR_HEIGHT_MM),
        lens_class=classify_lens(fov_to_focal_length(camera.fov, SENSOR_HEIGHT_MM)),
        framing=_framing(camera, subject, objects, width, height, frame) if subject else None,
    )


def analyze_track_endpoints(track: OmniCamTrack, *, objects: list[dict[str, Any]], subject_id: str | None = None) -> tuple[CameraViewSemantic, CameraViewSemantic]:
    last = max(0, track.duration_frames - 1)
    return (
        analyze_camera_view(track.sample(0), objects=objects, width=track.width, height=track.height, frame=0, subject_id=subject_id),
        analyze_camera_view(track.sample(last), objects=objects, width=track.width, height=track.height, frame=last, subject_id=subject_id),
    )