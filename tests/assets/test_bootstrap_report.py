"""Bootstrap report counters + SOURCES.md provenance."""

from __future__ import annotations

import json

from omnicam.assets.bootstrap.curation import SelectionResult
from omnicam.assets.bootstrap.installer import InstalledAsset
from omnicam.assets.bootstrap.lockfile import LockSource
from omnicam.assets.bootstrap.report import (
    build_report,
    render_report_text,
    write_report,
    write_sources_md,
)


def _asset(asset_id, output, *, status="installed", rig_status="none", source="kenney.furniture_kit", anims=()):
    return InstalledAsset(
        asset_id=asset_id, output=output, sha256="d" * 64, status=status, source_id=source,
        archive_member=f"Models/{output}", rig_status=rig_status, animation_ids=tuple(anims),
        catalog_registered=status != "conflict",
    )


_INSTALLED = [
    _asset("omnicam.character.k_01", "characters/k_01.glb", rig_status="rigged", source="kenney.blocky_characters", anims=("walk", "idle")),
    _asset("omnicam.character.k_02", "characters/k_02.glb", rig_status="rigged", source="kenney.blocky_characters", anims=("run",)),
    _asset("omnicam.prop.chair_01", "props/chair_01.glb"),
    _asset("omnicam.prop.table_01", "props/table_01.glb"),
    _asset("omnicam.vehicle.sedan_01", "vehicles/sedan_01.glb", source="kenney.car_kit"),
    _asset("omnicam.environment.tree_01", "environments/tree_01.glb", source="kenney.nature_kit"),
    _asset("omnicam.prop.desk_01", "props/desk_01.glb", status="conflict"),
]


def _report():
    return build_report(
        preset="starter", sources_total=7, sources_resolved=7,
        archives_downloaded=7, archives_verified=7,
        selection=SelectionResult(selected=(), warnings=("starter.roads: matched 1 of 3 requested",),
                                  missing_required=()),
        installed=_INSTALLED,
    )


def test_report_counts_each_category_separately():
    report = _report()
    counts = report["installed"]["by_category"]
    assert counts["characters"] == 2
    assert counts["props"] == 2  # the conflicted desk is not counted
    assert counts["vehicles"] == 1
    assert counts["environments"] == 1
    assert report["installed"]["rigged_characters"] == 2
    assert report["installed"]["total"] == 6
    assert report["animations_discovered"] == 3
    assert any("conflict" in w for w in report["warnings"])


def test_render_report_text_is_human_readable():
    text = render_report_text(_report())
    assert "OmniCam Starter Asset Bootstrap" in text
    assert "Characters         2" in text
    assert "Rigged             2" in text


def test_write_report_persists_json(tmp_path):
    path = write_report(tmp_path, _report())
    assert path.name == "last-report.json"
    on_disk = json.loads(path.read_text(encoding="utf-8"))
    assert on_disk["preset"] == "starter"


def test_sources_md_lists_every_installed_source_and_license(tmp_path):
    sources = {
        "kenney.furniture_kit": LockSource("https://kenney.nl/assets/furniture-kit", "https://kenney.nl/media/pages/assets/furniture-kit/x.zip", "a" * 64, "CC0-1.0"),
        "kenney.blocky_characters": LockSource("https://kenney.nl/assets/blocky-characters", "https://kenney.nl/media/pages/assets/blocky-characters/y.zip", "b" * 64, "CC0-1.0"),
        "kenney.car_kit": LockSource("https://kenney.nl/assets/car-kit", "https://kenney.nl/media/pages/assets/car-kit/z.zip", "c" * 64, "CC0-1.0"),
        "kenney.nature_kit": LockSource("https://kenney.nl/assets/nature-kit", "https://kenney.nl/media/pages/assets/nature-kit/w.zip", "e" * 64, "CC0-1.0"),
    }
    path = write_sources_md(tmp_path, sources, _INSTALLED, install_date="2026-09-09")
    text = path.read_text(encoding="utf-8")
    assert "https://kenney.nl/assets/furniture-kit" in text
    assert "https://kenney.nl/assets/car-kit" in text
    assert "CC0-1.0" in text
    assert "characters/k_01.glb" in text
    assert "props/desk_01.glb" not in text  # conflicted asset omitted
