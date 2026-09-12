import { app as J } from "../../scripts/app.js";
import { api as Ir } from "../../scripts/api.js";
const Or = "MajoorOmniCam", Pr = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20256%20256'%20role='img'%20aria-labelledby='title'%3e%3ctitle%20id='title'%3eMajoor%20OmniCam%3c/title%3e%3c!--%20Vector%20twin%20of%20web/assets/omnicam-icon.png:%20same%20mark,%20~1%20KB%20so%20the%20eagerly-loaded%20node-branding%20chunk%20stays%20cheap.%20Keep%20the%20two%20in%20sync.%20--%3e%3ccircle%20cx='128'%20cy='128'%20r='102'%20fill='%23031228'/%3e%3ccircle%20cx='128'%20cy='128'%20r='53'%20fill='%23f7f6ff'/%3e%3ccircle%20cx='128'%20cy='128'%20r='43'%20fill='%238873fd'/%3e%3c/svg%3e", import.meta.url).href, Y = 20;
let de = null;
function zr() {
  return de || typeof Image > "u" || (de = new Image(), de.src = Pr), de;
}
function Nr() {
  const t = Date.now() % 2600 / 2600;
  return 0.12 + 0.1 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2));
}
function Rr(e) {
  e.registerExtension({
    name: "MajoorOmniCam.NodeBranding",
    beforeRegisterNodeDef(t, a) {
      if (!String(a?.name || a?.node_id || t?.comfyClass || t?.type || "").startsWith(Or)) return;
      const o = t.prototype.onDrawForeground;
      t.prototype.onDrawForeground = function(n) {
        if (o?.apply(this, arguments), this.flags?.collapsed) return;
        const s = zr();
        if (!s?.complete || !s.naturalWidth) return;
        const i = Math.max(4, Number(this.size?.[0] || 160) - Y - 6), l = -26, m = i + Y / 2, c = l + Y / 2;
        if (n.save(), this.selected) {
          const d = Nr(), p = n.createRadialGradient(m, c, Y * 0.35, m, c, Y * 1.15);
          p.addColorStop(0, `rgba(136, 115, 253, ${d})`), p.addColorStop(1, "rgba(136, 115, 253, 0)"), n.fillStyle = p, n.beginPath(), n.arc(m, c, Y * 1.15, 0, Math.PI * 2), n.fill();
        }
        n.globalAlpha = 0.96, n.drawImage(s, i, l, Y, Y), n.restore();
      };
    }
  });
}
const lt = "en", Ee = /* @__PURE__ */ new Map([[lt, {}]]);
function Lr(e, t) {
  Ee.set(e, { ...Ee.get(e) || {}, ...t || {} });
}
let Ie = lt;
function Fr(e) {
  Ee.has(e) && (Ie = e);
}
function Vr() {
  return Ie;
}
function S(e) {
  return Ie === lt ? e : Ee.get(Ie)?.[e] || e;
}
const Br = "__sequence__";
function Kr() {
  return { enabled: !1, cuts: [], recording_path: "" };
}
function qr(e, t = []) {
  const a = e && typeof e == "object" ? e : {}, r = new Set(t), o = /* @__PURE__ */ new Set(), n = (Array.isArray(a.cuts) ? a.cuts : []).filter((s) => s && typeof s == "object" && r.has(String(s.camera_id))).map((s) => ({
    camera_id: String(s.camera_id),
    start: Math.max(0, Math.round(Number(s.start) || 0))
  })).sort((s, i) => s.start - i.start).filter((s) => o.has(s.start) ? !1 : (o.add(s.start), !0));
  return n.length && (n[0].start = 0), {
    enabled: !!a.enabled && n.length > 0,
    cuts: n,
    recording_path: typeof a.recording_path == "string" ? a.recording_path : ""
  };
}
function Oe(e) {
  const t = Math.max(0, (e?.duration_frames || 1) - 1), a = (e?.sequence?.cuts || []).filter((r) => r.start <= t);
  return a.map((r, o) => ({
    camera_id: r.camera_id,
    start: r.start,
    end: o + 1 < a.length ? a[o + 1].start - 1 : t
  }));
}
function js(e) {
  return !!e?.sequence?.enabled && Oe(e).length > 0;
}
function Ut(e, t) {
  const a = Oe(e);
  if (!a.length) return null;
  const r = Math.max(0, Math.round(Number(t) || 0));
  for (let o = a.length - 1; o >= 0; o--)
    if (r >= a[o].start) return a[o];
  return a[0];
}
function Gr(e) {
  const t = e?.cameras || [], a = Math.max(0, (e?.duration_frames || 1) - 1);
  if (!t.length) return [];
  const r = (a + 1) / t.length, o = t.map((s, i) => ({
    camera_id: s.id,
    start: i === 0 ? 0 : Math.round(i * r)
  })), n = /* @__PURE__ */ new Set();
  return o.filter((s) => s.start > a || n.has(s.start) ? !1 : (n.add(s.start), !0));
}
function Ts(e, t, a) {
  const r = e?.sequence?.cuts || [];
  if (t <= 0 || t >= r.length) return !1;
  const o = r[t - 1].start + 1, n = (t + 1 < r.length ? r[t + 1].start : e.duration_frames || 1) - 1;
  if (n < o) return !1;
  const s = Math.max(o, Math.min(n, Math.round(Number(a) || 0)));
  return s === r[t].start ? !1 : (r[t].start = s, !0);
}
function Hr(e, t) {
  const a = e?.cameras || [];
  if (!a.length) return t;
  const r = a.findIndex((o) => o.id === t);
  return a[(r + 1) % a.length].id;
}
function Wr(e, t, a = null) {
  const r = e?.sequence?.cuts || [], o = Math.max(0, Math.round(Number(t) || 0));
  if (!r.length || o <= 0 || r.some((i) => i.start === o)) return !1;
  const s = Ut(e, o)?.camera_id || r[0].camera_id;
  return r.push({ camera_id: a || Hr(e, s), start: o }), r.sort((i, l) => i.start - l.start), !0;
}
function $r(e, t) {
  const a = e?.sequence?.cuts || [];
  return t < 0 || t >= a.length || a.length === 1 ? !1 : (a.splice(t, 1), a.length && (a[0].start = 0), !0);
}
const Xt = Object.freeze(["select", "track", "anchor", "project", "erase"]), Yt = Object.freeze(["manual_2d", "static_anchor", "world_point", "object_point", "camera_field"]), Zt = Object.freeze(["linear", "smooth", "hold"]), ve = (e, t = 0) => Number.isFinite(Number(e)) ? Number(e) : t, wt = (e) => Math.max(0, Math.min(1, ve(e)));
function Ur(e, t) {
  return {
    time_seconds: Math.max(0, Math.min(t, ve(e?.time_seconds))),
    x: wt(e?.x),
    y: wt(e?.y),
    visible: e?.visible !== !1,
    interpolation: Zt.includes(e?.interpolation) ? e.interpolation : "linear"
  };
}
function Xr(e) {
  const t = Math.max(1 / Math.max(1, ve(e.fps, 24)), ve(e.duration_frames, 120) / Math.max(1, ve(e.fps, 24))), a = /* @__PURE__ */ new Set();
  return e.motion_layers = (Array.isArray(e.motion_layers) ? e.motion_layers : []).slice(0, 256).map((r, o) => {
    let n = String(r?.id || `motion_${o + 1}`);
    a.has(n) && (n = `motion_${o + 1}`), a.add(n);
    const s = Yt.includes(r?.source_kind) ? r.source_kind : "manual_2d", i = (Array.isArray(r?.keys) ? r.keys : []).slice(0, 1e4).map((l) => Ur(l, t)).sort((l, m) => l.time_seconds - m.time_seconds);
    return {
      id: n,
      label: String(r?.label || `Motion ${o + 1}`).slice(0, 80),
      enabled: r?.enabled !== !1,
      semantic: "screen_point",
      source_kind: s,
      keys: i,
      source: r?.source && typeof r.source == "object" ? { ...r.source } : {}
    };
  }).filter((r) => r.keys.length), e.motion_tool = Xt.includes(e.motion_tool) ? e.motion_tool : "select", e.selected_motion_layer_id = e.motion_layers.some((r) => r.id === e.selected_motion_layer_id) ? e.selected_motion_layer_id : e.motion_layers[0]?.id || null, e;
}
const Yr = 32, Zr = 64, Qr = 128, Jr = Object.freeze(["off", "selected", "all"]), eo = Object.freeze(["annotation", "name", "tag"]), xt = Object.freeze({ mode: "selected", content: "annotation" }), to = Object.freeze(["top", "center", "bottom"]), ao = /^[a-z0-9][a-z0-9_-]*$/, ro = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, oo = /[<>]|:\/\/|javascript:|expression\(|&#/i;
function Je(e) {
  if (!Array.isArray(e)) return [];
  const t = [], a = /* @__PURE__ */ new Set();
  for (const r of e) {
    if (typeof r != "string") continue;
    const o = r.trim().toLowerCase();
    if (!(!o || o.length > Zr || !ao.test(o) || a.has(o)) && (a.add(o), t.push(o), t.length >= Yr))
      break;
  }
  return t;
}
function As(e) {
  return Array.isArray(e) ? Je(e) : Je(String(e || "").split(/[,\n]/));
}
function Mt(e) {
  if (!e || typeof e != "object") return null;
  const t = typeof e.text == "string" ? e.text.trim() : "";
  if (!t || t.length > Qr || oo.test(t)) return null;
  const a = typeof e.color == "string" ? e.color.trim() : "", r = ro.test(a) ? a.toLowerCase() : "#8d7ee8", o = to.includes(e.anchor) ? e.anchor : "top";
  return { text: t, visible: e.visible !== !1, color: r, anchor: o };
}
function Es(e) {
  return {
    mode: Jr.includes(e?.mode) ? e.mode : xt.mode,
    content: eo.includes(e?.content) ? e.content : xt.content
  };
}
function no(e) {
  return Array.isArray(e?.tags) && e.tags[0] || "";
}
function Is(e, t) {
  if (!e) return "";
  if (t === "name") return String(e.name || e.type || "");
  if (t === "tag") return no(e);
  const a = e.annotation;
  return a && a.visible !== !1 ? String(a.text || "") : "";
}
function Os(e, { mode: t, selectedIds: a } = {}) {
  return !e || e.enabled === !1 || t === "off" ? !1 : t === "all" ? !0 : (a instanceof Set ? a : new Set(a || [])).has(e.id);
}
const so = /* @__PURE__ */ new Set(["camera", "null", "sun_light", "point_light", "spot_light"]);
function Ps(e, t) {
  const a = Array.isArray(e?.position) ? e.position : [0, 0, 0], r = Array.isArray(e?.size) ? e.size : [1, 1, 1], o = so.has(t) ? 0.35 : Math.max(0.2, (Number(r[1]) || 1) * 0.5 + 0.2);
  return [Number(a[0]) || 0, (Number(a[1]) || 0) + o, Number(a[2]) || 0];
}
const Ct = Object.freeze([0.05, 8]), io = 80, Qt = (e, t, a) => Math.max(t, Math.min(a, e));
function Jt(e) {
  if (!e || typeof e != "object") return null;
  const t = String(e.clip_id ?? "").trim();
  if (!t || t.length > io) return null;
  const a = Math.max(0, Math.round(Number(e.start_frame) || 0)), r = Math.round(Number(e.end_frame) || 0), o = r > a ? r : 0, n = Number(e.speed), s = Qt(Number.isFinite(n) && n > 0 ? n : 1, Ct[0], Ct[1]), i = Number(e.offset_seconds);
  return {
    clip_id: t,
    start_frame: a,
    end_frame: o,
    speed: s,
    loop: e.loop !== !1,
    offset_seconds: Number.isFinite(i) ? i : 0
  };
}
function zs(e, t, a, r) {
  const o = Jt(e), n = Number(r) || 0, s = Math.max(1, Number(a) || 24);
  if (!o || n <= 0) return 0;
  const i = (d) => o.loop ? (d % n + n) % n : Qt(d, 0, n);
  if (t <= o.start_frame) return i(o.offset_seconds);
  const l = o.end_frame > o.start_frame ? o.end_frame : null, m = l !== null && !o.loop ? Math.min(t, l) : t, c = o.offset_seconds + (m - o.start_frame) * o.speed / s;
  return i(c);
}
const Ns = "omnicam_humanoid_v1", ct = Object.freeze([
  "root",
  "pelvis",
  "spine",
  "chest",
  "neck",
  "head",
  "clavicle_l",
  "upper_arm_l",
  "lower_arm_l",
  "hand_l",
  "clavicle_r",
  "upper_arm_r",
  "lower_arm_r",
  "hand_r",
  "upper_leg_l",
  "lower_leg_l",
  "foot_l",
  "toe_l",
  "upper_leg_r",
  "lower_leg_r",
  "foot_r",
  "toe_r"
]), lo = Object.freeze(["eye_l", "eye_r", "hand_tip_l", "hand_tip_r"]);
Object.freeze([...ct, ...lo]);
new Map(ct.map((e, t) => [e, t]));
const co = /^mixamorig[:_ ]?/i, mo = /[\s_\-.:|]+/g, po = {
  root: ["root", "reference", "armature", "rootjnt"],
  pelvis: ["hips", "pelvis", "hip", "cog", "root"],
  spine: ["spine", "spine1", "spine01", "abdomen", "lowerback", "back"],
  chest: ["chest", "spine2", "spine3", "spine02", "spine03", "upperchest", "thorax", "ribcage"],
  neck: ["neck", "neck1", "neck01"],
  head: ["head"],
  clavicle_l: ["leftshoulder", "shoulderl", "claviclel", "leftclavicle", "collarl"],
  upper_arm_l: ["leftarm", "arml", "upperarml", "leftupperarm", "leftshoulder2"],
  lower_arm_l: ["leftforearm", "forearml", "lowerarml", "leftlowerarm", "leftelbow"],
  hand_l: ["lefthand", "handl", "lefthandwrist", "wristl"],
  clavicle_r: ["rightshoulder", "shoulderr", "clavicler", "rightclavicle", "collarr"],
  upper_arm_r: ["rightarm", "armr", "upperarmr", "rightupperarm", "rightshoulder2"],
  lower_arm_r: ["rightforearm", "forearmr", "lowerarmr", "rightlowerarm", "rightelbow"],
  hand_r: ["righthand", "handr", "righthandwrist", "wristr"],
  upper_leg_l: ["leftupleg", "leftupperleg", "upperlegl", "leftthigh", "thighl", "legl"],
  lower_leg_l: ["leftleg", "leftlowerleg", "lowerlegl", "leftshin", "shinl", "leftcalf", "calfl", "leftknee"],
  foot_l: ["leftfoot", "footl", "leftankle", "anklel"],
  toe_l: ["lefttoebase", "lefttoe", "toel", "leftball", "balll"],
  upper_leg_r: ["rightupleg", "rightupperleg", "upperlegr", "rightthigh", "thighr", "legr"],
  lower_leg_r: ["rightleg", "rightlowerleg", "lowerlegr", "rightshin", "shinr", "rightcalf", "calfr", "rightknee"],
  foot_r: ["rightfoot", "footr", "rightankle", "ankler"],
  toe_r: ["righttoebase", "righttoe", "toer", "rightball", "ballr"],
  eye_l: ["lefteye", "eyel"],
  eye_r: ["righteye", "eyer"],
  hand_tip_l: ["lefthandtip", "handtipl", "leftmiddle1", "leftfingers"],
  hand_tip_r: ["righthandtip", "handtipr", "rightmiddle1", "rightfingers"]
};
function fo(e) {
  return String(e || "").trim().replace(co, "").replace(mo, "").toLowerCase();
}
function uo(e) {
  const t = [e];
  return e.startsWith("left") ? t.push(`${e.slice(4)}l`) : e.startsWith("right") && t.push(`${e.slice(5)}r`), e.endsWith("left") ? t.push(`${e.slice(0, -4)}l`) : e.endsWith("right") && t.push(`${e.slice(0, -5)}r`), [...new Set(t)];
}
function ho(e, t, a, r) {
  for (const [o, n] of t)
    if (!a.has(o)) {
      if (r) {
        if (n.includes(e)) return o;
      } else if (n.some((s) => s.includes(e) || e.includes(s)))
        return o;
    }
  return null;
}
function Rs(e) {
  const a = (e || []).map(String).filter((n) => n.trim()).map((n) => [n, uo(fo(n))]), r = /* @__PURE__ */ new Set(), o = {};
  for (const n of [!0, !1])
    for (const [s, i] of Object.entries(po))
      if (!o[s])
        for (const l of i) {
          const m = ho(l, a, r, n);
          if (m != null) {
            o[s] = m, r.add(m);
            break;
          }
        }
  return !o.root && o.pelvis && (o.root = o.pelvis), o;
}
function go(e) {
  const t = new Set(
    Object.entries(e || {}).filter(([, a]) => String(a || "").trim()).map(([a]) => a)
  );
  return ct.filter((a) => !t.has(a));
}
function yo(e) {
  return go(e).length === 0;
}
function Ls(e) {
  const t = e?.bone_map || e?.rig?.bone_map || null;
  return !t || !Object.keys(t).length ? "none" : yo(t) ? "rigged" : "incomplete";
}
const bo = 128, kt = "omnicam_humanoid_v1", mt = /^[a-z0-9][a-z0-9_-]*$/, _o = 1e-3, vo = (e) => Array.isArray(e) && e.length === 3 && e.every((t) => Number.isFinite(Number(t)));
function dt(e) {
  if (!Array.isArray(e) || e.length !== 4) return null;
  const t = e.map(Number);
  if (t.some((r) => !Number.isFinite(r))) return null;
  const a = Math.hypot(...t);
  return a <= 1e-8 || Math.abs(a - 1) > _o && !(a > 0.5 && a < 2) ? null : t.map((r) => r / a);
}
function ea(e, t = 1e-4) {
  const a = dt(e);
  return a ? Math.abs(a[0]) < t && Math.abs(a[1]) < t && Math.abs(a[2]) < t && Math.abs(Math.abs(a[3]) - 1) < t : !1;
}
function So(e) {
  const t = {};
  if (!e || typeof e != "object") return t;
  let a = 0;
  for (const [r, o] of Object.entries(e)) {
    if (a >= bo) break;
    const n = String(r).trim().toLowerCase();
    if (!mt.test(n) || n.length > 64) continue;
    const s = dt(o);
    !s || ea(s) || (t[n] = s, a += 1);
  }
  return t;
}
function Pe(e) {
  const t = e && typeof e == "object" ? e : {}, a = String(t.preset_id || "neutral").trim().toLowerCase();
  return {
    preset_id: mt.test(a) && a.length <= 80 ? a : "neutral",
    root_offset: vo(t.root_offset) ? t.root_offset.map(Number) : [0, 0, 0],
    joints: So(t.joints)
  };
}
function Fs({ preset: e, overrides: t } = {}) {
  const a = Pe(e), r = Pe(t);
  return {
    preset_id: r.preset_id !== "neutral" ? r.preset_id : a.preset_id,
    root_offset: t?.root_offset ? r.root_offset : a.root_offset,
    joints: { ...a.joints, ...r.joints }
  };
}
function Vs(e, t, a) {
  const r = Pe(e), o = String(t || "").trim().toLowerCase();
  if (!mt.test(o)) return r;
  const n = dt(a);
  return !n || ea(n) ? delete r.joints[o] : r.joints[o] = n, r;
}
function wo(e) {
  return !e || typeof e != "object" ? null : {
    rig_profile: e.rig_profile === kt ? kt : null,
    pose: Pe(e.pose),
    motion: Jt(e.motion)
  };
}
function xo(e) {
  const t = String(e || "").trim().replaceAll("\\", "/");
  if (!t || t.length > 1024 || t.includes("\0") || t.includes("://")) return null;
  const a = t.match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/);
  if (!a) return null;
  const r = String(a[1] || "").replace(/^\/+/, "");
  if (!r || /^[A-Za-z]:/.test(r) || r.split("/").some((i) => i === "..")) return null;
  const o = r.lastIndexOf("/"), n = o >= 0 ? r.slice(o + 1) : r, s = o >= 0 ? r.slice(0, o) : "";
  return !n || n === "." ? null : { filename: n, subfolder: s, type: a[2] || "input" };
}
function Mo(e, t) {
  const a = xo(t);
  if (!a) return "";
  const r = `/view?filename=${encodeURIComponent(a.filename)}&subfolder=${encodeURIComponent(a.subfolder)}&type=${encodeURIComponent(a.type)}`;
  return e?.apiURL ? e.apiURL(r) : r;
}
function Bs(e) {
  return Mo({ apiURL: ta }, e);
}
let ta = (e) => e;
const We = /* @__PURE__ */ new WeakMap();
function Ks({ api: e }) {
  ta = (t) => e.apiURL ? e.apiURL(t) : t;
}
function Co(e, t, a) {
  const r = e.keyframes, o = We.get(e);
  if (o?.source === r && a >= o.frame && o.index < t.length - 1) {
    let s = o.index;
    for (; s + 1 < t.length - 1 && a >= t[s + 1].frame; ) s += 1;
    if (t[s].frame < a && a < t[s + 1].frame)
      return We.set(e, { source: r, frame: a, index: s }), { leftIndex: s, left: t[s], right: t[s + 1] };
  }
  const n = pt(t, a);
  return We.set(e, { source: r, frame: a, index: n?.leftIndex ?? 0 }), n;
}
function F(e) {
  const t = A(e.target, e.position), a = Math.sqrt(U(t, t)) < 1e-6 ? [0, 0, -1] : ne(t);
  let r = e.up || [0, 1, 0], o = Se(a, r);
  Math.sqrt(U(o, o)) < 1e-6 && (r = Math.abs(a[1]) > 0.9 ? [0, 0, a[1] > 0 ? -1 : 1] : [0, 1, 0], o = Se(a, r)), o = ne(o);
  let n = ne(Se(o, a));
  if (Math.abs(e.roll || 0) > 1e-9) {
    const s = e.roll * Math.PI / 180, i = Math.cos(s), l = Math.sin(s), m = C(k(o, i), k(n, l));
    n = C(k(n, i), k(o, -l)), o = m;
  }
  return { right: o, up: n, forward: a };
}
function qs(e) {
  const t = A(e.target, e.position), a = G(t), r = a < 1e-6 ? [0, 0, -1] : k(t, 1 / a), o = Math.asin(j(r[1], -1, 1)) * 180 / Math.PI, n = Math.atan2(r[0], -r[2]) * 180 / Math.PI;
  return [o, n, e.roll || 0];
}
function Gs(e, t) {
  const [a, r, o] = t, n = Math.max(1e-4, G(A(e.target, e.position))), s = a * Math.PI / 180, i = r * Math.PI / 180, l = [Math.sin(i) * Math.cos(s), Math.sin(s), -Math.cos(i) * Math.cos(s)];
  e.target = C(e.position, k(l, n)), e.roll = o;
}
function R(e, t, a, r) {
  const { right: o, up: n, forward: s } = F(t), i = A(e, t.position), l = U(i, s);
  if (l <= Math.max(1e-4, t.near || 0.01) || l >= (t.far || 1e4)) return null;
  const m = U(i, o), c = U(i, n);
  if (t.camera_type === "orthographic") {
    const p = 5 / Math.max(0.01, t.zoom || 1), u = p * a / Math.max(1, r);
    return [a * (0.5 + m / (2 * u)), r * (0.5 - c / (2 * p)), l];
  }
  const d = 0.5 * r / Math.tan(Math.max(1e-3, t.fov) * Math.PI / 360);
  return [a * 0.5 + m * d / l, r * 0.5 - c * d / l, l];
}
function le(e, t, a = null) {
  const r = (e.keyframes || []).map((g) => ({
    ...g,
    camera: L(g.camera || g || e.camera || se())
  }));
  if (!r.length) return L(e.camera || se());
  const o = Co(e, r, t), n = z(r, t, "pos_x", (g) => (g.camera || g).position[0], !1, o), s = z(r, t, "pos_y", (g) => (g.camera || g).position[1], !1, o), i = z(r, t, "pos_z", (g) => (g.camera || g).position[2], !1, o);
  let l = z(r, t, "target_x", (g) => (g.camera || g).target[0], !1, o), m = z(r, t, "target_y", (g) => (g.camera || g).target[1], !1, o), c = z(r, t, "target_z", (g) => (g.camera || g).target[2], !1, o);
  const d = e.constraints?.look_at, u = d?.status === void 0 || d?.status === "active" ? d?.object_id || e.target_object_id || e.camera?.target_object_id : null, f = a || e.objects;
  if (u && Array.isArray(f)) {
    const g = f.find((M) => M.id === u);
    if (g && g.enabled !== !1) {
      const M = ft(f, g, t), T = d?.offset || e.target_offset || e.camera?.target_offset || [0, 0, 0];
      l = (M.position?.[0] ?? 0) + (T[0] || 0), m = (M.position?.[1] ?? 1.5) + (T[1] || 0), c = (M.position?.[2] ?? 0) + (T[2] || 0);
    }
  }
  const h = z(r, t, "fov", (g) => Number((g.camera || g).fov ?? 35), !1, o), _ = z(r, t, "roll", (g) => Number((g.camera || g).roll ?? 0), !0, o), y = z(r, t, "zoom", (g) => Number((g.camera || g).zoom ?? 1), !1, o), v = z(r, t, "near", (g) => Number((g.camera || g).near ?? 0.01), !1, o), b = z(r, t, "far", (g) => Number((g.camera || g).far ?? 1e4), !1, o), x = r[0]?.camera || r[0] || se();
  let w = r[0];
  for (const g of r)
    if ((g.frame ?? 0) <= t) w = g;
    else break;
  const D = (w.camera || w).camera_type;
  return {
    position: [n, s, i],
    target: [l, m, c],
    fov: j(h, 5, 150),
    roll: _,
    camera_type: D || "perspective",
    zoom: Math.max(0.01, y),
    near: Math.max(1e-4, v),
    far: Math.max(v + 1e-4, b),
    ...x.up ? { up: [...x.up] } : {}
  };
}
const j = (e, t, a) => Math.max(t, Math.min(a, e)), ko = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, pe = (e, t = null) => typeof e == "string" && ko.test(e.trim()) ? e.trim() : t, C = (e, t) => [e[0] + t[0], e[1] + t[1], e[2] + t[2]], A = (e, t) => [e[0] - t[0], e[1] - t[1], e[2] - t[2]], k = (e, t) => [e[0] * t, e[1] * t, e[2] * t], U = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2], Se = (e, t) => [e[1] * t[2] - e[2] * t[1], e[2] * t[0] - e[0] * t[2], e[0] * t[1] - e[1] * t[0]], G = (e) => Math.sqrt(Math.max(1e-12, U(e, e))), ne = (e) => k(e, 1 / G(e));
function aa(e, t, a) {
  const r = [a[0] - t[0], a[1] - t[1]], o = [e[0] - t[0], e[1] - t[1]], n = Math.max(1e-9, r[0] * r[0] + r[1] * r[1]), s = j((o[0] * r[0] + o[1] * r[1]) / n, 0, 1);
  return Math.hypot(e[0] - t[0] - r[0] * s, e[1] - t[1] - r[1] * s);
}
function Do(e, t = "ease") {
  if (e = j(e, 0, 1), t === "hold") return 0;
  if (t === "linear") return e;
  if (t === "ease_in") return e * e;
  if (t === "ease_out") return 1 - (1 - e) * (1 - e);
  if (t === "smooth") return e * e * e * (e * (e * 6 - 15) + 10);
  if (t === "sine" || t === "ease_sine") return 0.5 * (1 - Math.cos(Math.PI * e));
  if (t === "cubic" || t === "ease_cubic") return e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
  if (t === "quintic" || t === "ease_quintic") return e < 0.5 ? 16 * Math.pow(e, 5) : 1 - Math.pow(-2 * e + 2, 5) / 2;
  if (t === "expo" || t === "ease_expo") return e === 0 ? 0 : e === 1 ? 1 : e < 0.5 ? Math.pow(2, 20 * e - 10) / 2 : (2 - Math.pow(2, -20 * e + 10)) / 2;
  if (t === "back" || t === "ease_back") {
    if (e <= 0) return 0;
    if (e >= 1) return 1;
    const a = 1.70158, r = a * 1.525;
    return e < 0.5 ? Math.pow(2 * e, 2) * ((r + 1) * 2 * e - r) / 2 : (Math.pow(2 * e - 2, 2) * ((r + 1) * (e * 2 - 2) + r) + 2) / 2;
  }
  return t === "bezier" ? 0.15 * (1 - e) * (1 - e) * e + 2.85 * (1 - e) * e * e + e * e * e : e * e * (3 - 2 * e);
}
const Dt = [
  "ease",
  "smooth",
  "bezier",
  "linear",
  "ease_in",
  "ease_out",
  "hold",
  "sine",
  "cubic",
  "quintic",
  "expo",
  "back",
  "ease_sine",
  "ease_cubic",
  "ease_quintic",
  "ease_expo",
  "ease_back"
], jo = ["auto", "clamped", "vector", "free", "aligned", "flat"];
function To(e, t) {
  const a = e?.tangents;
  return !a || typeof a != "object" ? {} : a.channels && typeof a.channels == "object" && a.channels[t] ? a.channels[t] : a;
}
function jt(e, t, a, r, o) {
  const n = To(e, t), s = jo.includes(n.mode) ? n.mode : e?.tangents?.mode || "auto", i = o ? o(e) : 0, l = a && o ? o(a) : i, m = r && o ? o(r) : i, c = Math.max(1e-6, e.frame - (a?.frame ?? e.frame - 1)), d = Math.max(1e-6, (r?.frame ?? e.frame + 1) - e.frame), p = (v = !1) => {
    const b = (i - l) / c, x = (m - i) / d;
    let w = 0;
    if (!a && !r)
      w = 0;
    else if (!a)
      w = x;
    else if (!r)
      w = b;
    else if (b * x <= 0)
      w = 0;
    else {
      const D = d / (c + d), g = c / (c + d);
      if (w = b * D + x * g, v) {
        const M = 3 * Math.min(Math.abs(b), Math.abs(x));
        w = j(w, -M, M);
      }
    }
    return {
      out_x: 1 / 3,
      out_y: w ? w * d * (1 / 3) : 0,
      in_x: -1 / 3,
      in_y: w ? -w * c * (1 / 3) : 0
    };
  };
  if (s === "vector") {
    const v = (i - l) / c, b = (m - i) / d;
    return {
      out_x: 1 / 3,
      out_y: b * d * (1 / 3),
      in_x: -1 / 3,
      in_y: -v * c * (1 / 3),
      mode: s
    };
  }
  if (s === "flat")
    return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: s };
  if (s === "clamped")
    return { ...p(!0), mode: s };
  if (s === "auto")
    return { ...p(!1), mode: s };
  const u = p(!1), f = j(Number(n.out_x ?? u.out_x), 0.01, 0.99), h = Number(n.out_y ?? u.out_y);
  let _ = j(Number(n.in_x ?? u.in_x), -0.99, -0.01), y = Number(n.in_y ?? u.in_y);
  if (s === "aligned") {
    const v = Math.hypot(f, h) || 1e-6, b = Math.hypot(_, y) || 1e-6;
    _ = -f / v * b, y = -h / v * b;
  }
  return { out_x: f, out_y: h, in_x: _, in_y: y, mode: s };
}
function pt(e, t) {
  if (!e.length || t <= e[0].frame || t >= e[e.length - 1].frame) return null;
  let a = 0, r = e.length - 1;
  for (; a + 1 < r; ) {
    const o = a + r >> 1;
    e[o].frame <= t ? a = o : r = o;
  }
  return { leftIndex: a, left: e[a], right: e[a + 1] };
}
function z(e, t, a, r, o = !1, n = null) {
  if (!e.length) return 0;
  if (t <= e[0].frame) return r(e[0]);
  if (t >= e[e.length - 1].frame) return r(e[e.length - 1]);
  const s = n || pt(e, t), { leftIndex: i, left: l, right: m } = s, c = i > 0 ? e[i - 1] : null, d = i + 2 < e.length ? e[i + 2] : null, p = Math.max(1, m.frame - l.frame), u = j((t - l.frame) / p, 0, 1);
  let f = r(l), h = r(m);
  if (o) {
    const v = ((h - f + 540) % 360 + 360) % 360 - 180;
    h = f + v;
  }
  if (l.interpolation === "bezier" || m.interpolation === "bezier") {
    const v = jt(l, a, c, m, r), b = jt(m, a, l, d, r), x = f, w = f + (v.out_y || 0), D = h + (b.in_y || 0), g = h, M = j(Number(v.out_x ?? 1 / 3), 0, 1), T = j(1 + Number(b.in_x ?? -1 / 3), 0, 1);
    let q = 0, ee = 1;
    for (let St = 0; St < 32; St++) {
      const H = (q + ee) * 0.5, He = 1 - H;
      3 * He * He * H * M + 3 * He * H * H * T + H * H * H < u ? q = H : ee = H;
    }
    const Z = (q + ee) * 0.5, te = 1 - Z;
    return te * te * te * x + 3 * te * te * Z * w + 3 * te * Z * Z * D + Z * Z * Z * g;
  }
  const y = Do(u, l.interpolation);
  return f + (h - f) * y;
}
function se() {
  return { position: [6, 4, 6], target: [0, 1.5, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 };
}
function ze() {
  const e = [0, 1, 0], t = (a, r = [0, 1, 0], o = "orthographic") => ({ ...se(), position: a, target: [...e], up: r, camera_type: o, zoom: 1 });
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
function ce(e) {
  const t = e.size || [1, 1, 1], a = t.length === 2 ? [...t, 0.01] : [...t];
  return { position: [...e.position || [0, 0, 0]], rotation: [...e.rotation || [0, 0, 0]], size: a };
}
function Ke(e, t) {
  const a = e.keyframes || [];
  if (!a.length) return ce(e);
  const r = ce(e), o = (y, v) => (y.transform?.position || r.position)[v] ?? 0, n = (y, v) => (y.transform?.rotation || r.rotation)[v] ?? 0, s = (y, v) => (y.transform?.size || r.size)[v] ?? (v === 2 ? 0.01 : 1), i = pt(a, t), l = z(a, t, "pos_x", (y) => o(y, 0), !1, i), m = z(a, t, "pos_y", (y) => o(y, 1), !1, i), c = z(a, t, "pos_z", (y) => o(y, 2), !1, i), d = z(a, t, "rot_x", (y) => n(y, 0), !0, i), p = z(a, t, "rot_y", (y) => n(y, 1), !0, i), u = z(a, t, "rot_z", (y) => n(y, 2), !0, i), f = z(a, t, "scale_x", (y) => s(y, 0), !1, i), h = z(a, t, "scale_y", (y) => s(y, 1), !1, i), _ = z(a, t, "scale_z", (y) => s(y, 2), !1, i);
  return {
    position: [Number.isFinite(l) ? l : r.position[0], Number.isFinite(m) ? m : r.position[1], Number.isFinite(c) ? c : r.position[2]],
    rotation: [Number.isFinite(d) ? d : r.rotation[0], Number.isFinite(p) ? p : r.rotation[1], Number.isFinite(u) ? u : r.rotation[2]],
    size: [
      Math.max(0.01, Number.isFinite(f) ? f : r.size[0]),
      Math.max(0.01, Number.isFinite(h) ? h : r.size[1]),
      Math.max(0.01, Number.isFinite(_) ? _ : r.size[2])
    ]
  };
}
function Hs(e = "balanced", t = "all_views", a = null) {
  const r = {
    none: 0,
    0: 0,
    sparse: 300,
    balanced: 800,
    dense: 1800,
    ultra: 3500
  }, o = r[e] !== void 0 ? r[e] : 800;
  if (o <= 0)
    return { points: [], colors: [] };
  const n = [], s = [];
  let i = 0.65, l = 0.72, m = 0.82;
  if (typeof a == "string" && a.startsWith("#")) {
    const p = a.replace("#", "");
    p.length === 6 && (i = parseInt(p.slice(0, 2), 16) / 255, l = parseInt(p.slice(2, 4), 16) / 255, m = parseInt(p.slice(4, 6), 16) / 255);
  }
  const c = 0.618033988749895, d = 0.324717957244746;
  for (let p = 0; p < o; p++) {
    const u = p * c % 1, f = p * d % 1, h = (p + 0.5) * 0.7548776662466927 % 1;
    let _ = 0, y = 0, v = 0, b = 0.65, x = 0.72, w = 0.82;
    if (t === "ground_focus")
      if (u < 0.6) {
        const D = 0.4 + Math.sqrt(f) * 24, g = h * Math.PI * 2 + p * 2.399963229728653;
        _ = Math.cos(g) * D, v = Math.sin(g) * D, y = 0.01 + u * 0.75, b = 0.86, x = 0.9, w = 0.98;
      } else {
        const D = 1 + Math.sqrt(f) * 18, g = h * Math.PI * 2 + p * 2.399963229728653;
        _ = Math.cos(g) * D, v = Math.sin(g) * D, y = 0.75 + (u - 0.6) * 8.5, b = 0.62, x = 0.7, w = 0.82;
      }
    else if (t === "dome") {
      const D = u * Math.PI * 2, g = 1 - 2 * f, M = Math.sqrt(Math.max(0, 1 - g * g)), T = 1.5 + Math.cbrt(h) * 20;
      _ = Math.cos(D) * M * T, v = Math.sin(D) * M * T, y = Math.max(0.01, g * T * 0.75 + 2.5), b = 0.72, x = 0.78, w = 0.88;
    } else {
      const D = p % 4;
      if (D === 0) {
        const g = 0.3 + Math.sqrt(f) * 28, M = p * 2.399963229728653;
        _ = Math.cos(M) * g, v = Math.sin(M) * g, y = 0.01 + h * 0.34, b = 0.9, x = 0.94, w = 1;
      } else if (D === 1) {
        const g = 0.6 + Math.sqrt(f) * 18, M = p * 2.399963229728653;
        _ = Math.cos(M) * g, v = Math.sin(M) * g, y = 0.35 + h * 3.15, b = 0.68, x = 0.76, w = 0.86;
      } else if (D === 2) {
        const g = 2 + Math.sqrt(f) * 24, M = p * 2.399963229728653;
        _ = Math.cos(M) * g, v = Math.sin(M) * g, y = 3.5 + h * 11.5, b = 0.55, x = 0.65, w = 0.78;
      } else {
        const g = 0.5 + f * 6.5, M = p * 2.399963229728653;
        _ = Math.cos(M) * g, v = Math.sin(M) * g, y = 0.05 + h * 4.95, b = 0.8, x = 0.86, w = 0.94;
      }
    }
    n.push(_, y, v), s.push(a ? b * i : b, a ? x * l : x, a ? w * m : w);
  }
  return { points: n, colors: s };
}
function Ao() {
  const e = se(), t = [{ frame: 0, camera: L(e), interpolation: "ease" }];
  return {
    schema_version: 1,
    fps: 24,
    duration_frames: 120,
    width: 1280,
    height: 720,
    render_mode: "omni_ref",
    camera: e,
    keyframes: t,
    cameras: [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: L(e), keyframes: t }],
    active_camera_id: "camera_1",
    playblast_camera_id: "camera_1",
    objects: [
      { id: "subject", type: "card", name: "Subject Card", position: [0, 1.5, 0], rotation: [0, 0, 0], size: [2, 3, 0.01], material_mode: "textured", color: "#8c929b", keyframes: [], enabled: !0, asset: "" },
      { id: "sun_light", type: "sun_light", name: "Sun light", position: [5, 8.5, 4], rotation: [-55, 35, 0], size: [1, 1, 1], color: "#fff6ec", intensity: 2.2, cast_shadow: !0, keyframes: [], enabled: !0 }
    ],
    metadata: {},
    guides: !0,
    burn_in: !1,
    speed_heatmap: !1,
    playblast_grid: !1,
    playblast_labels: !1,
    playblast_resolution: "output",
    playblast_quality: "balanced",
    card_fit: "contain",
    card_asset: "",
    reference_index: 0,
    // Interactive inspection defaults to the recovered source texture (the plan's
    // "interactive layout inspection may use Source Texture"); omni_ref conditioning
    // playblasts force Neutral regardless of this value (see viewport/resources.js's
    // cleanCapture check), so this default never leaks a textured proxy into a
    // conditioning reference.
    reconstruction_appearance: "source_texture",
    point_density: "balanced",
    point_spread: "all_views",
    point_color: "#cbd5e1",
    viewport_bg_color: "#121212",
    viewport_bg_image: "",
    viewport_bg_sequence: [],
    show_grid: !0,
    show_radar: !0,
    show_camera_paths: !0,
    show_camera_gizmos: !0,
    show_look_at: !0,
    show_helper_axes: !0,
    show_gizmo: !0,
    show_wireframe: !1,
    show_vertices: !1,
    backface_culling: !1,
    select_mode: "object",
    gizmo_mode: "translate",
    gizmo_space: "world",
    navigation_profile: "simple",
    spatial_snap_mode: "none",
    spatial_grid_size: 0.5,
    auto_key: !1,
    view_mode: "perspective",
    camera_view_visible: !0,
    editor_views: ze(),
    ui_density: "animation",
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
    outliner_height: P.outlinerHeight.default,
    preview_width: P.previewWidth.default,
    side_width: P.sideWidth.default,
    left_width: P.leftWidth.default,
    graph_height: P.graphHeight.default,
    health_profile: "generic",
    motion_layers: [],
    selected_motion_layer_id: null,
    motion_tool: "select",
    sequence: Kr()
  };
}
function L(e) {
  const t = se();
  if (!e || typeof e != "object") return t;
  const a = Array.isArray(e.position) ? [...e.position] : [...t.position], r = Array.isArray(e.target) ? [...e.target] : [...t.target], o = Math.max(1e-4, Number.isFinite(Number(e.near)) ? Number(e.near) : 0.01), n = Number.isFinite(Number(e.far)) ? Number(e.far) : 1e4;
  return {
    position: a,
    target: r,
    fov: Number(e.fov ?? 35),
    roll: Number(e.roll ?? 0),
    camera_type: e.camera_type || "perspective",
    zoom: Number(e.zoom ?? 1),
    near: o,
    far: Math.max(o + 1e-4, n),
    ...Array.isArray(e.up) ? { up: [...e.up] } : {}
  };
}
const Ce = {
  maxCameras: 16,
  maxObjects: 256,
  maxKeysPerTrack: 1e4,
  maxDurationFrames: 14400
}, P = {
  // The Outliner list gets an explicit height the handle drives directly, so
  // dragging it down enlarges the visible box (the node grows to match) rather
  // than just shifting a cramped inner scrollbar. The ceiling is only a sanity
  // bound against a corrupt workflow, not a layout limit the user will hit.
  outlinerHeight: { default: 220, min: 90, max: 1600 },
  previewWidth: { default: 236, min: 150, max: 760 },
  sideWidth: { default: 280, min: 200, max: 640 },
  leftWidth: { default: 264, min: 214, max: 520 },
  graphHeight: { default: 220, min: 140, max: 720 }
};
function W(e, t, a, r) {
  if (e == null || e === "") return t;
  const o = Number(e);
  return Number.isFinite(o) ? j(o, a, r) : t;
}
function Ws(e) {
  const t = Ao();
  if (!e || typeof e != "object") return t;
  const a = { ...t, ...e };
  a.fps = Math.round(W(a.fps, 24, 1, 120)), a.duration_frames = Math.round(W(a.duration_frames, 120, 1, Ce.maxDurationFrames)), a.width = Math.round(W(a.width, 1280, 64, 4096)), a.height = Math.round(W(a.height, 720, 64, 4096));
  const r = (c, d) => (Array.isArray(c) ? c : []).slice(0, Ce.maxKeysPerTrack).map((p) => ({
    frame: Math.max(0, Math.round(Number(p.frame || 0))),
    camera: L(p.camera || p || d),
    interpolation: Dt.includes(p.interpolation) ? p.interpolation : "ease",
    ...p.tangents && typeof p.tangents == "object" ? { tangents: { ...p.tangents } } : {},
    ...Array.isArray(p.references) ? { references: p.references.map((u) => ({ ...u })) } : {}
  })), o = L(a.camera || t.camera);
  let n = r(a.keyframes, o);
  n = [...new Map(n.map((c) => [c.frame, c])).values()].sort((c, d) => c.frame - d.frame), n.length || (n = [{ frame: 0, camera: L(o), interpolation: "ease" }]);
  const s = Array.isArray(a.cameras) && a.cameras.length ? a.cameras : [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: o, keyframes: n }], i = /* @__PURE__ */ new Set();
  a.cameras = s.slice(0, Ce.maxCameras).map((c, d) => {
    let p = String(c?.id || `camera_${d + 1}`);
    i.has(p) && (p = `camera_${d + 1}`), i.add(p);
    const u = L(c?.camera || c?.keyframes?.[0]?.camera || o);
    let f = r(c?.keyframes, u);
    return f = [...new Map(f.map((h) => [h.frame, h])).values()].sort((h, _) => h.frame - _.frame), f.length || (f = [{ frame: 0, camera: L(u), interpolation: "ease" }]), {
      id: p,
      name: String(c?.name || `Camera ${d + 1}`),
      color: pe(c?.color),
      camera: u,
      keyframes: f,
      target_object_id: typeof c?.target_object_id == "string" ? c.target_object_id : typeof a.target_object_id == "string" ? a.target_object_id : null,
      target_offset: Array.isArray(c?.target_offset) ? c.target_offset.map(Number) : [0, 0, 0],
      // Bone the camera aims at inside the tracked model; null tracks it whole.
      aim_bone: typeof c?.aim_bone == "string" && c.aim_bone ? c.aim_bone : null,
      locked: !!c?.locked,
      muted: !!c?.muted,
      solo: !!c?.solo,
      recording_path: typeof c?.recording_path == "string" ? c.recording_path : ""
    };
  }), a.active_camera_id = a.cameras.some((c) => c.id === a.active_camera_id) ? a.active_camera_id : a.cameras[0].id, a.sequence = qr(a.sequence, a.cameras.map((c) => c.id)), a.playblast_camera_id = a.playblast_camera_id === Br && a.sequence.cuts.length || a.cameras.some((c) => c.id === a.playblast_camera_id) ? a.playblast_camera_id : a.active_camera_id;
  const l = a.cameras.find((c) => c.id === a.active_camera_id);
  a.camera = l.camera, a.keyframes = l.keyframes, a.target_object_id = l.target_object_id || null, a.target_offset = l.target_offset || [0, 0, 0], a.aim_bone = l.aim_bone || null, a.objects = (Array.isArray(a.objects) ? a.objects : t.objects).slice(0, Ce.maxObjects).map((c) => ({
    ...c,
    color: pe(c?.color),
    locked: !!c.locked,
    parent_id: typeof c.parent_id == "string" ? c.parent_id : null,
    position: Array.isArray(c.position) ? c.position.map(Number) : [0, 0, 0],
    rotation: Array.isArray(c.rotation) ? c.rotation.map(Number) : [0, 0, 0],
    size: Array.isArray(c.size) ? c.size.length === 2 ? [...c.size.map(Number), 0.01] : c.size.map(Number) : [1, 1, 1],
    material_mode: ["textured", "checker", "neutral", "wireframe", "wireframe_texture", "wireframe_neutral", "matte"].includes(c.material_mode) ? c.material_mode : "textured",
    ...c?.intensity !== void 0 ? { intensity: Number.isFinite(Number(c.intensity)) ? Math.max(0, Number(c.intensity)) : c.type === "sun_light" ? 2.2 : 2 } : {},
    ...c?.cast_shadow !== void 0 ? { cast_shadow: !!c.cast_shadow } : {},
    ...c?.cone_angle !== void 0 ? { cone_angle: j(Number(c.cone_angle) || 45, 1, 90) } : {},
    ...c?.penumbra !== void 0 ? { penumbra: j(Number(c.penumbra) || 0.25, 0, 1) } : {},
    // Machine-semantic tags and the visible viewport label are additive fields
    // (design spec sections 12-14); drop them entirely when empty so an
    // untouched object serialises byte-identical to before.
    ...c?.tags !== void 0 ? { tags: Je(c.tags) } : {},
    ...Mt(c?.annotation) ? { annotation: Mt(c.annotation) } : {},
    // A rigged-character block (rig_profile + FK pose); dropped when absent so
    // a plain model still serialises identically (design spec sections 10, 26).
    ...c?.character ? { character: wo(c.character) } : {},
    keyframes: (Array.isArray(c.keyframes) ? c.keyframes : []).map((d) => ({
      frame: Math.max(0, Math.round(Number(d.frame || 0))),
      transform: ce(d.transform || c),
      interpolation: Dt.includes(d.interpolation) ? d.interpolation : "ease",
      ...d.tangents && typeof d.tangents == "object" ? { tangents: { ...d.tangents } } : {}
    })).sort((d, p) => d.frame - p.frame)
  })), a.gizmo_mode = ["translate", "rotate", "scale"].includes(a.gizmo_mode) ? a.gizmo_mode : "translate", a.gizmo_space = a.gizmo_space === "local" ? "local" : "world", a.navigation_profile = ["maya", "blender", "simple"].includes(a.navigation_profile) ? a.navigation_profile : "simple", a.spatial_snap_mode = ["none", "grid", "vertex"].includes(a.spatial_snap_mode) ? a.spatial_snap_mode : "none", a.spatial_grid_size = j(Number(a.spatial_grid_size) || 0.5, 0.01, 100), a.ui_density = ["basic", "animation", "advanced"].includes(a.ui_density) ? a.ui_density : "animation", a.select_mode = ["object", "vertex", "edge", "face"].includes(a.select_mode) ? a.select_mode : "object", a.show_grid = a.show_grid !== !1, a.show_camera_paths = a.show_camera_paths !== !1, a.show_camera_gizmos = a.show_camera_gizmos !== !1, a.show_look_at = a.show_look_at !== !1, a.show_helper_axes = a.show_helper_axes !== !1, a.show_gizmo = a.show_gizmo !== !1, a.show_wireframe = !!a.show_wireframe, a.show_vertices = !!a.show_vertices, a.backface_culling = !!a.backface_culling, a.point_density = ["none", "0", "sparse", "balanced", "dense", "ultra"].includes(a.point_density) ? a.point_density : "balanced", a.point_spread = ["all_views", "ground_focus", "dome"].includes(a.point_spread) ? a.point_spread : "all_views", a.point_color = pe(a.point_color, "#cbd5e1"), a.viewport_bg_color = pe(a.viewport_bg_color, "#121212"), a.viewport_bg_image = typeof a.viewport_bg_image == "string" ? a.viewport_bg_image : "", a.viewport_bg_sequence = Array.isArray(a.viewport_bg_sequence) ? a.viewport_bg_sequence.map(String) : [], a.snap_enabled = a.snap_enabled !== !1, a.snap_frames = Math.max(1, Math.round(Number(a.snap_frames) || 1)), a.timecode_mode = ["time", "timecode"].includes(a.timecode_mode) ? a.timecode_mode : "time", a.loop_playback = !!a.loop_playback, a.playback_range = Array.isArray(a.playback_range) && a.playback_range.length === 2 ? [j(Math.round(Number(a.playback_range[0]) || 0), 0, a.duration_frames - 1), j(Math.round(Number(a.playback_range[1]) || a.duration_frames - 1), 0, a.duration_frames - 1)] : null, a.markers = (Array.isArray(a.markers) ? a.markers : []).filter((c) => c && Number.isFinite(Number(c.frame))).map((c, d) => ({ frame: Math.max(0, Math.round(Number(c.frame))), name: String(c.name || `Marker ${d + 1}`).slice(0, 40), color: pe(c.color, "#f2d06b") })), a.preview_layout = ["auto", "1", "2", "4"].includes(String(a.preview_layout)) ? String(a.preview_layout) : "auto", a.outliner_height = Math.round(W(a.outliner_height, P.outlinerHeight.default, P.outlinerHeight.min, P.outlinerHeight.max)), a.preview_width = Math.round(W(a.preview_width, P.previewWidth.default, P.previewWidth.min, P.previewWidth.max)), a.side_width = Math.round(W(a.side_width, P.sideWidth.default, P.sideWidth.min, P.sideWidth.max)), a.left_width = Math.round(W(a.left_width, P.leftWidth.default, P.leftWidth.min, P.leftWidth.max)), a.graph_height = Math.round(W(a.graph_height, P.graphHeight.default, P.graphHeight.min, P.graphHeight.max)), a.maximized_camera_id = typeof a.maximized_camera_id == "string" ? a.maximized_camera_id : null, a.safe_areas = !!a.safe_areas, a.resolution_gate = !!a.resolution_gate, a.aspect_ratio = ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"].includes(a.aspect_ratio) ? a.aspect_ratio : "auto", a.auto_key = !!a.auto_key, a.playblast_grid = !!a.playblast_grid, a.playblast_labels = !!a.playblast_labels, a.playblast_resolution = ["viewport", "half", "output", "double"].includes(a.playblast_resolution) ? a.playblast_resolution : "output", a.playblast_quality = ["low", "balanced", "high"].includes(a.playblast_quality) ? a.playblast_quality : "balanced", a.reference_index = Math.max(0, Number(a.reference_index || 0)), a.view_mode = ["camera", "perspective", "iso", "front", "back", "top", "right", "left", "bottom"].includes(a.view_mode) ? a.view_mode : "perspective", a.camera_view_visible = a.camera_view_visible !== !1, a.reconstruction_appearance = ["neutral", "source_texture"].includes(a.reconstruction_appearance) ? a.reconstruction_appearance : "source_texture";
  const m = ze();
  return a.editor_views = Object.fromEntries(Object.entries(m).map(([c, d]) => [c, L(a.editor_views?.[c] || d)])), Xr(a);
}
function xe(e, t) {
  const [a, r, o] = (t || [0, 0, 0]).map((l) => l * Math.PI / 180);
  let [n, s, i] = e;
  return [s, i] = [s * Math.cos(a) - i * Math.sin(a), s * Math.sin(a) + i * Math.cos(a)], [n, i] = [n * Math.cos(r) + i * Math.sin(r), -n * Math.sin(r) + i * Math.cos(r)], [n, s] = [n * Math.cos(o) - s * Math.sin(o), n * Math.sin(o) + s * Math.cos(o)], [n, s, i];
}
function Ne(e = [0, 0, 0]) {
  const [t, a, r] = e.map((c) => c * Math.PI / 360), o = Math.cos(t), n = Math.sin(t), s = Math.cos(a), i = Math.sin(a), l = Math.cos(r), m = Math.sin(r);
  return [n * s * l + o * i * m, o * i * l - n * s * m, o * s * m + n * i * l, o * s * l - n * i * m];
}
function Eo(e, t) {
  return [e[3] * t[0] + e[0] * t[3] + e[1] * t[2] - e[2] * t[1], e[3] * t[1] - e[0] * t[2] + e[1] * t[3] + e[2] * t[0], e[3] * t[2] + e[0] * t[1] - e[1] * t[0] + e[2] * t[3], e[3] * t[3] - e[0] * t[0] - e[1] * t[1] - e[2] * t[2]];
}
function ra(e, [t, a, r, o]) {
  const [n, s, i] = e, l = o * n + a * i - r * s, m = o * s + r * n - t * i, c = o * i + t * s - a * n, d = -t * n - a * s - r * i;
  return [l * o - d * t - m * r + c * a, m * o - d * a - c * t + l * r, c * o - d * r - l * a + m * t];
}
function Io([e, t, a, r]) {
  const o = 1 - 2 * (t * t + a * a), n = 2 * (e * t - a * r), s = 2 * (e * a + t * r), i = 1 - 2 * (e * e + a * a), l = 2 * (t * a - e * r), m = 2 * (t * a + e * r), c = 1 - 2 * (e * e + t * t), d = Math.asin(Math.max(-1, Math.min(1, s))), [p, u] = Math.abs(s) < 0.9999999 ? [Math.atan2(-l, c), Math.atan2(-n, o)] : [Math.atan2(m, i), 0];
  return [p, d, u].map((f) => f * 180 / Math.PI);
}
function oa(e, t) {
  const a = t.quaternion || Ne(t.rotation), r = Eo(a, e.quaternion || Ne(e.rotation));
  return { position: C(ra(e.position.map((o, n) => o * t.size[n]), a), t.position), rotation: Io(r), quaternion: r, size: e.size.map((o, n) => o * t.size[n]) };
}
function Oo(e, t) {
  const a = new Map(e.map((o) => [o.id, o])), r = (o, n = /* @__PURE__ */ new Set()) => {
    const s = { ...ce(o), quaternion: Ne(o.rotation) };
    if (!o?.id || n.has(o.id)) return s;
    const i = o.parent_id ? a.get(o.parent_id) : null;
    if (!i) return s;
    const l = new Set(n);
    return l.add(o.id), oa(s, r(i, l));
  };
  return r(t);
}
function ft(e, t, a, r = /* @__PURE__ */ new Set()) {
  const o = Ke(t, a);
  if (!t?.id || r.has(t.id)) return o;
  const n = new Set(r);
  n.add(t.id);
  const s = t.parent_id ? e.find((l) => l.id === t.parent_id) : null;
  if (!s) return o;
  const i = ft(e, s, a, n);
  return oa(o, i);
}
const Tt = ["speed", "angular_speed", "acceleration", "jerk"], $e = ["ok", "warn", "over"], na = 0.8, Po = [0, 1.5, 0];
function At(e, t) {
  const a = [0];
  for (let r = 1; r < e.length; r++) a.push(Math.abs(e[r] - e[r - 1]) * t);
  return a;
}
function zo(e, t) {
  const a = [0];
  for (let r = 1; r < e.length; r++) {
    const o = e[r - 1].position, n = e[r].position;
    a.push(Math.sqrt((n[0] - o[0]) ** 2 + (n[1] - o[1]) ** 2 + (n[2] - o[2]) ** 2) * t);
  }
  return a;
}
function No(e, t) {
  const a = [0];
  for (let r = 1; r < e.length; r++) {
    const o = F(e[r - 1]), n = F(e[r]), s = ["right", "up", "forward"].reduce(
      (l, m) => l + o[m][0] * n[m][0] + o[m][1] * n[m][1] + o[m][2] * n[m][2],
      0
    ), i = Math.max(-1, Math.min(1, (s - 1) * 0.5));
    a.push(Math.acos(i) * 180 / Math.PI * t);
  }
  return a;
}
function Ro(e, t = null) {
  if (t) return t.map(Number);
  const a = (e.objects || []).find((r) => r?.id === "subject");
  return Array.isArray(a?.position) ? a.position.slice(0, 3).map(Number) : [...Po];
}
function Lo(e, t, a, r) {
  return e.map((o) => {
    const n = R(t, o, a, r);
    return !!(n && n[0] >= 0 && n[0] < a && n[1] >= 0 && n[1] < r);
  });
}
function Et(e, t) {
  return t == null || t <= 0 ? "ok" : e > t ? "over" : e > t * na ? "warn" : "ok";
}
function It(e) {
  for (let t = $e.length - 1; t >= 0; t--) if (e.includes($e[t])) return $e[t];
  return "ok";
}
function Fo(e, t) {
  return e.length === t.length && e.every((a, r) => a === t[r]);
}
function Vo(e, t) {
  const a = [];
  for (let r = 0; r < e.length; r++) {
    const o = [...t[r]].sort(), n = a[a.length - 1];
    if (n && n.grade === e[r] && Fo(n.metrics, o)) {
      n.end = r;
      continue;
    }
    a.push({ start: r, end: r, grade: e[r], metrics: o });
  }
  return a;
}
function sa(e, t = {}, a = null, r = "generic") {
  const o = Math.max(1, Number(e.fps) || 24), n = Math.max(1, Number(e.duration_frames) || 1), s = Math.max(1, Number(e.width) || 1280), i = Math.max(1, Number(e.height) || 720), l = [];
  for (let g = 0; g < n; g++) l.push(le(e, g, e.objects));
  const m = zo(l, o), c = No(l, o), d = At(m, o), p = At(d, o), u = { speed: m, angular_speed: c, acceleration: d, jerk: p }, f = Ro(e, a), h = Lo(l, f, s, i), _ = l.map((g) => g.fov), y = t.allow_framing_loss === !0, v = [], b = [];
  for (let g = 0; g < n; g++) {
    const M = [], T = [];
    for (const q of Tt) {
      const ee = Et(u[q][g], t[`max_${q}`]);
      M.push(ee), ee !== "ok" && T.push(q);
    }
    !h[g] && !y && (M.push("over"), T.push("framing_loss")), v.push(It(M)), b.push(T);
  }
  const x = h.filter((g) => !g).length, w = {
    profile: r,
    warn_ratio: na,
    limits: t,
    subject: f,
    duration_frames: n,
    fps: o,
    max_speed: Math.max(...m),
    max_angular_speed: Math.max(...c),
    max_acceleration: Math.max(...d),
    max_jerk: Math.max(...p),
    max_fov_change: Math.max(..._) - Math.min(..._),
    framing_loss_frames: x,
    series: u,
    framing: h,
    frame_grades: v,
    segments: Vo(v, b),
    violations: []
  };
  for (const g of [...Tt, "fov_drift"]) {
    const M = g === "fov_drift" ? "max_fov_change" : `max_${g}`, T = t[M];
    T != null && w[M] > Number(T) && w.violations.push({ metric: M, value: w[M], recommended_max: Number(T) });
  }
  x && !y && w.violations.push({ metric: "framing_loss_frames", value: x, recommended_max: 0 });
  const D = Et(w.max_fov_change, t.max_fov_change);
  return w.track_grades = { fov_drift: D }, w.grade = It([...v, D]), w.trajectory_valid = w.violations.length === 0, w.ok = w.trajectory_valid, w;
}
function Bo(e) {
  return e.segments.filter((t) => t.grade !== "ok").sort((t, a) => (a.grade === "over") - (t.grade === "over") || a.end - a.start - (t.end - t.start));
}
function et(e, t) {
  const a = Math.max(1, e.state.duration_frames - 1), r = j(Number(e.timelineZoom) || 1, 0.1, 50), o = Number(e.timelinePan) || 0, n = a / r;
  return (t - o) / Math.max(1e-6, n) * 100;
}
function ia(e, t, a) {
  const r = a.getBoundingClientRect(), o = Math.max(1, e.state.duration_frames - 1), n = j(Number(e.timelineZoom) || 1, 0.1, 50), s = Number(e.timelinePan) || 0, i = o / n, l = (t.clientX - r.left) / Math.max(1, r.width);
  return j(Math.round(s + l * i), 0, o);
}
function $s(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = Math.max(1, e.state.duration_frames - 1), r = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey)
    e.timelinePan = j((Number(e.timelinePan) || 0) + (t.deltaY > 0 ? 4 : -4), -a * 0.5, a);
  else {
    const n = t.currentTarget.getBoundingClientRect(), s = (t.clientX - n.left) / Math.max(1, n.width), i = j(Number(e.timelineZoom) || 1, 0.2, 30), l = j(i * r, 0.2, 30), m = a / i, c = a / l, d = (Number(e.timelinePan) || 0) + s * m;
    e.timelinePan = j(d - s * c, -a * 0.5, a), e.timelineZoom = l;
  }
  e.refreshKeys(), e.setStatus(S(`Timeline zoom: ${(e.timelineZoom * 100).toFixed(0)}%`));
}
function Us(e) {
  e.timelineZoom = 1, e.timelinePan = 0, e.refreshKeys(), e.setStatus(S("Timeline view fitted"));
}
function Xs(e, t) {
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
    const r = a.getBoundingClientRect();
    e.boxSelect = { box: a, pointerId: t.pointerId, startX: t.clientX - r.left, currentX: t.clientX - r.left };
    return;
  }
  e.selectedKeyFrames = null, e.timelineDrag = { box: a, pointerId: t.pointerId }, e.setFrame(ia(e, t, a));
}
function Ys(e, t) {
  if (e.timelinePanDrag && t.pointerId === e.timelinePanDrag.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const a = t.clientX - e.timelinePanDrag.startX, r = e.timelineDrag?.box || e.root.querySelector('[data-role="dope-tracks"]'), n = Math.max(1, e.state.duration_frames - 1) / (Number(e.timelineZoom) || 1);
    e.timelinePan = e.timelinePanDrag.origPan - a / Math.max(1, r.clientWidth) * n, e.refreshKeys();
    return;
  }
  if (e.boxSelect && t.pointerId === e.boxSelect.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const a = e.boxSelect.box.getBoundingClientRect();
    e.boxSelect.currentX = t.clientX - a.left;
    let r = e.boxSelect.overlay;
    r || (r = document.createElement("div"), r.className = "box-select", e.boxSelect.box.appendChild(r), e.boxSelect.overlay = r);
    const o = Math.min(e.boxSelect.startX, e.boxSelect.currentX);
    r.style.left = `${o}px`, r.style.width = `${Math.abs(e.boxSelect.currentX - e.boxSelect.startX)}px`, r.style.top = "0", r.style.bottom = "0";
    return;
  }
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.setFrame(ia(e, t, e.timelineDrag.box), !1, !1));
}
function Zs(e, t) {
  if (e.timelinePanDrag && t.pointerId === e.timelinePanDrag.pointerId) {
    e.timelinePanDrag = null;
    return;
  }
  if (e.boxSelect && t.pointerId === e.boxSelect.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const a = e.boxSelect.box.getBoundingClientRect(), r = Math.max(1, e.state.duration_frames - 1), o = j(Number(e.timelineZoom) || 1, 0.1, 50), n = Number(e.timelinePan) || 0, s = r / o, i = (d) => j(n + d / Math.max(1, a.width) * s, 0, r), l = Math.min(i(e.boxSelect.startX), i(e.boxSelect.currentX)), m = Math.max(i(e.boxSelect.startX), i(e.boxSelect.currentX));
    e.boxSelect.overlay?.remove(), e.boxSelect = null;
    const c = e.timelineKeyframes().filter((d) => d.frame >= l && d.frame <= m).map((d) => d.frame);
    c.length && (e.selectedKeyFrames = new Set(c), e.selectedKeyFrame = c[0], e.updateKeyVisualState(), e.refreshKeyEditor(), e.setStatus(S(`${c.length} keys selected`)));
    return;
  }
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.timelineDrag.box.hasPointerCapture?.(t.pointerId) && e.timelineDrag.box.releasePointerCapture(t.pointerId), e.timelineDrag = null, e.refreshKeys());
}
const Ko = 4;
function qo(e, t) {
  const a = e.keyDrag;
  if (!a) return;
  if (!a.engaged) {
    if (Math.hypot(t.clientX - (a.startClientX ?? t.clientX), t.clientY - (a.startClientY ?? t.clientY)) < Ko) return;
    a.engaged = !0;
  }
  a.historyCheckpointed || (e.checkpoint?.("Move keyframe"), a.historyCheckpointed = !0);
  const r = a.box.getBoundingClientRect(), o = Math.max(1, e.state.duration_frames - 1), n = j(Number(e.timelineZoom) || 1, 0.1, 50), s = Number(e.timelinePan) || 0, i = o / n;
  let l = Math.round(j(s + (t.clientX - r.left) / Math.max(1, r.width) * i, 0, o));
  l = e.snapFrame(l);
  const m = l - a.startPointerFrame;
  let c = a.badge;
  c || (c = document.createElement("div"), c.className = "floating-retime-badge", a.box.appendChild(c), a.badge = c);
  const d = et(e, l);
  if (c.style.left = `${d}%`, c.textContent = a.isDuplicate ? `+Copy F${l}` : `F${l}${m !== 0 ? ` (${m > 0 ? "+" : ""}${m})` : ""}`, a.moving && a.moving.length > 1) {
    if (m === a.lastDelta) return;
    a.lastDelta = m;
    const p = e.timelineKeyframes(), u = new Set(p.filter((f) => !e.selectedKeyFrames.has(f.frame)).map((f) => f.frame));
    for (const f of a.moving) {
      let h = j(f.startFrame + m, 0, e.state.duration_frames - 1);
      for (; u.has(h) && h > 0 && h < e.state.duration_frames - 1; ) h += Math.sign(m || 1);
      f.key.frame = u.has(h) ? f.key.frame : h;
    }
    p.sort((f, h) => f.frame - h.frame), e.editingKeyFrame = a.key.frame, e.scheduleSerialize(), e.setFrame(a.key.frame, !1, !0);
    return;
  }
  l !== a.key.frame && (e.editingKeyFrame = a.key.frame, e.retimeSelectedKey(l, !0, { checkpoint: !1 }));
}
function Go(e, t) {
  const a = e.camera?.position || [0, 0, 0], r = t.camera?.position || [0, 0, 0];
  return Math.sqrt((r[0] - a[0]) ** 2 + (r[1] - a[1]) ** 2 + (r[2] - a[2]) ** 2);
}
function Re(e) {
  return (e || []).map((t) => ({
    ...t,
    camera: { ...t.camera || {}, position: [...t.camera?.position || []], target: [...t.camera?.target || []] }
  }));
}
function Ho(e, t) {
  const a = Re(e);
  if (a.length < 3 || t < 2) return a;
  const r = [0];
  for (let l = 1; l < a.length; l++)
    r.push(r[l - 1] + Go(a[l - 1], a[l]));
  const o = r[r.length - 1];
  if (o <= 1e-9) return a;
  const n = a[0].frame ?? 0, s = (a[a.length - 1].frame ?? t) - n;
  if (s <= 0) return a;
  let i = n;
  for (let l = 1; l < a.length - 1; l++) {
    const m = n + Math.round(s * (r[l] / o));
    a[l].frame = Math.min(t - 1, Math.max(i + 1, m)), i = a[l].frame;
  }
  return a;
}
function la(e, t) {
  return t.some((a) => e >= a.start && e <= a.end);
}
function ca(e, t, a = 0.6) {
  const r = Re(e), o = Math.min(1, Math.max(0, Number(a) || 0));
  if (!o || r.length < 3 || !t?.length) return r;
  const n = Re(r);
  for (let s = 1; s < r.length - 1; s++)
    if (la(r[s].frame ?? 0, t))
      for (const i of ["position", "target"]) {
        const l = [r[s - 1], r[s], r[s + 1]].map((d) => d.camera?.[i]).filter((d) => Array.isArray(d) && d.length >= 3), m = r[s].camera?.[i];
        if (l.length < 3 || !Array.isArray(m)) continue;
        const c = [0, 1, 2].map((d) => l.reduce((p, u) => p + Number(u[d] || 0), 0) / l.length);
        n[s].camera[i] = m.map((d, p) => Number(d) + (c[p] - Number(d)) * o);
      }
  return n;
}
function Wo(e, t, a) {
  const r = Re(e);
  if (!t?.length || !Array.isArray(a)) return r;
  const o = a.slice(0, 3).map(Number);
  for (const n of r)
    la(n.frame ?? 0, t) && (n.camera.target = [...o]);
  return r;
}
function $o(e, t) {
  return e.segments.filter((a) => a.grade !== "ok" && a.metrics.includes(t)).map((a) => ({ start: a.start, end: a.end }));
}
function Uo(e) {
  return e.segments.filter((t) => t.grade !== "ok").map((t) => ({ start: t.start, end: t.end }));
}
function qe(e) {
  return {
    speed: S("Travel speed"),
    angular_speed: S("Rotation speed"),
    acceleration: S("Acceleration"),
    jerk: S("Jerk"),
    framing_loss: S("Subject out of frame"),
    fov_drift: S("FOV change")
  }[e] || e;
}
function Xo(e) {
  return {
    ok: S("Within limits"),
    warn: S("Near the limit"),
    over: S("Over the limit")
  }[e] || e;
}
let ke = null, tt = null;
function Yo(e) {
  tt = e;
}
async function Qs() {
  if (ke) return ke;
  try {
    if (!tt) return null;
    const e = await tt.fetchApi("/majoor/omnicam/motion_profiles");
    return e.ok ? (ke = await e.json(), ke) : null;
  } catch {
    return null;
  }
}
function Zo(e) {
  return e.root.querySelector('[data-role="health-profile"]')?.value || e.state?.health_profile || "generic";
}
function Qo(e, t) {
  const a = e.motionProfiles?.profiles?.find((r) => r.id === t);
  return a ? a.limits : null;
}
function me(e) {
  const t = Zo(e), a = Qo(e, t);
  return a ? sa(e.state, a, null, t) : null;
}
function Ot(e) {
  return Number(e).toFixed(Math.abs(e) >= 100 ? 0 : 1);
}
function Jo(e) {
  if (!e || !e.limits) return { score: 100, letter: "A" };
  const t = [
    { val: e.max_speed, limit: e.limits.max_speed },
    { val: e.max_angular_speed, limit: e.limits.max_angular_speed },
    { val: e.max_acceleration, limit: e.limits.max_acceleration },
    { val: e.max_jerk, limit: e.limits.max_jerk },
    { val: e.max_fov_change, limit: e.limits.max_fov_change }
  ].filter((n) => n.limit && n.limit > 0);
  if (!t.length) return { score: 100, letter: "A" };
  let a = 0;
  for (const { val: n, limit: s } of t) {
    const i = (n || 0) / s;
    let l = 100;
    i <= 0.75 ? l = 100 : i <= 1 ? l = 100 - (i - 0.75) / 0.25 * 20 : i <= 1.5 ? l = 80 - (i - 1) / 0.5 * 40 : l = Math.max(0, 40 - (i - 1.5) * 40), a += l;
  }
  let r = Math.round(a / t.length);
  if (e.framing_loss_frames) {
    const n = Math.min(50, Math.round(e.framing_loss_frames / Math.max(1, e.duration_frames || 100) * 100));
    r = Math.max(0, r - n);
  }
  let o = "A";
  return r < 50 ? o = "D" : r < 75 ? o = "C" : r < 90 && (o = "B"), { score: r, letter: o };
}
function fe(e, t, a, r) {
  const o = a == null ? S("no limit") : `${Ot(t)} / ${Ot(a)}`, n = a != null && a > 0, s = n ? Math.min(100, Math.round(t / a * 100)) : 0, i = r === "over" ? "#ef4444" : r === "warn" ? "#f59e0b" : "#22c55e";
  return `
    <div class="oc-health-metric" data-grade="${r}">
      <div class="oc-health-metric-row">
        <span class="oc-health-dot"></span>
        <span class="oc-health-metric-name">${qe(e)}</span>
        <span class="oc-health-metric-value">${o}</span>
      </div>
      ${n ? `
      <div class="oc-health-bar-track">
        <div class="oc-health-bar-fill" style="width:${s}%;background:${i}"></div>
      </div>` : ""}
    </div>`;
}
function De(e, t, a) {
  return t == null || t <= 0 ? "ok" : e > t ? "over" : e > t * a ? "warn" : "ok";
}
function en(e) {
  const t = Bo(e);
  return t.length ? t.slice(0, 6).map((a) => {
    const r = a.metrics.map((n) => qe(n)).join(", "), o = a.start === a.end ? S("Frame {frame}").replace("{frame}", String(a.start)) : S("Frames {start}-{end}").replace("{start}", String(a.start)).replace("{end}", String(a.end));
    return `
      <div class="oc-health-zone-row" style="display:flex;align-items:center;gap:4px">
        <button type="button" class="oc-health-zone" data-grade="${a.grade}" data-zone-start="${a.start}"
                title="${S("Jump the playhead to this zone")}">
          <span class="oc-health-dot"></span><span class="oc-health-zone-range">${o}</span>
          <span class="oc-health-zone-reason">${r}</span>
        </button>
        <button type="button" class="icon-button oc-zone-smooth-btn" data-act="health-smooth-zone"
                data-zone-start="${a.start}" data-zone-end="${a.end}"
                title="${S("Smooth keys in this zone only")}" style="flex:0 0 24px;height:24px;padding:0">
          <i class="pi pi-chart-line" style="font-size:10px"></i>
        </button>
      </div>`;
  }).join("") : `<div class="oc-health-empty">${S("No problem zone on this shot.")}</div>`;
}
function tn(e) {
  const t = e.root.querySelector('[data-role="health-body"]'), a = e.root.querySelector('[data-role="health-badge"]'), r = e.root.querySelector('[data-role="health-score-badge"]');
  if (!t || !a) return;
  if (!e.motionProfiles) {
    a.className = "oc-health-badge", a.textContent = S("Unavailable"), r && (r.textContent = "--"), t.innerHTML = `<div class="oc-health-empty">${S("Could not load the recommended limits from the OmniCam server. The panel will not guess a threshold.")}</div>`;
    return;
  }
  const o = me(e);
  if (!o) return;
  e.healthReport = o;
  const { warn_ratio: n } = o;
  if (a.className = `oc-health-badge ${o.grade}`, a.textContent = Xo(o.grade), r) {
    const { score: l, letter: m } = Jo(o);
    r.textContent = `${l}% (${m})`, r.className = `oc-health-score-badge grade-${m.toLowerCase()}`;
  }
  const s = [
    fe(
      "speed",
      o.max_speed,
      o.limits.max_speed,
      De(o.max_speed, o.limits.max_speed, n)
    ),
    fe(
      "angular_speed",
      o.max_angular_speed,
      o.limits.max_angular_speed,
      De(o.max_angular_speed, o.limits.max_angular_speed, n)
    ),
    fe(
      "acceleration",
      o.max_acceleration,
      o.limits.max_acceleration,
      De(o.max_acceleration, o.limits.max_acceleration, n)
    ),
    fe(
      "jerk",
      o.max_jerk,
      o.limits.max_jerk,
      De(o.max_jerk, o.limits.max_jerk, n)
    ),
    fe("fov_drift", o.max_fov_change, o.limits.max_fov_change, o.track_grades.fov_drift)
  ].join(""), i = o.framing_loss_frames ? `<div class="oc-health-metric" data-grade="over">
         <div class="oc-health-metric-row">
           <span class="oc-health-dot"></span>
           <span class="oc-health-metric-name">${qe("framing_loss")}</span>
           <span class="oc-health-metric-value">${S("{count} frames").replace("{count}", String(o.framing_loss_frames))}</span>
         </div>
       </div>` : "";
  t.innerHTML = `
    <div class="oc-health-metrics">${s}${i}</div>
    <div class="oc-section">${S("Problem zones")}</div>
    <div class="oc-health-zones" data-role="health-zones">${en(o)}</div>
    <div class="oc-card-actions oc-health-actions">
      <button data-act="health-slow" title="${S("Respace the keys so the shot travels at a constant speed")}"><i class="pi pi-clock"></i> ${S("Slow to limits")}</button>
      <button data-act="health-smooth" title="${S("Blend the keys inside the flagged zones only")}"><i class="pi pi-chart-line"></i> ${S("Smooth flagged")}</button>
      <button data-act="health-recenter" title="${S("Aim the keys of the flagged zones back at the subject")}"><i class="pi pi-crosshairs"></i> ${S("Recenter subject")}</button>
    </div>
    <p class="oc-health-note">${S("A valid trajectory stays inside the limits recommended for this model. It is not a guarantee about the generated video.")}</p>`;
}
function Js(e, t) {
  if (!t || !e.motionProfiles) return;
  const a = me(e);
  if (a) {
    e.healthReport = a;
    for (const r of a.segments) {
      if (r.grade === "ok") continue;
      const o = et(e, r.start), n = et(e, r.end + 1);
      if (n < -5 || o > 105) continue;
      const s = document.createElement("div");
      s.className = "oc-health-band", s.dataset.grade = r.grade, s.style.left = `${o}%`, s.style.width = `${Math.max(0.4, n - o)}%`, s.title = r.metrics.map((i) => qe(i)).join(", "), t.appendChild(s);
    }
  }
}
function Me(e, t, a, r) {
  const o = e.activeCameraTrack();
  o && (e.checkpoint(a), o.keyframes = t, e.state.keyframes = t, e.syncActiveCameraTrack(), e.refreshKeys(), e.setFrame(e.frame, !1, !1), e.setStatus(r), tn(e));
}
function ei(e) {
  const t = me(e);
  if (!t) return;
  const a = t.limits.max_speed;
  if (!a) {
    e.setStatus(S("This profile sets no speed limit."));
    return;
  }
  const r = Math.max(1, e.state.duration_frames - 1), o = Ho(e.state.keyframes, r), n = sa({ ...e.state, keyframes: o }, t.limits, null, t.profile);
  if (n.max_speed <= a) {
    Me(e, o, "Slow to limits", S("Speed flattened; the shot keeps its length."));
    return;
  }
  const s = n.max_speed / a * (e.state.duration_frames / Math.max(1, e.state.fps));
  Me(e, o, "Slow to limits", S("Speed flattened, still over: this path needs about {seconds}s to fit the limit.").replace("{seconds}", s.toFixed(1)));
}
function ti(e) {
  const t = me(e);
  if (!t) return;
  const a = Uo(t);
  if (!a.length) {
    e.setStatus(S("Nothing is flagged on this shot."));
    return;
  }
  const r = ca(e.state.keyframes, a, 0.6);
  Me(
    e,
    r,
    "Smooth flagged zones",
    S("Smoothed {count} flagged zone(s).").replace("{count}", String(a.length))
  );
}
function ai(e) {
  const t = me(e);
  if (!t) return;
  const a = $o(t, "framing_loss");
  if (!a.length) {
    e.setStatus(S("The subject stays in frame on this shot."));
    return;
  }
  const r = Wo(e.state.keyframes, a, t.subject);
  Me(
    e,
    r,
    "Recenter subject",
    S("Recentred {count} zone(s) on the subject.").replace("{count}", String(a.length))
  );
}
function ri(e, t, a) {
  if (!me(e)) return;
  const o = ca(e.state.keyframes, [{ start: t, end: a }], 0.6);
  Me(
    e,
    o,
    "Smooth zone",
    S("Smoothed zone ({start}-{end}).").replace("{start}", String(t)).replace("{end}", String(a))
  );
}
const an = {
  "3D assets": "Objets 3D",
  "3D PREVIEW": "APERÇU 3D",
  "3D preview of the reconstructed scene": "Aperçu 3D de la scène reconstruite",
  "Frame the reconstructed scene": "Cadrer la scène reconstruite",
  "Boxes only": "Boîtes seules",
  "Add props": "Ajouter des objets",
  "Replace boxes": "Remplacer les boîtes",
  "Swap fitted boxes for GLB props from the asset library": "Remplace les boîtes ajustées par des objets GLB de la bibliothèque",
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
  "Add Media Card": "Ajouter une carte média",
  "Add object (+)": "Ajouter un objet (+)",
  "Add object": "Ajouter un objet",
  Pyramide: "Pyramide",
  "Sun light": "Lumière du soleil",
  "Point light": "Lumière ponctuelle",
  "Spot light": "Spot lumineux",
  Lights: "Lumières",
  Assets: "Ressources",
  Light: "Lumière",
  "Light Color": "Couleur de la lumière",
  Intensity: "Intensité",
  Shadow: "Ombre",
  "Spot Cone": "Cône du spot",
  Angle: "Angle",
  Soft: "Adoucissement",
  Card: "Carte",
  Cylinder: "Cylindre",
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
  Back: "Rebond (Back)",
  Clamped: "Contrainte (Clamped)",
  Cubic: "Cubique",
  Expo: "Exponentielle",
  Quintic: "Quintique",
  Sine: "Sinusoïdale",
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
  "Curve view fitted": "Vue des courbes cadrée",
  Debug: "Debug",
  "Delete Selected Keyframe (Del / Backspace)": "Supprimer la clé sélectionnée (Suppr / Retour)",
  "Drag to trim the cut": "Glisser pour ajuster la coupe",
  "Delete camera": "Supprimer la caméra",
  "Delete object": "Supprimer l'objet",
  "Delete objects": "Supprimer les objets",
  "Delete {count} objects and their keyframes?": "Supprimer {count} objets et leurs images clés ?",
  "{count} objects deleted": "{count} objets supprimés",
  "Dense (1800)": "Dense (1800)",
  Deselected: "Désélectionné",
  Display: "Affichage",
  "Dolly Zoom (Vertigo)": "Dolly zoom (effet Vertigo)",
  "Doorway Pass": "Passage de porte",
  "Double-click to rename": "Double-cliquer pour renommer",
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
  Graph: "Graphe",
  Graybox: "Graybox",
  Grid: "Grille",
  Timeline: "Timeline",
  Ground: "Sol",
  "Ground + Low Angle": "Sol + contre-plongée",
  Torus: "Tore",
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
  Simple: "Simple",
  "Middle drag orbits, Shift+middle pans, Ctrl+middle dollies -- no Alt needed anywhere. Alt+left/middle/right are aliases for orbit/pan/dolly; with no middle button, Ctrl+drag over empty space orbits and Ctrl+Shift+drag pans. Maya vs Blender only decides whether Alt+right dollies (Maya) or does nothing (Blender). Simple is mouse-only: left drag orbits, right drag pans, wheel zooms -- no modifiers, no middle button, no viewport marquee or right-click menu.": "Le glisser bouton du milieu orbite, Maj+milieu fait un pan, Ctrl+milieu un dolly — aucun Alt nécessaire. Alt+gauche/milieu/droit sont des alias pour orbite/pan/dolly ; sans bouton du milieu, Ctrl+glisser sur une zone vide orbite et Ctrl+Maj+glisser fait un pan. Maya ou Blender ne décide que d'une chose : Alt+droit fait un dolly (Maya) ou rien (Blender). Simple n'utilise que la souris : glisser gauche pour orbiter, glisser droit pour un pan, molette pour zoomer — aucun modificateur, pas de bouton du milieu, ni marquee ni menu clic droit dans la vue.",
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
  "Object renamed: {name}": "Objet renommé : {name}",
  "Objects & Primitives": "Objets et primitives",
  "Omni Ref": "Omni Ref",
  "OmniCam Help": "Aide OmniCam",
  "Open or close the animation curve editor": "Ouvrir ou fermer l'éditeur de courbes d'animation",
  "Orbit 360°": "Orbite 360°",
  "Orbit: MMB · Pan: Shift+MMB · Dolly: Scroll · Fly: WASD / QE": "Orbite : clic milieu · Panoramique : Maj+clic milieu · Travelling : molette · Vol : WASD / QE",
  Orthographic: "Orthographique",
  Output: "Sortie",
  "Output & diagnostics": "Sortie et diagnostics",
  "Over the shoulder frame": "Cadre par-dessus l'épaule",
  Parallax: "Parallaxe",
  Parent: "Parent",
  "Parent object": "Objet parent",
  "Path key moved": "Clé de trajectoire déplacée",
  "Curve handle updated": "Poignée de courbe mise à jour",
  "Select a camera keyframe first": "Sélectionnez d'abord une clé de caméra",
  "Camera path handle: {mode}": "Poignée du chemin caméra : {mode}",
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
  "Show only {channel}": "Afficher uniquement {channel}",
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
  Single: "Vue unique"
}, rn = {
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
  "View: {axis} axis": "Vue : axe {axis}",
  "Camera Track": "Trajectoire caméra",
  "Clear Cache": "Vider le cache",
  "Clear cached tracks and reconstructions, and reset this node": "Vider les trajectoires et reconstructions en cache, et réinitialiser ce nœud",
  "Deletes every cached reconstruction (GLBs, manifests, source images) from disk, and forgets this node's cached track and reconstruction results. This cannot be undone.": "Supprime du disque chaque reconstruction en cache (GLB, manifestes, images source), et oublie la trajectoire et les résultats de reconstruction mis en cache par ce nœud. Cette action est irréversible.",
  "✕ DISCARD": "✕ ABANDONNER",
  "Discard reconstruction": "Abandonner la reconstruction",
  "Discard this reconstruction and its cached files so the next run recomputes it": "Abandonner cette reconstruction et ses fichiers en cache pour que la prochaine exécution la recalcule",
  "Removes this reconstruction and its cached files so the next run recomputes it. The camera track and other reconstructions are left untouched.": "Retire cette reconstruction et ses fichiers en cache pour que la prochaine exécution la recalcule. La trajectoire caméra et les autres reconstructions ne sont pas touchées.",
  "Scene Reconstruct": "Reconstruction de scène",
  "Scene Reconstruction": "Reconstruction de scène",
  Provider: "Fournisseur",
  Result: "Résultat",
  "Depth Mesh": "Maillage de profondeur",
  Blockout: "Blocage",
  Hybrid: "Hybride",
  Scan: "Scan",
  Objects: "Objets",
  SAM3: "SAM3",
  None: "Aucun",
  "Max objects": "Objets max",
  Completion: "Complétion",
  Off: "Désactivé",
  "Low confidence": "Faible confiance",
  Selected: "Sélectionnés",
  "All bounded": "Tous (borné)",
  Labels: "Étiquettes",
  "Default interior taxonomy": "Taxonomie d'intérieur par défaut",
  Quality: "Qualité",
  Fast: "Rapide",
  High: "Élevée",
  Custom: "Personnalisé",
  "Geometry Model": "Modèle de géométrie",
  "Recover FOV": "Récupérer le FOV",
  "Source Texture": "Texture source",
  "Detect Ground": "Détecter le sol",
  "Detect Walls": "Détecter les murs",
  "Triangle Budget": "Budget triangles",
  "Edge Threshold": "Seuil d'arête",
  "Scene Scale": "Échelle de scène",
  "▶ RECONSTRUCT": "▶ RECONSTRUIRE",
  "■ STOP": "■ ARRÊTER",
  "OPEN IN DIRECTOR": "OUVRIR DANS DIRECTOR",
  "Ready to reconstruct": "Prêt pour la reconstruction",
  "ground plane detected": "plan de sol détecté",
  triangles: "triangles",
  "Reconstruction Appearance": "Apparence de la reconstruction",
  "Lock object": "Verrouiller l'objet",
  "Unlock object": "Déverrouiller l'objet",
  "Lock / unlock object": "Verrouiller / déverrouiller l'objet",
  "Object is locked": "L'objet est verrouillé",
  "World axis navigation": "Navigation par axes du monde",
  "Pitch/Yaw/Roll: an alternative to Target XYZ, aiming the camera directly like a Maya/Blender rotate channel. Editing either one keeps the other in sync.": "Tangage/Lacet/Roulis : une alternative à Cible XYZ, orientant la caméra directement comme un canal de rotation Maya/Blender. Modifier l'un garde l'autre synchronisé.",
  "3D scene viewport. Drag to orbit, scroll to zoom, F to frame the selection, right-click for the context menu.": "Fenêtre de scène 3D. Glisser pour orbiter, molette pour zoomer, F pour cadrer la sélection, clic droit pour le menu contextuel.",
  "Language updated — reload the workflow to translate every label.": "Langue mise à jour — rechargez le workflow pour traduire tous les libellés.",
  "Drag to resize the outliner — double-click to reset": "Glisser pour redimensionner l'outliner — double-clic pour réinitialiser",
  "Resize the outliner": "Redimensionner l'outliner",
  "Drag to resize the camera view — double-click to reset": "Glisser pour redimensionner la vue caméra — double-clic pour réinitialiser",
  "Resize the camera view": "Redimensionner la vue caméra",
  "Drag to resize the side panel — double-click to reset": "Glisser pour redimensionner le panneau latéral — double-clic pour réinitialiser",
  "Resize side panel": "Redimensionner le panneau latéral",
  "Drag to resize the scene panel — double-click to reset": "Glisser pour redimensionner le panneau de scène — double-clic pour réinitialiser",
  "Resize scene panel": "Redimensionner le panneau de scène",
  "Solve Health": "Santé du solve",
  "Per-frame solve health": "Santé du solve image par image",
  "Drag to resize graph editor — double-click to reset": "Glisser pour redimensionner l'éditeur de courbes — double-clic pour réinitialiser",
  "Resize graph editor": "Redimensionner l'éditeur de courbes",
  Scene: "Scène",
  "Scene Library": "Bibliothèque de scènes",
  "New Scene": "Nouvelle scène",
  "Open Scene…": "Ouvrir une scène…",
  "Open Scene": "Ouvrir une scène",
  "Save Scene": "Enregistrer la scène",
  "Reset Scene": "Réinitialiser la scène",
  "Reset reverts to the last saved or opened scene.": "La réinitialisation revient à la dernière scène enregistrée ou ouverte.",
  "Start a new scene? Unsaved changes will be lost.": "Démarrer une nouvelle scène ? Les modifications non enregistrées seront perdues.",
  "New scene": "Nouvelle scène",
  "Nothing to revert to": "Aucune scène de référence",
  "Revert to the last saved or opened scene? Unsaved changes will be lost.": "Revenir à la dernière scène enregistrée ou ouverte ? Les modifications non enregistrées seront perdues.",
  "The saved scene could not be read": "La scène enregistrée n'a pas pu être lue",
  "Scene reset to last save": "Scène réinitialisée au dernier enregistrement",
  Untitled: "Sans titre",
  "Scene name": "Nom de la scène",
  "The scene name cannot be empty": "Le nom de la scène ne peut pas être vide",
  "Saving scene…": "Enregistrement de la scène…",
  "Scene saved: {name}": "Scène enregistrée : {name}",
  "Scene save failed: {error}": "Échec de l'enregistrement de la scène : {error}",
  "The scenes could not be listed: {error}": "Impossible de lister les scènes : {error}",
  "No saved scenes yet": "Aucune scène enregistrée pour l'instant",
  "Open this scene? Unsaved changes will be lost.": "Ouvrir cette scène ? Les modifications non enregistrées seront perdues.",
  "Scene opened: {name}": "Scène ouverte : {name}",
  "Scene open failed: {error}": "Échec de l'ouverture de la scène : {error}",
  "Scene loaded": "Scène chargée",
  "Simplify Keys": "Simplifier les clés",
  "Drop keys that barely change the motion. Replayed from the pre-simplify keys, so 0% restores them.": "Supprime les clés qui ne changent presque pas le mouvement. Rejoué depuis les clés d'origine, donc 0 % les restaure.",
  Keys: "Clés",
  "Which tracks the key operations act on": "Sur quelles pistes agissent les opérations de clés",
  "Active camera": "Caméra active",
  "All cameras": "Toutes les caméras",
  "Active object": "Objet actif",
  "Decimate down to a target key count": "Réduire à un nombre de clés cible",
  "Reduce…": "Réduire…",
  "Remove duplicate, too-close and redundant keys": "Supprime les clés en double, trop proches et redondantes",
  Clean: "Nettoyer",
  "Reduce keys": "Réduire les clés",
  "Target number of keys": "Nombre de clés cible",
  "Select an animated object first": "Sélectionnez d'abord un objet animé",
  "Simplify keyframes": "Simplifier les keyframes",
  "Removed {n} keyframes": "{n} keyframes supprimées",
  "No keyframes to remove": "Aucune keyframe à supprimer",
  "{n} keyframes deleted": "{n} keyframes supprimées",
  "Keyframe deleted": "Keyframe supprimée",
  "Delete {n} keyframes": "Supprimer {n} keyframes",
  "Nudge {n} keyframes": "Décaler {n} keyframes",
  "Selected keys cannot move further": "Les clés sélectionnées ne peuvent pas aller plus loin",
  "Interpolation on {n} keys": "Interpolation sur {n} clés",
  "{mode} interpolation on {n} keys": "Interpolation {mode} sur {n} clés",
  "Tangents on {n} keys": "Tangentes sur {n} clés",
  "{mode} tangents on {n} keys": "Tangentes {mode} sur {n} clés",
  "Fitted to {n} selected keys": "Cadré sur {n} clés sélectionnées",
  "Keyframe inserted @ F{frame}": "Keyframe insérée à F{frame}",
  "Draw Camera Path: LMB draw · RMB or Esc cancel": "Tracer trajectoire caméra : clic gche pour tracer · clic droit ou Échap pour annuler",
  "Draw Camera Path cancelled": "Tracé de la trajectoire caméra annulé",
  "Camera path needs at least two distinct points": "La trajectoire caméra nécessite au moins deux points distincts",
  "Camera path created": "Trajectoire caméra créée",
  "Camera path extended": "Trajectoire caméra prolongée",
  "Camera path transformed": "Trajectoire caméra transformée",
  "{name} · whole path selected — move / scale / rotate": "{name} · trajectoire entière sélectionnée — déplacer / redimensionner / pivoter",
  "Draw Camera Path: the active camera has no path to continue": "Tracer trajectoire caméra : la caméra active n'a aucune trajectoire à prolonger",
  "Continue Camera Path: LMB draw from the last key · RMB or Esc cancel": "Prolonger trajectoire caméra : clic gche pour tracer depuis la dernière clé · clic droit ou Échap pour annuler",
  "Draw Camera Path (perspective or top / front / side view)": "Tracer la trajectoire caméra (vue perspective, dessus, face ou côté)",
  "Continue Camera Path — draw a new segment from the active camera's last key": "Prolonger la trajectoire caméra — tracer un nouveau segment depuis la dernière clé de la caméra active",
  "Continue Camera Path": "Prolonger la trajectoire caméra",
  "Smooth keys in this zone only": "Lisser les clés de cette zone uniquement",
  "Smoothed zone ({start}-{end}).": "Zone ({start}-{end}) lissée.",
  "Reset {target}": "Réinitialiser {target}",
  "Key @ {frame} tangent mode set to {mode}": "Clé @ {frame} mode de tangente réglé sur {mode}",
  "Reset Position": "Réinitialiser la position",
  "Reset Target": "Réinitialiser la cible",
  "Reset Rotation": "Réinitialiser la rotation",
  Hidden: "Masqués",
  "Reset Scale": "Réinitialiser l'échelle",
  "Previous Keyframe": "Keyframe précédente",
  "Previous Frame (-1f)": "Image précédente (-1f)",
  "Next Frame (+1f)": "Image suivante (+1f)",
  "Next Keyframe": "Keyframe suivante",
  "Tangent mode for Bezier curves": "Mode de tangente pour les courbes Bézier",
  "Draw Camera Path": "Tracer la trajectoire caméra",
  "Isolation cleared": "Isolation désactivée",
  "Isolated: {name}": "Isolé : {name}",
  "Sensor / Gate": "Capteur / Format",
  "Full Frame 35mm (36×24)": "Plein format 35mm (36×24)",
  "Super 35 (24.89×18.66)": "Super 35 (24,89×18,66)",
  "Micro 4/3 (17.3×13)": "Micro 4/3 (17,3×13)",
  "16:9 Digital Cinema": "Cinéma numérique 16:9",
  "Mobile 9:16 Vertical": "Mobile 9:16 Vertical",
  "Toggle Transform Space (World / Local)": "Basculer l'espace de transformation (Monde / Local)",
  "Toggle Snapping (Grid / None)": "Basculer le magnétisme (Grille / Aucun)",
  "Lock Camera View (prevent accidental navigation)": "Verrouiller la vue caméra (évite les déplacements accidentels)",
  "Reset roll to 0°": "Réinitialiser le roulis à 0°",
  "Quick Overlays": "Superpositions rapides",
  "Toggle Floor Grid": "Basculer la grille au sol",
  "Toggle Transform Gizmos": "Basculer les gizmos de transformation",
  "Toggle Composition Guides (Rule of Thirds)": "Basculer les repères de composition (Règle des tiers)",
  "Toggle Safe Areas": "Basculer les zones de sécurité",
  "Toggle 2D Radar Mini-Map": "Basculer la mini-carte radar 2D",
  "Viewport Shading Mode": "Mode d'ombrage du viewport",
  "Play / Pause (Space)": "Lecture / Pause (Espace)",
  "Add Keyframe (I)": "Ajouter une image-clé (I)",
  "Camera View is locked (click to unlock)": "Vue caméra verrouillée (cliquer pour déverrouiller)",
  "Transform Space: Local (click for World)": "Espace de transformation : Local (cliquer pour Monde)",
  "Transform Space: World (click for Local)": "Espace de transformation : Monde (cliquer pour Local)",
  "Snapping: {mode} (click to disable)": "Magnétisme : {mode} (cliquer pour désactiver)",
  "Camera View locked": "Vue caméra verrouillée",
  "Camera View unlocked": "Vue caméra déverrouillée",
  "Camera roll reset to 0°": "Roulis caméra réinitialisé à 0°",
  "Transform space: {space}": "Espace de transformation : {space}",
  "Snapping: {mode}": "Magnétisme : {mode}",
  "Shading: {mode}": "Ombrage : {mode}",
  "Camera View is locked (click 🔒 to unlock)": "Vue caméra verrouillée (cliquer sur 🔒 pour déverrouiller)",
  "Toggle Wireframe on Shaded / Mesh Edges": "Basculer le filaire sur ombré / arêtes du maillage",
  "Wireframe + Texture": "Filaire + Texture",
  "Wireframe + Clay": "Filaire + Argile",
  "Matte Dark": "Mat sombre",
  Textured: "Texturé",
  "Wireframe overlay: On": "Surimpression filaire : Activée",
  "Wireframe overlay: Off": "Surimpression filaire : Désactivée",
  "Backface culling: On (Single-Sided)": "Culling arrière : Activé (Simple face)",
  "Backface culling: Off (Double-Sided)": "Culling arrière : Désactivé (Double face)",
  "Backface culling: Off (Double-Sided Interior)": "Culling arrière : Désactivé (Intérieur plein / Double face)",
  "Near clip set to {val}m": "Plan de coupe proche réglé à {val}m",
  "Near Presets": "Préréglages Near",
  "Interior (0.001)": "Intérieur (0.001)",
  "Standard (0.01)": "Standard (0.01)",
  "Large (0.1)": "Grand espace (0.1)",
  "Backface Culling": "Culling arrière (Backface)",
  "Toggle Backface Culling (Solid Interior / Single-Sided)": "Basculer le culling arrière (Intérieur plein / Simple face)",
  "Auto Smooth": "Lissage auto",
  Corner: "Coin (Corner)",
  Selection: "Sélection",
  "Simplify keys": "Simplifier les clés",
  "Drop keys that barely change the motion": "Supprimer les clés sans impact notable sur le mouvement",
  "Reduce keys…": "Réduire les clés…",
  "Clean keys": "Nettoyer les clés",
  "Set key": "Poser une clé",
  "Frame subject": "Cadrer le sujet",
  "Set camera target here": "Placer la cible caméra ici",
  "Set camera Look-At target to this 3D point in the scene": "Définir la cible Look-At de la caméra sur ce point 3D",
  "Camera & Views": "Caméra & Vues",
  "Camera View (Active)": "Vue caméra (Active)",
  "Show / hide camera previews": "Afficher / masquer les aperçus caméra",
  "Tools & Playblast": "Outils & Playblast",
  "Record primary preview": "Enregistrer l'aperçu principal",
  "Clear caches & clean memory": "Vider les caches et purger la mémoire",
  "Rename object…": "Renommer l'objet…",
  "Duplicate object": "Dupliquer l'objet",
  "Show object": "Afficher l'objet",
  "Hide object": "Masquer l'objet",
  "Transform mode": "Mode de transformation",
  Translate: "Déplacer",
  Rotate: "Pivoter",
  "Tracking & Constraints": "Suivi & Contraintes",
  "Camera tracks this object (Look-At)": "La caméra suit cet objet (Look-At)",
  "Lock camera live look-at tracking to this moving object": "Verrouiller le suivi Look-At en direct sur cet objet en mouvement",
  "Bake tracking to all camera keys": "Bakar le suivi sur toutes les clés caméra",
  "Write this object's motion into camera target keyframes": "Écrire le mouvement de cet objet dans les clés de cible caméra",
  "Select hierarchy": "Sélectionner la hiérarchie",
  "Select this object and all descendants": "Sélectionner cet objet et tous ses enfants",
  "Reset entire animation": "Réinitialiser toute l'animation",
  "Delete every animation key and return position/rotation to zero": "Supprimer toutes les clés d'animation et remettre position/rotation à zéro",
  "The canonical subject card cannot be deleted": "La carte sujet canonique ne peut pas être supprimée",
  "Delete this object and its animation keys": "Supprimer cet objet et ses clés d'animation",
  "Edit this camera": "Éditer cette caméra",
  "Select whole path — move / scale / rotate": "Sélectionner toute la trajectoire — déplacer / mettre à l'échelle / pivoter",
  "whole path selected — move / scale / rotate": "trajectoire entière sélectionnée — déplacer / mettre à l'échelle / pivoter",
  "Set as primary / playblast": "Définir comme principale / playblast",
  "Set key at playhead": "Poser une clé à la tête de lecture",
  "Record this preview": "Enregistrer cet aperçu",
  "Restore preview size": "Rétablir la taille de l'aperçu",
  "Maximize preview": "Agrandir l'aperçu",
  "Shot order & handles": "Ordre des plans & poignées",
  "Shot: move earlier": "Plan : avancer",
  "Shot: move later": "Plan : reculer",
  "Shot handles…": "Poignées de plan…",
  "Rename camera…": "Renommer la caméra…",
  "Duplicate camera": "Dupliquer la caméra",
  "Delete every camera key and return to a static zero pose at frame 0": "Supprimer toutes les clés caméra et revenir à une pose neutre à l'image 0",
  "Handle Type": "Type de poignée",
  "Keyframe operations": "Opérations sur les clés",
  "Delete {count} keys": "Supprimer {count} clés",
  "Delete key": "Supprimer la clé",
  "Fit timeline view (F)": "Ajuster la timeline (F)",
  "Set / replace key": "Poser / remplacer la clé",
  "Copy selected key": "Copier la clé sélectionnée",
  "Paste key at playhead": "Coller la clé à la tête de lecture",
  Markers: "Marqueurs",
  "Add marker at playhead": "Ajouter un marqueur à la tête de lecture",
  "Remove nearest marker": "Supprimer le marqueur le plus proche",
  "Previous key": "Clé précédente",
  "Next key": "Clé suivante",
  "Disable Auto Key": "Désactiver Auto Key",
  "Enable Auto Key": "Activer Auto Key",
  "Delete selected key": "Supprimer la clé sélectionnée",
  "Curve editor": "Éditeur de courbes",
  "Fit all curves (Framing)": "Cadrer toutes les courbes",
  "Hide Bézier handles": "Masquer les poignées Bézier",
  "Show Bézier handles": "Afficher les poignées Bézier",
  "Box select mode (drag over objects in viewport)": "Mode sélection par cadre (glisser sur les objets dans la vue)",
  "Select all": "Tout sélectionner",
  "Deselect all": "Tout désélectionner",
  "Invert selection": "Inverser la sélection",
  "Box selection tool": "Outil de sélection par cadre",
  "objects selected": "objets sélectionnés",
  "Duplicate {count} objects": "Dupliquer {count} objets",
  "Toggle visibility": "Basculer la visibilité",
  "Toggle lock": "Basculer le verrouillage",
  "Delete {count} objects": "Supprimer {count} objets",
  selected: "sélectionné(s)",
  "Duplicated {count} objects": "{count} objets dupliqués",
  "Show {count} objects": "Afficher {count} objets",
  "Hide {count} objects": "Masquer {count} objets",
  "Locked {count} objects": "{count} objets verrouillés",
  "Unlocked {count} objects": "{count} objets déverrouillés",
  "Selected all {count} objects": "{count} objets sélectionnés",
  "Selection cleared": "Sélection désactivée",
  "Inverted selection ({count} objects)": "Sélection inversée ({count} objets)",
  "Toggle visibility (H)": "Basculer la visibilité (H)",
  "Toggle lock (L)": "Basculer le verrouillage (L)",
  "Duplicate selection (Shift+D)": "Dupliquer la sélection (Shift+D)",
  "Delete selection (Del)": "Supprimer la sélection (Suppr)",
  "Deselect all (Alt+A)": "Tout désélectionner (Alt+A)",
  "Navigation & Controls": "Navigation & Contrôles",
  "Display & Viewport": "Affichage & Viewport",
  "Timeline & Keys": "Timeline & Clés",
  "Defaults & Pipeline": "Défauts & Pipeline",
  "OmniCam Preferences": "Préférences OmniCam",
  Close: "Fermer",
  "Reset to Defaults": "Réinitialiser aux valeurs d'usine",
  Done: "Terminé",
  "Preferences reset to defaults": "Préférences réinitialisées aux valeurs par défaut",
  "Configure OmniCam preferences": "Configurer les préférences OmniCam",
  "Preferences…": "Préférences…",
  "{count} object(s) selected": "{count} objet(s) sélectionné(s)",
  "Zoom in (+)": "Zoom avant (+)",
  "Zoom out (−)": "Zoom arrière (−)",
  "Center: Cam": "Centre : Caméra",
  "Center: World": "Centre : Monde",
  "Compact mode": "Mode compact",
  "Expand radar": "Agrandir le radar",
  "Camera (drag to move)": "Caméra (glisser pour déplacer)",
  "Look-At Target (drag to move)": "Cible de visée (glisser pour déplacer)",
  Keyframe: "Image clé",
  Object: "Objet"
}, on = {
  ...an,
  ...rn
}, Q = ["OmniCam"], ma = "MajoorOmniCam.Locale", da = "MajoorOmniCam.Defaults.Fps", pa = "MajoorOmniCam.Defaults.DurationSeconds", fa = "MajoorOmniCam.Defaults.Width", ua = "MajoorOmniCam.Defaults.Height", ha = "MajoorOmniCam.Defaults.RenderMode", ga = "MajoorOmniCam.Defaults.Encoder", ya = "MajoorOmniCam.Defaults.PlayblastResolution", ba = "MajoorOmniCam.Playblast.Quality", _a = "MajoorOmniCam.Defaults.PlayblastGrid", va = "MajoorOmniCam.Defaults.PlayblastLabels", Sa = "MajoorOmniCam.Proxy.PointDensity", wa = "MajoorOmniCam.Proxy.PointSpread", xa = "MajoorOmniCam.Proxy.PointColor", Ma = "MajoorOmniCam.Proxy.CardFit", Ca = "MajoorOmniCam.Viewport.Quality", ka = "MajoorOmniCam.Viewport.Adaptive", Da = "MajoorOmniCam.Viewport.BackgroundColor", ja = "MajoorOmniCam.Display.Grid", Ta = "MajoorOmniCam.Display.Radar", Aa = "MajoorOmniCam.Display.CameraPaths", Ea = "MajoorOmniCam.Display.CameraGizmos", Ia = "MajoorOmniCam.Display.LookAt", Oa = "MajoorOmniCam.Display.HelperAxes", Pa = "MajoorOmniCam.Display.Gizmo", za = "MajoorOmniCam.Display.Guides", Na = "MajoorOmniCam.Display.SafeAreas", Ra = "MajoorOmniCam.Display.ResolutionGate", La = "MajoorOmniCam.Display.AspectRatio", Fa = "MajoorOmniCam.Display.BurnIn", Va = "MajoorOmniCam.Display.SpeedHeatmap", Ba = "MajoorOmniCam.Display.Wireframe", Ka = "MajoorOmniCam.Display.Vertices", qa = "MajoorOmniCam.Tools.SelectMode", Ga = "MajoorOmniCam.Tools.GizmoMode", Ha = "MajoorOmniCam.Tools.GizmoSpace", Wa = "MajoorOmniCam.Tools.SpatialSnapMode", $a = "MajoorOmniCam.Tools.SpatialGridSize", Ua = "MajoorOmniCam.Navigation.Profile", Xa = "MajoorOmniCam.Navigation.FlySpeed", Ya = "MajoorOmniCam.Navigation.InvertOrbitY", Za = "MajoorOmniCam.Navigation.ZoomSensitivity", Qa = "MajoorOmniCam.Navigation.OrbitSensitivity", Ja = "MajoorOmniCam.Navigation.PanSensitivity", er = "MajoorOmniCam.Navigation.DollySensitivity", tr = "MajoorOmniCam.Navigation.ViewMode", ar = "MajoorOmniCam.Controls.EnableShortcuts", rr = "MajoorOmniCam.Timeline.SnapEnabled", or = "MajoorOmniCam.Timeline.SnapFrames", nr = "MajoorOmniCam.Timeline.AutoKey", sr = "MajoorOmniCam.Timeline.DefaultInterpolation", ir = "MajoorOmniCam.Timeline.TimecodeMode", lr = "MajoorOmniCam.Timeline.LoopPlayback", cr = "MajoorOmniCam.Interface.Density", mr = "MajoorOmniCam.Interface.PreviewLayout", dr = "MajoorOmniCam.Interface.CameraPreviews", pr = "MajoorOmniCam.History.Limit", fr = "MajoorOmniCam.Extractor.DefaultBackend", ur = "MajoorOmniCam.Monitor.DefaultProfile";
function E(e, t, a, r, o) {
  return { id: e, category: [...Q, t, a], name: a, tooltip: r, type: "boolean", defaultValue: o };
}
function O(e, t, a, r, o, n) {
  return { id: e, category: [...Q, t, a], name: a, tooltip: r, type: "combo", options: o, defaultValue: n };
}
function V(e, t, a, r, o, n) {
  return { id: e, category: [...Q, t, a], name: a, tooltip: r, type: "slider", attrs: o, defaultValue: n };
}
function nn({
  onLocaleChange: e,
  onQualityChange: t,
  onAdaptiveChange: a,
  onNavigationProfileChange: r,
  onUiDensityChange: o,
  onUndoLimitChange: n,
  onBgColorChange: s,
  onFlySpeedChange: i,
  onInvertOrbitYChange: l,
  onZoomSensitivityChange: m,
  onOrbitSensitivityChange: c,
  onPanSensitivityChange: d,
  onDollySensitivityChange: p,
  onCameraViewVisibleChange: u
} = {}) {
  return [
    {
      id: ma,
      category: [...Q, "Language", "Viewport language"],
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
    V(
      da,
      "Defaults",
      "Default FPS",
      "Frame rate applied to newly created Director nodes.",
      { min: 1, max: 120, step: 1 },
      24
    ),
    V(
      pa,
      "Defaults",
      "Default duration (seconds)",
      "Timeline duration applied to newly created Director nodes.",
      { min: 1, max: 120, step: 1 },
      5
    ),
    V(
      fa,
      "Defaults",
      "Default width",
      "Output width applied to newly created Director nodes.",
      { min: 64, max: 4096, step: 16 },
      1280
    ),
    V(
      ua,
      "Defaults",
      "Default height",
      "Output height applied to newly created Director nodes.",
      { min: 64, max: 4096, step: 16 },
      720
    ),
    O(
      ha,
      "Defaults",
      "Default proxy render mode",
      "Render mode applied to newly created Director nodes.",
      ["omni_ref", "graybox", "grid", "point_field", "wireframe", "card_grid", "beauty"],
      "omni_ref"
    ),
    O(
      ga,
      "Defaults",
      "Default playblast encoder",
      "WebCodecs is deterministic; realtime is the MediaRecorder fallback.",
      [
        { text: "WebCodecs (deterministic)", value: "auto" },
        { text: "Realtime fallback", value: "realtime" }
      ],
      "auto"
    ),
    O(
      ya,
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
    O(
      ba,
      "Defaults",
      "Default playblast quality",
      "Encoder quality target for newly created Director playblasts.",
      [
        { text: "Low (smaller file)", value: "low" },
        { text: "Balanced", value: "balanced" },
        { text: "High", value: "high" }
      ],
      "balanced"
    ),
    E(
      _a,
      "Defaults",
      "Keep the grid in the playblast",
      "Records the floor grid into the playblast instead of hiding it for the capture.",
      !1
    ),
    E(
      va,
      "Defaults",
      "Burn labels / annotations into the playblast",
      "Paints the viewport Labels overlay onto the recorded frames (they are hidden by default for a clean capture).",
      !1
    ),
    O(
      Sa,
      "Proxy",
      "Default point density",
      "Point count of the omni-reference point field.",
      ["none", "sparse", "balanced", "dense", "ultra"],
      "balanced"
    ),
    O(
      wa,
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
      id: xa,
      category: [...Q, "Proxy", "Default point colour"],
      name: "Default point colour",
      tooltip: "Colour of the reference point field.",
      type: "color",
      defaultValue: "cbd5e1"
    },
    O(
      Ma,
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
      id: Ca,
      category: [...Q, "Viewport", "Studio quality"],
      name: "Studio quality",
      tooltip: "Image-based lighting and soft shadows in the editing viewport. Lower it on a modest GPU.",
      type: "combo",
      options: [
        { text: "Low (no shadows)", value: "low" },
        { text: "Balanced", value: "balanced" },
        { text: "High (2048px shadows)", value: "high" }
      ],
      defaultValue: "balanced",
      onChange: (f) => t?.(f)
    },
    {
      ...E(
        ka,
        "Viewport",
        "Drop quality when the viewport stutters",
        "Steps the studio quality down automatically if navigation falls below ~40fps, and leaves it there for the session.",
        !0
      ),
      onChange: () => a?.()
    },
    {
      id: Da,
      category: [...Q, "Viewport", "Default background colour"],
      name: "Default background colour",
      tooltip: "Viewport background. Leave it at the default to keep the studio sky.",
      type: "color",
      defaultValue: "121212",
      onChange: (f) => s?.(f)
    },
    E(
      ja,
      "Display",
      "Show grid by default",
      "Shows the viewport floor grid on newly created Director nodes.",
      !0
    ),
    E(
      Ta,
      "Display",
      "Show camera mini-map by default",
      "Shows the radar mini-map on newly created Director nodes.",
      !0
    ),
    E(
      Aa,
      "Display",
      "Show camera paths by default",
      "Shows camera trajectories on newly created Director nodes.",
      !0
    ),
    E(
      Ea,
      "Display",
      "Show camera gizmos by default",
      "Shows camera bodies and frustums on newly created Director nodes.",
      !0
    ),
    E(
      Ia,
      "Display",
      "Show look-at targets by default",
      "Shows camera look-at lines and target crosshairs on newly created Director nodes.",
      !0
    ),
    E(
      Oa,
      "Display",
      "Show helper axes by default",
      "Shows null-object axis helpers on newly created Director nodes.",
      !0
    ),
    E(
      Pa,
      "Display",
      "Show transform gizmo by default",
      "Shows transform and axis gizmos on newly created Director nodes.",
      !0
    ),
    E(
      za,
      "Display",
      "Show rule-of-thirds guides by default",
      "Shows the rule-of-thirds grid and centre crosshair in camera view.",
      !0
    ),
    E(
      Na,
      "Display",
      "Show safe areas by default",
      "Shows the 90% action-safe and 80% title-safe rectangles.",
      !1
    ),
    E(
      Ra,
      "Display",
      "Show resolution gate by default",
      "Masks the viewport down to the node's output width x height.",
      !1
    ),
    O(
      La,
      "Display",
      "Default aspect ratio",
      "Framing ratio used by the resolution gate. 'Auto' follows the node output.",
      ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"],
      "auto"
    ),
    E(
      Fa,
      "Display",
      "Show burn-in data by default",
      "Overlays frame, fps, FOV and render mode along the bottom of the viewport.",
      !1
    ),
    E(
      Va,
      "Display",
      "Show speed map by default",
      "Colours the camera path by travel speed.",
      !1
    ),
    E(
      Ba,
      "Display",
      "Show wireframe by default",
      "Draws mesh edges over scene objects. Skinned models follow their animation.",
      !1
    ),
    E(
      Ka,
      "Display",
      "Show mesh vertices by default",
      "Draws mesh vertices as points over scene objects.",
      !1
    ),
    O(
      qa,
      "Tools",
      "Default selection mode",
      "Component level the viewport selects at.",
      ["object", "vertex", "edge", "face"],
      "object"
    ),
    O(
      Ga,
      "Tools",
      "Default transform mode",
      "Transform the gizmo starts in.",
      ["translate", "rotate", "scale"],
      "translate"
    ),
    O(
      Ha,
      "Tools",
      "Default gizmo space",
      "World-aligned axes, or the selected object's own orientation.",
      ["world", "local"],
      "world"
    ),
    O(
      Wa,
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
    V(
      $a,
      "Tools",
      "Default snap grid size",
      "Grid increment used by spatial grid snapping, in scene units.",
      { min: 0.01, max: 10, step: 0.01 },
      0.5
    ),
    {
      ...O(
        Ua,
        "Navigation",
        "Default navigation profile",
        "Viewport navigation profile applied to newly created Director nodes.",
        [
          { text: "Maya", value: "maya" },
          { text: "Blender", value: "blender" },
          { text: "Simple (mouse only)", value: "simple" }
        ],
        "simple"
      ),
      onChange: (f) => r?.(f)
    },
    {
      ...V(
        Xa,
        "Navigation",
        "Default fly speed",
        "WASD / QE fly speed applied to newly created Director nodes.",
        { min: 0.05, max: 5, step: 0.05 },
        1
      ),
      onChange: (f) => i?.(f)
    },
    {
      ...E(
        Ya,
        "Navigation",
        "Invert vertical orbit (Invert Y)",
        "Invert the vertical axis when orbiting the viewport.",
        !1
      ),
      onChange: (f) => l?.(f)
    },
    {
      ...V(
        Za,
        "Navigation",
        "Mouse wheel zoom sensitivity",
        "Multiplier for mouse wheel zoom speed in the viewport.",
        { min: 0.2, max: 3, step: 0.1 },
        1
      ),
      onChange: (f) => m?.(f)
    },
    {
      ...V(
        Qa,
        "Navigation",
        "Orbit rotation sensitivity",
        "Multiplier for camera orbit rotation speed in the viewport.",
        { min: 0.2, max: 3, step: 0.1 },
        1
      ),
      onChange: (f) => c?.(f)
    },
    {
      ...V(
        Ja,
        "Navigation",
        "Pan sensitivity",
        "Multiplier for viewport pan gestures.",
        { min: 0.2, max: 3, step: 0.1 },
        1
      ),
      onChange: (f) => d?.(f)
    },
    {
      ...V(
        er,
        "Navigation",
        "Dolly drag sensitivity",
        "Multiplier for middle-button and Alt-drag dolly gestures.",
        { min: 0.2, max: 3, step: 0.1 },
        1
      ),
      onChange: (f) => p?.(f)
    },
    O(
      tr,
      "Navigation",
      "Default view",
      "View a newly created Director node opens in.",
      ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"],
      "perspective"
    ),
    E(
      ar,
      "Controls",
      "Enable OmniCam shortcuts",
      "Lets OmniCam consume viewport and timeline keyboard shortcuts while a Director is focused.",
      !0
    ),
    E(
      rr,
      "Timeline",
      "Enable timeline snapping by default",
      "Snaps dragged keyframes to the frame increment below.",
      !0
    ),
    V(
      or,
      "Timeline",
      "Default timeline snap",
      "Frame increment used by timeline snapping on newly created Director nodes.",
      { min: 1, max: 24, step: 1 },
      1
    ),
    E(
      nr,
      "Timeline",
      "Enable Auto Key by default",
      "Enables Auto Key on newly created Director nodes.",
      !1
    ),
    O(
      sr,
      "Timeline",
      "Default key interpolation",
      "Interpolation mode assigned to newly created camera and object keyframes.",
      ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold"],
      "ease"
    ),
    O(
      ir,
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
      lr,
      "Timeline",
      "Loop playback by default",
      "Restarts playback at the first frame instead of stopping at the last.",
      !1
    ),
    {
      ...O(
        cr,
        "Interface",
        "Default interface density",
        "How much of the editor chrome is shown.",
        [
          { text: "Basic", value: "basic" },
          { text: "Animation", value: "animation" },
          { text: "Advanced", value: "advanced" }
        ],
        "animation"
      ),
      onChange: (f) => o?.(f)
    },
    O(
      mr,
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
    {
      ...E(
        dr,
        "Interface",
        "Show camera previews by default",
        "Opens newly created Director nodes with the camera preview strip visible.",
        !0
      ),
      onChange: (f) => u?.(f)
    },
    {
      ...V(
        pr,
        "History",
        "Undo history limit",
        "Maximum number of Undo steps held by each Director editor.",
        { min: 10, max: 500, step: 10 },
        100
      ),
      onChange: (f) => n?.(f)
    },
    O(
      fr,
      "Defaults",
      "Default extractor tracker",
      "Default tracking backend for OmniCam Extractor.",
      [
        { text: "DPVO (Dense Point-Visual Odometry)", value: "dpvo" },
        { text: "PyColmap (SfM feature matching)", value: "pycolmap" }
      ],
      "dpvo"
    ),
    O(
      ur,
      "Defaults",
      "Default monitor profile",
      "Default compilation profile for OmniCam Monitor.",
      [
        { text: "Wan 2.1 Native Camera (Trajectory/Plücker)", value: "wan_camera_native" },
        { text: "MiniMax Hailuo H3 (Omni Reference)", value: "minimax_h3" },
        { text: "LTX-Video Motion Profile", value: "ltx_motion" },
        { text: "Generic Video Reference", value: "generic_video" }
      ],
      "wan_camera_native"
    )
  ];
}
const hr = nn({
  onLocaleChange: () => gr(),
  onQualityChange: (e) => zt(e),
  onAdaptiveChange: () => zt()
});
let ut = null;
function K(e, t) {
  try {
    const a = ut?.extensionManager?.setting?.get(e);
    return a ?? t;
  } catch {
    return t;
  }
}
function sn(e, t) {
  try {
    ut?.extensionManager?.setting?.set?.(e, t);
  } catch (a) {
    console.warn("OmniCam: writeSetting failed", e, t, a);
  }
}
function oi(e, t) {
  return K(e, t);
}
function ni() {
  for (const e of hr)
    e.defaultValue !== void 0 && (sn(e.id, e.defaultValue), e.onChange?.(e.defaultValue));
}
function B(e, t, a, r, o = !1) {
  const n = Number(K(e, t)), s = Number.isFinite(n) ? Math.min(r, Math.max(a, n)) : t;
  return o ? Math.round(s) : s;
}
function I(e, t) {
  const a = K(e, t);
  return typeof a == "boolean" ? a : t;
}
function N(e, t, a) {
  const r = String(K(e, t));
  return a.includes(r) ? r : t;
}
function Pt(e, t) {
  const a = String(K(e, t) || "").trim(), r = a.startsWith("#") ? a.slice(1) : a;
  return /^[0-9a-fA-F]{6}$/.test(r) ? `#${r.toLowerCase()}` : t;
}
function gr() {
  const e = String(K(ma, "auto")), t = String(K("Comfy.Locale", "en") || "en").slice(0, 2).toLowerCase(), a = e === "auto" ? t : e, r = a !== Vr();
  if (Fr(a), !!r) {
    for (const o of $)
      if (!o.disposed)
        try {
          o.syncFromWidgets?.(!1), o.refreshKeys?.(), o.refreshObjects?.(), o.refreshInspector?.(), o.render?.(), o.setStatus?.(S("Language updated — reload the workflow to translate every label."));
        } catch (n) {
          console.warn("OmniCam: live locale refresh failed", n);
        }
  }
}
const $ = /* @__PURE__ */ new Set();
function ln(e) {
  $.add(e);
}
function si(e) {
  $.delete(e);
}
function cn() {
  for (const e of $)
    if (!e.disposed) return !0;
  return !1;
}
function mn(e) {
  for (const t of $)
    if (!t.disposed && (t.drag || t.boxSelection || t.gizmoDrag || t.activePointerId != null))
      return t;
  if (e instanceof Node) {
    for (const t of $)
      if (!t.disposed && t.root?.contains(e)) return t;
  }
  if ($.size === 1) {
    const [t] = $;
    if (t && !t.disposed) return t;
  }
  return null;
}
function yr() {
  return String(K(Ca, "balanced"));
}
function dn() {
  return K(ka, !0) !== !1;
}
function pn() {
  return K(ar, !0) !== !1;
}
function zt(e = yr()) {
  for (const t of $)
    t.disposed || (br(t), t.requestRender ? t.requestRender("quality") : t.render?.(), t.renderCameraView?.());
}
function fn() {
  return {
    fps: B(da, 24, 1, 120, !0),
    durationSeconds: B(pa, 5, 1, 120, !0),
    width: B(fa, 1280, 64, 4096, !0),
    height: B(ua, 720, 64, 4096, !0),
    renderMode: String(K(ha, "omni_ref")),
    encoder: String(K(ga, "auto")),
    playblastResolution: N(ya, "output", ["viewport", "half", "output", "double"]),
    playblastQuality: N(ba, "balanced", ["low", "balanced", "high"]),
    playblastGrid: I(_a, !1),
    playblastLabels: I(va, !1),
    pointDensity: N(Sa, "balanced", ["none", "sparse", "balanced", "dense", "ultra"]),
    pointSpread: N(wa, "all_views", ["all_views", "ground_focus", "dome"]),
    pointColor: Pt(xa, "#cbd5e1"),
    cardFit: N(Ma, "contain", ["contain", "cover", "stretch"]),
    backgroundColor: Pt(Da, "#121212"),
    showGrid: I(ja, !0),
    showRadar: I(Ta, !0),
    showCameraPaths: I(Aa, !0),
    showCameraGizmos: I(Ea, !0),
    showLookAt: I(Ia, !0),
    showHelperAxes: I(Oa, !0),
    showGizmo: I(Pa, !0),
    guides: I(za, !0),
    safeAreas: I(Na, !1),
    resolutionGate: I(Ra, !1),
    aspectRatio: N(La, "auto", ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"]),
    burnIn: I(Fa, !1),
    speedHeatmap: I(Va, !1),
    showWireframe: I(Ba, !1),
    showVertices: I(Ka, !1),
    selectMode: N(qa, "object", ["object", "vertex", "edge", "face"]),
    gizmoMode: N(Ga, "translate", ["translate", "rotate", "scale"]),
    gizmoSpace: N(Ha, "world", ["world", "local"]),
    spatialSnapMode: N(Wa, "none", ["none", "grid", "vertex"]),
    spatialGridSize: B($a, 0.5, 0.01, 100),
    navigationProfile: N(Ua, "simple", ["maya", "blender", "simple"]),
    flySpeed: B(Xa, 1, 0.05, 5),
    invertOrbitY: I(Ya, !1),
    zoomSensitivity: B(Za, 1, 0.2, 3),
    orbitSensitivity: B(Qa, 1, 0.2, 3),
    panSensitivity: B(Ja, 1, 0.2, 3),
    dollySensitivity: B(er, 1, 0.2, 3),
    viewMode: N(tr, "perspective", ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"]),
    snapEnabled: I(rr, !0),
    snapFrames: B(or, 1, 1, 24, !0),
    autoKey: I(nr, !1),
    defaultInterpolation: N(sr, "ease", ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold"]),
    timecodeMode: N(ir, "time", ["time", "timecode"]),
    loopPlayback: I(lr, !1),
    uiDensity: N(cr, "animation", ["basic", "animation", "advanced"]),
    previewLayout: N(mr, "auto", ["auto", "1", "2", "4"]),
    cameraViewVisible: I(dr, !0),
    undoLimit: B(pr, 100, 10, 500, !0),
    extractorBackend: N(fr, "dpvo", ["dpvo", "pycolmap"]),
    monitorProfile: N(ur, "wan_camera_native", ["wan_camera_native", "minimax_h3", "ltx_motion", "generic_video"])
  };
}
function un(e) {
  ut = e, Lr("fr", on), gr();
}
function br(e) {
  const t = yr(), a = dn();
  for (const r of [e.webgl, e.cameraWebgl])
    r && (r.adaptiveQuality = a, r.onQualityDowngrade = (o) => e.setStatus?.(
      S("Studio quality lowered to {level} to keep the viewport responsive").replace("{level}", o)
    ), r.setViewportQuality?.(t));
}
function hn(e) {
  ln(e), br(e);
}
function gn(e) {
  const t = fn();
  e.fpsWidget && (e.fpsWidget.value = t.fps), e.durationWidget && (e.durationWidget.value = t.durationSeconds), e.widthWidget && (e.widthWidget.value = t.width), e.heightWidget && (e.heightWidget.value = t.height), e.modeWidget && (e.modeWidget.value = t.renderMode);
  const a = e.root?.querySelector('[data-role="encoder"]');
  a && (a.value = t.encoder), e.cameraSpeed = t.flySpeed, e.history && (e.history.limit = t.undoLimit), Object.assign(e.state, {
    playblast_resolution: t.playblastResolution,
    playblast_quality: t.playblastQuality,
    playblast_grid: t.playblastGrid,
    playblast_labels: t.playblastLabels,
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
    invert_orbit_y: t.invertOrbitY,
    zoom_sensitivity: t.zoomSensitivity,
    orbit_sensitivity: t.orbitSensitivity,
    pan_sensitivity: t.panSensitivity,
    dolly_sensitivity: t.dollySensitivity,
    view_mode: t.viewMode,
    snap_enabled: t.snapEnabled,
    snap_frames: t.snapFrames,
    auto_key: t.autoKey,
    default_interpolation: t.defaultInterpolation,
    timecode_mode: t.timecodeMode,
    loop_playback: t.loopPlayback,
    ui_density: t.uiDensity,
    preview_layout: t.previewLayout,
    camera_view_visible: t.cameraViewVisible,
    extractor_backend: t.extractorBackend,
    monitor_profile: t.monitorProfile
  }), e.syncFromWidgets?.();
}
function yn(e, t) {
  return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function Nt(e, t, a, r, o) {
  const { right: n, up: s, forward: i } = F(t), l = t.position, m = [a[0] - l[0], a[1] - l[1], a[2] - l[2]], c = yn(m, i);
  let d, p;
  if (t.camera_type === "orthographic") {
    const u = 5 / Math.max(0.01, t.zoom || 1), f = u * r / Math.max(1, o);
    d = (e[0] / Math.max(1, r) - 0.5) * 2 * f, p = (0.5 - e[1] / Math.max(1, o)) * 2 * u;
  } else {
    const u = 0.5 * o / Math.tan(Math.max(1e-3, t.fov) * Math.PI / 360);
    d = (e[0] - r / 2) * c / u, p = (o / 2 - e[1]) * c / u;
  }
  return [0, 1, 2].map((u) => l[u] + i[u] * c + n[u] * d + s[u] * p);
}
function bn(e) {
  return e === "bezier" ? "bezier" : "smooth";
}
function ii(e) {
  for (let t = e?.object; t; t = t.parent)
    if (t.userData?.omnicamPathKey) return t.userData.omnicamPathKey;
  return null;
}
function li(e) {
  for (let t = e?.object; t; t = t.parent)
    if (t.userData?.omnicamCurveHandle) return t.userData.omnicamCurveHandle;
  return null;
}
const ye = "orbit", be = "pan", Ue = "dolly";
function _r(e, t, { includeCtrlFallback: a, includeSimpleLeft: r = a }) {
  const o = !!(t.ctrlKey || t.metaKey);
  if (e === "simple" && !t.altKey && !o && !t.shiftKey) {
    if (t.button === 2) return be;
    if (t.button === 0) return r ? ye : null;
  }
  return t.button === 1 ? o ? Ue : t.shiftKey || t.altKey ? be : ye : t.button === 2 ? t.altKey && e === "maya" ? Ue : null : t.button !== 0 ? null : t.altKey ? o ? Ue : t.shiftKey ? be : ye : o && a ? t.shiftKey ? be : ye : null;
}
function _n(e, t, a) {
  const r = ht(e), o = _r(r, t, { includeCtrlFallback: !0 });
  return o === ye && a?.camera_type === "orthographic" ? be : o;
}
function Rt(e, t) {
  return e.isNavigatingFly ? !0 : _r(ht(e), t, { includeCtrlFallback: !1 }) !== null;
}
const vn = ["maya", "blender", "simple"];
function ht(e) {
  const t = e.state?.navigation_profile;
  return vn.includes(t) ? t : "maya";
}
function Sn(e, t) {
  const a = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? Math.max(1, t) : 1;
  return Number.isFinite(e.deltaY) ? e.deltaY * a : 0;
}
function Le(e, t) {
  return (e.camera_type === "orthographic" ? 10 / Math.max(0.01, e.zoom || 1) : 2 * G(A(e.position, e.target)) * Math.tan((e.fov || 35) * Math.PI / 360)) / Math.max(1, t);
}
function _e(e) {
  const t = e.activePointerId;
  e.activePointerId = null, t != null && e.interactionElement.hasPointerCapture?.(t) && e.interactionElement.releasePointerCapture(t), e.pointerHit = !1, e.canvas.classList.remove("dragging"), e.interactionElement.style && (e.interactionElement.style.cursor = "default");
}
function vr(e) {
  const t = Array.isArray(e) ? e.filter((r) => r?.camera?.position) : [];
  if (!t.length) return [0, 0, 0];
  const a = t.reduce((r, o) => C(r, o.camera.position), [0, 0, 0]);
  return k(a, 1 / t.length);
}
function Lt(e, { mode: t, origin: a, delta: r, factors: o, rotationDeg: n }) {
  if (t === "translate") return C(e, r);
  const s = A(e, a);
  return t === "scale" ? C(a, [s[0] * o[0], s[1] * o[1], s[2] * o[2]]) : C(a, xe(s, n));
}
function wn(e, t) {
  return (Array.isArray(e) ? e : []).map((r) => {
    const o = { ...r.camera };
    return Array.isArray(o.position) && (o.position = Lt(o.position, t)), Array.isArray(o.target) && (o.target = Lt(o.target, t)), { ...r, camera: o };
  });
}
function xn(e, t) {
  e.finishCameraEdit(), e.selectedEntity = "camera_path", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(t.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(S("{name} · whole path selected — move / scale / rotate").replace("{name}", t.name));
}
function Mn(e, { baseDrag: t, viewCamera: a, entityPosition: r }) {
  const o = e.activeCameraTrack?.();
  return !o || o.locked || !(o.keyframes?.length >= 1) ? !1 : (e.checkpoint("Transform camera path"), e.gizmoDrag = {
    ...t,
    type: "camera_path",
    historyCheckpointed: !0,
    trackId: o.id,
    origin: vr(o.keyframes),
    baseKeys: o.keyframes.map((n) => ({ ...n, camera: L(n.camera) })),
    viewRight: F(a).right,
    viewUp: F(a).up,
    freeScale: a.camera_type === "orthographic" ? Le(a, e.canvas.height) : G(A(a.position, r)) * (2 * Math.tan((a.fov || 35) * Math.PI / 360)) / e.canvas.height
  }, !0);
}
function Cn(e, { pointer: t, deltaPixels: a, precision: r, snapping: o }) {
  const n = e.gizmoDrag, s = e.state.cameras.find((m) => m.id === n.trackId);
  if (!s) return;
  const i = n.origin;
  let l;
  if (e.state.gizmo_mode === "translate") {
    let m;
    if (n.free) {
      const c = (t[0] - n.pointer[0]) * r, d = (t[1] - n.pointer[1]) * r;
      m = C(k(n.viewRight, c * n.freeScale), k(n.viewUp, -d * n.freeScale));
    } else
      m = k(n.axis, a * n.worldLength / n.screenLength);
    l = { mode: "translate", delta: m };
  } else if (e.state.gizmo_mode === "scale") {
    let m;
    if (n.free) {
      const c = (t[0] - n.pointer[0]) * r, d = (t[1] - n.pointer[1]) * r, p = Math.max(0.01, 1 + (c - d) * n.freeScale * 0.35);
      m = [p, p, p];
    } else {
      const c = Math.max(0.01, 1 + a * n.worldLength / n.screenLength * 0.5);
      m = [1, 1, 1], m[n.axisIndex] = o ? Math.max(0.01, Math.round(c / 0.1) * 0.1) : c;
    }
    l = { mode: "scale", origin: i, factors: m };
  } else {
    const m = o ? Math.round(a * 0.75 / 15) * 15 : a * 0.75, c = [0, 0, 0];
    c[n.axisIndex] = m, l = { mode: "rotate", origin: i, rotationDeg: c };
  }
  s.keyframes = wn(n.baseKeys, l), s.id === e.state.active_camera_id && (e.state.keyframes = s.keyframes), e.camera = le(s, e.frame, e.state.objects), s.camera = L(e.camera), e.refreshKeys(), e.refreshInspector(), e.render(), e.renderCameraView?.();
}
function Ft(e, t) {
  const a = [];
  for (const r of [e[0], t[0]]) for (const o of [e[1], t[1]]) for (const n of [e[2], t[2]]) a.push([r, o, n]);
  return a;
}
function kn(e, t) {
  const a = e.webgl?.getObjectWorldBounds?.(t.id);
  if (a) return Ft(a.min, a.max);
  const r = ft(e.state.objects, t, e.frame || 0), o = (t.type === "model" || t.type === "glb") && e.webgl?.getObjectWorldCenter?.(t.id) || r.position, n = r.size.map((i) => Math.max(0.01, Math.abs(i)) / 2), s = r.quaternion || Ne(r.rotation);
  return Ft(n.map((i) => -i), n).map((i) => C(o, ra(i, s)));
}
function Dn(e, t, a, r = {}) {
  const o = e.state.objects.filter((b) => b.enabled !== !1), n = r.all ? o : o.filter((b) => e.selectedObjectIds?.has(b.id)), i = (n.length ? n : [a]).flatMap((b) => kn(e, b)), l = [0, 1, 2].map((b) => Math.min(...i.map((x) => x[b]))), m = [0, 1, 2].map((b) => Math.max(...i.map((x) => x[b]))), c = l.map((b, x) => (b + m[x]) / 2), { right: d, up: p, forward: u } = F(t), f = Math.max(1, e.canvas?.width || e.state.width || 1280) / Math.max(1, e.canvas?.height || e.state.height || 720), h = Math.tan((t.fov || 35) * Math.PI / 360), _ = h * f;
  let y = 2, v = 0.1;
  for (const b of i) {
    const x = A(b, c), w = Math.abs(U(x, d)), D = Math.abs(U(x, p)), g = U(x, u);
    y = Math.max(y, 1.15 * w / _ - g, 1.15 * D / h - g, (t.near || 0.01) * 2 - g), v = Math.max(v, 1.15 * D, 1.15 * w / f);
  }
  t.target = c, t.position = A(c, k(u, y)), t.camera_type === "orthographic" && (t.zoom = Math.max(0.01, 5 / v));
}
function X(e) {
  return e.recording ? e.playblastCameraAtFrame() : e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode];
}
function ci(e, t) {
  if (["camera", "perspective", "iso", "front", "back", "top", "right", "left", "bottom"].includes(t)) {
    e.state.view_mode = t;
    for (const a of e.root.querySelectorAll('[data-role="view-mode"]')) a.value = t;
    for (const a of e.root.querySelectorAll("[data-view]")) {
      const r = a.dataset.view === t;
      a.classList.toggle("active", r), a.setAttribute("aria-pressed", String(r));
    }
    e.serialize(), e.render(), e.setStatus(S(`View: ${t[0].toUpperCase()}${t.slice(1)}`));
  }
}
function mi(e, t) {
  if (["translate", "rotate", "scale"].includes(t)) {
    e.state.gizmo_mode = t;
    for (const a of e.root.querySelectorAll("[data-transform-mode]")) {
      const r = a.dataset.transformMode === t;
      a.classList.toggle("active", r), a.setAttribute("aria-pressed", String(r));
    }
    e.serialize(), e.render(), e.setStatus(S(`${t[0].toUpperCase()}${t.slice(1)} · ${t === "translate" ? "W" : t === "rotate" ? "E" : "R"}`));
  }
}
function di(e, t) {
  e.checkpoint("Reset camera"), e.camera = t();
  for (const r of e.root.querySelectorAll('[data-role="camera-fov"]')) r.value = String(e.camera.fov);
  for (const r of e.root.querySelectorAll('[data-role="camera-roll"]')) r.value = String(e.camera.roll);
  const a = e.root.querySelector('[data-role="camera-type"]');
  a && (a.value = e.camera.camera_type), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.setStatus(S("Camera reset"));
}
function pi(e, t = {}) {
  const a = X(e), r = e.state.view_mode !== "camera", o = [...a.target];
  if (e.subSelection?.point && !t.all) {
    e.checkpoint("Frame selection");
    const i = e.subSelection.point, l = ne(A(a.position, o)), m = Number.isFinite(l[0]) && G(l) > 0.1 ? l : [0.707, 0.4, 0.707], c = 2;
    a.target = [...i], a.position = C(a.target, k(m, c)), r ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit());
    const d = e.subSelection.mode === "vertex" ? "Vertex" : e.subSelection.mode === "edge" ? "Edge" : "Face";
    e.setStatus(S(`Focused on ${d} at [${i.map((p) => Math.round(p * 100) / 100).join(", ")}]`));
    return;
  }
  const s = e.selectedObject() || e.state.objects.find((i) => i.id === "subject") || e.state.objects[0] || { position: [0, 1.5, 0], size: [2, 3] };
  e.checkpoint(t.all ? "Frame all" : "Frame subject"), Dn(e, a, s, t), r ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit()), e.setStatus(t.all ? S("Framed: all objects") : S("Framed: {name}").replace("{name}", s.name || s.type || S("Subject")));
}
function jn(e, t, a, { forceLocal: r = !1 } = {}) {
  const o = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], n = a?.rotation || t?.rotation || [0, 0, 0];
  return r || e.state.gizmo_space === "local" ? o.map((s) => xe(s, n)) : o;
}
function Tn(e) {
  if (e.selectedEntity === "object") {
    const t = e.selectedObject();
    if (!t || t.locked) return null;
    const a = t.keyframes?.length ? Ke(t, e.frame) : t, r = a.position || [0, 0, 0];
    return {
      type: "object",
      object: t,
      position: r,
      origin: r,
      rotation: a.rotation || [0, 0, 0],
      size: a.size || [1, 1, 1]
    };
  }
  if (e.state.view_mode !== "camera") {
    const t = e.activeCameraTrack();
    if (t?.locked) return null;
    if (e.selectedEntity === "camera_target")
      return { type: "camera_target", position: le(t, e.frame, e.state.objects).target || e.camera.target || [0, 1.5, 0], rotation: [0, 0, 0] };
    if (e.selectedEntity === "camera")
      return { type: "camera", position: le(t, e.frame, e.state.objects).position || e.camera.position || [6, 4, 6], rotation: [0, 0, 0] };
    if (e.selectedEntity === "camera_path" && (t?.keyframes?.length || 0) >= 1)
      return {
        type: "camera_path",
        position: vr(t.keyframes),
        rotation: [0, 0, 0],
        size: [1, 1, 1],
        track: t
      };
  }
  return null;
}
function Sr(e) {
  const t = Tn(e);
  if (!t) return null;
  const a = X(e), r = t.position;
  if (!r || !Number.isFinite(r[0]) || !Number.isFinite(r[1]) || !Number.isFinite(r[2])) return null;
  const o = R(r, a, e.canvas.width, e.canvas.height);
  if (!o || !Number.isFinite(o[0]) || !Number.isFinite(o[1])) return null;
  const n = Math.max(0.7, G(A(a.position, r)) * 0.12), s = e.state.gizmo_mode === "scale" || e.state.gizmo_mode === "rotate", i = t.type === "object" ? jn(e, t.object, t, { forceLocal: s }) : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (e.state.gizmo_mode === "scale" && t.type !== "object" && t.type !== "camera_path") return null;
  if (e.state.gizmo_mode !== "rotate" || t.type === "camera_target")
    return {
      entity: t,
      center: o,
      worldLength: n,
      handles: i.map((m, c) => ({ index: c, axis: m, points: [o, R(C(r, k(m, n)), a, e.canvas.width, e.canvas.height)] })).filter((m) => m.points[1] && Number.isFinite(m.points[1][0]) && Number.isFinite(m.points[1][1]))
    };
  const l = i.map((m, c) => {
    const d = Math.abs(m[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], p = ne(Se(m, d)), u = ne(Se(m, p)), f = [];
    for (let h = 0; h <= 48; h++) {
      const _ = h / 48 * Math.PI * 2, y = R(C(r, C(k(p, Math.cos(_) * n), k(u, Math.sin(_) * n))), a, e.canvas.width, e.canvas.height);
      y && Number.isFinite(y[0]) && Number.isFinite(y[1]) && f.push(y);
    }
    return { index: c, axis: m, points: f };
  });
  return { entity: t, center: o, worldLength: n, handles: l };
}
function wr(e, t) {
  const a = Sr(e);
  if (!a) return null;
  const r = Math.min(2, window.devicePixelRatio || 1), o = Math.hypot(t[0] - a.center[0], t[1] - a.center[1]);
  if (a.entity.type === "object" && (e.state.gizmo_mode === "translate" || e.state.gizmo_mode === "scale") && o <= 11 * r) {
    const i = a.center;
    return {
      free: !0,
      index: -1,
      axis: [0, 0, 0],
      distance: o,
      segment: [i, [i[0] + 1, i[1]]],
      worldLength: a.worldLength,
      entity: a.entity
    };
  }
  let s = null;
  for (const i of a.handles)
    for (let l = 0; l < i.points.length - 1; l++) {
      const m = i.points[l], c = i.points[l + 1], d = aa(t, m, c);
      (!s || d < s.distance) && (s = { ...i, distance: d, segment: [m, c], worldLength: a.worldLength, entity: a.entity });
    }
  return s?.distance <= 18 * r ? s : null;
}
function An(e, t) {
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
  const r = X(e);
  if (e.state.view_mode !== "camera") {
    for (const s of e.state.cameras) {
      for (const c of s.keyframes || []) {
        const d = c.camera?.position;
        if (!d) continue;
        const p = R(d, r, e.canvas.width, e.canvas.height);
        if (p && Math.hypot(t[0] - p[0], t[1] - p[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
          return { type: "camera_keyframe", camera: s, keyframe: c };
      }
      const i = le(s, e.frame, e.state.objects), l = R(i.target || [0, 1.5, 0], r, e.canvas.width, e.canvas.height);
      if (l && Math.hypot(t[0] - l[0], t[1] - l[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera_target", camera: s };
      const m = R(i.position || [6, 4, 6], r, e.canvas.width, e.canvas.height);
      if (m && Math.hypot(t[0] - m[0], t[1] - m[1]) <= 22 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera", camera: s };
    }
    if (e.state.show_camera_paths !== !1)
      for (const s of e.state.cameras) {
        const i = s.keyframes || [];
        if (i.length < 2) continue;
        const l = i.map((m) => R(m.camera?.position, r, e.canvas.width, e.canvas.height)).filter((m) => m && Number.isFinite(m[0]) && Number.isFinite(m[1]));
        for (let m = 0; m < l.length - 1; m += 1)
          if (aa(t, l[m], l[m + 1]) <= 8 * Math.min(2, window.devicePixelRatio || 1))
            return { type: "camera_path", camera: s };
      }
    for (const s of e.state.objects)
      if (s.enabled !== !1)
        for (const i of s.keyframes || []) {
          const l = i.transform?.position;
          if (!l) continue;
          const m = R(l, r, e.canvas.width, e.canvas.height);
          if (m && Math.hypot(t[0] - m[0], t[1] - m[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
            return { type: "object_keyframe", object: s, keyframe: i };
        }
  }
  let n = null;
  for (const s of e.state.objects) {
    if (s.enabled === !1) continue;
    const i = s.keyframes?.length ? Ke(s, e.frame) : s, l = R(i.position || [0, 0, 0], r, e.canvas.width, e.canvas.height);
    if (!l) continue;
    const m = Math.hypot(t[0] - l[0], t[1] - l[1]);
    (!n || m < n.distance) && (n = { object: s, distance: m });
  }
  return n?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? { type: "object", object: n.object } : null;
}
function En(e, t, a, r = 15) {
  const o = a[0] - t[0], n = a[1] - t[1], s = Math.hypot(o, n) || 1, i = o / s, l = n / s, m = -l, c = i, d = r * 0.42, p = a[0] - i * r, u = a[1] - l * r;
  e.beginPath(), e.moveTo(a[0], a[1]), e.lineTo(p + m * d, u + c * d), e.lineTo(p - m * d, u - c * d), e.closePath(), e.fill(), e.save(), e.strokeStyle = "rgba(15, 23, 42, 0.65)", e.lineWidth = 1, e.stroke(), e.restore();
}
function fi(e) {
  const t = Sr(e);
  if (!t || !t.handles) return;
  if (t.entity?.type === "camera_path") {
    const o = X(e), n = (t.entity.track?.keyframes || []).map((s) => R(s.camera?.position, o, e.canvas.width, e.canvas.height)).filter((s) => s && Number.isFinite(s[0]) && Number.isFinite(s[1]));
    n.length >= 2 && (e.ctx.save(), e.ctx.strokeStyle = "rgba(139, 125, 227, 0.9)", e.ctx.lineWidth = 2, e.ctx.setLineDash([6, 4]), e.ctx.beginPath(), n.forEach((s, i) => i ? e.ctx.lineTo(s[0], s[1]) : e.ctx.moveTo(s[0], s[1])), e.ctx.stroke(), e.ctx.restore());
  }
  const a = ["#f43f5e", "#10b981", "#3b82f6"];
  e.ctx.save(), e.ctx.lineCap = "round", e.ctx.lineJoin = "round";
  for (const o of t.handles) {
    if (!o?.points?.length) continue;
    const n = e.hoveredGizmoHandle === o.index || e.gizmoDrag?.axisIndex === o.index;
    if (e.ctx.lineWidth = n ? 6.5 : 3.8, e.ctx.strokeStyle = n ? "#ffffff" : a[o.index] || "#ffffff", e.ctx.fillStyle = a[o.index] || "#ffffff", e.ctx.beginPath(), o.points.forEach((s, i) => {
      s && (i ? e.ctx.lineTo(s[0], s[1]) : e.ctx.moveTo(s[0], s[1]));
    }), e.ctx.stroke(), e.state.gizmo_mode !== "rotate" || t.entity?.type === "camera_target") {
      const s = o.points.filter((l) => l && Number.isFinite(l[0]) && Number.isFinite(l[1]));
      if (!s.length) continue;
      const i = s[s.length - 1];
      e.state.gizmo_mode === "scale" && t.entity?.type === "object" ? (e.ctx.fillRect(i[0] - 6, i[1] - 6, 12, 12), e.ctx.save(), e.ctx.strokeStyle = "rgba(15, 23, 42, 0.65)", e.ctx.lineWidth = 1, e.ctx.strokeRect(i[0] - 6, i[1] - 6, 12, 12), e.ctx.restore()) : En(e.ctx, s[0], i);
    }
  }
  if (t.entity?.type === "object" && (e.state.gizmo_mode === "translate" || e.state.gizmo_mode === "scale")) {
    const o = e.hoveredGizmoHandle === "free" || e.gizmoDrag?.free;
    if (e.ctx.save(), e.ctx.shadowColor = "rgba(0, 0, 0, 0.5)", e.ctx.shadowBlur = 5, e.ctx.fillStyle = o ? "#fbbf24" : "#f8fafc", e.ctx.strokeStyle = "#0f172a", e.ctx.lineWidth = 2.2, e.ctx.beginPath(), e.state.gizmo_mode === "scale") {
      const n = o ? 8 : 6;
      e.ctx.rect(t.center[0] - n, t.center[1] - n, n * 2, n * 2);
    } else
      e.ctx.arc(t.center[0], t.center[1], o ? 9.5 : 7, 0, Math.PI * 2);
    e.ctx.fill(), e.ctx.stroke(), e.ctx.restore();
  }
  e.ctx.restore();
}
const at = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, Fe = (e, t) => Math.round(e / t) * t;
function xr(e) {
  const t = e.selectedObjectIds instanceof Set && e.selectedObjectIds.size ? e.selectedObjectIds : new Set(e.selectedObjectId ? [e.selectedObjectId] : []);
  return e.state.objects.filter((a) => t.has(a.id) && !a.locked);
}
function In(e, t) {
  const a = xr(e);
  if (!a.length || !["translate", "rotate", "scale"].includes(t)) return !1;
  const r = `${t[0].toUpperCase()}${t.slice(1)} selection`;
  e.history?.beginTransaction?.(r) || e.checkpoint(r);
  for (const c of a) e.beginObjectEdit(c);
  const o = a.map((c) => ({ object: c, transform: ce(c) })), n = o.reduce((c, d) => C(c, d.transform.position), [0, 0, 0]).map((c) => c / o.length), s = [e.canvas.width * 0.5, e.canvas.height * 0.5], i = e.lastViewportPointer || s, l = e.interactionElement.getBoundingClientRect(), m = e.lastPointerEvent || { clientX: l.left + i[0] * l.width / e.canvas.width, clientY: l.top + i[1] * l.height / e.canvas.height };
  return e.modalTransform = { mode: t, axis: null, numeric: "", start: i, lastEvent: m, snapshots: o, pivot: n }, e.setTransformMode(t), e.setStatus(`${t.toUpperCase()} · move mouse · X/Y/Z constrain · type value · Enter confirm · Esc cancel`), e.render(), !0;
}
function On(e) {
  if (!e.numeric || e.numeric === "-" || e.numeric === ".") return null;
  const t = Number(e.numeric);
  return Number.isFinite(t) ? t : null;
}
function Pn(e, t, a, r, o, n, s) {
  const i = o ? "grid" : e.state.spatial_snap_mode;
  if (i === "grid") {
    const l = e.state.spatial_grid_size || 0.5;
    return n ? a.map((m, c) => m.map((d, p) => Math.abs(n[p]) > 1e-6 ? Fe(d, l) : s[c][p])) : a.map((m) => m.map((c) => Fe(c, l)));
  }
  if (i === "vertex" && r && !n) {
    const l = e.webgl?.pickSubElement?.(r[0], r[1], e.canvas.width, e.canvas.height, "vertex");
    if (l?.point && !t.snapshots.some((m) => m.object.id === l.objectId)) {
      const m = a.reduce((d, p) => C(d, p), [0, 0, 0]).map((d) => d / a.length), c = A(l.point, m);
      return a.map((d) => C(d, c));
    }
  }
  return a;
}
function Ae(e, t) {
  const a = e.modalTransform;
  if (!a) return !1;
  a.lastEvent = t;
  const r = e.interactionElement.getBoundingClientRect(), o = [
    (t.clientX - r.left) * e.canvas.width / Math.max(1, r.width),
    (t.clientY - r.top) * e.canvas.height / Math.max(1, r.height)
  ];
  e.lastViewportPointer = o;
  const n = o[0] - a.start[0], s = o[1] - a.start[1], i = t.shiftKey ? 0.1 : 1, l = On(a), m = a.axis ? at[a.axis] : null, c = e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode], d = F(c), p = c.camera_type === "orthographic" ? 10 / (Math.max(0.01, c.zoom || 1) * Math.max(1, e.canvas.height)) : Math.hypot(...A(c.position, c.target)) * 25e-4;
  let u = a.snapshots.map((b) => [...b.transform.position]);
  if (a.mode === "translate") {
    const b = l ?? (n - s) * p * i, x = m ? k(m, b) : C(k(d.right, n * p * i), k(d.up, -s * p * i));
    u = u.map((w) => C(w, x)), u = Pn(e, a, u, o, t.ctrlKey || t.metaKey, m, a.snapshots.map((w) => w.transform.position));
  }
  const f = a.mode === "rotate" ? l ?? (n - s) * 0.5 * i : 0, h = a.mode === "scale" ? Math.max(0.01, l ?? 1 + (n - s) * 0.01 * i) : 1, _ = m || at.z, y = t.ctrlKey || t.metaKey || e.state.spatial_snap_mode === "grid";
  a.snapshots.forEach((b, x) => {
    const w = b.object;
    if (a.mode === "translate" && (w.position = u[x]), a.mode === "rotate") {
      const D = y ? Fe(f, 15) : f, g = k(_, D);
      w.position = C(a.pivot, xe(A(b.transform.position, a.pivot), g)), w.rotation = C(b.transform.rotation, g);
    }
    if (a.mode === "scale") {
      const D = y ? Fe(h, 0.1) : h, g = m ? m.map((T) => T ? D : 1) : [D, D, D], M = A(b.transform.position, a.pivot);
      w.position = C(a.pivot, M.map((T, q) => T * g[q])), w.size = b.transform.size.map((T, q) => Math.max(0.01, T * g[q]));
    }
    e.commitObjectEdit(w);
  }), e.refreshInspector(), e.render();
  const v = `${a.axis ? ` ${a.axis.toUpperCase()}` : ""}${a.numeric ? ` = ${a.numeric}` : ""}`;
  return e.setStatus(`${a.mode.toUpperCase()}${v}`), !0;
}
function Mr(e) {
  return e.modalTransform ? (e.history?.commitTransaction?.(), e.modalTransform = null, e.editingKeyFrame = null, e.scheduleSerialize(), e.refreshKeys(), e.drawCurveEditor(), e.render(), e.setStatus("Transform confirmed"), !0) : !1;
}
function Cr(e) {
  if (!e.modalTransform) return !1;
  const t = e.history?.cancelTransaction?.(), a = e.modalTransform;
  if (!t) {
    for (const r of a.snapshots)
      r.object.position = [...r.transform.position], r.object.rotation = [...r.transform.rotation], r.object.size = [...r.transform.size];
    e.serialize?.(), e.refreshObjects?.(), e.refreshKeys?.(), e.refreshInspector?.(), e.drawCurveEditor?.(), e.render?.();
  }
  return e.modalTransform = null, e.editingKeyFrame = null, e.setStatus("Transform cancelled"), !0;
}
function zn(e, t) {
  const a = e.modalTransform;
  if (!a) return !1;
  const r = t.key.toLowerCase();
  return r === "escape" ? Cr(e) : r === "enter" || r === " " ? Mr(e) : at[r] ? (a.axis = a.axis === r ? null : r, Ae(e, a.lastEvent), !0) : /^[0-9]$/.test(r) || r === "." || r === "," || r === "-" && !a.numeric ? (a.numeric += r === "," ? "." : r, Ae(e, a.lastEvent), !0) : (r === "backspace" && (a.numeric = a.numeric.slice(0, -1), Ae(e, a.lastEvent)), !0);
}
function ue(e, t, a) {
  !t || t.historyCheckpointed || (e.checkpoint(a), t.historyCheckpointed = !0);
}
function Vt(e, t) {
  const a = e.activeCameraTrack?.();
  a && (a.target_offset = t, a.id === e.state.active_camera_id && (e.state.target_offset = t), e.setFrame(e.frame, !1, !1));
}
function Nn(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastViewportWheelAt) || t - e.lastViewportWheelAt > 300) && e.checkpoint("Dolly viewport"), e.lastViewportWheelAt = t;
}
const re = (e, t) => Math.round(e / t) * t, Rn = (e, t) => e.map((a) => re(a, t));
function Ln(e, t, a) {
  const r = t.keyframes?.length ? Ke(t, e.frame) : t, o = r.position || [0, 0, 0], n = e.webgl?.getObjectWorldBounds?.(t.id);
  let s, i;
  if (n)
    ({ min: s, max: i } = n);
  else {
    const p = (r.size || [1, 1, 1]).map((u) => Math.max(0.01, Math.abs(u)) / 2);
    s = p.map((u, f) => o[f] - u), i = p.map((u, f) => o[f] + u);
  }
  let l = 1 / 0, m = 1 / 0, c = -1 / 0, d = -1 / 0;
  for (const p of [s[0], i[0]]) for (const u of [s[1], i[1]]) for (const f of [s[2], i[2]]) {
    const h = R([p, u, f], a, e.canvas.width, e.canvas.height);
    h && (l = Math.min(l, h[0]), c = Math.max(c, h[0]), m = Math.min(m, h[1]), d = Math.max(d, h[1]));
  }
  return Number.isFinite(l) ? { minX: l, minY: m, maxX: c, maxY: d } : null;
}
function he(e, t, a, r = [], o = null) {
  const s = e.currentTransformEvent?.ctrlKey || e.currentTransformEvent?.metaKey ? "grid" : e.state.spatial_snap_mode, i = e.state.spatial_grid_size || 0.5;
  if (s === "grid")
    return o ? t.map((l, m) => Math.abs(o.axis[m]) > 1e-6 ? re(l, i) : o.base[m]) : Rn(t, i);
  if (s === "vertex" && a && !o) {
    const l = e.webgl?.pickSubElement?.(a[0], a[1], e.canvas.width, e.canvas.height, "vertex");
    if (l?.point && !r.includes(l.objectId)) return [...l.point];
  }
  return t;
}
function ui(e, t) {
  if (e.modalTransform) {
    t.preventDefault?.(), t.stopPropagation?.(), t.button === 0 ? Mr(e) : t.button === 2 && Cr(e);
    return;
  }
  if (t.target?.closest?.("button,input,select")) return;
  if (t.button === 2 && !Rt(e, t)) {
    t.preventDefault?.(), t.stopPropagation?.(), t.stopImmediatePropagation?.();
    return;
  }
  t.preventDefault?.(), t.stopPropagation?.(), e.closeMenus(), e.interactionElement.focus({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(t.pointerId), e.activePointerId = t.pointerId, e.canvas.classList.add("dragging");
  const a = e.interactionElement.getBoundingClientRect(), r = (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width), o = (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height), n = X(e), s = e.state.view_mode !== "camera", i = Rt(e, t), l = t.button === 0 && !i, m = l && !t.altKey && !t.shiftKey;
  if (m && e.webgl?.pickCurveHandle) {
    const _ = e.webgl.pickCurveHandle([r, o]);
    if (_) {
      const y = (e.state.cameras || []).find((x) => x.id === _.cameraId), v = (y?.keyframes || []).findIndex((x) => x.frame === _.frame), b = v >= 0 ? y.keyframes[v] : null;
      if (b) {
        e.curveHandleDrag = {
          cameraId: _.cameraId,
          frame: _.frame,
          side: _.side,
          anchor: [...b.camera.position],
          prevKey: y.keyframes[v - 1] || null,
          nextKey: y.keyframes[v + 1] || null,
          startX: r,
          startY: o,
          moved: !1,
          historyCheckpointed: !1
        }, e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), e.selectKeyframe?.(b);
        return;
      }
    }
  }
  if (m && e.webgl?.pickPathKey) {
    const _ = e.webgl.pickPathKey([r, o]);
    if (_) {
      const v = ((e.state.cameras || []).find((b) => b.id === _.cameraId)?.keyframes || []).find((b) => b.frame === _.frame);
      if (v) {
        e.pathDrag = { cameraId: _.cameraId, frame: _.frame, anchor: [...v.camera.position], startX: r, startY: o, moved: !1, historyCheckpointed: !1 }, e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), e.selectKeyframe?.(v);
        return;
      }
    }
  }
  const c = m ? wr(e, [r, o]) : null;
  if (c) {
    const [_, y] = c.segment, v = Math.max(1, Math.hypot(y[0] - _[0], y[1] - _[1])), b = {
      pointer: [r, o],
      axis: c.axis,
      axisIndex: c.index,
      screen: [(y[0] - _[0]) / v, (y[1] - _[1]) / v],
      worldLength: c.worldLength,
      screenLength: v,
      free: !!c.free
    };
    if (e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), c.entity.type === "camera_target") {
      e.checkpoint("Move camera target"), e.beginCameraEdit();
      const x = e.activeCameraTrack?.(), w = !!x?.target_object_id;
      e.gizmoDrag = {
        ...b,
        type: "camera_target",
        historyCheckpointed: !0,
        tracking: w,
        target: w ? [...x.target_offset || [0, 0, 0]] : [...c.entity.position || e.camera.target]
      };
      return;
    }
    if (c.entity.type === "camera") {
      e.checkpoint("Transform camera"), e.beginCameraEdit(), e.gizmoDrag = {
        ...b,
        type: "camera",
        historyCheckpointed: !0,
        position: [...c.entity.position || e.camera.position],
        target: [...e.camera.target]
      };
      return;
    }
    if (c.entity.type === "camera_path" && Mn(e, { baseDrag: b, viewCamera: n, entityPosition: c.entity.position })) return;
    if (c.entity.type === "object") {
      const x = c.entity.object;
      e.checkpoint("Transform object");
      const w = xr(e), D = (w.length ? w : [x]).map((M) => ({ object: M, transform: ce(M) }));
      for (const M of D) e.beginObjectEdit(M.object);
      const g = D.reduce((M, T) => C(M, T.transform.position), [0, 0, 0]).map((M) => M / D.length);
      e.gizmoDrag = {
        ...b,
        type: "object",
        historyCheckpointed: !0,
        object: x,
        group: D,
        groupPivot: g,
        // Same value as picked.entity.position -- the gizmo always sits at the
        // object's own origin (see activeGizmoEntity) -- `origin` is the name
        // that documents this is the drag base, in case a future entity type
        // ever needs its display position to differ from its transform again.
        position: [...c.entity.origin || c.entity.position],
        rotation: [...c.entity.rotation],
        size: [...c.entity.size],
        viewRight: F(n).right,
        viewUp: F(n).up,
        freeScale: n.camera_type === "orthographic" ? Le(n, e.canvas.height) : G(A(n.position, c.entity.position)) * (2 * Math.tan((n.fov || 35) * Math.PI / 360)) / e.canvas.height
      };
      return;
    }
  }
  const d = l ? An(e, [r, o]) : null;
  if (e.pointerHit = !!(c || d), d) {
    if (d.type === "camera_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(d.camera.id), e.setFrame(d.keyframe.frame), e.selectKeyframe(d.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(S(`${d.camera.name} · Keyframe @ F${d.keyframe.frame} selected`));
      return;
    }
    if (d.type === "object_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectId = d.object.id, e.editingKeyFrame = null, e.setFrame(d.keyframe.frame), e.selectKeyframe(d.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(S(`${d.object.name || d.object.type} · Keyframe @ F${d.keyframe.frame} selected`));
      return;
    }
    if (d.type === "camera_target") {
      if (e.finishCameraEdit(), e.selectedEntity = "camera_target", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(d.camera.id), d.camera.locked) {
        e.setStatus(S("{name} is locked").replace("{name}", d.camera.name)), e.refreshObjects(), e.refreshInspector(), e.render();
        return;
      }
      e.checkpoint("Move camera target"), e.beginCameraEdit();
      const { right: _, up: y } = F(n), v = [...e.camera.target], b = e.activeCameraTrack?.(), x = !!b?.target_object_id;
      e.targetFreeDrag = {
        pointer: [r, o],
        target: x ? [...b.target_offset || [0, 0, 0]] : v,
        tracking: x,
        right: _,
        up: y,
        // Identical to the old perspective expression, and finally correct for
        // an orthographic view: that branch scaled by distance and ignored
        // `zoom` entirely, so the target ran away from the cursor as soon as
        // the view was zoomed (5x zoom moved it more than five times too far).
        // The pointer deltas here are backing pixels, hence canvas.height.
        scale: Le(n, e.canvas.height),
        historyCheckpointed: !0
      }, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(S(`${d.camera.name} · Target aim selected`));
      return;
    }
    if (d.type === "camera") {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(d.camera.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(S(`${d.camera.name} selected`));
      return;
    }
    if (d.type === "camera_path") {
      xn(e, d.camera);
      return;
    }
    if (d.type === "object" && d.object) {
      if (e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectIds ||= /* @__PURE__ */ new Set(), t.shiftKey || t.ctrlKey || t.metaKey ? e.selectedObjectIds.has(d.object.id) ? e.selectedObjectIds.delete(d.object.id) : e.selectedObjectIds.add(d.object.id) : e.selectedObjectIds = /* @__PURE__ */ new Set([d.object.id]), e.selectedObjectId = e.selectedObjectIds.has(d.object.id) ? d.object.id : [...e.selectedObjectIds].at(-1) || null, e.selectedKeyFrame = d.object.keyframes?.find((_) => _.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.state.select_mode && e.state.select_mode !== "object") {
        const _ = e.webgl?.pickSubElement?.(r, o, e.canvas.width, e.canvas.height, e.state.select_mode);
        if (_) {
          e.subSelection = _;
          const y = _.point.map((b) => Math.round(b * 100) / 100).join(", "), v = _.mode === "vertex" ? "Vertex" : _.mode === "edge" ? "Edge" : "Face";
          e.setStatus(S(`${v} selected at [${y}] · Press F to focus`));
        } else
          e.subSelection = null;
      } else
        e.subSelection = null, e.setStatus(S(`${d.object.name || d.object.type} selected`));
      e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
      return;
    }
  }
  if (!d && l && !t.ctrlKey && !t.metaKey && ht(e) !== "simple") {
    e.boxSelection = {
      start: [r, o],
      current: [r, o],
      additive: t.shiftKey,
      initial: new Set(e.selectedObjectIds || [])
    }, e.drag = null, e.interactionElement.style && (e.interactionElement.style.cursor = "crosshair"), e.render();
    return;
  }
  const p = !!e.isNavigatingFly, u = _n(e, t, n);
  if (!p && !u) return;
  if (!s && e.state.camera_lock) {
    e.setStatus?.(S("Camera View is locked (click 🔒 to unlock)"));
    return;
  }
  const f = !p && u === "pan", h = !p && u === "dolly";
  s && !e.state.editor_views && (e.state.editor_views = ze()), e.drag = {
    x: t.clientX,
    y: t.clientY,
    shift: f,
    dolly: h,
    fly: p,
    camera: L(n),
    target: s ? e.state.editor_views[e.state.view_mode] || (e.state.editor_views[e.state.view_mode] = ze()[e.state.view_mode]) : e.camera,
    editorView: s,
    navigationOnly: i,
    historyCheckpointed: !1
  }, e.interactionElement.style && (e.interactionElement.style.cursor = h ? "ns-resize" : f ? "move" : "grabbing"), e.setStatus?.(S(p ? "Fly" : h ? "Dolly" : f ? "Pan" : "Orbit"));
}
function hi(e, t) {
  if (e.lastPointerEvent = t, e.modalTransform) {
    Ae(e, t);
    return;
  }
  if (e.pathDrag) {
    const s = e.interactionElement.getBoundingClientRect(), i = (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width), l = (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height);
    if (!e.pathDrag.moved && Math.hypot(i - e.pathDrag.startX, l - e.pathDrag.startY) < 3) return;
    e.pathDrag.moved = !0, ue(e, e.pathDrag, "Move path key");
    const c = ((e.state.cameras || []).find((d) => d.id === e.pathDrag.cameraId)?.keyframes || []).find((d) => d.frame === e.pathDrag.frame);
    c && (c.camera.position = Nt(
      [i, l],
      X(e),
      e.pathDrag.anchor,
      e.canvas.width,
      e.canvas.height
    ), c.interpolation = bn(c.interpolation), e.webgl && (e.webgl.pathKey = ""), e.setFrame(e.frame, !1, !1), e.render());
    return;
  }
  if (e.curveHandleDrag) {
    const s = e.interactionElement.getBoundingClientRect(), i = (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width), l = (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height);
    if (!e.curveHandleDrag.moved && Math.hypot(i - e.curveHandleDrag.startX, l - e.curveHandleDrag.startY) < 3) return;
    e.curveHandleDrag.moved = !0, ue(e, e.curveHandleDrag, "Edit curve handle");
    const c = ((e.state.cameras || []).find((d) => d.id === e.curveHandleDrag.cameraId)?.keyframes || []).find((d) => d.frame === e.curveHandleDrag.frame);
    if (c) {
      const d = Nt(
        [i, l],
        X(e),
        e.curveHandleDrag.anchor,
        e.canvas.width,
        e.canvas.height
      );
      e.dragCurveHandle?.(c, e.curveHandleDrag.side, d, {
        prevKey: e.curveHandleDrag.prevKey,
        nextKey: e.curveHandleDrag.nextKey
      }), e.webgl && (e.webgl.pathKey = ""), e.setFrame(e.frame, !1, !1), e.render();
    }
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
    qo(e, t);
    return;
  }
  if (e.targetFreeDrag) {
    ue(e, e.targetFreeDrag, "Move camera target");
    const s = e.interactionElement.getBoundingClientRect(), i = (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width), l = (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height), m = i - e.targetFreeDrag.pointer[0], c = l - e.targetFreeDrag.pointer[1], d = t.shiftKey ? 0.1 : 1, p = C(k(e.targetFreeDrag.right, m * e.targetFreeDrag.scale * d), k(e.targetFreeDrag.up, -c * e.targetFreeDrag.scale * d)), u = he(e, C(e.targetFreeDrag.target, p), [i, l]);
    e.targetFreeDrag.tracking ? Vt(e, u) : e.camera.target = u, e.commitCameraEdit(), e.refreshInspector(), e.render();
    return;
  }
  if (e.gizmoDrag) {
    ue(e, e.gizmoDrag, e.gizmoDrag.type === "object" ? "Transform object" : "Transform camera");
    const s = e.interactionElement.getBoundingClientRect(), i = [
      (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width),
      (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height)
    ], l = t.shiftKey ? 0.1 : 1, m = ((i[0] - e.gizmoDrag.pointer[0]) * e.gizmoDrag.screen[0] + (i[1] - e.gizmoDrag.pointer[1]) * e.gizmoDrag.screen[1]) * l, c = t.ctrlKey || t.metaKey || e.state.spatial_snap_mode === "grid";
    if (e.gizmoDrag.type === "camera_target") {
      const u = C(e.gizmoDrag.target, k(e.gizmoDrag.axis, m * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength)), f = he(e, u, i, [], { base: e.gizmoDrag.target, axis: e.gizmoDrag.axis });
      e.gizmoDrag.tracking ? Vt(e, f) : e.camera.target = f, e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.gizmoDrag.type === "camera") {
      if (e.state.gizmo_mode === "translate") {
        const u = C(e.gizmoDrag.position, k(e.gizmoDrag.axis, m * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
        e.camera.position = he(e, u, i, [], { base: e.gizmoDrag.position, axis: e.gizmoDrag.axis });
      } else {
        const u = c ? re(m * 0.015, Math.PI / 12) : m * 0.015, f = A(e.gizmoDrag.target, e.gizmoDrag.position), h = xe(f, k(e.gizmoDrag.axis, u * (180 / Math.PI)));
        e.camera.target = C(e.gizmoDrag.position, h);
      }
      e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.gizmoDrag.type === "camera_path") return void Cn(e, { pointer: i, deltaPixels: m, precision: l, snapping: c });
    if (e.state.gizmo_mode === "translate")
      if (e.gizmoDrag.free) {
        const u = (i[0] - e.gizmoDrag.pointer[0]) * l, f = (i[1] - e.gizmoDrag.pointer[1]) * l, h = C(
          e.gizmoDrag.position,
          C(k(e.gizmoDrag.viewRight, u * e.gizmoDrag.freeScale), k(e.gizmoDrag.viewUp, -f * e.gizmoDrag.freeScale))
        );
        e.gizmoDrag.object.position = he(e, h, i, [e.gizmoDrag.object.id]);
      } else {
        const u = C(e.gizmoDrag.position, k(e.gizmoDrag.axis, m * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
        e.gizmoDrag.object.position = he(e, u, i, [e.gizmoDrag.object.id], { base: e.gizmoDrag.position, axis: e.gizmoDrag.axis });
      }
    else if (e.state.gizmo_mode === "scale")
      if (e.gizmoDrag.free) {
        const u = (i[0] - e.gizmoDrag.pointer[0]) * l, f = (i[1] - e.gizmoDrag.pointer[1]) * l, h = (u - f) * e.gizmoDrag.freeScale, _ = e.gizmoDrag.size.map((y) => {
          const v = y + h;
          return Math.max(0.01, c ? re(v, 0.1) : v);
        });
        e.gizmoDrag.object.size = _;
      } else {
        const u = [...e.gizmoDrag.size], f = u[e.gizmoDrag.axisIndex] + m * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength;
        u[e.gizmoDrag.axisIndex] = Math.max(0.01, c ? re(f, 0.1) : f), e.gizmoDrag.object.size = u;
      }
    else {
      const u = [...e.gizmoDrag.rotation], f = u[e.gizmoDrag.axisIndex] + m * 0.75;
      u[e.gizmoDrag.axisIndex] = c ? re(f, 15) : f, e.gizmoDrag.object.rotation = u;
    }
    const d = e.gizmoDrag.group || [], p = d.find((u) => u.object === e.gizmoDrag.object)?.transform;
    if (d.length > 1 && p)
      if (e.state.gizmo_mode === "translate") {
        const u = A(e.gizmoDrag.object.position, p.position);
        for (const f of d) f.object.position = C(f.transform.position, u);
      } else if (e.state.gizmo_mode === "rotate") {
        const u = A(e.gizmoDrag.object.rotation, p.rotation);
        for (const f of d)
          f.object.position = C(e.gizmoDrag.groupPivot, xe(A(f.transform.position, e.gizmoDrag.groupPivot), u)), f.object.rotation = C(f.transform.rotation, u);
      } else {
        const u = e.gizmoDrag.object.size.map((f, h) => f / Math.max(0.01, p.size[h]));
        for (const f of d) {
          const h = A(f.transform.position, e.gizmoDrag.groupPivot);
          f.object.position = C(e.gizmoDrag.groupPivot, h.map((_, y) => _ * u[y])), f.object.size = f.transform.size.map((_, y) => Math.max(0.01, _ * u[y]));
        }
      }
    for (const u of d.length ? d : [{ object: e.gizmoDrag.object }]) e.commitObjectEdit(u.object);
    e.refreshInspector(), e.render();
    return;
  }
  if (!e.drag) {
    const s = e.interactionElement.getBoundingClientRect(), i = wr(e, [
      (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width),
      (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height)
    ]), l = i ? i.free ? "free" : i.index : null;
    l !== e.hoveredGizmoHandle && (e.hoveredGizmoHandle = l, e.interactionElement.style && (e.interactionElement.style.cursor = i ? "grab" : "default"), e.render());
    return;
  }
  const a = t.clientX - e.drag.x, r = t.clientY - e.drag.y;
  if (!e.drag.historyCheckpointed && Math.hypot(a, r) < 3) return;
  const o = !e.drag.historyCheckpointed && !e.drag.editorView;
  ue(e, e.drag, e.drag.editorView ? "Navigate viewport" : "Move camera"), o && e.beginCameraEdit();
  const n = e.drag.camera;
  if (e.drag.dolly) {
    const s = Math.exp(r * 5e-3 * (e.dollySensitivity ?? 1)), i = A(n.position, n.target);
    e.drag.target.position = C(n.target, k(i, s)), e.drag.target.camera_type === "orthographic" && (e.drag.target.zoom = Math.max(0.01, (n.zoom || 1) / s));
  } else if (e.drag.fly) {
    const s = A(n.target, n.position), i = G(s);
    let l = Math.atan2(s[0], s[2]), m = Math.asin(j(s[1] / i, -0.999, 0.999));
    l -= a * 8e-3, m = j(m - r * 8e-3, -1.45, 1.45), e.drag.target.target = [
      n.position[0] + i * Math.sin(l) * Math.cos(m),
      n.position[1] + i * Math.sin(m),
      n.position[2] + i * Math.cos(l) * Math.cos(m)
    ];
  } else if (e.drag.shift) {
    const { right: s, up: i } = F(n), l = Le(n, e.interactionElement.getBoundingClientRect().height) * (e.panSensitivity ?? 1), m = C(k(s, -a * l), k(i, r * l));
    e.drag.target.position = C(n.position, m), e.drag.target.target = C(n.target, m);
  } else {
    const s = A(n.position, n.target), i = G(s);
    let l = Math.atan2(s[0], s[2]), m = Math.asin(j(s[1] / i, -0.999, 0.999));
    l -= a * 8e-3, m = j(m + r * 8e-3, -1.45, 1.45), e.drag.target.position = [
      n.target[0] + i * Math.sin(l) * Math.cos(m),
      n.target[1] + i * Math.sin(m),
      n.target[2] + i * Math.cos(l) * Math.cos(m)
    ];
  }
  e.drag.editorView ? (e.scheduleSerialize(), e.render()) : e.commitCameraEdit();
}
function kr(e) {
  if (!e.drag && !e.gizmoDrag && !e.targetFreeDrag && !e.boxSelection && !e.pathDrag && !e.keyDrag && !e.curveDrag && !e.timelineDrag && !e.timelinePanDrag && !e.boxSelect && !e.curvePanDrag && !e.curveScrub && !e.curveBoxSelect) return !1;
  const t = [e.drag, e.gizmoDrag, e.targetFreeDrag, e.pathDrag, e.keyDrag, e.curveDrag].some((a) => a?.historyCheckpointed);
  return e.keyDrag?.badge?.remove?.(), e.boxSelect?.overlay?.remove?.(), e.drag?.camera && e.drag?.target && (Object.assign(e.drag.target, e.drag.camera), e.drag.editorView && e.scheduleSerialize()), e.drag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.boxSelection = null, e.pathDrag = null, e.keyDrag = null, e.curveDrag = null, e.timelineDrag = null, e.timelinePanDrag = null, e.boxSelect = null, e.curvePanDrag = null, e.curveScrub = null, e.curveBoxSelect = null, _e(e), t && e.undo(), e.finishCameraEdit(), e.refreshInspector(), e.render(), e.setStatus(S("Interaction cancelled")), !0;
}
function gi(e, t) {
  if (t?.type === "pointercancel" || t?.type === "lostpointercapture") {
    t.pointerId === e.activePointerId && kr(e);
    return;
  }
  if (e.pathDrag) {
    const s = e.pathDrag.moved;
    e.pathDrag = null, _e(e), s && (e.scheduleSerialize(), e.refreshKeys(), e.setStatus(S("Path key moved")));
    return;
  }
  if (e.curveHandleDrag) {
    const s = e.curveHandleDrag.moved;
    e.curveHandleDrag = null, _e(e), s && (e.webgl && (e.webgl.pathKey = ""), e.scheduleSerialize(), e.refreshKeys(), e.setStatus(S("Curve handle updated")));
    return;
  }
  if (e.boxSelection) {
    const s = e.boxSelection, i = X(e), l = Math.min(s.start[0], s.current[0]), m = Math.max(s.start[0], s.current[0]), c = Math.min(s.start[1], s.current[1]), d = Math.max(s.start[1], s.current[1]), p = s.additive ? new Set(s.initial) : /* @__PURE__ */ new Set();
    for (const u of e.state.objects) {
      if (u.enabled === !1) continue;
      const f = Ln(e, u, i);
      f && f.maxX >= l && f.minX <= m && f.maxY >= c && f.minY <= d && p.add(u.id);
    }
    e.selectedObjectIds = p, e.selectedObjectId = [...p].at(-1) || null, e.selectedEntity = p.size ? "object" : "camera", e.boxSelection = null, _e(e), e.refreshObjects(), e.refreshInspector(), e.render(), e.setStatus(S("{count} object(s) selected").replace("{count}", String(p.size)));
    return;
  }
  const a = e.keyDrag, r = !!(e.drag && !e.drag.editorView || e.targetFreeDrag), o = !!e.gizmoDrag;
  e.gizmoDrag?.type === "camera_path" && (e.serialize?.(), e.refreshKeys?.(), e.setStatus(S("Camera path transformed"))), !e.pointerHit && !e.gizmoDrag && !e.targetFreeDrag && e.drag && !e.drag.navigationOnly && t && Math.hypot(t.clientX - e.drag.x, t.clientY - e.drag.y) < 5 && (t.button === 0 || t.button === void 0) && (e.selectedEntity === "object" || e.selectedObjectId !== null || e.selectedEntity === "camera_target" || e.selectedEntity === "camera_path") && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = null, e.subSelection = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(S("Deselected"))), _e(e), e.drag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.keyDrag = null, e.pointerHit = !1, e.canvas.classList.remove("dragging"), e.interactionElement.style && (e.interactionElement.style.cursor = "default"), a && (a.badge?.remove(), e.editingKeyFrame = null, e.updateKeyVisualState(), e.root.focus({ preventScroll: !0 })), r && e.finishCameraEdit(), o && (e.editingKeyFrame = null, e.updateKeyVisualState(), e.drawCurveEditor());
}
function yi(e, t) {
  if (t.target.closest?.(".viewport-inspector, .scene-tree, .menu-panel, .context-menu, .viewport-quick-bar"))
    return;
  t.preventDefault(), t.stopPropagation(), e.closeMenus();
  const a = Sn(t, e.interactionElement.getBoundingClientRect().height);
  if (!a) return;
  if (e.isNavigatingFly) {
    e.cameraSpeed = j(e.cameraSpeed * Math.exp(-a * 1e-3), 0.05, 20), e.setStatus(S(`Fly speed: ${e.cameraSpeed.toFixed(2)}x`));
    return;
  }
  Nn(e);
  const r = e.state.view_mode !== "camera";
  if (!r && e.state.camera_lock) {
    e.setStatus?.(S("Camera View is locked (click 🔒 to unlock)"));
    return;
  }
  const o = X(e);
  r || e.beginCameraEdit();
  const n = j(a * 1e-3, -0.4, 0.4), s = A(o.position, o.target);
  o.position = C(o.target, k(s, Math.exp(n))), o.camera_type === "orthographic" && (o.zoom = Math.max(0.01, (o.zoom || 1) * Math.exp(-n))), r ? (e.scheduleSerialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit());
}
const Fn = (e) => {
  const t = new Set((e.motion_layers || []).map((r) => r.id));
  let a = t.size + 1;
  for (; t.has(`motion_${a}`); ) a += 1;
  return `motion_${a}`;
};
function Ve(e, { sourceKind: t = "manual_2d", label: a, keys: r, source: o = {} }) {
  if (!Yt.includes(t)) throw new Error(`Unsupported motion source: ${t}`);
  const n = Fn(e), s = { id: n, label: a || `Motion ${n.split("_").at(-1)}`, enabled: !0, semantic: "screen_point", source_kind: t, keys: r.map((i) => ({ visible: !0, interpolation: "linear", ...i })), source: { ...o } };
  return e.motion_layers ||= [], e.motion_layers.push(s), e.selected_motion_layer_id = n, s;
}
function Xe(e) {
  return (e.motion_layers || []).find((t) => t.id === e.selected_motion_layer_id) || null;
}
function gt(e, t) {
  return e.motion_tool = Xt.includes(t) ? t : "select", e.motion_tool;
}
function Vn(e, t) {
  if (Zt.includes(t))
    for (const a of e.keys) a.interpolation = t;
}
function Bn(e, t, a) {
  if (!e?.keys?.length || a < t) return;
  if (e.keys.length === 1) {
    e.keys[0].time_seconds = t;
    return;
  }
  const r = (a - t) / (e.keys.length - 1);
  e.keys.forEach((o, n) => {
    o.time_seconds = t + r * n;
  });
}
function Dr(e, t) {
  e.motion_layers = (e.motion_layers || []).filter((a) => a.id !== t), e.selected_motion_layer_id === t && (e.selected_motion_layer_id = e.motion_layers[0]?.id || null);
}
function Kn(e, t) {
  const a = t.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (e.clientX - a.left) / Math.max(1, a.width))),
    y: Math.max(0, Math.min(1, (e.clientY - a.top) / Math.max(1, a.height)))
  };
}
function qn(e, t, a, r, o) {
  const n = le(e, a, e.objects);
  let s = t?.point;
  if (t?.object_id) {
    const c = e.objects.find((u) => u.id === t.object_id);
    if (!c) return null;
    const d = Oo(e.objects, c), p = Array.isArray(t.local_point) ? t.local_point : [0, 0, 0];
    s = [d.position[0] + p[0] * d.size[0], d.position[1] + p[1] * d.size[1], d.position[2] + p[2] * d.size[2]];
  }
  if (!Array.isArray(s)) return null;
  const i = R(s, n, r, o);
  if (!i) return null;
  const l = i[0] / r, m = i[1] / o;
  return { x: l, y: m, visible: l >= 0 && l <= 1 && m >= 0 && m <= 1 };
}
function Gn(e, t = 6e-3) {
  if (e.length < 3) return e;
  const a = [e[0]];
  for (const r of e.slice(1, -1)) {
    const o = a.at(-1);
    Math.hypot(r.x - o.x, r.y - o.y) >= t && a.push(r);
  }
  return a.push(e.at(-1)), a;
}
function jr(e, t, a = 0.035) {
  let r = null, o = a;
  for (const n of e || []) for (const s of n.keys || []) {
    const i = Math.hypot(s.x - t.x, s.y - t.y);
    i <= o && (r = n, o = i);
  }
  return r;
}
function Hn(e, t, a, r) {
  const o = Gn(t);
  if (o.length < 2) return null;
  const n = Math.max(0, r - a);
  return Ve(e, {
    sourceKind: "manual_2d",
    label: `Track ${(e.motion_layers || []).length + 1}`,
    keys: o.map((s, i) => ({ ...s, time_seconds: a + n * i / (o.length - 1) }))
  });
}
function Ye(e, t) {
  return Kn(t, e.interactionElement);
}
function Wn(e, t) {
  const a = jr(e.motion_layers, t);
  return a ? (Dr(e, a.id), a) : null;
}
const Ze = (e) => {
  e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.();
}, Bt = (e) => {
  const t = e.state.playback_range || [e.frame, e.state.duration_frames - 1];
  return [t[0] / e.state.fps, t[1] / e.state.fps];
}, ae = (e, t) => {
  e.serialize(), e.render(), e.setStatus(t);
};
function Be(e) {
  for (const t of e.root.querySelectorAll("[data-motion-tool]")) {
    const a = t.dataset.motionTool === e.state.motion_tool;
    t.classList.toggle("active", a), t.setAttribute("aria-pressed", String(a));
  }
  e.interactionElement.dataset.motionTool = e.state.motion_tool;
}
function $n(e, t) {
  const a = e.state.objects.find((m) => m.id === e.selectedObjectId), r = e.motionCreationKind, n = (r === "object" || r !== "world" && !!a) && a ? "object_point" : "world_point", s = n === "object_point" ? { object_id: a.id, local_point: [0, 0, 0] } : { point: e.webgl?.intersectScenePoint?.(t.x * e.canvas.width, t.y * e.canvas.height, e.canvas.width, e.canvas.height) || [...e.camera.target] }, i = qn(e.state, s, e.frame, e.canvas.width, e.canvas.height) || t, l = n === "object_point" ? `${a.name || a.id} Track` : "World Anchor";
  return Ve(e.state, { sourceKind: n, label: l, keys: [{ time_seconds: e.frame / e.state.fps, x: i.x, y: i.y, visible: i.visible !== !1 }], source: s });
}
function bi(e, t) {
  for (const o of e.root.querySelectorAll("[data-motion-tool]"))
    o.addEventListener("click", () => {
      e.motionCreationKind = "", gt(e.state, o.dataset.motionTool), Be(e), e.render();
    }, { signal: t });
  for (const o of e.root.querySelectorAll("[data-motion-preset]"))
    o.addEventListener("click", () => {
      e.checkpoint("Add camera field"), Ve(e.state, { sourceKind: "camera_field", label: `${o.dataset.motionPreset} Field`, keys: [{ time_seconds: 0, x: 0.5, y: 0.5 }], source: { preset: o.dataset.motionPreset, point: [...e.camera.target] } }), ae(e, `Camera field: ${o.dataset.motionPreset}`);
    }, { signal: t });
  e.root.querySelector('[data-role="motion-interpolation"]')?.addEventListener("change", (o) => {
    const n = Xe(e.state);
    n && (e.checkpoint("Set motion interpolation"), Vn(n, o.target.value), ae(e, `Motion interpolation: ${o.target.value}`));
  }, { signal: t }), e.root.querySelector('[data-role="motion-key-visible"]')?.addEventListener("change", (o) => {
    const n = Xe(e.state);
    if (!n?.keys?.length) return;
    const s = e.frame / e.state.fps, i = n.keys.reduce((l, m) => Math.abs(m.time_seconds - s) < Math.abs(l.time_seconds - s) ? m : l);
    e.checkpoint("Set motion visibility"), i.visible = o.target.checked, ae(e, `Motion key ${i.visible ? "visible" : "hidden"}`);
  }, { signal: t });
  for (const o of e.root.querySelectorAll("[data-motion-layer-action]"))
    o.addEventListener("click", () => {
      const n = Xe(e.state);
      if (!n) return;
      const s = o.dataset.motionLayerAction;
      if (e.checkpoint(s === "delete" ? "Delete motion layer" : s === "retime" ? "Retime motion layer" : "Toggle motion layer"), s === "delete") Dr(e.state, n.id);
      else if (s === "retime") {
        const [i, l] = Bt(e);
        Bn(n, i, l);
      } else n.enabled = !n.enabled;
      ae(e, s === "delete" ? "Motion layer deleted" : s === "retime" ? "Motion layer retimed" : `Motion layer ${n.enabled ? "enabled" : "disabled"}`);
    }, { signal: t });
  const a = e.interactionElement;
  a.addEventListener("pointerdown", (o) => {
    const n = e.state.motion_tool;
    if (n === "select" || o.button !== 0) return;
    Ze(o), a.setPointerCapture?.(o.pointerId);
    const s = Ye(e, o);
    if (n === "track") {
      e.checkpoint("Draw motion track"), e.motionTrackDraft = { pointerId: o.pointerId, points: [s] };
      return;
    }
    e.checkpoint(n === "erase" ? "Erase motion track" : "Add motion anchor"), n === "anchor" ? Ve(e.state, { sourceKind: "static_anchor", label: `Anchor ${(e.state.motion_layers || []).length + 1}`, keys: [{ time_seconds: e.frame / e.state.fps, ...s, interpolation: "hold" }] }) : n === "project" ? $n(e, s) : n === "erase" && Wn(e.state, s), ae(e, `Motion tool: ${n}`);
  }, { capture: !0, signal: t }), a.addEventListener("pointermove", (o) => {
    e.motionTrackDraft?.pointerId === o.pointerId && (Ze(o), e.motionTrackDraft.points.push(Ye(e, o)), e.render());
  }, { capture: !0, signal: t });
  const r = (o) => {
    const n = e.motionTrackDraft;
    if (n?.pointerId !== o.pointerId) return;
    Ze(o), e.motionTrackDraft = null;
    const [s, i] = Bt(e), l = Hn(e.state, n.points, s, i);
    ae(e, l ? `Motion track: ${l.label}` : "Motion track needs a longer stroke");
  };
  a.addEventListener("pointerup", r, { capture: !0, signal: t }), a.addEventListener("pointercancel", r, { capture: !0, signal: t }), a.addEventListener("click", (o) => {
    if (e.state.motion_tool !== "select" || o.button !== 0) return;
    const n = jr(e.state.motion_layers, Ye(e, o));
    n && (e.state.selected_motion_layer_id = n.id, e.render());
  }, { signal: t }), Be(e);
}
const Un = {
  draw: { tool: "track", label: "Draw Path", hint: "Draw a trajectory in the Camera View. Release to finish, Esc to cancel." },
  object: { tool: "project", label: "Track Object", hint: "Click the selected object in the viewport to follow it." },
  world: { tool: "project", label: "World Point", hint: "Click a surface or point in the viewport to pin a fixed 3D point." },
  anchor: { tool: "anchor", label: "Screen Anchor", hint: "Click to place a control point at a fixed screen position." }
};
function Xn(e, t) {
  const a = Un[t];
  if (a) {
    if (t === "object" && !(e.state.objects || []).some((r) => r.id === e.selectedObjectId)) {
      e.setStatus("Select a scene object first, then choose Track Object.");
      return;
    }
    e.checkpoint?.(`Motion: ${a.label}`), gt(e.state, a.tool), e.motionCreatingLabel = a.label, e.motionCreationKind = t, Be(e), e.render(), e.setStatus(a.hint);
  }
}
function Tr(e) {
  return (e.state.motion_tool || "select") === "select" && !e.motionTrackDraft ? !1 : (gt(e.state, "select"), e.motionTrackDraft = null, e.motionCreatingLabel = "", e.motionCreationKind = "", Be(e), e.render(), e.setStatus("Motion creation cancelled."), !0);
}
function _i(e, t) {
  for (const a of e.root.querySelectorAll("[data-motion-create]"))
    a.addEventListener("click", () => Xn(e, a.dataset.motionCreate), { signal: t });
  e.root.querySelector("[data-motion-create-cancel]")?.addEventListener("click", () => Tr(e), { signal: t });
}
const Yn = Object.freeze({
  x: ["right", "left"],
  y: ["top", "bottom"],
  z: ["front", "back"]
}), Zn = Object.freeze({
  front: "back",
  back: "front",
  right: "left",
  left: "right",
  top: "bottom",
  bottom: "top"
});
function vi(e, t) {
  const a = Yn[e];
  return a ? t === a[0] ? a[1] : a[0] : null;
}
function Qn(e) {
  return Zn[e] || null;
}
function Kt(e, t, a) {
  const r = e.viewportCamera(), o = e.state.view_mode !== "camera", n = A(r.position, r.target), s = G(n);
  if (!(s > 1e-4)) return;
  const i = Math.atan2(n[0], n[2]) + t, l = j(Math.asin(j(n[1] / s, -0.999, 0.999)) + a, -1.45, 1.45);
  o || e.beginCameraEdit(), r.position = C(r.target, k([
    Math.sin(i) * Math.cos(l),
    Math.sin(l),
    Math.cos(i) * Math.cos(l)
  ], s)), o ? (e.scheduleSerialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit());
}
const ge = { t: "translate", r: "rotate", s: "scale" }, Jn = [
  ["viewport", ".viewport-wrap"],
  ["sequence", '[data-role="graph-sequence"]'],
  ["graph", ".oc-graph"],
  ["timeline", ".oc-timeline"],
  // The outliner / scene panel: without its own zone a Delete pressed with a
  // scene row focused fell through to whatever zone was last touched (usually
  // the timeline, which only deletes keyframes) so objects could not be
  // removed from the tree at all.
  ["scene", '[data-tab-panel="scene"]']
], es = 'button,summary,a[href],[role="button"],[role="menuitem"],[role="tab"],[role="option"],[role="checkbox"],[role="switch"]';
function ts(e) {
  return e instanceof HTMLElement || e instanceof SVGElement ? !!e.closest?.(es) : !1;
}
function as(e) {
  const t = typeof Element < "u" ? Element : typeof HTMLElement < "u" ? HTMLElement : null;
  return t && !(e instanceof t) || !e || typeof e != "object" ? !1 : ["INPUT", "SELECT", "TEXTAREA"].includes(e.tagName) || !!e.isContentEditable || !!e.closest?.('[contenteditable="true"],span.property_value');
}
function rs(e) {
  const t = e instanceof HTMLElement ? e : null;
  for (const [a, r] of Jn)
    if (t?.closest?.(r)) return a;
  return null;
}
function os(e, t) {
  return rs(e) || t?.lastKeyZone || "viewport";
}
let qt = !1;
function ns() {
  qt || typeof window > "u" || (qt = !0, window.addEventListener("keydown", (e) => {
    if (!cn()) return;
    const t = e.composedPath?.()[0] || e.target, a = mn(t);
    !a || a.disposed || ss(a, e) && (e.preventDefault(), e.stopImmediatePropagation?.(), e.stopPropagation());
  }, { capture: !0 }));
}
function ss(e, t) {
  if (!pn()) return !1;
  const a = t.composedPath?.()[0] || t.target;
  if (as(a) || (t.code === "Space" || t.key === "Enter") && ts(a)) return !1;
  if (e.contextMenu.onKey(t)) return !0;
  if (e.modalTransform)
    return zn(e, t), !0;
  if (ls(e, t)) return !0;
  const r = t.code;
  if ((t.ctrlKey || t.metaKey) && !r.startsWith("Numpad") || t.altKey) return !1;
  const o = os(a, e);
  switch (o) {
    case "viewport":
      return cs(e, t);
    case "sequence":
      return ds(e, t);
    case "timeline":
    case "graph":
      return ms(e, t, o);
    case "scene":
      return is(e, t);
    default:
      return !1;
  }
}
function is(e, t) {
  return t.key === "Delete" || t.key === "Backspace" ? (t.repeat || (e.selectedObjectIds?.size > 1 ? e.deleteSelectedObjects?.() : e.selectedObjectId && e.deleteObject(e.selectedObjectId)), !0) : t.key === "F2" ? (!t.repeat && e.selectedObjectId && e.renameObject(e.selectedObjectId), !0) : t.key.toLowerCase() === "h" && !t.ctrlKey && !t.metaKey && !t.altKey ? (!t.repeat && e.selectedObjectId && e.toggleObject(e.selectedObjectId), !0) : t.key === "Escape" ? (e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.refreshObjects(), e.refreshInspector(), e.render(), !0) : !1;
}
function ls(e, t) {
  const a = t.key.toLowerCase(), r = t.ctrlKey || t.metaKey;
  return a === "escape" ? e.cameraPathDraw?.drawing && e.cancelCameraPathDraw?.() || kr(e) || e.cancelCameraPathDraw?.() || Tr(e) ? !0 : e.isNavigatingFly ? (e.isNavigatingFly = !1, e.setStatus("Fly Mode OFF"), !0) : !1 : r && a === "z" ? (t.repeat || (t.shiftKey ? e.redo() : e.undo()), !0) : r && a === "y" ? (t.repeat || e.redo(), !0) : r && a === "c" ? e.selectedKeyframe() ? (e.copyKeyframe(), !0) : !1 : r && a === "v" ? e.copiedKeyframe ? (e.pasteKeyframe(), !0) : !1 : r && a === "d" ? (t.repeat || (e.selectedEntity === "object" && e.selectedObjectId ? e.duplicateObject(e.selectedObjectId) : e.selectedEntity === "camera" && e.duplicateCamera(e.state.active_camera_id)), !0) : t.altKey && a === "h" ? (t.repeat || e.showAllObjects(), !0) : t.code === "Space" ? (t.repeat || e.togglePlay(), !0) : !1;
}
function cs(e, t) {
  const a = t.key.toLowerCase(), r = t.code;
  if (e.selectedEntity === "camera_path" && !e.isNavigatingFly) {
    if (ge[a])
      return t.repeat || (e.setTransformMode(ge[a]), e.setStatus(`Path ${ge[a]} — drag the gizmo, or arrow keys to nudge`)), !0;
    const i = e.state.spatial_grid_size || 0.5, l = { ArrowLeft: [-i, 0, 0], ArrowRight: [i, 0, 0], ArrowUp: [0, 0, -i], ArrowDown: [0, 0, i], PageUp: [0, i, 0], PageDown: [0, -i, 0] }[t.key];
    if (l)
      return t.repeat || e.transformCameraPath({ mode: "translate", delta: l }), !0;
  }
  if (t.shiftKey && a === "g" && !e.isNavigatingFly)
    return e.selectHierarchy(), !0;
  if (ge[a] && !e.isNavigatingFly)
    return t.repeat || In(e, ge[a]), !0;
  if (a === "tab") {
    const i = e.state.select_mode === "object" ? "vertex" : "object";
    return e.setSelectMode(i), e.setStatus(i === "object" ? "Object Mode" : "Component Mode: Vertex"), !0;
  }
  if (a === "f" || r === "NumpadDecimal")
    return t.repeat || e.frameTarget(), !0;
  if ((a === "a" || t.key === "Home") && !e.isNavigatingFly && !t.shiftKey)
    return t.repeat || e.frameTarget({ all: !0 }), !0;
  if (a === "n")
    return t.repeat || e.toggleInspector(), !0;
  if (t.shiftKey && (r === "Backquote" || a === "~") || a === "c" && !t.shiftKey && !t.altKey && !t.ctrlKey)
    return e.isNavigatingFly = !e.isNavigatingFly, e.setStatus(e.isNavigatingFly ? "Fly Mode ON · WASD/QE to fly, Drag to look, Esc/C to exit" : "Fly Mode OFF"), !0;
  const o = { Digit1: "vertex", Digit2: "edge", Digit3: "face", Digit4: "object" };
  if (o[r] || !r.startsWith("Numpad") && ["1", "2", "3", "4"].includes(a))
    return e.setSelectMode(o[r] || { 1: "vertex", 2: "edge", 3: "face", 4: "object" }[a]), !0;
  if (r === "Numpad0")
    return e.setViewMode("camera"), !0;
  if (r === "Numpad1")
    return e.setViewMode(t.ctrlKey || t.metaKey ? "back" : "front"), !0;
  if (r === "Numpad3")
    return e.setViewMode(t.ctrlKey || t.metaKey ? "left" : "right"), !0;
  if (r === "Numpad7")
    return e.setViewMode(t.ctrlKey || t.metaKey ? "bottom" : "top"), !0;
  if (r === "Numpad9") {
    const i = Qn(e.state.view_mode);
    return i ? e.setViewMode(i) : Kt(e, Math.PI, 0), !0;
  }
  const n = Math.PI / 12, s = { Numpad4: [n, 0], Numpad6: [-n, 0], Numpad8: [0, n], Numpad2: [0, -n] };
  if (s[r])
    return Kt(e, s[r][0], s[r][1]), !0;
  if (r === "Numpad5")
    return e.setViewMode(e.state.view_mode === "camera" ? "perspective" : "camera"), !0;
  if (a === "h" && !t.ctrlKey && !t.metaKey && !t.altKey)
    return !t.repeat && e.selectedEntity === "object" && e.selectedObjectId && e.toggleObject(e.selectedObjectId), !0;
  if (t.key === "Delete" || t.key === "Backspace")
    return t.repeat || (e.selectedEntity === "object" && e.selectedObjectIds?.size > 1 ? e.deleteSelectedObjects() : e.selectedEntity === "object" && e.selectedObjectId ? e.deleteObject(e.selectedObjectId) : e.selectedEntity === "camera" && e.deleteCamera(e.state.active_camera_id)), !0;
  if (["w", "a", "s", "d", "q", "e"].includes(a) && e.isNavigatingFly) {
    const i = e.viewportCamera(), l = e.state.view_mode !== "camera", { right: m, up: c, forward: d } = F(i), p = (t.shiftKey ? 0.6 : 0.18) * e.cameraSpeed, u = { w: k(d, p), s: k(d, -p), d: k(m, p), a: k(m, -p), e: k(c, p), q: k(c, -p) }[a];
    return l || e.beginCameraEdit(), i.position = C(i.position, u), i.target = C(i.target, u), l ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit()), !0;
  }
  return !1;
}
function ms(e, t, a) {
  const r = t.key.toLowerCase(), o = t.code;
  if (r === "f")
    return t.repeat || (a === "graph" ? e.resetCurveZoom() : e.resetTimelineZoom?.()), !0;
  if (r === "i" || r === "k")
    return t.repeat || e.insertKeyframe(), !0;
  if (t.key === "Delete" || t.key === "Backspace")
    return t.repeat || e.deleteSelectedKeyframes(), !0;
  if (t.key === "ArrowUp" || t.shiftKey && t.key === "ArrowRight" || r === "." && o !== "NumpadDecimal")
    return e.goToAdjacentKey(1), !0;
  if (t.key === "ArrowDown" || t.shiftKey && t.key === "ArrowLeft" || r === ",")
    return e.goToAdjacentKey(-1), !0;
  if (t.key === "ArrowLeft")
    return e.nudgeSelectedKeyframes(-1) || e.setFrame(e.frame - 1), !0;
  if (t.key === "ArrowRight")
    return e.nudgeSelectedKeyframes(1) || e.setFrame(e.frame + 1), !0;
  if (t.key === "Home")
    return e.selectKeyframe(e.timelineKeyframes()[0]), !0;
  if (t.key === "End") {
    const n = e.timelineKeyframes();
    return e.selectKeyframe(n[n.length - 1]), !0;
  }
  return !1;
}
function Qe(e) {
  e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render();
}
function ds(e, t) {
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
    return t.repeat || (!Oe(e.state).length || a === "a" ? (e.checkpoint("Auto-split shots"), e.state.sequence = { ...e.state.sequence || { recording_path: "" }, enabled: !0, cuts: Gr(e.state) }, Qe(e)) : (e.checkpoint("Split shot"), Wr(e.state, e.frame, null) ? Qe(e) : e.setStatus("Move the playhead inside a shot first"))), !0;
  if (t.key === "Delete" || t.key === "Backspace") {
    if (t.repeat) return !0;
    const r = Oe(e.state), o = Ut(e.state, e.frame), n = o ? r.findIndex((s) => s.start === o.start) : -1;
    return n >= 0 && (e.checkpoint("Remove shot"), $r(e.state, n) && Qe(e)), !0;
  }
  return !1;
}
function yt(e, t) {
  let a = !1;
  const r = e.onRemoved, o = function(...s) {
    a = !0, r?.apply(this, s);
  };
  o.__omnicamShim = !0, e.onRemoved = o;
  const n = () => {
    e.onRemoved?.__omnicamShim && (e.onRemoved = r);
  };
  return t().then((s) => {
    n(), !a && s(e);
  }).catch((s) => {
    n(), console.error("OmniCam: node UI failed to load", s);
  });
}
const rt = "MajoorOmniCamDirector", ot = "MajoorOmniCamExtractor", nt = "MajoorOmniCamMonitor";
function Ge(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.comfyClass || e?.constructor?.type || "");
}
const Ar = {
  [rt]: { default: [1313, 1633], min: [760, 760] },
  [ot]: { default: [761, 1458], min: [700, 760] },
  [nt]: { default: [798, 1634], min: [640, 680] }
}, ps = 0.92, fs = 0.88;
function us([e, t], [a, r]) {
  if (typeof window > "u") return [e, t];
  const o = Math.round((window.innerWidth || e) * ps), n = Math.round((window.innerHeight || t) * fs);
  return [
    Math.max(a, Math.min(e, o)),
    Math.max(r, Math.min(t, n))
  ];
}
function hs(e, t) {
  const a = Ar[t];
  return !a || !e?.setSize ? !1 : (e.setSize(us(a.default, a.min)), !0);
}
function gs(e, t, a) {
  const r = Ar[t];
  if (!r || !e?.setSize) return !1;
  const o = Array.isArray(a) ? a : Array.isArray(e.size) ? e.size : [0, 0], n = Array.isArray(e.size) ? e.size : [0, 0], [s, i] = r.min, l = Math.max(Number(o[0]) || 0, s), m = Math.max(Number(o[1]) || 0, i);
  return l === n[0] && m === n[1] ? !1 : (e.setSize([l, m]), !0);
}
const Gt = "oc-help-css", je = "#8b7bd8", Er = /* @__PURE__ */ new Map();
function bt(e, t) {
  e && t && Er.set(e, t);
}
function st(e) {
  return e && Er.get(e) || null;
}
const ys = `
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
.oc-help-h-icon{width:18px;height:18px;flex:none;border-radius:50%;background:${je};
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px}
.oc-help-h-title{flex:1;font-size:14px;font-weight:650;color:#fff;line-height:1.2}
.oc-help-close{flex:none;width:24px;height:24px;border-radius:6px;border:none;
  background:rgba(255,255,255,.06);color:#9a9aad;cursor:pointer;font-size:14px;
  line-height:1;display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s}
.oc-help-close:hover{background:${je};color:#fff}
.oc-help-body{padding:13px 15px 15px;overflow-y:auto;font-size:12px;line-height:1.55}
.oc-help-section{margin-bottom:14px}
.oc-help-section:last-child{margin-bottom:0}
.oc-help-h{margin:0 0 6px;font-size:10px;font-weight:700;color:${je};
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
  border-left:2px solid ${je};border-radius:3px;color:#ddd;font-size:11.5px}
`;
function bs() {
  if (document.getElementById(Gt)) return;
  const e = document.createElement("style");
  e.id = Gt, e.textContent = ys, document.head.appendChild(e);
}
function oe(e) {
  return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`([^`]+)`/g, (a, r) => `<code>${r}</code>`);
}
function _s(e) {
  const t = document.createElement("div");
  if (t.className = "oc-help-section", e.heading) {
    const a = document.createElement("div");
    a.className = "oc-help-h", a.textContent = e.heading, t.appendChild(a);
  }
  if (e.body)
    for (const a of String(e.body).split(/\n\s*\n/)) {
      const r = document.createElement("p");
      r.className = "oc-help-p", r.innerHTML = oe(a), t.appendChild(r);
    }
  if (Array.isArray(e.bullets) && e.bullets.length) {
    const a = document.createElement("ul");
    a.className = "oc-help-ul";
    for (const r of e.bullets) {
      const o = document.createElement("li");
      o.innerHTML = oe(r), a.appendChild(o);
    }
    t.appendChild(a);
  }
  if (Array.isArray(e.defs) && e.defs.length) {
    const a = document.createElement("dl");
    a.className = "oc-help-defs";
    for (const r of e.defs) {
      const [o, n] = Array.isArray(r) ? r : [r, ""], s = document.createElement("dt");
      s.innerHTML = oe(o);
      const i = document.createElement("dd");
      i.innerHTML = oe(n), a.appendChild(s), a.appendChild(i);
    }
    t.appendChild(a);
  }
  return t;
}
let we = null;
function vs() {
  we && we();
}
function Ht(e) {
  e = e || {}, bs(), vs();
  const t = document.createElement("div");
  t.className = "oc-help-backdrop";
  const a = document.createElement("div");
  a.className = "oc-help-card oc-help", a.setAttribute("role", "dialog"), a.setAttribute("aria-modal", "true"), a.tabIndex = -1;
  const r = `oc-help-title-${Math.random().toString(36).slice(2, 8)}`;
  a.setAttribute("aria-labelledby", r), t.appendChild(a);
  const o = document.createElement("div");
  o.className = "oc-help-header";
  const n = document.createElement("span");
  n.className = "oc-help-h-icon", n.textContent = "?";
  const s = document.createElement("div");
  s.className = "oc-help-h-title", s.id = r, s.textContent = e.title || "Help";
  const i = document.createElement("button");
  i.className = "oc-help-close", i.type = "button", i.textContent = "✕", i.title = "Close (Esc)", o.appendChild(n), o.appendChild(s), o.appendChild(i), a.appendChild(o);
  const l = document.createElement("div");
  if (l.className = "oc-help-body", e.tagline) {
    const h = document.createElement("p");
    h.className = "oc-help-p", h.style.color = "#e6e6e6", h.innerHTML = oe(e.tagline), l.appendChild(h);
  }
  const m = Array.isArray(e.sections) ? e.sections : [];
  for (const h of m)
    try {
      l.appendChild(_s(h));
    } catch (_) {
      console.warn("[OmniCam] help: skipped a malformed section", _);
    }
  if (e.footer) {
    const h = document.createElement("div");
    h.className = "oc-help-tip", h.innerHTML = oe(e.footer), l.appendChild(h);
  }
  a.appendChild(l);
  let c = !1;
  const d = document.activeElement instanceof HTMLElement ? document.activeElement : null, p = () => {
    document.removeEventListener("keydown", f, !0), t.remove(), we === p && (we = null), d && d.isConnected && typeof d.focus == "function" && d.focus({ preventScroll: !0 });
  };
  we = p;
  const u = () => Array.from(
    a.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((h) => !h.disabled && h.offsetParent !== null), f = (h) => {
    if (h.key === "Escape") {
      h.stopPropagation(), h.preventDefault(), p();
      return;
    }
    if (h.key === "Tab") {
      const _ = u();
      if (!_.length) {
        h.preventDefault(), a.focus();
        return;
      }
      const y = _[0], v = _[_.length - 1], b = document.activeElement;
      h.shiftKey && (b === y || !a.contains(b)) ? (h.preventDefault(), v.focus()) : !h.shiftKey && (b === v || !a.contains(b)) && (h.preventDefault(), y.focus());
    }
  };
  return document.addEventListener("keydown", f, !0), i.addEventListener("click", (h) => {
    h.stopPropagation(), p();
  }), t.addEventListener("mousedown", (h) => {
    c = h.target === t;
  }), t.addEventListener("click", (h) => {
    h.target === t && c && p(), c = !1;
  }), a.addEventListener("mousedown", (h) => h.stopPropagation()), document.body.appendChild(t), (i.isConnected ? i : a).focus({ preventScroll: !0 }), p;
}
bt("MajoorOmniCamDirector", {
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
bt("MajoorOmniCamExtractor", {
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
bt("MajoorOmniCamMonitor", {
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
        ["h3_scene_coverage", "Prompt + options. No playblast: compiles the selected camera's orbit/arc directly into a complete H3 prompt and H3EDIT_OPTIONS for TextEncodeH3Edit; length resolves to 124/243/362 at 24 fps. Blocks on moving targets, cuts or more than one full turn, and recommends h3_native instead."],
        ["h3_api", "Reference video. The playblast as a VIDEO plus a prompt, for MinimaxHailuo03ReferenceNode."]
      ]
    },
    {
      heading: "Outputs",
      body: "Every output is present on the node at once, but only the selected profile's are populated. Camera-embedding profiles fill `camera_embedding`; `wan_move_native` fills `native_tracks`; the other track profiles fill `tracks_json`; reference-video profiles fill `reference_video` or `reference_frames`; `h3_scene_coverage` fills `h3edit_options`. `final_prompt`, `target_width`, `target_height`, `target_length` and `target_fps` are always filled."
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
const Wt = "MajoorOmniCam.ShowHelp", it = "oc-help-toolbar-icon", $t = "oc-help-toolbar-css", Ss = "#8b7bd8";
function ws() {
  if (document.getElementById($t)) return;
  const e = document.createElement("style");
  e.id = $t, e.textContent = `
    .${it}{display:inline-flex;align-items:center;justify-content:center;
      width:16px;height:16px;border-radius:50%;background:${Ss};color:#fff;
      font-weight:700;font-size:11px;line-height:1}
    .${it}::before{content:"?"}
  `, document.head.appendChild(e);
}
function xs() {
  const e = J.canvas;
  if (!e) return [];
  const t = [];
  if (e.selected_nodes && t.push(...Object.values(e.selected_nodes)), e.selectedItems)
    for (const a of e.selectedItems)
      a && a.comfyClass && t.push(a);
  return t;
}
function Ms() {
  for (const e of xs()) {
    const t = st(e.comfyClass);
    if (t) return t;
  }
  return null;
}
J.registerExtension({
  name: "MajoorOmniCam.HelpToolbar",
  commands: [
    {
      id: Wt,
      label: "Help",
      icon: it,
      function: () => {
        const e = Ms();
        e && Ht(e);
      }
    }
  ],
  // ComfyUI calls this for every extension with the selected canvas item and
  // unions the returned command ids to render in the floating selection
  // toolbar. Never called on older frontends -> the command is registered but
  // simply never shown (harmless).
  getSelectionToolboxCommands(e) {
    const t = e && e.comfyClass;
    return t && st(t) ? [Wt] : [];
  },
  // Right-click fallback so help is reachable even without the selection
  // toolbar hook.
  getNodeMenuItems(e) {
    const t = st(e?.comfyClass);
    return t ? [null, { content: "? Help", callback: () => Ht(t) }] : [];
  },
  setup() {
    ws();
  }
});
Yo(Ir);
let ie = !1;
function _t(e, t, a, r) {
  a ? hs(e, t) : gs(e, t, r);
}
function vt(e) {
  if (typeof e.configure != "function") return () => null;
  let t = null;
  const a = e.configure, r = (o) => a.call(e, o);
  return e.configure = function(o) {
    return t === null && Array.isArray(o?.size) && (t = [...o.size]), r(o);
  }, () => t;
}
function Te(e, t) {
  const a = globalThis.__majoorOmniCamCiTrace;
  Array.isArray(a) && a.push({ stage: e, nodeId: t?.id ?? null, nodeClass: Ge(t), configuringGraph: ie });
}
ns();
Rr(J);
un(J);
J.registerExtension({
  name: "Majoor.OmniCam.Director",
  settings: hr,
  beforeConfigureGraph() {
    ie = !0;
  },
  afterConfigureGraph() {
    ie = !1;
  },
  async nodeCreated(e) {
    if (Ge(e) !== rt) return;
    Te("director:nodeCreated", e);
    const t = !ie, a = t ? null : vt(e);
    await yt(e, async () => {
      Te("director:import:start", e);
      const { attachDirector: o } = await import("./chunk-Dc-oAyIl.js").then((n) => n.g);
      return Te("director:import:resolved", e), o;
    });
    const r = e.__majoorOmniCam;
    r && (Te("director:attach:complete", e), hn(r), t && gn(r), _t(e, rt, t, a?.()));
  }
});
J.registerExtension({
  name: "Majoor.OmniCam.Extractor",
  async nodeCreated(e) {
    if (Ge(e) !== ot) return;
    const t = !ie, a = t ? null : vt(e);
    await yt(e, async () => (await import("./chunk-DbsAB9AE.js")).attachExtractor), e.__majoorOmniCamExtractor && _t(e, ot, t, a?.());
  }
});
J.registerExtension({
  name: "Majoor.OmniCam.Monitor",
  async nodeCreated(e) {
    if (Ge(e) !== nt) return;
    const t = !ie, a = t ? null : vt(e);
    await yt(e, async () => (await import("./chunk-BUz978IN.js")).attachMonitor), e.__majoorOmniCamMonitor && _t(e, nt, t, a?.());
  }
});
export {
  ba as $,
  Os as A,
  Is as B,
  ft as C,
  Ps as D,
  Rs as E,
  yo as F,
  go as G,
  Ne as H,
  Dt as I,
  Fs as J,
  Io as K,
  Oo as L,
  Cr as M,
  As as N,
  Ns as O,
  rs as P,
  sn as Q,
  ct as R,
  ni as S,
  hr as T,
  da as U,
  pa as V,
  fa as W,
  ua as X,
  ha as Y,
  ga as Z,
  ya as _,
  S as a,
  vs as a$,
  fr as a0,
  ur as a1,
  sr as a2,
  nr as a3,
  rr as a4,
  or as a5,
  ir as a6,
  lr as a7,
  pr as a8,
  Ca as a9,
  A as aA,
  Qs as aB,
  tn as aC,
  ri as aD,
  ei as aE,
  ti as aF,
  ai as aG,
  vi as aH,
  R as aI,
  Nt as aJ,
  Ao as aK,
  qn as aL,
  jr as aM,
  bi as aN,
  _i as aO,
  Br as aP,
  Bs as aQ,
  C as aR,
  Hs as aS,
  Vr as aT,
  qs as aU,
  Gs as aV,
  se as aW,
  wn as aX,
  vr as aY,
  F as aZ,
  si as a_,
  ka as aa,
  Da as ab,
  cr as ac,
  dr as ad,
  ja as ae,
  Aa as af,
  Ea as ag,
  Ia as ah,
  Oa as ai,
  za as aj,
  Na as ak,
  Ra as al,
  La as am,
  Ba as an,
  Ka as ao,
  Ua as ap,
  Xa as aq,
  Ya as ar,
  Za as as,
  Qa as at,
  Ja as au,
  er as av,
  ar as aw,
  ma as ax,
  oi as ay,
  G as az,
  ia as b,
  br as b0,
  Ks as b1,
  ss as b2,
  Xs as b3,
  Ys as b4,
  Zs as b5,
  Us as b6,
  fi as b7,
  pi as b8,
  jn as b9,
  Sr as ba,
  ui as bb,
  hi as bc,
  gi as bd,
  yi as be,
  wr as bf,
  An as bg,
  di as bh,
  mi as bi,
  ci as bj,
  X as bk,
  sa as bl,
  P as bm,
  Ut as bn,
  js as bo,
  ot as bp,
  li as bq,
  ii as br,
  zs as bs,
  j as c,
  ce as d,
  L as e,
  Ke as f,
  Oe as g,
  Wr as h,
  $r as i,
  Ts as j,
  Gr as k,
  Js as l,
  Jt as m,
  dt as n,
  $s as o,
  Pe as p,
  Mt as q,
  jt as r,
  le as s,
  et as t,
  Je as u,
  Ws as v,
  Vs as w,
  Mo as x,
  Ls as y,
  Es as z
};
