// The builder intentionally makes widget content inert while arranging it.
// Recover stale input locks only inside a real App item, never in the builder
// or an outer modal. Restore any borrowed attributes when leaving that host.
export function createAppModeInput(root) {
  const borrowed = new Map();

  function restore() {
    for (const [element, value] of borrowed) {
      if (!element.hasAttribute("inert")) element.setAttribute("inert", value);
    }
    borrowed.clear();
  }

  function sync() {
    const host = root.closest('[data-testid="app-mode-widget-item"]');
    if (!host || root.closest('[data-testid="builder-widget-item"]')) {
      restore();
      return;
    }
    for (const [element, value] of borrowed) {
      if (!host.contains(element)) {
        if (!element.hasAttribute("inert")) element.setAttribute("inert", value);
        borrowed.delete(element);
      }
    }
    let element = root;
    while (element && host.contains(element)) {
      if (element.hasAttribute("inert")) {
        if (!borrowed.has(element)) borrowed.set(element, element.getAttribute("inert"));
        element.removeAttribute("inert");
      }
      if (element === host) break;
      element = element.parentElement;
    }
  }

  return { sync, dispose: restore };
}
