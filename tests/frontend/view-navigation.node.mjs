import test from "node:test";
import assert from "node:assert/strict";

import { defaultEditorViews, sanitizeState } from "../../web-src/director/core.js";
import { setViewMode } from "../../web-src/viewport-controls.js";
import { QUICK_VIEW_MODES, axisViewFor } from "../../web-src/view-navigation.js";
import { viewportMarkup } from "../../web-src/template/viewport.js";

test("ISO is a serialized editor view and never mutates the camera track", () => {
  const state = sanitizeState({ view_mode: "iso" });
  const before = JSON.stringify(state.cameras);
  let serialized = 0;
  let rendered = 0;
  const quickButton = { dataset: { view: "iso" }, classList: { toggle() {} }, setAttribute() {} };
  const ui = {
    state,
    root: {
      querySelectorAll(selector) {
        if (selector === '[data-role="view-mode"]') return [];
        if (selector === "[data-view]") return [quickButton];
        return [];
      },
    },
    serialize() { serialized += 1; },
    render() { rendered += 1; },
    setStatus() {},
  };

  assert.equal(state.view_mode, "iso");
  assert.deepEqual(defaultEditorViews().iso.position, [10, 11, 10]);
  assert.equal(defaultEditorViews().iso.camera_type, "orthographic");

  setViewMode(ui, "iso");

  assert.equal(ui.state.view_mode, "iso");
  assert.equal(JSON.stringify(ui.state.cameras), before);
  assert.equal(serialized, 1);
  assert.equal(rendered, 1);
});

test("viewport markup exposes six direct views and interactive axis targets", () => {
  const markup = viewportMarkup();
  assert.equal((markup.match(/data-view="/g) || []).length, 6);
  for (const mode of QUICK_VIEW_MODES) assert.match(markup, new RegExp(`data-view="${mode}"`));
  assert.match(markup, /option value="iso"/);
  assert.match(markup, /data-axis-center/);
});

test("axis tips select the positive view first and flip from the current opposite pair", () => {
  assert.deepEqual(QUICK_VIEW_MODES, ["camera", "perspective", "front", "right", "top", "iso"]);
  assert.equal(axisViewFor("x", "perspective"), "right");
  assert.equal(axisViewFor("x", "right"), "left");
  assert.equal(axisViewFor("x", "left"), "right");
  assert.equal(axisViewFor("y", "iso"), "top");
  assert.equal(axisViewFor("y", "top"), "bottom");
  assert.equal(axisViewFor("z", "camera"), "front");
  assert.equal(axisViewFor("z", "front"), "back");
  assert.equal(axisViewFor("unknown", "front"), null);
});
