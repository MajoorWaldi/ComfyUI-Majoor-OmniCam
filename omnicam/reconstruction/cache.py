"""Reconstruction disk cache and manifest validation."""

from __future__ import annotations

import contextlib
import json
import logging
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .asset_writer import HEX_FINGERPRINT_PATTERN

logger = logging.getLogger(__name__)

CACHE_VERSION = 1


@dataclass(slots=True)
class CacheEntry:
    cache_version: int
    fingerprint: str
    provider: str
    provider_version: str
    asset: str
    summary: dict[str, Any]
    created_at: float
    #: Exact model identity tokens per stage, e.g.
    #: ``{"geometry": "...", "segmentation": "...", "completion": "..."}``.
    #: Surfaced in the manifest so a stale entry produced by a since-swapped
    #: checkpoint is visible; the fingerprint + provider_version remain the
    #: primary miss triggers.
    model_identities: dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "cache_version": self.cache_version,
            "fingerprint": self.fingerprint,
            "provider": self.provider,
            "provider_version": self.provider_version,
            "asset": self.asset,
            "summary": dict(self.summary),
            "created_at": self.created_at,
            "model_identities": dict(self.model_identities),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> CacheEntry:
        return cls(
            cache_version=int(data.get("cache_version", 1)),
            fingerprint=str(data.get("fingerprint", "")),
            provider=str(data.get("provider", "")),
            provider_version=str(data.get("provider_version", "")),
            asset=str(data.get("asset", "")),
            summary=dict(data.get("summary", {})),
            created_at=float(data.get("created_at", 0.0)),
            model_identities=dict(data.get("model_identities", {})),
        )


def _resolve_input_dir(input_root: Path | str | None) -> Path:
    if input_root is not None:
        return Path(input_root).resolve()
    import folder_paths

    return Path(folder_paths.get_input_directory()).resolve()


def write_cache_manifest(
    entry: CacheEntry,
    input_root: Path | str | None = None,
) -> Path:
    """Write or update the reconstruction cache manifest."""
    input_dir = _resolve_input_dir(input_root)
    target_dir = input_dir / "majoor_omnicam" / "reconstruction" / entry.fingerprint
    target_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = target_dir / "reconstruction.json"

    data = entry.to_dict()
    manifest_path.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")
    return manifest_path


def lookup_cache(
    *,
    fingerprint: str,
    provider: str,
    provider_version: str,
    input_root: Path | str | None = None,
    require_glb: bool = True,
) -> CacheEntry | None:
    """Lookup cached reconstruction by fingerprint. Returns None on cache miss or invalid assets.

    ``require_glb`` (default) gates on ``environment.glb`` -- the depth-mesh
    path. The Blockout path has no GLB, so it passes ``require_glb=False`` and
    the manifest alone (plus a ``blockout.json`` sidecar) backs the hit.
    """
    fp = str(fingerprint).strip()
    if not HEX_FINGERPRINT_PATTERN.match(fp):
        return None

    try:
        input_dir = _resolve_input_dir(input_root)
    except (OSError, RuntimeError, ValueError):
        return None

    target_dir = input_dir / "majoor_omnicam" / "reconstruction" / fp
    manifest_path = target_dir / "reconstruction.json"
    glb_path = target_dir / "environment.glb"

    if not manifest_path.is_file():
        return None
    if require_glb:
        if not glb_path.is_file():
            return None
        # Check non-empty glb file
        with contextlib.suppress(OSError):
            if glb_path.stat().st_size <= 0:
                return None
    elif not (target_dir / "blockout.json").is_file():
        return None

    try:
        content = manifest_path.read_text(encoding="utf-8")
        raw = json.loads(content)
    except (OSError, json.JSONDecodeError):
        return None

    if not isinstance(raw, dict):
        return None

    if int(raw.get("cache_version", 0)) != CACHE_VERSION:
        return None

    if str(raw.get("fingerprint", "")) != fp:
        return None

    if str(raw.get("provider", "")) != provider:
        return None

    if str(raw.get("provider_version", "")) != provider_version:
        return None

    asset_path = str(raw.get("asset", ""))
    if require_glb and not asset_path.startswith("majoor_omnicam/reconstruction/"):
        return None
    if not require_glb and asset_path and not asset_path.startswith("majoor_omnicam/reconstruction/"):
        return None

    summary = raw.get("summary", {})
    created_at = float(raw.get("created_at", raw.get("timestamp", time.time())))

    return CacheEntry(
        cache_version=CACHE_VERSION,
        fingerprint=fp,
        provider=provider,
        provider_version=provider_version,
        asset=asset_path,
        summary=summary,
        created_at=created_at,
    )


@dataclass(slots=True)
class CacheClearResult:
    entries_removed: int
    bytes_freed: int


def clear_reconstruction_cache(input_root: Path | str | None = None) -> CacheClearResult:
    """Delete every cached reconstruction: manifests, GLB assets, source images.

    Bounded to ``<input_dir>/majoor_omnicam/reconstruction`` -- the same
    managed subtree write_reconstruction_assets writes into -- so this can
    never touch anything else under the ComfyUI input directory.
    """
    input_dir = _resolve_input_dir(input_root)
    target_dir = (input_dir / "majoor_omnicam" / "reconstruction").resolve()

    if input_dir != target_dir and input_dir not in target_dir.parents:
        raise ValueError(f"Refusing to clear {target_dir}: escapes input root {input_dir}")

    if not target_dir.is_dir():
        return CacheClearResult(entries_removed=0, bytes_freed=0)

    entries_removed = 0
    bytes_freed = 0
    for path in target_dir.rglob("*"):
        if path.is_file():
            with contextlib.suppress(OSError):
                bytes_freed += path.stat().st_size
                entries_removed += 1

    import shutil

    shutil.rmtree(target_dir, ignore_errors=True)
    target_dir.mkdir(parents=True, exist_ok=True)

    return CacheClearResult(entries_removed=entries_removed, bytes_freed=bytes_freed)


def delete_reconstruction_cache_entry(
    fingerprint: str, input_root: Path | str | None = None
) -> CacheClearResult:
    """Delete a single cached reconstruction -- the ``<fingerprint>/`` folder
    (manifest, blockout sidecar, GLBs, source copy) -- and nothing else.

    Lets the panel discard one result the user does not want so the next run
    with the same settings actually recomputes, without wiping every other
    cached reconstruction. Bounded to the managed subtree; a fingerprint that
    is not 1-64 hex chars, or that resolves outside it, is refused.
    """
    fp = str(fingerprint).strip()
    if not HEX_FINGERPRINT_PATTERN.match(fp):
        raise ValueError(f"invalid reconstruction fingerprint {fingerprint!r}")

    input_dir = _resolve_input_dir(input_root)
    root = (input_dir / "majoor_omnicam" / "reconstruction").resolve()
    target_dir = (root / fp).resolve()
    if target_dir != root and root not in target_dir.parents:
        raise ValueError(f"Refusing to delete {target_dir}: escapes {root}")
    if not target_dir.is_dir():
        return CacheClearResult(entries_removed=0, bytes_freed=0)

    entries_removed = 0
    bytes_freed = 0
    for path in target_dir.rglob("*"):
        if path.is_file():
            with contextlib.suppress(OSError):
                bytes_freed += path.stat().st_size
                entries_removed += 1

    import shutil

    shutil.rmtree(target_dir, ignore_errors=True)
    return CacheClearResult(entries_removed=entries_removed, bytes_freed=bytes_freed)
