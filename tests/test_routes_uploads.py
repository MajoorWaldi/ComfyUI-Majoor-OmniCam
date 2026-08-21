"""Upload route hardening tests. ComfyUI server modules are stubbed so the
route module stays importable outside a running ComfyUI instance."""

from __future__ import annotations

import sys
import types
import asyncio
import os
from io import BytesIO

import pytest
from aiohttp import web
from PIL import Image

_INPUT_DIR: list[str] = ["unused"]

folder_paths_stub = types.ModuleType("folder_paths")
folder_paths_stub.get_input_directory = lambda: _INPUT_DIR[0]

server_stub = types.ModuleType("server")


class _PromptServer:
    instance = types.SimpleNamespace(routes=web.RouteTableDef())


server_stub.PromptServer = _PromptServer
sys.modules.setdefault("folder_paths", folder_paths_stub)
sys.modules.setdefault("server", server_stub)

from omnicam import routes  # noqa: E402


@pytest.fixture()
def input_dir(tmp_path, monkeypatch):
    _INPUT_DIR[0] = str(tmp_path)
    routes._quota_usage = None
    routes._quota_reserved = 0
    monkeypatch.setattr(routes, "MAX_FOLDER_BYTES", 4 * 1024 * 1024 * 1024)
    monkeypatch.setattr(routes, "MIN_FREE_BYTES", 0)
    return tmp_path


def png_bytes(width=2, height=2):
    output = BytesIO()
    Image.new("RGB", (width, height), "red").save(output, "PNG")
    return output.getvalue()


class FakeField:
    def __init__(self, name: str, filename: str, chunks: list[bytes], fail_at: int | None = None):
        self.name = name
        self.filename = filename
        self._chunks = list(chunks)
        self._fail_at = fail_at

    async def read_chunk(self, size: int = 1024 * 1024):
        if self._fail_at is not None and not self._chunks:
            raise ConnectionResetError("client gone")
        if not self._chunks:
            return b""
        return self._chunks.pop(0)


class FakeMultipart:
    def __init__(self, field):
        self._field = field

    async def next(self):
        return self._field


class FakeRequest:
    def __init__(self, field=None, json_body=None):
        self._field = field
        self._json = json_body

    async def multipart(self):
        return FakeMultipart(self._field)

    async def json(self):
        if isinstance(self._json, Exception):
            raise self._json
        return self._json


def test_safe_filename_sanitizes_and_scopes():
    name = routes._safe_filename("../../evil/photo.PNG", {".png"})
    assert ".." not in name and "/" not in name and "\\" not in name
    assert name.endswith(".png")


def test_safe_filename_rejects_bad_and_double_extensions():
    with pytest.raises(web.HTTPBadRequest):
        routes._safe_filename("evil.exe", {".png"})
    with pytest.raises(web.HTTPBadRequest):
        routes._safe_filename("evil.png.exe", {".png"})
    with pytest.raises(web.HTTPBadRequest):
        routes._safe_filename("script.png.py", {".png"})


def test_signature_checks():
    assert routes._signature_ok(".png", b"\x89PNG\r\n\x1a\n....")
    assert not routes._signature_ok(".png", b"GIF89a....")
    assert routes._signature_ok(".webm", b"\x1a\x45\xdf\xa3....")
    assert routes._signature_ok(".mp4", b"\x00\x00\x00\x18ftypisom")
    assert not routes._signature_ok(".mp4", b"\x1a\x45\xdf\xa3")
    assert routes._signature_ok(".webp", b"RIFF\x00\x00\x00\x00WEBP")
    assert not routes._signature_ok(".webp", b"RIFF\x00\x00\x00\x00FAIL")
    assert routes._signature_ok(".obj", b"v 0 0 0")  # no signature → deferred to content checks


@pytest.mark.asyncio
async def test_upload_writes_file_off_loop_and_indexes(input_dir):
    payload = png_bytes()
    request = FakeRequest(FakeField("file", "card.png", [payload]))
    result = await routes._save_multipart_file(request, "cards", {".png"}, 1024 * 1024)
    assert result["size"] == len(payload)
    written = input_dir / "omnicam" / "cards" / result["name"]
    assert written.read_bytes() == payload


@pytest.mark.asyncio
async def test_upload_rejects_empty_files(input_dir):
    request = FakeRequest(FakeField("file", "card.png", []))
    with pytest.raises(web.HTTPBadRequest) as exc_info:
        await routes._save_multipart_file(request, "cards", {".png"}, 1024)
    assert "Empty" in exc_info.value.text
    assert not any(p.is_file() for p in (input_dir / "omnicam").rglob("*"))


@pytest.mark.asyncio
async def test_upload_rejects_oversize_and_removes_partial(input_dir):
    request = FakeRequest(FakeField("file", "card.png", [b"\x89PNG\r\n\x1a\n", b"x" * 4096]))
    with pytest.raises(web.HTTPRequestEntityTooLarge):
        await routes._save_multipart_file(request, "cards", {".png"}, 128)
    assert not any(p.is_file() for p in (input_dir / "omnicam").rglob("*"))


@pytest.mark.asyncio
async def test_upload_rejects_signature_mismatch(input_dir):
    request = FakeRequest(FakeField("file", "fake.png", [b"MZ\x90\x00 not a png at all"]))
    with pytest.raises(web.HTTPBadRequest) as exc_info:
        await routes._save_multipart_file(request, "cards", {".png"}, 1024)
    assert "signature" in exc_info.value.text
    assert not any(p.is_file() for p in (input_dir / "omnicam").rglob("*"))


@pytest.mark.asyncio
async def test_upload_client_disconnect_cleans_partial(input_dir):
    field = FakeField("file", "card.png", [b"\x89PNG\r\n\x1a\n"], fail_at=1)
    field._chunks = [b"\x89PNG\r\n\x1a\n"]  # one chunk written, then disconnect
    field._fail_at = 0

    async def read_chunk(size=1024 * 1024):
        if field._chunks:
            return field._chunks.pop(0)
        raise ConnectionResetError("client gone")

    field.read_chunk = read_chunk
    request = FakeRequest(field)
    with pytest.raises(web.HTTPRequestTimeout):
        await routes._save_multipart_file(request, "cards", {".png"}, 1024 * 1024)
    assert not any(p.is_file() for p in (input_dir / "omnicam").rglob("*"))


@pytest.mark.asyncio
async def test_folder_quota_blocks_upload(input_dir, monkeypatch):
    monkeypatch.setattr(routes, "MAX_FOLDER_BYTES", 10)
    request = FakeRequest(FakeField("file", "card.png", [b"\x89PNG\r\n\x1a\n"]))
    with pytest.raises(web.HTTPInsufficientStorage):
        await routes._save_multipart_file(request, "cards", {".png"}, 1024)


@pytest.mark.asyncio
async def test_assets_index_and_cleanup(input_dir):
    managed = input_dir / "omnicam" / "cards"
    managed.mkdir(parents=True)
    (managed / "keep.png").write_bytes(b"\x89PNG\r\n\x1a\n")
    (managed / "drop.png").write_bytes(b"\x89PNG\r\n\x1a\n")

    index = await routes.list_assets(FakeRequest())
    index_body = __import__("json").loads(index.body)
    assert index_body["root"] == "omnicam"
    assert str(input_dir) not in index.body.decode()
    names = {asset["relative"] for asset in index_body["assets"]}
    assert {"cards/keep.png", "cards/drop.png"} <= names

    import json

    result = await routes.cleanup_assets(FakeRequest(json_body={"files": ["cards/drop.png"]}))
    assert json.loads(result.body)["freed_bytes"] == 8
    assert not (managed / "drop.png").exists()
    assert (managed / "keep.png").exists()


@pytest.mark.asyncio
async def test_cleanup_rejects_traversal(input_dir):
    managed = input_dir / "omnicam" / "cards"
    managed.mkdir(parents=True)
    (input_dir / "outside.txt").write_text("secret")
    with pytest.raises(web.HTTPBadRequest):
        await routes.cleanup_assets(FakeRequest(json_body={"files": ["../outside.txt"]}))
    with pytest.raises(web.HTTPNotFound):
        await routes.cleanup_assets(FakeRequest(json_body={"files": ["cards/missing.png"]}))
    assert (input_dir / "outside.txt").exists()


@pytest.mark.asyncio
async def test_cleanup_validates_all_targets_before_deleting(input_dir):
    managed = input_dir / "omnicam" / "cards"
    managed.mkdir(parents=True)
    keep = managed / "keep.png"
    keep.write_bytes(png_bytes())
    with pytest.raises(web.HTTPNotFound):
        await routes.cleanup_assets(FakeRequest(json_body={"files": ["cards/keep.png", "cards/missing.png"]}))
    assert keep.exists()


def test_env_limit_rejects_invalid_and_out_of_range(monkeypatch):
    monkeypatch.setenv("OMNICAM_TEST_LIMIT", "not-a-number")
    assert routes._env_limit("OMNICAM_TEST_LIMIT", 123) == 123
    monkeypatch.setenv("OMNICAM_TEST_LIMIT", "-1")
    assert routes._env_limit("OMNICAM_TEST_LIMIT", 123) == 123
    monkeypatch.setenv("OMNICAM_TEST_LIMIT", "456")
    assert routes._env_limit("OMNICAM_TEST_LIMIT", 123) == 456


@pytest.mark.asyncio
async def test_concurrent_quota_reservations_cannot_overcommit(input_dir, monkeypatch):
    monkeypatch.setattr(routes, "MAX_FOLDER_BYTES", 150)
    results = await asyncio.gather(
        routes._reserve_quota(input_dir, 100),
        routes._reserve_quota(input_dir, 100),
        return_exceptions=True,
    )
    assert sum(result is None for result in results) == 1
    assert sum(isinstance(result, web.HTTPInsufficientStorage) for result in results) == 1
    await routes._finish_quota_reservation(100)


@pytest.mark.asyncio
async def test_upload_rejects_excessive_image_dimensions(input_dir, monkeypatch):
    monkeypatch.setattr(routes, "MAX_IMAGE_PIXELS", 3)
    request = FakeRequest(FakeField("file", "large.png", [png_bytes(2, 2)]))
    with pytest.raises(web.HTTPBadRequest) as exc_info:
        await routes._save_multipart_file(request, "cards", {".png"}, 1024 * 1024)
    assert "dimensions" in exc_info.value.text
    assert not any(p.is_file() for p in (input_dir / "omnicam").rglob("*"))


def test_managed_root_rejects_symlink_escape(input_dir):
    outside = input_dir.parent / f"{input_dir.name}-outside"
    outside.mkdir(exist_ok=True)
    link = input_dir / "omnicam"
    try:
        os.symlink(outside, link, target_is_directory=True)
    except (OSError, NotImplementedError):
        pytest.skip("directory symlinks are unavailable for this test user")
    with pytest.raises(web.HTTPInternalServerError):
        routes._managed_root()
