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
        # A profile with no requirements names no downstream node -- there is
        # nothing to pin a commit against, and pretending otherwise with a
        # fabricated hash would be the dishonest fixture, not the honest one.
        if not contract["requirements"]:
            continue
        upstream = contract["upstream"]
        assert upstream["repository"].startswith("https://github.com/"), adapter
        assert re.fullmatch(r"[0-9a-f]{7,40}", upstream["tested_commit"]), adapter
        assert contract["input_fingerprint"] == input_fingerprint(
            contract["expected_inputs"], contract["expected_widgets"]
        )


def test_a_requirement_free_contract_is_the_deliberate_exception_not_a_typo():
    """Only the profile that genuinely has no downstream node skips the pin."""
    unpinned = {adapter for adapter, contract in ADAPTER_INFO.items() if not contract["requirements"]}
    assert unpinned == {"external_reference_video"}


def test_contract_matrix_verifies_each_adapter_input_surface():
    node_inputs = {}
    for contract in ADAPTER_INFO.values():
        for requirement in contract["requirements"]:
            sockets = requirement["expected_inputs"] + requirement["expected_widgets"]
            for node_class in requirement["any_of"]:
                node_inputs.setdefault(node_class, set()).update(
                    sockets
                )

    mappings = {
        node_class: _node_with_inputs(*inputs)
        for node_class, inputs in node_inputs.items()
    }

    states = {entry["adapter"]: entry["state"] for entry in detect_capabilities(mappings)["capabilities"]}
    assert states == {adapter: "verified" for adapter in ADAPTER_INFO}


def test_contract_fingerprint_changes_when_any_input_changes():
    assert input_fingerprint(["tracks"]) != input_fingerprint(["tracks"], ["width"])
    assert input_fingerprint(["tracks"]) != input_fingerprint(["camera_conditions"])
