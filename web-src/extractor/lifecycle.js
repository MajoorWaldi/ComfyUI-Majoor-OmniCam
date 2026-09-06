// Extractor node lifecycle and widget management.

import {
  FINGERPRINT_WIDGET,
  SOURCE_WIDGET,
  SCENE_WIDGET,
  ensureCacheWidgets,
  restoreLateWidgetValues,
} from "./result-cache.js";
import { ExtractorUI } from "./index.js";

const INTERNAL_WIDGETS = [SCENE_WIDGET, FINGERPRINT_WIDGET, SOURCE_WIDGET];

function widget(node, name) {
  return node?.widgets?.find((item) => item.name === name) || null;
}

export function hideInternalWidgets(node) {
  for (const name of INTERNAL_WIDGETS) {
    const item = widget(node, name);
    if (!item) continue;
    item.computeSize = () => [0, -4];
    item.draw = () => {};
    item.hidden = true;
    item.type = "hidden";
    item.options = { ...(item.options || {}), hideInVueNodes: true, serialize: true };
  }
  node.setDirtyCanvas?.(true, true);
}

/**
 * Hide them again once the node has actually mounted.
 *
 * Flags set during `nodeCreated` are read before the Vue node builds its widget
 * rows, so they had no effect and the cached track JSON was rendered on the
 * node as a text field. Re-applying after a frame is what makes it stick.
 */
export function hideInternalWidgetsWhenMounted(node) {
  hideInternalWidgets(node);
  globalThis.requestAnimationFrame?.(() => hideInternalWidgets(node));
  setTimeout(() => hideInternalWidgets(node), 250);
}

// Called by web-src/main.js once the Extractor chunk has loaded. This module
// has no startup side effects, which is what keeps it out of the eager chunk.
export function attachExtractor(node) {
  if (node.__majoorOmniCamExtractor) return;
  ensureCacheWidgets(node);
  if (!widget(node, SOURCE_WIDGET)) {
    const item = node.addWidget?.("text", SOURCE_WIDGET, "", () => {}, { serialize: true });
    if (item) {
      item.computeSize = () => [0, -4];
      item.draw = () => {};
      item.hidden = true;
    }
  }
  hideInternalWidgetsWhenMounted(node);
  // Before the UI is built: its constructor restores the cached solve from
  // these widgets, and they are only now able to hold what was saved.
  restoreLateWidgetValues(node);

  const ui = new ExtractorUI(node);
  node.__majoorOmniCamExtractor = ui;
  const preferredHeight = () => Math.max(700, ui.root.scrollHeight || 0);
  node.addDOMWidget("majoor_omnicam_extractor", "omnicam", ui.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 700,
    getHeight: preferredHeight,
    getMaxHeight: preferredHeight,
  });

  const removed = node.onRemoved;
  node.onRemoved = function () {
    ui.dispose();
    removed?.apply(this, arguments);
  };
  const executed = node.onExecuted;
  node.onExecuted = function (message) {
    executed?.apply(this, arguments);
    ui.executed(message);
  };
  const changed = node.onConnectionsChange;
  node.onConnectionsChange = function () {
    changed?.apply(this, arguments);
    ui.refreshSource();
    setTimeout(() => {
      if (!ui.disposed) ui.refreshSource();
    }, 400);
  };
  const configured = node.onAfterGraphConfigured;
  node.onAfterGraphConfigured = function () {
    configured?.apply(this, arguments);
    ui.refreshSource();
    ui.recoverStatus();
  };
}
