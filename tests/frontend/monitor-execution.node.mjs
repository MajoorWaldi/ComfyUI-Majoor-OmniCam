import test from "node:test";
import assert from "node:assert/strict";

import { normalizeMonitorExecution, outputStatusText, renderMonitorExecution } from "../../web-src/monitor/execution-view.js";

class FakeElement {
  constructor() {
    this.innerHTML = "";
    this.textContent = "";
    this.dataset = {};
    this.lastChild = { textContent: "" };
  }

  querySelector() { return null; }
}

/** Just enough of a DOM root for renderMonitorExecution's lookups. */
function fakeRoot() {
  const elements = {
    '[data-role="profile-preflight"]': new FakeElement(),
    '[data-role="profile-diff"]': new FakeElement(),
    '[data-role="profile-health"]': new FakeElement(),
    '[data-role="profile-capabilities"]': new FakeElement(),
    '[data-role="monitor-status"]': new FakeElement(),
    '[data-role="output-status"]': new FakeElement(),
  };
  return { elements, querySelector: (selector) => elements[selector] };
}

test("Monitor execution data keeps the exact selected profile and preflight", () => {
  const result = normalizeMonitorExecution({
    target_profile: ["ltx25_motion_track"],
    preflight: [[
      { id: "motion_layers", label: "Enabled motion layers: 2", state: "PASS", message: "" },
      { id: "target_length", label: "LTX frame count: 41", state: "PASS", message: "" },
    ]],
    capabilities: [{
      format: "majoor.omnicam.capabilities.v2",
      capabilities: [{ adapter: "ltx_motion_track", display: "LTX", state: "verified" }],
    }],
  });

  assert.equal(result.targetProfile, "ltx25_motion_track");
  assert.equal(result.preflight.length, 2);
  assert.equal(result.capabilities.capabilities[0].state, "verified");
});

test("Monitor execution normalizer also accepts direct V3 UI values", () => {
  const result = normalizeMonitorExecution({
    target_profile: "wan_move_native",
    preflight: [{ id: "motion_layers", label: "One layer", state: "BLOCKED", message: "Add a layer" }],
    capabilities: { format: "majoor.omnicam.capabilities.v2", capabilities: [] },
  });

  assert.equal(result.targetProfile, "wan_move_native");
  assert.equal(result.preflight[0].state, "BLOCKED");
  assert.deepEqual(result.capabilities.capabilities, []);
});

test("a blocked panel does not claim an output was generated", () => {
  // This panel is published by a run that then fails, so the status line is the
  // difference between "your compile is red" and "your compile succeeded".
  assert.equal(outputStatusText(true, "h3_native"), "NO OUTPUT · h3_native");
  assert.equal(outputStatusText(false, "h3_native"), "OUTPUT GENERATED · h3_native");
  assert.equal(outputStatusText(true, ""), "NO OUTPUT");
});

test("a live snapshot never claims a real execution happened", () => {
  // Nothing was queued, so "OUTPUT GENERATED" would be a false claim about a
  // run that did not occur.
  assert.equal(outputStatusText(false, "h3_native", true), "LIVE PREVIEW · h3_native");
  assert.equal(outputStatusText(true, "h3_native", true), "LIVE — WOULD BLOCK · h3_native");
  assert.equal(outputStatusText(true, "", true), "LIVE — WOULD BLOCK");
});

test("renderMonitorExecution threads the live flag into the status line", () => {
  const root = fakeRoot();
  const message = {
    ui: {
      target_profile: "external_reference_video",
      preflight: [{ id: "playblast_video", label: "Connected playblast media", state: "PASS", message: "" }],
      capabilities: { capabilities: [] },
    },
  };

  renderMonitorExecution(root, message, { live: true });
  assert.equal(root.elements['[data-role="output-status"]'].textContent, "LIVE PREVIEW · external_reference_video");
  assert.equal(root.elements['[data-role="monitor-status"]'].dataset.state, "READY");

  renderMonitorExecution(root, message);
  assert.equal(root.elements['[data-role="output-status"]'].textContent, "OUTPUT GENERATED · external_reference_video");
});

test("renderMonitorExecution still reads BLOCKED correctly when live", () => {
  const root = fakeRoot();
  const message = {
    preflight: [{ id: "playblast_video", label: "x", state: "BLOCKED", message: "no playblast" }],
    target_profile: "h3_native",
    capabilities: { capabilities: [] },
  };

  renderMonitorExecution(root, message, { live: true });
  assert.equal(root.elements['[data-role="monitor-status"]'].dataset.state, "BLOCKED");
  assert.equal(root.elements['[data-role="output-status"]'].textContent, "LIVE — WOULD BLOCK · h3_native");
});

// ---------------------------------------------------------------------------
// P2: Compilation Diff / Guide Health grouping, and the previously-unrendered
// code/recoverable/suggestions Check fields.
// ---------------------------------------------------------------------------

test("checks with mapping_quality render in the diff panel, not the general preflight list", () => {
  const root = fakeRoot();
  const message = {
    target_profile: "seedance25_reference",
    preflight: [
      { id: "playblast_video", label: "Connected playblast media", state: "PASS", message: "" },
      { id: "camera_motion_mapping", label: "Camera motion control", state: "PASS", mapping_quality: "CONDITIONAL", message: "" },
    ],
    capabilities: { capabilities: [] },
  };
  renderMonitorExecution(root, message);
  assert.match(root.elements['[data-role="profile-preflight"]'].innerHTML, /Connected playblast media/);
  assert.doesNotMatch(root.elements['[data-role="profile-preflight"]'].innerHTML, /Camera motion control/);
  assert.match(root.elements['[data-role="profile-diff"]'].innerHTML, /Camera motion control/);
  assert.match(root.elements['[data-role="profile-diff"]'].innerHTML, /CONDITIONAL/);
});

test("guide_health_* checks render in the health panel, not the general preflight list", () => {
  const root = fakeRoot();
  const message = {
    target_profile: "seedance25_reference",
    preflight: [
      { id: "playblast_video", label: "Connected playblast media", state: "PASS", message: "" },
      { id: "guide_health_peak_speed", label: "Guide motion readability", state: "WARNING", message: "close to a hold" },
    ],
    capabilities: { capabilities: [] },
  };
  renderMonitorExecution(root, message);
  assert.doesNotMatch(root.elements['[data-role="profile-preflight"]'].innerHTML, /Guide motion readability/);
  assert.match(root.elements['[data-role="profile-health"]'].innerHTML, /Guide motion readability/);
});

test("empty diff/health panels show an empty state rather than nothing", () => {
  const root = fakeRoot();
  renderMonitorExecution(root, {
    target_profile: "external_reference_video",
    preflight: [{ id: "playblast_video", label: "x", state: "PASS", message: "" }],
    capabilities: { capabilities: [] },
  });
  assert.match(root.elements['[data-role="profile-diff"]'].innerHTML, /oc-empty/);
  assert.match(root.elements['[data-role="profile-health"]'].innerHTML, /oc-empty/);
});

test("suggestions and recoverable render for a check that carries them", () => {
  const root = fakeRoot();
  renderMonitorExecution(root, {
    target_profile: "h3_native",
    preflight: [{
      id: "playblast_freshness", label: "Playblast out of date", state: "BLOCKED",
      message: "The scene has changed.", code: "PLAYBLAST_STALE", recoverable: true,
      suggestions: ["Re-record the playblast from the Director before compiling."],
    }],
    capabilities: { capabilities: [] },
  });
  const html = root.elements['[data-role="profile-preflight"]'].innerHTML;
  assert.match(html, /Re-record the playblast from the Director before compiling\./);
  assert.match(html, /recoverable/i);
  assert.match(html, /data-code="PLAYBLAST_STALE"/);
});

test("a check with no suggestions renders no suggestions list", () => {
  const root = fakeRoot();
  renderMonitorExecution(root, {
    target_profile: "h3_native",
    preflight: [{ id: "playblast_video", label: "Connected playblast media", state: "PASS", message: "" }],
    capabilities: { capabilities: [] },
  });
  assert.doesNotMatch(root.elements['[data-role="profile-preflight"]'].innerHTML, /oc-suggestions/);
});
