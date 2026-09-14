import { app as as } from "../../scripts/app.js";
import { api as nt } from "../../scripts/api.js";
import { s as $e, c as ee, t as ue, a as s, o as os, b as _r, d as Ye, e as ce, f as Do, r as Ei, g as Cr, h as rs, i as Ai, j as Ti, k as $i, l as Mi, m as Er, n as Ar, I as Co, D as Ii, p as Tr, q as Oi, w as Pi, u as $o, v as ns, x as Li, y as $r, z as ir, A as Qr, B as ss, C as cr, E as is, F as cs, G as ls, H as ds, J as lr, K as Yo, L as en, O as tn, R as ms, M as Ni, N as zi, P as Fi, Q as Ri, S as Di, T as fe, U as ps, V as fs, W as an, X as Fe, Y as Ki, Z as hs, _ as Bi, $ as qi, a0 as Mr, a1 as Ui, a2 as Wi, a3 as Vi, a4 as Hi, a5 as Gi, a6 as Ir, a7 as Yi, a8 as Xi, a9 as Ji, aa as Zi, ab as Qi, ac as ec, ad as tc, ae as ac, af as oc, ag as rc, ah as nc, ai as sc, aj as ic, ak as cc, al as lc, am as dc, an as mc, ao as pc, ap as fc, aq as hc, ar as uc, as as bc, at as gc, au as yc, av as vc, aw as xc, ax as wc, ay as kc, az as Sc, aA as jc, aB as _c, aC as Cc, aD as Ec, aE as Ac, aF as Tc, aG as $c, aH as Mc, aI as Ic, aJ as Oc, aK as Pc, aL as Lc, aM as Nc, aN as zc, aO as Ve, aP as Fc, aQ as Xo, aR as Rc, aS as Dc, aT as Kc, aU as Bc, aV as qc, aW as Ge, aX as Uc, aY as us, aZ as Or, a_ as Wc, a$ as Vc, b0 as Hc, b1 as bs, b2 as tt, b3 as Gc, b4 as Yc, b5 as on, b6 as Pr, b7 as Xc, b8 as gs, b9 as Jc, ba as Zc, bb as Qc, bc as Jo, bd as rn, be as Ko, bf as el, bg as tl, bh as al, bi as ol, bj as rl, bk as nl, bl as sl, bm as il, bn as ys, bo as cl, bp as ll, bq as dl, br as ml, bs as pl, bt as fl, bu as hl, bv as ul, bw as bl, bx as gl, by as yl, bz as vl, bA as xl, bB as wl, bC as kl, bD as Sl, bE as jl, bF as _l, bG as Cl } from "./chunk-J7DOggj_.js";
import { L as El, a as Al, p as Xt, f as Lr, b as Tl, S as $l, c as nn, d as Ml, e as Il, r as Ol, g as Pl, n as Ll, C as sn, h as Jt, o as vs, i as Nl, s as zl, j as Fl, k as xs, l as Rl, m as dr, q as mr, w as Dl, t as ws, u as Kl, v as Bl, x as ql, y as Ul, z as Wl, A as Vl, B as Hl, D as Gl, E as Yl, F as Xl, G as Jl, H as Zl, I as Ql, J as ed, K as td, M as ad } from "./chunk-WsMsm31e.js";
import { S as od, b as rd, p as nd, m as sd, l as id, u as cd } from "./chunk-DjvDVpt_.js";
import { T as ld } from "./chunk-__IQ4xkd.js";
import { T as dd, R as md } from "./vendor-three-BQUrLQkn.js";
function Dt(e, t = 0) {
  return Math.sin(e * 1.7 + t * 3.1) * 0.5 + Math.sin(e * 3.3 + t * 5.7) * 0.3 + Math.sin(e * 7.9 + t * 11.3) * 0.2;
}
function pd(e, { type: t = "handheld_subtle", intensity: a = 1, duration_frames: o = null, subdivide: r = !0 } = {}) {
  const n = Array.isArray(e) ? e : e?.keyframes || [];
  if (!n || n.length === 0) return n;
  const i = t === "turbulence", c = t === "handheld_heavy", l = (i ? 0.12 : c ? 0.18 : 0.06) * a, p = (i ? 2 : c ? 2.8 : 0.9) * a, m = i ? 0.45 : c ? 0.22 : 0.12, f = n[n.length - 1]?.frame ?? 119, d = Math.max(f + 1, Number(o || (e?.duration_frames ?? f + 1))), h = i ? 4 : c ? 6 : 8, u = Array.isArray(e) ? { keyframes: n, duration_frames: d } : e, b = new Set(n.map((y) => y.frame));
  if (r && d > h) {
    for (let y = 0; y < d; y += h)
      b.add(y);
    b.add(d - 1);
  }
  return [...b].sort((y, x) => y - x).map((y) => {
    const x = $e(u, y), k = Dt(y * m, 1) * l, g = Dt(y * m, 2) * l, _ = Dt(y * m, 3) * l * 0.5, A = Dt(y * m, 4) * p, K = Dt(y * m, 5) * (p * 0.35), F = [...x.position], J = [...x.target];
    return F[0] += k, F[1] += g, F[2] += _, J[0] += k * 0.35, J[1] += g * 0.35, {
      frame: y,
      camera: {
        ...x,
        position: F,
        target: J,
        roll: (x.roll || 0) + A,
        fov: ee((x.fov || 35) + K, 10, 140)
      },
      interpolation: "smooth"
    };
  });
}
function fd(e, { duration_frames: t = 120, target: a = [0, 1.5, 0], radius: o = 6, height: r = 3.5 } = {}) {
  const n = [], i = Math.max(2, t), [c, l, p] = a;
  if (e === "orbit_360") {
    const m = Math.max(17, Math.min(65, Math.ceil(i / 4) + 1));
    for (let f = 0; f < m; f++) {
      const d = Math.round(f / (m - 1) * (i - 1)), h = f / (m - 1) * Math.PI * 2, u = f === m - 1 ? [c, l + r, p + o] : [c + Math.sin(h) * o, l + r, p + Math.cos(h) * o];
      n.push({
        frame: d,
        camera: {
          position: u,
          target: [c, l, p],
          fov: 35,
          roll: 0,
          camera_type: "perspective",
          zoom: 1,
          near: 0.01,
          far: 1e4
        },
        interpolation: "linear"
      });
    }
  } else e === "push_in" ? n.push(
    {
      frame: 0,
      camera: { position: [c, l + r, p + o * 1.6], target: [c, l, p], fov: 42, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: i - 1,
      camera: { position: [c, l + r * 0.5, p + o * 0.6], target: [c, l, p], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : e === "pull_out" ? n.push(
    {
      frame: 0,
      camera: { position: [c, l + r * 0.4, p + o * 0.6], target: [c, l, p], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: i - 1,
      camera: { position: [c, l + r * 1.2, p + o * 1.8], target: [c, l, p], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : e === "dolly_zoom" && n.push(
    {
      frame: 0,
      camera: { position: [c, l + r * 0.7, p + o * 1.8], target: [c, l, p], fov: 24, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    },
    {
      frame: i - 1,
      camera: { position: [c, l + r * 0.5, p + o * 0.6], target: [c, l, p], fov: 65, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    }
  );
  return n;
}
const ks = 1e-4;
function hd(e, t) {
  return !Array.isArray(e) || !Array.isArray(t) ? e !== t : e.some((a, o) => Math.abs(Number(a) - Number(t[o])) > ks);
}
function cn(e, t) {
  return Math.abs(Number(e) - Number(t)) > ks;
}
const Ss = [
  {
    id: "camera",
    label: "Camera",
    color: "#a78bfa",
    // The camera row is the master track: every key belongs to it.
    changed: () => !0,
    read: (e) => e?.position
  },
  {
    id: "look_at",
    label: "Look At",
    color: "#f0a742",
    changed: (e, t) => hd(e?.target, t?.target),
    read: (e) => e?.target
  },
  {
    id: "focal_length",
    label: "Focal Length",
    color: "#4aa3ef",
    changed: (e, t) => cn(e?.fov, t?.fov),
    read: (e) => e?.fov
  },
  {
    id: "roll",
    label: "Roll",
    color: "#ec4899",
    changed: (e, t) => cn(e?.roll, t?.roll),
    read: (e) => e?.roll
  }
];
function ud(e, t) {
  const a = [...e || []].sort((n, i) => n.frame - i.frame), o = [];
  let r = null;
  for (const n of a) {
    const i = n.camera || n.transform || {};
    (r === null || t.changed(r, i)) && o.push(n.frame), r = i;
  }
  return o;
}
function bd(e, t = null) {
  return Ss.filter((a) => !t || t.has(a.id)).map((a) => ({
    id: a.id,
    label: a.label,
    color: a.color,
    frames: ud(e, a)
  }));
}
function gd(e, t) {
  const a = t >= -1 && t <= 101;
  e.style.display = a ? "" : "none", a && (e.style.left = `${t}%`);
}
function Mo(e) {
  const t = ue(e, e.frame);
  for (const a of [".oc-playhead-head", '[data-role="dope-playhead"]', ".oc-gdope-playhead", ".oc-sequence-playhead"])
    for (const o of e.root.querySelectorAll(a)) gd(o, t);
}
function yd(e, t, a) {
  if (t.length < 2) return;
  const o = a(t[0]), r = a(t[t.length - 1]), n = document.createElement("span");
  n.className = "oc-dope-rail", n.style.left = `${Math.max(0, Math.min(o, r))}%`, n.style.width = `${Math.max(0, Math.abs(r - o))}%`, e.appendChild(n);
}
function vd(e, t, a, o, r) {
  for (const n of a.frames) {
    const i = r(n);
    if (i < -5 || i > 105) continue;
    const c = document.createElement("button");
    c.type = "button", c.className = `oc-dope-key${n === e.frame ? " at-playhead" : ""}`, c.style.left = `${i}%`, c.dataset.frame = String(n), c.title = s("{channel} changes at frame {frame}").replace("{channel}", s(a.label)).replace("{frame}", String(n)), c.addEventListener("pointerdown", (l) => {
      if (l.shiftKey || l.altKey || l.button !== 0) return;
      const p = o.find((d) => d.frame === n);
      if (!p) return;
      l.preventDefault(), l.stopPropagation(), e.selectedKeyFrames?.has(n) || (e.selectedKeyFrames = /* @__PURE__ */ new Set([n])), e.selectedKeyFrame = n;
      const m = e.root.querySelector('[data-role="keys"]');
      if (!m) return;
      const f = e.timelineKeyframes().filter((d) => e.selectedKeyFrames.has(d.frame));
      e.keyDrag = {
        key: p,
        box: m,
        historyCheckpointed: !1,
        moving: f.map((d) => ({ key: d, startFrame: d.frame })),
        startPointerFrame: n,
        startClientX: l.clientX,
        startClientY: l.clientY
      }, e.setFrame(n, !1, !1);
    }), c.addEventListener("click", (l) => {
      l.preventDefault(), l.stopPropagation();
      const p = o.find((m) => m.frame === n);
      if (p) {
        if (l.shiftKey) {
          e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((m) => m !== null)), e.selectedKeyFrames.has(n) ? e.selectedKeyFrames.delete(n) : e.selectedKeyFrames.add(n), e.selectedKeyFrame = e.selectedKeyFrames.has(n) ? n : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(n, !1, !1), e.updateKeyVisualState(), e.refreshKeyEditor();
          return;
        }
        e.selectKeyframe(p);
      }
    }), t.appendChild(c);
  }
}
function xd(e, t) {
  return [
    e.state.duration_frames,
    Number(e.timelineZoom) || 1,
    Number(e.timelinePan) || 0,
    ...t.map((a) => `${a.id}:${a.frames.join(",")}`)
  ].join("\0");
}
function js(e) {
  const t = e.root.querySelector('[data-role="dope-rows"]');
  if (!t) return;
  const a = new Set(e.dopeChannels || []);
  a.delete("camera");
  const o = e.timelineKeyframes() || [], r = bd(o, a), n = xd(e, r);
  if (t.dataset.signature !== n) {
    t.dataset.signature = n, t.replaceChildren();
    const i = (c) => ue(e, c);
    for (const c of r) {
      const l = document.createElement("div");
      l.className = "oc-dope-row", l.dataset.channel = c.id, l.style.setProperty("--channel-color", c.color), yd(l, c.frames, i), vd(e, l, c, o, i), t.appendChild(l);
    }
  }
  for (const i of t.querySelectorAll(".oc-dope-key"))
    i.classList.toggle("at-playhead", Number(i.dataset.frame) === e.frame);
  Mo(e);
}
const Zo = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1e3, 2e3, 5e3], _s = 46, ln = 5, Cs = 640;
function Es(e, t) {
  const a = t > 0 ? t : Cs, o = Math.max(2, Math.floor(a / _s)), r = Math.max(1e-6, e / o);
  return Zo.find((n) => n >= r) ?? Zo[Zo.length - 1];
}
function wd(e, t) {
  const a = Math.max(1, e.state.duration_frames - 1), o = ee(Number(e.timelineZoom) || 1, 0.1, 50), r = Number(e.timelinePan) || 0, n = a / o, i = Es(n, t), l = (i >= ln ? i / ln : 0) || i, p = [], m = Math.max(0, Math.floor(r / l) * l);
  for (let d = m; d <= a + 1e-6; d += l) {
    const h = Math.round(d), u = ue(e, h);
    if (!(u < -1)) {
      if (u > 101) break;
      p.push({ frame: h, percent: u, major: Math.abs(h % i) < 1e-6 });
    }
  }
  const f = ue(e, a);
  if (f <= 101 && !p.some((d) => d.major && d.frame === a)) {
    const d = _s / Math.max(1, t) * 100;
    for (let h = p.length - 1; h >= 0; h -= 1)
      if (p[h].major) {
        if (f - p[h].percent >= d) break;
        p[h].major = !1;
      }
    p.push({ frame: a, percent: f, major: !0 });
  }
  return p;
}
function kd(e) {
  return e.clientWidth || e.parentElement?.clientWidth || Cs;
}
function As(e) {
  const t = e.root.querySelector('[data-role="ruler"]');
  if (!t) return;
  t.replaceChildren();
  for (const o of wd(e, kd(t))) {
    const r = document.createElement("span");
    if (r.className = o.major ? "oc-tick major" : "oc-tick", r.style.left = `${o.percent}%`, t.appendChild(r), !o.major) continue;
    const n = document.createElement("span");
    n.className = "timeline-tick", n.textContent = String(o.frame), n.style.left = `${o.percent}%`, t.appendChild(n);
  }
  const a = ue(e, e.frame);
  if (a >= -1 && a <= 101) {
    const o = document.createElement("span");
    o.className = "oc-playhead-head", o.style.left = `${a}%`, t.appendChild(o);
  }
}
function Sd(e, t) {
  const a = e.root.querySelector('[data-role="ruler"]');
  if (!a) return;
  let o = 0;
  const r = new ResizeObserver((c) => {
    const l = Math.round(c[0]?.contentRect.width ?? 0);
    !l || l === o || (o = l, As(e));
  });
  r.observe(a), t?.addEventListener("abort", () => r.disconnect(), { once: !0 });
  const n = (c) => {
    const l = _r(e, c, a);
    Number.isFinite(l) && e.setFrame(l, !1, !1);
  };
  a.addEventListener("pointerdown", (c) => {
    c.button === 0 && (c.preventDefault(), c.stopPropagation(), a.setPointerCapture(c.pointerId), a.dataset.scrubbing = "1", n(c));
  }, { signal: t }), a.addEventListener("pointermove", (c) => {
    a.dataset.scrubbing === "1" && n(c);
  }, { signal: t });
  const i = (c) => {
    a.dataset.scrubbing === "1" && (delete a.dataset.scrubbing, a.hasPointerCapture?.(c.pointerId) && a.releasePointerCapture(c.pointerId));
  };
  a.addEventListener("pointerup", i, { signal: t }), a.addEventListener("pointercancel", i, { signal: t }), a.addEventListener("wheel", (c) => os(e, c), { passive: !1, signal: t });
}
const jd = [1, 2, 2.5, 5, 10];
function _d(e, t = 5) {
  const a = Math.abs(e) / Math.max(1, t);
  if (!(a > 0) || !Number.isFinite(a)) return 1;
  const o = 10 ** Math.floor(Math.log10(a)), r = a / o;
  return (jd.find((n) => n >= r) ?? 10) * o;
}
function Cd(e, t) {
  const a = Math.max(0, Math.min(4, Math.ceil(-Math.log10(t))));
  return e.toFixed(a);
}
function Ed(e, { left: t, right: a, top: o, width: r, graphWidth: n, graphHeight: i, height: c, timeMin: l, timeMax: p, totalDuration: m, xFor: f, frame: d }) {
  const h = Es(p - l, n);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a", e.textAlign = "center";
  for (let b = Math.ceil(l / h) * h; b <= p; b += h) {
    const v = Math.round(b);
    if (v < 0 || v > m) continue;
    const y = f(v);
    y < t || y > r - a || (e.beginPath(), e.moveTo(y, o), e.lineTo(y, o + i), e.stroke(), e.fillText(String(v), y, c - 6));
  }
  const u = f(d);
  u >= t && u <= r - a && (e.fillStyle = "#a78bfa", e.fillText(String(d), u, c - 6)), e.textAlign = "left";
}
function Ad(e, { left: t, right: a, top: o, width: r, graphHeight: n, minimum: i, maximum: c, yFor: l }) {
  const p = _d(c - i, 4);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a";
  for (let m = Math.ceil(i / p) * p; m <= c; m += p) {
    const f = l(m);
    f < o - 1 || f > o + n + 1 || (e.beginPath(), e.moveTo(t, f), e.lineTo(r - a, f), e.stroke(), e.fillText(Cd(m, p), 4, f + 3));
  }
}
function Nr(e, t) {
  const a = e.getBoundingClientRect(), o = e.clientWidth / Math.max(1, a.width), r = (e.clientHeight || 180) / Math.max(1, a.height);
  return {
    x: (t.clientX - a.left) * o,
    y: (t.clientY - a.top) * r
  };
}
function Td(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.currentTarget;
  a.focus({ preventScroll: !0 }), e.curveHover = null;
  const { x: o, y: r } = Nr(a, t);
  if (t.button === 1 || t.altKey || t.button === 2 && !e.curveHitPoints?.some((c) => Math.hypot(o - c.x, r - c.y) <= 12)) {
    e.curvePanDrag = {
      startX: t.clientX,
      startY: t.clientY,
      origPanX: Number(e.curvePanX) || 0,
      origPanY: Number(e.curvePanY) || 0,
      pointerId: t.pointerId
    }, a.setPointerCapture?.(t.pointerId);
    return;
  }
  const n = (e.curveHitPoints || []).map((c) => ({ point: c, distance: Math.hypot(o - c.x, r - c.y) })).sort((c, l) => c.distance - l.distance)[0];
  if (!n || n.distance > 12) {
    if (r < 20) {
      const c = Math.max(1, e.state.duration_frames - 1), l = c / (Number(e.curveZoomX) || 1), p = Number(e.curvePanX) || 0, m = Math.round(ee(p + (o - 44) / Math.max(1, a.clientWidth - 58) * l, 0, c));
      e.setFrame(m), e.curveScrub = { pointerId: t.pointerId }, a.setPointerCapture?.(t.pointerId);
      return;
    }
    e.curveBoxSelect = {
      startX: o,
      startY: r,
      currentX: o,
      currentY: r,
      pointerId: t.pointerId,
      additive: t.shiftKey,
      initial: new Set(e.selectedKeyFrames || (e.selectedKeyFrame !== null ? [e.selectedKeyFrame] : []))
    }, a.setPointerCapture?.(t.pointerId);
    return;
  }
  if (n.point.handle)
    e.selectedKeyFrame = n.point.key.frame, e.editingKeyFrame = null, e.updateKeyVisualState(), e.refreshKeyEditor();
  else if (t.shiftKey) {
    e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((c) => c !== null)), e.selectedKeyFrames.has(n.point.key.frame) ? e.selectedKeyFrames.delete(n.point.key.frame) : e.selectedKeyFrames.add(n.point.key.frame), e.selectedKeyFrame = e.selectedKeyFrames.has(n.point.key.frame) ? n.point.key.frame : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(n.point.key.frame), e.updateKeyVisualState(), e.refreshKeyEditor();
    return;
  } else
    e.selectKeyframe(n.point.key), e.setFrame(n.point.key.frame);
  const i = n.point.object ? n.point.key.transform : n.point.key.camera;
  e.curveDrag = {
    ...n.point,
    startY: r,
    startX: o,
    startFrame: n.point.key.frame,
    startValue: n.point.channel.get(i),
    pointerId: t.pointerId,
    historyCheckpointed: !1
  }, !n.point.handle && e.selectedKeyFrames?.size >= 2 && e.selectedKeyFrames.has(n.point.key.frame) && (e.curveDrag.group = e.timelineKeyframes().filter((c) => e.selectedKeyFrames.has(c.frame)).map((c) => {
    const l = n.point.object ? c.transform || n.point.object : c.camera || c;
    return { key: c, backing: l, startFrame: c.frame, startValue: n.point.channel.get(l) };
  })), a.setPointerCapture?.(t.pointerId);
}
function $d(e, t) {
  const a = t.currentTarget, { x: o, y: r } = Nr(a, t);
  if (e.curvePanDrag && t.pointerId === e.curvePanDrag.pointerId) {
    t.preventDefault();
    const f = t.clientX - e.curvePanDrag.startX, d = t.clientY - e.curvePanDrag.startY, u = Math.max(1, e.state.duration_frames - 1) / (Number(e.curveZoomX) || 1), b = Math.max(1, a.clientWidth - 58), v = a.clientHeight || 180, y = Math.max(1, v - 38);
    e.curvePanX = e.curvePanDrag.origPanX - f / b * u, e.curvePanY = e.curvePanDrag.origPanY + d / y * 10 / (Number(e.curveZoom) || 1), e.drawCurveEditor();
    return;
  }
  if (e.curveScrub && t.pointerId === e.curveScrub.pointerId) {
    t.preventDefault();
    const f = Math.max(1, e.state.duration_frames - 1), d = f / (Number(e.curveZoomX) || 1), h = Number(e.curvePanX) || 0, u = Math.round(ee(h + (o - 44) / Math.max(1, a.clientWidth - 58) * d, 0, f));
    e.setFrame(u);
    return;
  }
  if (e.curveBoxSelect && t.pointerId === e.curveBoxSelect.pointerId) {
    t.preventDefault(), e.curveBoxSelect.currentX = o, e.curveBoxSelect.currentY = r;
    const f = Math.min(e.curveBoxSelect.startX, o), d = Math.max(e.curveBoxSelect.startX, o), h = Math.min(e.curveBoxSelect.startY, r), u = Math.max(e.curveBoxSelect.startY, r), b = (e.curveHitPoints || []).filter((y) => !y.handle && y.x >= f && y.x <= d && y.y >= h && y.y <= u).map((y) => y.key.frame), v = new Set(e.curveBoxSelect.additive ? e.curveBoxSelect.initial : []);
    for (const y of b) v.add(y);
    e.selectedKeyFrames = v, v.size && (e.selectedKeyFrame = [...v].at(-1)), e.updateKeyVisualState(), e.drawCurveEditor();
    return;
  }
  if (!e.curveDrag || t.pointerId !== e.curveDrag.pointerId) {
    const f = (e.curveHitPoints || []).map((x) => ({ point: x, distance: Math.hypot(o - x.x, r - x.y) })).sort((x, k) => x.distance - k.distance)[0], d = Math.max(1, e.state.duration_frames - 1), h = d / (Number(e.curveZoomX) || 1), u = Number(e.curvePanX) || 0, b = Math.max(1, a.clientWidth - 58), v = ee(Math.round(u + (o - 44) / b * h), 0, d);
    let y = null;
    if (f && f.distance <= 14) {
      const x = f.point, k = x.object ? x.key.transform || x.object : x.key.camera || x.key;
      y = {
        x: o,
        y: r,
        frame: x.key.frame,
        channelName: x.channel.name,
        value: x.channel.get(k),
        isHandle: !!x.handle,
        handleSide: x.handle
      };
    } else r >= 20 && r <= 165 && o >= 44 && o <= a.clientWidth - 14 && (y = { x: o, y: r, frame: v });
    (!!e.curveHover != !!y || y && (e.curveHover?.frame !== y.frame || e.curveHover?.channelName !== y.channelName)) && (e.curveHover = y, e.drawCurveEditor());
    return;
  }
  if (e.curveHover = null, t.preventDefault(), t.stopPropagation(), e.curveDrag.historyCheckpointed || (e.checkpoint?.(e.curveDrag.handle ? "Edit curve tangent" : "Edit curve"), e.curveDrag.historyCheckpointed = !0), e.curveDrag.handle) {
    const f = e.curveDrag.key, d = e.curveDrag.channel, h = e.curveDrag.handle, u = e.curveDrag.pixelPerSegment, b = e.curveDrag.valuePerPixel, v = e.curveDrag.keyX, y = e.curveDrag.keyY;
    f.interpolation !== "bezier" && (f.interpolation = "bezier"), f.tangents || (f.tangents = { mode: "auto", channels: {} }), f.tangents.channels || (f.tangents.channels = {});
    const x = f.tangents.channels[d.id] || {}, k = x.mode || (f.tangents.mode === "aligned" ? "aligned" : "free"), g = {
      out_x: e.curveDrag.startHandles.out_x,
      out_y: e.curveDrag.startHandles.out_y,
      in_x: e.curveDrag.startHandles.in_x,
      in_y: e.curveDrag.startHandles.in_y,
      ...x,
      mode: k
    };
    if (h === "in") {
      if (g.in_x = ee((o - v) / Math.max(1, u), -0.99, -0.01), g.in_y = (y - r) * b, k === "aligned") {
        const _ = Math.hypot(g.in_x, g.in_y) || 1e-6, A = Math.hypot(e.curveDrag.startHandles.out_x, e.curveDrag.startHandles.out_y) || 1e-6;
        g.out_x = -g.in_x / _ * A, g.out_y = -g.in_y / _ * A;
      }
    } else if (g.out_x = ee((o - v) / Math.max(1, u), 0.01, 0.99), g.out_y = (y - r) * b, k === "aligned") {
      const _ = Math.hypot(g.out_x, g.out_y) || 1e-6, A = Math.hypot(e.curveDrag.startHandles.in_x, e.curveDrag.startHandles.in_y) || 1e-6;
      g.in_x = -g.out_x / _ * A, g.in_y = -g.out_y / _ * A;
    }
    f.tangents.channels[d.id] = g, e.scheduleSerialize(), e.camera = $e(e.state, e.frame), e.applyObjectAnimationFrame(), e.render(), e.drawCurveEditor();
    return;
  }
  const n = e.curveDrag.maximum - (r - e.curveDrag.top) * (e.curveDrag.maximum - e.curveDrag.minimum) / Math.max(1, e.curveDrag.graphHeight), i = e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera, c = e.curveDrag.lastFrame / (Number(e.curveZoomX) || 1), l = Number(e.curvePanX) || 0, p = ee(Math.round(l + (o - e.curveDrag.left) / Math.max(1, e.curveDrag.graphWidth) * c), 0, e.curveDrag.lastFrame), m = !t.shiftKey && Math.abs(o - e.curveDrag.startX) > 8;
  if (e.curveDrag.group) {
    const f = n - e.curveDrag.startValue;
    let d = m ? p - e.curveDrag.startFrame : 0;
    const h = new Set(e.timelineKeyframes().filter((u) => !e.selectedKeyFrames.has(u.frame)).map((u) => u.frame));
    if (d) {
      const u = e.curveDrag.group.map((v) => ee(Math.round(v.startFrame + d), 0, e.curveDrag.lastFrame));
      u.some((v) => h.has(v)) || new Set(u).size !== u.length ? d = 0 : e.curveDrag.group.forEach((v, y) => {
        v.key.frame = u[y];
      });
    }
    for (const u of e.curveDrag.group)
      e.curveDrag.channel.set(u.backing, u.startValue + f);
    e.timelineKeyframes().sort((u, b) => u.frame - b.frame), e.selectedKeyFrames = new Set(e.curveDrag.group.map((u) => u.key.frame)), e.selectedKeyFrame = e.curveDrag.key.frame, e.editingKeyFrame = m ? null : e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame;
  } else
    e.curveDrag.channel.set(i, n), m && p !== e.curveDrag.key.frame ? (e.curveDrag.key.frame = p, e.selectedKeyFrame = p, e.frame = p) : (e.editingKeyFrame = e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame);
  if (e.curveDrag.object) {
    const f = Ye(e.curveDrag.key.transform);
    e.curveDrag.object.position = f.position, e.curveDrag.object.rotation = f.rotation, e.curveDrag.object.size = f.size;
  } else {
    const f = ce(e.curveDrag.key.camera);
    e.camera.position = f.position, e.camera.target = f.target, e.camera.fov = f.fov, e.camera.roll = f.roll, e.camera.zoom = f.zoom;
  }
  e.scheduleSerialize(), e.render(), e.refreshKeyEditor(), e.drawCurveEditor();
}
function Md(e, t) {
  if (t.currentTarget.hasPointerCapture?.(t.pointerId) && t.currentTarget.releasePointerCapture(t.pointerId), e.curvePanDrag = null, e.curveScrub = null, e.curveBoxSelect = null, e.curveDrag) {
    const a = t.type === "pointercancel" || t.type === "lostpointercapture", o = e.curveDrag.historyCheckpointed;
    e.timelineKeyframes().sort((n, i) => n.frame - i.frame), e.editingKeyFrame = null, e.curveDrag = null, a && o && e.undo?.(), e.serialize(), e.refreshKeys(), e.updateKeyVisualState(), e.drawCurveEditor();
  }
}
function Id(e, t) {
  const a = e.selectedKeyframe() || e.timelineKeyframes().find((o) => o.frame === e.frame);
  if (!a) return e.setStatus(s("Select a keyframe first"));
  e.checkpoint("Change interpolation"), a.interpolation = t;
  for (const o of e.root.querySelectorAll("[data-curve-mode]")) {
    const r = o.dataset.curveMode === t;
    o.classList.toggle("active", r), o.setAttribute("aria-pressed", String(r));
  }
  e.selectedKeyFrame = a.frame, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.render(), e.drawCurveEditor(), e.setStatus(s(`${t.replace("_", " ")} interpolation @ ${a.frame}`));
}
function Od(e, t) {
  e.curveChannelFilter = t;
  for (const a of e.root.querySelectorAll("[data-channel-filter]")) {
    const o = a.dataset.channelFilter === String(t);
    a.classList.toggle("active", o), a.setAttribute("aria-pressed", String(o));
  }
  e.drawCurveEditor(), e.setStatus(t === "all" ? s("Showing all channels") : s(`Solo channel ${t}`));
}
function Pd(e, t) {
  const a = e.selectedKeyframe();
  if (!a || !["auto", "vector", "free", "aligned", "flat"].includes(t)) return e.setStatus(s("Select a keyframe first"));
  e.checkpoint("Change tangent mode"), t !== "auto" && a.interpolation !== "bezier" && (a.interpolation = "bezier"), a.tangents || (a.tangents = { mode: "auto", channels: {} }), a.tangents.mode = t, a.tangents.channels || (a.tangents.channels = {});
  const o = ht(e);
  for (const r of o)
    a.tangents.channels[r.id] ? a.tangents.channels[r.id].mode = t : a.tangents.channels[r.id] = { mode: t };
  for (const r of e.root.querySelectorAll("[data-tangent-mode]")) {
    const n = r.dataset.tangentMode === t;
    r.classList.toggle("active", n), r.setAttribute("aria-pressed", String(n));
  }
  e.selectedKeyFrame = a.frame, e.serialize(), e.refreshKeys(), e.render(), e.drawCurveEditor(), e.setStatus(s(`Tangent mode: ${t} @ ${a.frame}`));
}
function Ld(e) {
  e.showCurveHandles = !e.showCurveHandles;
  for (const t of e.root.querySelectorAll('[data-act="curve-handles"]'))
    t.classList.toggle("active", e.showCurveHandles), t.setAttribute("aria-pressed", String(e.showCurveHandles)), t.title = s(`${e.showCurveHandles ? "Hide" : "Show"} Bézier tangent handles`);
  e.drawCurveEditor(), e.setStatus(s(`Bézier handles ${e.showCurveHandles ? "shown" : "hidden"}`));
}
function Nd(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey) {
    const o = Math.max(1, e.state.duration_frames - 1);
    e.curvePanX = ee((Number(e.curvePanX) || 0) + (t.deltaY > 0 ? 4 : -4), -o * 0.5, o);
  } else t.altKey ? e.curvePanY = (Number(e.curvePanY) || 0) + (t.deltaY > 0 ? -1 : 1) / (Number(e.curveZoom) || 1) : t.ctrlKey ? e.curveZoomX = ee((Number(e.curveZoomX) || 1) * a, 0.2, 30) : (e.curveZoom = ee((Number(e.curveZoom) || 1) * a, 0.2, 30), e.curveZoomX = ee((Number(e.curveZoomX) || 1) * a, 0.2, 30));
  e.drawCurveEditor(), e.setStatus(s(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function zd(e, t) {
  e.curveZoom = ee((Number(e.curveZoom) || 1) * t, 0.2, 30), e.curveZoomX = ee((Number(e.curveZoomX) || 1) * t, 0.2, 30), e.drawCurveEditor(), e.setStatus(s(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function Fd(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.currentTarget, { x: o, y: r } = Nr(a, t);
  if (r < 20) return;
  const n = Math.max(1, e.state.duration_frames - 1), i = n / (Number(e.curveZoomX) || 1), c = Number(e.curvePanX) || 0, l = Math.max(1, a.clientWidth - 58), p = ee(Math.round(c + (o - 44) / l * i), 0, n);
  e.checkpoint?.("Insert keyframe"), e.setFrame(p), e.insertKeyframe(), e.selectedKeyFrame = p, e.selectedKeyFrames = /* @__PURE__ */ new Set([p]), e.updateKeyVisualState(), e.refreshKeys(), e.drawCurveEditor(), e.setStatus(s("Keyframe inserted @ F{frame}").replace("{frame}", p));
}
function Ts(e, { selectedOnly: t = !1 } = {}) {
  const a = Math.max(1, (e.state?.duration_frames ?? 120) - 1), o = e.timelineKeyframes() || [], r = e.timelineObject(), n = ht(e), i = e.selectedKeyFrames?.size ? [...e.selectedKeyFrames] : e.selectedKeyFrame != null ? [e.selectedKeyFrame] : [], c = i.length > 0, l = t || c && i.length < o.length ? o.filter((b) => i.includes(b.frame)) : o;
  if (!l.length) {
    e.curveZoom = 1, e.curveZoomX = 1, e.curvePanX = 0, e.curvePanY = 0, e.drawCurveEditor(), e.setStatus(s("Curve view fitted"));
    return;
  }
  const p = l.map((b) => b.frame), m = Math.min(...p), f = Math.max(...p), d = Math.max(1, f - m);
  if (l.length < o.length && d < a) {
    const b = Math.max(2, Math.round(d * 0.15)), v = Math.max(0, m - b), y = Math.min(a, f + b), x = Math.max(1, y - v);
    e.curveZoomX = ee(a / x, 0.2, 30), e.curvePanX = v;
  } else
    e.curveZoomX = 1, e.curvePanX = 0;
  const h = [];
  for (const b of l) {
    const v = r ? b.transform || r : b.camera || b;
    for (const y of n) {
      const x = y.get(v);
      Number.isFinite(x) && h.push(x);
    }
  }
  if (h.length > 0) {
    const b = Math.min(...h), v = Math.max(...h), y = Math.max(1e-4, v - b), x = (b + v) / 2, k = (M) => r ? Do(r, M) : $e(e.state, M), g = [], _ = Math.max(1, Math.floor(a / 40));
    for (let M = 0; M <= a; M += _) {
      const P = k(M);
      for (const j of n) {
        const R = j.get(P);
        Number.isFinite(R) && g.push(R);
      }
    }
    let A = Math.min(...g), K = Math.max(...g);
    (!Number.isFinite(A) || !Number.isFinite(K)) && (A = -1, K = 1), Math.abs(K - A) < 1e-6 && (A -= 1, K += 1);
    const F = (K - A) * 0.1;
    A -= F, K += F;
    const J = K - A, H = (A + K) / 2;
    if (l.length < o.length && y < J * 0.75) {
      const M = y * 1.35;
      e.curveZoom = ee(J / M, 0.2, 30), e.curvePanY = x - H;
    } else
      e.curveZoom = 1, e.curvePanY = 0;
  } else
    e.curveZoom = 1, e.curvePanY = 0;
  e.drawCurveEditor();
  const u = l.length < o.length ? s("Fitted to {n} selected keys").replace("{n}", l.length) : s("Curve view fitted");
  e.setStatus(u);
}
function Rd(e) {
  Ts(e);
}
function ht(e) {
  const t = e.root.querySelector('[data-role="curve-group"]')?.value || "camera";
  let a = [];
  if (e.timelineObject()) {
    const r = t === "target" ? "rotation" : t === "lens" ? "size" : "position", n = t === "target" ? "rot" : t === "lens" ? "scale" : "pos", i = r === "size" ? "Scale" : r[0].toUpperCase() + r.slice(1);
    a = [0, 1, 2].map((c) => ({
      id: `${n}_${"xyz"[c]}`,
      name: `${i} ${"XYZ"[c]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][c],
      get: (l) => (l[r] || [0, 0, 0])[c],
      set: (l, p) => {
        l[r] || (l[r] = [0, 0, 0]), l[r][c] = r === "size" ? Math.max(0.01, p) : p;
      }
    }));
  } else t === "target" ? a = [0, 1, 2].map((r) => ({
    id: `target_${"xyz"[r]}`,
    name: `Target ${"XYZ"[r]}`,
    color: ["#ef5350", "#53d86a", "#4aa3ef"][r],
    get: (n) => (n.target || [0, 0, 0])[r],
    set: (n, i) => {
      n.target || (n.target = [0, 0, 0]), n.target[r] = i;
    }
  })) : t === "camera" ? a = [
    ...[0, 1, 2].map((r) => ({
      id: `pos_${"xyz"[r]}`,
      name: `Position ${"XYZ"[r]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][r],
      get: (n) => (n.position || [0, 0, 0])[r],
      set: (n, i) => {
        n.position || (n.position = [0, 0, 0]), n.position[r] = i;
      }
    })),
    { id: "fov", name: "Focal Length", color: "#43c7db", get: (r) => r.fov ?? 35, set: (r, n) => {
      r.fov = ee(n, 5, 150);
    } },
    { id: "roll", name: "Roll", color: "#ec4899", get: (r) => r.roll || 0, set: (r, n) => {
      r.roll = ee(n, -180, 180);
    } }
  ] : t === "lens" ? a = [
    { id: "fov", name: "FOV", color: "#ef8b3e", get: (r) => r.fov ?? 35, set: (r, n) => {
      r.fov = ee(n, 5, 150);
    } },
    { id: "roll", name: "Roll", color: "#43c7db", get: (r) => r.roll || 0, set: (r, n) => {
      r.roll = ee(n, -180, 180);
    } },
    { id: "zoom", name: "Zoom", color: "#66d17a", get: (r) => r.zoom || 1, set: (r, n) => {
      r.zoom = Math.max(0.01, n);
    } }
  ] : a = [0, 1, 2].map((r) => ({
    id: `pos_${"xyz"[r]}`,
    name: `Position ${"XYZ"[r]}`,
    color: ["#ef5350", "#53d86a", "#4aa3ef"][r],
    get: (n) => (n.position || [0, 0, 0])[r],
    set: (n, i) => {
      n.position || (n.position = [0, 0, 0]), n.position[r] = i;
    }
  }));
  const o = e.curveChannelFilter;
  if (o && o !== "all") {
    const r = parseInt(o, 10);
    if (!isNaN(r) && a[r])
      return [a[r]];
  }
  return a;
}
function Dd(e) {
  const t = e.root.querySelector('[data-role="curve-canvas"]');
  if (!t) return;
  const a = t.clientWidth, o = t.clientHeight || 180;
  if (!a || !o) return;
  const r = Math.min(2, window.devicePixelRatio || 1);
  (t.width !== Math.round(a * r) || t.height !== Math.round(o * r)) && (t.width = Math.round(a * r), t.height = Math.round(o * r));
  const n = t.getContext("2d");
  n.setTransform(r, 0, 0, r, 0, 0), n.clearRect(0, 0, a, o);
  const i = e.timelineObject(), c = e.timelineKeyframes(), l = ht(e), p = 44, m = 14, f = 16, d = 22, h = Math.max(1, a - p - m), u = Math.max(1, o - f - d), b = Math.max(1, e.state.duration_frames - 1), v = ee(Number(e.curveZoomX) || 1, 0.1, 50), y = Number(e.curvePanX) || 0, x = b / v, k = y, g = y + x, _ = [], A = Math.max(1, Math.ceil(x / Math.max(80, h))), K = (E) => i ? Do(i, E) : $e(e.state, E);
  for (let E = 0; E <= b; E += A) _.push({ frame: E, value: K(E) });
  _[_.length - 1]?.frame !== b && _.push({ frame: b, value: K(b) });
  const F = _.flatMap((E) => l.map((Y) => Y.get(E.value)));
  let J = Math.min(...F), H = Math.max(...F);
  (!Number.isFinite(J) || !Number.isFinite(H)) && (J = -1, H = 1), Math.abs(H - J) < 1e-6 && (J -= 1, H += 1);
  const M = (H - J) * 0.1;
  J -= M, H += M;
  const P = ee(Number(e.curveZoom) || 1, 0.1, 50), j = (H + J) / 2 + (Number(e.curvePanY) || 0), R = (H - J) / P;
  J = j - R / 2, H = j + R / 2;
  const q = (E) => p + (E - k) / Math.max(1e-6, g - k) * h, G = (E) => f + u * (H - E) / Math.max(1e-6, H - J);
  if (n.fillStyle = "#111114", n.fillRect(0, 0, a, o), n.strokeStyle = "#222228", n.lineWidth = 1, n.font = "9px system-ui, -apple-system, sans-serif", n.fillStyle = "#6e727a", Ed(n, {
    left: p,
    right: m,
    top: f,
    width: a,
    graphWidth: h,
    graphHeight: u,
    height: o,
    timeMin: k,
    timeMax: g,
    totalDuration: b,
    xFor: q,
    frame: e.frame
  }), Ad(n, { left: p, right: m, top: f, width: a, graphHeight: u, minimum: J, maximum: H, yFor: G }), J <= 0 && H >= 0) {
    const E = G(0);
    n.strokeStyle = "#383842", n.lineWidth = 1.2, n.beginPath(), n.moveTo(p, E), n.lineTo(a - m, E), n.stroke();
  }
  e.curveHitPoints = [];
  for (const E of l) {
    n.strokeStyle = E.color, n.lineWidth = 2, n.beginPath();
    let Y = !1;
    _.forEach((D) => {
      const X = q(D.frame), te = G(E.get(D.value));
      X >= p - 50 && X <= a - m + 50 && (Y ? n.lineTo(X, te) : (n.moveTo(X, te), Y = !0));
    }), n.stroke();
    for (const D of c) {
      const X = i ? D.transform : D.camera, te = q(D.frame), le = G(E.get(X)), se = D.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(D.frame);
      se && (n.fillStyle = "rgba(242, 208, 107, 0.35)", n.beginPath(), n.arc(te, le, 8.5, 0, Math.PI * 2), n.fill()), n.fillStyle = se ? "#ffd75e" : E.color, n.strokeStyle = "#0d0d10", n.lineWidth = 1.6, n.beginPath(), n.arc(te, le, se ? 5.2 : 3.8, 0, Math.PI * 2), n.fill(), n.stroke(), e.curveHitPoints.push({
        x: te,
        y: le,
        key: D,
        channel: E,
        minimum: J,
        maximum: H,
        timeMin: k,
        timeMax: g,
        graphHeight: u,
        graphWidth: h,
        lastFrame: b,
        left: p,
        top: f,
        object: i
      });
    }
    if (e.showCurveHandles)
      for (let D = 0; D < c.length; D++) {
        const X = c[D], te = X.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(X.frame);
        if (!(te || e.curveChannelFilter !== "all" || c.length <= 4) || X.interpolation !== "bezier") continue;
        const se = i ? X.transform || i : X.camera || X, re = q(X.frame), de = G(E.get(se)), ge = c[D - 1], he = c[D + 1], ye = Math.max(1, X.frame - (ge?.frame ?? X.frame - 1)), ve = Math.max(1, (he?.frame ?? X.frame + 1) - X.frame), pe = Ei(
          X,
          E.id,
          ge,
          he,
          (N) => E.get(i ? N.transform || i : N.camera || X)
        ), Me = (H - J) / Math.max(1, u), xe = h * ve / Math.max(1, x), we = h * ye / Math.max(1, x), be = [];
        (ge || D > 0) && be.push({ side: "in", x: re + pe.in_x * we, y: de - pe.in_y / Me }), (he || D < c.length - 1 || c.length === 1) && be.push({ side: "out", x: re + pe.out_x * xe, y: de - pe.out_y / Me });
        for (const N of be) {
          if (n.strokeStyle = E.color, n.lineWidth = te ? 1.5 : 1, n.beginPath(), n.moveTo(re, de), n.lineTo(N.x, N.y), n.stroke(), n.fillStyle = te ? "#2a2233" : "#171720", n.strokeStyle = te ? "#ffd75e" : E.color, n.lineWidth = te ? 2 : 1.2, n.beginPath(), N.side === "in")
            n.arc(N.x, N.y, te ? 5 : 3.8, 0, Math.PI * 2);
          else {
            const V = te ? 4.5 : 3.2;
            n.rect(N.x - V, N.y - V, V * 2, V * 2);
          }
          n.fill(), n.stroke(), e.curveHitPoints.push({
            x: N.x,
            y: N.y,
            key: X,
            keyX: re,
            keyY: de,
            channel: E,
            minimum: J,
            maximum: H,
            timeMin: k,
            timeMax: g,
            top: f,
            left: p,
            graphHeight: u,
            graphWidth: h,
            lastFrame: b,
            object: i,
            handle: N.side,
            pixelPerSegment: N.side === "in" ? we : xe,
            valuePerPixel: Me,
            startHandles: { ...pe }
          });
        }
      }
  }
  if (e.curveBoxSelect) {
    const E = Math.min(e.curveBoxSelect.startX, e.curveBoxSelect.currentX), Y = Math.min(e.curveBoxSelect.startY, e.curveBoxSelect.currentY), D = Math.abs(e.curveBoxSelect.currentX - e.curveBoxSelect.startX), X = Math.abs(e.curveBoxSelect.currentY - e.curveBoxSelect.startY);
    n.fillStyle = "rgba(56, 189, 248, 0.15)", n.fillRect(E, Y, D, X), n.strokeStyle = "#38bdf8", n.lineWidth = 1, n.setLineDash([4, 4]), n.strokeRect(E, Y, D, X), n.setLineDash([]);
  }
  const L = q(e.frame);
  if (L >= p && L <= a - m && (n.strokeStyle = "#a78bfa", n.lineWidth = 1.5, n.beginPath(), n.moveTo(L, f), n.lineTo(L, f + u), n.stroke(), n.fillStyle = "#a78bfa", n.beginPath(), n.moveTo(L - 4, f), n.lineTo(L + 4, f), n.lineTo(L, f + 6), n.closePath(), n.fill()), e.curveDrag || e.curveHover) {
    let E = "", Y = "";
    if (e.curveDrag)
      if (e.curveDrag.handle) {
        const D = e.curveDrag.handle === "in" ? "In" : "Out";
        E = `F${e.curveDrag.key.frame} · ${e.curveDrag.channel.name} (${D})`, Y = "Tangent edit";
      } else if (e.curveDrag.group && e.curveDrag.group.length > 1) {
        const D = e.curveDrag.key.frame - e.curveDrag.startFrame, X = e.curveDrag.channel.get(e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera), te = X - e.curveDrag.startValue, le = D >= 0 ? `+${D}` : `${D}`, se = te >= 0 ? `+${te.toFixed(2)}` : `${te.toFixed(2)}`;
        E = `${e.curveDrag.group.length} keys · ΔF: ${le} · ΔVal: ${se}`, Y = `${e.curveDrag.channel.name}: ${X.toFixed(2)}`;
      } else {
        const D = e.curveDrag.key.frame - e.curveDrag.startFrame, X = e.curveDrag.channel.get(e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera), te = X - e.curveDrag.startValue, le = D >= 0 ? `+${D}` : `${D}`, se = te >= 0 ? `+${te.toFixed(2)}` : `${te.toFixed(2)}`;
        E = `F${e.curveDrag.key.frame} (${le}) · ${e.curveDrag.channel.name}: ${X.toFixed(2)} (${se})`;
      }
    else if (e.curveHover)
      if (e.curveHover.channelName) {
        const D = Number.isFinite(e.curveHover.value) ? e.curveHover.value.toFixed(2) : "";
        E = `F${e.curveHover.frame} · ${e.curveHover.channelName}: ${D}`, e.curveHover.isHandle && (Y = `Handle ${e.curveHover.handleSide}`);
      } else
        E = `Frame ${e.curveHover.frame}`;
    if (E) {
      n.save(), n.font = "11px system-ui, -apple-system, sans-serif";
      const D = n.measureText(E), X = Y ? n.measureText(Y) : { width: 0 }, te = Math.max(D.width, X.width) + 16, le = Y ? 32 : 20, se = a - m - te - 6, re = f + 6;
      n.fillStyle = "rgba(18, 18, 24, 0.88)", n.strokeStyle = "#38384a", n.lineWidth = 1, n.beginPath(), n.roundRect ? n.roundRect(se, re, te, le, 4) : n.rect(se, re, te, le), n.fill(), n.stroke(), n.fillStyle = "#e2e8f0", n.fillText(E, se + 8, re + (Y ? 13 : 14)), Y && (n.fillStyle = "#94a3b8", n.font = "9.5px system-ui, -apple-system, sans-serif", n.fillText(Y, se + 8, re + 26)), n.restore();
    }
  }
  for (const E of e.root.querySelectorAll("[data-tangent-mode]")) {
    const Y = e.selectedKeyframe(), D = Y?.tangents?.channels?.[l[0]?.id]?.mode || Y?.tangents?.mode || "auto";
    E.classList.toggle("active", E.dataset.tangentMode === D);
  }
  for (const E of e.root.querySelectorAll("[data-channel-filter]"))
    E.classList.toggle("active", E.dataset.channelFilter === (e.curveChannelFilter || "all"));
  for (const E of e.root.querySelectorAll("[data-curve-mode]"))
    E.classList.toggle("active", E.dataset.curveMode === e.selectedKeyframe()?.interpolation);
}
function dn(e, { filter: t, label: a, color: o, title: r }) {
  const n = document.createElement("button");
  if (n.type = "button", n.className = "curve-mode", n.dataset.channelFilter = t, n.title = r, o) {
    const i = document.createElement("span");
    i.className = "ch-dot", i.style.background = o, n.appendChild(i);
  }
  return n.appendChild(document.createTextNode(a)), n.addEventListener("click", () => e.setChannelFilter(t)), n;
}
function Kd(e) {
  const t = e.curveChannelFilter;
  e.curveChannelFilter = "all";
  try {
    return ht(e);
  } finally {
    e.curveChannelFilter = t;
  }
}
function $s(e) {
  const t = e.root.querySelector('[data-role="curve-legend"]');
  if (!t) return;
  const a = e.timelineObject(), o = a ? a.name || a.type : e.activeCameraTrack().name, r = Kd(e), n = `${o}\0${r.map((c) => `${c.id}:${c.color}`).join("|")}`;
  if (t.dataset.signature !== n) {
    t.dataset.signature = n, t.replaceChildren();
    const c = document.createElement("span");
    c.className = "oc-graph-legend-title", c.textContent = o, t.appendChild(c), t.appendChild(dn(e, {
      filter: "all",
      label: s("All"),
      color: null,
      title: s("Show all curves in group")
    })), r.forEach((l, p) => {
      t.appendChild(dn(e, {
        filter: String(p),
        label: s(l.name),
        color: l.color,
        title: s("Show only {channel}").replace("{channel}", s(l.name))
      }));
    });
  }
  const i = String(e.curveChannelFilter ?? "all");
  for (const c of t.querySelectorAll("[data-channel-filter]")) {
    const l = c.dataset.channelFilter === i;
    c.classList.toggle("active", l), c.setAttribute("aria-pressed", String(l));
  }
}
const Bd = 1e-4;
function mn(e, t, a) {
  const o = [];
  let r = null;
  for (const n of [...e].sort((i, c) => i.frame - c.frame)) {
    const i = (a ? n.transform : n.camera) || {};
    let c;
    try {
      c = Number(t.get(i));
    } catch {
      c = NaN;
    }
    (r === null || !(Math.abs(c - r) <= Bd)) && o.push(n.frame), r = c;
  }
  return o;
}
function zr(e) {
  const t = e.root.querySelector('[data-role="graph-dope"]');
  if (!t || t.hidden) return;
  const a = e.timelineKeyframes() || [], o = !!e.timelineObject(), r = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame])), n = ht(e), i = [
    e.state.duration_frames,
    Number(e.timelineZoom) || 1,
    Number(e.timelinePan) || 0,
    ...n.map((c) => `${c.id}:${mn(a, c, o).join(",")}`)
  ].join("\0");
  if (t.dataset.signature === i) {
    for (const c of t.querySelectorAll(".oc-dope-key")) {
      const l = Number(c.dataset.frame);
      c.classList.toggle("at-playhead", l === e.frame), c.classList.toggle("selected", r.has(l));
    }
    Mo(e);
    return;
  }
  t.dataset.signature = i, t.replaceChildren();
  for (const c of n) {
    const l = document.createElement("div");
    l.className = "oc-gdope-row", l.style.setProperty("--channel-color", c.color);
    const p = document.createElement("span");
    p.className = "oc-gdope-label", p.textContent = s(c.name), l.appendChild(p);
    const m = document.createElement("div");
    m.className = "oc-gdope-track";
    for (const d of mn(a, c, o)) {
      const h = ue(e, d);
      if (h < -5 || h > 105) continue;
      const u = document.createElement("button");
      u.type = "button", u.className = `oc-dope-key${d === e.frame ? " at-playhead" : ""}${r.has(d) ? " selected" : ""}`, u.style.left = `${h}%`, u.dataset.frame = String(d), u.title = s("{channel} changes at frame {frame}").replace("{channel}", s(c.name)).replace("{frame}", String(d)), u.addEventListener("click", (b) => {
        b.preventDefault(), b.stopPropagation();
        const v = a.find((y) => y.frame === d);
        v && e.selectKeyframe(v);
      }), m.appendChild(u);
    }
    const f = document.createElement("span");
    f.className = "oc-gdope-playhead", m.appendChild(f), l.appendChild(m), t.appendChild(l);
  }
  Mo(e);
}
const pn = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
function Ms(e, t) {
  const a = e.state.cameras.findIndex((r) => r.id === t), o = a >= 0 ? e.state.cameras[a] : null;
  return { camera: o, color: o?.color || pn[Math.max(0, a) % pn.length] };
}
function Ct(e) {
  e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render();
}
function Is(e, t) {
  const a = Cr(e.state);
  for (const r of t.querySelectorAll(".oc-sequence-shot")) {
    const n = a[Number(r.dataset.cutIndex)];
    if (!n) continue;
    const i = ue(e, n.start), c = ue(e, n.end + 1);
    r.style.left = `${i}%`, r.style.width = `${Math.max(0.4, c - i)}%`;
  }
  const o = t.querySelector(".oc-sequence-playhead");
  o && (o.style.left = `${ue(e, e.frame)}%`);
}
function qd(e) {
  e.checkpoint("Auto-split shots"), e.state.sequence = {
    ...e.state.sequence || { recording_path: "" },
    enabled: !0,
    cuts: $i(e.state)
  }, Ct(e), e.setStatus(s("Split into {count} shots").replace("{count}", String(e.state.sequence.cuts.length)));
}
function ho(e, t, a, { disabled: o = !1 } = {}) {
  const r = document.createElement("button");
  return r.type = "button", r.className = "curve-mode", r.title = t, r.textContent = e, r.disabled = o, r.addEventListener("click", a), r;
}
function Ud(e, t) {
  const a = document.createElement("div");
  a.className = "oc-sequence-toolbar";
  const o = e.state.cameras.length < 2;
  if (a.appendChild(ho(
    s("Auto-split shots"),
    s("Split the timeline evenly across every camera"),
    () => qd(e),
    { disabled: o }
  )), t.length && (a.appendChild(ho(
    s("Split at playhead"),
    s("Cut the current shot in two at the playhead"),
    () => {
      e.checkpoint("Split shot"), rs(e.state, e.frame, null) ? Ct(e) : e.setStatus(s("Move the playhead inside a shot first"));
    },
    { disabled: o }
  )), a.appendChild(ho(
    s("Clear edit"),
    s("Remove every shot and stop cutting the timeline"),
    () => {
      e.checkpoint("Clear edit"), e.state.sequence = { ...e.state.sequence, enabled: !1, cuts: [] }, Ct(e), e.setStatus(s("Multi-camera edit cleared"));
    }
  ))), a.appendChild(ho(
    e.audioWaveformPeaks?.length ? s("Replace audio") : s("Load audio"),
    s("Load an audio track to cut against"),
    () => e.root.querySelector('[data-role="audio-file"]')?.click()
  )), t.length) {
    const r = document.createElement("span");
    r.className = "oc-sequence-summary", r.textContent = s("{count} shots · drag a divider to trim · right-click a shot for its camera").replace("{count}", String(t.length)), a.appendChild(r);
  }
  return a;
}
function Wd(e, t, a, o, r) {
  t.preventDefault(), t.stopPropagation();
  try {
    a.setPointerCapture(t.pointerId);
  } catch {
  }
  e.checkpoint("Trim cut"), e.sequenceDrag = !0;
  const n = (c) => {
    if (!(c.buttons & 1)) return i();
    Ti(e.state, r, _r(e, c, o)) && Is(e, o);
  }, i = () => {
    a.removeEventListener("pointermove", n), a.removeEventListener("pointerup", i), a.removeEventListener("pointercancel", i), a.removeEventListener("lostpointercapture", i);
    try {
      a.releasePointerCapture(t.pointerId);
    } catch {
    }
    e.sequenceDrag && (e.sequenceDrag = !1, e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render(), e.setStatus(s("Cut trimmed")));
  };
  a.addEventListener("pointermove", n), a.addEventListener("pointerup", i), a.addEventListener("pointercancel", i), a.addEventListener("lostpointercapture", i);
}
function Vd(e, t, a, o, r) {
  t.preventDefault(), t.stopPropagation();
  const { camera: n } = Ms(e, a.camera_id);
  e.contextMenu?.show(t, n?.name || s("Shot"), [
    ...e.state.cameras.map((i) => ({
      label: s("Use {name}").replace("{name}", i.name),
      icon: "pi-video",
      disabled: i.id === a.camera_id,
      run: () => {
        e.checkpoint("Change shot camera"), e.state.sequence.cuts[o].camera_id = i.id, Ct(e);
      }
    })),
    null,
    {
      label: s("Split at playhead"),
      icon: "pi-arrows-h",
      disabled: e.frame <= a.start || e.frame > a.end,
      run: () => {
        e.checkpoint("Split shot"), rs(e.state, e.frame, null) && Ct(e);
      }
    },
    {
      label: s("Remove shot"),
      icon: "pi-trash",
      danger: !0,
      disabled: r === 1,
      run: () => {
        e.checkpoint("Remove shot"), Ai(e.state, o) && Ct(e);
      }
    }
  ]);
}
function Hd(e, t, a, o) {
  const { camera: r, color: n } = Ms(e, t.camera_id), i = document.createElement("div");
  i.className = "oc-sequence-shot", i.dataset.cutIndex = String(a), i.style.left = `${ue(e, t.start)}%`, i.style.width = `${Math.max(0.4, ue(e, t.end + 1) - ue(e, t.start))}%`, i.style.setProperty("--shot-color", n), r?.recording_path || i.classList.add("no-proxy"), i.title = s("{name} · F{start}-{end}").replace("{name}", r?.name || t.camera_id).replace("{start}", String(t.start)).replace("{end}", String(t.end));
  const c = document.createElement("span");
  if (c.className = "oc-sequence-name", c.textContent = r?.name || t.camera_id, i.appendChild(c), a > 0) {
    const l = document.createElement("span");
    l.className = "oc-sequence-handle", l.title = s("Drag to trim the cut"), l.addEventListener("pointerdown", (p) => Wd(e, p, l, o, a)), i.appendChild(l);
  }
  return i.addEventListener("contextmenu", (l) => Vd(e, l, t, a, o.__cutCount)), i.addEventListener("pointerdown", () => {
    e.root.querySelector('[data-role="graph-sequence"]')?.focus?.({ preventScroll: !0 });
  }), i;
}
function Gd(e) {
  const t = document.createElement("div");
  t.className = "oc-sequence-audio";
  const a = e.audioWaveformPeaks;
  if (!a?.length) {
    const r = document.createElement("span");
    return r.className = "oc-sequence-empty oc-sequence-audio-empty", r.textContent = s("No audio track. Load one to cut to the beat."), t.appendChild(r), t;
  }
  const o = document.createElement("canvas");
  return o.className = "oc-sequence-waveform", t.appendChild(o), requestAnimationFrame(() => {
    const r = Math.max(1, Math.round(t.clientWidth)), n = Math.max(1, Math.round(t.clientHeight));
    o.width = r, o.height = n;
    const i = o.getContext("2d");
    if (!i) return;
    const c = Math.max(1, e.state.duration_frames - 1), l = Math.min(50, Math.max(0.1, Number(e.timelineZoom) || 1)), p = Number(e.timelinePan) || 0, m = c / l;
    i.fillStyle = "#f2d06b";
    for (let f = 0; f < a.length; f++) {
      const h = (f / (a.length - 1) * c - p) / Math.max(1e-6, m) * r;
      if (h < -4 || h > r + 4) continue;
      const u = a[f] * n * 0.9;
      i.fillRect(h, (n - u) / 2, Math.max(1, r / a.length * l - 0.5), u);
    }
  }), t;
}
function Os(e, t) {
  if (!t) return;
  const a = t.querySelector('[data-role="sequence-track"]');
  if (e.sequenceDrag && a) {
    Is(e, a);
    return;
  }
  const o = Cr(e.state);
  t.replaceChildren(Ud(e, o));
  const r = document.createElement("div");
  r.className = "oc-sequence-tracks", r.dataset.role = "sequence-track", r.__cutCount = o.length;
  const n = document.createElement("div");
  if (n.className = "oc-sequence-lane", n.dataset.role = "sequence-lane", n.setAttribute("aria-label", s("Multi-camera edit")), o.length)
    for (const [c, l] of o.entries()) {
      const p = ue(e, l.start);
      ue(e, l.end + 1) < -5 || p > 105 || n.appendChild(Hd(e, l, c, r));
    }
  else {
    const c = document.createElement("span");
    c.className = "oc-sequence-empty", c.textContent = e.state.cameras.length > 1 ? s("No shots yet. Auto-split hands each camera a slice of the timeline.") : s("Add a second camera, then Auto-split to cut between them."), n.appendChild(c);
  }
  r.appendChild(n), r.appendChild(Gd(e));
  const i = document.createElement("span");
  i.className = "oc-sequence-playhead", i.style.left = `${ue(e, e.frame)}%`, r.appendChild(i), t.appendChild(r);
}
const Yd = ['[data-act="curve-zoom-in"]', '[data-act="curve-zoom-out"]', '[data-act="curve-fit"]', '[data-act="curve-handles"]'], fn = { curves: "Graph", dope: "Timeline", sequence: "Sequence" };
function hn(e, t) {
  const a = t in fn ? t : "curves";
  e.graphTab = a;
  for (const i of e.root.querySelectorAll("[data-graph-tab]")) {
    const c = i.dataset.graphTab === a;
    i.classList.toggle("active", c), i.setAttribute("aria-pressed", String(c));
  }
  const o = e.root.querySelector('[data-role="curve-canvas"]'), r = e.root.querySelector('[data-role="graph-dope"]'), n = e.root.querySelector('[data-role="graph-sequence"]');
  o && (o.hidden = a !== "curves"), r && (r.hidden = a !== "dope"), n && (n.hidden = a !== "sequence");
  for (const i of Yd) {
    const c = e.root.querySelector(i);
    c && (c.disabled = a !== "curves");
  }
  a === "dope" ? zr(e) : a === "sequence" ? (Os(e, n), n?.focus?.({ preventScroll: !0 })) : e.drawCurveEditor(), e.setStatus(s(fn[a]));
}
function Xd(e) {
  e.graphTab === "sequence" && Os(e, e.root.querySelector('[data-role="graph-sequence"]'));
}
function Jd(e, t) {
  const a = e.root.querySelector('[data-role="graph-tabs"]');
  a && a.addEventListener("keydown", (o) => {
    if (o.key === "ArrowLeft" || o.key === "ArrowRight") {
      o.preventDefault(), o.stopPropagation();
      const r = [...a.querySelectorAll("[data-graph-tab]")], n = r.findIndex((i) => i.classList.contains("active"));
      if (n >= 0 && r.length > 1) {
        const i = o.key === "ArrowRight" ? (n + 1) % r.length : (n - 1 + r.length) % r.length;
        r[i].focus(), hn(e, r[i].dataset.graphTab);
      }
    }
  }, { signal: t });
  for (const o of e.root.querySelectorAll("[data-graph-tab]"))
    o.addEventListener("click", (r) => {
      r.preventDefault(), r.stopPropagation(), hn(e, o.dataset.graphTab);
    }, { signal: t });
}
const Zd = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function Ps(e, t) {
  const a = Math.max(0, Math.floor(Number(t) || 0)), o = Array.from({ length: a }, (n, i) => ({ frame: i, state: "unknown", score: null })), r = e?.solve_health_v1;
  if (!r || !Array.isArray(r.frames)) return o;
  for (const n of r.frames) {
    const i = Number(n?.frame);
    if (!Number.isInteger(i) || i < 0 || i >= o.length) continue;
    const c = Zd.has(n?.state) ? n.state : "unknown", l = n?.score;
    let p = null;
    if (l != null) {
      const m = Number(l);
      p = Number.isFinite(m) ? Math.max(0, Math.min(1, m)) : null;
    }
    o[i] = { frame: i, state: c, score: p };
  }
  return o;
}
let un = /* @__PURE__ */ new WeakSet();
function Qd(e) {
  if (!e) return "";
  const t = e.score === null || e.score === void 0 ? "" : ` · ${Math.round(e.score * 100)}%`;
  return `F${e.frame} · ${e.state}${t}`;
}
function em(e) {
  const t = e.root?.querySelector?.('[data-role="solve-health-strip"]'), a = e.root?.querySelector?.('[data-role="solve-health-cells"]');
  if (!t || !a) return;
  const o = Ps(e.state?.metadata, e.state?.duration_frames), r = o.some((c) => c.state !== "unknown");
  t.classList.toggle("oc-health-strip-empty", !r), a.childElementCount !== o.length && a.replaceChildren(...o.map(() => {
    const c = document.createElement("span");
    return c.className = "oc-health-cell", c;
  }));
  const n = a.children;
  for (let c = 0; c < o.length; c += 1) {
    const l = n[c], p = o[c];
    l.dataset.frame = String(p.frame), l.dataset.state = p.state, l.dataset.score = p.score === null ? "" : String(p.score), l.classList.toggle("at-playhead", p.frame === e.frame);
  }
  if (un.has(a)) return;
  un.add(a), a.addEventListener("pointerdown", (c) => {
    const l = c.target.closest?.(".oc-health-cell");
    if (!l) return;
    const p = Number(l.dataset.frame);
    Number.isInteger(p) && e.setFrame(p);
  });
  const i = e.root.querySelector('[data-role="solve-health-readout"]');
  a.addEventListener("pointermove", (c) => {
    const l = c.target.closest?.(".oc-health-cell");
    if (i) {
      if (!l) {
        i.textContent = "";
        return;
      }
      i.textContent = Qd({
        frame: Number(l.dataset.frame),
        state: l.dataset.state,
        score: l.dataset.score === "" ? null : Number(l.dataset.score)
      });
    }
  }), a.addEventListener("pointerleave", () => {
    i && (i.textContent = "");
  });
}
function tm(e) {
  const t = e.root.querySelector('[data-role="keys"]');
  if (!t) return;
  t.innerHTML = "";
  const a = e.timelineObject(), o = e.timelineKeyframes(), r = Math.max(1, e.state.duration_frames - 1), n = ee(Number(e.timelineZoom) || 1, 0.1, 50), i = Number(e.timelinePan) || 0, c = r / n, l = i;
  if (e.audioWaveformPeaks && e.audioWaveformPeaks.length) {
    const x = document.createElement("canvas");
    x.className = "timeline-waveform", x.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:0.35", x.width = Math.max(1, t.clientWidth || 600), x.height = Math.max(1, t.clientHeight || 68);
    const k = x.getContext("2d"), g = e.audioWaveformPeaks, _ = x.width, A = x.height, K = A / 2;
    k.fillStyle = "#f2d06b";
    for (let F = 0; F < g.length; F++) {
      const H = (F / (g.length - 1) * r - l) / Math.max(1e-6, c) * _;
      if (H >= -5 && H <= _ + 5) {
        const M = g[F] * (A * 0.85);
        k.fillRect(H, K - M / 2, Math.max(1, _ / g.length * n - 0.5), M);
      }
    }
    t.appendChild(x);
  }
  if (e.state.playback_range) {
    const x = document.createElement("div");
    x.className = "playback-range";
    const k = ue(e, e.state.playback_range[0]), g = ue(e, e.state.playback_range[1]);
    x.style.left = `${k}%`, x.style.width = `${Math.max(0, g - k)}%`, t.appendChild(x);
  }
  Mi(e, t);
  for (const x of e.state.markers || []) {
    const k = ue(e, x.frame);
    if (k < -5 || k > 105) continue;
    const g = document.createElement("span");
    g.className = "timeline-marker", g.style.left = `${k}%`, g.style.setProperty("--marker-color", x.color), g.title = x.name, t.appendChild(g);
  }
  if (o.length > 1) {
    const x = ue(e, o[0].frame), k = ue(e, o[o.length - 1].frame), g = document.createElement("span");
    g.className = "oc-dope-rail", g.style.left = `${Math.min(x, k)}%`, g.style.width = `${Math.abs(k - x)}%`, g.style.setProperty("--channel-color", "#a78bfa"), t.appendChild(g);
  }
  const p = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const x of o) {
    const k = ue(e, x.frame);
    if (k < -5 || k > 105) continue;
    const g = document.createElement("button");
    g.type = "button", g.className = `key${x.frame === e.frame ? " at-playhead" : ""}${p.has(x.frame) ? " selected" : ""}${x.frame === e.editingKeyFrame ? " editing" : ""}`, g.dataset.keyFrame = String(x.frame), g.dataset.interp = x.interpolation || "ease", g.setAttribute("aria-label", s(`${a?.name || "Camera"} keyframe at frame ${x.frame}`)), g.title = s(`Frame ${x.frame} · ${x.interpolation} · Drag: Retime · Alt+Drag: Duplicate`), g.style.left = `${k}%`;
    const _ = document.createElement("span");
    _.className = "key-label", _.textContent = String(x.frame), g.appendChild(_), g.addEventListener("pointerdown", (A) => {
      if (A.preventDefault(), A.stopPropagation(), g.focus({ preventScroll: !0 }), A.altKey) {
        e.checkpoint("Duplicate keyframe");
        const F = a ? { frame: x.frame, transform: Ye(x.transform), interpolation: x.interpolation } : { frame: x.frame, camera: ce(x.camera), interpolation: x.interpolation }, J = e.timelineKeyframes();
        J.push(F), J.sort((H, M) => H.frame - M.frame), e.selectedKeyFrame = F.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([F.frame]), e.keyDrag = { key: F, box: t, isDuplicate: !0, historyCheckpointed: !0, moving: [{ key: F, startFrame: F.frame }], startPointerFrame: x.frame, startClientX: A.clientX, startClientY: A.clientY }, e.setFrame(F.frame, !1, !1), e.setStatus(s(`Duplicating key from ${x.frame}...`));
        return;
      }
      if (A.shiftKey) {
        e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((F) => F !== null)), e.selectedKeyFrames.has(x.frame) ? e.selectedKeyFrames.delete(x.frame) : e.selectedKeyFrames.add(x.frame), e.selectedKeyFrame = e.selectedKeyFrames.has(x.frame) ? x.frame : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(x.frame, !1, !1), e.updateKeyVisualState(), e.refreshKeyEditor();
        return;
      }
      e.selectedKeyFrames?.has(x.frame) || (e.selectedKeyFrames = /* @__PURE__ */ new Set([x.frame])), e.selectedKeyFrame = x.frame;
      const K = e.timelineKeyframes().filter((F) => e.selectedKeyFrames.has(F.frame));
      e.keyDrag = { key: x, box: t, historyCheckpointed: !1, moving: K.map((F) => ({ key: F, startFrame: F.frame })), startPointerFrame: x.frame, startClientX: A.clientX, startClientY: A.clientY }, e.setFrame(x.frame, !1, !1);
    }), g.addEventListener("click", (A) => {
      A.preventDefault(), A.stopPropagation(), !A.shiftKey && (A.shiftKey || (e.selectedKeyFrames = /* @__PURE__ */ new Set([x.frame])), e.selectKeyframe(x));
    }), t.appendChild(g);
  }
  const m = e.activeCameraTrack(), f = e.root.querySelector('[data-role="timeline-summary"]');
  if (f) {
    f.replaceChildren();
    const x = document.createElement("span");
    x.style.fontWeight = "700", e.selectedEntity === "object" && a ? (x.style.color = "#38bdf8", x.textContent = `📦 ${a.name || a.type}`, f.title = s(`Currently animating object: ${a.name || a.type}`)) : (x.style.color = "#f59e0b", x.textContent = `🎥 ${m.name}`, f.title = s(`Currently animating camera: ${m.name}`)), f.append(x, document.createTextNode(` · ${o.length} key${o.length === 1 ? "" : "s"}`));
    const k = e.selectedKeyFrames?.size || 0;
    k > 1 && f.append(document.createTextNode(` · ${k} selected`));
    const g = o.filter((_) => _.frame > e.state.duration_frames - 1).length;
    if (g) {
      const _ = document.createElement("span");
      _.className = "oc-dormant-keys", _.textContent = ` · ${g} beyond end`, _.title = s("Keys past the end of the timeline are kept. Lengthen the shot to reach them again."), f.append(_);
    }
  }
  const d = e.root.querySelector('[data-role="key-count"]');
  d && (d.textContent = String(o.length));
  const h = e.root.querySelector('[data-role="camera-summary"]');
  h && (h.textContent = `${m.name} · Key F${e.selectedKeyFrame ?? e.frame}`);
  const u = e.root.querySelector('[data-role="camera-menu-list"]');
  if (u) {
    u.innerHTML = "";
    for (const x of e.state.cameras) {
      const k = document.createElement("button");
      k.type = "button", k.className = x.id === e.state.active_camera_id ? "selected" : "";
      const g = document.createElement("i");
      g.className = "pi pi-video";
      const _ = document.createElement("span");
      _.textContent = `${x.name} · ${x.keyframes.length} key${x.keyframes.length === 1 ? "" : "s"}${x.id === e.state.playblast_camera_id ? " · PLAYBLAST" : ""}`, k.append(g, _), k.addEventListener("click", () => {
        e.activateCamera(x.id), e.closeMenus();
      }), u.appendChild(k);
    }
  }
  const b = e.root.querySelector('[data-role="frame-total"]');
  b && (b.textContent = `/ ${Math.max(1, e.state.duration_frames)}`);
  const v = e.root.querySelector('[data-role="preview-title"]');
  v && (v.textContent = `${m.name} · ${s("Frame")} ${e.frame}`);
  const y = e.root.querySelector('[data-role="inspector-camera-name"]');
  y && (y.textContent = m.name), As(e), js(e), $s(e), zr(e), Xd(e), e.refreshCameraSelectors(), e.refreshKeyEditor(), e.updateEditState(), e.drawCurveEditor(), e.perf && (e.perf.timelineRefreshCount = (e.perf.timelineRefreshCount || 0) + 1), em(e);
}
class Ls {
  constructor({ capture: t, restore: a, limit: o = 100 }) {
    this.capture = t, this.restore = a, this.limit = o, this.undoStack = [], this.redoStack = [], this.restoring = !1, this.transaction = null;
  }
  checkpoint(t = "Edit") {
    if (this.restoring) return;
    if (this.transaction) return this.commitTransaction();
    const a = this.capture();
    this.undoStack.at(-1)?.snapshot !== a && (this.undoStack.push({ label: t, snapshot: a }), this.undoStack.length > this.limit && this.undoStack.shift(), this.redoStack.length = 0);
  }
  beginTransaction(t = "Edit") {
    return this.restoring || this.transaction ? !1 : (this.transaction = { label: t, snapshot: this.capture(), redoStack: this.redoStack.slice() }, !0);
  }
  commitTransaction() {
    const t = this.transaction;
    return t ? (this.transaction = null, t.snapshot === this.capture() ? (this.redoStack = t.redoStack, null) : (this.undoStack.at(-1)?.snapshot !== t.snapshot && this.undoStack.push({ label: t.label, snapshot: t.snapshot }), this.undoStack.length > this.limit && this.undoStack.shift(), this.redoStack.length = 0, t.label)) : null;
  }
  cancelTransaction() {
    const t = this.transaction;
    if (!t) return null;
    this.transaction = null, this.redoStack = t.redoStack, this.restoring = !0;
    try {
      this.restore(t.snapshot);
    } finally {
      this.restoring = !1;
    }
    return t.label;
  }
  undo() {
    if (this.transaction && this.cancelTransaction(), !this.undoStack.length) return null;
    const t = this.undoStack.pop();
    this.redoStack.push({ label: t.label, snapshot: this.capture() }), this.restoring = !0;
    try {
      this.restore(t.snapshot);
    } finally {
      this.restoring = !1;
    }
    return t.label;
  }
  redo() {
    if (this.transaction && this.cancelTransaction(), !this.redoStack.length) return null;
    const t = this.redoStack.pop();
    this.undoStack.push({ label: t.label, snapshot: this.capture() }), this.restoring = !0;
    try {
      this.restore(t.snapshot);
    } finally {
      this.restoring = !1;
    }
    return t.label;
  }
  clear() {
    this.undoStack.length = 0, this.redoStack.length = 0, this.transaction = null;
  }
  get canUndo() {
    return this.undoStack.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }
}
class Ns {
  constructor(t = URL) {
    this.urlApi = t, this.urls = /* @__PURE__ */ new Map();
  }
  replace(t, a) {
    this.revoke(t);
    const o = typeof a == "string" ? a : this.urlApi.createObjectURL(a);
    return this.urls.set(t, o), o;
  }
  setManaged(t, a) {
    return this.revoke(t), this.urls.set(t, a), a;
  }
  get(t) {
    return this.urls.get(t);
  }
  revoke(t) {
    const a = this.urls.get(t);
    a?.startsWith?.("blob:") && this.urlApi.revokeObjectURL(a), this.urls.delete(t);
  }
  clear() {
    for (const t of [...this.urls.keys()]) this.revoke(t);
  }
}
async function Fr(e, { route: t, field: a = "file", file: o }) {
  if (!o) throw new TypeError("A file is required");
  const r = new FormData();
  r.append(a, o, o.name);
  const n = await e.fetchApi(t, { method: "POST", body: r });
  if (!n.ok) throw new Error(await n.text());
  return n.json();
}
const am = `
      /* ---- header --------------------------------------------------- */
      .majoor-omnicam .oc-header-spacer,.majoor-omnicam .oc-toolbar-spacer,.majoor-omnicam .oc-transport-spacer,.majoor-omnicam .oc-footer-spacer,.majoor-omnicam .oc-graph-spacer{flex:1 1 auto;min-width:0}
      .majoor-omnicam .oc-status-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:999px;background:#16281d;border:1px solid #2f6b45;color:#7ee2a8;font-size:11px;font-weight:600;white-space:nowrap}
      .majoor-omnicam .oc-status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
      .majoor-omnicam .oc-overflow>summary{width:28px;height:28px;justify-content:center;padding:0;color:var(--oc-text-dim)}

      /* ---- toolbar -------------------------------------------------- */
      .majoor-omnicam .top{gap:4px;padding:6px 10px;background:var(--oc-panel);border-bottom:1px solid var(--oc-line);min-height:42px}
      .majoor-omnicam .toolbar-menu>summary{gap:7px;padding:5px 11px;border-radius:var(--oc-radius-sm);color:var(--oc-text-dim);font-weight:550}
      .majoor-omnicam .toolbar-menu[open]>summary,.majoor-omnicam .toolbar-menu>summary:hover{background:var(--oc-panel-2);border-color:var(--oc-line);color:var(--oc-text)}
      .majoor-omnicam .menu-panel{width:260px;background:var(--oc-panel-2);border-color:var(--oc-line);border-radius:var(--oc-radius);box-shadow:0 16px 34px rgba(0,0,0,.62)}
      .majoor-omnicam .menu-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
      .majoor-omnicam .menu-grid .span-2{grid-column:span 2}
      .majoor-omnicam .menu-row{display:flex;gap:4px;align-items:center}
      .majoor-omnicam .menu-row>button{flex:1}
      .majoor-omnicam .menu-row>.icon-button{flex:none}
      .majoor-omnicam .menu-panel input[type=color]{width:46px;height:24px;padding:0;background:transparent;cursor:pointer}
      /* Beats the legacy '.menu-panel label>input[type=checkbox]{width:auto}',
         which left these toggles at a 12px hit target. */
      .majoor-omnicam .menu-panel label>input[type=checkbox]{width:16px;height:16px;padding:0;cursor:pointer}
      .majoor-omnicam .menu-panel label{min-height:24px;cursor:pointer}
      .majoor-omnicam .oc-render-mode{min-width:132px;background:var(--oc-panel-2)}
      .majoor-omnicam .oc-playblast{gap:7px;padding:5px 14px;border-radius:999px;background:var(--oc-accent);border-color:var(--oc-accent);color:var(--oc-accent-ink);font-weight:600}
      .majoor-omnicam .oc-playblast:hover{background:#9a8ae4;border-color:#9a8ae4;color:#fff}
      .majoor-omnicam .oc-playblast-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}

      /* ---- body grid ------------------------------------------------ */
      .majoor-omnicam .oc-body{display:grid;grid-template-columns:var(--oc-left-w,264px) 7px minmax(0,1fr) 9px var(--oc-side-w,280px);gap:8px;padding:8px;background:var(--oc-bg);align-items:start}
      .majoor-omnicam .oc-stage{min-width:0;align-self:stretch}
      .majoor-omnicam .oc-side{align-self:stretch}
      .majoor-omnicam .oc-left{min-width:0;align-self:start;display:flex;flex-direction:column;gap:7px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);padding:8px}
      .majoor-omnicam .oc-panel-head{display:flex;align-items:center;gap:6px}
      .majoor-omnicam .oc-panel-head>strong{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-panel-spacer{flex:1 1 auto}
      .majoor-omnicam .oc-left .scene-tree{height:var(--oc-outliner-h,220px);min-height:80px}
      /* ASSETS tab: .oc-left is align-self:start (content height) with no
         independent track height, so the card grid MUST carry its own bound or
         its content drives root.scrollHeight and stretches the whole node.
         Mirrors the fixed-height .scene-tree; the drawer layout (<=1120px)
         gives .oc-left a real height and releases this cap in responsive.js. */
      .majoor-omnicam .oc-left .oc-asset-grid{max-height:var(--oc-assets-h,340px)}
      /* AGENT tab: same drag-to-resize treatment as the Scene outliner and the
         Assets grid above, so every tab in this panel behaves consistently. */
      .majoor-omnicam .oc-left .oc-agent-plan-list{max-height:var(--oc-agent-h,220px);min-height:60px;overflow-y:auto}
      .majoor-omnicam .oc-body .viewport-wrap{border-radius:var(--oc-radius);overflow:hidden;box-shadow:none;border:1px solid var(--oc-line)}
      /* Fullscreen keeps the full DCC shell: Scene | Viewport | Inspector + deck. */
      .majoor-omnicam.oc-fullscreen .oc-lower,.majoor-omnicam.oc-fullscreen .oc-graph{display:block}

      /* ---- viewport chrome ------------------------------------------ */
      /* Reserve the right-hand strip for .vp-corner so the pills never slide
         under the overlay toggles when the stage narrows (the left Scene panel
         takes width from the viewport). */
      /* The Scene panel takes width from the viewport, so on a narrow stage the
         quick-view pills and the top-right overlay toggles can overlap. The
         pills keep the higher z-index (they gate primary navigation) and never
         wrap onto the tool rail below (top:52px); the redundant view <select>
         yields width first and the row scrolls if it is truly cramped. */
      .majoor-omnicam .vp-pills{position:absolute;top:9px;left:9px;z-index:8;display:flex;flex-wrap:wrap;gap:5px;max-width:calc(100% - 18px)}
      .majoor-omnicam .vp-quick-views{display:flex;flex:0 1 auto;flex-wrap:nowrap;gap:4px;max-width:100%;overflow-x:auto;scrollbar-width:none}
      .majoor-omnicam .vp-quick-views::-webkit-scrollbar{display:none}
      .majoor-omnicam .vp-pills .vp-pill-select{flex:0 1 auto;min-width:88px}
      .majoor-omnicam .vp-pill{padding:4px 11px;border-radius:999px;background:rgba(26,26,33,.86);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11px;backdrop-filter:blur(7px)}
      .majoor-omnicam .vp-pill-select{appearance:none;padding-right:20px;cursor:pointer}
      .majoor-omnicam .vp-pills .vp-pill:first-child{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .vp-corner{position:absolute;top:9px;right:9px;z-index:6;display:flex;align-items:center;gap:5px}
      .majoor-omnicam .vp-zoom{padding:4px 9px;border-radius:var(--oc-radius-sm);background:rgba(26,26,33,.86);border:1px solid var(--oc-line);color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace;backdrop-filter:blur(7px)}
      .majoor-omnicam .vp-rail{position:absolute;top:52px;left:9px;z-index:6;display:flex;flex-direction:column;gap:3px;padding:4px;border-radius:var(--oc-radius);background:rgba(26,26,33,.86);border:1px solid var(--oc-line);backdrop-filter:blur(7px)}
      .majoor-omnicam .vp-tool{display:grid;place-items:center;width:26px;height:26px;padding:0;border-radius:6px;background:transparent;border:1px solid transparent;color:var(--oc-text-dim)}
      .majoor-omnicam .vp-tool:hover{background:var(--oc-panel-2);border-color:var(--oc-line);color:var(--oc-text)}
      .majoor-omnicam .vp-tool.active,.majoor-omnicam .vp-tool[aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:var(--oc-accent) !important;color:#fff !important;box-shadow:none !important}
      .majoor-omnicam .vp-rail-divider{height:1px;margin:2px 3px;background:var(--oc-line)}
      /* Transform tools carry the gizmo's own colour coding, so the rail reads at
         a glance instead of being three identical grey squares. */
      .majoor-omnicam [data-transform-mode="translate"]{--tool-color:#4a8fe7}
      .majoor-omnicam [data-transform-mode="rotate"]{--tool-color:#46a758}
      .majoor-omnicam [data-transform-mode="scale"]{--tool-color:#e5a23c}
      .majoor-omnicam .vp-tool[data-transform-mode]{color:var(--tool-color)}
      .majoor-omnicam .vp-tool[data-transform-mode]:hover{border-color:var(--tool-color);color:var(--tool-color)}
      .majoor-omnicam .vp-tool[data-transform-mode].active,
      .majoor-omnicam .vp-tool[data-transform-mode][aria-pressed="true"]{
        background:color-mix(in srgb, var(--tool-color) 32%, transparent) !important;
        border-color:var(--tool-color) !important;color:#fff !important;
        box-shadow:0 0 0 1px color-mix(in srgb, var(--tool-color) 55%, transparent) !important}
      .majoor-omnicam .transform-tools [data-transform-mode]{color:var(--tool-color);border-color:color-mix(in srgb, var(--tool-color) 40%, var(--oc-line))}
      .majoor-omnicam .transform-tools [data-transform-mode].active{
        background:color-mix(in srgb, var(--tool-color) 30%, transparent) !important;
        border-color:var(--tool-color) !important;color:#fff !important}
      .majoor-omnicam .vp-axis{position:absolute;top:44px;right:9px;z-index:6;pointer-events:none;overflow:visible;border-radius:50%;background:rgba(20,23,32,.72);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(6px);box-shadow:0 4px 14px rgba(0,0,0,.45);filter:drop-shadow(0 1px 3px rgba(0,0,0,.65))}
      .majoor-omnicam .vp-hint{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);z-index:5;color:var(--oc-text-faint);font-size:10.5px;white-space:nowrap;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.9)}
      .majoor-omnicam .vp-state{position:absolute;bottom:8px;left:9px;z-index:5;color:var(--oc-text-dim);font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace;pointer-events:none}
      .majoor-omnicam .vp-state:empty{display:none}
      /* The legacy HUD anchored top-left, which is now the pills + rail corner.
         It moves to the right edge, clearing the zoom readout and the axis gizmo. */
      .majoor-omnicam .oc-body .hud{left:auto;right:9px;top:104px;max-width:52%;text-align:right}
      .majoor-omnicam .oc-body .viewport-tally-banner{top:44px}

      /* Tool rail space badge and snapping */
      .majoor-omnicam .vp-space-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;font-size:12px;font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-accent)}
      .majoor-omnicam .vp-tool.active .vp-space-badge{color:#fff}

      /* Camera HUD & OSD */
      .majoor-omnicam .vp-camera-hud{position:absolute;top:9px;left:50%;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:7px;padding:3px 12px;border-radius:999px;background:rgba(20,20,26,.88);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11px;backdrop-filter:blur(8px);box-shadow:0 4px 16px rgba(0,0,0,.45);pointer-events:auto}
      .majoor-omnicam .vp-camera-hud .hud-cam-lock{background:none;border:none;padding:0 2px;color:var(--oc-text-dim);cursor:pointer;display:inline-flex;align-items:center}
      .majoor-omnicam .vp-camera-hud .hud-cam-lock:hover{color:var(--oc-text)}
      .majoor-omnicam .vp-camera-hud .hud-cam-lock.locked{color:#ef4444}
      .majoor-omnicam .vp-camera-hud .hud-cam-name{font-weight:600;color:var(--oc-text)}
      .majoor-omnicam .vp-camera-hud .hud-cam-lens{font-weight:600;color:#60a5fa}
      .majoor-omnicam .vp-camera-hud .hud-cam-fov{color:var(--oc-text-dim)}
      .majoor-omnicam .vp-camera-hud .hud-cam-dist{color:var(--oc-text-dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .vp-camera-hud .hud-divider{color:var(--oc-text-faint);opacity:.5}
      .majoor-omnicam .vp-camera-hud .hud-roll-reset{background:rgba(239,68,68,.15);border:1px solid #7f1d1d;border-radius:999px;padding:1px 6px;color:#f87171;font-size:10px;cursor:pointer;display:inline-flex;align-items:center;gap:3px}
      .majoor-omnicam .vp-camera-hud .hud-roll-reset:hover{background:rgba(239,68,68,.3)}

      /* Viewport Corner Overlays & Shading */
      .majoor-omnicam .vp-overlay-group{display:flex;align-items:center;gap:1px;padding:2px;border-radius:var(--oc-radius-sm);background:rgba(26,26,33,.86);border:1px solid var(--oc-line);backdrop-filter:blur(7px)}
      .majoor-omnicam .vp-overlay-btn{width:22px;height:22px;display:grid;place-items:center;border-radius:4px;border:none;background:transparent;color:var(--oc-text-dim);padding:0;cursor:pointer}
      .majoor-omnicam .vp-overlay-btn:hover{color:var(--oc-text);background:rgba(255,255,255,0.06)}
      .majoor-omnicam .vp-overlay-btn.active{color:var(--oc-accent);background:var(--oc-accent-soft)}
      .majoor-omnicam .vp-shading-select{font-size:11px;padding:3px 8px;border-radius:var(--oc-radius-sm);background:rgba(26,26,33,.86);border:1px solid var(--oc-line);color:var(--oc-text);cursor:pointer;backdrop-filter:blur(7px)}

      /* Floating Mini-Transport in Fullscreen */
      .majoor-omnicam .vp-floating-transport{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:7;display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:rgba(18,18,24,.92);border:1px solid var(--oc-line);backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,.65)}
      .majoor-omnicam .vp-floating-transport .ft-btn{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:transparent;border:1px solid transparent;color:var(--oc-text-dim);cursor:pointer;padding:0}
      .majoor-omnicam .vp-floating-transport .ft-btn:hover{background:rgba(255,255,255,0.08);color:var(--oc-text)}
      .majoor-omnicam .vp-floating-transport .ft-play{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .vp-floating-transport .ft-time{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text);padding:0 4px}
      .majoor-omnicam .vp-floating-transport .ft-frame{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-accent);padding:0 4px}

      /* ---- side panel ------------------------------------------------ */
      .majoor-omnicam .oc-side{position:static;width:var(--oc-side-w,280px);min-width:0;max-width:100%;height:100%;display:flex;flex-direction:column;gap:8px;background:transparent;border:0;padding:0;box-shadow:none;backdrop-filter:none}
      .majoor-omnicam .oc-side-tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;padding:3px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);position:sticky;top:0;z-index:12}
      /* Selection-driven Inspector head: contextual title + the three secondary
         mode buttons, not a five-tab nav. */
      .majoor-omnicam .oc-inspector-head{display:flex;align-items:center;gap:4px}
      .majoor-omnicam .oc-inspector-title{flex:0 0 auto;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--oc-text);padding-left:4px}
      .majoor-omnicam .oc-inspector-head .oc-panel-spacer{flex:1 1 auto}
      .majoor-omnicam .oc-mode-btn{flex:0 0 auto;padding:4px 9px;border-radius:var(--oc-radius-sm);background:transparent;border:1px solid transparent;color:var(--oc-text-dim);font-size:11px;font-weight:550;cursor:pointer}
      .majoor-omnicam .oc-mode-btn:hover{color:var(--oc-text);background:rgba(255,255,255,.05)}
      .majoor-omnicam .oc-mode-btn.active,.majoor-omnicam .oc-mode-btn[aria-pressed="true"]{background:var(--oc-accent-soft);border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line));color:var(--oc-text)}
      .majoor-omnicam .oc-side-tabs .inspector-tab{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:5px 4px;border-radius:var(--oc-radius-sm);background:transparent;border:1px solid transparent;color:var(--oc-text-dim);font-size:11.5px;font-weight:550;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .oc-side-tabs .inspector-tab:hover{color:var(--oc-text);background:rgba(255,255,255,0.05)}
      .majoor-omnicam .oc-side-tabs .inspector-tab.active{background:var(--oc-panel-2) !important;border-color:var(--oc-line) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam .oc-side-body{display:flex;flex-direction:column;gap:7px;flex:1 1 auto;min-height:0;max-height:calc(100vh - 360px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding-right:4px;scroll-behavior:smooth}
      .majoor-omnicam .oc-outliner-add-bar{position:sticky;top:32px;z-index:9;background:var(--oc-bg);padding:2px 0}
      .majoor-omnicam .oc-add-menu{width:100%}
      .majoor-omnicam .oc-add-summary-btn{display:flex;align-items:center;gap:6px;width:100%;height:27px;padding:3px 8px;border-radius:var(--oc-radius-sm);background:var(--oc-panel-2);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11.5px;font-weight:600;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .oc-add-summary-btn:hover,.majoor-omnicam .oc-add-menu[open] .oc-add-summary-btn{background:#2a2c36;border-color:#4a5568}
      .majoor-omnicam .oc-add-menu-panel{width:210px;padding:5px 0;background:#18191c;border:1px solid #2e3038;border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.65);display:flex;flex-direction:column;gap:1px}
      .majoor-omnicam .oc-add-header{color:#7e8290;font-size:11px;font-weight:600;padding:4px 12px 4px;user-select:none}
      .majoor-omnicam .oc-add-menu-item{display:flex;align-items:center;gap:10px;width:100%;padding:6px 12px;border:none;background:transparent;color:#f1f5f9;font-size:12.5px;font-weight:600;cursor:pointer;text-align:left;transition:background .12s ease;position:relative}
      .majoor-omnicam .oc-add-menu-item:hover{background:rgba(255,255,255,0.08);color:#ffffff}
      .majoor-omnicam .oc-add-svg{width:16px;height:16px;flex-shrink:0;color:#94a3b8}
      .majoor-omnicam .oc-add-menu-item:hover .oc-add-svg{color:#ffffff}
      .majoor-omnicam .oc-submenu-arrow{margin-left:auto;font-size:9px;color:#7e8290}
      .majoor-omnicam .oc-has-submenu{user-select:none}
      .majoor-omnicam .oc-add-submenu{position:absolute;left:calc(100% - 2px);top:-4px;min-width:165px;background:#18191c;border:1px solid #2e3038;border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.7);display:none;flex-direction:column;gap:1px;padding:4px 0;z-index:70}
      .majoor-omnicam .oc-has-submenu:hover .oc-add-submenu,.majoor-omnicam .oc-has-submenu:focus-within .oc-add-submenu{display:flex}
      .majoor-omnicam .outliner-quick-bar{display:none}
      .majoor-omnicam .outliner-filter-chips{position:sticky;top:62px;z-index:9;background:var(--oc-bg);padding-bottom:3px;border-bottom:1px solid var(--oc-line-soft)}
      .majoor-omnicam .shot-key-nav{position:sticky;top:0;z-index:10;background:var(--oc-bg);padding:2px 0 4px;border-bottom:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-search{flex:1;min-width:0;padding:4px 9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border-color:var(--oc-line)}
      /* .oc-search sets flex:1, which -- inside .oc-asset-panel's column flex
         layout -- makes flexbox's own basis/grow distribution own this
         element's height instead of its content, silently overriding any
         height the auto-grow JS sets. flex:none hands sizing back to
         content (via JS-set height, clamped by min/max-height below). */
      .majoor-omnicam .oc-agent-describe{display:block;flex:none;width:100%;min-height:52px;max-height:220px;resize:none;overflow-y:auto;font:inherit;line-height:1.4;color:var(--oc-text)}
      .majoor-omnicam .oc-card{display:flex;flex-direction:column;gap:6px;padding:9px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius)}
      .majoor-omnicam .oc-card-title{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--oc-text)}
      .majoor-omnicam .oc-card-title input[type=color]{margin-left:auto;width:28px;height:22px;padding:0;background:transparent;cursor:pointer}
      .majoor-omnicam .oc-section{margin-top:3px;color:var(--oc-text-faint);font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}
      .majoor-omnicam .oc-field-row{display:flex;align-items:center;gap:6px}
      .majoor-omnicam .oc-field-label{flex:0 0 88px;color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-field-row>input,.majoor-omnicam .oc-field-row>select{flex:1;min-width:0;background:var(--oc-sunken);border-color:var(--oc-line);padding:3px 7px}
      .majoor-omnicam .oc-field-row>input[type=color]{flex:0 0 26px;padding:0;background:transparent}
      .majoor-omnicam .oc-unit{flex:none;color:var(--oc-text-faint);font-size:10.5px;width:16px}
      .majoor-omnicam .oc-vec-row{display:flex;align-items:center;gap:4px}
      .majoor-omnicam .oc-vec-row .oc-field-label{flex:0 0 88px}
      .majoor-omnicam .oc-axis{flex:1;min-width:0;display:flex;align-items:center;gap:3px;padding:2px 5px;border-radius:6px;background:var(--oc-sunken);border:1px solid var(--oc-line);font-size:10px;color:var(--oc-text-faint)}
      .majoor-omnicam .oc-axis.x{border-left:2px solid #e5484d}
      .majoor-omnicam .oc-axis.y{border-left:2px solid #46a758}
      .majoor-omnicam .oc-axis.z{border-left:2px solid #4a8fe7}
      .majoor-omnicam .oc-axis{min-height:22px}
      .majoor-omnicam .oc-axis input{width:100%;min-width:0;padding:4px 2px;background:transparent;border:0;color:var(--oc-text);font-size:11px}
      .majoor-omnicam .oc-axis-tag{flex:0 0 auto;font-size:10px;font-weight:700;cursor:ew-resize;user-select:none;padding:0 2px}
      .majoor-omnicam .oc-axis.x .oc-axis-tag{color:#f87171}
      .majoor-omnicam .oc-axis.y .oc-axis-tag{color:#4ade80}
      .majoor-omnicam .oc-axis.z .oc-axis-tag{color:#60a5fa}
      .majoor-omnicam .oc-axis.scrubbing{border-color:var(--oc-accent)!important;background:rgba(154,138,228,0.15)!important}
      .majoor-omnicam .oc-axis-reset{flex:0 0 20px;height:22px;padding:0;border:1px solid var(--oc-line);border-radius:4px;background:var(--oc-sunken);color:var(--oc-text-faint);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s ease}
      .majoor-omnicam .oc-axis-reset:hover{color:var(--oc-text);border-color:var(--oc-text-dim);background:rgba(255,255,255,0.08)}
      .majoor-omnicam .outliner-filter-chips{display:flex;gap:3px;padding:2px 0;margin:3px 0}
      .majoor-omnicam .outliner-filter-chips .oc-chip{flex:1;padding:2px 4px;font-size:10px;border-radius:4px;border:1px solid var(--oc-line);background:var(--oc-sunken);color:var(--oc-text-dim);cursor:pointer;text-align:center}
      .majoor-omnicam .outliner-filter-chips .oc-chip:hover{color:var(--oc-text);border-color:var(--oc-accent)}
      .majoor-omnicam .outliner-filter-chips .oc-chip.active{background:var(--oc-accent);color:#fff;border-color:var(--oc-accent);font-weight:600}
      .majoor-omnicam .oc-chip-group{display:flex;gap:3px;flex:1}
      .majoor-omnicam .oc-chip-group .oc-chip-btn{flex:1;padding:2px 4px;font-size:10px;border-radius:4px;border:1px solid var(--oc-line);background:var(--oc-sunken);color:var(--oc-text-dim);cursor:pointer;text-align:center}
      .majoor-omnicam .oc-chip-group .oc-chip-btn:hover{color:var(--oc-text);border-color:var(--oc-accent)}
      .majoor-omnicam .oc-batch-toolbar{display:flex;align-items:center;justify-content:space-between;padding:4px 8px;margin:3px 6px;background:rgba(139,92,246,0.14);border:1px solid rgba(139,92,246,0.3);border-radius:6px;gap:6px}
      .majoor-omnicam .oc-batch-badge{font-size:10px;font-weight:600;color:#c4b5fd;background:rgba(139,92,246,0.25);padding:2px 6px;border-radius:4px}
      .majoor-omnicam .oc-batch-actions{display:flex;align-items:center;gap:3px}
      .majoor-omnicam .oc-batch-actions .icon-button{width:22px;height:22px;font-size:11px}
      .majoor-omnicam .oc-batch-actions .icon-button.danger:hover{color:#f87171}
      .majoor-omnicam .scene-section-header{display:flex;align-items:center;gap:6px;padding:4px 6px;cursor:pointer;user-select:none;font-size:10px;font-weight:700;color:var(--oc-text-dim);text-transform:uppercase;letter-spacing:.05em;margin-top:4px;border-radius:3px}
      .majoor-omnicam .scene-section-header:hover{background:rgba(255,255,255,0.04);color:var(--oc-text)}
      .majoor-omnicam .scene-section-title{flex:0 0 auto}
      .majoor-omnicam .scene-section-count{font-size:9.5px;color:var(--oc-text-faint);font-weight:400}
      .majoor-omnicam .scene-item.scene-item-child{position:relative}
      .majoor-omnicam .scene-item.scene-item-child::before{content:"";position:absolute;left:8px;top:0;bottom:0;width:1px;background:var(--oc-line);opacity:.5}
      .majoor-omnicam .key-tangent-btn{font-size:10px;padding:2px 7px;border-radius:4px;border:1px solid var(--oc-line);background:var(--oc-sunken);color:var(--oc-text-dim);cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .key-tangent-btn:hover{border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .key-tangent-btn.active{background:#2563eb;border-color:#3b82f6;color:#fff;font-weight:700;box-shadow:0 0 6px rgba(59,130,246,0.4)}
      .majoor-omnicam .oc-lens-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:3px}
      .majoor-omnicam .oc-lens-presets button{padding:3px 2px;font-size:10.5px;background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim)}
      .majoor-omnicam .oc-slider-row input[type=range]{flex:1;min-width:0;height:22px;accent-color:var(--oc-accent);padding:0;background:transparent;border:0;cursor:pointer}
      .majoor-omnicam .oc-slider-value{flex:0 0 38px;text-align:right;color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .oc-card-actions{display:flex;gap:5px;margin-top:3px}
      .majoor-omnicam .oc-card-actions>button{flex:1;padding:5px 8px;font-size:11px}
      .majoor-omnicam .oc-card-actions>button.primary{background:var(--oc-accent);border-color:var(--oc-accent);box-shadow:none}
      .majoor-omnicam .oc-card-actions>button.primary:hover{background:#9a8ae4;border-color:#9a8ae4}
      .majoor-omnicam .oc-key-actions>button{flex:0 0 auto}
      .majoor-omnicam .oc-side .key-interp-buttons{display:flex;flex-wrap:wrap;gap:3px}
      .majoor-omnicam .oc-side .key-interp-btn{min-height:22px;padding:3px 8px;font-size:10.5px}
      .majoor-omnicam .oc-more{padding:7px 9px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius)}
      .majoor-omnicam .oc-more>summary{cursor:pointer;color:var(--oc-text-dim);font-size:11px;font-weight:600}
      .majoor-omnicam .oc-more[open]>summary{margin-bottom:6px}
      .majoor-omnicam .oc-more .oc-field-row{margin-top:4px}

      /* ---- camera health --------------------------------------------- */
      /* One traffic-light palette, shared by the panel rows, the zone list and
         the timeline bands, so the same colour always means the same verdict. */
      .majoor-omnicam .oc-health{--oc-health-ok:#46a758;--oc-health-warn:#f2b03c;--oc-health-over:#e5484d}
      .majoor-omnicam .oc-health-badge{margin-left:auto;padding:2px 7px;border-radius:9px;background:var(--oc-sunken);color:var(--oc-text-dim);font-size:10px;font-weight:600;letter-spacing:.02em}
      .majoor-omnicam .oc-health-badge.ok{background:#46a75826;color:#7fd694}
      .majoor-omnicam .oc-health-badge.warn{background:#f2b03c26;color:#f2c67a}
      .majoor-omnicam .oc-health-badge.over{background:#e5484d26;color:#f08a8d}
      .majoor-omnicam .oc-health-score-badge{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;padding:2px 6px;border-radius:9px}
      .majoor-omnicam .oc-health-score-badge.grade-a{background:#22c55e26;color:#4ade80;border:1px solid #22c55e4d}
      .majoor-omnicam .oc-health-score-badge.grade-b{background:#3b82f626;color:#60a5fa;border:1px solid #3b82f64d}
      .majoor-omnicam .oc-health-score-badge.grade-c{background:#f59e0b26;color:#fbbf24;border:1px solid #f59e0b4d}
      .majoor-omnicam .oc-health-score-badge.grade-d{background:#ef444426;color:#f87171;border:1px solid #ef44444d}
      .majoor-omnicam .oc-health-metrics{display:flex;flex-direction:column;gap:3px;margin-top:5px}
      .majoor-omnicam .oc-health-metric{display:flex;flex-direction:column;gap:3px;padding:4px 6px;border-radius:4px;background:var(--oc-sunken);font-size:11px}
      .majoor-omnicam .oc-health-metric-row{display:flex;align-items:center;gap:6px;width:100%}
      .majoor-omnicam .oc-health-metric-name{flex:1;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-health-metric-value{font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text)}
      .majoor-omnicam .oc-health-bar-track{width:100%;height:3px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden}
      .majoor-omnicam .oc-health-bar-fill{height:100%;border-radius:2px;transition:width .2s ease}
      .majoor-omnicam .oc-health-dot{flex:0 0 7px;width:7px;height:7px;border-radius:50%;background:var(--oc-health-ok)}
      .majoor-omnicam [data-grade=warn] .oc-health-dot{background:var(--oc-health-warn)}
      .majoor-omnicam [data-grade=over] .oc-health-dot{background:var(--oc-health-over)}
      .majoor-omnicam .oc-health-zones{display:flex;flex-direction:column;gap:2px}
      .majoor-omnicam .oc-health-zone-row{display:flex;align-items:center;gap:4px;width:100%}
      .majoor-omnicam .oc-health-zone{flex:1;min-width:0;display:flex;align-items:center;gap:6px;padding:3px 5px;background:var(--oc-sunken);border:1px solid transparent;border-radius:4px;color:var(--oc-text);font-size:11px;text-align:left;cursor:pointer}
      .majoor-omnicam .oc-health-zone:hover{border-color:var(--oc-line)}
      .majoor-omnicam .oc-health-zone-range{flex:0 0 auto;font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .oc-health-zone-reason{flex:1;overflow:hidden;color:var(--oc-text-dim);text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-zone-smooth-btn{opacity:.7}
      .majoor-omnicam .oc-zone-smooth-btn:hover{opacity:1;color:var(--oc-accent)}
      .majoor-omnicam .oc-health-empty{padding:6px 5px;color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-health-note{margin:6px 0 0;color:var(--oc-text-dim);font-size:10.5px;line-height:1.45}
      /* Bands sit behind the keyframe diamonds and must never eat their clicks. */
      .majoor-omnicam .oc-health-band{position:absolute;z-index:1;top:0;bottom:0;pointer-events:none}
      .majoor-omnicam .oc-health-band[data-grade=warn]{background:#f2b03c1f;border-top:2px solid #f2b03caa}
      .majoor-omnicam .oc-health-band[data-grade=over]{background:#e5484d24;border-top:2px solid #e5484dcc}

      /* ---- footer ---------------------------------------------------- */
      .majoor-omnicam .oc-footer{display:flex;align-items:center;gap:9px;padding:8px 12px;background:var(--oc-panel);border-top:1px solid var(--oc-line)}
      .majoor-omnicam .oc-footer .oc-help{flex:0 1 auto;padding:0;background:transparent}
      .majoor-omnicam .oc-footer .oc-help>summary{color:var(--oc-text-dim);font-size:11.5px}
      .majoor-omnicam .oc-help-body{position:absolute;z-index:40;max-width:520px;margin-top:7px;padding:10px 12px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:var(--oc-radius);box-shadow:0 16px 34px rgba(0,0,0,.62)}
      .majoor-omnicam label.oc-disabled{opacity:.45;cursor:not-allowed}

      /* ---- preferences modal ------------------------------------------ */
      .majoor-omnicam .oc-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);z-index:900;display:flex;align-items:center;justify-content:center;padding:16px}
      .majoor-omnicam .oc-pref-dialog{width:560px;max-width:100%;max-height:85vh;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);box-shadow:0 24px 64px rgba(0,0,0,.75);display:flex;flex-direction:column;overflow:hidden;outline:none}
      .majoor-omnicam .oc-pref-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--oc-line);background:var(--oc-panel-2)}
      .majoor-omnicam .oc-pref-title{font-size:13.5px;font-weight:650;color:var(--oc-text);display:flex;align-items:center;gap:8px}
      .majoor-omnicam .oc-pref-tabs{display:flex;gap:4px;padding:8px 16px;background:var(--oc-sunken);border-bottom:1px solid var(--oc-line);overflow-x:auto}
      .majoor-omnicam .oc-pref-tab{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:var(--oc-radius-sm);background:transparent;border:1px solid transparent;color:var(--oc-text-dim);font-size:11.5px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s ease}
      .majoor-omnicam .oc-pref-tab:hover{color:var(--oc-text);background:rgba(255,255,255,.05)}
      .majoor-omnicam .oc-pref-tab.active{background:var(--oc-panel-2);border-color:var(--oc-line);color:var(--oc-text)}
      .majoor-omnicam .oc-pref-content{flex:1;min-height:0;overflow-y:auto;padding:14px 18px}
      .majoor-omnicam .oc-pref-pane{display:none;flex-direction:column;gap:10px}
      .majoor-omnicam .oc-pref-pane.active{display:flex}
      .majoor-omnicam .oc-pref-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 10px;border-radius:var(--oc-radius-sm);background:rgba(0,0,0,.15);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-pref-row:hover{border-color:var(--oc-line)}
      .majoor-omnicam .oc-pref-label{font-size:12px;color:var(--oc-text);flex:1;user-select:none;cursor:pointer}
      .majoor-omnicam .oc-pref-slider-group{display:flex;align-items:center;gap:8px;width:180px}
      .majoor-omnicam .oc-pref-slider-group input[type=range]{flex:1;accent-color:var(--oc-accent)}
      .majoor-omnicam .oc-pref-val{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text-dim);min-width:32px;text-align:right}
      .majoor-omnicam .oc-pref-row select{width:180px;padding:4px 8px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11.5px}
      .majoor-omnicam .oc-pref-footer{display:flex;align-items:center;gap:10px;padding:12px 16px;border-top:1px solid var(--oc-line);background:var(--oc-panel-2)}
      .majoor-omnicam .oc-pref-spacer{flex:1}
`, om = `
      .majoor-omnicam .menu-section{display:flex;flex-direction:column;gap:5px}
      .majoor-omnicam[data-density="basic"] [data-density-min="animation"],
      .majoor-omnicam[data-density="basic"] [data-density-min="advanced"],
      .majoor-omnicam[data-density="animation"] [data-density-min="advanced"]{display:none !important}
`, rm = `
      .majoor-omnicam .oc-drawer-toggle{display:none !important}

      @container (max-width:1120px){
        .majoor-omnicam .oc-body{grid-template-columns:minmax(0,1fr) 9px var(--oc-side-w,280px);position:relative}
        .majoor-omnicam .oc-left,.majoor-omnicam .oc-left-resize{
          position:absolute;z-index:40;top:0;left:0;bottom:0;width:min(300px,80%);
          box-shadow:0 12px 40px rgba(0,0,0,.6);transform:translateX(-104%);
          transition:transform .18s ease;pointer-events:none;opacity:0;
          overflow:hidden;
        }
        /* the drawer is a bounded box (top:0;bottom:0 of the relative oc-body)
           -- let the ASSETS grid and AGENT plan list flex to fill it and
           scroll, no arbitrary cap */
        .majoor-omnicam .oc-left .oc-asset-grid,
        .majoor-omnicam .oc-left .oc-agent-plan-list{max-height:none}
        .majoor-omnicam .oc-left .oc-asset-panel,
        .majoor-omnicam .oc-left>.oc-left-body{min-height:0}
        .majoor-omnicam .oc-left-resize{display:none}
        .majoor-omnicam.oc-scene-open .oc-left{transform:none;pointer-events:auto;opacity:1}
        .majoor-omnicam .oc-drawer-toggle[data-act="toggle-scene-panel"]{display:inline-grid !important}
      }

      @container (max-width:760px){
        .majoor-omnicam .oc-body{display:block;position:relative}
        .majoor-omnicam .oc-side,.majoor-omnicam .oc-side-resize{
          position:absolute;z-index:40;top:0;right:0;bottom:0;width:min(320px,86%);
          background:var(--oc-panel);box-shadow:0 12px 40px rgba(0,0,0,.6);
          transform:translateX(104%);transition:transform .18s ease;
          pointer-events:none;opacity:0;padding:8px;overflow-y:auto;
        }
        .majoor-omnicam .oc-side-resize{display:none}
        .majoor-omnicam.oc-inspector-open .oc-side{transform:none;pointer-events:auto;opacity:1}
        .majoor-omnicam .oc-drawer-toggle[data-act="toggle-inspector-panel"]{display:inline-grid !important}
        .majoor-omnicam .oc-stage{padding:0}
      }
`, nm = `
      .majoor-omnicam{font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--fg-color,#ddd);background:#161618;border:1px solid #383842;border-radius:10px;overflow:visible;user-select:none;container-type:inline-size}
      .majoor-omnicam *{box-sizing:border-box}
      .majoor-omnicam *::-webkit-scrollbar{width:6px;height:6px}
      .majoor-omnicam *::-webkit-scrollbar-track{background:rgba(0,0,0,0.3);border-radius:3px}
      .majoor-omnicam *::-webkit-scrollbar-thumb{background:#444456;border-radius:3px}
      .majoor-omnicam *::-webkit-scrollbar-thumb:hover{background:#65657e}
      .majoor-omnicam .top{position:relative;z-index:10;display:flex !important;flex-direction:row !important;flex-wrap:nowrap !important;gap:8px;align-items:center;min-height:38px;padding:4px 8px;background:#1e1e24;border-bottom:1px solid #32323c}
      .majoor-omnicam .top > *{flex-shrink:0}
      .majoor-omnicam button,.majoor-omnicam select,.majoor-omnicam input{font:inherit;color:#cfcfe0;background:#23232c;border:1px solid #3c3c4a;border-radius:6px;padding:4px 8px;transition:background .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease}
      .majoor-omnicam button{display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
      .majoor-omnicam select,.majoor-omnicam input{display:inline-block;vertical-align:middle}
      .majoor-omnicam [hidden],.majoor-omnicam input[hidden],.majoor-omnicam input[type="file"]{display:none !important}
      .majoor-omnicam select,.majoor-omnicam select option,.majoor-omnicam select optgroup{background-color:#202028 !important;color:#ffffff !important;color-scheme:dark}
      .majoor-omnicam select:focus{border-color:#6f9bca;box-shadow:0 0 0 1px #6f9bca}
      .majoor-omnicam select option:hover,.majoor-omnicam select option:focus,.majoor-omnicam select option:checked{background-color:#35506c !important;color:#ffffff !important}
      .majoor-omnicam button:hover{background:#31313e;border-color:#58586c;color:#fff}
      .majoor-omnicam button:active{background:#1a1a22;border-color:#30303c}
      .majoor-omnicam button.primary{background:var(--oc-ok-bg);border-color:var(--oc-ok-line);color:var(--oc-ok-text);box-shadow:none}
      .majoor-omnicam button.primary:hover{background:var(--oc-ok-line);border-color:var(--oc-ok);color:#fff;box-shadow:none}
      .majoor-omnicam button.active,.majoor-omnicam button[aria-pressed="true"],.majoor-omnicam .icon-button.active,.majoor-omnicam .icon-button[aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam .icon-button{display:inline-grid !important;place-items:center !important;width:28px !important;height:28px !important;min-width:28px !important;padding:0 !important;cursor:pointer;color:#9494a8}
      .majoor-omnicam .icon-button .pi{font-size:13px;line-height:1;display:block;margin:0 auto}
      .majoor-omnicam .icon-button:hover{color:#fff;border-color:#5d5d74}
      
      /* Button Specific Active Themes */
      .majoor-omnicam [data-act="play"]{color:var(--oc-ok);border-color:var(--oc-ok-line)}
      .majoor-omnicam [data-act="play"]:hover{border-color:var(--oc-ok);color:var(--oc-ok-text)}
      .majoor-omnicam [data-act="play"].playing,.majoor-omnicam [data-act="play"].active{background:var(--oc-ok-bg) !important;border-color:var(--oc-ok-line) !important;color:var(--oc-ok-text) !important;box-shadow:none !important}

      .majoor-omnicam [data-act="auto-key"]{color:var(--oc-text-faint)}
      .majoor-omnicam [data-act="auto-key"].active,.majoor-omnicam [data-act="auto-key"][aria-pressed="true"]{background:var(--oc-danger-bg) !important;border-color:var(--oc-danger) !important;color:var(--oc-danger-text) !important;box-shadow:none !important}

      .majoor-omnicam [data-act="toggle-snap"].active,.majoor-omnicam [data-act="toggle-snap"][aria-pressed="true"]{background:var(--oc-warn-bg) !important;border-color:var(--oc-warn-line) !important;color:var(--oc-warn-text) !important;box-shadow:none !important}
      .majoor-omnicam [data-act="loop"].active,.majoor-omnicam [data-act="loop"][aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam [data-act="toggle-camera-view"].active,.majoor-omnicam [data-act="toggle-inspector"].active{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam [data-select-mode].active,.majoor-omnicam [data-select-mode][aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam [data-transform-mode].active,.majoor-omnicam [data-transform-mode][aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      
      .majoor-omnicam .toolbar-menu{position:relative}.majoor-omnicam .toolbar-menu>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 9px;border:1px solid transparent;border-radius:6px;cursor:pointer;white-space:nowrap;list-style:none}.majoor-omnicam .toolbar-menu>summary::-webkit-details-marker{display:none}.majoor-omnicam .toolbar-menu[open]>summary,.majoor-omnicam .toolbar-menu>summary:hover{background:#30303c;border-color:#484858}
      .majoor-omnicam .menu-panel{position:absolute;z-index:50;top:calc(100% + 5px);left:0;display:flex;flex-direction:column;gap:5px;width:240px;padding:8px;background:#202028;border:1px solid #4a4a5a;border-radius:8px;box-shadow:0 10px 24px #000c}.majoor-omnicam .menu-panel.right{right:0;left:auto}.majoor-omnicam .menu-panel button{display:flex;align-items:center;gap:7px;text-align:left}.majoor-omnicam .menu-panel label{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#bbb}.majoor-omnicam .menu-panel label>select,.majoor-omnicam .menu-panel label>input[type=number]{width:126px}.majoor-omnicam .menu-panel label>input[type=checkbox]{width:auto}.majoor-omnicam .menu-title{color:#888;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.majoor-omnicam .menu-divider{height:1px;margin:4px 0;background:#3a3a48}.majoor-omnicam .camera-menu-list{display:flex;max-height:180px;flex-direction:column;gap:4px;overflow-y:auto}.majoor-omnicam .camera-menu-list button.selected{border-color:#e3c35d;color:#f2d06b}
      
      /* Viewport Wrapper & Prominent Highlights */
      .majoor-omnicam .viewport-wrap{position:relative;width:100%;min-height:280px;aspect-ratio:16/9;background:#0d0d10;touch-action:none;overscroll-behavior:contain;pointer-events:auto;outline:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06);transition:box-shadow .15s ease}
      .majoor-omnicam .viewport-wrap.auto-key{box-shadow:inset 0 0 0 2px var(--oc-danger)}
      .majoor-omnicam .viewport-wrap.edit-mode{box-shadow:inset 0 0 0 2px var(--oc-accent) !important}
      
      /* Prominent Tally / Live Recording Status Banner */
      .majoor-omnicam .viewport-tally-banner{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:8;display:inline-flex;align-items:center;gap:7px;padding:4px 14px;border-radius:20px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;pointer-events:none;backdrop-filter:blur(8px);box-shadow:0 4px 16px rgba(0,0,0,0.6);transition:all .2s ease}
      .majoor-omnicam .viewport-tally-banner[hidden]{display:none}
      .majoor-omnicam .viewport-tally-banner .tally-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner{display:inline-flex;background:var(--oc-danger-bg);border:1px solid var(--oc-danger-line);color:var(--oc-danger-text)}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner .tally-dot{background:var(--oc-danger);animation:tallyBlink 1.6s infinite}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner{display:inline-flex;background:var(--oc-accent-soft);border:1px solid color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line));color:var(--oc-text)}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner .tally-dot{background:var(--oc-accent)}
      @keyframes tallyBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.75)}}

      /* Extracted-camera preview banner: staged, not applied -- see director-link.js */
      .majoor-omnicam .extractor-import-banner{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:8;display:flex;align-items:center;gap:10px;padding:7px 10px 7px 14px;border-radius:10px;font-size:12px;background:rgba(20,20,26,0.92);border:1px solid #9ca3af;color:#e5e7eb;box-shadow:0 6px 20px rgba(0,0,0,0.5);backdrop-filter:blur(8px)}
      .majoor-omnicam .extractor-import-banner[hidden]{display:none}
      .majoor-omnicam .extractor-import-banner i.pi-video{color:#9ca3af}
      .majoor-omnicam .extractor-import-banner .ei-import{background:#4aa3ef;color:#0b1220;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer}
      .majoor-omnicam .extractor-import-banner .ei-import:hover{background:#6fb6f4}
      .majoor-omnicam .extractor-import-banner .ei-dismiss{background:transparent;border:none;color:#9ca3af;cursor:pointer;padding:4px;line-height:0}
      .majoor-omnicam .extractor-import-banner .ei-dismiss:hover{color:#e5e7eb}
      
      .majoor-omnicam canvas{display:block;width:100%;height:100%;pointer-events:auto;outline:none;cursor:grab}.majoor-omnicam canvas.dragging{cursor:grabbing}
      
      /* Floating Quick Bar in Viewport */
      .majoor-omnicam .viewport-quick-bar{position:absolute;z-index:6;left:10px;right:270px;top:10px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:4px 8px;background:rgba(20, 20, 26, 0.88);border:1px solid rgba(255, 255, 255, 0.12);border-radius:7px;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.4)}
      .majoor-omnicam .viewport-quick-bar select{height:25px;min-width:105px;font-size:11px}
      .majoor-omnicam .viewport-quick-bar button{height:25px;padding:0 7px;display:inline-flex;align-items:center;gap:4px;font-size:11px}
      .majoor-omnicam .quick-divider{width:1px;height:16px;background:rgba(255,255,255,0.15);margin:0 2px}
      .majoor-omnicam .selection-mode-group{display:inline-flex;align-items:center;gap:2px;padding:2px;border:1px solid #3c3c4a;border-radius:6px;background:#17171d}
      .majoor-omnicam .selection-mode-group button{height:23px;padding:0 6px;font-size:10px;border-color:transparent;background:transparent;border-radius:4px;white-space:nowrap}
      .majoor-omnicam .selection-mode-group .pi{font-size:9px}
      
      /* Sleek Glassmorphic HUD */
      .majoor-omnicam .hud{position:absolute;left:10px;top:48px;z-index:4;color:#eee;background:rgba(16, 16, 22, 0.85);border:1px solid rgba(255, 255, 255, 0.1);border-radius:7px;padding:6px 10px;pointer-events:none;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.35);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;line-height:1.45}
      .majoor-omnicam .hud .hud-badge{display:inline-block;padding:1px 5px;border-radius:4px;font-weight:700;font-size:9px;background:#35506c;color:#fff;margin-right:4px}
      .majoor-omnicam .hud .hud-badge.active{background:#c67c13;color:#fff}
      .majoor-omnicam .hud .hud-hl{color:#f2d06b;font-weight:600}
      
      /* Right Inspector Panel */
      .majoor-omnicam .viewport-inspector{position:absolute;z-index:6;right:10px;top:10px;width:250px;max-height:calc(100% - 20px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:10px;background:rgba(22, 22, 28, 0.94);border:1px solid rgba(255, 255, 255, 0.15);border-radius:8px;backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,0.5);transition:transform .2s ease,opacity .2s ease}
      .majoor-omnicam .viewport-inspector[data-collapsed="true"]{transform:translateX(calc(100% + 15px));opacity:0;pointer-events:none}
      .majoor-omnicam .inspector-tabs{display:flex;gap:5px;margin-bottom:8px;background:#141418;padding:3px;border-radius:6px;border:1px solid #333340}
      .majoor-omnicam .inspector-tab{flex:1;text-align:center;padding:5px 3px;font-size:10px;font-weight:600;background:transparent;border:1px solid transparent;border-radius:4px;cursor:pointer;color:#888;transition:all .15s ease}
      .majoor-omnicam .inspector-tab:hover{color:#ccc;background:rgba(255,255,255,0.05)}
      .majoor-omnicam .inspector-tab.active{background:linear-gradient(180deg,#35506c,#243b52) !important;border-color:#6f9bca !important;color:#fff !important;box-shadow:0 0 8px rgba(111,155,202,0.5) !important}
      
      /* Outliner & Items */
      .majoor-omnicam .outliner-quick-bar{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-bottom:6px}
      .majoor-omnicam .outliner-quick-bar button{font-size:10px;padding:3px 2px;height:24px;display:inline-flex;align-items:center;justify-content:center;gap:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .majoor-omnicam .outliner-quick-bar button i{font-size:9px;flex-shrink:0}
      /* Explicit height (not max-height) driven by the drag handle: dragging
         down enlarges the visible list box itself -- the node grows to match
         (see refitNode) -- instead of just moving a cramped inner scrollbar.
         The inner scroll only kicks in when the list is longer than the height
         the user has chosen. */
      .majoor-omnicam .scene-tree{display:flex;flex-direction:column;flex:0 0 auto;gap:3px;height:var(--oc-outliner-h,220px);min-height:80px;overflow-y:auto;overscroll-behavior:contain;margin-bottom:0;background:#141418;padding:4px;border-radius:5px;border:1px solid #2e2e38}
      /* Drag handle under the object list -- taller list, more objects visible. */
      .majoor-omnicam .oc-resize-v{height:9px;margin:2px 0 8px;flex:none;cursor:ns-resize;border-radius:5px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);touch-action:none;position:relative}
      .majoor-omnicam .oc-resize-v::before{content:"";position:absolute;left:50%;top:50%;width:34px;height:3px;transform:translate(-50%,-50%);border-radius:2px;background:var(--oc-line)}
      .majoor-omnicam .oc-resize-v:hover::before,.majoor-omnicam .oc-resize-v:focus-visible::before{background:var(--oc-accent)}
      .majoor-omnicam .oc-resize-v:focus-visible{outline:2px solid var(--oc-accent);outline-offset:1px}
      /* Vertical splitter between the camera-preview column and the timeline. */
      .majoor-omnicam .oc-resize-h{align-self:stretch;cursor:ew-resize;border-radius:5px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);touch-action:none;position:relative}
      .majoor-omnicam .oc-resize-h::before{content:"";position:absolute;left:50%;top:50%;width:3px;height:34px;transform:translate(-50%,-50%);border-radius:2px;background:var(--oc-line)}
      .majoor-omnicam .oc-resize-h:hover::before,.majoor-omnicam .oc-resize-h:focus-visible::before{background:var(--oc-accent)}
      .majoor-omnicam .oc-resize-h:focus-visible{outline:2px solid var(--oc-accent);outline-offset:1px}
      .majoor-omnicam .scene-item{display:flex;align-items:center;gap:6px;width:100%;min-height:26px;padding:3px 6px;text-align:left;border:1px solid transparent;background:transparent;border-radius:4px;font-size:11px;cursor:pointer;user-select:none;box-sizing:border-box}
      .majoor-omnicam .scene-item:hover{background:rgba(255,255,255,0.05)}
      .majoor-omnicam .scene-item.selected{background:#263c54;border-color:#4a76a8;color:#fff}
      .majoor-omnicam .scene-item.selected.primary{background:#2e4c6d;border-color:#6ba1db;box-shadow:inset 2px 0 0 #3b82f6}
      .majoor-omnicam .scene-item.active-view{border-color:#38603c;background:rgba(56,96,60,0.25)}
      .majoor-omnicam .scene-item-label{flex:1;min-width:0;display:inline-flex;align-items:center;gap:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .scene-item-actions{display:inline-flex;align-items:center;justify-content:flex-end;gap:2px;flex-shrink:0;margin-left:auto}
      .majoor-omnicam .scene-action-btn{width:20px !important;height:20px !important;min-width:20px !important;padding:0 !important;display:inline-flex !important;align-items:center;justify-content:center;border-radius:4px;border:1px solid transparent;background:transparent;color:#9494a8;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .scene-action-btn:hover{background:#31313e;border-color:#58586c;color:#fff}
      .majoor-omnicam .scene-item .pi{width:14px;text-align:center;flex-shrink:0}
      .majoor-omnicam .motion-tools{position:absolute;z-index:7;left:50%;top:50px;display:none;gap:3px;padding:4px;transform:translateX(-50%);background:rgba(20,20,26,.9);border:1px solid #454552;border-radius:6px;backdrop-filter:blur(7px)}
      .majoor-omnicam.oc-motion-mode .motion-tools{display:flex}
      .majoor-omnicam .motion-tools button{width:28px;height:28px;min-width:28px;padding:0}
      .majoor-omnicam .motion-tools button.active{background:#187b70 !important;border-color:#41d9c5 !important;box-shadow:0 0 8px #41d9c577 !important}
      .majoor-omnicam canvas[data-motion-tool="track"],.majoor-omnicam canvas[data-motion-tool="anchor"],.majoor-omnicam canvas[data-motion-tool="project"],.majoor-omnicam canvas[data-motion-tool="erase"]{cursor:crosshair}
      .majoor-omnicam .motion-section-title{margin-top:8px}.majoor-omnicam .motion-preset-bar{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;margin:4px 0}.majoor-omnicam .motion-preset-bar button{min-width:0;padding:3px 1px;font-size:9px;overflow:hidden}
      .majoor-omnicam .motion-empty{padding:8px;color:#777;text-align:center;background:#141418;border:1px solid #2e2e38;border-radius:5px}.majoor-omnicam .motion-layer-list{display:flex;max-height:110px;flex-direction:column;gap:3px;overflow:auto}.majoor-omnicam .motion-layer-row{display:grid;grid-template-columns:16px minmax(0,1fr) auto;width:100%;gap:5px;padding:4px 6px;text-align:left;background:#17171d}.majoor-omnicam .motion-layer-row span{overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .motion-layer-row small{color:#7f8c9d;font-size:9px}.majoor-omnicam .motion-layer-row.active{border-color:#41d9c5 !important;background:#173b38 !important}.majoor-omnicam .motion-layer-controls{display:grid;grid-template-columns:minmax(0,1fr) auto 28px 28px 28px;gap:3px;align-items:center;margin:4px 0 8px}.majoor-omnicam .motion-layer-controls label{display:flex;align-items:center;gap:3px;font-size:9px}.majoor-omnicam .motion-layer-controls input{width:14px}
      .majoor-omnicam .motion-panel{gap:6px}
      .majoor-omnicam .motion-panel > *{flex:none}
      .majoor-omnicam .motion-panel .oc-field-value{color:#c7ccd4;font-size:11px}
      .majoor-omnicam .motion-create-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 0 6px}
      .majoor-omnicam .motion-create-btn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:7px 8px;text-align:left;background:#17171d;border:1px solid #2e2e38;border-radius:5px;cursor:pointer;color:#c7ccd4}
      .majoor-omnicam .motion-create-btn:hover{border-color:#41d9c5;background:#16302d}
      .majoor-omnicam .motion-create-btn .pi{font-size:13px;color:#41d9c5}
      .majoor-omnicam .motion-create-btn b{font-size:11px;color:#fff}
      .majoor-omnicam .motion-create-btn small{color:#7f8c9d;font-size:9px;line-height:1.2}
      .majoor-omnicam .motion-creating{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:0 0 6px;padding:5px 8px;background:#173b38;border:1px solid #41d9c5;border-radius:5px;font-size:10px;color:#a9f0e6}
      .majoor-omnicam .motion-badge{display:inline-block;padding:1px 5px;border-radius:3px;background:#26303a;color:#8fd7cd;font-size:8.5px;font-weight:700;letter-spacing:.4px}
      .majoor-omnicam .motion-badge.experimental{background:#3d2b12;color:#e0a253}
      .majoor-omnicam .oc-recon-badge{display:inline-block;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:.3px}
      .majoor-omnicam .oc-recon-badge.oc-badge-high{background:#134e4a;color:#2dd4bf;border:1px solid #115e59}
      .majoor-omnicam .oc-recon-badge.oc-badge-medium{background:#451a03;color:#fb923c;border:1px solid #7c2d12}
      .majoor-omnicam .oc-recon-badge.oc-badge-low{background:#4c0519;color:#fb7185;border:1px solid #881337}
      .majoor-omnicam .oc-lock-btn.locked{color:#ef4444;border-color:#7f1d1d;background:rgba(239,68,68,0.15)}
      .majoor-omnicam .motion-experimental-note{margin:2px 0 8px;color:#e0a253;font-size:9px;line-height:1.35}
      .majoor-omnicam .motion-preview-wrap{position:relative;height:132px;margin:4px 0 2px;border:1px solid #2e2e38;border-radius:5px;overflow:hidden;background:#0b0b0f}
      .majoor-omnicam .motion-preview{display:block;width:100%;height:100%;cursor:pointer}
      .majoor-omnicam .motion-preview-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:8px;text-align:center;font-size:9px;color:#6c6c78;pointer-events:none}
      .majoor-omnicam .motion-selected{margin-top:6px}
      .majoor-omnicam .motion-selected.motion-invalid{border-color:#c65b4a !important}
      .majoor-omnicam .motion-selected.motion-warn{border-color:#e0a253 !important}
      .majoor-omnicam .motion-sel-warn{margin:0 0 5px;padding:5px 7px;border-radius:4px;background:#3d2b12;border:1px solid #e0a253;color:#f0c489;font-size:9.5px;line-height:1.35}
      .majoor-omnicam .motion-fit-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:5px;padding:5px;margin-top:2px;background:#17171d;border:1px solid #2e2e38;border-radius:4px;cursor:pointer;color:#c7ccd4;font-size:10px}
      .majoor-omnicam .motion-fit-btn:hover{border-color:#41d9c5}
      .majoor-omnicam .motion-advanced{margin-top:8px}
      .majoor-omnicam .motion-compat{font-size:10px;color:#8fd7cd;display:grid;grid-template-columns:1fr 1fr;gap:2px 10px;margin-top:4px}
      .majoor-omnicam .motion-compat .pi{color:#41d9c5;font-size:9px;margin-right:3px}
      .majoor-omnicam .motion-compat p{grid-column:1/-1;color:#7f8c9d;margin:4px 0 0;line-height:1.3}
      .majoor-omnicam .motion-timeline{display:flex;flex-direction:column;gap:3px;margin-top:6px}.majoor-omnicam .motion-timeline-rail{display:grid;grid-template-columns:124px minmax(0,1fr);gap:10px;min-height:24px}.majoor-omnicam .motion-timeline-label{justify-content:flex-start;overflow:hidden;padding:2px 6px;text-overflow:ellipsis;white-space:nowrap}.majoor-omnicam .motion-timeline-track{position:relative;border:1px solid #32323e;border-radius:4px;background:#15151b}.majoor-omnicam .motion-key{position:absolute;top:50%;width:11px;height:11px;min-width:11px;margin:-6px 0 0 -6px;padding:0;border:1px solid #111;border-radius:2px;background:#41d9c5;transform:rotate(45deg)}
      
      /* Transform & Inputs Grid with Colored Axis Badges */
      .majoor-omnicam .transform-tools{display:flex;gap:6px;margin:6px 0}.majoor-omnicam .transform-tools button{width:28px;height:25px;padding:0;font-weight:600}.majoor-omnicam .transform-tools button.active{background:linear-gradient(180deg,#2563eb,#1d4ed8) !important;border-color:#60a5fa !important;color:#fff !important;box-shadow:0 0 10px rgba(59,130,246,0.6) !important}.majoor-omnicam .transform-tools select{min-width:0;flex:1;padding:2px 4px}
      .majoor-omnicam .viewport-grid{display:grid;grid-template-columns:1fr 70px;gap:5px 8px}
      .majoor-omnicam .viewport-grid label{display:contents}
      .majoor-omnicam .viewport-grid span{align-self:center;color:#bbb;display:inline-flex;align-items:center;gap:4px;font-size:11px}
      .majoor-omnicam .viewport-grid input{width:70px;padding:2px 4px;font-size:11px}
      .majoor-omnicam .axis-badge{display:inline-block;width:12px;height:12px;line-height:12px;text-align:center;font-size:9px;font-weight:700;border-radius:3px;color:#fff}
      .majoor-omnicam .axis-x{background:#ef5350}.majoor-omnicam .axis-y{background:#53d86a;color:#111}.majoor-omnicam .axis-z{background:#4aa3ef}
      .majoor-omnicam .entity-panel[hidden]{display:none}
      .majoor-omnicam .animation-row{display:flex;gap:6px;align-items:center;margin-top:6px}.majoor-omnicam .animation-row select{min-width:0;flex:1;font-size:11px}
      
      /* Camera Multi-Preview Strip */
      .majoor-omnicam .camera-view-row{position:relative;display:flex;width:100%;padding:5px 30px 5px 5px;background:#18181e;border-top:1px solid #333340}.majoor-omnicam .camera-view-row[hidden]{display:none}.majoor-omnicam .camera-preview-strip{display:grid;width:100%;grid-auto-flow:column;grid-auto-columns:minmax(220px,calc((100% - 10px)/3));gap:6px;overflow-x:auto}.majoor-omnicam .camera-preview-tile{position:relative;min-width:0;height:clamp(150px,18vw,230px);overflow:hidden;background:#101014;border:1px solid #4c4c5a;border-top:4px solid var(--camera-color);border-radius:4px;cursor:pointer}.majoor-omnicam .camera-preview-tile.playblast{border-color:#f2d06b;border-top-color:#f2d06b;box-shadow:inset 0 0 0 1px #f2d06b}.majoor-omnicam .camera-preview-head{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;align-items:center;gap:5px;min-height:25px;padding:3px 6px;background:#17171fe8;color:#ddd;font-size:10px;font-weight:700;letter-spacing:.04em;pointer-events:none}.majoor-omnicam .camera-preview-head .output-mark{margin-left:auto;color:#f2d06b}.majoor-omnicam .camera-preview-tile canvas{width:100%;height:100%;cursor:pointer}.majoor-omnicam .camera-view-badge{position:absolute;left:6px;bottom:5px;padding:2px 5px;border-radius:3px;background:#000b;color:#ddd;font-size:9px;pointer-events:none}.majoor-omnicam .camera-strip-close{position:absolute;right:4px;top:5px;width:23px;height:23px;padding:0}
      .majoor-omnicam .camera-preview-strip[data-layout="1"]{grid-auto-columns:100%}.majoor-omnicam .camera-preview-strip[data-layout="2"]{grid-auto-columns:calc((100% - 5px)/2)}.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(140px,1fr)}
      
      /* Timeline & Keys */
      .majoor-omnicam .timeline{padding:8px 10px;background:#191920;border-top:1px solid #333340}
      .majoor-omnicam .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.majoor-omnicam .row + .row{margin-top:6px}
      .majoor-omnicam input[type=range]{padding:0;flex:1;min-width:140px}.majoor-omnicam input[type=number]{width:68px}
      .majoor-omnicam .timeline-toolbar{justify-content:flex-start;gap:8px;align-items:center}.majoor-omnicam .timeline-summary{margin-left:auto;color:#aaa;font-size:11px}.majoor-omnicam .toolbar-divider{width:1px;height:20px;margin:0 4px;background:#3c3c4a}
      .majoor-omnicam .timeline-group{display:flex;align-items:center;gap:5px;background:#1e1e26;border:1px solid #363644;border-radius:6px;padding:3px 6px}
      .majoor-omnicam .primary-play.playing{background:#059669;border-color:#34d399;color:#fff}
      .majoor-omnicam .primary-key{background:linear-gradient(180deg,#d97706,#b45309);border-color:#f59e0b;color:#fff;font-weight:700;display:inline-flex;align-items:center;gap:4px}
      .majoor-omnicam .primary-key:hover{background:linear-gradient(180deg,#f59e0b,#d97706);border-color:#fde68a;box-shadow:0 0 8px #f59e0b88}
      .majoor-omnicam .primary-key.key-pulse{animation:keyPulseAnim 0.35s ease-out}
      @keyframes keyPulseAnim{0%{transform:scale(1);box-shadow:0 0 0px #f59e0b}50%{transform:scale(1.14);box-shadow:0 0 16px #f59e0b}100%{transform:scale(1);box-shadow:0 0 0px #f59e0b}}
      .majoor-omnicam .auto-key-btn.active{background:#7f1d1d;border-color:#ef4444;color:#fee2e2;animation:autoKeyBlink 1.8s infinite}
      @keyframes autoKeyBlink{0%,100%{box-shadow:0 0 4px #ef444466}50%{box-shadow:0 0 12px #ef4444aa}}
      .majoor-omnicam .key-interp-buttons{display:flex;gap:3px;flex-wrap:wrap;margin:4px 0 6px}
      .majoor-omnicam .key-interp-btn{font-size:10px;padding:2px 7px;border-radius:4px;border:1px solid #444455;background:#20202a;color:#ccc;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .key-interp-btn:hover{border-color:#88a8e8;color:#fff}
      .majoor-omnicam .key-interp-btn.active{background:#d97706;border-color:#f59e0b;color:#fff;font-weight:700;box-shadow:0 0 6px #f59e0b66}
      .majoor-omnicam .floating-retime-badge{position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#101018ee;color:#f59e0b;border:1px solid #f59e0b;border-radius:3px;font-size:9px;font-weight:700;padding:1px 5px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px #000a}
      
      .majoor-omnicam .keys{position:relative;width:100%;height:68px;margin-top:7px;overflow:hidden;background:linear-gradient(#202028,#181820);border:1px solid #414152;border-radius:6px;cursor:crosshair;outline:none;touch-action:none}
      .majoor-omnicam .keys:focus-visible{border-color:#88a8e8;box-shadow:0 0 0 1px #88a8e8}
      .majoor-omnicam .timeline-tick{position:absolute;top:0;height:100%;border-left:1px solid #3c3c4a;color:#8d8d9d;font-size:10px;padding:2px 0 0 4px;pointer-events:none}
      .majoor-omnicam .timeline-marker{position:absolute;z-index:2;top:0;bottom:0;width:1px;background:var(--marker-color,#f2d06b);pointer-events:none}.majoor-omnicam .timeline-marker::before{content:"";position:absolute;left:-4px;top:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid var(--marker-color,#f2d06b)}
      .majoor-omnicam .playback-range{position:absolute;top:0;bottom:0;background:#f2d06b14;border-left:1px solid #f2d06b88;border-right:1px solid #f2d06b88;pointer-events:none}
      .majoor-omnicam .box-select{position:absolute;z-index:4;border:1px dashed #8ab4f8;background:#8ab4f822;pointer-events:none}
      .majoor-omnicam .playhead{position:absolute;z-index:2;top:0;bottom:0;width:2px;background:#f2d06b;pointer-events:none;box-shadow:0 0 6px #f2d06b88}.majoor-omnicam .playhead::before{content:"";position:absolute;left:-5px;top:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid #f2d06b}
      /* Timeline Keyframes Visual Gradient Hierarchy */
      .majoor-omnicam .key {
        appearance: none !important;
        position: absolute !important;
        z-index: 3 !important;
        top: 14px !important;
        width: 32px !important;
        height: 48px !important;
        transform: translateX(-50%) !important;
        padding: 0 !important;
        border: 1px solid #526182 !important;
        border-radius: 6px !important;
        background: linear-gradient(180deg, #2b354f, #1a2030) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        cursor: ew-resize !important;
        color: #e2e8f0 !important;
        outline: none !important;
        opacity: 0.95 !important;
        transition: opacity 0.15s ease, transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease !important;
      }
      .majoor-omnicam .key:hover {
        opacity: 1 !important;
        border-color: #818cf8 !important;
        background: linear-gradient(180deg, #3d4a6e, #262e44) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7), 0 0 8px rgba(129, 140, 248, 0.4) !important;
      }
      .majoor-omnicam .key.at-playhead {
        opacity: 1 !important;
        border-color: #facc15 !important;
        box-shadow: 0 0 10px rgba(250, 204, 21, 0.5) !important;
      }
      .majoor-omnicam .key.selected {
        opacity: 1 !important;
        z-index: 5 !important;
        background: linear-gradient(180deg, #f59e0b, #b45309) !important;
        border-color: #fef08a !important;
        color: #ffffff !important;
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
        transform: translateX(-50%) scale(1.08) !important;
      }
      .majoor-omnicam .key.editing {
        opacity: 1 !important;
        z-index: 6 !important;
        background: linear-gradient(180deg, #ef4444, #b91c1c) !important;
        border-color: #fecaca !important;
        color: #ffffff !important;
        box-shadow: 0 0 18px rgba(239, 68, 68, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
        animation: keyEditGlow 1.2s infinite alternate !important;
      }
      @keyframes keyEditGlow {
        0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); }
        100% { box-shadow: 0 0 22px rgba(239, 68, 68, 1.0); }
      }
      
      .majoor-omnicam .key::before {
        content: "";
        position: absolute;
        left: 10px;
        top: 5px;
        width: 10px;
        height: 10px;
        transform: rotate(45deg);
        border: 1.5px solid #7dd3fc;
        background: #38bdf8;
        box-shadow: 0 0 6px rgba(56, 189, 248, 0.8);
        border-radius: 2px;
        transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .majoor-omnicam .key[data-interp="smooth"]::before { border-radius: 50%; transform: none; }
      .majoor-omnicam .key[data-interp="linear"]::before { border-radius: 0; transform: none; }
      .majoor-omnicam .key[data-interp="hold"]::before { border-radius: 0; transform: none; border-left-width: 3.5px; }
      
      .majoor-omnicam .key:hover::before { border-color: #ffffff; background: #60a5fa; box-shadow: 0 0 8px rgba(96, 165, 250, 0.9); }
      .majoor-omnicam .key.at-playhead::before { border-color: #ffffff; background: #fbbf24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.9); }
      .majoor-omnicam .key.selected::before { border-color: #ffffff; background: #fef08a; box-shadow: 0 0 10px #fde047; }
      .majoor-omnicam .key.editing::before { border-color: #ffffff; background: #fee2e2; box-shadow: 0 0 12px #f87171; }
      
      .majoor-omnicam .key-label {
        position: absolute;
        top: 24px;
        left: 0;
        width: 32px;
        text-align: center;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 10px;
        font-weight: 700;
        color: #e2e8f0;
        line-height: 1;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        pointer-events: none;
      }
      .majoor-omnicam .key.selected .key-label { font-weight: 700; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
      .majoor-omnicam .key.editing .key-label { font-weight: 700; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
      
      /* Curve Editor */
      .majoor-omnicam .curve-editor{margin-top:6px;border:1px solid #393946;border-radius:6px;background:#15151a}.majoor-omnicam .curve-editor>summary{display:flex;align-items:center;gap:6px;min-height:29px;padding:4px 7px;cursor:pointer;list-style:none}.majoor-omnicam .curve-editor>summary::-webkit-details-marker{display:none}.majoor-omnicam .curve-toolbar{display:flex;align-items:center;gap:4px;padding:0 6px 5px;flex-wrap:wrap}.majoor-omnicam .curve-toolbar select{height:27px;padding:2px 5px}.majoor-omnicam .curve-mode{display:inline-flex;align-items:center;gap:4px;height:27px;padding:2px 6px}.majoor-omnicam .curve-mode.active{background:#644536;border-color:#d18a57}.majoor-omnicam [data-tangent-mode].active{background:#2e4a64;border-color:#6f9bca}.majoor-omnicam [data-channel-filter="0"].active{background:#4d1d1d;border-color:#ef5350;color:#ffc7c7}.majoor-omnicam [data-channel-filter="1"].active{background:#1a4223;border-color:#53d86a;color:#c7ffd2}.majoor-omnicam [data-channel-filter="2"].active{background:#1d354d;border-color:#4aa3ef;color:#c7e6ff}.majoor-omnicam .ch-dot{display:inline-block;width:7px;height:7px;border-radius:50%}.majoor-omnicam .curve-canvas{display:block;width:100%;height:var(--oc-graph-h,220px);border-top:1px solid #333340;background:#111114;cursor:crosshair;touch-action:none}
      
      /* Context Menu & Panels */
      .majoor-omnicam .context-menu, .context-menu.majoor-omnicam{position:fixed;z-index:100000;display:flex;min-width:210px;max-width:320px;flex-direction:column;gap:2px;padding:6px;background:rgba(22,24,30,0.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);border-radius:8px;box-shadow:0 16px 36px rgba(0,0,0,0.6),0 0 0 1px rgba(0,0,0,0.4);color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;user-select:none}.majoor-omnicam .context-menu[hidden],.context-menu.majoor-omnicam[hidden]{display:none}.majoor-omnicam .context-menu button,.context-menu.majoor-omnicam button{display:flex;align-items:center;gap:8px;width:100%;min-height:28px;text-align:left;border-color:transparent;background:transparent;color:#e2e8f0;font-size:12px;cursor:pointer;border-radius:5px;padding:4px 8px;border:1px solid transparent;transition:background .1s ease,color .1s ease}.majoor-omnicam .context-menu button:hover,.majoor-omnicam .context-menu button:focus-visible,.majoor-omnicam .context-menu button.active,.context-menu.majoor-omnicam button:hover,.context-menu.majoor-omnicam button:focus-visible,.context-menu.majoor-omnicam button.active{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.08);color:#fff}.majoor-omnicam .context-menu button:disabled,.context-menu.majoor-omnicam button:disabled{opacity:.35;cursor:not-allowed;background:transparent}.majoor-omnicam .context-menu .danger,.context-menu.majoor-omnicam .danger{color:#f87171}.majoor-omnicam .context-menu .danger:hover,.context-menu.majoor-omnicam .danger:hover{background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.3);color:#fca5a5}.majoor-omnicam .context-menu kbd.shortcut,.context-menu.majoor-omnicam kbd.shortcut,.majoor-omnicam .context-menu .shortcut,.context-menu.majoor-omnicam .shortcut{margin-left:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;padding:1px 5px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#94a3b8}.majoor-omnicam .context-menu-separator,.context-menu.majoor-omnicam .context-menu-separator{height:1px;margin:4px 2px;background:rgba(255,255,255,0.09)}.majoor-omnicam .context-menu-title,.context-menu.majoor-omnicam .context-menu-title{padding:4px 8px;color:#94a3b8;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.majoor-omnicam .oc-menu-icon-svg{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;flex-shrink:0}
      .majoor-omnicam .compact-panel{margin-top:6px;border:1px solid #353544;border-radius:6px;background:#202028}.majoor-omnicam .compact-panel>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 7px;cursor:pointer;color:#ccc;list-style:none}.majoor-omnicam .compact-panel>summary::-webkit-details-marker{display:none}.majoor-omnicam .compact-panel>summary::after{content:"›";margin-left:auto;transform:rotate(90deg);color:#777}.majoor-omnicam .compact-panel[open]>summary::after{transform:rotate(-90deg)}.majoor-omnicam .panel-body{padding:0 7px 7px}
      .majoor-omnicam .key-editor-header{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:6px}.majoor-omnicam .key-editor-grid,.majoor-omnicam .inspector-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:5px}.majoor-omnicam .key-editor-grid label,.majoor-omnicam .inspector-grid label{display:flex;align-items:center;justify-content:space-between;gap:4px;color:#bbb}.majoor-omnicam .key-editor-grid input,.majoor-omnicam .key-editor-grid select,.majoor-omnicam .inspector-grid input,.majoor-omnicam .inspector-grid select{min-width:0;width:70px}.majoor-omnicam .key-editor[data-empty="true"] .key-editor-grid{opacity:.45}
      .majoor-omnicam .status{margin-left:auto;color:#aaa}.majoor-omnicam .hint{color:#aaa;font-size:11px}
      .majoor-omnicam details.help{padding:7px 10px;background:#181820;color:#c8c8c8}.majoor-omnicam details.help summary{cursor:pointer;color:#f2d06b}.majoor-omnicam details.help p{margin:6px 0}
      /* Left panel Scene/Assets tabs + Asset Browser grid */
      .majoor-omnicam .oc-left-tabs{display:flex;gap:2px;background:#141418;border:1px solid #2e2e38;border-radius:6px;padding:2px}
      .majoor-omnicam .oc-left-tab{flex:1;min-height:24px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8b8b96;background:transparent;border:1px solid transparent;border-radius:4px;cursor:pointer}
      .majoor-omnicam .oc-left-tab.active{color:#fff;background:#2b2b35;border-color:#3b3b48}
      /* AGENT gets its own violet->magenta identity so it reads as a distinct,
         AI-flavoured surface next to the neutral Scene/Assets tabs. */
      .majoor-omnicam .oc-left-tab[data-asset-view="agent"]{color:#b79bf0}
      .majoor-omnicam .oc-left-tab[data-asset-view="agent"]:hover{color:#e2d4ff}
      /* !important: the generic button.active rule above (shared by every
         toolbar toggle, also !important) otherwise wins regardless of this
         selector's higher specificity -- !important vs !important then
         falls back to specificity, where this rule is higher. */
      .majoor-omnicam .oc-left-tab[data-asset-view="agent"].active{color:#fff !important;background:linear-gradient(135deg,#8b5cf6,#ec4899) !important;border-color:transparent !important;box-shadow:0 0 0 1px rgba(236,72,153,.35),0 2px 10px -2px rgba(139,92,246,.65) !important}
      .majoor-omnicam .oc-left-body{display:flex;flex-direction:column;gap:7px;flex:1 1 auto;min-height:0}
      .majoor-omnicam .oc-asset-panel{display:flex;flex-direction:column;gap:6px;flex:1 1 auto;min-height:0}
      .majoor-omnicam .oc-asset-toolbar{display:flex;gap:4px;align-items:center}
      .majoor-omnicam .oc-asset-local{display:flex;flex-direction:column;gap:4px;padding:6px;background:#15151b;border:1px solid #33333e;border-radius:6px}
      .majoor-omnicam .oc-asset-local input{font-size:10px}
      .majoor-omnicam .oc-asset-local-actions{display:flex;gap:4px}
      .majoor-omnicam .oc-asset-local-actions .oc-btn{flex:1;font-size:10px;padding:4px 6px}
      .majoor-omnicam .oc-btn--primary{background:#2f3a52;border-color:#4c6a9c;color:#dbe9ff}
      .majoor-omnicam .oc-asset-kinds{display:flex;flex-wrap:wrap;gap:3px}
      .majoor-omnicam .oc-asset-kind{font-size:10px;padding:3px 7px;height:22px;color:#c9c9d2;background:#1b1b21;border:1px solid #33333e;border-radius:11px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
      .majoor-omnicam .oc-asset-kind.active{background:#2f3a52;border-color:#4c6a9c;color:#dbe9ff}
      .majoor-omnicam .oc-asset-kind-n{opacity:.6;font-size:9px}
      .majoor-omnicam .oc-asset-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;overflow-y:auto;overscroll-behavior:contain;flex:1 1 auto;min-height:120px;background:#141418;border:1px solid #2e2e38;border-radius:5px;padding:6px;align-content:start}
      .majoor-omnicam .oc-asset-card{position:relative;display:flex;flex-direction:column;gap:3px;padding:5px;background:#1c1c22;border:1px solid #33333e;border-radius:6px;cursor:pointer;text-align:left}
      .majoor-omnicam .oc-asset-card:hover{border-color:#55556a}
      .majoor-omnicam .oc-asset-card.selected{border-color:#6f9bca;box-shadow:0 0 0 1px #6f9bca}
      .majoor-omnicam .oc-asset-thumb{width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;background:#0f0f13;display:flex;align-items:center;justify-content:center}
      .majoor-omnicam .oc-asset-thumb--glyph i{font-size:22px;color:#5a5a68}
      .majoor-omnicam .oc-asset-name{font-size:10px;color:#e2e2e8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .majoor-omnicam .oc-asset-kind-tag{font-size:8px;letter-spacing:.06em;color:#8b8b96}
      .majoor-omnicam .oc-asset-badge{position:absolute;top:4px;right:4px;font-size:7px;font-weight:700;letter-spacing:.05em;padding:1px 4px;background:#2f5233;border:1px solid #4c7d52;border-radius:3px;color:#c7ffd2}
      .majoor-omnicam .oc-asset-empty{grid-column:1/-1;color:#8b8b96;font-size:11px;text-align:center;padding:16px 4px}
      .majoor-omnicam .oc-asset-foot{display:flex;align-items:center;gap:6px}
      .majoor-omnicam .oc-asset-foot .oc-btn{font-size:11px;padding:4px 10px}
      /* Agent panel accent: a violet->magenta top stripe plus matching
         primary-button/select-focus colour, scoped to the Agent tab only so
         Scene/Assets keep the neutral palette. Styled via the dedicated
         .oc-agent-panel CSS class, deliberately not the data-role attribute
         that DOM code uses to look this element up -- that attribute is
         checked for uniqueness across every template and style source by
         scripts/check_template_contract.mjs, so repeating it as a raw CSS
         attribute selector here would misread as duplicate declarations. */
      .majoor-omnicam .oc-agent-panel{border-top:2px solid transparent;border-image:linear-gradient(90deg,#8b5cf6,#ec4899) 1;padding-top:6px}
      .majoor-omnicam .oc-agent-panel select.oc-search:focus-visible,
      .majoor-omnicam .oc-agent-panel .oc-agent-describe:focus-visible{outline:none;border-color:#ec4899;box-shadow:0 0 0 2px rgba(236,72,153,.28)}
      .majoor-omnicam .oc-agent-panel .oc-btn--primary{background:linear-gradient(135deg,#8b5cf6,#ec4899);border-color:transparent;color:#fff}
      .majoor-omnicam .oc-agent-panel .oc-btn--primary:not(:disabled):hover{filter:brightness(1.1)}
      .majoor-omnicam .oc-agent-panel .oc-btn--primary:disabled{background:#2a2a33;border-color:#3b3b48;color:#7a7a86}
      .majoor-omnicam .oc-asset-status{flex:1;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      /* Viewport label overlay (pooled DOM above the WebGL canvas) */
      .majoor-omnicam .oc-label-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:6}
      .majoor-omnicam .oc-label{position:absolute;top:0;left:0;will-change:transform;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.04em;line-height:1.5;color:#f4f4f6;background:rgba(18,18,22,0.78);border:1px solid rgba(255,255,255,0.14);white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,0.8)}
      .majoor-omnicam .oc-label.is-annotation{border-color:var(--oc-label-accent,#8d7ee8);box-shadow:0 0 0 1px var(--oc-label-accent,#8d7ee8) inset}
      /* Outliner tag chips + inspector label rows */
      .majoor-omnicam .scene-item-tags{display:inline-flex;gap:3px;margin-left:5px;flex-shrink:1;overflow:hidden}
      .majoor-omnicam .scene-item-tag{font-size:8px;font-weight:700;letter-spacing:.03em;padding:0 4px;border-radius:8px;background:#2b2b35;border:1px solid #3b3b48;color:#b9b9c6;white-space:nowrap;text-transform:uppercase}
      .majoor-omnicam .scene-item-tag-more{background:transparent;border-color:transparent;color:#8b8b96}
      .majoor-omnicam .oc-labels-row select{height:24px;font-size:10px}
      /* Rig Mapper */
      .majoor-omnicam .oc-rig-status{margin-left:auto;font-size:9px;font-weight:700;letter-spacing:.03em}
      .majoor-omnicam .oc-rig-status[data-state="ok"]{color:#7fd694}
      .majoor-omnicam .oc-rig-status[data-state="warn"]{color:#f0b866}
      .majoor-omnicam .oc-rig-actions{display:flex;gap:4px;margin-bottom:6px}
      .majoor-omnicam .oc-rig-actions .oc-btn{font-size:10px;padding:3px 8px}
      .majoor-omnicam .oc-rig-grid{display:flex;flex-direction:column;gap:2px;max-height:220px;overflow-y:auto;overscroll-behavior:contain}
      .majoor-omnicam .oc-rig-row{display:grid;grid-template-columns:78px 1fr 12px;align-items:center;gap:5px;font-size:10px}
      .majoor-omnicam .oc-rig-joint{color:#b9b9c6}
      .majoor-omnicam .oc-rig-row select{height:22px;font-size:10px;min-width:0}
      .majoor-omnicam .oc-rig-row.ok .oc-rig-joint{color:#e2e2e8}
      .majoor-omnicam .oc-rig-tick{color:#7fd694;font-weight:700;text-align:center}
      /* FK Pose editor + canonical-joint overlay */
      .majoor-omnicam .oc-pose-editor{margin-top:6px;padding-top:6px;border-top:1px solid #2e2e38}
      .majoor-omnicam [data-pose-act="edit"].active{background:#2f4a64;border-color:#6f9bca;color:#dbe9ff}
      .majoor-omnicam .oc-pose-joint .oc-field-label{font-size:9px;letter-spacing:.03em;color:#8fb7e0;text-transform:uppercase}
      .majoor-omnicam .oc-rig-overlay{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:7}
      .majoor-omnicam .oc-rig-dot{position:absolute;top:0;left:0;width:11px;height:11px;padding:0;border-radius:50%;background:rgba(111,155,202,0.35);border:1.5px solid #9dc3ec;cursor:pointer;pointer-events:auto;will-change:transform}
      .majoor-omnicam .oc-rig-dot:hover{background:rgba(157,195,236,0.7)}
      .majoor-omnicam .oc-rig-dot.selected{background:#fde047;border-color:#fff;box-shadow:0 0 8px rgba(253,224,71,0.9)}
      /* Character motion clip */
      .majoor-omnicam .oc-motion-editor{margin-top:6px;padding-top:6px;border-top:1px solid #2e2e38}
      .majoor-omnicam .oc-motion-timing{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
      .majoor-omnicam .oc-motion-num{display:flex;flex-direction:column;font-size:9px;color:#9aa0ac;gap:2px}
      .majoor-omnicam .oc-motion-num input{width:52px}
      .majoor-omnicam .oc-motion-check{display:flex;align-items:center;gap:4px;font-size:10px;color:#c9c9d2}
      .majoor-omnicam .oc-motion-editor .oc-btn{font-size:10px;padding:3px 8px}
      @container (max-width:700px){.majoor-omnicam .top{overflow-x:auto;overflow-y:hidden}.majoor-omnicam .viewport-quick-bar{right:10px;max-width:calc(100% - 20px)}.majoor-omnicam .selection-mode-group button span{display:none}.majoor-omnicam .viewport-tally-banner{top:82px;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.majoor-omnicam .hud{top:108px;right:10px;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .viewport-inspector{top:auto;bottom:10px;width:min(250px,calc(100% - 20px));max-height:42%}.majoor-omnicam .timeline-toolbar{overflow-x:auto;flex-wrap:nowrap}.majoor-omnicam .timeline-summary{display:none}}
      @container (max-width:460px){.majoor-omnicam .viewport-wrap{min-height:360px;aspect-ratio:auto}.majoor-omnicam .camera-preview-strip[data-layout="2"],.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr;grid-auto-columns:100%}.majoor-omnicam .menu-panel{width:min(240px,calc(100cqw - 24px))}}
`, sm = od + nm + am + El + om + rm;
function im() {
  return `
    <div class="oc-header">
      ${rd("OmniCam Director")}
      <span class="oc-header-spacer"></span>
      <details class="toolbar-menu oc-overflow" data-menu="output">
        <summary title="${s("Output & diagnostics")}"><i class="pi pi-ellipsis-h"></i></summary>
        <div class="menu-panel right">
          <div class="menu-title">${s("Output")}</div>
          <label>${s("Playblast camera")} <select data-role="playblast-camera"></select></label>
          <div class="menu-section" data-density-min="animation">
            <label>${s("H3 preset")} <select data-role="proxy-preset">
              <option value="balanced">${s("Balanced")}</option>
              <option value="parallax">${s("Parallax")}</option>
              <option value="subject">${s("Subject")}</option>
              <option value="debug">${s("Debug")}</option>
            </select></label>
            <label>${s("Encoder")} <select data-role="encoder">
              <option value="auto">${s("WebCodecs")}</option>
              <option value="realtime">${s("Realtime fallback")}</option>
            </select></label>
            <button data-act="h3-setup" class="primary" title="${s("Create the H3 reference nodes")}"><i class="pi pi-bolt"></i> ${s("H3 Setup")}</button>
          </div>
          <div class="menu-section" data-density-min="advanced">
            <div class="menu-divider"></div>
            <div class="menu-title">${s("Maintenance")}</div>
            <button data-act="clear-caches" title="${s("Clear WebGL textures, temporary files and memory caches")}"><i class="pi pi-trash"></i> ${s("Clear Caches & Clean")}</button>
            <button data-act="open-preferences" title="${s("Configure OmniCam preferences")}"><span aria-hidden="true">🔘</span> ${s("Preferences…")}</button>
          </div>
          <div class="menu-divider"></div>
          <div class="setup-badge" data-role="setup-badge" hidden></div>
          <div data-role="setup-issues"></div>
        </div>
      </details>
      <span class="oc-status-pill" data-role="status" role="status" aria-live="polite" aria-atomic="true"><span class="oc-status-dot"></span>${s("Ready")}</span>
    </div>`;
}
function cm() {
  return `
    <div class="oc-footer">
      <details class="help oc-help">
        <summary><i class="pi pi-question-circle"></i> ${s("OmniCam Help")}</summary>
        <div class="oc-help-body">
          <p>${s("Compose a frame, press I, scrub, move the camera and press I again. Space previews the move; Playblast records the neutral motion reference.")}</p>
          <p>${s("The proxy communicates camera motion, not final appearance. Use H3 Setup for Omni Reference, Wan Native Camera for core Plücker conditioning, or the pinned ATI/LTX adapters for their supported workflows.")}</p>
        </div>
      </details>
      <span class="oc-footer-spacer"></span>
      <button class="oc-playblast" data-act="record" title="${s("Record proxy playblast")}"><span class="oc-playblast-dot"></span>${s("Playblast")}</button>
    </div>`;
}
const lm = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>', dm = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-9 5-9-5V8l9-5 9 5v8z"/><path d="m3.27 6.96 8.73 4.84 8.73-4.84"/><path d="M12 22V12"/></svg>', mm = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 20h20L12 2z"/><path d="M12 2v18"/></svg>', pm = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>', fm = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>', hm = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 8-4 4-8-8 4-4z"/><path d="M7 11L2 16l6 6 5-5"/><path d="M18 19l4 2"/><path d="M21 16l2 2"/></svg>', um = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>', bm = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6H4z"/><circle cx="17" cy="7" r="3"/><path d="m6 3 4 7H2z"/></svg>';
function gm() {
  return `
    <div class="oc-left-body oc-assets" data-role="agent-tab" hidden>
      <div class="oc-asset-panel oc-agent-panel" data-role="agent-panel">
        <div class="oc-asset-toolbar" data-role="agent-provider-row">
          <select class="oc-search" data-role="agent-provider-select" aria-label="${s("Provider")}">
            <option value="">${s("Loading providers...")}</option>
          </select>
        </div>
        <div class="oc-asset-toolbar" data-role="agent-model-row">
          <select class="oc-search" data-role="agent-model-select" aria-label="${s("Model")}">
            <option value="">${s("Loading models...")}</option>
          </select>
          <button type="button" class="icon-button" data-agent-act="model-refresh"
                  title="${s("Refresh model list")}"><i class="pi pi-refresh"></i></button>
        </div>
        <div class="oc-asset-toolbar" data-role="agent-credential-row">
          <span class="oc-asset-status hint" data-role="agent-provider-label"></span>
          <span class="oc-asset-status hint" data-role="agent-credential-status"></span>
          <button type="button" class="icon-button" data-agent-act="credential-replace"
                  title="${s("Set credential")}"><i class="pi pi-key"></i></button>
          <button type="button" class="icon-button" data-agent-act="credential-remove"
                  title="${s("Remove credential")}"><i class="pi pi-trash"></i></button>
          <button type="button" class="icon-button" data-agent-act="credential-test"
                  title="${s("Test connection")}"><i class="pi pi-bolt"></i></button>
        </div>
        <div class="oc-asset-toolbar" data-role="agent-credential-form" hidden>
          <input class="oc-search" data-role="agent-credential-input" type="password" autocomplete="new-password"
                 placeholder="${s("Paste API key...")}" aria-label="${s("Credential")}">
          <button type="button" class="oc-btn oc-btn--primary" data-agent-act="credential-save">${s("Save")}</button>
        </div>
        <p class="oc-asset-status hint oc-agent-privacy" data-role="agent-privacy-note"></p>
        <p class="oc-asset-status hint" data-role="agent-hint"></p>
        <textarea class="oc-search oc-agent-describe" data-role="agent-describe" rows="2"
                  placeholder="${s('Describe the shot... ex: "the camera slowly orbits the character while zooming in on the face"')}"
                  aria-label="${s("Describe the shot")}"></textarea>
        <div class="oc-asset-toolbar">
          <strong>${s("Planned changes")}</strong>
        </div>
        <ul class="oc-asset-status hint oc-agent-plan-list" data-role="agent-plan" style="list-style:none;padding:0;margin:0"></ul>
        <div class="oc-resize-v" data-role="agent-resize" role="separator" aria-orientation="horizontal" tabindex="0"
             title="${s("Drag to resize the Agent panel — double-click to reset")}" aria-label="${s("Resize the Agent panel")}"></div>
        <div class="oc-asset-foot">
          <button type="button" class="oc-btn" data-agent-act="preview">${s("Preview")}</button>
          <button type="button" class="oc-btn oc-btn--primary" data-agent-act="apply" disabled>${s("Apply")}</button>
          <button type="button" class="oc-btn" data-agent-act="cancel" disabled>${s("Cancel")}</button>
        </div>
      </div>
    </div>`;
}
function ym() {
  return `
    <div class="oc-left-body oc-assets" data-role="assets-tab" hidden>
      <div class="oc-asset-panel" data-role="assets-panel">
        <div class="oc-asset-toolbar">
          <input class="oc-search" data-role="asset-search" type="search"
                 placeholder="${s("Search assets...")}" aria-label="${s("Search assets")}">
          <button type="button" class="icon-button" data-asset-act="asset-import"
                  title="${s("Import 3D Model (+)")}"><i class="pi pi-upload"></i></button>
          <button type="button" class="icon-button" data-asset-act="local-toggle"
                  title="${s("Install a character pack you downloaded (Quaternius / local)")}"><i class="pi pi-folder-open"></i></button>
        </div>
        <div class="oc-asset-local" data-role="asset-local-form" hidden>
          <input class="oc-search" data-role="asset-local-folder" type="text"
                 placeholder="${s("Absolute path to the extracted pack folder")}" spellcheck="false">
          <input class="oc-search" data-role="asset-local-note" type="text"
                 placeholder="${s("License note (e.g. Quaternius QAL v1.0)")}" spellcheck="false">
          <div class="oc-asset-local-actions">
            <button type="button" class="oc-btn" data-asset-act="local-scan">${s("Scan")}</button>
            <button type="button" class="oc-btn oc-btn--primary" data-asset-act="local-install">${s("Install characters")}</button>
          </div>
        </div>
        <div class="oc-asset-kinds" data-role="asset-kinds"></div>
        <div class="oc-asset-grid" data-role="asset-grid"></div>
        <div class="oc-resize-v" data-role="assets-resize" role="separator" aria-orientation="horizontal" tabindex="0"
             title="${s("Drag to resize the assets grid — double-click to reset")}" aria-label="${s("Resize the assets grid")}"></div>
        <div class="oc-asset-foot">
          <button type="button" class="oc-btn" data-asset-act="asset-add">${s("Add to scene")}</button>
          <span class="oc-asset-status hint" data-role="asset-status"></span>
        </div>
        <input type="file" data-role="asset-import-file" accept=".glb,.fbx" hidden>
      </div>
    </div>`;
}
function vm() {
  return `
    <aside class="oc-left" data-role="scene-panel" aria-label="${s("Scene")}">
      <div class="oc-left-tabs" data-role="left-tabs" role="tablist">
        <button type="button" class="oc-left-tab active" data-asset-view="scene" role="tab">${s("Scene")}</button>
        <button type="button" class="oc-left-tab" data-asset-view="assets" role="tab">${s("Assets")}</button>
        <button type="button" class="oc-left-tab" data-asset-view="agent" role="tab">${s("Agent")}</button>
      </div>
      <div class="oc-left-body" data-role="scene-tab">
      <div class="oc-panel-head">
        <strong>${s("Scene")}</strong>
        <span class="oc-panel-spacer"></span>
        <button class="icon-button" data-act="add-camera" title="${s("Create camera from current view")}"><i class="pi pi-video"></i></button>
        <button class="icon-button" data-act="load-model" title="${s("Import 3D Model (+)")}"><i class="pi pi-plus"></i></button>
      </div>
      <input class="oc-search" data-role="outliner-search" type="search" placeholder="${s("Search")}" aria-label="${s("Filter the outliner")}">
      <div class="oc-outliner-add-bar">
        <details class="toolbar-menu oc-add-menu" data-menu="add-object">
          <summary class="oc-add-summary-btn" title="${s("Add object (+)")}">
            <i class="pi pi-plus" style="font-size:11px"></i>
            <span>${s("Add object")}</span>
            <i class="pi pi-chevron-down" style="font-size:9px;margin-left:auto;opacity:0.7"></i>
          </summary>
          <div class="menu-panel oc-add-menu-panel">
            <div class="oc-add-header">${s("Add object")}</div>
            <button type="button" class="oc-add-menu-item" data-object-type="sphere">
              ${lm} <span>${s("Sphere")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="cube">
              ${dm} <span>${s("Cube")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="pyramid">
              ${mm} <span>${s("Pyramide")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="sun_light">
              ${pm} <span>${s("Sun light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="point_light">
              ${fm} <span>${s("Point light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="spot_light">
              ${hm} <span>${s("Spot light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-act="add-camera">
              ${um} <span>${s("Camera")}</span>
            </button>
            <div class="oc-add-menu-item oc-has-submenu" tabindex="0">
              ${bm} <span>${s("Assets")}</span>
              <i class="pi pi-chevron-right oc-submenu-arrow"></i>
              <div class="oc-add-submenu">
                <button type="button" class="oc-add-menu-item" data-object-type="card"><i class="pi pi-image"></i> <span>${s("Card")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="cylinder"><i class="pi pi-database"></i> <span>${s("Cylinder")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="torus"><i class="pi pi-circle"></i> <span>${s("Torus")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="human"><i class="pi pi-user"></i> <span>${s("Human")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="null"><i class="pi pi-plus"></i> <span>${s("Null")}</span></button>
                <div class="menu-divider"></div>
                <button type="button" class="oc-add-menu-item" data-act="load-model"><i class="pi pi-box"></i> <span>${s("Import 3D Model (+)")}</span></button>
              </div>
            </div>
          </div>
        </details>
      </div>
      <div class="outliner-filter-chips" data-role="outliner-filter-chips">
        <button type="button" class="oc-chip active" data-filter="all">${s("All")}</button>
        <button type="button" class="oc-chip" data-filter="cameras">${s("Cameras")}</button>
        <button type="button" class="oc-chip" data-filter="objects">${s("Objects")}</button>
        <button type="button" class="oc-chip" data-filter="lights">${s("Lights")}</button>
        <button type="button" class="oc-chip" data-filter="hidden">${s("Hidden")}</button>
      </div>
      <div class="oc-batch-toolbar" data-role="outliner-batch-bar" hidden>
        <span class="oc-batch-badge" data-role="batch-count">0 ${s("selected")}</span>
        <div class="oc-batch-actions">
          <button type="button" class="icon-button" data-act="batch-toggle-visibility" title="${s("Toggle visibility (H)")}"><i class="pi pi-eye"></i></button>
          <button type="button" class="icon-button" data-act="batch-toggle-lock" title="${s("Toggle lock (L)")}"><i class="pi pi-lock"></i></button>
          <button type="button" class="icon-button" data-act="batch-duplicate" title="${s("Duplicate selection (Shift+D)")}"><i class="pi pi-copy"></i></button>
          <button type="button" class="icon-button danger" data-act="batch-delete" title="${s("Delete selection (Del)")}"><i class="pi pi-trash"></i></button>
          <button type="button" class="icon-button" data-act="batch-deselect" title="${s("Deselect all (Alt+A)")}"><i class="pi pi-times"></i></button>
        </div>
      </div>
      <div class="scene-tree" data-role="objects"></div>
      <div class="oc-resize-v" data-role="outliner-resize" role="separator" aria-orientation="horizontal" tabindex="0"
           title="${s("Drag to resize the outliner — double-click to reset")}" aria-label="${s("Resize the outliner")}"></div>
      </div>
      ${ym()}
      ${gm()}
    </aside>`;
}
function xm() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="scene">
      <div class="oc-card" data-role="object-panel">
        <div class="oc-card-title" style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <span data-role="selected-name">${s("Object Transform")}</span>
          <div style="display:flex;align-items:center;gap:4px">
            <span class="oc-recon-badge" data-role="object-recon-badge" hidden></span>
            <button class="icon-button oc-lock-btn" type="button" data-act="toggle-object-lock" data-role="object-lock-toggle" title="${s("Lock / unlock object")}"><i class="pi pi-lock-open"></i></button>
          </div>
        </div>
        <div class="oc-field-row" data-role="material-row">
          <span class="oc-field-label">${s("Material")}</span>
          <select data-role="object-material" title="${s("Viewport material")}">
            <option value="textured">${s("Textures")}</option>
            <option value="wireframe_texture">${s("Wireframe + Texture")}</option>
            <option value="checker">${s("Checker")}</option>
            <option value="neutral">${s("Neutral")}</option>
            <option value="wireframe_neutral">${s("Wireframe + Clay")}</option>
            <option value="wireframe">${s("Wireframe")}</option>
            <option value="matte">${s("Matte Dark")}</option>
          </select>
          <input data-role="object-color" type="color" value="#8c929b" title="${s("Object Color")}">
        </div>
        <div class="oc-field-row" data-role="light-props-row" hidden>
          <span class="oc-field-label">${s("Light")}</span>
          <input data-role="object-light-color" type="color" value="#ffffff" title="${s("Light Color")}">
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            ${s("Intensity")}
            <input data-role="object-intensity" type="number" min="0" max="100" step="0.1" value="2.2" style="width:52px">
          </label>
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            <input data-role="object-cast-shadow" type="checkbox" checked>
            ${s("Shadow")}
          </label>
        </div>
        <div class="oc-field-row" data-role="spot-props-row" hidden>
          <span class="oc-field-label">${s("Spot Cone")}</span>
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            ${s("Angle")}
            <input data-role="object-cone-angle" type="number" min="1" max="90" step="1" value="45" style="width:48px">°
          </label>
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            ${s("Soft")}
            <input data-role="object-penumbra" type="number" min="0" max="1" step="0.05" value="0.25" style="width:48px">
          </label>
        </div>
        <div class="oc-field-row">
          <span class="oc-field-label">${s("Parent")}</span>
          <select data-role="object-parent" title="${s("Parent object")}"><option value="">${s("No parent")}</option></select>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Position")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="object-x" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="object-y" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="object-z" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="position" title="${s("Reset Position")}">⟲</button>
        </div>
        <div class="oc-vec-row" data-role="rotation-row"><span class="oc-field-label">${s("Rotation")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="object-rx" type="number" step="1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="object-ry" type="number" step="1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="object-rz" type="number" step="1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="rotation" title="${s("Reset Rotation")}">⟲</button>
        </div>
        <div class="oc-vec-row" data-role="scale-row"><span class="oc-field-label">${s("Scale")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="object-sx" type="number" min="0.01" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="object-sy" type="number" min="0.01" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="object-sz" type="number" min="0.01" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="scale" title="${s("Reset Scale")}">⟲</button>
        </div>
        <div class="animation-row" data-role="animation-row" hidden><i class="pi pi-play-circle"></i><select data-role="animation-select" title="${s("Animation clip")}"></select></div>
        <div class="oc-field-row oc-labels-row">
          <span class="oc-field-label">${s("Tags")}</span>
          <input data-role="object-tags" type="text" placeholder="${s("hero, subject")}" title="${s("Machine-semantic tags, comma separated")}" style="flex:1;min-width:0">
        </div>
        <div class="oc-field-row oc-labels-row">
          <span class="oc-field-label">${s("Label")}</span>
          <input data-role="object-annotation" type="text" maxlength="128" placeholder="${s("Visible viewport label")}" style="flex:1;min-width:0">
          <input data-role="object-annotation-color" type="color" value="#8d7ee8" title="${s("Label colour")}">
          <select data-role="object-annotation-anchor" title="${s("Label anchor")}">
            <option value="top">${s("Top")}</option>
            <option value="center">${s("Center")}</option>
            <option value="bottom">${s("Bottom")}</option>
          </select>
        </div>
        <details class="compact-panel oc-rig-mapper" data-role="rig-mapper" hidden>
          <summary><i class="pi pi-sitemap"></i> ${s("Rig Mapper")} <span class="oc-rig-status" data-role="rig-mapper-status"></span></summary>
          <div class="panel-body">
            <div class="oc-rig-actions">
              <button type="button" class="oc-btn" data-rig-act="auto">${s("Auto Map")}</button>
              <button type="button" class="oc-btn" data-rig-act="validate">${s("Validate")}</button>
              <button type="button" class="oc-btn" data-rig-act="save">${s("Save Mapping")}</button>
            </div>
            <div class="oc-rig-grid" data-role="rig-mapper-grid"></div>
          </div>
        </details>
        <div class="oc-pose-editor" data-role="pose-editor" hidden>
          <div class="oc-field-row">
            <span class="oc-field-label">${s("Pose")}</span>
            <select data-role="pose-preset" title="${s("Pose preset")}" style="flex:1;min-width:0"></select>
            <button type="button" class="oc-btn" data-pose-act="edit" title="${s("Toggle FK pose editing")}">${s("Edit Pose")}</button>
            <button type="button" class="oc-btn" data-pose-act="save" title="${s("Save the current pose")}">${s("Save Pose…")}</button>
          </div>
          <div class="oc-vec-row oc-pose-joint" data-role="pose-joint-row" hidden>
            <span class="oc-field-label"><span data-role="pose-joint-name">joint</span></span>
            <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="pose-rot-x" type="number" step="1" aria-label="X"></label>
            <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="pose-rot-y" type="number" step="1" aria-label="Y"></label>
            <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="pose-rot-z" type="number" step="1" aria-label="Z"></label>
          </div>
        </div>
        <div class="oc-motion-editor" data-role="motion-editor" hidden>
          <div class="oc-field-row">
            <span class="oc-field-label">${s("Motion")}</span>
            <select data-role="motion-clip" title="${s("Animation clip")}" style="flex:1;min-width:0"></select>
          </div>
          <div class="oc-field-row oc-motion-timing">
            <label class="oc-motion-num">${s("Start")}<input data-role="motion-start" type="number" step="1" min="0"></label>
            <label class="oc-motion-num">${s("End")}<input data-role="motion-end" type="number" step="1" min="0"></label>
            <label class="oc-motion-num">${s("Speed")}<input data-role="motion-speed" type="number" step="0.05" min="0.05" max="8"></label>
            <label class="oc-motion-check"><input data-role="motion-loop" type="checkbox" checked> ${s("Loop")}</label>
          </div>
          <div class="oc-field-row">
            <button type="button" class="oc-btn" data-motion-act="bake">${s("Bake current frame to pose")}</button>
          </div>
        </div>
      </div>
      <div class="oc-field-row"><span class="oc-field-label">${s("Upstream reference")}</span>
        <select data-role="reference-select"><option value="0">${s("Upstream 1")}</option></select>
      </div>
    </div>`;
}
function wm() {
  return `
    <div class="inspector-tab-content oc-side-body motion-panel" data-tab-panel="motion" hidden>

      <div class="oc-section">${s("Create Motion")} <span class="motion-badge experimental">EXPERIMENTAL</span></div>
      <p class="motion-experimental-note">${s("Motion Tracks are experimental and may change before a stable release.")}</p>
      <div class="motion-create-grid">
        <button type="button" class="motion-create-btn" data-motion-create="draw">
          <i class="pi pi-pencil"></i><b>${s("Draw Path")}</b><small>${s("Draw movement onscreen")}</small>
        </button>
        <button type="button" class="motion-create-btn" data-motion-create="object">
          <i class="pi pi-bullseye"></i><b>${s("Track Object")}</b><small>${s("Follow a scene object")}</small>
        </button>
        <button type="button" class="motion-create-btn" data-motion-create="world">
          <i class="pi pi-plus-circle"></i><b>${s("World Point")}</b><small>${s("Track a fixed 3D point")}</small>
        </button>
        <button type="button" class="motion-create-btn" data-motion-create="anchor">
          <i class="pi pi-map-marker"></i><b>${s("Screen Anchor")}</b><small>${s("Fixed screen position")}</small>
        </button>
      </div>

      <div class="motion-creating" data-role="motion-creating" hidden>
        <span data-role="motion-creating-label">${s("Drawing motion")}</span>
        <button type="button" class="icon-button" data-motion-create-cancel title="${s("Cancel (Esc)")}"><i class="pi pi-times"></i></button>
      </div>

      <div class="oc-section">${s("Tracks")}</div>
      <div class="motion-empty" data-role="motion-layers-empty">
        ${s("No motion tracks yet. Control subject movement independently from the camera.")}
      </div>
      <div class="motion-layer-list" data-role="motion-layers"></div>

      <div class="oc-section">${s("Path Preview")}</div>
      <div class="motion-preview-wrap" title="${s("Motion paths in screen space. Click a path to select it.")}">
        <canvas class="motion-preview" data-role="motion-preview"></canvas>
        <div class="motion-preview-empty" data-role="motion-preview-empty">${s("Motion paths appear here in screen space.")}</div>
      </div>

      <div class="oc-card motion-selected" data-role="motion-selected" hidden>
        <div class="oc-card-title">
          <span data-role="motion-sel-name">${s("Selected Track")}</span>
          <span class="motion-badge" data-role="motion-sel-type">DRAW</span>
        </div>
        <div class="motion-sel-warn" data-role="motion-sel-warn" hidden></div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Binding")}</span>
          <span data-role="motion-sel-binding" class="oc-field-value">${s("Screen")}</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Timing")}</span>
          <span class="oc-field-value"><span data-role="motion-sel-start">0</span> &ndash; <span data-role="motion-sel-end">0</span></span>
        </div>
        <div class="motion-layer-controls">
          <select data-role="motion-interpolation" title="${s("Motion interpolation")}">
            <option value="linear">${s("Linear")}</option><option value="smooth">${s("Smooth")}</option><option value="hold">${s("Hold")}</option>
          </select>
          <label title="${s("Motion key visibility")}"><input data-role="motion-key-visible" type="checkbox" checked> ${s("Visible")}</label>
          <button class="icon-button" data-motion-layer-action="toggle" title="${s("Enable or disable motion layer")}"><i class="pi pi-eye"></i></button>
          <button class="icon-button" data-motion-layer-action="delete" title="${s("Delete motion layer")}"><i class="pi pi-trash"></i></button>
        </div>
        <button type="button" class="motion-fit-btn" data-motion-layer-action="retime" title="${s("Remap keys onto the current playback range")}">
          <i class="pi pi-clock"></i> ${s("Fit to Playback Range")}
        </button>
      </div>

      <details class="oc-more motion-advanced">
        <summary>${s("Advanced")} &middot; ${s("Camera Motion Field")} <span class="motion-badge experimental">EXPERIMENTAL</span></summary>
        <div class="motion-preset-bar" aria-label="${s("Camera field presets")}">
          <button data-motion-preset="balanced" title="${s("Balanced camera field")}">${s("Balanced")}</button>
          <button data-motion-preset="foreground" title="${s("Foreground camera field")}">${s("Foreground")}</button>
          <button data-motion-preset="subject" title="${s("Subject camera field")}">${s("Subject")}</button>
          <button data-motion-preset="ground_parallax" title="${s("Ground parallax camera field")}">${s("Ground")}</button>
          <button data-motion-preset="depth_layers" title="${s("Depth layers camera field")}">${s("Depth")}</button>
        </div>
      </details>

      <div class="oc-section">${s("Model Compatibility")}</div>
      <div class="motion-compat">
        <div><i class="pi pi-check"></i> Wan Move</div>
        <div><i class="pi pi-check"></i> Wan Track</div>
        <div><i class="pi pi-check"></i> ATI</div>
        <div><i class="pi pi-check"></i> LTX Motion</div>
        <p>${s("Motion Tracks are consumed by screen-track profiles. Generic video does not use them directly.")}</p>
      </div>
    </div>`;
}
function km() {
  const e = Al.map((t) => `<button data-lens="${t}">${t}mm</button>`).join("");
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="camera" hidden>
      <div class="oc-card">
        <div class="oc-card-title"><i class="pi pi-video"></i> <span data-role="inspector-camera-name">${s("Camera")}</span>
          <input data-role="camera-color" type="color" value="#4aa3ef" title="${s("Camera Color")}">
        </div>

        <div class="oc-section">${s("Lens")}</div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Sensor / Gate")}</span>
          <select data-role="camera-sensor-preset">
            <option value="custom">${s("Custom")}</option>
            <option value="full_frame">${s("Full Frame 35mm (36×24)")}</option>
            <option value="super_35">${s("Super 35 (24.89×18.66)")}</option>
            <option value="m43">${s("Micro 4/3 (17.3×13)")}</option>
            <option value="cinema_16_9">${s("16:9 Digital Cinema")}</option>
            <option value="mobile_9_16">${s("Mobile 9:16 Vertical")}</option>
          </select>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Focal Length")}</span>
          <input data-role="camera-focal" type="number" min="4" max="800" step="0.5"><span class="oc-unit">mm</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("FOV")}</span>
          <input data-role="camera-fov" type="number" min="5" max="150" step="0.1"><span class="oc-unit">°</span>
        </div>
        <div class="oc-lens-presets">${e}</div>

        <div class="oc-section">${s("Transform")}</div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Position")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="camera-px" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="camera-py" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="camera-pz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-pos" title="${s("Reset Position")}">⟲</button>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Target XYZ")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="camera-tx" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="camera-ty" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="camera-tz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-target" title="${s("Reset Target")}">⟲</button>
        </div>
        <div class="oc-vec-row" title="${s("Pitch/Yaw/Roll: an alternative to Target XYZ, aiming the camera directly like a Maya/Blender rotate channel. Editing either one keeps the other in sync.")}">
          <span class="oc-field-label">${s("Rotation")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="camera-rx" type="number" min="-90" max="90" step="1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="camera-ry" type="number" step="1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="camera-rz" type="number" min="-180" max="180" step="1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="rotation" title="${s("Reset Rotation")}">⟲</button>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Roll")}</span>
          <input data-role="camera-roll" type="number" min="-180" max="180" step="0.1"><span class="oc-unit">°</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Look At")}</span>
          <select data-role="camera-target-object" title="${s("Track / Follow Moving Target Object")}">
            <option value="">${s("Manual Target (No Tracking)")}</option>
          </select>
        </div>
        <div class="oc-field-row" data-role="camera-aim-bone-row" hidden><span class="oc-field-label">${s("Aim Bone")}</span>
          <select data-role="camera-aim-bone" title="${s("Aim at a bone inside the tracked rig instead of its origin")}">
            <option value="">${s("Whole object")}</option>
          </select>
        </div>

        <div class="oc-section">${s("Motion")}</div>
        <div class="oc-field-row oc-slider-row"><span class="oc-field-label">${s("Path Smoothing")}</span>
          <input data-role="path-smoothing" type="range" min="0" max="100" step="1" value="0">
          <span class="oc-slider-value" data-role="path-smoothing-value">0%</span>
        </div>
        <div class="oc-field-row oc-slider-row"><span class="oc-field-label">${s("Simplify Keys")}</span>
          <input data-role="key-simplify" type="range" min="0" max="100" step="1" value="0" title="${s("Drop keys that barely change the motion. Replayed from the pre-simplify keys, so 0% restores them.")}">
          <span class="oc-slider-value" data-role="key-simplify-value">${s("Off")}</span>
        </div>
        <div class="oc-field-row">
          <span class="oc-field-label">${s("Keys")} <span data-role="key-count">0</span></span>
          <select data-role="key-op-scope" title="${s("Which tracks the key operations act on")}">
            <option value="camera">${s("Active camera")}</option>
            <option value="all_cameras">${s("All cameras")}</option>
            <option value="object">${s("Active object")}</option>
          </select>
          <button data-act="keys-reduce" title="${s("Decimate down to a target key count")}"><i class="pi pi-minus-circle"></i> ${s("Reduce…")}</button>
          <button data-act="keys-clean" title="${s("Remove duplicate, too-close and redundant keys")}"><i class="pi pi-filter"></i> ${s("Clean")}</button>
        </div>

        <div class="oc-card-actions">
          <button class="primary" data-act="key" title="${s("Insert / Update Keyframe at Playhead (I)")}"><i class="pi pi-key"></i> ${s("Insert Key (I)")}</button>
          <button data-act="reset-camera" title="${s("Reset active camera")}"><i class="pi pi-refresh"></i> ${s("Reset Cam")}</button>
        </div>
      </div>

      <details class="oc-more" data-density-min="advanced"><summary>${s("Projection & Clipping")}</summary>
        <div class="oc-field-row"><span class="oc-field-label">${s("Projection")}</span>
          <select data-role="camera-type"><option value="perspective">${s("Perspective")}</option><option value="orthographic">${s("Orthographic")}</option></select>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Near Clip")}</span><input data-role="camera-near" type="number" min="0.0001" step="0.001"></div>
        <div class="oc-field-row oc-chip-row"><span class="oc-field-label">${s("Near Presets")}</span>
          <div class="oc-chip-group">
            <button type="button" class="oc-chip-btn" data-act="set-near-preset" data-near="0.001" title="${s("Interior (0.001)")}">0.001</button>
            <button type="button" class="oc-chip-btn" data-act="set-near-preset" data-near="0.01" title="${s("Standard (0.01)")}">0.01</button>
            <button type="button" class="oc-chip-btn" data-act="set-near-preset" data-near="0.1" title="${s("Large (0.1)")}">0.1</button>
          </div>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Far Clip")}</span><input data-role="camera-far" type="number" min="0.0002" step="1"></div>
      </details>
    </div>`;
}
function Sm() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="display" hidden>
      <div class="oc-card key-editor" data-role="key-editor" data-empty="true">
        <div class="oc-card-title"><i class="pi pi-key"></i> <span data-role="selected-key-label">${s("Key @ 0")}</span></div>
        <div class="oc-card-actions oc-key-actions">
          <button class="icon-button" data-act="update-key" title="${s("Update key from current 3D view")}"><i class="pi pi-refresh"></i></button>
          <button class="icon-button" data-act="view-key" title="${s("Jump Playhead & View to Key")}"><i class="pi pi-eye"></i></button>
          <button class="icon-button" data-act="copy-key" title="${s("Copy Keyframe (Ctrl+C)")}"><i class="pi pi-copy"></i></button>
          <button class="icon-button" data-act="paste-key" title="${s("Paste Keyframe at Playhead (Ctrl+V)")}"><i class="pi pi-clipboard"></i></button>
          <button class="icon-button" data-act="delete-key" title="${s("Delete Selected Keyframe (Del / Backspace)")}"><i class="pi pi-trash"></i></button>
        </div>
        <div class="key-nav-row" style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin:6px 0">
          <button type="button" class="icon-button" data-act="shot-prev-key" title="${s("Previous Keyframe")}"><i class="pi pi-step-backward"></i></button>
          <button type="button" class="icon-button" data-act="shot-prev-frame" title="${s("Previous Frame (-1f)")}"><i class="pi pi-chevron-left"></i></button>
          <span class="key-timecode-badge" data-role="key-timecode" style="font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text-dim)">00:00:00:00 (0f)</span>
          <button type="button" class="icon-button" data-act="shot-next-frame" title="${s("Next Frame (+1f)")}"><i class="pi pi-chevron-right"></i></button>
          <button type="button" class="icon-button" data-act="shot-next-key" title="${s("Next Keyframe")}"><i class="pi pi-step-forward"></i></button>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Frame")}</span><input data-role="key-frame" type="number" min="0" value="0"></div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Interpolation")}</span>
          <select data-role="key-interp">
            <option value="ease">${s("Ease")}</option><option value="smooth">${s("Smooth")}</option>
            <option value="bezier">${s("Bezier")}</option><option value="linear">${s("Linear")}</option>
            <option value="ease_in">${s("Ease In")}</option><option value="ease_out">${s("Ease Out")}</option>
            <option value="hold">${s("Hold")}</option>
            <option value="sine">${s("Sine")}</option><option value="cubic">${s("Cubic")}</option>
            <option value="quintic">${s("Quintic")}</option><option value="expo">${s("Expo")}</option>
            <option value="back">${s("Back")}</option>
          </select>
        </div>
        <div class="key-interp-buttons">
          <button type="button" class="key-interp-btn active" data-interp="ease">${s("Ease")}</button>
          <button type="button" class="key-interp-btn" data-interp="smooth">${s("Smooth")}</button>
          <button type="button" class="key-interp-btn" data-interp="bezier">${s("Bezier")}</button>
          <button type="button" class="key-interp-btn" data-interp="linear">${s("Linear")}</button>
          <button type="button" class="key-interp-btn" data-interp="ease_in">${s("Ease In")}</button>
          <button type="button" class="key-interp-btn" data-interp="ease_out">${s("Ease Out")}</button>
          <button type="button" class="key-interp-btn" data-interp="hold">${s("Hold")}</button>
          <button type="button" class="key-interp-btn" data-interp="sine">${s("Sine")}</button>
          <button type="button" class="key-interp-btn" data-interp="cubic">${s("Cubic")}</button>
          <button type="button" class="key-interp-btn" data-interp="quintic">${s("Quintic")}</button>
          <button type="button" class="key-interp-btn" data-interp="expo">${s("Expo")}</button>
          <button type="button" class="key-interp-btn" data-interp="back">${s("Back")}</button>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Tangents")}</span>
          <select data-role="key-tangent-mode" title="${s("Tangent mode for Bezier curves")}">
            <option value="auto">${s("Auto")}</option>
            <option value="clamped">${s("Clamped")}</option>
            <option value="vector">${s("Vector")}</option>
            <option value="free">${s("Free")}</option>
            <option value="aligned">${s("Aligned")}</option>
            <option value="flat">${s("Flat")}</option>
          </select>
        </div>
        <div class="key-tangent-buttons" style="display:flex;flex-wrap:wrap;gap:3px;margin:3px 0 6px">
          <button type="button" class="key-tangent-btn active" data-tangent="auto">${s("Auto")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="clamped">${s("Clamped")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="vector">${s("Vector")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="free">${s("Free")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="aligned">${s("Aligned")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="flat">${s("Flat")}</button>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Position")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="key-px" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="key-py" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="key-pz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-pos" title="${s("Reset Position")}">⟲</button>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Target XYZ")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="key-tx" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="key-ty" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="key-tz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-target" title="${s("Reset Target")}">⟲</button>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("FOV")}</span><input data-role="key-fov" type="number" min="5" max="150" step="0.1"></div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Roll")}</span><input data-role="key-roll" type="number" min="-180" max="180" step="0.1"></div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Zoom")}</span><input data-role="key-zoom" type="number" min="0.01" step="0.05"></div>
        <div class="oc-field-row" data-role="key-timing-weight-row" title="${s("Authoring preference used by Redistribute Timing; does not change playback speed by itself")}">
          <span class="oc-field-label">${s("Timing Weight")}</span><input data-role="key-timing-weight" type="number" min="0.1" max="10" step="0.1">
        </div>
        <div class="oc-card-actions">
          <button type="button" class="icon-button" data-act="redistribute-key-timing" title="${s("Redistribute this camera's key timing across its current frame range using each key's Timing Weight")}">
            <i class="pi pi-sliders-h"></i> ${s("Redistribute Timing")}
          </button>
        </div>
        <div class="oc-path-diagnostics" data-role="path-diagnostics-list" hidden></div>
        <details class="oc-more" data-density-min="advanced"><summary>${s("Projection & Clipping")}</summary>
          <div class="oc-field-row"><span class="oc-field-label">${s("Camera")}</span>
            <select data-role="key-camera-type"><option value="perspective">${s("Perspective")}</option><option value="orthographic">${s("Orthographic")}</option></select>
          </div>
          <div class="oc-field-row"><span class="oc-field-label">${s("Near Clip")}</span><input data-role="key-near" type="number" min="0.0001" step="0.001"></div>
          <div class="oc-field-row"><span class="oc-field-label">${s("Far Clip")}</span><input data-role="key-far" type="number" min="0.0002" step="1"></div>
        </details>
      </div>
    </div>`;
}
function jm() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="health" data-density-min="animation" hidden>
      <div class="oc-card oc-health">
        <div class="oc-card-title"><i class="pi pi-heart"></i> ${s("Camera Health")}
          <div class="oc-health-header-badges" style="display:flex;align-items:center;gap:5px;margin-left:auto">
            <span class="oc-health-score-badge" data-role="health-score-badge">100% (A)</span>
            <span class="oc-health-badge" data-role="health-badge">${s("Checking")}</span>
          </div>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Target model")}</span>
          <select data-role="health-profile" title="${s("Grade the shot against this model's recommended limits")}"></select>
        </div>
        <div data-role="health-body"></div>
      </div>
    </div>`;
}
function _m() {
  return `
    <div class="viewport-inspector oc-side" data-role="viewport-inspector">
      <div class="oc-inspector-head oc-side-tabs">
        <strong class="oc-inspector-title" data-role="inspector-title">${s("Inspector")}</strong>
        <span class="oc-panel-spacer"></span>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="motion" data-tab="motion" aria-pressed="false">${s("Motion")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="shot" data-tab="display" aria-pressed="false">${s("Shot")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="health" data-tab="health" data-density-min="animation" aria-pressed="false">${s("Health")}</button>
      </div>
      ${xm()}
      ${wm()}
      ${km()}
      ${Sm()}
      ${jm()}
    </div>`;
}
function Cm() {
  return `
    <div class="oc-health-strip" data-role="solve-health-strip" data-density-min="animation">
      <span class="oc-health-strip-label">${s("Solve Health")}</span>
      <div class="oc-health-cells" data-role="solve-health-cells"
           role="group" aria-label="${s("Per-frame solve health")}"></div>
      <span class="oc-health-strip-readout" data-role="solve-health-readout" aria-live="polite"></span>
    </div>`;
}
function Em() {
  return `
    <div class="oc-preview camera-view-row" data-role="camera-view-row">
      <div class="oc-preview-head">
        <span data-role="preview-title">${s("Camera")}</span>
        <button class="camera-strip-close" data-act="toggle-camera-view" title="${s("Hide camera previews")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="camera-preview-strip" data-role="camera-previews"></div>
    </div>`;
}
function Am() {
  return `
    <div class="row timeline-toolbar oc-transport">
      <div class="timeline-group" title="${s("Playback Transport")}">
        <button class="icon-button" data-act="key-first" title="${s("First Frame (Home)")}" aria-label="${s("Go to first frame")}"><i class="pi pi-step-backward-alt"></i></button>
        <button class="icon-button" data-act="previous-key" title="${s("Previous Keyframe (, / Up Arrow)")}" aria-label="${s("Previous keyframe")}"><i class="pi pi-fast-backward"></i></button>
        <button class="icon-button" data-act="previous-frame" title="${s("Previous Frame (Left Arrow)")}" aria-label="${s("Previous frame")}"><i class="pi pi-step-backward"></i></button>
        <button class="icon-button primary-play oc-play" data-act="play" title="${s("Play / Stop (Space)")}" aria-label="${s("Play timeline")}"><i class="pi pi-play"></i></button>
        <button class="icon-button" data-act="next-frame" title="${s("Next Frame (Right Arrow)")}" aria-label="${s("Next frame")}"><i class="pi pi-step-forward"></i></button>
        <button class="icon-button" data-act="next-key" title="${s("Next Keyframe (. / Down Arrow)")}" aria-label="${s("Next keyframe")}"><i class="pi pi-fast-forward"></i></button>
        <button class="icon-button" data-act="key-last" title="${s("Last Frame (End)")}" aria-label="${s("Go to last frame")}"><i class="pi pi-step-forward-alt"></i></button>
        <button class="icon-button" data-act="loop" title="${s("Toggle Loop Playback")}" aria-label="${s("Loop playback")}" aria-pressed="false"><i class="pi pi-replay"></i></button>
      </div>

      <span class="oc-frame-counter">
        <input data-role="frame" type="number" min="0" value="0" aria-label="${s("Frame")}">
        <span class="oc-frame-total" data-role="frame-total">/ 120</span>
      </span>
      <button class="oc-timecode" data-role="time" data-act="toggle-timecode" title="${s("Click to toggle Time / Timecode")}">00:00.000</button>

      <span class="oc-transport-spacer"></span>

      <div class="timeline-group" title="${s("Keyframe Tools")}">
        <button class="icon-button primary-key oc-key" data-act="key" title="${s("Insert / Update Keyframe at Playhead (I)")}" aria-label="${s("Insert or update key")}"><span class="oc-diamond"></span> ${s("Key")}</button>
        <button class="icon-button auto-key-btn" data-act="auto-key" title="${s("Auto-Key: Records moves live while scrubbing/navigating")}" aria-label="${s("Toggle Auto Key")}" aria-pressed="false"><i class="pi pi-circle-fill"></i></button>
      </div>
      <button class="icon-button" data-act="toggle-graph" data-density-min="animation" title="${s("Open or close the animation curve editor")}"><i class="pi pi-chart-line"></i></button>
      <label class="oc-fps">${s("FPS")} <input data-role="timeline-fps" type="number" min="1" max="120" step="1" value="24"></label>

      <details class="toolbar-menu oc-overflow" data-menu="timeline">
        <summary title="${s("Timeline options")}"><i class="pi pi-ellipsis-h"></i></summary>
        <div class="menu-panel right">
          <div class="menu-title">${s("Range & Duration")}</div>
          <label>${s("Dur")} <input data-role="duration-seconds" type="number" min="0.25" max="120" step="0.25" value="5"></label>
          <div class="menu-row">
            <button data-act="range-start" title="${s("Set In Point at Playhead ([)")}">[</button>
            <button data-act="range-end" title="${s("Set Out Point at Playhead (])")}">]</button>
            <button data-act="range-clear" title="${s("Clear Playback Range")}"><i class="pi pi-times"></i></button>
          </div>
          <div class="menu-divider"></div><div class="menu-title">${s("Snapping")}</div>
          <div class="menu-row">
            <button data-act="toggle-snap" title="${s("Toggle Snapping")}" aria-pressed="true"><i class="pi pi-thumbtack"></i> ${s("Snap")}</button>
            <input data-role="snap-frames" type="number" min="1" max="24" step="1" value="1">
          </div>
          <div class="menu-divider"></div>
          <button data-act="fit-timeline" title="${s("Fit Timeline to View (F)")}"><i class="pi pi-arrows-alt"></i> ${s("Fit Timeline to View (F)")}</button>
          <span class="timeline-summary" data-role="timeline-summary">${s("1 key")}</span>
        </div>
      </details>
    </div>`;
}
function Tm() {
  return `
    <div class="oc-dope">
      <div class="oc-dope-body">
        <div class="oc-dope-labels">${Ss.map((t) => `
          <label class="oc-dope-label" style="--channel-color:${t.color}">
            <input type="checkbox" data-dope-channel="${t.id}" checked>
            <span>${s(t.label)}</span>
          </label>`).join("")}</div>
        <div class="oc-dope-tracks" data-role="dope-tracks" tabindex="-1">
          <div class="oc-ruler" data-role="ruler" title="${s("Drag to scrub the timeline")}"></div>
          <div class="keys" data-role="keys" tabindex="0" aria-label="${s("Camera keyframe timeline")}"></div>
          <div class="oc-dope-rows" data-role="dope-rows"></div>
          <span class="oc-playhead-line" data-role="dope-playhead"></span>
        </div>
      </div>
      <input class="oc-scrub oc-sr-only" data-role="scrub" type="range" min="0" max="119" value="0" aria-label="${s("Scrub the timeline")}">
    </div>`;
}
function $m() {
  return `
    <section class="curve-editor oc-graph" data-density-min="animation">
      <div class="oc-graph-head">
        <span class="oc-graph-tabs" data-role="graph-tabs">
          <button class="oc-graph-tab" data-graph-tab="dope" aria-pressed="false" title="${s("Per-channel keyframe sheet")}">${s("Timeline")}</button>
          <button class="oc-graph-tab active" data-graph-tab="curves" aria-pressed="true" title="${s("Edit animation curves")}"><strong>${s("Graph")}</strong></button>
          <button class="oc-graph-tab" data-graph-tab="sequence" aria-pressed="false" title="${s("Cut the timeline into shots, one camera per range")}">${s("Sequence")}</button>
        </span>
        <span class="hint">${s("MMB/Alt-drag: Pan · Scroll: Zoom · Box Select: Drag · Drag Point: Retime/Value · Right-click: Menu")}</span>
      </div>
      <div class="curve-toolbar oc-graph-toolbar">
        <select data-role="curve-group" title="${s("Choose the animated channels displayed in the graph")}">
          <option value="camera">${s("Camera (Position, Focal, Roll)")}</option>
          <option value="position">${s("Position XYZ")}</option>
          <option value="target">${s("Target XYZ")}</option>
          <option value="lens">${s("FOV / Roll / Zoom")}</option>
        </select>
        <span class="oc-graph-spacer"></span>
        <div class="oc-graph-modes" data-role="curve-modes">
          <button class="curve-mode" data-tangent-mode="auto" title="${s("Automatic smooth tangents")}">${s("Auto")}</button>
          <button class="curve-mode" data-curve-mode="smooth" title="${s("Smooth interpolation after the selected key")}">${s("Smooth")}</button>
          <button class="curve-mode" data-curve-mode="linear" title="${s("Straight interpolation after the selected key")}">${s("Linear")}</button>
        </div>
        <button class="curve-mode" data-act="curve-zoom-in" title="${s("Zoom in curve editor (Mouse wheel)")}"><i class="pi pi-search-plus"></i></button>
        <button class="curve-mode" data-act="curve-zoom-out" title="${s("Zoom out curve editor")}"><i class="pi pi-search-minus"></i></button>
        <button class="curve-mode" data-act="curve-fit" title="${s("Fit curves to view")}"><i class="pi pi-arrows-alt"></i></button>
        <button class="curve-mode active" data-act="curve-handles" title="${s("Show or hide Bézier tangent handles")}" aria-pressed="true"><i class="pi pi-share-alt"></i></button>
        <details class="toolbar-menu oc-overflow" data-menu="curve">
          <summary title="${s("Interpolation & tangents")}"><i class="pi pi-ellipsis-h"></i></summary>
          <div class="menu-panel right">
            <div class="menu-title">${s("Interpolation")}</div>
            <div class="menu-grid">
              <button class="curve-mode" data-curve-mode="bezier">${s("Bezier")}</button>
              <button class="curve-mode" data-curve-mode="ease">${s("Ease In/Out")}</button>
              <button class="curve-mode" data-curve-mode="ease_in">${s("Ease In")}</button>
              <button class="curve-mode" data-curve-mode="ease_out">${s("Ease Out")}</button>
              <button class="curve-mode" data-curve-mode="sine">${s("Sine")}</button>
              <button class="curve-mode" data-curve-mode="cubic">${s("Cubic")}</button>
              <button class="curve-mode" data-curve-mode="quintic">${s("Quintic")}</button>
              <button class="curve-mode" data-curve-mode="expo">${s("Expo")}</button>
              <button class="curve-mode" data-curve-mode="back">${s("Back")}</button>
              <button class="curve-mode" data-curve-mode="hold">${s("Hold / Step")}</button>
            </div>
            <div class="menu-divider"></div><div class="menu-title">${s("Tangents")}</div>
            <div class="menu-grid">
              <button class="curve-mode" data-tangent-mode="clamped">${s("Clamped")}</button>
              <button class="curve-mode" data-tangent-mode="vector">${s("Vector")}</button>
              <button class="curve-mode" data-tangent-mode="free">${s("Free")}</button>
              <button class="curve-mode" data-tangent-mode="aligned">${s("Aligned")}</button>
              <button class="curve-mode" data-tangent-mode="flat">${s("Flat")}</button>
            </div>
          </div>
        </details>
      </div>
      <div class="oc-graph-body">
        <div class="oc-graph-legend" data-role="curve-legend"></div>
        <div class="oc-graph-stage">
          <canvas class="curve-canvas" data-role="curve-canvas" tabindex="-1" title="${s("Drag a key point vertically or drag tangent handles on either side. Scroll to zoom. Right-click for curve actions.")}"></canvas>
          <div class="oc-gdope" data-role="graph-dope" hidden></div>
          <div class="oc-gsequence" data-role="graph-sequence" tabindex="0" hidden></div>
        </div>
      </div>
      <div class="oc-resize-v oc-graph-resize" data-role="graph-resize" role="separator" aria-orientation="horizontal" tabindex="0"
           title="${s("Drag to resize graph editor — double-click to reset")}" aria-label="${s("Resize graph editor")}"></div>
    </section>`;
}
function Mm() {
  return `
    <div class="oc-lower">
      ${Em()}
      <div class="oc-resize-h" data-role="preview-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${s("Drag to resize the camera view — double-click to reset")}" aria-label="${s("Resize the camera view")}"></div>
      <div class="timeline oc-timeline">
        ${Am()}
        ${Cm()}
        ${Tm()}
        <div class="motion-timeline" data-role="motion-timeline" aria-label="${s("Motion track timeline")}"></div>
      </div>
    </div>
    ${$m()}`;
}
function Im() {
  return `
    <details class="toolbar-menu" data-menu="file"><summary><i class="pi pi-folder"></i> ${s("Scene")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${s("Scene Library")}</div>
      <button data-act="scene-new"><i class="pi pi-file"></i> ${s("New Scene")}</button>
      <button data-act="scene-open"><i class="pi pi-folder-open"></i> ${s("Open Scene…")}</button>
      <button data-act="scene-save" class="primary"><i class="pi pi-save"></i> ${s("Save Scene")}</button>
      <div class="menu-divider"></div>
      <button data-act="scene-reset"><i class="pi pi-undo"></i> ${s("Reset Scene")}</button>
      <span class="hint">${s("Reset reverts to the last saved or opened scene.")}</span>
    </div></details>`;
}
function Om() {
  return `
    <details class="toolbar-menu" data-menu="scene"><summary><i class="pi pi-box"></i> ${s("Viewport")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${s("Upstream Sync & Imports")}</div>
      <button data-act="sync-inputs" class="primary"><i class="pi pi-sync"></i> ${s("Sync Upstream Inputs")}</button>
      <button data-act="load-card"><i class="pi pi-image"></i> ${s("Set Subject Card")}</button>
      <button data-act="add-card"><i class="pi pi-images"></i> ${s("Add Media Card")}</button>
      <button data-act="load-model"><i class="pi pi-box"></i> ${s("Import 3D Scene")}</button>
      <button data-act="load-audio"><i class="pi pi-volume-up"></i> ${s("Load Audio Track")}</button>
      <span class="hint">${s("GLB, OBJ, FBX, STL, PLY. Audio WAV/MP3/OGG.")}</span>
      <div class="menu-divider"></div><div class="menu-title">${s("Objects & Primitives")}</div>
      <button data-object-type="card"><i class="pi pi-image"></i> ${s("Card")}</button>
      <button data-object-type="cube"><i class="pi pi-stop"></i> ${s("Cube")}</button>
      <button data-object-type="sphere"><i class="pi pi-circle"></i> ${s("Sphere")}</button>
      <button data-object-type="cylinder"><i class="pi pi-database"></i> ${s("Cylinder")}</button>
      <button data-object-type="torus"><i class="pi pi-circle"></i> ${s("Torus")}</button>
      <button data-object-type="human"><i class="pi pi-user"></i> ${s("Human Proxy")}</button>
      <button data-object-type="null"><i class="pi pi-plus"></i> ${s("Null Locator")}</button>
      <div class="menu-section" data-density-min="animation">
        <div class="menu-divider"></div><div class="menu-title">${s("Camera Interchange")}</div>
        <button data-act="import-camera"><i class="pi pi-download"></i> ${s("Import Camera…")}</button>
        <span class="hint">${s("glTF, GLB, FBX, .chan or an OmniCam JSON track.")}</span>
        <label>${s("Export format")} <select data-role="export-format"></select></label>
        <button data-act="export-camera"><i class="pi pi-upload"></i> ${s("Export Camera")}</button>
        <span class="hint" data-role="export-note"></span>
        <input data-role="camera-file" type="file" accept=".gltf,.glb,.fbx,.chan,.json" hidden>
      </div>
      <div class="menu-section" data-density-min="advanced">
        <div class="menu-divider"></div><div class="menu-title">${s("Blocking Scene Sets (Parallax / Occlusion)")}</div>
        <div class="menu-grid">
          <button data-blocking-scene="foreground_reveal" title="${s("Foreground pillar sweep reveal")}">${s("FG Reveal")}</button>
          <button data-blocking-scene="doorway_pass" title="${s("Push-in through doorway opening")}">${s("Doorway Pass")}</button>
          <button data-blocking-scene="over_the_shoulder" title="${s("Over the shoulder frame")}">${s("OTS Frame")}</button>
          <button data-blocking-scene="perspective_corridor" title="${s("Perspective depth colonnade")}">${s("Corridor")}</button>
          <button data-blocking-scene="tabletop_orbit" class="span-2" title="${s("Product pedestal 360 orbit")}">${s("Tabletop 360° Orbit")}</button>
        </div>
      </div>
    </div></details>`;
}
function Pm() {
  return `
    <details class="toolbar-menu" data-menu="camera"><summary><i class="pi pi-video"></i> <span data-role="camera-summary">${s("Cameras")}</span> <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${s("Animated cameras")}</div>
      <div class="camera-menu-list" data-role="camera-menu-list"></div>
      <button data-act="add-camera"><i class="pi pi-plus"></i> ${s("Add Camera")}</button>
      <div class="menu-divider"></div><div class="menu-title">${s("Targeting")}</div>
      <button data-act="aim-at-object" class="primary"><i class="pi pi-compass"></i> ${s("Aim at Target Subject")}</button>
      <button data-act="focus-target"><i class="pi pi-expand"></i> ${s("Frame Camera Target")}</button>
      <div class="menu-section" data-density-min="animation">
        <button data-act="bake-aim-keys"><i class="pi pi-check-square"></i> ${s("Bake")}</button>
        <button data-act="bake-aim-per-frame" title="${s("One camera key per frame, so an exported track matches the viewport exactly")}"><i class="pi pi-list-check"></i> ${s("Bake Per Frame")}</button>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${s("Motion Presets & Shake")}</div>
      <div class="menu-grid">
        <button data-preset="orbit_360">${s("Orbit 360°")}</button>
        <button data-preset="push_in">${s("Push In")}</button>
        <button data-preset="pull_out">${s("Pull Out")}</button>
        <button data-preset="dolly_zoom">${s("Dolly Zoom (Vertigo)")}</button>
        <button data-shake="handheld_subtle">${s("Handheld Shake")}</button>
        <button data-shake="turbulence">${s("Turbulence Shake")}</button>
        <button data-shake="handheld">${s("Handheld")}</button>
        <button data-shake="subtle">${s("Subtle")}</button>
        <button data-shake="crash">${s("Crash")}</button>
      </div>
      <div class="menu-divider"></div>
      <label>${s("New key interpolation")} <select data-role="interp">
        <option value="ease">${s("Ease")}</option><option value="smooth">${s("Smooth")}</option>
        <option value="bezier">${s("Bezier")}</option><option value="linear">${s("Linear")}</option>
        <option value="ease_in">${s("Ease In")}</option><option value="ease_out">${s("Ease Out")}</option>
      </select></label>
      <button data-act="reset-camera"><i class="pi pi-refresh"></i> ${s("Reset Camera")}</button>
    </div></details>`;
}
function Lm() {
  return `
    <details class="toolbar-menu" data-menu="view"><summary><i class="pi pi-compass"></i> ${s("View")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${s("Navigation & Selection")}</div>
      <label title="${s("Middle drag orbits, Shift+middle pans, Ctrl+middle dollies -- no Alt needed anywhere. Alt+left/middle/right are aliases for orbit/pan/dolly; with no middle button, Ctrl+drag over empty space orbits and Ctrl+Shift+drag pans. Maya vs Blender only decides whether Alt+right dollies (Maya) or does nothing (Blender). Simple is mouse-only: left drag orbits, right drag pans, wheel zooms -- no modifiers, no middle button, no viewport marquee or right-click menu.")}">${s("Navigation profile")} <select data-role="navigation-profile"><option value="maya">Maya</option><option value="blender">Blender</option><option value="simple">${s("Simple")}</option></select></label>
      <div class="menu-section" data-density-min="advanced">
        <label>${s("Select mode")} <select data-role="select-mode">
          <option value="object" selected>${s("Object (4)")}</option>
          <option value="vertex">${s("Vertex (1)")}</option>
          <option value="edge">${s("Edge (2)")}</option>
          <option value="face">${s("Face (3)")}</option>
        </select></label>
        <label title="${s("Applies to Move only. Scale and Rotate always use the object's own axes, as Maya's manipulators do: a size triple and an XYZ euler only exist in the object's own frame, so a world-axis scale would shear it and a world-axis rotation cannot be expressed at all.")}">${s("Transform space")} <select data-role="gizmo-space"><option value="world">${s("World")}</option><option value="local">${s("Local")}</option></select></label>
        <label>${s("Spatial snapping")} <select data-role="spatial-snap-mode"><option value="none">${s("No Snap")}</option><option value="grid">${s("Grid")}</option><option value="vertex">${s("Vertex")}</option></select></label>
        <label>${s("Spatial grid size")} <input data-role="spatial-grid-size" type="number" min="0.01" max="100" step="0.01" value="0.5"></label>
      </div>
      <label>${s("Move speed")} <input data-role="speed" type="number" min="0.05" max="5" step="0.05" value="1"></label>
      <div class="menu-divider"></div><div class="menu-title">${s("Proxy Reference")}</div>
      <label>${s("Point density")} <select data-role="point-density">
        <option value="none">${s("None (0)")}</option><option value="sparse">${s("Sparse (300)")}</option>
        <option value="balanced" selected>${s("Balanced (800)")}</option><option value="dense">${s("Dense (1800)")}</option>
        <option value="ultra">${s("Ultra (3500)")}</option>
      </select></label>
      <label>${s("Point spread")} <select data-role="point-spread">
        <option value="all_views" selected>${s("All Views (Full 3D)")}</option>
        <option value="ground_focus">${s("Ground + Low Angle")}</option>
        <option value="dome">${s("Spherical Dome")}</option>
      </select></label>
      <label>${s("Point color")} <input data-role="point-color" type="color" value="#cbd5e1"></label>
      <label>${s("Card fit")} <select data-role="card-fit"><option value="contain">${s("Fit")}</option><option value="cover">${s("Fill")}</option><option value="stretch">${s("Stretch")}</option></select></label>
      <label>${s("Interface")} <select data-role="ui-density"><option value="basic">${s("Basic")}</option><option value="animation">${s("Animation")}</option><option value="advanced" selected>${s("Advanced")}</option></select></label>
    </div></details>`;
}
function Nm() {
  return `
    <details class="toolbar-menu" data-menu="display"><summary><i class="pi pi-eye"></i> ${s("Display")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${s("Composition Guides & Mini-Map")}</div>
      <label><span>${s("Rule of Thirds")}</span><input data-role="guides" type="checkbox" checked></label>
      <div class="menu-section" data-density-min="advanced">
        <label><span>${s("2D Radar Mini-Map")}</span><input data-role="show-radar" type="checkbox"></label>
      </div>
      <label><span>${s("Safe Areas (90%/80%)")}</span><input data-role="safe-areas" type="checkbox"></label>
      <div class="menu-section" data-density-min="animation">
        <label title="${s("Mask the viewport down to the node's output width x height")}"><span>${s("Resolution Gate")}</span><input data-role="resolution-gate" type="checkbox"></label>
        <label>${s("Aspect Ratio")} <select data-role="aspect-ratio">
          <option value="auto">${s("Auto (node output)")}</option><option value="16:9">16:9</option><option value="4:3">4:3</option>
          <option value="1:1">1:1</option><option value="9:16">9:16</option><option value="2.39:1">2.39:1</option>
        </select></label>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${s("Scene Display")}</div>
      <label><span>${s("Floor Grid")}</span><input data-role="show-grid" type="checkbox" checked></label>
      <label><span>${s("Camera Paths")}</span><input data-role="show-camera-paths" type="checkbox" checked></label>
      <label><span>${s("Camera Gizmos (body / frustum)")}</span><input data-role="show-camera-gizmos" type="checkbox" checked></label>
      <label><span>${s("Look-At Targets")}</span><input data-role="show-look-at" type="checkbox" checked></label>
      <label><span>${s("Helper Axes (nulls)")}</span><input data-role="show-helper-axes" type="checkbox" checked></label>
      <label><span>${s("Keep the grid in the playblast")}</span><input data-role="playblast-grid" type="checkbox"></label>
      <label><span>${s("Burn labels / annotations into the playblast")}</span><input data-role="playblast-labels" type="checkbox"></label>
      <label>${s("Reconstruction Appearance")} <select data-role="reconstruction-appearance">
        <option value="neutral">${s("Neutral")}</option>
        <option value="source_texture">${s("Source Texture")}</option>
      </select></label>
      <div class="menu-section" data-density-min="advanced">
        <label title="${s("Resolution of the recorded playblast video")}">${s("Playblast Resolution")} <select data-role="playblast-resolution">
          <option value="viewport">${s("Viewport (fast)")}</option>
          <option value="half">${s("½ x node output")}</option>
          <option value="output">${s("Match node output")}</option>
          <option value="double">${s("2x node output (sharp)")}</option>
        </select></label>
      </div>
      <div class="menu-section" data-density-min="advanced">
        <label><span>${s("Wireframe / Edges")}</span><input data-role="show-wireframe" type="checkbox"></label>
        <label><span>${s("Mesh Vertices")}</span><input data-role="show-vertices" type="checkbox"></label>
        <label><span>${s("Backface Culling")}</span><input data-role="backface-culling" type="checkbox"></label>
        <label><span>${s("Burn-in Data")}</span><input data-role="burn-in" type="checkbox"></label>
        <label><span>${s("Speed Map")}</span><input data-role="speed-heatmap" type="checkbox"></label>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${s("Environment & Background")}</div>
      <label>${s("BG Color")} <input data-role="viewport-bg-color" type="color" value="#121212"></label>
      <button data-act="reset-bg-color" title="${s("Restore the studio sky")}"><i class="pi pi-undo"></i> ${s("Reset BG Color")}</button>
      <div class="menu-row" data-density-min="advanced">
        <button data-act="upload-viewport-bg"><i class="pi pi-image"></i> ${s("BG Image")}</button>
        <button data-act="upload-viewport-bg-seq"><i class="pi pi-images"></i> ${s("BG Sequence")}</button>
        <button data-act="clear-viewport-bg" class="icon-button" title="${s("Clear Background")}"><i class="pi pi-trash"></i></button>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${s("Previews")}</div>
      <label>${s("Layout")} <select data-role="preview-layout">
        <option value="auto">${s("Auto strip")}</option><option value="1">${s("Single")}</option>
        <option value="2">${s("Side by side")}</option><option value="4">${s("Quad")}</option>
      </select></label>
    </div></details>`;
}
function zm() {
  return `
    <div class="top">
      <button class="icon-button oc-drawer-toggle" data-act="toggle-scene-panel" title="${s("Scene")}" aria-pressed="false"><i class="pi pi-list"></i></button>
      ${Im()}
      ${Om()}
      ${Pm()}
      ${Lm()}
      ${Nm()}
      <input data-role="file" type="file" accept="image/*,video/*" hidden>
      <input data-role="model-file" type="file" accept=".glb,.obj,.fbx,.stl,.ply" hidden>
      <input data-role="audio-file" type="file" accept="audio/*,.wav,.mp3,.ogg,.flac" hidden>
      <input data-role="viewport-bg-file" type="file" accept="image/*" hidden>
      <input data-role="viewport-bg-seq-file" type="file" accept="image/*" multiple hidden>
      <span class="oc-toolbar-spacer"></span>
      <button class="oc-playblast" data-act="record" title="${s("Record proxy playblast")}"><span class="oc-playblast-dot"></span>${s("Playblast")}</button>
      <button class="icon-button oc-strip-toggle" data-act="toggle-camera-view" title="${s("Toggle Camera Previews Strip")}"><i class="pi pi-video"></i></button>
      <button class="icon-button oc-drawer-toggle" data-act="toggle-inspector-panel" title="${s("Inspector")}" aria-pressed="false"><i class="pi pi-sliders-h"></i></button>
      <select class="oc-render-mode" data-role="mode" title="${s("Proxy mode")}">
        <option value="omni_ref">${s("Omni Ref")}</option>
        <option value="card_grid">${s("Card + Grid")}</option>
        <option value="graybox">${s("Graybox")}</option>
        <option value="grid">${s("Grid")}</option>
        <option value="point_field">${s("Point Field")}</option>
        <option value="wireframe">${s("Wireframe")}</option>
        <option value="beauty">${s("Beauty (lit)")}</option>
      </select>
    </div>`;
}
function Fm() {
  return `
    <div class="vp-rail" role="toolbar" aria-label="${s("Viewport tools")}">
      <button class="vp-tool" data-act="clear-selection" title="${s("Select Object Tool (Q)")}"><i class="pi pi-arrow-up-left"></i></button>
      <button class="vp-tool" data-transform-mode="translate" title="${s("Translation gizmo (click)")}"><i class="pi pi-arrows-alt"></i></button>
      <button class="vp-tool" data-transform-mode="rotate" title="${s("Rotation gizmo (click)")}"><i class="pi pi-replay"></i></button>
      <button class="vp-tool" data-transform-mode="scale" title="${s("Scale gizmo (click)")}"><i class="pi pi-stop"></i></button>
      <button class="vp-tool" data-act="draw-camera-path" aria-pressed="false"
              title="${s("Draw Camera Path (perspective or top / front / side view)")}" aria-label="${s("Draw Camera Path")}">
        <i class="pi pi-pencil"></i>
      </button>
      <button class="vp-tool" data-act="draw-camera-path-extend" aria-pressed="false"
              title="${s("Continue Camera Path — draw a new segment from the active camera's last key")}" aria-label="${s("Continue Camera Path")}">
        <i class="pi pi-arrow-right"></i>
      </button>
      <button class="vp-tool" data-act="camera-path-presets"
              title="${s("Camera Path Presets — generate an editable path (Orbit, Dolly, Arc, ...)")}" aria-label="${s("Camera Path Presets")}">
        <i class="pi pi-compass"></i>
      </button>
      <button class="vp-tool" data-act="toggle-gizmo-space" data-role="gizmo-space-toggle"
              title="${s("Toggle Transform Space (World / Local)")}">
        <span class="vp-space-badge" data-role="gizmo-space-badge">W</span>
      </button>
      <button class="vp-tool" data-act="toggle-spatial-snap" data-role="spatial-snap-toggle" aria-pressed="false"
              title="${s("Toggle Snapping (Grid / None)")}" aria-label="${s("Toggle Snapping (Grid / None)")}">
        <i class="pi pi-thumbtack"></i>
      </button>
      <span class="vp-rail-divider"></span>
      <button class="vp-tool" data-select-mode="vertex" data-density-min="advanced" title="${s("Vertex Selection Mode (1)")}"><i class="pi pi-circle"></i></button>
      <button class="vp-tool" data-select-mode="edge" data-density-min="advanced" title="${s("Edge Selection Mode (2)")}"><i class="pi pi-minus"></i></button>
      <button class="vp-tool" data-select-mode="face" data-density-min="advanced" title="${s("Face / Polygon Selection Mode (3)")}"><i class="pi pi-table"></i></button>
      <button class="vp-tool active" data-select-mode="object" title="${s("Object Selection Mode (4)")}"><i class="pi pi-box"></i></button>
      <span class="vp-rail-divider"></span>
      <button class="vp-tool" data-act="frame-target" title="${s("Frame Subject Target (F)")}"><i class="pi pi-expand"></i></button>
      <button class="vp-tool" data-act="select-look-at" data-density-min="advanced" title="${s("Select camera Look-At target")}"><i class="pi pi-bullseye"></i></button>
      <button class="vp-tool" data-act="toggle-inspector" title="${s("Toggle Inspector Panel (N)")}"><i class="pi pi-ellipsis-h"></i></button>
    </div>`;
}
function Rm() {
  return `
    <div class="vp-pills" role="group" aria-label="${s("Quick viewport views")}">
      <div class="vp-quick-views">
        <button type="button" class="vp-view active" data-view="camera" aria-pressed="true" title="${s("Camera View")}">${s("Camera")}</button>
        <button type="button" class="vp-view" data-view="perspective" aria-pressed="false" title="${s("Perspective View")}">${s("Perspective")}</button>
        <button type="button" class="vp-view" data-view="front" aria-pressed="false" title="${s("Front View")}">${s("Front")}</button>
        <button type="button" class="vp-view" data-view="right" aria-pressed="false" title="${s("Right View")}">${s("Right")}</button>
        <button type="button" class="vp-view" data-view="top" aria-pressed="false" title="${s("Top View")}">${s("Top")}</button>
        <button type="button" class="vp-view" data-view="iso" aria-pressed="false" title="${s("Isometric View")}">${s("ISO")}</button>
      </div>
      <select class="vp-pill vp-pill-select" data-role="view-mode" aria-label="${s("More viewport views")}" title="${s("View mode: Camera (Numpad 0), Front/Back (1), Top/Bottom (7), Right/Left (3)")}">
        <option value="camera">${s("Camera View")}</option>
        <option value="perspective">${s("Perspective")}</option>
        <option value="iso">${s("Isometric View")}</option>
        <option value="front">${s("Front View")}</option>
        <option value="back">${s("Back View")}</option>
        <option value="top">${s("Top View")}</option>
        <option value="bottom">${s("Bottom View")}</option>
        <option value="right">${s("Right Side")}</option>
        <option value="left">${s("Left Side")}</option>
      </select>
      <select class="vp-pill vp-pill-select" data-role="active-camera-select" title="${s("Switch Active Camera")}"></select>
    </div>`;
}
function Dm() {
  return `
    <div class="motion-tools" role="toolbar" aria-label="${s("Motion track tools")}">
      <button class="active" data-motion-tool="select" aria-pressed="true" title="${s("Select motion track")}"><i class="pi pi-arrow-up-left"></i></button>
      <button data-motion-tool="track" aria-pressed="false" title="${s("Draw motion track")}"><i class="pi pi-pencil"></i></button>
      <button data-motion-tool="anchor" aria-pressed="false" title="${s("Add static screen anchor")}"><i class="pi pi-map-marker"></i></button>
      <button data-motion-tool="project" aria-pressed="false" title="${s("Project selected object or world point")}"><i class="pi pi-bullseye"></i></button>
      <button data-motion-tool="erase" aria-pressed="false" title="${s("Erase motion track")}"><i class="pi pi-eraser"></i></button>
    </div>`;
}
function Km() {
  return `
    <div class="viewport-wrap">
      <canvas tabindex="0" role="img" aria-label="${s("3D scene viewport. Drag to orbit, scroll to zoom, F to frame the selection, right-click for the context menu.")}"></canvas>

      <div class="viewport-tally-banner" data-role="tally-banner" hidden>
        <span class="tally-dot"></span>
        <span class="tally-text" data-role="tally-text">REC KEY @ F0</span>
      </div>

      <div class="vp-camera-hud" data-role="camera-hud" hidden>
        <button type="button" class="hud-cam-lock" data-act="toggle-camera-lock" title="${s("Lock Camera View (prevent accidental navigation)")}">
          <i class="pi pi-lock-open" data-role="cam-lock-icon"></i>
        </button>
        <span class="hud-cam-name" data-role="hud-cam-name">Camera</span>
        <span class="hud-divider">·</span>
        <span class="hud-cam-lens" data-role="hud-cam-lens">35mm</span>
        <span class="hud-cam-fov" data-role="hud-cam-fov">54.4°</span>
        <span class="hud-divider">·</span>
        <span class="hud-cam-dist" data-role="hud-cam-dist">Target: 4.2m</span>
        <button type="button" class="hud-roll-reset" data-act="reset-camera-roll" data-role="hud-roll-reset" title="${s("Reset roll to 0°")}" hidden>
          <i class="pi pi-undo"></i> <span data-role="hud-roll-val">0°</span>
        </button>
      </div>

      <div class="extractor-import-banner" data-role="extractor-import-banner" hidden>
        <i class="pi pi-video"></i>
        <span data-role="extractor-import-text"></span>
        <button type="button" class="ei-import" data-act="import-extractor-camera">${s("Import as Camera")}</button>
        <button type="button" class="ei-dismiss" data-act="dismiss-extractor-camera" title="${s("Dismiss")}" aria-label="${s("Dismiss")}"><i class="pi pi-times"></i></button>
      </div>

      ${Rm()}
      ${Dm()}

      <div class="vp-corner">
        <div class="vp-overlay-group" role="group" aria-label="${s("Quick Overlays")}">
          <button type="button" class="vp-overlay-btn" data-act="toggle-grid-overlay" data-role="overlay-grid-btn" title="${s("Toggle Floor Grid")}"><i class="pi pi-th-large"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-wireframe-overlay" data-role="overlay-wireframe-btn" title="${s("Toggle Wireframe on Shaded / Mesh Edges")}"><i class="pi pi-box"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-cull-overlay" data-role="overlay-cull-btn" title="${s("Toggle Backface Culling (Solid Interior / Single-Sided)")}"><i class="pi pi-clone"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-gizmo-overlay" data-role="overlay-gizmo-btn" title="${s("Toggle Transform Gizmos")}"><i class="pi pi-arrows-alt"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-guides-overlay" data-role="overlay-guides-btn" title="${s("Toggle Composition Guides (Rule of Thirds)")}"><i class="pi pi-hashtag"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-safe-areas-overlay" data-role="overlay-safe-btn" title="${s("Toggle Safe Areas")}"><i class="pi pi-stop"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-radar-overlay" data-role="overlay-radar-btn" title="${s("Toggle 2D Radar Mini-Map")}"><i class="pi pi-compass"></i></button>
        </div>
        <select class="vp-pill vp-pill-select vp-shading-select" data-role="shading-mode-select" title="${s("Viewport Shading Mode")}">
          <option value="omni_ref">Omni Ref</option>
          <option value="graybox">Graybox</option>
          <option value="textured">${s("Textured")}</option>
          <option value="wireframe">Wireframe</option>
          <option value="wireframe_texture">${s("Wireframe + Texture")}</option>
          <option value="grid">Grid</option>
          <option value="beauty">Beauty</option>
        </select>
        <select class="vp-pill vp-pill-select" data-role="label-mode" title="${s("Viewport Labels")}">
          <option value="off">${s("Labels: Off")}</option>
          <option value="selected">${s("Labels: Selected")}</option>
          <option value="all">${s("Labels: All")}</option>
        </select>
        <select class="vp-pill vp-pill-select" data-role="label-content" title="${s("Label content")}">
          <option value="annotation">${s("Annotation")}</option>
          <option value="name">${s("Object Name")}</option>
          <option value="tag">${s("Primary Tag")}</option>
        </select>
        <span class="vp-zoom" data-role="viewport-zoom" title="${s("Viewport zoom")}">1.00x</span>
        <button class="vp-tool" data-act="toggle-fullscreen" title="${s("Toggle Fullscreen Viewport")}"><i class="pi pi-window-maximize"></i></button>
      </div>

      ${Fm()}

      <svg class="vp-axis" data-role="viewport-axis" viewBox="0 0 52 52" width="52" height="52"
           aria-label="${s("World axis navigation")}" role="group">
        <circle data-axis-center cx="26" cy="26" r="4" tabindex="0" role="button" aria-label="${s("Frame selection")}"></circle>
      </svg>

      <span class="vp-state" data-role="viewport-state"></span>
      <div class="vp-floating-transport" data-role="floating-transport" hidden>
        <button type="button" class="ft-btn" data-act="ft-step-back" title="${s("Previous Keyframe")}"><i class="pi pi-step-backward"></i></button>
        <button type="button" class="ft-btn ft-play" data-act="ft-toggle-play" title="${s("Play / Pause (Space)")}"><i class="pi pi-play" data-role="ft-play-icon"></i></button>
        <button type="button" class="ft-btn" data-act="ft-step-forward" title="${s("Next Keyframe")}"><i class="pi pi-step-forward"></i></button>
        <span class="ft-time" data-role="ft-timecode">00:00:00:00</span>
        <span class="ft-frame" data-role="ft-frame">F0</span>
        <button type="button" class="ft-btn" data-act="ft-add-key" title="${s("Add Keyframe (I)")}"><i class="pi pi-key"></i></button>
      </div>
      <div class="vp-hint">${s("Orbit: MMB · Pan: Shift+MMB · Dolly: Scroll · Fly: WASD / QE")}</div>
    </div>`;
}
function zs() {
  const e = document.createElement("div");
  e.className = "majoor-omnicam", e.innerHTML = `
    <style>${sm}</style>
    ${im()}
    ${zm()}
    <div class="oc-body">
      ${vm()}
      <div class="oc-resize-h oc-left-resize" data-role="left-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${s("Drag to resize the scene panel — double-click to reset")}" aria-label="${s("Resize scene panel")}"></div>
      <div class="oc-stage">${Km()}</div>
      <div class="oc-resize-h oc-side-resize" data-role="side-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${s("Drag to resize the side panel — double-click to reset")}" aria-label="${s("Resize side panel")}"></div>
      ${_m()}
    </div>
    ${Mm()}
    ${cm()}`;
  const t = document.createElement("div");
  return t.className = "context-menu", t.dataset.role = "context-menu", t.setAttribute("role", "menu"), t.hidden = !0, e.appendChild(t), e;
}
const at = 1, bn = 50, Ie = 120, gt = 160, Bm = Object.freeze(["perspective", "orthographic"]), W = Object.freeze({
  ASSET_INSTANTIATE: "asset.instantiate",
  CAMERA_CREATE: "camera.create",
  CAMERA_DUPLICATE: "camera.duplicate",
  CAMERA_DELETE: "camera.delete",
  CAMERA_RENAME: "camera.rename",
  CAMERA_SET_ACTIVE: "camera.set_active",
  CAMERA_SET_LOCKED: "camera.set_locked",
  CAMERA_SET_PLAYBLAST: "camera.set_playblast",
  CAMERA_TRANSFORM: "camera.transform",
  CAMERA_LOOK_AT: "camera.look_at",
  OBJECT_CREATE: "object.create",
  OBJECT_DUPLICATE: "object.duplicate",
  OBJECT_DELETE: "object.delete",
  OBJECT_RENAME: "object.rename",
  OBJECT_SET_PARENT: "object.set_parent",
  OBJECT_TRANSFORM: "object.transform",
  OBJECT_SET_ENABLED: "object.set_enabled",
  OBJECT_SET_LOCKED: "object.set_locked",
  OBJECT_SET_TAGS: "object.set_tags",
  OBJECT_SET_ANNOTATION: "object.set_annotation",
  CHARACTER_SET_POSE: "character.set_pose",
  CHARACTER_SET_JOINT_ROTATION: "character.set_joint_rotation",
  CHARACTER_SET_MOTION: "character.set_motion",
  CHARACTER_CLEAR_MOTION: "character.clear_motion",
  KEYFRAME_UPSERT: "keyframe.upsert",
  KEYFRAME_REMOVE: "keyframe.remove",
  KEYFRAME_SET_INTERPOLATION: "keyframe.set_interpolation",
  TIMELINE_SET_RANGE: "timeline.set_range",
  TIMELINE_SET_DURATION: "timeline.set_duration",
  CUT_UPSERT: "cut.upsert",
  CUT_REMOVE: "cut.remove",
  CUT_SET_CAMERA: "cut.set_camera"
}), Fs = Object.freeze(Object.values(W)), ke = Object.freeze({
  SCENE_GET: "scene.get",
  SCENE_SUMMARY: "scene.summary",
  ASSET_LIST: "asset.list",
  ASSET_GET: "asset.get",
  CAMERA_GET: "camera.get",
  CAMERA_LIST: "camera.list",
  TIMELINE_GET: "timeline.get",
  SELECTION_GET: "selection.get",
  HEALTH_GET: "health.get",
  CHARACTER_GET_RIG: "character.get_rig",
  CHARACTER_GET_POSE: "character.get_pose",
  CHARACTER_LIST: "character.list",
  OBJECT_LIST: "object.list",
  OBJECT_GET: "object.get",
  OBJECT_SEARCH: "object.search",
  SHOT_LIST: "shot.list",
  KEYFRAME_LIST: "keyframe.list"
}), qm = Object.freeze(Object.values(ke));
class O extends Error {
  constructor(t, a, o = null, r = null) {
    super(a), this.name = "DirectorApiError", this.code = t, this.operationIndex = o, this.details = r;
  }
}
const Um = 25, gn = 100;
function yt(e, t) {
  const a = e?.offset === void 0 ? 0 : Number(e.offset), o = e?.limit === void 0 ? Um : Number(e.limit);
  if (!Number.isInteger(a) || a < 0)
    throw new O(
      "BAD_QUERY",
      "offset must be a non-negative integer"
    );
  if (!Number.isInteger(o) || o < 1 || o > gn)
    throw new O(
      "BAD_QUERY",
      `limit must be between 1 and ${gn}`
    );
  return {
    offset: a,
    limit: o,
    end: Math.min(t, a + o)
  };
}
function Qo(e) {
  return {
    id: e.id,
    name: e.name || e.id,
    type: e.type || null,
    asset_id: e.asset_id || null,
    asset_kind: e.asset_kind || null,
    tags: Array.isArray(e.tags) ? [...e.tags] : [],
    enabled: e.enabled !== !1,
    locked: !!e.locked,
    parent_id: e.parent_id || null,
    position: Array.isArray(e.position) ? [...e.position] : [0, 0, 0]
  };
}
function Wm(e) {
  return {
    id: e.id,
    name: e.name || e.id,
    color: e.color || null,
    locked: !!e.locked,
    muted: !!e.muted,
    solo: !!e.solo,
    target_object_id: e.target_object_id || null,
    keyframe_count: Array.isArray(e.keyframes) ? e.keyframes.length : 0
  };
}
function Qe(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Vm(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function je(e, t) {
  return {
    ...t,
    revision: Vm(e)
  };
}
function Hm(e, t) {
  const a = e.state || {};
  switch (t?.type) {
    case ke.SCENE_GET:
      return je(e, {
        version: 1,
        type: t.type,
        scene: Qe({
          duration_frames: a.duration_frames,
          fps: a.fps,
          width: a.width,
          height: a.height,
          cameras: a.cameras || [],
          active_camera_id: a.active_camera_id,
          objects: a.objects || [],
          cuts: a.sequence?.cuts || a.cuts || [],
          motion_layers: a.motion_layers || [],
          metadata: a.metadata || {}
        })
      });
    case ke.SCENE_SUMMARY: {
      const o = a.objects || [], r = a.sequence?.cuts || a.cuts || [];
      return je(e, {
        version: 1,
        type: t.type,
        summary: {
          duration_frames: a.duration_frames,
          fps: a.fps,
          width: a.width,
          height: a.height,
          camera_count: (a.cameras || []).length,
          object_count: o.length,
          character_count: o.filter((n) => n.asset_kind === "character").length,
          shot_count: r.length,
          motion_layer_count: (a.motion_layers || []).length,
          active_camera_id: a.active_camera_id || null,
          playblast_camera_id: a.playblast_camera_id || null
        }
      });
    }
    case ke.CAMERA_GET: {
      const o = t.cameraId || a.active_camera_id, r = (a.cameras || []).find((n) => n.id === o);
      if (!r) throw new O("UNKNOWN_CAMERA", `Unknown camera: ${o}`);
      return je(e, { version: 1, type: t.type, camera: Qe(r) });
    }
    case ke.CAMERA_LIST: {
      const o = a.cameras || [], { offset: r, limit: n, end: i } = yt(t, o.length);
      return je(e, {
        version: 1,
        type: t.type,
        items: o.slice(r, i).map(Wm),
        total: o.length,
        offset: r,
        limit: n
      });
    }
    case ke.TIMELINE_GET:
      return je(e, {
        version: 1,
        type: t.type,
        timeline: Qe({
          frame: e.frame ?? 0,
          duration_frames: a.duration_frames,
          fps: a.fps,
          playback_range: Array.isArray(a.playback_range) ? a.playback_range : null
        })
      });
    case ke.SELECTION_GET:
      return je(e, {
        version: 1,
        type: t.type,
        selection: {
          entity: e.selectedEntity ?? null,
          objectId: e.selectedObjectId ?? null,
          objectIds: [...e.selectedObjectIds || []],
          keyFrame: e.selectedKeyFrame ?? null
        }
      });
    case ke.HEALTH_GET:
      return je(e, {
        version: 1,
        type: t.type,
        frames: Ps(a.metadata, a.duration_frames)
      });
    case ke.ASSET_LIST: {
      const o = t.kind ? String(t.kind) : null, r = (a.objects || []).filter((n) => n.asset_id && (!o || n.asset_kind === o)).map((n) => ({
        objectId: n.id,
        name: n.name || n.id,
        asset_id: n.asset_id,
        asset_kind: n.asset_kind || null,
        tags: Array.isArray(n.tags) ? [...n.tags] : [],
        position: Array.isArray(n.position) ? [...n.position] : [0, 0, 0],
        is_character: n.asset_kind === "character",
        has_motion: !!n.character?.motion
      }));
      return je(e, { version: 1, type: t.type, items: Qe(r), total: r.length });
    }
    case ke.ASSET_GET: {
      const o = (a.objects || []).find((r) => r.id === t.objectId);
      if (!o) throw new O("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return je(e, {
        version: 1,
        type: t.type,
        asset: Qe({
          objectId: o.id,
          name: o.name || o.id,
          type: o.type,
          asset: o.asset || null,
          asset_id: o.asset_id || null,
          asset_kind: o.asset_kind || null,
          tags: Array.isArray(o.tags) ? o.tags : [],
          annotation: o.annotation || null,
          character: o.character || null,
          position: o.position || [0, 0, 0],
          rotation: o.rotation || [0, 0, 0],
          size: o.size || [1, 1, 1]
        })
      });
    }
    case ke.CHARACTER_GET_RIG: {
      const o = (a.objects || []).find((n) => n.id === t.objectId);
      if (!o) throw new O("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const r = o.character || null;
      return je(e, {
        version: 1,
        type: t.type,
        rig: Qe({
          objectId: o.id,
          asset_id: o.asset_id || null,
          asset_kind: o.asset_kind || null,
          is_character: o.asset_kind === "character",
          rig_profile: r?.rig_profile || null,
          pose_preset: r?.pose?.preset_id || null,
          has_motion: !!r?.motion
        })
      });
    }
    case ke.CHARACTER_GET_POSE: {
      const o = (a.objects || []).find((n) => n.id === t.objectId);
      if (!o) throw new O("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const r = o.character?.pose || {};
      return je(e, {
        version: 1,
        type: t.type,
        pose: Qe({
          objectId: o.id,
          preset_id: r.preset_id || "neutral",
          root_offset: Array.isArray(r.root_offset) ? r.root_offset : [0, 0, 0],
          joints: r.joints || {},
          has_motion: !!o.character?.motion
        })
      });
    }
    case ke.OBJECT_LIST: {
      const o = a.objects || [], { offset: r, limit: n, end: i } = yt(t, o.length);
      return je(e, {
        version: 1,
        type: t.type,
        items: o.slice(r, i).map(Qo),
        total: o.length,
        offset: r,
        limit: n
      });
    }
    case ke.OBJECT_GET: {
      const o = (a.objects || []).find((r) => r.id === t.objectId);
      if (!o) throw new O("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return je(e, {
        version: 1,
        type: t.type,
        object: Qe({
          id: o.id,
          name: o.name || o.id,
          type: o.type,
          asset: o.asset || null,
          asset_id: o.asset_id || null,
          asset_kind: o.asset_kind || null,
          tags: Array.isArray(o.tags) ? o.tags : [],
          enabled: o.enabled !== !1,
          locked: !!o.locked,
          parent_id: o.parent_id || null,
          annotation: o.annotation || null,
          character: o.character || null,
          position: o.position || [0, 0, 0],
          rotation: o.rotation || [0, 0, 0],
          size: o.size || [1, 1, 1]
        })
      });
    }
    case ke.OBJECT_SEARCH: {
      const o = String(t.text || "").trim().toLowerCase(), r = Array.isArray(t.tags) ? t.tags.map((h) => String(h).toLowerCase()) : [], n = t.asset_kind !== void 0 ? t.asset_kind : null, i = t.type_ !== void 0 ? t.type_ : t.objectType !== void 0 ? t.objectType : null, c = typeof t.enabled == "boolean" ? t.enabled : null, l = (h) => {
        if (o && ![h.id, h.name || "", ...Array.isArray(h.tags) ? h.tags : []].map((b) => String(b).toLowerCase()).some((b) => b.includes(o)))
          return !1;
        if (r.length) {
          const u = (Array.isArray(h.tags) ? h.tags : []).map((b) => String(b).toLowerCase());
          if (!r.every((b) => u.includes(b))) return !1;
        }
        return !(n !== null && h.asset_kind !== n || i !== null && h.type !== i || c !== null && h.enabled !== !1 !== c);
      }, p = (a.objects || []).filter(l), { offset: m, limit: f, end: d } = yt(t, p.length);
      return je(e, {
        version: 1,
        type: t.type,
        items: p.slice(m, d).map(Qo),
        total: p.length,
        offset: m,
        limit: f
      });
    }
    case ke.CHARACTER_LIST: {
      const o = (a.objects || []).filter((c) => c.asset_kind === "character"), { offset: r, limit: n, end: i } = yt(t, o.length);
      return je(e, {
        version: 1,
        type: t.type,
        items: o.slice(r, i).map((c) => ({
          ...Qo(c),
          has_motion: !!c.character?.motion,
          pose_preset: c.character?.pose?.preset_id || null
        })),
        total: o.length,
        offset: r,
        limit: n
      });
    }
    case ke.SHOT_LIST: {
      const o = a.sequence?.cuts || a.cuts || [], r = Math.max(0, (a.duration_frames || 1) - 1), n = o.map((p, m) => ({
        index: m,
        start: p.start,
        end: m + 1 < o.length ? o[m + 1].start - 1 : r,
        camera_id: p.camera_id
      })), { offset: i, limit: c, end: l } = yt(t, n.length);
      return je(e, {
        version: 1,
        type: t.type,
        items: n.slice(i, l),
        total: n.length,
        offset: i,
        limit: c
      });
    }
    case ke.KEYFRAME_LIST: {
      const o = t.cameraId || a.active_camera_id, r = (a.cameras || []).find((p) => p.id === o);
      if (!r) throw new O("UNKNOWN_CAMERA", `Unknown camera: ${o}`);
      const n = r.keyframes || [], { offset: i, limit: c, end: l } = yt(t, n.length);
      return je(e, {
        version: 1,
        type: t.type,
        cameraId: r.id,
        items: n.slice(i, l).map((p) => ({
          frame: p.frame,
          interpolation: p.interpolation,
          position: Array.isArray(p.camera?.position) ? [...p.camera.position] : [0, 0, 0]
        })),
        total: n.length,
        offset: i,
        limit: c
      });
    }
    default:
      throw new O("UNKNOWN_QUERY", `Unsupported query: ${t?.type}`);
  }
}
const Rs = /* @__PURE__ */ new Set([
  "cube",
  "sphere",
  "cylinder",
  "torus",
  "pyramid",
  "ground",
  "human",
  "card",
  "null",
  "sun_light",
  "point_light",
  "spot_light"
]);
function Bo(e, t, a = "") {
  const o = String(a || "").trim().replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120);
  if (o) {
    if (e.has(o))
      throw new O("DUPLICATE_ID", `${o} already exists`);
    return o;
  }
  let r = 1, n = `${t}_${r}`;
  for (; e.has(n); )
    r += 1, n = `${t}_${r}`;
  return n;
}
function Gm(e) {
  const t = e === "ground", a = e === "human", o = e === "card", r = e === "sun_light", n = e === "point_light", i = e === "spot_light";
  let c;
  t ? c = [12, 0.1, 12] : a ? c = [0.7, 1.8, 0.4] : o ? c = [2, 3] : c = [1.5, 1.5, 1.5];
  let l = [0, 0, 0], p = [0, 0, 0], m = "#8c929b", f, d, h, u;
  return r ? (l = [5, 8.5, 4], p = [-55, 35, 0], m = "#fff6ec", f = 2.2, d = !0) : n ? (l = [0, 3, 0], m = "#ffffff", f = 2, d = !1) : i && (l = [0, 4, 0], p = [-60, 0, 0], m = "#ffffff", f = 3, h = 45, u = 0.25, d = !0), {
    position: l,
    rotation: p,
    size: c,
    color: m,
    material_mode: t ? "checker" : "textured",
    ...f !== void 0 ? { intensity: f } : {},
    ...d !== void 0 ? { cast_shadow: d } : {},
    ...h !== void 0 ? { cone_angle: h } : {},
    ...u !== void 0 ? { penumbra: u } : {}
  };
}
function Ym(e, t) {
  e.cameras ||= [];
  const a = new Set(e.cameras.map((i) => i.id)), o = Bo(a, "camera", t.id), r = { ...Ar(), ...t.camera || {} }, n = {
    id: o,
    name: t.name || o,
    color: "#4aa3ef",
    locked: !1,
    muted: !1,
    solo: !1,
    camera: r,
    keyframes: [{ frame: 0, camera: ce(r), interpolation: t.interpolation || "ease" }]
  };
  return e.cameras.push(n), { cameraId: o };
}
function Xm(e, t) {
  const a = (e.cameras || []).find((i) => i.id === t.cameraId);
  if (!a) throw new O("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const o = new Set(e.cameras.map((i) => i.id)), r = Bo(o, "camera", t.id), n = JSON.parse(JSON.stringify(a));
  return n.id = r, n.name = t.name || `${a.name || a.id} copy`, e.cameras.push(n), { cameraId: r };
}
function Jm(e, t) {
  const a = e.cameras || [], o = a.findIndex((n) => n.id === t.cameraId);
  if (o === -1) throw new O("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  if (a.length <= 1) throw new O("LAST_CAMERA", "cannot delete the only camera");
  if (a[o].locked) throw new O("ENTITY_LOCKED", `${t.cameraId} is locked`);
  if ((e.sequence?.cuts || []).some((n) => n.camera_id === t.cameraId))
    throw new O("CAMERA_IN_USE", `${t.cameraId} is referenced by a cut`);
  return a.splice(o, 1), e.active_camera_id === t.cameraId && (e.active_camera_id = a[0].id), e.playblast_camera_id === t.cameraId && (e.playblast_camera_id = a[0].id), { cameraId: t.cameraId };
}
function Zm(e, t) {
  const a = (e.cameras || []).find((o) => o.id === t.cameraId);
  if (!a) throw new O("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return a.name = String(t.name || "").trim().slice(0, 80) || a.name, { cameraId: a.id };
}
function Qm(e, t) {
  const a = "__sequence__";
  if (t.cameraId === a) {
    if (!(e.sequence?.cuts || []).length)
      throw new O("NO_CUTS", "the sequence has no cuts to play back");
    return e.playblast_camera_id = a, { cameraId: a };
  }
  const o = (e.cameras || []).find((r) => r.id === t.cameraId);
  if (!o) throw new O("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return e.playblast_camera_id = o.id, { cameraId: o.id };
}
function ep(e, t) {
  if (!Rs.has(t.objectType))
    throw new O("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${t.objectType}`);
  e.objects ||= [];
  const a = new Set(e.objects.map((i) => i.id)), o = Bo(a, t.objectType, t.id), r = Gm(t.objectType), n = {
    id: o,
    type: t.objectType,
    name: t.name || o,
    ...r,
    ...t.position ? { position: [...t.position] } : {},
    ...t.rotation ? { rotation: [...t.rotation] } : {},
    keyframes: [],
    enabled: !0,
    locked: !1
  };
  return e.objects.push(n), { objectId: o };
}
function tp(e, t) {
  const a = (e.objects || []).find((l) => l.id === t.objectId);
  if (!a) throw new O("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const o = new Set(e.objects.map((l) => l.id)), r = Bo(o, a.type || "object", t.id), n = Array.isArray(t.offset) ? t.offset : [0.35, 0, 0.35], i = JSON.parse(JSON.stringify(a));
  i.id = r, i.name = t.name || `${a.name || a.id} copy`, i.locked = !1;
  const c = Array.isArray(a.position) ? a.position : [0, 0, 0];
  return i.position = [c[0] + n[0], c[1] + n[1], c[2] + n[2]], e.objects.push(i), { objectId: r, resourceRefresh: !!a.asset_id };
}
function ap(e, t) {
  const a = e.objects || [], o = a.findIndex((n) => n.id === t.objectId);
  if (o === -1) throw new O("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const r = a[o];
  if (r.id === "subject") throw new O("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (r.locked) throw new O("ENTITY_LOCKED", `${t.objectId} is locked`);
  for (const n of a)
    n.parent_id === t.objectId && (n.parent_id = null);
  return a.splice(o, 1), { objectId: t.objectId, resourceRefresh: !!r.asset_id };
}
function op(e, t) {
  const a = (e.objects || []).find((o) => o.id === t.objectId);
  if (!a) throw new O("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  return a.name = String(t.name || "").trim().slice(0, 80) || a.name, { objectId: a.id };
}
function rp(e, t) {
  const a = (e.objects || []).find((c) => c.id === t.objectId);
  if (!a) throw new O("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  if (t.parentId === null || t.parentId === void 0)
    return a.parent_id = null, { objectId: a.id };
  if (t.parentId === t.objectId)
    throw new O("INVALID_PARENT", "an object cannot be its own parent");
  const o = (e.objects || []).find((c) => c.id === t.parentId);
  if (!o) throw new O("UNKNOWN_OBJECT", `${t.parentId} does not exist`);
  const r = new Map(e.objects.map((c) => [c.id, c]));
  let n = o;
  const i = /* @__PURE__ */ new Set();
  for (; n; ) {
    if (n.id === t.objectId)
      throw new O("INVALID_PARENT", "assigning this parent would create a cycle");
    if (i.has(n.id)) break;
    i.add(n.id), n = n.parent_id ? r.get(n.parent_id) : null;
  }
  return a.parent_id = t.parentId, { objectId: a.id };
}
function np(e, t) {
  e.sequence ||= Er();
  const a = e.sequence.cuts ||= [], o = Math.max(0, (e.duration_frames || 1) - 1);
  if (!Number.isInteger(t.start) || t.start < 0 || t.start > o)
    throw new O("FRAME_OUT_OF_RANGE", `cut start must be within 0..${o}`);
  if (!(e.cameras || []).find((i) => i.id === t.cameraId)) throw new O("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const n = a.find((i) => i.start === t.start);
  return n ? n.camera_id = t.cameraId : a.push({ start: t.start, camera_id: t.cameraId }), a.sort((i, c) => i.start - c.start), e.sequence.enabled = !0, { start: t.start, cameraId: t.cameraId };
}
function sp(e, t) {
  e.sequence ||= Er();
  const a = e.sequence.cuts || [], o = a.findIndex((r) => r.start === t.start);
  if (o === -1) throw new O("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  return a.splice(o, 1), a.length && (a[0].start = 0), e.sequence.enabled = a.length > 0, { start: t.start };
}
function ip(e, t) {
  e.sequence ||= Er();
  const o = (e.sequence.cuts || []).find((n) => n.start === t.start);
  if (!o) throw new O("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  if (!(e.cameras || []).find((n) => n.id === t.cameraId)) throw new O("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return o.camera_id = t.cameraId, { start: t.start, cameraId: t.cameraId };
}
const cp = 2048;
function lp(e, t) {
  const a = e._directorApiTxIds ||= /* @__PURE__ */ new Set();
  for (a.has(t) && a.delete(t), a.add(t); a.size > cp; )
    a.delete(a.values().next().value);
}
function dp(e, t) {
  return !!e._directorApiTxIds?.has(t);
}
const dt = (e) => typeof e == "number" && Number.isFinite(e);
function Ae(e, t, a) {
  if (!Array.isArray(e) || e.length !== 3 || !e.every(dt))
    throw new O("BAD_VECTOR", `${t} must be [x,y,z] of finite numbers`, a);
}
function qe(e, t, a) {
  if (!Number.isInteger(e) || e < 0)
    throw new O("BAD_FRAME", `${t} must be a non-negative integer frame`, a);
}
function oe(e, t, a, o) {
  if (typeof e != "string" || e.length === 0)
    throw new O("BAD_ID", `${t} must be a non-empty string`, a);
  if (o !== void 0 && e.length > o)
    throw new O("BAD_ID", `${t} exceeds ${o} characters`, a);
}
function Kt(e, t, a) {
  if (!dt(e))
    throw new O("BAD_VALUE", `${t} must be a finite number`, a);
}
const mp = /* @__PURE__ */ new Set([
  "position",
  "target",
  "up",
  "fov",
  "roll",
  "zoom",
  "near",
  "far",
  "camera_type"
]);
function pp(e, t) {
  for (const a of Object.keys(e))
    if (!mp.has(a))
      throw new O("BAD_VALUE", `camera.create: unsupported camera field "${a}"`, t);
  if (e.position !== void 0 && Ae(e.position, "camera.position", t), e.target !== void 0 && Ae(e.target, "camera.target", t), e.up !== void 0 && Ae(e.up, "camera.up", t), e.fov !== void 0 && (Kt(e.fov, "camera.fov", t), e.fov < 1 || e.fov > 179))
    throw new O("BAD_VALUE", "camera.fov must be within 1..179", t);
  if (e.roll !== void 0 && Kt(e.roll, "camera.roll", t), e.zoom !== void 0 && (Kt(e.zoom, "camera.zoom", t), e.zoom <= 0))
    throw new O("BAD_VALUE", "camera.zoom must be > 0", t);
  if (e.near !== void 0 && (Kt(e.near, "camera.near", t), e.near <= 0))
    throw new O("BAD_VALUE", "camera.near must be > 0", t);
  if (e.far !== void 0) {
    Kt(e.far, "camera.far", t);
    const a = e.near === void 0 ? Ii : e.near;
    if (e.far <= a)
      throw new O("BAD_VALUE", "camera.far must be greater than camera.near", t);
  }
  if (e.camera_type !== void 0 && !Bm.includes(e.camera_type))
    throw new O("BAD_VALUE", `Unsupported camera_type: ${e.camera_type}`, t);
}
function fp(e, t) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new O("BAD_OPERATION", "operation must be an object", t);
  const { type: a } = e;
  if (!Fs.includes(a))
    throw new O("UNKNOWN_OPERATION", `Unknown operation type: ${a}`, t);
  switch (a) {
    case W.ASSET_INSTANTIATE: {
      const o = e.asset;
      if (!o || typeof o != "object" || Array.isArray(o))
        throw new O("BAD_VALUE", "asset.instantiate needs a resolved asset object", t);
      if (oe(o.id, "asset.id", t), oe(o.kind, "asset.kind", t), String(o.id).length > 120 || String(o.kind).length > 32)
        throw new O("BAD_VALUE", "asset.id / asset.kind exceed their bounds", t);
      if (o.tags !== void 0 && (!Array.isArray(o.tags) || o.tags.length > 32))
        throw new O("BAD_VALUE", "asset.tags must be a list of at most 32", t);
      if (o.animations !== void 0 && (!Array.isArray(o.animations) || o.animations.length > 256))
        throw new O("BAD_VALUE", "asset.animations must be a list of at most 256", t);
      if (o.rig !== void 0 && o.rig !== null) {
        if (typeof o.rig != "object" || Array.isArray(o.rig))
          throw new O("BAD_VALUE", "asset.rig must be an object", t);
        if (o.rig.bone_map && Object.keys(o.rig.bone_map).length > 128)
          throw new O("BAD_VALUE", "asset.rig.bone_map exceeds 128 entries", t);
      }
      e.point !== void 0 && Ae(e.point, "point", t), e.id !== void 0 && oe(e.id, "id", t);
      break;
    }
    case W.CAMERA_SET_ACTIVE:
      oe(e.cameraId, "cameraId", t);
      break;
    case W.CAMERA_SET_LOCKED:
      if (oe(e.cameraId, "cameraId", t), typeof e.value != "boolean")
        throw new O("BAD_VALUE", "camera.set_locked needs a boolean value", t);
      break;
    case W.CAMERA_CREATE:
      if (e.id !== void 0 && oe(e.id, "id", t, Ie), e.name !== void 0 && oe(e.name, "name", t, gt), e.camera !== void 0) {
        if (typeof e.camera != "object" || Array.isArray(e.camera) || e.camera === null)
          throw new O("BAD_VALUE", "camera.create camera must be an object", t);
        pp(e.camera, t);
      }
      if (e.interpolation !== void 0 && !Co.includes(e.interpolation))
        throw new O("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case W.CAMERA_DUPLICATE:
      oe(e.cameraId, "cameraId", t, Ie), e.id !== void 0 && oe(e.id, "id", t, Ie), e.name !== void 0 && oe(e.name, "name", t, gt);
      break;
    case W.CAMERA_DELETE:
    case W.CAMERA_SET_PLAYBLAST:
      oe(e.cameraId, "cameraId", t, Ie);
      break;
    case W.CAMERA_RENAME:
      oe(e.cameraId, "cameraId", t, Ie), oe(e.name, "name", t, gt);
      break;
    case W.OBJECT_CREATE:
      if (oe(e.objectType, "objectType", t), !Rs.has(e.objectType))
        throw new O("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`, t);
      if (e.asset !== void 0 || e.url !== void 0 || e.path !== void 0)
        throw new O("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", t);
      e.id !== void 0 && oe(e.id, "id", t, Ie), e.name !== void 0 && oe(e.name, "name", t, gt), e.position !== void 0 && Ae(e.position, "position", t), e.rotation !== void 0 && Ae(e.rotation, "rotation", t);
      break;
    case W.OBJECT_DUPLICATE:
      oe(e.objectId, "objectId", t, Ie), e.id !== void 0 && oe(e.id, "id", t, Ie), e.name !== void 0 && oe(e.name, "name", t, gt), e.offset !== void 0 && Ae(e.offset, "offset", t);
      break;
    case W.OBJECT_DELETE:
      oe(e.objectId, "objectId", t, Ie);
      break;
    case W.OBJECT_RENAME:
      oe(e.objectId, "objectId", t, Ie), oe(e.name, "name", t, gt);
      break;
    case W.OBJECT_SET_PARENT:
      oe(e.objectId, "objectId", t, Ie), e.parentId !== null && e.parentId !== void 0 && oe(e.parentId, "parentId", t, Ie);
      break;
    case W.CAMERA_TRANSFORM:
      if (e.cameraId !== void 0 && oe(e.cameraId, "cameraId", t), e.position !== void 0 && Ae(e.position, "position", t), e.target !== void 0 && Ae(e.target, "target", t), e.frame !== void 0 && qe(e.frame, "frame", t), e.position === void 0 && e.target === void 0)
        throw new O("EMPTY_OPERATION", "camera.transform needs position and/or target", t);
      break;
    case W.CAMERA_LOOK_AT:
      if (e.cameraId !== void 0 && oe(e.cameraId, "cameraId", t), e.point !== void 0 && Ae(e.point, "point", t), e.objectId !== void 0 && e.objectId !== null && oe(e.objectId, "objectId", t), e.point === void 0 && e.objectId === void 0)
        throw new O("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", t);
      break;
    case W.OBJECT_TRANSFORM:
      if (oe(e.objectId, "objectId", t), e.position !== void 0 && Ae(e.position, "position", t), e.rotation !== void 0 && Ae(e.rotation, "rotation", t), e.scale !== void 0 && Ae(e.scale, "scale", t), e.position === void 0 && e.rotation === void 0 && e.scale === void 0)
        throw new O("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", t);
      break;
    case W.OBJECT_SET_ENABLED:
    case W.OBJECT_SET_LOCKED:
      if (oe(e.objectId, "objectId", t), typeof e.value != "boolean")
        throw new O("BAD_VALUE", `${a} needs a boolean value`, t);
      break;
    case W.OBJECT_SET_TAGS:
      if (oe(e.objectId, "objectId", t), !Array.isArray(e.tags) || e.tags.some((o) => typeof o != "string"))
        throw new O("BAD_VALUE", "object.set_tags needs a string array", t);
      if (e.tags.length > 64)
        throw new O("BAD_VALUE", "object.set_tags: too many tags", t);
      break;
    case W.OBJECT_SET_ANNOTATION:
      if (oe(e.objectId, "objectId", t), e.annotation !== null && (typeof e.annotation != "object" || Array.isArray(e.annotation)))
        throw new O("BAD_VALUE", "object.set_annotation needs an object or null", t);
      break;
    case W.CHARACTER_SET_POSE:
      if (oe(e.objectId, "objectId", t), e.pose !== null && (typeof e.pose != "object" || Array.isArray(e.pose)))
        throw new O("BAD_VALUE", "character.set_pose needs a pose object or null", t);
      break;
    case W.CHARACTER_SET_JOINT_ROTATION:
      if (oe(e.objectId, "objectId", t), oe(e.joint, "joint", t), !Array.isArray(e.rotation) || e.rotation.length !== 4 || !e.rotation.every(dt))
        throw new O("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", t);
      break;
    case W.CHARACTER_SET_MOTION: {
      oe(e.objectId, "objectId", t);
      const o = e.motion;
      if (!o || typeof o != "object" || Array.isArray(o))
        throw new O("BAD_VALUE", "character.set_motion needs a motion object", t);
      oe(o.clip_id, "motion.clip_id", t);
      for (const r of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (o[r] !== void 0 && !dt(o[r]))
          throw new O("BAD_VALUE", `motion.${r} must be a finite number`, t);
      if (dt(o.start_frame) && dt(o.end_frame) && o.end_frame > 0 && o.end_frame <= o.start_frame)
        throw new O("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", t);
      break;
    }
    case W.CHARACTER_CLEAR_MOTION:
      oe(e.objectId, "objectId", t);
      break;
    case W.KEYFRAME_UPSERT:
      if (e.cameraId !== void 0 && oe(e.cameraId, "cameraId", t), qe(e.frame, "frame", t), e.interpolation !== void 0 && !Co.includes(e.interpolation))
        throw new O("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      if (e.camera !== void 0) {
        if (!e.camera || typeof e.camera != "object")
          throw new O("BAD_VALUE", "keyframe.upsert camera must be an object", t);
        e.camera.position !== void 0 && Ae(e.camera.position, "camera.position", t), e.camera.target !== void 0 && Ae(e.camera.target, "camera.target", t);
        for (const o of ["fov", "roll", "zoom", "near", "far"])
          if (e.camera[o] !== void 0 && !dt(e.camera[o]))
            throw new O("BAD_VALUE", `camera.${o} must be finite`, t);
      }
      break;
    case W.KEYFRAME_REMOVE:
      e.cameraId !== void 0 && oe(e.cameraId, "cameraId", t), qe(e.frame, "frame", t);
      break;
    case W.KEYFRAME_SET_INTERPOLATION:
      if (e.cameraId !== void 0 && oe(e.cameraId, "cameraId", t), qe(e.frame, "frame", t), !Co.includes(e.interpolation))
        throw new O("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case W.TIMELINE_SET_RANGE:
      if (qe(e.start, "start", t), qe(e.end, "end", t), e.end < e.start)
        throw new O("BAD_RANGE", "range end is before start", t);
      break;
    case W.TIMELINE_SET_DURATION:
      if (!Number.isInteger(e.frames) || e.frames < 1)
        throw new O("BAD_VALUE", "timeline.set_duration needs frames >= 1", t);
      break;
    case W.CUT_UPSERT:
      qe(e.start, "start", t), oe(e.cameraId, "cameraId", t);
      break;
    case W.CUT_REMOVE:
      qe(e.start, "start", t);
      break;
    case W.CUT_SET_CAMERA:
      qe(e.start, "start", t), oe(e.cameraId, "cameraId", t);
      break;
    default:
      throw new O("UNKNOWN_OPERATION", `Unknown operation type: ${a}`, t);
  }
}
function hp(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new O("BAD_TRANSACTION", "transaction must be an object");
  if (t.version !== at)
    throw new O("UNSUPPORTED_VERSION", `Unsupported API version: ${t.version}`);
  if (typeof t.id != "string" || t.id.length === 0)
    throw new O("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  if (dp(e, t.id))
    throw new O("DUPLICATE_TRANSACTION_ID", `transaction id already used: ${t.id}`);
  if (typeof t.description != "string" || t.description.trim().length === 0)
    throw new O("EMPTY_DESCRIPTION", "transaction description must not be empty");
  if (t.baseRevision !== void 0 && (!Number.isInteger(t.baseRevision) || t.baseRevision < 0))
    throw new O(
      "BAD_REVISION",
      "baseRevision must be a non-negative integer"
    );
  if (!Array.isArray(t.operations))
    throw new O("BAD_OPERATIONS", "operations must be an array");
  if (t.operations.length === 0)
    throw new O("NO_OPERATIONS", "transaction has no operations");
  if (t.operations.length > bn)
    throw new O(
      "TOO_MANY_OPERATIONS",
      `transaction has ${t.operations.length} operations (max ${bn})`
    );
  return t.operations.forEach((a, o) => fp(a, o)), {
    version: at,
    id: t.id,
    baseRevision: t.baseRevision,
    description: t.description.trim(),
    operations: t.operations,
    validateOnly: t.validateOnly === !0
  };
}
const T = Object.freeze({
  viewport: 1,
  previews: 2,
  timeline: 4,
  inspector: 8,
  outliner: 16,
  motion: 32,
  status: 64,
  all: 127
});
function up(e = 0, t = 0) {
  return (e | t) >>> 0;
}
function vt(e, t) {
  return (e & t) !== 0;
}
const bp = "omnicam/library", gp = "majoor_omnicam/blockout_library", yp = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null"
});
function vp(e, t) {
  if (!Array.isArray(e) || e.length < 3) return [...t];
  const a = e.slice(0, 3).map((o) => Number(o));
  return a.every((o) => Number.isFinite(o)) ? a : [...t];
}
function Ds(e) {
  return e.file ? `${e.source === "legacy" ? gp : bp}/${e.file} [input]` : "";
}
function yn(e, t, a) {
  const o = e || "asset";
  let r = `${o}_${a}`, n = 2;
  for (; t && t.has(r); ) r = `${o}_${a}_${n++}`;
  return r;
}
function xp(e) {
  return {
    rig_profile: !!(e.rig && Object.keys(e.rig.bone_map || {}).length) ? e.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null
  };
}
function wp(e, t = {}) {
  if (!e || typeof e != "object" || !e.id)
    throw new Error("compileInstance: an AssetDefinition is required");
  const a = vp(t.point, [0, 0, 0]), o = String(t.idSeed || Date.now().toString(36)), r = String(e.kind || "prop"), n = r === "character", i = yp[e.id];
  if (r === "helper" && !e.file && i && i !== "null")
    return {
      id: yn(i, t.existingIds, o),
      type: i,
      name: e.name || i,
      position: a,
      rotation: [0, 0, 0],
      size: [...e.base_size || [1, 1, 1]],
      keyframes: [],
      enabled: !0,
      asset_id: e.id,
      asset_kind: r,
      tags: [...e.tags || []]
    };
  const c = {
    id: yn(r === "character" ? "character" : r, t.existingIds, o),
    type: "glb",
    // `type` stays "glb" for legacy render compatibility; `format` drives which
    // three.js loader the viewport picks (a catalog FBX character needs
    // FBXLoader, not GLTFLoader).
    format: String(e.format || "glb").toLowerCase() === "fbx" ? "fbx" : "glb",
    name: e.name || e.id,
    position: a,
    rotation: [0, 0, 0],
    size: [1, 1, 1],
    keyframes: [],
    enabled: !0,
    asset: Ds(e),
    asset_id: e.id,
    asset_kind: r,
    tags: [...e.tags || []]
  };
  return n && (c.character = xp(e)), c;
}
function kp({ groundHit: e, orbitTarget: t } = {}) {
  return Array.isArray(e) && e.length >= 3 && e.every((a) => Number.isFinite(a)) ? e.slice(0, 3).map(Number) : Array.isArray(t) && t.length >= 3 && t.every((a) => Number.isFinite(a)) ? [Number(t[0]), 0, Number(t[2])] : [0, 0, 0];
}
function pr(e, t) {
  const a = t || e.active_camera_id, o = (e.cameras || []).find((r) => r.id === a);
  if (!o) throw new O("UNKNOWN_CAMERA", `${a} does not exist`);
  return o;
}
function fr(e, t) {
  const a = (e.objects || []).find((o) => o.id === t);
  if (!a) throw new O("UNKNOWN_OBJECT", `${t} does not exist`);
  return a;
}
function uo(e, t) {
  const a = lt(e, t);
  if (a.asset_kind !== "character")
    throw new O("NOT_A_CHARACTER", `${t} is not a character`);
  return a;
}
function xt(e, t) {
  const a = pr(e, t);
  if (a.locked)
    throw new O("ENTITY_LOCKED", `${a.id} is locked`);
  return a;
}
function lt(e, t) {
  const a = fr(e, t);
  if (a.locked)
    throw new O("ENTITY_LOCKED", `${a.id} is locked`);
  return a;
}
function vn(e) {
  return (!e.camera || typeof e.camera != "object") && (e.camera = {}), e.camera;
}
function bo(e, t) {
  return (e.keyframes || []).find((a) => a.frame === t) || null;
}
const Sp = {
  [W.ASSET_INSTANTIATE](e, t) {
    const a = new Set((e.objects || []).map((r) => r.id));
    let o;
    try {
      o = wp(t.asset, { point: t.point, idSeed: t.id, existingIds: a });
    } catch (r) {
      throw new O("BAD_ASSET", `asset.instantiate could not compile: ${r.message}`);
    }
    return (e.objects ||= []).push(o), {
      dirtyMask: T.viewport | T.previews | T.outliner | T.inspector,
      outcome: { objectId: o.id, assetId: o.asset_id || null }
    };
  },
  [W.CAMERA_SET_ACTIVE](e, t) {
    return pr(e, t.cameraId), e.active_camera_id = t.cameraId, { dirtyMask: T.viewport | T.previews | T.inspector | T.outliner | T.timeline };
  },
  [W.CAMERA_SET_LOCKED](e, t) {
    return pr(e, t.cameraId).locked = t.value, { dirtyMask: T.outliner | T.inspector | T.viewport };
  },
  [W.CAMERA_CREATE](e, t) {
    const a = Ym(e, t);
    return { dirtyMask: T.outliner | T.inspector | T.viewport | T.previews | T.timeline, outcome: a };
  },
  [W.CAMERA_DUPLICATE](e, t) {
    const a = Xm(e, t);
    return { dirtyMask: T.outliner | T.inspector | T.viewport | T.previews | T.timeline, outcome: a };
  },
  [W.CAMERA_DELETE](e, t) {
    const a = Jm(e, t);
    return { dirtyMask: T.outliner | T.inspector | T.viewport | T.previews | T.timeline, outcome: a };
  },
  [W.CAMERA_RENAME](e, t) {
    xt(e, t.cameraId);
    const a = Zm(e, t);
    return { dirtyMask: T.outliner | T.inspector, outcome: a };
  },
  [W.CAMERA_SET_PLAYBLAST](e, t) {
    const a = Qm(e, t);
    return { dirtyMask: T.outliner | T.inspector | T.status, outcome: a };
  },
  [W.CAMERA_TRANSFORM](e, t) {
    const a = xt(e, t.cameraId), o = vn(a);
    if (t.position && (o.position = [...t.position]), t.target && (o.target = [...t.target]), Number.isInteger(t.frame)) {
      const r = bo(a, t.frame);
      if (!r) throw new O("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
      r.camera = { ...r.camera }, t.position && (r.camera.position = [...t.position]), t.target && (r.camera.target = [...t.target]);
    }
    return { dirtyMask: T.viewport | T.previews | T.inspector | T.timeline };
  },
  [W.CAMERA_LOOK_AT](e, t) {
    const a = xt(e, t.cameraId);
    if (t.objectId !== void 0 && (t.objectId === null || t.objectId === "" ? (a.target_object_id = null, a.id === e.active_camera_id && (e.target_object_id = null)) : (fr(e, t.objectId), a.target_object_id = t.objectId, a.id === e.active_camera_id && (e.target_object_id = t.objectId))), t.point) {
      const o = vn(a);
      o.target = [...t.point];
      for (const r of a.keyframes || [])
        r.camera = { ...r.camera, target: [...t.point] };
    }
    return { dirtyMask: T.viewport | T.previews | T.inspector | T.timeline };
  },
  [W.OBJECT_CREATE](e, t) {
    const a = ep(e, t);
    return { dirtyMask: T.viewport | T.previews | T.outliner | T.inspector, outcome: a };
  },
  [W.OBJECT_DUPLICATE](e, t) {
    const a = tp(e, t);
    return { dirtyMask: T.viewport | T.previews | T.outliner | T.inspector, outcome: a };
  },
  [W.OBJECT_DELETE](e, t) {
    const a = ap(e, t);
    return { dirtyMask: T.viewport | T.previews | T.outliner | T.inspector, outcome: a };
  },
  [W.OBJECT_RENAME](e, t) {
    lt(e, t.objectId);
    const a = op(e, t);
    return { dirtyMask: T.outliner | T.inspector, outcome: a };
  },
  [W.OBJECT_SET_PARENT](e, t) {
    lt(e, t.objectId);
    const a = rp(e, t);
    return { dirtyMask: T.viewport | T.outliner | T.inspector, outcome: a };
  },
  [W.OBJECT_TRANSFORM](e, t) {
    const a = lt(e, t.objectId);
    return t.position && (a.position = [...t.position]), t.rotation && (a.rotation = [...t.rotation]), t.scale && (a.size = [...t.scale]), { dirtyMask: T.viewport | T.previews | T.inspector };
  },
  [W.OBJECT_SET_ENABLED](e, t) {
    return lt(e, t.objectId).enabled = t.value, { dirtyMask: T.viewport | T.previews | T.outliner | T.inspector };
  },
  [W.OBJECT_SET_LOCKED](e, t) {
    return fr(e, t.objectId).locked = t.value, { dirtyMask: T.outliner | T.inspector };
  },
  [W.OBJECT_SET_TAGS](e, t) {
    const a = lt(e, t.objectId), o = Li(t.tags), r = o.length !== t.tags.length ? "some tags were dropped or normalised" : void 0;
    return o.length ? a.tags = o : delete a.tags, { dirtyMask: T.outliner | T.inspector | T.viewport, warning: r };
  },
  [W.OBJECT_SET_ANNOTATION](e, t) {
    const a = lt(e, t.objectId), o = t.annotation === null ? null : ns(t.annotation);
    if (t.annotation && !o)
      throw new O("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    return o ? a.annotation = o : delete a.annotation, { dirtyMask: T.viewport | T.outliner | T.inspector };
  },
  [W.CHARACTER_SET_POSE](e, t) {
    const a = uo(e, t.objectId);
    if (a.character?.motion)
      throw new O("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    return a.character = {
      ...a.character || {},
      pose: t.pose === null ? $o(null) : $o(t.pose)
    }, { dirtyMask: T.viewport | T.previews | T.inspector };
  },
  [W.CHARACTER_SET_JOINT_ROTATION](e, t) {
    const a = uo(e, t.objectId);
    if (a.character?.motion)
      throw new O("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    if (!Oi(t.rotation))
      throw new O("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    return a.character = {
      ...a.character || {},
      pose: Pi(a.character?.pose, t.joint, t.rotation)
    }, { dirtyMask: T.viewport | T.previews | T.inspector };
  },
  [W.CHARACTER_SET_MOTION](e, t) {
    const a = uo(e, t.objectId), o = Tr(t.motion);
    if (!o) throw new O("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    const r = a.character?.pose || {};
    return a.character = {
      ...a.character || {},
      pose: { preset_id: r.preset_id || "neutral", root_offset: r.root_offset || [0, 0, 0], joints: {} },
      motion: o
    }, { dirtyMask: T.viewport | T.previews | T.timeline | T.inspector };
  },
  [W.CHARACTER_CLEAR_MOTION](e, t) {
    const a = uo(e, t.objectId);
    return a.character ? (a.character = { ...a.character, motion: null }, { dirtyMask: T.viewport | T.previews | T.timeline | T.inspector }) : { dirtyMask: 0 };
  },
  [W.KEYFRAME_UPSERT](e, t) {
    const a = xt(e, t.cameraId);
    if (t.frame >= (e.duration_frames || 0))
      throw new O("FRAME_OUT_OF_RANGE", `frame ${t.frame} is past the timeline`);
    a.keyframes ||= [];
    let o = bo(a, t.frame);
    const r = !o;
    if (!o) {
      const i = bo(a, 0)?.camera || a.camera || {};
      o = { frame: t.frame, camera: JSON.parse(JSON.stringify(i)), interpolation: "ease" }, a.keyframes.push(o), a.keyframes.sort((c, l) => c.frame - l.frame);
    }
    t.camera && (o.camera = { ...o.camera, ...JSON.parse(JSON.stringify(t.camera)) }), t.interpolation && (o.interpolation = t.interpolation);
    const n = r && !t.camera ? `keyframe at frame ${t.frame} was created from the existing pose (no "camera" given) -- it will not move the camera unless another keyframe with a different position/target exists` : void 0;
    return { dirtyMask: T.viewport | T.previews | T.timeline | T.inspector, warning: n };
  },
  [W.KEYFRAME_REMOVE](e, t) {
    const a = xt(e, t.cameraId), o = (a.keyframes || []).length;
    if (a.keyframes = (a.keyframes || []).filter((n) => n.frame !== t.frame), a.keyframes.length === o)
      throw new O("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    const r = a.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: T.viewport | T.previews | T.timeline | T.inspector, warning: r };
  },
  [W.KEYFRAME_SET_INTERPOLATION](e, t) {
    const a = xt(e, t.cameraId), o = bo(a, t.frame);
    if (!o) throw new O("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    if (!Co.includes(t.interpolation))
      throw new O("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`);
    return o.interpolation = t.interpolation, { dirtyMask: T.timeline | T.viewport | T.previews };
  },
  [W.TIMELINE_SET_RANGE](e, t) {
    const a = Math.max(0, (e.duration_frames || 1) - 1);
    if (t.start > a || t.end > a)
      throw new O("FRAME_OUT_OF_RANGE", `range must stay within 0..${a}`);
    return e.playback_range = [t.start, t.end], { dirtyMask: T.timeline | T.status };
  },
  [W.TIMELINE_SET_DURATION](e, t) {
    if (e.duration_frames = t.frames, Array.isArray(e.playback_range)) {
      const a = t.frames - 1;
      e.playback_range = [
        Math.min(e.playback_range[0], a),
        Math.min(e.playback_range[1], a)
      ];
    }
    return { dirtyMask: T.timeline | T.viewport | T.previews | T.status };
  },
  [W.CUT_UPSERT](e, t) {
    const a = np(e, t);
    return { dirtyMask: T.timeline | T.viewport | T.previews | T.status, outcome: a };
  },
  [W.CUT_REMOVE](e, t) {
    const a = sp(e, t);
    return { dirtyMask: T.timeline | T.viewport | T.previews | T.status, outcome: a };
  },
  [W.CUT_SET_CAMERA](e, t) {
    const a = ip(e, t);
    return { dirtyMask: T.timeline | T.viewport | T.previews | T.status, outcome: a };
  }
};
function jp({ state: e, operation: t }) {
  const a = Sp[t.type];
  if (!a) throw new O("UNKNOWN_OPERATION", `Unknown operation type: ${t.type}`);
  return a(e, t) || { dirtyMask: 0 };
}
const _p = 100;
function hr(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (Array.isArray(e) || Array.isArray(t))
    return !Array.isArray(e) || !Array.isArray(t) || e.length !== t.length ? !1 : e.every((a, o) => hr(a, t[o]));
  if (e && t && typeof e == "object") {
    const a = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)]);
    for (const o of a) if (!hr(e[o], t[o])) return !1;
    return !0;
  }
  return !1;
}
function ot(e) {
  return new Map((e || []).map((t) => [t.id, t]));
}
function Cp(e, t) {
  const a = [];
  let o = !1;
  const r = (n, i, c, l) => {
    if (!o && !hr(c, l)) {
      if (a.length >= _p) {
        o = !0;
        return;
      }
      a.push({ entity: n, field: i, before: c ?? null, after: l ?? null });
    }
  };
  return Ap(e, t, r), $p(e, t, r), Ip(e, t, r), Mp(e, t, r), Op(e, t, r), Pp(e, t, r), { changes: a, truncated: o };
}
const Ep = ["fov", "roll", "zoom", "near", "far", "camera_type"];
function Ap(e, t, a) {
  const o = ot(e?.cameras), r = ot(t?.cameras);
  for (const n of o.keys())
    r.has(n) || a(n, "camera", "present", null);
  for (const [n, i] of r) {
    const c = o.get(n);
    if (!c) {
      a(n, "camera", null, "present");
      continue;
    }
    a(n, "name", c.name, i.name), a(n, "locked", !!c.locked, !!i.locked), a(n, "muted", !!c.muted, !!i.muted), a(n, "solo", !!c.solo, !!i.solo), a(n, "target_object_id", c.target_object_id ?? null, i.target_object_id ?? null), a(n, "position", c.camera?.position, i.camera?.position), a(n, "target", c.camera?.target, i.camera?.target);
    for (const l of Ep)
      a(n, l, c.camera?.[l], i.camera?.[l]);
  }
}
const Tp = ["position", "target", "fov", "roll", "zoom", "near", "far", "camera_type"];
function $p(e, t, a) {
  const o = ot(e?.cameras), r = ot(t?.cameras);
  for (const [n, i] of r) {
    const c = o.get(n), l = new Map((c?.keyframes || []).map((f) => [f.frame, f])), p = new Map((i.keyframes || []).map((f) => [f.frame, f])), m = `${n}@keyframes`;
    for (const [f, d] of l)
      p.has(f) || a(m, `frame_${f}`, d.interpolation ?? "present", null);
    for (const [f, d] of p) {
      const h = l.get(f);
      if (!h) {
        a(m, `frame_${f}`, null, d.interpolation ?? "present");
        continue;
      }
      for (const u of Tp)
        a(m, `frame_${f}_${u}`, h.camera?.[u], d.camera?.[u]);
      a(m, `frame_${f}_interpolation`, h.interpolation, d.interpolation);
    }
  }
}
function Mp(e, t, a) {
  const o = ot(e?.objects), r = ot(t?.objects);
  for (const [n, i] of r) {
    const l = o.get(n)?.character?.pose?.joints || {}, p = i.character?.pose?.joints || {}, m = /* @__PURE__ */ new Set([...Object.keys(l), ...Object.keys(p)]);
    for (const f of m)
      a(`${n}#${f}`, "joint_rotation", l[f] ?? null, p[f] ?? null);
  }
}
function Ip(e, t, a) {
  const o = ot(e?.objects), r = ot(t?.objects);
  for (const [n] of o)
    r.has(n) || a(n, "object", "present", null);
  for (const [n, i] of r) {
    const c = o.get(n);
    if (!c) {
      a(n, "object", null, "present");
      continue;
    }
    a(n, "position", c.position, i.position), a(n, "rotation", c.rotation, i.rotation), a(n, "size", c.size, i.size), a(n, "name", c.name, i.name), a(n, "enabled", c.enabled !== !1, i.enabled !== !1), a(n, "locked", !!c.locked, !!i.locked), a(n, "tags", c.tags || [], i.tags || []), a(n, "annotation", c.annotation ?? null, i.annotation ?? null);
    const l = c.character?.pose?.preset_id ?? null, p = i.character?.pose?.preset_id ?? null;
    a(n, "pose_preset", l, p);
    const m = c.character?.motion?.clip_id ?? null, f = i.character?.motion?.clip_id ?? null;
    a(n, "motion_clip_id", m, f);
  }
}
function Op(e, t, a) {
  a("timeline", "duration_frames", e?.duration_frames, t?.duration_frames), a("timeline", "playback_range", e?.playback_range ?? null, t?.playback_range ?? null);
}
function Pp(e, t, a) {
  const o = new Map((e?.sequence?.cuts || []).map((n) => [n.start, n])), r = new Map((t?.sequence?.cuts || []).map((n) => [n.start, n]));
  for (const [n, i] of o)
    r.has(n) || a(`cut_${n}`, "cut", i.camera_id, null);
  for (const [n, i] of r) {
    const c = o.get(n);
    c ? a(`cut_${n}`, "cut_camera_id", c.camera_id, i.camera_id) : a(`cut_${n}`, "cut", null, i.camera_id);
  }
}
function Lp(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function ur(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function er(e, t, a) {
  return {
    ok: !1,
    version: at,
    revision: ur(e),
    id: t ?? null,
    applied: 0,
    error: {
      code: a.code || "INTERNAL",
      operationIndex: a.operationIndex ?? null,
      message: a.message,
      ...a.details ? { details: a.details } : {}
    }
  };
}
function Np(e) {
  const t = (e.state.cameras || []).find(
    (a) => a.id === e.state.active_camera_id
  ) || e.state.cameras?.[0] || null;
  return t ? (e.state.keyframes = t.keyframes, e.state.camera = ce(t.camera), e.camera = ce(t.camera), t) : null;
}
function zp(e, t) {
  t && (e.camera = $e(
    t,
    e.frame ?? 0,
    e.state.objects || []
  ));
}
async function Fp(e, t, a) {
  const o = a.some((i) => i.resourceRefresh === !0), r = t.operations.filter((i) => i.type === W.OBJECT_DELETE).map((i) => i.objectId);
  for (const i of r)
    e.removeObjectResources?.(i);
  const n = t.operations.some((i) => i.type === W.ASSET_INSTANTIATE);
  (o || n) && await e.restoreAssets?.();
}
function Rp(e, t, a) {
  if (typeof e.requestUiUpdate == "function") {
    e.requestUiUpdate(t, a);
    return;
  }
  e.camera = e.sampleCamera?.(e.state, e.frame) ?? e.camera, e.refreshObjects?.(), e.refreshKeys?.(), e.refreshInspector?.(), e.render?.();
}
function Dp(e, t) {
  let a;
  try {
    a = hp(e, t);
  } catch (f) {
    if (f instanceof O) return er(e, t?.id, f);
    throw f;
  }
  const o = ur(e);
  if (a.baseRevision !== void 0 && a.baseRevision !== o)
    return er(
      e,
      a.id,
      new O(
        "STALE_REVISION",
        "Scene changed since the caller read it",
        null,
        {
          expected: o,
          received: a.baseRevision
        }
      )
    );
  const r = Lp(e.state);
  let n = 0;
  const i = [], c = [];
  for (let f = 0; f < a.operations.length; f += 1)
    try {
      const d = jp({ ui: e, state: r, operation: a.operations[f] });
      n |= d?.dirtyMask || 0, d?.warning && i.push(d.warning), d?.outcome && c.push({ index: f, ...d.outcome });
    } catch (d) {
      if (d instanceof O)
        return (d.operationIndex === null || d.operationIndex === void 0) && (d.operationIndex = f), er(e, a.id, d);
      throw d;
    }
  if (a.validateOnly) {
    const { changes: f, truncated: d } = Cp(e.state, r);
    return {
      ok: !0,
      version: at,
      revision: o,
      id: a.id,
      applied: a.operations.length,
      warnings: i,
      outcomes: c,
      dirtyMask: n,
      validateOnly: !0,
      changes: f,
      ...d ? { truncated: !0 } : {}
    };
  }
  e.checkpoint?.(a.description), e.state = $r(r);
  const l = Np(e);
  lp(e, a.id), e.serialize?.(), zp(e, l), Rp(e, n, `director-api:${a.id}`);
  const p = {
    ok: !0,
    version: at,
    baseRevision: o,
    revision: ur(e),
    id: a.id,
    applied: a.operations.length,
    warnings: i,
    outcomes: c,
    dirtyMask: n
  }, m = Fp(e, a, c).catch((f) => {
    console.warn("OmniCam: resource reconciliation failed", f), i.push({
      code: "VIEWPORT_RESOURCE_RECONCILE_FAILED",
      message: "The scene change was committed, but one or more viewport resources could not be refreshed."
    }), e.setStatus?.("The scene change was committed, but one or more viewport resources could not be refreshed.");
  });
  return Object.defineProperty(p, "_reconciliation", { value: m, enumerable: !1 }), p;
}
function Kp(e) {
  return {
    query: (t) => Hm(e, t),
    execute: (t) => Dp(e, t)
  };
}
function Bp(e) {
  return e.directorApi = Kp(e), e.directorApi;
}
const xn = "omnicam-agent/1", wn = "majoor.omnicam.agent.request", qp = 1, Bt = Object.freeze({
  register: "/majoor/omnicam/agent/v1/session/register",
  heartbeat: "/majoor/omnicam/agent/v1/session/heartbeat",
  reply: "/majoor/omnicam/agent/v1/reply",
  close: "/majoor/omnicam/agent/v1/session/close"
}), Up = 1e4, Wp = 5e3, Ks = "asset.instantiate_by_id", Bs = "asset.catalog_search", kn = Object.freeze([
  ...Fs.filter((e) => e !== W.ASSET_INSTANTIATE),
  Ks
]);
function br(e) {
  return e?.kind === "character" && e?.source === "default";
}
async function Vp(e, t) {
  if (!e || !t || typeof t != "string") return null;
  const a = e.get(t);
  if (a) return br(a) ? null : a;
  try {
    await e.setFilter({ kind: "all", search: t });
  } catch {
  }
  const o = e.get(t);
  return br(o) ? null : o;
}
async function Hp(e, t) {
  const a = e.assetBrowser?.store, o = [];
  for (const r of t || []) {
    if (r?.type !== Ks) {
      o.push(r);
      continue;
    }
    if (!a)
      return { ok: !1, code: "ASSET_CATALOG_UNAVAILABLE", message: "The asset catalogue is not available in this Director session" };
    const n = await Vp(a, r.assetId);
    if (!n)
      return { ok: !1, code: "UNKNOWN_ASSET", message: `Unknown catalogue asset: ${r.assetId}` };
    o.push({ type: "asset.instantiate", asset: n, id: r.id, point: r.point });
  }
  return { ok: !0, operations: o };
}
async function Gp(e, t) {
  const a = e.assetBrowser?.store;
  if (!a) {
    const r = new Error("The asset catalogue is not available in this Director session");
    throw r.code = "ASSET_CATALOG_UNAVAILABLE", r;
  }
  await a.setFilter({ kind: t?.kind || "all", search: String(t?.search || "") });
  const o = (a.state?.items || []).filter((r) => !br(r)).slice(0, 20).map((r) => ({
    id: r.id,
    name: r.name,
    kind: r.kind,
    tags: [...r.tags || []],
    animations: (r.animations || []).map((n) => ({ id: n.id, name: n.name, clip: n.clip }))
  }));
  return {
    version: at,
    type: Bs,
    items: o,
    revision: Number(e.directorRevision || 0)
  };
}
async function qt(e, t, a) {
  const o = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
  let r = null;
  try {
    r = await o.json();
  } catch {
    r = null;
  }
  if (o.ok === !1) {
    const n = r?.error?.code || `HTTP_${o.status || 0}`, i = r?.error?.message || `OmniCam Agent request failed (${o.status})`, c = new Error(i);
    throw c.code = n, c.status = o.status || 0, c;
  }
  return r ?? {};
}
function Ut(e, t, a) {
  return {
    ok: !1,
    version: at,
    revision: Number(e.directorRevision || 0),
    error: { code: t, message: a }
  };
}
function Yp(e, t, a) {
  let o = !1, r = null, n = null, i = null, c = null, l = null, p = 0;
  function m() {
    return a.clientId || a.initialClientId || null;
  }
  function f() {
    r = null, n = null, i = null, c && (clearInterval(c), c = null);
  }
  async function d() {
    if (o) return;
    p += 1;
    const k = p, g = m();
    if (!g) {
      h();
      return;
    }
    try {
      const _ = await qt(a, Bt.register, {
        protocol: xn,
        client_id: g,
        node_id: String(t.id),
        label: `OmniCam Director ${t.id}`,
        director_api: at,
        revision: Number(e.directorRevision || 0),
        operations: [...kn],
        queries: [...qm]
      });
      if (o || k !== p) return;
      r = _.session_id, n = _.session_token, i = g, u();
    } catch {
      if (o || k !== p) return;
      h();
    }
  }
  function h() {
    o || (clearTimeout(l), l = setTimeout(() => {
      d();
    }, Wp));
  }
  function u() {
    clearInterval(c), c = setInterval(() => {
      b();
    }, Up);
  }
  async function b() {
    if (!(o || !r))
      try {
        await qt(a, Bt.heartbeat, {
          session_id: r,
          session_token: n,
          revision: Number(e.directorRevision || 0)
        });
      } catch (k) {
        if (o) return;
        (k?.code === "UNKNOWN_SESSION" || k?.code === "BAD_SESSION_TOKEN") && (f(), d());
      }
  }
  async function v(k) {
    const g = k?.detail;
    if (o || !g || g.protocol !== xn || Number(g.schema_version) !== qp || g.session_id !== r || String(g.node_id) !== String(t.id)) return;
    let _;
    try {
      if (g.kind === "query")
        _ = g.payload?.type === Bs ? await Gp(e, g.payload) : e.directorApi.query(g.payload);
      else if (g.kind === "transaction") {
        const A = g.payload, K = (A?.operations || []).find(
          (F) => !kn.includes(F?.type)
        );
        if (!Number.isInteger(A?.baseRevision) || A.baseRevision < 0)
          _ = Ut(
            e,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision"
          );
        else if (K)
          _ = Ut(
            e,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${K?.type}`
          );
        else {
          const F = await Hp(e, A.operations);
          F.ok ? (_ = e.directorApi.execute({ ...A, operations: F.operations }), await _?._reconciliation) : _ = Ut(e, F.code, F.message);
        }
      } else
        _ = Ut(e, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${g.kind}`);
    } catch (A) {
      _ = Ut(e, A?.code || "INTERNAL", A?.message || "OmniCam Agent request failed");
    }
    try {
      await qt(a, Bt.reply, {
        session_id: r,
        session_token: n,
        request_id: g.request_id,
        result: _
      });
    } catch {
    }
  }
  async function y(k, g) {
    if (!(!k || !g))
      try {
        await qt(a, Bt.close, {
          session_id: k,
          session_token: g
        });
      } catch {
      }
  }
  function x() {
    if (o) return;
    const k = m();
    if (k && i && k !== i) {
      const g = r, _ = n;
      f(), y(g, _).finally(() => d());
    }
  }
  return a.addEventListener?.(wn, v), a.addEventListener?.("status", x), d(), {
    get sessionId() {
      return r;
    },
    dispose() {
      if (o) return;
      o = !0, clearInterval(c), clearTimeout(l), a.removeEventListener?.(wn, v), a.removeEventListener?.("status", x);
      const k = r, g = n;
      r = null, n = null, k && g && qt(a, Bt.close, {
        session_id: k,
        session_token: g
      }).catch(() => {
      });
    }
  };
}
const ze = "/majoor/omnicam/library";
function Xp(e, t) {
  const a = typeof window < "u" && (window.app?.api || window.__omnicamApi) || null;
  if (!a?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return a.fetchApi(e, t);
}
async function Jp(e) {
  let t = null;
  try {
    t = await e.json();
  } catch {
    t = null;
  }
  if (e.ok === !1) {
    const a = t?.error?.code || `HTTP_${e.status || 0}`, o = t?.error?.message || e.statusText || a, r = new Error(o);
    throw r.code = a, r.status = e.status || 0, r;
  }
  return t ?? {};
}
function Sn(e = {}) {
  const t = new URLSearchParams();
  for (const [o, r] of Object.entries(e))
    r == null || r === "" || t.set(o, String(r));
  const a = t.toString();
  return a ? `?${a}` : "";
}
function Rr({ fetchApi: e = Xp } = {}) {
  const t = (a, o) => Promise.resolve(e(a, o)).then(Jp);
  return {
    list(a = {}) {
      const { kind: o, tag: r, search: n, offset: i, limit: c } = a, l = { tag: r, search: n, offset: i, limit: c };
      return o && o !== "all" && (l.kind = o), t(`${ze}${Sn(l)}`);
    },
    get(a) {
      return t(`${ze}/${encodeURIComponent(a)}`);
    },
    register(a) {
      return t(`${ze}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a)
      });
    },
    patch(a, o) {
      return t(`${ze}/${encodeURIComponent(a)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(o)
      });
    },
    remove(a) {
      return t(`${ze}/${encodeURIComponent(a)}`, { method: "DELETE" });
    },
    importModel(a, o = {}) {
      const r = new FormData();
      return r.append("file", a, o.filename || a.name || "model.glb"), t(`${ze}/import${Sn(o)}`, { method: "POST", body: r });
    },
    importLocalCharacters({ folder: a, licenseNote: o = "", idPrefix: r = "", dryRun: n = !1 } = {}) {
      return t(`${ze}/import-local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: a,
          license_note: o,
          id_prefix: r,
          dry_run: n
        })
      });
    },
    uploadThumbnail(a, o, r = "thumb.webp") {
      const n = new FormData();
      return n.append("file", o, r), t(`${ze}/thumbnail/${encodeURIComponent(a)}`, {
        method: "POST",
        body: n
      });
    },
    listPoses() {
      return t(`${ze}/poses`);
    },
    savePose(a) {
      return t(`${ze}/poses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a)
      });
    },
    deletePose(a) {
      return t(`${ze}/poses/${encodeURIComponent(a)}`, { method: "DELETE" });
    }
  };
}
const qs = Object.freeze(["all", "character", "prop", "environment", "vehicle"]);
function jn(e = {}) {
  const t = String(e.kind || "all").toLowerCase();
  return {
    kind: qs.includes(t) ? t : "all",
    tag: String(e.tag || "").trim().toLowerCase(),
    search: String(e.search || "").trim().toLowerCase()
  };
}
const Zp = 60;
function Qp(e) {
  const t = /* @__PURE__ */ new Set(), a = {
    items: [],
    byId: /* @__PURE__ */ new Map(),
    kinds: {},
    total: 0,
    offset: 0,
    limit: Zp,
    filter: jn({}),
    loading: !1,
    error: null,
    loaded: !1
  }, o = () => {
    for (const i of t) i(a);
  }, r = () => {
    a.byId = new Map(a.items.map((i) => [i.id, i]));
  };
  async function n(i) {
    a.loading = !0, a.error = null, o();
    try {
      await i();
    } catch (c) {
      a.error = { code: c.code || "REQUEST_FAILED", message: c.message || String(c) };
    } finally {
      a.loading = !1, o();
    }
  }
  return {
    get state() {
      return a;
    },
    subscribe(i) {
      return t.add(i), () => t.delete(i);
    },
    get(i) {
      return a.byId.get(i) || null;
    },
    setFilter(i) {
      return a.filter = jn({ ...a.filter, ...i }), a.offset = 0, this.refresh();
    },
    refresh() {
      return n(async () => {
        const i = await e.list({ ...a.filter, offset: 0, limit: a.limit });
        a.items = Array.isArray(i.items) ? i.items : [], a.total = Number(i.total) || a.items.length, a.kinds = i.kinds || {}, a.offset = a.items.length, a.loaded = !0, r();
      });
    },
    loadMore() {
      return a.loading || a.items.length >= a.total ? Promise.resolve() : n(async () => {
        const i = await e.list({ ...a.filter, offset: a.offset, limit: a.limit }), c = Array.isArray(i.items) ? i.items : [];
        a.items = [...a.items, ...c], a.total = Number(i.total) || a.items.length, a.offset = a.items.length, r();
      });
    },
    /** Reflect a register/patch result locally without a full refetch. */
    upsert(i) {
      if (!i || !i.id) return;
      const c = a.items.findIndex((l) => l.id === i.id);
      c >= 0 ? a.items[c] = i : a.items = [i, ...a.items], a.total = Math.max(a.total, a.items.length), r(), o();
    },
    removeLocal(i) {
      const c = a.items.length;
      a.items = a.items.filter((l) => l.id !== i), a.items.length !== c && (a.total = Math.max(0, a.total - 1), a.offset = Math.max(0, a.offset - 1), r(), o());
    }
  };
}
function ef({ max: e = 96 } = {}) {
  const t = /* @__PURE__ */ new Map();
  return {
    get size() {
      return t.size;
    },
    has(a) {
      return t.has(a);
    },
    get(a) {
      if (!t.has(a)) return null;
      const o = t.get(a);
      return t.delete(a), t.set(a, o), o;
    },
    set(a, o) {
      if (!(!a || !o))
        for (t.has(a) && t.delete(a), t.set(a, o); t.size > e; ) {
          const r = t.keys().next().value;
          t.delete(r);
        }
    },
    delete(a) {
      return t.delete(a);
    },
    clear() {
      t.clear();
    },
    keys() {
      return [...t.keys()];
    }
  };
}
function tf() {
  const e = /* @__PURE__ */ new Map();
  let t = Promise.resolve(), a = 0;
  return {
    get pendingCount() {
      return e.size;
    },
    get active() {
      return a;
    },
    enqueue(o, r) {
      if (e.has(o)) return e.get(o);
      const n = t.then(async () => {
        a += 1;
        try {
          return await r();
        } finally {
          a -= 1, e.delete(o);
        }
      });
      return e.set(o, n), t = n.catch(() => {
      }), n;
    },
    clear() {
      e.clear();
    }
  };
}
const af = 256;
function _n(e = {}) {
  const { THREE: t, GLTFLoader: a, FBXLoader: o, size: r = af } = e;
  if (!t || !a)
    return { render: async () => null, dispose() {
    } };
  let n = null, i = null, c = null;
  const l = () => {
    if (n) return;
    n = new t.WebGLRenderer({ antialias: !0, alpha: !0, preserveDrawingBuffer: !0 }), n.setSize(r, r, !1), n.setClearColor(0, 0), i = new t.Scene();
    const f = new t.DirectionalLight(16777215, 2.4);
    f.position.set(3, 5, 4);
    const d = new t.HemisphereLight(14673919, 2106412, 1.1);
    i.add(f, d), c = new t.PerspectiveCamera(35, 1, 0.01, 500);
  }, p = (f) => {
    const d = new t.Box3().setFromObject(f);
    if (d.isEmpty()) return;
    const h = d.getCenter(new t.Vector3()), u = d.getSize(new t.Vector3()), v = Math.max(u.length() / 2, 1e-3) / Math.sin(c.fov * Math.PI / 360);
    c.position.set(h.x + v * 0.7, h.y + v * 0.55, h.z + v), c.near = v / 100, c.far = v * 10, c.updateProjectionMatrix(), c.lookAt(h);
  }, m = (f, d) => new Promise((h, u) => {
    const b = d === "fbx" && o ? o : a;
    new b().load(
      f,
      (v) => h(v.scene || v),
      void 0,
      (v) => u(v)
    );
  });
  return {
    async render(f, d = "glb") {
      if (!f) return null;
      try {
        l();
        const h = await m(f, d);
        i.add(h), p(h), n.render(i, c);
        const u = n.domElement.toDataURL("image/webp", 0.82);
        return i.remove(h), h.traverse?.((b) => {
          b.geometry?.dispose?.();
          const v = b.material;
          Array.isArray(v) ? v.forEach((y) => y.dispose?.()) : v?.dispose?.();
        }), u;
      } catch {
        return null;
      }
    },
    dispose() {
      n?.dispose?.(), n = i = c = null;
    }
  };
}
async function of() {
  const [e, t, a] = await Promise.all([
    import("./chunk-__IQ4xkd.js").then((o) => o.T),
    import("./vendor-three-BQUrLQkn.js").then((o) => o.am),
    import("./vendor-three-BQUrLQkn.js").then((o) => o.an)
  ]);
  return { THREE: e, GLTFLoader: t.GLTFLoader, FBXLoader: a.FBXLoader };
}
function rf(e) {
  const [t, a] = String(e).split(","), o = /:(.*?);/.exec(t)?.[1] || "image/webp", r = atob(a || ""), n = new Uint8Array(r.length);
  for (let i = 0; i < r.length; i += 1) n[i] = r.charCodeAt(i);
  return new Blob([n], { type: o });
}
const nf = Object.freeze({
  character: "pi-user",
  prop: "pi-box",
  environment: "pi-building",
  vehicle: "pi-car",
  helper: "pi-compass"
}), sf = {
  all: "All",
  character: "Characters",
  prop: "Props",
  environment: "Env",
  vehicle: "Vehicles"
};
function _t(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function cf(e, t = {}) {
  return qs.map((a) => {
    const o = s(sf[a] || a), r = a === "all" ? "" : ` <span class="oc-asset-kind-n">${Number(t[a] || 0)}</span>`;
    return `<button type="button" class="oc-asset-kind${a === (e || "all") ? " active" : ""}" data-asset-kind="${a}">${_t(o)}${r}</button>`;
  }).join("");
}
function lf(e, { selected: t = !1, thumbUrl: a = "" } = {}) {
  const o = nf[e.kind] || "pi-box", r = e.kind === "character" && ss(e.rig) === "rigged" ? `<span class="oc-asset-badge">${s("RIGGED")}</span>` : "", n = a ? `<img class="oc-asset-thumb" src="${_t(a)}" alt="" loading="lazy">` : `<span class="oc-asset-thumb oc-asset-thumb--glyph"><i class="pi ${o}"></i></span>`;
  return `<button type="button" class="oc-asset-card${t ? " selected" : ""}" data-asset-id="${_t(e.id)}" title="${_t(e.name)}">
    ${n}
    <span class="oc-asset-name">${_t(e.name)}</span>
    <span class="oc-asset-kind-tag">${_t((e.kind || "").toUpperCase())}</span>
    ${r}
  </button>`;
}
function df(e, { selectedId: t = "", thumbUrls: a = {} } = {}) {
  return !e || !e.length ? `<p class="oc-asset-empty">${s("No assets match this filter.")}</p>` : e.map((o) => lf(o, {
    selected: o.id === t,
    thumbUrl: a[o.id] || ""
  })).join("");
}
function Cn(e) {
  if (!e || !e.closest) return null;
  const t = e.closest("[data-asset-kind]");
  if (t) return { action: "filter-kind", kind: t.dataset.assetKind };
  const a = e.closest("[data-asset-view]");
  if (a) return { action: "switch-view", view: a.dataset.assetView };
  const o = e.closest("[data-asset-act]");
  if (o) return { action: o.dataset.assetAct };
  const r = e.closest("[data-asset-id]");
  return r ? { action: "card", assetId: r.dataset.assetId } : null;
}
function mf(e, t = {}) {
  const a = e.root, o = t.fetchApi || ((N, V) => (e.api || e.app?.api).fetchApi(N, V)), r = t.apiClient || Rr({ fetchApi: o }), n = t.store || Qp(r), i = ef(), c = t.previewQueue || tf(), l = e.api || e.app?.api || null;
  let p = t.thumbnailRenderer || null, m = null;
  const f = /* @__PURE__ */ new Set();
  function d() {
    return p ? Promise.resolve(p) : (m || (m = of().then((N) => p = _n(N)).catch(() => p = _n({}))), m);
  }
  function h(N) {
    return Qr(l, Ds(N));
  }
  function u(N) {
    return N.thumbnail ? Qr(l, `omnicam/library/${N.thumbnail} [input]`) : "";
  }
  function b() {
    for (const N of n.state.items) {
      if (N.kind === "helper" || !N.file || i.get(N.id) || N.thumbnail || f.has(N.id)) continue;
      const V = h(N);
      V && c.enqueue(N.id, async () => {
        const _e = await (await d()).render(V, N.format || "glb");
        if (!_e) {
          f.add(N.id);
          return;
        }
        if (i.set(N.id, _e), X(), !(N.source && N.source !== "user"))
          try {
            const Pe = await r.uploadThumbnail(N.id, rf(_e));
            Pe?.asset && n.upsert(Pe.asset);
          } catch {
          }
      });
    }
  }
  const v = (N) => a.querySelector(`[data-role="${N}"]`), y = v("assets-panel"), x = v("asset-grid"), k = v("asset-kinds"), g = v("asset-search"), _ = v("asset-status"), A = v("asset-import-file"), K = v("scene-tab"), F = v("assets-tab"), J = v("agent-tab"), H = a.querySelector('[data-asset-view="agent"]'), M = { assets: F, agent: J };
  let P = "", j = null, R = !0, q = !0, G = "scene", L = 0;
  function E(N, { sticky: V = !1 } = {}) {
    _ && (!V && L > Date.now() || (_.textContent = N || "", L = V ? Date.now() + 9e3 : 0));
  }
  function Y(N) {
    if (P = N, !!x)
      for (const V of x.querySelectorAll(".oc-asset-card"))
        V.classList.toggle("selected", V.dataset.assetId === N);
  }
  let D = !1;
  function X() {
    if (k && (k.innerHTML = cf(n.state.filter.kind, n.state.kinds)), x) {
      const N = {};
      for (const V of n.state.items) {
        const me = i.get(V.id) || u(V);
        me && (N[V.id] = me);
      }
      x.innerHTML = df(n.state.items, { selectedId: P, thumbUrls: N });
    }
    if (!D) {
      D = !0;
      try {
        b();
      } finally {
        D = !1;
      }
    }
    n.state.error ? E(n.state.error.message) : n.state.loading ? E(s("Loading assets...")) : E(s("{n} of {total} assets").replace("{n}", n.state.items.length).replace("{total}", n.state.total));
  }
  function te(N) {
    if (!N) return;
    const V = kp({
      groundHit: e.webgl?.orbitGroundHit?.(),
      orbitTarget: e.webgl?.getOrbitTarget?.() || e.camera?.target
    }), me = e.directorApi?.execute({
      version: 1,
      id: `tx_instantiate_${Date.now().toString(36)}`,
      description: s("Add asset"),
      operations: [{ type: "asset.instantiate", asset: N, point: V }]
    });
    if (!me?.ok) {
      e.setStatus?.(me?.error?.message || s("Could not add the asset"));
      return;
    }
    const _e = me.outcomes?.[0]?.objectId;
    _e && (e.selectedEntity = "object", e.selectedObjectId = _e, e.selectedObjectIds = /* @__PURE__ */ new Set([_e]), e.selectedKeyFrame = null), e.restoreAssets?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.render?.(), e.setStatus?.(s("{name} added").replace("{name}", N.name));
  }
  async function le(N) {
    if (N) {
      E(s("Importing {name}...").replace("{name}", N.name));
      try {
        const V = await r.importModel(N, { kind: "prop", name: N.name.replace(/\.[^.]+$/, "") });
        V.asset && n.upsert(V.asset), E(s("Imported {name}").replace("{name}", V.asset?.name || N.name));
      } catch (V) {
        E(V.message || s("Import failed"));
      }
    }
  }
  const se = v("asset-local-form"), re = v("asset-local-folder"), de = v("asset-local-note");
  function ge() {
    se && (se.hidden = !se.hidden, se.hidden || re?.focus());
  }
  async function he(N) {
    const V = (re?.value || "").trim();
    if (!V) {
      E(s("Point to the folder you extracted the pack into."), { sticky: !0 });
      return;
    }
    L = 0, E(N ? s("Scanning {folder}...").replace("{folder}", V) : s("Installing characters from {folder}...").replace("{folder}", V));
    try {
      const me = await r.importLocalCharacters({
        folder: V,
        licenseNote: (de?.value || "").trim(),
        dryRun: N
      }), _e = (me.skipped || []).length;
      if (N) {
        const Le = (me.candidates || []).map((st) => st.name).join(", ");
        E(
          (me.candidates || []).length ? s("{n} rig-complete character(s): {names}").replace("{n}", me.candidates.length).replace("{names}", Le) : s("No rig-complete .glb/.fbx character found ({n} skipped)").replace("{n}", _e),
          { sticky: !0 }
        );
        return;
      }
      const Pe = (me.installed || []).filter((Le) => Le.status !== "conflict").length, Ke = (me.installed || []).filter((Le) => Le.status === "conflict").length;
      E(
        s("{n} character(s) installed{extra} — no restart needed").replace("{n}", Pe).replace("{extra}", _e || Ke ? ` (${_e} ${s("skipped")}${Ke ? `, ${Ke} ${s("unchanged")}` : ""})` : ""),
        { sticky: !0 }
      ), Pe && (n.refresh(), se && (se.hidden = !0));
    } catch (me) {
      E(me.message || s("Import failed"), { sticky: !0 });
    }
  }
  function ye(N) {
    N === "agent" && !ir() && (N = "scene"), G = N, K && (K.hidden = N !== "scene");
    for (const [V, me] of Object.entries(M))
      me && (me.hidden = V !== N);
    for (const V of a.querySelectorAll("[data-asset-view]"))
      V.classList.toggle("active", V.dataset.assetView === N);
    N === "assets" && R && (R = !1, n.refresh()), N === "agent" && q && (q = !1, t.onAgentFirstOpen?.());
  }
  function ve() {
    const N = ir();
    H && (H.hidden = !N), !N && G === "agent" && ye("scene");
  }
  function pe(N) {
    const V = Cn(N.target);
    if (V) {
      if (V.action === "switch-view") return ye(V.view);
      if (V.action === "filter-kind") return void n.setFilter({ kind: V.kind });
      if (V.action === "asset-add")
        return te(n.get(P));
      if (V.action === "asset-import")
        return A?.click();
      if (V.action === "local-toggle") return ge();
      if (V.action === "local-scan") return void he(!0);
      if (V.action === "local-install") return void he(!1);
      V.action === "card" && Y(V.assetId);
    }
  }
  function Me(N) {
    const V = Cn(N.target);
    V?.action === "card" && te(n.get(V.assetId));
  }
  function xe() {
    clearTimeout(j), j = setTimeout(() => n.setFilter({ search: g.value }), 200);
  }
  function we(N) {
    const V = N.target.files?.[0];
    N.target.value = "", le(V);
  }
  const be = n.subscribe(X);
  return y?.addEventListener("click", pe), y?.addEventListener("dblclick", Me), a.querySelector('[data-role="left-tabs"]')?.addEventListener("click", pe), g?.addEventListener("input", xe), A?.addEventListener("change", we), X(), ve(), {
    store: n,
    switchView: ye,
    syncAgentAvailability: ve,
    refresh: () => n.refresh(),
    dispose() {
      be(), clearTimeout(j), y?.removeEventListener("click", pe), y?.removeEventListener("dblclick", Me), a.querySelector('[data-role="left-tabs"]')?.removeEventListener("click", pe), g?.removeEventListener("input", xe), A?.removeEventListener("change", we), c.clear(), p?.dispose?.(), i.clear();
    }
  };
}
function pf(e, t = {}) {
  const a = t.container || e.root?.querySelector(".viewport-wrap") || e.root, o = document.createElement("div");
  o.className = "oc-label-layer", o.setAttribute("aria-hidden", "true"), a?.appendChild(o);
  const r = [];
  let n = cr(e.state?.metadata?.viewport_labels);
  function i(m) {
    if (!r[m]) {
      const f = document.createElement("div");
      f.className = "oc-label", o.appendChild(f), r[m] = f;
    }
    return r[m];
  }
  function c() {
    return e.selectedObjectIds instanceof Set && e.selectedObjectIds.size ? e.selectedObjectIds : new Set([e.selectedObjectId].filter(Boolean));
  }
  function l() {
    const m = e.webgl?.projectWorldToScreen;
    if (n.mode === "off" || e.recording || e.capturingClean || !m) {
      o.hidden = !0;
      return;
    }
    o.hidden = !1;
    const d = c(), h = Number(e.frame) || 0, u = Array.isArray(e.state?.objects) ? e.state.objects : [];
    let b = 0;
    for (const v of u) {
      if (!is(v, { mode: n.mode, selectedIds: d })) continue;
      const y = cs(v, n.content);
      if (!y) continue;
      const x = ls(u, v, h) || {
        position: v.position,
        size: v.size
      }, k = e.webgl.projectWorldToScreen(ds(x, v.type));
      if (!k || k.behind) continue;
      const g = i(b);
      b += 1, g.hidden = !1, g.textContent = y, g.style.transform = `translate(-50%, -100%) translate(${Math.round(k.x)}px, ${Math.round(k.y)}px)`;
      const _ = n.content === "annotation" ? v.annotation?.color : "";
      g.style.setProperty("--oc-label-accent", _ || ""), g.classList.toggle("is-annotation", n.content === "annotation" && !!_);
    }
    for (let v = b; v < r.length; v += 1) r[v].hidden = !0;
  }
  function p(m) {
    n = cr({ ...n, ...m }), e.state.metadata = { ...e.state.metadata || {}, viewport_labels: { ...n } }, e.serialize?.(), l();
  }
  return l(), {
    update: l,
    get settings() {
      return { ...n };
    },
    setMode(m) {
      p({ mode: m });
    },
    setContent(m) {
      p({ content: m });
    },
    dispose() {
      o.remove(), r.length = 0;
    }
  };
}
function ff(e) {
  const t = (a) => e.webgl?.getModelBoneNames?.(a) || [];
  return {
    /** Bones + a best-effort auto-map + completeness for one object. */
    getRigInfo(a) {
      const o = e.state?.objects?.find((i) => i.id === a) || null, r = t(a), n = lr(r);
      return {
        objectId: a,
        assetId: o?.asset_id || null,
        isCharacter: o?.asset_kind === "character",
        rigProfile: o?.character?.rig_profile || null,
        boneNames: r,
        autoMap: n,
        autoMapStatus: ss({ bone_map: n })
      };
    },
    /** The source bone name a canonical joint maps to, per the supplied map. */
    resolveJoint(a, o, r) {
      const n = (r || {})[o];
      return n && t(a).includes(n) ? n : null;
    },
    /** World position of a canonical joint's bone, or null. */
    getJointWorldTransform(a, o, r) {
      const n = this.resolveJoint(a, o, r);
      return n && e.webgl?.resolveModelBone?.(a, n) || null;
    },
    /** Run the auto-mapper on whatever is loaded for this object now. */
    autoMap(a) {
      return lr(t(a));
    },
    /** Preview a motion clip on the loaded model (viewport only -- the durable
     * state write goes through the Semantic API). */
    setMotion(a, o) {
      const r = Tr(o);
      return r ? !!(e.webgl?.applyMotionClip?.(a, r) ?? !0) : !1;
    },
    /** Sample the live bone rotations at the current frame, mapped to canonical
     * joints -- the input to "Bake current frame to pose". */
    sampleCanonicalPose(a, o) {
      return e.webgl?.sampleCharacterBonePose?.(a, o) || {};
    }
  };
}
function En(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function hf(e, t) {
  const a = (o) => [`<option value="">${s("— unmapped —")}</option>`].concat(
    e.map(
      (r) => `<option value="${En(r)}"${r === o ? " selected" : ""}>${En(r)}</option>`
    )
  ).join("");
  return ms.map((o) => {
    const r = t[o] || "", n = r && e.includes(r);
    return `<label class="oc-rig-row${n ? " ok" : ""}" data-joint="${o}">
      <span class="oc-rig-joint">${o}</span>
      <select data-rig-joint="${o}">${a(r)}</select>
      <span class="oc-rig-tick">${n ? "✓" : ""}</span>
    </label>`;
  }).join("");
}
function uf(e, t = {}) {
  const a = e.root, o = t.apiClient || Rr({
    fetchApi: (y, x) => (e.api || e.app?.api).fetchApi(y, x)
  }), r = a.querySelector('[data-role="rig-mapper"]');
  if (!r) return { sync() {
  }, dispose() {
  } };
  const n = r.querySelector('[data-role="rig-mapper-grid"]'), i = r.querySelector('[data-role="rig-mapper-status"]');
  let c = null, l = {};
  const p = () => e.state?.objects?.find((y) => y.id === c) || null, m = () => e.webgl?.getModelBoneNames?.(c) || [];
  function f() {
    if (!i) return;
    const y = en(l);
    Yo(l) ? (i.textContent = s("Humanoid v1 ✓ — all 22 joints mapped"), i.dataset.state = "ok") : (i.textContent = s("Incomplete — {n} joint(s) unmapped").replace("{n}", y.length), i.dataset.state = "warn");
  }
  function d() {
    n && (n.innerHTML = hf(m(), l)), f();
  }
  function h() {
    const y = e.selectedObject?.(), x = y?.asset_kind === "character";
    if (r.hidden = !x, !x) {
      c = null;
      return;
    }
    y.id !== c && (c = y.id, r.open = !0, l = {}, y.asset_id ? o.get(y.asset_id).then((k) => {
      c === y.id && (l = { ...k?.asset?.rig?.bone_map || {} }, d());
    }).catch(() => d()) : d());
  }
  function u(y) {
    const x = y.target.closest("[data-rig-joint]");
    if (!x) return;
    const k = x.dataset.rigJoint;
    x.value ? l[k] = x.value : delete l[k], d();
  }
  function b(y) {
    const x = y.target.closest("[data-rig-act]")?.dataset.rigAct;
    x === "auto" ? (l = lr(m()), d()) : x === "validate" ? (d(), e.setStatus?.(Yo(l) ? s("Rig is complete") : s("Rig still missing: {list}").replace("{list}", en(l).join(", ")))) : x === "save" && v();
  }
  async function v() {
    const y = p();
    if (!y?.asset_id) {
      e.setStatus?.(s("Instantiate this asset from the Asset Browser before mapping its rig"));
      return;
    }
    try {
      const x = await o.patch(y.asset_id, {
        rig: { profile: tn, bone_map: l }
      });
      y.character = {
        ...y.character || {},
        rig_profile: Yo(l) ? tn : null
      }, e.assetBrowser?.store?.upsert?.(x.asset), e.checkpoint?.("Save rig mapping"), e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.setStatus?.(s("Rig mapping saved"));
    } catch (x) {
      e.setStatus?.(x.message || s("Could not save the rig mapping"));
    }
  }
  return n?.addEventListener("change", u), r.addEventListener("click", b), h(), {
    sync: h,
    get boneMap() {
      return { ...l };
    },
    dispose() {
      n?.removeEventListener("change", u), r.removeEventListener("click", b);
    }
  };
}
function bf(e, t = {}) {
  const a = t.container || e.root?.querySelector(".viewport-wrap") || e.root, o = document.createElement("div");
  o.className = "oc-rig-overlay", a?.appendChild(o);
  const r = /* @__PURE__ */ new Map();
  function n(c) {
    let l = r.get(c);
    return l || (l = document.createElement("button"), l.type = "button", l.className = "oc-rig-dot", l.dataset.joint = c, l.title = c, l.addEventListener("click", (p) => {
      p.stopPropagation(), t.onPick?.(c);
    }), o.appendChild(l), r.set(c, l)), l;
  }
  function i() {
    const c = t.isActive?.();
    if (!c || !e.webgl?.projectWorldToScreen) {
      o.hidden = !0;
      return;
    }
    o.hidden = !1;
    const { objectId: l, boneMap: p, selectedJoint: m } = c, f = e.characterRuntime, d = /* @__PURE__ */ new Set();
    for (const h of ms) {
      const u = p?.[h];
      if (!u) continue;
      const b = f?.getJointWorldTransform?.(l, h, p) || e.webgl.resolveModelBone?.(l, u);
      if (!b?.world) continue;
      const v = e.webgl.projectWorldToScreen(b.world);
      if (!v || v.behind) continue;
      const y = n(h);
      y.hidden = !1, y.classList.toggle("selected", h === m), y.style.transform = `translate(-50%, -50%) translate(${Math.round(v.x)}px, ${Math.round(v.y)}px)`, d.add(h);
    }
    for (const [h, u] of r) d.has(h) || (u.hidden = !0);
  }
  return i(), {
    update: i,
    dispose() {
      o.remove(), r.clear();
    }
  };
}
const gf = /[^a-z0-9_-]+/g;
function yf(e, t = {}) {
  const a = e.root, o = t.apiClient || Rr({
    fetchApi: (j, R) => (e.api || e.app?.api).fetchApi(j, R)
  }), r = a.querySelector('[data-role="pose-editor"]');
  if (!r) return { sync() {
  }, update() {
  }, dispose() {
  } };
  const n = r.querySelector('[data-role="pose-preset"]'), i = r.querySelector('[data-pose-act="edit"]'), c = r.querySelector('[data-role="pose-joint-row"]'), l = r.querySelector('[data-role="pose-joint-name"]'), p = ["x", "y", "z"].map((j) => r.querySelector(`[data-role="pose-rot-${j}"]`));
  let m = null, f = !1, d = /* @__PURE__ */ new Map();
  const h = () => e.state?.objects?.find((j) => j.id === m) || null, u = () => e.rigMapper?.boneMap && Object.keys(e.rigMapper.boneMap).length ? e.rigMapper.boneMap : null, b = () => e.subSelection?.type === "character_joint" && e.subSelection.objectId === m ? e.subSelection.jointId : null;
  function v(j) {
    const R = $o({ ...j, preset_id: j.id });
    return { id: j.id, name: j.name || j.id, root_offset: R.root_offset, joints: R.joints };
  }
  function y(j) {
    const R = d.get(j?.pose?.preset_id) || null;
    return zi({ preset: R, overrides: j?.pose }).joints;
  }
  function x() {
    const j = h();
    !j?.character || !u() || e.webgl?.applyCharacterPose?.(m, u(), f || j.character.pose?.joints ? y(j.character) : {});
  }
  function k() {
    const j = b(), R = f && !!j;
    if (c && (c.hidden = !R), !R) return;
    l && (l.textContent = j);
    const q = h(), G = y(q?.character)[j] || [0, 0, 0, 1], L = Fi(G);
    p.forEach((E, Y) => {
      E && document.activeElement !== E && (E.value = String(Math.round(L[Y] * 100) / 100));
    });
  }
  function g() {
    const j = h(), R = !!j?.character?.motion;
    if (i && (i.classList.toggle("active", f), i.disabled = R, i.title = R ? s("Clear the motion clip to edit the pose") : s("Toggle FK pose editing")), n) {
      const q = [["neutral", s("Standing Neutral")]].concat([...d.values()].filter((L) => L.id !== "neutral").map((L) => [L.id, L.name || L.id])), G = q.map((L) => L.join(":")).join("|");
      n.dataset.sig !== G && (n.dataset.sig = G, n.replaceChildren(...q.map(([L, E]) => {
        const Y = document.createElement("option");
        return Y.value = L, Y.textContent = E, Y;
      }))), document.activeElement !== n && (n.value = j?.character?.pose?.preset_id || "neutral");
    }
    k(), x();
  }
  async function _() {
    try {
      const j = await o.listPoses();
      d = new Map((j.poses || []).filter((R) => R?.id).map((R) => [R.id, v(R)]));
    } catch {
      d = /* @__PURE__ */ new Map();
    }
    d.has("neutral") || d.set("neutral", v({ id: "neutral", name: "Standing Neutral" })), g();
  }
  function A() {
    const j = b();
    if (!j) return;
    const R = p.map((L) => Number(L?.value) || 0), q = Ni(R), G = e.directorApi?.execute({
      version: 1,
      id: `tx_pose_${Date.now().toString(36)}`,
      description: "Pose joint",
      operations: [{ type: "character.set_joint_rotation", objectId: m, joint: j, rotation: q }]
    });
    G && !G.ok && e.setStatus?.(G.error?.message || s("Could not set the joint")), g();
  }
  function K() {
    const j = n?.value || "neutral", R = d.get(j) || $o({ preset_id: j });
    e.directorApi?.execute({
      version: 1,
      id: `tx_preset_${Date.now().toString(36)}`,
      description: "Pose preset",
      operations: [{ type: "character.set_pose", objectId: m, pose: { preset_id: j, root_offset: R.root_offset, joints: {} } }]
    }), g();
  }
  async function F() {
    const j = h();
    if (!j?.character) return;
    const R = (await Xt(e, s("Save Pose"), s("Pose name"), ""))?.trim();
    if (!R || e.disposed) return;
    const q = R.toLowerCase().replace(gf, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "pose";
    try {
      const G = await o.savePose({
        id: q,
        name: R,
        profile: "omnicam_humanoid_v1",
        root_offset: j.character.pose?.root_offset || [0, 0, 0],
        joints: y(j.character)
      });
      d.set(G.pose.id, v(G.pose)), e.setStatus?.(s("Pose saved: {name}").replace("{name}", R)), g();
    } catch (G) {
      e.setStatus?.(G.message || s("Could not save the pose"));
    }
  }
  function J() {
    const j = h();
    !j?.character || j.character.motion || (f = !f, !f && e.subSelection?.type === "character_joint" && (e.subSelection = null), g(), e.rigOverlay?.update?.());
  }
  function H(j) {
    f && (e.subSelection = { type: "character_joint", objectId: m, jointId: j }, g(), e.rigOverlay?.update?.());
  }
  const M = bf(e, {
    onPick: H,
    isActive: () => f && m && u() ? { objectId: m, boneMap: u(), selectedJoint: b() } : null
  });
  e.rigOverlay = M;
  function P() {
    const j = e.selectedObject?.(), R = j?.asset_kind === "character";
    if (r.hidden = !R, !R) {
      f && (f = !1), m = null, M.update();
      return;
    }
    j.id !== m && (m = j.id, f = !1, e.subSelection?.type === "character_joint" && (e.subSelection = null), d.size || _()), g(), M.update();
  }
  n?.addEventListener("change", K), i?.addEventListener("click", J), r.querySelector('[data-pose-act="save"]')?.addEventListener("click", F);
  for (const j of p)
    j?.addEventListener("change", A), j?.addEventListener("input", A);
  return _(), {
    sync: P,
    update() {
      M.update(), x();
    },
    get editing() {
      return f;
    },
    dispose() {
      M.dispose(), n?.removeEventListener("change", K), i?.removeEventListener("click", J);
      for (const j of p)
        j?.removeEventListener("change", A), j?.removeEventListener("input", A);
    }
  };
}
function An(e, t) {
  const a = document.createElement("option");
  return a.value = e, a.textContent = t, a;
}
function tr(e, t) {
  e && document.activeElement !== e && (e.value = String(t));
}
function vf(e) {
  const t = e.root?.querySelector('[data-role="motion-editor"]');
  if (!t) return { sync() {
  }, dispose() {
  } };
  const a = (y) => t.querySelector(`[data-role="${y}"]`), o = a("motion-clip"), r = a("motion-start"), n = a("motion-end"), i = a("motion-speed"), c = a("motion-loop"), l = t.querySelector('[data-motion-act="bake"]');
  let p = null;
  const m = () => e.state?.objects?.find((y) => y.id === p) || null, f = () => e.modelInfoById?.get(p)?.animationNames || [];
  function d() {
    const y = o?.value || "";
    return y ? Tr({
      clip_id: y,
      start_frame: Number(r?.value) || 0,
      end_frame: Number(n?.value) || 0,
      speed: Number(i?.value) || 1,
      loop: c?.checked !== !1,
      offset_seconds: 0
    }) : null;
  }
  function h() {
    const y = d(), x = y ? { type: "character.set_motion", objectId: p, motion: y } : { type: "character.clear_motion", objectId: p }, k = e.directorApi?.execute({
      version: 1,
      id: `tx_motion_${Date.now().toString(36)}`,
      description: "Character motion",
      operations: [x]
    });
    k && !k.ok && e.setStatus?.(k.error?.message || s("Could not set the motion")), e.poseEditor?.sync?.(), u();
  }
  function u() {
    const y = m(), x = f(), k = y?.character?.motion || null;
    if (o) {
      const _ = x.join("|");
      o.dataset.sig !== _ && (o.dataset.sig = _, o.replaceChildren(
        An("", x.length ? s("No motion (static)") : s("No clips in this model")),
        ...x.map((A) => An(A, A))
      )), document.activeElement !== o && (o.value = k?.clip_id || ""), o.disabled = !x.length;
    }
    tr(r, k?.start_frame ?? 0), tr(n, k?.end_frame ?? 0), tr(i, k?.speed ?? 1), c && document.activeElement !== c && (c.checked = k ? k.loop !== !1 : !0);
    const g = !!k;
    for (const _ of [r, n, i, c]) _ && (_.disabled = !g);
    l && (l.disabled = !g);
  }
  function b() {
    const y = m(), x = e.rigMapper?.boneMap;
    if (!y?.character || !x || !Object.keys(x).length) {
      e.setStatus?.(s("Map the rig before baking a pose"));
      return;
    }
    const k = e.characterRuntime?.sampleCanonicalPose?.(p, x) || {};
    e.directorApi?.execute({
      version: 1,
      id: `tx_bake_${Date.now().toString(36)}`,
      description: "Bake frame to pose",
      operations: [
        { type: "character.clear_motion", objectId: p },
        {
          type: "character.set_pose",
          objectId: p,
          pose: { preset_id: "neutral", root_offset: y.character.pose?.root_offset || [0, 0, 0], joints: k }
        }
      ]
    }), e.setStatus?.(s("Baked current frame to pose")), u(), e.poseEditor?.sync?.();
  }
  function v() {
    const y = e.selectedObject?.(), x = y?.asset_kind === "character";
    if (t.hidden = !x, !x) {
      p = null;
      return;
    }
    p = y.id, u();
  }
  o?.addEventListener("change", h);
  for (const y of [r, n, i, c]) y?.addEventListener("change", h);
  return l?.addEventListener("click", b), {
    sync: v,
    dispose() {
      o?.removeEventListener("change", h);
      for (const y of [r, n, i, c]) y?.removeEventListener("change", h);
      l?.removeEventListener("click", b);
    }
  };
}
function Ue(e, t) {
  return [...e.querySelectorAll(`[data-role="${t}"]`)];
}
function Us(e) {
  return {
    status: e.querySelector('[data-role="status"]'),
    time: e.querySelector('[data-role="time"]'),
    frames: Ue(e, "frame"),
    scrubs: Ue(e, "scrub"),
    cameraFov: Ue(e, "camera-fov"),
    cameraRoll: Ue(e, "camera-roll"),
    cameraFocal: Ue(e, "camera-focal"),
    viewportZoom: Ue(e, "viewport-zoom"),
    cameraType: Ue(e, "camera-type"),
    cameraNear: Ue(e, "camera-near"),
    cameraFar: Ue(e, "camera-far")
  };
}
const xf = /* @__PURE__ */ new Set(["translate", "rotate", "scale"]), wf = /* @__PURE__ */ new Set(["world", "local"]), We = 180 / Math.PI;
function Tn(e) {
  return [e.x, e.y, e.z];
}
function kf(e) {
  return [e.x * We, e.y * We, e.z * We];
}
function Sf({
  THREE: e,
  camera: t,
  domElement: a,
  scene: o,
  onDragStart: r,
  onTransform: n,
  onDragEnd: i,
  onDraggingChanged: c,
  controlsFactory: l,
  anchorFactory: p
} = {}) {
  const m = p ? p() : new e.Object3D(), f = l ? l(t, a) : new dd(t, a);
  let d = null;
  o?.add && (d = typeof f.getHelper == "function" ? f.getHelper() : f, o.add(d), o.add(m));
  let h = null, u = null, b = !1;
  function v() {
    return {
      position: Tn(m.position),
      rotationDeg: kf(m.rotation),
      scale: Tn(m.scale)
    };
  }
  function y(L) {
    m.position.set(...L.position), m.rotation.set(
      L.rotationDeg[0] / We,
      L.rotationDeg[1] / We,
      L.rotationDeg[2] / We
    ), m.scale.set(...L.scale);
  }
  function x(L) {
    return u ? {
      position: L.position.map((E, Y) => E - u.position[Y]),
      rotationDeg: L.rotationDeg.map((E, Y) => E - u.rotationDeg[Y]),
      scaleFactors: L.scale.map((E, Y) => u.scale[Y] === 0 ? 1 : E / u.scale[Y])
    } : { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] };
  }
  function k() {
    u = v(), r?.({ targetSpec: h });
  }
  function g() {
    if (!u) return;
    const L = v();
    n?.({
      targetSpec: h,
      position: L.position,
      rotationDeg: L.rotationDeg,
      scale: L.scale,
      delta: x(L)
    });
  }
  function _() {
    if (!u) return;
    const L = v();
    i?.({
      targetSpec: h,
      position: L.position,
      rotationDeg: L.rotationDeg,
      scale: L.scale,
      delta: x(L),
      cancelled: !1
    }), u = null;
  }
  function A(L) {
    b = !!L?.value, c?.(b);
  }
  f.addEventListener?.("mouseDown", k), f.addEventListener?.("objectChange", g), f.addEventListener?.("mouseUp", _), f.addEventListener?.("dragging-changed", A);
  function K(L) {
    h = L, m.position.set(...L.position || [0, 0, 0]);
    const E = L.rotation || [0, 0, 0];
    m.rotation.set(E[0] / We, E[1] / We, E[2] / We), m.scale.set(...L.scale || [1, 1, 1]), f.attach(m), f.visible = !0;
  }
  function F() {
    h = null, u = null, f.detach(), f.visible = !1;
  }
  function J(L) {
    "camera" in f && (f.camera = L);
  }
  function H(L) {
    if (!xf.has(L)) throw new Error(`createTransformControlsAdapter: unknown mode "${L}"`);
    f.setMode ? f.setMode(L) : f.mode = L;
  }
  function M(L) {
    if (!wf.has(L)) throw new Error(`createTransformControlsAdapter: unknown space "${L}"`);
    f.space = L;
  }
  function P(L) {
    f.setTranslationSnap ? f.setTranslationSnap(L) : f.translationSnap = L;
  }
  function j(L) {
    f.setRotationSnap ? f.setRotationSnap(L) : f.rotationSnap = L;
  }
  function R(L) {
    f.setScaleSnap ? f.setScaleSnap(L) : f.scaleSnap = L;
  }
  function q() {
    if (!u) return;
    const L = u;
    y(L), n?.({
      targetSpec: h,
      position: L.position,
      rotationDeg: L.rotationDeg,
      scale: L.scale,
      delta: { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] }
    }), i?.({
      targetSpec: h,
      position: L.position,
      rotationDeg: L.rotationDeg,
      scale: L.scale,
      delta: { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] },
      cancelled: !0
    }), u = null;
  }
  function G() {
    f.removeEventListener?.("mouseDown", k), f.removeEventListener?.("objectChange", g), f.removeEventListener?.("mouseUp", _), f.removeEventListener?.("dragging-changed", A), o?.remove && d && o.remove(d), o?.remove && o.remove(m), f.dispose?.(), h = null, u = null;
  }
  return {
    attach: K,
    detach: F,
    setCamera: J,
    setMode: H,
    setSpace: M,
    setTranslationSnap: P,
    setRotationSnap: j,
    setScaleSnap: R,
    cancelDrag: q,
    dispose: G,
    isDragging: () => b,
    // True whenever the pointer currently hovers (or is dragging) a visible
    // handle -- `controls.axis` is kept live by TransformControls' own
    // continuous pointermove hover listener, independent of whether a drag
    // has actually started. Callers use this to detect "the next pointerdown
    // belongs to this gizmo" before TransformControls' own listener runs.
    isHoveringHandle: () => !!f.axis
  };
}
const jf = /* @__PURE__ */ new Set([
  "object",
  "camera",
  "camera_target",
  "path_point",
  "path_group",
  "camera_path",
  "path_point_target"
]);
function _f(e, { controlsFactory: t, anchorFactory: a } = {}) {
  let o = null, r = null, n = !1, i = !1;
  function c(M) {
    if (!o) return;
    const P = M || e.state.spatial_snap_mode === "grid";
    o.setTranslationSnap(P ? Math.max(0.01, Number(e.state.spatial_grid_size) || 0.5) : null), o.setRotationSnap(P ? Math.PI / 12 : null);
  }
  function l(M) {
    i = !!(M.ctrlKey || M.metaKey), o?.isDragging?.() && c(i);
  }
  function p() {
    n || typeof window > "u" || (n = !0, window.addEventListener("keydown", l, !0), window.addEventListener("keyup", l, !0));
  }
  function m() {
    n && (n = !1, window.removeEventListener("keydown", l, !0), window.removeEventListener("keyup", l, !0));
  }
  function f() {
    return o || (!e.webgl || !e.interactionElement ? null : (o = Sf({
      THREE: ld,
      camera: e.webgl.activeCamera,
      domElement: e.interactionElement,
      scene: e.webgl.scene,
      controlsFactory: t,
      anchorFactory: a,
      onDragStart: d,
      onTransform: x,
      onDragEnd: A,
      onDraggingChanged: (M) => {
        e.transformControlsDragging = M;
      }
    }), p(), o));
  }
  function d({ targetSpec: M }) {
    if (M) {
      if (c(i), M.type === "object") {
        e.checkpoint("Transform object");
        const P = Di(e), j = (P.length ? P : [M.object]).map((q) => ({
          object: q,
          transform: Ye(q)
        }));
        for (const q of j) e.beginObjectEdit(q.object);
        const R = j.reduce((q, G) => fe(q, G.transform.position), [0, 0, 0]).map((q) => q / j.length);
        r = { type: "object", group: j, pivot: R };
        return;
      }
      if (M.type === "camera") {
        e.checkpoint("Transform camera"), e.beginCameraEdit(), r = { type: "camera", position: [...e.camera.position], target: [...e.camera.target] };
        return;
      }
      if (M.type === "camera_target") {
        e.checkpoint("Move camera target"), e.beginCameraEdit();
        const P = e.activeCameraTrack?.(), j = !!P?.target_object_id;
        r = {
          type: "camera_target",
          tracking: j,
          base: j ? [...P.target_offset || [0, 0, 0]] : [...e.camera.target]
        };
        return;
      }
      if (M.type === "camera_path") {
        const P = M.track;
        if (!P || P.locked || !(P.keyframes?.length >= 1)) return;
        e.checkpoint("Transform camera path"), r = {
          type: "camera_path",
          trackId: P.id,
          origin: ps(P.keyframes),
          baseKeys: P.keyframes.map((j) => ({ ...j, camera: ce(j.camera) }))
        };
        return;
      }
      if (M.type === "path_point" || M.type === "path_group") {
        const P = M.track;
        if (!P || P.locked) return;
        const j = M.type === "path_point" ? [M.frame] : M.frames;
        e.checkpoint(M.type === "path_point" ? "Transform path point" : "Transform path selection"), r = {
          type: M.type,
          trackId: P.id,
          origin: M.position,
          selectedFrames: new Set(j),
          baseKeys: P.keyframes.map((R) => ({ ...R, camera: ce(R.camera) })),
          lookAtActive: fs(P)
        };
        return;
      }
      if (M.type === "path_point_target") {
        const P = M.track;
        if (!P || P.locked || M.readOnly) return;
        e.checkpoint("Move camera path target"), r = {
          type: "path_point_target",
          trackId: P.id,
          frame: M.frame,
          baseKeys: P.keyframes.map((j) => ({ ...j, camera: ce(j.camera) }))
        };
      }
    }
  }
  function h(M) {
    const P = e.state.gizmo_mode;
    return P === "translate" ? { mode: P, delta: M.position } : P === "scale" ? { mode: P, origin: r.origin, factors: M.scaleFactors } : { mode: P, origin: r.origin, rotationDeg: M.rotationDeg };
  }
  function u(M) {
    M.id === e.state.active_camera_id && (e.state.keyframes = M.keyframes), e.camera = $e(M, e.frame, e.state.objects), M.camera = ce(e.camera), e.refreshKeys();
  }
  function b(M) {
    const P = e.state.cameras.find((j) => j.id === r.trackId);
    P && (P.keyframes = hs(r.baseKeys, h(M)), u(P));
  }
  function v(M) {
    const P = e.state.cameras.find((R) => R.id === r.trackId);
    if (!P) return;
    const j = { ...h(M), lookAtActive: r.lookAtActive };
    P.keyframes = Bi(r.baseKeys, r.selectedFrames, j), u(P);
  }
  function y(M) {
    const P = e.state.cameras.find((j) => j.id === r.trackId);
    P && (P.keyframes = qi(r.baseKeys, [r.frame], { delta: M.position }), u(P));
  }
  function x({ delta: M }) {
    r && (r.type === "object" ? k(M) : r.type === "camera" ? g(M) : r.type === "camera_target" ? _(M) : r.type === "camera_path" ? b(M) : r.type === "path_point" || r.type === "path_group" ? v(M) : r.type === "path_point_target" && y(M), e.render());
  }
  function k(M) {
    const { group: P, pivot: j } = r, R = e.state.gizmo_mode;
    for (const q of P)
      if (R === "translate")
        q.object.position = fe(q.transform.position, M.position);
      else if (R === "rotate")
        q.object.position = fe(j, an(Fe(q.transform.position, j), M.rotationDeg)), q.object.rotation = fe(q.transform.rotation, M.rotationDeg);
      else if (R === "scale") {
        const G = Fe(q.transform.position, j);
        q.object.position = fe(j, G.map((L, E) => L * M.scaleFactors[E])), q.object.size = q.transform.size.map((L, E) => Math.max(0.01, L * M.scaleFactors[E]));
      }
    for (const q of P) e.commitObjectEdit(q.object);
  }
  function g(M) {
    if (e.state.gizmo_mode === "translate")
      e.camera.position = fe(r.position, M.position);
    else {
      const P = Fe(r.target, r.position);
      e.camera.target = fe(r.position, an(P, M.rotationDeg));
    }
    e.commitCameraEdit();
  }
  function _(M) {
    const P = fe(r.base, M.position);
    r.tracking ? Ki(e, P) : e.camera.target = P, e.commitCameraEdit();
  }
  function A({ cancelled: M }) {
    if (!r) return;
    const P = r.type;
    M ? (e.undo(), (P === "camera" || P === "camera_target") && e.finishCameraEdit()) : P === "camera" || P === "camera_target" ? e.finishCameraEdit() : (e.editingKeyFrame = null, e.updateKeyVisualState?.(), e.drawCurveEditor?.()), r = null, e.refreshInspector(), e.render();
  }
  function K() {
    if (!e.webgl || !e.interactionElement) return;
    const M = e.recording ? null : Ri(e), P = e.state.gizmo_mode || "translate";
    if (!(!!M && !M.readOnly && jf.has(M.type) && M.allowedModes.includes(P))) {
      o?.detach();
      return;
    }
    f() && (o.isDragging() || (o.setCamera(e.webgl.activeCamera), o.setMode(P), o.setSpace(e.state.gizmo_space === "local" ? "local" : "world"), o.attach(M)));
  }
  function F() {
    return !!o?.isHoveringHandle?.();
  }
  function J() {
    o?.cancelDrag();
  }
  function H() {
    m(), o?.dispose(), o = null, r = null;
  }
  return { sync: K, isPointerOverHandle: F, cancelDrag: J, dispose: H };
}
function Cf(e, t) {
  e.checkpoint(`Apply preset: ${t}`);
  const a = e.activeCameraTrack(), o = fd(t, {
    duration_frames: e.state.duration_frames,
    target: e.camera.target || [0, 1.5, 0]
  });
  a.keyframes = o, a.id === e.state.active_camera_id && (e.state.keyframes = o), e.serialize(), e.refreshKeys(), e.setFrame(0, !0), e.render(), e.setStatus(`Preset applied: ${t}`);
}
function Ef(e, t) {
  e.checkpoint(`Apply camera shake: ${t}`);
  const a = e.activeCameraTrack();
  (!a.keyframes || a.keyframes.length === 0) && (a.keyframes = [
    { frame: 0, camera: ce(e.camera), interpolation: "smooth" },
    { frame: e.state.duration_frames - 1, camera: ce(e.camera), interpolation: "smooth" }
  ]);
  const o = pd(a, { type: t, intensity: 1, duration_frames: e.state.duration_frames });
  a.keyframes = o, a.id === e.state.active_camera_id && (e.state.keyframes = o), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(`Camera shake applied: ${t}`);
}
function Af(e, t) {
  const o = {
    clean_proxy: { render_mode: "omni_ref", playblast_grid: !0, burn_in: !1, speed_heatmap: !1, guides: !1, safe_areas: !1 },
    debug_motion: { render_mode: "wireframe", playblast_grid: !0, burn_in: !0, speed_heatmap: !0, guides: !0, safe_areas: !1 },
    cinematic_view: { render_mode: "graybox", playblast_grid: !1, burn_in: !1, speed_heatmap: !1, guides: !0, safe_areas: !0 }
  }[t];
  o && (e.checkpoint(`Apply proxy preset: ${t}`), Object.assign(e.state, o), e.serialize(), e.render(), e.setStatus(`Proxy preset applied: ${t}`));
}
function Tf(e, t) {
  e.checkpoint(`Apply blocking scene: ${t}`);
  const a = e.state.duration_frames || 120, o = e.activeCameraTrack();
  t === "foreground_reveal" ? (e.state.objects = [
    { id: "fg_pillar", name: "Foreground Pillar", type: "cube", transform: { position: [-1.4, 1.5, 2.2], rotation: [0, 0, 0], scale: [0.4, 3.2, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "subject_card", name: "Subject Card", type: "card", transform: { position: [0.2, 1.5, 0], rotation: [0, 0, 0], scale: [2, 2, 1] }, material_mode: "original", enabled: !0 },
    { id: "bg_wall", name: "Background Wall", type: "cube", transform: { position: [0, 2, -5], rotation: [0, 0, 0], scale: [10, 4, 0.2] }, material_mode: "neutral", enabled: !0 }
  ], o.keyframes = [
    { frame: 0, camera: { position: [-3.2, 1.5, 4.2], target: [0.2, 1.5, 0], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: a - 1, camera: { position: [1.8, 1.5, 3.8], target: [0.2, 1.5, 0], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]) : t === "doorway_pass" ? (e.state.objects = [
    { id: "wall_left", name: "Wall Left", type: "cube", transform: { position: [-2.2, 1.5, 2], rotation: [0, 0, 0], scale: [2.8, 3.2, 0.3] }, material_mode: "neutral", enabled: !0 },
    { id: "wall_right", name: "Wall Right", type: "cube", transform: { position: [2.2, 1.5, 2], rotation: [0, 0, 0], scale: [2.8, 3.2, 0.3] }, material_mode: "neutral", enabled: !0 },
    { id: "door_lintel", name: "Door Lintel", type: "cube", transform: { position: [0, 2.9, 2], rotation: [0, 0, 0], scale: [1.6, 0.5, 0.3] }, material_mode: "neutral", enabled: !0 },
    { id: "room_subject", name: "Subject", type: "sphere", transform: { position: [0, 1.2, -2.5], rotation: [0, 0, 0], scale: [1, 1, 1] }, material_mode: "original", enabled: !0 }
  ], o.keyframes = [
    { frame: 0, camera: { position: [0, 1.6, 6.5], target: [0, 1.2, -2.5], fov: 40, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: a - 1, camera: { position: [0, 1.4, -0.5], target: [0, 1.2, -2.5], fov: 40, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]) : t === "over_the_shoulder" ? (e.state.objects = [
    { id: "fg_human", name: "Foreground OTS", type: "human", transform: { position: [-0.6, 0, 1.4], rotation: [0, 25, 0], scale: [1, 1, 1] }, material_mode: "wireframe", enabled: !0 },
    { id: "main_subject", name: "Primary Subject", type: "cube", transform: { position: [0.6, 1.2, -1.2], rotation: [0, -15, 0], scale: [1, 1.5, 0.8] }, material_mode: "original", enabled: !0 }
  ], o.keyframes = [
    { frame: 0, camera: { position: [-1.1, 1.7, 2.6], target: [0.6, 1.4, -1.2], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: a - 1, camera: { position: [-0.9, 1.65, 2.2], target: [0.6, 1.4, -1.2], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]) : t === "perspective_corridor" ? (e.state.objects = [
    { id: "col_l1", name: "Column L1", type: "cube", transform: { position: [-1.8, 1.5, 4], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_r1", name: "Column R1", type: "cube", transform: { position: [1.8, 1.5, 4], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_l2", name: "Column L2", type: "cube", transform: { position: [-1.8, 1.5, 1.5], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_r2", name: "Column R2", type: "cube", transform: { position: [1.8, 1.5, 1.5], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_l3", name: "Column L3", type: "cube", transform: { position: [-1.8, 1.5, -1], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_r3", name: "Column R3", type: "cube", transform: { position: [1.8, 1.5, -1], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "center_focus", name: "Corridor Target", type: "sphere", transform: { position: [0, 1.5, -4], rotation: [0, 0, 0], scale: [0.8, 0.8, 0.8] }, material_mode: "original", enabled: !0 }
  ], o.keyframes = [
    { frame: 0, camera: { position: [0, 1.6, 6], target: [0, 1.5, -4], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: a - 1, camera: { position: [0, 1.6, 0.5], target: [0, 1.5, -4], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]) : t === "tabletop_orbit" && (e.state.objects = [
    { id: "pedestal", name: "Pedestal Table", type: "cube", transform: { position: [0, 0.4, 0], rotation: [0, 0, 0], scale: [2, 0.8, 2] }, material_mode: "neutral", enabled: !0 },
    { id: "product", name: "Product Hero", type: "sphere", transform: { position: [0, 1.2, 0], rotation: [0, 0, 0], scale: [0.7, 0.7, 0.7] }, material_mode: "original", enabled: !0 }
  ], o.keyframes = [
    { frame: 0, camera: { position: [0, 1.4, 3.2], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: Math.round(a * 0.25), camera: { position: [3.2, 1.4, 0], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: Math.round(a * 0.5), camera: { position: [0, 1.4, -3.2], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: Math.round(a * 0.75), camera: { position: [-3.2, 1.4, 0], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: a - 1, camera: { position: [0, 1.4, 3.2], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]), o.id === e.state.active_camera_id && (e.state.keyframes = o.keyframes), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setFrame(0, !0), e.render(), e.setStatus(`Blocking scene set: ${t.replace("_", " ")}`);
}
const $n = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"], et = [4, 8, 12, 20, 35, 60, 100];
function Tt(e) {
  return e._minimapState || (e._minimapState = {
    rangeIndex: -1,
    // -1 means auto
    centerMode: "origin",
    // "origin" | "camera"
    expanded: !1,
    hover: null,
    drag: null
  }), e._minimapState;
}
function $f(e) {
  return e <= -1 ? "#38bdf8" : e <= 0.2 ? "#2dd4bf" : e <= 2.2 ? "#4ade80" : e <= 5 ? "#facc15" : e <= 10 ? "#fb923c" : "#f43f5e";
}
function Mf(e) {
  return `${e > 0 ? "+" : ""}${e.toFixed(1)}m`;
}
function qo(e, t, a) {
  if (!t || !a || t < 80 || a < 80) return null;
  const o = Tt(e), r = o.expanded ? 220 : 138, n = Math.min(r, Math.max(80, Math.min(t, a) - 20)), i = 10, c = Math.max(0, t - n - i), l = Math.max(0, a - n - i), p = e.viewportCamera(), m = p?.position || [0, 1.5, 5], f = p?.target || [0, 0, 0], d = e.activeCameraTrack?.(), h = e.state.cameras?.length ? e.state.cameras : d ? [d] : [], u = h.flatMap(
    (_) => (_.keyframes || []).map((A) => A.camera?.position).filter(Boolean)
  );
  let b = 12;
  if (o.rangeIndex >= 0 && o.rangeIndex < et.length)
    b = et[o.rangeIndex];
  else {
    const _ = Math.max(
      Math.abs(m[0] || 0),
      Math.abs(m[2] || 0),
      Math.abs(f[0] || 0),
      Math.abs(f[2] || 0),
      ...u.flatMap((A) => [Math.abs(A[0] || 0), Math.abs(A[2] || 0)]),
      4
    );
    b = Math.max(6, Math.ceil((_ + 1.5) / 4) * 4);
  }
  const v = c + n / 2, y = l + n / 2, x = n / 2 - 12, k = x / b, g = o.centerMode === "camera" ? [m[0] || 0, m[2] || 0] : [0, 0];
  return {
    rx: c,
    ry: l,
    radarSize: n,
    margin: i,
    cx: v,
    cy: y,
    innerRadius: x,
    range: b,
    scale: k,
    worldCenterX: g[0],
    worldCenterZ: g[1],
    camPos: m,
    camTgt: f,
    cameras: h,
    activeTrack: d
  };
}
function Ws(e, t, a) {
  const o = t - e.worldCenterX, r = a - e.worldCenterZ;
  return [e.cx + o * e.scale, e.cy + r * e.scale];
}
function gr(e, t, a) {
  const o = (t - e.cx) / e.scale, r = (a - e.cy) / e.scale;
  return [e.worldCenterX + o, e.worldCenterZ + r];
}
function If(e, t, a, o) {
  const r = qo(e, a, o);
  if (!r) return;
  const { rx: n, ry: i, radarSize: c, cx: l, cy: p, innerRadius: m, range: f, scale: d, camPos: h, camTgt: u, cameras: b, activeTrack: v } = r, y = Tt(e), x = e.state.active_camera_id || v?.id, k = (re, de) => Ws(r, re, de);
  t.save(), t.beginPath(), typeof t.roundRect == "function" ? t.roundRect(n, i, c, c, 10) : t.rect(n, i, c, c), t.clip(), t.fillStyle = "rgba(11, 15, 25, 0.90)", t.fillRect(n, i, c, c);
  const g = t.createRadialGradient(l, p, 2, l, p, m);
  g.addColorStop(0, "rgba(0, 210, 211, 0.06)"), g.addColorStop(1, "rgba(0, 0, 0, 0)"), t.fillStyle = g, t.fillRect(n, i, c, c), t.strokeStyle = "rgba(0, 210, 211, 0.38)", t.lineWidth = 1.2, t.strokeRect(n, i, c, c);
  const _ = [0.33, 0.66, 1];
  t.strokeStyle = "rgba(0, 210, 211, 0.12)", t.lineWidth = 1;
  for (const re of _) {
    const de = m * re;
    t.beginPath(), t.arc(l, p, de, 0, Math.PI * 2), t.stroke(), c >= 120 && (t.font = "8px monospace", t.fillStyle = "rgba(0, 210, 211, 0.35)", t.textAlign = "left", t.fillText(`${Math.round(f * re)}m`, l + de + 2, p - 2));
  }
  t.strokeStyle = "rgba(255, 255, 255, 0.10)", t.beginPath(), t.moveTo(n + 6, p), t.lineTo(n + c - 6, p), t.moveTo(l, i + 6), t.lineTo(l, i + c - 6), t.stroke(), t.font = "bold 9px sans-serif", t.textAlign = "center", t.textBaseline = "middle", t.fillStyle = "#f43f5e", t.fillText("N", l, i + 9), t.fillStyle = "rgba(255, 255, 255, 0.4)", t.fillText("S", l, i + c - 9), t.fillText("W", n + 9, p), t.fillText("E", n + c - 9, p);
  for (const re of e.state.objects || []) {
    if (re.enabled === !1) continue;
    const de = Mr(e.state.objects, re).position || [0, 0, 0], [ge, he] = k(de[0], de[2]);
    if (ge < n + 3 || ge > n + c - 3 || he < i + 3 || he > i + c - 3) continue;
    const ye = e.selectedObjectId === re.id || e.selectedObjectIds?.has?.(re.id);
    if (t.save(), t.translate(ge, he), re.type === "card") {
      const ve = (re.rotation?.[1] || 0) * Math.PI / 180;
      t.rotate(-ve), t.fillStyle = ye ? "#a855f7" : "#38bdf8", t.fillRect(-4, -1.2, 8, 2.4), t.strokeStyle = ye ? "#ffffff" : "rgba(255,255,255,0.6)", t.lineWidth = 1, t.strokeRect(-4, -1.2, 8, 2.4);
    } else if (re.type === "light") {
      t.fillStyle = ye ? "#a855f7" : "#fbbf24", t.beginPath(), t.arc(0, 0, 3, 0, Math.PI * 2), t.fill(), t.strokeStyle = "#fbbf24", t.lineWidth = 1;
      for (let ve = 0; ve < 4; ve++) {
        const pe = ve * Math.PI / 2;
        t.beginPath(), t.moveTo(Math.cos(pe) * 4, Math.sin(pe) * 4), t.lineTo(Math.cos(pe) * 6, Math.sin(pe) * 6), t.stroke();
      }
    } else
      t.fillStyle = ye ? "#a855f7" : re.type === "human" ? "#ec4899" : "#f59e0b", t.beginPath(), t.arc(0, 0, 2.8, 0, Math.PI * 2), t.fill();
    ye && (t.strokeStyle = "#a855f7", t.lineWidth = 1.2, t.beginPath(), t.arc(0, 0, 6, 0, Math.PI * 2), t.stroke()), t.restore();
  }
  for (let re = 0; re < b.length; re++) {
    const de = b[re], ge = de.keyframes || [], he = de.id === x, ye = de.color || $n[re % $n.length];
    t.save(), t.strokeStyle = ye, t.globalAlpha = he ? 0.95 : 0.4, t.lineWidth = he ? 2 : 1, t.setLineDash(he ? [] : [2, 2]), t.beginPath();
    let ve = !1;
    const pe = ge[0]?.frame, Me = ge[ge.length - 1]?.frame;
    for (let xe = pe; Number.isFinite(xe) && xe <= Me; xe++) {
      const we = $e(de, xe, e.state.objects)?.position;
      if (!Array.isArray(we)) continue;
      const [be, N] = k(we[0], we[2]);
      ve ? t.lineTo(be, N) : (t.moveTo(be, N), ve = !0);
    }
    ve && t.stroke(), t.restore(), t.save();
    for (const xe of ge) {
      const we = xe.camera?.position;
      if (!we) continue;
      const [be, N] = k(we[0], we[2]);
      if (be < n + 4 || be > n + c - 4 || N < i + 4 || N > i + c - 4) continue;
      const V = xe.frame === e.frame && he;
      t.fillStyle = V ? "#ffffff" : ye, t.globalAlpha = he ? 0.95 : 0.6, t.beginPath(), t.moveTo(be, N - 3), t.lineTo(be + 3, N), t.lineTo(be, N + 3), t.lineTo(be - 3, N), t.closePath(), t.fill(), V && (t.strokeStyle = "#00d2d3", t.lineWidth = 1.2, t.stroke());
    }
    t.restore();
  }
  const [A, K] = k(h[0] || 0, h[2] || 0), [F, J] = k(u[0] || 0, u[2] || 0), H = 8, M = ee(A, n + H, n + c - H), P = ee(K, i + H, i + c - H), j = ee(F, n + H, n + c - H), R = ee(J, i + H, i + c - H), q = h[1] || 0, G = $f(q), L = Mf(q);
  t.strokeStyle = "rgba(255, 255, 255, 0.40)", t.lineWidth = 1, t.setLineDash([3, 3]), t.beginPath(), t.moveTo(M, P), t.lineTo(j, R), t.stroke(), t.setLineDash([]), t.fillStyle = "#ffffff", t.beginPath(), t.arc(j, R, 2.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "rgba(255, 255, 255, 0.7)", t.lineWidth = 1, t.beginPath(), t.arc(j, R, 4.5, 0, Math.PI * 2), t.stroke();
  const E = u[0] - h[0], Y = u[2] - h[2], D = Math.atan2(Y, E), te = (e.viewportCamera().fov || 35) * Math.PI / 360, le = ee(24 * (d / (m / 8)), 16, 38), se = t.createRadialGradient(M, P, 2, M, P, le);
  se.addColorStop(0, G + "55"), se.addColorStop(1, G + "08"), t.fillStyle = se, t.strokeStyle = G, t.lineWidth = 1.2, t.beginPath(), t.moveTo(M, P), t.lineTo(M + Math.cos(D - te) * le, P + Math.sin(D - te) * le), t.arc(M, P, le, D - te, D + te), t.closePath(), t.fill(), t.stroke(), t.fillStyle = G + "44", t.beginPath(), t.arc(M, P, 6.5, 0, Math.PI * 2), t.fill(), t.fillStyle = G, t.beginPath(), t.arc(M, P, 3.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "#ffffff", t.lineWidth = 1.5, t.beginPath(), t.moveTo(M, P), t.lineTo(M + Math.cos(D) * 7, P + Math.sin(D) * 7), t.stroke(), Of(e, t, r, G, L, D, Math.hypot(E, Y)), y.hover && Pf(t, r, y.hover), t.restore();
}
function Of(e, t, a, o, r, n, i) {
  const { rx: c, ry: l, radarSize: p } = a, m = Tt(e);
  t.fillStyle = "rgba(15, 23, 42, 0.75)", t.fillRect(c, l, p, 18), t.strokeStyle = "rgba(0, 210, 211, 0.2)", t.lineWidth = 1, t.beginPath(), t.moveTo(c, l + 18), t.lineTo(c + p, l + 18), t.stroke(), t.font = "bold 9px sans-serif", t.fillStyle = "#00d2d3", t.textAlign = "left", t.textBaseline = "middle", t.fillText("RADAR", c + 6, l + 9);
  const f = l + 3, d = 12;
  go(t, c + 44, f, 12, d, "−", m.hover?.button === "zoom_out"), go(t, c + 58, f, 12, d, "+", m.hover?.button === "zoom_in");
  const h = m.centerMode === "camera" ? "CAM" : "CTR";
  go(t, c + 72, f, 22, d, h, m.hover?.button === "center");
  const u = m.expanded ? "⤡" : "⤢";
  go(t, c + 96, f, 14, d, u, m.hover?.button === "size"), t.font = "bold 8.5px monospace", t.fillStyle = o, t.textAlign = "right", t.fillText(`Y:${r}`, c + p - 5, l + 9), t.fillStyle = "rgba(15, 23, 42, 0.70)", t.fillRect(c, l + p - 15, p, 15), t.strokeStyle = "rgba(0, 210, 211, 0.15)", t.beginPath(), t.moveTo(c, l + p - 15), t.lineTo(c + p, l + p - 15), t.stroke();
  const b = Math.round((n * 180 / Math.PI + 360) % 360);
  t.font = "8px monospace", t.fillStyle = "rgba(255, 255, 255, 0.55)", t.textAlign = "left", t.fillText(`HDG:${b}°`, c + 5, l + p - 7), t.textAlign = "right", t.fillText(`DIST:${i.toFixed(1)}m`, c + p - 5, l + p - 7);
}
function go(e, t, a, o, r, n, i) {
  e.fillStyle = i ? "rgba(0, 210, 211, 0.35)" : "rgba(255, 255, 255, 0.10)", e.fillRect(t, a, o, r), e.strokeStyle = i ? "#00d2d3" : "rgba(255, 255, 255, 0.20)", e.lineWidth = 1, e.strokeRect(t, a, o, r), e.font = "bold 8px sans-serif", e.fillStyle = i ? "#ffffff" : "rgba(255, 255, 255, 0.75)", e.textAlign = "center", e.textBaseline = "middle", e.fillText(n, t + o / 2, a + r / 2);
}
function Pf(e, t, a) {
  if (!a || !a.text) return;
  const { rx: o, ry: r, radarSize: n } = t;
  e.font = "9px sans-serif";
  const i = e.measureText(a.text).width + 12, c = 16, l = ee(a.px - i / 2, o + 4, o + n - i - 4), p = a.pz > t.cy ? a.pz - 22 : a.pz + 8;
  e.fillStyle = "rgba(15, 23, 42, 0.94)", e.fillRect(l, p, i, c), e.strokeStyle = "#00d2d3", e.lineWidth = 1, e.strokeRect(l, p, i, c), e.fillStyle = "#ffffff", e.textAlign = "center", e.textBaseline = "middle", e.fillText(a.text, l + i / 2, p + c / 2);
}
function Vs(e, t, a) {
  const { rx: o, ry: r } = e, n = r + 3;
  return a < n || a > n + 12 ? null : t >= o + 44 && t <= o + 56 ? "zoom_out" : t >= o + 58 && t <= o + 70 ? "zoom_in" : t >= o + 72 && t <= o + 94 ? "center" : t >= o + 96 && t <= o + 110 ? "size" : null;
}
function Hs(e, t, a, o) {
  const { camPos: r, camTgt: n, cameras: i, rx: c, ry: l, radarSize: p } = t, m = (v, y) => Ws(t, v, y), [f, d] = m(r[0] || 0, r[2] || 0);
  if (Math.hypot(a - f, o - d) <= 8)
    return { type: "camera", pos: r };
  const [h, u] = m(n[0] || 0, n[2] || 0);
  if (Math.hypot(a - h, o - u) <= 8)
    return { type: "target", pos: n };
  const b = e.activeCameraTrack?.();
  if (b)
    for (const v of b.keyframes || []) {
      const y = v.camera?.position;
      if (!y) continue;
      const [x, k] = m(y[0], y[2]);
      if (Math.hypot(a - x, o - k) <= 6)
        return { type: "keyframe", key: v, frame: v.frame };
    }
  for (const v of e.state.objects || []) {
    if (v.enabled === !1) continue;
    const y = Mr(e.state.objects, v).position || [0, 0, 0], [x, k] = m(y[0], y[2]);
    if (Math.hypot(a - x, o - k) <= 7)
      return { type: "object", object: v, id: v.id };
  }
  return null;
}
function Lf(e, t, a, o) {
  if (!e.state.show_radar || t.button != null && t.button !== 0 || t.altKey || t.ctrlKey || t.metaKey || e.isNavigatingFly || e.cameraPathDraw) return !1;
  const r = qo(e, e.canvas.width, e.canvas.height);
  if (!r) return !1;
  const { rx: n, ry: i, radarSize: c } = r;
  if (a < n || a > n + c || o < i || o > i + c)
    return !1;
  t.preventDefault?.(), t.stopPropagation?.();
  const l = Tt(e), p = Vs(r, a, o);
  if (p)
    return p === "zoom_in" ? (l.rangeIndex === -1 && (l.rangeIndex = et.findIndex((h) => h >= r.range), l.rangeIndex < 0 && (l.rangeIndex = et.length - 1)), l.rangeIndex = Math.max(0, (l.rangeIndex === -1 ? 2 : l.rangeIndex) - 1)) : p === "zoom_out" ? (l.rangeIndex === -1 && (l.rangeIndex = et.findIndex((h) => h >= r.range), l.rangeIndex < 0 && (l.rangeIndex = 0)), l.rangeIndex = Math.min(et.length - 1, l.rangeIndex + 1)) : p === "center" ? l.centerMode = l.centerMode === "camera" ? "origin" : "camera" : p === "size" && (l.expanded = !l.expanded), e.render?.(), !0;
  const m = Hs(e, r, a, o);
  if (m) {
    if (m.type === "camera")
      return e.checkpoint?.("Move camera via radar"), e.beginCameraEdit?.(), l.drag = { type: "camera", startWorld: [r.camPos[0], r.camPos[2]] }, !0;
    if (m.type === "target")
      return e.checkpoint?.("Move look-at target via radar"), e.beginCameraEdit?.(), l.drag = { type: "target", startWorld: [r.camTgt[0], r.camTgt[2]] }, !0;
    if (m.type === "keyframe")
      return e.seekFrame?.(m.frame), e.render?.(), !0;
    if (m.type === "object")
      return e.selectObject?.(m.id), e.render?.(), !0;
  }
  const [f, d] = gr(r, a, o);
  if (t.shiftKey) {
    e.checkpoint?.("Set target via radar"), e.beginCameraEdit?.();
    const h = e.viewportCamera();
    h.target = [f, h.target?.[1] || 0, d], e.commitCameraEdit?.();
  } else {
    e.checkpoint?.("Set camera via radar"), e.beginCameraEdit?.();
    const h = e.viewportCamera();
    h.position = [f, h.position?.[1] || 1.5, d], e.commitCameraEdit?.();
  }
  return e.setFrame?.(e.frame, !1, !1), e.render?.(), !0;
}
function Nf(e, t, a, o) {
  if (!e.state.show_radar || e.drag || e.boxSelection || e.gizmoDrag || e.keyDrag || e.cameraPathDraw || e.pathDrag || e.timelineDrag || e.curveDrag)
    return !1;
  const r = qo(e, e.canvas.width, e.canvas.height);
  if (!r) return !1;
  const n = Tt(e), { rx: i, ry: c, radarSize: l } = r, p = a >= i && a <= i + l && o >= c && o <= c + l;
  if (n.drag) {
    const [b, v] = gr(r, a, o), y = e.viewportCamera();
    return n.drag.type === "camera" ? y.position = [b, y.position?.[1] || 1.5, v] : n.drag.type === "target" && (y.target = [b, y.target?.[1] || 0, v]), e.setFrame?.(e.frame, !1, !1), e.render?.(), !0;
  }
  if (!p)
    return n.hover && (n.hover = null, e.render?.()), !1;
  const m = Vs(r, a, o), f = Hs(e, r, a, o), [d, h] = gr(r, a, o);
  let u = `[${d.toFixed(1)}m, ${h.toFixed(1)}m]`;
  return m === "zoom_in" ? u = s("Zoom in (+)") : m === "zoom_out" ? u = s("Zoom out (−)") : m === "center" ? u = n.centerMode === "camera" ? s("Center: Cam") : s("Center: World") : m === "size" ? u = n.expanded ? s("Compact mode") : s("Expand radar") : f?.type === "camera" ? u = s("Camera (drag to move)") : f?.type === "target" ? u = s("Look-At Target (drag to move)") : f?.type === "keyframe" ? u = `${s("Keyframe")} F${f.frame}` : f?.type === "object" && (u = f.object.name || f.object.type || s("Object")), n.hover = {
    button: m,
    hit: f,
    px: a,
    pz: o,
    text: u
  }, e.interactionElement?.style && (e.interactionElement.style.cursor = m || f ? "pointer" : "crosshair"), e.render?.(), !0;
}
function ar(e, t) {
  const a = e._minimapState;
  return !a || !a.drag ? !1 : (e.commitCameraEdit?.(), a.drag = null, e.interactionElement?.style && (e.interactionElement.style.cursor = "default"), e.render?.(), !0);
}
function zf(e, t, a, o) {
  if (!e.state.show_radar) return !1;
  const r = qo(e, e.canvas.width, e.canvas.height);
  if (!r) return !1;
  const { rx: n, ry: i, radarSize: c } = r;
  if (a < n || a > n + c || o < i || o > i + c)
    return !1;
  t.preventDefault?.(), t.stopPropagation?.();
  const l = Tt(e), p = Math.sign(t.deltaY || 0);
  return l.rangeIndex === -1 && (l.rangeIndex = et.findIndex((m) => m >= r.range), l.rangeIndex < 0 && (l.rangeIndex = 2)), p > 0 ? l.rangeIndex = Math.min(et.length - 1, l.rangeIndex + 1) : p < 0 && (l.rangeIndex = Math.max(0, l.rangeIndex - 1)), e.render?.(), !0;
}
function Ff(e, t, a) {
  for (const d of ["object-x", "object-y", "object-z", "object-px", "object-py", "object-pz", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz", "object-intensity", "object-cone-angle", "object-penumbra", "object-cast-shadow"])
    for (const h of e.root.querySelectorAll(`[data-role="${d}"]`))
      h.addEventListener("input", () => e.updateSelectedObject(), { signal: a }), h.addEventListener("change", () => e.updateSelectedObject(), { signal: a });
  for (const d of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"])
    for (const h of e.root.querySelectorAll(`[data-role="${d}"]`))
      h.addEventListener("input", () => e.updateCameraFromHud(), { signal: a }), h.addEventListener("change", () => e.updateCameraFromHud(), { signal: a });
  for (const d of ["camera-rx", "camera-ry", "camera-rz"])
    for (const h of e.root.querySelectorAll(`[data-role="${d}"]`))
      h.addEventListener("input", () => e.updateCameraRotationFromHud(), { signal: a }), h.addEventListener("change", () => e.updateCameraRotationFromHud(), { signal: a });
  t('[data-role="animation-select"]')?.addEventListener("change", (d) => e.selectObjectAnimation(Number(d.target.value)), { signal: a }), t('[data-role="object-parent"]')?.addEventListener("change", (d) => e.setObjectParent(d.target.value || null), { signal: a });
  const o = () => {
    const d = e.selectedObject?.();
    if (!d || d.locked) return;
    e.checkpoint?.("Edit labels");
    const h = Wi(t('[data-role="object-tags"]')?.value || "");
    h.length ? d.tags = h : delete d.tags;
    const u = String(t('[data-role="object-annotation"]')?.value || "").trim(), b = u ? ns({
      text: u,
      color: t('[data-role="object-annotation-color"]')?.value,
      anchor: t('[data-role="object-annotation-anchor"]')?.value,
      visible: !0
    }) : null;
    b ? d.annotation = b : delete d.annotation, e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.labelOverlay?.update?.(), e.render?.();
  };
  for (const d of ["object-tags", "object-annotation", "object-annotation-color", "object-annotation-anchor"])
    t(`[data-role="${d}"]`)?.addEventListener("change", o, { signal: a });
  t('[data-role="duration-seconds"]')?.addEventListener("change", (d) => {
    e.durationWidget && Number(e.durationWidget.value) !== Number(d.target.value) && e.checkpoint("Change duration"), e.durationWidget && (e.durationWidget.value = Number(d.target.value)), e.syncFromWidgets();
  }, { signal: a }), t('[data-role="timeline-fps"]')?.addEventListener("change", (d) => {
    e.fpsWidget && Number(e.fpsWidget.value) !== Number(d.target.value) && e.checkpoint("Change FPS"), e.fpsWidget && (e.fpsWidget.value = Number(d.target.value)), e.syncFromWidgets();
  }, { signal: a }), Sd(e, a), Jd(e, a), t('[data-role="curve-group"]')?.addEventListener("change", () => {
    e.setChannelFilter("all"), $s(e), e.drawCurveEditor(), zr(e);
  }, { signal: a }), t('[data-act="curve-handles"]')?.addEventListener("click", () => e.toggleCurveHandles(), { signal: a });
  for (const d of e.root.querySelectorAll("[data-curve-mode]"))
    d.addEventListener("click", () => e.setCurveInterpolation(d.dataset.curveMode), { signal: a });
  for (const d of e.root.querySelectorAll("[data-tangent-mode]"))
    d.addEventListener("click", () => e.setTangentMode(d.dataset.tangentMode), { signal: a });
  for (const d of e.root.querySelectorAll("[data-channel-filter]"))
    d.addEventListener("click", () => e.setChannelFilter(d.dataset.channelFilter), { signal: a });
  const r = t('[data-role="curve-canvas"]');
  r && (r.addEventListener("pointerdown", (d) => e.onCurvePointerDown(d), { signal: a }), r.addEventListener("pointermove", (d) => e.onCurvePointerMove(d), { signal: a }), r.addEventListener("pointerup", (d) => e.onCurvePointerUp(d), { signal: a }), r.addEventListener("pointercancel", (d) => e.onCurvePointerUp(d), { signal: a }), r.addEventListener("pointerleave", () => {
    e.curveHover = null, e.drawCurveEditor();
  }, { signal: a }), r.addEventListener("dblclick", (d) => e.onCurveDoubleClick?.(d), { signal: a }), r.addEventListener("wheel", (d) => Nd(e, d), { passive: !1, signal: a })), t('[data-act="curve-zoom-in"]')?.addEventListener("click", () => e.zoomCurve(1.25), { signal: a }), t('[data-act="curve-zoom-out"]')?.addEventListener("click", () => e.zoomCurve(0.8), { signal: a }), t('[data-act="curve-fit"]')?.addEventListener("click", () => e.resetCurveZoom(), { signal: a }), t('[data-role="key-frame"]')?.addEventListener("change", (d) => e.retimeSelectedKey(Number(d.target.value)), { signal: a });
  for (const d of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type", "key-timing-weight"])
    t(`[data-role="${d}"]`)?.addEventListener("change", () => e.updateSelectedKey(), { signal: a });
  t('[data-act="redistribute-key-timing"]')?.addEventListener("click", () => e.redistributeActiveCameraTiming(), { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="ui-density"]'))
    d.addEventListener("change", (h) => e.setDensity(h.target.value), { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="preview-layout"]'))
    d.addEventListener("change", (h) => {
      e.state.preview_layout = h.target.value, e.scheduleSerialize(), e.refreshCameraPreviews(), e.renderCameraView(), e.setStatus(`Preview layout: ${h.target.value}`);
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-act="aim-at-object"]'))
    d.addEventListener("click", () => {
      e.aimAtSelectedObject(), e.closeMenus();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-act="bake-aim-keys"]'))
    d.addEventListener("click", () => {
      e.bakeAimConstraint({ perFrame: !1 }), e.closeMenus();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-act="bake-aim-per-frame"]'))
    d.addEventListener("click", () => {
      e.bakeAimConstraint({ perFrame: !0 }), e.closeMenus();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="camera-target-object"]'))
    d.addEventListener("change", (h) => {
      e.setCameraTrackingTarget(h.target.value);
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="camera-aim-bone"]'))
    d.addEventListener("change", (h) => {
      e.setAimBone(h.target.value);
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-act="focus-target"]'))
    d.addEventListener("click", () => {
      e.focusCameraTarget(), e.closeMenus();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="gizmo-space"]'))
    d.addEventListener("change", (h) => {
      e.state.gizmo_space = h.target.value;
      for (const u of e.root.querySelectorAll('[data-role="gizmo-space"]')) u.value = h.target.value;
      e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="navigation-profile"]'))
    d.addEventListener("change", (h) => {
      e.state.navigation_profile = ["blender", "simple"].includes(h.target.value) ? h.target.value : "maya", e.scheduleSerialize(), e.setStatus(`Navigation: ${e.state.navigation_profile}`);
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="spatial-snap-mode"]'))
    d.addEventListener("change", (h) => {
      e.state.spatial_snap_mode = ["grid", "vertex"].includes(h.target.value) ? h.target.value : "none", e.scheduleSerialize(), e.setStatus(`Spatial Snap: ${e.state.spatial_snap_mode}`);
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="spatial-grid-size"]'))
    d.addEventListener("change", (h) => {
      e.state.spatial_grid_size = Math.max(0.01, Math.min(100, Number(h.target.value) || 0.5)), h.target.value = String(e.state.spatial_grid_size), e.scheduleSerialize();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="view-mode"]'))
    d.addEventListener("change", (h) => e.setViewMode(h.target.value), { signal: a });
  const n = t('[data-role="label-mode"]'), i = t('[data-role="label-content"]');
  n && (n.value = e.labelOverlay?.settings?.mode || "selected", n.addEventListener("change", (d) => e.labelOverlay?.setMode(d.target.value), { signal: a })), i && (i.value = e.labelOverlay?.settings?.content || "annotation", i.addEventListener("change", (d) => e.labelOverlay?.setContent(d.target.value), { signal: a }));
  for (const d of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    d.addEventListener("click", () => e.toggleInspector(), { signal: a });
  for (const d of e.root.querySelectorAll('[data-act="clear-selection"]'))
    d.addEventListener("click", () => {
      e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="timeline-summary"]'))
    d.addEventListener("click", () => {
      e.selectedEntity === "object" && (e.selectedEntity = "camera", e.selectedObjectId = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Editing: ${e.activeCameraTrack().name}`)));
    }, { signal: a });
  for (const d of e.root.querySelectorAll(".toolbar-menu"))
    d.addEventListener("toggle", () => {
      d.open && e.closeMenus(d);
    }, { signal: a });
  const c = (d, h) => {
    const u = d instanceof HTMLElement ? d.closest(".scene-item") : null;
    if (!(!u || h.button === 2 || d.closest(".scene-action-btn")))
      if (u.dataset.objectId) {
        const b = e.state.objects.find((y) => y.id === u.dataset.objectId);
        if (!b) return;
        if (e.finishCameraEdit(), e.selectedObjectIds ||= /* @__PURE__ */ new Set(), h.ctrlKey || h.metaKey)
          e.selectedObjectIds.has(b.id) ? e.selectedObjectIds.delete(b.id) : e.selectedObjectIds.add(b.id), e.outlinerAnchorId = b.id;
        else if (h.shiftKey && e.outlinerAnchorId && e.state.objects.some((y) => y.id === e.outlinerAnchorId)) {
          const y = e.state.objects.map((g) => g.id), x = y.indexOf(e.outlinerAnchorId), k = y.indexOf(b.id);
          e.selectedObjectIds = new Set(y.slice(Math.min(x, k), Math.max(x, k) + 1));
        } else
          e.selectedObjectIds = /* @__PURE__ */ new Set([b.id]), e.outlinerAnchorId = b.id;
        e.selectedObjectId = e.selectedObjectIds.has(b.id) ? b.id : [...e.selectedObjectIds].at(-1) || null, e.selectedEntity = e.selectedObjectIds.size ? "object" : "camera", e.selectedKeyFrame = e.selectedObjectId ? b.keyframes?.find((y) => y.frame === e.frame)?.frame ?? null : null, e.editingKeyFrame = null;
        for (const y of e.root.querySelectorAll(".scene-item")) {
          const x = !!(y.dataset.objectId && e.selectedObjectIds.has(y.dataset.objectId)), k = !!(y.dataset.objectId && y.dataset.objectId === e.selectedObjectId);
          y.classList.toggle("selected", x), y.classList.toggle("primary", k), y.setAttribute("aria-selected", String(x));
        }
        const v = e.root.querySelector('[data-role="outliner-batch-bar"]');
        if (v) {
          const y = e.selectedObjectIds?.size || 0;
          v.hidden = y < 2;
          const x = v.querySelector('[data-role="batch-count"]');
          x && (x.textContent = `${y} ${s("selected")}`);
        }
        e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Selected: ${b.name || b.type}`));
      } else u.dataset.cameraId && e.activateCamera(u.dataset.cameraId);
  };
  e.root.addEventListener("pointerdown", (d) => {
    c(d.composedPath?.()[0] || d.target, d);
  }, { capture: !0, signal: a }), e.root.addEventListener("pointerdown", (d) => {
    const h = d.composedPath?.()[0] || d.target;
    h instanceof HTMLElement && h.closest(".context-menu, [data-role='context-menu']") || (d.stopPropagation(), h instanceof HTMLElement && !h.closest(".toolbar-menu") && e.closeMenus(), h instanceof HTMLElement && !h.closest(".key,.key-editor,canvas") && e.exitKeyEdit(!0), (!(h instanceof HTMLElement) || !h.closest("input,select,textarea,button,[contenteditable=true]")) && e.root.focus({ preventScroll: !0 }));
  }, { signal: a }), document.addEventListener("pointerdown", (d) => {
    const h = d.composedPath?.()[0] || d.target;
    h instanceof HTMLElement && h.closest(".context-menu, [data-role='context-menu']") || (!(h instanceof Node) || !e.root.contains(h)) && (e.closeMenus(), e.exitKeyEdit(!0));
  }, { capture: !0, signal: a }), e.root.addEventListener("mousedown", (d) => d.stopPropagation(), { signal: a }), e.root.addEventListener("contextmenu", (d) => e.onContextMenu(d), { signal: a }), e.interactionElement?.addEventListener("pointerdown", (d) => {
    const h = e.interactionElement.getBoundingClientRect(), u = (d.clientX - h.left) * e.canvas.width / Math.max(1, h.width), b = (d.clientY - h.top) * e.canvas.height / Math.max(1, h.height);
    Lf(e, d, u, b) || e.onPointerDown(d);
  }, { signal: a }), e.interactionElement?.addEventListener("pointermove", (d) => {
    const h = e.interactionElement.getBoundingClientRect(), u = (d.clientX - h.left) * e.canvas.width / Math.max(1, h.width), b = (d.clientY - h.top) * e.canvas.height / Math.max(1, h.height);
    Nf(e, d, u, b) || e.onPointerMove(d);
  }, { signal: a }), e.interactionElement?.addEventListener("pointerup", (d) => {
    ar(e) || e.onPointerUp(d);
  }, { signal: a }), e.interactionElement?.addEventListener("pointercancel", (d) => {
    ar(e), e.onPointerUp(d);
  }, { signal: a }), e.interactionElement?.addEventListener("lostpointercapture", (d) => {
    ar(e), e.onPointerUp(d);
  }, { signal: a }), e.interactionElement?.addEventListener("dblclick", (d) => {
    e.insertPathKeyAtCursor?.(d) || e.setTargetAtCursor(d);
  }, { signal: a }), e.interactionElement?.addEventListener("wheel", (d) => {
    const h = e.interactionElement.getBoundingClientRect(), u = (d.clientX - h.left) * e.canvas.width / Math.max(1, h.width), b = (d.clientY - h.top) * e.canvas.height / Math.max(1, h.height);
    zf(e, d, u, b) || e.onWheel(d);
  }, { passive: !1, signal: a }), e.root.addEventListener("wheel", nd(e.root), { signal: a }), window.addEventListener("pointermove", (d) => {
    e.keyDrag && e.onPointerMove(d);
  }, { capture: !0, signal: a }), window.addEventListener("pointerup", (d) => {
    e.keyDrag && e.onPointerUp(d);
  }, { capture: !0, signal: a }), window.addEventListener("pointercancel", (d) => {
    e.keyDrag && e.onPointerUp(d);
  }, { capture: !0, signal: a });
  const l = t('[data-role="dope-tracks"]');
  l && (l.addEventListener("pointerdown", (d) => e.onTimelinePointerDown(d), { signal: a }), l.addEventListener("pointermove", (d) => e.onTimelinePointerMove(d), { signal: a }), l.addEventListener("pointerup", (d) => e.onTimelinePointerUp(d), { signal: a }), l.addEventListener("pointercancel", (d) => e.onTimelinePointerUp(d), { signal: a }), l.addEventListener("wheel", (d) => os(e, d), { passive: !1, signal: a }));
  const p = (d) => {
    const h = Vi(d.composedPath?.()[0] || d.target);
    h && (e.lastKeyZone = h);
  };
  e.root.addEventListener("focusin", p, { signal: a }), e.root.addEventListener("pointerdown", p, { capture: !0, signal: a }), e.root.addEventListener("focusout", (d) => {
    e.modalTransform && !e.root.contains(d.relatedTarget) && (Ui(e), e.render());
  }, { signal: a });
  const m = new ResizeObserver(() => {
    e.scheduleResizeAndRender();
  }), f = e.root.querySelector(".viewport-wrap");
  f && m.observe(f), e.resizeObserver = m, e.updateEditState();
}
const Rf = "🔘", Mn = [
  { id: "nav", label: () => s("Navigation & Controls"), icon: "pi-compass" },
  { id: "view", label: () => s("Display & Viewport"), icon: "pi-eye" },
  { id: "time", label: () => s("Timeline & Keys"), icon: "pi-clock" },
  { id: "defaults", label: () => s("Defaults & Pipeline"), icon: "pi-sliders-h" }
];
function Df(e, t) {
  Ir.find((o) => o.id === e)?.onChange?.(t);
}
function Kf(e) {
  const t = zc(e.id, e.defaultValue), a = `pref_${e.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
  if (e.type === "boolean")
    return `
      <div class="oc-pref-row toggle-row" title="${e.tooltip || ""}">
        <label for="${a}" class="oc-pref-label">${s(e.name)}</label>
        <input type="checkbox" id="${a}" data-setting-id="${e.id}" ${t ? "checked" : ""}>
      </div>`;
  if (e.type === "combo") {
    const o = (e.options || []).map((r) => {
      const n = typeof r == "object" ? r.value : r, i = typeof r == "object" ? r.text : r, c = String(t) === String(n) ? "selected" : "";
      return `<option value="${n}" ${c}>${s(i)}</option>`;
    }).join("");
    return `
      <div class="oc-pref-row" title="${e.tooltip || ""}">
        <label for="${a}" class="oc-pref-label">${s(e.name)}</label>
        <select id="${a}" data-setting-id="${e.id}">${o}</select>
      </div>`;
  }
  if (e.type === "slider") {
    const o = e.attrs?.min ?? 0, r = e.attrs?.max ?? 100, n = e.attrs?.step ?? 1;
    return `
      <div class="oc-pref-row slider-row" title="${e.tooltip || ""}">
        <label for="${a}" class="oc-pref-label">${s(e.name)}</label>
        <div class="oc-pref-slider-group">
          <input type="range" id="${a}" data-setting-id="${e.id}" min="${o}" max="${r}" step="${n}" value="${t}">
          <span class="oc-pref-val" data-val-for="${e.id}">${t}</span>
        </div>
      </div>`;
  }
  if (e.type === "color") {
    const o = String(t || "121212").startsWith("#") ? String(t) : `#${t}`;
    return `
      <div class="oc-pref-row" title="${e.tooltip || ""}">
        <label for="${a}" class="oc-pref-label">${s(e.name)}</label>
        <input type="color" id="${a}" data-setting-id="${e.id}" value="${o}">
      </div>`;
  }
  return "";
}
function Bf(e) {
  const t = new Map(Ir.map((o) => [o.id, o]));
  return ({
    nav: [
      Ac,
      Tc,
      $c,
      Mc,
      Ic,
      Oc,
      Pc,
      Lc,
      Nc
    ],
    view: [
      pc,
      fc,
      hc,
      uc,
      bc,
      gc,
      yc,
      vc,
      xc,
      wc,
      kc,
      Sc,
      jc,
      _c,
      Cc,
      Ec
    ],
    time: [
      nc,
      sc,
      ic,
      cc,
      lc,
      dc,
      mc
    ],
    defaults: [
      Yi,
      Xi,
      Ji,
      Zi,
      Qi,
      ec,
      tc,
      ac,
      oc,
      rc
    ]
  }[e] || []).map((o) => t.get(o)).filter(Boolean);
}
function qf() {
  return `<span class="oc-pref-emoji" aria-hidden="true">${Rf}</span> ${s("OmniCam Preferences")}`;
}
function Uf(e) {
  const t = e.root.querySelector(".oc-modal-backdrop");
  if (t) {
    t.querySelector(".oc-pref-dialog")?.focus();
    return;
  }
  const a = document.createElement("div");
  a.className = "oc-modal-backdrop", a.setAttribute("role", "dialog"), a.setAttribute("aria-modal", "true"), a.setAttribute("aria-label", s("OmniCam Preferences")), a.innerHTML = `
    <div class="oc-modal-dialog oc-pref-dialog" tabindex="-1">
      <div class="oc-pref-header">
        <div class="oc-pref-title">${qf()}</div>
        <button type="button" class="icon-button oc-pref-close" title="${s("Close")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="oc-pref-tabs">
        ${Mn.map((r, n) => `
          <button type="button" class="oc-pref-tab ${n === 0 ? "active" : ""}" data-tab="${r.id}">
            <i class="pi ${r.icon}"></i> <span>${r.label()}</span>
          </button>
        `).join("")}
      </div>
      <div class="oc-pref-content">
        ${Mn.map((r, n) => `
          <div class="oc-pref-pane ${n === 0 ? "active" : ""}" data-pane="${r.id}">
            ${Bf(r.id).map(Kf).join("")}
          </div>
        `).join("")}
      </div>
      <div class="oc-pref-footer">
        <button type="button" class="secondary" data-pref-act="reset-defaults">
          <i class="pi pi-undo"></i> ${s("Reset to Defaults")}
        </button>
        <span class="oc-pref-spacer"></span>
        <button type="button" class="primary" data-pref-act="close-dialog">${s("Done")}</button>
      </div>
    </div>
  `;
  const o = () => {
    a.remove(), e.root.focus?.();
  };
  a.addEventListener("click", (r) => {
    (r.target === a || r.target.closest(".oc-pref-close, [data-pref-act='close-dialog']")) && o();
  }), a.addEventListener("keydown", (r) => {
    r.key === "Escape" && (r.stopPropagation(), o());
  }), a.querySelectorAll(".oc-pref-tab").forEach((r) => {
    r.addEventListener("click", () => {
      const n = r.dataset.tab;
      a.querySelectorAll(".oc-pref-tab").forEach((i) => i.classList.toggle("active", i === r)), a.querySelectorAll(".oc-pref-pane").forEach((i) => i.classList.toggle("active", i.dataset.pane === n));
    });
  }), a.addEventListener("input", (r) => {
    const n = r.target, i = n.dataset.settingId;
    if (!i) return;
    let c;
    if (n.type === "checkbox")
      c = n.checked;
    else if (n.type === "range" || n.type === "number") {
      c = Number(n.value);
      const l = a.querySelector(`[data-val-for="${i}"]`);
      l && (l.textContent = String(c));
    } else
      c = n.value;
    Hi(i, c), Df(i, c);
  }), a.querySelector('[data-pref-act="reset-defaults"]')?.addEventListener("click", () => {
    Gi();
    for (const r of Ir) {
      const n = a.querySelector(`[data-setting-id="${r.id}"]`);
      if (!n) continue;
      const i = r.defaultValue;
      if (n.type === "checkbox")
        n.checked = !!i;
      else {
        n.value = String(i);
        const c = a.querySelector(`[data-val-for="${r.id}"]`);
        c && (c.textContent = String(i));
      }
    }
    e.setStatus?.(s("Preferences reset to defaults"));
  }), e.root.appendChild(a), a.querySelector(".oc-modal-dialog")?.focus();
}
function Wf(e, t, a) {
  for (const o of e.root.querySelectorAll('[data-act="play"]'))
    o.addEventListener("click", () => e.togglePlay(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="key"]'))
    o.addEventListener("click", () => e.insertKeyframe(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="auto-key"]'))
    o.addEventListener("click", () => e.toggleAutoKey(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="delete-key"]'))
    o.addEventListener("click", () => e.deleteKeyframe(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="copy-key"]'))
    o.addEventListener("click", () => e.copyKeyframe(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="paste-key"]'))
    o.addEventListener("click", () => e.pasteKeyframe(), { signal: a });
  t('[data-act="key-first"]')?.addEventListener("click", () => e.setFrame(0), { signal: a }), t('[data-act="key-last"]')?.addEventListener("click", () => e.setFrame(e.state.duration_frames - 1), { signal: a }), t('[data-act="previous-key"]')?.addEventListener("click", () => e.goToAdjacentKey(-1), { signal: a }), t('[data-act="next-key"]')?.addEventListener("click", () => e.goToAdjacentKey(1), { signal: a }), t('[data-act="previous-frame"]')?.addEventListener("click", () => e.setFrame(e.frame - 1), { signal: a }), t('[data-act="next-frame"]')?.addEventListener("click", () => e.setFrame(e.frame + 1), { signal: a }), t('[data-act="update-key"]')?.addEventListener("click", () => e.updateKeyFromView(), { signal: a }), t('[data-act="view-key"]')?.addEventListener("click", () => e.loadSelectedKeyView(), { signal: a });
  for (const o of e.root.querySelectorAll('select[data-role="encoder"]'))
    o.addEventListener("change", (r) => {
      e.state.encoder = r.target.value, e.serialize(), e.setStatus(`Encoder: ${r.target.value}`);
    }, { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="fit-timeline"]'))
    o.addEventListener("click", () => e.resetTimelineZoom(), { signal: a });
  for (const o of e.root.querySelectorAll(".key-interp-buttons [data-interp]"))
    o.addEventListener("click", () => e.setKeyInterpolation(o.dataset.interp), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="reset-camera"]'))
    o.addEventListener("click", () => e.resetCamera(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="loop"]'))
    o.addEventListener("click", () => e.toggleLoop(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="range-start"]'))
    o.addEventListener("click", () => e.setPlaybackRange("start"), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="range-end"]'))
    o.addEventListener("click", () => e.setPlaybackRange("end"), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="range-clear"]'))
    o.addEventListener("click", () => e.clearPlaybackRange(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="toggle-timecode"]'))
    o.addEventListener("click", () => e.toggleTimecode(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-role="time"]'))
    o.addEventListener("click", () => e.toggleTimecode(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="toggle-snap"]'))
    o.addEventListener("click", () => e.toggleSnap(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-role="snap-frames"]'))
    o.addEventListener("change", (r) => {
      e.state.snap_frames = Math.max(1, Math.round(Number(r.target.value) || 1)), e.serialize(), e.setStatus(`Snap: ${e.state.snap_frames} frame${e.state.snap_frames === 1 ? "" : "s"}`);
    }, { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="add-camera"]'))
    o.addEventListener("click", () => {
      e.addCamera(), e.closeMenus();
    }, { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="record"]'))
    o.addEventListener("click", () => e.makePlayblast(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="h3-setup"]'))
    o.addEventListener("click", () => e.createH3Setup(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="sync-inputs"]'))
    o.addEventListener("click", () => {
      e.syncUpstreamInputs(), e.closeMenus();
    }, { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="load-card"]'))
    o.addEventListener("click", () => t('[data-role="file"]')?.click(), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="add-card"]'))
    o.addEventListener("click", () => e.addMediaCard(), { signal: a });
  t('[data-role="file"]')?.addEventListener("change", (o) => e.loadCardFile(o.target.files?.[0]), { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="load-model"]'))
    o.addEventListener("click", () => {
      e.closeMenus(), t('[data-role="model-file"]')?.click();
    }, { signal: a });
  t('[data-role="model-file"]')?.addEventListener("change", (o) => {
    e.loadModelFile(o.target.files?.[0]), o.target.value = "";
  }, { signal: a }), t('[data-act="load-audio"]')?.addEventListener("click", () => {
    e.closeMenus(), t('[data-role="audio-file"]')?.click();
  }, { signal: a }), t('[data-role="audio-file"]')?.addEventListener("change", (o) => {
    e.loadAudioFile(o.target.files?.[0]), o.target.value = "";
  }, { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="clear-caches"]'))
    o.addEventListener("click", () => {
      e.clearCaches(), e.closeMenus();
    }, { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="open-preferences"]'))
    o.addEventListener("click", () => {
      e.closeMenus(), Uf(e);
    }, { signal: a });
  for (const o of e.root.querySelectorAll("[data-object-type]"))
    o.addEventListener("click", () => {
      e.addPrimitive(o.dataset.objectType), e.closeMenus();
    }, { signal: a });
  for (const o of e.root.querySelectorAll("[data-preset]"))
    o.addEventListener("click", () => {
      e.applyCameraPreset(o.dataset.preset), e.closeMenus();
    }, { signal: a });
  for (const o of e.root.querySelectorAll("[data-shake]"))
    o.addEventListener("click", () => {
      e.applyCameraShake(o.dataset.shake), e.closeMenus();
    }, { signal: a });
}
const Vf = ["position", "target"], Hf = ["fov", "zoom"], Gf = ["roll"], Yf = ["position", "size"], Xf = ["rotation"];
function yr(e) {
  return ((e + 540) % 360 + 360) % 360 - 180;
}
function In(e, t, a, o) {
  const r = [0, 1, 2].map((n) => Number(e[n] || 0) + (Number(a[n] || 0) - Number(e[n] || 0)) * o);
  return Array.isArray(t) ? [0, 1, 2].map((n) => (2 * r[n] + Number(t[n] || 0)) / 3) : r;
}
function Jf(e, t, a, o) {
  const r = Number(e || 0) + (Number(a || 0) - Number(e || 0)) * o;
  return t == null ? r : (2 * r + Number(t || 0)) / 3;
}
function On(e, t, a, o) {
  const r = yr(Number(a || 0) - Number(e || 0)), n = Number(e || 0) + r * o;
  if (t == null) return n;
  const i = yr(Number(t || 0) - n);
  return n + i / 3;
}
function Pn(e, t, a) {
  return e.map((o, r) => o + (t[r] - o) * a);
}
function Zf(e, t, a) {
  return e + (t - e) * a;
}
function Ln(e, t, a) {
  return e + yr(t - e) * a;
}
function Qf(e, t) {
  const a = (e || []).map((r) => ({
    ...r,
    ...r.camera ? { camera: { ...r.camera } } : {}
  })), o = Math.min(1, Math.max(0, Number(t) || 0));
  if (o === 0 || a.length < 3) return a;
  for (let r = 1; r < a.length - 1; r++) {
    const n = e[r - 1], i = e[r], c = e[r + 1], l = c.frame - n.frame, p = l !== 0 ? (i.frame - n.frame) / l : 0.5;
    if (i.camera) {
      for (const m of Vf) {
        const f = n.camera?.[m], d = i.camera?.[m], h = c.camera?.[m];
        if (Array.isArray(f) && Array.isArray(h) && Array.isArray(d)) {
          const u = In(f, d, h, p);
          a[r].camera[m] = Pn(d.map(Number), u, o);
        }
      }
      for (const m of Hf) {
        const f = n.camera?.[m], d = i.camera?.[m], h = c.camera?.[m];
        if (f != null && h != null && d != null) {
          const u = Jf(f, d, h, p);
          a[r].camera[m] = Zf(Number(d), u, o);
        }
      }
      for (const m of Gf) {
        const f = n.camera?.[m], d = i.camera?.[m], h = c.camera?.[m];
        if (f != null && h != null && d != null) {
          const u = On(f, d, h, p);
          a[r].camera[m] = Ln(Number(d), u, o);
        }
      }
    }
    if (Array.isArray(i.position) && Array.isArray(n.position) && Array.isArray(c.position)) {
      for (const m of Yf) {
        const f = n[m], d = i[m], h = c[m];
        if (Array.isArray(f) && Array.isArray(h) && Array.isArray(d)) {
          const u = In(f, d, h, p);
          a[r][m] = Pn(d.map(Number), u, o);
        }
      }
      for (const m of Xf) {
        const f = n[m], d = i[m], h = c[m];
        if (Array.isArray(f) && Array.isArray(h) && Array.isArray(d)) {
          const u = [0, 1, 2].map((b) => On(f[b], d[b], h[b], p));
          a[r][m] = d.map((b, v) => Ln(Number(b), u[v], o));
        }
      }
    }
  }
  return a;
}
function eh(e) {
  return (e || []).map((t) => ({
    ...t,
    ...t.camera ? {
      camera: {
        ...t.camera,
        position: [...t.camera.position || []],
        target: [...t.camera.target || []]
      }
    } : {},
    ...Array.isArray(t.position) ? { position: [...t.position] } : {},
    ...Array.isArray(t.rotation) ? { rotation: [...t.rotation] } : {},
    ...Array.isArray(t.size) ? { size: [...t.size] } : {}
  }));
}
const th = 0.05, ah = 5e-3, oh = 0.5;
function rh(e, t) {
  const a = e.root;
  if (!a) return;
  const o = (r) => {
    if (r.button !== 0 || r.target.tagName === "INPUT" || r.target.tagName === "SELECT") return;
    const n = r.target.closest(".oc-axis");
    if (!n) return;
    const i = n.querySelector("input[type=number]");
    if (!i || i.disabled || i.readOnly) return;
    r.preventDefault(), r.stopPropagation();
    const c = r.clientX, l = parseFloat(i.value) || 0, p = parseFloat(i.getAttribute("step")) || 0.1, m = i.hasAttribute("min") ? parseFloat(i.getAttribute("min")) : -1 / 0, f = i.hasAttribute("max") ? parseFloat(i.getAttribute("max")) : 1 / 0;
    let d = !1, h = !1;
    if (n.classList.add("scrubbing"), document.body.style.cursor = "ew-resize", n.setPointerCapture)
      try {
        n.setPointerCapture(r.pointerId);
      } catch {
      }
    const u = (v) => {
      const y = v.clientX - c;
      if (Math.abs(y) > 2 && (d = !0), !d) return;
      h || (e.checkpoint?.("Scrub axis"), h = !0);
      let x = th;
      v.shiftKey ? x = ah : (v.ctrlKey || v.metaKey) && (x = oh);
      const k = p * x * 20;
      let g = l + y * k;
      g = Math.max(m, Math.min(f, g));
      const _ = p >= 1 ? 0 : p >= 0.1 ? 1 : 2;
      i.value = g.toFixed(_), i.dispatchEvent(new Event("input", { bubbles: !0 })), i.dispatchEvent(new Event("change", { bubbles: !0 }));
    }, b = (v) => {
      if (n.classList.remove("scrubbing"), document.body.style.cursor = "", n.removeEventListener("pointermove", u), n.removeEventListener("pointerup", b), n.removeEventListener("pointercancel", b), n.releasePointerCapture)
        try {
          n.releasePointerCapture(v.pointerId);
        } catch {
        }
      d && (e.serialize?.(), e.render?.());
    };
    n.addEventListener("pointermove", u), n.addEventListener("pointerup", b), n.addEventListener("pointercancel", b);
  };
  a.addEventListener("pointerdown", o, { signal: t });
}
function nh(e, t) {
  const a = e.root;
  a && a.addEventListener("click", (o) => {
    const r = o.target.closest('[data-act="reset-vector"]');
    if (!r) return;
    o.preventDefault(), o.stopPropagation();
    const n = r.dataset.target, i = r.closest(".oc-vec-row");
    if (!i) return;
    const c = [...i.querySelectorAll("input[type=number]")];
    if (!c.length) return;
    e.checkpoint?.(s("Reset {target}").replace("{target}", n || "vector"));
    let l = [0, 0, 0];
    n === "position" || n === "pos" ? l = [0, 1.5, 0] : n === "camera-pos" ? l = [6, 4, 6] : n === "camera-target" || n === "target" ? l = [0, 1.5, 0] : n === "scale" ? l = [1, 1, 1] : (n === "rotation" || n === "rot") && (l = [0, 0, 0]), c.forEach((p, m) => {
      const f = l[m] !== void 0 ? l[m] : 0;
      p.value = String(f), p.dispatchEvent(new Event("input", { bubbles: !0 })), p.dispatchEvent(new Event("change", { bubbles: !0 }));
    }), e.serialize?.(), e.render?.(), e.setStatus?.(s("Reset {target}").replace("{target}", n || "vector"));
  }, { signal: t });
}
function Gs(e) {
  const t = e.root.querySelector('[data-role="camera-hud"]');
  if (!t) return;
  const a = e.state.view_mode === "camera";
  if (t.hidden = !a, !a) return;
  const o = e.viewportCamera ? e.viewportCamera() : e.camera, r = e.activeCameraTrack ? e.activeCameraTrack() : null, n = t.querySelector('[data-role="hud-cam-name"]');
  n && (n.textContent = r?.name || "Camera");
  const i = t.querySelector('[data-role="cam-lock-icon"]'), c = !!e.state.camera_lock;
  if (i) {
    i.className = c ? "pi pi-lock" : "pi pi-lock-open";
    const u = i.closest('[data-act="toggle-camera-lock"]');
    u && (u.classList.toggle("locked", c), u.title = c ? s("Camera View is locked (click to unlock)") : s("Lock Camera View (prevent accidental navigation)"));
  }
  const l = t.querySelector('[data-role="hud-cam-lens"]');
  l && o?.fov != null && (l.textContent = `${Lr(o.fov)}mm`);
  const p = t.querySelector('[data-role="hud-cam-fov"]');
  p && o?.fov != null && (p.textContent = Tl(o.fov));
  const m = t.querySelector('[data-role="hud-cam-dist"]');
  if (m)
    if (o?.target && Array.isArray(o.target) && Array.isArray(o.position)) {
      const u = Ve(Fe(o.position, o.target));
      m.textContent = `Tgt: ${u.toFixed(2)}m`;
    } else
      m.textContent = "Free";
  const f = t.querySelector('[data-role="hud-roll-reset"]'), d = t.querySelector('[data-role="hud-roll-val"]'), h = Number(o?.roll || 0);
  f && (Math.abs(h) > 0.05 ? (f.hidden = !1, d && (d.textContent = `${h > 0 ? "+" : ""}${h.toFixed(1)}°`)) : f.hidden = !0);
}
function sh(e) {
  const t = e.root.querySelector('[data-role="floating-transport"]');
  if (!t) return;
  const a = e.root.classList.contains("oc-fullscreen");
  if (t.hidden = !a, !a) return;
  const o = t.querySelector('[data-role="ft-play-icon"]');
  o && (o.className = e.playing ? "pi pi-pause" : "pi pi-play");
  const r = t.querySelector('[data-role="ft-timecode"]');
  if (r) {
    const i = Math.max(1, Math.round(e.state.fps || 24)), c = Math.floor(e.frame / i), l = e.frame % i;
    r.textContent = `${String(Math.floor(c / 3600)).padStart(2, "0")}:${String(Math.floor(c / 60) % 60).padStart(2, "0")}:${String(c % 60).padStart(2, "0")}:${String(l).padStart(2, "0")}`;
  }
  const n = t.querySelector('[data-role="ft-frame"]');
  n && (n.textContent = `F${e.frame}`);
}
function Re(e) {
  const t = e.root.querySelector('[data-role="gizmo-space-badge"]');
  if (t) {
    const d = e.state.gizmo_space === "local";
    t.textContent = d ? "L" : "W";
    const h = t.closest('[data-role="gizmo-space-toggle"]');
    h && (h.classList.toggle("active", d), h.title = d ? s("Transform Space: Local (click for World)") : s("Transform Space: World (click for Local)"));
  }
  const a = e.root.querySelector('[data-role="spatial-snap-toggle"]');
  if (a) {
    const d = !!(e.state.spatial_snap_mode && e.state.spatial_snap_mode !== "none");
    a.classList.toggle("active", d), a.setAttribute?.("aria-pressed", String(d)), a.title = d ? s("Snapping: {mode} (click to disable)").replace("{mode}", e.state.spatial_snap_mode) : s("Toggle Snapping (Grid / None)");
  }
  const o = e.root.querySelector('[data-role="overlay-grid-btn"]');
  o && o.classList.toggle("active", e.state.show_grid !== !1);
  const r = e.root.querySelector('[data-role="overlay-wireframe-btn"]');
  r && r.classList.toggle("active", !!e.state.show_wireframe);
  const n = e.root.querySelector('[data-role="overlay-cull-btn"]');
  n && (n.classList.toggle("active", !!e.state.backface_culling), n.title = e.state.backface_culling ? s("Backface culling: On (Single-Sided)") : s("Backface culling: Off (Double-Sided Interior)"));
  const i = e.root.querySelector('[data-role="overlay-gizmo-btn"]');
  i && i.classList.toggle("active", e.state.show_gizmo !== !1);
  const c = e.root.querySelector('[data-role="overlay-guides-btn"]');
  c && c.classList.toggle("active", e.state.guides !== !1);
  const l = e.root.querySelector('[data-role="overlay-safe-btn"]');
  l && l.classList.toggle("active", !!e.state.safe_areas);
  const p = e.root.querySelector('[data-role="overlay-radar-btn"]');
  p && p.classList.toggle("active", !!e.state.show_radar);
  const m = e.root.querySelector('[data-role="shading-mode-select"]'), f = typeof document < "u" && document.activeElement === m;
  m && !f && (m.value = e.state.render_mode || "omni_ref");
}
function ih(e, t) {
  for (const o of e.root.querySelectorAll('[data-act="toggle-camera-lock"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle camera lock"), e.state.camera_lock = !e.state.camera_lock, e.serialize?.(), Gs(e), e.setStatus?.(e.state.camera_lock ? s("Camera View locked") : s("Camera View unlocked"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="reset-camera-roll"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Reset camera roll"), e.camera.roll = 0;
      const n = e.activeCameraTrack?.();
      if (n) {
        const i = n.keyframes?.find((c) => c.frame === e.frame);
        i && i.camera && (i.camera.roll = 0);
      }
      e.serialize?.(), e.updateEditState?.(), e.requestRender?.(), e.setStatus?.(s("Camera roll reset to 0°"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-gizmo-space"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle transform space"), e.state.gizmo_space = e.state.gizmo_space === "local" ? "world" : "local";
      for (const n of e.root.querySelectorAll('[data-role="gizmo-space"]'))
        n.value = e.state.gizmo_space;
      e.serialize?.(), Re(e), e.requestRender?.(), e.setStatus?.(s("Transform space: {space}").replace("{space}", e.state.gizmo_space));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-spatial-snap"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle snapping");
      const n = e.state.spatial_snap_mode || "none";
      e.state.spatial_snap_mode = n === "none" ? "grid" : "none";
      for (const i of e.root.querySelectorAll('[data-role="spatial-snap-mode"]'))
        i.value = e.state.spatial_snap_mode;
      e.serialize?.(), Re(e), e.setStatus?.(s("Snapping: {mode}").replace("{mode}", e.state.spatial_snap_mode));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-grid-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle grid overlay"), e.state.show_grid = e.state.show_grid === !1, e.serialize?.(), Re(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-wireframe-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle wireframe overlay"), e.state.show_wireframe = !e.state.show_wireframe;
      for (const n of e.root.querySelectorAll('[data-role="show-wireframe"]')) n.checked = !!e.state.show_wireframe;
      e.serialize?.(), Re(e), e.requestRender?.(), e.setStatus?.(e.state.show_wireframe ? s("Wireframe overlay: On") : s("Wireframe overlay: Off"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-cull-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle backface culling"), e.state.backface_culling = !e.state.backface_culling;
      for (const n of e.root.querySelectorAll('[data-role="backface-culling"]')) n.checked = !!e.state.backface_culling;
      e.serialize?.(), Re(e), e.webgl && (e.webgl.sceneKey = ""), e.requestRender?.(), e.setStatus?.(e.state.backface_culling ? s("Backface culling: On (Single-Sided)") : s("Backface culling: Off (Double-Sided)"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-gizmo-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle gizmo overlay"), e.state.show_gizmo = e.state.show_gizmo === !1, e.serialize?.(), Re(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-guides-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle guides overlay"), e.state.guides = e.state.guides === !1, e.serialize?.(), Re(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-safe-areas-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle safe areas overlay"), e.state.safe_areas = !e.state.safe_areas, e.serialize?.(), Re(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-radar-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle radar overlay"), e.state.show_radar = !e.state.show_radar, e.serialize?.(), Re(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-role="shading-mode-select"]'))
    o.addEventListener("change", (r) => {
      e.state.render_mode !== r.target.value && e.checkpoint?.("Change shading mode"), e.state.render_mode = r.target.value, e.modeWidget && (e.modeWidget.value = r.target.value);
      for (const n of e.root.querySelectorAll('[data-role="mode"]')) n.value = r.target.value;
      e.serialize?.(), e.render ? e.render() : e.requestRender?.(), e.setStatus?.(s("Shading: {mode}").replace("{mode}", e.state.render_mode));
    }, { signal: t });
  const a = () => !!e.timelineKeyframes?.().length;
  for (const o of e.root.querySelectorAll('[data-act="ft-step-back"]'))
    o.addEventListener("click", () => {
      a() ? e.goToAdjacentKey?.(-1) : e.setFrame?.(Math.max(0, e.frame - 1));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="ft-toggle-play"]'))
    o.addEventListener("click", () => e.togglePlay?.(), { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="ft-step-forward"]'))
    o.addEventListener("click", () => {
      a() ? e.goToAdjacentKey?.(1) : e.setFrame?.(e.frame + 1);
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="ft-add-key"]'))
    o.addEventListener("click", () => e.insertKeyframe?.(), { signal: t });
}
function ch(e, t) {
  const a = e.root.querySelector('[data-role="camera-focal"]'), o = e.root.querySelector('[data-role="camera-fov"]'), r = e.root.querySelector('[data-role="camera-sensor-preset"]');
  !a || !o || (r && r.addEventListener("change", () => {
    const n = $l[r.value];
    if (n && a) {
      const i = nn(a.value, n.height);
      o.value = String(Math.round(i * 100) / 100), o.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
  }, { signal: t }), a.addEventListener("input", () => {
    const n = nn(a.value);
    o.value = String(Math.round(n * 100) / 100), o.dispatchEvent(new Event("input", { bubbles: !0 }));
  }, { signal: t }), o.addEventListener("input", () => {
    document.activeElement !== a && (a.value = Lr(o.value));
  }, { signal: t }));
}
function lh(e, t) {
  const a = e.root.querySelector('[data-role="path-smoothing"]'), o = e.root.querySelector('[data-role="path-smoothing-value"]');
  if (!a) return;
  const r = () => {
    o && (o.textContent = `${a.value}%`);
  }, n = (i) => (e.smoothingBaseline?.cameraId !== i.id && (e.smoothingBaseline = { cameraId: i.id, keys: eh(i.keyframes) }), e.smoothingBaseline.keys);
  a.addEventListener("input", r, { signal: t }), a.addEventListener("change", () => {
    const i = e.activeCameraTrack();
    if (!i) return;
    e.checkpoint("Path smoothing");
    const c = Number(a.value) / 100, l = Qf(n(i), c);
    i.keyframes = l, e.state.keyframes = l, e.state.path_smoothing = c, e.syncActiveCameraTrack(), e.refreshKeys(), e.setFrame(e.frame, !1, !1), e.setStatus(c > 0 ? s("Path smoothing set to {percent}%").replace("{percent}", String(a.value)) : s("Path smoothing cleared"));
  }, { signal: t }), r();
}
function dh(e, t) {
  const a = e.root.querySelector('[data-role="key-simplify"]'), o = e.root.querySelector('[data-role="key-simplify-value"]'), r = e.root.querySelector('[data-role="key-op-scope"]'), n = () => e.selectedEntity === "object" && e.selectedObjectId ? "object" : "camera", i = () => n() === "object" ? e.selectedObjectId : e.state.active_camera_id, c = () => n() === "object" ? e.state.objects.find((l) => l.id === e.selectedObjectId)?.keyframes || [] : e.activeCameraTrack().keyframes || [];
  if (a) {
    const l = () => {
      o && (o.textContent = Number(a.value) > 0 ? `${a.value}%` : s("Off"));
    }, p = () => {
      const m = `${n()}:${i()}`;
      return e.keySimplifyBaseline?.signature !== m && (e.keySimplifyBaseline = { signature: m, keys: JSON.parse(JSON.stringify(c())) }), e.keySimplifyBaseline.keys;
    };
    a.addEventListener("input", l, { signal: t }), a.addEventListener("change", () => {
      const m = n();
      e.simplifyActiveKeys({
        mode: "simplify",
        tolerance: Number(a.value) / 100,
        scope: m,
        fromKeys: p().map((f) => JSON.parse(JSON.stringify(f)))
      }), Number(a.value) === 0 && (e.keySimplifyBaseline = null);
    }, { signal: t }), l();
  }
  e.root.querySelector('[data-act="keys-reduce"]')?.addEventListener("click", async () => {
    const l = await Xt(e, s("Reduce keys"), s("Target number of keys"), "8"), p = Math.round(Number(l));
    Number.isFinite(p) && p >= 2 && (e.simplifyActiveKeys({ mode: "reduce", target: p, scope: r?.value || "camera" }), e.keySimplifyBaseline = null);
  }, { signal: t }), e.root.querySelector('[data-act="keys-clean"]')?.addEventListener("click", () => {
    e.simplifyActiveKeys({ mode: "clean", scope: r?.value || "camera" }), e.keySimplifyBaseline = null;
  }, { signal: t });
}
function mh(e, t) {
  const a = e.root.querySelector('[data-role="outliner-search"]');
  a && a.addEventListener("input", () => {
    e.outlinerFilter = a.value.trim().toLowerCase(), e.refreshObjects();
  }, { signal: t });
}
function ph(e, t) {
  const a = [...e.root.querySelectorAll("[data-dope-channel]")];
  if (a.length) {
    e.dopeChannels = new Set(a.filter((o) => o.checked).map((o) => o.dataset.dopeChannel));
    for (const o of a)
      o.addEventListener("change", () => {
        e.dopeChannels = new Set(a.filter((r) => r.checked).map((r) => r.dataset.dopeChannel)), js(e);
      }, { signal: t });
  }
}
function fh(e, t) {
  e.root.querySelector('[data-act="import-extractor-camera"]')?.addEventListener("click", () => {
    Ml(e);
  }, { signal: t }), e.root.querySelector('[data-act="dismiss-extractor-camera"]')?.addEventListener("click", () => {
    Il(e);
  }, { signal: t });
}
function hh(e, t) {
  e.root.querySelector('[data-act="toggle-fullscreen"]')?.addEventListener("click", () => {
    const a = e.root.classList.toggle("oc-fullscreen");
    e.node?.setDirtyCanvas?.(!0, !0), e.scheduleResizeAndRender?.(), e.setStatus(a ? s("Viewport maximized") : s("Viewport restored"));
  }, { signal: t }), e.root.querySelector('[data-act="toggle-graph"]')?.addEventListener("click", (a) => {
    const o = e.root.querySelector(".curve-editor");
    if (!o) return;
    const r = o.classList.toggle("oc-graph-collapsed");
    a.currentTarget.classList.toggle("active", !r), r || e.drawCurveEditor();
  }, { signal: t });
  for (const [a, o] of [
    ["toggle-scene-panel", "oc-scene-open"],
    ["toggle-inspector-panel", "oc-inspector-open"]
  ])
    e.root.querySelector(`[data-act="${a}"]`)?.addEventListener("click", (r) => {
      const n = e.root.classList.toggle(o);
      r.currentTarget.setAttribute("aria-pressed", String(n));
    }, { signal: t });
}
const yo = () => import("./chunk-BbUlQx4l.js");
function uh(e, t) {
  yo().then(({ loadExchangeFormats: o }) => o(e, t)), e.root.querySelector('[data-act="import-camera"]')?.addEventListener("click", async () => {
    (await yo()).pickCameraFile(e);
  }, { signal: t }), e.root.querySelector('[data-act="export-camera"]')?.addEventListener("click", async () => {
    (await yo()).exportCamera(e);
  }, { signal: t }), e.root.querySelector('[data-role="camera-file"]')?.addEventListener("change", async (o) => {
    const r = o.target.files?.[0];
    o.target.value = "", await (await yo()).importCameraFile(e, r);
  }, { signal: t });
}
function bh(e, t) {
  const a = e.root.querySelector('[data-role="health-profile"]');
  if (!a) return;
  const o = () => {
    Xo(e), e.refreshKeys();
  };
  Fc().then((r) => {
    if (e.abortController?.signal.aborted) return;
    if (!Array.isArray(r?.profiles) || r.profiles.length === 0) {
      e.motionProfiles = null, Xo(e);
      return;
    }
    e.motionProfiles = r;
    const n = e.state.health_profile;
    a.innerHTML = r.profiles.map((i) => `<option value="${i.id}">${i.display_name}</option>`).join(""), a.value = r.profiles.some((i) => i.id === n) ? n : r.default, o();
  }), a.addEventListener("change", () => {
    e.state.health_profile = a.value, e.serialize(), o();
  }, { signal: t }), e.root.querySelector('[data-role="health-body"]')?.addEventListener("click", (r) => {
    const n = r.target.closest('[data-act="health-smooth-zone"]');
    if (n) {
      const l = Number(n.dataset.zoneStart), p = Number(n.dataset.zoneEnd);
      Rc(e, l, p);
      return;
    }
    const i = r.target.closest("[data-zone-start]");
    if (i) {
      e.setFrame(Number(i.dataset.zoneStart), !1, !1);
      return;
    }
    const c = r.target.closest("[data-act]")?.dataset.act;
    c === "health-slow" ? Dc(e) : c === "health-smooth" ? Kc(e) : c === "health-recenter" && Bc(e);
  }, { signal: t });
  for (const r of e.root.querySelectorAll('[data-tab="health"]'))
    r.addEventListener("click", () => Xo(e), { signal: t });
}
function gh(e, t) {
  const a = e.root.querySelector('[data-role="outliner-filter-chips"]');
  a && a.addEventListener("click", (o) => {
    const r = o.target.closest(".oc-chip");
    r && (e.outlinerCategoryFilter = r.dataset.filter || "all", e.refreshObjects());
  }, { signal: t });
}
function yh(e, t) {
  const a = e.root.querySelector('[data-role="key-editor"]');
  if (!a) return;
  a.addEventListener("click", (r) => {
    const n = r.target.closest("[data-tangent]");
    if (n) {
      e.setKeyTangentMode(n.dataset.tangent);
      return;
    }
    const i = r.target.closest("[data-act]");
    i && (i.dataset.act === "shot-prev-frame" ? e.setFrame(Math.max(0, e.frame - 1)) : i.dataset.act === "shot-next-frame" ? e.setFrame(Math.min(e.state.duration_frames - 1, e.frame + 1)) : i.dataset.act === "shot-prev-key" ? e.goToAdjacentKey?.(-1) : i.dataset.act === "shot-next-key" && e.goToAdjacentKey?.(1));
  }, { signal: t });
  const o = a.querySelector('[data-role="key-tangent-mode"]');
  o && o.addEventListener("change", () => {
    e.setKeyTangentMode(o.value);
  }, { signal: t });
}
function vh(e, t) {
  const a = e.root.querySelector('[data-role="outliner-batch-bar"]');
  a && a.addEventListener("click", (o) => {
    const r = o.target.closest("[data-act]");
    r && (r.dataset.act === "batch-toggle-visibility" ? e.toggleSelectedObjects?.() : r.dataset.act === "batch-toggle-lock" ? e.lockSelectedObjects?.() : r.dataset.act === "batch-duplicate" ? e.duplicateSelectedObjects?.() : r.dataset.act === "batch-delete" ? e.deleteSelectedObjects?.() : r.dataset.act === "batch-deselect" && e.deselectAll?.());
  }, { signal: t });
}
function xh(e, t) {
  uh(e, t), ch(e, t), lh(e, t), dh(e, t), mh(e, t), gh(e, t), vh(e, t), yh(e, t), rh(e, t), nh(e, t), ph(e, t), hh(e, t), ih(e, t), fh(e, t), bh(e, t);
}
const Nn = {
  low: { shadows: !0, shadowSize: 1024, toneExposure: 0.9, renderScale: 1 },
  balanced: { shadows: !0, shadowSize: 2048, toneExposure: 0.95, renderScale: 1.25 },
  high: { shadows: !0, shadowSize: 4096, toneExposure: 1, renderScale: 1.5 }
}, Ys = "balanced", or = "#121212";
function Dr(e) {
  return Nn[e] || Nn[Ys];
}
function wh(e, t = "#1b1f2b", a = "#151822", o = "#1e2330", r = "#161922", n = "#111319") {
  const i = document.createElement("canvas");
  i.width = 8, i.height = 256;
  const c = i.getContext("2d"), l = c.createLinearGradient(0, 0, 0, i.height);
  l.addColorStop(0, t), l.addColorStop(0.35, a), l.addColorStop(0.48, o), l.addColorStop(0.52, o), l.addColorStop(0.72, r), l.addColorStop(1, n), c.fillStyle = l, c.fillRect(0, 0, i.width, i.height);
  const p = new e.CanvasTexture(i);
  return p.mapping = e.EquirectangularReflectionMapping, p.colorSpace = e.SRGBColorSpace, p.needsUpdate = !0, p;
}
function kh(e) {
  const t = document.createElement("canvas");
  t.width = t.height = 256;
  const a = t.getContext("2d"), o = a.createRadialGradient(128, 128, 0, 128, 128, 128);
  o.addColorStop(0, "rgba(255,255,255,0.22)"), o.addColorStop(0.3, "rgba(255,255,255,0.13)"), o.addColorStop(0.65, "rgba(255,255,255,0.035)"), o.addColorStop(1, "rgba(255,255,255,0)"), a.fillStyle = o, a.fillRect(0, 0, 256, 256);
  const r = new e.CanvasTexture(t);
  return r.colorSpace = e.SRGBColorSpace, r.needsUpdate = !0, r;
}
function hy(e, t, a = Ys) {
  const o = Dr(a), r = new e.Group();
  r.name = "omnicam-studio";
  const n = new e.DirectionalLight(16774892, 2.2);
  n.position.set(5, 8.5, 4), n.castShadow = !0, n.shadow.mapSize.set(o.shadowSize, o.shadowSize), n.shadow.bias = -8e-4, n.shadow.normalBias = 0.02, n.shadow.radius = 2.4;
  const i = n.shadow.camera;
  i.near = 0.5, i.far = 70, i.left = i.bottom = -14, i.right = i.top = 14, r.add(n, n.target);
  const c = new e.DirectionalLight(10533112, 0.75);
  c.position.set(-6, 4, 3), r.add(c);
  const l = new e.DirectionalLight(14477567, 1.35);
  l.position.set(-3, 6, -8), r.add(l);
  const p = new e.HemisphereLight(2633792, 1184794, 0.55);
  r.add(p);
  const m = kh(e), f = new e.Mesh(
    new e.PlaneGeometry(180, 180),
    new e.MeshStandardMaterial({
      color: 1447970,
      roughness: 0.98,
      metalness: 0,
      alphaMap: m,
      transparent: !0,
      depthWrite: !1
    })
  );
  f.rotation.x = -Math.PI / 2, f.position.y = -3e-3, f.name = "omnicam-studio-floor", r.add(f);
  const d = new e.Mesh(
    new e.PlaneGeometry(180, 180),
    new e.ShadowMaterial({ opacity: 0.38, transparent: !0, depthWrite: !1 })
  );
  d.rotation.x = -Math.PI / 2, d.position.y = -1e-3, d.receiveShadow = !0, d.name = "omnicam-shadow-catcher", r.add(d);
  const h = new e.FogExp2(1250588, 8e-3), u = wh(e), b = new e.PMREMGenerator(t);
  b.compileEquirectangularShader();
  const v = new md(), y = b.fromScene(v, 0.04).texture;
  return v.traverse((x) => {
    x.geometry?.dispose?.();
    const k = Array.isArray(x.material) ? x.material : [x.material];
    for (const g of k) g?.dispose?.();
  }), {
    group: r,
    key: n,
    fill: c,
    rim: l,
    bounce: p,
    catcher: f,
    shadowCatcher: d,
    floorMap: m,
    sky: u,
    environment: y,
    pmrem: b,
    fog: h,
    quality: a,
    dispose() {
      f.geometry.dispose(), f.material.dispose(), d.geometry.dispose(), d.material.dispose(), m.dispose(), u.dispose(), y.dispose(), b.dispose();
      for (const x of [n, c, l, p]) x.dispose?.();
    }
  };
}
function uy(e, t, a) {
  const o = Dr(a);
  return e.quality = a, e.key.shadow.mapSize.set(o.shadowSize, o.shadowSize), e.key.shadow.map?.dispose(), e.key.shadow.map = null, t.toneMappingExposure = o.toneExposure, o;
}
function by(e, t, a, o, r) {
  o.group.visible = r, t.environment = r ? o.environment : null, t.background = r ? o.sky : new e.Color(1184274), t.fog = r ? o.fog : null, a.toneMapping = r ? e.ACESFilmicToneMapping : e.NoToneMapping, a.toneMappingExposure = r ? Dr(o.quality).toneExposure : 1, t.traverse((n) => {
    n.material && (n.material.needsUpdate = !0);
  });
}
function Kr(e, t) {
  t && (e.checkpoint?.("Toggle object lock"), t.locked = !t.locked, e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.render?.());
}
function Sh(e) {
  if (!e?.reconstruction) return null;
  const t = e.reconstruction.confidence != null ? Number(e.reconstruction.confidence) : 1;
  let a = "low", o = "Low";
  t >= 0.75 ? (a = "high", o = "High") : t >= 0.45 && (a = "medium", o = "Medium");
  const r = e.reconstruction, n = r.provider || "Reconstructed", i = Math.round(t * 100), c = Ol(e), l = c.length ? `
` + c.map(([m, f]) => `${m}: ${f}`).join(`
`) : "", p = `${n} • ${o} (${i}%)${l}`;
  return {
    label: o,
    band: a,
    title: p,
    confidence: t,
    semantic: String(r.semantic || ""),
    role: String(r.role || "")
  };
}
function jh(e) {
  return e?.reconstruction_appearance || "source_texture";
}
function gy(e, t, a) {
  return e?.reconstruction ? a ? "neutral" : jh(t) === "source_texture" ? "textured" : "neutral" : null;
}
function _h(e, t) {
  e && (e.state || (e.state = {}), e.state.reconstruction_appearance = t === "source_texture" ? "source_texture" : "neutral", e.serialize?.(), e.render?.());
}
function vo(e, t, a, o = 300) {
  const r = globalThis.performance?.now?.() ?? Date.now();
  e._groupedCheckpointAt ||= {}, (!Number.isFinite(e._groupedCheckpointAt[t]) || r - e._groupedCheckpointAt[t] > o) && e.checkpoint(a), e._groupedCheckpointAt[t] = r;
}
function Ch(e, t, a) {
  const o = e.root.querySelector('[data-role="viewport-axis"]');
  if (o) {
    const n = (i) => {
      const c = i.target.closest?.("[data-axis], [data-axis-center]") || i.target, l = c.getAttribute("data-axis"), p = qc(l?.toLowerCase(), e.state.view_mode);
      p ? (i.preventDefault(), e.setViewMode(p)) : c.hasAttribute("data-axis-center") && (i.preventDefault(), e.frameTarget());
    };
    o.addEventListener("click", n, { signal: a }), o.addEventListener("keydown", (i) => {
      (i.key === "Enter" || i.key === " ") && n(i);
    }, { signal: a });
  }
  for (const n of e.root.querySelectorAll('[data-role="mode"]'))
    n.addEventListener("change", (i) => {
      e.state.render_mode !== i.target.value && e.checkpoint("Change render mode"), e.state.render_mode = i.target.value, e.modeWidget && (e.modeWidget.value = i.target.value);
      for (const c of e.root.querySelectorAll('[data-role="mode"]')) c.value = i.target.value;
      e.serialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="frame"]'))
    n.addEventListener("change", (i) => e.setFrame(Number(i.target.value)), { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="scrub"]'))
    n.addEventListener("input", (i) => e.setFrame(Number(i.target.value)), { signal: a });
  for (const n of e.root.querySelectorAll("[data-view]"))
    n.addEventListener("click", () => e.setViewMode(n.dataset.view), { signal: a });
  for (const n of e.root.querySelectorAll("[data-select-mode]"))
    n.addEventListener("click", () => e.setSelectMode(n.dataset.selectMode), { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="select-mode"]'))
    n.addEventListener("change", (i) => e.setSelectMode(i.target.value), { signal: a });
  for (const n of e.root.querySelectorAll("[data-transform-mode]"))
    n.addEventListener("click", () => e.setTransformMode(n.dataset.transformMode), { signal: a });
  t('[data-act="frame-target"]')?.addEventListener("click", () => e.frameTarget(), { signal: a });
  for (const n of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    n.addEventListener("click", () => e.toggleCameraView(), { signal: a });
  for (const n of e.root.querySelectorAll("[data-inspector-mode]"))
    n.addEventListener("click", () => {
      const i = n.dataset.inspectorMode;
      e.setInspectorMode(e.inspectorMode === i ? "entity" : i);
    }, { signal: a });
  const r = e.root.querySelector(".inspector-tabs, .oc-side-tabs");
  r && r.addEventListener("keydown", (n) => {
    if (n.key === "ArrowLeft" || n.key === "ArrowRight") {
      n.preventDefault();
      const i = [...r.querySelectorAll(".inspector-tab")].filter((l) => l.offsetParent !== null), c = i.findIndex((l) => l.classList.contains("active"));
      if (c >= 0 && i.length > 1) {
        const l = n.key === "ArrowRight" ? (c + 1) % i.length : (c - 1 + i.length) % i.length;
        i[l].click(), i[l].focus();
      }
    }
  }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    n.addEventListener("change", (i) => e.activateCamera(i.target.value), { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="camera-color"]'))
    n.addEventListener("input", (i) => {
      const c = e.activeCameraTrack();
      c && (c.color = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-camera"]'))
    n.addEventListener("change", (i) => e.setPlayblastCamera(i.target.value), { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="camera-type"]'))
    n.addEventListener("change", (i) => {
      e.camera.camera_type !== i.target.value && e.checkpoint("Change camera type"), e.camera.camera_type = i.target.value, Ce(e.root, "camera-type", i.target), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="speed"]')) {
    const i = (c) => {
      const l = ee(Number(c.target.value), 0.05, 5);
      if (Number.isFinite(l)) {
        e.cameraSpeed = l;
        for (const p of e.root.querySelectorAll('[data-role="speed"]'))
          p !== c.target && (p.value = String(l));
      }
    };
    n.addEventListener("input", i, { signal: a }), n.addEventListener("change", i, { signal: a });
  }
  for (const n of e.root.querySelectorAll('[data-role="interp"]'))
    n.addEventListener("change", (i) => {
      e.activeKeyframe() && (e.activeKeyframe().interpolation !== i.target.value && e.checkpoint("Change interpolation"), e.activeKeyframe().interpolation = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="point-density"]'))
    n.addEventListener("change", (i) => {
      e.state.point_density !== i.target.value && e.checkpoint("Change point density"), e.state.point_density = i.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point density: ${i.target.value}`);
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="point-color"]'))
    n.addEventListener("input", (i) => {
      e.state.point_color !== i.target.value && vo(e, "point_color", "Change point color"), e.state.point_color = i.target.value, e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="point-spread"]'))
    n.addEventListener("change", (i) => {
      e.state.point_spread !== i.target.value && e.checkpoint("Change point spread"), e.state.point_spread = i.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point spread: ${i.target.value}`);
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="card-fit"]'))
    n.addEventListener("change", (i) => {
      e.state.card_fit !== i.target.value && e.checkpoint("Change card fit"), e.state.card_fit = i.target.value, e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="speed-heatmap"]'))
    n.addEventListener("change", (i) => {
      e.state.speed_heatmap !== i.target.checked && e.checkpoint("Toggle speed heatmap"), e.state.speed_heatmap = i.target.checked, Ce(e.root, "speed-heatmap", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-grid"]'))
    n.addEventListener("change", (i) => {
      e.state.playblast_grid !== i.target.checked && e.checkpoint("Toggle playblast grid"), e.state.playblast_grid = i.target.checked, Ce(e.root, "playblast-grid", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-labels"]'))
    n.addEventListener("change", (i) => {
      e.state.playblast_labels !== i.target.checked && e.checkpoint("Toggle playblast labels"), e.state.playblast_labels = i.target.checked, Ce(e.root, "playblast-labels", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-resolution"]'))
    n.addEventListener("change", (i) => {
      e.state.playblast_resolution !== i.target.value && e.checkpoint("Change playblast resolution"), e.state.playblast_resolution = i.target.value, Ce(e.root, "playblast-resolution", i.target), e.scheduleSerialize();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-act="reset-bg-color"]'))
    n.addEventListener("click", () => {
      e.state.viewport_bg_color !== or && e.checkpoint("Reset background colour"), e.state.viewport_bg_color = or;
      for (const i of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) i.value = or;
      e.scheduleSerialize(), e.render(), e.setStatus(s("Background colour reset"));
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-grid"]'))
    n.addEventListener("change", (i) => {
      e.state.show_grid = i.target.checked, Ce(e.root, "show-grid", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const [n, i] of [
    ["show-camera-paths", "show_camera_paths"],
    ["show-camera-gizmos", "show_camera_gizmos"],
    ["show-look-at", "show_look_at"],
    ["show-helper-axes", "show_helper_axes"]
  ])
    for (const c of e.root.querySelectorAll(`[data-role="${n}"]`))
      c.addEventListener("change", (l) => {
        e.state[i] !== l.target.checked && e.checkpoint("Toggle viewport helper"), e.state[i] = l.target.checked, Ce(e.root, n, l.target, "checked"), e.scheduleSerialize(), e.render();
      }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-act="select-look-at"]'))
    n.addEventListener("click", () => {
      const i = e.selectedEntity !== "camera_target";
      e.selectedEntity = i ? "camera_target" : "camera", e.selectedObjectId = null, e.selectedObjectIds?.clear?.();
      for (const c of e.root.querySelectorAll('[data-act="select-look-at"]'))
        c.classList.toggle("active", i), c.setAttribute("aria-pressed", String(i));
      e.refreshInspector?.(), e.render(), e.setStatus?.(i ? s("Look-At target selected") : s("Camera selected"));
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-wireframe"]'))
    n.addEventListener("change", (i) => {
      e.state.show_wireframe !== i.target.checked && e.checkpoint("Toggle wireframe"), e.state.show_wireframe = i.target.checked, Ce(e.root, "show-wireframe", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-vertices"]'))
    n.addEventListener("change", (i) => {
      e.state.show_vertices !== i.target.checked && e.checkpoint("Toggle vertices"), e.state.show_vertices = i.target.checked, Ce(e.root, "show-vertices", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="backface-culling"]'))
    n.addEventListener("change", (i) => {
      !!e.state.backface_culling !== i.target.checked && e.checkpoint("Toggle backface culling"), e.state.backface_culling = i.target.checked, Ce(e.root, "backface-culling", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render(), e.setStatus(e.state.backface_culling ? s("Backface culling: On (Single-Sided)") : s("Backface culling: Off (Double-Sided)"));
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-act="set-near-preset"]'))
    n.addEventListener("click", (i) => {
      i.stopPropagation();
      const c = Number(n.dataset.near || 0.01);
      e.checkpoint("Set camera near clip"), e.camera.near = c, e.camera.far <= e.camera.near && (e.camera.far = e.camera.near + 100);
      const l = e.activeCameraTrack?.();
      if (l) {
        l.camera.near = c;
        const p = l.keyframes?.find((m) => m.frame === e.frame);
        p && p.camera && (p.camera.near = c);
      }
      for (const p of e.root.querySelectorAll('[data-role="camera-near"]')) p.value = String(c);
      e.scheduleSerialize(), e.render(), e.setStatus(s("Near clip set to {val}m").replace("{val}", String(c)));
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="burn-in"]'))
    n.addEventListener("change", (i) => {
      e.state.burn_in !== i.target.checked && e.checkpoint("Toggle burn-in"), e.state.burn_in = i.target.checked, Ce(e.root, "burn-in", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="guides"]'))
    n.addEventListener("change", (i) => {
      e.state.guides !== i.target.checked && e.checkpoint("Toggle guides"), e.state.guides = i.target.checked, Ce(e.root, "guides", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="safe-areas"]'))
    n.addEventListener("change", (i) => {
      e.state.safe_areas !== i.target.checked && e.checkpoint("Toggle safe areas"), e.state.safe_areas = i.target.checked, Ce(e.root, "safe-areas", i.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="resolution-gate"]'))
    n.addEventListener("change", (i) => {
      e.state.resolution_gate !== i.target.checked && e.checkpoint("Toggle resolution gate"), e.state.resolution_gate = i.target.checked, Ce(e.root, "resolution-gate", i.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="aspect-ratio"]'))
    n.addEventListener("change", (i) => {
      e.state.aspect_ratio !== i.target.value && e.checkpoint("Change aspect ratio"), e.state.aspect_ratio = i.target.value, Ce(e.root, "aspect-ratio", i.target), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) {
    const i = (c) => {
      e.state.viewport_bg_color !== c.target.value && vo(e, "viewport_bg_color", "Change background colour"), e.state.viewport_bg_color = c.target.value, Ce(e.root, "viewport-bg-color", c.target), e.scheduleSerialize(), e.render();
    };
    n.addEventListener("input", i, { signal: a }), n.addEventListener("change", i, { signal: a });
  }
  for (const n of e.root.querySelectorAll('[data-act="upload-viewport-bg"]'))
    n.addEventListener("click", () => {
      e.closeMenus(), t('[data-role="viewport-bg-file"]')?.click();
    }, { signal: a });
  t('[data-role="viewport-bg-file"]')?.addEventListener("change", (n) => {
    e.loadViewportBgFile(n.target.files?.[0]), n.target.value = "";
  }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-act="upload-viewport-bg-seq"]'))
    n.addEventListener("click", () => {
      e.closeMenus(), t('[data-role="viewport-bg-seq-file"]')?.click();
    }, { signal: a });
  t('[data-role="viewport-bg-seq-file"]')?.addEventListener("change", (n) => {
    e.loadViewportBgSequence(Array.from(n.target.files || [])), n.target.value = "";
  }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-act="clear-viewport-bg"]'))
    n.addEventListener("click", () => {
      e.clearViewportBgImage(), e.closeMenus();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="object-material"]'))
    n.addEventListener("change", (i) => {
      const c = e.selectedObject();
      c && (c.material_mode !== i.target.value && e.checkpoint("Change object material"), c.material_mode = i.target.value, e.serialize(), e.render());
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-act="toggle-object-lock"]'))
    n.addEventListener("click", () => {
      const i = e.selectedObject?.();
      i && Kr(e, i);
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="reconstruction-appearance"]'))
    n.addEventListener("change", (i) => {
      _h(e, i.target.value);
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="object-color"]'))
    n.addEventListener("input", (i) => {
      const c = e.selectedObject();
      c && (c.color !== i.target.value && vo(e, `object_color:${c.id}`, "Change object color"), c.color = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="object-light-color"]'))
    n.addEventListener("input", (i) => {
      const c = e.selectedObject();
      c && (c.color !== i.target.value && vo(e, `object_color:${c.id}`, "Change light color"), c.color = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="reference-select"]'))
    n.addEventListener("change", (i) => {
      e.state.reference_index !== Number(i.target.value) && e.checkpoint("Change reference"), e.state.reference_index = Number(i.target.value), e.serialize(), e.loadSelectedReference();
    }, { signal: a });
  for (const n of e.root.querySelectorAll("[data-proxy-preset]"))
    n.addEventListener("click", () => {
      e.applyProxyPreset(n.dataset.proxyPreset), e.closeMenus();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('select[data-role="proxy-preset"]'))
    n.addEventListener("change", (i) => {
      e.applyProxyPreset(i.target.value);
    }, { signal: a });
  for (const n of e.root.querySelectorAll("[data-lens]"))
    n.addEventListener("click", () => {
      Pl(e, Number(n.dataset.lens));
    }, { signal: a });
  for (const n of e.root.querySelectorAll("[data-blocking-scene]"))
    n.addEventListener("click", () => {
      Tf(e, n.dataset.blockingScene), e.closeMenus();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-radar"]'))
    n.addEventListener("change", (i) => {
      e.state.show_radar !== i.target.checked && e.checkpoint("Toggle radar"), e.state.show_radar = i.target.checked, e.scheduleSerialize(), e.render(), e.setStatus(`Radar Mini-Map: ${i.target.checked ? "ON" : "OFF"}`);
    }, { signal: a });
}
const Eh = 32, Ah = 0.025, Th = 0.05, Io = 1e-6, $h = ["top", "bottom", "front", "back", "left", "right"], Mh = {
  top: "y",
  bottom: "y",
  front: "z",
  back: "z",
  left: "x",
  right: "x"
}, Oo = { x: 0, y: 1, z: 2 };
function vr(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
function Br(e, t) {
  return Math.hypot(
    (t[0] || 0) - (e[0] || 0),
    (t[1] || 0) - (e[1] || 0),
    (t[2] || 0) - (e[2] || 0)
  );
}
function Ih(e) {
  let t = 0;
  for (let a = 1; a < e.length; a++) t += Br(e[a - 1], e[a]);
  return t;
}
function xr(e) {
  const t = Math.max(0, Math.round(Number(e?.duration_frames) || 1) - 1), a = Array.isArray(e?.playback_range) ? e.playback_range : [0, t], o = vr(Math.round(Number(a[0]) || 0), 0, t), r = vr(Math.round(Number(a[1]) || t), 0, t);
  return o <= r ? [o, r] : [r, o];
}
function Oh(e, t) {
  if (t <= 2) return [e[0], e.at(-1)].map((i) => [...i]);
  const a = [0];
  for (let i = 1; i < e.length; i++)
    a[i] = a[i - 1] + Br(e[i - 1], e[i]);
  const o = a.at(-1) || 0;
  if (o < Io) return [];
  const r = [];
  let n = 1;
  for (let i = 0; i < t; i++) {
    const c = o * i / (t - 1);
    for (; n < a.length - 1 && a[n] < c; ) n += 1;
    const l = a[n - 1], p = a[n], m = vr((c - l) / Math.max(Io, p - l), 0, 1), f = e[n - 1], d = e[n];
    r.push([
      f[0] + (d[0] - f[0]) * m,
      f[1] + (d[1] - f[1]) * m,
      f[2] + (d[2] - f[2]) * m
    ]);
  }
  return r;
}
function Xs(e, t = [0, 0, -1]) {
  const a = Math.hypot(e?.[0] || 0, e?.[2] || 0);
  return a < Io ? [...t] : [(e[0] || 0) / a, 0, (e[2] || 0) / a];
}
function Js(e, t) {
  const a = Math.hypot(e[0] || 0, e[1] || 0, e[2] || 0);
  return a < Io ? [...t] : [e[0] / a, e[1] / a, e[2] / a];
}
function Ph(e, t, a, o) {
  const r = e[Math.max(0, t - 1)], n = e[Math.min(e.length - 1, t + 1)], i = [n[0] - r[0], n[1] - r[1], n[2] - r[2]];
  return o === "y" ? Xs(i, a) : Js(i, a);
}
function Lh(e, t, a, o) {
  if (o === "y") {
    const n = Math.max(
      0.25,
      Math.hypot(a[0], a[2]) || Math.hypot(...a) || 1
    );
    return [
      e[0] + t[0] * n,
      e[1] + (a[1] || 0),
      e[2] + t[2] * n
    ];
  }
  const r = Math.max(0.25, Math.hypot(...a) || 1);
  return [
    e[0] + t[0] * r,
    e[1] + t[1] * r,
    e[2] + t[2] * r
  ];
}
function Nh(e) {
  const [t, a] = e.range, o = a - t;
  if (o < 1) return [];
  const r = e.seedPoint ? [e.seedPoint, ...e.points] : e.points;
  if (r.length < 2) return [];
  const n = Math.min(Eh, r.length, o + 1);
  if (n < 2) return [];
  const i = Oh(r, n);
  if (i.length < 2) return [];
  const c = e.sourceCamera, l = [
    c.target[0] - c.position[0],
    c.target[1] - c.position[1],
    c.target[2] - c.position[2]
  ], p = e.planeAxis === "y" ? Xs(l) : Js(l, [0, 0, -1]), m = e.seedPoint ? 1 : 0, f = [];
  for (let d = m; d < i.length; d++) {
    const h = i[d], u = Ph(i, d, p, e.planeAxis), b = ce(c);
    b.position = [...h], b.target = Lh(h, u, l, e.planeAxis), f.push({
      frame: Math.round(t + o * d / (i.length - 1)),
      camera: b,
      interpolation: "smooth"
    });
  }
  return f.filter((d, h, u) => h === 0 || d.frame > u[h - 1].frame);
}
function zh(e) {
  const t = new Set((e.cameras || []).map((o) => o.name));
  let a = 1;
  for (; t.has(`Drawn Camera ${a}`); ) a += 1;
  return `Drawn Camera ${a}`;
}
function Zs(e, t = e.cameraPathDraw) {
  const a = t?.pointerId;
  if (a != null)
    try {
      e.interactionElement?.hasPointerCapture?.(a) && e.interactionElement.releasePointerCapture(a);
    } catch {
    }
}
function Gt(e) {
  const t = e.cameraPathDraw, a = !!t?.active, o = a && t.mode === "extend";
  for (const n of e.root?.querySelectorAll?.('[data-act="draw-camera-path"]') || [])
    n.classList.toggle("active", a && !o), n.setAttribute("aria-pressed", String(a && !o));
  for (const n of e.root?.querySelectorAll?.('[data-act="draw-camera-path-extend"]') || [])
    n.classList.toggle("active", o), n.setAttribute("aria-pressed", String(o));
  const r = e.interactionElement;
  r?.style && (a ? (r.dataset.cameraPathDraw = "true", r.style.cursor = "crosshair") : r.dataset?.cameraPathDraw && (delete r.dataset.cameraPathDraw, r.style.cursor = ""));
}
function zn(e, t = {}) {
  if (e.cameraPathDraw?.active) return !0;
  const a = t.mode === "extend" ? "extend" : "new", o = e.activeCameraTrack?.(), r = ce(e.camera || o?.camera);
  if (!r?.position || !r?.target) return !1;
  let n = null, i = null, c, l = null, p = null;
  if (a === "extend") {
    const d = o?.keyframes;
    if (!o || !Array.isArray(d) || d.length < 1)
      return e.setStatus?.(s("Draw Camera Path: the active camera has no path to continue")), !1;
    e.state.view_mode === "camera" && e.setViewMode?.("top");
    const h = d[d.length - 1];
    n = [...h.camera.position], i = o.id;
    const u = Math.max(0, Math.round(Number(e.state.duration_frames) || 1) - 1), [, b] = xr(e.state), v = d.length > 1 ? d[d.length - 1].frame - d[0].frame : 24;
    let y = Math.max(b, h.frame + Math.max(6, Math.min(v, 240)));
    y <= h.frame && (y = h.frame + 24), y > u && (l = y + 1), y > b && (p = y), c = [h.frame, y];
  } else
    $h.includes(e.state.view_mode) || e.setViewMode?.("top"), c = xr(e.state);
  const m = Mh[e.state.view_mode] ?? null, f = n ? [...n] : [...r.position];
  return e.cameraPathDraw = {
    active: !0,
    drawing: !1,
    pointerId: null,
    mode: a,
    appendTrackId: i,
    planeAxis: m,
    anchor: f,
    seedPoint: n,
    range: c,
    wantDuration: l,
    wantRangeEnd: p,
    sourceCamera: r,
    points: []
  }, Gt(e), e.setStatus?.(a === "extend" ? s("Continue Camera Path: LMB draw from the last key · RMB or Esc cancel") : s("Draw Camera Path: LMB draw · RMB or Esc cancel")), e.render?.(), !0;
}
function qr(e, t) {
  const a = e.cameraPathDraw;
  if (!a?.active || !Array.isArray(t) || t.length < 3) return !1;
  const o = [Number(t[0]), Number(t[1]), Number(t[2])];
  if (!o.every(Number.isFinite)) return !1;
  a.planeAxis && (o[Oo[a.planeAxis]] = a.anchor[Oo[a.planeAxis]]);
  const r = a.points.at(-1);
  return r && Br(r, o) < Ah ? !1 : (a.points.push(o), !0);
}
function He(e) {
  const t = e.cameraPathDraw;
  return t?.active ? (Zs(e, t), e.cameraPathDraw = null, Gt(e), e.setStatus?.(s("Draw Camera Path cancelled")), e.render?.(), !0) : !1;
}
function Fh(e) {
  const t = e.cameraPathDraw;
  if (!t?.active) return null;
  Zs(e, t);
  const a = t.seedPoint ? [t.seedPoint, ...t.points] : t.points;
  if (a.length < 2 || Ih(a) < Th || t.range[1] <= t.range[0])
    return He(e), e.setStatus?.(s("Camera path needs at least two distinct points")), null;
  const o = Nh(t);
  if (o.length < (t.mode === "extend" ? 1 : 2))
    return He(e), null;
  if (t.mode === "extend") {
    const c = e.state.cameras.find((m) => m.id === t.appendTrackId);
    if (!c)
      return He(e), null;
    e.checkpoint?.("Extend camera path"), t.wantDuration && (e.state.duration_frames = Math.max(Number(e.state.duration_frames) || 0, t.wantDuration)), t.wantRangeEnd != null && Array.isArray(e.state.playback_range) && (e.state.playback_range = [e.state.playback_range[0], Math.max(e.state.playback_range[1], t.wantRangeEnd)]);
    const l = new Map((c.keyframes || []).map((m) => [m.frame, m]));
    for (const m of o) l.set(m.frame, m);
    const p = [...l.values()].sort((m, f) => m.frame - f.frame);
    return c.keyframes = p, c.id === e.state.active_camera_id && (e.state.keyframes = p), e.cameraPreviewSignature = "", e.cameraPathDraw = null, Gt(e), e.activateCamera?.(c.id), e.setFrame?.(o[0].frame), e.serialize?.(), e.refreshKeys?.(), e.render?.(), e.setStatus?.(s("Camera path extended")), c.id;
  }
  e.checkpoint?.("Draw camera path");
  const r = Ll(e.state), n = e.state.cameras.length, i = {
    id: r,
    name: zh(e.state),
    color: sn[n % sn.length],
    camera: ce(o[0].camera),
    keyframes: o,
    target_object_id: null,
    target_offset: [0, 0, 0]
  };
  return e.state.cameras.push(i), e.cameraPreviewSignature = "", e.cameraPathDraw = null, Gt(e), e.activateCamera?.(r), e.setFrame?.(t.range[0]), e.setStatus?.(s("Camera path created")), r;
}
function Po(e) {
  e.preventDefault?.(), e.stopPropagation?.(), e.stopImmediatePropagation?.();
}
function Rh(e, t) {
  const a = e.interactionElement.getBoundingClientRect();
  return [
    (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width),
    (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height)
  ];
}
function Ur(e, t) {
  const a = e.cameraPathDraw, o = e.viewportCamera?.();
  if (!a || !o) return null;
  const r = Uc(
    Rh(e, t),
    o,
    a.anchor,
    e.canvas.width,
    e.canvas.height
  );
  return r?.every(Number.isFinite) ? (a.planeAxis && (r[Oo[a.planeAxis]] = a.anchor[Oo[a.planeAxis]]), r) : null;
}
function Dh(e, t) {
  const a = e.cameraPathDraw;
  return a?.active ? t.button === 2 && !t.altKey ? (Po(t), e.cameraPathSuppressContextMenuUntil = Date.now() + 1e3, He(e), !0) : t.button !== 0 || t.altKey || t.ctrlKey || t.metaKey || t.shiftKey ? !1 : (Po(t), e.closeMenus?.(), e.interactionElement.focus?.({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(t.pointerId), a.drawing = !0, a.pointerId = t.pointerId, a.points = [], qr(e, Ur(e, t)), Gt(e), e.requestRender?.("camera-path-draw"), !0) : !1;
}
function Kh(e, t) {
  const a = e.cameraPathDraw;
  return !a?.active || !a.drawing || a.pointerId !== t.pointerId ? !1 : (Po(t), qr(e, Ur(e, t)) && e.requestRender?.("camera-path-draw"), !0);
}
function Bh(e, t) {
  const a = e.cameraPathDraw;
  return !a?.active || !a.drawing || a.pointerId !== t.pointerId ? !1 : (Po(t), t.type === "pointercancel" || t.type === "lostpointercapture" ? (He(e), !0) : (qr(e, Ur(e, t)), a.drawing = !1, Fh(e), !0));
}
function qh(e) {
  const t = e.cameraPathDraw;
  if (!t?.active || e.recording) return;
  const a = e.viewportCamera?.();
  if (!a || !e.ctx) return;
  const o = t.seedPoint && t.points[0] !== t.seedPoint ? [t.seedPoint, ...t.points] : t.points;
  if (!o.length) return;
  const r = o.map((c) => Ge(c, a, e.canvas.width, e.canvas.height)).filter((c) => c && Number.isFinite(c[0]) && Number.isFinite(c[1]));
  if (!r.length) return;
  const n = globalThis.getComputedStyle?.(e.root)?.getPropertyValue("--oc-accent")?.trim() || "#8b7de3", i = e.ctx;
  i.save(), i.strokeStyle = n, i.fillStyle = n, i.lineWidth = 2, i.setLineDash([7, 5]), i.beginPath(), i.moveTo(r[0][0], r[0][1]);
  for (const c of r.slice(1)) i.lineTo(c[0], c[1]);
  i.stroke(), i.setLineDash([]);
  for (const c of [r[0], r.at(-1)])
    i.beginPath(), i.arc(c[0], c[1], 4, 0, Math.PI * 2), i.fill();
  i.restore();
}
function Uh(e, t) {
  for (const a of e.root.querySelectorAll('[data-act="draw-camera-path"]'))
    a.addEventListener("click", () => {
      e.cameraPathDraw?.active ? He(e) : zn(e);
    }, { signal: t });
  for (const a of e.root.querySelectorAll('[data-act="draw-camera-path-extend"]'))
    a.addEventListener("click", () => {
      e.cameraPathDraw?.active ? He(e) : zn(e, { mode: "extend" });
    }, { signal: t });
  for (const a of e.root.querySelectorAll('[data-act="camera-path-presets"]'))
    a.addEventListener("click", () => e.openCameraPathPresetPicker(), { signal: t });
  e.root.addEventListener("contextmenu", (a) => {
    !(Date.now() <= Number(e.cameraPathSuppressContextMenuUntil || 0)) && !e.cameraPathDraw?.active || (a.preventDefault(), a.stopPropagation(), a.stopImmediatePropagation?.(), e.cameraPathSuppressContextMenuUntil = 0, e.cameraPathDraw?.active && He(e));
  }, { capture: !0, signal: t });
}
const Eo = "/majoor/omnicam/scenes";
function Qs(e) {
  return e.sceneName || e.state?.metadata?.scene_name || "";
}
function Ao(e, t, a) {
  const o = e.api || (typeof window < "u" ? window.app?.api : null);
  if (!o?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return o.fetchApi(t, a);
}
function Wr(e, t, { name: a = "", status: o } = {}) {
  const r = t && typeof t == "object" ? t : us(), n = { ...r, metadata: { ...r.metadata || {}, scene_name: a || "" } };
  e.stateWidget && (e.stateWidget.value = JSON.stringify(n)), e.widthWidget && n.width != null && (e.widthWidget.value = n.width), e.heightWidget && n.height != null && (e.heightWidget.value = n.height), e.fpsWidget && n.fps != null && (e.fpsWidget.value = n.fps), e.durationWidget && n.fps && n.duration_frames != null && (e.durationWidget.value = n.duration_frames / n.fps), e.modeWidget && n.render_mode != null && (e.modeWidget.value = n.render_mode), e.cardWidget && (e.cardWidget.value = n.card_asset || ""), e.restoreFromWidgets(), e.sceneName = a || "", e.state && (e.state.metadata = { ...e.state.metadata, scene_name: e.sceneName }), e.serialize?.(), e.sceneBaseline = e.stateWidget?.value ?? JSON.stringify(n), e.refreshCameraPreviews?.(), e.syncUpstreamInputs?.(), e.setStatus?.(o || s("Scene loaded"));
}
async function Wh(e) {
  await Jt(e, s("New Scene"), s("Start a new scene? Unsaved changes will be lost.")) && Wr(e, us(), { name: "", status: s("New scene") });
}
async function Vh(e) {
  if (!e.sceneBaseline) {
    e.setStatus?.(s("Nothing to revert to"));
    return;
  }
  if (!await Jt(
    e,
    s("Reset Scene"),
    s("Revert to the last saved or opened scene? Unsaved changes will be lost.")
  )) return;
  let a;
  try {
    a = JSON.parse(e.sceneBaseline);
  } catch {
    e.setStatus?.(s("The saved scene could not be read"));
    return;
  }
  const o = a?.metadata?.scene_name || Qs(e);
  Wr(e, a, { name: o, status: s("Scene reset to last save") });
}
async function Hh(e) {
  const t = Qs(e) || s("Untitled"), a = await Xt(e, s("Save Scene"), s("Scene name"), t);
  if (a == null) return;
  const o = String(a).trim();
  if (!o) {
    e.setStatus?.(s("The scene name cannot be empty"));
    return;
  }
  e.serialize?.();
  let r;
  try {
    r = JSON.parse(e.stateWidget?.value || "null") || e.state;
  } catch {
    r = e.state;
  }
  const n = JSON.parse(JSON.stringify(r));
  e.setStatus?.(s("Saving scene…"));
  try {
    const i = await Ao(e, Eo, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: o, state: n })
    });
    if (!i.ok) throw new Error(await i.text());
    const c = await i.json();
    e.sceneName = c.name || o, e.state && (e.state.metadata = { ...e.state.metadata, scene_name: e.sceneName }), n.metadata = { ...n.metadata || {}, scene_name: e.sceneName }, e.sceneBaseline = JSON.stringify(n), e.setStatus?.(s("Scene saved: {name}").replace("{name}", e.sceneName));
  } catch (i) {
    console.error("[OmniCam] scene save failed", i), e.setStatus?.(s("Scene save failed: {error}").replace("{error}", String(i?.message || i).slice(0, 120)));
  }
}
async function Gh(e) {
  let t;
  try {
    const r = await Ao(e, Eo);
    if (!r.ok) throw new Error(await r.text());
    t = (await r.json()).scenes || [];
  } catch (r) {
    console.error("[OmniCam] scene list failed", r), e.setStatus?.(s("The scenes could not be listed: {error}").replace("{error}", String(r?.message || r).slice(0, 120)));
    return;
  }
  if (!t.length) {
    e.setStatus?.(s("No saved scenes yet"));
    return;
  }
  const a = await vs({
    title: s("Open Scene"),
    owner: e,
    items: t.map((r) => ({
      id: r.slug,
      label: r.name || r.slug,
      sublabel: Yh(r.modified)
    })),
    onDelete: (r) => Ao(e, `${Eo}/${encodeURIComponent(r)}`, { method: "DELETE" }).catch((n) => console.warn("[OmniCam] scene delete failed", n))
  });
  if (!(!a || !await Jt(e, s("Open Scene"), s("Open this scene? Unsaved changes will be lost."))))
    try {
      const r = await Ao(e, `${Eo}/${encodeURIComponent(a)}`);
      if (!r.ok) throw new Error(await r.text());
      const n = await r.json();
      Wr(e, n.state, {
        name: n.name || a,
        status: s("Scene opened: {name}").replace("{name}", n.name || a)
      });
    } catch (r) {
      console.error("[OmniCam] scene open failed", r), e.setStatus?.(s("Scene open failed: {error}").replace("{error}", String(r?.message || r).slice(0, 120)));
    }
}
function Yh(e) {
  if (!Number.isFinite(e)) return "";
  try {
    return new Date(e * 1e3).toLocaleString();
  } catch {
    return "";
  }
}
function xo(e, t, a, o) {
  for (const r of a)
    r.addEventListener("click", () => {
      e.closeMenus?.(), Promise.resolve(o()).catch((n) => {
        console.error("[OmniCam] scene action failed", n), e.setStatus?.(String(n?.message || n).slice(0, 160));
      });
    }, { signal: t });
}
function Xh(e, t) {
  xo(e, t, e.root.querySelectorAll('[data-act="scene-new"]'), () => Wh(e)), xo(e, t, e.root.querySelectorAll('[data-act="scene-open"]'), () => Gh(e)), xo(e, t, e.root.querySelectorAll('[data-act="scene-save"]'), () => Hh(e)), xo(e, t, e.root.querySelectorAll('[data-act="scene-reset"]'), () => Vh(e));
}
const Jh = ["world_point", "object_point", "camera_field"], Fn = 40;
function Zh(e) {
  return (e.keys || []).map((t) => ({ x: t.x, y: t.y, t: t.time_seconds }));
}
function Qh(e, t, a) {
  const o = Math.max(1, Number(e.fps) || 24), r = e.width || 1280, n = e.height || 720, i = [];
  for (let c = 0; c <= Fn; c += 1) {
    const l = a * c / Fn, p = Or(e, t.source, l * o, r, n);
    p && i.push({ x: p.x, y: p.y, t: l });
  }
  return i;
}
function eu(e, t) {
  if (!e.length) return null;
  if (t <= e[0].t) return e[0];
  if (t >= e[e.length - 1].t) return e[e.length - 1];
  for (let a = 1; a < e.length; a += 1)
    if (e[a].t >= t) {
      const o = e[a - 1], r = e[a], n = (t - o.t) / Math.max(1e-6, r.t - o.t);
      return { x: o.x + (r.x - o.x) * n, y: o.y + (r.y - o.y) * n };
    }
  return e[e.length - 1];
}
function ei(e, t, a) {
  const o = t / Math.max(1, a), r = e.width / Math.max(1, e.height);
  let n = e.width, i = e.height;
  return r > o ? n = i * o : i = n / o, { x: (e.width - n) / 2, y: (e.height - i) / 2, w: n, h: i };
}
function tu(e) {
  const t = e.root.querySelector('[data-role="motion-preview"]');
  if (!t || t.closest("[data-tab-panel]")?.hidden) return;
  const o = t.getBoundingClientRect();
  if (!o.width || !o.height) return;
  const r = Math.min(2, window.devicePixelRatio || 1), n = Math.round(o.width * r), i = Math.round(o.height * r);
  t.width !== n && (t.width = n), t.height !== i && (t.height = i);
  const c = t.getContext("2d");
  if (!c) return;
  const l = ei(t, e.state.width || 1280, e.state.height || 720), p = (v) => l.x + v * l.w, m = (v) => l.y + v * l.h;
  c.save(), c.clearRect(0, 0, t.width, t.height), c.fillStyle = "#0b0b0f", c.fillRect(0, 0, t.width, t.height), c.fillStyle = "#0f0f14", c.fillRect(l.x, l.y, l.w, l.h), c.strokeStyle = "rgba(255,255,255,0.06)", c.lineWidth = 1;
  for (let v = 1; v < 3; v += 1)
    c.beginPath(), c.moveTo(p(v / 3), l.y), c.lineTo(p(v / 3), l.y + l.h), c.stroke(), c.beginPath(), c.moveTo(l.x, m(v / 3)), c.lineTo(l.x + l.w, m(v / 3)), c.stroke();
  const f = Math.max(1, Number(e.state.fps) || 24), d = Math.max(1 / f, (e.state.duration_frames || 120) / f), h = (e.frame || 0) / f;
  let u = 0;
  for (const v of e.state.motion_layers || []) {
    if (v.enabled === !1) continue;
    const y = Jh.includes(v.source_kind), x = y ? Qh(e.state, v, d) : Zh(v);
    if (!x.length) continue;
    u += 1;
    const k = v.id === e.state.selected_motion_layer_id;
    if (c.strokeStyle = k ? "#ffcc4d" : "rgba(65,217,197,0.6)", c.lineWidth = (k ? 2.4 : 1.5) * r, c.beginPath(), x.forEach((_, A) => {
      const K = p(_.x), F = m(_.y);
      A ? c.lineTo(K, F) : c.moveTo(K, F);
    }), c.stroke(), !y) {
      c.fillStyle = k ? "#ffcc4d" : "#41d9c5";
      for (const _ of x)
        c.beginPath(), c.arc(p(_.x), m(_.y), (k ? 3.4 : 2.4) * r, 0, Math.PI * 2), c.fill();
    }
    const g = eu(x, h);
    g && (c.fillStyle = k ? "#ffcc4d" : "#41d9c5", c.strokeStyle = "#fff", c.lineWidth = 1.4 * r, c.beginPath(), c.arc(p(g.x), m(g.y), 4.4 * r, 0, Math.PI * 2), c.fill(), c.stroke());
  }
  c.strokeStyle = "rgba(255,255,255,0.16)", c.lineWidth = 1, c.strokeRect(l.x + 0.5, l.y + 0.5, l.w - 1, l.h - 1), c.restore();
  const b = e.root.querySelector('[data-role="motion-preview-empty"]');
  b && (b.hidden = u > 0);
}
function au(e, t) {
  const a = e.root.querySelector('[data-role="motion-preview"]');
  a && a.addEventListener("click", (o) => {
    const r = a.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const n = ei(a, e.state.width || 1280, e.state.height || 720), i = a.width / r.width, c = {
      x: ((o.clientX - r.left) * i - n.x) / Math.max(1, n.w),
      y: ((o.clientY - r.top) * i - n.y) / Math.max(1, n.h)
    }, l = Wc(e.state.motion_layers, c, 0.09);
    l && (e.state.selected_motion_layer_id = l.id, e.render());
  }, { signal: t });
}
function Ce(e, t, a, o = "value") {
  for (const r of e.querySelectorAll(`[data-role="${t}"]`))
    r !== a && (r[o] = a[o]);
}
function ou(e) {
  e.abortController = new AbortController();
  const t = e.abortController.signal, a = (o) => e.root.querySelector(o);
  Vc(e, t), Hc(e, t), au(e, t), Wf(e, a, t), Ch(e, a, t), Nl(e, t), Uh(e, t), Xh(e, t), Ff(e, a, t), xh(e, t);
}
function ru(e, t) {
  return Object.defineProperty(e, "omnicamMetrics", { value: Object.freeze({ ...t }), enumerable: !0 }), e;
}
function nu(e, t) {
  const a = t?.omnicamMetrics || {}, o = Number(a.fps) || Number(e.state.fps), r = Number(a.requestedFrames) || Number(e.state.duration_frames), n = Number(a.width) || Number(e.canvas.width), i = Number(a.height) || Number(e.canvas.height), c = e.state.playblast_camera_id === bs ? Cr(e.state).map((l) => ({ camera_id: l.camera_id, start_frame: l.start, end_frame: l.end })) : [];
  return {
    format: "majoor.omnicam.playblast.v1",
    encoder: String(a.encoder || "unknown"),
    mime_type: String(t?.type || "video/webm"),
    fps: o,
    frame_count: r,
    duration_seconds: r / o,
    width: n,
    height: i,
    aspect_ratio: n / i,
    clean_capture: !0,
    drift_ms: Number(a.driftMs) || 0,
    cuts: c,
    // What Monitor compares its own live recompute against to warn when the
    // edit has moved on since this file was recorded. Computed from `ui.state`
    // as it stands right now -- recording holds the panel locked, so this is
    // the state that produced the pixels above.
    motion_scene_fingerprint: sd(e.state)
  };
}
function su(e, t) {
  const a = nu(e, t);
  return e.state.metadata = { ...e.state.metadata || {}, playblast: a }, a;
}
function Rn(e, t, { frameCount: a = 0, fps: o = 0 } = {}) {
  const r = Math.round(Number(t?.videoWidth || t?.naturalWidth) || 0), n = Math.round(Number(t?.videoHeight || t?.naturalHeight) || 0), i = Math.round(Number(o) || Number(e.state?.fps) || Number(e.fpsWidget?.value) || 24), c = Number(t?.duration) > 0 ? Math.round(Number(t.duration) * i) : 0, l = Math.round(Number(a) || c || 0);
  return !r || !n ? !1 : (e.widthWidget && (e.widthWidget.value = r), e.heightWidget && (e.heightWidget.value = n), i && e.fpsWidget && (e.fpsWidget.value = i), l && i && e.durationWidget && (e.durationWidget.value = Math.max(0.25, l / i)), e.syncFromWidgets(), !0);
}
const mt = 1024 * 1024, iu = Object.freeze({
  card: 128 * mt,
  // MAX_CARD_BYTES
  model: 256 * mt,
  // MAX_MODEL_BYTES
  fbx: 64 * mt,
  // MAX_FBX_MODEL_BYTES
  image: 128 * mt,
  // background stills go through the card/asset route
  audio: 128 * mt
  // no upload, but decodeAudioData still buffers it all
}), Dn = 2e3;
function Kn(e) {
  return `${(e / mt).toFixed(e >= 10 * mt ? 0 : 1)} MB`;
}
function Zt(e, t) {
  const a = iu[t];
  if (!e || !a) return null;
  const o = Number(e.size);
  return !Number.isFinite(o) || o <= a ? null : `${e.name || "File"} is ${Kn(o)}; the maximum is ${Kn(a)}.`;
}
function cu(e) {
  return Number(e) <= Dn ? null : `${e} frames selected; a background sequence is limited to ${Dn}.`;
}
function lu(e) {
  const t = e.audioElement;
  return !t || t.paused || !Number.isFinite(t.currentTime) ? null : Math.round(t.currentTime * Math.max(1, e.state.fps));
}
function rr(e, t) {
  const a = e.audioElement;
  if (!a) return;
  const o = Math.max(0, t / Math.max(1, e.state.fps));
  if (!(o >= (e.audioDuration || 0)))
    try {
      a.currentTime = o;
    } catch {
    }
}
function du(e) {
  if (e.playing) return To(e);
  e.playing = !0;
  for (const m of e.root.querySelectorAll('[data-act="play"]')) {
    m.classList.add("playing");
    const f = m.querySelector("i");
    f && (f.className = "pi pi-pause");
  }
  const t = e.state.playback_range, a = t ? t[0] : 0, o = t ? t[1] : e.state.duration_frames - 1;
  let r = e.frame >= o || e.frame < a ? a : e.frame, n = null;
  e.audioElement && (rr(e, r), Promise.resolve(e.audioElement.play()).catch(() => {
  }));
  const i = 1e3 / e.state.fps;
  let c = performance.now(), l = 0;
  const p = (m) => {
    if (!e.playing) return;
    const f = lu(e);
    if (f === null) {
      for (l += m - c, c = m; l >= i; )
        if (l -= i, r += 1, r > o) {
          if (!e.state.loop_playback) return void To(e);
          r = a;
        }
    } else if (c = m, l = 0, r = f, r > o) {
      if (!e.state.loop_playback) return void To(e);
      r = a, rr(e, a);
    } else r < a && (r = a, rr(e, a));
    r !== n && (n = r, e.setFrame(r, !0, !1)), e.playTimer = requestAnimationFrame(p);
  };
  e.playTimer = requestAnimationFrame(p);
}
function To(e) {
  e.playing = !1, e.playTimer && cancelAnimationFrame(e.playTimer), e.playTimer = null;
  for (const t of e.root.querySelectorAll('[data-act="play"]')) {
    t.classList.remove("playing");
    const a = t.querySelector("i");
    a && (a.className = "pi pi-play");
  }
  try {
    e.audioElement?.pause();
  } catch {
  }
}
function Lo(e) {
  const t = e.audioElement;
  if (t) {
    try {
      t.pause();
    } catch {
    }
    try {
      t.removeAttribute("src"), t.load();
    } catch {
    }
  }
  if (e.audioObjectUrl) {
    try {
      URL.revokeObjectURL(e.audioObjectUrl);
    } catch {
    }
    e.audioObjectUrl = null;
  }
  e.audioElement = null, e.audioDuration = 0, e.audioSamples = null, e.audioWaveformPeaks = null;
}
function ti(e) {
  const t = e.audioSamples;
  if (!t || !t.data?.length) {
    e.audioWaveformPeaks = null;
    return;
  }
  const { data: a, sampleRate: o } = t, r = e.state.duration_frames / Math.max(1, e.state.fps), n = Math.min(a.length, Math.floor(r * o)), i = Math.min(600, Math.max(100, e.state.duration_frames * 4)), c = Math.max(1, Math.floor(n / i)), l = [];
  for (let p = 0; p < i; p++) {
    let m = 0;
    const f = p * c, d = Math.min(n, f + c);
    for (let h = f; h < d; h++) {
      const u = Math.abs(a[h] || 0);
      u > m && (m = u);
    }
    l.push(m);
  }
  e.audioWaveformPeaks = l, e.refreshKeys();
}
async function mu(e, { load: t = () => import("./vendor-mediabunny-CZ5VNE-V.js") } = {}) {
  const { ALL_FORMATS: a, AudioSampleSink: o, BlobSource: r, Input: n } = await t(), c = await new n({ formats: a, source: new r(e) }).getPrimaryAudioTrack();
  if (!c) return null;
  const l = [];
  let p = 0, m = 0;
  for await (const h of new o(c).samples())
    try {
      m = m || h.sampleRate;
      const u = { planeIndex: 0, format: "f32-planar" }, b = new Float32Array(h.allocationSize(u) / Float32Array.BYTES_PER_ELEMENT);
      h.copyTo(b, u), l.push(b), p += b.length;
    } finally {
      h.close();
    }
  if (!p || !m) return null;
  const f = new Float32Array(p);
  let d = 0;
  for (const h of l)
    f.set(h, d), d += h.length;
  return { data: f, sampleRate: m };
}
function pu(e) {
  return Number.isFinite(e.duration) && e.duration > 0 ? Promise.resolve() : new Promise((t) => {
    const a = () => {
      e.removeEventListener("loadedmetadata", a), e.removeEventListener("error", a), t();
    };
    e.addEventListener("loadedmetadata", a), e.addEventListener("error", a);
  });
}
async function fu(e, t, { decode: a = mu } = {}) {
  if (!t) return;
  const o = Zt(t, "audio");
  if (o) {
    e.setStatus(o);
    return;
  }
  Lo(e);
  try {
    const r = URL.createObjectURL(t), n = new Audio();
    n.preload = "auto", n.src = r, e.audioObjectUrl = r, e.audioElement = n, await pu(n), e.audioDuration = Number.isFinite(n.duration) ? n.duration : 0;
    try {
      e.audioSamples = await a(t);
    } catch {
      e.audioSamples = null;
    }
    ti(e), e.setStatus(`Audio loaded: ${t.name || "track"}`);
  } catch (r) {
    Lo(e), e.setStatus(`Failed to load audio: ${r.message || r}`);
  }
}
let Et = null;
function ai({ api: e }) {
  Et = e;
}
const oi = /* @__PURE__ */ new WeakSet(), Vt = /* @__PURE__ */ new WeakMap();
function No(e) {
  if (!(typeof HTMLVideoElement > "u" || !(e instanceof HTMLVideoElement)))
    try {
      e.pause(), e.removeAttribute("src"), e.srcObject = null, e.load();
    } catch {
    }
}
function hu(e) {
  e && typeof e == "object" && Vt.set(e, (Vt.get(e) || 0) + 1);
}
function uu(e) {
  if (!e || typeof e != "object") return;
  const t = Vt.get(e) || 0;
  if (t > 1) {
    Vt.set(e, t - 1);
    return;
  }
  Vt.delete(e), oi.has(e) && No(e);
}
function Qt(e, t) {
  const a = e.cardMediaById.get(t);
  a && (e.cardMediaById.delete(t), e.cardMediaAssetById?.delete?.(t), t === "subject" && e.cardMedia === a && (e.cardMedia = null), uu(a));
}
function bu(e) {
  for (const t of [...e.cardMediaById?.keys?.() || []]) Qt(e, t);
}
function rt(e, t, a, o = !1, r = "") {
  const n = e.cardMediaById.get(t);
  if (n === a) {
    e.cardMediaAssetById ||= /* @__PURE__ */ new Map(), e.cardMediaAssetById.set(t, r || a?.__omnicamAsset || "");
    try {
      a.__omnicamAsset = r || a.__omnicamAsset || "";
    } catch {
    }
    t === "subject" && (e.cardMedia = a);
    return;
  }
  n && n !== a && Qt(e, t), o && oi.add(a), hu(a), e.cardMediaAssetById ||= /* @__PURE__ */ new Map(), e.cardMediaById.set(t, a), e.cardMediaAssetById.set(t, r || a?.__omnicamAsset || "");
  try {
    a.__omnicamAsset = r || a.__omnicamAsset || "";
  } catch {
  }
  t === "subject" && (e.cardMedia = a);
}
function ri(e, t, { signal: a, timeout: o = 15e3 } = {}) {
  return new Promise((r, n) => {
    if (a?.aborted) return n(new DOMException("Operation cancelled", "AbortError"));
    let i = null;
    const c = () => {
      i !== null && clearTimeout(i), a?.removeEventListener?.("abort", l);
      for (const m of t) e.removeEventListener?.(m, p);
    }, l = () => {
      c(), n(new DOMException("Operation cancelled", "AbortError"));
    }, p = (m) => {
      c(), r(m);
    };
    for (const m of t) e.addEventListener?.(m, p, { once: !0 });
    a?.addEventListener?.("abort", l, { once: !0 }), o > 0 && (i = setTimeout(() => {
      c(), n(new Error(`Timed out waiting for ${t.join("/")}`));
    }, o));
  });
}
async function ni(e, t, a, o = () => !0, r = null) {
  if (!t || !a) return;
  const n = () => !e.disposed && o(), i = String(t.asset || a).toLowerCase();
  if (r ?? /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/.test(i)) {
    const l = document.createElement("video");
    if (l.src = a, l.loop = !0, l.muted = !0, l.playsInline = !0, await ri(l, ["loadeddata", "error"], { signal: e.abortController?.signal }).catch(() => {
    }), !n()) {
      No(l);
      return;
    }
    if (await l.play().catch(() => {
    }), !n()) {
      No(l);
      return;
    }
    rt(e, t.id, l, !0, t.asset || a);
  } else {
    const l = new Image();
    if (l.src = a, await l.decode().catch(() => {
    }), !n()) {
      l.src = "";
      return;
    }
    rt(e, t.id, l, !0, t.asset || a);
  }
  return e.disposed ? null : (e.render(), e.cardMediaById.get(t.id) || null);
}
async function gu(e, t) {
  if (!Et?.fetchApi || !/\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(e)) return null;
  const a = await Et.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: { kind: "annotated_input", value: e } }),
    signal: t
  });
  return a.ok && (await a.json())?.info || null;
}
function wt(e, t = "") {
  const a = String(e || ""), o = a.match(/\s+\[(input|output|temp)\]$/), r = o ? a.slice(0, o.index) : a, n = o?.[1] || "input";
  return `${t && !r.includes("/") && !r.includes("\\") ? `${t}/${r}` : r} [${n}]`;
}
function yu(e) {
  const t = (e.assetRestoreGeneration || 0) + 1;
  e.assetRestoreGeneration = t;
  const a = () => !e.disposed && e.assetRestoreGeneration === t;
  if (e.state.viewport_bg_image) {
    const o = new Image();
    o.src = tt(e.state.viewport_bg_image), o.decode().catch(() => {
    }), e.viewportBgImage = o;
  }
  e.viewportBgSequenceImages = (e.state.viewport_bg_sequence || []).map((o) => {
    const r = new Image();
    return r.src = tt(o), r.decode().catch(() => {
    }), r;
  });
  for (const o of e.state.objects) {
    if (!o.asset) {
      (o.type === "model" || o.type === "glb") && (o.load_error = s("Not saved to the ComfyUI input folder: this model will be missing after a reload.")), o.type === "card" && Qt(e, o.id);
      continue;
    }
    const r = tt(o.asset);
    o.type === "glb" || o.type === "model" ? e.modelUrlsById.set(o.id, r) : o.type === "card" && e.cardMediaAssetById?.get?.(o.id) !== o.asset && e.loadMediaUrl(o, r, a);
  }
}
function vu(e, t) {
  e.modelInfoById.set(t.id, t);
  const a = e.state.objects.find((o) => o.id === t.id);
  if (t.error) {
    a && (a.load_error = t.error), e.setStatus(`⚠️ ${t.error}`), e.refreshObjects(), t.id === e.selectedObjectId && e.refreshInspector();
    return;
  }
  a && (a.load_error = null), a?.animation_index && e.webgl?.selectAnimation(t.id, a.animation_index), t.id === e.selectedObjectId && e.refreshInspector(), !t.meshes && !t.points && t.bones ? e.setStatus(s(`${t.format.toUpperCase()} animation only: ${t.bones} bones, no mesh · skeleton preview`)) : e.setStatus(s(`${t.format.toUpperCase()} loaded: ${t.meshes} mesh${t.meshes === 1 ? "" : "es"}, ${t.vertices} vertices`));
}
async function xu(e, t) {
  if (!t) return;
  const a = t.name.split(".").pop()?.toLowerCase();
  if (!["glb", "obj", "fbx", "stl", "ply"].includes(a)) return e.setStatus(s("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first."));
  const o = Zt(t, a === "fbx" ? "fbx" : "model");
  if (o) return e.setStatus(o);
  e.checkpoint?.("Import model");
  const r = `model_${Date.now().toString(36)}`, n = {
    id: r,
    type: "model",
    format: a,
    name: t.name.replace(/\.[^.]+$/i, ""),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    size: [1, 1, 1],
    material_mode: "textured",
    keyframes: [],
    enabled: !0,
    asset: ""
  };
  e.state.objects.push(n), e.selectedEntity = "object", e.selectedObjectId = r, e.selectedObjectIds = /* @__PURE__ */ new Set([r]), e.selectedKeyFrame = null;
  const i = e.objectUrls.replace(r, t);
  e.modelUrlsById.set(r, i), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s("Uploading {format}…").replace("{format}", a.toUpperCase()));
  try {
    const c = await Fr(Et, { route: "/majoor/omnicam/upload_model", field: "asset", file: t });
    if (e.disposed || !e.state.objects.includes(n)) return;
    if (!c?.path) throw new Error("upload returned no managed path");
    n.asset = c.path, n.load_error = null, e.serialize();
    const l = e.modelInfoById.get(r);
    l ? e.onModelLoaded(l) : e.setStatus(s("{format} imported: {name}").replace("{format}", a.toUpperCase()).replace("{name}", c.name || n.name));
  } catch (c) {
    if (e.disposed || !e.state.objects.includes(n)) return;
    console.error("[OmniCam] model upload failed", c), n.load_error = s("Not saved to the ComfyUI input folder: this model will be missing after a reload."), e.serialize(), e.refreshObjects(), e.setStatus(s("{format} shown locally, but the upload failed — it will not survive a reload.").replace("{format}", a.toUpperCase()));
  }
}
async function wu(e, t) {
  if (!t) return;
  const a = Zt(t, "card");
  if (a) return e.setStatus(a);
  const o = e.selectedObject()?.type === "card" ? e.selectedObject() : e.state.objects.find((r) => r.id === "subject");
  if (o) {
    if (e.checkpoint?.("Replace card media"), e.cardUrl = e.objectUrls.replace(o.id, t), t.type.startsWith("video/")) {
      const r = document.createElement("video");
      if (r.src = e.cardUrl, r.loop = !0, r.muted = !0, r.playsInline = !0, await r.play().catch(() => {
      }), e.disposed) {
        No(r);
        return;
      }
      rt(e, o.id, r, !0, e.cardUrl);
    } else {
      const r = new Image();
      if (r.src = e.cardUrl, await r.decode().catch(() => {
      }), e.disposed) {
        r.src = "";
        return;
      }
      rt(e, o.id, r, !0, e.cardUrl);
    }
    e.render(), e.setStatus(s("Uploading card…"));
    try {
      const r = await Fr(Et, { route: "/majoor/omnicam/upload_asset", field: "asset", file: t });
      if (e.disposed || !e.state.objects.includes(o)) return;
      o.asset = r.path, e.cardMediaAssetById?.set?.(o.id, r.path), o.id === "subject" && (e.state.card_asset = r.path, e.cardWidget && (e.cardWidget.value = r.path)), e.serialize(), e.setStatus(s(`Card: ${r.name}`));
    } catch (r) {
      if (e.disposed || !e.state.objects.includes(o)) return;
      console.error(r), e.setStatus(s("Card loaded locally; backend upload failed"));
    }
  }
}
function ku(e, t) {
  e.executionReferences = Array.isArray(t?.images) ? t.images : [];
  const a = e.root.querySelector('[data-role="reference-select"]');
  if (a.innerHTML = "", e.executionReferences.forEach((o, r) => {
    const n = document.createElement("option");
    n.value = String(r), n.textContent = o.filename || s(`Upstream ${r + 1}`), a.appendChild(n);
  }), !e.executionReferences.length) {
    const o = document.createElement("option");
    o.value = "0", o.textContent = s("No upstream reference"), a.appendChild(o);
    return;
  }
  e.state.reference_index = ee(e.state.reference_index || 0, 0, e.executionReferences.length - 1), a.value = String(e.state.reference_index), e.serialize(), e.loadSelectedReference();
}
function Su(e) {
  const t = e.executionReferences[e.state.reference_index];
  if (!t) return;
  const a = new Image();
  a.onload = () => {
    e.disposed || (rt(e, "subject", a, !1, a.src), e.render(), e.setStatus(s("Upstream media refreshed")));
  }, a.src = Et.apiURL(`/view?${new URLSearchParams(t).toString()}`);
}
async function ju(e) {
  if (!e.node) return;
  const t = e.node.graph;
  if (!t) return;
  const a = (e.upstreamSyncId || 0) + 1;
  e.upstreamSyncId = a, e.upstreamFetchController?.abort();
  const o = new AbortController();
  e.upstreamFetchController = o;
  const r = () => !e.disposed && e.upstreamSyncId === a;
  let n = !1;
  const i = e.node.inputs || [];
  let c = !1, l = !1;
  const p = /* @__PURE__ */ new Set();
  for (const f of i) {
    const d = String(f.name || "").toLowerCase();
    if (f.link == null) continue;
    const h = id(t, f.link);
    if (h) {
      if (d === "image" || d === "video") {
        c = !0;
        const u = h.widgets?.find(
          (b) => ["image", "image_path", "upload", "file", "filename", "video", "video_path"].includes(String(b.name).toLowerCase())
        );
        if (u && u.value) {
          const b = String(u.value), v = /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(b), y = h.widgets?.find((g) => String(g.name).toLowerCase() === "subfolder")?.value || "", x = tt(wt(b, y)), k = e.state.objects.find((g) => g.id === "subject");
          if (k) {
            const g = await ni(e, k, x, r, v);
            if (!r()) return;
            k.asset = wt(b, y);
            let _ = null;
            if (v)
              try {
                _ = await gu(b, o.signal);
              } catch (A) {
                if (A?.name === "AbortError") return;
                console.warn("Failed to describe upstream video:", A);
              }
            r() && Rn(e, g, {
              fps: _?.fps,
              frameCount: v ? _?.frame_count : 1
            }), e.upstreamImageConnected = !0, n = !0, e.setStatus(s(`Upstream ${v ? "video" : "image"}: ${b}`));
          }
        } else {
          const b = cd(h);
          b && (b instanceof HTMLVideoElement && b.paused && b.play().catch(() => {
          }), rt(e, "subject", b, !1, b.currentSrc || b.src || ""), Rn(e, b, { frameCount: b instanceof HTMLVideoElement ? 0 : 1 }), e.upstreamImageConnected = !0, n = !0, e.render(), e.setStatus(b instanceof HTMLVideoElement ? s("Upstream video preview synced") : s("Upstream image preview synced")));
        }
      }
      if (d === "audio") {
        l = !0;
        const u = h.widgets?.find(
          (b) => ["audio", "audio_path", "audio_file", "file", "filename"].includes(String(b.name).toLowerCase())
        );
        if (u && u.value) {
          const b = String(u.value), v = h.widgets?.find((x) => String(x.name).toLowerCase() === "subfolder")?.value || "", y = tt(wt(b, v));
          try {
            const x = await fetch(y, { signal: o.signal });
            if (x.ok) {
              const k = await x.blob();
              if (!r()) return;
              const g = new File([k], b, { type: k.type || "audio/wav" });
              await e.loadAudioFile(g), e.upstreamAudioConnected = !0, n = !0, e.setStatus(s(`Upstream audio: ${b}`));
            }
          } catch (x) {
            if (x?.name === "AbortError") return;
            console.warn("Failed to fetch upstream audio:", x);
          }
        }
      }
      if (d === "scene_3d" || d === "model" || d === "mesh") {
        const u = h.widgets?.find(
          (b) => ["model_file", "model", "file", "filename", "filepath", "mesh", "scene", "3d_file"].includes(String(b.name).toLowerCase())
        );
        if (u && u.value) {
          const b = String(u.value), v = b.split(".").pop()?.toLowerCase();
          if (["glb", "gltf", "obj", "fbx", "stl", "ply"].includes(v)) {
            const y = h.widgets?.find((_) => String(_.name).toLowerCase() === "subfolder")?.value || "", x = tt(wt(b, y)), k = `upstream_scene_${h.id}`;
            p.add(k);
            let g = e.state.objects.find((_) => _.id === k);
            g ? (g.asset = wt(b, y), g.format = v === "gltf" ? "glb" : v) : (g = {
              id: k,
              type: "model",
              format: v === "gltf" ? "glb" : v,
              name: `Upstream: ${b.replace(/\.[^.]+$/i, "")}`,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              size: [1, 1, 1],
              material_mode: "textured",
              keyframes: [],
              enabled: !0,
              asset: wt(b, y)
            }, e.state.objects.push(g)), e.modelUrlsById.set(k, x), e.serialize(), e.refreshObjects(), e.render(), n = !0, e.setStatus(s(`Upstream 3D model: ${b}`));
          }
        }
      }
    }
  }
  if (!c && e.upstreamImageConnected) {
    Qt(e, "subject");
    const f = e.state.objects.find((d) => d.id === "subject");
    f && (f.asset = ""), e.upstreamImageConnected = !1, n = !0, e.setStatus(s("Upstream image disconnected · card reset"));
  }
  !l && e.upstreamAudioConnected && (Lo(e), e.upstreamAudioConnected = !1, e.refreshKeys(), n = !0, e.setStatus(s("Upstream audio disconnected · audio track cleared")));
  const m = e.state.objects.filter(
    (f) => f.id.startsWith("upstream_scene_") && !p.has(f.id)
  );
  if (m.length > 0) {
    for (const f of m)
      e.modelUrlsById.delete(f.id), e.modelInfoById.delete(f.id), e.webgl?.removeModel(f.id);
    e.state.objects = e.state.objects.filter(
      (f) => !m.some((d) => d.id === f.id)
    ), e.refreshObjects(), n = !0, e.setStatus(s("Upstream 3D scene disconnected · model removed"));
  }
  zl(e) && (n = !0), n && (e.serialize(), e.render());
}
const _u = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"], Bn = { low: 3e6, balanced: 6e6, high: 12e6 };
function Cu(e) {
  return Bn[e] || Bn.balanced;
}
async function Eu({
  canvas: e,
  fps: t,
  frameCount: a,
  renderFrame: o,
  quality: r = "balanced",
  mediaRecorder: n = globalThis.MediaRecorder,
  signal: i,
  now: c = () => globalThis.performance?.now?.() ?? Date.now(),
  sleep: l = (m) => new Promise((f) => setTimeout(f, m)),
  onMetrics: p
}) {
  if (!n || !e.captureStream) throw new Error("MediaRecorder unsupported in this browser");
  const m = e.captureStream(t);
  let f;
  try {
    for (const k of _u)
      if (!(n.isTypeSupported && !n.isTypeSupported(k)))
        try {
          f = new n(m, { mimeType: k, videoBitsPerSecond: Cu(r) });
          break;
        } catch {
        }
    if (!f) throw new Error("Cannot create MediaRecorder");
    const d = [];
    f.ondataavailable = (k) => {
      k.data.size && d.push(k.data);
    };
    const h = new Promise((k, g) => {
      f.addEventListener("stop", k, { once: !0 }), f.addEventListener("error", () => g(f.error || new Error("MediaRecorder failed")), { once: !0 });
    });
    f.start(100);
    const u = c();
    for (let k = 0; k < a; k++) {
      if (i?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await o(k), await l(1e3 / t);
    }
    f.stop(), await h;
    const b = Math.max(0, c() - u), v = a / t * 1e3, y = {
      encoder: "media_recorder",
      requestedFrames: a,
      expectedDurationMs: v,
      recordedDurationMs: b,
      driftMs: b - v,
      fps: t,
      width: e.width,
      height: e.height
    };
    p?.(y);
    const x = new Blob(d, { type: f.mimeType || "video/webm" });
    return ru(x, y);
  } finally {
    f?.state === "recording" && f.stop(), m.getTracks().forEach((d) => d.stop());
  }
}
async function Au(e, t) {
  const a = t.type.startsWith("video/mp4") ? "mp4" : "webm", o = new FormData();
  o.append("video", t, `omnicam_playblast.${a}`);
  const r = await e.fetchApi("/majoor/omnicam/upload_playblast", { method: "POST", body: o });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function Tu(e) {
  await Promise.all([...e].filter((t) => t instanceof HTMLVideoElement && t.seeking).map((t) => ri(t, ["seeked", "error"], { timeout: 5e3 }).catch(() => {
  })));
}
async function si(e) {
  await Tu(e.cardMediaById.values());
}
async function ii(e) {
  return Eu({
    canvas: e.canvas,
    fps: e.state.fps,
    frameCount: e.state.duration_frames,
    quality: e.state.playblast_quality,
    renderFrame: (t) => e.setFrame(t, !0),
    signal: e.abortController?.signal
  });
}
async function ci(e, t) {
  const a = await Au(nt, t);
  if (su(e, t), e.state.playblast_camera_id === bs)
    e.state.sequence = { ...e.state.sequence || {}, recording_path: a.path };
  else {
    const o = e.state.cameras.find((r) => r.id === e.state.playblast_camera_id);
    o && (o.recording_path = a.path);
  }
  e.recordingWidget && (e.recordingWidget.value = a.path), e.serialize(), e.setStatus(s(`Playblast ready: ${a.name}`));
}
function $u(e) {
  const t = { width: e.canvas.width, height: e.canvas.height }, a = e.state.playblast_resolution || "output";
  if (a === "viewport") return t;
  const o = a === "half" ? 0.5 : a === "double" ? 2 : 1, r = Math.max(16, Math.round(Number(e.state.width) || t.width)), n = Math.max(16, Math.round(Number(e.state.height) || t.height)), c = Math.min(o, 3840 / Math.max(r * o, n * o)), l = (p) => Math.max(2, Math.round(p * c / 2) * 2);
  return { width: l(r), height: l(n) };
}
async function Mu(e) {
  if (e.recording) return;
  e.stopPlay(), e.recording = !0, e.root.classList.add("recording"), e.setStatus(s("Encoding deterministic proxy…"));
  const t = e.frame, a = e.canvas.width, o = e.canvas.height, r = $u(e);
  (r.width !== e.canvas.width || r.height !== e.canvas.height) && (e.canvas.width = r.width, e.canvas.height = r.height, e.render());
  try {
    let n = null;
    const i = e.root.querySelector('[data-role="encoder"]').value, { encodeDeterministicPlayblast: c, supportsDeterministicEncoding: l } = await import("./chunk-DS4nlk9_.js");
    i !== "realtime" && await l(e.canvas.width, e.canvas.height) && (n = await c(e.canvas, e.state.duration_frames, e.state.fps, async (p) => {
      e.setFrame(p, !0), e.setStatus(s(`Encoding frame ${p + 1}/${e.state.duration_frames}…`)), await si(e), await new Promise((m) => requestAnimationFrame(m));
    }, e.abortController?.signal, e.state.playblast_quality)), n || (e.setStatus(s("WebCodecs unavailable; recording realtime fallback…")), n = await ii(e)), e.setFrame(t), await ci(e, n);
  } catch (n) {
    console.error(n), e.setStatus(s(`Playblast failed: ${n.message || n}`));
  } finally {
    e.recording = !1, e.root.classList.remove("recording"), (e.canvas.width !== a || e.canvas.height !== o) && (e.canvas.width = a, e.canvas.height = o), e.resizeCanvas?.(), e.setFrame(t);
  }
}
let Yt = null;
function Iu({ api: e }) {
  Yt = e;
}
async function li(e) {
  if (!Yt) throw new Error("ComfyUI API is unavailable");
  return Fr(Yt, { route: "/majoor/omnicam/upload_asset", field: "asset", file: e });
}
async function zo(e) {
  const t = e.map((a) => String(a.relative || "").replace(/^omnicam\//, "")).filter(Boolean);
  if (!(!t.length || !Yt))
    try {
      await Yt.fetchApi("/majoor/omnicam/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: t })
      });
    } catch {
    }
}
function Vr(e) {
  return e.backgroundRequestId = (e.backgroundRequestId || 0) + 1, e.backgroundRequestId;
}
async function Ou(e, t) {
  if (!t) return;
  const a = Zt(t, "image");
  if (a) {
    e.setStatus(a);
    return;
  }
  const o = Vr(e);
  let r = null;
  try {
    if (e.setStatus(`Uploading background: ${t.name}`), r = await li(t), o !== e.backgroundRequestId || e.disposed) {
      await zo([r]);
      return;
    }
    const n = tt(r.path);
    e.checkpoint?.("Set background image"), e.state.viewport_bg_image = r.path, e.state.viewport_bg_sequence = [];
    const i = new Image();
    i.src = n, await i.decode().catch(() => {
    }), e.viewportBgImage = i, e.serialize(), e.render(), e.setStatus(`Background image set: ${t.name}`);
  } catch (n) {
    if (r && await zo([r]), o !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG image: ${n.message || n}`);
  }
}
async function Pu(e, t) {
  if (!t || !t.length) return;
  const a = cu(t.length);
  if (a) {
    e.setStatus(a);
    return;
  }
  const o = Array.from(t).map((i) => Zt(i, "image")).find(Boolean);
  if (o) {
    e.setStatus(o);
    return;
  }
  const r = Vr(e);
  t.sort((i, c) => i.name.localeCompare(c.name, void 0, { numeric: !0, sensitivity: "base" }));
  const n = [];
  try {
    e.setStatus(`Uploading background sequence: ${t.length} frames`);
    for (const c of t)
      if (n.push(await li(c)), r !== e.backgroundRequestId || e.disposed) {
        await zo(n);
        return;
      }
    const i = n.map((c) => c.path);
    e.checkpoint?.("Set background sequence"), e.state.viewport_bg_sequence = i, e.state.viewport_bg_image = "", e.viewportBgImage = null, e.viewportBgSequenceImages = i.map((c) => {
      const l = new Image();
      return l.src = tt(c), l.decode().catch(() => {
      }), l;
    }), e.serialize(), e.render(), e.setStatus(`Background sequence loaded: ${t.length} frames`);
  } catch (i) {
    if (await zo(n), r !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG sequence: ${i.message || i}`);
  }
}
function Lu(e) {
  Vr(e), e.checkpoint?.("Clear background"), e.state.viewport_bg_image = "", e.state.viewport_bg_sequence = [], e.viewportBgImage = null, e.viewportBgSequenceImages = [], e.serialize(), e.render(), e.setStatus("Background cleared");
}
function Nu(e) {
  const t = cr(e.state?.metadata?.viewport_labels);
  if (t.mode === "off") return;
  const a = Array.isArray(e.state?.objects) ? e.state.objects : [], o = e.viewportCamera(), r = e.ctx, n = e.canvas.width, i = e.canvas.height, c = ee(i / 720, 0.75, 4), l = Number(e.frame) || 0, p = e.selectedObjectIds instanceof Set ? e.selectedObjectIds : /* @__PURE__ */ new Set();
  r.save(), r.font = `${Math.round(12 * c)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`, r.textBaseline = "alphabetic";
  for (const m of a) {
    if (m.enabled === !1 || !is(m, { mode: t.mode, selectedIds: p })) continue;
    const f = cs(m, t.content);
    if (!f) continue;
    const d = ls(a, m, l) || { position: m.position, size: m.size }, h = Ge(ds(d, m.type), o, n, i);
    if (!h) continue;
    const [u, b] = h, v = t.content === "annotation" && m.annotation?.color || "", y = 6 * c, x = 4 * c, g = r.measureText(f).width + y * 2, _ = 12 * c + x * 2, A = Math.round(u - g / 2), K = Math.round(b - _ - 6 * c);
    r.fillStyle = "rgba(16,17,22,0.82)", zu(r, A, K, g, _, 4 * c), r.fill(), v && (r.strokeStyle = v, r.lineWidth = Math.max(1, c), r.stroke()), r.fillStyle = v || "#e6e6ec", r.fillText(f, A + y, K + _ - x - 2 * c);
  }
  r.restore();
}
function zu(e, t, a, o, r, n) {
  if (typeof e.roundRect == "function") {
    e.beginPath(), e.roundRect(t, a, o, r, n);
    return;
  }
  const i = Math.min(n, o / 2, r / 2);
  e.beginPath(), e.moveTo(t + i, a), e.arcTo(t + o, a, t + o, a + r, i), e.arcTo(t + o, a + r, t, a + r, i), e.arcTo(t, a + r, t, a, i), e.arcTo(t, a, t + o, a, i), e.closePath();
}
function ie(e, t, a, o = "#5a5a5a", r = 1) {
  const n = e.viewportCamera(), i = Ge(t, n, e.canvas.width, e.canvas.height), c = Ge(a, n, e.canvas.width, e.canvas.height);
  !i || !c || (e.ctx.strokeStyle = o, e.ctx.lineWidth = r, e.ctx.beginPath(), e.ctx.moveTo(i[0], i[1]), e.ctx.lineTo(c[0], c[1]), e.ctx.stroke());
}
function Fu(e) {
  for (let t = -60; t <= 60; t += 1) {
    const a = t === 0, o = a ? "#6f6f6f" : "#353535";
    ie(e, [t, 0, -60], [t, 0, 60], o, a ? 1.6 : 1), ie(e, [-60, 0, t], [60, 0, t], o, a ? 1.6 : 1);
  }
}
function Ru(e) {
  const t = e.state.point_density || "balanced", a = e.state.point_spread || "all_views", o = e.state.point_color || null, r = `${t}|${a}|${o}`;
  return e._pointFieldCache?.key !== r && (e._pointFieldCache = { key: r, ...Gc(t, a, o) }), e._pointFieldCache;
}
const Du = 600;
function Ku(e) {
  const { points: t, colors: a } = Ru(e);
  if (!t.length) return;
  const o = e.viewportCamera(), r = e.canvas.width, n = e.canvas.height, i = t.length / 3, c = 3 * Math.max(1, Math.ceil(i / Du)), l = /* @__PURE__ */ new Map();
  for (let p = 0; p < t.length; p += c) {
    const m = Ge([t[p], t[p + 1], t[p + 2]], o, r, n);
    if (!m) continue;
    const f = ee(Math.round(5 / Math.sqrt(m[2])), 1, 4), d = `${Math.round(a[p] * 255)},${Math.round(a[p + 1] * 255)},${Math.round(a[p + 2] * 255)}|${f}`;
    let h = l.get(d);
    h || (h = { fill: `rgb(${d.slice(0, d.indexOf("|"))})`, radius: f, xs: [], ys: [] }, l.set(d, h)), h.xs.push(m[0]), h.ys.push(m[1]);
  }
  for (const p of l.values()) {
    e.ctx.fillStyle = p.fill, e.ctx.beginPath();
    for (let m = 0; m < p.xs.length; m += 1)
      e.ctx.moveTo(p.xs[m] + p.radius, p.ys[m]), e.ctx.arc(p.xs[m], p.ys[m], p.radius, 0, Math.PI * 2);
    e.ctx.fill();
  }
}
function Bu(e, t) {
  const [a, o, r] = t.size || [1, 1, 1], [n, i, c] = t.position || [0, 0, 0], l = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1]
  ].map((m) => [n + m[0] * a / 2, i + m[1] * o / 2, c + m[2] * r / 2]), p = [
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
  for (const [m, f] of p) ie(e, l[m], l[f], "#a0a0a0", 1.4);
}
function qu(e, t) {
  const [a] = t.size || [1.5], [o, r, n] = t.position || [0, 1, 0], i = a / 2;
  for (let c = 0; c < 3; c++) {
    let l = null;
    for (let p = 0; p <= 32; p++) {
      const m = p / 32 * Math.PI * 2;
      let f;
      c === 0 ? f = [o + Math.cos(m) * i, r + Math.sin(m) * i, n] : c === 1 ? f = [o + Math.cos(m) * i, r, n + Math.sin(m) * i] : f = [o, r + Math.cos(m) * i, n + Math.sin(m) * i], l && ie(e, l, f, "#999", 1), l = f;
    }
  }
}
function Uu(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], n = t.size?.[1] || 1.8, i = (t.size?.[0] || 0.7) * 0.5, c = [a, o + n * 0.88, r], l = [a, o + n * 0.76, r], p = [a - i * 0.55, o + n * 0.73, r], m = [a + i * 0.55, o + n * 0.73, r], f = [a - i * 0.72, o + n * 0.52, r], d = [a + i * 0.72, o + n * 0.52, r], h = [a - i * 0.82, o + n * 0.34, r], u = [a + i * 0.82, o + n * 0.34, r], b = [a, o + n * 0.44, r], v = [a - i * 0.28, o + n * 0.44, r], y = [a + i * 0.28, o + n * 0.44, r], x = [a - i * 0.28, o + n * 0.22, r], k = [a + i * 0.28, o + n * 0.22, r], g = [a - i * 0.28, o, r + 0.05], _ = [a + i * 0.28, o, r + 0.05];
  ie(e, c, l, "#aaa", 2), ie(e, l, b, "#aaa", 2), ie(e, p, m, "#aaa", 2), ie(e, p, f, "#aaa", 2), ie(e, f, h, "#aaa", 2), ie(e, m, d, "#aaa", 2), ie(e, d, u, "#aaa", 2), ie(e, v, y, "#aaa", 2), ie(e, v, x, "#aaa", 2), ie(e, x, g, "#aaa", 2), ie(e, y, k, "#aaa", 2), ie(e, k, _, "#aaa", 2);
  const A = Ge(c, e.viewportCamera(), e.canvas.width, e.canvas.height);
  A && (e.ctx.strokeStyle = "#aaa", e.ctx.beginPath(), e.ctx.arc(A[0], A[1], ee(28 / A[2], 3, 12), 0, Math.PI * 2), e.ctx.stroke());
}
function Wu(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], [n, i, c] = t.size || [1.5, 1.5, 1.5], l = n * 0.5, p = (c || n) * 0.5, m = i * 0.5, f = 12, d = [], h = [];
  for (let u = 0; u < f; u++) {
    const b = u / f * Math.PI * 2, v = Math.cos(b) * l, y = Math.sin(b) * p;
    d.push([a + v, o + m, r + y]), h.push([a + v, o - m, r + y]);
  }
  for (let u = 0; u < f; u++) {
    const b = (u + 1) % f;
    ie(e, d[u], d[b], "#aaa", 1.5), ie(e, h[u], h[b], "#aaa", 1.5);
  }
  for (let u = 0; u < f; u += 3)
    ie(e, d[u], h[u], "#aaa", 1.5);
}
function Vu(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], [n, i, c] = t.size || [1.5, 1.5, 1.5], l = n * 0.5, p = n * 0.18, m = 16, f = [], d = [];
  for (let h = 0; h < m; h++) {
    const u = h / m * Math.PI * 2, b = Math.cos(u), v = Math.sin(u);
    f.push([a + b * (l + p), o, r + v * (l + p)]), d.push([a + b * (l - p), o, r + v * (l - p)]);
  }
  for (let h = 0; h < m; h++) {
    const u = (h + 1) % m;
    ie(e, f[h], f[u], "#aaa", 1.5), ie(e, d[h], d[u], "#aaa", 1.5), h % 4 === 0 && ie(e, f[h], d[h], "#888", 1);
  }
}
function Hu(e, t) {
  const a = t.position || [0, 1, 0], o = 0.25;
  ie(e, fe(a, [-o, 0, 0]), fe(a, [o, 0, 0]), "#bbb", 2), ie(e, fe(a, [0, -o, 0]), fe(a, [0, o, 0]), "#bbb", 2), ie(e, fe(a, [0, 0, -o]), fe(a, [0, 0, o]), "#bbb", 2);
}
function Gu(e, t) {
  const [a, o, r] = t.position || [0, 1.5, 0], [n, i] = t.size || [2, 3], c = e.viewportCamera(), l = [
    [a - n / 2, o - i / 2, r],
    [a + n / 2, o - i / 2, r],
    [a + n / 2, o + i / 2, r],
    [a - n / 2, o + i / 2, r]
  ].map((v) => Ge(v, c, e.canvas.width, e.canvas.height));
  if (l.some((v) => !v)) return;
  const p = l.map((v) => v[0]), m = l.map((v) => v[1]), f = Math.min(...p), d = Math.max(...p), h = Math.min(...m), u = Math.max(...m);
  e.ctx.save(), e.ctx.beginPath(), e.ctx.moveTo(l[0][0], l[0][1]);
  for (let v = 1; v < 4; v++) e.ctx.lineTo(l[v][0], l[v][1]);
  e.ctx.closePath(), e.ctx.clip();
  const b = e.cardMediaById.get(t.id) || (t.id === "subject" ? e.cardMedia : null);
  if (b)
    try {
      const v = Math.max(1, d - f), y = Math.max(1, u - h), x = b.videoWidth || b.naturalWidth || b.width, k = b.videoHeight || b.naturalHeight || b.height, g = e.state.card_fit || "contain";
      if (e.ctx.fillStyle = "#111", e.ctx.fillRect(f, h, v, y), g === "stretch" || !x || !k)
        e.ctx.drawImage(b, f, h, v, y);
      else if (g === "contain") {
        const _ = Math.min(v / x, y / k), A = x * _, K = k * _;
        e.ctx.drawImage(b, f + (v - A) / 2, h + (y - K) / 2, A, K);
      } else {
        const _ = Math.max(v / x, y / k), A = v / _, K = y / _;
        e.ctx.drawImage(b, (x - A) / 2, (k - K) / 2, A, K, f, h, v, y);
      }
    } catch {
    }
  else
    e.ctx.fillStyle = "#3a414b", e.ctx.fillRect(f, h, d - f, u - h), e.ctx.fillStyle = "#d8d8d8", e.ctx.textAlign = "center", e.ctx.font = `${Math.max(12, Math.min(28, (d - f) * 0.08))}px system-ui`, e.ctx.fillText("SUBJECT CARD", (f + d) / 2, (h + u) / 2);
  e.ctx.restore(), e.ctx.strokeStyle = "#b3b8c1", e.ctx.lineWidth = 2, e.ctx.beginPath(), e.ctx.moveTo(l[0][0], l[0][1]);
  for (let v = 1; v < 4; v++) e.ctx.lineTo(l[v][0], l[v][1]);
  e.ctx.closePath(), e.ctx.stroke();
}
function Yu(e) {
  const t = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
  (e.state.cameras || []).forEach((a, o) => {
    const r = a.keyframes || [], n = a.color || t[o % t.length], i = a.id === e.state.active_camera_id;
    if (!(i && e.state.view_mode === "camera")) {
      if (r.length >= 2)
        for (let c = 0; c < r.length - 1; c++)
          ie(e, r[c].camera.position, r[c + 1].camera.position, n, i ? 2.2 : 1.2);
      for (const c of r) {
        const l = Ge(c.camera.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        l && (e.ctx.fillStyle = c.frame === e.frame ? "#f2d06b" : n, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], i ? 4.5 : 3.5, 0, Math.PI * 2), e.ctx.fill());
      }
      if (e.state.view_mode !== "camera") {
        const c = $e(a, e.frame, e.state.objects), l = Ge(c.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        l && (e.ctx.fillStyle = i ? "#f2d06b" : n, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], i ? 6.5 : 4.5, 0, Math.PI * 2), e.ctx.fill()), c.target && ie(e, c.position, c.target, `${n}88`, 1);
      }
    }
  });
}
function Xu(e) {
  if (e.state.keyframes.length < 2) return;
  const t = [];
  for (let o = 0; o < e.state.keyframes.length - 1; o++) {
    const r = e.state.keyframes[o], n = e.state.keyframes[o + 1];
    t.push(Ve(Fe(n.camera.position, r.camera.position)) * e.state.fps / Math.max(1, n.frame - r.frame));
  }
  const a = Math.max(...t, 1e-6);
  for (let o = 0; o < t.length; o++) {
    const r = 120 * (1 - t[o] / a);
    ie(e, e.state.keyframes[o].camera.position, e.state.keyframes[o + 1].camera.position, `hsl(${r} 85% 55%)`, 5);
  }
}
function Ju(e) {
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  if (!e.recording && e.state.view_mode === "camera" && e.state.guides !== !1) {
    t.save(), t.strokeStyle = "#ffffff33", t.lineWidth = 1, t.beginPath();
    for (const r of [a / 3, 2 * a / 3])
      t.moveTo(r, 0), t.lineTo(r, o);
    for (const r of [o / 3, 2 * o / 3])
      t.moveTo(0, r), t.lineTo(a, r);
    t.moveTo(a / 2 - 14, o / 2), t.lineTo(a / 2 + 14, o / 2), t.moveTo(a / 2, o / 2 - 14), t.lineTo(a / 2, o / 2 + 14), t.stroke(), t.restore();
  }
  if (!e.recording && e.state.view_mode === "camera" && e.state.safe_areas && (t.save(), t.strokeStyle = "#00d2d388", t.lineWidth = 1, t.setLineDash([4, 4]), t.strokeRect(a * 0.05, o * 0.05, a * 0.9, o * 0.9), t.strokeStyle = "#feca5788", t.strokeRect(a * 0.1, o * 0.1, a * 0.8, o * 0.8), t.restore()), !e.recording && e.state.view_mode === "camera" && Fl(t, e.state, a, o), !e.recording && e.state.show_gizmo)
    try {
      e.drawTransformGizmo();
    } catch (r) {
      console.warn("[OmniCam Gizmo Error]", r);
    }
  if (!e.recording && e.boxSelection) {
    const { start: r, current: n } = e.boxSelection;
    t.save(), t.fillStyle = "rgba(74,163,239,.14)", t.strokeStyle = "#4aa3ef", t.lineWidth = 1.5, t.setLineDash([6, 4]), t.fillRect(r[0], r[1], n[0] - r[0], n[1] - r[1]), t.strokeRect(r[0], r[1], n[0] - r[0], n[1] - r[1]), t.restore();
  }
  if (!e.recording && e.state.show_radar)
    try {
      If(e, t, a, o);
    } catch (r) {
      console.error("[OmniCam] radar overlay failed", r), e.radarError = String(r?.message || r);
    }
  if (!e.recording && e.state.view_mode !== "camera" && a > 1 && o > 1) {
    const r = Math.hypot(a, o) / 2, n = t.createRadialGradient(a / 2, o / 2, r * 0.62, a / 2, o / 2, r);
    n.addColorStop(0, "rgba(0,0,0,0)"), n.addColorStop(1, "rgba(0,0,0,0.28)"), t.save(), t.fillStyle = n, t.fillRect(0, 0, a, o), t.restore();
  }
  if (e.state.burn_in) {
    const r = e.viewportCamera();
    t.save(), t.fillStyle = "#000b", t.fillRect(0, o - 34, a, 34), t.fillStyle = "#fff", t.font = `${Math.max(12, Math.round(o * 0.025))}px monospace`, t.fillText(`F ${e.frame}/${e.state.duration_frames - 1}  ${e.state.fps}fps  FOV ${r.fov.toFixed(1)}  ${e.state.render_mode}`, 12, o - 12), t.restore();
  }
  e.recording && e.state.playblast_labels && Nu(e);
}
async function Zu(e, { signal: t } = {}) {
  if (!e?.fetchApi) throw new TypeError("A ComfyUI API client is required");
  const a = await e.fetchApi("/majoor/omnicam/capabilities", { signal: t });
  if (!a.ok) throw new Error(`Capabilities request failed (${a.status || "unknown"})`);
  return a.json();
}
function Qu(e) {
  const t = Array.isArray(e) ? e : [];
  if (!t.length) return { tone: "ok", label: "Core ready" };
  const a = t.length;
  return {
    tone: t.some((o) => o?.severity === "error") ? "error" : "warn",
    label: a === 1 ? "1 optional adapter issue" : `${a} optional adapter issues`
  };
}
async function eb(e) {
  const t = e.root.querySelector('[data-role="setup-badge"]'), a = e.root.querySelector('[data-role="setup-issues"]');
  if (!t || !a) return;
  let o;
  try {
    o = await Zu(nt);
  } catch {
    return;
  }
  e.adapterCapabilities = o;
  const r = o.diagnostic?.issues || [], n = Qu(r);
  if (t.hidden = !1, !r.length) {
    t.className = `setup-badge ${n.tone}`, t.textContent = s("Core ready"), a.innerHTML = "";
    return;
  }
  t.className = `setup-badge ${n.tone}`, t.textContent = r.length === 1 ? s("1 optional adapter issue") : s("{count} optional adapter issues").replace("{count}", String(r.length)), a.innerHTML = "";
  for (const i of r) {
    const c = document.createElement("div");
    c.className = "setup-issue";
    const l = document.createElement("span");
    if (l.textContent = `• ${i.message} `, c.appendChild(l), i.docs) {
      const p = document.createElement("a");
      p.href = i.docs, p.target = "_blank", p.rel = "noopener noreferrer", p.textContent = s("Setup docs"), c.appendChild(p);
    }
    a.appendChild(c);
  }
}
const tb = 1, qn = 0.01, ab = 0.4, ob = 3, rb = 120, nb = 20, sb = 4, ib = 0.25, cb = 0.5;
function lb(e, t, a) {
  const o = Ve(Fe(t.camera.position, e.camera.position)), r = t.frame - e.frame, n = r / a, i = n > 1e-9 ? o / n : 1 / 0;
  return { distance: o, frames: r, duration: n, speed: i };
}
function db(e, t = 24) {
  const a = Array.isArray(e) ? [...e].sort((r, n) => r.frame - n.frame) : [], o = [];
  for (let r = 1; r < a.length; r += 1) {
    const n = lb(a[r - 1], a[r], t);
    o.push({ frameStart: a[r - 1].frame, frameEnd: a[r].frame, ...n });
  }
  return o;
}
function Un(e, t, a) {
  return Math.atan2(e[2] - a, e[0] - t) * 180 / Math.PI;
}
function mb({ keys: e, fps: t = 24, objects: a = [] } = {}) {
  const o = Array.isArray(e) ? [...e].sort((c, l) => c.frame - l.frame) : [], r = [];
  if (o.length < 2) return r;
  const n = db(o, t);
  for (const c of n)
    c.frames <= tb && r.push({
      code: "NEAR_ZERO_DURATION",
      severity: "warning",
      frameStart: c.frameStart,
      frameEnd: c.frameEnd,
      message: `Keys at F${c.frameStart} and F${c.frameEnd} are only ${c.frames} frame(s) apart`
    }), c.distance < qn && c.duration >= ab && r.push({
      code: "STATIC_SEGMENT",
      severity: "info",
      frameStart: c.frameStart,
      frameEnd: c.frameEnd,
      message: `Camera barely moves from F${c.frameStart} to F${c.frameEnd}`
    });
  const i = n.map((c) => c.speed).filter((c) => Number.isFinite(c));
  if (i.length) {
    const c = i.reduce((l, p) => l + p, 0) / i.length;
    if (c > 1e-6)
      for (const l of n)
        Number.isFinite(l.speed) && l.speed > c * ob && r.push({
          code: "SPEED_SPIKE",
          severity: "warning",
          frameStart: l.frameStart,
          frameEnd: l.frameEnd,
          message: `Speed spike F${l.frameStart}-F${l.frameEnd}`
        });
  }
  for (let c = 1; c < o.length - 1; c += 1) {
    const l = Fe(o[c].camera.position, o[c - 1].camera.position), p = Fe(o[c + 1].camera.position, o[c].camera.position), m = Ve(l), f = Ve(p);
    if (m < 1e-6 || f < 1e-6) continue;
    const d = Math.max(-1, Math.min(1, Yc(l, p) / (m * f))), h = Math.acos(d) * 180 / Math.PI;
    h >= rb && r.push({
      code: "HARD_DIRECTION_CHANGE",
      severity: "notice",
      frameStart: o[c - 1].frame,
      frameEnd: o[c + 1].frame,
      message: `Sharp direction change at F${o[c].frame} (${Math.round(h)}°)`
    });
  }
  if (o.length >= sb) {
    const c = o.reduce((h, u) => h + u.camera.position[0], 0) / o.length, l = o.reduce((h, u) => h + u.camera.position[2], 0) / o.length, p = o[0].camera.position, m = o[o.length - 1].camera.position;
    let f = Math.abs(Un(m, c, l) - Un(p, c, l)) % 360;
    f > 180 && (f = 360 - f);
    const d = Ve(Fe(m, p));
    f <= nb && d > qn && r.push({
      code: "ORBIT_NOT_CLOSED",
      severity: "notice",
      frameStart: o[0].frame,
      frameEnd: o[o.length - 1].frame,
      message: `Path nearly returns to its start but does not close (gap ${d.toFixed(2)}m)`
    });
  }
  if (Array.isArray(a) && a.length)
    for (const c of o)
      for (const l of a) {
        if (!l || !Array.isArray(l.position)) continue;
        const p = Number.isFinite(Number(l.radius)) ? Number(l.radius) : cb;
        Ve(Fe(c.camera.position, l.position)) < p + ib && r.push({
          code: "CAMERA_NEAR_OBJECT",
          severity: "warning",
          frameStart: c.frame,
          frameEnd: c.frame,
          message: `Camera passes near ${l.name || l.id || "an object"} at F${c.frame}`
        });
      }
  return r.sort((c, l) => c.frameStart - l.frameStart);
}
function di(e, t, a = null, o = null) {
  const r = Array.isArray(e) ? e : [];
  return r.find((n) => n.frame === t) || (a !== null ? r.find((n) => n.frame === a) : null) || (o !== null ? r.find((n) => n.frame === o) : null) || null;
}
function Hr(e, t) {
  return (t || e.activeCameraTrack?.())?.target_object_id || e.state.target_object_id || null;
}
function Gr(e, t) {
  const a = t || e.activeCameraTrack?.(), o = a?.aim_bone ?? (a?.id === e.state.active_camera_id ? e.state.aim_bone : null);
  return typeof o == "string" && o ? o : null;
}
function pb(e, t = Hr(e)) {
  if (!t) return [];
  const a = e.state.objects.find((o) => o.id === t);
  return !a || a.type !== "model" && a.type !== "glb" ? [] : e.webgl?.listObjectBones?.(t) || [];
}
function mi(e, t, a) {
  const o = Hr(e, t), r = Gr(e, t);
  if (!o || !r) return null;
  const n = e.state.objects.find((p) => p.id === o);
  if (!n || n.enabled === !1) return null;
  const i = e.webgl?.sampleModelPoint?.(o, r, a, e.state.fps || 24);
  if (!i) return null;
  const l = (t || e.activeCameraTrack?.())?.target_offset || e.state.target_offset || [0, 0, 0];
  return [i[0] + (l[0] || 0), i[1] + (l[1] || 0), i[2] + (l[2] || 0)];
}
function fb(e, t, a) {
  const o = t.type === "model" || t.type === "glb" ? e.webgl?.sampleModelPoint?.(t.id, null, a, e.state.fps || 24) : null;
  return o || (t.keyframes?.length ? Do(t, a).position : t.position || [0, 1.5, 0]);
}
function Ht(e, t, a, o) {
  if (!a) return a;
  const r = mi(e, t, o);
  return r && (a.target = r), a;
}
function hb(e, t) {
  const a = t || null;
  e.checkpoint("Change aim bone");
  const o = e.activeCameraTrack();
  o.aim_bone = a, o.id === e.state.active_camera_id && (e.state.aim_bone = a), e.setFrame(e.frame), e.serialize(), e.refreshInspector(), e.render(), e.setStatus(a ? s("Aiming at bone {bone}").replace("{bone}", a) : s("Aiming at the whole object"));
}
function ub(e, { perFrame: t = !1 } = {}) {
  const a = e.activeCameraTrack(), o = Hr(e, a), r = Gr(e, a);
  if (!o || !r) return e.bakeAimToKeyframes();
  const n = e.state.objects.find((c) => c.id === o);
  if (!n || !a.keyframes?.length) return;
  e.checkpoint(t ? "Bake aim per frame" : "Bake aim to keyframes");
  const i = (c) => mi(e, a, c) || fb(e, n, c);
  if (t) {
    const c = a.keyframes[0].frame, l = a.keyframes[a.keyframes.length - 1].frame, p = new Map(a.keyframes.map((m) => [m.frame, m]));
    for (let m = c; m <= l; m++) {
      const d = p.get(m) || { frame: m, camera: $e(a, m, e.state.objects), interpolation: "linear" };
      d.camera.target = [...i(m)], p.set(m, d);
    }
    a.keyframes = [...p.values()].sort((m, f) => m.frame - f.frame);
  } else
    for (const c of a.keyframes) c.camera.target = [...i(c.frame)];
  a.id === e.state.active_camera_id && (e.state.keyframes = a.keyframes), e.setFrame(e.frame), e.serialize(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Aim baked on bone {bone} ({count} keys)").replace("{bone}", r).replace("{count}", String(a.keyframes.length)));
}
function bb(e) {
  const t = e.root?.querySelector('[data-role="camera-aim-bone-row"]'), a = e.root?.querySelector('[data-role="camera-aim-bone"]');
  if (!a) return;
  const o = pb(e);
  t && (t.hidden = o.length === 0);
  const r = Gr(e) || "";
  a.innerHTML = "";
  const n = document.createElement("option");
  n.value = "", n.textContent = s("Whole object"), a.appendChild(n);
  for (const i of o) {
    const c = document.createElement("option");
    c.value = i, c.textContent = i, a.appendChild(c);
  }
  if (r && !o.includes(r)) {
    const i = document.createElement("option");
    i.value = r, i.textContent = `${r} — ${s("missing")}`, a.appendChild(i);
  }
  a.value = r;
}
function gb(e, t, a) {
  if (a.querySelector("input")) return;
  const o = document.createElement("input");
  o.type = "text", o.className = "oc-inline-rename", o.value = t.name || t.type, o.style.cssText = "width:100%;font:inherit;padding:0 2px;box-sizing:border-box";
  const r = a.textContent;
  a.textContent = "", a.appendChild(o), o.focus(), o.select();
  let n = !1;
  const i = (l) => {
    if (n) return;
    n = !0, o.removeEventListener("blur", c);
    const p = o.value.trim().slice(0, 80);
    l && p && p !== t.name ? (e.checkpoint("Rename object"), t.name = p, e.serialize(), e.refreshObjects(), e.refreshKeys?.(), e.setStatus(s("Object renamed: {name}").replace("{name}", t.name))) : a.textContent = r;
  }, c = () => i(!0);
  o.addEventListener("blur", c), o.addEventListener("keydown", (l) => {
    l.stopPropagation(), l.key === "Enter" ? (l.preventDefault(), i(!0)) : l.key === "Escape" && (l.preventDefault(), i(!1));
  }), o.addEventListener("pointerdown", (l) => l.stopPropagation()), o.addEventListener("dblclick", (l) => l.stopPropagation());
}
function pi(e) {
  const t = e.root.querySelector('[data-role="objects"]');
  if (!t) return;
  t.innerHTML = "", t.onkeydown = (d) => {
    if (d.key === "ArrowUp" || d.key === "ArrowDown") {
      const h = [...t.querySelectorAll('.scene-item[role="button"]')], u = h.indexOf(document.activeElement);
      if (u >= 0) {
        d.preventDefault();
        const b = d.key === "ArrowDown" ? Math.min(h.length - 1, u + 1) : Math.max(0, u - 1);
        b !== u && (h[b].focus(), h[b].click(), h[b].scrollIntoView?.({ block: "nearest", behavior: "smooth" }));
      }
    }
  };
  const a = e.outlinerCategoryFilter || "all", o = e.root.querySelectorAll('[data-role="outliner-filter-chips"] .oc-chip');
  for (const d of o)
    d.classList.toggle("active", (d.dataset.filter || "all") === a);
  const r = (d, h, u, b, v = "") => {
    const y = document.createElement("button");
    return y.type = "button", y.className = "scene-action-btn", u && (y.style.cssText = v || "color:#f59e0b;border-color:#78350f;background:rgba(245,158,11,0.15)"), y.title = s(h), y.innerHTML = `<i class="pi ${d}" style="font-size:10px"></i>`, y.addEventListener("click", (x) => {
      x.stopPropagation(), b(x);
    }), y;
  }, n = (e.outlinerFilter || "").trim().toLowerCase(), i = (d) => !n || String(d || "").toLowerCase().includes(n), c = (d, h, u) => {
    const b = !!(e.outlinerCollapsedSections?.has(u) && !n), v = document.createElement("div");
    return v.className = "scene-section-header", v.dataset.section = u, v.innerHTML = `
      <i class="pi ${b ? "pi-chevron-right" : "pi-chevron-down"}" style="font-size:9px;color:var(--oc-text-dim)"></i>
      <span class="scene-section-title">${d}</span>
      <span class="scene-section-count">(${h})</span>
    `, v.addEventListener("click", () => {
      e.outlinerCollapsedSections ||= /* @__PURE__ */ new Set(), e.outlinerCollapsedSections.has(u) ? e.outlinerCollapsedSections.delete(u) : e.outlinerCollapsedSections.add(u), pi(e);
    }), { header: v, isCollapsed: b };
  }, l = (d) => ["sun_light", "point_light", "spot_light"].includes(d), p = a === "all" || a === "cameras" || a === "hidden" && e.state.cameras.some((d) => d.muted), m = a === "all" || a === "objects" || a === "lights" || a === "hidden" && e.state.objects.some((d) => d.enabled === !1);
  if (p) {
    const d = e.state.cameras.filter((b) => !(!i(b.name) || a === "hidden" && !b.muted)), { header: h, isCollapsed: u } = c(s("Cameras"), d.length, "cameras");
    if (t.appendChild(h), !u)
      for (const b of d) {
        const v = document.createElement("div");
        v.role = "button", v.tabIndex = 0, v.dataset.cameraId = b.id;
        const y = b.id === e.state.active_camera_id, x = b.id === e.state.playblast_camera_id, k = e.selectedEntity === "camera" && y;
        v.setAttribute("aria-selected", String(k)), v.className = `scene-item${k ? " selected" : ""}${y && !k ? " active-view" : ""}`;
        const g = document.createElement("i");
        g.className = "pi pi-video", g.style.cssText = "color:#60a5fa";
        const _ = document.createElement("span");
        if (_.className = "scene-item-label", k || y) {
          const F = document.createElement("span");
          F.style.cssText = `color:${k ? "#f59e0b" : "#58cc6b"};font-weight:700`, F.textContent = k ? "● " : "○ ", _.appendChild(F);
        }
        if (_.appendChild(document.createTextNode(b.name)), x) {
          const F = document.createElement("span");
          F.style.cssText = "color:#f2d06b;font-size:10px", F.title = "Playblast Output", F.textContent = " ★", _.appendChild(F);
        }
        if (b.muted) {
          const F = document.createElement("span");
          F.style.opacity = ".6", F.textContent = " (muted)", _.appendChild(F);
        }
        const A = document.createElement("div");
        A.className = "scene-item-actions", A.appendChild(r("pi-star", "Solo track", b.solo, () => {
          e.checkpoint("Solo track"), b.solo = !b.solo, e.serialize(), e.refreshObjects(), e.renderCameraView();
        }, "color:#fbbf24;border-color:#78350f;background:rgba(245,158,11,0.2)")), A.appendChild(r("pi-volume-off", "Mute track", b.muted, () => {
          e.checkpoint("Mute track"), b.muted = !b.muted, e.serialize(), e.refreshObjects(), e.renderCameraView();
        }, "color:#f87171;border-color:#7f1d1d;background:rgba(239,68,68,0.15)")), A.appendChild(r("pi-lock", "Lock track", b.locked, () => {
          e.checkpoint("Lock track"), b.locked = !b.locked, e.serialize(), e.refreshObjects(), e.renderCameraView();
        })), (b.keyframes || []).length >= 1 && A.appendChild(r(
          "pi-arrows-alt",
          "Select whole path (move / scale / rotate)",
          e.selectedEntity === "camera_path" && y,
          () => {
            e.activateCamera(b.id), e.selectCameraPath();
          }
        )), A.appendChild(r("pi-ellipsis-v", "Camera actions", !1, (F) => e.openCameraContext(F, b.id, !1))), v.append(g, _, A), v.title = k ? s("Currently selected for editing") : x ? s("Active playblast camera") : s("Click to select & activate this camera");
        const K = () => {
          e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(b.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Camera: ${b.name}`));
        };
        v.addEventListener("contextmenu", (F) => {
          F.preventDefault(), F.stopPropagation(), e.openCameraContext(F, b.id, !1);
        }), v.addEventListener("keydown", (F) => {
          (F.key === "Enter" || F.key === " ") && (F.preventDefault(), K());
        }), t.appendChild(v);
      }
  }
  if (m) {
    const d = new Map(e.state.objects.map((g) => [g.id, g])), h = /* @__PURE__ */ new Map(), u = [];
    for (const g of e.state.objects)
      g.parent_id && d.has(g.parent_id) ? (h.has(g.parent_id) || h.set(g.parent_id, []), h.get(g.parent_id).push(g)) : u.push(g);
    const b = [], v = (g, _) => {
      b.push({ object: g, level: _ });
      const A = h.get(g.id) || [];
      for (const K of A) v(K, _ + 1);
    };
    for (const g of u) v(g, 0);
    const y = b.filter(({ object: g }) => {
      const _ = [g.name, g.type, ...g.tags || [], g.asset_kind, g.asset_id].filter(Boolean).join(" ");
      return !(!i(_) || a === "lights" && !l(g.type) || a === "objects" && l(g.type) || a === "hidden" && g.enabled !== !1);
    }), { header: x, isCollapsed: k } = c(a === "lights" ? s("Lights") : s("Objects"), y.length, "objects");
    if (t.appendChild(x), !k)
      for (const { object: g, level: _ } of y) {
        const A = document.createElement("div");
        A.role = "button", A.tabIndex = 0, A.dataset.objectId = g.id;
        const K = e.selectedEntity === "object" && (g.id === e.selectedObjectId || e.selectedObjectIds?.has?.(g.id)), F = e.selectedEntity === "object" && g.id === e.selectedObjectId;
        A.setAttribute("aria-selected", String(K)), A.className = `scene-item${K ? " selected" : ""}${F ? " primary" : ""}${_ > 0 && !n ? " scene-item-child" : ""}`, _ > 0 && !n && (A.style.paddingLeft = `${_ * 16 + 6}px`);
        const J = g.type === "card" ? { icon: "pi-image", color: "#38bdf8" } : g.type === "model" || g.type === "glb" ? { icon: "pi-box", color: "#c084fc" } : g.type === "ground" ? { icon: "pi-minus", color: "#fbbf24" } : g.type === "cube" ? { icon: "pi-stop", color: "#fbbf24" } : g.type === "sphere" ? { icon: "pi-circle", color: "#fbbf24" } : g.type === "cylinder" ? { icon: "pi-database", color: "#fbbf24" } : g.type === "torus" ? { icon: "pi-circle", color: "#fbbf24" } : g.type === "pyramid" ? { icon: "pi-play", color: "#fbbf24" } : g.type === "sun_light" ? { icon: "pi-sun", color: "#f59e0b" } : g.type === "point_light" ? { icon: "pi-bolt", color: "#fbbf24" } : g.type === "spot_light" ? { icon: "pi-compass", color: "#38bdf8" } : g.type === "human" ? { icon: "pi-user", color: "#34d399" } : { icon: "pi-plus", color: "#94a3b8" }, H = g.enabled !== !1, M = !!g.load_error, P = document.createElement("i");
        P.className = `pi ${M ? "pi-exclamation-triangle" : J.icon}`, P.style.cssText = M ? "color:#f87171" : H ? `color:${J.color}` : "opacity:.4";
        const j = document.createElement("span");
        j.className = "scene-item-label";
        const R = document.createElement("span");
        R.style.cssText = M ? "color:#fca5a5" : H ? "" : "opacity:.5;text-decoration:line-through", R.textContent = g.name || g.type, R.title = s("Double-click to rename"), R.addEventListener("dblclick", (E) => {
          E.preventDefault(), E.stopPropagation(), gb(e, g, R);
        }), j.appendChild(R);
        const q = Array.isArray(g.tags) ? g.tags : [];
        if (q.length) {
          const E = document.createElement("span");
          E.className = "scene-item-tags";
          for (const Y of q.slice(0, 2)) {
            const D = document.createElement("span");
            D.className = "scene-item-tag", D.textContent = Y, E.appendChild(D);
          }
          if (q.length > 2) {
            const Y = document.createElement("span");
            Y.className = "scene-item-tag scene-item-tag-more", Y.textContent = `+${q.length - 2}`, E.appendChild(Y);
          }
          j.appendChild(E);
        }
        if (M) {
          const E = document.createElement("span");
          E.style.cssText = "color:#ef4444;font-size:9px;font-weight:700", E.textContent = " [Format!]", j.appendChild(E);
        }
        const G = document.createElement("div");
        G.className = "scene-item-actions", G.appendChild(r(H ? "pi-eye" : "pi-eye-slash", H ? "Hide object (Alt+Click to Isolate)" : "Show object (Alt+Click to Isolate)", !H, (E) => {
          if (E?.altKey) {
            if (e.checkpoint("Isolate object"), e._isolatedObjectId === g.id) {
              e._isolatedObjectId = null;
              const D = e._isolationSnapshot;
              for (const X of e.state.objects)
                X.enabled = D && Object.prototype.hasOwnProperty.call(D, X.id) ? D[X.id] : !0;
              e._isolationSnapshot = null, e.setStatus?.(s("Isolation cleared"));
            } else {
              e._isolationSnapshot || (e._isolationSnapshot = Object.fromEntries(e.state.objects.map((D) => [D.id, D.enabled !== !1]))), e._isolatedObjectId = g.id;
              for (const D of e.state.objects) D.enabled = D.id === g.id;
              e.setStatus?.(s("Isolated: {name}").replace("{name}", g.name || g.type));
            }
            e.serialize(), e.refreshObjects(), e.requestRender?.();
          } else
            e.toggleObject(g.id);
        }, "color:#ef4444;opacity:.7")), G.appendChild(r(g.locked ? "pi-lock" : "pi-lock-open", "Lock object", g.locked, () => Kr(e, g))), G.appendChild(r("pi-copy", "Duplicate object", !1, () => e.duplicateObject?.(g.id))), g.id !== "subject" && G.appendChild(r("pi-trash", "Delete object", !1, () => e.deleteObject?.(g.id))), G.appendChild(r("pi-ellipsis-v", "Object actions", !1, (E) => e.openObjectContext(E, g.id))), A.append(P, j, G), A.title = s("Click to select · Double-click to toggle visibility · Right-click for actions");
        const L = (E = {}) => {
          if (E.altKey && g.id !== "subject") return void e.deleteObject(g.id);
          if (e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectIds ||= /* @__PURE__ */ new Set(), E.ctrlKey || E.metaKey)
            e.selectedObjectIds.has(g.id) ? e.selectedObjectIds.delete(g.id) : e.selectedObjectIds.add(g.id), e.outlinerAnchorId = g.id;
          else if (E.shiftKey && e.outlinerAnchorId && e.state.objects.some((D) => D.id === e.outlinerAnchorId)) {
            const D = e.state.objects.map((le) => le.id), X = D.indexOf(e.outlinerAnchorId), te = D.indexOf(g.id);
            e.selectedObjectIds = new Set(D.slice(Math.min(X, te), Math.max(X, te) + 1));
          } else
            e.selectedObjectIds = /* @__PURE__ */ new Set([g.id]), e.outlinerAnchorId = g.id;
          e.selectedObjectId = e.selectedObjectIds.has(g.id) ? g.id : [...e.selectedObjectIds].at(-1) || null, e.selectedEntity = e.selectedObjectIds.size ? "object" : "camera", e.selectedKeyFrame = e.selectedObjectId ? g.keyframes?.find((D) => D.frame === e.frame)?.frame ?? null : null, e.editingKeyFrame = null;
          for (const D of t.querySelectorAll(".scene-item")) {
            const X = !!(D.dataset.objectId && e.selectedObjectIds.has(D.dataset.objectId)), te = !!(D.dataset.objectId && D.dataset.objectId === e.selectedObjectId);
            D.classList.toggle("selected", X), D.classList.toggle("primary", te), D.dataset.objectId && D.setAttribute("aria-selected", String(X));
          }
          const Y = e.root.querySelector('[data-role="outliner-batch-bar"]');
          if (Y) {
            const D = e.selectedObjectIds?.size || 0;
            Y.hidden = D < 2;
            const X = Y.querySelector('[data-role="batch-count"]');
            X && (X.textContent = `${D} ${s("selected")}`);
          }
          e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Selected: ${g.name || g.type}`));
        };
        A.addEventListener("dblclick", () => e.toggleObject(g.id)), A.addEventListener("contextmenu", (E) => {
          E.preventDefault(), E.stopPropagation(), e.openObjectContext(E, g.id);
        }), A.addEventListener("keydown", (E) => {
          (E.key === "Enter" || E.key === " ") && (E.preventDefault(), L(E));
        }), t.appendChild(A);
      }
  }
  const f = e.root.querySelector('[data-role="outliner-batch-bar"]');
  if (f) {
    const d = e.selectedObjectIds?.size || 0;
    f.hidden = d < 2;
    const h = f.querySelector('[data-role="batch-count"]');
    h && (h.textContent = `${d} ${s("selected")}`);
  }
  e.refreshInspector();
}
function nr(e, t, a, o) {
  e && document.activeElement !== e && (e.__omnicamOptionSig !== t && (e.__omnicamOptionSig = t, e.replaceChildren(...a())), e.value = o);
}
function Wt(e, t) {
  const a = document.createElement("option");
  return a.value = e, a.textContent = t, a;
}
function yb(e, t) {
  e.checkpoint("Create object");
  const a = `${t}_${Date.now().toString(36)}`, o = t === "ground", r = t === "human", n = t === "card", i = t === "cylinder", c = t === "torus", l = t === "pyramid", p = t === "sun_light", m = t === "point_light", f = t === "spot_light";
  let d;
  r ? d = s("Human Proxy") : n ? d = s("Card") : i ? d = s("Cylinder") : c ? d = s("Torus") : l ? d = s("Pyramide") : p ? d = s("Sun light") : m ? d = s("Point light") : f ? d = s("Spot light") : d = t[0].toUpperCase() + t.slice(1);
  let h;
  o ? h = [12, 0.1, 12] : r ? h = [0.7, 1.8, 0.4] : n ? h = [2, 3] : h = [1.5, 1.5, 1.5];
  let u = [0, 0, 0], b = [0, 0, 0], v = "#8c929b", y, x, k, g;
  p ? (u = [5, 8.5, 4], b = [-55, 35, 0], v = "#fff6ec", y = 2.2, x = !0) : m ? (u = [0, 3, 0], v = "#ffffff", y = 2, x = !1) : f && (u = [0, 4, 0], b = [-60, 0, 0], v = "#ffffff", y = 3, k = 45, g = 0.25, x = !0);
  const _ = {
    id: a,
    type: t,
    name: d,
    position: u,
    rotation: b,
    size: h,
    color: v,
    material_mode: o ? "checker" : "textured",
    ...y !== void 0 ? { intensity: y } : {},
    ...x !== void 0 ? { cast_shadow: x } : {},
    ...k !== void 0 ? { cone_angle: k } : {},
    ...g !== void 0 ? { penumbra: g } : {},
    keyframes: [],
    enabled: !0
  };
  e.state.objects.push(_), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedObjectIds = /* @__PURE__ */ new Set([a]), e.selectedKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render();
}
async function vb(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  if (!a) return;
  const o = (await Xt(e, s("Rename object"), s("Object name"), a.name || a.type))?.trim();
  e.disposed || !e.state.objects.includes(a) || !o || o === a.name || (e.checkpoint("Rename object"), a.name = o.slice(0, 80), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(s(`Object renamed: ${a.name}`)));
}
function fi(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  if (!a) return;
  e.checkpoint("Duplicate object");
  const o = JSON.parse(JSON.stringify(a));
  o.id = `${a.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, o.name = `${a.name || a.type} Copy`, o.position = fe(o.position || [0, 0, 0], [0.35, 0, 0.35]), (o.type === "model" || o.type === "glb") && e.modelUrlsById.has(a.id) ? e.modelUrlsById.set(o.id, e.modelUrlsById.get(a.id)) : o.type === "card" && e.cardMediaById.has(a.id) && rt(e, o.id, e.cardMediaById.get(a.id), !1, o.asset || e.cardMediaAssetById?.get?.(a.id) || ""), e.state.objects.push(o), e.selectedEntity = "object", e.selectedObjectId = o.id, e.selectedObjectIds = /* @__PURE__ */ new Set([o.id]), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s(`${o.name} added`));
}
function xb(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint(a.enabled === !1 ? "Show object" : "Hide object"), a.enabled = a.enabled === !1, e.serialize(), e.refreshObjects(), e.render(), e.setStatus(s(`${a.name || a.type} ${a.enabled ? "shown" : "hidden"}`)));
}
async function hi(e, t) {
  if (t === "subject") return e.setStatus(s("The subject card cannot be deleted"));
  const a = e.state.objects.find((o) => o.id === t);
  if (a && await Jt(e, s("Delete object"), s(`Delete ${a.name || a.type} and its ${(a.keyframes || []).length} keyframe(s)?`)) && !(e.disposed || !e.state.objects.includes(a))) {
    e.checkpoint("Delete object");
    for (const o of e.state.objects) o.parent_id === t && (o.parent_id = null);
    e.state.objects = e.state.objects.filter((o) => o.id !== t), e.selectedObjectIds?.delete(t), e.removeObjectResources(t), e.selectedObjectId === t && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = e.state.keyframes.find((o) => o.frame === e.frame)?.frame ?? null), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s(`${a.name || a.type} deleted`));
  }
}
async function wb(e) {
  const t = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((r) => r && r !== "subject" && e.state.objects.some((n) => n.id === r));
  if (!t.length) {
    e.selectedObjectId === "subject" && e.setStatus(s("The subject card cannot be deleted"));
    return;
  }
  if (t.length === 1) return hi(e, t[0]);
  const a = s("Delete {count} objects and their keyframes?").replace("{count}", String(t.length));
  if (!await Jt(e, s("Delete objects"), a) || e.disposed) return;
  e.checkpoint("Delete objects");
  const o = new Set(t);
  for (const r of e.state.objects) r.parent_id && o.has(r.parent_id) && (r.parent_id = null);
  e.state.objects = e.state.objects.filter((r) => !o.has(r.id));
  for (const r of t) e.removeObjectResources(r);
  e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.selectedKeyFrame = e.state.keyframes.find((r) => r.frame === e.frame)?.frame ?? null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s("{count} objects deleted").replace("{count}", String(t.length)));
}
function kb(e) {
  e.checkpoint("Create media card");
  const t = `card_${Date.now().toString(36)}`;
  e.state.objects.push({
    id: t,
    type: "card",
    name: `Media Card ${e.state.objects.filter((a) => a.type === "card").length + 1}`,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    size: [2, 3],
    material_mode: "textured",
    keyframes: [],
    enabled: !0,
    asset: ""
  }), e.selectedEntity = "object", e.selectedObjectId = t, e.selectedObjectIds = /* @__PURE__ */ new Set([t]), e.selectedKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.root.querySelector('[data-role="file"]').click();
}
function ea(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function Wn(e, t) {
  const a = e('[data-role="curve-group"]');
  if (a)
    for (const o of a.options) {
      const r = t[o.value];
      r && (o.textContent = r);
    }
}
function Sb(e) {
  const t = ea(e), a = e.root.querySelector('[data-role="object-panel"]');
  a && (a.hidden = !t);
  const o = (j) => e.root.querySelector(j), r = e.activeCameraTrack(), n = o('[data-role="camera-target-object"]');
  if (n) {
    const j = r.target_object_id || e.state.target_object_id || "", R = `T${on()}${e.state.objects.map((q) => `${q.id}\0${q.name || q.type}`).join("|")}`;
    nr(n, R, () => [
      Wt("", s("Manual Target (No Tracking)")),
      ...e.state.objects.map((q) => Wt(q.id, `${s("Track:")} ${q.name || q.type}`))
    ], j);
  }
  bb(e);
  const i = [...e.camera.position, ...e.camera.target, e.camera.fov, e.camera.roll || 0, e.camera.near, e.camera.far, ...Pr(e.camera)];
  ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far", "camera-rx", "camera-ry", "camera-rz"].forEach((j, R) => {
    for (const q of e.root.querySelectorAll(`[data-role="${j}"]`))
      document.activeElement !== q && (q.value = String(Math.round(i[R] * 1e4) / 1e4));
  });
  for (const j of e.root.querySelectorAll('[data-role="camera-type"]'))
    document.activeElement !== j && (j.value = e.camera.camera_type || "perspective");
  for (const j of e.root.querySelectorAll('[data-role="speed"]'))
    document.activeElement !== j && (j.value = String(e.cameraSpeed || 1));
  for (const j of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    document.activeElement !== j && (j.value = e.state.active_camera_id);
  for (const j of e.root.querySelectorAll('[data-role="camera-color"]'))
    document.activeElement !== j && (j.value = r?.color || "#4aa3ef");
  if (!t) {
    const j = o('[data-role="object-recon-badge"]');
    j && (j.hidden = !0);
    const R = o('[data-role="selected-name"]');
    R && (R.textContent = `${r.name} · F${e.frame}`), Wn(o, {
      camera: s("Camera (Position, Focal, Roll)"),
      position: s("Position XYZ"),
      target: s("Target XYZ"),
      lens: s("FOV / Roll / Zoom")
    }), e.rigMapper?.sync(), e.poseEditor?.sync(), e.motionEditor?.sync();
    return;
  }
  const c = o('[data-role="object-recon-badge"]');
  if (c) {
    const j = Sh(t);
    if (j) {
      c.hidden = !1;
      const R = j.semantic ? `${j.semantic} · ` : "";
      c.textContent = `${R}${j.label} (${Math.round(j.confidence * 100)}%)`, c.title = j.title, c.className = `oc-recon-badge oc-badge-${j.band}`;
    } else
      c.hidden = !0;
  }
  const l = o('[data-role="object-lock-toggle"]');
  if (l) {
    l.classList.toggle("locked", !!t.locked), l.title = t.locked ? s("Unlock object") : s("Lock object");
    const j = l.querySelector("i");
    j && (j.className = `pi ${t.locked ? "pi-lock" : "pi-lock-open"}`);
  }
  const p = t.position || [0, 0, 0], m = o('[data-role="selected-name"]');
  m && (m.textContent = t.name || t.type), Wn(o, {
    camera: s("Position XYZ"),
    position: s("Position XYZ"),
    target: s("Rotation XYZ"),
    lens: s("Scale XYZ")
  });
  const f = t.rotation || [0, 0, 0], d = t.size || [1, 1, 1], h = {
    "object-x": p[0],
    "object-y": p[1],
    "object-z": p[2],
    "object-rx": f[0],
    "object-ry": f[1],
    "object-rz": f[2],
    "object-sx": d[0] ?? 1,
    "object-sy": d[1] ?? 1,
    "object-sz": d[2] ?? 1
  };
  for (const [j, R] of Object.entries(h))
    for (const q of e.root.querySelectorAll(`[data-role="${j}"]`))
      document.activeElement !== q && (q.value = String(Math.round(R * 1e4) / 1e4));
  for (const j of e.root.querySelectorAll('[data-role="object-material"]'))
    document.activeElement !== j && (j.value = t.material_mode || "textured");
  for (const j of e.root.querySelectorAll('[data-role="object-color"]'))
    document.activeElement !== j && (j.value = t.color || "#8c929b");
  for (const j of e.root.querySelectorAll('[data-role="object-light-color"]'))
    document.activeElement !== j && (j.value = t.color || "#ffffff");
  for (const j of e.root.querySelectorAll("[data-transform-mode]")) j.classList.toggle("active", j.dataset.transformMode === (e.state.gizmo_mode || "translate"));
  const u = o('[data-role="animation-row"]'), b = o('[data-role="animation-select"]'), v = o('[data-role="object-parent"]');
  if (v) {
    const j = t.id, R = /* @__PURE__ */ new Set([j]);
    let q = !0;
    for (; q; ) {
      q = !1;
      for (const E of e.state.objects)
        !R.has(E.id) && E.parent_id && R.has(E.parent_id) && (R.add(E.id), q = !0);
    }
    const G = e.state.objects.filter((E) => !R.has(E.id)), L = `P${on()}${j}${G.map((E) => `${E.id} ${E.name || E.type}`).join("|")}`;
    nr(v, L, () => [
      Wt("", s("No parent")),
      ...G.map((E) => Wt(E.id, E.name || E.type))
    ], t.parent_id || "");
  }
  const y = ["sun_light", "point_light", "spot_light"].includes(t.type), x = t.type === "spot_light", k = o('[data-role="light-props-row"]');
  k && (k.hidden = !y);
  const g = o('[data-role="spot-props-row"]');
  g && (g.hidden = !x);
  const _ = o('[data-role="material-row"]');
  _ && (_.hidden = y);
  const A = o('[data-role="scale-row"]');
  A && (A.hidden = y);
  const K = o('[data-role="rotation-row"]');
  if (K && (K.hidden = t.type === "point_light"), y) {
    const j = o('[data-role="object-intensity"]');
    j && document.activeElement !== j && (j.value = String(t.intensity ?? (t.type === "sun_light" ? 2.2 : t.type === "spot_light" ? 3 : 2)));
    const R = o('[data-role="object-cast-shadow"]');
    if (R && (R.checked = t.cast_shadow !== !1), x) {
      const q = o('[data-role="object-cone-angle"]');
      q && document.activeElement !== q && (q.value = String(t.cone_angle ?? 45));
      const G = o('[data-role="object-penumbra"]');
      G && document.activeElement !== G && (G.value = String(t.penumbra ?? 0.25));
    }
  }
  const F = e.modelInfoById.get(t.id);
  if (u && (u.hidden = !F?.animations), b) {
    const j = F?.animationNames || [];
    nr(b, `A${j.join("|")}`, () => j.map((R, q) => Wt(String(q), R)), String(t.animation_index || 0));
  }
  const J = o('[data-role="object-tags"]');
  J && document.activeElement !== J && (J.value = (t.tags || []).join(", "));
  const H = o('[data-role="object-annotation"]');
  H && document.activeElement !== H && (H.value = t.annotation?.text || "");
  const M = o('[data-role="object-annotation-color"]');
  M && document.activeElement !== M && (M.value = t.annotation?.color || "#8d7ee8");
  const P = o('[data-role="object-annotation-anchor"]');
  P && document.activeElement !== P && (P.value = t.annotation?.anchor || "top"), e.rigMapper?.sync(), e.poseEditor?.sync(), e.motionEditor?.sync();
}
function jb(e) {
  const t = ea(e);
  if (!t) return;
  if (t.locked) {
    e.setStatus?.(s("Object is locked"));
    return;
  }
  const a = (c, l) => {
    const p = e.root.querySelector(`[data-role="${c}"]`);
    if (!p || p.value === "") return l;
    const m = Number(p.value);
    return Number.isFinite(m) ? m : l;
  }, o = t.position || [0, 0, 0], r = t.rotation || [0, 0, 0], n = t.size || [1, 1, 1], i = globalThis.performance?.now?.() ?? Date.now();
  if ((e.lastObjectNumericEditId !== t.id || !Number.isFinite(e.lastObjectNumericEditAt) || i - e.lastObjectNumericEditAt > 300) && e.checkpoint?.("Edit object"), e.lastObjectNumericEditId = t.id, e.lastObjectNumericEditAt = i, t.position = [a("object-x", o[0]), a("object-y", o[1]), a("object-z", o[2])], t.rotation = [a("object-rx", r[0]), a("object-ry", r[1]), a("object-rz", r[2])], t.size = [Math.max(0.01, a("object-sx", n[0])), Math.max(0.01, a("object-sy", n[1])), Math.max(0.01, a("object-sz", n[2]))], ["sun_light", "point_light", "spot_light"].includes(t.type)) {
    const c = e.root.querySelector('[data-role="object-intensity"]');
    c && c.value !== "" && (t.intensity = Math.max(0, Number(c.value) || 0));
    const l = e.root.querySelector('[data-role="object-cast-shadow"]');
    if (l && (t.cast_shadow = l.checked), t.type === "spot_light") {
      const p = e.root.querySelector('[data-role="object-cone-angle"]');
      p && p.value !== "" && (t.cone_angle = ee(Number(p.value) || 45, 1, 90));
      const m = e.root.querySelector('[data-role="object-penumbra"]');
      m && m.value !== "" && (t.penumbra = ee(Number(m.value) || 0.25, 0, 1));
    }
  }
  e.commitObjectEdit(t), e.refreshObjects(), e.render();
}
function ui(e, t) {
  if (!t) return null;
  if (t.locked)
    return e.setStatus(s(`${t.name || t.type} is locked`)), null;
  t.keyframes ||= [];
  let a = di(
    t.keyframes,
    e.frame,
    e.state.auto_key ? null : e.selectedKeyFrame,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, transform: Ye(t), interpolation: e.root.querySelector('[data-role="interp"]')?.value || "ease" }, t.keyframes.push(a), t.keyframes.sort((o, r) => o.frame - r.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame, e.updateKeyVisualState()) : a && (e.selectedKeyFrame = a.frame, e.updateKeyVisualState()), a;
}
function _b(e, t) {
  const a = ui(e, t);
  a && (a.transform = Ye(t)), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor();
}
function bi(e) {
  const t = Pr(e.camera);
  ["camera-rx", "camera-ry", "camera-rz"].forEach((a, o) => {
    for (const r of e.root.querySelectorAll(`[data-role="${a}"]`))
      document.activeElement !== r && (r.value = String(Math.round(t[o] * 1e4) / 1e4));
  });
}
function Cb(e) {
  ["camera-tx", "camera-ty", "camera-tz"].forEach((t, a) => {
    for (const o of e.root.querySelectorAll(`[data-role="${t}"]`))
      document.activeElement !== o && (o.value = String(Math.round(e.camera.target[a] * 1e4) / 1e4));
  });
}
function Eb(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastCameraHudEditAt) || t - e.lastCameraHudEditAt > 300) && e.checkpoint("Edit camera"), e.lastCameraHudEditAt = t;
  const a = (n, i) => {
    const c = e.root.querySelector(`[data-role="${n}"]`);
    if (!c || c.value === "") return i;
    const l = Number(c.value);
    return Number.isFinite(l) ? l : i;
  }, o = Pr(e.camera), r = [
    ee(a("camera-rx", o[0]), -90, 90),
    a("camera-ry", o[1]),
    ee(a("camera-rz", o[2]), -180, 180)
  ];
  e.beginCameraEdit(), Xc(e.camera, r), e.commitCameraEdit(), e.finishCameraEdit(), bi(e), Cb(e), e.render();
}
function Ab(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastCameraHudEditAt) || t - e.lastCameraHudEditAt > 300) && e.checkpoint("Edit camera"), e.lastCameraHudEditAt = t;
  const a = (o, r) => {
    const n = e.root.querySelector(`[data-role="${o}"]`);
    if (!n || n.value === "") return r;
    const i = Number(n.value);
    return Number.isFinite(i) ? i : r;
  };
  e.camera.position = [a("camera-px", e.camera.position[0]), a("camera-py", e.camera.position[1]), a("camera-pz", e.camera.position[2])], e.camera.target = [a("camera-tx", e.camera.target[0]), a("camera-ty", e.camera.target[1]), a("camera-tz", e.camera.target[2])], e.camera.fov = ee(a("camera-fov", e.camera.fov), 5, 150), e.camera.roll = ee(a("camera-roll", e.camera.roll || 0), -180, 180), e.camera.near = Math.max(1e-4, a("camera-near", e.camera.near)), e.camera.far = Math.max(e.camera.near + 1e-4, a("camera-far", e.camera.far)), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), bi(e), e.render();
}
function Tb(e, t) {
  const a = ea(e);
  if (!a) return;
  e.checkpoint("Set parent"), a.parent_id = t || null, e.serialize(), e.refreshObjects(), e.render();
  const o = e.state.objects.find((r) => r.id === t);
  e.setStatus(o ? s(`${a.name || a.type} parented to ${o.name || o.type}`) : s(`${a.name || a.type} unparented`));
}
function $b(e, t) {
  const a = ea(e);
  a && (e.checkpoint("Select animation"), a.animation_index = Math.max(0, t || 0), e.serialize(), e.webgl?.selectAnimation(a.id, t), e.setStatus(s(`Animation: ${e.modelInfoById.get(a.id)?.animationNames?.[t] || t + 1}`)));
}
function Mb(e, t) {
  e.objectUrls.revoke(t), Qt(e, t), e.modelUrlsById.delete(t), e.modelInfoById.delete(t), e.webgl?.removeModel(t);
}
function Ib(e) {
  const t = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((o) => o && e.state.objects.some((r) => r.id === o));
  if (!t.length) return [];
  if (t.length === 1)
    return fi(e, t[0]), e.selectedObjectId ? [e.selectedObjectId] : [];
  e.checkpoint("Duplicate objects");
  const a = [];
  return t.forEach((o, r) => {
    const n = e.state.objects.find((l) => l.id === o);
    if (!n) return;
    const i = JSON.parse(JSON.stringify(n));
    i.id = `${n.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, i.name = `${n.name || n.type} Copy`;
    const c = 0.35 + r * 0.15;
    i.position = fe(i.position || [0, 0, 0], [c, 0, c]), (i.type === "model" || i.type === "glb") && e.modelUrlsById.has(n.id) ? e.modelUrlsById.set(i.id, e.modelUrlsById.get(n.id)) : i.type === "card" && e.cardMediaById.has(n.id) && rt(e, i.id, e.cardMediaById.get(n.id), !1, i.asset || e.cardMediaAssetById?.get?.(n.id) || ""), e.state.objects.push(i), a.push(i.id);
  }), a.length && (e.selectedEntity = "object", e.selectedObjectIds = new Set(a), e.selectedObjectId = a[a.length - 1], e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Duplicated {count} objects").replace("{count}", String(a.length)))), a;
}
function Ob(e, t = null) {
  const a = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((n) => n && e.state.objects.some((i) => i.id === n));
  if (!a.length) return;
  const o = e.state.objects.find((n) => n.id === (e.selectedObjectId || a[0])), r = typeof t == "boolean" ? t : !(o?.enabled ?? !0);
  e.checkpoint("Toggle objects visibility");
  for (const n of a) {
    const i = e.state.objects.find((c) => c.id === n);
    i && (i.enabled = r);
  }
  e.serialize(), e.refreshObjects(), e.render(), e.setStatus(
    r ? s("Show {count} objects").replace("{count}", String(a.length)) : s("Hide {count} objects").replace("{count}", String(a.length))
  );
}
function Pb(e, t = null) {
  const a = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((n) => n && e.state.objects.some((i) => i.id === n));
  if (!a.length) return;
  const o = e.state.objects.find((n) => n.id === (e.selectedObjectId || a[0])), r = typeof t == "boolean" ? t : !(o?.locked ?? !1);
  e.checkpoint("Lock objects");
  for (const n of a) {
    const i = e.state.objects.find((c) => c.id === n);
    i && (i.locked = r);
  }
  e.serialize(), e.refreshObjects(), e.refreshInspector(), e.render(), e.setStatus(
    r ? s("Locked {count} objects").replace("{count}", String(a.length)) : s("Unlocked {count} objects").replace("{count}", String(a.length))
  );
}
function Lb(e) {
  const t = (e.state.objects || []).filter((a) => a.id);
  t.length && (e.finishCameraEdit?.(), e.selectedEntity = "object", e.selectedObjectIds = new Set(t.map((a) => a.id)), e.selectedObjectId = t[t.length - 1].id, e.outlinerAnchorId = e.selectedObjectId, e.selectedKeyFrame = null, e.editingKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Selected all {count} objects").replace("{count}", String(t.length))));
}
function gi(e) {
  e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.outlinerAnchorId = null, e.selectedKeyFrame = e.state.keyframes.find((t) => t.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Selection cleared"));
}
function Nb(e) {
  const t = e.selectedObjectIds || new Set(e.selectedObjectId ? [e.selectedObjectId] : []), a = (e.state.objects || []).map((o) => o.id).filter((o) => o && !t.has(o));
  if (!a.length) {
    gi(e);
    return;
  }
  e.finishCameraEdit?.(), e.selectedEntity = "object", e.selectedObjectIds = new Set(a), e.selectedObjectId = a[a.length - 1], e.outlinerAnchorId = e.selectedObjectId, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Inverted selection ({count} objects)").replace("{count}", String(a.length)));
}
function zb(e, t) {
  return t(xs(e), e.frame);
}
function Oe(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function Ee(e) {
  return Oe(e)?.keyframes || e.state.keyframes;
}
function Fb(e, t) {
  for (const a of e.state.objects) {
    if (!a.keyframes?.length) continue;
    const o = t(a, e.frame);
    a.position = o.position, a.rotation = o.rotation, a.size = o.size;
  }
}
function Rb(e) {
  e.checkpoint("Set keyframe");
  const t = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease", a = Oe(e), o = Ee(e), r = a ? { frame: e.frame, transform: Ye(a), interpolation: t } : { frame: e.frame, camera: ce(e.camera), interpolation: t }, n = o.findIndex((i) => i.frame === e.frame);
  n >= 0 ? o[n] = r : o.push(r), o.sort((i, c) => i.frame - c.frame), e.selectedKeyFrame = e.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([e.frame]), e.editingKeyFrame = null, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor(), e.setStatus(s(`${a?.name || "Camera"} ${n >= 0 ? "key updated" : "key inserted"} @ ${e.frame}`));
}
function Db(e, t) {
  const a = Xe(e);
  if (!a) return;
  e.checkpoint("Change key interpolation"), a.interpolation = t;
  const o = e.root.querySelector('[data-role="key-interp"]');
  o && (o.value = t);
  for (const r of e.root.querySelectorAll(".key-interp-buttons [data-interp]"))
    r.classList.toggle("active", r.dataset.interp === t);
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(s(`Key @ ${a.frame} interpolation set to ${t}`));
}
function Kb(e) {
  const t = Oe(e), a = Ee(e);
  if (!t && a.length <= 1) return e.setStatus(s("Keep at least one camera keyframe"));
  const o = Xe(e) || a.find((i) => i.frame === e.frame);
  if (!o) return e.setStatus(s("Select a keyframe to delete"));
  e.checkpoint("Delete keyframe"), t ? t.keyframes = a.filter((i) => i !== o) : e.state.keyframes = a.filter((i) => i !== o);
  const r = Ee(e), n = o.frame;
  e.editingKeyFrame === n && (e.editingKeyFrame = null), e.selectedKeyFrame = r.length ? r.reduce((i, c) => Math.abs(c.frame - n) < Math.abs(i.frame - n) ? c : i).frame : null, e.camera = $e(e.state, e.frame), e.applyObjectAnimationFrame(), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(s(`${t?.name || "Camera"} key deleted @ ${n}`));
}
function Bb(e) {
  const t = Oe(e), a = Xe(e) || Ee(e).find((o) => o.frame === e.frame);
  e.copiedKeyframe = t ? { kind: "object", transform: Ye(a?.transform || t), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" } : { kind: "camera", camera: ce(a?.camera || e.camera), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" }, e.setStatus(s(`Keyframe copied @ ${a?.frame ?? e.frame}`));
}
function qb(e) {
  if (!e.copiedKeyframe) return e.setStatus(s("Copy a keyframe first"));
  const t = Oe(e), a = t ? "object" : "camera";
  if (e.copiedKeyframe.kind !== a) return e.setStatus(s(`Copy a ${a} keyframe first`));
  e.checkpoint("Paste keyframe");
  const o = t ? { frame: e.frame, transform: Ye(e.copiedKeyframe.transform), interpolation: e.copiedKeyframe.interpolation } : { frame: e.frame, camera: ce(e.copiedKeyframe.camera), interpolation: e.copiedKeyframe.interpolation }, r = Ee(e), n = r.findIndex((i) => i.frame === e.frame);
  n >= 0 ? r[n] = o : r.push(o), r.sort((i, c) => i.frame - c.frame), e.selectedKeyFrame = o.frame, e.editingKeyFrame = null, t ? (t.position = [...o.transform.position], t.rotation = [...o.transform.rotation], t.size = [...o.transform.size]) : e.camera = ce(o.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(s(`Keyframe pasted @ ${o.frame}`));
}
function Xe(e) {
  return Ee(e).find((t) => t.frame === e.selectedKeyFrame) || null;
}
function Ub(e, t) {
  t && (e.selectedKeyFrame = t.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([t.frame]), e.editingKeyFrame = null, Oe(e) || (e.pathSelection = Jc(e.pathSelection, { cameraId: e.state.active_camera_id, frame: t.frame, additive: !1 })), e.setFrame(t.frame));
}
function Wb(e) {
  const t = e.activeCameraTrack();
  if (t?.locked)
    return e.setStatus(s(`${t.name} is locked`)), null;
  let a = di(
    e.state.keyframes,
    e.frame,
    !e.state.auto_key && e.selectedEntity === "camera" ? e.selectedKeyFrame : null,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, camera: ce(e.camera), interpolation: e.root.querySelector('[data-role="key-interp"]')?.value || "ease" }, e.state.keyframes.push(a), e.state.keyframes.sort((o, r) => o.frame - r.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame) : a && (e.selectedKeyFrame = a.frame), e.cameraEditKey = a || null, e.cameraEditActive = !0, e.updateKeyVisualState(), a;
}
function Vb(e) {
  const t = e.cameraEditKey;
  t && (t.camera = ce(e.camera), e.frame = t.frame, e.selectedKeyFrame = t.frame), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.render();
}
function Hb(e) {
  if (e.cameraEditActive) {
    if (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, e.selectedKeyFrame === null) {
      const t = e.state.keyframes.find((a) => a.frame === e.frame);
      t && (e.selectedKeyFrame = t.frame);
    }
    e.refreshKeys();
  }
}
function Gb(e, t = !1) {
  e.editingKeyFrame === null && (!t || e.selectedKeyFrame === null && !e.selectedKeyFrames?.size) || (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, t && (e.selectedKeyFrame = null, e.selectedKeyFrames = null), e.refreshKeys());
}
function Yb(e) {
  e.state.auto_key = !e.state.auto_key, e.state.auto_key || e.exitKeyEdit(!1), e.serialize(), e.updateEditState(), e.setStatus(s(`Auto Key ${e.state.auto_key ? "on" : "off"}`));
}
const Xb = ["guides", "safe-areas", "resolution-gate", "aspect-ratio"];
function Jb(e) {
  const t = e.root.querySelector(".viewport-wrap"), a = e.editingKeyFrame !== null, o = !!e.state.auto_key;
  t && (t.classList.toggle("edit-mode", a), t.classList.toggle("auto-key", o));
  for (const m of e.root.querySelectorAll('[data-act="auto-key"]'))
    m.classList.toggle("active", o), m.setAttribute("aria-pressed", String(o)), m.title = s(`Auto Key ${o ? "on" : "off"}`);
  const r = e.state.view_mode === "camera";
  for (const m of Xb)
    for (const f of e.root.querySelectorAll(`[data-role="${m}"]`)) {
      f.disabled = !r;
      const d = f.closest("label");
      d && d.classList.toggle("oc-disabled", !r), f.title = r ? "" : s("Available in Camera View only");
    }
  const n = e.activeCameraTrack(), i = e.selectedObject(), c = e.root.querySelector('[data-role="tally-banner"]'), l = e.root.querySelector('[data-role="tally-text"]');
  if (c && l)
    if (a) {
      c.hidden = !1;
      const m = i ? i.name || i.type : n.name;
      l.textContent = `REC KEY @ F${e.editingKeyFrame} (${m})`;
    } else o ? (c.hidden = !1, l.textContent = `● AUTO-KEY ON (F${e.frame})`) : c.hidden = !0;
  const p = e.root.querySelector('[data-role="viewport-state"]');
  p && (a ? p.textContent = i ? `● EDITING ${i.name || i.type} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : `● EDITING ${n.name} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : o ? p.textContent = i ? `● AUTO KEY · ${i.name || i.type}` : `● AUTO KEY · ${n.name}` : i ? p.textContent = `SELECTED: ${i.name || i.type}` : p.textContent = e.state.view_mode === "camera" ? `CAMERA: ${n.name}` : `VIEW: ${e.state.view_mode.toUpperCase()}`), Gs(e), sh(e), Re(e);
}
function Zb(e) {
  const t = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const a of e.root.querySelectorAll("[data-key-frame]")) {
    const o = Number(a.dataset.keyFrame);
    a.classList.toggle("selected", t.has(o)), a.classList.toggle("editing", o === e.editingKeyFrame), a.classList.toggle("at-playhead", o === e.frame);
  }
  e.updateEditState();
}
function Qb(e, t) {
  const a = Xe(e);
  if (!a) return;
  e.checkpoint("Change key tangent mode"), a.tangents = a.tangents && typeof a.tangents == "object" ? a.tangents : {}, a.tangents.mode = t, a.tangent_mode = t, t !== "auto" && a.interpolation !== "bezier" && (a.interpolation = "bezier");
  const o = e.root.querySelector('[data-role="key-tangent-mode"]');
  o && (o.value = t);
  for (const r of e.root.querySelectorAll("[data-tangent]"))
    r.classList.toggle("active", r.dataset.tangent === t);
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(s("Key @ {frame} tangent mode set to {mode}").replace("{frame}", String(a.frame)).replace("{mode}", t));
}
function eg(e) {
  const t = e.root.querySelector('[data-role="path-diagnostics-list"]');
  if (!t) return;
  t.innerHTML = "";
  const a = e.activeCameraTrack?.()?.keyframes || [];
  if (a.length < 2) {
    t.hidden = !0;
    return;
  }
  t.hidden = !1;
  const o = mb({ keys: a, fps: e.state?.fps || 24, objects: e.state?.objects || [] });
  if (!o.length) {
    const r = document.createElement("div");
    r.className = "oc-diagnostic-ok", r.textContent = s("No path issues detected"), t.appendChild(r);
    return;
  }
  for (const r of o.slice(0, 8)) {
    const n = document.createElement("div");
    n.className = `oc-diagnostic oc-diagnostic-${r.severity}`, n.textContent = `⚠ ${r.message}`, t.appendChild(n);
  }
}
function tg(e) {
  const t = Oe(e), a = Xe(e), o = e.root.querySelector('[data-role="key-editor"]');
  o && (o.dataset.empty = String(!a));
  const r = e.root.querySelector('[data-role="selected-key-label"]');
  r && (r.textContent = a ? s(`${t?.name || "Camera"} Key @ ${a.frame}`) : s(`No ${t ? "object" : "camera"} key selected`));
  const n = ["key-frame", "key-interp", "key-tangent-mode", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type", "key-timing-weight"];
  for (const h of n) {
    const u = e.root.querySelector(`[data-role="${h}"]`);
    u && (u.disabled = !a || !!(t && !["key-frame", "key-interp", "key-tangent-mode"].includes(h)));
  }
  const i = e.root.querySelector('[data-act="update-key"]');
  i && (i.disabled = !a || !!t);
  const c = e.root.querySelector('[data-act="view-key"]');
  c && (c.disabled = !a || !!t);
  const l = e.root.querySelector('[data-act="redistribute-key-timing"]');
  l && (l.disabled = !!t || (e.activeCameraTrack?.()?.keyframes?.length || 0) < 2);
  for (const h of e.root.querySelectorAll(".key-interp-buttons [data-interp]"))
    h.classList.toggle("active", !!(a && h.dataset.interp === a.interpolation)), h.disabled = !a;
  const p = a?.tangents?.mode || a?.tangent_mode || "auto", m = e.root.querySelector('[data-role="key-tangent-mode"]');
  m && document.activeElement !== m && (m.value = p);
  for (const h of e.root.querySelectorAll("[data-tangent]"))
    h.classList.toggle("active", !!(a && h.dataset.tangent === p)), h.disabled = !a;
  const f = e.root.querySelector('[data-role="key-timecode"]');
  if (f) {
    const h = Math.max(1, e.state?.fps || 24), u = a ? a.frame : e.frame, b = Math.floor(u / h), v = u % Math.round(h), y = String(Math.floor(b / 3600)).padStart(2, "0"), x = String(Math.floor(b % 3600 / 60)).padStart(2, "0"), k = String(b % 60).padStart(2, "0"), g = String(v).padStart(2, "0");
    f.textContent = `${y}:${x}:${k}:${g} (${u}f)`;
  }
  if (eg(e), !a) return;
  if (t) {
    const h = e.root.querySelector('[data-role="key-frame"]');
    h && document.activeElement !== h && (h.value = String(a.frame));
    const u = e.root.querySelector('[data-role="key-interp"]');
    u && document.activeElement !== u && (u.value = a.interpolation);
    return;
  }
  const d = {
    "key-frame": a.frame,
    "key-interp": a.interpolation,
    "key-tangent-mode": p,
    "key-px": a.camera.position[0],
    "key-py": a.camera.position[1],
    "key-pz": a.camera.position[2],
    "key-tx": a.camera.target[0],
    "key-ty": a.camera.target[1],
    "key-tz": a.camera.target[2],
    "key-fov": a.camera.fov,
    "key-roll": a.camera.roll || 0,
    "key-zoom": a.camera.zoom || 1,
    "key-near": a.camera.near,
    "key-far": a.camera.far,
    "key-camera-type": a.camera.camera_type,
    "key-timing-weight": gs(a)
  };
  for (const [h, u] of Object.entries(d)) {
    const b = e.root.querySelector(`[data-role="${h}"]`);
    b && document.activeElement !== b && (b.value = String(u));
  }
}
function ag(e, t, a = !1, o = {}) {
  const r = Xe(e);
  if (!r) return;
  const n = Ee(e);
  let i = ee(Math.round(t), 0, e.state.duration_frames - 1);
  const c = (p) => n.some((m) => m !== r && m.frame === p);
  if (c(i) && a)
    for (let p = 1; p < e.state.duration_frames; p++) {
      const m = [i - p, i + p].filter((f) => f >= 0 && f < e.state.duration_frames).find((f) => !c(f));
      if (m !== void 0) {
        i = m;
        break;
      }
    }
  if (c(i))
    return e.refreshKeyEditor(), e.setStatus(s(`Frame ${i} already has a keyframe`));
  if (i === r.frame) return;
  o.checkpoint !== !1 && e.checkpoint("Move keyframe");
  const l = e.editingKeyFrame === r.frame;
  r.frame = i, e.selectedKeyFrame = i, e.editingKeyFrame = l ? i : null, e.frame = i, n.sort((p, m) => p.frame - m.frame), e.serialize(), e.setFrame(i), e.setStatus(s(`Keyframe moved to ${i}`));
}
function og(e) {
  const t = Xe(e);
  if (!t) return;
  if (e.checkpoint("Edit keyframe"), e.editingKeyFrame = t.frame, Oe(e)) {
    t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.transform = Ye(Oe(e)), e.serialize(), e.setFrame(t.frame), e.setStatus(s(`Object keyframe updated @ ${t.frame}`));
    return;
  }
  const a = (r, n) => {
    const i = Number(e.root.querySelector(`[data-role="${r}"]`).value);
    return Number.isFinite(i) ? i : n;
  };
  if (t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.camera.position = [a("key-px", t.camera.position[0]), a("key-py", t.camera.position[1]), a("key-pz", t.camera.position[2])], t.camera.target = [a("key-tx", t.camera.target[0]), a("key-ty", t.camera.target[1]), a("key-tz", t.camera.target[2])], t.camera.fov = ee(a("key-fov", t.camera.fov), 5, 150), t.camera.roll = ee(a("key-roll", t.camera.roll || 0), -180, 180), t.camera.zoom = Math.max(0.01, a("key-zoom", t.camera.zoom || 1)), t.camera.near = Math.max(1e-4, a("key-near", t.camera.near)), t.camera.far = Math.max(t.camera.near + 1e-4, a("key-far", t.camera.far)), t.camera.camera_type = e.root.querySelector('[data-role="key-camera-type"]').value, e.root.querySelector('[data-role="key-timing-weight"]')) {
    const r = Zc(t, a("key-timing-weight", gs(t)));
    r.timing ? t.timing = r.timing : delete t.timing;
  }
  e.camera = ce(t.camera), e.frame = t.frame, e.serialize(), e.setFrame(t.frame), e.setStatus(s(`Keyframe updated @ ${t.frame}`));
}
function rg(e) {
  const t = Xe(e);
  t && (e.setFrame(t.frame), e.setStatus(s(`Loaded keyframe @ ${t.frame}`)));
}
function ng(e, t) {
  const a = Ee(e);
  if (!a.length) return;
  const o = t < 0 ? [...a].reverse().find((r) => r.frame < e.frame) || a[a.length - 1] : a.find((r) => r.frame > e.frame) || a[0];
  e.selectKeyframe(o);
}
const Yr = ["pos_x", "pos_y", "pos_z"], wr = 1e-9, Uo = ["auto", "aligned", "free", "corner"];
function Te(e, t = 0) {
  const a = Number(e);
  return Number.isFinite(a) ? a : t;
}
function De(e) {
  const t = e?.camera?.position;
  return [Te(t?.[0]), Te(t?.[1]), Te(t?.[2])];
}
function At(e, t) {
  return [e[0] - t[0], e[1] - t[1], e[2] - t[2]];
}
function Vn(e) {
  return Math.hypot(e[0], e[1], e[2]);
}
function Fo(e, t) {
  return [e[0] * t, e[1] * t, e[2] * t];
}
function kr(e, t, a) {
  const o = De(e), r = t ? De(t) : o, n = a ? De(a) : o, i = Math.max(wr, Te(e?.frame) - Te(t?.frame, Te(e?.frame) - 1)), c = Math.max(wr, Te(a?.frame, Te(e?.frame) + 1) - Te(e?.frame)), l = [0, 0, 0], p = [0, 0, 0];
  for (let m = 0; m < 3; m += 1) {
    const f = (o[m] - r[m]) / i, d = (n[m] - o[m]) / c;
    let h = (f + d) * 0.5;
    t ? a ? f * d <= 0 && (h = 0) : h = f : h = d, l[m] = h * c * (1 / 3), p[m] = -h * i * (1 / 3);
  }
  return { out: l, in: p };
}
function yi(e, t, a) {
  const o = De(e), r = t ? De(t) : o, n = a ? De(a) : o;
  return {
    out: Fo(At(n, o), 1 / 3),
    in: Fo(At(r, o), 1 / 3)
  };
}
function Sr(e, t) {
  const a = e?.tangents?.channels;
  if (!a) return null;
  const o = t === "out" ? "out_y" : "in_y", r = [0, 0, 0];
  let n = !1;
  for (let i = 0; i < 3; i += 1) {
    const c = a[Yr[i]];
    c && Number.isFinite(Number(c[o])) && (r[i] = Number(c[o]), n = !0);
  }
  return n ? r : null;
}
function pt(e) {
  const t = e?.tangents?.spatial_mode;
  return Uo.includes(t) ? t : "auto";
}
function jr(e, t = null, a = null) {
  const o = pt(e), r = De(e);
  if (o === "corner") {
    const l = yi(e, t, a);
    return { in: wo(r, l.in), out: wo(r, l.out), mode: o };
  }
  const n = kr(e, t, a), i = (o === "free" || o === "aligned") && Sr(e, "out") || n.out, c = (o === "free" || o === "aligned") && Sr(e, "in") || n.in;
  return { in: wo(r, c), out: wo(r, i), mode: o };
}
function wo(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function sg(e) {
  return e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.channels = e.tangents.channels && typeof e.tangents.channels == "object" ? e.tangents.channels : {}, e.tangents.channels;
}
function ft(e, t, a) {
  const o = sg(e);
  for (let r = 0; r < 3; r += 1) {
    const n = Yr[r], i = o[n] && typeof o[n] == "object" ? o[n] : {};
    i.mode = "free", i.out_x = 1 / 3, i.in_x = -1 / 3, t === "out" ? i.out_y = a[r] : i.in_y = a[r], i.out_y === void 0 && (i.out_y = 0), i.in_y === void 0 && (i.in_y = 0), o[n] = i;
  }
}
function Ro(e) {
  e.interpolation !== "bezier" && (e.interpolation = "bezier");
}
function vi(e, t, a) {
  const o = De(e), r = jr(e, t, a);
  ft(e, "out", At(r.out, o)), ft(e, "in", At(r.in, o));
}
function ig(e, t, a, { prevKey: o = null, nextKey: r = null, breakCoupling: n = !1 } = {}) {
  if (!e || t !== "in" && t !== "out") return e;
  let i = pt(e);
  if (i === "corner") return e;
  i === "auto" && (i = "aligned", e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = "aligned", vi(e, o, r));
  const c = De(e), l = At([
    Te(a?.[0]),
    Te(a?.[1]),
    Te(a?.[2])
  ], c);
  if (Ro(e), ft(e, t, l), i === "aligned" && !n) {
    const p = t === "out" ? "in" : "out", m = Sr(e, p) || (p === "out" ? kr(e, o, r).out : kr(e, o, r).in), f = Vn(l), d = Vn(m) || f || 1, h = f > wr ? Fo(l, -d / f) : Fo(m, 1);
    ft(e, p, h);
  }
  return e;
}
function ko(e, t, a) {
  if (!e || t !== "in" && t !== "out") return e;
  const o = De(e);
  return Ro(e), ft(e, t, At([
    Te(a?.[0]),
    Te(a?.[1]),
    Te(a?.[2])
  ], o)), e;
}
function cg(e, t, { prevKey: a = null, nextKey: o = null } = {}) {
  if (!e || !Uo.includes(t)) return e;
  if (e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = t, t === "auto") {
    if (e.tangents.channels) {
      for (const r of Yr) delete e.tangents.channels[r];
      Object.keys(e.tangents.channels).length || delete e.tangents.channels;
    }
    return e.interpolation === "bezier" && (e.interpolation = "smooth"), e;
  }
  if (t === "corner") {
    const r = yi(e, a, o);
    return Ro(e), ft(e, "out", r.out), ft(e, "in", r.in), e;
  }
  return Ro(e), vi(e, a, o), e;
}
function lg(e) {
  switch (e) {
    case "auto":
      return s("Auto Smooth");
    case "aligned":
      return s("Aligned");
    case "free":
      return s("Free");
    case "corner":
      return s("Corner");
    default:
      return e;
  }
}
const dg = 220;
function sr(e, t, a, o) {
  const r = e.selectedEntity === "object" && o(e) ? "object" : "camera", n = (e.selectedKeyFrames?.size || 0) >= 2 ? ` (${s("Selection")})` : "";
  return [
    { label: `${s("Simplify keys")}${n}`, icon: "pi-chart-line", help: s("Drop keys that barely change the motion"), run: () => e.simplifyActiveKeys({ mode: "simplify", tolerance: 0.35, scope: r }) },
    {
      label: `${s("Reduce keys…")}${n}`,
      icon: "pi-minus-circle",
      help: s("Decimate down to a target key count"),
      run: async () => {
        const i = await t(a, s("Reduce keys"), s("Target number of keys"), "8"), c = Math.round(Number(i));
        Number.isFinite(c) && c >= 2 && e.simplifyActiveKeys({ mode: "reduce", target: c, scope: r });
      }
    },
    { label: `${s("Clean keys")}${n}`, icon: "pi-filter", help: s("Remove duplicate, too-close and redundant keys"), run: () => e.simplifyActiveKeys({ mode: "clean", scope: r }) }
  ];
}
function Hn(e) {
  return JSON.stringify({
    background: e.viewport_bg_image || "",
    sequence: e.viewport_bg_sequence || [],
    objects: (e.objects || []).map((t) => [t.id, t.type, t.asset || ""])
  });
}
function mg(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: f, playblastCameraTrack: d, restoreFromWidgets: h, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: v, bindEditorEvents: y, activateCamera: x, addCamera: k, deleteCamera: g, drawPreviewOverlays: _, duplicateCamera: A, maximizeCameraPreview: K, refreshCameraPreviews: F, refreshCameraSelectors: J, renameCamera: H, setPlayblastCamera: M, toggleCameraView: P, captureRealtime: j, makePlayblast: R, uploadDirectorPlayblast: q, waitForMediaFrame: G, computeAudioPeaks: L, loadAudioFile: E, releaseAudio: Y, stopPlay: D, togglePlay: X, applyCameraPreset: te, applyCameraShake: le, applyProxyPreset: se, clearViewportBgImage: re, loadViewportBgFile: de, loadViewportBgSequence: ge, drawCameraPath: he, drawCard: ye, drawCube: ve, drawGrid: pe, drawHuman: Me, drawLine3D: xe, drawNull: we, drawOverlays: be, drawPointField: N, drawSpeedHeatmap: V, drawSphere: me, curveChannels: _e, drawCurveEditor: Pe, onCurvePointerDown: Ke, onCurvePointerMove: Le, onCurvePointerUp: st, onTimelinePointerDown: ta, onTimelinePointerMove: aa, onTimelinePointerUp: oa, refreshKeys: $t, resetCurveZoom: Mt, resetTimelineZoom: ut, setChannelFilter: It, setCurveInterpolation: Ot, setTangentMode: Pt, timelineFrameFromEvent: ra, toggleCurveHandles: Lt, zoomCurve: na, drawTransformGizmo: sa, frameTarget: ia, gizmoAxes: ca, gizmoGeometry: la, onPointerDown: da, onPointerMove: ma, onPointerUp: pa, onWheel: fa, pickGizmo: ha, pickSceneObject: ua, resetCamera: Nt, setTransformMode: zt, setViewMode: ba, viewportCamera: ga, loadCardFile: Wo, loadExecutionPreview: Vo, loadMediaUrl: ya, loadModelFile: va, loadSelectedReference: xa, onModelLoaded: wa, restoreAssets: ka, syncUpstreamInputs: Sa, configureDomMedia: ja, refreshSetupDiagnostic: Ft, addMediaCard: _a, addPrimitive: Ca, applyObjectAnimationFrame: Ea, beginCameraEdit: Aa, beginObjectEdit: Ta, commitCameraEdit: $a, commitObjectEdit: Ma, copyKeyframe: Ia, deleteKeyframe: Oa, deleteObject: Pa, duplicateObject: La, exitKeyEdit: Na, finishCameraEdit: za, goToAdjacentKey: Fa, insertKeyframe: Ra, loadSelectedKeyView: Da, pasteKeyframe: Ka, playblastCameraAtFrame: Ba, refreshInspector: qa, refreshKeyEditor: Ua, refreshObjects: Wa, removeObjectResources: Va, renameObject: Ha, retimeSelectedKey: Ga, selectKeyframe: Ya, selectedKeyframe: Xa, selectedObject: Ja, selectObjectAnimation: Za, setKeyInterpolation: Qa, setObjectParent: eo, timelineKeyframes: to, timelineObject: it, toggleAutoKey: ao, toggleObject: oo, updateCameraFromHud: ro, updateEditState: no, updateKeyVisualState: so, updateSelectedKey: io, updateSelectedObject: co, clamp: Rt, cloneCamera: lo, configureCore: mo, defaultCamera: po, sampleCamera: Je, sampleObjectTransform: Ho, sanitizeState: bt, worldTransform: Ne } = e;
  return {
    setSelectMode(z) {
      if (["object", "vertex", "edge", "face"].includes(z)) {
        this.state.select_mode = z, this.subSelection = null;
        for (const I of this.root.querySelectorAll("[data-select-mode]")) {
          const S = I.dataset.selectMode === z;
          I.classList.toggle("active", S), I.setAttribute("aria-pressed", String(S));
        }
        for (const I of this.root.querySelectorAll('[data-role="select-mode"]'))
          I.value = z;
        this.serialize(), this.syncFromWidgets(), this.render(), this.setStatus(`Select Mode: ${z.toUpperCase()}`);
      }
    },
    refreshSetupDiagnostic() {
      Ft(this);
    },
    hideInternalWidgets() {
      for (const z of ["state_json", "recording_path", "card_asset"]) {
        const I = this.node.widgets?.find((S) => S.name === z);
        I && (I.computeSize = () => [0, -4], I.draw = () => {
        }, I.hidden = !0, I.options = { ...I.options || {}, hideInVueNodes: !0 });
      }
    },
    restoreFromWidgets() {
      h(this);
    },
    restoreHistorySnapshot(z) {
      const I = JSON.parse(z);
      if (this.keyDrag?.badge?.remove?.(), this.boxSelect?.overlay?.remove?.(), this.drag = null, this.gizmoDrag = null, this.targetFreeDrag = null, this.pathDrag = null, this.boxSelection = null, this.keyDrag = null, this.curveDrag = null, this.curvePanDrag = null, this.curveScrub = null, this.curveBoxSelect = null, this.timelineDrag = null, this.timelinePanDrag = null, this.boxSelect = null, this.modalTransform = null, this.activePointerId != null) {
        try {
          this.interactionElement?.releasePointerCapture?.(this.activePointerId);
        } catch {
        }
        this.activePointerId = null;
      }
      const S = Hn(this.state), w = new Set(this.state.objects.map((Q) => Q.id));
      this.state = bt(I.state);
      const C = new Set(this.state.objects.map((Q) => Q.id));
      for (const Q of w) C.has(Q) || this.removeObjectResources(Q);
      this.frame = Rt(I.frame, 0, this.state.duration_frames - 1);
      const $ = new Set(this.state.objects.map((Q) => Q.id)), U = Array.isArray(I.selectedObjectIds) ? I.selectedObjectIds : [I.selectedObjectId].filter(Boolean);
      this.selectedObjectIds = new Set(U.filter((Q) => $.has(Q))), this.selectedObjectId = this.selectedObjectIds.has(I.selectedObjectId) ? I.selectedObjectId : [...this.selectedObjectIds].at(-1) || null, this.selectedEntity = this.selectedObjectIds.size ? "object" : I.selectedEntity || "camera";
      const Z = new Set(this.timelineKeyframes().map((Q) => Q.frame)), B = Array.isArray(I.selectedKeyFrames) ? I.selectedKeyFrames : [I.selectedKeyFrame].filter((Q) => Q != null);
      this.selectedKeyFrames = new Set(B.filter((Q) => Z.has(Q))), this.selectedKeyFrame = this.selectedKeyFrames.has(I.selectedKeyFrame) ? I.selectedKeyFrame : [...this.selectedKeyFrames].at(-1) ?? null, this.pathSelection = Qc(this.pathSelection, this.activeCameraTrack()), this.subSelection = I.subSelection || null, this.camera = Je(this.state, this.frame), Ht(this, this.activeCameraTrack(), this.camera, this.frame), this.cameraPreviewSignature = "", this.serialize(), S !== Hn(this.state) && this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
    },
    checkpoint(z) {
      this.history.checkpoint(z);
    },
    undo() {
      const z = this.history.undo();
      z && this.setStatus(`Undo: ${z}`);
    },
    redo() {
      const z = this.history.redo();
      z && this.setStatus(`Redo: ${z}`);
    },
    bindEditorEvents() {
      y(this);
    },
    bindWidgetCallbacks() {
      f(this);
    },
    syncFromWidgets(z = !0) {
      v(this, z);
    },
    serialize() {
      u(this);
    },
    activeCameraTrack() {
      return m(this);
    },
    playblastCameraTrack() {
      return d(this);
    },
    syncActiveCameraTrack() {
      b(this);
    },
    refreshCameraSelectors() {
      J(this);
    },
    refreshCameraPreviews() {
      F(this);
    },
    addCamera() {
      k(this);
    },
    async renameCamera(z) {
      return H(this, z);
    },
    duplicateCamera(z) {
      A(this, z);
    },
    async deleteCamera(z) {
      return g(this, z);
    },
    activateCamera(z) {
      x(this, z);
    },
    setPlayblastCamera(z) {
      M(this, z);
    },
    closeMenus(z = null) {
      for (const I of this.root.querySelectorAll(".toolbar-menu")) I !== z && (I.open = !1);
      this.hideContextMenu();
    },
    initializeTooltips() {
      n(this.root, this.interactionElement);
    },
    hideContextMenu() {
      this.contextMenu?.hide();
    },
    showContextMenu(z, I, S) {
      return this.contextMenu.show(z, I, S);
    },
    onContextMenu(z) {
      if (z.preventDefault(), z.stopPropagation(), z.stopImmediatePropagation?.(), z.altKey || this.state.navigation_profile === "simple" && z.target?.closest?.(".viewport-wrap")) return;
      const I = z.target, S = I.closest?.(".camera-preview-tile"), w = I.closest?.(".scene-item"), C = I.closest?.(".key");
      if (S) return this.openCameraContext(z, S.dataset.cameraId, !0);
      if (w?.dataset.cameraId) return this.openCameraContext(z, w.dataset.cameraId, !1);
      if (w?.dataset.objectId) return this.openObjectContext(z, w.dataset.objectId);
      if (C) {
        const $ = this.timelineKeyframes().find((U) => U.frame === Number(C.dataset.keyFrame));
        return $ && this.selectKeyframe($), this.openTimelineContext(z, !0);
      }
      if (I.closest?.('[data-role="keys"]'))
        return this.setFrame(this.timelineFrameFromEvent(z, I.closest('[data-role="keys"]'))), this.openTimelineContext(z, !1);
      if (I.closest?.(".curve-editor")) return this.openCurveContext(z);
      if (I.closest?.(".viewport-wrap")) {
        const $ = this.interactionElement.getBoundingClientRect(), U = (z.clientX - $.left) * this.canvas.width / Math.max(1, $.width), Z = (z.clientY - $.top) * this.canvas.height / Math.max(1, $.height), B = this.pickSceneObject([U, Z]);
        if (B) {
          if ((B.type === "object" || B.type === "object_keyframe") && B.object)
            return this.selectedEntity = "object", this.selectedObjectId = B.object.id, B.keyframe ? (this.setFrame(B.keyframe.frame), this.selectedKeyFrame = B.keyframe.frame) : this.selectedKeyFrame = B.object.keyframes?.find((Q) => Q.frame === this.frame)?.frame ?? null, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.openObjectContext(z, B.object.id);
          if (["camera", "camera_target", "camera_keyframe"].includes(B.type) && B.camera)
            return this.selectedEntity = B.type === "camera_target" ? "camera_target" : "camera", this.selectedObjectId = null, this.activateCamera(B.camera.id), B.keyframe && (this.setFrame(B.keyframe.frame), this.selectedKeyFrame = B.keyframe.frame), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), B.type === "camera_keyframe" && B.keyframe ? this.openPathKeyContext(z, B.camera.id, B.keyframe.frame) : this.openCameraContext(z, B.camera.id, !1);
        }
        return this.openViewportContext(z);
      }
    },
    openViewportContext(z) {
      const I = this.selectedObject();
      this.showContextMenu(z, s("Viewport"), [
        {
          label: I ? `${s("Set key")} · ${I.name || I.type}` : `${s("Set key")} · ${this.activeCameraTrack().name}`,
          icon: "pi-key",
          shortcut: "I",
          run: () => this.insertKeyframe()
        },
        { label: s("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        { label: s("Set camera target here"), icon: "pi-bullseye", help: s("Set camera Look-At target to this 3D point in the scene"), run: () => this.setTargetAtCursor(z) },
        null,
        {
          label: s("Add object"),
          icon: "pi-plus-circle",
          items: [
            { label: s("Sphere"), icon: "pi-circle", run: () => this.addPrimitive("sphere") },
            { label: s("Cube"), icon: "pi-stop", run: () => this.addPrimitive("cube") },
            { label: s("Pyramide"), icon: "pi-caret-up", run: () => this.addPrimitive("pyramid") },
            { label: s("Sun light"), icon: "pi-sun", run: () => this.addPrimitive("sun_light") },
            { label: s("Point light"), icon: "pi-bolt", run: () => this.addPrimitive("point_light") },
            { label: s("Spot light"), icon: "pi-forward", run: () => this.addPrimitive("spot_light") },
            { label: s("Camera"), icon: "pi-video", run: () => this.addCamera() },
            null,
            {
              label: s("Assets"),
              icon: "pi-box",
              items: [
                { label: s("Card"), icon: "pi-image", run: () => this.addPrimitive("card") },
                { label: s("Cylinder"), icon: "pi-database", run: () => this.addPrimitive("cylinder") },
                { label: s("Torus"), icon: "pi-circle", run: () => this.addPrimitive("torus") },
                { label: s("Human"), icon: "pi-user", run: () => this.addPrimitive("human") },
                { label: s("Null"), icon: "pi-plus", run: () => this.addPrimitive("null") },
                null,
                { label: s("Import 3D Model (+)"), icon: "pi-upload", run: () => this.root.querySelector('[data-act="load-model"]')?.click() }
              ]
            }
          ]
        },
        {
          label: s("Selection"),
          icon: "pi-check-square",
          items: [
            { label: s("Select all"), icon: "pi-check-square", shortcut: "Ctrl+A", run: () => this.selectAllObjects() },
            { label: s("Deselect all"), icon: "pi-times", shortcut: "Alt+A", run: () => this.deselectAll() },
            { label: s("Invert selection"), icon: "pi-sync", shortcut: "Ctrl+I", run: () => this.invertSelection() },
            null,
            {
              label: s("Box selection tool"),
              icon: "pi-stop",
              shortcut: "B",
              run: () => {
                this.boxSelectMode = !0, this.interactionElement?.style && (this.interactionElement.style.cursor = "crosshair"), this.setStatus(s("Box select mode (drag over objects in viewport)"));
              }
            }
          ]
        },
        {
          label: s("Camera & Views"),
          icon: "pi-eye",
          items: [
            { label: s("Camera View (Active)"), icon: "pi-video", checked: this.state.view_mode === "camera", run: () => this.setViewMode("camera") },
            { label: s("Perspective View"), icon: "pi-compass", checked: this.state.view_mode === "perspective", run: () => this.setViewMode("perspective") },
            { label: s("Top"), icon: "pi-arrow-up", checked: this.state.view_mode === "top", run: () => this.setViewMode("top") },
            { label: s("Front"), icon: "pi-arrow-circle-up", checked: this.state.view_mode === "front", run: () => this.setViewMode("front") },
            { label: s("Right"), icon: "pi-arrow-right", checked: this.state.view_mode === "right", run: () => this.setViewMode("right") },
            { label: s("ISO"), icon: "pi-box", checked: this.state.view_mode === "iso", run: () => this.setViewMode("iso") },
            null,
            { label: s("Show / hide camera previews"), icon: "pi-images", run: () => this.toggleCameraView() }
          ]
        },
        null,
        {
          label: s("Tools & Playblast"),
          icon: "pi-cog",
          items: [
            { label: s("Record primary preview"), icon: "pi-video", run: () => this.makePlayblast() },
            null,
            { label: s("Clear caches & clean memory"), icon: "pi-trash", danger: !0, run: () => this.clearCaches() }
          ]
        }
      ]);
    },
    openObjectContext(z, I) {
      const S = this.state.objects.find(($) => $.id === I);
      if (!S) return;
      this.selectedEntity = "object", this.selectedObjectId = I, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
      const w = ["sun_light", "point_light", "spot_light"].includes(S.type), C = this.selectedObjectIds?.size || 0;
      if (C >= 2 && this.selectedObjectIds.has(I)) {
        this.showContextMenu(z, `${C} ${s("objects selected")}`, [
          { label: s("Duplicate {count} objects").replace("{count}", String(C)), icon: "pi-copy", shortcut: "Shift+D", run: () => this.duplicateSelectedObjects() },
          { label: s("Toggle visibility"), icon: "pi-eye", shortcut: "H", run: () => this.toggleSelectedObjects() },
          { label: s("Toggle lock"), icon: "pi-lock", shortcut: "L", run: () => this.lockSelectedObjects() },
          null,
          {
            label: s("Transform mode"),
            icon: "pi-arrows-alt",
            items: [
              { label: s("Translate"), icon: "pi-arrows-alt", shortcut: "W", checked: (this.state.gizmo_mode || "translate") === "translate", run: () => this.setTransformMode("translate") },
              { label: s("Rotate"), icon: "pi-refresh", shortcut: "E", checked: this.state.gizmo_mode === "rotate", run: () => this.setTransformMode("rotate") },
              { label: s("Scale"), icon: "pi-expand", shortcut: "R", checked: this.state.gizmo_mode === "scale", run: () => this.setTransformMode("scale") }
            ]
          },
          null,
          {
            label: s("Reset entire animation"),
            icon: "pi-replay",
            danger: !0,
            run: () => {
              for (const $ of this.selectedObjectIds) this.resetObjectAnimation($);
            }
          },
          { label: s("Delete {count} objects").replace("{count}", String(C)), icon: "pi-trash", danger: !0, shortcut: "Del", run: () => this.deleteSelectedObjects() },
          null,
          { label: s("Deselect all"), icon: "pi-times", shortcut: "Alt+A", run: () => this.deselectAll() }
        ]);
        return;
      }
      this.showContextMenu(z, S.name || S.type, [
        { label: s("Set key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: s("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        { label: s("Rename object…"), icon: "pi-pencil", run: () => this.renameObject(I) },
        { label: s("Duplicate object"), icon: "pi-copy", run: () => this.duplicateObject(I) },
        { label: S.enabled === !1 ? s("Show object") : s("Hide object"), icon: S.enabled === !1 ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(I) },
        { label: S.locked ? s("Unlock object") : s("Lock object"), icon: S.locked ? "pi-lock" : "pi-lock-open", run: () => Kr(this, S) },
        null,
        {
          label: s("Transform mode"),
          icon: "pi-arrows-alt",
          items: [
            { label: s("Translate"), icon: "pi-arrows-alt", shortcut: "W", checked: (this.state.gizmo_mode || "translate") === "translate", run: () => this.setTransformMode("translate") },
            { label: s("Rotate"), icon: "pi-refresh", shortcut: "E", checked: this.state.gizmo_mode === "rotate", run: () => this.setTransformMode("rotate") },
            { label: s("Scale"), icon: "pi-expand", shortcut: "R", disabled: w, checked: this.state.gizmo_mode === "scale", run: () => this.setTransformMode("scale") }
          ]
        },
        {
          label: s("Tracking & Constraints"),
          icon: "pi-bullseye",
          items: [
            { label: s("Camera tracks this object (Look-At)"), icon: "pi-bullseye", help: s("Lock camera live look-at tracking to this moving object"), run: () => this.aimAtSelectedObject(I) },
            { label: s("Bake tracking to all camera keys"), icon: "pi-check-square", help: s("Write this object's motion into camera target keyframes"), run: () => this.bakeAimToKeyframes() },
            null,
            { label: s("Select hierarchy"), icon: "pi-sitemap", shortcut: "Shift+G", help: s("Select this object and all descendants"), run: () => this.selectHierarchy(I) }
          ]
        },
        ...w ? [
          {
            label: s("Light"),
            icon: "pi-sun",
            items: [
              {
                label: s("Shadow"),
                icon: "pi-circle-fill",
                checked: S.cast_shadow !== !1,
                run: () => {
                  this.checkpoint("Toggle light shadow"), S.cast_shadow = S.cast_shadow === !1, this.serialize(), this.refreshInspector(), this.render();
                }
              }
            ]
          }
        ] : [],
        null,
        { label: s("Reset entire animation"), icon: "pi-replay", danger: !0, help: s("Delete every animation key and return position/rotation to zero"), run: () => this.resetObjectAnimation(I) },
        null,
        { label: s("Delete object"), icon: "pi-trash", danger: !0, disabled: I === "subject", help: I === "subject" ? s("The canonical subject card cannot be deleted") : s("Delete this object and its animation keys"), run: () => this.deleteObject(I) }
      ]);
    },
    openCameraContext(z, I, S = !1) {
      const w = this.state.cameras.find((C) => C.id === I);
      w && (this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(I), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.showContextMenu(z, `${w.name}${S ? " preview" : ""}`, [
        { label: s("Edit this camera"), icon: "pi-video", run: () => this.activateCamera(I) },
        {
          label: s("Select whole path — move / scale / rotate"),
          icon: "pi-arrows-alt",
          disabled: (w.keyframes || []).length < 1,
          run: () => {
            this.activateCamera(I), this.selectCameraPath() && this.setStatus(`${w.name} · ${s("whole path selected — move / scale / rotate")}`);
          }
        },
        { label: s("Set as primary / playblast"), icon: "pi-star", disabled: I === this.state.playblast_camera_id, run: () => this.setPlayblastCamera(I) },
        { label: s("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => {
          this.activateCamera(I), this.insertKeyframe();
        } },
        { label: s("Record this preview"), icon: "pi-circle-fill", run: () => {
          this.setPlayblastCamera(I), this.makePlayblast();
        } },
        { label: this.state.maximized_camera_id === I ? s("Restore preview size") : s("Maximize preview"), icon: "pi-window-maximize", run: () => this.maximizeCameraPreview(I) },
        null,
        {
          label: s("Shot order & handles"),
          icon: "pi-sliders-h",
          items: [
            { label: s("Shot: move earlier"), icon: "pi-arrow-up", disabled: this.state.cameras.findIndex((C) => C.id === I) <= 0, run: () => this.moveShot(I, -1) },
            { label: s("Shot: move later"), icon: "pi-arrow-down", disabled: this.state.cameras.findIndex((C) => C.id === I) >= this.state.cameras.length - 1, run: () => this.moveShot(I, 1) },
            null,
            { label: s("Shot handles…"), icon: "pi-sliders-h", run: () => this.editShotHandles(I) }
          ]
        },
        null,
        { label: s("Rename camera…"), icon: "pi-pencil", run: () => this.renameCamera(I) },
        { label: s("Duplicate camera"), icon: "pi-copy", run: () => this.duplicateCamera(I) },
        { label: s("Create camera from current view"), icon: "pi-plus", run: () => this.addCamera() },
        null,
        { label: s("Reset entire animation"), icon: "pi-replay", danger: !0, help: s("Delete every camera key and return to a static zero pose at frame 0"), run: () => this.resetCameraAnimation(I) },
        null,
        { label: s("Delete camera"), icon: "pi-trash", danger: !0, disabled: this.state.cameras.length <= 1, run: () => this.deleteCamera(I) }
      ]));
    },
    openPathKeyContext(z, I, S) {
      const w = this.state.cameras.find((Q) => Q.id === I);
      if (!w) return;
      this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(I);
      const C = (w.keyframes || []).find((Q) => Q.frame === S) || null;
      C && this.selectKeyframe(C), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
      const $ = C ? pt(C) : "auto", U = this.selectedKeyFrames?.size || 0, Z = this.pathSelection?.component === "target", B = fs(w);
      this.showContextMenu(z, `Path key F${S}`, [
        { label: s("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: s("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        null,
        {
          label: s("Path Component"),
          icon: "pi-bullseye",
          help: B ? s("Driven by Look At -- target editing is disabled") : void 0,
          items: [
            { label: s("Position"), checked: !Z, run: () => this.setPathSelectionComponent("position") },
            {
              label: s("Target"),
              checked: Z,
              disabled: B,
              help: B ? s("Driven by Look At -- target editing is disabled") : void 0,
              run: () => this.setPathSelectionComponent("target")
            }
          ]
        },
        {
          label: s("Handle Type"),
          icon: "pi-share-alt",
          items: Uo.map((Q) => ({
            label: lg(Q),
            checked: $ === Q,
            run: () => this.setSpatialHandleMode(Q)
          }))
        },
        {
          label: s("Keyframe operations"),
          icon: "pi-sliders-v",
          items: sr(this, i, t, it)
        },
        null,
        {
          label: U >= 2 ? s("Delete {count} keys").replace("{count}", String(U)) : s("Delete key"),
          icon: "pi-trash",
          danger: !0,
          disabled: (w.keyframes || []).length <= 1,
          run: () => this.deleteSelectedKeyframes()
        }
      ]);
    },
    moveShot(z, I) {
      const S = this.state.cameras.findIndex(($) => $.id === z), w = S + I;
      if (S < 0 || w < 0 || w >= this.state.cameras.length) return;
      this.checkpoint("Reorder shot");
      const [C] = this.state.cameras.splice(S, 1);
      this.state.cameras.splice(w, 0, C), this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${C.name} → #${w + 1}`);
    },
    async editShotHandles(z) {
      const I = this.state.cameras.find(($) => $.id === z);
      if (!I) return;
      const S = I.handles || { in: 0, out: 0 }, w = await i(t, s("Shot handles…"), "Handle frames: in,out", `${S.in},${S.out}`);
      if (w == null) return;
      const C = String(w).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
      if (!C) return this.setStatus("Handles must be two integers: in,out");
      this.checkpoint("Shot handles"), I.handles = { in: Math.min(600, Number(C[1])), out: Math.min(600, Number(C[2])) }, this.serialize(), this.setStatus(`${I.name} handles: ${I.handles.in} / ${I.handles.out}`);
    },
    openTimelineContext(z, I) {
      const S = this.selectedKeyFrames?.size || 0, w = this.selectedKeyframe(), C = w?.interpolation || "ease", $ = w && pt(w) || "auto", U = ["ease", "linear", "bezier", "smooth", "ease_in", "ease_out", "sine", "cubic", "quintic", "expo", "back"], Z = ["auto", "clamped", "vector", "free", "aligned", "flat"];
      this.showContextMenu(z, I ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
        { label: s("Fit timeline view (F)"), icon: "pi-arrows-alt", shortcut: "F", run: () => ut(this) },
        { label: s("Set / replace key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: s("Copy selected key"), icon: "pi-copy", shortcut: "Ctrl+C", disabled: !w, run: () => this.copyKeyframe() },
        { label: s("Paste key at playhead"), icon: "pi-clipboard", shortcut: "Ctrl+V", disabled: !this.copiedKeyframe, run: () => this.pasteKeyframe() },
        null,
        {
          label: s("Interpolation"),
          icon: "pi-chart-line",
          disabled: !w && S < 2,
          items: U.map((B) => ({
            label: B.replaceAll("_", " "),
            checked: C === B,
            run: () => this.setSelectedKeysInterpolation(B)
          }))
        },
        {
          label: s("Tangents"),
          icon: "pi-share-alt",
          disabled: !w && S < 2,
          items: Z.map((B) => ({
            label: B[0].toUpperCase() + B.slice(1),
            checked: $ === B,
            run: () => this.setSelectedKeysTangentMode(B)
          }))
        },
        {
          label: s("Markers"),
          icon: "pi-bookmark",
          items: [
            { label: s("Add marker at playhead"), icon: "pi-bookmark", run: () => this.addMarker() },
            { label: s("Remove nearest marker"), icon: "pi-bookmark-fill", danger: !0, disabled: !(this.state.markers || []).length, run: () => this.removeNearestMarker() }
          ]
        },
        null,
        { label: s("Previous key"), icon: "pi-fast-backward", shortcut: ",", run: () => this.goToAdjacentKey(-1) },
        { label: s("Next key"), icon: "pi-fast-forward", shortcut: ".", run: () => this.goToAdjacentKey(1) },
        { label: this.state.auto_key ? s("Disable Auto Key") : s("Enable Auto Key"), icon: "pi-circle-fill", checked: !!this.state.auto_key, run: () => this.toggleAutoKey() },
        null,
        {
          label: s("Keyframe operations"),
          icon: "pi-sliders-v",
          items: sr(this, i, t, it)
        },
        null,
        {
          label: S >= 2 ? s("Delete {count} keys").replace("{count}", String(S)) : s("Delete selected key"),
          icon: "pi-trash",
          shortcut: "Delete",
          danger: !0,
          disabled: S < 2 && !w,
          run: () => this.deleteSelectedKeyframes()
        }
      ]);
    },
    addMarker() {
      if ((this.state.markers || []).find((I) => I.frame === this.frame)) return this.setStatus(`Marker already at F${this.frame}`);
      this.checkpoint("Add marker"), this.state.markers = [...this.state.markers || [], { frame: this.frame, name: `Marker ${(this.state.markers || []).length + 1}`, color: "#f2d06b" }].sort((I, S) => I.frame - S.frame), this.serialize(), this.refreshKeys(), this.setStatus(`Marker @ F${this.frame}`);
    },
    removeNearestMarker() {
      const z = this.state.markers || [];
      if (!z.length) return;
      const I = z.reduce((S, w) => Math.abs(w.frame - this.frame) < Math.abs(S.frame - this.frame) ? w : S);
      this.checkpoint("Remove marker"), this.state.markers = z.filter((S) => S !== I), this.serialize(), this.refreshKeys(), this.setStatus(`Marker removed @ F${I.frame}`);
    },
    openCurveContext(z) {
      const I = this.selectedKeyFrames?.size || 0, S = I < 2 && !this.selectedKeyframe(), w = this.selectedKeyframe(), C = w?.interpolation || "ease", $ = w && pt(w) || "auto", U = ["bezier", "smooth", "linear", "ease_in", "ease_out", "ease", "sine", "cubic", "quintic", "expo", "back"], Z = ["auto", "clamped", "vector", "free", "aligned", "flat"];
      this.showContextMenu(z, s("Curve editor"), [
        { label: s("Fit all curves (Framing)"), icon: "pi-arrows-alt", shortcut: "F", run: () => Mt(this) },
        { label: s("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: this.showCurveHandles ? s("Hide Bézier handles") : s("Show Bézier handles"), icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
        null,
        {
          label: s("Interpolation"),
          icon: "pi-chart-line",
          disabled: S,
          items: U.map((B) => ({
            label: B.replaceAll("_", " "),
            checked: C === B,
            run: () => this.setSelectedKeysInterpolation(B)
          }))
        },
        {
          label: s("Tangents"),
          icon: "pi-share-alt",
          disabled: S,
          items: Z.map((B) => ({
            label: B[0].toUpperCase() + B.slice(1),
            checked: $ === B,
            run: () => this.setSelectedKeysTangentMode(B)
          }))
        },
        null,
        {
          label: s("Keyframe operations"),
          icon: "pi-sliders-v",
          items: sr(this, i, t, it)
        },
        null,
        { label: I >= 2 ? s("Delete {count} keys").replace("{count}", String(I)) : s("Delete selected key"), icon: "pi-trash", danger: !0, disabled: S, run: () => this.deleteSelectedKeyframes() }
      ]);
    },
    scheduleResizeAndRender() {
      this.resizeScheduled || (this.resizeScheduled = !0, this.resizeFrame = requestAnimationFrame(() => {
        this.resizeScheduled = !1, !this.disposed && (this.resizeCanvas(), this.render());
      }));
    },
    // Re-fit the LiteGraph node to the DOM widget's current content height. The
    // DOM widget reports Math.max(700, root.scrollHeight) from getHeight(), but
    // ComfyUI only re-reads that on a layout pass -- so a resizable panel that
    // just grew (the Outliner list, the camera-preview strip) needs to ask for
    // one explicitly or the node clips the taller content behind a scrollbar.
    refitNode() {
      if (this.disposed) return;
      const z = this.node;
      try {
        if (z && typeof z.computeSize == "function" && typeof z.setSize == "function") {
          const I = z.computeSize();
          Array.isArray(I) && z.setSize([z.size?.[0] ?? I[0], I[1]]);
        }
        z?.graph?.setDirtyCanvas?.(!0, !0);
      } catch {
      }
      this.scheduleResizeAndRender();
    },
    resizeCanvas() {
      const z = this.root.querySelector(".viewport-wrap");
      if (!z) return;
      const I = Math.min(2, window.devicePixelRatio || 1), S = z.clientWidth || 320, w = z.clientHeight || 180, C = Math.max(320, Math.round(S * I)), $ = Math.max(180, Math.round(w * I));
      (this.canvas.width !== C || this.canvas.height !== $) && (this.canvas.width = C, this.canvas.height = $);
      for (const U of this.cameraPreviewCanvases.values()) {
        const Z = U.clientWidth || 220, B = U.clientHeight || 124, Q = Math.max(I, dg / Math.max(1, Z)), Se = Math.max(1, Math.round(Z * Q)), Be = Math.max(1, Math.round(B * Q));
        (U.width !== Se || U.height !== Be) && (U.width = Se, U.height = Be);
      }
      this.drawCurveEditor();
    }
  };
}
function xi(e) {
  e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshKeyEditor(), e.refreshInspector(), e.drawCurveEditor(), e.render();
}
function pg(e, t) {
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a) return;
  e.checkpoint("Reset camera animation"), e.finishCameraEdit();
  const o = Ar();
  o.position = [0, 0, 0], o.target = [0, 0, -1], a.camera = ce(o), a.keyframes = [{ frame: 0, camera: ce(o), interpolation: "ease" }], e.state.active_camera_id = a.id, e.state.camera = ce(o), e.state.keyframes = a.keyframes, e.camera = ce(o), e.frame = 0, e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = 0, e.editingKeyFrame = null, e.cameraEditKey = null, e.cameraEditActive = !1, e.cameraPreviewSignature = "", xi(e), e.refreshCameraSelectors(), e.setStatus(s(`${a.name} animation reset`));
}
function fg(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint("Reset object animation"), a.keyframes = [], a.position = [0, 0, 0], a.rotation = [0, 0, 0], e.frame = 0, e.selectedEntity = "object", e.selectedObjectId = a.id, e.selectedKeyFrame = null, e.editingKeyFrame = null, xi(e), e.setStatus(s(`${a.name || a.type} animation reset`)));
}
const wi = 1e-9;
function hg(e, t) {
  if (t === "object") {
    const o = e.transform || {};
    return [
      ...(o.position || [0, 0, 0]).map(Number),
      ...(o.rotation || [0, 0, 0]).map(Number),
      ...(o.size || [1, 1, 1]).map(Number)
    ];
  }
  const a = e.camera || {};
  return [
    ...(a.position || [0, 0, 0]).map(Number),
    ...(a.target || [0, 0, 0]).map(Number),
    Number(a.fov) || 0,
    Number(a.roll) || 0,
    Number(a.zoom) || 1
  ];
}
function ug(e) {
  const t = e[0]?.length || 0, a = new Array(t).fill(1);
  for (let o = 0; o < t; o += 1) {
    let r = 1 / 0, n = -1 / 0;
    for (const c of e) {
      const l = Number.isFinite(c[o]) ? c[o] : 0;
      l < r && (r = l), l > n && (n = l);
    }
    const i = n - r;
    a[o] = i > wi ? 1 / i : 0;
  }
  return a;
}
function Xr(e, t) {
  const a = e.map((i) => hg(i, t)), o = ug(a), r = e.map((i) => i.frame), n = Math.max(1, r[r.length - 1] - r[0]);
  return a.map((i, c) => [
    (r[c] - r[0]) / n,
    ...i.map((l, p) => (Number.isFinite(l) ? l : 0) * o[p])
  ]);
}
function Gn(e, t) {
  let a = 0;
  for (let o = 0; o < e.length; o += 1) a += (e[o] - t[o]) ** 2;
  return Math.sqrt(a);
}
function Jr(e, t, a) {
  let o = 0;
  for (let c = 0; c < t.length; c += 1) o += (a[c] - t[c]) ** 2;
  if (o <= wi) return Gn(e, t);
  let r = 0;
  for (let c = 0; c < t.length; c += 1) r += (e[c] - t[c]) * (a[c] - t[c]);
  const n = Math.max(0, Math.min(1, r / o)), i = t.map((c, l) => c + (a[l] - c) * n);
  return Gn(e, i);
}
function bg(e, t, a) {
  const o = /* @__PURE__ */ new Set([0, e.length - 1]), r = [[0, e.length - 1]];
  for (; r.length; ) {
    const [n, i] = r.pop();
    if (i - n < 2) continue;
    let c = -1, l = -1;
    for (let p = n + 1; p < i; p += 1) {
      const m = Jr(e[p], e[n], e[i]);
      m > c && (c = m, l = p);
    }
    l < 0 || (c > t || a.has(l)) && (o.add(l), r.push([n, l], [l, i]));
  }
  return o;
}
function gg(e, t, { tolerance: a = 0.02, keepFrames: o = [] } = {}) {
  const r = [...e].sort((m, f) => m.frame - f.frame);
  if (r.length <= 2 || a <= 0) return { keys: r, removed: 0 };
  const n = Xr(r, t), i = /* @__PURE__ */ new Set(), c = new Set(o);
  r.forEach((m, f) => {
    c.has(m.frame) && i.add(f);
  });
  const l = bg(n, a, i);
  for (const m of i) l.add(m);
  const p = r.filter((m, f) => l.has(f));
  return { keys: p, removed: r.length - p.length };
}
function yg(e, t, { target: a = 2, keepFrames: o = [] } = {}) {
  let r = [...e].sort((l, p) => l.frame - p.frame);
  const n = Math.max(2, Math.round(a));
  if (r.length <= n) return { keys: r, removed: 0 };
  const i = new Set(o), c = r.length;
  for (; r.length > n; ) {
    const l = Xr(r, t);
    let p = -1, m = 1 / 0;
    for (let f = 1; f < r.length - 1; f += 1) {
      if (i.has(r[f].frame)) continue;
      const d = Jr(l[f], l[f - 1], l[f + 1]);
      d < m && (m = d, p = f);
    }
    if (p < 0) break;
    r = r.filter((f, d) => d !== p);
  }
  return { keys: r, removed: c - r.length };
}
function vg(e, t, { mergeWithin: a = 1, epsilon: o = 1e-3, keepFrames: r = [] } = {}) {
  const n = [...e].sort((d, h) => d.frame - h.frame), i = n.length, c = new Set(r), l = [];
  for (const d of n) {
    const h = l[l.length - 1];
    h && d.frame - h.frame <= Math.max(0, a) && !c.has(d.frame) || l.push(d);
  }
  if (l.length <= 2) return { keys: l, removed: i - l.length };
  const p = Xr(l, t), m = /* @__PURE__ */ new Set();
  for (let d = 1; d < l.length - 1; d += 1) {
    if (c.has(l[d].frame)) continue;
    const h = m.has(d - 1) ? null : d - 1;
    if (h === null) continue;
    Jr(p[d], p[h], p[d + 1]) <= o && m.add(d);
  }
  const f = l.filter((d, h) => !m.has(h));
  return { keys: f, removed: i - f.length };
}
function xg(e, t, { minKeys: a = 0 } = {}) {
  const o = new Set(t), r = e.filter((n) => !o.has(n.frame));
  if (r.length < a) {
    const n = e.filter((i) => o.has(i.frame)).sort((i, c) => i.frame - c.frame);
    for (; r.length < a && n.length; ) r.push(n.shift());
    r.sort((i, c) => i.frame - c.frame);
  }
  return { keys: r, removed: e.length - r.length };
}
function wg(e, t, a, { lastFrame: o = 1 / 0 } = {}) {
  const r = [...t].sort((m, f) => m - f);
  if (!a || !r.length)
    return { keys: [...e], moved: 0, frames: r };
  const n = new Set(r), i = new Set(e.filter((m) => !n.has(m.frame)).map((m) => m.frame)), c = r.map((m) => m + a);
  return c.some((m) => m < 0 || m > o || i.has(m)) || new Set(c).size !== c.length ? { keys: [...e], moved: 0, frames: r } : { keys: e.map((m) => n.has(m.frame) ? { ...m, frame: m.frame + a } : m).sort((m, f) => m.frame - f.frame), moved: r.length, frames: c.sort((m, f) => m - f) };
}
function kg(e, t, a) {
  const o = new Set(t);
  return e.map((r) => o.has(r.frame) ? { ...r, interpolation: a } : r);
}
function Sg(e, t, a, o = []) {
  const r = new Set(t);
  return e.map((n) => {
    if (!r.has(n.frame)) return n;
    const i = { mode: a, channels: { ...n.tangents?.channels || {} } };
    for (const l of o)
      i.channels[l] = { ...i.channels[l] || {}, mode: a };
    const c = a !== "auto" && n.interpolation !== "bezier" ? "bezier" : n.interpolation;
    return { ...n, interpolation: c, tangents: i };
  });
}
function kt(e, t, a) {
  return [0, 1, 2].map((o) => e[o] + (t[o] - e[o]) * a);
}
function jg(e, t, a, o, r) {
  const n = kt(e, t, r), i = kt(t, a, r), c = kt(a, o, r), l = kt(n, i, r), p = kt(i, c, r), m = kt(l, p, r);
  return { left: [e, n, l, m], right: [m, p, c, o], point: m };
}
function _g(e, t, a, o) {
  const r = new Set(e.map((c) => c.frame)), n = Math.min(a - 1, Math.max(t + 1, o));
  if (!r.has(n)) return n;
  const i = a - t;
  for (let c = 1; c < i; c += 1)
    for (const l of [n - c, n + c])
      if (!(l <= t || l >= a) && !r.has(l))
        return l;
  return -1;
}
function Cg(e, { leftFrame: t, rightFrame: a, t: o = 0.5 } = {}) {
  const r = [...e].sort((k, g) => k.frame - g.frame), n = r.findIndex((k) => k.frame === t), i = n >= 0 ? n + 1 : -1;
  if (n < 0 || i < 0 || i >= r.length || r[i].frame !== a)
    return { ok: !1, reason: "segment_not_found" };
  if (a - t < 2)
    return { ok: !1, reason: "no_free_frame" };
  const c = Math.min(0.999, Math.max(1e-3, Number.isFinite(o) ? o : 0.5)), l = Math.round(t + c * (a - t)), p = _g(r, t, a, l);
  if (p < 0) return { ok: !1, reason: "no_free_frame" };
  const m = (p - t) / (a - t), f = r[n], d = r[i], h = n > 0 ? r[n - 1] : null, u = i + 1 < r.length ? r[i + 1] : null, b = f.interpolation === "bezier" || d.interpolation === "bezier", v = $e({ keyframes: r }, p), y = { frame: p, interpolation: b ? "bezier" : f.interpolation, camera: v };
  if (b) {
    const k = [...f.camera.position], g = jr(f, h, d).out, _ = jr(d, f, u).in, A = [...d.camera.position], K = jg(k, g, _, A, m);
    y.camera = { ...ce(v), position: [...K.point] };
    const F = pt(f);
    (F === "free" || F === "aligned") && ko(f, "out", K.left[1]);
    const J = pt(d);
    (J === "free" || J === "aligned") && ko(d, "in", K.right[2]), ko(y, "in", K.left[2]), ko(y, "out", K.right[1]);
  }
  return { ok: !0, keys: [...r, y].sort((k, g) => k.frame - g.frame), frame: p };
}
const Zr = [0, 1, 0], ki = [
  "static",
  "dolly_in",
  "dolly_out",
  "truck_left",
  "truck_right",
  "pedestal_up",
  "pedestal_down",
  "crane_up",
  "crane_down",
  "arc_left",
  "arc_right",
  "orbit",
  "spiral"
], Yn = {
  static: "Static",
  dolly_in: "Dolly In",
  dolly_out: "Dolly Out",
  truck_left: "Truck Left",
  truck_right: "Truck Right",
  pedestal_up: "Pedestal Up",
  pedestal_down: "Pedestal Down",
  crane_up: "Crane Up",
  crane_down: "Crane Down",
  arc_left: "Arc Left",
  arc_right: "Arc Right",
  orbit: "Orbit",
  spiral: "Spiral"
};
function Eg(e, t) {
  const a = [...e.position], o = Array.isArray(t) ? [...t] : [...e.target], r = Fe(o, a), n = Ve(r) > 1e-9 ? Jo(r) : [0, 0, -1];
  let i = rn(n, Zr);
  Ve(i) < 1e-6 && (i = [1, 0, 0]), i = Jo(i);
  const c = Jo(rn(i, n));
  return { position: a, target: o, forward: n, right: i, up: c };
}
function Ag(e) {
  return {
    fov: e.fov,
    roll: e.roll || 0,
    zoom: e.zoom || 1,
    near: e.near,
    far: e.far,
    camera_type: e.camera_type || "perspective"
  };
}
function Tg(e) {
  return [
    { position: e.position, target: e.target },
    { position: e.position, target: e.target }
  ];
}
function Xn(e, t, a) {
  const o = a === "out" ? -1 : 1, r = fe(e.position, Ko(e.forward, o * t));
  return [
    { position: e.position, target: e.target },
    { position: r, target: e.target }
  ];
}
function Jn(e, t, a) {
  const o = a === "right" ? 1 : -1, r = Ko(e.right, o * t);
  return [
    { position: e.position, target: e.target },
    { position: fe(e.position, r), target: fe(e.target, r) }
  ];
}
function Zn(e, t, a) {
  const r = Ko(Zr, (a === "down" ? -1 : 1) * t);
  return [
    { position: e.position, target: e.target },
    { position: fe(e.position, r), target: fe(e.target, r) }
  ];
}
function Qn(e, t, a) {
  const o = a === "down" ? -1 : 1, r = fe(e.position, Ko(Zr, o * t));
  return [
    { position: e.position, target: e.target },
    { position: r, target: e.target }
  ];
}
function So(e, { degrees: t = 180, direction: a = "cw", radius: o, radiusEnd: r, heightOffset: n = 0, samples: i = 5, close: c = !1 } = {}) {
  const l = e.target, p = e.position[0] - l[0], m = e.position[2] - l[2], f = Math.hypot(p, m) || 1e-6, d = Math.atan2(m, p), h = Number.isFinite(o) ? o : f, u = Number.isFinite(r) ? r : h, b = a === "ccw" ? 1 : -1, v = Math.abs(t) * Math.PI / 180 * b, y = Math.max(2, Math.round(i)), x = e.position[1] + n, k = [];
  for (let g = 0; g < y; g += 1) {
    const _ = c ? g / y : g / (y - 1), A = d + v * _, K = h + (u - h) * _;
    k.push({
      position: [l[0] + Math.cos(A) * K, x, l[2] + Math.sin(A) * K],
      target: [...l]
    });
  }
  return k;
}
function $g({ type: e, camera: t, target: a, startFrame: o, endFrame: r, params: n = {} } = {}) {
  if (!ki.includes(e)) return { ok: !1, reason: "unknown_preset" };
  if (!t || !Array.isArray(t.position) || !Array.isArray(t.target)) return { ok: !1, reason: "invalid_camera" };
  const i = Math.round(Number(o)), c = Math.round(Number(r));
  if (!Number.isFinite(i) || !Number.isFinite(c) || c <= i) return { ok: !1, reason: "invalid_range" };
  const l = Eg(t, a), p = Number(n.distance) > 0 ? Number(n.distance) : 1, m = (b, v, y) => ({
    degrees: Number(n.degrees) || b,
    direction: v,
    radius: Number.isFinite(Number(n.radius)) ? Number(n.radius) : void 0,
    heightOffset: Number(n.heightOffset) || 0,
    samples: Number(n.samples) || y
  });
  let f;
  switch (e) {
    case "static":
      f = Tg(l);
      break;
    case "dolly_in":
      f = Xn(l, p, "in");
      break;
    case "dolly_out":
      f = Xn(l, p, "out");
      break;
    case "truck_left":
      f = Jn(l, p, "left");
      break;
    case "truck_right":
      f = Jn(l, p, "right");
      break;
    case "pedestal_up":
      f = Zn(l, p, "up");
      break;
    case "pedestal_down":
      f = Zn(l, p, "down");
      break;
    case "crane_up":
      f = Qn(l, p, "up");
      break;
    case "crane_down":
      f = Qn(l, p, "down");
      break;
    case "arc_left":
      f = So(l, m(45, "ccw", 5));
      break;
    case "arc_right":
      f = So(l, m(45, "cw", 5));
      break;
    case "orbit":
      f = So(l, { ...m(180, n.direction === "ccw" ? "ccw" : "cw", 5), close: !!n.close });
      break;
    case "spiral":
      f = So(l, {
        ...m(360, n.direction === "ccw" ? "ccw" : "cw", 8),
        radiusEnd: Number.isFinite(Number(n.radiusEnd)) ? Number(n.radiusEnd) : void 0
      });
      break;
    default:
      return { ok: !1, reason: "unknown_preset" };
  }
  if (c - i + 1 < f.length) return { ok: !1, reason: "insufficient_frame_slots" };
  const d = f.map((b, v) => f.length <= 1 ? i : Math.round(i + (c - i) * v / (f.length - 1)));
  for (let b = 1; b < d.length; b += 1) d[b] <= d[b - 1] && (d[b] = d[b - 1] + 1);
  for (let b = d.length - 1; b > 0; b -= 1) d[b] > c - (d.length - 1 - b) && (d[b] = c - (d.length - 1 - b));
  d[0] = i, d[d.length - 1] = c;
  const h = Ag(t);
  return { ok: !0, keyframes: f.map((b, v) => ({
    frame: d[v],
    interpolation: "smooth",
    camera: { position: b.position, target: b.target, ...h }
  })) };
}
const es = { motion: "motion", shot: "display", health: "health" }, Mg = {
  object: "Object",
  camera: "Camera",
  camera_target: "Look-At Target",
  camera_path: "Camera Path"
}, Ig = { motion: "Motion", shot: "Shot", health: "Health" }, Og = ["entity", "motion", "shot", "health"];
function Si(e) {
  return e.inspectorMode && e.inspectorMode !== "entity" ? e.inspectorMode : "entity";
}
function Pg(e) {
  const t = Si(e);
  return es[t] ? es[t] : e.selectedEntity === "object" ? "scene" : "camera";
}
function Lg(e) {
  return [
    e.selectedEntity || "",
    e.selectedObjectId || "",
    e.selectedKeyFrame ?? "",
    [...e.selectedObjectIds || []].sort().join(",")
  ].join("|");
}
function Ng(e) {
  const t = Lg(e);
  e._lastInspectorSelKey !== void 0 && e._lastInspectorSelKey !== t && (e.inspectorMode = "entity"), e._lastInspectorSelKey = t, ji(e);
}
function ji(e) {
  const t = Pg(e);
  for (const n of e.root.querySelectorAll("[data-tab-panel]"))
    n.hidden = n.dataset.tabPanel !== t;
  const a = t === "motion";
  e.root.classList.toggle("oc-motion-mode", a), !a && (e.state?.motion_tool || "select") !== "select" && (e.state.motion_tool = "select", e.motionTrackDraft = null);
  const o = Si(e);
  for (const n of e.root.querySelectorAll("[data-inspector-mode]")) {
    const i = n.dataset.inspectorMode === o;
    n.classList.toggle("active", i), n.setAttribute("aria-pressed", String(i));
  }
  const r = e.root.querySelector('[data-role="inspector-title"]');
  r && (r.textContent = o === "entity" ? s(Mg[e.selectedEntity] || "Inspector") : s(Ig[o] || "Inspector"));
}
function zg(e, t) {
  e.inspectorMode = Og.includes(t) ? t : "entity", ji(e), e.render?.(), e.refitNode?.();
}
function Fg(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: f, playblastCameraTrack: d, restoreFromWidgets: h, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: v, bindEditorEvents: y, activateCamera: x, addCamera: k, deleteCamera: g, drawPreviewOverlays: _, duplicateCamera: A, maximizeCameraPreview: K, refreshCameraPreviews: F, refreshCameraSelectors: J, renameCamera: H, setPlayblastCamera: M, toggleCameraView: P, captureRealtime: j, makePlayblast: R, uploadDirectorPlayblast: q, waitForMediaFrame: G, computeAudioPeaks: L, loadAudioFile: E, releaseAudio: Y, stopPlay: D, togglePlay: X, applyCameraPreset: te, applyCameraShake: le, applyProxyPreset: se, clearViewportBgImage: re, loadViewportBgFile: de, loadViewportBgSequence: ge, drawCameraPath: he, drawCard: ye, drawCube: ve, drawGrid: pe, drawHuman: Me, drawLine3D: xe, drawNull: we, drawOverlays: be, drawPointField: N, drawSpeedHeatmap: V, drawSphere: me, curveChannels: _e, drawCurveEditor: Pe, onCurvePointerDown: Ke, onCurvePointerMove: Le, onCurvePointerUp: st, onTimelinePointerDown: ta, onTimelinePointerMove: aa, onTimelinePointerUp: oa, refreshKeys: $t, resetCurveZoom: Mt, resetTimelineZoom: ut, setChannelFilter: It, setCurveInterpolation: Ot, setTangentMode: Pt, timelineFrameFromEvent: ra, toggleCurveHandles: Lt, zoomCurve: na, drawTransformGizmo: sa, frameTarget: ia, gizmoAxes: ca, gizmoGeometry: la, onPointerDown: da, onPointerMove: ma, onPointerUp: pa, onWheel: fa, pickGizmo: ha, pickSceneObject: ua, resetCamera: Nt, setTransformMode: zt, setViewMode: ba, viewportCamera: ga, loadCardFile: Wo, loadExecutionPreview: Vo, loadMediaUrl: ya, loadModelFile: va, loadSelectedReference: xa, onModelLoaded: wa, restoreAssets: ka, syncUpstreamInputs: Sa, configureDomMedia: ja, refreshSetupDiagnostic: Ft, addMediaCard: _a, addPrimitive: Ca, applyObjectAnimationFrame: Ea, beginCameraEdit: Aa, beginObjectEdit: Ta, commitCameraEdit: $a, commitObjectEdit: Ma, copyKeyframe: Ia, deleteKeyframe: Oa, deleteObject: Pa, deleteSelectedObjects: La, duplicateObject: Na, exitKeyEdit: za, finishCameraEdit: Fa, goToAdjacentKey: Ra, insertKeyframe: Da, loadSelectedKeyView: Ka, pasteKeyframe: Ba, playblastCameraAtFrame: qa, refreshInspector: Ua, refreshKeyEditor: Wa, refreshObjects: Va, removeObjectResources: Ha, renameObject: Ga, retimeSelectedKey: Ya, selectKeyframe: Xa, selectedKeyframe: Ja, selectedObject: Za, selectObjectAnimation: Qa, setKeyInterpolation: eo, setKeyTangentMode: to, setObjectParent: it, timelineKeyframes: ao, timelineObject: oo, toggleAutoKey: ro, toggleObject: no, updateCameraFromHud: so, updateCameraRotationFromHud: io, updateEditState: co, updateKeyVisualState: Rt, updateSelectedKey: lo, updateSelectedObject: mo, clamp: po, cloneCamera: Je, configureCore: Ho, defaultCamera: bt, sampleCamera: Ne, sampleObjectTransform: z, sanitizeState: I, worldTransform: S } = e;
  return {
    setChannelFilter(w) {
      It(this, w);
    },
    setFrame(w, C = !1, $ = !0) {
      this.frame = po(Math.round(w), 0, this.state.duration_frames - 1), this.editingKeyFrame !== this.frame && (this.editingKeyFrame = null), this.camera = Ne(this.activeCameraTrack(), this.frame, this.state.objects), Ht(this, this.activeCameraTrack(), this.camera, this.frame), this.applyObjectAnimationFrame();
      const U = this.dom ||= Us(this.root);
      for (const ae of U.frames) document.activeElement !== ae && (ae.value = String(this.frame));
      for (const ae of U.scrubs) ae.value = String(this.frame);
      for (const ae of U.cameraFov) document.activeElement !== ae && (ae.value = String(Math.round(this.camera.fov * 100) / 100));
      for (const ae of U.cameraRoll) document.activeElement !== ae && (ae.value = String(Math.round((this.camera.roll || 0) * 100) / 100));
      for (const ae of U.cameraFocal) document.activeElement !== ae && (ae.value = Lr(this.camera.fov));
      for (const ae of U.viewportZoom) ae.textContent = `${(Number(this.camera.zoom) || 1).toFixed(2)}x`;
      for (const ae of U.cameraType) document.activeElement !== ae && (ae.value = this.camera.camera_type || "perspective");
      for (const ae of U.cameraNear) document.activeElement !== ae && (ae.value = String(this.camera.near ?? 0.01));
      for (const ae of U.cameraFar) document.activeElement !== ae && (ae.value = String(this.camera.far ?? 1e4));
      const Z = this.frame / this.state.fps;
      for (const ae of this.cardMediaById.values()) ae instanceof HTMLVideoElement && Number.isFinite(ae.duration) && ae.duration > 0 && (ae.currentTime = Z % ae.duration);
      const B = Math.floor(Z / 60), Q = Math.floor(Z % 60), Se = Math.floor(Z % 1 * 1e3), Be = this.frame % Math.max(1, Math.round(this.state.fps)), ct = Math.floor(this.frame / this.state.fps);
      if ((U.time || this.root.querySelector('[data-role="time"]')).textContent = this.state.timecode_mode === "timecode" ? `${String(Math.floor(ct / 3600)).padStart(2, "0")}:${String(Math.floor(ct / 60) % 60).padStart(2, "0")}:${String(ct % 60).padStart(2, "0")}:${String(Be).padStart(2, "0")}` : `${String(B).padStart(2, "0")}:${String(Q).padStart(2, "0")}.${String(Se).padStart(3, "0")}`, $) this.refreshKeys();
      else {
        Mo(this);
        for (const ae of this.root.querySelectorAll("[data-key-frame]")) {
          const ne = Number(ae.dataset.keyFrame);
          ae.classList.toggle("at-playhead", ne === this.frame), ae.classList.toggle("selected", ne === this.selectedKeyFrame), ae.classList.toggle("editing", ne === this.editingKeyFrame);
        }
        this.refreshKeyEditor(), this.drawCurveEditor();
      }
      C || this.serialize(), this.refreshInspector(), C && this.playing && !this.recording ? this.requestRender("frame") : this.render();
    },
    timelineObject() {
      return oo(this);
    },
    timelineKeyframes() {
      return ao(this);
    },
    // The camera key the playhead is parked on, or null when between keys.
    // The new-key interpolation select branches on this directly; other camera
    // edits go through beginCameraEdit(), which resolves the same auto-key vs.
    // transient-preview question consistently (and always checkpoints/serializes).
    activeKeyframe() {
      return (this.activeCameraTrack()?.keyframes || []).find((C) => C.frame === this.frame) || null;
    },
    applyObjectAnimationFrame() {
      Ea(this, z);
    },
    insertKeyframe() {
      for (const w of this.root.querySelectorAll('[data-act="key"]'))
        w.classList.remove("key-pulse"), w.offsetWidth, w.classList.add("key-pulse");
      Da(this);
    },
    setKeyInterpolation(w) {
      eo(this, w);
    },
    setKeyTangentMode(w) {
      to(this, w);
    },
    deleteKeyframe() {
      Oa(this);
    },
    copyKeyframe() {
      Ia(this);
    },
    pasteKeyframe() {
      Ba(this);
    },
    resetCamera() {
      Nt(this, bt);
    },
    resetCameraAnimation(w) {
      pg(this, w);
    },
    resetObjectAnimation(w) {
      fg(this, w);
    },
    selectedKeyframe() {
      return Ja(this);
    },
    selectKeyframe(w) {
      Xa(this, w);
    },
    beginCameraEdit() {
      return Aa(this);
    },
    commitCameraEdit() {
      $a(this);
    },
    finishCameraEdit() {
      Fa(this);
    },
    exitKeyEdit(w = !1) {
      za(this, w);
    },
    toggleAutoKey() {
      ro(this);
    },
    updateEditState() {
      co(this);
    },
    updateKeyVisualState() {
      Rt(this);
    },
    curveChannels() {
      return _e(this);
    },
    drawCurveEditor() {
      Pe(this);
    },
    onCurvePointerDown(w) {
      Ke(this, w);
    },
    onCurvePointerMove(w) {
      Le(this, w);
    },
    onCurvePointerUp(w) {
      st(this, w);
    },
    setCurveInterpolation(w) {
      Ot(this, w);
    },
    setTangentMode(w) {
      Pt(this, w);
    },
    // Spatial Bézier handle mode (Auto Smooth / Aligned / Free / Corner) for the
    // selected camera keyframe -- the viewport curve, not the timeline F-curve.
    setSpatialHandleMode(w) {
      if (!Uo.includes(w)) return;
      const $ = this.activeCameraTrack()?.keyframes || [], U = $.findIndex((Z) => Z.frame === this.selectedKeyFrame);
      if (U < 0) {
        this.setStatus(s("Select a camera keyframe first"));
        return;
      }
      this.checkpoint(s("Camera path handle: {mode}").replace("{mode}", w)), cg($[U], w, {
        prevKey: $[U - 1] || null,
        nextKey: $[U + 1] || null
      }), this.webgl && (this.webgl.pathKey = ""), this.serialize(), this.refreshKeys(), this.setFrame(this.frame, !1, !1), this.render(), this.setStatus(s("Curve handle updated"));
    },
    // Called from the viewport drag loop (viewport-controls/interactions.js) so
    // that eagerly-loaded module needs no static import of the curve maths.
    dragCurveHandle(w, C, $, U) {
      ig(w, C, $, U || {});
    },
    // Position/Target component toggle for the primary selected path key (plan
    // section 12.1). Only ever changes which point a translate gizmo attaches
    // to (see transform-target.js's path_point_target); it never mutates a
    // keyframe, so no checkpoint/undo entry is needed here.
    setPathSelectionComponent(w) {
      this.pathSelection = al(this.pathSelection, w), this.refreshInspector(), this.render();
    },
    // Double-click on the rendered path between two keys inserts a new camera
    // key there (plan section 26 Task 8). Returns false (and does nothing) when
    // the cursor isn't over a path segment, so the caller can fall back to its
    // other double-click behaviour (setTargetAtCursor).
    insertPathKeyAtCursor(w) {
      if (!w || !this.webgl?.pickPathSegment) return !1;
      const C = this.interactionElement.getBoundingClientRect(), $ = (w.clientX - C.left) * this.canvas.width / Math.max(1, C.width), U = (w.clientY - C.top) * this.canvas.height / Math.max(1, C.height), Z = this.webgl.pickPathSegment([$, U]);
      if (!Z) return !1;
      const B = (this.state.cameras || []).find((Se) => Se.id === Z.cameraId);
      if (!B || B.locked) return !1;
      const Q = Cg(B.keyframes || [], {
        leftFrame: Z.leftFrame,
        rightFrame: Z.rightFrame,
        t: Z.t
      });
      return Q.ok ? (this.checkpoint(s("Insert camera path key")), B.id !== this.state.active_camera_id && this.activateCamera(B.id), B.keyframes = Q.keys, this.state.keyframes = Q.keys, this.camera = Ne(B, this.frame, this.state.objects), B.camera = Je(this.camera), tl(this, { cameraId: B.id, frame: Q.frame, additive: !1 }), this.serialize(), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(s("Camera path key inserted at frame {frame}").replace("{frame}", String(Q.frame))), !0) : (this.setStatus(Q.reason === "no_free_frame" ? s("No free frame here to insert a key") : s("Could not insert a key here")), !0);
    },
    // Select the active camera's whole path as one transform target. The gizmo
    // only draws in an editor view, so a shot-camera view drops to perspective.
    selectCameraPath() {
      return this.activeCameraTrack()?.keyframes?.length >= 1 ? (this.finishCameraEdit(), this.selectedEntity = "camera_path", this.selectedObjectId = null, this.selectedObjectIds = /* @__PURE__ */ new Set(), this.editingKeyFrame = null, this.state.view_mode === "camera" && this.setViewMode("perspective"), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), !0) : !1;
    },
    // One affine transform applied to every keyframe of the active path at once
    // (options: { mode, delta | factors | rotationDeg }; origin defaults to the
    // path centroid). Backs the path gizmo's numeric / keyboard entry.
    transformCameraPath(w) {
      const C = this.activeCameraTrack();
      if (!C || C.locked || !(C.keyframes?.length >= 1)) return !1;
      this.checkpoint("Transform camera path");
      const $ = hs(C.keyframes, { origin: ps(C.keyframes), ...w });
      return C.keyframes = $, C.id === this.state.active_camera_id && (this.state.keyframes = $), this.camera = Ne(C, this.frame, this.state.objects), C.camera = Je(this.camera), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.renderCameraView?.(), !0;
    },
    // "Redistribute Timing" (plan section 26 Task 10 / spec section 14.3):
    // reflows the active camera's own existing key range using each key's
    // authoring Timing Weight, never touching any other camera or object.
    redistributeActiveCameraTiming() {
      const w = this.activeCameraTrack();
      if (!w || w.locked || !(w.keyframes?.length >= 2))
        return w?.keyframes?.length < 2 && this.setStatus(s("Need at least two keys to redistribute timing")), !1;
      const C = [...w.keyframes].sort((U, Z) => U.frame - Z.frame), $ = el(C, {
        startFrame: C[0].frame,
        endFrame: C[C.length - 1].frame
      });
      return $.ok ? (this.checkpoint(s("Redistribute camera path timing")), w.keyframes = $.keys, w.id === this.state.active_camera_id && (this.state.keyframes = $.keys), this.camera = Ne(w, this.frame, this.state.objects), w.camera = Je(this.camera), this.serialize(), this.refreshKeys(), this.refreshKeyEditor(), this.refreshInspector(), this.render(), this.setStatus(s("Camera path timing redistributed")), !0) : (this.setStatus($.reason === "insufficient_frame_slots" ? s("Not enough frame slots to redistribute this many keys") : s("Could not redistribute timing")), !1);
    },
    // Camera Path Presets (plan section 26 Task 11 / spec section 17): a
    // single compact picker over every preset type instead of one toolbar
    // button per preset. Generated keys are ordinary camera keyframes -- fully
    // editable afterward by the regular point/curve/timing tools -- covering
    // the active camera's current playback range by default.
    async openCameraPathPresetPicker() {
      const w = this.activeCameraTrack();
      if (!w || w.locked)
        return this.setStatus(s("{name} is locked").replace("{name}", w?.name || s("Camera"))), !1;
      const C = ki.map((U) => ({ id: U, label: s(Yn[U] || U) })), $ = await vs({ title: s("Camera Path Preset"), items: C, owner: this });
      return $ ? this.applyCameraPathPreset($) : !1;
    },
    applyCameraPathPreset(w, C = {}) {
      const $ = this.activeCameraTrack();
      if (!$ || $.locked)
        return this.setStatus(s("{name} is locked").replace("{name}", $?.name || s("Camera"))), !1;
      const [U, Z] = xr(this.state), B = $g({ type: w, camera: this.camera, startFrame: U, endFrame: Z, params: C });
      return B.ok ? (this.checkpoint(s("Apply camera path preset")), $.keyframes = B.keyframes, $.id === this.state.active_camera_id && (this.state.keyframes = B.keyframes), this.camera = Ne($, this.frame, this.state.objects), $.camera = Je(this.camera), this.serialize(), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(s("{preset} camera path generated").replace("{preset}", s(Yn[w] || w))), !0) : (this.setStatus(B.reason === "insufficient_frame_slots" ? s("Not enough frames in the playback range for this preset") : s("Could not generate that camera path preset")), !1);
    },
    toggleCurveHandles() {
      Lt(this);
    },
    onTimelineWheel(w) {
      onTimelineWheel(this, w);
    },
    resetTimelineZoom() {
      ut(this);
    },
    toggleInspector(w) {
      const C = this.root.querySelector('[data-role="viewport-inspector"]');
      if (!C) return;
      const $ = w !== void 0 ? w : C.dataset.collapsed !== "true";
      C.dataset.collapsed = String($);
      for (const U of this.root.querySelectorAll('[data-act="toggle-inspector"]'))
        U.classList.toggle("active", !$), U.setAttribute("aria-pressed", String(!$));
      this.setStatus($ ? "Inspector hidden (N)" : "Inspector shown");
    },
    refreshKeys() {
      $t(this);
    },
    refreshKeyEditor() {
      Wa(this);
    },
    retimeSelectedKey(w, C = !1) {
      Ya(this, w, C);
    },
    updateSelectedKey() {
      lo(this);
    },
    updateKeyFromView() {
      updateKeyFromView(this);
    },
    loadSelectedKeyView() {
      Ka(this);
    },
    goToAdjacentKey(w) {
      Ra(this, w);
    },
    addPrimitive(w) {
      Ca(this, w);
    },
    async renameObject(w) {
      return Ga(this, w);
    },
    duplicateObject(w) {
      Na(this, w);
    },
    toggleObject(w) {
      no(this, w);
    },
    showAllObjects() {
      const w = this.state.objects.filter((C) => C.enabled === !1);
      if (w.length) {
        this.checkpoint("Show all objects");
        for (const C of w) C.enabled = !0;
        this.serialize(), this.refreshObjects(), this.render(), this.setStatus("All objects shown");
      }
    },
    selectHierarchy(w = this.selectedObjectId) {
      if (!w) return;
      const C = /* @__PURE__ */ new Set([w]);
      let $ = !0;
      for (; $; ) {
        $ = !1;
        for (const U of this.state.objects)
          U.parent_id && C.has(U.parent_id) && !C.has(U.id) && (C.add(U.id), $ = !0);
      }
      this.selectedObjectIds = C, this.selectedObjectId = w, this.selectedEntity = "object", this.refreshObjects(), this.refreshInspector(), this.render(), this.setStatus(`Hierarchy selected: ${C.size} object(s)`);
    },
    async deleteObject(w) {
      return Pa(this, w);
    },
    async deleteSelectedObjects() {
      return La(this);
    },
    duplicateSelectedObjects() {
      return Ib(this);
    },
    toggleSelectedObjects(w = null) {
      return Ob(this, w);
    },
    lockSelectedObjects(w = null) {
      return Pb(this, w);
    },
    selectAllObjects() {
      return Lb(this);
    },
    deselectAll() {
      return gi(this);
    },
    invertSelection() {
      return Nb(this);
    },
    addMediaCard() {
      _a(this);
    },
    selectedObject() {
      return Za(this);
    },
    playblastCameraAtFrame() {
      return Ht(this, d(this), qa(this, Ne), this.frame);
    },
    viewportCamera() {
      return ga(this);
    },
    setViewMode(w) {
      ba(this, w);
    },
    toggleCameraView() {
      P(this);
    },
    setDensity(w) {
      ["basic", "animation", "advanced"].includes(w) || (w = "advanced"), this.state.ui_density = w, this.root.dataset.density = w, this.root.querySelector('[data-role="ui-density"]').value = w;
      const C = this.root.querySelector("[data-inspector-mode].active");
      C && getComputedStyle(C).display === "none" && this.setInspectorMode("entity"), this.serialize(), requestAnimationFrame(() => {
        this.resizeCanvas(), this.render();
      }), this.setStatus(`Interface: ${w}`);
    },
    lookAtObject(w) {
      const C = this.state.objects.find(($) => $.id === w);
      if (C) {
        this.checkpoint("Look-at constraint");
        for (const $ of this.state.cameras)
          for (const U of $.keyframes) U.camera.target = [...C.position || [0, 1.5, 0]];
        this.camera = Ne(this.state, this.frame), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(`Cameras look at ${C.name || C.type}`);
      }
    },
    setTransformMode(w) {
      zt(this, w);
    },
    refreshInspector() {
      this.perf && (this.perf.inspectorRefreshCount = (this.perf.inspectorRefreshCount || 0) + 1), Ua(this), Ng(this);
    },
    setInspectorMode(w) {
      zg(this, w);
    },
    updateSelectedObject() {
      mo(this);
    },
    beginObjectEdit(w) {
      return Ta(this, w);
    },
    commitObjectEdit(w) {
      Ma(this, w);
    },
    updateCameraFromHud() {
      so(this);
    },
    updateCameraRotationFromHud() {
      io(this);
    },
    selectObjectAnimation(w) {
      Qa(this, w);
    },
    setObjectParent(w) {
      it(this, w);
    },
    applyProxyPreset(w) {
      const C = { balanced: { mode: "omni_ref", burn: !1 }, parallax: { mode: "point_field", burn: !1 }, subject: { mode: "card_grid", burn: !1 }, debug: { mode: "omni_ref", burn: !0 } }, $ = C[w] || C.balanced;
      this.state.render_mode = $.mode, this.state.burn_in = $.burn, this.root.querySelector('[data-role="mode"]').value = $.mode, this.root.querySelector('[data-role="burn-in"]').checked = $.burn, this.modeWidget && (this.modeWidget.value = $.mode), this.serialize(), this.render(), this.setStatus(`Proxy preset: ${w}`);
    },
    createH3Setup() {
      this.setStatus("Connect Motion Scene and Playblast Video to OmniCam Monitor");
    },
    refreshObjects() {
      Va(this);
    },
    removeObjectResources(w) {
      Ha(this, w);
    },
    aimAtSelectedObject(w) {
      this.checkpoint("Aim & track subject");
      const C = this.activeCameraTrack(), $ = w && this.state.objects.find((B) => B.id === w) || this.selectedObject() || this.state.objects.find((B) => B.id === "subject") || this.state.objects[0];
      if (!$) return;
      C.target_object_id !== $.id && (C.aim_bone = null), C.target_object_id = $.id, C.id === this.state.active_camera_id && (this.state.target_object_id = $.id, this.state.aim_bone = C.aim_bone);
      const Z = ($.type === "model" || $.type === "glb" ? this.webgl?.getObjectWorldCenter?.($.id) : null) || ($.keyframes?.length ? z($, this.frame).position : $.position || [0, 1.5, 0]);
      this.camera.target = [...Z], this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit(), this.serialize(), this.refreshInspector(), this.updateHudCamera(), this.render(), this.setStatus(`Camera tracking locked to ${$.name || $.id}`);
    },
    setAimBone(w) {
      hb(this, w);
    },
    bakeAimConstraint(w) {
      ub(this, w);
    },
    setCameraTrackingTarget(w) {
      this.checkpoint("Change camera tracking target");
      const C = this.activeCameraTrack();
      C.target_object_id !== (w || null) && (C.aim_bone = null), C.target_object_id = w || null, C.id === this.state.active_camera_id && (this.state.target_object_id = w || null, this.state.aim_bone = C.aim_bone), this.camera = Ne(C, this.frame, this.state.objects), Ht(this, C, this.camera, this.frame), this.serialize(), this.refreshInspector(), this.render(), this.setStatus(w ? `Camera tracking: ${w}` : "Camera tracking disabled (manual target)");
    },
    bakeAimToKeyframes() {
      this.checkpoint("Bake aim to keyframes");
      const w = this.activeCameraTrack(), C = w.target_object_id || this.state.target_object_id || "subject", $ = this.state.objects.find((Z) => Z.id === C) || this.state.objects[0];
      if (!$ || !w.keyframes?.length) return;
      const U = $.type === "model" || $.type === "glb" ? this.webgl?.getObjectWorldCenter?.($.id) : null;
      for (const Z of w.keyframes) {
        const B = ($.type === "model" || $.type === "glb") && U && !$.keyframes?.length ? U : $.keyframes?.length ? z($, Z.frame).position : $.position || [0, 1.5, 0];
        Z.camera.target = [...B];
      }
      w.id === this.state.active_camera_id && (this.state.keyframes = w.keyframes), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(`Aim baked across all keyframes following ${$.name || $.id}`);
    }
  };
}
function Rg(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: f, playblastCameraTrack: d, restoreFromWidgets: h, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: v, bindEditorEvents: y, activateCamera: x, addCamera: k, deleteCamera: g, drawPreviewOverlays: _, duplicateCamera: A, maximizeCameraPreview: K, refreshCameraPreviews: F, refreshCameraSelectors: J, renameCamera: H, setPlayblastCamera: M, toggleCameraView: P, captureRealtime: j, makePlayblast: R, uploadDirectorPlayblast: q, waitForMediaFrame: G, computeAudioPeaks: L, loadAudioFile: E, releaseAudio: Y, stopPlay: D, togglePlay: X, applyCameraPreset: te, applyCameraShake: le, applyProxyPreset: se, clearViewportBgImage: re, loadViewportBgFile: de, loadViewportBgSequence: ge, drawCameraPath: he, drawCard: ye, drawCube: ve, drawGrid: pe, drawHuman: Me, drawLine3D: xe, drawNull: we, drawOverlays: be, drawPointField: N, drawSpeedHeatmap: V, drawSphere: me, curveChannels: _e, drawCurveEditor: Pe, fitCurveView: Ke, onCurveDoubleClick: Le, onCurvePointerDown: st, onCurvePointerMove: ta, onCurvePointerUp: aa, onTimelinePointerDown: oa, onTimelinePointerMove: $t, onTimelinePointerUp: Mt, refreshKeys: ut, resetCurveZoom: It, resetTimelineZoom: Ot, setChannelFilter: Pt, setCurveInterpolation: ra, setTangentMode: Lt, timelineFrameFromEvent: na, toggleCurveHandles: sa, zoomCurve: ia, drawTransformGizmo: ca, frameTarget: la, gizmoAxes: da, gizmoGeometry: ma, onPointerDown: pa, onPointerMove: fa, onPointerUp: ha, onWheel: ua, pickGizmo: Nt, pickSceneObject: zt, resetCamera: ba, setTransformMode: ga, setViewMode: Wo, viewportCamera: Vo, loadCardFile: ya, loadExecutionPreview: va, loadMediaUrl: xa, loadModelFile: wa, loadSelectedReference: ka, onModelLoaded: Sa, restoreAssets: ja, syncUpstreamInputs: Ft, configureDomMedia: _a, refreshSetupDiagnostic: Ca, addMediaCard: Ea, addPrimitive: Aa, applyObjectAnimationFrame: Ta, beginCameraEdit: $a, beginObjectEdit: Ma, commitCameraEdit: Ia, commitObjectEdit: Oa, copyKeyframe: Pa, deleteKeyframe: La, deleteObject: Na, duplicateObject: za, exitKeyEdit: Fa, finishCameraEdit: Ra, goToAdjacentKey: Da, insertKeyframe: Ka, loadSelectedKeyView: Ba, pasteKeyframe: qa, playblastCameraAtFrame: Ua, refreshInspector: Wa, refreshKeyEditor: Va, refreshObjects: Ha, removeObjectResources: Ga, renameObject: Ya, retimeSelectedKey: Xa, selectKeyframe: Ja, selectedKeyframe: Za, selectedObject: Qa, selectObjectAnimation: eo, setKeyInterpolation: to, setObjectParent: it, timelineKeyframes: ao, timelineObject: oo, toggleAutoKey: ro, toggleObject: no, updateCameraFromHud: so, updateEditState: io, updateKeyVisualState: co, updateSelectedKey: Rt, updateSelectedObject: lo, clamp: mo, cloneCamera: po, configureCore: Je, defaultCamera: Ho, sampleCamera: bt, sampleObjectTransform: Ne, sanitizeState: z, worldTransform: I } = e;
  return {
    setTargetAtCursor(S) {
      if (!S) return;
      const w = this.interactionElement.getBoundingClientRect(), C = (S.clientX - w.left) * this.canvas.width / Math.max(1, w.width), $ = (S.clientY - w.top) * this.canvas.height / Math.max(1, w.height), U = this.webgl?.intersectScenePoint?.(C, $, this.canvas.width, this.canvas.height);
      U && (this.checkpoint("Set camera target"), this.beginCameraEdit(), this.camera.target = [
        Math.round(U[0] * 1e3) / 1e3,
        Math.round(U[1] * 1e3) / 1e3,
        Math.round(U[2] * 1e3) / 1e3
      ], this.commitCameraEdit(), this.finishCameraEdit(), this.updateHudCamera(), this.refreshInspector(), this.render(), this.setStatus(`Target set to [${this.camera.target.join(", ")}]`));
    },
    focusCameraTarget() {
      this.frameTarget();
    },
    updateHudCamera() {
      this.refreshInspector();
    },
    togglePlay() {
      X(this);
    },
    stopPlay() {
      D(this);
    },
    computeAudioPeaks() {
      L(this);
    },
    async loadAudioFile(S) {
      return E(this, S);
    },
    applyCameraPreset(S) {
      te(this, S);
    },
    applyCameraShake(S) {
      le(this, S);
    },
    applyProxyPreset(S) {
      se(this, S);
    },
    clearCaches() {
      if (this.checkpoint("Clear caches"), this.objectUrls?.clear(), Y(this), this.webgl) {
        for (const S of this.webgl.models.values())
          try {
            S.scene && disposeObject(S.scene, !0);
          } catch {
          }
        this.webgl.models.clear(), this.webgl.modelLoads.clear(), this.webgl.sceneKey = "", this.webgl.mediaSignature = "", this.webgl.modelSignature = "", this.webgl.pathKey = "", this.webgl.bgLoadGeneration += 1, this.webgl.bgTextureLoads?.clear();
        for (const S of new Set(this.webgl.bgTextureCache?.values() || []))
          try {
            S.dispose();
          } catch {
          }
        this.webgl.bgTextureCache?.clear(), this.webgl.bgTexture = null, this.webgl.bgImageUrl = "";
      }
      if (this.cameraWebgl) {
        for (const S of this.cameraWebgl.models.values())
          try {
            S.scene && disposeObject(S.scene, !0);
          } catch {
          }
        this.cameraWebgl.models.clear(), this.cameraWebgl.modelLoads.clear(), this.cameraWebgl.sceneKey = "", this.cameraWebgl.mediaSignature = "", this.cameraWebgl.modelSignature = "", this.cameraWebgl.pathKey = "", this.cameraWebgl.bgLoadGeneration += 1, this.cameraWebgl.bgTextureLoads?.clear();
        for (const S of new Set(this.cameraWebgl.bgTextureCache?.values() || []))
          try {
            S.dispose();
          } catch {
          }
        this.cameraWebgl.bgTextureCache?.clear(), this.cameraWebgl.bgTexture = null, this.cameraWebgl.bgImageUrl = "";
      }
      this.upstreamSignature = "", this.cameraPreviewSignature = "", this.cardMediaById.clear(), this.cardMedia = null, this.restoreAssets(), this.syncUpstreamInputs(), this.refreshObjects(), this.refreshKeys(), this.refreshCameraSelectors(), this.renderCameraView(), this.render(), this.setStatus("Caches cleared & memory freed");
    },
    snapFrame(S) {
      return !this.state.snap_enabled || this.state.snap_frames <= 1 ? Math.round(S) : Math.round(Math.round(S) / this.state.snap_frames) * this.state.snap_frames;
    },
    toggleLoop() {
      this.state.loop_playback = !this.state.loop_playback, this.serialize();
      const S = this.root.querySelector('[data-act="loop"]');
      S.classList.toggle("active", this.state.loop_playback), S.setAttribute("aria-pressed", String(this.state.loop_playback)), this.setStatus(`Loop ${this.state.loop_playback ? "on" : "off"}`);
    },
    setPlaybackRange(S) {
      const w = this.state.playback_range || [0, this.state.duration_frames - 1];
      S === "start" ? w[0] = Math.min(this.frame, w[1]) : S === "end" && (w[1] = Math.max(this.frame, w[0])), this.state.playback_range = w, this.serialize(), this.refreshKeys(), this.setStatus(`Range: F${w[0]}–F${w[1]}`);
    },
    clearPlaybackRange() {
      this.state.playback_range = null, this.serialize(), this.refreshKeys(), this.setStatus("Playback range cleared");
    },
    toggleTimecode() {
      this.state.timecode_mode = this.state.timecode_mode === "timecode" ? "time" : "timecode", this.serialize(), this.setFrame(this.frame, !0), this.setStatus(`Time display: ${this.state.timecode_mode}`);
    },
    toggleSnap() {
      this.state.snap_enabled = !this.state.snap_enabled, this.serialize();
      const S = this.root.querySelector('[data-act="toggle-snap"]');
      S.classList.toggle("active", this.state.snap_enabled), S.setAttribute("aria-pressed", String(this.state.snap_enabled)), this.setStatus(`Snap ${this.state.snap_enabled ? "on" : "off"}`);
    },
    scheduleSerialize() {
      this.serializeScheduled || (this.serializeScheduled = !0, this.serializeFrame = requestAnimationFrame(() => {
        this.serializeScheduled = !1, this.disposed || this.serialize();
      }));
    },
    gizmoAxes(S) {
      return da(this, S);
    },
    gizmoGeometry(S) {
      return ma(this, S);
    },
    pickGizmo(S) {
      return Nt(this, S);
    },
    pickSceneObject(S) {
      return zt(this, S);
    },
    drawTransformGizmo() {
      ca(this);
    },
    // Routed through the facade so the eagerly-loaded key interceptor
    // (web-src/commands.js) keeps no static import of the Director-only
    // camera-path-draw module -- that edge dragged cameras.js and the panel
    // template string onto ComfyUI's startup path. See production-bundle test.
    cancelCameraPathDraw() {
      return He(this);
    },
    onPointerDown(S) {
      Dh(this, S) || pa(this, S);
    },
    onPointerMove(S) {
      Kh(this, S) || fa(this, S);
    },
    onPointerUp(S) {
      Bh(this, S) || ha(this, S);
    },
    onWheel(S) {
      ua(this, S);
    },
    timelineFrameFromEvent(S, w) {
      return na(this, S, w);
    },
    onTimelinePointerDown(S) {
      oa(this, S);
    },
    onTimelinePointerMove(S) {
      $t(this, S);
    },
    onTimelinePointerUp(S) {
      Mt(this, S);
    },
    resetTimelineZoom() {
      Ot(this);
    },
    refreshKeys() {
      ut(this);
    },
    drawCurveEditor() {
      Pe(this);
    },
    toggleCurveHandles() {
      sa(this);
    },
    setCurveInterpolation(S) {
      ra(this, S);
    },
    setTangentMode(S) {
      Lt(this, S);
    },
    setChannelFilter(S) {
      Pt(this, S);
    },
    onCurvePointerDown(S) {
      st(this, S);
    },
    onCurvePointerMove(S) {
      ta(this, S);
    },
    onCurvePointerUp(S) {
      aa(this, S);
    },
    zoomCurve(S) {
      ia(this, S);
    },
    resetCurveZoom() {
      It(this);
    },
    fitCurveView(S) {
      Ke(this, S);
    },
    onCurveDoubleClick(S) {
      Le(this, S);
    },
    onKey(S) {
      return p(this, S);
    },
    frameTarget(S) {
      la(this, S);
    },
    async loadMediaUrl(S, w, C, $) {
      return xa(this, S, w, C, $);
    },
    restoreAssets() {
      ja(this);
    },
    onModelLoaded(S) {
      Sa(this, S);
    },
    async loadModelFile(S) {
      return wa(this, S);
    },
    async loadCardFile(S) {
      return ya(this, S);
    },
    loadExecutionPreview(S) {
      va(this, S);
    },
    loadSelectedReference() {
      ka(this);
    },
    drawLine3D(S, w, C = "#5a5a5a", $ = 1) {
      xe(this, S, w, C, $);
    },
    drawGrid() {
      pe(this);
    },
    drawPointField() {
      N(this);
    },
    drawCube(S) {
      ve(this, S);
    },
    drawSphere(S) {
      me(this, S);
    },
    drawHuman(S) {
      Me(this, S);
    },
    drawNull(S) {
      we(this, S);
    },
    drawCard(S) {
      ye(this, S);
    },
    drawCameraPath() {
      he(this);
    },
    drawSpeedHeatmap() {
      V(this);
    },
    drawOverlays() {
      be(this);
    },
    async loadViewportBgFile(S) {
      return de(this, S);
    },
    async loadViewportBgSequence(S) {
      return ge(this, S);
    },
    clearViewportBgImage() {
      re(this);
    }
  };
}
const Dg = [
  { id: "x", label: "X", vector: [1, 0, 0], color: "#e5484d" },
  { id: "y", label: "Y", vector: [0, 1, 0], color: "#46a758" },
  { id: "z", label: "Z", vector: [0, 0, 1], color: "#4a8fe7" }
];
function Kg(e) {
  const { right: t, up: a, forward: o } = ol(e || {});
  return Dg.map((r) => {
    const [n, i, c] = r.vector, l = n * t[0] + i * t[1] + c * t[2], p = n * a[0] + i * a[1] + c * a[2], m = -(n * o[0] + i * o[1] + c * o[2]);
    return { id: r.id, label: r.label, color: r.color, x: l, y: -p, depth: m };
  });
}
function Bg(e) {
  return [...e].sort((t, a) => t.depth - a.depth);
}
function qg(e) {
  return 0.45 + 0.55 * ((Math.max(-1, Math.min(1, e)) + 1) / 2);
}
const Ug = "http://www.w3.org/2000/svg", St = 26, ts = 17, Wg = 5.4;
function jt(e, t) {
  const a = document.createElementNS(Ug, e);
  for (const [o, r] of Object.entries(t)) a.setAttribute(o, String(r));
  return a;
}
function Vg(e) {
  const t = e.root?.querySelector('[data-role="viewport-axis"]');
  if (!t) return;
  const a = e.viewportCamera ? e.viewportCamera() : e.camera;
  if (!a) return;
  t.replaceChildren();
  const o = jt("circle", {
    "data-axis-center": "",
    cx: St,
    cy: St,
    r: 4,
    fill: "#A78BFA",
    tabindex: "0",
    role: "button",
    "pointer-events": "auto",
    "aria-label": s("Frame selection")
  }), r = jt("title", {});
  r.textContent = s("Frame selection"), o.appendChild(r), t.appendChild(o);
  for (const n of Bg(Kg(a))) {
    const i = St + n.x * ts, c = St + n.y * ts, l = qg(n.depth);
    t.appendChild(jt("line", {
      x1: St,
      y1: St,
      x2: i,
      y2: c,
      stroke: n.color,
      "stroke-width": 1.8,
      "stroke-linecap": "round",
      opacity: l
    }));
    const p = n.depth >= 0, m = jt("circle", {
      cx: i,
      cy: c,
      r: Wg,
      fill: p ? n.color : "transparent",
      stroke: n.color,
      "stroke-width": 1.4,
      opacity: l,
      "data-axis": n.label.toLowerCase(),
      tabindex: "0",
      role: "button",
      "aria-label": s("View: {axis} axis").replace("{axis}", n.label),
      "pointer-events": "auto"
    }), f = jt("title", {});
    if (f.textContent = s("View: {axis} axis").replace("{axis}", n.label), m.appendChild(f), t.appendChild(m), p) {
      const d = jt("text", {
        x: i,
        y: c,
        "text-anchor": "middle",
        "dominant-baseline": "central",
        "font-size": 7,
        "font-weight": 700,
        fill: "#101014"
      });
      d.textContent = n.label, t.appendChild(d);
    }
  }
}
function Hg(e, t, a, o, r) {
  if (["world_point", "object_point", "camera_field"].includes(t.source_kind)) {
    const n = Or(e, t.source, a, o, r);
    return n ? [n] : [];
  }
  return (t.keys || []).map((n) => ({ ...n }));
}
function Gg(e) {
  if (e.recording) return;
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  t.save();
  for (const r of e.state.motion_layers || []) {
    if (!r.enabled) continue;
    const n = Hg(e.state, r, e.frame, a, o);
    if (n.length) {
      t.strokeStyle = r.id === e.state.selected_motion_layer_id ? "#ffcc4d" : "#41d9c5", t.fillStyle = t.strokeStyle, t.lineWidth = r.id === e.state.selected_motion_layer_id ? 3 : 2, t.beginPath(), n.forEach((i, c) => {
        const l = i.x * a, p = i.y * o;
        c ? t.lineTo(l, p) : t.moveTo(l, p);
      }), t.stroke();
      for (const i of n)
        i.visible !== !1 && (t.beginPath(), t.arc(i.x * a, i.y * o, 5, 0, Math.PI * 2), t.fill());
    }
  }
  t.restore();
}
const Yg = ["world_point", "object_point", "camera_field"], _i = {
  manual_2d: "DRAW",
  object_point: "OBJECT",
  world_point: "WORLD",
  static_anchor: "SCREEN",
  camera_field: "FIELD"
};
function Xg(e, t) {
  const a = t.source || {};
  if (t.source_kind === "object_point" && a.object_id) {
    const o = (e.objects || []).find((r) => r.id === a.object_id);
    return o ? o.name || o.id : `${a.object_id} (missing)`;
  }
  return t.source_kind === "world_point" ? "World point" : t.source_kind === "camera_field" ? a.preset ? `${a.preset} field` : "Camera field" : "Screen";
}
function Jg(e, t) {
  if (Yg.includes(t.source_kind)) {
    const a = Or(e, t.source, 0, e.width || 1280, e.height || 720);
    return a ? a.visible !== !1 : !1;
  }
  return t.keys?.[0]?.visible !== !1;
}
function Zg(e, t) {
  return (e.keys || []).reduce(
    (a, o) => a && Math.abs(a.time_seconds - t) <= Math.abs(o.time_seconds - t) ? a : o,
    null
  );
}
function Qg(e) {
  const t = e.root.querySelector('[data-role="motion-layers"]');
  if (!t) return;
  const a = e.state.motion_layers || [], o = e.state.selected_motion_layer_id;
  t.replaceChildren();
  for (const n of a) {
    const i = document.createElement("button");
    i.type = "button", i.className = "motion-layer-row", i.dataset.motionLayerId = n.id, i.classList.toggle("active", n.id === o), i.innerHTML = `<i class="pi ${n.enabled ? "pi-eye" : "pi-eye-slash"}"></i><span></span><small class="motion-badge"></small>`, i.querySelector("span").textContent = n.label, i.querySelector("small").textContent = _i[n.source_kind] || "TRACK", i.addEventListener("click", () => {
      e.state.selected_motion_layer_id = n.id, e.render();
    }), t.appendChild(i);
  }
  const r = e.root.querySelector('[data-role="motion-layers-empty"]');
  r && (r.hidden = !!a.length), ey(e), ty(e);
}
function ey(e) {
  const t = e.root.querySelector('[data-role="motion-selected"]');
  if (!t) return;
  const a = (e.state.motion_layers || []).find((d) => d.id === e.state.selected_motion_layer_id) || null;
  if (t.hidden = !a, !a) return;
  const o = Math.max(1, Number(e.state.fps) || 24), r = (a.keys || []).map((d) => Math.round(d.time_seconds * o)), n = (d, h) => {
    const u = t.querySelector(`[data-role="${d}"]`);
    u && (u.textContent = h);
  };
  n("motion-sel-name", a.label), n("motion-sel-type", _i[a.source_kind] || "TRACK"), n("motion-sel-binding", Xg(e.state, a)), n("motion-sel-start", r.length ? Math.min(...r) : 0), n("motion-sel-end", r.length ? Math.max(...r) : 0);
  const i = a.source_kind === "object_point" && a.source?.object_id && !(e.state.objects || []).some((d) => d.id === a.source.object_id);
  t.classList.toggle("motion-invalid", !!i);
  const c = !i && !Jg(e.state, a);
  t.classList.toggle("motion-warn", c);
  const l = t.querySelector('[data-role="motion-sel-warn"]');
  l && (l.hidden = !c, l.textContent = c ? s("Not visible on the first frame — ATI, Wan Track and LTX Motion drop tracks hidden at frame 0. Move the point into frame at frame 0 or switch to Screen Anchor.") : "");
  const p = t.querySelector('[data-role="motion-interpolation"]');
  p && (p.value = a.keys?.[0]?.interpolation || "linear");
  const m = t.querySelector('[data-role="motion-key-visible"]');
  if (m) {
    const d = Zg(a, (e.frame || 0) / o);
    m.checked = d ? d.visible !== !1 : !0;
  }
  const f = t.querySelector('[data-motion-layer-action="toggle"] i');
  f && (f.className = `pi ${a.enabled ? "pi-eye" : "pi-eye-slash"}`);
}
function ty(e) {
  const t = e.root.querySelector('[data-role="motion-creating"]');
  if (!t) return;
  const a = e.state.motion_tool && e.state.motion_tool !== "select";
  if (t.hidden = !a, !a) return;
  const o = t.querySelector('[data-role="motion-creating-label"]');
  o && (o.textContent = e.motionCreatingLabel || "Creating motion track");
}
function ay(e) {
  const t = e.root.querySelector('[data-role="motion-timeline"]');
  if (!t) return;
  t.replaceChildren();
  const a = Math.max(1, e.state.duration_frames / e.state.fps);
  for (const o of e.state.motion_layers || []) {
    const r = document.createElement("div");
    r.className = "motion-timeline-rail", r.dataset.motionTimelineId = o.id, r.title = o.label;
    const n = document.createElement("button");
    n.type = "button", n.className = "motion-timeline-label", n.textContent = o.label, n.addEventListener("click", () => {
      e.state.selected_motion_layer_id = o.id, e.render();
    });
    const i = document.createElement("div");
    i.className = "motion-timeline-track";
    for (const c of o.keys || []) {
      const l = document.createElement("button");
      l.type = "button", l.className = "motion-key", l.style.left = `${Math.max(0, Math.min(100, c.time_seconds / a * 100))}%`, l.title = `${o.label} @ ${c.time_seconds.toFixed(2)}s`, l.addEventListener("click", () => {
        e.state.selected_motion_layer_id = o.id, e.setFrame(Math.round(c.time_seconds * e.state.fps));
      }), i.appendChild(l);
    }
    r.append(n, i), t.appendChild(r);
  }
}
function oy(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: f, playblastCameraTrack: d, restoreFromWidgets: h, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: v, bindEditorEvents: y, activateCamera: x, addCamera: k, deleteCamera: g, drawPreviewOverlays: _, duplicateCamera: A, maximizeCameraPreview: K, refreshCameraPreviews: F, refreshCameraSelectors: J, renameCamera: H, setPlayblastCamera: M, toggleCameraView: P, captureRealtime: j, makePlayblast: R, uploadDirectorPlayblast: q, waitForMediaFrame: G, computeAudioPeaks: L, loadAudioFile: E, releaseAudio: Y, stopPlay: D, togglePlay: X, applyCameraPreset: te, applyCameraShake: le, applyProxyPreset: se, clearViewportBgImage: re, loadViewportBgFile: de, loadViewportBgSequence: ge, drawCameraPath: he, drawCard: ye, drawCube: ve, drawCylinder: pe, drawGrid: Me, drawHuman: xe, drawLine3D: we, drawNull: be, drawOverlays: N, drawPointField: V, drawSpeedHeatmap: me, drawSphere: _e, drawTorus: Pe, curveChannels: Ke, drawCurveEditor: Le, onCurvePointerDown: st, onCurvePointerMove: ta, onCurvePointerUp: aa, onTimelinePointerDown: oa, onTimelinePointerMove: $t, onTimelinePointerUp: Mt, refreshKeys: ut, resetCurveZoom: It, resetTimelineZoom: Ot, setChannelFilter: Pt, setCurveInterpolation: ra, setTangentMode: Lt, timelineFrameFromEvent: na, toggleCurveHandles: sa, zoomCurve: ia, drawTransformGizmo: ca, frameTarget: la, gizmoAxes: da, gizmoGeometry: ma, onPointerDown: pa, onPointerMove: fa, onPointerUp: ha, onWheel: ua, pickGizmo: Nt, pickSceneObject: zt, resetCamera: ba, setTransformMode: ga, setViewMode: Wo, viewportCamera: Vo, loadCardFile: ya, loadExecutionPreview: va, loadMediaUrl: xa, loadModelFile: wa, loadSelectedReference: ka, onModelLoaded: Sa, restoreAssets: ja, syncUpstreamInputs: Ft, configureDomMedia: _a, refreshSetupDiagnostic: Ca, addMediaCard: Ea, addPrimitive: Aa, applyObjectAnimationFrame: Ta, beginCameraEdit: $a, beginObjectEdit: Ma, commitCameraEdit: Ia, commitObjectEdit: Oa, copyKeyframe: Pa, deleteKeyframe: La, deleteObject: Na, duplicateObject: za, exitKeyEdit: Fa, finishCameraEdit: Ra, goToAdjacentKey: Da, insertKeyframe: Ka, loadSelectedKeyView: Ba, pasteKeyframe: qa, playblastCameraAtFrame: Ua, refreshInspector: Wa, refreshKeyEditor: Va, refreshObjects: Ha, removeObjectResources: Ga, renameObject: Ya, retimeSelectedKey: Xa, selectKeyframe: Ja, selectedKeyframe: Za, selectedObject: Qa, selectObjectAnimation: eo, setKeyInterpolation: to, setObjectParent: it, timelineKeyframes: ao, timelineObject: oo, toggleAutoKey: ro, toggleObject: no, updateCameraFromHud: so, updateEditState: io, updateKeyVisualState: co, updateSelectedKey: Rt, updateSelectedObject: lo, clamp: mo, cloneCamera: po, configureCore: Je, defaultCamera: Ho, sampleCamera: bt, sampleObjectTransform: Ne, sanitizeState: z, worldTransform: I } = e;
  return {
    // Immediate, full repaint -- the compatibility path every discrete one-shot
    // action still uses. High-frequency sources go through requestUiUpdate()
    // instead so a burst of events between animation frames only touches the
    // domains that actually changed.
    render() {
      this.renderViewportOnly(), this.renderMotionUiOnly(), this.renderCameraView();
    },
    // The three Motion-workspace paints, split out so a viewport-only
    // invalidation (an orbit, a wheel) does not re-run them.
    renderMotionUiOnly() {
      Qg(this), tu(this), ay(this);
    },
    // The main viewport canvas: WebGL (or the 2D fallback), the overlays and the
    // DOM axis gizmo. No motion panels, no camera preview strip.
    renderViewportOnly() {
      const S = this.ctx, w = this.canvas.width, C = this.canvas.height;
      if (S.fillStyle = this.state.viewport_bg_color || "#121212", S.fillRect(0, 0, w, C), this.viewportBgSequenceImages && this.viewportBgSequenceImages.length) {
        const ne = this.frame % this.viewportBgSequenceImages.length, Ze = this.viewportBgSequenceImages[ne];
        if (Ze?.complete && Ze.naturalWidth)
          try {
            S.drawImage(Ze, 0, 0, w, C);
          } catch {
          }
      } else if (this.viewportBgImage)
        try {
          S.drawImage(this.viewportBgImage, 0, 0, w, C);
        } catch {
        }
      const $ = this.state.render_mode, U = this.viewportCamera(), Z = this.state.objects.some((ne) => ne.parent_id) ? this.state.objects.map((ne) => ne.parent_id ? { ...ne, ...I(this.state.objects, ne) } : ne) : this.state.objects, B = (this.viewportBgSequenceImages || []).map((ne) => ne.src), Q = this.viewportBgImage?.src || "", Se = this.pendingExtractorImport, Be = Se ? [...this.state.cameras, {
        id: "__extractor_preview__",
        name: Se.label,
        color: "#9ca3af",
        camera: Se.track.keyframes[0]?.camera,
        keyframes: Se.track.keyframes
      }] : this.state.cameras, ct = {
        ...this.state,
        cameras: Be,
        objects: Z,
        viewport_bg_image: Q,
        viewport_bg_sequence: B,
        __selectedObjectIds: [...this.selectedObjectIds || []],
        __omnicamRevision: `${this.renderRevision || 0}:${Se?.fingerprint || ""}`
      };
      let ae = !1;
      if (this.webgl) {
        try {
          const ne = this.recording ? 1 : this.webgl.supersampleFactor?.() ?? 1, Ze = ne > 1 ? Math.min(ne, 4096 / Math.max(1, w, C)) : 1, fo = Ze > 1 ? Math.round(w * Ze) : w, Go = Ze > 1 ? Math.round(C * Ze) : C;
          this.webgl.render(ct, U, this.cardMediaById, fo, Go, this.modelUrlsById, this.frame, this.recording, this.selectedEntity, this.selectedObjectId, this.subSelection, this.selectedKeyFrame ?? null, this.selectedKeyFrames ? [...this.selectedKeyFrames] : null), S.imageSmoothingEnabled = !0, S.imageSmoothingQuality = "high", fo !== w || Go !== C ? S.drawImage(this.webgl.canvas, 0, 0, fo, Go, 0, 0, w, C) : S.drawImage(this.webgl.canvas, 0, 0, w, C), ae = !0;
        } catch (ne) {
          console.error("[OmniCam WebGL Render Error]", ne);
        }
        this.transformControlsWiring?.sync();
      }
      if (!ae) {
        (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes($) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes($) && this.drawPointField();
        for (const ne of Z)
          ne.enabled !== !1 && (ne.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes($) ? this.drawCard(ne) : ["cube", "ground", "glb", "model"].includes(ne.type) && $ !== "grid" && $ !== "point_field" ? this.drawCube(ne) : ne.type === "sphere" && $ !== "grid" && $ !== "point_field" ? this.drawSphere(ne) : ne.type === "cylinder" && $ !== "grid" && $ !== "point_field" ? this.drawCylinder(ne) : ne.type === "torus" && $ !== "grid" && $ !== "point_field" ? this.drawTorus(ne) : ne.type === "human" && $ !== "grid" && $ !== "point_field" ? this.drawHuman(ne) : ne.type === "null" && this.drawNull(ne));
        !this.recording && this.state.show_camera_paths && this.drawCameraPath();
      }
      !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), !this.recording && qh(this), this.drawOverlays(), Gg(this), this.state.show_gizmo && Vg(this), this.labelOverlay?.update(), this.rigOverlay?.update(), this.perf && (this.perf.viewportRenderCount = (this.perf.viewportRenderCount || 0) + 1);
    },
    // The single "something changed, repaint soon" entry point. Every
    // high-frequency source (playback tick, viewport drags, wheel/keyboard
    // navigation) funnels through here so at most one render() runs per frame
    // no matter how many events landed between paints. Discrete one-shot
    // actions can still call render() directly for an immediate repaint.
    requestRender(S = "unknown") {
      return this.requestUiUpdate(T.viewport | T.previews | T.motion, S);
    },
    // Targeted invalidation on top of the existing one-RAF coalescing. Each
    // caller marks only the domains it changed; the animation-frame callback
    // repaints just those, once, however many calls landed between frames.
    requestUiUpdate(S = T.viewport, w = "unknown") {
      (this.renderReasons ||= /* @__PURE__ */ new Set()).add(w), this.uiDirtyMask = up(this.uiDirtyMask, S), this.renderInvalidations = (this.renderInvalidations || 0) + 1, !this.renderScheduled && (this.renderScheduled = !0, this.renderFrame = requestAnimationFrame(() => {
        if (this.renderScheduled = !1, this.disposed) return;
        const C = this.uiDirtyMask || T.viewport;
        this.uiDirtyMask = 0, this.lastRenderReasons = [...this.renderReasons || []], this.renderReasons?.clear(), this.rendersCoalesced = (this.rendersCoalesced || 0) + 1, this.perf && (this.perf.renderCount = (this.perf.renderCount || 0) + 1), vt(C, T.outliner) && this.refreshObjects(), vt(C, T.timeline) && this.refreshKeys(), vt(C, T.inspector) && this.refreshInspector(), vt(C, T.viewport) && this.renderViewportOnly(), vt(C, T.previews) && this.renderCameraView(), vt(C, T.motion) && this.renderMotionUiOnly();
      }));
    },
    renderCameraView() {
      if (this.perf && (this.perf.previewRenderCount = (this.perf.previewRenderCount || 0) + 1), this.state.camera_view_visible) {
        if (this.root.querySelector('[data-role="camera-view-row"]')?.hidden) return;
        this.refreshCameraPreviews(), this.cameraPreviewTick = (this.cameraPreviewTick || 0) + 1;
        const w = this.state.cameras, C = !!this.playing && !this.recording && w.length > 2;
        let $ = null;
        if (C) {
          const U = this.state.active_camera_id, Z = w.filter((B) => B.id !== U);
          $ = Z.length ? Z[this.cameraPreviewTick % Z.length] : null;
        }
        for (const U of w) {
          const Z = this.cameraPreviewCanvases.get(U.id), B = this.cameraPreviewContexts.get(U.id);
          if (!Z?.width || !B) continue;
          const Q = Z.width, Se = Z.height, Be = this.root.querySelector(`[data-camera-frame="${U.id}"]`);
          if (Be && (Be.textContent = `F${this.frame}`), C && U.id !== this.state.active_camera_id && U !== $) continue;
          const ct = Ht(this, U, bt(U, this.frame, this.state.objects), this.frame);
          if (B.fillStyle = "#111", B.fillRect(0, 0, Q, Se), this.cameraWebgl)
            try {
              this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: !1, viewport_bg_image: this.viewportBgImage?.src || "", viewport_bg_sequence: (this.viewportBgSequenceImages || []).map((ae) => ae.src), __omnicamRevision: this.renderRevision || 0 }, ct, this.cardMediaById, Q, Se, this.modelUrlsById, this.frame, !0), B.drawImage(this.cameraWebgl.canvas, 0, 0, Q, Se);
            } catch (ae) {
              console.error("[OmniCam Preview Render Error]", ae);
            }
          _(this, B, Q, Se);
        }
      }
    },
    drawPreviewOverlays(S, w, C) {
      _(this, S, w, C);
    },
    maximizeCameraPreview(S) {
      K(this, S);
    },
    setStatus(S) {
      (this.dom?.status || this.root.querySelector('[data-role="status"]')).textContent = S;
    },
    async makePlayblast() {
      return R(this);
    },
    async waitForMediaFrame() {
      return G(this);
    },
    async captureRealtimePlayblast() {
      return j(this);
    },
    async uploadPlayblast(S) {
      return q(this, S);
    },
    async syncUpstreamInputs() {
      return Ft(this);
    },
    dispose() {
      this.disposed || (this.disposed = !0, this.agentBridge?.dispose?.(), this.transformControlsWiring?.dispose(), rl(this), nl(), Rl(this), this.backgroundRequestId = (this.backgroundRequestId || 0) + 1, this.upstreamSyncId = (this.upstreamSyncId || 0) + 1, this.stopPlay(), clearTimeout(this.previewClickTimer), clearTimeout(this.connectionTimer), cancelAnimationFrame(this.restoreFrame), cancelAnimationFrame(this.serializeFrame), cancelAnimationFrame(this.resizeFrame), cancelAnimationFrame(this.renderFrame), this.abortController?.abort(), this.upstreamFetchController?.abort(), this.resizeObserver?.disconnect(), this.contextMenu?.dispose(), this.webgl?.dispose(), this.cameraWebgl?.dispose(), Y(this), bu(this), this.objectUrls.clear(), this.cardMediaById.clear(), this.cardMediaAssetById?.clear?.(), this.modelUrlsById.clear(), this.modelInfoById.clear());
    }
  };
}
const ry = 0.12;
function ny() {
  return {
    /** Selected key frames that still exist on the active track, sorted. */
    resolveSelectedFrames() {
      const e = new Set(Ee(this).map((a) => a.frame));
      return (this.selectedKeyFrames?.size ? [...this.selectedKeyFrames] : this.selectedKeyFrame != null ? [this.selectedKeyFrame] : []).filter((a) => e.has(a)).sort((a, o) => a - o);
    },
    _activeTrack() {
      const e = Oe(this);
      if (e) return { kind: "object", write: (a) => {
        e.keyframes = a;
      } };
      const t = dr(this);
      return {
        kind: "camera",
        write: (a) => {
          t.keyframes = a, this.state.keyframes = a, mr(this);
        }
      };
    },
    deleteSelectedKeyframes() {
      let e = this.resolveSelectedFrames();
      if (!e.length) {
        const l = Ee(this).find((p) => p.frame === this.frame);
        l && (e = [l.frame]);
      }
      if (!e.length) return this.setStatus(s("Select a keyframe to delete"));
      const t = this._activeTrack(), a = Ee(this), o = t.kind === "camera" ? 1 : 0, { keys: r, removed: n } = xg(a, e, { minKeys: o });
      if (!n) return this.setStatus(s("Keep at least one camera keyframe"));
      this.checkpoint(n > 1 ? s("Delete {n} keyframes").replace("{n}", n) : "Delete keyframe"), t.write(r);
      const i = Ee(this), c = e[0];
      this.selectedKeyFrame = i.length ? i.reduce((l, p) => Math.abs(p.frame - c) < Math.abs(l.frame - c) ? p : l).frame : null, this.selectedKeyFrames = this.selectedKeyFrame != null ? /* @__PURE__ */ new Set([this.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.includes(this.editingKeyFrame) && (this.editingKeyFrame = null), this.camera = $e(this.state, this.frame), this.applyObjectAnimationFrame(), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(n > 1 ? s("{n} keyframes deleted").replace("{n}", n) : s("Keyframe deleted"));
    },
    /** Move every selected key by `delta` frames. Returns false when nothing is selected. */
    nudgeSelectedKeyframes(e) {
      const t = this.resolveSelectedFrames();
      if (!t.length || !e) return !1;
      const a = this._activeTrack(), o = Math.max(0, this.state.duration_frames - 1), r = wg(Ee(this), t, e, { lastFrame: o });
      return r.moved ? (this.checkpoint(s("Nudge {n} keyframes").replace("{n}", t.length)), a.write(r.keys), this.selectedKeyFrames = new Set(r.frames), this.selectedKeyFrame = r.frames.at(-1) ?? null, this.editingKeyFrame = null, this.serialize(), this.refreshKeys(), this.setFrame(this.selectedKeyFrame ?? this.frame, !1, !1), this.render(), !0) : (this.setStatus(s("Selected keys cannot move further")), !0);
    },
    setSelectedKeysInterpolation(e) {
      const t = this.resolveSelectedFrames();
      if (t.length < 2) return this.setCurveInterpolation(e);
      const a = this._activeTrack();
      this.checkpoint(s("Interpolation on {n} keys").replace("{n}", t.length)), a.write(kg(Ee(this), t, e)), this.serialize(), this.refreshKeys(), this.refreshKeyEditor(), this.render(), this.drawCurveEditor(), this.setStatus(s("{mode} interpolation on {n} keys").replace("{mode}", e.replace(/_/g, " ")).replace("{n}", t.length));
    },
    setSelectedKeysTangentMode(e) {
      const t = this.resolveSelectedFrames();
      if (t.length < 2) return this.setTangentMode(e);
      const a = this._activeTrack(), o = ht(this).map((r) => r.id);
      this.checkpoint(s("Tangents on {n} keys").replace("{n}", t.length)), a.write(Sg(Ee(this), t, e, o)), this.serialize(), this.refreshKeys(), this.render(), this.drawCurveEditor(), this.setStatus(s("{mode} tangents on {n} keys").replace("{mode}", e).replace("{n}", t.length));
    },
    /**
     * mode: "simplify" (tolerance 0..1) | "reduce" (target key count) | "clean".
     * scope: "camera" | "all_cameras" | "object". When >= 2 keys are selected on
     * a single-track scope the op is confined to that frame range.
     */
    simplifyActiveKeys({ mode: e = "simplify", tolerance: t = 0, target: a = 0, scope: o = "camera", fromKeys: r = null, silent: n = !1 } = {}) {
      const i = o === "object" ? "object" : "camera";
      let c;
      if (o === "object") {
        const u = Oe(this);
        if (!u) return this.setStatus(s("Select an animated object first"));
        c = [{ get: () => u.keyframes || [], set: (b) => {
          u.keyframes = b;
        }, primary: !0 }];
      } else if (o === "all_cameras")
        c = this.state.cameras.map((u) => ({
          get: () => u.keyframes || [],
          set: (b) => {
            u.keyframes = b, u.id === this.state.active_camera_id && (this.state.keyframes = b);
          },
          primary: u.id === this.state.active_camera_id
        }));
      else {
        const u = dr(this);
        c = [{
          get: () => u.keyframes || [],
          set: (b) => {
            u.keyframes = b, this.state.keyframes = b;
          },
          primary: !0
        }];
      }
      if (e === "simplify" && t <= 0 && !r) return 0;
      const l = this.resolveSelectedFrames(), p = o !== "all_cameras" && l.length >= 2 ? [l[0], l.at(-1)] : null, m = p ? [] : l, f = (u) => {
        const b = [...u].sort((K, F) => K.frame - F.frame), v = p ? p[0] : -1 / 0, y = p ? p[1] : 1 / 0, x = b.filter((K) => K.frame < v), k = b.filter((K) => K.frame >= v && K.frame <= y), g = b.filter((K) => K.frame > y);
        let _ = k, A = 0;
        if (k.length > 2) {
          const K = e === "reduce" ? yg(k, i, { target: a || Math.ceil(k.length / 2), keepFrames: m }) : e === "clean" ? vg(k, i, { keepFrames: m }) : gg(k, i, { tolerance: t * ry, keepFrames: m });
          _ = K.keys, A = K.removed;
        }
        return { keys: [...x, ..._, ...g].sort((K, F) => K.frame - F.frame), removed: A };
      };
      let d = 0;
      const h = c.map((u) => {
        const b = r && u.primary ? r : u.get(), { keys: v, removed: y } = f(b);
        return d += y, { track: u, keys: v };
      });
      n || this.checkpoint(s("Simplify keyframes"));
      for (const { track: u, keys: b } of h) u.set(b);
      return mr(this), this.selectedKeyFrame = null, this.selectedKeyFrames = /* @__PURE__ */ new Set(), this.camera = $e(this.state, this.frame), this.applyObjectAnimationFrame(), this.serialize(), this.refreshKeys(), this.setFrame(this.frame, !1, !1), this.render(), n || this.setStatus(d ? s("Removed {n} keyframes").replace("{n}", d) : s("No keyframes to remove")), d;
    },
    keySimplifyToleranceFor(e) {
      return ee(Number(e) || 0, 0, 100) / 100;
    }
  };
}
ys({ api: nt });
ai({ api: nt });
Iu({ api: nt });
class Ci {
  constructor(t) {
    this.app = as, this.api = nt, this.node = t, this.root = zs(), this.root.tabIndex = -1, this.dom = Us(this.root), this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.canvas, this.interactionElement.tabIndex = 0, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 }), this.disposed = !1, this.renderRevision = 0, this.directorRevision = 0, this.webgl = null, this.cameraWebgl = null, this.webglReady = this.loadWebGLViewports(), this.transformControlsWiring = _f(this), this.stateWidget = t.widgets?.find((o) => o.name === "state_json"), this.recordingWidget = t.widgets?.find((o) => o.name === "recording_path"), this.cardWidget = t.widgets?.find((o) => o.name === "card_asset"), this.widthWidget = t.widgets?.find((o) => o.name === "width"), this.heightWidget = t.widgets?.find((o) => o.name === "height"), this.fpsWidget = t.widgets?.find((o) => o.name === "fps"), this.durationWidget = t.widgets?.find((o) => o.name === "duration_seconds"), this.modeWidget = t.widgets?.find((o) => o.name === "render_mode");
    let a = null;
    try {
      a = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = $r(a), // The scene "Reset" command reverts to whatever was last saved or opened;
    // the state the node mounts with is that baseline until then.
    this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = $e(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.pathSelection = sl(), this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.cardMediaAssetById = /* @__PURE__ */ new Map(), this.objectUrls = new Ns(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = null, this.selectedEntity = "camera", this.subSelection = null, this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.uiDirtyMask = 0, this.perf = globalThis.__omnicamPerf === !0 ? { renderCount: 0, viewportRenderCount: 0, previewRenderCount: 0, timelineRefreshCount: 0, inspectorRefreshCount: 0, lastFrameMs: 0 } : null, this.contextMenu = new ws(this.root), this.history = new Ls({ capture: () => JSON.stringify({ state: this.state, frame: this.frame, selectedEntity: this.selectedEntity, selectedObjectId: this.selectedObjectId, selectedObjectIds: [...this.selectedObjectIds || []], selectedKeyFrame: this.selectedKeyFrame, selectedKeyFrames: [...this.selectedKeyFrames || []], subSelection: this.subSelection }), restore: (o) => this.restoreHistorySnapshot(o) }), this.refreshCameraPreviews(), this.initializeTooltips(), this.bindEditorEvents(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.syncUpstreamInputs(), this.refreshSetupDiagnostic(), // Seed every frame-derived readout (timecode, lens millimetres, viewport
    // zoom, dope rows) instead of waiting for the first scrub.
    this.setFrame(this.frame, !1, !0);
  }
  /** Load the WebGL viewports, then repaint with them. Never rejects. */
  async loadWebGLViewports() {
    let t;
    try {
      ({ OmniWebGLViewport: t } = await import("./chunk-DS4nlk9_.js"));
    } catch (a) {
      console.warn("OmniCam WebGL unavailable; using Canvas fallback", a);
      return;
    }
    if (!this.disposed) {
      try {
        this.webgl = new t(() => this.render(), (a) => this.onModelLoaded(a));
      } catch (a) {
        console.warn("OmniCam WebGL unavailable; using Canvas fallback", a), this.webgl = null;
      }
      try {
        this.cameraWebgl = new t(() => this.renderCameraView(), () => {
        });
      } catch (a) {
        console.warn("OmniCam Camera View unavailable", a), this.cameraWebgl = null;
      }
      if (this.disposed) {
        this.webgl?.dispose(), this.cameraWebgl?.dispose(), this.webgl = this.cameraWebgl = null;
        return;
      }
      il(this), this.resizeCanvas(), this.render(), this.renderCameraView();
    }
  }
}
const jo = { app: as, api: nt, EditorHistory: Ls, ContextMenuController: ws, initializeTooltips: Kl, promptText: Xt, ObjectUrlRegistry: Ns, buildRoot: zs, dispatchDirectorKey: cl, activeCameraTrack: dr, bindWidgetCallbacks: Bl, playblastCameraTrack: xs, restoreFromWidgets: ql, serializeEditorState: Ul, syncActiveCameraTrack: mr, syncFromWidgets: Wl, bindEditorEvents: ou, activateCamera: Vl, addCamera: Hl, deleteCamera: Gl, drawPreviewOverlays: Yl, duplicateCamera: Xl, maximizeCameraPreview: Jl, refreshCameraPreviews: Zl, refreshCameraSelectors: Ql, renameCamera: ed, setPlayblastCamera: td, toggleCameraView: ad, captureRealtime: ii, makePlayblast: Mu, uploadDirectorPlayblast: ci, waitForMediaFrame: si, computeAudioPeaks: ti, loadAudioFile: fu, releaseAudio: Lo, stopPlay: To, togglePlay: du, applyCameraPreset: Cf, applyCameraShake: Ef, applyProxyPreset: Af, clearViewportBgImage: Lu, loadViewportBgFile: Ou, loadViewportBgSequence: Pu, drawCameraPath: Yu, drawCard: Gu, drawCube: Bu, drawCylinder: Wu, drawGrid: Fu, drawHuman: Uu, drawLine3D: ie, drawNull: Hu, drawOverlays: Ju, drawPointField: Ku, drawSpeedHeatmap: Xu, drawSphere: qu, drawTorus: Vu, curveChannels: ht, drawCurveEditor: Dd, fitCurveView: Ts, onCurveDoubleClick: Fd, onCurvePointerDown: Td, onCurvePointerMove: $d, onCurvePointerUp: Md, onTimelinePointerDown: ll, onTimelinePointerMove: dl, onTimelinePointerUp: ml, refreshKeys: tm, resetCurveZoom: Rd, resetTimelineZoom: pl, setChannelFilter: Od, setCurveInterpolation: Id, setTangentMode: Pd, timelineFrameFromEvent: _r, toggleCurveHandles: Ld, zoomCurve: zd, drawTransformGizmo: fl, frameTarget: hl, gizmoAxes: ul, gizmoGeometry: bl, onPointerDown: gl, onPointerMove: yl, onPointerUp: vl, onWheel: xl, pickGizmo: wl, pickSceneObject: kl, resetCamera: Sl, setTransformMode: jl, setViewMode: _l, viewportCamera: Cl, loadCardFile: wu, loadExecutionPreview: ku, loadMediaUrl: ni, loadModelFile: xu, loadSelectedReference: Su, onModelLoaded: vu, restoreAssets: yu, syncUpstreamInputs: ju, configureDomMedia: ai, refreshSetupDiagnostic: eb, addMediaCard: kb, addPrimitive: yb, applyObjectAnimationFrame: Fb, beginCameraEdit: Wb, beginObjectEdit: ui, commitCameraEdit: Vb, commitObjectEdit: _b, copyKeyframe: Bb, deleteKeyframe: Kb, deleteObject: hi, deleteSelectedObjects: wb, duplicateObject: fi, exitKeyEdit: Gb, finishCameraEdit: Hb, goToAdjacentKey: ng, insertKeyframe: Rb, loadSelectedKeyView: rg, pasteKeyframe: qb, playblastCameraAtFrame: zb, refreshInspector: Sb, refreshKeyEditor: tg, refreshObjects: pi, removeObjectResources: Mb, renameObject: vb, retimeSelectedKey: ag, selectKeyframe: Ub, selectedKeyframe: Xe, selectedObject: ea, selectObjectAnimation: $b, setKeyInterpolation: Db, setKeyTangentMode: Qb, setObjectParent: Tb, timelineKeyframes: Ee, timelineObject: Oe, toggleAutoKey: Yb, toggleObject: xb, updateCameraFromHud: Ab, updateCameraRotationFromHud: Eb, updateEditState: Jb, updateKeyVisualState: Zb, updateSelectedKey: og, updateSelectedObject: jb, clamp: ee, cloneCamera: ce, configureCore: ys, defaultCamera: Ar, sampleCamera: $e, sampleObjectTransform: Do, sanitizeState: $r, worldTransform: Mr };
Object.assign(
  Ci.prototype,
  mg(jo),
  Fg(jo),
  Rg(jo),
  oy(jo),
  ny()
);
function _o(e, t) {
  const a = globalThis.__majoorOmniCamCiTrace;
  Array.isArray(a) && a.push({ stage: e, nodeId: t?.id ?? null, nodeClass: t?.comfyClass ?? t?.type ?? null });
}
function sy(e) {
  if (e.__majoorOmniCam) return;
  _o("director:attach:start", e), _o("director:constructor:start", e);
  const t = new Ci(e);
  _o("director:constructor:complete", e), Bp(t);
  try {
    t.agentBridge = Yp(t, e, nt);
  } catch (m) {
    console.warn("[OmniCam] Agent bridge unavailable", m);
  }
  try {
    t.assetBrowser = mf(t, {
      // Keeps the Agent module out of the eager chunk (design spec section
      // 32): nothing under web-src/agent/panel.js loads until the AGENT tab
      // is actually opened.
      onAgentFirstOpen: async () => {
        if (ir())
          try {
            const { createDirectorAgentPanel: m } = await import("./chunk-BNgGv1O1.js");
            t.agentPanel = m(t);
          } catch (m) {
            console.warn("[OmniCam] Agent panel unavailable", m);
          }
      }
    });
  } catch (m) {
    console.warn("[OmniCam] Asset Browser unavailable", m);
  }
  try {
    t.labelOverlay = pf(t);
    const m = t.root.querySelector('[data-role="label-mode"]'), f = t.root.querySelector('[data-role="label-content"]');
    m && (m.value = t.labelOverlay.settings.mode), f && (f.value = t.labelOverlay.settings.content);
  } catch (m) {
    console.warn("[OmniCam] Label overlay unavailable", m);
  }
  try {
    t.characterRuntime = ff(t), t.rigMapper = uf(t), t.poseEditor = yf(t), t.motionEditor = vf(t);
  } catch (m) {
    console.warn("[OmniCam] Character tools unavailable", m);
  }
  e.__majoorOmniCam = t, _o("director:marker:assigned", e), t.hideInternalWidgets();
  const a = () => Math.max(700, t.root.scrollHeight || 0);
  t.domWidget = e.addDOMWidget("majoor_omnicam_viewport", "omnicam", t.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 700,
    getHeight: a,
    getMaxHeight: () => a(),
    afterResize: () => {
      t.scheduleResizeAndRender();
    }
  });
  const o = e.onResize;
  e.onResize = function() {
    o?.apply(this, arguments), t.scheduleResizeAndRender();
  };
  const r = e.onConfigure;
  e.onConfigure = function() {
    r?.apply(this, arguments), cancelAnimationFrame(t.restoreFrame), t.restoreFrame = requestAnimationFrame(() => {
      t.disposed || (t.restoreFromWidgets(), t.syncUpstreamInputs());
    });
  };
  const n = e.onAfterGraphConfigured;
  e.onAfterGraphConfigured = function() {
    n?.apply(this, arguments), cancelAnimationFrame(t.restoreFrame), t.restoreFrame = requestAnimationFrame(() => {
      t.disposed || (t.restoreFromWidgets(), t.syncUpstreamInputs());
    });
  };
  const i = () => {
    clearTimeout(t.connectionTimer), t.connectionTimer = setTimeout(() => {
      t.disposed || (t.syncUpstreamInputs(), e.setDirtyCanvas?.(!0, !0));
    }, 60);
  }, c = e.onConnectionsChange;
  e.onConnectionsChange = function() {
    c?.apply(this, arguments), i();
  }, t.unwatchGraphConnections = Dl(e, i);
  const l = e.onRemoved;
  e.onRemoved = function() {
    t.unwatchGraphConnections?.(), t.assetBrowser?.dispose?.(), t.agentPanel?.dispose?.(), t.labelOverlay?.dispose?.(), t.rigMapper?.dispose?.(), t.poseEditor?.dispose?.(), t.motionEditor?.dispose?.(), t.dispose(), l?.apply(this, arguments);
  };
  const p = e.onExecuted;
  e.onExecuted = function(m) {
    p?.apply(this, arguments), t.loadExecutionPreview(m), t.syncUpstreamInputs();
  };
}
const yy = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirector: sy
}, Symbol.toStringTag, { value: "Module" }));
export {
  or as D,
  uy as a,
  by as b,
  hy as c,
  ru as d,
  Ys as e,
  Zt as f,
  yy as g,
  Dr as q,
  gy as r,
  jr as s
};
