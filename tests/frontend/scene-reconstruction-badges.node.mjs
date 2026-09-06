import assert from "node:assert/strict";
import test from "node:test";

import {
  reconstructionBadge,
  getReconstructionAppearance,
  setReconstructionAppearance,
  toggleObjectLock,
} from "../../web-src/scene/reconstruction-badges.js";

test("reconstructionBadge returns null for non-reconstructed objects", () => {
  assert.equal(reconstructionBadge(null), null);
  assert.equal(reconstructionBadge({ id: "cube_1", type: "cube" }), null);
  assert.equal(reconstructionBadge({ id: "model_1", type: "model" }), null);
});

test("reconstructionBadge returns correct label/band/title across confidence ranges", () => {
  // High confidence (>= 0.80)
  const highObj = {
    id: "mesh_high",
    type: "glb",
    reconstruction: { provider: "comfy_moge", confidence: 0.92 },
  };
  const highBadge = reconstructionBadge(highObj);
  assert.ok(highBadge);
  assert.equal(highBadge.band, "high");
  assert.equal(highBadge.label, "High");
  assert.ok(highBadge.title.includes("comfy_moge"));
  assert.ok(highBadge.title.includes("92%"));

  // Medium confidence (>= 0.60, < 0.80)
  const medObj = {
    id: "mesh_med",
    type: "glb",
    reconstruction: { provider: "comfy_moge", confidence: 0.74 },
  };
  const medBadge = reconstructionBadge(medObj);
  assert.ok(medBadge);
  assert.equal(medBadge.band, "medium");
  assert.equal(medBadge.label, "Medium");
  assert.ok(medBadge.title.includes("74%"));

  // Low confidence (< 0.60)
  const lowObj = {
    id: "mesh_low",
    type: "glb",
    reconstruction: { provider: "comfy_moge", confidence: 0.35 },
  };
  const lowBadge = reconstructionBadge(lowObj);
  assert.ok(lowBadge);
  assert.equal(lowBadge.band, "low");
  assert.equal(lowBadge.label, "Low");
  assert.ok(lowBadge.title.includes("35%"));
});

test("reconstructionBadge never mutates geometry color, transform or properties", () => {
  const obj = Object.freeze({
    id: "mesh_frozen",
    type: "glb",
    position: Object.freeze([1, 2, 3]),
    rotation: Object.freeze([0, 45, 0]),
    size: Object.freeze([2, 2, 2]),
    color: "#ff0000",
    reconstruction: Object.freeze({ provider: "comfy_moge", confidence: 0.88 }),
  });

  // Must not throw even if frozen!
  const badge = reconstructionBadge(obj);
  assert.ok(badge);
  assert.deepEqual(obj.position, [1, 2, 3]);
  assert.deepEqual(obj.rotation, [0, 45, 0]);
  assert.deepEqual(obj.size, [2, 2, 2]);
  assert.equal(obj.color, "#ff0000");
});

test("lock toggle flips object.locked and allows normal editing when unlocked", () => {
  const obj = {
    id: "recon_1",
    type: "glb",
    locked: true,
    position: [0, 0, 0],
  };
  const mockUi = {
    checkpoints: [],
    checkpoint(msg) { this.checkpoints.push(msg); },
    serialize() { this.serialized = true; },
    refreshObjects() { this.refreshed = true; },
    render() { this.rendered = true; },
  };

  // Toggle from locked to unlocked
  toggleObjectLock(mockUi, obj);
  assert.equal(obj.locked, false);
  assert.equal(mockUi.serialized, true);

  // When unlocked, object position can be edited like a normal object
  obj.position[0] = 5.0;
  assert.equal(obj.position[0], 5.0);

  // Toggle back to locked
  toggleObjectLock(mockUi, obj);
  assert.equal(obj.locked, true);
});

test("Reconstruction Appearance control defaults to Neutral and supports Source Texture", () => {
  const emptyState = {};
  assert.equal(getReconstructionAppearance(emptyState), "neutral");

  const mockUi = {
    state: {},
    rendered: false,
    render() { this.rendered = true; },
    serialize() { this.serialized = true; },
  };

  setReconstructionAppearance(mockUi, "source_texture");
  assert.equal(mockUi.state.reconstruction_appearance, "source_texture");
  assert.equal(getReconstructionAppearance(mockUi.state), "source_texture");
  assert.equal(mockUi.rendered, true);

  setReconstructionAppearance(mockUi, "neutral");
  assert.equal(mockUi.state.reconstruction_appearance, "neutral");
  assert.equal(getReconstructionAppearance(mockUi.state), "neutral");
});
