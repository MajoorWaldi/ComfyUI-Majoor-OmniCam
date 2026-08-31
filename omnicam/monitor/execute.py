from __future__ import annotations

import json
import logging
from typing import Any

from ..adapters.h3 import H3_API_MEDIA_LIMITS, H3_NATIVE_MEDIA_LIMITS
from ..adapters.ltx_guide import build_ltx_guide_frames
from ..adapters.ltx_tracks import ltx_motion_track_profile, track_to_ltx_tracks_json
from ..adapters.wan_native import build_wan_camera_embedding
from ..adapters.wanvideo_wrapper.v2026_08 import track_to_ati_json
from ..core.track import OmniCamTrack
from ..core.video_sampling import inspect_video
from .adapter_registry import adapter_info
from .text import build_monitor_text

logger = logging.getLogger(__name__)


def proxy_media_facts(proxy_video: Any) -> dict[str, Any]:
    """What the downstream node will judge the reference on, read once.

    Returns ``available`` alone when the media cannot be introspected: an
    unknown frame rate is reported as unknown, never as passing.
    """
    if proxy_video is None:
        return {"available": False}
    try:
        metadata = inspect_video(proxy_video)
    except Exception as exc:  # noqa: BLE001 - third-party VIDEO objects vary
        logger.debug("Could not inspect the Monitor proxy video: %s", exc)
        return {"available": True}
    frame_rate = metadata.frame_rate
    return {
        "available": True,
        "fps": frame_rate,
        "frame_count": metadata.frame_count,
        "duration_seconds": metadata.frame_count / max(1e-6, frame_rate),
        "width": metadata.width,
        "height": metadata.height,
    }


def _validate_h3_reference(adapter: str, facts: dict[str, Any]) -> None:
    """Fail here, with the reason, rather than deep inside the H3 node."""
    duration = facts.get("duration_seconds")
    if adapter == "h3":
        limits = H3_API_MEDIA_LIMITS
        fps = facts.get("fps")
        if fps and not (limits["min_fps"] <= float(fps) <= limits["max_fps"]):
            raise ValueError(
                f"The H3 reference video is {float(fps):.2f} FPS. MinimaxHailuo03ReferenceNode "
                "supports 23.976-60 FPS."
            )
        if duration is not None:
            if float(duration) < limits["min_duration_seconds"]:
                raise ValueError(
                    f"The H3 reference video is {float(duration):.2f}s. The minimum is "
                    f"{limits['min_duration_seconds']:.0f} seconds."
                )
            if float(duration) > limits["max_total_duration_seconds"]:
                raise ValueError(
                    f"The H3 reference video is {float(duration):.2f}s. The maximum is "
                    f"{limits['max_total_duration_seconds']:.0f} seconds."
                )
    elif adapter == "h3_native":
        frame_count = facts.get("frame_count")
        if frame_count is not None and int(frame_count) < H3_NATIVE_MEDIA_LIMITS["min_reference_frames"]:
            raise ValueError(
                f"The H3 reference video has {int(frame_count)} frames. The Native node requires "
                f"at least {H3_NATIVE_MEDIA_LIMITS['min_reference_frames']} frames."
            )


def execute_monitor_adapter(
    *, adapter: str, track: OmniCamTrack, proxy_video: Any, base_prompt: str,
    video_ref_token: str = "auto", width: int, height: int, length: int,
    point_count: int, distribution: str, ltx_max_frames: int,
    ltx_sampling_mode: str, capabilities: dict[str, Any] | None = None,
) -> dict[str, Any]:
    info = adapter_info(adapter)
    text = build_monitor_text(
        track, adapter=adapter, base_prompt=base_prompt,
        video_ref_token=video_ref_token, capabilities=capabilities,
    )
    result: dict[str, Any] = {
        "reference_video": None, "camera_prompt": text.camera_prompt,
        "cinematic_prompt": text.cinematography, "final_prompt": text.final_prompt,
        "camera_data_json": json.dumps(text.camera_data, indent=2),
        "wan_camera": None, "tracks": "", "adapter_width": int(width),
        "adapter_height": int(height), "adapter_length": int(length),
        "guide_frames": None, "adapter_profile_json": json.dumps(text.contract, indent=2),
    }
    if info["requires_proxy"] and proxy_video is None:
        raise ValueError(f"{info['display_name']} Monitor execution requires a proxy video")

    if adapter in {"h3", "h3_native"}:
        _validate_h3_reference(adapter, proxy_media_facts(proxy_video))
        result["reference_video"] = proxy_video
    elif adapter == "wan_native":
        result["wan_camera"] = build_wan_camera_embedding(track, width=width, height=height, length=length)
    elif adapter in {"wan_ati", "wan_tracks_native"}:
        result["tracks"] = track_to_ati_json(
            track, point_count=point_count, distribution=distribution,
            width=width, height=height,
        )
    elif adapter == "ltx_motion_track":
        result["tracks"] = track_to_ltx_tracks_json(
            track, length=length, point_count=point_count,
            distribution=distribution, width=width, height=height,
        )
        result["adapter_profile_json"] = json.dumps(
            ltx_motion_track_profile(
                track, length=length, point_count=point_count,
                distribution=distribution, width=width, height=height,
            ),
            indent=2,
        )
    elif adapter == "ltx":
        guide = build_ltx_guide_frames(
            track, proxy_video, max_frames=ltx_max_frames,
            sampling_mode=ltx_sampling_mode, width=width, height=height,
        )
        result["guide_frames"] = guide["frames"]
        result["adapter_profile_json"] = json.dumps(guide["profile"], indent=2)
        result["adapter_length"] = len(guide["plan"]["indices"])
    return result
