"""Release-contract regression tests.

These are intentionally cheap/static. They protect the pieces of the release
pipeline that can otherwise pass the normal source-tree tests while producing a
Registry archive without OmniCam's generated frontend.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_registry_force_includes_generated_frontend() -> None:
    pyproject = _text("pyproject.toml")
    assert "includes" in pyproject
    assert '"web"' in pyproject or "'web'" in pyproject
    assert '"web-chunks"' in pyproject or "'web-chunks'" in pyproject


def test_publish_workflow_does_not_recheckout_after_frontend_build() -> None:
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
