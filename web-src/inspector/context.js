// The right-hand Inspector is selection-driven: picking a scene entity shows
// that entity's editor. Motion / Shot / Health are secondary modes reached
// from the compact buttons in the inspector head; picking any entity drops
// back to the "entity" context.
//
// The five panes keep their data-tab-panel names (scene / motion / camera /
// display / health) so the markup contract and every existing binding are
// untouched -- only what drives the switch changed.

import { t } from "../i18n.js";

const MODE_PANEL = { motion: "motion", shot: "display", health: "health" };

const ENTITY_TITLE = {
  object: "Object",
  camera: "Camera",
  camera_target: "Look-At Target",
  camera_path: "Camera Path",
};
const MODE_TITLE = { motion: "Motion", shot: "Shot", health: "Health" };

export const INSPECTOR_MODES = ["entity", "motion", "shot", "health"];

/** Resolve the active context: an explicit secondary mode, else the selection. */
export function inspectorContext(ui) {
  if (ui.inspectorMode && ui.inspectorMode !== "entity") return ui.inspectorMode;
  return "entity";
}

/** data-tab-panel value the current context should display. */
export function inspectorPanelName(ui) {
  const context = inspectorContext(ui);
  if (MODE_PANEL[context]) return MODE_PANEL[context];
  return ui.selectedEntity === "object" ? "scene" : "camera";
}

function selectionKey(ui) {
  return [
    ui.selectedEntity || "",
    ui.selectedObjectId || "",
    ui.selectedKeyFrame ?? "",
    [...(ui.selectedObjectIds || [])].sort().join(","),
  ].join("|");
}

/**
 * Called from refreshInspector(): a changed selection identity drops any
 * secondary mode so picking an entity always shows that entity's editor.
 * Mode-button clicks go through setInspectorMode() and bypass this.
 */
export function syncInspectorSelection(ui) {
  const key = selectionKey(ui);
  if (ui._lastInspectorSelKey !== undefined && ui._lastInspectorSelKey !== key) {
    ui.inspectorMode = "entity";
  }
  ui._lastInspectorSelKey = key;
  applyInspectorContext(ui);
}

/** Route the panes, the motion-mode class and the head to the current context. */
export function applyInspectorContext(ui) {
  const panelName = inspectorPanelName(ui);
  for (const pane of ui.root.querySelectorAll("[data-tab-panel]")) {
    pane.hidden = pane.dataset.tabPanel !== panelName;
  }

  const motionActive = panelName === "motion";
  ui.root.classList.toggle("oc-motion-mode", motionActive);
  if (!motionActive && (ui.state?.motion_tool || "select") !== "select") {
    ui.state.motion_tool = "select";
    ui.motionTrackDraft = null;
  }

  const context = inspectorContext(ui);
  for (const button of ui.root.querySelectorAll("[data-inspector-mode]")) {
    const on = button.dataset.inspectorMode === context;
    button.classList.toggle("active", on);
    button.setAttribute("aria-pressed", String(on));
  }

  const title = ui.root.querySelector('[data-role="inspector-title"]');
  if (title) {
    title.textContent = context === "entity"
      ? t(ENTITY_TITLE[ui.selectedEntity] || "Inspector")
      : t(MODE_TITLE[context] || "Inspector");
  }
}

/** Switch to a secondary mode (or back to "entity") and re-route. */
export function setInspectorMode(ui, mode) {
  ui.inspectorMode = INSPECTOR_MODES.includes(mode) ? mode : "entity";
  applyInspectorContext(ui);
  // The Motion 2D preview and the Shot key editor measure their box on show.
  ui.render?.();
  ui.refitNode?.();
}
