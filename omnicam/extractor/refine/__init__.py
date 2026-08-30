"""Non-destructive correction of a finished camera solve."""

from __future__ import annotations

from .alignment import alignment_quaternion, apply_global_rotation, estimate_up_correction
from .pipeline import apply_spike_actions, apply_trim, build_refined_track, refine_poses
from .spikes import detect_pose_spikes
from .types import ANOMALY_KINDS, SPIKE_ACTIONS, PoseAnomaly, RefinementSettings

__all__ = [
    "ANOMALY_KINDS",
    "SPIKE_ACTIONS",
    "PoseAnomaly",
    "RefinementSettings",
    "alignment_quaternion",
    "apply_global_rotation",
    "apply_spike_actions",
    "apply_trim",
    "build_refined_track",
    "detect_pose_spikes",
    "estimate_up_correction",
    "refine_poses",
]
