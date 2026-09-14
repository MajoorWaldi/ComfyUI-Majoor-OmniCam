from __future__ import annotations

import importlib
import sys
import types

import pytest


def _load_server_module(monkeypatch, prompt_server_cls, *, asset_manager_module=None):
    fake_server = types.ModuleType("server")
    fake_server.PromptServer = prompt_server_cls
    monkeypatch.setitem(sys.modules, "server", fake_server)
    if asset_manager_module is not None:
        monkeypatch.setitem(sys.modules, "app.assets.manager", asset_manager_module)
    else:
        # Make sure a stale module from a previous test doesn't leak in.
        monkeypatch.delitem(sys.modules, "app.assets.manager", raising=False)
    sys.modules.pop("omnicam.comfy_compat.server", None)
    module = importlib.import_module("omnicam.comfy_compat.server")
    return module


@pytest.fixture(autouse=True)
def _cleanup():
    yield
    sys.modules.pop("omnicam.comfy_compat.server", None)


def test_create_prompt_server_uses_the_loop_only_constructor_on_older_comfyui(monkeypatch):
    # Mirrors ComfyUI v0.31.0..v0.35.0: PromptServer(loop) with no asset_manager.
    class FakePromptServer:
        instance = None

        def __init__(self, loop):
            self.loop = loop
            FakePromptServer.instance = self

    module = _load_server_module(monkeypatch, FakePromptServer)
    loop = object()
    result = module.create_prompt_server(loop)
    assert isinstance(result, FakePromptServer)
    assert result.loop is loop
    assert FakePromptServer.instance is result


def test_create_prompt_server_passes_an_asset_manager_on_newer_comfyui(monkeypatch):
    # Mirrors current ComfyUI master: PromptServer(loop, asset_manager).
    class FakeAssetManager:
        pass

    fake_asset_manager = FakeAssetManager()
    asset_manager_module = types.ModuleType("app.assets.manager")
    asset_manager_module.default_asset_manager = lambda: fake_asset_manager

    class FakePromptServer:
        instance = None

        def __init__(self, loop, asset_manager):
            self.loop = loop
            self.asset_manager = asset_manager
            FakePromptServer.instance = self

    module = _load_server_module(monkeypatch, FakePromptServer, asset_manager_module=asset_manager_module)
    loop = object()
    result = module.create_prompt_server(loop)
    assert isinstance(result, FakePromptServer)
    assert result.loop is loop
    assert result.asset_manager is fake_asset_manager


def test_create_prompt_server_is_idempotent_once_an_instance_exists(monkeypatch):
    calls = []

    class FakePromptServer:
        instance = None

        def __init__(self, loop):
            calls.append(loop)
            FakePromptServer.instance = self

    module = _load_server_module(monkeypatch, FakePromptServer)
    first = module.create_prompt_server("loop-1")
    second = module.create_prompt_server("loop-2")
    assert first is second
    assert calls == ["loop-1"], "the constructor must only run once"


def test_create_prompt_server_tolerates_a_class_with_no_instance_attribute_yet(monkeypatch):
    # Real ComfyUI never declares `instance` as a class-level default (only
    # ever set inside __init__), so a never-instantiated class raises
    # AttributeError on direct `PromptServer.instance` access -- the helper
    # must use getattr(), not assume the attribute exists.
    class FakePromptServer:
        def __init__(self, loop):
            self.loop = loop
            FakePromptServer.instance = self

    assert not hasattr(FakePromptServer, "instance")
    module = _load_server_module(monkeypatch, FakePromptServer)
    result = module.create_prompt_server(object())
    assert isinstance(result, FakePromptServer)
