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


# --------------------------------------------------------------------------- #
# Audit F17 -- scale from the reliable axis, weak axes not crushed, yaw kept
# --------------------------------------------------------------------------- #
def test_scale_resolved_from_reliable_height_not_the_weak_depth():
    # Height is trusted (0.9); width AND depth are weak. Completion box is a
    # 2x-larger cube: reliable height 1.0 measured vs 2.0 completed -> scale 0.5,
    # so both weak axes should land near 1.0 (0.5 * 2.0), never collapse.
    before = _blockout(depth_conf=0.2, width_conf=0.2, height_conf=0.9, size=(0.8, 1.0, 0.1))
    completed = _completed_box(width=2.0, height=2.0, depth=2.0)
    after = merge_completion_into_blockout(before, np.empty((0, 3)), completed)

    assert after.size[1] == pytest.approx(1.0, abs=1e-6)     # trusted height kept
    assert after.size[0] == pytest.approx(1.0, rel=0.15)     # weak width rescaled, not crushed
    assert after.size[2] == pytest.approx(1.0, rel=0.15)     # weak depth rescaled
    assert after.rotation == before.rotation                 # world yaw untouched


def test_measured_points_floor_prevents_shrinking_below_observed_extent():
    # A weak-depth proxy whose measured points already span 0.7 in depth: the
    # completion (thin, 0.2) must not shrink it below what was observed.
    before = _blockout(depth_conf=0.25, size=(0.8, 1.0, 0.7))
    rng = np.random.default_rng(1)
    measured = np.stack([
        rng.uniform(-0.4, 0.4, 400), rng.uniform(-0.5, 0.5, 400), rng.uniform(-0.35, 0.35, 400),
    ], axis=-1)
    after = merge_completion_into_blockout(before, measured, _completed_box(depth=0.2, width=0.8, height=1.0))
    assert after.size[2] >= 0.65  # floored by the measured ~0.7 span


# --------------------------------------------------------------------------- #
# Audit F15 -- completion outcome taxonomy (disabled / unsupported / no_targets
#              / partial / applied), surfaced to the caller
# --------------------------------------------------------------------------- #
_SENTINEL_IMAGE = np.zeros((4, 4, 3), np.float32)


def _apply(objects, *, provider, policy="all_bounded", ids=None, image=_SENTINEL_IMAGE, instances=None):
    from omnicam.reconstruction.completion.apply import apply_completion_policy

    class _Ev:
        def __init__(self, img):
            self.image = img
            self.points = None
            self.warnings = []

    return apply_completion_policy(
        objects,
        evidence=_Ev(image),
        instances=instances if instances is not None else [],
        settings=ReconstructionSettings(mode="blockout", provider="fake", completion_policy=policy,
                                        completion_object_ids=tuple(ids or ())),
        provider=provider,
        completion_object_ids=ids,
    )


class _OkProvider:
    provider_id = "sam3d_objects"
    adapter_version = "t"

    def capabilities(self):
        class C:
            available = True
            reason = ""
        return C()

    def complete(self, image, mask, *, seed, cancel=None):
        return FakeCompletionProvider(hidden_depth=0.7).complete(image, mask, seed=seed)


class _UnavailableProvider(_OkProvider):
    def capabilities(self):
        class C:
            available = False
            reason = "needs 32 GB VRAM"
        return C()


def test_outcome_disabled_when_policy_off():
    _out, outcome = _apply(_objs(), provider=_OkProvider(), policy="off")
    assert outcome.state == "disabled" and outcome.warning is None


def test_outcome_unsupported_when_provider_unavailable():
    _out, outcome = _apply(_objs(), provider=_UnavailableProvider())
    assert outcome.state == "unsupported"
    assert "32 GB" in outcome.reason
    assert outcome.warning and "unavailable" in outcome.warning.lower()


def test_outcome_no_targets_for_selected_without_ids():
    _out, outcome = _apply(_objs(), provider=_OkProvider(), policy="selected", ids=[])
    assert outcome.state == "no_targets"
    assert "no completion_object_ids" in outcome.reason


def test_outcome_applied_counts_and_selected_respects_ids():
    objs = _objs()
    instances = [type("I", (), {"instance_id": o.source_instance_ids[0] if o.source_instance_ids else o.object_id,
                                "mask": np.ones((4, 4), bool)})() for o in objs]
    # give each object a matching instance id
    for o, i in zip(objs, instances):
        o.source_instance_ids = [i.instance_id]
    out, outcome = _apply(objs, provider=_OkProvider(), policy="selected", ids=["a", "b"], instances=instances)
    assert outcome.state == "applied"
    assert outcome.requested == 2 and outcome.applied == 2
    # object "c" (not selected) untouched
    assert next(o for o in out if o.object_id == "c").size == next(o for o in _objs() if o.object_id == "c").size
