const s = /* @__PURE__ */ new Set([
  // Which camera the outliner has selected for editing, not which one the
  // playblast recorded (that is `playblast_camera_id`, always hashed).
  "active_camera_id",
  // Tool state: gizmo mode/space, snapping, navigation feel, selection mode.
  "select_mode",
  "gizmo_mode",
  "gizmo_space",
  "navigation_profile",
  "spatial_snap_mode",
  "spatial_grid_size",
  "snap_enabled",
  "snap_frames",
  // Viewport chrome: which panel layout, which view is showing, panel density.
  "ui_density",
  "editor_views",
  "view_mode",
  "camera_view_visible",
  "timecode_mode",
  "loop_playback",
  "playback_range",
  // Bookkeeping that carries no scene geometry.
  "schema_version",
  "reference_index",
  "markers"
]), p = /* @__PURE__ */ new Set([
  "playblast",
  "playblast_camera_id",
  "playblast_camera_name",
  "motion_scene_fingerprint_live"
]);
function i(t) {
  if (!t || typeof t != "object") return t;
  const { recording_path: o, ...e } = t;
  return e;
}
function c(t) {
  if (Array.isArray(t)) return t.map(c);
  if (t && typeof t == "object") {
    const o = {};
    for (const e of Object.keys(t).sort()) o[e] = c(t[e]);
    return o;
  }
  return t;
}
function m(t) {
  const o = t && typeof t == "object" ? t : {}, e = {};
  for (const n of Object.keys(o))
    s.has(n) || (e[n] = o[n]);
  const r = { ...e.metadata && typeof e.metadata == "object" ? e.metadata : {} };
  for (const n of p) delete r[n];
  return e.metadata = r, Array.isArray(e.cameras) && (e.cameras = e.cameras.map(i)), e.sequence && (e.sequence = i(e.sequence)), e;
}
function f(t) {
  let o = 2166136261;
  for (let e = 0; e < t.length; e += 1)
    o ^= t.charCodeAt(e), o = Math.imul(o, 16777619);
  return (o >>> 0).toString(16).padStart(8, "0");
}
function _(t) {
  return f(JSON.stringify(c(m(t))));
}
let a = { json: null, value: null };
function u(t) {
  const o = typeof t == "string" ? t : "{}";
  if (o === a.json) return a.value;
  let e;
  try {
    e = JSON.parse(o);
  } catch {
    e = {};
  }
  const r = _(e && typeof e == "object" ? e : {});
  return a = { json: o, value: r }, r;
}
const b = `
  --oc-bg-app: var(--bg-color, #0B1018);
  --oc-bg-panel: var(--comfy-menu-bg, #111827);
  --oc-bg-control: var(--comfy-input-bg, #151D2A);
  --oc-bg-sunken: var(--comfy-input-bg, #080C14);
  --oc-border-default: var(--border-color, #263143);
  --oc-border-subtle: var(--border-color, #1B2433);
  --oc-text-primary: var(--input-text, #E9EDF5);
  --oc-text-secondary: var(--input-text, #8F9AAF);
  --oc-text-muted: var(--input-text, #98A3B8);
`, d = "0.4.0", l = {
  version: d
}, y = l.version;
export {
  b as H,
  y as O,
  u as a,
  _ as m
};
