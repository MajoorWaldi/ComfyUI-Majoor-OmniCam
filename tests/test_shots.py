import pytest

from omnicam.core.shots import (
    camera_shots,
    duplicate_shot,
    reorder_shots,
    set_shot_handles,
    shots_to_sequence_settings,
)


def _editor_state():
    return {
        "duration_frames": 96,
        "cameras": [
            {"id": "camera_1", "name": "Opening", "camera": {}, "keyframes": [{"frame": 0}, {"frame": 48}]},
            {"id": "camera_2", "name": "Orbit", "camera": {}, "keyframes": [{"frame": 0}]},
        ],
    }


def test_camera_shots_lists_authored_order():
    shots = camera_shots(_editor_state())
    assert [shot["name"] for shot in shots] == ["Opening", "Orbit"]
    assert shots[0]["duration_frames"] == 96
    assert shots[0]["key_count"] == 2
    assert shots[1]["handles"] == {"in": 0, "out": 0}


def test_set_shot_handles_validates_camera():
    state = set_shot_handles(_editor_state(), "camera_2", 4, 8)
    assert state["cameras"][1]["handles"] == {"in": 4, "out": 8}
    assert _editor_state()["cameras"][1].get("handles") is None  # input untouched
    with pytest.raises(ValueError):
        set_shot_handles(_editor_state(), "ghost", 1, 1)


def test_reorder_shots_requires_exact_set():
    state = reorder_shots(_editor_state(), ["camera_2", "camera_1"])
    assert [camera["id"] for camera in state["cameras"]] == ["camera_2", "camera_1"]
    with pytest.raises(ValueError):
        reorder_shots(_editor_state(), ["camera_1"])
    with pytest.raises(ValueError):
        reorder_shots(_editor_state(), ["camera_1", "camera_1"])


def test_duplicate_shot_appends_copy():
    state = duplicate_shot(_editor_state(), "camera_1", "camera_3")
    assert [camera["id"] for camera in state["cameras"]] == ["camera_1", "camera_3", "camera_2"]
    assert state["cameras"][1]["name"] == "Opening Copy"
    with pytest.raises(ValueError):
        duplicate_shot(_editor_state(), "camera_1", "camera_2")


def test_sequence_settings_preserve_handles():
    state = set_shot_handles(_editor_state(), "camera_1", 6, 0)
    settings = shots_to_sequence_settings(state)
    assert settings[0]["handle_in"] == 6
    assert settings[1]["handle_out"] == 0
