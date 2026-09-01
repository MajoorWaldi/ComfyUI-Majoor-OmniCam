"""The shipped workflows must open in the ComfyUI this build targets.

The five that shipped before were authored against the pre-MotionScene Director
and wired four adapter nodes that had already been removed, so dropping one into
ComfyUI produced a missing-node error. Nothing checked them, which is why nobody
noticed. This does.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from omnicam.node_registry import LEGACY_NODE_IDS, PRODUCT_NODES

WORKFLOWS = sorted((Path(__file__).resolve().parents[1] / "examples" / "workflows").glob("*.json"))


def _load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def test_the_example_set_is_not_empty():
    assert WORKFLOWS, "examples/workflows must ship at least one workflow"


@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_a_workflow_only_uses_nodes_this_build_registers(path: Path):
    types = {node["type"] for node in _load(path)["nodes"]}
    omnicam = {name for name in types if name.startswith("MajoorOmniCam")}

    assert not omnicam & LEGACY_NODE_IDS, f"{path.name} wires removed nodes"
    assert omnicam <= set(PRODUCT_NODES), f"{path.name} wires unknown OmniCam nodes"


@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_a_workflow_names_a_real_monitor_profile(path: Path):
    from omnicam.profiles.catalog import PROFILE_REGISTRY

    for node in _load(path)["nodes"]:
        if node["type"] != "MajoorOmniCamMonitor":
            continue
        # target_profile is the second widget, after base_prompt.
        profile = node["widgets_values"][1]
        assert profile in PROFILE_REGISTRY.ids, f"{path.name}: unknown profile {profile!r}"


@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_every_link_connects_sockets_that_still_exist(path: Path):
    payload = _load(path)
    by_id = {node["id"]: node for node in payload["nodes"]}

    for link in payload["links"]:
        _, origin_id, origin_slot, target_id, target_slot, link_type = link
        origin = by_id[origin_id]
        target = by_id[target_id]
        assert origin["outputs"][origin_slot]["type"] == link_type, path.name
        assert origin_slot in range(len(origin["outputs"])), path.name
        assert target_slot in range(len(target["inputs"])), path.name


@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_node_sockets_match_the_live_schemas(path: Path):
    """The workflow's sockets are checked against define_schema(), not a copy of it."""
    pytest.importorskip("comfy_api.latest")

    from omnicam.nodes.director import MajoorOmniCamDirector
    from omnicam.nodes.monitor import MajoorOmniCamMonitor

    schemas = {
        "MajoorOmniCamDirector": MajoorOmniCamDirector.define_schema(),
        "MajoorOmniCamMonitor": MajoorOmniCamMonitor.define_schema(),
    }

    for node in _load(path)["nodes"]:
        schema = schemas.get(node["type"])
        if schema is None:
            continue
        declared_inputs = {item.id for item in schema.inputs}
        for socket in node["inputs"]:
            assert socket["name"] in declared_inputs, f"{path.name}: {node['type']}.{socket['name']}"
        declared_outputs = [item.display_name for item in schema.outputs]
        assert [item["name"] for item in node["outputs"]] == declared_outputs, path.name
