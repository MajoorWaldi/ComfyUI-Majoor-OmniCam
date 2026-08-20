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
export const TANGENT_MODES = ["auto", "vector", "free", "aligned", "flat"];

export function defaultHandles() {
  return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: "auto" };
}

export function getChannelTangents(key, channelId) {
  const tangents = key?.tangents;
  if (!tangents || typeof tangents !== "object") return {};
  if (tangents.channels && typeof tangents.channels === "object" && tangents.channels[channelId]) {
    return tangents.channels[channelId];
  }
  return tangents;
}

export function resolveChannelHandles(key, channelId, previousKey, nextKey, channelGetter) {
  const stored = getChannelTangents(key, channelId);
  const mode = TANGENT_MODES.includes(stored.mode) ? stored.mode : (key?.tangents?.mode || "auto");
  const curVal = channelGetter ? channelGetter(key) : 0;
  const prevVal = (previousKey && channelGetter) ? channelGetter(previousKey) : curVal;
  const nextVal = (nextKey && channelGetter) ? channelGetter(nextKey) : curVal;

  const prevSpan = Math.max(1e-6, key.frame - (previousKey?.frame ?? key.frame - 1));
  const nextSpan = Math.max(1e-6, (nextKey?.frame ?? key.frame + 1) - key.frame);

  const getAuto = () => {
    const dPrev = (curVal - prevVal) / prevSpan;
    const dNext = (nextVal - curVal) / nextSpan;
    let slope = (dPrev + dNext) * 0.5;
    if (!previousKey) slope = dNext;
    else if (!nextKey) slope = dPrev;
    if (dPrev * dNext <= 0 && previousKey && nextKey) slope = 0;
    return {
      out_x: 1 / 3,
      out_y: slope * nextSpan * (1 / 3),
      in_x: -1 / 3,
      in_y: -slope * prevSpan * (1 / 3),
    };
  };

  if (mode === "vector") {
    const inSlope = (curVal - prevVal) / prevSpan;
    const outSlope = (nextVal - curVal) / nextSpan;
    return {
      out_x: 1 / 3,
      out_y: outSlope * nextSpan * (1 / 3),
      in_x: -1 / 3,
      in_y: -inSlope * prevSpan * (1 / 3),
      mode,
    };
  }

  if (mode === "flat") {
    return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode };
  }

  if (mode === "auto") {
    return { ...getAuto(), mode };
  }

  const autoFallback = getAuto();
  const out_x = clamp(Number(stored.out_x ?? autoFallback.out_x), 0.01, 0.99);
  const out_y = Number(stored.out_y ?? autoFallback.out_y);
  let in_x = clamp(Number(stored.in_x ?? autoFallback.in_x), -0.99, -0.01);
  let in_y = Number(stored.in_y ?? autoFallback.in_y);

  if (mode === "aligned") {
    const lenOut = Math.hypot(out_x, out_y) || 1e-6;
    const lenIn = Math.hypot(in_x, in_y) || 1e-6;
    in_x = (-out_x / lenOut) * lenIn;
    in_y = (-out_y / lenOut) * lenIn;
  }

  return { out_x, out_y, in_x, in_y, mode };
}

export function resolveHandles(key, previousKey, nextKey) {
  return resolveChannelHandles(key, "default", previousKey, nextKey, (k) => Number(k.value ?? 0));
}

// Cubic Bézier easing y(t) with custom tangent handles (t normalized in [0,1]).
export function bezierEaseWithHandles(t, key, previousKey, nextKey, spanFrames, prevSpanFrames) {
  const handles = resolveHandles(key, previousKey, nextKey);
  const p1x = clamp(handles.out_x, 0.01, 0.99);
  const p2x = clamp(1 + handles.in_x, 0.01, 0.99);
  const outSlope = handles.out_y / Math.max(1e-6, handles.out_x) / Math.max(1, spanFrames);
  const inSlope = handles.in_y / Math.max(1e-6, Math.abs(handles.in_x)) / Math.max(1, prevSpanFrames || spanFrames);
  const p1y = outSlope * p1x;
  const p2y = 1 + inSlope * (p2x - 1);
  const u = clamp(t, 0, 1), v = 1 - u;
  return 3 * v * v * u * p1y + 3 * v * u * u * p2y + u * u * u;
}

export function sampleChannel(keys, frame, channelId, channelGetter, isAngle = false) {
  if (!keys.length) return 0;
  if (frame <= keys[0].frame) return channelGetter(keys[0]);
  if (frame >= keys[keys.length - 1].frame) return channelGetter(keys[keys.length - 1]);

  let leftIndex = 0;
  for (let index = 0; index < keys.length - 1; index++) {
    if (keys[index].frame <= frame && frame <= keys[index + 1].frame) {
      leftIndex = index;
      break;
    }
  }
  const left = keys[leftIndex];
  const right = keys[leftIndex + 1];
  const prev = leftIndex > 0 ? keys[leftIndex - 1] : null;
  const next = leftIndex + 2 < keys.length ? keys[leftIndex + 2] : null;
  const span = Math.max(1, right.frame - left.frame);
  const u = clamp((frame - left.frame) / span, 0, 1);

  let y0 = channelGetter(left);
  let y1 = channelGetter(right);
  if (isAngle) {
    const delta = ((y1 - y0 + 540) % 360 + 360) % 360 - 180;
    y1 = y0 + delta;
  }

  const isBezier = left.interpolation === "bezier" || right.interpolation === "bezier";
  if (isBezier) {
    const handlesLeft = resolveChannelHandles(left, channelId, prev, right, channelGetter);
    const handlesRight = resolveChannelHandles(right, channelId, left, next, channelGetter);
    const p0 = y0;
    const p1 = y0 + (handlesLeft.out_y || 0);
    const p2 = y1 + (handlesRight.in_y || 0);
    const p3 = y1;
    const v = 1 - u;
    return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3;
  }

  const t = ease(u, left.interpolation);
  return y0 + (y1 - y0) * t;
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
  const rawSize = value.size || [1, 1, 1];
  const size = rawSize.length === 2 ? [...rawSize, 0.01] : [...rawSize];
  return { position: [...(value.position || [0, 0, 0])], rotation: [...(value.rotation || [0, 0, 0])], size };
}

export function worldTransform(objects, object) {
  const byId = new Map(objects.map((item) => [item.id, item]));
  let position = [...(object.position || [0, 0, 0])];
  let rotation = [...(object.rotation || [0, 0, 0])];
  let rawSize = object.size || [1, 1, 1];
  let size = rawSize.length === 2 ? [...rawSize, 0.01] : [...rawSize];
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
  const px = sampleChannel(keys, frame, "pos_x", (k) => (k.transform || object).position[0]);
  const py = sampleChannel(keys, frame, "pos_y", (k) => (k.transform || object).position[1]);
  const pz = sampleChannel(keys, frame, "pos_z", (k) => (k.transform || object).position[2]);
  const rx = sampleChannel(keys, frame, "rot_x", (k) => (k.transform || object).rotation[0], true);
  const ry = sampleChannel(keys, frame, "rot_y", (k) => (k.transform || object).rotation[1], true);
  const rz = sampleChannel(keys, frame, "rot_z", (k) => (k.transform || object).rotation[2], true);
  const sx = sampleChannel(keys, frame, "scale_x", (k) => (k.transform || object).size[0]);
  const sy = sampleChannel(keys, frame, "scale_y", (k) => (k.transform || object).size[1]);
  const sz = sampleChannel(keys, frame, "scale_z", (k) => (k.transform || object).size[2]);
  return {
    position: [px, py, pz],
    rotation: [rx, ry, rz],
    size: [Math.max(0.01, sx), Math.max(0.01, sy), Math.max(0.01, sz)],
  };
}

export function generatePointField(density = "balanced", spread = "all_views", customColor = null) {
  const counts = {
    none: 0,
    "0": 0,
    sparse: 300,
    balanced: 800,
    dense: 1800,
    ultra: 3500,
  };
  const count = counts[density] !== undefined ? counts[density] : 800;
  if (count <= 0) {
    return { points: [], colors: [] };
  }
  const points = [];
  const colors = [];

  let baseR = 0.65, baseG = 0.72, baseB = 0.82;
  if (typeof customColor === "string" && customColor.startsWith("#")) {
    const hex = customColor.replace("#", "");
    if (hex.length === 6) {
      baseR = parseInt(hex.slice(0, 2), 16) / 255;
      baseG = parseInt(hex.slice(2, 4), 16) / 255;
      baseB = parseInt(hex.slice(4, 6), 16) / 255;
    }
  }

  const phi = 0.618033988749895;
  const phi2 = 0.324717957244746;

  for (let i = 0; i < count; i++) {
    const u1 = (i * phi) % 1;
    const u2 = (i * phi2) % 1;
    const u3 = ((i + 0.5) * 0.7548776662466927) % 1;

    let x = 0, y = 0, z = 0;
    let r = 0.65, g = 0.72, b = 0.82;

    if (spread === "ground_focus") {
      if (u1 < 0.6) {
        const radius = 0.4 + Math.sqrt(u2) * 24.0;
        const angle = u3 * Math.PI * 2 + i * 2.399963229728653;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = 0.01 + u1 * 0.75;
        r = 0.86; g = 0.90; b = 0.98;
      } else {
        const radius = 1.0 + Math.sqrt(u2) * 18.0;
        const angle = u3 * Math.PI * 2 + i * 2.399963229728653;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = 0.75 + (u1 - 0.6) * 8.5;
        r = 0.62; g = 0.70; b = 0.82;
      }
    } else if (spread === "dome") {
      const theta = u1 * Math.PI * 2;
      const cosPhi = 1.0 - 2.0 * u2;
      const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
      const rad = 1.5 + Math.cbrt(u3) * 20.0;
      x = Math.cos(theta) * sinPhi * rad;
      z = Math.sin(theta) * sinPhi * rad;
      y = Math.max(0.01, cosPhi * rad * 0.75 + 2.5);
      r = 0.72; g = 0.78; b = 0.88;
    } else {
      // "all_views" (Default): 4 distinct stratified layers covering Ground, Low/Mid, High & Foreground
      const layer = i % 4;
      if (layer === 0) {
        // Layer 0: Ground level carpet (Y = 0.01 to 0.35, Radius = 0.3 to 28m)
        const radius = 0.3 + Math.sqrt(u2) * 28.0;
        const angle = i * 2.399963229728653;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = 0.01 + u3 * 0.34;
        r = 0.90; g = 0.94; b = 1.0;
      } else if (layer === 1) {
        // Layer 1: Low & Mid Altitude Volume (Y = 0.35 to 3.5, Radius = 0.6 to 18m)
        const radius = 0.6 + Math.sqrt(u2) * 18.0;
        const angle = i * 2.399963229728653;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = 0.35 + u3 * 3.15;
        r = 0.68; g = 0.76; b = 0.86;
      } else if (layer === 2) {
        // Layer 2: High Altitude & Overhead Canopy (Y = 3.5 to 15.0, Radius = 2.0 to 24m)
        const radius = 2.0 + Math.sqrt(u2) * 24.0;
        const angle = i * 2.399963229728653;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = 3.5 + u3 * 11.5;
        r = 0.55; g = 0.65; b = 0.78;
      } else {
        // Layer 3: Close Foreground Depth Stratification (Y = 0.05 to 5.0, Radius = 0.5 to 7.0m)
        const radius = 0.5 + u2 * 6.5;
        const angle = i * 2.399963229728653;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = 0.05 + u3 * 4.95;
        r = 0.80; g = 0.86; b = 0.94;
      }
    }

    points.push(x, y, z);
    colors.push(customColor ? r * baseR : r, customColor ? g * baseG : g, customColor ? b * baseB : b);
  }

  return { points, colors };
}

export function defaultState() {
  const camera = defaultCamera();
  const keyframes = [{ frame: 0, camera: cloneCamera(camera), interpolation: "ease" }];
  return {
    schema_version: 1, fps: 24, duration_frames: 120, width: 1280, height: 720, render_mode: "omni_ref", camera, keyframes,
    cameras: [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: cloneCamera(camera), keyframes }], active_camera_id: "camera_1", playblast_camera_id: "camera_1",
    objects: [{ id: "subject", type: "card", name: "Subject Card", position: [0, 1.5, 0], rotation: [0, 0, 0], size: [2, 3, 0.01], material_mode: "textured", color: "#8c929b", keyframes: [], enabled: true, asset: "" }],
    metadata: {}, guides: true, burn_in: false, speed_heatmap: false, playblast_grid: false, card_fit: "contain", card_asset: "", reference_index: 0,
    point_density: "balanced", point_spread: "all_views", point_color: "#cbd5e1", viewport_bg_color: "#121212", viewport_bg_image: "", viewport_bg_sequence: [],
    show_wireframe: false, show_vertices: false, select_mode: "object",
    gizmo_mode: "translate", gizmo_space: "world", auto_key: false, view_mode: "camera", camera_view_visible: true, editor_views: defaultEditorViews(), ui_density: "advanced",
    snap_enabled: true, snap_frames: 1, timecode_mode: "time", loop_playback: false, playback_range: null, markers: [],
    preview_layout: "auto", maximized_camera_id: null, safe_areas: false, resolution_gate: false, aspect_ratio: "auto",
  };
}

export function cloneCamera(camera) {
  const fallback = defaultCamera();
  if (!camera || typeof camera !== "object") return fallback;
  const pos = Array.isArray(camera.position) ? [...camera.position] : [...fallback.position];
  const tgt = Array.isArray(camera.target) ? [...camera.target] : [...fallback.target];
  const near = Math.max(0.0001, Number.isFinite(Number(camera.near)) ? Number(camera.near) : 0.01);
  const farValue = Number.isFinite(Number(camera.far)) ? Number(camera.far) : 10000;
  return {
    position: pos,
    target: tgt,
    fov: Number(camera.fov ?? 35),
    roll: Number(camera.roll ?? 0),
    camera_type: camera.camera_type || "perspective",
    zoom: Number(camera.zoom ?? 1),
    near,
    far: Math.max(near + 0.0001, farValue),
    ...(Array.isArray(camera.up) ? { up: [...camera.up] } : {}),
  };
}

export function sanitizeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const out = { ...base, ...raw };
  out.fps = clamp(Number(out.fps || 24), 1, 120); out.duration_frames = Math.max(1, Number(out.duration_frames || 120)); out.width = clamp(Number(out.width || 1280), 64, 4096); out.height = clamp(Number(out.height || 720), 64, 4096);
  const sanitizeKeyframes = (items, fallbackCamera) => (Array.isArray(items) ? items : []).map((key) => ({
    frame: clamp(Math.round(Number(key.frame || 0)), 0, out.duration_frames - 1),
    camera: cloneCamera(key.camera || key || fallbackCamera),
    interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(key.interpolation) ? key.interpolation : "ease",
    ...(key.tangents && typeof key.tangents === "object" ? { tangents: { ...key.tangents } } : {}),
    ...(Array.isArray(key.references) ? { references: key.references.map((r) => ({ ...r })) } : {}),
  }));
  const legacyCamera = cloneCamera(out.camera || base.camera);
  let legacyKeys = sanitizeKeyframes(out.keyframes, legacyCamera); legacyKeys = [...new Map(legacyKeys.map((key) => [key.frame, key])).values()].sort((a, b) => a.frame - b.frame);
  if (!legacyKeys.length) legacyKeys = [{ frame: 0, camera: cloneCamera(legacyCamera), interpolation: "ease" }];
  const sourceCameras = Array.isArray(out.cameras) && out.cameras.length ? out.cameras : [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: legacyCamera, keyframes: legacyKeys }];
  const usedCameraIds = new Set();
  out.cameras = sourceCameras.map((item, index) => {
    let id = String(item?.id || `camera_${index + 1}`); if (usedCameraIds.has(id)) id = `camera_${index + 1}`; usedCameraIds.add(id);
    const camera = cloneCamera(item?.camera || item?.keyframes?.[0]?.camera || legacyCamera); let keyframes = sanitizeKeyframes(item?.keyframes, camera); keyframes = [...new Map(keyframes.map((key) => [key.frame, key])).values()].sort((a, b) => a.frame - b.frame);
    if (!keyframes.length) keyframes = [{ frame: 0, camera: cloneCamera(camera), interpolation: "ease" }];
    return {
      id,
      name: String(item?.name || `Camera ${index + 1}`),
      color: typeof item?.color === "string" ? item.color : null,
      camera,
      keyframes,
      target_object_id: typeof item?.target_object_id === "string" ? item.target_object_id : (typeof out.target_object_id === "string" ? out.target_object_id : null),
      target_offset: Array.isArray(item?.target_offset) ? item.target_offset.map(Number) : [0, 0, 0],
      locked: Boolean(item?.locked),
      muted: Boolean(item?.muted),
      solo: Boolean(item?.solo),
    };
  });
  out.active_camera_id = out.cameras.some((item) => item.id === out.active_camera_id) ? out.active_camera_id : out.cameras[0].id;
  out.playblast_camera_id = out.cameras.some((item) => item.id === out.playblast_camera_id) ? out.playblast_camera_id : out.active_camera_id;
  const activeCamera = out.cameras.find((item) => item.id === out.active_camera_id); out.camera = activeCamera.camera; out.keyframes = activeCamera.keyframes;
  out.target_object_id = activeCamera.target_object_id || null;
  out.target_offset = activeCamera.target_offset || [0, 0, 0];
  out.objects = (Array.isArray(out.objects) ? out.objects : base.objects).map((object) => ({
    ...object,
    color: typeof object?.color === "string" ? object.color : null,
    locked: Boolean(object.locked),
    parent_id: typeof object.parent_id === "string" ? object.parent_id : null,
    position: Array.isArray(object.position) ? object.position.map(Number) : [0, 0, 0],
    rotation: Array.isArray(object.rotation) ? object.rotation.map(Number) : [0, 0, 0],
    size: Array.isArray(object.size) ? (object.size.length === 2 ? [...object.size.map(Number), 0.01] : object.size.map(Number)) : [1, 1, 1],
    material_mode: ["textured", "checker", "neutral", "wireframe"].includes(object.material_mode) ? object.material_mode : "textured",
    keyframes: (Array.isArray(object.keyframes) ? object.keyframes : []).map((key) => ({
      frame: clamp(Math.round(Number(key.frame || 0)), 0, out.duration_frames - 1),
      transform: cloneTransform(key.transform || object),
      interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(key.interpolation) ? key.interpolation : "ease",
      ...(key.tangents && typeof key.tangents === "object" ? { tangents: { ...key.tangents } } : {}),
    })).sort((a, b) => a.frame - b.frame)
  }));
  out.gizmo_mode = ["translate", "rotate", "scale"].includes(out.gizmo_mode) ? out.gizmo_mode : "translate"; out.gizmo_space = out.gizmo_space === "local" ? "local" : "world"; out.ui_density = ["basic", "animation", "advanced"].includes(out.ui_density) ? out.ui_density : "advanced";
  out.select_mode = ["object", "vertex", "edge", "face"].includes(out.select_mode) ? out.select_mode : "object";
  out.show_wireframe = Boolean(out.show_wireframe);
  out.show_vertices = Boolean(out.show_vertices);
  out.point_density = ["none", "0", "sparse", "balanced", "dense", "ultra"].includes(out.point_density) ? out.point_density : "balanced";
  out.point_spread = ["all_views", "ground_focus", "dome"].includes(out.point_spread) ? out.point_spread : "all_views";
  out.point_color = typeof out.point_color === "string" ? out.point_color : "#cbd5e1";
  out.viewport_bg_color = typeof out.viewport_bg_color === "string" ? out.viewport_bg_color : "#121212";
  out.viewport_bg_image = typeof out.viewport_bg_image === "string" ? out.viewport_bg_image : "";
  out.viewport_bg_sequence = Array.isArray(out.viewport_bg_sequence) ? out.viewport_bg_sequence.map(String) : [];
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

export * from "./core/camera.js";
export * from "./core/presets.js";
