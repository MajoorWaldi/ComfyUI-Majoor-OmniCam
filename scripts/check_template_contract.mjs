// The Director template is pure markup, but every `data-role` / `data-act` in it
// is a binding contract with web-src/event-bindings/ and the director methods.
// Restyling the template is easy; silently dropping a hook while doing it is the
// failure mode this guard exists to prevent.
//
// It checks both directions:
//   - every hook the JavaScript looks up must exist in the built markup;
//   - every hook in the markup must be looked up by some JavaScript.
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SOURCE_DIR = join(ROOT, "web-src");
const TEMPLATE_DIR = join(SOURCE_DIR, "template");

// Hooks the running UI creates or consumes dynamically rather than declaring in
// the template, so their absence from the markup is expected.
const RUNTIME_ONLY = new Set([
  "key-frame",     // stamped on generated keyframe buttons
  "camera-id",     // stamped on generated outliner rows
  "object-id",
  "context-menu",  // appended by buildRoot() as a real element
]);

// data-act hooks wired with querySelector (not querySelectorAll): a second copy
// in the markup would be a dead button.
const SINGLE_BOUND_ACTS = new Set([
  "curve-fit", "curve-handles", "curve-zoom-in", "curve-zoom-out", "frame-target",
  "key-first", "key-last", "load-audio", "next-frame", "next-key", "previous-frame",
  "previous-key", "update-key", "view-key",
]);

async function jsFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await jsFiles(path)));
    else if (entry.name.endsWith(".js")) found.push(path);
  }
  return found;
}

const templateSources = [];
const behaviourSources = [];
for (const file of await jsFiles(SOURCE_DIR)) {
  const source = await readFile(file, "utf8");
  (file.startsWith(TEMPLATE_DIR) || file.endsWith(`${"template"}.js`) ? templateSources : behaviourSources)
    .push({ file, source });
}

const markup = templateSources.map((entry) => entry.source).join("\n");
const behaviour = behaviourSources.map((entry) => entry.source).join("\n");

function declared(attribute) {
  return new Set([...markup.matchAll(new RegExp(`${attribute}="([^"$]+)"`, "g"))].map((m) => m[1]));
}

function referenced(attribute) {
  const found = new Set();
  for (const source of [behaviour, markup]) {
    for (const m of source.matchAll(new RegExp(`\\[${attribute}="([^"$\\]]+)"\\]`, "g"))) found.add(m[1]);
    for (const m of source.matchAll(new RegExp(`dataset\\.${attribute.replace(/^data-/, "")}\\s*===?\\s*"([^"]+)"`, "g"))) {
      found.add(m[1]);
    }
  }
  return found;
}

const ATTRIBUTES = [
  "data-role", "data-act", "data-object-type", "data-preset", "data-shake", "data-lens",
  "data-blocking-scene", "data-select-mode", "data-transform-mode", "data-tab", "data-tab-panel",
  "data-menu", "data-channel-filter", "data-curve-mode", "data-tangent-mode", "data-interp",
  "data-graph-tab", "data-dope-channel",
];

let failed = false;
for (const attribute of ATTRIBUTES) {
  const inMarkup = declared(attribute);
  const inCode = referenced(attribute);

  if (attribute === "data-act") {
    const inert = [...inMarkup].filter((name) => !inCode.has(name));
    if (inert.length) {
      failed = true;
      console.error(`${attribute}: present in the template but nothing listens for it:`);
      for (const name of inert.sort()) console.error(`  ${name}`);
    }
  }

  const missing = [...inCode].filter((name) => !inMarkup.has(name) && !RUNTIME_ONLY.has(name));
  if (missing.length) {
    failed = true;
    console.error(`${attribute}: referenced by JavaScript but absent from the template:`);
    for (const name of missing.sort()) console.error(`  ${name}`);
  }

  // A duplicated data-role means querySelector only ever wires the first one,
  // leaving the other control dead on screen.
  const duplicates = [...markup.matchAll(new RegExp(`${attribute}="([^"$]+)"`, "g"))]
    .map((m) => m[1])
    .reduce((counts, name) => counts.set(name, (counts.get(name) || 0) + 1), new Map());
  if (attribute === "data-role" || attribute === "data-act") {
    const doubled = [...duplicates].filter(([name, count]) =>
      count > 1 && (attribute === "data-role" || SINGLE_BOUND_ACTS.has(name)));
    if (doubled.length) {
      failed = true;
      console.error(`${attribute}: declared more than once, so only the first is ever bound:`);
      for (const [name, count] of doubled) console.error(`  ${name} (x${count})`);
    }
  }
}

const templateFiles = templateSources.map((entry) => relative(ROOT, entry.file)).sort();
if (failed) {
  console.error(`\nTemplate sources checked: ${templateFiles.join(", ")}`);
  process.exit(1);
}
console.log(`Template contract OK across ${templateFiles.length} template source(s).`);
