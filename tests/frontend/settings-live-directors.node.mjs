// Migration plan Task 17: liveDirectors (settings.js) must mean "mounted
// interactive workbenches", not "every Director node that exists" -- a
// closed Director's compact shell/runtime is never registered, so live
// quality changes, locale live-apply and the keyboard-shortcut router
// (commands.js's directorForTarget/anyDirectorsLive) never reach it.

import test from "node:test";
import assert from "node:assert/strict";

import {
  anyDirectorsLive,
  applyViewportQuality,
  directorForTarget,
  registerDirector,
  unregisterDirector,
} from "../../web-src/settings.js";

function fakeWorkbench({ disposed = false, hasWebgl = true } = {}) {
  const calls = [];
  return {
    calls,
    disposed,
    webgl: hasWebgl ? { adaptiveQuality: null, onQualityDowngrade: null } : null,
    cameraWebgl: hasWebgl ? { adaptiveQuality: null, onQualityDowngrade: null } : null,
    requestRender: (reason) => calls.push(["requestRender", reason]),
    renderCameraView: () => calls.push(["renderCameraView"]),
    setStatus: () => calls.push(["setStatus"]),
  };
}

test("anyDirectorsLive() is false with no workbench open, true once one registers, false again once it unregisters", () => {
  assert.equal(anyDirectorsLive(), false);
  const ui = fakeWorkbench();
  registerDirector(ui);
  try {
    assert.equal(anyDirectorsLive(), true);
  } finally {
    unregisterDirector(ui);
  }
  assert.equal(anyDirectorsLive(), false);
});

test("a disposed (closed) workbench does not count as live even if never explicitly unregistered", () => {
  const ui = fakeWorkbench({ disposed: true });
  registerDirector(ui);
  try {
    assert.equal(anyDirectorsLive(), false);
  } finally {
    unregisterDirector(ui);
  }
});

test("applyViewportQuality() only reaches registered, non-disposed workbenches with a mounted viewport", () => {
  const open = fakeWorkbench();
  const closed = fakeWorkbench({ disposed: true });
  const openNoViewportYet = fakeWorkbench({ hasWebgl: false });

  registerDirector(open);
  registerDirector(closed);
  registerDirector(openNoViewportYet);
  try {
    applyViewportQuality("performance");
    assert.equal(open.webgl.adaptiveQuality !== null, true, "an open workbench's viewport must be reconfigured");
    assert.deepEqual(closed.calls, [], "a disposed workbench must never be touched");
    assert.deepEqual(openNoViewportYet.calls.filter((c) => c[0] === "requestRender" || c[0] === "renderCameraView").length > 0, true);
  } finally {
    unregisterDirector(open);
    unregisterDirector(closed);
    unregisterDirector(openNoViewportYet);
  }
});

test("directorForTarget() only resolves a click/key target inside a registered, non-disposed workbench's root", () => {
  const openRoot = { contains: (t) => t === "inside-open" };
  const closedRoot = { contains: (t) => t === "inside-closed" };
  const open = fakeWorkbench();
  open.root = openRoot;
  const closed = fakeWorkbench({ disposed: true });
  closed.root = closedRoot;

  registerDirector(open);
  registerDirector(closed);
  try {
    // Node-shaped stand-in: directorForTarget only requires `instanceof Node`,
    // which does not exist in plain Node -- give it a Node-tagged object.
    class FakeNode {}
    globalThis.Node = FakeNode;
    const target = new FakeNode();
    open.root.contains = () => true;
    closed.root.contains = () => true; // even if it would also match, disposed must lose
    assert.equal(directorForTarget(target), open);
  } finally {
    unregisterDirector(open);
    unregisterDirector(closed);
    delete globalThis.Node;
  }
});
