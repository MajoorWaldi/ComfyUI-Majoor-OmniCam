// Scrubbing the timeline used to call setFrame() with its expensive default
// (refreshTimeline=true) on every single pointermove -- which rebuilds the
// whole keyframe lane AND recomputes the Camera Health report (an
// O(duration_frames) pass, see motion-health.js) from scratch. On a long
// animation that ran on every pixel of mouse movement during a drag.

import test from "node:test";
import assert from "node:assert/strict";

import { onTimelinePointerDown, onTimelinePointerMove, onTimelinePointerUp } from "../../web-src/timeline-interaction.js";

function fixture() {
  const setFrameCalls = [];
  let refreshKeysCalls = 0;
  const captured = new Set();
  const box = {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 60 }),
    clientWidth: 1000,
    focus() {},
    setPointerCapture: (id) => captured.add(id),
    hasPointerCapture: (id) => captured.has(id),
    releasePointerCapture: (id) => captured.delete(id),
  };
  const ui = {
    state: { duration_frames: 300 },
    timelineZoom: 1, timelinePan: 0,
    exitKeyEdit() {},
    setFrame: (frame, fromPlayback, refreshTimeline) => setFrameCalls.push({ frame, fromPlayback, refreshTimeline }),
    refreshKeys: () => { refreshKeysCalls++; },
  };
  return { ui, box, setFrameCalls, get refreshKeysCalls() { return refreshKeysCalls; } };
}

function pointerEvent(box, x, overrides = {}) {
  return {
    currentTarget: box, target: { closest: () => null },
    clientX: x, clientY: 10, button: 0, pointerId: 1, altKey: false, shiftKey: false,
    preventDefault() {}, stopPropagation() {},
    ...overrides,
  };
}

test("scrub-dragging the timeline defers the full rebuild to pointer release (regression)", () => {
  const { ui, box, setFrameCalls } = fixture();
  onTimelinePointerDown(ui, pointerEvent(box, 100));
  for (const x of [110, 130, 150, 170, 190]) onTimelinePointerMove(ui, pointerEvent(box, x));

  const dragMoves = setFrameCalls.slice(1); // first call is the initial pointerdown jump
  assert.ok(dragMoves.length > 0, "the drag must have moved the frame");
  for (const call of dragMoves) {
    assert.equal(call.refreshTimeline, false, "an in-drag scrub must use the light setFrame path");
  }
});

test("releasing a scrub drag catches up the keyframe lane and health zones exactly once", () => {
  const state = fixture();
  onTimelinePointerDown(state.ui, pointerEvent(state.box, 100));
  onTimelinePointerMove(state.ui, pointerEvent(state.box, 150));
  onTimelinePointerMove(state.ui, pointerEvent(state.box, 200));
  assert.equal(state.refreshKeysCalls, 0, "refreshKeys must not run mid-drag");
  onTimelinePointerUp(state.ui, pointerEvent(state.box, 200, { pointerId: 1 }));
  assert.equal(state.refreshKeysCalls, 1, "releasing the drag must catch up exactly once");
});

test("a plain click (no drag) still jumps the frame with the full refresh path", () => {
  const { ui, box, setFrameCalls } = fixture();
  onTimelinePointerDown(ui, pointerEvent(box, 100));
  assert.equal(setFrameCalls.length, 1);
  assert.equal(setFrameCalls[0].refreshTimeline, undefined, "the initial jump uses setFrame's own default (true)");
});
