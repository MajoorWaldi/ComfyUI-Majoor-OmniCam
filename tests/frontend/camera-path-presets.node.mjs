import test from "node:test";
import assert from "node:assert/strict";

import { createCameraPathPreset, CAMERA_PATH_PRESET_TYPES } from "../../web-src/director/camera-path-presets.js";

function baseCamera() {
  // Looking straight down -Z from (0,1,5) at (0,1,0): forward = [0,0,-1],
  // right = [1,0,0], up = [0,1,0] -- a convenient axis-aligned basis so
  // every generator's output can be checked by hand.
  return {
    position: [0, 1, 5],
    target: [0, 1, 0],
    fov: 35,
    roll: 0,
    zoom: 1,
    near: 0.01,
    far: 10000,
    camera_type: "perspective",
  };
}

function close(a, b, eps = 1e-4) {
  return Math.abs(a - b) < eps;
}
function closeVec(a, b, eps = 1e-4) {
  return a.every((v, i) => close(v, b[i], eps));
}

// --- static ------------------------------------------------------------------

test("static: two identical keys at the camera's own pose, at the range endpoints", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "static", camera, startFrame: 10, endFrame: 40 });
  assert.equal(result.ok, true);
  assert.equal(result.keyframes.length, 2);
  assert.equal(result.keyframes[0].frame, 10);
  assert.equal(result.keyframes[1].frame, 40);
  for (const key of result.keyframes) {
    assert.deepEqual(key.camera.position, camera.position);
    assert.deepEqual(key.camera.target, camera.target);
  }
});

// --- dolly ---------------------------------------------------------------

test("dolly_in: moves the camera toward the target along the view axis; target is preserved", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "dolly_in", camera, startFrame: 0, endFrame: 10, params: { distance: 2 } });
  assert.equal(result.ok, true);
  const [first, last] = result.keyframes;
  assert.deepEqual(first.camera.position, [0, 1, 5]);
  assert.ok(closeVec(last.camera.position, [0, 1, 3]), `expected [0,1,3], got ${last.camera.position}`);
  assert.deepEqual(first.camera.target, [0, 1, 0]);
  assert.deepEqual(last.camera.target, [0, 1, 0]);
});

test("dolly_out: moves the camera away from the target; target is preserved", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "dolly_out", camera, startFrame: 0, endFrame: 10, params: { distance: 2 } });
  assert.equal(result.ok, true);
  const [first, last] = result.keyframes;
  assert.ok(closeVec(last.camera.position, [0, 1, 7]), `expected [0,1,7], got ${last.camera.position}`);
  assert.deepEqual(last.camera.target, [0, 1, 0]);
});

// --- truck -----------------------------------------------------------------

test("truck_right/truck_left: camera and target slide together along the right axis", () => {
  const camera = baseCamera();
  const right = createCameraPathPreset({ type: "truck_right", camera, startFrame: 0, endFrame: 10, params: { distance: 1 } });
  assert.ok(closeVec(right.keyframes[1].camera.position, [1, 1, 5]));
  assert.ok(closeVec(right.keyframes[1].camera.target, [1, 1, 0]));

  const left = createCameraPathPreset({ type: "truck_left", camera, startFrame: 0, endFrame: 10, params: { distance: 1 } });
  assert.ok(closeVec(left.keyframes[1].camera.position, [-1, 1, 5]));
  assert.ok(closeVec(left.keyframes[1].camera.target, [-1, 1, 0]));
});

// --- pedestal / crane: world-axis distinction -------------------------------

test("pedestal_up/down: camera AND target translate together along world Y (look angle unchanged)", () => {
  const camera = baseCamera();
  const up = createCameraPathPreset({ type: "pedestal_up", camera, startFrame: 0, endFrame: 10, params: { distance: 1 } });
  assert.ok(closeVec(up.keyframes[1].camera.position, [0, 2, 5]));
  assert.ok(closeVec(up.keyframes[1].camera.target, [0, 2, 0]));

  const down = createCameraPathPreset({ type: "pedestal_down", camera, startFrame: 0, endFrame: 10, params: { distance: 1 } });
  assert.ok(closeVec(down.keyframes[1].camera.position, [0, 0, 5]));
  assert.ok(closeVec(down.keyframes[1].camera.target, [0, 0, 0]));
});

test("crane_up/down: only the camera translates along world Y; the target stays fixed (look angle tilts)", () => {
  const camera = baseCamera();
  const up = createCameraPathPreset({ type: "crane_up", camera, startFrame: 0, endFrame: 10, params: { distance: 1 } });
  assert.ok(closeVec(up.keyframes[1].camera.position, [0, 2, 5]));
  assert.deepEqual(up.keyframes[1].camera.target, [0, 1, 0]);

  const down = createCameraPathPreset({ type: "crane_down", camera, startFrame: 0, endFrame: 10, params: { distance: 1 } });
  assert.ok(closeVec(down.keyframes[1].camera.position, [0, 0, 5]));
  assert.deepEqual(down.keyframes[1].camera.target, [0, 1, 0]);
});

// --- arc ---------------------------------------------------------------------

test("arc_left/arc_right: partial orbit in opposite directions around the fixed target", () => {
  const camera = baseCamera();
  const left = createCameraPathPreset({ type: "arc_left", camera, startFrame: 0, endFrame: 40, params: { degrees: 45, samples: 5 } });
  assert.equal(left.ok, true);
  const leftEnd = left.keyframes[left.keyframes.length - 1].camera.position;
  assert.ok(closeVec(leftEnd, [-Math.SQRT1_2 * 5, 1, Math.SQRT1_2 * 5], 1e-3), `arc_left end: ${leftEnd}`);

  const right = createCameraPathPreset({ type: "arc_right", camera, startFrame: 0, endFrame: 40, params: { degrees: 45, samples: 5 } });
  const rightEnd = right.keyframes[right.keyframes.length - 1].camera.position;
  assert.ok(closeVec(rightEnd, [Math.SQRT1_2 * 5, 1, Math.SQRT1_2 * 5], 1e-3), `arc_right end: ${rightEnd}`);

  // Every sample keeps looking at the same fixed target.
  for (const key of [...left.keyframes, ...right.keyframes]) assert.deepEqual(key.camera.target, [0, 1, 0]);
});

// --- orbit: radius / degrees / direction ------------------------------------

test("orbit: a 180 degree orbit ends directly opposite the start, same radius", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "orbit", camera, startFrame: 0, endFrame: 40, params: { degrees: 180, direction: "cw", samples: 5 } });
  assert.equal(result.ok, true);
  const first = result.keyframes[0].camera.position;
  const last = result.keyframes[result.keyframes.length - 1].camera.position;
  assert.ok(closeVec(first, [0, 1, 5]));
  assert.ok(closeVec(last, [0, 1, -5]), `expected [0,1,-5], got ${last}`);
});

test("orbit: direction flips which way the camera travels", () => {
  const camera = baseCamera();
  const cw = createCameraPathPreset({ type: "orbit", camera, startFrame: 0, endFrame: 40, params: { degrees: 90, direction: "cw", samples: 3 } });
  const ccw = createCameraPathPreset({ type: "orbit", camera, startFrame: 0, endFrame: 40, params: { degrees: 90, direction: "ccw", samples: 3 } });
  const cwEnd = cw.keyframes[cw.keyframes.length - 1].camera.position;
  const ccwEnd = ccw.keyframes[ccw.keyframes.length - 1].camera.position;
  assert.ok(closeVec(cwEnd, [5, 1, 0]), `cw end: ${cwEnd}`);
  assert.ok(closeVec(ccwEnd, [-5, 1, 0]), `ccw end: ${ccwEnd}`);
});

test("orbit: an explicit radius overrides the camera's current distance to the target", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "orbit", camera, startFrame: 0, endFrame: 40, params: { degrees: 0, radius: 10, samples: 2 } });
  assert.equal(result.ok, true);
  const first = result.keyframes[0].camera.position;
  assert.ok(closeVec(first, [0, 1, 10]), `expected radius 10, got ${first}`);
});

test("orbit: heightOffset raises every sample by a constant amount", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "orbit", camera, startFrame: 0, endFrame: 40, params: { degrees: 90, heightOffset: 3, samples: 3 } });
  for (const key of result.keyframes) assert.ok(close(key.camera.position[1], 4));
});

// --- spiral ------------------------------------------------------------------

test("spiral: radius ramps from the start radius to radiusEnd while orbiting", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "spiral", camera, startFrame: 0, endFrame: 40, params: { degrees: 90, radiusEnd: 1, samples: 3 } });
  assert.equal(result.ok, true);
  const radii = result.keyframes.map((key) => Math.hypot(key.camera.position[0], key.camera.position[2]));
  assert.ok(close(radii[0], 5));
  assert.ok(close(radii[radii.length - 1], 1));
});

// --- frame placement / refusals ----------------------------------------------

test("frames are placed across the requested range, strictly increasing, endpoints exact", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "orbit", camera, startFrame: 5, endFrame: 45, params: { samples: 5 } });
  const frames = result.keyframes.map((k) => k.frame);
  assert.equal(frames[0], 5);
  assert.equal(frames[frames.length - 1], 45);
  for (let i = 1; i < frames.length; i += 1) assert.ok(frames[i] > frames[i - 1]);
});

test("refuses an unknown preset type", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "not_a_real_preset", camera, startFrame: 0, endFrame: 10 });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "unknown_preset");
});

test("refuses an invalid camera", () => {
  const result = createCameraPathPreset({ type: "static", camera: {}, startFrame: 0, endFrame: 10 });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid_camera");
});

test("refuses an invalid frame range", () => {
  const camera = baseCamera();
  assert.equal(createCameraPathPreset({ type: "static", camera, startFrame: 10, endFrame: 5 }).ok, false);
  assert.equal(createCameraPathPreset({ type: "static", camera, startFrame: NaN, endFrame: 10 }).ok, false);
});

test("refuses when the range has fewer integer frame slots than samples", () => {
  const camera = baseCamera();
  const result = createCameraPathPreset({ type: "orbit", camera, startFrame: 0, endFrame: 2, params: { samples: 5 } });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "insufficient_frame_slots");
});

test("every preset type is generator-complete (produces a valid result on the default camera)", () => {
  const camera = baseCamera();
  for (const type of CAMERA_PATH_PRESET_TYPES) {
    const result = createCameraPathPreset({ type, camera, startFrame: 0, endFrame: 60 });
    assert.equal(result.ok, true, `${type} should succeed`);
    assert.ok(result.keyframes.length >= 2, `${type} should produce at least 2 keys`);
  }
});
