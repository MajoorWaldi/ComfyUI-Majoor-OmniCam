from omnicam.adapters.ltx import LTXVIDEO_COMMIT, ltx_camera_control_profile, track_to_ltx_camera_bridge
from omnicam.core.camera_tools import apply_camera_preset
from omnicam.core.track import OmniCamTrack


def test_ltx_profile_is_version_pinned_and_temporally_complete():
    track = apply_camera_preset(OmniCamTrack.from_dict({"duration_frames": 16}), "dolly_in")
    profile = ltx_camera_control_profile(track)
    bridge = track_to_ltx_camera_bridge(track)
    assert profile["ltxvideo_commit"] == LTXVIDEO_COMMIT
    assert profile["camera_lora"].endswith("dolly-in.safetensors")
    assert len(bridge["frames"]) == 16
    assert len(track_to_ltx_camera_bridge(track, 9)["frames"]) == 9
