"""Local restricted-licence character import (plan section 49).

Quaternius' *Universal Animation Library* and similar packs carry a full
humanoid rig Kenney cannot match, but the Quaternius Asset Licence v1.0
forbids automatic download / redistribution. So this path never touches the
network: the user downloads a pack themselves and points ``--character-dir`` at
the extracted folder. Every ``.glb`` / ``.fbx`` there is inspected with the same
skeleton reader the Kenney flow uses; only files whose real rig maps every
``OMNICAM_HUMANOID_V1`` joint are installed as a ``character``.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path

from .. import manifest
from ..rig import OMNICAM_HUMANOID_V1, rig_status
from ..storage import ensure_library_tree, resolve_library_root, resolve_within
from ..types import default_category_for_kind
from .fbx_inspect import inspect_fbx_bytes
from .glb_inspect import RigEvidence, build_rig_evidence, inspect_glb_stream
from .installer import InstalledAsset, animation_rows
from .model_inspect import ModelInfo
from .types import EXIT_INSTALL, MAX_MEMBER_BYTES, BootstrapError

_SLUG = re.compile(r"[^a-z0-9]+")
#: Local rigs are usually retarget bases -- a generous ceiling, not the 75k
#: previs limit of the Kenney curation.
MAX_LOCAL_CHARACTER_TRIANGLES = 400_000


def _fail(message: str) -> BootstrapError:
    return BootstrapError(message, exit_code=EXIT_INSTALL)


@dataclass(frozen=True, slots=True)
class LocalCharacter:
    path: Path
    model_format: str  # "glb" | "fbx"
    info: ModelInfo
    rig: RigEvidence
    asset_id: str
    name: str
    output: str


def _slugify(text: str) -> str:
    return _SLUG.sub("_", text.lower()).strip("_") or "character"


def _inspect_path(path: Path) -> tuple[str, ModelInfo]:
    if path.stat().st_size > MAX_MEMBER_BYTES:
        raise _fail(f"{path.name}: {path.stat().st_size} bytes exceeds {MAX_MEMBER_BYTES}")
    suffix = path.suffix.lower()
    if suffix == ".fbx":
        return "fbx", inspect_fbx_bytes(path.read_bytes())
    if suffix == ".glb":
        with path.open("rb") as handle:
            return "glb", inspect_glb_stream(handle, path.stat().st_size)
    raise _fail(f"{path.name}: only .glb and .fbx are supported (export that flavour)")


def scan_character_dir(
    directory: Path | str,
    *,
    id_prefix: str = "omnicam.character.",
    name_prefix: str = "",
    max_triangles: int = MAX_LOCAL_CHARACTER_TRIANGLES,
) -> tuple[tuple[LocalCharacter, ...], tuple[str, ...]]:
    """``(accepted, notes)`` -- every rig-complete ``.glb`` / ``.fbx`` under
    ``directory`` becomes a candidate; the rest are reported, never installed."""
    root = Path(directory)
    if not root.is_dir():
        raise BootstrapError(f"--character-dir is not a folder: {root}", exit_code=EXIT_INSTALL)

    files = sorted(
        p for p in root.rglob("*")
        if p.is_file() and p.suffix.lower() in (".glb", ".fbx")
    )
    accepted: list[LocalCharacter] = []
    notes: list[str] = []
    used_ids: set[str] = set()
    for path in files:
        try:
            model_format, info = _inspect_path(path)
        except BootstrapError as exc:
            notes.append(f"skip {path.name}: {exc}")
            continue
        if not info.has_skin:
            notes.append(f"skip {path.name}: no skin / bones")
            continue
        if info.triangle_count > max_triangles:
            notes.append(f"skip {path.name}: {info.triangle_count} triangles > {max_triangles}")
            continue
        evidence = build_rig_evidence(info)
        if not evidence.complete:
            notes.append(f"skip {path.name}: rig missing {list(evidence.missing)[:4]}")
            continue
        stem = _slugify(path.stem)
        asset_id = f"{id_prefix}{stem}"
        n = 2
        while asset_id in used_ids:
            asset_id = f"{id_prefix}{stem}_{n}"
            n += 1
        used_ids.add(asset_id)
        accepted.append(
            LocalCharacter(
                path=path,
                model_format=model_format,
                info=info,
                rig=evidence,
                asset_id=asset_id,
                name=f"{name_prefix}{path.stem}".strip() or path.stem,
                output=f"characters/{asset_id.rsplit('.', 1)[-1]}.{model_format}",
            )
        )
    return tuple(accepted), tuple(notes)


def _row(candidate: LocalCharacter, license_note: str, tags: tuple[str, ...]) -> dict:
    mapping = dict(candidate.rig.bone_map)
    row: dict = {
        "id": candidate.asset_id,
        "name": candidate.name,
        "kind": "character",
        "category": default_category_for_kind("character"),
        "file": candidate.output,
        "format": candidate.model_format,
        "base_size": [0.6, 1.8, 0.4],
        "fit": "upright",
        "tags": list(tags) + (["animated"] if candidate.info.animation_names else []),
        "rig": {
            "profile": OMNICAM_HUMANOID_V1,
            "root_bone": mapping.get("root", ""),
            "bone_map": mapping,
        },
        "license": {"source": license_note or "local import"},
    }
    if candidate.info.animation_names:
        row["animations"] = animation_rows(candidate.info.animation_names)
    return row


def install_local_characters(
    input_root: Path | str | None,
    candidates: tuple[LocalCharacter, ...],
    *,
    license_note: str = "",
    tags: tuple[str, ...] = ("human", "character", "proxy"),
    update: bool = False,
) -> list[InstalledAsset]:
    ensure_library_tree(input_root)
    root = resolve_library_root(input_root)
    installed: list[InstalledAsset] = []
    for candidate in candidates:
        destination = resolve_within(root, candidate.output)
        incoming_sha = _sha256_file(candidate.path)
        status = "installed"
        if destination.exists():
            if _sha256_file(destination) == incoming_sha:
                status = "reused"
            elif not update:
                installed.append(_result(candidate, incoming_sha, "conflict", registered=False))
                continue
            else:
                status = "replaced"
        if status != "reused":
            tmp = destination.with_name(destination.name + ".part")
            tmp.write_bytes(candidate.path.read_bytes())
            tmp.replace(destination)
        row = _row(candidate, license_note, tags)
        try:
            manifest.register_asset(input_root, row)
        except Exception as exc:
            if status == "installed":
                destination.unlink(missing_ok=True)
            raise _fail(f"{candidate.asset_id}: catalog registration failed: {exc}") from exc
        installed.append(_result(candidate, incoming_sha, status, registered=True))
    return installed


def _result(candidate: LocalCharacter, sha: str, status: str, *, registered: bool) -> InstalledAsset:
    row = _row(candidate, "", ())
    return InstalledAsset(
        asset_id=candidate.asset_id,
        output=candidate.output,
        sha256=sha,
        status=status,
        source_id="local",
        archive_member=candidate.path.name,
        rig_status=rig_status(row.get("rig")),
        animation_ids=tuple(clip["id"] for clip in row.get("animations", [])),
        catalog_registered=registered,
    )


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()
