"""Tests for the Extractor <-> reconstruction pipeline bridge."""

from __future__ import annotations

import torch

from omnicam.reconstruction import node_bridge
from omnicam.reconstruction.pipeline import PipelineOutput


def _one_pixel_image() -> torch.Tensor:
    return torch.zeros((1, 4, 4, 3), dtype=torch.float32)


def test_solver_coverage_reports_overall_confidence_not_ground_confidence(tmp_path, monkeypatch):
    """An excellent mesh over a scene with no detectable floor is not a
    confidence of 0 -- solver_coverage must read summary["confidence"], not
    fall back to a ground plane that was never found."""
    monkeypatch.setattr(node_bridge, "get_provider", lambda provider_id: object())

    fake_output = PipelineOutput(
        motion_scene={"version": 1, "objects": [], "cameras": []},
        summary={
            "provider": "comfy_moge",
            "triangle_count": 90_000,
            "camera_fov_x": 60.0,
            "confidence": 0.95,
            "ground_confidence": 0.0,  # no ground detected
        },
        warnings=[],
        fingerprint="fp_test",
    )
    monkeypatch.setattr(node_bridge, "run_reconstruction_pipeline", lambda **kwargs: fake_output)

    import folder_paths
    monkeypatch.setattr(folder_paths, "get_input_directory", lambda: str(tmp_path))

    _motion_scene, confidence, _report, envelope = node_bridge.execute_reconstruction(_one_pixel_image())

    assert confidence == 0.95
    assert envelope["solver_coverage"] == 0.95


def test_solver_coverage_falls_back_to_ground_confidence_for_old_cache_entries(tmp_path, monkeypatch):
    """A cache manifest written before "confidence" was part of the summary
    must still produce a usable value, not crash or silently read None."""
    monkeypatch.setattr(node_bridge, "get_provider", lambda provider_id: object())

    fake_output = PipelineOutput(
        motion_scene={"version": 1, "objects": [], "cameras": []},
        summary={"provider": "comfy_moge", "ground_confidence": 0.72},  # no "confidence" key
        warnings=[],
        fingerprint="fp_old_cache",
    )
    monkeypatch.setattr(node_bridge, "run_reconstruction_pipeline", lambda **kwargs: fake_output)

    import folder_paths
    monkeypatch.setattr(folder_paths, "get_input_directory", lambda: str(tmp_path))

    _motion_scene, confidence, _report, _envelope = node_bridge.execute_reconstruction(_one_pixel_image())

    assert confidence == 0.72
