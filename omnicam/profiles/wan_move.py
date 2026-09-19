"""Wan Move native TRACKS profile."""

from __future__ import annotations

import math
from typing import Any

from ..adapters.wan_prompt import build_wan_trajectory_prompt
from ..core.motion_resolution import resolve_motion_scene_tracks
from ..core.motion_sampling import SampledTrack
from ..guides.prompt_ir import PromptCompileIR, build_prompt_compile_ir
from ..monitor.result import Check, CompiledMotion, PromptCompilation, ResolvedTimeline, raise_on_blocked
from .base import CompileRequest
from .shots import multi_shot_check, multi_shot_error


def _native_tracks(
    tracks: list[SampledTrack],
    *,
    width: int,
    height: int,
) -> dict[str, Any]:
    import torch

    frame_count = len(tracks[0].xy)
    path = [
        [[track.xy[frame][0] * width, track.xy[frame][1] * height] for track in tracks]
        for frame in range(frame_count)
    ]
    visibility = [
        [track.visible[frame] for track in tracks]
        for frame in range(frame_count)
    ]
    return {
        "track_path": torch.tensor(path, dtype=torch.float32),
        "track_visibility": torch.tensor(visibility, dtype=torch.bool),
    }


class WanMoveProfile:
    id = "wan_move_native"
    display_name = "Wan Move Native"
    semantic = "screen_tracks"
    frame_policy = "track_length"

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
        timeline = self.resolve_timeline(request)
        return [
            Check(
                id="motion_layers",
                label=f"Enabled motion layers: {enabled_count}",
                state="PASS" if enabled_count else "BLOCKED",
                message="Wan Move requires at least one enabled motion layer."
                if not enabled_count
                else "",
            ),
            Check(
                id="target_length",
                label=f"Native track length: {timeline.frame_count}",
                state="PASS",
            ),
            multi_shot_check(
                request.motion_scene,
                display_name="Wan Move Native",
                can_represent=False,
            ),
        ]

    def compile_prompt(self, request: CompileRequest, ir: PromptCompileIR) -> PromptCompilation:
        del request  # every clause comes from ir; base_prompt is ir.base_prompt
        return PromptCompilation(text=build_wan_trajectory_prompt(ir))

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        # A blocked gate has to stop compilation, not just colour the panel.
        if request.motion_scene.is_multi_shot:
            raise ValueError(multi_shot_error(request.motion_scene, "Wan Move Native"))
        if checks[0].state == "BLOCKED":
            raise ValueError("Wan Move requires at least one enabled motion layer")
        # Any other BLOCKED gate stops here too, so a check added to preflight
        # is binding without also having to be enumerated in compile.
        raise_on_blocked(checks)
        timeline = self.resolve_timeline(request)
        tracks = resolve_motion_scene_tracks(
            request.motion_scene,
            sample_count=timeline.frame_count,
            out_seconds=request.source_last_frame_time,
            width=timeline.width,
            height=timeline.height,
        )
        native = _native_tracks(tracks, width=timeline.width, height=timeline.height)
        ir = build_prompt_compile_ir(request)
        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=self.compile_prompt(request, ir).text,
            native_tracks=native,
            checks=tuple(checks),
        )


WAN_MOVE_PROFILE = WanMoveProfile()
