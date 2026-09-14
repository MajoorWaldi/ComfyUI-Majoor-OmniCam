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
    // Mirrors just enough of real TransformControls' pointerUp()/dragging
    // semantics (node_modules/three/examples/jsm/controls/TransformControls.js)
    // to test adapter.cancelDrag() actually forces this state to reset: a
    // "mouseDown" here always starts a drag on a synthetic axis, and
    // "dragging-changed" only fires on an *actual* value change, matching the
    // real library's `defineProperty` setter.
    this.dragging = false;
    this.axis = null;
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
  /** A drag armed via startDrag() (test helper) and terminated here, exactly
   * like the real `pointerUp(pointer)` public method: dispatches "mouseUp"
   * only if still dragging with an axis set, then resets dragging/axis and
   * (only on an actual change) dispatches "dragging-changed". */
  startDrag(axis = "X") {
    this.dragging = true;
    this.axis = axis;
  }
  pointerUp(pointer) {
    if (pointer !== null && pointer?.button !== 0) return;
    if (this.dragging && this.axis !== null) this.emit("mouseUp", {});
    if (this.dragging !== false) { this.dragging = false; this.emit("dragging-changed", { value: false }); }
    this.axis = null;
  }
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

test("rotate delta stays continuous across a Euler wrap at +/-180 degrees", () => {
  // Regression: a three.js Euler component's stored value wraps into
  // (-180, 180]. A single continuous drag that physically rotates a total of
  // 220 degrees on one axis makes the *stored* value cross that boundary
  // (170 -> -170 -> -140), even though the mouse only ever moved smoothly in
  // one direction. Naively subtracting (now - dragStart) at that point would
  // report a ~340 degree jump instead of the real ~20 degree step.
  const DEG2RAD = Math.PI / 180;
  const { adapter, fakeControls, calls } = makeAdapter();
  adapter.attach({ id: "camera_1", type: "camera", position: [0, 0, 0], rotation: [0, 0, 0] });
  fakeControls.emit("mouseDown");

  fakeControls.attached.rotation.set(170 * DEG2RAD, 0, 0);
  fakeControls.emit("objectChange");
  assert.ok(Math.abs(calls.onTransform.at(-1).delta.rotationDeg[0] - 170) < 1e-6, "170 degrees in, no wrap yet");

  fakeControls.attached.rotation.set(-170 * DEG2RAD, 0, 0); // Euler wrapped: true total is 190 degrees
  fakeControls.emit("objectChange");
  assert.ok(Math.abs(calls.onTransform.at(-1).delta.rotationDeg[0] - 190) < 1e-6, "continues past the wrap to 190, not -170 or -340");

  fakeControls.attached.rotation.set(-140 * DEG2RAD, 0, 0); // true total is 220 degrees
  fakeControls.emit("objectChange");
  assert.ok(Math.abs(calls.onTransform.at(-1).delta.rotationDeg[0] - 220) < 1e-6, "continues to 220 after the wrap");

  fakeControls.emit("mouseUp");
  assert.ok(Math.abs(calls.onDragEnd[0].delta.rotationDeg[0] - 220) < 1e-6, "onDragEnd reports the same unwrapped total");
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

test("cancelDrag forces the real TransformControls' own drag state to stop, not just the adapter's", () => {
  // Regression: cancelDrag() used to only revert OmniCam-side data and null
  // its own `dragStart`, leaving the real TransformControls instance still
  // internally `dragging === true` (with its axis set and its own pointermove
  // listener attached) until the user's mouse button actually came back up --
  // so the gizmo mesh kept visually following the pointer after Escape, and
  // `dragging-changed`(false)/onDraggingChanged never fired, leaving
  // navigation/other pointer handling locked out.
  const { adapter, fakeControls, calls } = makeAdapter();
  adapter.attach({ id: "camera_1", type: "camera", position: [0, 0, 0] });

  fakeControls.startDrag("X"); // arms the real library's own dragging/axis state
  fakeControls.emit("mouseDown");
  fakeControls.attached.position.set(5, 0, 0);
  fakeControls.emit("objectChange");

  adapter.cancelDrag();

  assert.equal(fakeControls.dragging, false, "the underlying controls' own dragging flag was force-reset");
  assert.equal(fakeControls.axis, null, "the underlying controls' own axis was cleared");
  assert.deepEqual(calls.onDraggingChanged, [false], "dragging-changed(false) fired exactly once from the forced pointerUp");
  // The forced pointerUp's own "mouseUp" event (if any) must not produce a
  // second onDragEnd/onTransform on top of the cancel's own -- cancelDrag()
  // nulls its `dragStart` before calling into the real controls precisely to
  // guard against that.
  assert.equal(calls.onDragEnd.length, 1, "exactly one onDragEnd (the cancel itself), no duplicate from the forced pointerUp");
  assert.equal(calls.onDragEnd[0].cancelled, true);

  // A further native pointermove-driven objectChange (simulating the real
  // library's listener still being attached until the actual mouse-up) must
  // now be inert: dragStart is null, so handleObjectChange's own guard bails.
  fakeControls.attached.position.set(9, 9, 9);
  fakeControls.emit("objectChange");
  assert.equal(calls.onTransform.at(-1).position[0], 0, "no further onTransform after a forced cancel");
});

test("the anchor is added to the scene graph -- TransformControls silently refuses to drag a parentless object", () => {
  const { fakeScene } = makeAdapter();
  assert.ok(fakeScene.children.some((child) => child instanceof FakeAnchor), "anchor must be part of the scene graph");
});

test("dispose removes every listener, the helper and the anchor from the scene", () => {
  const { adapter, fakeControls, fakeScene } = makeAdapter();
  assert.equal(fakeScene.children.length, 2, "helper and anchor were added to the scene on construction");
  adapter.dispose();
  assert.equal(fakeScene.children.length, 0, "helper and anchor removed from the scene");
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

test("isHoveringHandle reflects the underlying controls.axis", () => {
  const { adapter, fakeControls } = makeAdapter();
  assert.equal(adapter.isHoveringHandle(), false);
  fakeControls.axis = "X";
  assert.equal(adapter.isHoveringHandle(), true);
  fakeControls.axis = null;
  assert.equal(adapter.isHoveringHandle(), false);
});
