import test from "node:test";
import assert from "node:assert/strict";

import { normalizeMonitorExecution, outputStatusText } from "../../web-src/monitor/execution-view.js";

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
