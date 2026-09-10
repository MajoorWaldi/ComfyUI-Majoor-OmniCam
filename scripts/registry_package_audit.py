"""Audit the exact ``node.zip`` that ships to the Comfy Registry.

Run it immediately after the Registry pack command::

    comfy --skip-prompt --no-enable-telemetry node pack
    python scripts/registry_package_audit.py node.zip

It **fails** (exit 1) on:

* development-only paths shipped by accident (``tests/``, ``scripts/``,
  ``web-src/``, ``.github/``, ``node_modules/``, ``.venv/``);
* missing runtime paths (``web/omnicam.js``, ``web-chunks/*.js``, ``omnicam/``,
  ``pyproject.toml``);
* a direct runtime ``eval(...)`` / ``exec(...)`` or a ``pip install`` subprocess
  in shipped Python -- matched on the AST, never on comment/docstring text;
* the return of avoidable scanner triggers OmniCam removed on purpose:
  ``os.environ`` / ``os.getenv`` reads in shipped code, and the string-based
  ``importlib.import_module("comfy_extras.nodes_moge")``.

It **reports** (exit 0) known-legitimate heuristics -- ``multiprocessing``
connection ``send``/``recv`` for the isolated DPVO child, and
``.bind(`` / ``.connect(`` / ``.listen(`` in generated JavaScript (Three.js,
WebAudio, ordinary event/function binding) -- so a Registry reviewer sees them
acknowledged rather than hidden.
"""

from __future__ import annotations

import ast
import sys
import zipfile
from dataclasses import dataclass, field

FORBIDDEN_TOP_DIRS = ("tests", "scripts", "web-src", ".github", "node_modules", ".venv")
REQUIRED_FILES = ("web/omnicam.js", "pyproject.toml")
REQUIRED_PREFIXES = ("omnicam/",)

# Reported, never failed: legitimate local IPC / browser APIs.
IPC_MARKERS = ("connection.send(", "connection.recv(", ".Connection")
JS_BINDING_MARKERS = (".bind(", ".connect(", ".listen(")


@dataclass
class AuditResult:
    violations: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.violations


def _members(archive: zipfile.ZipFile) -> list[str]:
    return [name for name in archive.namelist() if not name.endswith("/")]


def _strip_wrapper_dir(names: list[str]) -> list[str]:
    """`comfy node pack` may nest everything under one top folder; drop it."""
    tops = {name.split("/", 1)[0] for name in names if "/" in name}
    if len(tops) == 1 and not any("/" not in name for name in names):
        prefix = f"{tops.pop()}/"
        return [name[len(prefix):] for name in names]
    return names


def _check_paths(names: list[str], result: AuditResult) -> None:
    for name in names:
        top = name.split("/", 1)[0]
        if top in FORBIDDEN_TOP_DIRS or top.endswith(".venv"):
            result.violations.append(f"development path shipped: {name}")

    present = set(names)
    for required in REQUIRED_FILES:
        if required not in present:
            result.violations.append(f"required runtime file missing: {required}")
    for prefix in REQUIRED_PREFIXES:
        if not any(name.startswith(prefix) for name in names):
            result.violations.append(f"required runtime tree missing: {prefix}")
    if not any(name.startswith("web-chunks/") and name.endswith(".js") for name in names):
        result.violations.append("required runtime tree missing: web-chunks/*.js")


def _is_os_environ_attr(node: ast.AST) -> bool:
    return (
        isinstance(node, ast.Attribute)
        and node.attr == "environ"
        and isinstance(node.value, ast.Name)
        and node.value.id == "os"
    )


def _is_os_environ_read(node: ast.AST) -> bool:
    """A *read* of process environment: os.getenv(...), os.environ.get(...),
    os.environ[...]. A write (os.environ.pop / __setitem__ / clear) is fine --
    dpvo_worker legitimately pops inherited CUDA allocator tuning."""
    # os.getenv("X")
    if (
        isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "getenv"
        and isinstance(node.func.value, ast.Name)
        and node.func.value.id == "os"
    ):
        return True
    # os.environ.get("X"[, default])
    if (
        isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "get"
        and _is_os_environ_attr(node.func.value)
    ):
        return True
    # os.environ["X"] read (Load context only)
    return (
        isinstance(node, ast.Subscript)
        and _is_os_environ_attr(node.value)
        and isinstance(getattr(node, "ctx", None), ast.Load)
    )


def _is_dynamic_moge_import(node: ast.AST) -> bool:
    return (
        isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "import_module"
        and isinstance(node.func.value, ast.Name)
        and node.func.value.id == "importlib"
        and bool(node.args)
        and isinstance(node.args[0], ast.Constant)
        and isinstance(node.args[0].value, str)
        and node.args[0].value.startswith("comfy_extras.nodes_moge")
    )


def _is_pip_install_subprocess(node: ast.AST) -> bool:
    if not isinstance(node, ast.Call):
        return False
    func = node.func
    name = func.attr if isinstance(func, ast.Attribute) else getattr(func, "id", "")
    if name not in {"run", "call", "check_call", "check_output", "Popen"}:
        return False
    flat: list[str] = []
    for arg in node.args:
        if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
            flat.append(arg.value)
        elif isinstance(arg, (ast.List, ast.Tuple)):
            flat += [e.value for e in arg.elts if isinstance(e, ast.Constant) and isinstance(e.value, str)]
    joined = " ".join(flat).lower()
    return "pip" in joined and "install" in joined


def _scan_python(name: str, source: str, result: AuditResult) -> None:
    try:
        tree = ast.parse(source, filename=name)
    except SyntaxError as exc:  # a shipped .py that will not import
        result.violations.append(f"shipped Python does not parse: {name} ({exc})")
        return
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in {"eval", "exec"}:
            result.violations.append(f"{name}:{node.lineno}: direct {node.func.id}() in shipped code")
        if _is_pip_install_subprocess(node):
            result.violations.append(f"{name}:{node.lineno}: pip install subprocess in shipped code")
        if _is_os_environ_read(node):
            result.violations.append(
                f"{name}:{getattr(node, 'lineno', '?')}: os.environ / os.getenv read returned "
                "(runtime limits must stay fixed constants)"
            )
        if _is_dynamic_moge_import(node):
            result.violations.append(
                f"{name}:{node.lineno}: importlib.import_module(\"comfy_extras.nodes_moge\") returned "
                "(use a normal lazy import)"
            )


def audit(zip_path: str) -> AuditResult:
    result = AuditResult()
    with zipfile.ZipFile(zip_path) as archive:
        raw_names = _members(archive)
        names = _strip_wrapper_dir(raw_names)
        raw_by_logical = dict(zip(names, raw_names, strict=True))
        _check_paths(names, result)

        ipc_hits: list[str] = []
        js_binding_hits: list[str] = []
        for logical, raw in raw_by_logical.items():
            if logical.endswith(".py") and (logical.startswith("omnicam/") or logical == "__init__.py"):
                source = archive.read(raw).decode("utf-8", "replace")
                _scan_python(logical, source, result)
                if any(marker in source for marker in IPC_MARKERS):
                    ipc_hits.append(logical)
            if logical.endswith(".js"):
                text = archive.read(raw).decode("utf-8", "replace")
                if any(marker in text for marker in JS_BINDING_MARKERS):
                    js_binding_hits.append(logical)

    if ipc_hits:
        result.notes.append(
            "multiprocessing IPC (isolated DPVO child, not networking): "
            + ", ".join(sorted(ipc_hits))
        )
    if js_binding_hits:
        result.notes.append(
            f".bind/.connect/.listen in {len(js_binding_hits)} generated JS file(s) "
            "(Three.js / WebAudio / event binding, reviewed as false positives)"
        )
    return result


def main(argv: list[str] | None = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    if len(args) != 1:
        print("usage: python scripts/registry_package_audit.py node.zip", file=sys.stderr)
        return 2
    result = audit(args[0])
    for note in result.notes:
        print(f"note: {note}")
    for violation in result.violations:
        print(f"FAIL: {violation}", file=sys.stderr)
    if result.ok:
        print("Registry package audit: OK")
        return 0
    print(f"Registry package audit: {len(result.violations)} violation(s)", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
