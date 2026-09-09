import test from "node:test";
import assert from "node:assert/strict";

import { defaultState, sanitizeState } from "../../web-src/director/core.js";
import { executeDirectorQuery } from "../../web-src/director-api/query.js";
import { DIRECTOR_QUERIES } from "../../web-src/director-api/constants.js";

function makeUi() {
  const state = sanitizeState(defaultState());
  state.metadata = {
    solve_health_v1: {
      source: "extractor",
      frames: [
        { frame: 0, state: "good", score: 0.98 },
        { frame: 1, state: "warning", score: 0.6 },
        { frame: 2, state: "bad" },
      ],
    },
  };
  return {
    state: sanitizeState(state),
    frame: 7,
    selectedEntity: "object",
    selectedObjectId: "subject",
    selectedObjectIds: new Set(["subject"]),
    selectedKeyFrame: 3,
  };
}

test("scene.get returns a clone: mutating it does not touch ui.state", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.SCENE_GET });
  assert.equal(result.type, "scene.get");
  result.scene.objects[0].position[0] = 999;
  result.scene.cameras[0].id = "hacked";
  assert.notEqual(ui.state.objects[0].position[0], 999);
  assert.notEqual(ui.state.cameras[0].id, "hacked");
});

test("scene.get never leaks runtime handles", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.SCENE_GET });
  const json = JSON.stringify(result);
  for (const banned of ["cardMediaById", "modelUrlsById", "blob:", "[Circular"]) {
    assert.ok(!json.includes(banned), `result must not contain ${banned}`);
  }
});

test("camera.get resolves the active camera and rejects an unknown id", () => {
  const ui = makeUi();
  const active = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.CAMERA_GET });
  assert.equal(active.camera.id, ui.state.active_camera_id);
  assert.throws(
    () => executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.CAMERA_GET, cameraId: "nope" }),
    /Unknown camera/,
  );
});

test("timeline.get reports the live frame and range", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.TIMELINE_GET });
  assert.equal(result.timeline.frame, 7);
  assert.equal(result.timeline.duration_frames, ui.state.duration_frames);
});

test("selection.get mirrors transient selection as plain JSON", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.SELECTION_GET });
  assert.deepEqual(result.selection, {
    entity: "object",
    objectId: "subject",
    objectIds: ["subject"],
    keyFrame: 3,
  });
  result.selection.objectIds.push("x");
  assert.equal(ui.selectedObjectIds.size, 1);
});

test("health.get returns one normalized entry per frame", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.HEALTH_GET });
  assert.equal(result.frames.length, ui.state.duration_frames);
  assert.deepEqual(result.frames[0], { frame: 0, state: "good", score: 0.98 });
  assert.deepEqual(result.frames[2], { frame: 2, state: "bad", score: null });
  assert.deepEqual(result.frames[50], { frame: 50, state: "unknown", score: null });
});

test("an unknown query type throws", () => {
  const ui = makeUi();
  assert.throws(() => executeDirectorQuery(ui, { type: "scene.destroy" }), /Unsupported query/);
});
