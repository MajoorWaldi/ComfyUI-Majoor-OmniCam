import pytest

from omnicam.core.track import OmniCamTrack


def test_default_track_is_valid():
    track = OmniCamTrack.from_dict({})
    assert track.fps == 24
    assert track.duration_frames > 0
    assert len(track.keyframes) == 1


def test_linear_interpolation_midpoint():
    track = OmniCamTrack.from_dict({
        "fps": 24,
        "duration_frames": 11,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 0, 0], "target": [0, 0, 1], "fov": 20}, "interpolation": "linear"},
            {"frame": 10, "camera": {"position": [10, 0, 0], "target": [0, 0, 1], "fov": 40}},
        ],
    })
    cam = track.sample(5)
    assert cam.position == [5.0, 0.0, 0.0]
    assert cam.fov == 30.0


def test_duplicate_frames_keep_last():
    track = OmniCamTrack.from_dict({
        "keyframes": [
            {"frame": 0, "camera": {"position": [1, 2, 3]}},
            {"frame": 0, "camera": {"position": [4, 5, 6]}},
        ]
    })
    assert len(track.keyframes) == 1
    assert track.keyframes[0].camera.position == [4.0, 5.0, 6.0]


def test_camera_clip_planes_are_validated_and_serialized():
    track = OmniCamTrack.from_dict({"keyframes": [{"frame": 0, "camera": {"near": -1, "far": 0}}]})
    camera = track.keyframes[0].camera
    assert camera.near == pytest.approx(0.0001)
    assert camera.far > camera.near
    payload = track.to_dict()["keyframes"][0]["camera"]
    assert payload["near"] == camera.near
    assert payload["far"] == camera.far


def test_object_animation_tracks_round_trip_without_changing_camera_schema():
    object_keyframes = [
        {"frame": 0, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "size": [1, 1, 1]}, "interpolation": "linear"},
        {"frame": 12, "transform": {"position": [2, 0, 0], "rotation": [0, 45, 0], "size": [2, 2, 2]}, "interpolation": "ease"},
    ]
    track = OmniCamTrack.from_dict({"objects": [{"id": "cube", "type": "cube", "keyframes": object_keyframes}]})
    assert track.schema_version == 1
    assert track.to_dict()["objects"][0]["keyframes"] == object_keyframes


@pytest.mark.parametrize(("mode", "expected"), [("smooth", 1.03515625), ("bezier", 1.703125)])
def test_curve_editor_interpolation_presets(mode, expected):
    track = OmniCamTrack.from_dict({
        "duration_frames": 11,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 0, 0]}, "interpolation": mode},
            {"frame": 10, "camera": {"position": [10, 0, 0]}},
        ],
    })
    assert track.sample(2.5).position[0] == pytest.approx(expected)


def test_track_rejects_unknown_schema_and_samples_by_value():
    with pytest.raises(ValueError, match="Unsupported"):
        OmniCamTrack.from_dict({"schema_version": 2})

    track = OmniCamTrack.from_dict({})
    sampled = track.sample(0)
    sampled.fov = 10
    assert track.keyframes[0].camera.fov == 35
