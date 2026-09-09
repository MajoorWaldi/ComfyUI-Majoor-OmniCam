import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import { normalizeModuleId, resolvePublicEntrySourceId } from "../../vite.config.mjs";

test("public entry aliases resolve to canonical Vite paths", () => {
  const resolved = resolvePublicEntrySourceId("C:\\ComfyUI\\web\\omnicam-commands.js");

  assert.equal(resolved, resolve("web-src", "commands.js").replaceAll("\\", "/"));
});

test("module graph ids canonicalize Windows paths and ComfyUI external scripts", () => {
  assert.equal(normalizeModuleId("C:\\ComfyUI\\scripts\\app.js?import"), "comfyui:scripts/app.js");
  assert.equal(normalizeModuleId("D:\\ComfyUI\\scripts\\api.js"), "comfyui:scripts/api.js");
  assert.equal(normalizeModuleId(resolve("web-src", "scene.js")), "web-src/scene.js");
});
