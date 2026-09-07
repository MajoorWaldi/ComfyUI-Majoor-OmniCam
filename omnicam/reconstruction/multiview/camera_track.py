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
    position, forward, _up = _pose_full(camera)
    return position, forward


def _pose_full(camera: ViewCameraEvidence) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """World-space ``(position, forward_unit, up_unit)`` for an OmniCam camera.

    ``world_from_cam[:3, :3]`` columns are the camera's right / up / backward
    axes in world space; forward is ``-backward``.
    """
    world_from_cam = _rigid_inv(_as_4x4(camera.extrinsic_camera_from_world))
    position = world_from_cam[:3, 3]
    rot = world_from_cam[:3, :3]

    def _unit(v: np.ndarray, fallback: np.ndarray) -> np.ndarray:
        n = float(np.linalg.norm(v))
        return v / n if n > 1e-9 else fallback

    forward = _unit(-rot @ np.array([0.0, 0.0, 1.0]), np.array([0.0, 0.0, -1.0]))
    up = _unit(rot @ np.array([0.0, 1.0, 0.0]), np.array([0.0, 1.0, 0.0]))
    return position, forward, up


def _roll_degrees(forward: np.ndarray, up: np.ndarray) -> float:
    """Signed roll about the optical axis: the angle from the no-roll reference
    up (world +Y de-tilted onto forward) to the camera's actual up."""
    world_up = np.array([0.0, 1.0, 0.0])
    ref = world_up - float(np.dot(world_up, forward)) * forward
    n = float(np.linalg.norm(ref))
    if n < 1e-6:  # looking straight up/down -- roll is undefined, call it 0
        return 0.0
    ref = ref / n
    cos_a = float(np.clip(np.dot(ref, up), -1.0, 1.0))
    sin_a = float(np.dot(np.cross(ref, up), forward))
    return math.degrees(math.atan2(sin_a, cos_a))


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
        position, forward, up = _pose_full(cam)
        target = position + forward
        keyframes.append(
            {
                "frame": frame,
                "camera": {
                    "position": [float(v) for v in position],
                    "target": [float(v) for v in target],
                    "fov": _vertical_fov_degrees(cam.intrinsics, height),
                    "roll": _roll_degrees(forward, up),
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
