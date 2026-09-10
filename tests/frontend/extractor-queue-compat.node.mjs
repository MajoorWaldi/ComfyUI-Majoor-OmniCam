// The partial-queue compatibility adapter.
//
// The load-bearing rule: OmniCam must pick EXACTLY ONE app.queuePrompt
// signature per frontend version and never "try both". The wrong argument
// shape does not throw -- a modern frontend silently treats a bare array as
// "no partial targets" on an old caller path, or an old frontend stuffs an
// options object where it wants an array -- and either way the whole workflow
// executes. So every test here asserts the precise positional call.
//
// Proven cutover (see docs plan Task 1 / AGENTS.md official-source rule):
//   ComfyUI_frontend v1.48.7, v1.49.0 -> third arg is NodeExecutionId[] only.
//   ComfyUI_frontend v1.49.1+         -> third arg is QueuePromptOptions
//                                        | NodeExecutionId[] (Array.isArray
//                                        normalization in app.queuePrompt).
// Hence QUEUE_OPTIONS_SIGNATURE_MIN === "1.49.1".

import assert from "node:assert/strict";
import test from "node:test";

import {
  QUEUE_OPTIONS_SIGNATURE_MIN,
  compareVersion,
  getFrontendVersion,
  parseVersion,
  queuePartialPrompt,
} from "../../web-src/extractor/queue/compat.js";

function recordingApp() {
  const calls = [];
  return {
    calls,
    queuePrompt: async (...args) => {
      calls.push(args);
      return true;
    },
  };
}

test("parseVersion reads the leading semver triple", () => {
  assert.deepEqual(parseVersion("1.49.1"), [1, 49, 1]);
  assert.deepEqual(parseVersion("1.52.7-nightly.3"), [1, 52, 7]);
  assert.equal(parseVersion("garbage"), null);
  assert.equal(parseVersion(""), null);
  assert.equal(parseVersion(undefined), null);
});

test("compareVersion orders triples and rejects the unparseable", () => {
  assert.equal(compareVersion("1.49.0", "1.49.1"), -1);
  assert.equal(compareVersion("1.50.0", "1.49.9"), 1);
  assert.equal(compareVersion("1.49.1", "1.49.1"), 0);
  assert.throws(() => compareVersion("", "1.49.1"), /frontend version/i);
});

test("legacy array signature: v1.48.7 gets the bare queueNodeIds array", async () => {
  const app = recordingApp();
  await queuePartialPrompt(app, ["7"], { frontendVersion: "1.48.7" });
  assert.deepEqual(app.calls, [[0, 1, ["7"]]]);
});

test("legacy array signature holds right up to the cutover (v1.49.0)", async () => {
  const app = recordingApp();
  await queuePartialPrompt(app, ["7"], { frontendVersion: "1.49.0" });
  assert.deepEqual(app.calls, [[0, 1, ["7"]]]);
});

test("modern options signature: the cutover version v1.49.1 uses QueuePromptOptions", async () => {
  const app = recordingApp();
  await queuePartialPrompt(app, ["7"], {
    frontendVersion: "1.49.1",
    intent: { trigger_source: "omnicam_track" },
  });
  assert.equal(app.calls.length, 1);
  const [number, batchCount, options] = app.calls[0];
  assert.equal(number, 0);
  assert.equal(batchCount, 1);
  assert.deepEqual(options.queueNodeIds, ["7"]);
  assert.deepEqual(options.intent, { trigger_source: "omnicam_track" });
});

test("modern options signature: a current frontend also uses QueuePromptOptions", async () => {
  const app = recordingApp();
  await queuePartialPrompt(app, ["7"], { frontendVersion: "1.52.7" });
  assert.equal(app.calls.length, 1);
  assert.deepEqual(app.calls[0][2].queueNodeIds, ["7"]);
});

test("never tries both: exactly one queuePrompt call per invocation", async () => {
  const legacy = recordingApp();
  await queuePartialPrompt(legacy, ["7"], { frontendVersion: "1.48.7" });
  assert.equal(legacy.calls.length, 1);

  const modern = recordingApp();
  await queuePartialPrompt(modern, ["7"], { frontendVersion: "1.51.0" });
  assert.equal(modern.calls.length, 1);
});

test("refuses to guess when the frontend version is unavailable", async () => {
  await assert.rejects(
    () => queuePartialPrompt({ queuePrompt() {} }, ["7"], { frontendVersion: "" }),
    /frontend version/i,
  );
});

test("refuses to queue without a partial-execution target", async () => {
  const app = recordingApp();
  await assert.rejects(
    () => queuePartialPrompt(app, [], { frontendVersion: "1.52.7" }),
    /target/i,
  );
  await assert.rejects(
    () => queuePartialPrompt(app, null, { frontendVersion: "1.52.7" }),
    /target/i,
  );
  assert.equal(app.calls.length, 0);
});

test("getFrontendVersion reads the ComfyUI global", () => {
  assert.equal(
    getFrontendVersion({ __COMFYUI_FRONTEND_VERSION__: "1.50.2" }),
    "1.50.2",
  );
  assert.equal(getFrontendVersion({}), "");
});

test("QUEUE_OPTIONS_SIGNATURE_MIN is the proven cutover", () => {
  assert.equal(QUEUE_OPTIONS_SIGNATURE_MIN, "1.49.1");
});
