import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const roots = ["omnicam", "scripts", "tests", "web-src"];
const extensions = new Set([".js", ".mjs", ".py", ".ts", ".vue"]);
const limit = 800;

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return extensions.has(extname(entry.name)) ? [path] : [];
  }));
  return nested.flat();
}

const files = (await Promise.all(roots.map(sourceFiles))).flat();
const oversized = [];
for (const file of files) {
  const lines = (await readFile(file, "utf8")).split(/\r?\n/).length;
  if (lines > limit) oversized.push({ file: relative(process.cwd(), file), lines });
}

if (oversized.length) {
  for (const item of oversized.sort((a, b) => b.lines - a.lines)) {
    console.error(`${item.lines}\t${item.file}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Source line limit passed: ${files.length} files, maximum ${limit} lines.`);
}
