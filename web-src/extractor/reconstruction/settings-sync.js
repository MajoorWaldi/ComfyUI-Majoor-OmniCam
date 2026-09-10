// Authoritative reconstruction settings live on the node's ComfyUI widgets, not
// on the DOM panel. This module is the single bridge: the panel reads/writes
// widgets through here, and queued graph execution sees exactly the same values.

// The advanced V3 widgets MajoorOmniCamExtractor.define_schema exposes. Keep in
// sync with omnicam/nodes/extractor.py.
export const RECON_WIDGET_NAMES = [
  "recon_mode",
  "recon_source_mode",
  "recon_geometry_provider",
  "recon_segmentation_provider",
  "recon_completion_provider",
  "recon_quality",
  "recon_sam3_checkpoint",
  "recon_sam3_threshold",
  "recon_semantic_labels",
  "recon_max_objects",
  "recon_vggt_checkpoint",
  "recon_vggt_max_views",
  "recon_vggt_segmentation_views",
  "recon_completion_policy",
  "recon_max_completion_objects",
  "recon_completion_object_ids",
  "recon_blockout_assets",
  "recon_asset_library_path",
  "recon_source_texture",
  "recon_detect_ground",
  "recon_detect_walls",
  "recon_scene_scale",
];

// The subset of widgets that has a matching DOM control in the panel. Each row
// is {widget name, data-role, kind}. This table is the bridge the panel reads
// and writes through, so a queued graph run and a save/reload see exactly what
// the panel shows.
export const RECON_PANEL_FIELDS = [
  { widget: "recon_mode", role: "reconstruction-mode", kind: "string" },
  { widget: "recon_geometry_provider", role: "reconstruction-provider", kind: "string" },
  { widget: "recon_vggt_checkpoint", role: "reconstruction-checkpoint", kind: "string" },
  { widget: "recon_quality", role: "reconstruction-quality", kind: "string" },
  { widget: "recon_segmentation_provider", role: "reconstruction-segmentation", kind: "string" },
  { widget: "recon_completion_policy", role: "reconstruction-completion-policy", kind: "string" },
  { widget: "recon_max_objects", role: "reconstruction-max-objects", kind: "number" },
  { widget: "recon_semantic_labels", role: "reconstruction-semantic-labels", kind: "string" },
  { widget: "recon_blockout_assets", role: "reconstruction-blockout-assets", kind: "string" },
  { widget: "recon_scene_scale", role: "reconstruction-scene-scale", kind: "number" },
  { widget: "recon_source_texture", role: "reconstruction-source-texture", kind: "boolean" },
  { widget: "recon_detect_ground", role: "reconstruction-detect-ground", kind: "boolean" },
  { widget: "recon_detect_walls", role: "reconstruction-detect-walls", kind: "boolean" },
];

export function widgetValue(node, name, fallback) {
  const item = node?.widgets?.find((w) => w.name === name);
  return item ? item.value : fallback;
}

export function setWidgetValue(node, name, value) {
  const item = node?.widgets?.find((w) => w.name === name);
  if (!item || item.value === value) return false;
  item.value = value;
  node.setDirtyCanvas?.(true, true);
  return true;
}

// Build the object the reconstruction panel/state uses from the node widgets.
// Called on constructor and on every workflow reload BEFORE the panel renders,
// so a saved hybrid/high/walls=true workflow comes back exactly as saved.
export function readReconSettingsFromWidgets(node) {
  const labelsRaw = widgetValue(node, "recon_semantic_labels", "");
  return {
    mode: widgetValue(node, "recon_mode", "blockout"),
    sourceMode: widgetValue(node, "recon_source_mode", "auto"),
    geometryProvider: widgetValue(node, "recon_geometry_provider", "comfy_moge"),
    segmentationProvider: widgetValue(node, "recon_segmentation_provider", "comfy_sam3"),
    completionProvider: widgetValue(node, "recon_completion_provider", "none"),
    quality: widgetValue(node, "recon_quality", "balanced"),
    sam3Checkpoint: widgetValue(node, "recon_sam3_checkpoint", "auto"),
    sam3Threshold: Number(widgetValue(node, "recon_sam3_threshold", 0.55)),
    semanticLabels: String(labelsRaw)
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean),
    maxObjects: Number(widgetValue(node, "recon_max_objects", 24)),
    vggtCheckpoint: widgetValue(node, "recon_vggt_checkpoint", "auto"),
    vggtMaxViews: Number(widgetValue(node, "recon_vggt_max_views", 24)),
    vggtSegmentationViews: Number(widgetValue(node, "recon_vggt_segmentation_views", 6)),
    completionPolicy: widgetValue(node, "recon_completion_policy", "off"),
    maxCompletionObjects: Number(widgetValue(node, "recon_max_completion_objects", 4)),
    sourceTexture: Boolean(widgetValue(node, "recon_source_texture", true)),
    detectGround: Boolean(widgetValue(node, "recon_detect_ground", true)),
    detectWalls: Boolean(widgetValue(node, "recon_detect_walls", false)),
    sceneScale: Number(widgetValue(node, "recon_scene_scale", 1.0)),
  };
}

// Mirror a panel edit back onto the widgets. Returns true if anything changed.
export function writeReconSettingsToWidgets(node, s) {
  let changed = false;
  const put = (name, value) => {
    changed = setWidgetValue(node, name, value) || changed;
  };
  put("recon_mode", s.mode);
  put("recon_source_mode", s.sourceMode);
  put("recon_geometry_provider", s.geometryProvider);
  put("recon_segmentation_provider", s.segmentationProvider);
  put("recon_completion_provider", s.completionProvider);
  put("recon_quality", s.quality);
  put("recon_sam3_checkpoint", s.sam3Checkpoint);
  put("recon_sam3_threshold", Number(s.sam3Threshold));
  put("recon_semantic_labels", (s.semanticLabels || []).join(", "));
  put("recon_max_objects", Number(s.maxObjects));
  put("recon_vggt_checkpoint", s.vggtCheckpoint);
  put("recon_vggt_max_views", Number(s.vggtMaxViews));
  put("recon_vggt_segmentation_views", Number(s.vggtSegmentationViews));
  put("recon_completion_policy", s.completionPolicy);
  put("recon_max_completion_objects", Number(s.maxCompletionObjects));
  put("recon_source_texture", Boolean(s.sourceTexture));
  put("recon_detect_ground", Boolean(s.detectGround));
  put("recon_detect_walls", Boolean(s.detectWalls));
  put("recon_scene_scale", Number(s.sceneScale));
  return changed;
}

// --- panel <-> widget DOM bridge (audit F01) --------------------------------

function domControl(root, role) {
  return root?.querySelector?.(`[data-role="${role}"]`) || null;
}

// Push the saved widget values into the panel's DOM controls. Call on mount and
// on every workflow reload, BEFORE reading the panel back, so a saved
// hybrid/high/assets=proxy workflow comes back exactly as saved.
export function hydratePanelFromWidgets(node, root) {
  if (!node || !root) return;
  for (const f of RECON_PANEL_FIELDS) {
    const el = domControl(root, f.role);
    if (!el) continue;
    const value = widgetValue(node, f.widget, undefined);
    if (value === undefined || value === null) continue;
    if (f.kind === "boolean") el.checked = Boolean(value);
    else el.value = String(value);
  }
}

// Mirror the panel's current DOM state onto the node widgets. Returns true if
// anything changed. A non-off completion policy also selects the real provider
// (the backend default is "none", which resolves to nothing).
export function syncWidgetsFromPanel(node, root) {
  if (!node || !root) return false;
  let changed = false;
  for (const f of RECON_PANEL_FIELDS) {
    const el = domControl(root, f.role);
    if (!el) continue;
    if (f.kind === "boolean") {
      changed = setWidgetValue(node, f.widget, Boolean(el.checked)) || changed;
      continue;
    }
    // A <select> whose options have not loaded yet reads value "" -- never
    // write that over a widget's valid schema default, or a queued run fails
    // ComfyUI combo validation (recon_geometry_provider: '' not in [...]).
    const raw = el.value;
    if (raw === "" || raw == null) continue;
    changed = setWidgetValue(node, f.widget, f.kind === "number" ? Number(raw) : raw) || changed;
  }
  const policy = widgetValue(node, "recon_completion_policy", "off");
  changed =
    setWidgetValue(node, "recon_completion_provider", policy === "off" ? "none" : "sam3d_objects") ||
    changed;
  return changed;
}
