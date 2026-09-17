// Director modal audit Lot 4: the neighbor-aware side-column constraint,
// extracted so it's testable without a browser.

import test from "node:test";
import assert from "node:assert/strict";

import { maxSideColumnWidth, MIN_CENTRAL_STAGE_WIDTH } from "../../web-src/director/panel-constraints.js";

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
