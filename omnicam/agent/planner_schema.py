"""The planner's JSON action protocol (design spec sections 24-28).

The model returns exactly one of three actions per step: query, transaction
(a proposal -- OmniCam validates it separately), or finish. Nothing else is
ever accepted: no shell, no Python, no filesystem, no arbitrary tool names.
This module only recognizes the shape; the Director API itself is what
actually validates a proposed transaction's operations.
"""

from __future__ import annotations

import json

# Mirrors web-src/director-api/constants.js by hand -- there is no code
# generation between Python and JS in this repository. PLANNER_OPERATIONS
# deliberately excludes asset.instantiate, mirroring
# web-src/agent/bridge.js's EXTERNAL_AGENT_OPERATIONS: the built-in planner
# cannot fabricate a resolved AssetDefinition any more than an external Agent
# can (design spec section 21).
DIRECTOR_API_VERSION = 1

PLANNER_OPERATIONS: tuple[str, ...] = (
    "camera.create", "camera.duplicate", "camera.delete", "camera.rename",
    "camera.set_active", "camera.set_locked", "camera.set_playblast",
    "camera.transform", "camera.look_at",
    "object.create", "object.duplicate", "object.delete", "object.rename",
    "object.set_parent", "object.transform", "object.set_enabled",
    "object.set_locked", "object.set_tags", "object.set_annotation",
    "character.set_pose", "character.set_joint_rotation",
    "character.set_motion", "character.clear_motion",
    "keyframe.upsert", "keyframe.remove", "keyframe.set_interpolation",
    "timeline.set_range", "timeline.set_duration",
    "cut.upsert", "cut.remove", "cut.set_camera",
)

PLANNER_QUERIES: tuple[str, ...] = (
    "scene.get", "scene.summary", "asset.list", "asset.get",
    "camera.get", "camera.list", "timeline.get", "selection.get",
    "health.get", "character.get_rig", "character.get_pose",
    "character.list", "object.list", "object.get", "object.search",
    "shot.list", "keyframe.list",
)


class PlannerProtocolError(Exception):
    def __init__(self, code: str, message: str | None = None) -> None:
        super().__init__(message or code)
        self.code = code


def parse_action(text: str) -> dict:
    """Parse one strict-JSON planner action. Raises PlannerProtocolError for
    anything that is not exactly {"action": "query"|"transaction"|"finish", ...}."""
    if not isinstance(text, str) or not text.strip():
        raise PlannerProtocolError("EMPTY_ACTION", "Planner returned an empty response")

    try:
        data = json.loads(text)
    except (ValueError, TypeError) as error:
        raise PlannerProtocolError("BAD_ACTION_JSON", f"Planner response is not valid JSON: {error}") from error

    if not isinstance(data, dict):
        raise PlannerProtocolError("BAD_ACTION_JSON", "Planner action must be a JSON object")

    action = data.get("action")

    if action == "query":
        query = data.get("query")
        if not isinstance(query, dict) or not isinstance(query.get("type"), str) or not query.get("type"):
            raise PlannerProtocolError("BAD_QUERY_ACTION", "query action needs {query: {type: string, ...}}")
        return {"type": "query", "query": query}

    if action == "transaction":
        transaction = data.get("transaction")
        if not isinstance(transaction, dict):
            raise PlannerProtocolError("BAD_TRANSACTION_ACTION", "transaction action needs a transaction object")

        description = transaction.get("description")
        if not isinstance(description, str) or not description.strip():
            raise PlannerProtocolError("BAD_TRANSACTION_ACTION", "transaction needs a non-empty description")

        operations = transaction.get("operations")
        if not isinstance(operations, list) or not operations:
            raise PlannerProtocolError("BAD_TRANSACTION_ACTION", "transaction needs a non-empty operations list")
        if not all(isinstance(op, dict) for op in operations):
            raise PlannerProtocolError("BAD_TRANSACTION_ACTION", "every operation must be an object")

        return {"type": "transaction", "description": description.strip(), "operations": operations}

    if action == "finish":
        message = data.get("message")
        return {"type": "finish", "message": message if isinstance(message, str) else ""}

    raise PlannerProtocolError("UNKNOWN_ACTION", f"Unsupported planner action: {action!r}")


PLANNER_SYSTEM_PROMPT_TEMPLATE = """You are the planning layer for OmniCam Director.
You never directly mutate a scene.
Return exactly one JSON action matching this schema, and nothing else -- no
prose, no markdown fences, no commentary:

{{"action": "query", "query": {{"type": "<one of: {queries}>", ...}}}}
{{"action": "transaction", "transaction": {{"description": "...", "operations": [{{"type": "<one of: {operations}>", ...}}]}}}}
{{"action": "finish", "message": "..."}}

Use Director queries to resolve IDs. Never invent camera IDs, object IDs,
asset IDs, joints, or animation clips. Respect entity locks. Prefer the
smallest transaction that satisfies the user's intent.

Do not output filesystem operations, shell commands, Python, JavaScript, or
arbitrary URLs. A transaction is a proposal: OmniCam validates it separately
before anything changes."""


def build_system_prompt(*, operations: list[str], queries: list[str]) -> str:
    return PLANNER_SYSTEM_PROMPT_TEMPLATE.format(
        queries=", ".join(sorted(queries)),
        operations=", ".join(sorted(operations)),
    )


def render_conversation(turns: list[dict]) -> str:
    """Flatten a role-labeled conversation into one prompt string.

    Every provider adapter's ``complete()`` takes a single request string --
    this keeps the planner usable against providers with no native multi-turn
    chat state or tool-calling support (design spec section 3).
    """
    lines = []
    for turn in turns:
        role = turn.get("role", "user").upper()
        content = turn.get("content", "")
        lines.append(f"[{role}]\n{content}")
    return "\n\n".join(lines)
