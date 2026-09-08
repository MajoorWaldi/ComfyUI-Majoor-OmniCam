// pickCurveHandle mirrors pickPathKey: a small fixed-radius knob must be
// pickable both by an exact raycast and, at distance, by a fixed pixel radius.

import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createCameraPickingMethods } from "../../web-src/viewport/camera-picking.js";

globalThis.window ??= { devicePixelRatio: 1 };

function fixture() {
  const canvas = { width: 800, height: 600 };
  const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 0.01, 1000);
  camera.position.set(0, 0, 50);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);

  const path = new THREE.Group();
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6));
  knob.position.set(0, 0, 0);
  knob.userData.omnicamCurveHandle = { cameraId: "cam_1", frame: 12, side: "out" };
  path.add(knob);
  path.visible = true;

  return {
    ...createCameraPickingMethods({ THREE }),
    path,
    canvas,
    activeCamera: camera,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
  };
}

function screenCentre(ctx) {
  const projected = new THREE.Vector3(0, 0, 0).project(ctx.activeCamera);
  return [
    (projected.x * 0.5 + 0.5) * ctx.canvas.width,
    (1 - (projected.y * 0.5 + 0.5)) * ctx.canvas.height,
  ];
}

test("an exact click on the knob geometry returns its identity", () => {
  const ctx = fixture();
  const [x, y] = screenCentre(ctx);
  const result = ctx.pickCurveHandle([x, y]);
  assert.ok(result);
  assert.equal(result.cameraId, "cam_1");
  assert.equal(result.frame, 12);
  assert.equal(result.side, "out");
  assert.deepEqual(result.position, [0, 0, 0]);
});

test("a near-miss within the pixel radius still picks the knob", () => {
  const ctx = fixture();
  const [x, y] = screenCentre(ctx);
  const result = ctx.pickCurveHandle([x + 8, y + 5]);
  assert.ok(result, "near-miss must still resolve");
  assert.equal(result.side, "out");
});

test("a click far from the knob picks nothing", () => {
  const ctx = fixture();
  const [x, y] = screenCentre(ctx);
  assert.equal(ctx.pickCurveHandle([x + 200, y + 200]), null);
});

test("an invisible path never picks a handle", () => {
  const ctx = fixture();
  ctx.path.visible = false;
  const [x, y] = screenCentre(ctx);
  assert.equal(ctx.pickCurveHandle([x, y]), null);
});
