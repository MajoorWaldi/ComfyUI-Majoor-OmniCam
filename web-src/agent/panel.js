// The Director Agent tab: describe a shot, generate a bounded Preview
// against the live Director session, review the semantic diff, then Apply
// or discard (design spec section 32). Also owns the provider credential
// row (Replace/Remove/Test) -- deliberately NOT a ComfyUI settings entry,
// since a settings item always persists through the ordinary setting
// setter and this must never touch comfy.settings.json (see
// web-src/settings/catalogue.js's Agent section comment).
//
// Lazy-loaded: only imported the first time the AGENT tab is opened
// (web-src/director.js's onAgentFirstOpen), so it never adds to the eager
// production chunk.

import { t } from "../i18n.js";
import {
  SETTING_AGENT_PROVIDER, agentModelSettingId, agentSettings, writeSetting,
} from "../settings.js";
import { applyPlan, requestPlan } from "./plan-client.js";
import {
  deleteProviderCredential,
  getProviderStatus,
  listProviderModels,
  listProviders,
  setProviderCredential,
  testProvider,
} from "./provider-client.js";

const PROVIDER_LABELS = {
  ollama: "Ollama",
  openai: "OpenAI",
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic",
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Walk up from a click target to the Agent panel action it represents. */
export function resolveAgentIntent(target) {
  if (!target || !target.closest) return null;
  const actBtn = target.closest("[data-agent-act]");
  if (actBtn) return { action: actBtn.dataset.agentAct };
  return null;
}

export function planChangesMarkup(changes) {
  if (!changes || !changes.length) return `<li class="oc-asset-empty">${t("No visible changes")}</li>`;
  return changes
    .map((change) => `<li>${escapeHtml(change.entity)} · ${escapeHtml(change.field)}</li>`)
    .join("");
}

/** True for a loopback host (127.0.0.1/localhost/::1) or an empty override
 * (which means "use the provider's own local default" for ollama and
 * openai_compatible). Conservative on an unparsable URL: treated as remote
 * rather than silently assumed local (design spec Task 5). */
export function isLoopbackBaseUrl(url) {
  const value = String(url || "").trim();
  if (!value) return true;
  let hostname;
  try {
    hostname = new URL(value).hostname;
  } catch {
    return false;
  }
  return (
    hostname === "127.0.0.1" || hostname === "localhost" ||
    hostname === "::1" || hostname === "[::1]"
  );
}

/** What the Director Agent panel discloses about the outbound data boundary
 * for the currently configured provider, before the user presses Preview
 * (design spec Task 5). OpenAI/Anthropic are always outbound: even a custom
 * base_url still ships the instruction and query observations to whatever
 * that URL is. Ollama and OpenAI-compatible are local-first providers, so
 * only an actual remote override makes them outbound. */
export function providerPrivacyText(settings) {
  const outbound = t(
    "Your instruction and the semantic scene information requested by the planner are sent to the configured model provider. Media files are not sent by Agent v1."
  );
  if (settings.provider === "ollama") {
    return isLoopbackBaseUrl(settings.baseUrl) ? t("Planning stays on the configured local Ollama endpoint.") : outbound;
  }
  if (settings.provider === "openai_compatible") {
    return isLoopbackBaseUrl(settings.baseUrl) ? t("Planning stays on the configured local endpoint.") : outbound;
  }
  return outbound;
}

/** <option> list for the provider picker, straight from listProviders()'s
 * safe, credential-free capability rows -- never invents a label locally, so
 * a provider added server-side shows up without a client-side edit. */
export function providerSelectMarkup(providers, currentProviderId) {
  const options = Array.isArray(providers) ? providers : [];
  if (!options.length) return `<option value="">${t("No providers found")}</option>`;
  return options
    .map((provider) => `<option value="${escapeHtml(provider.id)}"${provider.id === currentProviderId ? " selected" : ""}>${escapeHtml(provider.label)}</option>`)
    .join("");
}

/** <option> list for the model picker. The currently configured model is
 * kept even if it fell out of the live list (a provider that just went
 * offline, a typo'd custom model) so a working selection is never silently
 * dropped out from under the user. */
export function modelSelectMarkup(models, currentModel) {
  const options = Array.isArray(models) ? [...models] : [];
  if (currentModel && !options.includes(currentModel)) options.unshift(currentModel);
  if (!options.length) return `<option value="">${t("No models found")}</option>`;
  return options
    .map((model) => `<option value="${escapeHtml(model)}"${model === currentModel ? " selected" : ""}>${escapeHtml(model)}</option>`)
    .join("");
}

export function createDirectorAgentPanel(ui, options = {}) {
  const root = ui.root;
  const api = options.api || ui.api || ui.app?.api;
  const el = (role) => root.querySelector(`[data-role="${role}"]`);

  const panel = el("agent-panel");
  const hint = el("agent-hint");
  const privacyNote = el("agent-privacy-note");
  const describeInput = el("agent-describe");
  const planList = el("agent-plan");
  const providerSelect = el("agent-provider-select");
  const modelSelect = el("agent-model-select");
  const providerLabel = el("agent-provider-label");
  const credentialStatus = el("agent-credential-status");
  const credentialForm = el("agent-credential-form");
  const credentialInput = el("agent-credential-input");
  const previewBtn = root.querySelector('[data-agent-act="preview"]');
  const applyBtn = root.querySelector('[data-agent-act="apply"]');
  const cancelBtn = root.querySelector('[data-agent-act="cancel"]');

  let state = "idle";
  let pendingPlan = null;
  let inFlightController = null;
  let disposed = false;

  function setHint(text) {
    if (hint) hint.textContent = text || "";
  }

  function render() {
    const settings = agentSettings();
    if (providerLabel) {
      const label = PROVIDER_LABELS[settings.provider] || settings.provider;
      providerLabel.textContent = `${label} · ${settings.model || t("(no model set)")}`;
    }
    if (privacyNote) privacyNote.textContent = providerPrivacyText(settings);

    const busy = state === "planning" || state === "applying";
    if (previewBtn) previewBtn.disabled = busy;
    if (applyBtn) applyBtn.disabled = !pendingPlan || busy || pendingPlan.truncated || state === "stale";
    if (cancelBtn) cancelBtn.disabled = !pendingPlan;
    if (describeInput) describeInput.disabled = busy;

    if (planList) planList.innerHTML = pendingPlan ? planChangesMarkup(pendingPlan.changes) : "";

    if (state === "planning") setHint(t("Planning..."));
    else if (state === "applying") setHint(t("Applying..."));
    else if (state === "stale") setHint(t("The Director changed after this preview. Generate a new preview."));
    else if (state === "preview_ready") {
      const description = pendingPlan?.description || "";
      const warnings = pendingPlan?.warnings || [];
      setHint(warnings.length ? [description, ...warnings.map((warning) => `⚠ ${warning}`)].join(" ") : description);
    }
  }

  function setState(next) {
    state = next;
    render();
  }

  async function refreshCredentialStatus() {
    if (disposed || !credentialStatus) return;
    const settings = agentSettings();
    try {
      const status = await getProviderStatus(api, settings.provider);
      if (disposed) return;
      if (status.configured) {
        credentialStatus.textContent =
          status.source === "environment" ? t("Configured by server environment") : t("Configured");
      } else {
        credentialStatus.textContent = t("Not configured");
      }
    } catch {
      if (!disposed) credentialStatus.textContent = t("Status unavailable");
    }
  }

  async function refreshProviders() {
    if (disposed || !providerSelect) return;
    const settings = agentSettings();
    providerSelect.disabled = true;
    try {
      const providers = await listProviders(api);
      if (disposed) return;
      providerSelect.innerHTML = providerSelectMarkup(providers, settings.provider);
    } catch {
      if (disposed) return;
      providerSelect.innerHTML = providerSelectMarkup([], settings.provider);
    } finally {
      if (!disposed) providerSelect.disabled = false;
    }
  }

  async function refreshModels() {
    if (disposed || !modelSelect) return;
    const settings = agentSettings();
    modelSelect.disabled = true;
    modelSelect.innerHTML = `<option value="">${t("Loading models...")}</option>`;
    try {
      const models = await listProviderModels(api, settings.provider, { base_url: settings.baseUrl });
      if (disposed) return;
      // A fresh install (or a provider that has never had a model picked)
      // has no configured model at all -- persist the first one the
      // provider actually offers instead of leaving the request that
      // generatePreview() would send with model: "".
      let selected = settings.model;
      if (!selected && models.length) {
        selected = models[0];
        writeSetting(agentModelSettingId(settings.provider), selected);
      }
      modelSelect.innerHTML = modelSelectMarkup(models, selected);
      render();
    } catch {
      if (disposed) return;
      modelSelect.innerHTML = modelSelectMarkup([], settings.model);
    } finally {
      if (!disposed) modelSelect.disabled = false;
    }
  }

  function onModelChange() {
    if (!modelSelect || !modelSelect.value) return;
    writeSetting(agentModelSettingId(agentSettings().provider), modelSelect.value);
    render();
  }

  function onProviderChange() {
    if (!providerSelect || !providerSelect.value) return;
    writeSetting(SETTING_AGENT_PROVIDER, providerSelect.value);
    render();
    void refreshCredentialStatus();
    void refreshModels();
  }

  async function generatePreview() {
    if (state === "planning" || state === "applying") return;
    const instruction = String(describeInput?.value || "").trim();
    if (!instruction) return;

    const sessionId = ui.agentBridge?.sessionId;
    if (!sessionId) {
      setState("error");
      setHint(t("Agent session is not ready yet."));
      return;
    }

    inFlightController?.abort?.();
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    inFlightController = controller;

    pendingPlan = null;
    setState("planning");

    const settings = agentSettings();
    try {
      const result = await requestPlan(api, {
        sessionId,
        instruction,
        provider: {
          id: settings.provider,
          model: settings.model,
          base_url: settings.baseUrl,
          max_output_tokens: settings.maxOutputTokens,
          max_planner_steps: settings.maxPlannerSteps,
          timeout_seconds: settings.requestTimeoutSeconds,
        },
      }, { signal: controller?.signal });

      if (disposed || inFlightController !== controller) return;

      if (result.finished) {
        pendingPlan = null;
        setState("idle");
        setHint(result.message || t("The Agent finished without a change."));
        return;
      }

      pendingPlan = {
        planId: result.plan_id,
        description: result.description,
        changes: result.changes || [],
        warnings: result.warnings || [],
        truncated: Boolean(result.truncated),
      };
      setState(pendingPlan.truncated ? "error" : "preview_ready");
      if (pendingPlan.truncated) setHint(t("Preview was truncated; Apply is disabled for safety."));
    } catch (error) {
      if (disposed || error?.name === "AbortError") return;
      pendingPlan = null;
      setState("error");
      setHint(error?.message || t("Preview failed"));
    }
  }

  async function applyPending() {
    if (!pendingPlan || state === "applying" || pendingPlan.truncated) return;
    const planId = pendingPlan.planId;
    setState("applying");
    try {
      await applyPlan(api, planId);
      if (disposed) return;
      pendingPlan = null;
      setState("idle");
      setHint(t("Applied."));
    } catch (error) {
      if (disposed) return;
      if (error?.code === "STALE_PLAN") {
        pendingPlan = null;
        setState("stale");
        return;
      }
      setState("error");
      setHint(error?.message || t("Apply failed"));
    }
  }

  function discardPending() {
    inFlightController?.abort?.();
    pendingPlan = null;
    setState("idle");
    setHint("");
  }

  function toggleCredentialForm(show) {
    if (credentialForm) credentialForm.hidden = !show;
    if (show) credentialInput?.focus?.();
    else if (credentialInput) credentialInput.value = "";
  }

  async function saveCredential() {
    const settings = agentSettings();
    const secret = credentialInput?.value || "";
    if (credentialInput) credentialInput.value = "";
    if (!secret) {
      toggleCredentialForm(false);
      return;
    }
    try {
      await setProviderCredential(api, settings.provider, secret);
    } catch (error) {
      if (!disposed) setHint(error?.message || t("Could not save the credential"));
    } finally {
      toggleCredentialForm(false);
      await refreshCredentialStatus();
      await refreshModels();
    }
  }

  async function removeCredential() {
    const settings = agentSettings();
    try {
      await deleteProviderCredential(api, settings.provider);
    } catch (error) {
      if (!disposed) setHint(error?.message || t("Could not remove the credential"));
    } finally {
      await refreshCredentialStatus();
      await refreshModels();
    }
  }

  async function testConnection() {
    const settings = agentSettings();
    setHint(t("Testing..."));
    try {
      const result = await testProvider(api, settings.provider, {
        model: settings.model,
        base_url: settings.baseUrl,
        timeout_seconds: settings.requestTimeoutSeconds,
      });
      if (disposed) return;
      setHint(result.ok ? t("Connection OK") : (result.error?.message || t("Connection failed")));
    } catch (error) {
      if (!disposed) setHint(error?.message || t("Connection failed"));
    }
  }

  /** Grows the describe textarea to fit its content; the CSS max-height on
   * .oc-agent-describe caps it and switches to internal scrolling beyond
   * that, so this never has to clamp anything itself. */
  function autoGrowDescribe() {
    if (!describeInput) return;
    describeInput.style.height = "auto";
    describeInput.style.height = `${describeInput.scrollHeight}px`;
  }

  function onClick(event) {
    const intent = resolveAgentIntent(event.target);
    if (!intent) return;
    if (intent.action === "preview") return void generatePreview();
    if (intent.action === "apply") return void applyPending();
    if (intent.action === "cancel") return discardPending();
    if (intent.action === "credential-replace") return toggleCredentialForm(credentialForm?.hidden !== false);
    if (intent.action === "credential-remove") return void removeCredential();
    if (intent.action === "credential-test") return void testConnection();
    if (intent.action === "credential-save") return void saveCredential();
    if (intent.action === "model-refresh") return void refreshModels();
  }

  panel?.addEventListener("click", onClick);
  providerSelect?.addEventListener("change", onProviderChange);
  modelSelect?.addEventListener("change", onModelChange);
  describeInput?.addEventListener("input", autoGrowDescribe);
  render();
  void refreshProviders();
  void refreshCredentialStatus();
  void refreshModels();

  return {
    get state() {
      return state;
    },
    dispose() {
      disposed = true;
      inFlightController?.abort?.();
      panel?.removeEventListener("click", onClick);
      providerSelect?.removeEventListener("change", onProviderChange);
      modelSelect?.removeEventListener("change", onModelChange);
      describeInput?.removeEventListener("input", autoGrowDescribe);
    },
  };
}
