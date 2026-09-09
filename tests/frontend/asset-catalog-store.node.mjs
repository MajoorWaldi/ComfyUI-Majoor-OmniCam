import test from "node:test";
import assert from "node:assert/strict";

import { createCatalogStore } from "../../web-src/assets/catalog-store.js";

function fakeApi(pages) {
  const calls = [];
  return {
    calls,
    list(filter) {
      calls.push(filter);
      const page = pages.shift() ?? { items: [], total: 0, kinds: {} };
      return Promise.resolve(page);
    },
  };
}

const row = (id, kind = "prop") => ({ id, kind, name: id, tags: [] });

test("refresh fills items, index, kinds and total; subscribers fire", async () => {
  const api = fakeApi([{ items: [row("a"), row("b")], total: 5, kinds: { prop: 5 } }]);
  const store = createCatalogStore(api);
  let hits = 0;
  store.subscribe(() => (hits += 1));
  await store.refresh();
  assert.deepEqual(store.state.items.map((i) => i.id), ["a", "b"]);
  assert.equal(store.get("b").name, "b");
  assert.equal(store.state.total, 5);
  assert.deepEqual(store.state.kinds, { prop: 5 });
  assert.ok(hits >= 2); // loading:true then settled
});

test("setFilter normalizes, resets offset and refetches", async () => {
  const api = fakeApi([
    { items: [row("a")], total: 1 },
    { items: [row("c", "character")], total: 1 },
  ]);
  const store = createCatalogStore(api);
  await store.refresh();
  await store.setFilter({ kind: "character", search: "HERO" });
  assert.equal(store.state.filter.kind, "character");
  assert.equal(store.state.filter.search, "hero");
  assert.equal(api.calls[1].offset, 0);
  assert.deepEqual(store.state.items.map((i) => i.id), ["c"]);
});

test("loadMore appends and stops once total is reached", async () => {
  const api = fakeApi([
    { items: [row("a"), row("b")], total: 3 },
    { items: [row("c")], total: 3 },
  ]);
  const store = createCatalogStore(api);
  await store.refresh();
  await store.loadMore();
  assert.deepEqual(store.state.items.map((i) => i.id), ["a", "b", "c"]);
  await store.loadMore(); // nothing left
  assert.equal(api.calls.length, 2);
});

test("a failing request is captured, not thrown", async () => {
  const store = createCatalogStore({
    list: () => Promise.reject(Object.assign(new Error("boom"), { code: "REQUEST_FAILED" })),
  });
  await store.refresh();
  assert.equal(store.state.error.code, "REQUEST_FAILED");
  assert.equal(store.state.loading, false);
});

test("upsert and removeLocal keep items and index in sync", async () => {
  const api = fakeApi([{ items: [row("a")], total: 1 }]);
  const store = createCatalogStore(api);
  await store.refresh();
  store.upsert(row("z"));
  assert.deepEqual(store.state.items.map((i) => i.id), ["z", "a"]);
  store.upsert({ ...row("a"), name: "renamed" });
  assert.equal(store.get("a").name, "renamed");
  store.removeLocal("a");
  assert.deepEqual(store.state.items.map((i) => i.id), ["z"]);
  assert.equal(store.get("a"), null);
});
