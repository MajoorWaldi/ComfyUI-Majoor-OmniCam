import test from "node:test";
import assert from "node:assert/strict";

import { LiveTrackAccumulator } from "../../web-src/extractor/live-track.js";
import { FrameDiagnosticsStore } from "../../web-src/extractor/diagnostics-store.js";


function pose(frame, position = [frame, 0, 0]) {
  return { frame, position, quaternion_xyzw: [0, 0, 0, 1], valid: true };
}


test("live poses are sorted, deduplicated and bounded", () => {
  const live = new LiveTrackAccumulator({ maxPoses: 3, fps: 24 });
  live.add(pose(2));
  live.add(pose(1));
  live.add(pose(2, [20, 0, 0]));
  live.add(pose(3));
  live.add(pose(4));

  const track = live.track();
  assert.deepEqual(track.keyframes.map((key) => key.frame), [1, 3, 4]);
  assert.equal(track.metadata.transient, true);
  assert.equal(track.schema_version, 1);
});


test("a quaternion turns local minus Z into the preview target", () => {
  const live = new LiveTrackAccumulator({ fps: 30, fov: 60 });
  live.add(pose(0, [1, 2, 3]));
  const camera = live.track().keyframes[0].camera;
  assert.deepEqual(camera.position, [1, 2, 3]);
  assert.deepEqual(camera.target, [1, 2, 2]);
  assert.equal(camera.fov, 60);
});


test("invalid pose telemetry never enters a preview track", () => {
  const live = new LiveTrackAccumulator();
  assert.equal(live.add({ frame: 1, position: [NaN, 0, 0], quaternion_xyzw: [0, 0, 0, 1] }), false);
  assert.equal(live.add({ frame: 2, position: [0, 0, 0], quaternion_xyzw: [0, 0, 0, 0] }), false);
  assert.equal(live.track(), null);
});


test("frame diagnostics retain a bounded scrub window", () => {
  const store = new FrameDiagnosticsStore({ maxFrames: 3 });
  for (let frame = 1; frame <= 4; frame += 1) {
    store.set(frame, { points: [{ x: 0.5, y: 0.5, state: "accepted" }] });
  }

  assert.equal(store.get(1), null);
  assert.deepEqual(store.get(4), {
    frame: 4, points: [{ x: 0.5, y: 0.5, state: "accepted" }], vectors: [], state: "unknown",
  });
});
