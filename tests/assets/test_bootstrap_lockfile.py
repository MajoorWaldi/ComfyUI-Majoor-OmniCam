"""Lockfile round-trip + offline verification drift detection."""

from __future__ import annotations

import json
import zipfile

from omnicam.assets.bootstrap.archive import list_glb_members
from omnicam.assets.bootstrap.curation import SelectedAsset
from omnicam.assets.bootstrap.glb_inspect import build_rig_evidence, inspect_glb_member
from omnicam.assets.bootstrap.installer import install_selected_asset
from omnicam.assets.bootstrap.lockfile import (
    LockSource,
    load_lockfile,
    verify_lockfile,
    write_lockfile,
)
from omnicam.assets.storage import user_catalog_path

from .glb_fixture import build_humanoid_glb, build_static_glb

_FURN = "https://kenney.nl/assets/furniture-kit"
_CHAR = "https://kenney.nl/assets/blocky-characters"


def _member(tmp_path, stem, data):
    archive = tmp_path / f"{stem}.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr(f"Models/GLB format/{stem}.glb", data)
    (member,) = list_glb_members(archive)
    return member


def _install_two(tmp_path):
    chair_m = _member(tmp_path, "chair", build_static_glb())
    chair = SelectedAsset(
        source_id="kenney.furniture_kit", member=chair_m, asset_id="omnicam.prop.chair_01",
        name="Chair 01", kind="prop", category="props", output="props/chair_01.glb",
        base_size=(0.5, 0.9, 0.5), fit="uniform", tags=("chair",), glb=inspect_glb_member(chair_m), rig=None,
    )
    hero_m = _member(tmp_path, "hero", build_humanoid_glb(animation_names=("Walk",)))
    hero_info = inspect_glb_member(hero_m)
    hero = SelectedAsset(
        source_id="kenney.blocky_characters", member=hero_m,
        asset_id="omnicam.character.kenney_blocky_01", name="Kenney Blocky Character 01",
        kind="character", category="characters", output="characters/kenney_blocky_01.glb",
        base_size=(0.6, 1.75, 0.4), fit="upright", tags=("human", "character"),
        glb=hero_info, rig=build_rig_evidence(hero_info),
    )
    a = install_selected_asset(tmp_path, chair, update=False, source_page_url=_FURN)
    b = install_selected_asset(tmp_path, hero, update=False, source_page_url=_CHAR)
    return [a, b]


def _sources():
    return {
        "kenney.furniture_kit": LockSource(_FURN, _FURN.replace("assets", "media/pages/assets") + "/x.zip", "a" * 64, "CC0-1.0"),
        "kenney.blocky_characters": LockSource(_CHAR, _CHAR.replace("assets", "media/pages/assets") + "/y.zip", "b" * 64, "CC0-1.0"),
    }


def test_lockfile_round_trip(tmp_path):
    installed = _install_two(tmp_path)
    write_lockfile(tmp_path, _sources(), installed, generated_at="2026-09-09T20:00:00Z")
    document = load_lockfile(tmp_path)
    assert document["generated_at"] == "2026-09-09T20:00:00Z"
    assert set(document["sources"]) == {"kenney.furniture_kit", "kenney.blocky_characters"}
    assert document["assets"]["omnicam.character.kenney_blocky_01"]["rig_status"] == "rigged"
    assert len(document["assets"]["omnicam.prop.chair_01"]["sha256"]) == 64


def test_verify_is_clean_right_after_install(tmp_path):
    installed = _install_two(tmp_path)
    write_lockfile(tmp_path, _sources(), installed)
    result = verify_lockfile(tmp_path)
    assert result.ok is True
    assert result.checked == 2
    assert result.issues == ()


def test_verify_detects_modified_glb_hash(tmp_path):
    installed = _install_two(tmp_path)
    write_lockfile(tmp_path, _sources(), installed)
    target = tmp_path / "omnicam" / "library" / "props" / "chair_01.glb"
    target.write_bytes(target.read_bytes() + b"tampered")
    result = verify_lockfile(tmp_path)
    assert result.ok is False
    assert any(i.kind == "hash-mismatch" and i.asset_id == "omnicam.prop.chair_01" for i in result.issues)


def test_verify_detects_missing_source_file(tmp_path):
    installed = _install_two(tmp_path)
    write_lockfile(tmp_path, _sources(), installed)
    (tmp_path / "omnicam" / "library" / "characters" / "kenney_blocky_01.glb").unlink()
    result = verify_lockfile(tmp_path)
    assert any(i.kind == "missing-file" for i in result.issues)


def test_verify_detects_missing_catalog_row(tmp_path):
    installed = _install_two(tmp_path)
    write_lockfile(tmp_path, _sources(), installed)
    catalog = user_catalog_path(tmp_path)
    document = json.loads(catalog.read_text(encoding="utf-8"))
    document["assets"] = [r for r in document["assets"] if r["id"] != "omnicam.prop.chair_01"]
    catalog.write_text(json.dumps(document), encoding="utf-8")
    result = verify_lockfile(tmp_path)
    assert any(i.kind == "missing-catalog-row" and i.asset_id == "omnicam.prop.chair_01" for i in result.issues)
