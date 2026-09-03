"""The Monitor's live preflight: a preview of what compiling the selected
profile against a Director's *current, unexecuted* state would report --
computed without queuing a prompt.

Deliberately separate from :class:`MajoorOmniCamMonitor`. A live preflight
runs on every keystroke behind a debounce, so it must never publish over the
execution socket (there is no running node to publish as), and a
mid-edit scene that momentarily fails validation is exactly what the panel
exists to report -- not something that should 500 the route.

Only a Director can be answered live: it is the only upstream that keeps its
state in widgets (``state_json``, ``recording_path``) a route can read without
ComfyUI having executed anything. The frontend is responsible for deciding
whether the connected upstream is one before calling this at all; see
``web-src/monitor/refresh.js``.
"""

from __future__ import annotations

from typing import Any

from ..capabilities import detect_capabilities
from ..core.director_compile import compile_director_motion_scene, parse_director_state
from ..monitor.result import panel_payload
from ..profiles.base import CompileRequest
from ..profiles.capability_gate import capability_check
from ..profiles.catalog import PROFILE_REGISTRY
from .base import resolve_video

#: Generous relative to any real Director edit; large enough that a real
#: scene never trips it, small enough that a malicious body cannot use this
#: route to make the server parse an unbounded JSON string on every keystroke.
MAX_STATE_JSON_CHARS = 2_000_000


class LivePreflightError(ValueError):
    """A live preflight request could not be answered. Reported as 400, not 500."""


def _numeric(payload: dict[str, Any], key: str, default: float, *, cast):
    try:
        return cast(payload.get(key, default))
    except (TypeError, ValueError) as exc:
        raise LivePreflightError(f"Invalid numeric value for {key!r}") from exc


def build_live_preflight(payload: dict[str, Any]) -> dict[str, Any]:
    """The same panel shape ``MajoorOmniCamMonitor.execute()`` publishes, live.

    ``payload`` is ``{"director": {...}, "monitor": {...}}``: the Director's
    queue widgets (``state_json``, ``recording_path``, ``card_asset``,
    ``width``, ``height``, ``fps``, ``duration_seconds``, ``render_mode``) and
    the Monitor's own settings (``target_profile``, ``base_prompt``,
    ``target_width``, ``target_height``, ``duration_seconds``, ``target_fps``).
    """
    director = payload.get("director")
    monitor = payload.get("monitor")
    if not isinstance(director, dict) or not isinstance(monitor, dict):
        raise LivePreflightError("Expected 'director' and 'monitor' objects")

    state_json = str(director.get("state_json", "") or "")
    if len(state_json) > MAX_STATE_JSON_CHARS:
        raise LivePreflightError("state_json is too large")

    try:
        raw_state = parse_director_state(state_json)
    except ValueError as exc:
        raise LivePreflightError(str(exc)) from exc

    try:
        scene, active_recording_path = compile_director_motion_scene(
            raw_state,
            width=_numeric(director, "width", 1280, cast=int),
            height=_numeric(director, "height", 720, cast=int),
            fps=_numeric(director, "fps", 24, cast=int),
            duration_seconds=_numeric(director, "duration_seconds", 5.0, cast=float),
            render_mode=str(director.get("render_mode", "omni_ref")),
            card_asset=str(director.get("card_asset", "")),
            recording_path=str(director.get("recording_path", "")),
        )
    except LivePreflightError:
        raise
    except (TypeError, ValueError) as exc:
        # Covers ValidationError (a ValueError) from a scene that does not
        # validate yet -- an edit in progress, not a route failure.
        raise LivePreflightError(f"Invalid Director state: {exc}") from exc

    playblast_video = resolve_video(active_recording_path)

    target_profile = str(monitor.get("target_profile", ""))
    try:
        profile = PROFILE_REGISTRY.require(target_profile)
    except KeyError as exc:
        raise LivePreflightError(str(exc)) from exc

    # 0 (or absent) means "inherit the connected shot", exactly as
    # MajoorOmniCamMonitor.execute() does -- the live panel must preview the
    # same request the queued run would build.
    mon_duration = _numeric(monitor, "duration_seconds", 0.0, cast=float)
    mon_fps = _numeric(monitor, "target_fps", 0.0, cast=float)
    if mon_duration <= 0:
        mon_duration = scene.timeline.duration_seconds
    if mon_fps <= 0:
        mon_fps = scene.timeline.authoring_fps

    try:
        request = CompileRequest(
            motion_scene=scene,
            playblast_video=playblast_video,
            base_prompt=str(monitor.get("base_prompt", "") or ""),
            target_width=_numeric(monitor, "target_width", 832, cast=int),
            target_height=_numeric(monitor, "target_height", 480, cast=int),
            duration_seconds=mon_duration,
            target_fps=mon_fps,
        )
    except LivePreflightError:
        raise
    except (TypeError, ValueError) as exc:
        raise LivePreflightError(f"Invalid Monitor settings: {exc}") from exc

    # Detected before compiling, exactly like the real execute(): a downstream
    # that cannot receive this output is a preflight failure to show, not a
    # surprise the moment the user actually presses Run.
    capabilities = detect_capabilities()
    downstream = capability_check(target_profile, capabilities)
    try:
        checks = list(profile.preflight(request))
    except Exception:  # noqa: BLE001 - a live preview must never 500 on a mid-edit scene
        checks = []
    if downstream is not None:
        checks.append(downstream)

    result = panel_payload(checks, capabilities, target_profile)
    result["live"] = True
    result["recording_path"] = active_recording_path
    return result
