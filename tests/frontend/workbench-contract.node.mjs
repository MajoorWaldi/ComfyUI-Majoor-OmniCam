import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Locks the frontend mounting contract for each product: Director still
// mounts a compact shell (lazy, cheap) that defers to a modal workbench on
// open, per docs/superpowers/plans/2026-09-16-director-extractor-workbench.md.
// Extractor and Monitor instead mount their full panel inline, directly from
// their product module, with no compact shell and no modal (see
// web-src/extractor/index.js's attachExtractor / web-src/monitor/index.js's
// attachMonitor). The Python node schemas must not shift underneath any of
// this -- it is a frontend-only lifecycle concern.

function readSource(relativePath) {
  return readFileSync(resolve(relativePath), "utf8");
}

function inputNames(source) {
  return [...source.matchAll(/(?:IO\.[A-Za-z]+(?:\.\d+)?(?:\([^)]*\))?\.Input|media_input|OMNICAM_MOTION_SCENE\.Input)\(\s*"([^"]+)"/g)]
    .map((match) => match[1]);
}

test("main.js nodeCreated() mounts compact shells, not the full workbench UI, for Director", () => {
  const source = readSource("web-src/main.js");
  assert.match(source, /import\(["']\.\/director\/shell\.js["']\)/,
    "Director nodeCreated() must import the compact shell module (web-src/director/shell.js)");
  assert.doesNotMatch(source, /import\(["']\.\/director\.js["']\)/,
    "Director nodeCreated() must no longer dynamically import the full editor UI directly");
});

test("main.js nodeCreated() mounts the full panel inline for Extractor, no compact shell", () => {
  const source = readSource("web-src/main.js");
  assert.match(source, /import\(["']\.\/extractor\/index\.js["']\)/,
    "Extractor nodeCreated() must dynamically import the full panel module (web-src/extractor/index.js)");
  assert.doesNotMatch(source, /import\(["']\.\/extractor\/shell\.js["']\)/,
    "Extractor nodeCreated() must not import a compact shell module -- it no longer exists");
});

test("main.js nodeCreated() mounts the full panel inline for Monitor, no compact shell", () => {
  const source = readSource("web-src/main.js");
  assert.match(source, /import\(["']\.\/monitor\/index\.js["']\)/,
    "Monitor nodeCreated() must dynamically import the full panel module (web-src/monitor/index.js)");
  assert.doesNotMatch(source, /import\(["']\.\/monitor\/shell\.js["']\)/,
    "Monitor nodeCreated() must not import a compact shell module -- it no longer exists");
});

test("MajoorOmniCamDirector Python schema is unchanged by the workbench migration", () => {
  const source = readSource("omnicam/nodes/director.py");
  assert.deepEqual(inputNames(source), [
    "state_json",
    "recording_path",
    "card_asset",
    "width",
    "height",
    "fps",
    "duration_seconds",
    "render_mode",
    "image",
    "video",
    "audio",
    "scene_3d",
    "solved_scene",
  ], "Director inputs must not change for a frontend-only lifecycle migration");
  assert.match(source, /node_id="MajoorOmniCamDirector"/);
});

test("MajoorOmniCamExtractor Python schema is unchanged by the workbench migration", () => {
  const source = readSource("omnicam/nodes/extractor.py");
  assert.match(source, /class MajoorOmniCamExtractor\(IO\.ComfyNode\)/);
  // The migration must not touch inputs/outputs at all; snapshot the raw
  // define_schema block so any accidental edit fails loudly here rather than
  // silently shipping alongside the UI lifecycle refactor.
  const schemaBlock = source.slice(source.indexOf("def define_schema"), source.indexOf("def execute"));
  assert.ok(schemaBlock.includes("node_id=\"MajoorOmniCamExtractor\""));
});
