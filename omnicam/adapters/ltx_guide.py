from __future__ import annotations

from typing import Any

import torch

from ..core.track import OmniCamTrack
from ..core.video_sampling import inspect_video, sample_video_frames, sampling_indices
from .ltx import ltx_camera_control_profile

MAX_DECODED_BYTES = 2 * 1024**3


def plan_ltx_guide(
    proxy_video: Any,
    *,
    max_frames: int,
    sampling_mode: str,
    width: int = 0,
    height: int = 0,
    start_frame: int = 0,
    end_frame: int = 0,
) -> dict[str, Any]:
    metadata = inspect_video(proxy_video)
    indices = sampling_indices(metadata.frame_count, start_frame, end_frame, max_frames, sampling_mode)
    target_width = int(width) or metadata.width
    target_height = int(height) or metadata.height
    source_bytes = len(indices) * metadata.width * metadata.height * 3 * 4
    output_bytes = len(indices) * target_width * target_height * 3 * 4
    resize_needed = (target_width, target_height) != (metadata.width, metadata.height)
    estimated = source_bytes + output_bytes if resize_needed else source_bytes
    if estimated > MAX_DECODED_BYTES:
        detail = "source decode and resized output" if resize_needed else "source decode"
        raise ValueError(
            f"LTX guide {detail} would exceed the 2 GiB decoded-frame safety limit; "
            "reduce frames or source resolution"
        )
    return {
        "indices": indices, "planned_count": len(indices), "width": target_width,
        "height": target_height, "sampling_mode": sampling_mode,
        "source_decode_bytes": source_bytes, "output_bytes": output_bytes,
        "estimated_memory_bytes": estimated,
    }


def build_ltx_guide_frames(
    track: OmniCamTrack, proxy_video: Any, *, max_frames: int,
    sampling_mode: str, width: int = 0, height: int = 0,
    start_frame: int = 0, end_frame: int = 0,
) -> dict[str, Any]:
    plan = plan_ltx_guide(
        proxy_video,
        max_frames=max_frames,
        sampling_mode=sampling_mode,
        width=width,
        height=height,
        start_frame=start_frame,
        end_frame=end_frame,
    )
    frames = sample_video_frames(
        proxy_video,
        start_frame=start_frame,
        end_frame=end_frame,
        max_frames=max_frames,
        mode=sampling_mode,
    )
    if not frames.shape[0]:
        raise ValueError("The LTX guide source contains no decodable video frames")
    if (plan["height"], plan["width"]) != tuple(frames.shape[1:3]):
        frames = torch.nn.functional.interpolate(
            frames.permute(0, 3, 1, 2), size=(plan["height"], plan["width"]),
            mode="bilinear", align_corners=False,
        ).permute(0, 2, 3, 1)
    profile = ltx_camera_control_profile(track)
    profile["guide_diagnostics"] = {
        "guide_type": "IMAGE", "frames": int(frames.shape[0]),
        "resolution": [int(frames.shape[2]), int(frames.shape[1])],
        "estimated_memory_bytes": plan["estimated_memory_bytes"],
        "estimated_memory_mb": round(plan["estimated_memory_bytes"] / 1024**2, 1),
    }
    return {"frames": frames, "profile": profile, "plan": plan}
