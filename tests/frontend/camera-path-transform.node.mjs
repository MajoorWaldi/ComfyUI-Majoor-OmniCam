import test from "node:test";
import assert from "node:assert/strict";

import { pathBounds, pathCentroid, transformPathKeys } from "../../web-src/director/camera-path-transform.js";

function key(frame, position, target) {
  return { frame, interpolation: "smooth", camera: { position: [...position], target: [...target], fov: 35, roll: 0 } };
}

const base = [
  key(0, [0, 0, 0], [0, 0, -5]),
  key(10, [2, 0, 0], [2, 0, -5]),
  key(20, [4, 0, 0], [4, 0, -5]),
];

test("pathCentroid is the mean of the key positions", () => {
  assert.deepEqual(pathCentroid(base), [2, 0, 0]);
});

test("pathBounds spans every key position", () => {
  assert.deepEqual(pathBounds(base), { min: [0, 0, 0], max: [4, 0, 0] });
});

test("translate offsets every position and target, base untouched", () => {
  const out = transformPathKeys(base, { mode: "translate", delta: [1, 2, 3] });
  assert.deepEqual(out.map((k) => k.camera.position), [[1, 2, 3], [3, 2, 3], [5, 2, 3]]);
  assert.deepEqual(out.map((k) => k.camera.target), [[1, 2, -2], [3, 2, -2], [5, 2, -2]]);
  assert.deepEqual(base[0].camera.position, [0, 0, 0], "input snapshot is not mutated");
  assert.equal(out[0].frame, 0, "frames are carried through");
});

test("scale about the centroid stretches the path, centre key fixed", () => {
  const out = transformPathKeys(base, { mode: "scale", origin: [2, 0, 0], factors: [2, 2, 2] });
  assert.deepEqual(out.map((k) => k.camera.position[0]), [-2, 2, 6]);
});

test("rotate 90 deg about Y about the centroid swings the path onto Z", () => {
  const out = transformPathKeys(base, { mode: "rotate", origin: [2, 0, 0], rotationDeg: [0, 90, 0] });
  const xs = out.map((k) => Math.round(k.camera.position[0]));
  const zs = out.map((k) => Math.round(k.camera.position[2]));
  assert.deepEqual(xs, [2, 2, 2], "every key ends on the centroid's X");
  assert.equal(zs[0] !== 0 || zs[2] !== 0, true, "the ends swung out along Z");
  assert.equal(zs[0], -zs[2], "symmetric about the centroid");
});
