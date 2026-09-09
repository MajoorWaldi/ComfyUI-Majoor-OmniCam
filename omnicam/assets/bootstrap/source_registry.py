"""Load and filter ``omnicam/assets/bootstrap_sources.json`` (plan section 6).

The registry is data, not code: it never stores a resolved ZIP URL, only the
official pack *page*. v1 accepts ``provider == "kenney"`` exclusively and every
page URL must be an ``https://kenney.nl/assets/...`` address -- Quaternius,
Mixamo and Poly Haven are intentionally absent (plan sections 2.2-2.4).
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

from .types import EXIT_SOURCE, BootstrapError

_REGISTRY_PATH = Path(__file__).resolve().parent.parent / "bootstrap_sources.json"

_ALLOWED_PROVIDERS = frozenset({"kenney"})
_KENNEY_HOSTS = frozenset({"kenney.nl", "www.kenney.nl"})
#: Every preset name a source row may advertise.
KNOWN_PRESETS = frozenset(
    {
        "starter",
        "characters",
        "characters-extra",
        "props",
        "vehicles",
        "environment",
        "environments-extra",
    }
)

#: The starter preset is a fixed, ordered set (plan section 3, extended). The
#: seven core kits give props / vehicles / environments; the three Animated
#: Characters packs supply the only Kenney rigs that satisfy
#: ``OMNICAM_HUMANOID_V1`` (they are FBX -- Blocky / Mini Characters carry only
#: a 7-bone stylised rig and are kept for animated proxy props).
STARTER_SOURCE_IDS: tuple[str, ...] = (
    "kenney.blocky_characters",
    "kenney.mini_characters",
    "kenney.furniture_kit",
    "kenney.car_kit",
    "kenney.nature_kit",
    "kenney.city_roads",
    "kenney.building_kit",
    "kenney.animated_survivors",
    "kenney.animated_protagonists",
    "kenney.animated_retro",
)


@dataclass(frozen=True, slots=True)
class SourceDefinition:
    id: str
    provider: str
    name: str
    page_url: str
    license: str
    kind_hint: str
    presets: tuple[str, ...]


def _fail(message: str) -> BootstrapError:
    return BootstrapError(message, exit_code=EXIT_SOURCE)


def _validate_kenney_page(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in _KENNEY_HOSTS:
        raise _fail(f"Kenney page URL must be https://kenney.nl/...: {url!r}")
    if not parsed.path.startswith("/assets/"):
        raise _fail(f"Kenney page URL must sit under /assets/: {url!r}")


def _parse_row(row: object) -> SourceDefinition:
    if not isinstance(row, dict):
        raise _fail("each source must be a JSON object")
    try:
        identifier = str(row["id"]).strip()
        provider = str(row["provider"]).strip().lower()
        name = str(row["name"]).strip()
        page_url = str(row["page_url"]).strip()
        license_id = str(row["license"]).strip()
        kind_hint = str(row["kind_hint"]).strip().lower()
        presets = tuple(str(p).strip() for p in row["presets"])
    except KeyError as exc:
        raise _fail(f"source row missing field {exc}") from exc

    if not identifier or not name or not license_id or not kind_hint:
        raise _fail(f"source row has an empty required field: {identifier or row!r}")
    if provider not in _ALLOWED_PROVIDERS:
        raise _fail(f"source {identifier!r}: provider {provider!r} is not supported in v1")
    if not presets:
        raise _fail(f"source {identifier!r}: at least one preset is required")
    unknown = set(presets) - KNOWN_PRESETS
    if unknown:
        raise _fail(f"source {identifier!r}: unknown preset(s) {sorted(unknown)}")
    _validate_kenney_page(page_url)
    return SourceDefinition(
        id=identifier,
        provider=provider,
        name=name,
        page_url=page_url,
        license=license_id,
        kind_hint=kind_hint,
        presets=presets,
    )


def load_source_registry(path: Path | str | None = None) -> tuple[SourceDefinition, ...]:
    """Parse the registry file (or ``path``) into validated, immutable rows."""
    registry_path = Path(path) if path is not None else _REGISTRY_PATH
    try:
        document = json.loads(registry_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise _fail(f"{registry_path}: {exc}") from exc
    if not isinstance(document, dict) or not isinstance(document.get("sources"), list):
        raise _fail(f"{registry_path}: expected {{'sources': [...]}}")

    rows = tuple(_parse_row(row) for row in document["sources"])
    seen: set[str] = set()
    for row in rows:
        if row.id in seen:
            raise _fail(f"duplicate source id {row.id!r}")
        seen.add(row.id)
    return rows


def select_sources(
    preset: str,
    source_ids: set[str] | None = None,
    *,
    registry: tuple[SourceDefinition, ...] | None = None,
) -> tuple[SourceDefinition, ...]:
    """Rows advertising ``preset``, optionally narrowed to ``source_ids``.

    ``starter`` is returned in its fixed contractual order (plan section 3);
    every other preset preserves registry file order.
    """
    if preset not in KNOWN_PRESETS:
        raise BootstrapError(
            f"unknown preset {preset!r}; expected one of {sorted(KNOWN_PRESETS)}",
            exit_code=EXIT_SOURCE,
        )
    rows = registry if registry is not None else load_source_registry()
    by_id = {row.id: row for row in rows}
    matching = [row for row in rows if preset in row.presets]

    if preset == "starter":
        missing = [sid for sid in STARTER_SOURCE_IDS if sid not in by_id]
        if missing:
            raise _fail(f"starter preset is missing source(s): {missing}")
        matching = [by_id[sid] for sid in STARTER_SOURCE_IDS]

    if source_ids is not None:
        unknown = source_ids - {row.id for row in matching}
        if unknown:
            raise _fail(
                f"--source {sorted(unknown)} not in preset {preset!r}"
            )
        matching = [row for row in matching if row.id in source_ids]

    if not matching:
        raise _fail(f"preset {preset!r} selected no sources")
    return tuple(matching)
