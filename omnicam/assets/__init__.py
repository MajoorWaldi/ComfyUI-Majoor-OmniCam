"""Unified OmniCam asset catalog: one semantic library for Director and
Reconstruction (design spec 2026-09-09).

Phase 1 ships the backend catalog only -- types, validation, storage layout,
the merged three-source loader and the read-only reconstruction adapter. Rig
mapping, pose library, thumbnail persistence and HTTP routes arrive in later
phases and will extend this package without changing these contracts.
"""

from __future__ import annotations

from .catalog import (
    DEFAULT_PAGE_LIMIT,
    MAX_CATALOG_ENTRIES,
    MAX_PAGE_LIMIT,
    Catalog,
    load_catalog,
)
from .errors import (
    AnnotationInvalidError,
    AssetCatalogInvalidError,
    AssetError,
    AssetFileInvalidError,
    AssetFileMissingError,
    AssetLicenseInvalidError,
    AssetNotFoundError,
    TagInvalidError,
    TagLimitExceededError,
)
from .legacy_reconstruction import iter_legacy_definitions, legacy_asset_id
from .storage import (
    LIBRARY_FOLDERS,
    ensure_library_tree,
    resolve_library_root,
    resolve_within,
    user_catalog_path,
)
from .types import (
    ASSET_CATEGORIES,
    ASSET_DEFINITION_VERSION,
    ASSET_FITS,
    ASSET_FORMATS,
    ASSET_KINDS,
    AnimationClip,
    AssetDefinition,
    RigBinding,
)
from .validation import (
    validate_annotation,
    validate_asset_definition,
    validate_license,
    validate_tags,
)

__all__ = [
    "ASSET_CATEGORIES",
    "ASSET_DEFINITION_VERSION",
    "ASSET_FITS",
    "ASSET_FORMATS",
    "ASSET_KINDS",
    "DEFAULT_PAGE_LIMIT",
    "LIBRARY_FOLDERS",
    "MAX_CATALOG_ENTRIES",
    "MAX_PAGE_LIMIT",
    "AnimationClip",
    "AnnotationInvalidError",
    "AssetCatalogInvalidError",
    "AssetDefinition",
    "AssetError",
    "AssetFileInvalidError",
    "AssetFileMissingError",
    "AssetLicenseInvalidError",
    "AssetNotFoundError",
    "Catalog",
    "RigBinding",
    "TagInvalidError",
    "TagLimitExceededError",
    "ensure_library_tree",
    "iter_legacy_definitions",
    "legacy_asset_id",
    "load_catalog",
    "resolve_library_root",
    "resolve_within",
    "user_catalog_path",
    "validate_annotation",
    "validate_asset_definition",
    "validate_license",
    "validate_tags",
]
