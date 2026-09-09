"""Install one curated asset into the unified library as a transaction.

    validate GLB -> copy to a temp sibling -> atomic replace -> register the
    catalog row via ``manifest.register_asset`` -> record the output SHA-256

If catalog registration fails after the file is in place the new file is
removed (or a pre-existing file restored from a ``.bak`` sibling), so a failed
install never leaves an orphan file or a half-written catalog (plan sections
16-18). Existing files are never replaced unless ``update=True``.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .. import manifest
from ..rig import OMNICAM_HUMANOID_V1, rig_status
from ..storage import ensure_library_tree, resolve_library_root, resolve_within
from .archive import copy_member
from .curation import SelectedAsset
from .glb_inspect import inspect_glb_member
from .types import EXIT_INSTALL, BootstrapError

#: Clip-name tokens that carry a safe, well-known semantic tag (plan section 14).
_KNOWN_CLIP_TAGS = frozenset(
    {"idle", "walk", "run", "jog", "jump", "sit", "stand", "wave"}
)
_SLUG_SPLIT = re.compile(r"[^a-z0-9]+")


def _fail(message: str) -> BootstrapError:
    return BootstrapError(message, exit_code=EXIT_INSTALL)


@dataclass(frozen=True, slots=True)
class InstalledAsset:
    asset_id: str
    output: str
    sha256: str
    status: str  # "installed" | "reused" | "replaced" | "conflict"
    source_id: str
    archive_member: str
    rig_status: str  # "rigged" | "incomplete" | "none"
    animation_ids: tuple[str, ...]
    catalog_registered: bool


def slugify_clip(name: str, index: int) -> str:
    slug = _SLUG_SPLIT.sub("-", str(name or "").lower()).strip("-")
    return slug or f"clip_{index + 1:02d}"


def animation_rows(animation_names: tuple[str, ...]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, name in enumerate(animation_names):
        clip_id = slugify_clip(name, index)
        while clip_id in seen:
            clip_id = f"{clip_id}-{index + 1}"
        seen.add(clip_id)
        tokens = set(_SLUG_SPLIT.split(name.lower())) | {clip_id}
        tags = sorted(tokens & _KNOWN_CLIP_TAGS)
        rows.append({"id": clip_id, "name": name or clip_id, "clip": name or clip_id, "tags": tags})
    return rows


def _catalog_row(selected: SelectedAsset, source_page_url: str) -> dict[str, Any]:
    tags = list(selected.tags)
    if "kenney" not in tags:
        tags.append("kenney")
    row: dict[str, Any] = {
        "id": selected.asset_id,
        "name": selected.name,
        "kind": selected.kind,
        "category": selected.category,
        "file": selected.output,
        "format": "glb",
        "base_size": list(selected.base_size),
        "fit": selected.fit,
        "tags": tags,
        "license": {"spdx": "CC0-1.0", "source": source_page_url},
    }
    if selected.kind == "character" and selected.rig is not None and selected.rig.complete:
        mapping = dict(selected.rig.bone_map)
        row["rig"] = {
            "profile": OMNICAM_HUMANOID_V1,
            "root_bone": mapping.get("root", ""),
            "bone_map": mapping,
        }
        row["animations"] = animation_rows(selected.glb.animation_names)
    return row


def install_selected_asset(
    input_root: Path | str,
    selected: SelectedAsset,
    *,
    update: bool,
    source_page_url: str,
) -> InstalledAsset:
    ensure_library_tree(input_root)
    root = resolve_library_root(input_root)
    destination = resolve_within(root, selected.output)

    # 1. re-validate the real GLB before it enters the library.
    info = inspect_glb_member(selected.member)
    if info.version != 2:
        raise _fail(f"{selected.asset_id}: member is not GLB v2")

    row = _catalog_row(selected, source_page_url)
    computed_status = rig_status(row.get("rig"))
    anim_ids = tuple(clip["id"] for clip in row.get("animations", []))

    def _result(sha: str, status: str, registered: bool) -> InstalledAsset:
        return InstalledAsset(
            asset_id=selected.asset_id,
            output=selected.output,
            sha256=sha,
            status=status,
            source_id=selected.source_id,
            archive_member=selected.member.name,
            rig_status=computed_status,
            animation_ids=anim_ids,
            catalog_registered=registered,
        )

    tmp = destination.with_name(destination.name + ".part")
    _, incoming_sha = copy_member(selected.member, tmp)

    if destination.exists():
        existing_sha = _sha256_file(destination)
        if existing_sha == incoming_sha:
            tmp.unlink(missing_ok=True)
            manifest.register_asset(input_root, row)
            return _result(existing_sha, "reused", True)
        if not update:
            tmp.unlink(missing_ok=True)
            return _result(existing_sha, "conflict", False)
        backup = destination.with_name(destination.name + ".bak")
        destination.replace(backup)
        tmp.replace(destination)
        try:
            manifest.register_asset(input_root, row)
        except Exception as exc:
            destination.unlink(missing_ok=True)
            backup.replace(destination)
            raise _fail(
                f"{selected.asset_id}: catalog registration failed; restored previous file"
            ) from exc
        backup.unlink(missing_ok=True)
        return _result(incoming_sha, "replaced", True)

    tmp.replace(destination)
    try:
        manifest.register_asset(input_root, row)
    except Exception as exc:
        destination.unlink(missing_ok=True)
        raise _fail(
            f"{selected.asset_id}: catalog registration failed; removed new file"
        ) from exc
    return _result(incoming_sha, "installed", True)


def _sha256_file(path: Path) -> str:
    import hashlib

    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()
