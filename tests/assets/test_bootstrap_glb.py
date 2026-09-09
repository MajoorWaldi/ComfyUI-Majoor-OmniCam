"""GLB JSON-chunk inspector + real rig evidence."""

from __future__ import annotations

import io
import zipfile

import pytest

from omnicam.assets.bootstrap.archive import list_glb_members
from omnicam.assets.bootstrap.glb_inspect import (
    build_rig_evidence,
    inspect_glb_member,
    inspect_glb_stream,
)
from omnicam.assets.bootstrap.types import BootstrapError

from .glb_fixture import build_humanoid_glb, build_static_glb


def _info(data: bytes):
    return inspect_glb_stream(io.BytesIO(data), len(data))


def test_reads_joint_and_animation_names():
    info = _info(build_humanoid_glb(animation_names=("Walk", "Idle")))
    assert "Hips" in info.joint_names
    assert "LeftHand" in info.joint_names
    assert info.animation_names == ("Walk", "Idle")
    assert info.has_skin is True


def test_geometry_counts_match_accessor_values():
    info = _info(build_humanoid_glb(vertex_count=1234, triangle_count=456))
    assert info.vertex_count == 1234
    assert info.triangle_count == 456
    assert info.accessor_bounds is not None
    assert round(info.accessor_bounds[1], 2) == 1.75


def test_complete_humanoid_maps_every_required_joint():
    evidence = build_rig_evidence(_info(build_humanoid_glb()))
    assert evidence.missing == ()
    assert evidence.complete is True
    assert evidence.hierarchy_ok is True
    assert evidence.bone_map["toe_l"] == "LeftToeBase"
    assert evidence.bone_map["root"] == evidence.bone_map["pelvis"] == "Hips"


def test_joint_order_does_not_change_the_mapping():
    a = build_rig_evidence(_info(build_humanoid_glb()))
    b = build_rig_evidence(_info(build_humanoid_glb(scramble=True)))
    assert a.bone_map == b.bone_map
    assert b.complete is True


def test_missing_toe_is_incomplete():
    evidence = build_rig_evidence(
        _info(build_humanoid_glb(drop_joints=("LeftToeBase",)))
    )
    assert "toe_l" in evidence.missing
    assert evidence.complete is False


def test_animation_without_skin_is_not_a_character():
    info = _info(build_humanoid_glb(with_skin=False, animation_names=("Walk",)))
    assert info.has_skin is False
    assert info.animation_names == ("Walk",)
    evidence = build_rig_evidence(info)
    assert evidence.complete is False
    assert evidence.bone_map == {}


def test_static_prop_has_no_rig_evidence():
    evidence = build_rig_evidence(_info(build_static_glb()))
    assert evidence.complete is False
    assert evidence.bone_map == {}


def test_truncated_header_raises():
    with pytest.raises(BootstrapError):
        inspect_glb_stream(io.BytesIO(b"glTF"), 4)


def test_wrong_declared_size_raises():
    data = build_static_glb()
    with pytest.raises(BootstrapError):
        inspect_glb_stream(io.BytesIO(data), len(data) + 99)


def test_inspect_glb_member_reads_from_zip(tmp_path):
    archive = tmp_path / "kit.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr("Models/GLB format/character.glb", build_humanoid_glb())
    (member,) = list_glb_members(archive)
    info = inspect_glb_member(member)
    assert info.has_skin is True
    assert build_rig_evidence(info).complete is True
