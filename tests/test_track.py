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


@pytest.mark.parametrize(("mode", "expected"), [("smooth", 1.03515625), ("ease", 1.5625), ("linear", 2.5)])
def test_curve_editor_interpolation_presets(mode, expected):
    track = OmniCamTrack.from_dict({
        "duration_frames": 11,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 0, 0]}, "interpolation": mode},
            {"frame": 10, "camera": {"position": [10, 0, 0]}},
        ],
    })
    assert track.sample(2.5).position[0] == pytest.approx(expected)


def test_bezier_custom_tangent_sampling():
    # Test that custom tangent handles directly affect camera sampling
    track_default = OmniCamTrack.from_dict({
        "duration_frames": 11,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 0, 0]}, "interpolation": "bezier"},
            {"frame": 10, "camera": {"position": [10, 0, 0]}},
        ],
    })
    track_custom = OmniCamTrack.from_dict({
        "duration_frames": 11,
        "keyframes": [
            {
                "frame": 0,
                "camera": {"position": [0, 0, 0]},
                "interpolation": "bezier",
                "tangents": {"mode": "free", "out_x": 0.5, "out_y": 5.0, "in_x": -0.5, "in_y": 0.0},
            },
            {"frame": 10, "camera": {"position": [10, 0, 0]}},
        ],
    })
    sample_def = track_default.sample(2.5)
    sample_cust = track_custom.sample(2.5)
    assert sample_cust.position[0] > sample_def.position[0]


def test_bezier_independent_per_channel_tangents():
    # Verify moving X tangent handles does not alter Y or Z channels
    track = OmniCamTrack.from_dict({
        "duration_frames": 21,
        "keyframes": [
            {
                "frame": 0,
                "camera": {"position": [0, 0, 0], "target": [0, 0, 0], "fov": 35.0, "roll": 0.0, "zoom": 1.0},
                "interpolation": "bezier",
                "tangents": {
                    "mode": "auto",
                    "channels": {
                        "pos_x": {"mode": "free", "out_y": 15.0},
                    },
                },
            },
            {
                "frame": 20,
                "camera": {"position": [10, 10, 10], "target": [0, 0, 0], "fov": 35.0, "roll": 0.0, "zoom": 1.0},
                "interpolation": "bezier",
            },
        ],
    })
    track_ref = OmniCamTrack.from_dict({
        "duration_frames": 21,
        "keyframes": [
            {
                "frame": 0,
                "camera": {"position": [0, 0, 0], "target": [0, 0, 0], "fov": 35.0, "roll": 0.0, "zoom": 1.0},
                "interpolation": "bezier",
            },
            {
                "frame": 20,
                "camera": {"position": [10, 10, 10], "target": [0, 0, 0], "fov": 35.0, "roll": 0.0, "zoom": 1.0},
                "interpolation": "bezier",
            },
        ],
    })
    sample = track.sample(10)
    sample_ref = track_ref.sample(10)
    # X is altered by custom handle
    assert sample.position[0] != pytest.approx(sample_ref.position[0])
    # Y and Z are untouched and identical
    assert sample.position[1] == pytest.approx(sample_ref.position[1])
    assert sample.position[2] == pytest.approx(sample_ref.position[2])


def test_track_rejects_unknown_schema_and_samples_by_value():
    with pytest.raises(ValueError, match="Unsupported"):
        OmniCamTrack.from_dict({"schema_version": 2})

    track = OmniCamTrack.from_dict({})
    sampled = track.sample(0)
    sampled.fov = 10
    assert track.keyframes[0].camera.fov == 35


def test_camera_dynamic_target_tracking_constraint_follows_moving_object():
    track = OmniCamTrack.from_dict({
        "duration_frames": 101,
        "metadata": {"target_object_id": "actor"},
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 5, 10], "target": [0, 0, 0]}, "interpolation": "linear"},
        ],
        "objects": [
            {
                "id": "actor",
                "type": "human",
                "keyframes": [
                    {"frame": 0, "transform": {"position": [0, 1, 0], "rotation": [0, 0, 0], "size": [1, 1, 1]}, "interpolation": "linear"},
                    {"frame": 100, "transform": {"position": [20, 1, 80], "rotation": [0, 0, 0], "size": [1, 1, 1]}, "interpolation": "linear"},
                ],
            }
        ],
    })
    assert track.sample(0).target == [0.0, 1.0, 0.0]
    assert track.sample(50).target == [10.0, 1.0, 40.0]
    assert track.sample(100).target == [20.0, 1.0, 80.0]

