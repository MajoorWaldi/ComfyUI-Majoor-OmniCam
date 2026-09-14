import test from "node:test";
import assert from "node:assert/strict";

import { resolveTransformTarget } from "../../web-src/viewport-controls/transform-target.js";

function baseObject(overrides = {}) {
  return { id: "subject", type: "cube", position: [1, 2, 3], rotation: [0, 0, 0], size: [1, 2, 3], keyframes: [], ...overrides };
}

function baseCamera() {
  return { position: [6, 4, 6], target: [0, 1, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 };
}

function baseTrack(overrides = {}) {
  return {
    id: "camera_1",
    locked: false,
    keyframes: [
      { frame: 0, camera: { position: [0, 0, 0], target: [0, 0, -5], fov: 35, roll: 0 } },
      { frame: 10, camera: { position: [4, 0, 0], target: [4, 0, -5], fov: 35, roll: 0 } },
    ],
    ...overrides,
  };
}

function baseUi(overrides = {}) {
  const object = overrides.object || baseObject();
  const track = overrides.track || baseTrack();
  return {
    state: { view_mode: overrides.viewMode ?? "top", objects: [object], cameras: [track] },
    camera: baseCamera(),
    frame: 0,
    selectedEntity: overrides.selectedEntity ?? "object",
    selectedObjectId: object.id,
    selectedObject() { return this.state.objects.find((item) => item.id === this.selectedObjectId) || null; },
    activeCameraTrack() { return track; },
    ...overrides.extra,
  };
}

test("resolves an object target with all three modes allowed", () => {
  const ui = baseUi({ selectedEntity: "object" });
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "object");
  assert.equal(target.id, "object:subject");
  assert.deepEqual(target.position, [1, 2, 3]);
  assert.deepEqual(target.allowedModes, ["translate", "rotate", "scale"]);
});

test("resolves a camera target with translate and rotate but not scale", () => {
  const ui = baseUi({ selectedEntity: "camera" });
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "camera");
  assert.equal(target.id, "camera:camera_1");
  assert.deepEqual(target.allowedModes, ["translate", "rotate"]);
  assert.ok(!target.allowedModes.includes("scale"));
});

test("resolves a camera_target with translate only", () => {
  const ui = baseUi({ selectedEntity: "camera_target" });
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "camera_target");
  assert.deepEqual(target.allowedModes, ["translate"]);
});

test("resolves the whole camera_path centered on the keyframe centroid, all modes allowed", () => {
  const ui = baseUi({ selectedEntity: "camera_path" });
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "camera_path");
  assert.equal(target.id, "camera_path:camera_1");
  assert.deepEqual(target.position, [2, 0, 0]);
  assert.deepEqual(target.allowedModes, ["translate", "rotate", "scale"]);
  assert.equal(target.track.id, "camera_1");
});

test("a locked object resolves to null", () => {
  const ui = baseUi({ selectedEntity: "object", object: baseObject({ locked: true }) });
  assert.equal(resolveTransformTarget(ui), null);
});

test("no selected object resolves to null", () => {
  const ui = baseUi({ selectedEntity: "object" });
  ui.selectedObjectId = "does-not-exist";
  assert.equal(resolveTransformTarget(ui), null);
});

test("a locked camera track resolves to null for camera, camera_target and camera_path", () => {
  for (const selectedEntity of ["camera", "camera_target", "camera_path"]) {
    const ui = baseUi({ selectedEntity, track: baseTrack({ locked: true }) });
    assert.equal(resolveTransformTarget(ui), null, `${selectedEntity} should be null when locked`);
  }
});

test("an empty camera path resolves to null", () => {
  const ui = baseUi({ selectedEntity: "camera_path", track: baseTrack({ keyframes: [] }) });
  assert.equal(resolveTransformTarget(ui), null);
});

test("camera / camera_target / camera_path are unavailable while looking through the camera view", () => {
  for (const selectedEntity of ["camera", "camera_target", "camera_path"]) {
    const ui = baseUi({ selectedEntity, viewMode: "camera" });
    assert.equal(resolveTransformTarget(ui), null, `${selectedEntity} should be null in camera view`);
  }
});

test("object selection still resolves while looking through the camera view", () => {
  const ui = baseUi({ selectedEntity: "object", viewMode: "camera" });
  assert.ok(resolveTransformTarget(ui));
});

// -- path_point / path_group (plan Task 6) -----------------------------------

test("one selected path key resolves to path_point at its exact position, translate only", () => {
  const ui = baseUi({ selectedEntity: "camera_path" });
  ui.pathSelection = { cameraId: "camera_1", frames: new Set([10]), primaryFrame: 10, component: "position" };
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "path_point");
  assert.equal(target.id, "path_point:camera_1:10");
  assert.deepEqual(target.position, [4, 0, 0]);
  assert.deepEqual(target.allowedModes, ["translate"]);
  assert.equal(target.frame, 10);
  assert.equal(target.track.id, "camera_1");
});

test("multiple selected path keys resolve to path_group centered on their centroid, all modes allowed", () => {
  const ui = baseUi({ selectedEntity: "camera_path" });
  ui.pathSelection = { cameraId: "camera_1", frames: new Set([0, 10]), primaryFrame: 10, component: "position" };
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "path_group");
  assert.equal(target.id, "path_group:camera_1");
  assert.deepEqual(target.position, [2, 0, 0]);
  assert.deepEqual(target.allowedModes, ["translate", "rotate", "scale"]);
  assert.deepEqual(target.frames, [0, 10]);
});

test("an empty path selection falls back to the whole path (unchanged Task 3/4 behavior)", () => {
  const ui = baseUi({ selectedEntity: "camera_path" });
  ui.pathSelection = { cameraId: "camera_1", frames: new Set(), primaryFrame: null, component: "position" };
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "camera_path");
});

test("a path selection belonging to a different camera is ignored, falling back to the whole path", () => {
  const ui = baseUi({ selectedEntity: "camera_path" });
  ui.pathSelection = { cameraId: "some_other_camera", frames: new Set([0]), primaryFrame: 0, component: "position" };
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "camera_path");
});

test("no ui.pathSelection at all (legacy-gizmo fixtures) still resolves the whole path", () => {
  const ui = baseUi({ selectedEntity: "camera_path" });
  delete ui.pathSelection;
  const target = resolveTransformTarget(ui);
  assert.equal(target.type, "camera_path");
});

test("a locked camera track resolves to null for path_point/path_group too", () => {
  const ui = baseUi({ selectedEntity: "camera_path", track: baseTrack({ locked: true }) });
  ui.pathSelection = { cameraId: "camera_1", frames: new Set([0]), primaryFrame: 0, component: "position" };
  assert.equal(resolveTransformTarget(ui), null);
});
