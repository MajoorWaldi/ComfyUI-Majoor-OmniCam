import test from "node:test";
import assert from "node:assert/strict";
import { setImmediate as nextTurn } from "node:timers/promises";

import { waitForDirectorInline } from "./live-helpers.js";

test("Agent readiness awaits the lazy editor, WebGL and its batched serialization", async () => {
  const previousWindow = globalThis.window;
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  let finishMount;
  let finishWebgl;
  let serialize;
  let revision = 0;
  let ready = false;
  const events = [];
  const mount = new Promise(resolve => { finishMount = resolve; });
  const webglReady = new Promise(resolve => { finishWebgl = resolve; });
  try {
    globalThis.window = {
      agentAuditNode: {
        __majoorOmniCamDirectorRuntime: {
          agentBridge: { sessionId: "already-registered" },
          inlineView: { show: () => { events.push("mount"); return mount; } },
        },
      },
    };
    globalThis.requestAnimationFrame = (callback) => {
      events.push("frame");
      serialize?.();
      serialize = null;
      callback();
    };
    const waiting = waitForDirectorInline({
      evaluate(callback, handle) {
        assert.equal(handle, "agentAuditNode");
        return callback(handle);
      },
    }, "agentAuditNode").then(() => { ready = true; });

    await nextTurn();
    assert.equal(ready, false, "a registered session alone is not ready");
    assert.deepEqual(events, ["mount"]);

    serialize = () => { revision++; };
    finishMount({ webglReady });
    await nextTurn();
    assert.equal(ready, false, "WebGL initialization must finish before reading a revision");
    assert.deepEqual(events, ["mount"]);

    finishWebgl();
    await waiting;
    assert.equal(ready, true);
    assert.equal(revision, 1, "the initial widget serialization must finish first");
    assert.deepEqual(events, ["mount", "frame", "frame"]);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousAnimationFrame === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = previousAnimationFrame;
  }
});
