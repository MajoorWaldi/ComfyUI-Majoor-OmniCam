from __future__ import annotations

import pytest

from omnicam.core.motion_projection import project_object_track, project_world_track
from omnicam.core.track import OmniCamTrack


def _camera_track() -> OmniCamTrack:
    return OmniCamTrack.from_dict(
        {
            "fps": 24,
            "duration_frames": 25,
            "width": 1280,
            "height": 720,
            "keyframes": [
                {
                    "frame": 0,
                    "camera": {"position": [0, 0, 5], "target": [0, 0, 0], "fov": 60},
                    "interpolation": "linear",
                },
                {
                    "frame": 24,
                    "camera": {"position": [1, 0, 5], "target": [0, 0, 0], "fov": 60},
                    "interpolation": "linear",
                },
            ],
        }
    )


def test_world_point_track_uses_animated_camera_and_normalized_coordinates():
    projected = project_world_track(
        [1, 0, 0], _camera_track(), [0.0, 1.0], width=1280, height=720
    )

    assert projected[0].visible is True
    assert projected[0].x is not None and 0.5 < projected[0].x < 1.0
    assert projected[0].y == pytest.approx(0.5)
    assert projected[1].visible is True
    assert projected[1].depth != pytest.approx(projected[0].depth)


def test_behind_camera_point_is_invisible_without_edge_clamping():
    projected = project_world_track(
        [0, 0, 6], _camera_track(), [0.0], width=1280, height=720
    )[0]

    assert projected.visible is False
    assert projected.x is None
    assert projected.y is None
    assert projected.depth is None


def test_object_local_point_uses_animated_world_transform():
    objects = [
        {
            "id": "subject",
            "position": [0, 0, 0],
            "rotation": [0, 0, 0],
            "size": [1, 1, 1],
            "keyframes": [
                {
                    "frame": 0,
                    "transform": {
                        "position": [0, 0, 0],
                        "rotation": [0, 0, 0],
                        "size": [1, 1, 1],
                    },
                },
                {
                    "frame": 24,
                    "transform": {
                        "position": [1, 0, 0],
                        "rotation": [0, 0, 90],
                        "size": [2, 2, 2],
                    },
                },
            ],
        }
    ]

    projected = project_object_track(
        objects,
        "subject",
        [0.5, 0, 0],
        _camera_track(),
        [0.0, 1.0],
        width=1280,
        height=720,
    )
    direct = project_world_track(
        [1, 1, 0], _camera_track(), [1.0], width=1280, height=720
    )[0]

    assert projected[0].visible is True
    assert projected[1].x == pytest.approx(direct.x)
    assert projected[1].y == pytest.approx(direct.y)


def test_aspect_ratio_changes_horizontal_normalized_projection():
    square = project_world_track(
        [1, 0, 0], _camera_track(), [0.0], width=720, height=720
    )[0]
    wide = project_world_track(
        [1, 0, 0], _camera_track(), [0.0], width=1280, height=720
    )[0]

    assert square.visible and wide.visible
    assert square.x is not None and wide.x is not None
    assert square.x - 0.5 > wide.x - 0.5


def test_object_projection_rejects_unknown_object():
    with pytest.raises(ValueError, match="unknown object"):
        project_object_track(
            [], "missing", [0, 0, 0], _camera_track(), [0.0], width=1280, height=720
        )
