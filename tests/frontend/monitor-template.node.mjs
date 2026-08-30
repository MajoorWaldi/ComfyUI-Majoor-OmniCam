import test from "node:test";
import assert from "node:assert/strict";
import { monitorMarkup } from "../../web-src/monitor/template.js";

test("Monitor template exposes every professional monitoring surface", () => {
  const markup = monitorMarkup();
  assert.match(markup, /class="majoor-omnicam oc-monitor"/);
  for (const role of ["monitor-status", "source-status", "proxy-player", "monitor-track-timeline", "camera-health", "adapter-preflight", "adapter-select", "adapter-preview", "cinematography", "camera-prompt", "final-prompt", "camera-data", "live-sync"]) {
    assert.match(markup, new RegExp(`data-role="${role}"`));
  }
  assert.match(markup, /data-act="monitor-refresh"/);
});
