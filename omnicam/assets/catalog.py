"""Load and merge the unified asset catalog.

Three sources, in *rising* precedence (design spec section 8)::

    default definition   omnicam/assets/catalog.default.json  (shipped)
    legacy mapped entry  reconstruction blockout library      (read-only)
    user catalog         <input>/omnicam/library/catalog.json (writable)

A duplicate id *within one source* is a hard error. A row that shadows a
lower-precedence source is normal (that is how a user overrides a default).
Catalog responses are metadata only and paginated -- 100 default, 500 hard max
(design spec section 31).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .errors import AssetCatalogInvalidError, AssetNotFoundError
from .legacy_reconstruction import iter_legacy_definitions
from .storage import user_catalog_path
from .types import AssetDefinition
from .validation import validate_asset_definition

_DEFAULT_CATALOG_PATH = Path(__file__).with_name("catalog.default.json")

# -- bounds (design spec section 32) --------------------------------- #
MAX_CATALOG_ENTRIES = 5000
MAX_CATALOG_JSON_BYTES = 8 * 1024 * 1024
DEFAULT_PAGE_LIMIT = 100
MAX_PAGE_LIMIT = 500

#: Precedence order, lowest first. ``Catalog.load`` applies sources in this
#: order so a later source overwrites an earlier row with the same id.
_SOURCE_ORDER = ("default", "legacy", "user")


def _read_catalog_file(path: Path, *, source: str) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    try:
        size = path.stat().st_size
    except OSError as exc:
        raise AssetCatalogInvalidError(f"{path}: {exc}") from exc
    if size > MAX_CATALOG_JSON_BYTES:
        raise AssetCatalogInvalidError(
            f"{path}: catalog file exceeds {MAX_CATALOG_JSON_BYTES} bytes"
        )
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise AssetCatalogInvalidError(f"{path}: {exc}") from exc
    if not isinstance(document, dict):
        raise AssetCatalogInvalidError(f"{path}: top level must be an object")
    rows = document.get("assets")
    if rows is None:
        return []
    if not isinstance(rows, list):
        raise AssetCatalogInvalidError(f"{path}: 'assets' must be a list")
    for row in rows:
        if not isinstance(row, dict):
            raise AssetCatalogInvalidError(f"{path}: every asset entry must be an object")
    return rows


class Catalog:
    """An immutable, merged view of every catalog source."""

    __slots__ = ("_by_id", "_order")

    def __init__(self, definitions: dict[str, AssetDefinition], order: list[str]) -> None:
        self._by_id = definitions
        self._order = order

    # -- construction ------------------------------------------------ #
    @classmethod
    def load(
        cls,
        input_root: Path | str | None = None,
        *,
        include_legacy: bool = True,
    ) -> Catalog:
        raw: dict[str, list[dict[str, Any]] | list[AssetDefinition]] = {
            "default": _read_catalog_file(_DEFAULT_CATALOG_PATH, source="default"),
            "legacy": iter_legacy_definitions(input_root) if include_legacy else [],
            "user": _read_catalog_file(user_catalog_path(input_root), source="user"),
        }

        merged: dict[str, AssetDefinition] = {}
        order: list[str] = []
        for source in _SOURCE_ORDER:
            seen_in_source: set[str] = set()
            for item in raw[source]:
                definition = validate_asset_definition(item, source=source)
                if definition.id in seen_in_source:
                    raise AssetCatalogInvalidError(
                        f"duplicate asset id in {source} catalog: {definition.id!r}"
                    )
                seen_in_source.add(definition.id)
                if definition.id not in merged:
                    order.append(definition.id)
                merged[definition.id] = definition
        if len(merged) > MAX_CATALOG_ENTRIES:
            raise AssetCatalogInvalidError(
                f"catalog has {len(merged)} entries; the limit is {MAX_CATALOG_ENTRIES}"
            )
        return cls(merged, order)

    # -- reads ----------------------------------------------------- #
    def __len__(self) -> int:
        return len(self._by_id)

    def __contains__(self, asset_id: object) -> bool:
        return asset_id in self._by_id

    def ids(self) -> list[str]:
        return list(self._order)

    def get(self, asset_id: str) -> AssetDefinition:
        try:
            return self._by_id[asset_id]
        except KeyError:
            raise AssetNotFoundError(f"no asset with id {asset_id!r}") from None

    def find(self, asset_id: str) -> AssetDefinition | None:
        return self._by_id.get(asset_id)

    def all(self) -> list[AssetDefinition]:
        return [self._by_id[i] for i in self._order]

    def kinds(self) -> dict[str, int]:
        out: dict[str, int] = {}
        for definition in self._by_id.values():
            out[definition.kind] = out.get(definition.kind, 0) + 1
        return out

    def list(
        self,
        *,
        kind: str | None = None,
        tag: str | None = None,
        search: str | None = None,
        offset: int = 0,
        limit: int = DEFAULT_PAGE_LIMIT,
    ) -> dict[str, Any]:
        """A filtered, paginated page: ``{items, total, offset, limit}``.

        ``items`` are ``AssetDefinition.to_dict()`` payloads -- metadata only,
        never model bytes.
        """
        kind_f = (kind or "").strip().lower() or None
        tag_f = (tag or "").strip().lower() or None
        needle = (search or "").strip().lower() or None

        rows: list[AssetDefinition] = []
        for definition in self.all():
            if kind_f and definition.kind != kind_f:
                continue
            if tag_f and tag_f not in definition.tags:
                continue
            if needle and not _matches(definition, needle):
                continue
            rows.append(definition)

        total = len(rows)
        offset = max(0, int(offset))
        limit = max(1, min(int(limit), MAX_PAGE_LIMIT))
        page = rows[offset : offset + limit]
        return {
            "items": [definition.to_dict() for definition in page],
            "total": total,
            "offset": offset,
            "limit": limit,
        }


def _matches(definition: AssetDefinition, needle: str) -> bool:
    if needle in definition.id.lower() or needle in definition.name.lower():
        return True
    if needle in definition.kind or needle in definition.category:
        return True
    return any(needle in tag for tag in definition.tags)


def load_catalog(
    input_root: Path | str | None = None, *, include_legacy: bool = True
) -> Catalog:
    """Module-level convenience wrapper around :meth:`Catalog.load`."""
    return Catalog.load(input_root, include_legacy=include_legacy)
