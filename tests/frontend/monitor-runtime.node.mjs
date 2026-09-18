import test from "node:test";
import assert from "node:assert/strict";
import { MonitorRuntime } from "../../web-src/monitor/runtime.js";
import { hideMonitorParameters } from "../../web-src/monitor/widget-contract.js";
import { MONITOR_PREFLIGHT_EVENT } from "../../web-src/monitor/preflight-events.js";

const result = {
  target_profile: ["external_reference_video"],
  capabilities: [{capabilities: []}],
  preflight: [{id: "audit", label: "Test", state: "PASS"}],
};

test("closed Monitor keeps results and restores them on every open", () => {
  const runtime = new MonitorRuntime({id: 1}, new EventTarget());
  runtime.receive(result);
  const received = [];
  runtime.restore({executed: value => received.push(value)});
  runtime.restore({executed: value => received.push(value)});
  assert.deepEqual(received, [result, result]);
  runtime.dispose();
});

test("blocked preflights arrive while closed, and listeners stop on disposal", () => {
  const api = new EventTarget();
  const runtime = new MonitorRuntime({id: 1}, api);
  const dispatch = () => {
    const event = new Event(MONITOR_PREFLIGHT_EVENT);
    event.detail = {schema_version: 1, kind: "blocked_preflight", node: "1", output: result};
    api.dispatchEvent(event);
  };
  dispatch();
  let restored;
  runtime.restore({blockedPreflight: value => {restored = value;}});
  assert.deepEqual(restored, result);
  runtime.dispose();
  dispatch();
  assert.equal(runtime.result, null);
});

test("hiding Monitor parameters preserves its shell and third-party widgets", () => {
  const parameter = {name: "target_profile"};
  const shell = {name: "majoor_omnicam_monitor_shell"};
  const other = {name: "other_extension"};
  hideMonitorParameters({widgets: [parameter, shell, other]});
  assert.equal(parameter.hidden, true);
  assert.equal(shell.hidden, undefined);
  assert.equal(other.hidden, undefined);
});
