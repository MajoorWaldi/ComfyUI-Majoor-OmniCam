import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith("/scripts/app.js")) return { url: "data:text/javascript,export const app={};", shortCircuit: true };
    if (specifier.endsWith("/scripts/api.js")) return { url: "data:text/javascript,export const api={};", shortCircuit: true };
    if (specifier.endsWith("/omnicam-state-sync.js")) return { url: pathToFileURL(resolve("web-src/state-sync.js")).href, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});

const { restoreAssets } = await import("../../web-src/dom-media.js");
const { EditorHistory } = await import("../../web-src/director/history.js");
const { addMediaCard, removeObjectResources, updateSelectedObject } = await import("../../web-src/scene/objects.js");
const { onCurvePointerMove } = await import("../../web-src/curve-editor/interactions.js");
const { MonitorRefreshController } = await import("../../web-src/monitor/refresh.js");

function rootWithValues(values) {
  return {
    querySelector(selector) {
      const match = selector.match(/data-role="([^"]+)"/);
      return match ? values[match[1]] || null : null;
    },
    querySelectorAll(selector) {
      const item = this.querySelector(selector);
      return item ? [item] : [];
    },
  };
}

test("editor history cancelled transactions restore their snapshot without clearing redo", () => {
  let value = "initial";
  const history = new EditorHistory({ capture: () => value, restore: (snapshot) => { value = snapshot; } });
  history.checkpoint("Rename");
  value = "renamed";
  history.undo();
  assert.equal(history.canRedo, true);

  assert.equal(history.beginTransaction("Move object"), true);
  value = "temporary";
  assert.equal(history.cancelTransaction(), "Move object");

  assert.equal(value, "initial");
  assert.equal(history.canRedo, true);
  assert.equal(history.redo(), "Rename");
  assert.equal(value, "renamed");
});

test("object inspector numeric edits create one grouped undo checkpoint", () => {
  const object = { id: "cube", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [] };
  const checkpoints = [];
  const ui = {
    state: { objects: [object] },
    selectedEntity: "object",
    selectedObjectId: "cube",
    root: rootWithValues({ "object-x": { value: "4" } }),
    checkpoint: (label) => checkpoints.push(label),
    commitObjectEdit() {},
    refreshObjects() {},
    render() {},
  };

  updateSelectedObject(ui);
  updateSelectedObject(ui);

  assert.deepEqual(checkpoints, ["Edit object"]);
  assert.deepEqual(object.position, [4, 0, 0]);
});

test("adding a media card is its own undo entry", () => {
  const checkpoints = [];
  const clicks = [];
  const ui = {
    state: { objects: [] },
    root: rootWithValues({ file: { click: () => clicks.push("file") } }),
    checkpoint: (label) => checkpoints.push(label),
    serialize() {},
    refreshObjects() {},
    refreshKeys() {},
    render() {},
  };

  addMediaCard(ui);

  assert.deepEqual(checkpoints, ["Create media card"]);
  assert.equal(ui.state.objects.length, 1);
  assert.deepEqual(clicks, ["file"]);
});

test("restoreAssets reloads changed card assets and clears missing card media", () => {
  const calls = [];
  const oldMedia = { __omnicamAsset: "old.png [input]" };
  const ui = {
    disposed: false,
    state: { viewport_bg_image: "", viewport_bg_sequence: [], objects: [
      { id: "card", type: "card", asset: "new.png [input]" },
      { id: "empty", type: "card", asset: "" },
    ] },
    cardMediaById: new Map([["card", oldMedia], ["empty", { __omnicamAsset: "gone.png [input]" }]]),
    modelUrlsById: new Map(),
    loadMediaUrl: (object, url) => calls.push({ id: object.id, url }),
  };

  restoreAssets(ui);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].id, "card");
  assert.equal(ui.cardMediaById.has("empty"), false);
});

test("removing one duplicated card user does not unload a shared video still used by another card", () => {
  const video = { pauseCalls: 0, loadCalls: 0, pause() { this.pauseCalls += 1; }, load() { this.loadCalls += 1; }, removeAttribute() {}, srcObject: null };
  globalThis.HTMLVideoElement = class HTMLVideoElement {};
  Object.setPrototypeOf(video, globalThis.HTMLVideoElement.prototype);
  const ui = {
    objectUrls: { revoke() {} },
    cardMediaById: new Map([["a", video], ["b", video]]),
    modelUrlsById: new Map(),
    modelInfoById: new Map(),
    webgl: { removeModel() {} },
  };

  removeObjectResources(ui, "a");

  assert.equal(video.pauseCalls, 0);
  assert.equal(video.loadCalls, 0);
  assert.equal(ui.cardMediaById.get("b"), video);
});

test("curve drags create a single undo checkpoint on first mutation", () => {
  const key = { frame: 10, camera: { position: [0, 0, 0] }, interpolation: "linear" };
  const checkpoints = [];
  const ui = {
    state: { duration_frames: 120 },
    frame: 10,
    camera: { position: [0, 0, 0], target: [0, 0, -1], fov: 35, roll: 0 },
    curveZoomX: 1,
    curvePanX: 0,
    curveDrag: {
      key,
      channel: { id: "px", set: (camera, value) => { camera.position[0] = value; } },
      maximum: 10,
      minimum: 0,
      top: 0,
      graphHeight: 100,
      lastFrame: 119,
      left: 0,
      graphWidth: 100,
      startX: 0,
      startY: 50,
      pointerId: 7,
    },
    checkpoint: (label) => checkpoints.push(label),
    scheduleSerialize() {},
    render() {},
    refreshKeyEditor() {},
    drawCurveEditor() {},
  };
  const canvas = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }), clientWidth: 100 };
  const event = { pointerId: 7, currentTarget: canvas, clientX: 10, clientY: 25, shiftKey: true, preventDefault() {}, stopPropagation() {} };

  onCurvePointerMove(ui, event);
  onCurvePointerMove(ui, event);

  assert.deepEqual(checkpoints, ["Edit curve"]);
});

test("Monitor refresh drops a JSON result that resolves after dispose", async () => {
  let resolveJson;
  const api = {
    fetchApi: async () => ({
      ok: true,
      json: () => new Promise((resolve) => { resolveJson = resolve; }),
    }),
  };
  let snapshots = 0;
  const controller = new MonitorRefreshController(api, { onSnapshot: () => { snapshots += 1; } });
  const running = controller.refresh({ a: 1 });
  await Promise.resolve();
  controller.dispose();
  resolveJson({ live: true });
  await running;

  assert.equal(snapshots, 0);
});
