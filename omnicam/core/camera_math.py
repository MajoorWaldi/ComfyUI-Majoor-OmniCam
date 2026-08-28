"""Canonical, dependency-free camera math shared by core and adapters."""

from __future__ import annotations

import math
from collections.abc import Sequence

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


def quaternion_from_euler(rotation: Sequence[float]) -> list[float]:
    x, y, z = (math.radians(float(value)) * 0.5 for value in rotation)
    cx, sx, cy, sy, cz, sz = math.cos(x), math.sin(x), math.cos(y), math.sin(y), math.cos(z), math.sin(z)
    return [sx * cy * cz + cx * sy * sz, cx * sy * cz - sx * cy * sz, cx * cy * sz + sx * sy * cz, cx * cy * cz - sx * sy * sz]


def multiply_quaternions(a: Sequence[float], b: Sequence[float]) -> list[float]:
    return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]


def rotate_quaternion(vector: Sequence[float], quaternion: Sequence[float]) -> list[float]:
    x, y, z, w = quaternion
    vx, vy, vz = vector
    ix, iy, iz, iw = w * vx + y * vz - z * vy, w * vy + z * vx - x * vz, w * vz + x * vy - y * vx, -x * vx - y * vy - z * vz
    return [ix * w - iw * x - iy * z + iz * y, iy * w - iw * y - iz * x + ix * z, iz * w - iw * z - ix * y + iy * x]


def euler_from_quaternion(quaternion: Sequence[float]) -> list[float]:
    """Inverse of :func:`quaternion_from_euler`, in the same XYZ order.

    The previous implementation extracted a ZYX (roll-pitch-yaw) sequence while
    quaternion_from_euler composed an XYZ one, so the two were not inverses:
    a child object under an identity parent came back rotated. Object parenting
    goes through exactly this round trip, so every parented rotation was wrong.
    """
    x, y, z, w = quaternion
    m11 = 1 - 2 * (y * y + z * z)
    m12 = 2 * (x * y - z * w)
    m13 = 2 * (x * z + y * w)
    m22 = 1 - 2 * (x * x + z * z)
    m23 = 2 * (y * z - x * w)
    m32 = 2 * (y * z + x * w)
    m33 = 1 - 2 * (x * x + y * y)
    ry = math.asin(max(-1.0, min(1.0, m13)))
    if abs(m13) < 0.9999999:
        rx, rz = math.atan2(-m23, m33), math.atan2(-m12, m11)
    else:
        # Gimbal lock: pitch is +/-90 degrees, so roll and yaw are one freedom.
        rx, rz = math.atan2(m32, m22), 0.0
    return [math.degrees(value) for value in (rx, ry, rz)]
