"""Default interior blockout taxonomy."""

from __future__ import annotations

DEFAULT_BLOCKOUT_LABELS: tuple[str, ...] = (
    "person",
    "chair",
    "armchair",
    "sofa",
    "table",
    "desk",
    "bed",
    "cabinet",
    "shelf",
    "counter",
    "door",
    "window",
    "television",
    "monitor",
    "lamp",
    "plant",
    "bottle",
    "box",
    "suitcase",
    "car",
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
