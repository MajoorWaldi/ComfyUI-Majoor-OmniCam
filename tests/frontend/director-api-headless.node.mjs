import test from "node:test";
import assert from "node:assert/strict";

import { DirectorRuntime } from "../../web-src/director/runtime.js";
import { attachDirectorApi } from "../../web-src/director-api/index.js";
import { DIRECTOR_API_VERSION, DIRECTOR_OPS, DIRECTOR_QUERIES } from "../../web-src/director-api/constants.js";

// Migration plan Task 7: the semantic Director API must mutate/serialize
// canonical state with no workbench attached at all -- not a mocked DOM, an
// actually absent one. DirectorRuntime carries none of Object/Camera/
// viewport DOM; if executeDirectorTransaction() reached for `ui.root` or a
// canvas anywhere on this path it would throw here.

function withFakeRaf(fn) {
  const realRaf = globalThis.requestAnimationFrame;
  const realCaf = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = (cb) => { cb(); return 1; };
  globalThis.cancelAnimationFrame = () => {};
  try {
    return fn();
  } finally {
    globalThis.requestAnimationFrame = realRaf;
    globalThis.cancelAnimationFrame = realCaf;
  }
}

function widget(name, value) {
  return { name, value };
}

function fakeNode() {
  const widgets = [
    widget("state_json", "{}"),
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

test("director-api mutates and serializes canonical state with no workbench attached", () => {
  withFakeRaf(() => {
    const node = fakeNode();
    const runtime = new DirectorRuntime(node, {});
    attachDirectorApi(runtime);
    assert.equal(runtime.workbench, null);

    const cameraId = runtime.state.cameras[0].id;
    const result = runtime.directorApi.execute({
      version: DIRECTOR_API_VERSION,
      id: "headless-rename-1",
      description: "headless rename",
      operations: [
        { type: DIRECTOR_OPS.CAMERA_RENAME, cameraId, name: "Headless Camera" },
      ],
    });

    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(runtime.state.cameras[0].name, "Headless Camera");
    const serialized = JSON.parse(node.widgets.find((w) => w.name === "state_json").value);
    assert.equal(serialized.cameras[0].name, "Headless Camera",
      "the committed transaction must reach the node's state_json widget with no editor open");
  });
});

test("director-api query answers with no selection when no workbench is attached", () => {
  const node = fakeNode();
  const runtime = new DirectorRuntime(node, {});
  attachDirectorApi(runtime);

  const result = runtime.directorApi.query({ type: DIRECTOR_QUERIES.SELECTION_GET });
  assert.equal(result.selection.objectId, null);
  assert.equal(result.selection.entity, null);
});
