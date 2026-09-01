from __future__ import annotations

import copy
import math

import pytest

from omnicam.core.motion_scene import MotionScene, motion_scene_from_camera_track
from omnicam.nodes import OMNICAM_MOTION_SCENE


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


def test_motion_scene_round_trip_is_lossless():
    payload = _scene_payload()

    scene = MotionScene.from_dict(payload)

    assert scene.to_dict() == payload
    assert MotionScene.from_json(scene.to_json()).to_dict() == payload
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


def test_motion_scene_comfy_type_is_stable():
    assert OMNICAM_MOTION_SCENE.io_type == "OMNICAM_MOTION_SCENE"


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
