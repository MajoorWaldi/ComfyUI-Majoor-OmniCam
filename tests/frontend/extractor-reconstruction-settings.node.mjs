import assert from "node:assert/strict";
import test from "node:test";

import {
  RECON_WIDGET_NAMES,
  readReconSettingsFromWidgets,
  setWidgetValue,
  widgetValue,
  writeReconSettingsToWidgets,
} from "../../web-src/extractor/reconstruction/settings-sync.js";

function fakeNode(values = {}) {
  const widgets = RECON_WIDGET_NAMES.map((name) => ({
    name,
    value: name in values ? values[name] : defaultFor(name),
  }));
  return { widgets, setDirtyCanvas() {} };
}

function defaultFor(name) {
  if (name === "recon_mode") return "blockout";
  if (name === "recon_detect_walls") return false;
  if (name === "recon_detect_ground" || name === "recon_source_texture") return true;
  if (name === "recon_sam3_threshold") return 0.55;
  if (name === "recon_scene_scale") return 1.0;
  if (name === "recon_max_objects") return 24;
  if (name === "recon_semantic_labels") return "";
  return "auto";
}

test("widgetValue / setWidgetValue read and write node widgets, only on change", () => {
  const node = fakeNode();
  assert.equal(widgetValue(node, "recon_mode", "x"), "blockout");
  assert.equal(setWidgetValue(node, "recon_mode", "blockout"), false); // unchanged
  assert.equal(setWidgetValue(node, "recon_mode", "hybrid"), true);
  assert.equal(widgetValue(node, "recon_mode"), "hybrid");
});

test("round-trip: widgets -> settings -> widgets is stable (hybrid/high/walls=true survives)", () => {
  const node = fakeNode({
    recon_mode: "hybrid",
    recon_quality: "high",
    recon_detect_walls: true,
    recon_semantic_labels: "chair, table",
    recon_vggt_max_views: 16,
  });
  const s = readReconSettingsFromWidgets(node);
  assert.equal(s.mode, "hybrid");
  assert.equal(s.quality, "high");
  assert.equal(s.detectWalls, true);
  assert.deepEqual(s.semanticLabels, ["chair", "table"]);
  assert.equal(s.vggtMaxViews, 16);

  const fresh = fakeNode();
  writeReconSettingsToWidgets(fresh, s);
  const s2 = readReconSettingsFromWidgets(fresh);
  assert.deepEqual(s2, s);
});

test("every advanced widget name is covered by the sync bridge", () => {
  const node = fakeNode();
  const s = readReconSettingsFromWidgets(node);
  // A representative field from each group is present.
  for (const key of [
    "mode",
    "sourceMode",
    "segmentationProvider",
    "completionProvider",
    "sam3Threshold",
    "vggtSegmentationViews",
    "completionPolicy",
    "detectGround",
    "sceneScale",
  ]) {
    assert.ok(key in s, `missing ${key}`);
  }
});
