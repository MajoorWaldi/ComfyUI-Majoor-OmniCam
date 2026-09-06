"""Deterministic ground and wall plane detection via RANSAC."""

from __future__ import annotations

import hashlib
from typing import Any

import numpy as np
import torch

from .confidence import calculate_plane_confidence
from .coordinates import opencv_points_to_omnicam
from .settings import ReconstructionSettings
from .types import GeometryEvidence, ReconstructedPlane

MAX_SAMPLE_POINTS = 50_000
RANSAC_ITERATIONS = 160

#: Fallback inlier distance, used only when the cloud has no measurable extent.
DISTANCE_THRESHOLD = 0.03

#: Inlier distance as a fraction of the cloud's own 5-95 percentile diagonal.
#: Providers like MoGe report relative scale (GeometryEvidence.scale_mode), so a
#: fixed metric threshold means something different for every image; tying it to
#: the cloud keeps the fit equivalent whatever the units turn out to be. The
#: ratio is set so a roughly room-sized cloud lands back on DISTANCE_THRESHOLD.
DISTANCE_THRESHOLD_RATIO = 0.005
MIN_GROUND_INLIER_RATIO = 0.08
UP_DOT_THRESHOLD = 0.82
MIN_PLANE_CONFIDENCE = 0.45
MAX_WALLS = 4


def _to_numpy_points(points: Any) -> np.ndarray:
    if isinstance(points, torch.Tensor):
        return points.detach().cpu().numpy()
    return np.asarray(points)


def _cloud_extent(points: np.ndarray) -> float:
    """Robust diagonal of the point cloud, from per-axis 5-95 percentiles."""
    if points.size == 0:
        return 0.0
    low = np.percentile(points, 5, axis=0)
    high = np.percentile(points, 95, axis=0)
    span = np.asarray(high, dtype=np.float64) - np.asarray(low, dtype=np.float64)
    extent = float(np.linalg.norm(span))
    return extent if np.isfinite(extent) else 0.0


def _inlier_distance(points: np.ndarray) -> float:
    """Scale-relative inlier distance for ``points``."""
    extent = _cloud_extent(points)
    if extent <= 0.0:
        return DISTANCE_THRESHOLD
    return extent * DISTANCE_THRESHOLD_RATIO


def _seed_to_int(seed: int | str) -> int:
    if isinstance(seed, int):
        return seed
    digest = hashlib.sha256(str(seed).encode("utf-8")).hexdigest()[:8]
    return int(digest, 16)


def scale_planes(planes: list[ReconstructedPlane], scale: float) -> list[ReconstructedPlane]:
    """Return ``planes`` expressed in a scene scaled by ``scale``.

    Plane fitting runs in the provider's own units so its distance thresholds
    stay meaningful; the mesh is scaled in :func:`build_proxy_mesh`, so the
    planes have to travel the same distance to stay aligned with it.
    """
    factor = float(scale)
    if factor == 1.0:
        return planes
    return [
        ReconstructedPlane(
            plane_type=p.plane_type,
            center=(p.center[0] * factor, p.center[1] * factor, p.center[2] * factor),
            normal=p.normal,
            size=(p.size[0] * factor, p.size[1] * factor),
            confidence=p.confidence,
            inlier_ratio=p.inlier_ratio,
        )
        for p in planes
    ]


def detect_planes(
    evidence: GeometryEvidence,
    settings: ReconstructionSettings,
    *,
    seed: int | str = 0,
    batch_index: int = 0,
) -> list[ReconstructedPlane]:
    """Detect dominant ground plane and optional vertical walls in glTF coordinate space."""
    if not settings.detect_ground and not settings.detect_walls:
        return []

    if evidence.points is None:
        return []

    pts_tensor = evidence.points
    if isinstance(pts_tensor, torch.Tensor) and pts_tensor.ndim == 4:
        pts_tensor = pts_tensor[batch_index]

    # Convert to OmniCam / glTF coordinate space if needed
    if evidence.coordinate_system == "opencv_x_right_y_down_z_forward":
        pts_tensor = opencv_points_to_omnicam(pts_tensor)

    raw_pts = _to_numpy_points(pts_tensor)
    is_grid = raw_pts.ndim == 3
    h, w = (raw_pts.shape[0], raw_pts.shape[1]) if is_grid else (0, 0)
    flat_pts = raw_pts.reshape(-1, 3)

    finite_mask = np.isfinite(flat_pts).all(axis=-1)
    if not np.any(finite_mask):
        return []

    rng = np.random.default_rng(_seed_to_int(seed))
    detected: list[ReconstructedPlane] = []

    ground_inliers_mask: np.ndarray | None = None

    # --- Ground Plane Detection ---
    if settings.detect_ground:
        if is_grid and h > 2:
            lower_cutoff = int(h * 0.45)
            grid_mask = np.zeros((h, w), dtype=bool)
            grid_mask[lower_cutoff:, :] = True
            candidate_indices = np.where(finite_mask & grid_mask.reshape(-1))[0]
            if len(candidate_indices) < 50:
                candidate_indices = np.where(finite_mask)[0]
        else:
            candidate_indices = np.where(finite_mask)[0]

        if len(candidate_indices) >= 3:
            if len(candidate_indices) > MAX_SAMPLE_POINTS:
                candidate_indices = rng.choice(candidate_indices, size=MAX_SAMPLE_POINTS, replace=False)

            candidates = flat_pts[candidate_indices]
            n_candidates = len(candidates)
            distance_threshold = _inlier_distance(candidates)

            best_inliers: np.ndarray | None = None
            best_normal: np.ndarray | None = None
            best_d: float = 0.0

            for _ in range(RANSAC_ITERATIONS):
                sample_idx = rng.choice(n_candidates, size=3, replace=False)
                p1, p2, p3 = candidates[sample_idx]

                v1 = p2 - p1
                v2 = p3 - p1
                n = np.cross(v1, v2)
                norm = np.linalg.norm(n)
                if norm < 1e-6:
                    continue
                n /= norm

                # Normal must align with UP [0, 1, 0]
                if n[1] < 0:
                    n = -n
                if n[1] < UP_DOT_THRESHOLD:
                    continue

                d = -float(np.dot(n, p1))
                dist = np.abs(np.dot(candidates, n) + d)
                inliers = dist < distance_threshold
                count = int(np.sum(inliers))

                if best_inliers is None or count > int(np.sum(best_inliers)):
                    best_inliers = inliers
                    best_normal = n
                    best_d = d

            if best_inliers is not None and best_normal is not None:
                inlier_count = int(np.sum(best_inliers))
                inlier_ratio = inlier_count / float(n_candidates)

                if inlier_ratio >= MIN_GROUND_INLIER_RATIO:
                    inlier_pts = candidates[best_inliers]
                    ground_inliers_mask = candidate_indices[best_inliers]

                    p5_x = float(np.percentile(inlier_pts[:, 0], 5))
                    p95_x = float(np.percentile(inlier_pts[:, 0], 95))
                    size_x = max(0.1, p95_x - p5_x)

                    p5_z = float(np.percentile(inlier_pts[:, 2], 5))
                    p95_z = float(np.percentile(inlier_pts[:, 2], 95))
                    size_z = max(0.1, p95_z - p5_z)

                    center_x = float(np.mean(inlier_pts[:, 0]))
                    center_z = float(np.mean(inlier_pts[:, 2]))
                    center_y = float((-best_d - best_normal[0] * center_x - best_normal[2] * center_z) / best_normal[1])
                    center = (center_x, center_y, center_z)

                    orientation_score = min(1.0, max(0.0, float(best_normal[1])))
                    span_x = float(np.percentile(candidates[:, 0], 95) - np.percentile(candidates[:, 0], 5))
                    span_z = float(np.percentile(candidates[:, 2], 95) - np.percentile(candidates[:, 2], 5))
                    footprint = max(span_x, 1e-6) * max(span_z, 1e-6)
                    coverage_score = min(1.0, (size_x * size_z) / footprint)

                    conf = calculate_plane_confidence(
                        inlier_ratio=inlier_ratio,
                        orientation_score=orientation_score,
                        coverage_score=coverage_score,
                    )

                    if conf >= MIN_PLANE_CONFIDENCE:
                        detected.append(
                            ReconstructedPlane(
                                plane_type="ground",
                                center=center,
                                normal=(float(best_normal[0]), float(best_normal[1]), float(best_normal[2])),
                                size=(size_x, size_z),
                                confidence=conf,
                                inlier_ratio=inlier_ratio,
                            )
                        )

    # --- Optional Wall Planes Detection ---
    if settings.detect_walls:
        wall_mask = finite_mask.copy()
        if ground_inliers_mask is not None:
            wall_mask[ground_inliers_mask] = False

        wall_indices = np.where(wall_mask)[0]
        if len(wall_indices) > MAX_SAMPLE_POINTS:
            wall_indices = rng.choice(wall_indices, size=MAX_SAMPLE_POINTS, replace=False)

        candidates = flat_pts[wall_indices]
        remaining_candidates = candidates
        wall_distance_threshold = _inlier_distance(candidates)

        walls_found = 0
        while walls_found < MAX_WALLS and len(remaining_candidates) >= 50:
            best_inliers = None
            best_normal = None
            best_d = 0.0

            n_rem = len(remaining_candidates)
            for _ in range(RANSAC_ITERATIONS // 2):
                sample_idx = rng.choice(n_rem, size=3, replace=False)
                p1, p2, p3 = remaining_candidates[sample_idx]
                n = np.cross(p2 - p1, p3 - p1)
                norm = np.linalg.norm(n)
                if norm < 1e-6:
                    continue
                n /= norm

                # Wall normal must be perpendicular to UP [0, 1, 0]
                if abs(n[1]) > 0.25:
                    continue

                d = -float(np.dot(n, p1))
                dist = np.abs(np.dot(remaining_candidates, n) + d)
                inliers = dist < wall_distance_threshold
                count = int(np.sum(inliers))

                if best_inliers is None or count > int(np.sum(best_inliers)):
                    best_inliers = inliers
                    best_normal = n
                    best_d = d

            if best_inliers is None or best_normal is None:
                break

            inlier_count = int(np.sum(best_inliers))
            inlier_ratio = inlier_count / float(n_rem)
            if inlier_ratio < 0.10:
                break

            inlier_pts = remaining_candidates[best_inliers]
            center = (
                float(np.mean(inlier_pts[:, 0])),
                float(np.mean(inlier_pts[:, 1])),
                float(np.mean(inlier_pts[:, 2])),
            )
            # Extents in X and Y
            size_w = max(0.1, float(np.percentile(inlier_pts[:, 0], 95) - np.percentile(inlier_pts[:, 0], 5)))
            size_h = max(0.1, float(np.percentile(inlier_pts[:, 1], 95) - np.percentile(inlier_pts[:, 1], 5)))

            detected.append(
                ReconstructedPlane(
                    plane_type="wall",
                    center=center,
                    normal=(float(best_normal[0]), float(best_normal[1]), float(best_normal[2])),
                    size=(size_w, size_h),
                    confidence=min(1.0, inlier_ratio * 1.5),
                    inlier_ratio=inlier_ratio,
                )
            )
            walls_found += 1
            remaining_candidates = remaining_candidates[~best_inliers]

    return detected
