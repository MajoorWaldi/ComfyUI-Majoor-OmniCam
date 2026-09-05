import { app as U } from "../../scripts/app.js";
import { api as Ua } from "../../scripts/api.js";
const Xa = "MajoorOmniCam", Ya = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20256%20256'%20role='img'%20aria-labelledby='title'%3e%3ctitle%20id='title'%3eMajoor%20OmniCam%3c/title%3e%3c!--%20Vector%20twin%20of%20web/assets/omnicam-icon.png:%20same%20mark,%20~1%20KB%20so%20the%20eagerly-loaded%20node-branding%20chunk%20stays%20cheap.%20Keep%20the%20two%20in%20sync.%20--%3e%3ccircle%20cx='128'%20cy='128'%20r='102'%20fill='%23031228'/%3e%3ccircle%20cx='128'%20cy='128'%20r='53'%20fill='%23f7f6ff'/%3e%3ccircle%20cx='128'%20cy='128'%20r='43'%20fill='%238873fd'/%3e%3c/svg%3e", import.meta.url).href, B = 20;
let ne = null;
function Za() {
  return ne || typeof Image > "u" || (ne = new Image(), ne.src = Ya), ne;
}
function Qa() {
  const t = Date.now() % 2600 / 2600;
  return 0.12 + 0.1 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2));
}
function Ja(e) {
  e.registerExtension({
    name: "MajoorOmniCam.NodeBranding",
    beforeRegisterNodeDef(t, a) {
      if (!String(a?.name || a?.node_id || t?.comfyClass || t?.type || "").startsWith(Xa)) return;
      const r = t.prototype.onDrawForeground;
      t.prototype.onDrawForeground = function(n) {
        if (r?.apply(this, arguments), this.flags?.collapsed) return;
        const s = Za();
        if (!s?.complete || !s.naturalWidth) return;
        const i = Math.max(4, Number(this.size?.[0] || 160) - B - 6), c = -26, m = i + B / 2, l = c + B / 2;
        if (n.save(), this.selected) {
          const d = Qa(), p = n.createRadialGradient(m, l, B * 0.35, m, l, B * 1.15);
          p.addColorStop(0, `rgba(136, 115, 253, ${d})`), p.addColorStop(1, "rgba(136, 115, 253, 0)"), n.fillStyle = p, n.beginPath(), n.arc(m, l, B * 1.15, 0, Math.PI * 2), n.fill();
        }
        n.globalAlpha = 0.96, n.drawImage(s, i, c, B, B), n.restore();
      };
    }
  });
}
const rt = "en", ke = /* @__PURE__ */ new Map([[rt, {}]]);
function eo(e, t) {
  ke.set(e, { ...ke.get(e) || {}, ...t || {} });
}
let $e = rt;
function to(e) {
  ke.has(e) && ($e = e);
}
function w(e) {
  return $e === rt ? e : ke.get($e)?.[e] || e;
}
const ao = "__sequence__";
function oo() {
  return { enabled: !1, cuts: [], recording_path: "" };
}
function ro(e, t = []) {
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
function je(e) {
  const t = Math.max(0, (e?.duration_frames || 1) - 1), a = (e?.sequence?.cuts || []).filter((o) => o.start <= t);
  return a.map((o, r) => ({
    camera_id: o.camera_id,
    start: o.start,
    end: r + 1 < a.length ? a[r + 1].start - 1 : t
  }));
}
function pn(e) {
  return !!e?.sequence?.enabled && je(e).length > 0;
}
function Tt(e, t) {
  const a = je(e);
  if (!a.length) return null;
  const o = Math.max(0, Math.round(Number(t) || 0));
  for (let r = a.length - 1; r >= 0; r--)
    if (o >= a[r].start) return a[r];
  return a[0];
}
function no(e) {
  const t = e?.cameras || [], a = Math.max(0, (e?.duration_frames || 1) - 1);
  if (!t.length) return [];
  const o = (a + 1) / t.length, r = t.map((s, i) => ({
    camera_id: s.id,
    start: i === 0 ? 0 : Math.round(i * o)
  })), n = /* @__PURE__ */ new Set();
  return r.filter((s) => s.start > a || n.has(s.start) ? !1 : (n.add(s.start), !0));
}
function fn(e, t, a) {
  const o = e?.sequence?.cuts || [];
  if (t <= 0 || t >= o.length) return !1;
  const r = o[t - 1].start + 1, n = (t + 1 < o.length ? o[t + 1].start : e.duration_frames || 1) - 1;
  if (n < r) return !1;
  const s = Math.max(r, Math.min(n, Math.round(Number(a) || 0)));
  return s === o[t].start ? !1 : (o[t].start = s, !0);
}
function so(e, t) {
  const a = e?.cameras || [];
  if (!a.length) return t;
  const o = a.findIndex((r) => r.id === t);
  return a[(o + 1) % a.length].id;
}
function io(e, t, a = null) {
  const o = e?.sequence?.cuts || [], r = Math.max(0, Math.round(Number(t) || 0));
  if (!o.length || r <= 0 || o.some((i) => i.start === r)) return !1;
  const s = Tt(e, r)?.camera_id || o[0].camera_id;
  return o.push({ camera_id: a || so(e, s), start: r }), o.sort((i, c) => i.start - c.start), !0;
}
function co(e, t) {
  const a = e?.sequence?.cuts || [];
  return t < 0 || t >= a.length || a.length === 1 ? !1 : (a.splice(t, 1), a.length && (a[0].start = 0), !0);
}
const Et = Object.freeze(["select", "track", "anchor", "project", "erase"]), It = Object.freeze(["manual_2d", "static_anchor", "world_point", "object_point", "camera_field"]), At = Object.freeze(["linear", "smooth", "hold"]), le = (e, t = 0) => Number.isFinite(Number(e)) ? Number(e) : t, pt = (e) => Math.max(0, Math.min(1, le(e)));
function lo(e, t) {
  return {
    time_seconds: Math.max(0, Math.min(t, le(e?.time_seconds))),
    x: pt(e?.x),
    y: pt(e?.y),
    visible: e?.visible !== !1,
    interpolation: At.includes(e?.interpolation) ? e.interpolation : "linear"
  };
}
function mo(e) {
  const t = Math.max(1 / Math.max(1, le(e.fps, 24)), le(e.duration_frames, 120) / Math.max(1, le(e.fps, 24))), a = /* @__PURE__ */ new Set();
  return e.motion_layers = (Array.isArray(e.motion_layers) ? e.motion_layers : []).slice(0, 256).map((o, r) => {
    let n = String(o?.id || `motion_${r + 1}`);
    a.has(n) && (n = `motion_${r + 1}`), a.add(n);
    const s = It.includes(o?.source_kind) ? o.source_kind : "manual_2d", i = (Array.isArray(o?.keys) ? o.keys : []).slice(0, 1e4).map((c) => lo(c, t)).sort((c, m) => c.time_seconds - m.time_seconds);
    return {
      id: n,
      label: String(o?.label || `Motion ${r + 1}`).slice(0, 80),
      enabled: o?.enabled !== !1,
      semantic: "screen_point",
      source_kind: s,
      keys: i,
      source: o?.source && typeof o.source == "object" ? { ...o.source } : {}
    };
  }).filter((o) => o.keys.length), e.motion_tool = Et.includes(e.motion_tool) ? e.motion_tool : "select", e.selected_motion_layer_id = e.motion_layers.some((o) => o.id === e.selected_motion_layer_id) ? e.selected_motion_layer_id : e.motion_layers[0]?.id || null, e;
}
function po(e) {
  const t = String(e || "").trim().replaceAll("\\", "/");
  if (!t || t.length > 1024 || t.includes("\0") || t.includes("://")) return null;
  const a = t.match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/);
  if (!a) return null;
  const o = String(a[1] || "").replace(/^\/+/, "");
  if (!o || /^[A-Za-z]:/.test(o) || o.split("/").some((i) => i === "..")) return null;
  const r = o.lastIndexOf("/"), n = r >= 0 ? o.slice(r + 1) : o, s = r >= 0 ? o.slice(0, r) : "";
  return !n || n === "." ? null : { filename: n, subfolder: s, type: a[2] || "input" };
}
function fo(e, t) {
  const a = po(t);
  if (!a) return "";
  const o = `/view?filename=${encodeURIComponent(a.filename)}&subfolder=${encodeURIComponent(a.subfolder)}&type=${encodeURIComponent(a.type)}`;
  return e?.apiURL ? e.apiURL(o) : o;
}
function un(e) {
  return fo({ apiURL: Ot }, e);
}
let Ot = (e) => e;
const Ve = /* @__PURE__ */ new WeakMap();
function hn({ api: e }) {
  Ot = (t) => e.apiURL ? e.apiURL(t) : t;
}
function uo(e, t, a) {
  const o = e.keyframes, r = Ve.get(e);
  if (r?.source === o && a >= r.frame && r.index < t.length - 1) {
    let s = r.index;
    for (; s + 1 < t.length - 1 && a >= t[s + 1].frame; ) s += 1;
    if (t[s].frame < a && a < t[s + 1].frame)
      return Ve.set(e, { source: o, frame: a, index: s }), { leftIndex: s, left: t[s], right: t[s + 1] };
  }
  const n = nt(t, a);
  return Ve.set(e, { source: o, frame: a, index: n?.leftIndex ?? 0 }), n;
}
function L(e) {
  const t = E(e.target, e.position), a = Math.sqrt(ee(t, t)) < 1e-6 ? [0, 0, -1] : de(t);
  let o = e.up || [0, 1, 0], r = me(a, o);
  Math.sqrt(ee(r, r)) < 1e-6 && (o = Math.abs(a[1]) > 0.9 ? [0, 0, a[1] > 0 ? -1 : 1] : [0, 1, 0], r = me(a, o)), r = de(r);
  let n = de(me(r, a));
  if (Math.abs(e.roll || 0) > 1e-9) {
    const s = e.roll * Math.PI / 180, i = Math.cos(s), c = Math.sin(s), m = C(D(r, i), D(n, c));
    n = C(D(n, i), D(r, -c)), r = m;
  }
  return { right: r, up: n, forward: a };
}
function gn(e) {
  const t = E(e.target, e.position), a = G(t), o = a < 1e-6 ? [0, 0, -1] : D(t, 1 / a), r = Math.asin(k(o[1], -1, 1)) * 180 / Math.PI, n = Math.atan2(o[0], -o[2]) * 180 / Math.PI;
  return [r, n, e.roll || 0];
}
function yn(e, t) {
  const [a, o, r] = t, n = Math.max(1e-4, G(E(e.target, e.position))), s = a * Math.PI / 180, i = o * Math.PI / 180, c = [Math.sin(i) * Math.cos(s), Math.sin(s), -Math.cos(i) * Math.cos(s)];
  e.target = C(e.position, D(c, n)), e.roll = r;
}
function R(e, t, a, o) {
  const { right: r, up: n, forward: s } = L(t), i = E(e, t.position), c = ee(i, s);
  if (c <= Math.max(1e-4, t.near || 0.01) || c >= (t.far || 1e4)) return null;
  const m = ee(i, r), l = ee(i, n);
  if (t.camera_type === "orthographic") {
    const p = 5 / Math.max(0.01, t.zoom || 1), f = p * a / Math.max(1, o);
    return [a * (0.5 + m / (2 * f)), o * (0.5 - l / (2 * p)), c];
  }
  const d = 0.5 * o / Math.tan(Math.max(1e-3, t.fov) * Math.PI / 360);
  return [a * 0.5 + m * d / c, o * 0.5 - l * d / c, c];
}
function fe(e, t, a = null) {
  const o = (e.keyframes || []).map((h) => ({
    ...h,
    camera: F(h.camera || h || e.camera || te())
  }));
  if (!o.length) return F(e.camera || te());
  const r = uo(e, o, t), n = A(o, t, "pos_x", (h) => (h.camera || h).position[0], !1, r), s = A(o, t, "pos_y", (h) => (h.camera || h).position[1], !1, r), i = A(o, t, "pos_z", (h) => (h.camera || h).position[2], !1, r);
  let c = A(o, t, "target_x", (h) => (h.camera || h).target[0], !1, r), m = A(o, t, "target_y", (h) => (h.camera || h).target[1], !1, r), l = A(o, t, "target_z", (h) => (h.camera || h).target[2], !1, r);
  const d = e.constraints?.look_at, f = d?.status === void 0 || d?.status === "active" ? d?.object_id || e.target_object_id || e.camera?.target_object_id : null, u = a || e.objects;
  if (f && Array.isArray(u)) {
    const h = u.find((S) => S.id === f);
    if (h && h.enabled !== !1) {
      const S = Pt(u, h, t), T = d?.offset || e.target_offset || e.camera?.target_offset || [0, 0, 0];
      c = (S.position?.[0] ?? 0) + (T[0] || 0), m = (S.position?.[1] ?? 1.5) + (T[1] || 0), l = (S.position?.[2] ?? 0) + (T[2] || 0);
    }
  }
  const g = A(o, t, "fov", (h) => Number((h.camera || h).fov ?? 35), !1, r), b = A(o, t, "roll", (h) => Number((h.camera || h).roll ?? 0), !0, r), y = A(o, t, "zoom", (h) => Number((h.camera || h).zoom ?? 1), !1, r), _ = A(o, t, "near", (h) => Number((h.camera || h).near ?? 0.01), !1, r), v = A(o, t, "far", (h) => Number((h.camera || h).far ?? 1e4), !1, r), x = o[0]?.camera || o[0] || te();
  let M = o[0];
  for (const h of o)
    if ((h.frame ?? 0) <= t) M = h;
    else break;
  const j = (M.camera || M).camera_type;
  return {
    position: [n, s, i],
    target: [c, m, l],
    fov: k(g, 5, 150),
    roll: b,
    camera_type: j || "perspective",
    zoom: Math.max(0.01, y),
    near: Math.max(1e-4, _),
    far: Math.max(_ + 1e-4, v),
    ...x.up ? { up: [...x.up] } : {}
  };
}
const k = (e, t, a) => Math.max(t, Math.min(a, e)), ho = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, se = (e, t = null) => typeof e == "string" && ho.test(e.trim()) ? e.trim() : t, C = (e, t) => [e[0] + t[0], e[1] + t[1], e[2] + t[2]], E = (e, t) => [e[0] - t[0], e[1] - t[1], e[2] - t[2]], D = (e, t) => [e[0] * t, e[1] * t, e[2] * t], ee = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2], me = (e, t) => [e[1] * t[2] - e[2] * t[1], e[2] * t[0] - e[0] * t[2], e[0] * t[1] - e[1] * t[0]], G = (e) => Math.sqrt(Math.max(1e-12, ee(e, e))), de = (e) => D(e, 1 / G(e));
function go(e, t, a) {
  const o = [a[0] - t[0], a[1] - t[1]], r = [e[0] - t[0], e[1] - t[1]], n = Math.max(1e-9, o[0] * o[0] + o[1] * o[1]), s = k((r[0] * o[0] + r[1] * o[1]) / n, 0, 1);
  return Math.hypot(e[0] - t[0] - o[0] * s, e[1] - t[1] - o[1] * s);
}
function yo(e, t = "ease") {
  return e = k(e, 0, 1), t === "hold" ? 0 : t === "linear" ? e : t === "ease_in" ? e * e : t === "ease_out" ? 1 - (1 - e) * (1 - e) : t === "smooth" ? e * e * e * (e * (e * 6 - 15) + 10) : t === "bezier" ? 0.15 * (1 - e) * (1 - e) * e + 2.85 * (1 - e) * e * e + e * e * e : e * e * (3 - 2 * e);
}
const bo = ["auto", "vector", "free", "aligned", "flat"];
function _o(e, t) {
  const a = e?.tangents;
  return !a || typeof a != "object" ? {} : a.channels && typeof a.channels == "object" && a.channels[t] ? a.channels[t] : a;
}
function ft(e, t, a, o, r) {
  const n = _o(e, t), s = bo.includes(n.mode) ? n.mode : e?.tangents?.mode || "auto", i = r ? r(e) : 0, c = a && r ? r(a) : i, m = o && r ? r(o) : i, l = Math.max(1e-6, e.frame - (a?.frame ?? e.frame - 1)), d = Math.max(1e-6, (o?.frame ?? e.frame + 1) - e.frame), p = () => {
    const _ = (i - c) / l, v = (m - i) / d;
    let x = (_ + v) * 0.5;
    return a ? o || (x = _) : x = v, _ * v <= 0 && a && o && (x = 0), {
      out_x: 1 / 3,
      out_y: x * d * (1 / 3),
      in_x: -1 / 3,
      in_y: -x * l * (1 / 3)
    };
  };
  if (s === "vector") {
    const _ = (i - c) / l, v = (m - i) / d;
    return {
      out_x: 1 / 3,
      out_y: v * d * (1 / 3),
      in_x: -1 / 3,
      in_y: -_ * l * (1 / 3),
      mode: s
    };
  }
  if (s === "flat")
    return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: s };
  if (s === "auto")
    return { ...p(), mode: s };
  const f = p(), u = k(Number(n.out_x ?? f.out_x), 0.01, 0.99), g = Number(n.out_y ?? f.out_y);
  let b = k(Number(n.in_x ?? f.in_x), -0.99, -0.01), y = Number(n.in_y ?? f.in_y);
  if (s === "aligned") {
    const _ = Math.hypot(u, g) || 1e-6, v = Math.hypot(b, y) || 1e-6;
    b = -u / _ * v, y = -g / _ * v;
  }
  return { out_x: u, out_y: g, in_x: b, in_y: y, mode: s };
}
function nt(e, t) {
  if (!e.length || t <= e[0].frame || t >= e[e.length - 1].frame) return null;
  let a = 0, o = e.length - 1;
  for (; a + 1 < o; ) {
    const r = a + o >> 1;
    e[r].frame <= t ? a = r : o = r;
  }
  return { leftIndex: a, left: e[a], right: e[a + 1] };
}
function A(e, t, a, o, r = !1, n = null) {
  if (!e.length) return 0;
  if (t <= e[0].frame) return o(e[0]);
  if (t >= e[e.length - 1].frame) return o(e[e.length - 1]);
  const s = n || nt(e, t), { leftIndex: i, left: c, right: m } = s, l = i > 0 ? e[i - 1] : null, d = i + 2 < e.length ? e[i + 2] : null, p = Math.max(1, m.frame - c.frame), f = k((t - c.frame) / p, 0, 1);
  let u = o(c), g = o(m);
  if (r) {
    const _ = ((g - u + 540) % 360 + 360) % 360 - 180;
    g = u + _;
  }
  if (c.interpolation === "bezier" || m.interpolation === "bezier") {
    const _ = ft(c, a, l, m, o), v = ft(m, a, c, d, o), x = u, M = u + (_.out_y || 0), j = g + (v.in_y || 0), h = g, S = k(Number(_.out_x ?? 1 / 3), 0, 1), T = k(1 + Number(v.in_x ?? -1 / 3), 0, 1);
    let N = 0, X = 1;
    for (let dt = 0; dt < 32; dt++) {
      const K = (N + X) * 0.5, Le = 1 - K;
      3 * Le * Le * K * S + 3 * Le * K * K * T + K * K * K < f ? N = K : X = K;
    }
    const W = (N + X) * 0.5, Y = 1 - W;
    return Y * Y * Y * x + 3 * Y * Y * W * M + 3 * Y * W * W * j + W * W * W * h;
  }
  const y = yo(f, c.interpolation);
  return u + (g - u) * y;
}
function te() {
  return { position: [6, 4, 6], target: [0, 1.5, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 };
}
function Te() {
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
function Ne(e, t) {
  const a = e.keyframes || [];
  if (!a.length) return oe(e);
  const o = oe(e), r = (y, _) => (y.transform?.position || o.position)[_] ?? 0, n = (y, _) => (y.transform?.rotation || o.rotation)[_] ?? 0, s = (y, _) => (y.transform?.size || o.size)[_] ?? (_ === 2 ? 0.01 : 1), i = nt(a, t), c = A(a, t, "pos_x", (y) => r(y, 0), !1, i), m = A(a, t, "pos_y", (y) => r(y, 1), !1, i), l = A(a, t, "pos_z", (y) => r(y, 2), !1, i), d = A(a, t, "rot_x", (y) => n(y, 0), !0, i), p = A(a, t, "rot_y", (y) => n(y, 1), !0, i), f = A(a, t, "rot_z", (y) => n(y, 2), !0, i), u = A(a, t, "scale_x", (y) => s(y, 0), !1, i), g = A(a, t, "scale_y", (y) => s(y, 1), !1, i), b = A(a, t, "scale_z", (y) => s(y, 2), !1, i);
  return {
    position: [Number.isFinite(c) ? c : o.position[0], Number.isFinite(m) ? m : o.position[1], Number.isFinite(l) ? l : o.position[2]],
    rotation: [Number.isFinite(d) ? d : o.rotation[0], Number.isFinite(p) ? p : o.rotation[1], Number.isFinite(f) ? f : o.rotation[2]],
    size: [
      Math.max(0.01, Number.isFinite(u) ? u : o.size[0]),
      Math.max(0.01, Number.isFinite(g) ? g : o.size[1]),
      Math.max(0.01, Number.isFinite(b) ? b : o.size[2])
    ]
  };
}
function bn(e = "balanced", t = "all_views", a = null) {
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
  let i = 0.65, c = 0.72, m = 0.82;
  if (typeof a == "string" && a.startsWith("#")) {
    const p = a.replace("#", "");
    p.length === 6 && (i = parseInt(p.slice(0, 2), 16) / 255, c = parseInt(p.slice(2, 4), 16) / 255, m = parseInt(p.slice(4, 6), 16) / 255);
  }
  const l = 0.618033988749895, d = 0.324717957244746;
  for (let p = 0; p < r; p++) {
    const f = p * l % 1, u = p * d % 1, g = (p + 0.5) * 0.7548776662466927 % 1;
    let b = 0, y = 0, _ = 0, v = 0.65, x = 0.72, M = 0.82;
    if (t === "ground_focus")
      if (f < 0.6) {
        const j = 0.4 + Math.sqrt(u) * 24, h = g * Math.PI * 2 + p * 2.399963229728653;
        b = Math.cos(h) * j, _ = Math.sin(h) * j, y = 0.01 + f * 0.75, v = 0.86, x = 0.9, M = 0.98;
      } else {
        const j = 1 + Math.sqrt(u) * 18, h = g * Math.PI * 2 + p * 2.399963229728653;
        b = Math.cos(h) * j, _ = Math.sin(h) * j, y = 0.75 + (f - 0.6) * 8.5, v = 0.62, x = 0.7, M = 0.82;
      }
    else if (t === "dome") {
      const j = f * Math.PI * 2, h = 1 - 2 * u, S = Math.sqrt(Math.max(0, 1 - h * h)), T = 1.5 + Math.cbrt(g) * 20;
      b = Math.cos(j) * S * T, _ = Math.sin(j) * S * T, y = Math.max(0.01, h * T * 0.75 + 2.5), v = 0.72, x = 0.78, M = 0.88;
    } else {
      const j = p % 4;
      if (j === 0) {
        const h = 0.3 + Math.sqrt(u) * 28, S = p * 2.399963229728653;
        b = Math.cos(S) * h, _ = Math.sin(S) * h, y = 0.01 + g * 0.34, v = 0.9, x = 0.94, M = 1;
      } else if (j === 1) {
        const h = 0.6 + Math.sqrt(u) * 18, S = p * 2.399963229728653;
        b = Math.cos(S) * h, _ = Math.sin(S) * h, y = 0.35 + g * 3.15, v = 0.68, x = 0.76, M = 0.86;
      } else if (j === 2) {
        const h = 2 + Math.sqrt(u) * 24, S = p * 2.399963229728653;
        b = Math.cos(S) * h, _ = Math.sin(S) * h, y = 3.5 + g * 11.5, v = 0.55, x = 0.65, M = 0.78;
      } else {
        const h = 0.5 + u * 6.5, S = p * 2.399963229728653;
        b = Math.cos(S) * h, _ = Math.sin(S) * h, y = 0.05 + g * 4.95, v = 0.8, x = 0.86, M = 0.94;
      }
    }
    n.push(b, y, _), s.push(a ? v * i : v, a ? x * c : x, a ? M * m : M);
  }
  return { points: n, colors: s };
}
function vo() {
  const e = te(), t = [{ frame: 0, camera: F(e), interpolation: "ease" }];
  return {
    schema_version: 1,
    fps: 24,
    duration_frames: 120,
    width: 1280,
    height: 720,
    render_mode: "omni_ref",
    camera: e,
    keyframes: t,
    cameras: [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: F(e), keyframes: t }],
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
    editor_views: Te(),
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
    sequence: oo()
  };
}
function F(e) {
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
  return Number.isFinite(r) ? k(r, a, o) : t;
}
function _n(e) {
  const t = vo();
  if (!e || typeof e != "object") return t;
  const a = { ...t, ...e };
  a.fps = Math.round(ye(a.fps, 24, 1, 120)), a.duration_frames = Math.round(ye(a.duration_frames, 120, 1, ge.maxDurationFrames)), a.width = Math.round(ye(a.width, 1280, 64, 4096)), a.height = Math.round(ye(a.height, 720, 64, 4096));
  const o = (l, d) => (Array.isArray(l) ? l : []).slice(0, ge.maxKeysPerTrack).map((p) => ({
    frame: Math.max(0, Math.round(Number(p.frame || 0))),
    camera: F(p.camera || p || d),
    interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold"].includes(p.interpolation) ? p.interpolation : "ease",
    ...p.tangents && typeof p.tangents == "object" ? { tangents: { ...p.tangents } } : {},
    ...Array.isArray(p.references) ? { references: p.references.map((f) => ({ ...f })) } : {}
  })), r = F(a.camera || t.camera);
  let n = o(a.keyframes, r);
  n = [...new Map(n.map((l) => [l.frame, l])).values()].sort((l, d) => l.frame - d.frame), n.length || (n = [{ frame: 0, camera: F(r), interpolation: "ease" }]);
  const s = Array.isArray(a.cameras) && a.cameras.length ? a.cameras : [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: r, keyframes: n }], i = /* @__PURE__ */ new Set();
  a.cameras = s.slice(0, ge.maxCameras).map((l, d) => {
    let p = String(l?.id || `camera_${d + 1}`);
    i.has(p) && (p = `camera_${d + 1}`), i.add(p);
    const f = F(l?.camera || l?.keyframes?.[0]?.camera || r);
    let u = o(l?.keyframes, f);
    return u = [...new Map(u.map((g) => [g.frame, g])).values()].sort((g, b) => g.frame - b.frame), u.length || (u = [{ frame: 0, camera: F(f), interpolation: "ease" }]), {
      id: p,
      name: String(l?.name || `Camera ${d + 1}`),
      color: se(l?.color),
      camera: f,
      keyframes: u,
      target_object_id: typeof l?.target_object_id == "string" ? l.target_object_id : typeof a.target_object_id == "string" ? a.target_object_id : null,
      target_offset: Array.isArray(l?.target_offset) ? l.target_offset.map(Number) : [0, 0, 0],
      // Bone the camera aims at inside the tracked model; null tracks it whole.
      aim_bone: typeof l?.aim_bone == "string" && l.aim_bone ? l.aim_bone : null,
      locked: !!l?.locked,
      muted: !!l?.muted,
      solo: !!l?.solo,
      recording_path: typeof l?.recording_path == "string" ? l.recording_path : ""
    };
  }), a.active_camera_id = a.cameras.some((l) => l.id === a.active_camera_id) ? a.active_camera_id : a.cameras[0].id, a.sequence = ro(a.sequence, a.cameras.map((l) => l.id)), a.playblast_camera_id = a.playblast_camera_id === ao && a.sequence.cuts.length || a.cameras.some((l) => l.id === a.playblast_camera_id) ? a.playblast_camera_id : a.active_camera_id;
  const c = a.cameras.find((l) => l.id === a.active_camera_id);
  a.camera = c.camera, a.keyframes = c.keyframes, a.target_object_id = c.target_object_id || null, a.target_offset = c.target_offset || [0, 0, 0], a.aim_bone = c.aim_bone || null, a.objects = (Array.isArray(a.objects) ? a.objects : t.objects).slice(0, ge.maxObjects).map((l) => ({
    ...l,
    color: se(l?.color),
    locked: !!l.locked,
    parent_id: typeof l.parent_id == "string" ? l.parent_id : null,
    position: Array.isArray(l.position) ? l.position.map(Number) : [0, 0, 0],
    rotation: Array.isArray(l.rotation) ? l.rotation.map(Number) : [0, 0, 0],
    size: Array.isArray(l.size) ? l.size.length === 2 ? [...l.size.map(Number), 0.01] : l.size.map(Number) : [1, 1, 1],
    material_mode: ["textured", "checker", "neutral", "wireframe"].includes(l.material_mode) ? l.material_mode : "textured",
    keyframes: (Array.isArray(l.keyframes) ? l.keyframes : []).map((d) => ({
      frame: Math.max(0, Math.round(Number(d.frame || 0))),
      transform: oe(d.transform || l),
      interpolation: ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold"].includes(d.interpolation) ? d.interpolation : "ease",
      ...d.tangents && typeof d.tangents == "object" ? { tangents: { ...d.tangents } } : {}
    })).sort((d, p) => d.frame - p.frame)
  })), a.gizmo_mode = ["translate", "rotate", "scale"].includes(a.gizmo_mode) ? a.gizmo_mode : "translate", a.gizmo_space = a.gizmo_space === "local" ? "local" : "world", a.navigation_profile = a.navigation_profile === "blender" ? "blender" : "maya", a.spatial_snap_mode = ["none", "grid", "vertex"].includes(a.spatial_snap_mode) ? a.spatial_snap_mode : "none", a.spatial_grid_size = k(Number(a.spatial_grid_size) || 0.5, 0.01, 100), a.ui_density = ["basic", "animation", "advanced"].includes(a.ui_density) ? a.ui_density : "advanced", a.select_mode = ["object", "vertex", "edge", "face"].includes(a.select_mode) ? a.select_mode : "object", a.show_grid = a.show_grid !== !1, a.show_camera_paths = a.show_camera_paths !== !1, a.show_camera_gizmos = a.show_camera_gizmos !== !1, a.show_look_at = a.show_look_at !== !1, a.show_helper_axes = a.show_helper_axes !== !1, a.show_gizmo = a.show_gizmo !== !1, a.show_wireframe = !!a.show_wireframe, a.show_vertices = !!a.show_vertices, a.point_density = ["none", "0", "sparse", "balanced", "dense", "ultra"].includes(a.point_density) ? a.point_density : "balanced", a.point_spread = ["all_views", "ground_focus", "dome"].includes(a.point_spread) ? a.point_spread : "all_views", a.point_color = se(a.point_color, "#cbd5e1"), a.viewport_bg_color = se(a.viewport_bg_color, "#121212"), a.viewport_bg_image = typeof a.viewport_bg_image == "string" ? a.viewport_bg_image : "", a.viewport_bg_sequence = Array.isArray(a.viewport_bg_sequence) ? a.viewport_bg_sequence.map(String) : [], a.snap_enabled = a.snap_enabled !== !1, a.snap_frames = Math.max(1, Math.round(Number(a.snap_frames) || 1)), a.timecode_mode = ["time", "timecode"].includes(a.timecode_mode) ? a.timecode_mode : "time", a.loop_playback = !!a.loop_playback, a.playback_range = Array.isArray(a.playback_range) && a.playback_range.length === 2 ? [k(Math.round(Number(a.playback_range[0]) || 0), 0, a.duration_frames - 1), k(Math.round(Number(a.playback_range[1]) || a.duration_frames - 1), 0, a.duration_frames - 1)] : null, a.markers = (Array.isArray(a.markers) ? a.markers : []).filter((l) => l && Number.isFinite(Number(l.frame))).map((l, d) => ({ frame: Math.max(0, Math.round(Number(l.frame))), name: String(l.name || `Marker ${d + 1}`).slice(0, 40), color: se(l.color, "#f2d06b") })), a.preview_layout = ["auto", "1", "2", "4"].includes(String(a.preview_layout)) ? String(a.preview_layout) : "auto", a.maximized_camera_id = typeof a.maximized_camera_id == "string" ? a.maximized_camera_id : null, a.safe_areas = !!a.safe_areas, a.resolution_gate = !!a.resolution_gate, a.aspect_ratio = ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"].includes(a.aspect_ratio) ? a.aspect_ratio : "auto", a.auto_key = !!a.auto_key, a.playblast_grid = !!a.playblast_grid, a.playblast_resolution = ["viewport", "half", "output", "double"].includes(a.playblast_resolution) ? a.playblast_resolution : "output", a.reference_index = Math.max(0, Number(a.reference_index || 0)), a.view_mode = ["camera", "perspective", "iso", "front", "back", "top", "right", "left", "bottom"].includes(a.view_mode) ? a.view_mode : "camera", a.camera_view_visible = a.camera_view_visible !== !1;
  const m = Te();
  return a.editor_views = Object.fromEntries(Object.entries(m).map(([l, d]) => [l, F(a.editor_views?.[l] || d)])), mo(a);
}
function Ee(e, t) {
  const [a, o, r] = (t || [0, 0, 0]).map((c) => c * Math.PI / 180);
  let [n, s, i] = e;
  return [s, i] = [s * Math.cos(a) - i * Math.sin(a), s * Math.sin(a) + i * Math.cos(a)], [n, i] = [n * Math.cos(o) + i * Math.sin(o), -n * Math.sin(o) + i * Math.cos(o)], [n, s] = [n * Math.cos(r) - s * Math.sin(r), n * Math.sin(r) + s * Math.cos(r)], [n, s, i];
}
function Ue(e = [0, 0, 0]) {
  const [t, a, o] = e.map((l) => l * Math.PI / 360), r = Math.cos(t), n = Math.sin(t), s = Math.cos(a), i = Math.sin(a), c = Math.cos(o), m = Math.sin(o);
  return [n * s * c + r * i * m, r * i * c - n * s * m, r * s * m + n * i * c, r * s * c - n * i * m];
}
function wo(e, t) {
  return [e[3] * t[0] + e[0] * t[3] + e[1] * t[2] - e[2] * t[1], e[3] * t[1] - e[0] * t[2] + e[1] * t[3] + e[2] * t[0], e[3] * t[2] + e[0] * t[1] - e[1] * t[0] + e[2] * t[3], e[3] * t[3] - e[0] * t[0] - e[1] * t[1] - e[2] * t[2]];
}
function Mo(e, [t, a, o, r]) {
  const [n, s, i] = e, c = r * n + a * i - o * s, m = r * s + o * n - t * i, l = r * i + t * s - a * n, d = -t * n - a * s - o * i;
  return [c * r - d * t - m * o + l * a, m * r - d * a - l * t + c * o, l * r - d * o - c * a + m * t];
}
function So([e, t, a, o]) {
  const r = 1 - 2 * (t * t + a * a), n = 2 * (e * t - a * o), s = 2 * (e * a + t * o), i = 1 - 2 * (e * e + a * a), c = 2 * (t * a - e * o), m = 2 * (t * a + e * o), l = 1 - 2 * (e * e + t * t), d = Math.asin(Math.max(-1, Math.min(1, s))), [p, f] = Math.abs(s) < 0.9999999 ? [Math.atan2(-c, l), Math.atan2(-n, r)] : [Math.atan2(m, i), 0];
  return [p, d, f].map((u) => u * 180 / Math.PI);
}
function zt(e, t) {
  const a = t.quaternion || Ue(t.rotation), o = wo(a, e.quaternion || Ue(e.rotation));
  return { position: C(Mo(e.position.map((r, n) => r * t.size[n]), a), t.position), rotation: So(o), quaternion: o, size: e.size.map((r, n) => r * t.size[n]) };
}
function xo(e, t) {
  const a = new Map(e.map((r) => [r.id, r])), o = (r, n = /* @__PURE__ */ new Set()) => {
    const s = { ...oe(r), quaternion: Ue(r.rotation) };
    if (!r?.id || n.has(r.id)) return s;
    const i = r.parent_id ? a.get(r.parent_id) : null;
    if (!i) return s;
    const c = new Set(n);
    return c.add(r.id), zt(s, o(i, c));
  };
  return o(t);
}
function Pt(e, t, a, o = /* @__PURE__ */ new Set()) {
  const r = Ne(t, a);
  if (!t?.id || o.has(t.id)) return r;
  const n = new Set(o);
  n.add(t.id);
  const s = t.parent_id ? e.find((c) => c.id === t.parent_id) : null;
  if (!s) return r;
  const i = Pt(e, s, a, n);
  return zt(r, i);
}
const ut = ["speed", "angular_speed", "acceleration", "jerk"], Ke = ["ok", "warn", "over"], Nt = 0.8, Co = [0, 1.5, 0];
function ht(e, t) {
  const a = [0];
  for (let o = 1; o < e.length; o++) a.push(Math.abs(e[o] - e[o - 1]) * t);
  return a;
}
function Do(e, t) {
  const a = [0];
  for (let o = 1; o < e.length; o++) {
    const r = e[o - 1].position, n = e[o].position;
    a.push(Math.sqrt((n[0] - r[0]) ** 2 + (n[1] - r[1]) ** 2 + (n[2] - r[2]) ** 2) * t);
  }
  return a;
}
function ko(e, t) {
  const a = [0];
  for (let o = 1; o < e.length; o++) {
    const r = L(e[o - 1]), n = L(e[o]), s = ["right", "up", "forward"].reduce(
      (c, m) => c + r[m][0] * n[m][0] + r[m][1] * n[m][1] + r[m][2] * n[m][2],
      0
    ), i = Math.max(-1, Math.min(1, (s - 1) * 0.5));
    a.push(Math.acos(i) * 180 / Math.PI * t);
  }
  return a;
}
function jo(e, t = null) {
  if (t) return t.map(Number);
  const a = (e.objects || []).find((o) => o?.id === "subject");
  return Array.isArray(a?.position) ? a.position.slice(0, 3).map(Number) : [...Co];
}
function To(e, t, a, o) {
  return e.map((r) => {
    const n = R(t, r, a, o);
    return !!(n && n[0] >= 0 && n[0] < a && n[1] >= 0 && n[1] < o);
  });
}
function gt(e, t) {
  return t == null || t <= 0 ? "ok" : e > t ? "over" : e > t * Nt ? "warn" : "ok";
}
function yt(e) {
  for (let t = Ke.length - 1; t >= 0; t--) if (e.includes(Ke[t])) return Ke[t];
  return "ok";
}
function Eo(e, t) {
  return e.length === t.length && e.every((a, o) => a === t[o]);
}
function Io(e, t) {
  const a = [];
  for (let o = 0; o < e.length; o++) {
    const r = [...t[o]].sort(), n = a[a.length - 1];
    if (n && n.grade === e[o] && Eo(n.metrics, r)) {
      n.end = o;
      continue;
    }
    a.push({ start: o, end: o, grade: e[o], metrics: r });
  }
  return a;
}
function Ft(e, t = {}, a = null, o = "generic") {
  const r = Math.max(1, Number(e.fps) || 24), n = Math.max(1, Number(e.duration_frames) || 1), s = Math.max(1, Number(e.width) || 1280), i = Math.max(1, Number(e.height) || 720), c = [];
  for (let h = 0; h < n; h++) c.push(fe(e, h, e.objects));
  const m = Do(c, r), l = ko(c, r), d = ht(m, r), p = ht(d, r), f = { speed: m, angular_speed: l, acceleration: d, jerk: p }, u = jo(e, a), g = To(c, u, s, i), b = c.map((h) => h.fov), y = t.allow_framing_loss === !0, _ = [], v = [];
  for (let h = 0; h < n; h++) {
    const S = [], T = [];
    for (const N of ut) {
      const X = gt(f[N][h], t[`max_${N}`]);
      S.push(X), X !== "ok" && T.push(N);
    }
    !g[h] && !y && (S.push("over"), T.push("framing_loss")), _.push(yt(S)), v.push(T);
  }
  const x = g.filter((h) => !h).length, M = {
    profile: o,
    warn_ratio: Nt,
    limits: t,
    subject: u,
    duration_frames: n,
    fps: r,
    max_speed: Math.max(...m),
    max_angular_speed: Math.max(...l),
    max_acceleration: Math.max(...d),
    max_jerk: Math.max(...p),
    max_fov_change: Math.max(...b) - Math.min(...b),
    framing_loss_frames: x,
    series: f,
    framing: g,
    frame_grades: _,
    segments: Io(_, v),
    violations: []
  };
  for (const h of [...ut, "fov_drift"]) {
    const S = h === "fov_drift" ? "max_fov_change" : `max_${h}`, T = t[S];
    T != null && M[S] > Number(T) && M.violations.push({ metric: S, value: M[S], recommended_max: Number(T) });
  }
  x && !y && M.violations.push({ metric: "framing_loss_frames", value: x, recommended_max: 0 });
  const j = gt(M.max_fov_change, t.max_fov_change);
  return M.track_grades = { fov_drift: j }, M.grade = yt([..._, j]), M.trajectory_valid = M.violations.length === 0, M.ok = M.trajectory_valid, M;
}
function Ao(e) {
  return e.segments.filter((t) => t.grade !== "ok").sort((t, a) => (a.grade === "over") - (t.grade === "over") || a.end - a.start - (t.end - t.start));
}
function Xe(e, t) {
  const a = Math.max(1, e.state.duration_frames - 1), o = k(Number(e.timelineZoom) || 1, 0.1, 50), r = Number(e.timelinePan) || 0, n = a / o;
  return (t - r) / Math.max(1e-6, n) * 100;
}
function Rt(e, t, a) {
  const o = a.getBoundingClientRect(), r = Math.max(1, e.state.duration_frames - 1), n = k(Number(e.timelineZoom) || 1, 0.1, 50), s = Number(e.timelinePan) || 0, i = r / n, c = (t.clientX - o.left) / Math.max(1, o.width);
  return k(Math.round(s + c * i), 0, r);
}
function vn(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = Math.max(1, e.state.duration_frames - 1), o = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey)
    e.timelinePan = k((Number(e.timelinePan) || 0) + (t.deltaY > 0 ? 4 : -4), -a * 0.5, a);
  else {
    const n = t.currentTarget.getBoundingClientRect(), s = (t.clientX - n.left) / Math.max(1, n.width), i = k(Number(e.timelineZoom) || 1, 0.2, 30), c = k(i * o, 0.2, 30), m = a / i, l = a / c, d = (Number(e.timelinePan) || 0) + s * m;
    e.timelinePan = k(d - s * l, -a * 0.5, a), e.timelineZoom = c;
  }
  e.refreshKeys(), e.setStatus(w(`Timeline zoom: ${(e.timelineZoom * 100).toFixed(0)}%`));
}
function wn(e) {
  e.timelineZoom = 1, e.timelinePan = 0, e.refreshKeys(), e.setStatus(w("Timeline view fitted"));
}
function Mn(e, t) {
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
  e.selectedKeyFrames = null, e.timelineDrag = { box: a, pointerId: t.pointerId }, e.setFrame(Rt(e, t, a));
}
function Sn(e, t) {
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
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.setFrame(Rt(e, t, e.timelineDrag.box), !1, !1));
}
function xn(e, t) {
  if (e.timelinePanDrag && t.pointerId === e.timelinePanDrag.pointerId) {
    e.timelinePanDrag = null;
    return;
  }
  if (e.boxSelect && t.pointerId === e.boxSelect.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const a = e.boxSelect.box.getBoundingClientRect(), o = Math.max(1, e.state.duration_frames - 1), r = k(Number(e.timelineZoom) || 1, 0.1, 50), n = Number(e.timelinePan) || 0, s = o / r, i = (d) => k(n + d / Math.max(1, a.width) * s, 0, o), c = Math.min(i(e.boxSelect.startX), i(e.boxSelect.currentX)), m = Math.max(i(e.boxSelect.startX), i(e.boxSelect.currentX));
    e.boxSelect.overlay?.remove(), e.boxSelect = null;
    const l = e.timelineKeyframes().filter((d) => d.frame >= c && d.frame <= m).map((d) => d.frame);
    l.length && (e.selectedKeyFrames = new Set(l), e.selectedKeyFrame = l[0], e.updateKeyVisualState(), e.refreshKeyEditor(), e.setStatus(w(`${l.length} keys selected`)));
    return;
  }
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.timelineDrag.box.hasPointerCapture?.(t.pointerId) && e.timelineDrag.box.releasePointerCapture(t.pointerId), e.timelineDrag = null, e.refreshKeys());
}
const Oo = 4;
function zo(e, t) {
  const a = e.keyDrag;
  if (!a) return;
  if (!a.engaged) {
    if (Math.hypot(t.clientX - (a.startClientX ?? t.clientX), t.clientY - (a.startClientY ?? t.clientY)) < Oo) return;
    a.engaged = !0;
  }
  const o = a.box.getBoundingClientRect(), r = Math.max(1, e.state.duration_frames - 1), n = k(Number(e.timelineZoom) || 1, 0.1, 50), s = Number(e.timelinePan) || 0, i = r / n;
  let c = Math.round(k(s + (t.clientX - o.left) / Math.max(1, o.width) * i, 0, r));
  c = e.snapFrame(c);
  const m = c - a.startPointerFrame;
  let l = a.badge;
  l || (l = document.createElement("div"), l.className = "floating-retime-badge", a.box.appendChild(l), a.badge = l);
  const d = Xe(e, c);
  if (l.style.left = `${d}%`, l.textContent = a.isDuplicate ? `+Copy F${c}` : `F${c}${m !== 0 ? ` (${m > 0 ? "+" : ""}${m})` : ""}`, a.moving && a.moving.length > 1) {
    if (m === a.lastDelta) return;
    a.lastDelta = m;
    const p = e.timelineKeyframes(), f = new Set(p.filter((u) => !e.selectedKeyFrames.has(u.frame)).map((u) => u.frame));
    for (const u of a.moving) {
      let g = k(u.startFrame + m, 0, e.state.duration_frames - 1);
      for (; f.has(g) && g > 0 && g < e.state.duration_frames - 1; ) g += Math.sign(m || 1);
      u.key.frame = f.has(g) ? u.key.frame : g;
    }
    p.sort((u, g) => u.frame - g.frame), e.editingKeyFrame = a.key.frame, e.scheduleSerialize(), e.setFrame(a.key.frame, !1, !0);
    return;
  }
  c !== a.key.frame && (e.editingKeyFrame = a.key.frame, e.retimeSelectedKey(c, !0));
}
function Po(e, t) {
  const a = e.camera?.position || [0, 0, 0], o = t.camera?.position || [0, 0, 0];
  return Math.sqrt((o[0] - a[0]) ** 2 + (o[1] - a[1]) ** 2 + (o[2] - a[2]) ** 2);
}
function Ie(e) {
  return (e || []).map((t) => ({
    ...t,
    camera: { ...t.camera || {}, position: [...t.camera?.position || []], target: [...t.camera?.target || []] }
  }));
}
function No(e, t) {
  const a = Ie(e);
  if (a.length < 3 || t < 2) return a;
  const o = [0];
  for (let c = 1; c < a.length; c++)
    o.push(o[c - 1] + Po(a[c - 1], a[c]));
  const r = o[o.length - 1];
  if (r <= 1e-9) return a;
  const n = a[0].frame ?? 0, s = (a[a.length - 1].frame ?? t) - n;
  if (s <= 0) return a;
  let i = n;
  for (let c = 1; c < a.length - 1; c++) {
    const m = n + Math.round(s * (o[c] / r));
    a[c].frame = Math.min(t - 1, Math.max(i + 1, m)), i = a[c].frame;
  }
  return a;
}
function Lt(e, t) {
  return t.some((a) => e >= a.start && e <= a.end);
}
function Fo(e, t, a = 0.6) {
  const o = Ie(e), r = Math.min(1, Math.max(0, Number(a) || 0));
  if (!r || o.length < 3 || !t?.length) return o;
  const n = Ie(o);
  for (let s = 1; s < o.length - 1; s++)
    if (Lt(o[s].frame ?? 0, t))
      for (const i of ["position", "target"]) {
        const c = [o[s - 1], o[s], o[s + 1]].map((d) => d.camera?.[i]).filter((d) => Array.isArray(d) && d.length >= 3), m = o[s].camera?.[i];
        if (c.length < 3 || !Array.isArray(m)) continue;
        const l = [0, 1, 2].map((d) => c.reduce((p, f) => p + Number(f[d] || 0), 0) / c.length);
        n[s].camera[i] = m.map((d, p) => Number(d) + (l[p] - Number(d)) * r);
      }
  return n;
}
function Ro(e, t, a) {
  const o = Ie(e);
  if (!t?.length || !Array.isArray(a)) return o;
  const r = a.slice(0, 3).map(Number);
  for (const n of o)
    Lt(n.frame ?? 0, t) && (n.camera.target = [...r]);
  return o;
}
function Lo(e, t) {
  return e.segments.filter((a) => a.grade !== "ok" && a.metrics.includes(t)).map((a) => ({ start: a.start, end: a.end }));
}
function Vo(e) {
  return e.segments.filter((t) => t.grade !== "ok").map((t) => ({ start: t.start, end: t.end }));
}
function Fe(e) {
  return {
    speed: w("Travel speed"),
    angular_speed: w("Rotation speed"),
    acceleration: w("Acceleration"),
    jerk: w("Jerk"),
    framing_loss: w("Subject out of frame"),
    fov_drift: w("FOV change")
  }[e] || e;
}
function Ko(e) {
  return {
    ok: w("Within limits"),
    warn: w("Near the limit"),
    over: w("Over the limit")
  }[e] || e;
}
let be = null, Ye = null;
function Go(e) {
  Ye = e;
}
async function Cn() {
  if (be) return be;
  try {
    if (!Ye) return null;
    const e = await Ye.fetchApi("/majoor/omnicam/motion_profiles");
    return e.ok ? (be = await e.json(), be) : null;
  } catch {
    return null;
  }
}
function Bo(e) {
  return e.root.querySelector('[data-role="health-profile"]')?.value || e.state?.health_profile || "generic";
}
function qo(e, t) {
  const a = e.motionProfiles?.profiles?.find((o) => o.id === t);
  return a ? a.limits : null;
}
function ue(e) {
  const t = Bo(e), a = qo(e, t);
  return a ? Ft(e.state, a, null, t) : null;
}
function bt(e) {
  return Number(e).toFixed(Math.abs(e) >= 100 ? 0 : 1);
}
function ie(e, t, a, o) {
  const r = a == null ? w("no limit") : `${bt(t)} / ${bt(a)}`;
  return `
    <div class="oc-health-metric" data-grade="${o}">
      <span class="oc-health-dot"></span>
      <span class="oc-health-metric-name">${Fe(e)}</span>
      <span class="oc-health-metric-value">${r}</span>
    </div>`;
}
function _e(e, t, a) {
  return t == null || t <= 0 ? "ok" : e > t ? "over" : e > t * a ? "warn" : "ok";
}
function Ho(e) {
  const t = Ao(e);
  return t.length ? t.slice(0, 6).map((a) => {
    const o = a.metrics.map((n) => Fe(n)).join(", "), r = a.start === a.end ? w("Frame {frame}").replace("{frame}", String(a.start)) : w("Frames {start}-{end}").replace("{start}", String(a.start)).replace("{end}", String(a.end));
    return `
      <button type="button" class="oc-health-zone" data-grade="${a.grade}" data-zone-start="${a.start}"
              title="${w("Jump the playhead to this zone")}">
        <span class="oc-health-dot"></span><span class="oc-health-zone-range">${r}</span>
        <span class="oc-health-zone-reason">${o}</span>
      </button>`;
  }).join("") : `<div class="oc-health-empty">${w("No problem zone on this shot.")}</div>`;
}
function Wo(e) {
  const t = e.root.querySelector('[data-role="health-body"]'), a = e.root.querySelector('[data-role="health-badge"]');
  if (!t || !a) return;
  if (!e.motionProfiles) {
    a.className = "oc-health-badge", a.textContent = w("Unavailable"), t.innerHTML = `<div class="oc-health-empty">${w("Could not load the recommended limits from the OmniCam server. The panel will not guess a threshold.")}</div>`;
    return;
  }
  const o = ue(e);
  if (!o) return;
  e.healthReport = o;
  const { warn_ratio: r } = o;
  a.className = `oc-health-badge ${o.grade}`, a.textContent = Ko(o.grade);
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
         <span class="oc-health-metric-name">${Fe("framing_loss")}</span>
         <span class="oc-health-metric-value">${w("{count} frames").replace("{count}", String(o.framing_loss_frames))}</span>
       </div>` : "";
  t.innerHTML = `
    <div class="oc-health-metrics">${n}${s}</div>
    <div class="oc-section">${w("Problem zones")}</div>
    <div class="oc-health-zones" data-role="health-zones">${Ho(o)}</div>
    <div class="oc-card-actions oc-health-actions">
      <button data-act="health-slow" title="${w("Respace the keys so the shot travels at a constant speed")}"><i class="pi pi-clock"></i> ${w("Slow to limits")}</button>
      <button data-act="health-smooth" title="${w("Blend the keys inside the flagged zones only")}"><i class="pi pi-chart-line"></i> ${w("Smooth flagged")}</button>
      <button data-act="health-recenter" title="${w("Aim the keys of the flagged zones back at the subject")}"><i class="pi pi-crosshairs"></i> ${w("Recenter subject")}</button>
    </div>
    <p class="oc-health-note">${w("A valid trajectory stays inside the limits recommended for this model. It is not a guarantee about the generated video.")}</p>`;
}
function Dn(e, t) {
  if (!t || !e.motionProfiles) return;
  const a = ue(e);
  if (a) {
    e.healthReport = a;
    for (const o of a.segments) {
      if (o.grade === "ok") continue;
      const r = Xe(e, o.start), n = Xe(e, o.end + 1);
      if (n < -5 || r > 105) continue;
      const s = document.createElement("div");
      s.className = "oc-health-band", s.dataset.grade = o.grade, s.style.left = `${r}%`, s.style.width = `${Math.max(0.4, n - r)}%`, s.title = o.metrics.map((i) => Fe(i)).join(", "), t.appendChild(s);
    }
  }
}
function Ae(e, t, a, o) {
  const r = e.activeCameraTrack();
  r && (e.checkpoint(a), r.keyframes = t, e.state.keyframes = t, e.syncActiveCameraTrack(), e.refreshKeys(), e.setFrame(e.frame, !1, !1), e.setStatus(o), Wo(e));
}
function kn(e) {
  const t = ue(e);
  if (!t) return;
  const a = t.limits.max_speed;
  if (!a) {
    e.setStatus(w("This profile sets no speed limit."));
    return;
  }
  const o = Math.max(1, e.state.duration_frames - 1), r = No(e.state.keyframes, o), n = Ft({ ...e.state, keyframes: r }, t.limits, null, t.profile);
  if (n.max_speed <= a) {
    Ae(e, r, "Slow to limits", w("Speed flattened; the shot keeps its length."));
    return;
  }
  const s = n.max_speed / a * (e.state.duration_frames / Math.max(1, e.state.fps));
  Ae(e, r, "Slow to limits", w("Speed flattened, still over: this path needs about {seconds}s to fit the limit.").replace("{seconds}", s.toFixed(1)));
}
function jn(e) {
  const t = ue(e);
  if (!t) return;
  const a = Vo(t);
  if (!a.length) {
    e.setStatus(w("Nothing is flagged on this shot."));
    return;
  }
  const o = Fo(e.state.keyframes, a, 0.6);
  Ae(
    e,
    o,
    "Smooth flagged zones",
    w("Smoothed {count} flagged zone(s).").replace("{count}", String(a.length))
  );
}
function Tn(e) {
  const t = ue(e);
  if (!t) return;
  const a = Lo(t, "framing_loss");
  if (!a.length) {
    e.setStatus(w("The subject stays in frame on this shot."));
    return;
  }
  const o = Ro(e.state.keyframes, a, t.subject);
  Ae(
    e,
    o,
    "Recenter subject",
    w("Recentred {count} zone(s) on the subject.").replace("{count}", String(a.length))
  );
}
const $o = {
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
  "Middle drag orbits, Shift+middle pans, Ctrl+middle dollies -- no Alt needed anywhere. Alt+left/middle/right are aliases for orbit/pan/dolly; with no middle button, Ctrl+drag over empty space orbits and Ctrl+Shift+drag pans. The profile only decides whether Alt+right dollies (Maya) or does nothing (Blender).": "Le glisser bouton du milieu orbite, Maj+milieu fait un pan, Ctrl+milieu un dolly — aucun Alt nécessaire. Alt+gauche/milieu/droit sont des alias pour orbite/pan/dolly ; sans bouton du milieu, Ctrl+glisser sur une zone vide orbite et Ctrl+Maj+glisser fait un pan. Le profil ne décide plus que d'une chose : Alt+droit fait un dolly (Maya) ou rien (Blender).",
  "Applies to Move only. Scale and Rotate always use the object's own axes, as Maya's manipulators do: a size triple and an XYZ euler only exist in the object's own frame, so a world-axis scale would shear it and a world-axis rotation cannot be expressed at all.": "S'applique au déplacement uniquement. L'échelle et la rotation utilisent toujours les axes propres de l'objet, comme les manipulateurs de Maya : un triplet de tailles et un euler XYZ n'existent que dans le repère de l'objet, donc une échelle sur un axe monde le cisaillerait et une rotation sur un axe monde est tout simplement inexprimable.",
  "Framed: all objects": "Cadré : tous les objets",
  "Framed: {name}": "Cadré : {name}",
  "{name} is locked": "{name} est verrouillée",
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
}, $ = ["OmniCam", "Director"], Vt = "MajoorOmniCam.Locale", Kt = "MajoorOmniCam.Defaults.Fps", Gt = "MajoorOmniCam.Defaults.DurationSeconds", Bt = "MajoorOmniCam.Defaults.Width", qt = "MajoorOmniCam.Defaults.Height", Ht = "MajoorOmniCam.Defaults.RenderMode", Wt = "MajoorOmniCam.Defaults.Encoder", $t = "MajoorOmniCam.Defaults.PlayblastResolution", Ut = "MajoorOmniCam.Defaults.PlayblastGrid", Xt = "MajoorOmniCam.Proxy.PointDensity", Yt = "MajoorOmniCam.Proxy.PointSpread", Zt = "MajoorOmniCam.Proxy.PointColor", Qt = "MajoorOmniCam.Proxy.CardFit", Jt = "MajoorOmniCam.Viewport.Quality", ea = "MajoorOmniCam.Viewport.Adaptive", ta = "MajoorOmniCam.Viewport.BackgroundColor", aa = "MajoorOmniCam.Display.Grid", oa = "MajoorOmniCam.Display.Radar", ra = "MajoorOmniCam.Display.CameraPaths", na = "MajoorOmniCam.Display.CameraGizmos", sa = "MajoorOmniCam.Display.LookAt", ia = "MajoorOmniCam.Display.HelperAxes", ca = "MajoorOmniCam.Display.Gizmo", la = "MajoorOmniCam.Display.Guides", ma = "MajoorOmniCam.Display.SafeAreas", da = "MajoorOmniCam.Display.ResolutionGate", pa = "MajoorOmniCam.Display.AspectRatio", fa = "MajoorOmniCam.Display.BurnIn", ua = "MajoorOmniCam.Display.SpeedHeatmap", ha = "MajoorOmniCam.Display.Wireframe", ga = "MajoorOmniCam.Display.Vertices", ya = "MajoorOmniCam.Tools.SelectMode", ba = "MajoorOmniCam.Tools.GizmoMode", _a = "MajoorOmniCam.Tools.GizmoSpace", va = "MajoorOmniCam.Tools.SpatialSnapMode", wa = "MajoorOmniCam.Tools.SpatialGridSize", Ma = "MajoorOmniCam.Navigation.Profile", Sa = "MajoorOmniCam.Navigation.FlySpeed", xa = "MajoorOmniCam.Navigation.ViewMode", Ca = "MajoorOmniCam.Timeline.SnapEnabled", Da = "MajoorOmniCam.Timeline.SnapFrames", ka = "MajoorOmniCam.Timeline.AutoKey", ja = "MajoorOmniCam.Timeline.TimecodeMode", Ta = "MajoorOmniCam.Timeline.LoopPlayback", Ea = "MajoorOmniCam.Interface.Density", Ia = "MajoorOmniCam.Interface.PreviewLayout", Aa = "MajoorOmniCam.Interface.CameraPreviews", Oa = "MajoorOmniCam.History.Limit";
function I(e, t, a, o, r) {
  return { id: e, category: [...$, t], name: a, tooltip: o, type: "boolean", defaultValue: r };
}
function z(e, t, a, o, r, n) {
  return { id: e, category: [...$, t], name: a, tooltip: o, type: "combo", options: r, defaultValue: n };
}
function q(e, t, a, o, r, n) {
  return { id: e, category: [...$, t], name: a, tooltip: o, type: "slider", attrs: r, defaultValue: n };
}
function Uo({ onLocaleChange: e, onQualityChange: t } = {}) {
  return [
    {
      id: Vt,
      category: [...$, "Language"],
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
    q(
      Kt,
      "Defaults",
      "Default FPS",
      "Frame rate applied to newly created Director nodes.",
      { min: 1, max: 120, step: 1 },
      24
    ),
    q(
      Gt,
      "Defaults",
      "Default duration (seconds)",
      "Timeline duration applied to newly created Director nodes.",
      { min: 1, max: 120, step: 1 },
      5
    ),
    q(
      Bt,
      "Defaults",
      "Default width",
      "Output width applied to newly created Director nodes.",
      { min: 64, max: 4096, step: 16 },
      1280
    ),
    q(
      qt,
      "Defaults",
      "Default height",
      "Output height applied to newly created Director nodes.",
      { min: 64, max: 4096, step: 16 },
      720
    ),
    z(
      Ht,
      "Defaults",
      "Default proxy render mode",
      "Render mode applied to newly created Director nodes.",
      ["omni_ref", "graybox", "grid", "point_field", "wireframe", "card_grid", "beauty"],
      "omni_ref"
    ),
    z(
      Wt,
      "Defaults",
      "Default playblast encoder",
      "WebCodecs is deterministic; realtime is the MediaRecorder fallback.",
      [
        { text: "WebCodecs (deterministic)", value: "auto" },
        { text: "Realtime fallback", value: "realtime" }
      ],
      "auto"
    ),
    z(
      $t,
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
    I(
      Ut,
      "Defaults",
      "Keep the grid in the playblast",
      "Records the floor grid into the playblast instead of hiding it for the capture.",
      !1
    ),
    z(
      Xt,
      "Proxy",
      "Default point density",
      "Point count of the omni-reference point field.",
      ["none", "sparse", "balanced", "dense", "ultra"],
      "balanced"
    ),
    z(
      Yt,
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
      id: Zt,
      category: [...$, "Proxy"],
      name: "Default point colour",
      tooltip: "Colour of the reference point field.",
      type: "color",
      defaultValue: "cbd5e1"
    },
    z(
      Qt,
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
      id: Jt,
      category: [...$, "Viewport"],
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
    I(
      ea,
      "Viewport",
      "Drop quality when the viewport stutters",
      "Steps the studio quality down automatically if navigation falls below ~40fps, and leaves it there for the session.",
      !0
    ),
    {
      id: ta,
      category: [...$, "Viewport"],
      name: "Default background colour",
      tooltip: "Viewport background. Leave it at the default to keep the studio sky.",
      type: "color",
      defaultValue: "121212"
    },
    I(
      aa,
      "Display",
      "Show grid by default",
      "Shows the viewport floor grid on newly created Director nodes.",
      !0
    ),
    I(
      oa,
      "Display",
      "Show camera mini-map by default",
      "Shows the radar mini-map on newly created Director nodes.",
      !1
    ),
    I(
      ra,
      "Display",
      "Show camera paths by default",
      "Shows camera trajectories on newly created Director nodes.",
      !0
    ),
    I(
      na,
      "Display",
      "Show camera gizmos by default",
      "Shows camera bodies and frustums on newly created Director nodes.",
      !0
    ),
    I(
      sa,
      "Display",
      "Show look-at targets by default",
      "Shows camera look-at lines and target crosshairs on newly created Director nodes.",
      !0
    ),
    I(
      ia,
      "Display",
      "Show helper axes by default",
      "Shows null-object axis helpers on newly created Director nodes.",
      !0
    ),
    I(
      ca,
      "Display",
      "Show transform gizmo by default",
      "Shows transform and axis gizmos on newly created Director nodes.",
      !0
    ),
    I(
      la,
      "Display",
      "Show rule-of-thirds guides by default",
      "Shows the rule-of-thirds grid and centre crosshair in camera view.",
      !0
    ),
    I(
      ma,
      "Display",
      "Show safe areas by default",
      "Shows the 90% action-safe and 80% title-safe rectangles.",
      !1
    ),
    I(
      da,
      "Display",
      "Show resolution gate by default",
      "Masks the viewport down to the node's output width x height.",
      !1
    ),
    z(
      pa,
      "Display",
      "Default aspect ratio",
      "Framing ratio used by the resolution gate. 'Auto' follows the node output.",
      ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"],
      "auto"
    ),
    I(
      fa,
      "Display",
      "Show burn-in data by default",
      "Overlays frame, fps, FOV and render mode along the bottom of the viewport.",
      !1
    ),
    I(
      ua,
      "Display",
      "Show speed map by default",
      "Colours the camera path by travel speed.",
      !1
    ),
    I(
      ha,
      "Display",
      "Show wireframe by default",
      "Draws mesh edges over scene objects. Skinned models follow their animation.",
      !1
    ),
    I(
      ga,
      "Display",
      "Show mesh vertices by default",
      "Draws mesh vertices as points over scene objects.",
      !1
    ),
    z(
      ya,
      "Tools",
      "Default selection mode",
      "Component level the viewport selects at.",
      ["object", "vertex", "edge", "face"],
      "object"
    ),
    z(
      ba,
      "Tools",
      "Default transform mode",
      "Transform the gizmo starts in.",
      ["translate", "rotate", "scale"],
      "translate"
    ),
    z(
      _a,
      "Tools",
      "Default gizmo space",
      "World-aligned axes, or the selected object's own orientation.",
      ["world", "local"],
      "world"
    ),
    z(
      va,
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
    q(
      wa,
      "Tools",
      "Default snap grid size",
      "Grid increment used by spatial grid snapping, in scene units.",
      { min: 0.01, max: 10, step: 0.01 },
      0.5
    ),
    z(
      Ma,
      "Navigation",
      "Default navigation profile",
      "Viewport navigation profile applied to newly created Director nodes.",
      [
        { text: "Maya", value: "maya" },
        { text: "Blender", value: "blender" }
      ],
      "maya"
    ),
    q(
      Sa,
      "Navigation",
      "Default fly speed",
      "WASD / QE fly speed applied to newly created Director nodes.",
      { min: 0.05, max: 5, step: 0.05 },
      1
    ),
    z(
      xa,
      "Navigation",
      "Default view",
      "View a newly created Director node opens in.",
      ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"],
      "camera"
    ),
    I(
      Ca,
      "Timeline",
      "Enable timeline snapping by default",
      "Snaps dragged keyframes to the frame increment below.",
      !0
    ),
    q(
      Da,
      "Timeline",
      "Default timeline snap",
      "Frame increment used by timeline snapping on newly created Director nodes.",
      { min: 1, max: 24, step: 1 },
      1
    ),
    I(
      ka,
      "Timeline",
      "Enable Auto Key by default",
      "Enables Auto Key on newly created Director nodes.",
      !1
    ),
    z(
      ja,
      "Timeline",
      "Default time display",
      "Elapsed time, or HH:MM:SS:FF timecode.",
      [
        { text: "Time (mm:ss.ms)", value: "time" },
        { text: "Timecode (hh:mm:ss:ff)", value: "timecode" }
      ],
      "time"
    ),
    I(
      Ta,
      "Timeline",
      "Loop playback by default",
      "Restarts playback at the first frame instead of stopping at the last.",
      !1
    ),
    z(
      Ea,
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
    z(
      Ia,
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
    I(
      Aa,
      "Interface",
      "Show camera previews by default",
      "Opens newly created Director nodes with the camera preview strip visible.",
      !0
    ),
    q(
      Oa,
      "History",
      "Undo history limit",
      "Maximum number of Undo steps held by each Director editor.",
      { min: 10, max: 500, step: 10 },
      100
    )
  ];
}
const Xo = Uo({
  onLocaleChange: () => Pa(),
  onQualityChange: (e) => er(e)
});
let za = null;
function V(e, t) {
  try {
    const a = za?.extensionManager?.setting?.get(e);
    return a ?? t;
  } catch {
    return t;
  }
}
function H(e, t, a, o, r = !1) {
  const n = Number(V(e, t)), s = Number.isFinite(n) ? Math.min(o, Math.max(a, n)) : t;
  return r ? Math.round(s) : s;
}
function O(e, t) {
  const a = V(e, t);
  return typeof a == "boolean" ? a : t;
}
function P(e, t, a) {
  const o = String(V(e, t));
  return a.includes(o) ? o : t;
}
function _t(e, t) {
  const a = String(V(e, t) || "").trim(), o = a.startsWith("#") ? a.slice(1) : a;
  return /^[0-9a-fA-F]{6}$/.test(o) ? `#${o.toLowerCase()}` : t;
}
function Pa() {
  const e = String(V(Vt, "auto")), t = String(V("Comfy.Locale", "en") || "en").slice(0, 2).toLowerCase();
  to(e === "auto" ? t : e);
}
const he = /* @__PURE__ */ new Set();
function Yo(e) {
  he.add(e);
}
function En(e) {
  he.delete(e);
}
function Zo() {
  for (const e of he)
    if (!e.disposed) return !0;
  return !1;
}
function Qo(e) {
  if (!(e instanceof Node)) return null;
  for (const t of he)
    if (!t.disposed && t.root?.contains(e)) return t;
  return null;
}
function Na() {
  return String(V(Jt, "balanced"));
}
function Jo() {
  return V(ea, !0) !== !1;
}
function er(e = Na()) {
  for (const t of he)
    t.webgl?.setViewportQuality?.(e), t.cameraWebgl?.setViewportQuality?.(e), t.invalidate?.();
}
function tr() {
  return {
    fps: H(Kt, 24, 1, 120, !0),
    durationSeconds: H(Gt, 5, 1, 120, !0),
    width: H(Bt, 1280, 64, 4096, !0),
    height: H(qt, 720, 64, 4096, !0),
    renderMode: String(V(Ht, "omni_ref")),
    encoder: String(V(Wt, "auto")),
    playblastResolution: P($t, "output", ["viewport", "half", "output", "double"]),
    playblastGrid: O(Ut, !1),
    pointDensity: P(Xt, "balanced", ["none", "sparse", "balanced", "dense", "ultra"]),
    pointSpread: P(Yt, "all_views", ["all_views", "ground_focus", "dome"]),
    pointColor: _t(Zt, "#cbd5e1"),
    cardFit: P(Qt, "contain", ["contain", "cover", "stretch"]),
    backgroundColor: _t(ta, "#121212"),
    showGrid: O(aa, !0),
    showRadar: O(oa, !1),
    showCameraPaths: O(ra, !0),
    showCameraGizmos: O(na, !0),
    showLookAt: O(sa, !0),
    showHelperAxes: O(ia, !0),
    showGizmo: O(ca, !0),
    guides: O(la, !0),
    safeAreas: O(ma, !1),
    resolutionGate: O(da, !1),
    aspectRatio: P(pa, "auto", ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"]),
    burnIn: O(fa, !1),
    speedHeatmap: O(ua, !1),
    showWireframe: O(ha, !1),
    showVertices: O(ga, !1),
    selectMode: P(ya, "object", ["object", "vertex", "edge", "face"]),
    gizmoMode: P(ba, "translate", ["translate", "rotate", "scale"]),
    gizmoSpace: P(_a, "world", ["world", "local"]),
    spatialSnapMode: P(va, "none", ["none", "grid", "vertex"]),
    spatialGridSize: H(wa, 0.5, 0.01, 100),
    navigationProfile: P(Ma, "maya", ["maya", "blender"]),
    flySpeed: H(Sa, 1, 0.05, 5),
    viewMode: P(xa, "camera", ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"]),
    snapEnabled: O(Ca, !0),
    snapFrames: H(Da, 1, 1, 24, !0),
    autoKey: O(ka, !1),
    timecodeMode: P(ja, "time", ["time", "timecode"]),
    loopPlayback: O(Ta, !1),
    uiDensity: P(Ea, "advanced", ["basic", "animation", "advanced"]),
    previewLayout: P(Ia, "auto", ["auto", "1", "2", "4"]),
    cameraViewVisible: O(Aa, !0),
    undoLimit: H(Oa, 100, 10, 500, !0)
  };
}
function ar(e) {
  za = e, eo("fr", $o), Pa();
}
function or(e) {
  const t = Na(), a = Jo();
  for (const o of [e.webgl, e.cameraWebgl])
    o && (o.adaptiveQuality = a, o.onQualityDowngrade = (r) => e.setStatus?.(
      w("Studio quality lowered to {level} to keep the viewport responsive").replace("{level}", r)
    ), o.setViewportQuality?.(t));
}
function rr(e) {
  Yo(e), or(e);
}
function nr(e) {
  const t = tr();
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
function sr(e, t) {
  return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function ir(e, t, a, o, r) {
  const { right: n, up: s, forward: i } = L(t), c = t.position, m = [a[0] - c[0], a[1] - c[1], a[2] - c[2]], l = sr(m, i);
  let d, p;
  if (t.camera_type === "orthographic") {
    const f = 5 / Math.max(0.01, t.zoom || 1), u = f * o / Math.max(1, r);
    d = (e[0] / Math.max(1, o) - 0.5) * 2 * u, p = (0.5 - e[1] / Math.max(1, r)) * 2 * f;
  } else {
    const f = 0.5 * r / Math.tan(Math.max(1e-3, t.fov) * Math.PI / 360);
    d = (e[0] - o / 2) * l / f, p = (r / 2 - e[1]) * l / f;
  }
  return [0, 1, 2].map((f) => c[f] + i[f] * l + n[f] * d + s[f] * p);
}
function cr(e) {
  return e === "bezier" ? "bezier" : "smooth";
}
function In(e) {
  for (let t = e?.object; t; t = t.parent)
    if (t.userData?.omnicamPathKey) return t.userData.omnicamPathKey;
  return null;
}
function re(e) {
  return e.recording ? e.playblastCameraAtFrame() : e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode];
}
function lr(e, t, a, { forceLocal: o = !1 } = {}) {
  const r = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], n = a?.rotation || t?.rotation || [0, 0, 0];
  return o || e.state.gizmo_space === "local" ? r.map((s) => Ee(s, n)) : r;
}
function mr(e) {
  if (e.selectedEntity === "object") {
    const t = e.selectedObject();
    if (!t || t.locked) return null;
    const a = t.keyframes?.length ? Ne(t, e.frame) : t, o = a.position || [0, 0, 0];
    return {
      type: "object",
      object: t,
      position: o,
      origin: o,
      rotation: a.rotation || [0, 0, 0],
      size: a.size || [1, 1, 1]
    };
  }
  if (e.state.view_mode !== "camera") {
    const t = e.activeCameraTrack();
    if (t?.locked) return null;
    if (e.selectedEntity === "camera_target")
      return { type: "camera_target", position: fe(t, e.frame, e.state.objects).target || e.camera.target || [0, 1.5, 0], rotation: [0, 0, 0] };
    if (e.selectedEntity === "camera")
      return { type: "camera", position: fe(t, e.frame, e.state.objects).position || e.camera.position || [6, 4, 6], rotation: [0, 0, 0] };
  }
  return null;
}
function dr(e) {
  const t = mr(e);
  if (!t) return null;
  const a = re(e), o = t.position;
  if (!o || !Number.isFinite(o[0]) || !Number.isFinite(o[1]) || !Number.isFinite(o[2])) return null;
  const r = R(o, a, e.canvas.width, e.canvas.height);
  if (!r || !Number.isFinite(r[0]) || !Number.isFinite(r[1])) return null;
  const n = Math.max(0.7, G(E(a.position, o)) * 0.12), s = e.state.gizmo_mode === "scale" || e.state.gizmo_mode === "rotate", i = t.type === "object" ? lr(e, t.object, t, { forceLocal: s }) : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (e.state.gizmo_mode === "scale" && t.type !== "object") return null;
  if (e.state.gizmo_mode !== "rotate" || t.type === "camera_target")
    return {
      entity: t,
      center: r,
      worldLength: n,
      handles: i.map((m, l) => ({ index: l, axis: m, points: [r, R(C(o, D(m, n)), a, e.canvas.width, e.canvas.height)] })).filter((m) => m.points[1] && Number.isFinite(m.points[1][0]) && Number.isFinite(m.points[1][1]))
    };
  const c = i.map((m, l) => {
    const d = Math.abs(m[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], p = de(me(m, d)), f = de(me(m, p)), u = [];
    for (let g = 0; g <= 48; g++) {
      const b = g / 48 * Math.PI * 2, y = R(C(o, C(D(p, Math.cos(b) * n), D(f, Math.sin(b) * n))), a, e.canvas.width, e.canvas.height);
      y && Number.isFinite(y[0]) && Number.isFinite(y[1]) && u.push(y);
    }
    return { index: l, axis: m, points: u };
  });
  return { entity: t, center: r, worldLength: n, handles: c };
}
function Fa(e, t) {
  const a = dr(e);
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
    for (let c = 0; c < i.points.length - 1; c++) {
      const m = i.points[c], l = i.points[c + 1], d = go(t, m, l);
      (!s || d < s.distance) && (s = { ...i, distance: d, segment: [m, l], worldLength: a.worldLength, entity: a.entity });
    }
  return s?.distance <= 18 * o ? s : null;
}
function pr(e, t) {
  const a = e.webgl?.pick?.(t[0], t[1], e.canvas.width, e.canvas.height);
  if (a) {
    if (typeof a == "string") {
      const i = e.state.objects.find((c) => c.id === a);
      return i ? { type: "object", object: i } : null;
    }
    if (a.type === "camera" || a.type === "camera_target") {
      const i = e.state.cameras.find((c) => c.id === a.id);
      return i ? { type: a.type, camera: i } : null;
    }
    const s = e.state.objects.find((i) => i.id === a.id);
    return s ? { type: "object", object: s } : null;
  }
  const o = re(e);
  if (e.state.view_mode !== "camera") {
    for (const s of e.state.cameras) {
      for (const l of s.keyframes || []) {
        const d = l.camera?.position;
        if (!d) continue;
        const p = R(d, o, e.canvas.width, e.canvas.height);
        if (p && Math.hypot(t[0] - p[0], t[1] - p[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
          return { type: "camera_keyframe", camera: s, keyframe: l };
      }
      const i = fe(s, e.frame, e.state.objects), c = R(i.target || [0, 1.5, 0], o, e.canvas.width, e.canvas.height);
      if (c && Math.hypot(t[0] - c[0], t[1] - c[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera_target", camera: s };
      const m = R(i.position || [6, 4, 6], o, e.canvas.width, e.canvas.height);
      if (m && Math.hypot(t[0] - m[0], t[1] - m[1]) <= 22 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera", camera: s };
    }
    for (const s of e.state.objects)
      if (s.enabled !== !1)
        for (const i of s.keyframes || []) {
          const c = i.transform?.position;
          if (!c) continue;
          const m = R(c, o, e.canvas.width, e.canvas.height);
          if (m && Math.hypot(t[0] - m[0], t[1] - m[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
            return { type: "object_keyframe", object: s, keyframe: i };
        }
  }
  let n = null;
  for (const s of e.state.objects) {
    if (s.enabled === !1) continue;
    const i = s.keyframes?.length ? Ne(s, e.frame) : s, c = R(i.position || [0, 0, 0], o, e.canvas.width, e.canvas.height);
    if (!c) continue;
    const m = Math.hypot(t[0] - c[0], t[1] - c[1]);
    (!n || m < n.distance) && (n = { object: s, distance: m });
  }
  return n?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? { type: "object", object: n.object } : null;
}
const Ze = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, Oe = (e, t) => Math.round(e / t) * t;
function Ra(e) {
  const t = e.selectedObjectIds instanceof Set && e.selectedObjectIds.size ? e.selectedObjectIds : new Set(e.selectedObjectId ? [e.selectedObjectId] : []);
  return e.state.objects.filter((a) => t.has(a.id) && !a.locked);
}
function fr(e, t) {
  const a = Ra(e);
  if (!a.length || !["translate", "rotate", "scale"].includes(t)) return !1;
  e.checkpoint(`${t[0].toUpperCase()}${t.slice(1)} selection`);
  for (const m of a) e.beginObjectEdit(m);
  const o = a.map((m) => ({ object: m, transform: oe(m) })), r = o.reduce((m, l) => C(m, l.transform.position), [0, 0, 0]).map((m) => m / o.length), n = [e.canvas.width * 0.5, e.canvas.height * 0.5], s = e.lastViewportPointer || n, i = e.interactionElement.getBoundingClientRect(), c = e.lastPointerEvent || { clientX: i.left + s[0] * i.width / e.canvas.width, clientY: i.top + s[1] * i.height / e.canvas.height };
  return e.modalTransform = { mode: t, axis: null, numeric: "", start: s, lastEvent: c, snapshots: o, pivot: r }, e.setTransformMode(t), e.setStatus(`${t.toUpperCase()} · move mouse · X/Y/Z constrain · type value · Enter confirm · Esc cancel`), e.render(), !0;
}
function ur(e) {
  if (!e.numeric || e.numeric === "-" || e.numeric === ".") return null;
  const t = Number(e.numeric);
  return Number.isFinite(t) ? t : null;
}
function hr(e, t, a, o, r, n, s) {
  const i = r ? "grid" : e.state.spatial_snap_mode;
  if (i === "grid") {
    const c = e.state.spatial_grid_size || 0.5;
    return n ? a.map((m, l) => m.map((d, p) => Math.abs(n[p]) > 1e-6 ? Oe(d, c) : s[l][p])) : a.map((m) => m.map((l) => Oe(l, c)));
  }
  if (i === "vertex" && o && !n) {
    const c = e.webgl?.pickSubElement?.(o[0], o[1], e.canvas.width, e.canvas.height, "vertex");
    if (c?.point && !t.snapshots.some((m) => m.object.id === c.objectId)) {
      const m = a.reduce((d, p) => C(d, p), [0, 0, 0]).map((d) => d / a.length), l = E(c.point, m);
      return a.map((d) => C(d, l));
    }
  }
  return a;
}
function Se(e, t) {
  const a = e.modalTransform;
  if (!a) return !1;
  a.lastEvent = t;
  const o = e.interactionElement.getBoundingClientRect(), r = [
    (t.clientX - o.left) * e.canvas.width / Math.max(1, o.width),
    (t.clientY - o.top) * e.canvas.height / Math.max(1, o.height)
  ];
  e.lastViewportPointer = r;
  const n = r[0] - a.start[0], s = r[1] - a.start[1], i = t.shiftKey ? 0.1 : 1, c = ur(a), m = a.axis ? Ze[a.axis] : null, l = e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode], d = L(l), p = l.camera_type === "orthographic" ? 10 / (Math.max(0.01, l.zoom || 1) * Math.max(1, e.canvas.height)) : Math.hypot(...E(l.position, l.target)) * 25e-4;
  let f = a.snapshots.map((v) => [...v.transform.position]);
  if (a.mode === "translate") {
    const v = c ?? (n - s) * p * i, x = m ? D(m, v) : C(D(d.right, n * p * i), D(d.up, -s * p * i));
    f = f.map((M) => C(M, x)), f = hr(e, a, f, r, t.ctrlKey || t.metaKey, m, a.snapshots.map((M) => M.transform.position));
  }
  const u = a.mode === "rotate" ? c ?? (n - s) * 0.5 * i : 0, g = a.mode === "scale" ? Math.max(0.01, c ?? 1 + (n - s) * 0.01 * i) : 1, b = m || Ze.z, y = t.ctrlKey || t.metaKey || e.state.spatial_snap_mode === "grid";
  a.snapshots.forEach((v, x) => {
    const M = v.object;
    if (a.mode === "translate" && (M.position = f[x]), a.mode === "rotate") {
      const j = y ? Oe(u, 15) : u, h = D(b, j);
      M.position = C(a.pivot, Ee(E(v.transform.position, a.pivot), h)), M.rotation = C(v.transform.rotation, h);
    }
    if (a.mode === "scale") {
      const j = y ? Oe(g, 0.1) : g, h = m ? m.map((T) => T ? j : 1) : [j, j, j], S = E(v.transform.position, a.pivot);
      M.position = C(a.pivot, S.map((T, N) => T * h[N])), M.size = v.transform.size.map((T, N) => Math.max(0.01, T * h[N]));
    }
    e.commitObjectEdit(M);
  }), e.refreshInspector(), e.render();
  const _ = `${a.axis ? ` ${a.axis.toUpperCase()}` : ""}${a.numeric ? ` = ${a.numeric}` : ""}`;
  return e.setStatus(`${a.mode.toUpperCase()}${_}`), !0;
}
function La(e) {
  return e.modalTransform ? (e.modalTransform = null, e.editingKeyFrame = null, e.scheduleSerialize(), e.refreshKeys(), e.drawCurveEditor(), e.render(), e.setStatus("Transform confirmed"), !0) : !1;
}
function Va(e) {
  return e.modalTransform ? (e.modalTransform = null, e.undo(), e.setStatus("Transform cancelled"), !0) : !1;
}
function gr(e, t) {
  const a = e.modalTransform;
  if (!a) return !1;
  const o = t.key.toLowerCase();
  return o === "escape" ? Va(e) : o === "enter" || o === " " ? La(e) : Ze[o] ? (a.axis = a.axis === o ? null : o, Se(e, a.lastEvent), !0) : /^[0-9]$/.test(o) || o === "." || o === "," || o === "-" && !a.numeric ? (a.numeric += o === "," ? "." : o, Se(e, a.lastEvent), !0) : (o === "backspace" && (a.numeric = a.numeric.slice(0, -1), Se(e, a.lastEvent)), !0);
}
const xe = "orbit", Ce = "pan", Ge = "dolly";
function Ka(e, t, { includeCtrlFallback: a }) {
  const o = !!(t.ctrlKey || t.metaKey);
  return t.button === 1 ? o ? Ge : t.shiftKey || t.altKey ? Ce : xe : t.button === 2 ? t.altKey && e === "maya" ? Ge : null : t.button !== 0 ? null : t.altKey ? o ? Ge : t.shiftKey ? Ce : xe : o && a ? t.shiftKey ? Ce : xe : null;
}
function yr(e, t, a) {
  const o = e.state.navigation_profile === "blender" ? "blender" : "maya", r = Ka(o, t, { includeCtrlFallback: !0 });
  return r === xe && a?.camera_type === "orthographic" ? Ce : r;
}
function br(e, t) {
  if (e.isNavigatingFly) return !0;
  const a = e.state.navigation_profile === "blender" ? "blender" : "maya";
  return Ka(a, t, { includeCtrlFallback: !1 }) !== null;
}
function _r(e, t) {
  const a = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? Math.max(1, t) : 1;
  return Number.isFinite(e.deltaY) ? e.deltaY * a : 0;
}
function Qe(e, t) {
  return (e.camera_type === "orthographic" ? 10 / Math.max(0.01, e.zoom || 1) : 2 * G(E(e.position, e.target)) * Math.tan((e.fov || 35) * Math.PI / 360)) / Math.max(1, t);
}
function De(e) {
  const t = e.activePointerId;
  e.activePointerId = null, t != null && e.interactionElement.hasPointerCapture?.(t) && e.interactionElement.releasePointerCapture(t), e.pointerHit = !1, e.canvas.classList.remove("dragging"), e.interactionElement.style && (e.interactionElement.style.cursor = "default");
}
function ve(e, t, a) {
  !t || t.historyCheckpointed || (e.checkpoint(a), t.historyCheckpointed = !0);
}
function vt(e, t) {
  const a = e.activeCameraTrack?.();
  a && (a.target_offset = t, a.id === e.state.active_camera_id && (e.state.target_offset = t), e.setFrame(e.frame, !1, !1));
}
function vr(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastViewportWheelAt) || t - e.lastViewportWheelAt > 300) && e.checkpoint("Dolly viewport"), e.lastViewportWheelAt = t;
}
const Q = (e, t) => Math.round(e / t) * t, wr = (e, t) => e.map((a) => Q(a, t));
function Mr(e, t, a) {
  const o = t.keyframes?.length ? Ne(t, e.frame) : t, r = o.position || [0, 0, 0], n = e.webgl?.getObjectWorldBounds?.(t.id);
  let s, i;
  if (n)
    ({ min: s, max: i } = n);
  else {
    const p = (o.size || [1, 1, 1]).map((f) => Math.max(0.01, Math.abs(f)) / 2);
    s = p.map((f, u) => r[u] - f), i = p.map((f, u) => r[u] + f);
  }
  let c = 1 / 0, m = 1 / 0, l = -1 / 0, d = -1 / 0;
  for (const p of [s[0], i[0]]) for (const f of [s[1], i[1]]) for (const u of [s[2], i[2]]) {
    const g = R([p, f, u], a, e.canvas.width, e.canvas.height);
    g && (c = Math.min(c, g[0]), l = Math.max(l, g[0]), m = Math.min(m, g[1]), d = Math.max(d, g[1]));
  }
  return Number.isFinite(c) ? { minX: c, minY: m, maxX: l, maxY: d } : null;
}
function ce(e, t, a, o = [], r = null) {
  const s = e.currentTransformEvent?.ctrlKey || e.currentTransformEvent?.metaKey ? "grid" : e.state.spatial_snap_mode, i = e.state.spatial_grid_size || 0.5;
  if (s === "grid")
    return r ? t.map((c, m) => Math.abs(r.axis[m]) > 1e-6 ? Q(c, i) : r.base[m]) : wr(t, i);
  if (s === "vertex" && a && !r) {
    const c = e.webgl?.pickSubElement?.(a[0], a[1], e.canvas.width, e.canvas.height, "vertex");
    if (c?.point && !o.includes(c.objectId)) return [...c.point];
  }
  return t;
}
function An(e, t) {
  if (e.modalTransform) {
    t.preventDefault?.(), t.stopPropagation?.(), t.button === 0 ? La(e) : t.button === 2 && Va(e);
    return;
  }
  if (t.target?.closest?.("button,input,select")) return;
  if (t.button === 2 && !t.altKey) {
    t.preventDefault?.(), t.stopPropagation?.(), t.stopImmediatePropagation?.();
    return;
  }
  t.preventDefault?.(), t.stopPropagation?.(), e.closeMenus(), e.interactionElement.focus({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(t.pointerId), e.activePointerId = t.pointerId, e.canvas.classList.add("dragging");
  const a = e.interactionElement.getBoundingClientRect(), o = (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width), r = (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height), n = re(e), s = e.state.view_mode !== "camera", i = br(e, t), c = t.button === 0 && !i, m = c && !t.altKey && !t.shiftKey;
  if (m && e.webgl?.pickPathKey) {
    const b = e.webgl.pickPathKey([o, r]);
    if (b) {
      const _ = ((e.state.cameras || []).find((v) => v.id === b.cameraId)?.keyframes || []).find((v) => v.frame === b.frame);
      if (_) {
        e.pathDrag = { cameraId: b.cameraId, frame: b.frame, anchor: [..._.camera.position], startX: o, startY: r, moved: !1, historyCheckpointed: !1 }, e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), e.selectKeyframe?.(_);
        return;
      }
    }
  }
  const l = m ? Fa(e, [o, r]) : null;
  if (l) {
    const [b, y] = l.segment, _ = Math.max(1, Math.hypot(y[0] - b[0], y[1] - b[1])), v = {
      pointer: [o, r],
      axis: l.axis,
      axisIndex: l.index,
      screen: [(y[0] - b[0]) / _, (y[1] - b[1]) / _],
      worldLength: l.worldLength,
      screenLength: _,
      free: !!l.free
    };
    if (e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), l.entity.type === "camera_target") {
      e.checkpoint("Move camera target"), e.beginCameraEdit();
      const x = e.activeCameraTrack?.(), M = !!x?.target_object_id;
      e.gizmoDrag = {
        ...v,
        type: "camera_target",
        historyCheckpointed: !0,
        tracking: M,
        target: M ? [...x.target_offset || [0, 0, 0]] : [...l.entity.position || e.camera.target]
      };
      return;
    }
    if (l.entity.type === "camera") {
      e.checkpoint("Transform camera"), e.beginCameraEdit(), e.gizmoDrag = {
        ...v,
        type: "camera",
        historyCheckpointed: !0,
        position: [...l.entity.position || e.camera.position],
        target: [...e.camera.target]
      };
      return;
    }
    if (l.entity.type === "object") {
      const x = l.entity.object;
      e.checkpoint("Transform object");
      const M = Ra(e), j = (M.length ? M : [x]).map((S) => ({ object: S, transform: oe(S) }));
      for (const S of j) e.beginObjectEdit(S.object);
      const h = j.reduce((S, T) => C(S, T.transform.position), [0, 0, 0]).map((S) => S / j.length);
      e.gizmoDrag = {
        ...v,
        type: "object",
        historyCheckpointed: !0,
        object: x,
        group: j,
        groupPivot: h,
        // Same value as picked.entity.position -- the gizmo always sits at the
        // object's own origin (see activeGizmoEntity) -- `origin` is the name
        // that documents this is the drag base, in case a future entity type
        // ever needs its display position to differ from its transform again.
        position: [...l.entity.origin || l.entity.position],
        rotation: [...l.entity.rotation],
        size: [...l.entity.size],
        viewRight: L(n).right,
        viewUp: L(n).up,
        freeScale: n.camera_type === "orthographic" ? Qe(n, e.canvas.height) : G(E(n.position, l.entity.position)) * (2 * Math.tan((n.fov || 35) * Math.PI / 360)) / e.canvas.height
      };
      return;
    }
  }
  const d = c ? pr(e, [o, r]) : null;
  if (e.pointerHit = !!(l || d), d) {
    if (d.type === "camera_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(d.camera.id), e.setFrame(d.keyframe.frame), e.selectKeyframe(d.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(w(`${d.camera.name} · Keyframe @ F${d.keyframe.frame} selected`));
      return;
    }
    if (d.type === "object_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectId = d.object.id, e.editingKeyFrame = null, e.setFrame(d.keyframe.frame), e.selectKeyframe(d.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(w(`${d.object.name || d.object.type} · Keyframe @ F${d.keyframe.frame} selected`));
      return;
    }
    if (d.type === "camera_target") {
      if (e.finishCameraEdit(), e.selectedEntity = "camera_target", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(d.camera.id), d.camera.locked) {
        e.setStatus(w("{name} is locked").replace("{name}", d.camera.name)), e.refreshObjects(), e.refreshInspector(), e.render();
        return;
      }
      e.checkpoint("Move camera target"), e.beginCameraEdit();
      const { right: b, up: y } = L(n), _ = [...e.camera.target], v = e.activeCameraTrack?.(), x = !!v?.target_object_id;
      e.targetFreeDrag = {
        pointer: [o, r],
        target: x ? [...v.target_offset || [0, 0, 0]] : _,
        tracking: x,
        right: b,
        up: y,
        // Identical to the old perspective expression, and finally correct for
        // an orthographic view: that branch scaled by distance and ignored
        // `zoom` entirely, so the target ran away from the cursor as soon as
        // the view was zoomed (5x zoom moved it more than five times too far).
        // The pointer deltas here are backing pixels, hence canvas.height.
        scale: Qe(n, e.canvas.height),
        historyCheckpointed: !0
      }, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(w(`${d.camera.name} · Target aim selected`));
      return;
    }
    if (d.type === "camera") {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(d.camera.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(w(`${d.camera.name} selected`));
      return;
    }
    if (d.type === "object" && d.object) {
      if (e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectIds ||= /* @__PURE__ */ new Set(), t.shiftKey || t.ctrlKey || t.metaKey ? e.selectedObjectIds.has(d.object.id) ? e.selectedObjectIds.delete(d.object.id) : e.selectedObjectIds.add(d.object.id) : e.selectedObjectIds = /* @__PURE__ */ new Set([d.object.id]), e.selectedObjectId = e.selectedObjectIds.has(d.object.id) ? d.object.id : [...e.selectedObjectIds].at(-1) || null, e.selectedKeyFrame = d.object.keyframes?.find((b) => b.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.state.select_mode && e.state.select_mode !== "object") {
        const b = e.webgl?.pickSubElement?.(o, r, e.canvas.width, e.canvas.height, e.state.select_mode);
        if (b) {
          e.subSelection = b;
          const y = b.point.map((v) => Math.round(v * 100) / 100).join(", "), _ = b.mode === "vertex" ? "Vertex" : b.mode === "edge" ? "Edge" : "Face";
          e.setStatus(w(`${_} selected at [${y}] · Press F to focus`));
        } else
          e.subSelection = null;
      } else
        e.subSelection = null, e.setStatus(w(`${d.object.name || d.object.type} selected`));
      e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
      return;
    }
  }
  if (!d && c && !t.ctrlKey && !t.metaKey) {
    e.boxSelection = {
      start: [o, r],
      current: [o, r],
      additive: t.shiftKey,
      initial: new Set(e.selectedObjectIds || [])
    }, e.drag = null, e.interactionElement.style && (e.interactionElement.style.cursor = "crosshair"), e.render();
    return;
  }
  const p = !!e.isNavigatingFly, f = yr(e, t, n);
  if (!p && !f) return;
  const u = !p && f === "pan", g = !p && f === "dolly";
  s && !e.state.editor_views && (e.state.editor_views = Te()), e.drag = {
    x: t.clientX,
    y: t.clientY,
    shift: u,
    dolly: g,
    fly: p,
    camera: F(n),
    target: s ? e.state.editor_views[e.state.view_mode] || (e.state.editor_views[e.state.view_mode] = Te()[e.state.view_mode]) : e.camera,
    editorView: s,
    navigationOnly: i,
    historyCheckpointed: !1
  }, e.interactionElement.style && (e.interactionElement.style.cursor = g ? "ns-resize" : u ? "move" : "grabbing"), e.setStatus?.(w(p ? "Fly" : g ? "Dolly" : u ? "Pan" : "Orbit"));
}
function On(e, t) {
  if (e.lastPointerEvent = t, e.modalTransform) {
    Se(e, t);
    return;
  }
  if (e.pathDrag) {
    const s = e.interactionElement.getBoundingClientRect(), i = (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width), c = (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height);
    if (!e.pathDrag.moved && Math.hypot(i - e.pathDrag.startX, c - e.pathDrag.startY) < 3) return;
    e.pathDrag.moved = !0, ve(e, e.pathDrag, "Move path key");
    const l = ((e.state.cameras || []).find((d) => d.id === e.pathDrag.cameraId)?.keyframes || []).find((d) => d.frame === e.pathDrag.frame);
    l && (l.camera.position = ir(
      [i, c],
      re(e),
      e.pathDrag.anchor,
      e.canvas.width,
      e.canvas.height
    ), l.interpolation = cr(l.interpolation), e.webgl && (e.webgl.pathKey = ""), e.setFrame(e.frame, !1, !1), e.render());
    return;
  }
  if (e.boxSelection) {
    const s = e.interactionElement.getBoundingClientRect();
    e.boxSelection.current = [
      (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width),
      (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height)
    ], e.render();
    return;
  }
  if (e.currentTransformEvent = t, e.keyDrag) {
    zo(e, t);
    return;
  }
  if (e.targetFreeDrag) {
    ve(e, e.targetFreeDrag, "Move camera target");
    const s = e.interactionElement.getBoundingClientRect(), i = (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width), c = (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height), m = i - e.targetFreeDrag.pointer[0], l = c - e.targetFreeDrag.pointer[1], d = t.shiftKey ? 0.1 : 1, p = C(D(e.targetFreeDrag.right, m * e.targetFreeDrag.scale * d), D(e.targetFreeDrag.up, -l * e.targetFreeDrag.scale * d)), f = ce(e, C(e.targetFreeDrag.target, p), [i, c]);
    e.targetFreeDrag.tracking ? vt(e, f) : e.camera.target = f, e.commitCameraEdit(), e.refreshInspector(), e.render();
    return;
  }
  if (e.gizmoDrag) {
    ve(e, e.gizmoDrag, e.gizmoDrag.type === "object" ? "Transform object" : "Transform camera");
    const s = e.interactionElement.getBoundingClientRect(), i = [
      (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width),
      (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height)
    ], c = t.shiftKey ? 0.1 : 1, m = ((i[0] - e.gizmoDrag.pointer[0]) * e.gizmoDrag.screen[0] + (i[1] - e.gizmoDrag.pointer[1]) * e.gizmoDrag.screen[1]) * c, l = t.ctrlKey || t.metaKey || e.state.spatial_snap_mode === "grid";
    if (e.gizmoDrag.type === "camera_target") {
      const f = C(e.gizmoDrag.target, D(e.gizmoDrag.axis, m * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength)), u = ce(e, f, i, [], { base: e.gizmoDrag.target, axis: e.gizmoDrag.axis });
      e.gizmoDrag.tracking ? vt(e, u) : e.camera.target = u, e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.gizmoDrag.type === "camera") {
      if (e.state.gizmo_mode === "translate") {
        const f = C(e.gizmoDrag.position, D(e.gizmoDrag.axis, m * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
        e.camera.position = ce(e, f, i, [], { base: e.gizmoDrag.position, axis: e.gizmoDrag.axis });
      } else {
        const f = l ? Q(m * 0.015, Math.PI / 12) : m * 0.015, u = E(e.gizmoDrag.target, e.gizmoDrag.position), g = Ee(u, D(e.gizmoDrag.axis, f * (180 / Math.PI)));
        e.camera.target = C(e.gizmoDrag.position, g);
      }
      e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.state.gizmo_mode === "translate")
      if (e.gizmoDrag.free) {
        const f = (i[0] - e.gizmoDrag.pointer[0]) * c, u = (i[1] - e.gizmoDrag.pointer[1]) * c, g = C(
          e.gizmoDrag.position,
          C(D(e.gizmoDrag.viewRight, f * e.gizmoDrag.freeScale), D(e.gizmoDrag.viewUp, -u * e.gizmoDrag.freeScale))
        );
        e.gizmoDrag.object.position = ce(e, g, i, [e.gizmoDrag.object.id]);
      } else {
        const f = C(e.gizmoDrag.position, D(e.gizmoDrag.axis, m * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
        e.gizmoDrag.object.position = ce(e, f, i, [e.gizmoDrag.object.id], { base: e.gizmoDrag.position, axis: e.gizmoDrag.axis });
      }
    else if (e.state.gizmo_mode === "scale")
      if (e.gizmoDrag.free) {
        const f = (i[0] - e.gizmoDrag.pointer[0]) * c, u = (i[1] - e.gizmoDrag.pointer[1]) * c, g = (f - u) * e.gizmoDrag.freeScale, b = e.gizmoDrag.size.map((y) => {
          const _ = y + g;
          return Math.max(0.01, l ? Q(_, 0.1) : _);
        });
        e.gizmoDrag.object.size = b;
      } else {
        const f = [...e.gizmoDrag.size], u = f[e.gizmoDrag.axisIndex] + m * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength;
        f[e.gizmoDrag.axisIndex] = Math.max(0.01, l ? Q(u, 0.1) : u), e.gizmoDrag.object.size = f;
      }
    else {
      const f = [...e.gizmoDrag.rotation], u = f[e.gizmoDrag.axisIndex] + m * 0.75;
      f[e.gizmoDrag.axisIndex] = l ? Q(u, 15) : u, e.gizmoDrag.object.rotation = f;
    }
    const d = e.gizmoDrag.group || [], p = d.find((f) => f.object === e.gizmoDrag.object)?.transform;
    if (d.length > 1 && p)
      if (e.state.gizmo_mode === "translate") {
        const f = E(e.gizmoDrag.object.position, p.position);
        for (const u of d) u.object.position = C(u.transform.position, f);
      } else if (e.state.gizmo_mode === "rotate") {
        const f = E(e.gizmoDrag.object.rotation, p.rotation);
        for (const u of d)
          u.object.position = C(e.gizmoDrag.groupPivot, Ee(E(u.transform.position, e.gizmoDrag.groupPivot), f)), u.object.rotation = C(u.transform.rotation, f);
      } else {
        const f = e.gizmoDrag.object.size.map((u, g) => u / Math.max(0.01, p.size[g]));
        for (const u of d) {
          const g = E(u.transform.position, e.gizmoDrag.groupPivot);
          u.object.position = C(e.gizmoDrag.groupPivot, g.map((b, y) => b * f[y])), u.object.size = u.transform.size.map((b, y) => Math.max(0.01, b * f[y]));
        }
      }
    for (const f of d.length ? d : [{ object: e.gizmoDrag.object }]) e.commitObjectEdit(f.object);
    e.refreshInspector(), e.render();
    return;
  }
  if (!e.drag) {
    const s = e.interactionElement.getBoundingClientRect(), i = Fa(e, [
      (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width),
      (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height)
    ]), c = i ? i.free ? "free" : i.index : null;
    c !== e.hoveredGizmoHandle && (e.hoveredGizmoHandle = c, e.interactionElement.style && (e.interactionElement.style.cursor = i ? "grab" : "default"), e.render());
    return;
  }
  const a = t.clientX - e.drag.x, o = t.clientY - e.drag.y;
  if (!e.drag.historyCheckpointed && Math.hypot(a, o) < 3) return;
  const r = !e.drag.historyCheckpointed && !e.drag.editorView;
  ve(e, e.drag, e.drag.editorView ? "Navigate viewport" : "Move camera"), r && e.beginCameraEdit();
  const n = e.drag.camera;
  if (e.drag.dolly) {
    const s = Math.exp(o * 5e-3), i = E(n.position, n.target);
    e.drag.target.position = C(n.target, D(i, s)), e.drag.target.camera_type === "orthographic" && (e.drag.target.zoom = Math.max(0.01, (n.zoom || 1) / s));
  } else if (e.drag.fly) {
    const s = E(n.target, n.position), i = G(s);
    let c = Math.atan2(s[0], s[2]), m = Math.asin(k(s[1] / i, -0.999, 0.999));
    c -= a * 8e-3, m = k(m - o * 8e-3, -1.45, 1.45), e.drag.target.target = [
      n.position[0] + i * Math.sin(c) * Math.cos(m),
      n.position[1] + i * Math.sin(m),
      n.position[2] + i * Math.cos(c) * Math.cos(m)
    ];
  } else if (e.drag.shift) {
    const { right: s, up: i } = L(n), c = Qe(n, e.interactionElement.getBoundingClientRect().height), m = C(D(s, -a * c), D(i, o * c));
    e.drag.target.position = C(n.position, m), e.drag.target.target = C(n.target, m);
  } else {
    const s = E(n.position, n.target), i = G(s);
    let c = Math.atan2(s[0], s[2]), m = Math.asin(k(s[1] / i, -0.999, 0.999));
    c -= a * 8e-3, m = k(m + o * 8e-3, -1.45, 1.45), e.drag.target.position = [
      n.target[0] + i * Math.sin(c) * Math.cos(m),
      n.target[1] + i * Math.sin(m),
      n.target[2] + i * Math.cos(c) * Math.cos(m)
    ];
  }
  e.drag.editorView ? (e.serialize(), e.render()) : e.commitCameraEdit();
}
function Ga(e) {
  if (!e.drag && !e.gizmoDrag && !e.targetFreeDrag && !e.boxSelection && !e.pathDrag) return !1;
  const t = [e.drag, e.gizmoDrag, e.targetFreeDrag, e.pathDrag].some((a) => a?.historyCheckpointed);
  return e.drag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.boxSelection = null, e.pathDrag = null, De(e), t && e.undo(), e.finishCameraEdit(), e.refreshInspector(), e.render(), e.setStatus(w("Interaction cancelled")), !0;
}
function zn(e, t) {
  if (t?.type === "pointercancel" || t?.type === "lostpointercapture") {
    t.pointerId === e.activePointerId && Ga(e);
    return;
  }
  if (e.pathDrag) {
    const n = e.pathDrag.moved;
    e.pathDrag = null, De(e), n && (e.scheduleSerialize(), e.refreshKeys(), e.setStatus(w("Path key moved")));
    return;
  }
  if (e.boxSelection) {
    const n = e.boxSelection, s = re(e), i = Math.min(n.start[0], n.current[0]), c = Math.max(n.start[0], n.current[0]), m = Math.min(n.start[1], n.current[1]), l = Math.max(n.start[1], n.current[1]), d = n.additive ? new Set(n.initial) : /* @__PURE__ */ new Set();
    for (const p of e.state.objects) {
      if (p.enabled === !1) continue;
      const f = Mr(e, p, s);
      f && f.maxX >= i && f.minX <= c && f.maxY >= m && f.minY <= l && d.add(p.id);
    }
    e.selectedObjectIds = d, e.selectedObjectId = [...d].at(-1) || null, e.selectedEntity = d.size ? "object" : "camera", e.boxSelection = null, De(e), e.refreshObjects(), e.refreshInspector(), e.render(), e.setStatus(w(`${d.size} object(s) selected`));
    return;
  }
  const a = e.keyDrag, o = !!(e.drag && !e.drag.editorView || e.targetFreeDrag), r = !!e.gizmoDrag;
  !e.pointerHit && !e.gizmoDrag && !e.targetFreeDrag && e.drag && !e.drag.navigationOnly && t && Math.hypot(t.clientX - e.drag.x, t.clientY - e.drag.y) < 5 && (t.button === 0 || t.button === void 0) && (e.selectedEntity === "object" || e.selectedObjectId !== null || e.selectedEntity === "camera_target") && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = null, e.subSelection = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(w("Deselected"))), De(e), e.drag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.keyDrag = null, e.pointerHit = !1, e.canvas.classList.remove("dragging"), e.interactionElement.style && (e.interactionElement.style.cursor = "default"), a && (a.badge?.remove(), e.editingKeyFrame = null, e.updateKeyVisualState(), e.root.focus({ preventScroll: !0 })), o && e.finishCameraEdit(), r && (e.editingKeyFrame = null, e.updateKeyVisualState(), e.drawCurveEditor());
}
function Pn(e, t) {
  if (t.target.closest?.(".viewport-inspector, .scene-tree, .menu-panel, .context-menu, .viewport-quick-bar"))
    return;
  t.preventDefault(), t.stopPropagation(), e.closeMenus();
  const a = _r(t, e.interactionElement.getBoundingClientRect().height);
  if (!a) return;
  if (e.isNavigatingFly) {
    e.cameraSpeed = k(e.cameraSpeed * Math.exp(-a * 1e-3), 0.05, 20), e.setStatus(w(`Fly speed: ${e.cameraSpeed.toFixed(2)}x`));
    return;
  }
  vr(e);
  const o = e.state.view_mode !== "camera", r = re(e);
  o || e.beginCameraEdit();
  const n = k(a * 1e-3, -0.4, 0.4), s = E(r.position, r.target);
  r.position = C(r.target, D(s, Math.exp(n))), r.camera_type === "orthographic" && (r.zoom = Math.max(0.01, (r.zoom || 1) * Math.exp(-n))), o ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit());
}
const Sr = (e) => {
  const t = new Set((e.motion_layers || []).map((o) => o.id));
  let a = t.size + 1;
  for (; t.has(`motion_${a}`); ) a += 1;
  return `motion_${a}`;
};
function ze(e, { sourceKind: t = "manual_2d", label: a, keys: o, source: r = {} }) {
  if (!It.includes(t)) throw new Error(`Unsupported motion source: ${t}`);
  const n = Sr(e), s = { id: n, label: a || `Motion ${n.split("_").at(-1)}`, enabled: !0, semantic: "screen_point", source_kind: t, keys: o.map((i) => ({ visible: !0, interpolation: "linear", ...i })), source: { ...r } };
  return e.motion_layers ||= [], e.motion_layers.push(s), e.selected_motion_layer_id = n, s;
}
function Be(e) {
  return (e.motion_layers || []).find((t) => t.id === e.selected_motion_layer_id) || null;
}
function st(e, t) {
  return e.motion_tool = Et.includes(t) ? t : "select", e.motion_tool;
}
function xr(e, t) {
  if (At.includes(t))
    for (const a of e.keys) a.interpolation = t;
}
function Cr(e, t, a) {
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
function Ba(e, t) {
  e.motion_layers = (e.motion_layers || []).filter((a) => a.id !== t), e.selected_motion_layer_id === t && (e.selected_motion_layer_id = e.motion_layers[0]?.id || null);
}
function Dr(e, t) {
  const a = t.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (e.clientX - a.left) / Math.max(1, a.width))),
    y: Math.max(0, Math.min(1, (e.clientY - a.top) / Math.max(1, a.height)))
  };
}
function kr(e, t, a, o, r) {
  const n = fe(e, a, e.objects);
  let s = t?.point;
  if (t?.object_id) {
    const l = e.objects.find((f) => f.id === t.object_id);
    if (!l) return null;
    const d = xo(e.objects, l), p = Array.isArray(t.local_point) ? t.local_point : [0, 0, 0];
    s = [d.position[0] + p[0] * d.size[0], d.position[1] + p[1] * d.size[1], d.position[2] + p[2] * d.size[2]];
  }
  if (!Array.isArray(s)) return null;
  const i = R(s, n, o, r);
  if (!i) return null;
  const c = i[0] / o, m = i[1] / r;
  return { x: c, y: m, visible: c >= 0 && c <= 1 && m >= 0 && m <= 1 };
}
function jr(e, t = 6e-3) {
  if (e.length < 3) return e;
  const a = [e[0]];
  for (const o of e.slice(1, -1)) {
    const r = a.at(-1);
    Math.hypot(o.x - r.x, o.y - r.y) >= t && a.push(o);
  }
  return a.push(e.at(-1)), a;
}
function qa(e, t, a = 0.035) {
  let o = null, r = a;
  for (const n of e || []) for (const s of n.keys || []) {
    const i = Math.hypot(s.x - t.x, s.y - t.y);
    i <= r && (o = n, r = i);
  }
  return o;
}
function Tr(e, t, a, o) {
  const r = jr(t);
  if (r.length < 2) return null;
  const n = Math.max(0, o - a);
  return ze(e, {
    sourceKind: "manual_2d",
    label: `Track ${(e.motion_layers || []).length + 1}`,
    keys: r.map((s, i) => ({ ...s, time_seconds: a + n * i / (r.length - 1) }))
  });
}
function qe(e, t) {
  return Dr(t, e.interactionElement);
}
function Er(e, t) {
  const a = qa(e.motion_layers, t);
  return a ? (Ba(e, a.id), a) : null;
}
const He = (e) => {
  e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.();
}, wt = (e) => {
  const t = e.state.playback_range || [e.frame, e.state.duration_frames - 1];
  return [t[0] / e.state.fps, t[1] / e.state.fps];
}, Z = (e, t) => {
  e.serialize(), e.render(), e.setStatus(t);
};
function Pe(e) {
  for (const t of e.root.querySelectorAll("[data-motion-tool]")) {
    const a = t.dataset.motionTool === e.state.motion_tool;
    t.classList.toggle("active", a), t.setAttribute("aria-pressed", String(a));
  }
  e.interactionElement.dataset.motionTool = e.state.motion_tool;
}
function Ir(e, t) {
  const a = e.state.objects.find((m) => m.id === e.selectedObjectId), o = e.motionCreationKind, n = (o === "object" || o !== "world" && !!a) && a ? "object_point" : "world_point", s = n === "object_point" ? { object_id: a.id, local_point: [0, 0, 0] } : { point: e.webgl?.intersectScenePoint?.(t.x * e.canvas.width, t.y * e.canvas.height, e.canvas.width, e.canvas.height) || [...e.camera.target] }, i = kr(e.state, s, e.frame, e.canvas.width, e.canvas.height) || t, c = n === "object_point" ? `${a.name || a.id} Track` : "World Anchor";
  return ze(e.state, { sourceKind: n, label: c, keys: [{ time_seconds: e.frame / e.state.fps, x: i.x, y: i.y, visible: i.visible !== !1 }], source: s });
}
function Nn(e, t) {
  for (const r of e.root.querySelectorAll("[data-motion-tool]"))
    r.addEventListener("click", () => {
      e.motionCreationKind = "", st(e.state, r.dataset.motionTool), Pe(e), e.render();
    }, { signal: t });
  for (const r of e.root.querySelectorAll("[data-motion-preset]"))
    r.addEventListener("click", () => {
      e.checkpoint("Add camera field"), ze(e.state, { sourceKind: "camera_field", label: `${r.dataset.motionPreset} Field`, keys: [{ time_seconds: 0, x: 0.5, y: 0.5 }], source: { preset: r.dataset.motionPreset, point: [...e.camera.target] } }), Z(e, `Camera field: ${r.dataset.motionPreset}`);
    }, { signal: t });
  e.root.querySelector('[data-role="motion-interpolation"]')?.addEventListener("change", (r) => {
    const n = Be(e.state);
    n && (e.checkpoint("Set motion interpolation"), xr(n, r.target.value), Z(e, `Motion interpolation: ${r.target.value}`));
  }, { signal: t }), e.root.querySelector('[data-role="motion-key-visible"]')?.addEventListener("change", (r) => {
    const n = Be(e.state);
    if (!n?.keys?.length) return;
    const s = e.frame / e.state.fps, i = n.keys.reduce((c, m) => Math.abs(m.time_seconds - s) < Math.abs(c.time_seconds - s) ? m : c);
    e.checkpoint("Set motion visibility"), i.visible = r.target.checked, Z(e, `Motion key ${i.visible ? "visible" : "hidden"}`);
  }, { signal: t });
  for (const r of e.root.querySelectorAll("[data-motion-layer-action]"))
    r.addEventListener("click", () => {
      const n = Be(e.state);
      if (!n) return;
      const s = r.dataset.motionLayerAction;
      if (e.checkpoint(s === "delete" ? "Delete motion layer" : s === "retime" ? "Retime motion layer" : "Toggle motion layer"), s === "delete") Ba(e.state, n.id);
      else if (s === "retime") {
        const [i, c] = wt(e);
        Cr(n, i, c);
      } else n.enabled = !n.enabled;
      Z(e, s === "delete" ? "Motion layer deleted" : s === "retime" ? "Motion layer retimed" : `Motion layer ${n.enabled ? "enabled" : "disabled"}`);
    }, { signal: t });
  const a = e.interactionElement;
  a.addEventListener("pointerdown", (r) => {
    const n = e.state.motion_tool;
    if (n === "select" || r.button !== 0) return;
    He(r), a.setPointerCapture?.(r.pointerId);
    const s = qe(e, r);
    if (n === "track") {
      e.checkpoint("Draw motion track"), e.motionTrackDraft = { pointerId: r.pointerId, points: [s] };
      return;
    }
    e.checkpoint(n === "erase" ? "Erase motion track" : "Add motion anchor"), n === "anchor" ? ze(e.state, { sourceKind: "static_anchor", label: `Anchor ${(e.state.motion_layers || []).length + 1}`, keys: [{ time_seconds: e.frame / e.state.fps, ...s, interpolation: "hold" }] }) : n === "project" ? Ir(e, s) : n === "erase" && Er(e.state, s), Z(e, `Motion tool: ${n}`);
  }, { capture: !0, signal: t }), a.addEventListener("pointermove", (r) => {
    e.motionTrackDraft?.pointerId === r.pointerId && (He(r), e.motionTrackDraft.points.push(qe(e, r)), e.render());
  }, { capture: !0, signal: t });
  const o = (r) => {
    const n = e.motionTrackDraft;
    if (n?.pointerId !== r.pointerId) return;
    He(r), e.motionTrackDraft = null;
    const [s, i] = wt(e), c = Tr(e.state, n.points, s, i);
    Z(e, c ? `Motion track: ${c.label}` : "Motion track needs a longer stroke");
  };
  a.addEventListener("pointerup", o, { capture: !0, signal: t }), a.addEventListener("pointercancel", o, { capture: !0, signal: t }), a.addEventListener("click", (r) => {
    if (e.state.motion_tool !== "select" || r.button !== 0) return;
    const n = qa(e.state.motion_layers, qe(e, r));
    n && (e.state.selected_motion_layer_id = n.id, e.render());
  }, { signal: t }), Pe(e);
}
const Ar = {
  draw: { tool: "track", label: "Draw Path", hint: "Draw a trajectory in the Camera View. Release to finish, Esc to cancel." },
  object: { tool: "project", label: "Track Object", hint: "Click the selected object in the viewport to follow it." },
  world: { tool: "project", label: "World Point", hint: "Click a surface or point in the viewport to pin a fixed 3D point." },
  anchor: { tool: "anchor", label: "Screen Anchor", hint: "Click to place a control point at a fixed screen position." }
};
function Or(e, t) {
  const a = Ar[t];
  if (a) {
    if (t === "object" && !(e.state.objects || []).some((o) => o.id === e.selectedObjectId)) {
      e.setStatus("Select a scene object first, then choose Track Object.");
      return;
    }
    e.checkpoint?.(`Motion: ${a.label}`), st(e.state, a.tool), e.motionCreatingLabel = a.label, e.motionCreationKind = t, Pe(e), e.render(), e.setStatus(a.hint);
  }
}
function Ha(e) {
  return (e.state.motion_tool || "select") === "select" && !e.motionTrackDraft ? !1 : (st(e.state, "select"), e.motionTrackDraft = null, e.motionCreatingLabel = "", e.motionCreationKind = "", Pe(e), e.render(), e.setStatus("Motion creation cancelled."), !0);
}
function Fn(e, t) {
  for (const a of e.root.querySelectorAll("[data-motion-create]"))
    a.addEventListener("click", () => Or(e, a.dataset.motionCreate), { signal: t });
  e.root.querySelector("[data-motion-create-cancel]")?.addEventListener("click", () => Ha(e), { signal: t });
}
const zr = Object.freeze({
  x: ["right", "left"],
  y: ["top", "bottom"],
  z: ["front", "back"]
}), Pr = Object.freeze({
  front: "back",
  back: "front",
  right: "left",
  left: "right",
  top: "bottom",
  bottom: "top"
});
function Rn(e, t) {
  const a = zr[e];
  return a ? t === a[0] ? a[1] : a[0] : null;
}
function Nr(e) {
  return Pr[e] || null;
}
function Mt(e, t, a) {
  const o = e.viewportCamera(), r = e.state.view_mode !== "camera", n = E(o.position, o.target), s = G(n);
  if (!(s > 1e-4)) return;
  const i = Math.atan2(n[0], n[2]) + t, c = k(Math.asin(k(n[1] / s, -0.999, 0.999)) + a, -1.45, 1.45);
  r || e.beginCameraEdit(), o.position = C(o.target, D([
    Math.sin(i) * Math.cos(c),
    Math.sin(c),
    Math.cos(i) * Math.cos(c)
  ], s)), r ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit());
}
const St = { t: "translate", r: "rotate", s: "scale" }, Fr = [
  ["viewport", ".viewport-wrap"],
  ["sequence", '[data-role="graph-sequence"]'],
  ["graph", ".oc-graph"],
  ["timeline", ".oc-timeline"]
], Rr = 'button,summary,a[href],[role="button"],[role="menuitem"],[role="tab"],[role="option"],[role="checkbox"],[role="switch"]';
function Lr(e) {
  return e instanceof HTMLElement || e instanceof SVGElement ? !!e.closest?.(Rr) : !1;
}
function Vr(e) {
  return !(e instanceof HTMLElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(e.tagName) || e.isContentEditable || !!e.closest?.('[contenteditable="true"],span.property_value');
}
function Kr(e) {
  const t = e instanceof HTMLElement ? e : null;
  for (const [a, o] of Fr)
    if (t?.closest?.(o)) return a;
  return null;
}
function Gr(e, t) {
  return Kr(e) || t?.lastKeyZone || "viewport";
}
let xt = !1;
function Br() {
  xt || typeof window > "u" || (xt = !0, window.addEventListener("keydown", (e) => {
    if (!Zo()) return;
    const t = e.composedPath?.()[0] || e.target, a = Qo(t);
    !a || a.disposed || qr(a, e) && (e.preventDefault(), e.stopImmediatePropagation?.(), e.stopPropagation());
  }, { capture: !0 }));
}
function qr(e, t) {
  const a = t.composedPath?.()[0] || t.target;
  if (Vr(a) || (t.code === "Space" || t.key === "Enter") && Lr(a)) return !1;
  if (e.contextMenu.onKey(t)) return !0;
  if (e.modalTransform)
    return gr(e, t), !0;
  if (Hr(e, t)) return !0;
  const o = t.code;
  if ((t.ctrlKey || t.metaKey) && !o.startsWith("Numpad") || t.altKey) return !1;
  switch (Gr(a, e)) {
    case "viewport":
      return Wr(e, t);
    case "sequence":
      return Ur(e, t);
    case "timeline":
    case "graph":
      return $r(e, t);
    default:
      return !1;
  }
}
function Hr(e, t) {
  const a = t.key.toLowerCase(), o = t.ctrlKey || t.metaKey;
  return a === "escape" ? Ga(e) || Ha(e) ? !0 : e.isNavigatingFly ? (e.isNavigatingFly = !1, e.setStatus("Fly Mode OFF"), !0) : !1 : o && a === "z" ? (t.repeat || (t.shiftKey ? e.redo() : e.undo()), !0) : o && a === "y" ? (t.repeat || e.redo(), !0) : o && a === "c" ? e.selectedKeyframe() ? (e.copyKeyframe(), !0) : !1 : o && a === "v" ? e.copiedKeyframe ? (e.pasteKeyframe(), !0) : !1 : o && a === "d" ? (t.repeat || (e.selectedEntity === "object" && e.selectedObjectId ? e.duplicateObject(e.selectedObjectId) : e.selectedEntity === "camera" && e.duplicateCamera(e.state.active_camera_id)), !0) : t.altKey && a === "h" ? (t.repeat || e.showAllObjects(), !0) : t.code === "Space" ? (t.repeat || e.togglePlay(), !0) : !1;
}
function Wr(e, t) {
  const a = t.key.toLowerCase(), o = t.code;
  if (t.shiftKey && a === "g" && !e.isNavigatingFly)
    return e.selectHierarchy(), !0;
  if (St[a] && !e.isNavigatingFly)
    return t.repeat || fr(e, St[a]), !0;
  if (a === "tab") {
    const i = e.state.select_mode === "object" ? "vertex" : "object";
    return e.setSelectMode(i), e.setStatus(i === "object" ? "Object Mode" : "Component Mode: Vertex"), !0;
  }
  if (a === "f" || o === "NumpadDecimal")
    return t.repeat || e.frameTarget(), !0;
  if ((a === "a" || t.key === "Home") && !e.isNavigatingFly && !t.shiftKey)
    return t.repeat || e.frameTarget({ all: !0 }), !0;
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
  if (o === "Numpad9") {
    const i = Nr(e.state.view_mode);
    return i ? e.setViewMode(i) : Mt(e, Math.PI, 0), !0;
  }
  const n = Math.PI / 12, s = { Numpad4: [n, 0], Numpad6: [-n, 0], Numpad8: [0, n], Numpad2: [0, -n] };
  if (s[o])
    return Mt(e, s[o][0], s[o][1]), !0;
  if (o === "Numpad5")
    return e.setViewMode(e.state.view_mode === "camera" ? "perspective" : "camera"), !0;
  if (a === "h" && !t.ctrlKey && !t.metaKey && !t.altKey)
    return !t.repeat && e.selectedEntity === "object" && e.selectedObjectId && e.toggleObject(e.selectedObjectId), !0;
  if (t.key === "Delete" || t.key === "Backspace")
    return t.repeat || (e.selectedEntity === "object" && e.selectedObjectId ? e.deleteObject(e.selectedObjectId) : e.selectedEntity === "camera" && e.deleteCamera(e.state.active_camera_id)), !0;
  if (["w", "a", "s", "d", "q", "e"].includes(a) && e.isNavigatingFly) {
    const i = e.viewportCamera(), c = e.state.view_mode !== "camera", { right: m, up: l, forward: d } = L(i), p = (t.shiftKey ? 0.6 : 0.18) * e.cameraSpeed, f = { w: D(d, p), s: D(d, -p), d: D(m, p), a: D(m, -p), e: D(l, p), q: D(l, -p) }[a];
    return c || e.beginCameraEdit(), i.position = C(i.position, f), i.target = C(i.target, f), c ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit()), !0;
  }
  return !1;
}
function $r(e, t) {
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
function We(e) {
  e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render();
}
function Ur(e, t) {
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
    return t.repeat || (!je(e.state).length || a === "a" ? (e.checkpoint("Auto-split shots"), e.state.sequence = { ...e.state.sequence || { recording_path: "" }, enabled: !0, cuts: no(e.state) }, We(e)) : (e.checkpoint("Split shot"), io(e.state, e.frame, null) ? We(e) : e.setStatus("Move the playhead inside a shot first"))), !0;
  if (t.key === "Delete" || t.key === "Backspace") {
    if (t.repeat) return !0;
    const o = je(e.state), r = Tt(e.state, e.frame), n = r ? o.findIndex((s) => s.start === r.start) : -1;
    return n >= 0 && (e.checkpoint("Remove shot"), co(e.state, n) && We(e)), !0;
  }
  return !1;
}
function it(e, t) {
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
const Je = "MajoorOmniCamDirector", et = "MajoorOmniCamExtractor", tt = "MajoorOmniCamMonitor";
function Re(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.type || "");
}
const Wa = {
  [Je]: { default: [1313, 1633], min: [760, 760] },
  [et]: { default: [761, 1458], min: [700, 760] },
  [tt]: { default: [798, 1634], min: [640, 680] }
}, Xr = 0.92, Yr = 0.88;
function Zr([e, t], [a, o]) {
  if (typeof window > "u") return [e, t];
  const r = Math.round((window.innerWidth || e) * Xr), n = Math.round((window.innerHeight || t) * Yr);
  return [
    Math.max(a, Math.min(e, r)),
    Math.max(o, Math.min(t, n))
  ];
}
function Qr(e, t) {
  const a = Wa[t];
  return !a || !e?.setSize ? !1 : (e.setSize(Zr(a.default, a.min)), !0);
}
function Jr(e, t, a) {
  const o = Wa[t];
  if (!o || !e?.setSize) return !1;
  const r = Array.isArray(a) ? a : Array.isArray(e.size) ? e.size : [0, 0], n = Array.isArray(e.size) ? e.size : [0, 0], [s, i] = o.min, c = Math.max(Number(r[0]) || 0, s), m = Math.max(Number(r[1]) || 0, i);
  return c === n[0] && m === n[1] ? !1 : (e.setSize([c, m]), !0);
}
const Ct = "oc-help-css", we = "#8b7bd8", $a = /* @__PURE__ */ new Map();
function ct(e, t) {
  e && t && $a.set(e, t);
}
function at(e) {
  return e && $a.get(e) || null;
}
const en = `
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
function tn() {
  if (document.getElementById(Ct)) return;
  const e = document.createElement("style");
  e.id = Ct, e.textContent = en, document.head.appendChild(e);
}
function J(e) {
  return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`([^`]+)`/g, (a, o) => `<code>${o}</code>`);
}
function an(e) {
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
function on() {
  pe && pe();
}
function Dt(e) {
  e = e || {}, tn(), on();
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
    const p = document.createElement("p");
    p.className = "oc-help-p", p.style.color = "#e6e6e6", p.innerHTML = J(e.tagline), i.appendChild(p);
  }
  const c = Array.isArray(e.sections) ? e.sections : [];
  for (const p of c)
    try {
      i.appendChild(an(p));
    } catch (f) {
      console.warn("[OmniCam] help: skipped a malformed section", f);
    }
  if (e.footer) {
    const p = document.createElement("div");
    p.className = "oc-help-tip", p.innerHTML = J(e.footer), i.appendChild(p);
  }
  a.appendChild(i);
  let m = !1;
  const l = () => {
    document.removeEventListener("keydown", d, !0), t.remove(), pe === l && (pe = null);
  };
  pe = l;
  const d = (p) => {
    p.key === "Escape" && (p.stopPropagation(), p.preventDefault(), l());
  };
  return document.addEventListener("keydown", d, !0), s.addEventListener("click", (p) => {
    p.stopPropagation(), l();
  }), t.addEventListener("mousedown", (p) => {
    m = p.target === t;
  }), t.addEventListener("click", (p) => {
    p.target === t && m && l(), m = !1;
  }), a.addEventListener("mousedown", (p) => p.stopPropagation()), document.body.appendChild(t), l;
}
ct("MajoorOmniCamDirector", {
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
ct("MajoorOmniCamExtractor", {
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
ct("MajoorOmniCamMonitor", {
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
const kt = "MajoorOmniCam.ShowHelp", ot = "oc-help-toolbar-icon", jt = "oc-help-toolbar-css", rn = "#8b7bd8";
function nn() {
  if (document.getElementById(jt)) return;
  const e = document.createElement("style");
  e.id = jt, e.textContent = `
    .${ot}{display:inline-flex;align-items:center;justify-content:center;
      width:16px;height:16px;border-radius:50%;background:${rn};color:#fff;
      font-weight:700;font-size:11px;line-height:1}
    .${ot}::before{content:"?"}
  `, document.head.appendChild(e);
}
function sn() {
  const e = U.canvas;
  if (!e) return [];
  const t = [];
  if (e.selected_nodes && t.push(...Object.values(e.selected_nodes)), e.selectedItems)
    for (const a of e.selectedItems)
      a && a.comfyClass && t.push(a);
  return t;
}
function cn() {
  for (const e of sn()) {
    const t = at(e.comfyClass);
    if (t) return t;
  }
  return null;
}
U.registerExtension({
  name: "MajoorOmniCam.HelpToolbar",
  commands: [
    {
      id: kt,
      label: "Help",
      icon: ot,
      function: () => {
        const e = cn();
        e && Dt(e);
      }
    }
  ],
  // ComfyUI calls this for every extension with the selected canvas item and
  // unions the returned command ids to render in the floating selection
  // toolbar. Never called on older frontends -> the command is registered but
  // simply never shown (harmless).
  getSelectionToolboxCommands(e) {
    const t = e && e.comfyClass;
    return t && at(t) ? [kt] : [];
  },
  // Right-click fallback so help is reachable even without the selection
  // toolbar hook.
  getNodeMenuItems(e) {
    const t = at(e?.comfyClass);
    return t ? [null, { content: "? Help", callback: () => Dt(t) }] : [];
  },
  setup() {
    nn();
  }
});
Go(Ua);
let ae = !1;
function lt(e, t, a, o) {
  a ? Qr(e, t) : Jr(e, t, o);
}
function mt(e) {
  if (typeof e.configure != "function") return () => null;
  let t = null;
  const a = e.configure.bind(e);
  return e.configure = function(o) {
    return t === null && Array.isArray(o?.size) && (t = [...o.size]), a(o);
  }, () => t;
}
function Me(e, t) {
  const a = globalThis.__majoorOmniCamCiTrace;
  Array.isArray(a) && a.push({ stage: e, nodeId: t?.id ?? null, nodeClass: Re(t), configuringGraph: ae });
}
Br();
Ja(U);
ar(U);
U.registerExtension({
  name: "Majoor.OmniCam.Director",
  settings: Xo,
  beforeConfigureGraph() {
    ae = !0;
  },
  afterConfigureGraph() {
    ae = !1;
  },
  async nodeCreated(e) {
    if (Re(e) !== Je) return;
    Me("director:nodeCreated", e);
    const t = !ae, a = t ? null : mt(e);
    await it(e, async () => {
      Me("director:import:start", e);
      const { attachDirector: r } = await import("./chunk-D1Oq610x.js").then((n) => n.f);
      return Me("director:import:resolved", e), r;
    });
    const o = e.__majoorOmniCam;
    o && (Me("director:attach:complete", e), rr(o), t && nr(o), lt(e, Je, t, a?.()));
  }
});
U.registerExtension({
  name: "Majoor.OmniCam.Extractor",
  async nodeCreated(e) {
    if (Re(e) !== et) return;
    const t = !ae, a = t ? null : mt(e);
    await it(e, async () => (await import("./chunk-DKxbqM8r.js")).attachExtractor), e.__majoorOmniCamExtractor && lt(e, et, t, a?.());
  }
});
U.registerExtension({
  name: "Majoor.OmniCam.Monitor",
  async nodeCreated(e) {
    if (Re(e) !== tt) return;
    const t = !ae, a = t ? null : mt(e);
    await it(e, async () => (await import("./chunk-B178jiSG.js")).attachMonitor), e.__majoorOmniCamMonitor && lt(e, tt, t, a?.());
  }
});
export {
  or as $,
  Cn as A,
  Wo as B,
  kn as C,
  jn as D,
  Tn as E,
  Rn as F,
  kr as G,
  qa as H,
  Va as I,
  Nn as J,
  Fn as K,
  un as L,
  R as M,
  bn as N,
  G as O,
  xo as P,
  Dn as Q,
  de as R,
  ao as S,
  Ee as T,
  me as U,
  go as V,
  gn as W,
  yn as X,
  te as Y,
  En as Z,
  on as _,
  w as a,
  qr as a0,
  Mn as a1,
  Sn as a2,
  xn as a3,
  wn as a4,
  An as a5,
  On as a6,
  zn as a7,
  Pn as a8,
  hn as a9,
  fo as aa,
  Ft as ab,
  et as ac,
  In as ad,
  Rt as b,
  k as c,
  oe as d,
  F as e,
  Ne as f,
  je as g,
  io as h,
  co as i,
  fn as j,
  no as k,
  L as l,
  E as m,
  ee as n,
  vn as o,
  D as p,
  Pt as q,
  ft as r,
  fe as s,
  Xe as t,
  Ue as u,
  C as v,
  Mo as w,
  Tt as x,
  _n as y,
  pn as z
};
