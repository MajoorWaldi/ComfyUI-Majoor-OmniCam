"""Enriched camera/control-pass manifests.

Version-neutral per-frame intrinsics + extrinsics payload that adapters can
translate without leaking model semantics into the core track schema.
"""

from __future__ import annotations

from typing import Any

from .projection import basis
from .track import OmniCamTrack

MANIFEST_FORMAT = "majoor.omnicam.camera-manifest.v1"


def camera_manifest(track: OmniCamTrack, *, step: int = 1) -> dict[str, Any]:
    """Per-frame intrinsics and extrinsics in the canonical Y-up look-at convention."""
    frames = []
    for frame, camera in track.samples(step):
        right, up, forward = basis(camera)
        frames.append(
            {
                "frame": frame,
                "time_seconds": frame / max(1, track.fps),
                "extrinsics": {
                    "position": list(camera.position),
                    "right": list(right),
                    "up": list(up),
                    "forward": list(forward),
                },
                "intrinsics": {
                    "fov_degrees": camera.fov,
                    "roll_degrees": camera.roll,
                    "zoom": camera.zoom,
                    "near": camera.near,
                    "far": camera.far,
                    "camera_type": camera.camera_type,
                },
            }
        )
    return {
        "format": MANIFEST_FORMAT,
        "coordinate_system": {"handedness": "right", "up": [0.0, 1.0, 0.0], "forward_convention": "look_at"},
        "fps": track.fps,
        "width": track.width,
        "height": track.height,
        "duration_frames": track.duration_frames,
        "render_mode": track.render_mode,
        "frames": frames,
        "metadata": dict(track.metadata),
    }


def motion_fidelity_report(track: OmniCamTrack, observed_positions: list[list[float]] | None = None, *, step: int = 1) -> dict[str, Any]:
    """Compare the requested camera motion against observed per-frame positions.

    ``observed_positions`` comes from an external estimator (e.g. camera-motion
    estimation on the generated video). The report carries per-frame absolute
    position error and summary statistics; without observations the expected
    trajectory is returned so callers can measure later.
    """
    expected = [[frame, list(track.sample(frame).position)] for frame, _ in track.samples(step)]
    report: dict[str, Any] = {
        "format": "majoor.omnicam.motion-fidelity.v1",
        "fps": track.fps,
        "expected_positions": expected,
        "per_frame_error": [],
        "summary": None,
    }
    if observed_positions is None:
        return report
    errors = []
    for (frame, expected_position), observed in zip(expected, observed_positions, strict=False):
        error = sum((float(observed[i]) - expected_position[i]) ** 2 for i in range(3)) ** 0.5  # type: ignore[index]
        errors.append(error)
        report["per_frame_error"].append({"frame": frame, "error": error})
    if errors:
        report["summary"] = {
            "mean_error": sum(errors) / len(errors),
            "max_error": max(errors),
            "max_error_frame": report["per_frame_error"][errors.index(max(errors))]["frame"],
        }
    return report
