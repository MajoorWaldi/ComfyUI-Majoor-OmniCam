import math

import pytest

from omnicam.core.editor_state import editor_state_to_track, select_track_camera
from omnicam.core.migrations import SEQUENCE_SCHEMA, TRACK_SCHEMA, migrate_payload
from omnicam.core.track import OmniCamTrack
from omnicam.core.validation import (
    MAX_METADATA_DEPTH,
    TrackLimits,
    ValidationError,
    validate_editor_state,
    validate_metadata,
    validate_track_payload,
)


def test_nan_and_infinity_are_rejected_by_strict_validation():
    with pytest.raises(ValidationError):
        validate_track_payload({"keyframes": [{"frame": 0, "camera": {"position": [math.nan, 0, 0]}}]})
    with pytest.raises(ValidationError):
        validate_track_payload({"keyframes": [{"frame": 0, "camera": {"fov": math.inf}}]})


def test_lenient_parser_replaces_non_finite_values():
    track = OmniCamTrack.from_dict({"keyframes": [{"frame": 0, "camera": {"position": [math.nan, 0, 0], "fov": math.inf}}]})
    camera = track.keyframes[0].camera
    assert all(math.isfinite(value) for value in camera.position)
    assert math.isfinite(camera.fov)


def test_strict_validation_clamps_ranges():
    track = validate_track_payload(
        {
            "fps": 500,
            "width": 99999,
            "duration_frames": 10,
            "keyframes": [{"frame": 999, "camera": {"fov": 400, "roll": 720, "zoom": 0, "near": -1, "far": -2}}],
        }
    )
    assert track["fps"] == 120
    assert track["width"] == 4096
    key = track["keyframes"][0]
    # A key past the end stays where it is: clamping it to the last frame folded
    # every dormant key onto duration-1, and the dedupe kept only one of them.
    assert key["frame"] == 999
    assert key["camera"]["fov"] == 150.0
    assert key["camera"]["roll"] == 180.0
    assert key["camera"]["zoom"] >= 0.01
    assert key["camera"]["far"] > key["camera"]["near"]


def test_whitelists_reject_unknown_modes():
    with pytest.raises(ValidationError):
        validate_track_payload({"render_mode": "path_traced"})
    with pytest.raises(ValidationError):
        validate_track_payload({"keyframes": [{"frame": 0, "camera": {}, "interpolation": "bounce"}]})
    with pytest.raises(ValidationError):
        validate_track_payload({"keyframes": [{"frame": 0, "camera": {"camera_type": "fisheye"}}]})
    with pytest.raises(ValidationError):
        validate_track_payload({"objects": [{"id": "a", "type": "volume"}]})
    with pytest.raises(ValidationError):
        validate_track_payload({"objects": [{"id": "a", "type": "cube", "material_mode": "glass"}]})


def test_object_validation_checks_ids_and_transforms():
    with pytest.raises(ValidationError):
        validate_track_payload({"objects": [{"id": "", "type": "cube"}]})
    with pytest.raises(ValidationError):
        validate_track_payload({"objects": [{"id": "dup", "type": "cube"}, {"id": "dup", "type": "sphere"}]})
    with pytest.raises(ValidationError):
        validate_track_payload({"objects": [{"id": "a", "type": "cube", "position": [0, 0]}]})
    cleaned = validate_track_payload({"objects": [{"id": "a", "type": "cube", "asset": "card.png [input]"}]})
    assert cleaned["objects"][0]["asset"] == "card.png [input]"
    with pytest.raises(ValidationError):
        validate_track_payload({"objects": [{"id": "a", "type": "card", "asset": {"bad": True}}]})


def test_limits_are_configurable():
    limits = TrackLimits(max_objects=1, max_keys_per_track=2, max_cameras=1)
    with pytest.raises(ValidationError):
        validate_track_payload({"objects": [{"id": "a", "type": "cube"}, {"id": "b", "type": "cube"}]}, limits)
    with pytest.raises(ValidationError):
        validate_track_payload(
            {"keyframes": [{"frame": i, "camera": {}} for i in range(3)]}, limits
        )
    with pytest.raises(ValidationError):
        validate_editor_state({"cameras": [{"id": "c1"}, {"id": "c2"}]}, limits)


def test_state_size_limit():
    limits = TrackLimits(max_state_bytes=200)
    with pytest.raises(ValidationError):
        validate_editor_state({"objects": [{"id": "a" * 500, "type": "cube"}]}, limits)


def test_migration_from_unversioned_payload():
    migrated = migrate_payload({"schemaVersion": 0, "durationFrames": 48, "renderMode": "grid", "custom_field": {"keep": True}}, TRACK_SCHEMA)
    assert migrated["schema_version"] == 1
    assert migrated["duration_frames"] == 48
    assert migrated["render_mode"] == "grid"
    assert migrated["custom_field"] == {"keep": True}  # unknown fields preserved


@pytest.mark.parametrize("schema,payload", [
    (TRACK_SCHEMA, {"schemaVersion": 0, "durationFrames": 48, "renderMode": "grid", "future": 7}),
    (SEQUENCE_SCHEMA, {"schemaVersion": 0, "durationFrames": 48, "shots": [], "future": 7}),
])
def test_migrations_are_idempotent_and_non_destructive(schema, payload):
    once = migrate_payload(payload, schema)
    twice = migrate_payload(once, schema)
    assert twice == once
    assert twice["future"] == 7


def test_newer_schema_is_rejected():
    with pytest.raises(ValueError):
        OmniCamTrack.from_dict({"schema_version": 99})


def test_track_from_dict_migrates_legacy_payload():
    track = OmniCamTrack.from_dict({"durationFrames": 48, "keyframes": [{"frame": 0, "camera": {"position": [1, 2, 3]}}]})
    assert track.duration_frames == 48
    assert track.schema_version == 1


def test_editor_state_to_primary_track_uses_playblast_camera():
    state = {
        "schema_version": 1,
        "fps": 30,
        "duration_frames": 20,
        "cameras": [
            {"id": "camera_1", "name": "Wide", "camera": {"position": [10, 5, 10]}, "keyframes": [{"frame": 0, "camera": {"position": [10, 5, 10]}}]},
            {"id": "camera_2", "name": "Close", "camera": {"position": [1, 1, 1]}, "keyframes": [{"frame": 0, "camera": {"position": [1, 1, 1]}}]},
        ],
        "active_camera_id": "camera_1",
        "playblast_camera_id": "camera_2",
    }
    track = editor_state_to_track(state)
    assert track["keyframes"][0]["camera"]["position"] == [1, 1, 1]
    assert track["metadata"]["camera_id"] == "camera_2"
    assert track["fps"] == 30


def test_editor_state_compiles_camera_look_at_constraint():
    state = {
        "duration_frames": 20,
        "objects": [{"id": "actor", "type": "human", "position": [1, 2, 3], "enabled": True}],
        "cameras": [{
            "id": "camera_1", "camera": {}, "keyframes": [],
            "target_object_id": "actor", "target_offset": [0, 1.5, -0.25],
        }],
        "active_camera_id": "camera_1",
    }
    track = editor_state_to_track(state)
    assert track["constraints"]["look_at"] == {
        "object_id": "actor", "offset": [0.0, 1.5, -0.25], "space": "world", "status": "active",
    }
    assert OmniCamTrack.from_dict(track).to_dict()["constraints"] == track["constraints"]


def test_editor_state_marks_missing_and_disabled_look_at_targets():
    base = {"cameras": [{"id": "cam", "camera": {}, "keyframes": [], "target_object_id": "actor"}], "active_camera_id": "cam"}
    missing = editor_state_to_track(base)
    assert missing["constraints"]["look_at"]["status"] == "missing_target"
    disabled = editor_state_to_track({**base, "objects": [{"id": "actor", "type": "human", "enabled": False}]})
    assert disabled["constraints"]["look_at"]["status"] == "disabled_target"


def test_editor_state_explicit_camera_selection():
    state = {"cameras": [{"id": "a", "camera": {"position": [0, 0, 1]}, "keyframes": []}, {"id": "b", "camera": {"position": [9, 9, 9]}, "keyframes": []}]}
    assert select_track_camera(state, "b")["id"] == "b"
    with pytest.raises(ValueError):
        select_track_camera(state, "missing")


def test_editor_state_minimal_payload_round_trip():
    track = editor_state_to_track({}, validate=False)
    parsed = OmniCamTrack.from_dict(track)
    assert parsed.fps == 24
    assert len(parsed.keyframes) == 1


def test_editor_state_validation_full_round_trip():
    state = validate_editor_state(
        {
            "cameras": [{"id": "camera_1", "camera": {"position": [6, 4, 6]}, "keyframes": [{"frame": 0, "camera": {}}]}],
            "active_camera_id": "camera_1",
        }
    )
    assert state["cameras"][0]["id"] == "camera_1"
    with pytest.raises(ValidationError):
        validate_editor_state({"cameras": [{"id": "camera_1", "camera": {}, "keyframes": []}], "active_camera_id": "ghost"})


def test_tangent_validation_round_trip():
    track = validate_track_payload(
        {
            "duration_frames": 11,
            "keyframes": [
                {"frame": 0, "camera": {}, "interpolation": "bezier", "tangents": {"mode": "free", "out_x": 0.4, "out_y": 2.5, "in_x": -0.2, "in_y": -1}},
                {"frame": 10, "camera": {}},
            ],
        }
    )
    tangents = track["keyframes"][0]["tangents"]
    assert tangents == {"mode": "free", "out_x": 0.4, "out_y": 2.5, "in_x": -0.2, "in_y": -1}
    parsed = OmniCamTrack.from_dict(track)
    assert parsed.keyframes[0].tangents["mode"] == "free"
    assert parsed.to_dict()["keyframes"][0]["tangents"]["out_y"] == 2.5


def test_tangent_validation_clamps_and_whitelists():
    with pytest.raises(ValidationError):
        validate_track_payload({"keyframes": [{"frame": 0, "camera": {}, "tangents": {"mode": "bounce"}}]})
    cleaned = validate_track_payload(
        {"keyframes": [{"frame": 0, "camera": {}, "tangents": {"mode": "free", "out_x": 5, "in_x": 0.5, "out_y": float("nan") if False else 0}}]}
    )
    assert cleaned["keyframes"][0]["tangents"]["out_x"] == 0.99
    assert cleaned["keyframes"][0]["tangents"]["in_x"] == -0.01
    with pytest.raises(ValidationError):
        validate_track_payload({"keyframes": [{"frame": 0, "camera": {}, "tangents": {"out_y": math.inf}}]})


def test_track_payload_size_limit_applies_outside_editor_state():
    with pytest.raises(ValidationError, match="track payload"):
        validate_track_payload({"metadata": {"padding": "x" * 128}}, TrackLimits(max_state_bytes=64))


def test_unversioned_sequence_has_a_registered_migration():
    migrated = migrate_payload({"schemaVersion": 0, "durationFrames": 10, "shots": []}, SEQUENCE_SCHEMA)
    assert migrated["schema_version"] == 1
    assert migrated["duration_frames"] == 10


@pytest.mark.parametrize("objects", [
    [{"id": "a", "parent_id": "missing"}],
    [{"id": "a", "parent_id": "a"}],
    [{"id": "a", "parent_id": "b"}, {"id": "b", "parent_id": "a"}],
    [{"id": "a", "parent_id": "b"}, {"id": "b", "parent_id": "c"}, {"id": "c", "parent_id": "a"}],
])
def test_object_hierarchy_rejects_missing_parents_and_cycles(objects):
    with pytest.raises(ValidationError):
        validate_track_payload({"objects": objects})


def test_beauty_render_mode_is_accepted_and_unknown_modes_are_not():
    """The lit "beauty" mode records the studio viewport instead of a flat proxy."""
    assert validate_track_payload({"render_mode": "beauty"})["render_mode"] == "beauty"
    with pytest.raises(ValidationError, match="render_mode"):
        validate_track_payload({"render_mode": "cinematic"})


def test_frontend_state_limits_match_the_python_validator():
    """The editor renders a workflow before Python ever sees it.

    sanitizeState() therefore has to enforce the same ceilings; if the two drift,
    a workflow the browser happily renders gets rejected at queue time (or, worse,
    a hostile one is rendered before being rejected).
    """
    import re
    from pathlib import Path

    from omnicam.core.validation import DEFAULT_LIMITS

    source = (Path(__file__).resolve().parents[1] / "web-src" / "director" / "core.js").read_text(encoding="utf-8")
    block = re.search(r"export const STATE_LIMITS = \{(.*?)\};", source, re.S)
    assert block, "STATE_LIMITS must stay declared in web-src/director/core.js"
    values = dict(re.findall(r"(\w+):\s*([0-9*\s]+),", block.group(1)))

    def number(key: str) -> int:
        # The values are plain integers or a digits-only product such as 120 * 120.
        return math.prod(int(part) for part in values[key].split("*"))

    assert number("maxCameras") == DEFAULT_LIMITS.max_cameras
    assert number("maxObjects") == DEFAULT_LIMITS.max_objects
    assert number("maxKeysPerTrack") == DEFAULT_LIMITS.max_keys_per_track
    assert number("maxDurationFrames") == DEFAULT_LIMITS.max_duration_frames


def test_metadata_is_bounded_to_the_documented_limits():
    """docs/SECURITY.md advertises 4096 characters per text field.

    Metadata was exempt, so an arbitrarily large string rode along in every
    workflow and every adapter payload.
    """
    from omnicam.core.validation import MAX_METADATA_ENTRIES, MAX_TEXT_LENGTH

    payload = validate_track_payload({"metadata": {
        "note": "x" * 100_000,
        "nested": {"deep": "y" * 100_000},
        "listed": ["z" * 100_000],
        "not_a_number": float("nan"),
        **{f"k{i}": i for i in range(200)},
    }})
    metadata = payload["metadata"]
    assert len(metadata["note"]) == MAX_TEXT_LENGTH
    assert len(metadata["nested"]["deep"]) == MAX_TEXT_LENGTH
    assert len(metadata["listed"][0]) == MAX_TEXT_LENGTH
    assert metadata["not_a_number"] == 0.0, "non-finite metadata must not survive"
    assert len(metadata) <= MAX_METADATA_ENTRIES


def test_metadata_keeps_ordinary_values_intact():
    payload = validate_track_payload({"metadata": {
        "camera_id": "cam_1", "count": 3, "ratio": 1.5, "flag": True, "empty": None,
    }})
    assert payload["metadata"] == {
        "camera_id": "cam_1", "count": 3, "ratio": 1.5, "flag": True, "empty": None,
    }


def test_dormant_keys_survive_a_shortened_timeline():
    """Shortening a shot must not merge the keys past its new end.

    Clamping folded 160, 180 and 200 onto the last frame, where the dedupe kept
    exactly one of them -- so re-lengthening the shot could not bring them back,
    and the exported trajectory ended on the wrong camera.
    """
    track = validate_track_payload(
        {
            "duration_frames": 150,
            "keyframes": [
                {"frame": frame, "camera": {"position": [frame, 0, 0], "target": [0, 0, 0]}}
                for frame in (0, 100, 160, 180, 200)
            ],
        }
    )
    assert [key["frame"] for key in track["keyframes"]] == [0, 100, 160, 180, 200]
    assert track["keyframes"][-1]["camera"]["position"] == [200.0, 0.0, 0.0]


def test_sequence_is_a_valid_playblast_target():
    from omnicam.core.sequence import SEQUENCE_TARGET

    state = validate_editor_state(
        {
            "duration_frames": 60,
            "cameras": [{"id": "cam_a", "keyframes": []}, {"id": "cam_b", "keyframes": []}],
            "active_camera_id": "cam_a",
            "playblast_camera_id": SEQUENCE_TARGET,
        }
    )
    assert state["playblast_camera_id"] == SEQUENCE_TARGET

    # An actual typo is still refused.
    with pytest.raises(ValidationError):
        validate_editor_state(
            {
                "cameras": [{"id": "cam_a", "keyframes": []}],
                "active_camera_id": "cam_a",
                "playblast_camera_id": "cam_typo",
            }
        )


def test_metadata_nesting_is_bounded_rather_than_recursed_into():
    """Deep nesting is a malformed payload, not a RecursionError at the route."""
    deep: dict = {"leaf": "kept"}
    for _ in range(MAX_METADATA_DEPTH + 5):
        deep = {"nested": deep}

    bounded = validate_metadata(deep)

    depth = 0
    cursor = bounded
    while isinstance(cursor, dict) and "nested" in cursor:
        cursor = cursor["nested"]
        depth += 1
    assert depth == MAX_METADATA_DEPTH
    assert cursor == {}


def test_a_payload_too_nested_to_encode_is_a_validation_error():
    """json.dumps recurses while measuring, so the 500 has to become a 400."""
    # json's C encoder has its own stack budget, well above sys.getrecursionlimit();
    # this is comfortably past it while staying far below the route body cap.
    payload: dict = {"metadata": {}}
    cursor = payload["metadata"]
    for _ in range(20_000):
        cursor["nested"] = {}
        cursor = cursor["nested"]

    with pytest.raises(ValidationError, match="nested too deeply"):
        validate_track_payload(payload)
