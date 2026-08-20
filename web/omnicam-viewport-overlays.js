import { project as I, sampleCamera as G, clamp as _, add as W, generatePointField as B, length as N, sub as q } from "./omnicam-core.js";
function g(e, t, n, o = "#5a5a5a", a = 1) {
  const c = e.viewportCamera(), r = I(t, c, e.canvas.width, e.canvas.height), s = I(n, c, e.canvas.width, e.canvas.height);
  !r || !s || (e.ctx.strokeStyle = o, e.ctx.lineWidth = a, e.ctx.beginPath(), e.ctx.moveTo(r[0], r[1]), e.ctx.lineTo(s[0], s[1]), e.ctx.stroke());
}
function Q(e) {
  for (let t = -60; t <= 60; t += 1) {
    const n = t === 0, o = n ? "#6f6f6f" : "#353535";
    g(e, [t, 0, -60], [t, 0, 60], o, n ? 1.6 : 1), g(e, [-60, 0, t], [60, 0, t], o, n ? 1.6 : 1);
  }
}
function j(e) {
  const { points: t, colors: n } = B(e.state.point_density || "balanced", e.state.point_spread || "all_views", e.state.point_color || null);
  if (!t.length) return;
  const o = e.viewportCamera();
  for (let a = 0; a < t.length; a += 3) {
    const c = I([t[a], t[a + 1], t[a + 2]], o, e.canvas.width, e.canvas.height);
    if (!c) continue;
    const r = _(5 / Math.sqrt(c[2]), 1, 4), s = Math.round(n[a] * 255), l = Math.round(n[a + 1] * 255), d = Math.round(n[a + 2] * 255);
    e.ctx.fillStyle = `rgb(${s},${l},${d})`, e.ctx.beginPath(), e.ctx.arc(c[0], c[1], r, 0, Math.PI * 2), e.ctx.fill();
  }
}
function u(e, t) {
  const [n, o, a] = t.size || [1, 1, 1], [c, r, s] = t.position || [0, 0, 0], l = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1]
  ].map((f) => [c + f[0] * n / 2, r + f[1] * o / 2, s + f[2] * a / 2]), d = [
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
  for (const [f, h] of d) g(e, l[f], l[h], "#a0a0a0", 1.4);
}
function tt(e, t) {
  const [n] = t.size || [1.5], [o, a, c] = t.position || [0, 1, 0], r = n / 2;
  for (let s = 0; s < 3; s++) {
    let l = null;
    for (let d = 0; d <= 32; d++) {
      const f = d / 32 * Math.PI * 2;
      let h;
      s === 0 ? h = [o + Math.cos(f) * r, a + Math.sin(f) * r, c] : s === 1 ? h = [o + Math.cos(f) * r, a, c + Math.sin(f) * r] : h = [o, a + Math.cos(f) * r, c + Math.sin(f) * r], l && g(e, l, h, "#999", 1), l = h;
    }
  }
}
function et(e, t) {
  const [n, o, a] = t.position || [0, 0, 0], c = t.size?.[1] || 1.8, r = [n, o + c * 0.88, a], s = [n, o + c * 0.72, a], l = [n, o + c * 0.42, a], d = [n - c * 0.13, o, a], f = [n + c * 0.13, o, a], h = [n - c * 0.28, o + c * 0.48, a], w = [n + c * 0.28, o + c * 0.48, a];
  g(e, s, l, "#aaa", 2), g(e, s, h, "#aaa", 2), g(e, s, w, "#aaa", 2), g(e, l, d, "#aaa", 2), g(e, l, f, "#aaa", 2);
  const m = I(r, e.viewportCamera(), e.canvas.width, e.canvas.height);
  m && (e.ctx.strokeStyle = "#aaa", e.ctx.beginPath(), e.ctx.arc(m[0], m[1], _(28 / m[2], 3, 12), 0, Math.PI * 2), e.ctx.stroke());
}
function at(e, t) {
  const n = t.position || [0, 1, 0], o = 0.25;
  g(e, W(n, [-o, 0, 0]), W(n, [o, 0, 0]), "#bbb", 2), g(e, W(n, [0, -o, 0]), W(n, [0, o, 0]), "#bbb", 2), g(e, W(n, [0, 0, -o]), W(n, [0, 0, o]), "#bbb", 2);
}
function ot(e, t) {
  const [n, o, a] = t.position || [0, 1.5, 0], [c, r] = t.size || [2, 3], s = e.viewportCamera(), l = [
    [n - c / 2, o - r / 2, a],
    [n + c / 2, o - r / 2, a],
    [n + c / 2, o + r / 2, a],
    [n - c / 2, o + r / 2, a]
  ].map((i) => I(i, s, e.canvas.width, e.canvas.height));
  if (l.some((i) => !i)) return;
  const d = l.map((i) => i[0]), f = l.map((i) => i[1]), h = Math.min(...d), w = Math.max(...d), m = Math.min(...f), v = Math.max(...f);
  e.ctx.save(), e.ctx.beginPath(), e.ctx.moveTo(l[0][0], l[0][1]);
  for (let i = 1; i < 4; i++) e.ctx.lineTo(l[i][0], l[i][1]);
  e.ctx.closePath(), e.ctx.clip();
  const x = e.cardMediaById.get(t.id) || (t.id === "subject" ? e.cardMedia : null);
  if (x)
    try {
      const i = Math.max(1, w - h), M = Math.max(1, v - m), P = x.videoWidth || x.naturalWidth || x.width, b = x.videoHeight || x.naturalHeight || x.height, A = e.state.card_fit || "contain";
      if (e.ctx.fillStyle = "#111", e.ctx.fillRect(h, m, i, M), A === "stretch" || !P || !b)
        e.ctx.drawImage(x, h, m, i, M);
      else if (A === "contain") {
        const S = Math.min(i / P, M / b), T = P * S, p = b * S;
        e.ctx.drawImage(x, h + (i - T) / 2, m + (M - p) / 2, T, p);
      } else {
        const S = Math.max(i / P, M / b), T = i / S, p = M / S;
        e.ctx.drawImage(x, (P - T) / 2, (b - p) / 2, T, p, h, m, i, M);
      }
    } catch {
    }
  else
    e.ctx.fillStyle = "#3a414b", e.ctx.fillRect(h, m, w - h, v - m), e.ctx.fillStyle = "#d8d8d8", e.ctx.textAlign = "center", e.ctx.font = `${Math.max(12, Math.min(28, (w - h) * 0.08))}px system-ui`, e.ctx.fillText("SUBJECT CARD", (h + w) / 2, (m + v) / 2);
  e.ctx.restore(), e.ctx.strokeStyle = "#b3b8c1", e.ctx.lineWidth = 2, e.ctx.beginPath(), e.ctx.moveTo(l[0][0], l[0][1]);
  for (let i = 1; i < 4; i++) e.ctx.lineTo(l[i][0], l[i][1]);
  e.ctx.closePath(), e.ctx.stroke();
}
function nt(e) {
  const t = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
  (e.state.cameras || []).forEach((n, o) => {
    const a = n.keyframes || [], c = n.color || t[o % t.length], r = n.id === e.state.active_camera_id;
    if (a.length >= 2)
      for (let s = 0; s < a.length - 1; s++)
        g(e, a[s].camera.position, a[s + 1].camera.position, c, r ? 2.2 : 1.2);
    for (const s of a) {
      const l = I(s.camera.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
      l && (e.ctx.fillStyle = s.frame === e.frame ? "#f2d06b" : c, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], r ? 4.5 : 3.5, 0, Math.PI * 2), e.ctx.fill());
    }
    if (e.state.view_mode !== "camera") {
      const s = G(n, e.frame), l = I(s.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
      l && (e.ctx.fillStyle = r ? "#f2d06b" : c, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], r ? 6.5 : 4.5, 0, Math.PI * 2), e.ctx.fill()), s.target && g(e, s.position, s.target, `${c}88`, 1);
    }
  });
}
function st(e) {
  if (e.state.keyframes.length < 2) return;
  const t = [];
  for (let o = 0; o < e.state.keyframes.length - 1; o++) {
    const a = e.state.keyframes[o], c = e.state.keyframes[o + 1];
    t.push(N(q(c.camera.position, a.camera.position)) * e.state.fps / Math.max(1, c.frame - a.frame));
  }
  const n = Math.max(...t, 1e-6);
  for (let o = 0; o < t.length; o++) {
    const a = 120 * (1 - t[o] / n);
    g(e, e.state.keyframes[o].camera.position, e.state.keyframes[o + 1].camera.position, `hsl(${a} 85% 55%)`, 5);
  }
}
function rt(e) {
  const t = e.ctx, n = e.canvas.width, o = e.canvas.height;
  if (!e.recording && e.state.view_mode === "camera" && e.state.guides !== !1) {
    t.save(), t.strokeStyle = "#ffffff33", t.lineWidth = 1, t.beginPath();
    for (const a of [n / 3, 2 * n / 3])
      t.moveTo(a, 0), t.lineTo(a, o);
    for (const a of [o / 3, 2 * o / 3])
      t.moveTo(0, a), t.lineTo(n, a);
    t.moveTo(n / 2 - 14, o / 2), t.lineTo(n / 2 + 14, o / 2), t.moveTo(n / 2, o / 2 - 14), t.lineTo(n / 2, o / 2 + 14), t.stroke(), t.restore();
  }
  if (!e.recording && e.state.view_mode === "camera" && e.state.safe_areas && (t.save(), t.strokeStyle = "#00d2d388", t.lineWidth = 1, t.setLineDash([4, 4]), t.strokeRect(n * 0.05, o * 0.05, n * 0.9, o * 0.9), t.strokeStyle = "#feca5788", t.strokeRect(n * 0.1, o * 0.1, n * 0.8, o * 0.8), t.restore()), !e.recording && e.state.view_mode === "camera" && e.state.aspect_ratio && e.state.aspect_ratio !== "auto") {
    const a = e.state.aspect_ratio.split(":").map(Number);
    if (a.length === 2 && a[0] > 0 && a[1] > 0) {
      const c = a[0] / a[1], r = n / o;
      if (t.save(), t.fillStyle = "rgba(0, 0, 0, 0.7)", c < r) {
        const s = o * c, l = (n - s) / 2;
        t.fillRect(0, 0, l, o), t.fillRect(n - l, 0, l, o);
      } else if (c > r) {
        const s = n / c, l = (o - s) / 2;
        t.fillRect(0, 0, n, l), t.fillRect(0, o - l, n, l);
      }
      t.restore();
    }
  }
  if (!e.recording)
    try {
      e.drawTransformGizmo();
    } catch (a) {
      console.warn("[OmniCam Gizmo Error]", a);
    }
  if (!e.recording && e.state.show_radar)
    try {
      V(e, t, n, o);
    } catch (a) {
      console.warn("[OmniCam Radar Error]", a);
    }
  if (e.state.burn_in) {
    const a = e.viewportCamera();
    t.save(), t.fillStyle = "#000b", t.fillRect(0, o - 34, n, 34), t.fillStyle = "#fff", t.font = `${Math.max(12, Math.round(o * 0.025))}px monospace`, t.fillText(`F ${e.frame}/${e.state.duration_frames - 1}  ${e.state.fps}fps  FOV ${a.fov.toFixed(1)}  ${e.state.render_mode}`, 12, o - 12), t.restore();
  }
}
function J(e) {
  return e <= -1 ? "#38bdf8" : e <= 0.2 ? "#2dd4bf" : e <= 2.2 ? "#4ade80" : e <= 5 ? "#facc15" : e <= 10 ? "#fb923c" : "#f43f5e";
}
function U(e) {
  return `${e > 0 ? "+" : ""}${e.toFixed(1)}m`;
}
function V(e, t, n, o) {
  if (!n || !o || n < 80 || o < 80) return;
  const a = Math.min(138, Math.max(80, Math.min(n, o) - 20)), c = 10, r = Math.max(0, n - a - c), s = Math.max(0, o - a - c), l = e.viewportCamera(), d = l?.position || [0, 1.5, 5], f = l?.target || [0, 0, 0], h = Math.max(
    Math.abs(d[0] || 0),
    Math.abs(d[2] || 0),
    Math.abs(f[0] || 0),
    Math.abs(f[2] || 0),
    4
  ), w = Math.max(6, Math.ceil((h + 1.5) / 4) * 4), m = r + a / 2, v = s + a / 2, x = a / 2 - 10, i = x / w, M = (y, k) => [m + y * i, v + k * i];
  t.save(), t.beginPath(), typeof t.roundRect == "function" ? t.roundRect(r, s, a, a, 8) : t.rect(r, s, a, a), t.clip(), t.fillStyle = "rgba(10, 14, 22, 0.88)", t.fillRect(r, s, a, a), t.strokeStyle = "rgba(0, 210, 211, 0.35)", t.lineWidth = 1.2, t.strokeRect(r, s, a, a), t.strokeStyle = "rgba(0, 210, 211, 0.12)", t.lineWidth = 1, t.beginPath(), t.arc(m, v, x * 0.5, 0, Math.PI * 2), t.arc(m, v, x, 0, Math.PI * 2), t.stroke(), t.strokeStyle = "rgba(255, 255, 255, 0.12)", t.beginPath(), t.moveTo(r + 6, v), t.lineTo(r + a - 6, v), t.moveTo(m, s + 6), t.lineTo(m, s + a - 6), t.stroke();
  const P = d[1] || 0, b = J(P), A = U(P);
  t.font = "bold 9px monospace", t.fillStyle = "#00d2d3", t.fillText("RADAR", r + 7, s + 13), t.fillStyle = b, t.textAlign = "right", t.fillText(`Y:${A}`, r + a - 7, s + 13), t.textAlign = "left", t.font = "8px monospace", t.fillStyle = "rgba(255, 255, 255, 0.35)", t.fillText(`±${w}m`, r + 7, s + a - 6);
  for (const y of e.state.objects || []) {
    if (y.enabled === !1) continue;
    const k = y.transform?.position || y.position || [0, 0, 0], [C, R] = M(k[0], k[2]);
    C < r + 2 || C > r + a - 2 || R < s + 2 || R > s + a - 2 || (t.fillStyle = y.type === "card" ? "#48dbfb" : y.type === "human" ? "#ff9ff3" : "#feca57", t.beginPath(), t.arc(C, R, 2.5, 0, Math.PI * 2), t.fill());
  }
  for (const y of e.state.keyframes || []) {
    const k = y.camera?.position;
    if (k) {
      const [C, R] = M(k[0], k[2]);
      C >= r + 4 && C <= r + a - 4 && R >= s + 4 && R <= s + a - 4 && (t.fillStyle = y.frame === e.frame ? b : "rgba(108, 130, 176, 0.6)", t.beginPath(), t.arc(C, R, 1.8, 0, Math.PI * 2), t.fill());
    }
  }
  const S = m + d[0] * i, T = v + d[2] * i, p = 8, $ = _(S, r + p, r + a - p), z = _(T, s + p, s + a - p), E = m + f[0] * i, O = v + f[2] * i, F = _(E, r + p, r + a - p), X = _(O, s + p, s + a - p);
  t.strokeStyle = "rgba(255, 255, 255, 0.35)", t.lineWidth = 1, t.setLineDash([2, 2]), t.beginPath(), t.moveTo($, z), t.lineTo(F, X), t.stroke(), t.setLineDash([]), t.fillStyle = "#ffffff", t.beginPath(), t.arc(F, X, 2.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "rgba(255, 255, 255, 0.5)", t.beginPath(), t.arc(F, X, 4.5, 0, Math.PI * 2), t.stroke();
  const Y = f[0] - d[0], Z = f[2] - d[2], H = Math.atan2(Z, Y), D = (l.fov || 35) * Math.PI / 360, L = _(18 * (i / (x / 8)), 14, 28);
  t.fillStyle = b + "28", t.strokeStyle = b, t.lineWidth = 1.2, t.beginPath(), t.moveTo($, z), t.lineTo($ + Math.cos(H - D) * L, z + Math.sin(H - D) * L), t.lineTo($ + Math.cos(H + D) * L, z + Math.sin(H + D) * L), t.closePath(), t.fill(), t.stroke(), t.fillStyle = b + "44", t.beginPath(), t.arc($, z, 6, 0, Math.PI * 2), t.fill(), t.fillStyle = b, t.beginPath(), t.arc($, z, 3.5, 0, Math.PI * 2), t.fill(), t.restore();
}
export {
  nt as drawCameraPath,
  ot as drawCard,
  u as drawCube,
  Q as drawGrid,
  et as drawHuman,
  g as drawLine3D,
  at as drawNull,
  rt as drawOverlays,
  j as drawPointField,
  st as drawSpeedHeatmap,
  tt as drawSphere,
  V as drawTopDownRadar
};
