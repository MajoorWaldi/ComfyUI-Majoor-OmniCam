from __future__ import annotations

from omnicam.core.compiler import compile_editor_scene
from omnicam.core.motion_scene import CutEvent
from omnicam.core.sequence import SEQUENCE_TARGET
from omnicam.core.validation import ValidationError


def _editor_state() -> dict:
    return {
        "schema_version": 1,
        "fps": 24,
        "duration_frames": 48,
        "width": 1280,
        "height": 720,
        "render_mode": "omni_ref",
        "active_camera_id": "wide",
        "playblast_camera_id": SEQUENCE_TARGET,
        "cameras": [
            {
                "id": "wide",
                "name": "Wide",
                "camera": {"position": [0, 2, 6], "target": [0, 1, 0]},
                "keyframes": [
                    {
                        "frame": 0,
                        "camera": {"position": [0, 2, 6], "target": [0, 1, 0]},
                        "interpolation": "linear",
                    }
                ],
            },
            {
                "id": "close",
                "name": "Close",
                "camera": {"position": [1, 1.5, 2], "target": [0, 1.5, 0]},
                "keyframes": [
                    {
                        "frame": 0,
                        "camera": {"position": [1, 1.5, 2], "target": [0, 1.5, 0]},
                        "interpolation": "linear",
                    }
                ],
            },
        ],
        "objects": [
            {
                "id": "subject",
                "name": "Subject",
                "type": "null",
                "position": [0, 1, 0],
                "rotation": [0, 0, 0],
                "size": [1, 1, 1],
                "enabled": True,
                "keyframes": [],
            }
        ],
        "motion_layers": [
            {
                "id": "subject_track",
                "label": "Subject Track",
                "enabled": True,
                "semantic": "screen_point",
                "source_kind": "manual_2d",
                "keys": [
                    {
                        "time_seconds": 0.0,
                        "x": 0.5,
                        "y": 0.5,
                        "visible": True,
                        "interpolation": "linear",
                    }
                ],
                "source": {"object_id": "subject"},
            }
        ],
        "sequence": {
            "enabled": True,
            "cuts": [
                {"camera_id": "wide", "start": 0},
                {"camera_id": "close", "start": 24},
            ],
        },
        "metadata": {"production": "demo"},
    }


def test_compile_editor_scene_preserves_multicamera_scene_and_converts_cuts():
    scene = compile_editor_scene(_editor_state())

    assert scene.timeline.duration_seconds == 2.0
    assert scene.timeline.authoring_fps == 24.0
    assert (scene.canvas.width, scene.canvas.height) == (1280, 720)
    assert [camera.id for camera in scene.cameras] == ["wide", "close"]
    assert [camera.label for camera in scene.cameras] == ["Wide", "Close"]
    assert scene.cameras[1].track.keyframes[0].camera.position == [1.0, 1.5, 2.0]
    assert scene.active_camera_id == "wide"
    assert scene.playblast_camera_id == "wide"
    assert scene.objects[0]["id"] == "subject"
    assert scene.motion_layers[0].source == {"object_id": "subject"}
    # Cuts are typed now, and the exclusive end is what lets two shots meet at
    # 1.0s without overlapping.
    assert scene.cuts == [
        CutEvent(camera_id="wide", time_seconds=0.0, end_time_seconds=1.0),
        CutEvent(camera_id="close", time_seconds=1.0, end_time_seconds=2.0),
    ]
    assert [cut.to_dict() for cut in scene.cuts] == [
        {"camera_id": "wide", "time_seconds": 0.0, "end_time_seconds": 1.0},
        {"camera_id": "close", "time_seconds": 1.0, "end_time_seconds": 2.0},
    ]
    assert scene.metadata == {
        "production": "demo",
        "source_schema": "OMNICAM_EDITOR_STATE",
        "playblast_target": SEQUENCE_TARGET,
    }


def test_compile_editor_scene_synthesizes_legacy_top_level_camera():
    scene = compile_editor_scene(
        {
            "fps": 30,
            "duration_frames": 60,
            "width": 640,
            "height": 360,
            "camera": {"position": [2, 3, 4], "target": [0, 1, 0]},
            "keyframes": [],
        }
    )

    assert [camera.id for camera in scene.cameras] == ["camera_1"]
    assert scene.cameras[0].track.keyframes[0].camera.position == [2.0, 3.0, 4.0]
    assert scene.active_camera_id == scene.playblast_camera_id == "camera_1"


def test_compile_editor_scene_reuses_strict_editor_validation():
    state = _editor_state()
    state["active_camera_id"] = "missing"

    try:
        compile_editor_scene(state)
    except ValidationError as error:
        assert "active_camera_id" in str(error)
    else:
        raise AssertionError("compile_editor_scene accepted an unknown active camera")
