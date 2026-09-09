"""``scripts/fetch_blockout_library.py`` still behaves after sharing the
Kenney download / archive core with the unified bootstrap."""

from __future__ import annotations

import importlib.util
import json
import zipfile
from pathlib import Path

import pytest

from .glb_fixture import build_humanoid_glb, build_static_glb

_SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "fetch_blockout_library.py"


@pytest.fixture(scope="module")
def legacy():
    spec = importlib.util.spec_from_file_location("fetch_blockout_library", _SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_list_still_prints_the_five_blockout_kit_pages(legacy, capsys, monkeypatch):
    monkeypatch.setattr("sys.argv", ["fetch_blockout_library.py", "--list"])
    assert legacy.main() == 0
    out = capsys.readouterr().out
    for url in (
        "https://kenney.nl/assets/furniture-kit",
        "https://kenney.nl/assets/car-kit",
        "https://kenney.nl/assets/city-kit-roads",
        "https://kenney.nl/assets/nature-kit",
        "https://kenney.nl/assets/blocky-characters",
    ):
        assert url in out


def test_from_dir_still_populates_the_legacy_library(legacy, tmp_path, monkeypatch):
    manifest = legacy._load_manifest()
    stems: set[str] = set()
    for entry in manifest["assets"].values():
        rels = list(entry.get("poses", {}).values()) if entry.get("category") == "human" else [entry["glb"]]
        stems.update(Path(r).stem for r in rels)

    kits = tmp_path / "kits"
    kits.mkdir()
    with zipfile.ZipFile(kits / "kenney_furniture-kit.zip", "w") as zf:
        for stem in stems:
            data = build_humanoid_glb() if stem == "character-a" else build_static_glb()
            zf.writestr(f"Models/GLB format/{stem}.glb", data)

    dest = tmp_path / "blockout_library"
    monkeypatch.setattr("sys.argv", [
        "fetch_blockout_library.py", "--from-dir", str(kits), "--dest", str(dest),
    ])
    assert legacy.main() == 0

    library = json.loads((dest / "library.json").read_text(encoding="utf-8"))
    assert "chair" in library["assets"]
    assert (dest / "interior" / "chair.glb").is_file()
    assert (dest / "human" / "character-a.glb").is_file()
    assert (dest / "SOURCES.md").is_file()
