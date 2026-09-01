"""Pinned WanVideoWrapper ATI trajectory profile."""

from __future__ import annotations

from ..core.motion_resolution import resolve_motion_scene_tracks
from ..monitor.result import Check, CompiledMotion, ResolvedTimeline
from .base import CompileRequest
from .shots import multi_shot_check, multi_shot_error
from .track_json import encoding_check, tracks_json, visible_prefix_tracks

ATI_LENGTH = 121


class WanVideoAtiProfile:
    id = "wanvideo_ati"
    display_name = "WanVideoWrapper ATI"
    semantic = "screen_tracks"
    frame_policy = "fixed_121"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=request.target_fps,
            duration_seconds=request.duration_seconds,
            frame_count=ATI_LENGTH,
            frame_policy=self.frame_policy,
        )

    def _sampled_tracks(self, request: CompileRequest):
        """Resolve the layers once, so preflight judges what compile encodes."""
        timeline = self.resolve_timeline(request)
        return resolve_motion_scene_tracks(
            request.motion_scene,
            sample_count=ATI_LENGTH,
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
                message="WanVideo ATI requires at least one enabled motion layer."
                if not enabled_count
                else "",
            ),
            Check(
                id="fixed_grid",
                label="WanVideo ATI grid: exactly 121 samples",
                state="PASS",
            ),
            multi_shot_check(
                request.motion_scene,
                display_name="WanVideoWrapper ATI",
                can_represent=False,
            ),
            encoding_check(tracks, display_name="WanVideoWrapper ATI"),
        ]

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        # A blocked gate has to stop compilation, not just colour the panel.
        if request.motion_scene.is_multi_shot:
            raise ValueError(multi_shot_error(request.motion_scene, "WanVideoWrapper ATI"))
        if checks[0].state == "BLOCKED":
            raise ValueError("WanVideo ATI requires at least one enabled motion layer")
        timeline = self.resolve_timeline(request)
        sampled = self._sampled_tracks(request)
        encoded = visible_prefix_tracks(sampled, width=timeline.width, height=timeline.height)
        if not encoded:
            raise ValueError("WanVideo ATI has no trajectory visible on its first sample")
        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=request.base_prompt,
            tracks_json=tracks_json(encoded),
            checks=tuple(checks),
        )


WANVIDEO_ATI_PROFILE = WanVideoAtiProfile()

