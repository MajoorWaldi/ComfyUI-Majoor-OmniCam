function g(o) {
  return (e) => {
    if (!e.ctrlKey)
      for (let t = e.composedPath?.()[0] || e.target; t && t !== o; t = t.parentNode) {
        if (!(t instanceof HTMLElement)) continue;
        const n = getComputedStyle(t);
        if (/(auto|scroll)/.test(n.overflowY) && t.scrollHeight - t.clientHeight > 1) {
          const r = t.scrollTop <= 0, a = t.scrollTop + t.clientHeight >= t.scrollHeight - 1;
          (e.deltaY < 0 && !r || e.deltaY > 0 && !a) && e.stopPropagation();
          return;
        }
        if (/(auto|scroll)/.test(n.overflowX) && t.scrollWidth - t.clientWidth > 1 && e.deltaX !== 0) {
          e.stopPropagation();
          return;
        }
      }
  };
}
function s(o) {
  return o instanceof HTMLImageElement || o instanceof HTMLVideoElement || o instanceof HTMLCanvasElement;
}
function m(o) {
  const e = o?.element;
  return e ? s(e) ? e : e.querySelector?.("img, video, canvas") ?? null : null;
}
function p(o) {
  if (!o) return null;
  const e = o.imgs;
  if (Array.isArray(e) && e.length) {
    const t = typeof o.imageIndex == "number" ? o.imageIndex : e.length - 1, n = e[Math.max(0, Math.min(e.length - 1, t))] ?? e[e.length - 1] ?? null;
    if (s(n)) return n;
  }
  for (const t of o.widgets || []) {
    const n = m(t);
    if (n) return n;
  }
  return null;
}
function d(o) {
  return o instanceof HTMLVideoElement ? [o.videoWidth, o.videoHeight] : o instanceof HTMLImageElement ? [o.naturalWidth, o.naturalHeight] : [o.width, o.height];
}
async function x(o, e, t = 512) {
  if (!o || !e) return !1;
  if (o instanceof HTMLImageElement && !o.complete)
    try {
      await o.decode?.();
    } catch {
    }
  if (o instanceof HTMLVideoElement && o.readyState < 2) return !1;
  const [n, r] = d(o);
  if (!n || !r) return !1;
  const a = Math.min(1, t / Math.max(n, r)), i = Math.max(1, Math.round(n * a)), c = Math.max(1, Math.round(r * a));
  e.width = i, e.height = c;
  const l = e.getContext("2d");
  return l ? (l.drawImage(o, 0, 0, i, c), !0) : !1;
}
function u(o, e) {
  if (!o || e == null) return null;
  if (typeof e == "object") return e;
  const t = o.links;
  return t?.get?.(e) ?? t?.[e] ?? null;
}
function h(o, e) {
  const t = u(o, e), n = t?.origin_id ?? t?.originId;
  if (n == null) return null;
  const r = o?.getNodeById?.(n);
  return r || ((o?._nodes || o?.nodes || []).find((a) => String(a?.id) === String(n)) ?? null);
}
const f = '<svg class="oc-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle class="oc-mark-disc" cx="16" cy="16" r="16"/><circle class="oc-mark-ring" cx="16" cy="16" r="7.6"/><circle class="oc-mark-core" cx="16" cy="16" r="5.8"/></svg>';
function b(o) {
  return `<div class="oc-heading"><span class="oc-brand">${f}</span><span class="oc-title">${o}</span></div>`;
}
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
`;
export {
  w as S,
  b,
  x as d,
  u as g,
  h as l,
  g as p,
  p as u
};
