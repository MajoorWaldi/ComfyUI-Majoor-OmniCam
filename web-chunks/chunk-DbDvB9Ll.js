import { O as m, H as d } from "./chunk-Bu3EGLOJ.js";
import { bQ as p } from "./chunk-Cg3_Iw1A.js";
function w(o) {
  return (t) => {
    if (!t.ctrlKey)
      for (let r = t.composedPath?.()[0] || t.target; r && r !== o; r = r.parentNode) {
        if (!(r instanceof HTMLElement)) continue;
        const e = getComputedStyle(r);
        if (/(auto|scroll)/.test(e.overflowY) && r.scrollHeight - r.clientHeight > 1) {
          const n = r.scrollTop <= 0, i = r.scrollTop + r.clientHeight >= r.scrollHeight - 1;
          (t.deltaY < 0 && !n || t.deltaY > 0 && !i) && t.stopPropagation();
          return;
        }
        if (/(auto|scroll)/.test(e.overflowX) && r.scrollWidth - r.clientWidth > 1 && t.deltaX !== 0) {
          t.stopPropagation();
          return;
        }
      }
  };
}
function l(o) {
  return o instanceof HTMLImageElement || o instanceof HTMLVideoElement || o instanceof HTMLCanvasElement;
}
function u(o) {
  const t = o?.element;
  return t ? l(t) ? t : t.querySelector?.("img, video, canvas") ?? null : null;
}
function v(o) {
  if (!o) return null;
  const t = o.imgs;
  if (Array.isArray(t) && t.length) {
    const r = typeof o.imageIndex == "number" ? o.imageIndex : t.length - 1, e = t[Math.max(0, Math.min(t.length - 1, r))] ?? t[t.length - 1] ?? null;
    if (l(e)) return e;
  }
  for (const r of o.widgets || []) {
    const e = u(r);
    if (e) return e;
  }
  return null;
}
function f(o) {
  return o instanceof HTMLVideoElement ? [o.videoWidth, o.videoHeight] : o instanceof HTMLImageElement ? [o.naturalWidth, o.naturalHeight] : [o.width, o.height];
}
async function j(o, t, r = 512) {
  if (!o || !t) return !1;
  if (o instanceof HTMLImageElement && !o.complete)
    try {
      await o.decode?.();
    } catch {
    }
  if (o instanceof HTMLVideoElement && o.readyState < 2) return !1;
  const [e, n] = f(o);
  if (!e || !n) return !1;
  const i = Math.min(1, r / Math.max(e, n)), a = Math.max(1, Math.round(e * i)), c = Math.max(1, Math.round(n * i));
  t.width = a, t.height = c;
  const s = t.getContext("2d");
  return s ? (s.drawImage(o, 0, 0, a, c), !0) : !1;
}
function g(o, t) {
  if (!o || t == null) return null;
  if (typeof t == "object") return t;
  const r = o.links;
  return r?.get?.(t) ?? r?.[t] ?? null;
}
function y(o, t) {
  const r = g(o, t), e = r?.origin_id ?? r?.originId;
  if (e == null) return null;
  const n = o?.getNodeById?.(e);
  return n || ((o?._nodes || o?.nodes || []).find((i) => String(i?.id) === String(e)) ?? null);
}
const x = '<svg class="oc-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle class="oc-mark-disc" cx="16" cy="16" r="16"/><circle class="oc-mark-ring" cx="16" cy="16" r="7.6"/><circle class="oc-mark-core" cx="16" cy="16" r="5.8"/></svg>';
function k(o) {
  return `<div class="oc-heading"><span class="oc-brand">${x}</span><span class="oc-title">${o}</span><span class="oc-version">v${m}</span></div>`;
}
const M = `
  .majoor-omnicam{
    ${p}
    ${d}
    --oc-radius:6px;--oc-radius-sm:4px;
    font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    background:var(--oc-bg-app);border-color:var(--oc-border-default);color:var(--oc-text-primary);
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
  .majoor-omnicam .oc-version{font-size:9px;font-weight:500;color:var(--oc-text-faint);white-space:nowrap;align-self:flex-end;margin-bottom:1px}
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
`;
export {
  M as S,
  k as b,
  j as d,
  g,
  y as l,
  w as p,
  v as u
};
