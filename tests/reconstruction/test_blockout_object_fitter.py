"""Tests for the primitive resolver (Task 7) and deterministic fitter (Task 8)."""

from __future__ import annotations

import numpy as np
import pytest

from omnicam.reconstruction.blockout.object_fitter import fit_blockout_object
from omnicam.reconstruction.blockout.primitive_resolver import rule_for_label
from omnicam.reconstruction.blockout.types import InstanceEvidence
from omnicam.reconstruction.types import ReconstructedPlane


# --------------------------------------------------------------------------- #
# Task 7 -- primitive resolver
# --------------------------------------------------------------------------- #
def test_rule_for_known_labels():
    assert rule_for_label("chair").primitive == "cube"
    assert rule_for_label("Television").primitive == "card"
    assert rule_for_label("person").primitive == "human"
    assert rule_for_label("window").snap_to_ground is False
    assert rule_for_label("bed").min_depth_factor == pytest.approx(0.45)


def test_rule_for_unknown_label_is_conservative_cube():
    rule = rule_for_label("teapot-9000")
    assert rule.primitive == "cube"
    assert rule.min_depth_factor == pytest.approx(0.20)
    assert rule.snap_to_ground is True


def test_rule_tolerates_compound_and_plural_labels():
    assert rule_for_label("dining table").primitive == "cube"
    assert rule_for_label("office chairs").min_depth_factor == rule_for_label("chair").min_depth_factor


# --------------------------------------------------------------------------- #
# Task 8 -- deterministic object fitter
# --------------------------------------------------------------------------- #
def _point_map_with_box(h=120, w=160, *, box, z0=-4.0):
    """Build an (H, W, 3) map whose masked region is a filled box in world space."""
    rng = np.random.default_rng(0)
    pts = np.full((h, w, 3), np.nan, np.float32)
    mask = np.zeros((h, w), bool)
    y0, y1, x0, x1 = 20, 100, 40, 130
    ys, _xs = np.mgrid[y0:y1, x0:x1]
    mask[y0:y1, x0:x1] = True
    n = ys.size
    pts[y0:y1, x0:x1, 0] = rng.uniform(-box[0] / 2, box[0] / 2, n).reshape(ys.shape)
    pts[y0:y1, x0:x1, 1] = rng.uniform(0.0, box[1], n).reshape(ys.shape)
    pts[y0:y1, x0:x1, 2] = z0 + rng.uniform(-box[2] / 2, box[2] / 2, n).reshape(ys.shape)
    return pts, mask


def _instance(mask, label="chair", score=0.8, iid="view0_chair_0"):
    return InstanceEvidence(
        instance_id=iid, label=label, score=score, mask=mask, bbox_xyxy=(40, 20, 130, 100)
    )


def test_fitter_returns_none_below_min_samples():
    pts = np.full((10, 10, 3), 0.0, np.float32)
    mask = np.zeros((10, 10), bool)
    mask[0, 0:3] = True  # 3 samples
    assert fit_blockout_object(_instance(mask), pts, ground=None, scene_scale=1.0, seed="x") is None


def test_fitter_emits_closed_primitive_with_semantic_class():
    pts, mask = _point_map_with_box(box=(0.6, 1.0, 0.6))
    obj = fit_blockout_object(_instance(mask), pts, ground=None, scene_scale=1.0, seed="view0_chair_0")
    assert obj is not None
    assert obj.primitive == "cube"
    assert obj.semantic_class == "chair"
    assert min(obj.size) >= 0.01
    assert obj.size[1] == pytest.approx(0.9, abs=0.2)
    assert obj.object_id == "view0_chair_0"


def test_fitter_floors_flat_object_depth_via_semantic_rule():
    # A near-planar TV observation: tiny real depth, card rule floors it.
    pts, mask = _point_map_with_box(box=(1.2, 0.7, 0.02))
    obj = fit_blockout_object(_instance(mask, label="television"), pts, ground=None, scene_scale=1.0, seed="tv")
    assert obj is not None
    assert obj.primitive == "card"
    footprint = max(obj.size[0], obj.size[2])
    assert obj.size[2] >= 0.04 * footprint - 1e-6
    # Depth was inflated, so depth confidence is pulled below the mask score.
    assert obj.axis_confidence.depth < obj.axis_confidence.width


def test_fitter_confidence_formula_is_pinned():
    pts, mask = _point_map_with_box(box=(2.0, 1.0, 0.6))
    obj = fit_blockout_object(_instance(mask, score=0.8), pts, ground=None, scene_scale=1.0, seed="s")
    assert obj is not None
    ax = obj.axis_confidence
    assert ax.width == pytest.approx(min(1.0, 0.8 * 1.05))
    assert ax.height == pytest.approx(min(1.0, 0.8 * 1.05))
    assert obj.confidence == pytest.approx(0.25 * (ax.width + ax.height + ax.depth + ax.yaw), abs=1e-6)


def test_fitter_is_deterministic():
    pts, mask = _point_map_with_box(box=(0.8, 1.1, 0.7))
    a = fit_blockout_object(_instance(mask), pts, ground=None, scene_scale=1.0, seed="k")
    b = fit_blockout_object(_instance(mask), pts, ground=None, scene_scale=1.0, seed="k")
    assert a is not None and b is not None
    assert a.to_dict() == b.to_dict()


def test_fitter_snaps_to_confident_ground_only():
    pts, mask = _point_map_with_box(box=(0.6, 1.0, 0.6))
    strong = ReconstructedPlane(
        plane_type="ground", center=(0.0, -1.5, -4.0), normal=(0.0, 1.0, 0.0), size=(8.0, 8.0), confidence=0.9
    )
    weak = ReconstructedPlane(
        plane_type="ground", center=(0.0, -1.5, -4.0), normal=(0.0, 1.0, 0.0), size=(8.0, 8.0), confidence=0.3
    )
    snapped = fit_blockout_object(_instance(mask), pts, ground=strong, scene_scale=1.0, seed="g")
    not_snapped = fit_blockout_object(_instance(mask), pts, ground=weak, scene_scale=1.0, seed="g")
    assert snapped is not None and not_snapped is not None
    assert snapped.position[1] == pytest.approx(-1.5 + 0.5 * snapped.size[1], abs=1e-6)
    assert not_snapped.position[1] != pytest.approx(snapped.position[1])


def test_fitter_applies_scene_scale():
    pts, mask = _point_map_with_box(box=(0.6, 1.0, 0.6))
    one = fit_blockout_object(_instance(mask), pts, ground=None, scene_scale=1.0, seed="q")
    two = fit_blockout_object(_instance(mask), pts, ground=None, scene_scale=2.0, seed="q")
    assert one is not None and two is not None
    assert two.size[1] == pytest.approx(2.0 * one.size[1], rel=1e-5)


def test_fitter_sanitizes_object_id():
    pts, mask = _point_map_with_box(box=(0.6, 1.0, 0.6))
    obj = fit_blockout_object(
        _instance(mask, iid="../../etc/passwd  weird!!" + "x" * 200), pts, ground=None, scene_scale=1.0, seed="z"
    )
    assert obj is not None
    assert len(obj.object_id) <= 80
    assert "/" not in obj.object_id and " " not in obj.object_id
