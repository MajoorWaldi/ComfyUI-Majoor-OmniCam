from __future__ import annotations

from ..adapters.h3 import build_h3_prompt
from ..core.camera_tools import analyze_camera_trajectory, build_cinematic_motion_prompt
from ..core.track import OmniCamTrack
from .adapter_registry import adapter_info
from .types import MonitorText


def _join_prompt(base_prompt: str, camera_prompt: str) -> str:
    parts = [part.strip() for part in (base_prompt, camera_prompt) if part and part.strip()]
    return "\n\n".join(parts)


def build_monitor_text(
    track: OmniCamTrack, *, adapter: str, base_prompt: str = "",
    video_ref_token: str = "<Video 1>",
) -> MonitorText:
    adapter_info(adapter)
    analysis = analyze_camera_trajectory(track)
    cinematography = build_cinematic_motion_prompt(track, base_prompt="", style="universal")
    if adapter == "h3":
        camera_prompt = build_h3_prompt(track, video_ref_token=video_ref_token)
    else:
        primary = str(analysis.get("classification", {}).get("primary", "camera move")).replace("_", " ")
        camera_prompt = (
            f"Reproduce the authored {primary} camera trajectory, framing, timing, FOV, "
            "speed, acceleration and deceleration while preserving the scene appearance."
        )
    camera_data = dict(analysis)
    camera_data.update({
        "frames": track.duration_frames,
        "fps": track.fps,
        "duration_seconds": track.duration_seconds,
        "resolution": [track.width, track.height],
        "keyframes": len(track.keyframes),
        "adapter": adapter,
    })
    return MonitorText(
        cinematography=cinematography,
        camera_prompt=camera_prompt,
        final_prompt=_join_prompt(base_prompt, camera_prompt),
        camera_data=camera_data,
    )
