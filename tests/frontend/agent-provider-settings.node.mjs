import test from "node:test";
import assert from "node:assert/strict";

import {
  OMNICAM_SETTINGS,
  SETTING_AGENT_BASE_URL,
  SETTING_AGENT_ENABLED,
  SETTING_AGENT_MAX_OUTPUT_TOKENS,
  SETTING_AGENT_MAX_STEPS,
  SETTING_AGENT_MODEL,
  SETTING_AGENT_PREVIEW,
  SETTING_AGENT_PROVIDER,
  SETTING_AGENT_TIMEOUT,
  agentSettings,
  registerOmniCamLocales,
} from "../../web-src/settings.js";

test("the Agent group is registered in the settings catalogue", () => {
  const ids = OMNICAM_SETTINGS.map((entry) => entry.id);
  for (const id of [
    SETTING_AGENT_ENABLED,
    SETTING_AGENT_PROVIDER,
    SETTING_AGENT_MODEL,
    SETTING_AGENT_BASE_URL,
    SETTING_AGENT_MAX_OUTPUT_TOKENS,
    SETTING_AGENT_MAX_STEPS,
    SETTING_AGENT_PREVIEW,
    SETTING_AGENT_TIMEOUT,
  ]) {
    assert.ok(ids.includes(id), `missing ${id}`);
  }
  const provider = OMNICAM_SETTINGS.find((entry) => entry.id === SETTING_AGENT_PROVIDER);
  assert.deepEqual(provider.category, ["OmniCam", "Agent", "Provider"]);
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
    previewBeforeApply: true,
    requestTimeoutSeconds: 120,
  });
});

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

test("agentSettings() reads overridden values and clamps out-of-range numbers", () => {
  const values = {
    [SETTING_AGENT_ENABLED]: false,
    [SETTING_AGENT_PROVIDER]: "anthropic",
    [SETTING_AGENT_MODEL]: "  claude-x  ",
    [SETTING_AGENT_BASE_URL]: " https://example.test ",
    [SETTING_AGENT_MAX_OUTPUT_TOKENS]: 999999,
    [SETTING_AGENT_MAX_STEPS]: 0,
    [SETTING_AGENT_PREVIEW]: false,
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
  assert.equal(settings.previewBeforeApply, false);
  assert.equal(settings.requestTimeoutSeconds, 15);

  registerOmniCamLocales(null);
});

test("an unrecognised provider value falls back to ollama", () => {
  registerOmniCamLocales(fakeApp({ [SETTING_AGENT_PROVIDER]: "not-a-real-provider" }));
  assert.equal(agentSettings().provider, "ollama");
  registerOmniCamLocales(null);
});
