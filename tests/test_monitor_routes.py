from __future__ import annotations

import json
import sys
import types

import pytest

pytest.importorskip("aiohttp")
from aiohttp import web

server_stub = types.ModuleType("server")
server_stub.PromptServer = type("PromptServer", (), {"instance": types.SimpleNamespace(routes=web.RouteTableDef())})
sys.modules.setdefault("server", server_stub)

from omnicam import routes_monitor  # noqa: E402 - server stub must exist before route import


class Request:
    def __init__(self, payload, content_length=None):
        self.payload = payload
        raw = json.dumps(payload).encode("utf-8")
        self.content_length = len(raw) if content_length is None else content_length
        self.can_read_body = True
        self.content = Content(raw)


class Content:
    def __init__(self, raw):
        self.raw = raw

    async def iter_chunked(self, _size):
        yield self.raw


def _track():
    return {"fps": 24, "duration_frames": 2, "keyframes": [{"frame": 0, "camera": {}}]}


def _body(adapter="h3"):
    return {"track": _track(), "adapter": adapter, "proxy_available": True, "settings": {"length": 81}}


@pytest.mark.asyncio
async def test_monitor_snapshot_route_returns_lightweight_snapshot(monkeypatch):
    monkeypatch.setattr(routes_monitor, "detect_capabilities", lambda: {"capabilities": [{"adapter": "h3", "state": "verified"}]})
    response = await routes_monitor.monitor_snapshot_route(Request(_body()))
    payload = json.loads(response.body)
    assert response.status == 200
    assert payload["format"] == "majoor.omnicam.monitor.snapshot.v1"
    assert payload["preview"]["kind"] == "proxy_video"


@pytest.mark.asyncio
async def test_monitor_snapshot_route_rejects_unknown_adapter_and_invalid_track():
    with pytest.raises(web.HTTPBadRequest):
        await routes_monitor.monitor_snapshot_route(Request(_body("unknown")))
    body = _body()
    body["track"] = "C:/arbitrary/file.json"
    with pytest.raises(web.HTTPBadRequest):
        await routes_monitor.monitor_snapshot_route(Request(body))


@pytest.mark.asyncio
async def test_monitor_snapshot_route_rejects_oversized_payload_before_json_parse():
    request = Request(_body(), content_length=routes_monitor.MAX_MONITOR_REQUEST_BYTES + 1)
    with pytest.raises(web.HTTPRequestEntityTooLarge):
        await routes_monitor.monitor_snapshot_route(request)
