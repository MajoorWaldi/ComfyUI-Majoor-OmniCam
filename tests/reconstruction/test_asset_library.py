"""Blockout asset-library retrieval: manifest loading, gating, placement."""

from __future__ import annotations

import json

import pytest

from omnicam.reconstruction.asset_library import (
    AssetEntry,
    load_asset_library,
    resolve_library_root,
    resolve_placements,
)
from omnicam.reconstruction.asset_library.poses import select_pose
from omnicam.reconstruction.blockout.types import AxisConfidence, BlockoutObject
from omnicam.reconstruction.errors import (
    ReconAssetLibraryInvalidError,
    ReconAssetLibraryUnavailableError,
)

_MANIFEST = {
    "version": 1,
    "name": "test kit",
    "assets": {
        "chair": {"category": "interior", "glb": "interior/chair.glb"},
        "lamp": {"category": "interior", "glb": "interior/lamp.glb", "fit": "upright"},
        "rock": {"category": "exterior", "glb": "exterior/rock.glb", "fit": "uniform"},
        "person": {
            "category": "human",
            "fit": "upright",
            "poses": {"standing": "human/standing.glb", "sitting": "human/sitting.glb"},
        },
    },
}


def _write_library(root, *, manifest=None, files=("interior/chair.glb", "interior/lamp.glb",
                                                 "exterior/rock.glb", "human/standing.glb",
                                                 "human/sitting.glb")):
    root.mkdir(parents=True, exist_ok=True)
    (root / "library.json").write_text(json.dumps(manifest or _MANIFEST), encoding="utf-8")
    for rel in files:
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b"glTF\x02\x00\x00\x00")  # not a real GLB; existence is all that is checked
    return root


def _box(object_id="chair_1", semantic="chair", size=(0.6, 1.1, 0.6), yaw=30.0):
    return BlockoutObject(
        object_id=object_id, label=semantic, semantic_class=semantic, primitive="cube",
        position=(1.0, 0.55, -2.0), rotation=(0.0, yaw, 0.0), size=size, confidence=0.7,
        axis_confidence=AxisConfidence(0.8, 0.8, 0.4, 0.6),
    )


def test_load_and_status_gate_on_every_referenced_glb(tmp_path):
    root = _write_library(tmp_path / "lib")
    lib = load_asset_library(root)
    assert lib.entry_count == 4
    assert lib.categories() == {"interior": 2, "exterior": 1, "human": 1}
    available, reason = lib.status()
    assert available and reason == ""

    # Drop one file -> unavailable with an actionable reason.
    (root / "human" / "sitting.glb").unlink()
    available, reason = load_asset_library(root).status()
    assert not available
    assert "human/sitting.glb" in reason and "fetch_blockout_library" in reason


def test_missing_or_malformed_manifest_is_a_hard_error(tmp_path):
    with pytest.raises(ReconAssetLibraryInvalidError):
        load_asset_library(tmp_path / "empty")

    bad = tmp_path / "bad"
    bad.mkdir()
    (bad / "library.json").write_text("{ not json", encoding="utf-8")
    with pytest.raises(ReconAssetLibraryInvalidError):
        load_asset_library(bad)

    noassets = tmp_path / "noassets"
    noassets.mkdir()
    (noassets / "library.json").write_text('{"version": 1, "assets": {}}', encoding="utf-8")
    with pytest.raises(ReconAssetLibraryInvalidError):
        load_asset_library(noassets)


def test_entry_validation_rejects_bad_rows():
    with pytest.raises(ValueError, match="category"):
        AssetEntry.from_dict("x", {"category": "outer-space", "glb": "a.glb"})
    with pytest.raises(ValueError, match="poses"):
        AssetEntry.from_dict("person", {"category": "human"})
    with pytest.raises(ValueError, match="glb"):
        AssetEntry.from_dict("chair", {"category": "interior"})


def test_resolve_scales_stretch_upright_uniform(tmp_path):
    lib = load_asset_library(_write_library(tmp_path / "lib"))

    chair = lib.resolve("chair", position=(1, 0.55, -2), rotation=(0, 30, 0),
                        size=(0.6, 1.1, 0.6), object_id="chair_1", confidence=0.7)
    assert chair is not None
    assert chair.asset_ref == "majoor_omnicam/blockout_library/interior/chair.glb [input]"
    assert chair.size == pytest.approx((0.6, 1.1, 0.6))  # stretch = box
    assert chair.rotation == pytest.approx((0.0, 30.0, 0.0))
    assert chair.position == pytest.approx((1.0, 0.55, -2.0))
    assert chair.source_object_id == "chair_1"

    lamp = lib.resolve("lamp", position=(0, 0, 0), rotation=(0, 0, 0),
                       size=(0.3, 1.6, 0.4), object_id="lamp_1")
    assert lamp.size == pytest.approx((1.6, 1.6, 1.6))  # upright -> height drives

    rock = lib.resolve("rock", position=(0, 0, 0), rotation=(0, 0, 0),
                       size=(2.0, 0.8, 1.4), object_id="rock_1")
    assert rock.size == pytest.approx((0.8, 0.8, 0.8))  # uniform -> min extent


def test_resolve_unknown_class_is_none(tmp_path):
    lib = load_asset_library(_write_library(tmp_path / "lib"))
    assert lib.resolve("giraffe", position=(0, 0, 0), rotation=(0, 0, 0),
                       size=(1, 1, 1), object_id="g") is None


def test_human_pose_is_picked_from_the_box_shape(tmp_path):
    lib = load_asset_library(_write_library(tmp_path / "lib"))
    entry = lib.entry_for("person")

    assert select_pose(entry, (0.5, 1.8, 0.4)) == "standing"
    assert select_pose(entry, (0.6, 1.0, 0.7)) == "sitting"

    tall = lib.resolve("person", position=(0, 0.9, 0), rotation=(0, 0, 0),
                       size=(0.5, 1.8, 0.4), object_id="p1")
    assert tall.pose == "standing"
    assert tall.asset_ref.endswith("human/standing.glb [input]")

    seated = lib.resolve("person", position=(0, 0.5, 0), rotation=(0, 0, 0),
                         size=(0.6, 1.0, 0.7), object_id="p2")
    assert seated.pose == "sitting"


def test_resolve_placements_orders_caps_and_skips(tmp_path):
    root = _write_library(tmp_path / "lib")
    lib = load_asset_library(root)
    objects = [
        _box("chair_1", "chair"),
        _box("desk_1", "desk"),           # not in the library -> skipped
        _box("lamp_1", "lamp", size=(0.3, 1.6, 0.3)),
    ]
    placements = resolve_placements(objects, lib)
    assert [p.source_object_id for p in placements] == ["chair_1", "lamp_1"]

    assert resolve_placements(objects * 40, lib, max_placements=3) == placements[:3] or len(
        resolve_placements(objects * 40, lib, max_placements=3)
    ) == 3


def test_identity_token_tracks_the_manifest(tmp_path):
    root = _write_library(tmp_path / "lib")
    before = load_asset_library(root).identity_token()

    manifest = json.loads((root / "library.json").read_text())
    manifest["assets"]["chair"]["glb"] = "interior/chair_v2.glb"
    (root / "library.json").write_text(json.dumps(manifest), encoding="utf-8")
    (root / "interior" / "chair_v2.glb").write_bytes(b"glTF")

    assert load_asset_library(root).identity_token() != before


def test_resolve_library_root_accepts_input_dir_or_library_dir(tmp_path):
    from_input = resolve_library_root(input_root=tmp_path)
    assert from_input == (tmp_path / "majoor_omnicam" / "blockout_library").resolve()

    lib_dir = tmp_path / "majoor_omnicam" / "blockout_library"
    assert resolve_library_root(input_root=lib_dir) == lib_dir.resolve()


def test_facade_raises_when_assets_requested_but_library_absent(tmp_path):
    from omnicam.reconstruction.pipeline import _resolve_asset_library
    from omnicam.reconstruction.settings import ReconstructionSettings

    off = ReconstructionSettings(mode="blockout", provider="fake", blockout_assets="off")
    assert _resolve_asset_library(off, tmp_path) == (None, "off")

    on = ReconstructionSettings(mode="blockout", provider="fake", blockout_assets="proxy")
    with pytest.raises(ReconAssetLibraryInvalidError):
        _resolve_asset_library(on, tmp_path)  # no library.json under tmp_path

    # Present manifest but missing GLBs -> the softer "unavailable" error.
    _write_library(tmp_path / "majoor_omnicam" / "blockout_library", files=())
    with pytest.raises(ReconAssetLibraryUnavailableError):
        _resolve_asset_library(on, tmp_path)


def test_shipped_default_manifest_is_valid_and_kenney_cc0():
    import json
    from pathlib import Path

    from omnicam.reconstruction.asset_library.library import AssetLibrary

    path = Path(__file__).resolve().parents[2] / "omnicam" / "reconstruction" / "asset_library" / "library.default.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    lib = AssetLibrary(path.parent, data)  # parses every entry or raises
    assert lib.entry_count >= 20
    assert set(lib.categories()) <= {"interior", "exterior", "human"}
    assert "chair" in lib.entries and "person" in lib.entries
    assert lib.entries["person"].category == "human" and lib.entries["person"].poses
    assert "CC0" in data.get("license", "")
    # Every glb path is repo-relative and lands in a category folder.
    for entry in lib.entries.values():
        for rel in entry.glb_candidates():
            assert rel.split("/")[0] in {"interior", "exterior", "human"}
            assert not rel.startswith(("/", "..")) and ":" not in rel
