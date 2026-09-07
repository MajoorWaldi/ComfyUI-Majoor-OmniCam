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
  "recon_source_texture",
  "recon_detect_ground",
  "recon_detect_walls",
  "recon_scene_scale",
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
