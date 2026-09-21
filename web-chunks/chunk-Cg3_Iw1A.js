import { app as ae } from "../../scripts/app.js";
import { api as ro } from "../../scripts/api.js";
const oo = "MajoorOmniCam", no = new URL("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20256%20256'%20role='img'%20aria-labelledby='title'%3e%3ctitle%20id='title'%3eMajoor%20OmniCam%3c/title%3e%3c!--%20Vector%20twin%20of%20web/assets/omnicam-icon.png:%20same%20mark,%20~1%20KB%20so%20the%20eagerly-loaded%20node-branding%20chunk%20stays%20cheap.%20Keep%20the%20two%20in%20sync.%20--%3e%3ccircle%20cx='128'%20cy='128'%20r='102'%20fill='%23031228'/%3e%3ccircle%20cx='128'%20cy='128'%20r='53'%20fill='%23f7f6ff'/%3e%3ccircle%20cx='128'%20cy='128'%20r='43'%20fill='%238873fd'/%3e%3c/svg%3e", import.meta.url).href, J = 20;
let pe = null;
function so() {
  return pe || typeof Image > "u" || (pe = new Image(), pe.src = no), pe;
}
function io() {
  const t = Date.now() % 2600 / 2600;
  return 0.12 + 0.1 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2));
}
function lo(e) {
  e.registerExtension({
    name: "MajoorOmniCam.NodeBranding",
    beforeRegisterNodeDef(t, a) {
      if (!String(a?.name || a?.node_id || t?.comfyClass || t?.type || "").startsWith(oo)) return;
      const o = t.prototype.onDrawForeground;
      t.prototype.onDrawForeground = function(n) {
        if (o?.apply(this, arguments), this.flags?.collapsed) return;
        const s = so();
        if (!s?.complete || !s.naturalWidth) return;
        const i = Math.max(4, Number(this.size?.[0] || 160) - J - 6), l = -26, c = i + J / 2, d = l + J / 2;
        if (n.save(), this.selected) {
          const m = io(), p = n.createRadialGradient(c, d, J * 0.35, c, d, J * 1.15);
          p.addColorStop(0, `rgba(136, 115, 253, ${m})`), p.addColorStop(1, "rgba(136, 115, 253, 0)"), n.fillStyle = p, n.beginPath(), n.arc(c, d, J * 1.15, 0, Math.PI * 2), n.fill();
        }
        n.globalAlpha = 0.96, n.drawImage(s, i, l, J, J), n.restore();
      };
    }
  });
}
const ht = "en", Pe = /* @__PURE__ */ new Map([[ht, {}]]);
function co(e, t) {
  Pe.set(e, { ...Pe.get(e) || {}, ...t || {} });
}
let Ne = ht;
function mo(e) {
  Pe.has(e) && (Ne = e);
}
function uo() {
  return Ne;
}
function _(e, t = {}) {
  return (Ne === ht ? e : Pe.get(Ne)?.[e] || e).replace(/\{(\w+)\}/g, (r, o) => Object.hasOwn(t, o) ? String(t[o]) : r);
}
const po = "__sequence__";
function fo() {
  return { enabled: !1, cuts: [], recording_path: "" };
}
function ho(e, t = []) {
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
function Re(e) {
  const t = Math.max(0, (e?.duration_frames || 1) - 1), a = (e?.sequence?.cuts || []).filter((r) => r.start <= t);
  return a.map((r, o) => ({
    camera_id: r.camera_id,
    start: r.start,
    end: o + 1 < a.length ? a[o + 1].start - 1 : t
  }));
}
function Mi(e) {
  return !!e?.sequence?.enabled && Re(e).length > 0;
}
function da(e, t) {
  const a = Re(e);
  if (!a.length) return null;
  const r = Math.max(0, Math.round(Number(t) || 0));
  for (let o = a.length - 1; o >= 0; o--)
    if (r >= a[o].start) return a[o];
  return a[0];
}
function go(e) {
  const t = e?.cameras || [], a = Math.max(0, (e?.duration_frames || 1) - 1);
  if (!t.length) return [];
  const r = (a + 1) / t.length, o = t.map((s, i) => ({
    camera_id: s.id,
    start: i === 0 ? 0 : Math.round(i * r)
  })), n = /* @__PURE__ */ new Set();
  return o.filter((s) => s.start > a || n.has(s.start) ? !1 : (n.add(s.start), !0));
}
function xi(e, t, a) {
  const r = e?.sequence?.cuts || [];
  if (t <= 0 || t >= r.length) return !1;
  const o = r[t - 1].start + 1, n = (t + 1 < r.length ? r[t + 1].start : e.duration_frames || 1) - 1;
  if (n < o) return !1;
  const s = Math.max(o, Math.min(n, Math.round(Number(a) || 0)));
  return s === r[t].start ? !1 : (r[t].start = s, !0);
}
function yo(e, t) {
  const a = e?.cameras || [];
  if (!a.length) return t;
  const r = a.findIndex((o) => o.id === t);
  return a[(r + 1) % a.length].id;
}
function bo(e, t, a = null) {
  const r = e?.sequence?.cuts || [], o = Math.max(0, Math.round(Number(t) || 0));
  if (!r.length || o <= 0 || r.some((i) => i.start === o)) return !1;
  const s = da(e, o)?.camera_id || r[0].camera_id;
  return r.push({ camera_id: a || yo(e, s), start: o }), r.sort((i, l) => i.start - l.start), !0;
}
function vo(e, t) {
  const a = e?.sequence?.cuts || [];
  return t < 0 || t >= a.length || a.length === 1 ? !1 : (a.splice(t, 1), a.length && (a[0].start = 0), !0);
}
const ma = Object.freeze(["select", "track", "anchor", "project", "erase"]), ua = Object.freeze(["manual_2d", "static_anchor", "world_point", "object_point", "camera_field"]), pa = Object.freeze(["linear", "smooth", "hold"]), we = (e, t = 0) => Number.isFinite(Number(e)) ? Number(e) : t, Ot = (e) => Math.max(0, Math.min(1, we(e)));
function _o(e, t) {
  return {
    time_seconds: Math.max(0, Math.min(t, we(e?.time_seconds))),
    x: Ot(e?.x),
    y: Ot(e?.y),
    visible: e?.visible !== !1,
    interpolation: pa.includes(e?.interpolation) ? e.interpolation : "linear"
  };
}
function So(e) {
  const t = Math.max(1 / Math.max(1, we(e.fps, 24)), we(e.duration_frames, 120) / Math.max(1, we(e.fps, 24))), a = /* @__PURE__ */ new Set();
  return e.motion_layers = (Array.isArray(e.motion_layers) ? e.motion_layers : []).slice(0, 256).map((r, o) => {
    let n = String(r?.id || `motion_${o + 1}`);
    a.has(n) && (n = `motion_${o + 1}`), a.add(n);
    const s = ua.includes(r?.source_kind) ? r.source_kind : "manual_2d", i = (Array.isArray(r?.keys) ? r.keys : []).slice(0, 1e4).map((l) => _o(l, t)).sort((l, c) => l.time_seconds - c.time_seconds);
    return {
      id: n,
      label: String(r?.label || `Motion ${o + 1}`).slice(0, 80),
      enabled: r?.enabled !== !1,
      semantic: "screen_point",
      source_kind: s,
      keys: i,
      source: r?.source && typeof r.source == "object" ? { ...r.source } : {}
    };
  }).filter((r) => r.keys.length), e.motion_tool = ma.includes(e.motion_tool) ? e.motion_tool : "select", e.selected_motion_layer_id = e.motion_layers.some((r) => r.id === e.selected_motion_layer_id) ? e.selected_motion_layer_id : e.motion_layers[0]?.id || null, e;
}
const wo = 32, Co = 64, Mo = 128, xo = Object.freeze(["off", "selected", "all"]), ko = Object.freeze(["annotation", "name", "tag"]), Pt = Object.freeze({ mode: "selected", content: "annotation" }), Ao = Object.freeze(["top", "center", "bottom"]), To = /^[a-z0-9][a-z0-9_-]*$/, Do = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, jo = /[<>]|:\/\/|javascript:|expression\(|&#/i;
function nt(e) {
  if (!Array.isArray(e)) return [];
  const t = [], a = /* @__PURE__ */ new Set();
  for (const r of e) {
    if (typeof r != "string") continue;
    const o = r.trim().toLowerCase();
    if (!(!o || o.length > Co || !To.test(o) || a.has(o)) && (a.add(o), t.push(o), t.length >= wo))
      break;
  }
  return t;
}
function ki(e) {
  return Array.isArray(e) ? nt(e) : nt(String(e || "").split(/[,\n]/));
}
function Nt(e) {
  if (!e || typeof e != "object") return null;
  const t = typeof e.text == "string" ? e.text.trim() : "";
  if (!t || t.length > Mo || jo.test(t)) return null;
  const a = typeof e.color == "string" ? e.color.trim() : "", r = Do.test(a) ? a.toLowerCase() : "#8d7ee8", o = Ao.includes(e.anchor) ? e.anchor : "top";
  return { text: t, visible: e.visible !== !1, color: r, anchor: o };
}
function Ai(e) {
  return {
    mode: xo.includes(e?.mode) ? e.mode : Pt.mode,
    content: ko.includes(e?.content) ? e.content : Pt.content
  };
}
function Eo(e) {
  return Array.isArray(e?.tags) && e.tags[0] || "";
}
function Ti(e, t) {
  if (!e) return "";
  if (t === "name") return String(e.name || e.type || "");
  if (t === "tag") return Eo(e);
  const a = e.annotation;
  return a && a.visible !== !1 ? String(a.text || "") : "";
}
function Di(e, { mode: t, selectedIds: a } = {}) {
  return !e || e.enabled === !1 || t === "off" ? !1 : t === "all" ? !0 : (a instanceof Set ? a : new Set(a || [])).has(e.id);
}
const Io = /* @__PURE__ */ new Set(["camera", "null", "sun_light", "point_light", "spot_light"]);
function ji(e, t, a = "top") {
  const r = Array.isArray(e?.position) ? e.position : [0, 0, 0], o = Array.isArray(e?.size) ? e.size : [1, 1, 1], n = Number(r[1]) || 0, s = Number(o[1]) || 1;
  let i;
  if (t === "human")
    a === "top" ? i = s + 0.25 : a === "center" ? i = s * 0.5 : i = 0;
  else if (Io.has(t))
    a === "top" ? i = 0.35 : a === "center" ? i = 0 : i = -0.35;
  else {
    const l = s * 0.5;
    a === "top" ? i = l + 0.2 : a === "center" ? i = 0 : i = -(l + 0.2);
  }
  return [Number(r[0]) || 0, n + i, Number(r[2]) || 0];
}
const Rt = Object.freeze([0.05, 8]), Oo = 80, fa = (e, t, a) => Math.max(t, Math.min(a, e));
function ha(e) {
  if (!e || typeof e != "object") return null;
  const t = String(e.clip_id ?? "").trim();
  if (!t || t.length > Oo) return null;
  const a = Math.max(0, Math.round(Number(e.start_frame) || 0)), r = Math.round(Number(e.end_frame) || 0), o = r > a ? r : 0, n = Number(e.speed), s = fa(Number.isFinite(n) && n > 0 ? n : 1, Rt[0], Rt[1]), i = Number(e.offset_seconds);
  return {
    clip_id: t,
    start_frame: a,
    end_frame: o,
    speed: s,
    loop: e.loop !== !1,
    offset_seconds: Number.isFinite(i) ? i : 0
  };
}
function Ei(e, t, a, r) {
  const o = ha(e), n = Number(r) || 0, s = Math.max(1, Number(a) || 24);
  if (!o || n <= 0) return 0;
  const i = (m) => o.loop ? (m % n + n) % n : fa(m, 0, n);
  if (t <= o.start_frame) return i(o.offset_seconds);
  const l = o.end_frame > o.start_frame ? o.end_frame : null, c = l !== null && !o.loop ? Math.min(t, l) : t, d = o.offset_seconds + (c - o.start_frame) * o.speed / s;
  return i(d);
}
const Ii = "omnicam_humanoid_v1", gt = Object.freeze([
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
]), Po = Object.freeze(["eye_l", "eye_r", "hand_tip_l", "hand_tip_r"]);
Object.freeze([...gt, ...Po]);
new Map(gt.map((e, t) => [e, t]));
const No = /^mixamorig[:_ ]?/i, Ro = /[\s_\-.:|]+/g, zo = {
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
function Lo(e) {
  return String(e || "").trim().replace(No, "").replace(Ro, "").toLowerCase();
}
function Fo(e) {
  const t = [e];
  return e.startsWith("left") ? t.push(`${e.slice(4)}l`) : e.startsWith("right") && t.push(`${e.slice(5)}r`), e.endsWith("left") ? t.push(`${e.slice(0, -4)}l`) : e.endsWith("right") && t.push(`${e.slice(0, -5)}r`), [...new Set(t)];
}
function Bo(e, t, a, r) {
  for (const [o, n] of t)
    if (!a.has(o)) {
      if (r) {
        if (n.includes(e)) return o;
      } else if (n.some((s) => s.includes(e) || e.includes(s)))
        return o;
    }
  return null;
}
function Oi(e) {
  const a = (e || []).map(String).filter((n) => n.trim()).map((n) => [n, Fo(Lo(n))]), r = /* @__PURE__ */ new Set(), o = {};
  for (const n of [!0, !1])
    for (const [s, i] of Object.entries(zo))
      if (!o[s])
        for (const l of i) {
          const c = Bo(l, a, r, n);
          if (c != null) {
            o[s] = c, r.add(c);
            break;
          }
        }
  return !o.root && o.pelvis && (o.root = o.pelvis), o;
}
function Ko(e) {
  const t = new Set(
    Object.entries(e || {}).filter(([, a]) => String(a || "").trim()).map(([a]) => a)
  );
  return gt.filter((a) => !t.has(a));
}
function Vo(e) {
  return Ko(e).length === 0;
}
function Pi(e) {
  const t = e?.bone_map || e?.rig?.bone_map || null;
  return !t || !Object.keys(t).length ? "none" : Vo(t) ? "rigged" : "incomplete";
}
const Go = 128, zt = "omnicam_humanoid_v1", yt = /^[a-z0-9][a-z0-9_-]*$/, qo = 1e-3, Ho = (e) => Array.isArray(e) && e.length === 3 && e.every((t) => Number.isFinite(Number(t)));
function bt(e) {
  if (!Array.isArray(e) || e.length !== 4) return null;
  const t = e.map(Number);
  if (t.some((r) => !Number.isFinite(r))) return null;
  const a = Math.hypot(...t);
  return a <= 1e-8 || Math.abs(a - 1) > qo && !(a > 0.5 && a < 2) ? null : t.map((r) => r / a);
}
function ga(e, t = 1e-4) {
  const a = bt(e);
  return a ? Math.abs(a[0]) < t && Math.abs(a[1]) < t && Math.abs(a[2]) < t && Math.abs(Math.abs(a[3]) - 1) < t : !1;
}
function Wo(e) {
  const t = {};
  if (!e || typeof e != "object") return t;
  let a = 0;
  for (const [r, o] of Object.entries(e)) {
    if (a >= Go) break;
    const n = String(r).trim().toLowerCase();
    if (!yt.test(n) || n.length > 64) continue;
    const s = bt(o);
    !s || ga(s) || (t[n] = s, a += 1);
  }
  return t;
}
function ze(e) {
  const t = e && typeof e == "object" ? e : {}, a = String(t.preset_id || "neutral").trim().toLowerCase();
  return {
    preset_id: yt.test(a) && a.length <= 80 ? a : "neutral",
    root_offset: Ho(t.root_offset) ? t.root_offset.map(Number) : [0, 0, 0],
    joints: Wo(t.joints)
  };
}
function Ni({ preset: e, overrides: t } = {}) {
  const a = ze(e), r = ze(t);
  return {
    preset_id: r.preset_id !== "neutral" ? r.preset_id : a.preset_id,
    root_offset: t?.root_offset ? r.root_offset : a.root_offset,
    joints: { ...a.joints, ...r.joints }
  };
}
function Ri(e, t, a) {
  const r = ze(e), o = String(t || "").trim().toLowerCase();
  if (!yt.test(o)) return r;
  const n = bt(a);
  return !n || ga(n) ? delete r.joints[o] : r.joints[o] = n, r;
}
function $o(e) {
  return !e || typeof e != "object" ? null : {
    rig_profile: e.rig_profile === zt ? zt : null,
    pose: ze(e.pose),
    motion: ha(e.motion)
  };
}
const vt = 1, ya = 0.1, ba = 10;
function va(e) {
  return Number.isFinite(e) && e >= ya && e <= ba;
}
function Uo(e) {
  const t = e?.timing?.weight, a = Number(t);
  return va(a) ? a : vt;
}
function zi(e, t) {
  const a = { ...e }, r = Number(t);
  return !va(r) || r === vt ? (delete a.timing, a) : (a.timing = { ...e?.timing && typeof e.timing == "object" ? e.timing : {}, weight: r }, a);
}
function Lt(e) {
  const t = e?.camera?.position;
  return Array.isArray(t) ? t : [0, 0, 0];
}
function Xo(e, t) {
  const a = (e[0] || 0) - (t[0] || 0), r = (e[1] || 0) - (t[1] || 0), o = (e[2] || 0) - (t[2] || 0);
  return Math.sqrt(a * a + r * r + o * o);
}
function Li(e, { startFrame: t, endFrame: a } = {}) {
  if (!Array.isArray(e) || e.length < 2) return { ok: !1, reason: "not_enough_keys" };
  const r = Number(t), o = Number(a);
  if (!Number.isFinite(r) || !Number.isFinite(o) || o <= r)
    return { ok: !1, reason: "invalid_range" };
  const n = [...e].sort((u, f) => u.frame - f.frame);
  if (Math.floor(o) - Math.floor(r) + 1 < n.length)
    return { ok: !1, reason: "insufficient_frame_slots" };
  const i = n.map((u) => Uo(u)), l = [];
  for (let u = 1; u < n.length; u += 1) {
    const f = Xo(Lt(n[u - 1]), Lt(n[u])), w = (i[u - 1] + i[u]) / 2;
    l.push(f * w);
  }
  const c = l.reduce((u, f) => u + f, 0), d = o - r, m = [0];
  if (c > 0) {
    let u = 0;
    for (const f of l)
      u += f, m.push(u / c);
  } else
    for (let u = 1; u < n.length; u += 1) m.push(u / (n.length - 1));
  const p = m.map((u) => Math.round(r + u * d));
  p[0] = r, p[p.length - 1] = o;
  for (let u = 1; u < p.length; u += 1)
    p[u] <= p[u - 1] && (p[u] = p[u - 1] + 1);
  for (let u = p.length - 1; u > 0; u -= 1)
    p[u] > o - (p.length - 1 - u) && (p[u] = o - (p.length - 1 - u));
  return p[p.length - 1] = o, p[0] = r, { ok: !0, keys: n.map((u, f) => ({ ...u, frame: p[f] })) };
}
function Yo(e) {
  const t = String(e || "").trim().replaceAll("\\", "/");
  if (!t || t.length > 1024 || t.includes("\0") || t.includes("://")) return null;
  const a = t.match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/);
  if (!a) return null;
  const r = String(a[1] || "").replace(/^\/+/, "");
  if (!r || /^[A-Za-z]:/.test(r) || r.split("/").some((i) => i === "..")) return null;
  const o = r.lastIndexOf("/"), n = o >= 0 ? r.slice(o + 1) : r, s = o >= 0 ? r.slice(0, o) : "";
  return !n || n === "." ? null : { filename: n, subfolder: s, type: a[2] || "input" };
}
function Zo(e, t) {
  const a = Yo(t);
  if (!a) return "";
  const r = `/view?filename=${encodeURIComponent(a.filename)}&subfolder=${encodeURIComponent(a.subfolder)}&type=${encodeURIComponent(a.type)}`;
  return e?.apiURL ? e.apiURL(r) : r;
}
function Fi(e) {
  return Zo({ apiURL: _a }, e);
}
let _a = (e) => e;
const Qe = /* @__PURE__ */ new WeakMap();
function Bi({ api: e }) {
  _a = (t) => e.apiURL ? e.apiURL(t) : t;
}
function Qo(e, t, a) {
  const r = e.keyframes, o = Qe.get(e);
  if (o?.source === r && a >= o.frame && o.index < t.length - 1) {
    let s = o.index;
    for (; s + 1 < t.length - 1 && a >= t[s + 1].frame; ) s += 1;
    if (t[s].frame < a && a < t[s + 1].frame)
      return Qe.set(e, { source: r, frame: a, index: s }), { leftIndex: s, left: t[s], right: t[s + 1] };
  }
  const n = _t(t, a);
  return Qe.set(e, { source: r, frame: a, index: n?.leftIndex ?? 0 }), n;
}
function H(e) {
  const t = j(e.target, e.position), a = Math.sqrt(Z(t, t)) < 1e-6 ? [0, 0, -1] : ie(t);
  let r = e.up || [0, 1, 0], o = Ce(a, r);
  Math.sqrt(Z(o, o)) < 1e-6 && (r = Math.abs(a[1]) > 0.9 ? [0, 0, a[1] > 0 ? -1 : 1] : [0, 1, 0], o = Ce(a, r)), o = ie(o);
  let n = ie(Ce(o, a));
  if (Math.abs(e.roll || 0) > 1e-9) {
    const s = e.roll * Math.PI / 180, i = Math.cos(s), l = Math.sin(s), c = M(T(o, i), T(n, l));
    n = M(T(n, i), T(o, -l)), o = c;
  }
  return { right: o, up: n, forward: a };
}
function Ki(e) {
  const t = j(e.target, e.position), a = W(t), r = a < 1e-6 ? [0, 0, -1] : T(t, 1 / a), o = Math.asin(D(r[1], -1, 1)) * 180 / Math.PI, n = Math.atan2(r[0], -r[2]) * 180 / Math.PI;
  return [o, n, e.roll || 0];
}
function Vi(e, t) {
  const [a, r, o] = t, n = Math.max(1e-4, W(j(e.target, e.position))), s = a * Math.PI / 180, i = r * Math.PI / 180, l = [Math.sin(i) * Math.cos(s), Math.sin(s), -Math.cos(i) * Math.cos(s)];
  e.target = M(e.position, T(l, n)), e.roll = o;
}
function V(e, t, a, r) {
  const { right: o, up: n, forward: s } = H(t), i = j(e, t.position), l = Z(i, s);
  if (l <= Math.max(1e-4, t.near || 0.01) || l >= (t.far || 1e4)) return null;
  const c = Z(i, o), d = Z(i, n);
  if (t.camera_type === "orthographic") {
    const p = 5 / Math.max(0.01, t.zoom || 1), h = p * a / Math.max(1, r);
    return [a * (0.5 + c / (2 * h)), r * (0.5 - d / (2 * p)), l];
  }
  const m = 0.5 * r / Math.tan(Math.max(1e-3, t.fov) * Math.PI / 360);
  return [a * 0.5 + c * m / l, r * 0.5 - d * m / l, l];
}
function de(e, t, a = null) {
  const r = (e.keyframes || []).map((g) => ({
    ...g,
    camera: q(g.camera || g || e.camera || le())
  }));
  if (!r.length) return q(e.camera || le());
  const o = Qo(e, r, t), n = z(r, t, "pos_x", (g) => (g.camera || g).position[0], !1, o), s = z(r, t, "pos_y", (g) => (g.camera || g).position[1], !1, o), i = z(r, t, "pos_z", (g) => (g.camera || g).position[2], !1, o);
  let l = z(r, t, "target_x", (g) => (g.camera || g).target[0], !1, o), c = z(r, t, "target_y", (g) => (g.camera || g).target[1], !1, o), d = z(r, t, "target_z", (g) => (g.camera || g).target[2], !1, o);
  const m = e.constraints?.look_at, h = m?.status === void 0 || m?.status === "active" ? m?.object_id || e.target_object_id || e.camera?.target_object_id : null, u = a || e.objects;
  if (h && Array.isArray(u)) {
    const g = u.find((x) => x.id === h);
    if (g && g.enabled !== !1) {
      const x = St(u, g, t), E = m?.offset || e.target_offset || e.camera?.target_offset || [0, 0, 0];
      l = (x.position?.[0] ?? 0) + (E[0] || 0), c = (x.position?.[1] ?? 1.5) + (E[1] || 0), d = (x.position?.[2] ?? 0) + (E[2] || 0);
    }
  }
  const f = z(r, t, "fov", (g) => Number((g.camera || g).fov ?? 35), !1, o), w = z(r, t, "roll", (g) => Number((g.camera || g).roll ?? 0), !0, o), v = z(r, t, "zoom", (g) => Number((g.camera || g).zoom ?? 1), !1, o), b = z(r, t, "near", (g) => Number((g.camera || g).near ?? 0.01), !1, o), y = z(r, t, "far", (g) => Number((g.camera || g).far ?? 1e4), !1, o), C = r[0]?.camera || r[0] || le();
  let S = r[0];
  for (const g of r)
    if ((g.frame ?? 0) <= t) S = g;
    else break;
  const A = (S.camera || S).camera_type;
  return {
    position: [n, s, i],
    target: [l, c, d],
    fov: D(f, 5, 150),
    roll: w,
    camera_type: A || "perspective",
    zoom: Math.max(0.01, v),
    near: Math.max(1e-4, b),
    far: Math.max(b + 1e-4, y),
    ...C.up ? { up: [...C.up] } : {}
  };
}
function Jo(e) {
  const t = Number(e?.timing?.weight);
  return !Number.isFinite(t) || t < ya || t > ba || t === vt ? {} : { timing: { weight: t } };
}
const D = (e, t, a) => Math.max(t, Math.min(a, e)), en = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, fe = (e, t = null) => typeof e == "string" && en.test(e.trim()) ? e.trim() : t, M = (e, t) => [e[0] + t[0], e[1] + t[1], e[2] + t[2]], j = (e, t) => [e[0] - t[0], e[1] - t[1], e[2] - t[2]], T = (e, t) => [e[0] * t, e[1] * t, e[2] * t], Z = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2], Ce = (e, t) => [e[1] * t[2] - e[2] * t[1], e[2] * t[0] - e[0] * t[2], e[0] * t[1] - e[1] * t[0]], W = (e) => Math.sqrt(Math.max(1e-12, Z(e, e))), ie = (e) => T(e, 1 / W(e));
function Sa(e, t, a) {
  const r = [a[0] - t[0], a[1] - t[1]], o = [e[0] - t[0], e[1] - t[1]], n = Math.max(1e-9, r[0] * r[0] + r[1] * r[1]), s = D((o[0] * r[0] + o[1] * r[1]) / n, 0, 1);
  return Math.hypot(e[0] - t[0] - r[0] * s, e[1] - t[1] - r[1] * s);
}
function tn(e, t = "ease") {
  if (e = D(e, 0, 1), t === "hold") return 0;
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
const Ft = [
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
], an = ["auto", "clamped", "vector", "free", "aligned", "flat"];
function rn(e, t) {
  const a = e?.tangents;
  return !a || typeof a != "object" ? {} : a.channels && typeof a.channels == "object" && a.channels[t] ? a.channels[t] : a;
}
function Bt(e, t, a, r, o) {
  const n = rn(e, t), s = an.includes(n.mode) ? n.mode : e?.tangents?.mode || "auto", i = o ? o(e) : 0, l = a && o ? o(a) : i, c = r && o ? o(r) : i, d = Math.max(1e-6, e.frame - (a?.frame ?? e.frame - 1)), m = Math.max(1e-6, (r?.frame ?? e.frame + 1) - e.frame), p = (b = !1) => {
    const y = (i - l) / d, C = (c - i) / m;
    let S = 0;
    if (!a && !r)
      S = 0;
    else if (!a)
      S = C;
    else if (!r)
      S = y;
    else if (y * C <= 0)
      S = 0;
    else {
      const A = m / (d + m), g = d / (d + m);
      if (S = y * A + C * g, b) {
        const x = 3 * Math.min(Math.abs(y), Math.abs(C));
        S = D(S, -x, x);
      }
    }
    return {
      out_x: 1 / 3,
      out_y: S ? S * m * (1 / 3) : 0,
      in_x: -1 / 3,
      in_y: S ? -S * d * (1 / 3) : 0
    };
  };
  if (s === "vector") {
    const b = (i - l) / d, y = (c - i) / m;
    return {
      out_x: 1 / 3,
      out_y: y * m * (1 / 3),
      in_x: -1 / 3,
      in_y: -b * d * (1 / 3),
      mode: s
    };
  }
  if (s === "flat")
    return { out_x: 1 / 3, out_y: 0, in_x: -1 / 3, in_y: 0, mode: s };
  if (s === "clamped")
    return { ...p(!0), mode: s };
  if (s === "auto")
    return { ...p(!1), mode: s };
  const h = p(!1), u = D(Number(n.out_x ?? h.out_x), 0.01, 0.99), f = Number(n.out_y ?? h.out_y);
  let w = D(Number(n.in_x ?? h.in_x), -0.99, -0.01), v = Number(n.in_y ?? h.in_y);
  if (s === "aligned") {
    const b = Math.hypot(u, f) || 1e-6, y = Math.hypot(w, v) || 1e-6;
    w = -u / b * y, v = -f / b * y;
  }
  return { out_x: u, out_y: f, in_x: w, in_y: v, mode: s };
}
function _t(e, t) {
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
  const s = n || _t(e, t), { leftIndex: i, left: l, right: c } = s, d = i > 0 ? e[i - 1] : null, m = i + 2 < e.length ? e[i + 2] : null, p = Math.max(1, c.frame - l.frame), h = D((t - l.frame) / p, 0, 1);
  let u = r(l), f = r(c);
  if (o) {
    const b = ((f - u + 540) % 360 + 360) % 360 - 180;
    f = u + b;
  }
  if (l.interpolation === "bezier" || c.interpolation === "bezier") {
    const b = Bt(l, a, d, c, r), y = Bt(c, a, l, m, r), C = u, S = u + (b.out_y || 0), A = f + (y.in_y || 0), g = f, x = D(Number(b.out_x ?? 1 / 3), 0, 1), E = D(1 + Number(y.in_x ?? -1 / 3), 0, 1);
    let G = 0, F = 1;
    for (let It = 0; It < 32; It++) {
      const Y = (G + F) * 0.5, Ze = 1 - Y;
      3 * Ze * Ze * Y * x + 3 * Ze * Y * Y * E + Y * Y * Y < h ? G = Y : F = Y;
    }
    const X = (G + F) * 0.5, re = 1 - X;
    return re * re * re * C + 3 * re * re * X * S + 3 * re * X * X * A + X * X * X * g;
  }
  const v = tn(h, l.interpolation);
  return u + (f - u) * v;
}
const on = 0.01, nn = 1e4;
function le() {
  return {
    position: [6, 4, 6],
    target: [0, 1.5, 0],
    fov: 35,
    roll: 0,
    camera_type: "perspective",
    zoom: 1,
    near: on,
    far: nn
  };
}
function Le() {
  const e = [0, 1, 0], t = (a, r = [0, 1, 0], o = "orthographic") => ({ ...le(), position: a, target: [...e], up: r, camera_type: o, zoom: 1 });
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
function me(e) {
  const t = e.size || [1, 1, 1], a = t.length === 2 ? [...t, 0.01] : [...t];
  return { position: [...e.position || [0, 0, 0]], rotation: [...e.rotation || [0, 0, 0]], size: a };
}
function Ue(e, t) {
  const a = e.keyframes || [];
  if (!a.length) return me(e);
  const r = me(e), o = (v, b) => (v.transform?.position || r.position)[b] ?? 0, n = (v, b) => (v.transform?.rotation || r.rotation)[b] ?? 0, s = (v, b) => (v.transform?.size || r.size)[b] ?? (b === 2 ? 0.01 : 1), i = _t(a, t), l = z(a, t, "pos_x", (v) => o(v, 0), !1, i), c = z(a, t, "pos_y", (v) => o(v, 1), !1, i), d = z(a, t, "pos_z", (v) => o(v, 2), !1, i), m = z(a, t, "rot_x", (v) => n(v, 0), !0, i), p = z(a, t, "rot_y", (v) => n(v, 1), !0, i), h = z(a, t, "rot_z", (v) => n(v, 2), !0, i), u = z(a, t, "scale_x", (v) => s(v, 0), !1, i), f = z(a, t, "scale_y", (v) => s(v, 1), !1, i), w = z(a, t, "scale_z", (v) => s(v, 2), !1, i);
  return {
    position: [Number.isFinite(l) ? l : r.position[0], Number.isFinite(c) ? c : r.position[1], Number.isFinite(d) ? d : r.position[2]],
    rotation: [Number.isFinite(m) ? m : r.rotation[0], Number.isFinite(p) ? p : r.rotation[1], Number.isFinite(h) ? h : r.rotation[2]],
    size: [
      Math.max(0.01, Number.isFinite(u) ? u : r.size[0]),
      Math.max(0.01, Number.isFinite(f) ? f : r.size[1]),
      Math.max(0.01, Number.isFinite(w) ? w : r.size[2])
    ]
  };
}
function Gi(e = "balanced", t = "all_views", a = null) {
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
  let i = 0.65, l = 0.72, c = 0.82;
  if (typeof a == "string" && a.startsWith("#")) {
    const p = a.replace("#", "");
    p.length === 6 && (i = parseInt(p.slice(0, 2), 16) / 255, l = parseInt(p.slice(2, 4), 16) / 255, c = parseInt(p.slice(4, 6), 16) / 255);
  }
  const d = 0.618033988749895, m = 0.324717957244746;
  for (let p = 0; p < o; p++) {
    const h = p * d % 1, u = p * m % 1, f = (p + 0.5) * 0.7548776662466927 % 1;
    let w = 0, v = 0, b = 0, y = 0.65, C = 0.72, S = 0.82;
    if (t === "ground_focus")
      if (h < 0.6) {
        const A = 0.4 + Math.sqrt(u) * 24, g = f * Math.PI * 2 + p * 2.399963229728653;
        w = Math.cos(g) * A, b = Math.sin(g) * A, v = 0.01 + h * 0.75, y = 0.86, C = 0.9, S = 0.98;
      } else {
        const A = 1 + Math.sqrt(u) * 18, g = f * Math.PI * 2 + p * 2.399963229728653;
        w = Math.cos(g) * A, b = Math.sin(g) * A, v = 0.75 + (h - 0.6) * 8.5, y = 0.62, C = 0.7, S = 0.82;
      }
    else if (t === "dome") {
      const A = h * Math.PI * 2, g = 1 - 2 * u, x = Math.sqrt(Math.max(0, 1 - g * g)), E = 1.5 + Math.cbrt(f) * 20;
      w = Math.cos(A) * x * E, b = Math.sin(A) * x * E, v = Math.max(0.01, g * E * 0.75 + 2.5), y = 0.72, C = 0.78, S = 0.88;
    } else {
      const A = p % 4;
      if (A === 0) {
        const g = 0.3 + Math.sqrt(u) * 28, x = p * 2.399963229728653;
        w = Math.cos(x) * g, b = Math.sin(x) * g, v = 0.01 + f * 0.34, y = 0.9, C = 0.94, S = 1;
      } else if (A === 1) {
        const g = 0.6 + Math.sqrt(u) * 18, x = p * 2.399963229728653;
        w = Math.cos(x) * g, b = Math.sin(x) * g, v = 0.35 + f * 3.15, y = 0.68, C = 0.76, S = 0.86;
      } else if (A === 2) {
        const g = 2 + Math.sqrt(u) * 24, x = p * 2.399963229728653;
        w = Math.cos(x) * g, b = Math.sin(x) * g, v = 3.5 + f * 11.5, y = 0.55, C = 0.65, S = 0.78;
      } else {
        const g = 0.5 + u * 6.5, x = p * 2.399963229728653;
        w = Math.cos(x) * g, b = Math.sin(x) * g, v = 0.05 + f * 4.95, y = 0.8, C = 0.86, S = 0.94;
      }
    }
    n.push(w, v, b), s.push(a ? y * i : y, a ? C * l : C, a ? S * c : S);
  }
  return { points: n, colors: s };
}
function sn() {
  const e = le(), t = [{ frame: 0, camera: q(e), interpolation: "ease" }];
  return {
    schema_version: 1,
    fps: 24,
    duration_frames: 120,
    width: 1280,
    height: 720,
    render_mode: "omni_ref",
    camera: e,
    keyframes: t,
    cameras: [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: q(e), keyframes: t }],
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
    guide_capture_style: "auto",
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
    editor_views: Le(),
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
    outliner_height: I.outlinerHeight.default,
    preview_width: I.previewWidth.default,
    side_width: I.sideWidth.default,
    left_width: I.leftWidth.default,
    graph_height: I.graphHeight.default,
    assets_height: I.assetsHeight.default,
    agent_height: I.agentHeight.default,
    health_profile: "generic",
    motion_layers: [],
    selected_motion_layer_id: null,
    motion_tool: "select",
    sequence: fo()
  };
}
function q(e) {
  const t = le();
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
const Te = {
  maxCameras: 16,
  maxObjects: 256,
  maxKeysPerTrack: 1e4,
  maxDurationFrames: 14400
}, I = {
  // The Outliner list gets an explicit height the handle drives directly, so
  // dragging it down enlarges the visible box (the node grows to match) rather
  // than just shifting a cramped inner scrollbar. The ceiling is only a sanity
  // bound against a corrupt workflow, not a layout limit the user will hit.
  outlinerHeight: { default: 220, min: 90, max: 1600 },
  previewWidth: { default: 236, min: 150, max: 760 },
  sideWidth: { default: 280, min: 200, max: 640 },
  leftWidth: { default: 264, min: 214, max: 520 },
  graphHeight: { default: 220, min: 140, max: 720 },
  // The ASSETS and AGENT tabs of the left panel get the same drag-to-resize
  // treatment as the Scene outliner above, so every tab in that panel behaves
  // consistently rather than singling the outliner out.
  assetsHeight: { default: 340, min: 120, max: 1600 },
  agentHeight: { default: 220, min: 90, max: 1600 }
};
function $(e, t, a, r) {
  if (e == null || e === "") return t;
  const o = Number(e);
  return Number.isFinite(o) ? D(o, a, r) : t;
}
function qi(e) {
  const t = sn();
  if (!e || typeof e != "object") return t;
  const a = { ...t, ...e };
  a.fps = Math.round($(a.fps, 24, 1, 120)), a.duration_frames = Math.round($(a.duration_frames, 120, 1, Te.maxDurationFrames)), a.width = Math.round($(a.width, 1280, 64, 4096)), a.height = Math.round($(a.height, 720, 64, 4096));
  const r = (d, m) => (Array.isArray(d) ? d : []).slice(0, Te.maxKeysPerTrack).map((p) => ({
    frame: Math.max(0, Math.round(Number(p.frame || 0))),
    camera: q(p.camera || p || m),
    interpolation: Ft.includes(p.interpolation) ? p.interpolation : "ease",
    ...p.tangents && typeof p.tangents == "object" ? { tangents: { ...p.tangents } } : {},
    ...Array.isArray(p.references) ? { references: p.references.map((h) => ({ ...h })) } : {},
    ...Jo(p)
  })), o = q(a.camera || t.camera);
  let n = r(a.keyframes, o);
  n = [...new Map(n.map((d) => [d.frame, d])).values()].sort((d, m) => d.frame - m.frame), n.length || (n = [{ frame: 0, camera: q(o), interpolation: "ease" }]);
  const s = Array.isArray(a.cameras) && a.cameras.length ? a.cameras : [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: o, keyframes: n }], i = /* @__PURE__ */ new Set();
  a.cameras = s.slice(0, Te.maxCameras).map((d, m) => {
    let p = String(d?.id || `camera_${m + 1}`);
    i.has(p) && (p = `camera_${m + 1}`), i.add(p);
    const h = q(d?.camera || d?.keyframes?.[0]?.camera || o);
    let u = r(d?.keyframes, h);
    return u = [...new Map(u.map((f) => [f.frame, f])).values()].sort((f, w) => f.frame - w.frame), u.length || (u = [{ frame: 0, camera: q(h), interpolation: "ease" }]), {
      id: p,
      name: String(d?.name || `Camera ${m + 1}`),
      color: fe(d?.color),
      camera: h,
      keyframes: u,
      target_object_id: typeof d?.target_object_id == "string" ? d.target_object_id : typeof a.target_object_id == "string" ? a.target_object_id : null,
      target_offset: Array.isArray(d?.target_offset) ? d.target_offset.map(Number) : [0, 0, 0],
      // Bone the camera aims at inside the tracked model; null tracks it whole.
      aim_bone: typeof d?.aim_bone == "string" && d.aim_bone ? d.aim_bone : null,
      locked: !!d?.locked,
      muted: !!d?.muted,
      solo: !!d?.solo,
      recording_path: typeof d?.recording_path == "string" ? d.recording_path : ""
    };
  }), a.active_camera_id = a.cameras.some((d) => d.id === a.active_camera_id) ? a.active_camera_id : a.cameras[0].id, a.sequence = ho(a.sequence, a.cameras.map((d) => d.id)), a.playblast_camera_id = a.playblast_camera_id === po && a.sequence.cuts.length || a.cameras.some((d) => d.id === a.playblast_camera_id) ? a.playblast_camera_id : a.active_camera_id;
  const l = a.cameras.find((d) => d.id === a.active_camera_id);
  a.camera = l.camera, a.keyframes = l.keyframes, a.target_object_id = l.target_object_id || null, a.target_offset = l.target_offset || [0, 0, 0], a.aim_bone = l.aim_bone || null, a.objects = (Array.isArray(a.objects) ? a.objects : t.objects).slice(0, Te.maxObjects).map((d) => ({
    ...d,
    color: fe(d?.color),
    locked: !!d.locked,
    parent_id: typeof d.parent_id == "string" ? d.parent_id : null,
    position: Array.isArray(d.position) ? d.position.map(Number) : [0, 0, 0],
    rotation: Array.isArray(d.rotation) ? d.rotation.map(Number) : [0, 0, 0],
    size: Array.isArray(d.size) ? d.size.length === 2 ? [...d.size.map(Number), 0.01] : d.size.map(Number) : [1, 1, 1],
    material_mode: ["textured", "checker", "neutral", "wireframe", "wireframe_texture", "wireframe_neutral", "matte"].includes(d.material_mode) ? d.material_mode : "textured",
    ...d?.intensity !== void 0 ? { intensity: Number.isFinite(Number(d.intensity)) ? Math.max(0, Number(d.intensity)) : d.type === "sun_light" ? 2.2 : 2 } : {},
    ...d?.cast_shadow !== void 0 ? { cast_shadow: !!d.cast_shadow } : {},
    ...d?.cone_angle !== void 0 ? { cone_angle: D(Number(d.cone_angle) || 45, 1, 90) } : {},
    ...d?.penumbra !== void 0 ? { penumbra: D(Number(d.penumbra) || 0.25, 0, 1) } : {},
    // Machine-semantic tags and the visible viewport label are additive fields
    // (design spec sections 12-14); drop them entirely when empty so an
    // untouched object serialises byte-identical to before.
    ...d?.tags !== void 0 ? { tags: nt(d.tags) } : {},
    ...Nt(d?.annotation) ? { annotation: Nt(d.annotation) } : {},
    // A rigged-character block (rig_profile + FK pose); dropped when absent so
    // a plain model still serialises identically (design spec sections 10, 26).
    ...d?.character ? { character: $o(d.character) } : {},
    keyframes: (Array.isArray(d.keyframes) ? d.keyframes : []).map((m) => ({
      frame: Math.max(0, Math.round(Number(m.frame || 0))),
      transform: me(m.transform || d),
      interpolation: Ft.includes(m.interpolation) ? m.interpolation : "ease",
      ...m.tangents && typeof m.tangents == "object" ? { tangents: { ...m.tangents } } : {}
    })).sort((m, p) => m.frame - p.frame)
  })), a.gizmo_mode = ["translate", "rotate", "scale"].includes(a.gizmo_mode) ? a.gizmo_mode : "translate", a.gizmo_space = a.gizmo_space === "local" ? "local" : "world", a.navigation_profile = ["maya", "blender", "simple"].includes(a.navigation_profile) ? a.navigation_profile : "simple", a.spatial_snap_mode = ["none", "grid", "vertex"].includes(a.spatial_snap_mode) ? a.spatial_snap_mode : "none", a.spatial_grid_size = D(Number(a.spatial_grid_size) || 0.5, 0.01, 100), a.ui_density = ["basic", "animation", "advanced"].includes(a.ui_density) ? a.ui_density : "animation", a.select_mode = ["object", "vertex", "edge", "face"].includes(a.select_mode) ? a.select_mode : "object", a.show_grid = a.show_grid !== !1, a.show_camera_paths = a.show_camera_paths !== !1, a.show_camera_gizmos = a.show_camera_gizmos !== !1, a.show_look_at = a.show_look_at !== !1, a.show_helper_axes = a.show_helper_axes !== !1, a.show_gizmo = a.show_gizmo !== !1, a.show_wireframe = !!a.show_wireframe, a.show_vertices = !!a.show_vertices, a.backface_culling = !!a.backface_culling, a.point_density = ["none", "0", "sparse", "balanced", "dense", "ultra"].includes(a.point_density) ? a.point_density : "balanced", a.point_spread = ["all_views", "ground_focus", "dome"].includes(a.point_spread) ? a.point_spread : "all_views", a.point_color = fe(a.point_color, "#cbd5e1"), a.viewport_bg_color = fe(a.viewport_bg_color, "#121212"), a.viewport_bg_image = typeof a.viewport_bg_image == "string" ? a.viewport_bg_image : "", a.viewport_bg_sequence = Array.isArray(a.viewport_bg_sequence) ? a.viewport_bg_sequence.map(String) : [], a.snap_enabled = a.snap_enabled !== !1, a.snap_frames = Math.max(1, Math.round(Number(a.snap_frames) || 1)), a.timecode_mode = ["time", "timecode"].includes(a.timecode_mode) ? a.timecode_mode : "time", a.loop_playback = !!a.loop_playback, a.playback_range = Array.isArray(a.playback_range) && a.playback_range.length === 2 ? [D(Math.round(Number(a.playback_range[0]) || 0), 0, a.duration_frames - 1), D(Math.round(Number(a.playback_range[1]) || a.duration_frames - 1), 0, a.duration_frames - 1)] : null, a.markers = (Array.isArray(a.markers) ? a.markers : []).filter((d) => d && Number.isFinite(Number(d.frame))).map((d, m) => ({ frame: Math.max(0, Math.round(Number(d.frame))), name: String(d.name || `Marker ${m + 1}`).slice(0, 40), color: fe(d.color, "#f2d06b") })), a.preview_layout = ["auto", "1", "2", "4"].includes(String(a.preview_layout)) ? String(a.preview_layout) : "auto", a.outliner_height = Math.round($(a.outliner_height, I.outlinerHeight.default, I.outlinerHeight.min, I.outlinerHeight.max)), a.preview_width = Math.round($(a.preview_width, I.previewWidth.default, I.previewWidth.min, I.previewWidth.max)), a.side_width = Math.round($(a.side_width, I.sideWidth.default, I.sideWidth.min, I.sideWidth.max)), a.left_width = Math.round($(a.left_width, I.leftWidth.default, I.leftWidth.min, I.leftWidth.max)), a.graph_height = Math.round($(a.graph_height, I.graphHeight.default, I.graphHeight.min, I.graphHeight.max)), a.assets_height = Math.round($(a.assets_height, I.assetsHeight.default, I.assetsHeight.min, I.assetsHeight.max)), a.agent_height = Math.round($(a.agent_height, I.agentHeight.default, I.agentHeight.min, I.agentHeight.max)), a.maximized_camera_id = typeof a.maximized_camera_id == "string" ? a.maximized_camera_id : null, a.safe_areas = !!a.safe_areas, a.resolution_gate = !!a.resolution_gate, a.aspect_ratio = ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"].includes(a.aspect_ratio) ? a.aspect_ratio : "auto", a.auto_key = !!a.auto_key, a.playblast_grid = !!a.playblast_grid, a.playblast_labels = !!a.playblast_labels, a.playblast_resolution = ["viewport", "half", "output", "double"].includes(a.playblast_resolution) ? a.playblast_resolution : "output", a.playblast_quality = ["low", "balanced", "high"].includes(a.playblast_quality) ? a.playblast_quality : "balanced", a.reference_index = Math.max(0, Number(a.reference_index || 0)), a.view_mode = ["camera", "perspective", "iso", "front", "back", "top", "right", "left", "bottom"].includes(a.view_mode) ? a.view_mode : "perspective", a.camera_view_visible = a.camera_view_visible !== !1, a.reconstruction_appearance = ["neutral", "source_texture"].includes(a.reconstruction_appearance) ? a.reconstruction_appearance : "source_texture";
  const c = Le();
  return a.editor_views = Object.fromEntries(Object.entries(c).map(([d, m]) => [d, q(a.editor_views?.[d] || m)])), So(a);
}
function xe(e, t) {
  const [a, r, o] = (t || [0, 0, 0]).map((l) => l * Math.PI / 180);
  let [n, s, i] = e;
  return [s, i] = [s * Math.cos(a) - i * Math.sin(a), s * Math.sin(a) + i * Math.cos(a)], [n, i] = [n * Math.cos(r) + i * Math.sin(r), -n * Math.sin(r) + i * Math.cos(r)], [n, s] = [n * Math.cos(o) - s * Math.sin(o), n * Math.sin(o) + s * Math.cos(o)], [n, s, i];
}
function Fe(e = [0, 0, 0]) {
  const [t, a, r] = e.map((d) => d * Math.PI / 360), o = Math.cos(t), n = Math.sin(t), s = Math.cos(a), i = Math.sin(a), l = Math.cos(r), c = Math.sin(r);
  return [n * s * l + o * i * c, o * i * l - n * s * c, o * s * c + n * i * l, o * s * l - n * i * c];
}
function ln(e, t) {
  return [e[3] * t[0] + e[0] * t[3] + e[1] * t[2] - e[2] * t[1], e[3] * t[1] - e[0] * t[2] + e[1] * t[3] + e[2] * t[0], e[3] * t[2] + e[0] * t[1] - e[1] * t[0] + e[2] * t[3], e[3] * t[3] - e[0] * t[0] - e[1] * t[1] - e[2] * t[2]];
}
function wa(e, [t, a, r, o]) {
  const [n, s, i] = e, l = o * n + a * i - r * s, c = o * s + r * n - t * i, d = o * i + t * s - a * n, m = -t * n - a * s - r * i;
  return [l * o - m * t - c * r + d * a, c * o - m * a - d * t + l * r, d * o - m * r - l * a + c * t];
}
function cn([e, t, a, r]) {
  const o = 1 - 2 * (t * t + a * a), n = 2 * (e * t - a * r), s = 2 * (e * a + t * r), i = 1 - 2 * (e * e + a * a), l = 2 * (t * a - e * r), c = 2 * (t * a + e * r), d = 1 - 2 * (e * e + t * t), m = Math.asin(Math.max(-1, Math.min(1, s))), [p, h] = Math.abs(s) < 0.9999999 ? [Math.atan2(-l, d), Math.atan2(-n, o)] : [Math.atan2(c, i), 0];
  return [p, m, h].map((u) => u * 180 / Math.PI);
}
function Ca(e, t) {
  const a = t.quaternion || Fe(t.rotation), r = ln(a, e.quaternion || Fe(e.rotation));
  return { position: M(wa(e.position.map((o, n) => o * t.size[n]), a), t.position), rotation: cn(r), quaternion: r, size: e.size.map((o, n) => o * t.size[n]) };
}
function dn(e, t) {
  const a = new Map(e.map((o) => [o.id, o])), r = (o, n = /* @__PURE__ */ new Set()) => {
    const s = { ...me(o), quaternion: Fe(o.rotation) };
    if (!o?.id || n.has(o.id)) return s;
    const i = o.parent_id ? a.get(o.parent_id) : null;
    if (!i) return s;
    const l = new Set(n);
    return l.add(o.id), Ca(s, r(i, l));
  };
  return r(t);
}
function St(e, t, a, r = /* @__PURE__ */ new Set()) {
  const o = Ue(t, a);
  if (!t?.id || r.has(t.id)) return o;
  const n = new Set(r);
  n.add(t.id);
  const s = t.parent_id ? e.find((l) => l.id === t.parent_id) : null;
  if (!s) return o;
  const i = St(e, s, a, n);
  return Ca(o, i);
}
const Kt = ["speed", "angular_speed", "acceleration", "jerk"], Je = ["ok", "warn", "over"], Ma = 0.8, mn = [0, 1.5, 0];
function Vt(e, t) {
  const a = [0];
  for (let r = 1; r < e.length; r++) a.push(Math.abs(e[r] - e[r - 1]) * t);
  return a;
}
function un(e, t) {
  const a = [0];
  for (let r = 1; r < e.length; r++) {
    const o = e[r - 1].position, n = e[r].position;
    a.push(Math.sqrt((n[0] - o[0]) ** 2 + (n[1] - o[1]) ** 2 + (n[2] - o[2]) ** 2) * t);
  }
  return a;
}
function pn(e, t) {
  const a = [0];
  for (let r = 1; r < e.length; r++) {
    const o = H(e[r - 1]), n = H(e[r]), s = ["right", "up", "forward"].reduce(
      (l, c) => l + o[c][0] * n[c][0] + o[c][1] * n[c][1] + o[c][2] * n[c][2],
      0
    ), i = Math.max(-1, Math.min(1, (s - 1) * 0.5));
    a.push(Math.acos(i) * 180 / Math.PI * t);
  }
  return a;
}
function fn(e, t = null) {
  if (t) return t.map(Number);
  const a = (e.objects || []).find((r) => r?.id === "subject");
  return Array.isArray(a?.position) ? a.position.slice(0, 3).map(Number) : [...mn];
}
function hn(e, t, a, r) {
  return e.map((o) => {
    const n = V(t, o, a, r);
    return !!(n && n[0] >= 0 && n[0] < a && n[1] >= 0 && n[1] < r);
  });
}
function Gt(e, t) {
  return t == null || t <= 0 ? "ok" : e > t ? "over" : e > t * Ma ? "warn" : "ok";
}
function qt(e) {
  for (let t = Je.length - 1; t >= 0; t--) if (e.includes(Je[t])) return Je[t];
  return "ok";
}
function gn(e, t) {
  return e.length === t.length && e.every((a, r) => a === t[r]);
}
function yn(e, t) {
  const a = [];
  for (let r = 0; r < e.length; r++) {
    const o = [...t[r]].sort(), n = a[a.length - 1];
    if (n && n.grade === e[r] && gn(n.metrics, o)) {
      n.end = r;
      continue;
    }
    a.push({ start: r, end: r, grade: e[r], metrics: o });
  }
  return a;
}
function xa(e, t = {}, a = null, r = "generic") {
  const o = Math.max(1, Number(e.fps) || 24), n = Math.max(1, Number(e.duration_frames) || 1), s = Math.max(1, Number(e.width) || 1280), i = Math.max(1, Number(e.height) || 720), l = [];
  for (let g = 0; g < n; g++) l.push(de(e, g, e.objects));
  const c = un(l, o), d = pn(l, o), m = Vt(c, o), p = Vt(m, o), h = { speed: c, angular_speed: d, acceleration: m, jerk: p }, u = fn(e, a), f = hn(l, u, s, i), w = l.map((g) => g.fov), v = t.allow_framing_loss === !0, b = [], y = [];
  for (let g = 0; g < n; g++) {
    const x = [], E = [];
    for (const G of Kt) {
      const F = Gt(h[G][g], t[`max_${G}`]);
      x.push(F), F !== "ok" && E.push(G);
    }
    !f[g] && !v && (x.push("over"), E.push("framing_loss")), b.push(qt(x)), y.push(E);
  }
  const C = f.filter((g) => !g).length, S = {
    profile: r,
    warn_ratio: Ma,
    limits: t,
    subject: u,
    duration_frames: n,
    fps: o,
    max_speed: Math.max(...c),
    max_angular_speed: Math.max(...d),
    max_acceleration: Math.max(...m),
    max_jerk: Math.max(...p),
    max_fov_change: Math.max(...w) - Math.min(...w),
    framing_loss_frames: C,
    series: h,
    framing: f,
    frame_grades: b,
    segments: yn(b, y),
    violations: []
  };
  for (const g of [...Kt, "fov_drift"]) {
    const x = g === "fov_drift" ? "max_fov_change" : `max_${g}`, E = t[x];
    E != null && S[x] > Number(E) && S.violations.push({ metric: x, value: S[x], recommended_max: Number(E) });
  }
  C && !v && S.violations.push({ metric: "framing_loss_frames", value: C, recommended_max: 0 });
  const A = Gt(S.max_fov_change, t.max_fov_change);
  return S.track_grades = { fov_drift: A }, S.grade = qt([...b, A]), S.trajectory_valid = S.violations.length === 0, S.ok = S.trajectory_valid, S;
}
function bn(e) {
  return e.segments.filter((t) => t.grade !== "ok").sort((t, a) => (a.grade === "over") - (t.grade === "over") || a.end - a.start - (t.end - t.start));
}
function st(e, t) {
  const a = Math.max(1, e.state.duration_frames - 1), r = D(Number(e.timelineZoom) || 1, 0.1, 50), o = Number(e.timelinePan) || 0, n = a / r;
  return (t - o) / Math.max(1e-6, n) * 100;
}
function ka(e, t, a) {
  const r = a.getBoundingClientRect(), o = Math.max(1, e.state.duration_frames - 1), n = D(Number(e.timelineZoom) || 1, 0.1, 50), s = Number(e.timelinePan) || 0, i = o / n, l = (t.clientX - r.left) / Math.max(1, r.width);
  return D(Math.round(s + l * i), 0, o);
}
function Hi(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = Math.max(1, e.state.duration_frames - 1), r = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey)
    e.timelinePan = D((Number(e.timelinePan) || 0) + (t.deltaY > 0 ? 4 : -4), -a * 0.5, a);
  else {
    const n = t.currentTarget.getBoundingClientRect(), s = (t.clientX - n.left) / Math.max(1, n.width), i = D(Number(e.timelineZoom) || 1, 0.2, 30), l = D(i * r, 0.2, 30), c = a / i, d = a / l, m = (Number(e.timelinePan) || 0) + s * c;
    e.timelinePan = D(m - s * d, -a * 0.5, a), e.timelineZoom = l;
  }
  e.refreshKeys(), e.setStatus(_("Timeline zoom: {value1}%", { value1: (e.timelineZoom * 100).toFixed(0) }));
}
function Wi(e) {
  e.timelineZoom = 1, e.timelinePan = 0, e.refreshKeys(), e.setStatus(_("Timeline view fitted"));
}
function $i(e, t) {
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
  e.selectedKeyFrames = null, e.timelineDrag = { box: a, pointerId: t.pointerId }, e.setFrame(ka(e, t, a));
}
function Ui(e, t) {
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
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.setFrame(ka(e, t, e.timelineDrag.box), !1, !1));
}
function Xi(e, t) {
  if (e.timelinePanDrag && t.pointerId === e.timelinePanDrag.pointerId) {
    e.timelinePanDrag = null;
    return;
  }
  if (e.boxSelect && t.pointerId === e.boxSelect.pointerId) {
    t.preventDefault(), t.stopPropagation();
    const a = e.boxSelect.box.getBoundingClientRect(), r = Math.max(1, e.state.duration_frames - 1), o = D(Number(e.timelineZoom) || 1, 0.1, 50), n = Number(e.timelinePan) || 0, s = r / o, i = (m) => D(n + m / Math.max(1, a.width) * s, 0, r), l = Math.min(i(e.boxSelect.startX), i(e.boxSelect.currentX)), c = Math.max(i(e.boxSelect.startX), i(e.boxSelect.currentX));
    e.boxSelect.overlay?.remove(), e.boxSelect = null;
    const d = e.timelineKeyframes().filter((m) => m.frame >= l && m.frame <= c).map((m) => m.frame);
    d.length && (e.selectedKeyFrames = new Set(d), e.selectedKeyFrame = d[0], e.updateKeyVisualState(), e.refreshKeyEditor(), e.setStatus(_("{value1} keys selected", { value1: d.length })));
    return;
  }
  !e.timelineDrag || t.pointerId !== e.timelineDrag.pointerId || (t.preventDefault(), t.stopPropagation(), e.timelineDrag.box.hasPointerCapture?.(t.pointerId) && e.timelineDrag.box.releasePointerCapture(t.pointerId), e.timelineDrag = null, e.refreshKeys());
}
const vn = 4;
function _n(e, t) {
  const a = e.keyDrag;
  if (!a) return;
  if (!a.engaged) {
    if (Math.hypot(t.clientX - (a.startClientX ?? t.clientX), t.clientY - (a.startClientY ?? t.clientY)) < vn) return;
    a.engaged = !0, e.suppressKeyClick = !0;
  }
  a.historyCheckpointed || (e.checkpoint?.("Move keyframe"), a.historyCheckpointed = !0);
  const r = a.box.getBoundingClientRect(), o = Math.max(1, e.state.duration_frames - 1), n = D(Number(e.timelineZoom) || 1, 0.1, 50), s = Number(e.timelinePan) || 0, i = o / n;
  let l = Math.round(D(s + (t.clientX - r.left) / Math.max(1, r.width) * i, 0, o));
  l = e.snapFrame(l);
  const c = l - a.startPointerFrame;
  let d = a.badge;
  d || (d = document.createElement("div"), d.className = "floating-retime-badge", a.box.appendChild(d), a.badge = d);
  const m = st(e, l);
  if (d.style.left = `${m}%`, d.textContent = a.isDuplicate ? `+Copy F${l}` : `F${l}${c !== 0 ? ` (${c > 0 ? "+" : ""}${c})` : ""}`, a.moving && a.moving.length > 1) {
    if (c === a.lastDelta) return;
    a.lastDelta = c;
    const p = e.timelineKeyframes(), h = new Set(a.moving.map((b) => b.key)), u = p.filter((b) => !h.has(b)).map((b) => b.frame), f = Math.max(0, e.state.duration_frames - 1);
    let w = 0;
    if (c > 0) {
      let b = 1 / 0;
      for (const y of a.moving) {
        b = Math.min(b, f - y.startFrame);
        for (const C of u)
          C > y.startFrame && (b = Math.min(b, C - 1 - y.startFrame));
      }
      w = Math.max(0, Math.min(c, b));
    } else if (c < 0) {
      let b = 1 / 0;
      for (const y of a.moving) {
        b = Math.min(b, y.startFrame - 0);
        for (const C of u)
          C < y.startFrame && (b = Math.min(b, y.startFrame - (C + 1)));
      }
      w = Math.min(0, Math.max(c, -Math.max(0, b)));
    }
    const v = a.moving.map((b) => b.startFrame + w);
    a.moving.forEach((b, y) => {
      b.key.frame = v[y];
    }), p.sort((b, y) => b.frame - y.frame), e.selectedKeyFrames = new Set(v), e.selectedKeyFrame = a.key.frame, e.editingKeyFrame = a.key.frame, e.scheduleSerialize(), e.setFrame(a.key.frame, !1, !0);
    return;
  }
  l !== a.key.frame && (e.editingKeyFrame = a.key.frame, e.retimeSelectedKey(l, !0, { checkpoint: !1 }));
}
function Sn(e, t) {
  const a = e.camera?.position || [0, 0, 0], r = t.camera?.position || [0, 0, 0];
  return Math.sqrt((r[0] - a[0]) ** 2 + (r[1] - a[1]) ** 2 + (r[2] - a[2]) ** 2);
}
function Be(e) {
  return (e || []).map((t) => ({
    ...t,
    camera: { ...t.camera || {}, position: [...t.camera?.position || []], target: [...t.camera?.target || []] }
  }));
}
function wn(e, t) {
  const a = Be(e);
  if (a.length < 3 || t < 2) return a;
  const r = [0];
  for (let l = 1; l < a.length; l++)
    r.push(r[l - 1] + Sn(a[l - 1], a[l]));
  const o = r[r.length - 1];
  if (o <= 1e-9) return a;
  const n = a[0].frame ?? 0, s = (a[a.length - 1].frame ?? t) - n;
  if (s <= 0) return a;
  let i = n;
  for (let l = 1; l < a.length - 1; l++) {
    const c = n + Math.round(s * (r[l] / o));
    a[l].frame = Math.min(t - 1, Math.max(i + 1, c)), i = a[l].frame;
  }
  return a;
}
function Aa(e, t) {
  return t.some((a) => e >= a.start && e <= a.end);
}
function Ta(e, t, a = 0.6) {
  const r = Be(e), o = Math.min(1, Math.max(0, Number(a) || 0));
  if (!o || r.length < 3 || !t?.length) return r;
  const n = Be(r);
  for (let s = 1; s < r.length - 1; s++)
    if (Aa(r[s].frame ?? 0, t))
      for (const i of ["position", "target"]) {
        const l = [r[s - 1], r[s], r[s + 1]].map((m) => m.camera?.[i]).filter((m) => Array.isArray(m) && m.length >= 3), c = r[s].camera?.[i];
        if (l.length < 3 || !Array.isArray(c)) continue;
        const d = [0, 1, 2].map((m) => l.reduce((p, h) => p + Number(h[m] || 0), 0) / l.length);
        n[s].camera[i] = c.map((m, p) => Number(m) + (d[p] - Number(m)) * o);
      }
  return n;
}
function Cn(e, t, a) {
  const r = Be(e);
  if (!t?.length || !Array.isArray(a)) return r;
  const o = a.slice(0, 3).map(Number);
  for (const n of r)
    Aa(n.frame ?? 0, t) && (n.camera.target = [...o]);
  return r;
}
function Mn(e, t) {
  return e.segments.filter((a) => a.grade !== "ok" && a.metrics.includes(t)).map((a) => ({ start: a.start, end: a.end }));
}
function xn(e) {
  return e.segments.filter((t) => t.grade !== "ok").map((t) => ({ start: t.start, end: t.end }));
}
function Xe(e) {
  return {
    speed: _("Travel speed"),
    angular_speed: _("Rotation speed"),
    acceleration: _("Acceleration"),
    jerk: _("Jerk"),
    framing_loss: _("Subject out of frame"),
    fov_drift: _("FOV change")
  }[e] || e;
}
function kn(e) {
  return {
    ok: _("Within limits"),
    warn: _("Near the limit"),
    over: _("Over the limit")
  }[e] || e;
}
let De = null, it = null;
function An(e) {
  it = e;
}
async function Yi() {
  if (De) return De;
  try {
    if (!it) return null;
    const e = await it.fetchApi("/majoor/omnicam/motion_profiles");
    return e.ok ? (De = await e.json(), De) : null;
  } catch {
    return null;
  }
}
function Tn(e) {
  return e.root.querySelector('[data-role="health-profile"]')?.value || e.state?.health_profile || "generic";
}
function Dn(e, t) {
  const a = e.motionProfiles?.profiles?.find((r) => r.id === t);
  return a ? a.limits : null;
}
function ue(e) {
  const t = Tn(e), a = Dn(e, t);
  return a ? xa(e.state, a, null, t) : null;
}
function Ht(e) {
  return Number(e).toFixed(Math.abs(e) >= 100 ? 0 : 1);
}
function jn(e) {
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
function he(e, t, a, r) {
  const o = a == null ? _("no limit") : `${Ht(t)} / ${Ht(a)}`, n = a != null && a > 0, s = n ? Math.min(100, Math.round(t / a * 100)) : 0, i = r === "over" ? "var(--oc-danger)" : r === "warn" ? "var(--oc-warn)" : "var(--oc-ok)";
  return `
    <div class="oc-health-metric" data-grade="${r}">
      <div class="oc-health-metric-row">
        <span class="oc-health-dot"></span>
        <span class="oc-health-metric-name">${Xe(e)}</span>
        <span class="oc-health-metric-value">${o}</span>
      </div>
      ${n ? `
      <div class="oc-health-bar-track">
        <div class="oc-health-bar-fill" style="width:${s}%;background:${i}"></div>
      </div>` : ""}
    </div>`;
}
function je(e, t, a) {
  return t == null || t <= 0 ? "ok" : e > t ? "over" : e > t * a ? "warn" : "ok";
}
function En(e) {
  const t = bn(e);
  return t.length ? t.slice(0, 6).map((a) => {
    const r = a.metrics.map((n) => Xe(n)).join(", "), o = a.start === a.end ? _("Frame {frame}").replace("{frame}", String(a.start)) : _("Frames {start}-{end}").replace("{start}", String(a.start)).replace("{end}", String(a.end));
    return `
      <div class="oc-health-zone-row" style="display:flex;align-items:center;gap:4px">
        <button type="button" class="oc-health-zone" data-grade="${a.grade}" data-zone-start="${a.start}"
                title="${_("Jump the playhead to this zone")}">
          <span class="oc-health-dot"></span><span class="oc-health-zone-range">${o}</span>
          <span class="oc-health-zone-reason">${r}</span>
        </button>
        <button type="button" class="icon-button oc-zone-smooth-btn" data-act="health-smooth-zone"
                data-zone-start="${a.start}" data-zone-end="${a.end}"
                title="${_("Smooth keys in this zone only")}" style="flex:0 0 24px;height:24px;padding:0">
          <i class="pi pi-chart-line" style="font-size:10px"></i>
        </button>
      </div>`;
  }).join("") : `<div class="oc-health-empty">${_("No problem zone on this shot.")}</div>`;
}
function In(e) {
  const t = e.root.querySelector('[data-role="health-body"]'), a = e.root.querySelector('[data-role="health-badge"]'), r = e.root.querySelector('[data-role="health-score-badge"]');
  if (!t || !a) return;
  if (!e.motionProfiles) {
    a.className = "oc-health-badge", a.textContent = _("Unavailable"), r && (r.textContent = "--"), t.innerHTML = `<div class="oc-health-empty">${_("Could not load the recommended limits from the OmniCam server. The panel will not guess a threshold.")}</div>`;
    return;
  }
  const o = ue(e);
  if (!o) return;
  e.healthReport = o;
  const { warn_ratio: n } = o;
  if (a.className = `oc-health-badge ${o.grade}`, a.textContent = kn(o.grade), r) {
    const { score: l, letter: c } = jn(o);
    r.textContent = `${l}% (${c})`, r.className = `oc-health-score-badge grade-${c.toLowerCase()}`;
  }
  const s = [
    he(
      "speed",
      o.max_speed,
      o.limits.max_speed,
      je(o.max_speed, o.limits.max_speed, n)
    ),
    he(
      "angular_speed",
      o.max_angular_speed,
      o.limits.max_angular_speed,
      je(o.max_angular_speed, o.limits.max_angular_speed, n)
    ),
    he(
      "acceleration",
      o.max_acceleration,
      o.limits.max_acceleration,
      je(o.max_acceleration, o.limits.max_acceleration, n)
    ),
    he(
      "jerk",
      o.max_jerk,
      o.limits.max_jerk,
      je(o.max_jerk, o.limits.max_jerk, n)
    ),
    he("fov_drift", o.max_fov_change, o.limits.max_fov_change, o.track_grades.fov_drift)
  ].join(""), i = o.framing_loss_frames ? `<div class="oc-health-metric" data-grade="over">
         <div class="oc-health-metric-row">
           <span class="oc-health-dot"></span>
           <span class="oc-health-metric-name">${Xe("framing_loss")}</span>
           <span class="oc-health-metric-value">${_("{count} frames").replace("{count}", String(o.framing_loss_frames))}</span>
         </div>
       </div>` : "";
  t.innerHTML = `
    <div class="oc-health-metrics">${s}${i}</div>
    <div class="oc-section">${_("Problem zones")}</div>
    <div class="oc-health-zones" data-role="health-zones">${En(o)}</div>
    <div class="oc-card-actions oc-health-actions">
      <button data-act="health-slow" title="${_("Respace the keys so the shot travels at a constant speed")}"><i class="pi pi-clock"></i> ${_("Slow to limits")}</button>
      <button data-act="health-smooth" title="${_("Blend the keys inside the flagged zones only")}"><i class="pi pi-chart-line"></i> ${_("Smooth flagged")}</button>
      <button data-act="health-recenter" title="${_("Aim the keys of the flagged zones back at the subject")}"><i class="pi pi-crosshairs"></i> ${_("Recenter subject")}</button>
      <button data-act="health-timing" title="${_("Open the Graph Editor on camera timing weights")}"><i class="pi pi-sliders-h"></i> ${_("Inspect Timing")}</button>
    </div>
    <p class="oc-health-note">${_("A valid trajectory stays inside the limits recommended for this model. It is not a guarantee about the generated video.")}</p>`;
}
function Zi(e, t) {
  if (!t || !e.motionProfiles) return;
  const a = ue(e);
  if (a) {
    e.healthReport = a;
    for (const r of a.segments) {
      if (r.grade === "ok") continue;
      const o = st(e, r.start), n = st(e, r.end + 1);
      if (n < -5 || o > 105) continue;
      const s = document.createElement("div");
      s.className = "oc-health-band", s.dataset.grade = r.grade, s.style.left = `${o}%`, s.style.width = `${Math.max(0.4, n - o)}%`, s.title = r.metrics.map((i) => Xe(i)).join(", "), t.appendChild(s);
    }
  }
}
function ke(e, t, a, r) {
  const o = e.activeCameraTrack();
  o && (e.checkpoint(a), o.keyframes = t, e.state.keyframes = t, e.syncActiveCameraTrack(), e.refreshKeys(), e.setFrame(e.frame, !1, !1), e.setStatus(r), In(e));
}
function Qi(e) {
  const t = ue(e);
  if (!t) return;
  const a = t.limits.max_speed;
  if (!a) {
    e.setStatus(_("This profile sets no speed limit."));
    return;
  }
  const r = Math.max(1, e.state.duration_frames - 1), o = wn(e.state.keyframes, r), n = xa({ ...e.state, keyframes: o }, t.limits, null, t.profile);
  if (n.max_speed <= a) {
    ke(e, o, "Slow to limits", _("Speed flattened; the shot keeps its length."));
    return;
  }
  const s = n.max_speed / a * (e.state.duration_frames / Math.max(1, e.state.fps));
  ke(e, o, "Slow to limits", _("Speed flattened, still over: this path needs about {seconds}s to fit the limit.").replace("{seconds}", s.toFixed(1)));
}
function Ji(e) {
  const t = ue(e);
  if (!t) return;
  const a = xn(t);
  if (!a.length) {
    e.setStatus(_("Nothing is flagged on this shot."));
    return;
  }
  const r = Ta(e.state.keyframes, a, 0.6);
  ke(
    e,
    r,
    "Smooth flagged zones",
    _("Smoothed {count} flagged zone(s).").replace("{count}", String(a.length))
  );
}
function el(e) {
  const t = ue(e);
  if (!t) return;
  const a = Mn(t, "framing_loss");
  if (!a.length) {
    e.setStatus(_("The subject stays in frame on this shot."));
    return;
  }
  const r = Cn(e.state.keyframes, a, t.subject);
  ke(
    e,
    r,
    "Recenter subject",
    _("Recentred {count} zone(s) on the subject.").replace("{count}", String(a.length))
  );
}
function tl(e, t, a) {
  if (!ue(e)) return;
  const o = Ta(e.state.keyframes, [{ start: t, end: a }], 0.6);
  ke(
    e,
    o,
    "Smooth zone",
    _("Smoothed zone ({start}-{end}).").replace("{start}", String(t)).replace("{end}", String(a))
  );
}
const On = {
  "3D assets": "Objets 3D",
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
  "Unsaved changes": "Modifications non enregistrées",
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
  Cube: "Cube",
  "Currently selected for editing": "Actuellement sélectionné pour l'édition",
  "Curve view fitted": "Vue des courbes cadrée",
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
  Grid: "Grille",
  "Guide Capture Style: the material/lighting recipe recorded into the playblast, independent of Proxy mode": "Style de capture du guide : recette de matériaux/éclairage enregistrée dans le playblast, indépendante du mode proxy",
  "Guide: Auto": "Guide : Auto",
  "Guide: Motion Proxy": "Guide : Proxy de mouvement",
  "Guide: Clay": "Guide : Argile",
  "Guide: Depth Rich": "Guide : Profondeur enrichie",
  Timeline: "Timeline",
  Ground: "Sol",
  "Ground + Low Angle": "Sol + contre-plongée",
  Torus: "Tore",
  "Proxy preset": "Préréglage du proxy",
  "Clean proxy": "Proxy propre",
  "Debug motion": "Mouvement (débogage)",
  "Cinematic view": "Vue cinématique",
  "Camera Shake": "Secousses caméra",
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
  "OmniCam Help": "Aide OmniCam",
  "Orbit 360°": "Orbite 360°",
  "Orbit: MMB · Pan: Shift+MMB · Dolly: Scroll · Fly: WASD / QE": "Orbite : clic milieu · Panoramique : Maj+clic milieu · Travelling : molette · Vol : WASD / QE",
  Orthographic: "Orthographique",
  Output: "Sortie",
  "Output & diagnostics": "Sortie et diagnostics",
  "Over the shoulder frame": "Cadre par-dessus l'épaule",
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
  "Per-object/camera keyframe sheet": "Feuille de clés par objet/caméra",
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
  "Proxy / Shading Mode: Visual conditioning reference for generative video models and scene staging": "Mode Proxy / Ombrage : référence de conditionnement visuel pour modèles vidéo génératifs et mise en scène",
  "AI Video Reference": "Référence vidéo IA",
  "Omni Ref (Card + Grid + Depth)": "Omni Ref (Carte + Grille + Profondeur)",
  "Card + Grid (Clean Reference)": "Carte + Grille (Référence épurée)",
  "Point Field (Wan ATI Trajectories)": "Champ de points (Trajectoires Wan ATI)",
  "Layout & Geometry": "Mise en scène & Géométrie",
  "Clay Blockout (Neutral Massing)": "Blockout Clay (Volumes neutres)",
  "Wireframe (Mesh Structure)": "Fil de fer (Structure du maillage)",
  "Grid Only (Camera Motion)": "Grille seule (Mouvement caméra)",
  Presentation: "Présentation",
  "Beauty (Studio Lit)": "Beauty (Studio éclairé)"
}, Pn = {
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
  "The proxy communicates camera motion, not final appearance. Delivery profiles and model targets are compiled in OmniCam Monitor.": "Le proxy transmet le mouvement de caméra, pas l'aspect final. Les profils de diffusion et les cibles de modèle sont compilés dans OmniCam Monitor.",
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
  "Drag to resize the Timeline/Graph/Sequence area — double-click to reset": "Glisser pour redimensionner la zone Timeline/Courbes/Séquence — double-clic pour réinitialiser",
  "Resize the Timeline/Graph/Sequence area": "Redimensionner la zone Timeline/Courbes/Séquence",
  "Drag to resize the assets grid — double-click to reset": "Glisser pour redimensionner la grille d'assets — double-clic pour réinitialiser",
  "Resize the assets grid": "Redimensionner la grille d'assets",
  "Drag to resize the Agent panel — double-click to reset": "Glisser pour redimensionner le panneau Agent — double-clic pour réinitialiser",
  "Resize the Agent panel": "Redimensionner le panneau Agent",
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
  "Smooth keys": "Lisser les clés",
  "Smooth motion across selected keys": "Lisser le mouvement sur les clés sélectionnées",
  "Smoothed {n} keyframes": "{n} images-clés lissées",
  "Select at least 2 keyframes to smooth": "Sélectionnez au moins 2 images-clés à lisser",
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
  Object: "Objet",
  "Timing / Speed": "Timing / Vitesse",
  "Time Weight (higher = slower)": "Poids temporel (plus élevé = plus lent)",
  "Timing preset": "Preset de timing",
  Constant: "Constant",
  Strength: "Intensité",
  "Blend the timing preset with the currently authored weights": "Mélanger le preset de timing avec les poids actuellement définis",
  "Bake Timing Weights into camera keyframe times": "Appliquer les poids temporels aux temps des clés caméra",
  "Apply Remap": "Appliquer le remap",
  "Timing remap is camera-only.": "Le remap temporel s'applique uniquement à la caméra.",
  "Add an interior camera key for a speed ramp; a two-key move uses segment interpolation.": "Ajoutez une clé caméra intermédiaire pour créer une rampe de vitesse ; un mouvement à deux clés utilise l'interpolation du segment.",
  "Not enough frame slots to redistribute these keys.": "Pas assez d'images disponibles pour redistribuer ces clés.",
  "Time remap could not be applied.": "Le remap temporel n'a pas pu être appliqué.",
  "Camera time remap applied.": "Remap temporel de la caméra appliqué.",
  "Inspecting camera timing.": "Inspection du timing caméra.",
  "Open the Graph Editor on camera timing weights": "Ouvrir le Graph Editor sur les poids temporels de la caméra",
  "Camera is locked": "Caméra verrouillée",
  "No active camera": "Aucune caméra active",
  "Inspect Timing": "Inspecter le timing",
  // Director Agent tab (design spec section 32)
  'Describe the shot... ex: "the camera slowly orbits the character while zooming in on the face"': "Décrivez le plan… ex : « la caméra tourne lentement autour du personnage en zoomant sur le visage »",
  Provider: "Fournisseur",
  "Loading providers...": "Chargement des fournisseurs…",
  "No providers found": "Aucun fournisseur trouvé",
  Model: "Modèle",
  "Loading models...": "Chargement des modèles…",
  "No models found": "Aucun modèle trouvé",
  "Refresh model list": "Actualiser la liste des modèles",
  "Planning stays on the configured local Ollama endpoint.": "La planification reste sur le point de terminaison Ollama local configuré.",
  "Planning stays on the configured local endpoint.": "La planification reste sur le point de terminaison local configuré.",
  "Your instruction and the semantic scene information requested by the planner are sent to the configured model provider. Media files are not sent by Agent v1.": "Votre instruction et les informations sémantiques de la scène demandées par le planificateur sont envoyées au fournisseur de modèle configuré. Les fichiers média ne sont pas envoyés par l'Agent v1.",
  "Set credential": "Définir la clé d'accès",
  "Remove credential": "Supprimer la clé d'accès",
  "Test connection": "Tester la connexion",
  "Paste API key...": "Coller la clé API…",
  "(no model set)": "(aucun modèle défini)",
  "Agent session is not ready yet.": "La session de l'Agent n'est pas encore prête.",
  "Applied.": "Appliqué.",
  "Apply failed": "Échec de l'application",
  "Applying...": "Application en cours…",
  Configured: "Configurée",
  "Configured by server environment": "Configurée par l'environnement du serveur",
  "Connection OK": "Connexion OK",
  "Connection failed": "Échec de la connexion",
  "Could not remove the credential": "Impossible de supprimer la clé d'accès",
  "Could not save the credential": "Impossible d'enregistrer la clé d'accès",
  "No visible changes": "Aucun changement visible",
  "Not configured": "Non configurée",
  "Planning...": "Planification en cours…",
  "Preview failed": "Échec de l'aperçu",
  "Preview was truncated; Apply is disabled for safety.": "L'aperçu a été tronqué ; l'application est désactivée par sécurité.",
  "Status unavailable": "Statut indisponible",
  "Testing...": "Test en cours…",
  "The Agent finished without a change.": "L'Agent a terminé sans changement.",
  "The Director changed after this preview. Generate a new preview.": "Le Director a changé depuis cet aperçu. Générez un nouvel aperçu.",
  "Path key": "Clé de trajectoire",
  "{count} keys selected": "{count} clés sélectionnées",
  "Smooth {n} keys": "Lisser {n} clés"
}, Nn = {
  "{value} (from Director)": "{value} (depuis Director)",
  "{source} connected · {playblast}": "{source} connecté · {playblast}",
  "Playblast: {name}": "Playblast : {name}",
  "No playblast": "Aucun playblast",
  "⚠ Playblast outdated (re-record before compiling)": "⚠ Playblast périmé (réenregistrez-le avant de compiler)",
  "● Director playblast": "● Playblast de Director",
  "{count} frames": "{count} images",
  "⚠ Director connected, no playblast recorded yet — showing the live viewport.": "⚠ Director connecté, aucun playblast enregistré — affichage de la vue en direct.",
  "LIVE — WOULD BLOCK": "APERÇU — BLOQUANT",
  "CONNECTED — waiting for upstream execution. Queue the workflow once to see a preflight.": "CONNECTÉ — en attente d’exécution en amont. Lancez le workflow pour afficher les vérifications.",
  WAITING: "EN ATTENTE",
  "Connect a MotionScene and queue the workflow.": "Connectez une MotionScene et lancez le workflow.",
  "OmniCam playblast playback": "Lecture du playblast OmniCam",
  "No playblast preview": "Aucun aperçu du playblast",
  "Connected playblast preview": "Aperçu du playblast connecté",
  "Play or pause playblast": "Lire ou mettre le playblast en pause",
  Play: "Lire",
  "Playblast frame": "Image du playblast",
  Loop: "Boucle",
  Mute: "Muet",
  "Profile preflight": "Vérification du profil",
  "Queue the workflow to validate the selected profile.": "Lancez le workflow pour valider le profil sélectionné.",
  "Compilation target": "Cible de compilation",
  Profile: "Profil",
  "Connect a Motion Scene and Playblast Video output to this Monitor node to compile with an H3 profile.": "Connectez les sorties Motion Scene et Playblast Video à ce Monitor pour compiler avec un profil H3.",
  "Base prompt": "Prompt de base",
  Width: "Largeur",
  Height: "Hauteur",
  "Duration (seconds)": "Durée (secondes)",
  "auto (from shot)": "auto (depuis le plan)",
  Profiles: "Profils",
  "Loading the Monitor profile catalogue.": "Chargement du catalogue des profils Monitor.",
  "Installed capabilities": "Fonctionnalités installées",
  "Capability report available after execution.": "Rapport des fonctionnalités disponible après exécution.",
  "Execution output": "Résultat de l’exécution",
  "OUTPUT NOT EXECUTED": "AUCUNE EXÉCUTION",
  "No preflight checks returned.": "Aucune vérification retournée.",
  "No optional downstream capability detected.": "Aucune fonctionnalité optionnelle détectée.",
  "No Monitor profile is available.": "Aucun profil Monitor disponible.",
  "LIVE PREVIEW": "APERÇU EN DIRECT",
  "NO OUTPUT": "AUCUN RÉSULTAT",
  "OUTPUT GENERATED": "RÉSULTAT GÉNÉRÉ",
  BLOCKED: "BLOQUÉ",
  READY: "PRÊT",
  CONNECTED: "CONNECTÉ",
  "OUTPUT OUTDATED": "RÉSULTAT PÉRIMÉ",
  "Monitor profile information unavailable.": "Informations des profils Monitor indisponibles.",
  Target: "Cible",
  "External / Generic Reference Video": "Vidéo de référence externe / générique",
  "Maximize workbench": "Agrandir l’espace de travail",
  "Close workbench": "Fermer l’espace de travail",
  "Motion Proxy": "Proxy de mouvement",
  "Clay / White Model": "Argile / modèle blanc",
  "Depth Rich": "Profondeur enrichie",
  "Beauty Reference": "Référence beauté",
  Passthrough: "Passthrough",
  Diagnostic: "Diagnostic",
  "Compilation Diff": "Diff de compilation",
  "No mapping-quality diagnostics yet.": "Aucun diagnostic de qualité de correspondance pour l’instant.",
  "Guide Health": "Santé du guide",
  "No guide-health warnings yet.": "Aucun avertissement de santé du guide pour l’instant.",
  "Guide reference index": "Index de référence du guide",
  "Guide style": "Style du guide",
  "Reference Role Matrix": "Matrice des rôles de référence",
  "Declare references OmniCam does not own the media for (an identity image, an action video...). Compiled into the prompt alongside the OmniCam guide.": "Déclarez des références dont OmniCam ne possède pas le média (une image d’identité, une vidéo d’action...). Compilées dans le prompt aux côtés du guide OmniCam.",
  "No additional references declared.": "Aucune référence supplémentaire déclarée.",
  "Add reference": "Ajouter une référence",
  id: "id",
  "Roles this reference is declared for": "Rôles déclarés pour cette référence",
  "Roles this reference explicitly does not carry": "Rôles explicitement exclus pour cette référence",
  "Remove reference": "Supprimer la référence",
  recoverable: "récupérable",
  "No mapping-quality diagnostics for this compile.": "Aucun diagnostic de qualité de correspondance pour cette compilation.",
  "No guide-health warnings.": "Aucun avertissement de santé du guide.",
  "Compiled Prompt": "Prompt compilé",
  Copy: "Copier",
  Copied: "Copié",
  "Queue the workflow, or edit the connected Director live, to compile a prompt.": "Lancez le workflow, ou modifiez le Director connecté en direct, pour compiler un prompt."
}, Rn = {
  "+{count} more": "+{count} autres",
  "Mute or solo cameras to change which previews show here": "Masquez ou isolez des caméras pour choisir les aperçus affichés ici",
  "No path issues detected": "Aucun problème de trajectoire détecté",
  RIGGED: "RIG CONFIGURÉ",
  "No assets match this filter.": "Aucun élément ne correspond à ce filtre.",
  "Loading assets...": "Chargement des éléments…",
  "{n} of {total} assets": "{n} éléments sur {total}",
  "Add asset": "Ajouter l’élément",
  "Could not add the asset": "Impossible d’ajouter l’élément",
  "{name} added": "{name} ajouté",
  "Importing {name}...": "Importation de {name}…",
  "Imported {name}": "{name} importé",
  "Import failed": "Échec de l’importation",
  "OmniCam Director": "OmniCam Director",
  cameras: "caméras",
  objects: "objets",
  "Cannot close Director while a playblast is recording": "Impossible de fermer Director pendant l’enregistrement d’un playblast",
  "OPEN DIRECTOR": "OUVRIR DIRECTOR",
  "Layout reset to defaults": "Disposition par défaut rétablie",
  Source: "Source",
  Track: "Trajectoire",
  Solve: "Résolution",
  Refine: "Affiner",
  Select: "Sélectionner",
  Orbit: "Orbite",
  Pan: "Déplacement latéral",
  Dolly: "Travelling",
  Credential: "Identifiant d’accès",
  Save: "Enregistrer",
  "Describe the shot": "Décrivez le plan",
  "Planned changes": "Modifications prévues",
  Preview: "Aperçu",
  Apply: "Appliquer",
  Cancel: "Annuler",
  "Search assets...": "Rechercher des éléments…",
  "Search assets": "Rechercher des éléments",
  "Import GLB/FBX files with the upload action.": "Importez des fichiers GLB/FBX avec l’action de téléversement.",
  "Add to scene": "Ajouter à la scène",
  Outliner: "Hiérarchie",
  Agent: "Agent",
  "Restore every resizable panel to its default size": "Rétablir la taille par défaut de chaque panneau redimensionnable",
  "Reset Layout": "Réinitialiser la disposition",
  "Burn labels / annotations into the playblast": "Incruster les étiquettes et annotations dans le playblast",
  "Camera Path Presets — generate an editable path (Orbit, Dolly, Arc, ...)": "Préréglages de trajectoire — générer une trajectoire modifiable (orbite, travelling, arc…)",
  "Camera Path Presets": "Préréglages de trajectoire",
  "Viewport Labels": "Étiquettes de la vue",
  "Labels: Off": "Étiquettes : désactivées",
  "Labels: Selected": "Étiquettes : sélection",
  "Labels: All": "Étiquettes : toutes",
  "Label content": "Contenu de l’étiquette",
  Annotation: "Annotation",
  "Object Name": "Nom de l’objet",
  "Primary Tag": "Tag principal",
  "Could not set the motion": "Impossible de définir le mouvement",
  "No motion (static)": "Aucun mouvement (statique)",
  "No clips in this model": "Ce modèle ne contient aucun clip",
  "Map the rig before baking a pose": "Configurez le rig avant de figer une pose",
  "Baked current frame to pose": "Image courante figée en pose",
  "Clear the motion clip to edit the pose": "Retirez le clip de mouvement pour modifier la pose",
  "Toggle FK pose editing": "Activer ou désactiver l’édition de pose FK",
  "Standing Neutral": "Debout, neutre",
  "Could not set the joint": "Impossible de modifier l’articulation",
  "Save Pose": "Enregistrer la pose",
  "Pose name": "Nom de la pose",
  "Pose saved: {name}": "Pose enregistrée : {name}",
  "Could not save the pose": "Impossible d’enregistrer la pose",
  "— unmapped —": "— non associé —",
  "Humanoid v1 ✓ — all 22 joints mapped": "Humanoid v1 ✓ — les 22 articulations sont associées",
  "Incomplete — {n} joint(s) unmapped": "Incomplet — {n} articulation(s) non associée(s)",
  "Rig is complete": "Le rig est complet",
  "Rig still missing: {list}": "Éléments manquants du rig : {list}",
  "Instantiate this asset from the Asset Browser before mapping its rig": "Ajoutez cet élément depuis la bibliothèque avant de configurer son rig",
  "Rig mapping saved": "Associations du rig enregistrées",
  "Could not save the rig mapping": "Impossible d’enregistrer les associations du rig",
  "Path Component": "Composante de trajectoire",
  "Driven by Look At -- target editing is disabled": "Piloté par Look At — modification de la cible désactivée",
  "No free frame here to insert a key": "Aucune image libre ici pour insérer une clé",
  "Could not insert a key here": "Impossible d’insérer une clé ici",
  "Insert camera path key": "Insérer une clé de trajectoire caméra",
  "Camera path key inserted at frame {frame}": "Clé de trajectoire insérée à l’image {frame}",
  "Need at least two keys to redistribute timing": "Au moins deux clés sont nécessaires pour redistribuer le timing",
  "Not enough frame slots to redistribute this many keys": "Pas assez d’images disponibles pour redistribuer autant de clés",
  "Could not redistribute timing": "Impossible de redistribuer le timing",
  "Redistribute camera path timing": "Redistribuer le timing de la trajectoire caméra",
  "Camera path timing redistributed": "Timing de la trajectoire caméra redistribué",
  "Camera Path Preset": "Préréglage de trajectoire caméra",
  "Not enough frames in the playback range for this preset": "La plage de lecture ne contient pas assez d’images pour ce préréglage",
  "Could not generate that camera path preset": "Impossible de générer cette trajectoire prédéfinie",
  "Apply camera path preset": "Appliquer le préréglage de trajectoire",
  "{preset} camera path generated": "Trajectoire caméra {preset} générée",
  "Animated channel key indicator": "Indicateur de clé du canal animé",
  "Click and drag to scrub Focal Length": "Cliquez et faites glisser pour ajuster la focale",
  "Field of View": "Champ de vision",
  "Position key indicator": "Indicateur de clé de position",
  "Scrub X (Shift: 0.01x, Ctrl: 1.0x)": "Ajuster X (Maj : 0,01×, Ctrl : 1,0×)",
  "Scrub Y (Shift: 0.01x, Ctrl: 1.0x)": "Ajuster Y (Maj : 0,01×, Ctrl : 1,0×)",
  "Scrub Z (Shift: 0.01x, Ctrl: 1.0x)": "Ajuster Z (Maj : 0,01×, Ctrl : 1,0×)",
  "Target key indicator": "Indicateur de clé de cible",
  "Scrub Target X": "Ajuster la cible X",
  "Scrub Target Y": "Ajuster la cible Y",
  "Scrub Target Z": "Ajuster la cible Z",
  "Rotation key indicator": "Indicateur de clé de rotation",
  "Scrub Pitch X": "Ajuster le tangage X",
  "Scrub Yaw Y": "Ajuster le lacet Y",
  "Scrub Roll Z": "Ajuster le roulis Z",
  "Roll key indicator": "Indicateur de clé de roulis",
  "Click and drag to scrub Roll": "Cliquez et faites glisser pour ajuster le roulis",
  "Object position key indicator": "Indicateur de clé de position de l’objet",
  "Object rotation key indicator": "Indicateur de clé de rotation de l’objet",
  "Scrub Rot X": "Ajuster la rotation X",
  "Scrub Rot Y": "Ajuster la rotation Y",
  "Scrub Rot Z": "Ajuster la rotation Z",
  "Object scale key indicator": "Indicateur de clé d’échelle de l’objet",
  "Scrub Scale X": "Ajuster l’échelle X",
  "Scrub Scale Y": "Ajuster l’échelle Y",
  "Scrub Scale Z": "Ajuster l’échelle Z",
  Tags: "Tags",
  "hero, subject": "hero, subject",
  "Machine-semantic tags, comma separated": "Tags sémantiques pour les outils, séparés par des virgules",
  Label: "Étiquette",
  "Visible viewport label": "Étiquette visible dans la vue",
  "Label colour": "Couleur de l’étiquette",
  "Label anchor": "Ancrage de l’étiquette",
  Center: "Centre",
  Bottom: "Bas",
  "Rig Mapper": "Associations du rig",
  "Auto Map": "Association automatique",
  Validate: "Valider",
  "Save Mapping": "Enregistrer les associations",
  Pose: "Pose",
  "Pose preset": "Pose prédéfinie",
  "Edit Pose": "Modifier la pose",
  "Save the current pose": "Enregistrer la pose actuelle",
  "Save Pose…": "Enregistrer la pose…",
  Start: "Début",
  End: "Fin",
  Speed: "Vitesse",
  "Bake current frame to pose": "Figer l’image courante en pose",
  "Authoring preference used by Redistribute Timing; does not change playback speed by itself": "Préférence utilisée par la redistribution du timing ; ne modifie pas directement la vitesse de lecture",
  "Timing Weight": "Poids temporel",
  "Redistribute this camera's key timing across its current frame range using each key's Timing Weight": "Redistribuer les clés de cette caméra sur leur plage actuelle selon leur poids temporel",
  "Redistribute Timing": "Redistribuer le timing"
}, zn = {
  "Animation: {value1}": "Animation : {value1}",
  "Auto Key {value1}": "Clé automatique {value1}",
  "Bézier handles {value1}": "Poignées de Bézier {value1}",
  "Camera previews {value1}": "Aperçus des caméras {value1}",
  "Camera renamed: {value1}": "Caméra renommée : {value1}",
  "Camera: {value1}": "Caméra : {value1}",
  "Card: {value1}": "Carte : {value1}",
  "Click: set {value1} as primary · Double-click: edit · Right-click: preview actions": "Clic : définir {value1} comme caméra principale · Double-clic : modifier · Clic droit : actions d’aperçu",
  "Copy a {value1} keyframe first": "Copiez d’abord une clé de type {value1}",
  "Currently animating camera: {value1}": "Caméra animée : {value1}",
  "Currently animating object: {value1}": "Objet animé : {value1}",
  "Curve zoom: {value1}%": "Zoom des courbes : {value1} %",
  "Delete {value1} and its {value2} keyframe(s)?": "Supprimer {value1} et ses {value2} clé(s) ?",
  "Duplicating key from {value1}...": "Duplication de la clé de l’image {value1}…",
  "Editing: {value1}": "Édition : {value1}",
  "Encoding frame {value1}/{value2}…": "Encodage de l’image {value1}/{value2}…",
  "Fly speed: {value1}x": "Vitesse de vol : {value1}×",
  "Focused on {value1} at [{value2}]": "Cadrage de {value1} à [{value2}]",
  "Frame {value1} already has a keyframe": "L’image {value1} possède déjà une clé",
  "Frame {value1} · {value2} · Drag: Retime · Alt+Drag: Duplicate": "Image {value1} · {value2} · Glisser : déplacer · Alt+glisser : dupliquer",
  "Key @ {value1} interpolation set to {value2}": "Interpolation de la clé à {value1} définie sur {value2}",
  "Keyframe copied @ {value1}": "Clé copiée à {value1}",
  "Keyframe moved to {value1}": "Clé déplacée à {value1}",
  "Keyframe pasted @ {value1}": "Clé collée à {value1}",
  "Keyframe updated @ {value1}": "Clé mise à jour à {value1}",
  "Loaded keyframe @ {value1}": "Clé chargée à {value1}",
  "No {value1} key selected": "Aucune clé de type {value1} sélectionnée",
  "Object keyframe updated @ {value1}": "Clé de l’objet mise à jour à {value1}",
  "Object renamed: {value1}": "Objet renommé : {value1}",
  "Playblast failed: {value1}": "Échec du playblast : {value1}",
  "Playblast ready: {value1}": "Playblast prêt : {value1}",
  "Playblast: {value1}": "Playblast : {value1}",
  "Selected: {value1}": "Sélection : {value1}",
  "Solo channel {value1}": "Canal isolé : {value1}",
  "Tangent mode: {value1} @ {value2}": "Mode des tangentes : {value1} à {value2}",
  "Timeline zoom: {value1}%": "Zoom de la timeline : {value1} %",
  "Upstream 3D model: {value1}": "Modèle 3D en amont : {value1}",
  "Upstream audio: {value1}": "Audio en amont : {value1}",
  "Upstream {value1}": "Source en amont {value1}",
  "Upstream {value1}: {value2}": "Source en amont {value1} : {value2}",
  "View stored in keyframe @ {value1}": "Vue enregistrée dans la clé à {value1}",
  "View: {value1}{value2}": "Vue : {value1}{value2}",
  "{value1} Bézier tangent handles": "{value1} les poignées de tangentes de Bézier",
  "{value1} Key @ {value2}": "Clé de {value1} à {value2}",
  "{value1} added": "{value1} ajouté",
  "{value1} animation only: {value2} bones, no mesh · skeleton preview": "{value1} : animation seule, {value2} os, aucun maillage · aperçu du squelette",
  "{value1} animation reset": "Animation de {value1} réinitialisée",
  "{value1} deleted": "{value1} supprimé",
  "{value1} interpolation @ {value2}": "Interpolation {value1} à {value2}",
  "{value1} is locked": "{value1} est verrouillé",
  "{value1} key deleted @ {value2}": "Clé de {value1} supprimée à {value2}",
  "{value1} keyframe at frame {value2}": "Clé de {value1} à l’image {value2}",
  "{value1} keys selected": "{value1} clés sélectionnées",
  "{value1} loaded: {value2} mesh{value3}, {value4} vertices": "{value1} chargé : maillages : {value2}, sommets : {value4}",
  "{value1} parented to {value2}": "{value1} rattaché à {value2}",
  "{value1} selected": "{value1} sélectionné",
  "{value1} selected at [{value2}] · Press F to focus": "{value1} sélectionné à [{value2}] · Appuyez sur F pour cadrer",
  "{value1} unparented": "Parent de {value1} retiré",
  "{value1} {value2}": "{value1} {value2}",
  "{value1} {value2} @ {value3}": "{value1} : {value2} à {value3}",
  "{value1} · Keyframe @ F{value2} selected": "{value1} · Clé sélectionnée à l’image {value2}",
  "{value1} · Target aim selected": "{value1} · Cible de visée sélectionnée",
  "{value1}{value2} · {value3}": "{value1}{value2} · {value3}"
}, Ln = {
  ...zn,
  ...Rn,
  ...Nn,
  ...On,
  ...Pn
}, ee = ["OmniCam"], Da = "MajoorOmniCam.Locale", ja = "MajoorOmniCam.Defaults.Fps", Ea = "MajoorOmniCam.Defaults.DurationSeconds", Ia = "MajoorOmniCam.Defaults.Width", Oa = "MajoorOmniCam.Defaults.Height", Pa = "MajoorOmniCam.Defaults.RenderMode", Na = "MajoorOmniCam.Defaults.Encoder", Ra = "MajoorOmniCam.Defaults.PlayblastResolution", za = "MajoorOmniCam.Playblast.Quality", La = "MajoorOmniCam.Defaults.PlayblastGrid", Fa = "MajoorOmniCam.Defaults.PlayblastLabels", Ba = "MajoorOmniCam.Defaults.GuideCaptureStyle", Ka = "MajoorOmniCam.Proxy.PointDensity", Va = "MajoorOmniCam.Proxy.PointSpread", Ga = "MajoorOmniCam.Proxy.PointColor", qa = "MajoorOmniCam.Proxy.CardFit", Ha = "MajoorOmniCam.Viewport.Quality", Wa = "MajoorOmniCam.Viewport.Adaptive", $a = "MajoorOmniCam.Viewport.BackgroundColor", Ua = "MajoorOmniCam.Display.Grid", Xa = "MajoorOmniCam.Display.Radar", Ya = "MajoorOmniCam.Display.CameraPaths", Za = "MajoorOmniCam.Display.CameraGizmos", Qa = "MajoorOmniCam.Display.LookAt", Ja = "MajoorOmniCam.Display.HelperAxes", er = "MajoorOmniCam.Display.Gizmo", tr = "MajoorOmniCam.Display.Guides", ar = "MajoorOmniCam.Display.SafeAreas", rr = "MajoorOmniCam.Display.ResolutionGate", or = "MajoorOmniCam.Display.AspectRatio", nr = "MajoorOmniCam.Display.BurnIn", sr = "MajoorOmniCam.Display.SpeedHeatmap", ir = "MajoorOmniCam.Display.Wireframe", lr = "MajoorOmniCam.Display.Vertices", cr = "MajoorOmniCam.Tools.SelectMode", dr = "MajoorOmniCam.Tools.GizmoMode", mr = "MajoorOmniCam.Tools.GizmoSpace", ur = "MajoorOmniCam.Tools.SpatialSnapMode", pr = "MajoorOmniCam.Tools.SpatialGridSize", fr = "MajoorOmniCam.Navigation.Profile", hr = "MajoorOmniCam.Navigation.FlySpeed", gr = "MajoorOmniCam.Navigation.InvertOrbitY", yr = "MajoorOmniCam.Navigation.ZoomSensitivity", br = "MajoorOmniCam.Navigation.OrbitSensitivity", vr = "MajoorOmniCam.Navigation.PanSensitivity", _r = "MajoorOmniCam.Navigation.DollySensitivity", Sr = "MajoorOmniCam.Navigation.ViewMode", wr = "MajoorOmniCam.Controls.EnableShortcuts", Cr = "MajoorOmniCam.Timeline.SnapEnabled", Mr = "MajoorOmniCam.Timeline.SnapFrames", xr = "MajoorOmniCam.Timeline.AutoKey", kr = "MajoorOmniCam.Timeline.DefaultInterpolation", Ar = "MajoorOmniCam.Timeline.TimecodeMode", Tr = "MajoorOmniCam.Timeline.LoopPlayback", Dr = "MajoorOmniCam.Interface.Density", jr = "MajoorOmniCam.Interface.PreviewLayout", Er = "MajoorOmniCam.Interface.CameraPreviews", Ir = "MajoorOmniCam.History.Limit", Or = "MajoorOmniCam.Extractor.DefaultBackend", Pr = "MajoorOmniCam.Monitor.DefaultProfile", Nr = "MajoorOmniCam.Agent.Enabled", wt = "MajoorOmniCam.Agent.Provider", Wt = "MajoorOmniCam.Agent.Model", $t = "MajoorOmniCam.Agent.BaseUrl", Rr = "MajoorOmniCam.Agent.MaxOutputTokens", zr = "MajoorOmniCam.Agent.MaxPlannerSteps", Lr = "MajoorOmniCam.Agent.RequestTimeoutSeconds", Ke = [
  { id: "ollama", settingKey: "Ollama", label: "Ollama" },
  { id: "openai", settingKey: "OpenAI", label: "OpenAI" },
  { id: "openai_compatible", settingKey: "OpenAICompatible", label: "OpenAI-compatible" },
  { id: "anthropic", settingKey: "Anthropic", label: "Anthropic" }
];
function Fr(e) {
  return Ke.find((t) => t.id === e) || Ke[0];
}
function Ct(e) {
  return `MajoorOmniCam.Agent.${Fr(e).settingKey}.Model`;
}
function Mt(e) {
  return `MajoorOmniCam.Agent.${Fr(e).settingKey}.BaseUrl`;
}
function O(e, t, a, r, o) {
  return { id: e, category: [...ee, t, a], name: a, tooltip: r, type: "boolean", defaultValue: o };
}
function P(e, t, a, r, o, n) {
  return { id: e, category: [...ee, t, a], name: a, tooltip: r, type: "combo", options: o, defaultValue: n };
}
function B(e, t, a, r, o, n) {
  return { id: e, category: [...ee, t, a], name: a, tooltip: r, type: "slider", attrs: o, defaultValue: n };
}
function Ut(e, t, a, r, o = "") {
  return { id: e, category: [...ee, t, a], name: a, tooltip: r, type: "text", defaultValue: o };
}
function Fn({
  onLocaleChange: e,
  onQualityChange: t,
  onAdaptiveChange: a,
  onNavigationProfileChange: r,
  onUiDensityChange: o,
  onUndoLimitChange: n,
  onBgColorChange: s,
  onFlySpeedChange: i,
  onInvertOrbitYChange: l,
  onZoomSensitivityChange: c,
  onOrbitSensitivityChange: d,
  onPanSensitivityChange: m,
  onDollySensitivityChange: p,
  onCameraViewVisibleChange: h,
  onAgentEnabledChange: u
} = {}) {
  return [
    {
      id: Da,
      category: [...ee, "Language", "Viewport language"],
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
      ja,
      "Defaults",
      "Default FPS",
      "Frame rate applied to newly created Director nodes.",
      { min: 1, max: 120, step: 1 },
      24
    ),
    B(
      Ea,
      "Defaults",
      "Default duration (seconds)",
      "Timeline duration applied to newly created Director nodes.",
      { min: 1, max: 120, step: 1 },
      5
    ),
    B(
      Ia,
      "Defaults",
      "Default width",
      "Output width applied to newly created Director nodes.",
      { min: 64, max: 4096, step: 16 },
      1280
    ),
    B(
      Oa,
      "Defaults",
      "Default height",
      "Output height applied to newly created Director nodes.",
      { min: 64, max: 4096, step: 16 },
      720
    ),
    P(
      Pa,
      "Defaults",
      "Default proxy render mode",
      "Render mode applied to newly created Director nodes.",
      ["omni_ref", "graybox", "grid", "point_field", "wireframe", "card_grid", "beauty"],
      "omni_ref"
    ),
    P(
      Na,
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
      Ra,
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
    P(
      za,
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
    O(
      La,
      "Defaults",
      "Keep the grid in the playblast",
      "Records the floor grid into the playblast instead of hiding it for the capture.",
      !1
    ),
    O(
      Fa,
      "Defaults",
      "Burn labels / annotations into the playblast",
      "Paints the viewport Labels overlay onto the recorded frames (they are hidden by default for a clean capture).",
      !1
    ),
    P(
      Ba,
      "Defaults",
      "Default guide capture style",
      "Material/lighting recipe applied only while recording a playblast -- independent of Viewport Shading. 'Auto' records the current shading as-is.",
      [
        { text: "Auto", value: "auto" },
        { text: "Motion Proxy", value: "motion_proxy" },
        { text: "Clay / White Model", value: "clay" },
        { text: "Depth Rich", value: "depth_rich" }
      ],
      "auto"
    ),
    P(
      Ka,
      "Proxy",
      "Default point density",
      "Point count of the omni-reference point field.",
      ["none", "sparse", "balanced", "dense", "ultra"],
      "balanced"
    ),
    P(
      Va,
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
      id: Ga,
      category: [...ee, "Proxy", "Default point colour"],
      name: "Default point colour",
      tooltip: "Colour of the reference point field.",
      type: "color",
      defaultValue: "cbd5e1"
    },
    P(
      qa,
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
      id: Ha,
      category: [...ee, "Viewport", "Studio quality"],
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
      ...O(
        Wa,
        "Viewport",
        "Drop quality when the viewport stutters",
        "Steps the studio quality down automatically if navigation falls below ~40fps, and leaves it there for the session.",
        !0
      ),
      onChange: () => a?.()
    },
    {
      id: $a,
      category: [...ee, "Viewport", "Default background colour"],
      name: "Default background colour",
      tooltip: "Viewport background. Leave it at the default to keep the studio sky.",
      type: "color",
      defaultValue: "121212",
      onChange: (f) => s?.(f)
    },
    O(
      Ua,
      "Display",
      "Show grid by default",
      "Shows the viewport floor grid on newly created Director nodes.",
      !0
    ),
    O(
      Xa,
      "Display",
      "Show camera mini-map by default",
      "Shows the radar mini-map on newly created Director nodes.",
      !0
    ),
    O(
      Ya,
      "Display",
      "Show camera paths by default",
      "Shows camera trajectories on newly created Director nodes.",
      !0
    ),
    O(
      Za,
      "Display",
      "Show camera gizmos by default",
      "Shows camera bodies and frustums on newly created Director nodes.",
      !0
    ),
    O(
      Qa,
      "Display",
      "Show look-at targets by default",
      "Shows camera look-at lines and target crosshairs on newly created Director nodes.",
      !0
    ),
    O(
      Ja,
      "Display",
      "Show helper axes by default",
      "Shows null-object axis helpers on newly created Director nodes.",
      !0
    ),
    O(
      er,
      "Display",
      "Show transform gizmo by default",
      "Shows transform and axis gizmos on newly created Director nodes.",
      !0
    ),
    O(
      tr,
      "Display",
      "Show rule-of-thirds guides by default",
      "Shows the rule-of-thirds grid and centre crosshair in camera view.",
      !0
    ),
    O(
      ar,
      "Display",
      "Show safe areas by default",
      "Shows the 90% action-safe and 80% title-safe rectangles.",
      !1
    ),
    O(
      rr,
      "Display",
      "Show resolution gate by default",
      "Masks the viewport down to the node's output width x height.",
      !1
    ),
    P(
      or,
      "Display",
      "Default aspect ratio",
      "Framing ratio used by the resolution gate. 'Auto' follows the node output.",
      ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"],
      "auto"
    ),
    O(
      nr,
      "Display",
      "Show burn-in data by default",
      "Overlays frame, fps, FOV and render mode along the bottom of the viewport.",
      !1
    ),
    O(
      sr,
      "Display",
      "Show speed map by default",
      "Colours the camera path by travel speed.",
      !1
    ),
    O(
      ir,
      "Display",
      "Show wireframe by default",
      "Draws mesh edges over scene objects. Skinned models follow their animation.",
      !1
    ),
    O(
      lr,
      "Display",
      "Show mesh vertices by default",
      "Draws mesh vertices as points over scene objects.",
      !1
    ),
    P(
      cr,
      "Tools",
      "Default selection mode",
      "Component level the viewport selects at.",
      ["object", "vertex", "edge", "face"],
      "object"
    ),
    P(
      dr,
      "Tools",
      "Default transform mode",
      "Transform the gizmo starts in.",
      ["translate", "rotate", "scale"],
      "translate"
    ),
    P(
      mr,
      "Tools",
      "Default gizmo space",
      "World-aligned axes, or the selected object's own orientation.",
      ["world", "local"],
      "world"
    ),
    P(
      ur,
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
      pr,
      "Tools",
      "Default snap grid size",
      "Grid increment used by spatial grid snapping, in scene units.",
      { min: 0.01, max: 10, step: 0.01 },
      0.5
    ),
    {
      ...P(
        fr,
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
      ...B(
        hr,
        "Navigation",
        "Default fly speed",
        "WASD / QE fly speed applied to newly created Director nodes.",
        { min: 0.05, max: 5, step: 0.05 },
        1
      ),
      onChange: (f) => i?.(f)
    },
    {
      ...O(
        gr,
        "Navigation",
        "Invert vertical orbit (Invert Y)",
        "Invert the vertical axis when orbiting the viewport.",
        !1
      ),
      onChange: (f) => l?.(f)
    },
    {
      ...B(
        yr,
        "Navigation",
        "Mouse wheel zoom sensitivity",
        "Multiplier for mouse wheel zoom speed in the viewport.",
        { min: 0.2, max: 3, step: 0.1 },
        1
      ),
      onChange: (f) => c?.(f)
    },
    {
      ...B(
        br,
        "Navigation",
        "Orbit rotation sensitivity",
        "Multiplier for camera orbit rotation speed in the viewport.",
        { min: 0.2, max: 3, step: 0.1 },
        1
      ),
      onChange: (f) => d?.(f)
    },
    {
      ...B(
        vr,
        "Navigation",
        "Pan sensitivity",
        "Multiplier for viewport pan gestures.",
        { min: 0.2, max: 3, step: 0.1 },
        1
      ),
      onChange: (f) => m?.(f)
    },
    {
      ...B(
        _r,
        "Navigation",
        "Dolly drag sensitivity",
        "Multiplier for middle-button and Alt-drag dolly gestures.",
        { min: 0.2, max: 3, step: 0.1 },
        1
      ),
      onChange: (f) => p?.(f)
    },
    P(
      Sr,
      "Navigation",
      "Default view",
      "View a newly created Director node opens in.",
      ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"],
      "perspective"
    ),
    O(
      wr,
      "Controls",
      "Enable OmniCam shortcuts",
      "Lets OmniCam consume viewport and timeline keyboard shortcuts while a Director is focused.",
      !0
    ),
    O(
      Cr,
      "Timeline",
      "Enable timeline snapping by default",
      "Snaps dragged keyframes to the frame increment below.",
      !0
    ),
    B(
      Mr,
      "Timeline",
      "Default timeline snap",
      "Frame increment used by timeline snapping on newly created Director nodes.",
      { min: 1, max: 24, step: 1 },
      1
    ),
    O(
      xr,
      "Timeline",
      "Enable Auto Key by default",
      "Enables Auto Key on newly created Director nodes.",
      !1
    ),
    P(
      kr,
      "Timeline",
      "Default key interpolation",
      "Interpolation mode assigned to newly created camera and object keyframes.",
      ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold"],
      "ease"
    ),
    P(
      Ar,
      "Timeline",
      "Default time display",
      "Elapsed time, or HH:MM:SS:FF timecode.",
      [
        { text: "Time (mm:ss.ms)", value: "time" },
        { text: "Timecode (hh:mm:ss:ff)", value: "timecode" }
      ],
      "time"
    ),
    O(
      Tr,
      "Timeline",
      "Loop playback by default",
      "Restarts playback at the first frame instead of stopping at the last.",
      !1
    ),
    {
      ...P(
        Dr,
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
    P(
      jr,
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
      ...O(
        Er,
        "Interface",
        "Show camera previews by default",
        "Opens newly created Director nodes with the camera preview strip visible.",
        !0
      ),
      onChange: (f) => h?.(f)
    },
    {
      ...B(
        Ir,
        "History",
        "Undo history limit",
        "Maximum number of Undo steps held by each Director editor.",
        { min: 10, max: 500, step: 10 },
        100
      ),
      onChange: (f) => n?.(f)
    },
    P(
      Or,
      "Defaults",
      "Default extractor tracker",
      "Default tracking backend for OmniCam Extractor.",
      [
        { text: "DPVO (Dense Point-Visual Odometry)", value: "dpvo" },
        { text: "PyColmap (SfM feature matching)", value: "pycolmap" }
      ],
      "dpvo"
    ),
    P(
      Pr,
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
    ),
    {
      ...O(
        Nr,
        "Agent",
        "Enable built-in Agent",
        "Enables the OmniCam Director Agent panel. The external Agent Contract v1 bridge is a separate concern and stays available either way.",
        !0
      ),
      onChange: () => u?.()
    },
    P(
      wt,
      "Agent",
      "Provider",
      "Provider used by the built-in Director Agent.",
      [
        { text: "Ollama / local", value: "ollama" },
        { text: "OpenAI", value: "openai" },
        { text: "OpenAI-compatible / local", value: "openai_compatible" },
        { text: "Anthropic", value: "anthropic" }
      ],
      "ollama"
    ),
    ...Ke.flatMap((f) => [
      Ut(
        Ct(f.id),
        "Agent",
        `${f.label} model`,
        `Model id used by the Agent planner when Provider is set to ${f.label}.`
      ),
      Ut(
        Mt(f.id),
        "Agent",
        `${f.label} base URL`,
        `Optional endpoint override used when Provider is set to ${f.label}.`
      )
    ]),
    B(
      Rr,
      "Agent",
      "Max output tokens",
      "Maximum provider output budget.",
      { min: 512, max: 32768, step: 512 },
      4096
    ),
    B(
      zr,
      "Agent",
      "Max planner steps",
      "Maximum bounded Agent iterations.",
      { min: 1, max: 12, step: 1 },
      6
    ),
    B(
      Lr,
      "Agent",
      "Provider timeout",
      "Maximum provider request duration.",
      { min: 15, max: 300, step: 5 },
      120
    )
  ];
}
const Br = Fn({
  onLocaleChange: () => Kr(),
  onQualityChange: (e) => Yt(e),
  onAdaptiveChange: () => Yt(),
  onAgentEnabledChange: () => Hn()
});
let xt = null;
function L(e, t) {
  try {
    const a = xt?.extensionManager?.setting?.get(e);
    return a ?? t;
  } catch {
    return t;
  }
}
function ve(e, t) {
  try {
    xt?.extensionManager?.setting?.set?.(e, t);
  } catch (a) {
    console.warn("OmniCam: writeSetting failed", e, t, a);
  }
}
function al(e, t) {
  return L(e, t);
}
function rl() {
  for (const e of Br)
    e.defaultValue !== void 0 && (ve(e.id, e.defaultValue), e.onChange?.(e.defaultValue));
}
function K(e, t, a, r, o = !1) {
  const n = Number(L(e, t)), s = Number.isFinite(n) ? Math.min(r, Math.max(a, n)) : t;
  return o ? Math.round(s) : s;
}
function N(e, t) {
  const a = L(e, t);
  return typeof a == "boolean" ? a : t;
}
function R(e, t, a) {
  const r = String(L(e, t));
  return a.includes(r) ? r : t;
}
function Xt(e, t) {
  const a = String(L(e, t) || "").trim(), r = a.startsWith("#") ? a.slice(1) : a;
  return /^[0-9a-fA-F]{6}$/.test(r) ? `#${r.toLowerCase()}` : t;
}
function Kr() {
  const e = String(L(Da, "auto")), t = String(L("Comfy.Locale", "en") || "en").slice(0, 2).toLowerCase(), a = e === "auto" ? t : e, r = a !== uo();
  if (mo(a), !!r) {
    for (const o of U)
      if (!o.disposed)
        try {
          o.syncFromWidgets?.(!1), o.refreshKeys?.(), o.refreshObjects?.(), o.refreshInspector?.(), o.render?.(), o.setStatus?.(_("Language updated — reload the workflow to translate every label."));
        } catch (n) {
          console.warn("OmniCam: live locale refresh failed", n);
        }
  }
}
const U = /* @__PURE__ */ new Set();
function Bn(e) {
  U.add(e);
}
function ol(e) {
  U.delete(e);
}
function Kn() {
  for (const e of U)
    if (!e.disposed) return !0;
  return !1;
}
function Vn(e) {
  for (const t of U)
    if (!t.disposed && (t.drag || t.boxSelection || t.gizmoDrag || t.activePointerId != null))
      return t;
  if (e instanceof Node) {
    for (const t of U)
      if (!t.disposed && t.root?.contains(e)) return t;
  }
  if (U.size === 1) {
    const [t] = U;
    if (t && !t.disposed) return t;
  }
  return null;
}
function Vr() {
  return String(L(Ha, "balanced"));
}
function Gn() {
  return L(Wa, !0) !== !1;
}
function qn() {
  return L(wr, !0) !== !1;
}
function Yt(e = Vr()) {
  for (const t of U)
    t.disposed || (Gr(t), t.requestRender ? t.requestRender("quality") : t.render?.(), t.renderCameraView?.());
}
function nl() {
  return Wn().enabled;
}
function Hn() {
  for (const e of U)
    e.disposed || e.assetBrowser?.syncAgentAvailability?.();
}
function Wn() {
  const e = R(wt, "ollama", ["openai", "openai_compatible", "anthropic", "ollama"]);
  return {
    enabled: N(Nr, !0),
    provider: e,
    // Scoped per provider (agentModelSettingId/agentBaseUrlSettingId) so
    // switching Provider never carries over another provider's model id or
    // endpoint override -- see catalogue.js's comment on SETTING_AGENT_MODEL.
    model: String(L(Ct(e), "") || "").trim(),
    baseUrl: String(L(Mt(e), "") || "").trim(),
    maxOutputTokens: K(Rr, 4096, 512, 32768, !0),
    maxPlannerSteps: K(zr, 6, 1, 12, !0),
    requestTimeoutSeconds: K(Lr, 120, 15, 300, !0)
  };
}
function $n() {
  return {
    fps: K(ja, 24, 1, 120, !0),
    durationSeconds: K(Ea, 5, 1, 120, !0),
    width: K(Ia, 1280, 64, 4096, !0),
    height: K(Oa, 720, 64, 4096, !0),
    renderMode: String(L(Pa, "omni_ref")),
    encoder: String(L(Na, "auto")),
    playblastResolution: R(Ra, "output", ["viewport", "half", "output", "double"]),
    playblastQuality: R(za, "balanced", ["low", "balanced", "high"]),
    playblastGrid: N(La, !1),
    playblastLabels: N(Fa, !1),
    guideCaptureStyle: R(Ba, "auto", ["auto", "motion_proxy", "clay", "depth_rich"]),
    pointDensity: R(Ka, "balanced", ["none", "sparse", "balanced", "dense", "ultra"]),
    pointSpread: R(Va, "all_views", ["all_views", "ground_focus", "dome"]),
    pointColor: Xt(Ga, "#cbd5e1"),
    cardFit: R(qa, "contain", ["contain", "cover", "stretch"]),
    backgroundColor: Xt($a, "#121212"),
    showGrid: N(Ua, !0),
    showRadar: N(Xa, !0),
    showCameraPaths: N(Ya, !0),
    showCameraGizmos: N(Za, !0),
    showLookAt: N(Qa, !0),
    showHelperAxes: N(Ja, !0),
    showGizmo: N(er, !0),
    guides: N(tr, !0),
    safeAreas: N(ar, !1),
    resolutionGate: N(rr, !1),
    aspectRatio: R(or, "auto", ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"]),
    burnIn: N(nr, !1),
    speedHeatmap: N(sr, !1),
    showWireframe: N(ir, !1),
    showVertices: N(lr, !1),
    selectMode: R(cr, "object", ["object", "vertex", "edge", "face"]),
    gizmoMode: R(dr, "translate", ["translate", "rotate", "scale"]),
    gizmoSpace: R(mr, "world", ["world", "local"]),
    spatialSnapMode: R(ur, "none", ["none", "grid", "vertex"]),
    spatialGridSize: K(pr, 0.5, 0.01, 100),
    navigationProfile: R(fr, "simple", ["maya", "blender", "simple"]),
    flySpeed: K(hr, 1, 0.05, 5),
    invertOrbitY: N(gr, !1),
    zoomSensitivity: K(yr, 1, 0.2, 3),
    orbitSensitivity: K(br, 1, 0.2, 3),
    panSensitivity: K(vr, 1, 0.2, 3),
    dollySensitivity: K(_r, 1, 0.2, 3),
    viewMode: R(Sr, "perspective", ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"]),
    snapEnabled: N(Cr, !0),
    snapFrames: K(Mr, 1, 1, 24, !0),
    autoKey: N(xr, !1),
    defaultInterpolation: R(kr, "ease", ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold"]),
    timecodeMode: R(Ar, "time", ["time", "timecode"]),
    loopPlayback: N(Tr, !1),
    uiDensity: R(Dr, "animation", ["basic", "animation", "advanced"]),
    previewLayout: R(jr, "auto", ["auto", "1", "2", "4"]),
    cameraViewVisible: N(Er, !0),
    undoLimit: K(Ir, 100, 10, 500, !0),
    extractorBackend: R(Or, "dpvo", ["dpvo", "pycolmap"]),
    monitorProfile: R(Pr, "wan_camera_native", ["wan_camera_native", "minimax_h3", "ltx_motion", "generic_video"])
  };
}
function Un() {
  const e = String(L(Wt, "") || "").trim(), t = String(L($t, "") || "").trim();
  if (!e && !t) return;
  const a = R(
    wt,
    "ollama",
    Ke.map((n) => n.id)
  ), r = Ct(a), o = Mt(a);
  e && !String(L(r, "") || "").trim() && ve(r, e), t && !String(L(o, "") || "").trim() && ve(o, t), ve(Wt, ""), ve($t, "");
}
function Xn(e) {
  xt = e, co("fr", Ln), Kr(), Un();
}
function Gr(e) {
  const t = Vr(), a = Gn();
  for (const r of [e.webgl, e.cameraWebgl])
    r && (r.adaptiveQuality = a, r.onQualityDowngrade = (o) => e.setStatus?.(
      _("Studio quality lowered to {level} to keep the viewport responsive").replace("{level}", o)
    ), r.setViewportQuality?.(t));
}
function sl(e) {
  Bn(e), Gr(e);
}
function Yn(e) {
  const t = $n();
  e.fpsWidget && (e.fpsWidget.value = t.fps), e.durationWidget && (e.durationWidget.value = t.durationSeconds), e.widthWidget && (e.widthWidget.value = t.width), e.heightWidget && (e.heightWidget.value = t.height), e.modeWidget && (e.modeWidget.value = t.renderMode);
  const a = e.root?.querySelector('[data-role="encoder"]');
  a && (a.value = t.encoder), e.cameraSpeed = t.flySpeed, e.history && (e.history.limit = t.undoLimit), Object.assign(e.state, {
    playblast_resolution: t.playblastResolution,
    playblast_quality: t.playblastQuality,
    playblast_grid: t.playblastGrid,
    playblast_labels: t.playblastLabels,
    guide_capture_style: t.guideCaptureStyle,
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
  }), e.syncFromWidgets ? e.syncFromWidgets() : e.flushToWidgets?.({ immediate: !0 });
}
function Ve() {
  return {
    cameraId: null,
    frames: /* @__PURE__ */ new Set(),
    primaryFrame: null,
    component: "position"
    // "position" | "target"
  };
}
function Zn(e, { cameraId: t, frame: a, additive: r = !1 } = {}) {
  const o = e || Ve(), n = o.cameraId === t;
  if (!r || !n)
    return { cameraId: t, frames: /* @__PURE__ */ new Set([a]), primaryFrame: a, component: o.component || "position" };
  const s = new Set(o.frames);
  if (s.has(a)) {
    s.delete(a);
    let i = o.primaryFrame;
    return s.size ? i === a && (i = Math.max(...s)) : i = null, { ...o, frames: s, primaryFrame: i };
  }
  return s.add(a), { ...o, cameraId: t, frames: s, primaryFrame: a };
}
function il(e, t) {
  const a = e || Ve();
  return t !== "position" && t !== "target" ? a : { ...a, component: t };
}
function ll(e, t) {
  if (!e || !t || e.cameraId !== t.id) return Ve();
  const a = new Set((t.keyframes || []).map((n) => n.frame)), r = new Set([...e.frames].filter((n) => a.has(n)));
  if (!r.size) return Ve();
  const o = r.has(e.primaryFrame) ? e.primaryFrame : Math.max(...r);
  return { cameraId: e.cameraId, frames: r, primaryFrame: o, component: e.component || "position" };
}
function Qn(e, t) {
  return !e || !t || e.cameraId !== t.id || !e.frames.size ? [] : (t.keyframes || []).filter((a) => e.frames.has(a.frame)).sort((a, r) => a.frame - r.frame);
}
function Jn(e, t) {
  return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function Zt(e, t, a, r, o) {
  const { right: n, up: s, forward: i } = H(t), l = t.position, c = [a[0] - l[0], a[1] - l[1], a[2] - l[2]], d = Jn(c, i);
  let m, p;
  if (t.camera_type === "orthographic") {
    const h = 5 / Math.max(0.01, t.zoom || 1), u = h * r / Math.max(1, o);
    m = (e[0] / Math.max(1, r) - 0.5) * 2 * u, p = (0.5 - e[1] / Math.max(1, o)) * 2 * h;
  } else {
    const h = 0.5 * o / Math.tan(Math.max(1e-3, t.fov) * Math.PI / 360);
    m = (e[0] - r / 2) * d / h, p = (o / 2 - e[1]) * d / h;
  }
  return [0, 1, 2].map((h) => l[h] + i[h] * d + n[h] * m + s[h] * p);
}
function es(e) {
  return e === "bezier" ? "bezier" : "smooth";
}
function cl(e) {
  for (let t = e?.object; t; t = t.parent)
    if (t.userData?.omnicamPathKey) return t.userData.omnicamPathKey;
  return null;
}
function dl(e) {
  for (let t = e?.object; t; t = t.parent)
    if (t.userData?.omnicamCurveHandle) return t.userData.omnicamCurveHandle;
  return null;
}
function Qt(e, { cameraId: t, frame: a, additive: r = !1 }) {
  e.pathSelection = Zn(e.pathSelection, { cameraId: t, frame: a, additive: r }), e.selectedKeyFrames = new Set(e.pathSelection.frames), e.selectedKeyFrame = e.pathSelection.primaryFrame, e.editingKeyFrame = null, e.pathSelection.primaryFrame != null && e.setFrame(e.pathSelection.primaryFrame), e.refreshKeys(), e.refreshInspector();
}
function ts(e, { pointerX: t, pointerY: a, shiftKey: r, altKey: o }) {
  if (o || !e.webgl?.pickPathKey) return !1;
  const n = e.webgl.pickPathKey([t, a]);
  if (!n || e.selectedEntity === "camera" && n.cameraId === e.state.active_camera_id) return !1;
  const s = (e.state.cameras || []).find((l) => l.id === n.cameraId), i = (s?.keyframes || []).find((l) => l.frame === n.frame);
  return i ? (s.id !== e.state.active_camera_id && e.activateCamera(s.id), r ? (Qt(e, { cameraId: s.id, frame: i.frame, additive: !0 }), e.render(), !0) : (e.pathDrag = { cameraId: n.cameraId, frame: n.frame, anchor: [...i.camera.position], startX: t, startY: a, moved: !1, historyCheckpointed: !1 }, e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), Qt(e, { cameraId: s.id, frame: i.frame, additive: !1 }), e.render(), !0)) : !1;
}
const as = 3;
function rs(e, t, a, r, o) {
  const n = V(e, a, r, o), s = V(t, a, r, o);
  return !n || !s ? !1 : Math.hypot(n[0] - s[0], n[1] - s[1]) < as;
}
function os(e, { pointerX: t, pointerY: a, overHandle: r, viewCamera: o, e: n }) {
  if (!e.webgl?.pickCurveHandle) return !1;
  const s = e.webgl.pickCurveHandle([t, a]);
  if (!s) return !1;
  const i = (e.state.cameras || []).find((d) => d.id === s.cameraId), l = (i?.keyframes || []).findIndex((d) => d.frame === s.frame), c = l >= 0 ? i.keyframes[l] : null;
  return !c || rs(s.position, c.camera.position, o, e.canvas.width, e.canvas.height) ? !1 : (r && n.stopImmediatePropagation?.(), e.curveHandleDrag = {
    cameraId: s.cameraId,
    frame: s.frame,
    side: s.side,
    anchor: [...c.camera.position],
    prevKey: i.keyframes[l - 1] || null,
    nextKey: i.keyframes[l + 1] || null,
    startX: t,
    startY: a,
    moved: !1,
    historyCheckpointed: !1
  }, e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), e.selectKeyframe?.(c), !0);
}
const _e = "orbit", Se = "pan", et = "dolly";
function qr(e, t, { includeCtrlFallback: a, includeSimpleLeft: r = a }) {
  const o = !!(t.ctrlKey || t.metaKey);
  if (e === "simple" && !t.altKey && !o && !t.shiftKey) {
    if (t.button === 2) return Se;
    if (t.button === 0) return r ? _e : null;
  }
  return t.button === 1 ? o ? et : t.shiftKey || t.altKey ? Se : _e : t.button === 2 ? t.altKey && e === "maya" ? et : null : t.button !== 0 ? null : t.altKey ? o ? et : t.shiftKey ? Se : _e : o && a ? t.shiftKey ? Se : _e : null;
}
function ns(e, t, a) {
  const r = kt(e), o = qr(r, t, { includeCtrlFallback: !0 });
  return o === _e && a?.camera_type === "orthographic" ? Se : o;
}
function Jt(e, t) {
  return e.isNavigatingFly ? !0 : qr(kt(e), t, { includeCtrlFallback: !1 }) !== null;
}
const ss = ["maya", "blender", "simple"];
function kt(e) {
  const t = e.state?.navigation_profile;
  return ss.includes(t) ? t : "maya";
}
function is(e, t) {
  const a = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? Math.max(1, t) : 1;
  return Number.isFinite(e.deltaY) ? e.deltaY * a : 0;
}
function Ge(e, t) {
  return (e.camera_type === "orthographic" ? 10 / Math.max(0.01, e.zoom || 1) : 2 * W(j(e.position, e.target)) * Math.tan((e.fov || 35) * Math.PI / 360)) / Math.max(1, t);
}
function Ae(e) {
  const t = e.activePointerId;
  e.activePointerId = null, t != null && e.interactionElement.hasPointerCapture?.(t) && e.interactionElement.releasePointerCapture(t), e.pointerHit = !1, e.canvas.classList.remove("dragging"), e.interactionElement.style && (e.interactionElement.style.cursor = "default");
}
function ls(e, t) {
  const a = e?.constraints?.look_at, o = a?.status === void 0 || a?.status === "active" ? a?.object_id || e?.target_object_id : null;
  if (!o) return !1;
  if (!Array.isArray(t)) return !0;
  const n = t.find((s) => s.id === o);
  return !!(n && n.enabled !== !1);
}
function lt(e) {
  const t = Array.isArray(e) ? e.filter((r) => r?.camera?.position) : [];
  if (!t.length) return [0, 0, 0];
  const a = t.reduce((r, o) => M(r, o.camera.position), [0, 0, 0]);
  return T(a, 1 / t.length);
}
function qe(e, { mode: t, origin: a, delta: r, factors: o, rotationDeg: n }) {
  if (t === "translate") return M(e, r);
  const s = j(e, a);
  return t === "scale" ? M(a, [s[0] * o[0], s[1] * o[1], s[2] * o[2]]) : M(a, xe(s, n));
}
function cs(e, t) {
  return (Array.isArray(e) ? e : []).map((r) => {
    const o = { ...r.camera };
    return Array.isArray(o.position) && (o.position = qe(o.position, t)), Array.isArray(o.target) && (o.target = qe(o.target, t)), { ...r, camera: o };
  });
}
function ds(e, t) {
  let a;
  e.length < 2 ? a = null : t === 0 ? a = j(e[1], e[0]) : t === e.length - 1 ? a = j(e[t], e[t - 1]) : a = j(e[t + 1], e[t - 1]);
  const r = a ? W(a) : 0;
  return r > 1e-6 ? T(a, 1 / r) : [0, 0, -1];
}
function ml(e, t, a) {
  const r = Array.isArray(e) ? e : [], o = t instanceof Set ? t : new Set(t || []), n = !!a?.lookAtActive, s = r.map((i) => {
    const l = i?.camera?.position;
    return Array.isArray(l) ? o.has(i.frame) ? qe(l, a) : [...l] : l;
  });
  return r.map((i, l) => {
    const c = { ...i.camera };
    if (!o.has(i.frame) || !Array.isArray(c.position)) return { ...i, camera: c };
    const d = c.position, m = c.target;
    if (c.position = s[l], Array.isArray(m))
      if (n)
        c.target = qe(m, a);
      else {
        const p = W(j(m, d)) || 5, h = ds(s, l);
        c.target = M(c.position, T(h, p));
      }
    return { ...i, camera: c };
  });
}
function ul(e, t, { delta: a = [0, 0, 0] } = {}) {
  const r = Array.isArray(e) ? e : [], o = t instanceof Set ? t : new Set(t || []);
  return r.map((n) => !o.has(n.frame) || !Array.isArray(n?.camera?.target) ? n : { ...n, camera: { ...n.camera, target: M(n.camera.target, a) } });
}
function ms(e, t) {
  e.finishCameraEdit(), e.selectedEntity = "camera_path", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(t.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_("{name} · whole path selected — move / scale / rotate").replace("{name}", t.name));
}
function us(e, { baseDrag: t, viewCamera: a, entityPosition: r }) {
  const o = e.activeCameraTrack?.();
  return !o || o.locked || !(o.keyframes?.length >= 1) ? !1 : (e.checkpoint("Transform camera path"), e.gizmoDrag = {
    ...t,
    type: "camera_path",
    historyCheckpointed: !0,
    trackId: o.id,
    origin: lt(o.keyframes),
    baseKeys: o.keyframes.map((n) => ({ ...n, camera: q(n.camera) })),
    viewRight: H(a).right,
    viewUp: H(a).up,
    freeScale: a.camera_type === "orthographic" ? Ge(a, e.canvas.height) : W(j(a.position, r)) * (2 * Math.tan((a.fov || 35) * Math.PI / 360)) / e.canvas.height
  }, !0);
}
function ps(e, { pointer: t, deltaPixels: a, precision: r, snapping: o }) {
  const n = e.gizmoDrag, s = e.state.cameras.find((c) => c.id === n.trackId);
  if (!s) return;
  const i = n.origin;
  let l;
  if (e.state.gizmo_mode === "translate") {
    let c;
    if (n.free) {
      const d = (t[0] - n.pointer[0]) * r, m = (t[1] - n.pointer[1]) * r;
      c = M(T(n.viewRight, d * n.freeScale), T(n.viewUp, -m * n.freeScale));
    } else
      c = T(n.axis, a * n.worldLength / n.screenLength);
    l = { mode: "translate", delta: c };
  } else if (e.state.gizmo_mode === "scale") {
    let c;
    if (n.free) {
      const d = (t[0] - n.pointer[0]) * r, m = (t[1] - n.pointer[1]) * r, p = Math.max(0.01, 1 + (d - m) * n.freeScale * 0.35);
      c = [p, p, p];
    } else {
      const d = Math.max(0.01, 1 + a * n.worldLength / n.screenLength * 0.5);
      c = [1, 1, 1], c[n.axisIndex] = o ? Math.max(0.01, Math.round(d / 0.1) * 0.1) : d;
    }
    l = { mode: "scale", origin: i, factors: c };
  } else {
    const c = o ? Math.round(a * 0.75 / 15) * 15 : a * 0.75, d = [0, 0, 0];
    d[n.axisIndex] = c, l = { mode: "rotate", origin: i, rotationDeg: d };
  }
  s.keyframes = cs(n.baseKeys, l), s.id === e.state.active_camera_id && (e.state.keyframes = s.keyframes), e.camera = de(s, e.frame, e.state.objects), s.camera = q(e.camera), e.refreshKeys(), e.refreshInspector(), e.render(), e.renderCameraView?.();
}
const k = Object.freeze({
  // Canonical Baseline Surfaces & Chrome (tested by monitor-style-parity)
  bgApp: "#0B1018",
  bgPanel: "#111827",
  bgControl: "#151D2A",
  bgSunken: "#080C14",
  borderDefault: "#263143",
  borderSubtle: "#1B2433",
  // Typography
  textPrimary: "#E9EDF5",
  textSecondary: "#8F9AAF",
  textMuted: "#98A3B8",
  // States
  accent: "#5B7CFF",
  accentSoft: "rgba(91, 124, 255, 0.16)",
  accentHover: "#728FFF",
  accentInk: "#ffffff",
  success: "#42D7A1",
  successSoft: "rgba(66, 215, 161, 0.16)",
  warning: "#F3B34C",
  warningSoft: "rgba(243, 179, 76, 0.16)",
  error: "#ED6B73",
  errorSoft: "rgba(237, 107, 115, 0.16)",
  // DCC Studio Palette Extensions (Dark Neutral Zinc/Slate, Zero Blue Tint)
  dccBgWorkspace: "#121214",
  dccBgPanel: "#18181b",
  dccBgControl: "#222226",
  dccBgSunken: "#0d0d0f",
  dccBorder: "#2e2e34",
  dccBorderSubtle: "#232328",
  dccAccent: "#2563eb",
  dccAccentHover: "#3b82f6",
  // Universal 3D DCC Axes (Red X, Green Y, Blue Z)
  axisX: "#ef4444",
  axisY: "#22c55e",
  axisZ: "#3b82f6",
  // Animation Channel Key States (Maya / Blender standard)
  keyActive: "#eab308",
  keyPassive: "#22c55e",
  keyModified: "#f97316",
  keyNone: "#52525b",
  // Semantic Type Colors (Outliner, Timeline Keyframes, Gizmos)
  typeCamera: "#5B7CFF",
  typeLookAt: "#F3B34C",
  typeLens: "#A78BFA",
  typeRoll: "#F472B6",
  typeCuts: "#56B6C2",
  typeTrackPoints: "#42D7A1",
  typeGeometry: "#94A3B8",
  typeLight: "#F3B34C",
  typePointCloud: "#818CF8",
  typeReferenceCard: "#38BDF8",
  typeGroundPlane: "#475569",
  typeError: "#ED6B73"
}), pl = `
  --oc-bg-app: ${k.bgApp};
  --oc-bg-panel: ${k.bgPanel};
  --oc-bg-control: ${k.bgControl};
  --oc-bg-sunken: ${k.bgSunken};
  --oc-border-default: ${k.borderDefault};
  --oc-border-subtle: ${k.borderSubtle};

  --oc-text-primary: ${k.textPrimary};
  --oc-text-secondary: ${k.textSecondary};
  --oc-text-muted: ${k.textMuted};

  --oc-accent: ${k.accent};
  --oc-accent-soft: ${k.accentSoft};
  --oc-accent-hover: ${k.accentHover};
  --oc-accent-ink: ${k.accentInk};
  --oc-success: ${k.success};
  --oc-success-soft: ${k.successSoft};
  --oc-warning: ${k.warning};
  --oc-warning-soft: ${k.warningSoft};
  --oc-error: ${k.error};
  --oc-error-soft: ${k.errorSoft};

  --oc-axis-x: ${k.axisX};
  --oc-axis-y: ${k.axisY};
  --oc-axis-z: ${k.axisZ};
  --oc-key-active: ${k.keyActive};
  --oc-key-passive: ${k.keyPassive};
  --oc-key-modified: ${k.keyModified};
  --oc-key-none: ${k.keyNone};

  --oc-type-camera: ${k.typeCamera};
  --oc-type-lookat: ${k.typeLookAt};
  --oc-type-lens: ${k.typeLens};
  --oc-type-roll: ${k.typeRoll};
  --oc-type-cuts: ${k.typeCuts};
  --oc-type-trackpoints: ${k.typeTrackPoints};
  --oc-type-geometry: ${k.typeGeometry};
  --oc-type-light: ${k.typeLight};
  --oc-type-pointcloud: ${k.typePointCloud};
  --oc-type-referencecard: ${k.typeReferenceCard};
  --oc-type-groundplane: ${k.typeGroundPlane};
  --oc-type-error: ${k.typeError};

  /* Compatibility aliases mapping old vars to new unified tokens */
  --oc-bg: var(--oc-bg-app);
  --oc-panel: var(--oc-bg-panel);
  --oc-panel-2: var(--oc-bg-control);
  --oc-sunken: var(--oc-bg-sunken);
  --oc-line: var(--oc-border-default);
  --oc-line-soft: var(--oc-border-subtle);
  --oc-text: var(--oc-text-primary);
  --oc-text-dim: var(--oc-text-secondary);
  --oc-text-faint: var(--oc-text-muted);
  --oc-ok: var(--oc-success);
  --oc-ok-bg: var(--oc-success-soft);
  --oc-ok-line: var(--oc-success);
  --oc-ok-text: var(--oc-success);
  --oc-warn: var(--oc-warning);
  --oc-warn-bg: var(--oc-warning-soft);
  --oc-warn-line: var(--oc-warning);
  --oc-warn-text: var(--oc-warning);
  --oc-danger: var(--oc-error);
  --oc-danger-bg: var(--oc-error-soft);
  --oc-danger-line: var(--oc-error);
  --oc-danger-text: var(--oc-error);
`, Hr = 1e-4;
function fs(e, t) {
  return !Array.isArray(e) || !Array.isArray(t) ? e !== t : e.some((a, r) => Math.abs(Number(a) - Number(t[r])) > Hr);
}
function ea(e, t) {
  return Math.abs(Number(e) - Number(t)) > Hr;
}
const hs = [
  {
    id: "camera",
    label: "Camera",
    color: k.typeCamera,
    // The camera row is the master track: every key belongs to it.
    changed: () => !0,
    read: (e) => e?.position
  },
  {
    id: "look_at",
    label: "Look At",
    color: k.typeLookAt,
    changed: (e, t) => fs(e?.target, t?.target),
    read: (e) => e?.target
  },
  {
    id: "focal_length",
    label: "Focal Length",
    color: k.typeLens,
    changed: (e, t) => ea(e?.fov, t?.fov),
    read: (e) => e?.fov
  },
  {
    id: "roll",
    label: "Roll",
    color: k.typeRoll,
    changed: (e, t) => ea(e?.roll, t?.roll),
    read: (e) => e?.roll
  }
];
function gs(e, t) {
  const a = [...e || []].sort((n, s) => n.frame - s.frame), r = [];
  let o = null;
  for (const n of a) {
    const s = n.camera || n.transform || {};
    (o === null || t.changed(o, s)) && r.push(n.frame), o = s;
  }
  return r;
}
function fl(e, t = null) {
  return hs.filter((a) => !t || t.has(a.id)).map((a) => ({
    id: a.id,
    label: a.label,
    color: a.color,
    frames: gs(e, a)
  }));
}
function ta(e, t) {
  const a = [];
  for (const r of [e[0], t[0]]) for (const o of [e[1], t[1]]) for (const n of [e[2], t[2]]) a.push([r, o, n]);
  return a;
}
function ys(e, t) {
  const a = e.webgl?.getObjectWorldBounds?.(t.id);
  if (a) return ta(a.min, a.max);
  const r = St(e.state.objects, t, e.frame || 0), o = (t.type === "model" || t.type === "glb") && e.webgl?.getObjectWorldCenter?.(t.id) || r.position, n = r.size.map((i) => Math.max(0.01, Math.abs(i)) / 2), s = r.quaternion || Fe(r.rotation);
  return ta(n.map((i) => -i), n).map((i) => M(o, wa(i, s)));
}
function bs(e, t, a, r = {}) {
  const o = e.state.objects.filter((y) => y.enabled !== !1), n = r.all ? o : o.filter((y) => e.selectedObjectIds?.has(y.id)), i = (n.length ? n : [a]).flatMap((y) => ys(e, y)), l = [0, 1, 2].map((y) => Math.min(...i.map((C) => C[y]))), c = [0, 1, 2].map((y) => Math.max(...i.map((C) => C[y]))), d = l.map((y, C) => (y + c[C]) / 2), { right: m, up: p, forward: h } = H(t), u = Math.max(1, e.canvas?.width || e.state.width || 1280) / Math.max(1, e.canvas?.height || e.state.height || 720), f = Math.tan((t.fov || 35) * Math.PI / 360), w = f * u;
  let v = 2, b = 0.1;
  for (const y of i) {
    const C = j(y, d), S = Math.abs(Z(C, m)), A = Math.abs(Z(C, p)), g = Z(C, h);
    v = Math.max(v, 1.15 * S / w - g, 1.15 * A / f - g, (t.near || 0.01) * 2 - g), b = Math.max(b, 1.15 * A, 1.15 * S / u);
  }
  t.target = d, t.position = j(d, T(h, v)), t.camera_type === "orthographic" && (t.zoom = Math.max(0.01, 5 / b));
}
const te = {
  object: ["translate", "rotate", "scale"],
  camera: ["translate", "rotate"],
  camera_target: ["translate"],
  camera_path: ["translate", "rotate", "scale"],
  path_point: ["translate"],
  path_group: ["translate", "rotate", "scale"],
  // A single key's look-at target (plan section 12): also a bare point, also
  // translate-only. Multi-point/whole-target-path editing is an explicit
  // Phase 2 (plan section 12.3), so there is no "target_group" here yet.
  path_point_target: ["translate"]
};
function vs(e) {
  if (e.selectedEntity === "object") {
    const t = e.selectedObject();
    if (!t || t.locked) return null;
    const a = t.keyframes?.length ? Ue(t, e.frame) : t, r = a.position || [0, 0, 0];
    return {
      id: `object:${t.id}`,
      type: "object",
      position: r,
      rotation: a.rotation || [0, 0, 0],
      scale: a.size || [1, 1, 1],
      allowedModes: te.object,
      // Legacy fields some existing call sites still read directly.
      object: t,
      origin: r,
      size: a.size || [1, 1, 1]
    };
  }
  if (e.state.view_mode !== "camera") {
    const t = e.activeCameraTrack();
    if (t?.locked) return null;
    if (e.selectedEntity === "camera_target") {
      const r = de(t, e.frame, e.state.objects).target || e.camera.target || [0, 1.5, 0];
      return {
        id: `camera_target:${t?.id || "camera"}`,
        type: "camera_target",
        position: r,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        allowedModes: te.camera_target
      };
    }
    if (e.selectedEntity === "camera") {
      const r = de(t, e.frame, e.state.objects).position || e.camera.position || [6, 4, 6];
      return {
        id: `camera:${t?.id || "camera"}`,
        type: "camera",
        position: r,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        allowedModes: te.camera
      };
    }
    if (e.selectedEntity === "camera_path" && (t?.keyframes?.length || 0) >= 1) {
      const a = Qn(e.pathSelection, t);
      if (a.length === 1) {
        if (e.pathSelection?.component === "target") {
          const r = a[0];
          return {
            id: `path_point_target:${t.id}:${r.frame}`,
            type: "path_point_target",
            position: [...r.camera.target || [0, 0, 0]],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            allowedModes: te.path_point_target,
            track: t,
            frame: r.frame,
            readOnly: ls(t, e.state.objects)
          };
        }
        return {
          id: `path_point:${t.id}:${a[0].frame}`,
          type: "path_point",
          position: [...a[0].camera.position],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          allowedModes: te.path_point,
          track: t,
          frame: a[0].frame
        };
      }
      return a.length > 1 ? {
        id: `path_group:${t.id}`,
        type: "path_group",
        position: lt(a),
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        allowedModes: te.path_group,
        track: t,
        frames: a.map((r) => r.frame)
      } : {
        id: `camera_path:${t.id}`,
        type: "camera_path",
        position: lt(t.keyframes),
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        allowedModes: te.camera_path,
        // Legacy field: the whole-path gizmo wiring reads the track directly.
        track: t
      };
    }
  }
  return null;
}
function Q(e) {
  return e.state?.view_mode && e.state.view_mode !== "camera" && e.state.editor_views ? e.state.editor_views[e.state.view_mode] || e.camera : e.recording && e.playblastCameraAtFrame ? e.playblastCameraAtFrame() : e.camera;
}
function hl(e, t) {
  if (["camera", "perspective", "iso", "front", "back", "top", "right", "left", "bottom"].includes(t)) {
    e.state.view_mode = t;
    for (const a of e.root.querySelectorAll('[data-role="view-mode"]')) a.value = t;
    for (const a of e.root.querySelectorAll("[data-view]")) {
      const r = a.dataset.view === t;
      a.classList.toggle("active", r), a.setAttribute("aria-pressed", String(r));
    }
    e.serialize(), e.render(), e.setStatus(_("View: {value1}{value2}", { value1: t[0].toUpperCase(), value2: t.slice(1) }));
  }
}
function gl(e, t) {
  if (["translate", "rotate", "scale"].includes(t)) {
    e.state.gizmo_mode = t;
    for (const a of e.root.querySelectorAll("[data-transform-mode]")) {
      const r = a.dataset.transformMode === t;
      a.classList.toggle("active", r), a.setAttribute("aria-pressed", String(r));
    }
    e.serialize(), e.render(), e.setStatus(_("{value1}{value2} · {value3}", { value1: t[0].toUpperCase(), value2: t.slice(1), value3: t === "translate" ? "W" : t === "rotate" ? "E" : "R" }));
  }
}
function yl(e, t) {
  e.checkpoint("Reset camera"), e.camera = t();
  for (const r of e.root.querySelectorAll('[data-role="camera-fov"]')) r.value = String(e.camera.fov);
  for (const r of e.root.querySelectorAll('[data-role="camera-roll"]')) r.value = String(e.camera.roll);
  const a = e.root.querySelector('[data-role="camera-type"]');
  a && (a.value = e.camera.camera_type), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.setStatus(_("Camera reset"));
}
function bl(e, t = {}) {
  const a = Q(e), r = e.state.view_mode !== "camera", o = [...a.target];
  if (e.subSelection?.point && !t.all) {
    e.checkpoint("Frame selection");
    const i = e.subSelection.point, l = ie(j(a.position, o)), c = Number.isFinite(l[0]) && W(l) > 0.1 ? l : [0.707, 0.4, 0.707], d = 2;
    a.target = [...i], a.position = M(a.target, T(c, d)), r ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit());
    const m = e.subSelection.mode === "vertex" ? "Vertex" : e.subSelection.mode === "edge" ? "Edge" : "Face";
    e.setStatus(_("Focused on {value1} at [{value2}]", { value1: m, value2: i.map((p) => Math.round(p * 100) / 100).join(", ") }));
    return;
  }
  const s = e.selectedObject() || e.state.objects.find((i) => i.id === "subject") || e.state.objects[0] || { position: [0, 1.5, 0], size: [2, 3] };
  e.checkpoint(t.all ? "Frame all" : "Frame subject"), bs(e, a, s, t), r ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit()), e.setStatus(t.all ? _("Framed: all objects") : _("Framed: {name}").replace("{name}", s.name || s.type || _("Subject")));
}
function _s(e, t, a, { forceLocal: r = !1 } = {}) {
  const o = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], n = a?.rotation || t?.rotation || [0, 0, 0];
  return r || e.state.gizmo_space === "local" ? o.map((s) => xe(s, n)) : o;
}
function Ss(e) {
  return vs(e);
}
const ws = /* @__PURE__ */ new Set([
  "object",
  "camera",
  "camera_target",
  "path_point",
  "path_group",
  "camera_path",
  "path_point_target"
]);
function Wr(e) {
  if (e.transformControlsWiring?.currentLiveType?.()) return null;
  const t = Ss(e);
  if (!t || e.transformControlsWiring && ws.has(t.type)) return null;
  const a = Q(e), r = t.position;
  if (!r || !Number.isFinite(r[0]) || !Number.isFinite(r[1]) || !Number.isFinite(r[2])) return null;
  const o = V(r, a, e.canvas.width, e.canvas.height);
  if (!o || !Number.isFinite(o[0]) || !Number.isFinite(o[1])) return null;
  const n = Math.max(0.7, W(j(a.position, r)) * 0.12), s = e.state.gizmo_mode === "scale" || e.state.gizmo_mode === "rotate", i = t.type === "object" ? _s(e, t.object, t, { forceLocal: s }) : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (e.state.gizmo_mode === "scale" && t.type !== "object" && t.type !== "camera_path") return null;
  if (e.state.gizmo_mode !== "rotate" || t.type === "camera_target")
    return {
      entity: t,
      center: o,
      worldLength: n,
      handles: i.map((c, d) => ({ index: d, axis: c, points: [o, V(M(r, T(c, n)), a, e.canvas.width, e.canvas.height)] })).filter((c) => c.points[1] && Number.isFinite(c.points[1][0]) && Number.isFinite(c.points[1][1]))
    };
  const l = i.map((c, d) => {
    const m = Math.abs(c[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], p = ie(Ce(c, m)), h = ie(Ce(c, p)), u = [];
    for (let f = 0; f <= 48; f++) {
      const w = f / 48 * Math.PI * 2, v = V(M(r, M(T(p, Math.cos(w) * n), T(h, Math.sin(w) * n))), a, e.canvas.width, e.canvas.height);
      v && Number.isFinite(v[0]) && Number.isFinite(v[1]) && u.push(v);
    }
    return { index: d, axis: c, points: u };
  });
  return { entity: t, center: o, worldLength: n, handles: l };
}
function $r(e, t) {
  const a = Wr(e);
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
      const c = i.points[l], d = i.points[l + 1], m = Sa(t, c, d);
      (!s || m < s.distance) && (s = { ...i, distance: m, segment: [c, d], worldLength: a.worldLength, entity: a.entity });
    }
  return s?.distance <= 18 * r ? s : null;
}
function Cs(e, t) {
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
  const r = Q(e);
  if (e.state.view_mode !== "camera") {
    for (const s of e.state.cameras) {
      for (const d of s.keyframes || []) {
        const m = d.camera?.position;
        if (!m) continue;
        const p = V(m, r, e.canvas.width, e.canvas.height);
        if (p && Math.hypot(t[0] - p[0], t[1] - p[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
          return { type: "camera_keyframe", camera: s, keyframe: d };
      }
      const i = de(s, e.frame, e.state.objects), l = V(i.target || [0, 1.5, 0], r, e.canvas.width, e.canvas.height);
      if (l && Math.hypot(t[0] - l[0], t[1] - l[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera_target", camera: s };
      const c = V(i.position || [6, 4, 6], r, e.canvas.width, e.canvas.height);
      if (c && Math.hypot(t[0] - c[0], t[1] - c[1]) <= 22 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera", camera: s };
    }
    if (e.state.show_camera_paths !== !1)
      for (const s of e.state.cameras) {
        const i = s.keyframes || [];
        if (i.length < 2) continue;
        const l = i.map((c) => V(c.camera?.position, r, e.canvas.width, e.canvas.height)).filter((c) => c && Number.isFinite(c[0]) && Number.isFinite(c[1]));
        for (let c = 0; c < l.length - 1; c += 1)
          if (Sa(t, l[c], l[c + 1]) <= 8 * Math.min(2, window.devicePixelRatio || 1))
            return { type: "camera_path", camera: s };
      }
    for (const s of e.state.objects)
      if (s.enabled !== !1)
        for (const i of s.keyframes || []) {
          const l = i.transform?.position;
          if (!l) continue;
          const c = V(l, r, e.canvas.width, e.canvas.height);
          if (c && Math.hypot(t[0] - c[0], t[1] - c[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
            return { type: "object_keyframe", object: s, keyframe: i };
        }
  }
  let n = null;
  for (const s of e.state.objects) {
    if (s.enabled === !1) continue;
    const i = s.keyframes?.length ? Ue(s, e.frame) : s, l = V(i.position || [0, 0, 0], r, e.canvas.width, e.canvas.height);
    if (!l) continue;
    const c = Math.hypot(t[0] - l[0], t[1] - l[1]);
    (!n || c < n.distance) && (n = { object: s, distance: c });
  }
  return n?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? { type: "object", object: n.object } : null;
}
function Ms(e, t, a, r = 15) {
  const o = a[0] - t[0], n = a[1] - t[1], s = Math.hypot(o, n) || 1, i = o / s, l = n / s, c = -l, d = i, m = r * 0.42, p = a[0] - i * r, h = a[1] - l * r;
  e.beginPath(), e.moveTo(a[0], a[1]), e.lineTo(p + c * m, h + d * m), e.lineTo(p - c * m, h - d * m), e.closePath(), e.fill(), e.save(), e.strokeStyle = "rgba(15, 23, 42, 0.65)", e.lineWidth = 1, e.stroke(), e.restore();
}
function vl(e) {
  const t = Wr(e);
  if (!t || !t.handles) return;
  if (t.entity?.type === "camera_path") {
    const o = Q(e), n = (t.entity.track?.keyframes || []).map((s) => V(s.camera?.position, o, e.canvas.width, e.canvas.height)).filter((s) => s && Number.isFinite(s[0]) && Number.isFinite(s[1]));
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
      e.state.gizmo_mode === "scale" && t.entity?.type === "object" ? (e.ctx.fillRect(i[0] - 6, i[1] - 6, 12, 12), e.ctx.save(), e.ctx.strokeStyle = "rgba(15, 23, 42, 0.65)", e.ctx.lineWidth = 1, e.ctx.strokeRect(i[0] - 6, i[1] - 6, 12, 12), e.ctx.restore()) : Ms(e.ctx, s[0], i);
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
const ct = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, He = (e, t) => Math.round(e / t) * t;
function Ur(e) {
  const t = e.selectedObjectIds instanceof Set && e.selectedObjectIds.size ? e.selectedObjectIds : new Set(e.selectedObjectId ? [e.selectedObjectId] : []);
  return e.state.objects.filter((a) => t.has(a.id) && !a.locked);
}
function xs(e, t) {
  const a = Ur(e);
  if (!a.length || !["translate", "rotate", "scale"].includes(t)) return !1;
  const r = `${t[0].toUpperCase()}${t.slice(1)} selection`;
  e.history?.beginTransaction?.(r) || e.checkpoint(r);
  for (const d of a) e.beginObjectEdit(d);
  const o = a.map((d) => ({ object: d, transform: me(d) })), n = o.reduce((d, m) => M(d, m.transform.position), [0, 0, 0]).map((d) => d / o.length), s = [e.canvas.width * 0.5, e.canvas.height * 0.5], i = e.lastViewportPointer || s, l = e.interactionElement.getBoundingClientRect(), c = e.lastPointerEvent || { clientX: l.left + i[0] * l.width / e.canvas.width, clientY: l.top + i[1] * l.height / e.canvas.height };
  return e.modalTransform = { mode: t, axis: null, numeric: "", start: i, lastEvent: c, snapshots: o, pivot: n }, e.setTransformMode(t), e.setStatus(`${t.toUpperCase()} · move mouse · X/Y/Z constrain · type value · Enter confirm · Esc cancel`), e.render(), !0;
}
function ks(e) {
  if (!e.numeric || e.numeric === "-" || e.numeric === ".") return null;
  const t = Number(e.numeric);
  return Number.isFinite(t) ? t : null;
}
function As(e, t, a, r, o, n, s) {
  const i = o ? "grid" : e.state.spatial_snap_mode;
  if (i === "grid") {
    const l = e.state.spatial_grid_size || 0.5;
    return n ? a.map((c, d) => c.map((m, p) => Math.abs(n[p]) > 1e-6 ? He(m, l) : s[d][p])) : a.map((c) => c.map((d) => He(d, l)));
  }
  if (i === "vertex" && r && !n) {
    const l = e.webgl?.pickSubElement?.(r[0], r[1], e.canvas.width, e.canvas.height, "vertex");
    if (l?.point && !t.snapshots.some((c) => c.object.id === l.objectId)) {
      const c = a.reduce((m, p) => M(m, p), [0, 0, 0]).map((m) => m / a.length), d = j(l.point, c);
      return a.map((m) => M(m, d));
    }
  }
  return a;
}
function Oe(e, t) {
  const a = e.modalTransform;
  if (!a) return !1;
  a.lastEvent = t;
  const r = e.interactionElement.getBoundingClientRect(), o = [
    (t.clientX - r.left) * e.canvas.width / Math.max(1, r.width),
    (t.clientY - r.top) * e.canvas.height / Math.max(1, r.height)
  ];
  e.lastViewportPointer = o;
  const n = o[0] - a.start[0], s = o[1] - a.start[1], i = t.shiftKey ? 0.1 : 1, l = ks(a), c = a.axis ? ct[a.axis] : null, d = e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode], m = H(d), p = d.camera_type === "orthographic" ? 10 / (Math.max(0.01, d.zoom || 1) * Math.max(1, e.canvas.height)) : Math.hypot(...j(d.position, d.target)) * 25e-4;
  let h = a.snapshots.map((y) => [...y.transform.position]);
  if (a.mode === "translate") {
    const y = l ?? (n - s) * p * i, C = c ? T(c, y) : M(T(m.right, n * p * i), T(m.up, -s * p * i));
    h = h.map((S) => M(S, C)), h = As(e, a, h, o, t.ctrlKey || t.metaKey, c, a.snapshots.map((S) => S.transform.position));
  }
  const u = a.mode === "rotate" ? l ?? (n - s) * 0.5 * i : 0, f = a.mode === "scale" ? Math.max(0.01, l ?? 1 + (n - s) * 0.01 * i) : 1, w = c || ct.z, v = t.ctrlKey || t.metaKey || e.state.spatial_snap_mode === "grid";
  a.snapshots.forEach((y, C) => {
    const S = y.object;
    if (a.mode === "translate" && (S.position = h[C]), a.mode === "rotate") {
      const A = v ? He(u, 15) : u, g = T(w, A);
      S.position = M(a.pivot, xe(j(y.transform.position, a.pivot), g)), S.rotation = M(y.transform.rotation, g);
    }
    if (a.mode === "scale") {
      const A = v ? He(f, 0.1) : f, g = c ? c.map((E) => E ? A : 1) : [A, A, A], x = j(y.transform.position, a.pivot);
      S.position = M(a.pivot, x.map((E, G) => E * g[G])), S.size = y.transform.size.map((E, G) => Math.max(0.01, E * g[G]));
    }
    e.commitObjectEdit(S);
  }), e.refreshInspector(), e.render();
  const b = `${a.axis ? ` ${a.axis.toUpperCase()}` : ""}${a.numeric ? ` = ${a.numeric}` : ""}`;
  return e.setStatus(`${a.mode.toUpperCase()}${b}`), !0;
}
function Xr(e) {
  return e.modalTransform ? (e.history?.commitTransaction?.(), e.modalTransform = null, e.editingKeyFrame = null, e.scheduleSerialize(), e.refreshKeys(), e.drawCurveEditor(), e.render(), e.setStatus("Transform confirmed"), !0) : !1;
}
function Yr(e) {
  if (!e.modalTransform) return !1;
  const t = e.history?.cancelTransaction?.(), a = e.modalTransform;
  if (!t) {
    for (const r of a.snapshots)
      r.object.position = [...r.transform.position], r.object.rotation = [...r.transform.rotation], r.object.size = [...r.transform.size];
    e.serialize?.(), e.refreshObjects?.(), e.refreshKeys?.(), e.refreshInspector?.(), e.drawCurveEditor?.(), e.render?.();
  }
  return e.modalTransform = null, e.editingKeyFrame = null, e.setStatus("Transform cancelled"), !0;
}
function Ts(e, t) {
  const a = e.modalTransform;
  if (!a) return !1;
  const r = t.key.toLowerCase();
  return r === "escape" ? Yr(e) : r === "enter" || r === " " ? Xr(e) : ct[r] ? (a.axis = a.axis === r ? null : r, Oe(e, a.lastEvent), !0) : /^[0-9]$/.test(r) || r === "." || r === "," || r === "-" && !a.numeric ? (a.numeric += r === "," ? "." : r, Oe(e, a.lastEvent), !0) : (r === "backspace" && (a.numeric = a.numeric.slice(0, -1), Oe(e, a.lastEvent)), !0);
}
function ge(e, t, a) {
  !t || t.historyCheckpointed || (e.checkpoint(a), t.historyCheckpointed = !0);
}
function aa(e, t) {
  const a = e.activeCameraTrack?.();
  a && (a.target_offset = t, a.id === e.state.active_camera_id && (e.state.target_offset = t), e.setFrame(e.frame, !1, !1));
}
function Ds(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastViewportWheelAt) || t - e.lastViewportWheelAt > 300) && e.checkpoint("Dolly viewport"), e.lastViewportWheelAt = t;
}
const ne = (e, t) => Math.round(e / t) * t, js = (e, t) => e.map((a) => ne(a, t));
function Es(e, t, a) {
  const r = t.keyframes?.length ? Ue(t, e.frame) : t, o = r.position || [0, 0, 0], n = e.webgl?.getObjectWorldBounds?.(t.id);
  let s, i;
  if (n)
    ({ min: s, max: i } = n);
  else {
    const p = (r.size || [1, 1, 1]).map((h) => Math.max(0.01, Math.abs(h)) / 2);
    s = p.map((h, u) => o[u] - h), i = p.map((h, u) => o[u] + h);
  }
  let l = 1 / 0, c = 1 / 0, d = -1 / 0, m = -1 / 0;
  for (const p of [s[0], i[0]]) for (const h of [s[1], i[1]]) for (const u of [s[2], i[2]]) {
    const f = V([p, h, u], a, e.canvas.width, e.canvas.height);
    f && (l = Math.min(l, f[0]), d = Math.max(d, f[0]), c = Math.min(c, f[1]), m = Math.max(m, f[1]));
  }
  return Number.isFinite(l) ? { minX: l, minY: c, maxX: d, maxY: m } : null;
}
function ye(e, t, a, r = [], o = null) {
  const s = e.currentTransformEvent?.ctrlKey || e.currentTransformEvent?.metaKey ? "grid" : e.state.spatial_snap_mode, i = e.state.spatial_grid_size || 0.5;
  if (s === "grid")
    return o ? t.map((l, c) => Math.abs(o.axis[c]) > 1e-6 ? ne(l, i) : o.base[c]) : js(t, i);
  if (s === "vertex" && a && !o) {
    const l = e.webgl?.pickSubElement?.(a[0], a[1], e.canvas.width, e.canvas.height, "vertex");
    if (l?.point && !r.includes(l.objectId)) return [...l.point];
  }
  return t;
}
function Is(e) {
  if (!e.boxSelection) return !1;
  const t = e.boxSelection, a = Q(e), r = Math.min(t.start[0], t.current[0]), o = Math.max(t.start[0], t.current[0]), n = Math.min(t.start[1], t.current[1]), s = Math.max(t.start[1], t.current[1]), i = t.additive ? new Set(t.initial) : /* @__PURE__ */ new Set();
  for (const l of e.state.objects) {
    if (l.enabled === !1) continue;
    const c = Es(e, l, a);
    c && c.maxX >= r && c.minX <= o && c.maxY >= n && c.minY <= s && i.add(l.id);
  }
  return e.selectedObjectIds = i, e.selectedObjectId = [...i].at(-1) || null, e.selectedEntity = i.size ? "object" : "camera", e.boxSelection = null, e.boxSelectMode = !1, Ae(e), e.interactionElement?.style && (e.interactionElement.style.cursor = ""), e.refreshObjects(), e.refreshInspector(), e.render(), e.setStatus(_("{count} object(s) selected").replace("{count}", String(i.size))), !0;
}
function Os(e, t) {
  return !e.pointerHit && !e.gizmoDrag && !e.targetFreeDrag && e.drag && !e.drag.navigationOnly && t && Math.hypot(t.clientX - e.drag.x, t.clientY - e.drag.y) < 5 && (t.button === 0 || t.button === void 0) && (e.selectedEntity === "object" || e.selectedObjectId !== null || e.selectedEntity === "camera_target" || e.selectedEntity === "camera_path") ? (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = null, e.subSelection = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_("Deselected")), !0) : !1;
}
function Ps(e) {
  Ae(e), e.drag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.keyDrag = null, e.pointerHit = !1, e.canvas.classList.remove("dragging"), e.interactionElement?.style && (e.interactionElement.style.cursor = "default");
}
function _l(e, t) {
  if (e.modalTransform) {
    t.preventDefault?.(), t.stopPropagation?.(), t.button === 0 ? Xr(e) : t.button === 2 && Yr(e);
    return;
  }
  if (t.target?.closest?.("button,input,select")) return;
  if (t.button === 2 && !Jt(e, t)) {
    t.preventDefault?.(), t.stopPropagation?.(), t.stopImmediatePropagation?.();
    return;
  }
  t.preventDefault?.(), t.stopPropagation?.(), e.closeMenus(), e.interactionElement.focus({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(t.pointerId), e.activePointerId = t.pointerId, e.canvas.classList.add("dragging");
  const a = e.interactionElement.getBoundingClientRect(), r = (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width), o = (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height), n = Q(e), s = e.state.view_mode !== "camera", i = Jt(e, t), l = t.button === 0 && !i, c = l && !t.altKey && !t.shiftKey, d = e.transformControlsWiring?.isPointerOverHandle?.();
  !c && d && t.stopImmediatePropagation?.();
  const m = e.transformControlsWiring?.currentLiveType?.();
  if (c && (!d || m === "path_point" || m === "camera") && os(e, { pointerX: r, pointerY: o, overHandle: d, viewCamera: n, e: t }) || c && d || l && ts(e, { pointerX: r, pointerY: o, shiftKey: t.shiftKey, altKey: t.altKey })) return;
  const h = c ? $r(e, [r, o]) : null;
  if (h) {
    const [y, C] = h.segment, S = Math.max(1, Math.hypot(C[0] - y[0], C[1] - y[1])), A = {
      pointer: [r, o],
      axis: h.axis,
      axisIndex: h.index,
      screen: [(C[0] - y[0]) / S, (C[1] - y[1]) / S],
      worldLength: h.worldLength,
      screenLength: S,
      free: !!h.free
    };
    if (e.interactionElement.style && (e.interactionElement.style.cursor = "grabbing"), h.entity.type === "camera_target") {
      e.checkpoint("Move camera target"), e.beginCameraEdit();
      const g = e.activeCameraTrack?.(), x = !!g?.target_object_id;
      e.gizmoDrag = {
        ...A,
        type: "camera_target",
        historyCheckpointed: !0,
        tracking: x,
        target: x ? [...g.target_offset || [0, 0, 0]] : [...h.entity.position || e.camera.target]
      };
      return;
    }
    if (h.entity.type === "camera") {
      e.checkpoint("Transform camera"), e.beginCameraEdit(), e.gizmoDrag = {
        ...A,
        type: "camera",
        historyCheckpointed: !0,
        position: [...h.entity.position || e.camera.position],
        target: [...e.camera.target]
      };
      return;
    }
    if (h.entity.type === "camera_path" && us(e, { baseDrag: A, viewCamera: n, entityPosition: h.entity.position })) return;
    if (h.entity.type === "object") {
      const g = h.entity.object;
      e.checkpoint("Transform object");
      const x = Ur(e), E = (x.length ? x : [g]).map((F) => ({ object: F, transform: me(F) }));
      for (const F of E) e.beginObjectEdit(F.object);
      const G = E.reduce((F, X) => M(F, X.transform.position), [0, 0, 0]).map((F) => F / E.length);
      e.gizmoDrag = {
        ...A,
        type: "object",
        historyCheckpointed: !0,
        object: g,
        group: E,
        groupPivot: G,
        // Same value as picked.entity.position -- the gizmo always sits at the
        // object's own origin (see activeGizmoEntity) -- `origin` is the name
        // that documents this is the drag base, in case a future entity type
        // ever needs its display position to differ from its transform again.
        position: [...h.entity.origin || h.entity.position],
        rotation: [...h.entity.rotation],
        size: [...h.entity.size],
        viewRight: H(n).right,
        viewUp: H(n).up,
        freeScale: n.camera_type === "orthographic" ? Ge(n, e.canvas.height) : W(j(n.position, h.entity.position)) * (2 * Math.tan((n.fov || 35) * Math.PI / 360)) / e.canvas.height
      };
      return;
    }
  }
  const u = l ? Cs(e, [r, o]) : null;
  if (e.pointerHit = !!(h || u), u) {
    if (u.type === "camera_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(u.camera.id), e.setFrame(u.keyframe.frame), e.selectKeyframe(u.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_("{value1} · Keyframe @ F{value2} selected", { value1: u.camera.name, value2: u.keyframe.frame }));
      return;
    }
    if (u.type === "object_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectId = u.object.id, e.editingKeyFrame = null, e.setFrame(u.keyframe.frame), e.selectKeyframe(u.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_("{value1} · Keyframe @ F{value2} selected", { value1: u.object.name || u.object.type, value2: u.keyframe.frame }));
      return;
    }
    if (u.type === "camera_target") {
      if (e.finishCameraEdit(), e.selectedEntity = "camera_target", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(u.camera.id), u.camera.locked) {
        e.setStatus(_("{name} is locked").replace("{name}", u.camera.name)), e.refreshObjects(), e.refreshInspector(), e.render();
        return;
      }
      e.checkpoint("Move camera target"), e.beginCameraEdit();
      const { right: y, up: C } = H(n), S = [...e.camera.target], A = e.activeCameraTrack?.(), g = !!A?.target_object_id;
      e.targetFreeDrag = {
        pointer: [r, o],
        target: g ? [...A.target_offset || [0, 0, 0]] : S,
        tracking: g,
        right: y,
        up: C,
        // Identical to the old perspective expression, and finally correct for
        // an orthographic view: that branch scaled by distance and ignored
        // `zoom` entirely, so the target ran away from the cursor as soon as
        // the view was zoomed (5x zoom moved it more than five times too far).
        // The pointer deltas here are backing pixels, hence canvas.height.
        scale: Ge(n, e.canvas.height),
        historyCheckpointed: !0
      }, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_("{value1} · Target aim selected", { value1: u.camera.name }));
      return;
    }
    if (u.type === "camera") {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.editingKeyFrame = null, e.activateCamera(u.camera.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(_("{value1} selected", { value1: u.camera.name }));
      return;
    }
    if (u.type === "camera_path") {
      ms(e, u.camera);
      return;
    }
    if (u.type === "object" && u.object) {
      if (e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectIds ||= /* @__PURE__ */ new Set(), t.shiftKey || t.ctrlKey || t.metaKey ? e.selectedObjectIds.has(u.object.id) ? e.selectedObjectIds.delete(u.object.id) : e.selectedObjectIds.add(u.object.id) : e.selectedObjectIds = /* @__PURE__ */ new Set([u.object.id]), e.selectedObjectId = e.selectedObjectIds.has(u.object.id) ? u.object.id : [...e.selectedObjectIds].at(-1) || null, e.selectedKeyFrame = u.object.keyframes?.find((y) => y.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.state.select_mode && e.state.select_mode !== "object") {
        const y = e.webgl?.pickSubElement?.(r, o, e.canvas.width, e.canvas.height, e.state.select_mode);
        if (y) {
          e.subSelection = y;
          const C = y.point.map((A) => Math.round(A * 100) / 100).join(", "), S = y.mode === "vertex" ? "Vertex" : y.mode === "edge" ? "Edge" : "Face";
          e.setStatus(_("{value1} selected at [{value2}] · Press F to focus", { value1: S, value2: C }));
        } else
          e.subSelection = null;
      } else
        e.subSelection = null, e.setStatus(_("{value1} selected", { value1: u.object.name || u.object.type }));
      e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
      return;
    }
  }
  if (!u && l && !t.ctrlKey && !t.metaKey && kt(e) !== "simple") {
    e.boxSelection = {
      start: [r, o],
      current: [r, o],
      additive: t.shiftKey,
      initial: new Set(e.selectedObjectIds || [])
    }, e.drag = null, e.interactionElement.style && (e.interactionElement.style.cursor = "crosshair"), e.render();
    return;
  }
  const f = !!e.isNavigatingFly, w = ns(e, t, n);
  if (!f && !w) return;
  if (!s && e.state.camera_lock) {
    e.setStatus?.(_("Camera View is locked (click 🔒 to unlock)"));
    return;
  }
  const v = !f && w === "pan", b = !f && w === "dolly";
  s && !e.state.editor_views && (e.state.editor_views = Le()), e.drag = {
    x: t.clientX,
    y: t.clientY,
    button: t.button,
    moved: !1,
    shift: v,
    dolly: b,
    fly: f,
    camera: q(n),
    target: s ? e.state.editor_views[e.state.view_mode] || (e.state.editor_views[e.state.view_mode] = Le()[e.state.view_mode]) : e.camera,
    editorView: s,
    navigationOnly: i,
    historyCheckpointed: !1
  }, e.interactionElement.style && (e.interactionElement.style.cursor = b ? "ns-resize" : v ? "move" : "grabbing"), e.setStatus?.(_(f ? "Fly" : b ? "Dolly" : v ? "Pan" : "Orbit"));
}
function Sl(e, t) {
  if (e.lastPointerEvent = t, e.transformControlsDragging) return;
  if (e.modalTransform) {
    Oe(e, t);
    return;
  }
  if (e.pathDrag) {
    const s = e.interactionElement.getBoundingClientRect(), i = (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width), l = (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height);
    if (!e.pathDrag.moved && Math.hypot(i - e.pathDrag.startX, l - e.pathDrag.startY) < 3) return;
    e.pathDrag.moved = !0, ge(e, e.pathDrag, "Move path key");
    const d = ((e.state.cameras || []).find((m) => m.id === e.pathDrag.cameraId)?.keyframes || []).find((m) => m.frame === e.pathDrag.frame);
    d && (d.camera.position = Zt(
      [i, l],
      Q(e),
      e.pathDrag.anchor,
      e.canvas.width,
      e.canvas.height
    ), d.interpolation = es(d.interpolation), e.webgl && (e.webgl.pathKey = ""), e.setFrame(e.frame, !1, !1), e.render());
    return;
  }
  if (e.curveHandleDrag) {
    const s = e.interactionElement.getBoundingClientRect(), i = (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width), l = (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height);
    if (!e.curveHandleDrag.moved && Math.hypot(i - e.curveHandleDrag.startX, l - e.curveHandleDrag.startY) < 3) return;
    e.curveHandleDrag.moved = !0, ge(e, e.curveHandleDrag, "Edit curve handle");
    const d = ((e.state.cameras || []).find((m) => m.id === e.curveHandleDrag.cameraId)?.keyframes || []).find((m) => m.frame === e.curveHandleDrag.frame);
    if (d) {
      const m = Zt(
        [i, l],
        Q(e),
        e.curveHandleDrag.anchor,
        e.canvas.width,
        e.canvas.height
      );
      e.dragCurveHandle?.(d, e.curveHandleDrag.side, m, {
        prevKey: e.curveHandleDrag.prevKey,
        nextKey: e.curveHandleDrag.nextKey,
        breakCoupling: t.altKey
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
    _n(e, t);
    return;
  }
  if (e.targetFreeDrag) {
    ge(e, e.targetFreeDrag, "Move camera target");
    const s = e.interactionElement.getBoundingClientRect(), i = (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width), l = (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height), c = i - e.targetFreeDrag.pointer[0], d = l - e.targetFreeDrag.pointer[1], m = t.shiftKey ? 0.1 : 1, p = M(T(e.targetFreeDrag.right, c * e.targetFreeDrag.scale * m), T(e.targetFreeDrag.up, -d * e.targetFreeDrag.scale * m)), h = ye(e, M(e.targetFreeDrag.target, p), [i, l]);
    e.targetFreeDrag.tracking ? aa(e, h) : e.camera.target = h, e.commitCameraEdit(), e.refreshInspector(), e.render();
    return;
  }
  if (e.gizmoDrag) {
    ge(e, e.gizmoDrag, e.gizmoDrag.type === "object" ? "Transform object" : "Transform camera");
    const s = e.interactionElement.getBoundingClientRect(), i = [
      (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width),
      (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height)
    ], l = t.shiftKey ? 0.1 : 1, c = ((i[0] - e.gizmoDrag.pointer[0]) * e.gizmoDrag.screen[0] + (i[1] - e.gizmoDrag.pointer[1]) * e.gizmoDrag.screen[1]) * l, d = t.ctrlKey || t.metaKey || e.state.spatial_snap_mode === "grid";
    if (e.gizmoDrag.type === "camera_target") {
      const h = M(e.gizmoDrag.target, T(e.gizmoDrag.axis, c * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength)), u = ye(e, h, i, [], { base: e.gizmoDrag.target, axis: e.gizmoDrag.axis });
      e.gizmoDrag.tracking ? aa(e, u) : e.camera.target = u, e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.gizmoDrag.type === "camera") {
      if (e.state.gizmo_mode === "translate") {
        const h = M(e.gizmoDrag.position, T(e.gizmoDrag.axis, c * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
        e.camera.position = ye(e, h, i, [], { base: e.gizmoDrag.position, axis: e.gizmoDrag.axis });
      } else {
        const h = d ? ne(c * 0.015, Math.PI / 12) : c * 0.015, u = j(e.gizmoDrag.target, e.gizmoDrag.position), f = xe(u, T(e.gizmoDrag.axis, h * (180 / Math.PI)));
        e.camera.target = M(e.gizmoDrag.position, f);
      }
      e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.gizmoDrag.type === "camera_path") return void ps(e, { pointer: i, deltaPixels: c, precision: l, snapping: d });
    if (e.state.gizmo_mode === "translate")
      if (e.gizmoDrag.free) {
        const h = (i[0] - e.gizmoDrag.pointer[0]) * l, u = (i[1] - e.gizmoDrag.pointer[1]) * l, f = M(
          e.gizmoDrag.position,
          M(T(e.gizmoDrag.viewRight, h * e.gizmoDrag.freeScale), T(e.gizmoDrag.viewUp, -u * e.gizmoDrag.freeScale))
        );
        e.gizmoDrag.object.position = ye(e, f, i, [e.gizmoDrag.object.id]);
      } else {
        const h = M(e.gizmoDrag.position, T(e.gizmoDrag.axis, c * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
        e.gizmoDrag.object.position = ye(e, h, i, [e.gizmoDrag.object.id], { base: e.gizmoDrag.position, axis: e.gizmoDrag.axis });
      }
    else if (e.state.gizmo_mode === "scale")
      if (e.gizmoDrag.free) {
        const h = (i[0] - e.gizmoDrag.pointer[0]) * l, u = (i[1] - e.gizmoDrag.pointer[1]) * l, f = (h - u) * e.gizmoDrag.freeScale, w = e.gizmoDrag.size.map((v) => {
          const b = v + f;
          return Math.max(0.01, d ? ne(b, 0.1) : b);
        });
        e.gizmoDrag.object.size = w;
      } else {
        const h = [...e.gizmoDrag.size], u = h[e.gizmoDrag.axisIndex] + c * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength;
        h[e.gizmoDrag.axisIndex] = Math.max(0.01, d ? ne(u, 0.1) : u), e.gizmoDrag.object.size = h;
      }
    else {
      const h = [...e.gizmoDrag.rotation], u = h[e.gizmoDrag.axisIndex] + c * 0.75;
      h[e.gizmoDrag.axisIndex] = d ? ne(u, 15) : u, e.gizmoDrag.object.rotation = h;
    }
    const m = e.gizmoDrag.group || [], p = m.find((h) => h.object === e.gizmoDrag.object)?.transform;
    if (m.length > 1 && p)
      if (e.state.gizmo_mode === "translate") {
        const h = j(e.gizmoDrag.object.position, p.position);
        for (const u of m) u.object.position = M(u.transform.position, h);
      } else if (e.state.gizmo_mode === "rotate") {
        const h = j(e.gizmoDrag.object.rotation, p.rotation);
        for (const u of m)
          u.object.position = M(e.gizmoDrag.groupPivot, xe(j(u.transform.position, e.gizmoDrag.groupPivot), h)), u.object.rotation = M(u.transform.rotation, h);
      } else {
        const h = e.gizmoDrag.object.size.map((u, f) => u / Math.max(0.01, p.size[f]));
        for (const u of m) {
          const f = j(u.transform.position, e.gizmoDrag.groupPivot);
          u.object.position = M(e.gizmoDrag.groupPivot, f.map((w, v) => w * h[v])), u.object.size = u.transform.size.map((w, v) => Math.max(0.01, w * h[v]));
        }
      }
    for (const h of m.length ? m : [{ object: e.gizmoDrag.object }]) e.commitObjectEdit(h.object);
    e.refreshInspector(), e.render();
    return;
  }
  if (!e.drag) {
    const s = e.interactionElement.getBoundingClientRect(), i = $r(e, [
      (t.clientX - s.left) * e.canvas.width / Math.max(1, s.width),
      (t.clientY - s.top) * e.canvas.height / Math.max(1, s.height)
    ]), l = i ? i.free ? "free" : i.index : null;
    l !== e.hoveredGizmoHandle && (e.hoveredGizmoHandle = l, e.interactionElement.style && (e.interactionElement.style.cursor = i ? "grab" : "default"), e.render());
    return;
  }
  const a = t.clientX - e.drag.x, r = t.clientY - e.drag.y;
  if (!e.drag.historyCheckpointed && Math.hypot(a, r) < 3) return;
  e.drag.moved = !0;
  const o = !e.drag.historyCheckpointed && !e.drag.editorView;
  ge(e, e.drag, e.drag.editorView ? "Navigate viewport" : "Move camera"), o && e.beginCameraEdit();
  const n = e.drag.camera;
  if (e.drag.dolly) {
    const s = Math.exp(r * 5e-3 * (e.dollySensitivity ?? 1)), i = j(n.position, n.target);
    e.drag.target.position = M(n.target, T(i, s)), e.drag.target.camera_type === "orthographic" && (e.drag.target.zoom = Math.max(0.01, (n.zoom || 1) / s));
  } else if (e.drag.fly) {
    const s = j(n.target, n.position), i = W(s);
    let l = Math.atan2(s[0], s[2]), c = Math.asin(D(s[1] / i, -0.999, 0.999));
    l -= a * 8e-3, c = D(c - r * 8e-3, -1.45, 1.45), e.drag.target.target = [
      n.position[0] + i * Math.sin(l) * Math.cos(c),
      n.position[1] + i * Math.sin(c),
      n.position[2] + i * Math.cos(l) * Math.cos(c)
    ];
  } else if (e.drag.shift) {
    const { right: s, up: i } = H(n), l = Ge(n, e.interactionElement.getBoundingClientRect().height) * (e.panSensitivity ?? 1), c = M(T(s, -a * l), T(i, r * l));
    e.drag.target.position = M(n.position, c), e.drag.target.target = M(n.target, c);
  } else {
    const s = j(n.position, n.target), i = W(s);
    let l = Math.atan2(s[0], s[2]), c = Math.asin(D(s[1] / i, -0.999, 0.999));
    l -= a * 8e-3, c = D(c + r * 8e-3, -1.45, 1.45), e.drag.target.position = [
      n.target[0] + i * Math.sin(l) * Math.cos(c),
      n.target[1] + i * Math.sin(c),
      n.target[2] + i * Math.cos(l) * Math.cos(c)
    ];
  }
  e.drag.editorView ? (e.scheduleSerialize(), e.render()) : e.commitCameraEdit();
}
function Zr(e) {
  if (e.transformControlsDragging)
    return e.transformControlsWiring?.cancelDrag(), !0;
  if (!e.drag && !e.gizmoDrag && !e.targetFreeDrag && !e.boxSelection && !e.pathDrag && !e.keyDrag && !e.curveDrag && !e.timelineDrag && !e.timelinePanDrag && !e.boxSelect && !e.curvePanDrag && !e.curveScrub && !e.curveBoxSelect) return !1;
  const t = [e.drag, e.gizmoDrag, e.targetFreeDrag, e.pathDrag, e.keyDrag, e.curveDrag].some((a) => a?.historyCheckpointed);
  return e.keyDrag?.badge?.remove?.(), e.boxSelect?.overlay?.remove?.(), e.drag?.camera && e.drag?.target && (Object.assign(e.drag.target, e.drag.camera), e.drag.editorView && e.scheduleSerialize()), e.drag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.boxSelection = null, e.pathDrag = null, e.keyDrag = null, e.curveDrag = null, e.timelineDrag = null, e.timelinePanDrag = null, e.boxSelect = null, e.curvePanDrag = null, e.curveScrub = null, e.curveBoxSelect = null, Ae(e), t && e.undo(), e.finishCameraEdit(), e.refreshInspector(), e.render(), e.setStatus(_("Interaction cancelled")), !0;
}
function wl(e, t) {
  if (t?.type === "pointercancel" || t?.type === "lostpointercapture") {
    t.pointerId === e.activePointerId && Zr(e);
    return;
  }
  if (e.pathDrag) {
    const s = e.pathDrag.moved;
    e.pathDrag = null, Ae(e), s && (e.scheduleSerialize(), e.refreshKeys(), e.setStatus(_("Path key moved")));
    return;
  }
  if (e.curveHandleDrag) {
    const s = e.curveHandleDrag.moved;
    e.curveHandleDrag = null, Ae(e), s && (e.webgl && (e.webgl.pathKey = ""), e.scheduleSerialize(), e.refreshKeys(), e.setStatus(_("Curve handle updated")));
    return;
  }
  if (e.boxSelection) {
    Is(e);
    return;
  }
  const a = e.keyDrag, r = !!(e.drag && !e.drag.editorView || e.targetFreeDrag), o = !!e.gizmoDrag;
  e.gizmoDrag?.type === "camera_path" && (e.serialize?.(), e.refreshKeys?.(), e.setStatus(_("Camera path transformed"))), e.drag && (e.lastRightClickWasDrag = !!(e.drag.button === 2 && (e.drag.moved || e.drag.historyCheckpointed))), Os(e, t), Ps(e), a && (a.badge?.remove(), e.editingKeyFrame = null, e.updateKeyVisualState(), e.root.focus({ preventScroll: !0 }), a.engaged && (e.suppressKeyClick = !0, setTimeout(() => {
    e.suppressKeyClick = !1;
  }, 100))), r && e.finishCameraEdit(), o && (e.editingKeyFrame = null, e.updateKeyVisualState(), e.drawCurveEditor());
}
function Cl(e, t) {
  if (t.target.closest?.(".viewport-inspector, .scene-tree, .menu-panel, .context-menu, .viewport-quick-bar"))
    return;
  t.preventDefault(), t.stopPropagation(), e.closeMenus();
  const a = is(t, e.interactionElement.getBoundingClientRect().height);
  if (!a) return;
  if (e.isNavigatingFly) {
    e.cameraSpeed = D(e.cameraSpeed * Math.exp(-a * 1e-3), 0.05, 20), e.setStatus(_("Fly speed: {value1}x", { value1: e.cameraSpeed.toFixed(2) }));
    return;
  }
  Ds(e);
  const r = e.state.view_mode !== "camera";
  if (!r && e.state.camera_lock) {
    e.setStatus?.(_("Camera View is locked (click 🔒 to unlock)"));
    return;
  }
  const o = Q(e);
  r || e.beginCameraEdit();
  const n = D(a * 1e-3, -0.4, 0.4), s = j(o.position, o.target);
  o.position = M(o.target, T(s, Math.exp(n))), o.camera_type === "orthographic" && (o.zoom = Math.max(0.01, (o.zoom || 1) * Math.exp(-n))), r ? (e.scheduleSerialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit());
}
const Ns = (e) => {
  const t = new Set((e.motion_layers || []).map((r) => r.id));
  let a = t.size + 1;
  for (; t.has(`motion_${a}`); ) a += 1;
  return `motion_${a}`;
};
function We(e, { sourceKind: t = "manual_2d", label: a, keys: r, source: o = {} }) {
  if (!ua.includes(t)) throw new Error(`Unsupported motion source: ${t}`);
  const n = Ns(e), s = { id: n, label: a || `Motion ${n.split("_").at(-1)}`, enabled: !0, semantic: "screen_point", source_kind: t, keys: r.map((i) => ({ visible: !0, interpolation: "linear", ...i })), source: { ...o } };
  return e.motion_layers ||= [], e.motion_layers.push(s), e.selected_motion_layer_id = n, s;
}
function tt(e) {
  return (e.motion_layers || []).find((t) => t.id === e.selected_motion_layer_id) || null;
}
function At(e, t) {
  return e.motion_tool = ma.includes(t) ? t : "select", e.motion_tool;
}
function Rs(e, t) {
  if (pa.includes(t))
    for (const a of e.keys) a.interpolation = t;
}
function zs(e, t, a) {
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
function Qr(e, t) {
  e.motion_layers = (e.motion_layers || []).filter((a) => a.id !== t), e.selected_motion_layer_id === t && (e.selected_motion_layer_id = e.motion_layers[0]?.id || null);
}
function Ls(e, t) {
  const a = t.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (e.clientX - a.left) / Math.max(1, a.width))),
    y: Math.max(0, Math.min(1, (e.clientY - a.top) / Math.max(1, a.height)))
  };
}
function Fs(e, t, a, r, o) {
  const n = de(e, a, e.objects);
  let s = t?.point;
  if (t?.object_id) {
    const d = e.objects.find((h) => h.id === t.object_id);
    if (!d) return null;
    const m = dn(e.objects, d), p = Array.isArray(t.local_point) ? t.local_point : [0, 0, 0];
    s = [m.position[0] + p[0] * m.size[0], m.position[1] + p[1] * m.size[1], m.position[2] + p[2] * m.size[2]];
  }
  if (!Array.isArray(s)) return null;
  const i = V(s, n, r, o);
  if (!i) return null;
  const l = i[0] / r, c = i[1] / o;
  return { x: l, y: c, visible: l >= 0 && l <= 1 && c >= 0 && c <= 1 };
}
function Bs(e, t = 6e-3) {
  if (e.length < 3) return e;
  const a = [e[0]];
  for (const r of e.slice(1, -1)) {
    const o = a.at(-1);
    Math.hypot(r.x - o.x, r.y - o.y) >= t && a.push(r);
  }
  return a.push(e.at(-1)), a;
}
function Jr(e, t, a = 0.035) {
  let r = null, o = a;
  for (const n of e || []) for (const s of n.keys || []) {
    const i = Math.hypot(s.x - t.x, s.y - t.y);
    i <= o && (r = n, o = i);
  }
  return r;
}
function Ks(e, t, a, r) {
  const o = Bs(t);
  if (o.length < 2) return null;
  const n = Math.max(0, r - a);
  return We(e, {
    sourceKind: "manual_2d",
    label: `Track ${(e.motion_layers || []).length + 1}`,
    keys: o.map((s, i) => ({ ...s, time_seconds: a + n * i / (o.length - 1) }))
  });
}
function at(e, t) {
  return Ls(t, e.interactionElement);
}
function Vs(e, t) {
  const a = Jr(e.motion_layers, t);
  return a ? (Qr(e, a.id), a) : null;
}
const rt = (e) => {
  e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.();
}, ra = (e) => {
  const t = e.state.playback_range || [e.frame, e.state.duration_frames - 1];
  return [t[0] / e.state.fps, t[1] / e.state.fps];
}, oe = (e, t) => {
  e.serialize(), e.render(), e.setStatus(t);
};
function $e(e) {
  for (const t of e.root.querySelectorAll("[data-motion-tool]")) {
    const a = t.dataset.motionTool === e.state.motion_tool;
    t.classList.toggle("active", a), t.setAttribute("aria-pressed", String(a));
  }
  e.interactionElement.dataset.motionTool = e.state.motion_tool;
}
function Gs(e, t) {
  const a = e.state.objects.find((c) => c.id === e.selectedObjectId), r = e.motionCreationKind, n = (r === "object" || r !== "world" && !!a) && a ? "object_point" : "world_point", s = n === "object_point" ? { object_id: a.id, local_point: [0, 0, 0] } : { point: e.webgl?.intersectScenePoint?.(t.x * e.canvas.width, t.y * e.canvas.height, e.canvas.width, e.canvas.height) || [...e.camera.target] }, i = Fs(e.state, s, e.frame, e.canvas.width, e.canvas.height) || t, l = n === "object_point" ? `${a.name || a.id} Track` : "World Anchor";
  return We(e.state, { sourceKind: n, label: l, keys: [{ time_seconds: e.frame / e.state.fps, x: i.x, y: i.y, visible: i.visible !== !1 }], source: s });
}
function Ml(e, t) {
  for (const o of e.root.querySelectorAll("[data-motion-tool]"))
    o.addEventListener("click", () => {
      e.motionCreationKind = "", At(e.state, o.dataset.motionTool), $e(e), e.render();
    }, { signal: t });
  for (const o of e.root.querySelectorAll("[data-motion-preset]"))
    o.addEventListener("click", () => {
      e.checkpoint("Add camera field"), We(e.state, { sourceKind: "camera_field", label: `${o.dataset.motionPreset} Field`, keys: [{ time_seconds: 0, x: 0.5, y: 0.5 }], source: { preset: o.dataset.motionPreset, point: [...e.camera.target] } }), oe(e, `Camera field: ${o.dataset.motionPreset}`);
    }, { signal: t });
  e.root.querySelector('[data-role="motion-interpolation"]')?.addEventListener("change", (o) => {
    const n = tt(e.state);
    n && (e.checkpoint("Set motion interpolation"), Rs(n, o.target.value), oe(e, `Motion interpolation: ${o.target.value}`));
  }, { signal: t }), e.root.querySelector('[data-role="motion-key-visible"]')?.addEventListener("change", (o) => {
    const n = tt(e.state);
    if (!n?.keys?.length) return;
    const s = e.frame / e.state.fps, i = n.keys.reduce((l, c) => Math.abs(c.time_seconds - s) < Math.abs(l.time_seconds - s) ? c : l);
    e.checkpoint("Set motion visibility"), i.visible = o.target.checked, oe(e, `Motion key ${i.visible ? "visible" : "hidden"}`);
  }, { signal: t });
  for (const o of e.root.querySelectorAll("[data-motion-layer-action]"))
    o.addEventListener("click", () => {
      const n = tt(e.state);
      if (!n) return;
      const s = o.dataset.motionLayerAction;
      if (e.checkpoint(s === "delete" ? "Delete motion layer" : s === "retime" ? "Retime motion layer" : "Toggle motion layer"), s === "delete") Qr(e.state, n.id);
      else if (s === "retime") {
        const [i, l] = ra(e);
        zs(n, i, l);
      } else n.enabled = !n.enabled;
      oe(e, s === "delete" ? "Motion layer deleted" : s === "retime" ? "Motion layer retimed" : `Motion layer ${n.enabled ? "enabled" : "disabled"}`);
    }, { signal: t });
  const a = e.interactionElement;
  a.addEventListener("pointerdown", (o) => {
    const n = e.state.motion_tool;
    if (n === "select" || o.button !== 0) return;
    rt(o), a.setPointerCapture?.(o.pointerId);
    const s = at(e, o);
    if (n === "track") {
      e.checkpoint("Draw motion track"), e.motionTrackDraft = { pointerId: o.pointerId, points: [s] };
      return;
    }
    e.checkpoint(n === "erase" ? "Erase motion track" : "Add motion anchor"), n === "anchor" ? We(e.state, { sourceKind: "static_anchor", label: `Anchor ${(e.state.motion_layers || []).length + 1}`, keys: [{ time_seconds: e.frame / e.state.fps, ...s, interpolation: "hold" }] }) : n === "project" ? Gs(e, s) : n === "erase" && Vs(e.state, s), oe(e, `Motion tool: ${n}`);
  }, { capture: !0, signal: t }), a.addEventListener("pointermove", (o) => {
    e.motionTrackDraft?.pointerId === o.pointerId && (rt(o), e.motionTrackDraft.points.push(at(e, o)), e.render());
  }, { capture: !0, signal: t });
  const r = (o) => {
    const n = e.motionTrackDraft;
    if (n?.pointerId !== o.pointerId) return;
    rt(o), e.motionTrackDraft = null;
    const [s, i] = ra(e), l = Ks(e.state, n.points, s, i);
    oe(e, l ? `Motion track: ${l.label}` : "Motion track needs a longer stroke");
  };
  a.addEventListener("pointerup", r, { capture: !0, signal: t }), a.addEventListener("pointercancel", r, { capture: !0, signal: t }), a.addEventListener("click", (o) => {
    if (e.state.motion_tool !== "select" || o.button !== 0) return;
    const n = Jr(e.state.motion_layers, at(e, o));
    n && (e.state.selected_motion_layer_id = n.id, e.render());
  }, { signal: t }), $e(e);
}
const qs = {
  draw: { tool: "track", label: "Draw Path", hint: "Draw a trajectory in the Camera View. Release to finish, Esc to cancel." },
  object: { tool: "project", label: "Track Object", hint: "Click the selected object in the viewport to follow it." },
  world: { tool: "project", label: "World Point", hint: "Click a surface or point in the viewport to pin a fixed 3D point." },
  anchor: { tool: "anchor", label: "Screen Anchor", hint: "Click to place a control point at a fixed screen position." }
};
function Hs(e, t) {
  const a = qs[t];
  if (a) {
    if (t === "object" && !(e.state.objects || []).some((r) => r.id === e.selectedObjectId)) {
      e.setStatus("Select a scene object first, then choose Track Object.");
      return;
    }
    e.checkpoint?.(`Motion: ${a.label}`), At(e.state, a.tool), e.motionCreatingLabel = a.label, e.motionCreationKind = t, $e(e), e.render(), e.setStatus(a.hint);
  }
}
function eo(e) {
  return (e.state.motion_tool || "select") === "select" && !e.motionTrackDraft ? !1 : (At(e.state, "select"), e.motionTrackDraft = null, e.motionCreatingLabel = "", e.motionCreationKind = "", $e(e), e.render(), e.setStatus("Motion creation cancelled."), !0);
}
function xl(e, t) {
  for (const a of e.root.querySelectorAll("[data-motion-create]"))
    a.addEventListener("click", () => Hs(e, a.dataset.motionCreate), { signal: t });
  e.root.querySelector("[data-motion-create-cancel]")?.addEventListener("click", () => eo(e), { signal: t });
}
const Ws = Object.freeze({
  x: ["right", "left"],
  y: ["top", "bottom"],
  z: ["front", "back"]
}), $s = Object.freeze({
  front: "back",
  back: "front",
  right: "left",
  left: "right",
  top: "bottom",
  bottom: "top"
});
function kl(e, t) {
  const a = Ws[e];
  return a ? t === a[0] ? a[1] : a[0] : null;
}
function Us(e) {
  return $s[e] || null;
}
function oa(e, t, a) {
  const r = e.viewportCamera(), o = e.state.view_mode !== "camera", n = j(r.position, r.target), s = W(n);
  if (!(s > 1e-4)) return;
  const i = Math.atan2(n[0], n[2]) + t, l = D(Math.asin(D(n[1] / s, -0.999, 0.999)) + a, -1.45, 1.45);
  o || e.beginCameraEdit(), r.position = M(r.target, T([
    Math.sin(i) * Math.cos(l),
    Math.sin(l),
    Math.cos(i) * Math.cos(l)
  ], s)), o ? (e.scheduleSerialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit());
}
const be = { t: "translate", r: "rotate", s: "scale" }, Xs = [
  ["viewport", ".viewport-wrap"],
  ["sequence", '[data-role="graph-sequence"]'],
  ["timeline", '[data-role="dope-stage"]'],
  ["graph", ".curve-editor"],
  ["timeline", ".oc-timeline"],
  // The outliner / scene panel: without its own zone a Delete pressed with a
  // scene row focused fell through to whatever zone was last touched (usually
  // the timeline, which only deletes keyframes) so objects could not be
  // removed from the tree at all.
  ["scene", '[data-tab-panel="scene"]']
], Ys = 'button,summary,a[href],[role="button"],[role="menuitem"],[role="tab"],[role="option"],[role="checkbox"],[role="switch"]';
function Zs(e) {
  return e instanceof HTMLElement || e instanceof SVGElement ? !!e.closest?.(Ys) : !1;
}
function Qs(e) {
  const t = typeof Element < "u" ? Element : typeof HTMLElement < "u" ? HTMLElement : null;
  return t && !(e instanceof t) || !e || typeof e != "object" ? !1 : ["INPUT", "SELECT", "TEXTAREA"].includes(e.tagName) || !!e.isContentEditable || !!e.closest?.('[contenteditable="true"],span.property_value');
}
function Js(e) {
  const t = typeof HTMLElement < "u" && e instanceof HTMLElement || e?.closest ? e : null;
  for (const [a, r] of Xs)
    if (t?.closest?.(r)) return a;
  return null;
}
function ei(e, t) {
  return Js(e) || t?.lastKeyZone || "viewport";
}
let na = !1;
function ti() {
  na || typeof window > "u" || (na = !0, window.addEventListener("keydown", (e) => {
    if (!Kn()) return;
    const t = e.composedPath?.()[0] || e.target, a = Vn(t);
    !a || a.disposed || ai(a, e) && (e.preventDefault(), e.stopImmediatePropagation?.(), e.stopPropagation());
  }, { capture: !0 }));
}
function ai(e, t) {
  if (!qn()) return !1;
  const a = t.composedPath?.()[0] || t.target;
  if (Qs(a) || (t.code === "Space" || t.key === "Enter") && Zs(a)) return !1;
  if (e.contextMenu.onKey(t)) return !0;
  if (e.modalTransform)
    return Ts(e, t), !0;
  if (oi(e, t)) return !0;
  const r = t.code;
  if ((t.ctrlKey || t.metaKey) && !r.startsWith("Numpad") || t.altKey) return !1;
  const o = ei(a, e);
  switch (o) {
    case "viewport":
      return ni(e, t);
    case "sequence":
      return ii(e, t);
    case "timeline":
    case "graph":
      return si(e, t, o);
    case "scene":
      return ri(e, t);
    default:
      return !1;
  }
}
function ri(e, t) {
  return t.key === "Delete" || t.key === "Backspace" ? (t.repeat || (e.selectedObjectIds?.size > 1 ? e.deleteSelectedObjects?.() : e.selectedObjectId && e.deleteObject(e.selectedObjectId)), !0) : t.key === "F2" ? (!t.repeat && e.selectedObjectId && e.renameObject(e.selectedObjectId), !0) : t.key.toLowerCase() === "h" && !t.ctrlKey && !t.metaKey && !t.altKey ? (!t.repeat && e.selectedObjectId && e.toggleObject(e.selectedObjectId), !0) : t.key === "Escape" ? !(e.selectedObjectIds?.size || e.selectedObjectId) ? !1 : (e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.refreshObjects(), e.refreshInspector(), e.render(), !0) : !1;
}
function oi(e, t) {
  const a = t.key.toLowerCase(), r = t.ctrlKey || t.metaKey;
  return a === "escape" ? e.cameraPathDraw?.drawing && e.cancelCameraPathDraw?.() || Zr(e) || e.cancelCameraPathDraw?.() || eo(e) ? !0 : e.isNavigatingFly ? (e.isNavigatingFly = !1, e.setStatus("Fly Mode OFF"), !0) : !1 : r && a === "z" ? (t.repeat || (t.shiftKey ? e.redo() : e.undo()), !0) : r && a === "y" ? (t.repeat || e.redo(), !0) : r && a === "c" ? e.selectedKeyframe() ? (e.copyKeyframe(), !0) : !1 : r && a === "v" ? e.copiedKeyframe ? (e.pasteKeyframe(), !0) : !1 : r && a === "d" ? (t.repeat || (e.selectedEntity === "object" && e.selectedObjectId ? e.duplicateObject(e.selectedObjectId) : e.selectedEntity === "camera" && e.duplicateCamera(e.state.active_camera_id)), !0) : t.altKey && a === "h" ? (t.repeat || e.showAllObjects(), !0) : t.code === "Space" ? (t.repeat || e.togglePlay(), !0) : !1;
}
function ni(e, t) {
  const a = t.key.toLowerCase(), r = t.code;
  if (e.selectedEntity === "camera_path" && !e.isNavigatingFly) {
    if (be[a])
      return t.repeat || (e.setTransformMode(be[a]), e.setStatus(`Path ${be[a]} — drag the gizmo, or arrow keys to nudge`)), !0;
    const i = e.state.spatial_grid_size || 0.5, l = { ArrowLeft: [-i, 0, 0], ArrowRight: [i, 0, 0], ArrowUp: [0, 0, -i], ArrowDown: [0, 0, i], PageUp: [0, i, 0], PageDown: [0, -i, 0] }[t.key];
    if (l)
      return t.repeat || e.transformCameraPath({ mode: "translate", delta: l }), !0;
  }
  if (t.shiftKey && a === "g" && !e.isNavigatingFly)
    return e.selectHierarchy(), !0;
  if (be[a] && !e.isNavigatingFly)
    return t.repeat || xs(e, be[a]), !0;
  if (a === "tab") {
    const i = e.state.select_mode === "object" ? "vertex" : "object";
    return e.setSelectMode(i), e.setStatus(i === "object" ? "Object Mode" : "Component Mode: Vertex"), !0;
  }
  if (a === "f" || r === "NumpadDecimal")
    return t.repeat || e.frameTarget(), !0;
  if ((a === "a" || t.key === "Home") && !e.isNavigatingFly && !t.shiftKey)
    return t.repeat || e.frameTarget({ all: !0 }), !0;
  if ((a === "i" || a === "k") && !t.ctrlKey && !t.metaKey && !t.altKey && !e.isNavigatingFly)
    return t.repeat || e.insertKeyframe(), !0;
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
    const i = Us(e.state.view_mode);
    return i ? e.setViewMode(i) : oa(e, Math.PI, 0), !0;
  }
  const n = Math.PI / 12, s = { Numpad4: [n, 0], Numpad6: [-n, 0], Numpad8: [0, n], Numpad2: [0, -n] };
  if (s[r])
    return oa(e, s[r][0], s[r][1]), !0;
  if (r === "Numpad5")
    return e.setViewMode(e.state.view_mode === "camera" ? "perspective" : "camera"), !0;
  if (a === "h" && !t.ctrlKey && !t.metaKey && !t.altKey)
    return !t.repeat && e.selectedEntity === "object" && e.selectedObjectId && e.toggleObject(e.selectedObjectId), !0;
  if (t.key === "Delete" || t.key === "Backspace")
    return t.repeat || (e.selectedEntity === "object" && e.selectedObjectIds?.size > 1 ? e.deleteSelectedObjects() : e.selectedEntity === "object" && e.selectedObjectId ? e.deleteObject(e.selectedObjectId) : e.selectedEntity === "camera" && e.deleteCamera(e.state.active_camera_id)), !0;
  if (["w", "a", "s", "d", "q", "e"].includes(a) && e.isNavigatingFly) {
    const i = e.viewportCamera(), l = e.state.view_mode !== "camera", { right: c, up: d, forward: m } = H(i), p = (t.shiftKey ? 0.6 : 0.18) * e.cameraSpeed, h = { w: T(m, p), s: T(m, -p), d: T(c, p), a: T(c, -p), e: T(d, p), q: T(d, -p) }[a];
    return l || e.beginCameraEdit(), i.position = M(i.position, h), i.target = M(i.target, h), l ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit()), !0;
  }
  return !1;
}
function si(e, t, a) {
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
function ot(e) {
  e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render();
}
function ii(e, t) {
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
    return t.repeat || (!Re(e.state).length || a === "a" ? (e.checkpoint("Auto-split shots"), e.state.sequence = { ...e.state.sequence || { recording_path: "" }, enabled: !0, cuts: go(e.state) }, ot(e)) : (e.checkpoint("Split shot"), bo(e.state, e.frame, null) ? ot(e) : e.setStatus("Move the playhead inside a shot first"))), !0;
  if (t.key === "Delete" || t.key === "Backspace") {
    if (t.repeat) return !0;
    const r = Re(e.state), o = da(e.state, e.frame), n = o ? r.findIndex((s) => s.start === o.start) : -1;
    return n >= 0 && (e.checkpoint("Remove shot"), vo(e.state, n) && ot(e)), !0;
  }
  return !1;
}
function Tt(e, t) {
  let a = !1;
  const r = e.onRemoved, o = function(...s) {
    a = !0, r?.apply(this, s);
  };
  o.__omnicamShim = !0, e.onRemoved = o;
  const n = () => {
    e.onRemoved?.__omnicamShim && (e.onRemoved = r);
  };
  return t().then((s) => {
    n(), !(a && !e.graph) && s(e);
  }).catch((s) => {
    n(), console.error("OmniCam: node UI failed to load", s);
  });
}
const dt = "MajoorOmniCamDirector", mt = "MajoorOmniCamExtractor", ut = "MajoorOmniCamMonitor";
function Ye(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.comfyClass || e?.constructor?.type || "");
}
const to = {
  [dt]: { default: [1313, 1633], min: [760, 760] },
  [mt]: { default: [761, 1458], min: [700, 760] },
  [ut]: { default: [798, 1634], min: [640, 680] }
}, li = 0.92, ci = 0.88;
function di([e, t], [a, r]) {
  if (typeof window > "u") return [e, t];
  const o = Math.round((window.innerWidth || e) * li), n = Math.round((window.innerHeight || t) * ci);
  return [
    Math.max(a, Math.min(e, o)),
    Math.max(r, Math.min(t, n))
  ];
}
function mi(e, t) {
  const a = to[t];
  return !a || !e?.setSize ? !1 : (e.setSize(di(a.default, a.min)), !0);
}
function ui(e, t, a) {
  const r = to[t];
  if (!r || !e?.setSize) return !1;
  const o = Array.isArray(a) ? a : Array.isArray(e.size) ? e.size : [0, 0], n = Array.isArray(e.size) ? e.size : [0, 0], [s, i] = r.min, l = Math.max(Number(o[0]) || 0, s), c = Math.max(Number(o[1]) || 0, i);
  return l === n[0] && c === n[1] ? !1 : (e.setSize([l, c]), !0);
}
const sa = "oc-help-css", Ee = "#8b7bd8", ao = /* @__PURE__ */ new Map();
function Dt(e, t) {
  e && t && ao.set(e, t);
}
function pt(e) {
  return e && ao.get(e) || null;
}
const pi = `
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
.oc-help-h-icon{width:18px;height:18px;flex:none;border-radius:50%;background:${Ee};
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px}
.oc-help-h-title{flex:1;font-size:14px;font-weight:650;color:#fff;line-height:1.2}
.oc-help-close{flex:none;width:24px;height:24px;border-radius:6px;border:none;
  background:rgba(255,255,255,.06);color:#9a9aad;cursor:pointer;font-size:14px;
  line-height:1;display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s}
.oc-help-close:hover{background:${Ee};color:#fff}
.oc-help-body{padding:13px 15px 15px;overflow-y:auto;font-size:12px;line-height:1.55}
.oc-help-section{margin-bottom:14px}
.oc-help-section:last-child{margin-bottom:0}
.oc-help-h{margin:0 0 6px;font-size:10px;font-weight:700;color:${Ee};
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
  border-left:2px solid ${Ee};border-radius:3px;color:#ddd;font-size:11.5px}
`;
function fi() {
  if (document.getElementById(sa)) return;
  const e = document.createElement("style");
  e.id = sa, e.textContent = pi, document.head.appendChild(e);
}
function se(e) {
  return String(e ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`([^`]+)`/g, (a, r) => `<code>${r}</code>`);
}
function hi(e) {
  const t = document.createElement("div");
  if (t.className = "oc-help-section", e.heading) {
    const a = document.createElement("div");
    a.className = "oc-help-h", a.textContent = e.heading, t.appendChild(a);
  }
  if (e.body)
    for (const a of String(e.body).split(/\n\s*\n/)) {
      const r = document.createElement("p");
      r.className = "oc-help-p", r.innerHTML = se(a), t.appendChild(r);
    }
  if (Array.isArray(e.bullets) && e.bullets.length) {
    const a = document.createElement("ul");
    a.className = "oc-help-ul";
    for (const r of e.bullets) {
      const o = document.createElement("li");
      o.innerHTML = se(r), a.appendChild(o);
    }
    t.appendChild(a);
  }
  if (Array.isArray(e.defs) && e.defs.length) {
    const a = document.createElement("dl");
    a.className = "oc-help-defs";
    for (const r of e.defs) {
      const [o, n] = Array.isArray(r) ? r : [r, ""], s = document.createElement("dt");
      s.innerHTML = se(o);
      const i = document.createElement("dd");
      i.innerHTML = se(n), a.appendChild(s), a.appendChild(i);
    }
    t.appendChild(a);
  }
  return t;
}
let Me = null;
function gi() {
  Me && Me();
}
function ia(e) {
  e = e || {}, fi(), gi();
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
    const f = document.createElement("p");
    f.className = "oc-help-p", f.style.color = "#e6e6e6", f.innerHTML = se(e.tagline), l.appendChild(f);
  }
  const c = Array.isArray(e.sections) ? e.sections : [];
  for (const f of c)
    try {
      l.appendChild(hi(f));
    } catch (w) {
      console.warn("[OmniCam] help: skipped a malformed section", w);
    }
  if (e.footer) {
    const f = document.createElement("div");
    f.className = "oc-help-tip", f.innerHTML = se(e.footer), l.appendChild(f);
  }
  a.appendChild(l);
  let d = !1;
  const m = document.activeElement instanceof HTMLElement ? document.activeElement : null, p = () => {
    document.removeEventListener("keydown", u, !0), t.remove(), Me === p && (Me = null), m && m.isConnected && typeof m.focus == "function" && m.focus({ preventScroll: !0 });
  };
  Me = p;
  const h = () => Array.from(
    a.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((f) => !f.disabled && f.offsetParent !== null), u = (f) => {
    if (f.key === "Escape") {
      f.stopPropagation(), f.preventDefault(), p();
      return;
    }
    if (f.key === "Tab") {
      const w = h();
      if (!w.length) {
        f.preventDefault(), a.focus();
        return;
      }
      const v = w[0], b = w[w.length - 1], y = document.activeElement;
      f.shiftKey && (y === v || !a.contains(y)) ? (f.preventDefault(), b.focus()) : !f.shiftKey && (y === b || !a.contains(y)) && (f.preventDefault(), v.focus());
    }
  };
  return document.addEventListener("keydown", u, !0), i.addEventListener("click", (f) => {
    f.stopPropagation(), p();
  }), t.addEventListener("mousedown", (f) => {
    d = f.target === t;
  }), t.addEventListener("click", (f) => {
    f.target === t && d && p(), d = !1;
  }), a.addEventListener("mousedown", (f) => f.stopPropagation()), document.body.appendChild(t), (i.isConnected ? i : a).focus({ preventScroll: !0 }), p;
}
Dt("MajoorOmniCamDirector", {
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
Dt("MajoorOmniCamExtractor", {
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
        ["method", "`dpvo` is the default and does not fall back -- it errors if DPVO is not installed. `auto` tries DPVO, then `pycolmap`, then `opencv_sift`, taking the first one actually installed. `pycolmap` runs Structure-from-Motion (bundle adjustment over the whole shot) rather than frame-to-frame odometry: slower, but it does not zero out translation on a low-parallax or rotation-only segment the way `opencv_sift` does. See the optional extractor backend installation documentation for setup."],
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
Dt("MajoorOmniCamMonitor", {
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
        ["h3_api", "Reference video. The playblast as a VIDEO plus a prompt, for MinimaxHailuo03ReferenceNode."],
        ["seedance25_reference", "Reference video. The playblast plus a role-first prompt, for ByteDance Seedance 2.5 Reference to Video (ByteDance2ReferenceNodeV2); guide duration must be at least 1.8s, output resolves to 4-30s. guide_reference_index picks which Video N slot the guide occupies (1-10); guide_style and the Reference Role Matrix (reference_plan_json) describe what it and any other declared references are for."]
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
const la = "MajoorOmniCam.ShowHelp", ft = "oc-help-toolbar-icon", ca = "oc-help-toolbar-css", yi = "#8b7bd8";
function bi() {
  if (document.getElementById(ca)) return;
  const e = document.createElement("style");
  e.id = ca, e.textContent = `
    .${ft}{display:inline-flex;align-items:center;justify-content:center;
      width:16px;height:16px;border-radius:50%;background:${yi};color:#fff;
      font-weight:700;font-size:11px;line-height:1}
    .${ft}::before{content:"?"}
  `, document.head.appendChild(e);
}
function vi() {
  const e = ae.canvas;
  if (!e) return [];
  const t = [];
  if (e.selected_nodes && t.push(...Object.values(e.selected_nodes)), e.selectedItems)
    for (const a of e.selectedItems)
      a && a.comfyClass && t.push(a);
  return t;
}
function _i() {
  for (const e of vi()) {
    const t = pt(e.comfyClass);
    if (t) return t;
  }
  return null;
}
ae.registerExtension({
  name: "MajoorOmniCam.HelpToolbar",
  commands: [
    {
      id: la,
      label: "Help",
      icon: ft,
      function: () => {
        const e = _i();
        e && ia(e);
      }
    }
  ],
  // ComfyUI calls this for every extension with the selected canvas item and
  // unions the returned command ids to render in the floating selection
  // toolbar. Never called on older frontends -> the command is registered but
  // simply never shown (harmless).
  getSelectionToolboxCommands(e) {
    const t = e && e.comfyClass;
    return t && pt(t) ? [la] : [];
  },
  // Right-click fallback so help is reachable even without the selection
  // toolbar hook.
  getNodeMenuItems(e) {
    const t = pt(e?.comfyClass);
    return t ? [null, { content: "? Help", callback: () => ia(t) }] : [];
  },
  setup() {
    bi();
  }
});
An(ro);
let ce = !1;
function jt(e, t, a, r) {
  a ? mi(e, t) : ui(e, t, r);
}
function Et(e) {
  if (typeof e.configure != "function") return () => null;
  let t = null;
  const a = e.configure, r = (o) => a.call(e, o);
  return e.configure = function(o) {
    return t === null && Array.isArray(o?.size) && (t = [...o.size]), r(o);
  }, () => t;
}
function Ie(e, t) {
  const a = globalThis.__majoorOmniCamCiTrace;
  Array.isArray(a) && a.push({ stage: e, nodeId: t?.id ?? null, nodeClass: Ye(t), configuringGraph: ce });
}
ti();
lo(ae);
Xn(ae);
ae.registerExtension({
  name: "Majoor.OmniCam.Director",
  settings: Br,
  beforeConfigureGraph() {
    ce = !0;
  },
  afterConfigureGraph() {
    ce = !1;
  },
  async nodeCreated(e) {
    if (Ye(e) !== dt) return;
    Ie("director:nodeCreated", e);
    const t = !ce, a = t ? null : Et(e);
    await Tt(e, async () => {
      Ie("director:import:start", e);
      const { attachDirectorShell: o } = await import("./chunk-BJqdJBK9.js").then((n) => n.q);
      return Ie("director:import:resolved", e), o;
    });
    const r = e.__majoorOmniCamDirectorRuntime;
    r && (Ie("director:attach:complete", e), t && Yn(r), jt(e, dt, t, a?.()));
  }
});
ae.registerExtension({
  name: "Majoor.OmniCam.Extractor",
  async nodeCreated(e) {
    if (Ye(e) !== mt) return;
    const t = !ce, a = t ? null : Et(e);
    await Tt(e, async () => (await import("./chunk-BwkdnCPd.js")).attachExtractor), e.__majoorOmniCamExtractorRuntime && jt(e, mt, t, a?.());
  }
});
ae.registerExtension({
  name: "Majoor.OmniCam.Monitor",
  async nodeCreated(e) {
    if (Ye(e) !== ut) return;
    const t = !ce, a = t ? null : Et(e);
    await Tt(e, async () => (await import("./chunk-C-Rrhp3o.js")).attachMonitor), e.__majoorOmniCamMonitor && jt(e, ut, t, a?.());
  }
});
export {
  Ti as $,
  Mi as A,
  da as B,
  st as C,
  on as D,
  fl as E,
  Hi as F,
  ka as G,
  me as H,
  Ft as I,
  Ue as J,
  zi as K,
  Uo as L,
  Bt as M,
  Re as N,
  bo as O,
  I as P,
  vo as Q,
  xi as R,
  po as S,
  k as T,
  go as U,
  Zi as V,
  hs as W,
  nl as X,
  Pi as Y,
  Ai as Z,
  Di as _,
  de as a,
  wr as a$,
  St as a0,
  ji as a1,
  Oi as a2,
  Vo as a3,
  Ko as a4,
  Ii as a5,
  gt as a6,
  Fe as a7,
  Ni as a8,
  cn as a9,
  Mr as aA,
  Ar as aB,
  Tr as aC,
  Ir as aD,
  Ha as aE,
  Wa as aF,
  $a as aG,
  Dr as aH,
  Er as aI,
  Ua as aJ,
  Ya as aK,
  Za as aL,
  Qa as aM,
  Ja as aN,
  tr as aO,
  ar as aP,
  rr as aQ,
  or as aR,
  ir as aS,
  lr as aT,
  fr as aU,
  hr as aV,
  gr as aW,
  yr as aX,
  br as aY,
  vr as aZ,
  _r as a_,
  vs as aa,
  Ur as ab,
  xe as ac,
  aa as ad,
  cs as ae,
  ul as af,
  dn as ag,
  Yr as ah,
  ki as ai,
  Js as aj,
  ve as ak,
  rl as al,
  Br as am,
  ja as an,
  Ea as ao,
  Ia as ap,
  Oa as aq,
  Pa as ar,
  Na as as,
  Ra as at,
  za as au,
  Or as av,
  Pr as aw,
  kr as ax,
  xr as ay,
  Cr as az,
  le as b,
  Da as b0,
  al as b1,
  Yi as b2,
  In as b3,
  tl as b4,
  Qi as b5,
  Ji as b6,
  el as b7,
  kl as b8,
  V as b9,
  Wi as bA,
  vl as bB,
  bl as bC,
  _s as bD,
  Wr as bE,
  _l as bF,
  Sl as bG,
  wl as bH,
  Cl as bI,
  $r as bJ,
  Cs as bK,
  yl as bL,
  gl as bM,
  hl as bN,
  Q as bO,
  mt as bP,
  pl as bQ,
  dl as bR,
  cl as bS,
  Ei as bT,
  wt as bU,
  Ct as bV,
  Wn as bW,
  Zt as ba,
  sn as bb,
  Fs as bc,
  Jr as bd,
  Ml as be,
  xl as bf,
  Fi as bg,
  Gi as bh,
  Z as bi,
  uo as bj,
  Ki as bk,
  Vi as bl,
  Zn as bm,
  ll as bn,
  Qt as bo,
  il as bp,
  H as bq,
  ol as br,
  sl as bs,
  Ve as bt,
  Gr as bu,
  Bi as bv,
  ai as bw,
  $i as bx,
  Ui as by,
  Xi as bz,
  D as c,
  fo as d,
  q as e,
  j as f,
  Ce as g,
  M as h,
  ls as i,
  ha as j,
  bt as k,
  W as l,
  T as m,
  ie as n,
  ze as o,
  lt as p,
  Nt as q,
  Li as r,
  qi as s,
  ml as t,
  nt as u,
  _ as v,
  Ri as w,
  Zo as x,
  xa as y,
  gi as z
};
