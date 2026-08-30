from __future__ import annotations

from typing import Any

from ..adapters.ltx_tracks import ltx_motion_track_profile, track_to_ltx_tracks
from ..adapters.wanvideo_wrapper.v2026_08 import track_to_ati_tracks
from ..core.track import OmniCamTrack
from ..core.video_sampling import sampling_indices
from .adapter_registry import adapter_info
from .types import MonitorPreview

_TRAJECTORY_LABELS = {
    "wan_ati": "OUTPUT PREVIEW - Wan 2.1 ATI Tracks",
    "wan_tracks_native": "OUTPUT PREVIEW - Wan Motion Tracks",
    "ltx_motion_track": "OUTPUT PREVIEW - LTX Motion Tracks",
}


def build_adapter_preview(
    track: OmniCamTrack, *, adapter: str, proxy_available: bool = False,
    width: int = 832, height: int = 480, length: int = 81,
    point_count: int = 16, distribution: str = "balanced",
    ltx_max_frames: int = 121, ltx_sampling_mode: str = "contiguous",
    proxy_frame_count: int | None = None,
) -> MonitorPreview:
    info = adapter_info(adapter)
    if adapter in {"h3", "h3_native"}:
        return MonitorPreview(
            "proxy_video", f"OUTPUT PREVIEW - {info['display_name']} reference",
            {"proxy_available": bool(proxy_available), "reference_kind": info["proxy_kind"]}, True,
        )
    if adapter == "ltx_motion_track":
        tracks = track_to_ltx_tracks(
            track, length=length, point_count=point_count,
            distribution=distribution, width=width, height=height,
        )
        profile = ltx_motion_track_profile(
            track, length=length, point_count=point_count,
            distribution=distribution, width=width, height=height,
        )
        return MonitorPreview(
            "trajectory_overlay", _TRAJECTORY_LABELS[adapter],
            {"width": width, "height": height, "tracks": tracks, "profile": profile}, True,
        )
    if adapter in {"wan_ati", "wan_tracks_native"}:
        tracks = track_to_ati_tracks(
            track, point_count=point_count, distribution=distribution, width=width, height=height,
        )
        return MonitorPreview(
            "trajectory_overlay", _TRAJECTORY_LABELS[adapter],
            {"width": width, "height": height, "tracks": tracks}, True,
        )
    if adapter == "wan_native":
        points = [
            {"frame": frame, "position": camera.position, "target": camera.target, "fov": camera.fov}
            for frame, camera in track.samples()
        ]
        return MonitorPreview(
            "camera_path", "DIAGNOSTIC - Camera Path",
            {
                "points": points, "length": int(length), "width": int(width),
                "height": int(height), "valid_4n_plus_1": (int(length) - 1) % 4 == 0,
            },
            False,
        )
    total = int(proxy_frame_count or track.duration_frames)
    indices = sampling_indices(total, 0, 0, ltx_max_frames, ltx_sampling_mode)
    payload: dict[str, Any] = {
        "indices": indices, "planned_count": len(indices), "width": int(width),
        "height": int(height), "sampling_mode": ltx_sampling_mode,
    }
    return MonitorPreview("frame_sequence", "OUTPUT PREVIEW - LTX Guide Sampling (legacy)", payload, True)
