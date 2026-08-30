from __future__ import annotations

import asyncio
import importlib
import sys
import types

import pytest


@pytest.fixture
def lifecycle(monkeypatch):
    latest = types.ModuleType("comfy_api.latest")
    latest.ComfyAPI = object
    latest.ComfyExtension = object
    latest.IO = object
    latest.InputImpl = object
    latest.UI = object
    latest.VideoComponents = object
    comfy_api = types.ModuleType("comfy_api")
    server = types.ModuleType("server")
    server.PromptServer = type("PromptServer", (), {"instance": None})
    monkeypatch.setitem(sys.modules, "comfy_api", comfy_api)
    monkeypatch.setitem(sys.modules, "comfy_api.latest", latest)
    monkeypatch.setitem(sys.modules, "server", server)
    sys.modules.pop("omnicam.comfy_compat", None)
    sys.modules.pop("omnicam.comfy_compat.api", None)
    sys.modules.pop("omnicam.comfy_compat.server", None)
    sys.modules.pop("omnicam.comfy_compat.lifecycle", None)
    module = importlib.import_module("omnicam.comfy_compat.lifecycle")
    yield module
    for module_name in tuple(sys.modules):
        if module_name == "omnicam.comfy_compat" or module_name.startswith("omnicam.comfy_compat."):
            sys.modules.pop(module_name, None)


def test_shutdown_callback_is_registered_once_and_invoked(lifecycle):
    app = types.SimpleNamespace(on_shutdown=[])
    prompt_server = types.SimpleNamespace(app=app)
    calls: list[str] = []

    assert lifecycle.register_shutdown_callback("extractor", lambda: calls.append("done"), server=prompt_server)
    assert lifecycle.register_shutdown_callback("extractor", lambda: calls.append("again"), server=prompt_server)
    assert len(app.on_shutdown) == 1

    asyncio.run(app.on_shutdown[0](app))
    assert calls == ["done"]


def test_shutdown_callback_returns_false_without_aiohttp_app(lifecycle):
    assert not lifecycle.register_shutdown_callback("extractor", lambda: None, server=object())
