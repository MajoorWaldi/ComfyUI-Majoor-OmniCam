"""The Registry package audit (scripts/registry_package_audit.py).

Builds small in-memory archives and asserts what the audit fails on, what it
merely reports, and -- importantly -- what it must NOT flag: an os.environ
write, or the words eval/exec sitting in a comment or docstring.
"""

from __future__ import annotations

import zipfile

import pytest

from scripts.registry_package_audit import audit

MINIMAL = {
    "pyproject.toml": b"[project]\nname = 'x'\n",
    "web/omnicam.js": b"console.log(1)\n",
    "web-chunks/chunk-abc.js": b"export const a = 1\n",
    "omnicam/__init__.py": b"__version__ = '0.3.1'\n",
    "__init__.py": b"from .omnicam import *\n",
}


def _audit(files: dict[str, bytes], tmp_path):
    target = tmp_path / "node.zip"
    with zipfile.ZipFile(target, "w") as archive:
        for name, data in files.items():
            archive.writestr(name, data)
    return audit(str(target))


def test_a_clean_archive_passes(tmp_path):
    result = _audit(MINIMAL, tmp_path)
    assert result.ok, result.violations


def test_a_wrapper_directory_is_tolerated(tmp_path):
    wrapped = {f"ComfyUI-Majoor-OmniCam/{name}": data for name, data in MINIMAL.items()}
    assert _audit(wrapped, tmp_path).ok


@pytest.mark.parametrize("dev_path", [
    "tests/test_x.py",
    "scripts/dev.py",
    "web-src/index.js",
    ".github/workflows/ci.yml",
    "node_modules/left-pad/index.js",
])
def test_development_paths_fail(tmp_path, dev_path):
    result = _audit({**MINIMAL, dev_path: b"x"}, tmp_path)
    assert not result.ok
    assert any("development path" in v for v in result.violations)


@pytest.mark.parametrize("missing", ["web/omnicam.js", "pyproject.toml"])
def test_missing_runtime_files_fail(tmp_path, missing):
    files = {k: v for k, v in MINIMAL.items() if k != missing}
    result = _audit(files, tmp_path)
    assert not result.ok
    assert any(missing in v for v in result.violations)


def test_missing_web_chunks_fails(tmp_path):
    files = {k: v for k, v in MINIMAL.items() if not k.startswith("web-chunks/")}
    result = _audit(files, tmp_path)
    assert not result.ok
    assert any("web-chunks" in v for v in result.violations)


def test_direct_eval_and_exec_fail(tmp_path):
    files = {**MINIMAL, "omnicam/bad.py": b"def f(s):\n    return eval(s)\n"}
    result = _audit(files, tmp_path)
    assert any("eval()" in v for v in result.violations)


def test_pip_install_subprocess_fails(tmp_path):
    src = b"import subprocess\nsubprocess.run(['pip', 'install', 'torch'])\n"
    result = _audit({**MINIMAL, "omnicam/bad.py": src}, tmp_path)
    assert any("pip install subprocess" in v for v in result.violations)


def test_os_environ_read_fails_but_a_write_does_not(tmp_path):
    read = b"import os\nLIMIT = int(os.environ.get('X', 1))\n"
    assert not _audit({**MINIMAL, "omnicam/r.py": read}, tmp_path).ok

    getenv = b"import os\nLIMIT = os.getenv('X')\n"
    assert not _audit({**MINIMAL, "omnicam/g.py": getenv}, tmp_path).ok

    write = b"import os\nold = os.environ.pop('PYTORCH_ALLOC_CONF', None)\n"
    assert _audit({**MINIMAL, "omnicam/w.py": write}, tmp_path).ok


def test_dynamic_moge_import_fails(tmp_path):
    src = b"import importlib\nm = importlib.import_module('comfy_extras.nodes_moge')\n"
    result = _audit({**MINIMAL, "omnicam/m.py": src}, tmp_path)
    assert any("comfy_extras.nodes_moge" in v for v in result.violations)


def test_eval_in_a_comment_or_docstring_is_not_flagged(tmp_path):
    src = (
        b'"""This module never calls eval() or exec(); see os.environ note."""\n'
        b"# os.environ.get('X') would be a violation if it were real code\n"
        b"VALUE = 1\n"
    )
    result = _audit({**MINIMAL, "omnicam/ok.py": src}, tmp_path)
    assert result.ok, result.violations


def test_ipc_and_js_bindings_are_reported_not_failed(tmp_path):
    files = {
        **MINIMAL,
        "omnicam/child.py": b"def go(connection):\n    connection.send({'k': 1})\n    connection.recv()\n",
        "web-chunks/chunk-three.js": b"obj.connect(dest); node.bind(x); el.listen(y)\n",
    }
    result = _audit(files, tmp_path)
    assert result.ok, result.violations
    assert any("multiprocessing IPC" in n for n in result.notes)
    assert any("generated JS" in n for n in result.notes)
