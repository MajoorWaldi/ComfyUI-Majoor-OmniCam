// The Maya-style transform gizmo: arrow tips for translate, square tips for
// scale, and a centre handle that means "move freely" in translate mode and
// "scale all three axes together" in scale mode.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

globalThis.window ??= { devicePixelRatio: 1 };

import { gizmoGeometry, pickGizmo } from "../../web-src/viewport-controls.js";
import { onPointerDown, onPointerMove } from "../../web-src/viewport-controls/interactions.js";

function baseObject(overrides = {}) {
  return {
    id: "subject", type: "cube", position: [0, 1, 0], rotation: [0, 0, 0], size: [1, 2, 3], keyframes: [],
    ...overrides,
  };
}

function baseCamera() {
  return { position: [6, 4, 6], target: [0, 1, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 };
}

function baseUi(object, mode) {
  return {
    state: {
      view_mode: "camera", editor_views: {}, objects: [object], cameras: [],
      gizmo_mode: mode, gizmo_space: "world", spatial_snap_mode: "off",
    },
    camera: baseCamera(),
    canvas: { width: 800, height: 450, classList: { add() {}, remove() {} } },
    interactionElement: {
      focus() {}, setPointerCapture() {}, style: {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }),
    },
    webgl: null,
    selectedEntity: "object",
    selectedObjectId: object.id,
    checkpoint() {}, beginObjectEdit() {}, commitObjectEdit() {}, refreshInspector() {}, render() {},
    closeMenus() {}, setStatus() {},
    selectedObject() { return this.state.objects.find((item) => item.id === this.selectedObjectId) || null; },
  };
}

function pointerEvent(point, overrides = {}) {
  return {
    button: 0, pointerId: 1, clientX: point[0], clientY: point[1],
    altKey: false, shiftKey: false, ctrlKey: false, metaKey: false,
    target: { closest: () => null },
    preventDefault() {}, stopPropagation() {},
    ...overrides,
  };
}

test("translate and scale mode both offer a pickable centre handle on an object", () => {
  for (const mode of ["translate", "scale"]) {
    const object = baseObject();
    const ui = baseUi(object, mode);
    const geometry = gizmoGeometry(ui);
    const picked = pickGizmo(ui, geometry.center);
    assert.ok(picked, `${mode} mode should pick the centre handle`);
    assert.equal(picked.free, true);
  }
});

test("rotate mode has no centre handle to grab", () => {
  const object = baseObject();
  const ui = baseUi(object, "rotate");
  const geometry = gizmoGeometry(ui);
  assert.equal(pickGizmo(ui, geometry.center), null);
});

test("dragging the scale centre handle grows every axis by the same amount", () => {
  const object = baseObject({ size: [1, 2, 3] });
  const ui = baseUi(object, "scale");
  const geometry = gizmoGeometry(ui);
  onPointerDown(ui, pointerEvent(geometry.center));
  assert.ok(ui.gizmoDrag?.free, "the centre handle should start a free drag");
  // Up-and-right reads as "grow": both a rightward and an upward pointer
  // motion contribute positively to the uniform delta.
  onPointerMove(ui, pointerEvent([geometry.center[0] + 30, geometry.center[1] - 30]));
  const [dx, dy, dz] = object.size.map((value, index) => value - [1, 2, 3][index]);
  assert.ok(dx > 0 && dy > 0 && dz > 0, `expected every axis to grow, got ${object.size}`);
  assert.ok(Math.abs(dx - dy) < 1e-9 && Math.abs(dy - dz) < 1e-9, "the same absolute delta must apply to all three axes");
});

test("dragging the scale centre handle toward the corner shrinks every axis", () => {
  const object = baseObject({ size: [2, 2, 2] });
  const ui = baseUi(object, "scale");
  const geometry = gizmoGeometry(ui);
  onPointerDown(ui, pointerEvent(geometry.center));
  onPointerMove(ui, pointerEvent([geometry.center[0] - 30, geometry.center[1] + 30]));
  assert.ok(object.size.every((value) => value < 2), `expected every axis to shrink, got ${object.size}`);
  assert.ok(object.size.every((value) => value >= 0.01), "size must stay clamped above zero");
});

test("dragging the translate centre handle moves the object off its single axes", () => {
  const object = baseObject({ position: [0, 1, 0] });
  const ui = baseUi(object, "translate");
  const geometry = gizmoGeometry(ui);
  onPointerDown(ui, pointerEvent(geometry.center));
  onPointerMove(ui, pointerEvent([geometry.center[0] + 40, geometry.center[1] + 15]));
  assert.notDeepEqual(object.position, [0, 1, 0]);
});

test("a straight axis handle draws an arrowhead in translate mode and a square tip in scale mode", async () => {
  const source = await readFile(new URL("../../web-src/viewport-controls.js", import.meta.url), "utf8");
  assert.match(source, /drawArrowHead|arrowHead/i);
  assert.match(source, /fillRect\(end\[0\] - \d+, end\[1\] - \d+/);
});
