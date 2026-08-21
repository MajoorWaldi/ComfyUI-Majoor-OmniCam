import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";

test("ComfyUI sees one OmniCam JavaScript extension entry", async () => {
  const files = (await readdir(new URL("../../web/", import.meta.url))).filter((name) => name.endsWith(".js"));
  assert.deepEqual(files, ["omnicam.js"]);
});
