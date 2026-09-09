"""semantic class -> unified catalog -> AssetDefinition -> AssetPlacement."""

from __future__ import annotations

import json

from omnicam.assets.catalog import load_catalog
from omnicam.assets.reconstruction_bridge import (
    placement_from_definition,
    resolve_semantic_class,
)
from omnicam.assets.rig import REQUIRED_JOINTS
from omnicam.assets.storage import ensure_library_tree, user_catalog_path

_COMPLETE_MAP = {joint: f"Bone_{joint}" for joint in REQUIRED_JOINTS}


def _catalog(tmp_path, rows):
    ensure_library_tree(tmp_path)
    user_catalog_path(tmp_path).write_text(json.dumps({"assets": rows}), encoding="utf-8")
    return load_catalog(tmp_path, include_legacy=False)


def test_resolve_prefers_a_user_row_over_the_shipped_default(tmp_path):
    catalog = _catalog(tmp_path, [
        {"id": "omnicam.prop.mychair", "name": "My Chair", "kind": "prop", "file": "props/mychair.glb", "tags": ["chair"]},
    ])
    hit = resolve_semantic_class(catalog, "chair")
    assert hit is not None
    assert hit.id == "omnicam.prop.mychair"
    assert hit.source == "user"


def test_person_prefers_a_rigged_character_over_a_static_prop(tmp_path):
    catalog = _catalog(tmp_path, [
        {"id": "omnicam.prop.statue", "name": "Statue", "kind": "prop", "file": "props/statue.glb", "tags": ["person"]},
        {"id": "omnicam.character.walker", "name": "Walker", "kind": "character", "file": "characters/walker.glb",
         "tags": ["person"], "rig": {"profile": "omnicam_humanoid_v1", "bone_map": _COMPLETE_MAP}},
    ])
    hit = resolve_semantic_class(catalog, "person")
    assert hit.id == "omnicam.character.walker"
    placement = placement_from_definition(
        hit, position=(0, 0, 0), rotation=(0, 30, 0), size=(0.6, 1.8, 0.4),
        object_id="det_1", semantic_class="person", confidence=0.8,
    )
    assert placement.asset_kind == "character"
    assert placement.asset_id == "omnicam.character.walker"
    assert placement.asset_ref == "omnicam/library/characters/walker.glb [input]"
    assert set(placement.tags) == {"reconstruction", "person"}


def test_a_person_without_a_rigged_asset_stays_a_prop(tmp_path):
    catalog = _catalog(tmp_path, [
        {"id": "omnicam.character.posed", "name": "Posed Human", "kind": "character", "file": "characters/posed.glb",
         "tags": ["person"], "rig": {"profile": "omnicam_humanoid_v1", "bone_map": {"pelvis": "Hips"}}},
    ])
    hit = resolve_semantic_class(catalog, "person")
    placement = placement_from_definition(
        hit, position=(0, 0, 0), rotation=(0, 0, 0), size=(0.6, 1.8, 0.4),
        object_id="det_2", semantic_class="person",
    )
    assert placement.asset_kind == "prop"  # incomplete rig -> not a character


def test_factual_tags_only_never_editorial_roles(tmp_path):
    catalog = _catalog(tmp_path, [
        {"id": "omnicam.prop.chair_hero", "name": "Chair", "kind": "prop", "file": "props/chair.glb",
         "tags": ["chair", "hero", "foreground"]},
    ])
    hit = resolve_semantic_class(catalog, "chair")
    placement = placement_from_definition(
        hit, position=(1, 0, 2), rotation=(0, 0, 0), size=(0.5, 0.9, 0.5), object_id="c1", semantic_class="chair",
    )
    assert list(placement.tags) == ["reconstruction", "chair"]
    assert "hero" not in placement.tags


def test_no_match_returns_none(tmp_path):
    catalog = _catalog(tmp_path, [
        {"id": "omnicam.prop.chair", "name": "Chair", "kind": "prop", "file": "props/chair.glb", "tags": ["chair"]},
    ])
    assert resolve_semantic_class(catalog, "helicopter") is None
    assert resolve_semantic_class(catalog, "") is None
