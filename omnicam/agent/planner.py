"""The bounded Agent planner loop (design spec sections 24-28).

The planner is an orchestrator, not a second scene engine: every query and
transaction it issues goes through the exact same BROKER.dispatch() path a
live Director browser answers over its existing Agent session -- there is no
separate mutation surface for the built-in Agent. A transaction proposal is
always forced through with validateOnly=true and a server-supplied
baseRevision; the model never controls either.
"""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass

from .broker import BROKER
from .plan_store import PLAN_STORE, PendingPlan
from .planner_schema import (
    DIRECTOR_API_VERSION,
    PlannerProtocolError,
    build_system_prompt,
    parse_action,
    render_conversation,
)
from .providers.models import ProviderConfig
from .providers.registry import get_provider


@dataclass(slots=True)
class PlannerResult:
    finished: bool
    message: str | None = None
    plan: PendingPlan | None = None


async def _current_revision(session_id: str) -> int:
    observation = await BROKER.dispatch(session_id, "query", {"type": "health.get"})
    return int(observation.get("revision") or 0)


async def run_planner(
    *,
    session_id: str,
    owner_id: str,
    instruction: str,
    provider_config: ProviderConfig,
    credential: str | None,
    max_planner_steps: int,
    operations: list[str],
    queries: list[str],
) -> PlannerResult:
    provider = get_provider(provider_config.provider_id)
    conversation: list[dict] = [
        {"role": "system", "content": build_system_prompt(operations=operations, queries=queries)},
        {"role": "user", "content": instruction},
    ]

    for _step in range(max(1, max_planner_steps)):
        prompt = render_conversation(conversation)
        response = await provider.complete(prompt, provider_config, credential)

        try:
            action = parse_action(response.text)
        except PlannerProtocolError as error:
            conversation.append({"role": "assistant", "content": response.text})
            conversation.append({
                "role": "user",
                "content": f"Error: {error}. Return exactly one JSON action matching the schema.",
            })
            continue

        if action["type"] == "query":
            observation = await BROKER.dispatch(session_id, "query", action["query"])
            conversation.append({"role": "assistant", "content": response.text})
            conversation.append({"role": "user", "content": json.dumps(observation)})
            continue

        if action["type"] == "transaction":
            base_revision = await _current_revision(session_id)
            transaction = {
                "version": DIRECTOR_API_VERSION,
                "id": f"plan_preview_{uuid.uuid4().hex}",
                "description": action["description"],
                "baseRevision": base_revision,
                "operations": action["operations"],
                "validateOnly": True,
            }
            preview = await BROKER.dispatch(session_id, "transaction", transaction)
            if not preview.get("ok"):
                conversation.append({"role": "assistant", "content": response.text})
                conversation.append({"role": "user", "content": json.dumps(preview)})
                continue

            plan = PLAN_STORE.create(
                owner_id=owner_id,
                session_id=session_id,
                base_revision=base_revision,
                transaction=transaction,
                preview=preview,
            )
            return PlannerResult(finished=False, plan=plan)

        # action["type"] == "finish"
        return PlannerResult(finished=True, message=action["message"])

    return PlannerResult(finished=True, message="Planner exceeded its bounded step budget without a result.")
