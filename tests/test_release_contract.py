"""Release-contract regression tests.

These are intentionally cheap/static. They protect the pieces of the release
pipeline that can otherwise pass the normal source-tree tests while producing a
Registry archive without OmniCam's generated frontend.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_registry_force_includes_generated_frontend() -> None:
    pyproject = _text("pyproject.toml")
    assert "includes" in pyproject
    assert '"web"' in pyproject or "'web'" in pyproject
    assert '"web-chunks"' in pyproject or "'web-chunks'" in pyproject


def test_generated_frontend_is_gitignored_not_committed() -> None:
    """web-chunks/ and web/omnicam.js must never be tracked in Git.

    A Windows checkout and Linux CI resolve a genuinely different Vite module
    graph for the same web-src/ (268 vs 260 modules measured 2026-09-06; 266
    vs 258 previously) -- not just different Rollup chunk-hash filenames.
    Committing whichever platform happened to build last has already been
    tried twice (515c835, dbdcc22) and reverted once for exactly this reason
    (8ec2bba); this regression test exists because it was tried a third time
    in between. Only building fresh, in the same job that packages/publishes,
    guarantees the shipped bytes are the ones actually exercised by tests.
    """
    gitignore = _text(".gitignore")
    assert "web-chunks" in gitignore
    assert "web/omnicam.js" in gitignore
    result = subprocess.run(
        ["git", "ls-files", "web-chunks", "web/omnicam.js"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    assert result.stdout.strip() == ""


def test_publish_workflow_does_not_recheckout_after_frontend_build() -> None:
    """The publish job must build web-chunks/ and web/omnicam.js itself,
    immediately before packaging, and never hand off to an action whose own
    checkout would git-clean that freshly built, gitignored bundle before
    `comfy node publish` can pack it.
    """
    workflow = _text(".github/workflows/publish_action.yml")
    build_command = "          npm run build"
    publish_command = "          comfy --skip-prompt --no-enable-telemetry node publish"
    build = workflow.index(build_command)
    publish = workflow.index(publish_command)
    assert build < publish
    assert "Comfy-Org/publish-node-action" not in workflow
    assert "contents: read" in workflow


def test_ci_runs_official_wan_parity_against_checked_out_comfyui() -> None:
    workflow = _text(".github/workflows/test.yml")
    assert "test_wan_camera_official_parity.py" in workflow
    assert "OMNICAM_COMFYUI_ROOT" in workflow


def test_ci_builds_and_inspects_the_real_comfy_registry_archive() -> None:
    workflow = _text(".github/workflows/test.yml")
    assert "--no-enable-telemetry node pack" in workflow
    assert 'zipfile.ZipFile("node.zip")' in workflow
    assert "web/omnicam.js" in workflow
    assert "web-chunks/" in workflow


def test_source_install_docs_include_frontend_build_step() -> None:
    guide = _text("docs/USER_GUIDE.md")
    install = guide[guide.index("## Install"):]
    assert "npm ci" in install
    assert "npm run build" in install


def test_package_never_imports_itself_by_absolute_name() -> None:
    """ComfyUI loads a custom node under its *directory* name.

    So inside the ComfyUI process the package is
    ``ComfyUI-Majoor-OmniCam.omnicam``, the repository root is not on
    ``sys.path``, and any ``from omnicam.x import y`` raises
    ``ModuleNotFoundError`` at load time -- taking every OmniCam node down with
    it. The test suite runs from the repository root, where those imports do
    resolve, so only this static check catches the regression.
    """
    offenders: list[str] = []
    for path in sorted((ROOT / "omnicam").rglob("*.py")):
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            stripped = line.strip()
            if stripped.startswith(("from omnicam.", "from omnicam ", "import omnicam")):
                offenders.append(f"{path.relative_to(ROOT).as_posix()}:{number}: {stripped}")

    assert not offenders, (
        "omnicam/ must import itself with relative imports only; found:\n  "
        + "\n  ".join(offenders)
    )
