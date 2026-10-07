"""Deterministic lighting intent derived from authored scene lights."""

from __future__ import annotations

import math
from typing import Any

from .camera_math import camera_basis, rotate_quaternion
from .track import CameraState, sample_object_world_transform
from .validation import LIGHT_ROLES, LIGHT_TYPES
from ..guides.model import LightingSemantic


def _height(value: float) -> str:
    if value < -0.5:
        return "below"
    if value < 0.2:
        return "low"
    if value < 0.65:
        return "level"
    if value < 0.9:
        return "high"
    return "above"


def _direction(vector: list[float], camera: CameraState) -> str:
    right, _up, forward = camera_basis(camera.position, camera.target, camera.roll)
    front = [-value for value in forward]
    horizontal = math.hypot(sum(vector[i] * right[i] for i in range(3)), sum(vector[i] * front[i] for i in range(3)))
    if horizontal < 1e-9:
        return "front"
    angle = math.degrees(math.atan2(sum(vector[i] * right[i] for i in range(3)), sum(vector[i] * front[i] for i in range(3))))
    if angle <= -157.5 or angle > 157.5:
        return "rear"
    if angle > 112.5:
        return "rear_right"
    if angle > 67.5:
        return "right"
    if angle > 22.5:
        return "front_right"
    if angle >= -22.5:
        return "front"
    if angle >= -67.5:
        return "front_left"
    if angle >= -112.5:
        return "left"
    return "rear_left"


def _light_vector(obj: dict[str, Any], transform: dict[str, list[float]], subject_center: list[float]) -> list[float]:
    # This vector always points from the subject toward the light, matching the
    # point-light case below, so "front"/"rear"/"left"/"right" mean the same
    # thing for every light type.
    if obj.get("type") == "point_light":
        return [transform["position"][i] - subject_center[i] for i in range(3)]
    # Three.js directional/spot lights point down their local -Z axis, which is
    # the light-to-subject shine direction -- negate it for subject-to-light.
    shine = rotate_quaternion([0.0, 0.0, -1.0], transform["quaternion"])
    if math.sqrt(sum(value * value for value in shine)) < 1e-9:
        return [transform["position"][i] - subject_center[i] for i in range(3)]
    return [-value for value in shine]


def analyze_lighting(objects: list[dict[str, Any]], camera: CameraState, *, frame: float, subject_center: list[float]) -> LightingSemantic | None:
    lights = [obj for obj in objects if isinstance(obj, dict) and obj.get("enabled", True) and obj.get("type") in LIGHT_TYPES]
    if not lights:
        return None
    candidates = []
    for obj in lights:
        transform = sample_object_world_transform(objects, obj, frame)
        vector = _light_vector(obj, transform, subject_center)
        length = math.sqrt(sum(value * value for value in vector)) or 1.0
        normalized = [value / length for value in vector]
        candidates.append({
            "object": obj,
            "direction": _direction(normalized, camera),
            "height": _height(normalized[1]),
            "color": str(obj.get("color") or "#ffffff"),
            "intensity": float(obj.get("intensity", 1.0) or 0.0),
            "role": obj.get("light_role", "auto") if obj.get("light_role", "auto") in LIGHT_ROLES else "auto",
        })
    explicit = {item["role"]: item for item in candidates if item["role"] != "auto"}
    remaining = [item for item in candidates if item["role"] == "auto"]
    if "key" not in explicit and remaining:
        explicit["key"] = max(remaining, key=lambda item: item["intensity"])
        remaining.remove(explicit["key"])
    if "fill" not in explicit and remaining:
        explicit["fill"] = min(remaining, key=lambda item: item["intensity"])
        remaining.remove(explicit["fill"])
    if "rim" not in explicit:
        rear = [item for item in remaining if item["direction"].startswith("rear")]
        if rear:
            explicit["rim"] = max(rear, key=lambda item: item["intensity"])

    def value(role: str, field: str) -> str | None:
        item = explicit.get(role)
        return item[field] if item else None

    return LightingSemantic(
        key_direction=value("key", "direction"), key_height=value("key", "height"), key_color=value("key", "color"),
        fill_direction=value("fill", "direction"), fill_height=value("fill", "height"), fill_color=value("fill", "color"),
        rim_direction=value("rim", "direction"), rim_height=value("rim", "height"), rim_color=value("rim", "color"),
        active_light_count=len(lights),
    )