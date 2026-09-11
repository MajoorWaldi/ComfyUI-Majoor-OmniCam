const _ = `
  .majoor-omnicam{
    --oc-bg:#111214;--oc-panel:#18191c;--oc-panel-2:#202126;--oc-sunken:#0d0e10;
    --oc-line:#303136;--oc-line-soft:#27282d;
    --oc-text:#e6e7ea;--oc-text-dim:#9699a2;--oc-text-faint:#656872;
    --oc-accent:#8d7ee8;--oc-accent-soft:rgba(141,126,232,.18);--oc-accent-ink:#fff;
    --oc-ok:#58a56a;--oc-ok-bg:#18251c;--oc-ok-line:#315c3a;--oc-ok-text:#8bc997;
    --oc-warn:#d6a04d;--oc-warn-bg:#282116;--oc-warn-line:#66502b;--oc-warn-text:#e7bd79;
    --oc-danger:#d85b61;--oc-danger-bg:#29191b;--oc-danger-line:#6c393d;--oc-danger-text:#ee9296;
    --oc-info:#5d91d8;--oc-radius:8px;--oc-radius-sm:6px;
    font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    background:var(--oc-bg);border-color:var(--oc-line);color:var(--oc-text);
  }
  .majoor-omnicam *{box-sizing:border-box}
  .majoor-omnicam *::-webkit-scrollbar{width:6px;height:6px}
  .majoor-omnicam *::-webkit-scrollbar-track{background:rgba(0,0,0,.3);border-radius:3px}
  .majoor-omnicam *::-webkit-scrollbar-thumb{background:#444456;border-radius:3px}
  .majoor-omnicam button:focus-visible,.majoor-omnicam input:focus-visible,
  .majoor-omnicam select:focus-visible,.majoor-omnicam [tabindex]:focus-visible{
    outline:2px solid var(--oc-accent);outline-offset:2px;
  }
  .majoor-omnicam .oc-header{display:flex;align-items:center;gap:9px;padding:9px 12px;background:var(--oc-panel);border-bottom:1px solid var(--oc-line)}
  .majoor-omnicam .oc-heading{display:flex;align-items:center;gap:9px;min-width:0}
  .majoor-omnicam .oc-brand{display:flex;align-items:center;justify-content:center;flex:none;width:26px;height:26px;border-radius:6px;background:transparent;border:0;color:var(--oc-text);line-height:0}
  .majoor-omnicam .oc-title{font-size:14px;font-weight:650;letter-spacing:.01em}
  .majoor-omnicam .oc-mark{display:block;width:20px;height:20px}.majoor-omnicam .oc-mark-disc{fill:#031228}.majoor-omnicam .oc-mark-ring{fill:#f7f6ff}.majoor-omnicam .oc-mark-core{fill:#8873fd}
  .majoor-omnicam .oc-status-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:999px;background:var(--oc-ok-bg);border:1px solid var(--oc-ok-line);color:var(--oc-ok-text);font-size:11px;font-weight:600;white-space:nowrap}
  .majoor-omnicam .oc-status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
  .majoor-omnicam .oc-card{display:flex;flex-direction:column;gap:6px;padding:9px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius)}
  .majoor-omnicam .oc-section{color:var(--oc-text-faint);font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}
  .majoor-omnicam .oc-field-row{display:flex;align-items:center;gap:6px}
  .majoor-omnicam .oc-empty{padding:12px;border:1px dashed var(--oc-line);border-radius:var(--oc-radius-sm);color:var(--oc-text-dim);text-align:center}
`, p = '<svg class="oc-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle class="oc-mark-disc" cx="16" cy="16" r="16"/><circle class="oc-mark-ring" cx="16" cy="16" r="7.6"/><circle class="oc-mark-core" cx="16" cy="16" r="5.8"/></svg>';
function j(e) {
  return `<div class="oc-heading"><span class="oc-brand">${p}</span><span class="oc-title">${e}</span></div>`;
}
const u = /* @__PURE__ */ new Set([
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
]), g = /* @__PURE__ */ new Set([
  "playblast",
  "playblast_camera_id",
  "playblast_camera_name",
  "motion_scene_fingerprint_live"
]);
function m(e) {
  if (!e || typeof e != "object") return e;
  const { recording_path: t, ...o } = e;
  return o;
}
function c(e) {
  if (Array.isArray(e)) return e.map(c);
  if (e && typeof e == "object") {
    const t = {};
    for (const o of Object.keys(e).sort()) t[o] = c(e[o]);
    return t;
  }
  return e;
}
function x(e) {
  const t = e && typeof e == "object" ? e : {}, o = {};
  for (const r of Object.keys(t))
    u.has(r) || (o[r] = t[r]);
  const n = { ...o.metadata && typeof o.metadata == "object" ? o.metadata : {} };
  for (const r of g) delete n[r];
  return o.metadata = n, Array.isArray(o.cameras) && (o.cameras = o.cameras.map(m)), o.sequence && (o.sequence = m(o.sequence)), o;
}
function b(e) {
  let t = 2166136261;
  for (let o = 0; o < e.length; o += 1)
    t ^= e.charCodeAt(o), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, "0");
}
function h(e) {
  return b(JSON.stringify(c(x(e))));
}
let i = { json: null, value: null };
function v(e) {
  const t = typeof e == "string" ? e : "{}";
  if (t === i.json) return i.value;
  let o;
  try {
    o = JSON.parse(t);
  } catch {
    o = {};
  }
  const n = h(o && typeof o == "object" ? o : {});
  return i = { json: t, value: n }, n;
}
function M(e) {
  return (t) => {
    if (!t.ctrlKey)
      for (let o = t.composedPath?.()[0] || t.target; o && o !== e; o = o.parentNode) {
        if (!(o instanceof HTMLElement)) continue;
        const n = getComputedStyle(o);
        if (/(auto|scroll)/.test(n.overflowY) && o.scrollHeight - o.clientHeight > 1) {
          const r = o.scrollTop <= 0, a = o.scrollTop + o.clientHeight >= o.scrollHeight - 1;
          (t.deltaY < 0 && !r || t.deltaY > 0 && !a) && t.stopPropagation();
          return;
        }
        if (/(auto|scroll)/.test(n.overflowX) && o.scrollWidth - o.clientWidth > 1 && t.deltaX !== 0) {
          t.stopPropagation();
          return;
        }
      }
  };
}
function y(e, t) {
  if (!e || t == null) return null;
  if (typeof t == "object") return t;
  const o = e.links;
  return o?.get?.(t) ?? o?.[t] ?? null;
}
function S(e, t) {
  const o = y(e, t), n = o?.origin_id ?? o?.originId;
  if (n == null) return null;
  const r = e?.getNodeById?.(n);
  return r || ((e?._nodes || e?.nodes || []).find((a) => String(a?.id) === String(n)) ?? null);
}
function f(e) {
  return e instanceof HTMLImageElement || e instanceof HTMLVideoElement || e instanceof HTMLCanvasElement;
}
function k(e) {
  const t = e?.element;
  return t ? f(t) ? t : t.querySelector?.("img, video, canvas") ?? null : null;
}
function H(e) {
  if (!e) return null;
  const t = e.imgs;
  if (Array.isArray(t) && t.length) {
    const o = typeof e.imageIndex == "number" ? e.imageIndex : t.length - 1, n = t[Math.max(0, Math.min(t.length - 1, o))] ?? t[t.length - 1] ?? null;
    if (f(n)) return n;
  }
  for (const o of e.widgets || []) {
    const n = k(o);
    if (n) return n;
  }
  return null;
}
function w(e) {
  return e instanceof HTMLVideoElement ? [e.videoWidth, e.videoHeight] : e instanceof HTMLImageElement ? [e.naturalWidth, e.naturalHeight] : [e.width, e.height];
}
async function E(e, t, o = 512) {
  if (!e || !t) return !1;
  if (e instanceof HTMLImageElement && !e.complete)
    try {
      await e.decode?.();
    } catch {
    }
  if (e instanceof HTMLVideoElement && e.readyState < 2) return !1;
  const [n, r] = w(e);
  if (!n || !r) return !1;
  const a = Math.min(1, o / Math.max(n, r)), s = Math.max(1, Math.round(n * a)), l = Math.max(1, Math.round(r * a));
  t.width = s, t.height = l;
  const d = t.getContext("2d");
  return d ? (d.drawImage(e, 0, 0, s, l), !0) : !1;
}
export {
  _ as S,
  v as a,
  j as b,
  E as d,
  y as g,
  S as l,
  h as m,
  M as p,
  H as u
};
