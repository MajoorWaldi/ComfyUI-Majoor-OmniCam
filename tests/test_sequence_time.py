"""Unit tests for sequence time calculations and prompt timing formatting."""

from omnicam.core.sequence_time import (
    build_sequence_time,
    sequence_time_to_json,
    sequence_time_to_prompt,
)
from omnicam.core.sequence_validation import MAX_RETIME_KEYS, validate_sequence_state


def test_build_sequence_time_basic_two_shots():
    state = {
        "timeline": {"fps_num": 24, "fps_den": 1},
        "shot_order": ["shot_001", "shot_002"],
        "shots": {
            "shot_001": {
                "id": "shot_001",
                "name": "Establishing",
                "enabled": True,
                "source": {"duration_frames": 48},
                "trim": {"in_frame": 0, "out_frame": 47},
                "retime": {"enabled": False},
                "prompt": "Wide city shot",
            },
            "shot_002": {
                "id": "shot_002",
                "name": "Close Up",
                "enabled": True,
                "source": {"duration_frames": 24},
                "trim": {"in_frame": 0, "out_frame": 23},
                "retime": {"enabled": False},
                "prompt": "Character close up",
            },
        },
    }
    st = build_sequence_time(state, fps_num=24, fps_den=1)
    assert st["duration"]["frames"] == 72
    assert abs(st["duration"]["seconds"] - 3.0) < 1e-3

    shots = st["shots"]
    assert len(shots) == 2

    s1 = shots[0]
    assert s1["timeline"]["start_frame"] == 0
    assert s1["timeline"]["end_frame"] == 47
    assert s1["timeline"]["duration_frames"] == 48
    assert abs(s1["timeline"]["duration_seconds"] - 2.0) < 1e-3

    s2 = shots[1]
    assert s2["timeline"]["start_frame"] == 48
    assert s2["timeline"]["end_frame"] == 71
    assert s2["timeline"]["duration_frames"] == 24
    assert abs(s2["timeline"]["duration_seconds"] - 1.0) < 1e-3


def test_sequence_time_prompt_formats():
    state = {
        "timeline": {"fps_num": 24, "fps_den": 1},
        "shot_order": ["shot_001"],
        "shots": {
            "shot_001": {
                "id": "shot_001",
                "name": "Establishing",
                "enabled": True,
                "source": {"duration_frames": 48},
                "trim": {"in_frame": 0, "out_frame": 47},
                "prompt": "Sun setting over mountains",
            }
        },
    }
    st = build_sequence_time(state, fps_num=24, fps_den=1)

    prompt_sec = sequence_time_to_prompt(st, format="seconds")
    assert "[00:00.000 - 00:02.000] Establishing: Sun setting over mountains" in prompt_sec

    prompt_tc = sequence_time_to_prompt(st, format="timecode")
    assert "Establishing: Sun setting over mountains" in prompt_tc
    assert "00:00:00:00" in prompt_tc

    prompt_frames = sequence_time_to_prompt(st, format="frames")
    assert "[Frame 0 - 47] Establishing: Sun setting over mountains" in prompt_frames

    prompt_verb = sequence_time_to_prompt(st, format="verbose")
    assert "Timeline: 0.000s → 2.000s" in prompt_verb
    assert "Duration: 48 frames / 2.000 sec" in prompt_verb
    assert "Prompt: Sun setting over mountains" in prompt_verb


def test_sequence_time_json_serialization():
    state = {"shots": {}}
    st = build_sequence_time(state, fps_num=24, fps_den=1)
    json_str = sequence_time_to_json(st)
    assert '"schema_version": 1' in json_str


def test_sequence_time_converts_source_fps_to_timeline_fps():
    state = {
        "shot_order": ["shot_001"],
        "shots": {
            "shot_001": {
                "enabled": True,
                "source": {"duration_frames": 30, "fps_num": 30, "fps_den": 1},
                "trim": {"in_frame": 0, "out_frame": 29},
                "retime": {"enabled": False},
            }
        },
    }
    timing = build_sequence_time(state, fps_num=24, fps_den=1)
    assert timing["duration"] == {"frames": 24, "seconds": 1.0}


def test_audio_timing_adds_timeline_offset_and_trimmed_duration():
    state = {
        "shots": {},
        "audio_tracks": {
            "audio1": {
                "enabled": True,
                "timeline": {"start_frame": 24},
                "trim": {"in_seconds": 1.0, "out_seconds": 3.0},
            }
        },
    }
    timing = build_sequence_time(state, fps_num=24, fps_den=1)
    assert timing["audio"][0]["start_seconds"] == 1.0
    assert timing["audio"][0]["end_seconds"] == 3.0


def test_sequence_state_bounds_untrusted_editor_values():
    state = validate_sequence_state({
        "timeline": {"fps_num": float("inf"), "playhead_frame": -5},
        "shots": {
            "bad": {
                "source_slot": "../../file",
                "source": {"duration_frames": 10**9},
                "retime": {"mode": "unknown", "curve": {"keys": [{"frame": i, "value": float("nan")} for i in range(300)]}},
                "tags": "not-a-list",
            }
        },
    })
    shot = state["shots"]["bad"]
    assert state["timeline"]["fps_num"] == 24
    assert state["timeline"]["playhead_frame"] == 0
    assert shot["source_slot"] == "shot1"
    assert len(shot["retime"]["curve"]["keys"]) == MAX_RETIME_KEYS
    assert shot["retime"]["mode"] == "absolute_speed"
    assert shot["tags"] == []


def test_sequence_state_accepts_collection_and_audio_zero_based_slots():
    state = validate_sequence_state({
        "shots": {"director": {"source_slot": "collection_shot0"}},
        "audio_tracks": {"audio": {"source_slot": "audio0"}},
    })
    assert state["shots"]["director"]["source_slot"] == "collection_shot0"
    assert state["audio_tracks"]["audio"]["source_slot"] == "audio0"
