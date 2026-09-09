"""End-to-end CLI orchestration, entirely offline (--from-dir fixtures)."""

from __future__ import annotations

import json
import zipfile

from omnicam.assets.bootstrap import cli
from omnicam.assets.bootstrap.curation import load_selection_document
from omnicam.assets.catalog import load_catalog

from .glb_fixture import build_humanoid_glb, build_static_glb

# source id -> Kenney zip basename (must contain normalize_stem(source.name))
_ZIP_NAME = {
    "kenney.blocky_characters": "kenney_blocky-characters",
    "kenney.mini_characters": "kenney_mini-characters",
    "kenney.furniture_kit": "kenney_furniture-kit",
    "kenney.car_kit": "kenney_car-kit",
    "kenney.nature_kit": "kenney_nature-kit",
    "kenney.city_roads": "kenney_city-kit-roads",
    "kenney.building_kit": "kenney_building-kit",
}


def _make_fixture_dir(root):
    root.mkdir(parents=True, exist_ok=True)
    doc = load_selection_document()
    exact_by_source: dict[str, list[str]] = {}
    for entry in doc["exact"]:
        exact_by_source.setdefault(entry["source"], []).append(entry["stem"])

    extras = {
        "kenney.car_kit": ["truck", "van"],
        "kenney.building_kit": ["wall-straight", "door-single", "window-wide", "floor-tile", "roof-flat", "stairs-open"],
        "kenney.city_roads": ["light-square", "road-straight", "road-curve", "street-crossing"],
        "kenney.nature_kit": ["plant_bush_detailed"],
    }
    characters = {"kenney.blocky_characters": 3, "kenney.mini_characters": 2}

    for source_id, zip_stem in _ZIP_NAME.items():
        members: dict[str, bytes] = {}
        for i, stem in enumerate(exact_by_source.get(source_id, [])):
            members[f"Models/GLB format/{stem}.glb"] = build_static_glb(triangle_count=100 + i)
        for i, stem in enumerate(extras.get(source_id, [])):
            members[f"Models/GLB format/{stem}.glb"] = build_static_glb(triangle_count=200 + i)
        for i in range(characters.get(source_id, 0)):
            members[f"Models/GLB format/char_{i}.glb"] = build_humanoid_glb(
                triangle_count=1000 + i * 10, animation_names=("Walk", "Idle")
            )
        with zipfile.ZipFile(root / f"{zip_stem}.zip", "w") as zf:
            for name, data in members.items():
                zf.writestr(name, data)
    return root


def test_no_source_flag_exits_config_error(tmp_path):
    assert cli.run(["--dest", str(tmp_path)]) == 2


def test_full_install_from_dir(tmp_path, capsys):
    fixture = _make_fixture_dir(tmp_path / "kits")
    code = cli.run(["--preset", "starter", "--from-dir", str(fixture), "--dest", str(tmp_path / "cui")])
    assert code == 0, capsys.readouterr()

    root = tmp_path / "cui" / "omnicam" / "library"
    assert (root / "props" / "chair_01.glb").is_file()
    assert (root / "vehicles" / "sedan_01.glb").is_file()
    assert (root / ".bootstrap" / "library.lock.json").is_file()
    assert (root / ".bootstrap" / "last-report.json").is_file()
    assert (root / "SOURCES.md").is_file()

    catalog = load_catalog(tmp_path / "cui")
    chair = catalog.get("omnicam.prop.chair_01")
    assert chair.source == "user"
    rigged = [r for r in catalog.all() if r.kind == "character" and r.source == "user" and r.has_rig]
    assert len(rigged) >= 1


def test_dry_run_writes_no_library_files(tmp_path, capsys):
    fixture = _make_fixture_dir(tmp_path / "kits")
    code = cli.run(["--from-dir", str(fixture), "--dest", str(tmp_path / "cui"), "--dry-run"])
    assert code == 0, capsys.readouterr()
    library = tmp_path / "cui" / "omnicam" / "library"
    assert not list(library.rglob("*.glb")) if library.exists() else True
    assert not (library / ".bootstrap" / "library.lock.json").exists()


def test_verify_never_calls_the_network_resolver(tmp_path, capsys):
    fixture = _make_fixture_dir(tmp_path / "kits")
    assert cli.run(["--from-dir", str(fixture), "--dest", str(tmp_path / "cui")]) == 0
    capsys.readouterr()

    def _boom(*_a, **_k):
        raise AssertionError("resolver must not run during --verify")

    code = cli.run(["--verify", "--dest", str(tmp_path / "cui")], resolver=_boom)
    assert code == 0, capsys.readouterr()


def test_source_flag_narrows_within_preset(tmp_path, capsys):
    fixture = _make_fixture_dir(tmp_path / "kits")
    code = cli.run([
        "--from-dir", str(fixture), "--dest", str(tmp_path / "cui"),
        "--source", "kenney.furniture_kit", "--source", "kenney.car_kit",
    ])
    # sedan installs, but characters cannot -> starter needs a rigged character
    assert code == 5, capsys.readouterr()
    lock = json.loads((tmp_path / "cui" / "omnicam" / "library" / ".bootstrap" / "library.lock.json").read_text())
    assert set(lock["sources"]) == {"kenney.furniture_kit", "kenney.car_kit"}


def test_json_report_on_stdout_logs_on_stderr(tmp_path, capsys):
    fixture = _make_fixture_dir(tmp_path / "kits")
    code = cli.run(["--from-dir", str(fixture), "--dest", str(tmp_path / "cui"), "--json"])
    captured = capsys.readouterr()
    assert code == 0
    payload = json.loads(captured.out)
    assert payload["preset"] == "starter"
    assert payload["installed"]["rigged_characters"] >= 1
    assert "source(s)" in captured.err


def test_preset_starter_selects_seven_sources(tmp_path, capsys):
    fixture = _make_fixture_dir(tmp_path / "kits")
    cli.run(["--from-dir", str(fixture), "--dest", str(tmp_path / "cui"), "--json"])
    payload = json.loads(capsys.readouterr().out)
    assert payload["sources"]["total"] == 7
    assert payload["sources"]["resolved"] == 7
