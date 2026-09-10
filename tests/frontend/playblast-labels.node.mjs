import assert from "node:assert/strict";
import test from "node:test";

import { defaultCamera } from "../../web-src/director/core.js";
import { drawPlayblastLabels } from "../../web-src/viewport-overlays.js";

function fakeCtx() {
  const calls = { fillText: [], roundRect: 0, stroke: 0 };
  return {
    calls,
    save() {}, restore() {}, beginPath() {}, closePath() {}, fill() {},
    moveTo() {}, lineTo() {}, arcTo() {},
    roundRect() { calls.roundRect += 1; },
    stroke() { calls.stroke += 1; },
    measureText(text) { return { width: text.length * 7 }; },
    fillText(text, x, y) { calls.fillText.push({ text, x, y }); },
    set font(v) {}, set fillStyle(v) {}, set strokeStyle(v) {}, set lineWidth(v) {},
    set textBaseline(v) {},
  };
}

function fakeUi(overrides = {}) {
  const camera = defaultCamera();
  camera.position = [0, 2, 6];
  camera.target = [0, 1, 0];
  return {
    ctx: fakeCtx(),
    canvas: { width: 1280, height: 720 },
    frame: 0,
    recording: true,
    selectedObjectIds: new Set(),
    viewportCamera: () => camera,
    state: {
      objects: [
        { id: "hero", type: "cube", position: [0, 1, 0], size: [1, 1, 1], enabled: true, tags: ["hero"] },
      ],
      metadata: { viewport_labels: { mode: "all", content: "tag" } },
      playblast_labels: true,
      ...overrides.state,
    },
    ...overrides,
  };
}

test("drawPlayblastLabels paints a label for a tagged object", () => {
  const ui = fakeUi();
  drawPlayblastLabels(ui);
  assert.equal(ui.ctx.calls.fillText.length, 1);
  assert.equal(ui.ctx.calls.fillText[0].text, "hero");
  assert.ok(ui.ctx.calls.roundRect >= 1, "draws a rounded pill behind the text");
});

test("label mode 'off' paints nothing", () => {
  const ui = fakeUi({ state: {
    objects: [{ id: "hero", type: "cube", position: [0, 1, 0], size: [1, 1, 1], enabled: true, tags: ["hero"] }],
    metadata: { viewport_labels: { mode: "off", content: "tag" } },
    playblast_labels: true,
  } });
  drawPlayblastLabels(ui);
  assert.equal(ui.ctx.calls.fillText.length, 0);
});

test("annotation content uses the annotation colour as accent", () => {
  const ui = fakeUi({ state: {
    objects: [{
      id: "hero", type: "cube", position: [0, 1, 0], size: [1, 1, 1], enabled: true,
      annotation: { text: "SUBJECT", visible: true, color: "#ff3366", anchor: "top" },
    }],
    metadata: { viewport_labels: { mode: "all", content: "annotation" } },
    playblast_labels: true,
  } });
  drawPlayblastLabels(ui);
  assert.equal(ui.ctx.calls.fillText[0].text, "SUBJECT");
  assert.ok(ui.ctx.calls.stroke >= 1, "an accent border is stroked for annotations");
});

test("a hidden object is skipped", () => {
  const ui = fakeUi();
  ui.state.objects[0].enabled = false;
  drawPlayblastLabels(ui);
  assert.equal(ui.ctx.calls.fillText.length, 0);
});
