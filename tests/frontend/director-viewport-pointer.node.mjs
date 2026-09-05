import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createEditorMethods } from "../../web-src/director/methods/editor.js";
import { onPointerDown } from "../../web-src/viewport-controls.js";

// Pointer behaviour of the 3D viewport: which button, with which modifier,
// picks, opens a menu, or drives the camera. The profile/button/modifier table
// itself lives in web-src/viewport-controls/navigation-gesture.js and is
// covered end to end by navigation-interactions.node.mjs; these are the
// regressions where selection and navigation used to bleed into each other.

test("Alt+right-click never opens a context menu -- Maya's Alt+RMB dollies instead (regression)", () => {
  // onPointerDown's own context-menu swallow lets an Alt-held right button
  // through (`e.button === 2 && !e.altKey`) specifically so Alt+RMB can drive
  // Maya's dolly gesture. The browser still fires a `contextmenu` event when
  // the button is released regardless of Alt, and onContextMenu used to open
  // a menu unconditionally there -- so finishing a dolly by releasing the
  // right button popped up a menu at the release point, which real Maya
  // never does (Alt always means navigation, never a menu request there).
  const deps = new Proxy({}, { get: () => () => { throw new Error("must not touch any menu-opening dependency"); } });
  const ui = createEditorMethods(deps);
  let defaultPrevented = false, propagationStopped = false;
  const event = {
    altKey: true,
    preventDefault: () => { defaultPrevented = true; },
    stopPropagation: () => { propagationStopped = true; },
    stopImmediatePropagation() {},
    target: { closest: () => { throw new Error("must not inspect the event target at all"); } },
  };
  ui.onContextMenu(event);
  assert.equal(defaultPrevented, true, "the browser's own menu must still be blocked");
  assert.equal(propagationStopped, true);
});

test("selecting a viewport object does not also arm camera navigation (regression)", () => {
  // Neither Maya nor Blender orbits the camera from a plain left-drag that
  // started on something -- LMB only ever selects/manipulates in both;
  // navigation is exclusively Alt (Maya) or the middle button (Blender).
  // This used to fall through to the same "arm an orbit" fallback a genuine
  // navigation gesture uses, so clicking an object and continuing to drag
  // even slightly spun the camera as an unwanted side effect of selecting.
  const object = { id: "subject", type: "cube", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [] };
  const camera = { position: [6, 4, 6], target: [0, 0, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 };
  const ui = {
    state: { view_mode: "camera", objects: [object], cameras: [], gizmo_mode: "translate", gizmo_space: "world" },
    camera,
    canvas: { width: 800, height: 450, classList: { add() {} } },
    interactionElement: {
      focus() {},
      setPointerCapture() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }),
    },
    webgl: { pick: () => ({ type: "object", id: object.id }) },
    selectedEntity: "camera",
    selectedObjectId: null,
    selectedKeyFrame: null,
    closeMenus() {},
    checkpoint() {},
    finishCameraEdit() {},
    refreshObjects() {},
    refreshKeys() {},
    refreshInspector() {},
    render() {},
    setStatus() {},
    beginCameraEdit() {},
    selectedObject() { return this.state.objects.find((item) => item.id === this.selectedObjectId) || null; },
  };
  onPointerDown(ui, {
    button: 0,
    pointerId: 1,
    clientX: 400,
    clientY: 225,
    altKey: false,
    shiftKey: false,
    target: { closest: () => null },
    preventDefault() {},
    stopPropagation() {},
  });
  assert.equal(ui.selectedEntity, "object");
  assert.equal(ui.selectedObjectId, object.id);
  assert.ok(!ui.drag, "selecting an object must not also arm an orbit drag");
});

test("clicking a camera icon in the viewport does not also arm camera navigation (regression)", () => {
  const camera = { position: [6, 4, 6], target: [0, 0, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 };
  const ui = {
    state: { view_mode: "camera", objects: [], cameras: [{ id: "cam_1", name: "Camera 1" }], gizmo_mode: "translate", gizmo_space: "world" },
    camera,
    canvas: { width: 800, height: 450, classList: { add() {} } },
    interactionElement: {
      focus() {}, setPointerCapture() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }),
    },
    webgl: { pick: () => ({ type: "camera", id: "cam_1" }) },
    selectedEntity: "object",
    selectedObjectId: null,
    activateCamera() { this.selectedEntity = "camera"; },
    closeMenus() {}, finishCameraEdit() {}, refreshObjects() {}, refreshKeys() {}, refreshInspector() {}, render() {}, setStatus() {},
    selectedObject() { return null; },
  };
  onPointerDown(ui, {
    button: 0, pointerId: 1, clientX: 400, clientY: 225, altKey: false, shiftKey: false,
    target: { closest: () => null }, preventDefault() {}, stopPropagation() {},
  });
  assert.equal(ui.selectedEntity, "camera");
  assert.ok(!ui.drag, "selecting a camera icon must not also arm an orbit drag");
});

test("a selected object directly captures a plain left-drag on its gizmo", async () => {
  const source = await readFile(new URL("../../web-src/viewport-controls/interactions.js", import.meta.url), "utf8");
  assert.match(source, /canEditGizmo = canPick && !e\.altKey && !e\.shiftKey/);
  assert.match(source, /const picked = canEditGizmo \? pickGizmo/);
});

test("selection rendering and outliner expose visible, contextual object feedback", async () => {
  const selectionSource = await readFile(new URL("../../web-src/viewport/scene.js", import.meta.url), "utf8");
  const outlinerSource = await readFile(new URL("../../web-src/scene/outliner.js", import.meta.url), "utf8");
  assert.match(selectionSource, /Box3Helper/);
  assert.doesNotMatch(selectionSource, /wireframe: true/);
  assert.match(selectionSource, /nextSelectionKey/);
  assert.match(outlinerSource, /openObjectContext\(event, object\.id\)/);
  assert.match(outlinerSource, /event\.key === "Enter" \|\| event\.key === " "/);
});

test("secondary click is contained for the OmniCam context menu", () => {
  const calls = [];
  onPointerDown({ root: {}, interactionElement: {} }, {
    button: 2,
    altKey: false,
    target: { closest: () => null },
    preventDefault() { calls.push("default"); },
    stopPropagation() { calls.push("propagation"); },
    stopImmediatePropagation() { calls.push("immediate"); },
  });
  assert.deepEqual(calls, ["default", "propagation", "immediate"]);
});

test("plain middle-button click orbits instead of picking, in Maya too", () => {
  // The middle button never picks, in either profile, and it carries the whole
  // camera family without a modifier -- the baseline for setups where Alt
  // never reaches the page at all. Maya's own unmodified middle drag does
  // nothing in the viewport, so this takes no gesture away from anyone.
  let pickCalls = 0;
  const camera = { position: [6, 4, 6], target: [0, 0, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 };
  const ui = {
    state: { view_mode: "camera", editor_views: {}, objects: [], cameras: [], gizmo_mode: "translate", gizmo_space: "world" },
    camera,
    canvas: { width: 800, height: 450, classList: { add() {} } },
    interactionElement: {
      focus() {}, setPointerCapture() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }),
    },
    webgl: { pick() { pickCalls += 1; return { type: "object", id: "subject" }; } },
    closeMenus() {}, checkpoint() {}, beginCameraEdit() {}, selectedObject() { return null; },
  };
  onPointerDown(ui, {
    button: 1, pointerId: 2, clientX: 400, clientY: 225,
    altKey: false, shiftKey: false, target: { closest: () => null },
    preventDefault() {}, stopPropagation() {},
  });
  assert.equal(pickCalls, 0);
  assert.equal(ui.drag?.shift, false, "an unmodified middle drag orbits");
  assert.equal(ui.drag?.dolly, false, "an unmodified middle drag orbits");
  assert.ok(ui.drag, "and it does arm a camera drag");
});

test("Alt+middle click pans the camera in Maya (Alt is required, not optional)", () => {
  const camera = { position: [6, 4, 6], target: [0, 0, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 };
  const ui = {
    state: { view_mode: "camera", editor_views: {}, objects: [], cameras: [], gizmo_mode: "translate", gizmo_space: "world" },
    camera,
    canvas: { width: 800, height: 450, classList: { add() {} } },
    interactionElement: {
      focus() {}, setPointerCapture() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }),
    },
    closeMenus() {}, checkpoint() {}, beginCameraEdit() {}, selectedObject() { return null; },
  };
  onPointerDown(ui, {
    button: 1, pointerId: 2, clientX: 400, clientY: 225,
    altKey: true, shiftKey: false, target: { closest: () => null },
    preventDefault() {}, stopPropagation() {},
  });
  assert.equal(ui.drag?.shift, true, "Alt+middle must pan");
});
