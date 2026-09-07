"""Tests for VGGT->OmniCam anchor coordinate normalization (plan Tasks 23, 25)."""

from __future__ import annotations

import math

import numpy as np
import pytest

from omnicam.reconstruction.multiview.camera_track import build_scan_camera_track
from omnicam.reconstruction.multiview.coordinates import (
    CV_TO_OMNICAM,
    camera_world_position,
    normalize_vggt_evidence,
)
from omnicam.reconstruction.multiview.types import MultiViewEvidence, ViewCameraEvidence


def _K(fx=500.0, fy=500.0, cx=320.0, cy=240.0):
    return np.array([[fx, 0, cx], [0, fy, cy], [0, 0, 1.0]])


def _cam_from_world_at(position_world, view_index, source_frame):
    """OpenCV camera-from-world for a camera at ``position_world`` with identity R."""
    e = np.eye(4)
    e[:3, 3] = -np.asarray(position_world, dtype=float)
    return ViewCameraEvidence(
        view_index=view_index,
        width=640,
        height=480,
        extrinsic_camera_from_world=e,
        intrinsics=_K(),
        source_frame=source_frame,
    )


def _evidence():
    cams = [
        _cam_from_world_at((0.0, 0.0, 0.0), 0, 0),
        _cam_from_world_at((1.0, 0.0, 0.0), 1, 12),  # translated +X (right) in world
        _cam_from_world_at((0.0, 0.0, 2.0), 2, 24),  # forward along +Z (opencv)
    ]
    points = np.array([[0.5, 0.5, 3.0], [-1.0, 2.0, 5.0]])
    return MultiViewEvidence(
        images=None,
        depth=None,
        depth_confidence=None,
        points_world=points,
        point_confidence=None,
        cameras=cams,
        provider_id="fake_vggt",
        provider_version="0",
    )


def test_anchor_camera_lands_at_origin_looking_down_minus_z():
    norm = normalize_vggt_evidence(_evidence())
    anchor = norm.cameras[0]
    pos = camera_world_position(anchor)
    assert np.allclose(pos, [0.0, 0.0, 0.0], atol=1e-9)

    world_from_cam = np.linalg.inv(np.asarray(anchor.extrinsic_camera_from_world, dtype=float))
    forward = world_from_cam[:3, :3] @ np.array([0.0, 0.0, -1.0])
    assert np.allclose(forward, [0.0, 0.0, -1.0], atol=1e-9)


def test_camera_to_the_right_stays_to_the_right():
    norm = normalize_vggt_evidence(_evidence())
    right_cam_pos = camera_world_position(norm.cameras[1])
    assert right_cam_pos[0] == pytest.approx(1.0, abs=1e-9)  # still +X
    assert right_cam_pos[1] == pytest.approx(0.0, abs=1e-9)
    assert right_cam_pos[2] == pytest.approx(0.0, abs=1e-9)


def test_points_and_cameras_share_one_rigid_transform_no_reflection():
    ev = _evidence()
    norm = normalize_vggt_evidence(ev)
    # With E0 = I the global transform is exactly the axis flip F.
    expected_pts = (ev.points_world @ CV_TO_OMNICAM[:3, :3].T)
    assert np.allclose(norm.points_world, expected_pts, atol=1e-9)

    for cam in norm.cameras:
        rot = np.asarray(cam.extrinsic_camera_from_world, dtype=float)[:3, :3]
        assert np.linalg.det(rot) == pytest.approx(1.0, abs=1e-9)  # proper rotation


def test_scan_camera_track_is_one_track_with_frame_keyframes():
    norm = normalize_vggt_evidence(_evidence())
    track = build_scan_camera_track(
        norm.cameras, fps=24.0, duration_frames=48, width=640, height=480
    )
    frames = [kf["frame"] for kf in track["keyframes"]]
    assert frames == [0, 12, 24]
    assert track["width"] == 640
    fov = track["keyframes"][0]["camera"]["fov"]
    assert fov == pytest.approx(math.degrees(2 * math.atan(240.0 / 500.0)), abs=1e-6)
    # target = position + forward
    kf = track["keyframes"][0]
    pos = np.array(kf["camera"]["position"])
    tgt = np.array(kf["camera"]["target"])
    assert np.allclose(tgt - pos, [0.0, 0.0, -1.0], atol=1e-9)
