import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorTransaction } from "../../web-src/director-api/transaction.js";
import { executeDirectorQuery } from "../../web-src/director-api/query.js";
import { DIRECTOR_QUERIES } from "../../web-src/director-api/constants.js";
import { REQUIRED_JOINTS } from "../../web-src/assets/character/rig-profile.js";

// A five-rigged-character previs scene, driven entirely through the Semantic
// Director API, stays well-formed and bounded (design spec sections 31, 38).

const COMPLETE_MAP = Object.fromEntries(REQUIRED_JOINTS.map((j) => [j, `Bone_${j}`]));
const walker = (n) => ({
  version: 2, id: `omnicam.character.walker_${n}`, name: `Walker ${n}`, kind: "character",
  file: `characters/walker_${n}.glb`, base_size: [0.6, 1.8, 0.4], tags: ["human"], source: "default",
  rig: { profile: "omnicam_humanoid_v1", bone_map: COMPLETE_MAP },
  animations: [{ id: "walk", name: "Walk", clip: "Walk", tags: [] }],
});

function makeUi() {
  return {
    state: sanitizeState(defaultState()), frame: 12, selectedObjectIds: new Set(),
    checkpoint() {}, serialize() {}, refreshObjects() {}, refreshKeys() {}, refreshInspector() {},
    render() {}, sampleCamera: () => ({}),
  };
}

const tx = (operations) => ({ version: 1, id: `tx_${Math.random().toString(36).slice(2)}`, description: "stress", operations });

test("five characters: instantiate + tag + annotate + pose + motion, one transaction each", () => {
  const ui = makeUi();
  const baseCount = ui.state.objects.length;

  const ids = [];
  for (let n = 1; n <= 5; n += 1) {
    const res = executeDirectorTransaction(ui, tx([{ type: "asset.instantiate", asset: walker(n), id: `w${n}` }]));
    assert.equal(res.ok, true, JSON.stringify(res.error));
    ids.push(res.outcomes[0].objectId);
  }
  assert.equal(ui.state.objects.length, baseCount + 5);

  for (const [index, id] of ids.entries()) {
    const res = executeDirectorTransaction(ui, tx([
      { type: "object.set_tags", objectId: id, tags: ["subject", `crowd_${index}`] },
      { type: "object.set_annotation", objectId: id, annotation: { text: `P${index + 1}` } },
      { type: "character.set_joint_rotation", objectId: id, joint: "upper_arm_r", rotation: [0, 0, 0.3827, 0.9239] },
    ]));
    assert.equal(res.ok, true, JSON.stringify(res.error));
    // odd ones walk, even ones stay posed (pose/motion are mutually exclusive)
    if (index % 2 === 0) {
      assert.equal(
        executeDirectorTransaction(ui, tx([{ type: "character.set_motion", objectId: id, motion: { clip_id: "Walk" } }])).ok,
        true,
      );
    }
  }

  const list = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.ASSET_LIST, kind: "character" });
  assert.equal(list.total, 5);
  assert.equal(list.items.filter((i) => i.has_motion).length, 3);

  const scene = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.SCENE_GET });
  const characters = scene.scene.objects.filter((o) => o.asset_kind === "character");
  assert.equal(characters.length, 5);
  for (const character of characters) {
    assert.ok(character.tags.length <= 32);
    assert.ok(character.annotation.text.length <= 128);
    // a character carries a pose OR a motion, never joint edits under a clip
    if (character.character.motion) assert.deepEqual(character.character.pose.joints, {});
    else assert.ok(character.character.pose.joints.upper_arm_r);
  }
  // serialising the whole scene stays a sane size for a 5-character previs
  assert.ok(JSON.stringify(scene).length < 200_000);
});
