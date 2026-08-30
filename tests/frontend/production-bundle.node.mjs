import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("ComfyUI sees one OmniCam JavaScript extension entry", async () => {
  const files = (await readdir(new URL("../../web/", import.meta.url))).filter((name) => name.endsWith(".js"));
  assert.deepEqual(files, ["omnicam.js"]);
});

test("the single production bundle registers only the Monitor product class", async () => {
  const bundle = await readFile(new URL("../../web/omnicam.js", import.meta.url), "utf8");
  assert.match(bundle, /Majoor\.OmniCam\.Monitor/);
  assert.match(bundle, /MajoorOmniCamMonitor/);
});
