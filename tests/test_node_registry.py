import ast
from pathlib import Path

from omnicam.node_registry import INTERNAL_COMPONENTS, LEGACY_NODE_IDS, PUBLIC_NODES


def test_public_registry_contains_exactly_five_unique_non_legacy_nodes():
    assert len(PUBLIC_NODES) == len(set(PUBLIC_NODES)) == 5
    assert "MajoorOmniCamSequencer" not in PUBLIC_NODES
    assert "MajoorOmniCamSequencer" in LEGACY_NODE_IDS
    assert not LEGACY_NODE_IDS.intersection(PUBLIC_NODES)
    assert INTERNAL_COMPONENTS


def test_public_node_schema_inputs_match_execute_signatures():
    root = Path(__file__).resolve().parents[1] / "omnicam" / "nodes"
    classes = {}
    for source_path in root.glob("*.py"):
        tree = ast.parse(source_path.read_text(encoding="utf-8"))
        classes.update({node.name: node for node in tree.body if isinstance(node, ast.ClassDef)})

    for class_name in PUBLIC_NODES:
        class_node = classes[class_name]
        methods = {node.name: node for node in class_node.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
        schema_inputs = {
            call.args[0].value
            for call in ast.walk(methods["define_schema"])
            if isinstance(call, ast.Call)
            and isinstance(call.func, ast.Attribute)
            and call.func.attr == "Input"
            and call.args
            and isinstance(call.args[0], ast.Constant)
            and isinstance(call.args[0].value, str)
        }
        execute_inputs = {arg.arg for arg in methods["execute"].args.args if arg.arg not in {"self", "cls"}}
        assert schema_inputs == execute_inputs, f"{class_name}: schema={schema_inputs}, execute={execute_inputs}"
