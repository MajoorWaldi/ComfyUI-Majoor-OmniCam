import test from "node:test";
import assert from "node:assert/strict";
import { defaultCamera, defaultEditorViews, project, sampleCamera } from "../../web-src/director/core.js";
import { frameTarget } from "../../web-src/viewport-controls.js";
import { onPointerDown, onPointerMove, onPointerUp, onWheel, cancelViewportInteraction } from "../../web-src/viewport-controls/interactions.js";
import { applyAimConstraint } from "../../web-src/aim-constraint.js";

globalThis.window ??= { devicePixelRatio: 1 };

function fixture(profile = "maya", mode = "perspective") {
  const captured = new Set();
  const classes = new Set();
  return {
    state: { navigation_profile: profile, view_mode: mode, editor_views: defaultEditorViews(), objects: [], cameras: [] },
    camera: defaultCamera(), frame: 0, selectedEntity: "object", selectedObjectId: "keep",
    selectedObjectIds: new Set(["keep"]), activePointerId: null,
    canvas: { width: 800, height: 400, classList: { add: (v) => classes.add(v), remove: (v) => classes.delete(v), contains: (v) => classes.has(v) } },
    interactionElement: { style: {}, focus() {}, setPointerCapture: (id) => captured.add(id),
      hasPointerCapture: (id) => captured.has(id), releasePointerCapture: (id) => captured.delete(id),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 400 }) },
    selectedObject() { return this.state.objects.find((o) => o.id === this.selectedObjectId); },
    checkpoints: 0, undos: 0,
    checkpoint() { this.checkpoints++; }, undo() { this.undos++; },
    closeMenus() {}, beginCameraEdit() {}, commitCameraEdit() {}, finishCameraEdit() {},
    refreshObjects() {}, refreshKeys() {}, refreshInspector() {}, render() {}, serialize() {},
    scheduleSerialize() {}, setStatus() {},
  };
}
const event = (extra = {}) => ({ button: 0, pointerId: 1, clientX: 20, clientY: 20,
  target: { closest: () => null }, preventDefault() {}, stopPropagation() {}, ...extra });

test("Alt navigation never picks or deselects an object, even without movement", () => {
  const ui = fixture();
  ui.webgl = { pick() { assert.fail("navigation must bypass scene picking"); } };
  onPointerDown(ui, event({ altKey: true }));
  assert.ok(ui.drag);
  onPointerUp(ui, event({ altKey: true }));
  assert.equal(ui.selectedObjectId, "keep");
});

function trackingFixture() {
  const ui = fixture("maya", "camera");
  const trackedObject = { id: "hero", position: [5, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [] };
  ui.state.objects = [trackedObject];
  const track = {
    id: "cam_1", target_object_id: "hero", target_offset: [0, 0, 0],
    keyframes: [{ frame: 0, camera: { position: [0, 0, 10], target: [5, 0, 0], fov: 35, camera_type: "perspective", zoom: 1 } }],
  };
  ui.state.cameras = [track];
  ui.state.active_camera_id = "cam_1";
  ui.activeCameraTrack = () => track;
  ui.activateCamera = () => {};
  // A minimal stand-in for the real setFrame: resample the track (which
  // resolves the look-at constraint the same way the app does) so the test
  // proves the offset survives a "frame refresh", not just the drag itself.
  ui.setFrame = (frame) => {
    ui.frame = frame;
    ui.camera = sampleCamera(track, frame, ui.state.objects);
    applyAimConstraint(ui, track, ui.camera, frame);
  };
  ui.setFrame(0);
  ui.webgl = { pick: () => ({ type: "camera_target", id: "cam_1" }) };
  return { ui, track, trackedObject };
}

test("dragging a tracked camera target adjusts the constraint's offset, not the discarded raw target (regression)", () => {
  // sampleCamera always recomputes target from the tracked object + offset
  // while a look-at constraint is active, discarding whatever a plain drag
  // wrote into camera.target the instant the frame next refreshes. Real
  // constraint systems (Maya's "Maintain Offset") keep the manipulator
  // meaningful by having it drive the offset instead.
  const { ui, track, trackedObject } = trackingFixture();
  assert.deepEqual(ui.camera.target, [5, 0, 0], "sanity: starts locked onto the tracked object");

  onPointerDown(ui, event());
  assert.ok(ui.targetFreeDrag, "must start the free target drag");
  assert.equal(ui.targetFreeDrag.tracking, true);

  onPointerMove(ui, event({ clientX: 60, clientY: 20 }));
  assert.notDeepEqual(track.target_offset, [0, 0, 0], "the drag must persist as the constraint's offset");
  assert.notDeepEqual(ui.camera.target, [5, 0, 0], "the live target must move during the drag");

  // Simulate scrubbing away and back -- the exact sequence that used to wipe
  // a plain drag's edit, because sampleCamera recomputes target from scratch.
  ui.setFrame(5);
  ui.setFrame(0);
  const offsetTarget = [5 + track.target_offset[0], 0 + track.target_offset[1], 0 + track.target_offset[2]];
  assert.deepEqual(ui.camera.target, offsetTarget, "the offset must still apply after a frame refresh");

  // Moving the tracked object proves the result still tracks it (offset is
  // additive, not a frozen absolute point).
  trackedObject.position = [8, 0, 0];
  ui.setFrame(0);
  assert.deepEqual(ui.camera.target, [8 + track.target_offset[0], track.target_offset[1], track.target_offset[2]]);
});

function pathKeyFixture() {
  const ui = fixture();
  const key = { frame: 5, interpolation: "linear", camera: { position: [1, 1, 1], target: [0, 0, 0] } };
  ui.state.cameras = [{ id: "cam_1", keyframes: [key] }];
  ui.selectedKeyframeCalls = [];
  ui.selectKeyframe = (k) => ui.selectedKeyframeCalls.push(k);
  ui.setFrame = () => {};
  ui.webgl = { pickPathKey: () => ({ cameraId: "cam_1", frame: 5 }) };
  return { ui, key };
}

test("clicking a path key without dragging leaves it untouched and costs no undo step (regression)", () => {
  // Sub-pixel pointer jitter fires real pointermove events even for a
  // stationary click. Without a movement threshold, just clicking a path key
  // to select/scrub to it silently promoted a Linear/Hold key to Smooth and
  // spent an undo slot for a no-op edit.
  const { ui, key } = pathKeyFixture();
  onPointerDown(ui, event());
  assert.ok(ui.pathDrag, "must start a path drag");
  assert.equal(ui.selectedKeyframeCalls.length, 1, "clicking still selects the key");
  onPointerMove(ui, event({ clientX: 21, clientY: 20 })); // 1px jitter
  onPointerUp(ui, event());
  assert.deepEqual(key.camera.position, [1, 1, 1], "position must be untouched");
  assert.equal(key.interpolation, "linear", "interpolation must not be silently promoted");
  assert.equal(ui.checkpoints, 0, "a stationary click must not consume an undo step");
});

test("dragging a path key past the threshold moves it and checkpoints exactly once", () => {
  const { ui, key } = pathKeyFixture();
  onPointerDown(ui, event());
  onPointerMove(ui, event({ clientX: 60, clientY: 60 }));
  assert.equal(ui.checkpoints, 1, "the real drag must checkpoint once");
  assert.notDeepEqual(key.camera.position, [1, 1, 1], "position must have moved");
  assert.equal(key.interpolation, "smooth", "a hand-placed waypoint joins the move as a curve");
  onPointerMove(ui, event({ clientX: 61, clientY: 60 }));
  assert.equal(ui.checkpoints, 1, "continuing the same drag must not checkpoint again");
  onPointerUp(ui, event());
});

test("Escape cancels an un-moved path-key click without touching undo history", () => {
  const { ui, key } = pathKeyFixture();
  onPointerDown(ui, event());
  assert.equal(cancelViewportInteraction(ui), true);
  assert.equal(ui.undos, 0, "nothing was checkpointed, so nothing should be undone");
  assert.deepEqual(key.camera.position, [1, 1, 1]);
});

test("marquee selects an object it merely overlaps, not just one whose pivot is inside it (regression)", () => {
  // Real Maya/Blender select any object the rubber-band touches, even a
  // large one whose pivot sits well outside the box. This used to test only
  // the projected pivot point, so a marquee drawn over most of a big object
  // -- but missing its (possibly off-centre) origin -- silently selected
  // nothing.
  const ui = fixture("maya");
  const object = { id: "big", type: "cube", position: [0, 0, 0], rotation: [0, 0, 0], size: [6, 6, 6], keyframes: [] };
  ui.state.objects = [object];
  const camera = ui.state.editor_views.perspective;
  const origin = project([0, 0, 0], camera, ui.canvas.width, ui.canvas.height);
  assert.ok(origin[0] < 600, "sanity: the pivot must land outside the marquee used below");

  onPointerDown(ui, event({ clientX: 600, clientY: 500 }));
  assert.ok(ui.boxSelection, "must start a marquee from empty space");
  onPointerMove(ui, event({ clientX: 700, clientY: 600 }));
  onPointerUp(ui, event({ clientX: 700, clientY: 600 }));
  assert.ok(ui.selectedObjectIds.has("big"), "the object's bounding box overlaps the marquee and must be selected");
});

test("Maya: an unmodified left-drag in empty space starts a marquee, like real Maya", () => {
  // Real Maya reserves Alt for camera navigation; an unmodified drag over
  // empty space is its native rubber-band select. This used to fall straight
  // through to an unconditional orbit -- Maya profile had no marquee at all.
  const ui = fixture("maya");
  onPointerDown(ui, event());
  assert.ok(ui.boxSelection, "must start a marquee");
  assert.ok(!ui.drag, "must not also start a camera orbit");
});

test("Maya: Shift+left-drag starts an additive marquee, not a camera pan", () => {
  // Shift is documented as "additive marquee" in both profiles. Maya used to
  // treat Shift+left as a pan gesture instead, which both contradicted the
  // docs and isn't how real Maya binds Shift.
  const ui = fixture("maya");
  onPointerDown(ui, event({ shiftKey: true }));
  assert.ok(ui.boxSelection, "must start a marquee");
  assert.equal(ui.boxSelection.additive, true);
  assert.ok(!ui.drag, "must not pan the camera");
});

test("Maya: an unmodified right drag does nothing -- that button is the context menu's", () => {
  const ui = fixture("maya");
  onPointerDown(ui, event({ button: 2 }));
  assert.ok(!ui.drag, "the secondary button without Alt must not navigate");
  assert.ok(!ui.boxSelection, "it is not the marquee button either");
});

test("the middle-button family carries all three gestures, in both profiles", () => {
  // Alt does not reach the page on every setup (a window manager that claims
  // Alt+drag, a shell that opens its menu bar on Alt, an AltGr key reporting
  // Ctrl+Alt), so the modifier-free middle-button family is the baseline both
  // profiles share -- no camera gesture may depend on Alt alone.
  for (const profile of ["maya", "blender"]) {
    const orbit = fixture(profile);
    onPointerDown(orbit, event({ button: 1 }));
    assert.equal(orbit.drag?.shift, false, `${profile}: plain middle orbits`);
    assert.equal(orbit.drag?.dolly, false, `${profile}: plain middle orbits`);
    assert.ok(!orbit.boxSelection, `${profile}: the middle button never picks`);

    const pan = fixture(profile);
    onPointerDown(pan, event({ button: 1, shiftKey: true }));
    assert.equal(pan.drag?.shift, true, `${profile}: Shift+middle pans`);

    const dolly = fixture(profile);
    onPointerDown(dolly, event({ button: 1, ctrlKey: true }));
    assert.equal(dolly.drag?.dolly, true, `${profile}: Ctrl+middle dollies`);
  }
});

test("Ctrl+left over empty space navigates, but Ctrl+click still picks", () => {
  // The left-button fallback for hardware with neither a middle button nor a
  // working Alt. It must not cost multi-select: Ctrl+click reaches the picker
  // first and only an empty-space Ctrl drag falls through to the camera.
  const orbit = fixture("maya");
  onPointerDown(orbit, event({ ctrlKey: true }));
  assert.equal(orbit.drag?.shift, false, "Ctrl+left over empty space orbits");
  assert.ok(!orbit.boxSelection, "the marquee declines Ctrl so navigation can have it");

  const pan = fixture("maya");
  onPointerDown(pan, event({ ctrlKey: true, shiftKey: true }));
  assert.equal(pan.drag?.shift, true, "Ctrl+Shift+left over empty space pans");

  const picking = fixture("maya");
  const object = { id: "cube", type: "cube", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [] };
  picking.state.objects = [object];
  picking.webgl = { pick: () => ({ type: "object", id: "cube" }) };
  onPointerDown(picking, event({ ctrlKey: true }));
  assert.ok(picking.selectedObjectIds.has("cube"), "Ctrl+click on an object still toggles the selection");
  assert.ok(!picking.drag, "and must not also arm a camera drag");
});

test("every gesture stays reachable from the left button alone, in both profiles", () => {
  // The pan/dolly fallbacks for hardware with no middle button. Alt still
  // gates all three, so none of this reclaims a gesture selection needs.
  for (const profile of ["maya", "blender"]) {
    const orbit = fixture(profile);
    onPointerDown(orbit, event({ altKey: true, button: 0 }));
    assert.equal(orbit.drag?.shift, false, `${profile}: Alt+left orbits`);
    assert.equal(orbit.drag?.dolly, false, `${profile}: Alt+left orbits`);

    const pan = fixture(profile);
    onPointerDown(pan, event({ altKey: true, shiftKey: true, button: 0 }));
    assert.equal(pan.drag?.shift, true, `${profile}: Alt+Shift+left pans`);
    assert.ok(!pan.boxSelection, `${profile}: Alt+Shift+left is navigation, not an additive marquee`);

    const dolly = fixture(profile);
    onPointerDown(dolly, event({ altKey: true, ctrlKey: true, button: 0 }));
    assert.equal(dolly.drag?.dolly, true, `${profile}: Alt+Ctrl+left dollies`);
  }
});

test("an orthographic view pans instead of orbiting, and still ignores an unmodified drag", () => {
  // Ortho has no orbit to give, so every orbit gesture tracks instead. What it
  // must not do is turn any leftover click into a camera drag: an unmodified
  // one belongs to the marquee here exactly as it does in perspective.
  const ui = fixture("maya");
  ui.state.view_mode = "top";
  ui.state.editor_views.top.camera_type = "orthographic";
  onPointerDown(ui, event({ altKey: true, button: 0 }));
  assert.equal(ui.drag?.shift, true, "Alt+left tracks in an orthographic view");

  const plain = fixture("maya");
  plain.state.view_mode = "top";
  plain.state.editor_views.top.camera_type = "orthographic";
  onPointerDown(plain, event());
  assert.ok(!plain.drag, "an unmodified drag belongs to the marquee here, exactly as in perspective");
  assert.ok(plain.boxSelection, "and it must actually start that marquee");
});

test("Maya: the canonical Alt gestures still work wherever Alt does arrive", () => {
  const orbit = fixture("maya");
  onPointerDown(orbit, event({ altKey: true, button: 0 }));
  assert.equal(orbit.drag?.shift, false);
  assert.equal(orbit.drag?.dolly, false);

  const pan = fixture("maya");
  onPointerDown(pan, event({ altKey: true, button: 1 }));
  assert.equal(pan.drag?.shift, true);

  const dolly = fixture("maya");
  onPointerDown(dolly, event({ altKey: true, button: 2 }));
  assert.equal(dolly.drag?.dolly, true);
});

test("Blender Fly drag looks around instead of starting marquee selection", () => {
  const ui = fixture("blender");
  ui.isNavigatingFly = true;
  onPointerDown(ui, event());
  assert.equal(ui.drag?.fly, true);
  assert.ok(!ui.boxSelection);
});

test("equivalent pixel, line and page wheel gestures produce the same zoom", () => {
  const cameras = [[120, 0], [7.5, 1], [0.3, 2]].map(([deltaY, deltaMode]) => {
    const ui = fixture();
    onWheel(ui, event({ deltaY, deltaMode }));
    return ui.state.editor_views.perspective;
  });
  assert.deepEqual(cameras[0], cameras[1]);
  assert.deepEqual(cameras[0], cameras[2]);
});

test("zero wheel motion does not create an undo entry", () => {
  const ui = fixture();
  onWheel(ui, event({ deltaY: 0 }));
  assert.equal(ui.checkpoints, 0);
});

test("marquee release always clears pointer capture and dragging feedback", () => {
  const ui = fixture("blender");
  onPointerDown(ui, event());
  onPointerUp(ui, event());
  assert.equal(ui.activePointerId, null);
  assert.equal(ui.interactionElement.hasPointerCapture(1), false);
  assert.equal(ui.canvas.classList.contains("dragging"), false);
});

test("Escape before moving does not undo the previous edit", () => {
  for (const mode of ["camera", "perspective"]) {
    const ui = fixture("maya", mode);
    onPointerDown(ui, event({ altKey: true }));
    assert.equal(cancelViewportInteraction(ui), true);
    assert.equal(ui.undos, 0);
    assert.equal(ui.checkpoints, 0);
  }
});

test("camera undo checkpoint precedes auto-key creation on the first movement", () => {
  const ui = fixture("maya", "camera");
  ui.beginCameraEdit = () => assert.equal(ui.checkpoints, 1, "auto-key must be created after the snapshot");
  onPointerDown(ui, event({ altKey: true }));
  onPointerMove(ui, event({ altKey: true, clientX: 90 }));
});

test("pointer cancellation and unexpected capture loss clear a marquee without selecting", () => {
  for (const type of ["pointercancel", "lostpointercapture"]) {
    const ui = fixture("blender");
    onPointerDown(ui, event());
    onPointerUp(ui, event({ type }));
    assert.equal(ui.boxSelection, null);
    assert.equal(ui.activePointerId, null);
    assert.equal(ui.selectedObjectId, "keep");
  }
});

test("Escape cancels a marquee without changing the selection or undo history", () => {
  const ui = fixture("blender");
  onPointerDown(ui, event());
  assert.equal(cancelViewportInteraction(ui), true);
  assert.equal(ui.boxSelection, null);
  assert.equal(ui.selectedObjectId, "keep");
  assert.equal(ui.undos, 0);
  assert.equal(ui.activePointerId, null);
});

test("pan tracks CSS pixels equally on standard and high DPI canvases", () => {
  const results = [1, 2].map((dpr) => {
    const ui = fixture("maya", "front");
    ui.canvas.width *= dpr; ui.canvas.height *= dpr;
    onPointerDown(ui, event({ button: 1 }));
    onPointerMove(ui, event({ button: 1, clientX: 100 }));
    return ui.state.editor_views.front;
  });
  assert.deepEqual(results[0], results[1]);
});

test("F frames the whole selection within a portrait viewport in perspective and ortho", () => {
  for (const mode of ["perspective", "front"]) {
    const ui = fixture("maya", mode);
    ui.canvas.width = 300; ui.canvas.height = 600;
    ui.state.objects = [-8, 8].map((x, i) => ({ id: String(i), type: "cube", position: [x, 0, 0], size: [2, 2, 2], rotation: [0, 0, 0] }));
    ui.selectedObjectId = "0"; ui.selectedObjectIds = new Set(["0", "1"]);
    const tracks = JSON.stringify(ui.state.cameras);
    frameTarget(ui);
    const camera = ui.state.editor_views[mode];
    assert.deepEqual(camera.target, [0, 0, 0]);
    for (const x of [-9, -7, 7, 9]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
      const p = project([x, y, z], camera, 300, 600);
      assert.ok(p && p[0] > 0 && p[0] < 300 && p[1] > 0 && p[1] < 600, `clipped corner ${x},${y},${z}`);
    }
    assert.equal(JSON.stringify(ui.state.cameras), tracks);
  }
});

test("dragging the camera target in an orthographic view follows the zoom (regression)", () => {
  // The free target drag derived its world-per-pixel rate from the camera
  // distance and, for an orthographic view, a fixed constant -- `zoom` never
  // entered the expression. Zooming in therefore did not slow the drag down,
  // so the target shot away from the cursor by exactly the zoom factor. An
  // orthographic view's on-screen scale is 10/zoom, nothing else.
  const travel = [1, 5].map((zoom) => {
    const { ui, track } = trackingFixture();
    track.target_object_id = null;
    const camera = track.keyframes[0].camera;
    camera.camera_type = "orthographic";
    camera.zoom = zoom;
    ui.setFrame(0);
    onPointerDown(ui, event());
    assert.ok(ui.targetFreeDrag, "must start the free target drag");
    onPointerMove(ui, event({ clientX: 120, clientY: 20 }));
    return Math.abs(ui.camera.target[0] - 5);
  });
  assert.ok(travel[0] > 1e-6, "sanity: the drag must move the target at zoom 1");
  assert.ok(
    Math.abs(travel[0] / travel[1] - 5) < 1e-6,
    `a 5x zoom must move the target 5x less, got ${travel[0]} then ${travel[1]}`,
  );
});
