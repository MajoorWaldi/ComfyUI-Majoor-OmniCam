import test from "node:test";
import assert from "node:assert/strict";

import { pathBounds, pathCentroid, transformPathKeys, transformSelectedPathKeys } from "../../web-src/director/camera-path-transform.js";

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

// -- transformSelectedPathKeys (plan section 8 / Task 6) --------------------

test("transformSelectedPathKeys only moves the selected frames, base untouched", () => {
  const out = transformSelectedPathKeys(base, [10], { mode: "translate", delta: [1, 0, 0] });
  assert.deepEqual(out.map((k) => k.camera.position), [[0, 0, 0], [3, 0, 0], [4, 0, 0]]);
  assert.deepEqual(base.map((k) => k.camera.position), [[0, 0, 0], [2, 0, 0], [4, 0, 0]], "input snapshot is not mutated");
});

test("transformSelectedPathKeys accepts a Set of frames", () => {
  const out = transformSelectedPathKeys(base, new Set([0, 20]), { mode: "translate", delta: [0, 5, 0] });
  assert.deepEqual(out.map((k) => k.camera.position[1]), [5, 0, 5]);
});

test("Follow Path (no look-at constraint): translating a point retargets it down the new local tangent, distance preserved", () => {
  // Move the middle key off-axis; its neighbours (frame 0 and 20) do not move,
  // so the new local tangent through frame 10 is no longer +X.
  const out = transformSelectedPathKeys(base, [10], { mode: "translate", delta: [0, 3, 0] });
  const middle = out[1];
  const oldFocusDistance = 5; // |target - position| for every base key
  const newFocusDistance = Math.hypot(...middle.camera.target.map((v, i) => v - middle.camera.position[i]));
  assert.ok(Math.abs(newFocusDistance - oldFocusDistance) < 1e-6, "look-at distance is preserved");
  // Old target was straight -Z; after retargeting it must have picked up some
  // signal from the new tangent (no longer exactly [x, y, -5]).
  assert.notEqual(Math.round(middle.camera.target[1] * 1000), 0);
});

test("explicit look-at constraint (lookAtActive): target moves rigidly with position, no retargeting", () => {
  const out = transformSelectedPathKeys(base, [10], { mode: "translate", delta: [0, 3, 0], lookAtActive: true });
  const middle = out[1];
  assert.deepEqual(middle.camera.position, [2, 3, 0]);
  assert.deepEqual(middle.camera.target, [2, 3, -5], "target rides along with the same delta, unlike Follow Path");
});

test("whole path via transformSelectedPathKeys with every frame selected matches transformPathKeys", () => {
  const allFrames = base.map((k) => k.frame);
  const options = { mode: "rotate", origin: [2, 0, 0], rotationDeg: [0, 90, 0] };
  const whole = transformPathKeys(base, options);
  const selected = transformSelectedPathKeys(base, allFrames, options);
  for (let i = 0; i < base.length; i += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      assert.ok(Math.abs(whole[i].camera.position[axis] - selected[i].camera.position[axis]) < 1e-9);
    }
  }
});
