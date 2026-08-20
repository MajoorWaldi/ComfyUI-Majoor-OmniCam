import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["omnicam", "scripts", "tests", "web-src", "docs", "examples"];
const extensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".py", ".toml", ".ts", ".vue"]);
const replacements = new Map([
  ["B\u00c3\u00a9zier", "Bézier"],
  ["Pl\u00c3\u00bccker", "Plücker"],
  ["support\u00c3\u00a9e", "supportée"],
  ["\u00c2\u00b7", "·"],
  ["\u00c2\u00b0", "°"],
  ["\u00e2\u20ac\u00a6", "…"],
  ["\u00e2\u20ac\u201d", "—"],
  ["\u00e2\u20ac\u201c", "–"],
  ["\u00e2\u2020\u2019", "→"],
  ["\u00e2\u2030\u02c6", "≈"],
  ["\u00e2\u2014\u008f", "●"],
  ["\u00e2\u2014\u2039", "○"],
  ["\u00e2\u02dc\u2026", "★"],
  ["\u00e2\u20ac\u00ba", "›"],
  ["\u00f0\u0178\u201c\u00b7", "📷"],
  ["\u00f0\u0178\u0152\u0090", "🌐"],
  ["\u00f0\u0178\u017d\u00af", "🎯"],
]);
const suspicious = /[\u00c2\u00c3\u00e2\u00f0\ufffd]|[\u0080-\u009f]/u;
const fix = process.argv.includes("--fix");

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const children = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(path);
    return extensions.has(extname(entry.name)) ? [path] : [];
  }));
  return children.flat();
}

const files = (await Promise.all(roots.map(filesBelow))).flat();
const failures = [];
let corrected = 0;
for (const file of files) {
  let text = await readFile(file, "utf8");
  if (fix) {
    const original = text;
    for (const [broken, valid] of replacements) text = text.replaceAll(broken, valid);
    if (text !== original) {
      await writeFile(file, text, "utf8");
      corrected += 1;
    }
  }
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (suspicious.test(line)) failures.push(`${file}:${index + 1}: ${line.trim()}`);
  });
}

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exitCode = 1;
} else {
  console.log(`Text encoding passed for ${files.length} files${fix ? `; corrected ${corrected}` : ""}.`);
}
