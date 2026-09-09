import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorTransaction } from "../../web-src/director-api/transaction.js";
import { executeDirectorQuery } from "../../web-src/director-api/query.js";
import { DIRECTOR_QUERIES } from "../../web-src/director-api/constants.js";
import { UI_DIRTY, hasDirty } from "../../web-src/director/ui-dirty.js";

function makeUi() {
  return {
    state: sanitizeState(defaultState()),
    frame: 0,
    selectedObjectIds: new Set(),
    checkpoints: [],
    serializeCount: 0,
    checkpoint(l) { this.checkpoints.push(l); },
    serialize() { this.serializeCount += 1; },
    refreshObjects() {}, refreshKeys() {}, refreshInspector() {}, render() {}, sampleCamera: () => ({}),
  };
}

const tx = (operations, extra = {}) => ({
  version: 1, id: `tx_${Math.random().toString(36).slice(2)}`, description: "asset", operations, ...extra,
});

const CHAIR = { version: 2, id: "omnicam.prop.chair_01", name: "Chair 01", kind: "prop", file: "props/chair_01.glb", tags: ["chair"], source: "default" };
const CHAR = {
  version: 2, id: "omnicam.character.human_01", name: "Human 01", kind: "character",
  file: "characters/human_01.glb", base_size: [0.6, 1.8, 0.4], tags: ["human"], source: "default",
  rig: { profile: "omnicam_humanoid_v1", bone_map: { pelvis: "Hips" } },
};

test("asset.instantiate compiles a deterministic object and reports its id", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx(
    [{ type: "asset.instantiate", asset: CHAIR, point: [1, 0, 2], id: "seed1" }],
  ));
  assert.equal(result.ok, true);
  assert.deepEqual(result.outcomes, [{ index: 0, objectId: "prop_seed1", assetId: "omnicam.prop.chair_01" }]);
  const object = ui.state.objects.find((o) => o.id === "prop_seed1");
  assert.equal(object.type, "glb");
  assert.equal(object.asset_id, "omnicam.prop.chair_01");
  assert.deepEqual(object.position, [1, 0, 2]);
  assert.ok(hasDirty(result.dirtyMask, UI_DIRTY.outliner));
});

test("the same seed yields the same object id (idempotent for the Agent)", () => {
  const a = makeUi();
  const b = makeUi();
  executeDirectorTransaction(a, tx([{ type: "asset.instantiate", asset: CHAR, id: "abc" }]));
  executeDirectorTransaction(b, tx([{ type: "asset.instantiate", asset: CHAR, id: "abc" }]));
  assert.equal(a.state.objects.at(-1).id, b.state.objects.at(-1).id);
  assert.equal(a.state.objects.at(-1).id, "character_abc");
});

test("a validateOnly instantiate reports the id without mutating state", () => {
  const ui = makeUi();
  const before = JSON.stringify(ui.state);
  const result = executeDirectorTransaction(ui, tx(
    [{ type: "asset.instantiate", asset: CHAIR, id: "dry" }],
    { validateOnly: true },
  ));
  assert.equal(result.validateOnly, true);
  assert.equal(result.outcomes[0].objectId, "prop_dry");
  assert.equal(JSON.stringify(ui.state), before);
});

test("asset.instantiate rejects a missing / oversized payload before apply", () => {
  const ui = makeUi();
  assert.equal(executeDirectorTransaction(ui, tx([{ type: "asset.instantiate" }])).error.code, "BAD_VALUE");
  assert.equal(
    executeDirectorTransaction(ui, tx([{ type: "asset.instantiate", asset: { ...CHAIR, tags: Array(33).fill("t") } }])).error.code,
    "BAD_VALUE",
  );
  const bigRig = { ...CHAR, rig: { bone_map: Object.fromEntries(Array.from({ length: 129 }, (_, i) => [`j${i}`, `B${i}`])) } };
  assert.equal(
    executeDirectorTransaction(ui, tx([{ type: "asset.instantiate", asset: bigRig }])).error.code,
    "BAD_VALUE",
  );
});

test("asset.list reports every catalog-linked object, with a kind filter", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([
    { type: "asset.instantiate", asset: CHAIR, id: "c1" },
    { type: "asset.instantiate", asset: CHAR, id: "h1" },
  ]));
  const all = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.ASSET_LIST });
  assert.equal(all.total, 2);
  assert.deepEqual(all.items.map((i) => i.asset_id).sort(), ["omnicam.character.human_01", "omnicam.prop.chair_01"]);
  const chars = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.ASSET_LIST, kind: "character" });
  assert.equal(chars.total, 1);
  assert.equal(chars.items[0].is_character, true);
  // the returned array is a clone
  all.items.push({});
  assert.equal(executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.ASSET_LIST }).total, 2);
});

test("asset.get returns one object's linkage and rejects an unknown id", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "asset.instantiate", asset: CHAR, id: "h1" }]));
  const got = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.ASSET_GET, objectId: "character_h1" });
  assert.equal(got.asset.asset_id, "omnicam.character.human_01");
  assert.equal(got.asset.asset_kind, "character");
  assert.ok(got.asset.character);
  assert.throws(
    () => executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.ASSET_GET, objectId: "ghost" }),
    /Unknown object/,
  );
});
