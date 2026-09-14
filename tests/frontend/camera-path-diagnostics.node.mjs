import test from "node:test";
import assert from "node:assert/strict";

import {
  analyzeCameraPath,
  cameraPathSegmentSpeeds,
} from "../../web-src/director/camera-path-diagnostics.js";

function key(frame, position) {
  return {
    frame,
    interpolation: "smooth",
    camera: { position: [...position], target: [position[0], position[1], position[2] - 5], fov: 35, roll: 0, camera_type: "perspective" },
  };
}

function codesOf(issues) {
  return issues.map((issue) => issue.code);
}

// --- derived speed -----------------------------------------------------------

test("cameraPathSegmentSpeeds: equal distance and equal frame gaps give equal speed", () => {
  const keys = [key(0, [0, 0, 0]), key(10, [1, 0, 0]), key(20, [2, 0, 0])];
  const segments = cameraPathSegmentSpeeds(keys, 24);
  assert.equal(segments.length, 2);
  assert.ok(Math.abs(segments[0].speed - segments[1].speed) < 1e-9);
  // speed = distance / (frames / fps) = 1 / (10/24) = 2.4
  assert.ok(Math.abs(segments[0].speed - 2.4) < 1e-9);
});

test("cameraPathSegmentSpeeds: a longer segment over the same frame gap is faster", () => {
  const keys = [key(0, [0, 0, 0]), key(10, [1, 0, 0]), key(20, [3, 0, 0])];
  const segments = cameraPathSegmentSpeeds(keys, 24);
  assert.ok(segments[1].speed > segments[0].speed);
});

// --- SPEED_SPIKE ---------------------------------------------------------

test("SPEED_SPIKE: one segment moving much faster than the path average is flagged", () => {
  const keys = [key(0, [0, 0, 0]), key(24, [1, 0, 0]), key(48, [1.1, 0, 0]), key(72, [20, 0, 0]), key(96, [20.1, 0, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  const spikes = issues.filter((issue) => issue.code === "SPEED_SPIKE");
  assert.equal(spikes.length, 1);
  assert.equal(spikes[0].frameStart, 48);
  assert.equal(spikes[0].frameEnd, 72);
});

test("SPEED_SPIKE: a smoothly paced path reports no spikes", () => {
  const keys = [key(0, [0, 0, 0]), key(24, [1, 0, 0]), key(48, [2, 0, 0]), key(72, [3, 0, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  assert.equal(codesOf(issues).includes("SPEED_SPIKE"), false);
});

// --- STATIC_SEGMENT ------------------------------------------------------

test("STATIC_SEGMENT: a long hold with no movement is flagged", () => {
  const keys = [key(0, [0, 0, 0]), key(48, [0, 0, 0]), key(96, [5, 0, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  const statics = issues.filter((issue) => issue.code === "STATIC_SEGMENT");
  assert.equal(statics.length, 1);
  assert.equal(statics[0].frameStart, 0);
  assert.equal(statics[0].frameEnd, 48);
});

test("STATIC_SEGMENT: a brief pause is not flagged as static (too short to matter)", () => {
  const keys = [key(0, [0, 0, 0]), key(2, [0, 0, 0]), key(48, [5, 0, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  assert.equal(codesOf(issues).includes("STATIC_SEGMENT"), false);
});

// --- NEAR_ZERO_DURATION ----------------------------------------------------

test("NEAR_ZERO_DURATION: two keys one frame apart at a high fps is flagged", () => {
  const keys = [key(0, [0, 0, 0]), key(1, [1, 0, 0]), key(48, [5, 0, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  const nearZero = issues.filter((issue) => issue.code === "NEAR_ZERO_DURATION");
  assert.equal(nearZero.length, 1);
  assert.equal(nearZero[0].frameStart, 0);
  assert.equal(nearZero[0].frameEnd, 1);
});

test("NEAR_ZERO_DURATION: a normally paced segment is not flagged", () => {
  const keys = [key(0, [0, 0, 0]), key(12, [1, 0, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  assert.equal(codesOf(issues).includes("NEAR_ZERO_DURATION"), false);
});

// --- HARD_DIRECTION_CHANGE ---------------------------------------------------

test("HARD_DIRECTION_CHANGE: the path folding back on itself is flagged at the fold key", () => {
  const keys = [key(0, [0, 0, 0]), key(24, [5, 0, 0]), key(48, [0, 0, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  const folds = issues.filter((issue) => issue.code === "HARD_DIRECTION_CHANGE");
  assert.equal(folds.length, 1);
  assert.equal(folds[0].frameStart, 0);
  assert.equal(folds[0].frameEnd, 48);
});

test("HARD_DIRECTION_CHANGE: a gentle curve is not flagged", () => {
  const keys = [key(0, [0, 0, 0]), key(24, [5, 0, 0]), key(48, [10, 1, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  assert.equal(codesOf(issues).includes("HARD_DIRECTION_CHANGE"), false);
});

// --- ORBIT_NOT_CLOSED --------------------------------------------------------

test("ORBIT_NOT_CLOSED: a near-full orbit that stops just short of its start is flagged", () => {
  const keys = [
    key(0, [5, 1, 0]),
    key(24, [0, 1, 5]),
    key(48, [-5, 1, 0]),
    key(72, [0, 1, -5]),
    key(96, [4.8, 1, 0.5]), // close to the start angle, but not exactly there
  ];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  assert.ok(codesOf(issues).includes("ORBIT_NOT_CLOSED"));
});

test("ORBIT_NOT_CLOSED: an orbit that actually closes is not flagged", () => {
  const keys = [
    key(0, [5, 1, 0]),
    key(24, [0, 1, 5]),
    key(48, [-5, 1, 0]),
    key(72, [0, 1, -5]),
    key(96, [5, 1, 0]),
  ];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  assert.equal(codesOf(issues).includes("ORBIT_NOT_CLOSED"), false);
});

test("ORBIT_NOT_CLOSED: a straight, non-orbiting path is not flagged", () => {
  const keys = [key(0, [0, 0, 0]), key(24, [1, 0, 0]), key(48, [2, 0, 0]), key(72, [3, 0, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  assert.equal(codesOf(issues).includes("ORBIT_NOT_CLOSED"), false);
});

// --- CAMERA_NEAR_OBJECT (simple sphere-proxy intersection) -------------------

test("CAMERA_NEAR_OBJECT: a key that passes inside an object's proxy radius is flagged", () => {
  const keys = [key(0, [0, 0, 0]), key(24, [10, 0, 0])];
  const objects = [{ id: "sofa_1", name: "Sofa", position: [10, 0, 0.1], radius: 1 }];
  const issues = analyzeCameraPath({ keys, fps: 24, objects });
  const near = issues.filter((issue) => issue.code === "CAMERA_NEAR_OBJECT");
  assert.equal(near.length, 1);
  assert.equal(near[0].frameStart, 24);
  assert.match(near[0].message, /Sofa/);
});

test("CAMERA_NEAR_OBJECT: an object far from every key is not flagged", () => {
  const keys = [key(0, [0, 0, 0]), key(24, [1, 0, 0])];
  const objects = [{ id: "far_1", name: "Far Away", position: [100, 0, 0], radius: 1 }];
  const issues = analyzeCameraPath({ keys, fps: 24, objects });
  assert.equal(codesOf(issues).includes("CAMERA_NEAR_OBJECT"), false);
});

test("CAMERA_NEAR_OBJECT: objects without a usable position are ignored, not thrown on", () => {
  const keys = [key(0, [0, 0, 0]), key(24, [1, 0, 0])];
  const objects = [null, {}, { id: "bad" }];
  assert.doesNotThrow(() => analyzeCameraPath({ keys, fps: 24, objects }));
});

// --- general -------------------------------------------------------------

test("fewer than two keys: no issues, no throw", () => {
  assert.deepEqual(analyzeCameraPath({ keys: [] }), []);
  assert.deepEqual(analyzeCameraPath({ keys: [key(0, [0, 0, 0])] }), []);
  assert.deepEqual(analyzeCameraPath({}), []);
});

test("issues are sorted by frameStart", () => {
  const keys = [key(0, [0, 0, 0]), key(1, [1, 0, 0]), key(48, [1, 0, 0]), key(96, [1.01, 0, 0])];
  const issues = analyzeCameraPath({ keys, fps: 24 });
  const starts = issues.map((issue) => issue.frameStart);
  const sorted = [...starts].sort((a, b) => a - b);
  assert.deepEqual(starts, sorted);
});

test("never mutates the input keys", () => {
  const keys = [key(0, [0, 0, 0]), key(1, [1, 0, 0]), key(48, [1, 0, 0])];
  const snapshot = JSON.parse(JSON.stringify(keys));
  analyzeCameraPath({ keys, fps: 24, objects: [{ position: [0, 0, 0], radius: 1 }] });
  assert.deepEqual(keys, snapshot);
});
