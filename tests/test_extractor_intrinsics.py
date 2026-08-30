"""Lens resolution for the OmniCam Extractor."""

import math

import pytest

from omnicam.extractor.intrinsics import (
    AUTO_VERTICAL_FOV_DEGREES,
    resolve_intrinsics,
    vertical_fov_from_focal_pixels,
)


def test_auto_intrinsics_are_centered_and_finite():
    k = resolve_intrinsics(
        width=1920, height=1080, lens_mode="auto",
        fov_degrees=53.0, focal_length_mm=24.0, sensor_width_mm=36.0,
    )
    assert k.width == 1920
    assert k.height == 1080
    assert k.cx == 960
    assert k.cy == 540
    assert math.isfinite(k.fx) and k.fx > 0
    assert math.isfinite(k.fy) and k.fy > 0
    assert k.source == "auto_53deg_vertical_fov"


def test_fov_mode_uses_requested_vertical_fov():
    k = resolve_intrinsics(
        width=1280, height=720, lens_mode="fov",
        fov_degrees=60.0, focal_length_mm=24.0, sensor_width_mm=36.0,
    )
    expected_fy = 360.0 / math.tan(math.radians(30.0))
    assert abs(k.fy - expected_fy) < 1e-6
    assert abs(vertical_fov_from_focal_pixels(k.fy, k.height) - 60.0) < 1e-9


def test_auto_mode_round_trips_the_documented_default_fov():
    k = resolve_intrinsics(
        width=1280, height=720, lens_mode="auto",
        fov_degrees=12.0, focal_length_mm=24.0, sensor_width_mm=36.0,
    )
    assert abs(vertical_fov_from_focal_pixels(k.fy, k.height) - AUTO_VERTICAL_FOV_DEGREES) < 1e-9


def test_focal_mm_mode_derives_focal_from_the_horizontal_field():
    k = resolve_intrinsics(
        width=1920, height=1080, lens_mode="focal_mm",
        fov_degrees=53.0, focal_length_mm=50.0, sensor_width_mm=36.0,
    )
    horizontal_fov = 2.0 * math.atan(36.0 / (2.0 * 50.0))
    expected_fx = 960.0 / math.tan(horizontal_fov / 2.0)
    assert abs(k.fx - expected_fx) < 1e-6
    assert k.fx == k.fy  # square pixels
    assert "50mm" in k.source


def test_longer_lens_is_a_narrower_field():
    wide = resolve_intrinsics(
        width=1920, height=1080, lens_mode="focal_mm",
        fov_degrees=53.0, focal_length_mm=18.0, sensor_width_mm=36.0,
    )
    tele = resolve_intrinsics(
        width=1920, height=1080, lens_mode="focal_mm",
        fov_degrees=53.0, focal_length_mm=85.0, sensor_width_mm=36.0,
    )
    assert tele.fx > wide.fx
    assert vertical_fov_from_focal_pixels(tele.fy, tele.height) < vertical_fov_from_focal_pixels(wide.fy, wide.height)


def test_scaled_intrinsics_scale_principal_point_and_focal():
    k = resolve_intrinsics(
        width=1920, height=1080, lens_mode="auto",
        fov_degrees=53.0, focal_length_mm=24.0, sensor_width_mm=36.0,
    )
    small = k.scaled(0.5, 0.5)
    assert small.width == 960
    assert small.height == 540
    assert small.fx == k.fx * 0.5
    assert small.cx == k.cx * 0.5
    assert small.source == k.source


def test_unknown_lens_mode_is_rejected():
    with pytest.raises(ValueError, match="lens_mode"):
        resolve_intrinsics(
            width=1280, height=720, lens_mode="magic",
            fov_degrees=53.0, focal_length_mm=24.0, sensor_width_mm=36.0,
        )
