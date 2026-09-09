import assert from "node:assert/strict";
import test from "node:test";

import { MONITOR_NODE_CLASS, nodeClassOf } from "../../web-src/node-classes.js";

test("nodeClassOf recognizes a Monitor exposed through the constructor comfyClass", () => {
  class MonitorNode {}
  MonitorNode.comfyClass = MONITOR_NODE_CLASS;

  assert.equal(nodeClassOf(new MonitorNode()), MONITOR_NODE_CLASS);
});
