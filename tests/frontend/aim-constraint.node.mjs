import test from "node:test";
import assert from "node:assert/strict";

import { aimBone, applyAimConstraint, bakeAimConstraint, listAimBones, resolveAimPoint } from "../../web-src/aim-constraint.js";
import { sanitizeState } from "../../web-src/director/core.js";

// A rigged model's motion lives in its skeleton, which only the WebGL viewport
// can resolve. `webgl` here stands in for it: sampleModelPoint returns a point
// that depends on the frame, the way a walking character's hip does.
function fakeUi({ bone = null, targetObjectId = "hero", bones = ["Hips", "Head"] } = {}) {
  const state = sanitizeState({
    fps: 24,
    duration_frames: 10,
    objects: [{ id: "hero", type: "model", name: "Hero", position: [0, 0, 0], keyframes: [] }],
    cameras: [{
      id: "camera_1",
      target_object_id: targetObjectId,
      aim_bone: bone,
      keyframes: [
        { frame: 0, camera: { position: [0, 1, 5], target: [0, 0, 0] } },
        { frame: 4, camera: { position: [3, 1, 5], target: [0, 0, 0] } },
      ],
    }],
  });
  const probes = [];
  return {
    state,
    frame: 0,
    activeCameraTrack: () => state.cameras[0],
    webgl: {
      listObjectBones: () => bones,
      sampleModelPoint(objectId, boneName, frame) {
        probes.push({ objectId, boneName, frame });
        // Bone at x = frame, object centre at x = -1, so the two never alias.
        return boneName ? [frame, 2, 0] : [-1, 0, 0];
      },
    },
    probes,
    checkpoint() {}, serialize() {}, render() {},
    refreshKeys() {}, refreshInspector() {}, setStatus() {},
    setFrame(frame) { this.frame = frame; },
    bakeAimToKeyframes() { this.legacyBakeCalled = true; },
  };
}

test("a camera track round-trips its aim bone through sanitizeState", () => {
  const state = sanitizeState({ cameras: [{ id: "c", aim_bone: "Hips" }] });
  assert.equal(state.cameras[0].aim_bone, "Hips");
  assert.equal(state.aim_bone, "Hips", "the active camera mirrors it for the inspector");
  assert.equal(sanitizeState({}).cameras[0].aim_bone, null);
  assert.equal(sanitizeState({ cameras: [{ id: "c", aim_bone: 42 }] }).cameras[0].aim_bone, null);
});

test("bones are only offered for a tracked rigged model", () => {
  assert.deepEqual(listAimBones(fakeUi()), ["Hips", "Head"]);
  assert.deepEqual(listAimBones(fakeUi({ targetObjectId: null })), []);
  const cardUi = fakeUi();
  cardUi.state.objects[0].type = "card";
  assert.deepEqual(listAimBones(cardUi), [], "a card has no rig to aim into");
});

test("the aim point follows the bone across frames", () => {
  const ui = fakeUi({ bone: "Hips" });
  assert.deepEqual(resolveAimPoint(ui, ui.activeCameraTrack(), 0), [0, 2, 0]);
  assert.deepEqual(resolveAimPoint(ui, ui.activeCameraTrack(), 7), [7, 2, 0]);
  assert.deepEqual(ui.probes.at(-1), { objectId: "hero", boneName: "Hips", frame: 7 });
});

test("the target offset shifts the resolved bone point", () => {
  const ui = fakeUi({ bone: "Hips" });
  ui.activeCameraTrack().target_offset = [0, 1, -2];
  assert.deepEqual(resolveAimPoint(ui, ui.activeCameraTrack(), 3), [3, 3, -2]);
});

test("without a bone nothing is overridden, so sampleCamera keeps the last word", () => {
  const ui = fakeUi({ bone: null });
  assert.equal(aimBone(ui, ui.activeCameraTrack()), null);
  assert.equal(resolveAimPoint(ui, ui.activeCameraTrack(), 2), null);
  const camera = { target: [9, 9, 9] };
  applyAimConstraint(ui, ui.activeCameraTrack(), camera, 2);
  assert.deepEqual(camera.target, [9, 9, 9]);
});

test("applyAimConstraint rewrites the target in place when a bone is aimed at", () => {
  const ui = fakeUi({ bone: "Head" });
  const camera = { position: [0, 1, 5], target: [9, 9, 9] };
  assert.equal(applyAimConstraint(ui, ui.activeCameraTrack(), camera, 5), camera);
  assert.deepEqual(camera.target, [5, 2, 0]);
  assert.deepEqual(camera.position, [0, 1, 5], "the aim must not move the camera");
});

test("baking writes the bone target onto the existing keys and leaves the move alone", () => {
  const ui = fakeUi({ bone: "Hips" });
  const positions = ui.activeCameraTrack().keyframes.map((key) => [...key.camera.position]);
  bakeAimConstraint(ui);
  const keys = ui.activeCameraTrack().keyframes;
  assert.equal(keys.length, 2, "a plain bake adds no keys");
  assert.deepEqual(keys.map((key) => key.camera.target), [[0, 2, 0], [4, 2, 0]]);
  assert.deepEqual(keys.map((key) => key.camera.position), positions);
});

test("a per-frame bake fills every frame of the range so an export cannot interpolate the aim", () => {
  const ui = fakeUi({ bone: "Hips" });
  bakeAimConstraint(ui, { perFrame: true });
  const keys = ui.activeCameraTrack().keyframes;
  assert.deepEqual(keys.map((key) => key.frame), [0, 1, 2, 3, 4]);
  for (const key of keys) assert.deepEqual(key.camera.target, [key.frame, 2, 0]);
});

test("baking with no bone falls through to the existing object bake", () => {
  const ui = fakeUi({ bone: null });
  bakeAimConstraint(ui);
  assert.equal(ui.legacyBakeCalled, true);
});
