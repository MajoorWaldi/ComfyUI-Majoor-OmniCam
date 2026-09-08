import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(import.meta.dirname, "..", "..");
const SCRIPT = resolve(ROOT, "scripts", "compare_vite_graphs.mjs");

function writeReport(directory, name, overrides) {
  const report = {
    schema_version: 1,
    platform: name,
    node: process.version,
    module_count: 4,
    modules: ["A.js", "B.js", "C.js", "D.js"],
    chunks: [
      {
        name: "omnicam",
        facadeModuleId: "web-src/main.js",
        isEntry: true,
        isDynamicEntry: false,
        dynamicImports: [],
        modules: ["A.js", "B.js"],
      },
      {
        name: "lazy-director",
        facadeModuleId: "web-src/director.js",
        isEntry: false,
        isDynamicEntry: true,
        dynamicImports: [],
        modules: ["C.js", "D.js"],
      },
    ],
    ...overrides,
  };
  const path = join(directory, `${name}.json`);
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return path;
}

function compare(left, right, strict = true) {
  const args = [SCRIPT, left, right, strict ? "--strict" : "--report-only"];
  const result = spawnSync(process.execPath, args, { cwd: ROOT, encoding: "utf8" });
  assert.equal(result.stderr, "");
  return {
    ...result,
    report: JSON.parse(result.stdout),
  };
}

test("strict comparison fails when chunk membership differs despite identical modules", () => {
  const dir = mkdtempSync(join(tmpdir(), "omnicam-vite-graph-"));
  const linux = writeReport(dir, "linux", {});
  const windows = writeReport(dir, "windows", {
    chunks: [
      {
        name: "omnicam",
        facadeModuleId: "web-src/main.js",
        isEntry: true,
        isDynamicEntry: false,
        dynamicImports: [],
        modules: ["A.js", "C.js"],
      },
      {
        name: "lazy-director",
        facadeModuleId: "web-src/director.js",
        isEntry: false,
        isDynamicEntry: true,
        dynamicImports: [],
        modules: ["B.js", "D.js"],
      },
    ],
  });

  const result = compare(linux, windows);

  assert.equal(result.status, 1);
  assert.equal(result.report.module_delta, 0);
  assert.equal(result.report.chunk_delta, 4);
});

test("strict comparison fails when dynamic imports differ", () => {
  const dir = mkdtempSync(join(tmpdir(), "omnicam-vite-graph-"));
  const linux = writeReport(dir, "linux", {});
  const windows = writeReport(dir, "windows", {
    chunks: [
      {
        name: "omnicam",
        facadeModuleId: "web-src/main.js",
        isEntry: true,
        isDynamicEntry: false,
        dynamicImports: ["web-src/monitor.js"],
        modules: ["A.js", "B.js"],
      },
      {
        name: "lazy-director",
        facadeModuleId: "web-src/director.js",
        isEntry: false,
        isDynamicEntry: true,
        dynamicImports: [],
        modules: ["C.js", "D.js"],
      },
    ],
  });

  const result = compare(linux, windows);

  assert.equal(result.status, 1);
  assert.equal(result.report.dynamic_import_delta, 1);
});

test("strict comparison fails when public entrypoints differ", () => {
  const dir = mkdtempSync(join(tmpdir(), "omnicam-vite-graph-"));
  const linux = writeReport(dir, "linux", {});
  const windows = writeReport(dir, "windows", {
    chunks: [
      {
        name: "omnicam",
        facadeModuleId: "web-src/main.js",
        isEntry: true,
        isDynamicEntry: false,
        dynamicImports: [],
        modules: ["A.js", "B.js"],
      },
      {
        name: "director",
        facadeModuleId: "web-src/director.js",
        isEntry: true,
        isDynamicEntry: false,
        dynamicImports: [],
        modules: ["C.js", "D.js"],
      },
    ],
  });

  const result = compare(linux, windows);

  assert.equal(result.status, 1);
  assert.equal(result.report.entrypoint_delta, 1);
});
