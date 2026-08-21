"""Unit tests for MajoorOmniCamSequencer and Director sequence output."""

import json
import pytest
import torch

pytest.importorskip("comfy_api.latest")

from omnicam.nodes.director import MajoorOmniCamDirector
from omnicam.nodes.sequencer import MajoorOmniCamSequencer


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
    track_dict, proxy_vid, audio, shot_collection = outputs

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


def test_sequencer_node_execution():
    # 2 shots video
    video_shot1 = torch.ones((24, 8, 8, 3), dtype=torch.float32)
    video_shot2 = torch.zeros((24, 8, 8, 3), dtype=torch.float32)

    shots_dict = {
        "shot1": video_shot1,
        "shot2": video_shot2,
    }
    audio_dict = {
        "audio1": {"waveform": torch.ones((1, 2, 44100)), "sample_rate": 44100},
    }

    state = {
        "shot_order": ["shot_001", "shot_002"],
        "shots": {
            "shot_001": {
                "id": "shot_001",
                "name": "Shot 1",
                "source_slot": "shot1",
                "enabled": True,
                "source": {"duration_frames": 24},
                "trim": {"in_frame": 0, "out_frame": 23},
                "retime": {"enabled": False},
                "prompt": "First shot description",
            },
            "shot_002": {
                "id": "shot_002",
                "name": "Shot 2",
                "source_slot": "shot2",
                "enabled": True,
                "source": {"duration_frames": 24},
                "trim": {"in_frame": 0, "out_frame": 23},
                "retime": {"enabled": False},
                "prompt": "Second shot description",
            },
        },
        "audio_tracks": {
            "audio_001": {
                "id": "audio_001",
                "name": "Music",
                "source_slot": "audio1",
                "enabled": True,
                "timeline": {"start_frame": 0},
                "trim": {"in_seconds": 0.0, "out_seconds": 2.0},
                "gain_db": 0.0,
                "pan": 0.0,
                "fade": {"in_seconds": 0.1, "out_seconds": 0.1},
            }
        },
    }

    out = MajoorOmniCamSequencer.execute(
        sequence_state=json.dumps(state),
        resolution_mode="first_shot",
        custom_width=8,
        custom_height=8,
        fit_mode="contain",
        fps_mode="first_shot",
        custom_fps=24,
        prompt_timing_format="seconds",
        shots=shots_dict,
        audio_tracks=audio_dict,
    )

    # outputs: (video, audio, sequence, sequence_time, sequence_time_json, prompt_timing)
    outputs = out.outputs if hasattr(out, "outputs") else tuple(out)
    assert len(outputs) == 6
    video_out, audio_out, sequence_out, sequence_time, sequence_time_json, prompt_timing = outputs

    assert sequence_time["duration"]["frames"] == 48
    assert abs(sequence_time["duration"]["seconds"] - 2.0) < 1e-3
    assert len(sequence_time["shots"]) == 2
    assert "First shot description" in prompt_timing
    assert "Second shot description" in prompt_timing


def test_sequencer_expands_director_shot_collection():
    track = {
        "schema_version": 1, "fps": 24, "duration_frames": 12, "width": 8, "height": 8,
        "render_mode": "omni_ref", "keyframes": [{"frame": 0, "camera": {}}], "objects": [], "metadata": {},
    }
    collection = {
        "schema_version": 1,
        "kind": "omnicam_shot_collection",
        "shots": [
            {"schema_version": 1, "kind": "omnicam_shot", "id": f"cam_{i}", "name": f"Camera {i}",
             "video": torch.full((12, 8, 8, 3), float(i)), "audio": None, "camera_track": track, "metadata": {}}
            for i in range(2)
        ],
    }
    out = MajoorOmniCamSequencer.execute(
        sequence_state="{}", resolution_mode="first_shot", custom_width=8, custom_height=8,
        fit_mode="contain", fps_mode="first_shot", custom_fps=24, prompt_timing_format="seconds",
        shots={}, audio_tracks={}, shot_collection=collection,
    )
    outputs = out.outputs if hasattr(out, "outputs") else tuple(out)
    assert [shot["name"] for shot in outputs[2]["shots"]] == ["Camera 0", "Camera 1"]
    assert outputs[3]["duration"]["frames"] == 24


def test_sequencer_adds_namespaced_video_to_existing_timeline():
    existing = {
        "shot_order": ["existing"],
        "shots": {
            "existing": {
                "id": "existing", "name": "Existing", "source_slot": "shot0", "enabled": True,
                "source": {"duration_frames": 2, "fps_num": 24, "fps_den": 1},
                "trim": {"in_frame": 0, "out_frame": 1}, "retime": {"enabled": False},
            }
        },
        "audio_tracks": {},
    }
    out = MajoorOmniCamSequencer.execute(
        sequence_state=json.dumps(existing), resolution_mode="first_shot", custom_width=8, custom_height=8,
        fit_mode="contain", fps_mode="first_shot", custom_fps=24, prompt_timing_format="seconds",
        shots={"shots.shot0": torch.zeros((2, 8, 8, 3)), "shots.shot1": torch.ones((3, 8, 8, 3))},
        audio_tracks={},
    )
    outputs = out.outputs if hasattr(out, "outputs") else tuple(out)
    assert len(outputs[2]["shots"]) == 2
    assert [shot["id"] for shot in outputs[2]["shots"]] == ["existing", "shot_002"]
    assert outputs[3]["duration"]["frames"] == 5
