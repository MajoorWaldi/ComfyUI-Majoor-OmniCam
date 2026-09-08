"""Scan camera trajectory: pose extraction + optical-axis roll (audit F18)."""

from __future__ import annotations

import math

import numpy as np

from omnicam.reconstruction.multiview.camera_track import (
    _pose_full,
    _roll_degrees,
    build_scan_camera_track,
)
from omnicam.reconstruction.multiview.types import ViewCameraEvidence


def _K(fy=400.0):
    return np.array([[fy, 0, 80.0], [0, fy, 60.0], [0, 0, 1.0]])


def _cam_world_from(rot: np.ndarray, position: np.ndarray, *, frame: int) -> ViewCameraEvidence:
    """Build a view camera from a desired world->camera rotation + camera world position."""
    e = np.eye(4)
    e[:3, :3] = rot
    e[:3, 3] = -rot @ position
    return ViewCameraEvidence(
        view_index=frame, width=160, height=120,
        extrinsic_camera_from_world=e, intrinsics=_K(), source_frame=frame,
    )


def test_level_camera_has_zero_roll():
    # world->camera identity: camera looks down -Z with +Y up, no roll.
    cam = _cam_world_from(np.eye(3), np.array([0.0, 1.5, 3.0]), frame=0)
    pos, fwd, up = _pose_full(cam)
    assert np.allclose(pos, [0.0, 1.5, 3.0], atol=1e-6)
    assert np.allclose(fwd, [0.0, 0.0, -1.0], atol=1e-6)
    assert abs(_roll_degrees(fwd, up)) < 1e-6


def test_roll_about_the_optical_axis_is_recovered():
    theta = math.radians(20.0)
    # Rotate the camera 20 deg about its own forward (-Z) axis -> world->camera
    # rotation is a roll about Z.
    roll_z = np.array(
        [[math.cos(theta), -math.sin(theta), 0.0],
         [math.sin(theta), math.cos(theta), 0.0],
         [0.0, 0.0, 1.0]]
    )
    cam = _cam_world_from(roll_z, np.array([0.0, 0.0, 2.0]), frame=1)
    _pos, fwd, up = _pose_full(cam)
    assert np.allclose(fwd, [0.0, 0.0, -1.0], atol=1e-6)
    assert abs(abs(_roll_degrees(fwd, up)) - 20.0) < 1e-3


def test_build_track_writes_recovered_roll_into_keyframes():
    theta = math.radians(12.0)
    roll_z = np.array(
        [[math.cos(theta), -math.sin(theta), 0.0],
         [math.sin(theta), math.cos(theta), 0.0],
         [0.0, 0.0, 1.0]]
    )
    cams = [
        _cam_world_from(np.eye(3), np.array([0.0, 0.0, 0.0]), frame=0),
        _cam_world_from(roll_z, np.array([0.5, 0.0, 0.0]), frame=6),
    ]
    track = build_scan_camera_track(cams, fps=30, duration_frames=12, width=160, height=120)
    rolls = {kf["frame"]: kf["camera"]["roll"] for kf in track["keyframes"]}
    assert abs(rolls[0]) < 1e-6
    assert abs(abs(rolls[6]) - 12.0) < 1e-2
    assert track["fps"] == 30


def test_roll_is_zero_when_looking_straight_down():
    # forward = -Y, world-up parallel to the optical axis -> roll undefined -> 0.
    look_down = np.array([[1.0, 0.0, 0.0], [0.0, 0.0, 1.0], [0.0, -1.0, 0.0]])
    cam = _cam_world_from(look_down, np.array([0.0, 3.0, 0.0]), frame=0)
    _pos, fwd, up = _pose_full(cam)
    assert _roll_degrees(fwd, up) == 0.0
