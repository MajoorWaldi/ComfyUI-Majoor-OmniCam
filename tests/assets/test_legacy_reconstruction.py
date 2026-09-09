"""The reconstruction blockout library as a read-only 'legacy' catalog source."""

from __future__ import annotations

import json

import pytest

from omnicam.assets.catalog import load_catalog
from omnicam.assets.legacy_reconstruction import iter_legacy_definitions, legacy_asset_id
from omnicam.assets.storage import ensure_library_tree, user_catalog_path

_BLOCKOUT_MANIFEST = {
    "version": 1,
    "name": "test blockout kit",
    "assets": {
        "chair": {"category": "interior", "glb": "interior/chair.glb", "base_size": [0.5, 0.9, 0.5]},
        "car": {"category": "exterior", "glb": "exterior/sedan.glb", "fit": "stretch"},
        "person": {
            "category": "human",
            "fit": "upright",
            "poses": {"standing": "human/standing.glb"},
        },
    },
}


@pytest.fixture
def blockout_input(tmp_path):
    root = tmp_path / "majoor_omnicam" / "blockout_library"
    root.mkdir(parents=True)
    (root / "library.json").write_text(json.dumps(_BLOCKOUT_MANIFEST), encoding="utf-8")
    return tmp_path


def test_iter_legacy_definitions_maps_every_entry(blockout_input):
    defs = {d.id: d for d in iter_legacy_definitions(blockout_input)}
    assert set(defs) == {
        legacy_asset_id("chair"),
        legacy_asset_id("car"),
        legacy_asset_id("person"),
    }
    chair = defs[legacy_asset_id("chair")]
    assert chair.source == "legacy"
    assert chair.kind == "prop"
    assert chair.file == "interior/chair.glb"
    assert "reconstruction" in chair.tags and "chair" in chair.tags
    # No editorial role tags are ever invented.
    assert "hero" not in chair.tags


def test_legacy_person_is_a_prop_not_a_character(blockout_input):
    person = next(
        d for d in iter_legacy_definitions(blockout_input) if d.id == legacy_asset_id("person")
    )
    assert person.kind == "prop"
    assert not person.is_character
    assert "person" in person.tags


def test_missing_blockout_library_yields_no_legacy_rows(tmp_path):
    assert iter_legacy_definitions(tmp_path) == []


def test_catalog_precedence_user_over_legacy_over_default(blockout_input):
    ensure_library_tree(blockout_input)
    user_catalog_path(blockout_input).write_text(
        json.dumps({"assets": [{
            "id": legacy_asset_id("chair"),
            "name": "User Chair",
            "kind": "prop",
            "file": "props/user_chair.glb",
        }]}),
        encoding="utf-8",
    )
    catalog = load_catalog(blockout_input, include_legacy=True)
    # legacy rows are present alongside the shipped default rows
    assert catalog.find(legacy_asset_id("car")) is not None
    assert catalog.find("omnicam.character.human_neutral_01") is not None
    # the user row wins the shared id
    chair = catalog.get(legacy_asset_id("chair"))
    assert chair.name == "User Chair"
    assert chair.source == "user"
