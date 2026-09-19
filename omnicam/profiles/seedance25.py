"""ByteDance Seedance 2.5 Reference motion profile.

Prepares the OmniCam guide (as ``reference_video``, unchanged -- Seedance
decodes references itself, so this profile never resamples frames the way H3
Native does) and a role-first prompt for ComfyUI's official
``ByteDance2ReferenceNodeV2``. This profile does not call the ByteDance API.
"""

from __future__ import annotations

import math

from ..adapters.seedance25 import (
    DEFAULT_TASK_TYPE,
    MAX_REFERENCE_INDEX,
    SEEDANCE25_MEDIA_LIMITS,
    build_seedance25_prompt,
    reference_token,
    resolve_seedance25_guide_style,
)
from ..core.motion_scene import CameraSceneItem, MotionScene
from ..core.video_sampling import inspect_video
from ..guides.conflicts import detect_role_conflicts
from ..guides.health import guide_health_checks
from ..guides.model import ReferenceSpec, ShotIntent, omnicam_guide_reference, parse_reference_plan
from ..guides.prompt_ir import PromptCompileIR, build_prompt_compile_ir
from ..monitor.result import Check, CompiledMotion, PromptCompilation, ResolvedTimeline, raise_on_blocked
from .base import CompileRequest
from .playblast_freshness import captured_guide_style, guide_style_mismatch_check, stale_playblast_check
from .shots import MULTI_SHOT_PROMPT, multi_shot_check

DISPLAY_NAME = "ByteDance Seedance 2.5 Reference"

#: What each guide_style is understood to carry, for the OmniCam guide's own
#: ReferenceSpec (doc 12.4's camera-only vs clay/blocking examples, plus the
#: beauty_reference role from doc 18.1).
_GUIDE_STYLE_ROLES: dict[str, tuple[str, ...]] = {
    "motion_proxy": ("camera_motion", "camera_framing", "camera_pacing", "composition"),
    "clay": (
        "camera_motion", "camera_framing", "camera_pacing", "composition",
        "spatial_layout", "blocking", "subject_trajectory",
    ),
    "beauty_reference": ("materials", "lighting", "color", "atmosphere"),
}


def _guide_reference_spec(reference_index: int, guide_style: str) -> ReferenceSpec:
    roles = _GUIDE_STYLE_ROLES.get(guide_style, _GUIDE_STYLE_ROLES["motion_proxy"])
    return omnicam_guide_reference(slot_hint=reference_index, roles=roles)


def _resolve_shot_intent(request: CompileRequest) -> ShotIntent:
    """What the shot means to preserve, from what the Director actually captured.

    No Reference Role Matrix yet (P2) -- the Guide Capture Style the artist
    recorded with is itself the best available signal of intent.
    """
    captured = captured_guide_style(request.motion_scene)
    if captured == "clay":
        return ShotIntent(
            preserve=("camera_motion", "camera_framing", "camera_pacing", "spatial_layout", "blocking"),
        )
    if captured == "beauty_reference":
        return ShotIntent(
            preserve=("camera_motion", "camera_framing", "camera_pacing", "final_appearance"),
        )
    # motion_proxy, passthrough, diagnostic, depth_rich, or nothing captured yet.
    return ShotIntent(preserve=("camera_motion", "camera_framing", "camera_pacing"))


def _resolve_guide_style(request: CompileRequest) -> str:
    """The Monitor-forced value, or the one resolved from what was captured."""
    requested = request.guide_style or "auto"
    if requested != "auto":
        return requested
    return resolve_seedance25_guide_style(_resolve_shot_intent(request))


def _playblast_camera(scene: MotionScene) -> CameraSceneItem | None:
    return next(
        (camera for camera in scene.cameras if camera.id == scene.playblast_camera_id),
        None,
    )


def _resolve_reference_index(request: CompileRequest, *, default: int = 1) -> int:
    return request.guide_reference_index if request.guide_reference_index is not None else default


def _reference_index_check(reference_index: int) -> Check:
    in_range = 1 <= reference_index <= MAX_REFERENCE_INDEX
    return Check(
        id="guide_reference_index",
        label=f"Guide reference index: {reference_index}",
        state="PASS" if in_range else "BLOCKED",
        message="" if in_range else (
            f"Seedance 2.5 accepts up to {MAX_REFERENCE_INDEX} reference videos; "
            f"guide_reference_index={reference_index} is out of range."
        ),
    )


def _guide_video_check(request: CompileRequest) -> list[Check]:
    """The single guide's own duration, checked against Seedance's 1.8s floor.

    OmniCam only owns this one reference; other references the destination
    node may carry are connected downstream and outside what this compile can
    see, so the 30.1s *total* budget is reported informational only (doc
    section 12.8's closing paragraph), not enforced here.
    """
    if request.playblast_video is None:
        return []
    try:
        metadata = inspect_video(request.playblast_video)
    except Exception:  # noqa: BLE001 - an unreadable reference is reported, not raised
        return [Check(
            id="reference_media",
            label="Reference media",
            state="WARNING",
            message="The connected playblast could not be inspected, so its duration "
                    "was not checked against Seedance's minimum.",
        )]
    duration = metadata.frame_count / metadata.frame_rate if metadata.frame_rate > 0 else 0.0
    minimum = SEEDANCE25_MEDIA_LIMITS["min_reference_video_seconds"]
    if duration < minimum:
        return [Check(
            id="reference_media",
            label=f"Reference media: {duration:.2f}s",
            state="BLOCKED",
            message=f"reference is {duration:.2f}s, below the {minimum}s minimum Seedance 2.5 requires "
                     "for a direct reference video.",
        )]
    return [Check(
        id="reference_media",
        label=f"Reference media: {duration:.2f}s",
        state="PASS",
    )]


def _reference_budget_check() -> Check:
    limits = SEEDANCE25_MEDIA_LIMITS
    return Check(
        id="reference_media_budget",
        label="Reference-video budget",
        state="PASS",
        message=(
            f"OmniCam validates only its own guide video against Seedance 2.5's "
            f"{limits['min_reference_video_seconds']}s minimum. The official "
            f"ByteDance2ReferenceNodeV2 remains authoritative for the combined "
            f"{limits['max_total_reference_video_seconds']}s total across every "
            f"reference video connected downstream."
        ),
    )


def _camera_motion_mapping_check() -> Check:
    return Check(
        id="camera_motion_mapping",
        label="Camera motion control",
        state="PASS",
        mapping_quality="CONDITIONAL",
        message=(
            "Seedance 2.5 has no native camera-extrinsics socket; camera motion is "
            "communicated only through the reference-video guide and prompt."
        ),
    )


def _task_type_check() -> Check:
    return Check(
        id="task_type",
        label=f"Seedance task_type: {DEFAULT_TASK_TYPE}",
        state="PASS",
        message="OmniCam always compiles a new shot from references, never an edit or extend.",
    )


def _parse_reference_plan(request: CompileRequest) -> tuple[tuple[ReferenceSpec, ...], Check | None]:
    """The declared references, or a BLOCKED Check if the plan does not parse.

    An empty plan is not an error -- P2 is opt-in, and every profile compiles
    exactly as it did before this widget existed when nothing is declared.
    """
    try:
        return parse_reference_plan(request.reference_plan_json), None
    except ValueError as error:
        return (), Check(id="reference_plan", label="Reference plan", state="BLOCKED", message=str(error))


def _reference_role_diff_checks(declared: tuple[ReferenceSpec, ...]) -> list[Check]:
    """One Compilation Diff entry per declared reference (doc section 13).

    Reuses the existing Check/mapping_quality machinery rather than a new
    data type: the authored control is the reference's declared role, the
    emitted representation is which prompt slot it compiled to.
    """
    return [
        Check(
            id=f"reference_role:{spec.id}",
            label=f"{spec.id} -> {', '.join(spec.roles) or 'no roles declared'}",
            state="PASS",
            mapping_quality="CONDITIONAL",
            message=(
                f"Compiled as {reference_token(spec)} in the prompt"
                + (f"; ignored: {', '.join(spec.ignore)}." if spec.ignore else ".")
            ),
        )
        for spec in declared
    ]


def _seedance25_prompt(
    request: CompileRequest,
    camera,
    *,
    reference_index: int,
    other_references: tuple[ReferenceSpec, ...] = (),
    ir: PromptCompileIR | None = None,
) -> str:
    if request.motion_scene.is_multi_shot:
        fragment = MULTI_SHOT_PROMPT
    else:
        fragment = build_seedance25_prompt(
            camera.track, reference_index=reference_index, guide_style=_resolve_guide_style(request),
            other_references=other_references, ir=ir,
        )
    return f"{request.base_prompt}\n\n{fragment}".strip()


class Seedance25ReferenceProfile:
    id = "seedance25_reference"
    display_name = DISPLAY_NAME
    semantic = "reference_video"
    frame_policy = "seedance25_duration_seconds"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        limits = SEEDANCE25_MEDIA_LIMITS
        duration = min(
            max(request.duration_seconds, limits["min_output_duration_seconds"]),
            limits["max_output_duration_seconds"],
        )
        frame_count = max(1, math.ceil(duration * request.target_fps))
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=request.target_fps,
            duration_seconds=duration,
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

        limits = SEEDANCE25_MEDIA_LIMITS
        duration_state = "PASS"
        duration_message = ""
        if not (limits["min_output_duration_seconds"] <= request.duration_seconds <= limits["max_output_duration_seconds"]):
            duration_state = "WARNING"
            duration_message = (
                f"Requested duration {request.duration_seconds:.2f}s is outside Seedance 2.5's "
                f"{limits['min_output_duration_seconds']}-{limits['max_output_duration_seconds']}s "
                "output range; it was clamped when resolving the timeline."
            )

        freshness = stale_playblast_check(
            request.motion_scene, display_name=DISPLAY_NAME, block=True
        )
        guide_style = _resolve_guide_style(request)
        mismatch = guide_style_mismatch_check(
            request.motion_scene, expected=guide_style, display_name=DISPLAY_NAME, block=False,
        )

        declared, plan_error = _parse_reference_plan(request)
        guide_spec = _guide_reference_spec(_resolve_reference_index(request), guide_style)
        conflict_checks = detect_role_conflicts((guide_spec, *declared))
        health_checks = guide_health_checks(camera.track, guide_style=guide_style) if camera is not None else []

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
            _reference_index_check(_resolve_reference_index(request)),
            *_guide_video_check(request),
            _reference_budget_check(),
            Check(
                id="output_duration",
                label=f"Output duration: {request.duration_seconds:.2f}s",
                state=duration_state,
                message=duration_message,
            ),
            _task_type_check(),
            *([freshness] if freshness else []),
            *([mismatch] if mismatch else []),
            *([plan_error] if plan_error else []),
            *conflict_checks,
            *health_checks,
            *_reference_role_diff_checks(declared),
            multi_shot_check(request.motion_scene, display_name=DISPLAY_NAME, can_represent=True),
            _camera_motion_mapping_check(),
        ]

    def compile_prompt(self, request: CompileRequest, ir: PromptCompileIR) -> PromptCompilation:
        camera = _playblast_camera(request.motion_scene)
        if camera is None or not camera.enabled:
            return PromptCompilation(text=request.base_prompt)
        reference_index = _resolve_reference_index(request)
        declared, _plan_error = _parse_reference_plan(request)
        text = _seedance25_prompt(
            request, camera, reference_index=reference_index, other_references=declared, ir=ir,
        )
        return PromptCompilation(text=text)

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
            raise_on_blocked(checks)

        camera = _playblast_camera(request.motion_scene)
        if camera is None:  # preflight models this; an assert vanishes under -O
            raise ValueError("MotionScene has no usable playblast camera")

        timeline = self.resolve_timeline(request)
        ir = build_prompt_compile_ir(request)
        final_prompt = self.compile_prompt(request, ir).text

        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=final_prompt,
            reference_video=request.playblast_video,
            checks=tuple(checks),
        )


SEEDANCE25_REFERENCE_PROFILE = Seedance25ReferenceProfile()

__all__ = ["SEEDANCE25_REFERENCE_PROFILE", "Seedance25ReferenceProfile"]
