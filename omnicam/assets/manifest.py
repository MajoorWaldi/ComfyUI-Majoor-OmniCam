"""Safe read / write of the writable user catalog (``<library>/catalog.json``).

The default catalog (shipped) and the legacy reconstruction source are
read-only. Every mutation -- register, patch, delete -- lands in the user
catalog file, written atomically and re-validated as a whole so a bad edit can
never leave a broken catalog on disk (design spec sections 8 and 17).

Patching a row that currently comes from ``default`` / ``legacy`` copies it
into the user catalog first (copy-on-write), so the built-in sources are never
touched.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .catalog import (
    MAX_CATALOG_ENTRIES,
    MAX_CATALOG_JSON_BYTES,
    load_catalog,
)
from .errors import AssetCatalogInvalidError, AssetError, AssetNotFoundError
from .storage import asset_file_path, ensure_library_tree, user_catalog_path
from .types import AssetDefinition
from .validation import validate_asset_definition

#: Fields a PATCH body may change. ``id`` is immutable; ``source`` is derived.
_PATCHABLE = frozenset(
    {"name", "kind", "category", "file", "format", "base_size", "fit", "tags",
     "thumbnail", "rig", "animations", "license"}
)


def _read_rows(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    if path.stat().st_size > MAX_CATALOG_JSON_BYTES:
        raise AssetCatalogInvalidError(f"{path}: user catalog exceeds {MAX_CATALOG_JSON_BYTES} bytes")
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise AssetCatalogInvalidError(f"{path}: {exc}") from exc
    if not isinstance(document, dict) or not isinstance(document.get("assets", []), list):
        raise AssetCatalogInvalidError(f"{path}: expected {{'assets': [...]}}")
    return [row for row in document.get("assets", []) if isinstance(row, dict)]


def read_user_catalog(input_root: Path | str | None = None) -> list[dict[str, Any]]:
    return _read_rows(user_catalog_path(input_root))


def _write_rows(input_root: Path | str | None, rows: list[dict[str, Any]]) -> None:
    """Validate every row, then atomically replace ``catalog.json``."""
    if len(rows) > MAX_CATALOG_ENTRIES:
        raise AssetCatalogInvalidError(f"user catalog would hold {len(rows)} entries (max {MAX_CATALOG_ENTRIES})")
    seen: set[str] = set()
    clean: list[dict[str, Any]] = []
    for row in rows:
        definition = validate_asset_definition(row, source="user")
        if definition.id in seen:
            raise AssetCatalogInvalidError(f"duplicate asset id in user catalog: {definition.id!r}")
        seen.add(definition.id)
        clean.append(_row_without_derived(definition))
    payload = json.dumps({"version": 2, "assets": clean}, ensure_ascii=False, indent=2).encode("utf-8")
    if len(payload) > MAX_CATALOG_JSON_BYTES:
        raise AssetCatalogInvalidError(f"user catalog would exceed {MAX_CATALOG_JSON_BYTES} bytes")
    ensure_library_tree(input_root)
    path = user_catalog_path(input_root)
    tmp = path.with_suffix(".json.tmp")
    tmp.write_bytes(payload)
    tmp.replace(path)


def _row_without_derived(definition: AssetDefinition) -> dict[str, Any]:
    row = definition.to_dict()
    row.pop("source", None)
    return row


def register_asset(
    input_root: Path | str | None, definition: dict[str, Any]
) -> AssetDefinition:
    """Add or replace a user-catalog row by id. Returns the validated row."""
    validated = validate_asset_definition(definition, source="user")
    rows = read_user_catalog(input_root)
    rows = [row for row in rows if str(row.get("id")) != validated.id]
    rows.append(_row_without_derived(validated))
    _write_rows(input_root, rows)
    return validated


def patch_asset(
    input_root: Path | str | None, asset_id: str, patch: dict[str, Any]
) -> AssetDefinition:
    """Merge ``patch`` into the row for ``asset_id`` (copy-on-write from a
    built-in source if needed)."""
    unknown = set(patch) - _PATCHABLE
    if unknown:
        raise AssetCatalogInvalidError(f"cannot patch fields: {sorted(unknown)}")
    catalog = load_catalog(input_root)
    current = catalog.find(asset_id)
    if current is None:
        raise AssetNotFoundError(f"no asset with id {asset_id!r}")
    merged = _row_without_derived(current)
    merged.update(patch)
    merged["id"] = asset_id
    return register_asset(input_root, merged)


def delete_asset(input_root: Path | str | None, asset_id: str) -> None:
    """Remove ``asset_id`` from the user catalog. A built-in (default/legacy)
    id that has no user row cannot be deleted."""
    rows = read_user_catalog(input_root)
    kept = [row for row in rows if str(row.get("id")) != asset_id]
    if len(kept) == len(rows):
        catalog = load_catalog(input_root)
        if catalog.find(asset_id) is None:
            raise AssetNotFoundError(f"no asset with id {asset_id!r}")
        raise AssetError(
            f"asset {asset_id!r} is a built-in and cannot be deleted; register an override instead",
            code="ASSET_CATALOG_INVALID",
        )
    _write_rows(input_root, kept)


def prune_missing_assets(input_root: Path | str | None) -> list[str]:
    """Drop every user-catalog row whose managed ``file`` is not on disk.

    Returns the ids removed. Rows for a built-in kind that legitimately has no
    file (``helper``) are kept. Nothing is written when every row resolves.
    """
    rows = read_user_catalog(input_root)
    removed: list[str] = []
    kept: list[dict[str, Any]] = []
    for row in rows:
        relative = str(row.get("file") or "")
        if str(row.get("kind")) == "helper" and not relative:
            kept.append(row)
            continue
        try:
            present = bool(relative) and asset_file_path(relative, input_root).is_file()
        except AssetError:
            present = False
        if present:
            kept.append(row)
        else:
            removed.append(str(row.get("id")))
    if removed:
        _write_rows(input_root, kept)
    return removed
