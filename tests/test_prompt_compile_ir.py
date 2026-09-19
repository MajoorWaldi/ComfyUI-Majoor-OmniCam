"""Invariants of the P5 prompt-compiler IR: order preservation and no invented text."""

from __future__ import annotations

from omnicam.core.motion_scene import MotionScene
from omnicam.guides.prompt_ir import (
    build_prompt_compile_ir,
    extract_action_cues,
    extract_subject_trajectories,
)
from omnicam.profiles import CompileRequest


def _camera(camera_id: str) -> dict:
    return {
        "id": camera_id,
        "label": camera_id,
        "enabled": True,
        "track": {
            "schema_version": 1,
            "fps": 24,
            "duration_frames": 96,
            "width": 640,
            "height": 360,
            "render_mode": "omni_ref",
            "keyframes": [
                {
                    "frame": 0,
                    "camera": {"position": [0.0, 2.0, 6.0], "target": [0.0, 1.0, 0.0], "fov": 45.0, "roll": 0.0},
                    "interpolation": "linear",
                },
                {
                    "frame": 95,
                    "camera": {"position": [4.0, 2.0, -2.0], "target": [0.0, 1.0, 0.0], "fov": 45.0, "roll": 0.0},
                    "interpolation": "linear",
                },
            ],
            "objects": [],
            "metadata": {},
        },
    }


def _scene(*, cuts: list, motion_layers: list | None = None) -> MotionScene:
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 4.0, "authoring_fps": 24.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [_camera("hero_camera"), _camera("wide_camera")],
            "active_camera_id": "hero_camera",
            "playblast_camera_id": "hero_camera",
            "objects": [],
            "motion_layers": motion_layers or [],
            "cuts": cuts,
            "metadata": {},
        }
    )


def _request(scene: MotionScene) -> CompileRequest:
    return CompileRequest(
        motion_scene=scene, playblast_video=None, base_prompt="A stone tower.",
        target_width=832, target_height=480, duration_seconds=4.0, target_fps=24.0,
    )


def test_cuts_pass_through_in_authored_order_and_timestamps_unchanged():
    cuts = [
        {"camera_id": "hero_camera", "time_seconds": 0.0, "end_time_seconds": 1.5},
        {"camera_id": "wide_camera", "time_seconds": 1.5, "end_time_seconds": 4.0},
    ]
    scene = _scene(cuts=cuts)
    ir = build_prompt_compile_ir(_request(scene))

    assert [(cut.camera_id, cut.time_seconds, cut.end_time_seconds) for cut in ir.cuts] == [
        ("hero_camera", 0.0, 1.5),
        ("wide_camera", 1.5, 4.0),
    ]


def test_camera_phases_come_from_the_selected_playblast_camera_in_chronological_order():
    scene = _scene(cuts=[])
    ir = build_prompt_compile_ir(_request(scene))

    assert list(ir.camera_phases) == sorted(ir.camera_phases, key=lambda phase: phase.start_seconds)
    if ir.camera_phases:
        assert ir.camera_phases[0].start_seconds == 0.0


def test_extract_action_cues_never_fabricates_text_when_action_text_is_absent():
    layer_without_action_text = {
        "id": "tracked_point", "label": "Tracked point", "enabled": True,
        "semantic": "screen_point", "source_kind": "manual_2d",
        "keys": [{"time_seconds": 0.0, "x": 0.1, "y": 0.5}, {"time_seconds": 3.0, "x": 0.9, "y": 0.5}],
        "source": {},
    }
    scene = _scene(cuts=[], motion_layers=[layer_without_action_text])

    assert extract_action_cues(scene) == ()
    # A trajectory is still derived -- physical motion only, no verb.
    trajectories = extract_subject_trajectories(scene)
    assert len(trajectories) == 1
    assert trajectories[0].screen_direction == "left_to_right"


def test_extract_action_cues_carries_authored_text_verbatim_and_only_that_text():
    layer_with_action_text = {
        "id": "hero_action", "label": "Hero action", "enabled": True,
        "semantic": "screen_point", "source_kind": "object_point",
        "keys": [{"time_seconds": 0.0, "x": 0.2, "y": 0.5}, {"time_seconds": 3.0, "x": 0.8, "y": 0.5}],
        "source": {"object_id": "hero", "action_text": "leaps across the gap"},
    }
    scene = _scene(cuts=[], motion_layers=[layer_with_action_text])
    cues = extract_action_cues(scene)

    assert len(cues) == 1
    assert cues[0].subject_id == "hero"
    assert cues[0].text == "leaps across the gap"


def test_a_disabled_motion_layer_contributes_no_cue_or_trajectory():
    disabled_layer = {
        "id": "disabled_action", "label": "Disabled", "enabled": False,
        "semantic": "screen_point", "source_kind": "object_point",
        "keys": [{"time_seconds": 0.0, "x": 0.2, "y": 0.5}, {"time_seconds": 3.0, "x": 0.8, "y": 0.5}],
        "source": {"object_id": "hero", "action_text": "should never appear"},
    }
    scene = _scene(cuts=[], motion_layers=[disabled_layer])

    assert extract_action_cues(scene) == ()
    assert extract_subject_trajectories(scene) == ()
