import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorTransaction } from "../../web-src/director-api/transaction.js";
import { UI_DIRTY, hasDirty } from "../../web-src/director/ui-dirty.js";

function makeUi() {
  const state = sanitizeState(defaultState());
  state.objects.push({ id: "hero", type: "glb", name: "Hero", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true });
  return {
    state: sanitizeState(state),
    frame: 0,
    selectedObjectIds: new Set(),
    checkpoints: [],
    serializeCount: 0,
    checkpoint(l) { this.checkpoints.push(l); },
    serialize() { this.serializeCount += 1; },
    refreshObjects() {}, refreshKeys() {}, refreshInspector() {}, render() {},
    sampleCamera: () => ({}),
  };
}

const tx = (operations) => ({ version: 1, id: `tx_${Math.random().toString(36).slice(2)}`, description: "label test", operations });

const object = (ui) => ui.state.objects.find((o) => o.id === "hero");

test("object.set_tags normalises, dedupes and marks outliner+inspector+viewport dirty", () => {
  const ui = makeUi();
  const result = executeDirectorTransaction(ui, tx([{ type: "object.set_tags", objectId: "hero", tags: ["Hero", "hero", "SUBJECT"] }]));
  assert.equal(result.ok, true);
  assert.deepEqual(object(ui).tags, ["hero", "subject"]);
  assert.ok(hasDirty(result.dirtyMask, UI_DIRTY.outliner));
  assert.ok(hasDirty(result.dirtyMask, UI_DIRTY.viewport));
  assert.ok(result.warnings.includes("some tags were dropped or normalised"));
});

test("object.set_tags with an empty result removes the field", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "object.set_tags", objectId: "hero", tags: ["keep"] }]));
  executeDirectorTransaction(ui, tx([{ type: "object.set_tags", objectId: "hero", tags: ["!!bad!!"] }]));
  assert.equal("tags" in object(ui), false);
});

test("object.set_annotation stores a validated label; null clears it", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([{ type: "object.set_annotation", objectId: "hero", annotation: { text: " HERO ", color: "#ABCDEF", anchor: "bottom" } }]));
  assert.deepEqual(object(ui).annotation, { text: "HERO", visible: true, color: "#abcdef", anchor: "bottom" });
  executeDirectorTransaction(ui, tx([{ type: "object.set_annotation", objectId: "hero", annotation: null }]));
  assert.equal("annotation" in object(ui), false);
});

test("a structurally-valid but unsafe annotation aborts the transaction", () => {
  const ui = makeUi();
  const before = JSON.stringify(ui.state);
  const result = executeDirectorTransaction(ui, tx([{ type: "object.set_annotation", objectId: "hero", annotation: { text: "<script>x</script>" } }]));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "BAD_ANNOTATION");
  assert.equal(JSON.stringify(ui.state), before);
  assert.equal(ui.checkpoints.length, 0);
});

test("validation rejects malformed op payloads before apply", () => {
  const ui = makeUi();
  assert.equal(executeDirectorTransaction(ui, tx([{ type: "object.set_tags", objectId: "hero", tags: "hero" }])).error.code, "BAD_VALUE");
  assert.equal(executeDirectorTransaction(ui, tx([{ type: "object.set_annotation", objectId: "hero", annotation: [] }])).error.code, "BAD_VALUE");
  assert.equal(executeDirectorTransaction(ui, tx([{ type: "object.set_tags", objectId: "ghost", tags: [] }])).error.code, "UNKNOWN_OBJECT");
});

test("tags and annotation survive a sanitizeState round trip", () => {
  const ui = makeUi();
  executeDirectorTransaction(ui, tx([
    { type: "object.set_tags", objectId: "hero", tags: ["hero"] },
    { type: "object.set_annotation", objectId: "hero", annotation: { text: "HERO" } },
  ]));
  const round = sanitizeState(JSON.parse(JSON.stringify(ui.state)));
  const hero = round.objects.find((o) => o.id === "hero");
  assert.deepEqual(hero.tags, ["hero"]);
  assert.equal(hero.annotation.text, "HERO");
});
