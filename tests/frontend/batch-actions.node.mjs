import test from "node:test";
import assert from "node:assert/strict";

import { toggleSelectedObjects } from "../../web-src/scene/batch-actions.js";

function createUi() {
  const calls = [];
  return {
    state: {
      objects: [
        { id: "obj_1", name: "One", enabled: true },
        { id: "obj_2", name: "Two", enabled: true },
        { id: "obj_3", name: "Three", enabled: true },
      ],
    },
    selectedObjectId: "obj_2",
    selectedObjectIds: new Set(["obj_1", "obj_2"]),
    checkpoint(label) { calls.push(["checkpoint", label]); },
    serialize() { calls.push(["serialize"]); },
    refreshObjects() { calls.push(["refreshObjects"]); },
    render() { calls.push(["render"]); },
    setStatus(message) { calls.push(["status", message]); },
    calls,
  };
}

test("toggleSelectedObjects hides selected objects through enabled and leaves non-selected objects unchanged", () => {
  const ui = createUi();

  toggleSelectedObjects(ui, false);

  assert.equal(ui.state.objects[0].enabled, false);
  assert.equal(ui.state.objects[1].enabled, false);
  assert.equal(ui.state.objects[2].enabled, true);
  assert.equal("visible" in ui.state.objects[0], false);
  assert.equal("visible" in ui.state.objects[1], false);
  assert.ok(ui.calls.some(([kind]) => kind === "serialize"), "state was serialized");
});
