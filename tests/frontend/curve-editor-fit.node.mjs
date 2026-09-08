// Graph Editor framing (fitCurveView), double-click insertion, and hover tests.

import test from "node:test";
import assert from "node:assert/strict";
import {
  fitCurveView,
  onCurveDoubleClick,
  onCurvePointerDown,
  onCurvePointerMove,
  resetCurveZoom,
} from "../../web-src/curve-editor/interactions.js";

function mockUI() {
  const keyA = { frame: 10, camera: { position: [0, 5, 0], target: [0, 0, 0], fov: 35, roll: 0, zoom: 1 } };
  const keyB = { frame: 20, camera: { position: [2, 15, 0], target: [0, 0, 0], fov: 40, roll: 0, zoom: 1 } };
  const keyC = { frame: 80, camera: { position: [4, 25, 0], target: [0, 0, 0], fov: 50, roll: 0, zoom: 1 } };
  const keys = [keyA, keyB, keyC];

  const channel = { id: "pos_y", name: "Position Y", get: (cam) => cam?.position?.[1] ?? 0 };

  const ui = {
    state: { duration_frames: 100, keyframes: keys },
    frame: 0,
    selectedKeyFrame: null,
    selectedKeyFrames: null,
    curveZoom: 1.0,
    curveZoomX: 1.0,
    curvePanX: 0,
    curvePanY: 0,
    root: {
      querySelector(sel) {
        if (sel === '[data-role="curve-group"]') return { value: "camera" };
        return null;
      },
    },
    curveHitPoints: [
      { x: 100, y: 100, key: keyA, channel, handle: null },
      { x: 200, y: 100, key: keyB, channel, handle: null },
      { x: 300, y: 100, key: keyC, channel, handle: null },
    ],
    timelineObject() { return null; },
    timelineKeyframes() { return keys; },
    drawCurveEditor() { this.redrawn = true; },
    setStatus(msg) { this.status = msg; },
    checkpoint(name) { this.lastCheckpoint = name; },
    setFrame(f) { this.frame = f; },
    insertKeyframe() {
      const newKey = { frame: this.frame, camera: { position: [1, 10, 0] } };
      keys.push(newKey);
      keys.sort((a, b) => a.frame - b.frame);
      this.insertedKey = newKey;
    },
    selectKeyframe(key) { this.selectedKeyFrame = key.frame; this.selectedKeyFrames = new Set([key.frame]); },
    updateKeyVisualState() {},
    refreshKeys() {},
  };

  return { ui, keys, keyA, keyB, keyC };
}

function mockPointerEvent(x, y, overrides = {}) {
  return {
    currentTarget: {
      clientWidth: 400,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 180 }),
      focus() {},
    },
    clientX: x,
    clientY: y,
    button: 0,
    shiftKey: false,
    altKey: false,
    preventDefault() {},
    stopPropagation() {},
    ...overrides,
  };
}

test("fitCurveView on full track sets zoomX to 1 and panX to 0", () => {
  const { ui } = mockUI();
  fitCurveView(ui);
  assert.equal(ui.curveZoomX, 1.0);
  assert.equal(ui.curvePanX, 0);
  assert.equal(ui.status, "Curve view fitted");
});

test("fitCurveView with subset of keys selected frames the selected range", () => {
  const { ui } = mockUI();
  ui.selectedKeyFrames = new Set([10, 20]);
  ui.selectedKeyFrame = 20;

  fitCurveView(ui);
  assert.ok(ui.curveZoomX > 1.0, `expected zoomX > 1, got ${ui.curveZoomX}`);
  assert.ok(ui.curvePanX >= 0, `expected panX >= 0, got ${ui.curvePanX}`);
  assert.ok(ui.status.includes("Fitted to 2 selected keys"));
});

test("fitCurveView handles empty track gracefully", () => {
  const { ui } = mockUI();
  ui.timelineKeyframes = () => [];
  fitCurveView(ui);
  assert.equal(ui.curveZoom, 1.0);
  assert.equal(ui.curveZoomX, 1.0);
  assert.equal(ui.curvePanX, 0);
  assert.equal(ui.curvePanY, 0);
  assert.equal(ui.status, "Curve view fitted");
});

test("resetCurveZoom delegates to fitCurveView", () => {
  const { ui } = mockUI();
  ui.selectedKeyFrames = new Set([10, 20]);
  resetCurveZoom(ui);
  assert.ok(ui.curveZoomX > 1.0);
});

test("onCurveDoubleClick inserts keyframe at calculated frame", () => {
  const { ui } = mockUI();
  const initialCount = ui.timelineKeyframes().length;

  onCurveDoubleClick(ui, mockPointerEvent(200, 100));
  assert.equal(ui.timelineKeyframes().length, initialCount + 1);
  assert.equal(ui.lastCheckpoint, "Insert keyframe");
  assert.ok(ui.selectedKeyFrames.has(ui.frame));
});

test("onCurveDoubleClick ignores top ruler area (y < 20)", () => {
  const { ui } = mockUI();
  const initialCount = ui.timelineKeyframes().length;

  onCurveDoubleClick(ui, mockPointerEvent(200, 10));
  assert.equal(ui.timelineKeyframes().length, initialCount);
});

test("onCurvePointerMove sets curveHover when hovering near key hit point", () => {
  const { ui } = mockUI();
  onCurvePointerMove(ui, mockPointerEvent(100, 100));
  assert.ok(ui.curveHover);
  assert.equal(ui.curveHover.frame, 10);
  assert.equal(ui.curveHover.channelName, "Position Y");
});

test("onCurvePointerDown clears curveHover", () => {
  const { ui } = mockUI();
  ui.curveHover = { frame: 10 };
  onCurvePointerDown(ui, mockPointerEvent(100, 100));
  assert.equal(ui.curveHover, null);
});
