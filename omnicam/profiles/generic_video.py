"""External / Generic Reference Video: a permissive passthrough profile.

Every other profile encodes one upstream model's exact contract -- a frame
grid, an fps, a socket type -- and blocks the compile when the scene or the
connected media cannot satisfy it. That is correct for a named model: the
compile would fail downstream anyway, so the panel is the only place worth
telling the user before the queue does.

This profile encodes none of that, on purpose. It exists for the destination
OmniCam has no named profile for -- Seedance, Kling, Veo, Runway, a private
API, a model that ships next month -- and hands over the playblast and the
prompt unchanged. It is not a looser version of the strict profiles with the
same checks turned off; it genuinely has no upstream contract to enforce, so
WARNING is the ceiling here rather than a policy choice.
"""

from __future__ import annotations

from ..monitor.result import Check, CompiledMotion, ResolvedTimeline
from .base import CompileRequest
from .shots import MULTI_SHOT_PROMPT, multi_shot_check


class ExternalReferenceVideoProfile:
    id = "external_reference_video"
    display_name = "External / Generic Reference Video"
    semantic = "reference_video"
    frame_policy = "requested_length"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        requested_frames = max(1, round(request.duration_seconds * request.target_fps))
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=request.target_fps,
            duration_seconds=request.duration_seconds,
            frame_count=requested_frames,
            frame_policy=self.frame_policy,
        )

    def preflight(self, request: CompileRequest) -> list[Check]:
        has_video = request.playblast_video is not None
        return [
            Check(
                id="playblast_video",
                label="Connected playblast media",
                state="PASS" if has_video else "WARNING",
                message="" if has_video else (
                    "No playblast is connected yet. reference_video will be empty until "
                    "one is recorded."
                ),
            ),
            # No "downstream_contract" check here: this profile has no
            # ADAPTER_INFO requirements, and capability_gate.capability_check
            # already reports that case as "user managed" rather than
            # duplicating the message under the same check id.
            multi_shot_check(
                request.motion_scene,
                display_name=self.display_name,
                can_represent=True,
            ),
        ]

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        timeline = self.resolve_timeline(request)
        if request.motion_scene.is_multi_shot:
            final_prompt = f"{request.base_prompt}\n\n{MULTI_SHOT_PROMPT}".strip()
        else:
            final_prompt = request.base_prompt
        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=final_prompt,
            reference_video=request.playblast_video,
            checks=tuple(checks),
        )


EXTERNAL_REFERENCE_VIDEO_PROFILE = ExternalReferenceVideoProfile()
