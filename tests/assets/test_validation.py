"""Tag / annotation / license / asset-definition structural validation."""

from __future__ import annotations

import pytest

from omnicam.assets.errors import (
    AnnotationInvalidError,
    AssetCatalogInvalidError,
    AssetLicenseInvalidError,
    TagInvalidError,
    TagLimitExceededError,
)
from omnicam.assets.validation import (
    MAX_TAGS_PER_OBJECT,
    validate_annotation,
    validate_asset_definition,
    validate_license,
    validate_tags,
)

_MIN_PROP = {"id": "omnicam.prop.chair", "name": "Chair", "kind": "prop", "file": "props/chair.glb"}


# -- tags ------------------------------------------------------------- #
def test_tags_lowercased_trimmed_deduped_order_preserved():
    assert validate_tags([" Hero ", "SUBJECT", "hero"]) == ["hero", "subject"]


def test_tags_reject_non_slug_and_overflow():
    with pytest.raises(TagInvalidError):
        validate_tags(["has space"])
    with pytest.raises(TagInvalidError):
        validate_tags(["x" * 65])
    with pytest.raises(TagInvalidError):
        validate_tags("notalist")
    with pytest.raises(TagLimitExceededError):
        validate_tags([f"tag-{i}" for i in range(MAX_TAGS_PER_OBJECT + 1)])


# -- annotation ----------------------------------------------------- #
def test_annotation_valid_payload_is_normalised():
    out = validate_annotation({"text": " HERO ", "color": "#8D7EE8", "anchor": "TOP"})
    assert out == {"text": "HERO", "visible": True, "color": "#8d7ee8", "anchor": "top"}


def test_annotation_empty_text_is_none():
    assert validate_annotation({"text": "   "}) is None
    assert validate_annotation(None) is None


@pytest.mark.parametrize(
    "payload",
    [
        {"text": "<b>x</b>"},
        {"text": "see http://evil"},
        {"text": "ok", "color": "red"},
        {"text": "ok", "anchor": "sideways"},
        {"text": "x" * 129},
    ],
)
def test_annotation_rejects_unsafe_or_out_of_bounds(payload):
    with pytest.raises(AnnotationInvalidError):
        validate_annotation(payload)


# -- license ------------------------------------------------------- #
def test_license_trims_and_drops_empty_fields():
    assert validate_license({"spdx": " CC0-1.0 ", "source": ""}) == {"spdx": "CC0-1.0"}
    assert validate_license(None) == {}


def test_license_bounds():
    with pytest.raises(AssetLicenseInvalidError):
        validate_license({"spdx": "x" * 65})
    with pytest.raises(AssetLicenseInvalidError):
        validate_license("nope")


# -- asset definition -------------------------------------------- #
def test_minimal_prop_validates():
    definition = validate_asset_definition(dict(_MIN_PROP))
    assert definition.kind == "prop"
    assert definition.category == "props"


@pytest.mark.parametrize(
    "override",
    [
        {"id": "Bad Id"},
        {"id": ""},
        {"name": ""},
        {"kind": "weapon"},
        {"fit": "squash"},
        {"format": "usd"},
        {"file": ""},
        {"file": "../escape.glb"},
        {"file": "/abs/path.glb"},
        {"file": "characters/../../out.glb"},
    ],
)
def test_bad_definition_rejected(override):
    with pytest.raises(AssetCatalogInvalidError):
        validate_asset_definition({**_MIN_PROP, **override})


def test_non_positive_base_size_is_sanitised_not_rejected():
    # Mirrors the reconstruction library: a bad axis is clamped, not fatal.
    definition = validate_asset_definition({**_MIN_PROP, "base_size": [0, 1, 1]})
    assert all(v > 0.0 for v in definition.base_size)


def test_helper_kind_allows_empty_file():
    definition = validate_asset_definition(
        {"id": "omnicam.helper.null", "name": "Null", "kind": "helper", "file": ""}
    )
    assert definition.kind == "helper"


def test_rig_bone_map_limit_enforced():
    big = {f"joint_{i}": f"Bone{i}" for i in range(129)}
    with pytest.raises(AssetCatalogInvalidError):
        validate_asset_definition(
            {**_MIN_PROP, "kind": "character", "rig": {"bone_map": big}}
        )


def test_duplicate_animation_id_rejected():
    with pytest.raises(AssetCatalogInvalidError):
        validate_asset_definition(
            {**_MIN_PROP, "animations": [{"id": "idle"}, {"id": "idle"}]}
        )


def test_tags_normalised_on_the_definition():
    definition = validate_asset_definition({**_MIN_PROP, "tags": ["Foo", "foo", "BAR"]})
    assert definition.tags == ["foo", "bar"]
