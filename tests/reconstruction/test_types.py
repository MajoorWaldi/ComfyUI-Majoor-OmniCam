"""Tests for provider-independent reconstruction DTOs and settings."""

from __future__ import annotations

import pytest

from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import (
    GeometryEvidence,
    ReconstructedAsset,
    ReconstructedCamera,
    ReconstructedPlane,
    ReconstructionMetrics,
    ReconstructionResult,
    ReconstructionSource,
)


def test_geometry_evidence_creation():
    ev = GeometryEvidence(points=[1, 2, 3], confidence=0.9, coordinate_system="opencv_x_right_y_down_z_forward")
    assert ev.confidence == 0.9
    assert ev.coordinate_system == "opencv_x_right_y_down_z_forward"
    assert ev.warnings == []


def test_reconstruction_metrics_round_trip():
    metrics = ReconstructionMetrics(duration_seconds=1.5, triangle_count=50000, ground_confidence=0.8)
    assert metrics.to_dict()["triangle_count"] == 50000
    metrics2 = ReconstructionMetrics.from_dict(metrics.to_dict())
    assert metrics2.duration_seconds == 1.5


def test_reconstruction_source_accepts_valid_kinds():
    src = ReconstructionSource(kind="annotated_input", value="room.png")
    assert src.kind == "annotated_input"
    assert src.value == "room.png"
    assert src.to_dict() == {"kind": "annotated_input", "value": "room.png", "subfolder": ""}

    src2 = ReconstructionSource.from_dict({"kind": "annotated_output", "value": "test.jpg", "subfolder": "sub"})
    assert src2.kind == "annotated_output"
    assert src2.subfolder == "sub"


def test_reconstruction_source_rejects_invalid_kind():
    with pytest.raises(ValueError, match="source kind"):
        ReconstructionSource.from_dict({"kind": "file_url", "value": "http://evil.com/img.png"})

    with pytest.raises(ValueError, match="source kind"):
        ReconstructionSource.from_dict({"kind": "arbitrary_path", "value": "C:\\passwords.txt"})


def test_reconstruction_settings_defaults():
    settings = ReconstructionSettings()
    assert settings.provider == "comfy_moge"
    assert settings.mode == "geometry"
    assert settings.quality == "balanced"
    assert settings.recover_fov is True
    assert settings.source_texture is True
    assert settings.detect_ground is True
    assert settings.detect_walls is False
    assert settings.triangle_budget == 120_000
    assert settings.discontinuity_threshold == 0.04
    assert settings.scene_scale == 1.0


def test_reconstruction_settings_round_trip():
    data = {
        "provider": "fake",
        "mode": "layout",
        "quality": "high",
        "recover_fov": False,
        "source_texture": False,
        "detect_ground": False,
        "detect_walls": True,
        "triangle_budget": 50_000,
        "discontinuity_threshold": 0.08,
        "scene_scale": 2.5,
    }
    settings = ReconstructionSettings.from_dict(data)
    assert settings.to_dict() == data


def test_reconstruction_settings_rejects_unknown_provider():
    with pytest.raises(ValueError, match="provider"):
        ReconstructionSettings.from_dict({"provider": "unknown_ai_model"})


def test_reconstruction_settings_rejects_unknown_mode():
    with pytest.raises(ValueError, match="mode"):
        ReconstructionSettings.from_dict({"mode": "instant_magic_3d"})


def test_reconstruction_settings_validates_triangle_budget():
    with pytest.raises(ValueError, match="triangle_budget"):
        ReconstructionSettings.from_dict({"triangle_budget": 0})

    with pytest.raises(ValueError, match="triangle_budget"):
        ReconstructionSettings.from_dict({"triangle_budget": 600_000})


def test_reconstruction_settings_validates_scene_scale_and_discontinuity():
    with pytest.raises(ValueError, match="scene_scale"):
        ReconstructionSettings.from_dict({"scene_scale": -1.0})

    with pytest.raises(ValueError, match="discontinuity_threshold"):
        ReconstructionSettings.from_dict({"discontinuity_threshold": -0.1})


def test_reconstructed_camera_round_trip():
    cam = ReconstructedCamera(
        position=(0.0, 0.0, 0.0),
        target=(0.0, 0.0, -1.0),
        fov_x_degrees=60.0,
        fov_y_degrees=45.0,
    )
    d = cam.to_dict()
    assert d["fov_x_degrees"] == 60.0
    cam2 = ReconstructedCamera.from_dict(d)
    assert cam2.fov_y_degrees == 45.0


def test_reconstructed_plane_and_asset_round_trip():
    plane = ReconstructedPlane(
        plane_type="ground",
        center=(0.0, -1.2, -3.0),
        normal=(0.0, 1.0, 0.0),
        size=(10.0, 10.0),
        confidence=0.88,
    )
    assert plane.to_dict()["plane_type"] == "ground"
    plane2 = ReconstructedPlane.from_dict(plane.to_dict())
    assert plane2.confidence == 0.88

    asset = ReconstructedAsset(
        role="environment",
        asset_path="majoor_omnicam/reconstruction/abc/environment.glb [input]",
        triangle_count=96000,
        textured=True,
        confidence=0.85,
    )
    assert asset.to_dict()["role"] == "environment"


def test_reconstruction_result_round_trip():
    cam = ReconstructedCamera(fov_x_degrees=60.0, fov_y_degrees=45.0)
    asset = ReconstructedAsset(
        role="environment",
        asset_path="majoor_omnicam/reconstruction/abc/environment.glb [input]",
        triangle_count=96000,
        textured=True,
        confidence=0.85,
    )
    result = ReconstructionResult(
        provider="fake",
        mode="geometry",
        camera=cam,
        environment_asset=asset,
        confidence=0.85,
    )
    d = result.to_dict()
    assert d["provider"] == "fake"
    assert d["camera"]["fov_x_degrees"] == 60.0
    res2 = ReconstructionResult.from_dict(d)
    assert res2.environment_asset.triangle_count == 96000
