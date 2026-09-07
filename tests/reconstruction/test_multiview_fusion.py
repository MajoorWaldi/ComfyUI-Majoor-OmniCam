"""Tests for cross-view semantic fusion (plan Task 27)."""

from __future__ import annotations

import numpy as np

from omnicam.reconstruction.blockout.fusion import FusionCandidate, fuse_candidates


def _blob(center, size=(0.6, 1.0, 0.6), n=500, seed=0):
    rng = np.random.default_rng(seed)
    c = np.asarray(center, dtype=float)
    s = np.asarray(size, dtype=float)
    return c + rng.uniform(-s / 2, s / 2, (n, 3))


def _cand(iid, label, center, view, score=0.8, size=(0.6, 1.0, 0.6)):
    return FusionCandidate(
        instance_id=iid,
        label=label,
        points=_blob(center, size, seed=hash(iid) % 1000),
        center=np.asarray(center, dtype=float),
        size=np.asarray(size, dtype=float),
        yaw=0.0,
        score=score,
        view_index=view,
    )


def test_same_chair_from_two_views_fuses_to_one():
    cands = [
        _cand("v0_chair_0", "chair", (0.0, 0.5, -3.0), 0, score=0.7),
        _cand("v1_chair_0", "chair", (0.1, 0.5, -3.05), 1, score=0.85),
    ]
    fused = fuse_candidates(cands)
    assert len(fused) == 1
    assert fused[0].label == "chair"
    assert fused[0].score == 0.85  # max of the cluster
    assert sorted(fused[0].source_views) == [0, 1]
    assert len(fused[0].source_instance_ids) == 2


def test_two_physical_chairs_stay_two_objects():
    cands = [
        _cand("v0_chair_0", "chair", (-1.5, 0.5, -3.0), 0),
        _cand("v0_chair_1", "chair", (1.8, 0.5, -3.0), 0),
        _cand("v1_chair_0", "chair", (1.9, 0.5, -3.1), 1),  # same as chair_1
    ]
    fused = fuse_candidates(cands)
    assert len(fused) == 2
    view_counts = sorted(len(f.source_instance_ids) for f in fused)
    assert view_counts == [1, 2]


def test_different_labels_never_fuse_even_when_coincident():
    cands = [
        _cand("a", "chair", (0.0, 0.5, -3.0), 0),
        _cand("b", "table", (0.0, 0.5, -3.0), 0),
    ]
    fused = fuse_candidates(cands)
    assert {f.label for f in fused} == {"chair", "table"}


def test_matching_is_deterministic():
    cands = [
        _cand("v0_c0", "chair", (0.0, 0.5, -3.0), 0, score=0.6),
        _cand("v1_c0", "chair", (0.05, 0.5, -3.0), 1, score=0.9),
        _cand("v2_c0", "chair", (-0.05, 0.5, -3.0), 2, score=0.7),
    ]
    a = fuse_candidates(list(cands))
    b = fuse_candidates(list(reversed(cands)))
    assert len(a) == len(b) == 1
    assert a[0].source_instance_ids == b[0].source_instance_ids
