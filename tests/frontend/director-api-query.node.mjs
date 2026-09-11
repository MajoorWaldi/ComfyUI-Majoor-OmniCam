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

test("every query response carries the current directorRevision", () => {
  const ui = makeUi();
  ui.directorRevision = 12;
  const scene = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.SCENE_GET });
  assert.equal(scene.revision, 12);
  const selection = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.SELECTION_GET });
  assert.equal(selection.revision, 12);
});

test("an unset directorRevision reports 0, never undefined or negative", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.SCENE_GET });
  assert.equal(result.revision, 0);
});

test("scene.summary reports bounded scalar counts, not the full scene", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.SCENE_SUMMARY });
  assert.equal(result.summary.camera_count, ui.state.cameras.length);
  assert.equal(result.summary.object_count, ui.state.objects.length);
  assert.equal(result.summary.active_camera_id, ui.state.active_camera_id);
  assert.equal(result.scene, undefined);
});

test("object.list paginates and never exceeds the hard maximum of 100", () => {
  const ui = makeUi();
  ui.state.objects = Array.from({ length: 150 }, (_, i) => ({ id: `obj_${i}`, name: `Object ${i}`, position: [0, 0, 0] }));

  const page1 = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_LIST, offset: 0, limit: 10 });
  assert.equal(page1.items.length, 10);
  assert.equal(page1.total, 150);
  assert.equal(page1.items[0].id, "obj_0");

  const page2 = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_LIST, offset: 10, limit: 10 });
  assert.equal(page2.items[0].id, "obj_10");

  assert.throws(
    () => executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_LIST, limit: 101 }),
    /BAD_QUERY|limit/,
  );

  const full = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_LIST, limit: 100 });
  assert.equal(full.items.length, 100);
});

test("object.list rejects a negative offset", () => {
  const ui = makeUi();
  assert.throws(() => executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_LIST, offset: -1 }));
});

test("object.get returns a full cloned object with no runtime handles", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_GET, objectId: "subject" });
  assert.equal(result.object.id, "subject");
  assert.equal(typeof result.object.position[0], "number");
  result.object.position[0] = 999;
  assert.notEqual(ui.state.objects.find((o) => o.id === "subject").position[0], 999);
});

test("object.get throws UNKNOWN_OBJECT for a missing id", () => {
  const ui = makeUi();
  assert.throws(
    () => executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_GET, objectId: "nope" }),
    (error) => error.code === "UNKNOWN_OBJECT",
  );
});

test("object.search matches substring text against id, name and tags", () => {
  const ui = makeUi();
  ui.state.objects.find((o) => o.id === "subject").tags = ["hero", "lead"];
  const byTag = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_SEARCH, text: "hero" });
  assert.ok(byTag.items.some((item) => item.id === "subject"));
  const byName = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_SEARCH, text: "subject" });
  assert.ok(byName.items.some((item) => item.id === "subject"));
  const noMatch = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_SEARCH, text: "zzz_nomatch" });
  assert.equal(noMatch.items.length, 0);
});

test("object.search requires every requested tag to match (tag all-match)", () => {
  const ui = makeUi();
  ui.state.objects.find((o) => o.id === "subject").tags = ["hero", "lead"];
  const allMatch = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_SEARCH, tags: ["hero", "lead"] });
  assert.ok(allMatch.items.some((item) => item.id === "subject"));
  const partialMiss = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.OBJECT_SEARCH, tags: ["hero", "villain"] });
  assert.ok(!partialMiss.items.some((item) => item.id === "subject"));
});

test("camera.list is bounded and summarized", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.CAMERA_LIST });
  assert.equal(result.total, ui.state.cameras.length);
  assert.equal(result.items[0].id, ui.state.cameras[0].id);
  assert.equal(typeof result.items[0].keyframe_count, "number");
});

test("character.list filters to character-kind objects only", () => {
  const ui = makeUi();
  ui.state.objects.find((o) => o.id === "subject").asset_kind = "character";
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.CHARACTER_LIST });
  assert.equal(result.total, 1);
  assert.equal(result.items[0].id, "subject");
});

test("shot.list computes each shot's end from the next cut's start", () => {
  const ui = makeUi();
  ui.state.duration_frames = 100;
  ui.state.sequence = { enabled: true, cuts: [{ start: 0, camera_id: "camera_1" }, { start: 40, camera_id: "camera_1" }] };
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.SHOT_LIST });
  assert.equal(result.items[0].end, 39);
  assert.equal(result.items[1].end, 99);
});

test("keyframe.list requires a valid camera and paginates its keyframes", () => {
  const ui = makeUi();
  const result = executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.KEYFRAME_LIST, cameraId: "camera_1" });
  assert.ok(result.total >= 1);
  assert.equal(typeof result.items[0].frame, "number");
  assert.throws(
    () => executeDirectorQuery(ui, { type: DIRECTOR_QUERIES.KEYFRAME_LIST, cameraId: "camera_404" }),
    (error) => error.code === "UNKNOWN_CAMERA",
  );
});
