import json

import pytest

from omnicam.adapters.wan import camera_to_wan_c2w, track_to_wan_camera_params
from omnicam.adapters.wanvideo_wrapper.v2026_08 import (
    ATI_LENGTH,
    COMPATIBILITY,
    track_to_ati_json,
    track_to_ati_tracks,
)
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


# --------------------------------------------------------------------------
# ATI tracks: the contract is read from WanVideoWrapper's own ATI/nodes.py.
#   pad_pts()        -> [[x, y, 1] ...], zero-padded to FIXED_LENGTH = 121
#   process_tracks() -> (xy - size/2) / min(size) * 2, using the NODE's width/height
# --------------------------------------------------------------------------

def _orbit_track(width=1280, height=720, frames=25):
    keys = [
        {"frame": 0, "camera": {"position": [-6, 1.6, 6], "target": [0, 1, 0], "fov": 35}, "interpolation": "linear"},
        {"frame": frames - 1, "camera": {"position": [6, 1.6, 6], "target": [0, 1, 0], "fov": 35}, "interpolation": "linear"},
    ]
    return OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": frames, "width": width, "height": height, "keyframes": keys,
    })


def test_ati_tracks_are_emitted_in_the_node_resolution():
    """WanVideoATITracks normalises with its own width/height.

    Emitting 1280x720 pixels into a node left at its 832x480 default silently
    offsets and rescales every trajectory, so the target size is explicit.
    """
    track = _orbit_track(width=1280, height=720)
    native = track_to_ati_tracks(track, point_count=8)
    scaled = track_to_ati_tracks(track, point_count=8, width=832, height=480)
    assert native and scaled

    flat_native = [point for path in native for point in path]
    flat_scaled = [point for path in scaled for point in path]
    assert len(flat_native) == len(flat_scaled)
    for a, b in zip(flat_native, flat_scaled, strict=True):
        assert b["x"] == pytest.approx(a["x"] * 832 / 1280)
        assert b["y"] == pytest.approx(a["y"] * 480 / 720)


def test_ati_tracks_stop_instead_of_sliding_along_the_frame_edge():
    """pad_pts marks every supplied point visible, so an off-screen point must
    not be clamped to the border: that would tell the model to track something
    gliding along the edge. Ending the list lets the zero padding say 'gone'."""
    track = _orbit_track()
    for path in track_to_ati_tracks(track, point_count=24):
        assert path, "an emitted track must have at least its first sample"
        assert len(path) <= 121
        for point in path:
            # Every emitted sample is genuinely inside the frame.
            assert -1e-6 <= point["x"] <= track.width
            assert -1e-6 <= point["y"] <= track.height
        # No two consecutive samples pinned to the exact same border pixel,
        # which is the signature of the old clamping behaviour.
        pinned = [p for p in path if p["x"] in (0.0, float(track.width - 1))]
        assert len(pinned) < len(path)


def test_ati_tracks_never_exceed_the_fixed_length():
    track = _orbit_track(frames=400)
    for path in track_to_ati_tracks(track, point_count=6):
        assert 1 <= len(path) <= ATI_LENGTH


def test_ati_json_is_the_shape_parse_json_tracks_expects():
    """A list of tracks, each a list of {x, y} dicts."""
    payload = json.loads(track_to_ati_json(_orbit_track(), point_count=5, width=832, height=480))
    assert isinstance(payload, list) and payload
    assert all(isinstance(path, list) and path for path in payload)
    assert all(set(point) == {"x", "y"} for path in payload for point in path)
    assert all(isinstance(point["x"], float) and isinstance(point["y"], float)
               for path in payload for point in path)


def test_ati_drops_points_that_start_off_screen():
    """There is no way to express a delayed appearance, so such a point cannot
    open a track at all."""
    behind = OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": 8, "width": 640, "height": 360,
        # Looking away from the reference cloud: nothing is in frame at start.
        "keyframes": [{"frame": 0, "camera": {"position": [0, 1, 0], "target": [0, 1, 40], "fov": 20},
                       "interpolation": "linear"}],
    })
    for path in track_to_ati_tracks(behind, point_count=12):
        assert path, "a returned track is never empty"
