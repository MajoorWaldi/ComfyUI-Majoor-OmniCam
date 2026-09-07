// A visible camera strip used to re-render every tile's WebGL scene on every
// frame, so an N-camera shot cost N+1 scene renders per playback frame. During
// playback only the active camera now repaints every frame; the rest share one
// round-robin slot. A single scrub or edit still repaints all of them.

import test from "node:test";
import assert from "node:assert/strict";

import { createRenderMethods } from "../../web-src/director/methods/render.js";

const { renderCameraView } = createRenderMethods({
  drawPreviewOverlays: () => {},
  sampleCamera: (track) => ({ position: [0, 0, 5], target: [0, 0, 0], fov: 35, camera_type: "perspective", zoom: 1 }),
});

function fixture(cameraCount) {
  const ids = Array.from({ length: cameraCount }, (_, i) => `cam_${i}`);
  let sceneRenders = 0;
  const canvases = new Map();
  const contexts = new Map();
  for (const id of ids) {
    canvases.set(id, { width: 20, height: 12 });
    contexts.set(id, { fillStyle: "", fillRect: () => {}, drawImage: () => {} });
  }
  const ui = {
    state: {
      camera_view_visible: true,
      cameras: ids.map((id) => ({ id })),
      active_camera_id: "cam_0",
      objects: [],
    },
    frame: 0,
    playing: false,
    recording: false,
    renderRevision: 0,
    root: { querySelector: () => null },
    cameraPreviewCanvases: canvases,
    cameraPreviewContexts: contexts,
    refreshCameraPreviews: () => {},
    cameraWebgl: { canvas: {}, render: () => { sceneRenders += 1; } },
  };
  return { ui, renders: () => sceneRenders };
}

test("a single scrub renders every camera tile", () => {
  const { ui, renders } = fixture(5);
  renderCameraView.call(ui);
  assert.equal(renders(), 5, "not playing: all five previews repaint");
});

test("playback renders the active camera every frame and the rest round-robin", () => {
  const { ui, renders } = fixture(5);
  ui.playing = true;
  for (let frame = 0; frame < 4; frame += 1) {
    ui.frame = frame;
    renderCameraView.call(ui);
  }
  // 4 frames * (1 active + 1 rotating) = 8, never 4 * 5 = 20.
  assert.equal(renders(), 8, "each frame costs 2 scene renders, not 5");
});

test("two cameras are cheap enough to always render both", () => {
  const { ui, renders } = fixture(2);
  ui.playing = true;
  renderCameraView.call(ui);
  assert.equal(renders(), 2, "the <=2 camera case is not throttled");
});

test("a hidden camera strip skips every preview render", () => {
  const { ui, renders } = fixture(3);
  ui.root.querySelector = (sel) => (sel.includes("camera-view-row") ? { hidden: true } : null);
  renderCameraView.call(ui);
  assert.equal(renders(), 0);
});
