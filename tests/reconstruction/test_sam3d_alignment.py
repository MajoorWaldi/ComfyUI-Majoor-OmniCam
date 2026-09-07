"""Completion contract + bounded alignment + policy (plan Tasks 29, 32, 33)."""

from __future__ import annotations

import numpy as np
import pytest

from omnicam.reconstruction.blockout.types import AxisConfidence, BlockoutObject
from omnicam.reconstruction.completion.alignment import (
    COMPLETION_CONFIDENCE_CAP,
    merge_completion_into_blockout,
)
from omnicam.reconstruction.completion.apply import select_completion_objects
from omnicam.reconstruction.completion.fake import FakeCompletionProvider
from omnicam.reconstruction.settings import ReconstructionSettings


def _blockout(*, depth_conf, width_conf=0.9, height_conf=0.9, yaw_conf=0.9, size=(0.8, 1.0, 0.1), oid="o"):
    return BlockoutObject(
        object_id=oid,
        label="tv",
        semantic_class="tv",
        primitive="card",
        position=(0.0, 0.5, -3.0),
        rotation=(0.0, 10.0, 0.0),
        size=size,
        confidence=0.6,
        axis_confidence=AxisConfidence(width_conf, height_conf, depth_conf, yaw_conf),
    )


def _completed_box(depth=0.9, width=0.8, height=1.0, n=1500):
    rng = np.random.default_rng(0)
    return np.stack(
        [
            rng.uniform(-width / 2, width / 2, n),
            rng.uniform(-height / 2, height / 2, n),
            rng.uniform(-depth / 2, depth / 2, n),
        ],
        axis=-1,
    )


# --------------------------------------------------------------------------- #
# Task 29 -- fake provider
# --------------------------------------------------------------------------- #
def test_fake_completion_provider_returns_known_hidden_depth():
    out = FakeCompletionProvider(hidden_depth=0.9).complete(None, None, seed=3)
    assert out.provider_id == "fake"
    span_z = float(np.ptp(out.points_local[:, 2]))
    assert span_z == pytest.approx(0.9, abs=0.05)


# --------------------------------------------------------------------------- #
# Task 32 -- bounded alignment
# --------------------------------------------------------------------------- #
def test_completion_only_replaces_low_confidence_depth():
    before = _blockout(depth_conf=0.30, width_conf=0.90)
    after = merge_completion_into_blockout(before, np.empty((0, 3)), _completed_box(depth=0.9, width=0.8))
    assert after.size[0] == pytest.approx(before.size[0])  # width kept (conf 0.90)
    assert after.size[2] > before.size[2]  # depth grew from the completion
    assert after.axis_confidence.depth <= COMPLETION_CONFIDENCE_CAP
    assert after.completion_provider == "sam3d_objects"
    assert after.position == before.position  # measured centre kept


def test_completion_leaves_confident_depth_untouched():
    before = _blockout(depth_conf=0.85, size=(0.8, 1.0, 0.6))
    after = merge_completion_into_blockout(before, np.empty((0, 3)), _completed_box(depth=2.0, width=0.8))
    assert after.size[2] == pytest.approx(before.size[2])
    assert after.axis_confidence.depth == pytest.approx(0.85)


def test_completion_confidence_never_exceeds_cap():
    before = _blockout(depth_conf=0.5, yaw_conf=0.2)
    after = merge_completion_into_blockout(before, np.empty((0, 3)), _completed_box())
    assert after.axis_confidence.depth <= COMPLETION_CONFIDENCE_CAP
    assert after.axis_confidence.yaw <= COMPLETION_CONFIDENCE_CAP


# --------------------------------------------------------------------------- #
# Task 33 -- bounded policy selection
# --------------------------------------------------------------------------- #
def _objs():
    return [
        _blockout(depth_conf=0.20, oid="a"),
        _blockout(depth_conf=0.50, oid="b"),
        _blockout(depth_conf=0.90, oid="c"),
    ]


def test_policy_off_selects_nothing():
    s = ReconstructionSettings(mode="blockout", completion_policy="off")
    assert select_completion_objects(_objs(), s) == []


def test_policy_low_depth_confidence_picks_weakest_first_bounded():
    s = ReconstructionSettings(mode="blockout", completion_policy="low_depth_confidence", max_completion_objects=1)
    picked = select_completion_objects(_objs(), s)
    assert [o.object_id for o in picked] == ["a"]


def test_policy_all_bounded_respects_max():
    s = ReconstructionSettings(mode="blockout", completion_policy="all_bounded", max_completion_objects=2)
    picked = select_completion_objects(_objs(), s)
    assert [o.object_id for o in picked] == ["a", "b"]  # sorted by depth conf


def test_policy_selected_requires_explicit_validated_ids():
    s = ReconstructionSettings(mode="blockout", completion_policy="selected", max_completion_objects=4)
    assert select_completion_objects(_objs(), s) == []  # no ids -> nothing
    picked = select_completion_objects(_objs(), s, explicit_ids=["b", "ghost"])
    assert [o.object_id for o in picked] == ["b"]
