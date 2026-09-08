import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCameraPathKeys,
  resolveCameraPathRange,
  simplifyCameraStroke,
} from "../../web-src/camera-path-authoring.js";

const baseCamera = {
  position: [0, 2, 0],
  target: [0, 2, -5],
  fov: 35,
  roll: 0,
  camera_type: "perspective",
  zoom: 1,
  near: 0.01,
  far: 10000,
};

test("camera path range uses playback In/Out when present and the full timeline otherwise", () => {
  assert.deepEqual(resolveCameraPathRange({ duration_frames: 121, playback_range: [24, 96] }), [24, 96]);
  assert.deepEqual(resolveCameraPathRange({ duration_frames: 121, playback_range: null }), [0, 120]);
});

test("drawn stroke simplification preserves endpoints and removes redundant samples", () => {
  const points = [
    [0, 2, 0], [0.01, 2, 0], [0.02, 2, 0],
    [1, 2, 0], [2, 2, 0], [3, 2, 0],
  ];
  const simplified = simplifyCameraStroke(points, { minDistance: 0.05, tolerance: 0.02, maxPoints: 24 });
  assert.deepEqual(simplified[0], points[0]);
  assert.deepEqual(simplified.at(-1), points.at(-1));
  assert.ok(simplified.length < points.length);
});

test("camera path keys span the requested frame range and look along the path by default", () => {
  const keys = buildCameraPathKeys({
    points: [[0, 2, 0], [2, 2, 0], [2, 2, -4]],
    startFrame: 10,
    endFrame: 70,
    camera: baseCamera,
  });

  assert.equal(keys[0].frame, 10);
  assert.equal(keys.at(-1).frame, 70);
  assert.ok(keys.every((key) => key.interpolation === "smooth"));
  assert.ok(keys.every((key) => Math.abs(key.camera.position[1] - 2) < 1e-9));

  const firstForward = [
    keys[0].camera.target[0] - keys[0].camera.position[0],
    keys[0].camera.target[1] - keys[0].camera.position[1],
    keys[0].camera.target[2] - keys[0].camera.position[2],
  ];
  assert.ok(firstForward[0] > 0.9, "first camera should face along the first segment");
  assert.ok(Math.abs(firstForward[2]) < 0.1);
});

test("camera path timing is distributed by travelled distance", () => {
  const keys = buildCameraPathKeys({
    points: [[0, 2, 0], [1, 2, 0], [5, 2, 0]],
    startFrame: 0,
    endFrame: 100,
    camera: baseCamera,
  });
  assert.equal(keys.length, 3);
  assert.ok(keys[1].frame >= 18 && keys[1].frame <= 22, `expected first metre near frame 20, got ${keys[1].frame}`);
});

test("camera path generation keeps frames unique even in a short In/Out range", () => {
  const points = Array.from({ length: 20 }, (_, index) => [index, 2, 0]);
  const keys = buildCameraPathKeys({ points, startFrame: 4, endFrame: 9, camera: baseCamera });
  assert.equal(keys[0].frame, 4);
  assert.equal(keys.at(-1).frame, 9);
  assert.deepEqual([...new Set(keys.map((key) => key.frame))], keys.map((key) => key.frame));
  assert.ok(keys.length <= 6);
});
