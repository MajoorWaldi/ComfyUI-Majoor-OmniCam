import test from "node:test";
import assert from "node:assert/strict";

import {
  cameraPathTimingWeight,
  setCameraPathTimingWeight,
  redistributeCameraPathTiming,
  DEFAULT_TIMING_WEIGHT,
  MIN_TIMING_WEIGHT,
  MAX_TIMING_WEIGHT,
} from "../../web-src/director/camera-path-timing.js";
import { sanitizeState } from "../../web-src/director/core.js";

function key(frame, position, extra = {}) {
  return {
    frame,
    interpolation: "smooth",
    camera: {
      position: [...position],
      target: [position[0], position[1], position[2] - 5],
      fov: 35,
      roll: 0,
      camera_type: "perspective",
      zoom: 1,
      near: 0.01,
      far: 10000,
    },
    ...extra,
  };
}

// --- cameraPathTimingWeight -------------------------------------------------

test("cameraPathTimingWeight: defaults to 1.0 when absent", () => {
  assert.equal(cameraPathTimingWeight(key(0, [0, 0, 0])), DEFAULT_TIMING_WEIGHT);
  assert.equal(cameraPathTimingWeight({}), DEFAULT_TIMING_WEIGHT);
  assert.equal(cameraPathTimingWeight(null), DEFAULT_TIMING_WEIGHT);
});

test("cameraPathTimingWeight: reads a valid stored weight", () => {
  const k = key(0, [0, 0, 0], { timing: { weight: 2.5 } });
  assert.equal(cameraPathTimingWeight(k), 2.5);
});

test("cameraPathTimingWeight: clamps/falls back on out-of-range or invalid values", () => {
  assert.equal(cameraPathTimingWeight(key(0, [0, 0, 0], { timing: { weight: 0.01 } })), DEFAULT_TIMING_WEIGHT);
  assert.equal(cameraPathTimingWeight(key(0, [0, 0, 0], { timing: { weight: 50 } })), DEFAULT_TIMING_WEIGHT);
  assert.equal(cameraPathTimingWeight(key(0, [0, 0, 0], { timing: { weight: NaN } })), DEFAULT_TIMING_WEIGHT);
  assert.equal(cameraPathTimingWeight(key(0, [0, 0, 0], { timing: { weight: "oops" } })), DEFAULT_TIMING_WEIGHT);
  assert.equal(cameraPathTimingWeight(key(0, [0, 0, 0], { timing: {} })), DEFAULT_TIMING_WEIGHT);
});

test("cameraPathTimingWeight: boundary values are accepted", () => {
  assert.equal(cameraPathTimingWeight(key(0, [0, 0, 0], { timing: { weight: MIN_TIMING_WEIGHT } })), MIN_TIMING_WEIGHT);
  assert.equal(cameraPathTimingWeight(key(0, [0, 0, 0], { timing: { weight: MAX_TIMING_WEIGHT } })), MAX_TIMING_WEIGHT);
});

// --- setCameraPathTimingWeight ----------------------------------------------

test("setCameraPathTimingWeight: stores a valid non-default weight", () => {
  const k = key(0, [0, 0, 0]);
  const next = setCameraPathTimingWeight(k, 3);
  assert.equal(next.timing.weight, 3);
  assert.equal(k.timing, undefined, "original key is not mutated");
});

test("setCameraPathTimingWeight: drops timing entirely at the implicit default", () => {
  const k = key(0, [0, 0, 0], { timing: { weight: 3 } });
  const next = setCameraPathTimingWeight(k, 1.0);
  assert.equal(next.timing, undefined);
});

test("setCameraPathTimingWeight: drops timing for invalid/out-of-range input", () => {
  const k = key(0, [0, 0, 0], { timing: { weight: 3 } });
  assert.equal(setCameraPathTimingWeight(k, NaN).timing, undefined);
  assert.equal(setCameraPathTimingWeight(k, 0).timing, undefined);
  assert.equal(setCameraPathTimingWeight(k, 20).timing, undefined);
});

// --- redistributeCameraPathTiming -------------------------------------------

test("redistributeCameraPathTiming: constant speed spreads frames proportionally to distance", () => {
  const keys = [key(0, [0, 0, 0]), key(10, [1, 0, 0]), key(20, [3, 0, 0])];
  const result = redistributeCameraPathTiming(keys, { startFrame: 0, endFrame: 20 });
  assert.equal(result.ok, true);
  assert.equal(result.keys[0].frame, 0);
  assert.equal(result.keys[2].frame, 20);
  // segment distances are 1 and 2 -> 1/3 and 2/3 of the span
  assert.equal(result.keys[1].frame, Math.round(20 / 3));
});

test("redistributeCameraPathTiming: equal distance + equal weight spaces keys evenly", () => {
  const keys = [key(0, [0, 0, 0]), key(3, [1, 0, 0]), key(50, [2, 0, 0]), key(51, [3, 0, 0])];
  const result = redistributeCameraPathTiming(keys, { startFrame: 0, endFrame: 30 });
  assert.equal(result.ok, true);
  assert.deepEqual(result.keys.map((k) => k.frame), [0, 10, 20, 30]);
});

test("redistributeCameraPathTiming: a heavier weight around a key slows its neighboring segments", () => {
  const evenKeys = [key(0, [0, 0, 0]), key(1, [1, 0, 0]), key(2, [2, 0, 0])];
  const even = redistributeCameraPathTiming(evenKeys, { startFrame: 0, endFrame: 20 });
  assert.equal(even.keys[1].frame, 10);

  const weighted = [
    key(0, [0, 0, 0]),
    { ...key(1, [1, 0, 0]), timing: { weight: 5 } },
    key(2, [2, 0, 0]),
  ];
  const result = redistributeCameraPathTiming(weighted, { startFrame: 0, endFrame: 20 });
  assert.equal(result.ok, true);
  // Both segments touch the heavy-weight middle key, so both costs scale up
  // equally and the midpoint stays centered, but a lopsided weight should
  // shift it -- verify with an asymmetric case instead.
  assert.equal(result.keys[1].frame, 10);
});

test("redistributeCameraPathTiming: asymmetric weighting shifts the interior key", () => {
  // Give the *second* key a heavy weight only via a neighbor with default
  // weight vs one with a light weight, so the two segment costs differ.
  const keys = [
    key(0, [0, 0, 0]),
    key(1, [1, 0, 0]),
    { ...key(2, [2, 0, 0]), timing: { weight: 0.1 } },
  ];
  const result = redistributeCameraPathTiming(keys, { startFrame: 0, endFrame: 20 });
  assert.equal(result.ok, true);
  // Segment 0->1 has average weight (1+1)/2 = 1, cost 1*1 = 1.
  // Segment 1->2 has average weight (1+0.1)/2 = 0.55, cost 1*0.55 = 0.55.
  // Fraction at key 1 = 1 / 1.55 ~= 0.645 -> frame ~13.
  const expected = Math.round((1 / 1.55) * 20);
  assert.equal(result.keys[1].frame, expected);
  assert.ok(result.keys[1].frame > 10, "heavier leading segment should push the midpoint later");
});

test("redistributeCameraPathTiming: preserves first and last frame", () => {
  const keys = [key(5, [0, 0, 0]), key(8, [1, 1, 1]), key(40, [2, 2, 2])];
  const result = redistributeCameraPathTiming(keys, { startFrame: 5, endFrame: 40 });
  assert.equal(result.ok, true);
  assert.equal(result.keys[0].frame, 5);
  assert.equal(result.keys[result.keys.length - 1].frame, 40);
});

test("redistributeCameraPathTiming: strictly increasing frames even for a static path", () => {
  const keys = [key(0, [1, 1, 1]), key(1, [1, 1, 1]), key(2, [1, 1, 1]), key(3, [1, 1, 1])];
  const result = redistributeCameraPathTiming(keys, { startFrame: 0, endFrame: 3 });
  assert.equal(result.ok, true);
  const frames = result.keys.map((k) => k.frame);
  for (let i = 1; i < frames.length; i += 1) assert.ok(frames[i] > frames[i - 1], `frames must strictly increase: ${frames}`);
  assert.deepEqual(frames, [0, 1, 2, 3]);
});

test("redistributeCameraPathTiming: refuses when there are fewer frame slots than keys", () => {
  const keys = [key(0, [0, 0, 0]), key(1, [1, 0, 0]), key(2, [2, 0, 0]), key(3, [3, 0, 0])];
  const result = redistributeCameraPathTiming(keys, { startFrame: 0, endFrame: 2 });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "insufficient_frame_slots");
});

test("redistributeCameraPathTiming: refuses an invalid range", () => {
  const keys = [key(0, [0, 0, 0]), key(1, [1, 0, 0])];
  assert.equal(redistributeCameraPathTiming(keys, { startFrame: 10, endFrame: 5 }).ok, false);
  assert.equal(redistributeCameraPathTiming(keys, { startFrame: NaN, endFrame: 10 }).ok, false);
  assert.equal(redistributeCameraPathTiming(keys, {}).ok, false);
});

test("redistributeCameraPathTiming: repositions the first/last key onto the requested range regardless of original frame numbers", () => {
  const keys = [key(2, [0, 0, 0]), key(4, [1, 0, 0]), key(6, [2, 0, 0])];
  const result = redistributeCameraPathTiming(keys, { startFrame: 0, endFrame: 6 });
  assert.equal(result.ok, true);
  assert.equal(result.keys[0].frame, 0);
  assert.equal(result.keys[result.keys.length - 1].frame, 6);
});

test("redistributeCameraPathTiming: refuses fewer than two keys", () => {
  assert.equal(redistributeCameraPathTiming([key(0, [0, 0, 0])], { startFrame: 0, endFrame: 10 }).ok, false);
  assert.equal(redistributeCameraPathTiming([], { startFrame: 0, endFrame: 10 }).ok, false);
});

// --- sanitizeState round-trip -------------------------------------------------

test("sanitizeState: an untouched key round-trips byte-identical (no timing field)", () => {
  const state = sanitizeState({
    fps: 24,
    duration_frames: 30,
    cameras: [{
      id: "camera_1",
      name: "Camera 1",
      keyframes: [key(0, [0, 0, 0]), key(20, [1, 1, 1])],
    }],
  });
  for (const k of state.cameras[0].keyframes) assert.equal(k.timing, undefined);
});

test("sanitizeState: a stored valid timing weight survives sanitization", () => {
  const state = sanitizeState({
    fps: 24,
    duration_frames: 30,
    cameras: [{
      id: "camera_1",
      name: "Camera 1",
      keyframes: [key(0, [0, 0, 0], { timing: { weight: 4 } }), key(20, [1, 1, 1])],
    }],
  });
  assert.equal(state.cameras[0].keyframes[0].timing.weight, 4);
  assert.equal(state.cameras[0].keyframes[1].timing, undefined);
});

test("sanitizeState: an out-of-range/default stored timing weight is dropped", () => {
  const state = sanitizeState({
    fps: 24,
    duration_frames: 30,
    cameras: [{
      id: "camera_1",
      name: "Camera 1",
      keyframes: [
        key(0, [0, 0, 0], { timing: { weight: 1.0 } }),
        key(10, [1, 1, 1], { timing: { weight: 999 } }),
        key(20, [2, 2, 2]),
      ],
    }],
  });
  for (const k of state.cameras[0].keyframes) assert.equal(k.timing, undefined);
});
