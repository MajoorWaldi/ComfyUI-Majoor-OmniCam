import assert from "node:assert/strict";
import test from "node:test";

import { fetchOmniCamCapabilities } from "../../web-src/shared/capabilities.js";

test("shared capability client returns the validated response payload", async () => {
  const payload = { format: "majoor.omnicam.capabilities.v2", capabilities: [] };
  const client = { async fetchApi(path) { assert.equal(path, "/majoor/omnicam/capabilities"); return { ok: true, async json() { return payload; } }; } };
  assert.equal(await fetchOmniCamCapabilities(client), payload);
});

test("shared capability client fails clearly and lets callers degrade safely", async () => {
  await assert.rejects(() => fetchOmniCamCapabilities({ async fetchApi() { return { ok: false, status: 503 }; } }), /503/);
  await assert.rejects(() => fetchOmniCamCapabilities(null), /client is required/);
});

