"""Native ComfyUI Wan Track JSON profile."""

from __future__ import annotations

import math

from ..core.motion_resolution import resolve_motion_scene_tracks
from ..monitor.result import Check, CompiledMotion, ResolvedTimeline, raise_on_blocked
from .base import CompileRequest
from .shots import multi_shot_check, multi_shot_error
from .track_json import encoding_check, tracks_json, visible_prefix_tracks

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

    def _sampled_tracks(self, request: CompileRequest):
        """Resolve the layers once, so preflight judges what compile encodes."""
        timeline = self.resolve_timeline(request)
        return resolve_motion_scene_tracks(
            request.motion_scene,
            sample_count=WAN_TRACK_SOURCE_LENGTH,
            out_seconds=request.source_last_frame_time,
            width=timeline.width,
            height=timeline.height,
        )

    def preflight(self, request: CompileRequest) -> list[Check]:
        tracks = self._sampled_tracks(request)
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
            multi_shot_check(
                request.motion_scene,
                display_name="Wan Track Native",
                can_represent=False,
            ),
            encoding_check(tracks, display_name="Wan Track Native"),
        ]

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        # A blocked gate has to stop compilation, not just colour the panel.
        if request.motion_scene.is_multi_shot:
            raise ValueError(multi_shot_error(request.motion_scene, "Wan Track Native"))
        if checks[0].state == "BLOCKED":
            raise ValueError("Wan Track requires at least one enabled motion layer")
        # Any other BLOCKED gate stops here too, so a check added to preflight
        # is binding without also having to be enumerated in compile.
        raise_on_blocked(checks)
        timeline = self.resolve_timeline(request)
        sampled = self._sampled_tracks(request)
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

