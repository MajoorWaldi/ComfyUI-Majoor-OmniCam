"""End-to-end single-image blockout pipeline with fakes (plan Task 13)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

from omnicam.reconstruction.pipeline import run_reconstruction_pipeline
from omnicam.reconstruction.pipelines.single_blockout import run_single_blockout_pipeline
from omnicam.reconstruction.segmentation.fake import FakeSegmentationProvider
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import ReconstructionSource

from .fakes import FakeReconstructionProvider


def _image_source(tmp_path: Path) -> ReconstructionSource:
    img = tmp_path / "room.png"
    Image.new("RGB", (16, 16), (120, 90, 60)).save(img, format="PNG")
    return ReconstructionSource(kind="annotated_input", value="room.png")


def _roles(motion_scene: dict) -> list[str]:
    return [o.get("reconstruction", {}).get("role") for o in motion_scene["objects"]]


def test_single_blockout_pipeline_emits_closed_primitives(tmp_path):
    out = run_single_blockout_pipeline(
        source=_image_source(tmp_path),
        settings=ReconstructionSettings(mode="blockout", provider="fake", semantic_labels=("chair", "table")),
        geometry_provider=FakeReconstructionProvider(grid_size=64),
        segmentation_provider=FakeSegmentationProvider(),
        input_root=tmp_path,
    )
    roles = _roles(out.motion_scene)
    assert "blockout_object" in roles
    assert "room" in roles
    # The three structural null roots are always present.
    ids = {o["id"] for o in out.motion_scene["objects"]}
    assert {"reconstruction_root", "reconstruction_room", "reconstruction_blockout"} <= ids
    assert out.summary["blockout_object_count"] >= 1
    # No dense reference in plain blockout mode.
    assert not any(r == "reference" for r in roles)


def test_blockout_scene_validates_and_has_vertical_fov(tmp_path):
    out = run_single_blockout_pipeline(
        source=_image_source(tmp_path),
        settings=ReconstructionSettings(mode="blockout", provider="fake"),
        geometry_provider=FakeReconstructionProvider(grid_size=64, fov_deg=60.0),
        segmentation_provider=FakeSegmentationProvider(),
        input_root=tmp_path,
    )
    track = out.motion_scene["cameras"][0]["track"]
    assert track["keyframes"][0]["camera"]["fov"] > 0
    assert out.motion_scene["canvas"]["width"] == 64


def test_facade_routes_blockout_mode(tmp_path):
    out = run_reconstruction_pipeline(
        source=_image_source(tmp_path),
        settings=ReconstructionSettings(mode="blockout", provider="fake", segmentation_provider="fake"),
        provider=FakeReconstructionProvider(grid_size=64),
        input_root=tmp_path,
    )
    assert "blockout_object" in _roles(out.motion_scene)


def test_facade_routes_hybrid_and_adds_reference(tmp_path):
    out = run_reconstruction_pipeline(
        source=_image_source(tmp_path),
        settings=ReconstructionSettings(mode="hybrid", provider="fake", segmentation_provider="fake"),
        provider=FakeReconstructionProvider(grid_size=64),
        input_root=tmp_path,
        save_glb_fn=lambda *a, **k: Path(k["filepath"]).write_bytes(b"GLB") if k.get("filepath") else None,
    )
    assert out.summary["resolved_mode"] == "hybrid"
    assert "reference" in _roles(out.motion_scene)


def test_legacy_layout_mode_stays_mo_ge_only(tmp_path):
    # A workflow saved as "layout" before the semantic rework must not suddenly
    # require a SAM3 checkpoint.
    out = run_reconstruction_pipeline(
        source=_image_source(tmp_path),
        settings=ReconstructionSettings(mode="layout", provider="fake"),
        provider=FakeReconstructionProvider(grid_size=64),
        input_root=tmp_path,
        save_glb_fn=lambda *a, **k: Path(k["filepath"]).write_bytes(b"GLB") if k.get("filepath") else None,
    )
    assert "environment" in _roles(out.motion_scene)
    assert "blockout_object" not in _roles(out.motion_scene)


def test_depth_mesh_path_unchanged(tmp_path):
    out = run_reconstruction_pipeline(
        source=_image_source(tmp_path),
        settings=ReconstructionSettings(mode="geometry", provider="fake"),
        provider=FakeReconstructionProvider(grid_size=64),
        input_root=tmp_path,
        save_glb_fn=lambda *a, **k: Path(k["filepath"]).write_bytes(b"GLB") if k.get("filepath") else None,
    )
    # Depth-mesh scene keeps its environment role, no blockout objects.
    assert "environment" in _roles(out.motion_scene)
    assert "blockout_object" not in _roles(out.motion_scene)


def test_segmentation_none_is_a_hard_error_not_synthetic_objects(tmp_path):
    import pytest

    from omnicam.reconstruction.errors import ReconRequestInvalidError

    with pytest.raises(ReconRequestInvalidError, match="segmentation"):
        run_reconstruction_pipeline(
            source=_image_source(tmp_path),
            settings=ReconstructionSettings(
                mode="blockout", provider="fake", segmentation_provider="none"
            ),
            provider=FakeReconstructionProvider(grid_size=64),
            input_root=tmp_path,
        )


def test_blockout_cache_invalidates_when_segmentation_checkpoint_changes(tmp_path):
    from omnicam.reconstruction.pipelines.base import stage_cache_version

    settings_a = ReconstructionSettings(mode="blockout", provider="fake", sam3_checkpoint="a.safetensors")
    settings_b = ReconstructionSettings(mode="blockout", provider="fake", sam3_checkpoint="b.safetensors")
    geo = FakeReconstructionProvider(grid_size=64)

    class _Seg:
        provider_id = "comfy_sam3"
        adapter_version = "1"

        def identity_token(self, settings):
            return f"sam3::{settings.sam3_checkpoint}"

    va = stage_cache_version(geo, settings_a, segmentation_provider=_Seg())
    vb = stage_cache_version(geo, settings_b, segmentation_provider=_Seg())
    assert va != vb
    # geometry-only version is unchanged between the two (only segmentation moved)
    assert va.split("|")[0] == vb.split("|")[0]
