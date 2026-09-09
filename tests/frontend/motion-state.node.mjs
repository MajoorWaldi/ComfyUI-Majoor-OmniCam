import test from "node:test";
import assert from "node:assert/strict";

import {
  MOTION_SPEED_RANGE,
  isMotionActive,
  motionClipTime,
  motionRangeIsValid,
  sanitizeMotion,
  withMotionPatch,
} from "../../web-src/assets/character/motion-state.js";

test("sanitizeMotion clamps speed, rounds frames, defaults loop, drops bad end", () => {
  const m = sanitizeMotion({ clip_id: " Walk ", start_frame: 24.6, end_frame: 12, speed: 99, offset_seconds: 0.5 });
  assert.deepEqual(m, { clip_id: "Walk", start_frame: 25, end_frame: 0, speed: MOTION_SPEED_RANGE[1], loop: true, offset_seconds: 0.5 });
  assert.equal(sanitizeMotion({ clip_id: "" }), null);
  assert.equal(sanitizeMotion(null), null);
  assert.equal(sanitizeMotion({ clip_id: "x", speed: -1 }).speed, 1);
  assert.equal(sanitizeMotion({ clip_id: "x", loop: false }).loop, false);
});

test("motionRangeIsValid rejects only an end that is <= a positive start", () => {
  assert.equal(motionRangeIsValid({ start_frame: 10, end_frame: 5 }), false);
  assert.equal(motionRangeIsValid({ start_frame: 10, end_frame: 0 }), true);
  assert.equal(motionRangeIsValid({ start_frame: 10, end_frame: 40 }), true);
});

test("isMotionActive honours the start/end window", () => {
  const m = { clip_id: "walk", start_frame: 24, end_frame: 120 };
  assert.equal(isMotionActive(m, 10), false);
  assert.equal(isMotionActive(m, 50), true);
  assert.equal(isMotionActive(m, 200), false);
  assert.equal(isMotionActive({ clip_id: "walk", start_frame: 24, end_frame: 0 }, 999), true);
});

test("motionClipTime maps a Director frame to seconds into the clip", () => {
  const fps = 24;
  const clip = 2; // 2s clip
  const m = { clip_id: "walk", start_frame: 24, speed: 1, loop: true, offset_seconds: 0 };
  assert.equal(motionClipTime(m, 12, fps, clip), 0); // before start
  assert.equal(motionClipTime(m, 24, fps, clip), 0); // at start
  assert.ok(Math.abs(motionClipTime(m, 48, fps, clip) - 1) < 1e-9); // 24 frames = 1s
  // loop wrap: 72 frames after start = 3s -> 1s into a 2s clip
  assert.ok(Math.abs(motionClipTime({ ...m }, 24 + 72, fps, clip) - 1) < 1e-9);
});

test("motionClipTime holds the last frame past end_frame when not looping", () => {
  const m = { clip_id: "walk", start_frame: 0, end_frame: 24, speed: 1, loop: false, offset_seconds: 0 };
  assert.ok(Math.abs(motionClipTime(m, 24, 24, 10) - 1) < 1e-9);
  assert.ok(Math.abs(motionClipTime(m, 999, 24, 10) - 1) < 1e-9); // clamped to end window
});

test("motionClipTime scales by speed", () => {
  const m = { clip_id: "walk", start_frame: 0, speed: 2, loop: true, offset_seconds: 0 };
  assert.ok(Math.abs(motionClipTime(m, 24, 24, 10) - 2) < 1e-9); // 1s of frames * 2x = 2s
});

test("withMotionPatch merges onto an existing motion", () => {
  const base = sanitizeMotion({ clip_id: "walk", speed: 1, loop: true });
  const patched = withMotionPatch(base, { speed: 1.5, end_frame: 60 });
  assert.equal(patched.clip_id, "walk");
  assert.equal(patched.speed, 1.5);
  assert.equal(patched.end_frame, 60);
});
