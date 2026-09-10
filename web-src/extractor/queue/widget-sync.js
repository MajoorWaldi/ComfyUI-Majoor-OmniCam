// Make the real MajoorOmniCamExtractor node widgets the single settings source
// a queued execute() reads.
//
// The OmniCam panel owns exactly two things:
//   1. the extract mode (camera_track / scene_reconstruct);
//   2. the camera-track cleanup-desk controls (smoothing, tolerances, ...).
//
// Everything else a queued run reads -- method, lens_mode, fov_degrees,
// focal_length_mm, sensor_width_mm, max_dimension, frame_step -- has no panel
// control and is left exactly as the user set it on the node. In reconstruct
// mode the recon_* widgets are driven from the reconstruction panel's own DOM
// bridge (reconstruction/settings-sync.js), which is already the single source
// for those.
//
// Keep CAMERA_TRACK_REFINE_WIDGETS in sync with the cleanup inputs of
// MajoorOmniCamExtractor.define_schema in omnicam/nodes/extractor.py.

import { syncWidgetsFromPanel } from "../reconstruction/settings-sync.js";

/** Cleanup-desk widgets the camera-track panel is authoritative for. */
export const CAMERA_TRACK_REFINE_WIDGETS = [
  "normalize_origin",
  "motion_scale",
  "position_smoothing",
  "rotation_smoothing",
  "simplify_keys",
  "position_tolerance",
  "rotation_tolerance_deg",
];

function widget(node, name) {
  return node?.widgets?.find((item) => item.name === name) || null;
}

/** Write one widget, marking the canvas dirty only when the value moved. */
export function setWidget(node, name, value) {
  const item = widget(node, name);
  if (!item || item.value === value) return false;
  item.value = value;
  node?.setDirtyCanvas?.(true, true);
  return true;
}

/**
 * Push the panel's owned settings onto the node widgets.
 *
 * @param {object} args
 * @param {object} args.node - the Extractor LiteGraph node.
 * @param {object} [args.root] - the panel root element (reconstruct mode only).
 * @param {"camera_track" | "scene_reconstruct"} args.mode
 * @param {object} [args.refineSettings] - RefineController.settings.
 * @returns {boolean} true when at least one widget value changed.
 */
export function syncExtractorPanelToWidgets({ node, root, mode, refineSettings }) {
  let changed = setWidget(node, "extract_mode", mode);

  if (mode === "scene_reconstruct") {
    return syncWidgetsFromPanel(node, root) || changed;
  }

  for (const name of CAMERA_TRACK_REFINE_WIDGETS) {
    if (refineSettings?.[name] === undefined) continue;
    changed = setWidget(node, name, refineSettings[name]) || changed;
  }
  return changed;
}
