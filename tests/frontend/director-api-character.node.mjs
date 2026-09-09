import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorQuery } from "../../web-src/director-api/query.js";
import { DIRECTOR_QUERIES } from "../../web-src/director-api/constants.js";

function makeUi() {
  const state = sanitizeState(defaultState());
  state.objects.push({
    id: "character_1",
    type: "glb",
    name: "John",
    asset_id: "omnicam.character.human_neutral_01",
    asset_kind: "character",
    position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1],
    keyframes: [], enabled: true,
    character: { rig_profile: "omnicam_humanoid_v1", pose: { preset_id: "neutral" }, motion: null },
  });
  state.objects.push({ id: "plain_glb", type: "glb", name: "Rock", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true });
  return { state: sanitizeState(state), frame: 0 };
}

test("character.get_rig reports the scene-side character facts", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.CHARACTER_GET_RIG, objectId: "character_1" });
  assert.equal(result.type, "character.get_rig");
  assert.deepEqual(result.rig, {
    objectId: "character_1",
    asset_id: "omnicam.character.human_neutral_01",
    asset_kind: "character",
    is_character: true,
    rig_profile: "omnicam_humanoid_v1",
    pose_preset: "neutral",
    has_motion: false,
  });
});

test("character.get_rig on a plain glb reports is_character false", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.CHARACTER_GET_RIG, objectId: "plain_glb" });
  assert.equal(result.rig.is_character, false);
  assert.equal(result.rig.rig_profile, null);
});

test("character.get_rig on an unknown object throws", () => {
  const ui = makeUi();
  assert.throws(
    () => executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.CHARACTER_GET_RIG, objectId: "ghost" }),
    /Unknown object/,
  );
});
