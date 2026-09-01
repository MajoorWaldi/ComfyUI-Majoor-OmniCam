import test from "node:test";
import assert from "node:assert/strict";
import { monitorMarkup, PROFILE_OPTIONS } from "../../web-src/monitor/template.js";

test("Monitor template mirrors the V3 Monitor profile contract", () => {
  const markup = monitorMarkup();
  assert.match(markup, /class="majoor-omnicam oc-monitor"/);
  for (const role of ["monitor-status", "source-status", "proxy-player", "profile-preflight", "profile-capabilities", "profile-select", "output-status"]) {
    assert.match(markup, new RegExp(`data-role="${role}"`));
  }
  for (const setting of ["base_prompt", "target_width", "target_height", "duration_seconds", "target_fps"]) {
    assert.match(markup, new RegExp(`data-setting="${setting}"`));
  }
  assert.deepEqual(PROFILE_OPTIONS.map(([id]) => id), [
    "h3_api", "h3_native", "ltx25_motion_track", "wan_camera_native",
    "wan_move_native", "wan_track_native", "wanvideo_ati",
  ]);
  for (const legacy of ["video_ref_token", "point_count", "ltx_max_frames", "camera-health", "adapter-preview", "monitor-refresh"]) {
    assert.doesNotMatch(markup, new RegExp(legacy));
  }
});
