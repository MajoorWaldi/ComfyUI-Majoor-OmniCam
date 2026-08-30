// The lower deck has two views of the same keys: the curve canvas and the
// per-component dope sheet. They share the toolbar, the channel list and the
// selection -- only the stage swaps.

import { renderGraphDopeSheet } from "./dope-view.js";
import { renderSequenceLane } from "../sequence-lane.js";
import { t } from "../i18n.js";

// Toolbar buttons that only mean something on the curve canvas. Left enabled
// on the dope sheet they would look wired but do nothing visible.
const CURVE_ONLY = ['[data-act="curve-zoom-in"]', '[data-act="curve-zoom-out"]', '[data-act="curve-fit"]', '[data-act="curve-handles"]'];

const TAB_LABELS = { curves: "Graph Editor", dope: "Dope Sheet", sequence: "Sequence" };

export function setGraphTab(ui, tab) {
  const mode = tab in TAB_LABELS ? tab : "curves";
  ui.graphTab = mode;

  for (const button of ui.root.querySelectorAll("[data-graph-tab]")) {
    const active = button.dataset.graphTab === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  const canvas = ui.root.querySelector('[data-role="curve-canvas"]');
  const sheet = ui.root.querySelector('[data-role="graph-dope"]');
  const sequence = ui.root.querySelector('[data-role="graph-sequence"]');
  if (canvas) canvas.hidden = mode !== "curves";
  if (sheet) sheet.hidden = mode !== "dope";
  if (sequence) sequence.hidden = mode !== "sequence";
  for (const selector of CURVE_ONLY) {
    const button = ui.root.querySelector(selector);
    if (button) button.disabled = mode !== "curves";
  }

  if (mode === "dope") renderGraphDopeSheet(ui);
  else if (mode === "sequence") {
    renderSequenceLane(ui, sequence);
    // Take focus so shortcuts pressed straight after the switch land in the
    // sequence keymap rather than wherever focus happened to be.
    sequence?.focus?.({ preventScroll: true });
  } else ui.drawCurveEditor();
  ui.setStatus(t(TAB_LABELS[mode]));
}

/** Keep the visible stage current after a state change, whichever tab it is. */
export function refreshGraphTab(ui) {
  if (ui.graphTab === "sequence") {
    renderSequenceLane(ui, ui.root.querySelector('[data-role="graph-sequence"]'));
  }
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
