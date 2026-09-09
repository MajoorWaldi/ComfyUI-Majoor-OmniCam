import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorTransaction } from "../../web-src/director-api/transaction.js";
import { executeDirectorQuery } from "../../web-src/director-api/query.js";
import { DIRECTOR_QUERIES } from "../../web-src/director-api/constants.js";
import { UI_DIRTY, hasDirty } from "../../web-src/director/ui-dirty.js";

function makeUi() {
  const state = sanitizeState(defaultState());
  state.objects.push({
    id: "hero", type: "glb", name: "Hero", asset_kind: "character",
    asset_id: "omnicam.character.human_neutral_01",
    position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true,
    character: { rig_profile: "omnicam_humanoid_v1", pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} }, motion: null },
  });
  state.objects.push({ id: "rock", type: "glb", name: "Rock", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true });
  return {
    state: sanitizeState(state), frame: 0, selectedObjectIds: new Set(),
    checkpoints: [], serializeCount: 0,
    checkpoint(l) { this.checkpoints.push(l); }, serialize() { this.serializeCount += 1; },
    refreshObjects() {}, refreshKeys() {}, refreshInspector() {}, render() {}, sampleCamera: () => ({}),
  };
}

const tx = (operations) => ({ version: 1, id: `tx_${Math.random().toString(36).slice(2)}`, description: "pose", operations });
const hero = (ui) => ui.state.objects.find((o) => o.id === "hero");

test("character.set_joint_rotation stores a normalised quat and marks viewport dirty", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx([
    { type: "character.set_joint_rotation", objectId: "hero", joint: "upper_arm_r", rotation: [0, 0, 0.3827, 1.05] },
  ]));
  assert.equal(result.ok, true);
  const q = hero(ui).character.pose.joints.upper_arm_r;
  assert.ok(Math.abs(Math.hypot(...q) - 1) < 1e-9);
  assert.ok(hasDirty(result.dirtyMask, UI_DIRTY.viewport));
});

test("setting a joint back to identity removes the override", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "character.set_joint_rotation", objectId: "hero", joint: "neck", rotation: [0, 0, 0.38, 0.92] }]));
  executeDirectorTransaction(ui, tx([{ type: "character.set_joint_rotation", objectId: "hero", joint: "neck", rotation: [0, 0, 0, 1] }]));
  assert.equal("neck" in hero(ui).character.pose.joints, false);
});

test("character.set_pose replaces the whole pose; null resets to neutral", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "character.set_pose", objectId: "hero", pose: { preset_id: "reaching", joints: { hand_r: [0, 0, 0.7071, 0.7071] } } }]));
  assert.equal(hero(ui).character.pose.preset_id, "reaching");
  executeDirectorTransaction(ui, tx([{ type: "character.set_pose", objectId: "hero", pose: null }]));
  assert.deepEqual(hero(ui).character.pose, { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} });
});

test("pose ops refuse a non-character and an object under an active motion clip", () => {
  const ui = makeUi();
  assert.equal(
    executeDirectorTransaction(ui, tx([{ type: "character.set_pose", objectId: "rock", pose: null }])).error.code,
    "NOT_A_CHARACTER",
  );
  hero(ui).character.motion = { clip_id: "walk" };
  ui.state = sanitizeState(JSON.parse(JSON.stringify(ui.state)));
  assert.equal(
    executeDirectorTransaction(ui, tx([{ type: "character.set_joint_rotation", objectId: "hero", joint: "spine", rotation: [0, 0, 0.38, 0.92] }])).error.code,
    "POSE_MOTION_EXCLUSIVE",
  );
});

test("validation rejects a malformed quaternion before apply", () => {
  const ui = makeUi();
  assert.equal(
    executeDirectorTransaction(ui, tx([{ type: "character.set_joint_rotation", objectId: "hero", joint: "spine", rotation: [0, 0, 1] }])).error.code,
    "BAD_QUATERNION",
  );
});

test("character.get_pose returns the live pose as plain JSON", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "character.set_joint_rotation", objectId: "hero", joint: "head", rotation: [0, 0.1305, 0, 0.9914] }]));
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.CHARACTER_GET_POSE, objectId: "hero" });
  assert.equal(result.type, "character.get_pose");
  assert.equal(result.pose.preset_id, "neutral");
  assert.ok(result.pose.joints.head);
  assert.equal(result.pose.has_motion, false);
});

test("pose survives a sanitizeState round trip", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "character.set_pose", objectId: "hero", pose: { preset_id: "sitting", root_offset: [0, 0.2, 0], joints: { pelvis: [0, 0, 0.2588, 0.9659] } } }]));
  const round = sanitizeState(JSON.parse(JSON.stringify(ui.state)));
  const c = round.objects.find((o) => o.id === "hero").character;
  assert.equal(c.pose.preset_id, "sitting");
  assert.deepEqual(c.pose.root_offset, [0, 0.2, 0]);
  assert.ok(c.pose.joints.pelvis);
});
