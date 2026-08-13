import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { OmniWebGLViewport, encodeDeterministicPlayblast, supportsDeterministicEncoding } from "./omnicam-webgl.js";

const EXTENSION_NAME = "Majoor.OmniCam.Director";
const NODE_CLASS = "MajoorOmniCamDirector";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const v3 = (x = 0, y = 0, z = 0) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const length = (a) => Math.sqrt(Math.max(1e-12, dot(a, a)));
const norm = (a) => mul(a, 1 / length(a));
const distanceToSegment = (p, a, b) => {
  const ab = [b[0] - a[0], b[1] - a[1]];
  const ap = [p[0] - a[0], p[1] - a[1]];
  const d = Math.max(1e-9, ab[0] * ab[0] + ab[1] * ab[1]);
  const t = clamp((ap[0] * ab[0] + ap[1] * ab[1]) / d, 0, 1);
  return Math.hypot(p[0] - a[0] - ab[0] * t, p[1] - a[1] - ab[1] * t);
};
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const ease = (t, mode = "ease") => {
  t = clamp(t, 0, 1);
  if (mode === "linear") return t;
  if (mode === "ease_in") return t * t;
  if (mode === "ease_out") return 1 - (1 - t) * (1 - t);
  if (mode === "smooth") return t * t * t * (t * (t * 6 - 15) + 10);
  if (mode === "bezier") return 0.15 * (1 - t) * (1 - t) * t + 2.85 * (1 - t) * t * t + t * t * t;
  return t * t * (3 - 2 * t);
};

function defaultCamera() {
  return {
    position: [6, 4, 6],
    target: [0, 1.5, 0],
    fov: 35,
    roll: 0,
    camera_type: "perspective",
    zoom: 1,
    near: 0.01,
    far: 10000,
  };
}

function defaultEditorViews() {
  const target = [0, 1, 0];
  const view = (position, up = [0, 1, 0], cameraType = "orthographic") => ({ ...defaultCamera(), position, target: [...target], up, camera_type: cameraType, zoom: 1 });
  return {
    perspective: view([8, 6, 8], [0, 1, 0], "perspective"),
    top: view([0, 14, 0], [0, 0, -1]),
    right: view([14, 1, 0]),
    left: view([-14, 1, 0]),
    bottom: view([0, -12, 0], [0, 0, 1]),
  };
}

function cloneTransform(value) {
  return {
    position: [...(value.position || [0, 0, 0])],
    rotation: [...(value.rotation || [0, 0, 0])],
    size: [...(value.size || [1, 1, 1])],
  };
}

function sampleObjectTransform(object, frame) {
  const keys = object.keyframes || [];
  if (!keys.length) return cloneTransform(object);
  if (frame <= keys[0].frame) return cloneTransform(keys[0].transform);
  if (frame >= keys[keys.length - 1].frame) return cloneTransform(keys[keys.length - 1].transform);
  let left = keys[0], right = keys[keys.length - 1];
  for (let index = 0; index < keys.length - 1; index++) if (keys[index].frame <= frame && frame <= keys[index + 1].frame) { left = keys[index]; right = keys[index + 1]; break; }
  const t = ease((frame - left.frame) / Math.max(1, right.frame - left.frame), left.interpolation);
  return { position: lerp3(left.transform.position, right.transform.position, t), rotation: lerp3(left.transform.rotation, right.transform.rotation, t), size: lerp3(left.transform.size, right.transform.size, t) };
}

function defaultState() {
  const camera = defaultCamera();
  const keyframes = [{ frame: 0, camera: cloneCamera(camera), interpolation: "ease" }];
  return {
    schema_version: 1,
    fps: 24,
    duration_frames: 120,
    width: 1280,
    height: 720,
    render_mode: "omni_ref",
    camera,
    keyframes,
    cameras: [{ id: "camera_1", name: "Camera 1", camera: cloneCamera(camera), keyframes }],
    active_camera_id: "camera_1",
    playblast_camera_id: "camera_1",
    objects: [
      { id: "subject", type: "card", name: "Subject", position: [0, 1.5, 0], rotation: [0, 0, 0], size: [2.0, 3.0], material_mode: "textured", keyframes: [], enabled: true },
      { id: "proxy_cube", type: "cube", name: "Cube", position: [2.2, 0.75, -1.2], rotation: [0, 0, 0], size: [1.5, 1.5, 1.5], material_mode: "textured", keyframes: [], enabled: true },
    ],
    metadata: { authoring: "Majoor OmniCam" },
    card_asset: "",
    card_fit: "contain",
    burn_in: false,
    guides: true,
    playblast_grid: false,
    speed_heatmap: false,
    gizmo_mode: "translate",
    gizmo_space: "world",
    auto_key: false,
    reference_index: 0,
    view_mode: "camera",
    camera_view_visible: true,
    editor_views: defaultEditorViews(),
  };
}

function cloneCamera(camera) {
  const near = Math.max(0.0001, Number.isFinite(Number(camera.near)) ? Number(camera.near) : 0.01);
  const farValue = Number.isFinite(Number(camera.far)) ? Number(camera.far) : 10000;
  return {
    position: [...camera.position],
    target: [...camera.target],
    fov: Number(camera.fov ?? 35),
    roll: Number(camera.roll ?? 0),
    camera_type: camera.camera_type || "perspective",
    zoom: Number(camera.zoom ?? 1),
    near,
    far: Math.max(near + 0.0001, farValue),
    ...(Array.isArray(camera.up) ? { up: [...camera.up] } : {}),
  };
}

function sanitizeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const out = { ...base, ...raw };
  out.fps = clamp(Number(out.fps || 24), 1, 120);
  out.duration_frames = Math.max(1, Number(out.duration_frames || 120));
  out.width = clamp(Number(out.width || 1280), 64, 4096);
  out.height = clamp(Number(out.height || 720), 64, 4096);
  const sanitizeKeyframes = (items, fallbackCamera) => (Array.isArray(items) ? items : []).map((k) => ({
    frame: clamp(Math.round(Number(k.frame || 0)), 0, out.duration_frames - 1),
    camera: cloneCamera(k.camera || k || fallbackCamera),
    interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(k.interpolation) ? k.interpolation : "ease",
  }));
  const legacyCamera = cloneCamera(out.camera || base.camera);
  let legacyKeys = sanitizeKeyframes(out.keyframes, legacyCamera);
  legacyKeys = [...new Map(legacyKeys.map((key) => [key.frame, key])).values()].sort((a, b) => a.frame - b.frame);
  if (!legacyKeys.length) legacyKeys = [{ frame: 0, camera: cloneCamera(legacyCamera), interpolation: "ease" }];
  const sourceCameras = Array.isArray(out.cameras) && out.cameras.length ? out.cameras : [{ id: "camera_1", name: "Camera 1", camera: legacyCamera, keyframes: legacyKeys }];
  const usedCameraIds = new Set();
  out.cameras = sourceCameras.map((item, index) => {
    let id = String(item?.id || `camera_${index + 1}`);
    if (usedCameraIds.has(id)) id = `camera_${index + 1}`;
    usedCameraIds.add(id);
    const camera = cloneCamera(item?.camera || item?.keyframes?.[0]?.camera || legacyCamera);
    let keyframes = sanitizeKeyframes(item?.keyframes, camera);
    keyframes = [...new Map(keyframes.map((key) => [key.frame, key])).values()].sort((a, b) => a.frame - b.frame);
    if (!keyframes.length) keyframes = [{ frame: 0, camera: cloneCamera(camera), interpolation: "ease" }];
    return { id, name: String(item?.name || `Camera ${index + 1}`), camera, keyframes };
  });
  out.active_camera_id = out.cameras.some((item) => item.id === out.active_camera_id) ? out.active_camera_id : out.cameras[0].id;
  out.playblast_camera_id = out.cameras.some((item) => item.id === out.playblast_camera_id) ? out.playblast_camera_id : out.active_camera_id;
  const activeCamera = out.cameras.find((item) => item.id === out.active_camera_id);
  out.camera = activeCamera.camera;
  out.keyframes = activeCamera.keyframes;
  out.objects = (Array.isArray(out.objects) ? out.objects : base.objects).map((object) => ({
    ...object,
    position: Array.isArray(object.position) ? object.position.map(Number) : [0, 0, 0],
    rotation: Array.isArray(object.rotation) ? object.rotation.map(Number) : [0, 0, 0],
    size: Array.isArray(object.size) ? object.size.map(Number) : [1, 1, 1],
    material_mode: ["textured", "checker", "neutral", "wireframe"].includes(object.material_mode) ? object.material_mode : "textured",
    keyframes: (Array.isArray(object.keyframes) ? object.keyframes : []).map((key) => ({ frame: clamp(Math.round(Number(key.frame || 0)), 0, out.duration_frames - 1), transform: cloneTransform(key.transform || object), interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(key.interpolation) ? key.interpolation : "ease" })).sort((a, b) => a.frame - b.frame),
  }));
  out.gizmo_mode = ["translate", "rotate", "scale"].includes(out.gizmo_mode) ? out.gizmo_mode : "translate";
  out.gizmo_space = out.gizmo_space === "local" ? "local" : "world";
  out.auto_key = Boolean(out.auto_key);
  out.playblast_grid = Boolean(out.playblast_grid);
  out.reference_index = Math.max(0, Number(out.reference_index || 0));
  out.view_mode = ["camera", "perspective", "top", "right", "left", "bottom"].includes(out.view_mode) ? out.view_mode : "camera";
  out.camera_view_visible = out.camera_view_visible !== false;
  const editorViews = defaultEditorViews();
  out.editor_views = Object.fromEntries(Object.entries(editorViews).map(([name, camera]) => [name, cloneCamera(out.editor_views?.[name] || camera)]));
  return out;
}

function rotateEuler(vector, rotation) {
  let [x, y, z] = vector;
  const [rx, ry, rz] = (rotation || [0, 0, 0]).map((value) => value * Math.PI / 180);
  let c = Math.cos(rx), s = Math.sin(rx); [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ry); s = Math.sin(ry); [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(rz); s = Math.sin(rz); [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

function annotatedAssetUrl(value) {
  if (!value) return "";
  const match = String(value).match(/^(.*?)\s*\[(input|output|temp)\]$/);
  const path = (match?.[1] || value).replaceAll("\\", "/");
  const parts = path.split("/");
  const filename = parts.pop();
  return api.apiURL(`/view?${new URLSearchParams({ filename, subfolder: parts.join("/"), type: match?.[2] || "input" })}`);
}

function cameraBasis(camera) {
  const forward = norm(sub(camera.target, camera.position));
  let right = norm(cross(forward, camera.up || [0, 1, 0]));
  let up = norm(cross(right, forward));
  if (Math.abs(camera.roll || 0) > 1e-6) {
    const r = (camera.roll * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    const nr = add(mul(right, c), mul(up, s));
    const nu = add(mul(up, c), mul(right, -s));
    right = nr; up = nu;
  }
  return { right, up, forward };
}

function project(point, camera, width, height) {
  const { right, up, forward } = cameraBasis(camera);
  const rel = sub(point, camera.position);
  const z = dot(rel, forward);
  const near = Math.max(0.0001, camera.near || 0.01);
  const far = Math.max(near + 0.0001, camera.far || 10000);
  if (z <= near || z >= far) return null;
  const x = dot(rel, right);
  const y = dot(rel, up);
  if (camera.camera_type === "orthographic") {
    const scale = height / Math.max(0.01, 10 / Math.max(0.01, camera.zoom || 1));
    return [width * 0.5 + x * scale, height * 0.5 - y * scale, z];
  }
  const f = 0.5 * height / Math.tan((Math.max(1, camera.fov || 35) * Math.PI / 180) * 0.5);
  return [width * 0.5 + (x * f) / z, height * 0.5 - (y * f) / z, z];
}

function sampleCamera(state, frame) {
  const keys = state.keyframes;
  if (frame <= keys[0].frame) return cloneCamera(keys[0].camera);
  if (frame >= keys[keys.length - 1].frame) return cloneCamera(keys[keys.length - 1].camera);
  let left = keys[0], right = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (keys[i].frame <= frame && frame <= keys[i + 1].frame) {
      left = keys[i]; right = keys[i + 1]; break;
    }
  }
  const t = ease((frame - left.frame) / Math.max(1, right.frame - left.frame), left.interpolation);
  return {
    position: lerp3(left.camera.position, right.camera.position, t),
    target: lerp3(left.camera.target, right.camera.target, t),
    fov: lerp(left.camera.fov, right.camera.fov, t),
    roll: lerp(left.camera.roll || 0, right.camera.roll || 0, t),
    camera_type: t < 0.5 ? left.camera.camera_type : right.camera.camera_type,
    zoom: lerp(left.camera.zoom || 1, right.camera.zoom || 1, t),
    near: lerp(left.camera.near || 0.01, right.camera.near || 0.01, t),
    far: lerp(left.camera.far || 10000, right.camera.far || 10000, t),
  };
}

function buildRoot() {
  const root = document.createElement("div");
  root.className = "majoor-omnicam";
  root.innerHTML = `
    <style>
      .majoor-omnicam{font:12px/1.35 system-ui,sans-serif;color:var(--fg-color,#ddd);background:#171717;border:1px solid #383838;border-radius:10px;overflow:hidden;user-select:none}
      .majoor-omnicam *{box-sizing:border-box}
      .majoor-omnicam .top{position:relative;z-index:10;display:flex;gap:4px;align-items:center;min-height:38px;padding:4px 6px;background:#202020;border-bottom:1px solid #333}
      .majoor-omnicam button,.majoor-omnicam select,.majoor-omnicam input{font:inherit;color:#eee;background:#2a2a2a;border:1px solid #444;border-radius:6px;padding:4px 7px}
      .majoor-omnicam button:hover{background:#343434}.majoor-omnicam button.primary{background:#3d5f48;border-color:#5f8f6b}.majoor-omnicam button.active{background:#713737;border-color:#ef6767;color:#fff}
      .majoor-omnicam .icon-button{display:inline-grid;place-items:center;width:28px;height:28px;min-width:28px;padding:0}.majoor-omnicam .icon-button .pi{font-size:13px}
      .majoor-omnicam .toolbar-menu{position:relative}.majoor-omnicam .toolbar-menu>summary{display:flex;align-items:center;gap:5px;min-height:28px;padding:4px 8px;border:1px solid transparent;border-radius:6px;cursor:pointer;white-space:nowrap;list-style:none}.majoor-omnicam .toolbar-menu>summary::-webkit-details-marker{display:none}.majoor-omnicam .toolbar-menu[open]>summary,.majoor-omnicam .toolbar-menu>summary:hover{background:#303030;border-color:#484848}
      .majoor-omnicam .menu-panel{position:absolute;z-index:50;top:calc(100% + 5px);left:0;display:flex;flex-direction:column;gap:4px;width:240px;padding:7px;background:#202020;border:1px solid #4a4a4a;border-radius:8px;box-shadow:0 10px 24px #000a}.majoor-omnicam .menu-panel.right{right:0;left:auto}.majoor-omnicam .menu-panel button{display:flex;align-items:center;gap:7px;text-align:left}.majoor-omnicam .menu-panel label{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#bbb}.majoor-omnicam .menu-panel label>select,.majoor-omnicam .menu-panel label>input[type=number]{width:126px}.majoor-omnicam .menu-panel label>input[type=checkbox]{width:auto}.majoor-omnicam .menu-title{color:#888;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.majoor-omnicam .menu-divider{height:1px;margin:3px 0;background:#3a3a3a}.majoor-omnicam .camera-menu-list{display:flex;max-height:180px;flex-direction:column;gap:3px;overflow:auto}.majoor-omnicam .camera-menu-list button.selected{border-color:#e3c35d;color:#f2d06b}
      .majoor-omnicam .viewport-wrap{position:relative;width:100%;min-height:280px;aspect-ratio:16/9;background:#111;touch-action:none;overscroll-behavior:contain;pointer-events:auto;outline:none;box-shadow:inset 0 0 0 2px transparent;transition:box-shadow .12s ease}
      .majoor-omnicam .viewport-wrap.edit-mode{box-shadow:inset 0 0 0 3px #ef5350}.majoor-omnicam .viewport-wrap.auto-key{box-shadow:inset 0 0 0 3px #f0a52b}.majoor-omnicam .viewport-wrap.auto-key.edit-mode{box-shadow:inset 0 0 0 3px #ef5350,inset 0 0 0 6px #f0a52b}
      .majoor-omnicam canvas{display:block;width:100%;height:100%;pointer-events:auto;outline:none;cursor:grab}.majoor-omnicam canvas.dragging{cursor:grabbing}
      .majoor-omnicam .viewport-actions{position:absolute;z-index:5;left:9px;top:8px;display:flex;gap:5px}.majoor-omnicam .viewport-actions button{display:flex;align-items:center;gap:6px;background:#161616d9;backdrop-filter:blur(4px)}
      .majoor-omnicam .view-nav{position:absolute;z-index:6;left:9px;top:43px;display:flex;align-items:center;gap:5px;padding:4px 6px;border:1px solid #444;border-radius:5px;background:#161616e8}.majoor-omnicam .view-nav select{height:25px;min-width:108px}.majoor-omnicam .view-nav button{width:25px;height:25px;padding:0}
      .majoor-omnicam .viewport-state{position:absolute;z-index:4;right:10px;top:9px;display:none;padding:3px 7px;border-radius:4px;background:#000b;font-weight:700;letter-spacing:.04em;pointer-events:none}.majoor-omnicam .viewport-wrap.edit-mode .viewport-state,.majoor-omnicam .viewport-wrap.auto-key .viewport-state{display:block}.majoor-omnicam .viewport-wrap.edit-mode .viewport-state{color:#ff8c89}.majoor-omnicam .viewport-wrap.auto-key .viewport-state{color:#ffc45e}
      .majoor-omnicam .hud{position:absolute;left:10px;top:82px;color:#ddd;background:#0009;border-radius:5px;padding:5px 7px;pointer-events:none;white-space:pre}
      .majoor-omnicam .viewport-inspector{position:absolute;z-index:6;right:9px;top:42px;width:208px;max-height:calc(100% - 52px);overflow:auto;padding:7px;background:#181818e8;border:1px solid #4a4a4a;border-radius:7px;backdrop-filter:blur(5px)}
      .majoor-omnicam .camera-view-row{position:relative;display:flex;width:100%;padding:5px 30px 5px 5px;background:#181818;border-top:1px solid #333}.majoor-omnicam .camera-view-row[hidden]{display:none}.majoor-omnicam .camera-preview-strip{display:grid;width:100%;grid-auto-flow:column;grid-auto-columns:minmax(220px,calc((100% - 10px)/3));gap:5px;overflow-x:auto}.majoor-omnicam .camera-preview-tile{position:relative;min-width:0;height:clamp(150px,18vw,230px);overflow:hidden;background:#101010;border:1px solid #4c4c4c;border-top:4px solid var(--camera-color);border-radius:4px;cursor:pointer}.majoor-omnicam .camera-preview-tile.playblast{border-color:#f2d06b;border-top-color:#f2d06b;box-shadow:inset 0 0 0 1px #f2d06b}.majoor-omnicam .camera-preview-head{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;align-items:center;gap:5px;min-height:25px;padding:3px 6px;background:#171717e8;color:#ddd;font-size:10px;font-weight:700;letter-spacing:.04em;pointer-events:none}.majoor-omnicam .camera-preview-head .output-mark{margin-left:auto;color:#f2d06b}.majoor-omnicam .camera-preview-tile canvas{width:100%;height:100%;cursor:pointer}.majoor-omnicam .camera-view-badge{position:absolute;left:6px;bottom:5px;padding:2px 5px;border-radius:3px;background:#000b;color:#ddd;font-size:9px;pointer-events:none}.majoor-omnicam .camera-strip-close{position:absolute;right:4px;top:5px;width:23px;height:23px;padding:0}
      .majoor-omnicam .scene-tree{display:flex;flex-direction:column;gap:2px;margin-bottom:6px}.majoor-omnicam .scene-item{display:flex;align-items:center;gap:6px;width:100%;min-height:24px;padding:3px 6px;text-align:left;border-color:transparent;background:transparent}.majoor-omnicam .scene-item.selected{background:#35506c;border-color:#6f9bca}.majoor-omnicam .scene-item .pi{width:14px;text-align:center}
      .majoor-omnicam .transform-tools{display:flex;gap:3px;margin:5px 0}.majoor-omnicam .transform-tools button{width:28px;height:25px;padding:0}.majoor-omnicam .transform-tools button.active{background:#3f6282;border-color:#72a4d4}.majoor-omnicam .transform-tools select{min-width:0;flex:1;padding:2px 4px}
      .majoor-omnicam .viewport-grid{display:grid;grid-template-columns:1fr 66px;gap:3px 5px}.majoor-omnicam .viewport-grid label{display:contents}.majoor-omnicam .viewport-grid span{align-self:center;color:#bbb}.majoor-omnicam .viewport-grid input{width:66px;padding:2px 4px}.majoor-omnicam .entity-panel[hidden]{display:none}.majoor-omnicam .animation-row{display:flex;gap:5px;align-items:center;margin-top:6px}.majoor-omnicam .animation-row select{min-width:0;flex:1}
      .majoor-omnicam.recording [data-act="record"]{background:#7c3030;border-color:#d85b5b}
      .majoor-omnicam .timeline{padding:8px;background:#1b1b1b;border-top:1px solid #333}
      .majoor-omnicam .row{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.majoor-omnicam .row + .row{margin-top:6px}
      .majoor-omnicam input[type=range]{padding:0;flex:1;min-width:160px}.majoor-omnicam input[type=number]{width:68px}
      .majoor-omnicam .timeline-toolbar{justify-content:flex-start;gap:4px}.majoor-omnicam .timeline-summary{margin-left:auto;color:#aaa}.majoor-omnicam .toolbar-divider{width:1px;height:20px;margin:0 3px;background:#3c3c3c}
      .majoor-omnicam .keys{position:relative;width:100%;height:68px;margin-top:7px;overflow:hidden;background:linear-gradient(#202020,#181818);border:1px solid #414141;border-radius:6px;cursor:crosshair;outline:none;touch-action:none}
      .majoor-omnicam .keys:focus-visible{border-color:#88a8e8;box-shadow:0 0 0 1px #88a8e8}
      .majoor-omnicam .timeline-tick{position:absolute;top:0;height:100%;border-left:1px solid #3c3c3c;color:#8d8d8d;font-size:10px;padding:2px 0 0 4px;pointer-events:none}
      .majoor-omnicam .playhead{position:absolute;z-index:2;top:0;bottom:0;width:1px;background:#f2d06b;pointer-events:none}.majoor-omnicam .playhead::before{content:"";position:absolute;left:-5px;top:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid #f2d06b}
      .majoor-omnicam .key{appearance:none;position:absolute;z-index:3;top:16px;width:34px;height:47px;transform:translateX(-50%);padding:0;border:0;background:transparent;cursor:ew-resize;color:#aaa;outline:none}
      .majoor-omnicam .key::before{content:"";position:absolute;left:11px;top:4px;width:12px;height:12px;transform:rotate(45deg);border:2px solid #9db2dc;background:#405273;border-radius:2px}
      .majoor-omnicam .key:hover::before,.majoor-omnicam .key:focus-visible::before{border-color:#fff}.majoor-omnicam .key.at-playhead::before{border-color:#f2d06b}.majoor-omnicam .key.selected::before{background:#f2d06b;border-color:#fff0ad;box-shadow:0 0 0 2px #f2d06b55}.majoor-omnicam .key.editing::before{background:#e34f4f;border-color:#ffc0c0;box-shadow:0 0 0 2px #e34f4f66}
      .majoor-omnicam .key-label{position:absolute;top:24px;left:0;width:34px;text-align:center;font-size:10px;font-weight:600}
      .majoor-omnicam .curve-editor{margin-top:6px;border:1px solid #393939;border-radius:6px;background:#151515}.majoor-omnicam .curve-editor>summary{display:flex;align-items:center;gap:6px;min-height:29px;padding:4px 7px;cursor:pointer;list-style:none}.majoor-omnicam .curve-editor>summary::-webkit-details-marker{display:none}.majoor-omnicam .curve-toolbar{display:flex;align-items:center;gap:4px;padding:0 6px 5px;flex-wrap:wrap}.majoor-omnicam .curve-toolbar select{height:27px;padding:2px 5px}.majoor-omnicam .curve-mode{height:27px;padding:2px 6px}.majoor-omnicam .curve-mode.active{background:#644536;border-color:#d18a57}.majoor-omnicam .curve-canvas{display:block;width:100%;height:178px;border-top:1px solid #333;background:#111;cursor:crosshair;touch-action:none}
      .majoor-omnicam .compact-panel{margin-top:6px;border:1px solid #353535;border-radius:6px;background:#202020}.majoor-omnicam .compact-panel>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 7px;cursor:pointer;color:#ccc;list-style:none}.majoor-omnicam .compact-panel>summary::-webkit-details-marker{display:none}.majoor-omnicam .compact-panel>summary::after{content:"›";margin-left:auto;transform:rotate(90deg);color:#777}.majoor-omnicam .compact-panel[open]>summary::after{transform:rotate(-90deg)}.majoor-omnicam .panel-body{padding:0 7px 7px}
      .majoor-omnicam .key-editor-header{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:6px}.majoor-omnicam .key-editor-grid,.majoor-omnicam .inspector-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:5px}.majoor-omnicam .key-editor-grid label,.majoor-omnicam .inspector-grid label{display:flex;align-items:center;justify-content:space-between;gap:4px;color:#bbb}.majoor-omnicam .key-editor-grid input,.majoor-omnicam .key-editor-grid select,.majoor-omnicam .inspector-grid input,.majoor-omnicam .inspector-grid select{min-width:0;width:70px}.majoor-omnicam .key-editor[data-empty="true"] .key-editor-grid{opacity:.45}
      .majoor-omnicam .status{margin-left:auto;color:#aaa}.majoor-omnicam .hint{color:#aaa;font-size:11px}
      .majoor-omnicam .objects{display:flex;gap:5px;flex-wrap:wrap}.majoor-omnicam .badge{background:#282828;border:1px solid #3d3d3d;border-radius:10px;padding:2px 6px}
      .majoor-omnicam .badge.selected{border-color:#85a6e8;background:#34415a}
      .majoor-omnicam details.help{padding:7px 10px;background:#181818;color:#c8c8c8}.majoor-omnicam details.help summary{cursor:pointer;color:#f2d06b}.majoor-omnicam details.help p{margin:6px 0}
    </style>
    <div class="top">
      <details class="toolbar-menu" data-menu="scene"><summary><i class="pi pi-box"></i> Scene <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
        <div class="menu-title">Cards & models</div>
        <button data-act="load-card"><i class="pi pi-image"></i> Set Subject Card</button><button data-act="add-card"><i class="pi pi-images"></i> Add Media Card</button><button data-act="load-model"><i class="pi pi-box"></i> Import 3D Scene</button><span class="hint">GLB, OBJ, FBX, STL, PLY. Convert ABC first.</span>
        <div class="menu-divider"></div><div class="menu-title">Objects</div>
        <button data-object-type="ground"><i class="pi pi-minus"></i> Ground</button><button data-object-type="cube"><i class="pi pi-stop"></i> Cube</button><button data-object-type="sphere"><i class="pi pi-circle"></i> Sphere</button><button data-object-type="human"><i class="pi pi-user"></i> Human Proxy</button><button data-object-type="null"><i class="pi pi-plus"></i> Null</button>
      </div></details>
      <input data-role="file" type="file" accept="image/*,video/*" hidden><input data-role="model-file" type="file" accept=".glb,.obj,.fbx,.stl,.ply" hidden>
      <details class="toolbar-menu" data-menu="camera"><summary><i class="pi pi-video"></i> <span data-role="camera-summary">Camera 1 · Key F0</span> <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
        <div class="menu-title">Animated cameras</div><div class="camera-menu-list" data-role="camera-menu-list"></div><button data-act="add-camera"><i class="pi pi-plus"></i> Add Camera</button><div class="menu-divider"></div>
        <label>FOV <input data-role="fov" type="number" min="5" max="150" step="1" value="35"></label><label>Roll <input data-role="roll" type="number" min="-180" max="180" step="1" value="0"></label><label>Move speed <input data-role="speed" type="number" min="0.05" max="5" step="0.05" value="1"></label>
        <label>Projection <select data-role="camera-type"><option value="perspective">Perspective</option><option value="orthographic">Orthographic</option></select></label><label>New key interpolation <select data-role="interp"><option value="ease">Ease</option><option value="smooth">Smooth</option><option value="bezier">Bezier</option><option value="linear">Linear</option><option value="ease_in">Ease In</option><option value="ease_out">Ease Out</option></select></label>
        <button data-act="reset-camera"><i class="pi pi-refresh"></i> Reset Camera</button>
      </div></details>
      <details class="toolbar-menu" data-menu="show"><summary><i class="pi pi-eye"></i> Show <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
        <label><span><i class="pi pi-th-large"></i> Guides</span><input data-role="guides" type="checkbox" checked></label><label><span><i class="pi pi-table"></i> Playblast Grid</span><input data-role="playblast-grid" type="checkbox"></label><label><span><i class="pi pi-tag"></i> Burn-in</span><input data-role="burn-in" type="checkbox"></label><label><span><i class="pi pi-chart-line"></i> Speed map</span><input data-role="speed-heatmap" type="checkbox"></label>
        <div class="menu-divider"></div><label>Proxy mode <select data-role="mode"><option value="omni_ref">Omni Ref</option><option value="card_grid">Card + Grid</option><option value="graybox">Graybox</option><option value="grid">Grid</option><option value="point_field">Point Field</option><option value="wireframe">Wireframe</option></select></label><label>Card fit <select data-role="card-fit"><option value="contain">Fit</option><option value="cover">Fill</option><option value="stretch">Stretch</option></select></label>
      </div></details>
      <details class="toolbar-menu" data-menu="output"><summary><i class="pi pi-send"></i> Output <i class="pi pi-chevron-down"></i></summary><div class="menu-panel right">
        <label>Playblast camera <select data-role="playblast-camera"></select></label><label>H3 preset <select data-role="proxy-preset"><option value="balanced">Balanced</option><option value="parallax">Parallax</option><option value="subject">Subject</option><option value="debug">Debug</option></select></label><label>Encoder <select data-role="encoder"><option value="auto">WebCodecs</option><option value="realtime">Realtime fallback</option></select></label>
      </div></details>
      <span class="status" data-role="status">Ready</span>
    </div>
    <div class="viewport-wrap">
      <canvas tabindex="0"></canvas>
      <div class="viewport-actions"><button class="primary" data-act="record" title="Record proxy playblast"><i class="pi pi-video"></i> Playblast Record</button><button data-act="h3-setup" title="Create the H3 reference nodes"><i class="pi pi-bolt"></i> H3 Setup</button></div>
      <div class="view-nav"><i class="pi pi-eye"></i><select data-role="view-mode" title="Editor viewport view"><option value="camera">Camera</option><option value="perspective">Perspective</option><option value="top">Top</option><option value="right">Right</option><option value="left">Left</option><option value="bottom">Bottom</option></select><button data-act="toggle-camera-view" title="Show or hide camera preview strip"><i class="pi pi-video"></i></button></div>
      <div class="viewport-state" data-role="viewport-state"></div>
      <div class="hud" data-role="hud"></div>
      <div class="viewport-inspector">
        <div class="menu-title">Scene</div><div class="scene-tree" data-role="objects"></div>
        <div class="menu-title" data-role="selected-name">Camera</div>
        <div class="entity-panel" data-role="object-panel">
          <div class="transform-tools"><button data-transform-mode="translate" title="Translate (T)">T</button><button data-transform-mode="rotate" title="Rotate (R)">R</button><button data-transform-mode="scale" title="Scale (S)">S</button><select data-role="gizmo-space" title="Transform space"><option value="world">World</option><option value="local">Local</option></select></div>
          <div class="animation-row"><i class="pi pi-palette"></i><select data-role="object-material" title="Viewport material"><option value="textured">Textures</option><option value="checker">Checker</option><option value="neutral">Neutral</option><option value="wireframe">Wireframe</option></select></div>
          <div class="viewport-grid"><label><span>Translate X</span><input data-role="object-x" type="number" step="0.1"></label><label><span>Translate Y</span><input data-role="object-y" type="number" step="0.1"></label><label><span>Translate Z</span><input data-role="object-z" type="number" step="0.1"></label><label><span>Rotate X</span><input data-role="object-rx" type="number" step="1"></label><label><span>Rotate Y</span><input data-role="object-ry" type="number" step="1"></label><label><span>Rotate Z</span><input data-role="object-rz" type="number" step="1"></label><label><span>Scale X</span><input data-role="object-sx" type="number" min="0.01" step="0.1"></label><label><span>Scale Y</span><input data-role="object-sy" type="number" min="0.01" step="0.1"></label><label><span>Scale Z</span><input data-role="object-sz" type="number" min="0.01" step="0.1"></label></div>
          <div class="animation-row" data-role="animation-row" hidden><i class="pi pi-play-circle"></i><select data-role="animation-select" title="Animation clip"></select></div>
        </div>
        <div class="entity-panel viewport-grid" data-role="camera-panel" hidden><label><span>Position X</span><input data-role="camera-px" type="number" step="0.1"></label><label><span>Position Y</span><input data-role="camera-py" type="number" step="0.1"></label><label><span>Position Z</span><input data-role="camera-pz" type="number" step="0.1"></label><label><span>Target X</span><input data-role="camera-tx" type="number" step="0.1"></label><label><span>Target Y</span><input data-role="camera-ty" type="number" step="0.1"></label><label><span>Target Z</span><input data-role="camera-tz" type="number" step="0.1"></label><label><span>FOV</span><input data-role="camera-fov" type="number" min="5" max="150" step="0.1"></label><label><span>Roll</span><input data-role="camera-roll" type="number" min="-180" max="180" step="0.1"></label><label><span>Near Clip</span><input data-role="camera-near" type="number" min="0.0001" step="0.001"></label><label><span>Far Clip</span><input data-role="camera-far" type="number" min="0.0002" step="1"></label></div>
        <div class="animation-row"><i class="pi pi-images"></i><select data-role="reference-select" title="Upstream reference"><option value="0">Upstream 1</option></select></div>
      </div>
    </div>
    <div class="camera-view-row" data-role="camera-view-row"><div class="camera-preview-strip" data-role="camera-previews"></div><button class="camera-strip-close" data-act="toggle-camera-view" title="Hide camera previews"><i class="pi pi-times"></i></button></div>
    <div class="timeline">
      <div class="row timeline-toolbar">
        <button class="icon-button" data-act="play" title="Play / Stop (Space)" aria-label="Play timeline"><i class="pi pi-play"></i></button><button class="icon-button" data-act="key" title="Insert / Update Key (I)" aria-label="Insert or update key"><i class="pi pi-plus-circle"></i></button><button class="icon-button" data-act="auto-key" title="Auto Key off" aria-label="Toggle Auto Key" aria-pressed="false"><i class="pi pi-circle-fill"></i></button><button class="icon-button" data-act="delete-key" title="Delete Selected Key" aria-label="Delete selected key"><i class="pi pi-trash"></i></button><button class="icon-button" data-act="copy-key" title="Copy Key (Ctrl/Cmd+C)" aria-label="Copy selected key"><i class="pi pi-copy"></i></button><button class="icon-button" data-act="paste-key" title="Paste Key (Ctrl/Cmd+V)" aria-label="Paste key at playhead"><i class="pi pi-clipboard"></i></button><span class="toolbar-divider"></span>
        <button class="icon-button" data-act="previous-key" title="Previous keyframe (,)" aria-label="Previous keyframe"><i class="pi pi-fast-backward"></i></button><button class="icon-button" data-act="previous-frame" title="Previous frame (Left Arrow)" aria-label="Previous frame"><i class="pi pi-step-backward"></i></button>
        <strong>Frame</strong><input data-role="frame" type="number" min="0" value="0"><input data-role="scrub" type="range" min="0" max="119" value="0"><span data-role="time">00:00.000</span><label>Duration <input data-role="duration-seconds" type="number" min="0.25" max="120" step="0.25" value="5"></label><label>FPS <input data-role="timeline-fps" type="number" min="1" max="120" step="1" value="24"></label>
        <button class="icon-button" data-act="next-frame" title="Next frame (Right Arrow)" aria-label="Next frame"><i class="pi pi-step-forward"></i></button><button class="icon-button" data-act="next-key" title="Next keyframe (.)" aria-label="Next keyframe"><i class="pi pi-fast-forward"></i></button>
        <span class="timeline-summary" data-role="timeline-summary">1 key</span>
      </div>
      <div class="keys" data-role="keys" tabindex="0" aria-label="Camera keyframe timeline"></div>
      <details class="curve-editor" open><summary><i class="pi pi-chart-line"></i><strong data-role="curve-title">Camera Curve Editor</strong><span class="hint">drag points to edit values</span></summary><div class="curve-toolbar"><select data-role="curve-group"><option value="position">Position XYZ</option><option value="target">Target XYZ</option><option value="lens">FOV / Roll / Zoom</option></select><button class="curve-mode" data-curve-mode="linear">Linear</button><button class="curve-mode" data-curve-mode="smooth">Smooth</button><button class="curve-mode" data-curve-mode="bezier">Bezier</button><button class="curve-mode" data-curve-mode="ease_in">Ease In</button><button class="curve-mode" data-curve-mode="ease_out">Ease Out</button><button class="curve-mode" data-curve-mode="ease">Ease In/Out</button></div><canvas class="curve-canvas" data-role="curve-canvas"></canvas></details>
      <details class="compact-panel key-editor" data-role="key-editor" data-empty="false" open><summary><i class="pi pi-key"></i><strong data-role="selected-key-label">Key @ 0</strong><span class="hint">yellow selected · red editing</span></summary><div class="panel-body">
        <div class="key-editor-header"><button class="icon-button" data-act="update-key" title="Update key from current view" aria-label="Update key from current view"><i class="pi pi-refresh"></i></button><button class="icon-button" data-act="view-key" title="Load key view" aria-label="Load selected key view"><i class="pi pi-eye"></i></button><span class="hint">A selected key accepts one canvas edit. Auto Key records every camera edit at the playhead.</span></div>
        <div class="key-editor-grid">
          <label>Frame <input data-role="key-frame" type="number" min="0" value="0"></label>
          <label>Interpolation <select data-role="key-interp"><option value="ease">Ease</option><option value="smooth">Smooth</option><option value="bezier">Bezier</option><option value="linear">Linear</option><option value="ease_in">Ease In</option><option value="ease_out">Ease Out</option></select></label>
          <label>Pos X <input data-role="key-px" type="number" step="0.1"></label><label>Pos Y <input data-role="key-py" type="number" step="0.1"></label><label>Pos Z <input data-role="key-pz" type="number" step="0.1"></label>
          <label>Target X <input data-role="key-tx" type="number" step="0.1"></label><label>Target Y <input data-role="key-ty" type="number" step="0.1"></label><label>Target Z <input data-role="key-tz" type="number" step="0.1"></label>
          <label>FOV <input data-role="key-fov" type="number" min="5" max="150" step="0.1"></label><label>Roll <input data-role="key-roll" type="number" min="-180" max="180" step="0.1"></label><label>Zoom <input data-role="key-zoom" type="number" min="0.01" step="0.05"></label><label>Near Clip <input data-role="key-near" type="number" min="0.0001" step="0.001"></label><label>Far Clip <input data-role="key-far" type="number" min="0.0002" step="1"></label>
          <label>Camera <select data-role="key-camera-type"><option value="perspective">Perspective</option><option value="orthographic">Orthographic</option></select></label>
        </div></div></details>
    </div>
    <details class="help"><summary>OmniCam help</summary><p>Compose a frame, press <b>I</b>, scrub, move the camera and press <b>I</b> again. Space previews the move; Playblast records the neutral motion reference.</p><p>The proxy communicates camera motion, not final appearance. Use H3 Setup for Omni Reference, Wan Native Camera for core Plücker conditioning, or the pinned ATI/LTX adapters for their supported workflows.</p></details>`;
  return root;
}

class OmniCamDirectorUI {
  constructor(node) {
    this.node = node;
    this.root = buildRoot();
    this.root.tabIndex = -1;
    this.canvas = this.root.querySelector(".viewport-wrap > canvas");
    this.cameraPreviewCanvases = new Map();
    this.cameraPreviewContexts = new Map();
    this.cameraPreviewSignature = "";
    this.interactionElement = this.root.querySelector(".viewport-wrap");
    this.interactionElement.tabIndex = -1;
    this.interactionElement.dataset.captureWheel = "true";
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    try { this.webgl = new OmniWebGLViewport(() => this.render(), (model) => this.onModelLoaded(model)); } catch (error) { console.warn("OmniCam WebGL unavailable; using Canvas fallback", error); this.webgl = null; }
    try { this.cameraWebgl = new OmniWebGLViewport(() => this.renderCameraView(), () => {}); } catch (error) { console.warn("OmniCam Camera View unavailable", error); this.cameraWebgl = null; }
    this.stateWidget = node.widgets?.find((w) => w.name === "state_json");
    this.recordingWidget = node.widgets?.find((w) => w.name === "recording_path");
    this.cardWidget = node.widgets?.find((w) => w.name === "card_asset");
    this.widthWidget = node.widgets?.find((w) => w.name === "width");
    this.heightWidget = node.widgets?.find((w) => w.name === "height");
    this.fpsWidget = node.widgets?.find((w) => w.name === "fps");
    this.durationWidget = node.widgets?.find((w) => w.name === "duration_seconds");
    this.modeWidget = node.widgets?.find((w) => w.name === "render_mode");

    let parsed = null;
    try { parsed = JSON.parse(this.stateWidget?.value || "{}"); } catch (_) {}
    this.state = sanitizeState(parsed);
    this.frame = 0;
    this.camera = sampleCamera(this.state, 0);
    this.playing = false;
    this.drag = null;
    this.cameraEditActive = false;
    this.cameraEditKey = null;
    this.keyDrag = null;
    this.timelineDrag = null;
    this.curveDrag = null;
    this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null;
    this.editingKeyFrame = null;
    this.copiedKeyframe = null;
    this.cameraSpeed = 1;
    this.cardMedia = null;
    this.cardMediaById = new Map();
    this.cardUrlsById = new Map();
    this.modelUrlsById = new Map();
    this.modelInfoById = new Map();
    this.executionReferences = [];
    this.selectedObjectId = "subject";
    this.selectedEntity = "camera";
    this.cardUrl = null;
    this.recording = false;
    this.gizmoDrag = null;
    this.playTimer = null;
    this.previewClickTimer = null;

    this.refreshCameraPreviews();
    this.bind();
    this.bindWidgetCallbacks();
    this.syncFromWidgets();
    this.resizeCanvas();
    this.render();
    this.refreshKeys();
    this.refreshObjects();
    this.restoreAssets();
  }

  hideInternalWidgets() {
    for (const name of ["state_json", "recording_path", "card_asset"]) {
      const w = this.node.widgets?.find((x) => x.name === name);
      if (!w) continue;
      w.computeSize = () => [0, -4];
      w.draw = () => {};
      w.hidden = true;
      w.options = { ...(w.options || {}), hideInVueNodes: true };
    }
  }

  restoreFromWidgets() {
    let parsed = null;
    try { parsed = JSON.parse(this.stateWidget?.value || "{}"); } catch (_) {}
    const previousIds = new Set(this.state.objects.map((object) => object.id));
    this.state = sanitizeState(parsed);
    const nextIds = new Set(this.state.objects.map((object) => object.id));
    for (const id of previousIds) if (!nextIds.has(id)) this.removeObjectResources(id);
    if (!this.timelineKeyframes().some((key) => key.frame === this.selectedKeyFrame)) this.selectedKeyFrame = this.timelineKeyframes()[0]?.frame ?? null;
    this.camera = sampleCamera(this.state, Math.min(this.frame, this.state.duration_frames - 1));
    this.syncFromWidgets(false);
    this.root.querySelector('[data-role="gizmo-space"]').value = this.state.gizmo_space;
    this.restoreAssets();
    this.refreshKeys(); this.refreshObjects(); this.render();
  }

  bind() {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    const q = (sel) => this.root.querySelector(sel);
    q('[data-act="play"]').addEventListener("click", () => this.togglePlay(), { signal });
    q('[data-act="key"]').addEventListener("click", () => this.insertKeyframe(), { signal });
    q('[data-act="auto-key"]').addEventListener("click", () => this.toggleAutoKey(), { signal });
    q('[data-act="delete-key"]').addEventListener("click", () => this.deleteKeyframe(), { signal });
    q('[data-act="copy-key"]').addEventListener("click", () => this.copyKeyframe(), { signal });
    q('[data-act="paste-key"]').addEventListener("click", () => this.pasteKeyframe(), { signal });
    q('[data-act="previous-key"]').addEventListener("click", () => this.goToAdjacentKey(-1), { signal });
    q('[data-act="next-key"]').addEventListener("click", () => this.goToAdjacentKey(1), { signal });
    q('[data-act="previous-frame"]').addEventListener("click", () => this.setFrame(this.frame - 1), { signal });
    q('[data-act="next-frame"]').addEventListener("click", () => this.setFrame(this.frame + 1), { signal });
    q('[data-act="update-key"]').addEventListener("click", () => this.updateKeyFromView(), { signal });
    q('[data-act="view-key"]').addEventListener("click", () => this.loadSelectedKeyView(), { signal });
    q('[data-act="reset-camera"]').addEventListener("click", () => this.resetCamera(), { signal });
    q('[data-act="add-camera"]').addEventListener("click", () => { this.addCamera(); this.closeMenus(); }, { signal });
    q('[data-act="record"]').addEventListener("click", () => this.makePlayblast(), { signal });
    q('[data-act="h3-setup"]').addEventListener("click", () => this.createH3Setup(), { signal });
    q('[data-act="load-card"]').addEventListener("click", () => q('[data-role="file"]').click(), { signal });
    q('[data-act="add-card"]').addEventListener("click", () => this.addMediaCard(), { signal });
    q('[data-role="file"]').addEventListener("change", (e) => this.loadCardFile(e.target.files?.[0]), { signal });
    q('[data-act="load-model"]').addEventListener("click", () => { this.closeMenus(); q('[data-role="model-file"]').click(); }, { signal });
    q('[data-role="model-file"]').addEventListener("change", (e) => { this.loadModelFile(e.target.files?.[0]); e.target.value = ""; }, { signal });
    for (const button of this.root.querySelectorAll("[data-object-type]")) button.addEventListener("click", () => { this.addPrimitive(button.dataset.objectType); this.closeMenus(); }, { signal });
    q('[data-role="mode"]').addEventListener("change", (e) => { this.state.render_mode = e.target.value; if (this.modeWidget) this.modeWidget.value = e.target.value; this.serialize(); this.render(); }, { signal });
    q('[data-role="frame"]').addEventListener("change", (e) => this.setFrame(Number(e.target.value)), { signal });
    q('[data-role="scrub"]').addEventListener("input", (e) => this.setFrame(Number(e.target.value)), { signal });
    q('[data-role="fov"]').addEventListener("change", (e) => { this.camera.fov = clamp(Number(e.target.value), 5, 150); this.beginCameraEdit(); this.commitCameraEdit(); this.finishCameraEdit(); }, { signal });
    q('[data-role="roll"]').addEventListener("change", (e) => { this.camera.roll = clamp(Number(e.target.value), -180, 180); this.beginCameraEdit(); this.commitCameraEdit(); this.finishCameraEdit(); }, { signal });
    q('[data-role="speed"]').addEventListener("change", (e) => { this.cameraSpeed = clamp(Number(e.target.value), 0.05, 5); e.target.value = String(this.cameraSpeed); }, { signal });
    q('[data-role="camera-type"]').addEventListener("change", (e) => { this.camera.camera_type = e.target.value; this.beginCameraEdit(); this.commitCameraEdit(); this.finishCameraEdit(); }, { signal });
    q('[data-role="guides"]').addEventListener("change", (e) => { this.state.guides = e.target.checked; this.serialize(); this.render(); }, { signal });
    q('[data-role="playblast-grid"]').addEventListener("change", (e) => { this.state.playblast_grid = e.target.checked; this.serialize(); this.render(); }, { signal });
    q('[data-role="burn-in"]').addEventListener("change", (e) => { this.state.burn_in = e.target.checked; this.serialize(); this.render(); }, { signal });
    q('[data-role="speed-heatmap"]').addEventListener("change", (e) => { this.state.speed_heatmap = e.target.checked; this.serialize(); this.render(); }, { signal });
    q('[data-role="card-fit"]').addEventListener("change", (e) => { this.state.card_fit = e.target.value; this.serialize(); this.render(); }, { signal });
    q('[data-role="proxy-preset"]').addEventListener("change", (e) => this.applyProxyPreset(e.target.value), { signal });
    q('[data-role="playblast-camera"]').addEventListener("change", (e) => this.setPlayblastCamera(e.target.value), { signal });
    for (const button of this.root.querySelectorAll("[data-transform-mode]")) button.addEventListener("click", () => this.setTransformMode(button.dataset.transformMode), { signal });
    q('[data-role="gizmo-space"]').addEventListener("change", (e) => { this.state.gizmo_space = e.target.value; this.serialize(); this.render(); }, { signal });
    q('[data-role="view-mode"]').addEventListener("change", (e) => this.setViewMode(e.target.value), { signal });
    for (const button of this.root.querySelectorAll('[data-act="toggle-camera-view"]')) button.addEventListener("click", () => this.toggleCameraView(), { signal });
    q('[data-role="object-material"]').addEventListener("change", (e) => { const object = this.selectedObject(); if (!object) return; object.material_mode = e.target.value; this.serialize(); this.render(); }, { signal });
    q('[data-role="reference-select"]').addEventListener("change", (e) => { this.state.reference_index = Number(e.target.value); this.serialize(); this.loadSelectedReference(); }, { signal });
    for (const role of ["object-x", "object-y", "object-z", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz"]) q(`[data-role="${role}"]`).addEventListener("change", () => this.updateSelectedObject(), { signal });
    for (const role of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"]) q(`[data-role="${role}"]`).addEventListener("change", () => this.updateCameraFromHud(), { signal });
    q('[data-role="animation-select"]').addEventListener("change", (event) => this.selectObjectAnimation(Number(event.target.value)), { signal });
    q('[data-role="duration-seconds"]').addEventListener("change", (event) => { if (this.durationWidget) this.durationWidget.value = Number(event.target.value); this.syncFromWidgets(); }, { signal });
    q('[data-role="timeline-fps"]').addEventListener("change", (event) => { if (this.fpsWidget) this.fpsWidget.value = Number(event.target.value); this.syncFromWidgets(); }, { signal });
    q('[data-role="curve-group"]').addEventListener("change", () => this.drawCurveEditor(), { signal });
    for (const button of this.root.querySelectorAll("[data-curve-mode]")) button.addEventListener("click", () => this.setCurveInterpolation(button.dataset.curveMode), { signal });
    const curve = q('[data-role="curve-canvas"]');
    curve.addEventListener("pointerdown", (event) => this.onCurvePointerDown(event), { signal });
    curve.addEventListener("pointermove", (event) => this.onCurvePointerMove(event), { signal });
    curve.addEventListener("pointerup", (event) => this.onCurvePointerUp(event), { signal });
    curve.addEventListener("pointercancel", (event) => this.onCurvePointerUp(event), { signal });
    q('[data-role="key-frame"]').addEventListener("change", (event) => this.retimeSelectedKey(Number(event.target.value)), { signal });
    for (const role of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"]) q(`[data-role="${role}"]`).addEventListener("change", () => this.updateSelectedKey(), { signal });
    for (const menu of this.root.querySelectorAll(".toolbar-menu")) menu.addEventListener("toggle", () => { if (menu.open) this.closeMenus(menu); }, { signal });

    this.root.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      const target = event.composedPath?.()[0] || event.target;
      if (target instanceof HTMLElement && !target.closest(".toolbar-menu")) this.closeMenus();
      if (target instanceof HTMLElement && !target.closest(".key,.key-editor,canvas")) this.exitKeyEdit(true);
      if (!(target instanceof HTMLElement) || !target.closest("input,select,textarea,button,[contenteditable=true]")) this.root.focus({ preventScroll: true });
    }, { signal });
    document.addEventListener("pointerdown", (event) => {
      const target = event.composedPath?.()[0] || event.target;
      if (!(target instanceof Node) || !this.root.contains(target)) { this.closeMenus(); this.exitKeyEdit(true); }
    }, { capture: true, signal });
    this.root.addEventListener("mousedown", (event) => event.stopPropagation(), { signal });
    this.interactionElement.addEventListener("contextmenu", (event) => { event.preventDefault(); event.stopPropagation(); }, { signal });
    this.interactionElement.addEventListener("pointerdown", (event) => this.onPointerDown(event), { signal });
    this.interactionElement.addEventListener("pointermove", (event) => this.onPointerMove(event), { signal });
    this.interactionElement.addEventListener("pointerup", (event) => this.onPointerUp(event), { signal });
    this.interactionElement.addEventListener("pointercancel", (event) => this.onPointerUp(event), { signal });
    this.interactionElement.addEventListener("wheel", (event) => this.onWheel(event), { passive: false, signal });
    window.addEventListener("pointermove", (event) => { if (this.keyDrag) this.onPointerMove(event); }, { capture: true, signal });
    window.addEventListener("pointerup", (event) => { if (this.keyDrag) this.onPointerUp(event); }, { capture: true, signal });
    const timeline = q('[data-role="keys"]');
    timeline.addEventListener("pointerdown", (event) => this.onTimelinePointerDown(event), { signal });
    timeline.addEventListener("pointermove", (event) => this.onTimelinePointerMove(event), { signal });
    timeline.addEventListener("pointerup", (event) => this.onTimelinePointerUp(event), { signal });
    timeline.addEventListener("pointercancel", (event) => this.onTimelinePointerUp(event), { signal });
    this.root.addEventListener("keydown", (event) => this.onKey(event), { signal });

    const ro = new ResizeObserver(() => { this.resizeCanvas(); this.render(); });
    ro.observe(this.root.querySelector(".viewport-wrap"));
    ro.observe(this.root.querySelector('[data-role="camera-previews"]'));
    this.resizeObserver = ro;
    this.updateEditState();
  }

  bindWidgetCallbacks() {
    for (const widget of [this.widthWidget, this.heightWidget, this.fpsWidget, this.durationWidget, this.modeWidget]) {
      if (!widget || widget.__omnicamCallback) continue;
      const original = widget.callback;
      widget.callback = (...args) => { const result = original?.apply(widget, args); this.syncFromWidgets(); return result; };
      widget.__omnicamCallback = true;
    }
  }

  syncFromWidgets(persist = true) {
    const previousDuration = this.state.duration_frames;
    const previousFps = this.state.fps;
    this.state.width = Number(this.widthWidget?.value || this.state.width);
    this.state.height = Number(this.heightWidget?.value || this.state.height);
    this.state.fps = Number(this.fpsWidget?.value || this.state.fps);
    this.state.duration_frames = Math.max(1, Math.round(Number(this.durationWidget?.value || 5) * this.state.fps));
    for (const camera of this.state.cameras) {
      for (const key of camera.keyframes) key.frame = clamp(Math.round(key.frame), 0, this.state.duration_frames - 1);
      camera.keyframes = [...new Map(camera.keyframes.map((key) => [key.frame, key])).values()].sort((a, b) => a.frame - b.frame);
    }
    this.state.keyframes = this.activeCameraTrack().keyframes;
    for (const object of this.state.objects) object.keyframes = [...new Map((object.keyframes || []).map((key) => [clamp(Math.round(key.frame), 0, this.state.duration_frames - 1), { ...key, frame: clamp(Math.round(key.frame), 0, this.state.duration_frames - 1) }])).values()].sort((a, b) => a.frame - b.frame);
    if (!this.timelineKeyframes().some((key) => key.frame === this.selectedKeyFrame)) this.selectedKeyFrame = this.timelineKeyframes()[0]?.frame ?? null;
    this.state.render_mode = this.modeWidget?.value || this.state.render_mode;
    this.root.querySelector('[data-role="mode"]').value = this.state.render_mode;
    this.root.querySelector('[data-role="guides"]').checked = this.state.guides !== false;
    this.root.querySelector('[data-role="playblast-grid"]').checked = Boolean(this.state.playblast_grid);
    this.root.querySelector('[data-role="burn-in"]').checked = Boolean(this.state.burn_in);
    this.root.querySelector('[data-role="speed-heatmap"]').checked = Boolean(this.state.speed_heatmap);
    this.root.querySelector('[data-role="card-fit"]').value = this.state.card_fit || "contain";
    this.root.querySelector('[data-role="gizmo-space"]').value = this.state.gizmo_space || "world";
    this.root.querySelector('[data-role="view-mode"]').value = this.state.view_mode || "camera";
    this.root.querySelector('[data-role="camera-view-row"]').hidden = !this.state.camera_view_visible;
    this.root.querySelector('.view-nav [data-act="toggle-camera-view"]')?.classList.toggle("active", this.state.camera_view_visible);
    this.refreshCameraSelectors();
    const scrub = this.root.querySelector('[data-role="scrub"]');
    scrub.max = String(this.state.duration_frames - 1);
    this.root.querySelector('[data-role="frame"]').max = String(this.state.duration_frames - 1);
    this.root.querySelector('[data-role="key-frame"]').max = String(this.state.duration_frames - 1);
    this.root.querySelector('[data-role="duration-seconds"]').value = String(this.state.duration_frames / this.state.fps);
    this.root.querySelector('[data-role="timeline-fps"]').value = String(this.state.fps);
    this.frame = clamp(this.frame, 0, this.state.duration_frames - 1);
    if (persist) this.serialize();
    if (previousDuration !== this.state.duration_frames || previousFps !== this.state.fps) {
      this.setFrame(this.frame, false, true);
      this.setStatus(`Timeline: ${this.state.duration_frames} frames · ${(this.state.duration_frames / this.state.fps).toFixed(2)} s`);
    }
  }

  serialize() {
    this.syncActiveCameraTrack();
    const playblastCamera = this.playblastCameraTrack();
    this.state.metadata = { ...this.state.metadata, playblast_camera_id: playblastCamera.id, playblast_camera_name: playblastCamera.name };
    const payload = { ...this.state, camera: cloneCamera(playblastCamera.camera), keyframes: playblastCamera.keyframes };
    if (this.stateWidget) this.stateWidget.value = JSON.stringify(payload);
    if (this.widthWidget) this.widthWidget.value = this.state.width;
    if (this.heightWidget) this.heightWidget.value = this.state.height;
    if (this.fpsWidget) this.fpsWidget.value = this.state.fps;
    if (this.durationWidget) this.durationWidget.value = this.state.duration_frames / this.state.fps;
    if (this.modeWidget) this.modeWidget.value = this.state.render_mode;
    if (this.cardWidget) this.cardWidget.value = this.state.card_asset || "";
    this.node.graph?.setDirtyCanvas?.(true, true);
  }

  activeCameraTrack() { return this.state.cameras.find((item) => item.id === this.state.active_camera_id) || this.state.cameras[0]; }

  playblastCameraTrack() { return this.state.cameras.find((item) => item.id === this.state.playblast_camera_id) || this.activeCameraTrack(); }

  syncActiveCameraTrack() {
    const active = this.activeCameraTrack();
    active.camera = cloneCamera(this.camera);
    active.keyframes = this.state.keyframes;
    this.state.camera = cloneCamera(this.camera);
  }

  refreshCameraSelectors() {
    for (const role of ["playblast-camera"]) {
      const select = this.root.querySelector(`[data-role="${role}"]`);
      if (!select) continue;
      select.innerHTML = "";
      for (const camera of this.state.cameras) {
        const option = document.createElement("option"); option.value = camera.id; option.textContent = camera.name; select.appendChild(option);
      }
      select.value = this.state.playblast_camera_id;
    }
    this.refreshCameraPreviews();
  }

  refreshCameraPreviews() {
    const strip = this.root.querySelector('[data-role="camera-previews"]');
    if (!strip) return;
    const signature = this.state.cameras.map((camera) => `${camera.id}:${camera.name}`).join("|");
    let rebuilt = false;
    if (signature !== this.cameraPreviewSignature) {
      rebuilt = true;
      this.cameraPreviewSignature = signature;
      strip.innerHTML = ""; this.cameraPreviewCanvases.clear(); this.cameraPreviewContexts.clear();
      this.state.cameras.forEach((camera, index) => {
        const tile = document.createElement("div"); tile.className = "camera-preview-tile"; tile.dataset.cameraId = camera.id; tile.style.setProperty("--camera-color", `hsl(${index * 115 % 360} 75% 52%)`); tile.title = `Click: export ${camera.name} · Double-click: edit ${camera.name}`;
        const header = document.createElement("div"); header.className = "camera-preview-head";
        const icon = document.createElement("i"); icon.className = "pi pi-video";
        const label = document.createElement("span"); label.textContent = camera.name;
        const frame = document.createElement("span"); frame.dataset.cameraFrame = camera.id; frame.textContent = `F${this.frame}`;
        const output = document.createElement("i"); output.className = "pi pi-circle-fill output-mark"; output.title = "Playblast camera";
        const canvas = document.createElement("canvas"); canvas.dataset.cameraPreview = camera.id;
        const badge = document.createElement("span"); badge.className = "camera-view-badge"; badge.textContent = "CAMERA PREVIEW";
        header.append(icon, label, frame, output); tile.append(canvas, header, badge); strip.appendChild(tile);
        tile.addEventListener("click", () => { clearTimeout(this.previewClickTimer); this.previewClickTimer = setTimeout(() => this.setPlayblastCamera(camera.id), 220); });
        tile.addEventListener("dblclick", () => { clearTimeout(this.previewClickTimer); this.previewClickTimer = null; this.activateCamera(camera.id); });
        this.cameraPreviewCanvases.set(camera.id, canvas); this.cameraPreviewContexts.set(camera.id, canvas.getContext("2d", { alpha: false }));
      });
    }
    for (const tile of strip.querySelectorAll(".camera-preview-tile")) tile.classList.toggle("playblast", tile.dataset.cameraId === this.state.playblast_camera_id);
    for (const marker of strip.querySelectorAll(".output-mark")) marker.hidden = marker.closest(".camera-preview-tile")?.dataset.cameraId !== this.state.playblast_camera_id;
    if (rebuilt) requestAnimationFrame(() => { if (!this.root.isConnected) return; this.resizeCanvas(); this.renderCameraView(); });
  }

  addCamera() {
    this.syncActiveCameraTrack();
    const id = `camera_${Date.now().toString(36)}`;
    const name = `Camera ${this.state.cameras.length + 1}`;
    const camera = cloneCamera(this.camera);
    this.state.cameras.push({ id, name, camera, keyframes: [{ frame: 0, camera: cloneCamera(camera), interpolation: this.root.querySelector('[data-role="interp"]').value }] });
    this.activateCamera(id);
    this.setStatus(`${name} added`);
  }

  activateCamera(id) {
    const camera = this.state.cameras.find((item) => item.id === id);
    if (!camera) return;
    this.syncActiveCameraTrack();
    this.state.active_camera_id = camera.id;
    this.state.keyframes = camera.keyframes;
    this.state.camera = cloneCamera(camera.camera);
    this.camera = sampleCamera(camera, this.frame);
    this.selectedEntity = "camera";
    this.selectedKeyFrame = camera.keyframes.find((key) => key.frame === this.frame)?.frame ?? null;
    this.editingKeyFrame = null;
    this.serialize(); this.refreshObjects(); this.refreshKeys(); this.render();
    this.setStatus(`Editing ${camera.name}`);
  }

  setPlayblastCamera(id) {
    const camera = this.state.cameras.find((item) => item.id === id);
    if (!camera) return;
    this.state.playblast_camera_id = camera.id;
    this.refreshCameraSelectors();
    this.serialize(); this.refreshObjects(); this.refreshKeys(); this.renderCameraView();
    this.setStatus(`Playblast: ${camera.name}`);
  }

  closeMenus(except = null) {
    for (const menu of this.root.querySelectorAll(".toolbar-menu")) if (menu !== except) menu.open = false;
  }

  resizeCanvas() {
    const wrap = this.root.querySelector(".viewport-wrap");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(320, Math.round(wrap.clientWidth * dpr));
    const h = Math.max(180, Math.round(wrap.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    for (const canvas of this.cameraPreviewCanvases.values()) {
      const previewWidth = Math.max(220, Math.round(canvas.clientWidth * dpr)), previewHeight = Math.max(140, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== previewWidth || canvas.height !== previewHeight) { canvas.width = previewWidth; canvas.height = previewHeight; }
    }
    this.drawCurveEditor();
  }

  setFrame(frame, fromPlayback = false, refreshTimeline = true) {
    this.frame = clamp(Math.round(frame), 0, this.state.duration_frames - 1);
    if (this.editingKeyFrame !== this.frame) this.editingKeyFrame = null;
    this.camera = sampleCamera(this.state, this.frame);
    this.applyObjectAnimationFrame();
    this.root.querySelector('[data-role="frame"]').value = String(this.frame);
    this.root.querySelector('[data-role="scrub"]').value = String(this.frame);
    this.root.querySelector('[data-role="fov"]').value = String(Math.round(this.camera.fov * 100) / 100);
    this.root.querySelector('[data-role="roll"]').value = String(Math.round((this.camera.roll || 0) * 100) / 100);
    this.root.querySelector('[data-role="camera-type"]').value = this.camera.camera_type;
    const sec = this.frame / this.state.fps;
    for (const media of this.cardMediaById.values()) if (media instanceof HTMLVideoElement && Number.isFinite(media.duration) && media.duration > 0) media.currentTime = sec % media.duration;
    const minutes = Math.floor(sec / 60), seconds = Math.floor(sec % 60), milliseconds = Math.floor((sec % 1) * 1000);
    this.root.querySelector('[data-role="time"]').textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
    if (refreshTimeline) this.refreshKeys();
    else {
      const lastFrame = Math.max(1, this.state.duration_frames - 1);
      const playhead = this.root.querySelector('[data-role="keys"] .playhead'); if (playhead) playhead.style.left = `${100 * this.frame / lastFrame}%`;
      for (const element of this.root.querySelectorAll('[data-key-frame]')) {
        const keyFrame = Number(element.dataset.keyFrame); element.classList.toggle("at-playhead", keyFrame === this.frame); element.classList.toggle("selected", keyFrame === this.selectedKeyFrame); element.classList.toggle("editing", keyFrame === this.editingKeyFrame);
      }
      this.refreshKeyEditor();
      this.drawCurveEditor();
    }
    if (!fromPlayback) this.serialize();
    this.refreshInspector();
    this.render();
  }

  timelineObject() { return this.selectedEntity === "object" ? this.selectedObject() : null; }

  timelineKeyframes() { return this.timelineObject()?.keyframes || this.state.keyframes; }

  applyObjectAnimationFrame() {
    for (const object of this.state.objects) {
      if (!object.keyframes?.length) continue;
      const transform = sampleObjectTransform(object, this.frame);
      object.position = transform.position; object.rotation = transform.rotation; object.size = transform.size;
    }
  }

  insertKeyframe() {
    const interpolation = this.root.querySelector('[data-role="interp"]').value;
    const object = this.timelineObject(), keys = this.timelineKeyframes();
    const k = object ? { frame: this.frame, transform: cloneTransform(object), interpolation } : { frame: this.frame, camera: cloneCamera(this.camera), interpolation };
    const idx = keys.findIndex((x) => x.frame === this.frame);
    if (idx >= 0) keys[idx] = k; else keys.push(k);
    keys.sort((a, b) => a.frame - b.frame);
    this.selectedKeyFrame = this.frame;
    this.editingKeyFrame = null;
    this.serialize(); this.refreshKeys(); this.setStatus(`${object?.name || "Camera"} ${idx >= 0 ? "key updated" : "key inserted"} @ ${this.frame}`);
  }

  deleteKeyframe() {
    const object = this.timelineObject(), keys = this.timelineKeyframes();
    if (!object && keys.length <= 1) return this.setStatus("Keep at least one camera keyframe");
    const key = this.selectedKeyframe() || keys.find((item) => item.frame === this.frame);
    if (!key) return this.setStatus("Select a keyframe to delete");
    if (object) object.keyframes = keys.filter((item) => item !== key); else this.state.keyframes = keys.filter((item) => item !== key);
    const remaining = this.timelineKeyframes();
    const deletedFrame = key.frame;
    if (this.editingKeyFrame === deletedFrame) this.editingKeyFrame = null;
    this.selectedKeyFrame = remaining.length ? remaining.reduce((nearest, item) => Math.abs(item.frame - deletedFrame) < Math.abs(nearest.frame - deletedFrame) ? item : nearest).frame : null;
    this.camera = sampleCamera(this.state, this.frame);
    this.applyObjectAnimationFrame(); this.serialize(); this.refreshKeys(); this.render(); this.setStatus(`${object?.name || "Camera"} key deleted @ ${deletedFrame}`);
  }

  copyKeyframe() {
    const object = this.timelineObject(), key = this.selectedKeyframe() || this.timelineKeyframes().find((item) => item.frame === this.frame);
    this.copiedKeyframe = object ? { kind: "object", transform: cloneTransform(key?.transform || object), interpolation: key?.interpolation || this.root.querySelector('[data-role="interp"]').value } : { kind: "camera", camera: cloneCamera(key?.camera || this.camera), interpolation: key?.interpolation || this.root.querySelector('[data-role="interp"]').value };
    this.setStatus(`Keyframe copied @ ${key?.frame ?? this.frame}`);
  }

  pasteKeyframe() {
    if (!this.copiedKeyframe) return this.setStatus("Copy a keyframe first");
    const object = this.timelineObject(), kind = object ? "object" : "camera";
    if (this.copiedKeyframe.kind !== kind) return this.setStatus(`Copy a ${kind} keyframe first`);
    const pasted = object ? { frame: this.frame, transform: cloneTransform(this.copiedKeyframe.transform), interpolation: this.copiedKeyframe.interpolation } : { frame: this.frame, camera: cloneCamera(this.copiedKeyframe.camera), interpolation: this.copiedKeyframe.interpolation };
    const keys = this.timelineKeyframes(), index = keys.findIndex((item) => item.frame === this.frame);
    if (index >= 0) keys[index] = pasted; else keys.push(pasted);
    keys.sort((a, b) => a.frame - b.frame);
    this.selectedKeyFrame = pasted.frame;
    this.editingKeyFrame = null;
    if (object) { object.position = [...pasted.transform.position]; object.rotation = [...pasted.transform.rotation]; object.size = [...pasted.transform.size]; } else this.camera = cloneCamera(pasted.camera);
    this.serialize(); this.refreshKeys(); this.render(); this.setStatus(`Keyframe pasted @ ${this.frame}`);
  }

  resetCamera() {
    this.camera = defaultCamera();
    this.root.querySelector('[data-role="fov"]').value = String(this.camera.fov);
    this.root.querySelector('[data-role="roll"]').value = String(this.camera.roll);
    this.root.querySelector('[data-role="camera-type"]').value = this.camera.camera_type;
    this.beginCameraEdit(); this.commitCameraEdit(); this.finishCameraEdit(); this.setStatus("Camera reset");
  }

  selectedKeyframe() { return this.timelineKeyframes().find((key) => key.frame === this.selectedKeyFrame) || null; }

  selectKeyframe(key) {
    if (!key) return;
    this.selectedKeyFrame = key.frame;
    this.editingKeyFrame = null;
    this.setFrame(key.frame);
  }

  beginCameraEdit() {
    let key = this.state.auto_key ? this.state.keyframes.find((item) => item.frame === this.frame) : this.selectedEntity === "camera" ? this.state.keyframes.find((item) => item.frame === this.selectedKeyFrame) : null;
    if (!key && this.state.auto_key) {
      key = { frame: this.frame, camera: cloneCamera(this.camera), interpolation: this.root.querySelector('[data-role="interp"]').value };
      this.state.keyframes.push(key);
      this.state.keyframes.sort((a, b) => a.frame - b.frame);
      this.refreshKeys();
    }
    this.cameraEditKey = key || null;
    if (!key) return null;
    if (this.selectedEntity === "camera") { this.selectedKeyFrame = key.frame; this.editingKeyFrame = key.frame; }
    this.cameraEditActive = true;
    this.updateKeyVisualState();
    return key;
  }

  commitCameraEdit() {
    const key = this.cameraEditKey;
    if (key) {
      key.camera = cloneCamera(this.camera);
      this.frame = key.frame;
    }
    this.serialize(); this.refreshKeyEditor(); this.updateKeyVisualState(); this.render();
  }

  finishCameraEdit() {
    if (!this.cameraEditActive) return;
    this.cameraEditActive = false;
    this.cameraEditKey = null;
    this.editingKeyFrame = null;
    this.selectedKeyFrame = null;
    this.refreshKeys();
  }

  exitKeyEdit(clearSelection = false) {
    if (this.editingKeyFrame === null && (!clearSelection || this.selectedKeyFrame === null)) return;
    this.cameraEditActive = false;
    this.cameraEditKey = null;
    this.editingKeyFrame = null;
    if (clearSelection) this.selectedKeyFrame = null;
    this.refreshKeys();
  }

  toggleAutoKey() {
    this.state.auto_key = !this.state.auto_key;
    if (!this.state.auto_key) this.exitKeyEdit(false);
    this.serialize(); this.updateEditState();
    this.setStatus(`Auto Key ${this.state.auto_key ? "on" : "off"}`);
  }

  updateEditState() {
    const wrap = this.root.querySelector(".viewport-wrap");
    const editing = this.editingKeyFrame !== null;
    wrap.classList.toggle("edit-mode", editing);
    wrap.classList.toggle("auto-key", this.state.auto_key);
    const button = this.root.querySelector('[data-act="auto-key"]');
    button.classList.toggle("active", this.state.auto_key);
    button.setAttribute("aria-pressed", String(this.state.auto_key));
    button.title = `Auto Key ${this.state.auto_key ? "on" : "off"}`;
    this.root.querySelector('[data-role="viewport-state"]').textContent = editing ? `EDIT KEY F${this.editingKeyFrame}${this.state.auto_key ? " · AUTO KEY" : ""}` : (this.state.auto_key ? "AUTO KEY" : "");
  }

  updateKeyVisualState() {
    for (const element of this.root.querySelectorAll("[data-key-frame]")) {
      const frame = Number(element.dataset.keyFrame);
      element.classList.toggle("selected", frame === this.selectedKeyFrame);
      element.classList.toggle("editing", frame === this.editingKeyFrame);
      element.classList.toggle("at-playhead", frame === this.frame);
    }
    this.updateEditState();
  }

  curveChannels() {
    const group = this.root.querySelector('[data-role="curve-group"]').value;
    if (this.timelineObject()) {
      const field = group === "target" ? "rotation" : group === "lens" ? "size" : "position";
      const title = field === "size" ? "Scale" : field[0].toUpperCase() + field.slice(1);
      return [0, 1, 2].map((index) => ({ name: `${title} ${"XYZ"[index]}`, color: ["#ef5350", "#53d86a", "#4aa3ef"][index], get: (transform) => transform[field][index], set: (transform, value) => { transform[field][index] = field === "size" ? Math.max(0.01, value) : value; } }));
    }
    if (group === "target") return [0, 1, 2].map((index) => ({ name: `Target ${"XYZ"[index]}`, color: ["#ef5350", "#53d86a", "#4aa3ef"][index], get: (camera) => camera.target[index], set: (camera, value) => { camera.target[index] = value; } }));
    if (group === "lens") return [
      { name: "FOV", color: "#ef8b3e", get: (camera) => camera.fov, set: (camera, value) => { camera.fov = clamp(value, 5, 150); } },
      { name: "Roll", color: "#43c7db", get: (camera) => camera.roll || 0, set: (camera, value) => { camera.roll = clamp(value, -180, 180); } },
      { name: "Zoom", color: "#66d17a", get: (camera) => camera.zoom || 1, set: (camera, value) => { camera.zoom = Math.max(0.01, value); } },
    ];
    return [0, 1, 2].map((index) => ({ name: `Position ${"XYZ"[index]}`, color: ["#ef5350", "#53d86a", "#4aa3ef"][index], get: (camera) => camera.position[index], set: (camera, value) => { camera.position[index] = value; } }));
  }

  drawCurveEditor() {
    const canvas = this.root.querySelector('[data-role="curve-canvas"]');
    const width = canvas.clientWidth, height = 178;
    if (!width) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
    const object = this.timelineObject(), keys = this.timelineKeyframes(), channels = this.curveChannels(), left = 38, right = 9, top = 12, bottom = 22, graphWidth = Math.max(1, width - left - right), graphHeight = height - top - bottom, lastFrame = Math.max(1, this.state.duration_frames - 1);
    const sampled = [];
    const sampleStep = Math.max(1, Math.ceil(this.state.duration_frames / Math.max(80, graphWidth)));
    const sampleValue = (frame) => object ? sampleObjectTransform(object, frame) : sampleCamera(this.state, frame);
    for (let frame = 0; frame <= lastFrame; frame += sampleStep) sampled.push({ frame, value: sampleValue(frame) });
    if (sampled[sampled.length - 1]?.frame !== lastFrame) sampled.push({ frame: lastFrame, value: sampleValue(lastFrame) });
    const values = sampled.flatMap((sample) => channels.map((channel) => channel.get(sample.value)));
    let minimum = Math.min(...values), maximum = Math.max(...values);
    if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) { minimum = -1; maximum = 1; }
    if (Math.abs(maximum - minimum) < 1e-6) { minimum -= 1; maximum += 1; }
    const padding = (maximum - minimum) * 0.08; minimum -= padding; maximum += padding;
    const xFor = (frame) => left + graphWidth * frame / lastFrame;
    const yFor = (value) => top + graphHeight * (maximum - value) / (maximum - minimum);
    ctx.fillStyle = "#111"; ctx.fillRect(0, 0, width, height); ctx.strokeStyle = "#303030"; ctx.lineWidth = 1; ctx.font = "10px system-ui"; ctx.fillStyle = "#8e8e8e";
    const tickCount = Math.min(12, Math.max(2, Math.floor(graphWidth / 75)));
    for (let index = 0; index <= tickCount; index++) { const frame = Math.round(lastFrame * index / tickCount), x = xFor(frame); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + graphHeight); ctx.stroke(); ctx.fillText(String(frame), x + 3, height - 6); }
    for (let index = 0; index <= 4; index++) { const y = top + graphHeight * index / 4; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke(); const value = maximum - (maximum - minimum) * index / 4; ctx.fillText(value.toFixed(Math.abs(maximum - minimum) < 10 ? 1 : 0), 3, y + 3); }
    this.curveHitPoints = [];
    for (const channel of channels) {
      ctx.strokeStyle = channel.color; ctx.lineWidth = 1.7; ctx.beginPath();
      sampled.forEach((sample, index) => { const x = xFor(sample.frame), y = yFor(channel.get(sample.value)); if (index) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
      for (const key of keys) { const value = object ? key.transform : key.camera, x = xFor(key.frame), y = yFor(channel.get(value)); ctx.fillStyle = key.frame === this.selectedKeyFrame ? "#ffd75e" : channel.color; ctx.strokeStyle = "#111"; ctx.beginPath(); ctx.arc(x, y, key.frame === this.selectedKeyFrame ? 4.5 : 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); this.curveHitPoints.push({ x, y, key, channel, minimum, maximum, graphHeight, object }); }
    }
    const playheadX = xFor(this.frame); ctx.strokeStyle = "#f2d06b"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(playheadX, top); ctx.lineTo(playheadX, top + graphHeight); ctx.stroke();
    for (const button of this.root.querySelectorAll("[data-curve-mode]")) button.classList.toggle("active", button.dataset.curveMode === this.selectedKeyframe()?.interpolation);
  }

  onCurvePointerDown(event) {
    event.preventDefault(); event.stopPropagation();
    const canvas = event.currentTarget, rect = canvas.getBoundingClientRect(), x = (event.clientX - rect.left) * canvas.clientWidth / Math.max(1, rect.width), y = (event.clientY - rect.top) * 178 / Math.max(1, rect.height);
    const hit = (this.curveHitPoints || []).map((point) => ({ point, distance: Math.hypot(x - point.x, y - point.y) })).sort((a, b) => a.distance - b.distance)[0];
    if (!hit || hit.distance > 10) { this.exitKeyEdit(true); return this.setFrame(Math.round(clamp((x - 38) / Math.max(1, rect.width - 47), 0, 1) * (this.state.duration_frames - 1))); }
    this.selectKeyframe(hit.point.key); const value = hit.point.object ? hit.point.key.transform : hit.point.key.camera; this.curveDrag = { ...hit.point, startY: y, startValue: hit.point.channel.get(value), pointerId: event.pointerId }; canvas.setPointerCapture?.(event.pointerId);
  }

  onCurvePointerMove(event) {
    if (!this.curveDrag || event.pointerId !== this.curveDrag.pointerId) return;
    event.preventDefault(); event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect(), y = (event.clientY - rect.top) * 178 / Math.max(1, rect.height);
    const value = this.curveDrag.startValue - (y - this.curveDrag.startY) * (this.curveDrag.maximum - this.curveDrag.minimum) / Math.max(1, this.curveDrag.graphHeight);
    const keyedValue = this.curveDrag.object ? this.curveDrag.key.transform : this.curveDrag.key.camera;
    this.curveDrag.channel.set(keyedValue, value);
    this.editingKeyFrame = this.curveDrag.key.frame; this.frame = this.curveDrag.key.frame;
    if (this.curveDrag.object) { const transform = cloneTransform(this.curveDrag.key.transform); this.curveDrag.object.position = transform.position; this.curveDrag.object.rotation = transform.rotation; this.curveDrag.object.size = transform.size; }
    else this.camera = cloneCamera(this.curveDrag.key.camera);
    this.serialize(); this.refreshKeyEditor(); this.updateKeyVisualState(); this.render(); this.drawCurveEditor();
  }

  onCurvePointerUp(event) {
    if (!this.curveDrag || event.pointerId !== this.curveDrag.pointerId) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    this.editingKeyFrame = null; this.curveDrag = null; this.updateKeyVisualState(); this.drawCurveEditor();
  }

  setCurveInterpolation(mode) {
    const key = this.selectedKeyframe() || this.timelineKeyframes().find((item) => item.frame === this.frame);
    if (!key) return this.setStatus("Select a keyframe first");
    key.interpolation = mode; this.selectedKeyFrame = key.frame; this.serialize(); this.refreshKeys(); this.render(); this.setStatus(`${mode.replace("_", " ")} interpolation @ ${key.frame}`);
  }

  refreshKeys() {
    const box = this.root.querySelector('[data-role="keys"]'); box.innerHTML = "";
    const object = this.timelineObject(), keys = this.timelineKeyframes();
    const lastFrame = Math.max(1, this.state.duration_frames - 1);
    const tickCount = Math.min(12, Math.max(2, Math.floor(box.clientWidth / 80) || 8));
    for (let index = 0; index <= tickCount; index++) {
      const frame = Math.round(index * lastFrame / tickCount);
      const tick = document.createElement("span"); tick.className = "timeline-tick"; tick.textContent = String(frame); tick.style.left = `${100 * frame / lastFrame}%`; box.appendChild(tick);
    }
    const playhead = document.createElement("span"); playhead.className = "playhead"; playhead.style.left = `${100 * this.frame / lastFrame}%`; box.appendChild(playhead);
    for (const key of keys) {
      const element = document.createElement("button");
      element.type = "button"; element.className = `key${key.frame === this.frame ? " at-playhead" : ""}${key.frame === this.selectedKeyFrame ? " selected" : ""}${key.frame === this.editingKeyFrame ? " editing" : ""}`;
      element.dataset.keyFrame = String(key.frame); element.setAttribute("aria-label", `${object?.name || "Camera"} keyframe at frame ${key.frame}`); element.title = `Frame ${key.frame} · ${key.interpolation} · drag to retime`;
      element.style.left = `${100 * key.frame / lastFrame}%`;
      const label = document.createElement("span"); label.className = "key-label"; label.textContent = String(key.frame); element.appendChild(label);
      element.addEventListener("pointerdown", (event) => {
        event.preventDefault(); event.stopPropagation(); element.focus({ preventScroll: true });
        this.selectedKeyFrame = key.frame; this.keyDrag = { key, box }; this.setFrame(key.frame, false, false);
      });
      element.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); this.selectKeyframe(key); });
      box.appendChild(element);
    }
    const activeCamera = this.activeCameraTrack();
    this.root.querySelector('[data-role="timeline-summary"]').textContent = `${object?.name || activeCamera.name} · ${keys.length} key${keys.length === 1 ? "" : "s"}`;
    this.root.querySelector('[data-role="camera-summary"]').textContent = `${activeCamera.name} · Key F${this.selectedKeyFrame ?? this.frame}`;
    const cameraList = this.root.querySelector('[data-role="camera-menu-list"]'); cameraList.innerHTML = "";
    for (const camera of this.state.cameras) {
      const button = document.createElement("button"); button.type = "button"; button.className = camera.id === this.state.active_camera_id ? "selected" : "";
      const icon = document.createElement("i"); icon.className = "pi pi-video"; const label = document.createElement("span"); label.textContent = `${camera.name} · ${camera.keyframes.length} key${camera.keyframes.length === 1 ? "" : "s"}${camera.id === this.state.playblast_camera_id ? " · PLAYBLAST" : ""}`; button.append(icon, label);
      button.addEventListener("click", () => { this.activateCamera(camera.id); this.closeMenus(); }); cameraList.appendChild(button);
    }
    this.refreshCameraSelectors();
    this.refreshKeyEditor();
    this.updateEditState();
    this.drawCurveEditor();
  }

  refreshKeyEditor() {
    const object = this.timelineObject(), key = this.selectedKeyframe(), editor = this.root.querySelector('[data-role="key-editor"]');
    editor.dataset.empty = String(!key);
    this.root.querySelector('[data-role="selected-key-label"]').textContent = key ? `${object?.name || "Camera"} Key @ ${key.frame}` : `No ${object ? "object" : "camera"} key selected`;
    const roles = ["key-frame", "key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"];
    for (const role of roles) this.root.querySelector(`[data-role="${role}"]`).disabled = !key || Boolean(object && !["key-frame", "key-interp"].includes(role));
    this.root.querySelector('[data-act="update-key"]').disabled = !key || Boolean(object);
    this.root.querySelector('[data-act="view-key"]').disabled = !key || Boolean(object);
    if (!key) return;
    if (object) { this.root.querySelector('[data-role="key-frame"]').value = String(key.frame); this.root.querySelector('[data-role="key-interp"]').value = key.interpolation; return; }
    const values = {
      "key-frame": key.frame, "key-interp": key.interpolation,
      "key-px": key.camera.position[0], "key-py": key.camera.position[1], "key-pz": key.camera.position[2],
      "key-tx": key.camera.target[0], "key-ty": key.camera.target[1], "key-tz": key.camera.target[2],
      "key-fov": key.camera.fov, "key-roll": key.camera.roll || 0, "key-zoom": key.camera.zoom || 1, "key-near": key.camera.near, "key-far": key.camera.far, "key-camera-type": key.camera.camera_type,
    };
    for (const [role, value] of Object.entries(values)) this.root.querySelector(`[data-role="${role}"]`).value = String(value);
  }

  retimeSelectedKey(frame, nearest = false) {
    const key = this.selectedKeyframe(); if (!key) return;
    const keys = this.timelineKeyframes();
    let target = clamp(Math.round(frame), 0, this.state.duration_frames - 1);
    const occupied = (candidate) => keys.some((item) => item !== key && item.frame === candidate);
    if (occupied(target) && nearest) {
      for (let distance = 1; distance < this.state.duration_frames; distance++) {
        const candidates = [target - distance, target + distance].filter((candidate) => candidate >= 0 && candidate < this.state.duration_frames);
        const available = candidates.find((candidate) => !occupied(candidate));
        if (available !== undefined) { target = available; break; }
      }
    }
    if (occupied(target)) { this.refreshKeyEditor(); return this.setStatus(`Frame ${target} already has a keyframe`); }
    if (target === key.frame) return;
    const wasEditing = this.editingKeyFrame === key.frame;
    key.frame = target; this.selectedKeyFrame = target; this.editingKeyFrame = wasEditing ? target : null; this.frame = target;
    keys.sort((a, b) => a.frame - b.frame); this.serialize(); this.setFrame(target); this.setStatus(`Keyframe moved to ${target}`);
  }

  updateSelectedKey() {
    const key = this.selectedKeyframe(); if (!key) return;
    this.editingKeyFrame = key.frame;
    if (this.timelineObject()) { key.interpolation = this.root.querySelector('[data-role="key-interp"]').value; key.transform = cloneTransform(this.timelineObject()); this.serialize(); this.setFrame(key.frame); this.setStatus(`Object keyframe updated @ ${key.frame}`); return; }
    const read = (role, fallback) => { const value = Number(this.root.querySelector(`[data-role="${role}"]`).value); return Number.isFinite(value) ? value : fallback; };
    key.interpolation = this.root.querySelector('[data-role="key-interp"]').value;
    key.camera.position = [read("key-px", key.camera.position[0]), read("key-py", key.camera.position[1]), read("key-pz", key.camera.position[2])];
    key.camera.target = [read("key-tx", key.camera.target[0]), read("key-ty", key.camera.target[1]), read("key-tz", key.camera.target[2])];
    key.camera.fov = clamp(read("key-fov", key.camera.fov), 5, 150); key.camera.roll = clamp(read("key-roll", key.camera.roll || 0), -180, 180); key.camera.zoom = Math.max(0.01, read("key-zoom", key.camera.zoom || 1)); key.camera.near = Math.max(0.0001, read("key-near", key.camera.near)); key.camera.far = Math.max(key.camera.near + 0.0001, read("key-far", key.camera.far)); key.camera.camera_type = this.root.querySelector('[data-role="key-camera-type"]').value;
    this.camera = cloneCamera(key.camera); this.frame = key.frame; this.serialize(); this.setFrame(key.frame); this.setStatus(`Keyframe updated @ ${key.frame}`);
  }

  updateKeyFromView() {
    const key = this.selectedKeyframe(); if (!key) return;
    this.editingKeyFrame = key.frame; key.camera = cloneCamera(this.camera); this.serialize(); this.refreshKeys(); this.render(); this.setStatus(`View stored in keyframe @ ${key.frame}`);
  }

  loadSelectedKeyView() {
    const key = this.selectedKeyframe(); if (!key) return;
    this.setFrame(key.frame); this.setStatus(`Loaded keyframe @ ${key.frame}`);
  }

  goToAdjacentKey(direction) {
    const keys = this.timelineKeyframes(); if (!keys.length) return;
    const key = direction < 0 ? [...keys].reverse().find((item) => item.frame < this.frame) || keys[keys.length - 1] : keys.find((item) => item.frame > this.frame) || keys[0];
    this.selectKeyframe(key);
  }

  addPrimitive(type) {
    const id = `${type}_${Date.now().toString(36)}`;
    const ground = type === "ground";
    const obj = { id, type, name: type === "human" ? "Human Proxy" : type[0].toUpperCase() + type.slice(1), position: ground ? [0, -0.05, 0] : [0, type === "human" ? 0 : 0.75, -2], rotation: [0, 0, 0], size: ground ? [12, 0.1, 12] : type === "human" ? [0.7, 1.8, 0.4] : [1.5, 1.5, 1.5], material_mode: ground ? "checker" : "textured", keyframes: [], enabled: true };
    this.state.objects.push(obj); this.selectedEntity = "object"; this.selectedObjectId = id; this.selectedKeyFrame = null; this.serialize(); this.refreshObjects(); this.refreshKeys(); this.render();
  }

  addMediaCard() {
    const id = `card_${Date.now().toString(36)}`;
    this.state.objects.push({ id, type: "card", name: `Media Card ${this.state.objects.filter((item) => item.type === "card").length + 1}`, position: [0, 1.5, -2], rotation: [0, 0, 0], size: [2, 3], material_mode: "textured", keyframes: [], enabled: true, asset: "" });
    this.selectedEntity = "object"; this.selectedObjectId = id; this.selectedKeyFrame = null; this.serialize(); this.refreshObjects(); this.refreshKeys(); this.render(); this.root.querySelector('[data-role="file"]').click();
  }

  selectedObject() { return this.selectedEntity === "object" ? this.state.objects.find((object) => object.id === this.selectedObjectId) || null : null; }

  playblastCameraAtFrame() { return sampleCamera(this.playblastCameraTrack(), this.frame); }

  viewportCamera() { return this.recording ? this.playblastCameraAtFrame() : this.state.view_mode === "camera" ? this.camera : this.state.editor_views[this.state.view_mode]; }

  setViewMode(mode) {
    if (!["camera", "perspective", "top", "right", "left", "bottom"].includes(mode)) return;
    this.state.view_mode = mode;
    this.root.querySelector('[data-role="view-mode"]').value = mode;
    this.serialize(); this.render(); this.setStatus(`View: ${mode[0].toUpperCase()}${mode.slice(1)}`);
  }

  toggleCameraView() {
    this.state.camera_view_visible = !this.state.camera_view_visible;
    this.root.querySelector('[data-role="camera-view-row"]').hidden = !this.state.camera_view_visible;
    this.root.querySelector('.view-nav [data-act="toggle-camera-view"]')?.classList.toggle("active", this.state.camera_view_visible);
    this.serialize();
    if (this.state.camera_view_visible) requestAnimationFrame(() => { this.resizeCanvas(); this.renderCameraView(); });
    this.setStatus(`Camera previews ${this.state.camera_view_visible ? "shown" : "hidden"}`);
  }

  setTransformMode(mode) {
    if (!["translate", "rotate", "scale"].includes(mode)) return;
    this.state.gizmo_mode = mode;
    for (const button of this.root.querySelectorAll("[data-transform-mode]")) button.classList.toggle("active", button.dataset.transformMode === mode);
    this.serialize(); this.render(); this.setStatus(`${mode[0].toUpperCase()}${mode.slice(1)} · ${mode === "translate" ? "T" : mode === "rotate" ? "R" : "S"}`);
  }

  refreshInspector() {
    const object = this.selectedObject();
    const objectPanel = this.root.querySelector('[data-role="object-panel"]'), cameraPanel = this.root.querySelector('[data-role="camera-panel"]');
    objectPanel.hidden = !object; cameraPanel.hidden = Boolean(object);
    if (!object) {
      const activeCamera = this.activeCameraTrack();
      this.root.querySelector('[data-role="selected-name"]').textContent = `${activeCamera.name} · F${this.frame}`;
      this.root.querySelector('[data-role="curve-title"]').textContent = `${activeCamera.name} Curve Editor`;
      const groups = this.root.querySelector('[data-role="curve-group"]').options; groups[0].textContent = "Position XYZ"; groups[1].textContent = "Target XYZ"; groups[2].textContent = "FOV / Roll / Zoom";
      const values = [...this.camera.position, ...this.camera.target, this.camera.fov, this.camera.roll || 0, this.camera.near, this.camera.far];
      ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"].forEach((role, index) => { this.root.querySelector(`[data-role="${role}"]`).value = String(Math.round(values[index] * 10000) / 10000); });
      return;
    }
    const position = object.position || [0, 0, 0];
    this.root.querySelector('[data-role="selected-name"]').textContent = object.name || object.type;
    this.root.querySelector('[data-role="curve-title"]').textContent = `${object.name || object.type} Curve Editor`;
    const groups = this.root.querySelector('[data-role="curve-group"]').options; groups[0].textContent = "Position XYZ"; groups[1].textContent = "Rotation XYZ"; groups[2].textContent = "Scale XYZ";
    this.root.querySelector('[data-role="object-material"]').value = object.material_mode || "textured";
    this.root.querySelector('[data-role="object-x"]').value = String(position[0]);
    this.root.querySelector('[data-role="object-y"]').value = String(position[1]);
    this.root.querySelector('[data-role="object-z"]').value = String(position[2]);
    const rotation = object.rotation || [0, 0, 0], size = object.size || [1, 1, 1];
    for (let index = 0; index < 3; index++) {
      this.root.querySelector(`[data-role="object-r${"xyz"[index]}"]`).value = String(rotation[index]);
      this.root.querySelector(`[data-role="object-s${"xyz"[index]}"]`).value = String(size[index] ?? size[0] ?? 1);
    }
    for (const button of this.root.querySelectorAll("[data-transform-mode]")) button.classList.toggle("active", button.dataset.transformMode === (this.state.gizmo_mode || "translate"));
    const animationRow = this.root.querySelector('[data-role="animation-row"]'), animationSelect = this.root.querySelector('[data-role="animation-select"]'), model = this.modelInfoById.get(object.id);
    animationRow.hidden = !model?.animations;
    animationSelect.innerHTML = "";
    for (const [index, name] of (model?.animationNames || []).entries()) { const option = document.createElement("option"); option.value = String(index); option.textContent = name; animationSelect.appendChild(option); }
    animationSelect.value = String(object.animation_index || 0);
  }

  updateSelectedObject() {
    const object = this.selectedObject(); if (!object) return;
    object.position = ["object-x", "object-y", "object-z"].map((role) => Number(this.root.querySelector(`[data-role="${role}"]`).value));
    object.rotation = ["object-rx", "object-ry", "object-rz"].map((role) => Number(this.root.querySelector(`[data-role="${role}"]`).value));
    object.size = ["object-sx", "object-sy", "object-sz"].map((role) => Math.max(0.01, Number(this.root.querySelector(`[data-role="${role}"]`).value)));
    this.commitObjectEdit(object); this.refreshObjects(); this.render();
  }

  beginObjectEdit(object) {
    if (!object) return null;
    object.keyframes ||= [];
    let key = object.keyframes?.find((item) => item.frame === (this.state.auto_key ? this.frame : this.selectedKeyFrame));
    if (!key && this.state.auto_key) {
      key = { frame: this.frame, transform: cloneTransform(object), interpolation: this.root.querySelector('[data-role="interp"]').value };
      object.keyframes.push(key); object.keyframes.sort((a, b) => a.frame - b.frame);
    }
    if (key) { this.selectedKeyFrame = key.frame; this.editingKeyFrame = key.frame; this.updateKeyVisualState(); }
    return key;
  }

  commitObjectEdit(object) {
    const key = this.beginObjectEdit(object);
    if (key) key.transform = cloneTransform(object);
    this.serialize(); this.refreshKeyEditor(); this.updateKeyVisualState(); this.drawCurveEditor();
  }

  updateCameraFromHud() {
    const read = (role, fallback) => { const value = Number(this.root.querySelector(`[data-role="${role}"]`).value); return Number.isFinite(value) ? value : fallback; };
    this.camera.position = [read("camera-px", this.camera.position[0]), read("camera-py", this.camera.position[1]), read("camera-pz", this.camera.position[2])];
    this.camera.target = [read("camera-tx", this.camera.target[0]), read("camera-ty", this.camera.target[1]), read("camera-tz", this.camera.target[2])];
    this.camera.fov = clamp(read("camera-fov", this.camera.fov), 5, 150); this.camera.roll = clamp(read("camera-roll", this.camera.roll || 0), -180, 180);
    this.camera.near = Math.max(0.0001, read("camera-near", this.camera.near));
    this.camera.far = Math.max(this.camera.near + 0.0001, read("camera-far", this.camera.far));
    this.beginCameraEdit(); this.commitCameraEdit(); this.finishCameraEdit(); this.refreshInspector();
  }

  selectObjectAnimation(index) {
    const object = this.selectedObject(); if (!object) return;
    object.animation_index = Math.max(0, index || 0); this.serialize();
    this.webgl?.selectAnimation(object.id, index);
    this.setStatus(`Animation: ${this.modelInfoById.get(object.id)?.animationNames?.[index] || index + 1}`);
  }

  applyProxyPreset(preset) {
    const presets = { balanced: { mode: "omni_ref", burn: false }, parallax: { mode: "point_field", burn: false }, subject: { mode: "card_grid", burn: false }, debug: { mode: "omni_ref", burn: true } };
    const value = presets[preset] || presets.balanced;
    this.state.render_mode = value.mode; this.state.burn_in = value.burn;
    this.root.querySelector('[data-role="mode"]').value = value.mode; this.root.querySelector('[data-role="burn-in"]').checked = value.burn;
    if (this.modeWidget) this.modeWidget.value = value.mode;
    this.serialize(); this.render(); this.setStatus(`Proxy preset: ${preset}`);
  }

  createH3Setup() {
    const adapter = LiteGraph.createNode("MajoorOmniCamH3Adapter");
    if (!adapter) return this.setStatus("H3 adapter node is unavailable");
    adapter.pos = [this.node.pos[0] + this.node.size[0] + 80, this.node.pos[1]]; app.graph.add(adapter);
    this.node.connect(0, adapter, adapter.findInputSlot("camera_track")); this.node.connect(1, adapter, adapter.findInputSlot("proxy_video"));
    const h3 = LiteGraph.createNode("MinimaxHailuo03ReferenceNode");
    if (!h3) { this.setStatus("H3 adapter created; official MiniMax H3 node not installed"); return; }
    h3.pos = [adapter.pos[0] + adapter.size[0] + 80, adapter.pos[1]]; app.graph.add(h3);
    const videoSlot = h3.findInputSlot("video_1"), promptSlot = h3.findInputSlot("prompt");
    if (videoSlot >= 0) adapter.connect(0, h3, videoSlot);
    if (promptSlot >= 0) adapter.connect(1, h3, promptSlot);
    this.setStatus(videoSlot >= 0 ? "H3 reference workflow created" : "H3 nodes created; connect camera video to Video 1");
  }

  refreshObjects() {
    const box = this.root.querySelector('[data-role="objects"]'); box.innerHTML = "";
    for (const camera of this.state.cameras) {
      const element = document.createElement("button"); element.type = "button"; element.className = `scene-item${this.selectedEntity === "camera" && camera.id === this.state.active_camera_id ? " selected" : ""}`;
      const icon = document.createElement("i"); icon.className = "pi pi-video"; const label = document.createElement("span"); label.textContent = `${camera.id === this.state.playblast_camera_id ? "● " : ""}${camera.name}`; element.append(icon, label);
      element.title = camera.id === this.state.playblast_camera_id ? "Active playblast camera" : "Click to edit this camera";
      element.addEventListener("click", () => this.activateCamera(camera.id)); box.appendChild(element);
    }
    for (const obj of this.state.objects) {
      const el = document.createElement("button"); el.type = "button"; el.className = `scene-item${this.selectedEntity === "object" && obj.id === this.selectedObjectId ? " selected" : ""}`; el.innerHTML = `<i class="pi ${obj.type === "card" ? "pi-image" : obj.type === "model" || obj.type === "glb" ? "pi-box" : "pi-circle"}"></i> ${obj.enabled === false ? "○" : "●"} ${obj.name || obj.type}`; el.title = "Click to select, double-click to toggle, Alt+click to delete";
      el.addEventListener("click", (e) => {
        if (e.altKey && obj.id !== "subject") { this.state.objects = this.state.objects.filter((o) => o.id !== obj.id); this.removeObjectResources(obj.id); if (obj.id === this.selectedObjectId) this.selectedEntity = "camera"; }
        else { this.selectedEntity = "object"; this.selectedObjectId = obj.id; this.selectedKeyFrame = obj.keyframes?.find((key) => key.frame === this.frame)?.frame ?? null; }
        this.serialize(); this.refreshObjects(); this.refreshKeys(); this.render();
      }); el.addEventListener("dblclick", () => { obj.enabled = obj.enabled === false; this.serialize(); this.refreshObjects(); this.render(); }); box.appendChild(el);
    }
    this.refreshInspector();
  }

  removeObjectResources(id) {
    const url = this.cardUrlsById.get(id); if (url) URL.revokeObjectURL(url);
    this.cardUrlsById.delete(id); this.cardMediaById.delete(id); this.modelUrlsById.delete(id); this.modelInfoById.delete(id); this.webgl?.removeModel(id);
  }

  togglePlay() {
    if (this.playing) return this.stopPlay();
    this.playing = true; this.root.querySelector('[data-act="play"] i').className = "pi pi-pause";
    let f = this.frame >= this.state.duration_frames - 1 ? 0 : this.frame;
    const stepMs = 1000 / this.state.fps;
    this.playTimer = setInterval(() => {
      this.setFrame(f, true); f += 1;
      if (f >= this.state.duration_frames) this.stopPlay();
    }, stepMs);
  }

  stopPlay() {
    this.playing = false; if (this.playTimer) clearInterval(this.playTimer); this.playTimer = null;
    this.root.querySelector('[data-act="play"] i').className = "pi pi-play";
  }

  gizmoAxes(object) {
    const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    return this.state.gizmo_space === "local" ? axes.map((axis) => rotateEuler(axis, object.rotation)) : axes;
  }

  gizmoGeometry(object) {
    const camera = this.viewportCamera();
    const origin = object.position || [0, 0, 0];
    const center = project(origin, camera, this.canvas.width, this.canvas.height);
    if (!center) return null;
    const worldLength = Math.max(0.7, length(sub(camera.position, origin)) * 0.12);
    const axes = this.gizmoAxes(object);
    if (this.state.gizmo_mode !== "rotate") {
      return { center, worldLength, handles: axes.map((axis, index) => ({ index, axis, points: [center, project(add(origin, mul(axis, worldLength)), camera, this.canvas.width, this.canvas.height)] })).filter((handle) => handle.points[1]) };
    }
    const handles = axes.map((normal, index) => {
      const seed = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      const u = norm(cross(normal, seed)), v = norm(cross(normal, u));
      const points = [];
      for (let step = 0; step <= 48; step++) {
        const angle = step / 48 * Math.PI * 2;
        points.push(project(add(origin, add(mul(u, Math.cos(angle) * worldLength), mul(v, Math.sin(angle) * worldLength))), camera, this.canvas.width, this.canvas.height));
      }
      return { index, axis: normal, points: points.filter(Boolean) };
    });
    return { center, worldLength, handles };
  }

  pickGizmo(pointer) {
    const object = this.selectedObject(), geometry = object && this.gizmoGeometry(object);
    if (!geometry) return null;
    let best = null;
    for (const handle of geometry.handles) {
      for (let index = 0; index < handle.points.length - 1; index++) {
        const a = handle.points[index], b = handle.points[index + 1];
        const distance = distanceToSegment(pointer, a, b);
        if (!best || distance < best.distance) best = { ...handle, distance, segment: [a, b], worldLength: geometry.worldLength };
      }
    }
    return best?.distance <= 14 * Math.min(2, window.devicePixelRatio || 1) ? best : null;
  }

  pickSceneObject(pointer) {
    const raycastId = this.webgl?.pick?.(pointer[0], pointer[1], this.canvas.width, this.canvas.height);
    if (raycastId) return this.state.objects.find((object) => object.id === raycastId) || null;
    const camera = this.viewportCamera();
    let best = null;
    for (const object of this.state.objects) {
      if (object.enabled === false) continue;
      const point = project(object.position || [0, 0, 0], camera, this.canvas.width, this.canvas.height);
      if (!point) continue;
      const distance = Math.hypot(pointer[0] - point[0], pointer[1] - point[1]);
      if (!best || distance < best.distance) best = { object, distance };
    }
    return best?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? best.object : null;
  }

  drawTransformGizmo() {
    const object = this.selectedObject(), geometry = object && this.gizmoGeometry(object);
    if (!geometry) return;
    const colors = ["#ef5b5b", "#58cc6b", "#5f82ef"];
    this.ctx.save(); this.ctx.lineWidth = 4; this.ctx.lineCap = "round";
    for (const handle of geometry.handles) {
      this.ctx.strokeStyle = colors[handle.index]; this.ctx.fillStyle = colors[handle.index]; this.ctx.beginPath();
      handle.points.forEach((point, index) => { if (index) this.ctx.lineTo(point[0], point[1]); else this.ctx.moveTo(point[0], point[1]); }); this.ctx.stroke();
      if (this.state.gizmo_mode !== "rotate") {
        const end = handle.points[handle.points.length - 1];
        if (this.state.gizmo_mode === "scale") this.ctx.fillRect(end[0] - 6, end[1] - 6, 12, 12);
        else { this.ctx.beginPath(); this.ctx.arc(end[0], end[1], 6, 0, Math.PI * 2); this.ctx.fill(); }
      }
    }
    this.ctx.restore();
  }

  onPointerDown(e) {
    if (e.target?.closest?.("button,input,select")) return;
    e.preventDefault?.(); e.stopPropagation?.();
    this.closeMenus();
    this.interactionElement.focus({ preventScroll: true }); this.interactionElement.setPointerCapture?.(e.pointerId); this.activePointerId = e.pointerId; this.canvas.classList.add("dragging");
    const selected = this.selectedObject();
    const viewCamera = this.viewportCamera();
    const projected = selected ? project(selected.position || [0, 0, 0], viewCamera, this.canvas.width, this.canvas.height) : null;
    const rect = this.interactionElement.getBoundingClientRect();
    const pointerX = (e.clientX - rect.left) * this.canvas.width / Math.max(1, rect.width);
    const pointerY = (e.clientY - rect.top) * this.canvas.height / Math.max(1, rect.height);
    const picked = this.pickGizmo([pointerX, pointerY]);
    if (picked && selected) {
      this.beginObjectEdit(selected);
      const [a, b] = picked.segment;
      const screenLength = Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]));
      this.gizmoDrag = { pointer: [pointerX, pointerY], object: selected, axis: picked.axis, axisIndex: picked.index, screen: [(b[0] - a[0]) / screenLength, (b[1] - a[1]) / screenLength], worldLength: picked.worldLength, screenLength, position: [...selected.position], rotation: [...(selected.rotation || [0, 0, 0])], size: [...(selected.size || [1, 1, 1])] };
      return;
    }
    const hit = this.pickSceneObject([pointerX, pointerY]);
    if (hit && (this.selectedEntity !== "object" || hit.id !== this.selectedObjectId)) {
      this.selectedEntity = "object"; this.selectedObjectId = hit.id; this.selectedKeyFrame = hit.keyframes?.find((key) => key.frame === this.frame)?.frame ?? null; this.refreshObjects(); this.refreshKeys(); this.render();
      if (this.interactionElement.hasPointerCapture?.(e.pointerId)) this.interactionElement.releasePointerCapture(e.pointerId);
      this.activePointerId = null; this.canvas.classList.remove("dragging"); return;
    }
    if (e.altKey && projected && Math.hypot(pointerX - projected[0], pointerY - projected[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1)) {
      this.beginObjectEdit(selected); this.objectDrag = { x: e.clientX, y: e.clientY, position: [...selected.position], camera: cloneCamera(viewCamera), object: selected };
      return;
    }
    const editorView = this.state.view_mode !== "camera";
    if (!editorView) this.beginCameraEdit();
    this.drag = { x: e.clientX, y: e.clientY, shift: e.shiftKey || e.button === 1 || this.viewportCamera().camera_type === "orthographic", camera: cloneCamera(viewCamera), target: editorView ? this.state.editor_views[this.state.view_mode] : this.camera, editorView };
  }

  onPointerMove(e) {
    if (this.keyDrag) {
      const rect = this.keyDrag.box.getBoundingClientRect();
      const frame = Math.round(clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1) * (this.state.duration_frames - 1));
      if (frame !== this.keyDrag.key.frame) { this.editingKeyFrame = this.keyDrag.key.frame; this.retimeSelectedKey(frame, true); }
      return;
    }
    if (this.gizmoDrag) {
      const rect = this.interactionElement.getBoundingClientRect();
      const pointer = [(e.clientX - rect.left) * this.canvas.width / Math.max(1, rect.width), (e.clientY - rect.top) * this.canvas.height / Math.max(1, rect.height)];
      const deltaPixels = (pointer[0] - this.gizmoDrag.pointer[0]) * this.gizmoDrag.screen[0] + (pointer[1] - this.gizmoDrag.pointer[1]) * this.gizmoDrag.screen[1];
      if (this.state.gizmo_mode === "translate") this.gizmoDrag.object.position = add(this.gizmoDrag.position, mul(this.gizmoDrag.axis, deltaPixels * this.gizmoDrag.worldLength / this.gizmoDrag.screenLength));
      else if (this.state.gizmo_mode === "scale") {
        const size = [...this.gizmoDrag.size]; size[this.gizmoDrag.axisIndex] = Math.max(0.01, size[this.gizmoDrag.axisIndex] + deltaPixels * this.gizmoDrag.worldLength / this.gizmoDrag.screenLength); this.gizmoDrag.object.size = size;
      } else {
        const rotation = [...this.gizmoDrag.rotation]; rotation[this.gizmoDrag.axisIndex] += deltaPixels * 0.75; this.gizmoDrag.object.rotation = rotation;
      }
      this.commitObjectEdit(this.gizmoDrag.object); this.refreshInspector(); this.render(); return;
    }
    if (this.objectDrag) {
      const dx = e.clientX - this.objectDrag.x, dy = e.clientY - this.objectDrag.y;
      const { right, up } = cameraBasis(this.objectDrag.camera);
      const scale = length(sub(this.objectDrag.camera.position, this.objectDrag.position)) * 0.0025;
      this.objectDrag.object.position = add(this.objectDrag.position, add(mul(right, dx * scale), mul(up, -dy * scale)));
      this.commitObjectEdit(this.objectDrag.object); this.refreshInspector(); this.render();
      return;
    }
    if (!this.drag) return;
    const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
    const base = this.drag.camera;
    if (this.drag.shift) {
      const { right, up } = cameraBasis(base); const scale = length(sub(base.position, base.target)) * 0.0025;
      const delta = add(mul(right, -dx * scale), mul(up, dy * scale)); this.drag.target.position = add(base.position, delta); this.drag.target.target = add(base.target, delta);
    } else {
      const offset = sub(base.position, base.target); const r = length(offset);
      let yaw = Math.atan2(offset[0], offset[2]); let pitch = Math.asin(clamp(offset[1] / r, -0.999, 0.999));
      yaw -= dx * 0.008; pitch = clamp(pitch + dy * 0.008, -1.45, 1.45);
      this.drag.target.position = [base.target[0] + r * Math.sin(yaw) * Math.cos(pitch), base.target[1] + r * Math.sin(pitch), base.target[2] + r * Math.cos(yaw) * Math.cos(pitch)];
    }
    if (this.drag.editorView) { this.serialize(); this.render(); } else this.commitCameraEdit();
  }

  onPointerUp(event) {
    const finishedKeyDrag = this.keyDrag;
    const finishedCameraDrag = Boolean(this.drag && !this.drag.editorView), finishedObjectEdit = Boolean(this.gizmoDrag || this.objectDrag);
    if (event?.pointerId === this.activePointerId && this.interactionElement.hasPointerCapture?.(event.pointerId)) this.interactionElement.releasePointerCapture(event.pointerId);
    this.activePointerId = null; this.drag = null; this.objectDrag = null; this.gizmoDrag = null; this.keyDrag = null; this.canvas.classList.remove("dragging");
    if (finishedKeyDrag) { this.editingKeyFrame = null; this.updateKeyVisualState(); this.root.focus({ preventScroll: true }); }
    if (finishedCameraDrag) this.finishCameraEdit();
    if (finishedObjectEdit) { this.editingKeyFrame = null; this.updateKeyVisualState(); this.drawCurveEditor(); }
  }
  onWheel(e) { e.preventDefault(); e.stopPropagation(); this.closeMenus(); const editorView = this.state.view_mode !== "camera", camera = this.viewportCamera(); if (!editorView) this.beginCameraEdit(); const delta = clamp(e.deltaY * 0.001, -0.4, 0.4); const offset = sub(camera.position, camera.target); camera.position = add(camera.target, mul(offset, Math.exp(delta))); if (camera.camera_type === "orthographic") camera.zoom = Math.max(0.01, (camera.zoom || 1) * Math.exp(-delta)); if (editorView) { this.serialize(); this.render(); } else { this.commitCameraEdit(); this.finishCameraEdit(); } }

  timelineFrameFromEvent(event, box) {
    const rect = box.getBoundingClientRect();
    return Math.round(clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1) * (this.state.duration_frames - 1));
  }

  onTimelinePointerDown(event) {
    if (event.target.closest?.(".key")) return;
    event.preventDefault(); event.stopPropagation();
    this.exitKeyEdit(true);
    const box = event.currentTarget; box.focus({ preventScroll: true }); box.setPointerCapture?.(event.pointerId);
    this.timelineDrag = { box, pointerId: event.pointerId }; this.setFrame(this.timelineFrameFromEvent(event, box));
  }

  onTimelinePointerMove(event) {
    if (!this.timelineDrag || event.pointerId !== this.timelineDrag.pointerId) return;
    event.preventDefault(); event.stopPropagation(); this.setFrame(this.timelineFrameFromEvent(event, this.timelineDrag.box));
  }

  onTimelinePointerUp(event) {
    if (!this.timelineDrag || event.pointerId !== this.timelineDrag.pointerId) return;
    event.preventDefault(); event.stopPropagation();
    if (this.timelineDrag.box.hasPointerCapture?.(event.pointerId)) this.timelineDrag.box.releasePointerCapture(event.pointerId);
    this.timelineDrag = null;
  }

  onKey(e) {
    const target = e.composedPath?.()[0] || e.target;
    if (!(target instanceof HTMLElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable || target.closest?.('[contenteditable="true"],span.property_value')) return;
    if (target.tagName === "BUTTON" && (e.code === "Space" || e.key === "Enter")) return;
    const k = e.key.toLowerCase();
    const capture = () => { e.preventDefault(); e.stopPropagation(); };
    if ((e.ctrlKey || e.metaKey) && k === "c") { capture(); return this.copyKeyframe(); }
    if ((e.ctrlKey || e.metaKey) && k === "v") { capture(); return this.pasteKeyframe(); }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (this.selectedObject() && ["t", "r", "s"].includes(k)) { capture(); if (!e.repeat) this.setTransformMode({ t: "translate", r: "rotate", s: "scale" }[k]); return; }
    if (k === "i") { capture(); if (!e.repeat) this.insertKeyframe(); return; }
    if (e.code === "Space") { capture(); if (!e.repeat) this.togglePlay(); return; }
    if (k === "f") { capture(); if (!e.repeat) this.frameTarget(); return; }
    if (e.key === "Delete" || e.key === "Backspace") { capture(); if (!e.repeat) this.deleteKeyframe(); return; }
    if (e.key === "ArrowLeft") { capture(); this.setFrame(this.frame - 1); return; }
    if (e.key === "ArrowRight") { capture(); this.setFrame(this.frame + 1); return; }
    if (k === ",") { capture(); this.goToAdjacentKey(-1); return; }
    if (k === ".") { capture(); this.goToAdjacentKey(1); return; }
    if (e.key === "Home") { capture(); this.selectKeyframe(this.timelineKeyframes()[0]); return; }
    if (e.key === "End") { capture(); const keys = this.timelineKeyframes(); this.selectKeyframe(keys[keys.length - 1]); return; }
    const moveKeys = ["w", "a", "s", "d", "q", "e"];
    if (!moveKeys.includes(k)) return;
    capture();
    const camera = this.viewportCamera(), editorView = this.state.view_mode !== "camera";
    const { right, up, forward } = cameraBasis(camera); const speed = (e.shiftKey ? 0.6 : 0.18) * this.cameraSpeed;
    let delta = [0, 0, 0];
    if (k === "w") delta = mul(forward, speed); if (k === "s") delta = mul(forward, -speed);
    if (k === "d") delta = mul(right, speed); if (k === "a") delta = mul(right, -speed);
    if (k === "e") delta = mul(up, speed); if (k === "q") delta = mul(up, -speed);
    if (!editorView) this.beginCameraEdit(); camera.position = add(camera.position, delta); camera.target = add(camera.target, delta); if (editorView) { this.serialize(); this.render(); } else { this.commitCameraEdit(); this.finishCameraEdit(); }
  }

  frameTarget() {
    const subject = this.state.objects.find((o) => o.id === "subject") || { position: [0, 1.5, 0] };
    const camera = this.viewportCamera(), editorView = this.state.view_mode !== "camera", oldTarget = [...camera.target], distance = Math.max(2.5, length(sub(camera.position, oldTarget)));
    const dir = norm(sub(camera.position, oldTarget)); camera.target = [...subject.position]; camera.position = add(camera.target, mul(dir, distance)); if (editorView) { this.serialize(); this.render(); } else { this.beginCameraEdit(); this.commitCameraEdit(); this.finishCameraEdit(); }
  }

  async loadMediaUrl(object, url) {
    if (!object || !url) return;
    const path = String(object.asset || url).toLowerCase();
    if (/\.(mp4|webm|mov)(?:\s|$)/.test(path)) {
      const video = document.createElement("video"); video.src = url; video.loop = true; video.muted = true; video.playsInline = true;
      await new Promise((resolve) => { video.addEventListener("loadeddata", resolve, { once: true }); video.addEventListener("error", resolve, { once: true }); });
      this.cardMediaById.set(object.id, video); if (object.id === "subject") this.cardMedia = video;
    } else {
      const image = new Image(); image.src = url; await image.decode().catch(() => {});
      this.cardMediaById.set(object.id, image); if (object.id === "subject") this.cardMedia = image;
    }
    this.render();
  }

  restoreAssets() {
    for (const object of this.state.objects) {
      if (!object.asset) continue;
      const url = annotatedAssetUrl(object.asset);
      if (object.type === "glb" || object.type === "model") this.modelUrlsById.set(object.id, url);
      else if (object.type === "card" && !this.cardMediaById.has(object.id)) this.loadMediaUrl(object, url);
    }
  }

  onModelLoaded(model) {
    this.modelInfoById.set(model.id, model);
    const object = this.state.objects.find((item) => item.id === model.id);
    if (object?.animation_index) this.webgl?.selectAnimation(model.id, object.animation_index);
    if (model.id === this.selectedObjectId) this.refreshInspector();
    if (!model.meshes && !model.points && model.bones) {
      this.setStatus(`${model.format.toUpperCase()} animation only: ${model.bones} bones, no mesh · skeleton preview`);
    } else {
      this.setStatus(`${model.format.toUpperCase()} loaded: ${model.meshes} mesh${model.meshes === 1 ? "" : "es"}, ${model.vertices} vertices`);
    }
  }

  async loadModelFile(file) {
    if (!file) return;
    const format = file.name.split(".").pop()?.toLowerCase();
    if (!["glb", "obj", "fbx", "stl", "ply"].includes(format)) return this.setStatus("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first.");
    const id = `model_${Date.now().toString(36)}`;
    const object = { id, type: "model", format, name: file.name.replace(/\.[^.]+$/i, ""), position: [0, 0, -2], rotation: [0, 0, 0], size: [1, 1, 1], material_mode: "textured", keyframes: [], enabled: true, asset: "" };
    this.state.objects.push(object); this.selectedEntity = "object"; this.selectedObjectId = id; this.selectedKeyFrame = null;
    const url = URL.createObjectURL(file); this.cardUrlsById.set(id, url); this.modelUrlsById.set(id, url);
    this.serialize(); this.refreshObjects(); this.refreshKeys(); this.render(); this.setStatus(`Uploading ${format.toUpperCase()}...`);
    try {
      const body = new FormData(); body.append("asset", file, file.name);
      const response = await api.fetchApi("/majoor/omnicam/upload_model", { method: "POST", body });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json(); object.asset = data.path; this.serialize();
      const modelInfo = this.modelInfoById.get(id);
      if (modelInfo) this.onModelLoaded(modelInfo); else this.setStatus(`${format.toUpperCase()}: ${data.name}`);
    } catch (error) { console.error(error); this.setStatus(`${format.toUpperCase()} loaded locally; backend upload failed`); }
  }

  async loadCardFile(file) {
    if (!file) return;
    const object = this.selectedObject()?.type === "card" ? this.selectedObject() : this.state.objects.find((item) => item.id === "subject");
    const oldUrl = this.cardUrlsById.get(object.id); if (oldUrl) URL.revokeObjectURL(oldUrl);
    this.cardUrl = URL.createObjectURL(file); this.cardUrlsById.set(object.id, this.cardUrl);
    if (file.type.startsWith("video/")) {
      const vid = document.createElement("video"); vid.src = this.cardUrl; vid.loop = true; vid.muted = true; vid.playsInline = true; await vid.play().catch(() => {}); this.cardMediaById.set(object.id, vid); if (object.id === "subject") this.cardMedia = vid;
    } else {
      const img = new Image(); img.src = this.cardUrl; await img.decode().catch(() => {}); this.cardMediaById.set(object.id, img); if (object.id === "subject") this.cardMedia = img;
    }
    this.render(); this.setStatus("Uploading card…");
    try {
      const body = new FormData(); body.append("asset", file, file.name);
      const res = await api.fetchApi("/majoor/omnicam/upload_asset", { method: "POST", body });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json(); object.asset = data.path; if (object.id === "subject") { this.state.card_asset = data.path; if (this.cardWidget) this.cardWidget.value = data.path; } this.serialize(); this.setStatus(`Card: ${data.name}`);
    } catch (err) { console.error(err); this.setStatus("Card loaded locally; backend upload failed"); }
  }

  loadExecutionPreview(message) {
    this.executionReferences = Array.isArray(message?.images) ? message.images : [];
    const select = this.root.querySelector('[data-role="reference-select"]'); select.innerHTML = "";
    this.executionReferences.forEach((result, index) => {
      const option = document.createElement("option"); option.value = String(index); option.textContent = result.filename || `Upstream ${index + 1}`; select.appendChild(option);
    });
    if (!this.executionReferences.length) { const option = document.createElement("option"); option.value = "0"; option.textContent = "No upstream reference"; select.appendChild(option); return; }
    this.state.reference_index = clamp(this.state.reference_index || 0, 0, this.executionReferences.length - 1);
    select.value = String(this.state.reference_index); this.serialize(); this.loadSelectedReference();
  }

  loadSelectedReference() {
    const result = this.executionReferences[this.state.reference_index];
    if (!result) return;
    const image = new Image();
    image.onload = () => { this.cardMedia = image; this.cardMediaById.set("subject", image); this.render(); this.setStatus("Upstream media refreshed"); };
    image.src = api.apiURL(`/view?${new URLSearchParams(result).toString()}`);
  }

  drawLine3D(a, b, color = "#5a5a5a", width = 1) {
    const camera = this.viewportCamera(), pa = project(a, camera, this.canvas.width, this.canvas.height), pb = project(b, camera, this.canvas.width, this.canvas.height); if (!pa || !pb) return;
    this.ctx.strokeStyle = color; this.ctx.lineWidth = width; this.ctx.beginPath(); this.ctx.moveTo(pa[0], pa[1]); this.ctx.lineTo(pb[0], pb[1]); this.ctx.stroke();
  }

  drawGrid() {
    const extent = 60, step = 1;
    for (let i = -extent; i <= extent; i += step) {
      const major = i === 0; const c = major ? "#6f6f6f" : "#353535";
      this.drawLine3D([i, 0, -extent], [i, 0, extent], c, major ? 1.6 : 1);
      this.drawLine3D([-extent, 0, i], [extent, 0, i], c, major ? 1.6 : 1);
    }
  }

  drawPointField() {
    this.ctx.fillStyle = "#8a8a8a";
    for (let i = 0; i < 90; i++) {
      const angle = i * 2.3999632297, r = 1.5 + (i % 11) * 0.38, y = 0.15 + ((i * 0.618) % 1) * 4;
      const p = project([Math.cos(angle) * r, y, Math.sin(angle) * r], this.viewportCamera(), this.canvas.width, this.canvas.height); if (!p) continue;
      const radius = clamp(5 / Math.sqrt(p[2]), 1, 4); this.ctx.beginPath(); this.ctx.arc(p[0], p[1], radius, 0, Math.PI * 2); this.ctx.fill();
    }
  }

  drawCube(obj) {
    const [sx, sy, sz] = obj.size || [1, 1, 1], [x, y, z] = obj.position || [0, 0, 0];
    const pts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map((p)=>[x+p[0]*sx/2,y+p[1]*sy/2,z+p[2]*sz/2]);
    const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]; for(const [a,b] of edges)this.drawLine3D(pts[a],pts[b],"#a0a0a0",1.4);
  }

  drawSphere(obj) {
    const [sx] = obj.size || [1.5], [x,y,z]=obj.position||[0,1,0], r=sx/2;
    for(let axis=0;axis<3;axis++){let prev=null;for(let i=0;i<=32;i++){const a=i/32*Math.PI*2;let p;if(axis===0)p=[x+Math.cos(a)*r,y+Math.sin(a)*r,z];else if(axis===1)p=[x+Math.cos(a)*r,y,z+Math.sin(a)*r];else p=[x,y+Math.cos(a)*r,z+Math.sin(a)*r];if(prev)this.drawLine3D(prev,p,"#999",1);prev=p;}}
  }

  drawHuman(obj) {
    const [x,y,z]=obj.position||[0,0,0], h=(obj.size?.[1]||1.8), head=[x,y+h*0.88,z], neck=[x,y+h*0.72,z], hip=[x,y+h*0.42,z], footL=[x-h*.13,y,z],footR=[x+h*.13,y,z],handL=[x-h*.28,y+h*.48,z],handR=[x+h*.28,y+h*.48,z];
    this.drawLine3D(neck,hip,"#aaa",2);this.drawLine3D(neck,handL,"#aaa",2);this.drawLine3D(neck,handR,"#aaa",2);this.drawLine3D(hip,footL,"#aaa",2);this.drawLine3D(hip,footR,"#aaa",2);
    const p=project(head,this.viewportCamera(),this.canvas.width,this.canvas.height);if(p){this.ctx.strokeStyle="#aaa";this.ctx.beginPath();this.ctx.arc(p[0],p[1],clamp(28/p[2],3,12),0,Math.PI*2);this.ctx.stroke();}
  }

  drawNull(obj){const p=obj.position||[0,1,0],s=.25;this.drawLine3D(add(p,[-s,0,0]),add(p,[s,0,0]),"#bbb",2);this.drawLine3D(add(p,[0,-s,0]),add(p,[0,s,0]),"#bbb",2);this.drawLine3D(add(p,[0,0,-s]),add(p,[0,0,s]),"#bbb",2);}

  drawCard(obj) {
    const [x,y,z]=obj.position||[0,1.5,0], [w,h]=obj.size||[2,3], camera=this.viewportCamera(); const corners=[[x-w/2,y-h/2,z],[x+w/2,y-h/2,z],[x+w/2,y+h/2,z],[x-w/2,y+h/2,z]].map((p)=>project(p,camera,this.canvas.width,this.canvas.height)); if(corners.some((p)=>!p))return;
    const xs=corners.map((p)=>p[0]),ys=corners.map((p)=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    this.ctx.save();this.ctx.beginPath();this.ctx.moveTo(corners[0][0],corners[0][1]);for(let i=1;i<4;i++)this.ctx.lineTo(corners[i][0],corners[i][1]);this.ctx.closePath();this.ctx.clip();
    const media=this.cardMediaById.get(obj.id)||(obj.id==="subject"?this.cardMedia:null);
    if(media){try{const dw=Math.max(1,maxX-minX),dh=Math.max(1,maxY-minY),sw=media.videoWidth||media.naturalWidth||media.width,sh=media.videoHeight||media.naturalHeight||media.height,fit=this.state.card_fit||"contain";this.ctx.fillStyle="#111";this.ctx.fillRect(minX,minY,dw,dh);if(fit==="stretch"||!sw||!sh)this.ctx.drawImage(media,minX,minY,dw,dh);else if(fit==="contain"){const scale=Math.min(dw/sw,dh/sh),w=sw*scale,h=sh*scale;this.ctx.drawImage(media,minX+(dw-w)/2,minY+(dh-h)/2,w,h);}else{const scale=Math.max(dw/sw,dh/sh),cropW=dw/scale,cropH=dh/scale;this.ctx.drawImage(media,(sw-cropW)/2,(sh-cropH)/2,cropW,cropH,minX,minY,dw,dh);}}catch(_){}}
    else{this.ctx.fillStyle="#3a414b";this.ctx.fillRect(minX,minY,maxX-minX,maxY-minY);this.ctx.fillStyle="#d8d8d8";this.ctx.textAlign="center";this.ctx.font=`${Math.max(12,Math.min(28,(maxX-minX)*.08))}px system-ui`;this.ctx.fillText("SUBJECT CARD",(minX+maxX)/2,(minY+maxY)/2);}
    this.ctx.restore(); this.ctx.strokeStyle="#b3b8c1";this.ctx.lineWidth=2;this.ctx.beginPath();this.ctx.moveTo(corners[0][0],corners[0][1]);for(let i=1;i<4;i++)this.ctx.lineTo(corners[i][0],corners[i][1]);this.ctx.closePath();this.ctx.stroke();
  }

  drawCameraPath() {
    if (this.state.keyframes.length < 2) return;
    for (let i = 0; i < this.state.keyframes.length - 1; i++) this.drawLine3D(this.state.keyframes[i].camera.position, this.state.keyframes[i+1].camera.position, "#6c82b0", 2);
    for (const k of this.state.keyframes) { const p=project(k.camera.position,this.viewportCamera(),this.canvas.width,this.canvas.height);if(!p)continue;this.ctx.fillStyle=k.frame===this.frame?"#f2d06b":"#7694d1";this.ctx.beginPath();this.ctx.arc(p[0],p[1],4,0,Math.PI*2);this.ctx.fill(); }
  }

  drawSpeedHeatmap() {
    if (this.state.keyframes.length < 2) return;
    const speeds = [];
    for (let index = 0; index < this.state.keyframes.length - 1; index++) {
      const a = this.state.keyframes[index], b = this.state.keyframes[index + 1];
      speeds.push(length(sub(b.camera.position, a.camera.position)) * this.state.fps / Math.max(1, b.frame - a.frame));
    }
    const maximum = Math.max(...speeds, 1e-6);
    for (let index = 0; index < speeds.length; index++) {
      const hue = 120 * (1 - speeds[index] / maximum);
      this.drawLine3D(this.state.keyframes[index].camera.position, this.state.keyframes[index + 1].camera.position, `hsl(${hue} 85% 55%)`, 5);
    }
  }

  drawOverlays() {
    const c=this.ctx,w=this.canvas.width,h=this.canvas.height;
    if(!this.recording&&this.state.view_mode==="camera"&&this.state.guides!==false){c.save();c.strokeStyle="#ffffff55";c.lineWidth=1;c.beginPath();for(const x of [w/3,2*w/3]){c.moveTo(x,0);c.lineTo(x,h);}for(const y of [h/3,2*h/3]){c.moveTo(0,y);c.lineTo(w,y);}c.moveTo(w/2-14,h/2);c.lineTo(w/2+14,h/2);c.moveTo(w/2,h/2-14);c.lineTo(w/2,h/2+14);c.stroke();c.restore();}
    if(!this.recording)this.drawTransformGizmo();
    if(this.state.burn_in){const camera=this.viewportCamera();c.save();c.fillStyle="#000b";c.fillRect(0,h-34,w,34);c.fillStyle="#fff";c.font=`${Math.max(12,Math.round(h*.025))}px monospace`;c.fillText(`F ${this.frame}/${this.state.duration_frames-1}  ${this.state.fps}fps  FOV ${camera.fov.toFixed(1)}  ${this.state.render_mode}`,12,h-12);c.restore();}
  }

  render() {
    const c=this.ctx,w=this.canvas.width,h=this.canvas.height; c.fillStyle="#121212";c.fillRect(0,0,w,h);
    const mode=this.state.render_mode, viewCamera=this.viewportCamera();
    if(this.webgl){this.webgl.render(this.state,viewCamera,this.cardMediaById,w,h,this.modelUrlsById,this.frame,this.recording);c.drawImage(this.webgl.canvas,0,0,w,h);}else{if((!this.recording&&["omni_ref","card_grid","graybox","grid","wireframe"].includes(mode))||(this.recording&&this.state.playblast_grid))this.drawGrid();if(["omni_ref","point_field"].includes(mode))this.drawPointField();for(const obj of this.state.objects){if(obj.enabled===false)continue;if(obj.type==="card"&&["omni_ref","card_grid","graybox","wireframe"].includes(mode))this.drawCard(obj);else if(["cube","ground","glb","model"].includes(obj.type)&&mode!=="grid"&&mode!=="point_field")this.drawCube(obj);else if(obj.type==="sphere"&&mode!=="grid"&&mode!=="point_field")this.drawSphere(obj);else if(obj.type==="human"&&mode!=="grid"&&mode!=="point_field")this.drawHuman(obj);else if(obj.type==="null")this.drawNull(obj);}if(!this.recording)this.drawCameraPath();}
    if (!this.recording && this.state.speed_heatmap) this.drawSpeedHeatmap();
    this.drawOverlays();
    const p=viewCamera.position,t=viewCamera.target;
    this.root.querySelector('[data-role="hud"]').textContent=`OmniCam · ${this.state.view_mode} · ${mode}\nF ${this.frame}/${this.state.duration_frames-1} · ${this.state.fps}fps · FOV ${viewCamera.fov.toFixed(1)}°\nP ${p.map(v=>v.toFixed(2)).join(", ")}\nT ${t.map(v=>v.toFixed(2)).join(", ")}`;
    this.renderCameraView();
  }

  renderCameraView() {
    if (!this.state.camera_view_visible) return;
    this.refreshCameraPreviews();
    for (const cameraTrack of this.state.cameras) {
      const canvas = this.cameraPreviewCanvases.get(cameraTrack.id), context = this.cameraPreviewContexts.get(cameraTrack.id);
      if (!canvas?.width || !context) continue;
      const width = canvas.width, height = canvas.height, camera = sampleCamera(cameraTrack, this.frame);
      context.fillStyle = "#111"; context.fillRect(0, 0, width, height);
      if (this.cameraWebgl) {
        this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: false }, camera, this.cardMediaById, width, height, this.modelUrlsById, this.frame, true);
        context.drawImage(this.cameraWebgl.canvas, 0, 0, width, height);
      }
      if (this.state.guides !== false) {
        context.save(); context.strokeStyle = "#ffffff55"; context.lineWidth = Math.max(1, width / 640); context.beginPath();
        for (const x of [width / 3, 2 * width / 3]) { context.moveTo(x, 0); context.lineTo(x, height); }
        for (const y of [height / 3, 2 * height / 3]) { context.moveTo(0, y); context.lineTo(width, y); }
        context.stroke(); context.restore();
      }
      const frameLabel = this.root.querySelector(`[data-camera-frame="${cameraTrack.id}"]`); if (frameLabel) frameLabel.textContent = `F${this.frame}`;
    }
  }

  setStatus(text) { this.root.querySelector('[data-role="status"]').textContent = text; }

  async makePlayblast() {
    if (this.recording) return;
    this.stopPlay(); this.recording=true;this.root.classList.add("recording");this.setStatus("Encoding deterministic proxy…");
    const oldFrame = this.frame;
    try {
      let blob = null;
      if (this.root.querySelector('[data-role="encoder"]').value !== "realtime" && await supportsDeterministicEncoding(this.canvas.width, this.canvas.height)) {
        blob = await encodeDeterministicPlayblast(this.canvas, this.state.duration_frames, this.state.fps, async (frame) => {
          this.setFrame(frame, true); await this.waitForMediaFrame(); await new Promise((resolve) => requestAnimationFrame(resolve));
        });
      }
      if (!blob) blob = await this.captureRealtimePlayblast();
      this.setFrame(oldFrame); await this.uploadPlayblast(blob);
    } catch (error) { console.error(error); this.setStatus(`Playblast failed: ${error.message || error}`); }
    finally { this.recording=false; this.root.classList.remove("recording"); this.setFrame(oldFrame); }
  }

  async waitForMediaFrame() {
    const pending = [];
    for (const media of this.cardMediaById.values()) if (media instanceof HTMLVideoElement && media.seeking) pending.push(new Promise((resolve) => { media.addEventListener("seeked", resolve, { once: true }); media.addEventListener("error", resolve, { once: true }); }));
    await Promise.all(pending);
  }

  async captureRealtimePlayblast() {
    if (!window.MediaRecorder || !this.canvas.captureStream) throw new Error("MediaRecorder unsupported in this browser");
    this.setStatus("Recording realtime fallback…");
    const stream=this.canvas.captureStream(this.state.fps); let recorder; const types=["video/mp4;codecs=avc1.42E01E","video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"];
    for(const type of types){if(MediaRecorder.isTypeSupported&&!MediaRecorder.isTypeSupported(type))continue;try{recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:6_000_000});break;}catch(_){}}
    if(!recorder){stream.getTracks().forEach((track)=>track.stop());throw new Error("Cannot create MediaRecorder");}
    const chunks=[];recorder.ondataavailable=(e)=>{if(e.data.size)chunks.push(e.data)};
    const finished=new Promise((resolve)=>recorder.addEventListener("stop",resolve,{once:true}));recorder.start(100);
    for(let frame=0;frame<this.state.duration_frames;frame++){this.setFrame(frame,true);await new Promise(resolve=>setTimeout(resolve,1000/this.state.fps));}
    recorder.stop(); await finished; stream.getTracks().forEach((track)=>track.stop()); return new Blob(chunks,{type:recorder.mimeType||"video/webm"});
  }

  async uploadPlayblast(blob) {
    const extension=blob.type.startsWith("video/mp4")?"mp4":"webm";
    this.setStatus(`Uploading ${(blob.size/1024/1024).toFixed(1)} MB…`);
    try{const body=new FormData();body.append("video",blob,`omnicam_playblast.${extension}`);const res=await api.fetchApi("/majoor/omnicam/upload_playblast",{method:"POST",body});if(!res.ok)throw new Error(await res.text());const data=await res.json();if(this.recordingWidget)this.recordingWidget.value=data.path;this.serialize();this.setStatus(`Playblast ready: ${data.name}`);}catch(err){console.error(err);this.setStatus("Playblast captured; upload failed");}
  }

  dispose() { this.stopPlay(); clearTimeout(this.previewClickTimer); this.abortController?.abort(); this.resizeObserver?.disconnect(); this.webgl?.dispose(); this.cameraWebgl?.dispose(); for(const url of this.cardUrlsById.values())URL.revokeObjectURL(url);this.cardUrlsById.clear();this.cardMediaById.clear();this.modelUrlsById.clear();this.modelInfoById.clear(); }
}

function attachDirector(node) {
  if (node.__majoorOmniCam) return;
  const ui = new OmniCamDirectorUI(node); node.__majoorOmniCam = ui; ui.hideInternalWidgets();
  const preferredHeight = () => Math.max(700, ui.root.scrollHeight || 0);
  ui.domWidget = node.addDOMWidget("majoor_omnicam_viewport", "omnicam", ui.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 700,
    getHeight: preferredHeight,
    getMaxHeight: () => preferredHeight(),
    afterResize: () => { ui.resizeCanvas(); ui.render(); },
  });
  const min = [760, 780]; const current=node.size || min; node.setSize([Math.max(current[0],min[0]),Math.max(current[1],min[1])]);
  const originalResize=node.onResize;node.onResize=function(){originalResize?.apply(this,arguments);requestAnimationFrame(()=>{ui.resizeCanvas();ui.render();});};
  const originalConfigure=node.onConfigure;node.onConfigure=function(){originalConfigure?.apply(this,arguments);requestAnimationFrame(()=>ui.restoreFromWidgets());};
  const originalAfterGraphConfigured=node.onAfterGraphConfigured;node.onAfterGraphConfigured=function(){originalAfterGraphConfigured?.apply(this,arguments);requestAnimationFrame(()=>ui.restoreFromWidgets());};
  const originalRemoved=node.onRemoved;node.onRemoved=function(){ui.dispose();originalRemoved?.apply(this,arguments);};
  const originalExecuted=node.onExecuted;node.onExecuted=function(message){originalExecuted?.apply(this,arguments);ui.loadExecutionPreview(message);};
}

app.registerExtension({
  name: EXTENSION_NAME,
  async nodeCreated(node) { if (node.comfyClass === NODE_CLASS || node.constructor?.type === NODE_CLASS) attachDirector(node); },
});
