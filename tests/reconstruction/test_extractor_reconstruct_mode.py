"""Tests for Extractor node scene_reconstruct mode."""

from __future__ import annotations

import json
from unittest.mock import MagicMock

import pytest
import torch

from omnicam.nodes.extractor import MajoorOmniCamExtractor
from omnicam.reconstruction.pipeline import PipelineOutput


def test_schema_declares_extract_mode():
    schema = MajoorOmniCamExtractor.define_schema()
    extract_mode = next((inp for inp in schema.inputs if inp.id == "extract_mode"), None)
    assert extract_mode is not None
    assert list(extract_mode.options) == ["camera_track", "scene_reconstruct"]
    assert extract_mode.default == "camera_track"


def test_camera_track_default_mode_regression(clip, monkeypatch):
    """Verify camera_track mode produces backwards-compatible result envelope."""
    from extractor_backend_double import RecordingBackend

    from omnicam.extractor.pipeline import extract_camera_track

    monkeypatch.setattr(
        "omnicam.nodes.extractor.extract_camera_track",
        lambda **kwargs: extract_camera_track(**kwargs, backend=RecordingBackend()),
    )
    monkeypatch.setattr(
        "omnicam.nodes.extractor.solve_source",
        lambda video: (video, "omnicam/extractor_runtime/test.mp4 [temp]"),
    )

    output = MajoorOmniCamExtractor.execute(
        video=clip,
        extract_mode="camera_track",
        method="auto",
        lens_mode="auto",
        fov_degrees=53.0,
        focal_length_mm=24.0,
        sensor_width_mm=36.0,
        max_dimension=320,
        frame_step=1,
        normalize_origin=True,
        motion_scale=1.0,
        position_smoothing=0.15,
        rotation_smoothing=0.1,
        simplify_keys=True,
        position_tolerance=0.01,
        rotation_tolerance_deg=0.25,
    )
    motion_scene, solver_coverage, report = output[0], output[1], output[2]
    assert motion_scene["version"] == 1
    envelope = json.loads(output.ui.as_dict()["text"][0])
    assert envelope["kind"] == "omnicam_extractor_result_v2"
    assert envelope["mode"] == "camera_track"
    assert envelope["solver_coverage"] == solver_coverage
    assert envelope["report"] == report


def test_scene_reconstruct_rejects_multi_image_batch():
    batch = torch.zeros((4, 64, 64, 3), dtype=torch.float32)
    with pytest.raises(ValueError) as exc:
        MajoorOmniCamExtractor.execute(
            video=batch,
            extract_mode="scene_reconstruct",
            method="auto",
            lens_mode="auto",
            fov_degrees=53.0,
            focal_length_mm=24.0,
            sensor_width_mm=36.0,
            max_dimension=320,
            frame_step=1,
            normalize_origin=True,
            motion_scale=1.0,
            position_smoothing=0.15,
            rotation_smoothing=0.1,
            simplify_keys=True,
            position_tolerance=0.01,
            rotation_tolerance_deg=0.25,
        )
    assert "single" in str(exc.value).lower() or "1 image" in str(exc.value).lower()


def test_scene_reconstruct_rejects_video_input(clip):
    with pytest.raises(ValueError) as exc:
        MajoorOmniCamExtractor.execute(
            video=clip,
            extract_mode="scene_reconstruct",
            method="auto",
            lens_mode="auto",
            fov_degrees=53.0,
            focal_length_mm=24.0,
            sensor_width_mm=36.0,
            max_dimension=320,
            frame_step=1,
            normalize_origin=True,
            motion_scale=1.0,
            position_smoothing=0.15,
            rotation_smoothing=0.1,
            simplify_keys=True,
            position_tolerance=0.01,
            rotation_tolerance_deg=0.25,
        )
    assert "video" in str(exc.value).lower()


def test_scene_reconstruct_execution_flow(monkeypatch):
    single_image = torch.zeros((1, 64, 64, 3), dtype=torch.float32)

    fake_output = PipelineOutput(
        motion_scene={"version": 1, "objects": [{"id": "recon_env"}]},
        summary={"provider": "comfy_moge", "mesh_triangles": 1000, "ground_confidence": 0.88, "camera_fov_x": 60.0},
        warnings=[],
        fingerprint="fp_test_123",
    )

    mock_execute_recon = MagicMock(return_value=(
        fake_output.motion_scene,
        0.88,
        "Reconstructed scene using comfy_moge",
        {
            "kind": "omnicam_extractor_result_v2",
            "mode": "scene_reconstruct",
            "fingerprint": "fp_test_123",
            "motion_scene": fake_output.motion_scene,
            "solver_coverage": 0.88,
            "report": "Reconstructed scene using comfy_moge",
            "source": {"kind": "annotated_input", "value": "recon.png"},
            "reconstruction": {"provider": "comfy_moge", "triangle_count": 1000, "warnings": []},
        }
    ))

    monkeypatch.setattr("omnicam.reconstruction.node_bridge.execute_reconstruction", mock_execute_recon)

    output = MajoorOmniCamExtractor.execute(
        video=single_image,
        extract_mode="scene_reconstruct",
        method="auto",
        lens_mode="auto",
        fov_degrees=53.0,
        focal_length_mm=24.0,
        sensor_width_mm=36.0,
        max_dimension=320,
        frame_step=1,
        normalize_origin=True,
        motion_scale=1.0,
        position_smoothing=0.15,
        rotation_smoothing=0.1,
        simplify_keys=True,
        position_tolerance=0.01,
        rotation_tolerance_deg=0.25,
    )

    assert output[0] == fake_output.motion_scene
    assert output[1] == 0.88
    assert "Reconstructed" in output[2]
    envelope = json.loads(output.ui.as_dict()["text"][0])
    assert envelope["mode"] == "scene_reconstruct"
    assert envelope["reconstruction"]["triangle_count"] == 1000
