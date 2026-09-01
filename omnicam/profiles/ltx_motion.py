"""LTX Motion Track profile."""

from __future__ import annotations

import math

from ..adapters.ltx_tracks import ltx_frame_count
from ..core.motion_resolution import resolve_motion_scene_tracks
from ..monitor.result import Check, CompiledMotion, ResolvedTimeline
from .base import CompileRequest
from .shots import multi_shot_check, multi_shot_error
from .track_json import encoding_check, tracks_json, visible_prefix_tracks


class LtxMotionProfile:
    id = "ltx25_motion_track"
    display_name = "LTX 2.5 Motion Track"
    semantic = "screen_tracks"
    frame_policy = "8n_plus_1"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        requested_frames = max(1, math.ceil(request.duration_seconds * request.target_fps))
        frame_count = ltx_frame_count(requested_frames)
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=request.target_fps,
            duration_seconds=frame_count / request.target_fps,
            frame_count=frame_count,
            frame_policy=self.frame_policy,
        )

    def _sampled_tracks(self, request: CompileRequest):
        """Resolve the layers once, so preflight judges what compile encodes."""
        timeline = self.resolve_timeline(request)
        return resolve_motion_scene_tracks(
            request.motion_scene,
            sample_count=timeline.frame_count,
            out_seconds=request.source_last_frame_time,
            width=timeline.width,
            height=timeline.height,
        )

    def preflight(self, request: CompileRequest) -> list[Check]:
        tracks = self._sampled_tracks(request)
        enabled_count = sum(layer.enabled for layer in request.motion_scene.motion_layers)
        timeline = self.resolve_timeline(request)
        return [
            Check(
                id="motion_layers",
                label=f"Enabled motion layers: {enabled_count}",
                state="PASS" if enabled_count else "BLOCKED",
                message="LTX Motion requires at least one enabled motion layer."
                if not enabled_count
                else "",
            ),
            Check(
                id="target_length",
                label=f"LTX target length: {timeline.frame_count} (8n+1)",
                state="PASS",
            ),
            multi_shot_check(
                request.motion_scene,
                display_name="LTX Motion Track",
                can_represent=False,
            ),
            encoding_check(tracks, display_name="LTX Motion Track"),
        ]

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        # A blocked gate has to stop compilation, not just colour the panel.
        if request.motion_scene.is_multi_shot:
            raise ValueError(multi_shot_error(request.motion_scene, "LTX Motion Track"))
        if checks[0].state == "BLOCKED":
            raise ValueError("LTX Motion requires at least one enabled motion layer")

        timeline = self.resolve_timeline(request)
        sampled = self._sampled_tracks(request)

        encoded = visible_prefix_tracks(sampled, width=timeline.width, height=timeline.height)
        if not encoded:
            raise ValueError("LTX Motion has no trajectory visible on its first sample")

        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=request.base_prompt,  # Keep final prompts free of duplicated motion instructions
            tracks_json=tracks_json(encoded),
            checks=tuple(checks),
        )

LTX_MOTION_PROFILE = LtxMotionProfile()
