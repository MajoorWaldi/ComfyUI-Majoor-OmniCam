"""Deterministic ``InstanceEvidence`` -> ``BlockoutObject`` fitting.

Every step is a pure function of its inputs plus an explicit ``seed``: the same
evidence always produces the same proxy, so a cached blockout is reproducible
and a diff in Director review is meaningful.
"""

from __future__ import annotations

import re
from typing import Any

from .masked_points import extract_masked_points
from .obb import fit_ground_relative_obb
from .primitive_resolver import rule_for_label
from .types import AxisConfidence, BlockoutObject, InstanceEvidence

#: Fewer clean samples than this and the fit is not trustworthy enough to emit.
MIN_VALID_SAMPLES = 20
#: Ground snapping only kicks in for a confidently detected floor.
GROUND_SNAP_MIN_CONFIDENCE = 0.60
#: No proxy dimension may be thinner than this (metres, pre scene_scale).
MIN_SIZE_COMPONENT = 0.01
MAX_OBJECT_ID_LEN = 80

_ID_SANITIZE = re.compile(r"[^A-Za-z0-9_-]+")


def _sanitize_id(raw: str) -> str:
    cleaned = _ID_SANITIZE.sub("_", str(raw)).strip("_")
    if not cleaned:
        cleaned = "object"
    return cleaned[:MAX_OBJECT_ID_LEN]


def _seed_int(seed: int | str) -> int:
    if isinstance(seed, int):
        return seed
    return int.from_bytes(str(seed).encode("utf-8"), "little", signed=False) % (2**32)


def fit_blockout_object(
    instance: InstanceEvidence,
    points: Any,
    *,
    ground: Any | None,
    scene_scale: float,
    seed: int | str,
) -> BlockoutObject | None:
    """Fit one closed primitive, or return ``None`` if the evidence is too thin.

    ``points`` is the provider's dense ``(H, W, 3)`` point map (unscaled).
    ``ground`` is an already-scene-scaled ``ReconstructedPlane`` or ``None``.
    """
    rule = rule_for_label(instance.label)
    sample = extract_masked_points(
        points,
        instance.mask,
        max_points=20_000,
        erode_pixels=1,
        seed=_seed_int(seed),
    )
    if len(sample) < MIN_VALID_SAMPLES:
        return None

    obb = fit_ground_relative_obb(sample)

    scale = float(scene_scale) if scene_scale and scene_scale > 0 else 1.0
    width = float(obb.size[0]) * scale
    height = float(obb.size[1]) * scale
    observed_depth = float(obb.size[2]) * scale
    center = obb.center * scale

    # 4. Semantic minimum depth: floor a near-flat observation to a plausible
    #    proxy thickness relative to the larger footprint extent.
    footprint = max(width, observed_depth, 1e-6)
    resolved_depth = max(observed_depth, rule.min_depth_factor * footprint)

    # 7. Clamp.
    width = max(width, MIN_SIZE_COMPONENT)
    height = max(height, MIN_SIZE_COMPONENT)
    resolved_depth = max(resolved_depth, MIN_SIZE_COMPONENT)

    # 5. Axis confidence -- exact formula, pinned by tests so it cannot drift.
    depth_ratio = min(1.0, observed_depth / max(resolved_depth, 1e-6))
    yaw_conf = min(1.0, max(0.0, obb.planar_anisotropy))
    score = float(max(0.0, min(1.0, instance.score)))
    axis = AxisConfidence(
        width=min(1.0, score * 1.05),
        height=min(1.0, score * 1.05),
        depth=min(score, depth_ratio),
        yaw=min(score, yaw_conf),
    )
    overall = 0.25 * (axis.width + axis.height + axis.depth + axis.yaw)

    # 6. Ground snap.
    pos_x = float(center[0])
    pos_y = float(center[1])
    pos_z = float(center[2])
    ground_conf = float(getattr(ground, "confidence", 0.0)) if ground is not None else 0.0
    if ground is not None and rule.snap_to_ground and ground_conf >= GROUND_SNAP_MIN_CONFIDENCE:
        ground_y = float(ground.center[1])
        pos_y = ground_y + 0.5 * height

    return BlockoutObject(
        object_id=_sanitize_id(instance.instance_id),
        label=instance.label,
        semantic_class=str(instance.label).strip().lower()[:64],
        primitive=rule.primitive,
        position=(pos_x, pos_y, pos_z),
        rotation=(0.0, float(obb.yaw_degrees), 0.0),
        size=(width, height, resolved_depth),
        confidence=float(max(0.0, min(1.0, overall))),
        axis_confidence=axis,
        source_instance_ids=[str(instance.instance_id)],
    )
