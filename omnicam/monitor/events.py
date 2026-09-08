from __future__ import annotations

from typing import Any

MONITOR_PREFLIGHT_EVENT = "majoor.omnicam.monitor.preflight"
MONITOR_PREFLIGHT_EVENT_VERSION = 1


def monitor_preflight_event_payload(
    node_id: Any,
    output: dict[str, Any],
) -> dict[str, Any]:
    return {
        "schema_version": MONITOR_PREFLIGHT_EVENT_VERSION,
        "kind": "blocked_preflight",
        "node": str(node_id),
        "output": output,
    }
