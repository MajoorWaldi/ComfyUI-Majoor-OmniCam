const f = (a, t, e) => Math.max(t, Math.min(e, a)), y = (a, t, e) => a + (t - a) * e, q = (a = 0, t = 0, e = 0) => [a, t, e], w = (a, t) => [a[0] + t[0], a[1] + t[1], a[2] + t[2]], A = (a, t) => [a[0] - t[0], a[1] - t[1], a[2] - t[2]], M = (a, t) => [a[0] * t, a[1] * t, a[2] * t], g = (a, t) => a[0] * t[0] + a[1] * t[1] + a[2] * t[2], z = (a, t) => [a[1] * t[2] - a[2] * t[1], a[2] * t[0] - a[0] * t[2], a[0] * t[1] - a[1] * t[0]], U = (a) => Math.sqrt(Math.max(1e-12, g(a, a))), k = (a) => M(a, 1 / U(a)), x = (a, t, e) => [y(a[0], t[0], e), y(a[1], t[1], e), y(a[2], t[2], e)];
function V(a, t, e) {
  const r = [e[0] - t[0], e[1] - t[1]], o = [a[0] - t[0], a[1] - t[1]], n = Math.max(1e-9, r[0] * r[0] + r[1] * r[1]), s = f((o[0] * r[0] + o[1] * r[1]) / n, 0, 1);
  return Math.hypot(a[0] - t[0] - r[0] * s, a[1] - t[1] - r[1] * s);
}
function S(a, t = "ease") {
  return a = f(a, 0, 1), t === "linear" ? a : t === "ease_in" ? a * a : t === "ease_out" ? 1 - (1 - a) * (1 - a) : t === "smooth" ? a * a * a * (a * (a * 6 - 15) + 10) : t === "bezier" ? 0.15 * (1 - a) * (1 - a) * a + 2.85 * (1 - a) * a * a + a * a * a : a * a * (3 - 2 * a);
}
const $ = ["auto", "vector", "free", "aligned"];
function F() {
  return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: "auto" };
}
function E(a, t, e) {
  const r = Math.max(1e-6, t.frame - (a?.frame ?? t.frame - 1)), o = Math.max(1e-6, (e?.frame ?? t.frame + 1) - t.frame), n = (t.value - (a?.value ?? t.value)) / r + ((e?.value ?? t.value) - t.value) / o;
  return { out_y: n * o * 0.5, in_y: n * r * 0.5 };
}
function O(a, t, e) {
  const r = a.tangents || {}, o = $.includes(r.mode) ? r.mode : "auto";
  if (o === "vector") return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: o };
  if (o === "auto") return { out_x: 1 / 3, in_x: -1 / 3, ...E(t, a, e), mode: o };
  const n = { out_x: f(r.out_x ?? 1 / 3, 0.01, 0.99), out_y: r.out_y ?? 0, in_x: f(r.in_x ?? -1 / 3, -0.99, -0.01), in_y: r.in_y ?? 0, mode: o };
  if (o === "aligned") {
    const s = Math.hypot(n.out_x, n.out_y) || 1e-6, m = Math.hypot(n.in_x, n.in_y) || 1e-6;
    n.in_x = -n.out_x / s * m, n.in_y = -n.out_y / s * m;
  }
  return n;
}
function K(a, t, e, r, o, n) {
  const s = O(t, e, r), m = f(s.out_x, 0.01, 0.99), l = f(1 + s.in_x, 0.01, 0.99), p = s.out_y / Math.max(1e-6, s.out_x) / Math.max(1, o), i = s.in_y / Math.max(1e-6, s.in_x) / Math.max(1, n || o), c = p * m, u = 1 + i * (l - 1), _ = f(a, 0, 1), h = 1 - _;
  return 3 * h * h * _ * c + 3 * h * _ * _ * u + _ * _ * _;
}
function N() {
  return { position: [6, 4, 6], target: [0, 1.5, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 };
}
function C() {
  const a = [0, 1, 0], t = (e, r = [0, 1, 0], o = "orthographic") => ({ ...N(), position: e, target: [...a], up: r, camera_type: o, zoom: 1 });
  return {
    perspective: t([8, 6, 8], [0, 1, 0], "perspective"),
    top: t([0, 14, 0], [0, 0, -1]),
    right: t([14, 1, 0]),
    left: t([-14, 1, 0]),
    bottom: t([0, -12, 0], [0, 0, 1])
  };
}
function b(a) {
  return { position: [...a.position || [0, 0, 0]], rotation: [...a.rotation || [0, 0, 0]], size: [...a.size || [1, 1, 1]] };
}
function L(a, t) {
  const e = new Map(a.map((l) => [l.id, l]));
  let r = [...t.position || [0, 0, 0]], o = [...t.rotation || [0, 0, 0]], n = [...t.size || [1, 1, 1]];
  const s = /* @__PURE__ */ new Set([t.id]);
  let m = t.parent_id ? e.get(t.parent_id) : null;
  for (; m && !s.has(m.id); ) {
    s.add(m.id);
    const l = [r[0] * (m.size?.[0] ?? 1), r[1] * (m.size?.[1] ?? 1), r[2] * (m.size?.[2] ?? 1)], p = T(l, m.rotation || [0, 0, 0]);
    r = w(p, m.position || [0, 0, 0]), o = [o[0] + (m.rotation?.[0] ?? 0), o[1] + (m.rotation?.[1] ?? 0), o[2] + (m.rotation?.[2] ?? 0)], n = [n[0] * (m.size?.[0] ?? 1), n[1] * (m.size?.[1] ?? 1), n[2] * (m.size?.[2] ?? 1)], m = m.parent_id ? e.get(m.parent_id) : null;
  }
  return { position: r, rotation: o, size: n };
}
function W(a, t) {
  const e = a.keyframes || [];
  if (!e.length) return b(a);
  if (t <= e[0].frame) return b(e[0].transform);
  if (t >= e[e.length - 1].frame) return b(e[e.length - 1].transform);
  let r = e[0], o = e[e.length - 1];
  for (let s = 0; s < e.length - 1; s++) if (e[s].frame <= t && t <= e[s + 1].frame) {
    r = e[s], o = e[s + 1];
    break;
  }
  const n = S((t - r.frame) / Math.max(1, o.frame - r.frame), r.interpolation);
  return { position: x(r.transform.position, o.transform.position, n), rotation: x(r.transform.rotation, o.transform.rotation, n), size: x(r.transform.size, o.transform.size, n) };
}
function R() {
  const a = N(), t = [{ frame: 0, camera: d(a), interpolation: "ease" }];
  return {
    schema_version: 1,
    fps: 24,
    duration_frames: 120,
    width: 1280,
    height: 720,
    render_mode: "omni_ref",
    camera: a,
    keyframes: t,
    cameras: [{ id: "camera_1", name: "Camera 1", camera: d(a), keyframes: t }],
    active_camera_id: "camera_1",
    playblast_camera_id: "camera_1",
    objects: [{ id: "subject", type: "card", name: "Subject Card", position: [0, 1.5, 0], rotation: [0, 0, 0], size: [2, 3], material_mode: "textured", keyframes: [], enabled: !0, asset: "" }],
    metadata: {},
    guides: !0,
    burn_in: !1,
    speed_heatmap: !1,
    playblast_grid: !1,
    card_fit: "contain",
    card_asset: "",
    reference_index: 0,
    gizmo_mode: "translate",
    gizmo_space: "world",
    auto_key: !1,
    view_mode: "camera",
    camera_view_visible: !0,
    editor_views: C(),
    ui_density: "advanced",
    snap_enabled: !0,
    snap_frames: 1,
    timecode_mode: "time",
    loop_playback: !1,
    playback_range: null,
    markers: [],
    preview_layout: "auto",
    maximized_camera_id: null,
    safe_areas: !1,
    resolution_gate: !1,
    aspect_ratio: "auto"
  };
}
function d(a) {
  const t = Math.max(1e-4, Number.isFinite(Number(a.near)) ? Number(a.near) : 0.01), e = Number.isFinite(Number(a.far)) ? Number(a.far) : 1e4;
  return {
    position: [...a.position],
    target: [...a.target],
    fov: Number(a.fov ?? 35),
    roll: Number(a.roll ?? 0),
    camera_type: a.camera_type || "perspective",
    zoom: Number(a.zoom ?? 1),
    near: t,
    far: Math.max(t + 1e-4, e),
    ...Array.isArray(a.up) ? { up: [...a.up] } : {}
  };
}
function D(a) {
  const t = R();
  if (!a || typeof a != "object") return t;
  const e = { ...t, ...a };
  e.fps = f(Number(e.fps || 24), 1, 120), e.duration_frames = Math.max(1, Number(e.duration_frames || 120)), e.width = f(Number(e.width || 1280), 64, 4096), e.height = f(Number(e.height || 720), 64, 4096);
  const r = (i, c) => (Array.isArray(i) ? i : []).map((u) => ({ frame: f(Math.round(Number(u.frame || 0)), 0, e.duration_frames - 1), camera: d(u.camera || u || c), interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(u.interpolation) ? u.interpolation : "ease" })), o = d(e.camera || t.camera);
  let n = r(e.keyframes, o);
  n = [...new Map(n.map((i) => [i.frame, i])).values()].sort((i, c) => i.frame - c.frame), n.length || (n = [{ frame: 0, camera: d(o), interpolation: "ease" }]);
  const s = Array.isArray(e.cameras) && e.cameras.length ? e.cameras : [{ id: "camera_1", name: "Camera 1", camera: o, keyframes: n }], m = /* @__PURE__ */ new Set();
  e.cameras = s.map((i, c) => {
    let u = String(i?.id || `camera_${c + 1}`);
    m.has(u) && (u = `camera_${c + 1}`), m.add(u);
    const _ = d(i?.camera || i?.keyframes?.[0]?.camera || o);
    let h = r(i?.keyframes, _);
    return h = [...new Map(h.map((v) => [v.frame, v])).values()].sort((v, I) => v.frame - I.frame), h.length || (h = [{ frame: 0, camera: d(_), interpolation: "ease" }]), { id: u, name: String(i?.name || `Camera ${c + 1}`), camera: _, keyframes: h, locked: !!i?.locked, muted: !!i?.muted, solo: !!i?.solo };
  }), e.active_camera_id = e.cameras.some((i) => i.id === e.active_camera_id) ? e.active_camera_id : e.cameras[0].id, e.playblast_camera_id = e.cameras.some((i) => i.id === e.playblast_camera_id) ? e.playblast_camera_id : e.active_camera_id;
  const l = e.cameras.find((i) => i.id === e.active_camera_id);
  e.camera = l.camera, e.keyframes = l.keyframes, e.objects = (Array.isArray(e.objects) ? e.objects : t.objects).map((i) => ({ ...i, locked: !!i.locked, parent_id: typeof i.parent_id == "string" ? i.parent_id : null, position: Array.isArray(i.position) ? i.position.map(Number) : [0, 0, 0], rotation: Array.isArray(i.rotation) ? i.rotation.map(Number) : [0, 0, 0], size: Array.isArray(i.size) ? i.size.map(Number) : [1, 1, 1], material_mode: ["textured", "checker", "neutral", "wireframe"].includes(i.material_mode) ? i.material_mode : "textured", keyframes: (Array.isArray(i.keyframes) ? i.keyframes : []).map((c) => ({ frame: f(Math.round(Number(c.frame || 0)), 0, e.duration_frames - 1), transform: b(c.transform || i), interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(c.interpolation) ? c.interpolation : "ease" })).sort((c, u) => c.frame - u.frame) })), e.gizmo_mode = ["translate", "rotate", "scale"].includes(e.gizmo_mode) ? e.gizmo_mode : "translate", e.gizmo_space = e.gizmo_space === "local" ? "local" : "world", e.ui_density = ["basic", "animation", "advanced"].includes(e.ui_density) ? e.ui_density : "advanced", e.snap_enabled = e.snap_enabled !== !1, e.snap_frames = Math.max(1, Math.round(Number(e.snap_frames) || 1)), e.timecode_mode = ["time", "timecode"].includes(e.timecode_mode) ? e.timecode_mode : "time", e.loop_playback = !!e.loop_playback, e.playback_range = Array.isArray(e.playback_range) && e.playback_range.length === 2 ? [f(Math.round(Number(e.playback_range[0]) || 0), 0, e.duration_frames - 1), f(Math.round(Number(e.playback_range[1]) || e.duration_frames - 1), 0, e.duration_frames - 1)] : null, e.markers = (Array.isArray(e.markers) ? e.markers : []).filter((i) => i && Number.isFinite(Number(i.frame))).map((i, c) => ({ frame: f(Math.round(Number(i.frame)), 0, e.duration_frames - 1), name: String(i.name || `Marker ${c + 1}`).slice(0, 40), color: String(i.color || "#f2d06b") })), e.preview_layout = ["auto", "1", "2", "4"].includes(String(e.preview_layout)) ? String(e.preview_layout) : "auto", e.maximized_camera_id = typeof e.maximized_camera_id == "string" ? e.maximized_camera_id : null, e.safe_areas = !!e.safe_areas, e.resolution_gate = !!e.resolution_gate, e.aspect_ratio = ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"].includes(e.aspect_ratio) ? e.aspect_ratio : "auto", e.auto_key = !!e.auto_key, e.playblast_grid = !!e.playblast_grid, e.reference_index = Math.max(0, Number(e.reference_index || 0)), e.view_mode = ["camera", "perspective", "top", "right", "left", "bottom"].includes(e.view_mode) ? e.view_mode : "camera", e.camera_view_visible = e.camera_view_visible !== !1;
  const p = C();
  return e.editor_views = Object.fromEntries(Object.entries(p).map(([i, c]) => [i, d(e.editor_views?.[i] || c)])), e;
}
function T(a, t) {
  const [e, r, o] = (t || [0, 0, 0]).map((l) => l * Math.PI / 180);
  let [n, s, m] = a;
  return [s, m] = [s * Math.cos(e) - m * Math.sin(e), s * Math.sin(e) + m * Math.cos(e)], [n, m] = [n * Math.cos(r) + m * Math.sin(r), -n * Math.sin(r) + m * Math.cos(r)], [n, s] = [n * Math.cos(o) - s * Math.sin(o), n * Math.sin(o) + s * Math.cos(o)], [n, s, m];
}
function G(a) {
  if (!a) return "";
  const t = String(a).match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/), e = t?.[1] || String(a), r = t?.[2] || "input", o = e.lastIndexOf("/"), n = o >= 0 ? e.slice(0, o) : "", s = o >= 0 ? e.slice(o + 1) : e;
  return B(`/view?filename=${encodeURIComponent(s)}&subfolder=${encodeURIComponent(n)}&type=${encodeURIComponent(r)}`);
}
let B = (a) => a;
function J({ api: a }) {
  B = (t) => a.apiURL ? a.apiURL(t) : t;
}
function H(a) {
  const t = A(a.target, a.position), e = Math.sqrt(g(t, t)) < 1e-6 ? [0, 0, -1] : k(t);
  let r = a.up || [0, 1, 0], o = z(e, r);
  Math.sqrt(g(o, o)) < 1e-6 && (r = Math.abs(e[1]) > 0.9 ? [0, 0, e[1] > 0 ? -1 : 1] : [0, 1, 0], o = z(e, r)), o = k(o);
  let n = k(z(o, e));
  if (Math.abs(a.roll || 0) > 1e-9) {
    const s = a.roll * Math.PI / 180, m = Math.cos(s), l = Math.sin(s), p = w(M(o, m), M(n, l));
    n = w(M(n, m), M(o, -l)), o = p;
  }
  return { right: o, up: n, forward: e };
}
function Q(a, t, e, r) {
  const { right: o, up: n, forward: s } = H(t), m = A(a, t.position), l = g(m, s);
  if (l <= Math.max(1e-4, t.near || 0.01) || l >= (t.far || 1e4)) return null;
  const p = g(m, o), i = g(m, n);
  if (t.camera_type === "orthographic") {
    const u = 5 / Math.max(0.01, t.zoom || 1), _ = u * e / Math.max(1, r);
    return [e * (0.5 + p / (2 * _)), r * (0.5 - i / (2 * u)), l];
  }
  const c = 0.5 * r / Math.tan(Math.max(1e-3, t.fov) * Math.PI / 360);
  return [e * 0.5 + p * c / l, r * 0.5 - i * c / l, l];
}
function P(a, t, e) {
  const r = ((t - a + 540) % 360 + 360) % 360 - 180;
  return a + r * e;
}
function X(a, t) {
  const e = a.keyframes || [];
  if (!e.length) return d(a.camera || N());
  if (t <= e[0].frame) return d(e[0].camera);
  if (t >= e[e.length - 1].frame) return d(e[e.length - 1].camera);
  let r = e[0], o = e[e.length - 1];
  for (let s = 0; s < e.length - 1; s++) if (e[s].frame <= t && t <= e[s + 1].frame) {
    r = e[s], o = e[s + 1];
    break;
  }
  const n = S((t - r.frame) / Math.max(1, o.frame - r.frame), r.interpolation);
  return { position: x(r.camera.position, o.camera.position, n), target: x(r.camera.target, o.camera.target, n), fov: y(r.camera.fov, o.camera.fov, n), roll: P(r.camera.roll || 0, o.camera.roll || 0, n), camera_type: n < 1 ? r.camera.camera_type : o.camera.camera_type, zoom: y(r.camera.zoom || 1, o.camera.zoom || 1, n), near: y(r.camera.near || 0.01, o.camera.near || 0.01, n), far: y(r.camera.far || 1e4, o.camera.far || 1e4, n) };
}
export {
  $ as TANGENT_MODES,
  w as add,
  G as annotatedAssetUrl,
  K as bezierEaseWithHandles,
  H as cameraBasis,
  f as clamp,
  d as cloneCamera,
  b as cloneTransform,
  J as configureCore,
  z as cross,
  N as defaultCamera,
  C as defaultEditorViews,
  F as defaultHandles,
  R as defaultState,
  V as distanceToSegment,
  g as dot,
  S as ease,
  U as length,
  y as lerp,
  x as lerp3,
  P as lerpAngle,
  M as mul,
  k as norm,
  Q as project,
  O as resolveHandles,
  T as rotateEuler,
  X as sampleCamera,
  W as sampleObjectTransform,
  D as sanitizeState,
  A as sub,
  q as v3,
  L as worldTransform
};
