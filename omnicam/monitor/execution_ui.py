"""Encode panel data for ComfyUI's list-concatenating UI transport."""

from typing import Any


def execution_ui_payload(panel: dict[str, Any]) -> dict[str, list[Any]]:
    """Preserve structured values across mapped execution and cache replay."""
    return {
        "preflight": panel["preflight"],
        "capabilities": [panel["capabilities"]],
        "target_profile": [panel["target_profile"]],
        "final_prompt": [panel.get("final_prompt", "")],
    }
