// The live Director inside its own node: the real editor (director.js), not
// a second engine, laid out compact by `data-inline` -- viewport, tool rail,
// Quick Camera bar and transport/keys. Opening the full editor moves this same
// instance into the modal WorkbenchHost and closing the modal moves it back,
// so nothing is rebuilt and no edit is lost on the way.
//
// Each live editor holds two WebGL contexts (viewport + camera view) and a
// page gets roughly sixteen, so only MAX_LIVE_VIEWS nodes stay live at once.
// Bringing up one more retires the least recently used back to its static
// preview card; one whose modal is open, or that is recording, is never
// retired.

import { t } from "../i18n.js";
import { WorkbenchHost } from "../workbench/host.js";
import { workbenchSessions } from "../workbench/session-manager.js";

export const MAX_LIVE_VIEWS = 4;

const liveViews = [];

function markUsed(view) {
  const index = liveViews.indexOf(view);
  if (index >= 0) liveViews.splice(index, 1);
  liveViews.push(view);
}

function retireOneLiveView() {
  const candidate = liveViews.find((view) => !view.host && !view.ui?.recording);
  return candidate ? candidate.hide() : false;
}

export class DirectorInlineView {
  /**
   * @param runtime DirectorRuntime of the node.
   * @param container Element the inline editor root is mounted into.
   * @param onLiveChange Called with true/false whenever the live editor appears or goes.
   * @param onRetire Called with the editor just before it is torn down (preview capture).
   */
  constructor(runtime, { container, onLiveChange, onRetire }) {
    this.runtime = runtime;
    this.container = container;
    this.onLiveChange = onLiveChange;
    this.onRetire = onRetire;
    this.ui = null;
    this.host = null;
    this.closeWorkbench = null;
    this.loading = null;
    this.disposed = false;
    this.visibilityObserver = null;
    this.resizeObserver = new ResizeObserver(() => this.ui?.scheduleResizeAndRender?.());
    this.resizeObserver.observe(container);
  }

  get key() {
    return `director:${this.runtime.node.id}`;
  }

  /**
   * Bring up the live editor in the node; resolves to it, or null if the node
   * went away meanwhile. Concurrent callers (first layout, OPEN DIRECTOR,
   * LIVE VIEW) share one load, so none of them can cancel another's.
   */
  show() {
    if (this.ui) {
      markUsed(this);
      return Promise.resolve(this.ui);
    }
    this.loading ||= this.mount().finally(() => {
      this.loading = null;
    });
    return this.loading;
  }

  async mount() {
    const { openDirectorWorkbench, closeDirectorWorkbench } = await import("../director.js");
    if (this.disposed) return null;
    while (liveViews.length >= MAX_LIVE_VIEWS && retireOneLiveView()) {
      // Retire until a slot is free; stops early if every live view is pinned.
    }

    this.closeWorkbench = closeDirectorWorkbench;
    const ui = openDirectorWorkbench(this.runtime);
    if (this.runtime.pendingUpstreamResync) {
      this.runtime.pendingUpstreamResync = false;
      ui.syncUpstreamInputs?.();
    }
    ui.root.dataset.inline = "true";
    ui.root.addEventListener("pointerdown", () => markUsed(this), { capture: true });
    this.container.append(ui.root);
    this.ui = ui;
    markUsed(this);
    this.onLiveChange(true);
    ui.scheduleResizeAndRender?.();
    return ui;
  }

  /**
   * Go live the first time `element` is actually laid out. A Director inside
   * a closed subgraph has no DOM on screen and must not hold WebGL contexts
   * or a live slot until the subgraph is opened.
   */
  showWhenVisible(element) {
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = new ResizeObserver(([entry]) => {
      if (!element.isConnected || !entry.contentRect.width || !entry.contentRect.height) return;
      this.visibilityObserver.disconnect();
      this.visibilityObserver = null;
      void this.show();
    });
    this.visibilityObserver.observe(element);
  }

  /** Back to the static card. False while recording or expanded, which must not be interrupted. */
  hide() {
    const ui = this.ui;
    if (!ui) return true;
    if (this.host || ui.recording) return false;
    ui.serialize?.();
    this.onRetire(ui);
    this.teardown();
    this.onLiveChange(false);
    return true;
  }

  /** Open the full editor: the live instance moves into the modal workbench. */
  async expand(opener) {
    const ui = await this.show();
    if (!ui) return null;
    return workbenchSessions.open({
      key: this.key,
      nodeId: this.runtime.node.id,
      opener,
      createSession: async () => {
        if (this.disposed || this.ui !== ui) return null;
        const host = new WorkbenchHost({
          kind: "director",
          nodeId: this.runtime.node.id,
          title: this.runtime.getSnapshot().sceneName || t("OmniCam Director"),
          onRequestClose: (reason) => workbenchSessions.close(this.key, reason),
          onResize: () => ui.scheduleResizeAndRender?.(),
        });
        delete ui.root.dataset.inline;
        host.mount(ui.root);
        this.host = host;
        this.runtime.activeWorkbenchHost = host;
        host.setDirty(this.runtime.isDirty);
        return {
          key: this.key,
          nodeId: this.runtime.node.id,
          host,
          close: async () => {
            // A playblast encode/upload cannot resume once interrupted.
            if (ui.recording) {
              ui.setStatus?.(t("Cannot close Director while a playblast is recording"));
              return false;
            }
            ui.serialize?.();
            this.collapse();
            return true;
          },
          dispose: () => this.dispose(),
        };
      },
    });
  }

  collapse() {
    const host = this.host;
    if (!host) return;
    this.host = null;
    if (this.runtime.activeWorkbenchHost === host) this.runtime.activeWorkbenchHost = null;
    if (this.ui) {
      this.ui.root.dataset.inline = "true";
      this.container.append(this.ui.root);
      this.ui.scheduleResizeAndRender?.();
    }
    host.dispose();
  }

  teardown() {
    const ui = this.ui;
    this.ui = null;
    const index = liveViews.indexOf(this);
    if (index >= 0) liveViews.splice(index, 1);
    if (!ui) return;
    this.closeWorkbench(ui);
    ui.root.remove();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.visibilityObserver?.disconnect();
    this.resizeObserver.disconnect();
    const host = this.host;
    this.host = null;
    if (this.runtime.activeWorkbenchHost === host) this.runtime.activeWorkbenchHost = null;
    host?.dispose();
    this.teardown();
  }
}
