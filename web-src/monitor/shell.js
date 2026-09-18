// Lazy shell entry point for the OmniCam Monitor node.
// Builds a compact always-mounted DOMWidget with an "OPEN MONITOR" button;
// the full preflight / compiler workbench loads on demand in a modal WorkbenchHost.

import { t } from "../i18n.js";
import { api } from "../comfy-runtime.js";
import { MonitorRuntime } from "./runtime.js";
import { createNodeShell } from "../workbench/node-shell.js";
import { WorkbenchHost } from "../workbench/host.js";
import { workbenchSessions } from "../workbench/session-manager.js";
import { hideMonitorParameters, monitorWidgetValues } from "./widget-contract.js";

function updateShell(node, shell) {
  const values = monitorWidgetValues(node);
  const profile = values.target_profile || "external_reference_video";
  const profilePretty = profile.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  shell.setTitle(t("OmniCam Monitor"));
  shell.setMeta(`${t("Target")}: ${profilePretty}`);
  const runtime = node.__majoorOmniCamMonitorRuntime;
  shell.setStatus(runtime?.status || t("Ready"));
  // The playblast video wins over the single still frame whenever one is
  // available -- see captureMonitorPreview() below.
  if (runtime?.previewVideoUrl) {
    shell.setPreviewVideo(runtime.previewVideoUrl);
  } else {
    shell.setPreviewVideo(null);
    shell.setPreview(runtime?.previewDataUrl ?? null);
  }
}

/**
 * Best-effort preview capture at workbench-close time only (never a
 * poll/interval). Prefers MonitorUI.currentPlayblastVideoUrl() (monitor/
 * index.js) -- the URL of whichever playblast video is actually loaded in
 * the player -- and only falls back to a downscaled still-frame capture
 * (capturePreviewDataUrl(), which knows whether the playblast <video> or the
 * upstream-preview canvas is currently showing) when there is no video URL,
 * e.g. nothing connected/recorded yet.
 */
async function captureMonitorPreview(node, shell) {
  try {
    const runtime = node.__majoorOmniCamMonitorRuntime;
    const ui = node.__majoorOmniCamMonitorWorkbench;
    const videoUrl = ui?.currentPlayblastVideoUrl?.() || "";
    if (runtime) runtime.previewVideoUrl = videoUrl || null;
    if (!videoUrl) {
      const dataUrl = await ui?.capturePreviewDataUrl?.();
      if (runtime && dataUrl) runtime.previewDataUrl = dataUrl;
    }
    updateShell(node, shell);
  } catch (error) {
    console.warn("[OmniCam] Monitor preview capture failed", error);
  }
}

function sessionKeyFor(node) {
  return `monitor:${node.id}`;
}

async function openMonitorWorkbenchSession(node, opener) {
  const key = sessionKeyFor(node);
  return workbenchSessions.open({
    key,
    nodeId: node.id,
    opener,
    createSession: async () => {
      const { openMonitorWorkbench, closeMonitorWorkbench } = await import("./index.js");
      if (node.__majoorOmniCamMonitorRuntime?.disposed) return null;
      const ui = openMonitorWorkbench(node);
      const host = new WorkbenchHost({
        kind: "monitor",
        nodeId: node.id,
        title: t("OmniCam Monitor"),
        onRequestClose: (reason) => workbenchSessions.close(key, reason),
        onResize: () => ui.refreshPlayblastPreview?.(),
      });
      host.mount(ui.root);

      return {
        key,
        nodeId: node.id,
        host,
        close: async () => {
          await captureMonitorPreview(node, node.__majoorOmniCamMonitorShell);
          closeMonitorWorkbench(ui);
          host.dispose();
          return true;
        },
        dispose: () => {
          void captureMonitorPreview(node, node.__majoorOmniCamMonitorShell);
          closeMonitorWorkbench(ui);
          host.dispose();
        },
      };
    },
  });
}

export function attachMonitorShell(node) {
  if (node.__majoorOmniCamMonitorShell) return node.__majoorOmniCamMonitorShell;

  hideMonitorParameters(node);
  const runtime = new MonitorRuntime(node, api);
  node.__majoorOmniCamMonitorRuntime = runtime;

  const shell = createNodeShell({
    kind: "monitor",
    title: t("OmniCam Monitor"),
    buttonLabel: t("OPEN MONITOR"),
    onOpen: (event) => { void openMonitorWorkbenchSession(node, event.currentTarget); },
  });

  node.__majoorOmniCamMonitorShell = shell;
  node.__majoorOmniCamMonitor = shell;
  runtime.shell = shell;
  runtime.addEventListener("change", () => updateShell(node, shell));
  node.openMonitorWorkbench = (opener) => openMonitorWorkbenchSession(node, opener);
  updateShell(node, shell);

  node.addDOMWidget("majoor_omnicam_monitor_shell", "omnicam", shell.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 124,
    getHeight: () => 124,
    getMaxHeight: () => 124,
  });

  const originalRemoved = node.onRemoved;
  node.onRemoved = function (...args) {
    workbenchSessions.disposeForNode(node.id);
    runtime.dispose();
    shell.dispose?.();
    originalRemoved?.apply(this, args);
  };

  const originalExecuted = node.onExecuted;
  node.onExecuted = function (message) {
    originalExecuted?.apply(this, arguments);
    runtime.receive(message);
    updateShell(node, shell);
  };

  const originalConfigure = node.onConfigure;
  node.onConfigure = function (...args) {
    originalConfigure?.apply(this, args);
    updateShell(node, shell);
  };

  const originalConnectionsChange = node.onConnectionsChange;
  node.onConnectionsChange = function (...args) {
    originalConnectionsChange?.apply(this, args);
    updateShell(node, shell);
  };

  return shell;
}
