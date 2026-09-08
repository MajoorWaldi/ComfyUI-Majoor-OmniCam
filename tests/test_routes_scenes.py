"""Director scene-library route tests. ComfyUI server modules are stubbed so the
route module stays importable outside a running ComfyUI instance."""

from __future__ import annotations

import asyncio
import json
import sys
import types

import pytest

pytest.importorskip("aiohttp")

from aiohttp import web

_OUTPUT_DIR: list[str] = ["unused"]

folder_paths_stub = types.ModuleType("folder_paths")
folder_paths_stub.get_input_directory = lambda: _OUTPUT_DIR[0]
folder_paths_stub.get_output_directory = lambda: _OUTPUT_DIR[0]

server_stub = types.ModuleType("server")


class _PromptServer:
    instance = types.SimpleNamespace(routes=web.RouteTableDef())


server_stub.PromptServer = _PromptServer
sys.modules.setdefault("folder_paths", folder_paths_stub)
sys.modules.setdefault("server", server_stub)

import folder_paths as folder_paths_module  # noqa: E402

from omnicam import routes, routes_scenes  # noqa: E402


@pytest.fixture()
def output_dir(tmp_path, monkeypatch):
    _OUTPUT_DIR[0] = str(tmp_path)
    monkeypatch.setattr(folder_paths_module, "get_output_directory", lambda: str(tmp_path), raising=False)
    monkeypatch.setattr(routes, "MIN_FREE_BYTES", 0)
    return tmp_path


class FakeContent:
    def __init__(self, chunks):
        self._chunks = list(chunks)

    async def iter_chunked(self, _size):
        for chunk in self._chunks:
            yield chunk


class FakeRequest:
    def __init__(self, *, json_body=None, raw_body=None, match_info=None):
        raw = raw_body if raw_body is not None else json.dumps(json_body).encode("utf-8")
        self.content = FakeContent([raw])
        self.content_length = len(raw)
        self.can_read_body = bool(raw)
        self.match_info = match_info or {}


def _run(coro):
    return asyncio.run(coro)


def _body(response: web.Response) -> dict:
    return json.loads(response.body)


def test_save_then_list_and_get_round_trips(output_dir):
    state = {"fps": 30, "objects": [], "cameras": [{"id": "camera_1"}]}
    saved = _body(_run(routes_scenes.save_scene(FakeRequest(json_body={"name": "My Shot", "state": state}))))
    assert saved["slug"] == "my-shot"
    assert saved["name"] == "My Shot"

    listed = _body(_run(routes_scenes.list_scenes(FakeRequest(raw_body=b""))))["scenes"]
    assert [item["slug"] for item in listed] == ["my-shot"]
    assert listed[0]["name"] == "My Shot"

    fetched = _body(_run(routes_scenes.get_scene(FakeRequest(match_info={"slug": "my-shot"}))))
    assert fetched["state"] == state
    assert fetched["name"] == "My Shot"


def test_save_overwrites_by_slug(output_dir):
    _run(routes_scenes.save_scene(FakeRequest(json_body={"name": "Take", "state": {"fps": 24}})))
    _run(routes_scenes.save_scene(FakeRequest(json_body={"name": "Take", "state": {"fps": 48}})))
    listed = _body(_run(routes_scenes.list_scenes(FakeRequest(raw_body=b""))))["scenes"]
    assert len(listed) == 1
    fetched = _body(_run(routes_scenes.get_scene(FakeRequest(match_info={"slug": "take"}))))
    assert fetched["state"]["fps"] == 48


def test_slug_is_sanitised_and_scoped(output_dir):
    saved = _body(_run(routes_scenes.save_scene(
        FakeRequest(json_body={"name": "../../etc/passwd", "state": {}}),
    )))
    assert "/" not in saved["slug"] and ".." not in saved["slug"]
    scene_files = list((output_dir / "omnicam" / "scenes").glob("*.omniscene.json"))
    assert len(scene_files) == 1
    assert scene_files[0].parent == (output_dir / "omnicam" / "scenes")


def test_get_missing_scene_is_404(output_dir):
    with pytest.raises(web.HTTPNotFound):
        _run(routes_scenes.get_scene(FakeRequest(match_info={"slug": "nope"})))


def test_save_rejects_non_object_state(output_dir):
    with pytest.raises(web.HTTPBadRequest):
        _run(routes_scenes.save_scene(FakeRequest(json_body={"name": "x", "state": "not-an-object"})))


def test_save_rejects_oversized_body(output_dir, monkeypatch):
    monkeypatch.setattr(routes_scenes, "MAX_EXPORT_JSON_BYTES", 200)
    huge = {"name": "big", "state": {"blob": "x" * 5000}}
    with pytest.raises(web.HTTPRequestEntityTooLarge):
        _run(routes_scenes.save_scene(FakeRequest(json_body=huge)))


def test_delete_removes_scene(output_dir):
    _run(routes_scenes.save_scene(FakeRequest(json_body={"name": "Gone", "state": {}})))
    _run(routes_scenes.delete_scene(FakeRequest(match_info={"slug": "gone"})))
    assert _body(_run(routes_scenes.list_scenes(FakeRequest(raw_body=b""))))["scenes"] == []
    with pytest.raises(web.HTTPNotFound):
        _run(routes_scenes.delete_scene(FakeRequest(match_info={"slug": "gone"})))


def test_save_refuses_when_library_is_full(output_dir, monkeypatch):
    monkeypatch.setattr(routes_scenes, "MAX_SCENES", 1)
    _run(routes_scenes.save_scene(FakeRequest(json_body={"name": "One", "state": {}})))
    with pytest.raises(web.HTTPInsufficientStorage):
        _run(routes_scenes.save_scene(FakeRequest(json_body={"name": "Two", "state": {}})))
