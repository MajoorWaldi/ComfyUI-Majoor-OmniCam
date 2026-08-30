from __future__ import annotations

import re

from omnicam.adapters.registry import ADAPTER_INFO, input_fingerprint
from omnicam.capabilities import detect_capabilities


def _node_with_inputs(*names: str):
    class Node:
        @classmethod
        def INPUT_TYPES(cls):
            return {"required": {name: ("ANY",) for name in names}}

    return Node


def test_contract_matrix_has_pinned_upstream_and_input_fingerprint():
    for adapter, contract in ADAPTER_INFO.items():
        upstream = contract["upstream"]
        assert upstream["repository"].startswith("https://github.com/"), adapter
        assert re.fullmatch(r"[0-9a-f]{7,40}", upstream["tested_commit"]), adapter
        assert contract["input_fingerprint"] == input_fingerprint(
            contract["expected_inputs"], contract["expected_widgets"]
        )


def test_contract_matrix_verifies_each_adapter_input_surface():
    mappings = {}
    for contract in ADAPTER_INFO.values():
        node = _node_with_inputs(*contract["expected_inputs"], *contract["expected_widgets"])
        mappings.update({node_class: node for node_class in contract["required_node_classes"]})

    states = {entry["adapter"]: entry["state"] for entry in detect_capabilities(mappings)["capabilities"]}
    assert states == {adapter: "verified" for adapter in ADAPTER_INFO}


def test_contract_fingerprint_changes_when_any_input_changes():
    assert input_fingerprint(["tracks"]) != input_fingerprint(["tracks"], ["width"])
    assert input_fingerprint(["tracks"]) != input_fingerprint(["camera_conditions"])
