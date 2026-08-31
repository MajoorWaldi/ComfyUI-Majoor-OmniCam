import subprocess
import sys
from pathlib import Path


def test_planning_and_monitor_modules_import_without_torch():
    """Core tests must remain collectable when optional PyTorch is absent."""
    repository_root = Path(__file__).resolve().parents[1]
    script = """
import importlib.abc
import sys


class BlockTorch(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path=None, target=None):
        if fullname == "torch" or fullname.startswith("torch."):
            raise ModuleNotFoundError("blocked optional dependency", name=fullname)
        return None


sys.meta_path.insert(0, BlockTorch())

from omnicam.adapters.ltx_guide import plan_ltx_guide
from omnicam.monitor import execute, preview
from omnicam.monitor.snapshot import build_monitor_snapshot

assert callable(plan_ltx_guide)
assert callable(build_monitor_snapshot)
"""

    result = subprocess.run(
        [sys.executable, "-c", script],
        cwd=repository_root,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
