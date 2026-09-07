// The two user-resizable regions: the Outliner object list (drag vertically to
// show more objects) and the lower-deck camera-preview column (drag
// horizontally to enlarge the camera views). Sizes persist in ui.state and are
// clamped by sanitizeState.

import test from "node:test";
import assert from "node:assert/strict";

import { PANEL_LAYOUT, defaultState, sanitizeState } from "../../web-src/director/core.js";
import { applyPanelLayout, bindPanelResize } from "../../web-src/event-bindings/panel-resize.js";

test("defaultState seeds both panel sizes at their documented defaults", () => {
  const state = defaultState();
  assert.equal(state.outliner_height, PANEL_LAYOUT.outlinerHeight.default);
  assert.equal(state.preview_width, PANEL_LAYOUT.previewWidth.default);
});

test("sanitizeState clamps out-of-range or unusable panel sizes", () => {
  const low = sanitizeState({ outliner_height: 5, preview_width: 5 });
  assert.equal(low.outliner_height, PANEL_LAYOUT.outlinerHeight.min);
  assert.equal(low.preview_width, PANEL_LAYOUT.previewWidth.min);

  const high = sanitizeState({ outliner_height: 99999, preview_width: 99999 });
  assert.equal(high.outliner_height, PANEL_LAYOUT.outlinerHeight.max);
  assert.equal(high.preview_width, PANEL_LAYOUT.previewWidth.max);

  const nan = sanitizeState({ outliner_height: "nope", preview_width: null });
  assert.equal(nan.outliner_height, PANEL_LAYOUT.outlinerHeight.default);
  assert.equal(nan.preview_width, PANEL_LAYOUT.previewWidth.default);

  const kept = sanitizeState({ outliner_height: 300, preview_width: 400 });
  assert.equal(kept.outliner_height, 300);
  assert.equal(kept.preview_width, 400);
});

function makeHandle() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, fn) { (listeners.get(type) || listeners.set(type, []).get(type)).push(fn); },
    setPointerCapture() {}, releasePointerCapture() {},
    dispatch(type, event) { for (const fn of listeners.get(type) || []) fn(event); },
  };
}

function fixture(stateOverrides = {}) {
  const vars = {};
  const outliner = makeHandle();
  const preview = makeHandle();
  const previewRefits = [];
  const serializes = [];
  const ui = {
    state: { ...defaultState(), ...stateOverrides },
    root: {
      style: { setProperty: (name, value) => { vars[name] = value; } },
      querySelector: (sel) => (sel.includes("outliner-resize") ? outliner : sel.includes("preview-resize") ? preview : null),
    },
    refreshCameraPreviews: () => previewRefits.push(true),
    requestRender: () => {},
    scheduleSerialize: () => serializes.push(true),
  };
  bindPanelResize(ui, undefined);
  return { ui, vars, outliner, preview, previewRefits, serializes };
}

test("applyPanelLayout writes the current sizes as CSS custom properties", () => {
  const { vars } = fixture({ outliner_height: 260, preview_width: 320 });
  assert.equal(vars["--oc-outliner-h"], "260px");
  assert.equal(vars["--oc-preview-w"], "320px");
});

test("dragging the outliner handle grows the list height and persists it", () => {
  const { ui, vars, outliner, serializes } = fixture({ outliner_height: 150 });
  outliner.dispatch("pointerdown", { button: 0, pointerId: 1, clientY: 100, clientX: 0, preventDefault() {} });
  outliner.dispatch("pointermove", { pointerId: 1, clientY: 240, clientX: 0 });
  assert.equal(vars["--oc-outliner-h"], "290px", "the list follows the pointer live");
  outliner.dispatch("pointerup", { pointerId: 1, clientY: 240, clientX: 0 });
  assert.equal(ui.state.outliner_height, 290, "release commits the new height to state");
  assert.equal(serializes.length, 1, "and schedules a serialize");
});

test("dragging past the max clamps and never exceeds the bound", () => {
  const { ui, outliner } = fixture({ outliner_height: 150 });
  outliner.dispatch("pointerdown", { button: 0, pointerId: 1, clientY: 0, clientX: 0, preventDefault() {} });
  outliner.dispatch("pointerup", { pointerId: 1, clientY: 100000, clientX: 0 });
  assert.equal(ui.state.outliner_height, PANEL_LAYOUT.outlinerHeight.max);
});

test("dragging the preview splitter resizes the column and re-fits the tiles", () => {
  const { ui, vars, preview, previewRefits } = fixture({ preview_width: 236 });
  preview.dispatch("pointerdown", { button: 0, pointerId: 2, clientX: 400, clientY: 0, preventDefault() {} });
  preview.dispatch("pointermove", { pointerId: 2, clientX: 520, clientY: 0 });
  assert.equal(vars["--oc-preview-w"], "356px");
  preview.dispatch("pointerup", { pointerId: 2, clientX: 520, clientY: 0 });
  assert.equal(ui.state.preview_width, 356);
  assert.ok(previewRefits.length >= 1, "the WebGL preview tiles are re-measured for the new width");
});

test("double-click resets a handle to its default", () => {
  const { ui, preview } = fixture({ preview_width: 500 });
  preview.dispatch("dblclick", { preventDefault() {} });
  assert.equal(ui.state.preview_width, PANEL_LAYOUT.previewWidth.default);
});

test("arrow keys nudge the size and Shift takes a bigger step", () => {
  const { ui, outliner } = fixture({ outliner_height: 200 });
  outliner.dispatch("keydown", { key: "ArrowDown", preventDefault() {} });
  assert.equal(ui.state.outliner_height, 216);
  outliner.dispatch("keydown", { key: "ArrowUp", shiftKey: true, preventDefault() {} });
  assert.equal(ui.state.outliner_height, 168);
  outliner.dispatch("keydown", { key: "Home", preventDefault() {} });
  assert.equal(ui.state.outliner_height, PANEL_LAYOUT.outlinerHeight.default);
});
