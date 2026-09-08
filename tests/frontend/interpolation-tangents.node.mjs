import test from "node:test";
import assert from "node:assert/strict";

import {
  ease,
  resolveChannelHandles,
  TANGENT_MODES,
  INTERPOLATION_MODES,
} from "../../web-src/director/core.js";
import { captureBaseline, smoothKeyframes } from "../../web-src/path-smoothing.js";

test("TANGENT_MODES includes clamped", () => {
  assert.ok(TANGENT_MODES.includes("clamped"));
});

test("INTERPOLATION_MODES includes sine, cubic, quintic, expo, and back", () => {
  for (const mode of ["sine", "cubic", "quintic", "expo", "back"]) {
    assert.ok(INTERPOLATION_MODES.includes(mode), `Missing ${mode} in INTERPOLATION_MODES`);
    assert.ok(INTERPOLATION_MODES.includes(`ease_${mode}`), `Missing ease_${mode} in INTERPOLATION_MODES`);
  }
});

test("clamped tangent mode enforces monotonicity and prevents overshoot", () => {
  const getVal = (k) => k.val;

  // 1. Peak / valley (extrema): slopes opposite sign -> slope must be 0
  const kPrev = { frame: 0, val: 0 };
  const kCur = { frame: 10, val: 10, tangents: { channels: { val: { mode: "clamped" } } } };
  const kNext = { frame: 20, val: 5 };

  const peakHandles = resolveChannelHandles(kCur, "val", kPrev, kNext, getVal);
  assert.equal(peakHandles.out_y, 0);
  assert.equal(peakHandles.in_y, 0);

  // 2. Steep to shallow slope: Fritsch-Carlson bound 3 * min(|dPrev|, |dNext|)
  const kShallowNext = { frame: 20, val: 10.1 }; // dPrev = 1.0, dNext = 0.01
  const steepHandles = resolveChannelHandles(kCur, "val", kPrev, kShallowNext, getVal);
  const nextSpan = 10;
  const slope = steepHandles.out_y / (nextSpan * (1 / 3));
  assert.ok(slope <= 0.03 + 1e-6, `Slope ${slope} must be <= 3 * 0.01`);
  assert.ok(slope >= 0, "Slope must remain positive");
});

test("new easing functions adhere to boundary conditions [0, 1]", () => {
  const modes = ["sine", "cubic", "quintic", "expo", "back"];
  for (const mode of modes) {
    assert.equal(ease(0, mode), 0, `${mode} at 0`);
    assert.equal(ease(1, mode), 1, `${mode} at 1`);

    // Aliases
    assert.equal(ease(0, `ease_${mode}`), 0, `ease_${mode} at 0`);
    assert.equal(ease(1, `ease_${mode}`), 1, `ease_${mode} at 1`);

    // Midpoint check
    const mid = ease(0.5, mode);
    assert.ok(mid > 0 && mid < 1.5, `${mode} at 0.5 is sensible`);
  }
});

test("smoothKeyframes smooths fov, zoom, and roll with shortest-arc wrapping", () => {
  const keys = [
    { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, 0], fov: 30, zoom: 1, roll: 170 } },
    { frame: 10, camera: { position: [0, 0, 0], target: [0, 0, 0], fov: 60, zoom: 2, roll: -175 } },
    { frame: 20, camera: { position: [0, 0, 0], target: [0, 0, 0], fov: 30, zoom: 1, roll: -170 } },
  ];

  const smoothed = smoothKeyframes(keys, 1);
  const mid = smoothed[1].camera;

  // fov and zoom spikes averaged down
  assert.ok(mid.fov < 60, `fov was ${mid.fov}, expected < 60`);
  assert.ok(mid.zoom < 2, `zoom was ${mid.zoom}, expected < 2`);

  // Shortest arc wrapping across ±180° boundary:
  // 170° and -170° are only 20° apart across 180°.
  // The average must stay near ±180°, NEVER flip through 0°!
  assert.ok(Math.abs(mid.roll) > 160, `roll was ${mid.roll}, expected close to ±180°`);
});

test("smoothKeyframes smooths object transforms (position, rotation, size)", () => {
  const objectKeys = [
    { frame: 0, position: [0, 0, 0], rotation: [0, 170, 0], size: [1, 1, 1] },
    { frame: 10, position: [0, 10, 0], rotation: [0, -175, 0], size: [2, 5, 2] },
    { frame: 20, position: [0, 0, 0], rotation: [0, -170, 0], size: [1, 1, 1] },
  ];

  const smoothed = smoothKeyframes(objectKeys, 1);
  const mid = smoothed[1];

  // Position and size averaged
  assert.ok(mid.position[1] < 10, `position[1] was ${mid.position[1]}`);
  assert.ok(mid.size[1] < 5, `size[1] was ${mid.size[1]}`);

  // Rotation[1] wrapped across 180°
  assert.ok(Math.abs(mid.rotation[1]) > 160, `rotation[1] was ${mid.rotation[1]}`);
});
