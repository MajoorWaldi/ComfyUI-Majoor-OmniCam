"""Provenance / reproducibility lock for an installed starter library.

``<input>/omnicam/library/.bootstrap/library.lock.json`` records, per source,
the resolved archive URL + SHA-256, and per asset the output file hash, origin
archive member and rig status (plan section 19). :func:`verify_lockfile` walks
it offline and reports drift: a rewritten GLB, a deleted file, a missing
catalog row.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from ..manifest import read_user_catalog
from ..storage import ensure_library_tree, resolve_library_root, resolve_within
from .installer import InstalledAsset, _sha256_file
from .types import BOOTSTRAP_VERSION, EXIT_VERIFY, BootstrapError

LOCK_RELATIVE = Path(".bootstrap") / "library.lock.json"


@dataclass(frozen=True, slots=True)
class LockSource:
    page_url: str
    resolved_archive_url: str
    archive_sha256: str
    license: str


@dataclass(frozen=True, slots=True)
class VerifyIssue:
    asset_id: str
    kind: str  # "missing-file" | "hash-mismatch" | "missing-catalog-row"
    detail: str


@dataclass(frozen=True, slots=True)
class VerifyResult:
    ok: bool
    issues: tuple[VerifyIssue, ...]
    checked: int


def lock_path(input_root: Path | str | None) -> Path:
    return resolve_library_root(input_root) / LOCK_RELATIVE


def build_lock_document(
    sources: dict[str, LockSource],
    installed: list[InstalledAsset],
    *,
    generated_at: str | None = None,
) -> dict:
    return {
        "version": 1,
        "generated_at": generated_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "bootstrap_version": BOOTSTRAP_VERSION,
        "sources": {
            source_id: {
                "page_url": source.page_url,
                "resolved_archive_url": source.resolved_archive_url,
                "archive_sha256": source.archive_sha256,
                "license": source.license,
            }
            for source_id, source in sorted(sources.items())
        },
        "assets": {
            asset.asset_id: {
                "file": asset.output,
                "sha256": asset.sha256,
                "source": asset.source_id,
                "archive_member": asset.archive_member,
                "rig_status": asset.rig_status,
            }
            for asset in sorted(installed, key=lambda a: a.asset_id)
            if asset.status != "conflict"
        },
    }


def merge_assets_into_lockfile(
    input_root: Path | str | None,
    installed: list[InstalledAsset],
    *,
    source_id: str = "local",
    lock_source: LockSource | None = None,
) -> Path:
    """Add ``installed`` (and optionally one ``lock_source``) to the existing
    lockfile without disturbing the rest -- used by the offline
    ``--character-dir`` import so it does not clobber the Kenney provenance."""
    ensure_library_tree(input_root)
    path = lock_path(input_root)
    try:
        document = load_lockfile(input_root)
    except BootstrapError:
        document = build_lock_document({}, [])
    document["generated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    if lock_source is not None:
        document.setdefault("sources", {})[source_id] = {
            "page_url": lock_source.page_url,
            "resolved_archive_url": lock_source.resolved_archive_url,
            "archive_sha256": lock_source.archive_sha256,
            "license": lock_source.license,
        }
    assets = document.setdefault("assets", {})
    for asset in installed:
        if asset.status == "conflict":
            continue
        assets[asset.asset_id] = {
            "file": asset.output,
            "sha256": asset.sha256,
            "source": asset.source_id,
            "archive_member": asset.archive_member,
            "rig_status": asset.rig_status,
        }
    path.parent.mkdir(parents=True, exist_ok=True)
    _atomic_json(path, document)
    return path


def write_lockfile(
    input_root: Path | str | None,
    sources: dict[str, LockSource],
    installed: list[InstalledAsset],
    *,
    generated_at: str | None = None,
) -> Path:
    ensure_library_tree(input_root)
    path = lock_path(input_root)
    path.parent.mkdir(parents=True, exist_ok=True)
    document = build_lock_document(sources, installed, generated_at=generated_at)
    _atomic_json(path, document)
    return path


def load_lockfile(input_root: Path | str | None) -> dict:
    path = lock_path(input_root)
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise BootstrapError(
            f"no lockfile at {path}; run the bootstrap first", exit_code=EXIT_VERIFY
        ) from exc
    except ValueError as exc:
        raise BootstrapError(f"{path}: {exc}", exit_code=EXIT_VERIFY) from exc


def verify_lockfile(input_root: Path | str | None) -> VerifyResult:
    """Offline: every locked asset still on disk, unchanged, and in the catalog."""
    document = load_lockfile(input_root)
    root = resolve_library_root(input_root)
    user_ids = {str(row.get("id")) for row in read_user_catalog(input_root)}
    issues: list[VerifyIssue] = []
    assets = document.get("assets") or {}

    for asset_id, entry in sorted(assets.items()):
        relative = str(entry.get("file", ""))
        try:
            path = resolve_within(root, relative)
        except Exception as exc:  # noqa: BLE001 -- report, never crash verify
            issues.append(VerifyIssue(asset_id, "missing-file", f"{relative}: {exc}"))
            continue
        if not path.is_file():
            issues.append(VerifyIssue(asset_id, "missing-file", relative))
            continue
        if _sha256_file(path) != entry.get("sha256"):
            issues.append(VerifyIssue(asset_id, "hash-mismatch", relative))
        if asset_id not in user_ids:
            issues.append(VerifyIssue(asset_id, "missing-catalog-row", asset_id))

    return VerifyResult(ok=not issues, issues=tuple(issues), checked=len(assets))


def _atomic_json(path: Path, document: dict) -> None:
    payload = json.dumps(document, ensure_ascii=False, indent=2).encode("utf-8")
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_bytes(payload)
    tmp.replace(path)
