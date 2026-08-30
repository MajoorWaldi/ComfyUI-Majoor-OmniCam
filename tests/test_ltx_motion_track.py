"""The LTX-2.5 Motion Track bridge, checked against the installed node contract.

LTXVDrawTracks(tracks: STRING, width, height) parses a JSON list of point lists
with x/y keys and renders ``num_frames = max(len(t) for t in parsed)`` -- there
is no ATI-style fixed 121 here, so the track length *is* the guide length.
"""

import json

from omnicam.adapters.ltx_tracks import (
    is_ltx_frame_count,
    ltx_frame_count,
    ltx_motion_track_profile,
    track_to_ltx_tracks,
    track_to_ltx_tracks_json,
)
from omnicam.core.track import OmniCamTrack


def _track(frames=121):
    return OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": frames, "width": 1280, "height": 720,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 1.5, 6], "target": [0, 1.5, 0]}, "interpolation": "ease"},
            {"frame": frames - 1, "camera": {"position": [1.5, 1.5, 3], "target": [0, 1.5, 0]}, "interpolation": "ease"},
        ],
    })


def test_tracks_are_json_point_lists_the_node_can_parse():
    payload = track_to_ltx_tracks_json(_track(), length=121, point_count=12, width=768, height=512)
    parsed = json.loads(payload)
    assert isinstance(parsed, list) and parsed
    assert all(isinstance(points, list) for points in parsed)
    assert all(set(point) == {"x", "y"} for points in parsed for point in points)


def test_track_length_is_the_requested_frame_count_not_a_fixed_121():
    tracks = track_to_ltx_tracks(_track(), length=57, point_count=8)
    assert max(len(points) for points in tracks) == 57


def test_coordinates_land_in_the_nodes_own_pixel_space():
    """The node normalises with its own width/height, not the track's."""
    tracks = track_to_ltx_tracks(_track(), length=25, point_count=8, width=640, height=360)
    xs = [point["x"] for points in tracks for point in points]
    ys = [point["y"] for points in tracks for point in points]
    assert max(xs) <= 640 and max(ys) <= 360


def test_frame_grid_helpers_match_the_ltx_truncation_rule():
    # iclora.py: num_frames_to_keep = ((N - 1) // 8) * 8 + 1
    assert ltx_frame_count(121) == 121
    assert ltx_frame_count(120) == 113
    assert ltx_frame_count(1) == 1
    assert is_ltx_frame_count(121) and not is_ltx_frame_count(120)


def test_profile_reports_what_ltx_will_silently_drop():
    profile = ltx_motion_track_profile(_track(), length=120, point_count=16)
    assert profile["requested_frames"] == 120
    assert profile["ltx_frames"] == 113
    assert profile["frames_truncated_by_ltx"] == 7
    assert profile["on_temporal_grid"] is False
    assert profile["node"] == "LTXVDrawTracks"


def test_points_that_leave_frame_are_truncated_not_clamped():
    """A point clamped to the border would read as a hard slide along the edge."""
    track = OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": 49, "width": 640, "height": 360,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 1.5, 6], "target": [0, 1.5, 0]}, "interpolation": "linear"},
            {"frame": 48, "camera": {"position": [40, 1.5, 6], "target": [40, 1.5, 0]}, "interpolation": "linear"},
        ],
    })
    tracks = track_to_ltx_tracks(track, length=49, point_count=16)
    assert any(len(points) < 49 for points in tracks)
    for points in tracks:
        assert all(0 <= point["x"] <= 640 and 0 <= point["y"] <= 360 for point in points)
