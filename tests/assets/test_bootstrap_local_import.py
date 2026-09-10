"""Local restricted-licence character import (--character-dir)."""

from __future__ import annotations

import json

from omnicam.assets.bootstrap import cli
from omnicam.assets.bootstrap.local_import import (
    install_local_characters,
    scan_character_dir,
)
from omnicam.assets.catalog import load_catalog
from omnicam.assets.storage import asset_file_path

from .fbx_fixture import FBX_HUMANOID, build_humanoid_fbx
from .glb_fixture import build_humanoid_glb, build_static_glb


def _pack(root):
    root.mkdir(parents=True, exist_ok=True)
    (root / "Characters").mkdir()
    (root / "Characters" / "Hero.fbx").write_bytes(build_humanoid_fbx(animation_stacks=("Idle", "Run")))
    (root / "Characters" / "Sidekick.glb").write_bytes(build_humanoid_glb(animation_names=("walk",)))
    (root / "Characters" / "Crate.glb").write_bytes(build_static_glb())  # no rig -> skipped
    partial = {k: v for k, v in FBX_HUMANOID.items() if k not in ("LeftToes", "RightToes")}
    (root / "Characters" / "Broken.fbx").write_bytes(build_humanoid_fbx(hierarchy=partial))
    return root


def test_scan_keeps_only_rig_complete_models(tmp_path):
    accepted, notes = scan_character_dir(_pack(tmp_path / "ual"))
    ids = sorted(c.asset_id for c in accepted)
    assert ids == ["omnicam.character.hero", "omnicam.character.sidekick"]
    assert any("Crate" in n for n in notes)
    assert any("Broken" in n for n in notes)
    hero = next(c for c in accepted if c.asset_id == "omnicam.character.hero")
    assert hero.model_format == "fbx"
    assert hero.rig.complete is True
    assert hero.info.animation_names == ("Idle", "Run")


def test_install_writes_character_rows_with_real_bone_map(tmp_path):
    dest = tmp_path / "cui"
    accepted, _ = scan_character_dir(_pack(tmp_path / "ual"))
    installed = install_local_characters(dest, accepted, license_note="Quaternius QAL v1.0")
    assert {a.status for a in installed} == {"installed"}

    catalog = load_catalog(dest)
    hero = catalog.get("omnicam.character.hero")
    assert hero.source == "user"
    assert hero.format == "fbx"
    assert hero.has_rig
    assert hero.rig.bone_map["toe_l"] == "LeftToes"
    assert hero.license["source"] == "Quaternius QAL v1.0"
    assert asset_file_path(hero.file, dest).is_file()
    assert {c.id for c in hero.animations} == {"idle", "run"}


def test_cli_character_dir_end_to_end(tmp_path, capsys):
    dest = tmp_path / "cui"
    code = cli.run([
        "--character-dir", str(_pack(tmp_path / "ual")),
        "--dest", str(dest), "--license-note", "Quaternius QAL v1.0", "--json",
    ])
    assert code == 0, capsys.readouterr()
    payload = json.loads(capsys.readouterr().out)
    assert payload["installed"]["by_category"]["characters"] == 2

    lock = json.loads((dest / "omnicam" / "library" / ".bootstrap" / "library.lock.json").read_text())
    assert lock["assets"]["omnicam.character.hero"]["source"] == "local"
    assert "local" in lock["sources"]
    sources_md = (dest / "omnicam" / "library" / "SOURCES.md").read_text(encoding="utf-8")
    assert "Quaternius QAL v1.0" in sources_md


def test_cli_character_dir_merges_into_existing_lockfile(tmp_path):
    from omnicam.assets.bootstrap.installer import InstalledAsset
    from omnicam.assets.bootstrap.lockfile import LockSource, write_lockfile

    dest = tmp_path / "cui"
    kenney = InstalledAsset(
        asset_id="omnicam.prop.chair_01", output="props/chair_01.glb", sha256="a" * 64,
        status="installed", source_id="kenney.furniture_kit", archive_member="x",
        rig_status="none", animation_ids=(), catalog_registered=True,
    )
    write_lockfile(dest, {"kenney.furniture_kit": LockSource("p", "u", "s", "CC0-1.0")}, [kenney])

    cli.run(["--character-dir", str(_pack(tmp_path / "ual")), "--dest", str(dest)])
    lock = json.loads((dest / "omnicam" / "library" / ".bootstrap" / "library.lock.json").read_text())
    # both provenances survive
    assert "omnicam.prop.chair_01" in lock["assets"]
    assert "omnicam.character.hero" in lock["assets"]
    assert "kenney.furniture_kit" in lock["sources"]
