const c = /* @__PURE__ */ new Set([
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
]), m = /* @__PURE__ */ new Set([
  "playblast",
  "playblast_camera_id",
  "playblast_camera_name",
  "motion_scene_fingerprint_live"
]);
function s(t) {
  if (!t || typeof t != "object") return t;
  const { recording_path: n, ...e } = t;
  return e;
}
function i(t) {
  if (Array.isArray(t)) return t.map(i);
  if (t && typeof t == "object") {
    const n = {};
    for (const e of Object.keys(t).sort()) n[e] = i(t[e]);
    return n;
  }
  return t;
}
function p(t) {
  const n = t && typeof t == "object" ? t : {}, e = {};
  for (const o of Object.keys(n))
    c.has(o) || (e[o] = n[o]);
  const r = { ...e.metadata && typeof e.metadata == "object" ? e.metadata : {} };
  for (const o of m) delete r[o];
  return e.metadata = r, Array.isArray(e.cameras) && (e.cameras = e.cameras.map(s)), e.sequence && (e.sequence = s(e.sequence)), e;
}
function _(t) {
  let n = 2166136261;
  for (let e = 0; e < t.length; e += 1)
    n ^= t.charCodeAt(e), n = Math.imul(n, 16777619);
  return (n >>> 0).toString(16).padStart(8, "0");
}
function f(t) {
  return _(JSON.stringify(i(p(t))));
}
let a = { json: null, value: null };
function d(t) {
  const n = typeof t == "string" ? t : "{}";
  if (n === a.json) return a.value;
  let e;
  try {
    e = JSON.parse(n);
  } catch {
    e = {};
  }
  const r = f(e && typeof e == "object" ? e : {});
  return a = { json: n, value: r }, r;
}
export {
  f as a,
  d as m
};
