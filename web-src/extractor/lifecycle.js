// Extractor node widget management, shared by web-src/extractor/shell.js.

import { FINGERPRINT_WIDGET, SOURCE_WIDGET, SCENE_WIDGET } from "./result-cache.js";

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

/** Create the SOURCE_WIDGET if this node predates it. Frontend-only, never a backend input. */
export function ensureSourceWidget(node) {
  if (widget(node, SOURCE_WIDGET)) return;
  const item = node.addWidget?.("text", SOURCE_WIDGET, "", () => {}, { serialize: true });
  if (!item) return;
  item.computeSize = () => [0, -4];
  item.draw = () => {};
  item.hidden = true;
}
