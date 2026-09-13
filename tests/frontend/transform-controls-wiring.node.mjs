import test from "node:test";
import assert from "node:assert/strict";

import { createTransformControlsWiring } from "../../web-src/viewport/transform-controls-wiring.js";

// Minimal fakes mirroring the real TransformControls / anchor shape used by
// transform-controls-adapter.node.mjs, so the wiring module is driven through
// the exact same event contract the real three.js addon uses.

class FakeVector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
}

class FakeAnchor {
  constructor() {
    this.position = new FakeVector3();
    this.rotation = new FakeVector3();
    this.scale = new FakeVector3(1, 1, 1);
  }
}

class FakeControls {
  constructor() {
    this.listeners = new Map();
    this.mode = "translate";
    this.space = "world";
    this.visible = false;
    this.attached = null;
    this.axis = null;
  }
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
  }
  removeEventListener(type, handler) { this.listeners.get(type)?.delete(handler); }
  emit(type, event) { for (const handler of this.listeners.get(type) || []) handler(event); }
  setMode(mode) { this.mode = mode; }
  setTranslationSnap() {}
  setRotationSnap() {}
  setScaleSnap() {}
  attach(object) { this.attached = object; }
  detach() { this.attached = null; }
  getHelper() { return { isHelper: true }; }
  dispose() {}
}

class FakeScene {
  constructor() { this.children = []; }
  add(object) { this.children.push(object); }
  remove(object) { this.children = this.children.filter((c) => c !== object); }
}

function makeUi(overrides = {}) {
  let fakeControls;
  const ui = {
    frame: 0,
    state: {
      gizmo_mode: "translate",
      gizmo_space: "world",
      view_mode: "perspective",
      objects: [],
      cameras: [],
    },
    camera: { position: [6, 4, 6], target: [0, 1.5, 0] },
    selectedEntity: "camera",
    selectedObjectId: null,
    selectedObjectIds: new Set(),
    webgl: { activeCamera: { id: "three-camera" }, scene: new FakeScene() },
    interactionElement: {},
    selectedObject() { return this.state.objects.find((o) => o.id === this.selectedObjectId) || null; },
    activeCameraTrack() { return { id: "camera_1", keyframes: [] }; },
    checkpoints: [],
    checkpoint(label) { this.checkpoints.push(label); },
    undoCalls: 0,
    undo() { this.undoCalls += 1; },
    beginObjectEditCalls: [],
    beginObjectEdit(object) { this.beginObjectEditCalls.push(object.id); },
    commitObjectEditCalls: [],
    commitObjectEdit(object) { this.commitObjectEditCalls.push(object.id); },
    beginCameraEditCalls: 0,
    beginCameraEdit() { this.beginCameraEditCalls += 1; },
    commitCameraEditCalls: 0,
    commitCameraEdit() { this.commitCameraEditCalls += 1; },
    finishCameraEditCalls: 0,
    finishCameraEdit() { this.finishCameraEditCalls += 1; },
    renderCalls: 0,
    render() { this.renderCalls += 1; },
    refreshInspector() {},
    updateKeyVisualState() {},
    drawCurveEditor() {},
    editingKeyFrame: null,
    ...overrides,
  };
  const wiring = createTransformControlsWiring(ui, {
    controlsFactory: () => (fakeControls = new FakeControls()),
    anchorFactory: () => new FakeAnchor(),
  });
  return { ui, wiring, getControls: () => fakeControls };
}

test("sync attaches an object target and forwards mode/space", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "object";
  ui.state.objects.push({ id: "cube_1", position: [1, 2, 3], rotation: [0, 0, 0], size: [1, 1, 1] });
  ui.selectedObjectId = "cube_1";

  wiring.sync();
  const controls = getControls();
  assert.ok(controls, "adapter was created");
  assert.equal(controls.visible, true);
  assert.equal(controls.attached.position.x, 1);
  assert.equal(controls.mode, "translate");
});

test("sync detaches when the mode is not allowed for the target (camera scale)", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "camera";
  ui.state.gizmo_mode = "scale";
  wiring.sync();
  assert.equal(getControls(), undefined, "no adapter created for an always-detached target");
});

test("sync never bakes the gizmo into a recording/clean-capture frame", () => {
  const { ui, wiring, getControls } = makeUi({ recording: true });
  ui.selectedEntity = "camera";
  wiring.sync();
  assert.equal(getControls(), undefined);
});

test("object translate drag: one checkpoint, per-move commit, delta applied to the frozen base", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "object";
  ui.state.objects.push({ id: "cube_1", position: [1, 2, 3], rotation: [0, 0, 0], size: [1, 1, 1] });
  ui.selectedObjectId = "cube_1";
  wiring.sync();
  const controls = getControls();
  const object = ui.state.objects[0];

  controls.emit("mouseDown");
  assert.deepEqual(ui.checkpoints, ["Transform object"]);
  assert.deepEqual(ui.beginObjectEditCalls, ["cube_1"]);

  controls.attached.position.set(2, 2, 3); // +1 on X
  controls.emit("objectChange");
  assert.deepEqual(object.position, [2, 2, 3]);
  assert.deepEqual(ui.commitObjectEditCalls, ["cube_1"]);

  controls.attached.position.set(4, 2, 3); // +3 on X from the frozen base, not +2 from the last move
  controls.emit("objectChange");
  assert.deepEqual(object.position, [4, 2, 3]);

  controls.emit("mouseUp");
  assert.equal(ui.undoCalls, 0, "a committed drag must not be undone");
});

test("object rotate drag rotates a multi-selection about its pivot", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "object";
  ui.state.gizmo_mode = "rotate";
  ui.state.objects.push(
    { id: "a", position: [-1, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1] },
    { id: "b", position: [1, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1] },
  );
  ui.selectedObjectIds = new Set(["a", "b"]);
  ui.selectedObjectId = "b";
  wiring.sync();
  const controls = getControls();

  controls.emit("mouseDown");
  controls.attached.rotation.set(0, Math.PI / 2, 0); // +90 deg about Y
  controls.emit("objectChange");

  const [a, b] = ui.state.objects;
  // Pivot is the midpoint (0,0,0): a 90-degree yaw sends (-1,0,0) -> (0,0,1)-ish
  // and (1,0,0) -> (0,0,-1)-ish, within floating point tolerance.
  assert.ok(Math.abs(a.position[0]) < 1e-6);
  assert.ok(Math.abs(b.position[0]) < 1e-6);
  assert.equal(a.rotation[1], 90);
  assert.equal(b.rotation[1], 90);
});

test("object scale drag scales size and position relative to the pivot", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "object";
  ui.state.gizmo_mode = "scale";
  ui.state.objects.push({ id: "cube_1", position: [2, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1] });
  ui.selectedObjectId = "cube_1";
  wiring.sync();
  const controls = getControls();

  controls.emit("mouseDown");
  controls.attached.scale.set(2, 1, 1);
  controls.emit("objectChange");

  const object = ui.state.objects[0];
  assert.deepEqual(object.size, [2, 1, 1]);
  // A single selected object's pivot is its own position, so scaling never
  // moves it -- only multi-selection scaling repositions members.
  assert.equal(object.position[0], 2);
});

test("camera translate drag moves position only, leaving target fixed", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "camera";
  wiring.sync();
  const controls = getControls();

  controls.emit("mouseDown");
  assert.deepEqual(ui.checkpoints, ["Transform camera"]);
  assert.equal(ui.beginCameraEditCalls, 1);

  controls.attached.position.set(7, 4, 6); // +1 on X
  controls.emit("objectChange");
  assert.deepEqual(ui.camera.position, [7, 4, 6]);
  assert.deepEqual(ui.camera.target, [0, 1.5, 0]);
  assert.equal(ui.commitCameraEditCalls, 1);

  controls.emit("mouseUp");
  assert.equal(ui.finishCameraEditCalls, 1);
});

test("camera rotate drag orbits the target around the frozen position", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "camera";
  ui.state.gizmo_mode = "rotate";
  ui.camera = { position: [0, 0, 5], target: [0, 0, 0] };
  wiring.sync();
  const controls = getControls();

  controls.emit("mouseDown");
  controls.attached.rotation.set(0, Math.PI / 2, 0);
  controls.emit("objectChange");

  // rel = target - position = (0,0,-5); a +90deg yaw sends it toward +X.
  assert.ok(Math.abs(ui.camera.target[0] - 5) < 1e-6 || Math.abs(ui.camera.target[0] + 5) < 1e-6);
  assert.deepEqual(ui.camera.position, [0, 0, 5]);
});

test("camera_target translate drag moves the target only", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "camera_target";
  wiring.sync();
  const controls = getControls();

  controls.emit("mouseDown");
  assert.deepEqual(ui.checkpoints, ["Move camera target"]);

  controls.attached.position.set(1, 1.5, 0);
  controls.emit("objectChange");
  assert.deepEqual(ui.camera.target, [1, 1.5, 0]);
});

test("camera_target translate drag writes the maintain-offset when tracking", () => {
  const track = { id: "camera_1", keyframes: [], target_object_id: "subject", target_offset: [0, 0, 0] };
  const { ui, wiring, getControls } = makeUi({ activeCameraTrack: () => track, setFrame() {} });
  ui.selectedEntity = "camera_target";
  wiring.sync();
  const controls = getControls();

  controls.emit("mouseDown");
  const start = controls.attached.position;
  controls.attached.position.set(start.x + 0.5, start.y, start.z);
  controls.emit("objectChange");
  assert.deepEqual(track.target_offset, [0.5, 0, 0]);
});

test("cancelling a drag restores the frozen base and calls undo once", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "object";
  ui.state.objects.push({ id: "cube_1", position: [1, 2, 3], rotation: [0, 0, 0], size: [1, 1, 1] });
  ui.selectedObjectId = "cube_1";
  wiring.sync();
  const controls = getControls();
  const object = ui.state.objects[0];

  controls.emit("mouseDown");
  controls.attached.position.set(9, 9, 9);
  controls.emit("objectChange");
  assert.deepEqual(object.position, [9, 9, 9]);

  wiring.cancelDrag();
  assert.deepEqual(object.position, [1, 2, 3], "cancel re-applies the zero delta against the frozen base");
  assert.equal(ui.undoCalls, 1);
});

test("isPointerOverHandle reflects the underlying controls' hovered axis", () => {
  const { ui, wiring, getControls } = makeUi();
  assert.equal(wiring.isPointerOverHandle(), false, "no adapter yet");
  ui.selectedEntity = "camera";
  wiring.sync();
  const controls = getControls();
  assert.equal(wiring.isPointerOverHandle(), false);
  controls.axis = "X";
  assert.equal(wiring.isPointerOverHandle(), true);
});

test("dispose tears down the adapter", () => {
  const { ui, wiring, getControls } = makeUi();
  ui.selectedEntity = "camera";
  wiring.sync();
  const { scene } = ui.webgl;
  assert.equal(scene.children.length, 2, "the helper and the anchor");
  wiring.dispose();
  assert.equal(scene.children.length, 0);
});
