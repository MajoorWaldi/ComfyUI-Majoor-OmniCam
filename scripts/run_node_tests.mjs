import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function hasRegisteredTest(source) {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  return /^\s*(?:test|it)\s*\(/m.test(withoutComments);
}

export function discoverNodeTests(directory = resolve("tests/frontend")) {
  return readdirSync(directory)
    .filter((name) => name.endsWith(".node.mjs"))
    .sort()
    .map((name) => resolve(directory, name));
}

export function runNodeTests(files = discoverNodeTests()) {
  const empty = files.filter((file) => !hasRegisteredTest(readFileSync(file, "utf8")));
  if (empty.length) {
    throw new Error(`Node test modules without test registrations:\n${empty.join("\n")}`);
  }
  const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
  return result.status ?? 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    process.exitCode = runNodeTests();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
