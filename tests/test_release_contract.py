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


def _project_version() -> str:
    for line in _text("pyproject.toml").splitlines():
        if line.startswith("version = "):
            return line.split("=", 1)[1].strip().strip('"')
    raise AssertionError("project version not found")


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


def test_publish_workflow_preserves_generated_frontend_for_registry_publish() -> None:
    """The publish workflow must preserve web-chunks/ and web/omnicam.js.

    The release build job creates the generated frontend and uploads it as an
    artifact. The Registry job may do its own checkout, but it must download
    that artifact before `comfy node publish`; otherwise checkout/git-clean
    removes the gitignored bundle the Registry archive needs.
    """
    workflow = _text(".github/workflows/publish_action.yml")
    build_command = "          npm run build"
    download_command = "          name: majoor-omnicam-frontend-${{ needs.release-build.outputs.version }}"
    publish_command = "          comfy --skip-prompt --no-enable-telemetry node publish"
    build = workflow.index(build_command)
    download = workflow.index(download_command)
    publish = workflow.index(publish_command)
    assert build < download < publish
    assert "Comfy-Org/publish-node-action" not in workflow
    assert "contents: write" in workflow


def test_publish_workflow_splits_registry_and_github_release_finalization() -> None:
    """A GitHub Release failure must be rerunnable without republishing Registry.

    Registry versions are immutable once accepted by Comfy Registry, so the
    final GitHub Release step has to be its own job consuming the packaged
    archive artifact. If it lives in the same job as `comfy node publish`, a
    retry of the GitHub side repeats the Registry publish first.
    """
    workflow = _text(".github/workflows/publish_action.yml")
    registry_job = workflow.index("  release-registry:")
    github_job = workflow.index("  release-github:")
    assert registry_job < github_job

    registry_body = workflow[registry_job:github_job]
    github_body = workflow[github_job:]
    assert "comfy --skip-prompt --no-enable-telemetry node publish" in registry_body
    assert "gh release" not in registry_body
    assert "comfy --skip-prompt --no-enable-telemetry node publish" not in github_body
    assert "actions/download-artifact" in github_body
    assert "gh release create" in github_body


def test_ci_runs_official_wan_parity_against_checked_out_comfyui() -> None:
    workflow = _text(".github/workflows/test.yml")
    assert "test_wan_camera_official_parity.py" in workflow
    assert "OMNICAM_COMFYUI_ROOT" in workflow


def test_ci_builds_and_audits_the_real_comfy_registry_archive() -> None:
    for name in (".github/workflows/test.yml", ".github/workflows/publish_action.yml"):
        workflow = _text(name)
        assert "--no-enable-telemetry node pack" in workflow
        assert "scripts/registry_package_audit.py node.zip" in workflow


def test_registry_package_audit_flags_avoidable_scanner_triggers() -> None:
    audit = _text("scripts/registry_package_audit.py")
    assert "os.environ" in audit  # it must know to look for env reads
    assert "comfy_extras.nodes_moge" in audit
    assert "eval" in audit and "exec" in audit


def test_release_tooling_pins_comfy_cli_everywhere() -> None:
    """Release packaging must not float to a new comfy-cli on release day."""
    workflows = [
        _text(".github/workflows/publish_action.yml"),
        _text(".github/workflows/test.yml"),
    ]
    for workflow in workflows:
        assert "pip install comfy-cli\n" not in workflow
        assert "pip install comfy-cli\r\n" not in workflow
    assert "pip install comfy-cli==1.20.0" in workflows[0]
    assert "pip install comfy-cli==1.20.0" in workflows[1]


def test_source_install_docs_include_frontend_build_step() -> None:
    for path in ("README.md", "docs/USER_GUIDE.md"):
        guide = _text(path)
        install = guide[guide.index("## Install"):]
        assert "npm ci" in install, path
        assert "npm run build" in install, path


def test_source_install_docs_do_not_claim_generated_bundle_is_committed() -> None:
    readme = _text("README.md")
    forbidden = (
        "built frontend bundle (`web/`, `web-chunks/`) is committed",
        "plain clone runs as-is",
        "no `npm install` or build step",
    )
    for text in forbidden:
        assert text not in readme


def test_requirements_explains_source_frontend_build() -> None:
    requirements = _text("requirements.txt")
    assert "npm ci" in requirements
    assert "npm run build" in requirements


def test_frontend_and_python_package_versions_match() -> None:
    import json

    version = _project_version()
    package = json.loads(_text("package.json"))
    assert package["version"] == version


def test_changelog_has_current_release_version() -> None:
    version = _project_version()
    changelog = _text("CHANGELOG.md")
    assert f"## [{version}]" in changelog


def test_ci_frontend_lanes_split_pinned_and_latest_canary() -> None:
    workflow = _text(".github/workflows/test.yml")
    assert "comfyui-browser-pinned-frontend" in workflow
    assert "comfyui-browser-latest-frontend" in workflow
    old_name = "comfyui-browser-" + "current" + "-frontend"
    assert old_name not in workflow


def test_vite_module_graph_canary_runs_on_frontend_pushes() -> None:
    workflow = _text(".github/workflows/vite-module-graph-canary.yml")
    assert "  push:" in workflow
    assert '      - "web-src/**"' in workflow
    assert '      - "vite.config.mjs"' in workflow
    assert '      - "package*.json"' in workflow


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
