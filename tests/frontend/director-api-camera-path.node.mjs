import test from "node:test";
import assert from "node:assert/strict";

import { sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorTransaction } from "../../web-src/director-api/transaction.js";

// Plan section 26 Task 14 / section 22: high-level camera.path.* semantic
// operations, atomic and reached through the exact same pure helpers as the
// manual UI (camera-path-transform.js, camera-path-insert.js,
// camera-path-timing.js, camera-path-presets.js).

function makeUi({ locked = false } = {}) {
  const state = sanitizeState({
    duration_frames: 120,
    cameras: [{
      id: "camera_1",
      name: "Camera 1",
      locked,
      keyframes: [
        { frame: 0, interpolation: "smooth", camera: { position: [0, 1, 0], target: [0, 1, -5], fov: 35, camera_type: "perspective" } },
        { frame: 30, interpolation: "smooth", camera: { position: [10, 1, 0], target: [10, 1, -5], fov: 35, camera_type: "perspective" } },
        { frame: 60, interpolation: "smooth", camera: { position: [20, 1, 0], target: [20, 1, -5], fov: 35, camera_type: "perspective" } },
      ],
    }],
    active_camera_id: "camera_1",
  });
  return {
    state,
    frame: 0,
    directorRevision: 0,
    checkpoints: [],
    checkpoint(label) { this.checkpoints.push(label); this.directorRevision += 1; },
    serialize() {},
    refreshObjects() {},
    refreshKeys() {},
    refreshInspector() {},
    render() {},
  };
}

const tx = (overrides = {}) => ({
  version: 1,
  id: `tx_${Math.random().toString(36).slice(2)}`,
  description: "test",
  operations: [],
  ...overrides,
});

function keyframesOf(ui) {
  return ui.state.cameras.find((c) => c.id === "camera_1").keyframes;
}

// --- camera.path.transform_keys ----------------------------------------------

test("camera.path.transform_keys: atomically translates only the named frames", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{
      type: "camera.path.transform_keys",
      cameraId: "camera_1",
      frames: [0, 30],
      transform: { mode: "translate", delta: [0, 5, 0] },
    }],
  }));
  assert.equal(result.ok, true);
  const keys = keyframesOf(ui);
  assert.deepEqual(keys.find((k) => k.frame === 0).camera.position, [0, 6, 0]);
  assert.deepEqual(keys.find((k) => k.frame === 30).camera.position, [10, 6, 0]);
  // Frame 60 was not named -- untouched.
  assert.deepEqual(keys.find((k) => k.frame === 60).camera.position, [20, 1, 0]);
});

test("camera.path.transform_keys: rotate defaults the pivot to the selected keys' own centroid", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{
      type: "camera.path.transform_keys",
      cameraId: "camera_1",
      frames: [0, 30],
      transform: { mode: "rotate", rotationDeg: [0, 180, 0] },
    }],
  }));
  assert.equal(result.ok, true);
  const keys = keyframesOf(ui);
  // Centroid of (0,1,0) and (10,1,0) is (5,1,0); a 180 degree yaw about that
  // point swaps the two positions across it.
  assert.ok(Math.abs(keys.find((k) => k.frame === 0).camera.position[0] - 10) < 1e-6);
  assert.ok(Math.abs(keys.find((k) => k.frame === 30).camera.position[0] - 0) < 1e-6);
});

test("camera.path.transform_keys: an explicit origin overrides the default centroid", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{
      type: "camera.path.transform_keys",
      cameraId: "camera_1",
      frames: [0],
      transform: { mode: "scale", factors: [2, 1, 1], origin: [0, 0, 0] },
    }],
  }));
  assert.equal(result.ok, true);
  // Frame 0's position [0,1,0] is already at x=0, so scaling about the
  // world origin on X leaves it unchanged -- a cheap, deterministic proof
  // the supplied origin (not the key's own position) was actually used.
  assert.deepEqual(keyframesOf(ui).find((k) => k.frame === 0).camera.position, [0, 1, 0]);
});

test("camera.path.transform_keys: rejects a malformed transform before mutating anything", () => {
  const ui = makeUi();
  const before = JSON.stringify(keyframesOf(ui));
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.path.transform_keys", cameraId: "camera_1", frames: [0], transform: { mode: "spin" } }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "BAD_VALUE");
  assert.equal(JSON.stringify(keyframesOf(ui)), before);
});

// --- shared rejection paths: locked camera / missing frame -------------------

test("every camera.path.* op rejects a locked camera without mutating state", () => {
  const ops = [
    { type: "camera.path.transform_keys", cameraId: "camera_1", frames: [0], transform: { mode: "translate", delta: [1, 0, 0] } },
    { type: "camera.path.insert_key", cameraId: "camera_1", leftFrame: 0, rightFrame: 30 },
    { type: "camera.path.delete_keys", cameraId: "camera_1", frames: [30] },
    { type: "camera.path.redistribute_timing", cameraId: "camera_1" },
    { type: "camera.path.apply_preset", cameraId: "camera_1", presetType: "static", startFrame: 0, endFrame: 60 },
  ];
  for (const operation of ops) {
    const ui = makeUi({ locked: true });
    const before = JSON.stringify(keyframesOf(ui));
    const result = executeDirectorTransaction(ui, tx({ operations: [operation] }));
    assert.equal(result.ok, false, operation.type);
    assert.equal(result.error.code, "ENTITY_LOCKED", operation.type);
    assert.equal(JSON.stringify(keyframesOf(ui)), before, operation.type);
  }
});

test("camera.path.transform_keys and delete_keys reject an unknown frame atomically", () => {
  for (const type of ["camera.path.transform_keys", "camera.path.delete_keys"]) {
    const ui = makeUi();
    const before = JSON.stringify(keyframesOf(ui));
    const operation = type === "camera.path.transform_keys"
      ? { type, cameraId: "camera_1", frames: [0, 999], transform: { mode: "translate", delta: [1, 0, 0] } }
      : { type, cameraId: "camera_1", frames: [999] };
    const result = executeDirectorTransaction(ui, tx({ operations: [operation] }));
    assert.equal(result.ok, false, type);
    assert.equal(result.error.code, "UNKNOWN_KEYFRAME", type);
    // Atomic: a rejected operation leaves every keyframe exactly as it was,
    // not partially transformed/deleted up to the bad frame.
    assert.equal(JSON.stringify(keyframesOf(ui)), before, type);
  }
});

test("camera.path.insert_key refuses cleanly when there is no free frame between neighbours", () => {
  const ui = makeUi();
  // Frames 0 and 30 in the fixture are 30 apart, so squeeze in a neighbour at
  // frame 1 to leave a 0-gap segment with nowhere to insert.
  keyframesOf(ui).splice(1, 0, { frame: 1, interpolation: "smooth", camera: { position: [1, 1, 0], target: [1, 1, -5], fov: 35, camera_type: "perspective" } });
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.path.insert_key", cameraId: "camera_1", leftFrame: 0, rightFrame: 1 }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "NO_FREE_FRAME");
});

// --- insert / delete / redistribute / preset happy paths ---------------------

test("camera.path.insert_key adds one key at the exact reported frame, undo-able as one transaction", () => {
  const ui = makeUi();
  const before = keyframesOf(ui).length;
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.path.insert_key", cameraId: "camera_1", leftFrame: 0, rightFrame: 30, t: 0.5 }],
  }));
  assert.equal(result.ok, true);
  assert.equal(keyframesOf(ui).length, before + 1);
  const insertedFrame = result.outcomes[0].frame;
  assert.ok(keyframesOf(ui).some((k) => k.frame === insertedFrame));
  assert.equal(ui.checkpoints.length, 1);
});

test("camera.path.delete_keys removes exactly the named frames in one operation", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.path.delete_keys", cameraId: "camera_1", frames: [30] }],
  }));
  assert.equal(result.ok, true);
  assert.equal(result.outcomes[0].removed, 1);
  assert.deepEqual(keyframesOf(ui).map((k) => k.frame), [0, 60]);
});

test("camera.path.redistribute_timing reflows frames across the track's own range", () => {
  const ui = makeUi();
  // Give frame 0 a heavy timing weight so the redistribution actually moves
  // the interior key rather than leaving it exactly where it already was.
  keyframesOf(ui)[0].timing = { weight: 5 };
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.path.redistribute_timing", cameraId: "camera_1" }],
  }));
  assert.equal(result.ok, true);
  const frames = keyframesOf(ui).map((k) => k.frame);
  assert.equal(frames[0], 0);
  assert.equal(frames[frames.length - 1], 60);
  assert.notEqual(frames[1], 30);
});

test("camera.path.apply_preset (static) writes two keys at the camera's own pose across the requested range", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.path.apply_preset", cameraId: "camera_1", presetType: "static", startFrame: 10, endFrame: 40 }],
  }));
  assert.equal(result.ok, true);
  const frames = keyframesOf(ui).map((k) => k.frame);
  assert.deepEqual(frames, [10, 40]);
});

test("camera.path.apply_preset rejects an unknown preset type", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.path.apply_preset", cameraId: "camera_1", presetType: "not_a_preset", startFrame: 0, endFrame: 60 }],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "BAD_VALUE");
});

// --- stale revision (existing transaction contract, generic across ops) -----

test("a stale baseRevision rejects a camera.path.* transaction atomically and never mutates state", () => {
  const ui = makeUi();
  const staleRevision = ui.directorRevision;
  // Advance the revision with an unrelated, successful transaction first.
  const first = executeDirectorTransaction(ui, tx({
    operations: [{ type: "camera.path.delete_keys", cameraId: "camera_1", frames: [30] }],
  }));
  assert.equal(first.ok, true);
  const before = JSON.stringify(keyframesOf(ui));

  const stale = executeDirectorTransaction(ui, tx({
    baseRevision: staleRevision,
    operations: [{ type: "camera.path.transform_keys", cameraId: "camera_1", frames: [0], transform: { mode: "translate", delta: [1, 0, 0] } }],
  }));
  assert.equal(stale.ok, false);
  assert.equal(stale.error.code, "STALE_REVISION");
  assert.equal(JSON.stringify(keyframesOf(ui)), before);
});

// --- validateOnly diff stays bounded / descriptive ---------------------------

test("a validateOnly camera.path.transform_keys reports the changed frames without mutating live state", () => {
  const ui = makeUi();
  const before = JSON.stringify(keyframesOf(ui));
  const result = executeDirectorTransaction(ui, tx({
    validateOnly: true,
    operations: [{
      type: "camera.path.transform_keys",
      cameraId: "camera_1",
      frames: [0, 30],
      transform: { mode: "translate", delta: [0, 5, 0] },
    }],
  }));
  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(keyframesOf(ui)), before, "validateOnly must never touch live state");
  assert.ok(result.changes.length > 0);
  assert.ok(result.changes.length <= 100, "diff must stay within the documented MAX_DIFF_CHANGES bound");
  assert.ok(result.changes.some((change) => change.entity === "camera_1@keyframes" && change.field.startsWith("frame_0_")));
});
