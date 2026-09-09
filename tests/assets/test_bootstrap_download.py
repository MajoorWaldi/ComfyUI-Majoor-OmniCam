"""Kenney page resolution + bounded archive download. No real network."""

from __future__ import annotations

import io

import pytest

from omnicam.assets.bootstrap.download import download_archive
from omnicam.assets.bootstrap.kenney import resolve_kenney_archive
from omnicam.assets.bootstrap.types import BootstrapError

_ZIP = b"PK\x03\x04" + b"\x00" * 60

_PAGE = """
<html><body>
  <p>License: Creative Commons CC0</p>
  <a href="https://kenney.nl/media/pages/assets/furniture-kit/abc123-1677/kenney_furniture-kit.zip">Download</a>
  <a href="https://kenney.nl/assets/car-kit">Another pack</a>
</body></html>
"""


class _Resp(io.BytesIO):
    def __init__(self, data: bytes, url: str) -> None:
        super().__init__(data)
        self._url = url

    def geturl(self) -> str:
        return self._url

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()
        return False


def _opener_for(body: bytes, url: str):
    def _open(request, timeout=0):
        assert request is not None
        assert timeout >= 0
        return _Resp(body, url)

    return _open


# -- resolver ----------------------------------------------------------------

def test_valid_page_resolves_exact_zip():
    opener = _opener_for(_PAGE.encode(), "https://kenney.nl/assets/furniture-kit")
    url = resolve_kenney_archive("https://kenney.nl/assets/furniture-kit", opener)
    assert url == (
        "https://kenney.nl/media/pages/assets/furniture-kit/"
        "abc123-1677/kenney_furniture-kit.zip"
    )


def test_page_without_cc0_fails_closed():
    body = _PAGE.replace("Creative Commons CC0", "All Rights Reserved").encode()
    opener = _opener_for(body, "https://kenney.nl/assets/furniture-kit")
    with pytest.raises(BootstrapError):
        resolve_kenney_archive("https://kenney.nl/assets/furniture-kit", opener)


def test_offsite_zip_link_is_ignored_and_resolution_fails():
    body = _PAGE.replace("https://kenney.nl/media/pages/assets", "https://evil.example/x").encode()
    opener = _opener_for(body, "https://kenney.nl/assets/furniture-kit")
    with pytest.raises(BootstrapError):
        resolve_kenney_archive("https://kenney.nl/assets/furniture-kit", opener)


def test_zip_outside_media_assets_path_is_rejected():
    body = _PAGE.replace(
        "https://kenney.nl/media/pages/assets/furniture-kit/abc123-1677/kenney_furniture-kit.zip",
        "https://kenney.nl/other/kenney_furniture-kit.zip",
    ).encode()
    opener = _opener_for(body, "https://kenney.nl/assets/furniture-kit")
    with pytest.raises(BootstrapError):
        resolve_kenney_archive("https://kenney.nl/assets/furniture-kit", opener)


def test_non_kenney_page_url_is_rejected():
    with pytest.raises(BootstrapError):
        resolve_kenney_archive("https://evil.example/assets/furniture-kit", _opener_for(b"", ""))


def test_two_zip_links_are_ambiguous_and_rejected():
    body = _PAGE.replace(
        "<a href=\"https://kenney.nl/assets/car-kit\">Another pack</a>",
        "<a href=\"https://kenney.nl/media/pages/assets/car-kit/z-9/kenney_car-kit.zip\">B</a>",
    ).encode()
    opener = _opener_for(body, "https://kenney.nl/assets/furniture-kit")
    with pytest.raises(BootstrapError):
        resolve_kenney_archive("https://kenney.nl/assets/furniture-kit", opener)


# -- downloader ------------------------------------------------------------

_ARCHIVE_URL = "https://kenney.nl/media/pages/assets/furniture-kit/abc/kenney_furniture-kit.zip"


def test_download_writes_zip_and_records_sha(tmp_path):
    dest = tmp_path / "kenney_furniture-kit.zip"
    result = download_archive(_ARCHIVE_URL, dest, opener=_opener_for(_ZIP, _ARCHIVE_URL))
    assert dest.is_file()
    assert dest.read_bytes() == _ZIP
    assert result.size == len(_ZIP)
    assert len(result.sha256) == 64
    assert not (tmp_path / "kenney_furniture-kit.zip.partial").exists()


def test_download_rejects_non_zip_payload(tmp_path):
    dest = tmp_path / "pack.zip"
    with pytest.raises(BootstrapError):
        download_archive(_ARCHIVE_URL, dest, opener=_opener_for(b"<html>nope</html>", _ARCHIVE_URL))
    assert not dest.exists()
    assert not (tmp_path / "pack.zip.partial").exists()


def test_download_enforces_byte_ceiling_and_cleans_partial(tmp_path):
    dest = tmp_path / "pack.zip"
    big = _ZIP + b"\x00" * (5 * 1024 * 1024)
    with pytest.raises(BootstrapError):
        download_archive(_ARCHIVE_URL, dest, max_bytes=1024, opener=_opener_for(big, _ARCHIVE_URL))
    assert not dest.exists()
    assert not (tmp_path / "pack.zip.partial").exists()


def test_download_rejects_offsite_url(tmp_path):
    with pytest.raises(BootstrapError):
        download_archive("https://evil.example/x.zip", tmp_path / "x.zip", opener=_opener_for(_ZIP, "x"))
