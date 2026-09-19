from __future__ import annotations

import pytest
from h3_track_fixtures import orbit_track

from omnicam.adapters.seedance25 import (
    MAX_REFERENCE_INDEX,
    build_motion_timeline_block,
    build_seedance25_prompt,
    reference_token,
    render_reference_role_block,
    resolve_seedance25_guide_style,
    seedance25_video_token,
)
from omnicam.guides.model import CameraPhase, ReferenceSpec, ShotIntent
from omnicam.guides.prompt_ir import ActionCue, PromptCompileIR, SubjectTrajectoryCue

# ---------------------------------------------------------------------------
# seedance25_video_token
# ---------------------------------------------------------------------------

def test_seedance25_video_token_range():
    assert seedance25_video_token(1) == "Video 1"
    assert seedance25_video_token(10) == "Video 10"


@pytest.mark.parametrize("index", [0, -1, MAX_REFERENCE_INDEX + 1])
def test_seedance25_video_token_rejects_out_of_range(index):
    with pytest.raises(ValueError):
        seedance25_video_token(index)


# ---------------------------------------------------------------------------
# resolve_seedance25_guide_style
# ---------------------------------------------------------------------------

def test_resolve_guide_style_camera_only_is_motion_proxy():
    intent = ShotIntent(preserve=("camera_motion", "camera_framing", "camera_pacing"))
    assert resolve_seedance25_guide_style(intent) == "motion_proxy"


def test_resolve_guide_style_blocking_intent_is_clay():
    intent = ShotIntent(preserve=("camera_motion", "spatial_layout", "blocking"))
    assert resolve_seedance25_guide_style(intent) == "clay"


def test_resolve_guide_style_final_appearance_is_beauty_reference():
    intent = ShotIntent(preserve=("final_appearance",))
    assert resolve_seedance25_guide_style(intent) == "beauty_reference"


def test_resolve_guide_style_ignore_retracts_a_preserved_role():
    intent = ShotIntent(preserve=("camera_motion", "blocking"), ignore=("blocking",))
    assert resolve_seedance25_guide_style(intent) == "motion_proxy"


# ---------------------------------------------------------------------------
# build_seedance25_prompt
# ---------------------------------------------------------------------------

def test_prompt_is_role_first_for_camera_only():
    prompt = build_seedance25_prompt(orbit_track(90.0), reference_index=2)
    assert "Use Video 2 as the camera-motion reference." in prompt
    assert "Preserve from Video 2:" in prompt
    assert "Do not copy from Video 2:" in prompt


def test_prompt_swaps_to_clay_wording():
    prompt = build_seedance25_prompt(orbit_track(90.0), reference_index=2, guide_style="clay")
    assert "Use Video 2 as the clay / white-model spatial reference." in prompt
    assert "spatial layout, subject trajectory and blocking" in prompt
    assert "Do not copy the clay guide's grey proxy materials" in prompt


def test_prompt_omits_camera_schedule_by_default():
    prompt = build_seedance25_prompt(orbit_track(90.0))
    assert "Camera schedule:" not in prompt


def test_prompt_includes_camera_schedule_when_requested():
    prompt = build_seedance25_prompt(orbit_track(90.0), include_camera_schedule=True)
    assert "Camera schedule:" in prompt


def test_prompt_uses_the_requested_reference_index():
    prompt = build_seedance25_prompt(orbit_track(90.0), reference_index=7)
    assert "Video 7" in prompt
    assert "Video 1" not in prompt


# ---------------------------------------------------------------------------
# beauty_reference (P2, doc 18.1): an intentional appearance role, not a
# contamination risk -- must not tell the guide to hide the appearance it's
# meant to provide.
# ---------------------------------------------------------------------------

def test_prompt_has_a_beauty_reference_branch():
    prompt = build_seedance25_prompt(orbit_track(90.0), reference_index=1, guide_style="beauty_reference")
    assert "Use Video 1 as the appearance / beauty reference." in prompt
    assert "materials, lighting, color and atmosphere" in prompt


def test_beauty_reference_prompt_does_not_contradict_the_resolved_intent():
    # Regression: the pre-P2 `else` branch told every non-clay guide to
    # "not copy ... lighting or final appearance" -- exactly backwards for a
    # guide whose entire declared role is to carry appearance through.
    prompt = build_seedance25_prompt(orbit_track(90.0), guide_style="beauty_reference")
    assert "Do not copy from Video 1" not in prompt
    assert "final appearance" not in prompt.split("Preserve from Video 1:")[0]


# ---------------------------------------------------------------------------
# reference_token / render_reference_role_block / other_references (P2)
# ---------------------------------------------------------------------------

def test_reference_token_by_media_type():
    assert reference_token(ReferenceSpec(id="x", media_type="image", slot_hint=1, roles=())) == "Image 1"
    assert reference_token(ReferenceSpec(id="x", media_type="video", slot_hint=3, roles=())) == "Video 3"
    assert reference_token(ReferenceSpec(id="x", media_type="audio", slot_hint=2, roles=())) == "Audio 2"


def test_reference_token_defaults_to_slot_one():
    assert reference_token(ReferenceSpec(id="x", media_type="image", slot_hint=None, roles=())) == "Image 1"


def test_render_reference_role_block_lists_roles_and_ignore():
    spec = ReferenceSpec(
        id="identity_img", media_type="image", slot_hint=1,
        roles=("identity", "design"), ignore=("camera_motion",),
    )
    block = render_reference_role_block(spec)
    assert "Use Image 1 for: identity, design." in block
    assert "Do not use Image 1 for: camera_motion." in block


def test_prompt_replaces_the_generic_catch_all_with_declared_role_blocks():
    identity = ReferenceSpec(id="identity_img", media_type="image", slot_hint=1, roles=("identity", "design"))
    prompt = build_seedance25_prompt(orbit_track(90.0), reference_index=2, other_references=(identity,))
    assert "Use Image 1 for: identity, design." in prompt
    assert "Use the other declared references" not in prompt


def test_prompt_keeps_the_generic_catch_all_when_nothing_is_declared():
    prompt = build_seedance25_prompt(orbit_track(90.0))
    assert "Use the other declared references" in prompt


# ---------------------------------------------------------------------------
# Motion timeline (P5): segments come from ir.camera_phases only -- never
# invented timing divisions -- and action cues always win over a trajectory
# description, since a trajectory is physical motion only, never a verb.
# ---------------------------------------------------------------------------

def _phase(start: float, end: float, *, phrase: str = "arcs left") -> CameraPhase:
    return CameraPhase(
        start_seconds=start, end_seconds=end, axis="truck_left", phrase=phrase,
        pace="steady", magnitudes={}, peak_speed=1.0,
    )


def _ir(
    *, camera_phases: tuple[CameraPhase, ...] = (), action_cues: tuple[ActionCue, ...] = (),
    subject_trajectories: tuple[SubjectTrajectoryCue, ...] = (),
) -> PromptCompileIR:
    return PromptCompileIR(
        duration_seconds=5.0, base_prompt="", camera_phases=camera_phases, cuts=(),
        subject_trajectories=subject_trajectories, action_cues=action_cues, references=(), intent=ShotIntent(),
    )


def test_motion_timeline_is_absent_without_camera_phases():
    assert build_motion_timeline_block(_ir()) is None
    assert "Motion timeline:" not in build_seedance25_prompt(orbit_track(90.0), ir=_ir())


def test_motion_timeline_lists_one_segment_per_camera_phase():
    ir = _ir(camera_phases=(_phase(0.0, 1.8, phrase="arcs left"), _phase(1.8, 3.4, phrase="holds")))
    block = build_motion_timeline_block(ir)
    assert block.startswith("Motion timeline:")
    assert "[0.0-1.8s] the camera arcs left." in block
    assert "[1.8-3.4s] the camera holds." in block


def test_motion_timeline_prefers_a_verbatim_action_cue_over_a_trajectory():
    ir = _ir(
        camera_phases=(_phase(0.0, 2.0),),
        action_cues=(ActionCue(subject_id="hero", start_seconds=0.0, end_seconds=2.0, text="raises the sword"),),
        subject_trajectories=(
            SubjectTrajectoryCue(
                subject_id="hero", label="Hero", start_seconds=0.0, end_seconds=2.0,
                screen_direction="left_to_right", pace="steady",
            ),
        ),
    )
    block = build_motion_timeline_block(ir)
    assert "raises the sword" in block
    assert "continues moving" not in block


def test_motion_timeline_falls_back_to_physical_direction_without_an_action_cue():
    ir = _ir(
        camera_phases=(_phase(0.0, 2.0),),
        subject_trajectories=(
            SubjectTrajectoryCue(
                subject_id="hero", label="Hero", start_seconds=0.0, end_seconds=2.0,
                screen_direction="left_to_right", pace="steady",
            ),
        ),
    )
    block = build_motion_timeline_block(ir)
    assert "the subject continues moving left to right" in block
    # Never a verb invented from trajectory math alone.
    assert "runs" not in block and "walks" not in block


def test_motion_timeline_is_appended_to_the_full_prompt_when_ir_is_given():
    ir = _ir(camera_phases=(_phase(0.0, 2.0, phrase="pushes in"),))
    prompt = build_seedance25_prompt(orbit_track(90.0), ir=ir)
    assert "Motion timeline:\n[0.0-2.0s] the camera pushes in." in prompt
