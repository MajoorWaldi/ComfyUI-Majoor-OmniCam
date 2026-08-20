function re(t) {
  if (!t) return "";
  const a = String(t).match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/), e = a?.[1] || String(t), o = a?.[2] || "input", n = e.lastIndexOf("/"), s = n >= 0 ? e.slice(0, n) : "", c = n >= 0 ? e.slice(n + 1) : e;
  return W(`/view?filename=${encodeURIComponent(c)}&subfolder=${encodeURIComponent(s)}&type=${encodeURIComponent(o)}`);
}
let W = (t) => t;
function ne({ api: t }) {
  W = (a) => t.apiURL ? t.apiURL(a) : a;
}
function Q(t) {
  const a = D(t.target, t.position), e = Math.sqrt(q(a, a)) < 1e-6 ? [0, 0, -1] : $(a);
  let o = t.up || [0, 1, 0], n = U(e, o);
  Math.sqrt(q(n, n)) < 1e-6 && (o = Math.abs(e[1]) > 0.9 ? [0, 0, e[1] > 0 ? -1 : 1] : [0, 1, 0], n = U(e, o)), n = $(n);
  let s = $(U(n, e));
  if (Math.abs(t.roll || 0) > 1e-9) {
    const c = t.roll * Math.PI / 180, m = Math.cos(c), i = Math.sin(c), f = H(j(n, m), j(s, i));
    s = H(j(s, m), j(n, -i)), n = f;
  }
  return { right: n, up: s, forward: e };
}
function se(t, a, e, o) {
  const { right: n, up: s, forward: c } = Q(a), m = D(t, a.position), i = q(m, c);
  if (i <= Math.max(1e-4, a.near || 0.01) || i >= (a.far || 1e4)) return null;
  const f = q(m, n), r = q(m, s);
  if (a.camera_type === "orthographic") {
    const p = 5 / Math.max(0.01, a.zoom || 1), d = p * e / Math.max(1, o);
    return [e * (0.5 + f / (2 * d)), o * (0.5 - r / (2 * p)), i];
  }
  const _ = 0.5 * o / Math.tan(Math.max(1e-3, a.fov) * Math.PI / 360);
  return [e * 0.5 + f * _ / i, o * 0.5 - r * _ / i, i];
}
function ie(t, a, e) {
  const o = ((a - t + 540) % 360 + 360) % 360 - 180;
  return t + o * e;
}
function X(t, a, e = null) {
  const o = (t.keyframes || []).map((l) => ({
    ...l,
    camera: F(l.camera || l || t.camera || P())
  }));
  if (!o.length) return F(t.camera || P());
  const n = w(o, a, "pos_x", (l) => (l.camera || l).position[0]), s = w(o, a, "pos_y", (l) => (l.camera || l).position[1]), c = w(o, a, "pos_z", (l) => (l.camera || l).position[2]);
  let m = w(o, a, "target_x", (l) => (l.camera || l).target[0]), i = w(o, a, "target_y", (l) => (l.camera || l).target[1]), f = w(o, a, "target_z", (l) => (l.camera || l).target[2]);
  const r = t.target_object_id || t.camera?.target_object_id, _ = e || t.objects;
  if (r && Array.isArray(_)) {
    const l = _.find((A) => A.id === r);
    if (l) {
      const A = l.keyframes?.length ? ee(l, a) : l, z = t.target_offset || t.camera?.target_offset || [0, 0, 0];
      m = (A.position?.[0] ?? 0) + (z[0] || 0), i = (A.position?.[1] ?? 1.5) + (z[1] || 0), f = (A.position?.[2] ?? 0) + (z[2] || 0);
    }
  }
  const p = w(o, a, "fov", (l) => Number((l.camera || l).fov ?? 35)), d = w(o, a, "roll", (l) => Number((l.camera || l).roll ?? 0), !0), y = w(o, a, "zoom", (l) => Number((l.camera || l).zoom ?? 1)), b = w(o, a, "near", (l) => Number((l.camera || l).near ?? 0.01)), u = w(o, a, "far", (l) => Number((l.camera || l).far ?? 1e4)), g = o[0]?.camera || o[0] || P();
  let h = o[0];
  for (const l of o)
    if ((l.frame ?? 0) <= a) h = l;
    else break;
  const M = (h.camera || h).camera_type;
  return {
    position: [n, s, c],
    target: [m, i, f],
    fov: N(p, 5, 150),
    roll: d,
    camera_type: M || "perspective",
    zoom: Math.max(0.01, y),
    near: Math.max(1e-4, b),
    far: Math.max(b + 1e-4, u),
    ...g.up ? { up: [...g.up] } : {}
  };
}
function T(t, a = 0) {
  return Math.sin(t * 1.7 + a * 3.1) * 0.5 + Math.sin(t * 3.3 + a * 5.7) * 0.3 + Math.sin(t * 7.9 + a * 11.3) * 0.2;
}
function ce(t, { type: a = "handheld_subtle", intensity: e = 1, duration_frames: o = null, subdivide: n = !0 } = {}) {
  const s = Array.isArray(t) ? t : t?.keyframes || [];
  if (!s || s.length === 0) return s;
  const c = a === "turbulence", m = a === "handheld_heavy", i = (c ? 0.12 : m ? 0.18 : 0.06) * e, f = (c ? 2 : m ? 2.8 : 0.9) * e, r = c ? 0.45 : m ? 0.22 : 0.12, _ = s[s.length - 1]?.frame ?? 119, p = Math.max(_ + 1, Number(o || (t?.duration_frames ?? _ + 1))), d = c ? 4 : m ? 6 : 8, y = Array.isArray(t) ? { keyframes: s } : t, b = new Set(s.map((g) => g.frame));
  if (n && p > d) {
    for (let g = 0; g < p; g += d)
      b.add(g);
    b.add(p - 1);
  }
  return [...b].sort((g, h) => g - h).map((g) => {
    const h = X(y, g), M = T(g * r, 1) * i, l = T(g * r, 2) * i, A = T(g * r, 3) * i * 0.5, z = T(g * r, 4) * f, v = T(g * r, 5) * (f * 0.35), x = [...h.position], S = [...h.target];
    return x[0] += M, x[1] += l, x[2] += A, S[0] += M * 0.35, S[1] += l * 0.35, {
      frame: g,
      camera: {
        ...h,
        position: x,
        target: S,
        roll: (h.roll || 0) + z,
        fov: N((h.fov || 35) + v, 10, 140)
      },
      interpolation: "smooth"
    };
  });
}
function le(t, { duration_frames: a = 120, target: e = [0, 1.5, 0], radius: o = 6, height: n = 3.5 } = {}) {
  const s = [], c = Math.max(2, a), [m, i, f] = e;
  if (t === "orbit_360")
    for (let _ = 0; _ < 5; _++) {
      const p = Math.round(_ / 4 * (c - 1)), d = _ / 4 * Math.PI * 2;
      s.push({
        frame: p,
        camera: {
          position: [m + Math.sin(d) * o, i + n, f + Math.cos(d) * o],
          target: [m, i, f],
          fov: 35,
          roll: 0,
          camera_type: "perspective",
          zoom: 1,
          near: 0.01,
          far: 1e4
        },
        interpolation: "bezier"
      });
    }
  else t === "push_in" ? s.push(
    {
      frame: 0,
      camera: { position: [m, i + n, f + o * 1.6], target: [m, i, f], fov: 42, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: c - 1,
      camera: { position: [m, i + n * 0.5, f + o * 0.6], target: [m, i, f], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : t === "pull_out" ? s.push(
    {
      frame: 0,
      camera: { position: [m, i + n * 0.4, f + o * 0.6], target: [m, i, f], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: c - 1,
      camera: { position: [m, i + n * 1.2, f + o * 1.8], target: [m, i, f], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : t === "dolly_zoom" && s.push(
    {
      frame: 0,
      camera: { position: [m, i + n * 0.7, f + o * 1.8], target: [m, i, f], fov: 24, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    },
    {
      frame: c - 1,
      camera: { position: [m, i + n * 0.5, f + o * 0.6], target: [m, i, f], fov: 65, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    }
  );
  return s;
}
const N = (t, a, e) => Math.max(a, Math.min(e, t)), R = (t, a, e) => t + (a - t) * e, me = (t = 0, a = 0, e = 0) => [t, a, e], H = (t, a) => [t[0] + a[0], t[1] + a[1], t[2] + a[2]], D = (t, a) => [t[0] - a[0], t[1] - a[1], t[2] - a[2]], j = (t, a) => [t[0] * a, t[1] * a, t[2] * a], q = (t, a) => t[0] * a[0] + t[1] * a[1] + t[2] * a[2], U = (t, a) => [t[1] * a[2] - t[2] * a[1], t[2] * a[0] - t[0] * a[2], t[0] * a[1] - t[1] * a[0]], Y = (t) => Math.sqrt(Math.max(1e-12, q(t, t))), $ = (t) => j(t, 1 / Y(t)), pe = (t, a, e) => [R(t[0], a[0], e), R(t[1], a[1], e), R(t[2], a[2], e)];
function ue(t, a, e) {
  const o = [e[0] - a[0], e[1] - a[1]], n = [t[0] - a[0], t[1] - a[1]], s = Math.max(1e-9, o[0] * o[0] + o[1] * o[1]), c = N((n[0] * o[0] + n[1] * o[1]) / s, 0, 1);
  return Math.hypot(t[0] - a[0] - o[0] * c, t[1] - a[1] - o[1] * c);
}
function Z(t, a = "ease") {
  return t = N(t, 0, 1), a === "linear" ? t : a === "ease_in" ? t * t : a === "ease_out" ? 1 - (1 - t) * (1 - t) : a === "smooth" ? t * t * t * (t * (t * 6 - 15) + 10) : a === "bezier" ? 0.15 * (1 - t) * (1 - t) * t + 2.85 * (1 - t) * t * t + t * t * t : t * t * (3 - 2 * t);
}
const k = ["auto", "vector", "free", "aligned", "flat"];
function _e() {
  return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: "auto" };
}
function K(t, a) {
  const e = t?.tangents;
  return !e || typeof e != "object" ? {} : e.channels && typeof e.channels == "object" && e.channels[a] ? e.channels[a] : e;
}
function E(t, a, e, o, n) {
  const s = K(t, a), c = k.includes(s.mode) ? s.mode : t?.tangents?.mode || "auto", m = n ? n(t) : 0, i = e && n ? n(e) : m, f = o && n ? n(o) : m, r = Math.max(1e-6, t.frame - (e?.frame ?? t.frame - 1)), _ = Math.max(1e-6, (o?.frame ?? t.frame + 1) - t.frame), p = () => {
    const h = (m - i) / r, M = (f - m) / _;
    let l = (h + M) * 0.5;
    return e ? o || (l = h) : l = M, h * M <= 0 && e && o && (l = 0), {
      out_x: 1 / 3,
      out_y: l * _ * (1 / 3),
      in_x: -1 / 3,
      in_y: -l * r * (1 / 3)
    };
  };
  if (c === "vector") {
    const h = (m - i) / r, M = (f - m) / _;
    return {
      out_x: 1 / 3,
      out_y: M * _ * (1 / 3),
      in_x: -1 / 3,
      in_y: -h * r * (1 / 3),
      mode: c
    };
  }
  if (c === "flat")
    return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: c };
  if (c === "auto")
    return { ...p(), mode: c };
  const d = p(), y = N(Number(s.out_x ?? d.out_x), 0.01, 0.99), b = Number(s.out_y ?? d.out_y);
  let u = N(Number(s.in_x ?? d.in_x), -0.99, -0.01), g = Number(s.in_y ?? d.in_y);
  if (c === "aligned") {
    const h = Math.hypot(y, b) || 1e-6, M = Math.hypot(u, g) || 1e-6;
    u = -y / h * M, g = -b / h * M;
  }
  return { out_x: y, out_y: b, in_x: u, in_y: g, mode: c };
}
function G(t, a, e) {
  return E(t, "default", a, e, (o) => Number(o.value ?? 0));
}
function fe(t, a, e, o, n, s) {
  const c = G(a, e, o), m = N(c.out_x, 0.01, 0.99), i = N(1 + c.in_x, 0.01, 0.99), f = c.out_y / Math.max(1e-6, c.out_x) / Math.max(1, n), r = c.in_y / Math.max(1e-6, Math.abs(c.in_x)) / Math.max(1, s || n), _ = f * m, p = 1 + r * (i - 1), d = N(t, 0, 1), y = 1 - d;
  return 3 * y * y * d * _ + 3 * y * d * d * p + d * d * d;
}
function w(t, a, e, o, n = !1) {
  if (!t.length) return 0;
  if (a <= t[0].frame) return o(t[0]);
  if (a >= t[t.length - 1].frame) return o(t[t.length - 1]);
  let s = 0;
  for (let u = 0; u < t.length - 1; u++)
    if (t[u].frame <= a && a <= t[u + 1].frame) {
      s = u;
      break;
    }
  const c = t[s], m = t[s + 1], i = s > 0 ? t[s - 1] : null, f = s + 2 < t.length ? t[s + 2] : null, r = Math.max(1, m.frame - c.frame), _ = N((a - c.frame) / r, 0, 1);
  let p = o(c), d = o(m);
  if (n) {
    const u = ((d - p + 540) % 360 + 360) % 360 - 180;
    d = p + u;
  }
  if (c.interpolation === "bezier" || m.interpolation === "bezier") {
    const u = E(c, e, i, m, o), g = E(m, e, c, f, o), h = p, M = p + (u.out_y || 0), l = d + (g.in_y || 0), A = d, z = N(Number(u.out_x ?? 1 / 3), 0, 1), v = N(1 + Number(g.in_x ?? -1 / 3), 0, 1);
    let x = 0, S = 1;
    for (let L = 0; L < 32; L++) {
      const I = (x + S) * 0.5, O = 1 - I;
      3 * O * O * I * z + 3 * O * I * I * v + I * I * I < _ ? x = I : S = I;
    }
    const C = (x + S) * 0.5, B = 1 - C;
    return B * B * B * h + 3 * B * B * C * M + 3 * B * C * C * l + C * C * C * A;
  }
  const b = Z(_, c.interpolation);
  return p + (d - p) * b;
}
function P() {
  return { position: [6, 4, 6], target: [0, 1.5, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 };
}
function J() {
  const t = [0, 1, 0], a = (e, o = [0, 1, 0], n = "orthographic") => ({ ...P(), position: e, target: [...t], up: o, camera_type: n, zoom: 1 });
  return {
    perspective: a([8, 6, 8], [0, 1, 0], "perspective"),
    top: a([0, 14, 0], [0, 0, -1]),
    right: a([14, 1, 0]),
    left: a([-14, 1, 0]),
    bottom: a([0, -12, 0], [0, 0, 1])
  };
}
function V(t) {
  const a = t.size || [1, 1, 1], e = a.length === 2 ? [...a, 0.01] : [...a];
  return { position: [...t.position || [0, 0, 0]], rotation: [...t.rotation || [0, 0, 0]], size: e };
}
function de(t, a) {
  const e = new Map(t.map((f) => [f.id, f]));
  let o = [...a.position || [0, 0, 0]], n = [...a.rotation || [0, 0, 0]], s = a.size || [1, 1, 1], c = s.length === 2 ? [...s, 0.01] : [...s];
  const m = /* @__PURE__ */ new Set([a.id]);
  let i = a.parent_id ? e.get(a.parent_id) : null;
  for (; i && !m.has(i.id); ) {
    m.add(i.id);
    const f = [o[0] * (i.size?.[0] ?? 1), o[1] * (i.size?.[1] ?? 1), o[2] * (i.size?.[2] ?? 1)], r = ae(f, i.rotation || [0, 0, 0]);
    o = H(r, i.position || [0, 0, 0]), n = [n[0] + (i.rotation?.[0] ?? 0), n[1] + (i.rotation?.[1] ?? 0), n[2] + (i.rotation?.[2] ?? 0)], c = [c[0] * (i.size?.[0] ?? 1), c[1] * (i.size?.[1] ?? 1), c[2] * (i.size?.[2] ?? 1)], i = i.parent_id ? e.get(i.parent_id) : null;
  }
  return { position: o, rotation: n, size: c };
}
function ee(t, a) {
  const e = t.keyframes || [];
  if (!e.length) return V(t);
  const o = V(t), n = (u, g) => (u.transform?.position || o.position)[g] ?? 0, s = (u, g) => (u.transform?.rotation || o.rotation)[g] ?? 0, c = (u, g) => (u.transform?.size || o.size)[g] ?? (g === 2 ? 0.01 : 1), m = w(e, a, "pos_x", (u) => n(u, 0)), i = w(e, a, "pos_y", (u) => n(u, 1)), f = w(e, a, "pos_z", (u) => n(u, 2)), r = w(e, a, "rot_x", (u) => s(u, 0), !0), _ = w(e, a, "rot_y", (u) => s(u, 1), !0), p = w(e, a, "rot_z", (u) => s(u, 2), !0), d = w(e, a, "scale_x", (u) => c(u, 0)), y = w(e, a, "scale_y", (u) => c(u, 1)), b = w(e, a, "scale_z", (u) => c(u, 2));
  return {
    position: [Number.isFinite(m) ? m : o.position[0], Number.isFinite(i) ? i : o.position[1], Number.isFinite(f) ? f : o.position[2]],
    rotation: [Number.isFinite(r) ? r : o.rotation[0], Number.isFinite(_) ? _ : o.rotation[1], Number.isFinite(p) ? p : o.rotation[2]],
    size: [
      Math.max(0.01, Number.isFinite(d) ? d : o.size[0]),
      Math.max(0.01, Number.isFinite(y) ? y : o.size[1]),
      Math.max(0.01, Number.isFinite(b) ? b : o.size[2])
    ]
  };
}
function ge(t = "balanced", a = "all_views", e = null) {
  const o = {
    none: 0,
    0: 0,
    sparse: 300,
    balanced: 800,
    dense: 1800,
    ultra: 3500
  }, n = o[t] !== void 0 ? o[t] : 800;
  if (n <= 0)
    return { points: [], colors: [] };
  const s = [], c = [];
  let m = 0.65, i = 0.72, f = 0.82;
  if (typeof e == "string" && e.startsWith("#")) {
    const p = e.replace("#", "");
    p.length === 6 && (m = parseInt(p.slice(0, 2), 16) / 255, i = parseInt(p.slice(2, 4), 16) / 255, f = parseInt(p.slice(4, 6), 16) / 255);
  }
  const r = 0.618033988749895, _ = 0.324717957244746;
  for (let p = 0; p < n; p++) {
    const d = p * r % 1, y = p * _ % 1, b = (p + 0.5) * 0.7548776662466927 % 1;
    let u = 0, g = 0, h = 0, M = 0.65, l = 0.72, A = 0.82;
    if (a === "ground_focus")
      if (d < 0.6) {
        const z = 0.4 + Math.sqrt(y) * 24, v = b * Math.PI * 2 + p * 2.399963229728653;
        u = Math.cos(v) * z, h = Math.sin(v) * z, g = 0.01 + d * 0.75, M = 0.86, l = 0.9, A = 0.98;
      } else {
        const z = 1 + Math.sqrt(y) * 18, v = b * Math.PI * 2 + p * 2.399963229728653;
        u = Math.cos(v) * z, h = Math.sin(v) * z, g = 0.75 + (d - 0.6) * 8.5, M = 0.62, l = 0.7, A = 0.82;
      }
    else if (a === "dome") {
      const z = d * Math.PI * 2, v = 1 - 2 * y, x = Math.sqrt(Math.max(0, 1 - v * v)), S = 1.5 + Math.cbrt(b) * 20;
      u = Math.cos(z) * x * S, h = Math.sin(z) * x * S, g = Math.max(0.01, v * S * 0.75 + 2.5), M = 0.72, l = 0.78, A = 0.88;
    } else {
      const z = p % 4;
      if (z === 0) {
        const v = 0.3 + Math.sqrt(y) * 28, x = p * 2.399963229728653;
        u = Math.cos(x) * v, h = Math.sin(x) * v, g = 0.01 + b * 0.34, M = 0.9, l = 0.94, A = 1;
      } else if (z === 1) {
        const v = 0.6 + Math.sqrt(y) * 18, x = p * 2.399963229728653;
        u = Math.cos(x) * v, h = Math.sin(x) * v, g = 0.35 + b * 3.15, M = 0.68, l = 0.76, A = 0.86;
      } else if (z === 2) {
        const v = 2 + Math.sqrt(y) * 24, x = p * 2.399963229728653;
        u = Math.cos(x) * v, h = Math.sin(x) * v, g = 3.5 + b * 11.5, M = 0.55, l = 0.65, A = 0.78;
      } else {
        const v = 0.5 + y * 6.5, x = p * 2.399963229728653;
        u = Math.cos(x) * v, h = Math.sin(x) * v, g = 0.05 + b * 4.95, M = 0.8, l = 0.86, A = 0.94;
      }
    }
    s.push(u, g, h), c.push(e ? M * m : M, e ? l * i : l, e ? A * f : A);
  }
  return { points: s, colors: c };
}
function te() {
  const t = P(), a = [{ frame: 0, camera: F(t), interpolation: "ease" }];
  return {
    schema_version: 1,
    fps: 24,
    duration_frames: 120,
    width: 1280,
    height: 720,
    render_mode: "omni_ref",
    camera: t,
    keyframes: a,
    cameras: [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: F(t), keyframes: a }],
    active_camera_id: "camera_1",
    playblast_camera_id: "camera_1",
    objects: [{ id: "subject", type: "card", name: "Subject Card", position: [0, 1.5, 0], rotation: [0, 0, 0], size: [2, 3, 0.01], material_mode: "textured", color: "#8c929b", keyframes: [], enabled: !0, asset: "" }],
    metadata: {},
    guides: !0,
    burn_in: !1,
    speed_heatmap: !1,
    playblast_grid: !1,
    card_fit: "contain",
    card_asset: "",
    reference_index: 0,
    point_density: "balanced",
    point_spread: "all_views",
    point_color: "#cbd5e1",
    viewport_bg_color: "#121212",
    viewport_bg_image: "",
    viewport_bg_sequence: [],
    show_wireframe: !1,
    show_vertices: !1,
    select_mode: "object",
    gizmo_mode: "translate",
    gizmo_space: "world",
    auto_key: !1,
    view_mode: "camera",
    camera_view_visible: !0,
    editor_views: J(),
    ui_density: "advanced",
    snap_enabled: !0,
    snap_frames: 1,
    timecode_mode: "time",
    loop_playback: !1,
    playback_range: null,
    markers: [],
    preview_layout: "auto",
    maximized_camera_id: null,
    safe_areas: !1,
    resolution_gate: !1,
    aspect_ratio: "auto"
  };
}
function F(t) {
  const a = P();
  if (!t || typeof t != "object") return a;
  const e = Array.isArray(t.position) ? [...t.position] : [...a.position], o = Array.isArray(t.target) ? [...t.target] : [...a.target], n = Math.max(1e-4, Number.isFinite(Number(t.near)) ? Number(t.near) : 0.01), s = Number.isFinite(Number(t.far)) ? Number(t.far) : 1e4;
  return {
    position: e,
    target: o,
    fov: Number(t.fov ?? 35),
    roll: Number(t.roll ?? 0),
    camera_type: t.camera_type || "perspective",
    zoom: Number(t.zoom ?? 1),
    near: n,
    far: Math.max(n + 1e-4, s),
    ...Array.isArray(t.up) ? { up: [...t.up] } : {}
  };
}
function he(t) {
  const a = te();
  if (!t || typeof t != "object") return a;
  const e = { ...a, ...t };
  e.fps = N(Number(e.fps || 24), 1, 120), e.duration_frames = Math.max(1, Number(e.duration_frames || 120)), e.width = N(Number(e.width || 1280), 64, 4096), e.height = N(Number(e.height || 720), 64, 4096);
  const o = (r, _) => (Array.isArray(r) ? r : []).map((p) => ({
    frame: N(Math.round(Number(p.frame || 0)), 0, e.duration_frames - 1),
    camera: F(p.camera || p || _),
    interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(p.interpolation) ? p.interpolation : "ease",
    ...p.tangents && typeof p.tangents == "object" ? { tangents: { ...p.tangents } } : {},
    ...Array.isArray(p.references) ? { references: p.references.map((d) => ({ ...d })) } : {}
  })), n = F(e.camera || a.camera);
  let s = o(e.keyframes, n);
  s = [...new Map(s.map((r) => [r.frame, r])).values()].sort((r, _) => r.frame - _.frame), s.length || (s = [{ frame: 0, camera: F(n), interpolation: "ease" }]);
  const c = Array.isArray(e.cameras) && e.cameras.length ? e.cameras : [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: n, keyframes: s }], m = /* @__PURE__ */ new Set();
  e.cameras = c.map((r, _) => {
    let p = String(r?.id || `camera_${_ + 1}`);
    m.has(p) && (p = `camera_${_ + 1}`), m.add(p);
    const d = F(r?.camera || r?.keyframes?.[0]?.camera || n);
    let y = o(r?.keyframes, d);
    return y = [...new Map(y.map((b) => [b.frame, b])).values()].sort((b, u) => b.frame - u.frame), y.length || (y = [{ frame: 0, camera: F(d), interpolation: "ease" }]), {
      id: p,
      name: String(r?.name || `Camera ${_ + 1}`),
      color: typeof r?.color == "string" ? r.color : null,
      camera: d,
      keyframes: y,
      target_object_id: typeof r?.target_object_id == "string" ? r.target_object_id : typeof e.target_object_id == "string" ? e.target_object_id : null,
      target_offset: Array.isArray(r?.target_offset) ? r.target_offset.map(Number) : [0, 0, 0],
      locked: !!r?.locked,
      muted: !!r?.muted,
      solo: !!r?.solo
    };
  }), e.active_camera_id = e.cameras.some((r) => r.id === e.active_camera_id) ? e.active_camera_id : e.cameras[0].id, e.playblast_camera_id = e.cameras.some((r) => r.id === e.playblast_camera_id) ? e.playblast_camera_id : e.active_camera_id;
  const i = e.cameras.find((r) => r.id === e.active_camera_id);
  e.camera = i.camera, e.keyframes = i.keyframes, e.target_object_id = i.target_object_id || null, e.target_offset = i.target_offset || [0, 0, 0], e.objects = (Array.isArray(e.objects) ? e.objects : a.objects).map((r) => ({
    ...r,
    color: typeof r?.color == "string" ? r.color : null,
    locked: !!r.locked,
    parent_id: typeof r.parent_id == "string" ? r.parent_id : null,
    position: Array.isArray(r.position) ? r.position.map(Number) : [0, 0, 0],
    rotation: Array.isArray(r.rotation) ? r.rotation.map(Number) : [0, 0, 0],
    size: Array.isArray(r.size) ? r.size.length === 2 ? [...r.size.map(Number), 0.01] : r.size.map(Number) : [1, 1, 1],
    material_mode: ["textured", "checker", "neutral", "wireframe"].includes(r.material_mode) ? r.material_mode : "textured",
    keyframes: (Array.isArray(r.keyframes) ? r.keyframes : []).map((_) => ({
      frame: N(Math.round(Number(_.frame || 0)), 0, e.duration_frames - 1),
      transform: V(_.transform || r),
      interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(_.interpolation) ? _.interpolation : "ease",
      ..._.tangents && typeof _.tangents == "object" ? { tangents: { ..._.tangents } } : {}
    })).sort((_, p) => _.frame - p.frame)
  })), e.gizmo_mode = ["translate", "rotate", "scale"].includes(e.gizmo_mode) ? e.gizmo_mode : "translate", e.gizmo_space = e.gizmo_space === "local" ? "local" : "world", e.ui_density = ["basic", "animation", "advanced"].includes(e.ui_density) ? e.ui_density : "advanced", e.select_mode = ["object", "vertex", "edge", "face"].includes(e.select_mode) ? e.select_mode : "object", e.show_wireframe = !!e.show_wireframe, e.show_vertices = !!e.show_vertices, e.point_density = ["none", "0", "sparse", "balanced", "dense", "ultra"].includes(e.point_density) ? e.point_density : "balanced", e.point_spread = ["all_views", "ground_focus", "dome"].includes(e.point_spread) ? e.point_spread : "all_views", e.point_color = typeof e.point_color == "string" ? e.point_color : "#cbd5e1", e.viewport_bg_color = typeof e.viewport_bg_color == "string" ? e.viewport_bg_color : "#121212", e.viewport_bg_image = typeof e.viewport_bg_image == "string" ? e.viewport_bg_image : "", e.viewport_bg_sequence = Array.isArray(e.viewport_bg_sequence) ? e.viewport_bg_sequence.map(String) : [], e.snap_enabled = e.snap_enabled !== !1, e.snap_frames = Math.max(1, Math.round(Number(e.snap_frames) || 1)), e.timecode_mode = ["time", "timecode"].includes(e.timecode_mode) ? e.timecode_mode : "time", e.loop_playback = !!e.loop_playback, e.playback_range = Array.isArray(e.playback_range) && e.playback_range.length === 2 ? [N(Math.round(Number(e.playback_range[0]) || 0), 0, e.duration_frames - 1), N(Math.round(Number(e.playback_range[1]) || e.duration_frames - 1), 0, e.duration_frames - 1)] : null, e.markers = (Array.isArray(e.markers) ? e.markers : []).filter((r) => r && Number.isFinite(Number(r.frame))).map((r, _) => ({ frame: N(Math.round(Number(r.frame)), 0, e.duration_frames - 1), name: String(r.name || `Marker ${_ + 1}`).slice(0, 40), color: String(r.color || "#f2d06b") })), e.preview_layout = ["auto", "1", "2", "4"].includes(String(e.preview_layout)) ? String(e.preview_layout) : "auto", e.maximized_camera_id = typeof e.maximized_camera_id == "string" ? e.maximized_camera_id : null, e.safe_areas = !!e.safe_areas, e.resolution_gate = !!e.resolution_gate, e.aspect_ratio = ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"].includes(e.aspect_ratio) ? e.aspect_ratio : "auto", e.auto_key = !!e.auto_key, e.playblast_grid = !!e.playblast_grid, e.reference_index = Math.max(0, Number(e.reference_index || 0)), e.view_mode = ["camera", "perspective", "top", "right", "left", "bottom"].includes(e.view_mode) ? e.view_mode : "camera", e.camera_view_visible = e.camera_view_visible !== !1;
  const f = J();
  return e.editor_views = Object.fromEntries(Object.entries(f).map(([r, _]) => [r, F(e.editor_views?.[r] || _)])), e;
}
function ae(t, a) {
  const [e, o, n] = (a || [0, 0, 0]).map((i) => i * Math.PI / 180);
  let [s, c, m] = t;
  return [c, m] = [c * Math.cos(e) - m * Math.sin(e), c * Math.sin(e) + m * Math.cos(e)], [s, m] = [s * Math.cos(o) + m * Math.sin(o), -s * Math.sin(o) + m * Math.cos(o)], [s, c] = [s * Math.cos(n) - c * Math.sin(n), s * Math.sin(n) + c * Math.cos(n)], [s, c, m];
}
export {
  k as TANGENT_MODES,
  H as add,
  re as annotatedAssetUrl,
  ce as applyCameraShake,
  fe as bezierEaseWithHandles,
  Q as cameraBasis,
  N as clamp,
  F as cloneCamera,
  V as cloneTransform,
  ne as configureCore,
  U as cross,
  P as defaultCamera,
  J as defaultEditorViews,
  _e as defaultHandles,
  te as defaultState,
  ue as distanceToSegment,
  q as dot,
  Z as ease,
  le as generateCameraPreset,
  T as generateHarmonicNoise,
  ge as generatePointField,
  K as getChannelTangents,
  Y as length,
  R as lerp,
  pe as lerp3,
  ie as lerpAngle,
  j as mul,
  $ as norm,
  se as project,
  E as resolveChannelHandles,
  G as resolveHandles,
  ae as rotateEuler,
  X as sampleCamera,
  w as sampleChannel,
  ee as sampleObjectTransform,
  he as sanitizeState,
  D as sub,
  me as v3,
  de as worldTransform
};
