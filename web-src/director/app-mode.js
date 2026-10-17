import { createAppModeInput } from "./app-mode-input.js";

// AppModeWidgetList reparents the existing DOM widget. Keep its runtime and
// editor intact; only adapt layout and refresh after a host/size change.
const APP_HOST = '[data-testid="app-mode-widget-item"], [data-testid="builder-widget-item"]';

export function attachDirectorAppMode(root, inlineView, platform = globalThis) {
  let disposed = false;
  let frame = null;
  let generation = 0;
  const input = createAppModeInput(root);

  async function refresh() {
    frame = null;
    if (disposed) return;
    const current = ++generation;
    input.sync();
    const inApp = root.isConnected && Boolean(root.closest(APP_HOST));
    if (!inApp) {
      delete root.dataset.appMode;
      return;
    }
    root.dataset.appMode = "true";
    const bounds = root.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    try {
      const ui = await inlineView.show();
      if (!disposed && current === generation && root.isConnected) {
        ui?.scheduleResizeAndRender?.();
      }
    } catch (error) {
      console.warn("[OmniCam] App viewer mount failed", error);
    }
  }

  function schedule() {
    if (disposed || frame !== null) return;
    frame = platform.requestAnimationFrame(refresh);
  }

  // Observe host changes and input locks, never rendering/style mutations.
  const mounts = new platform.MutationObserver((records) => {
    if (records.some((record) => record.type === "attributes"
      ? record.target === root || record.target.contains?.(root)
      : [...record.addedNodes, ...record.removedNodes]
        .some((element) => element === root || element.contains?.(root)))) schedule();
  });
  mounts.observe(root.ownerDocument.body, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ["inert", "data-testid"],
  });
  const sizes = new platform.ResizeObserver(schedule);
  sizes.observe(root);
  schedule();

  return () => {
    disposed = true;
    generation++;
    mounts.disconnect();
    sizes.disconnect();
    input.dispose();
    if (frame !== null) platform.cancelAnimationFrame(frame);
    delete root.dataset.appMode;
  };
}

export const DIRECTOR_APP_MODE_STYLES = `
  .oc-director-node[data-app-mode="true"] {
    display:flex !important; position:relative !important;
    visibility:visible !important; transform:none !important;
    inset:auto !important; opacity:1 !important;
    width:100% !important; min-width:0; height:560px;
    min-height:420px; max-height:80vh; resize:vertical; overflow:hidden;
    box-sizing:border-box;
  }
  .oc-director-node[data-app-mode="true"]>.oc-director-inline {
    min-width:0; min-height:0;
  }
  [data-testid="app-mode-widget-item"] .oc-director-node[data-app-mode="true"] {
    pointer-events:auto !important;
  }
`;
