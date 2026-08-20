import { clamp as i } from "./omnicam-core.js";
import { t as b } from "./omnicam-i18n.js";
function S(e, t) {
  const r = Math.max(1, e.state.duration_frames - 1), n = i(Number(e.timelineZoom) || 1, 0.1, 50), l = Number(e.timelinePan) || 0, m = r / n;
  return (t - l) / Math.max(1e-6, m) * 100;
}
function y(e, t, r) {
  const n = r.getBoundingClientRect(), l = Math.max(1, e.state.duration_frames - 1), m = i(Number(e.timelineZoom) || 1, 0.1, 50), p = Number(e.timelinePan) || 0, s = l / m, o = (t.clientX - n.left) / Math.max(1, n.width);
  return i(Math.round(p + o * s), 0, l);
}
function F(e, t) {
  t.preventDefault(), t.stopPropagation();
  const r = Math.max(1, e.state.duration_frames - 1), n = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey)
    e.timelinePan = i((Number(e.timelinePan) || 0) + (t.deltaY > 0 ? 4 : -4), -r * 0.5, r);
  else {
    const m = t.currentTarget.getBoundingClientRect(), p = (t.clientX - m.left) / Math.max(1, m.width), s = i(Number(e.timelineZoom) || 1, 0.2, 30), o = i(s * n, 0.2, 30), c = r / s, a = r / o, f = (Number(e.timelinePan) || 0) + p * c;
    e.timelinePan = i(f - p * a, -r * 0.5, r), e.timelineZoom = o;
  }
  e.refreshKeys(), e.setStatus(b(`Timeline zoom: ${(e.timelineZoom * 100).toFixed(0)}%`));
}
function I(e) {
  e.timelineZoom = 1, e.timelinePan = 0, e.refreshKeys(), e.setStatus(b("Timeline view fitted"));
}
function M(e, t) {
  if (t.target.closest?.(".key")) return;
  t.preventDefault(), t.stopPropagation(), e.exitKeyEdit(!0);
  const r = t.currentTarget;
  if (r.focus({ preventScroll: !0 }), r.setPointerCapture?.(t.pointerId), t.button === 1 || t.altKey || t.button === 2) {
    e.timelinePanDrag = {
      startX: t.clientX,
      origPan: Number(e.timelinePan) || 0,
      pointerId: t.pointerId
    };
    return;
  }
  if (t.shiftKey) {
    const n = r.getBoundingClientRect();
    e.boxSelect = { box: r, pointerId: t.pointerId, startX: t.clientX - n.left, currentX: t.clientX - n.left };
    return;
  }
  e.selectedKeyFrames = null, e.timelineDrag = { box: r, pointerId: t.pointerId }, e.setFrame(y(e, t, r));
}
function X(e, t) {
  if (e.timelinePanDrag && t.pointerId === e.timelinePanDrag.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const r = t.clientX - e.timelinePanDrag.startX, n = e.root.querySelector('[data-role="keys"]'), m = Math.max(1, e.state.duration_frames - 1) / (Number(e.timelineZoom) || 1);
    e.timelinePan = e.timelinePanDrag.origPan - r / Math.max(1, n.clientWidth) * m, e.refreshKeys();
    return;
  }
  if (e.boxSelect && t.pointerId === e.boxSelect.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const r = e.boxSelect.box.getBoundingClientRect();
    e.boxSelect.currentX = t.clientX - r.left;
    let n = e.boxSelect.overlay;
    n || (n = document.createElement("div"), n.className = "box-select", e.boxSelect.box.appendChild(n), e.boxSelect.overlay = n);
    const l = Math.min(e.boxSelect.startX, e.boxSelect.currentX);
    n.style.left = `${l}px`, n.style.width = `${Math.abs(e.boxSelect.currentX - e.boxSelect.startX)}px`, n.style.top = "0", n.style.bottom = "0";
    return;
  }
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.setFrame(y(e, t, e.timelineDrag.box)));
}
function K(e, t) {
  if (e.timelinePanDrag && t.pointerId === e.timelinePanDrag.pointerId) {
    e.timelinePanDrag = null;
    return;
  }
  if (e.boxSelect && t.pointerId === e.boxSelect.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const r = e.boxSelect.box.getBoundingClientRect(), n = Math.max(1, e.state.duration_frames - 1), l = i(Number(e.timelineZoom) || 1, 0.1, 50), m = Number(e.timelinePan) || 0, p = n / l, s = (f) => i(m + f / Math.max(1, r.width) * p, 0, n), o = Math.min(s(e.boxSelect.startX), s(e.boxSelect.currentX)), c = Math.max(s(e.boxSelect.startX), s(e.boxSelect.currentX));
    e.boxSelect.overlay?.remove(), e.boxSelect = null;
    const a = e.timelineKeyframes().filter((f) => f.frame >= o && f.frame <= c).map((f) => f.frame);
    a.length && (e.selectedKeyFrames = new Set(a), e.selectedKeyFrame = a[0], e.updateKeyVisualState(), e.refreshKeyEditor(), e.setStatus(b(`${a.length} keys selected`)));
    return;
  }
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.timelineDrag.box.hasPointerCapture?.(t.pointerId) && e.timelineDrag.box.releasePointerCapture(t.pointerId), e.timelineDrag = null);
}
function N(e, t) {
  const r = e.keyDrag;
  if (!r) return;
  const n = r.box.getBoundingClientRect(), l = Math.max(1, e.state.duration_frames - 1), m = i(Number(e.timelineZoom) || 1, 0.1, 50), p = Number(e.timelinePan) || 0, s = l / m;
  let o = Math.round(i(p + (t.clientX - n.left) / Math.max(1, n.width) * s, 0, l));
  o = e.snapFrame(o);
  const c = o - r.startPointerFrame;
  let a = r.badge;
  a || (a = document.createElement("div"), a.className = "floating-retime-badge", r.box.appendChild(a), r.badge = a);
  const f = S(e, o);
  if (a.style.left = `${f}%`, a.textContent = r.isDuplicate ? `+Copy F${o}` : `F${o}${c !== 0 ? ` (${c > 0 ? "+" : ""}${c})` : ""}`, r.moving && r.moving.length > 1) {
    if (c === r.lastDelta) return;
    r.lastDelta = c;
    const x = e.timelineKeyframes(), h = new Set(x.filter((d) => !e.selectedKeyFrames.has(d.frame)).map((d) => d.frame));
    for (const d of r.moving) {
      let g = i(d.startFrame + c, 0, e.state.duration_frames - 1);
      for (; h.has(g) && g > 0 && g < e.state.duration_frames - 1; ) g += Math.sign(c || 1);
      d.key.frame = h.has(g) ? d.key.frame : g;
    }
    x.sort((d, g) => d.frame - g.frame), e.editingKeyFrame = r.key.frame, e.scheduleSerialize(), e.setFrame(r.key.frame, !1, !0);
    return;
  }
  o !== r.key.frame && (e.editingKeyFrame = r.key.frame, e.retimeSelectedKey(o, !0));
}
export {
  N as onKeyDragMove,
  M as onTimelinePointerDown,
  X as onTimelinePointerMove,
  K as onTimelinePointerUp,
  F as onTimelineWheel,
  I as resetTimelineZoom,
  y as timelineFrameFromEvent,
  S as timelinePercentForFrame
};
