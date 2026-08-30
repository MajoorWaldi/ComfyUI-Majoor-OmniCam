import test from "node:test";
import assert from "node:assert/strict";
import { previewBadge, renderPreview } from "../../web-src/monitor/preview.js";
import { renderHealth } from "../../web-src/monitor/health-view.js";
import { renderPreflight } from "../../web-src/monitor/preflight-view.js";
import { renderAdapterDetails } from "../../web-src/monitor/adapter-view.js";

test("preview badges never misrepresent diagnostics as exact output", () => {
  assert.equal(previewBadge({ exact_output_representation: true }), "OUTPUT PREVIEW");
  assert.equal(previewBadge({ exact_output_representation: false }), "DIAGNOSTIC");
});

test("H3 reuses the proxy monitor instead of creating another video", () => {
  const container = { innerHTML: "", querySelectorAll() { return []; } };
  renderPreview(container, { kind: "proxy_video", exact_output_representation: true, label: "H3", payload: {} });
  assert.doesNotMatch(container.innerHTML, /<video/i);
  assert.match(container.innerHTML, /Proxy Monitor/);
});

test("ATI, Wan Native and LTX previews keep their precise semantics", () => {
  const container = { innerHTML: "", querySelector() { return null; }, querySelectorAll() { return []; } };
  renderPreview(container, { kind: "trajectory_overlay", exact_output_representation: true, label: "ATI", payload: { tracks: [[{ x: 1, y: 2 }]] } });
  assert.match(container.innerHTML, /OUTPUT PREVIEW/); assert.match(container.innerHTML, /canvas/);
  renderPreview(container, { kind: "camera_path", exact_output_representation: false, label: "Wan Native", payload: { points: [1], valid_4n_plus_1: false } });
  assert.match(container.innerHTML, /DIAGNOSTIC/); assert.match(container.innerHTML, /requires 4n\+1/);
  renderPreview(container, { kind: "frame_sequence", exact_output_representation: true, label: "LTX", payload: { indices: [0, 8, 16] } });
  assert.match(container.innerHTML, />8</);
});

test("monitor diagnostic text cannot inject markup", () => {
  const container = { innerHTML: "" };
  const attack = '<img src=x onerror="globalThis.pwned=1">';

  renderHealth(container, { state: "WARNING", metrics: [{ label: attack, value: attack, state: "warning" }] });
  assert.doesNotMatch(container.innerHTML, /<img/i);
  assert.match(container.innerHTML, /&lt;img/);

  renderPreflight(container, { adapter: attack, state: "BLOCKED", checks: [{ label: attack, state: "blocked" }] });
  assert.doesNotMatch(container.innerHTML, /<img/i);

  renderAdapterDetails(container, { preflight: { adapter: attack, capability_state: attack } });
  assert.doesNotMatch(container.innerHTML, /<img/i);
});
