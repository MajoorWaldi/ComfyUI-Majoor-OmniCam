"""FK pose presets: quaternion validation, storage, built-in protection."""

from __future__ import annotations

import math

import pytest

from omnicam.assets import pose_library as pl
from omnicam.assets.errors import (
    AssetError,
    PoseInvalidQuaternionError,
    PoseLimitExceededError,
    PoseNotFoundError,
    PoseProfileMismatchError,
)

_IDENTITY = [0.0, 0.0, 0.0, 1.0]


def test_validate_pose_normalises_quaternions():
    pose = pl.validate_pose(
        {"id": "wave", "joints": {"upper_arm_r": [0.0, 0.0, 0.0, 1.5]}}
    )
    x, y, z, w = pose["joints"]["upper_arm_r"]
    assert math.isclose(math.sqrt(x * x + y * y + z * z + w * w), 1.0, abs_tol=1e-6)
    assert pose["profile"] == pl.HUMANOID_PROFILE
    assert pose["builtin"] is False


@pytest.mark.parametrize(
    "quat",
    [[0, 0, 0], [0, 0, 0, 0], [0, 0, 0, float("nan")], [10, 0, 0, 0], "notaquat"],
)
def test_validate_pose_rejects_bad_quaternion(quat):
    with pytest.raises(PoseInvalidQuaternionError):
        pl.validate_pose({"id": "bad", "joints": {"head": quat}})


def test_validate_pose_rejects_bad_root_offset_and_profile():
    with pytest.raises(AssetError):
        pl.validate_pose({"id": "x", "root_offset": [1, 2]})
    with pytest.raises(PoseProfileMismatchError):
        pl.validate_pose({"id": "x", "profile": "some_other_rig"})


def test_validate_pose_joint_ceiling():
    joints = {f"j{i}": _IDENTITY for i in range(pl.MAX_POSE_JOINTS + 1)}
    with pytest.raises(PoseLimitExceededError):
        pl.validate_pose({"id": "big", "joints": joints})


def test_save_list_get_delete_round_trip(tmp_path):
    pl.save_pose(tmp_path, {"id": "t_pose", "name": "T Pose",
                            "joints": {"upper_arm_r": _IDENTITY}})
    ids = [p["id"] for p in pl.list_poses(tmp_path)]
    assert ids[0] == "neutral"  # built-in first
    assert "t_pose" in ids
    assert pl.get_pose(tmp_path, "t_pose")["name"] == "T Pose"

    pl.delete_pose(tmp_path, "t_pose")
    with pytest.raises(PoseNotFoundError):
        pl.get_pose(tmp_path, "t_pose")


def test_builtin_pose_id_is_protected(tmp_path):
    with pytest.raises(AssetError):
        pl.save_pose(tmp_path, {"id": "neutral", "joints": {}})
    with pytest.raises(AssetError):
        pl.delete_pose(tmp_path, "neutral")


def test_delete_missing_custom_pose_is_404(tmp_path):
    with pytest.raises(PoseNotFoundError):
        pl.delete_pose(tmp_path, "never_saved")
