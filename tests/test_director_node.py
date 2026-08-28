"""Unit tests for the MajoorOmniCamDirector public node."""

import json

import pytest

pytest.importorskip("comfy_api.latest")

from omnicam.nodes.director import MajoorOmniCamDirector


def test_director_multi_camera_sequence_output():
    # Simulate a director state with two cameras
    director_state = {
        "active_camera_id": "cam_1",
        "playblast_camera_id": "cam_1",
        "cameras": [
            {
                "id": "cam_1",
                "name": "Establishing Wide",
                "camera": {"position": [0, 2, 5], "target": [0, 1, 0], "fov": 35.0, "roll": 0.0},
                "keyframes": [{"frame": 0, "camera": {"position": [0, 2, 5], "target": [0, 1, 0], "fov": 35.0, "roll": 0.0}}],
            },
            {
                "id": "cam_2",
                "name": "Close Up Subject",
                "camera": {"position": [1, 1.5, 2], "target": [0, 1.5, 0], "fov": 50.0, "roll": 0.0},
                "keyframes": [{"frame": 0, "camera": {"position": [1, 1.5, 2], "target": [0, 1.5, 0], "fov": 50.0, "roll": 0.0}}],
            },
        ],
        "duration_frames": 48,
        "fps": 24,
        "width": 1280,
        "height": 720,
        "render_mode": "omni_ref",
    }

    out = MajoorOmniCamDirector.execute(
        state_json=json.dumps(director_state),
        recording_path="",
        card_asset="",
        width=1280,
        height=720,
        fps=24,
        duration_seconds=2.0,
        render_mode="omni_ref",
    )

    # outputs: camera_track, proxy_video, audio, shot_collection
    outputs = out.outputs if hasattr(out, "outputs") else tuple(out)
    assert len(outputs) == 4
    track_dict, _proxy_video, _audio, shot_collection = outputs

    assert track_dict["metadata"]["camera_id"] == "cam_1"
    assert shot_collection["kind"] == "omnicam_shot_collection"
    assert [shot["name"] for shot in shot_collection["shots"]] == ["Establishing Wide", "Close Up Subject"]
    assert shot_collection["metadata"]["missing_proxy_camera_ids"] == ["cam_1", "cam_2"]


def test_director_public_display_name_is_unprefixed():
    assert MajoorOmniCamDirector.define_schema().display_name == "OmniCam Director"


def test_director_exposes_four_focused_outputs():
    outputs = MajoorOmniCamDirector.define_schema().outputs
    assert [output.display_name for output in outputs] == [
        "camera_track", "proxy_video", "audio", "shot_collection",
    ]


def test_director_validates_authoritative_widget_duration():
    state = {
        "duration_frames": 120,
        "keyframes": [
            {"frame": 0, "camera": {}},
            {"frame": 119, "camera": {"position": [1, 2, 3]}},
        ],
    }
    out = MajoorOmniCamDirector.execute(
        state_json=json.dumps(state), recording_path="", card_asset="",
        width=640, height=360, fps=10, duration_seconds=1, render_mode="grid",
    )
    track = (out.outputs if hasattr(out, "outputs") else tuple(out))[0]
    assert track["duration_frames"] == 10
    assert track["keyframes"][-1]["frame"] == 9
    assert (track["width"], track["height"], track["fps"], track["render_mode"]) == (640, 360, 10, "grid")


def test_director_proxy_matches_selected_playblast_camera(monkeypatch):
    from omnicam.nodes import director as director_module

    monkeypatch.setattr(director_module, "resolve_video", lambda path: f"video:{path}" if path else None)
    state = {
        "playblast_camera_id": "cam_b",
        "cameras": [
            {"id": "cam_a", "name": "A", "recording_path": "a.webm [input]", "camera": {}, "keyframes": []},
            {"id": "cam_b", "name": "B", "recording_path": "b.webm [input]", "camera": {}, "keyframes": []},
        ],
    }
    out = MajoorOmniCamDirector.execute(
        state_json=json.dumps(state), recording_path="stale.webm [input]", card_asset="",
        width=1280, height=720, fps=24, duration_seconds=5, render_mode="omni_ref",
    )
    outputs = out.outputs if hasattr(out, "outputs") else tuple(out)
    assert outputs[0]["metadata"]["camera_id"] == "cam_b"
    assert outputs[1] == "video:b.webm [input]"
    assert outputs[3]["shots"][1]["metadata"]["recording_path"] == "b.webm [input]"
    assert outputs[3]["metadata"]["ready_count"] == 2
