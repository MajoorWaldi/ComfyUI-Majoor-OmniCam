"""End-to-end single-image blockout pipeline with fakes (plan Task 13)."""

from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest
from PIL import Image

from omnicam.reconstruction.pipeline import run_reconstruction_pipeline
from omnicam.reconstruction.pipelines.single_blockout import run_single_blockout_pipeline
from omnicam.reconstruction.segmentation.fake import FakeSegmentationProvider
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import ReconstructionSource

from .fakes import FakeReconstructionProvider


def _module_available(name: str) -> bool:
    try:
        return importlib.util.find_spec(name) is not None
    except ModuleNotFoundError:
        return False


#: hybrid / depth-mesh routing builds a real dense mesh through
#: ``comfy.ldm.moge.geometry.triangulate_grid_mesh`` -- only present in a ComfyUI
#: checkout. The ``python-reconstruction`` lane has none, so skip there rather
#: than fail collection-adjacent with a bare ModuleNotFoundError.
requires_moge_mesh = pytest.mark.skipif(
    not _module_available("comfy.ldm.moge.geometry"),
    reason="needs comfy.ldm.moge.geometry (a ComfyUI checkout on sys.path)",
)


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


@requires_moge_mesh
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


@requires_moge_mesh
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


@requires_moge_mesh
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

    from omnicam.reconstruction.errors import ReconSegmentationUnavailableError

    with pytest.raises(ReconSegmentationUnavailableError, match="segmentation") as exc:
        run_reconstruction_pipeline(
            source=_image_source(tmp_path),
            settings=ReconstructionSettings(
                mode="blockout", provider="fake", segmentation_provider="none"
            ),
            provider=FakeReconstructionProvider(grid_size=64),
            input_root=tmp_path,
        )
    assert exc.value.to_dict()["error"]["code"] == "RECON_SEGMENTATION_UNAVAILABLE"


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


def test_facade_rejects_vggt_provider_outside_scan_mode(tmp_path):
    """Regression: a job with provider='vggt' but a single-view mode used to
    crash with AttributeError deep in run_depth_mesh_pipeline."""
    import pytest

    from omnicam.reconstruction.errors import ReconRequestInvalidError
    from omnicam.reconstruction.providers.vggt import VggtProvider

    for mode in ("geometry", "depth_mesh", "blockout", "hybrid"):
        with pytest.raises(ReconRequestInvalidError, match="Scan mode"):
            run_reconstruction_pipeline(
                source=_image_source(tmp_path),
                settings=ReconstructionSettings(mode=mode, provider="vggt"),
                provider=VggtProvider(),
                input_root=tmp_path,
            )


def test_facade_rejects_single_view_provider_in_scan_mode(tmp_path):
    import pytest

    from omnicam.reconstruction.errors import ReconRequestInvalidError

    class _MoGe:
        provider_id = "comfy_moge"

    with pytest.raises(ReconRequestInvalidError, match="multi-view"):
        run_reconstruction_pipeline(
            source=_image_source(tmp_path),
            settings=ReconstructionSettings(mode="scan", provider="comfy_moge"),
            provider=_MoGe(),
            input_root=tmp_path,
        )


def _fixture_library(input_root: Path, *, with_files=True):
    import json

    root = input_root / "majoor_omnicam" / "blockout_library"
    root.mkdir(parents=True, exist_ok=True)
    manifest = {
        "version": 1,
        "name": "fixture",
        "assets": {
            "chair": {"category": "interior", "glb": "interior/chair.glb"},
            "table": {"category": "interior", "glb": "interior/table.glb"},
        },
    }
    (root / "library.json").write_text(json.dumps(manifest), encoding="utf-8")
    if with_files:
        for rel in ("interior/chair.glb", "interior/table.glb"):
            p = root / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(b"glTF")
    return root


def test_blockout_assets_proxy_adds_glb_objects(tmp_path):
    _fixture_library(tmp_path)
    out = run_reconstruction_pipeline(
        source=_image_source(tmp_path),
        settings=ReconstructionSettings(
            mode="blockout", provider="fake", segmentation_provider="fake",
            semantic_labels=("chair", "table"), blockout_assets="proxy",
        ),
        provider=FakeReconstructionProvider(grid_size=64),
        input_root=tmp_path,
    )
    objs = out.motion_scene["objects"]
    proxies = [o for o in objs if o.get("reconstruction", {}).get("role") == "asset_proxy"]
    assert proxies, "at least one library prop was placed"
    assert all(o["type"] == "glb" for o in proxies)
    assert all(o["asset"].startswith("majoor_omnicam/blockout_library/") for o in proxies)
    assert out.summary["provider_summary"]["asset_mode"] == "proxy"
    # proxy keeps the fitted boxes.
    assert any(o.get("reconstruction", {}).get("role") == "blockout_object" and o["enabled"]
               for o in objs)


def test_blockout_assets_requested_but_library_missing_raises(tmp_path):
    import pytest

    from omnicam.reconstruction.errors import ReconAssetLibraryInvalidError

    with pytest.raises(ReconAssetLibraryInvalidError):
        run_reconstruction_pipeline(
            source=_image_source(tmp_path),
            settings=ReconstructionSettings(
                mode="blockout", provider="fake", segmentation_provider="fake",
                blockout_assets="replace",
            ),
            provider=FakeReconstructionProvider(grid_size=64),
            input_root=tmp_path,
        )


def test_scene_scale_keeps_floor_camera_and_objects_in_one_frame(tmp_path):
    """F06: scene_scale is one similarity; the floor still lands at Y=0 and
    objects still rest on it at any scale."""

    def floor_y(scene):
        ground = next(
            (o for o in scene["objects"] if o.get("reconstruction", {}).get("role") == "room"),
            None,
        )
        return None if ground is None else ground["position"][1]

    def lowest_object_bottom(scene):
        vals = []
        for o in scene["objects"]:
            if o.get("reconstruction", {}).get("role") == "blockout_object":
                vals.append(o["position"][1] - o["size"][1] / 2.0)
        return min(vals) if vals else None

    outs = {}
    for s in (0.5, 1.0, 2.0):
        outs[s] = run_reconstruction_pipeline(
            source=_image_source(tmp_path),
            settings=ReconstructionSettings(
                mode="blockout", provider="fake", segmentation_provider="fake",
                semantic_labels=("chair",), scene_scale=s,
            ),
            provider=FakeReconstructionProvider(grid_size=64),
            input_root=tmp_path,
        ).motion_scene

    for s, scene in outs.items():
        fy = floor_y(scene)
        assert fy is None or abs(fy) < 0.1, (s, fy)
        bottom = lowest_object_bottom(scene)
        assert bottom is None or bottom > -0.6, (s, bottom)  # not sunk far below the grid


@requires_moge_mesh
def test_hybrid_reference_mesh_carries_the_scene_transform(tmp_path):
    """F07: the dense reference is placed with the pipeline's own
    scale/level/recentre, not an identity transform."""
    out = run_reconstruction_pipeline(
        source=_image_source(tmp_path),
        settings=ReconstructionSettings(
            mode="hybrid", provider="fake", segmentation_provider="fake",
            semantic_labels=("chair",), scene_scale=2.0,
        ),
        provider=FakeReconstructionProvider(grid_size=64),
        input_root=tmp_path,
    )
    ref = next(o for o in out.motion_scene["objects"] if o["id"] == "reconstruction_reference_mesh")
    assert ref["size"] == [2.0, 2.0, 2.0]  # scene_scale, not [1,1,1]


def test_cross_label_duplicate_proxies_and_background_blobs_are_dropped():
    """Real SAM3 gives tv/monitor/door/window (or person/armchair) overlapping
    masks on one surface -> collapsed 3D proxies. The pipeline keeps only the
    most confident of a near-identical cluster, and rejects a proxy that is big
    in every axis (a mis-segmented wall)."""
    import numpy as np

    from omnicam.reconstruction.blockout.types import AxisConfidence, BlockoutObject
    from omnicam.reconstruction.pipelines.single_blockout import (
        _dedupe_and_bound_objects,
        _finite_extent,
    )

    def obj(oid, sem, pos, size, conf):
        return BlockoutObject(
            object_id=oid, label=sem, semantic_class=sem, primitive="cube",
            position=tuple(pos), rotation=(0.0, 0.0, 0.0), size=tuple(size), confidence=conf,
            axis_confidence=AxisConfidence(conf, conf, conf, conf),
            source_instance_ids=[f"i_{oid}"],
        )

    # a room ~4 units across
    pts = np.random.default_rng(0).uniform([-2, 0, -2], [2, 2.5, 2], (4000, 3)).astype(np.float32)
    extent = _finite_extent(pts.reshape(1, -1, 3))
    assert extent > 0

    objs = [
        obj("tv", "television", [-0.2, 1.5, -1.0], [4.3, 2.6, 5.0], 0.54),   # background blob
        obj("person", "person", [-0.7, 1.1, 0.5], [0.34, 1.26, 0.71], 0.85),  # keep
        obj("armchair", "armchair", [-0.7, 1.1, 0.54], [0.34, 1.23, 0.72], 0.74),  # dup of person
        obj("bottle", "bottle", [-1.0, 0.85, 0.8], [0.07, 0.15, 0.12], 0.69),  # keep
        obj("lamp", "lamp", [-1.0, 0.85, 0.8], [0.07, 0.16, 0.12], 0.54),  # dup of bottle
        obj("plant", "plant", [1.0, 0.8, 1.5], [0.24, 0.28, 0.53], 0.70),  # keep
    ]
    kept = _dedupe_and_bound_objects(objs, scene_extent=extent)
    ids = [o.object_id for o in kept]
    assert ids == ["person", "bottle", "plant"], ids
    # the merged duplicates' instance ids are folded into the survivor
    person = next(o for o in kept if o.object_id == "person")
    assert set(person.source_instance_ids) == {"i_person", "i_armchair"}


def test_dedupe_keeps_two_genuinely_separate_objects_of_the_same_class():
    from omnicam.reconstruction.blockout.types import AxisConfidence, BlockoutObject
    from omnicam.reconstruction.pipelines.single_blockout import _dedupe_and_bound_objects

    def chair(oid, x):
        return BlockoutObject(
            object_id=oid, label="chair", semantic_class="chair", primitive="cube",
            position=(x, 0.5, 0.0), rotation=(0.0, 0.0, 0.0), size=(0.5, 1.0, 0.5), confidence=0.7,
            axis_confidence=AxisConfidence(0.7, 0.7, 0.7, 0.7),
        )

    kept = _dedupe_and_bound_objects([chair("a", 0.0), chair("b", 2.0)], scene_extent=8.0)
    assert [o.object_id for o in kept] == ["a", "b"]
