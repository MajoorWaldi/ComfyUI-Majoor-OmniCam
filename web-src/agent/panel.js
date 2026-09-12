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
import { agentSettings } from "../settings.js";
import { applyPlan, requestPlan } from "./plan-client.js";
import {
  deleteProviderCredential,
  getProviderStatus,
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

export function createDirectorAgentPanel(ui, options = {}) {
  const root = ui.root;
  const api = options.api || ui.api || ui.app?.api;
  const el = (role) => root.querySelector(`[data-role="${role}"]`);

  const panel = el("agent-panel");
  const hint = el("agent-hint");
  const describeInput = el("agent-describe");
  const planList = el("agent-plan");
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

    const busy = state === "planning" || state === "applying";
    if (previewBtn) previewBtn.disabled = busy;
    if (applyBtn) applyBtn.disabled = !pendingPlan || busy || pendingPlan.truncated || state === "stale";
    if (cancelBtn) cancelBtn.disabled = !pendingPlan;
    if (describeInput) describeInput.disabled = busy;

    if (planList) planList.innerHTML = pendingPlan ? planChangesMarkup(pendingPlan.changes) : "";

    if (state === "planning") setHint(t("Planning..."));
    else if (state === "applying") setHint(t("Applying..."));
    else if (state === "stale") setHint(t("The Director changed after this preview. Generate a new preview."));
    else if (state === "preview_ready") setHint(pendingPlan?.description || "");
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
  }

  panel?.addEventListener("click", onClick);
  render();
  void refreshCredentialStatus();

  return {
    get state() {
      return state;
    },
    dispose() {
      disposed = true;
      inFlightController?.abort?.();
      panel?.removeEventListener("click", onClick);
    },
  };
}
