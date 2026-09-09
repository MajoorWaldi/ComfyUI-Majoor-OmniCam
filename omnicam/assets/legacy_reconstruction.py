"""Read the reconstruction blockout library as a read-only catalog source.

The reconstruction ``asset_library`` package predates the unified catalog and
still owns the Kenney blockout manifest. Rather than duplicate or move it, the
unified catalog mounts it as a compatibility source at precedence
``user > legacy > default`` (design spec sections 8 and 33).

Only *factual* tags are carried over -- ``reconstruction`` plus the semantic
class -- never editorial roles like ``hero``. A legacy ``human`` entry becomes a
``prop`` here (a static posed mesh), not a ``character``: it has no rig
(design spec section 33).
"""

from __future__ import annotations

import re
from pathlib import Path

from .types import AnimationClip, AssetDefinition  # noqa: F401 (AnimationClip kept for parity)

_LEGACY_ID_PREFIX = "omnicam.legacy"
_SLUG_STRIP = re.compile(r"[^a-z0-9]+")

#: reconstruction category -> unified kind. ``human`` stays a prop (no rig).
_CATEGORY_KIND = {"interior": "prop", "exterior": "prop", "human": "prop"}
_CATEGORY_FOLDER = {"interior": "props", "exterior": "props", "human": "characters"}


def _legacy_slug(semantic_class: str) -> str:
    slug = _SLUG_STRIP.sub("_", str(semantic_class).strip().lower()).strip("_")
    return slug or "asset"


def legacy_asset_id(semantic_class: str) -> str:
    return f"{_LEGACY_ID_PREFIX}.{_legacy_slug(semantic_class)}"


def iter_legacy_definitions(input_root: Path | str | None = None) -> list[AssetDefinition]:
    """Every reconstruction library entry as an :class:`AssetDefinition`, or an
    empty list when that library is absent / unreadable. Never raises -- a
    missing blockout library must not break the unified catalog."""
    try:
        from ..reconstruction.asset_library import load_asset_library
    except Exception:  # noqa: BLE001 - reconstruction package is optional here
        return []
    try:
        library = load_asset_library(input_root=input_root)
    except Exception:  # noqa: BLE001 - a missing/invalid blockout lib is not fatal
        return []

    out: list[AssetDefinition] = []
    for entry in library.entries.values():
        candidates = entry.glb_candidates()
        rel = candidates[0] if candidates else ""
        if not rel:
            continue
        kind = _CATEGORY_KIND.get(entry.category, "prop")
        folder = _CATEGORY_FOLDER.get(entry.category, "props")
        tags = ["reconstruction", _legacy_slug(entry.semantic_class)]
        if entry.category == "human":
            tags.append("person")
        # ``file`` is the path *inside the reconstruction blockout library*, not
        # the unified tree. ``source == "legacy"`` tells the instantiate/resolve
        # layer (Phase 3/8) to load it from that root instead.
        definition = AssetDefinition(
            id=legacy_asset_id(entry.semantic_class),
            name=str(entry.semantic_class).replace("_", " ").title(),
            kind=kind,
            file=str(rel).replace("\\", "/"),
            format="glb",
            category=folder,
            base_size=tuple(float(v) for v in entry.base_size),  # type: ignore[arg-type]
            fit=entry.fit if entry.fit in {"stretch", "uniform", "upright"} else "upright",
            tags=tags,
            license={"spdx": entry.license or ""} if entry.license else {},
            source="legacy",
        )
        out.append(definition)
    return out
