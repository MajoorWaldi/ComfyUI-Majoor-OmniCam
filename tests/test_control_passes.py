import pytest

from omnicam.core.control_passes import depth_pass, normals_pass, object_id_pass, optical_flow_pass
from omnicam.core.importers import import_blender_camera, import_track_json, simplify_track, stabilize_track
from omnicam.core.track import OmniCamTrack


def _track() -> OmniCamTrack:
    return OmniCamTrack.from_dict(
        {
            "fps": 24,
            "duration_frames": 5,
            "width": 640,
            "height": 360,
            "objects": [
                {"id": "subject", "type": "card", "position": [0, 1.5, 0], "rotation": [0, 0, 0]},
                {"id": "cube", "type": "cube", "position": [2, 0.75, -1], "rotation": [0, 90, 0]},
            ],
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
                {"frame": 4, "camera": {"position": [1, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
            ],
        }
    )


def test_object_id_pass_assigns_stable_ids_and_visibility():
    payload = object_id_pass(_track())
    assert payload["object_ids"] == {"subject": 1, "cube": 2}
    frame0 = payload["frames"][0]["objects"]
    assert frame0[0]["id"] == 1 and frame0[0]["visible"] is True
    assert len(payload["frames"]) == 5


def test_depth_pass_normalizes_between_clip_planes():
    payload = depth_pass(_track())
    subject_depth = payload["frames"][0]["depths"][0]["depth"]
    assert 0.0 < subject_depth < 1.0  # subject is between near (0.01) and far (10000)
    assert payload["frames"][0]["depths"][0]["name"] == "subject"


def test_normals_pass_faces_camera_by_default():
    payload = normals_pass(_track())
    normal = payload["frames"][0]["normals"][0]["normal_camera"]
    # Unrotated card normal stays near the camera's view axis (small tilt: target above eye level).
    assert normal[2] == pytest.approx(1.0, abs=0.01)


def test_optical_flow_tracks_screen_motion():
    payload = optical_flow_pass(_track())
    first = payload["frames"][0]["vectors"][0]["flow"]
    assert first is None  # no previous frame
    second = payload["frames"][1]["vectors"][0]["flow"]
    assert second is not None and second[0] == pytest.approx(0.0, abs=1e-6)  # camera trucks +X, subject still centered


def test_blender_import_converts_z_up_to_y_up():
    track = import_blender_camera(
        {"fps": 30, "frames": [{"frame": 0, "location": [1, 2, 3], "track_to": [0, 0, 0]}, {"frame": 10, "location": [2, 2, 3], "track_to": [0, 0, 0]}]}
    )
    assert track.fps == 30
    assert track.keyframes[0].camera.position == [1.0, 3.0, -2.0]  # x, z, -y
    assert track.keyframes[0].camera.target == [0.0, 0.0, 0.0]


def test_blender_import_requires_frames():
    with pytest.raises(ValueError):
        import_blender_camera({})


def test_track_json_round_trip():
    track = _track()
    assert import_track_json(track.to_dict()).to_dict() == track.to_dict()


def test_stabilize_and_simplify_preserve_endpoints():
    jittery = OmniCamTrack.from_dict(
        {
            "duration_frames": 9,
            "keyframes": [
                {"frame": i, "camera": {"position": [i + (0.05 if i % 2 else -0.05), 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"}
                for i in range(9)
            ],
        }
    )
    stabilized = stabilize_track(jittery, strength=1.0)
    assert stabilized.keyframes[0].frame == 0
    assert stabilized.keyframes[-1].frame == 8
    simplified = simplify_track(jittery, tolerance=1.0)
    assert len(simplified.keyframes) == 2  # jitter within tolerance collapses to endpoints
    tight = simplify_track(jittery, tolerance=0.001)
    assert len(tight.keyframes) == 9
