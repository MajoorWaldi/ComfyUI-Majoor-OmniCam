from __future__ import annotations

from omnicam.adapters.wan_prompt import build_wan_camera_prompt, build_wan_trajectory_prompt
from omnicam.guides.model import CameraPhase, ShotIntent
from omnicam.guides.prompt_ir import ActionCue, PromptCompileIR, SubjectTrajectoryCue


def _phase(phrase: str = "tracks laterally") -> CameraPhase:
    return CameraPhase(
        start_seconds=0.0, end_seconds=2.0, axis="truck_left", phrase=phrase,
        pace="steady", magnitudes={}, peak_speed=1.0,
    )


def _ir(*, base_prompt: str = "", camera_phases=(), action_cues=(), subject_trajectories=()) -> PromptCompileIR:
    return PromptCompileIR(
        duration_seconds=2.0, base_prompt=base_prompt, camera_phases=camera_phases, cuts=(),
        subject_trajectories=subject_trajectories, action_cues=action_cues, references=(), intent=ShotIntent(),
    )


# ---------------------------------------------------------------------------
# build_wan_camera_prompt (wan_camera_native)
# ---------------------------------------------------------------------------

def test_wan_camera_prompt_is_just_base_prompt_without_camera_phases():
    assert build_wan_camera_prompt(_ir(base_prompt="A stone tower.")) == "A stone tower."


def test_wan_camera_prompt_never_restates_degrees_the_embedding_already_encodes():
    prompt = build_wan_camera_prompt(_ir(base_prompt="A stone tower.", camera_phases=(_phase(),)))
    assert "degrees" not in prompt
    assert "continuous take" in prompt
    assert "tracks laterally" in prompt


# ---------------------------------------------------------------------------
# build_wan_trajectory_prompt (wan_move_native / wan_track_native / wanvideo_ati)
# ---------------------------------------------------------------------------

def test_wan_trajectory_prompt_is_just_base_prompt_without_any_motion_signal():
    assert build_wan_trajectory_prompt(_ir(base_prompt="A runner.")) == "A runner."


def test_wan_trajectory_prompt_prefers_a_verbatim_action_cue():
    cue = ActionCue(subject_id="hero", start_seconds=0.0, end_seconds=2.0, text="sprints across the courtyard")
    prompt = build_wan_trajectory_prompt(_ir(base_prompt="A runner.", action_cues=(cue,)))
    assert "sprints across the courtyard" in prompt
    assert "authored trajectory" not in prompt


def test_wan_trajectory_prompt_falls_back_to_a_generic_continuity_sentence():
    trajectory = SubjectTrajectoryCue(
        subject_id="hero", label="Hero", start_seconds=0.0, end_seconds=2.0,
        screen_direction="left_to_right", pace="steady",
    )
    prompt = build_wan_trajectory_prompt(_ir(base_prompt="A runner.", subject_trajectories=(trajectory,)))
    assert "authored trajectory" in prompt
    # Never a coordinate restatement or an invented verb.
    assert "left_to_right" not in prompt
    assert "sprints" not in prompt
