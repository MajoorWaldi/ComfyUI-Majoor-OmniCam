from __future__ import annotations

import pytest
from h3_track_fixtures import orbit_track

from omnicam.adapters.seedance25 import (
    MAX_REFERENCE_INDEX,
    build_seedance25_prompt,
    resolve_seedance25_guide_style,
    seedance25_video_token,
)
from omnicam.guides.model import ShotIntent

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
