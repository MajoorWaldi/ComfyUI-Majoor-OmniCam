import test from "node:test";
import assert from "node:assert/strict";

import { collectTags, filterDefinitions, matchesFilter, normalizeFilter } from "../../web-src/assets/filters.js";

const DEFS = [
  { id: "omnicam.character.human_01", name: "Human 01", kind: "character", category: "characters", tags: ["human", "adult"] },
  { id: "omnicam.prop.chair_01", name: "Chair 01", kind: "prop", category: "props", tags: ["chair", "furniture"] },
  { id: "omnicam.vehicle.sedan_01", name: "Sedan 01", kind: "vehicle", category: "vehicles", tags: ["car"] },
];

test("normalizeFilter clamps kind and lowercases", () => {
  assert.deepEqual(normalizeFilter({ kind: "WEAPON", tag: " Hero ", search: "FOO" }), {
    kind: "all",
    tag: "hero",
    search: "foo",
  });
});

test("kind filter", () => {
  assert.deepEqual(filterDefinitions(DEFS, { kind: "character" }).map((d) => d.id), ["omnicam.character.human_01"]);
  assert.equal(filterDefinitions(DEFS, { kind: "all" }).length, 3);
});

test("tag filter is exact-membership", () => {
  assert.deepEqual(filterDefinitions(DEFS, { tag: "car" }).map((d) => d.id), ["omnicam.vehicle.sedan_01"]);
  assert.equal(filterDefinitions(DEFS, { tag: "fur" }).length, 0);
});

test("search covers id, name, kind, category and tags (substring)", () => {
  assert.equal(matchesFilter(DEFS[1], { search: "chair" }), true);
  assert.equal(matchesFilter(DEFS[1], { search: "props" }), true);
  assert.equal(matchesFilter(DEFS[1], { search: "01" }), true);
  assert.equal(matchesFilter(DEFS[1], { search: "sedan" }), false);
});

test("collectTags is sorted and de-duplicated", () => {
  assert.deepEqual(collectTags(DEFS), ["adult", "car", "chair", "furniture", "human"]);
});
