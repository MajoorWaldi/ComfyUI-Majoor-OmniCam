import test from "node:test";
import assert from "node:assert/strict";

import { waitForComfyCanvas } from "./live-helpers.js";

function readyApp() {
  return {
    isGraphReady: true,
    extensionManager: { spinner: false },
    canvas: {
      canvas: { isConnected: true, getBoundingClientRect: () => ({ width: 800 }) },
    },
  };
}

async function checkReadiness(app, publishedApp, expected) {
  const previousWindow = globalThis.window;
  const previousAnimationFrame = globalThis.requestAnimationFrame;
  let frames = 0;
  let evaluated = false;
  try {
    globalThis.window = { comfyAPI: { app: { app } }, app: publishedApp };
    globalThis.requestAnimationFrame = (callback) => {
      frames++;
      callback();
    };
    await waitForComfyCanvas({
      async waitForFunction(predicate, arg, options) {
        assert.equal(Boolean(predicate()), expected);
        assert.equal(options.timeout, 30000);
        // Complete initialization so the helper can finish its paint barrier.
        const ready = readyApp();
        globalThis.window = { comfyAPI: { app: { app: ready } }, app: ready };
        assert.equal(predicate(), true);
        evaluated = true;
      },
      async evaluate(callback) {
        assert.equal(evaluated, true);
        return callback();
      },
    });
    assert.equal(frames, 2);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousAnimationFrame === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = previousAnimationFrame;
  }
}

test("readiness waits for canvas registration, not just a connected graph canvas", async () => {
  const app = readyApp();
  await checkReadiness(app, undefined, false);
  await checkReadiness(app, readyApp(), false);
});

test("readiness waits for saved workflow restoration to finish", async () => {
  const app = readyApp();
  app.extensionManager.spinner = true;
  await checkReadiness(app, app, false);
  app.extensionManager.spinner = false;
  await checkReadiness(app, app, true);
});

test("readiness tolerates missing startup state", async () => {
  await checkReadiness(undefined, undefined, false);
  const app = readyApp();
  delete app.extensionManager;
  await checkReadiness(app, app, false);
});

test("readiness still requires a live, visible canvas and initialized graph", async () => {
  const app = readyApp();
  app.isGraphReady = false;
  await checkReadiness(app, app, false);
  app.isGraphReady = true;
  app.canvas.canvas.isConnected = false;
  await checkReadiness(app, app, false);
  app.canvas.canvas.isConnected = true;
  app.canvas.canvas.getBoundingClientRect = () => ({ width: 0 });
  await checkReadiness(app, app, false);
  delete app.canvas;
  await checkReadiness(app, app, false);
});
