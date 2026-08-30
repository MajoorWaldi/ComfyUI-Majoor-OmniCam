"""The single coordinate boundary between a camera solver and OmniCam."""

import math

import pytest

from omnicam.core.camera_math import quaternion_from_euler, rotate_quaternion
from omnicam.extractor.transforms import (
    IDENTITY_QUATERNION,
    convert_opencv_c2w_to_omnicam,
    convert_pose_sequence,
    pose_is_finite,
    pose_to_camera_payload,
    quaternion_angle_degrees,
    quaternion_slerp,
    relative_to_first_pose,
    scale_positions,
)
from omnicam.extractor.types import PoseSample


def pose(frame, position, quaternion=IDENTITY_QUATERNION):
    return PoseSample(
        source_frame=frame,
        timestamp_seconds=frame / 24.0,
        position=list(position),
        quaternion_xyzw=list(quaternion),
    )


def test_identity_pose_becomes_omnicam_origin():
    payload = pose_to_camera_payload(pose(0, [0, 0, 0]), fov=53.0)
    assert payload["position"] == [0.0, 0.0, 0.0]
    assert payload["target"] == pytest.approx([0.0, 0.0, -1.0], abs=1e-9)
    assert payload["roll"] == pytest.approx(0.0, abs=1e-9)
    assert payload["fov"] == 53.0


def test_opencv_basis_flips_y_and_z_on_both_sides():
    # A camera one unit up in OpenCV terms is one unit *down* the OpenCV +Y,
    # which is OmniCam's -Y... and a camera looking along OpenCV +Z looks along
    # OmniCam -Z, which is exactly the OmniCam forward.
    position, quaternion = convert_opencv_c2w_to_omnicam([1.0, 2.0, 3.0], [0.0, 0.0, 0.0, 1.0])
    assert position == [1.0, -2.0, -3.0]
    assert quaternion == [0.0, 0.0, 0.0, 1.0]
    forward = rotate_quaternion([0.0, 0.0, -1.0], quaternion)
    assert forward == pytest.approx([0.0, 0.0, -1.0], abs=1e-9)


def test_opencv_yaw_survives_the_basis_change_with_the_right_sign():
    # Yaw right in OpenCV (rotation about its +Y, which points down) must come
    # out as yaw right in OmniCam (rotation about its +Y, which points up).
    opencv_yaw = quaternion_from_euler([0.0, 30.0, 0.0])
    _, converted = convert_opencv_c2w_to_omnicam([0.0, 0.0, 0.0], opencv_yaw)
    forward = rotate_quaternion([0.0, 0.0, -1.0], converted)
    expected = rotate_quaternion([0.0, 0.0, -1.0], quaternion_from_euler([0.0, -30.0, 0.0]))
    assert forward == pytest.approx(expected, abs=1e-9)


def test_convert_pose_sequence_rejects_an_unknown_basis():
    with pytest.raises(ValueError, match="basis"):
        convert_pose_sequence([pose(0, [0, 0, 0])], "worldspace")


def test_normalize_origin_makes_first_pose_identity():
    yaw = quaternion_from_euler([0.0, 40.0, 0.0])
    poses = relative_to_first_pose([pose(0, [5, -2, 7], yaw), pose(1, [5, -2, 6], yaw)])
    assert poses[0].position == pytest.approx([0.0, 0.0, 0.0], abs=1e-9)
    assert quaternion_angle_degrees(poses[0].quaternion_xyzw, IDENTITY_QUATERNION) < 1e-6
    payload = pose_to_camera_payload(poses[0], fov=53.0)
    assert payload["target"] == pytest.approx([0.0, 0.0, -1.0], abs=1e-9)


def test_normalize_origin_expresses_motion_in_the_first_camera_frame():
    # The camera starts yawed 90 degrees and then moves one unit along world -X.
    # In its own frame at frame 0 that is one unit straight ahead: local -Z.
    yaw = quaternion_from_euler([0.0, 90.0, 0.0])
    poses = relative_to_first_pose([pose(0, [0, 0, 0], yaw), pose(1, [-1, 0, 0], yaw)])
    assert poses[1].position == pytest.approx([0.0, 0.0, -1.0], abs=1e-9)


def test_motion_scale_changes_translation_not_rotation():
    yaw = quaternion_from_euler([0.0, 25.0, 0.0])
    scaled = scale_positions([pose(0, [1, 2, 3], yaw)], 4.0)
    assert scaled[0].position == pytest.approx([4.0, 8.0, 12.0])
    assert quaternion_angle_degrees(scaled[0].quaternion_xyzw, yaw) < 1e-9


def test_pose_target_follows_local_minus_z():
    pitch_up = quaternion_from_euler([30.0, 0.0, 0.0])
    payload = pose_to_camera_payload(pose(0, [0, 1, 0], pitch_up), fov=40.0)
    direction = [payload["target"][axis] - payload["position"][axis] for axis in range(3)]
    assert math.sqrt(sum(value * value for value in direction)) == pytest.approx(1.0, abs=1e-9)
    assert direction[1] > 0.0  # pitching up looks up


def test_roll_survives_pose_to_camera_conversion():
    rolled = quaternion_from_euler([0.0, 0.0, 35.0])
    payload = pose_to_camera_payload(pose(0, [0, 0, 0], rolled), fov=53.0)
    assert payload["roll"] == pytest.approx(35.0, abs=1e-6)


def test_quaternion_sign_is_canonicalized():
    yaw = quaternion_from_euler([0.0, 60.0, 0.0])
    flipped = [-component for component in yaw]
    assert quaternion_angle_degrees(yaw, flipped) < 1e-9
    # SLERP must take the short way round even across a sign flip.
    midpoint = quaternion_slerp(yaw, flipped, 0.5)
    assert quaternion_angle_degrees(midpoint, yaw) < 1e-6


def test_slerp_halfway_is_half_the_angle():
    start = IDENTITY_QUATERNION
    end = quaternion_from_euler([0.0, 90.0, 0.0])
    midpoint = quaternion_slerp(start, end, 0.5)
    assert quaternion_angle_degrees(start, midpoint) == pytest.approx(45.0, abs=1e-6)
    assert quaternion_angle_degrees(midpoint, end) == pytest.approx(45.0, abs=1e-6)


def test_non_finite_poses_are_detected():
    assert pose_is_finite(pose(0, [0, 0, 0]))
    assert not pose_is_finite(pose(0, [float("nan"), 0, 0]))
    assert not pose_is_finite(pose(0, [0, 0, 0], [0.0, 0.0, 0.0, 0.0]))


def test_roll_round_trips_through_the_canonical_camera_basis():
    """A payload OmniCam re-reads must reproduce the orientation that produced it."""
    from omnicam.core.camera_math import camera_quaternion
    from omnicam.core.camera_pose import roll_from_quaternion

    for roll in (-90.0, -35.0, 0.0, 12.0, 35.0, 120.0):
        quaternion = camera_quaternion([0.0, 1.0, 4.0], [0.0, 1.0, 0.0], roll)
        recovered = roll_from_quaternion(
            [0.0, 1.0, 4.0], [0.0, 1.0, 0.0],
            [quaternion["x"], quaternion["y"], quaternion["z"], quaternion["w"]],
        )
        assert recovered == pytest.approx(roll, abs=1e-6)
