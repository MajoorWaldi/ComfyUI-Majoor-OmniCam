"""HTTP surface for the unified catalog. ComfyUI's ``server`` / ``folder_paths``
are stubbed so the route module imports outside a running ComfyUI."""

from __future__ import annotations

import asyncio
import json
import struct
import sys
import types
from io import BytesIO

import pytest

pytest.importorskip("aiohttp")
pytest.importorskip("PIL")

from aiohttp import web
from PIL import Image

_INPUT_DIR: list[str] = ["unused"]

_fp = types.ModuleType("folder_paths")
_fp.get_input_directory = lambda: _INPUT_DIR[0]
_fp.get_output_directory = lambda: _INPUT_DIR[0]
_fp.get_temp_directory = lambda: _INPUT_DIR[0]
_server = types.ModuleType("server")


class _PromptServer:
    instance = types.SimpleNamespace(routes=web.RouteTableDef())


_server.PromptServer = _PromptServer
sys.modules.setdefault("folder_paths", _fp)
sys.modules.setdefault("server", _server)

import folder_paths as _folder_paths_module  # noqa: E402

from omnicam import routes as _routes  # noqa: E402
from omnicam.assets import routes as ar  # noqa: E402


@pytest.fixture()
def input_dir(tmp_path, monkeypatch):
    _INPUT_DIR[0] = str(tmp_path)
    monkeypatch.setattr(_folder_paths_module, "get_input_directory", lambda: str(tmp_path), raising=False)
    monkeypatch.setattr(_folder_paths_module, "get_output_directory", lambda: str(tmp_path), raising=False)
    _routes.reset_quota_cache()
    monkeypatch.setattr(_routes, "MIN_FREE_BYTES", 0)
    monkeypatch.setattr(_routes, "MAX_FOLDER_BYTES", 4 * 1024 * 1024 * 1024)
    return tmp_path


# -- fakes --------------------------------------------------------- #
class FakeField:
    def __init__(self, name, filename, data: bytes):
        self.name = name
        self.filename = filename
        self._chunks = [data[i : i + 65536] for i in range(0, len(data), 65536)] or [b""]

    async def read_chunk(self, size=1024 * 1024):
        return self._chunks.pop(0) if self._chunks else b""


class FakeMultipart:
    def __init__(self, field):
        self._field = field

    async def next(self):
        return self._field


class FakeContent:
    def __init__(self, raw):
        self._raw = raw

    async def iter_chunked(self, _size):
        yield self._raw


class FakeRequest:
    def __init__(self, *, json_body=None, field=None, match_info=None, query=None, content_length=None):
        self._field = field
        self.match_info = match_info or {}
        self.query = query or {}
        if json_body is not None:
            raw = json.dumps(json_body).encode("utf-8")
            self.content = FakeContent(raw)
            self.content_length = len(raw) if content_length is None else content_length
            self.can_read_body = True
        else:
            self.content = FakeContent(b"")
            self.content_length = content_length or 0
            self.can_read_body = False

    async def multipart(self):
        return FakeMultipart(self._field)


def _body(response):
    return json.loads(response.body)


def _run(coro):
    return asyncio.run(coro)


def minimal_glb() -> bytes:
    doc = json.dumps({"asset": {"version": "2.0"}, "meshes": []}).encode("utf-8")
    doc += b" " * ((4 - len(doc) % 4) % 4)
    json_chunk = struct.pack("<I", len(doc)) + b"JSON" + doc
    total = 12 + len(json_chunk)
    return b"glTF" + struct.pack("<II", 2, total) + json_chunk


def webp_bytes():
    out = BytesIO()
    Image.new("RGB", (4, 4), "purple").save(out, "WEBP")
    return out.getvalue()


# -- catalog reads ------------------------------------------------ #
def test_library_list_paginates_and_reports_kinds(input_dir):
    res = _run(ar.library_list(FakeRequest(query={"kind": "character", "limit": "2"})))
    payload = _body(res)
    assert payload["format"] == "majoor.omnicam.library.v2"
    assert payload["limit"] == 2
    assert all(item["kind"] == "character" for item in payload["items"])
    assert payload["kinds"]["character"] >= 3


def test_library_get_hit_and_miss(input_dir):
    ok = _run(ar.library_get(FakeRequest(match_info={"asset_id": "omnicam.vehicle.sedan_01"})))
    assert _body(ok)["asset"]["name"] == "Sedan 01"
    miss = _run(ar.library_get(FakeRequest(match_info={"asset_id": "nope"})))
    assert miss.status == 404
    assert _body(miss)["error"]["code"] == "ASSET_NOT_FOUND"


# -- mutations -------------------------------------------------- #
def test_register_patch_delete_cycle(input_dir):
    reg = _run(ar.library_register(FakeRequest(json_body={
        "id": "omnicam.prop.lantern", "name": "Lantern", "kind": "prop", "file": "props/lantern.glb"})))
    assert _body(reg)["asset"]["source"] == "user"

    patched = _run(ar.library_patch(FakeRequest(
        match_info={"asset_id": "omnicam.prop.lantern"}, json_body={"tags": ["light", "prop"]})))
    assert _body(patched)["asset"]["tags"] == ["light", "prop"]

    dele = _run(ar.library_delete(FakeRequest(match_info={"asset_id": "omnicam.prop.lantern"})))
    assert _body(dele)["removed"] is True
    assert _run(ar.library_get(FakeRequest(match_info={"asset_id": "omnicam.prop.lantern"}))).status == 404


def test_delete_builtin_is_400(input_dir):
    res = _run(ar.library_delete(FakeRequest(match_info={"asset_id": "omnicam.vehicle.sedan_01"})))
    assert res.status == 400
    assert _body(res)["error"]["code"] == "ASSET_CATALOG_INVALID"


# -- poses ---------------------------------------------------- #
def test_pose_list_save_delete(input_dir):
    listed = _body(_run(ar.library_poses_list(FakeRequest())))["poses"]
    assert listed[0]["id"] == "neutral"

    saved = _run(ar.library_poses_save(FakeRequest(json_body={
        "id": "reach", "name": "Reaching", "joints": {"upper_arm_r": [0, 0, 0, 1]}})))
    assert _body(saved)["pose"]["id"] == "reach"

    bad = _run(ar.library_poses_save(FakeRequest(json_body={"id": "x", "joints": {"h": [0, 0, 0, 0]}})))
    assert bad.status == 400
    assert _body(bad)["error"]["code"] == "POSE_INVALID_QUATERNION"

    removed = _run(ar.library_poses_delete(FakeRequest(match_info={"pose_id": "reach"})))
    assert _body(removed)["removed"] is True


# -- import + thumbnail ------------------------------------ #
def test_import_model_registers_a_catalog_row(input_dir):
    field = FakeField("file", "hero_guy.glb", minimal_glb())
    res = _run(ar.library_import(FakeRequest(
        field=field, query={"kind": "character", "name": "Hero Guy", "tags": "hero,human"},
        content_length=len(minimal_glb()))))
    payload = _body(res)
    assert payload["asset"]["kind"] == "character"
    assert payload["asset"]["file"].startswith("characters/hero_guy")
    assert payload["asset"]["source"] == "user"
    assert "hero" in payload["asset"]["tags"]
    # the file really landed under the managed library
    assert (input_dir / payload["file"]["relative"]).is_file()


def test_thumbnail_upload_updates_the_row(input_dir):
    _run(ar.library_register(FakeRequest(json_body={
        "id": "omnicam.prop.urn", "name": "Urn", "kind": "prop", "file": "props/urn.glb"})))
    field = FakeField("file", "urn.webp", webp_bytes())
    res = _run(ar.library_thumbnail(FakeRequest(
        field=field, match_info={"asset_id": "omnicam.prop.urn"})))
    payload = _body(res)
    assert payload["thumbnail"].startswith("thumbnails/")
    assert payload["asset"]["thumbnail"] == payload["thumbnail"]
    assert (input_dir / "omnicam" / "library" / payload["thumbnail"]).is_file()


def test_thumbnail_for_unknown_asset_is_404(input_dir):
    field = FakeField("file", "x.webp", webp_bytes())
    res = _run(ar.library_thumbnail(FakeRequest(field=field, match_info={"asset_id": "nope"})))
    assert res.status == 404
