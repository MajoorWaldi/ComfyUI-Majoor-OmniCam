// SceneOverlay: the Extractor's read-only 3D preview of a reconstructed
// MotionScene. Geometry is asserted numerically -- a box in the wrong place
// would send someone chasing a reconstruction bug that isn't there.

import assert from "node:assert/strict";
import test from "node:test";

import { SceneOverlay } from "../../web-src/viewer/scene-overlay.js";
import { TrackScene } from "../../web-src/viewer/track-scene.js";

function scene(objects, extra = {}) {
  return { version: 1, canvas: { width: 1280, height: 720 }, objects, cameras: [], ...extra };
}

test("primitives are placed at their MotionScene transform, degrees -> radians", () => {
  const overlay = new SceneOverlay();
  overlay.setScene(scene([
    {
      id: "chair_1", type: "cube",
      position: [1, 0.5, -3], rotation: [0, 90, 0], size: [0.6, 1, 0.6],
      reconstruction: { role: "blockout_object" },
    },
  ]));

  const meshes = overlay.group.children.filter((c) => c.isMesh);
  assert.equal(meshes.length, 2, "wireframe + faint fill");
  const wire = meshes[0];
  assert.deepEqual([wire.position.x, wire.position.y, wire.position.z], [1, 0.5, -3]);
  assert.ok(Math.abs(wire.rotation.y - Math.PI / 2) < 1e-9, "90deg yaw");
  assert.equal(wire.material.wireframe, true);
});

test("disabled objects and nulls are skipped; role picks the colour", () => {
  const overlay = new SceneOverlay();
  overlay.setScene(scene([
    { id: "root", type: "null", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1] },
    { id: "hidden", type: "cube", enabled: false, position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1] },
    { id: "room", type: "ground", position: [0, 0, 0], rotation: [0, 0, 0], size: [6, 0.1, 6],
      reconstruction: { role: "room" } },
  ]));
  const wire = overlay.group.children.find((c) => c.isMesh && c.material.wireframe);
  assert.ok(wire, "only the room slab was drawn");
  assert.equal(wire.material.color.getHex(), 0x5b6472, "room colour");
});

test("GLB props are requested with the resolved URL and are non-fatal on failure", () => {
  const overlay = new SceneOverlay();
  const requested = [];
  overlay.loader().load = (url) => requested.push(url); // never resolves -> stays a box-less no-op
  overlay.setScene(
    scene([
      { id: "sofa_1_asset", type: "glb", asset: "majoor_omnicam/blockout_library/interior/sofa.glb [input]",
        position: [0, 0, 0], rotation: [0, 0, 0], size: [2, 0.8, 0.9],
        reconstruction: { role: "asset_proxy" } },
    ]),
    { resolveAssetUrl: (ref) => `/view?f=${encodeURIComponent(ref)}` },
  );
  assert.equal(requested.length, 1);
  assert.match(requested[0], /^\/view\?f=/);
  assert.equal(overlay.hasContent, false, "no synchronous content yet; the prop streams in");
});

test("the source camera becomes a frustum", () => {
  const overlay = new SceneOverlay();
  overlay.setScene(scene(
    [{ id: "c", type: "cube", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1] }],
    { cameras: [{ id: "camera_1", track: { keyframes: [{ frame: 0, camera: { position: [0, 1.6, 4], target: [0, 1, 0], fov: 50 } }] } }] },
  ));
  const lines = overlay.group.children.filter((c) => c.isLineSegments || c.type === "LineSegments");
  assert.ok(lines.length >= 1, "a frustum LineSegments was added for the source camera");
});

test("TrackScene.setReconstructedScene widens the fit bounds", () => {
  const ts = new TrackScene();
  const before = ts.bounds().extent;
  ts.setReconstructedScene(scene([
    { id: "far", type: "cube", position: [20, 0, 20], rotation: [0, 0, 0], size: [2, 2, 2],
      reconstruction: { role: "blockout_object" } },
  ]));
  assert.equal(ts.hasReconstructedScene(), true);
  assert.ok(ts.bounds().extent > before, "bounds grew to include the reconstructed box");
  ts.dispose();
});
