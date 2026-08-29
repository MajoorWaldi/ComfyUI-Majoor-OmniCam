import test from "node:test";
import assert from "node:assert/strict";

import {
  SEQUENCE_TARGET, autoSequenceCuts, cutAtFrame, nextCameraId, removeCut, sanitizeSequence,
  sequenceActive, sequenceCameraIds, sequenceCuts, splitCutAtFrame, trimCutStart,
} from "../../web-src/director/sequence.js";
import { sanitizeState } from "../../web-src/director/core.js";
import { playblastCameraTrack } from "../../web-src/state-sync.js";

const CAMS = ["cam_a", "cam_b", "cam_c"];

function editState(cuts, durationFrames = 150) {
  return { duration_frames: durationFrames, sequence: { enabled: true, cuts, recording_path: "" } };
}

test("cuts partition the timeline with no gap and no overlap", () => {
  const resolved = sequenceCuts(editState([
    { camera_id: "cam_a", start: 0 }, { camera_id: "cam_b", start: 51 }, { camera_id: "cam_c", start: 91 },
  ]));
  assert.deepEqual(resolved, [
    { camera_id: "cam_a", start: 0, end: 50 },
    { camera_id: "cam_b", start: 51, end: 90 },
    { camera_id: "cam_c", start: 91, end: 149 },
  ]);
  // Every frame belongs to exactly one shot.
  for (let frame = 0; frame <= 149; frame++) {
    const owners = resolved.filter((cut) => frame >= cut.start && frame <= cut.end);
    assert.equal(owners.length, 1, `frame ${frame} must have exactly one shot`);
  }
});

test("sanitize sorts, dedupes, drops unknown cameras and gives frame 0 an owner", () => {
  const sequence = sanitizeSequence({
    enabled: true,
    cuts: [
      { camera_id: "cam_c", start: 91 },
      { camera_id: "ghost", start: 20 },
      { camera_id: "cam_b", start: 51 },
      { camera_id: "cam_a", start: 51 },
      { camera_id: "cam_a", start: 10 },
    ],
  }, CAMS);
  assert.deepEqual(sequence.cuts, [
    { camera_id: "cam_a", start: 0 },
    { camera_id: "cam_b", start: 51 },
    { camera_id: "cam_c", start: 91 },
  ]);
});

test("the edit only counts as enabled once it has a shot", () => {
  assert.equal(sanitizeSequence({ enabled: true, cuts: [] }, CAMS).enabled, false);
  assert.equal(sequenceActive(editState([])), false);
  assert.equal(sequenceActive(editState([{ camera_id: "cam_a", start: 0 }])), true);
});

// Same rule as keyframes: shortening a shot must not destroy anything.
test("a shortened timeline hides cuts past the end without deleting them", () => {
  const cuts = [{ camera_id: "cam_a", start: 0 }, { camera_id: "cam_b", start: 80 }, { camera_id: "cam_c", start: 140 }];
  const shortened = editState(cuts, 100);
  assert.deepEqual(sequenceCuts(shortened).map((cut) => cut.camera_id), ["cam_a", "cam_b"]);
  assert.equal(sequenceCuts(shortened).at(-1).end, 99, "the last visible shot runs to the new end");
  // The data is untouched, so lengthening brings the third shot back.
  assert.equal(shortened.sequence.cuts.length, 3);
  assert.deepEqual(sequenceCuts(editState(cuts, 200)).map((cut) => cut.camera_id), CAMS);
  // And a round-trip through sanitize keeps it too.
  assert.equal(sanitizeSequence({ enabled: true, cuts }, CAMS).cuts.length, 3);
});

test("cutAtFrame answers on both sides of every boundary", () => {
  const state = editState([{ camera_id: "cam_a", start: 0 }, { camera_id: "cam_b", start: 51 }]);
  assert.equal(cutAtFrame(state, 0).camera_id, "cam_a");
  assert.equal(cutAtFrame(state, 50).camera_id, "cam_a");
  assert.equal(cutAtFrame(state, 51).camera_id, "cam_b");
  assert.equal(cutAtFrame(state, 149).camera_id, "cam_b");
  assert.equal(cutAtFrame(editState([]), 10), null);
});

test("trimming a boundary stays strictly between its neighbours", () => {
  const state = editState([{ camera_id: "cam_a", start: 0 }, { camera_id: "cam_b", start: 51 }, { camera_id: "cam_c", start: 91 }]);
  assert.equal(trimCutStart(state, 1, 70), true);
  assert.equal(state.sequence.cuts[1].start, 70);
  trimCutStart(state, 1, -50);
  assert.equal(state.sequence.cuts[1].start, 1, "cannot swallow the first shot");
  trimCutStart(state, 1, 999);
  assert.equal(state.sequence.cuts[1].start, 90, "cannot swallow the next shot");
  assert.equal(trimCutStart(state, 0, 10), false, "the first shot has no boundary to drag");
});

test("splitting adds a shot at the playhead and never duplicates a boundary", () => {
  const state = editState([{ camera_id: "cam_a", start: 0 }]);
  assert.equal(splitCutAtFrame(state, 60, "cam_b"), true);
  assert.deepEqual(sequenceCuts(state), [
    { camera_id: "cam_a", start: 0, end: 59 },
    { camera_id: "cam_b", start: 60, end: 149 },
  ]);
  assert.equal(splitCutAtFrame(state, 60, "cam_c"), false, "a boundary already exists there");
  assert.equal(splitCutAtFrame(state, 0, "cam_c"), false, "frame 0 is not a cut");
});

// A split that keeps the same camera on both halves is invisible, so it reads
// as broken -- which is exactly the "pas de split" the audit reported. With no
// camera named, the new half takes the next camera in the project.
test("split with no camera named hands the new half the next camera", () => {
  const state = {
    duration_frames: 120,
    cameras: [{ id: "cam_a" }, { id: "cam_b" }, { id: "cam_c" }],
    sequence: { enabled: true, cuts: [{ camera_id: "cam_a", start: 0 }], recording_path: "" },
  };
  assert.equal(splitCutAtFrame(state, 40, null), true);
  assert.deepEqual(sequenceCuts(state).map((cut) => cut.camera_id), ["cam_a", "cam_b"]);
  assert.equal(splitCutAtFrame(state, 80, null), true);
  assert.deepEqual(sequenceCuts(state).map((cut) => cut.camera_id), ["cam_a", "cam_b", "cam_c"]);
  // Wraps around past the end of the camera list.
  assert.equal(nextCameraId(state, "cam_c"), "cam_a");
});

test("removing a shot hands its range to the previous one, and the last shot stays", () => {
  const state = editState([{ camera_id: "cam_a", start: 0 }, { camera_id: "cam_b", start: 51 }, { camera_id: "cam_c", start: 91 }]);
  assert.equal(removeCut(state, 1), true);
  assert.deepEqual(sequenceCuts(state), [
    { camera_id: "cam_a", start: 0, end: 90 },
    { camera_id: "cam_c", start: 91, end: 149 },
  ]);
  removeCut(state, 1);
  assert.equal(removeCut(state, 0), false, "the edit always keeps at least one shot");
});

test("auto-split gives every camera a slice starting at zero", () => {
  const cuts = autoSequenceCuts({ duration_frames: 90, cameras: [{ id: "cam_a" }, { id: "cam_b" }, { id: "cam_c" }] });
  assert.deepEqual(cuts, [
    { camera_id: "cam_a", start: 0 }, { camera_id: "cam_b", start: 30 }, { camera_id: "cam_c", start: 60 },
  ]);
  // More cameras than frames cannot each get one: the extras are dropped, not stacked.
  const cramped = autoSequenceCuts({ duration_frames: 2, cameras: [{ id: "a" }, { id: "b" }, { id: "c" }] });
  assert.equal(new Set(cramped.map((cut) => cut.start)).size, cramped.length);
});

test("sequenceCameraIds lists the cameras used, in order, without repeats", () => {
  const state = editState([
    { camera_id: "cam_a", start: 0 }, { camera_id: "cam_b", start: 40 }, { camera_id: "cam_a", start: 80 },
  ]);
  assert.deepEqual(sequenceCameraIds(state), ["cam_a", "cam_b"]);
});

// The whole feature rests on this: every recording path funnels through
// playblastCameraTrack(), so following the cuts here is what makes the playblast
// record the edit rather than a single camera.
test("the playblast target follows the cuts frame by frame in sequence mode", () => {
  const state = sanitizeState({
    duration_frames: 150,
    cameras: [{ id: "cam_a", name: "A" }, { id: "cam_b", name: "B" }],
    active_camera_id: "cam_a",
    playblast_camera_id: SEQUENCE_TARGET,
    sequence: { enabled: true, cuts: [{ camera_id: "cam_a", start: 0 }, { camera_id: "cam_b", start: 51 }] },
  });
  const ui = { state, frame: 0 };
  assert.equal(playblastCameraTrack(ui).id, "cam_a");
  ui.frame = 50;
  assert.equal(playblastCameraTrack(ui).id, "cam_a");
  ui.frame = 51;
  assert.equal(playblastCameraTrack(ui).id, "cam_b");
  ui.frame = 149;
  assert.equal(playblastCameraTrack(ui).id, "cam_b");
});

test("a single-camera playblast target is unaffected by the edit", () => {
  const state = sanitizeState({
    duration_frames: 150,
    cameras: [{ id: "cam_a", name: "A" }, { id: "cam_b", name: "B" }],
    active_camera_id: "cam_a",
    playblast_camera_id: "cam_b",
    sequence: { enabled: true, cuts: [{ camera_id: "cam_a", start: 0 }, { camera_id: "cam_b", start: 51 }] },
  });
  for (const frame of [0, 50, 51, 149]) {
    assert.equal(playblastCameraTrack({ state, frame }).id, "cam_b");
  }
});

test("the sequence target is refused by sanitizeState until the edit has shots", () => {
  const withoutCuts = sanitizeState({
    cameras: [{ id: "cam_a", name: "A" }], active_camera_id: "cam_a",
    playblast_camera_id: SEQUENCE_TARGET, sequence: { enabled: true, cuts: [] },
  });
  assert.equal(withoutCuts.playblast_camera_id, "cam_a");
  const withCuts = sanitizeState({
    cameras: [{ id: "cam_a", name: "A" }], active_camera_id: "cam_a",
    playblast_camera_id: SEQUENCE_TARGET, sequence: { enabled: true, cuts: [{ camera_id: "cam_a", start: 0 }] },
  });
  assert.equal(withCuts.playblast_camera_id, SEQUENCE_TARGET);
});
