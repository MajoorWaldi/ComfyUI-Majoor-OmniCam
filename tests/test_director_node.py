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

    # outputs: motion_scene, playblast_video, audio
    outputs = out.outputs if hasattr(out, "outputs") else tuple(out)
    assert len(outputs) == 3
    motion_scene, _playblast_video, _audio = outputs

    assert motion_scene["playblast_camera_id"] == "cam_1"
    assert [camera["label"] for camera in motion_scene["cameras"]] == [
        "Establishing Wide",
        "Close Up Subject",
    ]


def test_director_public_display_name_is_unprefixed():
    assert MajoorOmniCamDirector.define_schema().display_name == "OmniCam Director"


def test_director_exposes_three_focused_outputs():
    outputs = MajoorOmniCamDirector.define_schema().outputs
    assert [output.display_name for output in outputs] == [
        "motion_scene", "playblast_video", "audio",
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
    scene = (out.outputs if hasattr(out, "outputs") else tuple(out))[0]
    track = scene["cameras"][0]["track"]
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
    assert outputs[0]["playblast_camera_id"] == "cam_b"
    assert outputs[1] == "video:b.webm [input]"
    assert outputs[0]["metadata"]["recording_path"] == "b.webm [input]"


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
    return outputs[0]


def test_director_exports_the_edit_as_motion_scene_cuts():
    scene = _run(_edit_state())
    assert scene["cuts"] == [
        {"camera_id": "cam_1", "time_seconds": 0.0, "end_time_seconds": 1.0},
        {"camera_id": "cam_2", "time_seconds": 1.0, "end_time_seconds": 2.0},
    ]
    assert scene["metadata"]["playblast_target"] == SEQUENCE_TARGET


def test_motion_scene_keeps_sparse_camera_tracks_around_cuts():
    scene = _run(_edit_state())
    tracks = {camera["id"]: camera["track"] for camera in scene["cameras"]}
    assert [key["frame"] for key in tracks["cam_1"]["keyframes"]] == [0, 47]
    assert tracks["cam_2"]["keyframes"][0]["camera"]["position"] == pytest.approx(
        [1.0, 1.5, 2.0]
    )


def test_an_edit_that_is_off_keeps_authored_cuts_without_targeting_the_edit():
    state = _edit_state(playblast_camera_id="cam_1")
    state["sequence"]["enabled"] = False
    scene = _run(state)
    assert [camera["id"] for camera in scene["cameras"]] == ["cam_1", "cam_2"]
    assert scene["playblast_camera_id"] == "cam_1"
    assert "playblast_target" not in scene["metadata"]


# ---------------------------------------------------------------------------
# Upstream OmniCam Extractor link
# ---------------------------------------------------------------------------

def _extractor_track(fingerprint="fp-1", fps=30, duration=90):
    base = {"fov": 53.0, "roll": 0.0, "camera_type": "perspective", "zoom": 1.0,
            "near": 0.01, "far": 10000.0}
    return {
        "schema_version": 1, "fps": fps, "duration_frames": duration,
        "width": 1920, "height": 1080, "render_mode": "omni_ref",
        "keyframes": [
            {"frame": 0, "camera": {**base, "position": [0, 0, 0], "target": [0, 0, -1]},
             "interpolation": "linear"},
            {"frame": 60, "camera": {**base, "position": [0, 0, -4], "target": [0, 0, -5]},
             "interpolation": "linear"},
        ],
        "objects": [],
        "metadata": {"source": "omnicam_extractor", "backend": "dpvo", "confidence": 0.94,
                     "monocular_scale": True, "extractor_fingerprint": fingerprint},
    }


def _extractor_scene(fingerprint="fp-1"):
    track = _extractor_track(fingerprint=fingerprint)
    return {
        "version": 1,
        "timeline": {
            "duration_seconds": track["duration_frames"] / track["fps"],
            "authoring_fps": track["fps"],
        },
        "canvas": {"width": track["width"], "height": track["height"]},
        "cameras": [{
            "id": "extracted_camera",
            "label": "Extracted Camera",
            "enabled": True,
            "track": track,
        }],
        "active_camera_id": "extracted_camera",
        "playblast_camera_id": "extracted_camera",
        "objects": [],
        "motion_layers": [],
        "cuts": [],
        "metadata": {
            "source": "omnicam_extractor",
            "extractor_fingerprint": fingerprint,
        },
    }


def _run_with_upstream(state, upstream):
    out = MajoorOmniCamDirector.execute(
        state_json=json.dumps(state), recording_path="", card_asset="",
        width=1280, height=720, fps=24, duration_seconds=2.0, render_mode="omni_ref",
        motion_scene=upstream,
    )
    outputs = out.outputs if hasattr(out, "outputs") else tuple(out)
    scene = outputs[0]
    selected = next(
        camera for camera in scene["cameras"]
        if camera["id"] == scene["playblast_camera_id"]
    )
    return selected["track"]


def test_director_schema_exposes_an_optional_motion_scene_input():
    schema = MajoorOmniCamDirector.define_schema()
    motion_scene = next(item for item in schema.inputs if item.id == "motion_scene")
    assert motion_scene.io_type == "OMNICAM_MOTION_SCENE"
    assert motion_scene.optional is True
    assert all(item.id != "camera_track" for item in schema.inputs)


def test_director_adopts_an_unimported_extractor_scene():
    track = _run_with_upstream({"duration_frames": 48, "fps": 24}, _extractor_scene())
    assert [key["frame"] for key in track["keyframes"]] == [0, 60]
    assert track["metadata"]["upstream_camera_track"]["fingerprint"] == "fp-1"
    # The render context stays the Director's queue widgets.
    assert (track["width"], track["height"]) == (1280, 720)


def test_director_keeps_local_edits_once_the_fingerprint_is_imported():
    state = {
        "duration_frames": 48, "fps": 24,
        "keyframes": [{"frame": 0, "camera": {"position": [7, 7, 7], "target": [0, 0, 0]}}],
        "metadata": {"upstream_camera_track": {"fingerprint": "fp-1"}},
    }
    track = _run_with_upstream(state, _extractor_scene(fingerprint="fp-1"))
    assert track["keyframes"][0]["camera"]["position"] == pytest.approx([7.0, 7.0, 7.0])


def test_director_without_a_cable_is_unchanged():
    track = _run_with_upstream({"duration_frames": 48, "fps": 24}, None)
    assert "upstream_camera_track" not in track["metadata"]
