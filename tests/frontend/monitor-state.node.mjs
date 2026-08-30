import test from "node:test";
import assert from "node:assert/strict";
import { createMonitorState, reduceMonitorState } from "../../web-src/monitor/state.js";
import { MonitorRefreshController } from "../../web-src/monitor/refresh.js";
import { outputState } from "../../web-src/monitor/output-state.js";
import { renderHealth } from "../../web-src/monitor/health-view.js";
import { renderPreflight } from "../../web-src/monitor/preflight-view.js";

test("monitor state carries textual READY WARNING BLOCKED OUTDATED OFFLINE states", () => {
  let state = createMonitorState();
  assert.equal(state.status, "OFFLINE");
  state = reduceMonitorState(state, { type: "SOURCE_CHANGED" });
  assert.equal(state.status, "OUTDATED");
  state = reduceMonitorState(state, { type: "SNAPSHOT", snapshot: { preflight: { state: "WARNING" }, health: { state: "READY" }, fingerprint: "fp" } });
  assert.equal(state.status, "WARNING");
});

test("refresh calls only the lightweight snapshot endpoint", async () => {
  const calls = [];
  const api = { async fetchApi(path, options) { calls.push([path, options.method]); return { ok: true, async json() { return { fingerprint: "fp", health: { state: "READY" }, preflight: { state: "READY" } }; } }; } };
  const controller = new MonitorRefreshController(api);
  await controller.refresh({ track: {}, adapter: "h3", proxy_available: true, settings: {} });
  assert.deepEqual(calls, [["/majoor/omnicam/monitor/snapshot", "POST"]]);
  controller.dispose();
});

test("execution output is generated only for the current fingerprint", () => {
  assert.equal(outputState("fp", "fp"), "OUTPUT GENERATED");
  assert.equal(outputState("fp", "old"), "OUTPUT OUTDATED");
  assert.equal(outputState("fp", ""), "OUTPUT NOT EXECUTED");
});

test("health and preflight always render textual state labels", () => {
  const health = { innerHTML: "" }; const preflight = { innerHTML: "" };
  renderHealth(health, { state: "READY", metrics: [{ label: "Speed", value: 2, unit: "u/s", state: "warning" }] });
  renderPreflight(preflight, { state: "BLOCKED", adapter: "h3", checks: [{ label: "Proxy", state: "BLOCKED" }], issues: [{ severity: "error", message: "Proxy required" }] });
  assert.match(health.innerHTML, /READY/); assert.match(health.innerHTML, /WARNING/);
  assert.match(preflight.innerHTML, /BLOCKED/); assert.match(preflight.innerHTML, /Proxy required/);
});

test("live scheduling deduplicates an unchanged snapshot payload", async () => {
  let calls = 0; const api = { async fetchApi() { calls++; return { ok: true, async json() { return {}; } }; } };
  const controller = new MonitorRefreshController(api, { delay: 0 }); const payload = { track: { fps: 24 } };
  controller.schedule(payload); controller.schedule(payload); await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(calls, 1); controller.dispose();
});
