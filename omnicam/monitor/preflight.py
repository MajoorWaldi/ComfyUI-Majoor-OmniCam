"""Can this track actually be queued into this adapter, right now?

This is the Monitor's real job. The previous version checked that a track
existed, that a proxy was present and that the dimensions were in range, then
said READY -- so an H3 queue could still fail inside
``MinimaxHailuo03ReferenceNode``, which validates its reference video at
23.976-60 FPS, 2s minimum and 15s total. A preflight that says READY and then
lets the queue fail is worse than no preflight, so every rule checked here is
read from the upstream node, and everything that is only an OmniCam opinion is
reported as risk instead.
"""

from __future__ import annotations

from typing import Any

from ..adapters.h3 import H3_API_MEDIA_LIMITS, H3_NATIVE_MEDIA_LIMITS
from ..adapters.ltx_tracks import is_ltx_frame_count, ltx_frame_count
from ..core.track import OmniCamTrack
from .adapter_registry import adapter_info
from .health import build_camera_health
from .prompts import prompt_contract
from .types import MonitorPreflight

_TWO_GIB = 2 * 1024**3
_DISTRIBUTIONS = {"balanced", "subject_focus", "ground_parallax"}


def _capability(capabilities: dict[str, Any], adapter: str) -> dict[str, Any]:
    return next(
        (item for item in capabilities.get("capabilities", []) if item.get("adapter") == adapter),
        {"state": "missing"},
    )


def normalize_proxy(proxy: Any, proxy_available: bool = False) -> dict[str, Any]:
    """Accept either the legacy boolean or a media-facts object.

    ``proxy_available`` used to be the whole story, and the frontend derived it
    from the Director's ``recording_path`` -- so a perfectly valid VIDEO node
    wired straight into ``proxy_video`` reported "no proxy". The facts object
    carries what the queue will actually be judged on.
    """
    if isinstance(proxy, dict):
        facts = dict(proxy)
        facts["available"] = bool(facts.get("available", proxy_available))
        return facts
    return {"available": bool(proxy if proxy is not None else proxy_available)}


def _float(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if number > 0 else None


def build_adapter_preflight(
    *, adapter: str, track: OmniCamTrack, proxy_available: bool = False, width: int,
    height: int, length: int, point_count: int, distribution: str,
    capabilities: dict[str, Any], proxy: Any = None, prompt_length: int = 0,
) -> MonitorPreflight:
    info = adapter_info(adapter)
    capability = _capability(capabilities, adapter)
    capability_state = str(capability.get("state") or "missing")
    contract = prompt_contract(adapter, capabilities)
    media = normalize_proxy(proxy, proxy_available)
    checks: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []

    def check(check_id: str, label: str, passed: bool, *, warning: bool = False, message: str = "") -> None:
        failing = not passed or warning
        state = "WARNING" if warning else ("PASS" if passed else "BLOCKED")
        # A passing check carries no failure text: showing the reason it *would*
        # have failed next to a green tick is how a panel stops being read.
        checks.append({"id": check_id, "label": label, "state": state, "message": message if failing else ""})
        if failing:
            issues.append({
                "id": check_id,
                "severity": "warning" if warning else "error",
                "message": message or label,
            })

    def note(check_id: str, label: str, message: str = "", state: str = "PASS") -> None:
        checks.append({"id": check_id, "label": label, "state": state, "message": message})

    check("track", "Canonical camera track", track.duration_frames > 0 and bool(track.keyframes))
    if info["requires_proxy"]:
        check(
            "proxy", f"Reference {info['proxy_kind']} connected", bool(media.get("available")),
            message=f"This adapter needs a {info['proxy_kind']} on proxy_video.",
        )
    if adapter not in {"h3", "h3_native"}:
        check("dimensions", "Adapter dimensions", 64 <= int(width) <= 4096 and 64 <= int(height) <= 4096)

    if adapter in {"h3", "h3_native"}:
        _h3_checks(adapter, check, note, media=media, contract=contract, length=length, prompt_length=prompt_length)
    if adapter == "wan_native":
        check("length_4n_plus_1", "Length is 4n+1", int(length) > 0 and (int(length) - 1) % 4 == 0)
    if adapter in {"wan_ati", "wan_tracks_native", "ltx_motion_track"}:
        check("point_count", "Trajectory point count", 4 <= int(point_count) <= 128)
        check("distribution", "Trajectory distribution", distribution in _DISTRIBUTIONS)
    if adapter == "ltx_motion_track":
        _ltx_track_checks(check, note, length=length)
    if adapter == "ltx":
        estimate = max(0, int(length)) * max(0, int(width)) * max(0, int(height)) * 3 * 4
        check(
            "ltx_memory", "Decoded guide memory plan", 0 < estimate <= _TWO_GIB,
            message="LTX guide would exceed the 2 GiB safety limit.",
        )
        check(
            "ltx_legacy", "Legacy proxy-guide path", True, warning=True,
            message="This path feeds sampled proxy frames, not the authored camera. Prefer LTX 2.5 Motion Track.",
        )

    if capability_state == "detected_unverified":
        check(
            "capability", "Downstream adapter contract", True, warning=True,
            message="Adapter detected but its socket contract is unverified.",
        )
    else:
        check(
            "capability", "Downstream adapter contract", capability_state == "verified",
            message=f"Adapter contract is {capability_state}.",
        )

    health = build_camera_health(track, adapter)
    if health.state == "BLOCKED":
        check("track_validity", "Track validity", False, message="The camera track contains non-finite values.")
    elif health.state == "WARNING":
        check(
            "track_validity", "Track validity", True, warning=True,
            message="The subject leaves frame on part of this track.",
        )
    # Reported, never counted. Motion risk is an OmniCam estimate graded against
    # limit tables no upstream project publishes, so letting it flip a READY to
    # a WARNING would recreate, in the other direction, the false verdicts this
    # preflight exists to eliminate.
    note(
        "motion_risk", f"Motion risk: {health.risk}",
        f"Experimental estimate ({', '.join(health.risk_reasons) or 'within the authoring envelope'}); "
        "not a published model limit.",
        state="RISK",
    )

    if any(item["severity"] == "error" for item in issues):
        state = "BLOCKED"
    elif issues:
        state = "WARNING"
    else:
        state = "READY"
    return MonitorPreflight(state, adapter, capability_state, checks, issues, risk=health.risk)


def _h3_checks(adapter, check, note, *, media, contract, length, prompt_length) -> None:
    """Everything MinimaxHailuo03ReferenceNode / MiniMaxH3ReferenceToVideo enforce."""
    from ..adapters.h3 import h3_native_aligned_length
    limits = H3_NATIVE_MEDIA_LIMITS if adapter == "h3_native" else H3_API_MEDIA_LIMITS
    token = contract.get("reference_token")
    note("dialect", f"Prompt dialect: {token}", f"{contract.get('dialect_display') or ''}".strip())

    duration = _float(media.get("duration_seconds"))
    fps = _float(media.get("fps"))
    frame_count = media.get("frame_count")

    if adapter == "h3":
        if fps is None:
            check(
                "reference_fps", "Reference FPS", True, warning=True,
                message="Reference frame rate unknown; the node requires 23.976-60 FPS.",
            )
        else:
            check(
                "reference_fps", f"Reference FPS {fps:.3f}",
                limits["min_fps"] <= fps <= limits["max_fps"],
                message=f"Reference video is {fps:.2f} FPS. Supported range is 23.976-60 FPS.",
            )
        if duration is None:
            check(
                "reference_duration", "Reference duration", True, warning=True,
                message="Reference duration unknown; the node requires 2-15 seconds.",
            )
        else:
            check(
                "reference_duration", f"Reference duration {duration:.2f}s",
                limits["min_duration_seconds"] <= duration <= limits["max_total_duration_seconds"],
                message=(
                    f"Reference video is {duration:.1f}s. The node requires "
                    f"{limits['min_duration_seconds']:.0f}-{limits['max_total_duration_seconds']:.0f} seconds."
                ),
            )
    elif adapter == "h3_native":
        if frame_count is not None:
            check(
                "reference_frames", f"Reference frames: {int(frame_count)}",
                int(frame_count) >= limits["min_reference_frames"],
                message=f"Reference has {int(frame_count)} frames. Native node requires at least {limits['min_reference_frames']}.",
            )
        if duration is not None:
            if duration < limits["recommended_min_duration_seconds"]:
                check(
                    "reference_duration", f"Reference duration {duration:.2f}s", True, warning=True,
                    message=f"Reference is {duration:.1f}s. Recommended minimum is {limits['recommended_min_duration_seconds']:.0f}s.",
                )
            elif duration > limits["recommended_max_duration_seconds"]:
                check(
                    "reference_duration", f"Reference duration {duration:.2f}s", True, warning=True,
                    message=f"Reference is {duration:.1f}s. Recommended maximum is {limits['recommended_max_duration_seconds']:.0f}s.",
                )

    budget = contract.get("max_prompt_characters")
    if budget:
        check(
            "prompt_budget", f"Prompt {int(prompt_length)} / {int(budget)} chars",
            int(prompt_length) <= int(budget),
            message=f"The prompt exceeds this profile's {int(budget)}-character budget.",
        )

    if adapter == "h3_native":
        base, step = limits["length_base"], limits["length_step"]
        valid = int(length) >= base and (int(length) - base) % step == 0
        nearest = h3_native_aligned_length(int(length))
        if not valid:
            check(
                "length_17n_plus_5", f"Length is not {step}n+{base}", True, warning=True,
                message=(
                    f"Requested {int(length)}; MiniMax H3 resolves to {nearest} frames."
                ),
            )


def _ltx_track_checks(check, note, *, length) -> None:
    """LTX truncates a guide to ((N-1)//8)*8+1, silently. Say so before the queue."""
    requested = max(1, int(length))
    kept = ltx_frame_count(requested)
    if is_ltx_frame_count(requested):
        note("ltx_frame_grid", f"Frame count {requested} = 8n+1")
    else:
        check(
            "ltx_frame_grid", f"Frame count {requested} is not 8n+1", True, warning=True,
            message=f"LTX will keep {kept} frames and drop the last {requested - kept}.",
        )
