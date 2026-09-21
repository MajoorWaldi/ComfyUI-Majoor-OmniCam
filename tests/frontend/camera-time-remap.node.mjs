import assert from "node:assert/strict";
import test from "node:test";

import {
  applyCameraTimeRemap,
  applyTimingWeightPreset,
  cameraPathProgress,
} from "../../web-src/director/camera-time-remap.js";
import { cameraPathTimingWeight } from "../../web-src/director/camera-path-timing.js";

function key(frame, x, weight = null) {
  const out = {
    frame,
    camera: { position: [x, 0, 0], target: [x, 0, -1], fov: 45, roll: 0, zoom: 1 },
    interpolation: "linear",
  };
  if (weight != null) out.timing = { weight };
  return out;
}

const FIVE = [key(0, 0), key(3, 2.5), key(8, 5), key(17, 7.5), key(20, 10)];

test("path progress follows distance rather than key index", () => {
  const progress = cameraPathProgress([key(0, 0), key(5, 1), key(10, 10)]);
  assert.deepEqual(progress.map((v) => Math.round(v * 10) / 10), [0, 0.1, 1]);
});

test("zero-strength preset preserves the artist's current weights", () => {
  const source = [key(0, 0, 1.4), key(5, 5, 0.6), key(10, 10, 1.2)];
  const out = applyTimingWeightPreset(source, { preset: "ease_in", strength: 0 });
  assert.deepEqual(out.map(cameraPathTimingWeight), source.map(cameraPathTimingWeight));
});

test("zero-strength remap is a true timing no-op", () => {
  const source = [key(0, 0, 1.4), key(4, 5, 0.6), key(10, 10, 1.2)];
  const out = applyCameraTimeRemap(source, { preset: "ease_in", strength: 0 });
  assert.equal(out.ok, true);
  assert.deepEqual(out.keys.map((k) => k.frame), source.map((k) => k.frame));
});

test("constant remap spaces equal distances equally and preserves endpoints", () => {
  const out = applyCameraTimeRemap(FIVE, { preset: "constant", strength: 1 });
  assert.equal(out.ok, true);
  assert.equal(out.keys[0].frame, 0);
  assert.equal(out.keys.at(-1).frame, 20);
  assert.deepEqual(out.keys.map((k) => k.frame), [0, 5, 10, 15, 20]);
});

test("ease-in allocates more time to the beginning than constant", () => {
  const constant = applyCameraTimeRemap(FIVE, { preset: "constant", strength: 1 });
  const eased = applyCameraTimeRemap(FIVE, { preset: "ease_in", strength: 1 });
  assert.ok(eased.keys[1].frame > constant.keys[1].frame);
  assert.ok(eased.keys[3].frame > constant.keys[3].frame);
});

test("ease-out allocates more time to the end", () => {
  const constant = applyCameraTimeRemap(FIVE, { preset: "constant", strength: 1 });
  const eased = applyCameraTimeRemap(FIVE, { preset: "ease_out", strength: 1 });
  assert.ok(eased.keys[1].frame < constant.keys[1].frame);
  assert.ok(eased.keys[3].frame < constant.keys[3].frame);
});

test("custom consumes existing weights without changing camera values", () => {
  const source = [key(0, 0, 1.8), key(4, 5, 0.3), key(20, 10, 0.3)];
  const snapshot = JSON.stringify(source);
  const out = applyCameraTimeRemap(source, { preset: "custom" });
  assert.equal(out.ok, true);
  assert.equal(JSON.stringify(source), snapshot, "input must stay immutable");
  assert.deepEqual(out.keys.map((k) => k.camera.position), [[0, 0, 0], [5, 0, 0], [10, 0, 0]]);
  assert.ok(out.keys[1].frame > 10, "larger first-half weights must allocate more time there");
});

test("a non-constant two-key ramp asks for an interior timing anchor", () => {
  const out = applyCameraTimeRemap([key(0, 0), key(20, 10)], { preset: "ease_in" });
  assert.deepEqual(out, { ok: false, reason: "needs_timing_anchor" });
});

test("every successful remap keeps strictly ordered integer frames", () => {
  for (const preset of ["constant", "ease_in", "ease_out", "ease_in_out"]) {
    const out = applyCameraTimeRemap(FIVE, { preset, strength: 0.8 });
    assert.equal(out.ok, true);
    for (let i = 1; i < out.keys.length; i += 1) {
      assert.ok(Number.isInteger(out.keys[i].frame));
      assert.ok(out.keys[i].frame > out.keys[i - 1].frame);
    }
  }
});
