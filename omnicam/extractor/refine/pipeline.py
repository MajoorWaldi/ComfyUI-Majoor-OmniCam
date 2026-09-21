"""Deriving a refined camera from an immutable raw solve.

The contract that makes the whole panel work: **raw is never modified**. Every
slider, every spike action, every trim re-derives the refined track from the
same untouched pose list. That is what lets the user experiment without fear,
compare honestly, and reset to exactly what the solver said.

It also makes refinement cheap -- no decode, no solver, no GPU -- so a slider
drag can re-run the whole stack in milliseconds.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

from ..filters import (
    enforce_quaternion_continuity,
    simplify_pose_sequence,
    smooth_positions,
    smooth_rotations,
)
from ..track_builder import build_omnicam_track
from ..transforms import normalize_quaternion, quaternion_slerp, relative_to_first_pose, scale_positions
from ..types import PoseSample
from .alignment import apply_global_rotation, estimate_up_correction
from .horizon import stabilize_horizon
from .types import RefinementSettings


def _clone(pose: PoseSample) -> PoseSample:
    return PoseSample(
        source_frame=pose.source_frame,
        timestamp_seconds=pose.timestamp_seconds,
        position=[float(value) for value in pose.position],
        quaternion_xyzw=normalize_quaternion(pose.quaternion_xyzw),
        valid=pose.valid,
    )


def apply_spike_actions(
    poses: Sequence[PoseSample],
    actions: dict[int, str],
) -> list[PoseSample]:
    """Interpolate or drop the samples the user marked, leaving raw untouched.

    ``interpolate`` replaces a sample with the blend of its nearest *unmarked*
    neighbours -- lerp for position, SLERP for orientation -- so a run of bad
    frames is bridged rather than each one being repaired from the bad frame
    next to it.
    """
    if not actions:
        return [_clone(pose) for pose in poses]

    working = [_clone(pose) for pose in poses]
    marked = {
        index for index, pose in enumerate(working)
        if actions.get(int(pose.source_frame)) in {"interpolate", "exclude"}
    }

    # Precompute the nearest unmarked neighbour on each side in one forward
    # and one backward pass. The previous per-index backward/forward scan
    # was O(n) per marked sample, so a long contiguous marked run (a real
    # spike, or a bad tracking segment) made this whole function quadratic.
    count = len(working)
    nearest_before: list[int | None] = [None] * count
    last_unmarked: int | None = None
    for i in range(count):
        nearest_before[i] = last_unmarked
        if i not in marked:
            last_unmarked = i
    nearest_after: list[int | None] = [None] * count
    next_unmarked: int | None = None
    for i in range(count - 1, -1, -1):
        nearest_after[i] = next_unmarked
        if i not in marked:
            next_unmarked = i

    for index, pose in enumerate(working):
        if actions.get(int(pose.source_frame)) != "interpolate":
            continue
        before = nearest_before[index]
        after = nearest_after[index]
        if before is None and after is None:
            continue
        if before is None or after is None:
            donor = working[after if before is None else before]  # type: ignore[index]
            pose.position = [float(value) for value in donor.position]
            pose.quaternion_xyzw = list(donor.quaternion_xyzw)
            continue
        first, last = working[before], working[after]
        span = float(last.source_frame - first.source_frame)
        t = 0.5 if abs(span) < 1e-9 else (float(pose.source_frame - first.source_frame) / span)
        pose.position = [
            float(first.position[axis]) + (float(last.position[axis]) - float(first.position[axis])) * t
            for axis in range(3)
        ]
        pose.quaternion_xyzw = quaternion_slerp(first.quaternion_xyzw, last.quaternion_xyzw, t)

    return [
        pose for pose in working
        if actions.get(int(pose.source_frame)) != "exclude"
    ]


def apply_trim(
    poses: Sequence[PoseSample],
    start_frame: int,
    end_frame: int,
) -> list[PoseSample]:
    """Keep the inclusive source-frame window, or everything when it is empty."""
    start = max(0, int(start_frame))
    end = int(end_frame)
    trimmed = [
        pose for pose in poses
        if pose.source_frame >= start and (end <= 0 or pose.source_frame <= end)
    ]
    # A trim that would leave nothing solvable is treated as no trim at all
    # rather than as an error: the user is dragging a handle, not submitting.
    return trimmed if len(trimmed) >= 2 else [_clone(pose) for pose in poses]


def resolve_alignment(poses: Sequence[PoseSample], settings: RefinementSettings):
    """The world rotation to apply: the user's, or the estimate they asked for."""
    if settings.global_rotation_xyzw is not None:
        return settings.global_rotation_xyzw
    if settings.estimate_up:
        return estimate_up_correction(poses)
    return None


def refine_poses(
    raw_poses: Sequence[PoseSample],
    settings: RefinementSettings,
) -> list[PoseSample]:
    """Run the full correction stack. The input list is never mutated."""
    poses = apply_spike_actions(raw_poses, settings.spike_actions)
    poses = apply_trim(poses, settings.trim_start_frame, settings.trim_end_frame)
    if settings.normalize_origin:
        poses = relative_to_first_pose(poses)
    poses = apply_global_rotation(poses, resolve_alignment(poses, settings))
    poses = scale_positions(poses, settings.motion_scale)
    poses = stabilize_horizon(poses, settings.horizon_stabilization)
    poses = enforce_quaternion_continuity(poses)
    poses = smooth_positions(poses, settings.position_smoothing)
    poses = smooth_rotations(poses, settings.rotation_smoothing)
    if settings.simplify_keys:
        poses = simplify_pose_sequence(
            poses,
            position_tolerance=settings.position_tolerance,
            rotation_tolerance_deg=settings.rotation_tolerance_deg,
        )
    return poses


def build_refined_track(
    *,
    raw_poses: Sequence[PoseSample],
    settings: RefinementSettings,
    source_fps: float,
    duration_frames: int,
    width: int,
    height: int,
    vertical_fov: float,
    backend: str,
    confidence: float,
    frame_step: int,
    intrinsics_source: str,
    warnings: Sequence[str] = (),
    solve_health: Sequence[Any] | None = None,
) -> dict[str, Any]:
    """Refine and emit a validated, fingerprinted canonical track."""
    poses = refine_poses(raw_poses, settings)
    if not poses:
        raise ValueError("Refinement produced no camera poses")
    track = build_omnicam_track(
        poses=poses,
        source_fps=source_fps,
        duration_frames=max(int(duration_frames), poses[-1].source_frame + 1),
        width=width,
        height=height,
        vertical_fov=vertical_fov,
        backend=backend,
        confidence=confidence,
        frame_step=frame_step,
        intrinsics_source=intrinsics_source,
        motion_scale=settings.motion_scale,
        raw_key_count=len(raw_poses),
        warnings=warnings,
        solve_health=solve_health,
    )
    # Recorded so a reloaded panel can show the settings that produced the
    # track it is holding, rather than the defaults.
    resolved = resolve_alignment(poses, settings)
    track["metadata"]["refinement"] = {
        **settings.to_dict(),
        # An estimate is only meaningful if the user can see what it chose.
        "resolved_alignment": list(resolved) if resolved else None,
    }
    from ..fingerprint import stamp_fingerprint

    stamp_fingerprint(track)
    return track
