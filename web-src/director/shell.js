import { notifyCompletion } from "./completion-toast.js";
// Shell entry point for the OmniCam Director node -- the only Director module
// main.js's nodeCreated() imports. Builds the persistent DirectorRuntime, a
// status card, and the live inline editor (director/inline-view.js): the real
// editor in a compact layout inside the node, which OPEN DIRECTOR moves into
// the full modal workbench and back. The editor code and three.js still load
// lazily, after the node itself is up.

import { app, api } from "../comfy-runtime.js";
import { t } from "../i18n.js";
import { DirectorRuntime } from "./runtime.js";
import { attachDirectorApi } from "../director-api/index.js";
import { createDirectorAgentBridge } from "../agent/bridge.js";
import { watchGraphConnections } from "../graph-connection-watch.js";
import { createNodeShell } from "../workbench/node-shell.js";
import { workbenchSessions } from "../workbench/session-manager.js";
import { directorPlayblastSource } from "../monitor/reference-source.js";
import { DirectorInlineView } from "./inline-view.js";
import { invalidateDirectorRevision } from "./revision.js";
import { attachDirectorAppMode, DIRECTOR_APP_MODE_STYLES } from "./app-mode.js";

const MIN_WIDGET_HEIGHT = 420;
const RECORD_NOTICE_MS = 6000;

function hideInternalWidgets(node) {
  for (const name of ["state_json", "recording_path", "card_asset"]) {
    const widget = node.widgets?.find((w) => w.name === name);
    if (!widget) continue;
    widget.computeSize = () => [0, -4];
    widget.draw = () => {};
    widget.hidden = true;
    widget.options = { ...(widget.options || {}), hideInVueNodes: true };
  }
}

function updateShell(runtime) {
  const snapshot = runtime.getSnapshot();
  const metaParts = [];
  if (snapshot.fps) metaParts.push(`${snapshot.fps} fps`);
  if (snapshot.durationSeconds) metaParts.push(`${snapshot.durationSeconds.toFixed(1)} s`);
  if (snapshot.width && snapshot.height) metaParts.push(`${snapshot.width}x${snapshot.height}`);
  runtime.shell?.setTitle(snapshot.sceneName || t("OmniCam Director"));
  runtime.shell?.setDirty(snapshot.isDirty);
  runtime.shell?.setMeta(metaParts.join("  |  "));
  runtime.shell?.setStatus(
    runtime.recordNotice || `${snapshot.cameraCount} ${t("cameras")}  |  ${snapshot.objectCount} ${t("objects")}`,
  );
  // Live-mirrors onto the open workbench's own top bar, if one is mounted
  // right now (DirectorInlineView.expand() sets/clears this ref).
  runtime.activeWorkbenchHost?.setTitle(snapshot.sceneName || t("OmniCam Director"));
  runtime.activeWorkbenchHost?.setDirty(snapshot.isDirty);
  // The live inline editor replaces the card preview entirely; otherwise the
  // recorded playblast video wins over the single downscaled still frame
  // whenever one is available -- see refreshDirectorPreview() below.
  if (runtime.inlineView?.ui) {
    runtime.shell?.setPreviewVideo(null);
    runtime.shell?.setPreview(null);
  } else if (runtime.previewVideoUrl) {
    runtime.shell?.setPreviewVideo(runtime.previewVideoUrl);
  } else {
    runtime.shell?.setPreviewVideo(null);
    runtime.shell?.setPreview(snapshot.previewDataUrl ?? null);
  }
}

//: Thumbnail size the static card's preview <img> is scaled to. Small on
//: purpose -- it only stands in for a retired live view -- so the captured
//: dataURL stays cheap to hold in memory across many nodes.
const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = 135;

/**
 * Grab a small downscaled still of the active camera's rendered viewport and
 * store it on the runtime, for the compact shell to show while the workbench
 * is closed. `ui.canvas` is the workbench's own 2-D viewport canvas
 * (web-src/director.js's OmniCamDirectorUI): every render() already
 * composites the current WebGL frame (or the Canvas-2D fallback) into it via
 * drawImage (web-src/director/methods/render.js), so it always holds
 * whatever the viewport last showed -- no need to reach into the three.js
 * renderer directly. Best-effort: swallows any failure rather than blocking
 * the close.
 */
function captureDirectorPreview(runtime, ui) {
  try {
    const source = ui?.canvas;
    if (!source || !source.width || !source.height) return;
    const offscreen = document.createElement("canvas");
    offscreen.width = PREVIEW_WIDTH;
    offscreen.height = PREVIEW_HEIGHT;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(source, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    runtime.previewDataUrl = offscreen.toDataURL("image/webp", 0.7);
    updateShell(runtime);
  } catch (error) {
    console.warn("[OmniCam] Director preview capture failed", error);
  }
}

/**
 * Resolve the compact shell's preview at workbench-close time: prefer the
 * node's own recorded playblast (directorPlayblastSource() -- same resolver
 * Monitor uses for its live player, reading the `recording_path` widget) so
 * the closed box can play the actual recording, and fall back to a single
 * downscaled still frame of the viewport (captureDirectorPreview()) when
 * nothing has been recorded yet. Best-effort, mirrors the still-frame path's
 * own swallow-and-warn behavior.
 */
function refreshDirectorPreview(runtime, ui) {
  try {
    const source = directorPlayblastSource(api, runtime.node);
    if (source) {
      runtime.previewVideoUrl = source.url;
      updateShell(runtime);
      return;
    }
  } catch (error) {
    console.warn("[OmniCam] Director playblast preview lookup failed", error);
  }
  runtime.previewVideoUrl = null;
  captureDirectorPreview(runtime, ui);
}

/**
 * The node's REC button: records the playblast with the live inline editor,
 * bringing it up first if the node had been retired to its card -- no modal.
 * The card shows the frame progress and then how it went, for a few seconds.
 */
async function recordPlayblast(runtime) {
  if (runtime.shellRecording) return;
  runtime.shellRecording = true;
  runtime.shell.setRecording(true, "…");
  let outcome = { ok: false, message: t("The Director editor could not be started") };
  try {
    const ui = await runtime.inlineView.show();
    if (ui) {
      await ui.webglReady;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      outcome = await ui.makePlayblast({ inline: true });
    } else notifyCompletion(runtime, outcome.message, "error");
  } catch (error) {
    outcome = { ok: false, message: t("Playblast failed: {value1}", { value1: error.message || error }) };
    notifyCompletion(runtime, outcome.message, "error");
  } finally {
    runtime.shellRecording = false;
    runtime.shell.setRecording(false);
    runtime.shell.setProgress(null);
    runtime.recordNotice = outcome.message;
    clearTimeout(runtime.recordNoticeTimer);
    runtime.recordNoticeTimer = setTimeout(() => {
      runtime.recordNotice = "";
      updateShell(runtime);
    }, RECORD_NOTICE_MS);
    updateShell(runtime);
  }
}

export function attachDirectorShell(node) {
  if (node.__majoorOmniCamDirectorRuntime) return node.__majoorOmniCamDirectorRuntime;

  const runtime = new DirectorRuntime(node, { app, api });

  // Semantic API and external Agent bridge target the runtime directly, so
  // they work identically whether or not a workbench is open (plan Tasks 7-8).
  attachDirectorApi(runtime);
  try {
    runtime.agentBridge = createDirectorAgentBridge(runtime, node, api);
  } catch (error) {
    console.warn("[OmniCam] Agent bridge unavailable", error);
  }

  hideInternalWidgets(node);

  const widgetRoot = document.createElement("div");
  widgetRoot.className = "oc-director-node";
  widgetRoot.dataset.live = "false";
  const inlineHost = document.createElement("div");
  inlineHost.className = "oc-director-inline";
  const inlineView = new DirectorInlineView(runtime, {
    container: inlineHost,
    onLiveChange: (live) => {
      widgetRoot.dataset.live = String(live);
      updateShell(runtime);
    },
    onRetire: (ui) => refreshDirectorPreview(runtime, ui),
  });
  runtime.inlineView = inlineView;

  const shell = createNodeShell({
    kind: "director",
    title: t("OmniCam Director"),
    buttonLabel: t("OPEN DIRECTOR"),
    onOpen: (event) => { void inlineView.expand(event.currentTarget); },
    secondaryLabel: t("LIVE VIEW"),
    onSecondary: () => { void inlineView.show(); },
    recordLabel: t("● REC"),
    recordTitle: t("Record the playblast without opening the editor"),
    onRecord: () => { void recordPlayblast(runtime); },
  });
  runtime.shell = shell;
  runtime.addEventListener("playblastprogress", (event) => {
    if (!runtime.shellRecording) return;
    const { frame, total } = event.detail;
    shell.setRecording(true, `${frame}/${total}`);
    shell.setProgress(frame / total);
  });
  widgetRoot.append(shell.root, inlineHost);
  const appStyles = document.createElement("style");
  appStyles.textContent = DIRECTOR_APP_MODE_STYLES;
  widgetRoot.append(appStyles);
  updateShell(runtime);
  runtime.addEventListener("statechange", () => updateShell(runtime));
  runtime.addEventListener("statuschange", () => updateShell(runtime));
  runtime.addEventListener("upstreamchange", () => updateShell(runtime));

  node.__majoorOmniCamDirectorRuntime = runtime;
  node.addDOMWidget("majoor_omnicam_director_shell", "omnicam", widgetRoot, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => MIN_WIDGET_HEIGHT,
  });
  inlineView.showWhenVisible(widgetRoot);
  const detachAppMode = attachDirectorAppMode(widgetRoot, inlineView);

  // Graph lifecycle lives here, on the node, for the runtime's full life --
  // not inside the transient workbench (plan Task 6). Each hook does the full
  // DOM-aware resync when a workbench is open, or a state-only headless one
  // (deferring media/asset resync until the next open) when it is not.
  const scheduleRestore = () => {
    cancelAnimationFrame(runtime.restoreFrame);
    runtime.restoreFrame = requestAnimationFrame(() => {
      if (runtime.disposed) return;
      if (runtime.workbench) {
        runtime.workbench.restoreFromWidgets();
        runtime.workbench.syncUpstreamInputs();
      } else {
        runtime.restoreFromWidgetsHeadless();
        runtime.pendingUpstreamResync = true;
      }
    });
  };
  const originalConfigure = node.onConfigure;
  node.onConfigure = function (...args) {
    // A request may arrive before the RAF restore. Invalidate it immediately.
    invalidateDirectorRevision(runtime);
    runtime.agentBridge?.invalidateDocument?.();
    originalConfigure?.apply(this, args);
    scheduleRestore();
  };
  const originalAfterGraphConfigured = node.onAfterGraphConfigured;
  node.onAfterGraphConfigured = function (...args) {
    originalAfterGraphConfigured?.apply(this, args);
    scheduleRestore();
  };

  const resyncUpstream = () => {
    clearTimeout(runtime.connectionTimer);
    runtime.connectionTimer = setTimeout(() => {
      if (runtime.disposed) return;
      if (runtime.workbench) {
        runtime.workbench.syncUpstreamInputs();
      } else {
        runtime.pendingUpstreamResync = true;
      }
      node.setDirtyCanvas?.(true, true);
    }, 60);
  };
  const originalConnectionsChange = node.onConnectionsChange;
  node.onConnectionsChange = function (...args) {
    originalConnectionsChange?.apply(this, args);
    resyncUpstream();
  };
  // Backstop: some builds do not deliver onConnectionsChange here when the
  // change starts elsewhere (upstream node removed, link re-routed).
  const unwatchGraphConnections = watchGraphConnections(node, resyncUpstream);

  const originalResize = node.onResize;
  node.onResize = function (...args) {
    originalResize?.apply(this, args);
    runtime.workbench?.scheduleResizeAndRender?.();
  };

  const originalExecuted = node.onExecuted;
  node.onExecuted = function (message) {
    originalExecuted?.apply(this, arguments);
    // Execution preview is a visual-only feature; deferred until the
    // workbench is next opened when it is currently closed.
    if (runtime.workbench) {
      runtime.workbench.loadExecutionPreview(message);
      runtime.workbench.syncUpstreamInputs();
    }
  };

  const originalRemoved = node.onRemoved;
  node.onRemoved = function (...args) {
    workbenchSessions.disposeForNode(node.id);
    clearTimeout(runtime.recordNoticeTimer);
    detachAppMode();
    inlineView.dispose();
    unwatchGraphConnections();
    cancelAnimationFrame(runtime.restoreFrame);
    clearTimeout(runtime.connectionTimer);
    runtime.agentBridge?.dispose?.();
    shell.dispose();
    runtime.dispose();
    originalRemoved?.apply(this, args);
  };

  return runtime;
}
