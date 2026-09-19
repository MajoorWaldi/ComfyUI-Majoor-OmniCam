import test from "node:test";
import assert from "node:assert/strict";

import { isH3Profile, MONITOR_WIDGETS, monitorWidgetValues, writeMonitorWidget } from "../../web-src/monitor/widget-contract.js";

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
    "guide_reference_index", "guide_style", "reference_plan_json",
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

test("isH3Profile recognizes only the h3_* profile family (Director modal audit Lot 2)", () => {
  assert.equal(isH3Profile("h3_api"), true);
  assert.equal(isH3Profile("h3_native"), true);
  assert.equal(isH3Profile("h3_scene_coverage"), true);
  assert.equal(isH3Profile("wan_camera_native"), false);
  assert.equal(isH3Profile("external_reference_video"), false);
  assert.equal(isH3Profile(""), false);
  assert.equal(isH3Profile(undefined), false);
});
