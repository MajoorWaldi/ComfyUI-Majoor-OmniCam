from __future__ import annotations

from omnicam.guides.conflicts import detect_role_conflicts
from omnicam.guides.model import ReferenceSpec


def _spec(id_, roles, *, ignore=(), temporal_range=None) -> ReferenceSpec:
    return ReferenceSpec(id=id_, media_type="video", slot_hint=1, roles=roles, ignore=ignore, temporal_range=temporal_range)


def test_no_conflict_with_a_single_reference():
    assert detect_role_conflicts((_spec("a", ("camera_motion",)),)) == []


def test_no_conflict_when_roles_do_not_overlap():
    a = _spec("a", ("camera_motion",))
    b = _spec("b", ("identity",))
    assert detect_role_conflicts((a, b)) == []


def test_conflict_when_two_full_shot_references_share_a_role():
    a = _spec("a", ("camera_motion", "blocking"))
    b = _spec("b", ("camera_motion",))
    checks = detect_role_conflicts((a, b))
    assert len(checks) == 1
    check = checks[0]
    assert check.id == "role_conflict"
    assert check.state == "WARNING"
    assert "camera_motion" in check.message
    assert "'a'" in check.message and "'b'" in check.message


def test_no_conflict_when_temporal_ranges_do_not_overlap():
    a = _spec("a", ("subject_action",), temporal_range=(0.0, 2.0))
    b = _spec("b", ("subject_action",), temporal_range=(2.0, 4.0))
    assert detect_role_conflicts((a, b)) == []


def test_conflict_when_temporal_ranges_overlap():
    a = _spec("a", ("subject_action",), temporal_range=(0.0, 2.5))
    b = _spec("b", ("subject_action",), temporal_range=(2.0, 4.0))
    checks = detect_role_conflicts((a, b))
    assert len(checks) == 1
    assert checks[0].state == "WARNING"


def test_full_shot_range_overlaps_a_ranged_reference():
    a = _spec("a", ("blocking",), temporal_range=None)
    b = _spec("b", ("blocking",), temporal_range=(1.0, 2.0))
    checks = detect_role_conflicts((a, b))
    assert len(checks) == 1


def test_ignore_retracts_a_role_from_the_conflict():
    a = _spec("a", ("camera_motion", "blocking"), ignore=("blocking",))
    b = _spec("b", ("blocking",))
    assert detect_role_conflicts((a, b)) == []


def test_three_references_report_one_check_per_conflicting_pair():
    a = _spec("a", ("camera_motion",))
    b = _spec("b", ("camera_motion",))
    c = _spec("c", ("identity",))
    checks = detect_role_conflicts((a, b, c))
    assert len(checks) == 1  # only a/b share a role; c shares nothing
