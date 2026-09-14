const w = `
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
  .majoor-omnicam .oc-path-diagnostics{display:flex;flex-direction:column;gap:3px;margin:2px 0 6px;font-size:11px;line-height:1.35}
  .majoor-omnicam .oc-diagnostic{color:var(--oc-text-dim)}
  .majoor-omnicam .oc-diagnostic-warning{color:var(--oc-warn-text)}
  .majoor-omnicam .oc-diagnostic-notice{color:var(--oc-text-dim)}
  .majoor-omnicam .oc-diagnostic-info{color:var(--oc-text-faint)}
  .majoor-omnicam .oc-diagnostic-ok{color:var(--oc-text-faint)}
`, p = '<svg class="oc-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle class="oc-mark-disc" cx="16" cy="16" r="16"/><circle class="oc-mark-ring" cx="16" cy="16" r="7.6"/><circle class="oc-mark-core" cx="16" cy="16" r="5.8"/></svg>';
function _(o) {
  return `<div class="oc-heading"><span class="oc-brand">${p}</span><span class="oc-title">${o}</span></div>`;
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
function d(o) {
  if (!o || typeof o != "object") return o;
  const { recording_path: t, ...e } = o;
  return e;
}
function c(o) {
  if (Array.isArray(o)) return o.map(c);
  if (o && typeof o == "object") {
    const t = {};
    for (const e of Object.keys(o).sort()) t[e] = c(o[e]);
    return t;
  }
  return o;
}
function x(o) {
  const t = o && typeof o == "object" ? o : {}, e = {};
  for (const r of Object.keys(t))
    u.has(r) || (e[r] = t[r]);
  const n = { ...e.metadata && typeof e.metadata == "object" ? e.metadata : {} };
  for (const r of g) delete n[r];
  return e.metadata = n, Array.isArray(e.cameras) && (e.cameras = e.cameras.map(d)), e.sequence && (e.sequence = d(e.sequence)), e;
}
function b(o) {
  let t = 2166136261;
  for (let e = 0; e < o.length; e += 1)
    t ^= o.charCodeAt(e), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, "0");
}
function h(o) {
  return b(JSON.stringify(c(x(o))));
}
let i = { json: null, value: null };
function v(o) {
  const t = typeof o == "string" ? o : "{}";
  if (t === i.json) return i.value;
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    e = {};
  }
  const n = h(e && typeof e == "object" ? e : {});
  return i = { json: t, value: n }, n;
}
function M(o) {
  return (t) => {
    if (!t.ctrlKey)
      for (let e = t.composedPath?.()[0] || t.target; e && e !== o; e = e.parentNode) {
        if (!(e instanceof HTMLElement)) continue;
        const n = getComputedStyle(e);
        if (/(auto|scroll)/.test(n.overflowY) && e.scrollHeight - e.clientHeight > 1) {
          const r = e.scrollTop <= 0, a = e.scrollTop + e.clientHeight >= e.scrollHeight - 1;
          (t.deltaY < 0 && !r || t.deltaY > 0 && !a) && t.stopPropagation();
          return;
        }
        if (/(auto|scroll)/.test(n.overflowX) && e.scrollWidth - e.clientWidth > 1 && t.deltaX !== 0) {
          t.stopPropagation();
          return;
        }
      }
  };
}
function y(o, t) {
  if (!o || t == null) return null;
  if (typeof t == "object") return t;
  const e = o.links;
  return e?.get?.(t) ?? e?.[t] ?? null;
}
function S(o, t) {
  const e = y(o, t), n = e?.origin_id ?? e?.originId;
  if (n == null) return null;
  const r = o?.getNodeById?.(n);
  return r || ((o?._nodes || o?.nodes || []).find((a) => String(a?.id) === String(n)) ?? null);
}
function f(o) {
  return o instanceof HTMLImageElement || o instanceof HTMLVideoElement || o instanceof HTMLCanvasElement;
}
function k(o) {
  const t = o?.element;
  return t ? f(t) ? t : t.querySelector?.("img, video, canvas") ?? null : null;
}
function H(o) {
  if (!o) return null;
  const t = o.imgs;
  if (Array.isArray(t) && t.length) {
    const e = typeof o.imageIndex == "number" ? o.imageIndex : t.length - 1, n = t[Math.max(0, Math.min(t.length - 1, e))] ?? t[t.length - 1] ?? null;
    if (f(n)) return n;
  }
  for (const e of o.widgets || []) {
    const n = k(e);
    if (n) return n;
  }
  return null;
}
function j(o) {
  return o instanceof HTMLVideoElement ? [o.videoWidth, o.videoHeight] : o instanceof HTMLImageElement ? [o.naturalWidth, o.naturalHeight] : [o.width, o.height];
}
async function E(o, t, e = 512) {
  if (!o || !t) return !1;
  if (o instanceof HTMLImageElement && !o.complete)
    try {
      await o.decode?.();
    } catch {
    }
  if (o instanceof HTMLVideoElement && o.readyState < 2) return !1;
  const [n, r] = j(o);
  if (!n || !r) return !1;
  const a = Math.min(1, e / Math.max(n, r)), s = Math.max(1, Math.round(n * a)), l = Math.max(1, Math.round(r * a));
  t.width = s, t.height = l;
  const m = t.getContext("2d");
  return m ? (m.drawImage(o, 0, 0, s, l), !0) : !1;
}
export {
  w as S,
  v as a,
  _ as b,
  E as d,
  y as g,
  S as l,
  h as m,
  M as p,
  H as u
};
