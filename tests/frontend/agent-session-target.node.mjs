import test from "node:test";
import assert from "node:assert/strict";
import { createSessionTarget } from "../../web-src/agent/session-target.js";

test("owning document wins over the visible workflow and disambiguates subgraphs", () => {
  const root = { id: "workflow-a" };
  const ui = { app: { rootGraph: { id: "visible-b" } } };
  const first = createSessionTarget(ui, { id: 42, graph: { id: "subgraph-1", rootGraph: root } })();
  const second = createSessionTarget(ui, { id: 42, graph: { id: "subgraph-2", rootGraph: root } })();
  assert.equal(first.document_id, "workflow-a");
  assert.notEqual(first.node_locator, second.node_locator);
  assert.notEqual(first.instance_id, second.instance_id);
});

test("unsaved legacy graphs receive stable ephemeral document IDs", () => {
  const graph = {};
  const one = createSessionTarget({}, { id: 1, graph });
  const two = createSessionTarget({}, { id: 2, graph });
  assert.equal(one().document_id, two().document_id);
  assert.equal(one().instance_id, one().instance_id);
  assert.notEqual(one().document_id, createSessionTarget({}, { id: 1, graph: {} })().document_id);
});
