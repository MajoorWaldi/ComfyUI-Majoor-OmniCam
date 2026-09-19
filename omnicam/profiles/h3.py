"""MiniMax H3 Native and API motion profiles."""

from __future__ import annotations

import math

from ..adapters.h3 import (
    H3_API_MEDIA_LIMITS,
    H3_NATIVE_MEDIA_LIMITS,
    MAX_REFERENCE_INDEX,
    build_h3_prompt,
    h3_native_aligned_length,
)
from ..core.motion_scene import CameraSceneItem, MotionScene
from ..core.video_sampling import inspect_video, resample_video_frames, resampling_indices
from ..guides.health import guide_health_checks
from ..guides.prompt_ir import PromptCompileIR, build_prompt_compile_ir
from ..monitor.result import Check, CompiledMotion, PromptCompilation, ResolvedTimeline, raise_on_blocked
from .base import CompileRequest
from .playblast_freshness import guide_style_mismatch_check, stale_playblast_check
from .shots import MULTI_SHOT_PROMPT, multi_shot_check

#: H3's guide_style default (doc section 12.1's profile-driven defaults table).
#: H3 has no role-matrix concept, so this is a fixed expectation, never resolved
#: from intent the way Seedance's is.
H3_DEFAULT_GUIDE_STYLE = "motion_proxy"

#: MinimaxHailuo03ReferenceNode's own duration contract -- the API rejects a
#: request outside this range after the upload, so it is enforced here first.
H3_API_MIN_OUTPUT_SECONDS = 4.0
H3_API_MAX_OUTPUT_SECONDS = 15.0

#: MiniMaxH3ReferenceToVideo technically accepts 5 + 17n frames up to 3600, but
#: it is trained on roughly this range -- outside it, results degrade rather
#: than fail outright, so this is a WARNING, not a BLOCKED gate.
H3_NATIVE_TRAINED_MIN_FRAMES = 124
H3_NATIVE_TRAINED_MAX_FRAMES = 362


def _playblast_camera(scene: MotionScene) -> CameraSceneItem | None:
    return next(
        (camera for camera in scene.cameras if camera.id == scene.playblast_camera_id),
        None,
    )


def _reference_media_checks(request: CompileRequest, limits: dict) -> list[Check]:
    """Validate the connected playblast against the target's own media contract.

    These limits come from the upstream node, not from OmniCam. Losing them in
    the move to profiles meant a reference the API will reject only failed once
    it had been uploaded.
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
            message="The connected playblast could not be inspected, so its duration and "
                    "frame rate were not checked against the target contract.",
        )]

    duration = metadata.frame_count / metadata.frame_rate if metadata.frame_rate > 0 else 0.0
    problems: list[str] = []
    state = "PASS"

    minimum_fps = limits.get("min_fps")
    maximum_fps = limits.get("max_fps")
    if minimum_fps is not None and maximum_fps is not None and not (
        minimum_fps <= metadata.frame_rate <= maximum_fps
    ):
        problems.append(
            f"frame rate {metadata.frame_rate:.3f} fps is outside the accepted "
            f"{minimum_fps}-{maximum_fps} fps range"
        )
        state = "BLOCKED"

    minimum = limits.get("min_duration_seconds") or limits.get("recommended_min_duration_seconds")
    hard_minimum = "min_duration_seconds" in limits
    if minimum is not None and duration < minimum:
        problems.append(f"reference is {duration:.2f}s, below the {minimum}s minimum")
        state = "BLOCKED" if hard_minimum else ("WARNING" if state == "PASS" else state)

    maximum = limits.get("max_total_duration_seconds") or limits.get(
        "recommended_max_duration_seconds"
    )
    hard_maximum = "max_total_duration_seconds" in limits
    if maximum is not None and duration > maximum:
        problems.append(f"reference is {duration:.2f}s, above the {maximum}s maximum")
        state = "BLOCKED" if hard_maximum else ("WARNING" if state == "PASS" else state)

    return [Check(
        id="reference_media",
        label=f"Reference media: {duration:.2f}s at {metadata.frame_rate:.3f} fps",
        state=state,
        message="; ".join(problems),
    )]


def _reference_frame_count_check(request: CompileRequest, target_frames: int) -> list[Check]:
    """H3 Native's five-frame floor, answered before compiling rather than after.

    The count is not guessed from the duration: it is the exact length
    ``resample_video_frames`` will produce for this clip on the 24 fps clock, so
    the panel and the compiler can never disagree about it.
    """
    if request.playblast_video is None:
        return []
    minimum = int(H3_NATIVE_MEDIA_LIMITS["min_reference_frames"])
    try:
        metadata = inspect_video(request.playblast_video)
        decoded = len(
            resampling_indices(
                metadata.frame_count,
                metadata.frame_rate,
                float(H3_NATIVE_MEDIA_LIMITS["reference_fps"]),
                max_frames=target_frames,
            )
        )
    except Exception:  # noqa: BLE001 - an unreadable reference is already reported above
        return []
    return [Check(
        id="reference_frames",
        label=f"Reference frames after resampling: {decoded}",
        state="PASS" if decoded >= minimum else "BLOCKED",
        message="" if decoded >= minimum else (
            f"MiniMax H3 Native needs at least {minimum} reference frames; this "
            f"playblast resamples to {decoded}. Use a longer playblast."
        ),
    )]


def _resolve_reference_index(request: CompileRequest, *, default: int = 1) -> int:
    return request.guide_reference_index if request.guide_reference_index is not None else default


def _reference_index_check(reference_index: int) -> Check:
    in_range = 1 <= reference_index <= MAX_REFERENCE_INDEX
    return Check(
        id="guide_reference_index",
        label=f"Guide reference index: {reference_index}",
        state="PASS" if in_range else "BLOCKED",
        message="" if in_range else (
            f"H3 documents reference-video slots 1-{MAX_REFERENCE_INDEX}; "
            f"guide_reference_index={reference_index} is out of range."
        ),
    )


def _camera_motion_mapping_check() -> Check:
    return Check(
        id="camera_motion_mapping",
        label="Camera motion control",
        state="PASS",
        mapping_quality="CONDITIONAL",
        message=(
            "H3 has no native camera-extrinsics socket; camera motion is communicated "
            "only through the reference-video guide and prompt."
        ),
    )


def _api_output_duration_check(request: CompileRequest) -> Check:
    duration = request.duration_seconds
    in_range = H3_API_MIN_OUTPUT_SECONDS <= duration <= H3_API_MAX_OUTPUT_SECONDS
    return Check(
        id="output_duration",
        label=f"H3 API output duration: {duration:.2f}s",
        state="PASS" if in_range else "BLOCKED",
        message="" if in_range else (
            f"MiniMax H3 API supports {H3_API_MIN_OUTPUT_SECONDS:g}-{H3_API_MAX_OUTPUT_SECONDS:g}s "
            f"of output; requested duration is {duration:.2f}s."
        ),
    )


def _native_trained_range_check(frame_count: int) -> Check:
    in_range = H3_NATIVE_TRAINED_MIN_FRAMES <= frame_count <= H3_NATIVE_TRAINED_MAX_FRAMES
    return Check(
        id="native_trained_range",
        label=f"H3 Native trained length range: {frame_count} frames",
        state="PASS" if in_range else "WARNING",
        message="" if in_range else (
            f"MiniMax H3 Native is trained on roughly {H3_NATIVE_TRAINED_MIN_FRAMES}-"
            f"{H3_NATIVE_TRAINED_MAX_FRAMES} frames; {frame_count} is outside that range and "
            "may produce less reliable results."
        ),
    )


def _h3_prompt(request: CompileRequest, camera, *, adapter: str, reference_index: int) -> str:
    """The camera fragment, or a neutral one when the edit has cuts.

    Describing one camera's move next to a reference video that cuts between
    several is worse than saying nothing: the two disagree, and the model has
    no way to know which half is accurate.
    """
    if request.motion_scene.is_multi_shot:
        fragment = MULTI_SHOT_PROMPT
    else:
        fragment = build_h3_prompt(camera.track, adapter=adapter, reference_index=reference_index)
    return f"{request.base_prompt}\n\n{fragment}".strip()


class H3NativeProfile:
    id = "h3_native"
    display_name = "MiniMax H3 Native"
    semantic = "reference_video"
    frame_policy = "17n_plus_5_at_24fps"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        requested_frames = max(1, math.ceil(request.duration_seconds * 24.0))
        frame_count = h3_native_aligned_length(requested_frames)
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=24.0,
            duration_seconds=frame_count / 24.0,
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

        timeline = self.resolve_timeline(request)
        freshness = stale_playblast_check(
            request.motion_scene, display_name="MiniMax H3 Native", block=True
        )
        mismatch = guide_style_mismatch_check(
            request.motion_scene, expected=H3_DEFAULT_GUIDE_STYLE, display_name="MiniMax H3 Native", block=False,
        )
        health_checks = (
            guide_health_checks(camera.track, guide_style=H3_DEFAULT_GUIDE_STYLE) if camera is not None else []
        )
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
            Check(
                id="target_length",
                label=f"H3 Native target length: {timeline.frame_count} (17n+5)",
                state="PASS",
            ),
            _native_trained_range_check(timeline.frame_count),
            _reference_index_check(_resolve_reference_index(request)),
            *_reference_media_checks(request, H3_NATIVE_MEDIA_LIMITS),
            *_reference_frame_count_check(request, timeline.frame_count),
            *([freshness] if freshness else []),
            *([mismatch] if mismatch else []),
            *health_checks,
            multi_shot_check(
                request.motion_scene,
                display_name="MiniMax H3 Native",
                can_represent=True,
            ),
            _camera_motion_mapping_check(),
        ]

    def compile_prompt(self, request: CompileRequest, ir: PromptCompileIR) -> PromptCompilation:
        del ir  # the reference video itself carries the exact motion; no IR needed here
        camera = _playblast_camera(request.motion_scene)
        if camera is None or not camera.enabled:
            return PromptCompilation(text=request.base_prompt)
        reference_index = _resolve_reference_index(request)
        text = _h3_prompt(request, camera, adapter="h3_native", reference_index=reference_index)
        return PromptCompilation(text=text)

    def compile(self, request: CompileRequest) -> CompiledMotion:
        checks = self.preflight(request)
        if any(check.state == "BLOCKED" for check in checks):
            # Named causes first, because their wording is the contract these
            # errors are read by; raise_on_blocked then covers every BLOCKED
            # nobody thought to enumerate here.
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

        frames = resample_video_frames(
            request.playblast_video,
            target_fps=24.0,
            max_frames=timeline.frame_count,
        )
        # H3 Native needs at least five reference frames. resolve_timeline only
        # guarantees the *target* is 17n+5; the decoded playblast can still be
        # shorter. Until now the comment claiming this was enforced was the only
        # enforcement there was.
        minimum = int(H3_NATIVE_MEDIA_LIMITS["min_reference_frames"])
        shape = getattr(frames, "shape", None)
        decoded = int(shape[0]) if shape is not None else len(frames)
        if decoded < minimum:
            raise ValueError(
                f"MiniMax H3 Native needs at least {minimum} reference frames; the "
                f"connected playblast decoded to {decoded}."
            )

        return CompiledMotion(
            profile_id=self.id,
            semantic=self.semantic,
            timeline=timeline,
            final_prompt=final_prompt,
            reference_frames=frames,
            checks=tuple(checks),
        )


class H3ApiProfile:
    id = "h3_api"
    display_name = "MiniMax H3 API"
    semantic = "reference_video"
    frame_policy = "api_duration_seconds"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        requested_frames = max(1, math.ceil(request.duration_seconds * request.target_fps))
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=request.target_fps,
            duration_seconds=request.duration_seconds,
            frame_count=requested_frames,
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

        freshness = stale_playblast_check(
            request.motion_scene, display_name="MiniMax H3 API", block=True
        )
        mismatch = guide_style_mismatch_check(
            request.motion_scene, expected=H3_DEFAULT_GUIDE_STYLE, display_name="MiniMax H3 API", block=False,
        )
        health_checks = (
            guide_health_checks(camera.track, guide_style=H3_DEFAULT_GUIDE_STYLE) if camera is not None else []
        )
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
            Check(
                id="api_transport",
                label="H3 API media transport",
                state="PASS",
                message="Video transport required for API",
            ),
            _reference_index_check(_resolve_reference_index(request)),
            *_reference_media_checks(request, H3_API_MEDIA_LIMITS),
            _api_output_duration_check(request),
            *([freshness] if freshness else []),
            *([mismatch] if mismatch else []),
            *health_checks,
            multi_shot_check(
                request.motion_scene,
                display_name="MiniMax H3 API",
                can_represent=True,
            ),
            _camera_motion_mapping_check(),
        ]

    def compile_prompt(self, request: CompileRequest, ir: PromptCompileIR) -> PromptCompilation:
        del ir  # the reference video itself carries the exact motion; no IR needed here
        camera = _playblast_camera(request.motion_scene)
        if camera is None or not camera.enabled:
            return PromptCompilation(text=request.base_prompt)
        reference_index = _resolve_reference_index(request)
        text = _h3_prompt(request, camera, adapter="comfy_api", reference_index=reference_index)
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
            # The API rejects an out-of-range frame rate or duration itself, and
            # does so only after the upload. Refusing here is the same contract,
            # enforced before the round trip.
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


H3_NATIVE_PROFILE = H3NativeProfile()
H3_API_PROFILE = H3ApiProfile()

