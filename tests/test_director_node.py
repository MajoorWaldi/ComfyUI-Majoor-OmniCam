"""Unit tests for the MajoorOmniCamDirector public node."""

import json

import pytest

pytest.importorskip("comfy_api.latest")

from omnicam.core.sequence import SEQUENCE_TARGET
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
    # The widget duration wins, but the key beyond it is kept rather than folded
    # onto the last frame: sampling still interpolates toward it, exactly as the
    # editor viewport does, and re-lengthening the shot finds it again.
    assert track["keyframes"][-1]["frame"] == 119
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


def _edit_state(**overrides):
    state = {
        "active_camera_id": "cam_1",
        "playblast_camera_id": SEQUENCE_TARGET,
        "cameras": [
            {
                "id": "cam_1",
                "name": "Wide",
                "camera": {"position": [0, 2, 5], "target": [0, 1, 0]},
                "keyframes": [
                    {"frame": 0, "camera": {"position": [0, 2, 5], "target": [0, 1, 0]}},
                    {"frame": 47, "camera": {"position": [0, 2, 9], "target": [0, 1, 0]}},
                ],
            },
            {
                "id": "cam_2",
                "name": "Close",
                "camera": {"position": [1, 1.5, 2], "target": [0, 1.5, 0]},
                "keyframes": [{"frame": 0, "camera": {"position": [1, 1.5, 2], "target": [0, 1.5, 0]}}],
            },
        ],
        "duration_frames": 48,
        "fps": 24,
        "width": 1280,
        "height": 720,
        "render_mode": "omni_ref",
        "sequence": {"enabled": True, "cuts": [{"camera_id": "cam_1", "start": 0}, {"camera_id": "cam_2", "start": 24}], "recording_path": ""},
    }
    state.update(overrides)
    return state


def _run(state):
    out = MajoorOmniCamDirector.execute(
        state_json=json.dumps(state), recording_path="", card_asset="",
        width=1280, height=720, fps=24, duration_seconds=2.0, render_mode="omni_ref",
    )
    outputs = out.outputs if hasattr(out, "outputs") else tuple(out)
    return outputs[0], outputs[3]


def test_director_exports_the_edit_as_its_own_shot():
    _track, collection = _run(_edit_state())
    assert [shot["name"] for shot in collection["shots"]] == ["Wide", "Close", "Sequence"]
    assert collection["metadata"]["sequence"]["cuts"] == [
        {"camera_id": "cam_1", "start": 0, "end": 23},
        {"camera_id": "cam_2", "start": 24, "end": 47},
    ]
    assert collection["metadata"]["sequence"]["is_playblast_target"] is True


def test_the_merged_track_follows_the_cuts_frame_by_frame():
    """A cut is a discontinuity, so the exported track has to be baked per frame.

    Interpolating between sparse keys would slide the camera across the cut
    instead of switching at it, and the export would not match the proxy.
    """
    _track, collection = _run(_edit_state())
    sequence_shot = next(shot for shot in collection["shots"] if shot["id"] == SEQUENCE_TARGET)
    keys = sequence_shot["camera_track"]["keyframes"]
    assert [key["frame"] for key in keys] == list(range(48))
    # cam_1 dollies back over its half; cam_2 is static and elsewhere.
    assert keys[0]["camera"]["position"][2] == pytest.approx(5.0)
    assert keys[23]["camera"]["position"][2] > 5.0
    assert keys[24]["camera"]["position"] == pytest.approx([1.0, 1.5, 2.0])
    assert keys[47]["camera"]["position"] == pytest.approx([1.0, 1.5, 2.0])


def test_an_edit_that_is_off_adds_no_sequence_shot():
    state = _edit_state(playblast_camera_id="cam_1")
    state["sequence"]["enabled"] = False
    _track, collection = _run(state)
    assert [shot["id"] for shot in collection["shots"]] == ["cam_1", "cam_2"]
    assert collection["metadata"]["sequence"]["enabled"] is False
