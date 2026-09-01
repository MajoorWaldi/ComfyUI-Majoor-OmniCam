"""MiniMax H3 Native and API motion profiles."""

from __future__ import annotations

import math
from typing import Any

from ..adapters.h3 import build_h3_prompt, h3_native_aligned_length
from ..core.motion_scene import CameraSceneItem, MotionScene
from ..core.video_sampling import resample_video_frames
from ..monitor.result import Check, CompiledMotion, ResolvedTimeline
from .base import CompileRequest


def _playblast_camera(scene: MotionScene) -> CameraSceneItem | None:
    return next(
        (camera for camera in scene.cameras if camera.id == scene.playblast_camera_id),
        None,
    )


class H3NativeProfile:
    id = "h3_native"
    display_name = "MiniMax H3 Native"
    semantic = "reference_video"
    frame_policy = "17n_plus_5_at_24fps"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        requested_frames = max(1, math.ceil(request.duration_seconds * 24.0))
        frame_count = h3_native_aligned_length(requested_frames)
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=24.0,
            duration_seconds=frame_count / 24.0,
            frame_count=frame_count,
            frame_policy=self.frame_policy,
        )

    def preflight(self, request: CompileRequest) -> list[Check]:
        camera = _playblast_camera(request.motion_scene)
        has_camera = camera is not None and camera.enabled
        if camera is None:
            message = "The MotionScene does not contain its selected playblast camera."
        elif not camera.enabled:
            message = f"The selected playblast camera {camera.id!r} is disabled."
        else:
            message = ""

        has_video = request.playblast_video is not None
        video_message = "" if has_video else "A playblast video is required."

        timeline = self.resolve_timeline(request)
        return [
            Check(
                id="playblast_camera",
                label="Selected playblast camera",
                state="PASS" if has_camera else "BLOCKED",
                message=message,
            ),
            Check(
                id="playblast_video",
                label="Connected playblast media",
                state="PASS" if has_video else "BLOCKED",
                message=video_message,
            ),
            Check(
                id="target_length",
                label=f"H3 Native target length: {timeline.frame_count} (17n+5)",
                state="PASS",
            ),
        ]

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        if any(check.state == "BLOCKED" for check in checks):
            # Defer to specific errors for better testing
            if request.playblast_video is None:
                raise ValueError("playblast video is required")
            camera = _playblast_camera(request.motion_scene)
            if camera is None:
                raise ValueError("MotionScene has no usable playblast camera")
            if not camera.enabled:
                raise ValueError(f"playblast camera {camera.id!r} is disabled")

        camera = _playblast_camera(request.motion_scene)
        assert camera is not None  # checked by preflight
        
        timeline = self.resolve_timeline(request)
        prompt_fragment = build_h3_prompt(camera.track, adapter="h3_native")
        final_prompt = f"{request.base_prompt}\n\n{prompt_fragment}".strip()

        # Enforce five-frame minimum and decode at most the target length
        frames = resample_video_frames(
            request.playblast_video,
            target_fps=24.0,
            max_frames=timeline.frame_count,
        )

        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=final_prompt,
            reference_frames=frames,
            checks=tuple(checks),
        )


class H3ApiProfile:
    id = "h3_api"
    display_name = "MiniMax H3 API"
    semantic = "reference_video"
    frame_policy = "api_duration_seconds"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        requested_frames = max(1, math.ceil(request.duration_seconds * request.target_fps))
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=request.target_fps,
            duration_seconds=request.duration_seconds,
            frame_count=requested_frames,
            frame_policy=self.frame_policy,
        )

    def preflight(self, request: CompileRequest) -> list[Check]:
        camera = _playblast_camera(request.motion_scene)
        has_camera = camera is not None and camera.enabled
        if camera is None:
            message = "The MotionScene does not contain its selected playblast camera."
        elif not camera.enabled:
            message = f"The selected playblast camera {camera.id!r} is disabled."
        else:
            message = ""

        has_video = request.playblast_video is not None
        video_message = "" if has_video else "A playblast video is required."

        return [
            Check(
                id="playblast_camera",
                label="Selected playblast camera",
                state="PASS" if has_camera else "BLOCKED",
                message=message,
            ),
            Check(
                id="playblast_video",
                label="Connected playblast media",
                state="PASS" if has_video else "BLOCKED",
                message=video_message,
            ),
            Check(
                id="api_transport",
                label="H3 API media transport",
                state="PASS",
                message="Video transport required for API",
            ),
        ]

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        if any(check.state == "BLOCKED" for check in checks):
            if request.playblast_video is None:
                raise ValueError("playblast video is required")
            camera = _playblast_camera(request.motion_scene)
            if camera is None:
                raise ValueError("MotionScene has no usable playblast camera")
            if not camera.enabled:
                raise ValueError(f"playblast camera {camera.id!r} is disabled")

        camera = _playblast_camera(request.motion_scene)
        assert camera is not None

        timeline = self.resolve_timeline(request)
        prompt_fragment = build_h3_prompt(camera.track, adapter="comfy_api")
        final_prompt = f"{request.base_prompt}\n\n{prompt_fragment}".strip()

        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=final_prompt,
            reference_video=request.playblast_video,
            checks=tuple(checks),
        )


H3_NATIVE_PROFILE = H3NativeProfile()
H3_API_PROFILE = H3ApiProfile()

