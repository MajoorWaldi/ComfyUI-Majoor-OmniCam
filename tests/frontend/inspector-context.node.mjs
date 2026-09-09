import test from "node:test";
import assert from "node:assert/strict";

import { inspectorContext, inspectorPanelName, INSPECTOR_MODES } from "../../web-src/inspector/context.js";

test("context is the selected entity unless a secondary mode is set", () => {
  assert.equal(inspectorContext({ inspectorMode: undefined }), "entity");
  assert.equal(inspectorContext({ inspectorMode: "entity" }), "entity");
  assert.equal(inspectorContext({ inspectorMode: "motion" }), "motion");
  assert.equal(inspectorContext({ inspectorMode: "health" }), "health");
});

test("panel name maps entity selection and secondary modes to a data-tab-panel", () => {
  assert.equal(inspectorPanelName({ selectedEntity: "object" }), "scene");
  assert.equal(inspectorPanelName({ selectedEntity: "camera" }), "camera");
  assert.equal(inspectorPanelName({ selectedEntity: "camera_target" }), "camera");
  assert.equal(inspectorPanelName({ selectedEntity: "camera_path" }), "camera");
  assert.equal(inspectorPanelName({ inspectorMode: "motion", selectedEntity: "object" }), "motion");
  assert.equal(inspectorPanelName({ inspectorMode: "shot", selectedEntity: "camera" }), "display");
  assert.equal(inspectorPanelName({ inspectorMode: "health", selectedEntity: "camera" }), "health");
});

test("the mode vocabulary is entity plus the three secondary modes", () => {
  assert.deepEqual(INSPECTOR_MODES, ["entity", "motion", "shot", "health"]);
});
