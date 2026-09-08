// Director scene library: New / Open / Save / Reset adoption logic.

import test from "node:test";
import assert from "node:assert/strict";

// confirmAction / promptText reach for ComfyUI's dialog manager on window.app;
// without it (and with no DOM) they resolve "no", which would abort every flow
// before the part under test. A minimal stub makes confirm say yes and prompt
// echo its default.
globalThis.window = {
  app: {
    extensionManager: {
      dialog: {
        confirm: async () => true,
        prompt: async ({ defaultValue }) => defaultValue,
      },
    },
  },
};

const { adoptSceneState, newScene, resetScene, saveScene, openSceneDialog } =
  await import("../../web-src/director/scene-library.js");
const { defaultState } = await import("../../web-src/director/core.js");

function makeUi({ scenesResponse } = {}) {
  const widget = (value) => ({ value });
  const calls = { fetch: [], restore: 0, serialize: 0, status: [] };
  const ui = {
    app: globalThis.window.app,
    stateWidget: widget(JSON.stringify(defaultState())),
    widthWidget: widget(1280),
    heightWidget: widget(720),
    fpsWidget: widget(24),
    durationWidget: widget(5),
    modeWidget: widget("omni_ref"),
    cardWidget: widget(""),
    state: defaultState(),
    history: { clear() {} },
    setStatus: (message) => calls.status.push(message),
    refreshCameraPreviews() {},
    syncUpstreamInputs() {},
    restoreFromWidgets() {
      calls.restore += 1;
      ui.state = JSON.parse(ui.stateWidget.value);
    },
    serialize() {
      calls.serialize += 1;
      ui.stateWidget.value = JSON.stringify(ui.state);
    },
    api: {
      fetchApi: async (path, options = {}) => {
        calls.fetch.push({ path, options });
        if (options.method === "POST") {
          const body = JSON.parse(options.body);
          return { ok: true, json: async () => ({ slug: "saved-slug", name: body.name, size: 10 }) };
        }
        if (path === "/majoor/omnicam/scenes") {
          return { ok: true, json: async () => ({ scenes: scenesResponse || [] }) };
        }
        return { ok: true, json: async () => ({ slug: "x", name: "X", state: { ...defaultState(), fps: 48 } }) };
      },
    },
  };
  return { ui, calls };
}

test("adoptSceneState pushes the incoming format onto the number widgets", () => {
  const { ui, calls } = makeUi();
  const incoming = { ...defaultState(), width: 1920, height: 1080, fps: 30, duration_frames: 300, render_mode: "graybox" };

  adoptSceneState(ui, incoming, { name: "Shot 7" });

  assert.equal(ui.widthWidget.value, 1920);
  assert.equal(ui.heightWidget.value, 1080);
  assert.equal(ui.fpsWidget.value, 30);
  assert.equal(ui.durationWidget.value, 10); // 300 / 30
  assert.equal(ui.modeWidget.value, "graybox");
  assert.equal(calls.restore, 1);
  assert.equal(ui.sceneName, "Shot 7");
  assert.equal(JSON.parse(ui.sceneBaseline).metadata.scene_name, "Shot 7");
});

test("newScene adopts a blank default state", async () => {
  const { ui, calls } = makeUi();
  await newScene(ui);
  assert.equal(calls.restore, 1);
  assert.equal(ui.durationWidget.value, defaultState().duration_frames / defaultState().fps);
  assert.equal(ui.sceneName, "");
});

test("saveScene posts name + state and remembers the returned name as the baseline", async () => {
  const { ui, calls } = makeUi();
  ui.state.metadata = { scene_name: "old" };

  await saveScene(ui);

  const post = calls.fetch.find((call) => call.options.method === "POST");
  assert.ok(post, "a POST was made");
  assert.equal(post.path, "/majoor/omnicam/scenes");
  const body = JSON.parse(post.options.body);
  assert.equal(body.name, "old"); // prompt echoed the suggested name
  assert.ok(body.state && typeof body.state === "object");
  assert.equal(ui.sceneName, "old");
  assert.equal(JSON.parse(ui.sceneBaseline).metadata.scene_name, "old");
});

test("resetScene restores the captured baseline", async () => {
  const { ui, calls } = makeUi();
  ui.sceneBaseline = JSON.stringify({ ...defaultState(), fps: 12, duration_frames: 60, metadata: { scene_name: "base" } });

  await resetScene(ui);

  assert.equal(ui.fpsWidget.value, 12);
  assert.equal(ui.durationWidget.value, 5); // 60 / 12
  assert.equal(calls.restore, 1);
  assert.equal(ui.sceneName, "base");
});

test("resetScene with no baseline is a no-op with a status", async () => {
  const { ui, calls } = makeUi();
  ui.sceneBaseline = "";
  await resetScene(ui);
  assert.equal(calls.restore, 0);
  assert.match(calls.status.at(-1), /revert/i);
});

test("openSceneDialog reports an empty library instead of showing a picker", async () => {
  const { ui, calls } = makeUi({ scenesResponse: [] });
  await openSceneDialog(ui);
  assert.equal(calls.restore, 0);
  assert.match(calls.status.at(-1), /no saved scenes/i);
});
