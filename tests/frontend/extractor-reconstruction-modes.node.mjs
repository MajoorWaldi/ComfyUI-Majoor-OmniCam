import assert from "node:assert/strict";
import test from "node:test";

import { RECONSTRUCTION_STATES } from "../../web-src/extractor/reconstruction/state.js";
import {
  COMPLETION_POLICIES,
  RECON_RESULT_MODES,
  isMultiViewMode,
  keepsDenseReference,
  optionAvailability,
  resolveResultMode,
  usesSegmentation,
} from "../../web-src/extractor/reconstruction/modes.js";
import {
  DEFAULT_BLOCKOUT_LABELS,
  resolveSemanticLabels,
  textToLabels,
} from "../../web-src/extractor/reconstruction/taxonomy.js";

test("frontend RECONSTRUCTION_STATES mirrors the backend semantic + scan stages", () => {
  for (const s of [
    "REGISTER_VIEWS",
    "SEGMENT_SCENE",
    "FUSE_VIEWS",
    "FIT_BLOCKOUT",
    "COMPLETE_OBJECTS",
    "BUILD_REFERENCE",
  ]) {
    assert.ok(RECONSTRUCTION_STATES.includes(s), `${s} missing from RECONSTRUCTION_STATES`);
  }
  // legacy states still present
  for (const s of ["PREPARING", "INFER_GEOMETRY", "BUILD_MESH", "DONE", "FAILED"]) {
    assert.ok(RECONSTRUCTION_STATES.includes(s));
  }
});

test("result modes: legacy aliases resolve, scan is the only multi-view mode", () => {
  assert.equal(resolveResultMode("geometry"), "depth_mesh");
  assert.equal(resolveResultMode("layout"), "depth_mesh");
  assert.equal(resolveResultMode("blockout"), "blockout");
  assert.equal(RECON_RESULT_MODES.length, 4);
  assert.ok(isMultiViewMode("scan"));
  assert.ok(!isMultiViewMode("blockout"));
});

test("segmentation + dense-reference apply to the right modes", () => {
  assert.ok(usesSegmentation("blockout"));
  assert.ok(usesSegmentation("scan"));
  assert.ok(!usesSegmentation("depth_mesh"));
  assert.ok(keepsDenseReference("hybrid"));
  assert.ok(keepsDenseReference("depth_mesh"));
  assert.ok(!keepsDenseReference("blockout"));
});

test("completion policies expose all four choices", () => {
  assert.deepEqual(
    COMPLETION_POLICIES.map((p) => p.id),
    ["off", "low_depth_confidence", "selected", "all_bounded"],
  );
});

test("optionAvailability keeps unsupported providers visible with a reason", () => {
  const caps = { providers: [{ provider_id: "vggt", available: false, reason: "no CUDA GPU" }] };
  const a = optionAvailability(caps, "vggt");
  assert.equal(a.enabled, false);
  assert.match(a.reason, /CUDA/);
  const missing = optionAvailability(caps, "sam3d_objects");
  assert.equal(missing.enabled, false);
});

test("taxonomy: 20 defaults, dedup preserves order, text round-trips", () => {
  assert.equal(DEFAULT_BLOCKOUT_LABELS.length, 20);
  assert.deepEqual(resolveSemanticLabels(["Chair", "chair", " table "]), ["Chair", "table"]);
  assert.deepEqual(resolveSemanticLabels([]), DEFAULT_BLOCKOUT_LABELS);
  assert.deepEqual(textToLabels("chair, table\nsofa"), ["chair", "table", "sofa"]);
});
