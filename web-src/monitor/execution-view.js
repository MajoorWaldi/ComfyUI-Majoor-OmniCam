import { diagnosticState, escapeHtml } from "./html.js";

function unwrap(value) {
  return Array.isArray(value) && value.length === 1 ? value[0] : value;
}

export function normalizeMonitorExecution(message) {
  const payload = message?.ui && typeof message.ui === "object" ? message.ui : (message || {});
  const preflight = Array.isArray(payload.preflight)
    && payload.preflight.length === 1
    && Array.isArray(payload.preflight[0])
    ? payload.preflight[0]
    : payload.preflight;
  const capabilities = unwrap(payload.capabilities);
  const targetProfile = unwrap(payload.target_profile);
  return {
    targetProfile: typeof targetProfile === "string" ? targetProfile : "",
    preflight: Array.isArray(preflight) ? preflight : [],
    capabilities: capabilities && typeof capabilities === "object"
      ? capabilities
      : { capabilities: [] },
  };
}

function checkMarkup(check) {
  const state = diagnosticState(check.state);
  const message = check.message ? `<br><small>${escapeHtml(check.message)}</small>` : "";
  return `<div class="oc-row"><span><strong>${escapeHtml(check.label || check.id)}</strong>${message}</span><span class="oc-state" data-state="${state}">${escapeHtml(check.state || "UNKNOWN")}</span></div>`;
}

/**
 * What the status line says once the panel is rendered.
 *
 * A blocked preflight publishes this panel and then stops the run, so there is
 * no output behind it. Saying otherwise is how a red panel still reads as a
 * successful compile.
 *
 * `live` distinguishes a preview computed without queuing anything from an
 * actual completed execution: "OUTPUT GENERATED" is a claim about a real run,
 * and a live snapshot has not run one. Defaults to `false` so every existing
 * two-argument call keeps its exact current wording.
 */
export function outputStatusText(blocked, targetProfile, live = false) {
  const status = live
    ? (blocked ? "LIVE — WOULD BLOCK" : "LIVE PREVIEW")
    : (blocked ? "NO OUTPUT" : "OUTPUT GENERATED");
  return targetProfile ? `${status} · ${targetProfile}` : status;
}

export function renderMonitorExecution(root, message, { live = false } = {}) {
  const result = normalizeMonitorExecution(message);
  const preflight = root.querySelector('[data-role="profile-preflight"]');
  preflight.innerHTML = result.preflight.length
    ? result.preflight.map(checkMarkup).join("")
    : '<div class="oc-empty">No preflight checks returned.</div>';

  const entries = Array.isArray(result.capabilities.capabilities)
    ? result.capabilities.capabilities
    : [];
  const capabilities = root.querySelector('[data-role="profile-capabilities"]');
  capabilities.innerHTML = entries.length
    ? entries.map((entry) => `<div class="oc-row"><span>${escapeHtml(entry.display || entry.adapter)}</span><span class="oc-state" data-state="${diagnosticState(entry.state)}">${escapeHtml(entry.state)}</span></div>`).join("")
    : '<div class="oc-empty">No optional downstream capability detected.</div>';

  const blocked = result.preflight.some((check) => String(check.state).toUpperCase() === "BLOCKED");
  const badge = root.querySelector('[data-role="monitor-status"]');
  badge.dataset.state = blocked ? "BLOCKED" : "READY";
  badge.lastChild.textContent = blocked ? " BLOCKED" : " READY";
  root.querySelector('[data-role="output-status"]').textContent =
    outputStatusText(blocked, result.targetProfile, live);
  return result;
}
