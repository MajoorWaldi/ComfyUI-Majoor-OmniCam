import test from "node:test";
import assert from "node:assert/strict";

import { createPreviewCache, createPreviewQueue, previewKey } from "../../web-src/assets/preview-cache.js";

test("previewKey folds id, fingerprint and version", () => {
  assert.equal(previewKey({ id: "a", thumbnail: "t.webp", version: 2 }), "a::t.webp::2");
  assert.equal(previewKey({ id: "a", file: "a.glb" }), "a::a.glb::2");
});

test("cache evicts the least-recently-used entry past max", () => {
  const cache = createPreviewCache({ max: 2 });
  cache.set("a", "urlA");
  cache.set("b", "urlB");
  cache.get("a"); // touch a -> b is now LRU
  cache.set("c", "urlC");
  assert.equal(cache.has("b"), false);
  assert.deepEqual(cache.keys().sort(), ["a", "c"]);
});

test("queue collapses duplicate keys onto one promise", async () => {
  const queue = createPreviewQueue();
  let runs = 0;
  const job = () => {
    runs += 1;
    return Promise.resolve("done");
  };
  const [p1, p2] = [queue.enqueue("k", job), queue.enqueue("k", job)];
  assert.equal(p1, p2);
  assert.equal(await p1, "done");
  assert.equal(runs, 1);
});

test("queue runs one job at a time", async () => {
  const queue = createPreviewQueue();
  const order = [];
  let peakActive = 0;
  const make = (label) => async () => {
    peakActive = Math.max(peakActive, queue.active);
    await new Promise((r) => setTimeout(r, 5));
    order.push(label);
  };
  await Promise.all([queue.enqueue("a", make("a")), queue.enqueue("b", make("b")), queue.enqueue("c", make("c"))]);
  assert.deepEqual(order, ["a", "b", "c"]);
  assert.equal(peakActive, 1);
});

test("a rejected job does not stall the queue", async () => {
  const queue = createPreviewQueue();
  await assert.rejects(queue.enqueue("bad", () => Promise.reject(new Error("nope"))));
  assert.equal(await queue.enqueue("ok", () => Promise.resolve(42)), 42);
});
