"""Installer transaction: atomic copy, catalog registration, rollback."""

from __future__ import annotations

import dataclasses
import zipfile

import pytest

from omnicam.assets import manifest
from omnicam.assets.bootstrap.archive import list_glb_members
from omnicam.assets.bootstrap.curation import SelectedAsset
from omnicam.assets.bootstrap.glb_inspect import build_rig_evidence, inspect_glb_member
from omnicam.assets.bootstrap.installer import install_selected_asset
from omnicam.assets.bootstrap.types import BootstrapError
from omnicam.assets.catalog import load_catalog

from .glb_fixture import build_humanoid_glb, build_static_glb

_PAGE = "https://kenney.nl/assets/furniture-kit"


def _member(tmp_path, stem, data):
    archive = tmp_path / f"{stem}.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr(f"Models/GLB format/{stem}.glb", data)
    (member,) = list_glb_members(archive)
    return member


def _static(tmp_path, *, stem="chair", asset_id="omnicam.prop.chair_01",
            output="props/chair_01.glb", triangle_count=400):
    member = _member(tmp_path, stem, build_static_glb(triangle_count=triangle_count))
    return SelectedAsset(
        source_id="kenney.furniture_kit", member=member, asset_id=asset_id, name="Chair 01",
        kind="prop", category="props", output=output, base_size=(0.5, 0.9, 0.5), fit="uniform",
        tags=("chair", "furniture"), glb=inspect_glb_member(member), rig=None,
    )


def _character(tmp_path):
    data = build_humanoid_glb(animation_names=("Walk", "Idle Loop"))
    member = _member(tmp_path, "hero", data)
    info = inspect_glb_member(member)
    return SelectedAsset(
        source_id="kenney.blocky_characters", member=member,
        asset_id="omnicam.character.kenney_blocky_01", name="Kenney Blocky Character 01",
        kind="character", category="characters", output="characters/kenney_blocky_01.glb",
        base_size=(0.6, 1.75, 0.4), fit="upright", tags=("human", "character", "proxy", "kenney"),
        glb=info, rig=build_rig_evidence(info),
    )


def test_file_lands_in_the_category_folder(tmp_path):
    result = install_selected_asset(tmp_path, _static(tmp_path), update=False, source_page_url=_PAGE)
    assert (tmp_path / "omnicam" / "library" / "props" / "chair_01.glb").is_file()
    assert result.status == "installed"
    assert result.catalog_registered is True


def test_registered_row_is_visible_from_load_catalog(tmp_path):
    install_selected_asset(tmp_path, _static(tmp_path), update=False, source_page_url=_PAGE)
    row = load_catalog(tmp_path).get("omnicam.prop.chair_01")
    assert row.source == "user"
    assert row.file == "props/chair_01.glb"
    assert row.license["spdx"] == "CC0-1.0"
    assert "kenney" in row.tags


def test_character_row_stores_actual_bone_map_and_clip_names(tmp_path):
    result = install_selected_asset(tmp_path, _character(tmp_path), update=False, source_page_url="https://kenney.nl/assets/blocky-characters")
    assert result.rig_status == "rigged"
    row = load_catalog(tmp_path).get("omnicam.character.kenney_blocky_01")
    assert row.rig.bone_map["toe_l"] == "LeftToeBase"
    assert row.rig.bone_map["root"] == "Hips"
    clip_ids = {c.id for c in row.animations}
    assert clip_ids == {"walk", "idle-loop"}
    assert result.animation_ids == ("walk", "idle-loop")
    walk = next(c for c in row.animations if c.id == "walk")
    assert "walk" in walk.tags


def test_same_hash_is_idempotent(tmp_path):
    selected = _static(tmp_path)
    first = install_selected_asset(tmp_path, selected, update=False, source_page_url=_PAGE)
    second = install_selected_asset(tmp_path, selected, update=False, source_page_url=_PAGE)
    assert first.status == "installed"
    assert second.status == "reused"
    assert first.sha256 == second.sha256


def test_differing_existing_file_refuses_without_update(tmp_path):
    install_selected_asset(tmp_path, _static(tmp_path), update=False, source_page_url=_PAGE)
    dest = tmp_path / "omnicam" / "library" / "props" / "chair_01.glb"
    original = dest.read_bytes()

    other = _static(tmp_path, stem="chair2", triangle_count=777)  # different sha
    other = dataclasses.replace(other, output="props/chair_01.glb", asset_id="omnicam.prop.chair_01")
    result = install_selected_asset(tmp_path, other, update=False, source_page_url=_PAGE)
    assert result.status == "conflict"
    assert result.catalog_registered is False
    assert dest.read_bytes() == original


def test_catalog_failure_removes_the_new_file(tmp_path, monkeypatch):
    selected = _static(tmp_path)
    monkeypatch.setattr(manifest, "register_asset", _boom)
    with pytest.raises(BootstrapError):
        install_selected_asset(tmp_path, selected, update=False, source_page_url=_PAGE)
    assert not (tmp_path / "omnicam" / "library" / "props" / "chair_01.glb").exists()


def test_update_rollback_restores_previous_file(tmp_path, monkeypatch):
    install_selected_asset(tmp_path, _static(tmp_path), update=False, source_page_url=_PAGE)
    dest = tmp_path / "omnicam" / "library" / "props" / "chair_01.glb"
    original = dest.read_bytes()

    other = _static(tmp_path, stem="chair3", triangle_count=555)
    other = dataclasses.replace(other, output="props/chair_01.glb", asset_id="omnicam.prop.chair_01")
    monkeypatch.setattr(manifest, "register_asset", _boom)
    with pytest.raises(BootstrapError):
        install_selected_asset(tmp_path, other, update=True, source_page_url=_PAGE)
    assert dest.read_bytes() == original


def _boom(*_a, **_k):
    raise RuntimeError("catalog exploded")
