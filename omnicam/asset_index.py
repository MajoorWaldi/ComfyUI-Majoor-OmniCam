"""Bounded, asynchronous index of OmniCam-managed input assets."""

from __future__ import annotations

import asyncio
import os
import time
from pathlib import Path

DEFAULT_PAGE_SIZE = 200
MAX_PAGE_SIZE = 500
_CACHE_TTL_SECONDS = max(0, int(os.environ.get("OMNICAM_ASSET_INDEX_TTL_SECONDS", "30")))
_cache_lock = asyncio.Lock()
_cache: dict[Path, tuple[float, list[dict[str, float | int | str]], int]] = {}


def _scan(root: Path) -> tuple[list[dict[str, float | int | str]], int]:
    assets: list[dict[str, float | int | str]] = []
    if not root.exists():
        return assets, 0
    for entry in root.rglob("*"):
        try:
            if not entry.is_file():
                continue
            stat = entry.stat()
        except OSError:
            continue
        assets.append({
            "relative": entry.relative_to(root).as_posix(),
            "size": stat.st_size,
            "modified": stat.st_mtime,
        })
    assets.sort(key=lambda asset: str(asset["relative"]))
    return assets, sum(int(asset["size"]) for asset in assets)


async def _assets(root: Path) -> tuple[list[dict[str, float | int | str]], int]:
    root = root.resolve()
    async with _cache_lock:
        cached = _cache.get(root)
        if cached is not None and time.monotonic() - cached[0] <= _CACHE_TTL_SECONDS:
            return cached[1], cached[2]
        assets, total_bytes = await asyncio.to_thread(_scan, root)
        _cache[root] = (time.monotonic(), assets, total_bytes)
        return assets, total_bytes


def invalidate_asset_index(root: Path) -> None:
    """Invalidate after a managed upload or explicit cleanup."""
    _cache.pop(root.resolve(), None)


async def list_asset_page(root: Path, *, offset: int = 0, limit: int = DEFAULT_PAGE_SIZE) -> dict[str, object]:
    if offset < 0:
        raise ValueError("offset must be non-negative")
    if not 1 <= limit <= MAX_PAGE_SIZE:
        raise ValueError(f"limit must be between 1 and {MAX_PAGE_SIZE}")
    assets, total_bytes = await _assets(root)
    return {
        "root": "omnicam",
        "assets": assets[offset : offset + limit],
        "total": len(assets),
        "total_bytes": total_bytes,
        "offset": offset,
        "limit": limit,
    }
