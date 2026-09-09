import test from "node:test";
import assert from "node:assert/strict";

import { UI_DIRTY, mergeDirty, hasDirty } from "../../web-src/director/ui-dirty.js";
import { createRenderMethods } from "../../web-src/director/methods/render.js";

test("mergeDirty ORs masks and hasDirty tests one flag", () => {
  const mask = mergeDirty(UI_DIRTY.viewport, UI_DIRTY.timeline);
  assert.ok(hasDirty(mask, UI_DIRTY.viewport));
  assert.ok(hasDirty(mask, UI_DIRTY.timeline));
  assert.ok(!hasDirty(mask, UI_DIRTY.outliner));
  assert.equal(mergeDirty(0, 0), 0);
  assert.equal(mergeDirty(UI_DIRTY.all, UI_DIRTY.viewport), UI_DIRTY.all);
});

function harness() {
  const calls = [];
  const spy = (name) => () => calls.push(name);
  const queue = [];
  const ui = {
    disposed: false,
    perf: null,
    renderViewportOnly: spy("viewport"),
    renderMotionUiOnly: spy("motion"),
    renderCameraView: spy("previews"),
    refreshObjects: spy("outliner"),
    refreshKeys: spy("timeline"),
    refreshInspector: spy("inspector"),
  };
  const methods = createRenderMethods({});
  ui.requestUiUpdate = methods.requestUiUpdate;
  ui.requestRender = methods.requestRender;
  const realRaf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (fn) => { queue.push(fn); return queue.length; };
  const flush = () => { const fns = queue.splice(0); for (const fn of fns) fn(); };
  const restore = () => { globalThis.requestAnimationFrame = realRaf; };
  return { ui, calls, queue, flush, restore };
}

test("20 invalidations in one tick schedule exactly one animation frame", () => {
  const { ui, queue, flush, restore } = harness();
  try {
    for (let i = 0; i < 20; i += 1) ui.requestUiUpdate(UI_DIRTY.viewport, "burst");
    assert.equal(queue.length, 1);
    flush();
    assert.equal(queue.length, 0);
  } finally {
    restore();
  }
});

test("a viewport-only invalidation never refreshes the outliner", () => {
  const { ui, calls, flush, restore } = harness();
  try {
    ui.requestUiUpdate(UI_DIRTY.viewport, "orbit");
    flush();
    assert.deepEqual(calls, ["viewport"]);
    assert.ok(!calls.includes("outliner"));
    assert.ok(!calls.includes("motion"));
  } finally {
    restore();
  }
});

test("an outliner-only invalidation never renders the WebGL viewport", () => {
  const { ui, calls, flush, restore } = harness();
  try {
    ui.requestUiUpdate(UI_DIRTY.outliner, "rename");
    flush();
    assert.deepEqual(calls, ["outliner"]);
    assert.ok(!calls.includes("viewport"));
    assert.ok(!calls.includes("previews"));
  } finally {
    restore();
  }
});

test("merged masks in one tick run every marked domain once, in order", () => {
  const { ui, calls, flush, restore } = harness();
  try {
    ui.requestUiUpdate(UI_DIRTY.viewport | UI_DIRTY.previews, "a");
    ui.requestUiUpdate(UI_DIRTY.timeline | UI_DIRTY.inspector, "b");
    flush();
    assert.deepEqual(calls, ["timeline", "inspector", "viewport", "previews"]);
  } finally {
    restore();
  }
});

test("requestRender stays the viewport + previews + motion repaint", () => {
  const { ui, calls, flush, restore } = harness();
  try {
    ui.requestRender("legacy");
    flush();
    assert.deepEqual(calls.sort(), ["motion", "previews", "viewport"]);
  } finally {
    restore();
  }
});
