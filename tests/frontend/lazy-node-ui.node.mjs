import assert from "node:assert/strict";
import test from "node:test";

import { attachWhenLoaded } from "../../web-src/lazy-node-ui.js";

/** A load that resolves only when the test says so. */
function deferred() {
  let release;
  const promise = new Promise((resolve) => { release = resolve; });
  return { promise, release };
}

test("a node removed while loading is never attached", async () => {
  const node = {};
  const gate = deferred();
  let attached = false;
  const attaching = attachWhenLoaded(node, () => gate.promise.then(() => () => { attached = true; }));

  node.onRemoved();
  gate.release();
  await attaching;
  assert.equal(attached, false, "attaching a deleted node leaks its DOM widget and WebGL context");
});

test("a node that survives the load is attached", async () => {
  const node = {};
  const attaching = attachWhenLoaded(node, async () => (target) => { target.attached = true; });
  await attaching;
  assert.equal(node.attached, true);
});

test("the shim hands onRemoved back once the attach has run", async () => {
  const node = {};
  await attachWhenLoaded(node, async () => () => {});
  assert.equal(node.onRemoved?.__omnicamShim, undefined);
});

test("no hook other than onRemoved is touched", async () => {
  // Guards against reinstating the replay this module used to do: re-entering
  // ComfyUI's graph-configured path a second time re-wraps the node's widgets
  // accessor until the getter chain overflows the stack, which aborts the
  // workflow load outright.
  const node = {};
  const gate = deferred();
  const attaching = attachWhenLoaded(node, () => gate.promise.then(() => () => {}));
  for (const hook of ["onConfigure", "onAfterGraphConfigured", "onExecuted", "onConnectionsChange"]) {
    assert.equal(node[hook], undefined, `${hook} must be left to ComfyUI`);
  }
  gate.release();
  await attaching;
});

test("a pre-existing onRemoved still runs, and is restored afterwards", async () => {
  const calls = [];
  const node = { onRemoved() { calls.push("original"); } };
  const original = node.onRemoved;
  const gate = deferred();
  const attaching = attachWhenLoaded(node, () => gate.promise.then(() => () => {}));

  node.onRemoved();
  assert.deepEqual(calls, ["original"], "the shim must not swallow the existing handler");

  gate.release();
  await attaching;
  assert.equal(node.onRemoved, original);
});

test("an onRemoved another extension installed during the window is not clobbered", async () => {
  const node = {};
  const gate = deferred();
  const attaching = attachWhenLoaded(node, () => gate.promise.then(() => () => {}));

  const theirs = function () {};
  node.onRemoved = theirs;

  gate.release();
  await attaching;
  assert.equal(node.onRemoved, theirs);
});

test("a failed load restores the hook instead of leaving the node shimmed", async () => {
  const node = {};
  const errors = [];
  const realError = console.error;
  console.error = (...args) => errors.push(args);
  try {
    await attachWhenLoaded(node, async () => { throw new Error("offline"); });
  } finally {
    console.error = realError;
  }
  assert.equal(node.onRemoved, undefined);
  assert.equal(errors.length, 1);
});

test("the refine controller does not call the native timers as methods", async () => {
  // Storing window.setTimeout on an instance makes `this.setTimer(...)` invoke
  // it with the controller as receiver, which browsers reject with "Illegal
  // invocation". Node binds its own timers, so only a receiver check catches
  // it here. dispose() throwing aborted the graph clear that precedes a
  // workflow load, which left the canvas empty.
  const { RefineController } = await import("../../web-src/extractor/refine-controls.js");
  const controller = new RefineController({ onRefine() {} });
  for (const name of ["setTimer", "clearTimer"]) {
    assert.notEqual(controller[name], globalThis[name === "setTimer" ? "setTimeout" : "clearTimeout"],
      `${name} must be wrapped, not the bare global`);
  }
  controller.schedule();
  controller.dispose();
});
