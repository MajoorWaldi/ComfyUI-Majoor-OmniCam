"""MiniMax H3 Scene Coverage profile: compile camera geometry directly.

Unlike ``h3_native``/``h3_api``, this profile needs no playblast. It samples
the selected MotionScene camera, analyzes it as a target-centric orbit, and
compiles a complete H3 prompt plus ``H3EDIT_OPTIONS`` -- never a reference
video.
"""

from __future__ import annotations

import math

from ..adapters.h3_camera_contract import build_h3_scene_coverage_prompt
from ..adapters.h3_geometry import H3GeometryAnalysis, analyze_h3_geometry
from ..adapters.h3_representability import H3Representability, evaluate_h3_scene_coverage
from ..adapters.h3_scene_coverage import (
    H3_SCENE_FPS,
    H3SceneProfile,
    build_h3edit_scene_options,
    h3_grid,
    select_h3_scene_profile,
)
from ..core.motion_scene import CameraSceneItem, MotionScene
from ..core.track import OmniCamTrack
from ..monitor.result import Check, CompiledMotion, ResolvedTimeline, raise_on_blocked
from .base import CompileRequest
from .shots import multi_shot_check

DISPLAY_NAME = "MiniMax H3 — Scene Coverage"
_MAX_SCENE_COVERAGE_FRAMES = 362


def _selected_camera(scene: MotionScene) -> CameraSceneItem | None:
    return next((camera for camera in scene.cameras if camera.id == scene.playblast_camera_id), None)


def _resolve_scene_profile(requested_frames: int) -> H3SceneProfile:
    try:
        return select_h3_scene_profile(requested_frames)
    except ValueError:
        return select_h3_scene_profile(_MAX_SCENE_COVERAGE_FRAMES)


def _representation_check(analysis: H3GeometryAnalysis | None, representability: H3Representability | None, error: str) -> Check:
    if error:
        return Check(id="h3_camera_representation", label="H3 camera representation", state="BLOCKED", message=error)
    if analysis is None or representability is None:
        raise TypeError("analysis and representability must be present when no error was reported")
    if representability.state == "BLOCKED":
        message = " ".join((*representability.reasons, *representability.recommendations))
        return Check(id="h3_camera_representation", label="H3 camera representation", state="BLOCKED", message=message)
    detail = (
        f"target drift {analysis.max_target_drift_ratio * 100:.1f}%, "
        f"roll drift {analysis.max_roll_delta_degrees:.1f}°, FOV drift {analysis.max_fov_delta_degrees:.1f}°."
    )
    if representability.state == "WARNING":
        return Check(
            id="h3_camera_representation", label="H3 camera representation", state="WARNING",
            message=" ".join((*representability.reasons, detail)),
        )
    return Check(
        id="h3_camera_representation", label="H3 camera representation", state="PASS",
        message=f"Single continuous target-centric orbit; {detail}",
    )


def _direction_check(analysis: H3GeometryAnalysis) -> Check:
    return Check(
        id="h3_camera_direction", label="H3 camera direction", state="PASS",
        message=f"{abs(analysis.net_orbit_degrees):.1f}° {analysis.coverage_direction}.",
    )


def _completion_check(analysis: H3GeometryAnalysis) -> Check:
    if analysis.total_orbit_degrees < 5.0:
        return Check(
            id="h3_camera_completion", label="H3 camera completion", state="PASS",
            message="The camera stays locked to its opening view for the complete duration.",
        )
    final_view = "returns to the opening view" if analysis.loop_closure else "reaches the new view described by the direction and completion contracts"
    return Check(
        id="h3_camera_completion", label="H3 camera completion", state="PASS",
        message=f"{analysis.total_orbit_degrees:.1f}° total travel; final view {final_view}.",
    )


def _timing_check(requested_frames: int, resolved: H3SceneProfile) -> Check:
    if requested_frames > _MAX_SCENE_COVERAGE_FRAMES:
        return Check(
            id="h3_camera_timing", label="H3 camera timing", state="BLOCKED",
            message=(
                f"Authored duration requests {requested_frames} frames at 24 fps, which exceeds the "
                f"362-frame H3 scene-coverage ceiling. Use MiniMax H3 Native reference-video transport for this camera move."
            ),
        )
    if requested_frames == resolved.frames:
        return Check(
            id="h3_camera_timing", label="H3 camera timing", state="PASS",
            message=f"Authored {requested_frames} frames at 24 fps map directly onto the {resolved.frames}-frame H3 scene profile.",
        )
    return Check(
        id="h3_camera_timing", label="H3 camera timing", state="WARNING",
        message=f"Authored {requested_frames} frames at 24 fps will be remapped to the {resolved.frames}-frame H3 scene profile.",
    )


def _loop_closure_check(analysis: H3GeometryAnalysis) -> Check:
    if analysis.total_orbit_degrees < 5.0:
        return Check(id="h3_loop_closure", label="H3 loop closure", state="PASS", message="Static hold; loop closure does not apply.")
    if analysis.loop_closure:
        return Check(
            id="h3_loop_closure", label="H3 loop closure", state="PASS",
            message=f"{abs(analysis.net_orbit_degrees):.0f}° endpoint matches the opening camera; final source anchor closure enabled.",
        )
    return Check(
        id="h3_loop_closure", label="H3 loop closure", state="PASS",
        message="This camera move does not return to its opening view; closure is not requested.",
    )


class H3SceneCoverageProfile:
    id = "h3_scene_coverage"
    display_name = DISPLAY_NAME
    semantic = "prompt_options"
    frame_policy = "h3_scene_coverage_profiles"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        requested_frames = max(1, math.ceil(request.duration_seconds * H3_SCENE_FPS))
        profile = _resolve_scene_profile(requested_frames)
        return ResolvedTimeline(
            width=h3_grid(request.target_width),
            height=h3_grid(request.target_height),
            fps=H3_SCENE_FPS,
            duration_seconds=profile.frames / H3_SCENE_FPS,
            frame_count=profile.frames,
            frame_policy=self.frame_policy,
        )

    def _analyze(self, request: CompileRequest) -> tuple[OmniCamTrack | None, H3GeometryAnalysis | None, H3Representability | None, str]:
        camera = _selected_camera(request.motion_scene)
        if camera is None:
            return None, None, None, "The MotionScene does not contain its selected playblast camera."
        if not camera.enabled:
            return None, None, None, f"The selected playblast camera {camera.id!r} is disabled."
        try:
            analysis = analyze_h3_geometry(camera.track)
        except ValueError as error:
            return camera.track, None, None, str(error)
        representability = evaluate_h3_scene_coverage(camera.track, analysis, is_multi_shot=request.motion_scene.is_multi_shot)
        return camera.track, analysis, representability, ""

    def preflight(self, request: CompileRequest) -> list[Check]:
        _track, analysis, representability, error = self._analyze(request)
        checks = [
            multi_shot_check(request.motion_scene, display_name=DISPLAY_NAME, can_represent=False),
            _representation_check(analysis, representability, error),
        ]
        if analysis is not None and representability is not None and representability.state != "BLOCKED":
            requested_frames = max(1, math.ceil(request.duration_seconds * H3_SCENE_FPS))
            resolved = _resolve_scene_profile(requested_frames)
            checks.append(_direction_check(analysis))
            checks.append(_completion_check(analysis))
            checks.append(_timing_check(requested_frames, resolved))
            checks.append(_loop_closure_check(analysis))
        return checks

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        if any(check.state == "BLOCKED" for check in checks):
            raise_on_blocked(checks)

        track, analysis, _representability, _error = self._analyze(request)
        if track is None or analysis is None:
            raise TypeError("track and analysis must be present after a non-BLOCKED preflight")

        timeline = self.resolve_timeline(request)
        final_prompt = build_h3_scene_coverage_prompt(
            track, analysis, target_frames=timeline.frame_count, base_prompt=request.base_prompt,
        )
        h3edit_options = build_h3edit_scene_options(track, analysis, target_frames=timeline.frame_count)

        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=final_prompt,
            h3edit_options=h3edit_options,
            checks=tuple(checks),
        )


H3_SCENE_COVERAGE_PROFILE = H3SceneCoverageProfile()

__all__ = ["H3_SCENE_COVERAGE_PROFILE", "H3SceneCoverageProfile"]
