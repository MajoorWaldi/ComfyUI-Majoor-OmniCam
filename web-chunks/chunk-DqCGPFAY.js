const s = '<svg class="oc-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle class="oc-mark-ring" cx="16" cy="16" r="10"/><circle class="oc-mark-core" cx="16" cy="16" r="3.5"/></svg>';
function _(e) {
  return `<div class="oc-heading"><span class="oc-brand">${s}</span><span class="oc-title">${e}</span></div>`;
}
const i = /* @__PURE__ */ new Set([
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
]), d = /* @__PURE__ */ new Set(["playblast", "playblast_camera_id", "playblast_camera_name"]);
function o(e) {
  if (!e || typeof e != "object") return e;
  const { recording_path: t, ...a } = e;
  return a;
}
function n(e) {
  if (Array.isArray(e)) return e.map(n);
  if (e && typeof e == "object") {
    const t = {};
    for (const a of Object.keys(e).sort()) t[a] = n(e[a]);
    return t;
  }
  return e;
}
function m(e) {
  const t = e && typeof e == "object" ? e : {}, a = {};
  for (const r of Object.keys(t))
    i.has(r) || (a[r] = t[r]);
  const c = { ...a.metadata && typeof a.metadata == "object" ? a.metadata : {} };
  for (const r of d) delete c[r];
  return a.metadata = c, Array.isArray(a.cameras) && (a.cameras = a.cameras.map(o)), a.sequence && (a.sequence = o(a.sequence)), a;
}
function p(e) {
  let t = 2166136261;
  for (let a = 0; a < e.length; a += 1)
    t ^= e.charCodeAt(a), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, "0");
}
function f(e) {
  return p(JSON.stringify(n(m(e))));
}
export {
  _ as b,
  f as m
};
