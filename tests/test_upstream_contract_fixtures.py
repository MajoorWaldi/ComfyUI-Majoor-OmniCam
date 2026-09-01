import json
from pathlib import Path

import pytest

from scripts.audit_upstream_workflows import audit_checkouts, load_contracts

EXPECTED_PROFILES = {
    "h3_api",
    "h3_native",
    "ltx25_motion_track",
    "wan_camera_native",
    "wan_move_native",
    "wan_track_native",
    "wanvideo_ati",
}


def test_pinned_upstream_contracts_are_complete_and_unique():
    contracts = load_contracts()

    assert {contract["profile_id"] for contract in contracts} == EXPECTED_PROFILES
    assert len(contracts) == 7
    assert all(contract["_fixture"].endswith(".json") for contract in contracts)


def test_loader_rejects_duplicate_profile_ids(tmp_path: Path):
    contract = {
        "profile_id": "duplicate",
        "display_name": "Duplicate",
        "semantic": "screen_tracks",
        "node": {
            "id": "Node",
            "inputs": [{"name": "tracks", "type": "STRING"}],
            "outputs": [{"name": "tracks", "type": "STRING"}],
        },
        "frame_policy": {"kind": "source", "facts": ["one fact"]},
        "evidence": [
            {
                "repository": "example",
                "url": "https://example.invalid/repo",
                "ref": "abc123",
                "path": "nodes.py",
                "required_literals": ["class Node"],
            }
        ],
    }
    for name in ("one.json", "two.json"):
        (tmp_path / name).write_text(json.dumps(contract), encoding="utf-8")

    with pytest.raises(ValueError, match="duplicate profile IDs"):
        load_contracts(tmp_path)


def test_checkout_audit_reports_changed_literals(tmp_path: Path):
    source = tmp_path / "nodes.py"
    source.write_text("class ExpectedNode:\n    pass\n", encoding="utf-8")
    contract = {
        "profile_id": "example",
        "evidence": [
            {
                "repository": "example",
                "path": "nodes.py",
                "required_literals": ["class ExpectedNode", "EXPECTED = 121"],
            }
        ],
    }

    errors = audit_checkouts([contract], {"example": tmp_path})

    assert errors == ["example: nodes.py missing 'EXPECTED = 121'"]
