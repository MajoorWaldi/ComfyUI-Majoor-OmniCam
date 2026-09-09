"""Turn a list of fitted blockout objects into asset placements.

A placement is resolved through the **unified asset catalog** when one is
supplied and it has a usable entry for the object's semantic class; otherwise
the legacy blockout :class:`AssetLibrary` resolves it. Either way the result is
an :class:`AssetPlacement` the compiler turns into a MotionScene ``glb`` object
(unified-assets design spec section 33).
"""

from __future__ import annotations

from typing import Any

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


def _resolve_via_catalog(
    catalog: Any, obj: BlockoutObject, input_root: Any = None
) -> AssetPlacement | None:
    """Try the unified catalog for one object. Returns ``None`` (so the caller
    falls back to the legacy library) when nothing matches or the matched
    asset's model file is missing."""
    try:
        from ...assets.reconstruction_bridge import (
            catalog_asset_file_exists,
            placement_from_definition,
            resolve_semantic_class,
        )
    except Exception:  # noqa: BLE001 - unified assets package unavailable
        return None
    semantic = obj.semantic_class or obj.label
    definition = resolve_semantic_class(catalog, semantic)
    if definition is None or not catalog_asset_file_exists(definition, input_root):
        return None
    return placement_from_definition(
        definition,
        position=obj.position,
        rotation=obj.rotation,
        size=obj.size,
        object_id=obj.object_id,
        semantic_class=semantic,
        confidence=obj.confidence,
    )


def resolve_placements(
    objects: list[BlockoutObject],
    library: AssetLibrary | None,
    *,
    catalog: Any | None = None,
    input_root: Any = None,
    max_placements: int = MAX_ASSET_PLACEMENTS,
    min_confidence: float = MIN_ASSET_CONFIDENCE,
) -> list[AssetPlacement]:
    """One placement per blockout object whose semantic class resolves (catalog
    first, then the legacy library) and whose confidence clears
    ``min_confidence``. Order follows ``objects`` (already confidence-sorted by
    the pipeline); the rest pass through with no asset."""
    floor = max(0.0, float(min_confidence))
    placements: list[AssetPlacement] = []
    for obj in objects:
        if len(placements) >= max(0, int(max_placements)):
            break
        if float(obj.confidence) < floor:
            continue
        placement = _resolve_via_catalog(catalog, obj, input_root) if catalog is not None else None
        if placement is None and library is not None:
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
