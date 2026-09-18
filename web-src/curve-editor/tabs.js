// The lower deck (Director modal audit Lot 3) unifies three views of the
// same keys in one block alongside the camera preview: the always-visible,
// fully-interactive dope sheet (Timeline), the curve canvas (Graph) and the
// sequence lane (Sequence). They share the toolbar, the channel list and the
// selection -- only the stage swaps. Timeline used to have a second, parallel
// per-channel dope render (curve-editor/dope-view.js) that only supported
// click-to-select; it's retired now that the real dope sheet is always the
// Timeline tab's content instead of a separate always-visible block.

import { renderSequenceLane } from "../sequence-lane.js";
import { t } from "../i18n.js";

// Toolbar buttons that only mean something on the curve canvas. Left enabled
// on the dope sheet they would look wired but do nothing visible.
const CURVE_ONLY = ['[data-act="curve-zoom-in"]', '[data-act="curve-zoom-out"]', '[data-act="curve-fit"]', '[data-act="curve-handles"]'];

const TAB_LABELS = { curves: "Graph", dope: "Timeline", sequence: "Sequence" };

export function setGraphTab(ui, tab) {
  const mode = tab in TAB_LABELS ? tab : "dope";
  ui.graphTab = mode;

  for (const button of ui.root.querySelectorAll("[data-graph-tab]")) {
    const active = button.dataset.graphTab === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  const canvas = ui.root.querySelector('[data-role="curve-canvas"]');
  const sheet = ui.root.querySelector('[data-role="dope-stage"]');
  const sequence = ui.root.querySelector('[data-role="graph-sequence"]');
  const legend = ui.root.querySelector('[data-role="curve-legend"]');
  const toolbar = ui.root.querySelector('[data-role="graph-toolbar"]');
  if (canvas) canvas.hidden = mode !== "curves";
  if (sheet) sheet.hidden = mode !== "dope";
  if (sequence) sequence.hidden = mode !== "sequence";
  // The channel-list legend and the curve toolbar only mean something next to
  // the curve canvas; hidden (not just disabled) the rest of the time so
  // Timeline/Sequence get their 150px column and vertical space back (see
  // .oc-graph-legend/.oc-graph-stage's explicit grid-column) instead of
  // rendering a row of disabled buttons nobody can use.
  if (legend) legend.hidden = mode !== "curves";
  if (toolbar) toolbar.hidden = mode !== "curves";
  for (const selector of CURVE_ONLY) {
    const button = ui.root.querySelector(selector);
    if (button) button.disabled = mode !== "curves";
  }

  if (mode === "sequence") {
    renderSequenceLane(ui, sequence);
    // Take focus so shortcuts pressed straight after the switch land in the
    // sequence keymap rather than wherever focus happened to be.
    sequence?.focus?.({ preventScroll: true });
  } else if (mode === "curves") {
    ui.drawCurveEditor();
  }
  // "dope": nothing extra to do -- refreshKeys()/renderDopeRows() already
  // keep the dope sheet current unconditionally, regardless of which tab is
  // the active one.
  ui.setStatus(t(TAB_LABELS[mode]));
}

/** Keep the visible stage current after a state change, whichever tab it is. */
export function refreshGraphTab(ui) {
  if (ui.graphTab === "sequence") {
    renderSequenceLane(ui, ui.root.querySelector('[data-role="graph-sequence"]'));
  }
}

export function bindGraphTabs(ui, signal) {
  const tabsContainer = ui.root.querySelector('[data-role="graph-tabs"]');
  if (tabsContainer) {
    tabsContainer.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        const tabs = [...tabsContainer.querySelectorAll("[data-graph-tab]")];
        const currentIdx = tabs.findIndex((b) => b.classList.contains("active"));
        if (currentIdx >= 0 && tabs.length > 1) {
          const nextIdx = event.key === "ArrowRight"
            ? (currentIdx + 1) % tabs.length
            : (currentIdx - 1 + tabs.length) % tabs.length;
          tabs[nextIdx].focus();
          setGraphTab(ui, tabs[nextIdx].dataset.graphTab);
        }
      }
    }, { signal });
  }

  for (const button of ui.root.querySelectorAll("[data-graph-tab]")) {
    button.addEventListener("click", (event) => {
      // The tabs live inside <summary>; a plain click would toggle the panel.
      event.preventDefault();
      event.stopPropagation();
      setGraphTab(ui, button.dataset.graphTab);
    }, { signal });
  }
}
