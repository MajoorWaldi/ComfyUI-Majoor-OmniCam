import assert from "node:assert/strict";
import test from "node:test";

import { clearExtractorCache } from "../../web-src/extractor/clear-cache.js";

function withConfirmDialog(confirmResult, fn) {
  const original = globalThis.window;
  globalThis.window = { app: { extensionManager: { dialog: { confirm: async () => confirmResult } } } };
  return Promise.resolve(fn()).finally(() => {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  });
}

function makeUi({ jobId = "", reconJobId = "" } = {}) {
  const calls = [];
  return {
    calls,
    state: { jobId },
    dispatch: (action) => calls.push(["dispatch", action]),
    client: { stopSolve: async (id) => calls.push(["stopSolve", id]) },
    reconstruction: {
      state: { jobId: reconJobId },
      client: {
        stopJob: async (id) => calls.push(["stopJob", id]),
        clearCache: async () => { calls.push(["clearCache"]); return { cleared: true, entries_removed: 2 }; },
      },
      dispatch: (action) => calls.push(["reconDispatch", action]),
    },
    node: {
      widgets: [
        { name: "omnicam_extracted_motion_scene_json", value: '{"version":1}' },
        { name: "omnicam_extracted_track_fingerprint", value: "fp123" },
        { name: "omnicam_extractor_source", value: "clip.mp4 [input]" },
        { name: "method", value: "auto" },
      ],
      setDirtyCanvas: () => calls.push(["setDirtyCanvas"]),
    },
    overlay: { clear: () => calls.push(["overlayClear"]) },
    diagnostics: { clear: () => calls.push(["diagnosticsClear"]) },
    result: { raw: { some: "thing" }, refined: null },
    sourceKey: "annotated_input:clip.mp4",
    render: () => calls.push(["render"]),
    refreshSource: () => calls.push(["refreshSource"]),
  };
}

test("clearExtractorCache does nothing when the user declines the confirm dialog", async () => {
  const ui = makeUi({ jobId: "job_1" });

  const cleared = await withConfirmDialog(false, () => clearExtractorCache(ui));

  assert.equal(cleared, false);
  assert.deepEqual(ui.calls, []);
  assert.equal(ui.state.jobId, "job_1"); // untouched
});

test("clearExtractorCache stops active jobs, wipes disk cache, and resets node state", async () => {
  const ui = makeUi({ jobId: "job_camera_1", reconJobId: "job_recon_1" });

  const cleared = await withConfirmDialog(true, () => clearExtractorCache(ui));

  assert.equal(cleared, true);
  const kinds = ui.calls.map((c) => c[0]);
  assert.ok(kinds.includes("stopSolve"));
  assert.ok(kinds.includes("stopJob"));
  assert.ok(kinds.includes("clearCache"));
  assert.ok(kinds.includes("reconDispatch"));
  assert.ok(kinds.includes("render"));
  assert.ok(kinds.includes("refreshSource"));

  // clearCache on the server must happen, not be skipped by an early return.
  assert.ok(ui.calls.some((c) => c[0] === "clearCache"));

  // The three cache widgets are emptied; unrelated widgets are untouched.
  const byName = Object.fromEntries(ui.node.widgets.map((w) => [w.name, w.value]));
  assert.equal(byName.omnicam_extracted_motion_scene_json, "");
  assert.equal(byName.omnicam_extracted_track_fingerprint, "");
  assert.equal(byName.omnicam_extractor_source, "");
  assert.equal(byName.method, "auto");

  // The node-level extractor state is reset back to a fresh IDLE shape.
  assert.equal(ui.state.jobId, "");
  assert.equal(ui.state.solveState, "IDLE");
  assert.equal(ui.sourceKey, "");
  assert.deepEqual(ui.result, { raw: null, refined: null });
});

test("clearExtractorCache skips stopping jobs that were never running", async () => {
  const ui = makeUi(); // no jobId, no reconJobId

  await withConfirmDialog(true, () => clearExtractorCache(ui));

  const kinds = ui.calls.map((c) => c[0]);
  assert.ok(!kinds.includes("stopSolve"));
  assert.ok(!kinds.includes("stopJob"));
  assert.ok(kinds.includes("clearCache"));
});

test("clearExtractorCache reports failure and stops short when the server call fails", async () => {
  const ui = makeUi();
  ui.reconstruction.client.clearCache = async () => { throw new Error("disk error"); };

  const cleared = await withConfirmDialog(true, () => clearExtractorCache(ui));

  assert.equal(cleared, false);
  // Widgets must not be wiped if the server-side clear never actually happened.
  const sourceWidget = ui.node.widgets.find((w) => w.name === "omnicam_extractor_source");
  assert.equal(sourceWidget.value, "clip.mp4 [input]");
});

test("clearExtractorCache confirms through ui.app's dialog, not window.app", async () => {
  const ui = makeUi({ jobId: "job_1" });
  let askedVia = "";
  // The real fix: the button passes ExtractorUI.app so the dialog manager
  // resolves. window.app here is a decoy with NO dialog.
  ui.app = { extensionManager: { dialog: { confirm: async () => { askedVia = "ui.app"; return true; } } } };
  const prevWindow = globalThis.window;
  globalThis.window = { app: { extensionManager: {} } };
  try {
    const cleared = await clearExtractorCache(ui);
    assert.equal(cleared, true);
    assert.equal(askedVia, "ui.app");
    assert.ok(ui.calls.some((c) => c[0] === "clearCache"), "the server cache wipe ran");
  } finally {
    if (prevWindow === undefined) delete globalThis.window; else globalThis.window = prevWindow;
  }
});
