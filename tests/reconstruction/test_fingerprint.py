"""Tests for deterministic reconstruction input fingerprinting."""

from __future__ import annotations

from omnicam.reconstruction.fingerprint import compute_reconstruction_fingerprint
from omnicam.reconstruction.settings import ReconstructionSettings


def test_fingerprint_deterministic_key_ordering():
    # Different ordering of settings dict must produce exact same fingerprint
    settings_a = {
        "provider": "comfy_moge",
        "mode": "geometry",
        "quality": "balanced",
        "recover_fov": True,
        "source_texture": True,
        "detect_ground": True,
        "detect_walls": False,
        "triangle_budget": 120_000,
        "discontinuity_threshold": 0.04,
        "scene_scale": 1.0,
    }
    settings_b = dict(reversed(list(settings_a.items())))

    fp_a = compute_reconstruction_fingerprint(source_fingerprint="abc123", provider="comfy_moge", settings=settings_a)
    fp_b = compute_reconstruction_fingerprint(source_fingerprint="abc123", provider="comfy_moge", settings=settings_b)

    assert fp_a == fp_b
    assert len(fp_a) == 20
    assert all(c in "0123456789abcdef" for c in fp_a)


def test_fingerprint_changes_with_geometry_settings():
    base_settings = ReconstructionSettings()
    base_fp = compute_reconstruction_fingerprint(
        source_fingerprint="abc123",
        provider="comfy_moge",
        settings=base_settings,
    )

    # Change triangle budget
    changed_settings = ReconstructionSettings(triangle_budget=80_000)
    changed_fp = compute_reconstruction_fingerprint(
        source_fingerprint="abc123",
        provider="comfy_moge",
        settings=changed_settings,
    )
    assert base_fp != changed_fp

    # Change source fingerprint
    diff_source_fp = compute_reconstruction_fingerprint(
        source_fingerprint="diff456",
        provider="comfy_moge",
        settings=base_settings,
    )
    assert base_fp != diff_source_fp

    # Change scale
    scale_settings = ReconstructionSettings(scene_scale=2.0)
    scale_fp = compute_reconstruction_fingerprint(
        source_fingerprint="abc123",
        provider="comfy_moge",
        settings=scale_settings,
    )
    assert base_fp != scale_fp


def test_fingerprint_ignores_ui_only_values():
    settings_a = {
        "provider": "comfy_moge",
        "mode": "geometry",
        "quality": "balanced",
        "recover_fov": True,
        "source_texture": True,
        "detect_ground": True,
        "detect_walls": False,
        "triangle_budget": 120_000,
        "discontinuity_threshold": 0.04,
        "scene_scale": 1.0,
        "ui_collapsed": True,
        "client_id": "client-123",
        "node_id": "node-456",
    }
    settings_b = {
        "provider": "comfy_moge",
        "mode": "geometry",
        "quality": "balanced",
        "recover_fov": True,
        "source_texture": True,
        "detect_ground": True,
        "detect_walls": False,
        "triangle_budget": 120_000,
        "discontinuity_threshold": 0.04,
        "scene_scale": 1.0,
        "ui_collapsed": False,
        "client_id": "client-789",
        "node_id": "node-999",
    }

    fp_a = compute_reconstruction_fingerprint(source_fingerprint="abc123", provider="comfy_moge", settings=settings_a)
    fp_b = compute_reconstruction_fingerprint(source_fingerprint="abc123", provider="comfy_moge", settings=settings_b)
    assert fp_a == fp_b
