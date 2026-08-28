// The dead zone that stops a click from silently retiming a keyframe.
//
// Real report: on a timeline with several keys, users could not click around
// -- to select a key, or just because keys sit close together -- without
// nudging one. onKeyDragMove applied any pointer movement to the frame the
// instant it differed from the key's own frame, so the ordinary mouse jitter
// between a pointerdown and its pointerup (a handful of pixels) retimed the
// key on what the user experienced as a plain click.

import test from "node:test";
import assert from "node:assert/strict";

import { onKeyDragMove } from "../../web-src/timeline-interaction.js";

// onKeyDragMove creates a floating retime badge as a real DOM element, appended
// to drag.box, once a drag engages. This suite runs under node --test (no
// DOM), so minimal fakes stand in -- just enough surface for style/appendChild.
function fakeElement() {
  return { style: {}, appendChild() {}, set textContent(_value) {} };
}
if (typeof globalThis.document === "undefined") {
  globalThis.document = { createElement: () => fakeElement() };
}

// A 1000px-wide lane spanning frames 0-120: roughly 8.3px per frame.
const BOX = { getBoundingClientRect: () => ({ left: 0, width: 1000 }), appendChild() {} };
const START_X = 400; // ~frame 48

function fakeUi(overrides = {}) {
  const calls = { retimed: [], moved: [] };
  const ui = {
    state: { duration_frames: 121 },
    timelineZoom: 1,
    timelinePan: 0,
    snapFrame: (frame) => frame,
    editingKeyFrame: null,
    selectedKeyFrames: new Set([48]),
    scheduleSerialize: () => {},
    setFrame: (frame) => calls.moved.push(frame),
    retimeSelectedKey: (frame) => calls.retimed.push(frame),
    timelineKeyframes: () => overrides.keys || [{ frame: 48 }],
    ...overrides,
  };
  return { ui, calls };
}

function moveEvent(x, y = 200) {
  return { clientX: x, clientY: y };
}

test("a pointer move under the threshold does not retime the key", () => {
  const key = { frame: 48 };
  const { ui, calls } = fakeUi({ keys: [key] });
  ui.keyDrag = { key, box: BOX, moving: [{ key, startFrame: 48 }], startPointerFrame: 48, startClientX: START_X, startClientY: 200 };
  onKeyDragMove(ui, moveEvent(START_X + 2)); // ~0.2 frames, well under the pixel threshold
  assert.equal(calls.retimed.length, 0, "a 2px jitter must not retime the key");
  assert.equal(key.frame, 48);
});

test("a pointer move at or past the threshold retimes normally", () => {
  const key = { frame: 48 };
  const { ui, calls } = fakeUi({ keys: [key] });
  ui.keyDrag = { key, box: BOX, moving: [{ key, startFrame: 48 }], startPointerFrame: 48, startClientX: START_X, startClientY: 200 };
  onKeyDragMove(ui, moveEvent(START_X + 60)); // ~7 frames, a deliberate drag
  assert.ok(calls.retimed.length > 0, "a deliberate drag must still retime");
  assert.notEqual(calls.retimed.at(-1), 48);
});

test("once engaged, the drag keeps tracking even if the pointer drifts back near the start", () => {
  const key = { frame: 48 };
  // retimeSelectedKey mutates key.frame in the real implementation (scene.js);
  // onKeyDragMove's own re-entrancy check (`frame !== drag.key.frame`) depends
  // on that, so the fake must do the same.
  const { ui, calls } = fakeUi({ keys: [key], retimeSelectedKey: (frame) => { calls.retimed.push(frame); key.frame = frame; } });
  ui.keyDrag = { key, box: BOX, moving: [{ key, startFrame: 48 }], startPointerFrame: 48, startClientX: START_X, startClientY: 200 };
  onKeyDragMove(ui, moveEvent(START_X + 60)); // engage
  const engagedFrame = calls.retimed.at(-1);
  onKeyDragMove(ui, moveEvent(START_X + 1)); // drift back to ~1px from the origin
  assert.ok(calls.retimed.length > 1, "engagement must not reset once crossed");
  assert.notEqual(calls.retimed.at(-1), engagedFrame, "it should still follow the pointer");
});

test("a multi-key drag also respects the dead zone", () => {
  const a = { frame: 40 };
  const b = { frame: 55 };
  const { ui } = fakeUi({ keys: [a, b] });
  ui.selectedKeyFrames = new Set([40, 55]);
  ui.keyDrag = {
    key: a, box: BOX, startPointerFrame: 40, startClientX: START_X, startClientY: 200,
    moving: [{ key: a, startFrame: 40 }, { key: b, startFrame: 55 }],
  };
  onKeyDragMove(ui, moveEvent(START_X + 2));
  assert.deepEqual([a.frame, b.frame], [40, 55], "neither key moves under the threshold");
  onKeyDragMove(ui, moveEvent(START_X + 80));
  assert.notDeepEqual([a.frame, b.frame], [40, 55], "a deliberate drag moves the whole selection");
});

test("a duplicate-drag (Alt+drag) also waits for a deliberate move", () => {
  const clone = { frame: 48 };
  const { ui, calls } = fakeUi({ keys: [clone] });
  ui.keyDrag = { key: clone, box: BOX, isDuplicate: true, moving: [{ key: clone, startFrame: 48 }], startPointerFrame: 48, startClientX: START_X, startClientY: 200 };
  onKeyDragMove(ui, moveEvent(START_X + 1));
  assert.equal(calls.retimed.length, 0);
});
