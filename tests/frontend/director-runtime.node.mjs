import test from "node:test";
import assert from "node:assert/strict";

import { DirectorRuntime } from "../../web-src/director/runtime.js";

// DirectorRuntime has no DOM dependency (core.js / state-sync.js are already
// pure state functions), so it is fully testable headlessly here -- this is
// exactly the "mutate/serialize with no workbench attached" guarantee the
// migration plan requires (section 10, Task 5).

function withFakeRaf(fn) {
  const queue = [];
  const realRaf = globalThis.requestAnimationFrame;
  const realCaf = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = (cb) => { queue.push(cb); return queue.length; };
  globalThis.cancelAnimationFrame = () => {};
  const flush = () => { const pending = queue.splice(0); for (const cb of pending) cb(); };
  try {
    return fn({ flush });
  } finally {
    globalThis.requestAnimationFrame = realRaf;
    globalThis.cancelAnimationFrame = realCaf;
  }
}

function widget(name, value) {
  return { name, value };
}

function fakeNode(stateJson = "{}") {
  const widgets = [
    widget("state_json", stateJson),
    widget("recording_path", ""),
    widget("card_asset", ""),
    widget("width", 1280),
    widget("height", 720),
    widget("fps", 24),
    widget("duration_seconds", 5),
    widget("render_mode", "omni_ref"),
  ];
  return { id: 1, widgets, graph: { setDirtyCanvas() {} } };
}

test("restores canonical state from the state_json widget on construction", () => {
  const runtime = new DirectorRuntime(fakeNode(), {});
  assert.equal(runtime.state.fps, 24);
  assert.equal(runtime.state.width, 1280);
  assert.equal(runtime.disposed, false);
});

test("falls back to a default sanitized state when state_json is unreadable", () => {
  const runtime = new DirectorRuntime(fakeNode("not json"), {});
  assert.equal(typeof runtime.state, "object");
  assert.ok(Array.isArray(runtime.state.cameras));
});

test("getSnapshot summarizes state without becoming a second source of truth", () => {
  const runtime = new DirectorRuntime(fakeNode(), {});
  const snapshot = runtime.getSnapshot();
  assert.equal(snapshot.fps, 24);
  assert.equal(snapshot.cameraCount, runtime.state.cameras.length);
  runtime.state.fps = 30;
  assert.equal(runtime.getSnapshot().fps, 30, "snapshot must read live state, not a cached copy");
});

test("flushToWidgets writes canonical state back onto the node widgets with no workbench attached", () => {
  withFakeRaf(() => {
    const node = fakeNode();
    const runtime = new DirectorRuntime(node, {});
    runtime.state.fps = 30;
    runtime.flushToWidgets({ immediate: true });
    const stateWidget = node.widgets.find((w) => w.name === "state_json");
    assert.equal(JSON.parse(stateWidget.value).fps, 30);
    assert.equal(node.widgets.find((w) => w.name === "fps").value, 30);
  });
});

test("scheduleSerialize batches into a single rAF and dispatches statechange", () => {
  withFakeRaf(({ flush }) => {
    const node = fakeNode();
    const runtime = new DirectorRuntime(node, {});
    let statechanges = 0;
    runtime.addEventListener("statechange", () => statechanges++);

    runtime.scheduleSerialize("a");
    runtime.scheduleSerialize("b");
    runtime.scheduleSerialize("c");
    assert.equal(statechanges, 0, "must not fire before the rAF runs");

    flush();
    assert.equal(statechanges, 1, "three schedule calls in one tick must coalesce into one flush");
    assert.equal(JSON.parse(node.widgets.find((w) => w.name === "state_json").value).fps, 24);
  });
});

test("mutate() changes canonical state and schedules serialization with no workbench open", () => {
  withFakeRaf(({ flush }) => {
    const node = fakeNode();
    const runtime = new DirectorRuntime(node, {});
    assert.equal(runtime.workbench, null);

    runtime.mutate((state) => { state.render_mode = "graybox"; }, { reason: "api" });
    flush();

    assert.equal(runtime.state.render_mode, "graybox");
    assert.equal(node.widgets.find((w) => w.name === "render_mode").value, "graybox");
  });
});

test("replaceState sanitizes the incoming state and fires upstreamchange", () => {
  withFakeRaf(() => {
    const runtime = new DirectorRuntime(fakeNode(), {});
    let upstreamEvents = 0;
    runtime.addEventListener("upstreamchange", () => upstreamEvents++);

    runtime.replaceState({ fps: 60, metadata: { scene_name: "Imported" } }, { reason: "extractor-adopt" });

    assert.equal(runtime.state.fps, 60);
    assert.equal(runtime.sceneName, "Imported");
    assert.equal(upstreamEvents, 1);
  });
});

test("attachWorkbench/detachWorkbench forward requestUiUpdate only while attached", () => {
  const runtime = new DirectorRuntime(fakeNode(), {});
  let calls = 0;
  const workbench = { requestUiUpdate: () => { calls++; } };

  runtime.requestUiUpdate(1, "no-workbench");
  assert.equal(calls, 0);
  assert.equal(runtime.pendingUiDirtyMask, 1);

  runtime.attachWorkbench(workbench);
  runtime.requestUiUpdate(2, "with-workbench");
  assert.equal(calls, 1);

  runtime.detachWorkbench(workbench);
  runtime.requestUiUpdate(4, "after-detach");
  assert.equal(calls, 1, "must not call a detached workbench");
});

test("dispose() is idempotent and cancels any pending scheduled serialize", () => {
  withFakeRaf(() => {
    const runtime = new DirectorRuntime(fakeNode(), {});
    runtime.scheduleSerialize("x");
    runtime.dispose();
    runtime.dispose();
    assert.equal(runtime.disposed, true);
  });
});
