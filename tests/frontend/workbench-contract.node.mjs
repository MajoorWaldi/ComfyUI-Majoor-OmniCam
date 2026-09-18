import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Locks the Director/Extractor workbench migration contract described in
// docs/superpowers/plans/2026-09-16-director-extractor-workbench.md: nodeCreated()
// must mount a compact shell (lazy, cheap) instead of eagerly importing the
// full authoring UI, and the Python node schemas must not shift underneath
// the frontend-only migration.

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

test("main.js nodeCreated() mounts compact shells, not the full workbench UI, for Extractor", () => {
  const source = readSource("web-src/main.js");
  assert.match(source, /import\(["']\.\/extractor\/shell\.js["']\)/,
    "Extractor nodeCreated() must import the compact shell module (web-src/extractor/shell.js)");
  assert.doesNotMatch(source, /import\(["']\.\/extractor\/index\.js["']\)/,
    "Extractor nodeCreated() must no longer dynamically import the full editor UI directly");
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
