"""Deterministic starter-library curation (plan sections 4, 15).

Two selection kinds, both declared in ``omnicam/assets/starter_selection.json``:

* **exact** -- a known legacy-compatible stem (``chair``, ``table``, ``sedan``
  ...). Matched on a separator/case-insensitive *equality*, never a loose
  substring, so ``chairLeg`` can never stand in for ``chair`` (plan section 4.5).
* **dynamic** -- a bounded group: real rig-complete humanoids, or static GLBs
  whose normalized stem contains a prioritized keyword.

Selection never depends on ZIP iteration order: every group sorts by
``(triangle_count, normalized stem, member name)`` before taking its quota.
Character tags are copied verbatim from the group config -- the engine never
infers sex or gender from geometry (plan section 4.1).
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from ..types import default_category_for_kind
from .archive import ArchiveMember
from .glb_inspect import RigEvidence, build_rig_evidence
from .model_inspect import ModelInfo, model_format
from .types import EXIT_CURATION, BootstrapError

_SELECTION_PATH = Path(__file__).resolve().parent.parent / "starter_selection.json"
_NON_ALNUM = re.compile(r"[^a-z0-9]+")


def normalize_stem(text: str) -> str:
    """Lowercased, every non-alphanumeric character removed:
    ``light-square`` / ``City Kit (Roads)`` -> ``lightsquare`` / ``citykitroads``."""
    return _NON_ALNUM.sub("", str(text or "").lower())


@dataclass(frozen=True, slots=True)
class InspectedMember:
    member: ArchiveMember
    glb: ModelInfo  # GlbInfo or FbxInfo -- duck-typed, same fields


@dataclass(frozen=True, slots=True)
class SourceInventory:
    source_id: str
    page_url: str
    members: tuple[InspectedMember, ...]


@dataclass(frozen=True, slots=True)
class SelectedAsset:
    source_id: str
    member: ArchiveMember
    asset_id: str
    name: str
    kind: str
    category: str
    output: str
    base_size: tuple[float, float, float]
    fit: str
    tags: tuple[str, ...]
    glb: ModelInfo
    rig: RigEvidence | None = None
    model_format: str = "glb"
    emit_animations: bool = False


@dataclass(frozen=True, slots=True)
class SelectionResult:
    selected: tuple[SelectedAsset, ...]
    warnings: tuple[str, ...] = ()
    missing_required: tuple[str, ...] = ()

    @property
    def characters(self) -> tuple[SelectedAsset, ...]:
        return tuple(a for a in self.selected if a.kind == "character")

    @property
    def rigged_characters(self) -> tuple[SelectedAsset, ...]:
        return tuple(a for a in self.characters if a.rig is not None and a.rig.complete)


def load_selection_document(path: Path | str | None = None) -> dict:
    target = Path(path) if path is not None else _SELECTION_PATH
    try:
        document = json.loads(target.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise BootstrapError(f"{target}: {exc}", exit_code=EXIT_CURATION) from exc
    if not isinstance(document, dict):
        raise BootstrapError(f"{target}: expected a JSON object", exit_code=EXIT_CURATION)
    return document


def _dedupe_prefer_glb(members: tuple[InspectedMember, ...]) -> tuple[InspectedMember, ...]:
    """Kenney packs ship the same asset as both ``Models/GLB format/x.glb`` and
    ``Models/FBX format/x.fbx``. Keep one per normalized stem, preferring the
    self-contained GLB; FBX only wins when it is the sole format (the character
    packs)."""
    chosen: dict[str, InspectedMember] = {}
    order: list[str] = []
    for im in members:
        key = normalize_stem(im.member.stem)
        current = chosen.get(key)
        if current is None:
            chosen[key] = im
            order.append(key)
        elif model_format(im.member.name) == "glb" and model_format(current.member.name) != "glb":
            chosen[key] = im
    return tuple(chosen[k] for k in order)


def select_starter_assets(
    inventories: dict[str, SourceInventory],
    selection_document: dict,
) -> SelectionResult:
    inventories = {
        sid: SourceInventory(inv.source_id, inv.page_url, _dedupe_prefer_glb(inv.members))
        for sid, inv in inventories.items()
    }
    selected: list[SelectedAsset] = []
    warnings: list[str] = []
    missing_required: list[str] = []
    taken: dict[str, set[str]] = {}  # source_id -> member names already claimed

    for entry in selection_document.get("exact") or []:
        _pick_exact(entry, inventories, selected, warnings, missing_required, taken)
    for entry in selection_document.get("dynamic") or []:
        _pick_dynamic(entry, inventories, selected, warnings, taken)

    return SelectionResult(
        selected=tuple(selected),
        warnings=tuple(warnings),
        missing_required=tuple(missing_required),
    )


# -- exact ------------------------------------------------------------------

def _pick_exact(entry, inventories, selected, warnings, missing_required, taken) -> None:
    asset_id = str(entry["id"])
    source_id = str(entry["source"])
    required = bool(entry.get("required", True))
    inventory = inventories.get(source_id)
    if inventory is None:
        (missing_required if required else warnings).append(
            f"{asset_id}: source {source_id!r} not available"
        )
        return

    target = normalize_stem(entry["stem"])
    hits = [
        im for im in inventory.members
        if normalize_stem(im.member.stem) == target
    ]
    if not hits:
        message = f"{asset_id}: no exact source member for stem {entry['stem']!r}"
        (missing_required if required else warnings).append(message)
        return
    hits.sort(key=lambda im: (im.glb.triangle_count, im.member.name))
    chosen = hits[0]
    taken.setdefault(source_id, set()).add(chosen.member.name)

    kind = str(entry["kind"])
    selected.append(
        SelectedAsset(
            source_id=source_id,
            member=chosen.member,
            asset_id=asset_id,
            name=str(entry["name"]),
            kind=kind,
            category=str(entry.get("category") or default_category_for_kind(kind)),
            output=str(entry["output"]),
            base_size=_size(entry.get("base_size")),
            fit=str(entry.get("fit", "upright")),
            tags=tuple(str(t) for t in entry.get("tags") or []),
            glb=chosen.glb,
            rig=None,
            model_format=model_format(chosen.member.name),
        )
    )


# -- dynamic --------------------------------------------------------------

def _pick_dynamic(entry, inventories, selected, warnings, taken) -> None:
    source_id = str(entry["source"])
    group_id = str(entry.get("id", source_id))
    inventory = inventories.get(source_id)
    if inventory is None:
        warnings.append(f"{group_id}: source {source_id!r} not available")
        return

    claimed = taken.setdefault(source_id, set())
    available = [im for im in inventory.members if im.member.name not in claimed]
    mode = str(entry.get("select", "contains"))
    ranked = (
        _rank_characters(available, entry)
        if mode == "character"
        else _rank_contains(available, entry)
    )

    quota = int(entry.get("max", 0))
    if not ranked:
        warnings.append(f"{group_id}: no member matched")
        return
    if len(ranked) < quota:
        warnings.append(
            f"{group_id}: matched {len(ranked)} of {quota} requested"
        )

    kind = str(entry["kind"])
    category = str(entry.get("category") or default_category_for_kind(kind))
    base_tags = tuple(str(t) for t in entry.get("tags") or [])
    emit_anims = bool(entry.get("emit_animations", kind == "character"))
    for index, (_, chosen, evidence) in enumerate(ranked[:quota], start=1):
        claimed.add(chosen.member.name)
        suffix = f"{index:02d}"
        fmt = model_format(chosen.member.name)
        tags = base_tags
        if emit_anims and chosen.glb.animation_names and "animated" not in tags:
            tags = (*base_tags, "animated")
        selected.append(
            SelectedAsset(
                source_id=source_id,
                member=chosen.member,
                asset_id=f"{entry['id_prefix']}{suffix}",
                name=f"{entry.get('name_prefix', '')}{suffix}".strip(),
                kind=kind,
                category=category,
                output=f"{entry['output_prefix']}{suffix}.{fmt}",
                base_size=_size(entry.get("base_size")),
                fit=str(entry.get("fit", "upright")),
                tags=tags,
                glb=chosen.glb,
                rig=evidence,
                model_format=fmt,
                emit_animations=emit_anims,
            )
        )


def _rank_characters(members, entry):
    max_triangles = int(entry.get("max_triangles", 75_000))
    keywords = [normalize_stem(k) for k in entry.get("match_contains") or []]
    excludes = [normalize_stem(k) for k in entry.get("exclude_contains") or []]
    out = []
    for im in members:
        path = normalize_stem(im.member.name)
        if any(bad and bad in path for bad in excludes):
            continue
        if keywords and not any(kw and kw in path for kw in keywords):
            continue
        if not im.glb.has_skin or im.glb.triangle_count > max_triangles:
            continue
        evidence = build_rig_evidence(im.glb)
        if not evidence.complete:
            continue
        out.append(((im.glb.triangle_count, normalize_stem(im.member.stem), im.member.name), im, evidence))
    out.sort(key=lambda row: row[0])
    return out


def _rank_contains(members, entry):
    keywords = [normalize_stem(k) for k in entry.get("match_contains") or []]
    excludes = [normalize_stem(k) for k in entry.get("exclude_contains") or []]
    require_static = bool(entry.get("require_static", False))
    out = []
    for im in members:
        if require_static and im.glb.has_skin:
            continue
        name = normalize_stem(im.member.stem)
        if any(bad and bad in name for bad in excludes):
            continue
        priority = next(
            (i for i, kw in enumerate(keywords) if kw and kw in name), None
        )
        if priority is None:
            continue
        out.append(((priority, im.glb.triangle_count, im.member.name), im, None))
    out.sort(key=lambda row: row[0])
    return out


def _size(raw) -> tuple[float, float, float]:
    values = [float(v) for v in (raw or (1.0, 1.0, 1.0))][:3]
    while len(values) < 3:
        values.append(1.0)
    return (values[0], values[1], values[2])
