"""Bounded completion policy: pick a few weak objects, fold in a completion."""

from __future__ import annotations

from typing import Any

import numpy as np

from ..blockout.masked_points import extract_masked_points
from ..blockout.types import BlockoutObject
from ..settings import ReconstructionSettings
from .alignment import merge_completion_into_blockout

_LOW_DEPTH_GATE = 0.55


def select_completion_objects(
    objects: list[BlockoutObject],
    settings: ReconstructionSettings,
    *,
    explicit_ids: list[str] | None = None,
) -> list[BlockoutObject]:
    policy = settings.completion_policy
    if policy == "off":
        return []
    if policy == "low_depth_confidence":
        candidates = [o for o in objects if o.axis_confidence.depth < _LOW_DEPTH_GATE]
    elif policy == "all_bounded":
        candidates = list(objects)
    elif policy == "selected":
        # Only explicit, validated ids -- never inferred from frontend state.
        ids = set(explicit_ids or [])
        candidates = [o for o in objects if o.object_id in ids]
    else:
        candidates = []
    return sorted(candidates, key=lambda o: o.axis_confidence.depth)[: settings.max_completion_objects]


def _instance_for(obj: BlockoutObject, instances: list[Any]) -> Any | None:
    wanted = set(obj.source_instance_ids)
    for inst in instances:
        if inst.instance_id in wanted:
            return inst
    return None


def apply_completion_policy(
    objects: list[BlockoutObject],
    *,
    evidence: Any,
    instances: list[Any],
    settings: ReconstructionSettings,
    provider: Any,
    cancel: Any | None = None,
    points: Any = None,
    completion_object_ids: list[str] | None = None,
) -> list[BlockoutObject]:
    """Return ``objects`` with the selected few folded through the provider.

    Order is preserved; unselected objects pass through untouched. A provider
    failure on one object is swallowed -- completion is best-effort polish.
    """
    caps = getattr(provider, "capabilities", lambda: None)()
    if caps is not None and not getattr(caps, "available", True):
        return objects

    selected = {
        o.object_id
        for o in select_completion_objects(objects, settings, explicit_ids=completion_object_ids)
    }
    if not selected:
        return objects

    image = getattr(evidence, "image", None)
    dense_points = points if points is not None else getattr(evidence, "points", None)

    out: list[BlockoutObject] = []
    for obj in objects:
        if obj.object_id not in selected:
            out.append(obj)
            continue
        inst = _instance_for(obj, instances)
        if inst is None or image is None:
            out.append(obj)
            continue
        try:
            completed = provider.complete(image, inst.mask, seed=abs(hash(obj.object_id)) % (2**31), cancel=cancel)
        except Exception:  # noqa: BLE001 - best-effort polish
            out.append(obj)
            continue

        measured = np.empty((0, 3), dtype=np.float32)
        if dense_points is not None:
            try:
                measured = extract_masked_points(dense_points, inst.mask, erode_pixels=1)
            except (ValueError, TypeError):
                measured = np.empty((0, 3), dtype=np.float32)

        out.append(merge_completion_into_blockout(obj, measured, np.asarray(completed.points_local)))
    return out
