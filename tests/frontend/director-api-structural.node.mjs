import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorTransaction } from "../../web-src/director-api/transaction.js";

function makeUi() {
  return {
    state: sanitizeState(defaultState()),
    frame: 0,
    checkpoints: [],
    serializeCount: 0,
    checkpoint(label) { this.checkpoints.push(label); },
    serialize() { this.serializeCount += 1; },
    refreshObjects() {},
    refreshKeys() {},
    refreshInspector() {},
  };
}

const tx = (overrides = {}) => ({
  version: 1,
  id: `tx_${Math.random().toString(36).slice(2)}`,
  description: "test",
  operations: [],
  ...overrides,
});

// -- camera structural operations --------------------------------------------

test("camera.create adds a camera with a deterministic id and one keyframe", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.create", name: "Low angle" }],
  }));
  assert.equal(result.ok, true);
  const cameraId = result.outcomes[0].cameraId;
  const camera = ui.state.cameras.find((c) => c.id === cameraId);
  assert.ok(camera);
  assert.equal(camera.name, "Low angle");
  assert.equal(camera.keyframes.length, 1);
});

test("camera.create honours a requested id and rejects a duplicate", () => {
  const ui = makeUi();
  const first = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.create", id: "camera_low" }],
  }));
  assert.equal(first.outcomes[0].cameraId, "camera_low");

  const second = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.create", id: "camera_low" }],
  }));
  assert.equal(second.ok, false);
  assert.equal(second.error.code, "DUPLICATE_ID");
});

test("camera.duplicate clones an existing camera under a new id", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.duplicate", cameraId: "camera_1" }],
  }));
  assert.equal(result.ok, true);
  assert.equal(ui.state.cameras.length, 2);
});

test("camera.delete refuses to remove the only camera", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.delete", cameraId: "camera_1" }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "LAST_CAMERA");
});

test("camera.delete refuses a locked camera", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx({ operations: [{ type: "camera.duplicate", cameraId: "camera_1", id: "camera_2" }] }));
  ui.state.cameras.find((c) => c.id === "camera_1").locked = true;
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.delete", cameraId: "camera_1" }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "ENTITY_LOCKED");
});

test("camera.delete refuses a camera referenced by a cut", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx({ operations: [{ type: "camera.duplicate", cameraId: "camera_1", id: "camera_2" }] }));
  executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.upsert", start: 0, cameraId: "camera_1" }] }));
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.delete", cameraId: "camera_1" }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "CAMERA_IN_USE");
});

test("camera.delete succeeds and repoints active/playblast camera ids", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx({ operations: [{ type: "camera.duplicate", cameraId: "camera_1", id: "camera_2" }] }));
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.delete", cameraId: "camera_1" }],
  }));
  assert.equal(result.ok, true);
  assert.equal(ui.state.cameras.length, 1);
  assert.equal(ui.state.active_camera_id, "camera_2");
});

test("camera.set_playblast accepts the sequence target only once cuts exist", () => {
  const ui = makeUi();
  const rejected = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.set_playblast", cameraId: "__sequence__" }],
  }));
  assert.equal(rejected.ok, false);
  assert.equal(rejected.error.code, "NO_CUTS");

  executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.upsert", start: 0, cameraId: "camera_1" }] }));
  const accepted = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.set_playblast", cameraId: "__sequence__" }],
  }));
  assert.equal(accepted.ok, true);
  assert.equal(ui.state.playblast_camera_id, "__sequence__");
});

// -- object structural operations --------------------------------------------

test("object.create rejects a type outside the v1 allow-list", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "object.create", objectType: "spaceship" }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "UNSUPPORTED_OBJECT_TYPE");
});

test("object.create rejects asset/url/path fields", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "object.create", objectType: "cube", asset: "foo" }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "BAD_VALUE");
});

test("object.create adds an object with sensible defaults", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "object.create", objectType: "sun_light" }],
  }));
  assert.equal(result.ok, true);
  const objectId = result.outcomes[0].objectId;
  const object = ui.state.objects.find((o) => o.id === objectId);
  assert.equal(object.type, "sun_light");
  assert.equal(object.intensity, 2.2);
});

test("object.duplicate offsets the clone by default and preserves the asset reference", () => {
  const ui = makeUi();
  const subject = ui.state.objects.find((o) => o.id === "subject");
  subject.asset_id = "asset_1";
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "object.duplicate", objectId: "subject" }],
  }));
  assert.equal(result.ok, true);
  const objectId = result.outcomes[0].objectId;
  const clone = ui.state.objects.find((o) => o.id === objectId);
  assert.equal(clone.asset_id, "asset_1");
  assert.deepEqual(clone.position, [subject.position[0] + 0.35, subject.position[1], subject.position[2] + 0.35]);
  assert.equal(result.outcomes[0].resourceRefresh, true);
});

test("object.delete protects the subject object", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "object.delete", objectId: "subject" }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "PROTECTED_OBJECT");
});

test("object.delete refuses a locked object and clears children's parent on success", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx({ operations: [{ type: "object.create", objectType: "cube", id: "parent_1" }] }));
  executeDirectorTransaction(ui, tx({ operations: [{ type: "object.create", objectType: "cube", id: "child_1" }] }));
  executeDirectorTransaction(ui, tx({ operations: [{ type: "object.set_parent", objectId: "child_1", parentId: "parent_1" }] }));

  const lockedResult = executeDirectorTransaction(ui, tx({ operations: [{ type: "object.set_locked", objectId: "parent_1", value: true }] }));
  assert.equal(lockedResult.ok, true);

  const denied = executeDirectorTransaction(ui, tx({ operations: [{ type: "object.delete", objectId: "parent_1" }] }));
  assert.equal(denied.ok, false);
  assert.equal(denied.error.code, "ENTITY_LOCKED");

  const accepted = executeDirectorTransaction(ui, tx({ operations: [{ type: "object.set_locked", objectId: "parent_1", value: false }] }));
  assert.equal(accepted.ok, true);
  const deleted = executeDirectorTransaction(ui, tx({ operations: [{ type: "object.delete", objectId: "parent_1" }] }));
  assert.equal(deleted.ok, true);
  assert.equal(ui.state.objects.find((o) => o.id === "child_1").parent_id, null);
});

test("object.set_parent rejects an unknown parent, self-parenting and a cycle", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx({ operations: [{ type: "object.create", objectType: "cube", id: "a" }] }));
  executeDirectorTransaction(ui, tx({ operations: [{ type: "object.create", objectType: "cube", id: "b" }] }));

  const unknown = executeDirectorTransaction(ui, tx({ operations: [{ type: "object.set_parent", objectId: "a", parentId: "nope" }] }));
  assert.equal(unknown.error.code, "UNKNOWN_OBJECT");

  const selfParent = executeDirectorTransaction(ui, tx({ operations: [{ type: "object.set_parent", objectId: "a", parentId: "a" }] }));
  assert.equal(selfParent.error.code, "INVALID_PARENT");

  assert.equal(executeDirectorTransaction(ui, tx({ operations: [{ type: "object.set_parent", objectId: "b", parentId: "a" }] })).ok, true);
  const cycle = executeDirectorTransaction(ui, tx({ operations: [{ type: "object.set_parent", objectId: "a", parentId: "b" }] }));
  assert.equal(cycle.error.code, "INVALID_PARENT");
});

// -- sequence cut operations --------------------------------------------------

test("cut.upsert keeps cuts sorted and replaces an existing cut at the same start", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx({ operations: [{ type: "camera.duplicate", cameraId: "camera_1", id: "camera_2" }] }));
  // Both cuts land in one transaction: sanitizeState() forces a *lone* cut's
  // start back to 0 (frame 0 must always belong to someone), which would
  // otherwise clobber the first op's start before the second op ever runs.
  executeDirectorTransaction(ui, tx({
    operations: [
      { type: "cut.upsert", start: 50, cameraId: "camera_2" },
      { type: "cut.upsert", start: 0, cameraId: "camera_1" },
    ],
  }));
  assert.deepEqual(ui.state.sequence.cuts.map((c) => c.start), [0, 50]);

  const replaced = executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.upsert", start: 0, cameraId: "camera_2" }] }));
  assert.equal(replaced.ok, true);
  assert.equal(ui.state.sequence.cuts.length, 2);
  assert.equal(ui.state.sequence.cuts.find((c) => c.start === 0).camera_id, "camera_2");
});

test("cut.upsert rejects an invalid frame and an unknown camera", () => {
  const ui = makeUi();
  const badFrame = executeDirectorTransaction(ui, tx({
    operations: [{ type: "cut.upsert", start: ui.state.duration_frames + 5, cameraId: "camera_1" }],
  }));
  assert.equal(badFrame.error.code, "FRAME_OUT_OF_RANGE");

  const badCamera = executeDirectorTransaction(ui, tx({
    operations: [{ type: "cut.upsert", start: 0, cameraId: "camera_404" }],
  }));
  assert.equal(badCamera.error.code, "UNKNOWN_CAMERA");
});

test("cut.upsert accepts a locked camera as a shot camera", () => {
  const ui = makeUi();
  ui.state.cameras.find((c) => c.id === "camera_1").locked = true;
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "cut.upsert", start: 0, cameraId: "camera_1" }],
  }));
  assert.equal(result.ok, true);
});

test("cut.remove requires an existing cut and cut.set_camera requires a cut and camera", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx({ operations: [{ type: "camera.duplicate", cameraId: "camera_1", id: "camera_2" }] }));
  executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.upsert", start: 0, cameraId: "camera_1" }] }));
  executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.upsert", start: 40, cameraId: "camera_2" }] }));

  const badRemove = executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.remove", start: 99 }] }));
  assert.equal(badRemove.error.code, "UNKNOWN_CUT");

  const badSetCamera = executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.set_camera", start: 99, cameraId: "camera_1" }] }));
  assert.equal(badSetCamera.error.code, "UNKNOWN_CUT");

  const badCamera = executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.set_camera", start: 40, cameraId: "camera_404" }] }));
  assert.equal(badCamera.error.code, "UNKNOWN_CAMERA");

  const setCamera = executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.set_camera", start: 40, cameraId: "camera_1" }] }));
  assert.equal(setCamera.ok, true);
  assert.equal(ui.state.sequence.cuts.find((c) => c.start === 40).camera_id, "camera_1");

  const removed = executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.remove", start: 40 }] }));
  assert.equal(removed.ok, true);
  assert.equal(ui.state.sequence.cuts.length, 1);
});

test("deleting a camera that a cut references is rejected even after other cuts are removed", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx({ operations: [{ type: "camera.duplicate", cameraId: "camera_1", id: "camera_2" }] }));
  executeDirectorTransaction(ui, tx({ operations: [{ type: "cut.upsert", start: 0, cameraId: "camera_2" }] }));
  const result = executeDirectorTransaction(ui, tx({ operations: [{ type: "camera.delete", cameraId: "camera_2" }] }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "CAMERA_IN_USE");
});
