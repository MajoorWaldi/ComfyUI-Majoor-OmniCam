"""Wan native camera-embedding profile."""

from __future__ import annotations

import math

from ..adapters.wan_native import build_wan_camera_embedding
from ..core.motion_scene import CameraSceneItem, MotionScene
from ..monitor.result import Check, CompiledMotion, ResolvedTimeline
from .base import CompileRequest


def wan_camera_length(requested_frames: int) -> int:
    """Resolve upward to the 4n+1 grid required by Wan's latent packing."""
    value = max(1, int(requested_frames))
    return ((value - 1 + 3) // 4) * 4 + 1


def _playblast_camera(scene: MotionScene) -> CameraSceneItem | None:
    return next(
        (camera for camera in scene.cameras if camera.id == scene.playblast_camera_id),
        None,
    )


class WanCameraProfile:
    id = "wan_camera_native"
    display_name = "Wan Camera Native"
    semantic = "camera_embedding"
    frame_policy = "requested_length"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        requested_frames = max(1, math.ceil(request.duration_seconds * request.target_fps))
        frame_count = wan_camera_length(requested_frames)
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=request.target_fps,
            duration_seconds=frame_count / request.target_fps,
            frame_count=frame_count,
            frame_policy=self.frame_policy,
        )

    def preflight(self, request: CompileRequest) -> list[Check]:
        camera = _playblast_camera(request.motion_scene)
        usable = camera is not None and camera.enabled
        if camera is None:
            message = "The MotionScene does not contain its selected playblast camera."
        elif not camera.enabled:
            message = f"The selected playblast camera {camera.id!r} is disabled."
        else:
            message = ""
        timeline = self.resolve_timeline(request)
        return [
            Check(
                id="playblast_camera",
                label="Selected playblast camera",
                state="PASS" if usable else "BLOCKED",
                message=message,
            ),
            Check(
                id="target_length",
                label=f"Wan target length: {timeline.frame_count} (4n+1)",
                state="PASS",
            ),
        ]

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        camera = _playblast_camera(request.motion_scene)
        if camera is None:
            raise ValueError("MotionScene has no usable playblast camera")
        if not camera.enabled:
            raise ValueError(f"playblast camera {camera.id!r} is disabled")

        timeline = self.resolve_timeline(request)
        embedding = build_wan_camera_embedding(
            camera.track,
            width=timeline.width,
            height=timeline.height,
            length=timeline.frame_count,
        )
        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=request.base_prompt,
            camera_embedding=embedding,
            checks=tuple(checks),
        )


WAN_CAMERA_PROFILE = WanCameraProfile()

