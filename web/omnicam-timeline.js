import { clamp as k, resolveHandles as V, cloneTransform as O, cloneCamera as Z, sampleObjectTransform as U, sampleCamera as G } from "./omnicam-core.js";
import { t as D } from "./omnicam-i18n.js";
function B(e, a, t) {
  const n = t.getBoundingClientRect();
  return Math.round(k((a.clientX - n.left) / Math.max(1, n.width), 0, 1) * (e.state.duration_frames - 1));
}
function te(e, a) {
  if (a.target.closest?.(".key")) return;
  a.preventDefault(), a.stopPropagation(), e.exitKeyEdit(!0);
  const t = a.currentTarget;
  if (t.focus({ preventScroll: !0 }), t.setPointerCapture?.(a.pointerId), a.shiftKey) {
    const n = t.getBoundingClientRect();
    e.boxSelect = { box: t, pointerId: a.pointerId, startX: a.clientX - n.left, currentX: a.clientX - n.left };
    return;
  }
  e.selectedKeyFrames = null, e.timelineDrag = { box: t, pointerId: a.pointerId }, e.setFrame(B(e, a, t));
}
function ae(e, a) {
  if (e.boxSelect && a.pointerId === e.boxSelect.pointerId) {
    a.preventDefault(), a.stopPropagation();
    const t = e.boxSelect.box.getBoundingClientRect();
    e.boxSelect.currentX = a.clientX - t.left;
    let n = e.boxSelect.overlay;
    n || (n = document.createElement("div"), n.className = "box-select", e.boxSelect.box.appendChild(n), e.boxSelect.overlay = n);
    const s = Math.min(e.boxSelect.startX, e.boxSelect.currentX);
    n.style.left = `${s}px`, n.style.width = `${Math.abs(e.boxSelect.currentX - e.boxSelect.startX)}px`, n.style.top = "0", n.style.bottom = "0";
    return;
  }
  !e.timelineDrag || a.pointerId !== e.timelineDrag.pointerId || (a.preventDefault(), a.stopPropagation(), e.setFrame(B(e, a, e.timelineDrag.box)));
}
function re(e, a) {
  if (e.boxSelect && a.pointerId === e.boxSelect.pointerId) {
    a.preventDefault(), a.stopPropagation();
    const t = e.boxSelect.box.getBoundingClientRect(), n = Math.max(1, e.state.duration_frames - 1), s = (d) => k(d / Math.max(1, t.width) * n, 0, n), r = Math.min(s(e.boxSelect.startX), s(e.boxSelect.currentX)), m = Math.max(s(e.boxSelect.startX), s(e.boxSelect.currentX));
    e.boxSelect.overlay?.remove(), e.boxSelect = null;
    const f = e.timelineKeyframes().filter((d) => d.frame >= r && d.frame <= m).map((d) => d.frame);
    f.length && (e.selectedKeyFrames = new Set(f), e.selectedKeyFrame = f[0], e.updateKeyVisualState(), e.refreshKeyEditor(), e.setStatus(D(`${f.length} keys selected`)));
    return;
  }
  !e.timelineDrag || a.pointerId !== e.timelineDrag.pointerId || (a.preventDefault(), a.stopPropagation(), e.timelineDrag.box.hasPointerCapture?.(a.pointerId) && e.timelineDrag.box.releasePointerCapture(a.pointerId), e.timelineDrag = null);
}
function ne(e, a) {
  const t = e.keyDrag, n = t.box.getBoundingClientRect();
  let s = Math.round(k((a.clientX - n.left) / Math.max(1, n.width), 0, 1) * (e.state.duration_frames - 1));
  s = e.snapFrame(s);
  const r = s - t.startPointerFrame;
  if (t.moving && t.moving.length > 1) {
    if (r === t.lastDelta) return;
    t.lastDelta = r;
    const m = e.timelineKeyframes(), f = new Set(m.filter((d) => !e.selectedKeyFrames.has(d.frame)).map((d) => d.frame));
    for (const d of t.moving) {
      let y = k(d.startFrame + r, 0, e.state.duration_frames - 1);
      for (; f.has(y) && y > 0 && y < e.state.duration_frames - 1; ) y += Math.sign(r || 1);
      d.key.frame = f.has(y) ? d.key.frame : y;
    }
    m.sort((d, y) => d.frame - y.frame), e.editingKeyFrame = t.key.frame, e.scheduleSerialize(), e.setFrame(t.key.frame, !1, !0);
    return;
  }
  s !== t.key.frame && (e.editingKeyFrame = t.key.frame, e.retimeSelectedKey(s, !0));
}
function oe(e) {
  const a = e.root.querySelector('[data-role="keys"]');
  a.innerHTML = "";
  const t = e.timelineObject(), n = e.timelineKeyframes(), s = Math.max(1, e.state.duration_frames - 1), r = Math.min(12, Math.max(2, Math.floor(a.clientWidth / 80) || 8));
  if (e.state.playback_range) {
    const o = document.createElement("div");
    o.className = "playback-range", o.style.left = `${100 * e.state.playback_range[0] / s}%`, o.style.width = `${100 * (e.state.playback_range[1] - e.state.playback_range[0]) / s}%`, a.appendChild(o);
  }
  for (let o = 0; o <= r; o++) {
    const c = Math.round(o * s / r), i = document.createElement("span");
    i.className = "timeline-tick", i.textContent = String(c), i.style.left = `${100 * c / s}%`, a.appendChild(i);
  }
  for (const o of e.state.markers || []) {
    const c = document.createElement("span");
    c.className = "timeline-marker", c.style.left = `${100 * o.frame / s}%`, c.style.setProperty("--marker-color", o.color), c.title = o.name, a.appendChild(c);
  }
  const m = document.createElement("span");
  m.className = "playhead", m.style.left = `${100 * e.frame / s}%`, a.appendChild(m);
  const f = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const o of n) {
    const c = document.createElement("button");
    c.type = "button", c.className = `key${o.frame === e.frame ? " at-playhead" : ""}${f.has(o.frame) ? " selected" : ""}${o.frame === e.editingKeyFrame ? " editing" : ""}`, c.dataset.keyFrame = String(o.frame), c.setAttribute("aria-label", D(`${t?.name || "Camera"} keyframe at frame ${o.frame}`)), c.title = D(`Frame ${o.frame} · ${o.interpolation} · drag to retime`), c.style.left = `${100 * o.frame / s}%`;
    const i = document.createElement("span");
    i.className = "key-label", i.textContent = String(o.frame), c.appendChild(i), c.addEventListener("pointerdown", (g) => {
      if (g.preventDefault(), g.stopPropagation(), c.focus({ preventScroll: !0 }), g.shiftKey) {
        e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((v) => v !== null)), e.selectedKeyFrames.has(o.frame) ? e.selectedKeyFrames.delete(o.frame) : e.selectedKeyFrames.add(o.frame), e.selectedKeyFrame = o.frame, e.updateKeyVisualState(), e.refreshKeyEditor();
        return;
      }
      e.selectedKeyFrames?.has(o.frame) || (e.selectedKeyFrames = /* @__PURE__ */ new Set([o.frame])), e.selectedKeyFrame = o.frame;
      const x = e.timelineKeyframes().filter((v) => e.selectedKeyFrames.has(v.frame));
      e.keyDrag = { key: o, box: a, moving: x.map((v) => ({ key: v, startFrame: v.frame })), startPointerFrame: o.frame }, e.setFrame(o.frame, !1, !1);
    }), c.addEventListener("click", (g) => {
      g.preventDefault(), g.stopPropagation(), g.shiftKey || (e.selectedKeyFrames = /* @__PURE__ */ new Set([o.frame])), e.selectKeyframe(o);
    }), a.appendChild(c);
  }
  const d = e.activeCameraTrack();
  e.root.querySelector('[data-role="timeline-summary"]').textContent = `${t?.name || d.name} · ${n.length} key${n.length === 1 ? "" : "s"}`, e.root.querySelector('[data-role="camera-summary"]').textContent = `${d.name} · Key F${e.selectedKeyFrame ?? e.frame}`;
  const y = e.root.querySelector('[data-role="camera-menu-list"]');
  y.innerHTML = "";
  for (const o of e.state.cameras) {
    const c = document.createElement("button");
    c.type = "button", c.className = o.id === e.state.active_camera_id ? "selected" : "";
    const i = document.createElement("i");
    i.className = "pi pi-video";
    const g = document.createElement("span");
    g.textContent = `${o.name} · ${o.keyframes.length} key${o.keyframes.length === 1 ? "" : "s"}${o.id === e.state.playblast_camera_id ? " · PLAYBLAST" : ""}`, c.append(i, g), c.addEventListener("click", () => {
      e.activateCamera(o.id), e.closeMenus();
    }), y.appendChild(c);
  }
  e.refreshCameraSelectors(), e.refreshKeyEditor(), e.updateEditState(), e.drawCurveEditor();
}
function J(e) {
  const a = e.root.querySelector('[data-role="curve-group"]').value;
  if (e.timelineObject()) {
    const t = a === "target" ? "rotation" : a === "lens" ? "size" : "position", n = t === "size" ? "Scale" : t[0].toUpperCase() + t.slice(1);
    return [0, 1, 2].map((s) => ({
      name: `${n} ${"XYZ"[s]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][s],
      get: (r) => r[t][s],
      set: (r, m) => {
        r[t][s] = t === "size" ? Math.max(0.01, m) : m;
      }
    }));
  }
  return a === "target" ? [0, 1, 2].map((t) => ({
    name: `Target ${"XYZ"[t]}`,
    color: ["#ef5350", "#53d86a", "#4aa3ef"][t],
    get: (n) => n.target[t],
    set: (n, s) => {
      n.target[t] = s;
    }
  })) : a === "lens" ? [
    { name: "FOV", color: "#ef8b3e", get: (t) => t.fov, set: (t, n) => {
      t.fov = k(n, 5, 150);
    } },
    { name: "Roll", color: "#43c7db", get: (t) => t.roll || 0, set: (t, n) => {
      t.roll = k(n, -180, 180);
    } },
    { name: "Zoom", color: "#66d17a", get: (t) => t.zoom || 1, set: (t, n) => {
      t.zoom = Math.max(0.01, n);
    } }
  ] : [0, 1, 2].map((t) => ({
    name: `Position ${"XYZ"[t]}`,
    color: ["#ef5350", "#53d86a", "#4aa3ef"][t],
    get: (n) => n.position[t],
    set: (n, s) => {
      n.position[t] = s;
    }
  }));
}
function se(e) {
  const a = e.root.querySelector('[data-role="curve-canvas"]'), t = a.clientWidth, n = 178;
  if (!t) return;
  const s = Math.min(2, window.devicePixelRatio || 1);
  (a.width !== Math.round(t * s) || a.height !== Math.round(n * s)) && (a.width = Math.round(t * s), a.height = Math.round(n * s));
  const r = a.getContext("2d");
  r.setTransform(s, 0, 0, s, 0, 0), r.clearRect(0, 0, t, n);
  const m = e.timelineObject(), f = e.timelineKeyframes(), d = J(e), y = 38, o = 9, c = 12, i = 22, g = Math.max(1, t - y - o), x = n - c - i, v = Math.max(1, e.state.duration_frames - 1), C = [], q = Math.max(1, Math.ceil(e.state.duration_frames / Math.max(80, g))), E = (l) => m ? U(m, l) : G(e.state, l);
  for (let l = 0; l <= v; l += q) C.push({ frame: l, value: E(l) });
  C[C.length - 1]?.frame !== v && C.push({ frame: v, value: E(v) });
  const H = C.flatMap((l) => d.map((h) => h.get(l.value)));
  let b = Math.min(...H), u = Math.max(...H);
  (!Number.isFinite(b) || !Number.isFinite(u)) && (b = -1, u = 1), Math.abs(u - b) < 1e-6 && (b -= 1, u += 1);
  const X = (u - b) * 0.08;
  b -= X, u += X;
  const P = (l) => y + g * l / v, $ = (l) => c + x * (u - l) / (u - b);
  r.fillStyle = "#111", r.fillRect(0, 0, t, n), r.strokeStyle = "#303030", r.lineWidth = 1, r.font = "10px system-ui", r.fillStyle = "#8e8e8e";
  const z = Math.min(12, Math.max(2, Math.floor(g / 75)));
  for (let l = 0; l <= z; l++) {
    const h = Math.round(v * l / z), p = P(h);
    r.beginPath(), r.moveTo(p, c), r.lineTo(p, c + x), r.stroke(), r.fillText(String(h), p + 3, n - 6);
  }
  for (let l = 0; l <= 4; l++) {
    const h = c + x * l / 4;
    r.beginPath(), r.moveTo(y, h), r.lineTo(t - o, h), r.stroke();
    const p = u - (u - b) * l / 4;
    r.fillText(p.toFixed(Math.abs(u - b) < 10 ? 1 : 0), 3, h + 3);
  }
  e.curveHitPoints = [];
  for (const l of d) {
    r.strokeStyle = l.color, r.lineWidth = 1.7, r.beginPath(), C.forEach((h, p) => {
      const S = P(h.frame), M = $(l.get(h.value));
      p ? r.lineTo(S, M) : r.moveTo(S, M);
    }), r.stroke();
    for (const h of f) {
      const p = m ? h.transform : h.camera, S = P(h.frame), M = $(l.get(p));
      r.fillStyle = h.frame === e.selectedKeyFrame ? "#ffd75e" : l.color, r.strokeStyle = "#111", r.beginPath(), r.arc(S, M, h.frame === e.selectedKeyFrame ? 4.5 : 3.5, 0, Math.PI * 2), r.fill(), r.stroke(), e.curveHitPoints.push({ x: S, y: M, key: h, channel: l, minimum: b, maximum: u, graphHeight: x, object: m });
    }
    if (e.showCurveHandles) {
      const h = f.findIndex((S) => S.frame === e.selectedKeyFrame), p = f[h];
      if (p?.interpolation === "bezier") {
        const S = m ? p.transform : p.camera, M = P(p.frame), I = $(l.get(S)), F = f[h - 1], _ = f[h + 1], Y = l.get(S), j = Math.max(1, p.frame - (F?.frame ?? p.frame - 1)), N = Math.max(1, (_?.frame ?? p.frame + 1) - p.frame), w = V(
          { frame: p.frame, value: Y, tangents: p.tangents },
          F && { frame: F.frame, value: l.get(m ? F.transform : F.camera) },
          _ && { frame: _.frame, value: l.get(m ? _.transform : _.camera) }
        ), R = (u - b) / Math.max(1, x), W = g * N / v, A = g * j / v, T = [];
        F && T.push({ side: "in", x: M + w.in_x * A, y: I - w.in_y / R }), _ && T.push({ side: "out", x: M + w.out_x * W, y: I - w.out_y / R }), r.strokeStyle = "#d7b8ff", r.fillStyle = "#241d2d", r.lineWidth = 1;
        for (const K of T)
          r.beginPath(), r.moveTo(M, I), r.lineTo(K.x, K.y), r.stroke(), r.beginPath(), r.arc(K.x, K.y, 4, 0, Math.PI * 2), r.fill(), r.stroke(), e.curveHitPoints.push({ x: K.x, y: K.y, key: p, channel: l, minimum: b, maximum: u, graphHeight: x, object: m, handle: K.side, prevSpan: j, nextSpan: N });
      }
    }
  }
  for (const l of e.root.querySelectorAll("[data-tangent-mode]")) l.classList.toggle("active", l.dataset.tangentMode === (e.selectedKeyframe()?.tangents?.mode || "auto"));
  const L = P(e.frame);
  r.strokeStyle = "#f2d06b", r.lineWidth = 1, r.beginPath(), r.moveTo(L, c), r.lineTo(L, c + x), r.stroke();
  for (const l of e.root.querySelectorAll("[data-curve-mode]")) l.classList.toggle("active", l.dataset.curveMode === e.selectedKeyframe()?.interpolation);
}
function le(e, a) {
  a.preventDefault(), a.stopPropagation();
  const t = a.currentTarget, n = t.getBoundingClientRect(), s = (a.clientX - n.left) * t.clientWidth / Math.max(1, n.width), r = (a.clientY - n.top) * 178 / Math.max(1, n.height), m = (e.curveHitPoints || []).map((d) => ({ point: d, distance: Math.hypot(s - d.x, r - d.y) })).sort((d, y) => d.distance - y.distance)[0];
  if (!m || m.distance > 10)
    return e.exitKeyEdit(!0), e.setFrame(Math.round(k((s - 38) / Math.max(1, n.width - 47), 0, 1) * (e.state.duration_frames - 1)));
  e.selectKeyframe(m.point.key);
  const f = m.point.object ? m.point.key.transform : m.point.key.camera;
  e.curveDrag = { ...m.point, startY: r, startX: s, startValue: m.point.channel.get(f), pointerId: a.pointerId }, m.point.handle && (e.curveDrag.startHandles = { ...V(
    { frame: m.point.key.frame, value: e.curveDrag.startValue, tangents: m.point.key.tangents },
    null,
    null
  ) }), t.setPointerCapture?.(a.pointerId);
}
function ce(e, a) {
  if (!e.curveDrag || a.pointerId !== e.curveDrag.pointerId) return;
  a.preventDefault(), a.stopPropagation();
  const t = a.currentTarget.getBoundingClientRect(), n = (a.clientX - t.left) * t.width / Math.max(1, t.width), s = (a.clientY - t.top) * 178 / Math.max(1, t.height);
  if (e.curveDrag.handle) {
    const f = e.curveDrag.key, d = e.curveDrag.handle, y = Math.max(1e-6, (d === "in" ? e.curveDrag.prevSpan : e.curveDrag.nextSpan) / Math.max(1, e.state.duration_frames - 1)), o = k((n - e.curveDrag.startX) / Math.max(1, t.width) / y, -0.99, 0.99), c = (e.curveDrag.startY - s) * ((e.curveDrag.maximum - e.curveDrag.minimum) / Math.max(1, e.curveDrag.graphHeight)), i = { ...f.tangents || {}, mode: f.tangents?.mode === "aligned" ? "aligned" : "free" };
    if (d === "in") {
      if (i.in_x = -Math.abs(k(o, -0.99, -0.01)), i.in_y = e.curveDrag.startHandles.in_y + c, i.mode === "aligned") {
        const g = Math.hypot(i.in_x, i.in_y) || 1e-6, x = Math.hypot(e.curveDrag.startHandles.out_x, e.curveDrag.startHandles.out_y) || 1e-6;
        i.out_x = -i.in_x / g * x, i.out_y = -i.in_y / g * x;
      }
    } else if (i.out_x = Math.abs(k(o, 0.01, 0.99)), i.out_y = e.curveDrag.startHandles.out_y + c, i.mode === "aligned") {
      const g = Math.hypot(i.out_x, i.out_y) || 1e-6, x = Math.hypot(e.curveDrag.startHandles.in_x, e.curveDrag.startHandles.in_y) || 1e-6;
      i.in_x = -i.out_x / g * x, i.in_y = -i.out_y / g * x;
    }
    f.tangents = i, e.scheduleSerialize(), e.drawCurveEditor();
    return;
  }
  const r = e.curveDrag.startValue - (s - e.curveDrag.startY) * (e.curveDrag.maximum - e.curveDrag.minimum) / Math.max(1, e.curveDrag.graphHeight), m = e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera;
  if (e.curveDrag.channel.set(m, r), e.editingKeyFrame = e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame, e.curveDrag.object) {
    const f = O(e.curveDrag.key.transform);
    e.curveDrag.object.position = f.position, e.curveDrag.object.rotation = f.rotation, e.curveDrag.object.size = f.size;
  } else e.camera = Z(e.curveDrag.key.camera);
  e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.render(), e.drawCurveEditor();
}
function me(e, a) {
  !e.curveDrag || a.pointerId !== e.curveDrag.pointerId || (a.currentTarget.hasPointerCapture?.(a.pointerId) && a.currentTarget.releasePointerCapture(a.pointerId), e.editingKeyFrame = null, e.curveDrag = null, e.updateKeyVisualState(), e.drawCurveEditor());
}
function ie(e, a) {
  const t = e.selectedKeyframe() || e.timelineKeyframes().find((n) => n.frame === e.frame);
  if (!t) return e.setStatus(D("Select a keyframe first"));
  e.checkpoint("Change interpolation"), t.interpolation = a, e.selectedKeyFrame = t.frame, e.serialize(), e.refreshKeys(), e.render(), e.setStatus(D(`${a.replace("_", " ")} interpolation @ ${t.frame}`));
}
function de(e, a) {
  const t = e.selectedKeyframe();
  if (!t || !["auto", "vector", "free", "aligned"].includes(a)) return e.setStatus(D("Select a keyframe first"));
  e.checkpoint("Change tangent mode"), a !== "auto" && t.interpolation !== "bezier" && (t.interpolation = "bezier"), t.tangents = { ...t.tangents || {}, mode: a }, e.selectedKeyFrame = t.frame, e.serialize(), e.refreshKeys(), e.render(), e.setStatus(D(`Tangent mode: ${a} @ ${t.frame}`));
}
function fe(e) {
  e.showCurveHandles = !e.showCurveHandles;
  const a = e.root.querySelector('[data-act="curve-handles"]');
  a.classList.toggle("active", e.showCurveHandles), a.setAttribute("aria-pressed", String(e.showCurveHandles)), a.title = D(`${e.showCurveHandles ? "Hide" : "Show"} Bézier tangent handles`), e.drawCurveEditor(), e.setStatus(D(`Bézier handles ${e.showCurveHandles ? "shown" : "hidden"}`));
}
export {
  J as curveChannels,
  se as drawCurveEditor,
  le as onCurvePointerDown,
  ce as onCurvePointerMove,
  me as onCurvePointerUp,
  ne as onKeyDragMove,
  te as onTimelinePointerDown,
  ae as onTimelinePointerMove,
  re as onTimelinePointerUp,
  oe as refreshKeys,
  ie as setCurveInterpolation,
  de as setTangentMode,
  B as timelineFrameFromEvent,
  fe as toggleCurveHandles
};
