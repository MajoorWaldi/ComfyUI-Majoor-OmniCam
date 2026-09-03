import ast
import json
from pathlib import Path

import pytest

from omnicam.node_registry import (
    INTERNAL_COMPONENTS,
    LEGACY_NODE_IDS,
    PRODUCT_NODES,
    REGISTERED_NODE_IDS,
    get_registered_nodes,
)


def test_product_registry_contains_only_the_three_product_nodes():
    pytest.importorskip("comfy_api.latest")
    assert PRODUCT_NODES == ("MajoorOmniCamDirector", "MajoorOmniCamExtractor", "MajoorOmniCamMonitor")
    assert REGISTERED_NODE_IDS == PRODUCT_NODES
    assert [node.define_schema().node_id for node in get_registered_nodes()] == list(PRODUCT_NODES)
    assert "MajoorOmniCamSequencer" not in PRODUCT_NODES
    assert "MajoorOmniCamSequencer" in LEGACY_NODE_IDS
    assert INTERNAL_COMPONENTS


def test_every_product_node_is_marked_experimental():
    """Director, Extractor and Monitor all ship is_experimental=True.

    The node contract (sockets, MotionScene schema, Monitor profile outputs) is
    not frozen; Monitor was the one that had lost the flag.
    """
    pytest.importorskip("comfy_api.latest")
    for node in get_registered_nodes():
        schema = node.define_schema()
        assert schema.is_experimental is True, schema.node_id


def test_public_node_schema_inputs_match_execute_signatures():
    root = Path(__file__).resolve().parents[1] / "omnicam" / "nodes"
    classes = {}
    for source_path in root.glob("*.py"):
        tree = ast.parse(source_path.read_text(encoding="utf-8"))
        classes.update({node.name: node for node in tree.body if isinstance(node, ast.ClassDef)})

    for class_name in PRODUCT_NODES:
        class_node = classes[class_name]
        methods = {node.name: node for node in class_node.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
        # `media_input(...)` is the VIDEO-or-IMAGE socket helper; it declares an
        # input exactly like `IO.<Type>.Input(...)` does.
        schema_inputs = {
            call.args[0].value
            for call in ast.walk(methods["define_schema"])
            if isinstance(call, ast.Call)
            and (
                (isinstance(call.func, ast.Attribute) and call.func.attr == "Input")
                or (isinstance(call.func, ast.Name) and call.func.id == "media_input")
            )
            and call.args
            and isinstance(call.args[0], ast.Constant)
            and isinstance(call.args[0].value, str)
        }
        execute_inputs = {arg.arg for arg in methods["execute"].args.args if arg.arg not in {"self", "cls"}}
        assert schema_inputs == execute_inputs, f"{class_name}: schema={schema_inputs}, execute={execute_inputs}"


def test_node_list_json_matches_the_public_registry():
    manifest = json.loads((Path(__file__).resolve().parents[1] / "node_list.json").read_text(encoding="utf-8"))
    assert manifest["nodes"] == list(REGISTERED_NODE_IDS)


def test_no_legacy_adapter_node_class_is_present_or_registered():
    root = Path(__file__).resolve().parents[1]
    node_sources = list((root / "omnicam" / "nodes").glob("*.py"))
    source_text = "\n".join(path.read_text(encoding="utf-8") for path in node_sources)

    assert not any(legacy_id in source_text for legacy_id in LEGACY_NODE_IDS)
    assert not any(path.name in {"adapters.py"} for path in node_sources)
    assert set(PRODUCT_NODES).isdisjoint(LEGACY_NODE_IDS)
