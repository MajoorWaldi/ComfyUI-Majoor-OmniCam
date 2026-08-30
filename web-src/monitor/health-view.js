import { diagnosticState, escapeHtml } from "./html.js";

/**
 * Track validity and motion risk are two different claims and are labelled as
 * two different claims. The risk numbers are graded against OmniCam limit
 * tables that no upstream project publishes, and OmniCam world units have no
 * metric meaning, so presenting them as model limits was never honest.
 */
export function renderHealth(container, health) {
  if (!health) { container.innerHTML = '<div class="oc-empty">No health data</div>'; return; }
  const rows = (health.metrics || []).map((metric) => {
    const state = diagnosticState(metric.state);
    const recommended = metric.recommended_max == null
      ? ""
      : `<br><small>over the ${escapeHtml(metric.recommended_max)} heuristic guide</small>`;
    return `<div class="oc-row"><span><strong>${escapeHtml(metric.label)}</strong>${recommended}</span><span><span>${escapeHtml(metric.value)}${metric.unit ? ` ${escapeHtml(metric.unit)}` : ""}</span><br><span class="oc-state" data-state="${state}">${state.toUpperCase()}</span></span></div>`;
  }).join("");
  const state = diagnosticState(health.state);
  const risk = String(health.risk || "LOW");
  const reasons = (health.risk_reasons || []).join(", ");
  const riskRow = `<div class="oc-row"><span><strong>Motion risk</strong><br><small>Experimental OmniCam estimate for the ${escapeHtml(health.profile || "generic")} profile${reasons ? `: ${escapeHtml(reasons)}` : ""}. Not a published model limit.</small></span><span class="oc-state" data-state="risk">${escapeHtml(risk)}</span></div>`;
  container.innerHTML = `<div class="oc-row"><strong>Track validity</strong><span class="oc-state" data-state="${state}">${escapeHtml(health.state)}</span></div>${riskRow}${rows || '<div class="oc-empty">No metrics</div>'}`;
}
