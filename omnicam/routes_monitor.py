from __future__ import annotations

from typing import Any

from aiohttp import web

from .capabilities import detect_capabilities
from .comfy_compat.server import PromptServer
from .core.track import OmniCamTrack
from .core.validation import validate_track_payload
from .http_json import read_bounded_json_object
from .monitor.adapter_registry import MONITOR_ADAPTERS
from .monitor.snapshot import build_monitor_snapshot

MAX_MONITOR_REQUEST_BYTES = 2 * 1024 * 1024
MAX_MONITOR_TEXT_LENGTH = 16_384


def _integer(settings: dict[str, Any], name: str, default: int, minimum: int, maximum: int) -> int:
    try:
        value = int(settings.get(name, default))
    except (TypeError, ValueError) as exc:
        raise web.HTTPBadRequest(text=f"Invalid Monitor setting: {name}") from exc
    if not minimum <= value <= maximum:
        raise web.HTTPBadRequest(text=f"Monitor setting out of range: {name}")
    return value


def _validated_settings(value: Any) -> dict[str, Any]:
    if value is None:
        value = {}
    if not isinstance(value, dict):
        raise web.HTTPBadRequest(text="Monitor settings must be an object")
    allowed = {
        "base_prompt", "video_ref_token", "width", "height", "length", "point_count",
        "distribution", "ltx_max_frames", "ltx_sampling_mode",
    }
    if set(value) - allowed:
        raise web.HTTPBadRequest(text="Unknown Monitor setting")
    base_prompt = value.get("base_prompt", "")
    token = value.get("video_ref_token", "auto")
    if not isinstance(base_prompt, str) or len(base_prompt) > MAX_MONITOR_TEXT_LENGTH:
        raise web.HTTPBadRequest(text="Invalid base prompt")
    if not isinstance(token, str) or not token.strip() or len(token) > 256:
        raise web.HTTPBadRequest(text="Invalid video reference token")
    distribution = str(value.get("distribution", "balanced"))
    if distribution not in {"balanced", "subject_focus", "ground_parallax"}:
        raise web.HTTPBadRequest(text="Invalid trajectory distribution")
    sampling = str(value.get("ltx_sampling_mode", "contiguous"))
    if sampling not in {"contiguous", "uniform"}:
        raise web.HTTPBadRequest(text="Invalid LTX sampling mode")
    return {
        "base_prompt": base_prompt, "video_ref_token": token,
        "width": _integer(value, "width", 832, 64, 4096),
        "height": _integer(value, "height", 480, 64, 4096),
        "length": _integer(value, "length", 81, 1, 10_000),
        "point_count": _integer(value, "point_count", 16, 4, 128),
        "distribution": distribution,
        "ltx_max_frames": _integer(value, "ltx_max_frames", 121, 1, 1000),
        "ltx_sampling_mode": sampling,
    }


def _validated_proxy(value: Any, legacy_available: Any) -> dict[str, Any]:
    """Accept the media facts the frontend can actually observe.

    `proxy_available` stays supported so an older frontend bundle keeps working,
    but a boolean alone cannot answer the FPS and duration questions the H3
    nodes ask, which is why the facts object exists.
    """
    facts: dict[str, Any] = {"available": legacy_available is True}
    if value is None:
        return facts
    if not isinstance(value, dict):
        raise web.HTTPBadRequest(text="Monitor proxy must be an object")
    if set(value) - {"available", "fps", "duration_seconds", "frame_count", "width", "height", "source"}:
        raise web.HTTPBadRequest(text="Unknown Monitor proxy field")
    facts["available"] = bool(value.get("available", facts["available"]))
    for name in ("fps", "duration_seconds"):
        if value.get(name) is not None:
            try:
                number = float(value[name])
            except (TypeError, ValueError) as exc:
                raise web.HTTPBadRequest(text=f"Invalid Monitor proxy {name}") from exc
            if not 0 < number < 1e6:
                raise web.HTTPBadRequest(text=f"Monitor proxy {name} out of range")
            facts[name] = number
    for name in ("frame_count", "width", "height"):
        if value.get(name) is not None:
            try:
                number = int(value[name])
            except (TypeError, ValueError) as exc:
                raise web.HTTPBadRequest(text=f"Invalid Monitor proxy {name}") from exc
            if not 0 <= number <= 1_000_000:
                raise web.HTTPBadRequest(text=f"Monitor proxy {name} out of range")
            facts[name] = number
    source = value.get("source")
    if source is not None:
        if not isinstance(source, str) or len(source) > 64:
            raise web.HTTPBadRequest(text="Invalid Monitor proxy source")
        facts["source"] = source
    return facts


@PromptServer.instance.routes.post("/majoor/omnicam/monitor/snapshot")
async def monitor_snapshot_route(request: web.Request):
    body = await read_bounded_json_object(request, max_bytes=MAX_MONITOR_REQUEST_BYTES)
    adapter = body.get("adapter", "h3")
    if adapter not in MONITOR_ADAPTERS:
        raise web.HTTPBadRequest(text="Unsupported Monitor adapter")
    track_payload = body.get("track")
    if not isinstance(track_payload, dict):
        raise web.HTTPBadRequest(text="Expected a canonical track object")
    try:
        track = OmniCamTrack.from_dict(validate_track_payload(track_payload))
    except Exception as exc:
        raise web.HTTPBadRequest(text="Invalid canonical camera track") from exc
    settings = _validated_settings(body.get("settings"))
    proxy = _validated_proxy(body.get("proxy"), body.get("proxy_available"))
    snapshot = build_monitor_snapshot(
        track=track, adapter=adapter, proxy=proxy, settings=settings,
        capabilities=detect_capabilities(),
    )
    return web.json_response({"format": "majoor.omnicam.monitor.snapshot.v1", **snapshot.to_dict()})
