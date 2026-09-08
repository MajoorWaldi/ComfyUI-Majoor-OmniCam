import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// web-src/scene/objects.js re-exports through scene.js, which pulls in the
// ComfyUI runtime -- not importable under a bare `node --test`. The keyboard
// routing (single vs. multi delete, F2 rename) is covered functionally in
// commands.node.mjs with a stubbed ui; here we pin the shape of the pieces
// that live in closures / runtime-coupled modules.

const read = (rel) => readFile(new URL(rel, import.meta.url), "utf8");

test("deleteSelectedObjects deletes the whole selection under one checkpoint and spares the subject", async () => {
  const src = await read("../../web-src/scene/objects.js");
  assert.match(src, /export async function deleteSelectedObjects\(ui\)/);
  const body = src.slice(src.indexOf("export async function deleteSelectedObjects"));
  assert.match(body, /id !== "subject"/, "the canonical subject card is filtered out");
  assert.match(body, /ids\.length === 1\) return deleteObject\(ui, ids\[0\]\)/, "a lone selection keeps the per-object confirm/wording");
  assert.match(body, /confirmAction\(/, "a batch delete still asks once");
  assert.match(body, /ui\.checkpoint\("Delete objects"\)/, "one undo step for the batch");
  assert.match(body, /child\.parent_id && doomed\.has\(child\.parent_id\)\) child\.parent_id = null/, "surviving children are unparented");
  assert.match(body, /ui\.selectedObjectIds\?\.clear\?\.\(\)/, "selection is cleared after the delete");
});

test("both outliner selection closures track a shift anchor and select the contiguous run", async () => {
  const editorGlobal = await read("../../web-src/event-bindings/editor-global.js");
  const outliner = await read("../../web-src/scene/outliner.js");
  for (const src of [editorGlobal, outliner]) {
    assert.match(src, /ui\.outlinerAnchorId = object\.id/, "a shift anchor is remembered on plain / ctrl click");
    assert.match(src, /event\.shiftKey && ui\.outlinerAnchorId/, "shift + anchor takes the range branch");
    assert.match(src, /order\.slice\(Math\.min\(a, b\), Math\.max\(a, b\) \+ 1\)/, "range is the contiguous run in tree order");
    assert.match(src, /if \(event\.ctrlKey \|\| event\.metaKey\)/, "ctrl / cmd still toggles a single row");
  }
});

test("double-clicking an object name in the tree starts an inline rename", async () => {
  const outliner = await read("../../web-src/scene/outliner.js");
  assert.match(outliner, /function startInlineRename\(ui, object, span\)/);
  assert.match(outliner, /objectName\.addEventListener\("dblclick"/);
  assert.match(outliner, /startInlineRename\(ui, object, objectName\)/);
  assert.match(outliner, /ui\.checkpoint\("Rename object"\)/);
  // Enter commits, Escape reverts.
  assert.match(outliner, /event\.key === "Enter".*finish\(true\)/s);
  assert.match(outliner, /event\.key === "Escape".*finish\(false\)/s);
});

test("the scene / outliner panel is registered as its own keyboard zone", async () => {
  const commands = await read("../../web-src/commands.js");
  assert.match(commands, /\["scene", '\[data-tab-panel="scene"\]'\]/, "scene zone selector");
  assert.match(commands, /case "scene": return sceneKeymap\(ui, event\)/, "routed to sceneKeymap");
  assert.match(commands, /function sceneKeymap\(ui, event\)/);
  const scene = commands.slice(commands.indexOf("function sceneKeymap"));
  assert.match(scene, /Delete" \|\| event\.key === "Backspace"/);
  assert.match(scene, /ui\.selectedObjectIds\?\.size > 1\) ui\.deleteSelectedObjects/);
  assert.match(scene, /event\.key === "F2"/);
});
