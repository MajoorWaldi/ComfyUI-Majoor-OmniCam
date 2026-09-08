import assert from "node:assert/strict";
import test from "node:test";

import {
  MONITOR_PREFLIGHT_EVENT,
  MONITOR_PREFLIGHT_EVENT_VERSION,
  bindMonitorPreflightEvents,
} from "../../web-src/monitor/preflight-events.js";

function fakeApi() {
  const listeners = new Map();
  return {
    addEventListener(name, handler) {
      const bucket = listeners.get(name) || new Set();
      bucket.add(handler);
      listeners.set(name, bucket);
    },
    removeEventListener(name, handler) {
      listeners.get(name)?.delete(handler);
    },
    dispatch(name, detail) {
      for (const handler of listeners.get(name) || []) handler({ detail });
    },
    listenerCount(name) {
      return listeners.get(name)?.size || 0;
    },
  };
}

function payload(node, extra = {}) {
  return {
    schema_version: MONITOR_PREFLIGHT_EVENT_VERSION,
    kind: "blocked_preflight",
    node,
    output: { preflight: [{ id: "downstream_contract", state: "BLOCKED" }] },
    ...extra,
  };
}

test("matching node id renders blocked preflight", () => {
  const api = fakeApi();
  const calls = [];
  const ui = { disposed: false, blockedPreflight(message) { calls.push(message); } };

  bindMonitorPreflightEvents(api, { id: 4 }, ui);
  api.dispatch(MONITOR_PREFLIGHT_EVENT, payload("4"));

  assert.equal(calls.length, 1);
  assert.equal(calls[0].preflight[0].state, "BLOCKED");
});

test("non-matching or incompatible preflight messages are ignored", () => {
  const api = fakeApi();
  const calls = [];
  const ui = { disposed: false, blockedPreflight(message) { calls.push(message); } };

  bindMonitorPreflightEvents(api, { id: 4 }, ui);
  api.dispatch(MONITOR_PREFLIGHT_EVENT, payload("5"));
  api.dispatch(MONITOR_PREFLIGHT_EVENT, payload("4", { schema_version: 999 }));
  api.dispatch(MONITOR_PREFLIGHT_EVENT, payload("4", { kind: "other" }));
  api.dispatch(MONITOR_PREFLIGHT_EVENT, { ...payload("4"), output: null });

  assert.equal(calls.length, 0);
});

test("listener is removed on dispose", () => {
  const api = fakeApi();
  const calls = [];
  const ui = { disposed: false, blockedPreflight(message) { calls.push(message); } };

  const dispose = bindMonitorPreflightEvents(api, { id: 4 }, ui);
  assert.equal(api.listenerCount(MONITOR_PREFLIGHT_EVENT), 1);
  dispose();
  assert.equal(api.listenerCount(MONITOR_PREFLIGHT_EVENT), 0);

  api.dispatch(MONITOR_PREFLIGHT_EVENT, payload("4"));
  assert.equal(calls.length, 0);
});

test("multiple Monitor nodes only react to their own ids", () => {
  const api = fakeApi();
  const left = [];
  const right = [];

  bindMonitorPreflightEvents(api, { id: 4 }, { disposed: false, blockedPreflight(message) { left.push(message); } });
  bindMonitorPreflightEvents(api, { id: 7 }, { disposed: false, blockedPreflight(message) { right.push(message); } });

  api.dispatch(MONITOR_PREFLIGHT_EVENT, payload("7"));

  assert.equal(left.length, 0);
  assert.equal(right.length, 1);
});

test("custom event binding does not replace normal onExecuted handling", () => {
  const api = fakeApi();
  let executed = 0;
  const node = { id: 4, onExecuted() { executed += 1; } };
  const ui = { disposed: false, blockedPreflight() {} };

  bindMonitorPreflightEvents(api, node, ui);
  node.onExecuted({});

  assert.equal(executed, 1);
});

test("backend error event does not clear a blocked preflight panel", () => {
  const api = fakeApi();
  const calls = [];
  const ui = { disposed: false, blockedPreflight(message) { calls.push(message); } };

  bindMonitorPreflightEvents(api, { id: 4 }, ui);
  api.dispatch(MONITOR_PREFLIGHT_EVENT, payload("4"));
  api.dispatch("execution_error", { node_id: 4 });

  assert.equal(calls.length, 1);
});

test("disposed UI ignores otherwise matching events", () => {
  const api = fakeApi();
  const calls = [];
  const ui = { disposed: true, blockedPreflight(message) { calls.push(message); } };

  bindMonitorPreflightEvents(api, { id: 4 }, ui);
  api.dispatch(MONITOR_PREFLIGHT_EVENT, payload("4"));

  assert.equal(calls.length, 0);
});
