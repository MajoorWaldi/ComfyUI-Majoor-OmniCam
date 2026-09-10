"""Deterministic starter curation: exact stems + bounded dynamic groups."""

from __future__ import annotations

import zipfile

from omnicam.assets.bootstrap.archive import list_glb_members
from omnicam.assets.bootstrap.curation import (
    InspectedMember,
    SourceInventory,
    load_selection_document,
    normalize_stem,
    select_starter_assets,
)
from omnicam.assets.bootstrap.glb_inspect import inspect_glb_member

from .glb_fixture import build_humanoid_glb, build_static_glb


def _inventory(tmp_path, source_id, specs):
    tmp_path.mkdir(parents=True, exist_ok=True)
    archive = tmp_path / f"{source_id}.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        for stem, data in specs:
            zf.writestr(f"Models/GLB format/{stem}.glb", data)
    members = list_glb_members(archive)
    inspected = tuple(InspectedMember(m, inspect_glb_member(m)) for m in members)
    return SourceInventory(source_id, f"https://kenney.nl/assets/{source_id}", inspected)


def test_shipped_selection_document_is_loadable():
    doc = load_selection_document()
    assert doc["version"] == 1
    exact_stems = {e["stem"] for e in doc["exact"]}
    for legacy in ("chair", "table", "desk", "sedan", "bench", "doorwayOpen"):
        assert legacy in exact_stems


def test_exact_match_is_separator_and_case_insensitive(tmp_path):
    inv = _inventory(tmp_path, "kenney.furniture_kit", [("Lounge_Chair", build_static_glb())])
    doc = {
        "exact": [{
            "source": "kenney.furniture_kit", "stem": "loungeChair",
            "id": "omnicam.prop.lounge_chair_01", "name": "Lounge Chair 01",
            "kind": "prop", "output": "props/lounge_chair_01.glb",
            "base_size": [1, 1, 1], "fit": "uniform", "tags": ["chair"],
        }]
    }
    result = select_starter_assets({inv.source_id: inv}, doc)
    assert [a.asset_id for a in result.selected] == ["omnicam.prop.lounge_chair_01"]
    assert result.missing_required == ()


def test_exact_match_prefers_exact_stem_over_loose(tmp_path):
    inv = _inventory(
        tmp_path,
        "kenney.furniture_kit",
        [("chairLeg", build_static_glb(triangle_count=10)), ("chair", build_static_glb(triangle_count=999))],
    )
    doc = {"exact": [{
        "source": "kenney.furniture_kit", "stem": "chair", "id": "omnicam.prop.chair_01",
        "name": "Chair 01", "kind": "prop", "output": "props/chair_01.glb",
        "base_size": [1, 1, 1], "fit": "uniform", "tags": ["chair"],
    }]}
    result = select_starter_assets({inv.source_id: inv}, doc)
    (chosen,) = result.selected
    assert chosen.member.stem == "chair"


def test_missing_exact_stem_is_reported_as_required(tmp_path):
    inv = _inventory(tmp_path, "kenney.furniture_kit", [("stool", build_static_glb())])
    doc = {"exact": [{
        "source": "kenney.furniture_kit", "stem": "chair", "id": "omnicam.prop.chair_01",
        "name": "Chair 01", "kind": "prop", "output": "props/chair_01.glb",
        "base_size": [1, 1, 1], "fit": "uniform", "tags": ["chair"],
    }]}
    result = select_starter_assets({inv.source_id: inv}, doc)
    assert result.selected == ()
    assert any("chair" in m for m in result.missing_required)


def test_dynamic_characters_require_complete_rig_and_triangle_cap(tmp_path):
    inv = _inventory(
        tmp_path,
        "kenney.blocky_characters",
        [
            ("charA", build_humanoid_glb(triangle_count=1000)),
            ("charB_huge", build_humanoid_glb(triangle_count=90000)),
            ("charC_broken", build_humanoid_glb(drop_joints=("LeftToeBase",))),
            ("charD", build_humanoid_glb(triangle_count=2000, animation_names=("Walk",))),
        ],
    )
    doc = {"dynamic": [{
        "id": "starter.blocky", "source": "kenney.blocky_characters", "select": "character",
        "kind": "character", "max": 3, "max_triangles": 75000,
        "output_prefix": "characters/kenney_blocky_", "id_prefix": "omnicam.character.kenney_blocky_",
        "name_prefix": "Kenney Blocky Character ", "base_size": [0.6, 1.75, 0.4], "fit": "upright",
        "tags": ["human", "character", "proxy", "kenney"],
    }]}
    result = select_starter_assets({inv.source_id: inv}, doc)
    picked = {a.member.stem for a in result.selected}
    assert picked == {"charA", "charD"}  # huge + broken excluded
    assert all(a.rig is not None and a.rig.complete for a in result.selected)
    animated = next(a for a in result.selected if a.member.stem == "charD")
    assert "animated" in animated.tags


def test_dynamic_character_selection_is_order_independent(tmp_path):
    specs = [
        ("charX", build_humanoid_glb(triangle_count=5000)),
        ("charY", build_humanoid_glb(triangle_count=1000)),
        ("charZ", build_humanoid_glb(triangle_count=3000)),
    ]
    doc = {"dynamic": [{
        "id": "g", "source": "s", "select": "character", "kind": "character", "max": 2,
        "max_triangles": 75000, "output_prefix": "characters/k_", "id_prefix": "omnicam.character.k_",
        "name_prefix": "K ", "base_size": [1, 1, 1], "fit": "upright", "tags": ["human"],
    }]}
    inv_a = _inventory(tmp_path / "a", "s", specs)
    inv_b = _inventory(tmp_path / "b", "s", list(reversed(specs)))
    a = select_starter_assets({"s": inv_a}, doc)
    b = select_starter_assets({"s": inv_b}, doc)
    assert [x.member.stem for x in a.selected] == [x.member.stem for x in b.selected] == ["charY", "charZ"]


def test_generated_character_tags_do_not_infer_sex(tmp_path):
    inv = _inventory(tmp_path, "s", [("femaleA", build_humanoid_glb()), ("maleB", build_humanoid_glb())])
    doc = {"dynamic": [{
        "id": "g", "source": "s", "select": "character", "kind": "character", "max": 2,
        "max_triangles": 75000, "output_prefix": "characters/k_", "id_prefix": "omnicam.character.k_",
        "name_prefix": "K ", "base_size": [1, 1, 1], "fit": "upright",
        "tags": ["human", "character", "proxy", "kenney"],
    }]}
    result = select_starter_assets({"s": inv}, doc)
    for asset in result.selected:
        for tag in asset.tags:
            assert tag not in {"male", "female", "man", "woman", "boy", "girl"}


def test_dynamic_contains_excludes_part_keywords(tmp_path):
    inv = _inventory(
        tmp_path,
        "kenney.car_kit",
        [
            ("truck", build_static_glb(triangle_count=500)),
            ("truck-wheel", build_static_glb(triangle_count=10)),
            ("suv-debris", build_static_glb(triangle_count=10)),
            ("van", build_static_glb(triangle_count=700)),
        ],
    )
    doc = {"dynamic": [{
        "id": "starter.vehicle_extras", "source": "kenney.car_kit", "select": "contains",
        "kind": "vehicle", "max": 2, "require_static": True,
        "match_contains": ["hatchback", "suv", "truck", "van", "race"],
        "exclude_contains": ["wheel", "tire", "debris", "character", "part"],
        "output_prefix": "vehicles/kenney_car_", "id_prefix": "omnicam.vehicle.kenney_car_",
        "name_prefix": "Kenney Car ", "base_size": [1.9, 1.5, 4.2], "fit": "stretch",
        "tags": ["vehicle", "car", "kenney"],
    }]}
    result = select_starter_assets({inv.source_id: inv}, doc)
    picked = {a.member.stem for a in result.selected}
    assert picked == {"truck", "van"}


def test_normalize_stem():
    assert normalize_stem("light-square") == "lightsquare"
    assert normalize_stem("Lounge_Chair") == "loungechair"


def test_glb_wins_when_a_pack_ships_both_formats(tmp_path):
    from omnicam.assets.bootstrap.archive import list_model_members
    from omnicam.assets.bootstrap.model_inspect import inspect_member

    from .fbx_fixture import build_humanoid_fbx

    archive = tmp_path / "kenney.furniture_kit.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr("Models/GLB format/chair.glb", build_static_glb())
        zf.writestr("Models/FBX format/chair.fbx", build_humanoid_fbx())
    inspected = tuple(
        InspectedMember(m, inspect_member(m)) for m in list_model_members(archive)
    )
    inv = SourceInventory("kenney.furniture_kit", "https://kenney.nl/assets/furniture-kit", inspected)
    doc = {"exact": [{
        "source": "kenney.furniture_kit", "stem": "chair", "id": "omnicam.prop.chair_01",
        "name": "Chair 01", "kind": "prop", "output": "props/chair_01.glb",
        "base_size": [1, 1, 1], "fit": "uniform", "tags": ["chair"],
    }]}
    result = select_starter_assets({inv.source_id: inv}, doc)
    (chosen,) = result.selected
    assert chosen.member.name.endswith(".glb")
    assert chosen.model_format == "glb"
