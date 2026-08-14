export const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
export const lerp = (a, b, t) => a + (b - a) * t;
export const v3 = (x = 0, y = 0, z = 0) => [x, y, z];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, scalar) => [a[0] * scalar, a[1] * scalar, a[2] * scalar];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const length = (value) => Math.sqrt(Math.max(1e-12, dot(value, value)));
export const norm = (value) => mul(value, 1 / length(value));
export const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export function distanceToSegment(point, a, b) {
  const ab = [b[0] - a[0], b[1] - a[1]];
  const ap = [point[0] - a[0], point[1] - a[1]];
  const denominator = Math.max(1e-9, ab[0] * ab[0] + ab[1] * ab[1]);
  const t = clamp((ap[0] * ab[0] + ap[1] * ab[1]) / denominator, 0, 1);
  return Math.hypot(point[0] - a[0] - ab[0] * t, point[1] - a[1] - ab[1] * t);
}

export function ease(t, mode = "ease") {
  t = clamp(t, 0, 1);
  if (mode === "linear") return t;
  if (mode === "ease_in") return t * t;
  if (mode === "ease_out") return 1 - (1 - t) * (1 - t);
  if (mode === "smooth") return t * t * t * (t * (t * 6 - 15) + 10);
  if (mode === "bezier") return 0.15 * (1 - t) * (1 - t) * t + 2.85 * (1 - t) * t * t + t * t * t;
  return t * t * (3 - 2 * t);
}

// Tangent handle modes for editable Bézier keys (schema v2, t_* fields are
// normalized: x in segment time [0,1], y in value units around the key value).
export const TANGENT_MODES = ["auto", "vector", "free", "aligned"];

export function defaultHandles() {
  return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: "auto" };
}

function smoothHandles(previous, current, next) {
  const spanP = Math.max(1e-6, current.frame - (previous?.frame ?? current.frame - 1));
  const spanN = Math.max(1e-6, (next?.frame ?? current.frame + 1) - current.frame);
  const slope = (current.value - (previous?.value ?? current.value)) / spanP + ((next?.value ?? current.value) - current.value) / spanN;
  return { out_y: slope * spanN * 0.5, in_y: slope * spanP * 0.5 };
}

export function resolveHandles(key, previousKey, nextKey) {
  const stored = key.tangents || {};
  const mode = TANGENT_MODES.includes(stored.mode) ? stored.mode : "auto";
  if (mode === "vector") return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode };
  if (mode === "auto") return { out_x: 1 / 3, in_x: -1 / 3, ...smoothHandles(previousKey, key, nextKey), mode };
  const out = { out_x: clamp(stored.out_x ?? 1 / 3, 0.01, 0.99), out_y: stored.out_y ?? 0, in_x: clamp(stored.in_x ?? -1 / 3, -0.99, -0.01), in_y: stored.in_y ?? 0, mode };
  if (mode === "aligned") {
    const lengthOut = Math.hypot(out.out_x, out.out_y) || 1e-6;
    const lengthIn = Math.hypot(out.in_x, out.in_y) || 1e-6;
    out.in_x = (-out.out_x / lengthOut) * lengthIn;
    out.in_y = (-out.out_y / lengthOut) * lengthIn;
  }
  return out;
}

// Cubic Bézier easing y(t) with custom tangent handles (t normalized in [0,1]).
export function bezierEaseWithHandles(t, key, previousKey, nextKey, spanFrames, prevSpanFrames) {
  const handles = resolveHandles(key, previousKey, nextKey);
  const p1x = clamp(handles.out_x, 0.01, 0.99);
  const p2x = clamp(1 + handles.in_x, 0.01, 0.99);
  const outSlope = handles.out_y / Math.max(1e-6, handles.out_x) / Math.max(1, spanFrames);
  const inSlope = handles.in_y / Math.max(1e-6, handles.in_x) / Math.max(1, prevSpanFrames || spanFrames);
  const p1y = outSlope * p1x;
  const p2y = 1 + inSlope * (p2x - 1);
  const u = clamp(t, 0, 1), v = 1 - u;
  return 3 * v * v * u * p1y + 3 * v * u * u * p2y + u * u * u;
}

export function defaultCamera() {
  return { position: [6, 4, 6], target: [0, 1.5, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 };
}

export function defaultEditorViews() {
  const target = [0, 1, 0];
  const view = (position, up = [0, 1, 0], cameraType = "orthographic") => ({ ...defaultCamera(), position, target: [...target], up, camera_type: cameraType, zoom: 1 });
  return {
    perspective: view([8, 6, 8], [0, 1, 0], "perspective"), top: view([0, 14, 0], [0, 0, -1]), right: view([14, 1, 0]), left: view([-14, 1, 0]), bottom: view([0, -12, 0], [0, 0, 1]),
  };
}

export function cloneTransform(value) {
  return { position: [...(value.position || [0, 0, 0])], rotation: [...(value.rotation || [0, 0, 0])], size: [...(value.size || [1, 1, 1])] };
}

// Resolve an object's world transform through its parent chain (position
// offset rotated+scaled by each ancestor). Cycle-safe.
export function worldTransform(objects, object) {
  const byId = new Map(objects.map((item) => [item.id, item]));
  let position = [...(object.position || [0, 0, 0])];
  let rotation = [...(object.rotation || [0, 0, 0])];
  let size = [...(object.size || [1, 1, 1])];
  const seen = new Set([object.id]);
  let parent = object.parent_id ? byId.get(object.parent_id) : null;
  while (parent && !seen.has(parent.id)) {
    seen.add(parent.id);
    const scaled = [position[0] * (parent.size?.[0] ?? 1), position[1] * (parent.size?.[1] ?? 1), position[2] * (parent.size?.[2] ?? 1)];
    const rotated = rotateEuler(scaled, parent.rotation || [0, 0, 0]);
    position = add(rotated, parent.position || [0, 0, 0]);
    rotation = [rotation[0] + (parent.rotation?.[0] ?? 0), rotation[1] + (parent.rotation?.[1] ?? 0), rotation[2] + (parent.rotation?.[2] ?? 0)];
    size = [size[0] * (parent.size?.[0] ?? 1), size[1] * (parent.size?.[1] ?? 1), size[2] * (parent.size?.[2] ?? 1)];
    parent = parent.parent_id ? byId.get(parent.parent_id) : null;
  }
  return { position, rotation, size };
}

export function sampleObjectTransform(object, frame) {
  const keys = object.keyframes || [];
  if (!keys.length) return cloneTransform(object);
  if (frame <= keys[0].frame) return cloneTransform(keys[0].transform);
  if (frame >= keys[keys.length - 1].frame) return cloneTransform(keys[keys.length - 1].transform);
  let left = keys[0], right = keys[keys.length - 1];
  for (let index = 0; index < keys.length - 1; index++) if (keys[index].frame <= frame && frame <= keys[index + 1].frame) { left = keys[index]; right = keys[index + 1]; break; }
  const t = ease((frame - left.frame) / Math.max(1, right.frame - left.frame), left.interpolation);
  return { position: lerp3(left.transform.position, right.transform.position, t), rotation: lerp3(left.transform.rotation, right.transform.rotation, t), size: lerp3(left.transform.size, right.transform.size, t) };
}

export function defaultState() {
  const camera = defaultCamera();
  const keyframes = [{ frame: 0, camera: cloneCamera(camera), interpolation: "ease" }];
  return {
    schema_version: 1, fps: 24, duration_frames: 120, width: 1280, height: 720, render_mode: "omni_ref", camera, keyframes,
    cameras: [{ id: "camera_1", name: "Camera 1", camera: cloneCamera(camera), keyframes }], active_camera_id: "camera_1", playblast_camera_id: "camera_1",
    objects: [{ id: "subject", type: "card", name: "Subject Card", position: [0, 1.5, 0], rotation: [0, 0, 0], size: [2, 3], material_mode: "textured", keyframes: [], enabled: true, asset: "" }],
    metadata: {}, guides: true, burn_in: false, speed_heatmap: false, playblast_grid: false, card_fit: "contain", card_asset: "", reference_index: 0,
    gizmo_mode: "translate", gizmo_space: "world", auto_key: false, view_mode: "camera", camera_view_visible: true, editor_views: defaultEditorViews(), ui_density: "advanced",
    snap_enabled: true, snap_frames: 1, timecode_mode: "time", loop_playback: false, playback_range: null, markers: [],
    preview_layout: "auto", maximized_camera_id: null, safe_areas: false, resolution_gate: false, aspect_ratio: "auto",
  };
}

export function cloneCamera(camera) {
  const near = Math.max(0.0001, Number.isFinite(Number(camera.near)) ? Number(camera.near) : 0.01);
  const farValue = Number.isFinite(Number(camera.far)) ? Number(camera.far) : 10000;
  return {
    position: [...camera.position], target: [...camera.target], fov: Number(camera.fov ?? 35), roll: Number(camera.roll ?? 0), camera_type: camera.camera_type || "perspective", zoom: Number(camera.zoom ?? 1), near, far: Math.max(near + 0.0001, farValue), ...(Array.isArray(camera.up) ? { up: [...camera.up] } : {}),
  };
}

export function sanitizeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const out = { ...base, ...raw };
  out.fps = clamp(Number(out.fps || 24), 1, 120); out.duration_frames = Math.max(1, Number(out.duration_frames || 120)); out.width = clamp(Number(out.width || 1280), 64, 4096); out.height = clamp(Number(out.height || 720), 64, 4096);
  const sanitizeKeyframes = (items, fallbackCamera) => (Array.isArray(items) ? items : []).map((key) => ({ frame: clamp(Math.round(Number(key.frame || 0)), 0, out.duration_frames - 1), camera: cloneCamera(key.camera || key || fallbackCamera), interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(key.interpolation) ? key.interpolation : "ease" }));
  const legacyCamera = cloneCamera(out.camera || base.camera);
  let legacyKeys = sanitizeKeyframes(out.keyframes, legacyCamera); legacyKeys = [...new Map(legacyKeys.map((key) => [key.frame, key])).values()].sort((a, b) => a.frame - b.frame);
  if (!legacyKeys.length) legacyKeys = [{ frame: 0, camera: cloneCamera(legacyCamera), interpolation: "ease" }];
  const sourceCameras = Array.isArray(out.cameras) && out.cameras.length ? out.cameras : [{ id: "camera_1", name: "Camera 1", camera: legacyCamera, keyframes: legacyKeys }];
  const usedCameraIds = new Set();
  out.cameras = sourceCameras.map((item, index) => {
    let id = String(item?.id || `camera_${index + 1}`); if (usedCameraIds.has(id)) id = `camera_${index + 1}`; usedCameraIds.add(id);
    const camera = cloneCamera(item?.camera || item?.keyframes?.[0]?.camera || legacyCamera); let keyframes = sanitizeKeyframes(item?.keyframes, camera); keyframes = [...new Map(keyframes.map((key) => [key.frame, key])).values()].sort((a, b) => a.frame - b.frame);
    if (!keyframes.length) keyframes = [{ frame: 0, camera: cloneCamera(camera), interpolation: "ease" }];
    return { id, name: String(item?.name || `Camera ${index + 1}`), camera, keyframes, locked: Boolean(item?.locked), muted: Boolean(item?.muted), solo: Boolean(item?.solo) };
  });
  out.active_camera_id = out.cameras.some((item) => item.id === out.active_camera_id) ? out.active_camera_id : out.cameras[0].id;
  out.playblast_camera_id = out.cameras.some((item) => item.id === out.playblast_camera_id) ? out.playblast_camera_id : out.active_camera_id;
  const activeCamera = out.cameras.find((item) => item.id === out.active_camera_id); out.camera = activeCamera.camera; out.keyframes = activeCamera.keyframes;
  out.objects = (Array.isArray(out.objects) ? out.objects : base.objects).map((object) => ({ ...object, locked: Boolean(object.locked), parent_id: typeof object.parent_id === "string" ? object.parent_id : null, position: Array.isArray(object.position) ? object.position.map(Number) : [0, 0, 0], rotation: Array.isArray(object.rotation) ? object.rotation.map(Number) : [0, 0, 0], size: Array.isArray(object.size) ? object.size.map(Number) : [1, 1, 1], material_mode: ["textured", "checker", "neutral", "wireframe"].includes(object.material_mode) ? object.material_mode : "textured", keyframes: (Array.isArray(object.keyframes) ? object.keyframes : []).map((key) => ({ frame: clamp(Math.round(Number(key.frame || 0)), 0, out.duration_frames - 1), transform: cloneTransform(key.transform || object), interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(key.interpolation) ? key.interpolation : "ease" })).sort((a, b) => a.frame - b.frame) }));
  out.gizmo_mode = ["translate", "rotate", "scale"].includes(out.gizmo_mode) ? out.gizmo_mode : "translate"; out.gizmo_space = out.gizmo_space === "local" ? "local" : "world"; out.ui_density = ["basic", "animation", "advanced"].includes(out.ui_density) ? out.ui_density : "advanced";
  out.snap_enabled = out.snap_enabled !== false; out.snap_frames = Math.max(1, Math.round(Number(out.snap_frames) || 1)); out.timecode_mode = ["time", "timecode"].includes(out.timecode_mode) ? out.timecode_mode : "time"; out.loop_playback = Boolean(out.loop_playback);
  out.playback_range = Array.isArray(out.playback_range) && out.playback_range.length === 2 ? [clamp(Math.round(Number(out.playback_range[0]) || 0), 0, out.duration_frames - 1), clamp(Math.round(Number(out.playback_range[1]) || out.duration_frames - 1), 0, out.duration_frames - 1)] : null;
  out.markers = (Array.isArray(out.markers) ? out.markers : []).filter((m) => m && Number.isFinite(Number(m.frame))).map((m, i) => ({ frame: clamp(Math.round(Number(m.frame)), 0, out.duration_frames - 1), name: String(m.name || `Marker ${i + 1}`).slice(0, 40), color: String(m.color || "#f2d06b") }));
  out.preview_layout = ["auto", "1", "2", "4"].includes(String(out.preview_layout)) ? String(out.preview_layout) : "auto";
  out.maximized_camera_id = typeof out.maximized_camera_id === "string" ? out.maximized_camera_id : null;
  out.safe_areas = Boolean(out.safe_areas); out.resolution_gate = Boolean(out.resolution_gate);
  out.aspect_ratio = ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"].includes(out.aspect_ratio) ? out.aspect_ratio : "auto"; out.auto_key = Boolean(out.auto_key); out.playblast_grid = Boolean(out.playblast_grid); out.reference_index = Math.max(0, Number(out.reference_index || 0)); out.view_mode = ["camera", "perspective", "top", "right", "left", "bottom"].includes(out.view_mode) ? out.view_mode : "camera"; out.camera_view_visible = out.camera_view_visible !== false;
  const editorViews = defaultEditorViews(); out.editor_views = Object.fromEntries(Object.entries(editorViews).map(([name, camera]) => [name, cloneCamera(out.editor_views?.[name] || camera)]));
  return out;
}

export function rotateEuler(vector, rotation) {
  const [rx, ry, rz] = (rotation || [0, 0, 0]).map((value) => value * Math.PI / 180); let [x, y, z] = vector;
  [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)]; [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)]; [x, y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)]; return [x, y, z];
}

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

export function sampleCamera(state, frame) {
  const keys = state.keyframes || [];
  if (!keys.length) return cloneCamera(state.camera || defaultCamera());
  if (frame <= keys[0].frame) return cloneCamera(keys[0].camera); if (frame >= keys[keys.length - 1].frame) return cloneCamera(keys[keys.length - 1].camera);
  let left = keys[0], right = keys[keys.length - 1]; for (let index = 0; index < keys.length - 1; index++) if (keys[index].frame <= frame && frame <= keys[index + 1].frame) { left = keys[index]; right = keys[index + 1]; break; }
  const t = ease((frame - left.frame) / Math.max(1, right.frame - left.frame), left.interpolation);
  return { position: lerp3(left.camera.position, right.camera.position, t), target: lerp3(left.camera.target, right.camera.target, t), fov: lerp(left.camera.fov, right.camera.fov, t), roll: lerpAngle(left.camera.roll || 0, right.camera.roll || 0, t), camera_type: t < 1 ? left.camera.camera_type : right.camera.camera_type, zoom: lerp(left.camera.zoom || 1, right.camera.zoom || 1, t), near: lerp(left.camera.near || 0.01, right.camera.near || 0.01, t), far: lerp(left.camera.far || 10000, right.camera.far || 10000, t) };
}
