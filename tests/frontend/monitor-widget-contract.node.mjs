import test from "node:test";
import assert from "node:assert/strict";

import { MONITOR_WIDGETS, monitorWidgetValues, writeMonitorWidget } from "../../web-src/monitor/widget-contract.js";

function fakeNode() {
  return {
    widgets: MONITOR_WIDGETS.map((name) => ({ name, value: name === "target_profile" ? "wan_move_native" : 24 })),
  };
}

test("Monitor UI persists only the V3 node widgets", () => {
  const node = fakeNode();
  assert.deepEqual(MONITOR_WIDGETS, [
    "base_prompt", "target_profile", "target_width", "target_height",
    "duration_seconds", "target_fps",
  ]);
  assert.equal(monitorWidgetValues(node).target_profile, "wan_move_native");
  writeMonitorWidget(node, "target_profile", "ltx25_motion_track");
  assert.equal(monitorWidgetValues(node).target_profile, "ltx25_motion_track");
});

test("Monitor numeric controls persist as numbers", () => {
  const node = fakeNode();
  writeMonitorWidget(node, "target_width", "832");
  writeMonitorWidget(node, "target_fps", "30");
  assert.equal(monitorWidgetValues(node).target_width, 832);
  assert.equal(monitorWidgetValues(node).target_fps, 30);
});
