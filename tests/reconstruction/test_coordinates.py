"""Tests for reconstruction coordinate systems and intrinsics conversions."""

from __future__ import annotations

import math

import numpy as np
import pytest

from omnicam.reconstruction.coordinates import (
    flip_winding,
    fov_from_intrinsics,
    opencv_points_to_omnicam,
)


def test_opencv_points_to_omnicam_numpy():
    pts = np.array([[[1.0, 2.0, 3.0]]], dtype=np.float32)
    out = opencv_points_to_omnicam(pts)
    assert np.allclose(out, np.array([[[1.0, -2.0, -3.0]]], dtype=np.float32))
    # Original array should remain untouched
    assert pts[0, 0, 1] == 2.0


def test_opencv_points_to_omnicam_torch():
    torch = pytest.importorskip("torch")
    pts = torch.tensor([[1.0, 2.0, 3.0], [-4.0, -5.0, 6.0]])
    out = opencv_points_to_omnicam(pts)
    expected = torch.tensor([[1.0, -2.0, -3.0], [-4.0, 5.0, -6.0]])
    assert torch.allclose(out, expected)


def test_flip_winding():
    faces = np.array([[0, 1, 2], [3, 4, 5]])
    flipped = flip_winding(faces)
    assert np.array_equal(flipped, np.array([[0, 2, 1], [3, 5, 4]]))


def test_flip_winding_torch():
    torch = pytest.importorskip("torch")
    faces = torch.tensor([[0, 1, 2], [3, 4, 5]])
    flipped = flip_winding(faces)
    expected = torch.tensor([[0, 2, 1], [3, 5, 4]])
    assert torch.equal(flipped, expected)


def test_fov_from_intrinsics_numeric():
    # If width = 1920, height = 1080
    # fx = 1920 / (2 * tan(60 deg / 2)) = 1920 / (2 * tan(pi/6)) = 1920 / (2 * 1/sqrt(3)) = 960 * sqrt(3)
    w, h = 1920, 1080
    fx = (w / 2.0) / math.tan(math.radians(30.0))
    fy = (h / 2.0) / math.tan(math.radians(20.0))  # fov_y = 40 deg
    k = [[fx, 0.0, w / 2.0], [0.0, fy, h / 2.0], [0.0, 0.0, 1.0]]

    fov_x, fov_y = fov_from_intrinsics(k, width=w, height=h)
    assert pytest.approx(fov_x, rel=1e-4) == 60.0
    assert pytest.approx(fov_y, rel=1e-4) == 40.0


def test_fov_from_intrinsics_guard_non_positive_focal():
    with pytest.raises(ValueError, match="positive"):
        fov_from_intrinsics([[0.0, 0.0, 100.0], [0.0, 500.0, 100.0], [0.0, 0.0, 1.0]], width=1000, height=800)

    with pytest.raises(ValueError, match="positive"):
        fov_from_intrinsics([[-500.0, 0.0, 100.0], [0.0, -500.0, 100.0], [0.0, 0.0, 1.0]], width=1000, height=800)
