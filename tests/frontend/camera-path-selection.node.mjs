import test from "node:test";
import assert from "node:assert/strict";

import {
  clearPathSelection,
  createPathSelection,
  normalizePathSelection,
  selectPathKey,
  selectedPathKeys,
} from "../../web-src/director/camera-path-selection.js";

function camera(id, frames) {
  return { id, keyframes: frames.map((frame) => ({ frame, camera: { position: [frame, 0, 0], target: [frame, 0, -5] } })) };
}

test("createPathSelection starts empty", () => {
  const sel = createPathSelection();
  assert.equal(sel.cameraId, null);
  assert.equal(sel.frames.size, 0);
  assert.equal(sel.primaryFrame, null);
  assert.equal(sel.component, "position");
});

test("a plain click replaces the selection", () => {
  const first = selectPathKey(createPathSelection(), { cameraId: "camera_1", frame: 10 });
  assert.equal(first.cameraId, "camera_1");
  assert.deepEqual([...first.frames], [10]);
  assert.equal(first.primaryFrame, 10);

  const replaced = selectPathKey(first, { cameraId: "camera_1", frame: 20, additive: false });
  assert.deepEqual([...replaced.frames], [20], "a non-additive click drops the prior selection");
  assert.equal(replaced.primaryFrame, 20);
});

test("a plain click on a different camera also replaces the selection", () => {
  const first = selectPathKey(createPathSelection(), { cameraId: "camera_1", frame: 10 });
  const other = selectPathKey(first, { cameraId: "camera_2", frame: 5, additive: true });
  assert.equal(other.cameraId, "camera_2", "additive across cameras cannot span tracks");
  assert.deepEqual([...other.frames], [5]);
});

test("shift-click toggles a key into an existing same-camera selection", () => {
  const first = selectPathKey(createPathSelection(), { cameraId: "camera_1", frame: 10 });
  const both = selectPathKey(first, { cameraId: "camera_1", frame: 20, additive: true });
  assert.deepEqual([...both.frames].sort((a, b) => a - b), [10, 20]);
  assert.equal(both.primaryFrame, 20, "the newly added key becomes primary");
});

test("shift-click toggles a selected key back off", () => {
  let sel = selectPathKey(createPathSelection(), { cameraId: "camera_1", frame: 10 });
  sel = selectPathKey(sel, { cameraId: "camera_1", frame: 20, additive: true });
  sel = selectPathKey(sel, { cameraId: "camera_1", frame: 30, additive: true });
  // Toggle off the primary key; another remaining frame is promoted.
  const afterRemovePrimary = selectPathKey(sel, { cameraId: "camera_1", frame: 30, additive: true });
  assert.deepEqual([...afterRemovePrimary.frames].sort((a, b) => a - b), [10, 20]);
  assert.equal(afterRemovePrimary.primaryFrame, 20, "the highest remaining frame becomes primary");

  // Toggle off a non-primary key; primary is unaffected.
  const afterRemoveOther = selectPathKey(afterRemovePrimary, { cameraId: "camera_1", frame: 10, additive: true });
  assert.deepEqual([...afterRemoveOther.frames], [20]);
  assert.equal(afterRemoveOther.primaryFrame, 20);

  // Toggle off the last remaining key; selection becomes empty.
  const emptied = selectPathKey(afterRemoveOther, { cameraId: "camera_1", frame: 20, additive: true });
  assert.equal(emptied.frames.size, 0);
  assert.equal(emptied.primaryFrame, null);
});

test("clearPathSelection always returns a fresh, empty selection", () => {
  const sel = selectPathKey(createPathSelection(), { cameraId: "camera_1", frame: 10 });
  const cleared = clearPathSelection(sel);
  assert.equal(cleared.cameraId, null);
  assert.equal(cleared.frames.size, 0);
  assert.equal(cleared.primaryFrame, null);
});

test("normalizePathSelection clears the selection outright when the camera changed", () => {
  const sel = selectPathKey(createPathSelection(), { cameraId: "camera_1", frame: 10 });
  const normalized = normalizePathSelection(sel, camera("camera_2", [10, 20]));
  assert.equal(normalized.cameraId, null);
  assert.equal(normalized.frames.size, 0);
});

test("normalizePathSelection drops frames removed by retime/delete, keeps the rest", () => {
  let sel = selectPathKey(createPathSelection(), { cameraId: "camera_1", frame: 10 });
  sel = selectPathKey(sel, { cameraId: "camera_1", frame: 20, additive: true });
  sel = selectPathKey(sel, { cameraId: "camera_1", frame: 30, additive: true }); // primary = 30

  // Frame 30 was deleted; 10 and 20 survive.
  const afterDelete = normalizePathSelection(sel, camera("camera_1", [10, 20]));
  assert.deepEqual([...afterDelete.frames].sort((a, b) => a - b), [10, 20]);
  assert.equal(afterDelete.primaryFrame, 20, "primary re-anchors to the highest surviving frame");

  // Every selected frame is gone (e.g. retimed away): selection empties out.
  const afterFullDelete = normalizePathSelection(sel, camera("camera_1", [5, 15]));
  assert.equal(afterFullDelete.frames.size, 0);
  assert.equal(afterFullDelete.primaryFrame, null);
});

test("normalizePathSelection keeps a surviving primary frame in place", () => {
  let sel = selectPathKey(createPathSelection(), { cameraId: "camera_1", frame: 10 });
  sel = selectPathKey(sel, { cameraId: "camera_1", frame: 20, additive: true });
  sel = { ...sel, primaryFrame: 10 };
  const normalized = normalizePathSelection(sel, camera("camera_1", [10, 20]));
  assert.equal(normalized.primaryFrame, 10, "an existing valid primary frame is not disturbed");
});

test("selectedPathKeys returns the selected keyframes for the matching camera, sorted", () => {
  const cam = camera("camera_1", [30, 10, 20]);
  let sel = selectPathKey(createPathSelection(), { cameraId: "camera_1", frame: 30 });
  sel = selectPathKey(sel, { cameraId: "camera_1", frame: 10, additive: true });
  const keys = selectedPathKeys(sel, cam);
  assert.deepEqual(keys.map((key) => key.frame), [10, 30]);
});

test("selectedPathKeys returns nothing for a mismatched camera or empty selection", () => {
  const cam = camera("camera_1", [10, 20]);
  assert.deepEqual(selectedPathKeys(createPathSelection(), cam), []);
  const sel = selectPathKey(createPathSelection(), { cameraId: "camera_2", frame: 10 });
  assert.deepEqual(selectedPathKeys(sel, cam), []);
});
