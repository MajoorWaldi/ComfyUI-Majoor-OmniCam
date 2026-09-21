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

test("Alt-orbit over a hovered gizmo handle stops the native event so TransformControls can't also start a drag (regression)", () => {
  // Regression: an Alt-drag arms this app's own navigation `ui.drag` (Alt
  // means "navigate, not edit", per canEditGizmo below), but three.js's
  // TransformControls has its own native "pointerdown" listener on the same
  // element that doesn't know about Alt/Shift -- if the pointer happened to
  // be over a selected object's gizmo handle, it silently started its own
  // drag too and set `ui.transformControlsDragging = true`, which made
  // onPointerMove's very first line bail out before ever updating the
  // orbit -- the camera view simply never moved.
  const ui = fixture();
  ui.transformControlsWiring = { isPointerOverHandle: () => true };
  let immediateStops = 0;
  onPointerDown(ui, event({ altKey: true, stopImmediatePropagation: () => { immediateStops += 1; } }));
  assert.ok(ui.drag, "navigation must still be armed");
  assert.equal(immediateStops, 1, "must stop the native event from also reaching TransformControls' own listener");
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
  ui.state.active_camera_id = "cam_1";
  ui.activateCamera = () => {};
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
  assert.equal(ui.selectedKeyFrame, 5, "clicking still selects the key");
  assert.deepEqual([...ui.pathSelection.frames], [5], "and enters the spatial path selection");
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

test("Simple profile: a bare left drag orbits, with no marquee and no modifier", () => {
  const ui = fixture("simple");
  onPointerDown(ui, event());
  assert.ok(!ui.boxSelection, "the simple profile has no viewport marquee");
  assert.ok(ui.drag, "a bare left drag arms a camera gesture");
  assert.equal(ui.drag.shift, false, "left drag orbits, it does not pan");
  assert.equal(ui.drag.dolly, false, "left drag orbits, it does not dolly");
});

test("Simple profile: a bare right drag pans the viewport", () => {
  const ui = fixture("simple");
  onPointerDown(ui, event({ button: 2 }));
  assert.ok(ui.drag, "the secondary button navigates in the simple profile");
  assert.equal(ui.drag.shift, true, "right drag pans");
});

test("Simple profile: a bare left click still reaches the picker and selects", () => {
  const ui = fixture("simple");
  const object = { id: "cube", type: "cube", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [] };
  ui.state.objects = [object];
  ui.selectedObjectId = null;
  ui.selectedObjectIds = new Set();
  ui.activateCamera = () => {};
  ui.webgl = { pick: () => ({ type: "object", id: "cube" }) };
  onPointerDown(ui, event());
  assert.equal(ui.selectedObjectId, "cube", "a stationary left press still picks");
  assert.ok(!ui.drag, "and it does not also arm an orbit");
});

test("Simple profile: the modified Maya/Blender bindings still work underneath it", () => {
  const dolly = fixture("simple");
  onPointerDown(dolly, event({ button: 1, ctrlKey: true }));
  assert.equal(dolly.drag?.dolly, true, "Ctrl+middle still dollies");

  const pan = fixture("simple");
  onPointerDown(pan, event({ altKey: true, shiftKey: true }));
  assert.equal(pan.drag?.shift, true, "Alt+Shift+left still pans");
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

test("pan sensitivity scales viewport tracking without changing the gesture", () => {
  const positions = [1, 0.5].map((panSensitivity) => {
    const ui = fixture("maya", "front");
    ui.panSensitivity = panSensitivity;
    onPointerDown(ui, event({ button: 1, shiftKey: true }));
    onPointerMove(ui, event({ button: 1, shiftKey: true, clientX: 100 }));
    return ui.state.editor_views.front.position[0];
  });
  assert.ok(Math.abs(positions[1] / positions[0] - 0.5) < 1e-9);
});

test("dolly sensitivity scales drag dolly distance", () => {
  const distances = [1, 0.5].map((dollySensitivity) => {
    const ui = fixture("maya", "perspective");
    ui.dollySensitivity = dollySensitivity;
    onPointerDown(ui, event({ button: 1, ctrlKey: true }));
    onPointerMove(ui, event({ button: 1, ctrlKey: true, clientY: 120 }));
    const camera = ui.state.editor_views.perspective;
    return Math.hypot(
      camera.position[0] - camera.target[0],
      camera.position[1] - camera.target[1],
      camera.position[2] - camera.target[2],
    );
  });
  assert.ok(distances[0] > distances[1], "lower sensitivity must dolly less for the same drag");
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

test("a spatial-curve tangent handle wins over an overlapping live gizmo and stops the native event from also reaching it (regression)", () => {
  // Regression: a selected single path key attaches a live "path_point"
  // TransformControls gizmo right at its position (plan Task 6). Whenever
  // that gizmo's own hoverable handle area happens to overlap a nearby
  // tangent knob on screen, isPointerOverHandle() used to be checked (and
  // bail out) *before* pickCurveHandle() got a chance -- silently swallowing
  // every tangent drag under an overlapping gizmo. Reordering the checks
  // fixed the app-level branch, but three.js's TransformControls also
  // listens for "pointerdown" natively on the very same element, completely
  // independently of this handler's own branching -- only
  // stopImmediatePropagation() (not the plain stopPropagation() already
  // called earlier) keeps that sibling listener from also starting its own
  // drag and later stomping this one's result with its own commit.
  const ui = fixture();
  // A real, non-degenerate tangent offset -- meaningfully away from the key's
  // own [0,0,0] position (see the sibling regression test below for the
  // degenerate/coincident case, which must NOT win).
  const knob = { cameraId: "cam_1", frame: 24, side: "out", position: [1, 0.5, 0] };
  const key = { frame: 24, camera: { position: [0, 0, 0], target: [0, 0, -5] } };
  ui.state.cameras = [{ id: "cam_1", keyframes: [key] }];
  ui.selectKeyframe = (k) => { ui.selectedKeyFrame = k; };
  ui.webgl = { pickCurveHandle: () => knob };
  // Simulate the exact scenario that broke: the pointer is also over this
  // same key's own live "path_point" gizmo right now.
  ui.transformControlsWiring = { isPointerOverHandle: () => true, currentLiveType: () => "path_point" };

  let immediateStops = 0;
  onPointerDown(ui, event({ stopImmediatePropagation: () => { immediateStops += 1; } }));

  assert.ok(ui.curveHandleDrag, "the tangent drag must be armed despite the overlapping live gizmo");
  assert.equal(ui.curveHandleDrag.frame, 24);
  assert.equal(immediateStops, 1, "must stop the native event from also reaching TransformControls' own listener");
});

test("a real tangent handle also wins over the 'camera' gizmo when the playhead is scrubbed onto that exact keyframe (regression)", () => {
  // Same fix as the test above, but for the actual real-world shape of the
  // original flake: selecting a camera path key (ui.selectKeyframe) scrubs
  // the playhead onto it but does NOT change ui.selectedEntity away from
  // "camera" -- so the live gizmo type here is "camera", not "path_point",
  // even though it is, in effect, sitting exactly on this one keyframe.
  const ui = fixture();
  const knob = { cameraId: "cam_1", frame: 30, side: "out", position: [1, 1, 0] };
  const key = { frame: 30, camera: { position: [0, 1, 0], target: [0, 1, -5] } };
  ui.state.cameras = [{ id: "cam_1", keyframes: [key] }];
  ui.selectKeyframe = (k) => { ui.selectedKeyFrame = k; };
  ui.webgl = { pickCurveHandle: () => knob };
  ui.transformControlsWiring = { isPointerOverHandle: () => true, currentLiveType: () => "camera" };

  onPointerDown(ui, event());

  assert.ok(ui.curveHandleDrag, "a real tangent handle must win even when the overlapping gizmo reports type \"camera\"");
  assert.equal(ui.curveHandleDrag.frame, 30);
});

test("a degenerate tangent handle (no real offset from its own key) never wins a click, even under a hovered gizmo (regression)", () => {
  // Regression: a handle with no adjacent key on that side (a track's first/
  // last key, or a single-key track) has no real tangent direction --
  // spatialHandlePoints()/autoTangent() (camera-path-curve.js) then collapse
  // it exactly onto its own key's position. pickCurveHandle()'s fixed-pixel
  // fallback still finds and returns it, entirely independent of what else is
  // actually selected -- so on a single-key camera track, its degenerate "in"
  // handle sits exactly on top of the camera's own icon, and used to silently
  // hijack an ordinary "select camera, translate the gizmo" drag into a bogus
  // tangent-handle edit instead -- the camera never actually moved.
  const ui = fixture();
  const knob = { cameraId: "cam_1", frame: 0, side: "in", position: [6, 4, 6] };
  ui.state.cameras = [{ id: "cam_1", keyframes: [{ frame: 0, camera: { position: [6, 4, 6], target: [0, 1, 0] } }] }];
  ui.webgl = { pickCurveHandle: () => knob };
  // "camera" (not "path_point") is deliberately exercised here: selecting a
  // path key does not itself change ui.selectedEntity away from "camera", so
  // this is the live type a camera's own gizmo actually reports -- the
  // degenerate-position check (not a type-based exclusion) is what must
  // reject this specific knob.
  ui.transformControlsWiring = { isPointerOverHandle: () => true, currentLiveType: () => "camera" };

  onPointerDown(ui, event());

  assert.equal(ui.curveHandleDrag, undefined, "a knob with no real offset from its key must not win over the camera's own gizmo");
});

test("a multi-key path_group gizmo always wins outright, even over a real (non-degenerate) tangent handle nearby (regression)", () => {
  // Regression: unlike a single selected key, a path_group's gizmo anchors at
  // the *centroid* of the selected keys -- which can coincidentally land near
  // a perfectly real, non-degenerate tangent handle belonging to a *different*
  // key that's also part of the selection (its own primary-key tangent
  // rendering isn't tied to the group's centroid at all). Letting any
  // non-degenerate knob outrank *any* hovered gizmo let that coincidence
  // hijack a two-key group drag into an unrelated single-tangent edit.
  const ui = fixture();
  const knob = { cameraId: "cam_1", frame: 30, side: "in", position: [-0.667, 1, 0] };
  ui.state.cameras = [{
    id: "cam_1",
    keyframes: [
      { frame: 0, camera: { position: [-2, 1, 0], target: [-2, 1, -5] } },
      { frame: 30, camera: { position: [0, 1, 0], target: [0, 1, -5] } },
    ],
  }];
  ui.webgl = { pickCurveHandle: () => knob };
  ui.transformControlsWiring = { isPointerOverHandle: () => true, currentLiveType: () => "path_group" };

  onPointerDown(ui, event());

  assert.equal(ui.curveHandleDrag, undefined, "a real but unrelated tangent handle must not win over a path_group gizmo");
});

test("a camera explicitly selected as itself never has its own path marker hijack the click (regression)", () => {
  // Regression: with the coincidental curve-handle claim correctly rejected
  // (the test above), the click fell through to handlePathKeyPointerDown --
  // which grabs *any* visible path-key marker under the pointer with no
  // regard for what's actually selected. A single-key camera's own marker
  // sits exactly at its own icon, so selecting "camera" (e.g. in Scale mode,
  // where no gizmo attaches at all) and clicking/dragging there used to
  // silently move the *key's* position via the marker-drag path instead of
  // correctly doing nothing.
  const ui = fixture();
  const handle = { cameraId: "cam_1", frame: 0 };
  const track = { id: "cam_1", keyframes: [{ frame: 0, camera: { position: [6, 4, 6], target: [0, 1, 0] } }] };
  ui.state.cameras = [track];
  ui.state.active_camera_id = "cam_1";
  ui.activateCamera = () => assert.fail("must not reactivate/claim the already-selected camera's own marker");
  ui.activeCameraTrack = () => track;
  ui.selectedEntity = "camera";
  ui.webgl = { pickPathKey: () => handle };

  onPointerDown(ui, event());

  assert.equal(ui.pathDrag, undefined, "the camera's own marker must not arm a path-key drag while it is selected as itself");
});

test("in simple navigation mode, right-drag pan suppresses context menu but stationary right-click preserves it", () => {
  const ui = fixture("simple", "perspective");
  let menuOpened = false;
  ui.openViewportContext = () => { menuOpened = true; };
  ui.pickSceneObject = () => null;

  // Case 1: Right-drag (Pan)
  onPointerDown(ui, event({ button: 2, clientX: 100, clientY: 100 }));
  assert.ok(ui.drag, "RMB in simple profile arms pan drag");
  assert.equal(ui.drag.shift, true, "RMB in simple profile is pan");
  onPointerMove(ui, event({ button: 2, clientX: 150, clientY: 150 }));
  assert.equal(ui.drag.moved, true, "movement flagged drag as moved");
  onPointerUp(ui, event({ button: 2, clientX: 150, clientY: 150 }));
  assert.equal(ui.lastRightClickWasDrag, true, "drag was recorded as right-drag");

  // Simulate contextmenu event after drag
  const targetWrap = { closest: (sel) => (sel === ".viewport-wrap" ? targetWrap : null) };
  const ctxEvent = { target: targetWrap, altKey: false, shiftKey: false, clientX: 150, clientY: 150, preventDefault() {}, stopPropagation() {} };
  ui.onContextMenu = function(e) {
    if (this.state.navigation_profile === "simple" && e.target?.closest?.(".viewport-wrap")) {
      if (this.lastRightClickWasDrag && !e.shiftKey) {
        this.lastRightClickWasDrag = false;
        return;
      }
      this.lastRightClickWasDrag = false;
    }
    this.openViewportContext(e);
  };
  ui.onContextMenu(ctxEvent);
  assert.equal(menuOpened, false, "right-drag must suppress context menu");

  // Case 2: Stationary right-click (no drag movement)
  onPointerDown(ui, event({ button: 2, clientX: 100, clientY: 100 }));
  assert.ok(ui.drag, "RMB arms drag");
  onPointerUp(ui, event({ button: 2, clientX: 100, clientY: 100 }));
  assert.equal(ui.lastRightClickWasDrag, false, "stationary click was not a drag");

  ui.onContextMenu(ctxEvent);
  assert.equal(menuOpened, true, "stationary right-click must open context menu in simple profile");
});

