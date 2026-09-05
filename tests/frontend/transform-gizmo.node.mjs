// The Maya-style transform gizmo: arrow tips for translate, square tips for
// scale, and a centre handle that means "move freely" in translate mode and
// "scale all three axes together" in scale mode.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

globalThis.window ??= { devicePixelRatio: 1 };

import { gizmoGeometry, pickGizmo } from "../../web-src/viewport-controls.js";
import { onPointerDown, onPointerMove } from "../../web-src/viewport-controls/interactions.js";
import { project } from "../../web-src/director/core.js";

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

test("a locked camera offers no gizmo, for itself or its target (regression)", () => {
  // Every gizmoDrag creation site calls beginCameraEdit(), which already
  // refuses to write a keyframe for a locked track -- but nothing stopped
  // the drag itself, so a locked camera's position/target still visibly
  // moved on screen; only the silent failure to persist gave the lock away.
  // A locked object's gizmo was already hidden this same way (see the object
  // branch of activeGizmoEntity) -- cameras were the one inconsistent case.
  const track = { id: "cam_1", locked: true, keyframes: [{ frame: 0, camera: baseCamera() }] };
  const ui = {
    state: { view_mode: "perspective", editor_views: {}, objects: [], cameras: [track], gizmo_mode: "translate", gizmo_space: "world" },
    camera: baseCamera(), frame: 0,
    canvas: { width: 800, height: 450, classList: { add() {}, remove() {} } },
    activeCameraTrack: () => track,
  };
  for (const selectedEntity of ["camera", "camera_target"]) {
    ui.selectedEntity = selectedEntity;
    assert.equal(gizmoGeometry(ui), null, `${selectedEntity} gizmo must not appear on a locked camera`);
  }
});

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

test("a rigged model's transform gizmo sits at its authored origin, not a live bone-average centre (regression)", () => {
  // Every 3D package (Maya's pivot, Blender's origin point) draws the
  // transform gizmo at the object's own fixed transform, never a computed
  // geometric/bone average -- that stays legitimate only as an aim/look-at
  // target elsewhere (framing, aimAtSelectedObject). This used to draw the
  // gizmo for model/glb entities at getObjectWorldCenter() instead, and use
  // that same centre as the drag base: for a rig whose authored origin
  // (feet) sits away from its bone average (torso), the very first pixel of
  // any axis drag snapped the object onto the centre before it could move
  // along the axis at all, and the gizmo itself drifted frame to frame as
  // the pose changed.
  const object = baseObject({ type: "model", position: [0, 0, 0], size: [1, 2, 1] });
  const ui = baseUi(object, "translate");
  ui.webgl = { getObjectWorldCenter: () => [0, 1, 0] }; // must be ignored for the gizmo/drag
  const geometry = gizmoGeometry(ui);
  const originProjected = project(object.position, ui.camera, ui.canvas.width, ui.canvas.height);
  assert.deepEqual(geometry.center, originProjected, "the gizmo must be drawn at the origin, not the bone-average centre");
  const handle = geometry.handles[0]; // the [1, 0, 0] axis
  const start = [
    geometry.center[0] + (handle.points[1][0] - geometry.center[0]) * 0.8,
    geometry.center[1] + (handle.points[1][1] - geometry.center[1]) * 0.8,
  ];
  onPointerDown(ui, pointerEvent(start));
  assert.deepEqual(ui.gizmoDrag?.position, [0, 0, 0], "the drag base must be the object's origin, not its visual centre");
  onPointerMove(ui, pointerEvent([start[0] + 1, start[1]]));
  assert.equal(object.position[1], 0, "Y must not jump toward the model's centre");
  assert.ok(object.position[0] !== 0, "X must actually have moved");
});

test("dragging a straight axis handle with grid snap on never moves the idle axes (regression)", () => {
  // Ctrl (or the Grid snap mode) used to run the WHOLE resulting position
  // through a flat grid rounding, so a pure X-axis drag would also snap Y/Z
  // the moment either wasn't already grid-aligned -- the object visibly
  // jumped off the axis the user was dragging.
  const object = baseObject({ position: [0.3, 1.53, 2.17] });
  const ui = baseUi(object, "translate");
  ui.state.spatial_snap_mode = "grid";
  ui.state.spatial_grid_size = 0.5;
  const geometry = gizmoGeometry(ui);
  const handle = geometry.handles[0]; // the [1, 0, 0] axis
  const start = [
    geometry.center[0] + (handle.points[1][0] - geometry.center[0]) * 0.8,
    geometry.center[1] + (handle.points[1][1] - geometry.center[1]) * 0.8,
  ];
  onPointerDown(ui, pointerEvent(start));
  assert.equal(ui.gizmoDrag?.free, false, "must grab the X axis handle, not the free centre handle");
  onPointerMove(ui, pointerEvent([start[0] + 40, start[1] + 5]));
  assert.equal(object.position[1], 1.53, "Y must stay exactly where it started");
  assert.equal(object.position[2], 2.17, "Z must stay exactly where it started");
  assert.ok(Math.abs(object.position[0] % 0.5) < 1e-9, "X must land on the grid");
  assert.notEqual(object.position[0], 0.3, "X must actually have moved");
});

test("Scale mode offers no gizmo on the camera, which has no size to scale", () => {
  const object = baseObject();
  const ui = baseUi(object, "scale");
  ui.state.view_mode = "perspective";
  ui.state.editor_views = { perspective: baseCamera() };
  ui.selectedEntity = "camera";
  ui.frame = 0;
  ui.activeCameraTrack = () => ({ camera: ui.camera, keyframes: [] });
  assert.equal(gizmoGeometry(ui), null);
});

test("a straight axis handle draws an arrowhead in translate mode and a square tip in scale mode", async () => {
  const source = await readFile(new URL("../../web-src/viewport-controls.js", import.meta.url), "utf8");
  assert.match(source, /drawArrowHead|arrowHead/i);
  assert.match(source, /fillRect\(end\[0\] - \d+, end\[1\] - \d+/);
});

test("a scale handle follows the object's own axes even in World space (regression)", () => {
  // An object's scale is a size triple in its own frame, so handle N always
  // writes size[N]. While the World setting pointed the handles along world
  // axes, dragging the red world-X handle of an object rotated 90 degrees on Z
  // wrote size[0] -- which the renderer applies along the object's local X,
  // i.e. world Y. X and Y looked swapped. Maya's and Blender's scale
  // manipulators are local-only for this same reason: a genuine world-axis
  // scale shears, and a size triple cannot express a shear.
  const object = baseObject({ rotation: [0, 0, 90], size: [1, 1, 1] });
  const ui = baseUi(object, "scale");
  assert.equal(ui.state.gizmo_space, "world", "the default space this used to break under");
  const geometry = gizmoGeometry(ui);

  const xHandle = geometry.handles.find((handle) => handle.index === 0);
  assert.ok(Math.abs(xHandle.axis[1] - 1) < 1e-6, "handle 0 must point along the object's local X, here world +Y");

  // Drag it along its own direction: the axis it grows must be the one it points at.
  const [start, end] = xHandle.points;
  const direction = [end[0] - start[0], end[1] - start[1]];
  const norm = Math.hypot(...direction) || 1;
  onPointerDown(ui, pointerEvent([end[0], end[1]]));
  assert.equal(ui.gizmoDrag?.axisIndex, 0);
  onPointerMove(ui, pointerEvent([end[0] + (direction[0] / norm) * 60, end[1] + (direction[1] / norm) * 60]));
  assert.ok(object.size[0] > 1.1, `the grabbed handle must grow size[0], got ${object.size}`);
  assert.deepEqual(object.size.slice(1), [1, 1], "the idle axes must not move");
});

test("translate honours the World / Local space setting; rotate cannot", () => {
  // Move stores a plain world position, so both frames are expressible and the
  // setting is real. Rotate stores an XYZ euler, which composes as Rz*Ry*Rx --
  // rotation[0] is a turn about the object's *own* X. Drawing that ring around
  // world X promised a rotation the euler cannot perform, so the object swung
  // about a different axis than the ring the user grabbed.
  const object = baseObject({ rotation: [0, 0, 90] });

  const move = baseUi(object, "translate");
  assert.ok(Math.abs(gizmoGeometry(move).handles[0].axis[0] - 1) < 1e-6, "translate in World space keeps world axes");
  move.state.gizmo_space = "local";
  assert.ok(Math.abs(gizmoGeometry(move).handles[0].axis[1] - 1) < 1e-6, "translate in Local space follows the object");

  for (const space of ["world", "local"]) {
    const ui = baseUi(object, "rotate");
    ui.state.gizmo_space = space;
    const ring = gizmoGeometry(ui).handles[0];
    assert.ok(Math.abs(ring.axis[1] - 1) < 1e-6, `rotate ring 0 must sit on the object's own X in ${space} space`);
  }
});
