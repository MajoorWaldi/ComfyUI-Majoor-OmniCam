import assert from "node:assert/strict";
import test from "node:test";

import {
  adoptReconstructedScene,
  uniqueSceneId,
  isDirectorEmpty,
} from "../../web-src/extractor/reconstruction/director-adopt.js";
import { restoreAssets } from "../../web-src/dom-media.js";

function createMockDirector({ objects = [], cameras = [{ id: "camera_1", name: "Camera 1", keyframes: [] }] } = {}) {
  return {
    state: {
      version: 1,
      timeline: { duration_seconds: 5.0, authoring_fps: 24.0 },
      canvas: { width: 1280, height: 720 },
      cameras: [...cameras],
      active_camera_id: cameras[0]?.id || "camera_1",
      objects: [...objects],
      metadata: {},
    },
    modelUrlsById: new Map(),
    cardMediaById: new Map(),
    checkpoints: [],
    checkpoint(msg) { this.checkpoints.push(msg); },
    serialize() { this.serialized = true; },
    refreshObjects() { this.refreshedObjects = true; },
    render() { this.rendered = true; },
    setStatus(msg) { this.status = msg; },
  };
}

test("adoptReconstructedScene rejects result with no objects array", () => {
  const director = createMockDirector();
  assert.throws(
    () => adoptReconstructedScene(director, { motion_scene: {} }),
    /objects/i
  );
  assert.throws(
    () => adoptReconstructedScene(director, {}),
    /objects/i
  );
});

test("isDirectorEmpty detects fresh/empty Director state", () => {
  const emptyDirector = createMockDirector({ objects: [] });
  assert.equal(isDirectorEmpty(emptyDirector), true);

  const directorWithObjects = createMockDirector({
    objects: [{ id: "cube_1", type: "cube" }],
  });
  assert.equal(isDirectorEmpty(directorWithObjects), false);
});

test("adoptReconstructedScene uses replace_scene when Director is empty", () => {
  const director = createMockDirector({ objects: [] });
  const reconScene = {
    version: 1,
    timeline: { duration_seconds: 4.0, authoring_fps: 24.0 },
    canvas: { width: 1920, height: 1080 },
    cameras: [{ id: "recon_cam", name: "Source Camera", keyframes: [] }],
    active_camera_id: "recon_cam",
    objects: [
      {
        id: "env_mesh",
        type: "glb",
        name: "Environment",
        asset: "majoor_omnicam/reconstruction/abc/environment.glb [input]",
        locked: true,
      },
    ],
  };

  adoptReconstructedScene(director, { motion_scene: reconScene });

  assert.equal(director.state.objects.length, 1);
  assert.equal(director.state.objects[0].id, "env_mesh");
  assert.equal(director.state.objects[0].locked, true);
  assert.ok(director.modelUrlsById.has("env_mesh"));
  assert.equal(director.serialized, true);
  assert.equal(director.rendered, true);
});

test("adoptReconstructedScene uses merge_environment when Director has existing content", () => {
  const existingObj = { id: "hero_char", type: "model", name: "Hero", keyframes: [{ frame: 0 }] };
  const existingCam = { id: "main_cam", name: "Main Cam", keyframes: [{ frame: 0 }, { frame: 24 }] };
  const director = createMockDirector({
    objects: [existingObj],
    cameras: [existingCam],
  });

  const reconScene = {
    version: 1,
    cameras: [
      { id: "recon_cam", name: "Recon Source Cam", keyframes: [{ frame: 0 }] },
    ],
    objects: [
      {
        id: "hero_char", // Colliding ID!
        type: "glb",
        name: "Recon Mesh",
        asset: "majoor_omnicam/reconstruction/xyz/environment.glb [input]",
        locked: true,
      },
      {
        id: "ground_plane",
        type: "ground",
        name: "Ground",
        locked: true,
      },
    ],
  };

  adoptReconstructedScene(director, { motion_scene: reconScene }, { mode: "merge" });

  // Keeps existing camera as active, adds source camera as disabled
  assert.equal(director.state.active_camera_id, "main_cam");
  assert.equal(director.state.cameras.length, 2);
  const adoptedCam = director.state.cameras.find((c) => c.id !== "main_cam");
  assert.ok(adoptedCam);
  assert.equal(adoptedCam.enabled, false, "Source camera added as disabled secondary camera on merge");

  // Keeps existing object and adds reconstructed objects with collision-safe id
  assert.equal(director.state.objects.length, 3);
  assert.equal(director.state.objects[0].id, "hero_char"); // Original preserved

  const adoptedMesh = director.state.objects.find((o) => o.type === "glb");
  assert.ok(adoptedMesh);
  assert.notEqual(adoptedMesh.id, "hero_char", "Collision-safe ID assigned");
  assert.ok(director.modelUrlsById.has(adoptedMesh.id));
});

test("reconstructed GLB asset survives workflow reload via restoreAssets", () => {
  const director = createMockDirector({
    objects: [
      {
        id: "recon_env_1",
        type: "glb",
        asset: "majoor_omnicam/reconstruction/abc/environment.glb [input]",
        locked: true,
      },
    ],
  });

  assert.equal(director.modelUrlsById.has("recon_env_1"), false);
  restoreAssets(director);
  assert.equal(director.modelUrlsById.has("recon_env_1"), true);
  const url = director.modelUrlsById.get("recon_env_1");
  assert.ok(url.includes("environment.glb"));
  assert.ok(url.includes("type=input"));
});

test("uniqueSceneId resolves collisions deterministically", () => {
  const existing = new Set(["cube_1", "cube_1_2"]);
  assert.equal(uniqueSceneId(existing, "camera_1"), "camera_1");
  assert.equal(uniqueSceneId(existing, "cube_1"), "cube_1_3");
});
