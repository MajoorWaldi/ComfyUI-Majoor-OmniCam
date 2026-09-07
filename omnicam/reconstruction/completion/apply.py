"""Bounded completion policy: pick a few weak objects, fold in a completion."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np

from ..blockout.masked_points import extract_masked_points
from ..blockout.types import BlockoutObject
from ..settings import ReconstructionSettings
from .alignment import merge_completion_into_blockout

_LOW_DEPTH_GATE = 0.55


@dataclass(slots=True)
class CompletionOutcome:
    """What actually happened to the completion stage, for the summary + a
    user-visible warning. ``state`` is one of:

    ``disabled``   -- policy is off (or provider is 'none')
    ``unsupported``-- the provider reports unavailable, or the mode cannot run it
    ``no_targets`` -- nothing matched the policy (or 'selected' with no ids)
    ``failed``     -- every attempted object errored
    ``partial``    -- some applied, some errored / skipped
    ``applied``    -- every requested object completed
    """

    state: str = "disabled"
    requested: int = 0
    applied: int = 0
    reason: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "state": self.state,
            "requested": int(self.requested),
            "applied": int(self.applied),
            "reason": self.reason,
        }

    @property
    def warning(self) -> str | None:
        if self.state in ("applied", "disabled"):
            return None
        base = {
            "unsupported": "Completion was requested but is unavailable",
            "no_targets": "Completion policy matched no objects",
            "failed": "Completion failed for every requested object",
            "partial": f"Completion applied to {self.applied}/{self.requested} objects",
        }.get(self.state, "Completion did not run as requested")
        return f"{base}{f': {self.reason}' if self.reason else ''}"


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
) -> tuple[list[BlockoutObject], CompletionOutcome]:
    """Return ``(objects, outcome)``.

    Order is preserved; unselected objects pass through untouched. A provider
    failure on one object is caught, but -- unlike before -- it is *counted*, so
    the caller can tell ``disabled`` / ``unsupported`` / ``no_targets`` /
    ``failed`` / ``partial`` / ``applied`` apart and surface a warning.
    """
    if settings.completion_policy == "off":
        return objects, CompletionOutcome(state="disabled")

    caps = getattr(provider, "capabilities", lambda: None)()
    if provider is None or (caps is not None and not getattr(caps, "available", True)):
        return objects, CompletionOutcome(
            state="unsupported",
            reason=getattr(caps, "reason", "") or "no completion provider available",
        )

    explicit = list(completion_object_ids or getattr(settings, "completion_object_ids", ()) or ())
    selected_objs = select_completion_objects(objects, settings, explicit_ids=explicit)
    selected = {o.object_id for o in selected_objs}
    if not selected:
        reason = (
            "policy 'selected' but no completion_object_ids provided"
            if settings.completion_policy == "selected"
            else "no object matched the policy"
        )
        return objects, CompletionOutcome(state="no_targets", reason=reason)

    image = getattr(evidence, "image", None)
    dense_points = points if points is not None else getattr(evidence, "points", None)

    requested = len(selected)
    applied = 0
    errors = 0
    out: list[BlockoutObject] = []
    for obj in objects:
        if obj.object_id not in selected:
            out.append(obj)
            continue
        inst = _instance_for(obj, instances)
        if inst is None or image is None:
            errors += 1
            out.append(obj)
            continue
        try:
            completed = provider.complete(
                image, inst.mask, seed=abs(hash(obj.object_id)) % (2**31), cancel=cancel
            )
        except Exception:  # noqa: BLE001 - best-effort polish, but counted
            errors += 1
            out.append(obj)
            continue

        measured = np.empty((0, 3), dtype=np.float32)
        if dense_points is not None:
            try:
                measured = extract_masked_points(dense_points, inst.mask, erode_pixels=1)
            except (ValueError, TypeError):
                measured = np.empty((0, 3), dtype=np.float32)

        out.append(merge_completion_into_blockout(obj, measured, np.asarray(completed.points_local)))
        applied += 1

    if applied == 0:
        state = "failed"
    elif applied < requested:
        state = "partial"
    else:
        state = "applied"
    return out, CompletionOutcome(
        state=state, requested=requested, applied=applied,
        reason=f"{errors} object(s) could not be completed" if errors else "",
    )
