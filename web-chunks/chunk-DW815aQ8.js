import { $ as R } from "./chunk-CE-YeXfn.js";
function W(r, e, t = Number.POSITIVE_INFINITY) {
  const i = Math.max(0, Number(t || 1) - 1);
  return Math.max(0, Math.min(i, Math.round(Number(r || 0) * Math.max(1, Number(e || 24)))));
}
class J {
  constructor(e, {
    fps: t = 24,
    durationFrames: i = 1,
    onFrame: a = () => {
    },
    onMetadata: o = () => {
    },
    onError: n = () => {
    },
    errorMessage: u = () => "The video could not be played.",
    loop: m = !0,
    muted: s = !0
  } = {}) {
    this.video = e, this.fps = Number(t) || 24, this.durationFrames = Math.max(1, Number(i) || 1), this.frameCount = this.durationFrames, this.onFrame = a, this.onMetadata = o, this.onError = n, this.errorMessage = u, this.loop = !!m, this.muted = !!s, this.url = "", this.error = "", this.primed = !1, this.disposers = [], this._bind();
  }
  _bind() {
    if (!this.video) return;
    const e = (t, i) => {
      this.video.addEventListener(t, i), this.disposers.push(() => this.video?.removeEventListener(t, i));
    };
    e("timeupdate", () => this.onFrame(this.currentFrame())), e("loadedmetadata", () => {
      const t = Math.round((Number(this.video.duration) || 0) * this.fps);
      this.frameCount = Math.max(this.frameCount, t), this.durationFrames = this.frameCount, this.onMetadata({ frameCount: this.frameCount, fps: this.fps, duration: this.video.duration }), this.onFrame(this.currentFrame()), this.primeFirstFrame();
    }), e("loadeddata", () => {
      this.error = "", this.primeFirstFrame(), this.onFrame(this.currentFrame());
    }), e("error", () => {
      this.error = String(this.errorMessage(this.video?.error, this.url)), this.onError(this.error);
    });
  }
  setSource(e, { fps: t, frameCount: i, durationFrames: a } = {}) {
    Number(t) > 0 && (this.fps = Number(t));
    const o = Number(i ?? a);
    if (Number.isFinite(o) && o > 0 && (this.frameCount = o, this.durationFrames = o), !this.video) return !1;
    const n = String(e || "");
    return n === this.url && (!n || !this.error) ? !1 : (this.url = n, this.error = "", this.primed = !1, this.video.pause?.(), n ? this.video.src = n : this.video.removeAttribute?.("src"), this.video.loop = this.loop, this.video.muted = this.muted, this.video.load?.(), !0);
  }
  primeFirstFrame() {
    return !this.video || this.primed || Number(this.video.readyState || 0) < 2 ? !1 : !this.video.paused || Number(this.video.currentTime || 0) > 0 ? (this.primed = !0, !1) : (this.primed = !0, this.video.currentTime = 0.25 / Math.max(1, this.fps), !0);
  }
  currentFrame() {
    const e = Math.max(this.durationFrames, Number(this.frameCount) || 1);
    return this.video ? W(this.video.currentTime, this.fps, e) : 0;
  }
  seekFrame(e) {
    if (!this.video) return !1;
    const t = Math.max(this.durationFrames, Number(this.frameCount) || 1), i = Math.max(0, Math.min(t - 1, Number(e) || 0));
    return this.video.currentTime = i / Math.max(1, this.fps), !0;
  }
  scrub(e) {
    this.seekFrame(e);
    const t = Math.max(this.durationFrames, Number(this.frameCount) || 1);
    this.onFrame(Math.max(0, Math.min(t - 1, Number(e) || 0)));
  }
  setLoop(e) {
    this.loop = !!e, this.video && (this.video.loop = this.loop);
  }
  setMuted(e) {
    this.muted = !!e, this.video && (this.video.muted = this.muted);
  }
  toggle() {
    return this.video ? this.video.paused ? (this.video.play?.()?.catch?.(() => {
    }), !0) : (this.video.pause?.(), !1) : !1;
  }
  dispose() {
    this.url = "";
    for (const e of this.disposers.splice(0)) e();
    this.video && (this.video.pause?.(), this.video.removeAttribute?.("src"), this.video.load?.());
  }
}
const w = {
  good: "#46a758",
  weak: "#e5a23c",
  bad: "#e5484d",
  unknown: "#3a3a48"
};
function A(r) {
  if (!r) return "unknown";
  const e = String(r.state || "").toLowerCase();
  if (w[e]) return e;
  const t = Number(r.coverage);
  return Number.isFinite(t) ? t >= 0.7 ? "good" : t >= 0.35 ? "weak" : "bad" : "unknown";
}
function Z(r, e) {
  const t = (r || []).find((a) => Number(a.frame) === Number(e)), i = [["Frame", String(e)]];
  return t ? (i.push(["Tracking state", A(t).toUpperCase()]), Number.isFinite(Number(t.coverage)) && i.push(["Coverage", `${Math.round(Number(t.coverage) * 100)}%`]), t.inliers != null && i.push(["Inliers", String(t.inliers)]), i) : (i.push(["Tracking state", "UNKNOWN"]), i);
}
const G = {
  position: "#8b7bd8",
  target: "#e5a23c",
  roll: "#e2649a"
}, S = [
  { key: "position", label: "Camera" },
  { key: "target", label: "Look At" },
  { key: "roll", label: "Roll" }
], O = 18, B = 9, _ = 2, L = 78, I = { solve: "SOLVE HEALTH" }, T = {
  bands: ["solve"],
  labels: !0,
  labelWidth: L,
  bandHeight: B,
  bandGap: _,
  laneTopGap: _ + 2,
  laneHeight: O,
  laneGap: 0,
  rowChrome: !1,
  ruler: !0,
  playhead: !0,
  topPad: 1,
  bottomPad: 12
}, ee = {
  bands: ["solve"],
  labels: !1,
  labelWidth: 0,
  bandHeight: 28,
  bandGap: 4,
  laneTopGap: 4,
  laneHeight: 28,
  laneGap: 4,
  rowChrome: !0,
  ruler: !1,
  playhead: !1,
  topPad: 0,
  bottomPad: 0
};
function x(r = S, e = T) {
  const t = { ...T, ...e }, i = [];
  let a = t.topPad;
  for (const o of t.bands || [])
    i.length && (a += t.bandGap), i.push({
      kind: "band",
      key: o,
      label: I[o] || String(o).toUpperCase(),
      top: a,
      height: t.bandHeight
    }), a += t.bandHeight;
  for (const o of r)
    i.length && (a += i[i.length - 1].kind === "band" ? t.laneTopGap : t.laneGap), i.push({ kind: "lane", key: o.key, label: o.label, top: a, height: t.laneHeight }), a += t.laneHeight;
  return { rows: i, style: t, height: a + t.bottomPad };
}
function te(r = S, e = T) {
  return x(r, e).height;
}
function D(r, e) {
  if (!r) return null;
  if (e === "position" || e === "target") {
    const i = r[e];
    return Array.isArray(i) ? i.map(Number) : null;
  }
  const t = Number(r.roll);
  return Number.isFinite(t) ? [t] : null;
}
function U(r, e, t = 1e-4) {
  return !r || !e || r.length !== e.length ? !1 : r.every((i, a) => Math.abs(i - e[a]) <= t);
}
function $(r, e = S) {
  const t = Array.isArray(r?.keyframes) ? r.keyframes : [], i = {};
  for (const { key: a } of e) {
    const o = [];
    let n = null;
    for (const u of t) {
      const m = D(u?.camera, a);
      m && ((n === null || !U(m, n)) && o.push(Number(u.frame) || 0), n = m);
    }
    i[a] = o;
  }
  return i;
}
function re(r, e = null, t = "generic") {
  if (!r?.keyframes?.length || !e) return null;
  try {
    const a = Array.isArray(r.objects) && r.objects.some((o) => o?.id === "subject" && Array.isArray(o.position)) ? e : { ...e, allow_framing_loss: !0 };
    return R(r, a, null, t);
  } catch {
    return null;
  }
}
function ie(r, e, t, i = L) {
  const a = Math.max(1, Number(t) || 0), o = Math.max(1, (Number(e) || 1) - i), n = Math.max(0, Math.min(1, (Number(r) - i) / o));
  return Math.max(0, Math.min(a - 1, Math.round(n * (a - 1))));
}
function H(r, e) {
  return Math.max(1, (Number(r) || 1) - e.labelWidth - (e.labelWidth ? 4 : 0));
}
function M(r, e, t, i) {
  const a = Math.max(1, (Number(t) || 1) - 1), o = H(e, i);
  return i.labelWidth + Math.max(0, Math.min(a, r)) / a * o;
}
function j(r, e) {
  const t = Math.max(0, Number(e) - 1);
  return (r || []).map((i) => {
    const a = Math.max(0, Math.min(t, Number(i?.start_frame ?? i?.frame) || 0)), o = Math.max(a, Math.min(t, Number(i?.end_frame ?? i?.frame) || a));
    return { start: a, end: o, level: i?.level === "error" ? "error" : "warn" };
  });
}
function V(r, e, t, i, a, o) {
  for (const n of e) {
    const u = M(n.start, i, a, o), m = M(n.end, i, a, o), s = Math.max(2, m - u + 2);
    r.fillStyle = "#101014", r.fillRect(Math.round(u - 1), t.top + 2, Math.ceil(s + 2), t.height - 4), r.fillStyle = n.level === "error" ? "#ffffff" : "#f2c66d", r.fillRect(Math.round(u), t.top + 3, Math.ceil(s), t.height - 6);
  }
}
function Y(r, { y: e, height: t, width: i, frameCount: a, colorAt: o, style: n }) {
  const u = Math.max(1, Number(a) || 0), m = H(i, n), s = Math.max(1, Math.ceil(u / m)), v = Math.max(1, m / Math.ceil(u / s));
  for (let b = 0; b < u; b += s) {
    const f = o(b, Math.min(u, b + s));
    f && (r.fillStyle = f, r.fillRect(n.labelWidth + b / u * m, e, v, t));
  }
}
function q(r, e, t, i) {
  const a = new Map((r || []).map((n) => [Number(n.frame), n]));
  let o = "unknown";
  for (let n = Math.max(0, Number(t) || 0); n < Math.max(0, Number(i) || 0); n += 1) {
    const u = A(a.get(n)), m = String((e || [])[n] || "").toLowerCase(), s = m === "over" ? "bad" : m === "warn" ? "weak" : m === "ok" ? "good" : "unknown";
    F(u) > F(o) && (o = u), F(s) > F(o) && (o = s);
  }
  return o;
}
function ae(r, e, t) {
  const i = Number(t) || 0, a = (r || []).find((u) => Number(u.frame) === i), o = String(e?.frame_grades?.[i] || "unknown").toUpperCase(), n = [["Solve state", A(a).toUpperCase()], ["Motion grade", o]];
  a && Number.isFinite(Number(a.coverage)) && n.push(["Coverage", `${Math.round(Number(a.coverage) * 100)}%`]), a?.inliers != null && n.push(["Inliers", String(a.inliers)]);
  for (const u of ["speed", "angular_speed", "acceleration", "jerk"]) {
    const m = Number(e?.series?.[u]?.[i]), s = Number(e?.limits?.[`max_${u}`]);
    Number.isFinite(m) && n.push([u.replace("_", " "), Number.isFinite(s) ? `${m.toFixed(2)} / ${s}` : m.toFixed(2)]);
  }
  return e?.framing?.[i] === !1 && !e?.limits?.allow_framing_loss && n.push(["Framing", "LOSS"]), n;
}
function K(r, e, t, i) {
  r.fillStyle = i, r.font = "9px system-ui, sans-serif", r.textBaseline = "middle", r.fillText(e, 2, t);
}
function Q(r, e, t, i, a, o) {
  const n = Math.max(0, Math.min(o, i / 2, a / 2));
  r.beginPath(), r.moveTo(e + n, t), r.arcTo(e + i, t, e + i, t + a, n), r.arcTo(e + i, t + a, e, t + a, n), r.arcTo(e, t + a, e, t, n), r.arcTo(e, t, e + i, t, n), r.closePath();
}
function X(r, { row: e, width: t, style: i }) {
  const a = i.labelWidth, o = Math.max(2, t - a);
  Q(r, a + 0.5, e.top + 0.5, o - 1, e.height - 1, 6), r.fillStyle = "#20202a", r.fill(), r.strokeStyle = "#26262f", r.lineWidth = 1, r.stroke(), e.kind === "lane" && (r.fillStyle = "#2c2c38", r.fillRect(a + 1, Math.round(e.top + e.height / 2), o - 2, 1));
}
function oe(r, {
  track: e = null,
  health: t = null,
  quality: i = [],
  anomalies: a = [],
  frame: o = 0,
  frameCount: n = 0,
  channels: u = S,
  layout: m = T
} = {}) {
  const s = Math.max(1, Number(n) || Number(e?.duration_frames) || 1), v = $(e, u), { rows: b, style: f } = x(u, m), C = {
    total: s,
    labelWidth: f.labelWidth,
    lanes: b.filter((l) => l.kind === "lane").map((l) => ({
      key: l.key,
      top: l.top,
      bottom: l.top + l.height,
      keys: v[l.key] || []
    })),
    anomalies: j(a, s)
  }, h = r?.getContext?.("2d"), c = r?.width || 0, k = r?.height || 0;
  if (!h || !c || !k) return { ...C, keys: v };
  h.clearRect(0, 0, c, k);
  const P = Array.isArray(t?.frame_grades) ? t.frame_grades : [], E = {
    solve: (l, d) => w[q(i, P, l, d)]
  };
  for (const l of b) {
    f.rowChrome && X(h, { row: l, width: c, style: f });
    const d = l.top + l.height / 2;
    if (f.labels && K(h, l.label, d, "#9a9aad"), l.kind === "band") {
      const y = E[l.key];
      if (!y) continue;
      const g = f.rowChrome ? 2 : 0;
      Y(h, {
        y: l.top + g,
        height: l.height - g * 2,
        width: c,
        frameCount: s,
        colorAt: y,
        style: f
      }), l.key === "solve" && V(h, C.anomalies, l, c, s, f);
      continue;
    }
    const p = v[l.key] || [];
    p.length > 1 && !f.rowChrome && (h.strokeStyle = "#2c2c38", h.lineWidth = 1, h.beginPath(), h.moveTo(M(p[0], c, s, f), d), h.lineTo(M(p[p.length - 1], c, s, f), d), h.stroke()), h.fillStyle = G[l.key] || "#8b7bd8";
    const N = f.rowChrome ? 5.5 : 3.5;
    for (const y of p) {
      const g = Math.max(
        f.labelWidth + N,
        Math.min(c - N, M(y, c, s, f))
      );
      h.beginPath(), h.moveTo(g, d - N), h.lineTo(g + N, d), h.lineTo(g, d + N), h.lineTo(g - N, d), h.closePath(), h.fill();
    }
  }
  if (f.ruler) {
    h.fillStyle = "#3a3a48";
    const l = Math.min(12, s);
    for (let d = 0; d <= l; d += 1) {
      const p = Math.round(d / Math.max(1, l) * (s - 1));
      h.fillRect(M(p, c, s, f), k - 6, 1, 5);
    }
  }
  if (f.playhead) {
    const l = M(Math.max(0, Math.min(s - 1, Number(o) || 0)), c, s, f);
    h.fillStyle = "#e6e6f0", h.fillRect(Math.round(l), 0, 1, k);
  }
  return { ...C, keys: v };
}
function F(r) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[r] ?? 0;
}
export {
  ee as D,
  J as M,
  re as a,
  $ as c,
  oe as d,
  ie as f,
  ae as h,
  Z as q,
  te as t
};
