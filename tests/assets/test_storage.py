"""Managed library layout and path confinement."""

from __future__ import annotations

import pytest

from omnicam.assets.errors import AssetError
from omnicam.assets.storage import (
    LIBRARY_FOLDERS,
    asset_file_path,
    ensure_library_tree,
    resolve_library_root,
    resolve_within,
    user_catalog_path,
)


def test_resolve_library_root_accepts_input_dir_or_library_dir(tmp_path):
    from_input = resolve_library_root(tmp_path)
    assert from_input == (tmp_path / "omnicam" / "library").resolve()
    # Passing the library dir itself is idempotent.
    assert resolve_library_root(from_input) == from_input


def test_user_catalog_path_is_under_library_root(tmp_path):
    assert user_catalog_path(tmp_path) == resolve_library_root(tmp_path) / "catalog.json"


def test_ensure_library_tree_creates_every_category_folder(tmp_path):
    root = ensure_library_tree(tmp_path)
    assert root.is_dir()
    for folder in LIBRARY_FOLDERS:
        assert (root / folder).is_dir()


def test_resolve_within_allows_descendants(tmp_path):
    root = resolve_library_root(tmp_path)
    assert resolve_within(root, "characters/human_01.glb") == root / "characters" / "human_01.glb"


@pytest.mark.parametrize("escape", ["../secret", "../../etc/passwd", "characters/../../out"])
def test_resolve_within_rejects_escapes(tmp_path, escape):
    root = resolve_library_root(tmp_path)
    with pytest.raises(AssetError):
        resolve_within(root, escape)


def test_asset_file_path_is_confined(tmp_path):
    path = asset_file_path("props/chair_01.glb", tmp_path)
    assert path == resolve_library_root(tmp_path) / "props" / "chair_01.glb"
    with pytest.raises(AssetError):
        asset_file_path("../../escape.glb", tmp_path)
