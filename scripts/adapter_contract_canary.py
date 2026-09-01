"""Check current external adapter sources against OmniCam's pinned contracts.

The canary deliberately parses source instead of importing third-party custom
nodes: their optional model dependencies should not be installed merely to
notice that a node class or an input name changed upstream.
"""

from __future__ import annotations

import ast
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from omnicam.adapters.registry import ADAPTER_INFO  # noqa: E402


def _class_strings(path: Path, class_names: list[str]) -> dict[str, set[str]]:
    """Return string literals declared inside each requested class."""
    try:
        tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    except (OSError, SyntaxError, UnicodeDecodeError):
        return {}
    found: dict[str, set[str]] = {}
    for item in ast.walk(tree):
        if not isinstance(item, ast.ClassDef) or item.name not in class_names:
            continue
        found[item.name] = {
            value.value for value in ast.walk(item)
            if isinstance(value, ast.Constant) and isinstance(value.value, str)
        }
    return found


def _available_classes(source_root: Path, class_names: list[str]) -> dict[str, set[str]]:
    classes: dict[str, set[str]] = {}
    for path in source_root.rglob("*.py"):
        classes.update(_class_strings(path, class_names))
    return classes


def _verify_requirement(
    adapter: str, requirement: dict[str, list[str]], classes: dict[str, set[str]],
) -> list[str]:
    expected = set(requirement["expected_inputs"] + requirement["expected_widgets"])
    candidates = requirement["any_of"]
    for class_name in candidates:
        declared = classes.get(class_name)
        if declared is not None and expected <= declared:
            return []
    details = []
    for class_name in candidates:
        if class_name not in classes:
            details.append(f"{class_name}: class missing")
        else:
            missing = sorted(expected - classes[class_name])
            details.append(f"{class_name}: missing literals {missing}")
    return [f"{adapter}: " + "; ".join(details)]


def verify(source_roots: dict[str, Path]) -> list[str]:
    """Return deviations in the external sources from pinned OmniCam contracts."""
    errors: list[str] = []
    # Driven by what the caller supplied rather than a hardcoded list: the
    # contract ids are profile ids now, and a stale tuple here silently stopped
    # checking a contract when one was renamed.
    for adapter, source_root in source_roots.items():
        contract: dict[str, Any] = ADAPTER_INFO[adapter]
        if not source_root.is_dir():
            errors.append(f"{adapter}: source directory missing: {source_root}")
            continue
        candidates = [name for item in contract["requirements"] for name in item["any_of"]]
        classes = _available_classes(source_root, candidates)
        for requirement in contract["requirements"]:
            errors.extend(_verify_requirement(adapter, requirement, classes))
    return errors


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: adapter_contract_canary.py <ltx-source> <wan-video-wrapper-source>")
        return 2
    roots = {
        "ltx25_motion_track": Path(argv[1]),
        "wanvideo_ati": Path(argv[2]),
    }
    errors = verify(roots)
    if errors:
        print("External adapter contract changed:")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print("External adapter contract canary: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
