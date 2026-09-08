import test from "node:test";
import assert from "node:assert/strict";

import { createSceneMethods } from "../../web-src/director/methods/scene.js";
import { sampleCamera, sanitizeState } from "../../web-src/director/core.js";

// setCameraTrackingTarget() is a live constraint toggle. Enabling and then
// clearing it must leave every authored key.camera.target byte-for-byte intact,
// so a drawn Follow Path camera recovers its exact tangent aim when Look At is
// removed.
function fixture() {
  const state = sanitizeState({
    fps: 24,
    duration_frames: 121,
    objects: [{ id: "hero", type: "null", name: "Hero", position: [7, 3, -2], keyframes: [] }],
    cameras: [{
      id: "camera_1",
      name: "Drawn Camera 1",
      target_object_id: null,
      target_offset: [0, 0, 0],
      keyframes: [
        { frame: 24, camera: { position: [0, 2, 0], target: [0, 2, -4], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
        { frame: 60, camera: { position: [5, 2, -3], target: [7, 2, -9], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
        { frame: 96, camera: { position: [9, 2, -8], target: [12, 2, -13], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
      ],
    }],
  });
  state.active_camera_id = "camera_1";
  const ui = {
    state,
    frame: 48,
    camera: sampleCamera(state.cameras[0], 48, state.objects),
    activeCameraTrack: () => state.cameras.find((c) => c.id === state.active_camera_id),
    checkpoint() {}, serialize() {}, refreshInspector() {}, render() {}, setStatus() {},
  };
  const methods = createSceneMethods({ sampleCamera });
  return { ui, methods };
}

test("enabling then clearing Look At leaves every authored key target untouched", () => {
  const { ui, methods } = fixture();
  const track = ui.state.cameras[0];
  const authored = JSON.stringify(track.keyframes.map((key) => key.camera.target));

  methods.setCameraTrackingTarget.call(ui, "hero");
  assert.equal(track.target_object_id, "hero");
  assert.equal(
    JSON.stringify(track.keyframes.map((key) => key.camera.target)),
    authored,
    "the constraint must not bake its resolved target into the keys",
  );

  methods.setCameraTrackingTarget.call(ui, null);
  assert.equal(track.target_object_id, null);
  assert.equal(
    JSON.stringify(track.keyframes.map((key) => key.camera.target)),
    authored,
    "clearing Look At reveals exactly the original Follow Path targets",
  );
});
