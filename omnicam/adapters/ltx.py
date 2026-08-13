from __future__ import annotations

from typing import Any

from ..core.track import OmniCamTrack
from .h3 import classify_camera_motion

LTXVIDEO_COMMIT = "ac4d99839020b983e956a8ab67ec38aec1b6e65a"
LTX_CAMERA_LORAS = {
    "static": "ltx-2-19b-lora-camera-control-static.safetensors",
    "dolly_in": "ltx-2-19b-lora-camera-control-dolly-in.safetensors",
    "dolly_out": "ltx-2-19b-lora-camera-control-dolly-out.safetensors",
    "crane_up": "ltx-2-19b-lora-camera-control-jib-up.safetensors",
    "crane_down": "ltx-2-19b-lora-camera-control-jib-down.safetensors",
    "truck_left": "ltx-2-19b-lora-camera-control-dolly-left.safetensors",
    "truck_right": "ltx-2-19b-lora-camera-control-dolly-right.safetensors",
}


def ltx_camera_control_profile(track: OmniCamTrack) -> dict[str, Any]:
    motion = classify_camera_motion(track)
    if motion == "orbit_or_truck":
        start = track.sample(0)
        end = track.sample(track.duration_frames - 1)
        motion = "truck_right" if end.position[0] > start.position[0] else "truck_left"
    return {
        "motion": motion,
        "camera_lora": LTX_CAMERA_LORAS.get(motion),
        "proxy_path": "Connect OmniCam proxy frames to LTX Add Video IC-LoRA Guide",
        "ltxvideo_commit": LTXVIDEO_COMMIT,
    }


def track_to_ltx_camera_bridge(track: OmniCamTrack, length: int | None = None) -> dict[str, Any]:
    """Return an explicit camera-conditioning bridge payload.

    The payload contains per-frame extrinsic intent (position + look target) and intrinsics (FOV),
    while remaining independent of a specific LTX-2 control implementation.
    """
    frames = []
    length = max(1, int(length or track.duration_frames))
    for index in range(length):
        source_frame = 0.0 if length == 1 else index * (track.duration_frames - 1) / (length - 1)
        camera = track.sample(source_frame)
        frames.append(
            {
                "frame": index,
                "source_frame": source_frame,
                "time_seconds": source_frame / track.fps,
                "position": camera.position,
                "target": camera.target,
                "fov_degrees": camera.fov,
                "roll_degrees": camera.roll,
                "camera_type": camera.camera_type,
            }
        )
    return {
        "format": "majoor.omnicam.ltx-camera-bridge.v1",
        "fps": track.fps,
        "width": track.width,
        "height": track.height,
        "source_duration_frames": track.duration_frames,
        "duration_frames": length,
        "frames": frames,
        "supported_control": ltx_camera_control_profile(track),
        "notes": (
            "Version-neutral bridge. Map these intrinsics/extrinsics to the currently supported "
            "LTX camera-control node or control model after verifying its official API."
        ),
    }
