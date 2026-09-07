"""Tests for robust masked 3D point extraction (plan Task 5)."""

from __future__ import annotations

import numpy as np

from omnicam.reconstruction.blockout.masked_points import (
    erode_binary_mask_numpy,
    extract_masked_points,
)


def _grid_points(h: int, w: int, z: float = -3.0) -> np.ndarray:
    ys, xs = np.mgrid[0:h, 0:w]
    return np.stack([xs.astype(np.float32), ys.astype(np.float32), np.full((h, w), z, np.float32)], axis=-1)


def test_masked_points_drop_inf_nan_and_background():
    pts = _grid_points(10, 10)
    pts[0, 0] = [np.inf, 0.0, 0.0]
    pts[1, 1] = [np.nan, 0.0, 0.0]
    mask = np.zeros((10, 10), dtype=bool)
    mask[0:5, 0:5] = True  # includes the inf/nan pixels

    out = extract_masked_points(pts, mask, erode_pixels=0, max_points=10_000)
    assert np.isfinite(out).all()
    # 25 masked pixels minus the 2 non-finite ones, before outlier trim.
    assert len(out) <= 23
    assert len(out) >= 20


def test_masked_points_are_deterministically_sampled():
    pts = _grid_points(64, 64)
    mask = np.ones((64, 64), dtype=bool)
    a = extract_masked_points(pts, mask, erode_pixels=0, max_points=128, seed=7)
    b = extract_masked_points(pts, mask, erode_pixels=0, max_points=128, seed=7)
    c = extract_masked_points(pts, mask, erode_pixels=0, max_points=128, seed=8)
    assert np.array_equal(a, b)
    assert len(a) == 128
    assert not np.array_equal(a, c)


def test_mask_erosion_reduces_edge_contamination():
    pts = _grid_points(20, 20)
    mask = np.zeros((20, 20), dtype=bool)
    mask[5:15, 5:15] = True  # 10x10 block

    kept_no_erode = extract_masked_points(pts, mask, erode_pixels=0, max_points=10_000)
    kept_erode1 = extract_masked_points(pts, mask, erode_pixels=1, max_points=10_000)
    kept_erode2 = extract_masked_points(pts, mask, erode_pixels=2, max_points=10_000)

    assert len(kept_erode1) < len(kept_no_erode)
    assert len(kept_erode2) < len(kept_erode1)


def test_erode_binary_mask_numpy_shrinks_by_one_ring():
    mask = np.zeros((7, 7), dtype=bool)
    mask[1:6, 1:6] = True  # 5x5
    eroded = erode_binary_mask_numpy(mask, 1)
    assert eroded[2:5, 2:5].all()
    assert eroded.sum() == 9  # 3x3


def test_empty_after_mask_returns_zero_by_three():
    pts = _grid_points(8, 8)
    mask = np.zeros((8, 8), dtype=bool)
    out = extract_masked_points(pts, mask, erode_pixels=0)
    assert out.shape == (0, 3)
    assert out.dtype == np.float32
