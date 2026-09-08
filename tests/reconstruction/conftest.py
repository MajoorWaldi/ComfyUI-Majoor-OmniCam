"""Make the reconstruction suite importable without a full ComfyUI checkout.

The ``python-reconstruction`` CI lane (and a bare ``pytest -q``) installs CPU
torch + aiohttp + pillow but *not* ComfyUI, and runs the pipelines against their
fake providers. A handful of tests still do a bare ``import folder_paths`` (then
``monkeypatch.setattr`` it) -- with no ComfyUI on ``sys.path`` that is a
collection-time ``ModuleNotFoundError``, not a skip.

Ensure a ``folder_paths`` module exists with the names those tests patch or
call. A real ComfyUI checkout (integration lane, local dev) is left untouched;
a bare stub left by another test module is topped up with any missing name.

Tests that need real ComfyUI *code* (``comfy.ldm.moge.geometry`` triangulation,
``comfy_execution``) still guard themselves with ``pytest.importorskip`` -- a
stub cannot stand in for a real mesh triangulator.
"""

from __future__ import annotations

import sys
import types

import pytest

pytest.importorskip("torch")
pytest.importorskip("aiohttp")
pytest.importorskip("PIL")


def _missing_checkpoint(*_a: object, **_k: object) -> str:
    raise FileNotFoundError("folder_paths stub: no ComfyUI model tree in this test lane")


_DEFAULTS = {
    "get_input_directory": lambda: ".",
    "get_output_directory": lambda: ".",
    "get_temp_directory": lambda: ".",
    "get_filename_list": lambda *_a, **_k: [],
    "get_folder_paths": lambda *_a, **_k: [],
    "get_full_path": lambda *_a, **_k: None,
    "get_full_path_or_raise": _missing_checkpoint,
}

try:  # a real ComfyUI checkout is on sys.path (integration lane / local dev)
    import folder_paths as _folder_paths
except ModuleNotFoundError:
    _folder_paths = types.ModuleType("folder_paths")
    sys.modules["folder_paths"] = _folder_paths

for _name, _fn in _DEFAULTS.items():
    if not hasattr(_folder_paths, _name):
        setattr(_folder_paths, _name, _fn)
