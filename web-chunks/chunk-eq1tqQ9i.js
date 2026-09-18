function c(t) {
  return t instanceof HTMLImageElement || t instanceof HTMLVideoElement || t instanceof HTMLCanvasElement;
}
function f(t) {
  const n = t?.element;
  return n ? c(n) ? n : n.querySelector?.("img, video, canvas") ?? null : null;
}
function g(t) {
  if (!t) return null;
  const n = t.imgs;
  if (Array.isArray(n) && n.length) {
    const r = typeof t.imageIndex == "number" ? t.imageIndex : n.length - 1, e = n[Math.max(0, Math.min(n.length - 1, r))] ?? n[n.length - 1] ?? null;
    if (c(e)) return e;
  }
  for (const r of t.widgets || []) {
    const e = f(r);
    if (e) return e;
  }
  return null;
}
function a(t) {
  return t instanceof HTMLVideoElement ? [t.videoWidth, t.videoHeight] : t instanceof HTMLImageElement ? [t.naturalWidth, t.naturalHeight] : [t.width, t.height];
}
async function h(t, n, r = 512) {
  if (!t || !n) return !1;
  if (t instanceof HTMLImageElement && !t.complete)
    try {
      await t.decode?.();
    } catch {
    }
  if (t instanceof HTMLVideoElement && t.readyState < 2) return !1;
  const [e, i] = a(t);
  if (!e || !i) return !1;
  const o = Math.min(1, r / Math.max(e, i)), u = Math.max(1, Math.round(e * o)), s = Math.max(1, Math.round(i * o));
  n.width = u, n.height = s;
  const l = n.getContext("2d");
  return l ? (l.drawImage(t, 0, 0, u, s), !0) : !1;
}
function d(t, n) {
  if (!t || n == null) return null;
  if (typeof n == "object") return n;
  const r = t.links;
  return r?.get?.(n) ?? r?.[n] ?? null;
}
function m(t, n) {
  const r = d(t, n), e = r?.origin_id ?? r?.originId;
  if (e == null) return null;
  const i = t?.getNodeById?.(e);
  return i || ((t?._nodes || t?.nodes || []).find((o) => String(o?.id) === String(e)) ?? null);
}
export {
  h as d,
  d as g,
  m as l,
  g as u
};
