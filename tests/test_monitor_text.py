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


def test_monitor_text_preserves_base_prompt_and_separates_camera_instruction():
    result = build_monitor_text(_track(), adapter="h3", base_prompt="A red fox in snow", video_ref_token="<Video 1>")
    assert result.cinematography
    assert result.camera_prompt
    assert "A red fox in snow" not in result.camera_prompt
    assert "A red fox in snow" in result.final_prompt
    assert "<Video 1>" in result.final_prompt
    json.dumps(result.camera_data)


def test_reference_token_is_only_added_for_h3():
    result = build_monitor_text(_track(), adapter="wan_native", base_prompt="A lighthouse", video_ref_token="<Video 1>")
    assert "<Video 1>" not in result.final_prompt
    assert "A lighthouse" in result.final_prompt
