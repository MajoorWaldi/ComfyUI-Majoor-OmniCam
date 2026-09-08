"""Tests for the blockout room shell (plan Task 9)."""

from __future__ import annotations

import math

import pytest

from omnicam.reconstruction.blockout.room_shell import (
    GROUND_THICKNESS,
    build_room_proxies,
    wall_yaw_from_normal,
)
from omnicam.reconstruction.types import ReconstructedPlane


def _ground(size=(6.0, 4.0)):
    return ReconstructedPlane(
        plane_type="ground", center=(0.0, -1.4, -3.0), normal=(0.0, 1.0, 0.0), size=size, confidence=0.8
    )


def _wall(normal, size=(3.0, 2.5)):
    return ReconstructedPlane(
        plane_type="wall", center=(0.0, 0.0, -5.0), normal=normal, size=size, confidence=0.6
    )


def test_ground_maps_xz_to_xz_with_thin_y():
    (proxy,) = build_room_proxies([_ground(size=(6.0, 4.0))])
    assert proxy.primitive == "ground"
    assert proxy.size[0] == pytest.approx(6.0)
    assert proxy.size[1] == pytest.approx(GROUND_THICKNESS)
    assert proxy.size[2] == pytest.approx(4.0)  # the detected Z footprint, not 1.0
    # A perfectly level floor stays at zero rotation.
    assert proxy.rotation == (0.0, 0.0, 0.0)


def test_tilted_ground_follows_the_fitted_normal():
    # A floor tilted ~10 degrees about X: normal leans in Z.
    t = math.radians(10.0)
    plane = ReconstructedPlane(
        plane_type="ground",
        center=(0.0, -1.4, -3.0),
        normal=(0.0, math.cos(t), math.sin(t)),
        size=(6.0, 4.0),
        confidence=0.8,
    )
    (proxy,) = build_room_proxies([plane])
    # The proxy is no longer dead flat; the tilt magnitude matches the normal.
    assert abs(proxy.rotation[0]) == pytest.approx(10.0, abs=1.0)
    assert proxy.size[1] == pytest.approx(GROUND_THICKNESS)  # still a thin slab


def test_back_wall_normal_points_along_z_zero_yaw():
    (proxy,) = build_room_proxies([_wall(normal=(0.0, 0.0, 1.0))])
    assert proxy.rotation[1] == pytest.approx(0.0, abs=1e-6)
    assert proxy.size[2] == pytest.approx(0.02)


def test_side_wall_normal_points_along_x_ninety_yaw():
    (proxy,) = build_room_proxies([_wall(normal=(1.0, 0.0, 0.0))])
    assert proxy.rotation[1] == pytest.approx(90.0, abs=1e-6)


def test_thirtyfive_degree_wall_yaw_follows_normal():
    t = math.radians(35.0)
    normal = (math.sin(t), 0.0, math.cos(t))
    assert wall_yaw_from_normal(normal) == pytest.approx(35.0, abs=1e-6)
    (proxy,) = build_room_proxies([_wall(normal=normal)])
    assert proxy.rotation[1] == pytest.approx(35.0, abs=1e-6)


def test_multiple_planes_are_ordered_and_numbered():
    proxies = build_room_proxies(
        [_wall(normal=(1.0, 0.0, 0.0)), _ground(), _wall(normal=(0.0, 0.0, 1.0))]
    )
    ids = [p.object_id for p in proxies]
    assert ids == ["reconstruction_ground", "reconstruction_wall_1", "reconstruction_wall_2"]
