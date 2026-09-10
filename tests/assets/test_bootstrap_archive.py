"""ZIP inventory + extraction safety for the bootstrap."""

from __future__ import annotations

import stat
import zipfile

import pytest

from omnicam.assets.bootstrap.archive import (
    copy_member,
    list_glb_members,
)
from omnicam.assets.bootstrap.types import BootstrapError

_GLB = b"glTF\x02\x00\x00\x00" + b"\x00" * 32


def _zip(path, entries):
    with zipfile.ZipFile(path, "w") as zf:
        for name, data in entries.items():
            zf.writestr(name, data)
    return path


def test_lists_only_glb_members(tmp_path):
    archive = _zip(
        tmp_path / "kit.zip",
        {
            "Models/GLB format/chair.glb": _GLB,
            "Models/GLB format/table.glb": _GLB,
            "Models/OBJ format/chair.obj": b"o chair\n",
            "Preview.png": b"\x89PNG",
            "License.txt": b"CC0",
        },
    )
    members = list_glb_members(archive)
    assert sorted(m.stem for m in members) == ["chair", "table"]
    assert all(m.name.lower().endswith(".glb") for m in members)


def test_traversal_member_rejects_whole_archive(tmp_path):
    archive = _zip(
        tmp_path / "kit.zip",
        {"Models/chair.glb": _GLB, "../../evil.glb": _GLB},
    )
    with pytest.raises(BootstrapError):
        list_glb_members(archive)


def test_absolute_member_rejects(tmp_path):
    path = tmp_path / "kit.zip"
    with zipfile.ZipFile(path, "w") as zf:
        zf.writestr("/etc/evil.glb", _GLB)
    with pytest.raises(BootstrapError):
        list_glb_members(path)


def test_symlink_member_rejects(tmp_path):
    path = tmp_path / "kit.zip"
    with zipfile.ZipFile(path, "w") as zf:
        info = zipfile.ZipInfo("Models/link.glb")
        info.external_attr = (stat.S_IFLNK | 0o777) << 16
        zf.writestr(info, "/etc/passwd")
    with pytest.raises(BootstrapError):
        list_glb_members(path)


def test_zip_bomb_uncompressed_cap_rejects(tmp_path, monkeypatch):
    import omnicam.assets.bootstrap.archive as arch

    monkeypatch.setattr(arch, "MAX_TOTAL_UNCOMPRESSED", 1024)
    path = tmp_path / "kit.zip"
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("Models/huge.glb", b"\x00" * (8 * 1024))
    with pytest.raises(BootstrapError):
        arch.list_glb_members(path)


def test_oversized_member_rejects(tmp_path, monkeypatch):
    import omnicam.assets.bootstrap.archive as arch

    monkeypatch.setattr(arch, "MAX_MEMBER_BYTES", 16)
    path = _zip(tmp_path / "kit.zip", {"Models/chair.glb": _GLB})
    with pytest.raises(BootstrapError):
        arch.list_glb_members(path)


def test_copy_member_streams_and_hashes(tmp_path):
    import hashlib

    archive = _zip(tmp_path / "kit.zip", {"Models/GLB format/chair.glb": _GLB})
    (member,) = list_glb_members(archive)
    out = tmp_path / "out" / "chair.glb"
    written, sha = copy_member(member, out)
    assert out.read_bytes() == _GLB
    assert written == len(_GLB)
    assert sha == hashlib.sha256(_GLB).hexdigest()
