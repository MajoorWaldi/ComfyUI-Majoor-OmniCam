export const MONITOR_PREFLIGHT_EVENT = "majoor.omnicam.monitor.preflight";
export const MONITOR_PREFLIGHT_EVENT_VERSION = 1;

export function bindMonitorPreflightEvents(api, node, ui) {
  const handler = (event) => {
    const detail = event?.detail;
    if (!detail || Number(detail.schema_version) !== MONITOR_PREFLIGHT_EVENT_VERSION) return;
    if (detail.kind !== "blocked_preflight") return;
    if (String(detail.node) !== String(node.id)) return;
    if (!detail.output || ui.disposed) return;

    ui.blockedPreflight(detail.output);
  };

  api.addEventListener(MONITOR_PREFLIGHT_EVENT, handler);

  return () => {
    api.removeEventListener?.(MONITOR_PREFLIGHT_EVENT, handler);
  };
}
