"""PyTorch stays an optional, deferred import for the planning and Monitor path.

Every module below reaches for torch inside a function, never at import time, so
the model-agnostic core stays importable -- and the core test suite stays
collectable -- in an environment that has no torch at all. That is not a style
preference: ComfyUI's own CI lane for this package installs only
``requirements-dev.txt``.

The subprocess is the point. Torch is almost certainly already imported in the
parent by the time this test runs, so the only honest way to prove a module does
not need it is a fresh interpreter that cannot import it.
"""

import subprocess
import sys
from pathlib import Path

#: Modules that must import with torch unavailable. Each one defers its own
#: ``import torch`` into the function that actually builds a tensor.
TORCH_FREE_MODULES = (
    "omnicam.adapters.ltx_guide",
    "omnicam.adapters.wan_native",
    "omnicam.core.motion_scene",
    "omnicam.core.video_sampling",
    "omnicam.extractor.pipeline",
    "omnicam.monitor",
    "omnicam.profiles.catalog",
    "omnicam.profiles.wan_move",
)


def test_planning_and_monitor_modules_import_without_torch():
    repository_root = Path(__file__).resolve().parents[1]
    # The root goes on sys.path from inside the child rather than through
    # PYTHONPATH: ComfyUI's embedded Python ships a ``._pth`` file, which makes
    # the interpreter ignore PYTHONPATH entirely.
    script = f"""
import importlib
import importlib.abc
import sys

sys.path.insert(0, {str(repository_root)!r})


class BlockTorch(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path=None, target=None):
        if fullname == "torch" or fullname.startswith("torch."):
            raise ModuleNotFoundError("blocked optional dependency", name=fullname)
        return None


sys.meta_path.insert(0, BlockTorch())

for name in {TORCH_FREE_MODULES!r}:
    importlib.import_module(name)

assert "torch" not in sys.modules, "a module imported torch at import time"

from omnicam.adapters.ltx_guide import plan_ltx_guide
from omnicam.profiles.catalog import PROFILE_REGISTRY

assert callable(plan_ltx_guide)
assert PROFILE_REGISTRY.ids
"""

    result = subprocess.run(
        [sys.executable, "-c", script],
        cwd=repository_root,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
