import { add, clamp, cross, dot, mul, norm, sampleChannel, sub } from "../core.js";
import { cloneCamera, defaultCamera, sampleObjectTransform } from "../core.js";

export function annotatedAssetUrl(value) {
  if (!value) return ""; const match = String(value).match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/); const filename = match?.[1] || String(value); const type = match?.[2] || "input"; const slash = filename.lastIndexOf("/"); const subfolder = slash >= 0 ? filename.slice(0, slash) : ""; const name = slash >= 0 ? filename.slice(slash + 1) : filename;
  return apiUrl(`/view?filename=${encodeURIComponent(name)}&subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(type)}`);
}

let apiUrl = (path) => path;
export function configureCore({ api }) { apiUrl = (path) => api.apiURL ? api.apiURL(path) : path; }

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
  const px = sampleChannel(keys, frame, "pos_x", (k) => (k.camera || k).position[0]);
  const py = sampleChannel(keys, frame, "pos_y", (k) => (k.camera || k).position[1]);
  const pz = sampleChannel(keys, frame, "pos_z", (k) => (k.camera || k).position[2]);
  let tx = sampleChannel(keys, frame, "target_x", (k) => (k.camera || k).target[0]);
  let ty = sampleChannel(keys, frame, "target_y", (k) => (k.camera || k).target[1]);
  let tz = sampleChannel(keys, frame, "target_z", (k) => (k.camera || k).target[2]);

  // Live Look-At Target Tracking Constraint:
  // If target_object_id is set and the target object exists, follow its animated 3D position in real time!
  const targetObjId = state.target_object_id || state.camera?.target_object_id;
  const allObjects = objects || state.objects;
  if (targetObjId && Array.isArray(allObjects)) {
    const targetObj = allObjects.find((o) => o.id === targetObjId);
    if (targetObj) {
      const objTransform = targetObj.keyframes?.length ? sampleObjectTransform(targetObj, frame) : targetObj;
      const offset = state.target_offset || state.camera?.target_offset || [0, 0, 0];
      tx = (objTransform.position?.[0] ?? 0) + (offset[0] || 0);
      ty = (objTransform.position?.[1] ?? 1.5) + (offset[1] || 0);
      tz = (objTransform.position?.[2] ?? 0) + (offset[2] || 0);
    }
  }

  const fov = sampleChannel(keys, frame, "fov", (k) => Number((k.camera || k).fov ?? 35));
  const roll = sampleChannel(keys, frame, "roll", (k) => Number((k.camera || k).roll ?? 0), true);
  const zoom = sampleChannel(keys, frame, "zoom", (k) => Number((k.camera || k).zoom ?? 1));
  const near = sampleChannel(keys, frame, "near", (k) => Number((k.camera || k).near ?? 0.01));
  const far = sampleChannel(keys, frame, "far", (k) => Number((k.camera || k).far ?? 10000));
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
