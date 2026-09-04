import importlib
import sys
import types

import pytest


def test_comfy_compat_reexports_the_supported_v3_surface():
    pytest.importorskip("comfy_api.latest")

    from omnicam.comfy_compat import IO, UI, ComfyAPI, ComfyExtension, InputImpl, PromptServer

    assert ComfyAPI is not None
    assert ComfyExtension is not None
    assert IO is not None
    assert InputImpl is not None
    assert PromptServer is not None
    assert UI is not None


@pytest.fixture
def _reload_api(monkeypatch):
    """Rebuild ``omnicam.comfy_compat.api`` against injected ``comfy_api`` modules."""

    def _load(*, stable: types.ModuleType | None, latest: types.ModuleType) -> types.ModuleType:
        comfy_api = types.ModuleType("comfy_api")
        monkeypatch.setitem(sys.modules, "comfy_api", comfy_api)
        monkeypatch.setitem(sys.modules, "comfy_api.latest", latest)
        if stable is not None:
            monkeypatch.setitem(sys.modules, "comfy_api.v0_0_2", stable)
        else:
            monkeypatch.delitem(sys.modules, "comfy_api.v0_0_2", raising=False)
        # Only ``api`` is rebuilt: it resolves the V3 surface at import time. The
        # rest of the package (execution, server, lifecycle) is left in place so
        # other test modules keep their references.
        monkeypatch.delitem(sys.modules, "omnicam.comfy_compat.api", raising=False)
        return importlib.import_module("omnicam.comfy_compat.api")

    yield _load
    sys.modules.pop("omnicam.comfy_compat.api", None)


def _fake_latest() -> types.ModuleType:
    latest = types.ModuleType("comfy_api.latest")
    for attr in ("IO", "UI", "ComfyAPI", "ComfyExtension", "InputImpl", "VideoComponents"):
        setattr(latest, attr, type(f"Latest{attr}", (), {}))
    return latest


def test_symbols_resolve_from_the_stable_api_before_latest(_reload_api):
    latest = _fake_latest()
    stable = types.ModuleType("comfy_api.v0_0_2")
    for attr in ("IO", "UI", "ComfyAPI", "ComfyExtension", "InputImpl"):
        setattr(stable, attr, type(f"Stable{attr}", (), {}))
    # The stable module exposes VideoComponents only through ``Types``.
    stable.Types = type("Types", (), {"VideoComponents": type("StableVC", (), {})})

    api = _reload_api(stable=stable, latest=latest)

    assert api.IO is stable.IO
    assert api.InputImpl is stable.InputImpl
    assert api.VideoComponents is stable.Types.VideoComponents


def test_missing_stable_symbol_falls_back_to_latest(_reload_api):
    latest = _fake_latest()
    stable = types.ModuleType("comfy_api.v0_0_2")
    # Stable is present but exposes nothing OmniCam needs.
    api = _reload_api(stable=stable, latest=latest)

    assert api.IO is latest.IO
    assert api.VideoComponents is latest.VideoComponents


def test_resolution_works_with_only_latest_available(_reload_api):
    latest = _fake_latest()
    api = _reload_api(stable=None, latest=latest)

    assert api.ComfyExtension is latest.ComfyExtension
    assert api.VideoComponents is latest.VideoComponents
