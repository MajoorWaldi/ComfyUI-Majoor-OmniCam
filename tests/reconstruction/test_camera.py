"""Tests for camera reconstruction from geometry evidence."""

from __future__ import annotations

import math

import pytest
import torch

from omnicam.reconstruction.camera import reconstruct_camera_from_evidence
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import GeometryEvidence


def test_reconstruct_camera_from_intrinsics():
    w, h = 1280, 720
    fx = (w / 2.0) / math.tan(math.radians(35.0))  # fov_x = 70.0
    fy = (h / 2.0) / math.tan(math.radians(22.5))  # fov_y = 45.0
    k = torch.tensor([[[fx, 0.0, w / 2.0], [0.0, fy, h / 2.0], [0.0, 0.0, 1.0]]])
    image = torch.zeros((1, h, w, 3))

    evidence = GeometryEvidence(
        points=torch.zeros((1, h, w, 3)),
        intrinsics=k,
        image=image,
        scale_mode="relative",
    )
    settings = ReconstructionSettings(recover_fov=True)

    cam = reconstruct_camera_from_evidence(evidence, settings)
    assert cam.position == (0.0, 0.0, 0.0)
    assert cam.target == (0.0, 0.0, -1.0)
    assert pytest.approx(cam.fov_x_degrees, rel=1e-3) == 70.0
    assert pytest.approx(cam.fov_y_degrees, rel=1e-3) == 45.0
    assert cam.scale_mode == "relative"
    assert cam.near == 0.01
    assert cam.far == 10000.0


def test_reconstruct_camera_fallback_when_recover_fov_false():
    k = torch.tensor([[[1000.0, 0.0, 500.0], [0.0, 1000.0, 500.0], [0.0, 0.0, 1.0]]])
    evidence = GeometryEvidence(points=torch.zeros((1, 10, 10, 3)), intrinsics=k)
    settings = ReconstructionSettings(recover_fov=False)

    cam = reconstruct_camera_from_evidence(evidence, settings)
    assert cam.fov_x_degrees == 53.0
    assert cam.fov_y_degrees == 53.0


def test_reconstruct_camera_fallback_when_intrinsics_none():
    evidence = GeometryEvidence(points=torch.zeros((1, 10, 10, 3)), intrinsics=None)
    settings = ReconstructionSettings(recover_fov=True)

    cam = reconstruct_camera_from_evidence(evidence, settings)
    assert cam.fov_x_degrees == 53.0
    assert cam.fov_y_degrees == 53.0


def test_reconstruct_camera_preserves_metric_scale_when_guaranteed():
    evidence = GeometryEvidence(
        points=torch.zeros((1, 10, 10, 3)),
        scale_mode="metric_prediction",
    )
    settings = ReconstructionSettings()

    cam = reconstruct_camera_from_evidence(evidence, settings)
    assert cam.scale_mode == "metric_prediction"
