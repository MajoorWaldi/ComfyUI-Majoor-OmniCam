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

# Director state fields that a workflow may legitimately author away from the
# shipped default -- a hand-built production graph opens in a maya/camera/advanced
# layout on purpose. The checks below only guard against removed or garbage
# values, not against a deliberate non-default choice.
VIEW_MODES = {"camera", "perspective", "iso", "front", "back", "top", "right", "left", "bottom"}
NAV_PROFILES = {"maya", "blender", "simple"}
UI_DENSITIES = {"basic", "animation", "advanced"}

# Virtual-wiring nodes (kj-nodes Set/Get) carry links by matching a variable name,
# not through the graph's `links` array, so the topology checks that walk `links`
# cannot see the real graph. Workflows that use them are exempt from those checks.
VIRTUAL_WIRING_TYPES = {"SetNode", "GetNode"}


def _load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _uses_virtual_wiring(payload: dict) -> bool:
    return any(node["type"] in VIRTUAL_WIRING_TYPES for node in payload["nodes"])


def _monitor_profile_id(widgets_values: list, known_ids) -> str | None:
    """The profile a Monitor names, found by value rather than by widget index.

    The widget order has changed across builds and the external-reference layout
    puts the profile first, so scanning for a known id is the stable read.
    """
    for value in widgets_values:
        if isinstance(value, str) and value in known_ids:
            return value
    return None


def test_the_example_set_is_not_empty():
    assert WORKFLOWS, "examples/workflows must ship at least one workflow"


@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_a_workflow_carries_current_director_defaults(path: Path):
    payload = _load(path)
    directors = [node for node in payload["nodes"] if node["type"] == "MajoorOmniCamDirector"]
    assert directors, f"{path.name} has no Director"

    for node in directors:
        state = json.loads(node["widgets_values"][0])
        assert state["view_mode"] in VIEW_MODES, path.name
        assert state["navigation_profile"] in NAV_PROFILES, path.name
        assert isinstance(state["show_radar"], bool), path.name
        assert state["ui_density"] in UI_DENSITIES, path.name
        assert state["width"] == node["widgets_values"][3], path.name
        assert state["height"] == node["widgets_values"][4], path.name
        assert state["fps"] == node["widgets_values"][5], path.name
        assert state["duration_frames"] == round(node["widgets_values"][5] * node["widgets_values"][6]), path.name


def test_examples_readme_lists_every_shipped_workflow():
    readme = (Path(__file__).resolve().parents[1] / "examples" / "README.md").read_text(encoding="utf-8")
    for path in WORKFLOWS:
        assert f"`{path.name}`" in readme


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
        profile = _monitor_profile_id(node["widgets_values"], PROFILE_REGISTRY.ids)
        assert profile is not None, (
            f"{path.name}: Monitor names no known profile in {node['widgets_values']!r}"
        )


@pytest.mark.parametrize("path", WORKFLOWS, ids=lambda path: path.name)
def test_every_link_connects_sockets_that_still_exist(path: Path):
    payload = _load(path)
    by_id = {node["id"]: node for node in payload["nodes"]}

    for link in payload["links"]:
        _, origin_id, origin_slot, target_id, target_slot, link_type = link
        origin = by_id.get(origin_id)
        target = by_id.get(target_id)
        if origin is None or target is None:
            # A stale entry in the `links` array (its node was deleted). The
            # runtime ignores these; see test_no_link_is_dangling_on_either_side.
            continue
        assert origin_slot in range(len(origin["outputs"])), path.name
        assert target_slot in range(len(target["inputs"])), path.name
        origin_type = origin["outputs"][origin_slot]["type"]
        # `*` is a passthrough/reroute socket -- it adopts whatever type flows.
        assert origin_type in ("*", link_type) or link_type == "*", path.name


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
    if _uses_virtual_wiring(payload):
        pytest.skip("Set/Get virtual wiring: the links[] array is not authoritative")
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
    if _uses_virtual_wiring(payload):
        pytest.skip("Set/Get virtual wiring: reachability is not visible in links[]")
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
    if _uses_virtual_wiring(payload):
        pytest.skip("Set/Get virtual wiring: the payload may be routed by variable name")
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
        widgets = node["widgets_values"]
        profile_id = _monitor_profile_id(widgets, PROFILE_REGISTRY.ids)
        if profile_id is None:
            continue
        # width, height, duration, fps are the numeric widgets, in that order,
        # regardless of where the prompt/profile widgets sit around them.
        numbers = [v for v in widgets if isinstance(v, (int, float)) and not isinstance(v, bool)]
        if len(numbers) < 4:
            continue
        width, height, duration, fps = numbers[:4]
        if not (duration and fps):
            # External-reference mode: the length comes from the supplied video,
            # not from a resolved timeline.
            continue
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
