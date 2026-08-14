from __future__ import annotations

import math

from .track import CameraState


def sub(a, b):
    return [a[i] - b[i] for i in range(3)]


def add(a, b):
    return [a[i] + b[i] for i in range(3)]


def mul(a, s):
    return [a[i] * s for i in range(3)]


def dot(a, b):
    return sum(a[i] * b[i] for i in range(3))


def cross(a, b):
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ]


def norm(v):
    mag = math.sqrt(max(1e-12, dot(v, v)))
    return [x / mag for x in v]


def basis(camera: CameraState):
    offset = sub(camera.target, camera.position)
    if math.sqrt(dot(offset, offset)) < 1e-6:
        forward = [0.0, 0.0, -1.0]
    else:
        forward = norm(offset)
    world_up = [0.0, 1.0, 0.0]
    right = cross(forward, world_up)
    if math.sqrt(dot(right, right)) < 1e-6:
        # Forward is parallel to world up: pick a stable fallback axis.
        world_up = [0.0, 0.0, -1.0 if forward[1] > 0 else 1.0]
        right = cross(forward, world_up)
    right = norm(right)
    up = norm(cross(right, forward))
    if abs(camera.roll) > 1e-9:
        r = math.radians(camera.roll)
        c, s = math.cos(r), math.sin(r)
        right, up = add(mul(right, c), mul(up, s)), add(mul(up, c), mul(right, -s))
    return right, up, forward


def project_point(point, camera: CameraState, width: int, height: int):
    right, up, forward = basis(camera)
    rel = sub(point, camera.position)
    z = dot(rel, forward)
    if z <= max(1e-4, camera.near) or z >= camera.far:
        return None
    x = dot(rel, right)
    y = dot(rel, up)
    if camera.camera_type == "orthographic":
        half_height = 5.0 / max(0.01, camera.zoom)
        half_width = half_height * width / max(1, height)
        sx = width * (0.5 + x / (2.0 * half_width))
        sy = height * (0.5 - y / (2.0 * half_height))
        return [sx, sy, z]
    f = 0.5 * height / math.tan(math.radians(max(1e-3, camera.fov)) * 0.5)
    sx = width * 0.5 + x * f / z
    sy = height * 0.5 - y * f / z
    return [sx, sy, z]


def make_reference_points(count: int = 16, radius: float = 2.5, height: float = 3.0):
    count = max(4, int(count))
    points = []
    rings = max(2, int(math.sqrt(count)))
    for i in range(count):
        angle = (2.0 * math.pi * i) / count
        ring = i % rings
        r = radius * (0.45 + 0.55 * (ring / max(1, rings - 1)))
        y = 0.25 + height * ((i * 0.61803398875) % 1.0)
        points.append([math.cos(angle) * r, y, math.sin(angle) * r])
    return points
