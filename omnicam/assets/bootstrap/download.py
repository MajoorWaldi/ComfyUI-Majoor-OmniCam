"""Bounded, streamed, hash-locked archive download (plan section 9).

Writes to a ``<name>.partial`` sibling, enforces the byte ceiling *while*
streaming, requires the ZIP magic ``PK\\x03\\x04`` before the atomic rename to
the final ``.zip``, and records a SHA-256 for the lockfile. A rejected or
oversized response leaves no ``.zip`` behind.
"""

from __future__ import annotations

import hashlib
from pathlib import Path
from urllib.request import Request, urlopen

from .kenney import assert_https_kenney
from .types import (
    DOWNLOAD_CHUNK,
    EXIT_DOWNLOAD,
    HTTP_TIMEOUT,
    MAX_PACK_BYTES,
    USER_AGENT,
    BootstrapError,
    DownloadedArchive,
)

_ZIP_MAGIC = b"PK\x03\x04"
_EMPTY_ZIP_MAGIC = b"PK\x05\x06"  # a legitimately empty archive


def _fail(message: str) -> BootstrapError:
    return BootstrapError(message, exit_code=EXIT_DOWNLOAD)


def download_archive(
    url: str,
    destination: Path | str,
    *,
    max_bytes: int = MAX_PACK_BYTES,
    opener=urlopen,
) -> DownloadedArchive:
    """Fetch ``url`` to ``destination`` (a ``.zip`` path) with hard limits."""
    assert_https_kenney(url, assets_page=False)
    final_path = Path(destination)
    partial = final_path.with_name(final_path.name + ".partial")
    partial.parent.mkdir(parents=True, exist_ok=True)
    if partial.exists():
        partial.unlink()

    digest = hashlib.sha256()
    size = 0
    first = b""
    request = Request(url, headers={"User-Agent": USER_AGENT})  # noqa: S310
    try:
        with opener(request, timeout=HTTP_TIMEOUT) as response:
            final_url = response.geturl() or url
            assert_https_kenney(final_url, assets_page=False)
            with partial.open("wb") as handle:
                while True:
                    chunk = response.read(DOWNLOAD_CHUNK)
                    if not chunk:
                        break
                    size += len(chunk)
                    if size > max_bytes:
                        raise _fail(
                            f"archive exceeds the {max_bytes}-byte pack limit"
                        )
                    if not first:
                        first = chunk[:4]
                    digest.update(chunk)
                    handle.write(chunk)
    except BootstrapError:
        partial.unlink(missing_ok=True)
        raise
    except OSError as exc:
        partial.unlink(missing_ok=True)
        raise _fail(f"download failed for {url}: {exc}") from exc

    if not first.startswith((_ZIP_MAGIC, _EMPTY_ZIP_MAGIC)):
        partial.unlink(missing_ok=True)
        raise _fail(f"downloaded file is not a ZIP archive: {url}")

    partial.replace(final_path)
    return DownloadedArchive(
        path=final_path,
        source_url=url,
        final_url=final_url,
        size=size,
        sha256=digest.hexdigest(),
    )
