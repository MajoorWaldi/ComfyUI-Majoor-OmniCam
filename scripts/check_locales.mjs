// Keeps the shipped locale catalogues honest against the source strings.
//
// Fails when a catalogue key no longer exists in web-src/ (stale translation)
// and reports how many source strings are still untranslated.
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SOURCE_DIR = join(ROOT, "web-src");
const LOCALE_DIR = join(SOURCE_DIR, "locales");

async function jsFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await jsFiles(path)));
    else if (entry.name.endsWith(".js")) found.push(path);
  }
  return found;
}

const sourceStrings = new Set();
for (const file of await jsFiles(SOURCE_DIR)) {
  if (file.startsWith(LOCALE_DIR)) continue;
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) sourceStrings.add(match[1]);
  for (const match of source.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)) sourceStrings.add(match[1]);
}

// A template literal can never match a catalogue key, so every t(`...`) call is
// a permanently untranslatable string. The count is ratcheted: it may fall, but
// a change that adds one fails, so the debt can only shrink.
const DYNAMIC_KEY_BUDGET = 76;
const DYNAMIC_KEY = /\bt\(\s*`/g;

let dynamic = 0;
const dynamicFiles = new Map();
for (const file of await jsFiles(SOURCE_DIR)) {
  if (file.startsWith(LOCALE_DIR)) continue;
  const hits = ((await readFile(file, "utf8")).match(DYNAMIC_KEY) || []).length;
  if (hits) {
    dynamic += hits;
    dynamicFiles.set(relative(ROOT, file), hits);
  }
}

let failed = false;
if (dynamic > DYNAMIC_KEY_BUDGET) {
  failed = true;
  console.error(`Untranslatable t(\`...\`) calls: ${dynamic}, budget ${DYNAMIC_KEY_BUDGET}.`);
  console.error("Use a static key with a {placeholder} and .replace() instead:");
  for (const [file, hits] of [...dynamicFiles].sort((a, b) => b[1] - a[1])) console.error(`  ${hits}	${file}`);
} else {
  console.log(`Untranslatable t(\`...\`) calls: ${dynamic} (budget ${DYNAMIC_KEY_BUDGET}).`);
  if (dynamic < DYNAMIC_KEY_BUDGET) {
    console.log(`  Budget can be lowered to ${dynamic} in scripts/check_locales.mjs.`);
  }
}
for (const entry of await readdir(LOCALE_DIR)) {
  if (!entry.endsWith(".js")) continue;
  const path = join(LOCALE_DIR, entry);
  const catalogue = Object.keys((await import(`file://${path.replace(/\\/g, "/")}`)).default);
  const stale = catalogue.filter((key) => !sourceStrings.has(key));
  const missing = [...sourceStrings].filter((key) => !catalogue.includes(key));
  if (stale.length) {
    failed = true;
    console.error(`${relative(ROOT, path)}: ${stale.length} stale key(s) no longer in web-src/:`);
    for (const key of stale) console.error(`  ${JSON.stringify(key)}`);
  }
  const coverage = (((catalogue.length - stale.length) / sourceStrings.size) * 100).toFixed(1);
  console.log(`${entry}: ${coverage}% coverage (${missing.length} untranslated of ${sourceStrings.size})`);
  if (missing.length) {
    console.log("  untranslated:");
    for (const key of missing.slice(0, 20)) console.log(`    ${JSON.stringify(key)}`);
    if (missing.length > 20) console.log(`    ... and ${missing.length - 20} more`);
  }
}

process.exit(failed ? 1 : 0);
