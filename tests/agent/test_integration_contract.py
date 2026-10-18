"""The future adapter contract must describe the actual browser vocabulary."""

import json
import subprocess
from pathlib import Path

from omnicam.agent.contract import integration_contract


def test_contract_matches_browser_vocabulary_and_declares_integration_status():
    root = Path(__file__).resolve().parents[2]
    result = subprocess.run(
        ["node", "--input-type=module", "-e",
         "import {EXTERNAL_AGENT_OPERATIONS as operations, EXTERNAL_AGENT_QUERIES as queries} "
         "from './web-src/agent/bridge.js'; console.log(JSON.stringify({operations,queries}));"],
        cwd=root, check=True, capture_output=True, text=True,
    )
    actual = json.loads(result.stdout)
    contract = integration_contract()
    assert set(contract["operations"]) == set(actual["operations"])
    assert set(contract["queries"]) == set(actual["queries"])
    assert contract["official_comfy_agent"]["registered"] is False
    assert "asset.instantiate" not in contract["operations"]
    assert contract["transaction_schema"]["properties"]["operations"]["maxItems"] == 50
