import { t } from "../i18n.js";
import { escapeHtml } from "../monitor/html.js";
// Body-level modal host for a heavy OmniCam editor (Director or Extractor).
//
// WorkbenchHost owns only host-level concerns: the backdrop/window DOM,
// focus containment, Escape/close wiring and resize notification. It knows
// nothing about Director/Extractor state -- see section 6 of
// docs/superpowers/plans/2026-09-16-director-extractor-workbench.md for the
// full contract this implements.

import { createFocusTrap } from "./focus-trap.js";
import { injectWorkbenchStyles } from "./styles.js";

export class WorkbenchHost {
  constructor({ kind, nodeId, title, onRequestClose, onResize }) {
    this.kind = kind;
    this.nodeId = String(nodeId);
    this.title = title;
    this.onRequestClose = onRequestClose;
    this.onResize = onResize;
    this.backdrop = null;
    this.window = null;
    this.content = null;
    this.disposed = false;
    this._maximized = false;
    this.abort = null;
    this.focusTrap = null;
  }

  mount(contentRoot) {
    if (this.disposed) throw new Error("WorkbenchHost is disposed");
    if (this.backdrop) return;

    injectWorkbenchStyles(document);

    const backdrop = document.createElement("div");
    backdrop.className = "oc-workbench-backdrop";
    backdrop.dataset.kind = this.kind;
    backdrop.dataset.nodeId = this.nodeId;
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");

    const titleId = `oc-workbench-title-${this.kind}-${this.nodeId}`;
    backdrop.setAttribute("aria-labelledby", titleId);
    backdrop.innerHTML = `
      <section class="oc-workbench-window" tabindex="-1">
        <header class="oc-workbench-header">
          <div id="${titleId}" class="oc-workbench-title">
            <span class="oc-workbench-dirty-dot" aria-hidden="true" hidden></span>
            <span class="oc-workbench-title-text"></span>
          </div>
          <div class="oc-workbench-actions">
            <button type="button" data-workbench-act="maximize" aria-label="${escapeHtml(t("Maximize workbench"))}">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="${escapeHtml(t("Close workbench"))}">x</button>
          </div>
        </header>
        <div class="oc-workbench-content"></div>
      </section>`;

    this.backdrop = backdrop;
    this.window = backdrop.querySelector(".oc-workbench-window");
    this.content = backdrop.querySelector(".oc-workbench-content");
    this.setTitle(this.title);
    this.content.append(contentRoot);
    document.body.append(backdrop);

    this.abort = new AbortController();
    const { signal } = this.abort;
    backdrop.querySelector('[data-workbench-act="close"]')
      ?.addEventListener("click", () => void this.requestClose("button"), { signal });
    backdrop.querySelector('[data-workbench-act="maximize"]')
      ?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal });
    // Capture-phase + stopPropagation so Escape never reaches ComfyUI's own
    // graph-level shortcut handling while a workbench is open (contract
    // section 4.4 / risk 7 in the migration plan).
    backdrop.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      void this.requestClose("escape");
    }, { signal, capture: true });
    // Intentionally no backdrop-click-to-close handler: an accidental click
    // outside a 3D editor must not destroy an in-progress session.
    window.addEventListener("resize", () => this.onResize?.(), { signal });

    this.focusTrap = createFocusTrap(this.window);
    this.focusTrap.activate();
    this.window.focus();
    requestAnimationFrame(() => this.onResize?.());
  }

  async requestClose(reason = "user") {
    if (!this.backdrop || this.disposed) return true;
    const allow = await this.onRequestClose?.(reason);
    if (allow === false) return false;
    this.dispose();
    return true;
  }

  setTitle(title) {
    this.title = String(title || "OmniCam");
    const el = this.backdrop?.querySelector(".oc-workbench-title-text");
    if (el) el.textContent = this.title;
  }

  // Dirty dot next to the workbench title (spec section 05, top bar "nom
  // scène + dirty state"). A dot rather than a text suffix so it never fights
  // a locale's word order, matching the compact node shell's own dirty dot.
  setDirty(value) {
    const el = this.backdrop?.querySelector(".oc-workbench-dirty-dot");
    if (!el) return;
    el.hidden = !value;
    el.title = value ? t("Unsaved changes") : "";
  }

  setBusy(busy) {
    if (this.backdrop) this.backdrop.dataset.busy = busy ? "true" : "false";
  }

  setMaximized(value) {
    this._maximized = Boolean(value);
    this.window?.classList.toggle("is-maximized", this._maximized);
    requestAnimationFrame(() => this.onResize?.());
  }

  focus() {
    this.window?.focus();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.focusTrap?.deactivate();
    this.abort?.abort();
    this.backdrop?.remove();
    this.backdrop = this.window = this.content = null;
  }

  get mounted() { return Boolean(this.backdrop); }
  get maximized() { return this._maximized; }
  get contentElement() { return this.content; }
}
