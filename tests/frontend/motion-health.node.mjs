// Parity guard for the Health panel's grading.
//
// web-src/motion-health.js re-implements omnicam/core/motion_health.py so the
// panel can grade without a server round trip. This test is the only thing
// keeping the two honest: if you change either, regenerate the golden with
// `python scripts/generate_motion_health_fixture.py` and see what moves.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { FRAME_METRICS, WARN_RATIO, motionHealthReport, problemZones } from "../../web-src/motion-health.js";
import {
  flaggedRanges, rangesForMetric, recenterKeysInRanges, retimeConstantSpeed, smoothKeysInRanges,
} from "../../web-src/motion-health/actions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const goldenPath = path.resolve(__dirname, "../fixtures/parity/motion_health.python-golden.json");
const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));

function assertClose(actual, expected, epsilon, context) {
  const delta = Math.abs(actual - expected);
  assert.ok(delta < epsilon, `${context}: JS=${actual}, Python=${expected}, delta=${delta}`);
}

test("JS <-> Python motion health parity", () => {
  assert.equal(golden.generator, "scripts/generate_motion_health_fixture.py");
  assert.ok(golden.cases.length >= 4);

  for (const parityCase of golden.cases) {
    const expected = parityCase.python_report;
    const actual = motionHealthReport(parityCase.track, parityCase.limits, null, parityCase.profile);
    const prefix = parityCase.name;

    assert.equal(actual.warn_ratio, expected.warn_ratio, `${prefix} warn_ratio`);
    assert.equal(actual.duration_frames, expected.duration_frames, `${prefix} duration_frames`);

    for (const metric of FRAME_METRICS) {
      assert.equal(actual.series[metric].length, expected.series[metric].length, `${prefix} ${metric} length`);
      for (let frame = 0; frame < expected.series[metric].length; frame++) {
        assertClose(actual.series[metric][frame], expected.series[metric][frame], golden.epsilon,
          `${prefix} ${metric}[${frame}]`);
      }
    }

    for (const key of ["max_speed", "max_angular_speed", "max_acceleration", "max_jerk", "max_fov_change"]) {
      assertClose(actual[key], expected[key], golden.epsilon, `${prefix} ${key}`);
    }

    // The grades and zones are what the panel paints, so they must match exactly.
    assert.deepEqual(actual.framing, expected.framing, `${prefix} framing`);
    assert.equal(actual.framing_loss_frames, expected.framing_loss_frames, `${prefix} framing_loss_frames`);
    assert.deepEqual(actual.frame_grades, expected.frame_grades, `${prefix} frame_grades`);
    assert.deepEqual(actual.segments, expected.segments, `${prefix} segments`);
    assert.deepEqual(actual.track_grades, expected.track_grades, `${prefix} track_grades`);
    assert.equal(actual.grade, expected.grade, `${prefix} grade`);
    assert.equal(actual.trajectory_valid, expected.trajectory_valid, `${prefix} trajectory_valid`);
    assert.deepEqual(actual.violations.map((item) => item.metric).sort(),
      expected.violations.map((item) => item.metric).sort(), `${prefix} violations`);
  }
});

test("segments tile the timeline with no gap and no overlap", () => {
  for (const parityCase of golden.cases) {
    const report = motionHealthReport(parityCase.track, parityCase.limits, null, parityCase.profile);
    assert.equal(report.segments[0].start, 0, `${parityCase.name}: first segment must start at frame 0`);
    assert.equal(report.segments.at(-1).end, report.duration_frames - 1, `${parityCase.name}: last segment must reach the end`);
    for (let index = 1; index < report.segments.length; index++) {
      assert.equal(report.segments[index].start, report.segments[index - 1].end + 1,
        `${parityCase.name}: segment ${index} must resume where the previous stopped`);
    }
  }
});

test("the warn tier sits strictly between ok and over", () => {
  const track = golden.cases.find((item) => item.name === "burst_after_idle").track;
  const peak = motionHealthReport(track, {}).max_speed;
  assert.equal(motionHealthReport(track, { max_speed: peak * 0.5 }).grade, "over");
  assert.equal(motionHealthReport(track, { max_speed: peak / WARN_RATIO * 0.99 }).grade, "warn");
  assert.equal(motionHealthReport(track, { max_speed: peak * 10 }).grade, "ok");
  // A warn is advisory: it must not invalidate the trajectory.
  assert.equal(motionHealthReport(track, { max_speed: peak / WARN_RATIO * 0.99 }).trajectory_valid, true);
});

test("no limits means nothing is graded rather than everything passing by accident", () => {
  const track = golden.cases.find((item) => item.name === "burst_after_idle").track;
  const report = motionHealthReport(track, {});
  assert.equal(report.grade, "ok");
  assert.equal(report.segments.length, 1, "an ungraded track is one uniform zone");
  assert.deepEqual(problemZones(report), []);
});

test("angular speed includes roll with a fixed view direction", () => {
  const track = {
    fps: 24, duration_frames: 2, width: 640, height: 360,
    keyframes: [
      { frame: 0, camera: { position: [0, 0, 5], target: [0, 0, 0], roll: 0 }, interpolation: "linear" },
      { frame: 1, camera: { position: [0, 0, 5], target: [0, 0, 0], roll: 90 }, interpolation: "linear" },
    ],
  };

  assertClose(motionHealthReport(track).max_angular_speed, 90 * track.fps, 1e-9, "roll angular speed");
});

test("problem zones surface the flagged ranges worst-first", () => {
  const parityCase = golden.cases.find((item) => item.name === "burst_after_idle");
  const zones = problemZones(motionHealthReport(parityCase.track, parityCase.limits));
  assert.ok(zones.length, "the burst must produce at least one zone");
  assert.ok(zones.every((zone) => zone.grade !== "ok"));
  assert.ok(zones.every((zone) => zone.metrics.length), "a flagged zone must say which metric flagged it");
  if (zones.length > 1) assert.ok(zones[0].grade === "over" || zones[1].grade !== "over");
});

// --- the three repairs -----------------------------------------------------

const BURST_KEYS = [
  { frame: 0, camera: { position: [0, 1, 5], target: [0, 1.5, 0] }, interpolation: "linear" },
  { frame: 18, camera: { position: [0.2, 1, 5], target: [0, 1.5, 0] }, interpolation: "linear" },
  { frame: 24, camera: { position: [6, 1, 5], target: [0, 1.5, 0] }, interpolation: "linear" },
];

test("constant-speed retime respaces keys by distance and keeps the shot length", () => {
  const retimed = retimeConstantSpeed(BURST_KEYS, 24);
  assert.equal(retimed.length, BURST_KEYS.length);
  assert.equal(retimed[0].frame, 0, "the first key anchors the shot");
  assert.equal(retimed.at(-1).frame, 24, "the duration must not change");
  // 0.2 of a 6.0-unit path is travelled before the middle key, so it belongs
  // near the very start of the timeline, not at frame 18.
  assert.ok(retimed[1].frame < 3, `middle key moved to ${retimed[1].frame}, expected near the start`);
  // The source array must not be mutated.
  assert.equal(BURST_KEYS[1].frame, 18);
});

test("constant-speed retime never collapses two keys onto one frame", () => {
  const clustered = [
    { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, -1] } },
    { frame: 5, camera: { position: [0, 0, 0], target: [0, 0, -1] } },
    { frame: 6, camera: { position: [0, 0, 0], target: [0, 0, -1] } },
    { frame: 20, camera: { position: [9, 0, 0], target: [0, 0, -1] } },
  ];
  const retimed = retimeConstantSpeed(clustered, 20);
  const frames = retimed.map((key) => key.frame);
  assert.deepEqual(frames, [...new Set(frames)], `keys collapsed: ${frames}`);
  for (let index = 1; index < frames.length; index++) assert.ok(frames[index] > frames[index - 1]);
});

test("a degenerate path is returned untouched rather than divided by zero", () => {
  const still = [
    { frame: 0, camera: { position: [1, 1, 1], target: [0, 0, 0] } },
    { frame: 10, camera: { position: [1, 1, 1], target: [0, 0, 0] } },
    { frame: 20, camera: { position: [1, 1, 1], target: [0, 0, 0] } },
  ];
  assert.deepEqual(retimeConstantSpeed(still, 20).map((key) => key.frame), [0, 10, 20]);
});

test("ranged smoothing moves only the keys inside a flagged range", () => {
  const smoothed = smoothKeysInRanges(BURST_KEYS, [{ start: 15, end: 24 }], 1);
  assert.deepEqual(smoothed[0].camera.position, BURST_KEYS[0].camera.position, "the first key is an anchor");
  assert.deepEqual(smoothed[2].camera.position, BURST_KEYS[2].camera.position, "the last key is an anchor");
  assert.notDeepEqual(smoothed[1].camera.position, BURST_KEYS[1].camera.position, "the in-range key must move");

  const outside = smoothKeysInRanges(BURST_KEYS, [{ start: 0, end: 5 }], 1);
  assert.deepEqual(outside[1].camera.position, BURST_KEYS[1].camera.position,
    "a key outside every flagged range must not move");
});

test("ranged recentring retargets only the keys inside a flagged range", () => {
  const recentred = recenterKeysInRanges(BURST_KEYS, [{ start: 20, end: 24 }], [1, 2, 3]);
  assert.deepEqual(recentred[2].camera.target, [1, 2, 3]);
  assert.deepEqual(recentred[0].camera.target, BURST_KEYS[0].camera.target,
    "keys outside the range keep the framing the animator authored");
  assert.deepEqual(BURST_KEYS[2].camera.target, [0, 1.5, 0], "the source array must not be mutated");
});

test("range helpers select the segments their button can actually repair", () => {
  const parityCase = golden.cases.find((item) => item.name === "subject_swings_out_of_frame");
  const report = motionHealthReport(parityCase.track, parityCase.limits);
  const framing = rangesForMetric(report, "framing_loss");
  assert.ok(framing.length, "framing loss must produce a recentrable range");
  assert.ok(flaggedRanges(report).length >= framing.length);
  // A metric nothing was flagged for yields nothing, so its button stays a no-op.
  assert.deepEqual(rangesForMetric(report, "fov_drift"), []);
});

test("fov drift never blames an individual frame", () => {
  const parityCase = golden.cases.find((item) => item.name === "static_camera_pure_zoom");
  const report = motionHealthReport(parityCase.track, parityCase.limits);
  assert.equal(report.track_grades.fov_drift, "over");
  assert.deepEqual([...new Set(report.frame_grades)], ["ok"]);
  assert.equal(report.grade, "over", "a track-level alert must still colour the whole shot");
});
