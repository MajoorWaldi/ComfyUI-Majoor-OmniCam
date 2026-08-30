from __future__ import annotations

from typing import Any

from ..adapters.wanvideo_wrapper.v2026_08 import track_to_ati_tracks
from ..core.track import OmniCamTrack
from ..core.video_sampling import sampling_indices
from .adapter_registry import adapter_info
from .types import MonitorPreview


def build_adapter_preview(
    track: OmniCamTrack, *, adapter: str, proxy_available: bool = False,
    width: int = 832, height: int = 480, length: int = 81,
    point_count: int = 16, distribution: str = "balanced",
    ltx_max_frames: int = 121, ltx_sampling_mode: str = "contiguous",
    proxy_frame_count: int | None = None,
) -> MonitorPreview:
    adapter_info(adapter)
    if adapter == "h3":
        return MonitorPreview("proxy_video", "OUTPUT PREVIEW — H3 Omni Reference", {"proxy_available": bool(proxy_available)}, True)
    if adapter in {"wan_ati", "wan_tracks_native"}:
        tracks = track_to_ati_tracks(track, point_count=point_count, distribution=distribution, width=width, height=height)
        label = "OUTPUT PREVIEW — ATI Tracks" if adapter == "wan_ati" else "OUTPUT PREVIEW — Wan Tracks"
        return MonitorPreview("trajectory_overlay", label, {"width": width, "height": height, "tracks": tracks}, True)
    if adapter == "wan_native":
        points = [
            {"frame": frame, "position": camera.position, "target": camera.target, "fov": camera.fov}
            for frame, camera in track.samples()
        ]
        return MonitorPreview(
            "camera_path", "DIAGNOSTIC — Camera Path",
            {"points": points, "length": int(length), "width": int(width), "height": int(height), "valid_4n_plus_1": (int(length) - 1) % 4 == 0},
            False,
        )
    total = int(proxy_frame_count or track.duration_frames)
    indices = sampling_indices(total, 0, 0, ltx_max_frames, ltx_sampling_mode)
    payload: dict[str, Any] = {
        "indices": indices, "planned_count": len(indices), "width": int(width), "height": int(height),
        "sampling_mode": ltx_sampling_mode,
    }
    return MonitorPreview("frame_sequence", "OUTPUT PREVIEW — LTX Guide Sampling", payload, True)
