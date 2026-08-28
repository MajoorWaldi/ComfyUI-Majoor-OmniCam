// Fails when web-src/ uses a `THREE.<symbol>` that web-src/three-runtime.js
// does not re-export. Without this check, tree-shaking the three.js barrel
// would turn a forgotten symbol into a silent `undefined` at runtime instead of
// a build error.
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SOURCE_DIR = join(ROOT, "web-src");
const BARREL = join(SOURCE_DIR, "three-runtime.js");

async function jsFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await jsFiles(path)));
    else if (entry.name.endsWith(".js")) found.push(path);
  }
  return found;
}

const barrelSource = await readFile(BARREL, "utf8");
const exported = new Set(
  (barrelSource.match(/^\s{2}([A-Za-z0-9_]+),$/gm) || []).map((line) => line.trim().replace(/,$/, "")),
);

const used = new Map();
for (const file of await jsFiles(SOURCE_DIR)) {
  if (file === BARREL) continue;
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/\bTHREE\.([A-Za-z0-9_]+)/g)) {
    if (!used.has(match[1])) used.set(match[1], relative(ROOT, file));
  }
  // A module may also pull symbols out of the barrel by name rather than
  // through a THREE namespace; that counts as a use just the same.
  for (const match of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'][^"']*three-runtime\.js["']/g)) {
    for (const entry of match[1].split(",")) {
      const symbol = entry.trim().split(/\s+as\s+/)[0].trim();
      if (symbol && !used.has(symbol)) used.set(symbol, relative(ROOT, file));
    }
  }
}

const missing = [...used].filter(([name]) => !exported.has(name));
if (missing.length) {
  console.error("three-runtime.js is missing symbols used under web-src/:");
  for (const [name, file] of missing) console.error(`  THREE.${name}  (${file})`);
  console.error("\nAdd them to web-src/three-runtime.js.");
  process.exit(1);
}

const unused = [...exported].filter((name) => !used.has(name));
if (unused.length) {
  console.error(`three-runtime.js re-exports ${unused.length} unused symbol(s): ${unused.join(", ")}`);
  console.error("Remove them so the bundle stays minimal.");
  process.exit(1);
}

console.log(`three.js surface check passed: ${exported.size} symbols, all used.`);
