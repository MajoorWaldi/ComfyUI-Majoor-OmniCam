"""Tests for the built-in Agent planner HTTP routes (design spec sections
30-31): POST /plan and POST /apply-plan.
"""

from __future__ import annotations

import json
from unittest.mock import Mock

import pytest
from aiohttp.streams import StreamReader
from aiohttp.test_utils import make_mocked_request

from omnicam.agent import planner_routes
from omnicam.agent.broker import BROKER
from omnicam.agent.plan_store import PLAN_STORE
from omnicam.agent.providers import secret_store as store_module
from omnicam.agent.providers.registry import PROVIDERS


@pytest.fixture(autouse=True)
def _reset_state(tmp_path, monkeypatch):
    BROKER._sessions.clear()
    BROKER._pending.clear()
    PLAN_STORE._plans.clear()
    root = tmp_path / "__omnicam" / "agent" / "secrets"
    root.mkdir(parents=True)
    monkeypatch.setattr(store_module, "_store_root", lambda: root)
    monkeypatch.setattr(store_module, "_request_user_id", lambda request: "user_a")
    monkeypatch.setattr(planner_routes, "_request_user_id", lambda request: "user_a")
    yield
    BROKER._sessions.clear()
    BROKER._pending.clear()
    PLAN_STORE._plans.clear()


def _register_session(client_id="client_1"):
    return BROKER.register(
        client_id=client_id, node_id="42", label="Director 42", director_api=1,
        revision=0, operations=(), queries=(),
    )


def _json_request(method, path, body):
    payload = json.dumps(body).encode("utf-8")
    stream = StreamReader(Mock(), limit=2**20, loop=None)
    stream.feed_data(payload)
    stream.feed_eof()
    return make_mocked_request(method, path, payload=stream)


class _FinishingProvider:
    async def complete(self, request, config, credential):
        from omnicam.agent.providers.models import ProviderResponse

        return ProviderResponse(
            text=json.dumps({"action": "finish", "message": "nothing to do"}),
            model=config.model, usage={"input_tokens": 0, "output_tokens": 0},
        )

    async def list_models(self, config, credential):
        return []


class _TransactionProvider:
    async def complete(self, request, config, credential):
        from omnicam.agent.providers.models import ProviderResponse

        return ProviderResponse(
            text=json.dumps({
                "action": "transaction",
                "transaction": {
                    "description": "Lower the camera",
                    "operations": [{"type": "camera.transform", "cameraId": "camera_1", "position": [0, 1, 2]}],
                },
            }),
            model=config.model, usage={"input_tokens": 0, "output_tokens": 0},
        )

    async def list_models(self, config, credential):
        return []


def _plan_body(session):
    return {
        "session_id": session.session_id,
        "instruction": "lower the camera",
        "provider": {"id": "ollama", "model": "test-model"},
    }


@pytest.mark.asyncio
async def test_plan_route_rejects_an_unknown_session():
    request = _json_request("POST", "/majoor/omnicam/agent/v1/plan", {
        "session_id": "does-not-exist", "instruction": "x", "provider": {"id": "ollama"},
    })
    response = await planner_routes.create_plan(request)
    assert response.status == 404
    assert json.loads(response.body)["error"]["code"] == "UNKNOWN_SESSION"


@pytest.mark.asyncio
async def test_plan_route_returns_finished_message_when_the_planner_gives_up(monkeypatch):
    monkeypatch.setitem(PROVIDERS, "ollama", _FinishingProvider())

    async def fake_dispatch(session_id, kind, payload):
        return {"ok": True, "revision": 0}

    monkeypatch.setattr(BROKER, "dispatch", fake_dispatch)

    session = _register_session()
    response = await planner_routes.create_plan(_json_request("POST", "/majoor/omnicam/agent/v1/plan", _plan_body(session)))
    body = json.loads(response.body)
    assert body["ok"] is True
    assert body["finished"] is True
    assert body["message"] == "nothing to do"


@pytest.mark.asyncio
async def test_plan_route_returns_a_preview_and_stores_a_pending_plan(monkeypatch):
    monkeypatch.setitem(PROVIDERS, "ollama", _TransactionProvider())

    async def fake_dispatch(session_id, kind, payload):
        if kind == "query":
            return {"ok": True, "revision": 9}
        return {"ok": True, "revision": 9, "changes": [{"entity": "camera_1", "field": "position"}], "warnings": []}

    monkeypatch.setattr(BROKER, "dispatch", fake_dispatch)

    session = _register_session()
    response = await planner_routes.create_plan(_json_request("POST", "/majoor/omnicam/agent/v1/plan", _plan_body(session)))
    body = json.loads(response.body)
    assert body["ok"] is True
    assert body["plan_id"].startswith("plan_")
    assert body["revision"] == 9
    assert body["description"] == "Lower the camera"
    assert body["changes"] == [{"entity": "camera_1", "field": "position"}]
    assert body["truncated"] is False

    # No credential, no raw provider response, ever reaches the client.
    assert "credential" not in body
    assert "raw_response" not in body


@pytest.mark.asyncio
async def test_apply_plan_requires_the_plan_id():
    response = await planner_routes.apply_plan(_json_request("POST", "/majoor/omnicam/agent/v1/apply-plan", {}))
    assert response.status == 400


@pytest.mark.asyncio
async def test_apply_plan_rejects_an_unknown_plan():
    response = await planner_routes.apply_plan(
        _json_request("POST", "/majoor/omnicam/agent/v1/apply-plan", {"plan_id": "plan_nope"})
    )
    assert response.status == 404
    assert json.loads(response.body)["error"]["code"] == "UNKNOWN_PLAN"


@pytest.mark.asyncio
async def test_apply_plan_rejects_a_plan_owned_by_another_user():
    session = _register_session()
    plan = PLAN_STORE.create(
        owner_id="someone_else", session_id=session.session_id, base_revision=1,
        transaction={"id": "tx", "version": 1, "description": "x", "operations": [], "validateOnly": True},
        preview={"changes": []},
    )
    response = await planner_routes.apply_plan(
        _json_request("POST", "/majoor/omnicam/agent/v1/apply-plan", {"plan_id": plan.plan_id})
    )
    assert response.status == 404
    assert json.loads(response.body)["error"]["code"] == "UNKNOWN_PLAN"


@pytest.mark.asyncio
async def test_apply_plan_dispatches_once_with_validate_only_false_and_consumes_the_plan(monkeypatch):
    dispatched = []

    async def fake_dispatch(session_id, kind, payload):
        dispatched.append(payload)
        return {"ok": True, "revision": 10, "applied": 1}

    monkeypatch.setattr(BROKER, "dispatch", fake_dispatch)

    session = _register_session()
    plan = PLAN_STORE.create(
        owner_id="user_a", session_id=session.session_id, base_revision=9,
        transaction={"id": "tx_1", "version": 1, "description": "x", "baseRevision": 9,
                     "operations": [{"type": "camera.transform", "cameraId": "camera_1"}], "validateOnly": True},
        preview={"changes": []},
    )

    response = await planner_routes.apply_plan(
        _json_request("POST", "/majoor/omnicam/agent/v1/apply-plan", {"plan_id": plan.plan_id})
    )
    body = json.loads(response.body)
    assert body["ok"] is True
    assert body["revision"] == 10
    assert len(dispatched) == 1
    assert dispatched[0]["validateOnly"] is False
    assert PLAN_STORE.get(plan.plan_id) is None  # consumed


@pytest.mark.asyncio
async def test_apply_plan_reports_stale_plan_on_revision_mismatch(monkeypatch):
    async def fake_dispatch(session_id, kind, payload):
        return {"ok": False, "error": {"code": "STALE_REVISION", "message": "changed"}}

    monkeypatch.setattr(BROKER, "dispatch", fake_dispatch)

    session = _register_session()
    plan = PLAN_STORE.create(
        owner_id="user_a", session_id=session.session_id, base_revision=9,
        transaction={"id": "tx_1", "version": 1, "description": "x", "baseRevision": 9,
                     "operations": [], "validateOnly": True},
        preview={"changes": []},
    )

    response = await planner_routes.apply_plan(
        _json_request("POST", "/majoor/omnicam/agent/v1/apply-plan", {"plan_id": plan.plan_id})
    )
    assert response.status == 409
    assert json.loads(response.body)["error"]["code"] == "STALE_PLAN"
    assert PLAN_STORE.get(plan.plan_id) is None  # a stale plan is not retryable
