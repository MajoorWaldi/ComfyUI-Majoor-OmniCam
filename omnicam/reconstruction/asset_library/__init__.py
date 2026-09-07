"""Blockout asset-library retrieval: swap fitted boxes for real GLB props."""

from __future__ import annotations

from .library import AssetLibrary, load_asset_library, resolve_library_root
from .resolver import MAX_ASSET_PLACEMENTS, resolve_placements
from .types import (
    KNOWN_ASSET_CATEGORIES,
    KNOWN_ASSET_FITS,
    AssetEntry,
    AssetPlacement,
)

__all__ = [
    "KNOWN_ASSET_CATEGORIES",
    "KNOWN_ASSET_FITS",
    "MAX_ASSET_PLACEMENTS",
    "AssetEntry",
    "AssetLibrary",
    "AssetPlacement",
    "load_asset_library",
    "resolve_library_root",
    "resolve_placements",
]
