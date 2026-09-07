"""Tests for ground-relative OBB fitting (plan Task 6)."""

from __future__ import annotations

import math

import numpy as np
import pytest

from omnicam.reconstruction.blockout.obb import fit_ground_relative_obb


def _filled_box(width: float, height: float, depth: float, n: int = 4000, seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    return np.stack(
        [
            rng.uniform(-width / 2, width / 2, n),
            rng.uniform(0.0, height, n),
            rng.uniform(-depth / 2, depth / 2, n),
        ],
        axis=-1,
    )


def _yaw_about_y(points: np.ndarray, degrees: float) -> np.ndarray:
    t = math.radians(degrees)
    c, s = math.cos(t), math.sin(t)
    rot = np.array([[c, 0.0, s], [0.0, 1.0, 0.0], [-s, 0.0, c]])
    return points @ rot.T


def test_axis_aligned_cube():
    obb = fit_ground_relative_obb(_filled_box(1.0, 1.0, 1.0))
    assert obb.size[0] == pytest.approx(0.9, abs=0.15)  # 5..95 pct of a uniform unit span
    assert obb.size[1] == pytest.approx(0.9, abs=0.15)
    assert obb.size[2] == pytest.approx(0.9, abs=0.15)
    # Footprint is square -> yaw is undefined; the fitter down-weights it via
    # the low anisotropy rather than trusting whatever angle noise produces.
    assert obb.planar_anisotropy < 0.2


def test_thirty_degree_yaw_rectangle():
    box = _filled_box(2.0, 1.2, 0.6)
    obb = fit_ground_relative_obb(_yaw_about_y(box, 30.0))
    footprint = sorted(obb.size[[0, 2]])
    assert footprint[0] == pytest.approx(0.55, abs=0.15)
    assert footprint[1] == pytest.approx(1.85, abs=0.2)
    assert obb.size[1] == pytest.approx(1.08, abs=0.15)
    # A box's yaw is only defined modulo 90 degrees.
    assert (obb.yaw_degrees % 90.0) == pytest.approx(30.0, abs=6.0)
    assert obb.planar_anisotropy > 0.5


def test_noisy_outliers_do_not_inflate_the_box():
    box = _filled_box(1.0, 1.0, 1.0, n=3000)
    outliers = np.array([[12.0, 0.5, 0.0], [-9.0, 0.5, 7.0], [0.0, 0.5, -15.0]])
    obb = fit_ground_relative_obb(np.vstack([box, outliers]))
    assert obb.size[0] < 1.4
    assert obb.size[2] < 1.4
    assert np.linalg.norm(obb.center[[0, 2]]) < 0.3


def test_near_square_object_has_low_yaw_confidence():
    obb = fit_ground_relative_obb(_filled_box(1.0, 1.0, 1.03))
    assert obb.planar_anisotropy < 0.15


def test_rejects_degenerate_input():
    with pytest.raises(ValueError):
        fit_ground_relative_obb(np.zeros((2, 3)))
    with pytest.raises(ValueError):
        fit_ground_relative_obb(np.zeros((10, 2)))
