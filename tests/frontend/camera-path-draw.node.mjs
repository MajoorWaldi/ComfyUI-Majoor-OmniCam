import test from "node:test";
import assert from "node:assert/strict";

import {
  appendCameraPathStroke,
  cancelCameraPathDraw,
  commitCameraPathStroke,
  handleCameraPathPointerDown,
  setCameraPathOrientation,
  startCameraPathDraw,
} from "../../web-src/director/camera-path-draw.js";

function camera(position = [4, 2, 5], target = [4, 2, 0]) {
  return { position: [...position], target: [...target], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 };
}

function fixture() {
  const source = {
    id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: camera(),
    keyframes: [{ frame: 0, camera: camera(), interpolation: "ease" }],
    target_object_id: null, target_offset: [0, 0, 0],
  };
  const calls = { checkpoints: [], activated: [], views: [], frames: [], statuses: [], serialized: 0, renders: 0 };
  const ui = {
    state: {
      fps: 24, duration_frames: 121, playback_range: [24, 96],
      cameras: [source], active_camera_id: source.id, playblast_camera_id: source.id,
      objects: [{ id: "hero", name: "Hero", position: [0, 1, 0], keyframes: [] }],
    },
    camera: camera(),
    activeCameraTrack: () => ui.state.cameras.find((item) => item.id === ui.state.active_camera_id),
    setViewMode: (mode) => { calls.views.push(mode); ui.state.view_mode = mode; },
    checkpoint: (label) => calls.checkpoints.push(label),
    activateCamera: (id) => { calls.activated.push(id); ui.state.active_camera_id = id; },
    setFrame: (frame) => calls.frames.push(frame),
    setStatus: (message) => calls.statuses.push(message),
    serialize: () => { calls.serialized += 1; },
    refreshObjects: () => {}, refreshKeys: () => {}, refreshInspector: () => {}, refreshCameraSelectors: () => {}, drawCurveEditor: () => {},
    render: () => { calls.renders += 1; },
  };
  return { ui, calls };
}

test("starting Draw Camera Path switches to Top view and captures the current camera height and In/Out range", () => {
  const { ui, calls } = fixture();
  startCameraPathDraw(ui);
  assert.equal(ui.cameraPathDraw.active, true);
  assert.equal(ui.cameraPathDraw.height, 2);
  assert.deepEqual(ui.cameraPathDraw.range, [24, 96]);
  assert.deepEqual(calls.views, ["top"]);
  assert.equal(calls.checkpoints.length, 0, "arming the tool is not an edit");
});

test("finishing a drawn stroke creates one animated camera with one undo checkpoint", () => {
  const { ui, calls } = fixture();
  startCameraPathDraw(ui);
  appendCameraPathStroke(ui, [0, 2, 0]);
  appendCameraPathStroke(ui, [2, 2, 0]);
  appendCameraPathStroke(ui, [4, 2, -3]);
  const id = commitCameraPathStroke(ui);

  assert.ok(id);
  assert.equal(ui.state.cameras.length, 2);
  assert.deepEqual(calls.checkpoints, ["Draw camera path"]);
  const created = ui.state.cameras.find((item) => item.id === id);
  assert.equal(created.keyframes[0].frame, 24);
  assert.equal(created.keyframes.at(-1).frame, 96);
  assert.equal(created.target_object_id, null);
  assert.equal(calls.activated.at(-1), id);
  assert.equal(ui.cameraPathDraw, null);
});

test("cancelling Draw Camera Path discards the transient stroke without spending undo history", () => {
  const { ui, calls } = fixture();
  startCameraPathDraw(ui);
  appendCameraPathStroke(ui, [0, 2, 0]);
  appendCameraPathStroke(ui, [3, 2, 0]);
  cancelCameraPathDraw(ui);
  assert.equal(ui.cameraPathDraw, null);
  assert.equal(ui.state.cameras.length, 1);
  assert.equal(calls.checkpoints.length, 0);
});

test("a stroke too short to form a camera path is cancelled without mutation", () => {
  const { ui, calls } = fixture();
  startCameraPathDraw(ui);
  appendCameraPathStroke(ui, [0, 2, 0]);
  assert.equal(commitCameraPathStroke(ui), null);
  assert.equal(ui.state.cameras.length, 1);
  assert.equal(calls.checkpoints.length, 0);
});

test("camera path orientation can switch from Follow Path to a selected Look At object and back", () => {
  const { ui, calls } = fixture();
  startCameraPathDraw(ui);
  appendCameraPathStroke(ui, [0, 2, 0]);
  appendCameraPathStroke(ui, [2, 2, 0]);
  appendCameraPathStroke(ui, [4, 2, -2]);
  const id = commitCameraPathStroke(ui);
  const created = ui.state.cameras.find((item) => item.id === id);
  const authoredTargets = created.keyframes.map((key) => [...key.camera.target]);

  setCameraPathOrientation(ui, "look_at", "hero");
  assert.equal(created.target_object_id, "hero");
  assert.deepEqual(created.target_offset, [0, 0, 0]);

  setCameraPathOrientation(ui, "follow_path");
  assert.equal(created.target_object_id, null);
  assert.deepEqual(created.keyframes.map((key) => key.camera.target), authoredTargets,
    "the authored tangent targets survive the temporary look-at constraint");
  assert.equal(calls.checkpoints.length, 3, "draw + two orientation edits are independently undoable");
});

test("drawn keys keep the captured camera height", () => {
  const { ui } = fixture();
  startCameraPathDraw(ui);
  appendCameraPathStroke(ui, [0, 99, 0]);
  appendCameraPathStroke(ui, [2, -10, 0]);
  appendCameraPathStroke(ui, [4, 8, -2]);
  const id = commitCameraPathStroke(ui);
  const created = ui.state.cameras.find((item) => item.id === id);
  assert.ok(created.keyframes.every((key) => key.camera.position[1] === 2));
});

test("armed pointer-down consumes plain LMB but passes navigation gestures through", () => {
  const { ui } = fixture();
  ui.interactionElement = { focus() {}, setPointerCapture() {}, hasPointerCapture: () => false };
  ui.canvas = { width: 800, height: 600 };
  ui.closeMenus = () => {};
  startCameraPathDraw(ui);

  const event = (over) => ({
    pointerId: 1, clientX: 0, clientY: 0,
    preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
    button: 0, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false,
    ...over,
  });

  assert.equal(handleCameraPathPointerDown(ui, event({ button: 1 })), false, "MMB navigation");
  assert.equal(handleCameraPathPointerDown(ui, event({ button: 0, altKey: true })), false, "Maya Alt+LMB");
  assert.equal(handleCameraPathPointerDown(ui, event({ button: 0, ctrlKey: true })), false, "Ctrl fallback");
  assert.equal(handleCameraPathPointerDown(ui, event({ button: 0 })), true, "plain LMB draws");
  assert.equal(ui.cameraPathDraw.drawing, true);
});

test("stroke density does not dictate camera spacing", () => {
  const { ui } = fixture();
  startCameraPathDraw(ui);
  appendCameraPathStroke(ui, [0, 2, 0]);
  appendCameraPathStroke(ui, [1, 2, 0]);
  appendCameraPathStroke(ui, [10, 2, 0]);
  const id = commitCameraPathStroke(ui);
  const created = ui.state.cameras.find((item) => item.id === id);
  assert.equal(created.keyframes.length, 3);
  assert.ok(Math.abs(created.keyframes[1].camera.position[0] - 5) < 0.15);
});
