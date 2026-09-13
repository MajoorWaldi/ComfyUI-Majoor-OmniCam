import test from "node:test";
import assert from "node:assert/strict";

import {
  AGENT_PROVIDERS,
  OMNICAM_SETTINGS,
  SETTING_AGENT_BASE_URL,
  SETTING_AGENT_ENABLED,
  SETTING_AGENT_MAX_OUTPUT_TOKENS,
  SETTING_AGENT_MAX_STEPS,
  SETTING_AGENT_MODEL,
  SETTING_AGENT_PROVIDER,
  SETTING_AGENT_TIMEOUT,
  agentBaseUrlSettingId,
  agentModelSettingId,
  agentSettings,
  registerOmniCamLocales,
} from "../../web-src/settings.js";

function fakeApp(values) {
  return {
    extensionManager: {
      setting: {
        get: (id) => values[id],
        set: (id, value) => { values[id] = value; },
      },
    },
  };
}

test("the Agent group is registered in the settings catalogue", () => {
  const ids = OMNICAM_SETTINGS.map((entry) => entry.id);
  for (const id of [
    SETTING_AGENT_ENABLED,
    SETTING_AGENT_PROVIDER,
    SETTING_AGENT_MAX_OUTPUT_TOKENS,
    SETTING_AGENT_MAX_STEPS,
    SETTING_AGENT_TIMEOUT,
  ]) {
    assert.ok(ids.includes(id), `missing ${id}`);
  }
  const provider = OMNICAM_SETTINGS.find((entry) => entry.id === SETTING_AGENT_PROVIDER);
  assert.deepEqual(provider.category, ["OmniCam", "Agent", "Provider"]);
});

test("every Agent provider gets its own scoped Model/Base URL setting -- switching Provider must never reuse another provider's", () => {
  const ids = OMNICAM_SETTINGS.map((entry) => entry.id);
  for (const provider of AGENT_PROVIDERS) {
    assert.ok(ids.includes(agentModelSettingId(provider.id)), `missing model setting for ${provider.id}`);
    assert.ok(ids.includes(agentBaseUrlSettingId(provider.id)), `missing base URL setting for ${provider.id}`);
  }
  // Distinct category paths -- otherwise the settings dialog collapses them
  // onto one node (see catalogue.js's module comment).
  const categoryPaths = OMNICAM_SETTINGS.map((entry) => entry.category.join(">"));
  assert.equal(new Set(categoryPaths).size, categoryPaths.length);
});

test("the legacy flat Agent.Model/Agent.BaseUrl pair is no longer registered", () => {
  const ids = OMNICAM_SETTINGS.map((entry) => entry.id);
  assert.equal(ids.includes(SETTING_AGENT_MODEL), false);
  assert.equal(ids.includes(SETTING_AGENT_BASE_URL), false);
});

test("no PreviewBeforeApply setting exists -- Preview then Apply is a mandatory safety flow, not a preference (design spec Task 7)", () => {
  const ids = OMNICAM_SETTINGS.map((entry) => String(entry.id));
  assert.equal(ids.some((id) => id.includes("PreviewBeforeApply")), false);
  assert.equal("previewBeforeApply" in agentSettings(), false);
});

test("no credential setting is ever registered in the ComfyUI settings catalogue", () => {
  const ids = OMNICAM_SETTINGS.map((entry) => String(entry.id).toLowerCase());
  assert.equal(ids.some((id) => id.includes("credential")), false);
});

test("agentSettings() returns sane defaults with no app registered", () => {
  const settings = agentSettings();
  assert.deepEqual(settings, {
    enabled: true,
    provider: "ollama",
    model: "",
    baseUrl: "",
    maxOutputTokens: 4096,
    maxPlannerSteps: 6,
    requestTimeoutSeconds: 120,
  });
});

test("agentSettings() reads overridden values and clamps out-of-range numbers", () => {
  const values = {
    [SETTING_AGENT_ENABLED]: false,
    [SETTING_AGENT_PROVIDER]: "anthropic",
    [agentModelSettingId("anthropic")]: "  claude-x  ",
    [agentBaseUrlSettingId("anthropic")]: " https://example.test ",
    [SETTING_AGENT_MAX_OUTPUT_TOKENS]: 999999,
    [SETTING_AGENT_MAX_STEPS]: 0,
    [SETTING_AGENT_TIMEOUT]: 15,
  };
  registerOmniCamLocales(fakeApp(values));

  const settings = agentSettings();
  assert.equal(settings.enabled, false);
  assert.equal(settings.provider, "anthropic");
  assert.equal(settings.model, "claude-x");
  assert.equal(settings.baseUrl, "https://example.test");
  assert.equal(settings.maxOutputTokens, 32768);
  assert.equal(settings.maxPlannerSteps, 1);
  assert.equal(settings.requestTimeoutSeconds, 15);

  registerOmniCamLocales(null);
});

test("an unrecognised provider value falls back to ollama", () => {
  registerOmniCamLocales(fakeApp({ [SETTING_AGENT_PROVIDER]: "not-a-real-provider" }));
  assert.equal(agentSettings().provider, "ollama");
  registerOmniCamLocales(null);
});

test("Model/Base URL are scoped per provider -- switching Provider never carries over another provider's value", () => {
  const values = {
    [SETTING_AGENT_PROVIDER]: "openai",
    [agentModelSettingId("openai")]: "gpt-4o-mini",
    [agentBaseUrlSettingId("openai")]: "https://openai-proxy.example.test",
  };
  registerOmniCamLocales(fakeApp(values));

  let settings = agentSettings();
  assert.equal(settings.model, "gpt-4o-mini");
  assert.equal(settings.baseUrl, "https://openai-proxy.example.test");

  // Switching Provider must not read the previous provider's Model/BaseUrl:
  // an OpenAI proxy Base URL must never silently carry over onto Anthropic.
  values[SETTING_AGENT_PROVIDER] = "anthropic";
  settings = agentSettings();
  assert.equal(settings.model, "");
  assert.equal(settings.baseUrl, "");

  registerOmniCamLocales(null);
});

test("migrateAgentProviderSettings() moves a pre-scoping Agent.Model/BaseUrl into the active provider's slot, once", () => {
  const values = {
    [SETTING_AGENT_PROVIDER]: "anthropic",
    [SETTING_AGENT_MODEL]: "claude-legacy",
    [SETTING_AGENT_BASE_URL]: "https://legacy-proxy.example.test",
  };
  registerOmniCamLocales(fakeApp(values));

  assert.equal(values[agentModelSettingId("anthropic")], "claude-legacy");
  assert.equal(values[agentBaseUrlSettingId("anthropic")], "https://legacy-proxy.example.test");
  assert.equal(values[SETTING_AGENT_MODEL], "");
  assert.equal(values[SETTING_AGENT_BASE_URL], "");
  assert.equal(agentSettings().model, "claude-legacy");

  // A different provider must never inherit the migrated value.
  values[SETTING_AGENT_PROVIDER] = "openai";
  assert.equal(agentSettings().model, "");

  registerOmniCamLocales(null);
});

test("migrateAgentProviderSettings() never overwrites a Model/BaseUrl the provider already has", () => {
  const values = {
    [SETTING_AGENT_PROVIDER]: "ollama",
    [SETTING_AGENT_MODEL]: "legacy-model",
    [agentModelSettingId("ollama")]: "already-configured",
  };
  registerOmniCamLocales(fakeApp(values));

  assert.equal(values[agentModelSettingId("ollama")], "already-configured");
  registerOmniCamLocales(null);
});
