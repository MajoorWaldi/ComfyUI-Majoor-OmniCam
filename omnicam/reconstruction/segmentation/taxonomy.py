"""Default blockout taxonomy.

Kept deliberately small and scene-agnostic. SAM3 is open-vocabulary and will
force a match for *every* requested label -- ask it for "counter" or "cabinet"
on a night street scene and it hands back a shopfront at score 0.7. The default
set is therefore only the layout anchors and large occluders that matter for a
camera-motion blockout and that SAM3 detects reliably indoors *and* outdoors.
Narrow, indoor-only props (armchair, desk, cabinet, shelf, counter, monitor,
lamp, bottle, suitcase) are left out of the default -- a user targeting an
interior can still list them explicitly via ``semantic_labels``.
"""

from __future__ import annotations

DEFAULT_BLOCKOUT_LABELS: tuple[str, ...] = (
    "person",
    "car",
    "truck",
    "bicycle",
    "motorcycle",
    "chair",
    "sofa",
    "table",
    "bed",
    "door",
    "window",
    "television",
    "plant",
    "building",
    "tree",
)


def resolve_semantic_labels(labels: tuple[str, ...] | list[str] | None) -> list[str]:
    """User labels if any (de-duplicated, order preserved), else the default set."""
    if not labels:
        return list(DEFAULT_BLOCKOUT_LABELS)
    seen: set[str] = set()
    out: list[str] = []
    for raw in labels:
        label = str(raw).strip()
        key = label.lower()
        if not label or key in seen:
            continue
        seen.add(key)
        out.append(label)
    return out or list(DEFAULT_BLOCKOUT_LABELS)
