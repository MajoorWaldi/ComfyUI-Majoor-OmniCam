"""Merged catalog: default load, filters, pagination, precedence, bounds."""

from __future__ import annotations

import json

import pytest

from omnicam.assets.catalog import MAX_PAGE_LIMIT, Catalog, load_catalog
from omnicam.assets.errors import AssetCatalogInvalidError, AssetNotFoundError
from omnicam.assets.storage import ensure_library_tree, user_catalog_path


def _write_user_catalog(tmp_path, rows):
    ensure_library_tree(tmp_path)
    user_catalog_path(tmp_path).write_text(json.dumps({"assets": rows}), encoding="utf-8")


def test_default_catalog_loads_and_is_self_consistent(tmp_path):
    catalog = load_catalog(tmp_path, include_legacy=False)
    assert len(catalog) >= 8
    kinds = catalog.kinds()
    assert kinds["character"] >= 3
    # Every shipped character row carries a rig and a licence.
    for definition in catalog.all():
        if definition.is_character:
            assert definition.has_rig
        assert definition.license.get("spdx")


def test_get_and_find(tmp_path):
    catalog = load_catalog(tmp_path, include_legacy=False)
    assert catalog.get("omnicam.character.human_neutral_01").name == "Human Neutral 01"
    assert catalog.find("nope") is None
    with pytest.raises(AssetNotFoundError):
        catalog.get("nope")


def test_list_filters_by_kind_tag_and_search(tmp_path):
    catalog = load_catalog(tmp_path, include_legacy=False)
    only_chars = catalog.list(kind="character")
    assert only_chars["total"] == catalog.kinds()["character"]
    assert all(item["kind"] == "character" for item in only_chars["items"])

    tagged = catalog.list(tag="human")
    assert tagged["total"] >= 3

    searched = catalog.list(search="sedan")
    assert searched["total"] == 1
    assert searched["items"][0]["id"] == "omnicam.vehicle.sedan_01"


def test_list_pagination_clamps_limit_and_offset(tmp_path):
    catalog = load_catalog(tmp_path, include_legacy=False)
    page = catalog.list(offset=-5, limit=99999)
    assert page["offset"] == 0
    assert page["limit"] == MAX_PAGE_LIMIT
    first_two = catalog.list(limit=2)
    assert len(first_two["items"]) == 2
    assert first_two["total"] == len(catalog)


def test_user_catalog_overrides_default_by_id(tmp_path):
    _write_user_catalog(
        tmp_path,
        [{
            "id": "omnicam.character.human_neutral_01",
            "name": "My Override",
            "kind": "prop",
            "file": "props/override.glb",
        }],
    )
    catalog = load_catalog(tmp_path, include_legacy=False)
    row = catalog.get("omnicam.character.human_neutral_01")
    assert row.name == "My Override"
    assert row.kind == "prop"
    assert row.source == "user"
    # Overriding an existing id must not add a second row.
    assert catalog.ids().count("omnicam.character.human_neutral_01") == 1


def test_duplicate_id_within_one_source_is_fatal(tmp_path):
    _write_user_catalog(
        tmp_path,
        [
            {"id": "omnicam.prop.dup", "name": "A", "kind": "prop", "file": "props/a.glb"},
            {"id": "omnicam.prop.dup", "name": "B", "kind": "prop", "file": "props/b.glb"},
        ],
    )
    with pytest.raises(AssetCatalogInvalidError):
        load_catalog(tmp_path, include_legacy=False)


def test_invalid_user_catalog_shape_is_reported(tmp_path):
    ensure_library_tree(tmp_path)
    user_catalog_path(tmp_path).write_text(json.dumps({"assets": {"not": "a list"}}), encoding="utf-8")
    with pytest.raises(AssetCatalogInvalidError):
        load_catalog(tmp_path, include_legacy=False)


def test_missing_user_catalog_is_not_an_error(tmp_path):
    catalog = load_catalog(tmp_path, include_legacy=False)
    assert len(catalog) >= 8


def test_catalog_entry_ceiling(tmp_path, monkeypatch):
    monkeypatch.setattr("omnicam.assets.catalog.MAX_CATALOG_ENTRIES", 3)
    with pytest.raises(AssetCatalogInvalidError):
        Catalog.load(tmp_path, include_legacy=False)
