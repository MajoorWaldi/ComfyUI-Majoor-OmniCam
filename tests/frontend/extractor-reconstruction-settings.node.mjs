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

// --- panel <-> widget DOM bridge (audit F01) --------------------------------

import {
  RECON_PANEL_FIELDS,
  hydratePanelFromWidgets,
  syncWidgetsFromPanel,
} from "../../web-src/extractor/reconstruction/settings-sync.js";

function fakeRoot(fields) {
  const els = new Map();
  for (const f of RECON_PANEL_FIELDS) {
    const initial = fields?.[f.role];
    els.set(f.role, f.kind === "boolean"
      ? { checked: Boolean(initial) }
      : { value: initial === undefined ? "" : String(initial) });
  }
  return { querySelector: (sel) => {
    const m = sel.match(/\[data-role="([^"]+)"\]/);
    return m ? els.get(m[1]) || null : null;
  }, _els: els };
}

test("hydratePanelFromWidgets pushes saved widget values into the DOM controls", () => {
  const node = fakeNode({
    recon_mode: "hybrid",
    recon_quality: "high",
    recon_scene_scale: 2.5,
    recon_detect_walls: true,
    recon_blockout_assets: "replace",
    recon_max_objects: 40,
  });
  const root = fakeRoot();
  hydratePanelFromWidgets(node, root);

  assert.equal(root._els.get("reconstruction-mode").value, "hybrid");
  assert.equal(root._els.get("reconstruction-quality").value, "high");
  assert.equal(root._els.get("reconstruction-scene-scale").value, "2.5");
  assert.equal(root._els.get("reconstruction-detect-walls").checked, true);
  assert.equal(root._els.get("reconstruction-blockout-assets").value, "replace");
  assert.equal(root._els.get("reconstruction-max-objects").value, "40");
});

test("syncWidgetsFromPanel writes the DOM back and derives recon_completion_provider", () => {
  const node = fakeNode();
  const root = fakeRoot({
    "reconstruction-mode": "blockout",
    "reconstruction-completion-policy": "all_bounded",
    "reconstruction-max-objects": "32",
    "reconstruction-detect-ground": true,
    "reconstruction-blockout-assets": "proxy",
  });
  const changed = syncWidgetsFromPanel(node, root);
  assert.equal(changed, true);
  assert.equal(widgetValue(node, "recon_mode"), "blockout");
  assert.equal(widgetValue(node, "recon_completion_policy"), "all_bounded");
  assert.equal(widgetValue(node, "recon_max_objects"), 32);
  assert.equal(widgetValue(node, "recon_blockout_assets"), "proxy");
  // a non-off policy selects the real provider
  assert.equal(widgetValue(node, "recon_completion_provider"), "sam3d_objects");

  root._els.get("reconstruction-completion-policy").value = "off";
  syncWidgetsFromPanel(node, root);
  assert.equal(widgetValue(node, "recon_completion_provider"), "none");
});

test("round-trip stabilises: a second hydrate+sync is a no-op", () => {
  const node = fakeNode({
    recon_mode: "scan", recon_quality: "fast", recon_scene_scale: 1.5,
    recon_completion_provider: "none", recon_completion_policy: "off",
  });
  const root = fakeRoot();
  hydratePanelFromWidgets(node, root);
  syncWidgetsFromPanel(node, root); // first pass may set derived widgets
  hydratePanelFromWidgets(node, root);
  assert.equal(syncWidgetsFromPanel(node, root), false, "settled: nothing changes");
});
