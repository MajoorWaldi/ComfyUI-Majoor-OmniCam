"""MiniMax H3 Native and API motion profiles."""

from __future__ import annotations

import math

from ..adapters.h3 import (
    H3_API_MEDIA_LIMITS,
    H3_NATIVE_MEDIA_LIMITS,
    build_h3_prompt,
    h3_native_aligned_length,
)
from ..core.motion_scene import CameraSceneItem, MotionScene
from ..core.video_sampling import inspect_video, resample_video_frames, resampling_indices
from ..monitor.result import Check, CompiledMotion, ResolvedTimeline, raise_on_blocked
from .base import CompileRequest
from .shots import MULTI_SHOT_PROMPT, multi_shot_check


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


def _h3_prompt(request: CompileRequest, camera, *, adapter: str) -> str:
    """The camera fragment, or a neutral one when the edit has cuts.

    Describing one camera's move next to a reference video that cuts between
    several is worse than saying nothing: the two disagree, and the model has
    no way to know which half is accurate.
    """
    if request.motion_scene.is_multi_shot:
        fragment = MULTI_SHOT_PROMPT
    else:
        fragment = build_h3_prompt(camera.track, adapter=adapter)
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
            *_reference_media_checks(request, H3_NATIVE_MEDIA_LIMITS),
            *_reference_frame_count_check(request, timeline.frame_count),
            multi_shot_check(
                request.motion_scene,
                display_name="MiniMax H3 Native",
                can_represent=True,
            ),
        ]

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
        final_prompt = _h3_prompt(request, camera, adapter="h3_native")

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
            *_reference_media_checks(request, H3_API_MEDIA_LIMITS),
            multi_shot_check(
                request.motion_scene,
                display_name="MiniMax H3 API",
                can_represent=True,
            ),
        ]

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
        final_prompt = _h3_prompt(request, camera, adapter="comfy_api")

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

