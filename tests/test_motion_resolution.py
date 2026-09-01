from __future__ import annotations

import pytest

from omnicam.core.motion_resolution import resolve_motion_scene_tracks
from omnicam.core.motion_scene import MotionScene


def _scene() -> MotionScene:
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 1.0, "authoring_fps": 4.0},
            "canvas": {"width": 400, "height": 200},
            "cameras": [
                {
                    "id": "camera",
                    "label": "Camera",
                    "enabled": True,
                    "track": {
                        "schema_version": 1,
                        "fps": 4,
                        "duration_frames": 4,
                        "width": 400,
                        "height": 200,
                        "keyframes": [
                            {
                                "frame": 0,
                                "camera": {
                                    "position": [0, 0, 5],
                                    "target": [0, 0, 0],
                                    "fov": 60,
                                },
                                "interpolation": "linear",
                            }
                        ],
                    },
                }
            ],
            "active_camera_id": "camera",
            "playblast_camera_id": "camera",
            "objects": [
                {
                    "id": "subject",
                    "position": [0, 0, 0],
                    "rotation": [0, 0, 0],
                    "size": [1, 1, 1],
                    "keyframes": [],
                }
            ],
            "motion_layers": [
                {
                    "id": "manual",
                    "label": "Manual",
                    "enabled": True,
                    "semantic": "screen_point",
                    "source_kind": "manual_2d",
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "x": 0.1,
                            "y": 0.2,
                            "visible": True,
                            "interpolation": "linear",
                        },
                        {
                            "time_seconds": 1.0,
                            "x": 0.9,
                            "y": 0.8,
                            "visible": False,
                            "interpolation": "linear",
                        },
                    ],
                    "source": {},
                },
                {
                    "id": "world",
                    "label": "World",
                    "enabled": True,
                    "semantic": "screen_point",
                    "source_kind": "world_point",
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "x": 0.0,
                            "y": 0.0,
                            "visible": True,
                            "interpolation": "hold",
                        }
                    ],
                    "source": {"point": [0, 0, 0]},
                },
                {
                    "id": "object",
                    "label": "Object",
                    "enabled": True,
                    "semantic": "screen_point",
                    "source_kind": "object_point",
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "x": 0.0,
                            "y": 0.0,
                            "visible": True,
                            "interpolation": "hold",
                        }
                    ],
                    "source": {"object_id": "subject", "local_point": [1, 0, 0]},
                },
                {
                    "id": "disabled",
                    "label": "Disabled",
                    "enabled": False,
                    "semantic": "screen_point",
                    "source_kind": "static_anchor",
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "x": 0.5,
                            "y": 0.5,
                            "visible": True,
                            "interpolation": "hold",
                        }
                    ],
                    "source": {},
                },
            ],
            "cuts": [],
            "metadata": {},
        }
    )


def test_resolve_motion_scene_tracks_combines_authored_and_projected_sources():
    tracks = resolve_motion_scene_tracks(_scene(), sample_count=3, out_seconds=1.0)

    assert [track.id for track in tracks] == ["manual", "world", "object"]
    assert tracks[0].xy == pytest.approx([(0.1, 0.2), (0.5, 0.5), (0.9, 0.8)])
    assert tracks[0].visible == [True, True, False]
    assert tracks[1].xy == pytest.approx([(0.5, 0.5)] * 3)
    assert tracks[1].visible == [True, True, True]
    assert all(x > 0.5 for x, _y in tracks[2].xy)
    assert tracks[2].visible == [True, True, True]


def test_resolve_motion_scene_tracks_rejects_missing_projected_source_data():
    scene = _scene()
    scene.motion_layers[1].source = {}

    with pytest.raises(ValueError, match=r"world.*point"):
        resolve_motion_scene_tracks(scene, sample_count=2, out_seconds=1.0)


def test_resolve_motion_scene_tracks_projects_for_the_target_aspect_ratio():
    scene = _scene()
    wide = resolve_motion_scene_tracks(
        scene,
        sample_count=1,
        out_seconds=1.0,
        width=400,
        height=200,
    )[2]
    square = resolve_motion_scene_tracks(
        scene,
        sample_count=1,
        out_seconds=1.0,
        width=200,
        height=200,
    )[2]

    assert square.xy[0][0] - 0.5 > wide.xy[0][0] - 0.5
