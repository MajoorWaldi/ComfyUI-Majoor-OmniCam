"""Resolve a reconstruction semantic class through the unified asset catalog.

    semantic class
      -> Unified Asset Catalog resolver   (resolve_semantic_class)
      -> AssetDefinition
      -> placement adapter                (placement_from_definition)
      -> AssetPlacement

The legacy blockout ``AssetLibrary`` stays a compatibility facade; this is the
delegation path the reconstruction resolver prefers when a catalog entry
matches (design spec section 33). Reconstructed placements carry only *factual*
tags -- ``reconstruction`` plus the semantic class -- and a detected ``person``
becomes ``asset_kind="character"`` only when the resolved catalog asset has a
valid ``OMNICAM_HUMANOID_V1`` rig.
"""

from __future__ import annotations

import re
from pathlib import Path

from .catalog import Catalog
from .storage import resolve_library_root
from .types import AssetDefinition

_SLUG = re.compile(r"[^a-z0-9]+")
_UNIFIED_PREFIX = "omnicam/library"
_LEGACY_PREFIX = "majoor_omnicam/blockout_library"
#: Semantic classes that describe a human figure.
_PERSON_CLASSES = frozenset({"person", "human", "man", "woman", "people", "pedestrian"})
_SOURCE_RANK = {"user": 0, "default": 1, "legacy": 2}


def _slug(text: str) -> str:
    return _SLUG.sub("_", str(text).strip().lower()).strip("_")


def resolve_semantic_class(catalog: Catalog, semantic_class: str) -> AssetDefinition | None:
    """Best catalog entry for a semantic class, or ``None``.

    Matches on a factual tag, a dotted-id suffix or a slugified name. A person
    class prefers a rigged character; otherwise the highest-precedence source
    wins (user > default > legacy).
    """
    slug = _slug(semantic_class)
    if not slug:
        return None
    person = slug in _PERSON_CLASSES

    matches: list[AssetDefinition] = []
    for definition in catalog.all():
        tags = {t for t in definition.tags}
        id_tail = definition.id.rsplit(".", 1)[-1]
        if slug in tags or id_tail == slug or _slug(definition.name) == slug:
            matches.append(definition)
    if not matches:
        return None

    def rank(definition: AssetDefinition) -> tuple[int, int, str]:
        wants_rig = person and definition.is_character and definition.has_rig
        return (_SOURCE_RANK.get(definition.source, 3), 0 if wants_rig else 1, definition.id)

    return sorted(matches, key=rank)[0]


def _asset_reference(definition: AssetDefinition) -> str:
    if not definition.file:
        return ""
    prefix = _LEGACY_PREFIX if definition.source == "legacy" else _UNIFIED_PREFIX
    return f"{prefix}/{definition.file} [input]"


def _factual_tags(definition: AssetDefinition, semantic_class: str) -> tuple[str, ...]:
    slug = _slug(semantic_class) or _slug(definition.name) or "asset"
    tags = ["reconstruction", slug]
    if slug in _PERSON_CLASSES or definition.is_character:
        tags.append("person")
    seen: set[str] = set()
    return tuple(t for t in tags if not (t in seen or seen.add(t)))


def _scale_for(
    fit: str,
    box: tuple[float, float, float],
    base_size: tuple[float, float, float],
) -> tuple[float, float, float]:
    """The blockout library's fit maths, reused so a catalog placement scales
    the same way a legacy one does."""
    from ..reconstruction.asset_library.library import AssetLibrary

    return AssetLibrary._scale_for(fit, box, base_size, 1.0)


def placement_from_definition(
    definition: AssetDefinition,
    *,
    position: tuple[float, float, float],
    rotation: tuple[float, float, float],
    size: tuple[float, float, float],
    object_id: str,
    semantic_class: str = "",
    confidence: float = 0.0,
):
    """Adapt one :class:`AssetDefinition` into an ``AssetPlacement``."""
    from ..reconstruction.asset_library.types import AssetPlacement

    box = tuple(max(1e-3, abs(float(v))) for v in size)  # type: ignore[assignment]
    fit = definition.fit if definition.fit in {"stretch", "uniform", "upright"} else "upright"
    scale = _scale_for(fit, box, definition.base_size)  # type: ignore[arg-type]

    rigged_character = definition.is_character and definition.has_rig
    asset_kind = "character" if rigged_character else ("prop" if definition.is_character else definition.kind)

    return AssetPlacement(
        source_object_id=str(object_id),
        semantic_class=semantic_class or definition.name,
        category=definition.category,
        asset_ref=_asset_reference(definition),
        position=tuple(float(v) for v in position),  # type: ignore[arg-type]
        rotation=(0.0, float(rotation[1]), 0.0),
        size=scale,
        pose="",
        confidence=float(confidence),
        tags=_factual_tags(definition, semantic_class),
        asset_id=definition.id,
        asset_kind=asset_kind,
    )


def catalog_asset_file_exists(definition: AssetDefinition, input_root: Path | str | None = None) -> bool:
    """Whether the resolved catalog asset's model file is on disk (design spec
    section 34 -- a missing file should let the legacy path win instead)."""
    if not definition.file:
        return definition.kind == "helper"
    if definition.source == "legacy":
        try:
            from ..reconstruction.asset_library.library import resolve_library_root as recon_root

            return (recon_root(input_root) / definition.file).is_file()
        except Exception:  # noqa: BLE001 - a probe failure is "not resolvable"
            return False
    return (resolve_library_root(input_root) / definition.file).is_file()
