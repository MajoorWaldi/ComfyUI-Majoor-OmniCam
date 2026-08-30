import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("an upstream video plays as a live subject texture instead of a frozen frame", async () => {
  // Regression: loadMediaUrl used to sniff video-vs-image from a resolved
  // `/view?filename=...&subfolder=...` URL, whose extension sits mid-string
  // rather than at a word boundary -- so a real Load Video was silently
  // decoded as a still image and never played. The caller now passes the
  // already-known isVideo flag straight through, and both the connected and
  // the client-only-preview paths start playback rather than leaving the
  // first frame frozen.
  const source = await readFile(new URL("../../web-src/dom-media.js", import.meta.url), "utf8");
  assert.match(source, /loadMediaUrl\(ui,\s*object,\s*url,\s*isCurrent\s*=\s*\(\)\s*=>\s*true,\s*isVideo\s*=\s*null\)/);
  assert.match(source, /loadMediaUrl\(ui, subject, url, isCurrent, isVideo\)/);
  assert.match(source, /await video\.play\(\)\.catch/);
  assert.match(source, /media instanceof HTMLVideoElement && media\.paused\) media\.play\(\)\.catch/);
});
