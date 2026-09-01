from __future__ import annotations

from dataclasses import replace

import pytest
import torch

from omnicam.core.motion_scene import MotionScene
from omnicam.profiles import CompileRequest
from omnicam.profiles.h3 import H3_API_PROFILE, H3_NATIVE_PROFILE


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


class MockVideo:
    def get_frame_rate(self) -> float:
        return 24.0

    def get_frame_count(self) -> int:
        return 100

    def get_dimensions(self) -> tuple[int, int]:
        return (640, 360)

    def as_trimmed(self, start_time: float, duration: float, strict_duration: bool):
        frames = max(1, round(duration * 24.0))
        class Trimmed:
            def get_components(self):
                class Comps:
                    images = torch.zeros((frames, 360, 640, 3))
                return Comps()
        return Trimmed()


def _request(*, camera_enabled: bool = True, with_video: bool = True) -> CompileRequest:
    return CompileRequest(
        motion_scene=_scene(camera_enabled=camera_enabled),
        playblast_video=MockVideo() if with_video else None,
        base_prompt="A stone tower at blue hour.",
        target_width=832,
        target_height=480,
        duration_seconds=2.0,
        target_fps=24.0,
    )


def test_h3_native_profile_resolves_timeline():
    timeline = H3_NATIVE_PROFILE.resolve_timeline(_request())
    assert timeline.frame_count == 56  # 5 + 17*3 = 56 (since 2.0s * 24 = 48)
    assert timeline.fps == 24.0
    assert timeline.duration_seconds == pytest.approx(56 / 24.0)
    assert timeline.frame_policy == "17n_plus_5_at_24fps"


def test_h3_native_profile_compiles_bounded_frames():
    result = H3_NATIVE_PROFILE.compile(_request())
    assert result.profile_id == "h3_native"
    assert result.semantic == "reference_video"
    assert "<Video 1>" in result.final_prompt
    assert result.reference_frames is not None
    assert isinstance(result.reference_frames, torch.Tensor)
    assert result.reference_frames.shape == (56, 360, 640, 3)
    assert result.reference_video is None


def test_h3_api_profile_resolves_timeline():
    timeline = H3_API_PROFILE.resolve_timeline(_request())
    assert timeline.frame_count == 48
    assert timeline.fps == 24.0
    assert timeline.duration_seconds == 2.0
    assert timeline.frame_policy == "api_duration_seconds"


def test_h3_api_profile_compiles_video_transport():
    request = _request()
    result = H3_API_PROFILE.compile(request)
    assert result.profile_id == "h3_api"
    assert result.semantic == "reference_video"
    assert "Video 1" in result.final_prompt  # No brackets for API
    assert result.reference_video is request.playblast_video
    assert result.reference_frames is None


def test_h3_profiles_require_playblast_video():
    request = _request(with_video=False)

    native_checks = H3_NATIVE_PROFILE.preflight(request)
    assert any(c.id == "playblast_video" and c.state == "BLOCKED" for c in native_checks)
    with pytest.raises(ValueError, match="playblast video is required"):
        H3_NATIVE_PROFILE.compile(request)

    api_checks = H3_API_PROFILE.preflight(request)
    assert any(c.id == "playblast_video" and c.state == "BLOCKED" for c in api_checks)
    with pytest.raises(ValueError, match="playblast video is required"):
        H3_API_PROFILE.compile(request)


