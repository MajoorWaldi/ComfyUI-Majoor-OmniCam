"""Every OmniCam API path the frontend fetches must be served by Python.

A route rename is invisible to the unit suites -- Python keeps passing because
it only tests the new name, and the frontend keeps compiling because a URL is
just a string. The failure surfaces only in the live browser CI, as a 404 in a
diagnostics array. This test closes that gap by reading the paths straight out
of ``web-src`` and checking them against the registered route tables.
"""

from __future__ import annotations

import re
import sys
import types
from pathlib import Path

import pytest

pytest.importorskip("aiohttp")

from aiohttp import web

WEB_SRC = Path(__file__).resolve().parents[1] / "web-src"
PATH_PATTERN = re.compile(r"/majoor/omnicam[A-Za-z0-9_/.-]*")


def _registered_paths() -> set[str]:
    """Import the route modules and collect the paths they registered.

    The routes bind at import time, so the table to read is whichever one
    ``PromptServer.instance`` is holding -- another test module may already
    have installed a stub and imported them against it. Re-importing to get a
    private table would register nothing, because the compat module caches the
    PromptServer it imported.
    """
    if "server" not in sys.modules:
        server_stub = types.ModuleType("server")
        server_stub.PromptServer = types.SimpleNamespace(
            instance=types.SimpleNamespace(routes=web.RouteTableDef())
        )
        sys.modules["server"] = server_stub
    sys.modules.setdefault("folder_paths", _folder_paths_stub())

    import omnicam.extractor.jobs.routes
    import omnicam.routes  # noqa: F401
    from omnicam.comfy_compat.server import PromptServer

    return {
        route.path
        for route in PromptServer.instance.routes
        if isinstance(route, web.RouteDef)
    }


def _folder_paths_stub() -> types.ModuleType:
    stub = types.ModuleType("folder_paths")
    stub.get_input_directory = lambda: "unused"
    return stub


def _frontend_paths() -> dict[str, list[str]]:
    """Literal API paths per source file, so a failure names the caller."""
    found: dict[str, list[str]] = {}
    for source in WEB_SRC.rglob("*.js"):
        for match in PATH_PATTERN.findall(source.read_text(encoding="utf-8")):
            found.setdefault(match.rstrip("/"), []).append(
                str(source.relative_to(WEB_SRC))
            )
    return found


def test_every_frontend_api_path_is_registered():
    registered = _registered_paths()
    assert registered, "no routes were collected; the stub server wiring broke"
    frontend = _frontend_paths()
    assert "/majoor/omnicam/motion_profiles" in frontend, (
        "expected the Health panel roster fetch to still be in web-src"
    )
    assert "/majoor/omnicam/reconstruction/jobs" in registered
    assert "/majoor/omnicam/reconstruction/capabilities" in registered
    missing = {
        path: sorted(set(callers))
        for path, callers in frontend.items()
        # A jobs path is a prefix the frontend appends a job id to, so an exact
        # match is not required -- being served by some registered route is.
        if not any(
            registered_path == path or registered_path.startswith(path + "/")
            for registered_path in registered
        )
    }
    assert not missing, f"frontend fetches unregistered API paths: {missing}"
