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
