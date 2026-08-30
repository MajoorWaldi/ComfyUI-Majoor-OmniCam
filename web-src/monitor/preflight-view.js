import { diagnosticState, escapeHtml } from "./html.js";

export function renderPreflight(container, preflight) {
  if (!preflight) { container.innerHTML = '<div class="oc-empty">No preflight data</div>'; return; }
  const rows = (preflight.checks || []).map((check) => {
    const state = diagnosticState(check.state);
    return `<div class="oc-row"><span><strong>${escapeHtml(check.label || check.id)}</strong>${check.message ? `<br><small>${escapeHtml(check.message)}</small>` : ""}</span><span class="oc-state" data-state="${state}">${state.toUpperCase()}</span></div>`;
  }).join("");
  const issues = (preflight.issues || []).map((issue) => {
    const state = issue.severity === "error" ? "blocked" : "warning";
    return `<div class="oc-row"><small>${escapeHtml(issue.message)}</small><span class="oc-state" data-state="${state}">${escapeHtml(issue.severity).toUpperCase()}</span></div>`;
  }).join("");
  const state = diagnosticState(preflight.state);
  container.innerHTML = `<div class="oc-row"><strong>${escapeHtml(preflight.adapter)}</strong><span class="oc-state" data-state="${state}">${escapeHtml(preflight.state)}</span></div>${rows}${issues}`;
}
