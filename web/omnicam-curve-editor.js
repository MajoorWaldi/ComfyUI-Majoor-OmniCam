import { clamp as E, resolveChannelHandles as se, sampleObjectTransform as ce, sampleCamera as le } from "./omnicam-core.js";
import "./omnicam-i18n.js";
import { clamp as C, sampleCamera as me, cloneTransform as ie, cloneCamera as de } from "./omnicam-core.js";
import { t as k } from "./omnicam-i18n.js";
function ee(e, r) {
  const o = e.getBoundingClientRect(), s = e.clientWidth / Math.max(1, o.width), a = 180 / Math.max(1, o.height);
  return {
    x: (r.clientX - o.left) * s,
    y: (r.clientY - o.top) * a
  };
}
function pe(e, r) {
  r.preventDefault(), r.stopPropagation();
  const o = r.currentTarget, { x: s, y: a } = ee(o, r);
  if (r.button === 1 || r.altKey || r.button === 2 && !e.curveHitPoints?.some((m) => Math.hypot(s - m.x, a - m.y) <= 12)) {
    e.curvePanDrag = {
      startX: r.clientX,
      startY: r.clientY,
      origPanX: Number(e.curvePanX) || 0,
      origPanY: Number(e.curvePanY) || 0,
      pointerId: r.pointerId
    }, o.setPointerCapture?.(r.pointerId);
    return;
  }
  const t = (e.curveHitPoints || []).map((m) => ({ point: m, distance: Math.hypot(s - m.x, a - m.y) })).sort((m, S) => m.distance - S.distance)[0];
  if (!t || t.distance > 12) {
    if (a < 20) {
      const m = Math.max(1, e.state.duration_frames - 1), S = m / (Number(e.curveZoomX) || 1), v = Number(e.curvePanX) || 0, c = Math.round(C(v + (s - 44) / Math.max(1, o.clientWidth - 58) * S, 0, m));
      e.setFrame(c), e.curveScrub = { pointerId: r.pointerId }, o.setPointerCapture?.(r.pointerId);
      return;
    }
    e.curveBoxSelect = { startX: s, startY: a, currentX: s, currentY: a, pointerId: r.pointerId }, o.setPointerCapture?.(r.pointerId);
    return;
  }
  t.point.handle ? (e.selectedKeyFrame = t.point.key.frame, e.editingKeyFrame = null, e.updateKeyVisualState(), e.refreshKeyEditor()) : (e.selectKeyframe(t.point.key), e.setFrame(t.point.key.frame));
  const g = t.point.object ? t.point.key.transform : t.point.key.camera;
  e.curveDrag = {
    ...t.point,
    startY: a,
    startX: s,
    startFrame: t.point.key.frame,
    startValue: t.point.channel.get(g),
    pointerId: r.pointerId
  }, o.setPointerCapture?.(r.pointerId);
}
function ue(e, r) {
  const o = r.currentTarget, { x: s, y: a } = ee(o, r);
  if (e.curvePanDrag && r.pointerId === e.curvePanDrag.pointerId) {
    r.preventDefault();
    const c = r.clientX - e.curvePanDrag.startX, f = r.clientY - e.curvePanDrag.startY, y = Math.max(1, e.state.duration_frames - 1) / (Number(e.curveZoomX) || 1), x = Math.max(1, o.clientWidth - 58), h = 142;
    e.curvePanX = e.curvePanDrag.origPanX - c / x * y, e.curvePanY = e.curvePanDrag.origPanY + f / h * 10 / (Number(e.curveZoom) || 1), e.drawCurveEditor();
    return;
  }
  if (e.curveScrub && r.pointerId === e.curveScrub.pointerId) {
    r.preventDefault();
    const c = Math.max(1, e.state.duration_frames - 1), f = c / (Number(e.curveZoomX) || 1), F = Number(e.curvePanX) || 0, y = Math.round(C(F + (s - 44) / Math.max(1, o.clientWidth - 58) * f, 0, c));
    e.setFrame(y);
    return;
  }
  if (e.curveBoxSelect && r.pointerId === e.curveBoxSelect.pointerId) {
    r.preventDefault(), e.curveBoxSelect.currentX = s, e.curveBoxSelect.currentY = a;
    const c = Math.min(e.curveBoxSelect.startX, s), f = Math.max(e.curveBoxSelect.startX, s), F = Math.min(e.curveBoxSelect.startY, a), y = Math.max(e.curveBoxSelect.startY, a), x = (e.curveHitPoints || []).filter((h) => !h.handle && h.x >= c && h.x <= f && h.y >= F && h.y <= y).map((h) => h.key.frame);
    e.selectedKeyFrames = new Set(x), x.length && (e.selectedKeyFrame = x[0]), e.updateKeyVisualState(), e.drawCurveEditor();
    return;
  }
  if (!e.curveDrag || r.pointerId !== e.curveDrag.pointerId) return;
  if (r.preventDefault(), r.stopPropagation(), e.curveDrag.handle) {
    const c = e.curveDrag.key, f = e.curveDrag.channel, F = e.curveDrag.handle, y = e.curveDrag.pixelPerSegment, x = e.curveDrag.valuePerPixel, h = e.curveDrag.keyX, H = e.curveDrag.keyY;
    c.interpolation !== "bezier" && (c.interpolation = "bezier"), c.tangents || (c.tangents = { mode: "auto", channels: {} }), c.tangents.channels || (c.tangents.channels = {});
    const w = c.tangents.channels[f.id] || {}, _ = w.mode || (c.tangents.mode === "aligned" ? "aligned" : "free"), d = {
      out_x: e.curveDrag.startHandles.out_x,
      out_y: e.curveDrag.startHandles.out_y,
      in_x: e.curveDrag.startHandles.in_x,
      in_y: e.curveDrag.startHandles.in_y,
      ...w,
      mode: _
    };
    if (F === "in") {
      if (d.in_x = C((s - h) / Math.max(1, y), -0.99, -0.01), d.in_y = (H - a) * x, _ === "aligned") {
        const X = Math.hypot(d.in_x, d.in_y) || 1e-6, D = Math.hypot(e.curveDrag.startHandles.out_x, e.curveDrag.startHandles.out_y) || 1e-6;
        d.out_x = -d.in_x / X * D, d.out_y = -d.in_y / X * D;
      }
    } else if (d.out_x = C((s - h) / Math.max(1, y), 0.01, 0.99), d.out_y = (H - a) * x, _ === "aligned") {
      const X = Math.hypot(d.out_x, d.out_y) || 1e-6, D = Math.hypot(e.curveDrag.startHandles.in_x, e.curveDrag.startHandles.in_y) || 1e-6;
      d.in_x = -d.out_x / X * D, d.in_y = -d.out_y / X * D;
    }
    c.tangents.channels[f.id] = d, e.scheduleSerialize(), e.camera = me(e.state, e.frame), e.applyObjectAnimationFrame(), e.render(), e.drawCurveEditor();
    return;
  }
  const t = e.curveDrag.maximum - (a - e.curveDrag.top) * (e.curveDrag.maximum - e.curveDrag.minimum) / Math.max(1, e.curveDrag.graphHeight), g = e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera;
  e.curveDrag.channel.set(g, t);
  const m = e.curveDrag.lastFrame / (Number(e.curveZoomX) || 1), S = Number(e.curvePanX) || 0, v = C(Math.round(S + (s - e.curveDrag.left) / Math.max(1, e.curveDrag.graphWidth) * m), 0, e.curveDrag.lastFrame);
  if (!r.shiftKey && Math.abs(s - e.curveDrag.startX) > 8 && v !== e.curveDrag.key.frame ? (e.curveDrag.key.frame = v, e.selectedKeyFrame = v, e.frame = v) : (e.editingKeyFrame = e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame), e.curveDrag.object) {
    const c = ie(e.curveDrag.key.transform);
    e.curveDrag.object.position = c.position, e.curveDrag.object.rotation = c.rotation, e.curveDrag.object.size = c.size;
  } else {
    const c = de(e.curveDrag.key.camera);
    e.camera.position = c.position, e.camera.target = c.target, e.camera.fov = c.fov, e.camera.roll = c.roll, e.camera.zoom = c.zoom;
  }
  e.scheduleSerialize(), e.render(), e.refreshKeyEditor(), e.drawCurveEditor();
}
function ye(e, r) {
  r.currentTarget.hasPointerCapture?.(r.pointerId) && r.currentTarget.releasePointerCapture(r.pointerId), e.curvePanDrag = null, e.curveScrub = null, e.curveBoxSelect = null, e.curveDrag && (e.timelineKeyframes().sort((s, a) => s.frame - a.frame), e.editingKeyFrame = null, e.curveDrag = null, e.serialize(), e.refreshKeys(), e.updateKeyVisualState(), e.drawCurveEditor());
}
function xe(e, r) {
  const o = e.selectedKeyframe() || e.timelineKeyframes().find((s) => s.frame === e.frame);
  if (!o) return e.setStatus(k("Select a keyframe first"));
  e.checkpoint("Change interpolation"), o.interpolation = r;
  for (const s of e.root.querySelectorAll("[data-curve-mode]")) {
    const a = s.dataset.curveMode === r;
    s.classList.toggle("active", a), s.setAttribute("aria-pressed", String(a));
  }
  e.selectedKeyFrame = o.frame, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.render(), e.drawCurveEditor(), e.setStatus(k(`${r.replace("_", " ")} interpolation @ ${o.frame}`));
}
function Se(e, r) {
  e.curveChannelFilter = r;
  for (const o of e.root.querySelectorAll("[data-channel-filter]")) {
    const s = o.dataset.channelFilter === String(r);
    o.classList.toggle("active", s), o.setAttribute("aria-pressed", String(s));
  }
  e.drawCurveEditor(), e.setStatus(r === "all" ? k("Showing all channels") : k(`Solo channel ${r}`));
}
function be(e, r) {
  const o = e.selectedKeyframe();
  if (!o || !["auto", "vector", "free", "aligned", "flat"].includes(r)) return e.setStatus(k("Select a keyframe first"));
  e.checkpoint("Change tangent mode"), r !== "auto" && o.interpolation !== "bezier" && (o.interpolation = "bezier"), o.tangents || (o.tangents = { mode: "auto", channels: {} }), o.tangents.mode = r, o.tangents.channels || (o.tangents.channels = {});
  const s = te(e);
  for (const a of s)
    o.tangents.channels[a.id] ? o.tangents.channels[a.id].mode = r : o.tangents.channels[a.id] = { mode: r };
  for (const a of e.root.querySelectorAll("[data-tangent-mode]")) {
    const t = a.dataset.tangentMode === r;
    a.classList.toggle("active", t), a.setAttribute("aria-pressed", String(t));
  }
  e.selectedKeyFrame = o.frame, e.serialize(), e.refreshKeys(), e.render(), e.drawCurveEditor(), e.setStatus(k(`Tangent mode: ${r} @ ${o.frame}`));
}
function Me(e) {
  e.showCurveHandles = !e.showCurveHandles;
  for (const r of e.root.querySelectorAll('[data-act="curve-handles"]'))
    r.classList.toggle("active", e.showCurveHandles), r.setAttribute("aria-pressed", String(e.showCurveHandles)), r.title = k(`${e.showCurveHandles ? "Hide" : "Show"} Bézier tangent handles`);
  e.drawCurveEditor(), e.setStatus(k(`Bézier handles ${e.showCurveHandles ? "shown" : "hidden"}`));
}
function Pe(e, r) {
  r.preventDefault(), r.stopPropagation();
  const o = r.deltaY < 0 ? 1.18 : 0.85;
  if (r.shiftKey) {
    const s = Math.max(1, e.state.duration_frames - 1);
    e.curvePanX = C((Number(e.curvePanX) || 0) + (r.deltaY > 0 ? 4 : -4), -s * 0.5, s);
  } else r.altKey ? e.curvePanY = (Number(e.curvePanY) || 0) + (r.deltaY > 0 ? -1 : 1) / (Number(e.curveZoom) || 1) : r.ctrlKey ? e.curveZoomX = C((Number(e.curveZoomX) || 1) * o, 0.2, 30) : (e.curveZoom = C((Number(e.curveZoom) || 1) * o, 0.2, 30), e.curveZoomX = C((Number(e.curveZoomX) || 1) * o, 0.2, 30));
  e.drawCurveEditor(), e.setStatus(k(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function De(e, r) {
  e.curveZoom = C((Number(e.curveZoom) || 1) * r, 0.2, 30), e.curveZoomX = C((Number(e.curveZoomX) || 1) * r, 0.2, 30), e.drawCurveEditor(), e.setStatus(k(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function Ce(e) {
  e.curveZoom = 1, e.curveZoomX = 1, e.curvePanX = 0, e.curvePanY = 0, e.drawCurveEditor(), e.setStatus(k("Curve view fitted"));
}
function te(e) {
  const r = e.root.querySelector('[data-role="curve-group"]')?.value || "position";
  let o = [];
  if (e.timelineObject()) {
    const a = r === "target" ? "rotation" : r === "lens" ? "size" : "position", t = r === "target" ? "rot" : r === "lens" ? "scale" : "pos", g = a === "size" ? "Scale" : a[0].toUpperCase() + a.slice(1);
    o = [0, 1, 2].map((m) => ({
      id: `${t}_${"xyz"[m]}`,
      name: `${g} ${"XYZ"[m]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][m],
      get: (S) => (S[a] || [0, 0, 0])[m],
      set: (S, v) => {
        S[a] || (S[a] = [0, 0, 0]), S[a][m] = a === "size" ? Math.max(0.01, v) : v;
      }
    }));
  } else r === "target" ? o = [0, 1, 2].map((a) => ({
    id: `target_${"xyz"[a]}`,
    name: `Target ${"XYZ"[a]}`,
    color: ["#ef5350", "#53d86a", "#4aa3ef"][a],
    get: (t) => (t.target || [0, 0, 0])[a],
    set: (t, g) => {
      t.target || (t.target = [0, 0, 0]), t.target[a] = g;
    }
  })) : r === "lens" ? o = [
    { id: "fov", name: "FOV", color: "#ef8b3e", get: (a) => a.fov ?? 35, set: (a, t) => {
      a.fov = E(t, 5, 150);
    } },
    { id: "roll", name: "Roll", color: "#43c7db", get: (a) => a.roll || 0, set: (a, t) => {
      a.roll = E(t, -180, 180);
    } },
    { id: "zoom", name: "Zoom", color: "#66d17a", get: (a) => a.zoom || 1, set: (a, t) => {
      a.zoom = Math.max(0.01, t);
    } }
  ] : o = [0, 1, 2].map((a) => ({
    id: `pos_${"xyz"[a]}`,
    name: `Position ${"XYZ"[a]}`,
    color: ["#ef5350", "#53d86a", "#4aa3ef"][a],
    get: (t) => (t.position || [0, 0, 0])[a],
    set: (t, g) => {
      t.position || (t.position = [0, 0, 0]), t.position[a] = g;
    }
  }));
  const s = e.curveChannelFilter;
  if (s && s !== "all") {
    const a = parseInt(s, 10);
    if (!isNaN(a) && o[a])
      return [o[a]];
  }
  return o;
}
function ke(e) {
  const r = e.root.querySelector('[data-role="curve-canvas"]');
  if (!r) return;
  const o = r.clientWidth, s = 180;
  if (!o) return;
  const a = Math.min(2, window.devicePixelRatio || 1);
  (r.width !== Math.round(o * a) || r.height !== Math.round(s * a)) && (r.width = Math.round(o * a), r.height = Math.round(s * a));
  const t = r.getContext("2d");
  t.setTransform(a, 0, 0, a, 0, 0), t.clearRect(0, 0, o, s);
  const g = e.timelineObject(), m = e.timelineKeyframes(), S = te(e), v = 44, c = 14, f = 16, F = 22, y = Math.max(1, o - v - c), x = Math.max(1, s - f - F), h = Math.max(1, e.state.duration_frames - 1), H = E(Number(e.curveZoomX) || 1, 0.1, 50), w = Number(e.curvePanX) || 0, _ = h / H, d = w, X = w + _, D = [], re = Math.max(1, Math.ceil(_ / Math.max(80, y))), L = (n) => g ? ce(g, n) : le(e.state, n);
  for (let n = 0; n <= h; n += re) D.push({ frame: n, value: L(n) });
  D[D.length - 1]?.frame !== h && D.push({ frame: h, value: L(h) });
  const V = D.flatMap((n) => S.map((p) => p.get(n.value)));
  let b = Math.min(...V), u = Math.max(...V);
  (!Number.isFinite(b) || !Number.isFinite(u)) && (b = -1, u = 1), Math.abs(u - b) < 1e-6 && (b -= 1, u += 1);
  const O = (u - b) * 0.1;
  b -= O, u += O;
  const ae = E(Number(e.curveZoom) || 1, 0.1, 50), R = (u + b) / 2 + (Number(e.curvePanY) || 0), U = (u - b) / ae;
  b = R - U / 2, u = R + U / 2;
  const K = (n) => v + (n - d) / Math.max(1e-6, X - d) * y, T = (n) => f + x * (u - n) / Math.max(1e-6, u - b);
  t.fillStyle = "#111114", t.fillRect(0, 0, o, s), t.strokeStyle = "#222228", t.lineWidth = 1, t.font = "9px system-ui, -apple-system, sans-serif", t.fillStyle = "#6e727a";
  const G = Math.min(16, Math.max(3, Math.floor(y / 65)));
  for (let n = 0; n <= G; n++) {
    const p = Math.round(d + (X - d) * n / G);
    if (p < 0 || p > h) continue;
    const l = K(p);
    l < v || l > o - c || (t.beginPath(), t.moveTo(l, f), t.lineTo(l, f + x), t.stroke(), t.fillText(String(p), l + 2, s - 6));
  }
  for (let n = 0; n <= 4; n++) {
    const p = f + x * n / 4;
    t.beginPath(), t.moveTo(v, p), t.lineTo(o - c, p), t.stroke();
    const l = u - (u - b) * n / 4, i = Math.abs(l) < 10 ? l.toFixed(2) : l.toFixed(1);
    t.fillText(i, 4, p + 3);
  }
  if (b <= 0 && u >= 0) {
    const n = T(0);
    t.strokeStyle = "#383842", t.lineWidth = 1.2, t.beginPath(), t.moveTo(v, n), t.lineTo(o - c, n), t.stroke();
  }
  e.curveHitPoints = [];
  for (const n of S) {
    t.strokeStyle = n.color, t.lineWidth = 2, t.beginPath();
    let p = !1;
    D.forEach((l) => {
      const i = K(l.frame), M = T(n.get(l.value));
      i >= v - 50 && i <= o - c + 50 && (p ? t.lineTo(i, M) : (t.moveTo(i, M), p = !0));
    }), t.stroke();
    for (const l of m) {
      const i = g ? l.transform : l.camera, M = K(l.frame), Z = T(n.get(i)), z = l.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(l.frame);
      z && (t.fillStyle = "rgba(242, 208, 107, 0.35)", t.beginPath(), t.arc(M, Z, 8.5, 0, Math.PI * 2), t.fill()), t.fillStyle = z ? "#ffd75e" : n.color, t.strokeStyle = "#0d0d10", t.lineWidth = 1.6, t.beginPath(), t.arc(M, Z, z ? 5.2 : 3.8, 0, Math.PI * 2), t.fill(), t.stroke(), e.curveHitPoints.push({
        x: M,
        y: Z,
        key: l,
        channel: n,
        minimum: b,
        maximum: u,
        timeMin: d,
        timeMax: X,
        graphHeight: x,
        graphWidth: y,
        lastFrame: h,
        left: v,
        top: f,
        object: g
      });
    }
    if (e.showCurveHandles)
      for (let l = 0; l < m.length; l++) {
        const i = m[l], M = i.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(i.frame);
        if (!(M || e.curveChannelFilter !== "all" || m.length <= 4) || i.interpolation !== "bezier") continue;
        const z = g ? i.transform || g : i.camera || i, N = K(i.frame), B = T(n.get(z)), W = m[l - 1], A = m[l + 1], oe = Math.max(1, i.frame - (W?.frame ?? i.frame - 1)), ne = Math.max(1, (A?.frame ?? i.frame + 1) - i.frame), I = se(
          i,
          n.id,
          W,
          A,
          (P) => n.get(g ? P.transform || g : P.camera || i)
        ), j = (u - b) / Math.max(1, x), J = y * ne / Math.max(1, _), Q = y * oe / Math.max(1, _), q = [];
        (W || l > 0) && q.push({ side: "in", x: N + I.in_x * Q, y: B - I.in_y / j }), (A || l < m.length - 1 || m.length === 1) && q.push({ side: "out", x: N + I.out_x * J, y: B - I.out_y / j });
        for (const P of q) {
          if (t.strokeStyle = n.color, t.lineWidth = M ? 1.5 : 1, t.beginPath(), t.moveTo(N, B), t.lineTo(P.x, P.y), t.stroke(), t.fillStyle = M ? "#2a2233" : "#171720", t.strokeStyle = M ? "#ffd75e" : n.color, t.lineWidth = M ? 2 : 1.2, t.beginPath(), P.side === "in")
            t.arc(P.x, P.y, M ? 5 : 3.8, 0, Math.PI * 2);
          else {
            const $ = M ? 4.5 : 3.2;
            t.rect(P.x - $, P.y - $, $ * 2, $ * 2);
          }
          t.fill(), t.stroke(), e.curveHitPoints.push({
            x: P.x,
            y: P.y,
            key: i,
            keyX: N,
            keyY: B,
            channel: n,
            minimum: b,
            maximum: u,
            timeMin: d,
            timeMax: X,
            top: f,
            left: v,
            graphHeight: x,
            graphWidth: y,
            lastFrame: h,
            object: g,
            handle: P.side,
            pixelPerSegment: P.side === "in" ? Q : J,
            valuePerPixel: j,
            startHandles: { ...I }
          });
        }
      }
  }
  if (e.curveBoxSelect) {
    const n = Math.min(e.curveBoxSelect.startX, e.curveBoxSelect.currentX), p = Math.min(e.curveBoxSelect.startY, e.curveBoxSelect.currentY), l = Math.abs(e.curveBoxSelect.currentX - e.curveBoxSelect.startX), i = Math.abs(e.curveBoxSelect.currentY - e.curveBoxSelect.startY);
    t.fillStyle = "rgba(56, 189, 248, 0.15)", t.fillRect(n, p, l, i), t.strokeStyle = "#38bdf8", t.lineWidth = 1, t.setLineDash([4, 4]), t.strokeRect(n, p, l, i), t.setLineDash([]);
  }
  const Y = K(e.frame);
  Y >= v && Y <= o - c && (t.strokeStyle = "#f2d06b", t.lineWidth = 1.5, t.beginPath(), t.moveTo(Y, f), t.lineTo(Y, f + x), t.stroke(), t.fillStyle = "#f2d06b", t.beginPath(), t.moveTo(Y - 4, f), t.lineTo(Y + 4, f), t.lineTo(Y, f + 6), t.closePath(), t.fill());
  for (const n of e.root.querySelectorAll("[data-tangent-mode]")) {
    const p = e.selectedKeyframe(), l = p?.tangents?.channels?.[S[0]?.id]?.mode || p?.tangents?.mode || "auto";
    n.classList.toggle("active", n.dataset.tangentMode === l);
  }
  for (const n of e.root.querySelectorAll("[data-channel-filter]"))
    n.classList.toggle("active", n.dataset.channelFilter === (e.curveChannelFilter || "all"));
  for (const n of e.root.querySelectorAll("[data-curve-mode]"))
    n.classList.toggle("active", n.dataset.curveMode === e.selectedKeyframe()?.interpolation);
}
export {
  te as curveChannels,
  ke as drawCurveEditor,
  pe as onCurvePointerDown,
  ue as onCurvePointerMove,
  ye as onCurvePointerUp,
  Pe as onCurveWheel,
  Ce as resetCurveZoom,
  Se as setChannelFilter,
  xe as setCurveInterpolation,
  be as setTangentMode,
  Me as toggleCurveHandles,
  De as zoomCurve
};
