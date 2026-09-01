from __future__ import annotations

import pytest

from omnicam.core.motion_scene import MotionScene
from omnicam.profiles import CompileRequest
from omnicam.profiles.catalog import PROFILE_REGISTRY
from omnicam.profiles.wan_move import WAN_MOVE_PROFILE


def _scene(*, enabled: bool = True) -> MotionScene:
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 1.0, "authoring_fps": 3.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [
                {
                    "id": "camera",
                    "label": "Camera",
                    "enabled": True,
                    "track": {
                        "schema_version": 1,
                        "fps": 3,
                        "duration_frames": 3,
                        "width": 640,
                        "height": 360,
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
                    "id": "subject",
                    "label": "Subject",
                    "enabled": enabled,
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
                    "id": "anchor",
                    "label": "Anchor",
                    "enabled": enabled,
                    "semantic": "screen_point",
                    "source_kind": "static_anchor",
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "x": 0.25,
                            "y": 0.75,
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


def _request(*, enabled: bool = True) -> CompileRequest:
    return CompileRequest(
        motion_scene=_scene(enabled=enabled),
        playblast_video=None,
        base_prompt="A runner crosses the courtyard.",
        target_width=100,
        target_height=50,
        duration_seconds=1.0,
        target_fps=3.0,
    )


def test_wan_move_compiles_native_tracks_in_time_track_coordinate_order():
    torch = pytest.importorskip("torch")

    result = WAN_MOVE_PROFILE.compile(_request())
    native = result.native_tracks

    assert native is not None
    assert native["track_path"].shape == (3, 2, 2)
    assert native["track_visibility"].shape == (3, 2)
    assert native["track_path"].dtype == torch.float32
    assert native["track_visibility"].dtype == torch.bool
    torch.testing.assert_close(
        native["track_path"].cpu(),
        torch.tensor(
            [
                [[10.0, 10.0], [25.0, 37.5]],
                [[50.0, 25.0], [25.0, 37.5]],
                [[90.0, 40.0], [25.0, 37.5]],
            ]
        ),
    )
    assert native["track_visibility"].cpu().tolist() == [
        [True, True],
        [True, True],
        [False, True],
    ]
    assert result.final_prompt == "A runner crosses the courtyard."
    assert result.target_length == 3
    assert result.tracks_json == ""


def test_wan_move_profile_rejects_a_scene_without_enabled_motion_layers():
    request = _request(enabled=False)

    assert WAN_MOVE_PROFILE.preflight(request)[0].state == "BLOCKED"
    with pytest.raises(ValueError, match="enabled motion layer"):
        WAN_MOVE_PROFILE.compile(request)


def test_wan_move_profile_uses_exact_contract_id_and_track_length_policy():
    assert WAN_MOVE_PROFILE.id == "wan_move_native"
    assert WAN_MOVE_PROFILE.semantic == "screen_tracks"
    assert WAN_MOVE_PROFILE.resolve_timeline(_request()).frame_policy == "track_length"
    assert PROFILE_REGISTRY.require("wan_move_native") is WAN_MOVE_PROFILE
