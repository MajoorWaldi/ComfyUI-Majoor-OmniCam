import assert from "node:assert/strict";
import test from "node:test";

import {
  applyQualityPreset,
  bindReconstructionControls,
  readReconstructionSettings,
} from "../../web-src/extractor/reconstruction/controls.js";

class FakeElement {
  constructor({ tagName = "INPUT", type = "text", value = "", checked = false } = {}) {
    this.tagName = tagName;
    this.type = type;
    this.value = value;
    this.checked = checked;
    this.disabled = false;
    this.handlers = new Map();
  }

  addEventListener(name, handler) { this.handlers.set(name, handler); }
  removeEventListener(name) { this.handlers.delete(name); }
  dispatch(name) { this.handlers.get(name)?.(); }
}

function fakeRoot(elements) {
  return {
    querySelector(selector) {
      const role = selector.match(/data-role="([^"]+)"/)?.[1];
      return elements[role] || null;
    },
  };
}

function makeReconstructionRoot() {
  const elements = {
    "reconstruction-provider": new FakeElement({ tagName: "SELECT", value: "comfy_moge" }),
    "reconstruction-mode": new FakeElement({ tagName: "SELECT", value: "geometry" }),
    "reconstruction-quality": new FakeElement({ tagName: "SELECT", value: "balanced" }),
    "reconstruction-recover-fov": new FakeElement({ type: "checkbox", checked: true }),
    "reconstruction-source-texture": new FakeElement({ type: "checkbox", checked: true }),
    "reconstruction-detect-ground": new FakeElement({ type: "checkbox", checked: true }),
    "reconstruction-detect-walls": new FakeElement({ type: "checkbox", checked: false }),
    "reconstruction-triangle-budget": new FakeElement({ value: "120000" }),
    "reconstruction-edge-threshold": new FakeElement({ value: "0.04" }),
    "reconstruction-scene-scale": new FakeElement({ value: "1.0" }),
    "reconstruction-run": new FakeElement({ tagName: "BUTTON" }),
    "reconstruction-stop": new FakeElement({ tagName: "BUTTON" }),
    "reconstruction-open-director": new FakeElement({ tagName: "BUTTON" }),
  };
  return { root: fakeRoot(elements), elements };
}

test("applyQualityPreset writes the preset's own values and disables the two fields for fast/balanced/high", () => {
  const { root, elements } = makeReconstructionRoot();

  applyQualityPreset(root, "fast");
  assert.equal(elements["reconstruction-triangle-budget"].value, "40000");
  assert.equal(elements["reconstruction-edge-threshold"].value, "0.06");
  assert.equal(elements["reconstruction-triangle-budget"].disabled, true);
  assert.equal(elements["reconstruction-edge-threshold"].disabled, true);

  applyQualityPreset(root, "high");
  assert.equal(elements["reconstruction-triangle-budget"].value, "250000");
  assert.equal(elements["reconstruction-edge-threshold"].value, "0.03");
});

test("applyQualityPreset leaves custom's fields as-is and enabled", () => {
  const { root, elements } = makeReconstructionRoot();
  elements["reconstruction-triangle-budget"].value = "77777";
  elements["reconstruction-edge-threshold"].value = "0.5";

  applyQualityPreset(root, "custom");

  assert.equal(elements["reconstruction-triangle-budget"].value, "77777");
  assert.equal(elements["reconstruction-edge-threshold"].value, "0.5");
  assert.equal(elements["reconstruction-triangle-budget"].disabled, false);
  assert.equal(elements["reconstruction-edge-threshold"].disabled, false);
});

test("bindReconstructionControls syncs the preset immediately and again on every quality change", () => {
  const { root, elements } = makeReconstructionRoot();
  // The DOM's own hardcoded default (120000/0.04) happens to already match
  // "balanced" -- flip it first so the assertion actually proves the initial
  // sync ran, rather than passing by coincidence.
  elements["reconstruction-triangle-budget"].value = "1";
  elements["reconstruction-edge-threshold"].value = "1";

  const changes = [];
  const unbind = bindReconstructionControls(root, {
    onSettingsChange: (settings) => changes.push(settings),
  });

  // Bind-time sync.
  assert.equal(elements["reconstruction-triangle-budget"].value, "120000");
  assert.equal(elements["reconstruction-edge-threshold"].value, "0.04");

  elements["reconstruction-quality"].value = "high";
  elements["reconstruction-quality"].dispatch("change");

  assert.equal(elements["reconstruction-triangle-budget"].value, "250000");
  assert.equal(elements["reconstruction-edge-threshold"].value, "0.03");
  assert.equal(elements["reconstruction-triangle-budget"].disabled, true);

  // onSettingsChange fires with the now-synced values, not the stale ones.
  const last = changes[changes.length - 1];
  assert.equal(last.triangle_budget, 250000);
  assert.equal(last.discontinuity_threshold, 0.03);

  elements["reconstruction-quality"].value = "custom";
  elements["reconstruction-quality"].dispatch("change");
  assert.equal(elements["reconstruction-triangle-budget"].disabled, false);

  unbind();
});

test("readReconstructionSettings reads whatever the (possibly preset-synced) fields currently hold", () => {
  const { root } = makeReconstructionRoot();
  applyQualityPreset(root, "fast");
  const settings = readReconstructionSettings(root);
  assert.equal(settings.triangle_budget, 40000);
  assert.equal(settings.discontinuity_threshold, 0.06);
});


test("readReconstructionSettings aliases legacy modes and stays MoGe-only for depth_mesh", () => {
  const { root } = makeReconstructionRoot();
  root.querySelector('[data-role="reconstruction-mode"]').value = "layout";
  const s = readReconstructionSettings(root);
  assert.equal(s.mode, "depth_mesh");
  assert.equal(s.provider, "comfy_moge");
  assert.equal(s.segmentation_provider, undefined); // no semantic fields on depth mesh
});

test("readReconstructionSettings emits semantic fields for blockout / hybrid / scan", () => {
  const elements = {
    "reconstruction-mode": new FakeElement({ tagName: "SELECT", value: "blockout" }),
    "reconstruction-quality": new FakeElement({ tagName: "SELECT", value: "balanced" }),
    "reconstruction-segmentation": new FakeElement({ tagName: "SELECT", value: "comfy_sam3" }),
    "reconstruction-completion-policy": new FakeElement({ tagName: "SELECT", value: "low_depth_confidence" }),
    "reconstruction-max-objects": new FakeElement({ value: "40" }),
    "reconstruction-semantic-labels": new FakeElement({ value: "chair, table\nsofa" }),
    "reconstruction-blockout-assets": new FakeElement({ tagName: "SELECT", value: "proxy" }),
  };
  const s = readReconstructionSettings(fakeRoot(elements));
  assert.equal(s.mode, "blockout");
  assert.equal(s.segmentation_provider, "comfy_sam3");
  assert.equal(s.completion_policy, "low_depth_confidence");
  // A non-off policy must carry a real provider or the backend resolves nothing.
  assert.equal(s.completion_provider, "sam3d_objects");
  assert.equal(s.max_blockout_objects, 40);
  assert.equal(s.blockout_assets, "proxy");
  assert.deepEqual(s.semantic_labels, ["chair", "table", "sofa"]);
});

test("completion_provider is 'none' when the policy is off; scan forwards the checkpoint as vggt_checkpoint", () => {
  const off = readReconstructionSettings(fakeRoot({
    "reconstruction-mode": new FakeElement({ tagName: "SELECT", value: "blockout" }),
    "reconstruction-completion-policy": new FakeElement({ tagName: "SELECT", value: "off" }),
  }));
  assert.equal(off.completion_provider, "none");

  const scan = readReconstructionSettings(fakeRoot({
    "reconstruction-mode": new FakeElement({ tagName: "SELECT", value: "scan" }),
    "reconstruction-checkpoint": new FakeElement({ value: "VGGT-1B-Commercial" }),
  }));
  assert.equal(scan.vggt_checkpoint, "VGGT-1B-Commercial");
});

test("blockout_assets defaults to 'off' and is omitted for depth_mesh", () => {
  const semantic = readReconstructionSettings(fakeRoot({
    "reconstruction-mode": new FakeElement({ tagName: "SELECT", value: "hybrid" }),
  }));
  assert.equal(semantic.blockout_assets, "off");

  const depthMesh = readReconstructionSettings(fakeRoot({
    "reconstruction-mode": new FakeElement({ tagName: "SELECT", value: "depth_mesh" }),
  }));
  assert.equal(depthMesh.blockout_assets, undefined);
});

test("scan mode defaults its geometry provider to vggt", () => {
  const elements = {
    "reconstruction-mode": new FakeElement({ tagName: "SELECT", value: "scan" }),
    "reconstruction-quality": new FakeElement({ tagName: "SELECT", value: "balanced" }),
  };
  const s = readReconstructionSettings(fakeRoot(elements));
  assert.equal(s.mode, "scan");
  assert.equal(s.provider, "vggt");
});
