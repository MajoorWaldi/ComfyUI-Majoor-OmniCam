from __future__ import annotations

import json
from dataclasses import replace

import pytest

from omnicam.core.motion_scene import MotionScene
from omnicam.profiles import CompileRequest
from omnicam.profiles.ltx_motion import LTX_MOTION_PROFILE


def _scene(*, layers_enabled: bool = True) -> MotionScene:
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 2.0, "authoring_fps": 24.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [
                {
                    "id": "camera",
                    "label": "Camera",
                    "enabled": True,
                    "track": {
                        "schema_version": 1,
                        "fps": 24,
                        "duration_frames": 48,
                        "width": 640,
                        "height": 360,
                        "render_mode": "omni_ref",
                        "keyframes": [
                            {
                                "frame": 0,
                                "camera": {"position": [0, 0, 5], "target": [0, 0, 0]},
                                "interpolation": "linear",
                            }
                        ],
                    },
                }
            ],
            "active_camera_id": "camera",
            "playblast_camera_id": "camera",
            "objects": [],
            "motion_layers": [
                {
                    "id": "layer_1",
                    "label": "Test Layer",
                    "enabled": layers_enabled,
                    "semantic": "screen_point",
                    "source_kind": "manual_2d",
                    "source": {},
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "interpolation": "linear",
                            "visible": True,
                            "x": 0.1,
                            "y": 0.2,
                        },
                        {
                            "time_seconds": 2.0,
                            "interpolation": "linear",
                            "visible": True,
                            "x": 0.9,
                            "y": 0.8,
                        },
                    ],
                }
            ],
            "cuts": [],
            "metadata": {},
        }
    )


def _request(*, layers_enabled: bool = True) -> CompileRequest:
    return CompileRequest(
        motion_scene=_scene(layers_enabled=layers_enabled),
        playblast_video=None,
        base_prompt="A testing prompt.",
        target_width=832,
        target_height=480,
        duration_seconds=2.0,
        target_fps=24.0,
    )


def test_ltx_motion_profile_resolves_timeline():
    timeline = LTX_MOTION_PROFILE.resolve_timeline(_request())
    # 2.0 * 24.0 = 48. LTX grid is 8n+1. 48 -> 41.
    assert timeline.frame_count == 41
    assert timeline.fps == 24.0
    assert timeline.duration_seconds == pytest.approx(41 / 24.0)
    assert timeline.frame_policy == "8n_plus_1"


def test_ltx_motion_profile_compiles_json():
    result = LTX_MOTION_PROFILE.compile(_request())
    assert result.profile_id == "ltx25_motion_track"
    assert result.semantic == "screen_tracks"
    
    tracks = json.loads(result.tracks_json)
    assert len(tracks) == 1
    points = tracks[0]
    assert len(points) == 41
    # Check that points are in pixel coordinates for target resolution
    # start is 0.1, 0.2. target_width=832, target_height=480
    assert points[0]["x"] == pytest.approx(0.1 * 832)
    assert points[0]["y"] == pytest.approx(0.2 * 480)
    
    # Prompt should be base prompt, no duplicated motion logic
    assert result.final_prompt == "A testing prompt."


def test_ltx_motion_profile_requires_enabled_layers():
    request = _request(layers_enabled=False)
    checks = LTX_MOTION_PROFILE.preflight(request)
    assert any(c.id == "motion_layers" and c.state == "BLOCKED" for c in checks)
    with pytest.raises(ValueError, match="at least one enabled motion layer"):
        LTX_MOTION_PROFILE.compile(request)
