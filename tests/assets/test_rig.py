"""OMNICAM_HUMANOID_V1 profile + the Mixamo / generic-GLTF auto-mapper."""

from __future__ import annotations

import pytest

from omnicam.assets.rig import (
    CANONICAL_JOINTS,
    OPTIONAL_JOINTS,
    REQUIRED_JOINTS,
    auto_map_bones,
    missing_required_joints,
    normalize_bone_name,
    rig_is_complete,
    rig_status,
)

_MIXAMO = [
    "mixamorig:Hips", "mixamorig:Spine", "mixamorig:Spine1", "mixamorig:Spine2",
    "mixamorig:Neck", "mixamorig:Head", "mixamorig:HeadTop_End",
    "mixamorig:LeftShoulder", "mixamorig:LeftArm", "mixamorig:LeftForeArm", "mixamorig:LeftHand",
    "mixamorig:LeftHandIndex1", "mixamorig:LeftHandIndex2",
    "mixamorig:RightShoulder", "mixamorig:RightArm", "mixamorig:RightForeArm", "mixamorig:RightHand",
    "mixamorig:LeftUpLeg", "mixamorig:LeftLeg", "mixamorig:LeftFoot", "mixamorig:LeftToeBase", "mixamorig:LeftToe_End",
    "mixamorig:RightUpLeg", "mixamorig:RightLeg", "mixamorig:RightFoot", "mixamorig:RightToeBase", "mixamorig:RightToe_End",
]

_GENERIC_GLTF = [
    "Hips", "Spine", "Chest", "Neck", "Head",
    "Shoulder.L", "UpperArm.L", "LowerArm.L", "Hand.L",
    "Shoulder.R", "UpperArm.R", "LowerArm.R", "Hand.R",
    "UpperLeg.L", "LowerLeg.L", "Foot.L", "Toe.L",
    "UpperLeg.R", "LowerLeg.R", "Foot.R", "Toe.R",
]


def test_profile_shape():
    assert len(REQUIRED_JOINTS) == 22
    assert set(OPTIONAL_JOINTS) == {"eye_l", "eye_r", "hand_tip_l", "hand_tip_r"}
    assert frozenset(REQUIRED_JOINTS) | frozenset(OPTIONAL_JOINTS) == CANONICAL_JOINTS


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("mixamorig:LeftArm", "leftarm"),
        ("UpperArm.L", "upperarml"),
        ("mixamorig_RightHand", "righthand"),
        ("Hips", "hips"),
        ("  Spine 1 ", "spine1"),
    ],
)
def test_normalize_bone_name(raw, expected):
    assert normalize_bone_name(raw) == expected


def test_auto_map_mixamo_is_complete():
    mapping = auto_map_bones(_MIXAMO)
    assert rig_is_complete(mapping)
    assert missing_required_joints(mapping) == []
    # left/right consistency
    assert mapping["upper_arm_l"] == "mixamorig:LeftArm"
    assert mapping["upper_arm_r"] == "mixamorig:RightArm"
    assert mapping["toe_l"] == "mixamorig:LeftToeBase"
    # rootless rig: root shares the hips bone with pelvis
    assert mapping["root"] == mapping["pelvis"] == "mixamorig:Hips"
    # every non-shared source bone is used at most once
    picks = [v for k, v in mapping.items() if k != "root"]
    assert len(picks) == len(set(picks))


def test_auto_map_generic_gltf_is_complete():
    mapping = auto_map_bones(_GENERIC_GLTF)
    assert rig_is_complete(mapping), missing_required_joints(mapping)
    assert mapping["chest"] == "Chest"
    assert mapping["lower_leg_r"] == "LowerLeg.R"


def test_sparse_rig_is_incomplete():
    mapping = auto_map_bones(["Hips", "Spine", "Head", "LeftHand"])
    assert not rig_is_complete(mapping)
    missing = missing_required_joints(mapping)
    assert "upper_arm_r" in missing and "foot_l" in missing
    # missing list is ordered by the canonical joint order
    assert missing == sorted(missing, key=REQUIRED_JOINTS.index)


def test_rig_status_reads_a_binding_dict():
    assert rig_status(None) == "none"
    assert rig_status({"bone_map": {}}) == "none"
    assert rig_status({"bone_map": auto_map_bones(["Hips", "Head"])}) == "incomplete"
    assert rig_status({"bone_map": auto_map_bones(_MIXAMO)}) == "rigged"
