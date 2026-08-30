import test from "node:test";
import assert from "node:assert/strict";

import { drawTrackTimeline } from "../../web-src/extractor/track-timeline.js";
import { trackTimelineModel } from "../../web-src/timeline/read-only-track.js";

const camera = (x = 0) => ({
  position: [x, 1, 5], target: [0, 1, 0], fov: 53, roll: 0,
  camera_type: "perspective", zoom: 1, near: 0.01, far: 1000,
});
const track = {
  schema_version: 1, fps: 24, duration_frames: 20, width: 1280, height: 720,
  render_mode: "omni_ref", objects: [], metadata: {},
  keyframes: [
    { frame: 0, interpolation: "linear", camera: camera(0) },
    { frame: 19, interpolation: "linear", camera: camera(2) },
  ],
};

test("Extractor and Monitor produce the same read-only lane model", () => {
  const shared = trackTimelineModel({ track, frame: 12 });
  const extractor = drawTrackTimeline(null, { track, frame: 12, frameCount: 20 });

  assert.equal(shared.total, extractor.total);
  assert.deepEqual(shared.keys, extractor.keys);
  assert.deepEqual(shared.keys.position, [0, 19]);
  assert.deepEqual(shared.keys.target, [0]);
});

test("the model remains useful without a canvas or health profile", () => {
  const model = trackTimelineModel({ track: null });
  assert.equal(model.total, 1);
  assert.deepEqual(model.keys.position, []);
});

