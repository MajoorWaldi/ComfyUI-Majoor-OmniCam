// Graph Editor (curve editor) key selection must match the Shift+click-add
// and Shift+drag-additive-marquee conventions every other panel in this app
// (Timeline, Dope Sheet) and every DCC's graph editor already supports.

import test from "node:test";
import assert from "node:assert/strict";
import { onCurvePointerDown, onCurvePointerMove } from "../../web-src/curve-editor/interactions.js";

function fixture() {
  const keyA = { frame: 5, camera: { position: [0, 0, 0] } };
  const keyB = { frame: 10, camera: { position: [1, 0, 0] } };
  const keyC = { frame: 15, camera: { position: [2, 0, 0] } };
  const channel = { get: (value) => value.position?.[0] ?? 0 };
  return {
    ui: {
      state: { duration_frames: 100 },
      frame: 0, selectedKeyFrame: null, selectedKeyFrames: null,
      curveHitPoints: [
        { x: 100, y: 100, key: keyA, channel, handle: null },
        { x: 200, y: 100, key: keyB, channel, handle: null },
        { x: 300, y: 100, key: keyC, channel, handle: null },
      ],
      selectKeyframe(key) { this.selectedKeyFrame = key.frame; this.selectedKeyFrames = new Set([key.frame]); },
      setFrame(frame) { this.frame = frame; },
      updateKeyVisualState() {}, refreshKeyEditor() {}, drawCurveEditor() {},
      timelineKeyframes() { return [keyA, keyB, keyC]; },
    },
    keyA, keyB, keyC,
  };
}

function pointerEvent(x, y, overrides = {}) {
  return {
    currentTarget: { clientWidth: 400, getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 180 }), focus() {} },
    clientX: x, clientY: y, button: 0, shiftKey: false, altKey: false,
    preventDefault() {}, stopPropagation() {}, ...overrides,
  };
}

test("plain click on a key replaces the selection", () => {
  const { ui } = fixture();
  onCurvePointerDown(ui, pointerEvent(200, 100));
  assert.deepEqual(ui.selectedKeyFrame, 10);
  assert.deepEqual([...ui.selectedKeyFrames], [10]);
});

const byValue = (a, b) => a - b;

test("Shift+click adds a key to the selection instead of replacing it (regression)", () => {
  const { ui } = fixture();
  onCurvePointerDown(ui, pointerEvent(100, 100)); // select key A (frame 5)
  onCurvePointerDown(ui, pointerEvent(300, 100, { shiftKey: true })); // shift-add key C (frame 15)
  assert.deepEqual([...ui.selectedKeyFrames].sort(byValue), [5, 15], "both keys must stay selected");
});

test("Shift+click on an already-selected key removes it (toggle)", () => {
  const { ui } = fixture();
  onCurvePointerDown(ui, pointerEvent(100, 100));
  onCurvePointerDown(ui, pointerEvent(200, 100, { shiftKey: true }));
  onCurvePointerDown(ui, pointerEvent(200, 100, { shiftKey: true })); // toggle key B back off
  assert.deepEqual([...ui.selectedKeyFrames], [5]);
});

test("Shift+click on a key does not start a value drag", () => {
  const { ui } = fixture();
  onCurvePointerDown(ui, pointerEvent(200, 100, { shiftKey: true })); // shift-click from a clean state
  assert.equal(ui.curveDrag, undefined, "a shift-click only selects, like the Timeline's own shift-click");
});

test("a marquee drawn in empty space replaces the selection", () => {
  const { ui } = fixture();
  onCurvePointerDown(ui, pointerEvent(50, 50)); // empty space, no shift
  onCurvePointerMove(ui, pointerEvent(250, 150));
  assert.deepEqual([...ui.selectedKeyFrames].sort(byValue), [5, 10], "keys A and B fall inside the box");
});

test("Shift+drag marquee merges with the existing selection instead of replacing it (regression)", () => {
  const { ui } = fixture();
  onCurvePointerDown(ui, pointerEvent(300, 100)); // select key C (frame 15) first
  onCurvePointerDown(ui, pointerEvent(50, 50, { shiftKey: true })); // shift-drag a box over A and B
  onCurvePointerMove(ui, pointerEvent(250, 150, { shiftKey: true }));
  assert.deepEqual([...ui.selectedKeyFrames].sort(byValue), [5, 10, 15], "the marquee must add to, not replace, the prior selection");
});
