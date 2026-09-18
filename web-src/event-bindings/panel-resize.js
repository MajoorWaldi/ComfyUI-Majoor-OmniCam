// Drag handles for the two user-resizable regions of the Director:
//   - the Outliner object list (vertical: a taller list shows more objects),
//   - the lower-deck camera-preview column (horizontal: a wider column enlarges
//     the camera views, trading width with the timeline).
//
// The chosen sizes live in ui.state (outliner_height / preview_width, clamped
// in sanitizeState) so a saved workflow reopens with the same layout. They are
// applied as CSS custom properties on ui.root -- here during a drag, and by
// applyPanelLayout() on load / widget sync.

import { PANEL_LAYOUT, clamp } from "../director/core.js";
import { maxSideColumnWidth, maxVerticalPanelHeight } from "../director/panel-constraints.js";
import { t } from "../i18n.js";

const HANDLES = {
  "outliner-resize": { axis: "y", direction: 1, stateKey: "outliner_height", bounds: PANEL_LAYOUT.outlinerHeight, cssVar: "--oc-outliner-h", panelSelector: ".scene-tree" },
  "preview-resize": { axis: "x", direction: 1, stateKey: "preview_width", bounds: PANEL_LAYOUT.previewWidth, cssVar: "--oc-preview-w" },
  "side-resize": { axis: "x", direction: -1, stateKey: "side_width", bounds: PANEL_LAYOUT.sideWidth, cssVar: "--oc-side-w", neighborStateKey: "left_width" },
  "left-resize": { axis: "x", direction: 1, stateKey: "left_width", bounds: PANEL_LAYOUT.leftWidth, cssVar: "--oc-left-w", neighborStateKey: "side_width" },
  "graph-resize": { axis: "y", direction: 1, stateKey: "graph_height", bounds: PANEL_LAYOUT.graphHeight, cssVar: "--oc-graph-h" },
  "assets-resize": { axis: "y", direction: 1, stateKey: "assets_height", bounds: PANEL_LAYOUT.assetsHeight, cssVar: "--oc-assets-h", panelSelector: ".oc-asset-grid" },
  "agent-resize": { axis: "y", direction: 1, stateKey: "agent_height", bounds: PANEL_LAYOUT.agentHeight, cssVar: "--oc-agent-h", panelSelector: ".oc-agent-plan-list" },
};

/**
 * The effective max for one handle right now, given the live DOM -- not just
 * its own static PANEL_LAYOUT bound. Shared between applyPanelLayout() (so a
 * saved/default size that no longer fits is corrected on load, not only
 * after a fresh drag) and the live drag handlers in bindPanelResize() below.
 *
 * Director modal audit Lot 4 follow-up: a vertical panel (Outliner list,
 * Assets grid, Agent plan list) living inside a scrolling .oc-left-body must
 * never grow past what that body can show without scrolling, or its own
 * resize handle (the column's last child) scrolls out of view -- reachable
 * only by scrolling first, and until then a click "at" its expected position
 * lands on whatever renders below .oc-left instead (reported as a broken/
 * blank area). The left/side columns have the analogous "neighbor + central
 * minimum" rule from earlier in Lot 4. Re-measured live on every call (not
 * cached at drag-start) so it self-corrects each frame during a drag.
 */
function effectiveMax(ui, config) {
  if (config.neighborStateKey) {
    const containerWidth = ui.root.querySelector(".oc-body")?.clientWidth;
    const otherColumnWidth = Number(ui.state[config.neighborStateKey]) || 0;
    return Math.max(config.bounds.min, maxSideColumnWidth({ containerWidth, otherColumnWidth, staticMax: config.bounds.max }));
  }
  if (config.panelSelector) {
    const panel = ui.root.querySelector(config.panelSelector);
    const container = panel?.closest(".oc-left-body");
    if (!container || !panel) return config.bounds.max;
    // .oc-left-body is a flex column with its own row `gap` (styles.js); a
    // hidden sibling (the batch-action toolbar) is display:none and
    // contributes neither height nor a gap, so only count visible ones.
    const visibleChildren = [...container.children].filter((child) => !child.hidden && child.offsetHeight > 0);
    const gap = parseFloat(getComputedStyle(container).rowGap) || 0;
    const othersHeight = visibleChildren.reduce((sum, child) => (child === panel ? sum : sum + child.offsetHeight), 0)
      + Math.max(0, visibleChildren.length - 1) * gap;
    return Math.max(config.bounds.min, maxVerticalPanelHeight({
      containerClientHeight: container.clientHeight,
      othersHeight,
      staticMax: config.bounds.max,
    }));
  }
  return config.bounds.max;
}

/** Push ui.state.outliner_height / preview_width / side_width / graph_height onto ui.root as CSS vars. */
export function applyPanelLayout(ui) {
  if (!ui?.root?.style?.setProperty) return;
  for (const config of Object.values(HANDLES)) {
    const value = clamp(
      Number(ui.state[config.stateKey]) || config.bounds.default,
      config.bounds.min, effectiveMax(ui, config),
    );
    ui.root.style.setProperty(config.cssVar, `${Math.round(value)}px`);
  }
}

// Director modal audit Lot 4: restore every resizable panel to its
// PANEL_LAYOUT default in one action, for when accumulated drags (or an old
// saved workflow with sizes that no longer fit) leave the layout awkward.
export function resetPanelLayout(ui) {
  ui.state.outliner_height = PANEL_LAYOUT.outlinerHeight.default;
  ui.state.preview_width = PANEL_LAYOUT.previewWidth.default;
  ui.state.side_width = PANEL_LAYOUT.sideWidth.default;
  ui.state.left_width = PANEL_LAYOUT.leftWidth.default;
  ui.state.graph_height = PANEL_LAYOUT.graphHeight.default;
  ui.state.assets_height = PANEL_LAYOUT.assetsHeight.default;
  ui.state.agent_height = PANEL_LAYOUT.agentHeight.default;
  applyPanelLayout(ui);
  ui.refreshCameraPreviews?.();
  ui.refreshGraph?.();
  ui.drawCurveEditor?.();
  ui.scheduleResizeAndRender?.();
  ui.refitNode?.();
  ui.scheduleSerialize?.();
  ui.setStatus?.(t("Layout reset to defaults"));
}

export function bindPanelResize(ui, signal) {
  applyPanelLayout(ui);
  // bindPanelResize runs during construction, before ui.root is attached to
  // the workbench (WorkbenchHost.mount() appends it afterwards) -- so the
  // call above measures an unattached, zero-height .oc-left-body and every
  // effectiveMax() falls back to the static max, unable to correct a
  // default/saved size that doesn't actually fit. Re-apply one frame later,
  // once layout has settled, mirroring WorkbenchHost's own post-mount
  // `requestAnimationFrame(() => this.onResize())` (host.js).
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => applyPanelLayout(ui));

  for (const btn of ui.root.querySelectorAll('[data-act="reset-layout"]')) {
    btn.addEventListener("click", () => resetPanelLayout(ui), { signal });
  }

  for (const [role, config] of Object.entries(HANDLES)) {
    const handle = ui.root.querySelector(`[data-role="${role}"]`);
    if (!handle) continue;

    const dir = config.direction ?? 1;
    // Director modal audit Lot 4: a live drag only needs to move the CSS var
    // -- the box reflows synchronously from that alone. Anything downstream
    // that cares about the new size (the viewport canvas) already has its own
    // ResizeObserver on .viewport-wrap (editor-global.js), which the browser
    // batches to once per frame on its own; no per-handle RAF queue or
    // refitNode call is needed just to keep the drag smooth.
    const setLive = (value) => {
      ui.root.style.setProperty(config.cssVar, `${Math.round(clamp(value, config.bounds.min, effectiveMax(ui, config)))}px`);
    };
    const commit = (value) => {
      const next = Math.round(clamp(value, config.bounds.min, effectiveMax(ui, config)));
      ui.state[config.stateKey] = next;
      setLive(next);
      // A wider/narrower preview column re-fits the WebGL preview tiles.
      if (config.stateKey === "preview_width") { ui.refreshCameraPreviews?.(); ui.requestRender?.("layout"); }
      else if (config.stateKey === "side_width" || config.stateKey === "left_width") { ui.scheduleResizeAndRender?.(); }
      else if (config.stateKey === "graph_height") { ui.refreshGraph?.(); ui.drawCurveEditor?.(); }
      // Grow the node so the taller panel is not clipped behind a scrollbar.
      ui.refitNode?.();
      ui.scheduleSerialize?.();
    };
    const pointerValue = (event) => (config.axis === "y" ? event.clientY : event.clientX);

    let drag = null;
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      handle.setPointerCapture?.(event.pointerId);
      drag = { pointerId: event.pointerId, origin: pointerValue(event), start: Number(ui.state[config.stateKey]) || config.bounds.default };
    }, { signal });

    handle.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      setLive(drag.start + (pointerValue(event) - drag.origin) * dir);
    }, { signal });

    const end = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      handle.releasePointerCapture?.(event.pointerId);
      commit(drag.start + (pointerValue(event) - drag.origin) * dir);
      drag = null;
    };
    handle.addEventListener("pointerup", end, { signal });
    handle.addEventListener("pointercancel", end, { signal });

    handle.addEventListener("dblclick", (event) => {
      event.preventDefault();
      commit(config.bounds.default);
    }, { signal });

    handle.addEventListener("keydown", (event) => {
      const step = (event.shiftKey ? 48 : 16) * dir;
      const current = Number(ui.state[config.stateKey]) || config.bounds.default;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); commit(current + step); }
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); commit(current - step); }
      else if (event.key === "Home") { event.preventDefault(); commit(config.bounds.default); }
    }, { signal });
  }
}
