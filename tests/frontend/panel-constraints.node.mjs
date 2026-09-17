// Director modal audit Lot 4: the neighbor-aware side-column constraint,
// extracted so it's testable without a browser.

import test from "node:test";
import assert from "node:assert/strict";

import { maxSideColumnWidth, maxVerticalPanelHeight, MIN_CENTRAL_STAGE_WIDTH } from "../../web-src/director/panel-constraints.js";

test("returns the static max unchanged when the container width is unknown", () => {
  assert.equal(maxSideColumnWidth({ containerWidth: undefined, otherColumnWidth: 280, staticMax: 640 }), 640);
  assert.equal(maxSideColumnWidth({ containerWidth: NaN, otherColumnWidth: 280, staticMax: 640 }), 640);
  assert.equal(maxSideColumnWidth({ containerWidth: 0, otherColumnWidth: 280, staticMax: 640 }), 640);
});

test("returns the static max unchanged on a wide window with plenty of room", () => {
  const result = maxSideColumnWidth({ containerWidth: 2400, otherColumnWidth: 264, staticMax: 640 });
  assert.equal(result, 640);
});

test("shrinks the effective max on a narrow window to preserve the central minimum", () => {
  // 1000 - 264 (other column) - 18 (gutters) - 360 (central minimum) = 358
  const result = maxSideColumnWidth({ containerWidth: 1000, otherColumnWidth: 264, staticMax: 640 });
  assert.equal(result, 358);
  assert.ok(result < 640);
});

test("never goes negative on an extremely narrow window", () => {
  const result = maxSideColumnWidth({ containerWidth: 200, otherColumnWidth: 264, staticMax: 640 });
  assert.equal(result, 0);
});

test("a wider other column tightens this column's own max in turn", () => {
  const narrow = maxSideColumnWidth({ containerWidth: 1200, otherColumnWidth: 500, staticMax: 640 });
  const wide = maxSideColumnWidth({ containerWidth: 1200, otherColumnWidth: 200, staticMax: 640 });
  assert.ok(narrow < wide);
});

test("MIN_CENTRAL_STAGE_WIDTH is a positive, sane floor", () => {
  assert.ok(MIN_CENTRAL_STAGE_WIDTH > 0);
  assert.ok(MIN_CENTRAL_STAGE_WIDTH < 800);
});

// A real bug: dragging the Outliner/Assets/Agent handle bigger, with no
// ceiling tied to its scrolling .oc-left-body, could push the handle itself
// out of the scrolled-to area -- reachable only after scrolling, and until
// then a click "at" its expected position landed on the dock behind it
// instead (reported as a broken/blank area in the panel).
test("returns the static max unchanged when the container height is unknown", () => {
  const result = maxVerticalPanelHeight({ containerClientHeight: undefined, othersHeight: 171, staticMax: 1600 });
  assert.equal(result, 1600);
});

test("allows plenty of room to grow when the container is much taller than its content", () => {
  // A tall window: 892px available, others (head/search/addbar/chips/handle) use ~171px.
  const result = maxVerticalPanelHeight({ containerClientHeight: 892, othersHeight: 171, staticMax: 1600 });
  assert.equal(result, 697);
  assert.ok(result > 220, "must allow growing past the default, not just holding the current height");
});

test("shrinks the effective max so the panel's own resize handle stays inside the visible area", () => {
  // Others (head/search/addbar/chips/handle) use 171px; only 336 available -> well under 220px for the tree itself.
  const result = maxVerticalPanelHeight({ containerClientHeight: 336, othersHeight: 171, staticMax: 1600 });
  assert.equal(result, 141);
  assert.ok(result < 220, "tighter than the old static default, which no longer fits here");
});

test("never goes negative when the other siblings alone already overflow", () => {
  const result = maxVerticalPanelHeight({ containerClientHeight: 100, othersHeight: 380, staticMax: 1600 });
  assert.equal(result, 0);
});
