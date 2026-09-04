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
]), s = /* @__PURE__ */ new Set([
  "playblast",
  "playblast_camera_id",
  "playblast_camera_name",
  "motion_scene_fingerprint_live"
]);
function i(e) {
  if (!e || typeof e != "object") return e;
  const { recording_path: n, ...t } = e;
  return t;
}
function a(e) {
  if (Array.isArray(e)) return e.map(a);
  if (e && typeof e == "object") {
    const n = {};
    for (const t of Object.keys(e).sort()) n[t] = a(e[t]);
    return n;
  }
  return e;
}
function _(e) {
  const n = e && typeof e == "object" ? e : {}, t = {};
  for (const r of Object.keys(n))
    c.has(r) || (t[r] = n[r]);
  const o = { ...t.metadata && typeof t.metadata == "object" ? t.metadata : {} };
  for (const r of s) delete o[r];
  return t.metadata = o, Array.isArray(t.cameras) && (t.cameras = t.cameras.map(i)), t.sequence && (t.sequence = i(t.sequence)), t;
}
function m(e) {
  let n = 2166136261;
  for (let t = 0; t < e.length; t += 1)
    n ^= e.charCodeAt(t), n = Math.imul(n, 16777619);
  return (n >>> 0).toString(16).padStart(8, "0");
}
function f(e) {
  return m(JSON.stringify(a(_(e))));
}
export {
  f as m
};
