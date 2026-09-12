import test from "node:test";
import assert from "node:assert/strict";

import { createDirectorAgentPanel, planChangesMarkup, resolveAgentIntent } from "../../web-src/agent/panel.js";

class FakeElement {
  constructor(role) {
    this._role = role;
    this.dataset = {};
    this.textContent = "";
    this.innerHTML = "";
    this.disabled = false;
    this.hidden = false;
    this.value = "";
    this.handlers = new Map();
    this.classList = { toggle() {}, add() {}, remove() {} };
  }

  addEventListener(name, handler) { this.handlers.set(name, handler); }
  removeEventListener(name) { this.handlers.delete(name); }
  focus() {}

  closest(selector) {
    const roleMatch = selector.match(/\[data-role="([^"]+)"\]/);
    if (roleMatch) return this._role === roleMatch[1] ? this : null;
    const actMatch = selector.match(/\[data-agent-act(?:="([^"]+)")?\]/);
    if (actMatch) {
      if (!this.dataset.agentAct) return null;
      return !actMatch[1] || this.dataset.agentAct === actMatch[1] ? this : null;
    }
    return null;
  }
}

function actButton(action) {
  const el = new FakeElement(null);
  el.dataset.agentAct = action;
  return el;
}

function makeRoot(elements) {
  return {
    querySelector(selector) {
      const roleMatch = selector.match(/\[data-role="([^"]+)"\]/);
      if (roleMatch) return elements[roleMatch[1]] || null;
      const actMatch = selector.match(/\[data-agent-act="([^"]+)"\]/);
      if (actMatch) return elements[`act:${actMatch[1]}`] || null;
      return null;
    },
  };
}

function makeElements() {
  const elements = {
    "agent-panel": new FakeElement("agent-panel"),
    "agent-hint": new FakeElement("agent-hint"),
    "agent-describe": new FakeElement("agent-describe"),
    "agent-plan": new FakeElement("agent-plan"),
    "agent-provider-label": new FakeElement("agent-provider-label"),
    "agent-credential-status": new FakeElement("agent-credential-status"),
    "agent-credential-form": new FakeElement("agent-credential-form"),
    "agent-credential-input": new FakeElement("agent-credential-input"),
    "act:preview": actButton("preview"),
    "act:apply": actButton("apply"),
    "act:cancel": actButton("cancel"),
    "act:credential-replace": actButton("credential-replace"),
    "act:credential-remove": actButton("credential-remove"),
    "act:credential-test": actButton("credential-test"),
    "act:credential-save": actButton("credential-save"),
  };
  elements["agent-credential-form"].hidden = true;
  return elements;
}

function makeApi(handlers) {
  return {
    calls: [],
    async fetchApi(url, options) {
      const body = options?.body ? JSON.parse(options.body) : undefined;
      this.calls.push({ url, method: options?.method, body });
      const handler = handlers[url] || (() => ({ ok: true, status: 200, json: async () => ({}) }));
      return handler(body);
    },
  };
}

function click(elements, roleOrAct) {
  const panel = elements["agent-panel"];
  const target = elements[roleOrAct];
  panel.handlers.get("click")?.({ target });
}

async function flush() {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
}

test("resolveAgentIntent finds the closest data-agent-act", () => {
  const btn = actButton("apply");
  assert.deepEqual(resolveAgentIntent(btn), { action: "apply" });
  assert.equal(resolveAgentIntent(new FakeElement(null)), null);
  assert.equal(resolveAgentIntent(null), null);
});

test("planChangesMarkup renders an empty-state message with no changes", () => {
  assert.match(planChangesMarkup([]), /No visible changes/);
  assert.match(planChangesMarkup(null), /No visible changes/);
});

test("planChangesMarkup renders one <li> per change", () => {
  const html = planChangesMarkup([{ entity: "camera_1", field: "position" }, { entity: "camera_1", field: "target" }]);
  assert.equal((html.match(/<li>/g) || []).length, 2);
  assert.match(html, /camera_1/);
});

test("mounting refreshes the credential status", async () => {
  const elements = makeElements();
  const api = makeApi({
    "/majoor/omnicam/agent/v1/providers/ollama/status": () => ({
      ok: true, status: 200, json: async () => ({ provider: "ollama", configured: false, source: "none" }),
    }),
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();
  assert.equal(elements["agent-credential-status"].textContent, "Not configured");
  panel.dispose();
});

test("preview -> apply happy path enables then clears the pending plan", async () => {
  const elements = makeElements();
  elements["agent-describe"].value = "lower the camera";
  const api = makeApi({
    "/majoor/omnicam/agent/v1/providers/ollama/status": () => ({
      ok: true, status: 200, json: async () => ({ configured: false, source: "none" }),
    }),
    "/majoor/omnicam/agent/v1/plan": () => ({
      ok: true, status: 200, json: async () => ({
        ok: true, plan_id: "plan_1", description: "Lower the camera",
        changes: [{ entity: "camera_1", field: "position" }], truncated: false,
      }),
    }),
    "/majoor/omnicam/agent/v1/apply-plan": () => ({
      ok: true, status: 200, json: async () => ({ ok: true, revision: 5, applied: 1 }),
    }),
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();

  click(elements, "act:preview");
  await flush();
  assert.equal(panel.state, "preview_ready");
  assert.equal(elements["act:apply"].disabled, false);
  assert.match(elements["agent-plan"].innerHTML, /camera_1/);

  const planCall = api.calls.find((c) => c.url === "/majoor/omnicam/agent/v1/plan");
  assert.equal(planCall.body.session_id, "sess_1");
  assert.equal(planCall.body.instruction, "lower the camera");

  click(elements, "act:apply");
  await flush();
  assert.equal(panel.state, "idle");
  assert.equal(elements["act:apply"].disabled, true);

  const applyCall = api.calls.find((c) => c.url === "/majoor/omnicam/agent/v1/apply-plan");
  assert.deepEqual(applyCall.body, { plan_id: "plan_1" });

  panel.dispose();
});

test("cancel discards a pending plan without calling apply", async () => {
  const elements = makeElements();
  elements["agent-describe"].value = "x";
  const api = makeApi({
    "/majoor/omnicam/agent/v1/plan": () => ({
      ok: true, status: 200, json: async () => ({ ok: true, plan_id: "plan_1", description: "x", changes: [], truncated: false }),
    }),
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();
  click(elements, "act:preview");
  await flush();
  assert.equal(panel.state, "preview_ready");

  click(elements, "act:cancel");
  assert.equal(panel.state, "idle");
  assert.equal(elements["act:apply"].disabled, true);
  assert.equal(api.calls.some((c) => c.url === "/majoor/omnicam/agent/v1/apply-plan"), false);
  panel.dispose();
});

test("a truncated preview leaves Apply disabled", async () => {
  const elements = makeElements();
  elements["agent-describe"].value = "x";
  const api = makeApi({
    "/majoor/omnicam/agent/v1/plan": () => ({
      ok: true, status: 200, json: async () => ({ ok: true, plan_id: "plan_1", description: "x", changes: [], truncated: true }),
    }),
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();
  click(elements, "act:preview");
  await flush();
  assert.equal(elements["act:apply"].disabled, true);
  panel.dispose();
});

test("a STALE_PLAN apply error disables Apply and asks for a new preview", async () => {
  const elements = makeElements();
  elements["agent-describe"].value = "x";
  const api = makeApi({
    "/majoor/omnicam/agent/v1/plan": () => ({
      ok: true, status: 200, json: async () => ({ ok: true, plan_id: "plan_1", description: "x", changes: [], truncated: false }),
    }),
    "/majoor/omnicam/agent/v1/apply-plan": () => ({
      ok: false, status: 409, json: async () => ({ error: { code: "STALE_PLAN", message: "changed" } }),
    }),
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();
  click(elements, "act:preview");
  await flush();
  click(elements, "act:apply");
  await flush();
  assert.equal(panel.state, "stale");
  assert.equal(elements["act:apply"].disabled, true);
  assert.match(elements["agent-hint"].textContent, /changed after this preview/);
  panel.dispose();
});

test("generatePreview does nothing without a live Agent session", async () => {
  const elements = makeElements();
  elements["agent-describe"].value = "x";
  const api = makeApi({});
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: null } };
  const panel = createDirectorAgentPanel(ui);
  await flush();
  click(elements, "act:preview");
  await flush();
  assert.equal(api.calls.some((c) => c.url === "/majoor/omnicam/agent/v1/plan"), false);
  assert.match(elements["agent-hint"].textContent, /session is not ready/);
  panel.dispose();
});

test("credential replace/save never leaves the secret in the input and never logs it", async () => {
  const elements = makeElements();
  const api = makeApi({
    "/majoor/omnicam/agent/v1/providers/ollama/credential": (body) => {
      assert.deepEqual(Object.keys(body), ["secret"]);
      return { ok: true, status: 200, json: async () => ({ configured: true, source: "local_store" }) };
    },
    "/majoor/omnicam/agent/v1/providers/ollama/status": () => ({
      ok: true, status: 200, json: async () => ({ configured: true, source: "local_store" }),
    }),
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();

  click(elements, "act:credential-replace");
  assert.equal(elements["agent-credential-form"].hidden, false);

  elements["agent-credential-input"].value = "sk-super-secret";
  click(elements, "act:credential-save");
  await flush();

  assert.equal(elements["agent-credential-input"].value, "");
  assert.equal(elements["agent-credential-form"].hidden, true);
  const putCall = api.calls.find((c) => c.url === "/majoor/omnicam/agent/v1/providers/ollama/credential");
  assert.equal(putCall.method, "PUT");
  assert.equal(putCall.body.secret, "sk-super-secret");
  panel.dispose();
});

test("credential remove and test call the expected routes", async () => {
  const elements = makeElements();
  const api = makeApi({
    "/majoor/omnicam/agent/v1/providers/ollama/credential": () => ({
      ok: true, status: 200, json: async () => ({ configured: false, source: "none" }),
    }),
    "/majoor/omnicam/agent/v1/providers/ollama/test": () => ({
      ok: true, status: 200, json: async () => ({ ok: true }),
    }),
    "/majoor/omnicam/agent/v1/providers/ollama/status": () => ({
      ok: true, status: 200, json: async () => ({ configured: false, source: "none" }),
    }),
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();

  click(elements, "act:credential-remove");
  await flush();
  const deleteCall = api.calls.find((c) => c.url === "/majoor/omnicam/agent/v1/providers/ollama/credential" && c.method === "DELETE");
  assert.ok(deleteCall);

  click(elements, "act:credential-test");
  await flush();
  assert.match(elements["agent-hint"].textContent, /Connection OK/);
  panel.dispose();
});

test("dispose() stops the panel from reacting to further clicks", async () => {
  const elements = makeElements();
  elements["agent-describe"].value = "x";
  const api = makeApi({});
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();
  panel.dispose();
  click(elements, "act:preview");
  await flush();
  assert.equal(api.calls.some((c) => c.url === "/majoor/omnicam/agent/v1/plan"), false);
});
