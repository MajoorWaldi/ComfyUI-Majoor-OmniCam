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
  const status = node.__majoorOmniCamMonitorRuntime?.status || t("Ready");
  shell.setStatus(status);
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
          closeMonitorWorkbench(ui);
          host.dispose();
          return true;
        },
        dispose: () => {
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
