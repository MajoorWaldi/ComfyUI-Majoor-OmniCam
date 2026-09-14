import test from "node:test";
import assert from "node:assert/strict";

import { resolveTransformTarget } from "../../web-src/viewport-controls/transform-target.js";
import { gizmoGeometry } from "../../web-src/viewport-controls.js";
import { setPathSelectionComponent } from "../../web-src/director/camera-path-selection.js";
import { trackHasActiveLookAt, transformSelectedPathTargets } from "../../web-src/director/camera-path-transform.js";

function baseCamera() {
  return { position: [6, 4, 6], target: [0, 1, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 };
}

function baseTrack(overrides = {}) {
  return {
    id: "camera_1",
    locked: false,
    keyframes: [
      { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, -5], fov: 35, roll: 0 } },
      { frame: 10, camera: { position: [4, 0, 0], target: [9, 2, -1], fov: 35, roll: 0 } },
    ],
    ...overrides,
  };
}

function baseUi(overrides = {}) {
  const track = overrides.track || baseTrack();
  return {
    state: { view_mode: overrides.viewMode ?? "top", editor_views: { top: baseCamera() }, objects: [], cameras: [track] },
    camera: baseCamera(),
    canvas: { width: 800, height: 450 },
    frame: 0,
    selectedEntity: "camera_path",
    activeCameraTrack() { return track; },
    pathSelection: { cameraId: "camera_1", frames: new Set([10]), primaryFrame: 10, component: overrides.component ?? "target" },
  };
}

// -- target markers derive from key.camera.target ---------------------------

test("resolveTransformTarget: a target-component selection resolves to path_point_target at the key's exact camera.target", () => {
  const ui = baseUi();
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "path_point_target");
  assert.equal(target.id, "path_point_target:camera_1:10");
  assert.deepEqual(target.position, [9, 2, -1]);
  assert.deepEqual(target.allowedModes, ["translate"]);
  assert.equal(target.frame, 10);
  assert.equal(target.readOnly, false);
});

test("resolveTransformTarget: a position-component selection is unaffected (still path_point at camera.position)", () => {
  const ui = baseUi({ component: "position" });
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "path_point");
  assert.deepEqual(target.position, [4, 0, 0]);
});

test("resolveTransformTarget: multi-key selection still ignores the component (Phase 2 per the plan)", () => {
  const ui = baseUi();
  ui.pathSelection = { cameraId: "camera_1", frames: new Set([0, 10]), primaryFrame: 10, component: "target" };
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "path_group");
});

// -- moving a target marker modifies target only -----------------------------

test("transformSelectedPathTargets: moves only camera.target on the selected key, position untouched", () => {
  const track = baseTrack();
  const baseKeys = track.keyframes.map((key) => ({ ...key, camera: { ...key.camera } }));
  const moved = transformSelectedPathTargets(baseKeys, [10], { delta: [1, 2, 3] });

  const untouched = moved.find((k) => k.frame === 0);
  const changed = moved.find((k) => k.frame === 10);
  assert.deepEqual(untouched.camera.target, [0, 0, -5], "unselected key's target is untouched");
  assert.deepEqual(changed.camera.position, [4, 0, 0], "position is never moved by a target-only transform");
  assert.deepEqual(changed.camera.target, [10, 4, 2], "selected key's target moved by delta");
});

test("transformSelectedPathTargets: a key with no target array is left alone", () => {
  const keys = [{ frame: 0, camera: { position: [0, 0, 0] } }];
  const moved = transformSelectedPathTargets(keys, [0], { delta: [1, 1, 1] });
  assert.equal(moved[0].camera.target, undefined);
});

// -- a Look-At-constrained camera reports its target path read-only ---------

test("trackHasActiveLookAt: true for the legacy target_object_id shape", () => {
  assert.equal(trackHasActiveLookAt({ target_object_id: "obj_1" }), true);
});

test("trackHasActiveLookAt: true for an explicit active constraints.look_at", () => {
  assert.equal(trackHasActiveLookAt({ constraints: { look_at: { object_id: "obj_1", status: "active" } } }), true);
});

test("trackHasActiveLookAt: false when the constraint is explicitly disabled", () => {
  assert.equal(trackHasActiveLookAt({ constraints: { look_at: { object_id: "obj_1", status: "disabled" } } }), false);
});

test("trackHasActiveLookAt: false with no constraint at all", () => {
  assert.equal(trackHasActiveLookAt({}), false);
  assert.equal(trackHasActiveLookAt(null), false);
});

test("trackHasActiveLookAt: without an objects list, a bare object_id is still treated as active (previous, permissive behavior)", () => {
  assert.equal(trackHasActiveLookAt({ target_object_id: "obj_1" }, undefined), true);
});

test("trackHasActiveLookAt requires the constrained object to actually exist and be enabled when an objects list is given", () => {
  const track = { target_object_id: "obj_1" };
  assert.equal(trackHasActiveLookAt(track, []), false, "no such object");
  assert.equal(trackHasActiveLookAt(track, [{ id: "obj_2" }]), false, "a different object exists, not this one");
  assert.equal(trackHasActiveLookAt(track, [{ id: "obj_1", enabled: false }]), false, "the object exists but is disabled");
  assert.equal(trackHasActiveLookAt(track, [{ id: "obj_1" }]), true, "the object exists and is enabled by default");
  assert.equal(trackHasActiveLookAt(track, [{ id: "obj_1", enabled: true }]), true, "explicitly enabled");
});

test("resolveTransformTarget: a Look-At-constrained track's target component is read-only", () => {
  // The constrained object must actually exist (and be enabled) for
  // sampleCamera to really honor the constraint -- see the
  // "trackHasActiveLookAt requires the constrained object to actually exist"
  // tests below -- so this fixture includes it.
  const ui = baseUi({ track: baseTrack({ target_object_id: "obj_1" }) });
  ui.state.objects = [{ id: "obj_1", position: [1, 2, 3] }];
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "path_point_target");
  assert.equal(target.readOnly, true, "a constrained track's target must never offer a live gizmo");
  // The position component on the very same track is completely unaffected --
  // the constraint only concerns the target, never the position path.
  const positionUi = baseUi({ track: baseTrack({ target_object_id: "obj_1" }), component: "position" });
  positionUi.state.objects = ui.state.objects;
  assert.equal(resolveTransformTarget(positionUi).readOnly, undefined);
});

test("resolveTransformTarget: a Look-At constraint pointing at a deleted/disabled object is not treated as active", () => {
  // Regression: trackHasActiveLookAt() used to only check for the presence of
  // an object_id, never whether that object still exists or is enabled --
  // unlike the real sampleCamera(), which falls back to the keyframed target
  // whenever the constrained object is missing or disabled. That mismatch
  // meant the UI could report a target read-only (and pick the wrong
  // transform branch) for a constraint that sampleCamera itself was actually
  // ignoring.
  const missingUi = baseUi({ track: baseTrack({ target_object_id: "obj_1" }) });
  missingUi.state.objects = []; // the object no longer exists
  assert.equal(resolveTransformTarget(missingUi).readOnly, false, "no matching object -> not read-only");

  const disabledUi = baseUi({ track: baseTrack({ target_object_id: "obj_1" }) });
  disabledUi.state.objects = [{ id: "obj_1", position: [1, 2, 3], enabled: false }];
  assert.equal(resolveTransformTarget(disabledUi).readOnly, false, "disabled object -> not read-only");
});

test("gizmoGeometry: the legacy canvas gizmo is suppressed for a live-wired path_point_target, same as every other live-wired type", () => {
  // Regression: LIVE_TRANSFORM_CONTROLS_TYPES (viewport-controls.js) was
  // missing "path_point_target", so once the app installs the real
  // TransformControls wiring, selecting a single path key's (editable, not
  // Look-At-constrained) target still rendered/picked the *old* canvas-drawn
  // gizmo on top of -- or, for a read-only target, in place of -- the correct
  // "no live handle offered" state.
  const ui = baseUi();
  ui.transformControlsWiring = {}; // presence alone is the gate; sync()'s own live-type bookkeeping is exercised in transform-controls-wiring.node.mjs
  assert.equal(resolveTransformTarget(ui).type, "path_point_target", "sanity: this selection resolves to the type under test");
  assert.equal(gizmoGeometry(ui), null, "the legacy gizmo must not draw/pick for a live-wired path_point_target");
});

// -- Position/Target toggle --------------------------------------------------

test("setPathSelectionComponent: switches between position and target, ignores garbage", () => {
  const selection = { cameraId: "camera_1", frames: new Set([0]), primaryFrame: 0, component: "position" };
  const toTarget = setPathSelectionComponent(selection, "target");
  assert.equal(toTarget.component, "target");
  assert.notEqual(toTarget, selection, "returns a new object");
  const backToPosition = setPathSelectionComponent(toTarget, "position");
  assert.equal(backToPosition.component, "position");
  const unchanged = setPathSelectionComponent(selection, "bogus");
  assert.equal(unchanged.component, "position");
});

test("setPathSelectionComponent: works from a missing/undefined selection", () => {
  const created = setPathSelectionComponent(undefined, "target");
  assert.equal(created.component, "target");
  assert.equal(created.primaryFrame, null);
});
