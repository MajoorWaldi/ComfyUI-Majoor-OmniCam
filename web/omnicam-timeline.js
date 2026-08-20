import { clamp as M, cloneTransform as w, cloneCamera as D } from "./omnicam-core.js";
import { t as d } from "./omnicam-i18n.js";
import { timelinePercentForFrame as c } from "./omnicam-timeline-interaction.js";
import { onKeyDragMove as j, onTimelinePointerDown as H, onTimelinePointerMove as q, onTimelinePointerUp as A, onTimelineWheel as Z, resetTimelineZoom as z, timelineFrameFromEvent as R } from "./omnicam-timeline-interaction.js";
import { curveChannels as B, drawCurveEditor as I, onCurvePointerDown as O, onCurvePointerMove as V, onCurvePointerUp as Y, onCurveWheel as G, resetCurveZoom as J, setChannelFilter as Q, setCurveInterpolation as X, setTangentMode as ee, toggleCurveHandles as te, zoomCurve as ae } from "./omnicam-curve-editor.js";
function L(t) {
  const m = t.root.querySelector('[data-role="keys"]');
  if (!m) return;
  m.innerHTML = "";
  const l = t.timelineObject(), y = t.timelineKeyframes(), h = Math.max(1, t.state.duration_frames - 1), K = M(Number(t.timelineZoom) || 1, 0.1, 50), S = Number(t.timelinePan) || 0, b = h / K, $ = S, x = Math.min(16, Math.max(3, Math.floor(m.clientWidth / 65) || 8));
  if (t.audioWaveformPeaks && t.audioWaveformPeaks.length) {
    const e = document.createElement("canvas");
    e.className = "timeline-waveform", e.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:0.35", e.width = Math.max(1, m.clientWidth || 600), e.height = Math.max(1, m.clientHeight || 68);
    const r = e.getContext("2d"), a = t.audioWaveformPeaks, o = e.width, s = e.height, F = s / 2;
    r.fillStyle = "#f2d06b";
    for (let n = 0; n < a.length; n++) {
      const f = (n / (a.length - 1) * h - $) / Math.max(1e-6, b) * o;
      if (f >= -5 && f <= o + 5) {
        const p = a[n] * (s * 0.85);
        r.fillRect(f, F - p / 2, Math.max(1, o / a.length * K - 0.5), p);
      }
    }
    m.appendChild(e);
  }
  if (t.state.playback_range) {
    const e = document.createElement("div");
    e.className = "playback-range";
    const r = c(t, t.state.playback_range[0]), a = c(t, t.state.playback_range[1]);
    e.style.left = `${r}%`, e.style.width = `${Math.max(0, a - r)}%`, m.appendChild(e);
  }
  for (let e = 0; e <= x; e++) {
    const r = Math.round($ + e * b / x);
    if (r < 0 || r > h) continue;
    const a = c(t, r);
    if (a < -2 || a > 102) continue;
    const o = document.createElement("span");
    o.className = "timeline-tick", o.textContent = String(r), o.style.left = `${a}%`, m.appendChild(o);
  }
  for (const e of t.state.markers || []) {
    const r = c(t, e.frame);
    if (r < -5 || r > 105) continue;
    const a = document.createElement("span");
    a.className = "timeline-marker", a.style.left = `${r}%`, a.style.setProperty("--marker-color", e.color), a.title = e.name, m.appendChild(a);
  }
  const g = c(t, t.frame);
  if (g >= -2 && g <= 102) {
    const e = document.createElement("span");
    e.className = "playhead", e.style.left = `${g}%`, m.appendChild(e);
  }
  const P = t.selectedKeyFrames || (t.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([t.selectedKeyFrame]));
  for (const e of y) {
    const r = c(t, e.frame);
    if (r < -5 || r > 105) continue;
    const a = document.createElement("button");
    a.type = "button", a.className = `key${e.frame === t.frame ? " at-playhead" : ""}${P.has(e.frame) ? " selected" : ""}${e.frame === t.editingKeyFrame ? " editing" : ""}`, a.dataset.keyFrame = String(e.frame), a.dataset.interp = e.interpolation || "ease", a.setAttribute("aria-label", d(`${l?.name || "Camera"} keyframe at frame ${e.frame}`)), a.title = d(`Frame ${e.frame} · ${e.interpolation} · Drag: Retime · Alt+Drag: Duplicate`), a.style.left = `${r}%`;
    const o = document.createElement("span");
    o.className = "key-label", o.textContent = String(e.frame), a.appendChild(o), a.addEventListener("pointerdown", (s) => {
      if (s.preventDefault(), s.stopPropagation(), a.focus({ preventScroll: !0 }), s.altKey) {
        t.checkpoint("Duplicate keyframe");
        const n = l ? { frame: e.frame, transform: w(e.transform), interpolation: e.interpolation } : { frame: e.frame, camera: D(e.camera), interpolation: e.interpolation }, v = t.timelineKeyframes();
        v.push(n), v.sort((f, p) => f.frame - p.frame), t.selectedKeyFrame = n.frame, t.selectedKeyFrames = /* @__PURE__ */ new Set([n.frame]), t.keyDrag = { key: n, box: m, isDuplicate: !0, moving: [{ key: n, startFrame: n.frame }], startPointerFrame: e.frame }, t.setFrame(n.frame, !1, !1), t.setStatus(d(`Duplicating key from ${e.frame}...`));
        return;
      }
      if (s.shiftKey) {
        t.selectedKeyFrames = new Set(t.selectedKeyFrames || [t.selectedKeyFrame].filter((n) => n !== null)), t.selectedKeyFrames.has(e.frame) ? t.selectedKeyFrames.delete(e.frame) : t.selectedKeyFrames.add(e.frame), t.selectedKeyFrame = e.frame, t.updateKeyVisualState(), t.refreshKeyEditor();
        return;
      }
      t.selectedKeyFrames?.has(e.frame) || (t.selectedKeyFrames = /* @__PURE__ */ new Set([e.frame])), t.selectedKeyFrame = e.frame;
      const F = t.timelineKeyframes().filter((n) => t.selectedKeyFrames.has(n.frame));
      t.keyDrag = { key: e, box: m, moving: F.map((n) => ({ key: n, startFrame: n.frame })), startPointerFrame: e.frame }, t.setFrame(e.frame, !1, !1);
    }), a.addEventListener("click", (s) => {
      s.preventDefault(), s.stopPropagation(), s.shiftKey || (t.selectedKeyFrames = /* @__PURE__ */ new Set([e.frame])), t.selectKeyframe(e);
    }), m.appendChild(a);
  }
  const k = t.activeCameraTrack(), i = t.root.querySelector('[data-role="timeline-summary"]');
  if (i) {
    i.replaceChildren();
    const e = document.createElement("span");
    e.style.fontWeight = "700", t.selectedEntity === "object" && l ? (e.style.color = "#38bdf8", e.textContent = `📦 ${l.name || l.type}`, i.title = d(`Currently animating object: ${l.name || l.type}`)) : (e.style.color = "#f59e0b", e.textContent = `🎥 ${k.name}`, i.title = d(`Currently animating camera: ${k.name}`)), i.append(e, document.createTextNode(` · ${y.length} key${y.length === 1 ? "" : "s"}`));
  }
  const E = t.root.querySelector('[data-role="camera-summary"]');
  E && (E.textContent = `${k.name} · Key F${t.selectedKeyFrame ?? t.frame}`);
  const C = t.root.querySelector('[data-role="camera-menu-list"]');
  if (C) {
    C.innerHTML = "";
    for (const e of t.state.cameras) {
      const r = document.createElement("button");
      r.type = "button", r.className = e.id === t.state.active_camera_id ? "selected" : "";
      const a = document.createElement("i");
      a.className = "pi pi-video";
      const o = document.createElement("span");
      o.textContent = `${e.name} · ${e.keyframes.length} key${e.keyframes.length === 1 ? "" : "s"}${e.id === t.state.playblast_camera_id ? " · PLAYBLAST" : ""}`, r.append(a, o), r.addEventListener("click", () => {
        t.activateCamera(e.id), t.closeMenus();
      }), C.appendChild(r);
    }
  }
  t.refreshCameraSelectors(), t.refreshKeyEditor(), t.updateEditState(), t.drawCurveEditor();
}
export {
  B as curveChannels,
  I as drawCurveEditor,
  O as onCurvePointerDown,
  V as onCurvePointerMove,
  Y as onCurvePointerUp,
  G as onCurveWheel,
  j as onKeyDragMove,
  H as onTimelinePointerDown,
  q as onTimelinePointerMove,
  A as onTimelinePointerUp,
  Z as onTimelineWheel,
  L as refreshKeys,
  J as resetCurveZoom,
  z as resetTimelineZoom,
  Q as setChannelFilter,
  X as setCurveInterpolation,
  ee as setTangentMode,
  R as timelineFrameFromEvent,
  c as timelinePercentForFrame,
  te as toggleCurveHandles,
  ae as zoomCurve
};
