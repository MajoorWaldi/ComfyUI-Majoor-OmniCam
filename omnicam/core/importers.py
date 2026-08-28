"""Camera animation import into the canonical track.

Supported today:
- OmniCam/Blender-export JSON (position/target per frame or per key).
- Minimal After-Effects-style camera arrays (position + point of interest).

Format-specific binary parsers (FBX, Alembic) belong in dedicated adapters;
this module keeps the canonical conversion pure and testable.
"""

from __future__ import annotations

import math
from dataclasses import asdict
from typing import Any

from .track import CameraKeyframe, CameraState, OmniCamTrack


def _to_track(payload: dict[str, Any], keyframes: list[CameraKeyframe], default_fps: int = 24) -> OmniCamTrack:
    base = {
        "fps": payload.get("fps", default_fps),
        "duration_frames": payload.get("duration_frames") or (max((k.frame for k in keyframes), default=0) + 1),
        "width": payload.get("width", 1280),
        "height": payload.get("height", 720),
        "render_mode": payload.get("render_mode", "omni_ref"),
        "objects": payload.get("objects", []),
        "metadata": payload.get("metadata", {}),
    }
    track = OmniCamTrack.from_dict({**base, "keyframes": []})
    track.keyframes = keyframes
    return track


def import_blender_camera(payload: dict[str, Any], fps: int = 24) -> OmniCamTrack:
    """Import a Blender-style export: {"frames": [{"frame", "location", "track_to" | "rotation_euler"}]}.

    Blender is Z-up right-handed; we convert to OmniCam's Y-up look-at by
    swapping Y/Z and negating the new Y.
    """
    frames = payload.get("frames")
    if not isinstance(frames, list) or not frames:
        raise ValueError("Blender camera import requires a frames list")
    keyframes = []
    for entry in frames:
        if not isinstance(entry, dict):
            continue
        location = entry.get("location", [0, 0, 0])
        target = entry.get("track_to", entry.get("target"))
        if target is None:
            rotation = entry.get("rotation_euler", [0, 0, 0])
            # Derive the look target from the Euler rotation (camera looks down -Z in Blender).
            rx, ry, _rz = (math.radians(float(rotation[i])) for i in range(3))
            forward = [math.sin(ry) * math.cos(rx), -math.sin(rx), -math.cos(ry) * math.cos(rx)]
            target = [location[i] + forward[i] * 5.0 for i in range(3)]
        keyframes.append(
            CameraKeyframe(
                frame=max(0, int(entry.get("frame", len(keyframes)))),
                camera=CameraState.from_dict(
                    {
                        "position": [location[0], location[2], -location[1]],
                        "target": [target[0], target[2], -target[1]],
                        "fov": entry.get("fov", entry.get("angle_degrees", 35.0)),
                    }
                ),
                interpolation="linear",
            )
        )
    if not keyframes:
        raise ValueError("Blender camera import found no usable frames")
    keyframes.sort(key=lambda key: key.frame)
    return _to_track({**payload, "fps": payload.get("fps", fps)}, keyframes, fps)


def import_track_json(payload: dict[str, Any]) -> OmniCamTrack:
    """Round-trip import of a canonical MAJOOR_OMNICAM_TRACK document."""
    return OmniCamTrack.from_dict(payload)


def stabilize_track(track: OmniCamTrack, strength: float = 0.5) -> OmniCamTrack:
    """Dampen frame-to-frame jitter while preserving the overall move.

    strength=0 keeps the original; 1 snaps every frame to the smoothed path.
    """
    from .camera_tools import smooth_camera_path

    strength = max(0.0, min(1.0, float(strength)))
    if strength <= 0:
        return track
    smoothed = smooth_camera_path(track, radius=2)
    keyframes = []
    for original, smooth in zip(track.keyframes, smoothed.keyframes, strict=True):
        camera = CameraState.from_dict(
            {
                "position": [original.camera.position[i] + (smooth.camera.position[i] - original.camera.position[i]) * strength for i in range(3)],
                "target": [original.camera.target[i] + (smooth.camera.target[i] - original.camera.target[i]) * strength for i in range(3)],
                "fov": original.camera.fov + (smooth.camera.fov - original.camera.fov) * strength,
                "roll": original.camera.roll,
                "zoom": original.camera.zoom,
            }
        )
        keyframes.append(CameraKeyframe(original.frame, camera, original.interpolation))
    result = track.to_dict()
    result["keyframes"] = [
        {
            "frame": key.frame,
            "camera": asdict(key.camera),
            "interpolation": key.interpolation,
            **({"tangents": key.tangents} if key.tangents else {}),
            **({"references": key.references} if key.references else {}),
        }
        for key in keyframes
    ]
    return OmniCamTrack.from_dict(result)


def simplify_track(track: OmniCamTrack, tolerance: float = 0.02) -> OmniCamTrack:
    """Remove keyframes that stay within tolerance of the interpolated path."""
    if len(track.keyframes) <= 2:
        return track
    tolerance = max(0.0, float(tolerance))
    kept = [track.keyframes[0]]
    for index in range(1, len(track.keyframes) - 1):
        key = track.keyframes[index]
        previous, following = kept[-1], track.keyframes[index + 1]
        span = max(1, following.frame - previous.frame)
        t = (key.frame - previous.frame) / span
        expected = [
            previous.camera.position[i] + (following.camera.position[i] - previous.camera.position[i]) * t
            for i in range(3)
        ]
        error = math.sqrt(sum((key.camera.position[i] - expected[i]) ** 2 for i in range(3)))
        if error > tolerance:
            kept.append(key)
    kept.append(track.keyframes[-1])
    result = track.to_dict()
    result["keyframes"] = [
        {
            "frame": key.frame,
            "camera": asdict(key.camera),
            "interpolation": key.interpolation,
            **({"tangents": key.tangents} if key.tangents else {}),
            **({"references": key.references} if key.references else {}),
        }
        for key in kept
    ]
    return OmniCamTrack.from_dict(result)
