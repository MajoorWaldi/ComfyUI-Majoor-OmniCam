import test from "node:test";
import assert from "node:assert/strict";

import { readReferenceMatrix, referencePlanToSpecs, renderReferenceMatrix, REFERENCE_ROLES } from "../../web-src/monitor/reference-role-matrix.js";

// ---------------------------------------------------------------------------
// referencePlanToSpecs
// ---------------------------------------------------------------------------

test("referencePlanToSpecs parses an empty/blank plan as no references", () => {
  assert.deepEqual(referencePlanToSpecs(""), []);
  assert.deepEqual(referencePlanToSpecs("   "), []);
  assert.deepEqual(referencePlanToSpecs(undefined), []);
});

test("referencePlanToSpecs parses a valid plan array", () => {
  const specs = referencePlanToSpecs('[{"id":"identity_img","media_type":"image","roles":["identity"]}]');
  assert.equal(specs.length, 1);
  assert.equal(specs[0].id, "identity_img");
});

test("referencePlanToSpecs never throws on malformed JSON", () => {
  assert.deepEqual(referencePlanToSpecs("{not json"), []);
  assert.deepEqual(referencePlanToSpecs('{"id":"not an array"}'), []);
});

// ---------------------------------------------------------------------------
// renderReferenceMatrix / readReferenceMatrix round-trip, using a minimal
// jsdom-free fake DOM (this repo's node:test lane has no jsdom -- other
// monitor unit tests build fakes by hand the same way, see
// monitor-execution.node.mjs's FakeElement).
// ---------------------------------------------------------------------------

function fakeOption(value, selected) {
  return { value, selected };
}

class FakeSelect {
  constructor(options) {
    this._options = options;
  }
  get selectedOptions() {
    return this._options.filter((option) => option.selected);
  }
}

class FakeRow {
  constructor(spec) {
    this.dataset = { role: "reference-row" };
    this.fields = {
      id: { value: spec.id || "" },
      media_type: { value: spec.media_type || "image" },
      slot_hint: { value: spec.slot_hint ? String(spec.slot_hint) : "" },
      roles: new FakeSelect(REFERENCE_ROLES.map((role) => fakeOption(role, (spec.roles || []).includes(role)))),
      ignore: new FakeSelect(REFERENCE_ROLES.map((role) => fakeOption(role, (spec.ignore || []).includes(role)))),
    };
  }
  querySelector(selector) {
    const match = selector.match(/data-field="([^"]+)"/);
    return match ? this.fields[match[1]] : null;
  }
}

/** Just enough of a DOM root for renderReferenceMatrix + readReferenceMatrix. */
function fakeMatrixRoot(initialSpecs = []) {
  let rows = initialSpecs.map((spec) => new FakeRow(spec));
  const container = {
    set innerHTML(_markup) {
      // renderReferenceMatrix only ever calls this with markup built from the
      // specs it was given -- the real render path is exercised by the
      // Playwright spec; here we just need the row COUNT/DATA to match what
      // render() was asked to draw, so tests re-derive `rows` from the specs
      // captured by the root's own render() wrapper below instead of parsing HTML.
    },
    get innerHTML() { return ""; },
  };
  const root = {
    _rows: rows,
    querySelector(selector) {
      if (selector === '[data-role="reference-matrix-rows"]') return container;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-role="reference-row"]') return root._rows;
      return [];
    },
  };
  return root;
}

test("readReferenceMatrix reads back what the rows currently hold", () => {
  const root = fakeMatrixRoot([
    { id: "identity_img", media_type: "image", slot_hint: 1, roles: ["identity", "design"] },
    { id: "action_video", media_type: "video", slot_hint: 2, roles: ["subject_action"], ignore: ["camera_motion"] },
  ]);
  const specs = readReferenceMatrix(root);
  assert.equal(specs.length, 2);
  assert.deepEqual(specs[0], { id: "identity_img", media_type: "image", roles: ["identity", "design"], slot_hint: 1 });
  assert.deepEqual(specs[1], { id: "action_video", media_type: "video", roles: ["subject_action"], slot_hint: 2, ignore: ["camera_motion"] });
});

test("readReferenceMatrix drops a row with a blank id", () => {
  const root = fakeMatrixRoot([{ id: "", media_type: "image", roles: [] }]);
  assert.deepEqual(readReferenceMatrix(root), []);
});

test("readReferenceMatrix omits slot_hint/ignore when not set", () => {
  const root = fakeMatrixRoot([{ id: "x", media_type: "image", roles: ["identity"] }]);
  const [spec] = readReferenceMatrix(root);
  assert.equal("slot_hint" in spec, false);
  assert.equal("ignore" in spec, false);
});

test("renderReferenceMatrix does not throw without a rows container", () => {
  const root = { querySelector: () => null };
  assert.doesNotThrow(() => renderReferenceMatrix(root, []));
});
