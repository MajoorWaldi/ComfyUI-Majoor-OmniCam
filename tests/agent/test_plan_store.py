"""Tests for the ephemeral Preview plan cache (design spec section 29)."""

from __future__ import annotations

from omnicam.agent.plan_store import MAX_PLANS_GLOBAL, MAX_PLANS_PER_USER, PlanStore


def _plan(store, owner_id="user_a", session_id="sess_1"):
    return store.create(
        owner_id=owner_id, session_id=session_id, base_revision=1,
        transaction={"id": "tx_1"}, preview={"changes": []},
    )


def test_create_then_get_then_consume():
    store = PlanStore()
    plan = _plan(store)
    assert store.get(plan.plan_id) is plan
    consumed = store.consume(plan.plan_id)
    assert consumed is plan
    assert store.get(plan.plan_id) is None


def test_consuming_an_unknown_plan_returns_none():
    store = PlanStore()
    assert store.consume("plan_does_not_exist") is None


def test_plans_expire_after_their_ttl(monkeypatch):
    store = PlanStore()
    times = iter([1000.0, 1200.0])
    monkeypatch.setattr("omnicam.agent.plan_store.time.time", lambda: next(times))
    plan = _plan(store)
    assert store.get(plan.plan_id) is None


def test_per_user_cap_evicts_the_oldest_plan_for_that_user(monkeypatch):
    store = PlanStore()
    clock = [1000.0]
    monkeypatch.setattr("omnicam.agent.plan_store.time.time", lambda: clock[0])

    first = _plan(store, owner_id="user_a")
    for _ in range(MAX_PLANS_PER_USER - 1):
        clock[0] += 1
        _plan(store, owner_id="user_a")

    assert store.get(first.plan_id) is not None
    clock[0] += 1
    _plan(store, owner_id="user_a")
    assert store.get(first.plan_id) is None


def test_per_user_cap_does_not_evict_another_users_plans(monkeypatch):
    store = PlanStore()
    clock = [1000.0]
    monkeypatch.setattr("omnicam.agent.plan_store.time.time", lambda: clock[0])

    other = _plan(store, owner_id="user_b")
    for _ in range(MAX_PLANS_PER_USER):
        clock[0] += 1
        _plan(store, owner_id="user_a")

    assert store.get(other.plan_id) is not None


def test_global_cap_evicts_the_oldest_plan_overall(monkeypatch):
    store = PlanStore()
    # A tiny, sub-TTL clock step per plan: filling MAX_PLANS_GLOBAL slots one
    # user at a time must reach the cap well before any of them expire on
    # their own (PLAN_TTL_SECONDS), or eviction would come from the TTL path
    # instead of the global-cap path this test is checking.
    clock = [1000.0]
    monkeypatch.setattr("omnicam.agent.plan_store.time.time", lambda: clock[0])

    first = _plan(store, owner_id="user_1")
    for users in range(2, MAX_PLANS_GLOBAL + 1):
        clock[0] += 0.01
        _plan(store, owner_id=f"user_{users}")

    assert store.count() == MAX_PLANS_GLOBAL
    assert store.get(first.plan_id) is not None

    clock[0] += 0.01
    _plan(store, owner_id=f"user_{MAX_PLANS_GLOBAL + 1}")
    assert store.get(first.plan_id) is None
    assert store.count() <= MAX_PLANS_GLOBAL


def test_stored_plan_never_carries_a_credential_or_raw_provider_response():
    store = PlanStore()
    plan = _plan(store)
    assert not hasattr(plan, "credential")
    assert not hasattr(plan, "raw_response")
    assert not hasattr(plan, "reasoning")
