from __future__ import annotations

from dataclasses import replace
from typing import Any

import pytest

from omnicam.core.motion_scene import MotionScene, motion_scene_from_camera_track
from omnicam.monitor.result import Check, CompiledMotion, ResolvedTimeline
from omnicam.profiles import CompileRequest, MotionProfile, ProfileRegistry


def _motion_scene() -> MotionScene:
    return motion_scene_from_camera_track(
        {
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
                        "position": [6.0, 4.0, 6.0],
                        "target": [0.0, 1.5, 0.0],
                        "fov": 35.0,
                        "roll": 0.0,
                        "camera_type": "perspective",
                        "zoom": 1.0,
                        "near": 0.01,
                        "far": 10000.0,
                    },
                    "interpolation": "ease",
                }
            ],
            "objects": [],
            "metadata": {},
        }
    )


def _request() -> CompileRequest:
    return CompileRequest(
        motion_scene=_motion_scene(),
        playblast_video=None,
        base_prompt="A quiet architectural study.",
        target_width=1280,
        target_height=720,
        duration_seconds=2.0,
        target_fps=24.0,
    )


def _timeline(policy: str = "requested_length") -> ResolvedTimeline:
    return ResolvedTimeline(
        width=1280,
        height=720,
        fps=24.0,
        duration_seconds=2.0,
        frame_count=48,
        frame_policy=policy,
    )


class _Profile:
    def __init__(
        self,
        profile_id: str,
        *,
        semantic: str = "camera_embedding",
        frame_policy: str = "requested_length",
    ) -> None:
        self.id = profile_id
        self.display_name = f"Profile {profile_id}"
        self.semantic = semantic
        self.frame_policy = frame_policy

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        del request
        return _timeline(self.frame_policy)

    def preflight(self, request: CompileRequest) -> list[Check]:
        del request
        return [Check(id="contract", label="Pinned contract", state="PASS")]

    def compile(self, request: CompileRequest) -> CompiledMotion:
        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=self.resolve_timeline(request),
            final_prompt=request.base_prompt,
        )


def test_compile_request_accepts_only_valid_monitor_inputs():
    request = _request()

    assert request.motion_scene.canvas.width == 640
    assert request.playblast_video is None
    assert request.target_width == 1280
    assert request.target_height == 720
    assert request.duration_seconds == 2.0
    assert request.target_fps == 24.0

    for field, value in (
        ("target_width", 0),
        ("target_height", -1),
        ("duration_seconds", 0.0),
        ("duration_seconds", float("nan")),
        ("target_fps", float("inf")),
    ):
        with pytest.raises(ValueError, match=field):
            replace(request, **{field: value})

    with pytest.raises(TypeError, match="MotionScene"):
        replace(request, motion_scene={"version": 1})  # type: ignore[arg-type]


def test_resolved_timeline_validates_dimensions_count_and_pinned_policy():
    timeline = _timeline("17n_plus_5_at_24fps")

    assert timeline.frame_count == 48
    assert timeline.frame_policy == "17n_plus_5_at_24fps"
    assert timeline.target_length == 48

    for field, value in (
        ("width", 0),
        ("height", -1),
        ("fps", float("nan")),
        ("duration_seconds", 0.0),
        ("frame_count", 0),
        ("frame_policy", "capability_default"),
    ):
        with pytest.raises(ValueError, match=field):
            replace(timeline, **{field: value})


def test_profile_registry_enforces_unique_ids_and_contract_vocabulary():
    first = _Profile("wan_camera_native")

    with pytest.raises(ValueError, match=r"duplicate profile id.*wan_camera_native"):
        ProfileRegistry([first, _Profile("wan_camera_native")])

    with pytest.raises(ValueError, match="semantic"):
        ProfileRegistry([_Profile("unknown", semantic="camera_guess")])

    with pytest.raises(ValueError, match="frame_policy"):
        ProfileRegistry([_Profile("unknown", frame_policy="best_available")])

    for bad_id in ("", " WAN Camera ", "wan.camera"):
        with pytest.raises(ValueError, match="profile id"):
            ProfileRegistry([_Profile(bad_id)])


def test_profile_registry_resolves_exact_id_without_capability_fallback():
    native = _Profile("h3_native", semantic="reference_video", frame_policy="17n_plus_5_at_24fps")
    api = _Profile("h3_api", semantic="reference_video", frame_policy="api_duration_seconds")
    registry = ProfileRegistry([native, api])

    assert registry.require("h3_native") is native
    assert registry.require("h3_api") is api
    assert registry.ids == ("h3_api", "h3_native")

    with pytest.raises(KeyError, match="missing_profile"):
        registry.require("missing_profile")

    assert not hasattr(registry, "best_for_capabilities")
    assert not hasattr(registry, "for_semantic")


def test_motion_profile_protocol_and_compiled_result_are_static_and_typed():
    profile: Any = _Profile("wan_camera_native")
    assert isinstance(profile, MotionProfile)

    result = profile.compile(_request())
    assert result.profile_id == "wan_camera_native"
    assert result.semantic == "camera_embedding"
    assert result.target_width == 1280
    assert result.target_height == 720
    assert result.target_length == 48
    assert result.reference_video is None
    assert result.reference_frames is None
    assert result.camera_embedding is None
    assert result.native_tracks is None
    assert result.tracks_json == ""
    assert result.checks == ()

    with pytest.raises(ValueError, match="semantic"):
        replace(result, semantic="camera_guess")


def test_checks_reject_unknown_states_and_keep_messages_optional():
    assert Check(id="camera", label="Camera present", state="PASS").message == ""

    with pytest.raises(ValueError, match="state"):
        Check(id="camera", label="Camera present", state="MAYBE")
