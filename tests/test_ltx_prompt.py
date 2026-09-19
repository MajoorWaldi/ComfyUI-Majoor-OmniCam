from __future__ import annotations

from omnicam.adapters.ltx_prompt import build_ltx_prompt
from omnicam.guides.model import CameraPhase, ShotIntent
from omnicam.guides.prompt_ir import ActionCue, PromptCompileIR


def _phase(phrase: str = "arcs left") -> CameraPhase:
    return CameraPhase(
        start_seconds=0.0, end_seconds=2.0, axis="truck_left", phrase=phrase,
        pace="steady", magnitudes={}, peak_speed=1.0,
    )


def _ir(*, base_prompt: str = "", camera_phases=(), action_cues=()) -> PromptCompileIR:
    return PromptCompileIR(
        duration_seconds=2.0, base_prompt=base_prompt, camera_phases=camera_phases, cuts=(),
        subject_trajectories=(), action_cues=action_cues, references=(), intent=ShotIntent(),
    )


def test_ltx_prompt_is_just_base_prompt_when_the_ir_knows_nothing_else():
    assert build_ltx_prompt(_ir(base_prompt="A quiet street.")) == "A quiet street."


def test_ltx_prompt_never_uses_reference_tokens_or_a_numeric_schedule():
    prompt = build_ltx_prompt(_ir(base_prompt="A quiet street.", camera_phases=(_phase(),)))
    assert "<Video" not in prompt
    assert "Video 1" not in prompt
    assert "Camera schedule:" not in prompt
    assert "[0.0" not in prompt


def test_ltx_prompt_folds_in_camera_phrase_as_prose():
    prompt = build_ltx_prompt(_ir(base_prompt="A quiet street.", camera_phases=(_phase("pushes in"),)))
    assert prompt == "A quiet street. The camera pushes in."


def test_ltx_prompt_folds_in_a_verbatim_action_cue():
    cue = ActionCue(subject_id="hero", start_seconds=0.0, end_seconds=2.0, text="raises the sword")
    prompt = build_ltx_prompt(_ir(base_prompt="A quiet street.", action_cues=(cue,)))
    assert "raises the sword" in prompt


def test_ltx_prompt_joins_multiple_camera_phases_chronologically():
    phases = (_phase("pushes in"), CameraPhase(
        start_seconds=2.0, end_seconds=4.0, axis="dolly_out", phrase="pulls back",
        pace="steady", magnitudes={}, peak_speed=1.0,
    ))
    prompt = build_ltx_prompt(_ir(camera_phases=phases))
    assert "pushes in, then pulls back" in prompt
