import { diagnosticState, escapeHtml } from "./html.js";

export function renderHealth(container, health) {
  if (!health) { container.innerHTML = '<div class="oc-empty">No health data</div>'; return; }
  const rows = (health.metrics || []).map((metric) => {
    const state = diagnosticState(metric.state);
    return `<div class="oc-row"><span><strong>${escapeHtml(metric.label)}</strong>${metric.message ? `<br><small>${escapeHtml(metric.message)}</small>` : ""}</span><span><span>${escapeHtml(metric.value)}${metric.unit ? ` ${escapeHtml(metric.unit)}` : ""}</span><br><span class="oc-state" data-state="${state}">${state.toUpperCase()}</span></span></div>`;
  }).join("");
  const state = diagnosticState(health.state);
  container.innerHTML = `<div class="oc-row"><strong>Camera track</strong><span class="oc-state" data-state="${state}">${escapeHtml(health.state)}</span></div>${rows || '<div class="oc-empty">No metrics</div>'}`;
}
