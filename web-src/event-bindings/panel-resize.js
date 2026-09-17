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
import { maxSideColumnWidth } from "../director/panel-constraints.js";
import { t } from "../i18n.js";

/** Push ui.state.outliner_height / preview_width / side_width / graph_height onto ui.root as CSS vars. */
export function applyPanelLayout(ui) {
  if (!ui?.root?.style?.setProperty) return;
  const height = clamp(
    Number(ui.state.outliner_height) || PANEL_LAYOUT.outlinerHeight.default,
    PANEL_LAYOUT.outlinerHeight.min, PANEL_LAYOUT.outlinerHeight.max,
  );
  const width = clamp(
    Number(ui.state.preview_width) || PANEL_LAYOUT.previewWidth.default,
    PANEL_LAYOUT.previewWidth.min, PANEL_LAYOUT.previewWidth.max,
  );
  const sideWidth = clamp(
    Number(ui.state.side_width) || PANEL_LAYOUT.sideWidth.default,
    PANEL_LAYOUT.sideWidth.min, PANEL_LAYOUT.sideWidth.max,
  );
  const leftWidth = clamp(
    Number(ui.state.left_width) || PANEL_LAYOUT.leftWidth.default,
    PANEL_LAYOUT.leftWidth.min, PANEL_LAYOUT.leftWidth.max,
  );
  const graphHeight = clamp(
    Number(ui.state.graph_height) || PANEL_LAYOUT.graphHeight.default,
    PANEL_LAYOUT.graphHeight.min, PANEL_LAYOUT.graphHeight.max,
  );
  const assetsHeight = clamp(
    Number(ui.state.assets_height) || PANEL_LAYOUT.assetsHeight.default,
    PANEL_LAYOUT.assetsHeight.min, PANEL_LAYOUT.assetsHeight.max,
  );
  const agentHeight = clamp(
    Number(ui.state.agent_height) || PANEL_LAYOUT.agentHeight.default,
    PANEL_LAYOUT.agentHeight.min, PANEL_LAYOUT.agentHeight.max,
  );
  ui.root.style.setProperty("--oc-outliner-h", `${Math.round(height)}px`);
  ui.root.style.setProperty("--oc-preview-w", `${Math.round(width)}px`);
  ui.root.style.setProperty("--oc-side-w", `${Math.round(sideWidth)}px`);
  ui.root.style.setProperty("--oc-left-w", `${Math.round(leftWidth)}px`);
  ui.root.style.setProperty("--oc-graph-h", `${Math.round(graphHeight)}px`);
  ui.root.style.setProperty("--oc-assets-h", `${Math.round(assetsHeight)}px`);
  ui.root.style.setProperty("--oc-agent-h", `${Math.round(agentHeight)}px`);
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

const HANDLES = {
  "outliner-resize": { axis: "y", direction: 1, stateKey: "outliner_height", bounds: PANEL_LAYOUT.outlinerHeight, cssVar: "--oc-outliner-h" },
  "preview-resize": { axis: "x", direction: 1, stateKey: "preview_width", bounds: PANEL_LAYOUT.previewWidth, cssVar: "--oc-preview-w" },
  "side-resize": { axis: "x", direction: -1, stateKey: "side_width", bounds: PANEL_LAYOUT.sideWidth, cssVar: "--oc-side-w", neighborStateKey: "left_width" },
  "left-resize": { axis: "x", direction: 1, stateKey: "left_width", bounds: PANEL_LAYOUT.leftWidth, cssVar: "--oc-left-w", neighborStateKey: "side_width" },
  "graph-resize": { axis: "y", direction: 1, stateKey: "graph_height", bounds: PANEL_LAYOUT.graphHeight, cssVar: "--oc-graph-h" },
  "assets-resize": { axis: "y", direction: 1, stateKey: "assets_height", bounds: PANEL_LAYOUT.assetsHeight, cssVar: "--oc-assets-h" },
  "agent-resize": { axis: "y", direction: 1, stateKey: "agent_height", bounds: PANEL_LAYOUT.agentHeight, cssVar: "--oc-agent-h" },
};

export function bindPanelResize(ui, signal) {
  applyPanelLayout(ui);

  for (const btn of ui.root.querySelectorAll('[data-act="reset-layout"]')) {
    btn.addEventListener("click", () => resetPanelLayout(ui), { signal });
  }

  for (const [role, config] of Object.entries(HANDLES)) {
    const handle = ui.root.querySelector(`[data-role="${role}"]`);
    if (!handle) continue;

    const dir = config.direction ?? 1;
    // Director modal audit Lot 4: the left and side columns share one row
    // with the central stage (.oc-body: left | resize | stage | resize |
    // side), so each one's own static PANEL_LAYOUT max isn't enough on a
    // narrow window -- both columns near their max could squeeze the stage
    // to nothing. maxSideColumnWidth (panel-constraints.js, unit-tested)
    // factors in the OTHER column's current width and the container's total
    // width to keep a usable minimum for the stage regardless.
    const resolveMax = () => {
      if (!config.neighborStateKey) return config.bounds.max;
      const containerWidth = ui.root.querySelector(".oc-body")?.clientWidth;
      const otherColumnWidth = Number(ui.state[config.neighborStateKey]) || 0;
      return Math.max(config.bounds.min, maxSideColumnWidth({ containerWidth, otherColumnWidth, staticMax: config.bounds.max }));
    };
    // Director modal audit Lot 4: a live drag only needs to move the CSS var
    // -- the box reflows synchronously from that alone. Anything downstream
    // that cares about the new size (the viewport canvas) already has its own
    // ResizeObserver on .viewport-wrap (editor-global.js), which the browser
    // batches to once per frame on its own; no per-handle RAF queue or
    // refitNode call is needed just to keep the drag smooth.
    const setLive = (value) => {
      ui.root.style.setProperty(config.cssVar, `${Math.round(clamp(value, config.bounds.min, resolveMax()))}px`);
    };
    const commit = (value) => {
      const next = Math.round(clamp(value, config.bounds.min, resolveMax()));
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
