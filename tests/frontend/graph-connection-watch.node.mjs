import test from "node:test";
import assert from "node:assert/strict";

import { watchGraphConnections } from "../../web-src/graph-connection-watch.js";

test("watchGraphConnections fans LGraph.onConnectionChange out to every subscriber", () => {
  const graph = {};
  const node = { graph };
  const seen = [];
  watchGraphConnections(node, (n) => seen.push(["a", n?.id ?? null]));
  watchGraphConnections(node, (n) => seen.push(["b", n?.id ?? null]));

  graph.onConnectionChange({ id: 7 });
  assert.deepEqual(seen, [["a", 7], ["b", 7]]);
});

test("it chains an existing graph hook instead of clobbering it", () => {
  const order = [];
  const graph = { onConnectionChange: () => order.push("original") };
  watchGraphConnections({ graph }, () => order.push("watcher"));

  graph.onConnectionChange({ id: 1 });
  assert.deepEqual(order, ["original", "watcher"]);
});

test("the returned disposer removes just that subscriber; a throwing one is isolated", () => {
  const graph = {};
  const calls = [];
  const off = watchGraphConnections({ graph }, () => { throw new Error("boom"); });
  watchGraphConnections({ graph }, () => calls.push("survivor"));

  assert.doesNotThrow(() => graph.onConnectionChange({ id: 2 }));
  assert.deepEqual(calls, ["survivor"]);

  off();
  calls.length = 0;
  graph.onConnectionChange({ id: 3 });
  assert.deepEqual(calls, ["survivor"], "still fires the survivor after the thrower is removed");
});

test("no graph yet -> a harmless no-op disposer", () => {
  const off = watchGraphConnections({ graph: null }, () => {});
  assert.equal(typeof off, "function");
  assert.doesNotThrow(off);
});
