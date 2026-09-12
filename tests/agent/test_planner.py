"""Tests for the planner JSON action protocol (design spec sections 24-28)."""

from __future__ import annotations

import json

import pytest

from omnicam.agent import planner as planner_module
from omnicam.agent.planner_schema import (
    PLANNER_OBJECT_TYPES,
    PLANNER_OPERATIONS,
    PLANNER_QUERIES,
    PlannerProtocolError,
    build_system_prompt,
    parse_action,
    render_conversation,
)
from omnicam.agent.providers.models import ProviderConfig
from omnicam.agent.providers.registry import PROVIDERS


def test_parses_a_query_action():
    action = parse_action(json.dumps({"action": "query", "query": {"type": "scene.summary"}}))
    assert action == {"type": "query", "query": {"type": "scene.summary"}}


def test_parses_an_action_wrapped_in_a_markdown_code_fence():
    payload = json.dumps({"action": "query", "query": {"type": "scene.summary"}})
    action = parse_action(f"```json\n{payload}\n```")
    assert action == {"type": "query", "query": {"type": "scene.summary"}}


def test_parses_an_action_wrapped_in_a_bare_code_fence():
    payload = json.dumps({"action": "finish", "message": "done"})
    action = parse_action(f"```\n{payload}\n```")
    assert action == {"type": "finish", "message": "done"}


def test_parses_an_action_with_surrounding_prose():
    payload = json.dumps({"action": "finish", "message": "done"})
    action = parse_action(f"Sure, here's the action:\n\n{payload}\n\nLet me know if you need anything else.")
    assert action == {"type": "finish", "message": "done"}


def test_parses_a_transaction_action():
    payload = {
        "action": "transaction",
        "transaction": {
            "description": "Lower and move the camera closer",
            "operations": [{"type": "camera.transform", "cameraId": "camera_1", "position": [0.0, 1.2, 3.5]}],
        },
    }
    action = parse_action(json.dumps(payload))
    assert action["type"] == "transaction"
    assert action["description"] == "Lower and move the camera closer"
    assert len(action["operations"]) == 1


def test_parses_a_finish_action():
    action = parse_action(json.dumps({"action": "finish", "message": "cannot represent that safely"}))
    assert action == {"type": "finish", "message": "cannot represent that safely"}


def test_finish_without_a_message_defaults_to_empty_string():
    action = parse_action(json.dumps({"action": "finish"}))
    assert action["message"] == ""


@pytest.mark.parametrize(
    "text",
    [
        "not json at all",
        "",
        "null",
        "42",
        '["array", "not object"]',
        json.dumps({"action": "shell", "command": "rm -rf /"}),
        json.dumps({"action": "python", "code": "import os"}),
        json.dumps({}),
        json.dumps({"action": "query"}),
        json.dumps({"action": "query", "query": {}}),
        json.dumps({"action": "query", "query": "scene.summary"}),
        json.dumps({"action": "transaction"}),
        json.dumps({"action": "transaction", "transaction": {}}),
        json.dumps({"action": "transaction", "transaction": {"description": "x", "operations": []}}),
        json.dumps({"action": "transaction", "transaction": {"description": "", "operations": [{"type": "x"}]}}),
        json.dumps({"action": "transaction", "transaction": {"description": "x", "operations": ["not-an-object"]}}),
    ],
)
def test_rejects_every_malformed_or_forbidden_action(text):
    with pytest.raises(PlannerProtocolError):
        parse_action(text)


def test_system_prompt_lists_the_actual_supported_operations_and_queries():
    prompt = build_system_prompt(operations=["camera.transform", "object.delete"], queries=["scene.summary"])
    assert "camera.transform" in prompt
    assert "object.delete" in prompt
    assert "scene.summary" in prompt
    assert "Do not output filesystem operations, shell commands, Python, JavaScript" in prompt


def test_system_prompt_teaches_the_object_create_type_vocabulary():
    # Without this, "add a building" reliably hallucinates an objectType
    # (e.g. "building") that object.create always rejects.
    prompt = build_system_prompt(operations=list(PLANNER_OPERATIONS), queries=list(PLANNER_QUERIES))
    for object_type in PLANNER_OBJECT_TYPES:
        assert object_type in prompt
    assert "building" not in prompt.lower().split("there is no")[0]
    assert '"objectType"' in prompt
    assert "object.transform" in prompt
    assert "camera.look_at" in prompt


def test_system_prompt_teaches_the_catalog_character_workflow():
    # Without this, "add a man working" reliably hallucinates a primitive
    # objectType ("man"/"human" box) instead of using the real rigged
    # character catalogue and never sets up its animation.
    prompt = build_system_prompt(operations=list(PLANNER_OPERATIONS), queries=list(PLANNER_QUERIES))
    assert "asset.catalog_search" in prompt
    assert "asset.instantiate_by_id" in prompt
    assert '"kind": "character"' in prompt
    assert "character_" in prompt
    assert "character.set_motion" in prompt
    assert '"clip"' in prompt


def test_render_conversation_flattens_role_labeled_turns():
    text = render_conversation([
        {"role": "system", "content": "sys"},
        {"role": "user", "content": "hello"},
    ])
    assert "[SYSTEM]" in text
    assert "sys" in text
    assert "[USER]" in text
    assert "hello" in text


# -- the bounded planner loop (design spec sections 24-28) -------------------


class _ScriptedProvider:
    """Replays one canned response.text per call, in order."""

    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []

    async def complete(self, request, config, credential):
        self.calls.append(request)
        from omnicam.agent.providers.models import ProviderResponse

        text = self._responses.pop(0)
        return ProviderResponse(text=text, model=config.model, usage={"input_tokens": 0, "output_tokens": 0})

    async def list_models(self, config, credential):
        return []


def _install_provider(monkeypatch, provider):
    monkeypatch.setitem(PROVIDERS, "ollama", provider)


def _config():
    return ProviderConfig(provider_id="ollama", model="test-model", base_url="")


@pytest.mark.asyncio
async def test_planner_finish_action_returns_the_message(monkeypatch):
    _install_provider(monkeypatch, _ScriptedProvider([
        json.dumps({"action": "finish", "message": "cannot represent that safely"}),
    ]))

    result = await planner_module.run_planner(
        session_id="sess_1", owner_id="user_a", instruction="do the impossible",
        provider_config=_config(), credential=None, max_planner_steps=6,
        operations=["camera.transform"], queries=["scene.summary"],
    )
    assert result.finished is True
    assert result.message == "cannot represent that safely"
    assert result.plan is None


@pytest.mark.asyncio
async def test_planner_query_action_dispatches_then_continues(monkeypatch):
    dispatched = []

    async def fake_dispatch(session_id, kind, payload):
        dispatched.append((session_id, kind, payload))
        return {"ok": True, "revision": 3, "type": payload.get("type")}

    monkeypatch.setattr(planner_module.BROKER, "dispatch", fake_dispatch)
    _install_provider(monkeypatch, _ScriptedProvider([
        json.dumps({"action": "query", "query": {"type": "scene.summary"}}),
        json.dumps({"action": "finish", "message": "done"}),
    ]))

    result = await planner_module.run_planner(
        session_id="sess_1", owner_id="user_a", instruction="what's in the scene?",
        provider_config=_config(), credential=None, max_planner_steps=6,
        operations=["camera.transform"], queries=["scene.summary"],
    )
    assert result.finished is True
    assert dispatched == [("sess_1", "query", {"type": "scene.summary"})]


@pytest.mark.asyncio
async def test_planner_transaction_action_creates_a_pending_plan(monkeypatch):
    dispatched = []

    async def fake_dispatch(session_id, kind, payload):
        dispatched.append((kind, payload))
        if kind == "query" and payload.get("type") == "health.get":
            return {"ok": True, "revision": 17}
        if kind == "transaction":
            assert payload["validateOnly"] is True
            assert payload["baseRevision"] == 17
            return {"ok": True, "revision": 17, "changes": [{"entity": "camera_1", "field": "position"}]}
        raise AssertionError(f"unexpected dispatch: {kind} {payload}")

    monkeypatch.setattr(planner_module.BROKER, "dispatch", fake_dispatch)
    _install_provider(monkeypatch, _ScriptedProvider([
        json.dumps({
            "action": "transaction",
            "transaction": {
                "description": "Lower the camera",
                "operations": [{"type": "camera.transform", "cameraId": "camera_1", "position": [0, 1, 2]}],
            },
        }),
    ]))

    result = await planner_module.run_planner(
        session_id="sess_1", owner_id="user_a", instruction="lower the camera",
        provider_config=_config(), credential=None, max_planner_steps=6,
        operations=["camera.transform"], queries=["scene.summary"],
    )
    assert result.finished is False
    assert result.plan is not None
    assert result.plan.base_revision == 17
    assert result.plan.transaction["operations"][0]["type"] == "camera.transform"
    assert result.plan.preview["changes"][0]["entity"] == "camera_1"


@pytest.mark.asyncio
async def test_planner_retries_after_a_rejected_preview(monkeypatch):
    calls = {"transaction": 0}

    async def fake_dispatch(session_id, kind, payload):
        if kind == "query":
            return {"ok": True, "revision": 5}
        calls["transaction"] += 1
        if calls["transaction"] == 1:
            return {"ok": False, "error": {"code": "UNKNOWN_CAMERA", "message": "no such camera"}}
        return {"ok": True, "revision": 5, "changes": []}

    monkeypatch.setattr(planner_module.BROKER, "dispatch", fake_dispatch)
    _install_provider(monkeypatch, _ScriptedProvider([
        json.dumps({
            "action": "transaction",
            "transaction": {"description": "x", "operations": [{"type": "camera.transform", "cameraId": "camera_404"}]},
        }),
        json.dumps({
            "action": "transaction",
            "transaction": {"description": "x", "operations": [{"type": "camera.transform", "cameraId": "camera_1"}]},
        }),
    ]))

    result = await planner_module.run_planner(
        session_id="sess_1", owner_id="user_a", instruction="move the camera",
        provider_config=_config(), credential=None, max_planner_steps=6,
        operations=["camera.transform"], queries=["scene.summary"],
    )
    assert result.finished is False
    assert result.plan is not None
    assert calls["transaction"] == 2


@pytest.mark.asyncio
async def test_planner_recovers_from_malformed_json_within_the_step_budget(monkeypatch):
    async def fake_dispatch(session_id, kind, payload):
        return {"ok": True, "revision": 0}

    monkeypatch.setattr(planner_module.BROKER, "dispatch", fake_dispatch)
    _install_provider(monkeypatch, _ScriptedProvider([
        "not valid json at all",
        json.dumps({"action": "finish", "message": "recovered"}),
    ]))

    result = await planner_module.run_planner(
        session_id="sess_1", owner_id="user_a", instruction="hi",
        provider_config=_config(), credential=None, max_planner_steps=6,
        operations=["camera.transform"], queries=["scene.summary"],
    )
    assert result.finished is True
    assert result.message == "recovered"


@pytest.mark.asyncio
async def test_planner_stops_after_the_bounded_step_budget(monkeypatch):
    async def fake_dispatch(session_id, kind, payload):
        return {"ok": True, "revision": 0, "type": payload.get("type")}

    monkeypatch.setattr(planner_module.BROKER, "dispatch", fake_dispatch)
    # The model always asks another query and never finishes or proposes --
    # the loop must still terminate at max_planner_steps.
    infinite_queries = [json.dumps({"action": "query", "query": {"type": "scene.summary"}})] * 10
    provider = _ScriptedProvider(infinite_queries)
    _install_provider(monkeypatch, provider)

    result = await planner_module.run_planner(
        session_id="sess_1", owner_id="user_a", instruction="keep going",
        provider_config=_config(), credential=None, max_planner_steps=3,
        operations=["camera.transform"], queries=["scene.summary"],
    )
    assert result.finished is True
    assert "step budget" in result.message
    assert len(provider.calls) == 3


@pytest.mark.asyncio
async def test_planner_never_lets_the_model_supply_baserevision_or_validateonly(monkeypatch):
    captured = {}

    async def fake_dispatch(session_id, kind, payload):
        if kind == "query":
            return {"ok": True, "revision": 42}
        captured.update(payload)
        return {"ok": True, "revision": 42, "changes": []}

    monkeypatch.setattr(planner_module.BROKER, "dispatch", fake_dispatch)
    _install_provider(monkeypatch, _ScriptedProvider([
        json.dumps({
            "action": "transaction",
            "transaction": {
                "description": "x",
                # A hostile model tries to sneak these in; they must not be
                # anywhere the planner reads a revision/validateOnly from --
                # the planner builds the envelope itself.
                "baseRevision": 999999,
                "validateOnly": False,
                "operations": [{"type": "camera.transform", "cameraId": "camera_1"}],
            },
        }),
    ]))

    result = await planner_module.run_planner(
        session_id="sess_1", owner_id="user_a", instruction="x",
        provider_config=_config(), credential=None, max_planner_steps=6,
        operations=["camera.transform"], queries=["scene.summary"],
    )
    assert captured["baseRevision"] == 42
    assert captured["validateOnly"] is True
    assert result.plan.base_revision == 42
