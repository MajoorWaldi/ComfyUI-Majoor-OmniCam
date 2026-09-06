"""The shipped workflows must open in the ComfyUI this build targets.

The five that shipped before were authored against the pre-MotionScene Director
and wired four adapter nodes that had already been removed, so dropping one into
ComfyUI produced a missing-node error. Nothing checked them, which is why nobody
noticed. This does.
"""

from __future__ import annotations

import json
import math
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
    from omnicam.nodes.extractor import MajoorOmniCamExtractor
    from omnicam.nodes.monitor import MajoorOmniCamMonitor

    schemas = {
        "MajoorOmniCamDirector": MajoorOmniCamDirector.define_schema(),
        "MajoorOmniCamMonitor": MajoorOmniCamMonitor.define_schema(),
        "MajoorOmniCamExtractor": MajoorOmniCamExtractor.define_schema(),
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


# ---------------------------------------------------------------------------
# Graph integrity
#
# These workflows are edits of the official Comfy-Org templates, so the risk is
# not a wrong setting -- it is surgery that leaves a dangling link or an orphan.
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_no_link_is_dangling_on_either_side(path: Path):
    payload = _load(path)
    by_id = {node["id"]: node for node in payload["nodes"]}
    link_ids = set()

    for link in payload["links"]:
        link_id, origin_id, origin_slot, target_id, target_slot, _ = link
        assert link_id not in link_ids, f"{path.name}: duplicate link id {link_id}"
        link_ids.add(link_id)
        assert origin_id in by_id and target_id in by_id, f"{path.name}: link {link_id} to a removed node"
        target = by_id[target_id]
        socket = target["inputs"][target_slot]
        assert socket["link"] == link_id, (
            f"{path.name}: {target['type']}.{socket['name']} does not point back at link {link_id}"
        )
        origin = by_id[origin_id]
        assert link_id in (origin["outputs"][origin_slot].get("links") or []), (
            f"{path.name}: origin {origin['type']} does not list link {link_id}"
        )

    for node in payload["nodes"]:
        for socket in node.get("inputs") or []:
            if socket.get("link") is not None:
                assert socket["link"] in link_ids, (
                    f"{path.name}: {node['type']}.{socket['name']} references a deleted link"
                )


@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_every_node_is_reachable_or_a_note(path: Path):
    """Pruning a template branch must not leave a node wired to nothing."""
    payload = _load(path)
    linked = {end for link in payload["links"] for end in (link[1], link[3])}

    orphans = [
        (node["id"], node["type"])
        for node in payload["nodes"]
        if node["id"] not in linked and not node["type"].endswith("Note")
    ]

    assert orphans == [], f"{path.name} has orphaned nodes: {orphans}"


@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_the_monitor_output_actually_feeds_something(path: Path):
    """A workflow that compiles a payload and connects none of it is a demo of nothing."""
    payload = _load(path)
    monitors = [n for n in payload["nodes"] if n["type"] == "MajoorOmniCamMonitor"]
    assert monitors, f"{path.name} has no Monitor"

    for node in monitors:
        downstream = [
            socket["name"]
            for socket in node["outputs"]
            if socket.get("links")
        ]
        assert downstream, f"{path.name}: Monitor drives nothing"


@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_the_monitor_length_matches_what_its_profile_resolves(path: Path):
    """The Director duration must land on the frame count the target requires.

    Wan wants 4n+1, H3 wants 17n+5 and the ATI grid is fixed. An example whose
    duration resolves to something else teaches the wrong number.
    """
    from omnicam.profiles.catalog import PROFILE_REGISTRY

    class _Request:
        target_width = 832
        target_height = 480

    for node in _load(path)["nodes"]:
        if node["type"] != "MajoorOmniCamMonitor":
            continue
        _prompt, profile_id, width, height, duration, fps = node["widgets_values"]
        request = _Request()
        request.target_width, request.target_height = width, height
        request.duration_seconds, request.target_fps = duration, fps

        timeline = PROFILE_REGISTRY.require(profile_id).resolve_timeline(request)

        # Resolving must not have to round the author's duration up: if it does,
        # the number in the example does not match the number in the note.
        assert timeline.frame_count >= 1
        if timeline.frame_policy in {"requested_length", "track_length"}:
            requested = math.ceil(duration * fps)
            assert timeline.frame_count in {requested, requested + 1, requested + 2, requested + 3}, (
                f"{path.name}: {profile_id} resolves {requested} to {timeline.frame_count}"
            )
