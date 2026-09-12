import test from "node:test";
import assert from "node:assert/strict";

import { createDirectorAgentBridge } from "../../web-src/agent/bridge.js";
import { AGENT_EVENT, AGENT_HEARTBEAT_INTERVAL_MS, AGENT_PROTOCOL, AGENT_ROUTES } from "../../web-src/agent/protocol.js";
import { DIRECTOR_OP_VALUES, DIRECTOR_QUERY_VALUES } from "../../web-src/director-api/constants.js";

function makeApi({ onFetch } = {}) {
  const listeners = new Map();
  return {
    clientId: "client_1",
    calls: [],
    addEventListener(event, handler) {
      (listeners.get(event) || listeners.set(event, new Set()).get(event)).add(handler);
    },
    removeEventListener(event, handler) {
      listeners.get(event)?.delete(handler);
    },
    dispatch(event, detail) {
      for (const handler of listeners.get(event) || []) handler({ type: event, detail });
    },
    listenerCount(event) {
      return listeners.get(event)?.size || 0;
    },
    async fetchApi(url, options) {
      const body = options?.body ? JSON.parse(options.body) : null;
      this.calls.push({ url, body });
      const response = await onFetch?.(url, body);
      return response ?? { ok: true, status: 200, json: async () => ({}) };
    },
  };
}

function makeUi(overrides = {}) {
  return {
    directorRevision: 0,
    directorApi: {
      query: () => ({ ok: true, version: 1, revision: 0, forwarded: "query" }),
      execute: (tx) => ({ ok: true, version: 1, revision: 0, applied: tx.operations.length }),
    },
    ...overrides,
  };
}

const node = { id: 42 };

async function flush() {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
}

test("register() sends the current client id and the real semantic vocabulary", async () => {
  const api = makeApi({
    async onFetch(url) {
      if (url === AGENT_ROUTES.register) return { ok: true, status: 200, json: async () => ({ session_id: "s1", session_token: "t1" }) };
      return { ok: true, status: 200, json: async () => ({}) };
    },
  });
  const ui = makeUi();
  const bridge = createDirectorAgentBridge(ui, node, api);
  await flush();

  const registerCall = api.calls.find((c) => c.url === AGENT_ROUTES.register);
  assert.ok(registerCall);
  assert.equal(registerCall.body.client_id, "client_1");
  assert.equal(registerCall.body.node_id, "42");
  assert.deepEqual(registerCall.body.operations, [...DIRECTOR_OP_VALUES]);
  assert.deepEqual(registerCall.body.queries, [...DIRECTOR_QUERY_VALUES]);
  assert.equal(bridge.sessionId, "s1");
  bridge.dispose();
});

async function registeredBridge(overrides = {}) {
  const api = makeApi({
    async onFetch(url) {
      if (url === AGENT_ROUTES.register) return { ok: true, status: 200, json: async () => ({ session_id: "s1", session_token: "t1" }) };
      return { ok: true, status: 200, json: async () => ({}) };
    },
  });
  const ui = makeUi(overrides);
  const bridge = createDirectorAgentBridge(ui, node, api);
  await flush();
  return { api, ui, bridge };
}

function baseDetail(overrides = {}) {
  return {
    protocol: AGENT_PROTOCOL,
    schema_version: 1,
    session_id: "s1",
    node_id: "42",
    request_id: "req_1",
    kind: "query",
    payload: { type: "scene.summary" },
    ...overrides,
  };
}

test("a request for a different session id is ignored", async () => {
  const { api, bridge } = await registeredBridge();
  api.dispatch(AGENT_EVENT, baseDetail({ session_id: "not-s1" }));
  await flush();
  assert.equal(api.calls.some((c) => c.url === AGENT_ROUTES.reply), false);
  bridge.dispose();
});

test("a request for a different node id is ignored", async () => {
  const { api, bridge } = await registeredBridge();
  api.dispatch(AGENT_EVENT, baseDetail({ node_id: "999" }));
  await flush();
  assert.equal(api.calls.some((c) => c.url === AGENT_ROUTES.reply), false);
  bridge.dispose();
});

test("a query request is forwarded to ui.directorApi.query and replied", async () => {
  const { api, bridge } = await registeredBridge();
  api.dispatch(AGENT_EVENT, baseDetail());
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.ok(reply);
  assert.equal(reply.body.session_id, "s1");
  assert.equal(reply.body.request_id, "req_1");
  assert.equal(reply.body.result.forwarded, "query");
  bridge.dispose();
});

test("a transaction request is forwarded to ui.directorApi.execute", async () => {
  const { api, bridge } = await registeredBridge();
  api.dispatch(
    AGENT_EVENT,
    baseDetail({ kind: "transaction", payload: { baseRevision: 0, operations: [{ type: "x" }] } }),
  );
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.result.applied, 1);
  bridge.dispose();
});

test("a transaction missing baseRevision is rejected before reaching directorApi.execute", async () => {
  let executed = false;
  const { api, bridge } = await registeredBridge({
    directorApi: {
      query: () => ({}),
      execute: () => {
        executed = true;
        return { ok: true };
      },
    },
  });
  api.dispatch(AGENT_EVENT, baseDetail({ kind: "transaction", payload: { operations: [] } }));
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.result.ok, false);
  assert.equal(reply.body.result.error.code, "BASE_REVISION_REQUIRED");
  assert.equal(executed, false);
  bridge.dispose();
});

test("the reply carries the session token", async () => {
  const { api, bridge } = await registeredBridge();
  api.dispatch(AGENT_EVENT, baseDetail());
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.session_token, "t1");
  bridge.dispose();
});

test("a heartbeat tick includes the latest directorRevision", async (t) => {
  t.mock.timers.enable({ apis: ["setInterval"] });
  const { api, ui, bridge } = await registeredBridge();
  ui.directorRevision = 5;
  t.mock.timers.tick(AGENT_HEARTBEAT_INTERVAL_MS);
  await flush();
  const heartbeat = api.calls.find((c) => c.url === AGENT_ROUTES.heartbeat);
  assert.ok(heartbeat);
  assert.equal(heartbeat.body.revision, 5);
  bridge.dispose();
});

test("dispose removes both listeners and clears the heartbeat timer", async () => {
  const { api, bridge } = await registeredBridge();
  assert.equal(api.listenerCount(AGENT_EVENT), 1);
  assert.equal(api.listenerCount("status"), 1);
  bridge.dispose();
  assert.equal(api.listenerCount(AGENT_EVENT), 0);
  assert.equal(api.listenerCount("status"), 0);
});

test("dispose posts session/close with the held token", async () => {
  const { api, bridge } = await registeredBridge();
  bridge.dispose();
  await flush();
  const close = api.calls.find((c) => c.url === AGENT_ROUTES.close);
  assert.ok(close);
  assert.equal(close.body.session_id, "s1");
  assert.equal(close.body.session_token, "t1");
});

test("a client id change re-registers under the new id", async () => {
  const { api, bridge } = await registeredBridge();
  api.clientId = "client_2";
  api.dispatch("status", {});
  await flush();
  const registrations = api.calls.filter((c) => c.url === AGENT_ROUTES.register);
  assert.equal(registrations.length, 2);
  assert.equal(registrations[1].body.client_id, "client_2");
  bridge.dispose();
});
