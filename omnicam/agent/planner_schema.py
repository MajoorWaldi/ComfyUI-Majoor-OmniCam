"""The planner's JSON action protocol (design spec sections 24-28).

The model returns exactly one of three actions per step: query, transaction
(a proposal -- OmniCam validates it separately), or finish. Nothing else is
ever accepted: no shell, no Python, no filesystem, no arbitrary tool names.
This module only recognizes the shape; the Director API itself is what
actually validates a proposed transaction's operations.
"""

from __future__ import annotations

import json
import re

# Local models (Ollama, LM Studio, ...) routinely wrap an otherwise-correct
# JSON action in a markdown code fence, or add a sentence of chatter before
# it, even under an explicit "no markdown" system prompt -- Ollama's own
# format="json" only forces syntactically valid JSON, not naked-of-prose
# output. Strip these before the strict json.loads() so a single stray fence
# does not burn a whole planner step (and, over enough retries, the whole
# bounded step budget) on a response that was otherwise usable.
_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", re.DOTALL)


def _unwrap_action_text(text: str) -> str:
    stripped = text.strip()
    fenced = _CODE_FENCE_RE.match(stripped)
    if fenced:
        return fenced.group(1).strip()
    return stripped

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
    # Not a real Director API operation -- web-src/agent/bridge.js intercepts
    # it, resolves assetId against the trusted, already-loaded catalogue, and
    # rewrites it into a real asset.instantiate before the transaction ever
    # reaches ui.directorApi.execute. The planner never sees or constructs a
    # file path, rig, or animation list itself (design spec section 21).
    "asset.instantiate_by_id",
)

PLANNER_QUERIES: tuple[str, ...] = (
    "scene.get", "scene.summary", "asset.list", "asset.get",
    "camera.get", "camera.list", "timeline.get", "selection.get",
    "health.get", "character.get_rig", "character.get_pose",
    "character.list", "object.list", "object.get", "object.search",
    "shot.list", "keyframe.list",
    # Also bridge.js-intercepted: searches the Asset Browser catalogue (not
    # ui.state) and returns id/name/kind/tags/animations only.
    "asset.catalog_search",
)

# Mirrors web-src/director-api/entity-ops.js's AGENT_OBJECT_TYPES by hand --
# object.create rejects anything outside this exact set (UNSUPPORTED_OBJECT_TYPE),
# and the model has no other way to learn it (there is no "list valid object
# types" query). Without this in the prompt, an open-ended instruction like
# "add a building" reliably burns the whole step budget hallucinating
# objectType values ("building", "man", ...) that never validate.
PLANNER_OBJECT_TYPES: tuple[str, ...] = (
    "cube", "sphere", "cylinder", "torus", "pyramid", "ground", "human",
    "card", "null", "sun_light", "point_light", "spot_light",
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

    candidate = _unwrap_action_text(text)
    try:
        data = json.loads(candidate)
    except (ValueError, TypeError) as error:
        # Last resort: a model that prefaced/trailed the object with prose
        # ("Sure, here's the action: {...} let me know if..."). Slicing from
        # the first "{" to the last "}" recovers the common case without
        # trying to be a general-purpose JSON extractor.
        start, end = candidate.find("{"), candidate.rfind("}")
        if start != -1 and end > start:
            try:
                data = json.loads(candidate[start : end + 1])
            except (ValueError, TypeError):
                raise PlannerProtocolError(
                    "BAD_ACTION_JSON", f"Planner response is not valid JSON: {error}"
                ) from error
        else:
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

A transaction's "operations" array may hold more than one operation --
build a whole scene as one transaction with several object.create entries
rather than proposing one object per step.

Key operation parameters (ids/coordinates below are examples, not literal
values to reuse):
- object.create: {{"type": "object.create", "objectType": "<one of: {object_types}>", "id": "lowercase_snake_case", "name": "Display Name", "position": [x, y, z], "rotation": [x, y, z]}}
  objectType MUST be exactly one of the values listed above -- there is no
  "building", "man", "woman", "tree", or any other free-form type. Represent
  a building with one or more "cube" objects sized/placed via
  object.transform. Any other value is rejected outright.
- object.transform: {{"type": "object.transform", "objectId": "<id from object.create/asset.instantiate_by_id or a query>", "position": [x, y, z], "rotation": [x, y, z], "scale": [x, y, z]}}
- camera.transform: {{"type": "camera.transform", "cameraId": "<existing id, omit for the active camera>", "position": [x, y, z], "target": [x, y, z]}}
- camera.look_at: {{"type": "camera.look_at", "objectId": "<existing id>"}} (or "point": [x, y, z] instead of objectId)

People: never build a person out of primitives and never use object.create's
"human" type unless catalog_search below genuinely finds nothing usable --
that type is a placeholder box, not a character. Whenever the instruction
asks for a person (man, woman, worker, character, ...), first issue
{{"action": "query", "query": {{"type": "asset.catalog_search", "kind": "character", "search": "<a word from the instruction, or empty for all characters>"}}}}.
It returns items shaped {{"id", "name", "kind", "tags", "animations": [{{"id", "name", "clip"}}, ...]}}
-- never a file path or rig. Pick the best-matching item's "id" as assetId:
{{"type": "asset.instantiate_by_id", "assetId": "<id from catalog_search>", "id": "lowercase_snake_case", "point": [x, y, z]}}
The resulting objectId is always "character_<the id you gave>" (e.g. "man1"
becomes "character_man1") -- use that exact value for any object.transform
or character.set_motion on the same character, even within the very same
transaction.
If the instruction names a specific action (working, walking, idle, ...),
look for a matching entry in that item's "animations" and add, in the same
transaction:
{{"type": "character.set_motion", "objectId": "character_<your id>", "motion": {{"clip_id": "<that animation's \"clip\" value -- NOT its "id">", "speed": 1, "loop": true}}}}
Do not guess a clip name that catalog_search never returned.

Use Director queries to resolve existing IDs. Never invent camera IDs,
object IDs, asset IDs, joints, or animation clips -- object.create and
asset.instantiate_by_id are the only operations that mint a new object id
(either the "id" you supply, or an auto-generated one if you omit it).
Respect entity locks. Prefer the smallest transaction that satisfies the
user's intent.

Do not output filesystem operations, shell commands, Python, JavaScript, or
arbitrary URLs. A transaction is a proposal: OmniCam validates it separately
before anything changes."""


def build_system_prompt(
    *, operations: list[str], queries: list[str], object_types: list[str] | None = None
) -> str:
    return PLANNER_SYSTEM_PROMPT_TEMPLATE.format(
        queries=", ".join(sorted(queries)),
        operations=", ".join(sorted(operations)),
        object_types=", ".join(sorted(object_types or PLANNER_OBJECT_TYPES)),
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
