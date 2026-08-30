import json

from omnicam.core.track import OmniCamTrack
from omnicam.monitor.text import build_monitor_text


def _track():
    return OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": 25,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1, 0]}, "interpolation": "linear"},
            {"frame": 24, "camera": {"position": [2, 1, 4], "target": [0, 1, 0]}, "interpolation": "ease"},
        ],
    })


def _caps(*adapters):
    return {"capabilities": [{"adapter": adapter, "state": "verified"} for adapter in adapters]}


def test_monitor_text_preserves_base_prompt_and_separates_camera_instruction():
    result = build_monitor_text(_track(), adapter="h3", base_prompt="A red fox in snow")
    assert result.cinematography
    assert result.camera_prompt
    assert "A red fox in snow" not in result.camera_prompt
    assert "A red fox in snow" in result.final_prompt
    json.dumps(result.camera_data)


def test_h3_api_profile_uses_the_unbracketed_dialect():
    """MinimaxHailuo03ReferenceNode documents 'Image 1', 'Video 1' -- no brackets.

    Emitting <Video 1> there does not bind the reference; it lands in the model
    as literal prompt text.
    """
    result = build_monitor_text(_track(), adapter="h3", base_prompt="", capabilities=_caps("h3"))
    assert "Video 1" in result.camera_prompt
    assert "<Video 1>" not in result.camera_prompt
    assert result.contract["dialect"] == "comfy_api"


def test_h3_native_profile_uses_the_bracketed_dialect():
    result = build_monitor_text(_track(), adapter="h3_native", base_prompt="", capabilities=_caps("h3_native"))
    assert "<Video 1>" in result.camera_prompt
    assert result.contract["dialect"] == "native"
    assert result.contract["reference_kind"] == "IMAGE"


def test_dialect_falls_back_to_the_h3_node_that_is_installed():
    """The user should never have to know which H3 front door they have."""
    result = build_monitor_text(_track(), adapter="h3", base_prompt="", capabilities=_caps("h3_native"))
    assert "<Video 1>" in result.camera_prompt


def test_a_pinned_token_still_wins_for_older_workflows():
    result = build_monitor_text(_track(), adapter="h3", base_prompt="", video_ref_token="<Video 2>")
    assert "<Video 2>" in result.camera_prompt


def test_reference_token_is_only_added_for_h3():
    result = build_monitor_text(_track(), adapter="wan_native", base_prompt="A lighthouse")
    assert "Video 1" not in result.final_prompt
    assert "A lighthouse" in result.final_prompt


def test_wan_camera_prompt_defers_to_the_embedding():
    """The move is already in WAN_CAMERA_EMBEDDING; restating it competes with it."""
    result = build_monitor_text(_track(), adapter="wan_native", base_prompt="A lighthouse")
    assert result.camera_prompt == "Cinematic camera motion follows the supplied camera conditioning."
    assert "Reproduce" not in result.camera_prompt


def test_trajectory_and_ltx_prompts_are_natural_language():
    for adapter in ("wan_ati", "wan_tracks_native", "ltx_motion_track", "ltx"):
        prompt = build_monitor_text(_track(), adapter=adapter, base_prompt="").camera_prompt
        assert "The camera" in prompt
        assert "acceleration and deceleration" not in prompt
        assert "FOV" not in prompt


def test_camera_data_carries_the_derived_phases():
    result = build_monitor_text(_track(), adapter="h3", base_prompt="")
    phases = result.camera_data["phases"]
    assert phases and all("start_seconds" in phase and "axis" in phase for phase in phases)
