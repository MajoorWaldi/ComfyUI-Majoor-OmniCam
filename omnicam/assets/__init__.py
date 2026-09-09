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
from .reconstruction_bridge import (
    catalog_asset_file_exists,
    placement_from_definition,
    resolve_semantic_class,
)
from .rig import (
    CANONICAL_JOINTS,
    OMNICAM_HUMANOID_V1,
    OPTIONAL_JOINTS,
    REQUIRED_JOINTS,
    auto_map_bones,
    missing_required_joints,
    normalize_bone_name,
    rig_is_complete,
    rig_status,
)
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
    "CANONICAL_JOINTS",
    "DEFAULT_PAGE_LIMIT",
    "LIBRARY_FOLDERS",
    "MAX_CATALOG_ENTRIES",
    "MAX_PAGE_LIMIT",
    "OMNICAM_HUMANOID_V1",
    "OPTIONAL_JOINTS",
    "REQUIRED_JOINTS",
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
    "auto_map_bones",
    "catalog_asset_file_exists",
    "ensure_library_tree",
    "iter_legacy_definitions",
    "legacy_asset_id",
    "load_catalog",
    "missing_required_joints",
    "normalize_bone_name",
    "placement_from_definition",
    "resolve_library_root",
    "resolve_semantic_class",
    "resolve_within",
    "rig_is_complete",
    "rig_status",
    "user_catalog_path",
    "validate_annotation",
    "validate_asset_definition",
    "validate_license",
    "validate_tags",
]
