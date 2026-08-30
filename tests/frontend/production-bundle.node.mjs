import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const webDir = new URL("../../web/", import.meta.url);
const chunkDir = new URL("../../web-chunks/", import.meta.url);

const chunkNames = async () => (await readdir(chunkDir)).filter((name) => name.endsWith(".js"));
const chunkSource = (name) => readFile(new URL(name, chunkDir), "utf8");

/**
 * The chunks the browser must fetch before the extension can register --
 * omnicam.js plus everything reachable from it through *static* imports.
 * A dynamic `import()` is deliberately not followed: that is the whole point.
 */
async function eagerChunks() {
  const staticImport = /(?:^|;|\n)\s*import\s*(?:[^'"]*?from\s*)?["']\.\/([^"']+)["']/g;
  const eager = new Set();
  const queue = ["omnicam.js"];
  while (queue.length) {
    const name = queue.pop();
    if (eager.has(name)) continue;
    eager.add(name);
    const source = await chunkSource(name);
    for (const [, target] of source.matchAll(staticImport)) queue.push(target);
  }
  return eager;
}

test("ComfyUI sees one OmniCam JavaScript extension entry", async () => {
  // ComfyUI globs `**/*.js` under WEB_DIRECTORY and imports every hit, so a
  // stray chunk here would be loaded eagerly and defeat the code splitting.
  const files = (await readdir(webDir)).filter((name) => name.endsWith(".js"));
  assert.deepEqual(files, ["omnicam.js"]);
});

test("legacy frontend facades removed by the Vite alias resolver stay absent", async () => {
  // These three files used to re-export the resolved implementation. Vite now
  // resolves every consumer directly to that implementation, so retaining the
  // physical facades only leaves duplicate, unreachable source files behind.
  for (const name of ["omnicam-core.js", "omnicam-i18n.js", "omnicam-ui.js"]) {
    await assert.rejects(access(new URL(`../../web-src/${name}`, import.meta.url)));
  }
});

test("the public entry is a stub pointing at the served chunk directory", async () => {
  const stub = await readFile(new URL("omnicam.js", webDir), "utf8");
  // The hop is relative so a renamed custom-node folder still resolves, and it
  // must match CHUNK_URL_PREFIX in omnicam/routes_chunks.py.
  assert.match(stub, /import "\.\.\/majoor-omnicam-chunks\/omnicam\.js";/);
});

test("the bundle registers only the Monitor product class", async () => {
  const sources = await Promise.all((await chunkNames()).map(chunkSource));
  const bundle = sources.join("\n");
  assert.match(bundle, /Majoor\.OmniCam\.Monitor/);
  assert.match(bundle, /MajoorOmniCamMonitor/);
});

test("the bundle keeps ComfyUI's own modules at the extension URL depth", async () => {
  // The chunk route is mounted one level under /extensions/ precisely so this
  // relative specifier still resolves to ComfyUI's /scripts/app.js.
  const sources = await Promise.all((await chunkNames()).map(chunkSource));
  const bundle = sources.join("\n");
  assert.match(bundle, /from "\.\.\/\.\.\/scripts\/app\.js"/);
  assert.doesNotMatch(bundle, /from "\/scripts\//);
});

test("no product UI is built into the startup path", async () => {
  // Each of the three nodes attaches its UI from a dynamic import in
  // web-src/main.js, so none of their markup may reach the eager chunk.
  const eager = await eagerChunks();
  const startup = (await Promise.all([...eager].map(chunkSource))).join("\n");
  // Markers unique to each product's markup. ".viewport-wrap" would not do:
  // the eagerly loaded key interceptor names it in its panel-selector map.
  assert.doesNotMatch(startup, /camera-previews/, "the Director template leaked into the startup path");
  assert.doesNotMatch(startup, /quality-timeline/, "the Extractor template leaked into the startup path");
  assert.doesNotMatch(startup, /majoor-omnicam/, "a product shell leaked into the startup path");
});

test("three.js and mediabunny stay off ComfyUI's startup path", async () => {
  // The reason the bundle is split at all: a user who never places a Director
  // or an Extractor must not download or parse a 3-D engine and a video muxer.
  const eager = await eagerChunks();
  const sources = await Promise.all([...eager].map(chunkSource));
  const startup = sources.join("\n");
  assert.doesNotMatch(startup, /THREE\.WebGLRenderer|WebGLRenderer\b/, "three.js leaked into the startup path");
  assert.doesNotMatch(startup, /WebMOutputFormat/, "mediabunny leaked into the startup path");
});

test("the startup payload stays far below the whole bundle", async () => {
  const eager = await eagerChunks();
  const sizes = await Promise.all((await chunkNames()).map(async (name) => [
    name, (await stat(new URL(name, chunkDir))).size,
  ]));
  const total = sizes.reduce((sum, [, bytes]) => sum + bytes, 0);
  const startup = sizes.reduce((sum, [name, bytes]) => sum + (eager.has(name) ? bytes : 0), 0);
  // Budget, not a measurement: it was ~7% of a 2.1 MB bundle once the products
  // moved behind nodeCreated. Raise it deliberately, never to make a red build
  // go green -- a static import of a product module is what usually breaks it.
  assert.ok(startup / total < 0.15, `startup payload is ${(100 * startup / total).toFixed(1)}% of the bundle`);
});
