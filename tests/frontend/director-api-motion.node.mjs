import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorTransaction } from "../../web-src/director-api/transaction.js";
import { UI_DIRTY, hasDirty } from "../../web-src/director/ui-dirty.js";

function makeUi() {
  const state = sanitizeState(defaultState());
  state.objects.push({
    id: "hero", type: "glb", name: "Hero", asset_kind: "character", asset_id: "omnicam.character.human_neutral_01",
    position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true,
    character: { rig_profile: "omnicam_humanoid_v1", pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} }, motion: null },
  });
  state.objects.push({ id: "rock", type: "glb", name: "Rock", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true });
  return {
    state: sanitizeState(state), frame: 0, selectedObjectIds: new Set(), checkpoints: [], serializeCount: 0,
    checkpoint(l) { this.checkpoints.push(l); }, serialize() { this.serializeCount += 1; },
    refreshObjects() {}, refreshKeys() {}, refreshInspector() {}, render() {}, sampleCamera: () => ({}),
  };
}

const tx = (operations) => ({ version: 1, id: `tx_${Math.random().toString(36).slice(2)}`, description: "motion", operations });
const hero = (ui) => ui.state.objects.find((o) => o.id === "hero");

test("character.set_motion sanitises and marks timeline + viewport dirty", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx([
    { type: "character.set_motion", objectId: "hero", motion: { clip_id: "Walk", start_frame: 12, speed: 20, loop: false } },
  ]));
  assert.equal(result.ok, true);
  assert.deepEqual(hero(ui).character.motion, { clip_id: "Walk", start_frame: 12, end_frame: 0, speed: 8, loop: false, offset_seconds: 0 });
  assert.ok(hasDirty(result.dirtyMask, UI_DIRTY.timeline));
  assert.ok(hasDirty(result.dirtyMask, UI_DIRTY.viewport));
});

test("character.clear_motion removes the clip", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "character.set_motion", objectId: "hero", motion: { clip_id: "walk" } }]));
  executeDirectorTransaction(ui, tx([{ type: "character.clear_motion", objectId: "hero" }]));
  assert.equal(hero(ui).character.motion, null);
});

test("validation rejects a bad payload and an inverted range before apply", () => {
  const ui = makeUi();
  assert.equal(
    executeDirectorTransaction(ui, tx([{ type: "character.set_motion", objectId: "hero", motion: { clip_id: "" } }])).error.code,
    "BAD_ID",
  );
  assert.equal(
    executeDirectorTransaction(ui, tx([{ type: "character.set_motion", objectId: "hero", motion: { clip_id: "walk", start_frame: 40, end_frame: 10 } }])).error.code,
    "BAD_MOTION_RANGE",
  );
  assert.equal(
    executeDirectorTransaction(ui, tx([{ type: "character.set_motion", objectId: "rock", motion: { clip_id: "walk" } }])).error.code,
    "NOT_A_CHARACTER",
  );
});

test("setting a joint rotation is refused while a motion clip is active", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "character.set_motion", objectId: "hero", motion: { clip_id: "walk" } }]));
  const result = executeDirectorTransaction(ui, tx([
    { type: "character.set_joint_rotation", objectId: "hero", joint: "spine", rotation: [0, 0, 0.38, 0.92] },
  ]));
  assert.equal(result.error.code, "POSE_MOTION_EXCLUSIVE");
});

test("motion survives a sanitizeState round trip", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "character.set_motion", objectId: "hero", motion: { clip_id: "run", start_frame: 5, end_frame: 90, speed: 1.5, loop: true } }]));
  const round = sanitizeState(JSON.parse(JSON.stringify(ui.state)));
  const m = round.objects.find((o) => o.id === "hero").character.motion;
  assert.deepEqual(m, { clip_id: "run", start_frame: 5, end_frame: 90, speed: 1.5, loop: true, offset_seconds: 0 });
});
