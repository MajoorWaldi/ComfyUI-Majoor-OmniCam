from __future__ import annotations

import copy
import math

import pytest

from omnicam.core.motion_scene import (
    MOTION_SCENE_IO_TYPE,
    MotionScene,
    motion_scene_from_camera_track,
)


def _scene_payload() -> dict:
    return {
        "version": 1,
        "timeline": {"duration_seconds": 5.0, "authoring_fps": 24.0},
        "canvas": {"width": 1280, "height": 720},
        "cameras": [
            {
                "id": "camera_1",
                "label": "Camera 1",
                "enabled": True,
                "track": {
                    "schema_version": 1,
                    "fps": 24,
                    "duration_frames": 120,
                    "width": 1280,
                    "height": 720,
                    "render_mode": "omni_ref",
                    "keyframes": [
                        {
                            "frame": 0,
                            "camera": {
                                "position": [6.0, 4.0, 6.0],
                                "target": [0.0, 1.5, 0.0],
                                "fov": 35.0,
                                "roll": 0.0,
                                "camera_type": "perspective",
                                "zoom": 1.0,
                                "near": 0.01,
                                "far": 10000.0,
                            },
                            "interpolation": "ease",
                        }
                    ],
                    "objects": [],
                    "metadata": {},
                },
            }
        ],
        "active_camera_id": "camera_1",
        "playblast_camera_id": "camera_1",
        "objects": [{"id": "subject", "type": "null", "position": [0.0, 1.5, 0.0]}],
        "motion_layers": [
            {
                "id": "hero_face",
                "label": "Hero Face",
                "enabled": True,
                "semantic": "screen_point",
                "source_kind": "manual_2d",
                "keys": [
                    {
                        "time_seconds": 0.0,
                        "x": 0.25,
                        "y": 0.4,
                        "visible": True,
                        "interpolation": "smooth",
                    },
                    {
                        "time_seconds": 5.0,
                        "x": 0.75,
                        "y": 0.6,
                        "visible": False,
                        "interpolation": "hold",
                    },
                ],
                "source": {"tool": "track"},
            }
        ],
        "cuts": [{"time_seconds": 0.0, "camera_id": "camera_1"}],
        "metadata": {"shot": "A001"},
    }


def test_motion_scene_round_trip_is_stable_and_preserves_what_was_authored():
    """The canonical form is the validated form, so the property is idempotence.

    Objects are normalized on the way in -- defaults filled, transforms
    completed -- because a scene now validates them instead of waving them
    through. Parsing the canonical output again must therefore change nothing.
    """
    payload = _scene_payload()

    scene = MotionScene.from_dict(payload)
    canonical = scene.to_dict()

    assert MotionScene.from_dict(canonical).to_dict() == canonical
    assert MotionScene.from_json(scene.to_json()).to_dict() == canonical

    # Everything the author actually wrote survives untouched.
    for key in ("version", "timeline", "canvas", "active_camera_id",
                "playblast_camera_id", "motion_layers", "cuts", "metadata"):
        assert canonical[key] == payload[key], key
    assert canonical["objects"][0]["id"] == "subject"
    assert canonical["objects"][0]["type"] == "null"
    assert canonical["objects"][0]["position"] == [0.0, 1.5, 0.0]
    assert scene.motion_layers[0].keys[1].visible is False


@pytest.mark.parametrize(
    ("path", "value"),
    [
        (("timeline", "duration_seconds"), math.nan),
        (("timeline", "authoring_fps"), math.inf),
        (("motion_layers", 0, "keys", 0, "time_seconds"), -math.inf),
        (("motion_layers", 0, "keys", 0, "x"), math.nan),
        (("motion_layers", 0, "keys", 0, "y"), math.inf),
        (("cameras", 0, "track", "keyframes", 0, "camera", "position", 0), math.nan),
    ],
)
def test_motion_scene_rejects_non_finite_numbers(path: tuple, value: float):
    payload = _scene_payload()
    target = payload
    for component in path[:-1]:
        target = target[component]
    target[path[-1]] = value

    with pytest.raises(ValueError, match="finite"):
        MotionScene.from_dict(payload)


@pytest.mark.parametrize(("field", "value"), [("x", -0.01), ("x", 1.01), ("y", -1), ("y", 2)])
def test_motion_scene_rejects_coordinates_outside_normalized_canvas(field: str, value: float):
    payload = _scene_payload()
    payload["motion_layers"][0]["keys"][0][field] = value

    with pytest.raises(ValueError, match=r"0\.\.1"):
        MotionScene.from_dict(payload)


def test_motion_scene_rejects_malformed_visibility_and_time():
    visibility = _scene_payload()
    visibility["motion_layers"][0]["keys"][0]["visible"] = 1
    with pytest.raises(ValueError, match="visible must be a boolean"):
        MotionScene.from_dict(visibility)

    late_key = _scene_payload()
    late_key["motion_layers"][0]["keys"][1]["time_seconds"] = 5.01
    with pytest.raises(ValueError, match="outside timeline"):
        MotionScene.from_dict(late_key)


def test_motion_scene_rejects_a_semantic_it_does_not_actually_support():
    """v1 resolvers all assume screen_point; nothing else is implemented."""
    payload = _scene_payload()
    payload["motion_layers"][0]["semantic"] = "pose"
    with pytest.raises(ValueError, match="semantic must be one of"):
        MotionScene.from_dict(payload)


def test_motion_scene_enforces_camera_identity_invariants():
    duplicate = _scene_payload()
    duplicate["cameras"].append(copy.deepcopy(duplicate["cameras"][0]))
    with pytest.raises(ValueError, match="duplicate camera id"):
        MotionScene.from_dict(duplicate)

    missing_active = _scene_payload()
    missing_active["active_camera_id"] = "missing"
    with pytest.raises(ValueError, match="active_camera_id"):
        MotionScene.from_dict(missing_active)

    missing_playblast = _scene_payload()
    missing_playblast["playblast_camera_id"] = "missing"
    with pytest.raises(ValueError, match="playblast_camera_id"):
        MotionScene.from_dict(missing_playblast)


def test_motion_scene_enforces_camera_timeline_and_canvas_invariants():
    wrong_canvas = _scene_payload()
    wrong_canvas["cameras"][0]["track"]["width"] = 640
    with pytest.raises(ValueError, match="dimensions do not match"):
        MotionScene.from_dict(wrong_canvas)

    wrong_duration = _scene_payload()
    wrong_duration["cameras"][0]["track"]["duration_frames"] = 119
    with pytest.raises(ValueError, match="duration does not match"):
        MotionScene.from_dict(wrong_duration)

    # A camera sampled at a different rate than the timeline authored on would
    # put every frame-keyed object projection on the wrong temporal grid.
    wrong_fps = _scene_payload()
    wrong_fps["cameras"][0]["track"]["fps"] = 30
    wrong_fps["cameras"][0]["track"]["duration_frames"] = 150  # keep 5.0s
    with pytest.raises(ValueError, match="does not match the scene authoring fps"):
        MotionScene.from_dict(wrong_fps)


def test_motion_scene_comfy_type_is_stable():
    """The wire name is frozen: renaming it silently breaks every saved workflow."""
    assert MOTION_SCENE_IO_TYPE == "OMNICAM_MOTION_SCENE"


def test_the_comfy_socket_is_built_from_the_domain_constant():
    """Guards the binding itself, but only where ComfyUI is actually installed.

    Keeping this out of the module-level imports is what lets the model-agnostic
    lane -- numpy and nothing else -- collect and run this file at all.
    """
    pytest.importorskip("comfy_api.latest")
    from omnicam.nodes import OMNICAM_MOTION_SCENE

    assert OMNICAM_MOTION_SCENE.io_type == MOTION_SCENE_IO_TYPE


def test_camera_track_wraps_into_a_one_camera_motion_scene_without_changing_the_solve():
    track = copy.deepcopy(_scene_payload()["cameras"][0]["track"])
    track["metadata"] = {
        "source": "omnicam_extractor",
        "extractor_fingerprint": "solve-fingerprint",
    }

    scene = motion_scene_from_camera_track(track)

    assert scene.timeline.duration_seconds == 5.0
    assert scene.timeline.authoring_fps == 24.0
    assert scene.canvas.to_dict() == {"width": 1280, "height": 720}
    assert scene.active_camera_id == "extracted_camera"
    assert scene.playblast_camera_id == "extracted_camera"
    assert scene.cameras[0].track.to_dict() == track
    assert scene.motion_layers == []
    assert scene.cuts == []
    assert scene.metadata == {
        "source": "omnicam_extractor",
        "extractor_fingerprint": "solve-fingerprint",
    }


# ---------------------------------------------------------------------------
# Typed cuts
# ---------------------------------------------------------------------------

def _scene_with_cuts(cuts: list[dict]) -> dict:
    payload = _scene_payload()
    second = copy.deepcopy(payload["cameras"][0])
    second["id"] = "camera_2"
    second["label"] = "Camera 2"
    payload["cameras"].append(second)
    payload["cuts"] = cuts
    return payload


def test_a_cut_naming_an_unknown_camera_is_rejected():
    payload = _scene_with_cuts([{"camera_id": "ghost", "time_seconds": 0.0}])

    with pytest.raises(ValueError, match="unknown camera 'ghost'"):
        MotionScene.from_dict(payload)


def test_cuts_must_be_ordered_by_start_time():
    payload = _scene_with_cuts([
        {"camera_id": "camera_1", "time_seconds": 2.0},
        {"camera_id": "camera_2", "time_seconds": 1.0},
    ])

    with pytest.raises(ValueError, match="ordered by start time"):
        MotionScene.from_dict(payload)


def test_overlapping_shots_are_rejected():
    payload = _scene_with_cuts([
        {"camera_id": "camera_1", "time_seconds": 0.0, "end_time_seconds": 3.0},
        {"camera_id": "camera_2", "time_seconds": 1.0},
    ])

    with pytest.raises(ValueError, match="inside the previous shot"):
        MotionScene.from_dict(payload)


def test_shots_may_meet_exactly_because_the_end_is_exclusive():
    payload = _scene_with_cuts([
        {"camera_id": "camera_1", "time_seconds": 0.0, "end_time_seconds": 2.0},
        {"camera_id": "camera_2", "time_seconds": 2.0},
    ])

    scene = MotionScene.from_dict(payload)

    assert scene.is_multi_shot
    assert scene.shot_camera_ids == ["camera_1", "camera_2"]


def test_a_cut_past_the_end_of_the_timeline_is_rejected():
    payload = _scene_with_cuts([{"camera_id": "camera_1", "time_seconds": 99.0}])

    with pytest.raises(ValueError, match="past the"):
        MotionScene.from_dict(payload)


def test_a_cut_that_ends_past_the_timeline_is_rejected():
    payload = _scene_with_cuts([
        {"camera_id": "camera_1", "time_seconds": 3.0, "end_time_seconds": 8.0},
    ])

    with pytest.raises(ValueError, match="past the"):
        MotionScene.from_dict(payload)


def test_a_cut_that_ends_before_it_starts_is_rejected():
    payload = _scene_with_cuts([
        {"camera_id": "camera_1", "time_seconds": 2.0, "end_time_seconds": 1.0},
    ])

    with pytest.raises(ValueError, match="at or before its"):
        MotionScene.from_dict(payload)


def test_repeated_cuts_to_one_camera_are_a_single_shot_camera():
    """Cutting back to the same camera is not a multi-camera edit."""
    payload = _scene_with_cuts([
        {"camera_id": "camera_1", "time_seconds": 0.0, "end_time_seconds": 1.0},
        {"camera_id": "camera_1", "time_seconds": 1.0},
    ])

    scene = MotionScene.from_dict(payload)

    assert scene.shot_camera_ids == ["camera_1"]
    assert scene.is_multi_shot is False


def test_a_duplicate_object_id_is_rejected():
    payload = _scene_payload()
    payload["objects"] = [
        {"id": "subject", "type": "null", "position": [0.0, 0.0, 0.0]},
        {"id": "subject", "type": "cube", "position": [1.0, 0.0, 0.0]},
    ]

    with pytest.raises(ValueError, match="duplicates 'subject'"):
        MotionScene.from_dict(payload)


def test_an_object_parent_cycle_is_rejected():
    payload = _scene_payload()
    payload["objects"] = [
        {"id": "a", "type": "null", "parent_id": "b"},
        {"id": "b", "type": "null", "parent_id": "a"},
    ]

    with pytest.raises(ValueError, match="cycle"):
        MotionScene.from_dict(payload)


def test_an_unknown_object_type_is_rejected():
    payload = _scene_payload()
    payload["objects"] = [{"id": "subject", "type": "teapot"}]

    with pytest.raises(ValueError, match=r"objects\[0\]\.type"):
        MotionScene.from_dict(payload)
