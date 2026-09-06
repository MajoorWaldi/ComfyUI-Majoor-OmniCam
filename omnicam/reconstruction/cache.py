"""Reconstruction disk cache and manifest validation."""

from __future__ import annotations

import contextlib
import json
import logging
import time
from dataclasses import dataclass
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

    def to_dict(self) -> dict[str, Any]:
        return {
            "cache_version": self.cache_version,
            "fingerprint": self.fingerprint,
            "provider": self.provider,
            "provider_version": self.provider_version,
            "asset": self.asset,
            "summary": dict(self.summary),
            "created_at": self.created_at,
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
) -> CacheEntry | None:
    """Lookup cached reconstruction by fingerprint. Returns None on cache miss or invalid assets."""
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

    if not manifest_path.is_file() or not glb_path.is_file():
        return None

    # Check non-empty glb file
    with contextlib.suppress(OSError):
        if glb_path.stat().st_size <= 0:
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
    if not asset_path.startswith("majoor_omnicam/reconstruction/"):
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
