const T = {
  good: "#46a758",
  weak: "#e5a23c",
  bad: "#e5484d",
  unknown: "#3a3a48"
};
function w(r) {
  if (!r) return "unknown";
  const t = String(r.state || "").toLowerCase();
  if (T[t]) return t;
  const e = Number(r.coverage);
  return Number.isFinite(e) ? e >= 0.7 ? "good" : e >= 0.35 ? "weak" : "bad" : "unknown";
}
function W(r, t, e = 600) {
  const i = Math.max(1, Number(t) || 0), a = /* @__PURE__ */ new Map();
  for (const s of r || [])
    a.set(Number(s.frame), s);
  const n = Math.max(1, Math.min(i, e)), o = i / n, m = [];
  for (let s = 0; s < n; s += 1) {
    const d = Math.floor(s * o), k = Math.max(d + 1, Math.floor((s + 1) * o));
    let h = "unknown", v = null;
    for (let u = d; u < k; u += 1) {
      const b = a.get(u);
      if (!b) continue;
      const N = w(b);
      (A(N) > A(h) || h === "unknown") && (h = N, v = b);
    }
    m.push({ frame: d, state: h, sample: v });
  }
  return m;
}
function A(r) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[r] ?? 0;
}
function j(r, t, e) {
  const i = Math.max(1, Number(e) || 0), a = Math.max(0, Math.min(1, Number(r) / Math.max(1, Number(t) || 1)));
  return Math.max(0, Math.min(i - 1, Math.round(a * (i - 1))));
}
function J(r, t, e, { currentFrame: i = -1 } = {}) {
  const a = r?.getContext?.("2d"), n = r?.width || 0, o = r?.height || 0, m = W(t, e, Math.max(1, n));
  if (!a || !n || !o) return m;
  a.clearRect(0, 0, n, o);
  const s = n / m.length;
  for (let d = 0; d < m.length; d += 1)
    a.fillStyle = T[m[d].state], a.fillRect(d * s, 0, Math.max(1, s), o);
  if (i >= 0 && e > 0) {
    const d = i / Math.max(1, e - 1) * (n - 1);
    a.fillStyle = "#8b7bd8", a.fillRect(Math.round(d), 0, 2, o);
  }
  return m;
}
function Z(r, t) {
  const e = (r || []).find((a) => Number(a.frame) === Number(t)), i = [["Frame", String(t)]];
  return e ? (i.push(["Tracking state", w(e).toUpperCase()]), Number.isFinite(Number(e.coverage)) && i.push(["Coverage", `${Math.round(Number(e.coverage) * 100)}%`]), e.inliers != null && i.push(["Inliers", String(e.inliers)]), i) : (i.push(["Tracking state", "UNKNOWN"]), i);
}
function G(r, t, e = Number.POSITIVE_INFINITY) {
  const i = Math.max(0, Number(e || 1) - 1);
  return Math.max(0, Math.min(i, Math.round(Number(r || 0) * Math.max(1, Number(t || 24)))));
}
class tt {
  constructor(t, {
    fps: e = 24,
    durationFrames: i = 1,
    onFrame: a = () => {
    },
    onMetadata: n = () => {
    },
    onError: o = () => {
    },
    errorMessage: m = () => "The video could not be played.",
    loop: s = !0,
    muted: d = !0
  } = {}) {
    this.video = t, this.fps = Number(e) || 24, this.durationFrames = Math.max(1, Number(i) || 1), this.frameCount = this.durationFrames, this.onFrame = a, this.onMetadata = n, this.onError = o, this.errorMessage = m, this.loop = !!s, this.muted = !!d, this.url = "", this.error = "", this.primed = !1, this.disposers = [], this._bind();
  }
  _bind() {
    if (!this.video) return;
    const t = (e, i) => {
      this.video.addEventListener(e, i), this.disposers.push(() => this.video?.removeEventListener(e, i));
    };
    t("timeupdate", () => this.onFrame(this.currentFrame())), t("loadedmetadata", () => {
      const e = Math.round((Number(this.video.duration) || 0) * this.fps);
      this.frameCount = Math.max(this.frameCount, e), this.durationFrames = this.frameCount, this.onMetadata({ frameCount: this.frameCount, fps: this.fps, duration: this.video.duration }), this.onFrame(this.currentFrame()), this.primeFirstFrame();
    }), t("loadeddata", () => {
      this.error = "", this.primeFirstFrame(), this.onFrame(this.currentFrame());
    }), t("error", () => {
      this.error = String(this.errorMessage(this.video?.error, this.url)), this.onError(this.error);
    });
  }
  setSource(t, { fps: e, frameCount: i, durationFrames: a } = {}) {
    Number(e) > 0 && (this.fps = Number(e));
    const n = Number(i ?? a);
    if (Number.isFinite(n) && n > 0 && (this.frameCount = n, this.durationFrames = n), !this.video) return !1;
    const o = String(t || "");
    return o === this.url && (!o || !this.error) ? !1 : (this.url = o, this.error = "", this.primed = !1, this.video.pause?.(), o ? this.video.src = o : this.video.removeAttribute?.("src"), this.video.loop = this.loop, this.video.muted = this.muted, this.video.load?.(), !0);
  }
  primeFirstFrame() {
    return !this.video || this.primed || Number(this.video.readyState || 0) < 2 ? !1 : !this.video.paused || Number(this.video.currentTime || 0) > 0 ? (this.primed = !0, !1) : (this.primed = !0, this.video.currentTime = 0.25 / Math.max(1, this.fps), !0);
  }
  currentFrame() {
    const t = Math.max(this.durationFrames, Number(this.frameCount) || 1);
    return this.video ? G(this.video.currentTime, this.fps, t) : 0;
  }
  seekFrame(t) {
    if (!this.video) return !1;
    const e = Math.max(this.durationFrames, Number(this.frameCount) || 1), i = Math.max(0, Math.min(e - 1, Number(t) || 0));
    return this.video.currentTime = i / Math.max(1, this.fps), !0;
  }
  scrub(t) {
    this.seekFrame(t);
    const e = Math.max(this.durationFrames, Number(this.frameCount) || 1);
    this.onFrame(Math.max(0, Math.min(e - 1, Number(t) || 0)));
  }
  setLoop(t) {
    this.loop = !!t, this.video && (this.video.loop = this.loop);
  }
  setMuted(t) {
    this.muted = !!t, this.video && (this.video.muted = this.muted);
  }
  toggle() {
    return this.video ? this.video.paused ? (this.video.play?.()?.catch?.(() => {
    }), !0) : (this.video.pause?.(), !1) : !1;
  }
  dispose() {
    this.url = "";
    for (const t of this.disposers.splice(0)) t();
    this.video && (this.video.pause?.(), this.video.removeAttribute?.("src"), this.video.load?.());
  }
}
const B = {
  ok: "#46a758",
  warn: "#e5a23c",
  over: "#e5484d"
}, I = {
  position: "#8b7bd8",
  target: "#e5a23c",
  fov: "#5aa9e6",
  roll: "#e2649a"
}, C = [
  { key: "position", label: "Camera" },
  { key: "target", label: "Look At" },
  { key: "fov", label: "Focal Length" },
  { key: "roll", label: "Roll" }
], D = 18, U = 9, S = 2, R = 78, V = { solve: "SOLVE", motion: "MOTION" }, F = {
  bands: ["solve", "motion"],
  labels: !0,
  labelWidth: R,
  bandHeight: U,
  bandGap: S,
  laneTopGap: S + 2,
  laneHeight: D,
  laneGap: 0,
  rowChrome: !1,
  ruler: !0,
  playhead: !0,
  topPad: 1,
  bottomPad: 12
}, et = {
  bands: [],
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
function _(r = C, t = F) {
  const e = { ...F, ...t }, i = [];
  let a = e.topPad;
  for (const n of e.bands || [])
    i.length && (a += e.bandGap), i.push({
      kind: "band",
      key: n,
      label: V[n] || String(n).toUpperCase(),
      top: a,
      height: e.bandHeight
    }), a += e.bandHeight;
  for (const n of r)
    i.length && (a += i[i.length - 1].kind === "band" ? e.laneTopGap : e.laneGap), i.push({ kind: "lane", key: n.key, label: n.label, top: a, height: e.laneHeight }), a += e.laneHeight;
  return { rows: i, style: e, height: a + e.bottomPad };
}
function rt(r = C, t = F) {
  return _(r, t).height;
}
function q(r, t) {
  if (!r) return null;
  if (t === "position" || t === "target") {
    const i = r[t];
    return Array.isArray(i) ? i.map(Number) : null;
  }
  const e = Number(r[t === "fov" ? "fov" : "roll"]);
  return Number.isFinite(e) ? [e] : null;
}
function Y(r, t, e = 1e-4) {
  return !r || !t || r.length !== t.length ? !1 : r.every((i, a) => Math.abs(i - t[a]) <= e);
}
function K(r, t = C) {
  const e = Array.isArray(r?.keyframes) ? r.keyframes : [], i = {};
  for (const { key: a } of t) {
    const n = [];
    let o = null;
    for (const m of e) {
      const s = q(m?.camera, a);
      s && ((o === null || !Y(s, o)) && n.push(Number(m.frame) || 0), o = s);
    }
    i[a] = n;
  }
  return i;
}
function it(r, t, e, i = R) {
  const a = Math.max(1, Number(e) || 0), n = Math.max(1, (Number(t) || 1) - i), o = Math.max(0, Math.min(1, (Number(r) - i) / n));
  return Math.max(0, Math.min(a - 1, Math.round(o * (a - 1))));
}
function H(r, t) {
  return Math.max(1, (Number(r) || 1) - t.labelWidth - (t.labelWidth ? 4 : 0));
}
function y(r, t, e, i) {
  const a = Math.max(1, (Number(e) || 1) - 1), n = H(t, i);
  return i.labelWidth + Math.max(0, Math.min(a, r)) / a * n;
}
function Q(r, { y: t, height: e, width: i, frameCount: a, colorAt: n, style: o }) {
  const m = Math.max(1, Number(a) || 0), s = H(i, o), d = Math.max(1, Math.ceil(m / s)), k = Math.max(1, s / Math.ceil(m / d));
  for (let h = 0; h < m; h += d) {
    const v = n(h, Math.min(m, h + d));
    v && (r.fillStyle = v, r.fillRect(o.labelWidth + h / m * s, t, k, e));
  }
}
function X(r, t, e, i) {
  r.fillStyle = i, r.font = "9px system-ui, sans-serif", r.textBaseline = "middle", r.fillText(t, 2, e);
}
function z(r, t, e, i, a, n) {
  const o = Math.max(0, Math.min(n, i / 2, a / 2));
  r.beginPath(), r.moveTo(t + o, e), r.arcTo(t + i, e, t + i, e + a, o), r.arcTo(t + i, e + a, t, e + a, o), r.arcTo(t, e + a, t, e, o), r.arcTo(t, e, t + i, e, o), r.closePath();
}
function $(r, { row: t, width: e, style: i }) {
  const a = i.labelWidth, n = Math.max(2, e - a);
  z(r, a + 0.5, t.top + 0.5, n - 1, t.height - 1, 6), r.fillStyle = "#20202a", r.fill(), r.strokeStyle = "#26262f", r.lineWidth = 1, r.stroke(), t.kind === "lane" && (r.fillStyle = "#2c2c38", r.fillRect(a + 1, Math.round(t.top + t.height / 2), n - 2, 1));
}
function at(r, {
  track: t = null,
  health: e = null,
  quality: i = [],
  frame: a = 0,
  frameCount: n = 0,
  channels: o = C,
  layout: m = F
} = {}) {
  const s = Math.max(1, Number(n) || Number(t?.duration_frames) || 1), d = K(t, o), { rows: k, style: h } = _(o, m), v = {
    total: s,
    labelWidth: h.labelWidth,
    lanes: k.filter((l) => l.kind === "lane").map((l) => ({
      key: l.key,
      top: l.top,
      bottom: l.top + l.height,
      keys: d[l.key] || []
    }))
  }, u = r?.getContext?.("2d"), b = r?.width || 0, N = r?.height || 0;
  if (!u || !b || !N) return { ...v, keys: d };
  u.clearRect(0, 0, b, N);
  const E = new Map((i || []).map((l) => [Number(l.frame), l])), x = Array.isArray(e?.frame_grades) ? e.frame_grades : [], O = {
    solve: (l, c) => {
      let f = null;
      for (let p = l; p < c; p += 1) {
        const M = E.get(p);
        if (!M) continue;
        const g = w(M);
        (!f || L(g) > L(f)) && (f = g);
      }
      return T[f || "unknown"];
    },
    motion: (l, c) => {
      if (!x.length) return T.unknown;
      let f = "ok";
      for (let p = l; p < c; p += 1) {
        const M = x[Math.min(x.length - 1, p)] || "ok";
        P(M) > P(f) && (f = M);
      }
      return B[f];
    }
  };
  for (const l of k) {
    h.rowChrome && $(u, { row: l, width: b, style: h });
    const c = l.top + l.height / 2;
    if (h.labels && X(u, l.label, c, "#9a9aad"), l.kind === "band") {
      const M = O[l.key];
      if (!M) continue;
      const g = h.rowChrome ? 2 : 0;
      Q(u, {
        y: l.top + g,
        height: l.height - g * 2,
        width: b,
        frameCount: s,
        colorAt: M,
        style: h
      });
      continue;
    }
    const f = d[l.key] || [];
    f.length > 1 && !h.rowChrome && (u.strokeStyle = "#2c2c38", u.lineWidth = 1, u.beginPath(), u.moveTo(y(f[0], b, s, h), c), u.lineTo(y(f[f.length - 1], b, s, h), c), u.stroke()), u.fillStyle = I[l.key] || "#8b7bd8";
    const p = h.rowChrome ? 5.5 : 3.5;
    for (const M of f) {
      const g = Math.max(
        h.labelWidth + p,
        Math.min(b - p, y(M, b, s, h))
      );
      u.beginPath(), u.moveTo(g, c - p), u.lineTo(g + p, c), u.lineTo(g, c + p), u.lineTo(g - p, c), u.closePath(), u.fill();
    }
  }
  if (h.ruler) {
    u.fillStyle = "#3a3a48";
    const l = Math.min(12, s);
    for (let c = 0; c <= l; c += 1) {
      const f = Math.round(c / Math.max(1, l) * (s - 1));
      u.fillRect(y(f, b, s, h), N - 6, 1, 5);
    }
  }
  if (h.playhead) {
    const l = y(Math.max(0, Math.min(s - 1, Number(a) || 0)), b, s, h);
    u.fillStyle = "#e6e6f0", u.fillRect(Math.round(l), 0, 1, N);
  }
  return { ...v, keys: d };
}
function L(r) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[r] ?? 0;
}
function P(r) {
  return { ok: 0, warn: 1, over: 2 }[r] ?? 0;
}
export {
  et as D,
  tt as M,
  j as a,
  J as b,
  at as d,
  it as f,
  Z as q,
  rt as t
};
