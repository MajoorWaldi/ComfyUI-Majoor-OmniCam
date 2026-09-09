"""AssetDefinition v2 dataclasses: parse, serialise, derived properties."""

from __future__ import annotations

from omnicam.assets.types import (
    ASSET_DEFINITION_VERSION,
    AnimationClip,
    AssetDefinition,
    RigBinding,
    default_category_for_kind,
)

_CHARACTER = {
    "version": 2,
    "id": "omnicam.character.human_01",
    "name": "Human 01",
    "kind": "character",
    "file": "characters/human_01.glb",
    "format": "glb",
    "base_size": [0.62, 1.81, 0.42],
    "fit": "upright",
    "tags": ["human", "adult"],
    "thumbnail": "thumbnails/human_01.webp",
    "rig": {
        "profile": "omnicam_humanoid_v1",
        "root_bone": "Hips",
        "bone_map": {"pelvis": "Hips", "head": "Head"},
        "forward_axis": "-Z",
        "up_axis": "+Y",
    },
    "animations": [
        {"id": "idle", "name": "Idle", "clip": "Idle", "tags": ["idle"]},
        {"id": "walk"},
    ],
    "license": {"spdx": "CC0-1.0", "source": "kenney"},
}


def test_from_dict_parses_every_section():
    definition = AssetDefinition.from_dict(_CHARACTER, source="user")
    assert definition.id == "omnicam.character.human_01"
    assert definition.kind == "character"
    assert definition.source == "user"
    assert definition.is_character
    # A 2-joint map parses fine but is not a complete OMNICAM_HUMANOID_V1 rig.
    assert isinstance(definition.rig, RigBinding)
    assert definition.rig_status == "incomplete"
    assert not definition.has_rig
    assert definition.rig.bone_map["pelvis"] == "Hips"
    assert [clip.id for clip in definition.animations] == ["idle", "walk"]
    # A bare clip mirrors its id into name/clip.
    assert definition.animations[1].name == "walk"
    assert definition.animations[1].clip == "walk"


def test_to_dict_round_trips():
    definition = AssetDefinition.from_dict(_CHARACTER)
    again = AssetDefinition.from_dict(definition.to_dict())
    assert again.to_dict() == definition.to_dict()
    assert again.version == ASSET_DEFINITION_VERSION


def test_base_size_is_clamped_positive_and_triplet():
    definition = AssetDefinition.from_dict(
        {"id": "omnicam.prop.x", "name": "X", "kind": "prop", "file": "props/x.glb",
         "base_size": [0.0, -3.0]}
    )
    assert all(v > 0.0 for v in definition.base_size)
    assert len(definition.base_size) == 3


def test_category_defaults_from_kind():
    assert default_category_for_kind("character") == "characters"
    assert default_category_for_kind("vehicle") == "vehicles"
    assert default_category_for_kind("mystery") == "props"
    definition = AssetDefinition.from_dict(
        {"id": "omnicam.vehicle.v", "name": "V", "kind": "vehicle", "file": "vehicles/v.glb"}
    )
    assert definition.category == "vehicles"


def test_prop_without_rig_is_not_a_character():
    definition = AssetDefinition.from_dict(
        {"id": "omnicam.prop.chair", "name": "Chair", "kind": "prop", "file": "props/chair.glb"}
    )
    assert not definition.is_character
    assert not definition.has_rig
    assert "rig" not in definition.to_dict()


def test_animation_clip_requires_nothing_but_id():
    clip = AnimationClip.from_dict({"id": "run"})
    assert clip.to_dict() == {"id": "run", "name": "run", "clip": "run", "tags": []}
