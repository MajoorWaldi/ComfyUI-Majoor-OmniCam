"""Turn normalized poses into a canonical ``MAJOOR_OMNICAM_TRACK``.

This is where the extractor stops speaking its own vocabulary and starts
speaking OmniCam's. It emits schema version 1 -- nothing about a solved camera
needs a new contract -- and it is deliberately conservative about what it
claims: the metadata says the scale is relative and that the confidence number
is solver coverage, because neither can be anything else from a single moving
lens.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

from ..core.track import OmniCamTrack
from ..core.validation import validate_track_payload
from .filters import is_static_solve
from .fingerprint import stamp_fingerprint
from .transforms import pose_to_camera_payload
from .types import PoseSample

SOURCE = "omnicam_extractor"
#: Solver samples are observations, not authored motion: nothing about them is
#: eased, so easing them would invent acceleration the camera never had.
KEY_INTERPOLATION = "linear"
NEAR_PLANE = 0.01
FAR_PLANE = 10000.0

SCALE_WARNING = "Translation scale is relative, not guaranteed to be metric."
AUTO_LENS_WARNING = (
    "Lens intrinsics were approximated from a 53 degree vertical FOV. "
    "For a more faithful solve, enter the source FOV or focal length."
)


def build_omnicam_track(
    *,
    poses: Sequence[PoseSample],
    source_fps: float,
    duration_frames: int,
    width: int,
    height: int,
    vertical_fov: float,
    backend: str,
    confidence: float,
    frame_step: int,
    intrinsics_source: str,
    motion_scale: float,
    raw_key_count: int,
    warnings: Sequence[str] = (),
) -> dict[str, Any]:
    """Build, validate and fingerprint the canonical track for one solve."""
    if not poses:
        raise ValueError("OmniCam Extractor cannot build a track from an empty pose list")

    # A locked-off camera does not need a key per frame to say "it did not
    # move"; one key holds for the whole (still full-length) timeline.
    keyed = poses[:1] if is_static_solve(poses) else poses
    keyframes = [
        {
            "frame": int(pose.source_frame),
            "camera": pose_to_camera_payload(
                pose, fov=float(vertical_fov), near=NEAR_PLANE, far=FAR_PLANE
            ),
            "interpolation": KEY_INTERPOLATION,
        }
        for pose in keyed
    ]

    collected = list(warnings)
    if not is_static_solve(poses):
        collected.append(SCALE_WARNING)
    if intrinsics_source.startswith("auto_"):
        collected.append(AUTO_LENS_WARNING)

    payload = {
        "schema_version": 1,
        "fps": max(1, round(float(source_fps))),
        "duration_frames": max(1, int(duration_frames)),
        "width": int(width),
        "height": int(height),
        "render_mode": "omni_ref",
        "keyframes": keyframes,
        "objects": [],
        "metadata": {
            "source": SOURCE,
            "generator": "ComfyUI-Majoor-OmniCam",
            "backend": str(backend),
            "solver_coverage": round(float(confidence), 6),
            # Backward-compatible 0.x alias. Removing it would change saved
            # Extractor output semantics and requires a major slot migration.
            "confidence": round(float(confidence), 6),
            # Named, not implied: this is how healthy the solve was, not how
            # accurate the camera is in the world.
            "confidence_kind": "solver_coverage",
            "intrinsics_source": str(intrinsics_source),
            "monocular_scale": True,
            "motion_scale": float(motion_scale),
            "source_fps": float(source_fps),
            "source_frame_count": int(duration_frames),
            "sampled_frame_count": int(raw_key_count),
            "frame_step": max(1, int(frame_step)),
            "raw_key_count": int(raw_key_count),
            "simplified_key_count": len(keyframes),
            "static_solve": is_static_solve(poses),
            "warnings": list(dict.fromkeys(collected)),
        },
    }

    track = validate_track_payload(payload)
    stamp_fingerprint(track)
    # The canonical parser is the last word on the contract: if it cannot read
    # what we just wrote, the track is not shippable, whatever the validator said.
    OmniCamTrack.from_dict(track)
    return track


def build_report(track: dict[str, Any]) -> str:
    """A short human summary for the node's ``report`` output."""
    metadata = track.get("metadata", {})
    lines = [
        "OmniCam Extractor",
        f"backend: {metadata.get('backend', 'unknown')}",
        f"solved samples: {metadata.get('raw_key_count', 0)} "
        f"(frame_step {metadata.get('frame_step', 1)})",
        f"camera keys: {metadata.get('simplified_key_count', 0)}",
        f"timeline: {track.get('duration_frames', 0)} frames at {track.get('fps', 0)} fps",
        f"lens: {metadata.get('intrinsics_source', 'unknown')}",
        f"solver coverage: {float(metadata.get('solver_coverage', metadata.get('confidence', 0.0))):.0%}",
        f"motion scale: {metadata.get('motion_scale', 1.0)}",
    ]
    for warning in metadata.get("warnings", []):
        lines.append(f"! {warning}")
    return "\n".join(lines)
