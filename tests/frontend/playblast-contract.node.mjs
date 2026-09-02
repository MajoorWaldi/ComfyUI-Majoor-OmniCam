import test from "node:test";
import assert from "node:assert/strict";

import { playblastManifest, storePlayblastManifest } from "../../web-src/playblast-contract.js";
import { drawMotionOverlay } from "../../web-src/motion-tracks/overlay.js";
import { motionFingerprint } from "../../web-src/shared/motion-fingerprint.js";

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
    motion_scene_fingerprint: motionFingerprint(ui.state),
  };
  assert.deepEqual(playblastManifest(ui, blob), expected);
  ui.state.metadata = { production: "demo" };
  const withProduction = { ...expected, motion_scene_fingerprint: motionFingerprint(ui.state) };
  assert.deepEqual(storePlayblastManifest(ui, blob), withProduction);
  assert.deepEqual(ui.state.metadata, { production: "demo", playblast: withProduction });
});

test("the manifest fingerprint changes when the recorded scene does, and not from playblast metadata itself", () => {
  const ui1 = { canvas: { width: 640, height: 360 }, state: { fps: 24, duration_frames: 24, cameras: [{ id: "a" }] } };
  const ui2 = { canvas: { width: 640, height: 360 }, state: { fps: 24, duration_frames: 24, cameras: [{ id: "a" }, { id: "b" }] } };
  const blob = { type: "video/webm", omnicamMetrics: { encoder: "webcodecs", requestedFrames: 24, fps: 24, width: 640, height: 360 } };

  assert.notEqual(
    playblastManifest(ui1, blob).motion_scene_fingerprint,
    playblastManifest(ui2, blob).motion_scene_fingerprint,
  );

  // Re-recording the same scene twice must not shift the fingerprint just
  // because the first manifest is now sitting in state.metadata.
  const manifestA = storePlayblastManifest(ui1, blob);
  const manifestB = storePlayblastManifest(ui1, blob);
  assert.equal(manifestA.motion_scene_fingerprint, manifestB.motion_scene_fingerprint);
});

test("clean capture skips Motion Track overlays", () => {
  let saves = 0;
  drawMotionOverlay({ recording: true, ctx: { save() { saves += 1; } }, canvas: {}, state: {} });
  assert.equal(saves, 0);
});