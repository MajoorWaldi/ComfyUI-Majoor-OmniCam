import assert from "node:assert/strict";
import test from "node:test";

import {
  loadReconstructionCapabilities,
} from "../../web-src/extractor/reconstruction/capabilities.js";

class FakeSelect {
  constructor() {
    this.options = [];
    this.value = "";
  }
  appendChild(opt) {
    this.options.push(opt);
    if (!this.value) this.value = opt.value;
  }
  replaceChildren() {
    this.options = [];
    this.value = "";
  }
}

class FakeStatus {
  constructor() {
    this.textContent = "";
    this.hidden = true;
  }
}

test("loadReconstructionCapabilities populates provider select and surfaces missing checkpoint reason", async () => {
  let startCalled = false;
  const mockClient = {
    async capabilities() {
      return {
        feature: "scene_reconstruction",
        version: 1,
        providers: [
          {
            provider_id: "comfy_moge",
            name: "Native MoGe",
            available: false,
            reason: "Checkpoint missing in models/geometry_estimation",
          },
          {
            provider_id: "mock_fallback",
            name: "Mock Fallback",
            available: true,
            reason: "",
          },
        ],
        recommended_provider: "comfy_moge",
      };
    },
    async startJob() {
      startCalled = true;
      throw new Error("Must never probe by starting a job");
    },
  };

  const select = new FakeSelect();
  const status = new FakeStatus();

  const res = await loadReconstructionCapabilities(mockClient, {
    selectElement: select,
    statusElement: status,
  });

  // Never triggers a run to probe!
  assert.equal(startCalled, false, "Must never run a job to probe capabilities");

  assert.equal(res.recommended, "comfy_moge");
  assert.equal(select.options.length, 2);
  assert.equal(select.options[0].value, "comfy_moge");
  assert.equal(select.options[0].disabled, true);
  assert.equal(select.options[1].value, "mock_fallback");
  assert.equal(select.options[1].disabled, false);

  // Status element displays missing checkpoint message because recommended provider is unavailable
  assert.equal(status.hidden, false);
  assert.ok(status.textContent.includes("Checkpoint missing in models/geometry_estimation"));
});

test("loadReconstructionCapabilities clears status when selected provider is available", async () => {
  const mockClient = {
    async capabilities() {
      return {
        feature: "scene_reconstruction",
        version: 1,
        providers: [
          {
            provider_id: "ready_provider",
            name: "Ready",
            available: true,
            reason: "",
          },
        ],
        recommended_provider: "ready_provider",
      };
    },
  };

  const select = new FakeSelect();
  const status = new FakeStatus();
  status.textContent = "Previous error";
  status.hidden = false;

  await loadReconstructionCapabilities(mockClient, {
    selectElement: select,
    statusElement: status,
  });

  assert.equal(status.hidden, true);
  assert.equal(status.textContent, "");
  assert.equal(select.value, "ready_provider");
});
