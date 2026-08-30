import { add, clamp, cross, dot, mul, norm, resolveSampleSegment, sampleChannel, sub } from "../core.js";
import { cloneCamera, defaultCamera, sampleObjectWorldTransform } from "../core.js";
import { annotatedAssetUrl as sharedAnnotatedAssetUrl } from "../../shared/managed-assets.js";

export function annotatedAssetUrl(value) {
  return sharedAnnotatedAssetUrl({ apiURL: apiUrl }, value);
}

let apiUrl = (path) => path;
const playbackSegmentCache = new WeakMap();
export function configureCore({ api }) { apiUrl = (path) => api.apiURL ? api.apiURL(path) : path; }

function cachedCameraSegment(state, keys, frame) {
  const source = state.keyframes;
  const cached = playbackSegmentCache.get(state);
  if (cached?.source === source && frame >= cached.frame && cached.index < keys.length - 1) {
    let index = cached.index;
    while (index + 1 < keys.length - 1 && frame >= keys[index + 1].frame) index += 1;
    if (keys[index].frame < frame && frame < keys[index + 1].frame) {
      playbackSegmentCache.set(state, { source, frame, index });
      return { leftIndex: index, left: keys[index], right: keys[index + 1] };
    }
  }
  const segment = resolveSampleSegment(keys, frame);
  playbackSegmentCache.set(state, { source, frame, index: segment?.leftIndex ?? 0 });
  return segment;
}

export function cameraBasis(camera) {
  const offset = sub(camera.target, camera.position);
  const forward = Math.sqrt(dot(offset, offset)) < 1e-6 ? [0, 0, -1] : norm(offset);
  let worldUp = camera.up || [0, 1, 0];
  let right = cross(forward, worldUp);
  if (Math.sqrt(dot(right, right)) < 1e-6) {
    worldUp = Math.abs(forward[1]) > 0.9 ? [0, 0, forward[1] > 0 ? -1 : 1] : [0, 1, 0];
    right = cross(forward, worldUp);
  }
  right = norm(right);
  let up = norm(cross(right, forward));
  if (Math.abs(camera.roll || 0) > 1e-9) { const radians = camera.roll * Math.PI / 180, cosine = Math.cos(radians), sine = Math.sin(radians), rolledRight = add(mul(right, cosine), mul(up, sine)); up = add(mul(up, cosine), mul(right, -sine)); right = rolledRight; }
  return { right, up, forward };
}

export function project(point, camera, width, height) {
  const { right, up, forward } = cameraBasis(camera), relative = sub(point, camera.position), depth = dot(relative, forward); if (depth <= Math.max(0.0001, camera.near || 0.01) || depth >= (camera.far || 10000)) return null;
  const x = dot(relative, right), y = dot(relative, up);
  if (camera.camera_type === "orthographic") { const halfHeight = 5 / Math.max(0.01, camera.zoom || 1), halfWidth = halfHeight * width / Math.max(1, height); return [width * (0.5 + x / (2 * halfWidth)), height * (0.5 - y / (2 * halfHeight)), depth]; }
  const focal = 0.5 * height / Math.tan(Math.max(0.001, camera.fov) * Math.PI / 360); return [width * 0.5 + x * focal / depth, height * 0.5 - y * focal / depth, depth];
}

export function lerpAngle(a, b, t) {
  const delta = ((b - a + 540) % 360 + 360) % 360 - 180;
  return a + delta * t;
}

export function sampleCamera(state, frame, objects = null) {
  const keys = (state.keyframes || []).map((key) => ({
    ...key,
    camera: cloneCamera(key.camera || key || state.camera || defaultCamera()),
  }));
  if (!keys.length) return cloneCamera(state.camera || defaultCamera());
  const segment = cachedCameraSegment(state, keys, frame);
  const px = sampleChannel(keys, frame, "pos_x", (k) => (k.camera || k).position[0], false, segment);
  const py = sampleChannel(keys, frame, "pos_y", (k) => (k.camera || k).position[1], false, segment);
  const pz = sampleChannel(keys, frame, "pos_z", (k) => (k.camera || k).position[2], false, segment);
  let tx = sampleChannel(keys, frame, "target_x", (k) => (k.camera || k).target[0], false, segment);
  let ty = sampleChannel(keys, frame, "target_y", (k) => (k.camera || k).target[1], false, segment);
  let tz = sampleChannel(keys, frame, "target_z", (k) => (k.camera || k).target[2], false, segment);

  // Live Look-At Target Tracking Constraint:
  // If target_object_id is set and the target object exists, follow its animated 3D position in real time!
  const lookAt = state.constraints?.look_at;
  const constraintActive = lookAt?.status === undefined || lookAt?.status === "active";
  const targetObjId = constraintActive
    ? (lookAt?.object_id || state.target_object_id || state.camera?.target_object_id)
    : null;
  const allObjects = objects || state.objects;
  if (targetObjId && Array.isArray(allObjects)) {
    const targetObj = allObjects.find((o) => o.id === targetObjId);
    if (targetObj && targetObj.enabled !== false) {
      const objTransform = sampleObjectWorldTransform(allObjects, targetObj, frame);
      const offset = lookAt?.offset || state.target_offset || state.camera?.target_offset || [0, 0, 0];
      tx = (objTransform.position?.[0] ?? 0) + (offset[0] || 0);
      ty = (objTransform.position?.[1] ?? 1.5) + (offset[1] || 0);
      tz = (objTransform.position?.[2] ?? 0) + (offset[2] || 0);
    }
  }

  const fov = sampleChannel(keys, frame, "fov", (k) => Number((k.camera || k).fov ?? 35), false, segment);
  const roll = sampleChannel(keys, frame, "roll", (k) => Number((k.camera || k).roll ?? 0), true, segment);
  const zoom = sampleChannel(keys, frame, "zoom", (k) => Number((k.camera || k).zoom ?? 1), false, segment);
  const near = sampleChannel(keys, frame, "near", (k) => Number((k.camera || k).near ?? 0.01), false, segment);
  const far = sampleChannel(keys, frame, "far", (k) => Number((k.camera || k).far ?? 10000), false, segment);
  const firstKey = keys[0]?.camera || keys[0] || defaultCamera();
  let discreteKey = keys[0];
  for (const key of keys) { if ((key.frame ?? 0) <= frame) discreteKey = key; else break; }
  const cameraType = (discreteKey.camera || discreteKey).camera_type;
  return {
    position: [px, py, pz],
    target: [tx, ty, tz],
    fov: clamp(fov, 5, 150),
    roll,
    camera_type: cameraType || "perspective",
    zoom: Math.max(0.01, zoom),
    near: Math.max(1e-4, near),
    far: Math.max(near + 1e-4, far),
    ...(firstKey.up ? { up: [...firstKey.up] } : {}),
  };
}
