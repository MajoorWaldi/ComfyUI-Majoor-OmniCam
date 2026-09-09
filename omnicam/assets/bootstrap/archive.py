"""Safe inventory + extraction of downloaded pack archives (plan section 11).

Every member is checked for traversal, absolute / drive paths and symlink bits
*before* anything is read; a single unsafe entry rejects the whole archive. The
combined uncompressed size is capped to defeat zip bombs, and no member above
``MAX_MEMBER_BYTES`` is ever streamed. ``ZipFile.extractall()`` is never used --
extraction is one explicit member at a time.
"""

from __future__ import annotations

import hashlib
import stat
import zipfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath

from .types import (
    DOWNLOAD_CHUNK,
    EXIT_DOWNLOAD,
    MAX_MEMBER_BYTES,
    MAX_TOTAL_UNCOMPRESSED,
    BootstrapError,
)


def _fail(message: str) -> BootstrapError:
    return BootstrapError(message, exit_code=EXIT_DOWNLOAD)


@dataclass(frozen=True, slots=True)
class ArchiveMember:
    archive: Path
    name: str
    stem: str
    size: int


def safe_member_name(info: zipfile.ZipInfo) -> str:
    """Return the member's posix path or raise if it could escape extraction."""
    raw = info.filename.replace("\\", "/")
    path = PurePosixPath(raw)
    if path.is_absolute() or ".." in path.parts:
        raise _fail(f"unsafe ZIP member path: {raw!r}")
    if path.parts and ":" in path.parts[0]:
        raise _fail(f"unsafe ZIP drive path: {raw!r}")
    mode = (info.external_attr >> 16) & 0xFFFF
    if stat.S_ISLNK(mode):
        raise _fail(f"symlink ZIP member rejected: {raw!r}")
    return raw


def list_glb_members(archive: Path | str) -> tuple[ArchiveMember, ...]:
    """Validate every entry, enforce the size caps, return the ``.glb`` members.

    Non-GLB members are ignored for starter curation but still validated for
    path safety (plan section 11).
    """
    archive = Path(archive)
    try:
        handle = zipfile.ZipFile(archive)
    except (OSError, zipfile.BadZipFile) as exc:
        raise _fail(f"{archive}: not a readable ZIP archive: {exc}") from exc

    total = 0
    members: list[ArchiveMember] = []
    with handle:
        for info in handle.infolist():
            name = safe_member_name(info)
            if info.is_dir():
                continue
            total += info.file_size
            if total > MAX_TOTAL_UNCOMPRESSED:
                raise _fail(
                    f"{archive}: uncompressed size exceeds "
                    f"{MAX_TOTAL_UNCOMPRESSED} bytes (possible zip bomb)"
                )
            if not name.lower().endswith(".glb"):
                continue
            if info.file_size > MAX_MEMBER_BYTES:
                raise _fail(
                    f"{archive}: member {name!r} is {info.file_size} bytes "
                    f"(max {MAX_MEMBER_BYTES})"
                )
            members.append(
                ArchiveMember(
                    archive=archive,
                    name=name,
                    stem=PurePosixPath(name).stem,
                    size=info.file_size,
                )
            )
    members.sort(key=lambda m: m.name)
    return tuple(members)


def open_member(member: ArchiveMember):
    """A binary stream for ``member`` -- caller closes it (or the parent zip)."""
    parent = zipfile.ZipFile(member.archive)
    stream = parent.open(member.name, "r")
    _bind_close(stream, parent)
    return stream


def _bind_close(stream, parent: zipfile.ZipFile) -> None:
    original = stream.close

    def _close() -> None:
        try:
            original()
        finally:
            parent.close()

    stream.close = _close


def copy_member(member: ArchiveMember, destination: Path | str) -> tuple[int, str]:
    """Stream ``member`` to ``destination``; return ``(bytes_written, sha256)``."""
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256()
    written = 0
    stream = open_member(member)
    try:
        with destination.open("wb") as out:
            while True:
                chunk = stream.read(DOWNLOAD_CHUNK)
                if not chunk:
                    break
                written += len(chunk)
                if written > MAX_MEMBER_BYTES:
                    raise _fail(f"member {member.name!r} exceeds {MAX_MEMBER_BYTES} bytes")
                digest.update(chunk)
                out.write(chunk)
    except BootstrapError:
        destination.unlink(missing_ok=True)
        raise
    finally:
        stream.close()
    return written, digest.hexdigest()
