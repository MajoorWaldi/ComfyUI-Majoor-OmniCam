"""`.chan` camera channel files: read and write.

The lowest common denominator of camera interchange. Maya, Nuke, Houdini,
3DEqualizer, SynthEyes and PFTrack all read and write it, which makes it the
one format that always works when a studio pipeline will not take glTF or USD.

It is also barely specified. One line per frame:

    frame  tx ty tz  rx ry rz  [vertical fov in degrees]

There is no header, no units and no stated rotation order, so this module
pins the convention it uses and states it in a companion comment line, which
readers ignore:

  - metres, +Y up, right-handed, camera looking down -Z;
  - rotations are XYZ Euler in degrees, applied X then Y then Z;
  - the eighth column, when present, is the vertical field of view.
"""

from __future__ import annotations

import math

from ..core.camera_math import (
    camera_quaternion,
    euler_from_quaternion,
    quaternion_from_euler,
    rotate_quaternion,
)
from ..core.track import OmniCamTrack
from .baking import bake_camera

MAX_LINES = 200_000
"""A .chan is one line per frame; anything larger is not a camera move."""


def write_chan(track: OmniCamTrack) -> str:
    lines = [
        "# ComfyUI-Majoor-OmniCam camera channel",
        f"# fps={track.fps} frames={track.duration_frames} resolution={track.width}x{track.height}",
        "# columns: frame tx ty tz rx ry rz vfov_degrees",
        "# axes: +Y up, right-handed, camera looks down -Z; rotation order XYZ (degrees)",
    ]
    for sample in bake_camera(track):
        values = [*sample.translation, *sample.euler, sample.vertical_fov]
        lines.append(f"{sample.frame} " + " ".join(f"{value:.6f}" for value in values))
    return "\n".join(lines) + "\n"


def read_chan(text: str, fps: int = 24, width: int = 1280, height: int = 720) -> dict:
    """Parse a .chan into a canonical OmniCam track payload.

    Tolerant on purpose: comment lines, blank lines and a missing fov column are
    all normal in files other tools produced.
    """
    keyframes = []
    for index, raw in enumerate(text.splitlines()):
        if index > MAX_LINES:
            raise ValueError(f".chan file exceeds {MAX_LINES} lines")
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.replace(",", " ").split()
        if len(parts) < 7:
            raise ValueError(f".chan line {index + 1} needs at least 7 columns, got {len(parts)}")
        try:
            numbers = [float(part) for part in parts[:8]]
        except ValueError as exc:
            raise ValueError(f".chan line {index + 1} is not numeric") from exc

        frame = round(numbers[0])
        position = numbers[1:4]
        rotation = numbers[4:7]
        fov = numbers[7] if len(numbers) > 7 else 35.0
        keyframes.append({
            "frame": max(0, frame),
            "camera": {**_camera_from_euler(position, rotation), "fov": fov},
            "interpolation": "linear",
        })

    if not keyframes:
        raise ValueError("no camera samples found in the .chan file")

    frames = [key["frame"] for key in keyframes]
    return {
        "schema_version": 1,
        "fps": max(1, int(fps)),
        "duration_frames": max(1, max(frames) + 1),  # type: ignore[type-var, operator]
        "width": int(width),
        "height": int(height),
        "render_mode": "omni_ref",
        "keyframes": keyframes,
        "objects": [],
        "metadata": {"imported_from": "chan"},
    }


def _camera_from_euler(position: list[float], euler_degrees: list[float]) -> dict:
    """Rebuild an OmniCam look-at camera from a position plus XYZ Euler angles.

    quaternion_from_euler is the exact inverse of the euler_from_quaternion the
    writer used, so a .chan written here reads back without drift.
    """
    quaternion = quaternion_from_euler(euler_degrees)
    forward = rotate_quaternion([0.0, 0.0, -1.0], quaternion)
    up = rotate_quaternion([0.0, 1.0, 0.0], quaternion)
    target = [position[axis] + forward[axis] for axis in range(3)]
    # Roll is the twist between the file's up vector and the roll-free basis.
    reference = camera_quaternion(position, target, 0.0)
    reference_up = rotate_quaternion([0.0, 1.0, 0.0],
                                     [reference["x"], reference["y"], reference["z"], reference["w"]])
    # Negated: apply_roll() turns the basis the opposite way to the signed
    # angle measured about forward, so without this a 12 degree roll reads -12.
    roll = -math.degrees(_signed_angle(reference_up, up, forward))
    return {"position": [float(value) for value in position], "target": target, "roll": roll}


def _signed_angle(a: list[float], b: list[float], axis: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    cross = [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ]
    sign = sum(c * s for c, s in zip(cross, axis, strict=True))
    return math.atan2(sign, max(-1.0, min(1.0, dot)))


__all__ = ["MAX_LINES", "euler_from_quaternion", "read_chan", "write_chan"]
