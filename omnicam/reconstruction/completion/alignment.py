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
#: The reliable measured axis used to resolve completion->world scale must be at
#: least this trustworthy; below it we fall back to a volumetric ratio.
MIN_SCALE_REFERENCE_CONFIDENCE = 0.45


def merge_completion_into_blockout(
    blockout: BlockoutObject,
    measured_points: np.ndarray,
    completed_points: np.ndarray,
) -> BlockoutObject:
    """Fold the *hidden* dimensions of a generated completion into a measured
    proxy.

    The completion lives in its own local frame (origin ~ centroid, arbitrary
    scale). We therefore:

      1. resolve one similarity factor from the most trustworthy MEASURED axis
         (or a volumetric ratio if none is trustworthy),
      2. rescale the completion box by it,
      3. overwrite ONLY the weak measured axes with the rescaled completion
         value, floored by what the measured points already prove,
      4. never touch the world yaw -- the completion's yaw is local and not
         comparable.
    """
    completed = np.asarray(completed_points, dtype=float)
    if len(completed) < 8:
        return blockout

    comp_obb = fit_ground_relative_obb(completed)
    comp = np.array([max(float(v), 1e-6) for v in comp_obb.size])  # (w, h, d) local

    ax = blockout.axis_confidence
    measured = np.array([float(v) for v in blockout.size])  # (w, h, d) world

    # 1. scale reference: the most confident measured axis, height preferred on a
    #    tie (it is the axis a single frontal view sees best).
    refs = [(ax.height, 1), (ax.width, 0), (ax.depth, 2)]
    best_conf, ref_axis = max(refs, key=lambda t: (t[0], t[1] == 1))
    if best_conf >= MIN_SCALE_REFERENCE_CONFIDENCE:
        scale = measured[ref_axis] / comp[ref_axis]
    else:
        scale = float(np.cbrt(np.prod(measured) / np.prod(comp)))
    scale = float(np.clip(scale, 1e-3, 1e3))
    comp_world = comp * scale  # completion box in world units

    # 2. measured extent floor: SAM3D fills hidden depth, it must never shrink a
    #    dimension below what the measured points already span.
    floor = np.zeros(3)
    m_pts = np.asarray(measured_points, dtype=float)
    if m_pts.ndim == 2 and len(m_pts) >= 8:
        m_obb = fit_ground_relative_obb(m_pts)
        floor = np.array([float(v) for v in m_obb.size])

    def _resolve(idx: int, conf: float) -> tuple[float, float]:
        if conf >= KEEP_MEASURED_ABOVE:
            return float(measured[idx]), conf
        value = max(0.01, float(comp_world[idx]), float(floor[idx]))
        return value, min(COMPLETION_CONFIDENCE_CAP, max(conf, 0.6))

    w, w_conf = _resolve(0, ax.width)
    h, h_conf = _resolve(1, ax.height)
    new_depth, depth_conf = _resolve(2, ax.depth)

    # 3. yaw is left exactly as measured -- the completion frame is not aligned
    #    to world, so its yaw cannot be substituted without an explicit
    #    registration step we do not have.
    new_axis = AxisConfidence(width=w_conf, height=h_conf, depth=depth_conf, yaw=ax.yaw)
    overall = 0.25 * (new_axis.width + new_axis.height + new_axis.depth + new_axis.yaw)

    return BlockoutObject(
        object_id=blockout.object_id,
        label=blockout.label,
        semantic_class=blockout.semantic_class,
        primitive=blockout.primitive,
        position=blockout.position,  # measured world centre kept
        rotation=blockout.rotation,  # measured world yaw kept
        size=(w, h, new_depth),
        confidence=float(max(0.0, min(1.0, overall))),
        axis_confidence=new_axis,
        source_instance_ids=list(blockout.source_instance_ids),
        completion_provider="sam3d_objects",
    )
