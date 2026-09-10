// STOP cancels the actual ComfyUI job for this panel's queued run.
//
// The load-bearing assertions: STOP hits POST /api/jobs/<encoded>/cancel and
// nothing else, and pressing STOP on a run that has no live prompt (never
// queued, or already terminal) is a silent no-op -- no throw, no state change.

import assert from "node:assert/strict";
import test from "node:test";

import { cancelExtractorJob } from "../../web-src/extractor/queue/execution.js";
import { cancelQueuedRun } from "../../web-src/extractor/queue/ui-bridge.js";

function fakeApi({ ok = true, status = 200, body = { cancelled: true } } = {}) {
  const calls = [];
  return {
    calls,
    fetchApi: async (url, options) => {
      calls.push({ url, options });
      return { ok, status, json: async () => body };
    },
  };
}

test("cancelExtractorJob posts to the Jobs API cancel endpoint", async () => {
  const api = fakeApi();
  const cancelled = await cancelExtractorJob(api, "prompt 7/aa");
  assert.equal(cancelled, true);
  assert.equal(api.calls.length, 1);
  assert.equal(api.calls[0].url, "/api/jobs/prompt%207%2Faa/cancel");
  assert.equal(api.calls[0].options.method, "POST");
});

test("cancelExtractorJob reports the server's cancelled flag", async () => {
  assert.equal(await cancelExtractorJob(fakeApi({ body: { cancelled: false } }), "p1"), false);
  assert.equal(await cancelExtractorJob(fakeApi({ body: {} }), "p1"), false);
});

test("cancelExtractorJob throws a product error on a failed request", async () => {
  await assert.rejects(
    () => cancelExtractorJob(fakeApi({ ok: false, status: 503 }), "p1"),
    /503/,
  );
});

test("cancelExtractorJob with no job id does nothing", async () => {
  const api = fakeApi();
  assert.equal(await cancelExtractorJob(api, ""), false);
  assert.equal(api.calls.length, 0);
});

function fakeUi({ queuePromptId = "p1", api: apiOptions } = {}) {
  const dispatched = [];
  return {
    api: fakeApi(apiOptions),
    dispatched,
    queuePromptId,
    dispatch: (action) => dispatched.push(action),
  };
}

test("STOP marks CANCELLING and cancels the job; CANCELLED comes from the event", async () => {
  const ui = fakeUi();
  await cancelQueuedRun(ui);
  assert.deepEqual(ui.dispatched, [{ type: "QUEUE_LIFECYCLE", state: "CANCELLING" }]);
  assert.equal(ui.api.calls[0].url, "/api/jobs/p1/cancel");
});

test("STOP with no live prompt is a silent no-op (idempotent double-press)", async () => {
  const ui = fakeUi({ queuePromptId: "" });
  await cancelQueuedRun(ui);
  assert.deepEqual(ui.dispatched, []);
  assert.equal(ui.api.calls.length, 0);
});

test("a failed cancellation surfaces as FAILED rather than throwing", async () => {
  const ui = fakeUi({ api: { ok: false, status: 500 } });
  await cancelQueuedRun(ui); // must not throw
  assert.deepEqual(ui.dispatched.at(-1), {
    type: "QUEUE_LIFECYCLE",
    state: "FAILED",
    error: "Comfy job cancellation failed (500)",
  });
});
