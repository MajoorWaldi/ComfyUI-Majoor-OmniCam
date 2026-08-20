import { project as T, sampleCamera as I, clamp as C, add as _, generatePointField as W, length as $, sub as D } from "./omnicam-core.js";
function p(t, a, o, e = "#5a5a5a", s = 1) {
  const n = t.viewportCamera(), c = T(a, n, t.canvas.width, t.canvas.height), i = T(o, n, t.canvas.width, t.canvas.height);
  !c || !i || (t.ctx.strokeStyle = e, t.ctx.lineWidth = s, t.ctx.beginPath(), t.ctx.moveTo(c[0], c[1]), t.ctx.lineTo(i[0], i[1]), t.ctx.stroke());
}
function A(t) {
  for (let a = -60; a <= 60; a += 1) {
    const o = a === 0, e = o ? "#6f6f6f" : "#353535";
    p(t, [a, 0, -60], [a, 0, 60], e, o ? 1.6 : 1), p(t, [-60, 0, a], [60, 0, a], e, o ? 1.6 : 1);
  }
}
function F(t) {
  const { points: a, colors: o } = W(t.state.point_density || "balanced", t.state.point_spread || "all_views", t.state.point_color || null);
  if (!a.length) return;
  const e = t.viewportCamera();
  for (let s = 0; s < a.length; s += 3) {
    const n = T([a[s], a[s + 1], a[s + 2]], e, t.canvas.width, t.canvas.height);
    if (!n) continue;
    const c = C(5 / Math.sqrt(n[2]), 1, 4), i = Math.round(o[s] * 255), r = Math.round(o[s + 1] * 255), m = Math.round(o[s + 2] * 255);
    t.ctx.fillStyle = `rgb(${i},${r},${m})`, t.ctx.beginPath(), t.ctx.arc(n[0], n[1], c, 0, Math.PI * 2), t.ctx.fill();
  }
}
function X(t, a) {
  const [o, e, s] = a.size || [1, 1, 1], [n, c, i] = a.position || [0, 0, 0], r = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1]
  ].map((h) => [n + h[0] * o / 2, c + h[1] * e / 2, i + h[2] * s / 2]), m = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
  ];
  for (const [h, f] of m) p(t, r[h], r[f], "#a0a0a0", 1.4);
}
function Z(t, a) {
  const [o] = a.size || [1.5], [e, s, n] = a.position || [0, 1, 0], c = o / 2;
  for (let i = 0; i < 3; i++) {
    let r = null;
    for (let m = 0; m <= 32; m++) {
      const h = m / 32 * Math.PI * 2;
      let f;
      i === 0 ? f = [e + Math.cos(h) * c, s + Math.sin(h) * c, n] : i === 1 ? f = [e + Math.cos(h) * c, s, n + Math.sin(h) * c] : f = [e, s + Math.cos(h) * c, n + Math.sin(h) * c], r && p(t, r, f, "#999", 1), r = f;
    }
  }
}
function B(t, a) {
  const [o, e, s] = a.position || [0, 0, 0], n = a.size?.[1] || 1.8, c = [o, e + n * 0.88, s], i = [o, e + n * 0.72, s], r = [o, e + n * 0.42, s], m = [o - n * 0.13, e, s], h = [o + n * 0.13, e, s], f = [o - n * 0.28, e + n * 0.48, s], x = [o + n * 0.28, e + n * 0.48, s];
  p(t, i, r, "#aaa", 2), p(t, i, f, "#aaa", 2), p(t, i, x, "#aaa", 2), p(t, r, m, "#aaa", 2), p(t, r, h, "#aaa", 2);
  const d = T(c, t.viewportCamera(), t.canvas.width, t.canvas.height);
  d && (t.ctx.strokeStyle = "#aaa", t.ctx.beginPath(), t.ctx.arc(d[0], d[1], C(28 / d[2], 3, 12), 0, Math.PI * 2), t.ctx.stroke());
}
function G(t, a) {
  const o = a.position || [0, 1, 0], e = 0.25;
  p(t, _(o, [-e, 0, 0]), _(o, [e, 0, 0]), "#bbb", 2), p(t, _(o, [0, -e, 0]), _(o, [0, e, 0]), "#bbb", 2), p(t, _(o, [0, 0, -e]), _(o, [0, 0, e]), "#bbb", 2);
}
function N(t, a) {
  const [o, e, s] = a.position || [0, 1.5, 0], [n, c] = a.size || [2, 3], i = t.viewportCamera(), r = [
    [o - n / 2, e - c / 2, s],
    [o + n / 2, e - c / 2, s],
    [o + n / 2, e + c / 2, s],
    [o - n / 2, e + c / 2, s]
  ].map((l) => T(l, i, t.canvas.width, t.canvas.height));
  if (r.some((l) => !l)) return;
  const m = r.map((l) => l[0]), h = r.map((l) => l[1]), f = Math.min(...m), x = Math.max(...m), d = Math.min(...h), S = Math.max(...h);
  t.ctx.save(), t.ctx.beginPath(), t.ctx.moveTo(r[0][0], r[0][1]);
  for (let l = 1; l < 4; l++) t.ctx.lineTo(r[l][0], r[l][1]);
  t.ctx.closePath(), t.ctx.clip();
  const v = t.cardMediaById.get(a.id) || (a.id === "subject" ? t.cardMedia : null);
  if (v)
    try {
      const l = Math.max(1, x - f), M = Math.max(1, S - d), k = v.videoWidth || v.naturalWidth || v.width, b = v.videoHeight || v.naturalHeight || v.height, P = t.state.card_fit || "contain";
      if (t.ctx.fillStyle = "#111", t.ctx.fillRect(f, d, l, M), P === "stretch" || !k || !b)
        t.ctx.drawImage(v, f, d, l, M);
      else if (P === "contain") {
        const y = Math.min(l / k, M / b), g = k * y, w = b * y;
        t.ctx.drawImage(v, f + (l - g) / 2, d + (M - w) / 2, g, w);
      } else {
        const y = Math.max(l / k, M / b), g = l / y, w = M / y;
        t.ctx.drawImage(v, (k - g) / 2, (b - w) / 2, g, w, f, d, l, M);
      }
    } catch {
    }
  else
    t.ctx.fillStyle = "#3a414b", t.ctx.fillRect(f, d, x - f, S - d), t.ctx.fillStyle = "#d8d8d8", t.ctx.textAlign = "center", t.ctx.font = `${Math.max(12, Math.min(28, (x - f) * 0.08))}px system-ui`, t.ctx.fillText("SUBJECT CARD", (f + x) / 2, (d + S) / 2);
  t.ctx.restore(), t.ctx.strokeStyle = "#b3b8c1", t.ctx.lineWidth = 2, t.ctx.beginPath(), t.ctx.moveTo(r[0][0], r[0][1]);
  for (let l = 1; l < 4; l++) t.ctx.lineTo(r[l][0], r[l][1]);
  t.ctx.closePath(), t.ctx.stroke();
}
function O(t) {
  for (const a of t.state.cameras || []) {
    const o = a.keyframes || [];
    if (o.length >= 2)
      for (let e = 0; e < o.length - 1; e++) p(t, o[e].camera.position, o[e + 1].camera.position, "#6c82b0", 2);
    for (const e of o) {
      const s = T(e.camera.position, t.viewportCamera(), t.canvas.width, t.canvas.height);
      s && (t.ctx.fillStyle = e.frame === t.frame ? "#f2d06b" : "#7694d1", t.ctx.beginPath(), t.ctx.arc(s[0], s[1], 4, 0, Math.PI * 2), t.ctx.fill());
    }
    if (t.state.view_mode !== "camera") {
      const e = I(a, t.frame), s = T(e.position, t.viewportCamera(), t.canvas.width, t.canvas.height);
      s && (t.ctx.fillStyle = a.id === t.state.active_camera_id ? "#f2d06b" : "#4aa3ef", t.ctx.beginPath(), t.ctx.arc(s[0], s[1], 6, 0, Math.PI * 2), t.ctx.fill()), e.target && p(t, e.position, e.target, "#f2d06b88", 1);
    }
  }
}
function Y(t) {
  if (t.state.keyframes.length < 2) return;
  const a = [];
  for (let e = 0; e < t.state.keyframes.length - 1; e++) {
    const s = t.state.keyframes[e], n = t.state.keyframes[e + 1];
    a.push($(D(n.camera.position, s.camera.position)) * t.state.fps / Math.max(1, n.frame - s.frame));
  }
  const o = Math.max(...a, 1e-6);
  for (let e = 0; e < a.length; e++) {
    const s = 120 * (1 - a[e] / o);
    p(t, t.state.keyframes[e].camera.position, t.state.keyframes[e + 1].camera.position, `hsl(${s} 85% 55%)`, 5);
  }
}
function q(t) {
  const a = t.ctx, o = t.canvas.width, e = t.canvas.height;
  if (!t.recording && t.state.view_mode === "camera" && t.state.guides !== !1) {
    a.save(), a.strokeStyle = "#ffffff33", a.lineWidth = 1, a.beginPath();
    for (const s of [o / 3, 2 * o / 3])
      a.moveTo(s, 0), a.lineTo(s, e);
    for (const s of [e / 3, 2 * e / 3])
      a.moveTo(0, s), a.lineTo(o, s);
    a.moveTo(o / 2 - 14, e / 2), a.lineTo(o / 2 + 14, e / 2), a.moveTo(o / 2, e / 2 - 14), a.lineTo(o / 2, e / 2 + 14), a.stroke(), a.restore();
  }
  if (!t.recording && t.state.view_mode === "camera" && t.state.safe_areas && (a.save(), a.strokeStyle = "#00d2d388", a.lineWidth = 1, a.setLineDash([4, 4]), a.strokeRect(o * 0.05, e * 0.05, o * 0.9, e * 0.9), a.strokeStyle = "#feca5788", a.strokeRect(o * 0.1, e * 0.1, o * 0.8, e * 0.8), a.restore()), !t.recording && t.state.view_mode === "camera" && t.state.aspect_ratio && t.state.aspect_ratio !== "auto") {
    const s = t.state.aspect_ratio.split(":").map(Number);
    if (s.length === 2 && s[0] > 0 && s[1] > 0) {
      const n = s[0] / s[1], c = o / e;
      if (a.save(), a.fillStyle = "rgba(0, 0, 0, 0.7)", n < c) {
        const i = e * n, r = (o - i) / 2;
        a.fillRect(0, 0, r, e), a.fillRect(o - r, 0, r, e);
      } else if (n > c) {
        const i = o / n, r = (e - i) / 2;
        a.fillRect(0, 0, o, r), a.fillRect(0, e - r, o, r);
      }
      a.restore();
    }
  }
  if (t.recording || t.drawTransformGizmo(), !t.recording && t.state.show_radar && H(t, a, o, e), t.state.burn_in) {
    const s = t.viewportCamera();
    a.save(), a.fillStyle = "#000b", a.fillRect(0, e - 34, o, 34), a.fillStyle = "#fff", a.font = `${Math.max(12, Math.round(e * 0.025))}px monospace`, a.fillText(`F ${t.frame}/${t.state.duration_frames - 1}  ${t.state.fps}fps  FOV ${s.fov.toFixed(1)}  ${t.state.render_mode}`, 12, e - 12), a.restore();
  }
}
function H(t, a, o, e) {
  const c = o - 130 - 14, i = e - 130 - 14, r = 8;
  a.save(), a.fillStyle = "rgba(12, 18, 28, 0.85)", a.strokeStyle = "rgba(0, 210, 211, 0.4)", a.lineWidth = 1.2, a.beginPath(), a.roundRect(c, i, 130, 130, 6), a.fill(), a.stroke(), a.fillStyle = "#00d2d3", a.font = "9px monospace", a.fillText("RADAR 2D (XZ)", c + 8, i + 13);
  const m = c + 130 / 2, h = i + 130 / 2;
  a.strokeStyle = "rgba(255, 255, 255, 0.15)", a.lineWidth = 1, a.beginPath(), a.moveTo(c + 6, h), a.lineTo(c + 130 - 6, h), a.moveTo(m, i + 6), a.lineTo(m, i + 130 - 6), a.stroke(), a.strokeStyle = "rgba(0, 210, 211, 0.15)", a.beginPath(), a.arc(m, h, 4 / r * (130 / 2 - 10), 0, Math.PI * 2), a.stroke();
  const f = (g, w) => {
    const z = 55 / r;
    return [m + g * z, h + w * z];
  };
  for (const g of t.state.objects || []) {
    if (g.enabled === !1) continue;
    const w = g.transform?.position || g.position || [0, 0, 0], [z, R] = f(w[0], w[2]);
    z < c || z > c + 130 || R < i || R > i + 130 || (a.fillStyle = g.type === "card" ? "#48dbfb" : g.type === "human" ? "#ff9ff3" : "#feca57", a.beginPath(), a.arc(z, R, 2.5, 0, Math.PI * 2), a.fill());
  }
  const x = t.viewportCamera(), [d, S] = f(x.position[0], x.position[2]), [v, l] = f(x.target[0], x.target[2]);
  a.strokeStyle = "rgba(255, 234, 167, 0.6)", a.lineWidth = 1, a.setLineDash([2, 2]), a.beginPath(), a.moveTo(d, S), a.lineTo(v, l), a.stroke(), a.setLineDash([]);
  const M = x.target[0] - x.position[0], k = x.target[2] - x.position[2], b = Math.atan2(k, M), P = (x.fov || 35) * Math.PI / 360, y = 22;
  a.fillStyle = "rgba(254, 202, 87, 0.18)", a.strokeStyle = "rgba(254, 202, 87, 0.7)", a.lineWidth = 1.2, a.beginPath(), a.moveTo(d, S), a.lineTo(d + Math.cos(b - P) * y, S + Math.sin(b - P) * y), a.lineTo(d + Math.cos(b + P) * y, S + Math.sin(b + P) * y), a.closePath(), a.fill(), a.stroke(), a.fillStyle = "#fffa65", a.beginPath(), a.arc(d, S, 3.5, 0, Math.PI * 2), a.fill(), a.restore();
}
export {
  O as drawCameraPath,
  N as drawCard,
  X as drawCube,
  A as drawGrid,
  B as drawHuman,
  p as drawLine3D,
  G as drawNull,
  q as drawOverlays,
  F as drawPointField,
  Y as drawSpeedHeatmap,
  Z as drawSphere,
  H as drawTopDownRadar
};
