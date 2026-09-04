import { app as U } from "../../scripts/app.js";
import { api as Ka } from "../../scripts/api.js";
const Va = "MajoorOmniCam", Ga = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20256%20256'%20role='img'%20aria-labelledby='title'%3e%3ctitle%20id='title'%3eMajoor%20OmniCam%3c/title%3e%3c!--%20Vector%20twin%20of%20web/assets/omnicam-icon.png:%20same%20mark,%20~1%20KB%20so%20the%20eagerly-loaded%20node-branding%20chunk%20stays%20cheap.%20Keep%20the%20two%20in%20sync.%20--%3e%3ccircle%20cx='128'%20cy='128'%20r='102'%20fill='%23031228'/%3e%3ccircle%20cx='128'%20cy='128'%20r='53'%20fill='%23f7f6ff'/%3e%3ccircle%20cx='128'%20cy='128'%20r='43'%20fill='%238873fd'/%3e%3c/svg%3e", import.meta.url).href, G = 20;
let ne = null;
function Ba() {
  return ne || typeof Image > "u" || (ne = new Image(), ne.src = Ga), ne;
}
function qa() {
  const t = Date.now() % 2600 / 2600;
  return 0.12 + 0.1 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2));
}
function Ha(e) {
  e.registerExtension({
    name: "MajoorOmniCam.NodeBranding",
    beforeRegisterNodeDef(t, a) {
      if (!String(a?.name || a?.node_id || t?.comfyClass || t?.type || "").startsWith(Va)) return;
      const r = t.prototype.onDrawForeground;
      t.prototype.onDrawForeground = function(n) {
        if (r?.apply(this, arguments), this.flags?.collapsed) return;
        const s = Ba();
        if (!s?.complete || !s.naturalWidth) return;
        const i = Math.max(4, Number(this.size?.[0] || 160) - G - 6), l = -26, m = i + G / 2, c = l + G / 2;
        if (n.save(), this.selected) {
          const p = qa(), d = n.createRadialGradient(m, c, G * 0.35, m, c, G * 1.15);
          d.addColorStop(0, `rgba(136, 115, 253, ${p})`), d.addColorStop(1, "rgba(136, 115, 253, 0)"), n.fillStyle = d, n.beginPath(), n.arc(m, c, G * 1.15, 0, Math.PI * 2), n.fill();
        }
        n.globalAlpha = 0.96, n.drawImage(s, i, l, G, G), n.restore();
      };
    }
  });
}
const et = "en", xe = /* @__PURE__ */ new Map([[et, {}]]);
function Wa(e, t) {
  xe.set(e, { ...xe.get(e) || {}, ...t || {} });
}
let Ge = et;
function $a(e) {
  xe.has(e) && (Ge = e);
}
function _(e) {
  return Ge === et ? e : xe.get(Ge)?.[e] || e;
}
const Ua = "__sequence__";
function Xa() {
  return { enabled: !1, cuts: [], recording_path: "" };
}
function Ya(e, t = []) {
  const a = e && typeof e == "object" ? e : {}, o = new Set(t), r = /* @__PURE__ */ new Set(), n = (Array.isArray(a.cuts) ? a.cuts : []).filter((s) => s && typeof s == "object" && o.has(String(s.camera_id))).map((s) => ({
    camera_id: String(s.camera_id),
    start: Math.max(0, Math.round(Number(s.start) || 0))
  })).sort((s, i) => s.start - i.start).filter((s) => r.has(s.start) ? !1 : (r.add(s.start), !0));
  return n.length && (n[0].start = 0), {
    enabled: !!a.enabled && n.length > 0,
    cuts: n,
    recording_path: typeof a.recording_path == "string" ? a.recording_path : ""
  };
}
function Ce(e) {
  const t = Math.max(0, (e?.duration_frames || 1) - 1), a = (e?.sequence?.cuts || []).filter((o) => o.start <= t);
  return a.map((o, r) => ({
    camera_id: o.camera_id,
    start: o.start,
    end: r + 1 < a.length ? a[r + 1].start - 1 : t
  }));
}
function Zr(e) {
  return !!e?.sequence?.enabled && Ce(e).length > 0;
}
function Mt(e, t) {
  const a = Ce(e);
  if (!a.length) return null;
  const o = Math.max(0, Math.round(Number(t) || 0));
  for (let r = a.length - 1; r >= 0; r--)
    if (o >= a[r].start) return a[r];
  return a[0];
}
function Za(e) {
  const t = e?.cameras || [], a = Math.max(0, (e?.duration_frames || 1) - 1);
  if (!t.length) return [];
  const o = (a + 1) / t.length, r = t.map((s, i) => ({
    camera_id: s.id,
    start: i === 0 ? 0 : Math.round(i * o)
  })), n = /* @__PURE__ */ new Set();
  return r.filter((s) => s.start > a || n.has(s.start) ? !1 : (n.add(s.start), !0));
}
function Qr(e, t, a) {
  const o = e?.sequence?.cuts || [];
  if (t <= 0 || t >= o.length) return !1;
  const r = o[t - 1].start + 1, n = (t + 1 < o.length ? o[t + 1].start : e.duration_frames || 1) - 1;
  if (n < r) return !1;
  const s = Math.max(r, Math.min(n, Math.round(Number(a) || 0)));
  return s === o[t].start ? !1 : (o[t].start = s, !0);
}
function Qa(e, t) {
  const a = e?.cameras || [];
  if (!a.length) return t;
  const o = a.findIndex((r) => r.id === t);
  return a[(o + 1) % a.length].id;
}
function Ja(e, t, a = null) {
  const o = e?.sequence?.cuts || [], r = Math.max(0, Math.round(Number(t) || 0));
  if (!o.length || r <= 0 || o.some((i) => i.start === r)) return !1;
  const s = Mt(e, r)?.camera_id || o[0].camera_id;
  return o.push({ camera_id: a || Qa(e, s), start: r }), o.sort((i, l) => i.start - l.start), !0;
}
function eo(e, t) {
  const a = e?.sequence?.cuts || [];
  return t < 0 || t >= a.length || a.length === 1 ? !1 : (a.splice(t, 1), a.length && (a[0].start = 0), !0);
}
const xt = Object.freeze(["select", "track", "anchor", "project", "erase"]), Ct = Object.freeze(["manual_2d", "static_anchor", "world_point", "object_point", "camera_field"]), Dt = Object.freeze(["linear", "smooth", "hold"]), le = (e, t = 0) => Number.isFinite(Number(e)) ? Number(e) : t, ct = (e) => Math.max(0, Math.min(1, le(e)));
function to(e, t) {
  return {
    time_seconds: Math.max(0, Math.min(t, le(e?.time_seconds))),
    x: ct(e?.x),
    y: ct(e?.y),
    visible: e?.visible !== !1,
    interpolation: Dt.includes(e?.interpolation) ? e.interpolation : "linear"
  };
}
function ao(e) {
  const t = Math.max(1 / Math.max(1, le(e.fps, 24)), le(e.duration_frames, 120) / Math.max(1, le(e.fps, 24))), a = /* @__PURE__ */ new Set();
  return e.motion_layers = (Array.isArray(e.motion_layers) ? e.motion_layers : []).slice(0, 256).map((o, r) => {
    let n = String(o?.id || `motion_${r + 1}`);
    a.has(n) && (n = `motion_${r + 1}`), a.add(n);
    const s = Ct.includes(o?.source_kind) ? o.source_kind : "manual_2d", i = (Array.isArray(o?.keys) ? o.keys : []).slice(0, 1e4).map((l) => to(l, t)).sort((l, m) => l.time_seconds - m.time_seconds);
    return {
      id: n,
      label: String(o?.label || `Motion ${r + 1}`).slice(0, 80),
      enabled: o?.enabled !== !1,
      semantic: "screen_point",
      source_kind: s,
      keys: i,
      source: o?.source && typeof o.source == "object" ? { ...o.source } : {}
    };
  }).filter((o) => o.keys.length), e.motion_tool = xt.includes(e.motion_tool) ? e.motion_tool : "select", e.selected_motion_layer_id = e.motion_layers.some((o) => o.id === e.selected_motion_layer_id) ? e.selected_motion_layer_id : e.motion_layers[0]?.id || null, e;
}
function oo(e) {
  const t = String(e || "").trim().replaceAll("\\", "/");
  if (!t || t.length > 1024 || t.includes("\0") || t.includes("://")) return null;
  const a = t.match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/);
  if (!a) return null;
  const o = String(a[1] || "").replace(/^\/+/, "");
  if (!o || /^[A-Za-z]:/.test(o) || o.split("/").some((i) => i === "..")) return null;
  const r = o.lastIndexOf("/"), n = r >= 0 ? o.slice(r + 1) : o, s = r >= 0 ? o.slice(0, r) : "";
  return !n || n === "." ? null : { filename: n, subfolder: s, type: a[2] || "input" };
}
function ro(e, t) {
  const a = oo(t);
  if (!a) return "";
  const o = `/view?filename=${encodeURIComponent(a.filename)}&subfolder=${encodeURIComponent(a.subfolder)}&type=${encodeURIComponent(a.type)}`;
  return e?.apiURL ? e.apiURL(o) : o;
}
function Jr(e) {
  return ro({ apiURL: jt }, e);
}
let jt = (e) => e;
const Ne = /* @__PURE__ */ new WeakMap();
function en({ api: e }) {
  jt = (t) => e.apiURL ? e.apiURL(t) : t;
}
function no(e, t, a) {
  const o = e.keyframes, r = Ne.get(e);
  if (r?.source === o && a >= r.frame && r.index < t.length - 1) {
    let s = r.index;
    for (; s + 1 < t.length - 1 && a >= t[s + 1].frame; ) s += 1;
    if (t[s].frame < a && a < t[s + 1].frame)
      return Ne.set(e, { source: o, frame: a, index: s }), { leftIndex: s, left: t[s], right: t[s + 1] };
  }
  const n = tt(t, a);
  return Ne.set(e, { source: o, frame: a, index: n?.leftIndex ?? 0 }), n;
}
function L(e) {
  const t = O(e.target, e.position), a = Math.sqrt(ee(t, t)) < 1e-6 ? [0, 0, -1] : de(t);
  let o = e.up || [0, 1, 0], r = me(a, o);
  Math.sqrt(ee(r, r)) < 1e-6 && (o = Math.abs(a[1]) > 0.9 ? [0, 0, a[1] > 0 ? -1 : 1] : [0, 1, 0], r = me(a, o)), r = de(r);
  let n = de(me(r, a));
  if (Math.abs(e.roll || 0) > 1e-9) {
    const s = e.roll * Math.PI / 180, i = Math.cos(s), l = Math.sin(s), m = M(C(r, i), C(n, l));
    n = M(C(n, i), C(r, -l)), r = m;
  }
  return { right: r, up: n, forward: a };
}
function F(e, t, a, o) {
  const { right: r, up: n, forward: s } = L(t), i = O(e, t.position), l = ee(i, s);
  if (l <= Math.max(1e-4, t.near || 0.01) || l >= (t.far || 1e4)) return null;
  const m = ee(i, r), c = ee(i, n);
  if (t.camera_type === "orthographic") {
    const d = 5 / Math.max(0.01, t.zoom || 1), u = d * a / Math.max(1, o);
    return [a * (0.5 + m / (2 * u)), o * (0.5 - c / (2 * d)), l];
  }
  const p = 0.5 * o / Math.tan(Math.max(1e-3, t.fov) * Math.PI / 360);
  return [a * 0.5 + m * p / l, o * 0.5 - c * p / l, l];
}
function fe(e, t, a = null) {
  const o = (e.keyframes || []).map((f) => ({
    ...f,
    camera: R(f.camera || f || e.camera || te())
  }));
  if (!o.length) return R(e.camera || te());
  const r = no(e, o, t), n = I(o, t, "pos_x", (f) => (f.camera || f).position[0], !1, r), s = I(o, t, "pos_y", (f) => (f.camera || f).position[1], !1, r), i = I(o, t, "pos_z", (f) => (f.camera || f).position[2], !1, r);
  let l = I(o, t, "target_x", (f) => (f.camera || f).target[0], !1, r), m = I(o, t, "target_y", (f) => (f.camera || f).target[1], !1, r), c = I(o, t, "target_z", (f) => (f.camera || f).target[2], !1, r);
  const p = e.constraints?.look_at, u = p?.status === void 0 || p?.status === "active" ? p?.object_id || e.target_object_id || e.camera?.target_object_id : null, h = a || e.objects;
  if (u && Array.isArray(h)) {
    const f = h.find((x) => x.id === u);
    if (f && f.enabled !== !1) {
      const x = Tt(h, f, t), T = p?.offset || e.target_offset || e.camera?.target_offset || [0, 0, 0];
      l = (x.position?.[0] ?? 0) + (T[0] || 0), m = (x.position?.[1] ?? 1.5) + (T[1] || 0), c = (x.position?.[2] ?? 0) + (T[2] || 0);
    }
  }
  const g = I(o, t, "fov", (f) => Number((f.camera || f).fov ?? 35), !1, r), v = I(o, t, "roll", (f) => Number((f.camera || f).roll ?? 0), !0, r), y = I(o, t, "zoom", (f) => Number((f.camera || f).zoom ?? 1), !1, r), b = I(o, t, "near", (f) => Number((f.camera || f).near ?? 0.01), !1, r), S = I(o, t, "far", (f) => Number((f.camera || f).far ?? 1e4), !1, r), D = o[0]?.camera || o[0] || te();
  let w = o[0];
  for (const f of o)
    if ((f.frame ?? 0) <= t) w = f;
    else break;
  const k = (w.camera || w).camera_type;
  return {
    position: [n, s, i],
    target: [l, m, c],
    fov: j(g, 5, 150),
    roll: v,
    camera_type: k || "perspective",
    zoom: Math.max(0.01, y),
    near: Math.max(1e-4, b),
    far: Math.max(b + 1e-4, S),
    ...D.up ? { up: [...D.up] } : {}
  };
}
const j = (e, t, a) => Math.max(t, Math.min(a, e)), so = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, se = (e, t = null) => typeof e == "string" && so.test(e.trim()) ? e.trim() : t, M = (e, t) => [e[0] + t[0], e[1] + t[1], e[2] + t[2]], O = (e, t) => [e[0] - t[0], e[1] - t[1], e[2] - t[2]], C = (e, t) => [e[0] * t, e[1] * t, e[2] * t], ee = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2], me = (e, t) => [e[1] * t[2] - e[2] * t[1], e[2] * t[0] - e[0] * t[2], e[0] * t[1] - e[1] * t[0]], $ = (e) => Math.sqrt(Math.max(1e-12, ee(e, e))), de = (e) => C(e, 1 / $(e));
function io(e, t, a) {
  const o = [a[0] - t[0], a[1] - t[1]], r = [e[0] - t[0], e[1] - t[1]], n = Math.max(1e-9, o[0] * o[0] + o[1] * o[1]), s = j((r[0] * o[0] + r[1] * o[1]) / n, 0, 1);
  return Math.hypot(e[0] - t[0] - o[0] * s, e[1] - t[1] - o[1] * s);
}
function co(e, t = "ease") {
  return e = j(e, 0, 1), t === "hold" ? 0 : t === "linear" ? e : t === "ease_in" ? e * e : t === "ease_out" ? 1 - (1 - e) * (1 - e) : t === "smooth" ? e * e * e * (e * (e * 6 - 15) + 10) : t === "bezier" ? 0.15 * (1 - e) * (1 - e) * e + 2.85 * (1 - e) * e * e + e * e * e : e * e * (3 - 2 * e);
}
const lo = ["auto", "vector", "free", "aligned", "flat"];
function mo(e, t) {
  const a = e?.tangents;
  return !a || typeof a != "object" ? {} : a.channels && typeof a.channels == "object" && a.channels[t] ? a.channels[t] : a;
}
function lt(e, t, a, o, r) {
  const n = mo(e, t), s = lo.includes(n.mode) ? n.mode : e?.tangents?.mode || "auto", i = r ? r(e) : 0, l = a && r ? r(a) : i, m = o && r ? r(o) : i, c = Math.max(1e-6, e.frame - (a?.frame ?? e.frame - 1)), p = Math.max(1e-6, (o?.frame ?? e.frame + 1) - e.frame), d = () => {
    const b = (i - l) / c, S = (m - i) / p;
    let D = (b + S) * 0.5;
    return a ? o || (D = b) : D = S, b * S <= 0 && a && o && (D = 0), {
      out_x: 1 / 3,
      out_y: D * p * (1 / 3),
      in_x: -1 / 3,
      in_y: -D * c * (1 / 3)
    };
  };
  if (s === "vector") {
    const b = (i - l) / c, S = (m - i) / p;
    return {
      out_x: 1 / 3,
      out_y: S * p * (1 / 3),
      in_x: -1 / 3,
      in_y: -b * c * (1 / 3),
      mode: s
    };
  }
  if (s === "flat")
    return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: s };
  if (s === "auto")
    return { ...d(), mode: s };
  const u = d(), h = j(Number(n.out_x ?? u.out_x), 0.01, 0.99), g = Number(n.out_y ?? u.out_y);
  let v = j(Number(n.in_x ?? u.in_x), -0.99, -0.01), y = Number(n.in_y ?? u.in_y);
  if (s === "aligned") {
    const b = Math.hypot(h, g) || 1e-6, S = Math.hypot(v, y) || 1e-6;
    v = -h / b * S, y = -g / b * S;
  }
  return { out_x: h, out_y: g, in_x: v, in_y: y, mode: s };
}
function tt(e, t) {
  if (!e.length || t <= e[0].frame || t >= e[e.length - 1].frame) return null;
  let a = 0, o = e.length - 1;
  for (; a + 1 < o; ) {
    const r = a + o >> 1;
    e[r].frame <= t ? a = r : o = r;
  }
  return { leftIndex: a, left: e[a], right: e[a + 1] };
}
function I(e, t, a, o, r = !1, n = null) {
  if (!e.length) return 0;
  if (t <= e[0].frame) return o(e[0]);
  if (t >= e[e.length - 1].frame) return o(e[e.length - 1]);
  const s = n || tt(e, t), { leftIndex: i, left: l, right: m } = s, c = i > 0 ? e[i - 1] : null, p = i + 2 < e.length ? e[i + 2] : null, d = Math.max(1, m.frame - l.frame), u = j((t - l.frame) / d, 0, 1);
  let h = o(l), g = o(m);
  if (r) {
    const b = ((g - h + 540) % 360 + 360) % 360 - 180;
    g = h + b;
  }
  if (l.interpolation === "bezier" || m.interpolation === "bezier") {
    const b = lt(l, a, c, m, o), S = lt(m, a, l, p, o), D = h, w = h + (b.out_y || 0), k = g + (S.in_y || 0), f = g, x = j(Number(b.out_x ?? 1 / 3), 0, 1), T = j(1 + Number(S.in_x ?? -1 / 3), 0, 1);
    let N = 0, X = 1;
    for (let it = 0; it < 32; it++) {
      const V = (N + X) * 0.5, ze = 1 - V;
      3 * ze * ze * V * x + 3 * ze * V * V * T + V * V * V < u ? N = V : X = V;
    }
    const H = (N + X) * 0.5, Y = 1 - H;
    return Y * Y * Y * D + 3 * Y * Y * H * w + 3 * Y * H * H * k + H * H * H * f;
  }
  const y = co(u, l.interpolation);
  return h + (g - h) * y;
}
function te() {
  return { position: [6, 4, 6], target: [0, 1.5, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 };
}
function De() {
  const e = [0, 1, 0], t = (a, o = [0, 1, 0], r = "orthographic") => ({ ...te(), position: a, target: [...e], up: o, camera_type: r, zoom: 1 });
  return {
    perspective: t([8, 6, 8], [0, 1, 0], "perspective"),
    iso: t([10, 11, 10]),
    front: t([0, 1, 14]),
    back: t([0, 1, -14]),
    top: t([0, 14, 0], [0, 0, -1]),
    bottom: t([0, -12, 0], [0, 0, 1]),
    right: t([14, 1, 0]),
    left: t([-14, 1, 0])
  };
}
function oe(e) {
  const t = e.size || [1, 1, 1], a = t.length === 2 ? [...t, 0.01] : [...t];
  return { position: [...e.position || [0, 0, 0]], rotation: [...e.rotation || [0, 0, 0]], size: a };
}
function Ae(e, t) {
  const a = e.keyframes || [];
  if (!a.length) return oe(e);
  const o = oe(e), r = (y, b) => (y.transform?.position || o.position)[b] ?? 0, n = (y, b) => (y.transform?.rotation || o.rotation)[b] ?? 0, s = (y, b) => (y.transform?.size || o.size)[b] ?? (b === 2 ? 0.01 : 1), i = tt(a, t), l = I(a, t, "pos_x", (y) => r(y, 0), !1, i), m = I(a, t, "pos_y", (y) => r(y, 1), !1, i), c = I(a, t, "pos_z", (y) => r(y, 2), !1, i), p = I(a, t, "rot_x", (y) => n(y, 0), !0, i), d = I(a, t, "rot_y", (y) => n(y, 1), !0, i), u = I(a, t, "rot_z", (y) => n(y, 2), !0, i), h = I(a, t, "scale_x", (y) => s(y, 0), !1, i), g = I(a, t, "scale_y", (y) => s(y, 1), !1, i), v = I(a, t, "scale_z", (y) => s(y, 2), !1, i);
  return {
    position: [Number.isFinite(l) ? l : o.position[0], Number.isFinite(m) ? m : o.position[1], Number.isFinite(c) ? c : o.position[2]],
    rotation: [Number.isFinite(p) ? p : o.rotation[0], Number.isFinite(d) ? d : o.rotation[1], Number.isFinite(u) ? u : o.rotation[2]],
    size: [
      Math.max(0.01, Number.isFinite(h) ? h : o.size[0]),
      Math.max(0.01, Number.isFinite(g) ? g : o.size[1]),
      Math.max(0.01, Number.isFinite(v) ? v : o.size[2])
    ]
  };
}
function tn(e = "balanced", t = "all_views", a = null) {
  const o = {
    none: 0,
    0: 0,
    sparse: 300,
    balanced: 800,
    dense: 1800,
    ultra: 3500
  }, r = o[e] !== void 0 ? o[e] : 800;
  if (r <= 0)
    return { points: [], colors: [] };
  const n = [], s = [];
  let i = 0.65, l = 0.72, m = 0.82;
  if (typeof a == "string" && a.startsWith("#")) {
    const d = a.replace("#", "");
    d.length === 6 && (i = parseInt(d.slice(0, 2), 16) / 255, l = parseInt(d.slice(2, 4), 16) / 255, m = parseInt(d.slice(4, 6), 16) / 255);
  }
  const c = 0.618033988749895, p = 0.324717957244746;
  for (let d = 0; d < r; d++) {
    const u = d * c % 1, h = d * p % 1, g = (d + 0.5) * 0.7548776662466927 % 1;
    let v = 0, y = 0, b = 0, S = 0.65, D = 0.72, w = 0.82;
    if (t === "ground_focus")
      if (u < 0.6) {
        const k = 0.4 + Math.sqrt(h) * 24, f = g * Math.PI * 2 + d * 2.399963229728653;
        v = Math.cos(f) * k, b = Math.sin(f) * k, y = 0.01 + u * 0.75, S = 0.86, D = 0.9, w = 0.98;
      } else {
        const k = 1 + Math.sqrt(h) * 18, f = g * Math.PI * 2 + d * 2.399963229728653;
        v = Math.cos(f) * k, b = Math.sin(f) * k, y = 0.75 + (u - 0.6) * 8.5, S = 0.62, D = 0.7, w = 0.82;
      }
    else if (t === "dome") {
      const k = u * Math.PI * 2, f = 1 - 2 * h, x = Math.sqrt(Math.max(0, 1 - f * f)), T = 1.5 + Math.cbrt(g) * 20;
      v = Math.cos(k) * x * T, b = Math.sin(k) * x * T, y = Math.max(0.01, f * T * 0.75 + 2.5), S = 0.72, D = 0.78, w = 0.88;
    } else {
      const k = d % 4;
      if (k === 0) {
        const f = 0.3 + Math.sqrt(h) * 28, x = d * 2.399963229728653;
        v = Math.cos(x) * f, b = Math.sin(x) * f, y = 0.01 + g * 0.34, S = 0.9, D = 0.94, w = 1;
      } else if (k === 1) {
        const f = 0.6 + Math.sqrt(h) * 18, x = d * 2.399963229728653;
        v = Math.cos(x) * f, b = Math.sin(x) * f, y = 0.35 + g * 3.15, S = 0.68, D = 0.76, w = 0.86;
      } else if (k === 2) {
        const f = 2 + Math.sqrt(h) * 24, x = d * 2.399963229728653;
        v = Math.cos(x) * f, b = Math.sin(x) * f, y = 3.5 + g * 11.5, S = 0.55, D = 0.65, w = 0.78;
      } else {
        const f = 0.5 + h * 6.5, x = d * 2.399963229728653;
        v = Math.cos(x) * f, b = Math.sin(x) * f, y = 0.05 + g * 4.95, S = 0.8, D = 0.86, w = 0.94;
      }
    }
    n.push(v, y, b), s.push(a ? S * i : S, a ? D * l : D, a ? w * m : w);
  }
  return { points: n, colors: s };
}
function po() {
  const e = te(), t = [{ frame: 0, camera: R(e), interpolation: "ease" }];
  return {
    schema_version: 1,
    fps: 24,
    duration_frames: 120,
    width: 1280,
    height: 720,
    render_mode: "omni_ref",
    camera: e,
    keyframes: t,
    cameras: [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: R(e), keyframes: t }],
    active_camera_id: "camera_1",
    playblast_camera_id: "camera_1",
    objects: [{ id: "subject", type: "card", name: "Subject Card", position: [0, 1.5, 0], rotation: [0, 0, 0], size: [2, 3, 0.01], material_mode: "textured", color: "#8c929b", keyframes: [], enabled: !0, asset: "" }],
    metadata: {},
    guides: !0,
    burn_in: !1,
    speed_heatmap: !1,
    playblast_grid: !1,
    playblast_resolution: "output",
    card_fit: "contain",
    card_asset: "",
    reference_index: 0,
    point_density: "balanced",
    point_spread: "all_views",
    point_color: "#cbd5e1",
    viewport_bg_color: "#121212",
    viewport_bg_image: "",
    viewport_bg_sequence: [],
    show_grid: !0,
    show_camera_paths: !0,
    show_camera_gizmos: !0,
    show_look_at: !0,
    show_helper_axes: !0,
    show_gizmo: !0,
    show_wireframe: !1,
    show_vertices: !1,
    select_mode: "object",
    gizmo_mode: "translate",
    gizmo_space: "world",
    navigation_profile: "maya",
    spatial_snap_mode: "none",
    spatial_grid_size: 0.5,
    auto_key: !1,
    view_mode: "camera",
    camera_view_visible: !0,
    editor_views: De(),
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
    aspect_ratio: "auto",
    health_profile: "generic",
    motion_layers: [],
    selected_motion_layer_id: null,
    motion_tool: "select",
    sequence: Xa()
  };
}
function R(e) {
  const t = te();
  if (!e || typeof e != "object") return t;
  const a = Array.isArray(e.position) ? [...e.position] : [...t.position], o = Array.isArray(e.target) ? [...e.target] : [...t.target], r = Math.max(1e-4, Number.isFinite(Number(e.near)) ? Number(e.near) : 0.01), n = Number.isFinite(Number(e.far)) ? Number(e.far) : 1e4;
  return {
    position: a,
    target: o,
    fov: Number(e.fov ?? 35),
    roll: Number(e.roll ?? 0),
    camera_type: e.camera_type || "perspective",
    zoom: Number(e.zoom ?? 1),
    near: r,
    far: Math.max(r + 1e-4, n),
    ...Array.isArray(e.up) ? { up: [...e.up] } : {}
  };
}
const ge = {
  maxCameras: 16,
  maxObjects: 256,
  maxKeysPerTrack: 1e4,
  maxDurationFrames: 14400
};
function ye(e, t, a, o) {
  if (e == null || e === "") return t;
  const r = Number(e);
  return Number.isFinite(r) ? j(r, a, o) : t;
}
function an(e) {
  const t = po();
  if (!e || typeof e != "object") return t;
  const a = { ...t, ...e };
  a.fps = Math.round(ye(a.fps, 24, 1, 120)), a.duration_frames = Math.round(ye(a.duration_frames, 120, 1, ge.maxDurationFrames)), a.width = Math.round(ye(a.width, 1280, 64, 4096)), a.height = Math.round(ye(a.height, 720, 64, 4096));
  const o = (c, p) => (Array.isArray(c) ? c : []).slice(0, ge.maxKeysPerTrack).map((d) => ({
    frame: Math.max(0, Math.round(Number(d.frame || 0))),
    camera: R(d.camera || d || p),
    interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold"].includes(d.interpolation) ? d.interpolation : "ease",
    ...d.tangents && typeof d.tangents == "object" ? { tangents: { ...d.tangents } } : {},
    ...Array.isArray(d.references) ? { references: d.references.map((u) => ({ ...u })) } : {}
  })), r = R(a.camera || t.camera);
  let n = o(a.keyframes, r);
  n = [...new Map(n.map((c) => [c.frame, c])).values()].sort((c, p) => c.frame - p.frame), n.length || (n = [{ frame: 0, camera: R(r), interpolation: "ease" }]);
  const s = Array.isArray(a.cameras) && a.cameras.length ? a.cameras : [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: r, keyframes: n }], i = /* @__PURE__ */ new Set();
  a.cameras = s.slice(0, ge.maxCameras).map((c, p) => {
    let d = String(c?.id || `camera_${p + 1}`);
    i.has(d) && (d = `camera_${p + 1}`), i.add(d);
    const u = R(c?.camera || c?.keyframes?.[0]?.camera || r);
    let h = o(c?.keyframes, u);
    return h = [...new Map(h.map((g) => [g.frame, g])).values()].sort((g, v) => g.frame - v.frame), h.length || (h = [{ frame: 0, camera: R(u), interpolation: "ease" }]), {
      id: d,
      name: String(c?.name || `Camera ${p + 1}`),
      color: se(c?.color),
      camera: u,
      keyframes: h,
      target_object_id: typeof c?.target_object_id == "string" ? c.target_object_id : typeof a.target_object_id == "string" ? a.target_object_id : null,
      target_offset: Array.isArray(c?.target_offset) ? c.target_offset.map(Number) : [0, 0, 0],
      // Bone the camera aims at inside the tracked model; null tracks it whole.
      aim_bone: typeof c?.aim_bone == "string" && c.aim_bone ? c.aim_bone : null,
      locked: !!c?.locked,
      muted: !!c?.muted,
      solo: !!c?.solo,
      recording_path: typeof c?.recording_path == "string" ? c.recording_path : ""
    };
  }), a.active_camera_id = a.cameras.some((c) => c.id === a.active_camera_id) ? a.active_camera_id : a.cameras[0].id, a.sequence = Ya(a.sequence, a.cameras.map((c) => c.id)), a.playblast_camera_id = a.playblast_camera_id === Ua && a.sequence.cuts.length || a.cameras.some((c) => c.id === a.playblast_camera_id) ? a.playblast_camera_id : a.active_camera_id;
  const l = a.cameras.find((c) => c.id === a.active_camera_id);
  a.camera = l.camera, a.keyframes = l.keyframes, a.target_object_id = l.target_object_id || null, a.target_offset = l.target_offset || [0, 0, 0], a.aim_bone = l.aim_bone || null, a.objects = (Array.isArray(a.objects) ? a.objects : t.objects).slice(0, ge.maxObjects).map((c) => ({
    ...c,
    color: se(c?.color),
    locked: !!c.locked,
    parent_id: typeof c.parent_id == "string" ? c.parent_id : null,
    position: Array.isArray(c.position) ? c.position.map(Number) : [0, 0, 0],
    rotation: Array.isArray(c.rotation) ? c.rotation.map(Number) : [0, 0, 0],
    size: Array.isArray(c.size) ? c.size.length === 2 ? [...c.size.map(Number), 0.01] : c.size.map(Number) : [1, 1, 1],
    material_mode: ["textured", "checker", "neutral", "wireframe"].includes(c.material_mode) ? c.material_mode : "textured",
    keyframes: (Array.isArray(c.keyframes) ? c.keyframes : []).map((p) => ({
      frame: Math.max(0, Math.round(Number(p.frame || 0))),
      transform: oe(p.transform || c),
      interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold"].includes(p.interpolation) ? p.interpolation : "ease",
      ...p.tangents && typeof p.tangents == "object" ? { tangents: { ...p.tangents } } : {}
    })).sort((p, d) => p.frame - d.frame)
  })), a.gizmo_mode = ["translate", "rotate", "scale"].includes(a.gizmo_mode) ? a.gizmo_mode : "translate", a.gizmo_space = a.gizmo_space === "local" ? "local" : "world", a.navigation_profile = a.navigation_profile === "blender" ? "blender" : "maya", a.spatial_snap_mode = ["none", "grid", "vertex"].includes(a.spatial_snap_mode) ? a.spatial_snap_mode : "none", a.spatial_grid_size = j(Number(a.spatial_grid_size) || 0.5, 0.01, 100), a.ui_density = ["basic", "animation", "advanced"].includes(a.ui_density) ? a.ui_density : "advanced", a.select_mode = ["object", "vertex", "edge", "face"].includes(a.select_mode) ? a.select_mode : "object", a.show_grid = a.show_grid !== !1, a.show_camera_paths = a.show_camera_paths !== !1, a.show_camera_gizmos = a.show_camera_gizmos !== !1, a.show_look_at = a.show_look_at !== !1, a.show_helper_axes = a.show_helper_axes !== !1, a.show_gizmo = a.show_gizmo !== !1, a.show_wireframe = !!a.show_wireframe, a.show_vertices = !!a.show_vertices, a.point_density = ["none", "0", "sparse", "balanced", "dense", "ultra"].includes(a.point_density) ? a.point_density : "balanced", a.point_spread = ["all_views", "ground_focus", "dome"].includes(a.point_spread) ? a.point_spread : "all_views", a.point_color = se(a.point_color, "#cbd5e1"), a.viewport_bg_color = se(a.viewport_bg_color, "#121212"), a.viewport_bg_image = typeof a.viewport_bg_image == "string" ? a.viewport_bg_image : "", a.viewport_bg_sequence = Array.isArray(a.viewport_bg_sequence) ? a.viewport_bg_sequence.map(String) : [], a.snap_enabled = a.snap_enabled !== !1, a.snap_frames = Math.max(1, Math.round(Number(a.snap_frames) || 1)), a.timecode_mode = ["time", "timecode"].includes(a.timecode_mode) ? a.timecode_mode : "time", a.loop_playback = !!a.loop_playback, a.playback_range = Array.isArray(a.playback_range) && a.playback_range.length === 2 ? [j(Math.round(Number(a.playback_range[0]) || 0), 0, a.duration_frames - 1), j(Math.round(Number(a.playback_range[1]) || a.duration_frames - 1), 0, a.duration_frames - 1)] : null, a.markers = (Array.isArray(a.markers) ? a.markers : []).filter((c) => c && Number.isFinite(Number(c.frame))).map((c, p) => ({ frame: Math.max(0, Math.round(Number(c.frame))), name: String(c.name || `Marker ${p + 1}`).slice(0, 40), color: se(c.color, "#f2d06b") })), a.preview_layout = ["auto", "1", "2", "4"].includes(String(a.preview_layout)) ? String(a.preview_layout) : "auto", a.maximized_camera_id = typeof a.maximized_camera_id == "string" ? a.maximized_camera_id : null, a.safe_areas = !!a.safe_areas, a.resolution_gate = !!a.resolution_gate, a.aspect_ratio = ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"].includes(a.aspect_ratio) ? a.aspect_ratio : "auto", a.auto_key = !!a.auto_key, a.playblast_grid = !!a.playblast_grid, a.playblast_resolution = ["viewport", "half", "output", "double"].includes(a.playblast_resolution) ? a.playblast_resolution : "output", a.reference_index = Math.max(0, Number(a.reference_index || 0)), a.view_mode = ["camera", "perspective", "iso", "front", "back", "top", "right", "left", "bottom"].includes(a.view_mode) ? a.view_mode : "camera", a.camera_view_visible = a.camera_view_visible !== !1;
  const m = De();
  return a.editor_views = Object.fromEntries(Object.entries(m).map(([c, p]) => [c, R(a.editor_views?.[c] || p)])), ao(a);
}
function je(e, t) {
  const [a, o, r] = (t || [0, 0, 0]).map((l) => l * Math.PI / 180);
  let [n, s, i] = e;
  return [s, i] = [s * Math.cos(a) - i * Math.sin(a), s * Math.sin(a) + i * Math.cos(a)], [n, i] = [n * Math.cos(o) + i * Math.sin(o), -n * Math.sin(o) + i * Math.cos(o)], [n, s] = [n * Math.cos(r) - s * Math.sin(r), n * Math.sin(r) + s * Math.cos(r)], [n, s, i];
}
function Be(e = [0, 0, 0]) {
  const [t, a, o] = e.map((c) => c * Math.PI / 360), r = Math.cos(t), n = Math.sin(t), s = Math.cos(a), i = Math.sin(a), l = Math.cos(o), m = Math.sin(o);
  return [n * s * l + r * i * m, r * i * l - n * s * m, r * s * m + n * i * l, r * s * l - n * i * m];
}
function fo(e, t) {
  return [e[3] * t[0] + e[0] * t[3] + e[1] * t[2] - e[2] * t[1], e[3] * t[1] - e[0] * t[2] + e[1] * t[3] + e[2] * t[0], e[3] * t[2] + e[0] * t[1] - e[1] * t[0] + e[2] * t[3], e[3] * t[3] - e[0] * t[0] - e[1] * t[1] - e[2] * t[2]];
}
function uo(e, [t, a, o, r]) {
  const [n, s, i] = e, l = r * n + a * i - o * s, m = r * s + o * n - t * i, c = r * i + t * s - a * n, p = -t * n - a * s - o * i;
  return [l * r - p * t - m * o + c * a, m * r - p * a - c * t + l * o, c * r - p * o - l * a + m * t];
}
function ho([e, t, a, o]) {
  const r = 1 - 2 * (t * t + a * a), n = 2 * (e * t - a * o), s = 2 * (e * a + t * o), i = 1 - 2 * (e * e + a * a), l = 2 * (t * a - e * o), m = 2 * (t * a + e * o), c = 1 - 2 * (e * e + t * t), p = Math.asin(Math.max(-1, Math.min(1, s))), [d, u] = Math.abs(s) < 0.9999999 ? [Math.atan2(-l, c), Math.atan2(-n, r)] : [Math.atan2(m, i), 0];
  return [d, p, u].map((h) => h * 180 / Math.PI);
}
function kt(e, t) {
  const a = t.quaternion || Be(t.rotation), o = fo(a, e.quaternion || Be(e.rotation));
  return { position: M(uo(e.position.map((r, n) => r * t.size[n]), a), t.position), rotation: ho(o), quaternion: o, size: e.size.map((r, n) => r * t.size[n]) };
}
function go(e, t) {
  const a = new Map(e.map((r) => [r.id, r])), o = (r, n = /* @__PURE__ */ new Set()) => {
    const s = { ...oe(r), quaternion: Be(r.rotation) };
    if (!r?.id || n.has(r.id)) return s;
    const i = r.parent_id ? a.get(r.parent_id) : null;
    if (!i) return s;
    const l = new Set(n);
    return l.add(r.id), kt(s, o(i, l));
  };
  return o(t);
}
function Tt(e, t, a, o = /* @__PURE__ */ new Set()) {
  const r = Ae(t, a);
  if (!t?.id || o.has(t.id)) return r;
  const n = new Set(o);
  n.add(t.id);
  const s = t.parent_id ? e.find((l) => l.id === t.parent_id) : null;
  if (!s) return r;
  const i = Tt(e, s, a, n);
  return kt(r, i);
}
const mt = ["speed", "angular_speed", "acceleration", "jerk"], Re = ["ok", "warn", "over"], Et = 0.8, yo = [0, 1.5, 0];
function dt(e, t) {
  const a = [0];
  for (let o = 1; o < e.length; o++) a.push(Math.abs(e[o] - e[o - 1]) * t);
  return a;
}
function bo(e, t) {
  const a = [0];
  for (let o = 1; o < e.length; o++) {
    const r = e[o - 1].position, n = e[o].position;
    a.push(Math.sqrt((n[0] - r[0]) ** 2 + (n[1] - r[1]) ** 2 + (n[2] - r[2]) ** 2) * t);
  }
  return a;
}
function _o(e, t) {
  const a = [0];
  for (let o = 1; o < e.length; o++) {
    const r = L(e[o - 1]), n = L(e[o]), s = ["right", "up", "forward"].reduce(
      (l, m) => l + r[m][0] * n[m][0] + r[m][1] * n[m][1] + r[m][2] * n[m][2],
      0
    ), i = Math.max(-1, Math.min(1, (s - 1) * 0.5));
    a.push(Math.acos(i) * 180 / Math.PI * t);
  }
  return a;
}
function vo(e, t = null) {
  if (t) return t.map(Number);
  const a = (e.objects || []).find((o) => o?.id === "subject");
  return Array.isArray(a?.position) ? a.position.slice(0, 3).map(Number) : [...yo];
}
function wo(e, t, a, o) {
  return e.map((r) => {
    const n = F(t, r, a, o);
    return !!(n && n[0] >= 0 && n[0] < a && n[1] >= 0 && n[1] < o);
  });
}
function pt(e, t) {
  return t == null || t <= 0 ? "ok" : e > t ? "over" : e > t * Et ? "warn" : "ok";
}
function ft(e) {
  for (let t = Re.length - 1; t >= 0; t--) if (e.includes(Re[t])) return Re[t];
  return "ok";
}
function So(e, t) {
  return e.length === t.length && e.every((a, o) => a === t[o]);
}
function Mo(e, t) {
  const a = [];
  for (let o = 0; o < e.length; o++) {
    const r = [...t[o]].sort(), n = a[a.length - 1];
    if (n && n.grade === e[o] && So(n.metrics, r)) {
      n.end = o;
      continue;
    }
    a.push({ start: o, end: o, grade: e[o], metrics: r });
  }
  return a;
}
function It(e, t = {}, a = null, o = "generic") {
  const r = Math.max(1, Number(e.fps) || 24), n = Math.max(1, Number(e.duration_frames) || 1), s = Math.max(1, Number(e.width) || 1280), i = Math.max(1, Number(e.height) || 720), l = [];
  for (let f = 0; f < n; f++) l.push(fe(e, f, e.objects));
  const m = bo(l, r), c = _o(l, r), p = dt(m, r), d = dt(p, r), u = { speed: m, angular_speed: c, acceleration: p, jerk: d }, h = vo(e, a), g = wo(l, h, s, i), v = l.map((f) => f.fov), y = t.allow_framing_loss === !0, b = [], S = [];
  for (let f = 0; f < n; f++) {
    const x = [], T = [];
    for (const N of mt) {
      const X = pt(u[N][f], t[`max_${N}`]);
      x.push(X), X !== "ok" && T.push(N);
    }
    !g[f] && !y && (x.push("over"), T.push("framing_loss")), b.push(ft(x)), S.push(T);
  }
  const D = g.filter((f) => !f).length, w = {
    profile: o,
    warn_ratio: Et,
    limits: t,
    subject: h,
    duration_frames: n,
    fps: r,
    max_speed: Math.max(...m),
    max_angular_speed: Math.max(...c),
    max_acceleration: Math.max(...p),
    max_jerk: Math.max(...d),
    max_fov_change: Math.max(...v) - Math.min(...v),
    framing_loss_frames: D,
    series: u,
    framing: g,
    frame_grades: b,
    segments: Mo(b, S),
    violations: []
  };
  for (const f of [...mt, "fov_drift"]) {
    const x = f === "fov_drift" ? "max_fov_change" : `max_${f}`, T = t[x];
    T != null && w[x] > Number(T) && w.violations.push({ metric: x, value: w[x], recommended_max: Number(T) });
  }
  D && !y && w.violations.push({ metric: "framing_loss_frames", value: D, recommended_max: 0 });
  const k = pt(w.max_fov_change, t.max_fov_change);
  return w.track_grades = { fov_drift: k }, w.grade = ft([...b, k]), w.trajectory_valid = w.violations.length === 0, w.ok = w.trajectory_valid, w;
}
function xo(e) {
  return e.segments.filter((t) => t.grade !== "ok").sort((t, a) => (a.grade === "over") - (t.grade === "over") || a.end - a.start - (t.end - t.start));
}
function qe(e, t) {
  const a = Math.max(1, e.state.duration_frames - 1), o = j(Number(e.timelineZoom) || 1, 0.1, 50), r = Number(e.timelinePan) || 0, n = a / o;
  return (t - r) / Math.max(1e-6, n) * 100;
}
function At(e, t, a) {
  const o = a.getBoundingClientRect(), r = Math.max(1, e.state.duration_frames - 1), n = j(Number(e.timelineZoom) || 1, 0.1, 50), s = Number(e.timelinePan) || 0, i = r / n, l = (t.clientX - o.left) / Math.max(1, o.width);
  return j(Math.round(s + l * i), 0, r);
}
function on(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = Math.max(1, e.state.duration_frames - 1), o = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey)
    e.timelinePan = j((Number(e.timelinePan) || 0) + (t.deltaY > 0 ? 4 : -4), -a * 0.5, a);
  else {
    const n = t.currentTarget.getBoundingClientRect(), s = (t.clientX - n.left) / Math.max(1, n.width), i = j(Number(e.timelineZoom) || 1, 0.2, 30), l = j(i * o, 0.2, 30), m = a / i, c = a / l, p = (Number(e.timelinePan) || 0) + s * m;
    e.timelinePan = j(p - s * c, -a * 0.5, a), e.timelineZoom = l;
  }
  e.refreshKeys(), e.setStatus(_(`Timeline zoom: ${(e.timelineZoom * 100).toFixed(0)}%`));
}
function rn(e) {
  e.timelineZoom = 1, e.timelinePan = 0, e.refreshKeys(), e.setStatus(_("Timeline view fitted"));
}
function nn(e, t) {
  if (t.target.closest?.(".key")) return;
  t.preventDefault(), t.stopPropagation(), e.exitKeyEdit(!0);
  const a = t.currentTarget;
  if (a.focus({ preventScroll: !0 }), a.setPointerCapture?.(t.pointerId), t.button === 1 || t.altKey || t.button === 2) {
    e.timelinePanDrag = {
      startX: t.clientX,
      origPan: Number(e.timelinePan) || 0,
      pointerId: t.pointerId
    };
    return;
  }
  if (t.shiftKey) {
    const o = a.getBoundingClientRect();
    e.boxSelect = { box: a, pointerId: t.pointerId, startX: t.clientX - o.left, currentX: t.clientX - o.left };
    return;
  }
  e.selectedKeyFrames = null, e.timelineDrag = { box: a, pointerId: t.pointerId }, e.setFrame(At(e, t, a));
}
function sn(e, t) {
  if (e.timelinePanDrag && t.pointerId === e.timelinePanDrag.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const a = t.clientX - e.timelinePanDrag.startX, o = e.timelineDrag?.box || e.root.querySelector('[data-role="dope-tracks"]'), n = Math.max(1, e.state.duration_frames - 1) / (Number(e.timelineZoom) || 1);
    e.timelinePan = e.timelinePanDrag.origPan - a / Math.max(1, o.clientWidth) * n, e.refreshKeys();
    return;
  }
  if (e.boxSelect && t.pointerId === e.boxSelect.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const a = e.boxSelect.box.getBoundingClientRect();
    e.boxSelect.currentX = t.clientX - a.left;
    let o = e.boxSelect.overlay;
    o || (o = document.createElement("div"), o.className = "box-select", e.boxSelect.box.appendChild(o), e.boxSelect.overlay = o);
    const r = Math.min(e.boxSelect.startX, e.boxSelect.currentX);
    o.style.left = `${r}px`, o.style.width = `${Math.abs(e.boxSelect.currentX - e.boxSelect.startX)}px`, o.style.top = "0", o.style.bottom = "0";
    return;
  }
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.setFrame(At(e, t, e.timelineDrag.box)));
}
function cn(e, t) {
  if (e.timelinePanDrag && t.pointerId === e.timelinePanDrag.pointerId) {
    e.timelinePanDrag = null;
    return;
  }
  if (e.boxSelect && t.pointerId === e.boxSelect.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const a = e.boxSelect.box.getBoundingClientRect(), o = Math.max(1, e.state.duration_frames - 1), r = j(Number(e.timelineZoom) || 1, 0.1, 50), n = Number(e.timelinePan) || 0, s = o / r, i = (p) => j(n + p / Math.max(1, a.width) * s, 0, o), l = Math.min(i(e.boxSelect.startX), i(e.boxSelect.currentX)), m = Math.max(i(e.boxSelect.startX), i(e.boxSelect.currentX));
    e.boxSelect.overlay?.remove(), e.boxSelect = null;
    const c = e.timelineKeyframes().filter((p) => p.frame >= l && p.frame <= m).map((p) => p.frame);
    c.length && (e.selectedKeyFrames = new Set(c), e.selectedKeyFrame = c[0], e.updateKeyVisualState(), e.refreshKeyEditor(), e.setStatus(_(`${c.length} keys selected`)));
    return;
  }
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.timelineDrag.box.hasPointerCapture?.(t.pointerId) && e.timelineDrag.box.releasePointerCapture(t.pointerId), e.timelineDrag = null);
}
const Co = 4;
function Do(e, t) {
  const a = e.keyDrag;
  if (!a) return;
  if (!a.engaged) {
    if (Math.hypot(t.clientX - (a.startClientX ?? t.clientX), t.clientY - (a.startClientY ?? t.clientY)) < Co) return;
    a.engaged = !0;
  }
  const o = a.box.getBoundingClientRect(), r = Math.max(1, e.state.duration_frames - 1), n = j(Number(e.timelineZoom) || 1, 0.1, 50), s = Number(e.timelinePan) || 0, i = r / n;
  let l = Math.round(j(s + (t.clientX - o.left) / Math.max(1, o.width) * i, 0, r));
  l = e.snapFrame(l);
  const m = l - a.startPointerFrame;
  let c = a.badge;
  c || (c = document.createElement("div"), c.className = "floating-retime-badge", a.box.appendChild(c), a.badge = c);
  const p = qe(e, l);
  if (c.style.left = `${p}%`, c.textContent = a.isDuplicate ? `+Copy F${l}` : `F${l}${m !== 0 ? ` (${m > 0 ? "+" : ""}${m})` : ""}`, a.moving && a.moving.length > 1) {
    if (m === a.lastDelta) return;
    a.lastDelta = m;
    const d = e.timelineKeyframes(), u = new Set(d.filter((h) => !e.selectedKeyFrames.has(h.frame)).map((h) => h.frame));
    for (const h of a.moving) {
      let g = j(h.startFrame + m, 0, e.state.duration_frames - 1);
      for (; u.has(g) && g > 0 && g < e.state.duration_frames - 1; ) g += Math.sign(m || 1);
      h.key.frame = u.has(g) ? h.key.frame : g;
    }
    d.sort((h, g) => h.frame - g.frame), e.editingKeyFrame = a.key.frame, e.scheduleSerialize(), e.setFrame(a.key.frame, !1, !0);
    return;
  }
  l !== a.key.frame && (e.editingKeyFrame = a.key.frame, e.retimeSelectedKey(l, !0));
}
function jo(e, t) {
  const a = e.camera?.position || [0, 0, 0], o = t.camera?.position || [0, 0, 0];
  return Math.sqrt((o[0] - a[0]) ** 2 + (o[1] - a[1]) ** 2 + (o[2] - a[2]) ** 2);
}
function ke(e) {
  return (e || []).map((t) => ({
    ...t,
    camera: { ...t.camera || {}, position: [...t.camera?.position || []], target: [...t.camera?.target || []] }
  }));
}
function ko(e, t) {
  const a = ke(e);
  if (a.length < 3 || t < 2) return a;
  const o = [0];
  for (let l = 1; l < a.length; l++)
    o.push(o[l - 1] + jo(a[l - 1], a[l]));
  const r = o[o.length - 1];
  if (r <= 1e-9) return a;
  const n = a[0].frame ?? 0, s = (a[a.length - 1].frame ?? t) - n;
  if (s <= 0) return a;
  let i = n;
  for (let l = 1; l < a.length - 1; l++) {
    const m = n + Math.round(s * (o[l] / r));
    a[l].frame = Math.min(t - 1, Math.max(i + 1, m)), i = a[l].frame;
  }
  return a;
}
function Ot(e, t) {
  return t.some((a) => e >= a.start && e <= a.end);
}
function To(e, t, a = 0.6) {
  const o = ke(e), r = Math.min(1, Math.max(0, Number(a) || 0));
  if (!r || o.length < 3 || !t?.length) return o;
  const n = ke(o);
  for (let s = 1; s < o.length - 1; s++)
    if (Ot(o[s].frame ?? 0, t))
      for (const i of ["position", "target"]) {
        const l = [o[s - 1], o[s], o[s + 1]].map((p) => p.camera?.[i]).filter((p) => Array.isArray(p) && p.length >= 3), m = o[s].camera?.[i];
        if (l.length < 3 || !Array.isArray(m)) continue;
        const c = [0, 1, 2].map((p) => l.reduce((d, u) => d + Number(u[p] || 0), 0) / l.length);
        n[s].camera[i] = m.map((p, d) => Number(p) + (c[d] - Number(p)) * r);
      }
  return n;
}
function Eo(e, t, a) {
  const o = ke(e);
  if (!t?.length || !Array.isArray(a)) return o;
  const r = a.slice(0, 3).map(Number);
  for (const n of o)
    Ot(n.frame ?? 0, t) && (n.camera.target = [...r]);
  return o;
}
function Io(e, t) {
  return e.segments.filter((a) => a.grade !== "ok" && a.metrics.includes(t)).map((a) => ({ start: a.start, end: a.end }));
}
function Ao(e) {
  return e.segments.filter((t) => t.grade !== "ok").map((t) => ({ start: t.start, end: t.end }));
}
function Oe(e) {
  return {
    speed: _("Travel speed"),
    angular_speed: _("Rotation speed"),
    acceleration: _("Acceleration"),
    jerk: _("Jerk"),
    framing_loss: _("Subject out of frame"),
    fov_drift: _("FOV change")
  }[e] || e;
}
function Oo(e) {
  return {
    ok: _("Within limits"),
    warn: _("Near the limit"),
    over: _("Over the limit")
  }[e] || e;
}
let be = null, He = null;
function Po(e) {
  He = e;
}
async function ln() {
  if (be) return be;
  try {
    if (!He) return null;
    const e = await He.fetchApi("/majoor/omnicam/motion_profiles");
    return e.ok ? (be = await e.json(), be) : null;
  } catch {
    return null;
  }
}
function zo(e) {
  return e.root.querySelector('[data-role="health-profile"]')?.value || e.state?.health_profile || "generic";
}
function No(e, t) {
  const a = e.motionProfiles?.profiles?.find((o) => o.id === t);
  return a ? a.limits : null;
}
function ue(e) {
  const t = zo(e), a = No(e, t);
  return a ? It(e.state, a, null, t) : null;
}
function ut(e) {
  return Number(e).toFixed(Math.abs(e) >= 100 ? 0 : 1);
}
function ie(e, t, a, o) {
  const r = a == null ? _("no limit") : `${ut(t)} / ${ut(a)}`;
  return `
    <div class="oc-health-metric" data-grade="${o}">
      <span class="oc-health-dot"></span>
      <span class="oc-health-metric-name">${Oe(e)}</span>
      <span class="oc-health-metric-value">${r}</span>
    </div>`;
}
function _e(e, t, a) {
  return t == null || t <= 0 ? "ok" : e > t ? "over" : e > t * a ? "warn" : "ok";
}
function Ro(e) {
  const t = xo(e);
  return t.length ? t.slice(0, 6).map((a) => {
    const o = a.metrics.map((n) => Oe(n)).join(", "), r = a.start === a.end ? _("Frame {frame}").replace("{frame}", String(a.start)) : _("Frames {start}-{end}").replace("{start}", String(a.start)).replace("{end}", String(a.end));
    return `
      <button type="button" class="oc-health-zone" data-grade="${a.grade}" data-zone-start="${a.start}"
              title="${_("Jump the playhead to this zone")}">
        <span class="oc-health-dot"></span><span class="oc-health-zone-range">${r}</span>
        <span class="oc-health-zone-reason">${o}</span>
      </button>`;
  }).join("") : `<div class="oc-health-empty">${_("No problem zone on this shot.")}</div>`;
}
function Fo(e) {
  const t = e.root.querySelector('[data-role="health-body"]'), a = e.root.querySelector('[data-role="health-badge"]');
  if (!t || !a) return;
  if (!e.motionProfiles) {
    a.className = "oc-health-badge", a.textContent = _("Unavailable"), t.innerHTML = `<div class="oc-health-empty">${_("Could not load the recommended limits from the OmniCam server. The panel will not guess a threshold.")}</div>`;
    return;
  }
  const o = ue(e);
  if (!o) return;
  e.healthReport = o;
  const { warn_ratio: r } = o;
  a.className = `oc-health-badge ${o.grade}`, a.textContent = Oo(o.grade);
  const n = [
    ie(
      "speed",
      o.max_speed,
      o.limits.max_speed,
      _e(o.max_speed, o.limits.max_speed, r)
    ),
    ie(
      "angular_speed",
      o.max_angular_speed,
      o.limits.max_angular_speed,
      _e(o.max_angular_speed, o.limits.max_angular_speed, r)
    ),
    ie(
      "acceleration",
      o.max_acceleration,
      o.limits.max_acceleration,
      _e(o.max_acceleration, o.limits.max_acceleration, r)
    ),
    ie(
      "jerk",
      o.max_jerk,
      o.limits.max_jerk,
      _e(o.max_jerk, o.limits.max_jerk, r)
    ),
    ie("fov_drift", o.max_fov_change, o.limits.max_fov_change, o.track_grades.fov_drift)
  ].join(""), s = o.framing_loss_frames ? `<div class="oc-health-metric" data-grade="over"><span class="oc-health-dot"></span>
         <span class="oc-health-metric-name">${Oe("framing_loss")}</span>
         <span class="oc-health-metric-value">${_("{count} frames").replace("{count}", String(o.framing_loss_frames))}</span>
       </div>` : "";
  t.innerHTML = `
    <div class="oc-health-metrics">${n}${s}</div>
    <div class="oc-section">${_("Problem zones")}</div>
    <div class="oc-health-zones" data-role="health-zones">${Ro(o)}</div>
    <div class="oc-card-actions oc-health-actions">
      <button data-act="health-slow" title="${_("Respace the keys so the shot travels at a constant speed")}"><i class="pi pi-clock"></i> ${_("Slow to limits")}</button>
      <button data-act="health-smooth" title="${_("Blend the keys inside the flagged zones only")}"><i class="pi pi-chart-line"></i> ${_("Smooth flagged")}</button>
      <button data-act="health-recenter" title="${_("Aim the keys of the flagged zones back at the subject")}"><i class="pi pi-crosshairs"></i> ${_("Recenter subject")}</button>
    </div>
    <p class="oc-health-note">${_("A valid trajectory stays inside the limits recommended for this model. It is not a guarantee about the generated video.")}</p>`;
}
function mn(e, t) {
  if (!t || !e.motionProfiles) return;
  const a = ue(e);
  if (a) {
    e.healthReport = a;
    for (const o of a.segments) {
      if (o.grade === "ok") continue;
      const r = qe(e, o.start), n = qe(e, o.end + 1);
      if (n < -5 || r > 105) continue;
      const s = document.createElement("div");
      s.className = "oc-health-band", s.dataset.grade = o.grade, s.style.left = `${r}%`, s.style.width = `${Math.max(0.4, n - r)}%`, s.title = o.metrics.map((i) => Oe(i)).join(", "), t.appendChild(s);
    }
  }
}
function Te(e, t, a, o) {
  const r = e.activeCameraTrack();
  r && (e.checkpoint(a), r.keyframes = t, e.state.keyframes = t, e.syncActiveCameraTrack(), e.refreshKeys(), e.setFrame(e.frame, !1, !1), e.setStatus(o), Fo(e));
}
function dn(e) {
  const t = ue(e);
  if (!t) return;
  const a = t.limits.max_speed;
  if (!a) {
    e.setStatus(_("This profile sets no speed limit."));
    return;
  }
  const o = Math.max(1, e.state.duration_frames - 1), r = ko(e.state.keyframes, o), n = It({ ...e.state, keyframes: r }, t.limits, null, t.profile);
  if (n.max_speed <= a) {
    Te(e, r, "Slow to limits", _("Speed flattened; the shot keeps its length."));
    return;
  }
  const s = n.max_speed / a * (e.state.duration_frames / Math.max(1, e.state.fps));
  Te(e, r, "Slow to limits", _("Speed flattened, still over: this path needs about {seconds}s to fit the limit.").replace("{seconds}", s.toFixed(1)));
}
function pn(e) {
  const t = ue(e);
  if (!t) return;
  const a = Ao(t);
  if (!a.length) {
    e.setStatus(_("Nothing is flagged on this shot."));
    return;
  }
  const o = To(e.state.keyframes, a, 0.6);
  Te(
    e,
    o,
    "Smooth flagged zones",
    _("Smoothed {count} flagged zone(s).").replace("{count}", String(a.length))
  );
}
function fn(e) {
  const t = ue(e);
  if (!t) return;
  const a = Io(t, "framing_loss");
  if (!a.length) {
    e.setStatus(_("The subject stays in frame on this shot."));
    return;
  }
  const o = Eo(e.state.keyframes, a, t.subject);
  Te(
    e,
    o,
    "Recenter subject",
    _("Recentred {count} zone(s) on the subject.").replace("{count}", String(a.length))
  );
}
const Lo = {
  "Add static screen anchor": "Ajouter une ancre écran fixe",
  "Balanced camera field": "Champ caméra équilibré",
  Binding: "Liaison",
  "Camera Motion Field": "Champ de mouvement caméra",
  "Camera field presets": "Préréglages de champ caméra",
  "Cancel (Esc)": "Annuler (Échap)",
  "Create Motion": "Créer un mouvement",
  "Delete motion layer": "Supprimer le calque de mouvement",
  Depth: "Profondeur",
  "Depth layers camera field": "Champ caméra par plans de profondeur",
  "Draw motion track": "Dessiner un motion track",
  "Draw Path": "Tracer une trajectoire",
  "Draw movement onscreen": "Dessiner le mouvement à l’écran",
  "Drawing motion": "Tracé du mouvement",
  "Enable or disable motion layer": "Activer ou désactiver le calque de mouvement",
  "Erase motion track": "Effacer un motion track",
  "Fit to Playback Range": "Caler sur la plage de lecture",
  "Fixed screen position": "Position écran fixe",
  "Follow a scene object": "Suivre un objet de la scène",
  Foreground: "Premier plan",
  "Foreground camera field": "Champ caméra premier plan",
  "Ground parallax camera field": "Champ caméra parallaxe au sol",
  "Model Compatibility": "Compatibilité des modèles",
  "Motion Tracks are consumed by screen-track profiles. Generic video does not use them directly.": "Les motion tracks sont utilisés par les profils screen-track. La vidéo générique ne les utilise pas directement.",
  "Motion Tracks are experimental and may change before a stable release.": "Les motion tracks sont expérimentaux et peuvent changer avant une version stable.",
  "Motion interpolation": "Interpolation du mouvement",
  "Motion paths appear here in screen space.": "Les trajectoires de mouvement apparaissent ici en espace écran.",
  "Motion paths in screen space. Click a path to select it.": "Trajectoires de mouvement en espace écran. Cliquez sur une trajectoire pour la sélectionner.",
  "Motion key visibility": "Visibilité des clés de mouvement",
  "Motion track timeline": "Timeline des motion tracks",
  "Motion track tools": "Outils motion track",
  "No motion tracks yet. Control subject movement independently from the camera.": "Aucun motion track pour l’instant. Contrôlez le mouvement du sujet indépendamment de la caméra.",
  "Not visible on the first frame — ATI, Wan Track and LTX Motion drop tracks hidden at frame 0. Move the point into frame at frame 0 or switch to Screen Anchor.": "Non visible sur la première image — ATI, Wan Track et LTX Motion suppriment les tracks masqués à l’image 0. Ramenez le point dans le cadre à l’image 0 ou passez en Ancre écran.",
  "Path Preview": "Aperçu de la trajectoire",
  "Project selected object or world point": "Projeter l’objet sélectionné ou un point monde",
  "Remap keys onto the current playback range": "Recaler les clés sur la plage de lecture actuelle",
  Screen: "Écran",
  "Screen Anchor": "Ancre écran",
  "Select motion track": "Sélectionner un motion track",
  "Selected Track": "Piste sélectionnée",
  "Subject camera field": "Champ caméra sujet",
  Timing: "Minutage",
  "Track Object": "Suivre un objet",
  "Track a fixed 3D point": "Suivre un point 3D fixe",
  Tracks: "Pistes",
  Visible: "Visible",
  "1 optional adapter issue": "1 problème d’adaptateur optionnel",
  "1 key": "1 clé",
  "2D Radar Mini-Map": "Mini-carte radar 2D",
  "Active playblast camera": "Caméra de playblast active",
  "Core ready": "Cœur prêt",
  "Add a second camera, then Auto-split to cut between them.": "Ajoutez une deuxième caméra, puis découpez automatiquement pour couper entre elles.",
  "Add Camera": "Ajouter une caméra",
  "Add Cube (+)": "Ajouter un cube (+)",
  "Add Ground (+)": "Ajouter un sol (+)",
  "Add Human (+)": "Ajouter un humain (+)",
  "Add Media Card": "Ajouter une carte média",
  "Add Null (+)": "Ajouter un null (+)",
  "Add Sphere (+)": "Ajouter une sphère (+)",
  Advanced: "Avancé",
  "Aim Bone": "Os de visée",
  "Aim at a bone inside the tracked rig instead of its origin": "Viser un os du rig suivi plutôt que son origine",
  "Aim at Target Subject": "Viser le sujet cible",
  "Aim baked on bone {bone} ({count} keys)": "Visée bakée sur l'os {bone} ({count} clés)",
  "Aiming at bone {bone}": "Visée sur l'os {bone}",
  "Aiming at the whole object": "Visée sur l'objet entier",
  Aligned: "Alignées",
  All: "Tout",
  "All Views (Full 3D)": "Toutes les vues (3D complète)",
  "Animated cameras": "Caméras animées",
  Animation: "Animation",
  "Animation clip": "Clip d'animation",
  "Aspect Ratio": "Rapport d'image",
  "At least one camera is required": "Au moins une caméra est requise",
  Auto: "Auto",
  "Auto-split shots": "Découper automatiquement",
  "Auto strip": "Bande auto",
  "Auto-Key: Records moves live while scrubbing/navigating": "Auto-Key : enregistre les mouvements en direct pendant le scrub / la navigation",
  "Automatic smooth tangents": "Tangentes lissées automatiques",
  "BG Color": "Couleur de fond",
  "BG Image": "Image de fond",
  "BG Sequence": "Séquence de fond",
  "Background colour reset": "Couleur de fond réinitialisée",
  "Back View": "Vue arrière",
  Bake: "Baker",
  "Bake Per Frame": "Baker image par image",
  "Beauty (lit)": "Beauty (éclairé)",
  Balanced: "Équilibré",
  "Balanced (800)": "Équilibré (800)",
  Basic: "Basique",
  Bezier: "Bézier",
  "Blocking Scene Sets (Parallax / Occlusion)": "Décors de blocking (parallaxe / occlusion)",
  "Bottom View": "Vue de dessous",
  "Burn-in Data": "Données de burn-in",
  "CAMERA PREVIEW": "APERÇU CAMÉRA",
  Camera: "Caméra",
  "Cut trimmed": "Coupe ajustée",
  "Clear edit": "Effacer le montage",
  "Cut the current shot in two at the playhead": "Couper le plan courant en deux à la tête de lecture",
  "Cut the timeline into shots, one camera per range": "Découper la timeline en plans, une caméra par plage",
  "Camera Color": "Couleur de la caméra",
  "Camera Gizmos (body / frustum)": "Gizmos caméra (corps / frustum)",
  "Camera Paths": "Chemins caméra",
  "Camera View": "Vue caméra",
  "Camera selected": "Caméra sélectionnée",
  "Camera keyframe timeline": "Timeline des clés caméra",
  "Camera name": "Nom de la caméra",
  "Camera reset": "Caméra réinitialisée",
  Cameras: "Caméras",
  "Card + Grid": "Carte + grille",
  "Card fit": "Ajustement de la carte",
  "Card loaded locally; backend upload failed": "Carte chargée en local ; l'envoi au backend a échoué",
  Checker: "Damier",
  "Choose the animated channels displayed in the graph": "Choisir les canaux animés affichés dans le graphe",
  "Clear Background": "Effacer le fond",
  "Clear Caches & Clean": "Vider les caches et nettoyer",
  "Clear Playback Range": "Effacer la plage de lecture",
  "Clear WebGL textures, temporary files and memory caches": "Libérer les textures WebGL, les fichiers temporaires et les caches mémoire",
  "Click to select & activate this camera": "Cliquer pour sélectionner et activer cette caméra",
  "Click to select · Double-click to toggle visibility · Right-click for actions": "Clic pour sélectionner · Double-clic pour la visibilité · Clic droit pour les actions",
  "Click to toggle Time / Timecode": "Cliquer pour basculer Temps / Timecode",
  "Compose a frame, press I, scrub, move the camera and press I again. Space previews the move; Playblast records the neutral motion reference.": "Composez un cadre, appuyez sur I, scrubez, déplacez la caméra puis appuyez de nouveau sur I. Espace prévisualise le mouvement ; Playblast enregistre la référence de mouvement neutre.",
  "Composition Guides & Mini-Map": "Repères de composition et mini-carte",
  "Copy Keyframe (Ctrl+C)": "Copier la clé (Ctrl+C)",
  "Copy a keyframe first": "Copiez d'abord une clé",
  Corridor: "Couloir",
  Crash: "Crash",
  "Create camera from current view": "Créer une caméra depuis la vue courante",
  "Create the H3 reference nodes": "Créer les nodes de référence H3",
  Cube: "Cube",
  "Currently selected for editing": "Actuellement sélectionné pour l'édition",
  "Curve view fitted": "Vue des courbes ajustée",
  Debug: "Debug",
  "Delete Selected Keyframe (Del / Backspace)": "Supprimer la clé sélectionnée (Suppr / Retour)",
  "Drag to trim the cut": "Glisser pour ajuster la coupe",
  "Delete camera": "Supprimer la caméra",
  "Delete object": "Supprimer l'objet",
  "Dense (1800)": "Dense (1800)",
  Deselected: "Désélectionné",
  Display: "Affichage",
  "Dolly Zoom (Vertigo)": "Dolly zoom (effet Vertigo)",
  "Doorway Pass": "Passage de porte",
  "Drag a key point vertically or drag tangent handles on either side. Scroll to zoom. Right-click for curve actions.": "Glissez un point de clé verticalement ou ses poignées de tangente de chaque côté. Molette pour zoomer. Clic droit pour les actions de courbe.",
  Dur: "Dur",
  Ease: "Ease",
  "Ease In": "Ease In",
  "Ease In/Out": "Ease In/Out",
  "Ease Out": "Ease Out",
  "Edge (2)": "Arête (2)",
  "Edge Selection Mode (2)": "Mode sélection d'arêtes (2)",
  Encoder: "Encodeur",
  "Encoding deterministic proxy…": "Encodage du proxy déterministe…",
  "English source string": "Chaîne source anglaise",
  "Environment & Background": "Environnement et arrière-plan",
  "FG Reveal": "Révélation avant-plan",
  FOV: "FOV",
  "FOV / Roll / Zoom": "FOV / Roll / Zoom",
  FPS: "FPS",
  "Face (3)": "Face (3)",
  "Face / Polygon Selection Mode (3)": "Mode sélection de faces / polygones (3)",
  "Far Clip": "Plan éloigné",
  Fill: "Remplir",
  "Filter the outliner": "Filtrer l'outliner",
  "First Frame (Home)": "Première image (Origine)",
  Fit: "Ajuster",
  "Fit Timeline to View (F)": "Ajuster la timeline à la vue (F)",
  "Fit curves to view": "Ajuster les courbes à la vue",
  Flat: "Plates",
  "Floor Grid": "Grille de sol",
  "Focal Length": "Focale",
  "Foreground pillar sweep reveal": "Révélation par balayage de piliers en avant-plan",
  Frame: "Image",
  "Frame Camera Target": "Cadrer la cible de la caméra",
  "Frame Subject Target (F)": "Cadrer le sujet cible (F)",
  Free: "Libres",
  "Front View": "Vue de face",
  "GLB, OBJ, FBX, STL, PLY. Audio WAV/MP3/OGG.": "GLB, OBJ, FBX, STL, PLY. Audio WAV/MP3/OGG.",
  "Go to first frame": "Aller à la première image",
  "Go to last frame": "Aller à la dernière image",
  "Graph Editor": "Éditeur de courbes",
  Graybox: "Graybox",
  Grid: "Grille",
  Ground: "Sol",
  "Ground + Low Angle": "Sol + contre-plongée",
  "Ground Plane": "Plan de sol",
  "H3 Setup": "Configuration H3",
  "H3 preset": "Préréglage H3",
  Handheld: "Caméra portée",
  "Handheld Shake": "Secousse caméra portée",
  "Helper Axes (nulls)": "Axes d'aide (nulls)",
  "Hide camera previews": "Masquer les aperçus caméra",
  Hold: "Hold",
  Human: "Humain",
  "Human Proxy": "Proxy humain",
  "Import 3D Model (+)": "Importer un modèle 3D (+)",
  "Import 3D Scene": "Importer une scène 3D",
  "Insert / Update Keyframe at Playhead (I)": "Insérer / mettre à jour la clé à la tête de lecture (I)",
  "Insert Key (I)": "Insérer une clé (I)",
  "Insert or update key": "Insérer ou mettre à jour la clé",
  Inspector: "Inspecteur",
  "Interaction cancelled": "Interaction annulée",
  Interface: "Interface",
  Interpolation: "Interpolation",
  "Interpolation & tangents": "Interpolation et tangentes",
  "Jump Playhead & View to Key": "Amener la tête de lecture et la vue sur la clé",
  "Keys past the end of the timeline are kept. Lengthen the shot to reach them again.": "Les clés au-delà de la fin de la timeline sont conservées. Rallongez le plan pour les retrouver.",
  "Keep the grid in the playblast": "Conserver la grille dans le playblast",
  "Keep at least one camera keyframe": "Conservez au moins une clé caméra",
  Key: "Clé",
  "Key @ 0": "Clé @ 0",
  "Keyframe Tools": "Outils de clés",
  "Last Frame (End)": "Dernière image (Fin)",
  Layout: "Disposition",
  "Left Side": "Côté gauche",
  Lens: "Optique",
  Linear: "Linéaire",
  "Load an audio track to cut against": "Charger une piste audio pour caler les coupes",
  "Load audio": "Charger l'audio",
  "Load Audio Track": "Charger une piste audio",
  Local: "Local",
  "Look At": "Visée",
  "Look-At Targets": "Cibles de visée",
  "Look-At target selected": "Cible de visée sélectionnée",
  "Loop playback": "Lecture en boucle",
  "MMB/Alt-drag: Pan · Scroll: Zoom · Box Select: Drag · Drag Point: Retime/Value · Right-click: Menu": "Clic milieu/Alt-glisser : panoramique · Molette : zoom · Rectangle : sélection · Glisser un point : retiming/valeur · Clic droit : menu",
  Maintenance: "Maintenance",
  "Multi-camera edit cleared": "Montage multi-caméras effacé",
  "Multi-camera edit": "Montage multi-caméras",
  "Move the playhead inside a shot first": "Placez d'abord la tête de lecture dans un plan",
  "Manual Target (No Tracking)": "Cible manuelle (sans suivi)",
  Material: "Matériau",
  "Mesh Vertices": "Sommets du maillage",
  Motion: "Mouvement",
  "Motion Presets & Shake": "Préréglages de mouvement et secousses",
  "Move speed": "Vitesse de déplacement",
  "Navigation & Selection": "Navigation et sélection",
  "Navigation profile": "Profil de navigation",
  "Near Clip": "Plan rapproché",
  Neutral: "Neutre",
  "New key interpolation": "Interpolation des nouvelles clés",
  "Next Frame (Right Arrow)": "Image suivante (flèche droite)",
  "Next Keyframe (. / Down Arrow)": "Clé suivante (. / flèche bas)",
  "Next frame": "Image suivante",
  "Next keyframe": "Clé suivante",
  "No Snap": "Sans magnétisme",
  "Not saved to the ComfyUI input folder: this model will be missing after a reload.": "Non enregistré dans le dossier input de ComfyUI : ce modèle sera absent après un rechargement.",
  "No parent": "Sans parent",
  "No upstream reference": "Aucune référence en amont",
  "None (0)": "Aucun (0)",
  Null: "Null",
  "Null Locator": "Locator null",
  "OTS Frame": "Cadre amorce (OTS)",
  "Object (4)": "Objet (4)",
  "Object Color": "Couleur de l'objet",
  "Object Selection Mode (4)": "Mode sélection d'objets (4)",
  "Object Transform": "Transform de l'objet",
  "Object name": "Nom de l'objet",
  "Objects & Primitives": "Objets et primitives",
  "Omni Ref": "Omni Ref",
  "OmniCam Help": "Aide OmniCam",
  "Open or close the animation curve editor": "Ouvrir ou fermer l'éditeur de courbes d'animation",
  "Orbit 360°": "Orbite 360°",
  "Orbit: MMB · Pan: Shift+MMB · Dolly: Scroll · Fly: WASD / QE": "Orbite : clic milieu · Panoramique : Maj+clic milieu · Travelling : molette · Vol : WASD / QE",
  Orthographic: "Orthographique",
  Outliner: "Outliner",
  Output: "Sortie",
  "Output & diagnostics": "Sortie et diagnostics",
  "Over the shoulder frame": "Cadre par-dessus l'épaule",
  Parallax: "Parallaxe",
  Parent: "Parent",
  "Parent object": "Objet parent",
  "Path key moved": "Clé de trajectoire déplacée",
  "Paste Keyframe at Playhead (Ctrl+V)": "Coller la clé à la tête de lecture (Ctrl+V)",
  "Path Smoothing": "Lissage de trajectoire",
  "Path smoothing cleared": "Lissage de trajectoire annulé",
  "Path smoothing set to {percent}%": "Lissage de trajectoire réglé à {percent} %",
  Perspective: "Perspective",
  "Perspective depth colonnade": "Colonnade en profondeur perspective",
  "Play / Stop (Space)": "Lecture / Arrêt (Espace)",
  "Play timeline": "Lire la timeline",
  "Playback Transport": "Transport de lecture",
  Playblast: "Playblast",
  "Playblast: sequence ({count} shots)": "Playblast : séquence ({count} plans)",
  "No audio track. Load one to cut to the beat.": "Aucune piste audio. Chargez-en une pour caler les coupes sur le rythme.",
  "No shots yet. Auto-split hands each camera a slice of the timeline.": "Aucun plan. Le découpage automatique attribue à chaque caméra une portion de la timeline.",
  "Playblast Resolution": "Résolution du playblast",
  "Playblast camera": "Caméra de playblast",
  "½ x node output": "½ x sortie du nœud",
  "2x node output (sharp)": "2x sortie du nœud (net)",
  "Match node output": "Résolution de sortie du nœud",
  "One camera key per frame, so an exported track matches the viewport exactly": "Une clé caméra par image, pour qu'une trajectoire exportée corresponde exactement au viewport",
  "Viewport (fast)": "Viewport (rapide)",
  "Resolution of the recorded playblast video": "Résolution de la vidéo de playblast enregistrée",
  "Point Field": "Nuage de points",
  "Point color": "Couleur des points",
  "Point density": "Densité de points",
  "Point spread": "Répartition des points",
  Position: "Position",
  "Position XYZ": "Position XYZ",
  "Preview maximized": "Aperçu agrandi",
  "Preview restored": "Aperçu restauré",
  Previews: "Aperçus",
  "Previous Frame (Left Arrow)": "Image précédente (flèche gauche)",
  "Previous Keyframe (, / Up Arrow)": "Clé précédente (, / flèche haut)",
  "Previous frame": "Image précédente",
  "Previous keyframe": "Clé précédente",
  "Product pedestal 360 orbit": "Orbite 360 sur socle produit",
  Projection: "Projection",
  "Projection & Clipping": "Projection et plans de coupe",
  "Proxy Reference": "Référence proxy",
  "Proxy mode": "Mode proxy",
  "Pull Out": "Recul",
  "Push In": "Avancée",
  "Push-in through doorway opening": "Avancée à travers l'ouverture d'une porte",
  Quad: "Quatre vues",
  "Range & Duration": "Plage et durée",
  Ready: "Prêt",
  "Realtime fallback": "Repli temps réel",
  "Record proxy playblast": "Enregistrer le playblast proxy",
  "Rename camera": "Renommer la caméra",
  "Rename object": "Renommer l'objet",
  "Remove every shot and stop cutting the timeline": "Supprimer tous les plans et cesser de découper la timeline",
  "Replace audio": "Remplacer l'audio",
  "Remove shot": "Supprimer le plan",
  "Reset BG Color": "Réinitialiser la couleur de fond",
  "Reset Cam": "Réinit. caméra",
  "Reset Camera": "Réinitialiser la caméra",
  "Reset active camera": "Réinitialiser la caméra active",
  "Restore the studio sky": "Restaurer le ciel studio",
  "Resolution Gate": "Cadre de résolution",
  "Right Side": "Côté droit",
  Roll: "Roll",
  Rotation: "Rotation",
  "Rotation XYZ": "Rotation XYZ",
  "Rotation gizmo (click)": "Gizmo de rotation (clic)",
  "Rule of Thirds": "Règle des tiers",
  "Safe Areas (90%/80%)": "Zones de sécurité (90 %/80 %)",
  Scale: "Échelle",
  "Scale XYZ": "Échelle XYZ",
  "Scale gizmo (click)": "Gizmo d'échelle (clic)",
  "Scene Display": "Affichage de la scène",
  "Scrub the timeline": "Scruber la timeline",
  Search: "Rechercher",
  Sequence: "Séquence",
  "Sequence ({count} shots)": "Séquence ({count} plans)",
  "Sequence (no shots yet)": "Séquence (aucun plan)",
  Shot: "Plan",
  "Split at playhead": "Découper à la tête de lecture",
  "Split into {count} shots": "Découpé en {count} plans",
  "Split the timeline evenly across every camera": "Répartir la timeline également entre toutes les caméras",
  "Select Object Tool (Q)": "Outil de sélection d'objet (Q)",
  "Select camera Look-At target": "Sélectionner la cible de visée de la caméra",
  "Select a keyframe first": "Sélectionnez d'abord une clé",
  "Select a keyframe to delete": "Sélectionnez une clé à supprimer",
  "Select mode": "Mode de sélection",
  "Set In Point at Playhead ([)": "Définir le point d'entrée à la tête de lecture ([)",
  "Set Out Point at Playhead (])": "Définir le point de sortie à la tête de lecture (])",
  "Set Subject Card": "Définir la carte sujet",
  "Setup docs": "Documentation d'installation",
  Shot: "Plan",
  "Show only {channel}": "Afficher uniquement {channel}",
  "Dope Sheet": "Feuille d'exposition",
  "Drag to scrub the timeline": "Glissez pour parcourir la timeline",
  "Edit animation curves": "Modifier les courbes d'animation",
  "Per-channel keyframe sheet": "Feuille de clés par canal",
  "Camera (Position, Focal, Roll)": "Caméra (Position, Focale, Roulis)",
  "Hold / Step": "Maintien / Palier",
  "Available in Camera View only": "Disponible uniquement en vue caméra",
  "Mask the viewport down to the node's output width x height": "Masque le viewport à la largeur x hauteur de sortie du node",
  "Auto (node output)": "Auto (sortie du node)",
  "Show all curves in group": "Afficher toutes les courbes du groupe",
  "Show or hide Bézier tangent handles": "Afficher ou masquer les poignées de tangente Bézier",
  "Showing all channels": "Tous les canaux affichés",
  "Side by side": "Côte à côte",
  Single: "Vue unique",
  Smooth: "Smooth",
  "Smooth interpolation after the selected key": "Interpolation lissée après la clé sélectionnée",
  Snap: "Magnétisme",
  Snapping: "Magnétisme",
  "Sparse (300)": "Clairsemé (300)",
  "Spatial grid size": "Pas de la grille spatiale",
  "Spatial snapping": "Magnétisme spatial",
  "Speed Map": "Carte de vitesse",
  Sphere: "Sphère",
  "Spherical Dome": "Dôme sphérique",
  "Straight interpolation after the selected key": "Interpolation droite après la clé sélectionnée",
  Stretch: "Étirer",
  "Studio quality lowered to {level} to keep the viewport responsive": "Qualité studio abaissée à {level} pour garder le viewport fluide",
  Subject: "Sujet",
  Subtle: "Subtil",
  "Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first.": "Scènes prises en charge : GLB, OBJ, FBX, STL, PLY. Convertissez l'ABC au préalable.",
  "Switch Active Camera": "Changer de caméra active",
  "Sync Upstream Inputs": "Synchroniser les entrées amont",
  "Tabletop 360° Orbit": "Orbite 360° de table",
  Tangents: "Tangentes",
  "Target XYZ": "Cible XYZ",
  Targeting: "Visée",
  Textures: "Textures",
  "The proxy communicates camera motion, not final appearance. Use H3 Setup for Omni Reference, Wan Native Camera for core Plücker conditioning, or the pinned ATI/LTX adapters for their supported workflows.": "Le proxy transmet le mouvement de caméra, pas l'aspect final. Utilisez Configuration H3 pour l'Omni Reference, Wan Native Camera pour le conditionnement Plücker natif, ou les adaptateurs ATI/LTX épinglés pour leurs workflows pris en charge.",
  "The subject card cannot be deleted": "La carte sujet ne peut pas être supprimée",
  "Timeline options": "Options de timeline",
  "Timeline view fitted": "Vue de la timeline ajustée",
  "Toggle Auto Key": "Activer/désactiver l'Auto Key",
  "Toggle Camera Previews Strip": "Afficher/masquer la bande d'aperçus caméra",
  "Toggle Fullscreen Viewport": "Basculer le viewport en plein écran",
  "Toggle Inspector Panel (N)": "Afficher/masquer le panneau Inspecteur (N)",
  "Toggle Loop Playback": "Activer/désactiver la lecture en boucle",
  "Toggle Snapping": "Activer/désactiver le magnétisme",
  "Top View": "Vue de dessus",
  "Use {name}": "Utiliser {name}",
  "Track / Follow Moving Target Object": "Suivre un objet cible en mouvement",
  "Whole object": "Objet entier",
  missing: "manquant",
  "Track:": "Piste :",
  Transform: "Transform",
  "Transform space": "Espace de transformation",
  "Translation gizmo (click)": "Gizmo de translation (clic)",
  "Turbulence Shake": "Secousse de turbulence",
  "Ultra (3500)": "Ultra (3500)",
  "Update key from current 3D view": "Mettre à jour la clé depuis la vue 3D courante",
  "Uploading card…": "Envoi de la carte…",
  "Uploading {format}…": "Envoi du {format}…",
  "Upstream 1": "Amont 1",
  "Upstream 3D scene disconnected · model removed": "Scène 3D amont déconnectée · modèle retiré",
  "Upstream Sync & Imports": "Synchronisation amont et imports",
  "Upstream audio disconnected · audio track cleared": "Audio amont déconnecté · piste audio effacée",
  "Upstream image disconnected · card reset": "Image amont déconnectée · carte réinitialisée",
  "Upstream image preview synced": "Aperçu de l'image amont synchronisé",
  "Upstream video preview synced": "Aperçu de la vidéo amont synchronisé",
  "Upstream media refreshed": "Média amont actualisé",
  "Upstream reference": "Référence amont",
  Vector: "Vecteur",
  Vertex: "Sommet",
  "Vertex (1)": "Sommet (1)",
  "Vertex Selection Mode (1)": "Mode sélection de sommets (1)",
  View: "Vue",
  "View mode: Camera (Numpad 0), Front/Back (1), Top/Bottom (7), Right/Left (3)": "Mode de vue : Caméra (Pavé num. 0), Face/Arrière (1), Dessus/Dessous (7), Droite/Gauche (3)",
  Viewport: "Viewport",
  "{name} · F{start}-{end}": "{name} · F{start}-{end}",
  "{count} shots · drag a divider to trim · right-click a shot for its camera": "{count} plans · glissez un séparateur pour ajuster · clic droit sur un plan pour sa caméra",
  "Viewport material": "Matériau du viewport",
  "Viewport maximized": "Viewport agrandi",
  "Viewport restored": "Viewport restauré",
  "Viewport tools": "Outils du viewport",
  "Viewport zoom": "Zoom du viewport",
  WebCodecs: "WebCodecs",
  "WebCodecs unavailable; recording realtime fallback…": "WebCodecs indisponible ; enregistrement en repli temps réel…",
  Wireframe: "Filaire",
  "Wireframe / Edges": "Filaire / arêtes",
  World: "Monde",
  "World Point": "Point monde",
  Zoom: "Zoom",
  "Zoom in curve editor (Mouse wheel)": "Zoomer dans l'éditeur de courbes (molette)",
  "Zoom out curve editor": "Dézoomer dans l'éditeur de courbes",
  "{channel} changes at frame {frame}": "{channel} change à l'image {frame}",
  "{count} optional adapter issues": "{count} problèmes d’adaptateurs optionnels",
  "{format} imported: {name}": "{format} importé : {name}",
  "{format} shown locally, but the upload failed — it will not survive a reload.": "{format} affiché en local, mais l'envoi a échoué — il ne survivra pas à un rechargement.",
  "Read by": "Lu par",
  "Exporting camera…": "Export de la caméra…",
  "Camera exported to {path}": "Caméra exportée vers {path}",
  "Camera export failed: {error}": "Échec de l'export caméra : {error}",
  "Reading camera from {name}…": "Lecture de la caméra depuis {name}…",
  "Camera import failed: {error}": "Échec de l'import caméra : {error}",
  "this FBX contains no camera": "ce FBX ne contient aucune caméra",
  "OmniCam Extractor": "OmniCam Extractor",
  "no camera keys in this file": "aucune clé de caméra dans ce fichier",
  "no camera keys in this solve": "aucune clé de caméra dans ce solve",
  "Imported {count} camera keys from {name}": "{count} clés de caméra importées depuis {name}",
  "{count} camera keys ready from {name} — import as a new camera?": "{count} clés de caméra prêtes depuis {name} — importer comme nouvelle caméra ?",
  "Import as Camera": "Importer comme caméra",
  Dismiss: "Ignorer",
  "Extracted camera preview dismissed": "Aperçu de la caméra extraite ignoré",
  "Camera Interchange": "Échange de caméra",
  "Import Camera…": "Importer une caméra…",
  "glTF, GLB, FBX, .chan or an OmniCam JSON track.": "glTF, GLB, FBX, .chan ou une trajectoire JSON OmniCam.",
  "Export format": "Format d'export",
  "Export Camera": "Exporter la caméra",
  // Camera Health
  Health: "Santé",
  "Camera Health": "Santé caméra",
  Checking: "Analyse…",
  "Target model": "Modèle cible",
  "Grade the shot against this model's recommended limits": "Évaluer le plan selon les limites recommandées de ce modèle",
  "Travel speed": "Vitesse de déplacement",
  "Rotation speed": "Vitesse de rotation",
  Acceleration: "Accélération",
  Jerk: "À-coup",
  "Subject out of frame": "Sujet hors cadre",
  "FOV change": "Variation de FOV",
  "Within limits": "Dans les limites",
  "Near the limit": "Proche de la limite",
  "Over the limit": "Au-delà de la limite",
  "no limit": "aucune limite",
  "Problem zones": "Zones problématiques",
  "No problem zone on this shot.": "Aucune zone problématique sur ce plan.",
  "Frame {frame}": "Image {frame}",
  "Frames {start}-{end}": "Images {start}-{end}",
  "Jump the playhead to this zone": "Amener la tête de lecture sur cette zone",
  "{count} frames": "{count} images",
  Unavailable: "Indisponible",
  "Could not load the recommended limits from the OmniCam server. The panel will not guess a threshold.": "Impossible de charger les limites recommandées depuis le serveur OmniCam. Le panneau ne devinera pas de seuil.",
  "Slow to limits": "Ralentir aux limites",
  "Respace the keys so the shot travels at a constant speed": "Réespacer les clés pour que le plan se déplace à vitesse constante",
  "Smooth flagged": "Lisser les zones signalées",
  "Blend the keys inside the flagged zones only": "Mélanger uniquement les clés des zones signalées",
  "Recenter subject": "Recentrer le sujet",
  "Aim the keys of the flagged zones back at the subject": "Réorienter les clés des zones signalées vers le sujet",
  "A valid trajectory stays inside the limits recommended for this model. It is not a guarantee about the generated video.": "Une trajectoire valide reste dans les limites recommandées pour ce modèle. Ce n'est pas une garantie sur la vidéo générée.",
  "This profile sets no speed limit.": "Ce profil ne définit aucune limite de vitesse.",
  "Speed flattened; the shot keeps its length.": "Vitesse aplanie ; le plan conserve sa durée.",
  "Speed flattened, still over: this path needs about {seconds}s to fit the limit.": "Vitesse aplanie, toujours au-delà : ce trajet demande environ {seconds}s pour tenir dans la limite.",
  "Nothing is flagged on this shot.": "Rien n'est signalé sur ce plan.",
  "Smoothed {count} flagged zone(s).": "{count} zone(s) signalée(s) lissée(s).",
  "The subject stays in frame on this shot.": "Le sujet reste dans le cadre sur ce plan.",
  "Recentred {count} zone(s) on the subject.": "{count} zone(s) recentrée(s) sur le sujet.",
  "Frame selection": "Cadrer la s?lection",
  "Quick viewport views": "Vues rapides de l'espace de travail",
  "Perspective View": "Vue en perspective",
  Front: "Face",
  "Right View": "Vue de droite",
  Right: "Droite",
  Top: "Dessus",
  "Isometric View": "Vue isom?trique",
  ISO: "ISO",
  "More viewport views": "Plus de vues",
  "World axis navigation": "Navigation des axes monde",
  "View: {axis} axis": "Vue : axe {axis}"
}, W = ["OmniCam", "Director"], Pt = "MajoorOmniCam.Locale", zt = "MajoorOmniCam.Defaults.Fps", Nt = "MajoorOmniCam.Defaults.DurationSeconds", Rt = "MajoorOmniCam.Defaults.Width", Ft = "MajoorOmniCam.Defaults.Height", Lt = "MajoorOmniCam.Defaults.RenderMode", Kt = "MajoorOmniCam.Defaults.Encoder", Vt = "MajoorOmniCam.Defaults.PlayblastResolution", Gt = "MajoorOmniCam.Defaults.PlayblastGrid", Bt = "MajoorOmniCam.Proxy.PointDensity", qt = "MajoorOmniCam.Proxy.PointSpread", Ht = "MajoorOmniCam.Proxy.PointColor", Wt = "MajoorOmniCam.Proxy.CardFit", $t = "MajoorOmniCam.Viewport.Quality", Ut = "MajoorOmniCam.Viewport.Adaptive", Xt = "MajoorOmniCam.Viewport.BackgroundColor", Yt = "MajoorOmniCam.Display.Grid", Zt = "MajoorOmniCam.Display.Radar", Qt = "MajoorOmniCam.Display.CameraPaths", Jt = "MajoorOmniCam.Display.CameraGizmos", ea = "MajoorOmniCam.Display.LookAt", ta = "MajoorOmniCam.Display.HelperAxes", aa = "MajoorOmniCam.Display.Gizmo", oa = "MajoorOmniCam.Display.Guides", ra = "MajoorOmniCam.Display.SafeAreas", na = "MajoorOmniCam.Display.ResolutionGate", sa = "MajoorOmniCam.Display.AspectRatio", ia = "MajoorOmniCam.Display.BurnIn", ca = "MajoorOmniCam.Display.SpeedHeatmap", la = "MajoorOmniCam.Display.Wireframe", ma = "MajoorOmniCam.Display.Vertices", da = "MajoorOmniCam.Tools.SelectMode", pa = "MajoorOmniCam.Tools.GizmoMode", fa = "MajoorOmniCam.Tools.GizmoSpace", ua = "MajoorOmniCam.Tools.SpatialSnapMode", ha = "MajoorOmniCam.Tools.SpatialGridSize", ga = "MajoorOmniCam.Navigation.Profile", ya = "MajoorOmniCam.Navigation.FlySpeed", ba = "MajoorOmniCam.Navigation.ViewMode", _a = "MajoorOmniCam.Timeline.SnapEnabled", va = "MajoorOmniCam.Timeline.SnapFrames", wa = "MajoorOmniCam.Timeline.AutoKey", Sa = "MajoorOmniCam.Timeline.TimecodeMode", Ma = "MajoorOmniCam.Timeline.LoopPlayback", xa = "MajoorOmniCam.Interface.Density", Ca = "MajoorOmniCam.Interface.PreviewLayout", Da = "MajoorOmniCam.Interface.CameraPreviews", ja = "MajoorOmniCam.History.Limit";
function E(e, t, a, o, r) {
  return { id: e, category: [...W, t], name: a, tooltip: o, type: "boolean", defaultValue: r };
}
function P(e, t, a, o, r, n) {
  return { id: e, category: [...W, t], name: a, tooltip: o, type: "combo", options: r, defaultValue: n };
}
function B(e, t, a, o, r, n) {
  return { id: e, category: [...W, t], name: a, tooltip: o, type: "slider", attrs: r, defaultValue: n };
}
function Ko({ onLocaleChange: e, onQualityChange: t } = {}) {
  return [
    {
      id: Pt,
      category: [...W, "Language"],
      name: "Viewport language",
      tooltip: "Language of the OmniCam Director viewport. 'Follow ComfyUI' uses the ComfyUI locale.",
      type: "combo",
      options: [
        { text: "Follow ComfyUI", value: "auto" },
        { text: "English", value: "en" },
        { text: "Français", value: "fr" }
      ],
      defaultValue: "auto",
      onChange: () => e?.()
    },
    B(
      zt,
      "Defaults",
      "Default FPS",
      "Frame rate applied to newly created Director nodes.",
      { min: 1, max: 120, step: 1 },
      24
    ),
    B(
      Nt,
      "Defaults",
      "Default duration (seconds)",
      "Timeline duration applied to newly created Director nodes.",
      { min: 1, max: 120, step: 1 },
      5
    ),
    B(
      Rt,
      "Defaults",
      "Default width",
      "Output width applied to newly created Director nodes.",
      { min: 64, max: 4096, step: 16 },
      1280
    ),
    B(
      Ft,
      "Defaults",
      "Default height",
      "Output height applied to newly created Director nodes.",
      { min: 64, max: 4096, step: 16 },
      720
    ),
    P(
      Lt,
      "Defaults",
      "Default proxy render mode",
      "Render mode applied to newly created Director nodes.",
      ["omni_ref", "graybox", "grid", "point_field", "wireframe", "card_grid", "beauty"],
      "omni_ref"
    ),
    P(
      Kt,
      "Defaults",
      "Default playblast encoder",
      "WebCodecs is deterministic; realtime is the MediaRecorder fallback.",
      [
        { text: "WebCodecs (deterministic)", value: "auto" },
        { text: "Realtime fallback", value: "realtime" }
      ],
      "auto"
    ),
    P(
      Vt,
      "Defaults",
      "Default playblast resolution",
      "Drawing-buffer size of the recorded playblast. 'Match node output' locks it to the node's width x height.",
      [
        { text: "Viewport (fast)", value: "viewport" },
        { text: "Half of node output", value: "half" },
        { text: "Match node output", value: "output" },
        { text: "2x node output (sharp)", value: "double" }
      ],
      "viewport"
    ),
    E(
      Gt,
      "Defaults",
      "Keep the grid in the playblast",
      "Records the floor grid into the playblast instead of hiding it for the capture.",
      !1
    ),
    P(
      Bt,
      "Proxy",
      "Default point density",
      "Point count of the omni-reference point field.",
      ["none", "sparse", "balanced", "dense", "ultra"],
      "balanced"
    ),
    P(
      qt,
      "Proxy",
      "Default point spread",
      "How the reference points are distributed around the scene.",
      [
        { text: "All views (full 3D)", value: "all_views" },
        { text: "Ground + low angle", value: "ground_focus" },
        { text: "Spherical dome", value: "dome" }
      ],
      "all_views"
    ),
    {
      id: Ht,
      category: [...W, "Proxy"],
      name: "Default point colour",
      tooltip: "Colour of the reference point field.",
      type: "color",
      defaultValue: "cbd5e1"
    },
    P(
      Wt,
      "Proxy",
      "Default card fit",
      "How media is fitted inside a subject card.",
      [
        { text: "Fit (contain)", value: "contain" },
        { text: "Fill (cover)", value: "cover" },
        { text: "Stretch", value: "stretch" }
      ],
      "contain"
    ),
    {
      id: $t,
      category: [...W, "Viewport"],
      name: "Studio quality",
      tooltip: "Image-based lighting and soft shadows in the editing viewport. Lower it on a modest GPU.",
      type: "combo",
      options: [
        { text: "Low (no shadows)", value: "low" },
        { text: "Balanced", value: "balanced" },
        { text: "High (2048px shadows)", value: "high" }
      ],
      defaultValue: "balanced",
      onChange: (a) => t?.(a)
    },
    E(
      Ut,
      "Viewport",
      "Drop quality when the viewport stutters",
      "Steps the studio quality down automatically if navigation falls below ~40fps, and leaves it there for the session.",
      !0
    ),
    {
      id: Xt,
      category: [...W, "Viewport"],
      name: "Default background colour",
      tooltip: "Viewport background. Leave it at the default to keep the studio sky.",
      type: "color",
      defaultValue: "121212"
    },
    E(
      Yt,
      "Display",
      "Show grid by default",
      "Shows the viewport floor grid on newly created Director nodes.",
      !0
    ),
    E(
      Zt,
      "Display",
      "Show camera mini-map by default",
      "Shows the radar mini-map on newly created Director nodes.",
      !1
    ),
    E(
      Qt,
      "Display",
      "Show camera paths by default",
      "Shows camera trajectories on newly created Director nodes.",
      !0
    ),
    E(
      Jt,
      "Display",
      "Show camera gizmos by default",
      "Shows camera bodies and frustums on newly created Director nodes.",
      !0
    ),
    E(
      ea,
      "Display",
      "Show look-at targets by default",
      "Shows camera look-at lines and target crosshairs on newly created Director nodes.",
      !0
    ),
    E(
      ta,
      "Display",
      "Show helper axes by default",
      "Shows null-object axis helpers on newly created Director nodes.",
      !0
    ),
    E(
      aa,
      "Display",
      "Show transform gizmo by default",
      "Shows transform and axis gizmos on newly created Director nodes.",
      !0
    ),
    E(
      oa,
      "Display",
      "Show rule-of-thirds guides by default",
      "Shows the rule-of-thirds grid and centre crosshair in camera view.",
      !0
    ),
    E(
      ra,
      "Display",
      "Show safe areas by default",
      "Shows the 90% action-safe and 80% title-safe rectangles.",
      !1
    ),
    E(
      na,
      "Display",
      "Show resolution gate by default",
      "Masks the viewport down to the node's output width x height.",
      !1
    ),
    P(
      sa,
      "Display",
      "Default aspect ratio",
      "Framing ratio used by the resolution gate. 'Auto' follows the node output.",
      ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"],
      "auto"
    ),
    E(
      ia,
      "Display",
      "Show burn-in data by default",
      "Overlays frame, fps, FOV and render mode along the bottom of the viewport.",
      !1
    ),
    E(
      ca,
      "Display",
      "Show speed map by default",
      "Colours the camera path by travel speed.",
      !1
    ),
    E(
      la,
      "Display",
      "Show wireframe by default",
      "Draws mesh edges over scene objects. Skinned models follow their animation.",
      !1
    ),
    E(
      ma,
      "Display",
      "Show mesh vertices by default",
      "Draws mesh vertices as points over scene objects.",
      !1
    ),
    P(
      da,
      "Tools",
      "Default selection mode",
      "Component level the viewport selects at.",
      ["object", "vertex", "edge", "face"],
      "object"
    ),
    P(
      pa,
      "Tools",
      "Default transform mode",
      "Transform the gizmo starts in.",
      ["translate", "rotate", "scale"],
      "translate"
    ),
    P(
      fa,
      "Tools",
      "Default gizmo space",
      "World-aligned axes, or the selected object's own orientation.",
      ["world", "local"],
      "world"
    ),
    P(
      ua,
      "Tools",
      "Default spatial snapping",
      "Snap dragged transforms to a grid increment or to nearby vertices.",
      [
        { text: "Off", value: "none" },
        { text: "Grid", value: "grid" },
        { text: "Vertex", value: "vertex" }
      ],
      "none"
    ),
    B(
      ha,
      "Tools",
      "Default snap grid size",
      "Grid increment used by spatial grid snapping, in scene units.",
      { min: 0.01, max: 10, step: 0.01 },
      0.5
    ),
    P(
      ga,
      "Navigation",
      "Default navigation profile",
      "Viewport navigation profile applied to newly created Director nodes.",
      [
        { text: "Maya", value: "maya" },
        { text: "Blender", value: "blender" }
      ],
      "maya"
    ),
    B(
      ya,
      "Navigation",
      "Default fly speed",
      "WASD / QE fly speed applied to newly created Director nodes.",
      { min: 0.05, max: 5, step: 0.05 },
      1
    ),
    P(
      ba,
      "Navigation",
      "Default view",
      "View a newly created Director node opens in.",
      ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"],
      "camera"
    ),
    E(
      _a,
      "Timeline",
      "Enable timeline snapping by default",
      "Snaps dragged keyframes to the frame increment below.",
      !0
    ),
    B(
      va,
      "Timeline",
      "Default timeline snap",
      "Frame increment used by timeline snapping on newly created Director nodes.",
      { min: 1, max: 24, step: 1 },
      1
    ),
    E(
      wa,
      "Timeline",
      "Enable Auto Key by default",
      "Enables Auto Key on newly created Director nodes.",
      !1
    ),
    P(
      Sa,
      "Timeline",
      "Default time display",
      "Elapsed time, or HH:MM:SS:FF timecode.",
      [
        { text: "Time (mm:ss.ms)", value: "time" },
        { text: "Timecode (hh:mm:ss:ff)", value: "timecode" }
      ],
      "time"
    ),
    E(
      Ma,
      "Timeline",
      "Loop playback by default",
      "Restarts playback at the first frame instead of stopping at the last.",
      !1
    ),
    P(
      xa,
      "Interface",
      "Default interface density",
      "How much of the editor chrome is shown.",
      [
        { text: "Basic", value: "basic" },
        { text: "Animation", value: "animation" },
        { text: "Advanced", value: "advanced" }
      ],
      "advanced"
    ),
    P(
      Ca,
      "Interface",
      "Default camera preview layout",
      "How the camera preview tiles are arranged.",
      [
        { text: "Auto strip", value: "auto" },
        { text: "Single", value: "1" },
        { text: "Side by side", value: "2" },
        { text: "Quad", value: "4" }
      ],
      "auto"
    ),
    E(
      Da,
      "Interface",
      "Show camera previews by default",
      "Opens newly created Director nodes with the camera preview strip visible.",
      !0
    ),
    B(
      ja,
      "History",
      "Undo history limit",
      "Maximum number of Undo steps held by each Director editor.",
      { min: 10, max: 500, step: 10 },
      100
    )
  ];
}
const Vo = Ko({
  onLocaleChange: () => Ta(),
  onQualityChange: (e) => Wo(e)
});
let ka = null;
function K(e, t) {
  try {
    const a = ka?.extensionManager?.setting?.get(e);
    return a ?? t;
  } catch {
    return t;
  }
}
function q(e, t, a, o, r = !1) {
  const n = Number(K(e, t)), s = Number.isFinite(n) ? Math.min(o, Math.max(a, n)) : t;
  return r ? Math.round(s) : s;
}
function A(e, t) {
  const a = K(e, t);
  return typeof a == "boolean" ? a : t;
}
function z(e, t, a) {
  const o = String(K(e, t));
  return a.includes(o) ? o : t;
}
function ht(e, t) {
  const a = String(K(e, t) || "").trim(), o = a.startsWith("#") ? a.slice(1) : a;
  return /^[0-9a-fA-F]{6}$/.test(o) ? `#${o.toLowerCase()}` : t;
}
function Ta() {
  const e = String(K(Pt, "auto")), t = String(K("Comfy.Locale", "en") || "en").slice(0, 2).toLowerCase();
  $a(e === "auto" ? t : e);
}
const he = /* @__PURE__ */ new Set();
function Go(e) {
  he.add(e);
}
function un(e) {
  he.delete(e);
}
function Bo() {
  for (const e of he)
    if (!e.disposed) return !0;
  return !1;
}
function qo(e) {
  if (!(e instanceof Node)) return null;
  for (const t of he)
    if (!t.disposed && t.root?.contains(e)) return t;
  return null;
}
function Ea() {
  return String(K($t, "balanced"));
}
function Ho() {
  return K(Ut, !0) !== !1;
}
function Wo(e = Ea()) {
  for (const t of he)
    t.webgl?.setViewportQuality?.(e), t.cameraWebgl?.setViewportQuality?.(e), t.invalidate?.();
}
function $o() {
  return {
    fps: q(zt, 24, 1, 120, !0),
    durationSeconds: q(Nt, 5, 1, 120, !0),
    width: q(Rt, 1280, 64, 4096, !0),
    height: q(Ft, 720, 64, 4096, !0),
    renderMode: String(K(Lt, "omni_ref")),
    encoder: String(K(Kt, "auto")),
    playblastResolution: z(Vt, "output", ["viewport", "half", "output", "double"]),
    playblastGrid: A(Gt, !1),
    pointDensity: z(Bt, "balanced", ["none", "sparse", "balanced", "dense", "ultra"]),
    pointSpread: z(qt, "all_views", ["all_views", "ground_focus", "dome"]),
    pointColor: ht(Ht, "#cbd5e1"),
    cardFit: z(Wt, "contain", ["contain", "cover", "stretch"]),
    backgroundColor: ht(Xt, "#121212"),
    showGrid: A(Yt, !0),
    showRadar: A(Zt, !1),
    showCameraPaths: A(Qt, !0),
    showCameraGizmos: A(Jt, !0),
    showLookAt: A(ea, !0),
    showHelperAxes: A(ta, !0),
    showGizmo: A(aa, !0),
    guides: A(oa, !0),
    safeAreas: A(ra, !1),
    resolutionGate: A(na, !1),
    aspectRatio: z(sa, "auto", ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"]),
    burnIn: A(ia, !1),
    speedHeatmap: A(ca, !1),
    showWireframe: A(la, !1),
    showVertices: A(ma, !1),
    selectMode: z(da, "object", ["object", "vertex", "edge", "face"]),
    gizmoMode: z(pa, "translate", ["translate", "rotate", "scale"]),
    gizmoSpace: z(fa, "world", ["world", "local"]),
    spatialSnapMode: z(ua, "none", ["none", "grid", "vertex"]),
    spatialGridSize: q(ha, 0.5, 0.01, 100),
    navigationProfile: z(ga, "maya", ["maya", "blender"]),
    flySpeed: q(ya, 1, 0.05, 5),
    viewMode: z(ba, "camera", ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"]),
    snapEnabled: A(_a, !0),
    snapFrames: q(va, 1, 1, 24, !0),
    autoKey: A(wa, !1),
    timecodeMode: z(Sa, "time", ["time", "timecode"]),
    loopPlayback: A(Ma, !1),
    uiDensity: z(xa, "advanced", ["basic", "animation", "advanced"]),
    previewLayout: z(Ca, "auto", ["auto", "1", "2", "4"]),
    cameraViewVisible: A(Da, !0),
    undoLimit: q(ja, 100, 10, 500, !0)
  };
}
function Uo(e) {
  ka = e, Wa("fr", Lo), Ta();
}
function Xo(e) {
  const t = Ea(), a = Ho();
  for (const o of [e.webgl, e.cameraWebgl])
    o && (o.adaptiveQuality = a, o.onQualityDowngrade = (r) => e.setStatus?.(
      _("Studio quality lowered to {level} to keep the viewport responsive").replace("{level}", r)
    ), o.setViewportQuality?.(t));
}
function Yo(e) {
  Go(e), Xo(e);
}
function Zo(e) {
  const t = $o();
  e.fpsWidget && (e.fpsWidget.value = t.fps), e.durationWidget && (e.durationWidget.value = t.durationSeconds), e.widthWidget && (e.widthWidget.value = t.width), e.heightWidget && (e.heightWidget.value = t.height), e.modeWidget && (e.modeWidget.value = t.renderMode);
  const a = e.root?.querySelector('[data-role="encoder"]');
  a && (a.value = t.encoder), e.cameraSpeed = t.flySpeed, e.history && (e.history.limit = t.undoLimit), Object.assign(e.state, {
    playblast_resolution: t.playblastResolution,
    playblast_grid: t.playblastGrid,
    point_density: t.pointDensity,
    point_spread: t.pointSpread,
    point_color: t.pointColor,
    card_fit: t.cardFit,
    viewport_bg_color: t.backgroundColor,
    show_grid: t.showGrid,
    show_radar: t.showRadar,
    show_camera_paths: t.showCameraPaths,
    show_camera_gizmos: t.showCameraGizmos,
    show_look_at: t.showLookAt,
    show_helper_axes: t.showHelperAxes,
    show_gizmo: t.showGizmo,
    guides: t.guides,
    safe_areas: t.safeAreas,
    resolution_gate: t.resolutionGate,
    aspect_ratio: t.aspectRatio,
    burn_in: t.burnIn,
    speed_heatmap: t.speedHeatmap,
    show_wireframe: t.showWireframe,
    show_vertices: t.showVertices,
    select_mode: t.selectMode,
    gizmo_mode: t.gizmoMode,
    gizmo_space: t.gizmoSpace,
    spatial_snap_mode: t.spatialSnapMode,
    spatial_grid_size: t.spatialGridSize,
    navigation_profile: t.navigationProfile,
    view_mode: t.viewMode,
    snap_enabled: t.snapEnabled,
    snap_frames: t.snapFrames,
    auto_key: t.autoKey,
    timecode_mode: t.timecodeMode,
    loop_playback: t.loopPlayback,
    ui_density: t.uiDensity,
    preview_layout: t.previewLayout,
    camera_view_visible: t.cameraViewVisible
  }), e.syncFromWidgets?.();
}
function Qo(e, t) {
  return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function Jo(e, t, a, o, r) {
  const { right: n, up: s, forward: i } = L(t), l = t.position, m = [a[0] - l[0], a[1] - l[1], a[2] - l[2]], c = Qo(m, i);
  let p, d;
  if (t.camera_type === "orthographic") {
    const u = 5 / Math.max(0.01, t.zoom || 1), h = u * o / Math.max(1, r);
    p = (e[0] / Math.max(1, o) - 0.5) * 2 * h, d = (0.5 - e[1] / Math.max(1, r)) * 2 * u;
  } else {
    const u = 0.5 * r / Math.tan(Math.max(1e-3, t.fov) * Math.PI / 360);
    p = (e[0] - o / 2) * c / u, d = (r / 2 - e[1]) * c / u;
  }
  return [0, 1, 2].map((u) => l[u] + i[u] * c + n[u] * p + s[u] * d);
}
function er(e) {
  return e === "bezier" ? "bezier" : "smooth";
}
function hn(e) {
  for (let t = e?.object; t; t = t.parent)
    if (t.userData?.omnicamPathKey) return t.userData.omnicamPathKey;
  return null;
}
function re(e) {
  return e.recording ? e.playblastCameraAtFrame() : e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode];
}
function tr(e, t, a) {
  const o = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], r = a?.rotation || t?.rotation || [0, 0, 0];
  return e.state.gizmo_space === "local" ? o.map((n) => je(n, r)) : o;
}
function ar(e) {
  if (e.selectedEntity === "object") {
    const t = e.selectedObject();
    if (!t || t.locked) return null;
    const a = t.type === "model" || t.type === "glb" ? e.webgl?.getObjectWorldCenter?.(t.id) : null, o = t.keyframes?.length ? Ae(t, e.frame) : t, r = a || o.position || [0, 0, 0];
    return {
      type: "object",
      object: t,
      position: r,
      rotation: o.rotation || [0, 0, 0],
      size: o.size || [1, 1, 1]
    };
  }
  if (e.state.view_mode !== "camera") {
    if (e.selectedEntity === "camera_target") {
      const t = e.activeCameraTrack();
      return { type: "camera_target", position: fe(t, e.frame, e.state.objects).target || e.camera.target || [0, 1.5, 0], rotation: [0, 0, 0] };
    }
    if (e.selectedEntity === "camera") {
      const t = e.activeCameraTrack();
      return { type: "camera", position: fe(t, e.frame, e.state.objects).position || e.camera.position || [6, 4, 6], rotation: [0, 0, 0] };
    }
  }
  return null;
}
function or(e) {
  const t = ar(e);
  if (!t) return null;
  const a = re(e), o = t.position;
  if (!o || !Number.isFinite(o[0]) || !Number.isFinite(o[1]) || !Number.isFinite(o[2])) return null;
  const r = F(o, a, e.canvas.width, e.canvas.height);
  if (!r || !Number.isFinite(r[0]) || !Number.isFinite(r[1])) return null;
  const n = Math.max(0.7, $(O(a.position, o)) * 0.12), s = t.type === "object" ? tr(e, t.object, t) : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (e.state.gizmo_mode !== "rotate" || t.type === "camera_target")
    return {
      entity: t,
      center: r,
      worldLength: n,
      handles: s.map((l, m) => ({ index: m, axis: l, points: [r, F(M(o, C(l, n)), a, e.canvas.width, e.canvas.height)] })).filter((l) => l.points[1] && Number.isFinite(l.points[1][0]) && Number.isFinite(l.points[1][1]))
    };
  const i = s.map((l, m) => {
    const c = Math.abs(l[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], p = de(me(l, c)), d = de(me(l, p)), u = [];
    for (let h = 0; h <= 48; h++) {
      const g = h / 48 * Math.PI * 2, v = F(M(o, M(C(p, Math.cos(g) * n), C(d, Math.sin(g) * n))), a, e.canvas.width, e.canvas.height);
      v && Number.isFinite(v[0]) && Number.isFinite(v[1]) && u.push(v);
    }
    return { index: m, axis: l, points: u };
  });
  return { entity: t, center: r, worldLength: n, handles: i };
}
function Ia(e, t) {
  const a = or(e);
  if (!a) return null;
  const o = Math.min(2, window.devicePixelRatio || 1), r = Math.hypot(t[0] - a.center[0], t[1] - a.center[1]);
  if (a.entity.type === "object" && (e.state.gizmo_mode === "translate" || e.state.gizmo_mode === "scale") && r <= 11 * o) {
    const i = a.center;
    return {
      free: !0,
      index: -1,
      axis: [0, 0, 0],
      distance: r,
      segment: [i, [i[0] + 1, i[1]]],
      worldLength: a.worldLength,
      entity: a.entity
    };
  }
  let s = null;
  for (const i of a.handles)
    for (let l = 0; l < i.points.length - 1; l++) {
      const m = i.points[l], c = i.points[l + 1], p = io(t, m, c);
      (!s || p < s.distance) && (s = { ...i, distance: p, segment: [m, c], worldLength: a.worldLength, entity: a.entity });
    }
  return s?.distance <= 18 * o ? s : null;
}
function rr(e, t) {
  const a = e.webgl?.pick?.(t[0], t[1], e.canvas.width, e.canvas.height);
  if (a) {
    if (typeof a == "string") {
      const i = e.state.objects.find((l) => l.id === a);
      return i ? { type: "object", object: i } : null;
    }
    if (a.type === "camera" || a.type === "camera_target") {
      const i = e.state.cameras.find((l) => l.id === a.id);
      return i ? { type: a.type, camera: i } : null;
    }
    const s = e.state.objects.find((i) => i.id === a.id);
    return s ? { type: "object", object: s } : null;
  }
  const o = re(e);
  if (e.state.view_mode !== "camera") {
    for (const s of e.state.cameras) {
      for (const c of s.keyframes || []) {
        const p = c.camera?.position;
        if (!p) continue;
        const d = F(p, o, e.canvas.width, e.canvas.height);
        if (d && Math.hypot(t[0] - d[0], t[1] - d[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
          return { type: "camera_keyframe", camera: s, keyframe: c };
      }
      const i = fe(s, e.frame, e.state.objects), l = F(i.target || [0, 1.5, 0], o, e.canvas.width, e.canvas.height);
      if (l && Math.hypot(t[0] - l[0], t[1] - l[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera_target", camera: s };
      const m = F(i.position || [6, 4, 6], o, e.canvas.width, e.canvas.height);
      if (m && Math.hypot(t[0] - m[0], t[1] - m[1]) <= 22 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera", camera: s };
    }
    for (const s of e.state.objects)
      if (s.enabled !== !1)
        for (const i of s.keyframes || []) {
          const l = i.transform?.position;
          if (!l) continue;
          const m = F(l, o, e.canvas.width, e.canvas.height);
          if (m && Math.hypot(t[0] - m[0], t[1] - m[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
            return { type: "object_keyframe", object: s, keyframe: i };
        }
  }
  let n = null;
  for (const s of e.state.objects) {
    if (s.enabled === !1) continue;
    const i = s.keyframes?.length ? Ae(s, e.frame) : s, l = F(i.position || [0, 0, 0], o, e.canvas.width, e.canvas.height);
    if (!l) continue;
    const m = Math.hypot(t[0] - l[0], t[1] - l[1]);
    (!n || m < n.distance) && (n = { object: s, distance: m });
  }
  return n?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? { type: "object", object: n.object } : null;
}
const We = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, $e = (e, t) => Math.round(e / t) * t;
function Aa(e) {
  const t = e.selectedObjectIds instanceof Set && e.selectedObjectIds.size ? e.selectedObjectIds : new Set(e.selectedObjectId ? [e.selectedObjectId] : []);
  return e.state.objects.filter((a) => t.has(a.id) && !a.locked);
}
function nr(e, t) {
  const a = Aa(e);
  if (!a.length || !["translate", "rotate", "scale"].includes(t)) return !1;
  e.checkpoint(`${t[0].toUpperCase()}${t.slice(1)} selection`);
  for (const m of a) e.beginObjectEdit(m);
  const o = a.map((m) => ({ object: m, transform: oe(m) })), r = o.reduce((m, c) => M(m, c.transform.position), [0, 0, 0]).map((m) => m / o.length), n = [e.canvas.width * 0.5, e.canvas.height * 0.5], s = e.lastViewportPointer || n, i = e.interactionElement.getBoundingClientRect(), l = e.lastPointerEvent || { clientX: i.left + s[0] * i.width / e.canvas.width, clientY: i.top + s[1] * i.height / e.canvas.height };
  return e.modalTransform = { mode: t, axis: null, numeric: "", start: s, lastEvent: l, snapshots: o, pivot: r }, e.setTransformMode(t), e.setStatus(`${t.toUpperCase()} · move mouse · X/Y/Z constrain · type value · Enter confirm · Esc cancel`), e.render(), !0;
}
function sr(e) {
  if (!e.numeric || e.numeric === "-" || e.numeric === ".") return null;
  const t = Number(e.numeric);
  return Number.isFinite(t) ? t : null;
}
function ir(e, t, a, o, r) {
  const n = r ? "grid" : e.state.spatial_snap_mode;
  if (n === "grid") {
    const s = e.state.spatial_grid_size || 0.5;
    return a.map((i) => i.map((l) => $e(l, s)));
  }
  if (n === "vertex" && o) {
    const s = e.webgl?.pickSubElement?.(o[0], o[1], e.canvas.width, e.canvas.height, "vertex");
    if (s?.point && !t.snapshots.some((i) => i.object.id === s.objectId)) {
      const i = a.reduce((m, c) => M(m, c), [0, 0, 0]).map((m) => m / a.length), l = O(s.point, i);
      return a.map((m) => M(m, l));
    }
  }
  return a;
}
function Me(e, t) {
  const a = e.modalTransform;
  if (!a) return !1;
  a.lastEvent = t;
  const o = e.interactionElement.getBoundingClientRect(), r = [
    (t.clientX - o.left) * e.canvas.width / Math.max(1, o.width),
    (t.clientY - o.top) * e.canvas.height / Math.max(1, o.height)
  ];
  e.lastViewportPointer = r;
  const n = r[0] - a.start[0], s = r[1] - a.start[1], i = t.shiftKey ? 0.1 : 1, l = sr(a), m = a.axis ? We[a.axis] : null, c = e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode], p = L(c), d = c.camera_type === "orthographic" ? 10 / (Math.max(0.01, c.zoom || 1) * Math.max(1, e.canvas.height)) : Math.hypot(...O(c.position, c.target)) * 25e-4;
  let u = a.snapshots.map((S) => [...S.transform.position]);
  if (a.mode === "translate") {
    const S = l ?? (n - s) * d * i, D = m ? C(m, S) : M(C(p.right, n * d * i), C(p.up, -s * d * i));
    u = u.map((w) => M(w, D)), u = ir(e, a, u, r, t.ctrlKey || t.metaKey);
  }
  const h = a.mode === "rotate" ? l ?? (n - s) * 0.5 * i : 0, g = a.mode === "scale" ? Math.max(0.01, l ?? 1 + (n - s) * 0.01 * i) : 1, v = m || We.z, y = t.ctrlKey || t.metaKey || e.state.spatial_snap_mode === "grid";
  a.snapshots.forEach((S, D) => {
    const w = S.object;
    if (a.mode === "translate" && (w.position = u[D]), a.mode === "rotate") {
      const k = y ? $e(h, 15) : h, f = C(v, k);
      w.position = M(a.pivot, je(O(S.transform.position, a.pivot), f)), w.rotation = M(S.transform.rotation, f);
    }
    if (a.mode === "scale") {
      const k = y ? $e(g, 0.1) : g, f = m ? m.map((T) => T ? k : 1) : [k, k, k], x = O(S.transform.position, a.pivot);
      w.position = M(a.pivot, x.map((T, N) => T * f[N])), w.size = S.transform.size.map((T, N) => Math.max(0.01, T * f[N]));
    }
    e.commitObjectEdit(w);
  }), e.refreshInspector(), e.render();
  const b = `${a.axis ? ` ${a.axis.toUpperCase()}` : ""}${a.numeric ? ` = ${a.numeric}` : ""}`;
  return e.setStatus(`${a.mode.toUpperCase()}${b}`), !0;
}
function Oa(e) {
  return e.modalTransform ? (e.modalTransform = null, e.editingKeyFrame = null, e.scheduleSerialize(), e.refreshKeys(), e.drawCurveEditor(), e.render(), e.setStatus("Transform confirmed"), !0) : !1;
}
function Pa(e) {
  return e.modalTransform ? (e.modalTransform = null, e.undo(), e.setStatus("Transform cancelled"), !0) : !1;
}
function cr(e, t) {
  const a = e.modalTransform;
  if (!a) return !1;
  const o = t.key.toLowerCase();
  return o === "escape" ? Pa(e) : o === "enter" || o === " " ? Oa(e) : We[o] ? (a.axis = a.axis === o ? null : o, Me(e, a.lastEvent), !0) : /^[0-9]$/.test(o) || o === "." || o === "," || o === "-" && !a.numeric ? (a.numeric += o === "," ? "." : o, Me(e, a.lastEvent), !0) : (o === "backspace" && (a.numeric = a.numeric.slice(0, -1), Me(e, a.lastEvent)), !0);
}
function ve(e, t, a) {
  !t || t.historyCheckpointed || (e.checkpoint(a), t.historyCheckpointed = !0);
}
function lr(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastViewportWheelAt) || t - e.lastViewportWheelAt > 300) && e.checkpoint("Dolly viewport"), e.lastViewportWheelAt = t;
}
const ce = (e, t) => Math.round(e / t) * t, mr = (e, t) => e.map((a) => ce(a, t)), Ue = (e, t) => e.camera_type === "orthographic" ? 10 / (Math.max(0.01, e.zoom || 1) * Math.max(1, t)) : $(O(e.position, e.target)) * 25e-4;
function Z(e, t, a, o = []) {
  const n = e.currentTransformEvent?.ctrlKey || e.currentTransformEvent?.metaKey ? "grid" : e.state.spatial_snap_mode;
  if (n === "grid") return mr(t, e.state.spatial_grid_size || 0.5);
  if (n === "vertex" && a) {
    const s = e.webgl?.pickSubElement?.(a[0], a[1], e.canvas.width, e.canvas.height, "vertex");
    if (s?.point && !o.includes(s.objectId)) return [...s.point];
  }
  return t;
}
function gn(e, t) {
  if (e.modalTransform) {
    t.preventDefault?.(), t.stopPropagation?.(), t.button === 0 ? Oa(e) : t.button === 2 && Pa(e);
    return;
  }
  if (t.target?.closest?.("button,input,select")) return;
  if (t.button === 2 && !t.altKey) {
    t.preventDefault?.(), t.stopPropagation?.(), t.stopImmediatePropagation?.();
    return;
  }
  t.preventDefault?.(), t.stopPropagation?.(), e.closeMenus(), e.interactionElement.focus({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(t.pointerId), e.activePointerId = t.pointerId, e.canvas.classList.add("dragging");
  const a = e.interactionElement.getBoundingClientRect(), o = (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width), r = (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height), n = re(e), s = e.state.view_mode !== "camera", i = t.button === 0, l = i && !t.altKey && !t.shiftKey;
  if (l && e.webgl?.pickPathKey) {
    const g = e.webgl.pickPathKey([o, r]);
    if (g) {
      const y = ((e.state.cameras || []).find((b) => b.id === g.cameraId)?.keyframes || []).find((b) => b.frame === g.frame);
      if (y) {
        e.checkpoint("Move path key"), e.pathDrag = { cameraId: g.cameraId, frame: g.frame, anchor: [...y.camera.position] }, e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), e.selectKeyframe?.(y);
        return;
      }
    }
  }
  const m = l ? Ia(e, [o, r]) : null;
  if (m) {
    const [g, v] = m.segment, y = Math.max(1, Math.hypot(v[0] - g[0], v[1] - g[1])), b = {
      pointer: [o, r],
      axis: m.axis,
      axisIndex: m.index,
      screen: [(v[0] - g[0]) / y, (v[1] - g[1]) / y],
      worldLength: m.worldLength,
      screenLength: y,
      free: !!m.free
    };
    if (e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), m.entity.type === "camera_target") {
      e.checkpoint("Move camera target"), e.beginCameraEdit(), e.gizmoDrag = {
        ...b,
        type: "camera_target",
        historyCheckpointed: !0,
        target: [...m.entity.position || e.camera.target]
      };
      return;
    }
    if (m.entity.type === "camera") {
      e.checkpoint("Transform camera"), e.beginCameraEdit(), e.gizmoDrag = {
        ...b,
        type: "camera",
        historyCheckpointed: !0,
        position: [...m.entity.position || e.camera.position],
        target: [...e.camera.target]
      };
      return;
    }
    if (m.entity.type === "object") {
      const S = m.entity.object;
      e.checkpoint("Transform object");
      const D = Aa(e), w = (D.length ? D : [S]).map((f) => ({ object: f, transform: oe(f) }));
      for (const f of w) e.beginObjectEdit(f.object);
      const k = w.reduce((f, x) => M(f, x.transform.position), [0, 0, 0]).map((f) => f / w.length);
      e.gizmoDrag = {
        ...b,
        type: "object",
        historyCheckpointed: !0,
        object: S,
        group: w,
        groupPivot: k,
        position: [...m.entity.position],
        rotation: [...m.entity.rotation],
        size: [...m.entity.size],
        viewRight: L(n).right,
        viewUp: L(n).up,
        freeScale: n.camera_type === "orthographic" ? Ue(n, e.canvas.height) : $(O(n.position, m.entity.position)) * (2 * Math.tan((n.fov || 35) * Math.PI / 360)) / e.canvas.height
      };
      return;
    }
  }
  const c = i ? rr(e, [o, r]) : null;
  if (e.pointerHit = !!(m || c), c) {
    if (c.type === "camera_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(c.camera.id), e.setFrame(c.keyframe.frame), e.selectKeyframe(c.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_(`${c.camera.name} · Keyframe @ F${c.keyframe.frame} selected`));
      return;
    }
    if (c.type === "object_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectId = c.object.id, e.editingKeyFrame = null, e.setFrame(c.keyframe.frame), e.selectKeyframe(c.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_(`${c.object.name || c.object.type} · Keyframe @ F${c.keyframe.frame} selected`));
      return;
    }
    if (c.type === "camera_target") {
      e.finishCameraEdit(), e.selectedEntity = "camera_target", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(c.camera.id), e.checkpoint("Move camera target"), e.beginCameraEdit();
      const { right: g, up: v } = L(n), y = [...e.camera.target], b = $(O(n.position, y)), S = (n.fov || 35) * Math.PI / 360;
      e.targetFreeDrag = {
        pointer: [o, r],
        target: y,
        right: g,
        up: v,
        scale: b * (n.camera_type === "orthographic" ? 25e-4 : 2 * Math.tan(S) / e.canvas.height),
        historyCheckpointed: !0
      }, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_(`${c.camera.name} · Target aim selected`));
      return;
    }
    if (c.type === "camera" && (e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(c.camera.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_(`${c.camera.name} selected`))), c.type === "object" && c.object) {
      if (e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectIds ||= /* @__PURE__ */ new Set(), t.shiftKey || t.ctrlKey || t.metaKey ? e.selectedObjectIds.has(c.object.id) ? e.selectedObjectIds.delete(c.object.id) : e.selectedObjectIds.add(c.object.id) : e.selectedObjectIds = /* @__PURE__ */ new Set([c.object.id]), e.selectedObjectId = e.selectedObjectIds.has(c.object.id) ? c.object.id : [...e.selectedObjectIds].at(-1) || null, e.selectedKeyFrame = c.object.keyframes?.find((g) => g.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.state.select_mode && e.state.select_mode !== "object") {
        const g = e.webgl?.pickSubElement?.(o, r, e.canvas.width, e.canvas.height, e.state.select_mode);
        if (g) {
          e.subSelection = g;
          const v = g.point.map((b) => Math.round(b * 100) / 100).join(", "), y = g.mode === "vertex" ? "Vertex" : g.mode === "edge" ? "Edge" : "Face";
          e.setStatus(_(`${y} selected at [${v}] · Press F to focus`));
        } else
          e.subSelection = null;
      } else
        e.subSelection = null, e.setStatus(_(`${c.object.name || c.object.type} selected`));
      e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
    }
  }
  if (!c && i && !t.ctrlKey && !t.metaKey && e.state.navigation_profile === "blender") {
    e.boxSelection = {
      start: [o, r],
      current: [o, r],
      additive: t.shiftKey,
      initial: new Set(e.selectedObjectIds || [])
    }, e.drag = null, e.interactionElement.style && (e.interactionElement.style.cursor = "crosshair"), e.render();
    return;
  }
  const p = e.state.navigation_profile === "blender", d = p ? t.button === 1 && t.shiftKey || n.camera_type === "orthographic" : t.button === 1 || t.altKey && t.button === 1 || t.shiftKey && (t.button === 0 || t.button === 1) || n.camera_type === "orthographic", u = p ? t.button === 1 && (t.ctrlKey || t.metaKey) : t.altKey && t.button === 2 || t.button === 2 && !e.isNavigatingFly, h = !!e.isNavigatingFly;
  s || (e.checkpoint("Move camera"), e.beginCameraEdit()), s && !e.state.editor_views && (e.state.editor_views = De()), e.drag = {
    x: t.clientX,
    y: t.clientY,
    shift: d,
    dolly: u,
    fly: h,
    camera: R(n),
    target: s ? e.state.editor_views[e.state.view_mode] || (e.state.editor_views[e.state.view_mode] = De()[e.state.view_mode]) : e.camera,
    editorView: s,
    historyCheckpointed: !s
  }, e.interactionElement.style && (e.interactionElement.style.cursor = u ? "ns-resize" : d ? "move" : "grabbing");
}
function yn(e, t) {
  if (e.lastPointerEvent = t, e.modalTransform) {
    Me(e, t);
    return;
  }
  if (e.pathDrag) {
    const n = e.interactionElement.getBoundingClientRect(), s = (t.clientX - n.left) * e.canvas.width / Math.max(1, n.width), i = (t.clientY - n.top) * e.canvas.height / Math.max(1, n.height), m = ((e.state.cameras || []).find((c) => c.id === e.pathDrag.cameraId)?.keyframes || []).find((c) => c.frame === e.pathDrag.frame);
    m && (m.camera.position = Jo(
      [s, i],
      re(e),
      e.pathDrag.anchor,
      e.canvas.width,
      e.canvas.height
    ), m.interpolation = er(m.interpolation), e.webgl && (e.webgl.pathKey = ""), e.setFrame(e.frame, !1, !1), e.render());
    return;
  }
  if (e.boxSelection) {
    const n = e.interactionElement.getBoundingClientRect();
    e.boxSelection.current = [
      (t.clientX - n.left) * e.canvas.width / Math.max(1, n.width),
      (t.clientY - n.top) * e.canvas.height / Math.max(1, n.height)
    ], e.render();
    return;
  }
  if (e.currentTransformEvent = t, e.keyDrag) {
    Do(e, t);
    return;
  }
  if (e.targetFreeDrag) {
    ve(e, e.targetFreeDrag, "Move camera target");
    const n = e.interactionElement.getBoundingClientRect(), s = (t.clientX - n.left) * e.canvas.width / Math.max(1, n.width), i = (t.clientY - n.top) * e.canvas.height / Math.max(1, n.height), l = s - e.targetFreeDrag.pointer[0], m = i - e.targetFreeDrag.pointer[1], c = t.shiftKey ? 0.1 : 1, p = M(C(e.targetFreeDrag.right, l * e.targetFreeDrag.scale * c), C(e.targetFreeDrag.up, -m * e.targetFreeDrag.scale * c)), d = M(e.targetFreeDrag.target, p);
    e.camera.target = Z(e, d, [s, i]), e.commitCameraEdit(), e.refreshInspector(), e.render();
    return;
  }
  if (e.gizmoDrag) {
    ve(e, e.gizmoDrag, e.gizmoDrag.type === "object" ? "Transform object" : "Transform camera");
    const n = e.interactionElement.getBoundingClientRect(), s = [
      (t.clientX - n.left) * e.canvas.width / Math.max(1, n.width),
      (t.clientY - n.top) * e.canvas.height / Math.max(1, n.height)
    ], i = t.shiftKey ? 0.1 : 1, l = ((s[0] - e.gizmoDrag.pointer[0]) * e.gizmoDrag.screen[0] + (s[1] - e.gizmoDrag.pointer[1]) * e.gizmoDrag.screen[1]) * i, m = t.ctrlKey || t.metaKey || e.state.spatial_snap_mode === "grid";
    if (e.gizmoDrag.type === "camera_target") {
      const d = M(e.gizmoDrag.target, C(e.gizmoDrag.axis, l * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
      e.camera.target = Z(e, d, s), e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.gizmoDrag.type === "camera") {
      if (e.state.gizmo_mode === "translate") {
        const d = M(e.gizmoDrag.position, C(e.gizmoDrag.axis, l * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
        e.camera.position = Z(e, d, s);
      } else {
        const d = m ? ce(l * 0.015, Math.PI / 12) : l * 0.015, u = O(e.gizmoDrag.target, e.gizmoDrag.position), h = je(u, C(e.gizmoDrag.axis, d * (180 / Math.PI)));
        e.camera.target = M(e.gizmoDrag.position, h);
      }
      e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.state.gizmo_mode === "translate")
      if (e.gizmoDrag.free) {
        const d = (s[0] - e.gizmoDrag.pointer[0]) * i, u = (s[1] - e.gizmoDrag.pointer[1]) * i, h = M(
          e.gizmoDrag.position,
          M(C(e.gizmoDrag.viewRight, d * e.gizmoDrag.freeScale), C(e.gizmoDrag.viewUp, -u * e.gizmoDrag.freeScale))
        );
        e.gizmoDrag.object.position = Z(e, h, s, [e.gizmoDrag.object.id]);
      } else {
        const d = M(e.gizmoDrag.position, C(e.gizmoDrag.axis, l * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
        e.gizmoDrag.object.position = Z(e, d, s, [e.gizmoDrag.object.id]);
      }
    else if (e.state.gizmo_mode === "scale")
      if (e.gizmoDrag.free) {
        const d = (s[0] - e.gizmoDrag.pointer[0]) * i, u = (s[1] - e.gizmoDrag.pointer[1]) * i, h = (d - u) * e.gizmoDrag.freeScale, g = e.gizmoDrag.size.map((v) => {
          const y = v + h;
          return Math.max(0.01, m ? ce(y, 0.1) : y);
        });
        e.gizmoDrag.object.size = g;
      } else {
        const d = [...e.gizmoDrag.size], u = d[e.gizmoDrag.axisIndex] + l * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength;
        d[e.gizmoDrag.axisIndex] = Math.max(0.01, m ? ce(u, 0.1) : u), e.gizmoDrag.object.size = d;
      }
    else {
      const d = [...e.gizmoDrag.rotation], u = d[e.gizmoDrag.axisIndex] + l * 0.75;
      d[e.gizmoDrag.axisIndex] = m ? ce(u, 15) : u, e.gizmoDrag.object.rotation = d;
    }
    const c = e.gizmoDrag.group || [], p = c.find((d) => d.object === e.gizmoDrag.object)?.transform;
    if (c.length > 1 && p)
      if (e.state.gizmo_mode === "translate") {
        const d = O(e.gizmoDrag.object.position, p.position);
        for (const u of c) u.object.position = M(u.transform.position, d);
      } else if (e.state.gizmo_mode === "rotate") {
        const d = O(e.gizmoDrag.object.rotation, p.rotation);
        for (const u of c)
          u.object.position = M(e.gizmoDrag.groupPivot, je(O(u.transform.position, e.gizmoDrag.groupPivot), d)), u.object.rotation = M(u.transform.rotation, d);
      } else {
        const d = e.gizmoDrag.object.size.map((u, h) => u / Math.max(0.01, p.size[h]));
        for (const u of c) {
          const h = O(u.transform.position, e.gizmoDrag.groupPivot);
          u.object.position = M(e.gizmoDrag.groupPivot, h.map((g, v) => g * d[v])), u.object.size = u.transform.size.map((g, v) => Math.max(0.01, g * d[v]));
        }
      }
    for (const d of c.length ? c : [{ object: e.gizmoDrag.object }]) e.commitObjectEdit(d.object);
    e.refreshInspector(), e.render();
    return;
  }
  if (e.objectDrag) {
    ve(e, e.objectDrag, "Move object");
    const n = t.clientX - e.objectDrag.x, s = t.clientY - e.objectDrag.y, { right: i, up: l } = L(e.objectDrag.camera), m = Ue(e.objectDrag.camera, e.canvas.height) * (t.shiftKey ? 0.1 : 1), c = M(e.objectDrag.position, M(C(i, n * m), C(l, -s * m)));
    e.objectDrag.object.position = Z(e, c, null, [e.objectDrag.object.id]), e.commitObjectEdit(e.objectDrag.object), e.refreshInspector(), e.render();
    return;
  }
  if (!e.drag) {
    const n = e.interactionElement.getBoundingClientRect(), s = Ia(e, [
      (t.clientX - n.left) * e.canvas.width / Math.max(1, n.width),
      (t.clientY - n.top) * e.canvas.height / Math.max(1, n.height)
    ]), i = s ? s.free ? "free" : s.index : null;
    i !== e.hoveredGizmoHandle && (e.hoveredGizmoHandle = i, e.interactionElement.style && (e.interactionElement.style.cursor = s ? "grab" : "default"), e.render());
    return;
  }
  ve(e, e.drag, e.drag.editorView ? "Navigate viewport" : "Move camera");
  const a = t.clientX - e.drag.x, o = t.clientY - e.drag.y, r = e.drag.camera;
  if (e.drag.dolly) {
    const n = Math.exp(o * 5e-3), s = O(r.position, r.target);
    e.drag.target.position = M(r.target, C(s, n)), e.drag.target.camera_type === "orthographic" && (e.drag.target.zoom = Math.max(0.01, (r.zoom || 1) / n));
  } else if (e.drag.fly) {
    const n = O(r.target, r.position), s = $(n);
    let i = Math.atan2(n[0], n[2]), l = Math.asin(j(n[1] / s, -0.999, 0.999));
    i -= a * 8e-3, l = j(l - o * 8e-3, -1.45, 1.45), e.drag.target.target = [
      r.position[0] + s * Math.sin(i) * Math.cos(l),
      r.position[1] + s * Math.sin(l),
      r.position[2] + s * Math.cos(i) * Math.cos(l)
    ];
  } else if (e.drag.shift) {
    const { right: n, up: s } = L(r), i = Ue(r, e.canvas.height), l = M(C(n, -a * i), C(s, o * i));
    e.drag.target.position = M(r.position, l), e.drag.target.target = M(r.target, l);
  } else {
    const n = O(r.position, r.target), s = $(n);
    let i = Math.atan2(n[0], n[2]), l = Math.asin(j(n[1] / s, -0.999, 0.999));
    i -= a * 8e-3, l = j(l + o * 8e-3, -1.45, 1.45), e.drag.target.position = [
      r.target[0] + s * Math.sin(i) * Math.cos(l),
      r.target[1] + s * Math.sin(l),
      r.target[2] + s * Math.cos(i) * Math.cos(l)
    ];
  }
  e.drag.editorView ? (e.serialize(), e.render()) : e.commitCameraEdit();
}
function dr(e) {
  return !e.drag && !e.gizmoDrag && !e.objectDrag && !e.targetFreeDrag ? !1 : (e.undo(), e.activePointerId !== null && e.interactionElement.hasPointerCapture?.(e.activePointerId) && e.interactionElement.releasePointerCapture(e.activePointerId), e.activePointerId = null, e.drag = null, e.objectDrag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.pointerHit = !1, e.canvas.classList.remove("dragging"), e.interactionElement.style && (e.interactionElement.style.cursor = "default"), e.finishCameraEdit(), e.refreshInspector(), e.render(), e.setStatus(_("Interaction cancelled")), !0);
}
function bn(e, t) {
  if (e.pathDrag) {
    e.pathDrag = null, e.interactionElement.style && (e.interactionElement.style.cursor = ""), e.interactionElement.releasePointerCapture?.(t.pointerId), e.activePointerId = null, e.canvas.classList.remove("dragging"), e.scheduleSerialize(), e.refreshKeys(), e.setStatus(_("Path key moved"));
    return;
  }
  if (e.boxSelection) {
    const n = e.boxSelection, s = re(e), i = Math.min(n.start[0], n.current[0]), l = Math.max(n.start[0], n.current[0]), m = Math.min(n.start[1], n.current[1]), c = Math.max(n.start[1], n.current[1]), p = n.additive ? new Set(n.initial) : /* @__PURE__ */ new Set();
    for (const d of e.state.objects) {
      if (d.enabled === !1) continue;
      const u = d.keyframes?.length ? Ae(d, e.frame) : d, h = F(u.position || [0, 0, 0], s, e.canvas.width, e.canvas.height);
      h && h[0] >= i && h[0] <= l && h[1] >= m && h[1] <= c && p.add(d.id);
    }
    e.selectedObjectIds = p, e.selectedObjectId = [...p].at(-1) || null, e.selectedEntity = p.size ? "object" : "camera", e.boxSelection = null, e.interactionElement.style && (e.interactionElement.style.cursor = "default"), e.refreshObjects(), e.refreshInspector(), e.render(), e.setStatus(_(`${p.size} object(s) selected`));
    return;
  }
  const a = e.keyDrag, o = !!(e.drag && !e.drag.editorView || e.targetFreeDrag), r = !!(e.gizmoDrag || e.objectDrag);
  !e.pointerHit && !e.gizmoDrag && !e.objectDrag && !e.targetFreeDrag && e.drag && t && Math.hypot(t.clientX - e.drag.x, t.clientY - e.drag.y) < 5 && (t.button === 0 || t.button === void 0) && (e.selectedEntity === "object" || e.selectedObjectId !== null || e.selectedEntity === "camera_target") && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = null, e.subSelection = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_("Deselected"))), t?.pointerId === e.activePointerId && e.interactionElement.hasPointerCapture?.(t.pointerId) && e.interactionElement.releasePointerCapture(t.pointerId), e.activePointerId = null, e.drag = null, e.objectDrag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.keyDrag = null, e.pointerHit = !1, e.canvas.classList.remove("dragging"), e.interactionElement.style && (e.interactionElement.style.cursor = "default"), a && (a.badge?.remove(), e.editingKeyFrame = null, e.updateKeyVisualState(), e.root.focus({ preventScroll: !0 })), o && e.finishCameraEdit(), r && (e.editingKeyFrame = null, e.updateKeyVisualState(), e.drawCurveEditor());
}
function _n(e, t) {
  if (t.target.closest?.(".viewport-inspector, .scene-tree, .menu-panel, .context-menu, .viewport-quick-bar"))
    return;
  if (t.preventDefault(), t.stopPropagation(), e.closeMenus(), e.isNavigatingFly) {
    e.cameraSpeed = j(e.cameraSpeed * Math.exp(-t.deltaY * 1e-3), 0.05, 20), e.setStatus(_(`Fly speed: ${e.cameraSpeed.toFixed(2)}x`));
    return;
  }
  lr(e);
  const a = e.state.view_mode !== "camera", o = re(e);
  a || e.beginCameraEdit();
  const r = j(t.deltaY * 1e-3, -0.4, 0.4), n = O(o.position, o.target);
  o.position = M(o.target, C(n, Math.exp(r))), o.camera_type === "orthographic" && (o.zoom = Math.max(0.01, (o.zoom || 1) * Math.exp(-r))), a ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit());
}
const pr = (e) => {
  const t = new Set((e.motion_layers || []).map((o) => o.id));
  let a = t.size + 1;
  for (; t.has(`motion_${a}`); ) a += 1;
  return `motion_${a}`;
};
function Ee(e, { sourceKind: t = "manual_2d", label: a, keys: o, source: r = {} }) {
  if (!Ct.includes(t)) throw new Error(`Unsupported motion source: ${t}`);
  const n = pr(e), s = { id: n, label: a || `Motion ${n.split("_").at(-1)}`, enabled: !0, semantic: "screen_point", source_kind: t, keys: o.map((i) => ({ visible: !0, interpolation: "linear", ...i })), source: { ...r } };
  return e.motion_layers ||= [], e.motion_layers.push(s), e.selected_motion_layer_id = n, s;
}
function Fe(e) {
  return (e.motion_layers || []).find((t) => t.id === e.selected_motion_layer_id) || null;
}
function at(e, t) {
  return e.motion_tool = xt.includes(t) ? t : "select", e.motion_tool;
}
function fr(e, t) {
  if (Dt.includes(t))
    for (const a of e.keys) a.interpolation = t;
}
function ur(e, t, a) {
  if (!e?.keys?.length || a < t) return;
  if (e.keys.length === 1) {
    e.keys[0].time_seconds = t;
    return;
  }
  const o = (a - t) / (e.keys.length - 1);
  e.keys.forEach((r, n) => {
    r.time_seconds = t + o * n;
  });
}
function za(e, t) {
  e.motion_layers = (e.motion_layers || []).filter((a) => a.id !== t), e.selected_motion_layer_id === t && (e.selected_motion_layer_id = e.motion_layers[0]?.id || null);
}
function hr(e, t) {
  const a = t.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (e.clientX - a.left) / Math.max(1, a.width))),
    y: Math.max(0, Math.min(1, (e.clientY - a.top) / Math.max(1, a.height)))
  };
}
function gr(e, t, a, o, r) {
  const n = fe(e, a, e.objects);
  let s = t?.point;
  if (t?.object_id) {
    const c = e.objects.find((u) => u.id === t.object_id);
    if (!c) return null;
    const p = go(e.objects, c), d = Array.isArray(t.local_point) ? t.local_point : [0, 0, 0];
    s = [p.position[0] + d[0] * p.size[0], p.position[1] + d[1] * p.size[1], p.position[2] + d[2] * p.size[2]];
  }
  if (!Array.isArray(s)) return null;
  const i = F(s, n, o, r);
  if (!i) return null;
  const l = i[0] / o, m = i[1] / r;
  return { x: l, y: m, visible: l >= 0 && l <= 1 && m >= 0 && m <= 1 };
}
function yr(e, t = 6e-3) {
  if (e.length < 3) return e;
  const a = [e[0]];
  for (const o of e.slice(1, -1)) {
    const r = a.at(-1);
    Math.hypot(o.x - r.x, o.y - r.y) >= t && a.push(o);
  }
  return a.push(e.at(-1)), a;
}
function Na(e, t, a = 0.035) {
  let o = null, r = a;
  for (const n of e || []) for (const s of n.keys || []) {
    const i = Math.hypot(s.x - t.x, s.y - t.y);
    i <= r && (o = n, r = i);
  }
  return o;
}
function br(e, t, a, o) {
  const r = yr(t);
  if (r.length < 2) return null;
  const n = Math.max(0, o - a);
  return Ee(e, {
    sourceKind: "manual_2d",
    label: `Track ${(e.motion_layers || []).length + 1}`,
    keys: r.map((s, i) => ({ ...s, time_seconds: a + n * i / (r.length - 1) }))
  });
}
function Le(e, t) {
  return hr(t, e.interactionElement);
}
function _r(e, t) {
  const a = Na(e.motion_layers, t);
  return a ? (za(e, a.id), a) : null;
}
const Ke = (e) => {
  e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.();
}, gt = (e) => {
  const t = e.state.playback_range || [e.frame, e.state.duration_frames - 1];
  return [t[0] / e.state.fps, t[1] / e.state.fps];
}, Q = (e, t) => {
  e.serialize(), e.render(), e.setStatus(t);
};
function Ie(e) {
  for (const t of e.root.querySelectorAll("[data-motion-tool]")) {
    const a = t.dataset.motionTool === e.state.motion_tool;
    t.classList.toggle("active", a), t.setAttribute("aria-pressed", String(a));
  }
  e.interactionElement.dataset.motionTool = e.state.motion_tool;
}
function vr(e, t) {
  const a = e.state.objects.find((m) => m.id === e.selectedObjectId), o = e.motionCreationKind, n = (o === "object" || o !== "world" && !!a) && a ? "object_point" : "world_point", s = n === "object_point" ? { object_id: a.id, local_point: [0, 0, 0] } : { point: e.webgl?.intersectScenePoint?.(t.x * e.canvas.width, t.y * e.canvas.height, e.canvas.width, e.canvas.height) || [...e.camera.target] }, i = gr(e.state, s, e.frame, e.canvas.width, e.canvas.height) || t, l = n === "object_point" ? `${a.name || a.id} Track` : "World Anchor";
  return Ee(e.state, { sourceKind: n, label: l, keys: [{ time_seconds: e.frame / e.state.fps, x: i.x, y: i.y, visible: i.visible !== !1 }], source: s });
}
function vn(e, t) {
  for (const r of e.root.querySelectorAll("[data-motion-tool]"))
    r.addEventListener("click", () => {
      e.motionCreationKind = "", at(e.state, r.dataset.motionTool), Ie(e), e.render();
    }, { signal: t });
  for (const r of e.root.querySelectorAll("[data-motion-preset]"))
    r.addEventListener("click", () => {
      e.checkpoint("Add camera field"), Ee(e.state, { sourceKind: "camera_field", label: `${r.dataset.motionPreset} Field`, keys: [{ time_seconds: 0, x: 0.5, y: 0.5 }], source: { preset: r.dataset.motionPreset, point: [...e.camera.target] } }), Q(e, `Camera field: ${r.dataset.motionPreset}`);
    }, { signal: t });
  e.root.querySelector('[data-role="motion-interpolation"]')?.addEventListener("change", (r) => {
    const n = Fe(e.state);
    n && (e.checkpoint("Set motion interpolation"), fr(n, r.target.value), Q(e, `Motion interpolation: ${r.target.value}`));
  }, { signal: t }), e.root.querySelector('[data-role="motion-key-visible"]')?.addEventListener("change", (r) => {
    const n = Fe(e.state);
    if (!n?.keys?.length) return;
    const s = e.frame / e.state.fps, i = n.keys.reduce((l, m) => Math.abs(m.time_seconds - s) < Math.abs(l.time_seconds - s) ? m : l);
    e.checkpoint("Set motion visibility"), i.visible = r.target.checked, Q(e, `Motion key ${i.visible ? "visible" : "hidden"}`);
  }, { signal: t });
  for (const r of e.root.querySelectorAll("[data-motion-layer-action]"))
    r.addEventListener("click", () => {
      const n = Fe(e.state);
      if (!n) return;
      const s = r.dataset.motionLayerAction;
      if (e.checkpoint(s === "delete" ? "Delete motion layer" : s === "retime" ? "Retime motion layer" : "Toggle motion layer"), s === "delete") za(e.state, n.id);
      else if (s === "retime") {
        const [i, l] = gt(e);
        ur(n, i, l);
      } else n.enabled = !n.enabled;
      Q(e, s === "delete" ? "Motion layer deleted" : s === "retime" ? "Motion layer retimed" : `Motion layer ${n.enabled ? "enabled" : "disabled"}`);
    }, { signal: t });
  const a = e.interactionElement;
  a.addEventListener("pointerdown", (r) => {
    const n = e.state.motion_tool;
    if (n === "select" || r.button !== 0) return;
    Ke(r), a.setPointerCapture?.(r.pointerId);
    const s = Le(e, r);
    if (n === "track") {
      e.checkpoint("Draw motion track"), e.motionTrackDraft = { pointerId: r.pointerId, points: [s] };
      return;
    }
    e.checkpoint(n === "erase" ? "Erase motion track" : "Add motion anchor"), n === "anchor" ? Ee(e.state, { sourceKind: "static_anchor", label: `Anchor ${(e.state.motion_layers || []).length + 1}`, keys: [{ time_seconds: e.frame / e.state.fps, ...s, interpolation: "hold" }] }) : n === "project" ? vr(e, s) : n === "erase" && _r(e.state, s), Q(e, `Motion tool: ${n}`);
  }, { capture: !0, signal: t }), a.addEventListener("pointermove", (r) => {
    e.motionTrackDraft?.pointerId === r.pointerId && (Ke(r), e.motionTrackDraft.points.push(Le(e, r)), e.render());
  }, { capture: !0, signal: t });
  const o = (r) => {
    const n = e.motionTrackDraft;
    if (n?.pointerId !== r.pointerId) return;
    Ke(r), e.motionTrackDraft = null;
    const [s, i] = gt(e), l = br(e.state, n.points, s, i);
    Q(e, l ? `Motion track: ${l.label}` : "Motion track needs a longer stroke");
  };
  a.addEventListener("pointerup", o, { capture: !0, signal: t }), a.addEventListener("pointercancel", o, { capture: !0, signal: t }), a.addEventListener("click", (r) => {
    if (e.state.motion_tool !== "select" || r.button !== 0) return;
    const n = Na(e.state.motion_layers, Le(e, r));
    n && (e.state.selected_motion_layer_id = n.id, e.render());
  }, { signal: t }), Ie(e);
}
const wr = {
  draw: { tool: "track", label: "Draw Path", hint: "Draw a trajectory in the Camera View. Release to finish, Esc to cancel." },
  object: { tool: "project", label: "Track Object", hint: "Click the selected object in the viewport to follow it." },
  world: { tool: "project", label: "World Point", hint: "Click a surface or point in the viewport to pin a fixed 3D point." },
  anchor: { tool: "anchor", label: "Screen Anchor", hint: "Click to place a control point at a fixed screen position." }
};
function Sr(e, t) {
  const a = wr[t];
  if (a) {
    if (t === "object" && !(e.state.objects || []).some((o) => o.id === e.selectedObjectId)) {
      e.setStatus("Select a scene object first, then choose Track Object.");
      return;
    }
    e.checkpoint?.(`Motion: ${a.label}`), at(e.state, a.tool), e.motionCreatingLabel = a.label, e.motionCreationKind = t, Ie(e), e.render(), e.setStatus(a.hint);
  }
}
function Ra(e) {
  return (e.state.motion_tool || "select") === "select" && !e.motionTrackDraft ? !1 : (at(e.state, "select"), e.motionTrackDraft = null, e.motionCreatingLabel = "", e.motionCreationKind = "", Ie(e), e.render(), e.setStatus("Motion creation cancelled."), !0);
}
function wn(e, t) {
  for (const a of e.root.querySelectorAll("[data-motion-create]"))
    a.addEventListener("click", () => Sr(e, a.dataset.motionCreate), { signal: t });
  e.root.querySelector("[data-motion-create-cancel]")?.addEventListener("click", () => Ra(e), { signal: t });
}
const yt = { t: "translate", r: "rotate", s: "scale" }, Mr = [
  ["viewport", ".viewport-wrap"],
  ["sequence", '[data-role="graph-sequence"]'],
  ["graph", ".oc-graph"],
  ["timeline", ".oc-timeline"]
], xr = 'button,summary,a[href],[role="button"],[role="menuitem"],[role="tab"],[role="option"],[role="checkbox"],[role="switch"]';
function Cr(e) {
  return e instanceof HTMLElement || e instanceof SVGElement ? !!e.closest?.(xr) : !1;
}
function Dr(e) {
  return !(e instanceof HTMLElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(e.tagName) || e.isContentEditable || !!e.closest?.('[contenteditable="true"],span.property_value');
}
function jr(e) {
  const t = e instanceof HTMLElement ? e : null;
  for (const [a, o] of Mr)
    if (t?.closest?.(o)) return a;
  return null;
}
function kr(e, t) {
  return jr(e) || t?.lastKeyZone || "viewport";
}
let bt = !1;
function Tr() {
  bt || typeof window > "u" || (bt = !0, window.addEventListener("keydown", (e) => {
    if (!Bo()) return;
    const t = e.composedPath?.()[0] || e.target, a = qo(t);
    !a || a.disposed || Er(a, e) && (e.preventDefault(), e.stopImmediatePropagation?.(), e.stopPropagation());
  }, { capture: !0 }));
}
function Er(e, t) {
  const a = t.composedPath?.()[0] || t.target;
  if (Dr(a) || (t.code === "Space" || t.key === "Enter") && Cr(a)) return !1;
  if (e.contextMenu.onKey(t)) return !0;
  if (e.modalTransform)
    return cr(e, t), !0;
  if (Ir(e, t)) return !0;
  const o = t.code;
  if ((t.ctrlKey || t.metaKey) && !o.startsWith("Numpad") || t.altKey) return !1;
  switch (kr(a, e)) {
    case "viewport":
      return Ar(e, t);
    case "sequence":
      return Pr(e, t);
    case "timeline":
    case "graph":
      return Or(e, t);
    default:
      return !1;
  }
}
function Ir(e, t) {
  const a = t.key.toLowerCase(), o = t.ctrlKey || t.metaKey;
  return a === "escape" ? dr(e) || Ra(e) ? !0 : e.isNavigatingFly ? (e.isNavigatingFly = !1, e.setStatus("Fly Mode OFF"), !0) : !1 : o && a === "z" ? (t.repeat || (t.shiftKey ? e.redo() : e.undo()), !0) : o && a === "y" ? (t.repeat || e.redo(), !0) : o && a === "c" ? e.selectedKeyframe() ? (e.copyKeyframe(), !0) : !1 : o && a === "v" ? e.copiedKeyframe ? (e.pasteKeyframe(), !0) : !1 : o && a === "d" ? (t.repeat || (e.selectedEntity === "object" && e.selectedObjectId ? e.duplicateObject(e.selectedObjectId) : e.selectedEntity === "camera" && e.duplicateCamera(e.state.active_camera_id)), !0) : t.altKey && a === "h" ? (t.repeat || e.showAllObjects(), !0) : t.code === "Space" ? (t.repeat || e.togglePlay(), !0) : !1;
}
function Ar(e, t) {
  const a = t.key.toLowerCase(), o = t.code;
  if (t.shiftKey && a === "g" && !e.isNavigatingFly)
    return e.selectHierarchy(), !0;
  if (yt[a] && !e.isNavigatingFly)
    return t.repeat || nr(e, yt[a]), !0;
  if (a === "tab") {
    const n = e.state.select_mode === "object" ? "vertex" : "object";
    return e.setSelectMode(n), e.setStatus(n === "object" ? "Object Mode" : "Component Mode: Vertex"), !0;
  }
  if (a === "f" || o === "NumpadDecimal")
    return t.repeat || e.frameTarget(), !0;
  if (a === "n")
    return t.repeat || e.toggleInspector(), !0;
  if (t.shiftKey && (o === "Backquote" || a === "~") || a === "c" && !t.shiftKey && !t.altKey && !t.ctrlKey)
    return e.isNavigatingFly = !e.isNavigatingFly, e.setStatus(e.isNavigatingFly ? "Fly Mode ON · WASD/QE to fly, Drag to look, Esc/C to exit" : "Fly Mode OFF"), !0;
  const r = { Digit1: "vertex", Digit2: "edge", Digit3: "face", Digit4: "object" };
  if (r[o] || !o.startsWith("Numpad") && ["1", "2", "3", "4"].includes(a))
    return e.setSelectMode(r[o] || { 1: "vertex", 2: "edge", 3: "face", 4: "object" }[a]), !0;
  if (o === "Numpad0")
    return e.setViewMode("camera"), !0;
  if (o === "Numpad1")
    return e.setViewMode(t.ctrlKey || t.metaKey ? "back" : "front"), !0;
  if (o === "Numpad3")
    return e.setViewMode(t.ctrlKey || t.metaKey ? "left" : "right"), !0;
  if (o === "Numpad7")
    return e.setViewMode(t.ctrlKey || t.metaKey ? "bottom" : "top"), !0;
  if (o === "Numpad9")
    return e.setViewMode("bottom"), !0;
  if (o === "Numpad5")
    return e.setViewMode(e.state.view_mode === "camera" ? "perspective" : "camera"), !0;
  if (a === "h" && !t.ctrlKey && !t.metaKey && !t.altKey)
    return !t.repeat && e.selectedEntity === "object" && e.selectedObjectId && e.toggleObject(e.selectedObjectId), !0;
  if (t.key === "Delete" || t.key === "Backspace")
    return t.repeat || (e.selectedEntity === "object" && e.selectedObjectId ? e.deleteObject(e.selectedObjectId) : e.selectedEntity === "camera" && e.deleteCamera(e.state.active_camera_id)), !0;
  if (["w", "a", "s", "d", "q", "e"].includes(a) && e.isNavigatingFly) {
    const n = e.viewportCamera(), s = e.state.view_mode !== "camera", { right: i, up: l, forward: m } = L(n), c = (t.shiftKey ? 0.6 : 0.18) * e.cameraSpeed, p = { w: C(m, c), s: C(m, -c), d: C(i, c), a: C(i, -c), e: C(l, c), q: C(l, -c) }[a];
    return s || e.beginCameraEdit(), n.position = M(n.position, p), n.target = M(n.target, p), s ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit()), !0;
  }
  return !1;
}
function Or(e, t) {
  const a = t.key.toLowerCase(), o = t.code;
  if (a === "i" || a === "k")
    return t.repeat || e.insertKeyframe(), !0;
  if (t.key === "Delete" || t.key === "Backspace")
    return !t.repeat && e.selectedKeyframe() && e.deleteKeyframe(), !0;
  if (t.key === "ArrowUp" || t.shiftKey && t.key === "ArrowRight" || a === "." && o !== "NumpadDecimal")
    return e.goToAdjacentKey(1), !0;
  if (t.key === "ArrowDown" || t.shiftKey && t.key === "ArrowLeft" || a === ",")
    return e.goToAdjacentKey(-1), !0;
  if (t.key === "ArrowLeft")
    return e.setFrame(e.frame - 1), !0;
  if (t.key === "ArrowRight")
    return e.setFrame(e.frame + 1), !0;
  if (t.key === "Home")
    return e.selectKeyframe(e.timelineKeyframes()[0]), !0;
  if (t.key === "End") {
    const r = e.timelineKeyframes();
    return e.selectKeyframe(r[r.length - 1]), !0;
  }
  return !1;
}
function Ve(e) {
  e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render();
}
function Pr(e, t) {
  const a = t.key.toLowerCase();
  if (t.key === "ArrowLeft")
    return e.setFrame(e.frame - 1), !0;
  if (t.key === "ArrowRight")
    return e.setFrame(e.frame + 1), !0;
  if (t.key === "Home")
    return e.setFrame(0), !0;
  if (t.key === "End")
    return e.setFrame(e.state.duration_frames - 1), !0;
  if (a === "s" || a === "a")
    return t.repeat || (!Ce(e.state).length || a === "a" ? (e.checkpoint("Auto-split shots"), e.state.sequence = { ...e.state.sequence || { recording_path: "" }, enabled: !0, cuts: Za(e.state) }, Ve(e)) : (e.checkpoint("Split shot"), Ja(e.state, e.frame, null) ? Ve(e) : e.setStatus("Move the playhead inside a shot first"))), !0;
  if (t.key === "Delete" || t.key === "Backspace") {
    if (t.repeat) return !0;
    const o = Ce(e.state), r = Mt(e.state, e.frame), n = r ? o.findIndex((s) => s.start === r.start) : -1;
    return n >= 0 && (e.checkpoint("Remove shot"), eo(e.state, n) && Ve(e)), !0;
  }
  return !1;
}
function ot(e, t) {
  let a = !1;
  const o = e.onRemoved, r = function(...s) {
    a = !0, o?.apply(this, s);
  };
  r.__omnicamShim = !0, e.onRemoved = r;
  const n = () => {
    e.onRemoved?.__omnicamShim && (e.onRemoved = o);
  };
  return t().then((s) => {
    n(), !a && s(e);
  }).catch((s) => {
    n(), console.error("OmniCam: node UI failed to load", s);
  });
}
const Xe = "MajoorOmniCamDirector", Ye = "MajoorOmniCamExtractor", Ze = "MajoorOmniCamMonitor";
function Pe(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.type || "");
}
const Fa = {
  [Xe]: { default: [1313, 1633], min: [760, 760] },
  [Ye]: { default: [761, 1458], min: [700, 760] },
  [Ze]: { default: [798, 1634], min: [640, 680] }
}, zr = 0.92, Nr = 0.88;
function Rr([e, t], [a, o]) {
  if (typeof window > "u") return [e, t];
  const r = Math.round((window.innerWidth || e) * zr), n = Math.round((window.innerHeight || t) * Nr);
  return [
    Math.max(a, Math.min(e, r)),
    Math.max(o, Math.min(t, n))
  ];
}
function Fr(e, t) {
  const a = Fa[t];
  return !a || !e?.setSize ? !1 : (e.setSize(Rr(a.default, a.min)), !0);
}
function Lr(e, t, a) {
  const o = Fa[t];
  if (!o || !e?.setSize) return !1;
  const r = Array.isArray(a) ? a : Array.isArray(e.size) ? e.size : [0, 0], n = Array.isArray(e.size) ? e.size : [0, 0], [s, i] = o.min, l = Math.max(Number(r[0]) || 0, s), m = Math.max(Number(r[1]) || 0, i);
  return l === n[0] && m === n[1] ? !1 : (e.setSize([l, m]), !0);
}
const _t = "oc-help-css", we = "#8b7bd8", La = /* @__PURE__ */ new Map();
function rt(e, t) {
  e && t && La.set(e, t);
}
function Qe(e) {
  return e && La.get(e) || null;
}
const Kr = `
.oc-help-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;
  align-items:center;justify-content:center;z-index:10000;font:12px/1.35 system-ui,
  -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.oc-help-card{background:#1a1a21;border:1px solid #2c2c38;border-radius:10px;
  width:min(680px,92vw);max-height:82vh;display:flex;flex-direction:column;
  box-shadow:0 14px 52px rgba(0,0,0,.6);overflow:hidden;color:#e6e6f0;
  animation:oc-help-in .14s ease}
@keyframes oc-help-in{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
.oc-help-header{display:flex;align-items:center;gap:10px;padding:12px 14px;
  border-bottom:1px solid #2c2c38;flex:none}
.oc-help-h-icon{width:18px;height:18px;flex:none;border-radius:50%;background:${we};
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px}
.oc-help-h-title{flex:1;font-size:14px;font-weight:650;color:#fff;line-height:1.2}
.oc-help-close{flex:none;width:24px;height:24px;border-radius:6px;border:none;
  background:rgba(255,255,255,.06);color:#9a9aad;cursor:pointer;font-size:14px;
  line-height:1;display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s}
.oc-help-close:hover{background:${we};color:#fff}
.oc-help-body{padding:13px 15px 15px;overflow-y:auto;font-size:12px;line-height:1.55}
.oc-help-section{margin-bottom:14px}
.oc-help-section:last-child{margin-bottom:0}
.oc-help-h{margin:0 0 6px;font-size:10px;font-weight:700;color:${we};
  text-transform:uppercase;letter-spacing:.06em}
.oc-help-p{margin:0 0 6px;white-space:pre-wrap;color:#cfcfd6}
.oc-help-p:last-child{margin-bottom:0}
.oc-help-ul{margin:0;padding-left:18px}
.oc-help-ul li{margin:0 0 4px}
.oc-help-defs{display:grid;grid-template-columns:auto 1fr;gap:5px 12px;align-items:baseline}
.oc-help-defs dt{color:#fff;font-weight:600;white-space:nowrap}
.oc-help-defs dd{margin:0;color:#b8b8c4}
.oc-help code{background:rgba(255,255,255,.08);border-radius:3px;padding:1px 5px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#d4cdfa}
.oc-help-tip{margin-top:2px;padding:8px 10px;background:rgba(139,123,216,.12);
  border-left:2px solid ${we};border-radius:3px;color:#ddd;font-size:11.5px}
`;
function Vr() {
  if (document.getElementById(_t)) return;
  const e = document.createElement("style");
  e.id = _t, e.textContent = Kr, document.head.appendChild(e);
}
function J(e) {
  return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`([^`]+)`/g, (a, o) => `<code>${o}</code>`);
}
function Gr(e) {
  const t = document.createElement("div");
  if (t.className = "oc-help-section", e.heading) {
    const a = document.createElement("div");
    a.className = "oc-help-h", a.textContent = e.heading, t.appendChild(a);
  }
  if (e.body)
    for (const a of String(e.body).split(/\n\s*\n/)) {
      const o = document.createElement("p");
      o.className = "oc-help-p", o.innerHTML = J(a), t.appendChild(o);
    }
  if (Array.isArray(e.bullets) && e.bullets.length) {
    const a = document.createElement("ul");
    a.className = "oc-help-ul";
    for (const o of e.bullets) {
      const r = document.createElement("li");
      r.innerHTML = J(o), a.appendChild(r);
    }
    t.appendChild(a);
  }
  if (Array.isArray(e.defs) && e.defs.length) {
    const a = document.createElement("dl");
    a.className = "oc-help-defs";
    for (const o of e.defs) {
      const [r, n] = Array.isArray(o) ? o : [o, ""], s = document.createElement("dt");
      s.innerHTML = J(r);
      const i = document.createElement("dd");
      i.innerHTML = J(n), a.appendChild(s), a.appendChild(i);
    }
    t.appendChild(a);
  }
  return t;
}
let pe = null;
function Br() {
  pe && pe();
}
function vt(e) {
  e = e || {}, Vr(), Br();
  const t = document.createElement("div");
  t.className = "oc-help-backdrop";
  const a = document.createElement("div");
  a.className = "oc-help-card oc-help", t.appendChild(a);
  const o = document.createElement("div");
  o.className = "oc-help-header";
  const r = document.createElement("span");
  r.className = "oc-help-h-icon", r.textContent = "?";
  const n = document.createElement("div");
  n.className = "oc-help-h-title", n.textContent = e.title || "Help";
  const s = document.createElement("button");
  s.className = "oc-help-close", s.type = "button", s.textContent = "✕", s.title = "Close (Esc)", o.appendChild(r), o.appendChild(n), o.appendChild(s), a.appendChild(o);
  const i = document.createElement("div");
  if (i.className = "oc-help-body", e.tagline) {
    const d = document.createElement("p");
    d.className = "oc-help-p", d.style.color = "#e6e6e6", d.innerHTML = J(e.tagline), i.appendChild(d);
  }
  const l = Array.isArray(e.sections) ? e.sections : [];
  for (const d of l)
    try {
      i.appendChild(Gr(d));
    } catch (u) {
      console.warn("[OmniCam] help: skipped a malformed section", u);
    }
  if (e.footer) {
    const d = document.createElement("div");
    d.className = "oc-help-tip", d.innerHTML = J(e.footer), i.appendChild(d);
  }
  a.appendChild(i);
  let m = !1;
  const c = () => {
    document.removeEventListener("keydown", p, !0), t.remove(), pe === c && (pe = null);
  };
  pe = c;
  const p = (d) => {
    d.key === "Escape" && (d.stopPropagation(), d.preventDefault(), c());
  };
  return document.addEventListener("keydown", p, !0), s.addEventListener("click", (d) => {
    d.stopPropagation(), c();
  }), t.addEventListener("mousedown", (d) => {
    m = d.target === t;
  }), t.addEventListener("click", (d) => {
    d.target === t && m && c(), m = !1;
  }), a.addEventListener("mousedown", (d) => d.stopPropagation()), document.body.appendChild(t), c;
}
rt("MajoorOmniCamDirector", {
  title: "OmniCam Director",
  tagline: "Interactive motion-scene authoring: block cameras and tracks in a live 3D viewport and record a clean playblast.",
  sections: [
    {
      heading: "What it does",
      body: "The Director opens a full 3D viewport on the node's face. You place cameras and reference objects, pose the frame, draw or project motion tracks, and record keyframes as you scrub the timeline. The result is a model-independent OmniCam MotionScene plus an optional neutral-grey playblast video."
    },
    {
      heading: "Basic workflow",
      bullets: [
        "Compose a frame in the viewport.",
        "Press `I` to insert a keyframe at the current time.",
        "Scrub the timeline, move the camera, press `I` again.",
        "Press `Space` to preview the move inside the viewport.",
        "Click `Playblast` to record the proxy reference video."
      ]
    },
    {
      heading: "Output",
      defs: [
        ["motion_scene", "Cameras, objects, normalized motion layers, cuts and authoring timeline."],
        ["playblast_video", "Optional clean playblast used as a model-motion reference."],
        ["audio", "Associated audio, passed through without model-specific processing."]
      ]
    }
  ],
  footer: "An Extractor MotionScene can be connected to Director and imported as a new editable camera."
});
rt("MajoorOmniCamExtractor", {
  title: "OmniCam Extractor",
  tagline: "Solve a real video's camera motion into a canonical OmniCam MotionScene, ready for Director.",
  sections: [
    {
      heading: "What it does",
      body: "Extracts a relative 6DoF camera trajectory from one continuous video shot: DPVO by default (deep visual odometry), or pycolmap / OpenCV as alternatives with different tradeoffs -- see `method` below. The validated solve remains an internal camera primitive and is wrapped in a one-camera MotionScene for the Director.\n\nThe video must be a single continuous shot - hard cuts are reported in the output, not stitched across."
    },
    {
      heading: "Tracking without a queue",
      body: "The node's own face carries a matchmove panel: `TRACK` starts solving immediately, with no ComfyUI prompt queued and no model loaded. It works on a connected Load Video, a file picked through the panel, or a VIDEO already materialized by a previous execution -- never on an in-memory batch that has not run yet, which the panel says plainly rather than guessing.\n\nThe job moves PREPARING -> TRACKING -> SOLVING -> REFINING -> COMPLETED, with STOP cooperative rather than a kill: the solver is asked to stop between safe frames, so nothing force-destroys a CUDA context mid-solve. The VIDEO tab shows the footage with live solver points overlaid as it tracks; TRACK 3D shows the solved path, read-only."
    },
    {
      heading: "Key inputs (queued execution)",
      defs: [
        ["video", "One continuous shot to solve."],
        ["method", "`dpvo` is the default and does not fall back -- it errors if DPVO is not installed. `auto` tries DPVO, then `pycolmap`, then `opencv_sift`, taking the first one actually installed. `pycolmap` runs Structure-from-Motion (bundle adjustment over the whole shot) rather than frame-to-frame odometry: slower, but it does not zero out translation on a low-parallax or rotation-only segment the way `opencv_sift` does. Installing it is one `pip install pycolmap` -- no compiler, unlike DPVO."],
        ["lens_mode", "How the lens is described: `auto`, an explicit field of view, or a focal length + sensor width."],
        ["motion_scale", "Monocular solves have no metric scale; this rescales the recovered translation to fit your scene."],
        ["simplify_keys", "Reduces the solved path to a sparser, easier-to-edit set of keyframes within the given tolerances."]
      ]
    },
    {
      heading: "Outputs",
      defs: [
        ["motion_scene", "A canonical one-camera OmniCam MotionScene containing the solved trajectory."],
        ["solver_coverage", "Share of sampled frames that produced a pose; not camera accuracy."],
        ["report", "Human-readable notes: detected cuts, tracking quality, warnings."]
      ]
    }
  ],
  footer: "Low Solver Coverage usually means low-texture footage, motion blur, or a shot the solver treated as multiple cuts - check report first."
});
rt("MajoorOmniCamMonitor", {
  title: "OmniCam Monitor",
  tagline: "Compile a MotionScene for one video model, and report what the translation cannot carry.",
  sections: [
    {
      heading: "What it does",
      body: `Monitor is the single exit point from OmniCam into the rest of your graph. Pick a target profile; it resolves the frame grid that model needs, compiles the MotionScene into that model's representation, and runs a preflight. Which output carries the payload depends on the profile's semantic, not on the model.

When the connected MotionScene comes straight from a Director, the preflight is live: it updates as you edit, with no queue and no model loaded, because the Director's own state is readable without running the graph. Any other source -- a third-party node, or nothing connected yet -- has no state to preview, and the panel says so rather than showing a stale or invented result; it fills in for real once you queue the workflow.`
    },
    {
      heading: "Choosing a profile",
      defs: [
        ["external_reference_video", "Reference video, unchanged. The default for a new Monitor: no frame grid, no fps conversion, no downstream node required. Passes the playblast straight through for a model with no dedicated profile -- Seedance, Kling, Veo, a private API. Never BLOCKED."],
        ["wan_camera_native", "Camera embedding. Real extrinsics and intrinsics into a native Wan camera embedding. The highest-fidelity path for camera motion; length resolves to 4n+1."],
        ["wan_move_native", "Screen tracks. Native TRACKS tensors for WanMoveTrackToVideo: track_path and track_visibility."],
        ["wan_track_native", "Screen tracks. Trajectory JSON for WanTrackToVideo, on the 121-sample source grid it resamples."],
        ["wanvideo_ati", "Screen tracks. Trajectory JSON for WanVideoATITracks (Wan 2.1 ATI, WanVideoWrapper); a fixed 121 samples."],
        ["ltx25_motion_track", "Screen tracks. Trajectory JSON for LTXVDrawTracks, then IC-LoRA Motion Track; length resolves to 8n+1."],
        ["h3_native", "Reference video. Playblast frames resampled to 24 fps plus a prompt, for MiniMaxH3ReferenceToVideo; length resolves to 17n+5."],
        ["h3_api", "Reference video. The playblast as a VIDEO plus a prompt, for MinimaxHailuo03ReferenceNode."]
      ]
    },
    {
      heading: "Outputs",
      body: "Every output is present on the node at once, but only the selected profile's are populated. Camera-embedding profiles fill `camera_embedding`; `wan_move_native` fills `native_tracks`; the other track profiles fill `tracks_json`; reference-video profiles fill `reference_video` or `reference_frames`. `final_prompt`, `target_width`, `target_height` and `target_length` are always filled."
    },
    {
      heading: "Reading the preflight",
      bullets: [
        "BLOCKED stops the compile. It is never cosmetic.",
        "A multi-shot edit blocks camera and track profiles: one camera basis cannot describe an edit that cuts to a second camera. Reference-video profiles accept it, because the playblast carries the cuts, and swap the camera prompt for a neutral one.",
        "'Encodable trajectories' warns when a layer will not survive the JSON track format: hidden on the first sample means dropped, a visibility gap means cut at the gap.",
        "'Downstream contract' checks the node this profile targets. Missing or incompatible blocks; only the selected profile is binding."
      ]
    },
    {
      heading: "Reference source",
      bullets: [
        "The player above the preflight shows the Director's actual recorded playblast, not its live edit viewport -- gizmos and helpers never appear in it.",
        "'Playblast outdated' means the scene changed after this file was recorded: cameras, objects or cuts moved, but the compile still sends the old footage until you re-record. Not shown for playblasts recorded before this check existed -- there is nothing to compare them against."
      ]
    }
  ],
  footer: "Switching profile never changes the MotionScene, only which Monitor output you connect: the compiler is universal, the sockets are typed."
});
const wt = "MajoorOmniCam.ShowHelp", Je = "oc-help-toolbar-icon", St = "oc-help-toolbar-css", qr = "#8b7bd8";
function Hr() {
  if (document.getElementById(St)) return;
  const e = document.createElement("style");
  e.id = St, e.textContent = `
    .${Je}{display:inline-flex;align-items:center;justify-content:center;
      width:16px;height:16px;border-radius:50%;background:${qr};color:#fff;
      font-weight:700;font-size:11px;line-height:1}
    .${Je}::before{content:"?"}
  `, document.head.appendChild(e);
}
function Wr() {
  const e = U.canvas;
  if (!e) return [];
  const t = [];
  if (e.selected_nodes && t.push(...Object.values(e.selected_nodes)), e.selectedItems)
    for (const a of e.selectedItems)
      a && a.comfyClass && t.push(a);
  return t;
}
function $r() {
  for (const e of Wr()) {
    const t = Qe(e.comfyClass);
    if (t) return t;
  }
  return null;
}
U.registerExtension({
  name: "MajoorOmniCam.HelpToolbar",
  commands: [
    {
      id: wt,
      label: "Help",
      icon: Je,
      function: () => {
        const e = $r();
        e && vt(e);
      }
    }
  ],
  // ComfyUI calls this for every extension with the selected canvas item and
  // unions the returned command ids to render in the floating selection
  // toolbar. Never called on older frontends -> the command is registered but
  // simply never shown (harmless).
  getSelectionToolboxCommands(e) {
    const t = e && e.comfyClass;
    return t && Qe(t) ? [wt] : [];
  },
  // Right-click fallback so help is reachable even without the selection
  // toolbar hook.
  getNodeMenuItems(e) {
    const t = Qe(e?.comfyClass);
    return t ? [null, { content: "? Help", callback: () => vt(t) }] : [];
  },
  setup() {
    Hr();
  }
});
Po(Ka);
let ae = !1;
function nt(e, t, a, o) {
  a ? Fr(e, t) : Lr(e, t, o);
}
function st(e) {
  if (typeof e.configure != "function") return () => null;
  let t = null;
  const a = e.configure.bind(e);
  return e.configure = function(o) {
    return t === null && Array.isArray(o?.size) && (t = [...o.size]), a(o);
  }, () => t;
}
function Se(e, t) {
  const a = globalThis.__majoorOmniCamCiTrace;
  Array.isArray(a) && a.push({ stage: e, nodeId: t?.id ?? null, nodeClass: Pe(t), configuringGraph: ae });
}
Tr();
Ha(U);
Uo(U);
U.registerExtension({
  name: "Majoor.OmniCam.Director",
  settings: Vo,
  beforeConfigureGraph() {
    ae = !0;
  },
  afterConfigureGraph() {
    ae = !1;
  },
  async nodeCreated(e) {
    if (Pe(e) !== Xe) return;
    Se("director:nodeCreated", e);
    const t = !ae, a = t ? null : st(e);
    await ot(e, async () => {
      Se("director:import:start", e);
      const { attachDirector: r } = await import("./chunk-D7v2L4KF.js").then((n) => n.f);
      return Se("director:import:resolved", e), r;
    });
    const o = e.__majoorOmniCam;
    o && (Se("director:attach:complete", e), Yo(o), t && Zo(o), nt(e, Xe, t, a?.()));
  }
});
U.registerExtension({
  name: "Majoor.OmniCam.Extractor",
  async nodeCreated(e) {
    if (Pe(e) !== Ye) return;
    const t = !ae, a = t ? null : st(e);
    await ot(e, async () => (await import("./chunk-Dt1dut0O.js")).attachExtractor), e.__majoorOmniCamExtractor && nt(e, Ye, t, a?.());
  }
});
U.registerExtension({
  name: "Majoor.OmniCam.Monitor",
  async nodeCreated(e) {
    if (Pe(e) !== Ze) return;
    const t = !ae, a = t ? null : st(e);
    await ot(e, async () => (await import("./chunk-CB1h4J21.js")).attachMonitor), e.__majoorOmniCamMonitor && nt(e, Ze, t, a?.());
  }
});
export {
  yn as $,
  vn as A,
  wn as B,
  Jr as C,
  F as D,
  M as E,
  tn as F,
  $ as G,
  O as H,
  go as I,
  mn as J,
  de as K,
  C as L,
  je as M,
  me as N,
  io as O,
  te as P,
  L as Q,
  un as R,
  Ua as S,
  Br as T,
  Xo as U,
  Er as V,
  nn as W,
  sn as X,
  cn as Y,
  rn as Z,
  gn as _,
  _ as a,
  bn as a0,
  _n as a1,
  en as a2,
  ro as a3,
  It as a4,
  Ye as a5,
  hn as a6,
  At as b,
  j as c,
  oe as d,
  R as e,
  Ae as f,
  Ce as g,
  Ja as h,
  eo as i,
  Qr as j,
  Za as k,
  Mt as l,
  an as m,
  Zr as n,
  on as o,
  ln as p,
  Fo as q,
  lt as r,
  fe as s,
  qe as t,
  dn as u,
  pn as v,
  fn as w,
  gr as x,
  Na as y,
  Pa as z
};
