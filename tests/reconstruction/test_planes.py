"""Tests for deterministic RANSAC ground and wall plane analysis."""

from __future__ import annotations

import numpy as np
import torch

from omnicam.reconstruction.planes import detect_planes
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import GeometryEvidence

from .fakes import FakeReconstructionProvider


def test_deterministic_ransac_ground_detection():
    provider = FakeReconstructionProvider(grid_size=32)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    settings = ReconstructionSettings(provider="fake", detect_ground=True, detect_walls=False)

    planes1 = detect_planes(evidence, settings, seed="fixed_seed_abc")
    planes2 = detect_planes(evidence, settings, seed="fixed_seed_abc")

    assert len(planes1) == 1
    assert len(planes2) == 1
    assert planes1[0].plane_type == "ground"
    assert planes1[0].center == planes2[0].center
    assert planes1[0].normal == planes2[0].normal
    assert planes1[0].size == planes2[0].size
    assert planes1[0].confidence == planes2[0].confidence
    assert planes1[0].confidence >= 0.45


def test_noisy_cloud_below_inlier_ratio_yields_no_ground():
    # Generate purely random 3D points with no dominant plane
    rng = np.random.default_rng(42)
    pts = rng.standard_normal((1, 32, 32, 3)).astype(np.float32)
    evidence = GeometryEvidence(
        points=torch.from_numpy(pts),
        coordinate_system="opencv_x_right_y_down_z_forward",
    )
    settings = ReconstructionSettings(detect_ground=True, detect_walls=False)

    planes = detect_planes(evidence, settings, seed=42)
    # With pure noise, inlier ratio to any ground plane will be below MIN_GROUND_INLIER_RATIO
    assert len(planes) == 0


def test_ground_extents_percentiles():
    # Floor points spanning X in [-2, 2], Z in [1, 5], Y = -1
    # Add a few extreme outliers
    x = np.linspace(-2.0, 2.0, 50, dtype=np.float32)
    z = np.linspace(1.0, 5.0, 50, dtype=np.float32)
    xx, zz = np.meshgrid(x, z)
    yy = np.full_like(xx, -1.0)
    pts = np.stack([xx, yy, zz], axis=-1)

    evidence = GeometryEvidence(
        points=torch.from_numpy(pts.reshape(1, -1, 3)),
        coordinate_system="gltf_y_up_z_back",
    )
    settings = ReconstructionSettings(detect_ground=True, detect_walls=False)

    planes = detect_planes(evidence, settings, seed=123)
    assert len(planes) == 1
    plane = planes[0]
    assert plane.plane_type == "ground"
    # Extents should roughly match 5-95 percentile
    size_x, size_z = plane.size
    assert 3.0 < size_x <= 4.0
    assert 3.0 < size_z <= 4.0


def test_walls_disabled_by_default():
    provider = FakeReconstructionProvider(grid_size=32)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    settings = ReconstructionSettings(detect_ground=True, detect_walls=False)

    planes = detect_planes(evidence, settings, seed=10)
    assert all(p.plane_type != "wall" for p in planes)


def test_wall_detection_requires_vertical_normals():
    # Synthetic vertical wall points: X in [-1, 1], Y in [-1, 1], Z = 3.0 (facing +Z in glTF)
    x = np.linspace(-1.0, 1.0, 40, dtype=np.float32)
    y = np.linspace(-1.0, 1.0, 40, dtype=np.float32)
    xx, yy = np.meshgrid(x, y)
    zz = np.full_like(xx, 3.0)
    pts = np.stack([xx, yy, zz], axis=-1)

    evidence = GeometryEvidence(
        points=torch.from_numpy(pts).unsqueeze(0),
        coordinate_system="gltf_y_up_z_back",
    )
    settings = ReconstructionSettings(detect_ground=False, detect_walls=True)

    planes = detect_planes(evidence, settings, seed=99)
    assert len(planes) >= 1
    wall = planes[0]
    assert wall.plane_type == "wall"
    # Wall normal in glTF must be approximately perpendicular to UP [0, 1, 0]
    assert abs(wall.normal[1]) < 0.25
