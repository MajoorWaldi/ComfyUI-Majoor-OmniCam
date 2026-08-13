import json

from omnicam.adapters.wan import camera_to_wan_c2w, track_to_wan_camera_params
from omnicam.adapters.wanvideo_wrapper.v2026_08 import ATI_LENGTH, COMPATIBILITY, track_to_ati_json
from omnicam.core.track import CameraState, OmniCamTrack


def test_three_camera_maps_to_wan_positive_z_forward():
    camera = CameraState(position=[0.0, 0.0, 5.0], target=[0.0, 0.0, 0.0])
    matrix = camera_to_wan_c2w(camera)
    assert [matrix[row][2] for row in range(3)] == [0.0, 0.0, -1.0]
    assert [matrix[row][0] for row in range(3)] == [1.0, -0.0, 0.0]
    assert [matrix[row][1] for row in range(3)] == [0.0, -1.0, -0.0]


def test_wan_camera_params_have_core_layout_and_resample():
    track = OmniCamTrack.from_dict({"duration_frames": 8})
    params = track_to_wan_camera_params(track, 17)
    assert len(params) == 17
    assert all(len(row) == 23 for row in params)
    assert params[0][3:5] == [0.5, 0.5]


def test_wanvideowrapper_bridge_matches_pinned_ati_contract():
    track = OmniCamTrack.from_dict({"duration_frames": 8, "width": 640, "height": 360})
    tracks = json.loads(track_to_ati_json(track, 12))
    assert COMPATIBILITY["node"] == "WanVideoATITracks"
    assert len(tracks) == 12
    assert all(len(item) == ATI_LENGTH for item in tracks)
    assert all(set(point) == {"x", "y"} for point in tracks[0])
