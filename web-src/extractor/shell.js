// Lazy shell entry point for the OmniCam Extractor node -- the only Extractor
// module main.js's nodeCreated() imports (migration plan Task 15). Builds a
// persistent ExtractorRuntime plus a compact always-mounted DOMWidget with an
// "OPEN EXTRACTOR" button; the full panel (web-src/extractor/index.js, its
// source viewer, timeline, tracking overlay and, on demand, the 3D track
// viewer) loads only when that button is pressed.
//
// The queued solve is owned by ExtractorRuntime and is bound to ComfyUI's
// native execution events at attach time, so TRACK/Reconstruct keeps
// progressing -- and the shell keeps showing it -- whether or not the panel
// is open. Only node removal cancels it (migration plan Task 13).

import { api, app } from "../comfy-runtime.js";
import { t } from "../i18n.js";
import { ExtractorRuntime } from "./runtime.js";
import { hideInternalWidgetsWhenMounted } from "./lifecycle.js";
import { watchGraphConnections } from "../graph-connection-watch.js";
import { createNodeShell } from "../workbench/node-shell.js";
import { WorkbenchHost } from "../workbench/host.js";
import { workbenchSessions } from "../workbench/session-manager.js";

function updateShell(runtime) {
  const snapshot = runtime.getSnapshot();
  runtime.shell?.setTitle(t("OmniCam Extractor"));
  runtime.shell?.setMeta(snapshot.sourceLabel || t("No source connected"));
  const phase = snapshot.solveState || "IDLE";
  runtime.shell?.setStatus(snapshot.error || `${phase}${snapshot.anomalyCount ? ` · ${snapshot.anomalyCount} ${t("anomalies")}` : ""}`);
  const busy = !["IDLE", "COMPLETED", "FAILED", "CANCELLED", "STOPPED"].includes(phase);
  runtime.shell?.setProgress(busy ? snapshot.progress : null);
  runtime.shell?.setPreview(snapshot.previewDataUrl ?? null);
}

/**
 * Best-effort still-frame capture at workbench-close time only (never a
 * poll/interval). Delegates to ExtractorUI.capturePreviewDataUrl()
 * (extractor/index.js), which prefers the solved 3D track result and falls
 * back to whichever raw-source element is currently visible.
 */
async function captureExtractorPreview(runtime, ui) {
  try {
    const dataUrl = await ui?.capturePreviewDataUrl?.();
    if (dataUrl) runtime.previewDataUrl = dataUrl;
    updateShell(runtime);
  } catch (error) {
    console.warn("[OmniCam] Extractor preview capture failed", error);
  }
}

function sessionKeyFor(node) {
  return `extractor:${node.id}`;
}

async function openExtractorWorkbenchSession(runtime, opener) {
  return workbenchSessions.open({
    key: sessionKeyFor(runtime.node),
    nodeId: runtime.node.id,
    opener,
    createSession: async () => {
      const generation = ++runtime.workbenchGeneration;
      const { openExtractorWorkbench, closeExtractorWorkbench } = await import("./index.js");
      if (runtime.disposed || generation !== runtime.workbenchGeneration) return null;

      const ui = openExtractorWorkbench(runtime);

      const key = sessionKeyFor(runtime.node);
      const host = new WorkbenchHost({
        kind: "extractor",
        nodeId: runtime.node.id,
        title: t("OmniCam Extractor"),
        // Closing never cancels the solve, so there is no reason to refuse
        // (unlike Director's future realtime-capture guard).
        onRequestClose: (reason) => workbenchSessions.close(key, reason),
        onResize: () => ui.viewer?.resize?.(),
      });
      host.mount(ui.root);

      return {
        key,
        nodeId: runtime.node.id,
        host,
        close: async () => {
          await captureExtractorPreview(runtime, ui);
          closeExtractorWorkbench(ui);
          host.dispose();
          return true;
        },
        dispose: () => {
          void captureExtractorPreview(runtime, ui);
          closeExtractorWorkbench(ui);
          host.dispose();
        },
      };
    },
  });
}

export function attachExtractorShell(node) {
  if (node.__majoorOmniCamExtractorRuntime) return node.__majoorOmniCamExtractorRuntime;

  const runtime = new ExtractorRuntime(node, { api, app });
  runtime.workbenchGeneration = 0;

  hideInternalWidgetsWhenMounted(node);

  const shell = createNodeShell({
    kind: "extractor",
    title: t("OmniCam Extractor"),
    buttonLabel: t("OPEN EXTRACTOR"),
    onOpen: (event) => { void openExtractorWorkbenchSession(runtime, event.currentTarget); },
  });
  runtime.shell = shell;
  updateShell(runtime);
  runtime.addEventListener("statechange", () => updateShell(runtime));

  node.__majoorOmniCamExtractorRuntime = runtime;
  node.addDOMWidget("majoor_omnicam_extractor_shell", "omnicam", shell.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 124,
    getHeight: () => 124,
    getMaxHeight: () => 124,
  });

  // Graph lifecycle lives here, on the node, for the runtime's full life --
  // not inside the transient workbench. A source change cancels a solve
  // running against stale footage regardless of whether the panel is open;
  // the DOM-aware media/frame-count resync only runs when it is (deferred via
  // pendingSourceResync otherwise, consumed on next open).
  const resync = () => {
    if (runtime.disposed) return;
    runtime.checkSourceChanged();
    if (runtime.workbench) {
      runtime.workbench.refreshSource();
      node.setDirtyCanvas?.(true, true);
    }
  };
  const originalConnectionsChange = node.onConnectionsChange;
  node.onConnectionsChange = function (...args) {
    originalConnectionsChange?.apply(this, args);
    resync();
    // The link array is not always updated by the time this fires; a second
    // pass a frame or two later reads the settled graph.
    setTimeout(resync, 60);
    setTimeout(resync, 400);
  };
  // Backstop for the builds where onConnectionsChange is not delivered here
  // (upstream node deleted, link re-routed by the Vue graph).
  const unwatchGraphConnections = watchGraphConnections(node, () => setTimeout(resync, 0));

  const originalAfterGraphConfigured = node.onAfterGraphConfigured;
  node.onAfterGraphConfigured = function (...args) {
    originalAfterGraphConfigured?.apply(this, args);
    resync();
    // A workflow reload restores the recon_* widgets after this shell was
    // built; re-hydrate the reconstruction panel's DOM controls from them
    // once it is open. The solved result comes back from the serialized
    // cache widgets, and a still-running queued solve is followed through
    // ComfyUI's own events -- no custom status recovery.
    runtime.workbench?.reconstruction?.syncFromWidgets?.();
  };

  const originalRemoved = node.onRemoved;
  node.onRemoved = function (...args) {
    workbenchSessions.disposeForNode(node.id);
    unwatchGraphConnections();
    runtime.dispose();
    originalRemoved?.apply(this, args);
  };

  return runtime;
}
