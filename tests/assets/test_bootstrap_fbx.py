"""Binary-FBX skeleton inspector + shared rig evidence."""

from __future__ import annotations

import zipfile

import pytest

from omnicam.assets.bootstrap.archive import list_model_members
from omnicam.assets.bootstrap.fbx_inspect import inspect_fbx_bytes, inspect_fbx_member
from omnicam.assets.bootstrap.glb_inspect import build_rig_evidence
from omnicam.assets.bootstrap.model_inspect import inspect_member, model_format
from omnicam.assets.bootstrap.types import BootstrapError
from omnicam.assets.rig import deform_joint_names

from .fbx_fixture import FBX_HUMANOID, build_humanoid_fbx


def test_reads_bones_hierarchy_geometry_and_anim_stacks():
    info = inspect_fbx_bytes(build_humanoid_fbx(triangle_count=400, animation_stacks=("Idle", "Run")))
    assert info.version == 7400
    assert info.has_skin is True
    assert "Hips" in info.joint_names and "LeftToes" in info.joint_names
    assert info.triangle_count == 400
    assert info.animation_names == ("Idle", "Run")
    assert info.joint_parents["LeftToes"][:2] == ("LeftFoot", "LeftLeg")


def test_full_biped_maps_every_required_joint_after_control_bone_strip():
    info = inspect_fbx_bytes(build_humanoid_fbx())
    evidence = build_rig_evidence(info)
    assert evidence.missing == ()
    assert evidence.complete is True
    assert evidence.hierarchy_ok is True
    # a control bone was present but not chosen for the toe
    assert "LeftFootIK" in info.joint_names
    assert evidence.bone_map["toe_l"] == "LeftToes"
    assert evidence.bone_map["root"] == "Hips"


def test_deform_joint_names_drops_ik_and_end_bones():
    kept = set(deform_joint_names(list(FBX_HUMANOID)))
    assert "LeftFootIK" not in kept
    assert "HipsCtrl" not in kept
    assert "Head_end" not in kept
    assert {"Hips", "Spine", "LeftToes", "RightHand"} <= kept


def test_missing_lower_limbs_is_incomplete():
    partial = {k: v for k, v in FBX_HUMANOID.items()
               if k not in ("LeftToes", "RightToes", "LeftFoot", "RightFoot")}
    evidence = build_rig_evidence(inspect_fbx_bytes(build_humanoid_fbx(hierarchy=partial)))
    assert evidence.complete is False
    assert "toe_l" in evidence.missing


def test_rejects_non_fbx_bytes():
    with pytest.raises(BootstrapError):
        inspect_fbx_bytes(b"glTF\x02\x00\x00\x00not an fbx at all")


def test_model_inspect_dispatches_by_suffix(tmp_path):
    archive = tmp_path / "pack.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr("Model/characterMedium.fbx", build_humanoid_fbx())
    (member,) = list_model_members(archive, (".fbx",))
    assert model_format(member.name) == "fbx"
    info = inspect_member(member)
    assert build_rig_evidence(info).complete is True
    # inspect_fbx_member is the same path
    assert inspect_fbx_member(member).has_skin is True


def test_list_model_members_returns_glb_and_fbx(tmp_path):
    archive = tmp_path / "pack.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr("Model/characterMedium.fbx", build_humanoid_fbx())
        zf.writestr("Models/GLB format/prop.glb", b"glTF\x02\x00\x00\x00" + b"\x00" * 40)
        zf.writestr("readme.txt", b"hi")
    names = sorted(m.name for m in list_model_members(archive))
    assert names == ["Model/characterMedium.fbx", "Models/GLB format/prop.glb"]
    assert [m.name for m in list_model_members(archive, (".glb",))] == ["Models/GLB format/prop.glb"]
