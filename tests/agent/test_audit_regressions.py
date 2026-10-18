"""Regression coverage for the Comfy Agent preparation audit."""

import json

import pytest

from omnicam.agent.broker import AgentBroker
from omnicam.agent.protocol import AgentProtocolError
from omnicam.agent.providers.models import ProviderConfig
from omnicam.agent.providers.openai import OpenAIProvider


def register(broker, **target):
    return broker.register(client_id="browser", node_id="42", label="Director",
                           director_api=1, revision=0, operations=(), queries=(), **target)


def test_same_node_id_in_two_documents_does_not_replace_sessions():
    broker = AgentBroker()
    a = register(broker, target={"document_id": "a", "instance_id": "one"})
    b = register(broker, target={"document_id": "b", "instance_id": "two"})
    assert broker.require_session(a.session_id) is a
    assert broker.require_session(b.session_id) is b
    assert broker.list_sessions()[0]["target"]["document_id"] == "a"


@pytest.mark.asyncio
async def test_late_commit_reply_is_recoverable_and_retry_does_not_resend(monkeypatch):
    broker = AgentBroker()
    session = register(broker)
    messages = []
    monkeypatch.setattr("omnicam.agent.broker.REQUEST_TIMEOUT_SECONDS", 0.001)
    monkeypatch.setattr("omnicam.agent.broker.PromptServer.instance.send_sync",
                        lambda event, message, client: messages.append(message))
    tx = {"id": "stable-intent", "baseRevision": 0, "operations": []}
    with pytest.raises(AgentProtocolError, match="did not answer"):
        await broker.dispatch(session.session_id, "transaction", tx)
    assert broker.transaction_status(session.session_id, tx["id"])["status"] == "unknown"
    broker.reply(session.session_id, session.token, messages[0]["request_id"], {"ok": True, "revision": 1})
    assert await broker.dispatch(session.session_id, "transaction", tx) == {"ok": True, "revision": 1}
    assert len(messages) == 1
    assert messages[0]["deadline_ms"] > 0
    assert broker.transaction_status(session.session_id, tx["id"])["status"] == "completed"
    with pytest.raises(AgentProtocolError) as error:
        await broker.dispatch(session.session_id, "transaction", {**tx, "baseRevision": 1})
    assert error.value.code == "TRANSACTION_ID_CONFLICT"


@pytest.mark.asyncio
async def test_native_provider_never_sends_saved_key_to_custom_origin(monkeypatch):
    # A loopback override must also be rejected before any connection is made.
    config = ProviderConfig(provider_id="openai", model="test", base_url="http://127.0.0.1:1234/v1")
    with pytest.raises(Exception) as error:
        await OpenAIProvider().probe(config, "fake-secret")
    assert getattr(error.value, "code", None) == "CREDENTIAL_ORIGIN_MISMATCH"


@pytest.mark.asyncio
async def test_planner_preserves_observation_revision(monkeypatch):
    from omnicam.agent import planner
    from omnicam.agent.providers.models import ProviderResponse

    dispatched = []

    async def dispatch(session, kind, payload):
        dispatched.append((kind, payload))
        if kind == "query":
            return {"ok": True, "revision": 3 if payload["type"] == "scene.summary" else 4}
        assert payload["baseRevision"] == 3
        return {"ok": False, "error": {"code": "STALE_REVISION"}}

    actions = iter([
        {"action": "query", "query": {"type": "scene.summary"}},
        {"action": "transaction", "transaction": {"description": "move", "operations": [{"type": "camera.transform"}]}},
    ])

    class Provider:
        async def complete(self, *args):
            return ProviderResponse(text=json.dumps(next(actions)), model="test", usage={})

    monkeypatch.setattr(planner.BROKER, "dispatch", dispatch)
    monkeypatch.setattr(planner, "get_provider", lambda _: Provider())
    with pytest.raises(AgentProtocolError) as error:
        await planner.run_planner(session_id="s", owner_id="u", instruction="move",
                                  provider_config=ProviderConfig(provider_id="ollama", model="test", base_url=""),
                                  credential=None, max_planner_steps=2,
                                  operations=["camera.transform"], queries=["scene.summary"])
    assert error.value.code == "STALE_PLAN"


@pytest.mark.asyncio
async def test_preview_and_apply_share_id_without_aliasing_outcomes(monkeypatch):
    broker = AgentBroker()
    session = register(broker)
    sent = []

    def send(event, message, client):
        sent.append(message)
        broker.reply(session.session_id, session.token, message["request_id"],
                     {"ok": True, "validateOnly": message["payload"].get("validateOnly")})

    monkeypatch.setattr("omnicam.agent.broker.PromptServer.instance.send_sync", send)
    tx = {"id": "reviewed", "baseRevision": 0, "operations": []}
    assert (await broker.dispatch(session.session_id, "transaction", {**tx, "validateOnly": True}))["validateOnly"]
    assert (await broker.dispatch(session.session_id, "transaction", {**tx, "validateOnly": False}))["validateOnly"] is False
    assert len(sent) == 2


@pytest.mark.asyncio
async def test_journal_capacity_never_evicts_a_retained_intent(monkeypatch):
    from omnicam.agent import transaction_journal

    monkeypatch.setattr(transaction_journal, "MAX_TRANSACTION_RECORDS", 1)
    broker = AgentBroker()
    session = register(broker)

    def send(event, message, client):
        broker.reply(session.session_id, session.token, message["request_id"], {"ok": True})

    monkeypatch.setattr("omnicam.agent.broker.PromptServer.instance.send_sync", send)
    await broker.dispatch(session.session_id, "transaction", {"id": "one"})
    with pytest.raises(AgentProtocolError) as error:
        await broker.dispatch(session.session_id, "transaction", {"id": "two"})
    assert error.value.code == "AGENT_BUSY"
    assert (await broker.dispatch(session.session_id, "transaction", {"id": "one"}))["ok"]
