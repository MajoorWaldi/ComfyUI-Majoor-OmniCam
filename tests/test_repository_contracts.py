from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def text(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_maintained_docs_do_not_publish_retired_execution_routes():
    readme = text("README.md")
    security = text("docs/SECURITY.md")
    nodes = text("docs/NODES.md")

    assert "Solves and reconstructions run interactively outside the prompt queue" not in readme
    assert "An interactive solve runs outside the prompt queue" not in security
    assert "/majoor/omnicam/reconstruction/jobs/{job_id}" not in nodes
    assert "retired" in security.lower()


def test_queue_only_execution_is_documented():
    readme = text("README.md")
    security = text("docs/SECURITY.md")
    assert "partial" in readme.lower() and "queue" in readme.lower()
    assert "partial" in security.lower() and "queue" in security.lower()


def test_comfy_compat_does_not_call_v002_stable():
    source = text("omnicam/comfy_compat/api.py")
    assert "stable_api" not in source
    assert "stable numbered API" not in source
    assert "versioned_api" in source


def test_ci_covers_minimum_previous_stable_and_master():
    workflow = text(".github/workflows/test.yml")
    for ref in ("v0.31.0", "v0.34.0", "v0.35.0"):
        assert ref in workflow
    assert "comfy-ref: master" in workflow
    assert "label: stable" in workflow
    assert "label: previous" in workflow


def test_declared_frontend_floor_has_live_browser_gate():
    workflow = text(".github/workflows/test.yml")
    assert "comfyui-browser-minimum-frontend" in workflow
    assert "Comfy-Org/ComfyUI_frontend@1.48.7" in workflow


def test_branch_rules_require_stable_and_minimum_frontend_checks():
    rules = text(".github/rulesets/main-required-checks.json")
    assert '"context": "comfyui-integration (stable)"' in rules
    assert '"context": "comfyui-browser-minimum-frontend"' in rules
