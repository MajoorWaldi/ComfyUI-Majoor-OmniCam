import test from "node:test";
import assert from "node:assert/strict";

import { confirmAction, promptText } from "../../web-src/director/ui-services.js";

// Regression: ComfyUI's own extensionManager.dialog renders a PrimeVue dialog
// teleported to document.body at PrimeVue's z-index (~1100). The OmniCam
// workbench backdrop (.oc-workbench-backdrop, web-src/workbench/styles.js) is
// also appended to document.body, but at z-index 100000 -- so while Director
// is open inside it, ComfyUI's own confirm/prompt dialog still fires but
// paints underneath the workbench veil and is invisible (e.g. "Delete camera
// and its N keyframe(s)?" on camera deletion). confirmAction/promptText must
// route to the OmniCam-authored omnicamModal fallback instead whenever a
// workbench is open, since that one is guaranteed to stack on top.
//
// No jsdom in this repo's node:test lane -- document.body is left undefined
// so omnicamModal() takes its own documented early-return path instead of
// building a real DOM (see ui-services.js's `if (typeof document ===
// "undefined" || !document.body) return Promise.resolve(...)`).
function withGlobals({ hasWorkbench, dialog }, fn) {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  globalThis.window = { app: { extensionManager: { dialog } } };
  globalThis.document = {
    querySelector: (selector) => (hasWorkbench && selector === ".oc-workbench-backdrop" ? {} : null),
    body: undefined,
  };
  return Promise.resolve(fn()).finally(() => {
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalDocument === undefined) delete globalThis.document; else globalThis.document = originalDocument;
  });
}

test("confirmAction uses ComfyUI's own dialog when no workbench is open", async () => {
  let askedViaDialog = false;
  const dialog = { confirm: async () => { askedViaDialog = true; return true; } };

  const result = await withGlobals({ hasWorkbench: false, dialog }, () => confirmAction("Title", "Message"));

  assert.equal(askedViaDialog, true);
  assert.equal(result, true);
});

test("confirmAction skips ComfyUI's dialog while a workbench modal is open", async () => {
  let askedViaDialog = false;
  const dialog = { confirm: async () => { askedViaDialog = true; return true; } };

  const result = await withGlobals({ hasWorkbench: true, dialog }, () => confirmAction("Title", "Message"));

  assert.equal(askedViaDialog, false, "dialog.confirm must not fire -- it would render under the workbench veil");
  assert.equal(result, false);
});

test("promptText uses ComfyUI's own dialog when no workbench is open", async () => {
  let askedViaDialog = false;
  const dialog = { prompt: async () => { askedViaDialog = true; return "value"; } };

  const result = await withGlobals({ hasWorkbench: false, dialog }, () => promptText("Title", "Message", "default"));

  assert.equal(askedViaDialog, true);
  assert.equal(result, "value");
});

test("promptText skips ComfyUI's dialog while a workbench modal is open", async () => {
  let askedViaDialog = false;
  const dialog = { prompt: async () => { askedViaDialog = true; return "value"; } };

  const result = await withGlobals({ hasWorkbench: true, dialog }, () => promptText("Title", "Message", "default"));

  assert.equal(askedViaDialog, false, "dialog.prompt must not fire -- it would render under the workbench veil");
  assert.equal(result, null);
});

test("confirmAction still falls back to omnicamModal when ComfyUI's dialog manager is unreachable, workbench or not", async () => {
  const result = await withGlobals({ hasWorkbench: false, dialog: null }, () => confirmAction("Title", "Message"));
  assert.equal(result, false);
});
