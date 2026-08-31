from __future__ import annotations

import asyncio

import pytest

from omnicam import asset_index
from omnicam.asset_index import invalidate_asset_index, list_asset_page


def test_asset_index_is_sorted_paginated_and_has_totals(tmp_path):
    (tmp_path / "cards").mkdir()
    (tmp_path / "cards" / "z.png").write_bytes(b"zz")
    (tmp_path / "cards" / "a.png").write_bytes(b"a")

    page = asyncio.run(list_asset_page(tmp_path, offset=1, limit=1))

    assert page["assets"] == [{"relative": "cards/z.png", "size": 2, "modified": pytest.approx((tmp_path / "cards" / "z.png").stat().st_mtime)}]
    assert page["total"] == 2
    assert page["total_bytes"] == 3
    assert page["offset"] == 1


def test_asset_index_invalidates_after_managed_write(tmp_path):
    (tmp_path / "cards").mkdir()
    (tmp_path / "cards" / "first.png").write_bytes(b"a")
    assert asyncio.run(list_asset_page(tmp_path))["total"] == 1

    (tmp_path / "cards" / "second.png").write_bytes(b"b")
    invalidate_asset_index(tmp_path)

    assert asyncio.run(list_asset_page(tmp_path))["total"] == 2


def test_invalidation_during_scan_cannot_publish_a_stale_generation(tmp_path, monkeypatch):
    (tmp_path / "first.png").write_bytes(b"a")
    real_scan = asset_index._scan
    calls = 0

    def racing_scan(root):
        nonlocal calls
        calls += 1
        result = real_scan(root)
        if calls == 1:
            (tmp_path / "second.png").write_bytes(b"b")
            invalidate_asset_index(tmp_path)
        return result

    monkeypatch.setattr(asset_index, "_scan", racing_scan)
    page = asyncio.run(list_asset_page(tmp_path))
    assert calls == 2
    assert page["total"] == 2


@pytest.mark.parametrize("offset,limit", [(-1, 1), (0, 0), (0, 501)])
def test_asset_index_rejects_unbounded_pages(tmp_path, offset, limit):
    with pytest.raises(ValueError):
        asyncio.run(list_asset_page(tmp_path, offset=offset, limit=limit))
