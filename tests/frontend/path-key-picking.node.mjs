// A camera-path marker has a fixed world-space radius, so a plain geometric
// raycast against it shrinks to a few screen pixels (or less) once the
// camera is far away or the view is zoomed out -- unlike the transform
// gizmo and every other viewport handle, which pick with a fixed pixel
// radius regardless of distance. pickPathKey must fall back the same way.

import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createCameraPickingMethods } from "../../web-src/viewport/camera-picking.js";

globalThis.window ??= { devicePixelRatio: 1 };

function fixture() {
  const canvas = { width: 800, height: 600 };
  const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 0.01, 1000);
  camera.position.set(0, 0, 50); // far enough that a 0.1-radius marker is a couple of pixels on screen
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);

  const path = new THREE.Group();
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6));
  marker.position.set(0, 0, 0);
  marker.userData.omnicamPathKey = { cameraId: "cam_1", frame: 5 };
  path.add(marker);
  path.visible = true;

  const methods = createCameraPickingMethods({ THREE });
  return {
    ...methods,
    path,
    canvas,
    activeCamera: camera,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
  };
}

test("a marker too small on screen to hit geometrically is still picked within a pixel radius", () => {
  const ctx = fixture();
  // Project the marker to find its exact screen centre, then click a few
  // pixels off -- inside the fixed-radius fallback, but almost certainly
  // outside the sphere's own tiny screen footprint at this distance.
  const projected = new THREE.Vector3(0, 0, 0).project(ctx.activeCamera);
  const centerX = (projected.x * 0.5 + 0.5) * ctx.canvas.width;
  const centerY = (1 - (projected.y * 0.5 + 0.5)) * ctx.canvas.height;
  const result = ctx.pickPathKey([centerX + 10, centerY + 6]);
  assert.ok(result, "a near-miss click must still pick the marker");
  assert.equal(result.cameraId, "cam_1");
  assert.equal(result.frame, 5);
  assert.deepEqual(result.position, [0, 0, 0]);
});

test("a click well outside the pixel radius does not pick the marker", () => {
  const ctx = fixture();
  const projected = new THREE.Vector3(0, 0, 0).project(ctx.activeCamera);
  const centerX = (projected.x * 0.5 + 0.5) * ctx.canvas.width;
  const centerY = (1 - (projected.y * 0.5 + 0.5)) * ctx.canvas.height;
  assert.equal(ctx.pickPathKey([centerX + 200, centerY + 200]), null);
});

test("an exact hit on the marker geometry is still picked (raycast path unaffected)", () => {
  const ctx = fixture();
  const projected = new THREE.Vector3(0, 0, 0).project(ctx.activeCamera);
  const centerX = (projected.x * 0.5 + 0.5) * ctx.canvas.width;
  const centerY = (1 - (projected.y * 0.5 + 0.5)) * ctx.canvas.height;
  const result = ctx.pickPathKey([centerX, centerY]);
  assert.ok(result);
  assert.equal(result.frame, 5);
});

test("an invisible path never picks, even within the pixel radius", () => {
  const ctx = fixture();
  ctx.path.visible = false;
  const projected = new THREE.Vector3(0, 0, 0).project(ctx.activeCamera);
  const centerX = (projected.x * 0.5 + 0.5) * ctx.canvas.width;
  const centerY = (1 - (projected.y * 0.5 + 0.5)) * ctx.canvas.height;
  assert.equal(ctx.pickPathKey([centerX, centerY]), null);
});
