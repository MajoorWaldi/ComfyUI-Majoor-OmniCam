"""Opt-in live Kenney smoke test. Skipped unless OMNICAM_NETWORK_TESTS == "1".

    OMNICAM_NETWORK_TESTS=1 pytest tests/assets/test_bootstrap_network.py -v

Never part of required CI (plan sections 25, 39).
"""

from __future__ import annotations

import os

import pytest

from omnicam.assets.bootstrap import cli
from omnicam.assets.bootstrap.download import download_archive
from omnicam.assets.bootstrap.kenney import resolve_kenney_archive
from omnicam.assets.bootstrap.source_registry import select_sources

pytestmark = pytest.mark.skipif(
    os.environ.get("OMNICAM_NETWORK_TESTS") != "1",
    reason="set OMNICAM_NETWORK_TESTS=1 to run the live Kenney smoke test",
)


@pytest.mark.parametrize("source", select_sources("starter"), ids=lambda s: s.id)
def test_every_starter_page_resolves_to_an_approved_zip(source):
    url = resolve_kenney_archive(source.page_url)
    assert url.startswith("https://kenney.nl/media/pages/assets/")
    assert url.lower().endswith(".zip")


def test_one_pack_downloads_with_valid_magic_and_hash(tmp_path):
    (source,) = (s for s in select_sources("starter") if s.id == "kenney.furniture_kit")
    url = resolve_kenney_archive(source.page_url)
    result = download_archive(url, tmp_path / "furniture.zip")
    assert result.path.read_bytes()[:4] == b"PK\x03\x04"
    assert len(result.sha256) == 64
    assert 0 < result.size <= 512 * 1024 * 1024


def test_starter_dry_run_end_to_end(tmp_path):
    code = cli.run(["--preset", "starter", "--download", "--dry-run", "--dest", str(tmp_path)])
    assert code in (0, 5)  # 5 only if a live pack dropped a required stem
    assert not list((tmp_path / "omnicam" / "library").rglob("*.glb")) if (tmp_path / "omnicam").exists() else True
