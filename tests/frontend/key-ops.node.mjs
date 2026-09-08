// Pure keyframe operations: simplify / reduce / clean + batch primitives.

import test from "node:test";
import assert from "node:assert/strict";

import {
  cleanKeyframes,
  deleteKeyframesByFrame,
  reduceKeyframes,
  setKeyframeInterpolation,
  setKeyframeTangentMode,
  shiftKeyframes,
  simplifyKeyframes,
} from "../../web-src/director/key-ops.js";

const camKey = (frame, x, fov = 35) => ({
  frame,
  interpolation: "linear",
  camera: { position: [x, 0, 0], target: [x, 0, -1], fov, roll: 0, zoom: 1 },
});

// A straight dolly: position rises linearly with frame, so every interior key is
// redundant to within rounding.
function straightTrack(count) {
  return Array.from({ length: count }, (_, i) => camKey(i * 10, i * 2));
}

test("simplifyKeyframes drops collinear interior keys and keeps the endpoints", () => {
  const keys = straightTrack(9);
  const { keys: out, removed } = simplifyKeyframes(keys, "camera", { tolerance: 0.05 });
  assert.equal(out[0].frame, 0);
  assert.equal(out.at(-1).frame, 80);
  assert.ok(out.length <= 3, `expected a near-straight line to collapse, got ${out.length}`);
  assert.equal(removed, keys.length - out.length);
});

test("simplifyKeyframes keeps a key that genuinely bends the path", () => {
  const keys = [camKey(0, 0), camKey(10, 0.2), camKey(20, 8), camKey(30, 8.2), camKey(40, 16)];
  const { keys: out } = simplifyKeyframes(keys, "camera", { tolerance: 0.02 });
  assert.ok(out.some((k) => k.frame === 20), "the corner key at F20 must survive");
});

test("simplifyKeyframes never removes a frame listed in keepFrames", () => {
  const keys = straightTrack(9);
  const { keys: out } = simplifyKeyframes(keys, "camera", { tolerance: 0.5, keepFrames: [40] });
  assert.ok(out.some((k) => k.frame === 40));
});

test("reduceKeyframes hits the target count and preserves endpoints", () => {
  const keys = straightTrack(12);
  const { keys: out } = reduceKeyframes(keys, "camera", { target: 5 });
  assert.equal(out.length, 5);
  assert.equal(out[0].frame, 0);
  assert.equal(out.at(-1).frame, 110);
});

test("cleanKeyframes merges near-frame keys, dedupes exact frames, keeps real bends", () => {
  // F1 is within 2 of F0 (merged); the two F20 keys dedupe; F20's value (5) is a
  // real bend off the 0 -> 2 line, so it stays.
  const keys = [camKey(0, 0), camKey(1, 0.01), camKey(20, 5), camKey(20, 9), camKey(40, 2)];
  const { keys: out } = cleanKeyframes(keys, "camera", { mergeWithin: 2 });
  assert.deepEqual(out.map((k) => k.frame), [0, 20, 40]);
});

test("cleanKeyframes also drops a collinear interior key", () => {
  const keys = [camKey(0, 0), camKey(20, 4), camKey(40, 8)];
  const { keys: out } = cleanKeyframes(keys, "camera", { mergeWithin: 1 });
  assert.deepEqual(out.map((k) => k.frame), [0, 40]);
});

test("deleteKeyframesByFrame respects the minimum-keys floor", () => {
  const keys = straightTrack(4);
  const { keys: out, removed } = deleteKeyframesByFrame(keys, [0, 10, 20, 30], { minKeys: 1 });
  assert.equal(out.length, 1);
  assert.equal(removed, 3);
});

test("shiftKeyframes is all-or-nothing: any collision or overflow blocks the whole nudge", () => {
  const keys = straightTrack(5); // frames 0,10,20,30,40
  // 20 -> 30 hits the unselected key at 30, so nothing moves.
  const blocked = shiftKeyframes(keys, [10, 20], 10, { lastFrame: 100 });
  assert.equal(blocked.moved, 0);
  assert.deepEqual(blocked.keys.map((k) => k.frame), [0, 10, 20, 30, 40]);

  // 10 -> 110 is off the timeline, so the whole group stays.
  assert.equal(shiftKeyframes(straightTrack(3), [0, 10], 100, { lastFrame: 100 }).moved, 0);

  // Clear path: 0,10 -> 30,40, no collision with the unselected key at 20.
  const ok = shiftKeyframes(straightTrack(3), [0, 10], 30, { lastFrame: 100 });
  assert.equal(ok.moved, 2);
  assert.deepEqual(ok.keys.map((k) => k.frame), [20, 30, 40]);
  assert.deepEqual(ok.frames, [30, 40]);
});

test("setKeyframeInterpolation only touches the selected frames", () => {
  const keys = straightTrack(4);
  const out = setKeyframeInterpolation(keys, [10, 30], "bezier");
  assert.deepEqual(out.map((k) => k.interpolation), ["linear", "bezier", "linear", "bezier"]);
});

test("setKeyframeTangentMode promotes selected keys to bezier and writes per-channel modes", () => {
  const keys = straightTrack(3);
  const out = setKeyframeTangentMode(keys, [10], "aligned", ["pos_x", "fov"]);
  assert.equal(out[1].interpolation, "bezier");
  assert.equal(out[1].tangents.mode, "aligned");
  assert.equal(out[1].tangents.channels.pos_x.mode, "aligned");
  assert.equal(out[0].interpolation, "linear", "unselected keys are untouched");
});
