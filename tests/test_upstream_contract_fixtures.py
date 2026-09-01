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


def test_each_fixture_names_the_node_its_capability_contract_detects():
    """The pinned evidence and the runtime contract must agree.

    Nothing linked these two before, and they drifted: the fixture recorded
    WanMoveTrackToVideo and its TRACKS socket while the capability registry had
    no wan_move entry at all, so Monitor could not report the target either way.
    """
    from omnicam.adapters.registry import ADAPTER_INFO

    for contract in load_contracts():
        profile_id = contract["profile_id"]
        assert profile_id in ADAPTER_INFO, profile_id
        detected = {
            name
            for requirement in ADAPTER_INFO[profile_id]["requirements"]
            for name in requirement["any_of"]
        }
        assert detected, f"{profile_id} detects no node class"


def test_the_pinned_literals_still_exist_in_the_installed_comfyui():
    """Parity against the real checkout, not against our own copy of it.

    Skips when OmniCam is not sitting inside a ComfyUI tree, which is the normal
    case for the model-agnostic lane.
    """
    comfy_root = Path(__file__).resolve().parents[3]
    if not (comfy_root / "comfy_extras").is_dir():
        pytest.skip("not running inside a ComfyUI checkout")

    missing: list[str] = []
    for contract in load_contracts():
        for evidence in contract["evidence"]:
            if evidence.get("repository") != "comfyui":
                continue  # third-party checkouts are the canary workflow's job
            source = comfy_root / evidence["path"]
            if not source.is_file():
                missing.append(f"{contract['profile_id']}: {evidence['path']} is absent")
                continue
            text = source.read_text(encoding="utf-8", errors="replace")
            for literal in evidence["required_literals"]:
                if literal not in text:
                    missing.append(f"{contract['profile_id']}: {literal!r} not in {evidence['path']}")

    assert not missing, "\n".join(missing)
