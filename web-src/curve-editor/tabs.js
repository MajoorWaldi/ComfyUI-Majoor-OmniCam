// The lower deck has two views of the same keys: the curve canvas and the
// per-component dope sheet. They share the toolbar, the channel list and the
// selection -- only the stage swaps.

import { renderGraphDopeSheet } from "./dope-view.js";
import { t } from "../omnicam-i18n.js";

// Toolbar buttons that only mean something on the curve canvas. Left enabled
// on the dope sheet they would look wired but do nothing visible.
const CURVE_ONLY = ['[data-act="curve-zoom-in"]', '[data-act="curve-zoom-out"]', '[data-act="curve-fit"]', '[data-act="curve-handles"]'];

export function setGraphTab(ui, tab) {
  const mode = tab === "dope" ? "dope" : "curves";
  ui.graphTab = mode;

  for (const button of ui.root.querySelectorAll("[data-graph-tab]")) {
    const active = button.dataset.graphTab === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  const canvas = ui.root.querySelector('[data-role="curve-canvas"]');
  const sheet = ui.root.querySelector('[data-role="graph-dope"]');
  if (canvas) canvas.hidden = mode !== "curves";
  if (sheet) sheet.hidden = mode !== "dope";
  for (const selector of CURVE_ONLY) {
    const button = ui.root.querySelector(selector);
    if (button) button.disabled = mode !== "curves";
  }

  if (mode === "dope") renderGraphDopeSheet(ui);
  else ui.drawCurveEditor();
  ui.setStatus(mode === "dope" ? t("Dope Sheet") : t("Graph Editor"));
}

export function bindGraphTabs(ui, signal) {
  for (const button of ui.root.querySelectorAll("[data-graph-tab]")) {
    button.addEventListener("click", (event) => {
      // The tabs live inside <summary>; a plain click would toggle the panel.
      event.preventDefault();
      event.stopPropagation();
      setGraphTab(ui, button.dataset.graphTab);
    }, { signal });
  }
}
