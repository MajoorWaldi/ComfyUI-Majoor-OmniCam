from __future__ import annotations

import json
from pathlib import Path

import pytest

FIXTURES = Path(__file__).parent / "fixtures" / "workflows"
KNOWN_NODE_TYPES = {"MajoorOmniCamDirector", "MajoorOmniCamExtractor", "MajoorOmniCamMonitor"}
EXPECTED_WIDGET_COUNTS = {
    "MajoorOmniCamDirector": 8,
    "MajoorOmniCamExtractor": 14,
    "MajoorOmniCamMonitor": 6,
}


def _workflow_nodes(workflow):
    yield from workflow.get("nodes", [])
    for definition in (workflow.get("definitions") or {}).get("subgraphs", []):
        yield from definition.get("nodes", [])


@pytest.mark.parametrize("path", sorted(FIXTURES.glob("*.json")), ids=lambda path: path.name)
def test_historical_workflow_fixture_keeps_known_nodes_and_widgets(path):
    workflow = json.loads(path.read_text(encoding="utf-8"))
    definitions = {
        definition["id"] for definition in (workflow.get("definitions") or {}).get("subgraphs", [])
    }
    nodes = list(_workflow_nodes(workflow))
    assert nodes
    for node in nodes:
        node_type = node["type"]
        if node_type in definitions:
            assert node.get("properties", {}).get("proxyWidgets")
            continue
        assert node_type in KNOWN_NODE_TYPES
        assert len(node.get("widgets_values", [])) >= EXPECTED_WIDGET_COUNTS[node_type]
    assert json.loads(json.dumps(workflow)) == workflow


def test_real_v034_subgraph_shape_has_promoted_fps_and_no_legacy_definition_widgets():
    workflow = json.loads((FIXTURES / "v0.34-subgraph-director.json").read_text(encoding="utf-8"))
    outer = workflow["nodes"][0]
    definition = workflow["definitions"]["subgraphs"][0]
    assert workflow["version"] == 0.4
    assert outer["properties"]["proxyWidgets"] == [["10", "fps"]]
    assert outer["widgets_values"] == [30]
    assert definition["widgets"] == []


def test_v034_director_monitor_fixture_uses_current_scene_and_profile_contract():
    workflow = json.loads((FIXTURES / "v0.34-director-monitor.json").read_text(encoding="utf-8"))
    director, monitor = workflow["nodes"]

    assert workflow["version"] == 0.4
    assert director["outputs"][0]["type"] == "OMNICAM_MOTION_SCENE"
    assert monitor["inputs"][0]["type"] == "OMNICAM_MOTION_SCENE"
    assert monitor["widgets_values"][1] == "wan_camera_native"
    assert all("MAJOOR_OMNICAM_TRACK" not in json.dumps(node) for node in workflow["nodes"])
