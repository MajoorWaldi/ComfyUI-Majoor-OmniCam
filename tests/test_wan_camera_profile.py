from __future__ import annotations

from dataclasses import replace

import pytest

from omnicam.core.motion_scene import MotionScene
from omnicam.profiles import CompileRequest
from omnicam.profiles.wan_camera import WAN_CAMERA_PROFILE, wan_camera_length


def _scene(*, camera_enabled: bool = True) -> MotionScene:
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 2.0, "authoring_fps": 24.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [
                {
                    "id": "hero_camera",
                    "label": "Hero Camera",
                    "enabled": camera_enabled,
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
                                "camera": {
                                    "position": [0.0, 2.0, 6.0],
                                    "target": [0.0, 1.0, 0.0],
                                    "fov": 45.0,
                                    "roll": 0.0,
                                },
                                "interpolation": "linear",
                            },
                            {
                                "frame": 47,
                                "camera": {
                                    "position": [2.5, 3.0, 3.0],
                                    "target": [0.0, 1.0, 0.0],
                                    "fov": 32.0,
                                    "roll": 12.0,
                                },
                                "interpolation": "smooth",
                            },
                        ],
                        "objects": [],
                        "metadata": {},
                    },
                }
            ],
            "active_camera_id": "hero_camera",
            "playblast_camera_id": "hero_camera",
            "objects": [],
            "motion_layers": [],
            "cuts": [],
            "metadata": {},
        }
    )


def _request(*, camera_enabled: bool = True) -> CompileRequest:
    return CompileRequest(
        motion_scene=_scene(camera_enabled=camera_enabled),
        playblast_video=None,
        base_prompt="A stone tower at blue hour.",
        target_width=832,
        target_height=480,
        duration_seconds=2.0,
        target_fps=24.0,
    )


@pytest.mark.parametrize(
    ("requested", "resolved"),
    [(1, 1), (2, 5), (48, 49), (49, 49), (120, 121), (121, 121)],
)
def test_wan_camera_length_never_shortens_and_resolves_to_4n_plus_1(requested, resolved):
    assert wan_camera_length(requested) == resolved
    assert wan_camera_length(requested) >= requested
    assert (wan_camera_length(requested) - 1) % 4 == 0


def test_wan_camera_profile_resolves_requested_duration_to_native_grid():
    timeline = WAN_CAMERA_PROFILE.resolve_timeline(_request())

    assert timeline.width == 832
    assert timeline.height == 480
    assert timeline.fps == 24.0
    assert timeline.frame_count == 49
    assert timeline.duration_seconds == pytest.approx(49 / 24)
    assert timeline.frame_policy == "requested_length"


def test_wan_camera_profile_compiles_the_authored_playblast_camera(monkeypatch):
    captured = {}
    embedding = object()

    def build(track, *, width, height, length):
        captured.update(track=track, width=width, height=height, length=length)
        return embedding

    monkeypatch.setattr("omnicam.profiles.wan_camera.build_wan_camera_embedding", build)

    result = WAN_CAMERA_PROFILE.compile(_request())

    assert captured["track"].keyframes[-1].camera.position == [2.5, 3.0, 3.0]
    assert captured["track"].keyframes[-1].camera.fov == 32.0
    assert captured["track"].keyframes[-1].camera.roll == 12.0
    assert captured["width"] == 832
    assert captured["height"] == 480
    assert captured["length"] == 49
    assert result.camera_embedding is embedding
    assert result.final_prompt == "A stone tower at blue hour."
    assert result.profile_id == "wan_camera_native"
    assert result.semantic == "camera_embedding"
    assert [check.state for check in result.checks] == ["PASS", "PASS"]


def test_wan_camera_profile_rejects_a_disabled_playblast_camera():
    request = _request(camera_enabled=False)

    checks = WAN_CAMERA_PROFILE.preflight(request)
    assert [(check.id, check.state) for check in checks] == [
        ("playblast_camera", "BLOCKED"),
        ("target_length", "PASS"),
    ]

    with pytest.raises(ValueError, match=r"playblast camera.*disabled"):
        WAN_CAMERA_PROFILE.compile(request)


def test_wan_camera_profile_is_registered_under_its_exact_contract_id():
    from omnicam.profiles.catalog import PROFILE_REGISTRY

    assert PROFILE_REGISTRY.require("wan_camera_native") is WAN_CAMERA_PROFILE
    with pytest.raises(KeyError, match="wan_native"):
        PROFILE_REGISTRY.require("wan_native")


def test_wan_camera_profile_uses_request_timing_not_authoring_fps():
    request = replace(_request(), duration_seconds=1.0, target_fps=30.0)

    timeline = WAN_CAMERA_PROFILE.resolve_timeline(request)

    assert timeline.fps == 30.0
    assert timeline.frame_count == 33
