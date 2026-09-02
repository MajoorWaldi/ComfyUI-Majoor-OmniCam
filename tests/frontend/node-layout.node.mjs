import test from "node:test";
import assert from "node:assert/strict";
import {
  applyDefaultNodeSize,
  clampNodeSizeToMinimum,
  NODE_LAYOUTS,
} from "../../web-src/shared/node-layout.js";
import { DIRECTOR_NODE_CLASS, EXTRACTOR_NODE_CLASS, MONITOR_NODE_CLASS } from "../../web-src/node-classes.js";

function fakeNode(size) {
  const node = { size };
  node.setSize = (next) => { node.size = next; };
  return node;
}

test("every OmniCam node class has a layout, and its minimum never exceeds its default", () => {
  for (const cls of [DIRECTOR_NODE_CLASS, EXTRACTOR_NODE_CLASS, MONITOR_NODE_CLASS]) {
    const layout = NODE_LAYOUTS[cls];
    assert.ok(layout, `${cls} has no registered layout`);
    assert.ok(layout.min[0] <= layout.default[0] && layout.min[1] <= layout.default[1],
      `${cls}'s minimum must not exceed its own default`);
  }
});

test("applyDefaultNodeSize sets a fresh node straight to its default, whatever size it had", () => {
  const node = fakeNode([50, 30]);
  const applied = applyDefaultNodeSize(node, DIRECTOR_NODE_CLASS);
  assert.equal(applied, true);
  assert.deepEqual(node.size, NODE_LAYOUTS[DIRECTOR_NODE_CLASS].default);
});

test("applyDefaultNodeSize does nothing for an unregistered node class", () => {
  const node = fakeNode([50, 30]);
  assert.equal(applyDefaultNodeSize(node, "SomeOtherNode"), false);
  assert.deepEqual(node.size, [50, 30]);
});

test("clampNodeSizeToMinimum leaves a size already above the floor untouched", () => {
  const node = fakeNode([1400, 1000]);
  const applied = clampNodeSizeToMinimum(node, DIRECTOR_NODE_CLASS);
  assert.equal(applied, false, "a size the user already has must never be reported as changed");
  assert.deepEqual(node.size, [1400, 1000]);
});

test("clampNodeSizeToMinimum raises a too-small restored size to the floor, and no further", () => {
  const node = fakeNode([300, 200]);
  const applied = clampNodeSizeToMinimum(node, DIRECTOR_NODE_CLASS);
  assert.equal(applied, true);
  assert.deepEqual(node.size, NODE_LAYOUTS[DIRECTOR_NODE_CLASS].min);
});

test("clampNodeSizeToMinimum clamps width and height independently", () => {
  // Restored size is narrow but tall: only width should move.
  const [minWidth, minHeight] = NODE_LAYOUTS[MONITOR_NODE_CLASS].min;
  const node = fakeNode([minWidth - 100, minHeight + 300]);
  clampNodeSizeToMinimum(node, MONITOR_NODE_CLASS);
  assert.equal(node.size[0], minWidth);
  assert.equal(node.size[1], minHeight + 300);
});

test("clampNodeSizeToMinimum treats a missing node.size as needing the floor, not a crash", () => {
  const node = fakeNode(undefined);
  const applied = clampNodeSizeToMinimum(node, EXTRACTOR_NODE_CLASS);
  assert.equal(applied, true);
  assert.deepEqual(node.size, NODE_LAYOUTS[EXTRACTOR_NODE_CLASS].min);
});

test("clampNodeSizeToMinimum prefers an explicit baseSize over node.size's current value", () => {
  // node.size has already been shrunk (by LiteGraph's own widget-less layout
  // pass) below the real saved size baseSize carries; the real saved size,
  // being comfortably above the minimum, must win untouched.
  const node = fakeNode([140, 80]);
  const applied = clampNodeSizeToMinimum(node, DIRECTOR_NODE_CLASS, [1313, 1633]);
  assert.equal(applied, true);
  assert.deepEqual(node.size, [1313, 1633]);
});

test("clampNodeSizeToMinimum still floors an explicit baseSize that is itself below the minimum", () => {
  const node = fakeNode([140, 80]);
  const applied = clampNodeSizeToMinimum(node, DIRECTOR_NODE_CLASS, [300, 200]);
  assert.equal(applied, true);
  assert.deepEqual(node.size, NODE_LAYOUTS[DIRECTOR_NODE_CLASS].min);
});

test("clampNodeSizeToMinimum falls back to node.size when no baseSize is given", () => {
  const node = fakeNode([1400, 1000]);
  const applied = clampNodeSizeToMinimum(node, DIRECTOR_NODE_CLASS, null);
  assert.equal(applied, false);
  assert.deepEqual(node.size, [1400, 1000]);
});

test("neither function throws when node.setSize is missing", () => {
  assert.equal(applyDefaultNodeSize({}, DIRECTOR_NODE_CLASS), false);
  assert.equal(clampNodeSizeToMinimum({}, DIRECTOR_NODE_CLASS), false);
});
