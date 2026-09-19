"""Pinned WanVideoWrapper ATI trajectory profile."""

from __future__ import annotations

from ..adapters.wan_prompt import build_wan_trajectory_prompt
from ..core.motion_resolution import resolve_motion_scene_tracks
from ..guides.prompt_ir import PromptCompileIR, build_prompt_compile_ir
from ..monitor.result import Check, CompiledMotion, PromptCompilation, ResolvedTimeline, raise_on_blocked
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

    def compile_prompt(self, request: CompileRequest, ir: PromptCompileIR) -> PromptCompilation:
        del request  # every clause comes from ir; base_prompt is ir.base_prompt
        # ATI already unifies object/local/camera trajectory control -- same
        # trajectory-continuation renderer as wan_move/wan_track.
        return PromptCompilation(text=build_wan_trajectory_prompt(ir))

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        # A blocked gate has to stop compilation, not just colour the panel.
        if request.motion_scene.is_multi_shot:
            raise ValueError(multi_shot_error(request.motion_scene, "WanVideoWrapper ATI"))
        if checks[0].state == "BLOCKED":
            raise ValueError("WanVideo ATI requires at least one enabled motion layer")
        # Any other BLOCKED gate stops here too, so a check added to preflight
        # is binding without also having to be enumerated in compile.
        raise_on_blocked(checks)
        timeline = self.resolve_timeline(request)
        sampled = self._sampled_tracks(request)
        encoded = visible_prefix_tracks(sampled, width=timeline.width, height=timeline.height)
        if not encoded:
            raise ValueError("WanVideo ATI has no trajectory visible on its first sample")
        ir = build_prompt_compile_ir(request)
        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=self.compile_prompt(request, ir).text,
            tracks_json=tracks_json(encoded),
            checks=tuple(checks),
        )


WANVIDEO_ATI_PROFILE = WanVideoAtiProfile()

