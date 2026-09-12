import test from "node:test";
import assert from "node:assert/strict";

import { createDirectorAgentBridge, EXTERNAL_AGENT_OPERATIONS } from "../../web-src/agent/bridge.js";
import { AGENT_EVENT, AGENT_HEARTBEAT_INTERVAL_MS, AGENT_PROTOCOL, AGENT_ROUTES } from "../../web-src/agent/protocol.js";
import { DIRECTOR_QUERY_VALUES } from "../../web-src/director-api/constants.js";

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
  assert.deepEqual(registerCall.body.operations, [...EXTERNAL_AGENT_OPERATIONS]);
  assert.equal(registerCall.body.operations.includes("asset.instantiate"), false);
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
    baseDetail({ kind: "transaction", payload: { baseRevision: 0, operations: [{ type: "camera.set_active", cameraId: "camera_1" }] } }),
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

test("a transaction using asset.instantiate is rejected before reaching directorApi.execute", async () => {
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
  api.dispatch(
    AGENT_EVENT,
    baseDetail({
      kind: "transaction",
      payload: { baseRevision: 0, operations: [{ type: "asset.instantiate", asset: { id: "a", kind: "mesh" } }] },
    }),
  );
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.result.ok, false);
  assert.equal(reply.body.result.error.code, "OPERATION_NOT_ADVERTISED");
  assert.equal(executed, false);
  bridge.dispose();
});

function makeFakeStore(items) {
  const state = { items, byId: new Map(items.map((item) => [item.id, item])) };
  return {
    state,
    filterCalls: [],
    get(id) { return state.byId.get(id) || null; },
    async setFilter(filter) {
      this.filterCalls.push(filter);
      // The tests below only exercise ids already "loaded"; a real store
      // would refetch here, but that path is covered by the
      // ASSET_CATALOG_UNAVAILABLE / UNKNOWN_ASSET cases instead.
    },
  };
}

const CHARACTER_ROW = {
  id: "omnicam.character.ual2_standard",
  name: "UAL2_Standard",
  kind: "character",
  source: "user",
  file: "characters/ual2_standard.glb",
  tags: ["human", "character"],
  rig: { profile: "omnicam_humanoid_v1", bone_map: { root: "root" } },
  animations: [{ id: "farm-harvest", name: "Farm_Harvest", clip: "Farm_Harvest" }],
};

// catalog.default.json ships "Human Neutral/Male/Female 01" purely to
// illustrate a fully-mapped rig row's shape (docs/CHARACTERS.md: "never
// trusted for a downloaded file"); they have no backing GLB. source:
// "default" is what tells them apart from a real, bootstrap-installed row
// (which always carries source: "user").
const ILLUSTRATIVE_ROW = {
  id: "omnicam.character.human_neutral_01",
  name: "Human Neutral 01",
  kind: "character",
  source: "default",
  file: "characters/human_neutral_01.glb",
  tags: ["human", "adult", "neutral"],
  rig: { profile: "omnicam_humanoid_v1", bone_map: { root: "Hips" } },
  animations: [{ id: "idle", name: "Idle", clip: "Idle" }],
};

test("asset.instantiate_by_id resolves the trusted catalogue row and instantiates it", async () => {
  let executedTx = null;
  const store = makeFakeStore([CHARACTER_ROW]);
  const { api, bridge } = await registeredBridge({
    assetBrowser: { store },
    directorApi: {
      query: () => ({}),
      execute: (tx) => { executedTx = tx; return { ok: true, outcomes: [{ objectId: "character_man1" }] }; },
    },
  });
  api.dispatch(
    AGENT_EVENT,
    baseDetail({
      kind: "transaction",
      payload: {
        baseRevision: 0,
        operations: [{ type: "asset.instantiate_by_id", assetId: "omnicam.character.ual2_standard", id: "man1", point: [0, 0, 0] }],
      },
    }),
  );
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.result.ok, true);
  // The Agent never sees the resolved asset -- it only reaches directorApi.execute.
  assert.equal(executedTx.operations[0].type, "asset.instantiate");
  assert.deepEqual(executedTx.operations[0].asset, CHARACTER_ROW);
  assert.equal(executedTx.operations[0].id, "man1");
  bridge.dispose();
});

test("asset.instantiate_by_id with an unknown assetId never reaches directorApi.execute", async () => {
  let executed = false;
  const store = makeFakeStore([CHARACTER_ROW]);
  const { api, bridge } = await registeredBridge({
    assetBrowser: { store },
    directorApi: { query: () => ({}), execute: () => { executed = true; return { ok: true }; } },
  });
  api.dispatch(
    AGENT_EVENT,
    baseDetail({
      kind: "transaction",
      payload: { baseRevision: 0, operations: [{ type: "asset.instantiate_by_id", assetId: "not.a.real.asset" }] },
    }),
  );
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.result.ok, false);
  assert.equal(reply.body.result.error.code, "UNKNOWN_ASSET");
  assert.equal(executed, false);
  bridge.dispose();
});

test("asset.instantiate_by_id fails cleanly when the Asset Browser never mounted", async () => {
  const { api, bridge } = await registeredBridge({
    directorApi: { query: () => ({}), execute: () => ({ ok: true }) },
  });
  api.dispatch(
    AGENT_EVENT,
    baseDetail({
      kind: "transaction",
      payload: { baseRevision: 0, operations: [{ type: "asset.instantiate_by_id", assetId: "omnicam.character.ual2_standard" }] },
    }),
  );
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.result.ok, false);
  assert.equal(reply.body.result.error.code, "ASSET_CATALOG_UNAVAILABLE");
  bridge.dispose();
});

test("asset.catalog_search returns a safe summary, never the raw AssetDefinition", async () => {
  const store = makeFakeStore([CHARACTER_ROW]);
  const { api, bridge } = await registeredBridge({ assetBrowser: { store } });
  api.dispatch(
    AGENT_EVENT,
    baseDetail({ kind: "query", payload: { type: "asset.catalog_search", kind: "character", search: "ual2" } }),
  );
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.result.items.length, 1);
  const [item] = reply.body.result.items;
  assert.equal(item.id, "omnicam.character.ual2_standard");
  assert.deepEqual(item.animations, [{ id: "farm-harvest", name: "Farm_Harvest", clip: "Farm_Harvest" }]);
  // Never the trusted-only fields: file path, rig bone map.
  assert.equal("file" in item, false);
  assert.equal("rig" in item, false);
  assert.deepEqual(store.filterCalls[0], { kind: "character", search: "ual2" });
  bridge.dispose();
});

test("asset.catalog_search never surfaces an illustrative, file-less default character row", async () => {
  const store = makeFakeStore([ILLUSTRATIVE_ROW, CHARACTER_ROW]);
  const { api, bridge } = await registeredBridge({ assetBrowser: { store } });
  api.dispatch(
    AGENT_EVENT,
    baseDetail({ kind: "query", payload: { type: "asset.catalog_search", kind: "character", search: "" } }),
  );
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.deepEqual(reply.body.result.items.map((item) => item.id), ["omnicam.character.ual2_standard"]);
  bridge.dispose();
});

test("asset.instantiate_by_id refuses an illustrative, file-less default character row", async () => {
  let executed = false;
  const store = makeFakeStore([ILLUSTRATIVE_ROW]);
  const { api, bridge } = await registeredBridge({
    assetBrowser: { store },
    directorApi: { query: () => ({}), execute: () => { executed = true; return { ok: true }; } },
  });
  api.dispatch(
    AGENT_EVENT,
    baseDetail({
      kind: "transaction",
      payload: {
        baseRevision: 0,
        operations: [{ type: "asset.instantiate_by_id", assetId: "omnicam.character.human_neutral_01", id: "man1" }],
      },
    }),
  );
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.result.ok, false);
  assert.equal(reply.body.result.error.code, "UNKNOWN_ASSET");
  assert.equal(executed, false);
  bridge.dispose();
});

test("asset.catalog_search fails cleanly when the Asset Browser never mounted", async () => {
  const { api, bridge } = await registeredBridge();
  api.dispatch(AGENT_EVENT, baseDetail({ kind: "query", payload: { type: "asset.catalog_search" } }));
  await flush();
  const reply = api.calls.find((c) => c.url === AGENT_ROUTES.reply);
  assert.equal(reply.body.result.ok, false);
  assert.equal(reply.body.result.error.code, "ASSET_CATALOG_UNAVAILABLE");
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

test("a client id change closes the old session before re-registering", async () => {
  const { api, bridge } = await registeredBridge();
  api.clientId = "client_2";
  api.dispatch("status", {});
  await flush();
  const close = api.calls.find((c) => c.url === AGENT_ROUTES.close);
  assert.ok(close);
  assert.equal(close.body.session_id, "s1");
  assert.equal(close.body.session_token, "t1");
  const closeIndex = api.calls.indexOf(close);
  const secondRegisterIndex = api.calls.findIndex(
    (c, i) => c.url === AGENT_ROUTES.register && i > 0,
  );
  assert.ok(closeIndex < secondRegisterIndex);
  bridge.dispose();
});

test("a failed close of the old session still allows re-registration", async () => {
  const api = makeApi({
    async onFetch(url) {
      if (url === AGENT_ROUTES.register) return { ok: true, status: 200, json: async () => ({ session_id: "s1", session_token: "t1" }) };
      if (url === AGENT_ROUTES.close) return { ok: false, status: 500, json: async () => ({ error: { code: "INTERNAL" } }) };
      return { ok: true, status: 200, json: async () => ({}) };
    },
  });
  const ui = makeUi();
  const bridge = createDirectorAgentBridge(ui, node, api);
  await flush();
  api.clientId = "client_2";
  api.dispatch("status", {});
  await flush();
  const registrations = api.calls.filter((c) => c.url === AGENT_ROUTES.register);
  assert.equal(registrations.length, 2);
  bridge.dispose();
});
