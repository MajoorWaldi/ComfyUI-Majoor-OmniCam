import test from "node:test";
import assert from "node:assert/strict";

import { cameraToSpherical, sphericalToCamera, QUICK_CAMERA_PRESETS } from "../../web-src/quick-camera.js";

test("Quick Camera round-trips spherical coordinates without losing camera fields", () => {
  const camera = { position: [3, 2, 4], target: [1, 0.5, -1], fov: 50, roll: 12, near: 0.1, far: 300, camera_type: "perspective" };
  const spherical = cameraToSpherical(camera);
  const restored = sphericalToCamera(camera, spherical);
  assert.deepEqual(restored.target, camera.target);
  assert.deepEqual(restored.position.map((value) => Number(value.toFixed(8))), camera.position.map((value) => Number(value.toFixed(8))));
  assert.equal(restored.fov, camera.fov);
  assert.equal(restored.roll, camera.roll);
  assert.equal(restored.camera_type, camera.camera_type);
});

test("Quick Camera presets use the Director front/right sign convention", () => {
  const camera = { position: [0, 0, 5], target: [0, 0, 0] };
  const right = sphericalToCamera(camera, { ...cameraToSpherical(camera), ...QUICK_CAMERA_PRESETS.right_profile });
  const back = sphericalToCamera(camera, { ...cameraToSpherical(camera), ...QUICK_CAMERA_PRESETS.back });
  assert.ok(right.position[0] > 0);
  assert.ok(Math.abs(right.position[2]) < 1e-8);
  assert.ok(back.position[2] < 0);
});