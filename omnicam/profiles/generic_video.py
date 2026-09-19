"""External / Generic Reference Video: a permissive passthrough profile.

Every other profile encodes one upstream model's exact contract -- a frame
grid, an fps, a socket type -- and blocks the compile when the scene or the
connected media cannot satisfy it. That is correct for a named model: the
compile would fail downstream anyway, so the panel is the only place worth
telling the user before the queue does.

This profile encodes none of that, on purpose. It exists for the destination
OmniCam has no named profile for -- Seedance, Kling, Veo, Runway, a private
API, a model that ships next month -- and hands over the playblast and the
prompt byte-for-byte unchanged, multi-shot included. It is not a looser
version of the strict profiles with the same checks turned off; it genuinely
has no upstream contract to enforce, so WARNING is the ceiling here rather
than a policy choice.

In particular it does NOT append the multi-shot camera-work instruction the
H3 profiles use ("follow its camera motion... do not copy its appearance").
That sentence is a semantic decision about how a specific model reads a
reference video, and for an unknown destination it can be the exact opposite
of what the user wants -- an appearance-transfer or V2V node, say. The cut
timing is already carried by the playblast itself; the prompt stays the
user's.
"""

from __future__ import annotations

from ..guides.prompt_ir import PromptCompileIR, build_prompt_compile_ir
from ..monitor.result import Check, CompiledMotion, PromptCompilation, ResolvedTimeline
from .base import CompileRequest
from .playblast_freshness import guide_style_mismatch_check, stale_playblast_check
from .shots import multi_shot_check

#: doc section 12.1's profile-driven defaults table: external destinations
#: default to a straight passthrough of whatever was recorded.
EXTERNAL_DEFAULT_GUIDE_STYLE = "passthrough"


def _enhanced_prompt(ir: PromptCompileIR) -> str:
    """A light, model-neutral enhancement -- opt-in only via ``prompt_mode``.

    Appends only what the IR actually knows (an authored action, a camera
    phrase) as plain prose. No reference tokens, no model-specific wording --
    the destination is genuinely unknown, so this never guesses at a dialect.
    """
    scene = ir.base_prompt.strip()
    clauses: list[str] = []
    if ir.action_cues:
        clauses.append("; ".join(cue.text for cue in ir.action_cues).rstrip("."))
    if ir.camera_phases:
        phrases = [phase.phrase for phase in ir.camera_phases]
        joined = phrases[0] if len(phrases) == 1 else ", then ".join(phrases)
        clauses.append(f"The camera {joined}".rstrip("."))
    if not clauses:
        return ir.base_prompt
    addition = ". ".join(clauses) + "."
    return f"{scene}\n\n{addition}".strip() if scene else addition


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
        # Advisory only: this profile has no upstream contract to enforce, and
        # the destination could well be an appearance-transfer node that wants
        # exactly the "wrong" reference. WARNING is the ceiling here.
        freshness = stale_playblast_check(
            request.motion_scene, display_name=self.display_name, block=False
        )
        mismatch = guide_style_mismatch_check(
            request.motion_scene, expected=EXTERNAL_DEFAULT_GUIDE_STYLE, display_name=self.display_name, block=False,
        )
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
            *([freshness] if freshness else []),
            *([mismatch] if mismatch else []),
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

    def compile_prompt(self, request: CompileRequest, ir: PromptCompileIR) -> PromptCompilation:
        if request.prompt_mode == "enhanced":
            return PromptCompilation(text=_enhanced_prompt(ir))
        return PromptCompilation(text=request.base_prompt)

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        timeline = self.resolve_timeline(request)
        ir = build_prompt_compile_ir(request)
        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=self.compile_prompt(request, ir).text,
            reference_video=request.playblast_video,
            checks=tuple(checks),
        )


EXTERNAL_REFERENCE_VIDEO_PROFILE = ExternalReferenceVideoProfile()
