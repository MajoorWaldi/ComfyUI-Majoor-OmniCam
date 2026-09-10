// Queueing a Camera TRACK / Reconstruct through ComfyUI's partial execution.
//
// Load-bearing assertions:
//   * TRACK results in exactly one app.queuePrompt call targeting only the
//     Extractor node, and never touches the retired /extractor/jobs route;
//   * the prompt id is captured deterministically from the /prompt POST
//     response -- not guessed from "the first execution_start";
//   * a node inside a subgraph refuses rather than target the wrong node.

import assert from "node:assert/strict";
import test from "node:test";

import {
  isInsideSubgraph,
  queueExtractor,
  resolveExecutionId,
  waitForPromptSubmissionIdle,
} from "../../web-src/extractor/queue/execution.js";

globalThis.__COMFYUI_FRONTEND_VERSION__ = "1.52.7";

function fakeUi({ available = true, nodeId = 7, graph = null, promptId = "p-42" } = {}) {
  const events = { setExtractMode: [], syncPanel: 0, prepared: 0 };
  const queueCalls = [];
  const promptPosts = [];
  const node = { id: nodeId, graph: graph ?? { isRootGraph: true } };
  const api = {
    fetchApi: async (url, opts = {}) => {
      if (String(url).includes("/majoor/omnicam/extractor/jobs")) {
        throw new Error(`TRACK hit the retired jobs route: ${url}`);
      }
      if (String(url).endsWith("/prompt") && opts.method === "POST") {
        promptPosts.push(JSON.parse(opts.body));
        return { ok: true, clone: () => ({ json: async () => ({ prompt_id: promptId }) }) };
      }
      return { ok: true, json: async () => ({}) };
    },
  };
  return {
    events,
    queueCalls,
    promptPosts,
    node,
    api,
    app: {
      // ComfyUI's app.queuePrompt refuses to send while another submission is
      // in flight; mirror that flag so the idle guard can be exercised.
      processingQueue: false,
      // Model the real app.queuePrompt -> api.queuePrompt -> POST /prompt flow.
      queuePrompt: async (number, batchCount, options) => {
        queueCalls.push([number, batchCount, options]);
        const targets = Array.isArray(options) ? options : options?.queueNodeIds;
        await api.fetchApi("/prompt", {
          method: "POST",
          body: JSON.stringify({ partial_execution_targets: targets }),
        });
        return true;
      },
    },
    refreshSource() {
      return { available, ref: available ? { kind: "video" } : null };
    },
    setExtractMode(mode) { events.setExtractMode.push(mode); },
    syncPanelToNodeWidgets() { events.syncPanel += 1; },
    prepareForQueuedRun() { events.prepared += 1; },
  };
}

test("resolveExecutionId returns the string node id for a root-graph node", () => {
  assert.equal(resolveExecutionId({ id: 12, graph: { isRootGraph: true } }), "12");
  assert.equal(resolveExecutionId({ id: "12" }), "12");
  assert.equal(resolveExecutionId({}), null);
  assert.equal(resolveExecutionId(null), null);
});

test("resolveExecutionId refuses a node inside a subgraph", () => {
  assert.equal(resolveExecutionId({ id: 5, graph: { isRootGraph: false } }), null);
  assert.equal(resolveExecutionId({ id: 5, graph: { _is_subgraph: true } }), null);
  assert.equal(resolveExecutionId({ id: "3:5" }), null);
  assert.equal(isInsideSubgraph({ id: 5, graph: { isRootGraph: false } }), true);
  assert.equal(isInsideSubgraph({ id: 5, graph: { isRootGraph: true } }), false);
});

test("TRACK queues one partial prompt and captures the prompt id from /prompt", async () => {
  const ui = fakeUi({ nodeId: 7, promptId: "prompt-abc" });
  const result = await queueExtractor(ui, "camera_track");

  assert.equal(result.accepted, true);
  assert.equal(result.promptId, "prompt-abc");
  assert.equal(ui.queuePromptId, "prompt-abc");
  assert.equal(ui.queueCalls.length, 1);
  const [number, batchCount, options] = ui.queueCalls[0];
  assert.equal(number, 0);
  assert.equal(batchCount, 1);
  assert.deepEqual(options.queueNodeIds, ["7"]);
  assert.deepEqual(options.intent, { trigger_source: "omnicam_track" });
  // The /prompt POST carried exactly our target.
  assert.deepEqual(ui.promptPosts, [{ partial_execution_targets: ["7"] }]);
});

test("api.fetchApi is restored after the queue call", async () => {
  const ui = fakeUi();
  const before = ui.api.fetchApi;
  await queueExtractor(ui, "camera_track");
  assert.equal(ui.api.fetchApi, before);
});

test("a /prompt POST for a different target does not leak its prompt id", async () => {
  const ui = fakeUi({ nodeId: 7 });
  // Make app.queuePrompt post a mismatched target.
  ui.app.queuePrompt = async (number, batchCount, options) => {
    ui.queueCalls.push([number, batchCount, options]);
    await ui.api.fetchApi("/prompt", {
      method: "POST",
      body: JSON.stringify({ partial_execution_targets: ["99"] }),
    });
    return true;
  };
  const result = await queueExtractor(ui, "camera_track");
  assert.equal(result.accepted, true);
  assert.equal(ui.queuePromptId, ""); // not correlated -> empty, not "p-42"
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
  assert.deepEqual(ui.queueCalls[0][2].intent, { trigger_source: "omnicam_reconstruct" });
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

test("a subgraph Extractor refuses with a clear reason", async () => {
  const ui = fakeUi({ nodeId: 5, graph: { isRootGraph: false } });
  const result = await queueExtractor(ui, "camera_track");
  assert.deepEqual(result, { accepted: false, reason: "subgraph-not-supported" });
  assert.equal(ui.queueCalls.length, 0);
  assert.equal(ui.events.prepared, 0);
});

// -- the app.processingQueue race -------------------------------------------
//
// ComfyUI's app.queuePrompt pushes onto app.queueItems and returns false when
// app.processingQueue is already true; the real POST /prompt for that item
// then happens later, outside our capture window. queueExtractor must wait for
// the flag to clear before it installs the capture and calls queuePrompt.

test("TRACK does not queue while ComfyUI is still sending another prompt", async () => {
  const ui = fakeUi({ promptId: "prompt-later" });
  ui.app.processingQueue = true; // a prior submission is in flight

  const pending = queueExtractor(ui, "camera_track");
  // Let the idle poller spin for a while.
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(ui.queueCalls.length, 0, "must not call queuePrompt yet");
  assert.equal(ui.events.prepared, 0, "and must not disturb the panel yet");
  assert.equal(ui.events.setExtractMode.length, 0);

  ui.app.processingQueue = false; // the prior submission finishes
  const result = await pending;

  assert.equal(result.accepted, true);
  assert.equal(result.promptId, "prompt-later");
  assert.equal(ui.queueCalls.length, 1, "exactly one queuePrompt once idle");
  assert.deepEqual(ui.promptPosts, [{ partial_execution_targets: ["7"] }]);
});

test("TRACK refuses cleanly if the submission never goes idle", async () => {
  const ui = fakeUi();
  ui.app.processingQueue = true; // stuck

  const result = await queueExtractor(ui, "camera_track", {
    idle: { timeoutMs: 40, intervalMs: 5 },
  });

  assert.deepEqual(result, { accepted: false, reason: "submission-busy" });
  assert.equal(ui.queueCalls.length, 0, "no uncorrelated run may be fired");
  assert.equal(ui.events.prepared, 0, "and the panel is left untouched");
});

test("waitForPromptSubmissionIdle is immediate when nothing is in flight", async () => {
  assert.equal(await waitForPromptSubmissionIdle({ processingQueue: false }), true);
  assert.equal(await waitForPromptSubmissionIdle({}), true);
  assert.equal(await waitForPromptSubmissionIdle(null), true);
});

test("waitForPromptSubmissionIdle polls until the flag clears", async () => {
  const app = { processingQueue: true };
  let ticks = 0;
  const sleep = () => {
    ticks += 1;
    if (ticks >= 3) app.processingQueue = false;
    return Promise.resolve();
  };
  let t = 0;
  const now = () => (t += 1);

  assert.equal(
    await waitForPromptSubmissionIdle(app, { timeoutMs: 1000, now, sleep }),
    true,
  );
  assert.equal(ticks, 3);
});

test("waitForPromptSubmissionIdle gives up after the timeout", async () => {
  let t = 0;
  const now = () => (t += 10);
  const result = await waitForPromptSubmissionIdle(
    { processingQueue: true },
    { timeoutMs: 25, now, sleep: () => Promise.resolve() },
  );
  assert.equal(result, false);
});
