import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorTransaction } from "../../web-src/director-api/transaction.js";
import { UI_DIRTY, hasDirty } from "../../web-src/director/ui-dirty.js";

function makeUi() {
  const state = sanitizeState(defaultState());
  state.cameras.push({ id: "camera_2", name: "Camera 2", camera: state.cameras[0].camera, keyframes: state.cameras[0].keyframes });
  const ui = {
    state: sanitizeState(state),
    frame: 0,
    selectedEntity: "camera",
    selectedObjectId: null,
    selectedObjectIds: new Set(),
    selectedKeyFrame: 0,
    checkpoints: [],
    serializeCount: 0,
    renderCount: 0,
    checkpoint(label) { this.checkpoints.push(label); },
    serialize() { this.serializeCount += 1; },
    render() { this.renderCount += 1; },
    refreshObjects() {},
    refreshKeys() {},
    refreshInspector() {},
    sampleCamera: (_s, _f) => ({}),
  };
  return ui;
}

const tx = (overrides = {}) => ({
  version: 1,
  id: `tx_${Math.random().toString(36).slice(2)}`,
  description: "test",
  operations: [],
  ...overrides,
});

test("rejects an unsupported API version without touching state", () => {
  const ui = makeUi();
  const before = JSON.stringify(ui.state);
  const result = executeDirectorTransaction(ui, tx({ version: 2, operations: [{ type: "object.set_enabled", objectId: "subject", value: false }] }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "UNSUPPORTED_VERSION");
  assert.equal(JSON.stringify(ui.state), before);
  assert.equal(ui.checkpoints.length, 0);
  assert.equal(ui.serializeCount, 0);
});

test("rejects a transaction with more than 50 operations", () => {
  const ui = makeUi();
  const operations = Array.from({ length: 51 }, () => ({ type: "object.set_enabled", objectId: "subject", value: true }));
  const result = executeDirectorTransaction(ui, tx({ operations }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "TOO_MANY_OPERATIONS");
});

test("rejects an unknown operation type", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({ operations: [{ type: "camera.explode" }] }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "UNKNOWN_OPERATION");
  assert.equal(result.error.operationIndex, 0);
});

test("rejects an empty description and an empty operation list", () => {
  const ui = makeUi();
  assert.equal(executeDirectorTransaction(ui, tx({ description: "  ", operations: [{ type: "object.set_locked", objectId: "subject", value: true }] })).error.code, "EMPTY_DESCRIPTION");
  assert.equal(executeDirectorTransaction(ui, tx({ operations: [] })).error.code, "NO_OPERATIONS");
});

test("validateOnly performs zero writes, history, serialization or repaint", () => {
  const ui = makeUi();
  const before = JSON.stringify(ui.state);
  const result = executeDirectorTransaction(ui, tx({
    validateOnly: true,
    operations: [
      { type: "object.set_enabled", objectId: "subject", value: false },
      { type: "camera.set_active", cameraId: "camera_2" },
    ],
  }));
  assert.equal(result.ok, true);
  assert.equal(result.validateOnly, true);
  assert.equal(result.applied, 2);
  assert.equal(JSON.stringify(ui.state), before);
  assert.equal(ui.checkpoints.length, 0);
  assert.equal(ui.serializeCount, 0);
  assert.equal(ui.renderCount, 0);
});

test("a multi-op transaction is atomic when a later op fails", () => {
  const ui = makeUi();
  const before = JSON.stringify(ui.state);
  const result = executeDirectorTransaction(ui, tx({
    operations: [
      { type: "object.set_enabled", objectId: "subject", value: false },
      { type: "camera.set_active", cameraId: "camera_404" },
    ],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "UNKNOWN_CAMERA");
  assert.equal(result.error.operationIndex, 1);
  assert.equal(JSON.stringify(ui.state), before, "first op must be rolled back");
  assert.equal(ui.checkpoints.length, 0);
});

test("a successful transaction creates exactly one checkpoint and one serialize", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    description: "Disable subject and retarget",
    operations: [
      { type: "object.set_enabled", objectId: "subject", value: false },
      { type: "object.set_locked", objectId: "subject", value: true },
      { type: "camera.set_active", cameraId: "camera_2" },
    ],
  }));
  assert.equal(result.ok, true);
  assert.equal(result.applied, 3);
  assert.equal(ui.checkpoints.length, 1);
  assert.deepEqual(ui.checkpoints, ["Disable subject and retarget"]);
  assert.equal(ui.serializeCount, 1);
  assert.equal(ui.state.objects.find((o) => o.id === "subject").enabled, false);
  assert.equal(ui.state.objects.find((o) => o.id === "subject").locked, true);
  assert.equal(ui.state.active_camera_id, "camera_2");
  assert.ok(hasDirty(result.dirtyMask, UI_DIRTY.outliner));
  assert.ok(hasDirty(result.dirtyMask, UI_DIRTY.viewport));
});

test("a transaction id cannot be reused once committed", () => {
  const ui = makeUi();
  const shared = tx({ operations: [{ type: "object.set_enabled", objectId: "subject", value: false }] });
  assert.equal(executeDirectorTransaction(ui, shared).ok, true);
  const second = executeDirectorTransaction(ui, { ...shared, operations: [{ type: "object.set_enabled", objectId: "subject", value: true }] });
  assert.equal(second.ok, false);
  assert.equal(second.error.code, "DUPLICATE_TRANSACTION_ID");
});

test("keyframe.set_interpolation rejects an unsupported mode and edits a real key", () => {
  const ui = makeUi();
  const bad = executeDirectorTransaction(ui, tx({ operations: [{ type: "keyframe.set_interpolation", frame: 0, interpolation: "wobble" }] }));
  assert.equal(bad.error.code, "BAD_INTERPOLATION");

  const good = executeDirectorTransaction(ui, tx({ operations: [{ type: "keyframe.set_interpolation", frame: 0, interpolation: "linear" }] }));
  assert.equal(good.ok, true);
  const activeTrack = ui.state.cameras.find((c) => c.id === ui.state.active_camera_id);
  assert.equal(activeTrack.keyframes.find((k) => k.frame === 0).interpolation, "linear");
});

test("camera.look_at at a point retargets every key and clears object tracking", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({ operations: [{ type: "camera.look_at", point: [1, 2, 3] }] }));
  assert.equal(result.ok, true);
  const activeTrack = ui.state.cameras.find((c) => c.id === ui.state.active_camera_id);
  for (const key of activeTrack.keyframes) {
    assert.deepEqual(key.camera.target, [1, 2, 3]);
  }
});
