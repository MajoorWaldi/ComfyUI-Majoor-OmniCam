import test from "node:test";
import assert from "node:assert/strict";
import { attachDirectorAppMode } from "../../web-src/director/app-mode.js";

test("App remount reuses the editor, resizes it and cleans up observers", async () => {
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  let inApp = true;
  let shows = 0;
  let resizes = 0;
  const root = {
    isConnected: true, dataset: {},
    closest: () => inApp ? {} : null,
    getBoundingClientRect: () => ({ width: 360, height: 560 }),
    ownerDocument: { body: {} },
  };
  const editor = { scheduleResizeAndRender() { resizes++; } };
  const view = { async show() { shows++; return editor; } };
  const dispose = attachDirectorAppMode(root, view, {
    MutationObserver: Observer, ResizeObserver: Observer,
    requestAnimationFrame: (fn) => { queueMicrotask(fn); return 1; },
    cancelAnimationFrame() {},
  });
  await new Promise(setImmediate);
  assert.equal(root.dataset.appMode, "true");
  assert.equal(shows, 1);
  assert.equal(resizes, 1);
  observers[0].callback([{ addedNodes: [{}], removedNodes: [] }]);
  await new Promise(setImmediate);
  assert.equal(shows, 1, "rendering unrelated DOM must not trigger another render");
  inApp = false;
  observers[0].callback([{ addedNodes: [root], removedNodes: [] }]);
  await new Promise(setImmediate);
  assert.equal(root.dataset.appMode, undefined);
  assert.equal(shows, 1);
  dispose();
  assert.ok(observers.every((observer) => observer.disconnected));
});

test("disposing while the editor loads does not render the detached viewer", async () => {
  class Observer { observe() {} disconnect() {} }
  let resolve;
  let resizes = 0;
  const root = {
    isConnected: true, dataset: {}, closest: () => ({}),
    getBoundingClientRect: () => ({ width: 360, height: 560 }),
    ownerDocument: { body: {} },
  };
  const dispose = attachDirectorAppMode(root, {
    show: () => new Promise((done) => { resolve = done; }),
  }, {
    MutationObserver: Observer, ResizeObserver: Observer,
    requestAnimationFrame: (fn) => { queueMicrotask(fn); return 1; },
    cancelAnimationFrame() {},
  });
  await new Promise(setImmediate);
  dispose();
  resolve({ scheduleResizeAndRender() { resizes++; } });
  await new Promise(setImmediate);
  assert.equal(resizes, 0);
});
