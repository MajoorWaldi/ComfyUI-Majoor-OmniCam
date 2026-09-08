"""Turn a list of fitted blockout objects into asset placements."""

from __future__ import annotations

from ..blockout.types import BlockoutObject
from .library import AssetLibrary
from .types import AssetPlacement

#: Hard ceiling so a pathological detection count cannot flood the scene with
#: GLB nodes (each one is a real draw call in the Director viewport).
MAX_ASSET_PLACEMENTS = 48
#: A faint grey blockout box for a shaky detection is tolerable; a fully modelled
#: GLB chair / plant for something that is not in the frame is not. Require a
#: detection to clear a higher bar before it is promoted to a real prop.
MIN_ASSET_CONFIDENCE = 0.55


def resolve_placements(
    objects: list[BlockoutObject],
    library: AssetLibrary,
    *,
    max_placements: int = MAX_ASSET_PLACEMENTS,
    min_confidence: float = MIN_ASSET_CONFIDENCE,
) -> list[AssetPlacement]:
    """One placement per blockout object whose semantic class is in the
    library, whose GLB exists, and whose confidence clears ``min_confidence``.
    Order follows ``objects`` (already confidence-sorted by the pipeline); the
    rest pass through with no asset (still visible as a plain blockout box)."""
    floor = max(0.0, float(min_confidence))
    placements: list[AssetPlacement] = []
    for obj in objects:
        if len(placements) >= max(0, int(max_placements)):
            break
        if float(obj.confidence) < floor:
            continue
        placement = library.resolve(
            obj.semantic_class or obj.label,
            position=obj.position,
            rotation=obj.rotation,
            size=obj.size,
            object_id=obj.object_id,
            confidence=obj.confidence,
        )
        if placement is not None:
            placements.append(placement)
    return placements
