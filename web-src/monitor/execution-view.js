import { t } from "../i18n.js";
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
  const finalPrompt = unwrap(payload.final_prompt);
  return {
    targetProfile: typeof targetProfile === "string" ? targetProfile : "",
    finalPrompt: typeof finalPrompt === "string" ? finalPrompt : "",
    preflight: Array.isArray(preflight) ? preflight : [],
    capabilities: capabilities && typeof capabilities === "object"
      ? capabilities
      : { capabilities: [] },
  };
}

function suggestionsMarkup(check) {
  if (!Array.isArray(check.suggestions) || !check.suggestions.length) return "";
  return `<ul class="oc-suggestions">${check.suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function checkMarkup(check) {
  const state = diagnosticState(check.state);
  const message = check.message ? `<br><small>${escapeHtml(check.message)}</small>` : "";
  const recoverable = check.recoverable ? ` <span class="oc-recoverable">${escapeHtml(t("recoverable"))}</span>` : "";
  return `<div class="oc-row"${check.code ? ` data-code="${escapeHtml(check.code)}"` : ""}><span><strong>${escapeHtml(check.label || check.id)}</strong>${recoverable}${message}${suggestionsMarkup(check)}</span><span class="oc-state" data-state="${state}">${escapeHtml(check.state || "UNKNOWN")}</span></div>`;
}

function mappingQualityMarkup(check) {
  const message = check.message ? `<br><small>${escapeHtml(check.message)}</small>` : "";
  return `<div class="oc-row"><span><strong>${escapeHtml(check.label || check.id)}</strong>${message}${suggestionsMarkup(check)}</span><span class="oc-mapping-quality" data-quality="${escapeHtml(check.mapping_quality)}">${escapeHtml(check.mapping_quality)}</span></div>`;
}

function isGuideHealthCheck(check) {
  return String(check.id || "").startsWith("guide_health_");
}

/**
 * What the status line says once the panel is rendered.
 *
 * A blocked preflight publishes this panel and then stops the run, so there is
 * no output behind it. Saying otherwise is how a red panel still reads as a
 * successful compile.
 *
 * `live` distinguishes a preview computed without queuing anything from an
 * actual completed execution: t("OUTPUT GENERATED") is a claim about a real run,
 * and a live snapshot has not run one. Defaults to `false` so every existing
 * two-argument call keeps its exact current wording.
 */
export function outputStatusText(blocked, targetProfile, live = false) {
  const status = live
    ? (blocked ? t("LIVE — WOULD BLOCK") : t("LIVE PREVIEW"))
    : (blocked ? t("NO OUTPUT") : t("OUTPUT GENERATED"));
  return targetProfile ? `${status} · ${targetProfile}` : status;
}

export function renderMonitorExecution(root, message, { live = false } = {}) {
  const result = normalizeMonitorExecution(message);

  // Doc section 13's Compilation Diff and Guide Health are both just Checks
  // with a distinguishing marker (mapping_quality / a guide_health_ id
  // prefix) -- grouped for display, not a separate backend data shape.
  const diffChecks = result.preflight.filter((check) => check.mapping_quality);
  const healthChecks = result.preflight.filter(isGuideHealthCheck);
  const generalChecks = result.preflight.filter((check) => !check.mapping_quality && !isGuideHealthCheck(check));

  const prompt = root.querySelector('[data-role="compiled-prompt"]');
  if (prompt) {
    if (result.finalPrompt) {
      prompt.textContent = result.finalPrompt;
      prompt.classList.remove("oc-empty");
      prompt.dataset.empty = "0";
    } else {
      prompt.textContent = t("Queue the workflow, or edit the connected Director live, to compile a prompt.");
      prompt.classList.add("oc-empty");
      prompt.dataset.empty = "1";
    }
  }

  const preflight = root.querySelector('[data-role="profile-preflight"]');
  preflight.innerHTML = generalChecks.length
    ? generalChecks.map(checkMarkup).join("")
    : `<div class="oc-empty">${escapeHtml(t("No preflight checks returned."))}</div>`;

  const diff = root.querySelector('[data-role="profile-diff"]');
  if (diff) {
    diff.innerHTML = diffChecks.length
      ? diffChecks.map(mappingQualityMarkup).join("")
      : `<div class="oc-empty">${escapeHtml(t("No mapping-quality diagnostics for this compile."))}</div>`;
  }

  const health = root.querySelector('[data-role="profile-health"]');
  if (health) {
    health.innerHTML = healthChecks.length
      ? healthChecks.map(checkMarkup).join("")
      : `<div class="oc-empty">${escapeHtml(t("No guide-health warnings."))}</div>`;
  }

  const entries = Array.isArray(result.capabilities.capabilities)
    ? result.capabilities.capabilities
    : [];
  const capabilities = root.querySelector('[data-role="profile-capabilities"]');
  capabilities.innerHTML = entries.length
    ? entries.map((entry) => `<div class="oc-row"><span>${escapeHtml(entry.display || entry.adapter)}</span><span class="oc-state" data-state="${diagnosticState(entry.state)}">${escapeHtml(entry.state)}</span></div>`).join("")
    : `<div class="oc-empty">${escapeHtml(t("No optional downstream capability detected."))}</div>`;

  const blocked = result.preflight.some((check) => String(check.state).toUpperCase() === t("BLOCKED"));
  const badge = root.querySelector('[data-role="monitor-status"]');
  badge.dataset.state = blocked ? t("BLOCKED") : t("READY");
  badge.lastChild.textContent = blocked ? " " + t("BLOCKED") : " " + t("READY");
  root.querySelector('[data-role="output-status"]').textContent =
    outputStatusText(blocked, result.targetProfile, live);
  return result;
}
