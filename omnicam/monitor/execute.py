from __future__ import annotations

import json
from typing import Any

from ..adapters.ltx_guide import build_ltx_guide_frames
from ..adapters.wan_native import build_wan_camera_embedding
from ..adapters.wanvideo_wrapper.v2026_08 import track_to_ati_json
from ..core.track import OmniCamTrack
from .adapter_registry import adapter_info
from .text import build_monitor_text


def execute_monitor_adapter(
    *, adapter: str, track: OmniCamTrack, proxy_video: Any, base_prompt: str,
    video_ref_token: str, width: int, height: int, length: int,
    point_count: int, distribution: str, ltx_max_frames: int,
    ltx_sampling_mode: str,
) -> dict[str, Any]:
    adapter_info(adapter)
    text = build_monitor_text(track, adapter=adapter, base_prompt=base_prompt, video_ref_token=video_ref_token)
    result: dict[str, Any] = {
        "reference_video": None, "camera_prompt": text.camera_prompt,
        "cinematic_prompt": text.cinematography, "final_prompt": text.final_prompt,
        "camera_data_json": json.dumps(text.camera_data, indent=2),
        "wan_camera": None, "tracks": "", "adapter_width": int(width),
        "adapter_height": int(height), "adapter_length": int(length),
        "guide_frames": None, "adapter_profile_json": "{}",
    }
    if adapter == "h3":
        if proxy_video is None:
            raise ValueError("H3 Monitor execution requires a proxy video")
        result["reference_video"] = proxy_video
    elif adapter == "wan_native":
        result["wan_camera"] = build_wan_camera_embedding(track, width=width, height=height, length=length)
    elif adapter in {"wan_ati", "wan_tracks_native"}:
        result["tracks"] = track_to_ati_json(
            track, point_count=point_count, distribution=distribution,
            width=width, height=height,
        )
    elif adapter == "ltx":
        if proxy_video is None:
            raise ValueError("LTX Monitor execution requires a proxy video")
        guide = build_ltx_guide_frames(
            track, proxy_video, max_frames=ltx_max_frames,
            sampling_mode=ltx_sampling_mode, width=width, height=height,
        )
        result["guide_frames"] = guide["frames"]
        result["adapter_profile_json"] = json.dumps(guide["profile"], indent=2)
        result["adapter_length"] = len(guide["plan"]["indices"])
    return result
