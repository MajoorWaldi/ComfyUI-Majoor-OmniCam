"""Extract clean masked 3D object points from a dense point map.

No OpenCV / scipy dependency: erosion is a repeated 3x3 boolean neighbourhood
reduction, which is exact and fast enough for the 0-3 pixel range callers use.
"""

from __future__ import annotations

import numpy as np

try:  # torch is a soft dependency in pure-reconstruction test envs
    import torch

    _HAS_TORCH = True
except ImportError:  # pragma: no cover - torch always present in CI recon job
    _HAS_TORCH = False


def _to_numpy(value: object) -> np.ndarray:
    if _HAS_TORCH and torch.is_tensor(value):
        return value.detach().cpu().numpy()
    return np.asarray(value)


def erode_binary_mask_numpy(mask: np.ndarray, pixels: int) -> np.ndarray:
    """Erode a boolean mask by ``pixels`` using repeated 3x3 AND reductions.

    A pixel survives one iteration only if its 4-and-8 neighbours (clamped at
    the image border) are all set. Border pixels are treated as background.
    """
    out = np.asarray(mask, dtype=bool)
    for _ in range(max(0, int(pixels))):
        padded = np.pad(out, 1, mode="constant", constant_values=False)
        eroded = (
            padded[1:-1, 1:-1]
            & padded[:-2, 1:-1]
            & padded[2:, 1:-1]
            & padded[1:-1, :-2]
            & padded[1:-1, 2:]
            & padded[:-2, :-2]
            & padded[:-2, 2:]
            & padded[2:, :-2]
            & padded[2:, 2:]
        )
        out = eroded
    return out


def extract_masked_points(
    points: object,
    mask: object,
    *,
    max_points: int = 20_000,
    erode_pixels: int = 1,
    seed: int = 0,
) -> np.ndarray:
    """Return an ``(N, 3) float32`` array of clean object points.

    - drops non-finite rows (inf/nan from unprojection at depth discontinuities)
    - erodes the mask to shed silhouette-edge pixels that belong to the
      background surface behind the object
    - removes a radial-distance tail (>97.5th percentile from the median) so a
      few stragglers cannot inflate the fitted box
    - deterministically subsamples to ``max_points`` with a seeded RNG
    """
    pts = _to_numpy(points)
    m = _to_numpy(mask)
    m = np.asarray(m > 0.5)

    if pts.ndim != 3 or pts.shape[-1] != 3:
        raise ValueError(f"points must be (H, W, 3); got shape {pts.shape}")
    if m.shape != pts.shape[:2]:
        raise ValueError(f"mask shape {m.shape} does not match point map {pts.shape[:2]}")

    if erode_pixels > 0:
        m = erode_binary_mask_numpy(m, erode_pixels)

    selected = pts[m]
    selected = selected[np.isfinite(selected).all(axis=1)]
    if len(selected) == 0:
        return np.empty((0, 3), dtype=np.float32)

    center = np.median(selected, axis=0)
    radius = np.linalg.norm(selected - center, axis=1)
    cutoff = np.percentile(radius, 97.5)
    selected = selected[radius <= cutoff]
    if len(selected) == 0:
        return np.empty((0, 3), dtype=np.float32)

    if len(selected) > max_points:
        rng = np.random.default_rng(seed)
        idx = rng.choice(len(selected), max_points, replace=False)
        selected = selected[idx]

    return selected.astype(np.float32, copy=False)
