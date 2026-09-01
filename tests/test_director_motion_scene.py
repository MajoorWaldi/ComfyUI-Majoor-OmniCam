from __future__ import annotations

import json

import pytest

pytest.importorskip("comfy_api.latest")

from omnicam.nodes.director import MajoorOmniCamDirector


def _state() -> dict:
    return {
        "active_camera_id": "wide",
        "playblast_camera_id": "close",
        "cameras": [
            {
                "id": "wide",
                "name": "Wide",
                "camera": {"position": [0, 2, 6], "target": [0, 1, 0]},
                "keyframes": [],
            },
            {
                "id": "close",
                "name": "Close",
                "camera": {"position": [1, 1.5, 2], "target": [0, 1.5, 0]},
                "keyframes": [],
            },
        ],
        "objects": [],
        "motion_layers": [],
    }


def test_director_schema_is_exact_motion_scene_contract():
    schema = MajoorOmniCamDirector.define_schema()

    assert [output.display_name for output in schema.outputs] == [
        "motion_scene",
        "playblast_video",
        "audio",
    ]
    assert [output.io_type for output in schema.outputs] == [
        "OMNICAM_MOTION_SCENE",
        "VIDEO",
        "AUDIO",
    ]


def test_director_outputs_motion_scene_without_decoding_playblast(monkeypatch):
    from omnicam.nodes import director as director_module

    video = object()
    audio = object()
    monkeypatch.setattr(director_module, "as_video", lambda value, fps: value)
    monkeypatch.setattr(director_module, "resolve_video", lambda path: None)

    output = MajoorOmniCamDirector.execute(
        state_json=json.dumps(_state()),
        recording_path="",
        card_asset="card.png",
        width=1280,
        height=720,
        fps=24,
        duration_seconds=2.0,
        render_mode="omni_ref",
        video=video,
        audio=audio,
    )

    assert len(output.args) == 3
    scene, playblast, output_audio = output.args
    assert [camera["id"] for camera in scene["cameras"]] == ["wide", "close"]
    assert scene["active_camera_id"] == "wide"
    assert scene["playblast_camera_id"] == "close"
    assert scene["metadata"]["card_asset"] == "card.png"
    assert scene["metadata"]["generator"] == "ComfyUI-Majoor-OmniCam"
    assert playblast is video
    assert output_audio is audio
