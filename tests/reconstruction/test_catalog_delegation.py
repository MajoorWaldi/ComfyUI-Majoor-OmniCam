"""The reconstruction resolver delegating to the unified asset catalog."""

from __future__ import annotations

import json

from omnicam.assets.catalog import load_catalog
from omnicam.assets.storage import ensure_library_tree, resolve_library_root, user_catalog_path
from omnicam.reconstruction.asset_library import load_asset_library, resolve_placements
from omnicam.reconstruction.blockout.types import AxisConfidence, BlockoutObject

_MANIFEST = {
    "version": 1,
    "name": "test kit",
    "assets": {
        "chair": {"category": "interior", "glb": "interior/chair.glb", "base_size": [0.5, 0.9, 0.5]},
        "person": {"category": "human", "fit": "upright", "poses": {"standing": "human/standing.glb"}},
    },
}


def _blockout_lib(root):
    root.mkdir(parents=True, exist_ok=True)
    (root / "library.json").write_text(json.dumps(_MANIFEST), encoding="utf-8")
    for rel in ("interior/chair.glb", "human/standing.glb"):
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(b"glTF\x02\x00\x00\x00")
    return load_asset_library(root)


def _box(semantic="chair", confidence=0.8):
    return BlockoutObject(
        object_id=f"{semantic}_1", label=semantic, semantic_class=semantic, primitive="cube",
        position=(1.0, 0.45, -2.0), rotation=(0.0, 20.0, 0.0), size=(0.6, 0.95, 0.6), confidence=confidence,
        axis_confidence=AxisConfidence(0.8, 0.8, 0.5, 0.6),
    )


def _user_catalog(tmp_path, rows, *, with_files=()):
    ensure_library_tree(tmp_path)
    user_catalog_path(tmp_path).write_text(json.dumps({"assets": rows}), encoding="utf-8")
    for rel in with_files:
        path = resolve_library_root(tmp_path) / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b"glTF\x02\x00\x00\x00")
    return load_catalog(tmp_path, include_legacy=False)


def test_legacy_resolve_now_emits_factual_tags(tmp_path):
    lib = _blockout_lib(tmp_path / "blk")
    placement = lib.resolve("chair", position=(0, 0, 0), rotation=(0, 0, 0), size=(0.6, 0.95, 0.6), object_id="c1")
    assert tuple(placement.tags) == ("reconstruction", "chair")
    assert placement.asset_kind == "prop"
    human = lib.resolve("person", position=(0, 0, 0), rotation=(0, 0, 0), size=(0.6, 1.8, 0.4), object_id="p1")
    assert "person" in human.tags and human.asset_kind == "prop"  # a posed mesh, not a rig


def test_no_catalog_means_unchanged_legacy_behaviour(tmp_path):
    lib = _blockout_lib(tmp_path / "blk")
    placements = resolve_placements([_box("chair")], lib)
    assert len(placements) == 1
    assert placements[0].asset_id == ""  # legacy path sets no catalog id


def test_catalog_hit_with_an_existing_file_wins(tmp_path):
    lib = _blockout_lib(tmp_path / "blk")
    catalog = _user_catalog(
        tmp_path / "input",
        [{"id": "omnicam.prop.mychair", "name": "My Chair", "kind": "prop", "file": "props/mychair.glb", "tags": ["chair"]}],
        with_files=["props/mychair.glb"],
    )
    placements = resolve_placements([_box("chair")], lib, catalog=catalog, input_root=tmp_path / "input")
    assert len(placements) == 1
    p = placements[0]
    assert p.asset_id == "omnicam.prop.mychair"
    assert p.asset_ref == "omnicam/library/props/mychair.glb [input]"
    assert list(p.tags) == ["reconstruction", "chair"]


def test_catalog_hit_with_a_missing_file_falls_back_to_the_blockout_library(tmp_path):
    lib = _blockout_lib(tmp_path / "blk")
    catalog = _user_catalog(
        tmp_path / "input",
        [{"id": "omnicam.prop.ghostchair", "name": "Ghost Chair", "kind": "prop", "file": "props/ghost.glb", "tags": ["chair"]}],
    )  # no file written
    placements = resolve_placements([_box("chair")], lib, catalog=catalog, input_root=tmp_path / "input")
    assert len(placements) == 1
    assert placements[0].asset_id == ""  # fell back to the legacy library
    assert "blockout_library" in placements[0].asset_ref
