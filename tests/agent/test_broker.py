"""Unit tests for the OmniCam Agent v1 session broker.

Pure asyncio tests: no live ComfyUI, no real WebSocket. PromptServer.send_sync
is patched to a stub that records calls (or fails, for the timeout tests).
"""

from __future__ import annotations

import asyncio

import pytest

from omnicam.agent.broker import AgentBroker
from omnicam.agent.protocol import MAX_SESSIONS, AgentProtocolError


def register(broker: AgentBroker, *, client_id="client_1", node_id="42"):
    return broker.register(
        client_id=client_id,
        node_id=node_id,
        label=f"OmniCam Director {node_id}",
        director_api=1,
        revision=0,
        operations=("camera.transform",),
        queries=("scene.summary",),
    )


def test_registration_returns_a_session_with_a_token():
    broker = AgentBroker()
    session = register(broker)
    assert session.session_id
    assert session.token
    assert session.client_id == "client_1"
    assert session.node_id == "42"


def test_same_client_and_node_replaces_the_old_session():
    broker = AgentBroker()
    first = register(broker)
    second = register(broker)
    assert first.session_id != second.session_id
    with pytest.raises(AgentProtocolError) as excinfo:
        broker.require_session(first.session_id)
    assert excinfo.value.code == "UNKNOWN_SESSION"


def test_heartbeat_updates_revision_and_rejects_wrong_token():
    broker = AgentBroker()
    session = register(broker)
    broker.heartbeat(session.session_id, session.token, revision=7)
    assert broker.require_session(session.session_id).revision == 7

    with pytest.raises(AgentProtocolError) as excinfo:
        broker.heartbeat(session.session_id, "not-the-token", revision=8)
    assert excinfo.value.code == "BAD_SESSION_TOKEN"


def test_ttl_prunes_a_stale_session(monkeypatch):
    broker = AgentBroker()
    session = register(broker)

    clock = {"now": 1000.0}
    monkeypatch.setattr("omnicam.agent.broker.time.monotonic", lambda: clock["now"])
    broker._sessions[session.session_id].touched_at = clock["now"]
    clock["now"] += 1000.0  # well past SESSION_TTL_SECONDS

    with pytest.raises(AgentProtocolError) as excinfo:
        broker.require_session(session.session_id)
    assert excinfo.value.code == "UNKNOWN_SESSION"


def test_session_capacity_is_bounded():
    broker = AgentBroker()
    for index in range(MAX_SESSIONS):
        register(broker, client_id=f"client_{index}", node_id=str(index))
    with pytest.raises(AgentProtocolError) as excinfo:
        register(broker, client_id="one_too_many", node_id="9999")
    assert excinfo.value.code == "AGENT_BUSY"


@pytest.mark.asyncio
async def test_dispatch_sends_to_the_registered_client_id(monkeypatch):
    broker = AgentBroker()
    session = register(broker)
    sent = {}

    def fake_send_sync(event, message, client_id):
        sent["event"] = event
        sent["message"] = message
        sent["client_id"] = client_id
        broker.reply(session.session_id, session.token, message["request_id"], {"ok": True})

    monkeypatch.setattr("omnicam.agent.broker.PromptServer.instance.send_sync", fake_send_sync)

    result = await broker.dispatch(session.session_id, "query", {"type": "scene.summary"})
    assert result == {"ok": True}
    assert sent["client_id"] == "client_1"
    assert sent["message"]["node_id"] == "42"
    assert sent["message"]["kind"] == "query"


@pytest.mark.asyncio
async def test_reply_resolves_the_awaiting_future(monkeypatch):
    broker = AgentBroker()
    session = register(broker)
    captured_request_id = {}

    def fake_send_sync(event, message, client_id):
        captured_request_id["id"] = message["request_id"]

    monkeypatch.setattr("omnicam.agent.broker.PromptServer.instance.send_sync", fake_send_sync)

    task = asyncio.create_task(broker.dispatch(session.session_id, "query", {}))
    await asyncio.sleep(0)  # let dispatch register the pending future
    broker.reply(session.session_id, session.token, captured_request_id["id"], {"ok": True, "value": 42})

    result = await task
    assert result == {"ok": True, "value": 42}


@pytest.mark.asyncio
async def test_reply_from_the_wrong_session_cannot_resolve_a_request(monkeypatch):
    broker = AgentBroker()
    session_a = register(broker, client_id="client_a", node_id="1")
    session_b = register(broker, client_id="client_b", node_id="2")
    captured_request_id = {}

    def fake_send_sync(event, message, client_id):
        captured_request_id["id"] = message["request_id"]

    monkeypatch.setattr("omnicam.agent.broker.PromptServer.instance.send_sync", fake_send_sync)

    task = asyncio.create_task(broker.dispatch(session_a.session_id, "query", {}))
    await asyncio.sleep(0)

    with pytest.raises(AgentProtocolError) as excinfo:
        broker.reply(session_b.session_id, session_b.token, captured_request_id["id"], {"ok": True})
    assert excinfo.value.code == "REQUEST_SESSION_MISMATCH"

    # Clean up the still-pending future so the test does not leak a timer.
    broker.reply(session_a.session_id, session_a.token, captured_request_id["id"], {"ok": True})
    await task


@pytest.mark.asyncio
async def test_dispatch_times_out_and_cleans_up_the_pending_request(monkeypatch):
    broker = AgentBroker()
    session = register(broker)
    monkeypatch.setattr("omnicam.agent.broker.REQUEST_TIMEOUT_SECONDS", 0.05)
    monkeypatch.setattr("omnicam.agent.broker.PromptServer.instance.send_sync", lambda *a, **k: None)

    with pytest.raises(AgentProtocolError) as excinfo:
        await broker.dispatch(session.session_id, "query", {})
    assert excinfo.value.code == "AGENT_BROWSER_TIMEOUT"
    assert broker._pending == {}


@pytest.mark.asyncio
async def test_pending_request_capacity_is_bounded(monkeypatch):
    broker = AgentBroker()
    session = register(broker)
    monkeypatch.setattr("omnicam.agent.broker.PromptServer.instance.send_sync", lambda *a, **k: None)
    monkeypatch.setattr("omnicam.agent.broker.MAX_PENDING_REQUESTS", 1)

    task = asyncio.create_task(broker.dispatch(session.session_id, "query", {}))
    await asyncio.sleep(0)

    with pytest.raises(AgentProtocolError) as excinfo:
        await broker.dispatch(session.session_id, "query", {})
    assert excinfo.value.code == "AGENT_BUSY"

    broker.reply(session.session_id, session.token, next(iter(broker._pending)), {"ok": True})
    await task


@pytest.mark.asyncio
async def test_close_fails_every_pending_request_for_that_session(monkeypatch):
    broker = AgentBroker()
    session = register(broker)
    monkeypatch.setattr("omnicam.agent.broker.PromptServer.instance.send_sync", lambda *a, **k: None)

    task = asyncio.create_task(broker.dispatch(session.session_id, "query", {}))
    await asyncio.sleep(0)

    broker.close(session.session_id, session.token)

    with pytest.raises(AgentProtocolError) as excinfo:
        await task
    assert excinfo.value.code == "SESSION_CLOSED"
    assert broker._pending == {}


def test_wrong_token_cannot_close_a_session():
    broker = AgentBroker()
    session = register(broker)
    with pytest.raises(AgentProtocolError) as excinfo:
        broker.close(session.session_id, "not-the-token")
    assert excinfo.value.code == "BAD_SESSION_TOKEN"
    broker.require_session(session.session_id)  # still alive


def test_list_sessions_never_leaks_token_or_client_id():
    broker = AgentBroker()
    register(broker)
    rows = broker.list_sessions()
    assert len(rows) == 1
    row = rows[0]
    assert "token" not in row
    assert "client_id" not in row
    assert row["node_id"] == "42"
