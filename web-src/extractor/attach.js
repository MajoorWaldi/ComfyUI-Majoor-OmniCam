// Mount and lifecycle attachment for the OmniCam Extractor node.
// Extracted from index.js to respect the project's source-line ceiling.

import { api, app } from "../comfy-runtime.js";
import { watchGraphConnections } from "../graph-connection-watch.js";
import { ExtractorRuntime } from "./runtime.js";
import { hideInternalWidgetsWhenMounted } from "./lifecycle.js";
import { ExtractorUI } from "./index.js";

/**
 * Constructs the heavy visible panel (DOM, media, 3D viewer) against an
 * existing, persistent ExtractorRuntime, and returns it. Called once, by
 * attachExtractor() below, immediately when the node is created -- there is
 * no separate open step. The runtime itself and its queue-event binding are
 * attached once and outlive this UI, exactly as before: only node removal
 * (runtime.dispose()) cancels a queued solve.
 */
export function openExtractorWorkbench(runtime) {
  const ui = new ExtractorUI(runtime);
  runtime.attachWorkbench(ui);
  runtime.node.__majoorOmniCamExtractor = ui;
  if (runtime.pendingSourceResync) {
    runtime.pendingSourceResync = false;
    ui.refreshSource();
  }
  // A Scene Reconstruct result that finished while no panel was open is held
  // headlessly on the runtime (ExtractorRuntime.acceptReconstructionResult);
  // replay it into the reconstruction controller now that one exists again.
  if (runtime.reconstructionResult) {
    ui.reconstruction?.acceptQueuedResult(runtime.reconstructionResult);
  }
  return ui;
}

/**
 * Disposes only the visual/media side of a workbench and detaches it from
 * its runtime. Never cancels the queued solve or touches cached results --
 * those belong to ExtractorRuntime and outlive this call.
 */
export function closeExtractorWorkbench(ui) {
  ui.dispose();
  ui.runtime.detachWorkbench(ui);
  if (ui.node.__majoorOmniCamExtractor === ui) delete ui.node.__majoorOmniCamExtractor;
}

/**
 * The Extractor node's sole mount path: the full panel embedded inline as
 * the node's own DOM widget, for the node's whole lifetime -- no compact
 * shell, no modal workbench. Builds the same ExtractorRuntime + ExtractorUI
 * pair the old shell/workbench split used, just attached immediately instead
 * of on a click, and disposed only on node removal instead of on close.
 */
export function attachExtractor(node) {
  if (node.__majoorOmniCamExtractorRuntime) return node.__majoorOmniCamExtractorRuntime;

  const runtime = new ExtractorRuntime(node, { api, app });
  hideInternalWidgetsWhenMounted(node);

  const ui = openExtractorWorkbench(runtime);
  node.__majoorOmniCamExtractorRuntime = runtime;

  const preferredHeight = () => Math.max(620, ui.root.scrollHeight || 0);
  node.addDOMWidget("majoor_omnicam_extractor", "omnicam", ui.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 620,
    getHeight: preferredHeight,
    getMaxHeight: preferredHeight,
  });

  // Source-change resync used to be split between "headless" (runtime only)
  // and "open" (also touch the DOM-aware viewer/media) cases -- the workbench
  // is now always attached, so this always does both.
  const resync = () => {
    if (runtime.disposed) return;
    runtime.checkSourceChanged();
    ui.refreshSource();
    node.setDirtyCanvas?.(true, true);
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
    // A workflow reload restores the recon_* widgets after this UI was built;
    // re-hydrate the reconstruction panel's DOM controls from them.
    ui.reconstruction?.syncFromWidgets?.();
  };

  const originalRemoved = node.onRemoved;
  node.onRemoved = function (...args) {
    unwatchGraphConnections();
    closeExtractorWorkbench(ui);
    runtime.dispose();
    originalRemoved?.apply(this, args);
  };

  return runtime;
}
