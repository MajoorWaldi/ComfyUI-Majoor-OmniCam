from __future__ import annotations

import copy

import pytest

# torch is optional: the model-agnostic lane installs numpy and nothing else.
# A bare ``import torch`` here fails collection for the whole run, which is how
# three green suites turned the core lane red.
pytest.importorskip("torch")

import torch

from omnicam.core.motion_scene import MotionScene
from omnicam.profiles import CompileRequest
from omnicam.profiles.h3 import H3_API_PROFILE, H3_NATIVE_PROFILE
from omnicam.profiles.shots import MULTI_SHOT_PROMPT


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




# ---------------------------------------------------------------------------
# Reference-media contract and multi-shot handling
# ---------------------------------------------------------------------------

class ShortVideo(MockVideo):
    """A reference far below H3's two-second minimum."""

    def get_frame_count(self) -> int:
        return 12  # 0.5 s at 24 fps


class OffRateVideo(MockVideo):
    """A reference outside the 23.9-60.5 fps window the API accepts."""

    def get_frame_rate(self) -> float:
        return 12.0


def _check(checks, check_id):
    return next(check for check in checks if check.id == check_id)


def test_h3_api_blocks_a_reference_shorter_than_the_documented_minimum():
    request = _request()
    object.__setattr__(request, "playblast_video", ShortVideo())

    check = _check(H3_API_PROFILE.preflight(request), "reference_media")

    assert check.state == "BLOCKED"
    assert "below the 2.0s minimum" in check.message


def test_h3_api_blocks_a_reference_frame_rate_the_api_rejects():
    request = _request()
    object.__setattr__(request, "playblast_video", OffRateVideo())

    check = _check(H3_API_PROFILE.preflight(request), "reference_media")

    assert check.state == "BLOCKED"
    assert "frame rate" in check.message


def test_h3_api_refuses_to_compile_a_reference_shorter_than_the_minimum():
    """A BLOCKED preflight has to stop the compile, not just colour the panel.

    The API rejects this itself -- but only after the upload, and with an error
    that arrives too late to be actionable.
    """
    request = _request()
    object.__setattr__(request, "playblast_video", ShortVideo())

    with pytest.raises(ValueError, match=r"below the 2\.0s minimum"):
        H3_API_PROFILE.compile(request)


def test_h3_api_refuses_to_compile_a_reference_frame_rate_the_api_rejects():
    request = _request()
    object.__setattr__(request, "playblast_video", OffRateVideo())

    with pytest.raises(ValueError, match="frame rate"):
        H3_API_PROFILE.compile(request)


def test_h3_native_warns_rather_than_blocks_on_a_short_reference():
    """Native has recommendations where the API has hard limits."""
    request = _request()
    object.__setattr__(request, "playblast_video", ShortVideo())

    check = _check(H3_NATIVE_PROFILE.preflight(request), "reference_media")

    assert check.state == "WARNING"


def test_h3_native_reports_the_five_frame_floor_before_compiling():
    """The runtime floor and the panel have to agree.

    A three-frame reference used to preflight as a mere WARNING and then raise
    at compile time, so the panel said the scene was fine right up until it was
    not.
    """
    class TinyVideo(MockVideo):
        def get_frame_count(self) -> int:
            return 3

    request = _request()
    object.__setattr__(request, "playblast_video", TinyVideo())

    check = _check(H3_NATIVE_PROFILE.preflight(request), "reference_frames")

    assert check.state == "BLOCKED"
    assert "at least 5 reference frames" in check.message


def test_a_reference_long_enough_to_encode_passes_the_frame_floor():
    """Short for the recommendation is not the same as too short to encode."""
    request = _request()
    object.__setattr__(request, "playblast_video", ShortVideo())  # 12 frames

    check = _check(H3_NATIVE_PROFILE.preflight(request), "reference_frames")

    assert check.state == "PASS"


def test_h3_native_refuses_a_playblast_that_decodes_below_five_frames():
    class TinyVideo(MockVideo):
        # The decoded length follows the source frame count, so that is what a
        # too-short reference actually looks like.
        def get_frame_count(self) -> int:
            return 3

    request = _request()
    object.__setattr__(request, "playblast_video", TinyVideo())

    with pytest.raises(ValueError, match="at least 5 reference frames"):
        H3_NATIVE_PROFILE.compile(request)


def _multi_shot_request() -> CompileRequest:
    payload = _scene().to_dict()
    second = copy.deepcopy(payload["cameras"][0])
    second["id"] = "wide_camera"
    second["label"] = "Wide Camera"
    payload["cameras"].append(second)
    # Cuts are expressed in seconds, like everything else in a MotionScene.
    payload["cuts"] = [
        {"camera_id": "hero_camera", "time_seconds": 0.0, "end_time_seconds": 1.0},
        {"camera_id": "wide_camera", "time_seconds": 1.0, "end_time_seconds": 2.0},
    ]
    request = _request()
    object.__setattr__(request, "motion_scene", MotionScene.from_dict(payload))
    return request


def test_h3_reports_a_multi_shot_edit_and_stops_describing_one_camera():
    """The playblast carries the cuts, so the video stays valid; the prompt must not."""
    request = _multi_shot_request()

    assert request.motion_scene.is_multi_shot
    check = _check(H3_API_PROFILE.preflight(request), "multi_shot")
    assert check.state == "WARNING"

    result = H3_API_PROFILE.compile(request)
    assert MULTI_SHOT_PROMPT in result.final_prompt
    assert result.final_prompt.startswith("A stone tower at blue hour.")


def test_a_single_camera_scene_is_not_reported_as_an_edit():
    check = _check(H3_API_PROFILE.preflight(_request()), "multi_shot")

    assert check.state == "PASS"
    assert MULTI_SHOT_PROMPT not in H3_API_PROFILE.compile(_request()).final_prompt
