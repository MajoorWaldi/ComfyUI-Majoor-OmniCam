"""The published JSON Schemas must describe what the code actually produces.

They used to be documentation-only: nothing loaded them, nothing tested them,
and they had drifted (any string accepted for render_mode, no ceilings at all,
plus two schemas for a sequence stack that no longer exists).

Two kinds of check keep them honest:
  - real payloads, built by the real code, must validate;
  - the numeric bounds must equal the Python constants they mirror.
"""

import json
from pathlib import Path

import pytest

from omnicam.core.track import OmniCamTrack
from omnicam.core.validation import (
    DEFAULT_LIMITS,
    DIMENSION_RANGE,
    INTERPOLATION_MODES,
    LOOK_AT_STATUSES,
    MAX_METADATA_ENTRIES,
    RENDER_MODES,
    validate_track_payload,
)

jsonschema = pytest.importorskip("jsonschema")

SCHEMA_DIR = Path(__file__).resolve().parents[1] / "schemas"


def load(name: str) -> dict:
    return json.loads((SCHEMA_DIR / f"{name}.schema.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def registry():
    """Resolve the cross-schema $ref by $id, the way a published bundle would."""
    from referencing import Registry, Resource

    resources = []
    for path in sorted(SCHEMA_DIR.glob("*.schema.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        resources.append((document["$id"], Resource.from_contents(document)))
    return Registry().with_resources(resources)


def validate(document: dict, instance, registry) -> None:
    jsonschema.Draft202012Validator(document, registry=registry).validate(instance)


def sample_track() -> dict:
    return validate_track_payload({
        "fps": 24, "duration_frames": 48, "width": 1280, "height": 720, "render_mode": "omni_ref",
        "keyframes": [
            {"frame": 0, "camera": {"position": [-3, 1.6, 5], "target": [0, 1, 0], "fov": 35}, "interpolation": "smooth"},
            {"frame": 24, "camera": {"position": [0, 2, 6], "target": [0, 1, 0], "fov": 40}, "interpolation": "hold"},
            {"frame": 47, "camera": {"position": [3, 1.6, 5], "target": [0, 1, 0], "fov": 28}, "interpolation": "bezier"},
        ],
        "metadata": {"camera_name": "Camera 1"},
    })


# --------------------------------------------------------------------------
# Real payloads validate
# --------------------------------------------------------------------------

def test_a_validated_track_matches_the_published_track_schema(registry):
    validate(load("track.v1"), sample_track(), registry)


def test_the_default_track_matches_the_schema(registry):
    default = validate_track_payload(OmniCamTrack.from_dict({}).to_dict())
    validate(load("track.v1"), default, registry)


@pytest.mark.parametrize("mode", sorted(RENDER_MODES))
def test_every_render_mode_the_validator_accepts_is_in_the_schema(mode, registry):
    payload = sample_track()
    payload["render_mode"] = mode
    validate(load("track.v1"), payload, registry)


@pytest.mark.parametrize("interpolation", sorted(INTERPOLATION_MODES))
def test_every_interpolation_the_validator_accepts_is_in_the_schema(interpolation, registry):
    payload = sample_track()
    payload["keyframes"][0]["interpolation"] = interpolation
    validate(load("track.v1"), payload, registry)


# --------------------------------------------------------------------------
# The schemas actually reject what the validator rejects
# --------------------------------------------------------------------------

@pytest.mark.parametrize(("field", "value"), [
    ("render_mode", "path_traced"),
    ("fps", 0),
    ("fps", 240),
    ("duration_frames", 0),
    ("duration_frames", DEFAULT_LIMITS.max_duration_frames + 1),
    ("width", 32),
    ("height", 8192),
    ("schema_version", 2),
])
def test_out_of_contract_tracks_are_rejected(field, value, registry):
    payload = sample_track()
    payload[field] = value
    with pytest.raises(jsonschema.ValidationError):
        validate(load("track.v1"), payload, registry)


def test_unknown_interpolation_is_rejected(registry):
    payload = sample_track()
    payload["keyframes"][0]["interpolation"] = "bounce"
    with pytest.raises(jsonschema.ValidationError):
        validate(load("track.v1"), payload, registry)


# --------------------------------------------------------------------------
# Anti-drift: the numbers must be the Python numbers
# --------------------------------------------------------------------------

def test_track_schema_bounds_mirror_the_validator():
    schema = load("track.v1")
    properties = schema["properties"]
    assert set(properties["render_mode"]["enum"]) == set(RENDER_MODES)
    assert properties["duration_frames"]["maximum"] == DEFAULT_LIMITS.max_duration_frames
    assert properties["keyframes"]["maxItems"] == DEFAULT_LIMITS.max_keys_per_track
    assert properties["objects"]["maxItems"] == DEFAULT_LIMITS.max_objects
    assert (properties["width"]["minimum"], properties["width"]["maximum"]) == DIMENSION_RANGE
    assert (properties["height"]["minimum"], properties["height"]["maximum"]) == DIMENSION_RANGE

    defs = schema["$defs"]
    assert set(defs["keyframe"]["properties"]["interpolation"]["enum"]) == set(INTERPOLATION_MODES)
    assert defs["keyframe"]["properties"]["frame"]["maximum"] == DEFAULT_LIMITS.max_duration_frames - 1
    assert defs["metadata"]["maxProperties"] == MAX_METADATA_ENTRIES
    look_at = properties["constraints"]["properties"]["look_at"]["properties"]
    assert set(look_at["status"]["enum"]) == set(LOOK_AT_STATUSES)


def test_editor_state_schema_bounds_mirror_the_validator():
    properties = load("editor_state.v1")["properties"]
    assert properties["cameras"]["maxItems"] == DEFAULT_LIMITS.max_cameras
    assert properties["objects"]["maxItems"] == DEFAULT_LIMITS.max_objects
    assert properties["cameras"]["items"]["properties"]["keyframes"]["maxItems"] == DEFAULT_LIMITS.max_keys_per_track


def test_only_schemas_for_live_contracts_are_published():
    """Only editor-state and internal camera-track schemas remain published."""
    published = {path.name for path in SCHEMA_DIR.glob("*.schema.json")}
    assert published == {
        "editor_state.v1.schema.json",
        "track.v1.schema.json",
    }


def test_every_schema_is_itself_a_valid_draft_2020_12_document():
    for path in sorted(SCHEMA_DIR.glob("*.schema.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        jsonschema.Draft202012Validator.check_schema(document)
        assert document["$id"].startswith("majoor.omnicam."), path.name
