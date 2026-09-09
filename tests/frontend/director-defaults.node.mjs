import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";

test("director state defaults open in animation-friendly perspective mode", () => {
  const fresh = defaultState();
  assert.equal(fresh.show_radar, true);
  assert.equal(fresh.navigation_profile, "simple");
  assert.equal(fresh.view_mode, "perspective");
  assert.equal(fresh.ui_density, "animation");

  const sanitized = sanitizeState({
    navigation_profile: "invalid",
    view_mode: "invalid",
    ui_density: "invalid",
  });
  assert.equal(sanitized.show_radar, true);
  assert.equal(sanitized.navigation_profile, "simple");
  assert.equal(sanitized.view_mode, "perspective");
  assert.equal(sanitized.ui_density, "animation");
});
