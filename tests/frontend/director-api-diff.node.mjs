import test from "node:test";
import assert from "node:assert/strict";

import { computeSemanticDiff, MAX_DIFF_CHANGES } from "../../web-src/director-api/diff.js";
import { defaultState, sanitizeState } from "../../web-src/director/core.js";

function makeState() {
  const state = sanitizeState(defaultState());
  state.cameras.push({
    id: "camera_2",
    name: "Camera 2",
    camera: { ...state.cameras[0].camera },
    keyframes: state.cameras[0].keyframes,
  });
  return sanitizeState(state);
}

test("no changes between identical states", () => {
  const state = makeState();
  const { changes, truncated } = computeSemanticDiff(state, state);
  assert.deepEqual(changes, []);
  assert.equal(truncated, false);
});

test("a camera position change is reported with entity/field/before/after", () => {
  const before = makeState();
  const after = JSON.parse(JSON.stringify(before));
  after.cameras[0].camera.position = [9, 9, 9];

  const { changes } = computeSemanticDiff(before, after);
  const change = changes.find((c) => c.entity === "camera_1" && c.field === "position");
  assert.ok(change);
  assert.deepEqual(change.before, before.cameras[0].camera.position);
  assert.deepEqual(change.after, [9, 9, 9]);
});

test("camera properties (fov, locked) are diffed", () => {
  const before = makeState();
  const after = JSON.parse(JSON.stringify(before));
  after.cameras[0].camera.fov = 50;
  after.cameras[0].locked = true;

  const { changes } = computeSemanticDiff(before, after);
  assert.ok(changes.some((c) => c.entity === "camera_1" && c.field === "fov" && c.after === 50));
  assert.ok(changes.some((c) => c.entity === "camera_1" && c.field === "locked" && c.after === true));
});

test("object transform, enabled, locked, tags and annotation are diffed", () => {
  const before = makeState();
  const after = JSON.parse(JSON.stringify(before));
  const object = after.objects.find((o) => o.id === "subject");
  object.position = [1, 2, 3];
  object.enabled = false;
  object.locked = true;
  object.tags = ["hero"];
  object.annotation = { text: "note", color: "#ffffff", anchor: "top" };

  const { changes } = computeSemanticDiff(before, after);
  const byField = Object.fromEntries(changes.filter((c) => c.entity === "subject").map((c) => [c.field, c]));
  assert.deepEqual(byField.position.after, [1, 2, 3]);
  assert.equal(byField.enabled.after, false);
  assert.equal(byField.locked.after, true);
  assert.deepEqual(byField.tags.after, ["hero"]);
  assert.deepEqual(byField.annotation.after, { text: "note", color: "#ffffff", anchor: "top" });
});

test("character pose/motion are diffed by identifier only", () => {
  const before = makeState();
  const after = JSON.parse(JSON.stringify(before));
  after.objects[0].character = { pose: { preset_id: "t_pose" }, motion: { clip_id: "walk" } };

  const { changes } = computeSemanticDiff(before, after);
  const entity = after.objects[0].id;
  assert.ok(changes.some((c) => c.entity === entity && c.field === "pose_preset" && c.after === "t_pose"));
  assert.ok(changes.some((c) => c.entity === entity && c.field === "motion_clip_id" && c.after === "walk"));
  // The full joint map must not appear as a change record.
  assert.equal(changes.some((c) => c.field === "joints"), false);
});

test("timeline duration/range and object create/delete are diffed", () => {
  const before = makeState();
  const after = JSON.parse(JSON.stringify(before));
  after.duration_frames = 200;
  after.playback_range = [10, 20];
  after.objects.push({ id: "new_object", type: "cube", name: "New", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true });
  after.objects.splice(after.objects.findIndex((o) => o.id === "subject"), 1);

  const { changes } = computeSemanticDiff(before, after);
  assert.ok(changes.some((c) => c.entity === "timeline" && c.field === "duration_frames" && c.after === 200));
  assert.ok(changes.some((c) => c.entity === "timeline" && c.field === "playback_range"));
  assert.ok(changes.some((c) => c.entity === "new_object" && c.field === "object" && c.before === null));
  assert.ok(changes.some((c) => c.entity === "subject" && c.field === "object" && c.after === null));
});

test("cuts are diffed by start: created, changed camera, removed", () => {
  const before = makeState();
  before.sequence = { enabled: true, cuts: [{ start: 0, camera_id: "camera_1" }, { start: 20, camera_id: "camera_2" }] };
  const after = JSON.parse(JSON.stringify(before));
  after.sequence.cuts[1].camera_id = "camera_1";
  after.sequence.cuts.push({ start: 40, camera_id: "camera_2" });
  after.sequence.cuts = after.sequence.cuts.filter((cut) => cut.start !== 0);

  const { changes } = computeSemanticDiff(before, after);
  assert.ok(changes.some((c) => c.entity === "cut_0" && c.field === "cut" && c.after === null));
  assert.ok(changes.some((c) => c.entity === "cut_20" && c.field === "cut_camera_id" && c.after === "camera_1"));
  assert.ok(changes.some((c) => c.entity === "cut_40" && c.field === "cut" && c.before === null));
});

test("the change list is capped and reports truncated instead of growing unbounded", () => {
  const before = makeState();
  before.objects = Array.from({ length: 150 }, (_, i) => ({ id: `obj_${i}`, position: [0, 0, 0], enabled: true }));
  const after = JSON.parse(JSON.stringify(before));
  for (const object of after.objects) object.position = [1, 1, 1];

  const { changes, truncated } = computeSemanticDiff(before, after);
  assert.equal(changes.length, MAX_DIFF_CHANGES);
  assert.equal(truncated, true);
});
