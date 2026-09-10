// Scene Reconstruction Start / Stop run through the same partial ComfyUI queue
// as Camera TRACK. The panel no longer owns a heavy job manager.
//
// The load-bearing assertions: pressing Start flushes the panel onto the node
// widgets and delegates to the parent queue function -- and never POSTs to
// /majoor/omnicam/reconstruction/jobs.

import assert from "node:assert/strict";
import test from "node:test";

import { ReconstructionPanelController } from "../../web-src/extractor/reconstruction/panel.js";
import { RECON_PANEL_FIELDS } from "../../web-src/extractor/reconstruction/settings-sync.js";

const SOURCE = { kind: "annotated_input", value: "recon_input_abc.png [input]" };

function fakeApi() {
  const calls = [];
  return {
    calls,
    fetchApi: async (path) => {
      calls.push(String(path));
      if (String(path).includes("/reconstruction/jobs")) {
        throw new Error(`Start hit the retired reconstruction jobs route: ${path}`);
      }
      return { ok: true, json: async () => ({ providers: [] }) };
    },
    addEventListener() {},
    removeEventListener() {},
  };
}

// A panel root with one control per recon field, plus the run/stop buttons.
function fakeRoot(controlValues = {}) {
  const controls = new Map();
  for (const f of RECON_PANEL_FIELDS) {
    controls.set(f.role, f.kind === "boolean"
      ? { checked: controlValues[f.role] ?? true }
      : { value: String(controlValues[f.role] ?? (f.kind === "number" ? 3 : "picked")) });
  }
  const buttons = new Map([
    ["reconstruction-run", { addEventListener() {}, removeEventListener() {} }],
    ["reconstruction-stop", { addEventListener() {}, removeEventListener() {} }],
  ]);
  return {
    querySelector: (sel) => {
      const role = sel.match(/data-role="([^"]+)"/)?.[1];
      return controls.get(role) || buttons.get(role) || null;
    },
    querySelectorAll: () => [],
  };
}

function fakeNode() {
  const names = [
    "extract_mode",
    ...RECON_PANEL_FIELDS.map((f) => f.widget),
    "recon_completion_provider",
  ];
  return {
    id: 3,
    // undefined so hydratePanelFromWidgets leaves the panel DOM controls alone.
    widgets: names.map((name) => ({ name, value: undefined })),
    setDirtyCanvas() {},
    value(name) {
      return this.widgets.find((w) => w.name === name)?.value;
    },
  };
}

function build() {
  const api = fakeApi();
  const node = fakeNode();
  const root = fakeRoot();
  const queued = [];
  const cancelled = [];
  const controller = new ReconstructionPanelController({
    root,
    node,
    api,
    getSource: () => SOURCE,
    onQueue: () => queued.push(true),
    onCancel: () => cancelled.push(true),
  });
  return { api, node, root, queued, cancelled, controller };
}

test("Start delegates to the parent queue and never POSTs to /reconstruction/jobs", async () => {
  const { api, queued, controller } = build();
  await controller.run();

  assert.equal(queued.length, 1);
  assert.equal(controller.state.jobState, "PREPARING");
  assert.ok(!api.calls.some((url) => url.includes("/reconstruction/jobs")));

  controller.dispose();
});

test("Start flushes a fresh panel edit onto the real node widgets first", async () => {
  const { node, root, controller } = build();
  // Simulate the user changing a control after the panel mounted.
  root.querySelector('[data-role="reconstruction-mode"]').value = "hybrid";
  await controller.run();
  assert.equal(node.value("recon_mode"), "hybrid");
  controller.dispose();
});

test("Start does nothing without a source", async () => {
  const api = fakeApi();
  const queued = [];
  const controller = new ReconstructionPanelController({
    root: fakeRoot(),
    node: fakeNode(),
    api,
    getSource: () => null,
    onQueue: () => queued.push(true),
  });
  await controller.run();
  assert.equal(queued.length, 0);
  controller.dispose();
});

test("Stop delegates to the parent cancellation", async () => {
  const { cancelled, controller } = build();
  await controller.stop();
  assert.equal(cancelled.length, 1);
  assert.equal(controller.state.jobState, "STOPPING");
  controller.dispose();
});

test("a queued scene_reconstruct result routes into the panel by mode", async () => {
  const { controller } = build();
  controller.acceptQueuedResult({
    mode: "scene_reconstruct",
    motionScene: { version: 1, objects: [], cameras: [] },
    fingerprint: "recon-fp-9",
    solver_coverage: 0.9,
    reconstruction: { provider: "comfy_moge", warnings: ["w1"] },
  });
  assert.equal(controller.state.jobState, "DONE");
  assert.equal(controller.state.result.version, 1);
  assert.deepEqual(controller.state.warnings, ["w1"]);
  assert.equal(controller.state.fingerprint, "recon-fp-9");
  controller.dispose();
});
