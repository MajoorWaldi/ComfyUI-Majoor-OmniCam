import test from "node:test";
import assert from "node:assert/strict";

import { playblastManifest, storePlayblastManifest } from "../../web-src/playblast-contract.js";
import { drawMotionOverlay } from "../../web-src/motion-tracks/overlay.js";

test("playblast manifest records exact authored timing, dimensions and cuts", () => {
  const ui = {
    canvas: { width: 1280, height: 720 },
    state: {
      fps: 24, duration_frames: 48, playblast_camera_id: "__sequence__",
      cameras: [{ id: "a" }, { id: "b" }],
      sequence: { enabled: true, cuts: [{ camera_id: "a", start: 0 }, { camera_id: "b", start: 24 }] },
    },
  };
  const blob = { type: "video/webm", omnicamMetrics: { encoder: "webcodecs", requestedFrames: 48, expectedDurationMs: 2000, recordedDurationMs: 2000, driftMs: 0, fps: 24, width: 1280, height: 720 } };

  const expected = {
    format: "majoor.omnicam.playblast.v1", encoder: "webcodecs", mime_type: "video/webm",
    fps: 24, frame_count: 48, duration_seconds: 2, width: 1280, height: 720,
    aspect_ratio: 16 / 9, clean_capture: true, drift_ms: 0,
    cuts: [{ camera_id: "a", start_frame: 0, end_frame: 23 }, { camera_id: "b", start_frame: 24, end_frame: 47 }],
  };
  assert.deepEqual(playblastManifest(ui, blob), expected);
  ui.state.metadata = { production: "demo" };
  assert.deepEqual(storePlayblastManifest(ui, blob), expected);
  assert.deepEqual(ui.state.metadata, { production: "demo", playblast: expected });
});

test("clean capture skips Motion Track overlays", () => {
  let saves = 0;
  drawMotionOverlay({ recording: true, ctx: { save() { saves += 1; } }, canvas: {}, state: {} });
  assert.equal(saves, 0);
});