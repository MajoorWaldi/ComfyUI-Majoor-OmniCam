"""Discoverable integration seam, independent of any private Comfy Agent SDK.

The envelope schema is structural. The live Director remains the authority
for operation fields, entity locks and semantic validation (validateOnly).
"""

from .planner_schema import PLANNER_OPERATIONS, PLANNER_QUERIES
from .protocol import AGENT_PROTOCOL, MAX_AGENT_JSON_BYTES
from .transaction_journal import TRANSACTION_TTL_SECONDS

PATH_OPERATIONS = (
    "camera.path.transform_keys", "camera.path.insert_key", "camera.path.delete_keys",
    "camera.path.redistribute_timing", "camera.path.apply_preset",
)


def integration_contract() -> dict:
    operations = [*PLANNER_OPERATIONS, *PATH_OPERATIONS]
    return {
        "protocol": AGENT_PROTOCOL,
        "contract_version": 1,
        "official_comfy_agent": {"registered": False, "status": "adapter-ready-unverified"},
        "public_nodes": ["MajoorOmniCamExtractor", "MajoorOmniCamDirector", "MajoorOmniCamMonitor"],
        "routes": {
            "sessions": "/majoor/omnicam/agent/v1/sessions",
            "query": "/majoor/omnicam/agent/v1/query",
            "transaction": "/majoor/omnicam/agent/v1/transaction",
            "transaction_status": "/majoor/omnicam/agent/v1/transaction/status",
        },
        "target_fields": ["document_id", "graph_id", "node_locator", "instance_id"],
        "limits": {"operations": 50, "json_bytes": MAX_AGENT_JSON_BYTES,
                   "outcome_retention_seconds": TRANSACTION_TTL_SECONDS},
        "operations": operations,
        "queries": [*PLANNER_QUERIES, "scene.get"],
        "planner_excluded_operations": list(PATH_OPERATIONS),
        "transaction_schema": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "required": ["version", "id", "description", "baseRevision", "operations"],
            "properties": {
                "version": {"const": 1},
                "id": {"type": "string", "minLength": 1, "maxLength": 120},
                "description": {"type": "string", "minLength": 1},
                "baseRevision": {"type": "integer", "minimum": 0},
                "validateOnly": {"type": "boolean", "default": True},
                "operations": {"type": "array", "minItems": 1, "maxItems": 50,
                               "items": {"type": "object", "required": ["type"],
                                         "properties": {"type": {"enum": operations}}}},
            },
        },
        "workflow": ["select_exact_session_target", "query", "validateOnly", "review", "commit_same_revision", "recover_status"],
        "validation": "Envelope schema only; use validateOnly for authoritative per-operation validation",
        "examples": [{"version": 1, "id": "unique-intent-id", "description": "Move camera",
                      "baseRevision": 0, "validateOnly": True,
                      "operations": [{"type": "camera.transform", "cameraId": "camera_1", "position": [0, 2, 6]}]}],
    }
