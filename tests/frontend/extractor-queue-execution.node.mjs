// Queueing a Camera TRACK through ComfyUI.
//
// The load-bearing assertion: pressing TRACK results in exactly one
// app.queuePrompt call targeting only the Extractor node, and never touches
// the old /majoor/omnicam/extractor/jobs route. A fake api.fetchApi throws on
// that URL so any regression to the interactive scheduler fails loudly.

import assert from "node:assert/strict";
import test from "node:test";

import {
  queueExtractor,
  resolveExecutionId,
} from "../../web-src/extractor/queue/execution.js";

globalThis.__COMFYUI_FRONTEND_VERSION__ = "1.52.7";

function fakeUi({ available = true, nodeId = 7 } = {}) {
  const events = { setExtractMode: [], syncPanel: 0, prepared: 0 };
  const queueCalls = [];
  const jobsCalls = [];
  return {
    events,
    queueCalls,
    jobsCalls,
    node: { id: nodeId },
    app: {
      queuePrompt: async (...args) => {
        queueCalls.push(args);
        return true;
      },
    },
    api: {
      fetchApi: async (url) => {
        if (String(url).includes("/majoor/omnicam/extractor/jobs")) {
          throw new Error(`TRACK hit the retired jobs route: ${url}`);
        }
        jobsCalls.push(url);
        return { ok: true, json: async () => ({}) };
      },
    },
    refreshSource() {
      return { available, ref: available ? { kind: "video" } : null };
    },
    setExtractMode(mode) {
      events.setExtractMode.push(mode);
    },
    syncPanelToNodeWidgets() {
      events.syncPanel += 1;
    },
    prepareForQueuedRun() {
      events.prepared += 1;
    },
  };
}

test("resolveExecutionId returns the string node id for a root-graph node", () => {
  assert.equal(resolveExecutionId({ id: 12 }), "12");
  assert.equal(resolveExecutionId({ id: "12" }), "12");
  assert.equal(resolveExecutionId({}), null);
  assert.equal(resolveExecutionId(null), null);
});

test("TRACK queues one partial prompt targeting only the Extractor node", async () => {
  const ui = fakeUi({ nodeId: 7 });
  const result = await queueExtractor(ui, "camera_track");

  assert.deepEqual(result, { accepted: true });
  assert.equal(ui.queueCalls.length, 1);
  const [number, batchCount, options] = ui.queueCalls[0];
  assert.equal(number, 0);
  assert.equal(batchCount, 1);
  assert.deepEqual(options.queueNodeIds, ["7"]);
  assert.deepEqual(options.intent, { trigger_source: "omnicam_track" });
  assert.equal(ui.jobsCalls.length, 0);
});

test("TRACK syncs the mode and widgets before queueing", async () => {
  const ui = fakeUi();
  await queueExtractor(ui, "camera_track");
  assert.deepEqual(ui.events.setExtractMode, ["camera_track"]);
  assert.equal(ui.events.syncPanel, 1);
  assert.equal(ui.events.prepared, 1);
});

test("reconstruct mode carries its own trigger source", async () => {
  const ui = fakeUi();
  await queueExtractor(ui, "scene_reconstruct");
  assert.deepEqual(ui.queueCalls[0][2].intent, {
    trigger_source: "omnicam_reconstruct",
  });
  assert.deepEqual(ui.events.setExtractMode, ["scene_reconstruct"]);
});

test("missing source does not queue anything", async () => {
  const ui = fakeUi({ available: false });
  const result = await queueExtractor(ui, "camera_track");
  assert.deepEqual(result, { accepted: false, reason: "no-source" });
  assert.equal(ui.queueCalls.length, 0);
  assert.equal(ui.events.prepared, 0);
});

test("a node with no id refuses to queue rather than run the whole graph", async () => {
  const ui = fakeUi({ nodeId: null });
  const result = await queueExtractor(ui, "camera_track");
  assert.deepEqual(result, { accepted: false, reason: "no-execution-id" });
  assert.equal(ui.queueCalls.length, 0);
});
