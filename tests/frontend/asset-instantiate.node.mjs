import test from "node:test";
import assert from "node:assert/strict";

import { assetReference, compileInstance, placementPoint } from "../../web-src/assets/instantiate.js";

const CHAR = {
  id: "omnicam.character.human_01",
  name: "Human 01",
  kind: "character",
  file: "characters/human_01.glb",
  base_size: [0.6, 1.8, 0.4],
  tags: ["human"],
  rig: { profile: "omnicam_humanoid_v1", bone_map: { pelvis: "Hips" } },
  source: "default",
};
const LEGACY_PROP = {
  id: "omnicam.legacy.chair", name: "Chair", kind: "prop",
  file: "interior/chair.glb", tags: ["reconstruction", "chair"], source: "legacy",
};

test("a character compiles to type glb with additive semantic fields", () => {
  const object = compileInstance(CHAR, { idSeed: "abc", point: [1, 0, 2] });
  assert.equal(object.type, "glb");
  assert.equal(object.id, "character_abc");
  assert.equal(object.asset, "omnicam/library/characters/human_01.glb [input]");
  assert.equal(object.asset_id, CHAR.id);
  assert.equal(object.asset_kind, "character");
  assert.deepEqual(object.position, [1, 0, 2]);
  assert.deepEqual(object.rotation, [0, 0, 0]);
  assert.deepEqual(object.size, [1, 1, 1]);
  assert.equal(object.character.rig_profile, "omnicam_humanoid_v1");
  assert.deepEqual(object.character.pose, { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} });
  assert.equal(object.character.motion, null);
});

test("a legacy prop resolves against the blockout-library prefix", () => {
  assert.equal(assetReference(LEGACY_PROP), "majoor_omnicam/blockout_library/interior/chair.glb [input]");
  const object = compileInstance(LEGACY_PROP, { idSeed: "1" });
  assert.equal(object.id, "prop_1");
  assert.equal(object.character, undefined);
  assert.deepEqual(object.tags, ["reconstruction", "chair"]);
});

test("a rig-less character gets a null rig_profile", () => {
  const object = compileInstance({ ...CHAR, rig: null }, { idSeed: "x" });
  assert.equal(object.character.rig_profile, null);
});

test("the low-poly human helper becomes a primitive, not a glb", () => {
  const object = compileInstance(
    { id: "omnicam.helper.human_lowpoly", name: "Human", kind: "helper", file: "", base_size: [0.5, 1.75, 0.35], tags: [] },
    { idSeed: "h" },
  );
  assert.equal(object.type, "human");
  assert.equal(object.id, "human_h");
  assert.equal(object.asset, undefined);
  assert.deepEqual(object.size, [0.5, 1.75, 0.35]);
});

test("ids avoid collisions with the existing scene", () => {
  const existing = new Set(["character_abc", "character_abc_2"]);
  const object = compileInstance(CHAR, { idSeed: "abc", existingIds: existing });
  assert.equal(object.id, "character_abc_3");
});

test("a bad placement point falls back to the origin", () => {
  const object = compileInstance(CHAR, { idSeed: "z", point: [1, NaN, 2] });
  assert.deepEqual(object.position, [0, 0, 0]);
});

test("placementPoint priority: ground hit > orbit target projected > origin", () => {
  assert.deepEqual(placementPoint({ groundHit: [1, 0.5, 3], orbitTarget: [9, 9, 9] }), [1, 0.5, 3]);
  assert.deepEqual(placementPoint({ orbitTarget: [4, 7, 5] }), [4, 0, 5]);
  assert.deepEqual(placementPoint({}), [0, 0, 0]);
});

test("compileInstance rejects a non-definition", () => {
  assert.throws(() => compileInstance(null), /AssetDefinition is required/);
  assert.throws(() => compileInstance({}), /AssetDefinition is required/);
});
