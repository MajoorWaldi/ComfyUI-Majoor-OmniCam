"""Offline package sanity checks that do not require ComfyUI to be installed."""
from __future__ import annotations

import ast
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    for path in ROOT.rglob("*.py"):
        if any(part in path.parts for part in ("__pycache__", ".venv", "node_modules")):
            continue
        ast.parse(path.read_text(encoding="utf-8"), filename=str(path))

    for example in ("omnicam_track.example.json", "omnicam_sequence.example.json"):
        json.loads((ROOT / "examples" / example).read_text(encoding="utf-8"))

    node_list = json.loads((ROOT / "node_list.json").read_text(encoding="utf-8"))["nodes"]
    if len(set(node_list)) != len(node_list):
        raise SystemExit("node_list.json must contain unique OmniCam node names")
    declared_nodes: set[str] = set()
    for path in (ROOT / "omnicam" / "nodes").rglob("*.py"):
        tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        declared_nodes.update(item.name for item in ast.walk(tree) if isinstance(item, ast.ClassDef))
    missing_nodes = [node for node in node_list if node not in declared_nodes]
    if missing_nodes:
        raise SystemExit(f"node_list.json references missing classes: {missing_nodes}")

    pyproject_version = re.search(r'^version = "([^"]+)"', (ROOT / "pyproject.toml").read_text(encoding="utf-8"), re.MULTILINE).group(1)
    package_version = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
    python_version = re.search(r'^__version__ = "([^"]+)"', (ROOT / "omnicam" / "__init__.py").read_text(encoding="utf-8"), re.MULTILINE).group(1)
    if len({pyproject_version, package_version, python_version}) != 1:
        raise SystemExit("Project versions are not synchronized")

    required = [
        "AGENTS.md",
        "README.md",
        "THIRD_PARTY_NOTICES.md",
        "docs/NODES.md",
        "docs/SHORTCUTS.md",
        "docs/SECURITY.md",
        "web/omnicam.js",
        "web/assets/omnicam-icon.svg",
        "web/assets/omnicam-banner.svg",
        "package-lock.json",
        "omnicam/nodes/__init__.py",
    ]
    missing = [p for p in required if not (ROOT / p).exists()]
    if missing:
        raise SystemExit(f"Missing required files: {missing}")

    print("Majoor OmniCam package sanity check: OK")


if __name__ == "__main__":
    main()
