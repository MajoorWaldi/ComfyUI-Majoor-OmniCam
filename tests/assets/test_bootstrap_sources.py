"""Bootstrap source registry: schema, preset selection, licensing policy."""

from __future__ import annotations

import dataclasses
import json

import pytest

from omnicam.assets.bootstrap.source_registry import (
    load_source_registry,
    select_sources,
)
from omnicam.assets.bootstrap.types import BootstrapError


def test_starter_preset_has_exact_seven_sources():
    sources = select_sources("starter")
    assert [source.id for source in sources] == [
        "kenney.blocky_characters",
        "kenney.mini_characters",
        "kenney.furniture_kit",
        "kenney.car_kit",
        "kenney.nature_kit",
        "kenney.city_roads",
        "kenney.building_kit",
    ]


def test_registry_rows_are_frozen_and_typed():
    rows = load_source_registry()
    row = rows[0]
    assert row.provider == "kenney"
    assert row.license == "CC0-1.0"
    with pytest.raises(dataclasses.FrozenInstanceError):
        row.id = "mutated"  # type: ignore[misc]


def test_every_auto_source_has_a_license():
    for row in load_source_registry():
        assert row.license, f"{row.id} has no license id"


def test_quaternius_is_not_in_automatic_source_registry():
    ids = {row.id for row in load_source_registry()}
    assert not any("quaternius" in i for i in ids)
    assert not any(row.provider == "quaternius" for row in load_source_registry())


def test_polyhaven_is_not_in_starter_v1_source_registry():
    for row in load_source_registry():
        assert "polyhaven" not in row.id
        assert row.provider != "polyhaven"


def test_mixamo_is_not_in_source_registry():
    ids = {row.id for row in load_source_registry()}
    assert not any("mixamo" in i for i in ids)


def test_source_filter_narrows_within_preset():
    picked = select_sources("starter", {"kenney.furniture_kit", "kenney.car_kit"})
    assert [row.id for row in picked] == ["kenney.furniture_kit", "kenney.car_kit"]


def test_source_filter_rejects_id_outside_preset():
    with pytest.raises(BootstrapError):
        select_sources("vehicles", {"kenney.furniture_kit"})


def test_unknown_preset_is_rejected():
    with pytest.raises(BootstrapError):
        select_sources("everything")


def test_non_kenney_provider_is_rejected(tmp_path):
    bad = tmp_path / "sources.json"
    bad.write_text(
        json.dumps(
            {
                "version": 1,
                "sources": [
                    {
                        "id": "quaternius.nature",
                        "provider": "quaternius",
                        "name": "Nature",
                        "page_url": "https://quaternius.com/packs/nature.html",
                        "license": "custom",
                        "kind_hint": "environment",
                        "presets": ["starter"],
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    with pytest.raises(BootstrapError):
        load_source_registry(bad)


def test_non_https_kenney_page_url_is_rejected(tmp_path):
    bad = tmp_path / "sources.json"
    bad.write_text(
        json.dumps(
            {
                "version": 1,
                "sources": [
                    {
                        "id": "kenney.furniture_kit",
                        "provider": "kenney",
                        "name": "Furniture Kit",
                        "page_url": "http://kenney.nl/assets/furniture-kit",
                        "license": "CC0-1.0",
                        "kind_hint": "prop",
                        "presets": ["starter"],
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    with pytest.raises(BootstrapError):
        load_source_registry(bad)


def test_off_host_page_url_is_rejected(tmp_path):
    bad = tmp_path / "sources.json"
    bad.write_text(
        json.dumps(
            {
                "version": 1,
                "sources": [
                    {
                        "id": "kenney.evil",
                        "provider": "kenney",
                        "name": "Evil",
                        "page_url": "https://evil.example/assets/furniture-kit",
                        "license": "CC0-1.0",
                        "kind_hint": "prop",
                        "presets": ["starter"],
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    with pytest.raises(BootstrapError):
        load_source_registry(bad)
