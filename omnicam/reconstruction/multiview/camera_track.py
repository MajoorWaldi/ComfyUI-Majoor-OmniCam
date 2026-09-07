"""Build one MotionScene camera trajectory track from VGGT scan poses.

One track with many keyframes -- never one MotionScene camera per sampled view.
Cameras must already be in OmniCam anchor coordinates (see ``coordinates``).
"""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from .coordinates import _as_4x4, _rigid_inv
from .types import ViewCameraEvidence


def _vertical_fov_degrees(intrinsics: Any, height: int) -> float:
    fy = float(np.asarray(intrinsics, dtype=float)[1, 1])
    if fy <= 1e-6:
        return 50.0
    return math.degrees(2.0 * math.atan((height * 0.5) / fy))


def _pose(camera: ViewCameraEvidence) -> tuple[np.ndarray, np.ndarray]:
    """World-space ``(position, forward_unit)`` for an OmniCam-frame camera."""
    world_from_cam = _rigid_inv(_as_4x4(camera.extrinsic_camera_from_world))
    position = world_from_cam[:3, 3]
    forward = world_from_cam[:3, :3] @ np.array([0.0, 0.0, -1.0])
    norm = float(np.linalg.norm(forward))
    if norm > 1e-9:
        forward = forward / norm
    return position, forward


def build_scan_camera_track(
    cameras: list[ViewCameraEvidence],
    *,
    fps: float,
    duration_frames: int,
    width: int,
    height: int,
    near: float = 0.01,
    far: float = 10000.0,
) -> dict[str, Any]:
    duration_frames = max(1, int(duration_frames))
    keyframes: list[dict[str, Any]] = []
    for cam in cameras:
        if cam.source_frame is None:
            continue
        frame = max(0, min(duration_frames - 1, int(cam.source_frame)))
        position, forward = _pose(cam)
        target = position + forward
        keyframes.append(
            {
                "frame": frame,
                "camera": {
                    "position": [float(v) for v in position],
                    "target": [float(v) for v in target],
                    "fov": _vertical_fov_degrees(cam.intrinsics, height),
                    "roll": 0.0,
                    "camera_type": "perspective",
                    "zoom": 1.0,
                    "near": float(near),
                    "far": float(far),
                },
                "interpolation": "linear",
            }
        )

    # Dedup by frame (last wins), then sort.
    deduped = {kf["frame"]: kf for kf in keyframes}
    ordered = [deduped[f] for f in sorted(deduped)]

    return {
        "schema_version": 1,
        "fps": int(fps),
        "duration_frames": duration_frames,
        "width": int(width),
        "height": int(height),
        "render_mode": "omni_ref",
        "keyframes": ordered or [
            {
                "frame": 0,
                "camera": {
                    "position": [0.0, 0.0, 0.0],
                    "target": [0.0, 0.0, -1.0],
                    "fov": 50.0,
                    "roll": 0.0,
                    "camera_type": "perspective",
                    "zoom": 1.0,
                    "near": float(near),
                    "far": float(far),
                },
                "interpolation": "hold",
            }
        ],
        "objects": [],
        "metadata": {"source": "vggt_scan"},
    }
