"""Canonical, dependency-free camera math shared by core and adapters."""

from __future__ import annotations

import math
from typing import Sequence

Vec3 = list[float]


def _sub(a: Sequence[float], b: Sequence[float]) -> Vec3:
    return [float(a[i]) - float(b[i]) for i in range(3)]


def _dot(a: Sequence[float], b: Sequence[float]) -> float:
    return sum(float(a[i]) * float(b[i]) for i in range(3))


def _cross(a: Sequence[float], b: Sequence[float]) -> Vec3:
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]


def _normalize(value: Sequence[float], fallback: Sequence[float]) -> Vec3:
    length = math.sqrt(max(0.0, _dot(value, value)))
    return list(fallback) if length < 1e-9 else [float(v) / length for v in value]


def safe_forward(position: Sequence[float], target: Sequence[float]) -> Vec3:
    return _normalize(_sub(target, position), (0.0, 0.0, -1.0))


def apply_roll(right: Sequence[float], up: Sequence[float], roll_degrees: float) -> tuple[Vec3, Vec3]:
    angle = math.radians(float(roll_degrees))
    cosine, sine = math.cos(angle), math.sin(angle)
    return (
        [right[i] * cosine + up[i] * sine for i in range(3)],
        [up[i] * cosine - right[i] * sine for i in range(3)],
    )


def camera_basis(position: Sequence[float], target: Sequence[float], roll: float = 0.0) -> tuple[Vec3, Vec3, Vec3]:
    forward = safe_forward(position, target)
    world_up: Vec3 = [0.0, 1.0, 0.0]
    right = _cross(forward, world_up)
    if _dot(right, right) < 1e-12:
        world_up = [0.0, 0.0, -1.0 if forward[1] > 0 else 1.0]
        right = _cross(forward, world_up)
    right = _normalize(right, (1.0, 0.0, 0.0))
    up = _normalize(_cross(right, forward), (0.0, 1.0, 0.0))
    right, up = apply_roll(right, up, roll)
    return right, up, forward


look_at_basis = camera_basis


def camera_quaternion(position: Sequence[float], target: Sequence[float], roll: float = 0.0) -> dict[str, float]:
    """World quaternion for a right-handed Y-up camera looking down local -Z."""
    right, up, forward = camera_basis(position, target, roll)
    matrix = ((right[0], up[0], -forward[0]), (right[1], up[1], -forward[1]), (right[2], up[2], -forward[2]))
    trace = matrix[0][0] + matrix[1][1] + matrix[2][2]
    if trace > 0:
        scale = math.sqrt(trace + 1.0) * 2
        w = 0.25 * scale
        x, y, z = (matrix[2][1] - matrix[1][2]) / scale, (matrix[0][2] - matrix[2][0]) / scale, (matrix[1][0] - matrix[0][1]) / scale
    else:
        axis = max(range(3), key=lambda i: matrix[i][i])
        if axis == 0:
            scale = math.sqrt(1 + matrix[0][0] - matrix[1][1] - matrix[2][2]) * 2
            x, y, z, w = 0.25 * scale, (matrix[0][1] + matrix[1][0]) / scale, (matrix[0][2] + matrix[2][0]) / scale, (matrix[2][1] - matrix[1][2]) / scale
        elif axis == 1:
            scale = math.sqrt(1 + matrix[1][1] - matrix[0][0] - matrix[2][2]) * 2
            x, y, z, w = (matrix[0][1] + matrix[1][0]) / scale, 0.25 * scale, (matrix[1][2] + matrix[2][1]) / scale, (matrix[0][2] - matrix[2][0]) / scale
        else:
            scale = math.sqrt(1 + matrix[2][2] - matrix[0][0] - matrix[1][1]) * 2
            x, y, z, w = (matrix[0][2] + matrix[2][0]) / scale, (matrix[1][2] + matrix[2][1]) / scale, 0.25 * scale, (matrix[1][0] - matrix[0][1]) / scale
    length = math.sqrt(x * x + y * y + z * z + w * w) or 1.0
    return {"x": x / length, "y": y / length, "z": z / length, "w": w / length}


def world_to_camera(point: Sequence[float], position: Sequence[float], target: Sequence[float], roll: float = 0.0) -> Vec3:
    right, up, forward = camera_basis(position, target, roll)
    relative = _sub(point, position)
    return [_dot(relative, right), _dot(relative, up), _dot(relative, forward)]


def camera_to_world(point: Sequence[float], position: Sequence[float], target: Sequence[float], roll: float = 0.0) -> Vec3:
    right, up, forward = camera_basis(position, target, roll)
    return [position[i] + point[0] * right[i] + point[1] * up[i] + point[2] * forward[i] for i in range(3)]


def vertical_fov_to_horizontal_fov(vertical_fov: float, aspect: float) -> float:
    return math.degrees(2 * math.atan(math.tan(math.radians(vertical_fov) / 2) * max(1e-9, aspect)))


def horizontal_fov_to_vertical_fov(horizontal_fov: float, aspect: float) -> float:
    return math.degrees(2 * math.atan(math.tan(math.radians(horizontal_fov) / 2) / max(1e-9, aspect)))


def fov_to_focal_length(fov_degrees: float, sensor_size_mm: float) -> float:
    return float(sensor_size_mm) / (2 * math.tan(math.radians(max(0.01, min(179.0, fov_degrees))) / 2))


def focal_length_to_fov(focal_length_mm: float, sensor_size_mm: float) -> float:
    return math.degrees(2 * math.atan(float(sensor_size_mm) / (2 * max(1e-6, float(focal_length_mm)))))
