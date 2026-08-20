function K(t) {
  if (!t) return "";
  const a = String(t).match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/), e = a?.[1] || String(t), n = a?.[2] || "input", s = e.lastIndexOf("/"), c = s >= 0 ? e.slice(0, s) : "", m = s >= 0 ? e.slice(s + 1) : e;
  return $(`/view?filename=${encodeURIComponent(m)}&subfolder=${encodeURIComponent(c)}&type=${encodeURIComponent(n)}`);
}
let $ = (t) => t;
function G({ api: t }) {
  $ = (a) => t.apiURL ? t.apiURL(a) : a;
}
function L(t) {
  const a = H(t.target, t.position), e = Math.sqrt(B(a, a)) < 1e-6 ? [0, 0, -1] : O(a);
  let n = t.up || [0, 1, 0], s = F(e, n);
  Math.sqrt(B(s, s)) < 1e-6 && (n = Math.abs(e[1]) > 0.9 ? [0, 0, e[1] > 0 ? -1 : 1] : [0, 1, 0], s = F(e, n)), s = O(s);
  let c = O(F(s, e));
  if (Math.abs(t.roll || 0) > 1e-9) {
    const m = t.roll * Math.PI / 180, p = Math.cos(m), l = Math.sin(m), f = R(P(s, p), P(c, l));
    c = R(P(c, p), P(s, -l)), s = f;
  }
  return { right: s, up: c, forward: e };
}
function ee(t, a, e, n) {
  const { right: s, up: c, forward: m } = L(a), p = H(t, a.position), l = B(p, m);
  if (l <= Math.max(1e-4, a.near || 0.01) || l >= (a.far || 1e4)) return null;
  const f = B(p, s), r = B(p, c);
  if (a.camera_type === "orthographic") {
    const o = 5 / Math.max(0.01, a.zoom || 1), u = o * e / Math.max(1, n);
    return [e * (0.5 + f / (2 * u)), n * (0.5 - r / (2 * o)), l];
  }
  const _ = 0.5 * n / Math.tan(Math.max(1e-3, a.fov) * Math.PI / 360);
  return [e * 0.5 + f * _ / l, n * 0.5 - r * _ / l, l];
}
function te(t, a, e) {
  const n = ((a - t + 540) % 360 + 360) % 360 - 180;
  return t + n * e;
}
function W(t, a) {
  const e = (t.keyframes || []).map((i) => ({
    ...i,
    camera: S(i.camera || i || t.camera || C())
  }));
  if (!e.length) return S(t.camera || C());
  const n = z(e, a, "pos_x", (i) => (i.camera || i).position[0]), s = z(e, a, "pos_y", (i) => (i.camera || i).position[1]), c = z(e, a, "pos_z", (i) => (i.camera || i).position[2]);
  let m = z(e, a, "target_x", (i) => (i.camera || i).target[0]), p = z(e, a, "target_y", (i) => (i.camera || i).target[1]), l = z(e, a, "target_z", (i) => (i.camera || i).target[2]);
  const f = t.target_object_id || t.camera?.target_object_id;
  if (f && Array.isArray(t.objects)) {
    const i = t.objects.find((g) => g.id === f);
    if (i) {
      const g = i.keyframes?.length ? Y(i, a) : i, M = t.target_offset || t.camera?.target_offset || [0, 0, 0];
      m = (g.position?.[0] ?? 0) + (M[0] || 0), p = (g.position?.[1] ?? 1.5) + (M[1] || 0), l = (g.position?.[2] ?? 0) + (M[2] || 0);
    }
  }
  const r = z(e, a, "fov", (i) => Number((i.camera || i).fov ?? 35)), _ = z(e, a, "roll", (i) => Number((i.camera || i).roll ?? 0), !0), o = z(e, a, "zoom", (i) => Number((i.camera || i).zoom ?? 1)), u = z(e, a, "near", (i) => Number((i.camera || i).near ?? 0.01)), y = z(e, a, "far", (i) => Number((i.camera || i).far ?? 1e4)), b = e[0]?.camera || e[0] || C(), h = e[e.length - 1]?.camera || e[e.length - 1] || C(), d = a >= (e[e.length - 1]?.frame ?? 0) ? h.camera_type : b.camera_type;
  return {
    position: [n, s, c],
    target: [m, p, l],
    fov: A(r, 5, 150),
    roll: _,
    camera_type: d || "perspective",
    zoom: Math.max(0.01, o),
    near: Math.max(1e-4, u),
    far: Math.max(u + 1e-4, y),
    ...b.up ? { up: [...b.up] } : {}
  };
}
function q(t, a = 0) {
  return Math.sin(t * 1.7 + a * 3.1) * 0.5 + Math.sin(t * 3.3 + a * 5.7) * 0.3 + Math.sin(t * 7.9 + a * 11.3) * 0.2;
}
function ae(t, { type: a = "handheld_subtle", intensity: e = 1, duration_frames: n = null, subdivide: s = !0 } = {}) {
  const c = Array.isArray(t) ? t : t?.keyframes || [];
  if (!c || c.length === 0) return c;
  const m = a === "turbulence", p = a === "handheld_heavy", l = (m ? 0.12 : p ? 0.18 : 0.06) * e, f = (m ? 2 : p ? 2.8 : 0.9) * e, r = m ? 0.45 : p ? 0.22 : 0.12, _ = c[c.length - 1]?.frame ?? 119, o = Math.max(_ + 1, Number(n || (t?.duration_frames ?? _ + 1))), u = m ? 4 : p ? 6 : 8, y = Array.isArray(t) ? { keyframes: c } : t, b = new Set(c.map((d) => d.frame));
  if (s && o > u) {
    for (let d = 0; d < o; d += u)
      b.add(d);
    b.add(o - 1);
  }
  return [...b].sort((d, i) => d - i).map((d) => {
    const i = W(y, d), g = q(d * r, 1) * l, M = q(d * r, 2) * l, N = q(d * r, 3) * l * 0.5, x = q(d * r, 4) * f, v = q(d * r, 5) * (f * 0.35), w = [...i.position], I = [...i.target];
    return w[0] += g, w[1] += M, w[2] += N, I[0] += g * 0.35, I[1] += M * 0.35, {
      frame: d,
      camera: {
        ...i,
        position: w,
        target: I,
        roll: (i.roll || 0) + x,
        fov: A((i.fov || 35) + v, 10, 140)
      },
      interpolation: "smooth"
    };
  });
}
function re(t, { duration_frames: a = 120, target: e = [0, 1.5, 0], radius: n = 6, height: s = 3.5 } = {}) {
  const c = [], m = Math.max(2, a), [p, l, f] = e;
  if (t === "orbit_360")
    for (let _ = 0; _ < 5; _++) {
      const o = Math.round(_ / 4 * (m - 1)), u = _ / 4 * Math.PI * 2;
      c.push({
        frame: o,
        camera: {
          position: [p + Math.sin(u) * n, l + s, f + Math.cos(u) * n],
          target: [p, l, f],
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
  else t === "push_in" ? c.push(
    {
      frame: 0,
      camera: { position: [p, l + s, f + n * 1.6], target: [p, l, f], fov: 42, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: m - 1,
      camera: { position: [p, l + s * 0.5, f + n * 0.6], target: [p, l, f], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : t === "pull_out" ? c.push(
    {
      frame: 0,
      camera: { position: [p, l + s * 0.4, f + n * 0.6], target: [p, l, f], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: m - 1,
      camera: { position: [p, l + s * 1.2, f + n * 1.8], target: [p, l, f], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : t === "dolly_zoom" && c.push(
    {
      frame: 0,
      camera: { position: [p, l + s * 0.7, f + n * 1.8], target: [p, l, f], fov: 24, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    },
    {
      frame: m - 1,
      camera: { position: [p, l + s * 0.5, f + n * 0.6], target: [p, l, f], fov: 65, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    }
  );
  return c;
}
const A = (t, a, e) => Math.max(a, Math.min(e, t)), T = (t, a, e) => t + (a - t) * e, oe = (t = 0, a = 0, e = 0) => [t, a, e], R = (t, a) => [t[0] + a[0], t[1] + a[1], t[2] + a[2]], H = (t, a) => [t[0] - a[0], t[1] - a[1], t[2] - a[2]], P = (t, a) => [t[0] * a, t[1] * a, t[2] * a], B = (t, a) => t[0] * a[0] + t[1] * a[1] + t[2] * a[2], F = (t, a) => [t[1] * a[2] - t[2] * a[1], t[2] * a[0] - t[0] * a[2], t[0] * a[1] - t[1] * a[0]], j = (t) => Math.sqrt(Math.max(1e-12, B(t, t))), O = (t) => P(t, 1 / j(t)), ne = (t, a, e) => [T(t[0], a[0], e), T(t[1], a[1], e), T(t[2], a[2], e)];
function se(t, a, e) {
  const n = [e[0] - a[0], e[1] - a[1]], s = [t[0] - a[0], t[1] - a[1]], c = Math.max(1e-9, n[0] * n[0] + n[1] * n[1]), m = A((s[0] * n[0] + s[1] * n[1]) / c, 0, 1);
  return Math.hypot(t[0] - a[0] - n[0] * m, t[1] - a[1] - n[1] * m);
}
function D(t, a = "ease") {
  return t = A(t, 0, 1), a === "linear" ? t : a === "ease_in" ? t * t : a === "ease_out" ? 1 - (1 - t) * (1 - t) : a === "smooth" ? t * t * t * (t * (t * 6 - 15) + 10) : a === "bezier" ? 0.15 * (1 - t) * (1 - t) * t + 2.85 * (1 - t) * t * t + t * t * t : t * t * (3 - 2 * t);
}
const J = ["auto", "vector", "free", "aligned", "flat"];
function ie() {
  return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: "auto" };
}
function Q(t, a) {
  const e = t?.tangents;
  return !e || typeof e != "object" ? {} : e.channels && typeof e.channels == "object" && e.channels[a] ? e.channels[a] : e;
}
function U(t, a, e, n, s) {
  const c = Q(t, a), m = J.includes(c.mode) ? c.mode : t?.tangents?.mode || "auto", p = s ? s(t) : 0, l = e && s ? s(e) : p, f = n && s ? s(n) : p, r = Math.max(1e-6, t.frame - (e?.frame ?? t.frame - 1)), _ = Math.max(1e-6, (n?.frame ?? t.frame + 1) - t.frame), o = () => {
    const i = (p - l) / r, g = (f - p) / _;
    let M = (i + g) * 0.5;
    return e ? n || (M = i) : M = g, i * g <= 0 && e && n && (M = 0), {
      out_x: 1 / 3,
      out_y: M * _ * (1 / 3),
      in_x: -1 / 3,
      in_y: -M * r * (1 / 3)
    };
  };
  if (m === "vector") {
    const i = (p - l) / r, g = (f - p) / _;
    return {
      out_x: 1 / 3,
      out_y: g * _ * (1 / 3),
      in_x: -1 / 3,
      in_y: -i * r * (1 / 3),
      mode: m
    };
  }
  if (m === "flat")
    return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: m };
  if (m === "auto")
    return { ...o(), mode: m };
  const u = o(), y = A(Number(c.out_x ?? u.out_x), 0.01, 0.99), b = Number(c.out_y ?? u.out_y);
  let h = A(Number(c.in_x ?? u.in_x), -0.99, -0.01), d = Number(c.in_y ?? u.in_y);
  if (m === "aligned") {
    const i = Math.hypot(y, b) || 1e-6, g = Math.hypot(h, d) || 1e-6;
    h = -y / i * g, d = -b / i * g;
  }
  return { out_x: y, out_y: b, in_x: h, in_y: d, mode: m };
}
function X(t, a, e) {
  return U(t, "default", a, e, (n) => Number(n.value ?? 0));
}
function ce(t, a, e, n, s, c) {
  const m = X(a, e, n), p = A(m.out_x, 0.01, 0.99), l = A(1 + m.in_x, 0.01, 0.99), f = m.out_y / Math.max(1e-6, m.out_x) / Math.max(1, s), r = m.in_y / Math.max(1e-6, Math.abs(m.in_x)) / Math.max(1, c || s), _ = f * p, o = 1 + r * (l - 1), u = A(t, 0, 1), y = 1 - u;
  return 3 * y * y * u * _ + 3 * y * u * u * o + u * u * u;
}
function z(t, a, e, n, s = !1) {
  if (!t.length) return 0;
  if (a <= t[0].frame) return n(t[0]);
  if (a >= t[t.length - 1].frame) return n(t[t.length - 1]);
  let c = 0;
  for (let h = 0; h < t.length - 1; h++)
    if (t[h].frame <= a && a <= t[h + 1].frame) {
      c = h;
      break;
    }
  const m = t[c], p = t[c + 1], l = c > 0 ? t[c - 1] : null, f = c + 2 < t.length ? t[c + 2] : null, r = Math.max(1, p.frame - m.frame), _ = A((a - m.frame) / r, 0, 1);
  let o = n(m), u = n(p);
  if (s) {
    const h = ((u - o + 540) % 360 + 360) % 360 - 180;
    u = o + h;
  }
  if (m.interpolation === "bezier" || p.interpolation === "bezier") {
    const h = U(m, e, l, p, n), d = U(p, e, m, f, n), i = o, g = o + (h.out_y || 0), M = u + (d.in_y || 0), N = u, x = 1 - _;
    return x * x * x * i + 3 * x * x * _ * g + 3 * x * _ * _ * M + _ * _ * _ * N;
  }
  const b = D(_, m.interpolation);
  return o + (u - o) * b;
}
function C() {
  return { position: [6, 4, 6], target: [0, 1.5, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 };
}
function E() {
  const t = [0, 1, 0], a = (e, n = [0, 1, 0], s = "orthographic") => ({ ...C(), position: e, target: [...t], up: n, camera_type: s, zoom: 1 });
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
function le(t, a) {
  const e = new Map(t.map((f) => [f.id, f]));
  let n = [...a.position || [0, 0, 0]], s = [...a.rotation || [0, 0, 0]], c = a.size || [1, 1, 1], m = c.length === 2 ? [...c, 0.01] : [...c];
  const p = /* @__PURE__ */ new Set([a.id]);
  let l = a.parent_id ? e.get(a.parent_id) : null;
  for (; l && !p.has(l.id); ) {
    p.add(l.id);
    const f = [n[0] * (l.size?.[0] ?? 1), n[1] * (l.size?.[1] ?? 1), n[2] * (l.size?.[2] ?? 1)], r = k(f, l.rotation || [0, 0, 0]);
    n = R(r, l.position || [0, 0, 0]), s = [s[0] + (l.rotation?.[0] ?? 0), s[1] + (l.rotation?.[1] ?? 0), s[2] + (l.rotation?.[2] ?? 0)], m = [m[0] * (l.size?.[0] ?? 1), m[1] * (l.size?.[1] ?? 1), m[2] * (l.size?.[2] ?? 1)], l = l.parent_id ? e.get(l.parent_id) : null;
  }
  return { position: n, rotation: s, size: m };
}
function Y(t, a) {
  const e = t.keyframes || [];
  if (!e.length) return V(t);
  const n = z(e, a, "pos_x", (o) => (o.transform || t).position[0]), s = z(e, a, "pos_y", (o) => (o.transform || t).position[1]), c = z(e, a, "pos_z", (o) => (o.transform || t).position[2]), m = z(e, a, "rot_x", (o) => (o.transform || t).rotation[0], !0), p = z(e, a, "rot_y", (o) => (o.transform || t).rotation[1], !0), l = z(e, a, "rot_z", (o) => (o.transform || t).rotation[2], !0), f = z(e, a, "scale_x", (o) => (o.transform || t).size[0]), r = z(e, a, "scale_y", (o) => (o.transform || t).size[1]), _ = z(e, a, "scale_z", (o) => (o.transform || t).size[2]);
  return {
    position: [n, s, c],
    rotation: [m, p, l],
    size: [Math.max(0.01, f), Math.max(0.01, r), Math.max(0.01, _)]
  };
}
function me(t = "balanced", a = "all_views", e = null) {
  const n = {
    none: 0,
    0: 0,
    sparse: 300,
    balanced: 800,
    dense: 1800,
    ultra: 3500
  }, s = n[t] !== void 0 ? n[t] : 800;
  if (s <= 0)
    return { points: [], colors: [] };
  const c = [], m = [];
  let p = 0.65, l = 0.72, f = 0.82;
  if (typeof e == "string" && e.startsWith("#")) {
    const o = e.replace("#", "");
    o.length === 6 && (p = parseInt(o.slice(0, 2), 16) / 255, l = parseInt(o.slice(2, 4), 16) / 255, f = parseInt(o.slice(4, 6), 16) / 255);
  }
  const r = 0.618033988749895, _ = 0.324717957244746;
  for (let o = 0; o < s; o++) {
    const u = o * r % 1, y = o * _ % 1, b = (o + 0.5) * 0.7548776662466927 % 1;
    let h = 0, d = 0, i = 0, g = 0.65, M = 0.72, N = 0.82;
    if (a === "ground_focus")
      if (u < 0.6) {
        const x = 0.4 + Math.sqrt(y) * 24, v = b * Math.PI * 2 + o * 2.399963229728653;
        h = Math.cos(v) * x, i = Math.sin(v) * x, d = 0.01 + u * 0.75, g = 0.86, M = 0.9, N = 0.98;
      } else {
        const x = 1 + Math.sqrt(y) * 18, v = b * Math.PI * 2 + o * 2.399963229728653;
        h = Math.cos(v) * x, i = Math.sin(v) * x, d = 0.75 + (u - 0.6) * 8.5, g = 0.62, M = 0.7, N = 0.82;
      }
    else if (a === "dome") {
      const x = u * Math.PI * 2, v = 1 - 2 * y, w = Math.sqrt(Math.max(0, 1 - v * v)), I = 1.5 + Math.cbrt(b) * 20;
      h = Math.cos(x) * w * I, i = Math.sin(x) * w * I, d = Math.max(0.01, v * I * 0.75 + 2.5), g = 0.72, M = 0.78, N = 0.88;
    } else {
      const x = o % 4;
      if (x === 0) {
        const v = 0.3 + Math.sqrt(y) * 28, w = o * 2.399963229728653;
        h = Math.cos(w) * v, i = Math.sin(w) * v, d = 0.01 + b * 0.34, g = 0.9, M = 0.94, N = 1;
      } else if (x === 1) {
        const v = 0.6 + Math.sqrt(y) * 18, w = o * 2.399963229728653;
        h = Math.cos(w) * v, i = Math.sin(w) * v, d = 0.35 + b * 3.15, g = 0.68, M = 0.76, N = 0.86;
      } else if (x === 2) {
        const v = 2 + Math.sqrt(y) * 24, w = o * 2.399963229728653;
        h = Math.cos(w) * v, i = Math.sin(w) * v, d = 3.5 + b * 11.5, g = 0.55, M = 0.65, N = 0.78;
      } else {
        const v = 0.5 + y * 6.5, w = o * 2.399963229728653;
        h = Math.cos(w) * v, i = Math.sin(w) * v, d = 0.05 + b * 4.95, g = 0.8, M = 0.86, N = 0.94;
      }
    }
    c.push(h, d, i), m.push(e ? g * p : g, e ? M * l : M, e ? N * f : N);
  }
  return { points: c, colors: m };
}
function Z() {
  const t = C(), a = [{ frame: 0, camera: S(t), interpolation: "ease" }];
  return {
    schema_version: 1,
    fps: 24,
    duration_frames: 120,
    width: 1280,
    height: 720,
    render_mode: "omni_ref",
    camera: t,
    keyframes: a,
    cameras: [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: S(t), keyframes: a }],
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
    editor_views: E(),
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
function S(t) {
  const a = C();
  if (!t || typeof t != "object") return a;
  const e = Array.isArray(t.position) ? [...t.position] : [...a.position], n = Array.isArray(t.target) ? [...t.target] : [...a.target], s = Math.max(1e-4, Number.isFinite(Number(t.near)) ? Number(t.near) : 0.01), c = Number.isFinite(Number(t.far)) ? Number(t.far) : 1e4;
  return {
    position: e,
    target: n,
    fov: Number(t.fov ?? 35),
    roll: Number(t.roll ?? 0),
    camera_type: t.camera_type || "perspective",
    zoom: Number(t.zoom ?? 1),
    near: s,
    far: Math.max(s + 1e-4, c),
    ...Array.isArray(t.up) ? { up: [...t.up] } : {}
  };
}
function pe(t) {
  const a = Z();
  if (!t || typeof t != "object") return a;
  const e = { ...a, ...t };
  e.fps = A(Number(e.fps || 24), 1, 120), e.duration_frames = Math.max(1, Number(e.duration_frames || 120)), e.width = A(Number(e.width || 1280), 64, 4096), e.height = A(Number(e.height || 720), 64, 4096);
  const n = (r, _) => (Array.isArray(r) ? r : []).map((o) => ({
    frame: A(Math.round(Number(o.frame || 0)), 0, e.duration_frames - 1),
    camera: S(o.camera || o || _),
    interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(o.interpolation) ? o.interpolation : "ease",
    ...o.tangents && typeof o.tangents == "object" ? { tangents: { ...o.tangents } } : {},
    ...Array.isArray(o.references) ? { references: o.references.map((u) => ({ ...u })) } : {}
  })), s = S(e.camera || a.camera);
  let c = n(e.keyframes, s);
  c = [...new Map(c.map((r) => [r.frame, r])).values()].sort((r, _) => r.frame - _.frame), c.length || (c = [{ frame: 0, camera: S(s), interpolation: "ease" }]);
  const m = Array.isArray(e.cameras) && e.cameras.length ? e.cameras : [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: s, keyframes: c }], p = /* @__PURE__ */ new Set();
  e.cameras = m.map((r, _) => {
    let o = String(r?.id || `camera_${_ + 1}`);
    p.has(o) && (o = `camera_${_ + 1}`), p.add(o);
    const u = S(r?.camera || r?.keyframes?.[0]?.camera || s);
    let y = n(r?.keyframes, u);
    return y = [...new Map(y.map((b) => [b.frame, b])).values()].sort((b, h) => b.frame - h.frame), y.length || (y = [{ frame: 0, camera: S(u), interpolation: "ease" }]), {
      id: o,
      name: String(r?.name || `Camera ${_ + 1}`),
      color: typeof r?.color == "string" ? r.color : null,
      camera: u,
      keyframes: y,
      target_object_id: typeof r?.target_object_id == "string" ? r.target_object_id : typeof e.target_object_id == "string" ? e.target_object_id : null,
      target_offset: Array.isArray(r?.target_offset) ? r.target_offset.map(Number) : [0, 0, 0],
      locked: !!r?.locked,
      muted: !!r?.muted,
      solo: !!r?.solo
    };
  }), e.active_camera_id = e.cameras.some((r) => r.id === e.active_camera_id) ? e.active_camera_id : e.cameras[0].id, e.playblast_camera_id = e.cameras.some((r) => r.id === e.playblast_camera_id) ? e.playblast_camera_id : e.active_camera_id;
  const l = e.cameras.find((r) => r.id === e.active_camera_id);
  e.camera = l.camera, e.keyframes = l.keyframes, e.target_object_id = l.target_object_id || null, e.target_offset = l.target_offset || [0, 0, 0], e.objects = (Array.isArray(e.objects) ? e.objects : a.objects).map((r) => ({
    ...r,
    color: typeof r?.color == "string" ? r.color : null,
    locked: !!r.locked,
    parent_id: typeof r.parent_id == "string" ? r.parent_id : null,
    position: Array.isArray(r.position) ? r.position.map(Number) : [0, 0, 0],
    rotation: Array.isArray(r.rotation) ? r.rotation.map(Number) : [0, 0, 0],
    size: Array.isArray(r.size) ? r.size.length === 2 ? [...r.size.map(Number), 0.01] : r.size.map(Number) : [1, 1, 1],
    material_mode: ["textured", "checker", "neutral", "wireframe"].includes(r.material_mode) ? r.material_mode : "textured",
    keyframes: (Array.isArray(r.keyframes) ? r.keyframes : []).map((_) => ({
      frame: A(Math.round(Number(_.frame || 0)), 0, e.duration_frames - 1),
      transform: V(_.transform || r),
      interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out"].includes(_.interpolation) ? _.interpolation : "ease",
      ..._.tangents && typeof _.tangents == "object" ? { tangents: { ..._.tangents } } : {}
    })).sort((_, o) => _.frame - o.frame)
  })), e.gizmo_mode = ["translate", "rotate", "scale"].includes(e.gizmo_mode) ? e.gizmo_mode : "translate", e.gizmo_space = e.gizmo_space === "local" ? "local" : "world", e.ui_density = ["basic", "animation", "advanced"].includes(e.ui_density) ? e.ui_density : "advanced", e.select_mode = ["object", "vertex", "edge", "face"].includes(e.select_mode) ? e.select_mode : "object", e.show_wireframe = !!e.show_wireframe, e.show_vertices = !!e.show_vertices, e.point_density = ["none", "0", "sparse", "balanced", "dense", "ultra"].includes(e.point_density) ? e.point_density : "balanced", e.point_spread = ["all_views", "ground_focus", "dome"].includes(e.point_spread) ? e.point_spread : "all_views", e.point_color = typeof e.point_color == "string" ? e.point_color : "#cbd5e1", e.viewport_bg_color = typeof e.viewport_bg_color == "string" ? e.viewport_bg_color : "#121212", e.viewport_bg_image = typeof e.viewport_bg_image == "string" ? e.viewport_bg_image : "", e.viewport_bg_sequence = Array.isArray(e.viewport_bg_sequence) ? e.viewport_bg_sequence.map(String) : [], e.snap_enabled = e.snap_enabled !== !1, e.snap_frames = Math.max(1, Math.round(Number(e.snap_frames) || 1)), e.timecode_mode = ["time", "timecode"].includes(e.timecode_mode) ? e.timecode_mode : "time", e.loop_playback = !!e.loop_playback, e.playback_range = Array.isArray(e.playback_range) && e.playback_range.length === 2 ? [A(Math.round(Number(e.playback_range[0]) || 0), 0, e.duration_frames - 1), A(Math.round(Number(e.playback_range[1]) || e.duration_frames - 1), 0, e.duration_frames - 1)] : null, e.markers = (Array.isArray(e.markers) ? e.markers : []).filter((r) => r && Number.isFinite(Number(r.frame))).map((r, _) => ({ frame: A(Math.round(Number(r.frame)), 0, e.duration_frames - 1), name: String(r.name || `Marker ${_ + 1}`).slice(0, 40), color: String(r.color || "#f2d06b") })), e.preview_layout = ["auto", "1", "2", "4"].includes(String(e.preview_layout)) ? String(e.preview_layout) : "auto", e.maximized_camera_id = typeof e.maximized_camera_id == "string" ? e.maximized_camera_id : null, e.safe_areas = !!e.safe_areas, e.resolution_gate = !!e.resolution_gate, e.aspect_ratio = ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"].includes(e.aspect_ratio) ? e.aspect_ratio : "auto", e.auto_key = !!e.auto_key, e.playblast_grid = !!e.playblast_grid, e.reference_index = Math.max(0, Number(e.reference_index || 0)), e.view_mode = ["camera", "perspective", "top", "right", "left", "bottom"].includes(e.view_mode) ? e.view_mode : "camera", e.camera_view_visible = e.camera_view_visible !== !1;
  const f = E();
  return e.editor_views = Object.fromEntries(Object.entries(f).map(([r, _]) => [r, S(e.editor_views?.[r] || _)])), e;
}
function k(t, a) {
  const [e, n, s] = (a || [0, 0, 0]).map((l) => l * Math.PI / 180);
  let [c, m, p] = t;
  return [m, p] = [m * Math.cos(e) - p * Math.sin(e), m * Math.sin(e) + p * Math.cos(e)], [c, p] = [c * Math.cos(n) + p * Math.sin(n), -c * Math.sin(n) + p * Math.cos(n)], [c, m] = [c * Math.cos(s) - m * Math.sin(s), c * Math.sin(s) + m * Math.cos(s)], [c, m, p];
}
export {
  J as TANGENT_MODES,
  R as add,
  K as annotatedAssetUrl,
  ae as applyCameraShake,
  ce as bezierEaseWithHandles,
  L as cameraBasis,
  A as clamp,
  S as cloneCamera,
  V as cloneTransform,
  G as configureCore,
  F as cross,
  C as defaultCamera,
  E as defaultEditorViews,
  ie as defaultHandles,
  Z as defaultState,
  se as distanceToSegment,
  B as dot,
  D as ease,
  re as generateCameraPreset,
  q as generateHarmonicNoise,
  me as generatePointField,
  Q as getChannelTangents,
  j as length,
  T as lerp,
  ne as lerp3,
  te as lerpAngle,
  P as mul,
  O as norm,
  ee as project,
  U as resolveChannelHandles,
  X as resolveHandles,
  k as rotateEuler,
  W as sampleCamera,
  z as sampleChannel,
  Y as sampleObjectTransform,
  pe as sanitizeState,
  H as sub,
  oe as v3,
  le as worldTransform
};
