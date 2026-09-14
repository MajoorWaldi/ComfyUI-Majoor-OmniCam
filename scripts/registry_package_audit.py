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
  ``os.environ`` / ``os.getenv`` reads in shipped code -- except the narrow,
  by-name ``ALLOWED_ENV_VAR_READS`` allowlist below (the OmniCam Agent v1
  provider credential/SSRF overrides; see omnicam/agent/providers/) -- the
  string-based ``importlib.import_module("comfy_extras.nodes_moge")``, and
  duplex ``Connection.send``/``recv`` in the DPVO worker.

It **reports** (exit 0) a provenance breakdown of the ``.bind(`` /
``.connect(`` / ``.listen(`` hits in the shipped JavaScript, split into
OmniCam's own bundle and the ``vendor-*`` chunks (three.js, mediabunny). A
Registry reviewer chasing a networking heuristic can then see at a glance
whether it landed on our code or on upstream library code we bundle.
"""

from __future__ import annotations

import ast
import hashlib
import json
import sys
import zipfile
from dataclasses import dataclass, field

FORBIDDEN_TOP_DIRS = ("tests", "scripts", "web-src", ".github", "node_modules", ".venv")
REQUIRED_FILES = ("web/omnicam.js", "pyproject.toml")
REQUIRED_PREFIXES = ("omnicam/",)
ALLOWED_NETWORK_PREFIXES = ("omnicam/agent/providers/",)

# Removed on purpose and never to return: the DPVO child talks over a one-way
# ``multiprocessing.Queue`` plus a ``multiprocessing.Event``, so nothing in
# shipped Python should look like a duplex connection again.
FORBIDDEN_IPC_MARKERS = ("connection.send(", "connection.recv(", "Pipe(duplex=")

#: Heuristics a Registry scanner reads as networking or event wiring. Counted
#: per file and attributed, never failed -- ``.bind(`` inside three.js is not a
#: fact about OmniCam, and the report has to be able to say so.
JS_BINDING_MARKERS = (".bind(", ".connect(", ".listen(")

#: Emitted by vite's manualChunks (see vite.config.mjs). Everything else under
#: web-chunks/ is OmniCam's own source.
VENDOR_CHUNK_PREFIX = "vendor-"

#: The *only* environment variables shipped Python may ever read, each a
#: narrow, explicitly reviewed OmniCam Agent v1 override: per-provider
#: credential precedence (environment beats the local SecretStore) and the
#: default-deny SSRF gate for a custom provider base_url. Only a *literal*
#: string naming one of these -- never a dynamically computed name, even one
#: that happens to match -- is exempted; everything else still fails.
ALLOWED_ENV_VAR_READS = (
    "OMNICAM_OPENAI_API_KEY",
    "OMNICAM_OPENAI_COMPAT_API_KEY",
    "OMNICAM_ANTHROPIC_API_KEY",
    "OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS",
)


@dataclass
class AuditResult:
    violations: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)
    files: int = 0
    sha256: str = ""
    network_exemptions: list[str] = field(default_factory=list)
    javascript_provenance: dict[str, dict[str, dict[str, int]]] = field(default_factory=dict)

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


def _allowed_env_var_name(node: ast.AST) -> str | None:
    """The literal env var name this read targets, if -- and only if -- it is
    a plain string constant matching ``ALLOWED_ENV_VAR_READS`` exactly.
    Anything else (a different name, or one computed rather than literal)
    returns None, which keeps the read a violation."""
    if isinstance(node, ast.Call) and node.args:
        target = node.args[0]
    elif isinstance(node, ast.Subscript):
        target = node.slice
    else:
        return None
    if isinstance(target, ast.Constant) and isinstance(target.value, str) and target.value in ALLOWED_ENV_VAR_READS:
        return target.value
    return None


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


def _is_process_execution(node: ast.AST) -> bool:
    if isinstance(node, (ast.Import, ast.ImportFrom)):
        names = [alias.name for alias in node.names]
        if (isinstance(node, ast.Import) and any(name == "subprocess" for name in names)) or (
            isinstance(node, ast.ImportFrom) and node.module == "subprocess"
        ):
            return True
    if not isinstance(node, ast.Call):
        return False
    func = node.func
    if isinstance(func, ast.Attribute):
        if isinstance(func.value, ast.Name) and func.value.id == "subprocess":
            return True
        if (
            isinstance(func.value, ast.Name)
            and func.value.id == "os"
            and func.attr in {"system", "popen"}
        ):
            return True
        if (
            isinstance(func.value, ast.Name)
            and func.value.id == "asyncio"
            and func.attr in {"create_subprocess_exec", "create_subprocess_shell"}
        ):
            return True
    return False


def _is_network_client(node: ast.AST) -> bool:
    if isinstance(node, ast.Import):
        return any(alias.name.split(".", 1)[0] in {"requests", "httpx", "aiohttp"} for alias in node.names)
    if isinstance(node, ast.ImportFrom):
        return node.module in {"urllib.request", "requests", "httpx"} or (
            node.module == "aiohttp" and any(alias.name == "ClientSession" for alias in node.names)
        )
    if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute):
        return False
    func = node.func
    if isinstance(func.value, ast.Name) and func.value.id in {"requests", "httpx"}:
        return True
    if isinstance(func.value, ast.Attribute) and func.value.attr == "request":
        return func.attr in {"urlopen", "Request"}
    return isinstance(func.value, ast.Name) and func.value.id == "aiohttp" and func.attr == "ClientSession"


def _request_derived_names(tree: ast.AST) -> set[str]:
    derived: set[str] = set()
    for node in ast.walk(tree):
        if not isinstance(node, ast.Assign):
            continue
        value = node.value
        if not (
            isinstance(value, ast.Subscript)
            and isinstance(value.value, ast.Name)
            and value.value.id in {"body", "data", "payload"}
        ):
            continue
        if not any(isinstance(parent, ast.Name) and parent.id == "request" for parent in ast.walk(tree)):
            continue
        for target in node.targets:
            if isinstance(target, ast.Name):
                derived.add(target.id)
    return derived


def _is_request_derived_host_path(node: ast.AST, derived: set[str]) -> bool:
    if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute):
        return False
    if node.func.attr not in {"expanduser", "resolve", "is_dir", "rglob"}:
        return False
    parent = node.func.value
    if not isinstance(parent, ast.Call) or not isinstance(parent.func, ast.Name) or parent.func.id != "Path":
        return False
    return any(isinstance(arg, ast.Name) and arg.id in derived for arg in parent.args)


def _scan_python(name: str, source: str, result: AuditResult) -> None:
    try:
        tree = ast.parse(source, filename=name)
    except SyntaxError as exc:  # a shipped .py that will not import
        result.violations.append(f"shipped Python does not parse: {name} ({exc})")
        return
    derived_names = _request_derived_names(tree)
    allowed_network = name.startswith(ALLOWED_NETWORK_PREFIXES)
    network_reported = False
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in {"eval", "exec"}:
            result.violations.append(f"{name}:{node.lineno}: direct {node.func.id}() in shipped code")
        if _is_process_execution(node):
            result.violations.append(f"{name}:{getattr(node, 'lineno', '?')}: process execution primitive in shipped code")
        if _is_pip_install_subprocess(node):
            result.violations.append(f"{name}:{node.lineno}: pip install subprocess in shipped code")
        if _is_network_client(node):
            if allowed_network:
                network_reported = True
            else:
                result.violations.append(f"{name}:{getattr(node, 'lineno', '?')}: outbound network client outside reviewed provider layer")
        if _is_os_environ_read(node) and not _allowed_env_var_name(node):
            result.violations.append(
                f"{name}:{getattr(node, 'lineno', '?')}: os.environ / os.getenv read returned "
                "(runtime limits must stay fixed constants; only ALLOWED_ENV_VAR_READS is exempt)"
            )
        if _is_dynamic_moge_import(node):
            result.violations.append(
                f"{name}:{node.lineno}: importlib.import_module(\"comfy_extras.nodes_moge\") returned "
                "(use a normal lazy import)"
            )
        if _is_request_derived_host_path(node, derived_names):
            result.violations.append(f"{name}:{getattr(node, 'lineno', '?')}: request-derived host path operation in shipped code")
    if allowed_network and network_reported:
        result.notes.append(f"allowed-network: {name} — reviewed provider transport")
        result.network_exemptions.append(f"{name} — reviewed provider transport")


def audit(zip_path: str) -> AuditResult:
    result = AuditResult()
    with zipfile.ZipFile(zip_path) as archive:
        raw_names = _members(archive)
        names = _strip_wrapper_dir(raw_names)
        result.files = len(names)
        with open(zip_path, "rb") as archive_file:
            result.sha256 = hashlib.sha256(archive_file.read()).hexdigest()
        raw_by_logical = dict(zip(names, raw_names, strict=True))
        _check_paths(names, result)

        for logical in names:
            if logical.startswith("omnicam/assets/bootstrap/") or logical == "omnicam/assets/bootstrap_sources.json":
                result.violations.append(f"developer bootstrap shipped: {logical}")

        own_js: dict[str, dict[str, int]] = {}
        vendor_js: dict[str, dict[str, int]] = {}
        for logical, raw in raw_by_logical.items():
            if logical.endswith(".py") and (logical.startswith("omnicam/") or logical == "__init__.py"):
                source = archive.read(raw).decode("utf-8", "replace")
                _scan_python(logical, source, result)
                for marker in FORBIDDEN_IPC_MARKERS:
                    if marker in source:
                        result.violations.append(
                            f"{logical}: {marker!r} returned -- the DPVO child uses a one-way "
                            "multiprocessing.Queue and a stop Event, not a duplex connection"
                        )
            if logical.endswith(".js"):
                text = archive.read(raw).decode("utf-8", "replace")
                counts = {m: text.count(m) for m in JS_BINDING_MARKERS if m in text}
                if not counts:
                    continue
                bucket = vendor_js if _is_vendor_chunk(logical) else own_js
                bucket[logical] = counts
            data = archive.read(raw).lower()
            if b"pip install" in data:
                result.violations.append(f"{logical}: literal 'pip install' is not allowed in the Registry archive")

    result.javascript_provenance = {"omnicam": own_js, "third_party": vendor_js}
    result.notes.extend(_provenance_report(own_js, vendor_js))
    return result


def _is_vendor_chunk(logical: str) -> bool:
    """True for a bundled third-party chunk (three.js, mediabunny)."""
    return logical.rsplit("/", 1)[-1].startswith(VENDOR_CHUNK_PREFIX)


def _provenance_report(
    own: dict[str, dict[str, int]], vendor: dict[str, dict[str, int]]
) -> list[str]:
    """Attribute every ``.bind`` / ``.connect`` / ``.listen`` hit to its author.

    A Registry reviewer reading a heuristic report needs one question answered:
    did OmniCam write this, or is it upstream library code we bundle? Ideally
    the OmniCam column is all zeros and every hit sits under a ``vendor-*``
    chunk whose licence is in THIRD_PARTY_NOTICES.
    """
    lines = []
    for label, files in (("OMNICAM SOURCE", own), ("THIRD PARTY", vendor)):
        totals = {marker: 0 for marker in JS_BINDING_MARKERS}
        for counts in files.values():
            for marker, count in counts.items():
                totals[marker] += count
        summary = ", ".join(f"{marker} {totals[marker]}" for marker in JS_BINDING_MARKERS)
        lines.append(f"{label}: {summary}")
        for name in sorted(files):
            detail = ", ".join(f"{m} {c}" for m, c in sorted(files[name].items()))
            lines.append(f"  {name}: {detail}")
    return lines


def main(argv: list[str] | None = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    if not args or args[0].startswith("-"):
        print("usage: python scripts/registry_package_audit.py node.zip [--json-out report.json]", file=sys.stderr)
        return 2
    archive_path = args[0]
    json_out = None
    if len(args) == 3 and args[1] == "--json-out":
        json_out = args[2]
    elif len(args) != 1:
        print("usage: python scripts/registry_package_audit.py node.zip [--json-out report.json]", file=sys.stderr)
        return 2
    result = audit(archive_path)
    if json_out:
        with open(json_out, "w", encoding="utf-8") as handle:
            json.dump({
                "ok": result.ok,
                "violations": result.violations,
                "notes": result.notes,
                "files": result.files,
                "sha256": result.sha256,
                "network_exemptions": result.network_exemptions,
                "javascript_provenance": result.javascript_provenance,
            }, handle, indent=2, sort_keys=True)
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
