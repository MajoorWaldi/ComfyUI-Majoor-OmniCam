// Semantic dry-run diff for `validateOnly` transactions.
//
// This is a curated diff over *known* Director state fields (camera
// transforms/properties, object transforms, enabled/locked/name/tags/
// annotation, character pose/motion identifiers, timeline range/duration,
// cuts, entity create/delete) -- never an unrestricted recursive JSON diff.
// Hard-capped at MAX_DIFF_CHANGES: past that the caller gets `truncated: true`
// instead of an unbounded list.

export const MAX_DIFF_CHANGES = 100;

function equal(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((value, index) => equal(value, b[index]));
  }
  if (a && b && typeof a === "object") {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) if (!equal(a[key], b[key])) return false;
    return true;
  }
  return false;
}

function byId(list) {
  return new Map((list || []).map((item) => [item.id, item]));
}

export function computeSemanticDiff(before, after) {
  const changes = [];
  let truncated = false;

  const push = (entity, field, beforeValue, afterValue) => {
    if (truncated) return;
    if (equal(beforeValue, afterValue)) return;
    if (changes.length >= MAX_DIFF_CHANGES) {
      truncated = true;
      return;
    }
    changes.push({ entity, field, before: beforeValue ?? null, after: afterValue ?? null });
  };

  diffCameras(before, after, push);
  diffKeyframes(before, after, push);
  diffObjects(before, after, push);
  diffJointRotations(before, after, push);
  diffTimeline(before, after, push);
  diffCuts(before, after, push);

  return { changes, truncated };
}

const CAMERA_PROPERTY_FIELDS = ["fov", "roll", "zoom", "near", "far", "camera_type"];

function diffCameras(before, after, push) {
  const beforeCameras = byId(before?.cameras);
  const afterCameras = byId(after?.cameras);

  for (const id of beforeCameras.keys()) {
    if (!afterCameras.has(id)) push(id, "camera", "present", null);
  }
  for (const [id, camera] of afterCameras) {
    const priorCamera = beforeCameras.get(id);
    if (!priorCamera) {
      push(id, "camera", null, "present");
      continue;
    }

    push(id, "name", priorCamera.name, camera.name);
    push(id, "locked", Boolean(priorCamera.locked), Boolean(camera.locked));
    push(id, "muted", Boolean(priorCamera.muted), Boolean(camera.muted));
    push(id, "solo", Boolean(priorCamera.solo), Boolean(camera.solo));
    push(id, "target_object_id", priorCamera.target_object_id ?? null, camera.target_object_id ?? null);

    push(id, "position", priorCamera.camera?.position, camera.camera?.position);
    push(id, "target", priorCamera.camera?.target, camera.camera?.target);
    for (const field of CAMERA_PROPERTY_FIELDS) {
      push(id, field, priorCamera.camera?.[field], camera.camera?.[field]);
    }
  }
}

const KEYFRAME_CAMERA_FIELDS = ["position", "target", "fov", "roll", "zoom", "near", "far", "camera_type"];

function diffKeyframes(before, after, push) {
  const beforeCameras = byId(before?.cameras);
  const afterCameras = byId(after?.cameras);

  for (const [id, camera] of afterCameras) {
    const priorCamera = beforeCameras.get(id);
    const beforeKeys = new Map((priorCamera?.keyframes || []).map((key) => [key.frame, key]));
    const afterKeys = new Map((camera.keyframes || []).map((key) => [key.frame, key]));
    const entity = `${id}@keyframes`;

    for (const [frame, key] of beforeKeys) {
      if (!afterKeys.has(frame)) push(entity, `frame_${frame}`, key.interpolation ?? "present", null);
    }
    for (const [frame, key] of afterKeys) {
      const priorKey = beforeKeys.get(frame);
      if (!priorKey) {
        push(entity, `frame_${frame}`, null, key.interpolation ?? "present");
        continue;
      }
      for (const field of KEYFRAME_CAMERA_FIELDS) {
        push(entity, `frame_${frame}_${field}`, priorKey.camera?.[field], key.camera?.[field]);
      }
      push(entity, `frame_${frame}_interpolation`, priorKey.interpolation, key.interpolation);
    }
  }
}

function diffJointRotations(before, after, push) {
  const beforeObjects = byId(before?.objects);
  const afterObjects = byId(after?.objects);

  for (const [id, object] of afterObjects) {
    const priorObject = beforeObjects.get(id);
    const beforeJoints = priorObject?.character?.pose?.joints || {};
    const afterJoints = object.character?.pose?.joints || {};
    const jointNames = new Set([...Object.keys(beforeJoints), ...Object.keys(afterJoints)]);
    for (const joint of jointNames) {
      push(`${id}#${joint}`, "joint_rotation", beforeJoints[joint] ?? null, afterJoints[joint] ?? null);
    }
  }
}

function diffObjects(before, after, push) {
  const beforeObjects = byId(before?.objects);
  const afterObjects = byId(after?.objects);

  for (const [id] of beforeObjects) {
    if (!afterObjects.has(id)) push(id, "object", "present", null);
  }
  for (const [id, object] of afterObjects) {
    const priorObject = beforeObjects.get(id);
    if (!priorObject) {
      push(id, "object", null, "present");
      continue;
    }

    push(id, "position", priorObject.position, object.position);
    push(id, "rotation", priorObject.rotation, object.rotation);
    push(id, "size", priorObject.size, object.size);
    push(id, "name", priorObject.name, object.name);
    push(id, "enabled", priorObject.enabled !== false, object.enabled !== false);
    push(id, "locked", Boolean(priorObject.locked), Boolean(object.locked));
    push(id, "tags", priorObject.tags || [], object.tags || []);
    push(id, "annotation", priorObject.annotation ?? null, object.annotation ?? null);

    // Character pose/motion are diffed by identifier only -- the full joint
    // map is not a "known field" worth a change record per joint.
    const priorPose = priorObject.character?.pose?.preset_id ?? null;
    const nextPose = object.character?.pose?.preset_id ?? null;
    push(id, "pose_preset", priorPose, nextPose);

    const priorMotion = priorObject.character?.motion?.clip_id ?? null;
    const nextMotion = object.character?.motion?.clip_id ?? null;
    push(id, "motion_clip_id", priorMotion, nextMotion);
  }
}

function diffTimeline(before, after, push) {
  push("timeline", "duration_frames", before?.duration_frames, after?.duration_frames);
  push("timeline", "playback_range", before?.playback_range ?? null, after?.playback_range ?? null);
}

function diffCuts(before, after, push) {
  const beforeCuts = new Map((before?.sequence?.cuts || []).map((cut) => [cut.start, cut]));
  const afterCuts = new Map((after?.sequence?.cuts || []).map((cut) => [cut.start, cut]));

  for (const [start, cut] of beforeCuts) {
    if (!afterCuts.has(start)) push(`cut_${start}`, "cut", cut.camera_id, null);
  }
  for (const [start, cut] of afterCuts) {
    const priorCut = beforeCuts.get(start);
    if (!priorCut) {
      push(`cut_${start}`, "cut", null, cut.camera_id);
    } else {
      push(`cut_${start}`, "cut_camera_id", priorCut.camera_id, cut.camera_id);
    }
  }
}
