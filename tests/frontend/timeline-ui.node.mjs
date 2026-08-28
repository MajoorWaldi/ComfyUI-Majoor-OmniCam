// The dope sheet ruler, the graph axes and the per-component dope rows.
//
// These are pure enough to test without a DOM: they answer "which numbers go
// on the axis" and "which frames carry a diamond", which is exactly where the
// old code was wrong (labels like 9 / 18 / 28, and a channel row that could
// not say when a component actually moved).

import test from "node:test";
import assert from "node:assert/strict";

import { rulerStep, rulerTicks } from "../../web-src/timeline/ruler.js";
import { niceStep } from "../../web-src/curve-editor/axes.js";
import { componentFrames } from "../../web-src/curve-editor/dope-view.js";
import { gateAspect } from "../../web-src/viewport/resolution-gate.js";

function ui(durationFrames, { zoom = 1, pan = 0 } = {}) {
  return { state: { duration_frames: durationFrames }, timelineZoom: zoom, timelinePan: pan };
}

// ---------------------------------------------------------------------------
// Ruler
// ---------------------------------------------------------------------------

test("the ruler labels round frame numbers, never arbitrary divisions", () => {
  const ticks = rulerTicks(ui(121), 900).filter((tick) => tick.major);
  assert.deepEqual(ticks.map((tick) => tick.frame), [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]);
});

test("the ruler step grows with the span and shrinks with the width", () => {
  assert.ok(rulerStep(120, 900) < rulerStep(1200, 900), "a longer shot needs a coarser step");
  assert.ok(rulerStep(120, 300) > rulerStep(120, 900), "a narrower ruler needs a coarser step");
});

test("every ruler step is a number a human reads without counting", () => {
  for (const span of [12, 48, 121, 300, 1440, 14400]) {
    for (const width of [240, 600, 1200]) {
      const step = rulerStep(span, width);
      const mantissa = step / 10 ** Math.floor(Math.log10(step));
      assert.ok([1, 2, 2.5, 5].includes(Number(mantissa.toFixed(3))), `${step} is not a round step`);
    }
  }
});

test("the last frame always carries a label", () => {
  // A 143-frame shot on a step of 20 would otherwise end its ruler at 140 and
  // read as if the shot stopped early.
  for (const duration of [121, 144, 97, 251]) {
    const ticks = rulerTicks(ui(duration), 900).filter((tick) => tick.major);
    assert.equal(ticks.at(-1).frame, duration - 1, `duration ${duration}`);
  }
});

test("pinning the end frame never leaves two labels on top of each other", () => {
  const width = 900;
  for (const duration of [97, 122, 143, 251, 1001]) {
    const majors = rulerTicks(ui(duration), width).filter((tick) => tick.major);
    for (let index = 1; index < majors.length; index += 1) {
      const gapPixels = ((majors[index].percent - majors[index - 1].percent) / 100) * width;
      assert.ok(gapPixels > 20, `labels ${majors[index - 1].frame}/${majors[index].frame} are ${gapPixels}px apart`);
    }
  }
});

test("the ruler only emits ticks inside the zoomed window", () => {
  const ticks = rulerTicks(ui(121, { zoom: 4, pan: 60 }), 900);
  assert.ok(ticks.length, "a zoomed ruler still has ticks");
  for (const tick of ticks) {
    assert.ok(tick.percent >= -1 && tick.percent <= 101, `${tick.frame} is off-screen at ${tick.percent}%`);
  }
});

// ---------------------------------------------------------------------------
// Graph value axis
// ---------------------------------------------------------------------------

test("the value axis snaps to 1 / 2 / 2.5 / 5 times a power of ten", () => {
  for (const span of [0.004, 0.7, 3, 17, 92, 4800, 1e6]) {
    const step = niceStep(span, 4);
    const mantissa = step / 10 ** Math.floor(Math.log10(step));
    assert.ok([1, 2, 2.5, 5].includes(Number(mantissa.toFixed(3))), `span ${span} gave step ${step}`);
  }
});

test("a degenerate value range still yields a usable step", () => {
  assert.ok(niceStep(0, 4) > 0);
  assert.ok(Number.isFinite(niceStep(Number.NaN, 4)));
});

// ---------------------------------------------------------------------------
// Per-component dope rows
// ---------------------------------------------------------------------------

const channel = { get: (camera) => (camera.position || [0, 0, 0])[0] };

test("a component row marks only the frames where that component moves", () => {
  const keys = [
    { frame: 0, camera: { position: [0, 0, 0] } },
    { frame: 10, camera: { position: [0, 5, 0] } },   // Y moved, X did not
    { frame: 20, camera: { position: [3, 5, 0] } },   // X moved
    { frame: 30, camera: { position: [3, 9, 0] } },   // Y moved, X did not
  ];
  assert.deepEqual(componentFrames(keys, channel, false), [0, 20]);
});

test("the first key is always marked, because it establishes the value", () => {
  const keys = [{ frame: 4, camera: { position: [7, 0, 0] } }, { frame: 8, camera: { position: [7, 0, 0] } }];
  assert.deepEqual(componentFrames(keys, channel, false), [4]);
});

test("component rows read object transforms when an object is selected", () => {
  const keys = [
    { frame: 0, transform: { position: [1, 0, 0] }, camera: { position: [99, 0, 0] } },
    { frame: 5, transform: { position: [2, 0, 0] }, camera: { position: [99, 0, 0] } },
  ];
  assert.deepEqual(componentFrames(keys, channel, true), [0, 5], "must follow the object, not the camera");
  assert.deepEqual(componentFrames(keys, channel, false), [0], "the camera did not move");
});

test("unsorted keys are still reported in frame order", () => {
  const keys = [
    { frame: 20, camera: { position: [2, 0, 0] } },
    { frame: 0, camera: { position: [0, 0, 0] } },
    { frame: 10, camera: { position: [1, 0, 0] } },
  ];
  assert.deepEqual(componentFrames(keys, channel, false), [0, 10, 20]);
});

test("a channel that throws does not take the row down with it", () => {
  const hostile = { get: () => { throw new Error("no such field"); } };
  const keys = [{ frame: 0, camera: {} }, { frame: 5, camera: {} }];
  // NaN never compares equal, so every key is marked rather than none.
  assert.deepEqual(componentFrames(keys, hostile, false), [0, 5]);
});

test("no keys means no rows, not a crash", () => {
  assert.deepEqual(componentFrames([], channel, false), []);
});

test("a ruler measured at zero pixels still produces a readable step", () => {
  // refreshKeys() can run before layout, and a collapsed node measures 0 wide.
  // rulerStep(120, 0) used to return its coarsest step, so the live node came
  // up with a single label at the end of the shot.
  assert.equal(rulerStep(120, 0), rulerStep(120, 640), "zero width must fall back, not degrade");
});

// ---------------------------------------------------------------------------
// Resolution gate
// ---------------------------------------------------------------------------

test("the gate follows the node output when no explicit ratio is chosen", () => {
  // Regression: the main viewport ignored resolution_gate entirely and had no
  // shot-aspect fallback, so the checkbox did nothing where it mattered.
  assert.equal(gateAspect({ aspect_ratio: "auto", resolution_gate: true, width: 1024, height: 1024 }), 1);
  assert.equal(gateAspect({ aspect_ratio: "auto", resolution_gate: true, width: 832, height: 480 }), 832 / 480);
});

test("an explicit ratio wins over the node output", () => {
  assert.equal(gateAspect({ aspect_ratio: "2.39:1", resolution_gate: false, width: 1024, height: 1024 }), 2.39);
  assert.equal(gateAspect({ aspect_ratio: "9:16", resolution_gate: true, width: 1280, height: 720 }), 9 / 16);
});

test("no gate is requested when the box is clear and the ratio is auto", () => {
  assert.equal(gateAspect({ aspect_ratio: "auto", resolution_gate: false, width: 1024, height: 1024 }), null);
});

test("a nonsensical output size asks for no gate rather than dividing by zero", () => {
  for (const state of [{ width: 0, height: 720 }, { width: 1280, height: 0 }, { width: NaN, height: 720 }]) {
    assert.equal(gateAspect({ aspect_ratio: "auto", resolution_gate: true, ...state }), null);
  }
  assert.equal(gateAspect(null), null);
});
