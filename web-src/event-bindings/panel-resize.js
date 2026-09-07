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

/** Push ui.state.outliner_height / preview_width onto ui.root as CSS vars. */
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
  ui.root.style.setProperty("--oc-outliner-h", `${Math.round(height)}px`);
  ui.root.style.setProperty("--oc-preview-w", `${Math.round(width)}px`);
}

const HANDLES = {
  "outliner-resize": { axis: "y", stateKey: "outliner_height", bounds: PANEL_LAYOUT.outlinerHeight, cssVar: "--oc-outliner-h" },
  "preview-resize": { axis: "x", stateKey: "preview_width", bounds: PANEL_LAYOUT.previewWidth, cssVar: "--oc-preview-w" },
};

export function bindPanelResize(ui, signal) {
  applyPanelLayout(ui);

  for (const [role, config] of Object.entries(HANDLES)) {
    const handle = ui.root.querySelector(`[data-role="${role}"]`);
    if (!handle) continue;

    const raf = typeof globalThis.requestAnimationFrame === "function"
      ? globalThis.requestAnimationFrame.bind(globalThis)
      : (fn) => fn();
    let refitQueued = false;
    const setLive = (value) => {
      ui.root.style.setProperty(config.cssVar, `${Math.round(clamp(value, config.bounds.min, config.bounds.max))}px`);
      // Keep the node growing under the pointer, not only on release, so the
      // panel never spends the drag clipped -- but at most once per frame.
      if (refitQueued) return;
      refitQueued = true;
      raf(() => { refitQueued = false; ui.refitNode?.(); });
    };
    const commit = (value) => {
      const next = Math.round(clamp(value, config.bounds.min, config.bounds.max));
      ui.state[config.stateKey] = next;
      setLive(next);
      // A wider/narrower preview column re-fits the WebGL preview tiles.
      if (config.axis === "x") { ui.refreshCameraPreviews?.(); ui.requestRender?.("layout"); }
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
      setLive(drag.start + (pointerValue(event) - drag.origin));
    }, { signal });

    const end = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      handle.releasePointerCapture?.(event.pointerId);
      commit(drag.start + (pointerValue(event) - drag.origin));
      drag = null;
    };
    handle.addEventListener("pointerup", end, { signal });
    handle.addEventListener("pointercancel", end, { signal });

    handle.addEventListener("dblclick", (event) => {
      event.preventDefault();
      commit(config.bounds.default);
    }, { signal });

    handle.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 48 : 16;
      const current = Number(ui.state[config.stateKey]) || config.bounds.default;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); commit(current + step); }
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); commit(current - step); }
      else if (event.key === "Home") { event.preventDefault(); commit(config.bounds.default); }
    }, { signal });
  }
}
