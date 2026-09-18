// Lazy shell entry point for the OmniCam Director node -- the only Director
// module main.js's nodeCreated() imports (migration plan Task 10). Builds a
// persistent DirectorRuntime plus a compact always-mounted DOMWidget with an
// "OPEN DIRECTOR" button; the full editor (web-src/director.js, its ~30
// method modules and, on demand, three.js) loads only when that button is
// pressed.

import { app, api } from "../comfy-runtime.js";
import { t } from "../i18n.js";
import { DirectorRuntime } from "./runtime.js";
import { attachDirectorApi } from "../director-api/index.js";
import { createDirectorAgentBridge } from "../agent/bridge.js";
import { watchGraphConnections } from "../graph-connection-watch.js";
import { createNodeShell } from "../workbench/node-shell.js";
import { WorkbenchHost } from "../workbench/host.js";
import { workbenchSessions } from "../workbench/session-manager.js";

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
  runtime.shell?.setMeta(metaParts.join("  |  "));
  runtime.shell?.setStatus(
    `${snapshot.cameraCount} ${t("cameras")}  |  ${snapshot.objectCount} ${t("objects")}`,
  );
}

function sessionKeyFor(node) {
  return `director:${node.id}`;
}

async function openDirectorWorkbenchSession(runtime, opener) {
  return workbenchSessions.open({
    key: sessionKeyFor(runtime.node),
    nodeId: runtime.node.id,
    opener,
    createSession: async () => {
      const generation = ++runtime.workbenchGeneration;
      const { openDirectorWorkbench, closeDirectorWorkbench } = await import("../director.js");
      // The node may have been removed, or another open already superseded
      // this one, while the chunk above was in flight (plan section 29).
      if (runtime.disposed || generation !== runtime.workbenchGeneration) return null;

      const ui = openDirectorWorkbench(runtime);
      if (runtime.pendingUpstreamResync) {
        runtime.pendingUpstreamResync = false;
        ui.syncUpstreamInputs?.();
      }

      const key = sessionKeyFor(runtime.node);
      const host = new WorkbenchHost({
        kind: "director",
        nodeId: runtime.node.id,
        title: runtime.getSnapshot().sceneName || t("OmniCam Director"),
        onRequestClose: (reason) => workbenchSessions.close(key, reason),
        onResize: () => ui.scheduleResizeAndRender?.(),
      });
      host.mount(ui.root);

      return {
        key,
        nodeId: runtime.node.id,
        host,
        close: async () => {
          // A playblast recording (deterministic encode or the realtime
          // fallback, web-src/record.js's makePlayblast) is a
          // non-interruptible finalization window: closing here would abort
          // an in-flight encode/upload with no way to resume it (plan
          // section 15 / non-negotiable behavior 8). Node removal still
          // tears the workbench down regardless -- see dispose() below.
          if (ui.recording) {
            ui.setStatus?.(t("Cannot close Director while a playblast is recording"));
            return false;
          }
          ui.serialize?.();
          closeDirectorWorkbench(ui);
          host.dispose();
          return true;
        },
        dispose: () => {
          closeDirectorWorkbench(ui);
          host.dispose();
        },
      };
    },
  });
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

  const shell = createNodeShell({
    kind: "director",
    title: t("OmniCam Director"),
    buttonLabel: t("OPEN DIRECTOR"),
    onOpen: (event) => { void openDirectorWorkbenchSession(runtime, event.currentTarget); },
  });
  runtime.shell = shell;
  updateShell(runtime);
  runtime.addEventListener("statechange", () => updateShell(runtime));
  runtime.addEventListener("statuschange", () => updateShell(runtime));
  runtime.addEventListener("upstreamchange", () => updateShell(runtime));

  node.__majoorOmniCamDirectorRuntime = runtime;
  node.addDOMWidget("majoor_omnicam_director_shell", "omnicam", shell.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 124,
    getHeight: () => 124,
    getMaxHeight: () => 124,
  });

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
