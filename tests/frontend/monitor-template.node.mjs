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
    "external_reference_video", "h3_api", "h3_native", "ltx25_motion_track",
    "wan_camera_native", "wan_move_native", "wan_track_native", "wanvideo_ati",
  ]);
  // The permissive profile leads the list, matching the backend widget default
  // in omnicam/nodes/monitor.py (PROFILE_REGISTRY.ids[0], alphabetically first).
  assert.equal(PROFILE_OPTIONS[0][0], "external_reference_video");
  for (const legacy of ["video_ref_token", "point_count", "ltx_max_frames", "camera-health", "adapter-preview", "monitor-refresh"]) {
    assert.doesNotMatch(markup, new RegExp(legacy));
  }

  // Profiles and Installed capabilities are long lists that used to stretch the
  // node past the screen. They ship collapsed, as <details>, and must not carry
  // `open`.
  for (const role of ["profile-catalogue", "profile-capabilities"]) {
    assert.match(
      markup,
      new RegExp(`<details class="oc-card oc-collapsible"><summary [^>]*>[^<]+</summary><div data-role="${role}"`),
    );
  }
  assert.doesNotMatch(markup, /<details[^>]*\sopen/);
});
