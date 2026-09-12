"""Ephemeral Preview-plan cache (design spec section 29).

A plan is a Preview's proposed, already-validated transaction, held just long
enough for the user to hit Apply. Nothing here is persisted across a
restart, no credentials or raw provider responses are stored, and every plan
expires on its own even if never consumed.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass

MAX_PLANS_GLOBAL = 128
MAX_PLANS_PER_USER = 32
PLAN_TTL_SECONDS = 120.0


@dataclass(slots=True)
class PendingPlan:
    plan_id: str
    owner_id: str
    session_id: str
    base_revision: int
    transaction: dict
    preview: dict
    created_at: float


class PlanStore:
    def __init__(self) -> None:
        self._plans: dict[str, PendingPlan] = {}

    def _evict_expired(self, now: float) -> None:
        expired = [plan_id for plan_id, plan in self._plans.items() if now - plan.created_at > PLAN_TTL_SECONDS]
        for plan_id in expired:
            self._plans.pop(plan_id, None)

    def _evict_oldest_global(self) -> None:
        if not self._plans:
            return
        oldest_id = min(self._plans, key=lambda plan_id: self._plans[plan_id].created_at)
        self._plans.pop(oldest_id, None)

    def _evict_oldest_for_owner(self, owner_id: str) -> None:
        owned = [plan for plan in self._plans.values() if plan.owner_id == owner_id]
        if not owned:
            return
        oldest = min(owned, key=lambda plan: plan.created_at)
        self._plans.pop(oldest.plan_id, None)

    def create(
        self, *, owner_id: str, session_id: str, base_revision: int, transaction: dict, preview: dict
    ) -> PendingPlan:
        now = time.time()
        self._evict_expired(now)

        while sum(1 for plan in self._plans.values() if plan.owner_id == owner_id) >= MAX_PLANS_PER_USER:
            self._evict_oldest_for_owner(owner_id)
        while len(self._plans) >= MAX_PLANS_GLOBAL:
            self._evict_oldest_global()

        plan = PendingPlan(
            plan_id=f"plan_{uuid.uuid4().hex}",
            owner_id=owner_id,
            session_id=session_id,
            base_revision=base_revision,
            transaction=transaction,
            preview=preview,
            created_at=now,
        )
        self._plans[plan.plan_id] = plan
        return plan

    def get(self, plan_id: str) -> PendingPlan | None:
        self._evict_expired(time.time())
        return self._plans.get(plan_id)

    def consume(self, plan_id: str) -> PendingPlan | None:
        plan = self.get(plan_id)
        if plan is not None:
            self._plans.pop(plan_id, None)
        return plan

    def count(self) -> int:
        return len(self._plans)


PLAN_STORE = PlanStore()
