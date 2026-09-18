// Director modal audit Lot 3: a scene with many cameras used to grow the
// preview strip's own content with no ceiling (bounded only by the shared
// .oc-dock scroll from Lot 1). boundedPreviewTracks caps the tile count
// instead, always keeping the playblast and active cameras visible.

import test from "node:test";
import assert from "node:assert/strict";

import { boundedPreviewTracks } from "../../web-src/cameras.js";

function fixture(count, overrides = {}) {
  return {
    state: {
      cameras: Array.from({ length: count }, (_, i) => ({ id: `cam_${i}`, name: `Camera ${i + 1}` })),
      playblast_camera_id: "cam_0",
      active_camera_id: "cam_1",
      ...overrides,
    },
  };
}

test("returns every camera with no overflow when at or under the cap", () => {
  const ui = fixture(6);
  const { tracks, overflow } = boundedPreviewTracks(ui);
  assert.equal(tracks.length, 6);
  assert.equal(overflow, 0);
});

test("caps the tile count and reports the overflow for a scene with many cameras", () => {
  const ui = fixture(10);
  const { tracks, overflow } = boundedPreviewTracks(ui);
  assert.equal(tracks.length, 6);
  assert.equal(overflow, 4);
});

test("always keeps the playblast and active cameras among the shown tiles", () => {
  const ui = fixture(10, { playblast_camera_id: "cam_7", active_camera_id: "cam_8" });
  const { tracks } = boundedPreviewTracks(ui);
  const ids = tracks.map((t) => t.id);
  assert.ok(ids.includes("cam_7"), "playblast camera stays visible");
  assert.ok(ids.includes("cam_8"), "active camera stays visible");
  assert.equal(tracks.length, 6);
});

test("muted cameras are excluded before the cap is even applied", () => {
  const ui = fixture(8);
  ui.state.cameras[2].muted = true;
  ui.state.cameras[3].muted = true;
  const { tracks, overflow } = boundedPreviewTracks(ui);
  assert.equal(tracks.length, 6);
  assert.equal(overflow, 0, "6 unmuted cameras fit exactly, no overflow tile needed");
  assert.ok(!tracks.some((t) => t.id === "cam_2" || t.id === "cam_3"));
});
