import test from "node:test";
import assert from "node:assert/strict";

import {
  SPATIAL_HANDLE_MODES,
  setSpatialHandleMode,
  spatialHandleMode,
  spatialHandlePoints,
  writeSpatialHandle,
} from "../../web-src/camera-path-curve.js";
import { sampleCamera } from "../../web-src/director/core.js";

function key(frame, position, interpolation = "smooth") {
  return {
    frame,
    interpolation,
    camera: { position: [...position], target: [position[0], position[1], position[2] - 5], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 },
  };
}

function track(keys) {
  return { id: "camera_1", keyframes: keys, camera: keys[0].camera };
}

function length(vector) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function normalize(vector) {
  const magnitude = length(vector) || 1;
  return vector.map((value) => value / magnitude);
}

test("a fresh key reports auto handles that straddle it along the local tangent", () => {
  const a = key(0, [0, 0, 0]);
  const b = key(20, [4, 1, 0]);
  const c = key(40, [8, 0, 0]);
  assert.equal(spatialHandleMode(b), "auto");
  const points = spatialHandlePoints(b, a, c);
  // out handle leads toward c, in handle trails toward a, symmetric about b.
  assert.ok(points.out[0] > 4, "out handle bends toward the next key");
  assert.ok(points.in[0] < 4, "in handle trails toward the previous key");
  const inVector = points.in.map((v, i) => v - b.camera.position[i]);
  const outVector = points.out.map((v, i) => v - b.camera.position[i]);
  const dot = normalize(inVector).reduce((sum, value, axis) => sum + value * normalize(outVector)[axis], 0);
  assert.ok(dot < -0.9, "auto in/out are colinear-opposite");
});

test("dragging an out handle promotes the key to a bezier and stores per-axis deltas", () => {
  const a = key(0, [0, 0, 0]);
  const b = key(20, [4, 0, 0]);
  const c = key(40, [8, 0, 0]);
  writeSpatialHandle(b, "out", [5, 3, 0], { prevKey: a, nextKey: c });

  assert.equal(b.interpolation, "bezier");
  assert.equal(b.tangents.spatial_mode, "aligned");
  assert.equal(b.tangents.channels.pos_x.out_y, 1);
  assert.equal(b.tangents.channels.pos_y.out_y, 3);
  assert.equal(b.tangents.channels.pos_z.out_y, 0);

  const points = spatialHandlePoints(b, a, c);
  assert.deepEqual(points.out.map((v) => Math.round(v * 1e6) / 1e6), [5, 3, 0]);
});

test("aligned mode keeps the opposite handle colinear-opposite with its own length", () => {
  const a = key(0, [0, 0, 0]);
  const b = key(20, [4, 0, 0]);
  const c = key(40, [8, 0, 0]);
  setSpatialHandleMode(b, "aligned", { prevKey: a, nextKey: c });
  const beforeInLength = length(spatialHandlePoints(b, a, c).in.map((v, i) => v - b.camera.position[i]));

  writeSpatialHandle(b, "out", [4 + 2, 2, 0], { prevKey: a, nextKey: c });
  const points = spatialHandlePoints(b, a, c);
  const outVector = points.out.map((v, i) => v - b.camera.position[i]);
  const inVector = points.in.map((v, i) => v - b.camera.position[i]);

  const dot = normalize(inVector).reduce((sum, value, axis) => sum + value * normalize(outVector)[axis], 0);
  assert.ok(dot < -0.999, `in/out must stay opposite, dot=${dot}`);
  assert.ok(Math.abs(length(inVector) - beforeInLength) < 1e-6, "opposite handle keeps its length");
});

test("free mode leaves the untouched handle exactly where it was", () => {
  const a = key(0, [0, 0, 0]);
  const b = key(20, [4, 0, 0]);
  const c = key(40, [8, 0, 0]);
  setSpatialHandleMode(b, "free", { prevKey: a, nextKey: c });
  const originalIn = spatialHandlePoints(b, a, c).in;

  writeSpatialHandle(b, "out", [9, 5, 1], { prevKey: a, nextKey: c });
  const points = spatialHandlePoints(b, a, c);
  assert.deepEqual(points.in.map((v) => Math.round(v * 1e6) / 1e6), originalIn.map((v) => Math.round(v * 1e6) / 1e6));
  assert.deepEqual(points.out.map((v) => Math.round(v * 1e6) / 1e6), [9, 5, 1]);
});

test("corner mode freezes vector handles and ignores drags", () => {
  const a = key(0, [0, 0, 0]);
  const b = key(20, [4, 4, 0]);
  const c = key(40, [8, 0, 0]);
  setSpatialHandleMode(b, "corner", { prevKey: a, nextKey: c });
  assert.equal(spatialHandleMode(b), "corner");
  const before = spatialHandlePoints(b, a, c);
  // vector handle points one third toward each neighbour
  const round = (v) => Math.round(v * 1e6) / 1e6;
  assert.deepEqual(before.out.map(round), [4 + 4 / 3, 4 - 4 / 3, 0].map(round));

  writeSpatialHandle(b, "out", [100, 100, 100], { prevKey: a, nextKey: c });
  const after = spatialHandlePoints(b, a, c);
  assert.deepEqual(after.out, before.out);
});

test("switching back to auto discards stored handles and the bezier promotion", () => {
  const a = key(0, [0, 0, 0]);
  const b = key(20, [4, 0, 0]);
  const c = key(40, [8, 0, 0]);
  writeSpatialHandle(b, "out", [6, 3, 0], { prevKey: a, nextKey: c });
  assert.equal(b.interpolation, "bezier");

  setSpatialHandleMode(b, "auto", { prevKey: a, nextKey: c });
  assert.equal(spatialHandleMode(b), "auto");
  assert.equal(b.interpolation, "smooth");
  assert.equal(b.tangents.channels, undefined);
});

test("a stored handle actually bends the sampled camera path off the straight line", () => {
  const a = key(0, [0, 0, 0], "bezier");
  const b = key(60, [10, 0, 0], "bezier");
  const straight = track([a, b]);
  const straightMid = sampleCamera(straight, 30).position;
  assert.ok(Math.abs(straightMid[1]) < 1e-6, "no handle -> straight");

  writeSpatialHandle(a, "out", [3, 6, 0], { prevKey: null, nextKey: b });
  writeSpatialHandle(b, "in", [7, 6, 0], { prevKey: a, nextKey: null });
  const bent = sampleCamera(track([a, b]), 30).position;
  assert.ok(bent[1] > 1, `curve should lift off the axis, got y=${bent[1]}`);
});

test("SPATIAL_HANDLE_MODES is the menu order", () => {
  assert.deepEqual(SPATIAL_HANDLE_MODES, ["auto", "aligned", "free", "corner"]);
});
