"""Upload route hardening tests. ComfyUI server modules are stubbed so the
route module stays importable outside a running ComfyUI instance."""

from __future__ import annotations

import asyncio
import json
import os
import sys
import types
from io import BytesIO

import pytest

# aiohttp and Pillow ship with ComfyUI, not with the model-agnostic core, so a
# bare `pytest -q` skips the route suite instead of erroring during collection.
pytest.importorskip("aiohttp")
pytest.importorskip("PIL")

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

import folder_paths as folder_paths_module  # noqa: E402 - stub or the real ComfyUI module

from omnicam import routes  # noqa: E402


@pytest.fixture()
def input_dir(tmp_path, monkeypatch):
    # Another test module may already have imported the real ``folder_paths``,
    # in which case the setdefault above is a no-op. Patch whichever module
    # actually got loaded so these tests never touch a real ComfyUI input dir.
    _INPUT_DIR[0] = str(tmp_path)
    monkeypatch.setattr(folder_paths_module, "get_input_directory", lambda: str(tmp_path))
    routes.reset_quota_cache()
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


class FakeContent:
    def __init__(self, chunks):
        self._chunks = list(chunks)

    async def iter_chunked(self, _size):
        for chunk in self._chunks:
            yield chunk


class FakeRequest:
    def __init__(self, field=None, json_body=None, *, raw_body=None, content_length=None):
        self._field = field
        self._json = json_body
        raw = raw_body if raw_body is not None else json.dumps(json_body).encode("utf-8")
        self.content = FakeContent([raw] if isinstance(raw, bytes) else list(raw))
        self.content_length = len(raw) if content_length is None and isinstance(raw, bytes) else content_length
        self.can_read_body = bool(raw)

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
async def test_extractor_metadata_failure_removes_completed_upload(input_dir, monkeypatch):
    monkeypatch.setattr(
        routes,
        "_validate_media_metadata",
        lambda _path: (_ for _ in ()).throw(web.HTTPBadRequest(text="invalid video")),
    )
    request = FakeRequest(FakeField("video", "broken.avi", [b"RIFF\x00\x00\x00\x00AVI invalid"]))

    with pytest.raises(web.HTTPBadRequest) as exc_info:
        await routes.upload_extractor_source(request)

    assert exc_info.value.text == "invalid video"
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


@pytest.mark.asyncio
@pytest.mark.parametrize("raw", [b"{", b"[]"])
async def test_cleanup_rejects_invalid_or_non_object_json(input_dir, raw):
    with pytest.raises(web.HTTPBadRequest):
        await routes.cleanup_assets(FakeRequest(raw_body=raw))


@pytest.mark.asyncio
async def test_cleanup_rejects_declared_and_streamed_oversize_json(input_dir):
    limit = routes.MAX_CLEANUP_JSON_BYTES
    with pytest.raises(web.HTTPRequestEntityTooLarge):
        await routes.cleanup_assets(FakeRequest(raw_body=b"{}", content_length=limit + 1))
    with pytest.raises(web.HTTPRequestEntityTooLarge):
        await routes.cleanup_assets(FakeRequest(raw_body=[b'{"files":["', b"x" * limit, b'"]}']))


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


@pytest.mark.asyncio
async def test_declared_content_length_sizes_the_reservation(input_dir, monkeypatch):
    """Two small concurrent uploads must not reject each other on a large ceiling."""
    monkeypatch.setattr(routes, "MAX_FOLDER_BYTES", 1024 * 1024)
    request = FakeRequest(FakeField("file", "card.png", [png_bytes()]))
    request.content_length = 512
    assert routes._declared_upload_size(request, 128 * 1024 * 1024) == 512

    small = png_bytes()
    for index in range(2):
        upload = FakeRequest(FakeField("file", f"card{index}.png", [small]))
        upload.content_length = len(small)
        payload = await routes._save_multipart_file(upload, "cards", {".png"}, 128 * 1024 * 1024)
        assert payload["size"] == len(small)
    assert routes._quota_reserved == 0


def test_declared_upload_size_clamps_missing_and_bogus_values(input_dir):
    request = FakeRequest()
    assert routes._declared_upload_size(request, 4) == 4
    request.content_length = "nonsense"
    assert routes._declared_upload_size(request, 1024) == 1024
    request.content_length = -5
    assert routes._declared_upload_size(request, 1024) == 1024
    request.content_length = 0
    assert routes._declared_upload_size(request, 64 * 1024 * 1024) == routes._QUOTA_RESERVATION_STEP
    request.content_length = 10**12
    assert routes._declared_upload_size(request, 1024) == 1024


@pytest.mark.asyncio
async def test_streaming_past_the_declared_size_extends_the_reservation(input_dir, monkeypatch):
    monkeypatch.setattr(routes, "MAX_FOLDER_BYTES", 8 * 1024 * 1024)
    data = png_bytes(64, 64)
    request = FakeRequest(FakeField("file", "card.png", [data]))
    request.content_length = 1  # lie: announce far less than what is streamed
    payload = await routes._save_multipart_file(request, "cards", {".png"}, 4 * 1024 * 1024)
    assert payload["size"] == len(data)
    assert routes._quota_reserved == 0
    assert routes._quota_usage == len(data)


@pytest.mark.asyncio
async def test_quota_cache_resyncs_after_external_deletion(input_dir, monkeypatch):
    managed = input_dir / "omnicam" / "cards"
    managed.mkdir(parents=True)
    orphan = managed / "orphan.png"
    orphan.write_bytes(b"x" * 4096)

    await routes._reserve_quota(input_dir, 1)
    await routes._finish_quota_reservation(1)
    assert routes._quota_usage == 4096

    # Something outside /cleanup removes the file; the cache must not stay stale.
    orphan.unlink()
    monkeypatch.setattr(routes, "QUOTA_CACHE_TTL_SECONDS", 0)
    await routes._reserve_quota(input_dir, 1)
    await routes._finish_quota_reservation(1)
    assert routes._quota_usage == 0


def test_reset_quota_cache_clears_usage_and_reservations():
    routes._quota_usage = 123
    routes._quota_reserved = 45
    routes.reset_quota_cache()
    assert routes._quota_usage is None
    assert routes._quota_reserved == 0


# --------------------------------------------------------------------------
# Camera interchange routes
# --------------------------------------------------------------------------

@pytest.fixture()
def output_dir(tmp_path, monkeypatch):
    target = tmp_path / "out"
    target.mkdir()
    monkeypatch.setattr(folder_paths_module, "get_output_directory", lambda: str(target), raising=False)
    return target


def _track_payload():
    base = {"camera_type": "perspective", "zoom": 1.0, "near": 0.05, "far": 5000.0}
    return {
        "schema_version": 1, "fps": 24, "duration_frames": 12,
        "width": 1280, "height": 720, "render_mode": "omni_ref",
        "keyframes": [
            {"frame": 0, "camera": {"position": [-2, 1, 4], "target": [0, 1, 0], "fov": 35, "roll": 0, **base},
             "interpolation": "smooth"},
            {"frame": 11, "camera": {"position": [2, 1, 4], "target": [0, 1, 0], "fov": 40, "roll": 6, **base},
             "interpolation": "smooth"},
        ],
        "objects": [],
    }


@pytest.mark.asyncio
async def test_exchange_formats_lists_only_writable_formats():
    payload = json.loads((await routes.exchange_formats(FakeRequest())).text)
    assert set(payload["export"]) == {"glb", "gltf", "usda", "chan"}
    assert "obj" not in payload["export"], "OBJ cannot carry a camera at all"
    assert "fbx" not in payload["export"]
    assert ".fbx" not in payload["import"], "FBX is decoded in the viewport, not here"
    assert "camera" in payload["notes"]["obj"]


@pytest.mark.asyncio
@pytest.mark.parametrize("fmt", ["glb", "gltf", "usda", "chan"])
async def test_export_writes_below_the_managed_output_folder(output_dir, fmt):
    response = await routes.export_camera_route(
        FakeRequest(json_body={"format": fmt, "name": "shot_a", "track": _track_payload()}))
    payload = json.loads(response.text)
    written = output_dir / "omnicam" / "exports" / payload["name"]
    assert written.is_file()
    assert written.stat().st_size == payload["size"] > 0
    assert payload["relative"].startswith("omnicam/exports/")
    # The filename is sanitised and stays inside the export folder.
    assert written.resolve().parent == (output_dir / "omnicam" / "exports").resolve()


@pytest.mark.asyncio
async def test_export_refuses_bad_input(output_dir):
    async def refused(body):
        with pytest.raises(web.HTTPBadRequest) as info:
            await routes.export_camera_route(FakeRequest(json_body=body))
        return info.value.text

    assert "Unsupported export format" in await refused({"format": "obj", "track": _track_payload()})
    assert "track object" in await refused({"format": "glb"})
    assert "Invalid camera track" in await refused({"format": "glb", "track": {"render_mode": "not_a_mode"}})
    with pytest.raises(web.HTTPBadRequest) as invalid_json:
        await routes.export_camera_route(FakeRequest(raw_body=b"{"))
    assert invalid_json.value.text == "Expected a JSON object"


@pytest.mark.asyncio
async def test_export_rejects_oversize_json_before_validation(output_dir):
    with pytest.raises(web.HTTPRequestEntityTooLarge):
        await routes.export_camera_route(
            FakeRequest(raw_body=b"{}", content_length=routes.MAX_EXPORT_JSON_BYTES + 1),
        )


@pytest.mark.asyncio
async def test_export_name_cannot_escape_the_export_folder(output_dir):
    response = await routes.export_camera_route(
        FakeRequest(json_body={"format": "chan", "name": "../../escape", "track": _track_payload()}))
    payload = json.loads(response.text)
    assert "/" not in payload["name"] and "\\" not in payload["name"]
    assert (output_dir / "omnicam" / "exports" / payload["name"]).is_file()
    assert not (output_dir.parent / "escape.chan").exists()


@pytest.mark.asyncio
async def test_import_round_trips_an_exported_camera(output_dir):
    exported = json.loads((await routes.export_camera_route(
        FakeRequest(json_body={"format": "glb", "name": "shot_b", "track": _track_payload()}))).text)
    data = (output_dir / "omnicam" / "exports" / exported["name"]).read_bytes()

    response = await routes.import_camera_route(FakeRequest(FakeField("file", "shot_b.glb", [data])))
    track = json.loads(response.text)["track"]
    assert track["fps"] == 24
    assert track["duration_frames"] == 12
    assert len(track["keyframes"]) == 2, "the lossless sidecar restores the authored keys, not the bake"


@pytest.mark.asyncio
async def test_import_refuses_unsupported_and_empty_files():
    async def refused(filename, chunks):
        # aiohttp puts the explanation in `.text`; str(exc) is only the status.
        with pytest.raises(web.HTTPBadRequest) as info:
            await routes.import_camera_route(FakeRequest(FakeField("file", filename, chunks)))
        return info.value.text

    assert "Unsupported camera file" in await refused("mesh.obj", [b"v 0 0 0"])
    assert "Empty uploads" in await refused("empty.chan", [])
    assert "Could not read a camera" in await refused("junk.chan", [b"# nothing here\n"])


@pytest.mark.asyncio
async def test_import_enforces_a_size_limit(monkeypatch):
    monkeypatch.setattr(routes, "MAX_IMPORT_BYTES", 16)
    with pytest.raises(web.HTTPRequestEntityTooLarge):
        await routes.import_camera_route(FakeRequest(FakeField("file", "big.chan", [b"0 " * 64])))
