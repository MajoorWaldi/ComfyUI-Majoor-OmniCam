// Baseline regression coverage for Task 1 of the Spatial Camera Editor v2
// plan (docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md).
//
// Most of the assertions the plan asks for already exist:
//   - path point drag math                -> viewport/path-editing.js is pure
//     and covered indirectly by camera-path-draw / camera-path-curve tests.
//   - Bezier handle drag preserves the opposite handle in aligned mode
//                                          -> camera-path-curve.node.mjs
//   - whole-path translate/rotate/scale preserve offsets/radius/centroid
//                                          -> camera-path-transform.node.mjs
//   - camera scale disabled / locked camera has no gizmo
//                                          -> transform-gizmo.node.mjs
//
// The one gap is a direct regression test proving a *locked* camera path
// refuses a whole-path gizmo drag (beginPathGizmoDrag returns false and never
// checkpoints), plus a sanity check that screenToPlane keeps a dragged key's
// view-depth fixed. Both are asserted here so the pre-TransformControls
// behavior is locked in before the gizmo layer changes underneath it.

import test from "node:test";
import assert from "node:assert/strict";

import { beginPathGizmoDrag } from "../../web-src/viewport-controls/path-gizmo.js";
import { screenToPlane } from "../../web-src/viewport/path-editing.js";

function makeTrack(overrides = {}) {
  return {
    id: "camera_1",
    locked: false,
    keyframes: [
      { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, -5], fov: 35, roll: 0 } },
      { frame: 10, camera: { position: [2, 0, 0], target: [2, 0, -5], fov: 35, roll: 0 } },
    ],
    ...overrides,
  };
}

function makeUi(track) {
  let checkpoints = 0;
  return {
    checkpoint: () => { checkpoints += 1; },
    activeCameraTrack: () => track,
    getCheckpointCount: () => checkpoints,
    canvas: { height: 600 },
  };
}

test("a locked camera track refuses a whole-path gizmo drag and never checkpoints (regression)", () => {
  const track = makeTrack({ locked: true });
  const ui = makeUi(track);
  const started = beginPathGizmoDrag(ui, {
    baseDrag: {},
    viewCamera: { position: [0, 0, 10], target: [0, 0, 0], fov: 35, camera_type: "perspective" },
    entityPosition: [0, 0, 0],
  });
  assert.equal(started, false, "locked track must not start a drag");
  assert.equal(ui.getCheckpointCount(), 0, "no history checkpoint is recorded for a refused drag");
});

test("an unlocked camera track with keyframes starts a whole-path gizmo drag", () => {
  const track = makeTrack();
  const ui = makeUi(track);
  const started = beginPathGizmoDrag(ui, {
    baseDrag: {},
    viewCamera: { position: [0, 0, 10], target: [0, 0, 0], fov: 35, camera_type: "perspective" },
    entityPosition: [0, 0, 0],
  });
  assert.equal(started, true);
  assert.equal(ui.getCheckpointCount(), 1, "exactly one checkpoint per drag start");
});

test("a track with no keyframes refuses a whole-path gizmo drag", () => {
  const track = makeTrack({ keyframes: [] });
  const ui = makeUi(track);
  const started = beginPathGizmoDrag(ui, {
    baseDrag: {},
    viewCamera: { position: [0, 0, 10], target: [0, 0, 0], fov: 35, camera_type: "perspective" },
    entityPosition: [0, 0, 0],
  });
  assert.equal(started, false);
});

test("screenToPlane preserves the anchor's view-depth while sliding across the screen", () => {
  const camera = { position: [0, 0, 10], target: [0, 0, 0], fov: 50, camera_type: "perspective" };
  const anchor = [1, 1, 0];
  const width = 800;
  const height = 600;

  const centerHit = screenToPlane([width / 2, height / 2], camera, anchor, width, height);
  const cornerHit = screenToPlane([width / 4, height / 4], camera, anchor, width, height);

  // Depth along the view direction (Z, since the camera looks down -Z here)
  // must stay the same as the anchor's, regardless of where on screen the
  // pointer is: only X/Y should move.
  assert.ok(Math.abs(centerHit[2] - anchor[2]) < 1e-6, "center hit keeps anchor depth");
  assert.ok(Math.abs(cornerHit[2] - anchor[2]) < 1e-6, "off-center hit keeps anchor depth");
  assert.notEqual(cornerHit[0], centerHit[0], "moving the pointer changes the projected X");
});
