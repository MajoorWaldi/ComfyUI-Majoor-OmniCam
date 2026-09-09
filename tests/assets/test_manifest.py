"""User-catalog mutations: register / patch (copy-on-write) / delete."""

from __future__ import annotations

import json

import pytest

from omnicam.assets import manifest
from omnicam.assets.catalog import load_catalog
from omnicam.assets.errors import AssetCatalogInvalidError, AssetError, AssetNotFoundError
from omnicam.assets.storage import user_catalog_path

_ROW = {"id": "omnicam.prop.widget", "name": "Widget", "kind": "prop", "file": "props/widget.glb"}


def test_register_then_load_sees_a_user_row(tmp_path):
    manifest.register_asset(tmp_path, dict(_ROW))
    catalog = load_catalog(tmp_path)
    row = catalog.get("omnicam.prop.widget")
    assert row.source == "user"
    assert row.name == "Widget"
    # persisted file has no derived 'source' key
    stored = json.loads(user_catalog_path(tmp_path).read_text(encoding="utf-8"))
    assert stored["assets"][0].get("source") is None


def test_register_replaces_by_id(tmp_path):
    manifest.register_asset(tmp_path, dict(_ROW))
    manifest.register_asset(tmp_path, {**_ROW, "name": "Widget MkII"})
    catalog = load_catalog(tmp_path)
    assert catalog.get("omnicam.prop.widget").name == "Widget MkII"
    assert len(manifest.read_user_catalog(tmp_path)) == 1


def test_patch_is_copy_on_write_from_a_builtin(tmp_path):
    # human_neutral_01 ships in the default catalog only.
    manifest.patch_asset(tmp_path, "omnicam.character.human_neutral_01", {"tags": ["hero"]})
    catalog = load_catalog(tmp_path)
    row = catalog.get("omnicam.character.human_neutral_01")
    assert row.source == "user"
    assert row.tags == ["hero"]
    # rig survived the round trip through the user file
    assert row.has_rig


def test_patch_rejects_unknown_field_and_unknown_id(tmp_path):
    with pytest.raises(AssetCatalogInvalidError):
        manifest.patch_asset(tmp_path, "omnicam.character.human_neutral_01", {"id": "x"})
    with pytest.raises(AssetNotFoundError):
        manifest.patch_asset(tmp_path, "omnicam.prop.ghost", {"name": "Ghost"})


def test_delete_removes_a_user_row(tmp_path):
    manifest.register_asset(tmp_path, dict(_ROW))
    manifest.delete_asset(tmp_path, "omnicam.prop.widget")
    assert manifest.read_user_catalog(tmp_path) == []


def test_delete_builtin_is_refused_delete_ghost_is_404(tmp_path):
    with pytest.raises(AssetError) as builtin:
        manifest.delete_asset(tmp_path, "omnicam.character.human_neutral_01")
    assert builtin.value.code == "ASSET_CATALOG_INVALID"
    with pytest.raises(AssetNotFoundError):
        manifest.delete_asset(tmp_path, "omnicam.prop.ghost")


def test_write_rejects_duplicate_ids(tmp_path):
    with pytest.raises(AssetCatalogInvalidError):
        manifest._write_rows(tmp_path, [dict(_ROW), dict(_ROW)])
