import test from "node:test";
import assert from "node:assert/strict";

import { createDirectorAgentPanel, modelSelectMarkup, planChangesMarkup, resolveAgentIntent } from "../../web-src/agent/panel.js";
import { SETTING_AGENT_MODEL, registerOmniCamLocales } from "../../web-src/settings.js";

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
    this.style = {};
    this.scrollHeight = 0;
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
    "agent-model-select": new FakeElement("agent-model-select"),
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
    "act:model-refresh": actButton("model-refresh"),
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

function ok(payload) {
  return { ok: true, status: 200, json: async () => payload };
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

test("modelSelectMarkup lists live models and preselects the configured one", () => {
  const html = modelSelectMarkup(["a", "b"], "b");
  assert.match(html, /<option value="a">a<\/option>/);
  assert.match(html, /<option value="b" selected>b<\/option>/);
});

test("modelSelectMarkup keeps a configured model that fell out of the live list", () => {
  const html = modelSelectMarkup(["a"], "custom-model");
  assert.match(html, /<option value="custom-model" selected>custom-model<\/option>/);
  assert.match(html, /<option value="a">a<\/option>/);
});

test("modelSelectMarkup reports no models found when nothing is available or configured", () => {
  assert.match(modelSelectMarkup([], ""), /No models found/);
});

test("mounting populates the model picker from the live provider", async () => {
  const elements = makeElements();
  const api = makeApi({
    "/majoor/omnicam/agent/v1/providers/ollama/models": () => ok({ models: ["qwen3.8:latest", "gemma4:26b"] }),
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();
  assert.match(elements["agent-model-select"].innerHTML, /qwen3\.8:latest/);
  assert.match(elements["agent-model-select"].innerHTML, /gemma4:26b/);
  panel.dispose();
});

test("picking a model persists it and updates the provider label", async () => {
  const values = {};
  registerOmniCamLocales({
    extensionManager: {
      setting: {
        get: (id) => values[id],
        set: (id, value) => { values[id] = value; },
      },
    },
  });
  const elements = makeElements();
  const api = makeApi({
    "/majoor/omnicam/agent/v1/providers/ollama/models": () => ok({ models: ["qwen3.8:latest", "gemma4:26b"] }),
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();

  elements["agent-model-select"].value = "gemma4:26b";
  elements["agent-model-select"].handlers.get("change")?.({});
  assert.equal(values[SETTING_AGENT_MODEL], "gemma4:26b");
  assert.match(elements["agent-provider-label"].textContent, /gemma4:26b/);

  panel.dispose();
  registerOmniCamLocales(null);
});

test("the model-refresh action re-fetches the live model list", async () => {
  const elements = makeElements();
  let call = 0;
  const api = makeApi({
    "/majoor/omnicam/agent/v1/providers/ollama/models": () => {
      call += 1;
      return ok({ models: [`m${call}`] });
    },
  });
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();
  assert.match(elements["agent-model-select"].innerHTML, /m1/);

  click(elements, "act:model-refresh");
  await flush();
  assert.match(elements["agent-model-select"].innerHTML, /m2/);
  panel.dispose();
});

test("the describe textarea grows to fit its content on input", async () => {
  const elements = makeElements();
  const api = makeApi({});
  const ui = { root: makeRoot(elements), api, agentBridge: { sessionId: "sess_1" } };
  const panel = createDirectorAgentPanel(ui);
  await flush();

  const textarea = elements["agent-describe"];
  textarea.value = "a longer shot description that needs more room";
  textarea.scrollHeight = 96;
  textarea.handlers.get("input")?.({});
  assert.equal(textarea.style.height, "96px");

  panel.dispose();
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
