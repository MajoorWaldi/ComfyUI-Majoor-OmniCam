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
    # The scene_reconstruct envelope shares the camera_track outer transport
    # contract: kind / mode / motion_scene / solver_coverage / report / source.
    assert envelope["kind"] == "omnicam_extractor_result_v2"
    assert envelope["mode"] == "scene_reconstruct"
    for key in ("motion_scene", "solver_coverage", "report", "source", "fingerprint"):
        assert key in envelope
    # Reconstruction-specific detail rides in its own block.
    assert "reconstruction" in envelope


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


def test_reconstruction_settings_from_widgets_round_trips_panel_choices():
    from omnicam.reconstruction.node_bridge import reconstruction_settings_from_widgets

    s = reconstruction_settings_from_widgets(
        recon_mode="hybrid",
        recon_quality="high",
        recon_detect_walls=True,
        recon_segmentation_provider="comfy_sam3",
        recon_semantic_labels="chair, chair, Table\nsofa",
        recon_max_objects=40,
        recon_sam3_threshold=0.7,
    )
    assert s.mode == "hybrid"
    assert s.resolved_mode() == "hybrid"
    assert s.quality == "high"
    assert s.detect_walls is True
    assert s.semantic_labels == ("chair", "Table", "sofa")  # de-duped, order kept
    assert s.max_blockout_objects == 40
    assert s.sam3_threshold == 0.7
    assert s.provider == "comfy_moge"  # non-scan stays on MoGe


def test_reconstruction_settings_from_widgets_scan_picks_vggt_and_clamps():
    from omnicam.reconstruction.node_bridge import reconstruction_settings_from_widgets

    s = reconstruction_settings_from_widgets(
        recon_mode="scan",
        recon_geometry_provider="comfy_moge",  # wrong for scan -> corrected
        recon_vggt_max_views=8,
        recon_vggt_segmentation_views=30,  # > min(8, 32) -> clamped to 8
    )
    assert s.mode == "scan"
    assert s.provider == "vggt"
    assert s.vggt_max_views == 8
    assert s.vggt_segmentation_views == 8


def test_reconstruction_settings_from_widgets_tolerates_stale_enum_values():
    from omnicam.reconstruction.node_bridge import reconstruction_settings_from_widgets

    s = reconstruction_settings_from_widgets(
        recon_mode="geometry",  # legacy alias -> stays, resolves to depth_mesh
        recon_completion_policy="sometimes",  # unknown -> off
        recon_segmentation_provider="mystery",  # unknown -> comfy_sam3
    )
    assert s.mode == "geometry"
    assert s.resolved_mode() == "depth_mesh"
    assert s.completion_policy == "off"
    assert s.segmentation_provider == "comfy_sam3"


def test_queued_execution_builds_the_same_settings_the_bridge_receives(tmp_path, monkeypatch):
    """The graph `execute(...recon_*)` path must construct exactly the
    ReconstructionSettings that reach run_reconstruction_pipeline."""
    from omnicam.reconstruction import node_bridge

    captured = {}

    def _fake_pipeline(**kwargs):
        captured["settings"] = kwargs["settings"]
        return PipelineOutput(
            motion_scene={"version": 1, "objects": [], "cameras": []},
            summary={"provider": "comfy_moge", "confidence": 0.9, "resolved_mode": "depth_mesh"},
            warnings=[],
            fingerprint="fp",
        )

    monkeypatch.setattr(node_bridge, "get_provider", lambda pid: object())
    monkeypatch.setattr(node_bridge, "run_reconstruction_pipeline", _fake_pipeline)
    import folder_paths
    monkeypatch.setattr(folder_paths, "get_input_directory", lambda: str(tmp_path))

    want = node_bridge.reconstruction_settings_from_widgets(recon_mode="blockout", recon_max_objects=12)
    node_bridge.execute_reconstruction(_one_pixel_image(), settings=want)
    assert captured["settings"] is want
    assert captured["settings"].max_blockout_objects == 12
