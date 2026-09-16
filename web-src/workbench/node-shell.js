// Compact, always-mounted DOMWidget shell shown on a closed Director/Extractor
// node: title, one status line, one meta line, an optional progress bar and
// an Open button. Deliberately inert -- no canvas, no RAF loop, no media
// element, no ResizeObserver -- so a graph full of closed nodes costs almost
// nothing. Shell state is written by the caller's runtime; it is never a
// second source of truth (migration plan section 8).

import { injectWorkbenchStyles } from "./styles.js";

export function createNodeShell({ kind, title, buttonLabel, onOpen }) {
  injectWorkbenchStyles(document);

  const root = document.createElement("div");
  root.className = "oc-node-shell";
  root.dataset.shellKind = kind;

  const titleEl = document.createElement("div");
  titleEl.className = "oc-node-shell-title";
  titleEl.textContent = title ?? "";

  const metaEl = document.createElement("div");
  metaEl.className = "oc-node-shell-meta";

  const statusEl = document.createElement("div");
  statusEl.className = "oc-node-shell-status";

  const progressEl = document.createElement("div");
  progressEl.className = "oc-node-shell-progress";
  const progressFill = document.createElement("span");
  progressEl.append(progressFill);

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "oc-node-shell-open";
  openButton.textContent = buttonLabel ?? "Open";

  root.append(titleEl, metaEl, statusEl, progressEl, openButton);

  const abort = new AbortController();
  openButton.addEventListener("click", (event) => onOpen?.(event), { signal: abort.signal });

  return {
    root,
    openButton,
    setTitle(value) {
      titleEl.textContent = value ?? "";
    },
    setMeta(value) {
      metaEl.textContent = value ?? "";
    },
    setStatus(value) {
      statusEl.textContent = value ?? "";
    },
    setProgress(value) {
      if (value === null || value === undefined) {
        progressEl.dataset.active = "false";
        return;
      }
      progressEl.dataset.active = "true";
      const clamped = Math.max(0, Math.min(1, value));
      progressFill.style.width = `${(clamped * 100).toFixed(1)}%`;
    },
    dispose() {
      abort.abort();
    },
  };
}
