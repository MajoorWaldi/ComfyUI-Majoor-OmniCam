// Accessible focus containment for a body-level workbench window.
//
// Scope is deliberately small: cycle Tab/Shift+Tab across the visible
// focusable descendants of `container`, and restore focus to whatever had it
// before the trap activated. No MutationObserver -- focusable elements are
// re-queried on every Tab press, which is cheap and avoids a stale list if
// the workbench mounts/unmounts controls while open.

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

function isVisible(element) {
  return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects?.().length);
}

function focusableDescendants(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(isVisible);
}

export function createFocusTrap(container) {
  let active = false;
  let previouslyFocused = null;
  let abort = null;

  function handleKeydown(event) {
    if (event.key !== "Tab") return;
    const focusable = focusableDescendants(container);
    if (!focusable.length) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = container.ownerDocument?.activeElement ?? document.activeElement;

    if (event.shiftKey) {
      if (current === first || !focusable.includes(current)) {
        event.preventDefault();
        last.focus();
      }
    } else if (current === last || !focusable.includes(current)) {
      event.preventDefault();
      first.focus();
    }
  }

  return {
    activate() {
      if (active) return;
      active = true;
      previouslyFocused = document.activeElement;
      abort = new AbortController();
      container.addEventListener("keydown", handleKeydown, { signal: abort.signal });
    },
    deactivate() {
      if (!active) return;
      active = false;
      abort?.abort();
      abort = null;
      const restore = previouslyFocused;
      previouslyFocused = null;
      if (restore && typeof restore.focus === "function" && restore.isConnected) {
        restore.focus();
      }
    },
    get active() { return active; },
  };
}
