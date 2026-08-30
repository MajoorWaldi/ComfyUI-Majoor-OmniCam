from __future__ import annotations

from typing import Any

from ..core.track import OmniCamTrack
from .fingerprint import monitor_fingerprint
from .health import build_camera_health
from .preflight import build_adapter_preflight
from .preview import build_adapter_preview
from .text import build_monitor_text
from .types import MonitorSnapshot


def _setting(settings: dict[str, Any], name: str, default: Any) -> Any:
    value = settings.get(name, default)
    return default if value is None else value


def build_monitor_snapshot(
    *, track: OmniCamTrack, adapter: str, proxy_available: bool,
    settings: dict[str, Any], capabilities: dict[str, Any],
) -> MonitorSnapshot:
    width = int(_setting(settings, "width", 832))
    height = int(_setting(settings, "height", 480))
    length = int(_setting(settings, "length", track.duration_frames))
    point_count = int(_setting(settings, "point_count", 16))
    distribution = str(_setting(settings, "distribution", "balanced"))
    ltx_max_frames = int(_setting(settings, "ltx_max_frames", 121))
    ltx_sampling_mode = str(_setting(settings, "ltx_sampling_mode", "contiguous"))
    health = build_camera_health(track)
    preflight = build_adapter_preflight(
        adapter=adapter, track=track, proxy_available=proxy_available,
        width=width, height=height, length=length, point_count=point_count,
        distribution=distribution, capabilities=capabilities,
    )
    text = build_monitor_text(
        track, adapter=adapter, base_prompt=str(_setting(settings, "base_prompt", "")),
        video_ref_token=str(_setting(settings, "video_ref_token", "<Video 1>")),
    )
    preview = build_adapter_preview(
        track, adapter=adapter, proxy_available=proxy_available,
        width=width, height=height, length=length, point_count=point_count,
        distribution=distribution, ltx_max_frames=ltx_max_frames,
        ltx_sampling_mode=ltx_sampling_mode,
    )
    return MonitorSnapshot(
        fingerprint=monitor_fingerprint(track=track.to_dict(), adapter=adapter, settings=settings),
        source={
            "fps": track.fps, "duration_frames": track.duration_frames,
            "duration_seconds": track.duration_seconds, "width": track.width,
            "height": track.height, "proxy_available": bool(proxy_available),
        },
        health=health, preflight=preflight, text=text, preview=preview,
    )
