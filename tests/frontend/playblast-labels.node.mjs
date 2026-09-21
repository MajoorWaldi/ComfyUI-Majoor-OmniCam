import assert from "node:assert/strict";
import test from "node:test";

import { defaultCamera, defaultEditorViews } from "../../web-src/director/core.js";
import { drawOverlays, drawPlayblastLabels } from "../../web-src/viewport-overlays.js";
import { viewportCamera } from "../../web-src/viewport-controls.js";

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
  const editorViews = defaultEditorViews();
  return {
    ctx: fakeCtx(),
    canvas: { width: 1280, height: 720 },
    frame: 0,
    recording: true,
    selectedObjectId: null,
    selectedObjectIds: new Set(),
    viewportCamera() { return viewportCamera(this); },
    playblastCameraAtFrame() { return camera; },
    camera,
    state: {
      view_mode: "camera",
      editor_views: editorViews,
      objects: [
        { id: "hero", type: "cube", position: [0, 1, 0], size: [1, 1, 1], enabled: true, tags: ["hero"] },
      ],
      metadata: { viewport_labels: { mode: "all", content: "tag" } },
      playblast_labels: true,
      ...overrides.state,
      editor_views: overrides.state?.editor_views || editorViews,
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

test("viewportCamera preserves editor view mode during recording", () => {
  const ui = fakeUi();
  ui.state.view_mode = "front";
  ui.recording = true;
  assert.equal(viewportCamera(ui), ui.state.editor_views.front);

  ui.state.view_mode = "top";
  assert.equal(viewportCamera(ui), ui.state.editor_views.top);

  ui.state.view_mode = "camera";
  assert.equal(viewportCamera(ui), ui.camera);
});

test("drawPlayblastLabels works in view modes (perspective, top, front, iso)", () => {
  for (const mode of ["perspective", "top", "front", "iso"]) {
    const ui = fakeUi({ state: {
      view_mode: mode,
      objects: [{
        id: "hero", type: "cube", position: [0, 1, 0], size: [1, 1, 1], enabled: true,
        annotation: { text: `Hero in ${mode}`, visible: true, color: "#4aa3ef" },
      }],
      metadata: { viewport_labels: { mode: "all", content: "annotation" } },
      playblast_labels: true,
    } });
    drawPlayblastLabels(ui);
    assert.equal(ui.ctx.calls.fillText.length, 1, `draws label in view mode ${mode}`);
    assert.equal(ui.ctx.calls.fillText[0].text, `Hero in ${mode}`);
    const py = ui.ctx.calls.fillText[0].y;
    assert.ok(py >= 0 && py <= 720, `label y (${py}) should be within viewport bounds for ${mode}`);
  }
});

test("drawPlayblastLabels supports selected object with single selectedObjectId", () => {
  const ui = fakeUi({
    selectedObjectId: "hero",
    selectedObjectIds: new Set(),
    state: {
      objects: [{ id: "hero", type: "cube", position: [0, 1, 0], size: [1, 1, 1], enabled: true, tags: ["target"] }],
      metadata: { viewport_labels: { mode: "selected", content: "tag" } },
      playblast_labels: true,
    },
  });
  drawPlayblastLabels(ui);
  assert.equal(ui.ctx.calls.fillText.length, 1);
  assert.equal(ui.ctx.calls.fillText[0].text, "target");
});

test("drawOverlays includes labels in playblast during editor view modes when viewport labels are active", () => {
  const ui = fakeUi({
    recording: true,
    state: {
      view_mode: "front",
      metadata: { viewport_labels: { mode: "all", content: "tag" } },
      playblast_labels: false, // Notice false, but view mode has active labels!
      objects: [{ id: "hero", type: "cube", position: [0, 1, 0], size: [1, 1, 1], enabled: true, tags: ["front-label"] }],
    },
  });
  drawOverlays(ui);
  assert.equal(ui.ctx.calls.fillText.length, 1, "labels automatically burn in during view mode playblast");
  assert.equal(ui.ctx.calls.fillText[0].text, "front-label");
});
