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


def test_generated_frontend_is_committed_not_synthesized_at_publish() -> None:
    """web-chunks/ and web/omnicam.js ship as tracked Git content, not a
    build produced in the publish job.

    Rollup's chunk-name hashes are not guaranteed byte-reproducible across
    OSes, so regenerating them in CI (Ubuntu) right before packaging made the
    published archive a synthesis nothing on GitHub showed byte-for-byte --
    a fair thing for an automated Registry review to distrust. Publishing the
    checked-out commit as-is instead means these files must actually be
    tracked, which `git ls-files` confirms directly rather than trusting
    .gitignore not to have silently reclaimed them.
    """
    result = subprocess.run(
        ["git", "ls-files", "web-chunks", "web/omnicam.js"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    tracked = result.stdout.splitlines()
    assert any(path.startswith("web-chunks/") for path in tracked)
    assert "web/omnicam.js" in tracked


def test_publish_workflow_does_not_rebuild_the_frontend() -> None:
    """The publish job must not regenerate what test_generated_frontend_is_
    committed_not_synthesized_at_publish requires to already be tracked --
    doing so would defeat the point of committing it. Delegating to the
    official action is fine as long as its own checkout is skipped: our job
    already checked out this commit, and nothing runs afterward that a second
    checkout's git-clean could wipe -- unlike when this job used to build an
    uncommitted, git-ignored bundle immediately before packaging.
    """
    workflow = _text(".github/workflows/publish_action.yml")
    publish_job = workflow[workflow.index("publish-node:"):]
    assert "npm run build" not in publish_job
    assert "npm ci" not in publish_job
    assert "actions/setup-node" not in publish_job
    if "Comfy-Org/publish-node-action" in publish_job:
        assert "skip_checkout: true" in publish_job
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
