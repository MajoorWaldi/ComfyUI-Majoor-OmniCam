// Execution state belongs to the node, independent of the transient workbench.
import { t } from "../i18n.js";
import { normalizeMonitorExecution } from "./execution-view.js";
import { bindMonitorPreflightEvents } from "./preflight-events.js";

export class MonitorRuntime extends EventTarget {
  constructor(node, api) {
    super();
    this.node = node;
    this.disposed = false;
    this.result = null;
    this.executed = false;
    this.status = t("Ready");
    // Best-effort still frame of the playblast preview, captured by
    // monitor/shell.js at workbench-close time only. Pure in-memory visual
    // convenience for the compact shell -- never serialized.
    this.previewDataUrl = null;
    // URL of the playblast video currently loaded in the workbench's player
    // (MonitorUI.currentPlayblastVideoUrl()), refreshed by monitor/shell.js's
    // captureMonitorPreview() at the same workbench-close moment. When set,
    // the compact shell plays this instead of previewDataUrl above. Also
    // pure in-memory, never serialized.
    this.previewVideoUrl = null;
    this.unsubscribe = bindMonitorPreflightEvents(api, node, this);
  }

  receive(message, executed = true) {
    if (this.disposed) return;
    this.result = structuredClone(message);
    this.executed = executed;
    const result = normalizeMonitorExecution(message);
    this.status = result.preflight.some(check => check.state === "BLOCKED")
      ? t("Blocked") : t("Output generated");
    const ui = this.node.__majoorOmniCamMonitorWorkbench;
    if (ui && !ui.disposed) this.restore(ui);
    this.dispatchEvent(new Event("change"));
  }

  blockedPreflight(message) { this.receive(message, false); }

  restore(ui) {
    if (!this.result) return;
    if (this.executed) ui.executed(this.result);
    else ui.blockedPreflight(this.result);
  }

  dispose() {
    this.disposed = true;
    this.unsubscribe?.();
    this.result = null;
  }
}
