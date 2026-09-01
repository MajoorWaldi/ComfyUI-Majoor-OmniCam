"""Native ComfyUI Wan Track JSON profile."""

from __future__ import annotations

import math

from ..core.motion_resolution import resolve_motion_scene_tracks
from ..monitor.result import Check, CompiledMotion, ResolvedTimeline
from .base import CompileRequest
from .track_json import tracks_json, visible_prefix_tracks

WAN_TRACK_SOURCE_LENGTH = 121


class WanTrackProfile:
    id = "wan_track_native"
    display_name = "Wan Track Native"
    semantic = "screen_tracks"
    frame_policy = "requested_length_with_121_source_grid"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        frame_count = max(1, math.ceil(request.duration_seconds * request.target_fps))
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=request.target_fps,
            duration_seconds=request.duration_seconds,
            frame_count=frame_count,
            frame_policy=self.frame_policy,
        )

    def preflight(self, request: CompileRequest) -> list[Check]:
        enabled_count = sum(layer.enabled for layer in request.motion_scene.motion_layers)
        return [
            Check(
                id="motion_layers",
                label=f"Enabled motion layers: {enabled_count}",
                state="PASS" if enabled_count else "BLOCKED",
                message="Wan Track requires at least one enabled motion layer."
                if not enabled_count
                else "",
            ),
            Check(
                id="source_grid",
                label="Wan Track source grid: 121 samples",
                state="PASS",
            ),
        ]

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        if checks[0].state == "BLOCKED":
            raise ValueError("Wan Track requires at least one enabled motion layer")
        timeline = self.resolve_timeline(request)
        sampled = resolve_motion_scene_tracks(
            request.motion_scene,
            sample_count=WAN_TRACK_SOURCE_LENGTH,
            out_seconds=request.duration_seconds,
            width=timeline.width,
            height=timeline.height,
        )
        encoded = visible_prefix_tracks(sampled, width=timeline.width, height=timeline.height)
        if not encoded:
            raise ValueError("Wan Track has no trajectory visible on its first sample")
        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=request.base_prompt,
            tracks_json=tracks_json(encoded),
            checks=tuple(checks),
        )


WAN_TRACK_PROFILE = WanTrackProfile()

