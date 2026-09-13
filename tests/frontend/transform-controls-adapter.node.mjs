import test from "node:test";
import assert from "node:assert/strict";

import { createTransformControlsAdapter } from "../../web-src/viewport/transform-controls-adapter.js";

class FakeVector3 {
  constructor() { this.x = 0; this.y = 0; this.z = 0; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
}

class FakeAnchor {
  constructor() {
    this.position = new FakeVector3();
    this.rotation = new FakeVector3();
    this.scale = new FakeVector3(1, 1, 1);
    this.scale.set(1, 1, 1);
  }
}

class FakeControls {
  constructor() {
    this.listeners = new Map();
    this.mode = "translate";
    this.space = "world";
    this.translationSnap = null;
    this.rotationSnap = null;
    this.scaleSnap = null;
    this.visible = false;
    this.attached = null;
    this.disposed = false;
  }
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
  }
  removeEventListener(type, handler) {
    this.listeners.get(type)?.delete(handler);
  }
  emit(type, event) {
    for (const handler of this.listeners.get(type) || []) handler(event);
  }
  setMode(mode) { this.mode = mode; }
  setTranslationSnap(value) { this.translationSnap = value; }
  setRotationSnap(value) { this.rotationSnap = value; }
  setScaleSnap(value) { this.scaleSnap = value; }
  attach(object) { this.attached = object; }
  detach() { this.attached = null; }
  getHelper() { return { isHelper: true }; }
  dispose() { this.disposed = true; }
}

class FakeScene {
  constructor() { this.children = []; }
  add(object) { this.children.push(object); }
  remove(object) { this.children = this.children.filter((c) => c !== object); }
}

function makeAdapter(overrides = {}) {
  const fakeControls = new FakeControls();
  const fakeScene = new FakeScene();
  const calls = { onDragStart: [], onTransform: [], onDragEnd: [], onDraggingChanged: [] };
  const adapter = createTransformControlsAdapter({
    camera: { id: "view-camera" },
    domElement: {},
    scene: fakeScene,
    controlsFactory: () => fakeControls,
    anchorFactory: () => new FakeAnchor(),
    onDragStart: (info) => calls.onDragStart.push(info),
    onTransform: (info) => calls.onTransform.push(info),
    onDragEnd: (info) => calls.onDragEnd.push(info),
    onDraggingChanged: (dragging) => calls.onDraggingChanged.push(dragging),
    ...overrides,
  });
  return { adapter, fakeControls, fakeScene, calls };
}

test("setMode/setSpace/setTranslationSnap forward to the underlying controls", () => {
  const { adapter, fakeControls } = makeAdapter();
  adapter.setMode("rotate");
  assert.equal(fakeControls.mode, "rotate");
  adapter.setSpace("local");
  assert.equal(fakeControls.space, "local");
  adapter.setTranslationSnap(0.5);
  assert.equal(fakeControls.translationSnap, 0.5);
  adapter.setRotationSnap(15);
  assert.equal(fakeControls.rotationSnap, 15);
  adapter.setScaleSnap(0.1);
  assert.equal(fakeControls.scaleSnap, 0.1);
});

test("setMode rejects an unknown mode", () => {
  const { adapter } = makeAdapter();
  assert.throws(() => adapter.setMode("teleport"));
});

test("attach positions the anchor at the target spec and attaches controls", () => {
  const { adapter, fakeControls } = makeAdapter();
  adapter.attach({ id: "camera_1", type: "camera", position: [1, 2, 3], rotation: [0, 0, 0], scale: [1, 1, 1] });
  assert.ok(fakeControls.attached, "controls.attach was called with the anchor");
  assert.equal(fakeControls.attached.position.x, 1);
  assert.equal(fakeControls.attached.position.y, 2);
  assert.equal(fakeControls.attached.position.z, 3);
  assert.equal(fakeControls.visible, true);
});

test("detach clears the anchor and hides the controls", () => {
  const { adapter, fakeControls } = makeAdapter();
  adapter.attach({ id: "camera_1", type: "camera", position: [0, 0, 0] });
  adapter.detach();
  assert.equal(fakeControls.attached, null);
  assert.equal(fakeControls.visible, false);
});

test("drag lifecycle: onDragStart fires once, onTransform can fire many times, one onDragEnd", () => {
  const { adapter, fakeControls, calls } = makeAdapter();
  adapter.attach({ id: "camera_1", type: "camera", position: [0, 0, 0] });

  fakeControls.emit("mouseDown");
  assert.equal(calls.onDragStart.length, 1);

  fakeControls.attached.position.set(1, 0, 0);
  fakeControls.emit("objectChange");
  fakeControls.attached.position.set(2, 0, 0);
  fakeControls.emit("objectChange");
  fakeControls.attached.position.set(3, 0, 0);
  fakeControls.emit("objectChange");
  assert.equal(calls.onTransform.length, 3);
  assert.deepEqual(calls.onTransform.at(-1).delta.position, [3, 0, 0]);

  fakeControls.emit("mouseUp");
  assert.equal(calls.onDragEnd.length, 1);
  assert.equal(calls.onDragEnd[0].cancelled, false);
  assert.deepEqual(calls.onDragEnd[0].delta.position, [3, 0, 0]);
});

test("dragging-changed forwards the boolean to onDraggingChanged", () => {
  const { fakeControls, calls } = makeAdapter();
  fakeControls.emit("dragging-changed", { value: true });
  fakeControls.emit("dragging-changed", { value: false });
  assert.deepEqual(calls.onDraggingChanged, [true, false]);
});

test("cancelDrag restores the drag-start snapshot and reports cancelled without a prior mouseUp", () => {
  const { adapter, fakeControls, calls } = makeAdapter();
  adapter.attach({ id: "camera_1", type: "camera", position: [0, 0, 0] });
  fakeControls.emit("mouseDown");
  fakeControls.attached.position.set(5, 5, 5);
  fakeControls.emit("objectChange");

  adapter.cancelDrag();

  assert.equal(fakeControls.attached.position.x, 0, "anchor position restored to drag-start");
  assert.equal(calls.onDragEnd.length, 1);
  assert.equal(calls.onDragEnd[0].cancelled, true);
  assert.deepEqual(calls.onDragEnd[0].delta.position, [0, 0, 0]);

  // A cancel while idle (no drag in progress) is a no-op.
  adapter.cancelDrag();
  assert.equal(calls.onDragEnd.length, 1);
});

test("dispose removes every listener and the helper from the scene", () => {
  const { adapter, fakeControls, fakeScene } = makeAdapter();
  assert.equal(fakeScene.children.length, 1, "helper was added to the scene on construction");
  adapter.dispose();
  assert.equal(fakeScene.children.length, 0, "helper removed from the scene");
  assert.equal(fakeControls.disposed, true);
  for (const handlers of fakeControls.listeners.values()) {
    assert.equal(handlers.size, 0, "all handlers removed");
  }
});

test("isDragging reflects the dragging-changed events", () => {
  const { adapter, fakeControls } = makeAdapter();
  assert.equal(adapter.isDragging(), false);
  fakeControls.emit("dragging-changed", { value: true });
  assert.equal(adapter.isDragging(), true);
  fakeControls.emit("dragging-changed", { value: false });
  assert.equal(adapter.isDragging(), false);
});
