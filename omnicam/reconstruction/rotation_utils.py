"""Shared rotation helpers: align a proxy's local axis to a fitted world normal.

Extracted so both the depth-mesh ``scene_builder`` and the blockout
``room_shell`` produce the same MotionScene Euler XYZ (three.js
``Euler.setFromRotationMatrix(..., 'XYZ')``) for a tilted floor or an angled
wall, instead of one of them hardcoding ``[0, 0, 0]``.
"""

from __future__ import annotations

import math

import numpy as np

#: A normal within this dot of the proxy's default local axis is left at
#: rotation [0, 0, 0]: RANSAC's normal has ~1 degree of noise near vertical, and
#: re-encoding that as a nonzero rotation buys nothing.
ALIGNED_DOT_THRESHOLD = 0.9999


def euler_xyz_degrees_from_matrix(r: np.ndarray) -> tuple[float, float, float]:
    """Decompose a 3x3 rotation into MotionScene's Euler XYZ degrees."""
    m11, m12, m13 = r[0]
    _m21, m22, m23 = r[1]
    _m31, m32, m33 = r[2]

    y = math.asin(max(-1.0, min(1.0, m13)))
    if abs(m13) < 0.9999999:
        x = math.atan2(-m23, m33)
        z = math.atan2(-m12, m11)
    else:
        x = math.atan2(m32, m22)
        z = 0.0
    return (math.degrees(x), math.degrees(y), math.degrees(z))


def _rotation_matrix_from_axis_angle(axis: np.ndarray, angle: float) -> np.ndarray:
    """Rodrigues' rotation formula: 3x3 matrix rotating ``angle`` rad about unit ``axis``."""
    ax, ay, az = axis
    k = np.array([[0.0, -az, ay], [az, 0.0, -ax], [-ay, ax, 0.0]])
    return np.eye(3) + math.sin(angle) * k + (1.0 - math.cos(angle)) * (k @ k)


def euler_aligning_axis_to_normal(
    local_axis: tuple[float, float, float],
    normal: tuple[float, float, float],
) -> tuple[float, float, float]:
    """Euler XYZ degrees rotating ``local_axis`` (proxy-local) onto ``normal``
    (world), by the shortest path. No preference about rotation around the axis."""
    axis = np.asarray(local_axis, dtype=np.float64)
    n = np.asarray(normal, dtype=np.float64)
    n_len = float(np.linalg.norm(n))
    if n_len < 1e-9:
        return (0.0, 0.0, 0.0)
    n = n / n_len

    dot = float(np.clip(np.dot(axis, n), -1.0, 1.0))
    if dot >= ALIGNED_DOT_THRESHOLD:
        return (0.0, 0.0, 0.0)
    if dot <= -ALIGNED_DOT_THRESHOLD:
        perpendicular = np.cross(axis, [1.0, 0.0, 0.0])
        if float(np.linalg.norm(perpendicular)) < 1e-6:
            perpendicular = np.cross(axis, [0.0, 1.0, 0.0])
        perpendicular = perpendicular / np.linalg.norm(perpendicular)
        return euler_xyz_degrees_from_matrix(_rotation_matrix_from_axis_angle(perpendicular, math.pi))

    rot_axis = np.cross(axis, n)
    rot_axis = rot_axis / np.linalg.norm(rot_axis)
    angle = math.acos(dot)
    return euler_xyz_degrees_from_matrix(_rotation_matrix_from_axis_angle(rot_axis, angle))
