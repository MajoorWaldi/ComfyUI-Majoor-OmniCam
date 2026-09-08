import test from "node:test";
import assert from "node:assert/strict";

import { buildPathKeyframes } from "../../web-src/director/camera-path-draw.js";

function source(position = [0, 4, 8], target = [0, 3, 0]) {
  return { position: [...position], target: [...target], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 };
}

test("a top-view stroke keeps the source height and pitch on every key", () => {
  const session = {
    range: [0, 40],
    planeAxis: "y",
    seedPoint: null,
    sourceCamera: source([0, 4, 8], [0, 3, 0]), // aims 1 unit down, 8 forward
    points: [[-4, 4, 3], [0, 4, 0], [4, 4, 3]],
  };
  const keys = buildPathKeyframes(session);
  assert.ok(keys.length >= 2 && keys.length <= 32);
  assert.equal(keys[0].frame, 0);
  assert.equal(keys.at(-1).frame, 40);
  for (const key of keys) {
    assert.equal(key.camera.position[1], 4, "height is locked to the draw plane");
    // vertical target offset from the source (-1) is carried onto each key
    assert.ok(Math.abs((key.camera.target[1] - key.camera.position[1]) - -1) < 1e-6);
  }
});

test("a front-view stroke varies height because the plane axis is Z", () => {
  const session = {
    range: [0, 30],
    planeAxis: "z",
    seedPoint: null,
    sourceCamera: source([0, 2, 10], [0, 2, 0]),
    points: [[-3, 1, 0], [0, 3, 0], [3, 5, 0]], // rising diagonal on Z = 0
  };
  const keys = buildPathKeyframes(session);
  assert.ok(keys.length >= 2);
  assert.ok(keys.at(-1).camera.position[1] > keys[0].camera.position[1], "the path climbs");
  for (const key of keys) assert.ok(Math.abs(key.camera.position[2]) < 1e-6, "Z stays on the draw plane");
});

test("extend mode drops the seed key and starts strictly after the last frame", () => {
  const session = {
    range: [20, 60], // 20 == the existing last key's frame
    planeAxis: "y",
    seedPoint: [5, 4, 5],
    sourceCamera: source([5, 4, 12], [5, 3, 5]),
    points: [[6, 4, 6], [8, 4, 9], [10, 4, 12]],
  };
  const keys = buildPathKeyframes(session);
  assert.ok(keys.length >= 1);
  assert.ok(keys[0].frame > 20, "the first appended key lands after the existing last key");
  assert.equal(keys.at(-1).frame, 60);
  // the seed itself is not re-emitted
  assert.ok(keys.every((key) => key.frame !== 20));
});

test("key count never exceeds the 32 cap even for a dense stroke", () => {
  const points = Array.from({ length: 400 }, (_, i) => [i * 0.1, 4, Math.sin(i * 0.1)]);
  const keys = buildPathKeyframes({ range: [0, 240], planeAxis: "y", seedPoint: null, sourceCamera: source(), points });
  assert.ok(keys.length <= 32);
});
