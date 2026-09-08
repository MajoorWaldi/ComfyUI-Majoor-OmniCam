import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const files = args.filter((arg) => !arg.startsWith("--"));

if (files.length !== 2) {
  throw new Error("usage: compare_vite_graphs.mjs <linux.json> <windows.json> [--report-only|--strict]");
}

const [a, b] = await Promise.all(
  files.map(async (path) => JSON.parse(await readFile(path, "utf8"))),
);

const left = new Set(a.modules);
const right = new Set(b.modules);

const onlyLeft = [...left].filter((id) => !right.has(id)).sort();
const onlyRight = [...right].filter((id) => !left.has(id)).sort();

console.log(JSON.stringify({
  left: { platform: a.platform, module_count: a.module_count },
  right: { platform: b.platform, module_count: b.module_count },
  common_count: [...left].filter((id) => right.has(id)).length,
  delta: onlyLeft.length + onlyRight.length,
  only_left: onlyLeft,
  only_right: onlyRight,
}, null, 2));

if (strict && (onlyLeft.length || onlyRight.length)) {
  process.exitCode = 1;
}
