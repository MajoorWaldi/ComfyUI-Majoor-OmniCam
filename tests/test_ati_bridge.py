from omnicam.adapters.ati import track_to_ati_bridge
from omnicam.core.track import OmniCamTrack


def test_ati_bridge_has_requested_tracks():
    track = OmniCamTrack.from_dict({"duration_frames": 8, "width": 640, "height": 360})
    bridge = track_to_ati_bridge(track, 12)
    assert bridge["format"] == "majoor.omnicam.ati-bridge.v1"
    assert len(bridge["trajectories"]) == 12
    assert len(bridge["trajectories"][0]["samples"]) == 8
