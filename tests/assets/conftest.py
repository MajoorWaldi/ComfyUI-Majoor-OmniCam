"""Make the unified-asset suite importable without a full ComfyUI checkout.

Mirrors ``tests/reconstruction/conftest.py``: a bare ``pytest -q`` has no
``folder_paths`` module, and :mod:`omnicam.assets.storage` imports it lazily
when no ``input_root`` is passed. Provide a stub with the one name it calls.
"""

from __future__ import annotations

import sys
import types

_DEFAULTS = {
    "get_input_directory": lambda: ".",
    "get_output_directory": lambda: ".",
    "get_temp_directory": lambda: ".",
}

try:  # a real ComfyUI checkout is on sys.path (integration lane / local dev)
    import folder_paths as _folder_paths
except ModuleNotFoundError:
    _folder_paths = types.ModuleType("folder_paths")
    sys.modules["folder_paths"] = _folder_paths

for _name, _fn in _DEFAULTS.items():
    if not hasattr(_folder_paths, _name):
        setattr(_folder_paths, _name, _fn)
