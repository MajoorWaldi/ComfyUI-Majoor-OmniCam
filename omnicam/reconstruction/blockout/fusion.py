"""Fuse same-semantic object observations across multiple views.

Deterministic greedy matching: sort candidates by descending score then view
index, grow clusters whose members share a label and either sit close
(centre distance <= 1.25 x object scale) or overlap measurably (3D AABB
IoU >= 0.10). Two physically distinct chairs stay two clusters.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from .obb import RobustObb, fit_ground_relative_obb

CENTER_DISTANCE_GATE = 1.25
IOU_GATE = 0.10
MAX_CLUSTER_POINTS = 40_000


@dataclass(slots=True)
class FusionCandidate:
    instance_id: str
    label: str
    points: np.ndarray  # (N, 3) world-space, OmniCam coords
    center: np.ndarray  # (3,)
    size: np.ndarray  # (3,)
    yaw: float
    score: float
    view_index: int


@dataclass(slots=True)
class FusedInstance:
    label: str
    points: np.ndarray
    obb: RobustObb
    score: float
    source_instance_ids: list[str] = field(default_factory=list)
    source_views: list[int] = field(default_factory=list)


def _aabb_iou(c_a, s_a, c_b, s_b) -> float:
    lo_a, hi_a = c_a - s_a / 2.0, c_a + s_a / 2.0
    lo_b, hi_b = c_b - s_b / 2.0, c_b + s_b / 2.0
    lo = np.maximum(lo_a, lo_b)
    hi = np.minimum(hi_a, hi_b)
    inter_dims = np.clip(hi - lo, 0.0, None)
    inter = float(np.prod(inter_dims))
    if inter <= 0.0:
        return 0.0
    vol_a = float(np.prod(np.clip(s_a, 1e-9, None)))
    vol_b = float(np.prod(np.clip(s_b, 1e-9, None)))
    union = vol_a + vol_b - inter
    return inter / union if union > 0 else 0.0


def _associates(a: FusionCandidate, b: FusionCandidate) -> bool:
    if a.label != b.label:
        return False
    scale = max(float(np.linalg.norm(a.size)), float(np.linalg.norm(b.size)), 1e-3)
    center_distance = float(np.linalg.norm(a.center - b.center)) / scale
    if center_distance <= CENTER_DISTANCE_GATE:
        return True
    return _aabb_iou(a.center, a.size, b.center, b.size) >= IOU_GATE


def fuse_candidates(candidates: list[FusionCandidate]) -> list[FusedInstance]:
    """Greedy deterministic clustering + one refit OBB per cluster."""
    ordered = sorted(candidates, key=lambda c: (-c.score, c.view_index, c.instance_id))
    clusters: list[list[FusionCandidate]] = []
    for cand in ordered:
        placed = False
        for cluster in clusters:
            # Two detections from the *same* view are, by construction, distinct
            # instances -- never fuse them however close their proxy boxes fall.
            if any(member.view_index == cand.view_index for member in cluster):
                continue
            if any(_associates(cand, member) for member in cluster):
                cluster.append(cand)
                placed = True
                break
        if not placed:
            clusters.append([cand])

    fused: list[FusedInstance] = []
    for cluster in clusters:
        merged = np.concatenate([c.points for c in cluster], axis=0)
        if len(merged) > MAX_CLUSTER_POINTS:
            rng = np.random.default_rng(0)
            merged = merged[rng.choice(len(merged), MAX_CLUSTER_POINTS, replace=False)]
        obb = fit_ground_relative_obb(merged) if len(merged) >= 3 else None
        if obb is None:
            continue
        fused.append(
            FusedInstance(
                label=cluster[0].label,
                points=merged,
                obb=obb,
                score=max(c.score for c in cluster),
                source_instance_ids=[c.instance_id for c in cluster],
                source_views=sorted({c.view_index for c in cluster}),
            )
        )
    return fused
