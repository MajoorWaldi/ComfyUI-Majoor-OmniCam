import { diagnosticState, escapeHtml } from "./html.js";

/**
 * The Monitor's headline answer. Every row here is a fact read from the
 * installed downstream node, except the clearly labelled motion-risk row,
 * which is reported and deliberately excluded from the verdict.
 */
export function renderPreflight(container, preflight) {
  if (!preflight) { container.innerHTML = '<div class="oc-empty">No preflight data</div>'; return; }
  const rows = (preflight.checks || []).map((check) => {
    const state = diagnosticState(check.state);
    const label = state === "pass" ? "&#10003;" : state === "risk" ? "&#9651;" : state === "warning" ? "&#9651;" : "&#10007;";
    return `<div class="oc-row"><span><strong>${label} ${escapeHtml(check.label || check.id)}</strong>${check.message ? `<br><small>${escapeHtml(check.message)}</small>` : ""}</span><span class="oc-state" data-state="${state}">${state.toUpperCase()}</span></div>`;
  }).join("");
  // Checks already carry their own failure text, so only an issue that no
  // check surfaced is worth a second row.
  const shown = new Set((preflight.checks || []).map((check) => String(check.message || "")));
  const extra = (preflight.issues || []).filter((issue) => !shown.has(String(issue.message || ""))).map((issue) => {
    const severity = issue.severity === "error" ? "blocked" : "warning";
    return `<div class="oc-row"><small>${escapeHtml(issue.message)}</small><span class="oc-state" data-state="${severity}">${escapeHtml(issue.severity).toUpperCase()}</span></div>`;
  }).join("");
  const state = diagnosticState(preflight.state);
  container.innerHTML = `<div class="oc-row"><strong>${escapeHtml(preflight.adapter)}</strong><span class="oc-state" data-state="${state}">${escapeHtml(preflight.state)}</span></div>${rows}${extra}`;
}
