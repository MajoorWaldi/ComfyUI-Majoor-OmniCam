// Semantic Director API v1 -- vocabulary.
//
// This layer is a versioned, bounded transaction surface over canonical Director
// state. Plan 01 wires it to deterministic UI actions; Plan 02 lets an Agent
// call the same surface. No file under director-api/ may import an LLM SDK,
// three.js, or the DOM.

export const DIRECTOR_API_VERSION = 1;

export const MAX_OPERATIONS_PER_TRANSACTION = 50;

export const DIRECTOR_OPS = Object.freeze({
  CAMERA_SET_ACTIVE: "camera.set_active",
  CAMERA_TRANSFORM: "camera.transform",
  CAMERA_LOOK_AT: "camera.look_at",
  OBJECT_TRANSFORM: "object.transform",
  OBJECT_SET_ENABLED: "object.set_enabled",
  OBJECT_SET_LOCKED: "object.set_locked",
  OBJECT_SET_TAGS: "object.set_tags",
  OBJECT_SET_ANNOTATION: "object.set_annotation",
  KEYFRAME_UPSERT: "keyframe.upsert",
  KEYFRAME_REMOVE: "keyframe.remove",
  KEYFRAME_SET_INTERPOLATION: "keyframe.set_interpolation",
  TIMELINE_SET_RANGE: "timeline.set_range",
  TIMELINE_SET_DURATION: "timeline.set_duration",
});

export const DIRECTOR_OP_VALUES = Object.freeze(Object.values(DIRECTOR_OPS));

export const DIRECTOR_QUERIES = Object.freeze({
  SCENE_GET: "scene.get",
  CAMERA_GET: "camera.get",
  TIMELINE_GET: "timeline.get",
  SELECTION_GET: "selection.get",
  HEALTH_GET: "health.get",
  CHARACTER_GET_RIG: "character.get_rig",
});

export const DIRECTOR_QUERY_VALUES = Object.freeze(Object.values(DIRECTOR_QUERIES));
