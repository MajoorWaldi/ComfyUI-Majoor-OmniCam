from omnicam.adapters.h3 import classify_camera_motion
from omnicam.core.camera_tools import apply_camera_preset, build_cinematic_motion_prompt
from omnicam.core.track import OmniCamTrack


def test_h3_classifier_uses_full_trajectory_for_closed_orbit():
    track = OmniCamTrack.from_dict({"duration_frames": 48, "fps": 24})
    assert classify_camera_motion(apply_camera_preset(track, "product_360")) == "orbit_left"


def test_kling_keeps_translation_terms_distinct_from_rotation():
    track = OmniCamTrack.from_dict({"duration_frames": 24, "fps": 24})
    truck_prompt = build_cinematic_motion_prompt(apply_camera_preset(track, "truck_right"), style="kling")
    crane_prompt = build_cinematic_motion_prompt(apply_camera_preset(track, "crane_up"), style="kling")
    assert "Truck right" in truck_prompt and "Pan right" not in truck_prompt
    assert "Crane up" in crane_prompt and "Tilt up" not in crane_prompt
