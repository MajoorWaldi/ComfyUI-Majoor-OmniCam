from __future__ import annotations

import pytest
from h3_track_fixtures import orbit_track

from omnicam.adapters.h3 import MAX_REFERENCE_INDEX, build_h3_prompt, h3_native_aligned_length


def test_build_h3_prompt_defaults_to_reference_index_one():
    prompt = build_h3_prompt(orbit_track(90.0), adapter="comfy_api")
    assert "Video 1" in prompt
    assert "Video 2" not in prompt


def test_build_h3_prompt_honors_reference_index_native_dialect():
    prompt = build_h3_prompt(orbit_track(90.0), adapter="h3_native", reference_index=2)
    assert "<Video 2>" in prompt
    assert "<Video 1>" not in prompt


def test_build_h3_prompt_honors_reference_index_comfy_api_dialect():
    prompt = build_h3_prompt(orbit_track(90.0), adapter="h3", reference_index=3)
    assert "Video 3" in prompt


@pytest.mark.parametrize("index", [0, -1, MAX_REFERENCE_INDEX + 1])
def test_build_h3_prompt_rejects_an_out_of_range_reference_index(index):
    with pytest.raises(ValueError, match="reference_index"):
        build_h3_prompt(orbit_track(90.0), adapter="h3_native", reference_index=index)


def test_build_h3_prompt_is_role_first():
    prompt = build_h3_prompt(orbit_track(90.0), adapter="h3_native")
    assert prompt.startswith("Use <Video 1> only as the camera-motion, framing and shot-timing guide.")
    assert "Do not copy the guide's proxy geometry" in prompt
    assert "Camera schedule:" in prompt


def test_build_h3_prompt_pinned_token_overrides_reference_index():
    prompt = build_h3_prompt(orbit_track(90.0), video_ref_token="<Video 7>", adapter="h3_native", reference_index=2)
    assert "<Video 7>" in prompt
    assert "<Video 2>" not in prompt


def test_h3_native_aligned_length_still_rounds_to_17n_plus_5():
    """Regression: reference-index work must not touch the frame grid."""
    assert h3_native_aligned_length(48) == 56
    assert h3_native_aligned_length(5) == 5
    assert h3_native_aligned_length(1) == 5
