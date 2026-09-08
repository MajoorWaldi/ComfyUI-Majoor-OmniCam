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

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function setDiff(left, right) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  return {
    onlyLeft: [...leftSet].filter((id) => !rightSet.has(id)).sort(),
    onlyRight: [...rightSet].filter((id) => !leftSet.has(id)).sort(),
  };
}

function normalizeModuleList(values = []) {
  return uniqueSorted(values.map((value) => String(value).replaceAll("\\", "/")));
}

function normalizeChunk(chunk) {
  const facadeModuleId = chunk.facadeModuleId ?? chunk.facade ?? null;
  const normalizedFacade = facadeModuleId ? String(facadeModuleId).replaceAll("\\", "/") : null;
  const name = chunk.name ? String(chunk.name) : "anonymous";
  const kind = chunk.isEntry ? "entry" : chunk.isDynamicEntry ? "lazy" : "chunk";
  const id = chunk.logicalId ? String(chunk.logicalId) : `${kind}:${normalizedFacade || name}`;

  return {
    id,
    name,
    facadeModuleId: normalizedFacade,
    isEntry: Boolean(chunk.isEntry),
    isDynamicEntry: Boolean(chunk.isDynamicEntry),
    dynamicImports: normalizeModuleList(chunk.dynamicImports),
    modules: normalizeModuleList(chunk.modules),
  };
}

function chunkMap(report) {
  return new Map((report.chunks || []).map((chunk) => {
    const normalized = normalizeChunk(chunk);
    return [normalized.id, normalized];
  }));
}

function pairwiseListDiff(leftMap, rightMap, property) {
  const rows = [];
  const ids = uniqueSorted([...leftMap.keys(), ...rightMap.keys()]);

  for (const id of ids) {
    const leftChunk = leftMap.get(id);
    const rightChunk = rightMap.get(id);

    if (!leftChunk || !rightChunk) {
      rows.push({
        chunk: id,
        only_left: leftChunk ? leftChunk[property] : [],
        only_right: rightChunk ? rightChunk[property] : [],
      });
      continue;
    }

    const diff = setDiff(leftChunk[property], rightChunk[property]);
    if (diff.onlyLeft.length || diff.onlyRight.length) {
      rows.push({
        chunk: id,
        only_left: diff.onlyLeft,
        only_right: diff.onlyRight,
      });
    }
  }

  return rows;
}

function chunkShape(report) {
  return [...chunkMap(report).values()]
    .map((chunk) => ({
      id: chunk.id,
      name: chunk.name,
      facadeModuleId: chunk.facadeModuleId,
      isEntry: chunk.isEntry,
      isDynamicEntry: chunk.isDynamicEntry,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function publicEntrypoints(report) {
  return chunkShape(report)
    .filter((chunk) => chunk.isEntry)
    .map((chunk) => chunk.id);
}

function countPairwiseDelta(rows) {
  return rows.reduce((total, row) => total + row.only_left.length + row.only_right.length, 0);
}

const left = normalizeModuleList(a.modules);
const right = normalizeModuleList(b.modules);
const moduleDiff = setDiff(left, right);
const leftChunks = chunkMap(a);
const rightChunks = chunkMap(b);
const chunkIdDiff = setDiff([...leftChunks.keys()].sort(), [...rightChunks.keys()].sort());
const chunkModuleDiffs = pairwiseListDiff(leftChunks, rightChunks, "modules");
const dynamicImportDiffs = pairwiseListDiff(leftChunks, rightChunks, "dynamicImports");
const entrypointDiff = setDiff(publicEntrypoints(a), publicEntrypoints(b));

const moduleDelta = moduleDiff.onlyLeft.length + moduleDiff.onlyRight.length;
const chunkIdDelta = chunkIdDiff.onlyLeft.length + chunkIdDiff.onlyRight.length;
const chunkModuleDelta = countPairwiseDelta(chunkModuleDiffs);
const dynamicImportDelta = countPairwiseDelta(dynamicImportDiffs);
const entrypointDelta = entrypointDiff.onlyLeft.length + entrypointDiff.onlyRight.length;
const delta = moduleDelta + chunkIdDelta + chunkModuleDelta + dynamicImportDelta + entrypointDelta;

console.log(JSON.stringify({
  left: { platform: a.platform, module_count: a.module_count },
  right: { platform: b.platform, module_count: b.module_count },
  common_count: left.filter((id) => right.includes(id)).length,
  delta,
  module_delta: moduleDelta,
  chunk_delta: chunkIdDelta + chunkModuleDelta,
  dynamic_import_delta: dynamicImportDelta,
  entrypoint_delta: entrypointDelta,
  only_left: moduleDiff.onlyLeft,
  only_right: moduleDiff.onlyRight,
  chunk_ids: {
    only_left: chunkIdDiff.onlyLeft,
    only_right: chunkIdDiff.onlyRight,
  },
  chunk_modules: chunkModuleDiffs,
  dynamic_imports: dynamicImportDiffs,
  public_entrypoints: {
    only_left: entrypointDiff.onlyLeft,
    only_right: entrypointDiff.onlyRight,
  },
  chunk_shape: {
    left: chunkShape(a),
    right: chunkShape(b),
  },
}, null, 2));

if (strict && delta) {
  process.exitCode = 1;
}
