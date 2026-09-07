"""Fold a generated completion into a measured blockout object -- bounded.

Completion is generated, not measured, so it may only touch a dimension the
measurement is weak on, and the confidence it can grant is capped.
"""

from __future__ import annotations

import numpy as np

from ..blockout.obb import fit_ground_relative_obb
from ..blockout.types import AxisConfidence, BlockoutObject

#: Above this per-axis confidence the measured value is authoritative.
KEEP_MEASURED_ABOVE = 0.65
#: Completion can never lift a per-axis confidence past this.
COMPLETION_CONFIDENCE_CAP = 0.80


def merge_completion_into_blockout(
    blockout: BlockoutObject,
    measured_points: np.ndarray,
    completed_points: np.ndarray,
) -> BlockoutObject:
    completed = np.asarray(completed_points, dtype=float)
    if len(completed) < 8:
        return blockout

    comp_obb = fit_ground_relative_obb(completed)
    comp_w = max(float(comp_obb.size[0]), 1e-6)
    comp_d = max(float(comp_obb.size[2]), 1e-6)
    depth_over_width = comp_d / comp_w

    ax = blockout.axis_confidence
    w, h, d = (float(v) for v in blockout.size)

    # Width / height: measured wins unless it was weak.
    if ax.width < KEEP_MEASURED_ABOVE:
        w = max(0.01, comp_w / max(comp_d, 1e-6) * d)
    if ax.height < KEEP_MEASURED_ABOVE:
        h = max(0.01, float(comp_obb.size[1]) / comp_w * w)

    # Depth: only replaced when the measurement was weak; scaled to the kept
    # width so proportions stay sane.
    new_depth = d
    depth_conf = ax.depth
    if ax.depth < KEEP_MEASURED_ABOVE:
        new_depth = max(0.01, depth_over_width * w)
        depth_conf = min(COMPLETION_CONFIDENCE_CAP, max(ax.depth, 0.6))

    # Yaw: measured wins unless weak; completion yaw is only a proxy so its
    # confidence is likewise capped.
    yaw = blockout.rotation[1]
    yaw_conf = ax.yaw
    if ax.yaw < KEEP_MEASURED_ABOVE:
        yaw = float(comp_obb.yaw_degrees)
        yaw_conf = min(COMPLETION_CONFIDENCE_CAP, max(ax.yaw, comp_obb.planar_anisotropy))

    new_axis = AxisConfidence(width=ax.width, height=ax.height, depth=depth_conf, yaw=yaw_conf)
    overall = 0.25 * (new_axis.width + new_axis.height + new_axis.depth + new_axis.yaw)

    return BlockoutObject(
        object_id=blockout.object_id,
        label=blockout.label,
        semantic_class=blockout.semantic_class,
        primitive=blockout.primitive,
        position=blockout.position,  # measured world centre kept
        rotation=(blockout.rotation[0], yaw, blockout.rotation[2]),
        size=(w, h, new_depth),
        confidence=float(max(0.0, min(1.0, overall))),
        axis_confidence=new_axis,
        source_instance_ids=list(blockout.source_instance_ids),
        completion_provider="sam3d_objects",
    )
