// The pure "Enable built-in Agent" read/live-apply behavior (design spec
// Task 6). DOM-level tab visibility is covered by tests/frontend's
// agent-panel.spec.js Playwright suite, which exercises the real markup.

import test from "node:test";
import assert from "node:assert/strict";

import {
  SETTING_AGENT_ENABLED,
  applyAgentAvailability,
  builtInAgentEnabled,
  registerDirector,
  registerOmniCamLocales,
  unregisterDirector,
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

test("builtInAgentEnabled() defaults to true with no app registered", () => {
  assert.equal(builtInAgentEnabled(), true);
});

test("builtInAgentEnabled() reflects the live setting value", () => {
  registerOmniCamLocales(fakeApp({ [SETTING_AGENT_ENABLED]: false }));
  assert.equal(builtInAgentEnabled(), false);
  registerOmniCamLocales(null);
});

test("applyAgentAvailability() calls syncAgentAvailability on every live, non-disposed Director", () => {
  const calls = [];
  const uiA = { disposed: false, assetBrowser: { syncAgentAvailability: () => calls.push("a") } };
  const uiB = { disposed: true, assetBrowser: { syncAgentAvailability: () => calls.push("b") } };
  const uiC = { disposed: false, assetBrowser: null }; // no Asset Browser mounted yet -- must not throw

  registerDirector(uiA);
  registerDirector(uiB);
  registerDirector(uiC);
  try {
    applyAgentAvailability();
    assert.deepEqual(calls, ["a"]);
  } finally {
    unregisterDirector(uiA);
    unregisterDirector(uiB);
    unregisterDirector(uiC);
  }
});
