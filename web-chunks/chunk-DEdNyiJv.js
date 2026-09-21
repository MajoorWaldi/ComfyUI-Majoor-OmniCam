import { app as Ur } from "../../scripts/app.js";
import { api as Ve } from "../../scripts/api.js";
import { a as xe, c as U, C as fe, E as ls, v as r, F as Gr, G as Ko, H as ze, e as le, J as so, K as Do, L as Ke, M as ds, N as Ro, T as ae, O as Xr, Q as ms, R as ps, U as fs, V as hs, W as us, X as $o, x as sr, Y as Yr, Z as Mo, _ as Zr, $ as Jr, a0 as Qr, a1 as en, j as tn, a2 as To, a3 as ho, a4 as ir, a5 as cr, a6 as an, o as lr, a7 as bs, a8 as gs, a9 as ys, aa as vs, ab as xs, h as ve, p as on, i as rn, ac as dr, f as $e, ad as ks, ae as nn, t as ws, af as Ss, r as sn, ag as No, ah as js, ai as Cs, q as _s, aj as Es, ak as $s, al as Ms, am as qo, an as Ts, ao as As, ap as Ps, aq as Is, ar as zs, as as Fs, at as Ls, au as Os, av as Ks, aw as Ds, ax as Rs, ay as Ns, az as qs, aA as Bs, aB as Ws, aC as Vs, aD as Hs, aE as Us, aF as Gs, aG as Xs, aH as Ys, aI as Zs, aJ as Js, aK as Qs, aL as ei, aM as ti, aN as ai, aO as oi, aP as ri, aQ as ni, aR as si, aS as ii, aT as ci, aU as li, aV as di, aW as mi, aX as pi, aY as fi, aZ as hi, a_ as ui, a$ as bi, b0 as gi, b1 as yi, l as We, b2 as vi, b3 as uo, b4 as xi, b5 as ki, b6 as wi, b7 as Si, b8 as ji, b9 as Ie, ba as Ci, bb as cn, bc as Bo, bd as _i, be as Ei, bf as $i, S as ln, bg as Re, bh as Mi, bi as Ti, bj as mr, bk as Wo, bl as Ai, bm as Pi, bn as Ii, b as dn, bo as zi, bp as Fi, bq as Li, br as Oi, z as Ki, bs as Di, bt as Ri, bu as Ni, bv as mn, bw as qi, bx as Bi, by as Wi, bz as Vi, bA as Hi, bB as Ui, bC as Gi, bD as Xi, bE as Yi, bF as Zi, bG as Ji, bH as Qi, bI as ec, bJ as tc, bK as ac, bL as oc, bM as rc, bN as nc, bO as sc, s as ic } from "./chunk-Cg3_Iw1A.js";
import { p as cc, a as lc, s as bo, S as pn, c as dc, C as pr, b as mc, i as pc, w as fc, d as hc, U as je, m as uc, h as Ge, e as bc, f as gc, g as yc, j as vc, k as xc, r as kc, l as wc, n as Sc, E as jc } from "./chunk-BJqdJBK9.js";
import { L as Cc, h as _c, i as jt, j as Vo, k as Ec, l as $c, o as fr, q as Mc, t as Tc, u as Ac, v as Pc, w as Ic, C as hr, c as Ct, x as fn, y as zc, z as Fc, A as Lc, B as hn, D as Oc, E as Kc, G as Dc, H as Rc, I as Nc, J as qc, K as Bc, M as Wc, N as Vc, O as Hc, P as Uc, Q as Gc } from "./chunk-Ys3jj0hc.js";
import { S as Xc, b as Yc, p as Zc, l as Jc, u as Qc } from "./chunk-DbDvB9Ll.js";
import { T as el } from "./chunk-D_M_mkHf.js";
import { T as tl, R as al } from "./vendor-three-B8JDtKPi.js";
import { b as ol, p as un, a as Ao, c as Po, d as rl, r as nl, s as sl, e as il } from "./chunk-C_hMby-H.js";
import { m as cl } from "./chunk-Bu3EGLOJ.js";
function gt(e, t = 0) {
  return Math.sin(e * 1.7 + t * 3.1) * 0.5 + Math.sin(e * 3.3 + t * 5.7) * 0.3 + Math.sin(e * 7.9 + t * 11.3) * 0.2;
}
function ur(e, { type: t = "handheld_subtle", intensity: a = 1, duration_frames: o = null, subdivide: n = !0 } = {}) {
  const s = Array.isArray(e) ? e : e?.keyframes || [];
  if (!s || s.length === 0) return s;
  const i = t === "crash", c = t === "turbulence", l = t === "handheld_heavy", d = t === "handheld", p = (i ? 0.35 : l ? 0.18 : c ? 0.12 : d ? 0.09 : 0.06) * a, f = (i ? 5 : l ? 2.8 : c ? 2 : d ? 1.4 : 0.9) * a, u = i ? 0.6 : c ? 0.45 : l ? 0.22 : d ? 0.16 : 0.12, m = s[s.length - 1]?.frame ?? 119, h = Math.max(m + 1, Number(o || (e?.duration_frames ?? m + 1))), y = i ? 3 : c ? 4 : l || d ? 6 : 8, b = Array.isArray(e) ? { keyframes: s, duration_frames: h } : e, x = new Set(s.map((k) => k.frame));
  if (n && h > y) {
    for (let k = 0; k < h; k += y)
      x.add(k);
    x.add(h - 1);
  }
  return [...x].sort((k, v) => k - v).map((k) => {
    const v = xe(b, k), $ = gt(k * u, 1) * p, _ = gt(k * u, 2) * p, I = gt(k * u, 3) * p * 0.5, M = gt(k * u, 4) * f, L = gt(k * u, 5) * (f * 0.35), O = [...v.position], A = [...v.target];
    return O[0] += $, O[1] += _, O[2] += I, A[0] += $ * 0.35, A[1] += _ * 0.35, {
      frame: k,
      camera: {
        ...v,
        position: O,
        target: A,
        roll: (v.roll || 0) + M,
        fov: U((v.fov || 35) + L, 10, 140)
      },
      interpolation: "smooth"
    };
  });
}
function ll(e, { duration_frames: t = 120, target: a = [0, 1.5, 0], radius: o = 6, height: n = 3.5 } = {}) {
  const s = [], i = Math.max(2, t), [c, l, d] = a;
  if (e === "orbit_360") {
    const p = Math.max(17, Math.min(65, Math.ceil(i / 4) + 1));
    for (let f = 0; f < p; f++) {
      const u = Math.round(f / (p - 1) * (i - 1)), m = f / (p - 1) * Math.PI * 2, h = f === p - 1 ? [c, l + n, d + o] : [c + Math.sin(m) * o, l + n, d + Math.cos(m) * o];
      s.push({
        frame: u,
        camera: {
          position: h,
          target: [c, l, d],
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
  } else e === "push_in" ? s.push(
    {
      frame: 0,
      camera: { position: [c, l + n, d + o * 1.6], target: [c, l, d], fov: 42, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: i - 1,
      camera: { position: [c, l + n * 0.5, d + o * 0.6], target: [c, l, d], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : e === "pull_out" ? s.push(
    {
      frame: 0,
      camera: { position: [c, l + n * 0.4, d + o * 0.6], target: [c, l, d], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: i - 1,
      camera: { position: [c, l + n * 1.2, d + o * 1.8], target: [c, l, d], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : e === "dolly_zoom" && s.push(
    {
      frame: 0,
      camera: { position: [c, l + n * 0.7, d + o * 1.8], target: [c, l, d], fov: 24, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    },
    {
      frame: i - 1,
      camera: { position: [c, l + n * 0.5, d + o * 0.6], target: [c, l, d], fov: 65, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    }
  );
  return s;
}
function dl(e, t) {
  const a = t >= -1 && t <= 101;
  e.style.display = a ? "" : "none", a && (e.style.left = `${t}%`);
}
function bn(e) {
  const t = fe(e, e.frame);
  for (const a of [".oc-playhead-head", '[data-role="dope-playhead"]', ".oc-gdope-playhead", ".oc-sequence-playhead"])
    for (const o of e.root.querySelectorAll(a)) dl(o, t);
}
function ml(e, t, a) {
  if (t.length < 2) return;
  const o = a(t[0]), n = a(t[t.length - 1]), s = document.createElement("span");
  s.className = "oc-dope-rail", s.style.left = `${Math.max(0, Math.min(o, n))}%`, s.style.width = `${Math.max(0, Math.abs(n - o))}%`, e.appendChild(s);
}
function pl(e, t, a, o, n) {
  for (const s of a.frames) {
    const i = n(s);
    if (i < -5 || i > 105) continue;
    const c = document.createElement("button");
    c.type = "button", c.className = `oc-dope-key${s === e.frame ? " at-playhead" : ""}`, c.style.left = `${i}%`, c.dataset.frame = String(s), c.title = r("{channel} changes at frame {frame}").replace("{channel}", r(a.label)).replace("{frame}", String(s)), c.addEventListener("pointerdown", (l) => {
      if (l.shiftKey || l.altKey || l.button !== 0) return;
      const d = o.find((u) => u.frame === s);
      if (!d) return;
      l.preventDefault(), l.stopPropagation(), e.selectedKeyFrames?.has(s) || (e.selectedKeyFrames = /* @__PURE__ */ new Set([s])), e.selectedKeyFrame = s;
      const p = e.root.querySelector('[data-role="keys"]');
      if (!p) return;
      const f = e.timelineKeyframes().filter((u) => e.selectedKeyFrames.has(u.frame));
      e.keyDrag = {
        key: d,
        box: p,
        historyCheckpointed: !1,
        moving: f.map((u) => ({ key: u, startFrame: u.frame })),
        startPointerFrame: s,
        startClientX: l.clientX,
        startClientY: l.clientY
      }, e.setFrame(s, !1, !1);
    }), c.addEventListener("click", (l) => {
      l.preventDefault(), l.stopPropagation();
      const d = o.find((p) => p.frame === s);
      if (!(!d || e.suppressKeyClick)) {
        if (l.shiftKey) {
          e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((p) => p !== null)), e.selectedKeyFrames.has(s) ? e.selectedKeyFrames.delete(s) : e.selectedKeyFrames.add(s), e.selectedKeyFrame = e.selectedKeyFrames.has(s) ? s : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(s, !1, !1), e.updateKeyVisualState(), e.refreshKeyEditor();
          return;
        }
        e.selectKeyframe(d);
      }
    }), t.appendChild(c);
  }
}
function fl(e, t) {
  return [
    e.state.duration_frames,
    Number(e.timelineZoom) || 1,
    Number(e.timelinePan) || 0,
    ...t.map((a) => `${a.id}:${a.frames.join(",")}`)
  ].join("\0");
}
function gn(e) {
  const t = e.root.querySelector('[data-role="dope-rows"]');
  if (!t) return;
  const a = new Set(e.dopeChannels || []);
  a.delete("camera");
  const o = e.timelineKeyframes() || [], n = ls(o, a), s = fl(e, n);
  if (t.dataset.signature !== s) {
    t.dataset.signature = s, t.replaceChildren();
    const i = (c) => fe(e, c);
    for (const c of n) {
      const l = document.createElement("div");
      l.className = "oc-dope-row", l.dataset.channel = c.id, l.style.setProperty("--channel-color", c.color), ml(l, c.frames, i), pl(e, l, c, o, i), t.appendChild(l);
    }
  }
  for (const i of t.querySelectorAll(".oc-dope-key"))
    i.classList.toggle("at-playhead", Number(i.dataset.frame) === e.frame);
  bn(e);
}
const go = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1e3, 2e3, 5e3], yn = 46, br = 5, vn = 640;
function xn(e, t) {
  const a = t > 0 ? t : vn, o = Math.max(2, Math.floor(a / yn)), n = Math.max(1e-6, e / o);
  return go.find((s) => s >= n) ?? go[go.length - 1];
}
function hl(e, t) {
  const a = Math.max(1, e.state.duration_frames - 1), o = U(Number(e.timelineZoom) || 1, 0.1, 50), n = Number(e.timelinePan) || 0, s = a / o, i = xn(s, t), l = (i >= br ? i / br : 0) || i, d = [], p = Math.max(0, Math.floor(n / l) * l);
  for (let u = p; u <= a + 1e-6; u += l) {
    const m = Math.round(u), h = fe(e, m);
    if (!(h < -1)) {
      if (h > 101) break;
      d.push({ frame: m, percent: h, major: Math.abs(m % i) < 1e-6 });
    }
  }
  const f = fe(e, a);
  if (f <= 101 && !d.some((u) => u.major && u.frame === a)) {
    const u = yn / Math.max(1, t) * 100;
    for (let m = d.length - 1; m >= 0; m -= 1)
      if (d[m].major) {
        if (f - d[m].percent >= u) break;
        d[m].major = !1;
      }
    d.push({ frame: a, percent: f, major: !0 });
  }
  return d;
}
function ul(e) {
  return e.clientWidth || e.parentElement?.clientWidth || vn;
}
function kn(e) {
  const t = e.root.querySelector('[data-role="ruler"]');
  if (!t) return;
  t.replaceChildren();
  for (const o of hl(e, ul(t))) {
    const n = document.createElement("span");
    if (n.className = o.major ? "oc-tick major" : "oc-tick", n.style.left = `${o.percent}%`, t.appendChild(n), !o.major) continue;
    const s = document.createElement("span");
    s.className = "timeline-tick", s.textContent = String(o.frame), s.style.left = `${o.percent}%`, t.appendChild(s);
  }
  const a = fe(e, e.frame);
  if (a >= -1 && a <= 101) {
    const o = document.createElement("span");
    o.className = "oc-playhead-head", o.style.left = `${a}%`, t.appendChild(o);
  }
}
function bl(e, t) {
  const a = e.root.querySelector('[data-role="ruler"]');
  if (!a) return;
  let o = 0;
  const n = new ResizeObserver((c) => {
    const l = Math.round(c[0]?.contentRect.width ?? 0);
    !l || l === o || (o = l, kn(e));
  });
  n.observe(a), t?.addEventListener("abort", () => n.disconnect(), { once: !0 });
  const s = (c) => {
    const l = Ko(e, c, a);
    Number.isFinite(l) && e.setFrame(l, !1, !1);
  };
  a.addEventListener("pointerdown", (c) => {
    c.button === 0 && (c.preventDefault(), c.stopPropagation(), a.setPointerCapture(c.pointerId), a.dataset.scrubbing = "1", s(c));
  }, { signal: t }), a.addEventListener("pointermove", (c) => {
    a.dataset.scrubbing === "1" && s(c);
  }, { signal: t });
  const i = (c) => {
    a.dataset.scrubbing === "1" && (delete a.dataset.scrubbing, a.hasPointerCapture?.(c.pointerId) && a.releasePointerCapture(c.pointerId));
  };
  a.addEventListener("pointerup", i, { signal: t }), a.addEventListener("pointercancel", i, { signal: t }), a.addEventListener("wheel", (c) => Gr(e, c), { passive: !1, signal: t });
}
const gl = [1, 2, 2.5, 5, 10];
function yl(e, t = 5) {
  const a = Math.abs(e) / Math.max(1, t);
  if (!(a > 0) || !Number.isFinite(a)) return 1;
  const o = 10 ** Math.floor(Math.log10(a)), n = a / o;
  return (gl.find((s) => s >= n) ?? 10) * o;
}
function vl(e, t) {
  const a = Math.max(0, Math.min(4, Math.ceil(-Math.log10(t))));
  return e.toFixed(a);
}
function xl(e, { left: t, right: a, top: o, width: n, graphWidth: s, graphHeight: i, height: c, timeMin: l, timeMax: d, totalDuration: p, xFor: f, frame: u }) {
  const m = xn(d - l, s);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a", e.textAlign = "center";
  for (let y = Math.ceil(l / m) * m; y <= d; y += m) {
    const b = Math.round(y);
    if (b < 0 || b > p) continue;
    const x = f(b);
    x < t || x > n - a || (e.beginPath(), e.moveTo(x, o), e.lineTo(x, o + i), e.stroke(), e.fillText(String(b), x, c - 6));
  }
  const h = f(u);
  h >= t && h <= n - a && (e.fillStyle = "#a78bfa", e.fillText(String(u), h, c - 6)), e.textAlign = "left";
}
function kl(e, { left: t, right: a, top: o, width: n, graphHeight: s, minimum: i, maximum: c, yFor: l }) {
  const d = yl(c - i, 4);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a";
  for (let p = Math.ceil(i / d) * d; p <= c; p += d) {
    const f = l(p);
    f < o - 1 || f > o + s + 1 || (e.beginPath(), e.moveTo(t, f), e.lineTo(n - a, f), e.stroke(), e.fillText(vl(p, d), 4, f + 3));
  }
}
function Ho(e, t) {
  const a = e.getBoundingClientRect(), o = e.clientWidth / Math.max(1, a.width), n = (e.clientHeight || 180) / Math.max(1, a.height);
  return {
    x: (t.clientX - a.left) * o,
    y: (t.clientY - a.top) * n
  };
}
function wl(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.currentTarget;
  a.focus({ preventScroll: !0 }), e.curveHover = null;
  const { x: o, y: n } = Ho(a, t);
  if (t.button === 1 || t.altKey || t.button === 2 && !e.curveHitPoints?.some((l) => Math.hypot(o - l.x, n - l.y) <= 12)) {
    e.curvePanDrag = {
      startX: t.clientX,
      startY: t.clientY,
      origPanX: Number(e.curvePanX) || 0,
      origPanY: Number(e.curvePanY) || 0,
      pointerId: t.pointerId
    }, a.setPointerCapture?.(t.pointerId);
    return;
  }
  const s = (e.curveHitPoints || []).map((l) => ({ point: l, distance: Math.hypot(o - l.x, n - l.y) })).sort((l, d) => l.distance - d.distance)[0];
  if (!s || s.distance > 12) {
    if (n < 20) {
      const l = Math.max(1, e.state.duration_frames - 1), d = l / (Number(e.curveZoomX) || 1), p = Number(e.curvePanX) || 0, f = Math.round(U(p + (o - 44) / Math.max(1, a.clientWidth - 58) * d, 0, l));
      e.setFrame(f), e.curveScrub = { pointerId: t.pointerId }, a.setPointerCapture?.(t.pointerId);
      return;
    }
    e.curveBoxSelect = {
      startX: o,
      startY: n,
      currentX: o,
      currentY: n,
      pointerId: t.pointerId,
      additive: t.shiftKey,
      initial: new Set(e.selectedKeyFrames || (e.selectedKeyFrame !== null ? [e.selectedKeyFrame] : []))
    }, a.setPointerCapture?.(t.pointerId);
    return;
  }
  const i = !!(!s.point.handle && e.selectedKeyFrames?.size >= 2 && e.selectedKeyFrames.has(s.point.key.frame));
  if (s.point.handle)
    e.selectedKeyFrame = s.point.key.frame, e.editingKeyFrame = null, e.updateKeyVisualState(), e.refreshKeyEditor();
  else if (t.shiftKey) {
    e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((l) => l !== null)), e.selectedKeyFrames.has(s.point.key.frame) ? e.selectedKeyFrames.delete(s.point.key.frame) : e.selectedKeyFrames.add(s.point.key.frame), e.selectedKeyFrame = e.selectedKeyFrames.has(s.point.key.frame) ? s.point.key.frame : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(s.point.key.frame), e.updateKeyVisualState(), e.refreshKeyEditor();
    return;
  } else i ? (e.selectedKeyFrame = s.point.key.frame, e.editingKeyFrame = null, e.setFrame(s.point.key.frame)) : (e.selectKeyframe(s.point.key), e.setFrame(s.point.key.frame));
  const c = s.point.object ? s.point.key.transform || s.point.object : s.point.key.camera || s.point.key;
  e.curveDrag = {
    ...s.point,
    startY: n,
    startX: o,
    startFrame: s.point.key.frame,
    startValue: s.point.channel.get(c),
    pointerId: t.pointerId,
    historyCheckpointed: !1,
    wasMultiSelected: i,
    moved: !1
  }, i && (e.curveDrag.group = e.timelineKeyframes().filter((l) => e.selectedKeyFrames.has(l.frame)).map((l) => {
    const d = s.point.object ? l.transform || s.point.object : l.camera || l;
    return { key: l, backing: d, startFrame: l.frame, startValue: s.point.channel.get(d) };
  })), a.setPointerCapture?.(t.pointerId);
}
function Sl(e, t) {
  const a = t.currentTarget, { x: o, y: n } = Ho(a, t);
  if (e.curvePanDrag && t.pointerId === e.curvePanDrag.pointerId) {
    t.preventDefault();
    const g = t.clientX - e.curvePanDrag.startX, k = t.clientY - e.curvePanDrag.startY, $ = Math.max(1, e.state.duration_frames - 1) / (Number(e.curveZoomX) || 1), _ = Math.max(1, a.clientWidth - 58), I = a.clientHeight || 180, M = Math.max(1, I - 38);
    e.curvePanX = e.curvePanDrag.origPanX - g / _ * $, e.curvePanY = e.curvePanDrag.origPanY + k / M * 10 / (Number(e.curveZoom) || 1), e.drawCurveEditor();
    return;
  }
  if (e.curveScrub && t.pointerId === e.curveScrub.pointerId) {
    t.preventDefault();
    const g = Math.max(1, e.state.duration_frames - 1), k = g / (Number(e.curveZoomX) || 1), v = Number(e.curvePanX) || 0, $ = Math.round(U(v + (o - 44) / Math.max(1, a.clientWidth - 58) * k, 0, g));
    e.setFrame($);
    return;
  }
  if (e.curveBoxSelect && t.pointerId === e.curveBoxSelect.pointerId) {
    t.preventDefault(), e.curveBoxSelect.currentX = o, e.curveBoxSelect.currentY = n;
    const g = Math.min(e.curveBoxSelect.startX, o), k = Math.max(e.curveBoxSelect.startX, o), v = Math.min(e.curveBoxSelect.startY, n), $ = Math.max(e.curveBoxSelect.startY, n), _ = (e.curveHitPoints || []).filter((M) => !M.handle && M.x >= g && M.x <= k && M.y >= v && M.y <= $).map((M) => M.key.frame), I = new Set(e.curveBoxSelect.additive ? e.curveBoxSelect.initial : []);
    for (const M of _) I.add(M);
    e.selectedKeyFrames = I, I.size && (e.selectedKeyFrame = [...I].at(-1)), e.updateKeyVisualState(), e.drawCurveEditor();
    return;
  }
  if (!e.curveDrag || t.pointerId !== e.curveDrag.pointerId) {
    const g = (e.curveHitPoints || []).map((L) => ({ point: L, distance: Math.hypot(o - L.x, n - L.y) })).sort((L, O) => L.distance - O.distance)[0], k = Math.max(1, e.state.duration_frames - 1), v = k / (Number(e.curveZoomX) || 1), $ = Number(e.curvePanX) || 0, _ = Math.max(1, a.clientWidth - 58), I = U(Math.round($ + (o - 44) / _ * v), 0, k);
    let M = null;
    if (g && g.distance <= 14) {
      const L = g.point, O = L.object ? L.key.transform || L.object : L.key.camera || L.key;
      M = {
        x: o,
        y: n,
        frame: L.key.frame,
        channelName: L.channel.name,
        value: L.channel.get(O),
        isHandle: !!L.handle,
        handleSide: L.handle
      };
    } else n >= 20 && n <= 165 && o >= 44 && o <= a.clientWidth - 14 && (M = { x: o, y: n, frame: I });
    (!!e.curveHover != !!M || M && (e.curveHover?.frame !== M.frame || e.curveHover?.channelName !== M.channelName)) && (e.curveHover = M, e.drawCurveEditor());
    return;
  }
  if (e.curveHover = null, t.preventDefault(), t.stopPropagation(), !e.curveDrag.moved && Math.hypot(o - e.curveDrag.startX, n - e.curveDrag.startY) > 3 && (e.curveDrag.moved = !0), e.curveDrag.historyCheckpointed || (e.checkpoint?.(e.curveDrag.handle ? "Edit curve tangent" : "Edit curve"), e.curveDrag.historyCheckpointed = !0), e.curveDrag.handle) {
    const g = e.curveDrag.key, k = e.curveDrag.channel, v = e.curveDrag.handle, $ = e.curveDrag.pixelPerSegment, _ = e.curveDrag.valuePerPixel, I = e.curveDrag.keyX, M = e.curveDrag.keyY;
    g.interpolation !== "bezier" && (g.interpolation = "bezier"), g.tangents || (g.tangents = { mode: "auto", channels: {} }), g.tangents.channels || (g.tangents.channels = {});
    const L = g.tangents.channels[k.id] || {}, O = L.mode || (g.tangents.mode === "aligned" ? "aligned" : "free"), A = {
      out_x: e.curveDrag.startHandles.out_x,
      out_y: e.curveDrag.startHandles.out_y,
      in_x: e.curveDrag.startHandles.in_x,
      in_y: e.curveDrag.startHandles.in_y,
      ...L,
      mode: O
    };
    if (v === "in") {
      if (A.in_x = U((o - I) / Math.max(1, $), -0.99, -0.01), A.in_y = (M - n) * _, O === "aligned") {
        const B = Math.hypot(A.in_x, A.in_y) || 1e-6, w = Math.hypot(e.curveDrag.startHandles.out_x, e.curveDrag.startHandles.out_y) || 1e-6;
        A.out_x = -A.in_x / B * w, A.out_y = -A.in_y / B * w;
      }
    } else if (A.out_x = U((o - I) / Math.max(1, $), 0.01, 0.99), A.out_y = (M - n) * _, O === "aligned") {
      const B = Math.hypot(A.out_x, A.out_y) || 1e-6, w = Math.hypot(e.curveDrag.startHandles.in_x, e.curveDrag.startHandles.in_y) || 1e-6;
      A.in_x = -A.out_x / B * w, A.in_y = -A.out_y / B * w;
    }
    g.tangents.channels[k.id] = A, e.scheduleSerialize(), e.camera = xe(e.state, e.frame), e.applyObjectAnimationFrame(), e.render(), e.drawCurveEditor();
    return;
  }
  const s = e.curveDrag.top ?? 16, i = e.curveDrag.graphHeight ?? Math.max(1, (a.clientHeight || 180) - 38), c = e.curveDrag.minimum ?? -1, l = e.curveDrag.maximum ?? 1, d = l - (n - s) * (l - c) / Math.max(1, i), p = e.curveDrag.object ? e.curveDrag.key.transform || e.curveDrag.object : e.curveDrag.key.camera || e.curveDrag.key, f = e.curveDrag.lastFrame ?? Math.max(1, (e.state?.duration_frames || 100) - 1), u = e.curveDrag.graphWidth ?? Math.max(1, (a.clientWidth || 600) - 58), m = e.curveDrag.left ?? 44, h = f / (Number(e.curveZoomX) || 1), y = Number(e.curvePanX) || 0, b = U(Math.round(y + (o - m) / Math.max(1, u) * h), 0, f), x = !t.shiftKey && Math.abs(o - e.curveDrag.startX) > 8;
  if (e.curveDrag.group) {
    const g = d - e.curveDrag.startValue;
    let k = x ? b - e.curveDrag.startFrame : 0;
    const v = new Set(e.curveDrag.group.map((_) => _.key)), $ = e.timelineKeyframes().filter((_) => !v.has(_)).map((_) => _.frame);
    if (k) {
      const _ = f;
      let I = 0;
      if (k > 0) {
        let M = 1 / 0;
        for (const L of e.curveDrag.group) {
          M = Math.min(M, _ - L.startFrame);
          for (const O of $)
            O > L.startFrame && (M = Math.min(M, O - 1 - L.startFrame));
        }
        I = Math.max(0, Math.min(k, M));
      } else if (k < 0) {
        let M = 1 / 0;
        for (const L of e.curveDrag.group) {
          M = Math.min(M, L.startFrame - 0);
          for (const O of $)
            O < L.startFrame && (M = Math.min(M, L.startFrame - (O + 1)));
        }
        I = Math.min(0, Math.max(k, -Math.max(0, M)));
      }
      e.curveDrag.group.forEach((M) => {
        M.key.frame = M.startFrame + I;
      });
    }
    for (const _ of e.curveDrag.group)
      e.curveDrag.channel.set(_.backing, _.startValue + g);
    e.timelineKeyframes().sort((_, I) => _.frame - I.frame), e.selectedKeyFrames = new Set(e.curveDrag.group.map((_) => _.key.frame)), e.selectedKeyFrame = e.curveDrag.key.frame, e.editingKeyFrame = x ? null : e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame;
  } else if (e.curveDrag.channel.set(p, d), x) {
    const g = e.timelineKeyframes();
    let k = 0, v = f;
    for (const _ of g)
      _ !== e.curveDrag.key && (_.frame < e.curveDrag.startFrame && _.frame >= k && (k = _.frame + 1), _.frame > e.curveDrag.startFrame && _.frame <= v && (v = _.frame - 1));
    const $ = U(b, k, v);
    $ !== e.curveDrag.key.frame && (e.curveDrag.key.frame = $, e.selectedKeyFrame = $, e.selectedKeyFrames = /* @__PURE__ */ new Set([$]), e.frame = $, e.timelineKeyframes().sort((_, I) => _.frame - I.frame));
  } else
    e.editingKeyFrame = e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame;
  if (e.curveDrag.object) {
    const g = ze(e.curveDrag.key.transform || e.curveDrag.object);
    g.position && (e.curveDrag.object.position = g.position), g.rotation && (e.curveDrag.object.rotation = g.rotation), g.size && (e.curveDrag.object.size = g.size);
  } else if (e.camera) {
    const g = le(e.curveDrag.key.camera || e.camera);
    g.position && (e.camera.position = g.position), g.target && (e.camera.target = g.target), g.fov !== void 0 && (e.camera.fov = g.fov), g.roll !== void 0 && (e.camera.roll = g.roll), g.zoom !== void 0 && (e.camera.zoom = g.zoom);
  }
  e.scheduleSerialize(), e.render(), e.refreshKeyEditor(), e.drawCurveEditor();
}
function jl(e, t) {
  if (t.currentTarget.hasPointerCapture?.(t.pointerId) && t.currentTarget.releasePointerCapture(t.pointerId), e.curvePanDrag = null, e.curveScrub = null, e.curveBoxSelect = null, e.curveDrag) {
    const a = t.type === "pointercancel" || t.type === "lostpointercapture", o = e.curveDrag.historyCheckpointed, n = e.curveDrag.wasMultiSelected, s = e.curveDrag.moved, i = e.curveDrag.key;
    e.timelineKeyframes().sort((l, d) => l.frame - d.frame), e.editingKeyFrame = null, e.curveDrag = null, a && o ? e.undo?.() : n && !s && !t.shiftKey && e.selectKeyframe(i), e.serialize(), e.refreshKeys(), e.updateKeyVisualState(), e.drawCurveEditor();
  }
}
function Cl(e, t) {
  const a = e.timelineKeyframes(), o = e.selectedKeyFrames && e.selectedKeyFrames.size >= 2 ? e.selectedKeyFrames : null, n = o ? a.filter((i) => o.has(i.frame)) : [e.selectedKeyframe() || a.find((i) => i.frame === e.frame)].filter(Boolean);
  if (!n.length) return e.setStatus(r("Select a keyframe first"));
  e.checkpoint(n.length > 1 ? r("Interpolation on {n} keys").replace("{n}", n.length) : "Change interpolation");
  for (const i of n)
    i.interpolation = t;
  for (const i of e.root.querySelectorAll("[data-curve-mode]")) {
    const c = i.dataset.curveMode === t;
    i.classList.toggle("active", c), i.setAttribute("aria-pressed", String(c));
  }
  const s = e.root.querySelector('[data-role="key-interp"]');
  s && (s.value = t);
  for (const i of e.root.querySelectorAll(".key-interp-buttons [data-interp]"))
    i.classList.toggle("active", i.dataset.interp === t);
  e.selectedKeyFrame = n[0].frame, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.render(), e.drawCurveEditor(), e.setStatus(n.length > 1 ? r("{mode} interpolation on {n} keys").replace("{mode}", t.replace(/_/g, " ")).replace("{n}", n.length) : r("{value1} interpolation @ {value2}", { value1: t.replace(/_/g, " "), value2: n[0].frame }));
}
function _l(e, t) {
  e.curveChannelFilter = t;
  for (const a of e.root.querySelectorAll("[data-channel-filter]")) {
    const o = a.dataset.channelFilter === String(t);
    a.classList.toggle("active", o), a.setAttribute("aria-pressed", String(o));
  }
  e.drawCurveEditor(), e.setStatus(t === "all" ? r("Showing all channels") : r("Solo channel {value1}", { value1: t }));
}
function El(e, t) {
  if (!["auto", "vector", "free", "aligned", "flat"].includes(t)) return e.setStatus(r("Select a keyframe first"));
  const a = e.timelineKeyframes(), o = e.selectedKeyFrames && e.selectedKeyFrames.size >= 2 ? e.selectedKeyFrames : null, n = o ? a.filter((c) => o.has(c.frame)) : [e.selectedKeyframe()].filter(Boolean);
  if (!n.length) return e.setStatus(r("Select a keyframe first"));
  e.checkpoint(n.length > 1 ? r("Tangents on {n} keys").replace("{n}", n.length) : "Change tangent mode");
  const s = tt(e);
  for (const c of n) {
    t !== "auto" && c.interpolation !== "bezier" && (c.interpolation = "bezier"), c.tangents || (c.tangents = { mode: "auto", channels: {} }), c.tangents.mode = t, c.tangents.channels || (c.tangents.channels = {});
    for (const l of s)
      c.tangents.channels[l.id] ? c.tangents.channels[l.id].mode = t : c.tangents.channels[l.id] = { mode: t };
  }
  for (const c of e.root.querySelectorAll("[data-tangent-mode]")) {
    const l = c.dataset.tangentMode === t;
    c.classList.toggle("active", l), c.setAttribute("aria-pressed", String(l));
  }
  const i = e.root.querySelector('[data-role="key-tangent-mode"]');
  i && (i.value = t);
  for (const c of e.root.querySelectorAll("[data-tangent]"))
    c.classList.toggle("active", c.dataset.tangent === t);
  e.selectedKeyFrame = n[0].frame, e.serialize(), e.refreshKeys(), e.render(), e.drawCurveEditor(), e.setStatus(n.length > 1 ? r("{mode} tangents on {n} keys").replace("{mode}", t).replace("{n}", n.length) : r("Tangent mode: {value1} @ {value2}", { value1: t, value2: n[0].frame }));
}
function $l(e) {
  e.showCurveHandles = !e.showCurveHandles;
  for (const t of e.root.querySelectorAll('[data-act="curve-handles"]'))
    t.classList.toggle("active", e.showCurveHandles), t.setAttribute("aria-pressed", String(e.showCurveHandles)), t.title = r("{value1} Bézier tangent handles", { value1: e.showCurveHandles ? "Hide" : "Show" });
  e.drawCurveEditor(), e.setStatus(r("Bézier handles {value1}", { value1: e.showCurveHandles ? "shown" : "hidden" }));
}
function Ml(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey) {
    const o = Math.max(1, e.state.duration_frames - 1);
    e.curvePanX = U((Number(e.curvePanX) || 0) + (t.deltaY > 0 ? 4 : -4), -o * 0.5, o);
  } else t.altKey ? e.curvePanY = (Number(e.curvePanY) || 0) + (t.deltaY > 0 ? -1 : 1) / (Number(e.curveZoom) || 1) : t.ctrlKey ? e.curveZoomX = U((Number(e.curveZoomX) || 1) * a, 0.2, 30) : (e.curveZoom = U((Number(e.curveZoom) || 1) * a, 0.2, 30), e.curveZoomX = U((Number(e.curveZoomX) || 1) * a, 0.2, 30));
  e.drawCurveEditor(), e.setStatus(r("Curve zoom: {value1}%", { value1: (e.curveZoom * 100).toFixed(0) }));
}
function Tl(e, t) {
  e.curveZoom = U((Number(e.curveZoom) || 1) * t, 0.2, 30), e.curveZoomX = U((Number(e.curveZoomX) || 1) * t, 0.2, 30), e.drawCurveEditor(), e.setStatus(r("Curve zoom: {value1}%", { value1: (e.curveZoom * 100).toFixed(0) }));
}
function Al(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.currentTarget, { x: o, y: n } = Ho(a, t);
  if (n < 20) return;
  const s = Math.max(1, e.state.duration_frames - 1), i = s / (Number(e.curveZoomX) || 1), c = Number(e.curvePanX) || 0, l = Math.max(1, a.clientWidth - 58), d = U(Math.round(c + (o - 44) / l * i), 0, s);
  e.checkpoint?.("Insert keyframe"), e.setFrame(d), e.insertKeyframe(), e.selectedKeyFrame = d, e.selectedKeyFrames = /* @__PURE__ */ new Set([d]), e.updateKeyVisualState(), e.refreshKeys(), e.drawCurveEditor(), e.setStatus(r("Keyframe inserted @ F{frame}").replace("{frame}", d));
}
function wn(e, { selectedOnly: t = !1 } = {}) {
  const a = Math.max(1, (e.state?.duration_frames ?? 120) - 1), o = e.timelineKeyframes() || [], n = e.timelineObject(), s = tt(e), i = e.selectedKeyFrames?.size ? [...e.selectedKeyFrames] : e.selectedKeyFrame != null ? [e.selectedKeyFrame] : [], c = i.length > 0, l = t || c && i.length < o.length ? o.filter((y) => i.includes(y.frame)) : o;
  if (!l.length) {
    e.curveZoom = 1, e.curveZoomX = 1, e.curvePanX = 0, e.curvePanY = 0, e.drawCurveEditor(), e.setStatus(r("Curve view fitted"));
    return;
  }
  const d = l.map((y) => y.frame), p = Math.min(...d), f = Math.max(...d), u = Math.max(1, f - p);
  if (l.length < o.length && u < a) {
    const y = Math.max(2, Math.round(u * 0.15)), b = Math.max(0, p - y), x = Math.min(a, f + y), g = Math.max(1, x - b);
    e.curveZoomX = U(a / g, 0.2, 30), e.curvePanX = b;
  } else
    e.curveZoomX = 1, e.curvePanX = 0;
  const m = [];
  for (const y of l) {
    const b = n ? y.transform || n : y.camera || y;
    for (const x of s) {
      const g = x.get(b);
      Number.isFinite(g) && m.push(g);
    }
  }
  if (m.length > 0) {
    const y = Math.min(...m), b = Math.max(...m), x = Math.max(1e-4, b - y), g = (y + b) / 2, k = (A) => n ? so(n, A) : xe(e.state, A), v = [], $ = Math.max(1, Math.floor(a / 40));
    for (let A = 0; A <= a; A += $) {
      const B = k(A);
      for (const w of s) {
        const E = w.sample ? w.sample(A) : w.get(B);
        Number.isFinite(E) && v.push(E);
      }
    }
    let _ = Math.min(...v), I = Math.max(...v);
    (!Number.isFinite(_) || !Number.isFinite(I)) && (_ = -1, I = 1), Math.abs(I - _) < 1e-6 && (_ -= 1, I += 1);
    const M = (I - _) * 0.1;
    _ -= M, I += M;
    const L = I - _, O = (_ + I) / 2;
    if (l.length < o.length && x < L * 0.75) {
      const A = x * 1.35;
      e.curveZoom = U(L / A, 0.2, 30), e.curvePanY = g - O;
    } else
      e.curveZoom = 1, e.curvePanY = 0;
  } else
    e.curveZoom = 1, e.curvePanY = 0;
  e.drawCurveEditor();
  const h = l.length < o.length ? r("Fitted to {n} selected keys").replace("{n}", l.length) : r("Curve view fitted");
  e.setStatus(h);
}
function Pl(e) {
  wn(e);
}
function tt(e) {
  const t = e.root.querySelector('[data-role="curve-group"]')?.value || "camera";
  let a = [];
  if (!e.timelineObject() && t === "timing") {
    const n = e.timelineKeyframes().slice().sort((c, l) => c.frame - l.frame), s = new Map(n.map((c) => [c.camera, c])), i = (c) => {
      if (!n.length) return 1;
      if (c <= n[0].frame) return Ke(n[0]);
      if (c >= n.at(-1).frame) return Ke(n.at(-1));
      let l = 0;
      for (; l < n.length - 2 && n[l + 1].frame < c; ) l += 1;
      const d = n[l], p = n[l + 1], f = Math.max(1, p.frame - d.frame), u = (c - d.frame) / f, m = Ke(d), h = Ke(p);
      return m + (h - m) * u;
    };
    a = [{
      id: "timing_weight",
      name: r("Time Weight (higher = slower)"),
      color: "#f2d06b",
      keyBased: !0,
      get: (c) => {
        const l = s.get(c);
        return l ? Ke(l) : 1;
      },
      set: (c, l) => {
        const d = s.get(c);
        if (!d) return;
        const p = Math.max(0.1, Math.min(10, Number(l) || 1)), f = Do(d, p);
        f.timing ? d.timing = f.timing : delete d.timing;
      },
      sample: i
    }];
  } else if (e.timelineObject()) {
    const n = t === "target" ? "rotation" : t === "lens" ? "size" : "position", s = t === "target" ? "rot" : t === "lens" ? "scale" : "pos", i = n === "size" ? "Scale" : n[0].toUpperCase() + n.slice(1);
    a = [0, 1, 2].map((c) => ({
      id: `${s}_${"xyz"[c]}`,
      name: `${i} ${"XYZ"[c]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][c],
      get: (l) => (l && l[n] || [0, 0, 0])[c],
      set: (l, d) => {
        l && (l[n] || (l[n] = [0, 0, 0]), l[n][c] = n === "size" ? Math.max(0.01, d) : d);
      }
    }));
  } else t === "target" ? a = [0, 1, 2].map((n) => ({
    id: `target_${"xyz"[n]}`,
    name: `Target ${"XYZ"[n]}`,
    color: ["#ef5350", "#53d86a", "#4aa3ef"][n],
    get: (s) => (s && s.target || [0, 0, 0])[n],
    set: (s, i) => {
      s && (s.target || (s.target = [0, 0, 0]), s.target[n] = i);
    }
  })) : t === "camera" ? a = [
    ...[0, 1, 2].map((n) => ({
      id: `pos_${"xyz"[n]}`,
      name: `Position ${"XYZ"[n]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][n],
      get: (s) => (s && s.position || [0, 0, 0])[n],
      set: (s, i) => {
        s && (s.position || (s.position = [0, 0, 0]), s.position[n] = i);
      }
    })),
    { id: "fov", name: "Focal Length", color: "#43c7db", get: (n) => n?.fov ?? 35, set: (n, s) => {
      n && (n.fov = U(s, 5, 150));
    } },
    { id: "roll", name: "Roll", color: "#ec4899", get: (n) => n?.roll || 0, set: (n, s) => {
      n && (n.roll = U(s, -180, 180));
    } }
  ] : t === "lens" ? a = [
    { id: "fov", name: "FOV", color: "#ef8b3e", get: (n) => n?.fov ?? 35, set: (n, s) => {
      n && (n.fov = U(s, 5, 150));
    } },
    { id: "roll", name: "Roll", color: "#43c7db", get: (n) => n?.roll || 0, set: (n, s) => {
      n && (n.roll = U(s, -180, 180));
    } },
    { id: "zoom", name: "Zoom", color: "#66d17a", get: (n) => n?.zoom || 1, set: (n, s) => {
      n && (n.zoom = Math.max(0.01, s));
    } }
  ] : a = [0, 1, 2].map((n) => ({
    id: `pos_${"xyz"[n]}`,
    name: `Position ${"XYZ"[n]}`,
    color: ["#ef5350", "#53d86a", "#4aa3ef"][n],
    get: (s) => (s && s.position || [0, 0, 0])[n],
    set: (s, i) => {
      s && (s.position || (s.position = [0, 0, 0]), s.position[n] = i);
    }
  }));
  const o = e.curveChannelFilter;
  if (o && o !== "all") {
    const n = parseInt(o, 10);
    if (!isNaN(n) && a[n])
      return [a[n]];
  }
  return a;
}
function Il(e) {
  const t = e.root.querySelector('[data-role="curve-canvas"]');
  if (!t) return;
  const a = t.clientWidth, o = t.clientHeight || 180;
  if (!a || !o) return;
  const n = Math.min(2, window.devicePixelRatio || 1);
  (t.width !== Math.round(a * n) || t.height !== Math.round(o * n)) && (t.width = Math.round(a * n), t.height = Math.round(o * n));
  const s = t.getContext("2d");
  s.setTransform(n, 0, 0, n, 0, 0), s.clearRect(0, 0, a, o);
  const i = e.timelineObject(), c = e.timelineKeyframes(), l = tt(e), d = 44, p = 14, f = 16, u = 22, m = Math.max(1, a - d - p), h = Math.max(1, o - f - u), y = Math.max(1, e.state.duration_frames - 1), b = U(Number(e.curveZoomX) || 1, 0.1, 50), x = Number(e.curvePanX) || 0, g = y / b, k = x, v = x + g, $ = [], _ = Math.max(1, Math.ceil(g / Math.max(80, m))), I = (T) => i ? so(i, T) : xe(e.state, T);
  for (let T = 0; T <= y; T += _) $.push({ frame: T, value: I(T) });
  $[$.length - 1]?.frame !== y && $.push({ frame: y, value: I(y) });
  const M = $.flatMap((T) => l.map((W) => W.sample ? W.sample(T.frame) : W.get(T.value)));
  let L = Math.min(...M), O = Math.max(...M);
  (!Number.isFinite(L) || !Number.isFinite(O)) && (L = -1, O = 1), Math.abs(O - L) < 1e-6 && (L -= 1, O += 1);
  const A = (O - L) * 0.1;
  L -= A, O += A;
  const B = U(Number(e.curveZoom) || 1, 0.1, 50), w = (O + L) / 2 + (Number(e.curvePanY) || 0), E = (O - L) / B;
  L = w - E / 2, O = w + E / 2;
  const z = (T) => d + (T - k) / Math.max(1e-6, v - k) * m, R = (T) => f + h * (O - T) / Math.max(1e-6, O - L);
  if (s.fillStyle = "#111114", s.fillRect(0, 0, a, o), s.strokeStyle = "#222228", s.lineWidth = 1, s.font = "9px system-ui, -apple-system, sans-serif", s.fillStyle = "#6e727a", xl(s, {
    left: d,
    right: p,
    top: f,
    width: a,
    graphWidth: m,
    graphHeight: h,
    height: o,
    timeMin: k,
    timeMax: v,
    totalDuration: y,
    xFor: z,
    frame: e.frame
  }), kl(s, { left: d, right: p, top: f, width: a, graphHeight: h, minimum: L, maximum: O, yFor: R }), L <= 0 && O >= 0) {
    const T = R(0);
    s.strokeStyle = "#383842", s.lineWidth = 1.2, s.beginPath(), s.moveTo(d, T), s.lineTo(a - p, T), s.stroke();
  }
  e.curveHitPoints = [];
  for (const T of l) {
    s.strokeStyle = T.color, s.lineWidth = 2, s.beginPath();
    let W = !1;
    $.forEach((C) => {
      const N = z(C.frame), H = R(T.sample ? T.sample(C.frame) : T.get(C.value));
      N >= d - 50 && N <= a - p + 50 && (W ? s.lineTo(N, H) : (s.moveTo(N, H), W = !0));
    }), s.stroke();
    for (const C of c) {
      const N = i ? C.transform || i : C.camera || C, H = z(C.frame), te = R(T.get(N)), oe = C.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(C.frame);
      oe && (s.fillStyle = "rgba(242, 208, 107, 0.35)", s.beginPath(), s.arc(H, te, 8.5, 0, Math.PI * 2), s.fill()), s.fillStyle = oe ? "#ffd75e" : T.color, s.strokeStyle = "#0d0d10", s.lineWidth = 1.6, s.beginPath(), s.arc(H, te, oe ? 5.2 : 3.8, 0, Math.PI * 2), s.fill(), s.stroke(), e.curveHitPoints.push({
        x: H,
        y: te,
        key: C,
        channel: T,
        minimum: L,
        maximum: O,
        timeMin: k,
        timeMax: v,
        graphHeight: h,
        graphWidth: m,
        lastFrame: y,
        left: d,
        top: f,
        object: i
      });
    }
    if (e.showCurveHandles && !T.keyBased)
      for (let C = 0; C < c.length; C++) {
        const N = c[C], H = N.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(N.frame);
        if (!(H || e.curveChannelFilter !== "all" || c.length <= 4) || N.interpolation !== "bezier") continue;
        const oe = i ? N.transform || i : N.camera || N, J = z(N.frame), se = R(T.get(oe)), pe = c[C - 1], de = c[C + 1], be = Math.max(1, N.frame - (pe?.frame ?? N.frame - 1)), ge = Math.max(1, (de?.frame ?? N.frame + 1) - N.frame), K = ds(
          N,
          T.id,
          pe,
          de,
          (re) => T.get(i ? re.transform || i : re.camera || N)
        ), V = (O - L) / Math.max(1, h), ie = m * ge / Math.max(1, g), ce = m * be / Math.max(1, g), me = [];
        (pe || C > 0) && me.push({ side: "in", x: J + K.in_x * ce, y: se - K.in_y / V }), (de || C < c.length - 1 || c.length === 1) && me.push({ side: "out", x: J + K.out_x * ie, y: se - K.out_y / V });
        for (const re of me) {
          if (s.strokeStyle = T.color, s.lineWidth = H ? 1.5 : 1, s.beginPath(), s.moveTo(J, se), s.lineTo(re.x, re.y), s.stroke(), s.fillStyle = H ? "#2a2233" : "#171720", s.strokeStyle = H ? "#ffd75e" : T.color, s.lineWidth = H ? 2 : 1.2, s.beginPath(), re.side === "in")
            s.arc(re.x, re.y, H ? 5 : 3.8, 0, Math.PI * 2);
          else {
            const ke = H ? 4.5 : 3.2;
            s.rect(re.x - ke, re.y - ke, ke * 2, ke * 2);
          }
          s.fill(), s.stroke(), e.curveHitPoints.push({
            x: re.x,
            y: re.y,
            key: N,
            keyX: J,
            keyY: se,
            channel: T,
            minimum: L,
            maximum: O,
            timeMin: k,
            timeMax: v,
            top: f,
            left: d,
            graphHeight: h,
            graphWidth: m,
            lastFrame: y,
            object: i,
            handle: re.side,
            pixelPerSegment: re.side === "in" ? ce : ie,
            valuePerPixel: V,
            startHandles: { ...K }
          });
        }
      }
  }
  if (e.curveBoxSelect) {
    const T = Math.min(e.curveBoxSelect.startX, e.curveBoxSelect.currentX), W = Math.min(e.curveBoxSelect.startY, e.curveBoxSelect.currentY), C = Math.abs(e.curveBoxSelect.currentX - e.curveBoxSelect.startX), N = Math.abs(e.curveBoxSelect.currentY - e.curveBoxSelect.startY);
    s.fillStyle = "rgba(56, 189, 248, 0.15)", s.fillRect(T, W, C, N), s.strokeStyle = "#38bdf8", s.lineWidth = 1, s.setLineDash([4, 4]), s.strokeRect(T, W, C, N), s.setLineDash([]);
  }
  const q = z(e.frame);
  if (q >= d && q <= a - p && (s.strokeStyle = "#a78bfa", s.lineWidth = 1.5, s.beginPath(), s.moveTo(q, f), s.lineTo(q, f + h), s.stroke(), s.fillStyle = "#a78bfa", s.beginPath(), s.moveTo(q - 4, f), s.lineTo(q + 4, f), s.lineTo(q, f + 6), s.closePath(), s.fill()), e.curveDrag || e.curveHover) {
    let T = "", W = "";
    if (e.curveDrag)
      if (e.curveDrag.handle) {
        const C = e.curveDrag.handle === "in" ? "In" : "Out";
        T = `F${e.curveDrag.key.frame} · ${e.curveDrag.channel.name} (${C})`, W = "Tangent edit";
      } else if (e.curveDrag.group && e.curveDrag.group.length > 1) {
        const C = e.curveDrag.key.frame - e.curveDrag.startFrame, N = e.curveDrag.channel.get(e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera), H = N - e.curveDrag.startValue, te = C >= 0 ? `+${C}` : `${C}`, oe = H >= 0 ? `+${H.toFixed(2)}` : `${H.toFixed(2)}`;
        T = `${e.curveDrag.group.length} keys · ΔF: ${te} · ΔVal: ${oe}`, W = `${e.curveDrag.channel.name}: ${N.toFixed(2)}`;
      } else {
        const C = e.curveDrag.key.frame - e.curveDrag.startFrame, N = e.curveDrag.channel.get(e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera), H = N - e.curveDrag.startValue, te = C >= 0 ? `+${C}` : `${C}`, oe = H >= 0 ? `+${H.toFixed(2)}` : `${H.toFixed(2)}`;
        T = `F${e.curveDrag.key.frame} (${te}) · ${e.curveDrag.channel.name}: ${N.toFixed(2)} (${oe})`;
      }
    else if (e.curveHover)
      if (e.curveHover.channelName) {
        const C = Number.isFinite(e.curveHover.value) ? e.curveHover.value.toFixed(2) : "";
        T = `F${e.curveHover.frame} · ${e.curveHover.channelName}: ${C}`, e.curveHover.isHandle && (W = `Handle ${e.curveHover.handleSide}`);
      } else
        T = `Frame ${e.curveHover.frame}`;
    if (T) {
      s.save(), s.font = "11px system-ui, -apple-system, sans-serif";
      const C = s.measureText(T), N = W ? s.measureText(W) : { width: 0 }, H = Math.max(C.width, N.width) + 16, te = W ? 32 : 20, oe = a - p - H - 6, J = f + 6;
      s.fillStyle = "rgba(18, 18, 24, 0.88)", s.strokeStyle = "#38384a", s.lineWidth = 1, s.beginPath(), s.roundRect ? s.roundRect(oe, J, H, te, 4) : s.rect(oe, J, H, te), s.fill(), s.stroke(), s.fillStyle = "#e2e8f0", s.fillText(T, oe + 8, J + (W ? 13 : 14)), W && (s.fillStyle = "#94a3b8", s.font = "9.5px system-ui, -apple-system, sans-serif", s.fillText(W, oe + 8, J + 26)), s.restore();
    }
  }
  for (const T of e.root.querySelectorAll("[data-tangent-mode]")) {
    const W = e.selectedKeyframe(), C = W?.tangents?.channels?.[l[0]?.id]?.mode || W?.tangents?.mode || "auto";
    T.classList.toggle("active", T.dataset.tangentMode === C);
  }
  for (const T of e.root.querySelectorAll("[data-channel-filter]"))
    T.classList.toggle("active", T.dataset.channelFilter === (e.curveChannelFilter || "all"));
  for (const T of e.root.querySelectorAll("[data-curve-mode]"))
    T.classList.toggle("active", T.dataset.curveMode === e.selectedKeyframe()?.interpolation);
}
function gr(e, { filter: t, label: a, color: o, title: n }) {
  const s = document.createElement("button");
  if (s.type = "button", s.className = "curve-mode", s.dataset.channelFilter = t, s.title = n, o) {
    const i = document.createElement("span");
    i.className = "ch-dot", i.style.background = o, s.appendChild(i);
  }
  return s.appendChild(document.createTextNode(a)), s.addEventListener("click", () => e.setChannelFilter(t)), s;
}
function zl(e) {
  const t = e.curveChannelFilter;
  e.curveChannelFilter = "all";
  try {
    return tt(e);
  } finally {
    e.curveChannelFilter = t;
  }
}
function Uo(e) {
  const t = e.root.querySelector('[data-role="curve-legend"]');
  if (!t) return;
  const a = e.timelineObject(), o = a ? a.name || a.type : e.activeCameraTrack().name, n = zl(e), s = `${o}\0${n.map((c) => `${c.id}:${c.color}`).join("|")}`;
  if (t.dataset.signature !== s) {
    t.dataset.signature = s, t.replaceChildren();
    const c = document.createElement("span");
    c.className = "oc-graph-legend-title", c.textContent = o, t.appendChild(c), t.appendChild(gr(e, {
      filter: "all",
      label: r("All"),
      color: null,
      title: r("Show all curves in group")
    })), n.forEach((l, d) => {
      t.appendChild(gr(e, {
        filter: String(d),
        label: r(l.name),
        color: l.color,
        title: r("Show only {channel}").replace("{channel}", r(l.name))
      }));
    });
  }
  const i = String(e.curveChannelFilter ?? "all");
  for (const c of t.querySelectorAll("[data-channel-filter]")) {
    const l = c.dataset.channelFilter === i;
    c.classList.toggle("active", l), c.setAttribute("aria-pressed", String(l));
  }
}
const yr = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
function Sn(e, t) {
  const a = e.state.cameras.findIndex((n) => n.id === t), o = a >= 0 ? e.state.cameras[a] : null;
  return { camera: o, color: o?.color || yr[Math.max(0, a) % yr.length] };
}
function Qe(e) {
  e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render();
}
function jn(e, t) {
  const a = Ro(e.state);
  for (const n of t.querySelectorAll(".oc-sequence-shot")) {
    const s = a[Number(n.dataset.cutIndex)];
    if (!s) continue;
    const i = fe(e, s.start), c = fe(e, s.end + 1);
    n.style.left = `${i}%`, n.style.width = `${Math.max(0.4, c - i)}%`;
  }
  const o = t.querySelector(".oc-sequence-playhead");
  o && (o.style.left = `${fe(e, e.frame)}%`);
}
function Fl(e) {
  e.checkpoint("Auto-split shots"), e.state.sequence = {
    ...e.state.sequence || { recording_path: "" },
    enabled: !0,
    cuts: fs(e.state)
  }, Qe(e), e.setStatus(r("Split into {count} shots").replace("{count}", String(e.state.sequence.cuts.length)));
}
function Va(e, t, a, { disabled: o = !1 } = {}) {
  const n = document.createElement("button");
  return n.type = "button", n.className = "curve-mode", n.title = t, n.textContent = e, n.disabled = o, n.addEventListener("click", a), n;
}
function Ll(e, t) {
  const a = document.createElement("div");
  a.className = "oc-sequence-toolbar";
  const o = e.state.cameras.length < 2;
  if (a.appendChild(Va(
    r("Auto-split shots"),
    r("Split the timeline evenly across every camera"),
    () => Fl(e),
    { disabled: o }
  )), t.length && (a.appendChild(Va(
    r("Split at playhead"),
    r("Cut the current shot in two at the playhead"),
    () => {
      e.checkpoint("Split shot"), Xr(e.state, e.frame, null) ? Qe(e) : e.setStatus(r("Move the playhead inside a shot first"));
    },
    { disabled: o }
  )), a.appendChild(Va(
    r("Clear edit"),
    r("Remove every shot and stop cutting the timeline"),
    () => {
      e.checkpoint("Clear edit"), e.state.sequence = { ...e.state.sequence, enabled: !1, cuts: [] }, Qe(e), e.setStatus(r("Multi-camera edit cleared"));
    }
  ))), a.appendChild(Va(
    e.audioWaveformPeaks?.length ? r("Replace audio") : r("Load audio"),
    r("Load an audio track to cut against"),
    () => e.root.querySelector('[data-role="audio-file"]')?.click()
  )), t.length) {
    const n = document.createElement("span");
    n.className = "oc-sequence-summary", n.textContent = r("{count} shots · drag a divider to trim · right-click a shot for its camera").replace("{count}", String(t.length)), a.appendChild(n);
  }
  return a;
}
function Ol(e, t, a, o, n) {
  t.preventDefault(), t.stopPropagation();
  try {
    a.setPointerCapture(t.pointerId);
  } catch {
  }
  e.checkpoint("Trim cut"), e.sequenceDrag = !0;
  const s = (c) => {
    if (!(c.buttons & 1)) return i();
    ps(e.state, n, Ko(e, c, o)) && jn(e, o);
  }, i = () => {
    a.removeEventListener("pointermove", s), a.removeEventListener("pointerup", i), a.removeEventListener("pointercancel", i), a.removeEventListener("lostpointercapture", i);
    try {
      a.releasePointerCapture(t.pointerId);
    } catch {
    }
    e.sequenceDrag && (e.sequenceDrag = !1, e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render(), e.setStatus(r("Cut trimmed")));
  };
  a.addEventListener("pointermove", s), a.addEventListener("pointerup", i), a.addEventListener("pointercancel", i), a.addEventListener("lostpointercapture", i);
}
function Kl(e, t, a, o, n) {
  t.preventDefault(), t.stopPropagation();
  const { camera: s } = Sn(e, a.camera_id);
  e.contextMenu?.show(t, s?.name || r("Shot"), [
    ...e.state.cameras.map((i) => ({
      label: r("Use {name}").replace("{name}", i.name),
      icon: "pi-video",
      disabled: i.id === a.camera_id,
      run: () => {
        e.checkpoint("Change shot camera"), e.state.sequence.cuts[o].camera_id = i.id, Qe(e);
      }
    })),
    null,
    {
      label: r("Split at playhead"),
      icon: "pi-arrows-h",
      disabled: e.frame <= a.start || e.frame > a.end,
      run: () => {
        e.checkpoint("Split shot"), Xr(e.state, e.frame, null) && Qe(e);
      }
    },
    {
      label: r("Remove shot"),
      icon: "pi-trash",
      danger: !0,
      disabled: n === 1,
      run: () => {
        e.checkpoint("Remove shot"), ms(e.state, o) && Qe(e);
      }
    }
  ]);
}
function Dl(e, t, a, o) {
  const { camera: n, color: s } = Sn(e, t.camera_id), i = document.createElement("div");
  i.className = "oc-sequence-shot", i.dataset.cutIndex = String(a), i.style.left = `${fe(e, t.start)}%`, i.style.width = `${Math.max(0.4, fe(e, t.end + 1) - fe(e, t.start))}%`, i.style.setProperty("--shot-color", s), n?.recording_path || i.classList.add("no-proxy"), i.title = r("{name} · F{start}-{end}").replace("{name}", n?.name || t.camera_id).replace("{start}", String(t.start)).replace("{end}", String(t.end));
  const c = document.createElement("span");
  if (c.className = "oc-sequence-name", c.textContent = n?.name || t.camera_id, i.appendChild(c), a > 0) {
    const l = document.createElement("span");
    l.className = "oc-sequence-handle", l.title = r("Drag to trim the cut"), l.addEventListener("pointerdown", (d) => Ol(e, d, l, o, a)), i.appendChild(l);
  }
  return i.addEventListener("contextmenu", (l) => Kl(e, l, t, a, o.__cutCount)), i.addEventListener("pointerdown", () => {
    e.root.querySelector('[data-role="graph-sequence"]')?.focus?.({ preventScroll: !0 });
  }), i;
}
function Rl(e) {
  const t = document.createElement("div");
  t.className = "oc-sequence-audio";
  const a = e.audioWaveformPeaks;
  if (!a?.length) {
    const n = document.createElement("span");
    return n.className = "oc-sequence-empty oc-sequence-audio-empty", n.textContent = r("No audio track. Load one to cut to the beat."), t.appendChild(n), t;
  }
  const o = document.createElement("canvas");
  return o.className = "oc-sequence-waveform", t.appendChild(o), requestAnimationFrame(() => {
    const n = Math.max(1, Math.round(t.clientWidth)), s = Math.max(1, Math.round(t.clientHeight));
    o.width = n, o.height = s;
    const i = o.getContext("2d");
    if (!i) return;
    const c = Math.max(1, e.state.duration_frames - 1), l = Math.min(50, Math.max(0.1, Number(e.timelineZoom) || 1)), d = Number(e.timelinePan) || 0, p = c / l;
    i.fillStyle = ae.warning;
    for (let f = 0; f < a.length; f++) {
      const m = (f / (a.length - 1) * c - d) / Math.max(1e-6, p) * n;
      if (m < -4 || m > n + 4) continue;
      const h = a[f] * s * 0.9;
      i.fillRect(m, (s - h) / 2, Math.max(1, n / a.length * l - 0.5), h);
    }
  }), t;
}
function Cn(e, t) {
  if (!t) return;
  const a = t.querySelector('[data-role="sequence-track"]');
  if (e.sequenceDrag && a) {
    jn(e, a);
    return;
  }
  const o = Ro(e.state);
  t.replaceChildren(Ll(e, o));
  const n = document.createElement("div");
  n.className = "oc-sequence-tracks", n.dataset.role = "sequence-track", n.__cutCount = o.length;
  const s = document.createElement("div");
  if (s.className = "oc-sequence-lane", s.dataset.role = "sequence-lane", s.setAttribute("aria-label", r("Multi-camera edit")), o.length)
    for (const [c, l] of o.entries()) {
      const d = fe(e, l.start);
      fe(e, l.end + 1) < -5 || d > 105 || s.appendChild(Dl(e, l, c, n));
    }
  else {
    const c = document.createElement("span");
    c.className = "oc-sequence-empty", c.textContent = e.state.cameras.length > 1 ? r("No shots yet. Auto-split hands each camera a slice of the timeline.") : r("Add a second camera, then Auto-split to cut between them."), s.appendChild(c);
  }
  n.appendChild(s), n.appendChild(Rl(e));
  const i = document.createElement("span");
  i.className = "oc-sequence-playhead", i.style.left = `${fe(e, e.frame)}%`, n.appendChild(i), t.appendChild(n);
}
const Nl = ['[data-act="curve-zoom-in"]', '[data-act="curve-zoom-out"]', '[data-act="curve-fit"]', '[data-act="curve-handles"]'], vr = { curves: "Graph", dope: "Timeline", sequence: "Sequence" };
function Io(e, t) {
  const a = t in vr ? t : "dope";
  e.graphTab = a;
  for (const l of e.root.querySelectorAll("[data-graph-tab]")) {
    const d = l.dataset.graphTab === a;
    l.classList.toggle("active", d), l.setAttribute("aria-pressed", String(d));
  }
  const o = e.root.querySelector('[data-role="curve-canvas"]'), n = e.root.querySelector('[data-role="dope-stage"]'), s = e.root.querySelector('[data-role="graph-sequence"]'), i = e.root.querySelector('[data-role="curve-legend"]'), c = e.root.querySelector('[data-role="graph-toolbar"]');
  o && (o.hidden = a !== "curves"), n && (n.hidden = a !== "dope"), s && (s.hidden = a !== "sequence"), i && (i.hidden = a !== "curves"), c && (c.hidden = a !== "curves");
  for (const l of Nl) {
    const d = e.root.querySelector(l);
    d && (d.disabled = a !== "curves");
  }
  a === "sequence" ? (Cn(e, s), s?.focus?.({ preventScroll: !0 })) : a === "curves" && e.drawCurveEditor(), e.setStatus(r(vr[a]));
}
function ql(e) {
  e.graphTab === "sequence" && Cn(e, e.root.querySelector('[data-role="graph-sequence"]'));
}
function Bl(e, t) {
  const a = e.root.querySelector('[data-role="graph-tabs"]');
  a && a.addEventListener("keydown", (o) => {
    if (o.key === "ArrowLeft" || o.key === "ArrowRight") {
      o.preventDefault(), o.stopPropagation();
      const n = [...a.querySelectorAll("[data-graph-tab]")], s = n.findIndex((i) => i.classList.contains("active"));
      if (s >= 0 && n.length > 1) {
        const i = o.key === "ArrowRight" ? (s + 1) % n.length : (s - 1 + n.length) % n.length;
        n[i].focus(), Io(e, n[i].dataset.graphTab);
      }
    }
  }, { signal: t });
  for (const o of e.root.querySelectorAll("[data-graph-tab]"))
    o.addEventListener("click", (n) => {
      n.preventDefault(), n.stopPropagation(), Io(e, o.dataset.graphTab);
    }, { signal: t });
}
function Wl(e) {
  const t = e.root.querySelector('[data-role="keys"]');
  if (!t) return;
  t.innerHTML = "";
  const a = e.timelineObject(), o = e.timelineKeyframes(), n = Math.max(1, e.state.duration_frames - 1), s = U(Number(e.timelineZoom) || 1, 0.1, 50), i = Number(e.timelinePan) || 0, c = n / s, l = i;
  if (e.audioWaveformPeaks && e.audioWaveformPeaks.length) {
    const g = document.createElement("canvas");
    g.className = "timeline-waveform", g.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:0.35", g.width = Math.max(1, t.clientWidth || 600), g.height = Math.max(1, t.clientHeight || 68);
    const k = g.getContext("2d"), v = e.audioWaveformPeaks, $ = g.width, _ = g.height, I = _ / 2;
    k.fillStyle = ae.warning;
    for (let M = 0; M < v.length; M++) {
      const O = (M / (v.length - 1) * n - l) / Math.max(1e-6, c) * $;
      if (O >= -5 && O <= $ + 5) {
        const A = v[M] * (_ * 0.85);
        k.fillRect(O, I - A / 2, Math.max(1, $ / v.length * s - 0.5), A);
      }
    }
    t.appendChild(g);
  }
  if (e.state.playback_range) {
    const g = document.createElement("div");
    g.className = "playback-range";
    const k = fe(e, e.state.playback_range[0]), v = fe(e, e.state.playback_range[1]);
    g.style.left = `${k}%`, g.style.width = `${Math.max(0, v - k)}%`, t.appendChild(g);
  }
  hs(e, t);
  for (const g of e.state.markers || []) {
    const k = fe(e, g.frame);
    if (k < -5 || k > 105) continue;
    const v = document.createElement("span");
    v.className = "timeline-marker", v.style.left = `${k}%`, v.style.setProperty("--marker-color", g.color), v.title = g.name, t.appendChild(v);
  }
  if (o.length > 1) {
    const g = fe(e, o[0].frame), k = fe(e, o[o.length - 1].frame), v = document.createElement("span");
    v.className = "oc-dope-rail", v.style.left = `${Math.min(g, k)}%`, v.style.width = `${Math.abs(k - g)}%`, v.style.setProperty("--channel-color", ae.typeCamera), t.appendChild(v);
  }
  const d = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const g of o) {
    const k = fe(e, g.frame);
    if (k < -5 || k > 105) continue;
    const v = document.createElement("button");
    v.type = "button", v.className = `key${g.frame === e.frame ? " at-playhead" : ""}${d.has(g.frame) ? " selected" : ""}${g.frame === e.editingKeyFrame ? " editing" : ""}`, v.dataset.keyFrame = String(g.frame), v.dataset.interp = g.interpolation || "ease", v.setAttribute("aria-label", r("{value1} keyframe at frame {value2}", { value1: a?.name || "Camera", value2: g.frame })), v.title = r("Frame {value1} · {value2} · Drag: Retime · Alt+Drag: Duplicate", { value1: g.frame, value2: g.interpolation }), v.style.left = `${k}%`;
    const $ = document.createElement("span");
    $.className = "key-label", $.textContent = String(g.frame), v.appendChild($), v.addEventListener("pointerdown", (_) => {
      if (_.preventDefault(), _.stopPropagation(), v.focus({ preventScroll: !0 }), _.altKey) {
        e.checkpoint("Duplicate keyframe");
        const M = a ? { frame: g.frame, transform: ze(g.transform), interpolation: g.interpolation } : { frame: g.frame, camera: le(g.camera), interpolation: g.interpolation }, L = e.timelineKeyframes();
        L.push(M), L.sort((O, A) => O.frame - A.frame), e.selectedKeyFrame = M.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([M.frame]), e.keyDrag = { key: M, box: t, isDuplicate: !0, historyCheckpointed: !0, moving: [{ key: M, startFrame: M.frame }], startPointerFrame: g.frame, startClientX: _.clientX, startClientY: _.clientY }, e.setFrame(M.frame, !1, !1), e.setStatus(r("Duplicating key from {value1}...", { value1: g.frame }));
        return;
      }
      if (_.shiftKey) {
        e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((M) => M !== null)), e.selectedKeyFrames.has(g.frame) ? e.selectedKeyFrames.delete(g.frame) : e.selectedKeyFrames.add(g.frame), e.selectedKeyFrame = e.selectedKeyFrames.has(g.frame) ? g.frame : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(g.frame, !1, !1), e.updateKeyVisualState(), e.refreshKeyEditor();
        return;
      }
      e.selectedKeyFrames?.has(g.frame) || (e.selectedKeyFrames = /* @__PURE__ */ new Set([g.frame])), e.selectedKeyFrame = g.frame;
      const I = e.timelineKeyframes().filter((M) => e.selectedKeyFrames.has(M.frame));
      e.keyDrag = { key: g, box: t, historyCheckpointed: !1, moving: I.map((M) => ({ key: M, startFrame: M.frame })), startPointerFrame: g.frame, startClientX: _.clientX, startClientY: _.clientY }, e.setFrame(g.frame, !1, !1);
    }), v.addEventListener("click", (_) => {
      _.preventDefault(), _.stopPropagation(), !(_.shiftKey || e.suppressKeyClick) && e.selectKeyframe(g);
    }), t.appendChild(v);
  }
  const p = e.activeCameraTrack(), f = e.root.querySelector('[data-role="timeline-summary"]');
  if (f) {
    f.replaceChildren();
    const g = document.createElement("span");
    g.style.fontWeight = "700", e.selectedEntity === "object" && a ? (g.style.color = ae.typeReferenceCard, g.textContent = `📦 ${a.name || a.type}`, f.title = r("Currently animating object: {value1}", { value1: a.name || a.type })) : (g.style.color = ae.typeCamera, g.textContent = `🎥 ${p.name}`, f.title = r("Currently animating camera: {value1}", { value1: p.name })), f.append(g, document.createTextNode(` · ${o.length} key${o.length === 1 ? "" : "s"}`));
    const k = e.selectedKeyFrames?.size || 0;
    k > 1 && f.append(document.createTextNode(` · ${k} selected`));
    const v = o.filter(($) => $.frame > e.state.duration_frames - 1).length;
    if (v) {
      const $ = document.createElement("span");
      $.className = "oc-dormant-keys", $.textContent = ` · ${v} beyond end`, $.title = r("Keys past the end of the timeline are kept. Lengthen the shot to reach them again."), f.append($);
    }
  }
  const u = e.root.querySelector('[data-role="key-count"]');
  u && (u.textContent = String(o.length));
  const m = e.root.querySelector('[data-role="camera-summary"]');
  m && (m.textContent = `${p.name} · Key F${e.selectedKeyFrame ?? e.frame}`);
  const h = e.root.querySelector('[data-role="camera-menu-list"]');
  if (h) {
    h.innerHTML = "";
    for (const g of e.state.cameras) {
      const k = document.createElement("button");
      k.type = "button", k.className = g.id === e.state.active_camera_id ? "selected" : "";
      const v = document.createElement("i");
      v.className = "pi pi-video";
      const $ = document.createElement("span");
      $.textContent = `${g.name} · ${g.keyframes.length} key${g.keyframes.length === 1 ? "" : "s"}${g.id === e.state.playblast_camera_id ? " · PLAYBLAST" : ""}`, k.append(v, $), k.addEventListener("click", () => {
        e.activateCamera(g.id), e.closeMenus();
      }), h.appendChild(k);
    }
  }
  const y = e.root.querySelector('[data-role="frame-total"]');
  y && (y.textContent = `/ ${Math.max(1, e.state.duration_frames)}`);
  const b = e.root.querySelector('[data-role="preview-title"]');
  b && (b.textContent = `${p.name} · ${r("Frame")} ${e.frame}`);
  const x = e.root.querySelector('[data-role="inspector-camera-name"]');
  x && (x.textContent = p.name), kn(e), gn(e), Uo(e), ql(e), e.refreshCameraSelectors(), e.refreshKeyEditor(), e.updateEditState(), e.drawCurveEditor(), e.perf && (e.perf.timelineRefreshCount = (e.perf.timelineRefreshCount || 0) + 1);
}
class _n {
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
async function Go(e, { route: t, field: a = "file", file: o }) {
  if (!o) throw new TypeError("A file is required");
  const n = new FormData();
  n.append(a, o, o.name);
  const s = await e.fetchApi(t, { method: "POST", body: n });
  if (!s.ok) throw new Error(await s.text());
  return s.json();
}
const Vl = `
      /* ---- bounded modal shell (Director only) ----------------------- */
      /* .majoor-omnicam alone is shared with Extractor/Monitor's own
         templates, so the bounded-height layout is scoped to the extra
         "oc-director" class template.js stamps on the root. Everything below
         becomes a fixed-height row except .oc-body (the grid) and .oc-dock
         (the lower deck), which share the remaining height 1fr/flex:0 0 auto. */
      /* box-sizing:border-box: COMPONENT_STYLES' ".majoor-omnicam *" reset
         doesn't reach the root itself, so its own 1px border (COMPONENT_STYLES)
         would otherwise add 2px on top of a height:100% that already exactly
         matches .oc-workbench-content -- a small but real overflow. */
      .majoor-omnicam.oc-director{
        --oc-bg-app: var(--bg-color, #121214);
        --oc-bg-panel: var(--comfy-menu-bg, #18181b);
        --oc-bg-control: var(--comfy-input-bg, #222226);
        --oc-bg-sunken: var(--comfy-input-bg, #0d0d0f);
        --oc-border-default: var(--border-color, #2e2e34);
        --oc-border-subtle: var(--border-color, #232328);
        --oc-text-primary: var(--input-text, #f4f4f6);
        --oc-text-secondary: var(--input-text, #a1a1aa);
        --oc-text-muted: var(--input-text, #a1a1aa);
        --oc-accent: #2563eb;
        --oc-accent-hover: #3b82f6;
        --oc-radius: 4px;
        --oc-radius-sm: 3px;
        box-sizing:border-box;display:flex;flex-direction:column;height:100%;overflow:hidden
      }
      .majoor-omnicam.oc-director>.oc-header,
      .majoor-omnicam.oc-director>.top,
      .majoor-omnicam.oc-director>.oc-footer{flex:0 0 auto}
      .majoor-omnicam.oc-director>.oc-body{flex:1 1 auto;min-height:0}
      /* .oc-dock now holds a single child, .oc-lower: the camera preview and
         Timeline/Graph/Sequence (unified as tabs of one block, Director modal
         audit Lot 3) share this one bounded region instead of stacking as two
         independent blocks. */
      .majoor-omnicam.oc-director>.oc-dock{flex:0 1 auto;max-height:clamp(160px,30%,320px);display:flex;flex-direction:column;min-height:0;overflow-y:auto}
      .majoor-omnicam.oc-director>.oc-dock>.oc-lower{flex:0 0 auto}

      /* ---- header --------------------------------------------------- */
      .majoor-omnicam .oc-header-spacer,.majoor-omnicam .oc-toolbar-spacer,.majoor-omnicam .oc-transport-spacer,.majoor-omnicam .oc-footer-spacer,.majoor-omnicam .oc-graph-spacer{flex:1 1 auto;min-width:0}
      .majoor-omnicam .oc-status-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:var(--oc-radius-sm);background:var(--oc-ok-bg);border:1px solid var(--oc-ok-line);color:var(--oc-ok-text);font-size:11px;font-weight:600;white-space:nowrap}
      .majoor-omnicam .oc-status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
      .majoor-omnicam .oc-overflow>summary{width:28px;height:28px;justify-content:center;padding:0;color:var(--oc-text-dim)}

      /* ---- toolbar & DCC menubar ------------------------------------ */
      .majoor-omnicam .top{gap:8px;padding:4px 10px;background:linear-gradient(180deg,#161b24 0%,#11151c 100%);border-bottom:1px solid var(--oc-line);min-height:38px}
      .majoor-omnicam .oc-dcc-menubar{display:flex;align-items:center;gap:6px}
      .majoor-omnicam .toolbar-menu{position:relative}
      .majoor-omnicam .toolbar-menu>summary{display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:3px 10px;border-radius:6px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.07);color:var(--oc-text-dim,#94a3b8);font-weight:600;font-size:11.5px;letter-spacing:0.01em;cursor:pointer;user-select:none;list-style:none;box-shadow:0 1px 2px rgba(0,0,0,0.2);transition:all .18s cubic-bezier(0.16,1,0.3,1)}
      .majoor-omnicam .toolbar-menu>summary::-webkit-details-marker{display:none}
      .majoor-omnicam .toolbar-menu>summary>i:first-child{font-size:11.5px;color:#818cf8;transition:color .18s ease,transform .18s ease}
      .majoor-omnicam .toolbar-menu[data-menu="file"]>summary>i:first-child{color:#f59e0b}
      .majoor-omnicam .toolbar-menu[data-menu="scene"]>summary>i:first-child{color:#38bdf8}
      .majoor-omnicam .toolbar-menu[data-menu="camera"]>summary>i:first-child{color:#c084fc}
      .majoor-omnicam .toolbar-menu[data-menu="view"]>summary>i:first-child{color:#34d399}
      .majoor-omnicam .toolbar-menu[data-menu="display"]>summary>i:first-child{color:#60a5fa}
      .majoor-omnicam .toolbar-menu>summary>i.pi-chevron-down{font-size:8.5px;margin-left:3px;opacity:.45;transition:transform .2s cubic-bezier(0.16,1,0.3,1),opacity .18s ease}
      .majoor-omnicam .toolbar-menu>summary:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.16);color:#f8fafc;box-shadow:0 2px 6px rgba(0,0,0,0.35)}
      .majoor-omnicam .toolbar-menu>summary:hover>i:first-child{transform:scale(1.08)}
      .majoor-omnicam .toolbar-menu>summary:hover>i.pi-chevron-down{opacity:.85}
      .majoor-omnicam .toolbar-menu[open]>summary{background:rgba(99,102,241,0.18) !important;border-color:rgba(129,140,248,0.55) !important;color:#ffffff !important;box-shadow:0 0 12px rgba(99,102,241,0.25),0 2px 8px rgba(0,0,0,0.4) !important}
      .majoor-omnicam .toolbar-menu[open]>summary>i:first-child{color:#c7d2fe !important;text-shadow:0 0 8px rgba(129,140,248,0.6)}
      .majoor-omnicam .toolbar-menu[open]>summary>i.pi-chevron-down{transform:rotate(180deg);opacity:1;color:#c7d2fe !important}
      .majoor-omnicam .menu-panel{width:275px;max-height:min(600px,calc(100vh - 80px));overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--oc-line) transparent;background:rgba(20,25,34,0.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.11);border-radius:8px;box-shadow:0 18px 40px rgba(0,0,0,0.72),inset 0 1px 0 rgba(255,255,255,0.08);animation:ocMenuSlideDown .15s cubic-bezier(0.16,1,0.3,1)}
      @keyframes ocMenuSlideDown{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
      .majoor-omnicam .menu-pack{display:flex;flex-direction:column;gap:5px;background:rgba(255,255,255,.02);border:1px solid var(--oc-line);border-radius:var(--oc-radius-sm);padding:6px}
      .majoor-omnicam .menu-pack-header{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--oc-text-dim);padding:0 2px 2px}
      .majoor-omnicam .menu-pack-badge{font-size:9px;padding:1px 5px;border-radius:10px;background:rgba(255,255,255,.06);color:var(--oc-text-faint);font-weight:600;letter-spacing:0}
      .majoor-omnicam .menu-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
      .majoor-omnicam .menu-grid .span-2{grid-column:span 2}
      .majoor-omnicam .menu-grid button{display:inline-flex;align-items:center;justify-content:center;text-align:center;min-height:28px;padding:4px 6px;font-size:11px;gap:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .majoor-omnicam .menu-grid button i{font-size:11px;flex-shrink:0}
      .majoor-omnicam .menu-panel>button{display:flex;align-items:center;justify-content:center;gap:7px;text-align:center;min-height:28px;padding:5px 8px;font-size:11.5px}
      .majoor-omnicam .menu-panel .hint,.majoor-omnicam .hint{font-size:9.5px;font-style:italic;color:var(--oc-text-dim);opacity:.85;line-height:1.35;padding:1px 2px;display:block}
      .majoor-omnicam .menu-panel label>select{width:116px;padding:2px 4px;font-size:11px}
      .majoor-omnicam .menu-row{display:flex;gap:4px;align-items:center}
      .majoor-omnicam .menu-row>button{flex:1;justify-content:center;text-align:center}
      .majoor-omnicam .menu-row>.icon-button{flex:none}
      .majoor-omnicam .menu-panel input[type=color]{width:46px;height:24px;padding:0;background:transparent;cursor:pointer}
      .majoor-omnicam .menu-panel label>input[type=checkbox]{width:16px;height:16px;padding:0;cursor:pointer}
      .majoor-omnicam .oc-shelf-modes{display:flex;align-items:center;gap:5px;margin-right:4px}
      .majoor-omnicam .oc-render-mode{min-width:146px;height:26px;padding:2px 8px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:var(--oc-radius-sm);color:var(--oc-text);font-size:11.5px;font-weight:600;cursor:pointer;transition:border-color .15s ease,box-shadow .15s ease}
      .majoor-omnicam .oc-render-mode:hover{border-color:var(--oc-accent);box-shadow:0 0 0 1px var(--oc-accent-soft)}
      .majoor-omnicam .oc-render-mode:focus-visible{outline:none;border-color:var(--oc-accent);box-shadow:0 0 0 2px var(--oc-accent-soft)}
      .majoor-omnicam .oc-render-mode optgroup,.majoor-omnicam .vp-shading-select optgroup{background:#161a24;color:var(--oc-text-dim);font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
      .majoor-omnicam .oc-render-mode option,.majoor-omnicam .vp-shading-select option{background:#1a1f2c;color:var(--oc-text);font-size:11px;font-weight:500}
      .majoor-omnicam .oc-playblast{gap:6px;padding:4px 12px;border-radius:var(--oc-radius-sm);background:var(--oc-accent);border-color:var(--oc-accent);color:var(--oc-accent-ink);font-weight:600;font-size:12px}
      .majoor-omnicam .oc-playblast:hover{background:var(--oc-accent-hover);border-color:var(--oc-accent-hover);color:#fff}
      .majoor-omnicam .oc-playblast-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}

      /* ---- Channel Box, Axis & Key Indicators ----------------------- */
      .majoor-omnicam .oc-channel-key{display:inline-flex;align-items:center;justify-content:center;width:12px;font-size:9px;color:var(--oc-key-none,#52525b);cursor:pointer;user-select:none;margin-right:2px}
      .majoor-omnicam .oc-channel-key:hover{color:var(--oc-key-active,#eab308)}
      .majoor-omnicam .oc-axis.x .oc-axis-tag{color:#ef4444;font-weight:700}
      .majoor-omnicam .oc-axis.y .oc-axis-tag{color:#22c55e;font-weight:700}
      .majoor-omnicam .oc-axis.z .oc-axis-tag{color:#3b82f6;font-weight:700}
      .majoor-omnicam .oc-axis:hover{border-color:var(--oc-accent);cursor:ew-resize}
      .majoor-omnicam .oc-axis input{cursor:ew-resize}

      /* ---- DCC Studio Status Bar ------------------------------------ */
      .majoor-omnicam .oc-footer{display:flex;align-items:center;gap:8px;padding:4px 10px;background:var(--oc-panel);border-top:1px solid var(--oc-line);min-height:26px;font-size:11px}
      .majoor-omnicam .oc-status-badge{display:inline-flex;align-items:center;gap:5px;font-weight:700;color:var(--oc-ok);letter-spacing:.05em}
      .majoor-omnicam .oc-footer-sep{color:var(--oc-line);font-weight:300}
      .majoor-omnicam .oc-footer-hints{color:var(--oc-text-dim);font-family:inherit}
      .majoor-omnicam .oc-key-hint{display:inline-block;padding:1px 4px;border:1px solid var(--oc-line);border-radius:2px;background:var(--oc-panel-2);color:var(--oc-text);font-family:monospace;font-size:10px}


      /* ---- body grid ------------------------------------------------ */
      .majoor-omnicam .oc-body{display:grid;grid-template-columns:var(--oc-left-w,264px) 7px minmax(0,1fr) 9px var(--oc-side-w,280px);gap:8px;padding:8px;background:var(--oc-bg);align-items:start}
      .majoor-omnicam .oc-stage{min-width:0;min-height:0;align-self:stretch}
      /* min-height:0 on every .oc-body grid item, not just on .oc-body
         itself: a grid item's default min-height:auto resolves to its own
         content size and blocks align-self:stretch from ever shrinking it
         below that -- so once .oc-director's flex column constrains .oc-body
         to less than its natural content height, each item needs this too or
         the tallest one (usually .oc-left) keeps rendering past the row and
         gets painted over by .oc-dock underneath. */
      .majoor-omnicam .oc-side{align-self:stretch;min-height:0}
      /* align-self:stretch (not the old content-height "start"): once
         .oc-body's own row is bounded (Director bounded-layout block above),
         .oc-left needs the same full-row-height + internal-scroll treatment
         as .oc-side, or its content (the fixed-height .scene-tree plus its
         search/add-object/filter chrome) can overflow past the row and get
         painted over by .oc-dock below it, stealing its clicks. */
      .majoor-omnicam .oc-left{min-width:0;min-height:0;align-self:stretch;display:flex;flex-direction:column;gap:7px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);padding:8px}
      .majoor-omnicam .oc-panel-head{display:flex;align-items:center;gap:6px}
      .majoor-omnicam .oc-panel-head>strong{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-panel-spacer{flex:1 1 auto}
      /* .oc-left-body (styles.js) is already flex:1 1 auto;min-height:0 --
         it only needed a real row height (above) and this overflow to become
         the scrolling region a bounded .oc-left now needs. */
      .majoor-omnicam .oc-left-body{overflow-y:auto}
      .majoor-omnicam .oc-left .scene-tree{height:var(--oc-outliner-h,220px);min-height:80px}
      /* ASSETS tab: kept as an extra safety cap alongside the new
         .oc-left-body scroll region above -- harmless belt-and-braces, not
         load-bearing for containment anymore. */
      .majoor-omnicam .oc-left .oc-asset-grid{max-height:var(--oc-assets-h,340px)}
      .majoor-omnicam .oc-left .oc-agent-plan-list{max-height:var(--oc-agent-h,220px);min-height:40px;overflow-y:auto;text-align:left;white-space:normal}
      .majoor-omnicam .oc-left .oc-agent-plan-list:empty{min-height:0;margin:0;padding:0}
      .majoor-omnicam .oc-body .viewport-wrap{border-radius:var(--oc-radius);overflow:hidden;box-shadow:none;border:1px solid var(--oc-line)}
      /* Fullscreen keeps the full DCC shell: Scene | Viewport | Inspector + deck. */
      .majoor-omnicam.oc-fullscreen .oc-lower{display:block}

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
      .majoor-omnicam .vp-pill{padding:4px 11px;border-radius:999px;background:rgba(17,24,39,.94);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11px}
      .majoor-omnicam .vp-pill-select{appearance:none;padding-right:20px;cursor:pointer}
      .majoor-omnicam .vp-pills .vp-pill:first-child{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .vp-corner{position:absolute;top:9px;right:9px;z-index:6;display:flex;align-items:center;gap:5px}
      .majoor-omnicam .vp-zoom{padding:4px 9px;border-radius:var(--oc-radius-sm);background:rgba(17,24,39,.94);border:1px solid var(--oc-line);color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .vp-rail{position:absolute;top:52px;left:9px;z-index:6;display:flex;flex-direction:column;gap:3px;padding:4px;border-radius:var(--oc-radius);background:rgba(17,24,39,.94);border:1px solid var(--oc-line)}
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
      .majoor-omnicam .vp-axis{position:absolute;top:44px;right:9px;z-index:6;pointer-events:none;overflow:visible;border-radius:50%;background:rgba(11,16,24,.85);border:1px solid rgba(255,255,255,.08);box-shadow:0 4px 14px rgba(0,0,0,.45);filter:drop-shadow(0 1px 3px rgba(0,0,0,.65))}
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
      .majoor-omnicam .vp-camera-hud{position:absolute;top:9px;left:50%;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:7px;padding:3px 12px;border-radius:999px;background:rgba(17,24,39,.96);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11px;box-shadow:0 4px 16px rgba(0,0,0,.45);pointer-events:auto}
      .majoor-omnicam .vp-camera-hud .hud-cam-lock{background:none;border:none;padding:0 2px;color:var(--oc-text-dim);cursor:pointer;display:inline-flex;align-items:center}
      .majoor-omnicam .vp-camera-hud .hud-cam-lock:hover{color:var(--oc-text)}
      .majoor-omnicam .vp-camera-hud .hud-cam-lock.locked{color:var(--oc-danger)}
      .majoor-omnicam .vp-camera-hud .hud-cam-name{font-weight:600;color:var(--oc-text)}
      .majoor-omnicam .vp-camera-hud .hud-cam-lens{font-weight:600;color:var(--oc-accent-hover)}
      .majoor-omnicam .vp-camera-hud .hud-cam-fov{color:var(--oc-text-dim)}
      .majoor-omnicam .vp-camera-hud .hud-cam-dist{color:var(--oc-text-dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .vp-camera-hud .hud-divider{color:var(--oc-text-faint);opacity:.5}
      .majoor-omnicam .vp-camera-hud .hud-roll-reset{background:var(--oc-danger-bg);border:1px solid var(--oc-danger-line);border-radius:999px;padding:1px 6px;color:var(--oc-danger-text);font-size:10px;cursor:pointer;display:inline-flex;align-items:center;gap:3px}
      .majoor-omnicam .vp-camera-hud .hud-roll-reset:hover{background:rgba(237,107,115,.3)}

      /* Viewport Corner Overlays & Shading */
      .majoor-omnicam .vp-overlay-group{display:flex;align-items:center;gap:1px;padding:2px;border-radius:var(--oc-radius-sm);background:rgba(17,24,39,.94);border:1px solid var(--oc-line)}
      .majoor-omnicam .vp-overlay-btn{width:22px;height:22px;display:grid;place-items:center;border-radius:4px;border:none;background:transparent;color:var(--oc-text-dim);padding:0;cursor:pointer}
      .majoor-omnicam .vp-overlay-btn:hover{color:var(--oc-text);background:rgba(255,255,255,0.06)}
      .majoor-omnicam .vp-overlay-btn.active{color:var(--oc-accent);background:var(--oc-accent-soft)}
      .majoor-omnicam .vp-shading-select{font-size:11px;padding:3px 8px;border-radius:var(--oc-radius-sm);background:rgba(17,24,39,.94);border:1px solid var(--oc-line);color:var(--oc-text);cursor:pointer}

      /* Floating Mini-Transport in Fullscreen */
      .majoor-omnicam .vp-floating-transport{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:7;display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:rgba(11,16,24,.97);border:1px solid var(--oc-line);box-shadow:0 8px 24px rgba(0,0,0,.65)}
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
      /* .oc-side already carries height:100% (below) inside a now-bounded
         .oc-body row, so this flex child's own min-height:0 is what clamps
         it -- no need for a max-height formula (the previous
         "calc(100vh - 360px)" measured the real browser window, which is
         wrong inside the workbench's 92vh modal). */
      .majoor-omnicam .oc-side-body{display:flex;flex-direction:column;gap:7px;flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding-right:4px;scroll-behavior:smooth}
      .majoor-omnicam .oc-outliner-add-bar{position:sticky;top:32px;z-index:9;background:var(--oc-bg);padding:2px 0}
      .majoor-omnicam .oc-add-menu{width:100%}
      .majoor-omnicam .oc-add-summary-btn{display:flex;align-items:center;gap:6px;width:100%;height:27px;padding:3px 8px;border-radius:var(--oc-radius-sm);background:var(--oc-panel-2);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11.5px;font-weight:600;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .oc-add-summary-btn:hover,.majoor-omnicam .oc-add-menu[open] .oc-add-summary-btn{background:var(--oc-panel-2);border-color:var(--oc-line)}
      .majoor-omnicam .oc-add-menu-panel{width:210px;padding:5px 0;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.65);display:flex;flex-direction:column;gap:1px}
      .majoor-omnicam .oc-add-header{color:var(--oc-text-dim);font-size:11px;font-weight:600;padding:4px 12px 4px;user-select:none}
      .majoor-omnicam .oc-add-menu-item{display:flex;align-items:center;gap:10px;width:100%;padding:6px 12px;border:none;background:transparent;color:var(--oc-text);font-size:12.5px;font-weight:600;cursor:pointer;text-align:left;transition:background .12s ease;position:relative}
      .majoor-omnicam .oc-add-menu-item:hover{background:rgba(255,255,255,0.08);color:#ffffff}
      .majoor-omnicam .oc-add-svg{width:16px;height:16px;flex-shrink:0;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-add-menu-item:hover .oc-add-svg{color:#ffffff}
      .majoor-omnicam .oc-submenu-arrow{margin-left:auto;font-size:9px;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-has-submenu{user-select:none}
      .majoor-omnicam .oc-add-submenu{position:absolute;left:calc(100% - 2px);top:-4px;min-width:165px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.7);display:none;flex-direction:column;gap:1px;padding:4px 0;z-index:70}
      .majoor-omnicam .oc-has-submenu:hover .oc-add-submenu,.majoor-omnicam .oc-has-submenu:focus-within .oc-add-submenu{display:flex}
      .majoor-omnicam .outliner-quick-bar{display:none}
      .majoor-omnicam .outliner-filter-chips{position:sticky;top:62px;z-index:9;background:var(--oc-bg);padding-bottom:3px;border-bottom:1px solid var(--oc-line-soft)}
      .majoor-omnicam .shot-key-nav{position:sticky;top:0;z-index:10;background:var(--oc-bg);padding:2px 0 4px;border-bottom:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-search{flex:1;min-width:0;padding:4px 9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border-color:var(--oc-line)}
      /* .oc-search's flex:1 above is meant for a ROW toolbar (.oc-asset-toolbar,
         .oc-agent-provider-row: the search/select fills leftover WIDTH next to
         an icon button). The Outliner's search input, uniquely, is a direct
         child of .oc-left-body -- a COLUMN flex -- so the same flex:1 instead
         grows it to fill leftover COLUMN HEIGHT, ballooning it into a tall
         empty box (worse the less the Outliner list itself takes up, so it
         looked tied to resizing the list, but the list was never the cause).
         flex:0 0 auto hands its height back to its own content, like every
         other fixed-size row in that column. */
      .majoor-omnicam .oc-left-body>input.oc-search{flex:0 0 auto}
      /* Prevent hint/status paragraphs in column flex panels from ballooning in height */
      .majoor-omnicam .oc-asset-panel>p,
      .majoor-omnicam .oc-agent-panel>p{flex:0 0 auto !important;text-align:left;white-space:normal;overflow:visible;text-overflow:clip;margin:2px 0 4px}
      .majoor-omnicam .oc-agent-privacy{font-size:9.5px;font-style:italic;color:var(--oc-text-dim);opacity:.85;margin:2px 0 6px}
      .majoor-omnicam .oc-agent-describe{display:block;flex:0 0 auto;width:100%;min-height:110px;max-height:260px;resize:vertical;overflow-y:auto;font:inherit;font-size:11.5px;line-height:1.45;padding:8px 10px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line);color:var(--oc-text);box-sizing:border-box}
      .majoor-omnicam .oc-agent-panel .oc-asset-foot{margin-top:auto;padding-top:8px;border-top:1px solid var(--oc-line-soft);display:flex;gap:6px}
      .majoor-omnicam .oc-agent-panel .oc-asset-foot .oc-btn{flex:1;text-align:center;justify-content:center;min-height:28px;font-size:11px}
      .majoor-omnicam .oc-asset-thumb{width:100%;min-height:76px;aspect-ratio:1;object-fit:cover;border-radius:4px;background:var(--oc-sunken);display:flex;align-items:center;justify-content:center}
      .majoor-omnicam .oc-asset-card{position:relative;display:flex;flex-direction:column;gap:4px;padding:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px;cursor:pointer;text-align:left}
      .majoor-omnicam .oc-asset-card:hover{border-color:var(--oc-text-faint)}
      .majoor-omnicam .oc-asset-card.selected{border-color:var(--oc-accent);box-shadow:0 0 0 1px var(--oc-accent)}
      .majoor-omnicam .oc-asset-name{font-size:10px;font-weight:600;color:var(--oc-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
      .majoor-omnicam .oc-asset-kind-tag{font-size:8px;font-weight:600;letter-spacing:.06em;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-asset-badge{position:absolute;top:6px;right:6px;font-size:7.5px;font-weight:700;letter-spacing:.05em;padding:1px 4px;background:var(--oc-ok-bg);border:1px solid var(--oc-ok-line);border-radius:3px;color:var(--oc-ok-text);z-index:2}
      .majoor-omnicam .oc-asset-kinds{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 6px}
      .majoor-omnicam .oc-asset-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:4px;margin-top:auto}
      .majoor-omnicam .oc-asset-foot .oc-btn{font-size:11px;padding:4px 10px;min-height:26px}
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
      .majoor-omnicam .oc-batch-toolbar{display:flex;align-items:center;justify-content:space-between;padding:4px 8px;margin:3px 6px;background:var(--oc-accent-soft);border:1px solid color-mix(in srgb,var(--oc-accent) 40%,transparent);border-radius:6px;gap:6px}
      .majoor-omnicam .oc-batch-badge{font-size:10px;font-weight:600;color:var(--oc-text);background:color-mix(in srgb,var(--oc-accent) 35%,transparent);padding:2px 6px;border-radius:4px}
      .majoor-omnicam .oc-batch-actions{display:flex;align-items:center;gap:3px}
      .majoor-omnicam .oc-batch-actions .icon-button{width:22px;height:22px;font-size:11px}
      .majoor-omnicam .oc-batch-actions .icon-button.danger:hover{color:var(--oc-danger)}
      .majoor-omnicam .scene-section-header{display:flex;align-items:center;gap:6px;padding:4px 6px;cursor:pointer;user-select:none;font-size:10px;font-weight:700;color:var(--oc-text-dim);text-transform:uppercase;letter-spacing:.05em;margin-top:4px;border-radius:3px}
      .majoor-omnicam .scene-section-header:hover{background:rgba(255,255,255,0.04);color:var(--oc-text)}
      .majoor-omnicam .scene-section-title{flex:0 0 auto}
      .majoor-omnicam .scene-section-count{font-size:9.5px;color:var(--oc-text-faint);font-weight:400}
      .majoor-omnicam .scene-item.scene-item-child{position:relative}
      .majoor-omnicam .scene-item.scene-item-child::before{content:"";position:absolute;left:8px;top:0;bottom:0;width:1px;background:var(--oc-line);opacity:.5}
      .majoor-omnicam .key-tangent-btn{font-size:10px;padding:2px 7px;border-radius:4px;border:1px solid var(--oc-line);background:var(--oc-sunken);color:var(--oc-text-dim);cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .key-tangent-btn:hover{border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .key-tangent-btn.active{background:var(--oc-accent);border-color:var(--oc-accent-hover);color:#fff;font-weight:700;box-shadow:none}
      .majoor-omnicam .oc-lens-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:3px}
      .majoor-omnicam .oc-lens-presets button{padding:3px 2px;font-size:10.5px;background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim)}
      .majoor-omnicam .oc-slider-row input[type=range]{flex:1;min-width:0;height:22px;accent-color:var(--oc-accent);padding:0;background:transparent;border:0;cursor:pointer}
      .majoor-omnicam .oc-slider-value{flex:0 0 38px;text-align:right;color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .oc-card-actions{display:flex;gap:5px;margin-top:3px}
      .majoor-omnicam .oc-card-actions>button{flex:1;padding:5px 8px;font-size:11px}
      .majoor-omnicam .oc-card-actions>button.primary{background:var(--oc-accent);border-color:var(--oc-accent);box-shadow:none}
      .majoor-omnicam .oc-card-actions>button.primary:hover{background:var(--oc-accent-hover);border-color:var(--oc-accent-hover)}
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
      .majoor-omnicam .oc-health{--oc-health-ok:var(--oc-ok);--oc-health-warn:var(--oc-warn);--oc-health-over:var(--oc-danger)}
      .majoor-omnicam .oc-health-badge{margin-left:auto;padding:2px 7px;border-radius:9px;background:var(--oc-sunken);color:var(--oc-text-dim);font-size:10px;font-weight:600;letter-spacing:.02em}
      .majoor-omnicam .oc-health-badge.ok{background:var(--oc-ok-bg);color:var(--oc-ok-text)}
      .majoor-omnicam .oc-health-badge.warn{background:var(--oc-warn-bg);color:var(--oc-warn-text)}
      .majoor-omnicam .oc-health-badge.over{background:var(--oc-danger-bg);color:var(--oc-danger-text)}
      .majoor-omnicam .oc-health-score-badge{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;padding:2px 6px;border-radius:9px}
      .majoor-omnicam .oc-health-score-badge.grade-a{background:var(--oc-ok-bg);color:var(--oc-ok-text);border:1px solid var(--oc-ok-line)}
      .majoor-omnicam .oc-health-score-badge.grade-b{background:var(--oc-accent-soft);color:var(--oc-accent-hover);border:1px solid var(--oc-accent)}
      .majoor-omnicam .oc-health-score-badge.grade-c{background:var(--oc-warn-bg);color:var(--oc-warn-text);border:1px solid var(--oc-warn-line)}
      .majoor-omnicam .oc-health-score-badge.grade-d{background:var(--oc-danger-bg);color:var(--oc-danger-text);border:1px solid var(--oc-danger-line)}
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
      .majoor-omnicam .oc-health-band[data-grade=warn]{background:var(--oc-warn-bg);border-top:2px solid var(--oc-warn)}
      .majoor-omnicam .oc-health-band[data-grade=over]{background:var(--oc-danger-bg);border-top:2px solid var(--oc-danger)}

      /* ---- footer ---------------------------------------------------- */
      .majoor-omnicam .oc-footer{display:flex;align-items:center;gap:9px;padding:8px 12px;background:var(--oc-panel);border-top:1px solid var(--oc-line)}
      .majoor-omnicam .oc-footer .oc-help{flex:0 1 auto;padding:0;background:transparent}
      .majoor-omnicam .oc-footer .oc-help>summary{color:var(--oc-text-dim);font-size:11.5px}
      .majoor-omnicam .oc-help-body{position:absolute;z-index:40;max-width:520px;margin-top:7px;padding:10px 12px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:var(--oc-radius);box-shadow:0 16px 34px rgba(0,0,0,.62)}
      .majoor-omnicam label.oc-disabled{opacity:.45;cursor:not-allowed}

      /* ---- preferences modal ------------------------------------------ */
      .majoor-omnicam .oc-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.82);z-index:900;display:flex;align-items:center;justify-content:center;padding:16px}
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
`, Hl = `
      .majoor-omnicam .menu-section{display:flex;flex-direction:column;gap:5px}
      .majoor-omnicam[data-density="basic"] [data-density-min="animation"],
      .majoor-omnicam[data-density="basic"] [data-density-min="advanced"],
      .majoor-omnicam[data-density="animation"] [data-density-min="advanced"]{display:none !important}
`, Ul = `
      .majoor-omnicam .oc-drawer-toggle{display:none !important}

      @container (max-width:1120px){
        .majoor-omnicam .top{flex-wrap:wrap !important;align-content:flex-start}
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
`, Gl = `
      .majoor-omnicam{font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--fg-color,var(--oc-text));background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:10px;overflow:visible;user-select:none;container-type:inline-size}
      .majoor-omnicam *{box-sizing:border-box}
      .majoor-omnicam *::-webkit-scrollbar{width:6px;height:6px}
      .majoor-omnicam *::-webkit-scrollbar-track{background:rgba(0,0,0,0.3);border-radius:3px}
      .majoor-omnicam *::-webkit-scrollbar-thumb{background:#444456;border-radius:3px}
      .majoor-omnicam *::-webkit-scrollbar-thumb:hover{background:#65657e}
      .majoor-omnicam .top{position:relative;z-index:10;display:flex !important;flex-direction:row !important;flex-wrap:nowrap !important;gap:8px;align-items:center;min-height:38px;padding:4px 8px;background:var(--oc-panel);border-bottom:1px solid var(--oc-line)}
      .majoor-omnicam .top > *{flex-shrink:0}
      .majoor-omnicam button,.majoor-omnicam select,.majoor-omnicam input{font:inherit;color:var(--oc-text-dim);background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px;padding:4px 8px;transition:background .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease}
      .majoor-omnicam button{display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
      .majoor-omnicam select,.majoor-omnicam input{display:inline-block;vertical-align:middle}
      .majoor-omnicam [hidden],.majoor-omnicam input[hidden],.majoor-omnicam input[type="file"]{display:none !important}
      .majoor-omnicam select,.majoor-omnicam select option,.majoor-omnicam select optgroup{background-color:var(--oc-panel-2) !important;color:#ffffff !important;color-scheme:dark}
      .majoor-omnicam select:focus{border-color:var(--oc-accent);box-shadow:0 0 0 1px var(--oc-accent)}
      .majoor-omnicam select option:hover,.majoor-omnicam select option:focus,.majoor-omnicam select option:checked{background-color:var(--oc-accent-soft) !important;color:#ffffff !important}
      .majoor-omnicam button:hover{background:var(--oc-panel-2);border-color:var(--oc-line);color:#fff}
      .majoor-omnicam button:active{background:var(--oc-sunken);border-color:var(--oc-line)}
      .majoor-omnicam button.primary{background:var(--oc-ok-bg);border-color:var(--oc-ok-line);color:var(--oc-ok-text);box-shadow:none}
      .majoor-omnicam button.primary:hover{background:var(--oc-ok-line);border-color:var(--oc-ok);color:#fff;box-shadow:none}
      .majoor-omnicam button.active,.majoor-omnicam button[aria-pressed="true"],.majoor-omnicam .icon-button.active,.majoor-omnicam .icon-button[aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam .icon-button{display:inline-grid !important;place-items:center !important;width:28px !important;height:28px !important;min-width:28px !important;padding:0 !important;cursor:pointer;color:var(--oc-text-dim)}
      .majoor-omnicam .icon-button .pi{font-size:13px;line-height:1;display:block;margin:0 auto}
      .majoor-omnicam .icon-button:hover{color:#fff;border-color:var(--oc-line)}
      
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
      
      .majoor-omnicam .toolbar-menu{position:relative}.majoor-omnicam .toolbar-menu>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 9px;border:1px solid transparent;border-radius:6px;cursor:pointer;white-space:nowrap;list-style:none}.majoor-omnicam .toolbar-menu>summary::-webkit-details-marker{display:none}.majoor-omnicam .toolbar-menu[open]>summary,.majoor-omnicam .toolbar-menu>summary:hover{background:var(--oc-panel-2);border-color:var(--oc-line)}
      .majoor-omnicam .menu-panel{position:absolute;z-index:50;top:calc(100% + 5px);left:0;display:flex;flex-direction:column;gap:5px;width:240px;padding:8px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:8px;box-shadow:0 10px 24px #000c}.majoor-omnicam .menu-panel.right{right:0;left:auto}.majoor-omnicam .menu-panel button{display:flex;align-items:center;gap:7px;text-align:left}.majoor-omnicam .menu-panel label{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--oc-text-dim)}.majoor-omnicam .menu-panel label>select,.majoor-omnicam .menu-panel label>input[type=number]{width:126px}.majoor-omnicam .menu-panel label>input[type=checkbox]{width:auto}.majoor-omnicam .menu-title{color:var(--oc-text-faint);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.majoor-omnicam .menu-divider{height:1px;margin:4px 0;background:var(--oc-line)}.majoor-omnicam .camera-menu-list{display:flex;max-height:180px;flex-direction:column;gap:4px;overflow-y:auto}.majoor-omnicam .camera-menu-list button.selected{border-color:var(--oc-warn-line);color:var(--oc-warn)}
      
      /* Viewport Wrapper & Prominent Highlights */
      /* No forced aspect-ratio: the true output framing is already drawn at
         render time (viewport/resolution-gate.js's drawResolutionGate/
         gateAspect letterboxes the canvas to the real output ratio
         regardless of the container's shape), so the wrap is free to fill
         whatever space .oc-stage's bounded layout gives it. */
      .majoor-omnicam .viewport-wrap{position:relative;width:100%;height:100%;min-height:280px;background:var(--oc-sunken);touch-action:none;overscroll-behavior:contain;pointer-events:auto;outline:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06);transition:box-shadow .15s ease}
      .majoor-omnicam .viewport-wrap.auto-key{box-shadow:inset 0 0 0 2px var(--oc-danger)}
      .majoor-omnicam .viewport-wrap.edit-mode{box-shadow:inset 0 0 0 2px var(--oc-accent) !important}
      
      /* Prominent Tally / Live Recording Status Banner */
      .majoor-omnicam .viewport-tally-banner{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:8;display:inline-flex;align-items:center;gap:7px;padding:4px 14px;border-radius:20px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,0.6);transition:all .2s ease}
      .majoor-omnicam .viewport-tally-banner[hidden]{display:none}
      .majoor-omnicam .viewport-tally-banner .tally-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner{display:inline-flex;background:var(--oc-danger-bg);border:1px solid var(--oc-danger-line);color:var(--oc-danger-text)}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner .tally-dot{background:var(--oc-danger);animation:tallyBlink 1.6s infinite}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner{display:inline-flex;background:var(--oc-accent-soft);border:1px solid color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line));color:var(--oc-text)}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner .tally-dot{background:var(--oc-accent)}
      @keyframes tallyBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.75)}}

      /* Extracted-camera preview banner: staged, not applied -- see director-link.js */
      .majoor-omnicam .extractor-import-banner{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:8;display:flex;align-items:center;gap:10px;padding:7px 10px 7px 14px;border-radius:10px;font-size:12px;background:rgba(17,24,39,0.96);border:1px solid var(--oc-line);color:var(--oc-text);box-shadow:0 6px 20px rgba(0,0,0,0.5)}
      .majoor-omnicam .extractor-import-banner[hidden]{display:none}
      .majoor-omnicam .extractor-import-banner i.pi-video{color:var(--oc-text-dim)}
      .majoor-omnicam .extractor-import-banner .ei-import{background:var(--oc-accent);color:#0b1220;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer}
      .majoor-omnicam .extractor-import-banner .ei-import:hover{background:var(--oc-accent-hover)}
      .majoor-omnicam .extractor-import-banner .ei-dismiss{background:transparent;border:none;color:var(--oc-text-dim);cursor:pointer;padding:4px;line-height:0}
      .majoor-omnicam .extractor-import-banner .ei-dismiss:hover{color:var(--oc-text)}
      
      .majoor-omnicam canvas{display:block;width:100%;height:100%;pointer-events:auto;outline:none;cursor:grab}.majoor-omnicam canvas.dragging{cursor:grabbing}
      
      /* Floating Quick Bar in Viewport */
      .majoor-omnicam .viewport-quick-bar{position:absolute;z-index:6;left:10px;right:270px;top:10px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:4px 8px;background:rgba(17,24,39,0.96);border:1px solid rgba(255, 255, 255, 0.12);border-radius:7px;box-shadow:0 4px 12px rgba(0,0,0,0.4)}
      .majoor-omnicam .viewport-quick-bar select{height:25px;min-width:105px;font-size:11px}
      .majoor-omnicam .viewport-quick-bar button{height:25px;padding:0 7px;display:inline-flex;align-items:center;gap:4px;font-size:11px}
      .majoor-omnicam .quick-divider{width:1px;height:16px;background:rgba(255,255,255,0.15);margin:0 2px}
      .majoor-omnicam .selection-mode-group{display:inline-flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--oc-line);border-radius:6px;background:var(--oc-sunken)}
      .majoor-omnicam .selection-mode-group button{height:23px;padding:0 6px;font-size:10px;border-color:transparent;background:transparent;border-radius:4px;white-space:nowrap}
      .majoor-omnicam .selection-mode-group .pi{font-size:9px}
      
      /* HUD */
      .majoor-omnicam .hud{position:absolute;left:10px;top:48px;z-index:4;color:var(--oc-text);background:rgba(17,24,39,0.94);border:1px solid rgba(255, 255, 255, 0.1);border-radius:7px;padding:6px 10px;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.35);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;line-height:1.45}
      .majoor-omnicam .hud .hud-badge{display:inline-block;padding:1px 5px;border-radius:4px;font-weight:700;font-size:9px;background:var(--oc-accent);color:#fff;margin-right:4px}
      .majoor-omnicam .hud .hud-badge.active{background:var(--oc-warn);color:#fff}
      .majoor-omnicam .hud .hud-hl{color:var(--oc-warn);font-weight:600}

      /* Right Inspector Panel */
      .majoor-omnicam .viewport-inspector{position:absolute;z-index:6;right:10px;top:10px;width:250px;max-height:calc(100% - 20px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:10px;background:rgba(17,24,39,0.97);border:1px solid rgba(255, 255, 255, 0.15);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.5);transition:transform .2s ease,opacity .2s ease}
      .majoor-omnicam .viewport-inspector[data-collapsed="true"]{transform:translateX(calc(100% + 15px));opacity:0;pointer-events:none}
      .majoor-omnicam .inspector-tabs{display:flex;gap:5px;margin-bottom:8px;background:var(--oc-sunken);padding:3px;border-radius:6px;border:1px solid var(--oc-line)}
      .majoor-omnicam .inspector-tab{flex:1;text-align:center;padding:5px 3px;font-size:10px;font-weight:600;background:transparent;border:1px solid transparent;border-radius:4px;cursor:pointer;color:var(--oc-text-faint);transition:all .15s ease}
      .majoor-omnicam .inspector-tab:hover{color:var(--oc-text-dim);background:rgba(255,255,255,0.05)}
      .majoor-omnicam .inspector-tab.active{background:var(--oc-accent-soft) !important;border-color:var(--oc-accent) !important;color:#fff !important;box-shadow:none !important}
      
      /* Outliner & Items */
      .majoor-omnicam .outliner-quick-bar{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-bottom:6px}
      .majoor-omnicam .outliner-quick-bar button{font-size:10px;padding:3px 2px;height:24px;display:inline-flex;align-items:center;justify-content:center;gap:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .majoor-omnicam .outliner-quick-bar button i{font-size:9px;flex-shrink:0}
      /* Explicit height (not max-height) driven by the drag handle: dragging
         down enlarges the visible list box itself -- the node grows to match
         (see refitNode) -- instead of just moving a cramped inner scrollbar.
         The inner scroll only kicks in when the list is longer than the height
         the user has chosen. */
      .majoor-omnicam .scene-tree{display:flex;flex-direction:column;flex:0 0 auto;gap:3px;height:var(--oc-outliner-h,220px);min-height:80px;overflow-y:auto;overscroll-behavior:contain;margin-bottom:0;background:var(--oc-sunken);padding:4px;border-radius:5px;border:1px solid var(--oc-line-soft)}
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
      .majoor-omnicam .scene-item.selected{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .scene-item.selected.primary{background:var(--oc-accent-soft);border-color:var(--oc-accent);box-shadow:inset 2px 0 0 var(--oc-accent)}
      .majoor-omnicam .scene-item.active-view{border-color:var(--oc-ok);background:var(--oc-ok-bg)}
      .majoor-omnicam .scene-item-label{flex:1;min-width:0;display:inline-flex;align-items:center;gap:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .scene-item-actions{display:inline-flex;align-items:center;justify-content:flex-end;gap:2px;flex-shrink:0;margin-left:auto}
      .majoor-omnicam .scene-action-btn{width:20px !important;height:20px !important;min-width:20px !important;padding:0 !important;display:inline-flex !important;align-items:center;justify-content:center;border-radius:4px;border:1px solid transparent;background:transparent;color:var(--oc-text-dim);cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .scene-action-btn:hover{background:var(--oc-panel-2);border-color:var(--oc-line);color:#fff}
      .majoor-omnicam .scene-item .pi{width:14px;text-align:center;flex-shrink:0}
      .majoor-omnicam .motion-tools{position:absolute;z-index:7;left:50%;top:50px;display:none;gap:3px;padding:4px;transform:translateX(-50%);background:rgba(17,24,39,.96);border:1px solid var(--oc-line);border-radius:6px}
      .majoor-omnicam.oc-motion-mode .motion-tools{display:flex}
      .majoor-omnicam .motion-tools button{width:28px;height:28px;min-width:28px;padding:0}
      .majoor-omnicam .motion-tools button.active{background:var(--oc-ok-bg) !important;border-color:var(--oc-ok) !important;box-shadow:none !important}
      .majoor-omnicam canvas[data-motion-tool="track"],.majoor-omnicam canvas[data-motion-tool="anchor"],.majoor-omnicam canvas[data-motion-tool="project"],.majoor-omnicam canvas[data-motion-tool="erase"]{cursor:crosshair}
      .majoor-omnicam .motion-section-title{margin-top:8px}.majoor-omnicam .motion-preset-bar{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;margin:4px 0}.majoor-omnicam .motion-preset-bar button{min-width:0;padding:3px 1px;font-size:9px;overflow:hidden}
      .majoor-omnicam .motion-empty{padding:8px;color:var(--oc-text-faint);text-align:center;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:5px}.majoor-omnicam .motion-layer-list{display:flex;max-height:110px;flex-direction:column;gap:3px;overflow:auto}.majoor-omnicam .motion-layer-row{display:grid;grid-template-columns:16px minmax(0,1fr) auto;width:100%;gap:5px;padding:4px 6px;text-align:left;background:var(--oc-sunken)}.majoor-omnicam .motion-layer-row span{overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .motion-layer-row small{color:var(--oc-text-dim);font-size:9px}.majoor-omnicam .motion-layer-row.active{border-color:var(--oc-ok) !important;background:var(--oc-ok-bg) !important}.majoor-omnicam .motion-layer-controls{display:grid;grid-template-columns:minmax(0,1fr) auto 28px 28px 28px;gap:3px;align-items:center;margin:4px 0 8px}.majoor-omnicam .motion-layer-controls label{display:flex;align-items:center;gap:3px;font-size:9px}.majoor-omnicam .motion-layer-controls input{width:14px}
      .majoor-omnicam .motion-panel{gap:6px}
      .majoor-omnicam .motion-panel > *{flex:none}
      .majoor-omnicam .motion-panel .oc-field-value{color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .motion-create-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 0 6px}
      .majoor-omnicam .motion-create-btn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:7px 8px;text-align:left;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:5px;cursor:pointer;color:var(--oc-text-dim)}
      .majoor-omnicam .motion-create-btn:hover{border-color:var(--oc-ok);background:var(--oc-ok-bg)}
      .majoor-omnicam .motion-create-btn .pi{font-size:13px;color:var(--oc-ok)}
      .majoor-omnicam .motion-create-btn b{font-size:11px;color:#fff}
      .majoor-omnicam .motion-create-btn small{color:var(--oc-text-dim);font-size:9px;line-height:1.2}
      .majoor-omnicam .motion-creating{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:0 0 6px;padding:5px 8px;background:var(--oc-ok-bg);border:1px solid var(--oc-ok);border-radius:5px;font-size:10px;color:var(--oc-ok-text)}
      .majoor-omnicam .motion-badge{display:inline-block;padding:1px 5px;border-radius:3px;background:var(--oc-panel-2);color:var(--oc-ok-text);font-size:8.5px;font-weight:700;letter-spacing:.4px}
      .majoor-omnicam .motion-badge.experimental{background:var(--oc-warn-bg);color:var(--oc-warn-text)}
      .majoor-omnicam .oc-recon-badge{display:inline-block;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:.3px}
      .majoor-omnicam .oc-recon-badge.oc-badge-high{background:var(--oc-ok-bg);color:var(--oc-ok-text);border:1px solid var(--oc-ok-line)}
      .majoor-omnicam .oc-recon-badge.oc-badge-medium{background:var(--oc-warn-bg);color:var(--oc-warn-text);border:1px solid var(--oc-warn-line)}
      .majoor-omnicam .oc-recon-badge.oc-badge-low{background:var(--oc-danger-bg);color:var(--oc-danger-text);border:1px solid var(--oc-danger-line)}
      .majoor-omnicam .oc-lock-btn.locked{color:var(--oc-danger);border-color:var(--oc-danger-line);background:var(--oc-danger-bg)}
      .majoor-omnicam .motion-experimental-note{margin:2px 0 8px;color:var(--oc-warn-text);font-size:9px;line-height:1.35}
      .majoor-omnicam .motion-preview-wrap{position:relative;height:132px;margin:4px 0 2px;border:1px solid var(--oc-line-soft);border-radius:5px;overflow:hidden;background:var(--oc-sunken)}
      .majoor-omnicam .motion-preview{display:block;width:100%;height:100%;cursor:pointer}
      .majoor-omnicam .motion-preview-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:8px;text-align:center;font-size:9px;color:var(--oc-text-faint);pointer-events:none}
      .majoor-omnicam .motion-selected{margin-top:6px}
      .majoor-omnicam .motion-selected.motion-invalid{border-color:var(--oc-danger) !important}
      .majoor-omnicam .motion-selected.motion-warn{border-color:var(--oc-warn-text) !important}
      .majoor-omnicam .motion-sel-warn{margin:0 0 5px;padding:5px 7px;border-radius:4px;background:var(--oc-warn-bg);border:1px solid var(--oc-warn-text);color:var(--oc-warn-text);font-size:9.5px;line-height:1.35}
      .majoor-omnicam .motion-fit-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:5px;padding:5px;margin-top:2px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:4px;cursor:pointer;color:var(--oc-text-dim);font-size:10px}
      .majoor-omnicam .motion-fit-btn:hover{border-color:var(--oc-ok)}
      .majoor-omnicam .motion-advanced{margin-top:8px}
      .majoor-omnicam .motion-compat{font-size:10px;color:var(--oc-ok-text);display:grid;grid-template-columns:1fr 1fr;gap:2px 10px;margin-top:4px}
      .majoor-omnicam .motion-compat .pi{color:var(--oc-ok);font-size:9px;margin-right:3px}
      .majoor-omnicam .motion-compat p{grid-column:1/-1;color:var(--oc-text-dim);margin:4px 0 0;line-height:1.3}
      .majoor-omnicam .motion-timeline{display:flex;flex-direction:column;gap:3px;margin-top:6px}.majoor-omnicam .motion-timeline-rail{display:grid;grid-template-columns:124px minmax(0,1fr);gap:10px;min-height:24px}.majoor-omnicam .motion-timeline-label{justify-content:flex-start;overflow:hidden;padding:2px 6px;text-overflow:ellipsis;white-space:nowrap}.majoor-omnicam .motion-timeline-track{position:relative;border:1px solid var(--oc-line);border-radius:4px;background:var(--oc-sunken)}.majoor-omnicam .motion-key{position:absolute;top:50%;width:11px;height:11px;min-width:11px;margin:-6px 0 0 -6px;padding:0;border:1px solid #111;border-radius:2px;background:var(--oc-ok);transform:rotate(45deg)}
      
      /* Transform & Inputs Grid with Colored Axis Badges */
      .majoor-omnicam .transform-tools{display:flex;gap:6px;margin:6px 0}.majoor-omnicam .transform-tools button{width:28px;height:25px;padding:0;font-weight:600}.majoor-omnicam .transform-tools button.active{background:var(--oc-accent) !important;border-color:var(--oc-accent-hover) !important;color:#fff !important;box-shadow:none !important}.majoor-omnicam .transform-tools select{min-width:0;flex:1;padding:2px 4px}
      .majoor-omnicam .viewport-grid{display:grid;grid-template-columns:1fr 70px;gap:5px 8px}
      .majoor-omnicam .viewport-grid label{display:contents}
      .majoor-omnicam .viewport-grid span{align-self:center;color:var(--oc-text-dim);display:inline-flex;align-items:center;gap:4px;font-size:11px}
      .majoor-omnicam .viewport-grid input{width:70px;padding:2px 4px;font-size:11px}
      .majoor-omnicam .axis-badge{display:inline-block;width:12px;height:12px;line-height:12px;text-align:center;font-size:9px;font-weight:700;border-radius:3px;color:#fff}
      .majoor-omnicam .axis-x{background:#ef5350}.majoor-omnicam .axis-y{background:#53d86a;color:#111}.majoor-omnicam .axis-z{background:#4aa3ef}
      .majoor-omnicam .entity-panel[hidden]{display:none}
      .majoor-omnicam .animation-row{display:flex;gap:6px;align-items:center;margin-top:6px}.majoor-omnicam .animation-row select{min-width:0;flex:1;font-size:11px}
      
      /* Camera Multi-Preview Strip */
      .majoor-omnicam .camera-view-row{position:relative;display:flex;width:100%;padding:5px 30px 5px 5px;background:var(--oc-panel);border-top:1px solid var(--oc-line)}.majoor-omnicam .camera-view-row[hidden]{display:none}.majoor-omnicam .camera-preview-strip{display:grid;width:100%;grid-auto-flow:column;grid-auto-columns:minmax(220px,calc((100% - 10px)/3));gap:6px;overflow-x:auto}.majoor-omnicam .camera-preview-tile{position:relative;min-width:0;height:clamp(150px,18vw,230px);overflow:hidden;background:var(--oc-sunken);border:1px solid var(--oc-line);border-top:4px solid var(--camera-color);border-radius:4px;cursor:pointer}.majoor-omnicam .camera-preview-tile.playblast{border-color:var(--oc-warn);border-top-color:var(--oc-warn);box-shadow:inset 0 0 0 1px var(--oc-warn)}.majoor-omnicam .camera-preview-head{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;align-items:center;gap:5px;min-height:25px;padding:3px 6px;background:#17171fe8;color:var(--oc-text-dim);font-size:10px;font-weight:700;letter-spacing:.04em;pointer-events:none}.majoor-omnicam .camera-preview-head .output-mark{margin-left:auto;color:var(--oc-warn)}.majoor-omnicam .camera-preview-tile canvas{width:100%;height:100%;cursor:pointer}.majoor-omnicam .camera-view-badge{position:absolute;left:6px;bottom:5px;padding:2px 5px;border-radius:3px;background:#000b;color:var(--oc-text-dim);font-size:9px;pointer-events:none}.majoor-omnicam .camera-strip-close{position:absolute;right:4px;top:5px;width:23px;height:23px;padding:0}
      .majoor-omnicam .camera-preview-strip[data-layout="1"]{grid-auto-columns:100%}.majoor-omnicam .camera-preview-strip[data-layout="2"]{grid-auto-columns:calc((100% - 5px)/2)}.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(140px,1fr)}
      
      /* Timeline & Keys */
      .majoor-omnicam .timeline{padding:8px 10px;background:var(--oc-panel);border-top:1px solid var(--oc-line)}
      .majoor-omnicam .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.majoor-omnicam .row + .row{margin-top:6px}
      .majoor-omnicam input[type=range]{padding:0;flex:1;min-width:140px}.majoor-omnicam input[type=number]{width:68px}
      .majoor-omnicam .timeline-toolbar{justify-content:flex-start;gap:8px;align-items:center}.majoor-omnicam .timeline-summary{margin-left:auto;color:var(--oc-text-dim);font-size:11px}.majoor-omnicam .toolbar-divider{width:1px;height:20px;margin:0 4px;background:var(--oc-line)}
      .majoor-omnicam .timeline-group{display:flex;align-items:center;gap:5px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px;padding:3px 6px}
      .majoor-omnicam .primary-play.playing{background:var(--oc-ok);border-color:var(--oc-ok);color:#fff}
      .majoor-omnicam .primary-key{background:var(--oc-warn);border-color:var(--oc-warn);color:#fff;font-weight:700;display:inline-flex;align-items:center;gap:4px}
      .majoor-omnicam .primary-key:hover{background:var(--oc-warn-text);border-color:var(--oc-warn);box-shadow:none}
      .majoor-omnicam .primary-key.key-pulse{animation:keyPulseAnim 0.35s ease-out}
      @keyframes keyPulseAnim{0%{transform:scale(1)}50%{transform:scale(1.14)}100%{transform:scale(1)}}
      .majoor-omnicam .auto-key-btn.active{background:var(--oc-danger-bg);border-color:var(--oc-danger);color:var(--oc-danger-text);animation:autoKeyBlink 1.8s infinite}
      @keyframes autoKeyBlink{0%,100%{opacity:1}50%{opacity:.6}}
      .majoor-omnicam .key-interp-buttons{display:flex;gap:3px;flex-wrap:wrap;margin:4px 0 6px}
      .majoor-omnicam .key-interp-btn{font-size:10px;padding:2px 7px;border-radius:4px;border:1px solid var(--oc-line);background:var(--oc-panel-2);color:var(--oc-text-dim);cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .key-interp-btn:hover{border-color:var(--oc-accent-hover);color:#fff}
      .majoor-omnicam .key-interp-btn.active{background:var(--oc-warn);border-color:var(--oc-warn);color:#fff;font-weight:700;box-shadow:none}
      .majoor-omnicam .floating-retime-badge{position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#101018ee;color:var(--oc-warn);border:1px solid var(--oc-warn);border-radius:3px;font-size:9px;font-weight:700;padding:1px 5px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px #000a}

      .majoor-omnicam .keys{position:relative;width:100%;height:68px;margin-top:7px;overflow:hidden;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:6px;cursor:crosshair;outline:none;touch-action:none}
      .majoor-omnicam .keys:focus-visible{border-color:var(--oc-accent-hover);box-shadow:0 0 0 1px var(--oc-accent-hover)}
      .majoor-omnicam .timeline-tick{position:absolute;top:0;height:100%;border-left:1px solid var(--oc-line);color:var(--oc-text-dim);font-size:10px;padding:2px 0 0 4px;pointer-events:none}
      .majoor-omnicam .timeline-marker{position:absolute;z-index:2;top:0;bottom:0;width:1px;background:var(--marker-color,var(--oc-warn));pointer-events:none}.majoor-omnicam .timeline-marker::before{content:"";position:absolute;left:-4px;top:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid var(--marker-color,var(--oc-warn))}
      .majoor-omnicam .playback-range{position:absolute;top:0;bottom:0;background:var(--oc-warn-bg);border-left:1px solid var(--oc-warn-line);border-right:1px solid var(--oc-warn-line);pointer-events:none}
      .majoor-omnicam .box-select{position:absolute;z-index:4;border:1px dashed var(--oc-accent);background:var(--oc-accent-soft);pointer-events:none}
      .majoor-omnicam .playhead{position:absolute;z-index:2;top:0;bottom:0;width:2px;background:var(--oc-warn);pointer-events:none}.majoor-omnicam .playhead::before{content:"";position:absolute;left:-5px;top:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid var(--oc-warn)}
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
        border: 1px solid var(--oc-line) !important;
        border-radius: 6px !important;
        background: var(--oc-panel-2) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6) !important;
        cursor: ew-resize !important;
        color: var(--oc-text) !important;
        outline: none !important;
        opacity: 0.95 !important;
        transition: opacity 0.15s ease, transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease !important;
      }
      .majoor-omnicam .key:hover {
        opacity: 1 !important;
        border-color: var(--oc-accent-hover) !important;
        background: var(--oc-panel-2) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7) !important;
      }
      .majoor-omnicam .key.at-playhead {
        opacity: 1 !important;
        border-color: var(--oc-warn) !important;
        box-shadow: none !important;
      }
      .majoor-omnicam .key.selected {
        opacity: 1 !important;
        z-index: 5 !important;
        background: var(--oc-warn) !important;
        border-color: #fff !important;
        color: #ffffff !important;
        box-shadow: 0 0 0 2px #fff, 0 2px 6px rgba(0, 0, 0, 0.6) !important;
        transform: translateX(-50%) scale(1.08) !important;
      }
      .majoor-omnicam .key.editing {
        opacity: 1 !important;
        z-index: 6 !important;
        background: var(--oc-danger) !important;
        border-color: #fff !important;
        color: #ffffff !important;
        box-shadow: 0 0 0 2px #fff, 0 2px 6px rgba(0, 0, 0, 0.6) !important;
        animation: keyEditGlow 1.2s infinite alternate !important;
      }
      @keyframes keyEditGlow {
        0% { opacity: 0.85; }
        100% { opacity: 1; }
      }
      
      .majoor-omnicam .key::before {
        content: "";
        position: absolute;
        left: 10px;
        top: 5px;
        width: 10px;
        height: 10px;
        transform: rotate(45deg);
        border: 1.5px solid rgba(255, 255, 255, 0.45);
        background: var(--oc-type-camera, #5B7CFF);
        border-radius: 2px;
        transition: transform 0.12s ease, filter 0.12s ease, border-color 0.12s ease, outline 0.12s ease;
      }
      .majoor-omnicam .key[data-interp="smooth"]::before { border-radius: 50%; transform: none; }
      .majoor-omnicam .key[data-interp="linear"]::before { border-radius: 0; transform: none; }
      .majoor-omnicam .key[data-interp="hold"]::before { border-radius: 0; transform: none; border-left-width: 3.5px; }
      
      .majoor-omnicam .key:hover::before { border-color: #ffffff; filter: brightness(1.2); }
      .majoor-omnicam .key.at-playhead::before { outline: 2px solid rgba(255, 255, 255, 0.6); outline-offset: 1px; }
      .majoor-omnicam .key.selected::before { border-color: #ffffff; outline: 2px solid #ffffff; outline-offset: 1.5px; filter: brightness(1.3); }
      .majoor-omnicam .key.editing::before { border-color: #ffffff; outline: 2px solid var(--oc-accent, #5B7CFF); outline-offset: 1.5px; filter: brightness(1.25); }
      
      .majoor-omnicam .key-label {
        position: absolute;
        top: 24px;
        left: 0;
        width: 32px;
        text-align: center;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 10px;
        font-weight: 700;
        color: var(--oc-text);
        line-height: 1;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        pointer-events: none;
      }
      .majoor-omnicam .key.selected .key-label { font-weight: 700; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
      .majoor-omnicam .key.editing .key-label { font-weight: 700; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
      
      /* Curve Editor: superseded by the Director modal audit Lot 3 unified
         mode block (template/styles/lower-deck.js) -- kept the channel-filter
         highlight colors below since curve-editor/channel-list.js still uses
         them, dropped the rest (a stale pre-"plain section" .curve-editor,
         once a <details>, plus duplicate .curve-toolbar/.curve-mode/
         .curve-canvas rules long overridden by lower-deck.js's newer ones). */
      .majoor-omnicam [data-tangent-mode].active{background:var(--oc-accent-soft);border-color:var(--oc-accent)}.majoor-omnicam [data-channel-filter="0"].active{background:#4d1d1d;border-color:#ef5350;color:#ffc7c7}.majoor-omnicam [data-channel-filter="1"].active{background:#1a4223;border-color:#53d86a;color:#c7ffd2}.majoor-omnicam [data-channel-filter="2"].active{background:#1d354d;border-color:#4aa3ef;color:#c7e6ff}.majoor-omnicam .ch-dot{display:inline-block;width:7px;height:7px;border-radius:50%}

      /* Context Menu & Panels */
      .majoor-omnicam .context-menu, .context-menu.majoor-omnicam{position:fixed;z-index:100000;display:flex;min-width:210px;max-width:320px;flex-direction:column;gap:2px;padding:6px;background:rgba(11,16,24,0.98);border:1px solid rgba(255,255,255,0.12);border-radius:8px;box-shadow:0 16px 36px rgba(0,0,0,0.6),0 0 0 1px rgba(0,0,0,0.4);color:var(--oc-text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;user-select:none}.majoor-omnicam .context-menu[hidden],.context-menu.majoor-omnicam[hidden]{display:none}.majoor-omnicam .context-menu button,.context-menu.majoor-omnicam button{display:flex;align-items:center;gap:8px;width:100%;min-height:28px;text-align:left;border-color:transparent;background:transparent;color:var(--oc-text);font-size:12px;cursor:pointer;border-radius:5px;padding:4px 8px;border:1px solid transparent;transition:background .1s ease,color .1s ease}.majoor-omnicam .context-menu button:hover,.majoor-omnicam .context-menu button:focus-visible,.majoor-omnicam .context-menu button.active,.context-menu.majoor-omnicam button:hover,.context-menu.majoor-omnicam button:focus-visible,.context-menu.majoor-omnicam button.active{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.08);color:#fff}.majoor-omnicam .context-menu button:disabled,.context-menu.majoor-omnicam button:disabled{opacity:.35;cursor:not-allowed;background:transparent}.majoor-omnicam .context-menu .danger,.context-menu.majoor-omnicam .danger{color:var(--oc-danger)}.majoor-omnicam .context-menu .danger:hover,.context-menu.majoor-omnicam .danger:hover{background:var(--oc-danger-bg);border-color:var(--oc-danger-line);color:var(--oc-danger-text)}.majoor-omnicam .context-menu kbd.shortcut,.context-menu.majoor-omnicam kbd.shortcut,.majoor-omnicam .context-menu .shortcut,.context-menu.majoor-omnicam .shortcut{margin-left:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;padding:1px 5px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:var(--oc-text-dim)}.majoor-omnicam .context-menu-separator,.context-menu.majoor-omnicam .context-menu-separator{height:1px;margin:4px 2px;background:rgba(255,255,255,0.09)}.majoor-omnicam .context-menu-title,.context-menu.majoor-omnicam .context-menu-title{padding:4px 8px;color:var(--oc-text-dim);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.majoor-omnicam .oc-menu-icon-svg{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;flex-shrink:0}
      .majoor-omnicam .compact-panel{margin-top:6px;border:1px solid var(--oc-line);border-radius:6px;background:var(--oc-panel-2)}.majoor-omnicam .compact-panel>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 7px;cursor:pointer;color:var(--oc-text-dim);list-style:none}.majoor-omnicam .compact-panel>summary::-webkit-details-marker{display:none}.majoor-omnicam .compact-panel>summary::after{content:"›";margin-left:auto;transform:rotate(90deg);color:var(--oc-text-faint)}.majoor-omnicam .compact-panel[open]>summary::after{transform:rotate(-90deg)}.majoor-omnicam .panel-body{padding:0 7px 7px}
      .majoor-omnicam .key-editor-header{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:6px}.majoor-omnicam .key-editor-grid,.majoor-omnicam .inspector-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:5px}.majoor-omnicam .key-editor-grid label,.majoor-omnicam .inspector-grid label{display:flex;align-items:center;justify-content:space-between;gap:4px;color:var(--oc-text-dim)}.majoor-omnicam .key-editor-grid input,.majoor-omnicam .key-editor-grid select,.majoor-omnicam .inspector-grid input,.majoor-omnicam .inspector-grid select{min-width:0;width:70px}.majoor-omnicam .key-editor[data-empty="true"] .key-editor-grid{opacity:.45}
      .majoor-omnicam .status{margin-left:auto;color:var(--oc-text-dim)}.majoor-omnicam .hint{color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam details.help{padding:7px 10px;background:var(--oc-panel);color:var(--oc-text-dim)}.majoor-omnicam details.help summary{cursor:pointer;color:var(--oc-warn)}.majoor-omnicam details.help p{margin:6px 0}
      /* Left panel Scene/Assets tabs + Asset Browser grid */
      .majoor-omnicam .oc-left-tabs{display:flex;gap:2px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:6px;padding:2px}
      .majoor-omnicam .oc-left-tab{flex:1;min-height:24px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--oc-text-dim);background:transparent;border:1px solid transparent;border-radius:4px;cursor:pointer}
      .majoor-omnicam .oc-left-tab.active{color:#fff;background:var(--oc-panel-2);border-color:var(--oc-line)}
      /* AGENT gets its own violet identity (flat, no gradient/glow per the
         design-system guardrail) so it reads as a distinct, AI-flavoured
         surface next to the neutral Scene/Assets tabs. */
      .majoor-omnicam .oc-left-tab[data-asset-view="agent"]{color:var(--oc-type-lens)}
      .majoor-omnicam .oc-left-tab[data-asset-view="agent"]:hover{color:#e2d4ff}
      /* !important: the generic button.active rule above (shared by every
         toolbar toggle, also !important) otherwise wins regardless of this
         selector's higher specificity -- !important vs !important then
         falls back to specificity, where this rule is higher. */
      .majoor-omnicam .oc-left-tab[data-asset-view="agent"].active{color:#fff !important;background:var(--oc-type-lens) !important;border-color:transparent !important;box-shadow:none !important}
      .majoor-omnicam .oc-left-body{display:flex;flex-direction:column;gap:7px;flex:1 1 auto;min-height:0}
      .majoor-omnicam .oc-asset-panel{display:flex;flex-direction:column;gap:6px;flex:1 1 auto;min-height:0}
      .majoor-omnicam .oc-asset-toolbar{display:flex;gap:4px;align-items:center}
      .majoor-omnicam .oc-asset-local{display:flex;flex-direction:column;gap:4px;padding:6px;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:6px}
      .majoor-omnicam .oc-asset-local input{font-size:10px}
      .majoor-omnicam .oc-asset-local-actions{display:flex;gap:4px}
      .majoor-omnicam .oc-asset-local-actions .oc-btn{flex:1;font-size:10px;padding:4px 6px}
      .majoor-omnicam .oc-btn--primary{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#dbe9ff}
      .majoor-omnicam .oc-asset-kinds{display:flex;flex-wrap:wrap;gap:3px}
      .majoor-omnicam .oc-asset-kind{font-size:10px;padding:3px 7px;height:22px;color:var(--oc-text-dim);background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:11px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
      .majoor-omnicam .oc-asset-kind.active{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#dbe9ff}
      .majoor-omnicam .oc-asset-kind-n{opacity:.6;font-size:9px}
      .majoor-omnicam .oc-asset-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;overflow-y:auto;overscroll-behavior:contain;flex:1 1 auto;min-height:120px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:5px;padding:6px;align-content:start}
      .majoor-omnicam .oc-asset-card{position:relative;display:flex;flex-direction:column;gap:3px;padding:5px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px;cursor:pointer;text-align:left}
      .majoor-omnicam .oc-asset-card:hover{border-color:var(--oc-text-faint)}
      .majoor-omnicam .oc-asset-card.selected{border-color:var(--oc-accent);box-shadow:0 0 0 1px var(--oc-accent)}
      .majoor-omnicam .oc-asset-thumb{width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;background:var(--oc-sunken);display:flex;align-items:center;justify-content:center}
      .majoor-omnicam .oc-asset-thumb--glyph i{font-size:22px;color:var(--oc-text-faint)}
      .majoor-omnicam .oc-asset-name{font-size:10px;color:var(--oc-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .majoor-omnicam .oc-asset-kind-tag{font-size:8px;letter-spacing:.06em;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-asset-badge{position:absolute;top:4px;right:4px;font-size:7px;font-weight:700;letter-spacing:.05em;padding:1px 4px;background:var(--oc-ok-bg);border:1px solid var(--oc-ok-line);border-radius:3px;color:var(--oc-ok-text)}
      .majoor-omnicam .oc-asset-empty{grid-column:1/-1;color:var(--oc-text-dim);font-size:11px;text-align:center;padding:16px 4px}
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
      .majoor-omnicam .oc-agent-panel{border-top:2px solid var(--oc-type-lens);padding-top:6px}
      .majoor-omnicam .oc-agent-panel select.oc-search:focus-visible,
      .majoor-omnicam .oc-agent-panel .oc-agent-describe:focus-visible{outline:none;border-color:var(--oc-type-lens);box-shadow:0 0 0 2px rgba(167,139,250,.28)}
      .majoor-omnicam .oc-agent-panel .oc-btn--primary{background:var(--oc-type-lens);border-color:transparent;color:#fff}
      .majoor-omnicam .oc-agent-panel .oc-btn--primary:not(:disabled):hover{filter:brightness(1.1)}
      .majoor-omnicam .oc-agent-panel .oc-btn--primary:disabled{background:var(--oc-panel-2);border-color:var(--oc-line);color:var(--oc-text-faint)}
      .majoor-omnicam .oc-asset-status{flex:1;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      /* Viewport label overlay (pooled DOM above the WebGL canvas) */
      .majoor-omnicam .oc-label-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:6}
      .majoor-omnicam .oc-label{position:absolute;top:0;left:0;will-change:transform;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.04em;line-height:1.5;color:#f4f4f6;background:rgba(11,16,24,0.85);border:1px solid rgba(255,255,255,0.14);white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,0.8)}
      .majoor-omnicam .oc-label.is-annotation{border-color:var(--oc-label-accent,var(--oc-type-lens));box-shadow:0 0 0 1px var(--oc-label-accent,var(--oc-type-lens)) inset}
      /* Outliner tag chips + inspector label rows */
      .majoor-omnicam .scene-item-tags{display:inline-flex;gap:3px;margin-left:5px;flex-shrink:1;overflow:hidden}
      .majoor-omnicam .scene-item-tag{font-size:8px;font-weight:700;letter-spacing:.03em;padding:0 4px;border-radius:8px;background:var(--oc-panel-2);border:1px solid var(--oc-line);color:var(--oc-text-dim);white-space:nowrap;text-transform:uppercase}
      .majoor-omnicam .scene-item-tag-more{background:transparent;border-color:transparent;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-labels-row select{height:24px;font-size:10px}
      /* Rig Mapper */
      .majoor-omnicam .oc-rig-status{margin-left:auto;font-size:9px;font-weight:700;letter-spacing:.03em}
      .majoor-omnicam .oc-rig-status[data-state="ok"]{color:var(--oc-ok-text)}
      .majoor-omnicam .oc-rig-status[data-state="warn"]{color:var(--oc-warn-text)}
      .majoor-omnicam .oc-rig-actions{display:flex;gap:4px;margin-bottom:6px}
      .majoor-omnicam .oc-rig-actions .oc-btn{font-size:10px;padding:3px 8px}
      .majoor-omnicam .oc-rig-grid{display:flex;flex-direction:column;gap:2px;max-height:220px;overflow-y:auto;overscroll-behavior:contain}
      .majoor-omnicam .oc-rig-row{display:grid;grid-template-columns:78px 1fr 12px;align-items:center;gap:5px;font-size:10px}
      .majoor-omnicam .oc-rig-joint{color:var(--oc-text-dim)}
      .majoor-omnicam .oc-rig-row select{height:22px;font-size:10px;min-width:0}
      .majoor-omnicam .oc-rig-row.ok .oc-rig-joint{color:var(--oc-text)}
      .majoor-omnicam .oc-rig-tick{color:var(--oc-ok-text);font-weight:700;text-align:center}
      /* FK Pose editor + canonical-joint overlay */
      .majoor-omnicam .oc-pose-editor{margin-top:6px;padding-top:6px;border-top:1px solid var(--oc-line-soft)}
      .majoor-omnicam [data-pose-act="edit"].active{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#dbe9ff}
      .majoor-omnicam .oc-pose-joint .oc-field-label{font-size:9px;letter-spacing:.03em;color:var(--oc-accent-hover);text-transform:uppercase}
      .majoor-omnicam .oc-rig-overlay{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:7}
      .majoor-omnicam .oc-rig-dot{position:absolute;top:0;left:0;width:11px;height:11px;padding:0;border-radius:50%;background:var(--oc-accent-soft);border:1.5px solid var(--oc-accent-hover);cursor:pointer;pointer-events:auto;will-change:transform}
      .majoor-omnicam .oc-rig-dot:hover{background:rgba(91,124,255,0.5)}
      .majoor-omnicam .oc-rig-dot.selected{background:var(--oc-warn);border-color:#fff;box-shadow:0 0 0 2px #fff}
      /* Character motion clip */
      .majoor-omnicam .oc-motion-editor{margin-top:6px;padding-top:6px;border-top:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-motion-timing{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
      .majoor-omnicam .oc-motion-num{display:flex;flex-direction:column;font-size:9px;color:var(--oc-text-dim);gap:2px}
      .majoor-omnicam .oc-motion-num input{width:52px}
      .majoor-omnicam .oc-motion-check{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-motion-editor .oc-btn{font-size:10px;padding:3px 8px}
      @container (max-width:700px){.majoor-omnicam .top{overflow-x:auto;overflow-y:hidden}.majoor-omnicam .viewport-quick-bar{right:10px;max-width:calc(100% - 20px)}.majoor-omnicam .selection-mode-group button span{display:none}.majoor-omnicam .viewport-tally-banner{top:82px;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.majoor-omnicam .hud{top:108px;right:10px;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .viewport-inspector{top:auto;bottom:10px;width:min(250px,calc(100% - 20px));max-height:42%}.majoor-omnicam .timeline-toolbar{overflow-x:auto;flex-wrap:nowrap}.majoor-omnicam .timeline-summary{display:none}}
      @container (max-width:460px){.majoor-omnicam .viewport-wrap{min-height:360px}.majoor-omnicam .camera-preview-strip[data-layout="2"],.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr;grid-auto-columns:100%}.majoor-omnicam .menu-panel{width:min(240px,calc(100cqw - 24px))}}
`, Xl = Xc + Gl + Vl + Cc + Hl + Ul;
function Yl() {
  return `
    <div class="oc-header">
      ${Yc("OmniCam Director")}
      <span class="oc-header-spacer"></span>
      <details class="toolbar-menu oc-overflow" data-menu="output">
        <summary title="${r("Output & diagnostics")}"><i class="pi pi-ellipsis-h"></i></summary>
        <div class="menu-panel right">
          <div class="menu-title">${r("Output")}</div>
          <label>${r("Playblast camera")} <select data-role="playblast-camera"></select></label>
          <div class="menu-section" data-density-min="animation">
            <label>${r("Proxy preset")} <select data-role="proxy-preset">
              <option value="clean_proxy">${r("Clean proxy")}</option>
              <option value="debug_motion">${r("Debug motion")}</option>
              <option value="cinematic_view">${r("Cinematic view")}</option>
            </select></label>
            <label>${r("Encoder")} <select data-role="encoder">
              <option value="auto">${r("WebCodecs")}</option>
              <option value="realtime">${r("Realtime fallback")}</option>
            </select></label>
          </div>
          <div class="menu-section" data-density-min="advanced">
            <div class="menu-divider"></div>
            <div class="menu-title">${r("Maintenance")}</div>
            <button data-act="clear-caches" title="${r("Clear WebGL textures, temporary files and memory caches")}"><i class="pi pi-trash"></i> ${r("Clear Caches & Clean")}</button>
            <button data-act="open-preferences" title="${r("Configure OmniCam preferences")}"><span aria-hidden="true">🔘</span> ${r("Preferences…")}</button>
          </div>
          <div class="menu-divider"></div>
          <div class="setup-badge" data-role="setup-badge" hidden></div>
          <div data-role="setup-issues"></div>
        </div>
      </details>
      <span class="oc-status-pill" data-role="status" role="status" aria-live="polite" aria-atomic="true"><span class="oc-status-dot"></span>${r("Ready")}</span>
    </div>`;
}
function Zl() {
  return `
    <div class="oc-footer">
      <span class="oc-status-badge" data-role="status-indicator">
        <span class="oc-status-dot"></span>
        <span data-role="engine-state">${r("READY")}</span>
      </span>
      <span class="oc-footer-sep">│</span>
      <span class="oc-footer-hints" data-role="mouse-hints">
        <span class="oc-key-hint">LMB</span> ${r("Select")} · 
        <span class="oc-key-hint">MMB</span> ${r("Orbit")} · 
        <span class="oc-key-hint">Shift+MMB</span> ${r("Pan")} · 
        <span class="oc-key-hint">Wheel</span> ${r("Dolly")} · 
        <span class="oc-key-hint">I</span> ${r("Key")}
      </span>
      <span class="oc-footer-spacer"></span>
      <details class="help oc-help">
        <summary><i class="pi pi-question-circle"></i> ${r("OmniCam Help")}</summary>
        <div class="oc-help-body">
          <p>${r("Compose a frame, press I, scrub, move the camera and press I again. Space previews the move; Playblast records the neutral motion reference.")}</p>
          <p>${r("The proxy communicates camera motion, not final appearance. Delivery profiles and model targets are compiled in OmniCam Monitor.")}</p>
        </div>
      </details>
    </div>`;
}
const Jl = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>', Ql = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-9 5-9-5V8l9-5 9 5v8z"/><path d="m3.27 6.96 8.73 4.84 8.73-4.84"/><path d="M12 22V12"/></svg>', ed = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 20h20L12 2z"/><path d="M12 2v18"/></svg>', td = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>', ad = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>', od = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 8-4 4-8-8 4-4z"/><path d="M7 11L2 16l6 6 5-5"/><path d="M18 19l4 2"/><path d="M21 16l2 2"/></svg>', rd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>', nd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6H4z"/><circle cx="17" cy="7" r="3"/><path d="m6 3 4 7H2z"/></svg>';
function sd() {
  return `
    <div class="oc-left-body oc-assets" data-role="agent-tab" hidden>
      <div class="oc-asset-panel oc-agent-panel" data-role="agent-panel">
        <div class="oc-asset-toolbar" data-role="agent-provider-row">
          <select class="oc-search" data-role="agent-provider-select" aria-label="${r("Provider")}">
            <option value="">${r("Loading providers...")}</option>
          </select>
        </div>
        <div class="oc-asset-toolbar" data-role="agent-model-row">
          <select class="oc-search" data-role="agent-model-select" aria-label="${r("Model")}">
            <option value="">${r("Loading models...")}</option>
          </select>
          <button type="button" class="icon-button" data-agent-act="model-refresh"
                  title="${r("Refresh model list")}"><i class="pi pi-refresh"></i></button>
        </div>
        <div class="oc-asset-toolbar" data-role="agent-credential-row">
          <span class="oc-asset-status hint" data-role="agent-provider-label"></span>
          <span class="oc-asset-status hint" data-role="agent-credential-status"></span>
          <button type="button" class="icon-button" data-agent-act="credential-replace"
                  title="${r("Set credential")}"><i class="pi pi-key"></i></button>
          <button type="button" class="icon-button" data-agent-act="credential-remove"
                  title="${r("Remove credential")}"><i class="pi pi-trash"></i></button>
          <button type="button" class="icon-button" data-agent-act="credential-test"
                  title="${r("Test connection")}"><i class="pi pi-bolt"></i></button>
        </div>
        <div class="oc-asset-toolbar" data-role="agent-credential-form" hidden>
          <input class="oc-search" data-role="agent-credential-input" type="password" autocomplete="new-password"
                 placeholder="${r("Paste API key...")}" aria-label="${r("Credential")}">
          <button type="button" class="oc-btn oc-btn--primary" data-agent-act="credential-save">${r("Save")}</button>
        </div>
        <p class="oc-asset-status hint oc-agent-privacy" data-role="agent-privacy-note"></p>
        <p class="oc-asset-status hint" data-role="agent-hint"></p>
        <textarea class="oc-search oc-agent-describe" data-role="agent-describe" rows="5"
                  placeholder="${r('Describe the shot... ex: "the camera slowly orbits the character while zooming in on the face"')}"
                  aria-label="${r("Describe the shot")}"></textarea>
        <div class="oc-asset-toolbar">
          <strong>${r("Planned changes")}</strong>
        </div>
        <ul class="oc-asset-status hint oc-agent-plan-list" data-role="agent-plan" style="list-style:none;padding:0;margin:0"></ul>
        <div class="oc-resize-v" data-role="agent-resize" role="separator" aria-orientation="horizontal" tabindex="0"
             title="${r("Drag to resize the Agent panel — double-click to reset")}" aria-label="${r("Resize the Agent panel")}"></div>
        <div class="oc-asset-foot">
          <button type="button" class="oc-btn" data-agent-act="preview">${r("Preview")}</button>
          <button type="button" class="oc-btn oc-btn--primary" data-agent-act="apply" disabled>${r("Apply")}</button>
          <button type="button" class="oc-btn" data-agent-act="cancel" disabled>${r("Cancel")}</button>
        </div>
      </div>
    </div>`;
}
function id() {
  return `
    <div class="oc-left-body oc-assets" data-role="assets-tab" hidden>
      <div class="oc-asset-panel" data-role="assets-panel">
        <div class="oc-asset-toolbar">
          <input class="oc-search" data-role="asset-search" type="search"
                 placeholder="${r("Search assets...")}" aria-label="${r("Search assets")}">
          <button type="button" class="icon-button" data-asset-act="asset-import"
                  title="${r("Import 3D Model (+)")}"><i class="pi pi-upload"></i></button>
        </div>
        <p class="oc-asset-status hint">${r("Import GLB/FBX files with the upload action.")}</p>
        <div class="oc-asset-kinds" data-role="asset-kinds"></div>
        <div class="oc-asset-grid" data-role="asset-grid"></div>
        <div class="oc-resize-v" data-role="assets-resize" role="separator" aria-orientation="horizontal" tabindex="0"
             title="${r("Drag to resize the assets grid — double-click to reset")}" aria-label="${r("Resize the assets grid")}"></div>
        <div class="oc-asset-foot">
          <button type="button" class="oc-btn" data-asset-act="asset-add">${r("Add to scene")}</button>
          <span class="oc-asset-status hint" data-role="asset-status"></span>
        </div>
        <input type="file" data-role="asset-import-file" accept=".glb,.fbx" hidden>
      </div>
    </div>`;
}
function cd() {
  return `
    <aside class="oc-left" data-role="scene-panel" aria-label="${r("Scene")}">
      <div class="oc-left-tabs" data-role="left-tabs" role="tablist">
        <button type="button" class="oc-left-tab active" data-asset-view="scene" role="tab"><i class="pi pi-sitemap" style="font-size:11px"></i> ${r("Outliner")}</button>
        <button type="button" class="oc-left-tab" data-asset-view="assets" role="tab"><i class="pi pi-box" style="font-size:11px"></i> ${r("Assets")}</button>
        <button type="button" class="oc-left-tab oc-tab-subtle" data-asset-view="agent" role="tab" hidden>${r("Agent")}</button>
      </div>
      <div class="oc-left-body" data-role="scene-tab">
      <div class="oc-panel-head">
        <strong>${r("Scene")}</strong>
        <span class="oc-panel-spacer"></span>
        <button class="icon-button" data-act="add-camera" title="${r("Create camera from current view")}"><i class="pi pi-video"></i></button>
        <button class="icon-button" data-act="load-model" title="${r("Import 3D Model (+)")}"><i class="pi pi-plus"></i></button>
      </div>
      <input class="oc-search" data-role="outliner-search" type="search" placeholder="${r("Search")}" aria-label="${r("Filter the outliner")}">
      <div class="oc-outliner-add-bar">
        <details class="toolbar-menu oc-add-menu" data-menu="add-object">
          <summary class="oc-add-summary-btn" title="${r("Add object (+)")}">
            <i class="pi pi-plus" style="font-size:11px"></i>
            <span>${r("Add object")}</span>
            <i class="pi pi-chevron-down" style="font-size:9px;margin-left:auto;opacity:0.7"></i>
          </summary>
          <div class="menu-panel oc-add-menu-panel">
            <div class="oc-add-header">${r("Add object")}</div>
            <button type="button" class="oc-add-menu-item" data-object-type="sphere">
              ${Jl} <span>${r("Sphere")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="cube">
              ${Ql} <span>${r("Cube")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="pyramid">
              ${ed} <span>${r("Pyramide")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="sun_light">
              ${td} <span>${r("Sun light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="point_light">
              ${ad} <span>${r("Point light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="spot_light">
              ${od} <span>${r("Spot light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-act="add-camera">
              ${rd} <span>${r("Camera")}</span>
            </button>
            <div class="oc-add-menu-item oc-has-submenu" tabindex="0">
              ${nd} <span>${r("Assets")}</span>
              <i class="pi pi-chevron-right oc-submenu-arrow"></i>
              <div class="oc-add-submenu">
                <button type="button" class="oc-add-menu-item" data-object-type="card"><i class="pi pi-image"></i> <span>${r("Card")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="cylinder"><i class="pi pi-database"></i> <span>${r("Cylinder")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="torus"><i class="pi pi-circle"></i> <span>${r("Torus")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="human"><i class="pi pi-user"></i> <span>${r("Human")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="null"><i class="pi pi-plus"></i> <span>${r("Null")}</span></button>
                <div class="menu-divider"></div>
                <button type="button" class="oc-add-menu-item" data-act="load-model"><i class="pi pi-box"></i> <span>${r("Import 3D Model (+)")}</span></button>
              </div>
            </div>
          </div>
        </details>
      </div>
      <div class="outliner-filter-chips" data-role="outliner-filter-chips">
        <button type="button" class="oc-chip active" data-filter="all">${r("All")}</button>
        <button type="button" class="oc-chip" data-filter="cameras">${r("Cameras")}</button>
        <button type="button" class="oc-chip" data-filter="objects">${r("Objects")}</button>
        <button type="button" class="oc-chip" data-filter="lights">${r("Lights")}</button>
        <button type="button" class="oc-chip" data-filter="hidden">${r("Hidden")}</button>
      </div>
      <div class="oc-batch-toolbar" data-role="outliner-batch-bar" hidden>
        <span class="oc-batch-badge" data-role="batch-count">0 ${r("selected")}</span>
        <div class="oc-batch-actions">
          <button type="button" class="icon-button" data-act="batch-toggle-visibility" title="${r("Toggle visibility (H)")}"><i class="pi pi-eye"></i></button>
          <button type="button" class="icon-button" data-act="batch-toggle-lock" title="${r("Toggle lock (L)")}"><i class="pi pi-lock"></i></button>
          <button type="button" class="icon-button" data-act="batch-duplicate" title="${r("Duplicate selection (Shift+D)")}"><i class="pi pi-copy"></i></button>
          <button type="button" class="icon-button danger" data-act="batch-delete" title="${r("Delete selection (Del)")}"><i class="pi pi-trash"></i></button>
          <button type="button" class="icon-button" data-act="batch-deselect" title="${r("Deselect all (Alt+A)")}"><i class="pi pi-times"></i></button>
        </div>
      </div>
      <div class="scene-tree" data-role="objects"></div>
      <div class="oc-resize-v" data-role="outliner-resize" role="separator" aria-orientation="horizontal" tabindex="0"
           title="${r("Drag to resize the outliner — double-click to reset")}" aria-label="${r("Resize the outliner")}"></div>
      </div>
      ${id()}
      ${sd()}
    </aside>`;
}
function ld() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="scene">
      <div class="oc-card" data-role="object-panel">
        <div class="oc-card-title" style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <span data-role="selected-name">${r("Object Transform")}</span>
          <div style="display:flex;align-items:center;gap:4px">
            <span class="oc-recon-badge" data-role="object-recon-badge" hidden></span>
            <button class="icon-button oc-lock-btn" type="button" data-act="toggle-object-lock" data-role="object-lock-toggle" title="${r("Lock / unlock object")}"><i class="pi pi-lock-open"></i></button>
          </div>
        </div>
        <div class="oc-field-row" data-role="material-row">
          <span class="oc-field-label">${r("Material")}</span>
          <select data-role="object-material" title="${r("Viewport material")}">
            <option value="textured">${r("Textures")}</option>
            <option value="wireframe_texture">${r("Wireframe + Texture")}</option>
            <option value="checker">${r("Checker")}</option>
            <option value="neutral">${r("Neutral")}</option>
            <option value="wireframe_neutral">${r("Wireframe + Clay")}</option>
            <option value="wireframe">${r("Wireframe")}</option>
            <option value="matte">${r("Matte Dark")}</option>
          </select>
          <input data-role="object-color" type="color" value="#8c929b" title="${r("Object Color")}">
        </div>
        <div class="oc-field-row" data-role="light-props-row" hidden>
          <span class="oc-field-label">${r("Light")}</span>
          <input data-role="object-light-color" type="color" value="#ffffff" title="${r("Light Color")}">
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            ${r("Intensity")}
            <input data-role="object-intensity" type="number" min="0" max="100" step="0.1" value="2.2" style="width:52px">
          </label>
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            <input data-role="object-cast-shadow" type="checkbox" checked>
            ${r("Shadow")}
          </label>
        </div>
        <div class="oc-field-row" data-role="spot-props-row" hidden>
          <span class="oc-field-label">${r("Spot Cone")}</span>
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            ${r("Angle")}
            <input data-role="object-cone-angle" type="number" min="1" max="90" step="1" value="45" style="width:48px">°
          </label>
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            ${r("Soft")}
            <input data-role="object-penumbra" type="number" min="0" max="1" step="0.05" value="0.25" style="width:48px">
          </label>
        </div>
        <div class="oc-field-row">
          <span class="oc-field-label">${r("Parent")}</span>
          <select data-role="object-parent" title="${r("Parent object")}"><option value="">${r("No parent")}</option></select>
        </div>
        <div class="oc-vec-row">
          <span class="oc-channel-key" data-channel="obj-pos" title="${r("Object position key indicator")}">◆</span>
          <span class="oc-field-label">${r("Position")}</span>
          <label class="oc-axis x" title="${r("Scrub X (Shift: 0.01x, Ctrl: 1.0x)")}"><span class="oc-axis-tag">X</span><input data-role="object-x" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y" title="${r("Scrub Y (Shift: 0.01x, Ctrl: 1.0x)")}"><span class="oc-axis-tag">Y</span><input data-role="object-y" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z" title="${r("Scrub Z (Shift: 0.01x, Ctrl: 1.0x)")}"><span class="oc-axis-tag">Z</span><input data-role="object-z" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="position" title="${r("Reset Position")}">⟲</button>
        </div>
        <div class="oc-vec-row" data-role="rotation-row">
          <span class="oc-channel-key" data-channel="obj-rot" title="${r("Object rotation key indicator")}">◆</span>
          <span class="oc-field-label">${r("Rotation")}</span>
          <label class="oc-axis x" title="${r("Scrub Rot X")}"><span class="oc-axis-tag">X</span><input data-role="object-rx" type="number" step="1" aria-label="X"></label>
          <label class="oc-axis y" title="${r("Scrub Rot Y")}"><span class="oc-axis-tag">Y</span><input data-role="object-ry" type="number" step="1" aria-label="Y"></label>
          <label class="oc-axis z" title="${r("Scrub Rot Z")}"><span class="oc-axis-tag">Z</span><input data-role="object-rz" type="number" step="1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="rotation" title="${r("Reset Rotation")}">⟲</button>
        </div>
        <div class="oc-vec-row" data-role="scale-row">
          <span class="oc-channel-key" data-channel="obj-scale" title="${r("Object scale key indicator")}">◆</span>
          <span class="oc-field-label">${r("Scale")}</span>
          <label class="oc-axis x" title="${r("Scrub Scale X")}"><span class="oc-axis-tag">X</span><input data-role="object-sx" type="number" min="0.01" step="0.1" aria-label="X"></label>
          <label class="oc-axis y" title="${r("Scrub Scale Y")}"><span class="oc-axis-tag">Y</span><input data-role="object-sy" type="number" min="0.01" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z" title="${r("Scrub Scale Z")}"><span class="oc-axis-tag">Z</span><input data-role="object-sz" type="number" min="0.01" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="scale" title="${r("Reset Scale")}">⟲</button>
        </div>
        <div class="animation-row" data-role="animation-row" hidden><i class="pi pi-play-circle"></i><select data-role="animation-select" title="${r("Animation clip")}"></select></div>
        <div class="oc-field-row oc-labels-row">
          <span class="oc-field-label">${r("Tags")}</span>
          <input data-role="object-tags" type="text" placeholder="${r("hero, subject")}" title="${r("Machine-semantic tags, comma separated")}" style="flex:1;min-width:0">
        </div>
        <div class="oc-field-row oc-labels-row">
          <span class="oc-field-label">${r("Label")}</span>
          <input data-role="object-annotation" type="text" maxlength="128" placeholder="${r("Visible viewport label")}" style="flex:1;min-width:0">
          <input data-role="object-annotation-color" type="color" value="#8d7ee8" title="${r("Label colour")}">
          <select data-role="object-annotation-anchor" title="${r("Label anchor")}">
            <option value="top">${r("Top")}</option>
            <option value="center">${r("Center")}</option>
            <option value="bottom">${r("Bottom")}</option>
          </select>
        </div>
        <details class="compact-panel oc-rig-mapper" data-role="rig-mapper" hidden>
          <summary><i class="pi pi-sitemap"></i> ${r("Rig Mapper")} <span class="oc-rig-status" data-role="rig-mapper-status"></span></summary>
          <div class="panel-body">
            <div class="oc-rig-actions">
              <button type="button" class="oc-btn" data-rig-act="auto">${r("Auto Map")}</button>
              <button type="button" class="oc-btn" data-rig-act="validate">${r("Validate")}</button>
              <button type="button" class="oc-btn" data-rig-act="save">${r("Save Mapping")}</button>
            </div>
            <div class="oc-rig-grid" data-role="rig-mapper-grid"></div>
          </div>
        </details>
        <div class="oc-pose-editor" data-role="pose-editor" hidden>
          <div class="oc-field-row">
            <span class="oc-field-label">${r("Pose")}</span>
            <select data-role="pose-preset" title="${r("Pose preset")}" style="flex:1;min-width:0"></select>
            <button type="button" class="oc-btn" data-pose-act="edit" title="${r("Toggle FK pose editing")}">${r("Edit Pose")}</button>
            <button type="button" class="oc-btn" data-pose-act="save" title="${r("Save the current pose")}">${r("Save Pose…")}</button>
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
            <span class="oc-field-label">${r("Motion")}</span>
            <select data-role="motion-clip" title="${r("Animation clip")}" style="flex:1;min-width:0"></select>
          </div>
          <div class="oc-field-row oc-motion-timing">
            <label class="oc-motion-num">${r("Start")}<input data-role="motion-start" type="number" step="1" min="0"></label>
            <label class="oc-motion-num">${r("End")}<input data-role="motion-end" type="number" step="1" min="0"></label>
            <label class="oc-motion-num">${r("Speed")}<input data-role="motion-speed" type="number" step="0.05" min="0.05" max="8"></label>
            <label class="oc-motion-check"><input data-role="motion-loop" type="checkbox" checked> ${r("Loop")}</label>
          </div>
          <div class="oc-field-row">
            <button type="button" class="oc-btn" data-motion-act="bake">${r("Bake current frame to pose")}</button>
          </div>
        </div>
      </div>
      <div class="oc-field-row"><span class="oc-field-label">${r("Upstream reference")}</span>
        <select data-role="reference-select"><option value="0">${r("Upstream 1")}</option></select>
      </div>
    </div>`;
}
function dd() {
  return `
    <div class="inspector-tab-content oc-side-body motion-panel" data-tab-panel="motion" hidden>

      <div class="oc-section">${r("Create Motion")} <span class="motion-badge experimental">EXPERIMENTAL</span></div>
      <p class="motion-experimental-note">${r("Motion Tracks are experimental and may change before a stable release.")}</p>
      <div class="motion-create-grid">
        <button type="button" class="motion-create-btn" data-motion-create="draw">
          <i class="pi pi-pencil"></i><b>${r("Draw Path")}</b><small>${r("Draw movement onscreen")}</small>
        </button>
        <button type="button" class="motion-create-btn" data-motion-create="object">
          <i class="pi pi-bullseye"></i><b>${r("Track Object")}</b><small>${r("Follow a scene object")}</small>
        </button>
        <button type="button" class="motion-create-btn" data-motion-create="world">
          <i class="pi pi-plus-circle"></i><b>${r("World Point")}</b><small>${r("Track a fixed 3D point")}</small>
        </button>
        <button type="button" class="motion-create-btn" data-motion-create="anchor">
          <i class="pi pi-map-marker"></i><b>${r("Screen Anchor")}</b><small>${r("Fixed screen position")}</small>
        </button>
      </div>

      <div class="motion-creating" data-role="motion-creating" hidden>
        <span data-role="motion-creating-label">${r("Drawing motion")}</span>
        <button type="button" class="icon-button" data-motion-create-cancel title="${r("Cancel (Esc)")}"><i class="pi pi-times"></i></button>
      </div>

      <div class="oc-section">${r("Tracks")}</div>
      <div class="motion-empty" data-role="motion-layers-empty">
        ${r("No motion tracks yet. Control subject movement independently from the camera.")}
      </div>
      <div class="motion-layer-list" data-role="motion-layers"></div>

      <div class="oc-section">${r("Path Preview")}</div>
      <div class="motion-preview-wrap" title="${r("Motion paths in screen space. Click a path to select it.")}">
        <canvas class="motion-preview" data-role="motion-preview"></canvas>
        <div class="motion-preview-empty" data-role="motion-preview-empty">${r("Motion paths appear here in screen space.")}</div>
      </div>

      <div class="oc-card motion-selected" data-role="motion-selected" hidden>
        <div class="oc-card-title">
          <span data-role="motion-sel-name">${r("Selected Track")}</span>
          <span class="motion-badge" data-role="motion-sel-type">DRAW</span>
        </div>
        <div class="motion-sel-warn" data-role="motion-sel-warn" hidden></div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Binding")}</span>
          <span data-role="motion-sel-binding" class="oc-field-value">${r("Screen")}</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Timing")}</span>
          <span class="oc-field-value"><span data-role="motion-sel-start">0</span> &ndash; <span data-role="motion-sel-end">0</span></span>
        </div>
        <div class="motion-layer-controls">
          <select data-role="motion-interpolation" title="${r("Motion interpolation")}">
            <option value="linear">${r("Linear")}</option><option value="smooth">${r("Smooth")}</option><option value="hold">${r("Hold")}</option>
          </select>
          <label title="${r("Motion key visibility")}"><input data-role="motion-key-visible" type="checkbox" checked> ${r("Visible")}</label>
          <button class="icon-button" data-motion-layer-action="toggle" title="${r("Enable or disable motion layer")}"><i class="pi pi-eye"></i></button>
          <button class="icon-button" data-motion-layer-action="delete" title="${r("Delete motion layer")}"><i class="pi pi-trash"></i></button>
        </div>
        <button type="button" class="motion-fit-btn" data-motion-layer-action="retime" title="${r("Remap keys onto the current playback range")}">
          <i class="pi pi-clock"></i> ${r("Fit to Playback Range")}
        </button>
      </div>

      <details class="oc-more motion-advanced">
        <summary>${r("Advanced")} &middot; ${r("Camera Motion Field")} <span class="motion-badge experimental">EXPERIMENTAL</span></summary>
        <div class="motion-preset-bar" aria-label="${r("Camera field presets")}">
          <button data-motion-preset="balanced" title="${r("Balanced camera field")}">${r("Balanced")}</button>
          <button data-motion-preset="foreground" title="${r("Foreground camera field")}">${r("Foreground")}</button>
          <button data-motion-preset="subject" title="${r("Subject camera field")}">${r("Subject")}</button>
          <button data-motion-preset="ground_parallax" title="${r("Ground parallax camera field")}">${r("Ground")}</button>
          <button data-motion-preset="depth_layers" title="${r("Depth layers camera field")}">${r("Depth")}</button>
        </div>
      </details>

      <div class="oc-section">${r("Model Compatibility")}</div>
      <div class="motion-compat">
        <div><i class="pi pi-check"></i> Wan Move</div>
        <div><i class="pi pi-check"></i> Wan Track</div>
        <div><i class="pi pi-check"></i> ATI</div>
        <div><i class="pi pi-check"></i> LTX Motion</div>
        <p>${r("Motion Tracks are consumed by screen-track profiles. Generic video does not use them directly.")}</p>
      </div>
    </div>`;
}
function md() {
  const e = _c.map((t) => `<button data-lens="${t}">${t}mm</button>`).join("");
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="camera" hidden>
      <div class="oc-card">
        <div class="oc-card-title"><i class="pi pi-video"></i> <span data-role="inspector-camera-name">${r("Camera")}</span>
          <input data-role="camera-color" type="color" value="#4aa3ef" title="${r("Camera Color")}">
        </div>

        <div class="oc-section">${r("Lens")}</div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Sensor / Gate")}</span>
          <select data-role="camera-sensor-preset">
            <option value="custom">${r("Custom")}</option>
            <option value="full_frame">${r("Full Frame 35mm (36×24)")}</option>
            <option value="super_35">${r("Super 35 (24.89×18.66)")}</option>
            <option value="m43">${r("Micro 4/3 (17.3×13)")}</option>
            <option value="cinema_16_9">${r("16:9 Digital Cinema")}</option>
            <option value="mobile_9_16">${r("Mobile 9:16 Vertical")}</option>
          </select>
        </div>
        <div class="oc-field-row oc-scrub-field">
          <span class="oc-channel-key" data-channel="focal" title="${r("Animated channel key indicator")}">◆</span>
          <span class="oc-field-label" title="${r("Click and drag to scrub Focal Length")}">${r("Focal Length")}</span>
          <input data-role="camera-focal" type="number" min="4" max="800" step="0.5"><span class="oc-unit">mm</span>
        </div>
        <div class="oc-field-row oc-scrub-field">
          <span class="oc-field-label" title="${r("Field of View")}">${r("FOV")}</span>
          <input data-role="camera-fov" type="number" min="5" max="150" step="0.1"><span class="oc-unit">°</span>
        </div>
        <div class="oc-lens-presets">${e}</div>

        <div class="oc-section">${r("Transform")}</div>
        <div class="oc-vec-row">
          <span class="oc-channel-key" data-channel="pos" title="${r("Position key indicator")}">◆</span>
          <span class="oc-field-label">${r("Position")}</span>
          <label class="oc-axis x" title="${r("Scrub X (Shift: 0.01x, Ctrl: 1.0x)")}"><span class="oc-axis-tag">X</span><input data-role="camera-px" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y" title="${r("Scrub Y (Shift: 0.01x, Ctrl: 1.0x)")}"><span class="oc-axis-tag">Y</span><input data-role="camera-py" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z" title="${r("Scrub Z (Shift: 0.01x, Ctrl: 1.0x)")}"><span class="oc-axis-tag">Z</span><input data-role="camera-pz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-pos" title="${r("Reset Position")}">⟲</button>
        </div>
        <div class="oc-vec-row">
          <span class="oc-channel-key" data-channel="target" title="${r("Target key indicator")}">◆</span>
          <span class="oc-field-label">${r("Target XYZ")}</span>
          <label class="oc-axis x" title="${r("Scrub Target X")}"><span class="oc-axis-tag">X</span><input data-role="camera-tx" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y" title="${r("Scrub Target Y")}"><span class="oc-axis-tag">Y</span><input data-role="camera-ty" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z" title="${r("Scrub Target Z")}"><span class="oc-axis-tag">Z</span><input data-role="camera-tz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-target" title="${r("Reset Target")}">⟲</button>
        </div>
        <div class="oc-vec-row" title="${r("Pitch/Yaw/Roll: an alternative to Target XYZ, aiming the camera directly like a Maya/Blender rotate channel. Editing either one keeps the other in sync.")}">
          <span class="oc-channel-key" data-channel="rot" title="${r("Rotation key indicator")}">◆</span>
          <span class="oc-field-label">${r("Rotation")}</span>
          <label class="oc-axis x" title="${r("Scrub Pitch X")}"><span class="oc-axis-tag">X</span><input data-role="camera-rx" type="number" min="-90" max="90" step="1" aria-label="X"></label>
          <label class="oc-axis y" title="${r("Scrub Yaw Y")}"><span class="oc-axis-tag">Y</span><input data-role="camera-ry" type="number" step="1" aria-label="Y"></label>
          <label class="oc-axis z" title="${r("Scrub Roll Z")}"><span class="oc-axis-tag">Z</span><input data-role="camera-rz" type="number" min="-180" max="180" step="1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="rotation" title="${r("Reset Rotation")}">⟲</button>
        </div>
        <div class="oc-field-row oc-scrub-field">
          <span class="oc-channel-key" data-channel="roll" title="${r("Roll key indicator")}">◆</span>
          <span class="oc-field-label" title="${r("Click and drag to scrub Roll")}">${r("Roll")}</span>
          <input data-role="camera-roll" type="number" min="-180" max="180" step="0.1"><span class="oc-unit">°</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Look At")}</span>
          <select data-role="camera-target-object" title="${r("Track / Follow Moving Target Object")}">
            <option value="">${r("Manual Target (No Tracking)")}</option>
          </select>
        </div>
        <div class="oc-field-row" data-role="camera-aim-bone-row" hidden><span class="oc-field-label">${r("Aim Bone")}</span>
          <select data-role="camera-aim-bone" title="${r("Aim at a bone inside the tracked rig instead of its origin")}">
            <option value="">${r("Whole object")}</option>
          </select>
        </div>

        <div class="oc-section">${r("Motion")}</div>
        <div class="oc-field-row oc-slider-row"><span class="oc-field-label">${r("Path Smoothing")}</span>
          <input data-role="path-smoothing" type="range" min="0" max="100" step="1" value="0">
          <span class="oc-slider-value" data-role="path-smoothing-value">0%</span>
        </div>
        <div class="oc-field-row oc-slider-row"><span class="oc-field-label">${r("Simplify Keys")}</span>
          <input data-role="key-simplify" type="range" min="0" max="100" step="1" value="0" title="${r("Drop keys that barely change the motion. Replayed from the pre-simplify keys, so 0% restores them.")}">
          <span class="oc-slider-value" data-role="key-simplify-value">${r("Off")}</span>
        </div>
        <div class="oc-field-row">
          <span class="oc-field-label">${r("Keys")} <span data-role="key-count">0</span></span>
          <select data-role="key-op-scope" title="${r("Which tracks the key operations act on")}">
            <option value="camera">${r("Active camera")}</option>
            <option value="all_cameras">${r("All cameras")}</option>
            <option value="object">${r("Active object")}</option>
          </select>
          <button data-act="keys-reduce" title="${r("Decimate down to a target key count")}"><i class="pi pi-minus-circle"></i> ${r("Reduce…")}</button>
          <button data-act="keys-clean" title="${r("Remove duplicate, too-close and redundant keys")}"><i class="pi pi-filter"></i> ${r("Clean")}</button>
        </div>

        <div class="oc-card-actions">
          <button class="primary" data-act="key" title="${r("Insert / Update Keyframe at Playhead (I)")}"><i class="pi pi-key"></i> ${r("Insert Key (I)")}</button>
          <button data-act="reset-camera" title="${r("Reset active camera")}"><i class="pi pi-refresh"></i> ${r("Reset Cam")}</button>
        </div>
      </div>

      <details class="oc-more" data-density-min="advanced"><summary>${r("Projection & Clipping")}</summary>
        <div class="oc-field-row"><span class="oc-field-label">${r("Projection")}</span>
          <select data-role="camera-type"><option value="perspective">${r("Perspective")}</option><option value="orthographic">${r("Orthographic")}</option></select>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Near Clip")}</span><input data-role="camera-near" type="number" min="0.0001" step="0.001"></div>
        <div class="oc-field-row oc-chip-row"><span class="oc-field-label">${r("Near Presets")}</span>
          <div class="oc-chip-group">
            <button type="button" class="oc-chip-btn" data-act="set-near-preset" data-near="0.001" title="${r("Interior (0.001)")}">0.001</button>
            <button type="button" class="oc-chip-btn" data-act="set-near-preset" data-near="0.01" title="${r("Standard (0.01)")}">0.01</button>
            <button type="button" class="oc-chip-btn" data-act="set-near-preset" data-near="0.1" title="${r("Large (0.1)")}">0.1</button>
          </div>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Far Clip")}</span><input data-role="camera-far" type="number" min="0.0002" step="1"></div>
      </details>
    </div>`;
}
function pd() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="display" hidden>
      <div class="oc-card key-editor" data-role="key-editor" data-empty="true">
        <div class="oc-card-title"><i class="pi pi-key"></i> <span data-role="selected-key-label">${r("Key @ 0")}</span></div>
        <div class="oc-card-actions oc-key-actions">
          <button class="icon-button" data-act="update-key" title="${r("Update key from current 3D view")}"><i class="pi pi-refresh"></i></button>
          <button class="icon-button" data-act="view-key" title="${r("Jump Playhead & View to Key")}"><i class="pi pi-eye"></i></button>
          <button class="icon-button" data-act="copy-key" title="${r("Copy Keyframe (Ctrl+C)")}"><i class="pi pi-copy"></i></button>
          <button class="icon-button" data-act="paste-key" title="${r("Paste Keyframe at Playhead (Ctrl+V)")}"><i class="pi pi-clipboard"></i></button>
          <button class="icon-button" data-act="delete-key" title="${r("Delete Selected Keyframe (Del / Backspace)")}"><i class="pi pi-trash"></i></button>
        </div>
        <div class="key-nav-row" style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin:6px 0">
          <button type="button" class="icon-button" data-act="shot-prev-key" title="${r("Previous Keyframe")}"><i class="pi pi-step-backward"></i></button>
          <button type="button" class="icon-button" data-act="shot-prev-frame" title="${r("Previous Frame (-1f)")}"><i class="pi pi-chevron-left"></i></button>
          <span class="key-timecode-badge" data-role="key-timecode" style="font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text-dim)">00:00:00:00 (0f)</span>
          <button type="button" class="icon-button" data-act="shot-next-frame" title="${r("Next Frame (+1f)")}"><i class="pi pi-chevron-right"></i></button>
          <button type="button" class="icon-button" data-act="shot-next-key" title="${r("Next Keyframe")}"><i class="pi pi-step-forward"></i></button>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Frame")}</span><input data-role="key-frame" type="number" min="0" value="0"></div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Interpolation")}</span>
          <select data-role="key-interp">
            <option value="ease">${r("Ease")}</option><option value="smooth">${r("Smooth")}</option>
            <option value="bezier">${r("Bezier")}</option><option value="linear">${r("Linear")}</option>
            <option value="ease_in">${r("Ease In")}</option><option value="ease_out">${r("Ease Out")}</option>
            <option value="hold">${r("Hold")}</option>
            <option value="sine">${r("Sine")}</option><option value="cubic">${r("Cubic")}</option>
            <option value="quintic">${r("Quintic")}</option><option value="expo">${r("Expo")}</option>
            <option value="back">${r("Back")}</option>
          </select>
        </div>
        <div class="key-interp-buttons">
          <button type="button" class="key-interp-btn active" data-interp="ease">${r("Ease")}</button>
          <button type="button" class="key-interp-btn" data-interp="smooth">${r("Smooth")}</button>
          <button type="button" class="key-interp-btn" data-interp="bezier">${r("Bezier")}</button>
          <button type="button" class="key-interp-btn" data-interp="linear">${r("Linear")}</button>
          <button type="button" class="key-interp-btn" data-interp="ease_in">${r("Ease In")}</button>
          <button type="button" class="key-interp-btn" data-interp="ease_out">${r("Ease Out")}</button>
          <button type="button" class="key-interp-btn" data-interp="hold">${r("Hold")}</button>
          <button type="button" class="key-interp-btn" data-interp="sine">${r("Sine")}</button>
          <button type="button" class="key-interp-btn" data-interp="cubic">${r("Cubic")}</button>
          <button type="button" class="key-interp-btn" data-interp="quintic">${r("Quintic")}</button>
          <button type="button" class="key-interp-btn" data-interp="expo">${r("Expo")}</button>
          <button type="button" class="key-interp-btn" data-interp="back">${r("Back")}</button>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Tangents")}</span>
          <select data-role="key-tangent-mode" title="${r("Tangent mode for Bezier curves")}">
            <option value="auto">${r("Auto")}</option>
            <option value="clamped">${r("Clamped")}</option>
            <option value="vector">${r("Vector")}</option>
            <option value="free">${r("Free")}</option>
            <option value="aligned">${r("Aligned")}</option>
            <option value="flat">${r("Flat")}</option>
          </select>
        </div>
        <div class="key-tangent-buttons" style="display:flex;flex-wrap:wrap;gap:3px;margin:3px 0 6px">
          <button type="button" class="key-tangent-btn active" data-tangent="auto">${r("Auto")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="clamped">${r("Clamped")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="vector">${r("Vector")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="free">${r("Free")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="aligned">${r("Aligned")}</button>
          <button type="button" class="key-tangent-btn" data-tangent="flat">${r("Flat")}</button>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${r("Position")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="key-px" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="key-py" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="key-pz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-pos" title="${r("Reset Position")}">⟲</button>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${r("Target XYZ")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="key-tx" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="key-ty" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="key-tz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-target" title="${r("Reset Target")}">⟲</button>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${r("FOV")}</span><input data-role="key-fov" type="number" min="5" max="150" step="0.1"></div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Roll")}</span><input data-role="key-roll" type="number" min="-180" max="180" step="0.1"></div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Zoom")}</span><input data-role="key-zoom" type="number" min="0.01" step="0.05"></div>
        <div class="oc-field-row" data-role="key-timing-weight-row" title="${r("Authoring preference used by Redistribute Timing; does not change playback speed by itself")}">
          <span class="oc-field-label">${r("Timing Weight")}</span><input data-role="key-timing-weight" type="number" min="0.1" max="10" step="0.1">
        </div>
        <div class="oc-card-actions">
          <button type="button" class="icon-button" data-act="redistribute-key-timing" title="${r("Redistribute this camera's key timing across its current frame range using each key's Timing Weight")}">
            <i class="pi pi-sliders-h"></i> ${r("Redistribute Timing")}
          </button>
        </div>
        <div class="oc-path-diagnostics" data-role="path-diagnostics-list" hidden></div>
        <details class="oc-more" data-density-min="advanced"><summary>${r("Projection & Clipping")}</summary>
          <div class="oc-field-row"><span class="oc-field-label">${r("Camera")}</span>
            <select data-role="key-camera-type"><option value="perspective">${r("Perspective")}</option><option value="orthographic">${r("Orthographic")}</option></select>
          </div>
          <div class="oc-field-row"><span class="oc-field-label">${r("Near Clip")}</span><input data-role="key-near" type="number" min="0.0001" step="0.001"></div>
          <div class="oc-field-row"><span class="oc-field-label">${r("Far Clip")}</span><input data-role="key-far" type="number" min="0.0002" step="1"></div>
        </details>
      </div>
    </div>`;
}
function fd() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="health" data-density-min="animation" hidden>
      <div class="oc-card oc-health">
        <div class="oc-card-title"><i class="pi pi-heart"></i> ${r("Camera Health")}
          <div class="oc-health-header-badges" style="display:flex;align-items:center;gap:5px;margin-left:auto">
            <span class="oc-health-score-badge" data-role="health-score-badge">100% (A)</span>
            <span class="oc-health-badge" data-role="health-badge">${r("Checking")}</span>
          </div>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${r("Target model")}</span>
          <select data-role="health-profile" title="${r("Grade the shot against this model's recommended limits")}"></select>
        </div>
        <div data-role="health-body"></div>
      </div>
    </div>`;
}
function hd() {
  return `
    <div class="viewport-inspector oc-side" data-role="viewport-inspector">
      <div class="oc-inspector-head oc-side-tabs">
        <strong class="oc-inspector-title" data-role="inspector-title">${r("Inspector")}</strong>
        <span class="oc-panel-spacer"></span>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="motion" data-tab="motion" aria-pressed="false">${r("Motion")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="shot" data-tab="display" aria-pressed="false">${r("Shot")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="health" data-tab="health" data-density-min="animation" aria-pressed="false">${r("Health")}</button>
      </div>
      ${ld()}
      ${dd()}
      ${md()}
      ${pd()}
      ${fd()}
    </div>`;
}
function ud() {
  return `
    <div class="oc-preview camera-view-row" data-role="camera-view-row">
      <div class="oc-preview-head">
        <span data-role="preview-title">${r("Camera")}</span>
        <button class="camera-strip-close" data-act="toggle-camera-view" title="${r("Hide camera previews")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="camera-preview-strip" data-role="camera-previews"></div>
    </div>`;
}
function bd() {
  return `
    <div class="row timeline-toolbar oc-transport">
      <div class="timeline-group" title="${r("Playback Transport")}">
        <button class="icon-button" data-act="key-first" title="${r("First Frame (Home)")}" aria-label="${r("Go to first frame")}"><i class="pi pi-step-backward-alt"></i></button>
        <button class="icon-button" data-act="previous-key" title="${r("Previous Keyframe (, / Up Arrow)")}" aria-label="${r("Previous keyframe")}"><i class="pi pi-fast-backward"></i></button>
        <button class="icon-button" data-act="previous-frame" title="${r("Previous Frame (Left Arrow)")}" aria-label="${r("Previous frame")}"><i class="pi pi-step-backward"></i></button>
        <button class="icon-button primary-play oc-play" data-act="play" title="${r("Play / Stop (Space)")}" aria-label="${r("Play timeline")}"><i class="pi pi-play"></i></button>
        <button class="icon-button" data-act="next-frame" title="${r("Next Frame (Right Arrow)")}" aria-label="${r("Next frame")}"><i class="pi pi-step-forward"></i></button>
        <button class="icon-button" data-act="next-key" title="${r("Next Keyframe (. / Down Arrow)")}" aria-label="${r("Next keyframe")}"><i class="pi pi-fast-forward"></i></button>
        <button class="icon-button" data-act="key-last" title="${r("Last Frame (End)")}" aria-label="${r("Go to last frame")}"><i class="pi pi-step-forward-alt"></i></button>
        <button class="icon-button" data-act="loop" title="${r("Toggle Loop Playback")}" aria-label="${r("Loop playback")}" aria-pressed="false"><i class="pi pi-replay"></i></button>
      </div>

      <span class="oc-frame-counter">
        <input data-role="frame" type="number" min="0" value="0" aria-label="${r("Frame")}">
        <span class="oc-frame-total" data-role="frame-total">/ 120</span>
      </span>
      <button class="oc-timecode" data-role="time" data-act="toggle-timecode" title="${r("Click to toggle Time / Timecode")}">00:00.000</button>

      <span class="oc-transport-spacer"></span>

      <div class="timeline-group" title="${r("Keyframe Tools")}">
        <button class="icon-button primary-key oc-key" data-act="key" title="${r("Insert / Update Keyframe at Playhead (I)")}" aria-label="${r("Insert or update key")}"><span class="oc-diamond"></span> ${r("Key")}</button>
        <button class="icon-button auto-key-btn" data-act="auto-key" title="${r("Auto-Key: Records moves live while scrubbing/navigating")}" aria-label="${r("Toggle Auto Key")}" aria-pressed="false"><i class="pi pi-circle-fill"></i></button>
      </div>
      <label class="oc-fps">${r("FPS")} <input data-role="timeline-fps" type="number" min="1" max="120" step="1" value="24"></label>

      <details class="toolbar-menu oc-overflow" data-menu="timeline">
        <summary title="${r("Timeline options")}"><i class="pi pi-ellipsis-h"></i></summary>
        <div class="menu-panel right">
          <div class="menu-title">${r("Range & Duration")}</div>
          <label>${r("Dur")} <input data-role="duration-seconds" type="number" min="0.25" max="120" step="0.25" value="5"></label>
          <div class="menu-row">
            <button data-act="range-start" title="${r("Set In Point at Playhead ([)")}">[</button>
            <button data-act="range-end" title="${r("Set Out Point at Playhead (])")}">]</button>
            <button data-act="range-clear" title="${r("Clear Playback Range")}"><i class="pi pi-times"></i></button>
          </div>
          <div class="menu-divider"></div><div class="menu-title">${r("Snapping")}</div>
          <div class="menu-row">
            <button data-act="toggle-snap" title="${r("Toggle Snapping")}" aria-pressed="true"><i class="pi pi-thumbtack"></i> ${r("Snap")}</button>
            <input data-role="snap-frames" type="number" min="1" max="24" step="1" value="1">
          </div>
          <div class="menu-divider"></div>
          <button data-act="fit-timeline" title="${r("Fit Timeline to View (F)")}"><i class="pi pi-arrows-alt"></i> ${r("Fit Timeline to View (F)")}</button>
          <span class="timeline-summary" data-role="timeline-summary">${r("1 key")}</span>
        </div>
      </details>
    </div>`;
}
function gd() {
  return `
    <div class="oc-dope">
      <div class="oc-dope-body">
        <div class="oc-dope-labels">${us.map((t) => `
          <label class="oc-dope-label" style="--channel-color:${t.color}">
            <input type="checkbox" data-dope-channel="${t.id}" checked>
            <span>${r(t.label)}</span>
          </label>`).join("")}</div>
        <div class="oc-dope-tracks" data-role="dope-tracks" tabindex="-1">
          <div class="oc-ruler" data-role="ruler" title="${r("Drag to scrub the timeline")}"></div>
          <div class="keys" data-role="keys" tabindex="0" aria-label="${r("Camera keyframe timeline")}"></div>
          <div class="oc-dope-rows" data-role="dope-rows"></div>
          <span class="oc-playhead-line" data-role="dope-playhead"></span>
        </div>
      </div>
      <input class="oc-scrub oc-sr-only" data-role="scrub" type="range" min="0" max="119" value="0" aria-label="${r("Scrub the timeline")}">
    </div>`;
}
function yd() {
  return `
    <div class="oc-graph-head">
      <span class="oc-graph-tabs" data-role="graph-tabs">
        <button class="oc-graph-tab active" data-graph-tab="dope" aria-pressed="true" title="${r("Per-object/camera keyframe sheet")}">${r("Timeline")}</button>
        <button class="oc-graph-tab" data-graph-tab="curves" aria-pressed="false" data-density-min="animation" title="${r("Edit animation curves")}"><strong>${r("Graph")}</strong></button>
        <button class="oc-graph-tab" data-graph-tab="sequence" aria-pressed="false" data-density-min="animation" title="${r("Cut the timeline into shots, one camera per range")}">${r("Sequence")}</button>
      </span>
      <span class="hint">${r("MMB/Alt-drag: Pan · Scroll: Zoom · Box Select: Drag · Drag Point: Retime/Value · Right-click: Menu")}</span>
    </div>`;
}
function vd() {
  return `
    <div class="curve-toolbar oc-graph-toolbar" data-role="graph-toolbar" data-density-min="animation" hidden>
      <select data-role="curve-group" title="${r("Choose the animated channels displayed in the graph")}">
        <option value="camera">${r("Camera (Position, Focal, Roll)")}</option>
        <option value="position">${r("Position XYZ")}</option>
        <option value="target">${r("Target XYZ")}</option>
        <option value="lens">${r("FOV / Roll / Zoom")}</option>
        <option value="timing">${r("Timing / Speed")}</option>
      </select>
      <span class="oc-graph-spacer"></span>
      <span data-role="time-remap-controls" hidden style="align-items:center;gap:5px">
        <select data-role="time-remap-preset" title="${r("Timing preset")}">
          <option value="custom">${r("Custom")}</option>
          <option value="constant">${r("Constant")}</option>
          <option value="ease_in">${r("Ease In")}</option>
          <option value="ease_out">${r("Ease Out")}</option>
          <option value="ease_in_out">${r("Ease In/Out")}</option>
        </select>
        <label title="${r("Blend the timing preset with the currently authored weights")}">${r("Strength")}
          <input data-role="time-remap-strength" type="range" min="0" max="100" step="1" value="100">
        </label>
        <output data-role="time-remap-strength-out">100%</output>
        <button type="button" data-act="time-remap-apply" title="${r("Bake Timing Weights into camera keyframe times")}">${r("Apply Remap")}</button>
      </span>
      <span class="oc-graph-spacer"></span>
      <div class="oc-graph-modes" data-role="curve-modes">
        <button class="curve-mode" data-tangent-mode="auto" title="${r("Automatic smooth tangents")}">${r("Auto")}</button>
        <button class="curve-mode" data-curve-mode="smooth" title="${r("Smooth interpolation after the selected key")}">${r("Smooth")}</button>
        <button class="curve-mode" data-curve-mode="linear" title="${r("Straight interpolation after the selected key")}">${r("Linear")}</button>
      </div>
      <button class="curve-mode" data-act="curve-zoom-in" disabled title="${r("Zoom in curve editor (Mouse wheel)")}"><i class="pi pi-search-plus"></i></button>
      <button class="curve-mode" data-act="curve-zoom-out" disabled title="${r("Zoom out curve editor")}"><i class="pi pi-search-minus"></i></button>
      <button class="curve-mode" data-act="curve-fit" disabled title="${r("Fit curves to view")}"><i class="pi pi-arrows-alt"></i></button>
      <button class="curve-mode active" data-act="curve-handles" disabled aria-pressed="true" title="${r("Show or hide Bézier tangent handles")}"><i class="pi pi-share-alt"></i></button>
      <details class="toolbar-menu oc-overflow" data-menu="curve">
        <summary title="${r("Interpolation & tangents")}"><i class="pi pi-ellipsis-h"></i></summary>
        <div class="menu-panel right">
          <div class="menu-title">${r("Interpolation")}</div>
          <div class="menu-grid">
            <button class="curve-mode" data-curve-mode="bezier">${r("Bezier")}</button>
            <button class="curve-mode" data-curve-mode="ease">${r("Ease In/Out")}</button>
            <button class="curve-mode" data-curve-mode="ease_in">${r("Ease In")}</button>
            <button class="curve-mode" data-curve-mode="ease_out">${r("Ease Out")}</button>
            <button class="curve-mode" data-curve-mode="sine">${r("Sine")}</button>
            <button class="curve-mode" data-curve-mode="cubic">${r("Cubic")}</button>
            <button class="curve-mode" data-curve-mode="quintic">${r("Quintic")}</button>
            <button class="curve-mode" data-curve-mode="expo">${r("Expo")}</button>
            <button class="curve-mode" data-curve-mode="back">${r("Back")}</button>
            <button class="curve-mode" data-curve-mode="hold">${r("Hold / Step")}</button>
          </div>
          <div class="menu-divider"></div><div class="menu-title">${r("Tangents")}</div>
          <div class="menu-grid">
            <button class="curve-mode" data-tangent-mode="clamped">${r("Clamped")}</button>
            <button class="curve-mode" data-tangent-mode="vector">${r("Vector")}</button>
            <button class="curve-mode" data-tangent-mode="free">${r("Free")}</button>
            <button class="curve-mode" data-tangent-mode="aligned">${r("Aligned")}</button>
            <button class="curve-mode" data-tangent-mode="flat">${r("Flat")}</button>
          </div>
        </div>
      </details>
    </div>`;
}
function xd() {
  return `
    <div class="oc-lower">
      ${ud()}
      <div class="oc-resize-h" data-role="preview-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${r("Drag to resize the camera view — double-click to reset")}" aria-label="${r("Resize the camera view")}"></div>
      <div class="timeline oc-timeline">
        ${bd()}
        <div class="curve-editor">
          ${yd()}
          ${vd()}
          <div class="oc-graph-body">
            <div class="oc-graph-legend" data-role="curve-legend" hidden></div>
            <div class="oc-graph-stage">
              <div class="oc-dope-stage" data-role="dope-stage">
                ${gd()}
                <div class="motion-timeline" data-role="motion-timeline" aria-label="${r("Motion track timeline")}"></div>
              </div>
              <canvas class="curve-canvas" data-role="curve-canvas" tabindex="-1" hidden title="${r("Drag a key point vertically or drag tangent handles on either side. Scroll to zoom. Right-click for curve actions.")}"></canvas>
              <div class="oc-gsequence" data-role="graph-sequence" tabindex="0" hidden></div>
            </div>
          </div>
          <div class="oc-resize-v oc-graph-resize" data-role="graph-resize" role="separator" aria-orientation="horizontal" tabindex="0"
               title="${r("Drag to resize the Timeline/Graph/Sequence area — double-click to reset")}" aria-label="${r("Resize the Timeline/Graph/Sequence area")}"></div>
        </div>
      </div>
    </div>`;
}
function kd() {
  return `
    <details class="toolbar-menu" data-menu="file"><summary><i class="pi pi-folder"></i> ${r("Scene")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${r("Scene Library")}</div>
      <button data-act="scene-new"><i class="pi pi-file"></i> ${r("New Scene")}</button>
      <button data-act="scene-open"><i class="pi pi-folder-open"></i> ${r("Open Scene…")}</button>
      <button data-act="scene-save" class="primary"><i class="pi pi-save"></i> ${r("Save Scene")}</button>
      <div class="menu-divider"></div>
      <button data-act="scene-reset"><i class="pi pi-undo"></i> ${r("Reset Scene")}</button>
      <span class="hint">${r("Reset reverts to the last saved or opened scene.")}</span>
    </div></details>`;
}
function wd() {
  return `
    <details class="toolbar-menu" data-menu="scene"><summary><i class="pi pi-box"></i> ${r("Viewport")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${r("Upstream Sync & Imports")}</div>
      <button data-act="sync-inputs" class="primary"><i class="pi pi-sync"></i> ${r("Sync Upstream Inputs")}</button>
      <div class="menu-grid">
        <button data-act="load-card"><i class="pi pi-image"></i> ${r("Set Subject Card")}</button>
        <button data-act="add-card"><i class="pi pi-images"></i> ${r("Add Media Card")}</button>
        <button data-act="load-model"><i class="pi pi-box"></i> ${r("Import 3D Scene")}</button>
        <button data-act="load-audio"><i class="pi pi-volume-up"></i> ${r("Load Audio Track")}</button>
      </div>
      <span class="hint">${r("GLB, OBJ, FBX, STL, PLY. Audio WAV/MP3/OGG.")}</span>
      <div class="menu-divider"></div>
      <div class="menu-pack">
        <div class="menu-pack-header"><span>${r("Objects & Primitives")}</span><span class="menu-pack-badge">7</span></div>
        <div class="menu-grid">
          <button data-object-type="cube"><i class="pi pi-stop"></i> ${r("Cube")}</button>
          <button data-object-type="sphere"><i class="pi pi-circle"></i> ${r("Sphere")}</button>
          <button data-object-type="cylinder"><i class="pi pi-database"></i> ${r("Cylinder")}</button>
          <button data-object-type="torus"><i class="pi pi-circle"></i> ${r("Torus")}</button>
          <button data-object-type="card"><i class="pi pi-image"></i> ${r("Card")}</button>
          <button data-object-type="human"><i class="pi pi-user"></i> ${r("Human Proxy")}</button>
          <button data-object-type="null" class="span-2"><i class="pi pi-plus"></i> ${r("Null Locator")}</button>
        </div>
      </div>
      <div class="menu-section" data-density-min="animation">
        <div class="menu-divider"></div><div class="menu-title">${r("Camera Interchange")}</div>
        <button data-act="import-camera"><i class="pi pi-download"></i> ${r("Import Camera…")}</button>
        <span class="hint">${r("glTF, GLB, FBX, .chan or an OmniCam JSON track.")}</span>
        <label>${r("Export format")} <select data-role="export-format"></select></label>
        <button data-act="export-camera"><i class="pi pi-upload"></i> ${r("Export Camera")}</button>
        <span class="hint" data-role="export-note"></span>
        <input data-role="camera-file" type="file" accept=".gltf,.glb,.fbx,.chan,.json" hidden>
      </div>
      <div class="menu-section" data-density-min="advanced">
        <div class="menu-divider"></div>
        <div class="menu-pack">
          <div class="menu-pack-header"><span>${r("Blocking Scene Sets (Parallax / Occlusion)")}</span><span class="menu-pack-badge">5</span></div>
          <div class="menu-grid">
            <button data-blocking-scene="foreground_reveal" title="${r("Foreground pillar sweep reveal")}">${r("FG Reveal")}</button>
            <button data-blocking-scene="doorway_pass" title="${r("Push-in through doorway opening")}">${r("Doorway Pass")}</button>
            <button data-blocking-scene="over_the_shoulder" title="${r("Over the shoulder frame")}">${r("OTS Frame")}</button>
            <button data-blocking-scene="perspective_corridor" title="${r("Perspective depth colonnade")}">${r("Corridor")}</button>
            <button data-blocking-scene="tabletop_orbit" class="span-2" title="${r("Product pedestal 360 orbit")}">${r("Tabletop 360° Orbit")}</button>
          </div>
        </div>
      </div>
    </div></details>`;
}
function Sd() {
  return `
    <details class="toolbar-menu" data-menu="camera"><summary><i class="pi pi-video"></i> <span data-role="camera-summary">${r("Cameras")}</span> <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${r("Animated cameras")}</div>
      <div class="camera-menu-list" data-role="camera-menu-list"></div>
      <button data-act="add-camera"><i class="pi pi-plus"></i> ${r("Add Camera")}</button>
      <div class="menu-divider"></div><div class="menu-title">${r("Targeting")}</div>
      <button data-act="aim-at-object" class="primary"><i class="pi pi-compass"></i> ${r("Aim at Target Subject")}</button>
      <button data-act="focus-target"><i class="pi pi-expand"></i> ${r("Frame Camera Target")}</button>
      <div class="menu-section" data-density-min="animation">
        <div class="menu-grid">
          <button data-act="bake-aim-keys"><i class="pi pi-check-square"></i> ${r("Bake")}</button>
          <button data-act="bake-aim-per-frame" title="${r("One camera key per frame, so an exported track matches the viewport exactly")}"><i class="pi pi-list-check"></i> ${r("Bake Per Frame")}</button>
        </div>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-pack">
        <div class="menu-pack-header"><span>${r("Motion Presets & Shake")}</span><span class="menu-pack-badge">9</span></div>
        <div class="menu-title" style="margin-top:2px">${r("Camera Path Presets")}</div>
        <div class="menu-grid">
          <button data-preset="orbit_360">${r("Orbit 360°")}</button>
          <button data-preset="push_in">${r("Push In")}</button>
          <button data-preset="pull_out">${r("Pull Out")}</button>
          <button data-preset="dolly_zoom">${r("Dolly Zoom (Vertigo)")}</button>
        </div>
        <div class="menu-title" style="margin-top:5px">${r("Camera Shake")}</div>
        <div class="menu-grid">
          <button data-shake="handheld">${r("Handheld")}</button>
          <button data-shake="subtle">${r("Subtle")}</button>
          <button data-shake="handheld_subtle">${r("Handheld Shake")}</button>
          <button data-shake="turbulence">${r("Turbulence Shake")}</button>
          <button data-shake="crash" class="span-2">${r("Crash")}</button>
        </div>
      </div>
      <div class="menu-divider"></div>
      <label>${r("New key interpolation")} <select data-role="interp">
        <option value="ease">${r("Ease")}</option><option value="smooth">${r("Smooth")}</option>
        <option value="bezier">${r("Bezier")}</option><option value="linear">${r("Linear")}</option>
        <option value="ease_in">${r("Ease In")}</option><option value="ease_out">${r("Ease Out")}</option>
      </select></label>
      <button data-act="reset-camera"><i class="pi pi-refresh"></i> ${r("Reset Camera")}</button>
    </div></details>`;
}
function jd() {
  return `
    <details class="toolbar-menu" data-menu="view"><summary><i class="pi pi-compass"></i> ${r("View")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${r("Navigation & Selection")}</div>
      <label title="${r("Middle drag orbits, Shift+middle pans, Ctrl+middle dollies -- no Alt needed anywhere. Alt+left/middle/right are aliases for orbit/pan/dolly; with no middle button, Ctrl+drag over empty space orbits and Ctrl+Shift+drag pans. Maya vs Blender only decides whether Alt+right dollies (Maya) or does nothing (Blender). Simple is mouse-only: left drag orbits, right drag pans, wheel zooms -- no modifiers, no middle button, no viewport marquee or right-click menu.")}">${r("Navigation profile")} <select data-role="navigation-profile"><option value="maya">Maya</option><option value="blender">Blender</option><option value="simple">${r("Simple")}</option></select></label>
      <div class="menu-section" data-density-min="advanced">
        <label>${r("Select mode")} <select data-role="select-mode">
          <option value="object" selected>${r("Object (4)")}</option>
          <option value="vertex">${r("Vertex (1)")}</option>
          <option value="edge">${r("Edge (2)")}</option>
          <option value="face">${r("Face (3)")}</option>
        </select></label>
        <label title="${r("Applies to Move only. Scale and Rotate always use the object's own axes, as Maya's manipulators do: a size triple and an XYZ euler only exist in the object's own frame, so a world-axis scale would shear it and a world-axis rotation cannot be expressed at all.")}">${r("Transform space")} <select data-role="gizmo-space"><option value="world">${r("World")}</option><option value="local">${r("Local")}</option></select></label>
        <label>${r("Spatial snapping")} <select data-role="spatial-snap-mode"><option value="none">${r("No Snap")}</option><option value="grid">${r("Grid")}</option><option value="vertex">${r("Vertex")}</option></select></label>
        <label>${r("Spatial grid size")} <input data-role="spatial-grid-size" type="number" min="0.01" max="100" step="0.01" value="0.5"></label>
      </div>
      <label>${r("Move speed")} <input data-role="speed" type="number" min="0.05" max="5" step="0.05" value="1"></label>
      <div class="menu-divider"></div><div class="menu-title">${r("Proxy Reference")}</div>
      <label>${r("Point density")} <select data-role="point-density">
        <option value="none">${r("None (0)")}</option><option value="sparse">${r("Sparse (300)")}</option>
        <option value="balanced" selected>${r("Balanced (800)")}</option><option value="dense">${r("Dense (1800)")}</option>
        <option value="ultra">${r("Ultra (3500)")}</option>
      </select></label>
      <label>${r("Point spread")} <select data-role="point-spread">
        <option value="all_views" selected>${r("All Views (Full 3D)")}</option>
        <option value="ground_focus">${r("Ground + Low Angle")}</option>
        <option value="dome">${r("Spherical Dome")}</option>
      </select></label>
      <label>${r("Point color")} <input data-role="point-color" type="color" value="#cbd5e1"></label>
      <label>${r("Card fit")} <select data-role="card-fit"><option value="contain">${r("Fit")}</option><option value="cover">${r("Fill")}</option><option value="stretch">${r("Stretch")}</option></select></label>
      <label>${r("Interface")} <select data-role="ui-density"><option value="basic">${r("Basic")}</option><option value="animation">${r("Animation")}</option><option value="advanced" selected>${r("Advanced")}</option></select></label>
      <div class="menu-divider"></div>
      <button data-act="reset-layout" title="${r("Restore every resizable panel to its default size")}"><i class="pi pi-table"></i> ${r("Reset Layout")}</button>
    </div></details>`;
}
function Cd() {
  return `
    <details class="toolbar-menu" data-menu="display"><summary><i class="pi pi-eye"></i> ${r("Display")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${r("Composition Guides & Mini-Map")}</div>
      <label><span>${r("Rule of Thirds")}</span><input data-role="guides" type="checkbox" checked></label>
      <div class="menu-section" data-density-min="advanced">
        <label><span>${r("2D Radar Mini-Map")}</span><input data-role="show-radar" type="checkbox"></label>
      </div>
      <label><span>${r("Safe Areas (90%/80%)")}</span><input data-role="safe-areas" type="checkbox"></label>
      <div class="menu-section" data-density-min="animation">
        <label title="${r("Mask the viewport down to the node's output width x height")}"><span>${r("Resolution Gate")}</span><input data-role="resolution-gate" type="checkbox"></label>
        <label>${r("Aspect Ratio")} <select data-role="aspect-ratio">
          <option value="auto">${r("Auto (node output)")}</option><option value="16:9">16:9</option><option value="4:3">4:3</option>
          <option value="1:1">1:1</option><option value="9:16">9:16</option><option value="2.39:1">2.39:1</option>
        </select></label>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${r("Scene Display")}</div>
      <label><span>${r("Floor Grid")}</span><input data-role="show-grid" type="checkbox" checked></label>
      <label><span>${r("Camera Paths")}</span><input data-role="show-camera-paths" type="checkbox" checked></label>
      <label><span>${r("Camera Gizmos (body / frustum)")}</span><input data-role="show-camera-gizmos" type="checkbox" checked></label>
      <label><span>${r("Look-At Targets")}</span><input data-role="show-look-at" type="checkbox" checked></label>
      <label><span>${r("Helper Axes (nulls)")}</span><input data-role="show-helper-axes" type="checkbox" checked></label>
      <label><span>${r("Keep the grid in the playblast")}</span><input data-role="playblast-grid" type="checkbox"></label>
      <label><span>${r("Burn labels / annotations into the playblast")}</span><input data-role="playblast-labels" type="checkbox"></label>
      <label>${r("Reconstruction Appearance")} <select data-role="reconstruction-appearance">
        <option value="neutral">${r("Neutral")}</option>
        <option value="source_texture">${r("Source Texture")}</option>
      </select></label>
      <div class="menu-section" data-density-min="advanced">
        <label title="${r("Resolution of the recorded playblast video")}">${r("Playblast Resolution")} <select data-role="playblast-resolution">
          <option value="viewport">${r("Viewport (fast)")}</option>
          <option value="half">${r("½ x node output")}</option>
          <option value="output">${r("Match node output")}</option>
          <option value="double">${r("2x node output (sharp)")}</option>
        </select></label>
      </div>
      <div class="menu-section" data-density-min="advanced">
        <label><span>${r("Wireframe / Edges")}</span><input data-role="show-wireframe" type="checkbox"></label>
        <label><span>${r("Mesh Vertices")}</span><input data-role="show-vertices" type="checkbox"></label>
        <label><span>${r("Backface Culling")}</span><input data-role="backface-culling" type="checkbox"></label>
        <label><span>${r("Burn-in Data")}</span><input data-role="burn-in" type="checkbox"></label>
        <label><span>${r("Speed Map")}</span><input data-role="speed-heatmap" type="checkbox"></label>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${r("Environment & Background")}</div>
      <label>${r("BG Color")} <input data-role="viewport-bg-color" type="color" value="#121212"></label>
      <button data-act="reset-bg-color" title="${r("Restore the studio sky")}"><i class="pi pi-undo"></i> ${r("Reset BG Color")}</button>
      <div class="menu-row" data-density-min="advanced">
        <button data-act="upload-viewport-bg"><i class="pi pi-image"></i> ${r("BG Image")}</button>
        <button data-act="upload-viewport-bg-seq"><i class="pi pi-images"></i> ${r("BG Sequence")}</button>
        <button data-act="clear-viewport-bg" class="icon-button" title="${r("Clear Background")}"><i class="pi pi-trash"></i></button>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${r("Previews")}</div>
      <label>${r("Layout")} <select data-role="preview-layout">
        <option value="auto">${r("Auto strip")}</option><option value="1">${r("Single")}</option>
        <option value="2">${r("Side by side")}</option><option value="4">${r("Quad")}</option>
      </select></label>
    </div></details>`;
}
function _d() {
  return `
    <div class="top">
      <button class="icon-button oc-drawer-toggle" data-act="toggle-scene-panel" title="${r("Outliner")}" aria-pressed="false"><i class="pi pi-bars"></i></button>
      <div class="oc-dcc-menubar">
        ${kd()}
        ${wd()}
        ${Sd()}
        ${jd()}
        ${Cd()}
      </div>
      <input data-role="file" type="file" accept="image/*,video/*" hidden>
      <input data-role="model-file" type="file" accept=".glb,.obj,.fbx,.stl,.ply" hidden>
      <input data-role="audio-file" type="file" accept="audio/*,.wav,.mp3,.ogg,.flac" hidden>
      <input data-role="viewport-bg-file" type="file" accept="image/*" hidden>
      <input data-role="viewport-bg-seq-file" type="file" accept="image/*" multiple hidden>
      <span class="oc-toolbar-spacer"></span>
      <div class="oc-shelf-modes">
        <select class="oc-render-mode" data-role="mode" title="${r("Proxy / Shading Mode: Visual conditioning reference for generative video models and scene staging")}">
          <optgroup label="${r("AI Video Reference")}">
            <option value="omni_ref">${r("Omni Ref (Card + Grid + Depth)")}</option>
            <option value="card_grid">${r("Card + Grid (Clean Reference)")}</option>
            <option value="point_field">${r("Point Field (Wan ATI Trajectories)")}</option>
          </optgroup>
          <optgroup label="${r("Layout & Geometry")}">
            <option value="graybox">${r("Clay Blockout (Neutral Massing)")}</option>
            <option value="wireframe">${r("Wireframe (Mesh Structure)")}</option>
            <option value="grid">${r("Grid Only (Camera Motion)")}</option>
          </optgroup>
          <optgroup label="${r("Presentation")}">
            <option value="beauty">${r("Beauty (Studio Lit)")}</option>
          </optgroup>
        </select>
        <button class="icon-button oc-strip-toggle" data-act="toggle-camera-view" title="${r("Toggle Camera Previews Strip")}"><i class="pi pi-video"></i></button>
        <button class="icon-button oc-drawer-toggle" data-act="toggle-inspector-panel" title="${r("Inspector")}" aria-pressed="false"><i class="pi pi-sliders-h"></i></button>
      </div>
      <select class="oc-guide-capture-style" data-role="guide-capture-style" title="${r("Guide Capture Style: the material/lighting recipe recorded into the playblast, independent of Proxy mode")}">
        <option value="auto">${r("Guide: Auto")}</option>
        <option value="motion_proxy">${r("Guide: Motion Proxy")}</option>
        <option value="clay">${r("Guide: Clay")}</option>
        <option value="depth_rich">${r("Guide: Depth Rich")}</option>
      </select>
      <button class="oc-playblast" data-act="record" title="${r("Record proxy playblast")}"><span class="oc-playblast-dot"></span>${r("Playblast")}</button>
    </div>`;
}
function Ed() {
  return `
    <div class="vp-rail" role="toolbar" aria-label="${r("Viewport tools")}">
      <button class="vp-tool" data-act="clear-selection" title="${r("Select Object Tool (Q)")}"><i class="pi pi-arrow-up-left"></i></button>
      <button class="vp-tool" data-transform-mode="translate" title="${r("Translation gizmo (click)")}"><i class="pi pi-arrows-alt"></i></button>
      <button class="vp-tool" data-transform-mode="rotate" title="${r("Rotation gizmo (click)")}"><i class="pi pi-replay"></i></button>
      <button class="vp-tool" data-transform-mode="scale" title="${r("Scale gizmo (click)")}"><i class="pi pi-stop"></i></button>
      <button class="vp-tool" data-act="draw-camera-path" aria-pressed="false"
              title="${r("Draw Camera Path (perspective or top / front / side view)")}" aria-label="${r("Draw Camera Path")}">
        <i class="pi pi-pencil"></i>
      </button>
      <button class="vp-tool" data-act="draw-camera-path-extend" aria-pressed="false"
              title="${r("Continue Camera Path — draw a new segment from the active camera's last key")}" aria-label="${r("Continue Camera Path")}">
        <i class="pi pi-arrow-right"></i>
      </button>
      <button class="vp-tool" data-act="camera-path-presets"
              title="${r("Camera Path Presets — generate an editable path (Orbit, Dolly, Arc, ...)")}" aria-label="${r("Camera Path Presets")}">
        <i class="pi pi-compass"></i>
      </button>
      <button class="vp-tool" data-act="toggle-gizmo-space" data-role="gizmo-space-toggle"
              title="${r("Toggle Transform Space (World / Local)")}">
        <span class="vp-space-badge" data-role="gizmo-space-badge">W</span>
      </button>
      <button class="vp-tool" data-act="toggle-spatial-snap" data-role="spatial-snap-toggle" aria-pressed="false"
              title="${r("Toggle Snapping (Grid / None)")}" aria-label="${r("Toggle Snapping (Grid / None)")}">
        <i class="pi pi-thumbtack"></i>
      </button>
      <span class="vp-rail-divider"></span>
      <button class="vp-tool" data-select-mode="vertex" data-density-min="advanced" title="${r("Vertex Selection Mode (1)")}"><i class="pi pi-circle"></i></button>
      <button class="vp-tool" data-select-mode="edge" data-density-min="advanced" title="${r("Edge Selection Mode (2)")}"><i class="pi pi-minus"></i></button>
      <button class="vp-tool" data-select-mode="face" data-density-min="advanced" title="${r("Face / Polygon Selection Mode (3)")}"><i class="pi pi-table"></i></button>
      <button class="vp-tool active" data-select-mode="object" title="${r("Object Selection Mode (4)")}"><i class="pi pi-box"></i></button>
      <span class="vp-rail-divider"></span>
      <button class="vp-tool" data-act="frame-target" title="${r("Frame Subject Target (F)")}"><i class="pi pi-expand"></i></button>
      <button class="vp-tool" data-act="select-look-at" data-density-min="advanced" title="${r("Select camera Look-At target")}"><i class="pi pi-bullseye"></i></button>
      <button class="vp-tool" data-act="toggle-inspector" title="${r("Toggle Inspector Panel (N)")}"><i class="pi pi-ellipsis-h"></i></button>
    </div>`;
}
function $d() {
  return `
    <div class="vp-pills" role="group" aria-label="${r("Quick viewport views")}">
      <div class="vp-quick-views">
        <button type="button" class="vp-view" data-view="perspective" aria-pressed="false" title="${r("Perspective View")}">${r("Perspective")}</button>
        <button type="button" class="vp-view" data-view="top" aria-pressed="false" title="${r("Top View")}">${r("Top")}</button>
        <button type="button" class="vp-view" data-view="front" aria-pressed="false" title="${r("Front View")}">${r("Front")}</button>
        <button type="button" class="vp-view" data-view="right" aria-pressed="false" title="${r("Right View")}">${r("Right")}</button>
        <button type="button" class="vp-view active" data-view="camera" aria-pressed="true" title="${r("Camera View")}">${r("Camera")}</button>
        <button type="button" class="vp-view" data-view="iso" aria-pressed="false" title="${r("Isometric View")}">${r("ISO")}</button>
      </div>
      <select class="vp-pill vp-pill-select" data-role="view-mode" aria-label="${r("More viewport views")}" title="${r("View mode: Camera (Numpad 0), Front/Back (1), Top/Bottom (7), Right/Left (3)")}">
        <option value="camera">${r("Camera View")}</option>
        <option value="perspective">${r("Perspective")}</option>
        <option value="iso">${r("Isometric View")}</option>
        <option value="front">${r("Front View")}</option>
        <option value="back">${r("Back View")}</option>
        <option value="top">${r("Top View")}</option>
        <option value="bottom">${r("Bottom View")}</option>
        <option value="right">${r("Right Side")}</option>
        <option value="left">${r("Left Side")}</option>
      </select>
      <select class="vp-pill vp-pill-select" data-role="active-camera-select" title="${r("Switch Active Camera")}"></select>
    </div>`;
}
function Md() {
  return `
    <div class="motion-tools" role="toolbar" aria-label="${r("Motion track tools")}">
      <button class="active" data-motion-tool="select" aria-pressed="true" title="${r("Select motion track")}"><i class="pi pi-arrow-up-left"></i></button>
      <button data-motion-tool="track" aria-pressed="false" title="${r("Draw motion track")}"><i class="pi pi-pencil"></i></button>
      <button data-motion-tool="anchor" aria-pressed="false" title="${r("Add static screen anchor")}"><i class="pi pi-map-marker"></i></button>
      <button data-motion-tool="project" aria-pressed="false" title="${r("Project selected object or world point")}"><i class="pi pi-bullseye"></i></button>
      <button data-motion-tool="erase" aria-pressed="false" title="${r("Erase motion track")}"><i class="pi pi-eraser"></i></button>
    </div>`;
}
function Td() {
  return `
    <div class="viewport-wrap">
      <canvas tabindex="0" role="img" aria-label="${r("3D scene viewport. Drag to orbit, scroll to zoom, F to frame the selection, right-click for the context menu.")}"></canvas>

      <div class="viewport-tally-banner" data-role="tally-banner" hidden>
        <span class="tally-dot"></span>
        <span class="tally-text" data-role="tally-text">REC KEY @ F0</span>
      </div>

      <div class="vp-camera-hud" data-role="camera-hud" hidden>
        <button type="button" class="hud-cam-lock" data-act="toggle-camera-lock" title="${r("Lock Camera View (prevent accidental navigation)")}">
          <i class="pi pi-lock-open" data-role="cam-lock-icon"></i>
        </button>
        <span class="hud-cam-name" data-role="hud-cam-name">Camera</span>
        <span class="hud-divider">·</span>
        <span class="hud-cam-lens" data-role="hud-cam-lens">35mm</span>
        <span class="hud-cam-fov" data-role="hud-cam-fov">54.4°</span>
        <span class="hud-divider">·</span>
        <span class="hud-cam-dist" data-role="hud-cam-dist">Target: 4.2m</span>
        <button type="button" class="hud-roll-reset" data-act="reset-camera-roll" data-role="hud-roll-reset" title="${r("Reset roll to 0°")}" hidden>
          <i class="pi pi-undo"></i> <span data-role="hud-roll-val">0°</span>
        </button>
      </div>

      <div class="extractor-import-banner" data-role="extractor-import-banner" hidden>
        <i class="pi pi-video"></i>
        <span data-role="extractor-import-text"></span>
        <button type="button" class="ei-import" data-act="import-extractor-camera">${r("Import as Camera")}</button>
        <button type="button" class="ei-dismiss" data-act="dismiss-extractor-camera" title="${r("Dismiss")}" aria-label="${r("Dismiss")}"><i class="pi pi-times"></i></button>
      </div>

      ${$d()}
      ${Md()}

      <div class="vp-corner">
        <div class="vp-overlay-group" role="group" aria-label="${r("Quick Overlays")}">
          <button type="button" class="vp-overlay-btn" data-act="toggle-grid-overlay" data-role="overlay-grid-btn" title="${r("Toggle Floor Grid")}"><i class="pi pi-th-large"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-wireframe-overlay" data-role="overlay-wireframe-btn" title="${r("Toggle Wireframe on Shaded / Mesh Edges")}"><i class="pi pi-box"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-cull-overlay" data-role="overlay-cull-btn" title="${r("Toggle Backface Culling (Solid Interior / Single-Sided)")}"><i class="pi pi-clone"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-gizmo-overlay" data-role="overlay-gizmo-btn" title="${r("Toggle Transform Gizmos")}"><i class="pi pi-arrows-alt"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-guides-overlay" data-role="overlay-guides-btn" title="${r("Toggle Composition Guides (Rule of Thirds)")}"><i class="pi pi-hashtag"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-safe-areas-overlay" data-role="overlay-safe-btn" title="${r("Toggle Safe Areas")}"><i class="pi pi-stop"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-radar-overlay" data-role="overlay-radar-btn" title="${r("Toggle 2D Radar Mini-Map")}"><i class="pi pi-compass"></i></button>
        </div>
        <select class="vp-pill vp-pill-select vp-shading-select" data-role="shading-mode-select" title="${r("Viewport Shading Mode")}">
          <optgroup label="${r("AI Video Reference")}">
            <option value="omni_ref">${r("Omni Ref (Card + Grid + Depth)")}</option>
            <option value="card_grid">${r("Card + Grid (Clean Reference)")}</option>
            <option value="point_field">${r("Point Field (Wan ATI Trajectories)")}</option>
          </optgroup>
          <optgroup label="${r("Layout & Geometry")}">
            <option value="graybox">${r("Clay Blockout (Neutral Massing)")}</option>
            <option value="textured">${r("Textured")}</option>
            <option value="wireframe">${r("Wireframe (Mesh Structure)")}</option>
            <option value="wireframe_texture">${r("Wireframe + Texture")}</option>
            <option value="grid">${r("Grid Only (Camera Motion)")}</option>
          </optgroup>
          <optgroup label="${r("Presentation")}">
            <option value="beauty">${r("Beauty (Studio Lit)")}</option>
          </optgroup>
        </select>
        <select class="vp-pill vp-pill-select" data-role="label-mode" title="${r("Viewport Labels")}">
          <option value="off">${r("Labels: Off")}</option>
          <option value="selected">${r("Labels: Selected")}</option>
          <option value="all">${r("Labels: All")}</option>
        </select>
        <select class="vp-pill vp-pill-select" data-role="label-content" title="${r("Label content")}">
          <option value="annotation">${r("Annotation")}</option>
          <option value="name">${r("Object Name")}</option>
          <option value="tag">${r("Primary Tag")}</option>
        </select>
        <span class="vp-zoom" data-role="viewport-zoom" title="${r("Viewport zoom")}">1.00x</span>
        <button class="vp-tool" data-act="toggle-fullscreen" title="${r("Toggle Fullscreen Viewport")}"><i class="pi pi-window-maximize"></i></button>
      </div>

      ${Ed()}

      <svg class="vp-axis" data-role="viewport-axis" viewBox="0 0 52 52" width="52" height="52"
           aria-label="${r("World axis navigation")}" role="group">
        <circle data-axis-center cx="26" cy="26" r="4" tabindex="0" role="button" aria-label="${r("Frame selection")}"></circle>
      </svg>

      <span class="vp-state" data-role="viewport-state"></span>
      <div class="vp-floating-transport" data-role="floating-transport" hidden>
        <button type="button" class="ft-btn" data-act="ft-step-back" title="${r("Previous Keyframe")}"><i class="pi pi-step-backward"></i></button>
        <button type="button" class="ft-btn ft-play" data-act="ft-toggle-play" title="${r("Play / Pause (Space)")}"><i class="pi pi-play" data-role="ft-play-icon"></i></button>
        <button type="button" class="ft-btn" data-act="ft-step-forward" title="${r("Next Keyframe")}"><i class="pi pi-step-forward"></i></button>
        <span class="ft-time" data-role="ft-timecode">00:00:00:00</span>
        <span class="ft-frame" data-role="ft-frame">F0</span>
        <button type="button" class="ft-btn" data-act="ft-add-key" title="${r("Add Keyframe (I)")}"><i class="pi pi-key"></i></button>
      </div>
      <div class="vp-hint">${r("Orbit: MMB · Pan: Shift+MMB · Dolly: Scroll · Fly: WASD / QE")}</div>
    </div>`;
}
function En() {
  const e = document.createElement("div");
  e.className = "majoor-omnicam oc-director", e.innerHTML = `
    <style>${Xl}</style>
    ${Yl()}
    ${_d()}
    <div class="oc-body">
      ${cd()}
      <div class="oc-resize-h oc-left-resize" data-role="left-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${r("Drag to resize the scene panel — double-click to reset")}" aria-label="${r("Resize scene panel")}"></div>
      <div class="oc-stage">${Td()}</div>
      <div class="oc-resize-h oc-side-resize" data-role="side-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${r("Drag to resize the side panel — double-click to reset")}" aria-label="${r("Resize side panel")}"></div>
      ${hd()}
    </div>
    <div class="oc-dock">
      ${xd()}
    </div>
    ${Zl()}`;
  const t = document.createElement("div");
  return t.className = "context-menu", t.dataset.role = "context-menu", t.setAttribute("role", "menu"), t.hidden = !0, e.appendChild(t), e;
}
const _e = "/majoor/omnicam/library";
function Ad(e, t) {
  const a = typeof window < "u" && (window.app?.api || window.__omnicamApi) || null;
  if (!a?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return a.fetchApi(e, t);
}
async function Pd(e) {
  let t = null;
  try {
    t = await e.json();
  } catch {
    t = null;
  }
  if (e.ok === !1) {
    const a = t?.error?.code || `HTTP_${e.status || 0}`, o = t?.error?.message || e.statusText || a, n = new Error(o);
    throw n.code = a, n.status = e.status || 0, n;
  }
  return t ?? {};
}
function xr(e = {}) {
  const t = new URLSearchParams();
  for (const [o, n] of Object.entries(e))
    n == null || n === "" || t.set(o, String(n));
  const a = t.toString();
  return a ? `?${a}` : "";
}
function Xo({ fetchApi: e = Ad } = {}) {
  const t = (a, o) => Promise.resolve(e(a, o)).then(Pd);
  return {
    list(a = {}) {
      const { kind: o, tag: n, search: s, offset: i, limit: c } = a, l = { tag: n, search: s, offset: i, limit: c };
      return o && o !== "all" && (l.kind = o), t(`${_e}${xr(l)}`);
    },
    get(a) {
      return t(`${_e}/${encodeURIComponent(a)}`);
    },
    register(a) {
      return t(`${_e}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a)
      });
    },
    patch(a, o) {
      return t(`${_e}/${encodeURIComponent(a)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(o)
      });
    },
    remove(a) {
      return t(`${_e}/${encodeURIComponent(a)}`, { method: "DELETE" });
    },
    importModel(a, o = {}) {
      const n = new FormData();
      return n.append("file", a, o.filename || a.name || "model.glb"), t(`${_e}/import${xr(o)}`, { method: "POST", body: n });
    },
    uploadThumbnail(a, o, n = "thumb.webp") {
      const s = new FormData();
      return s.append("file", o, n), t(`${_e}/thumbnail/${encodeURIComponent(a)}`, {
        method: "POST",
        body: s
      });
    },
    listPoses() {
      return t(`${_e}/poses`);
    },
    savePose(a) {
      return t(`${_e}/poses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a)
      });
    },
    deletePose(a) {
      return t(`${_e}/poses/${encodeURIComponent(a)}`, { method: "DELETE" });
    }
  };
}
const $n = Object.freeze(["all", "character", "prop", "environment", "vehicle"]);
function kr(e = {}) {
  const t = String(e.kind || "all").toLowerCase();
  return {
    kind: $n.includes(t) ? t : "all",
    tag: String(e.tag || "").trim().toLowerCase(),
    search: String(e.search || "").trim().toLowerCase()
  };
}
const Id = 60;
function zd(e) {
  const t = /* @__PURE__ */ new Set(), a = {
    items: [],
    byId: /* @__PURE__ */ new Map(),
    kinds: {},
    total: 0,
    offset: 0,
    limit: Id,
    filter: kr({}),
    loading: !1,
    error: null,
    loaded: !1
  }, o = () => {
    for (const i of t) i(a);
  }, n = () => {
    a.byId = new Map(a.items.map((i) => [i.id, i]));
  };
  async function s(i) {
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
      return a.filter = kr({ ...a.filter, ...i }), a.offset = 0, this.refresh();
    },
    refresh() {
      return s(async () => {
        const i = await e.list({ ...a.filter, offset: 0, limit: a.limit });
        a.items = Array.isArray(i.items) ? i.items : [], a.total = Number(i.total) || a.items.length, a.kinds = i.kinds || {}, a.offset = a.items.length, a.loaded = !0, n();
      });
    },
    loadMore() {
      return a.loading || a.items.length >= a.total ? Promise.resolve() : s(async () => {
        const i = await e.list({ ...a.filter, offset: a.offset, limit: a.limit }), c = Array.isArray(i.items) ? i.items : [];
        a.items = [...a.items, ...c], a.total = Number(i.total) || a.items.length, a.offset = a.items.length, n();
      });
    },
    /** Reflect a register/patch result locally without a full refetch. */
    upsert(i) {
      if (!i || !i.id) return;
      const c = a.items.findIndex((l) => l.id === i.id);
      c >= 0 ? a.items[c] = i : a.items = [i, ...a.items], a.total = Math.max(a.total, a.items.length), n(), o();
    },
    removeLocal(i) {
      const c = a.items.length;
      a.items = a.items.filter((l) => l.id !== i), a.items.length !== c && (a.total = Math.max(0, a.total - 1), a.offset = Math.max(0, a.offset - 1), n(), o());
    }
  };
}
function Fd({ max: e = 96 } = {}) {
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
          const n = t.keys().next().value;
          t.delete(n);
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
function Ld() {
  const e = /* @__PURE__ */ new Map();
  let t = Promise.resolve(), a = 0;
  return {
    get pendingCount() {
      return e.size;
    },
    get active() {
      return a;
    },
    enqueue(o, n) {
      if (e.has(o)) return e.get(o);
      const s = t.then(async () => {
        a += 1;
        try {
          return await n();
        } finally {
          a -= 1, e.delete(o);
        }
      });
      return e.set(o, s), t = s.catch(() => {
      }), s;
    },
    clear() {
      e.clear();
    }
  };
}
const Od = 256;
function wr(e = {}) {
  const { THREE: t, GLTFLoader: a, FBXLoader: o, size: n = Od } = e;
  if (!t || !a)
    return { render: async () => null, dispose() {
    } };
  let s = null, i = null, c = null;
  const l = () => {
    if (s) return;
    s = new t.WebGLRenderer({ antialias: !0, alpha: !0, preserveDrawingBuffer: !0 }), s.setSize(n, n, !1), s.setClearColor(0, 0), i = new t.Scene();
    const f = new t.DirectionalLight(16777215, 2.4);
    f.position.set(3, 5, 4);
    const u = new t.HemisphereLight(14673919, 2106412, 1.1);
    i.add(f, u), c = new t.PerspectiveCamera(35, 1, 0.01, 500);
  }, d = (f) => {
    const u = new t.Box3().setFromObject(f);
    if (u.isEmpty()) return;
    const m = u.getCenter(new t.Vector3()), h = u.getSize(new t.Vector3()), b = Math.max(h.length() / 2, 1e-3) / Math.sin(c.fov * Math.PI / 360);
    c.position.set(m.x + b * 0.7, m.y + b * 0.55, m.z + b), c.near = b / 100, c.far = b * 10, c.updateProjectionMatrix(), c.lookAt(m);
  }, p = (f, u) => new Promise((m, h) => {
    const y = u === "fbx" && o ? o : a;
    new y().load(
      f,
      (b) => m(b.scene || b),
      void 0,
      (b) => h(b)
    );
  });
  return {
    async render(f, u = "glb") {
      if (!f) return null;
      try {
        l();
        const m = await p(f, u);
        i.add(m), d(m), s.render(i, c);
        const h = s.domElement.toDataURL("image/webp", 0.82);
        return i.remove(m), m.traverse?.((y) => {
          y.geometry?.dispose?.();
          const b = y.material;
          Array.isArray(b) ? b.forEach((x) => x.dispose?.()) : b?.dispose?.();
        }), h;
      } catch {
        return null;
      }
    },
    dispose() {
      s?.dispose?.(), s = i = c = null;
    }
  };
}
async function Kd() {
  const [e, t, a] = await Promise.all([
    import("./chunk-D_M_mkHf.js").then((o) => o.T),
    import("./vendor-three-B8JDtKPi.js").then((o) => o.am),
    import("./vendor-three-B8JDtKPi.js").then((o) => o.an)
  ]);
  return { THREE: e, GLTFLoader: t.GLTFLoader, FBXLoader: a.FBXLoader };
}
function Dd(e) {
  const [t, a] = String(e).split(","), o = /:(.*?);/.exec(t)?.[1] || "image/webp", n = atob(a || ""), s = new Uint8Array(n.length);
  for (let i = 0; i < n.length; i += 1) s[i] = n.charCodeAt(i);
  return new Blob([s], { type: o });
}
const Rd = Object.freeze({
  character: "pi-user",
  prop: "pi-box",
  environment: "pi-building",
  vehicle: "pi-car",
  helper: "pi-compass"
}), Nd = {
  all: "All",
  character: "Characters",
  prop: "Props",
  environment: "Env",
  vehicle: "Vehicles"
};
function Je(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function qd(e, t = {}) {
  return $n.map((a) => {
    const o = r(Nd[a] || a), n = a === "all" ? "" : ` <span class="oc-asset-kind-n">${Number(t[a] || 0)}</span>`;
    return `<button type="button" class="oc-asset-kind${a === (e || "all") ? " active" : ""}" data-asset-kind="${a}">${Je(o)}${n}</button>`;
  }).join("");
}
function Bd(e, { selected: t = !1, thumbUrl: a = "" } = {}) {
  const o = Rd[e.kind] || "pi-box", n = e.kind === "character" && Yr(e.rig) === "rigged" ? `<span class="oc-asset-badge">${r("RIGGED")}</span>` : "", s = a ? `<img class="oc-asset-thumb" src="${Je(a)}" alt="" loading="lazy">` : `<span class="oc-asset-thumb oc-asset-thumb--glyph"><i class="pi ${o}"></i></span>`;
  return `<button type="button" class="oc-asset-card${t ? " selected" : ""}" data-asset-id="${Je(e.id)}" title="${Je(e.name)}">
    ${s}
    <span class="oc-asset-name">${Je(e.name)}</span>
    <span class="oc-asset-kind-tag">${Je((e.kind || "").toUpperCase())}</span>
    ${n}
  </button>`;
}
function Wd(e, { selectedId: t = "", thumbUrls: a = {} } = {}) {
  return !e || !e.length ? `<p class="oc-asset-empty">${r("No assets match this filter.")}</p>` : e.map((o) => Bd(o, {
    selected: o.id === t,
    thumbUrl: a[o.id] || ""
  })).join("");
}
function Sr(e) {
  if (!e || !e.closest) return null;
  const t = e.closest("[data-asset-kind]");
  if (t) return { action: "filter-kind", kind: t.dataset.assetKind };
  const a = e.closest("[data-asset-view]");
  if (a) return { action: "switch-view", view: a.dataset.assetView };
  const o = e.closest("[data-asset-act]");
  if (o) return { action: o.dataset.assetAct };
  const n = e.closest("[data-asset-id]");
  return n ? { action: "card", assetId: n.dataset.assetId } : null;
}
function Vd(e, t = {}) {
  const a = e.root, o = t.fetchApi || ((K, V) => (e.api || e.app?.api).fetchApi(K, V)), n = t.apiClient || Xo({ fetchApi: o }), s = t.store || zd(n), i = Fd(), c = t.previewQueue || Ld(), l = e.api || e.app?.api || null;
  let d = t.thumbnailRenderer || null, p = null;
  const f = /* @__PURE__ */ new Set();
  function u() {
    return d ? Promise.resolve(d) : (p || (p = Kd().then((K) => d = wr(K)).catch(() => d = wr({}))), p);
  }
  function m(K) {
    return sr(l, lc(K));
  }
  function h(K) {
    return K.thumbnail ? sr(l, `omnicam/library/${K.thumbnail} [input]`) : "";
  }
  function y() {
    for (const K of s.state.items) {
      if (K.kind === "helper" || !K.file || i.get(K.id) || K.thumbnail || f.has(K.id)) continue;
      const V = m(K);
      V && c.enqueue(K.id, async () => {
        const ce = await (await u()).render(V, K.format || "glb");
        if (!ce) {
          f.add(K.id);
          return;
        }
        if (i.set(K.id, ce), N(), !(K.source && K.source !== "user"))
          try {
            const me = await n.uploadThumbnail(K.id, Dd(ce));
            me?.asset && s.upsert(me.asset);
          } catch {
          }
      });
    }
  }
  const b = (K) => a.querySelector(`[data-role="${K}"]`), x = b("assets-panel"), g = b("asset-grid"), k = b("asset-kinds"), v = b("asset-search"), $ = b("asset-status"), _ = b("asset-import-file"), I = b("scene-tab"), M = b("assets-tab"), L = b("agent-tab"), O = a.querySelector('[data-asset-view="agent"]'), A = { assets: M, agent: L };
  let B = "", w = null, E = !0, z = !0, R = "scene", q = 0;
  function T(K, { sticky: V = !1 } = {}) {
    $ && (!V && q > Date.now() || ($.textContent = K || "", q = V ? Date.now() + 9e3 : 0));
  }
  function W(K) {
    if (B = K, !!g)
      for (const V of g.querySelectorAll(".oc-asset-card"))
        V.classList.toggle("selected", V.dataset.assetId === K);
  }
  let C = !1;
  function N() {
    if (k && (k.innerHTML = qd(s.state.filter.kind, s.state.kinds)), g) {
      const K = {};
      for (const V of s.state.items) {
        const ie = i.get(V.id) || h(V);
        ie && (K[V.id] = ie);
      }
      g.innerHTML = Wd(s.state.items, { selectedId: B, thumbUrls: K });
    }
    if (!C) {
      C = !0;
      try {
        y();
      } finally {
        C = !1;
      }
    }
    s.state.error ? T(s.state.error.message) : s.state.loading ? T(r("Loading assets...")) : T(r("{n} of {total} assets").replace("{n}", s.state.items.length).replace("{total}", s.state.total));
  }
  function H(K) {
    if (!K) return;
    const V = cc({
      groundHit: e.webgl?.orbitGroundHit?.(),
      orbitTarget: e.webgl?.getOrbitTarget?.() || e.camera?.target
    }), ie = e.directorApi?.execute({
      version: 1,
      id: `tx_instantiate_${Date.now().toString(36)}`,
      description: r("Add asset"),
      operations: [{ type: "asset.instantiate", asset: K, point: V }]
    });
    if (!ie?.ok) {
      e.setStatus?.(ie?.error?.message || r("Could not add the asset"));
      return;
    }
    const ce = ie.outcomes?.[0]?.objectId;
    ce && (e.selectedEntity = "object", e.selectedObjectId = ce, e.selectedObjectIds = /* @__PURE__ */ new Set([ce]), e.selectedKeyFrame = null), e.restoreAssets?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.render?.(), e.setStatus?.(r("{name} added").replace("{name}", K.name));
  }
  async function te(K) {
    if (K) {
      T(r("Importing {name}...").replace("{name}", K.name));
      try {
        const V = await n.importModel(K, { kind: "prop", name: K.name.replace(/\.[^.]+$/, "") });
        V.asset && s.upsert(V.asset), T(r("Imported {name}").replace("{name}", V.asset?.name || K.name));
      } catch (V) {
        T(V.message || r("Import failed"));
      }
    }
  }
  function oe(K) {
    K === "agent" && !$o() && (K = "scene"), R = K, I && (I.hidden = K !== "scene");
    for (const [V, ie] of Object.entries(A))
      ie && (ie.hidden = V !== K);
    for (const V of a.querySelectorAll("[data-asset-view]"))
      V.classList.toggle("active", V.dataset.assetView === K);
    K === "assets" && E && (E = !1, s.refresh()), K === "agent" && z && (z = !1, t.onAgentFirstOpen?.());
  }
  function J() {
    const K = $o();
    O && (O.hidden = !K), !K && R === "agent" && oe("scene");
  }
  function se(K) {
    const V = Sr(K.target);
    if (V) {
      if (V.action === "switch-view") return oe(V.view);
      if (V.action === "filter-kind") return void s.setFilter({ kind: V.kind });
      if (V.action === "asset-add")
        return H(s.get(B));
      if (V.action === "asset-import")
        return _?.click();
      V.action === "card" && W(V.assetId);
    }
  }
  function pe(K) {
    const V = Sr(K.target);
    V?.action === "card" && H(s.get(V.assetId));
  }
  function de() {
    clearTimeout(w), w = setTimeout(() => s.setFilter({ search: v.value }), 200);
  }
  function be(K) {
    const V = K.target.files?.[0];
    K.target.value = "", te(V);
  }
  const ge = s.subscribe(N);
  return x?.addEventListener("click", se), x?.addEventListener("dblclick", pe), a.querySelector('[data-role="left-tabs"]')?.addEventListener("click", se), v?.addEventListener("input", de), _?.addEventListener("change", be), N(), J(), {
    store: s,
    switchView: oe,
    syncAgentAvailability: J,
    refresh: () => s.refresh(),
    dispose() {
      ge(), clearTimeout(w), x?.removeEventListener("click", se), x?.removeEventListener("dblclick", pe), a.querySelector('[data-role="left-tabs"]')?.removeEventListener("click", se), v?.removeEventListener("input", de), _?.removeEventListener("change", be), c.clear(), d?.dispose?.(), i.clear();
    }
  };
}
function Hd(e, t = {}) {
  const a = t.container || e.root?.querySelector(".viewport-wrap") || e.root, o = document.createElement("div");
  o.className = "oc-label-layer", o.setAttribute("aria-hidden", "true"), a?.appendChild(o);
  const n = [];
  let s = Mo(e.state?.metadata?.viewport_labels);
  function i(p) {
    if (!n[p]) {
      const f = document.createElement("div");
      f.className = "oc-label", o.appendChild(f), n[p] = f;
    }
    return n[p];
  }
  function c() {
    return e.selectedObjectIds instanceof Set && e.selectedObjectIds.size ? e.selectedObjectIds : new Set([e.selectedObjectId].filter(Boolean));
  }
  function l() {
    const p = e.webgl?.projectWorldToScreen;
    if (s.mode === "off" || e.recording || e.capturingClean || !p) {
      o.hidden = !0;
      return;
    }
    o.hidden = !1;
    const u = e.webgl.canvas, m = u && (u.clientWidth || u.getBoundingClientRect?.().width) || 1, h = u && (u.clientHeight || u.getBoundingClientRect?.().height) || 1, y = c(), b = Number(e.frame) || 0, x = Array.isArray(e.state?.objects) ? e.state.objects : [];
    let g = 0;
    for (const k of x) {
      if (!Zr(k, { mode: s.mode, selectedIds: y })) continue;
      const v = Jr(k, s.content);
      if (!v) continue;
      const $ = Qr(x, k, b) || {
        position: k.position,
        size: k.size
      }, _ = e.webgl.projectWorldToScreen(
        en($, k.type, k.annotation?.anchor),
        m,
        h
      );
      if (!_ || _.behind) continue;
      const I = i(g);
      g += 1, I.hidden = !1, I.textContent = v, I.style.transform = `translate(-50%, -100%) translate(${Math.round(_.x)}px, ${Math.round(_.y)}px)`;
      const M = s.content === "annotation" ? k.annotation?.color : "";
      I.style.setProperty("--oc-label-accent", M || ""), I.classList.toggle("is-annotation", s.content === "annotation" && !!M);
    }
    for (let k = g; k < n.length; k += 1) n[k].hidden = !0;
  }
  function d(p) {
    s = Mo({ ...s, ...p }), e.state.metadata = { ...e.state.metadata || {}, viewport_labels: { ...s } }, e.serialize?.(), l();
  }
  return l(), {
    update: l,
    get settings() {
      return { ...s };
    },
    setMode(p) {
      d({ mode: p });
    },
    setContent(p) {
      d({ content: p });
    },
    dispose() {
      o.remove(), n.length = 0;
    }
  };
}
function Ud(e) {
  const t = (a) => e.webgl?.getModelBoneNames?.(a) || [];
  return {
    /** Bones + a best-effort auto-map + completeness for one object. */
    getRigInfo(a) {
      const o = e.state?.objects?.find((i) => i.id === a) || null, n = t(a), s = To(n);
      return {
        objectId: a,
        assetId: o?.asset_id || null,
        isCharacter: o?.asset_kind === "character",
        rigProfile: o?.character?.rig_profile || null,
        boneNames: n,
        autoMap: s,
        autoMapStatus: Yr({ bone_map: s })
      };
    },
    /** The source bone name a canonical joint maps to, per the supplied map. */
    resolveJoint(a, o, n) {
      const s = (n || {})[o];
      return s && t(a).includes(s) ? s : null;
    },
    /** World position of a canonical joint's bone, or null. */
    getJointWorldTransform(a, o, n) {
      const s = this.resolveJoint(a, o, n);
      return s && e.webgl?.resolveModelBone?.(a, s) || null;
    },
    /** Run the auto-mapper on whatever is loaded for this object now. */
    autoMap(a) {
      return To(t(a));
    },
    /** Preview a motion clip on the loaded model (viewport only -- the durable
     * state write goes through the Semantic API). */
    setMotion(a, o) {
      const n = tn(o);
      return n ? !!(e.webgl?.applyMotionClip?.(a, n) ?? !0) : !1;
    },
    /** Sample the live bone rotations at the current frame, mapped to canonical
     * joints -- the input to "Bake current frame to pose". */
    sampleCanonicalPose(a, o) {
      return e.webgl?.sampleCharacterBonePose?.(a, o) || {};
    }
  };
}
function jr(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function Gd(e, t) {
  const a = (o) => [`<option value="">${r("— unmapped —")}</option>`].concat(
    e.map(
      (n) => `<option value="${jr(n)}"${n === o ? " selected" : ""}>${jr(n)}</option>`
    )
  ).join("");
  return an.map((o) => {
    const n = t[o] || "", s = n && e.includes(n);
    return `<label class="oc-rig-row${s ? " ok" : ""}" data-joint="${o}">
      <span class="oc-rig-joint">${o}</span>
      <select data-rig-joint="${o}">${a(n)}</select>
      <span class="oc-rig-tick">${s ? "✓" : ""}</span>
    </label>`;
  }).join("");
}
function Xd(e, t = {}) {
  const a = e.root, o = t.apiClient || Xo({
    fetchApi: (x, g) => (e.api || e.app?.api).fetchApi(x, g)
  }), n = a.querySelector('[data-role="rig-mapper"]');
  if (!n) return { sync() {
  }, dispose() {
  } };
  const s = n.querySelector('[data-role="rig-mapper-grid"]'), i = n.querySelector('[data-role="rig-mapper-status"]');
  let c = null, l = {};
  const d = () => e.state?.objects?.find((x) => x.id === c) || null, p = () => e.webgl?.getModelBoneNames?.(c) || [];
  function f() {
    if (!i) return;
    const x = ir(l);
    ho(l) ? (i.textContent = r("Humanoid v1 ✓ — all 22 joints mapped"), i.dataset.state = "ok") : (i.textContent = r("Incomplete — {n} joint(s) unmapped").replace("{n}", x.length), i.dataset.state = "warn");
  }
  function u() {
    s && (s.innerHTML = Gd(p(), l)), f();
  }
  function m() {
    const x = e.selectedObject?.(), g = x?.asset_kind === "character";
    if (n.hidden = !g, !g) {
      c = null;
      return;
    }
    x.id !== c && (c = x.id, n.open = !0, l = {}, x.asset_id ? o.get(x.asset_id).then((k) => {
      c === x.id && (l = { ...k?.asset?.rig?.bone_map || {} }, u());
    }).catch(() => u()) : u());
  }
  function h(x) {
    const g = x.target.closest("[data-rig-joint]");
    if (!g) return;
    const k = g.dataset.rigJoint;
    g.value ? l[k] = g.value : delete l[k], u();
  }
  function y(x) {
    const g = x.target.closest("[data-rig-act]")?.dataset.rigAct;
    g === "auto" ? (l = To(p()), u()) : g === "validate" ? (u(), e.setStatus?.(ho(l) ? r("Rig is complete") : r("Rig still missing: {list}").replace("{list}", ir(l).join(", ")))) : g === "save" && b();
  }
  async function b() {
    const x = d();
    if (!x?.asset_id) {
      e.setStatus?.(r("Instantiate this asset from the Asset Browser before mapping its rig"));
      return;
    }
    try {
      const g = await o.patch(x.asset_id, {
        rig: { profile: cr, bone_map: l }
      });
      x.character = {
        ...x.character || {},
        rig_profile: ho(l) ? cr : null
      }, e.assetBrowser?.store?.upsert?.(g.asset), e.checkpoint?.("Save rig mapping"), e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.setStatus?.(r("Rig mapping saved"));
    } catch (g) {
      e.setStatus?.(g.message || r("Could not save the rig mapping"));
    }
  }
  return s?.addEventListener("change", h), n.addEventListener("click", y), m(), {
    sync: m,
    get boneMap() {
      return { ...l };
    },
    dispose() {
      s?.removeEventListener("change", h), n.removeEventListener("click", y);
    }
  };
}
function Yd(e, t = {}) {
  const a = t.container || e.root?.querySelector(".viewport-wrap") || e.root, o = document.createElement("div");
  o.className = "oc-rig-overlay", a?.appendChild(o);
  const n = /* @__PURE__ */ new Map();
  function s(c) {
    let l = n.get(c);
    return l || (l = document.createElement("button"), l.type = "button", l.className = "oc-rig-dot", l.dataset.joint = c, l.title = c, l.addEventListener("click", (d) => {
      d.stopPropagation(), t.onPick?.(c);
    }), o.appendChild(l), n.set(c, l)), l;
  }
  function i() {
    const c = t.isActive?.();
    if (!c || !e.webgl?.projectWorldToScreen) {
      o.hidden = !0;
      return;
    }
    o.hidden = !1;
    const { objectId: l, boneMap: d, selectedJoint: p } = c, f = e.characterRuntime, u = /* @__PURE__ */ new Set(), m = e.webgl.canvas, h = m && (m.clientWidth || m.getBoundingClientRect?.().width) || 1, y = m && (m.clientHeight || m.getBoundingClientRect?.().height) || 1;
    for (const b of an) {
      const x = d?.[b];
      if (!x) continue;
      const g = f?.getJointWorldTransform?.(l, b, d) || e.webgl.resolveModelBone?.(l, x);
      if (!g?.world) continue;
      const k = e.webgl.projectWorldToScreen(g.world, h, y);
      if (!k || k.behind) continue;
      const v = s(b);
      v.hidden = !1, v.classList.toggle("selected", b === p), v.style.transform = `translate(-50%, -50%) translate(${Math.round(k.x)}px, ${Math.round(k.y)}px)`, u.add(b);
    }
    for (const [b, x] of n) u.has(b) || (x.hidden = !0);
  }
  return i(), {
    update: i,
    dispose() {
      o.remove(), n.clear();
    }
  };
}
const Zd = /[^a-z0-9_-]+/g;
function Jd(e, t = {}) {
  const a = e.root, o = t.apiClient || Xo({
    fetchApi: (w, E) => (e.api || e.app?.api).fetchApi(w, E)
  }), n = a.querySelector('[data-role="pose-editor"]');
  if (!n) return { sync() {
  }, update() {
  }, dispose() {
  } };
  const s = n.querySelector('[data-role="pose-preset"]'), i = n.querySelector('[data-pose-act="edit"]'), c = n.querySelector('[data-role="pose-joint-row"]'), l = n.querySelector('[data-role="pose-joint-name"]'), d = ["x", "y", "z"].map((w) => n.querySelector(`[data-role="pose-rot-${w}"]`));
  let p = null, f = !1, u = /* @__PURE__ */ new Map();
  const m = () => e.state?.objects?.find((w) => w.id === p) || null, h = () => e.rigMapper?.boneMap && Object.keys(e.rigMapper.boneMap).length ? e.rigMapper.boneMap : null, y = () => e.subSelection?.type === "character_joint" && e.subSelection.objectId === p ? e.subSelection.jointId : null;
  function b(w) {
    const E = lr({ ...w, preset_id: w.id });
    return { id: w.id, name: w.name || w.id, root_offset: E.root_offset, joints: E.joints };
  }
  function x(w) {
    const E = u.get(w?.pose?.preset_id) || null;
    return gs({ preset: E, overrides: w?.pose }).joints;
  }
  function g() {
    const w = m();
    !w?.character || !h() || e.webgl?.applyCharacterPose?.(p, h(), f || w.character.pose?.joints ? x(w.character) : {});
  }
  function k() {
    const w = y(), E = f && !!w;
    if (c && (c.hidden = !E), !E) return;
    l && (l.textContent = w);
    const z = m(), R = x(z?.character)[w] || [0, 0, 0, 1], q = ys(R);
    d.forEach((T, W) => {
      T && document.activeElement !== T && (T.value = String(Math.round(q[W] * 100) / 100));
    });
  }
  function v() {
    const w = m(), E = !!w?.character?.motion;
    if (i && (i.classList.toggle("active", f), i.disabled = E, i.title = E ? r("Clear the motion clip to edit the pose") : r("Toggle FK pose editing")), s) {
      const z = [["neutral", r("Standing Neutral")]].concat([...u.values()].filter((q) => q.id !== "neutral").map((q) => [q.id, q.name || q.id])), R = z.map((q) => q.join(":")).join("|");
      s.dataset.sig !== R && (s.dataset.sig = R, s.replaceChildren(...z.map(([q, T]) => {
        const W = document.createElement("option");
        return W.value = q, W.textContent = T, W;
      }))), document.activeElement !== s && (s.value = w?.character?.pose?.preset_id || "neutral");
    }
    k(), g();
  }
  async function $() {
    try {
      const w = await o.listPoses();
      u = new Map((w.poses || []).filter((E) => E?.id).map((E) => [E.id, b(E)]));
    } catch {
      u = /* @__PURE__ */ new Map();
    }
    u.has("neutral") || u.set("neutral", b({ id: "neutral", name: "Standing Neutral" })), v();
  }
  function _() {
    const w = y();
    if (!w) return;
    const E = d.map((q) => Number(q?.value) || 0), z = bs(E), R = e.directorApi?.execute({
      version: 1,
      id: `tx_pose_${Date.now().toString(36)}`,
      description: "Pose joint",
      operations: [{ type: "character.set_joint_rotation", objectId: p, joint: w, rotation: z }]
    });
    R && !R.ok && e.setStatus?.(R.error?.message || r("Could not set the joint")), v();
  }
  function I() {
    const w = s?.value || "neutral", E = u.get(w) || lr({ preset_id: w });
    e.directorApi?.execute({
      version: 1,
      id: `tx_preset_${Date.now().toString(36)}`,
      description: "Pose preset",
      operations: [{ type: "character.set_pose", objectId: p, pose: { preset_id: w, root_offset: E.root_offset, joints: {} } }]
    }), v();
  }
  async function M() {
    const w = m();
    if (!w?.character) return;
    const E = (await jt(e, r("Save Pose"), r("Pose name"), ""))?.trim();
    if (!E || e.disposed) return;
    const z = E.toLowerCase().replace(Zd, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "pose";
    try {
      const R = await o.savePose({
        id: z,
        name: E,
        profile: "omnicam_humanoid_v1",
        root_offset: w.character.pose?.root_offset || [0, 0, 0],
        joints: x(w.character)
      });
      u.set(R.pose.id, b(R.pose)), e.setStatus?.(r("Pose saved: {name}").replace("{name}", E)), v();
    } catch (R) {
      e.setStatus?.(R.message || r("Could not save the pose"));
    }
  }
  function L() {
    const w = m();
    !w?.character || w.character.motion || (f = !f, !f && e.subSelection?.type === "character_joint" && (e.subSelection = null), v(), e.rigOverlay?.update?.());
  }
  function O(w) {
    f && (e.subSelection = { type: "character_joint", objectId: p, jointId: w }, v(), e.rigOverlay?.update?.());
  }
  const A = Yd(e, {
    onPick: O,
    isActive: () => f && p && h() ? { objectId: p, boneMap: h(), selectedJoint: y() } : null
  });
  e.rigOverlay = A;
  function B() {
    const w = e.selectedObject?.(), E = w?.asset_kind === "character";
    if (n.hidden = !E, !E) {
      f && (f = !1), p = null, A.update();
      return;
    }
    w.id !== p && (p = w.id, f = !1, e.subSelection?.type === "character_joint" && (e.subSelection = null), u.size || $()), v(), A.update();
  }
  s?.addEventListener("change", I), i?.addEventListener("click", L), n.querySelector('[data-pose-act="save"]')?.addEventListener("click", M);
  for (const w of d)
    w?.addEventListener("change", _), w?.addEventListener("input", _);
  return $(), {
    sync: B,
    update() {
      A.update(), g();
    },
    get editing() {
      return f;
    },
    dispose() {
      A.dispose(), s?.removeEventListener("change", I), i?.removeEventListener("click", L);
      for (const w of d)
        w?.removeEventListener("change", _), w?.removeEventListener("input", _);
    }
  };
}
function Cr(e, t) {
  const a = document.createElement("option");
  return a.value = e, a.textContent = t, a;
}
function yo(e, t) {
  e && document.activeElement !== e && (e.value = String(t));
}
function Qd(e) {
  const t = e.root?.querySelector('[data-role="motion-editor"]');
  if (!t) return { sync() {
  }, dispose() {
  } };
  const a = (x) => t.querySelector(`[data-role="${x}"]`), o = a("motion-clip"), n = a("motion-start"), s = a("motion-end"), i = a("motion-speed"), c = a("motion-loop"), l = t.querySelector('[data-motion-act="bake"]');
  let d = null;
  const p = () => e.state?.objects?.find((x) => x.id === d) || null, f = () => e.modelInfoById?.get(d)?.animationNames || [];
  function u() {
    const x = o?.value || "";
    return x ? tn({
      clip_id: x,
      start_frame: Number(n?.value) || 0,
      end_frame: Number(s?.value) || 0,
      speed: Number(i?.value) || 1,
      loop: c?.checked !== !1,
      offset_seconds: 0
    }) : null;
  }
  function m() {
    const x = u(), g = x ? { type: "character.set_motion", objectId: d, motion: x } : { type: "character.clear_motion", objectId: d }, k = e.directorApi?.execute({
      version: 1,
      id: `tx_motion_${Date.now().toString(36)}`,
      description: "Character motion",
      operations: [g]
    });
    k && !k.ok && e.setStatus?.(k.error?.message || r("Could not set the motion")), e.poseEditor?.sync?.(), h();
  }
  function h() {
    const x = p(), g = f(), k = x?.character?.motion || null;
    if (o) {
      const $ = g.join("|");
      o.dataset.sig !== $ && (o.dataset.sig = $, o.replaceChildren(
        Cr("", g.length ? r("No motion (static)") : r("No clips in this model")),
        ...g.map((_) => Cr(_, _))
      )), document.activeElement !== o && (o.value = k?.clip_id || ""), o.disabled = !g.length;
    }
    yo(n, k?.start_frame ?? 0), yo(s, k?.end_frame ?? 0), yo(i, k?.speed ?? 1), c && document.activeElement !== c && (c.checked = k ? k.loop !== !1 : !0);
    const v = !!k;
    for (const $ of [n, s, i, c]) $ && ($.disabled = !v);
    l && (l.disabled = !v);
  }
  function y() {
    const x = p(), g = e.rigMapper?.boneMap;
    if (!x?.character || !g || !Object.keys(g).length) {
      e.setStatus?.(r("Map the rig before baking a pose"));
      return;
    }
    const k = e.characterRuntime?.sampleCanonicalPose?.(d, g) || {};
    e.directorApi?.execute({
      version: 1,
      id: `tx_bake_${Date.now().toString(36)}`,
      description: "Bake frame to pose",
      operations: [
        { type: "character.clear_motion", objectId: d },
        {
          type: "character.set_pose",
          objectId: d,
          pose: { preset_id: "neutral", root_offset: x.character.pose?.root_offset || [0, 0, 0], joints: k }
        }
      ]
    }), e.setStatus?.(r("Baked current frame to pose")), h(), e.poseEditor?.sync?.();
  }
  function b() {
    const x = e.selectedObject?.(), g = x?.asset_kind === "character";
    if (t.hidden = !g, !g) {
      d = null;
      return;
    }
    d = x.id, h();
  }
  o?.addEventListener("change", m);
  for (const x of [n, s, i, c]) x?.addEventListener("change", m);
  return l?.addEventListener("click", y), {
    sync: b,
    dispose() {
      o?.removeEventListener("change", m);
      for (const x of [n, s, i, c]) x?.removeEventListener("change", m);
      l?.removeEventListener("click", y);
    }
  };
}
function Te(e, t) {
  return [...e.querySelectorAll(`[data-role="${t}"]`)];
}
function Mn(e) {
  return {
    status: e.querySelector('[data-role="status"]'),
    time: e.querySelector('[data-role="time"]'),
    frames: Te(e, "frame"),
    scrubs: Te(e, "scrub"),
    cameraFov: Te(e, "camera-fov"),
    cameraRoll: Te(e, "camera-roll"),
    cameraFocal: Te(e, "camera-focal"),
    viewportZoom: Te(e, "viewport-zoom"),
    cameraType: Te(e, "camera-type"),
    cameraNear: Te(e, "camera-near"),
    cameraFar: Te(e, "camera-far")
  };
}
const em = /* @__PURE__ */ new Set(["translate", "rotate", "scale"]), tm = /* @__PURE__ */ new Set(["world", "local"]), Ae = 180 / Math.PI;
function _r(e) {
  return [e.x, e.y, e.z];
}
function am(e) {
  return [e.x * Ae, e.y * Ae, e.z * Ae];
}
function om({
  THREE: e,
  camera: t,
  domElement: a,
  scene: o,
  onDragStart: n,
  onTransform: s,
  onDragEnd: i,
  onDraggingChanged: c,
  controlsFactory: l,
  anchorFactory: d
} = {}) {
  const p = d ? d() : new e.Object3D(), f = l ? l(t, a) : new tl(t, a);
  let u = null;
  o?.add && (u = typeof f.getHelper == "function" ? f.getHelper() : f, o.add(u), o.add(p));
  let m = null, h = null, y = !1, b = null, x = [0, 0, 0];
  function g() {
    return {
      position: _r(p.position),
      rotationDeg: am(p.rotation),
      scale: _r(p.scale)
    };
  }
  function k(C) {
    p.position.set(...C.position), p.rotation.set(
      C.rotationDeg[0] / Ae,
      C.rotationDeg[1] / Ae,
      C.rotationDeg[2] / Ae
    ), p.scale.set(...C.scale);
  }
  function v(C) {
    return ((C + 180) % 360 + 360) % 360 - 180;
  }
  function $(C) {
    if (!h) return { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] };
    const N = C.rotationDeg.map((H, te) => {
      const oe = b ? b[te] : h.rotationDeg[te];
      return x[te] += v(H - oe), x[te];
    });
    return b = C.rotationDeg, {
      position: C.position.map((H, te) => H - h.position[te]),
      rotationDeg: N,
      scaleFactors: C.scale.map((H, te) => h.scale[te] === 0 ? 1 : H / h.scale[te])
    };
  }
  function _() {
    h = g(), b = null, x = [0, 0, 0], n?.({ targetSpec: m });
  }
  function I() {
    if (!h) return;
    const C = g();
    s?.({
      targetSpec: m,
      position: C.position,
      rotationDeg: C.rotationDeg,
      scale: C.scale,
      delta: $(C)
    });
  }
  function M() {
    if (!h) return;
    const C = g();
    i?.({
      targetSpec: m,
      position: C.position,
      rotationDeg: C.rotationDeg,
      scale: C.scale,
      delta: $(C),
      cancelled: !1
    }), h = null;
  }
  function L(C) {
    y = !!C?.value, c?.(y);
  }
  f.addEventListener?.("mouseDown", _), f.addEventListener?.("objectChange", I), f.addEventListener?.("mouseUp", M), f.addEventListener?.("dragging-changed", L);
  function O(C) {
    m = C, p.position.set(...C.position || [0, 0, 0]);
    const N = C.rotation || [0, 0, 0];
    p.rotation.set(N[0] / Ae, N[1] / Ae, N[2] / Ae), p.scale.set(...C.scale || [1, 1, 1]), f.attach(p), f.visible = !0;
  }
  function A() {
    m = null, h = null, f.detach(), f.visible = !1;
  }
  function B(C) {
    "camera" in f && (f.camera = C);
  }
  function w(C) {
    if (!em.has(C)) throw new Error(`createTransformControlsAdapter: unknown mode "${C}"`);
    f.setMode ? f.setMode(C) : f.mode = C;
  }
  function E(C) {
    if (!tm.has(C)) throw new Error(`createTransformControlsAdapter: unknown space "${C}"`);
    f.space = C;
  }
  function z(C) {
    f.setTranslationSnap ? f.setTranslationSnap(C) : f.translationSnap = C;
  }
  function R(C) {
    f.setRotationSnap ? f.setRotationSnap(C) : f.rotationSnap = C;
  }
  function q(C) {
    f.setScaleSnap ? f.setScaleSnap(C) : f.scaleSnap = C;
  }
  function T() {
    if (!h) return;
    const C = h;
    h = null, b = null, x = [0, 0, 0], k(C), s?.({
      targetSpec: m,
      position: C.position,
      rotationDeg: C.rotationDeg,
      scale: C.scale,
      delta: { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] }
    }), i?.({
      targetSpec: m,
      position: C.position,
      rotationDeg: C.rotationDeg,
      scale: C.scale,
      delta: { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] },
      cancelled: !0
    }), f.pointerUp?.(null);
  }
  function W() {
    f.removeEventListener?.("mouseDown", _), f.removeEventListener?.("objectChange", I), f.removeEventListener?.("mouseUp", M), f.removeEventListener?.("dragging-changed", L), o?.remove && u && o.remove(u), o?.remove && o.remove(p), f.dispose?.(), m = null, h = null;
  }
  return {
    attach: O,
    detach: A,
    setCamera: B,
    setMode: w,
    setSpace: E,
    setTranslationSnap: z,
    setRotationSnap: R,
    setScaleSnap: q,
    cancelDrag: T,
    dispose: W,
    isDragging: () => y,
    // True whenever the pointer currently hovers (or is dragging) a visible
    // handle -- `controls.axis` is kept live by TransformControls' own
    // continuous pointermove hover listener, independent of whether a drag
    // has actually started. Callers use this to detect "the next pointerdown
    // belongs to this gizmo" before TransformControls' own listener runs.
    isHoveringHandle: () => !!f.axis
  };
}
const rm = /* @__PURE__ */ new Set([
  "object",
  "camera",
  "camera_target",
  "path_point",
  "path_group",
  "camera_path",
  "path_point_target"
]);
function nm(e, { controlsFactory: t, anchorFactory: a } = {}) {
  let o = null, n = null, s = !1, i = null, c = !1;
  function l(w) {
    if (!o) return;
    const E = w || e.state.spatial_snap_mode === "grid";
    o.setTranslationSnap(E ? Math.max(0.01, Number(e.state.spatial_grid_size) || 0.5) : null), o.setRotationSnap(E ? Math.PI / 12 : null), o.setScaleSnap(E ? 0.1 : null);
  }
  function d(w) {
    c = !!(w.ctrlKey || w.metaKey), o?.isDragging?.() && l(c);
  }
  function p() {
    s || typeof window > "u" || (s = !0, window.addEventListener("keydown", d, !0), window.addEventListener("keyup", d, !0));
  }
  function f() {
    s && (s = !1, window.removeEventListener("keydown", d, !0), window.removeEventListener("keyup", d, !0));
  }
  function u() {
    return o || (!e.webgl || !e.interactionElement ? null : (o = om({
      THREE: el,
      camera: e.webgl.activeCamera,
      domElement: e.interactionElement,
      scene: e.webgl.scene,
      controlsFactory: t,
      anchorFactory: a,
      onDragStart: m,
      onTransform: k,
      onDragEnd: I,
      onDraggingChanged: (w) => {
        e.transformControlsDragging = w;
      }
    }), p(), o));
  }
  function m({ targetSpec: w }) {
    if (w) {
      if (l(c), w.type === "object") {
        e.checkpoint("Transform object");
        const E = xs(e), z = (E.length ? E : [w.object]).map((q) => ({
          object: q,
          transform: ze(q)
        }));
        for (const q of z) e.beginObjectEdit(q.object);
        const R = z.reduce((q, T) => ve(q, T.transform.position), [0, 0, 0]).map((q) => q / z.length);
        n = { type: "object", group: z, pivot: R };
        return;
      }
      if (w.type === "camera") {
        e.checkpoint("Transform camera"), e.beginCameraEdit(), n = { type: "camera", position: [...e.camera.position], target: [...e.camera.target] };
        return;
      }
      if (w.type === "camera_target") {
        e.checkpoint("Move camera target"), e.beginCameraEdit();
        const E = e.activeCameraTrack?.(), z = !!E?.target_object_id;
        n = {
          type: "camera_target",
          tracking: z,
          base: z ? [...E.target_offset || [0, 0, 0]] : [...e.camera.target]
        };
        return;
      }
      if (w.type === "camera_path") {
        const E = w.track;
        if (!E || E.locked || !(E.keyframes?.length >= 1)) return;
        e.checkpoint("Transform camera path"), n = {
          type: "camera_path",
          trackId: E.id,
          origin: on(E.keyframes),
          baseKeys: E.keyframes.map((z) => ({ ...z, camera: le(z.camera) }))
        };
        return;
      }
      if (w.type === "path_point" || w.type === "path_group") {
        const E = w.track;
        if (!E || E.locked) return;
        const z = w.type === "path_point" ? [w.frame] : w.frames;
        e.checkpoint(w.type === "path_point" ? "Transform path point" : "Transform path selection"), n = {
          type: w.type,
          trackId: E.id,
          origin: w.position,
          selectedFrames: new Set(z),
          baseKeys: E.keyframes.map((R) => ({ ...R, camera: le(R.camera) })),
          lookAtActive: rn(E, e.state.objects)
        };
        return;
      }
      if (w.type === "path_point_target") {
        const E = w.track;
        if (!E || E.locked || w.readOnly) return;
        e.checkpoint("Move camera path target"), n = {
          type: "path_point_target",
          trackId: E.id,
          frame: w.frame,
          baseKeys: E.keyframes.map((z) => ({ ...z, camera: le(z.camera) }))
        };
      }
    }
  }
  function h(w) {
    const E = e.state.gizmo_mode;
    return E === "translate" ? { mode: E, delta: w.position } : E === "scale" ? { mode: E, origin: n.origin, factors: w.scaleFactors } : { mode: E, origin: n.origin, rotationDeg: w.rotationDeg };
  }
  function y(w) {
    w.id === e.state.active_camera_id && (e.state.keyframes = w.keyframes), e.camera = xe(w, e.frame, e.state.objects), w.camera = le(e.camera), e.refreshKeys();
  }
  function b(w) {
    const E = e.state.cameras.find((z) => z.id === n.trackId);
    E && (E.keyframes = nn(n.baseKeys, h(w)), y(E));
  }
  function x(w) {
    const E = e.state.cameras.find((R) => R.id === n.trackId);
    if (!E) return;
    const z = { ...h(w), lookAtActive: n.lookAtActive };
    E.keyframes = ws(n.baseKeys, n.selectedFrames, z), y(E);
  }
  function g(w) {
    const E = e.state.cameras.find((z) => z.id === n.trackId);
    E && (E.keyframes = Ss(n.baseKeys, [n.frame], { delta: w.position }), y(E));
  }
  function k({ delta: w }) {
    n && (n.type === "object" ? v(w) : n.type === "camera" ? $(w) : n.type === "camera_target" ? _(w) : n.type === "camera_path" ? b(w) : n.type === "path_point" || n.type === "path_group" ? x(w) : n.type === "path_point_target" && g(w), e.render());
  }
  function v(w) {
    const { group: E, pivot: z } = n, R = e.state.gizmo_mode;
    for (const q of E)
      if (R === "translate")
        q.object.position = ve(q.transform.position, w.position);
      else if (R === "rotate")
        q.object.position = ve(z, dr($e(q.transform.position, z), w.rotationDeg)), q.object.rotation = ve(q.transform.rotation, w.rotationDeg);
      else if (R === "scale") {
        const T = $e(q.transform.position, z);
        q.object.position = ve(z, T.map((W, C) => W * w.scaleFactors[C])), q.object.size = q.transform.size.map((W, C) => Math.max(0.01, W * w.scaleFactors[C]));
      }
    for (const q of E) e.commitObjectEdit(q.object);
  }
  function $(w) {
    if (e.state.gizmo_mode === "translate")
      e.camera.position = ve(n.position, w.position);
    else {
      const E = $e(n.target, n.position);
      e.camera.target = ve(n.position, dr(E, w.rotationDeg));
    }
    e.commitCameraEdit();
  }
  function _(w) {
    const E = ve(n.base, w.position);
    n.tracking ? ks(e, E) : e.camera.target = E, e.commitCameraEdit();
  }
  function I({ cancelled: w }) {
    if (!n) return;
    const E = n.type;
    w ? (e.undo(), (E === "camera" || E === "camera_target") && e.finishCameraEdit()) : E === "camera" || E === "camera_target" ? e.finishCameraEdit() : (e.editingKeyFrame = null, e.updateKeyVisualState?.(), e.drawCurveEditor?.()), n = null, e.refreshInspector(), e.render();
  }
  function M() {
    if (!e.webgl || !e.interactionElement) return;
    const w = e.recording ? null : vs(e), E = e.state.gizmo_mode || "translate", z = !!w && !w.readOnly && rm.has(w.type) && w.allowedModes.includes(E);
    if (i = z ? w.type : null, !z) {
      o?.detach();
      return;
    }
    u() && (o.isDragging() || (o.setCamera(e.webgl.activeCamera), o.setMode(E), o.setSpace(e.state.gizmo_space === "local" ? "local" : "world"), o.attach(w)));
  }
  function L() {
    return !!o?.isHoveringHandle?.();
  }
  function O() {
    o?.cancelDrag();
  }
  function A() {
    return i;
  }
  function B() {
    f(), o?.dispose(), o = null, n = null, i = null;
  }
  return { sync: M, isPointerOverHandle: L, cancelDrag: O, currentLiveType: A, dispose: B };
}
function sm(e, t) {
  e.checkpoint(`Apply preset: ${t}`);
  const a = e.activeCameraTrack(), o = ll(t, {
    duration_frames: e.state.duration_frames,
    target: e.camera.target || [0, 1.5, 0]
  });
  a.keyframes = o, a.id === e.state.active_camera_id && (e.state.keyframes = o), e.serialize(), e.refreshKeys(), e.setFrame(0, !0), e.render(), e.setStatus(`Preset applied: ${t}`);
}
function im(e, t) {
  e.checkpoint(`Apply camera shake: ${t}`);
  const a = e.activeCameraTrack();
  (!a.keyframes || a.keyframes.length === 0) && (a.keyframes = [
    { frame: 0, camera: le(e.camera), interpolation: "smooth" },
    { frame: e.state.duration_frames - 1, camera: le(e.camera), interpolation: "smooth" }
  ]);
  const o = e.resolveSelectedFrames ? e.resolveSelectedFrames() : [...e.selectedKeyFrames || []].sort((s, i) => s - i);
  let n;
  if (o.length >= 2) {
    const s = o[0], i = o.at(-1), c = (a.keyframes || []).filter((f) => f.frame < s), l = (a.keyframes || []).filter((f) => f.frame > i), d = (a.keyframes || []).filter((f) => f.frame >= s && f.frame <= i), p = ur({ keyframes: d, duration_frames: i + 1 }, { type: t, intensity: 1, duration_frames: i + 1 });
    n = [...c, ...p, ...l].sort((f, u) => f.frame - u.frame);
  } else
    n = ur(a, { type: t, intensity: 1, duration_frames: e.state.duration_frames });
  a.keyframes = n, a.id === e.state.active_camera_id && (e.state.keyframes = n), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(o.length >= 2 ? `Camera shake applied on selection: ${t}` : `Camera shake applied: ${t}`);
}
function cm(e, t) {
  const o = {
    clean_proxy: { render_mode: "omni_ref", playblast_grid: !0, burn_in: !1, speed_heatmap: !1, guides: !1, safe_areas: !1 },
    debug_motion: { render_mode: "wireframe", playblast_grid: !0, burn_in: !0, speed_heatmap: !0, guides: !0, safe_areas: !1 },
    cinematic_view: { render_mode: "graybox", playblast_grid: !1, burn_in: !1, speed_heatmap: !1, guides: !0, safe_areas: !0 }
  }[t];
  o && (e.checkpoint(`Apply proxy preset: ${t}`), Object.assign(e.state, o), e.state.proxy_preset = t, e.serialize(), e.render(), e.setStatus(`Proxy preset applied: ${t}`));
}
function lm(e, t) {
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
const dm = Object.freeze([
  "custom",
  "constant",
  "ease_in",
  "ease_out",
  "ease_in_out"
]);
function Tn(e) {
  return (e || []).map((t) => ({
    ...t,
    camera: t.camera ? {
      ...t.camera,
      position: [...t.camera.position || []],
      target: [...t.camera.target || []]
    } : t.camera,
    ...t.timing ? { timing: { ...t.timing } } : {},
    ...t.tangents ? { tangents: structuredClone(t.tangents) } : {},
    ...t.references ? { references: structuredClone(t.references) } : {}
  }));
}
function mm(e, t) {
  const a = e?.camera?.position || [0, 0, 0], o = t?.camera?.position || [0, 0, 0];
  return Math.hypot(
    Number(o[0] || 0) - Number(a[0] || 0),
    Number(o[1] || 0) - Number(a[1] || 0),
    Number(o[2] || 0) - Number(a[2] || 0)
  );
}
function pm(e) {
  const t = [...e || []].sort((n, s) => n.frame - s.frame);
  if (!t.length) return [];
  const a = [0];
  for (let n = 1; n < t.length; n += 1)
    a.push(a[n - 1] + mm(t[n - 1], t[n]));
  const o = a.at(-1) || 0;
  return o <= 1e-9 ? t.map((n, s) => t.length <= 1 ? 0 : s / (t.length - 1)) : a.map((n) => n / o);
}
function fm(e, t) {
  const a = Math.max(0, Math.min(1, Number(e) || 0));
  return t === "ease_in" ? 1.75 - 1.5 * a : t === "ease_out" ? 0.25 + 1.5 * a : t === "ease_in_out" ? 0.25 + 1.5 * Math.abs(2 * a - 1) : 1;
}
function hm(e, { preset: t = "constant", strength: a = 1 } = {}) {
  const o = Tn(e).sort((i, c) => i.frame - c.frame);
  if (t === "custom" || !dm.includes(t)) return o;
  const n = Math.max(0, Math.min(1, Number(a) || 0)), s = pm(o);
  return o.map((i, c) => {
    const l = Ke(i), d = fm(s[c], t), p = l + (d - l) * n;
    return Do(i, p);
  });
}
function um(e, {
  preset: t = "custom",
  strength: a = 1,
  startFrame: o = null,
  endFrame: n = null
} = {}) {
  const s = Tn(e).sort((f, u) => f.frame - u.frame);
  if (s.length < 2) return { ok: !1, reason: "not_enough_keys" };
  const i = Math.max(0, Math.min(1, Number(a) || 0));
  if (t !== "custom" && i <= 0) return { ok: !0, keys: s };
  if (!["custom", "constant"].includes(t) && s.length < 3)
    return { ok: !1, reason: "needs_timing_anchor" };
  const c = t === "custom" ? s : hm(s, { preset: t, strength: i }), l = o == null ? c[0].frame : Number(o), d = n == null ? c.at(-1).frame : Number(n), p = sn(c, { startFrame: l, endFrame: d });
  return p.ok ? { ok: !0, keys: p.keys } : p;
}
function io(e) {
  return {
    group: e.root.querySelector('[data-role="curve-group"]'),
    wrap: e.root.querySelector('[data-role="time-remap-controls"]'),
    preset: e.root.querySelector('[data-role="time-remap-preset"]'),
    strength: e.root.querySelector('[data-role="time-remap-strength"]'),
    strengthOut: e.root.querySelector('[data-role="time-remap-strength-out"]'),
    apply: e.root.querySelector('[data-act="time-remap-apply"]')
  };
}
function vt(e) {
  const t = io(e);
  if (!t.group || !t.wrap) return;
  t.group.value === "timing" && e.timelineObject?.() && (t.group.value = "position", e.setStatus?.(r("Timing remap is camera-only.")));
  const a = t.group.value === "timing" && !e.timelineObject?.();
  t.wrap.hidden = !a, t.wrap.style.display = a ? "inline-flex" : "none";
  for (const o of e.root.querySelectorAll(
    '[data-curve-mode],[data-tangent-mode],[data-act="curve-handles"]'
  ))
    o.disabled = a;
  t.strengthOut && t.strength && (t.strengthOut.textContent = `${t.strength.value}%`), t.strength && t.preset && (t.strength.disabled = t.preset.value === "custom");
}
function bm(e) {
  const t = io(e), a = e.activeCameraTrack?.();
  if (!a || a.locked)
    return e.setStatus?.(a?.locked ? r("Camera is locked") : r("No active camera")), !1;
  const o = a.keyframes || [], n = um(o, {
    preset: t.preset?.value || "custom",
    strength: (Number(t.strength?.value) || 0) / 100
  });
  if (!n.ok) {
    const s = n.reason === "needs_timing_anchor" ? r("Add an interior camera key for a speed ramp; a two-key move uses segment interpolation.") : n.reason === "insufficient_frame_slots" ? r("Not enough frame slots to redistribute these keys.") : r("Time remap could not be applied.");
    return e.setStatus?.(s), !1;
  }
  return e.checkpoint?.("Camera time remap"), a.keyframes = n.keys, e.state.keyframes = n.keys, e.smoothingBaseline = null, e.keySimplifyBaseline = null, e.syncActiveCameraTrack?.(), e.serialize?.(), e.refreshKeys?.(), e.refreshKeyEditor?.(), e.drawCurveEditor?.(), e.setFrame?.(e.frame, !1, !1), e.setStatus?.(r("Camera time remap applied.")), !0;
}
function gm(e, t) {
  const a = io(e);
  a.wrap && (a.preset?.addEventListener("change", () => vt(e), { signal: t }), a.strength?.addEventListener("input", () => vt(e), { signal: t }), a.apply?.addEventListener("click", () => bm(e), { signal: t }), vt(e));
}
function ym(e) {
  const t = io(e);
  return t.group ? e.timelineObject?.() ? (e.setStatus?.(r("Timing remap is camera-only.")), !1) : (Io(e, "curves"), t.group.value = "timing", t.group.dispatchEvent(new Event("change", { bubbles: !0 })), Uo(e), vt(e), e.drawCurveEditor?.(), e.setStatus?.(r("Inspecting camera timing.")), !0) : !1;
}
const Er = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"], De = [4, 8, 12, 20, 35, 60, 100];
function at(e) {
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
function vm(e) {
  return e <= -1 ? "#38bdf8" : e <= 0.2 ? "#2dd4bf" : e <= 2.2 ? "#4ade80" : e <= 5 ? "#facc15" : e <= 10 ? "#fb923c" : "#f43f5e";
}
function xm(e) {
  return `${e > 0 ? "+" : ""}${e.toFixed(1)}m`;
}
function co(e, t, a) {
  if (!t || !a || t < 80 || a < 80) return null;
  const o = at(e), n = o.expanded ? 220 : 138, s = Math.min(n, Math.max(80, Math.min(t, a) - 20)), i = 10, c = Math.max(0, t - s - i), l = Math.max(0, a - s - i), d = e.viewportCamera(), p = d?.position || [0, 1.5, 5], f = d?.target || [0, 0, 0], u = e.activeCameraTrack?.(), m = e.state.cameras?.length ? e.state.cameras : u ? [u] : [], h = m.flatMap(
    ($) => ($.keyframes || []).map((_) => _.camera?.position).filter(Boolean)
  );
  let y = 12;
  if (o.rangeIndex >= 0 && o.rangeIndex < De.length)
    y = De[o.rangeIndex];
  else {
    const $ = Math.max(
      Math.abs(p[0] || 0),
      Math.abs(p[2] || 0),
      Math.abs(f[0] || 0),
      Math.abs(f[2] || 0),
      ...h.flatMap((_) => [Math.abs(_[0] || 0), Math.abs(_[2] || 0)]),
      4
    );
    y = Math.max(6, Math.ceil(($ + 1.5) / 4) * 4);
  }
  const b = c + s / 2, x = l + s / 2, g = s / 2 - 12, k = g / y, v = o.centerMode === "camera" ? [p[0] || 0, p[2] || 0] : [0, 0];
  return {
    rx: c,
    ry: l,
    radarSize: s,
    margin: i,
    cx: b,
    cy: x,
    innerRadius: g,
    range: y,
    scale: k,
    worldCenterX: v[0],
    worldCenterZ: v[1],
    camPos: p,
    camTgt: f,
    cameras: m,
    activeTrack: u
  };
}
function An(e, t, a) {
  const o = t - e.worldCenterX, n = a - e.worldCenterZ;
  return [e.cx + o * e.scale, e.cy + n * e.scale];
}
function zo(e, t, a) {
  const o = (t - e.cx) / e.scale, n = (a - e.cy) / e.scale;
  return [e.worldCenterX + o, e.worldCenterZ + n];
}
function km(e, t, a, o) {
  const n = co(e, a, o);
  if (!n) return;
  const { rx: s, ry: i, radarSize: c, cx: l, cy: d, innerRadius: p, range: f, scale: u, camPos: m, camTgt: h, cameras: y, activeTrack: b } = n, x = at(e), g = e.state.active_camera_id || b?.id, k = (J, se) => An(n, J, se);
  t.save(), t.beginPath(), typeof t.roundRect == "function" ? t.roundRect(s, i, c, c, 10) : t.rect(s, i, c, c), t.clip(), t.fillStyle = "rgba(11, 15, 25, 0.90)", t.fillRect(s, i, c, c);
  const v = t.createRadialGradient(l, d, 2, l, d, p);
  v.addColorStop(0, "rgba(0, 210, 211, 0.06)"), v.addColorStop(1, "rgba(0, 0, 0, 0)"), t.fillStyle = v, t.fillRect(s, i, c, c), t.strokeStyle = "rgba(0, 210, 211, 0.38)", t.lineWidth = 1.2, t.strokeRect(s, i, c, c);
  const $ = [0.33, 0.66, 1];
  t.strokeStyle = "rgba(0, 210, 211, 0.12)", t.lineWidth = 1;
  for (const J of $) {
    const se = p * J;
    t.beginPath(), t.arc(l, d, se, 0, Math.PI * 2), t.stroke(), c >= 120 && (t.font = "8px monospace", t.fillStyle = "rgba(0, 210, 211, 0.35)", t.textAlign = "left", t.fillText(`${Math.round(f * J)}m`, l + se + 2, d - 2));
  }
  t.strokeStyle = "rgba(255, 255, 255, 0.10)", t.beginPath(), t.moveTo(s + 6, d), t.lineTo(s + c - 6, d), t.moveTo(l, i + 6), t.lineTo(l, i + c - 6), t.stroke(), t.font = "bold 9px sans-serif", t.textAlign = "center", t.textBaseline = "middle", t.fillStyle = "#f43f5e", t.fillText("N", l, i + 9), t.fillStyle = "rgba(255, 255, 255, 0.4)", t.fillText("S", l, i + c - 9), t.fillText("W", s + 9, d), t.fillText("E", s + c - 9, d);
  for (const J of e.state.objects || []) {
    if (J.enabled === !1) continue;
    const se = No(e.state.objects, J).position || [0, 0, 0], [pe, de] = k(se[0], se[2]);
    if (pe < s + 3 || pe > s + c - 3 || de < i + 3 || de > i + c - 3) continue;
    const be = e.selectedObjectId === J.id || e.selectedObjectIds?.has?.(J.id);
    if (t.save(), t.translate(pe, de), J.type === "card") {
      const ge = (J.rotation?.[1] || 0) * Math.PI / 180;
      t.rotate(-ge), t.fillStyle = be ? "#a855f7" : "#38bdf8", t.fillRect(-4, -1.2, 8, 2.4), t.strokeStyle = be ? "#ffffff" : "rgba(255,255,255,0.6)", t.lineWidth = 1, t.strokeRect(-4, -1.2, 8, 2.4);
    } else if (J.type === "light") {
      t.fillStyle = be ? "#a855f7" : "#fbbf24", t.beginPath(), t.arc(0, 0, 3, 0, Math.PI * 2), t.fill(), t.strokeStyle = "#fbbf24", t.lineWidth = 1;
      for (let ge = 0; ge < 4; ge++) {
        const K = ge * Math.PI / 2;
        t.beginPath(), t.moveTo(Math.cos(K) * 4, Math.sin(K) * 4), t.lineTo(Math.cos(K) * 6, Math.sin(K) * 6), t.stroke();
      }
    } else
      t.fillStyle = be ? "#a855f7" : J.type === "human" ? "#ec4899" : "#f59e0b", t.beginPath(), t.arc(0, 0, 2.8, 0, Math.PI * 2), t.fill();
    be && (t.strokeStyle = "#a855f7", t.lineWidth = 1.2, t.beginPath(), t.arc(0, 0, 6, 0, Math.PI * 2), t.stroke()), t.restore();
  }
  for (let J = 0; J < y.length; J++) {
    const se = y[J], pe = se.keyframes || [], de = se.id === g, be = se.color || Er[J % Er.length];
    t.save(), t.strokeStyle = be, t.globalAlpha = de ? 0.95 : 0.4, t.lineWidth = de ? 2 : 1, t.setLineDash(de ? [] : [2, 2]), t.beginPath();
    let ge = !1;
    const K = pe[0]?.frame, V = pe[pe.length - 1]?.frame;
    for (let ie = K; Number.isFinite(ie) && ie <= V; ie++) {
      const ce = xe(se, ie, e.state.objects)?.position;
      if (!Array.isArray(ce)) continue;
      const [me, re] = k(ce[0], ce[2]);
      ge ? t.lineTo(me, re) : (t.moveTo(me, re), ge = !0);
    }
    ge && t.stroke(), t.restore(), t.save();
    for (const ie of pe) {
      const ce = ie.camera?.position;
      if (!ce) continue;
      const [me, re] = k(ce[0], ce[2]);
      if (me < s + 4 || me > s + c - 4 || re < i + 4 || re > i + c - 4) continue;
      const ke = ie.frame === e.frame && de;
      t.fillStyle = ke ? "#ffffff" : be, t.globalAlpha = de ? 0.95 : 0.6, t.beginPath(), t.moveTo(me, re - 3), t.lineTo(me + 3, re), t.lineTo(me, re + 3), t.lineTo(me - 3, re), t.closePath(), t.fill(), ke && (t.strokeStyle = "#00d2d3", t.lineWidth = 1.2, t.stroke());
    }
    t.restore();
  }
  const [_, I] = k(m[0] || 0, m[2] || 0), [M, L] = k(h[0] || 0, h[2] || 0), O = 8, A = U(_, s + O, s + c - O), B = U(I, i + O, i + c - O), w = U(M, s + O, s + c - O), E = U(L, i + O, i + c - O), z = m[1] || 0, R = vm(z), q = xm(z);
  t.strokeStyle = "rgba(255, 255, 255, 0.40)", t.lineWidth = 1, t.setLineDash([3, 3]), t.beginPath(), t.moveTo(A, B), t.lineTo(w, E), t.stroke(), t.setLineDash([]), t.fillStyle = "#ffffff", t.beginPath(), t.arc(w, E, 2.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "rgba(255, 255, 255, 0.7)", t.lineWidth = 1, t.beginPath(), t.arc(w, E, 4.5, 0, Math.PI * 2), t.stroke();
  const T = h[0] - m[0], W = h[2] - m[2], C = Math.atan2(W, T), H = (e.viewportCamera().fov || 35) * Math.PI / 360, te = U(24 * (u / (p / 8)), 16, 38), oe = t.createRadialGradient(A, B, 2, A, B, te);
  oe.addColorStop(0, R + "55"), oe.addColorStop(1, R + "08"), t.fillStyle = oe, t.strokeStyle = R, t.lineWidth = 1.2, t.beginPath(), t.moveTo(A, B), t.lineTo(A + Math.cos(C - H) * te, B + Math.sin(C - H) * te), t.arc(A, B, te, C - H, C + H), t.closePath(), t.fill(), t.stroke(), t.fillStyle = R + "44", t.beginPath(), t.arc(A, B, 6.5, 0, Math.PI * 2), t.fill(), t.fillStyle = R, t.beginPath(), t.arc(A, B, 3.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "#ffffff", t.lineWidth = 1.5, t.beginPath(), t.moveTo(A, B), t.lineTo(A + Math.cos(C) * 7, B + Math.sin(C) * 7), t.stroke(), wm(e, t, n, R, q, C, Math.hypot(T, W)), x.hover && Sm(t, n, x.hover), t.restore();
}
function wm(e, t, a, o, n, s, i) {
  const { rx: c, ry: l, radarSize: d } = a, p = at(e);
  t.fillStyle = "rgba(15, 23, 42, 0.75)", t.fillRect(c, l, d, 18), t.strokeStyle = "rgba(0, 210, 211, 0.2)", t.lineWidth = 1, t.beginPath(), t.moveTo(c, l + 18), t.lineTo(c + d, l + 18), t.stroke(), t.font = "bold 9px sans-serif", t.fillStyle = "#00d2d3", t.textAlign = "left", t.textBaseline = "middle", t.fillText("RADAR", c + 6, l + 9);
  const f = l + 3, u = 12;
  Ha(t, c + 44, f, 12, u, "−", p.hover?.button === "zoom_out"), Ha(t, c + 58, f, 12, u, "+", p.hover?.button === "zoom_in");
  const m = p.centerMode === "camera" ? "CAM" : "CTR";
  Ha(t, c + 72, f, 22, u, m, p.hover?.button === "center");
  const h = p.expanded ? "⤡" : "⤢";
  Ha(t, c + 96, f, 14, u, h, p.hover?.button === "size"), t.font = "bold 8.5px monospace", t.fillStyle = o, t.textAlign = "right", t.fillText(`Y:${n}`, c + d - 5, l + 9), t.fillStyle = "rgba(15, 23, 42, 0.70)", t.fillRect(c, l + d - 15, d, 15), t.strokeStyle = "rgba(0, 210, 211, 0.15)", t.beginPath(), t.moveTo(c, l + d - 15), t.lineTo(c + d, l + d - 15), t.stroke();
  const y = Math.round((s * 180 / Math.PI + 360) % 360);
  t.font = "8px monospace", t.fillStyle = "rgba(255, 255, 255, 0.55)", t.textAlign = "left", t.fillText(`HDG:${y}°`, c + 5, l + d - 7), t.textAlign = "right", t.fillText(`DIST:${i.toFixed(1)}m`, c + d - 5, l + d - 7);
}
function Ha(e, t, a, o, n, s, i) {
  e.fillStyle = i ? "rgba(0, 210, 211, 0.35)" : "rgba(255, 255, 255, 0.10)", e.fillRect(t, a, o, n), e.strokeStyle = i ? "#00d2d3" : "rgba(255, 255, 255, 0.20)", e.lineWidth = 1, e.strokeRect(t, a, o, n), e.font = "bold 8px sans-serif", e.fillStyle = i ? "#ffffff" : "rgba(255, 255, 255, 0.75)", e.textAlign = "center", e.textBaseline = "middle", e.fillText(s, t + o / 2, a + n / 2);
}
function Sm(e, t, a) {
  if (!a || !a.text) return;
  const { rx: o, ry: n, radarSize: s } = t;
  e.font = "9px sans-serif";
  const i = e.measureText(a.text).width + 12, c = 16, l = U(a.px - i / 2, o + 4, o + s - i - 4), d = a.pz > t.cy ? a.pz - 22 : a.pz + 8;
  e.fillStyle = "rgba(15, 23, 42, 0.94)", e.fillRect(l, d, i, c), e.strokeStyle = "#00d2d3", e.lineWidth = 1, e.strokeRect(l, d, i, c), e.fillStyle = "#ffffff", e.textAlign = "center", e.textBaseline = "middle", e.fillText(a.text, l + i / 2, d + c / 2);
}
function Pn(e, t, a) {
  const { rx: o, ry: n } = e, s = n + 3;
  return a < s || a > s + 12 ? null : t >= o + 44 && t <= o + 56 ? "zoom_out" : t >= o + 58 && t <= o + 70 ? "zoom_in" : t >= o + 72 && t <= o + 94 ? "center" : t >= o + 96 && t <= o + 110 ? "size" : null;
}
function In(e, t, a, o) {
  const { camPos: n, camTgt: s, cameras: i, rx: c, ry: l, radarSize: d } = t, p = (b, x) => An(t, b, x), [f, u] = p(n[0] || 0, n[2] || 0);
  if (Math.hypot(a - f, o - u) <= 8)
    return { type: "camera", pos: n };
  const [m, h] = p(s[0] || 0, s[2] || 0);
  if (Math.hypot(a - m, o - h) <= 8)
    return { type: "target", pos: s };
  const y = e.activeCameraTrack?.();
  if (y)
    for (const b of y.keyframes || []) {
      const x = b.camera?.position;
      if (!x) continue;
      const [g, k] = p(x[0], x[2]);
      if (Math.hypot(a - g, o - k) <= 6)
        return { type: "keyframe", key: b, frame: b.frame };
    }
  for (const b of e.state.objects || []) {
    if (b.enabled === !1) continue;
    const x = No(e.state.objects, b).position || [0, 0, 0], [g, k] = p(x[0], x[2]);
    if (Math.hypot(a - g, o - k) <= 7)
      return { type: "object", object: b, id: b.id };
  }
  return null;
}
function jm(e, t, a, o) {
  if (!e.state.show_radar || t.button != null && t.button !== 0 || t.altKey || t.ctrlKey || t.metaKey || e.isNavigatingFly || e.cameraPathDraw) return !1;
  const n = co(e, e.canvas.width, e.canvas.height);
  if (!n) return !1;
  const { rx: s, ry: i, radarSize: c } = n;
  if (a < s || a > s + c || o < i || o > i + c)
    return !1;
  t.preventDefault?.(), t.stopPropagation?.();
  const l = at(e), d = Pn(n, a, o);
  if (d)
    return d === "zoom_in" ? (l.rangeIndex === -1 && (l.rangeIndex = De.findIndex((m) => m >= n.range), l.rangeIndex < 0 && (l.rangeIndex = De.length - 1)), l.rangeIndex = Math.max(0, (l.rangeIndex === -1 ? 2 : l.rangeIndex) - 1)) : d === "zoom_out" ? (l.rangeIndex === -1 && (l.rangeIndex = De.findIndex((m) => m >= n.range), l.rangeIndex < 0 && (l.rangeIndex = 0)), l.rangeIndex = Math.min(De.length - 1, l.rangeIndex + 1)) : d === "center" ? l.centerMode = l.centerMode === "camera" ? "origin" : "camera" : d === "size" && (l.expanded = !l.expanded), e.render?.(), !0;
  const p = In(e, n, a, o);
  if (p) {
    if (p.type === "camera")
      return e.checkpoint?.("Move camera via radar"), e.beginCameraEdit?.(), l.drag = { type: "camera", startWorld: [n.camPos[0], n.camPos[2]] }, !0;
    if (p.type === "target")
      return e.checkpoint?.("Move look-at target via radar"), e.beginCameraEdit?.(), l.drag = { type: "target", startWorld: [n.camTgt[0], n.camTgt[2]] }, !0;
    if (p.type === "keyframe")
      return e.seekFrame?.(p.frame), e.render?.(), !0;
    if (p.type === "object")
      return e.selectObject?.(p.id), e.render?.(), !0;
  }
  const [f, u] = zo(n, a, o);
  if (t.shiftKey) {
    e.checkpoint?.("Set target via radar"), e.beginCameraEdit?.();
    const m = e.viewportCamera();
    m.target = [f, m.target?.[1] || 0, u], e.commitCameraEdit?.();
  } else {
    e.checkpoint?.("Set camera via radar"), e.beginCameraEdit?.();
    const m = e.viewportCamera();
    m.position = [f, m.position?.[1] || 1.5, u], e.commitCameraEdit?.();
  }
  return e.setFrame?.(e.frame, !1, !1), e.render?.(), !0;
}
function Cm(e, t, a, o) {
  if (!e.state.show_radar || e.drag || e.boxSelection || e.gizmoDrag || e.keyDrag || e.cameraPathDraw || e.pathDrag || e.timelineDrag || e.curveDrag)
    return !1;
  const n = co(e, e.canvas.width, e.canvas.height);
  if (!n) return !1;
  const s = at(e), { rx: i, ry: c, radarSize: l } = n, d = a >= i && a <= i + l && o >= c && o <= c + l;
  if (s.drag) {
    const [y, b] = zo(n, a, o), x = e.viewportCamera();
    return s.drag.type === "camera" ? x.position = [y, x.position?.[1] || 1.5, b] : s.drag.type === "target" && (x.target = [y, x.target?.[1] || 0, b]), e.setFrame?.(e.frame, !1, !1), e.render?.(), !0;
  }
  if (!d)
    return s.hover && (s.hover = null, e.render?.()), !1;
  const p = Pn(n, a, o), f = In(e, n, a, o), [u, m] = zo(n, a, o);
  let h = `[${u.toFixed(1)}m, ${m.toFixed(1)}m]`;
  return p === "zoom_in" ? h = r("Zoom in (+)") : p === "zoom_out" ? h = r("Zoom out (−)") : p === "center" ? h = s.centerMode === "camera" ? r("Center: Cam") : r("Center: World") : p === "size" ? h = s.expanded ? r("Compact mode") : r("Expand radar") : f?.type === "camera" ? h = r("Camera (drag to move)") : f?.type === "target" ? h = r("Look-At Target (drag to move)") : f?.type === "keyframe" ? h = `${r("Keyframe")} F${f.frame}` : f?.type === "object" && (h = f.object.name || f.object.type || r("Object")), s.hover = {
    button: p,
    hit: f,
    px: a,
    pz: o,
    text: h
  }, e.interactionElement?.style && (e.interactionElement.style.cursor = p || f ? "pointer" : "crosshair"), e.render?.(), !0;
}
function vo(e, t) {
  const a = e._minimapState;
  return !a || !a.drag ? !1 : (e.commitCameraEdit?.(), a.drag = null, e.interactionElement?.style && (e.interactionElement.style.cursor = "default"), e.render?.(), !0);
}
function _m(e, t, a, o) {
  if (!e.state.show_radar) return !1;
  const n = co(e, e.canvas.width, e.canvas.height);
  if (!n) return !1;
  const { rx: s, ry: i, radarSize: c } = n;
  if (a < s || a > s + c || o < i || o > i + c)
    return !1;
  t.preventDefault?.(), t.stopPropagation?.();
  const l = at(e), d = Math.sign(t.deltaY || 0);
  return l.rangeIndex === -1 && (l.rangeIndex = De.findIndex((p) => p >= n.range), l.rangeIndex < 0 && (l.rangeIndex = 2)), d > 0 ? l.rangeIndex = Math.min(De.length - 1, l.rangeIndex + 1) : d < 0 && (l.rangeIndex = Math.max(0, l.rangeIndex - 1)), e.render?.(), !0;
}
function Em(e, t = {}) {
  if (!e) return () => {
  };
  const a = e.tagName === "INPUT" ? e : e.querySelector("input[type='number']");
  if (!a) return () => {
  };
  const o = t.step || parseFloat(a.step) || 0.1, n = t.shiftMultiplier ?? 0.1, s = t.ctrlMultiplier ?? 10;
  let i = !1, c = 0, l = 0, d = !1;
  const p = (m) => {
    m.button === 0 && (m.target === a && document.activeElement === a || (c = m.clientX, l = parseFloat(a.value) || 0, d = !1, window.addEventListener("mousemove", f), window.addEventListener("mouseup", u)));
  }, f = (m) => {
    const h = m.clientX - c;
    if (!d && Math.abs(h) < 3)
      return;
    d || (d = !0, i = !0, document.body.style.cursor = "ew-resize", a.blur()), m.preventDefault();
    let y = 1;
    m.shiftKey ? y = n : (m.ctrlKey || m.metaKey) && (y = s);
    const b = h * o * y;
    let x = l + b;
    const g = Math.max(1, (o * y).toString().split(".")[1]?.length || 1);
    x = parseFloat(x.toFixed(g));
    const k = parseFloat(a.min), v = parseFloat(a.max);
    isNaN(k) || (x = Math.max(k, x)), isNaN(v) || (x = Math.min(v, x)), parseFloat(a.value) !== x && (a.value = x, a.dispatchEvent(new Event("input", { bubbles: !0 })));
  }, u = () => {
    window.removeEventListener("mousemove", f), window.removeEventListener("mouseup", u), i && (i = !1, document.body.style.cursor = "", a.dispatchEvent(new Event("change", { bubbles: !0 })));
  };
  return e.addEventListener("mousedown", p), () => {
    e.removeEventListener("mousedown", p), window.removeEventListener("mousemove", f), window.removeEventListener("mouseup", u), i && (document.body.style.cursor = "");
  };
}
function $m(e) {
  if (!e) return [];
  const t = [], a = e.querySelectorAll(".oc-axis, .oc-scrub-field, .oc-field-row.is-scrub");
  for (const o of a)
    t.push(Em(o));
  return t;
}
function $r(e) {
  const t = e.querySelector(":scope > .menu-panel");
  if (!t) return;
  const a = e.getBoundingClientRect(), o = t.offsetWidth || 240;
  let s = t.classList.contains("right") ? a.right - o : a.left;
  s = Math.min(Math.max(s, 4), window.innerWidth - o - 4);
  const i = Math.min(a.bottom + 5, window.innerHeight - 4);
  Object.assign(t.style, { position: "fixed", top: `${i}px`, left: `${s}px`, right: "auto" });
}
function Mm(e) {
  const t = e.querySelector(":scope > .menu-panel");
  t && (t.style.position = "", t.style.top = "", t.style.left = "", t.style.right = "");
}
function Tm(e, t, a) {
  for (const m of ["object-x", "object-y", "object-z", "object-px", "object-py", "object-pz", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz", "object-intensity", "object-cone-angle", "object-penumbra", "object-cast-shadow"])
    for (const h of e.root.querySelectorAll(`[data-role="${m}"]`))
      h.addEventListener("input", () => e.updateSelectedObject(), { signal: a }), h.addEventListener("change", () => e.updateSelectedObject(), { signal: a });
  for (const m of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"])
    for (const h of e.root.querySelectorAll(`[data-role="${m}"]`))
      h.addEventListener("input", () => e.updateCameraFromHud(), { signal: a }), h.addEventListener("change", () => e.updateCameraFromHud(), { signal: a });
  for (const m of ["camera-rx", "camera-ry", "camera-rz"])
    for (const h of e.root.querySelectorAll(`[data-role="${m}"]`))
      h.addEventListener("input", () => e.updateCameraRotationFromHud(), { signal: a }), h.addEventListener("change", () => e.updateCameraRotationFromHud(), { signal: a });
  t('[data-role="animation-select"]')?.addEventListener("change", (m) => e.selectObjectAnimation(Number(m.target.value)), { signal: a }), t('[data-role="object-parent"]')?.addEventListener("change", (m) => e.setObjectParent(m.target.value || null), { signal: a });
  const o = () => {
    const m = e.selectedObject?.();
    if (!m || m.locked) return;
    e.checkpoint?.("Edit labels");
    const h = Cs(t('[data-role="object-tags"]')?.value || "");
    h.length ? m.tags = h : delete m.tags;
    const y = String(t('[data-role="object-annotation"]')?.value || "").trim(), b = y ? _s({
      text: y,
      color: t('[data-role="object-annotation-color"]')?.value,
      anchor: t('[data-role="object-annotation-anchor"]')?.value,
      visible: !0
    }) : null;
    b ? m.annotation = b : delete m.annotation, e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.labelOverlay?.update?.(), e.render?.();
  };
  for (const m of ["object-tags", "object-annotation", "object-annotation-color", "object-annotation-anchor"])
    t(`[data-role="${m}"]`)?.addEventListener("change", o, { signal: a });
  t('[data-role="duration-seconds"]')?.addEventListener("change", (m) => {
    e.durationWidget && Number(e.durationWidget.value) !== Number(m.target.value) && e.checkpoint("Change duration"), e.durationWidget && (e.durationWidget.value = Number(m.target.value)), e.durationManuallySet = !0, e.syncFromWidgets();
  }, { signal: a }), t('[data-role="timeline-fps"]')?.addEventListener("change", (m) => {
    e.fpsWidget && Number(e.fpsWidget.value) !== Number(m.target.value) && e.checkpoint("Change FPS"), e.fpsWidget && (e.fpsWidget.value = Number(m.target.value)), e.syncFromWidgets();
  }, { signal: a }), bl(e, a), Bl(e, a), gm(e, a), t('[data-role="curve-group"]')?.addEventListener("change", () => {
    e.setChannelFilter("all"), Uo(e), vt(e), e.drawCurveEditor();
  }, { signal: a }), t('[data-act="curve-handles"]')?.addEventListener("click", () => e.toggleCurveHandles(), { signal: a });
  for (const m of e.root.querySelectorAll("[data-curve-mode]"))
    m.addEventListener("click", () => e.setCurveInterpolation(m.dataset.curveMode), { signal: a });
  for (const m of e.root.querySelectorAll("[data-tangent-mode]"))
    m.addEventListener("click", () => e.setTangentMode(m.dataset.tangentMode), { signal: a });
  for (const m of e.root.querySelectorAll("[data-channel-filter]"))
    m.addEventListener("click", () => e.setChannelFilter(m.dataset.channelFilter), { signal: a });
  const n = t('[data-role="curve-canvas"]');
  n && (n.addEventListener("pointerdown", (m) => e.onCurvePointerDown(m), { signal: a }), n.addEventListener("pointermove", (m) => e.onCurvePointerMove(m), { signal: a }), n.addEventListener("pointerup", (m) => e.onCurvePointerUp(m), { signal: a }), n.addEventListener("pointercancel", (m) => e.onCurvePointerUp(m), { signal: a }), n.addEventListener("pointerleave", () => {
    e.curveHover = null, e.drawCurveEditor();
  }, { signal: a }), n.addEventListener("dblclick", (m) => e.onCurveDoubleClick?.(m), { signal: a }), n.addEventListener("wheel", (m) => Ml(e, m), { passive: !1, signal: a })), t('[data-act="curve-zoom-in"]')?.addEventListener("click", () => e.zoomCurve(1.25), { signal: a }), t('[data-act="curve-zoom-out"]')?.addEventListener("click", () => e.zoomCurve(0.8), { signal: a }), t('[data-act="curve-fit"]')?.addEventListener("click", () => e.resetCurveZoom(), { signal: a }), t('[data-role="key-frame"]')?.addEventListener("change", (m) => e.retimeSelectedKey(Number(m.target.value)), { signal: a });
  for (const m of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type", "key-timing-weight"])
    t(`[data-role="${m}"]`)?.addEventListener("change", () => e.updateSelectedKey(), { signal: a });
  t('[data-act="redistribute-key-timing"]')?.addEventListener("click", () => e.redistributeActiveCameraTiming(), { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="ui-density"]'))
    m.addEventListener("change", (h) => e.setDensity(h.target.value), { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="preview-layout"]'))
    m.addEventListener("change", (h) => {
      e.state.preview_layout = h.target.value, e.scheduleSerialize(), e.refreshCameraPreviews(), e.renderCameraView(), e.setStatus(`Preview layout: ${h.target.value}`);
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-act="aim-at-object"]'))
    m.addEventListener("click", () => {
      e.aimAtSelectedObject(), e.closeMenus();
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-act="bake-aim-keys"]'))
    m.addEventListener("click", () => {
      e.bakeAimConstraint({ perFrame: !1 }), e.closeMenus();
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-act="bake-aim-per-frame"]'))
    m.addEventListener("click", () => {
      e.bakeAimConstraint({ perFrame: !0 }), e.closeMenus();
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="camera-target-object"]'))
    m.addEventListener("change", (h) => {
      e.setCameraTrackingTarget(h.target.value);
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="camera-aim-bone"]'))
    m.addEventListener("change", (h) => {
      e.setAimBone(h.target.value);
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-act="focus-target"]'))
    m.addEventListener("click", () => {
      e.focusCameraTarget(), e.closeMenus();
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="gizmo-space"]'))
    m.addEventListener("change", (h) => {
      e.state.gizmo_space = h.target.value;
      for (const y of e.root.querySelectorAll('[data-role="gizmo-space"]')) y.value = h.target.value;
      e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="navigation-profile"]'))
    m.addEventListener("change", (h) => {
      e.state.navigation_profile = ["blender", "simple"].includes(h.target.value) ? h.target.value : "maya", e.scheduleSerialize(), e.setStatus(`Navigation: ${e.state.navigation_profile}`);
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="spatial-snap-mode"]'))
    m.addEventListener("change", (h) => {
      e.state.spatial_snap_mode = ["grid", "vertex"].includes(h.target.value) ? h.target.value : "none", e.scheduleSerialize(), e.setStatus(`Spatial Snap: ${e.state.spatial_snap_mode}`);
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="spatial-grid-size"]'))
    m.addEventListener("change", (h) => {
      e.state.spatial_grid_size = Math.max(0.01, Math.min(100, Number(h.target.value) || 0.5)), h.target.value = String(e.state.spatial_grid_size), e.scheduleSerialize();
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="view-mode"]'))
    m.addEventListener("change", (h) => e.setViewMode(h.target.value), { signal: a });
  const s = t('[data-role="label-mode"]'), i = t('[data-role="label-content"]');
  s && (s.value = e.labelOverlay?.settings?.mode || "selected", s.addEventListener("change", (m) => e.labelOverlay?.setMode(m.target.value), { signal: a })), i && (i.value = e.labelOverlay?.settings?.content || "annotation", i.addEventListener("change", (m) => e.labelOverlay?.setContent(m.target.value), { signal: a }));
  for (const m of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    m.addEventListener("click", () => e.toggleInspector(), { signal: a });
  for (const m of e.root.querySelectorAll('[data-act="clear-selection"]'))
    m.addEventListener("click", () => {
      e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
    }, { signal: a });
  for (const m of e.root.querySelectorAll('[data-role="timeline-summary"]'))
    m.addEventListener("click", () => {
      e.selectedEntity === "object" && (e.selectedEntity = "camera", e.selectedObjectId = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(r("Editing: {value1}", { value1: e.activeCameraTrack().name })));
    }, { signal: a });
  for (const m of e.root.querySelectorAll(".toolbar-menu"))
    m.addEventListener("toggle", () => {
      m.open ? (e.closeMenus(m), $r(m)) : Mm(m);
    }, { signal: a });
  document.addEventListener("scroll", () => {
    for (const m of e.root.querySelectorAll(".toolbar-menu[open]")) $r(m);
  }, { capture: !0, signal: a });
  const c = (m, h) => {
    const y = m instanceof HTMLElement ? m.closest(".scene-item") : null;
    if (!(!y || h.button === 2 || m.closest(".scene-action-btn")))
      if (y.dataset.objectId) {
        const b = e.state.objects.find((g) => g.id === y.dataset.objectId);
        if (!b) return;
        if (e.finishCameraEdit(), e.selectedObjectIds ||= /* @__PURE__ */ new Set(), h.ctrlKey || h.metaKey)
          e.selectedObjectIds.has(b.id) ? e.selectedObjectIds.delete(b.id) : e.selectedObjectIds.add(b.id), e.outlinerAnchorId = b.id;
        else if (h.shiftKey && e.outlinerAnchorId && e.state.objects.some((g) => g.id === e.outlinerAnchorId)) {
          const g = e.state.objects.map(($) => $.id), k = g.indexOf(e.outlinerAnchorId), v = g.indexOf(b.id);
          e.selectedObjectIds = new Set(g.slice(Math.min(k, v), Math.max(k, v) + 1));
        } else
          e.selectedObjectIds = /* @__PURE__ */ new Set([b.id]), e.outlinerAnchorId = b.id;
        e.selectedObjectId = e.selectedObjectIds.has(b.id) ? b.id : [...e.selectedObjectIds].at(-1) || null, e.selectedEntity = e.selectedObjectIds.size ? "object" : "camera", e.selectedKeyFrame = e.selectedObjectId ? b.keyframes?.find((g) => g.frame === e.frame)?.frame ?? null : null, e.editingKeyFrame = null;
        for (const g of e.root.querySelectorAll(".scene-item")) {
          const k = !!(g.dataset.objectId && e.selectedObjectIds.has(g.dataset.objectId)), v = !!(g.dataset.objectId && g.dataset.objectId === e.selectedObjectId);
          g.classList.toggle("selected", k), g.classList.toggle("primary", v), g.setAttribute("aria-selected", String(k));
        }
        const x = e.root.querySelector('[data-role="outliner-batch-bar"]');
        if (x) {
          const g = e.selectedObjectIds?.size || 0;
          x.hidden = g < 2;
          const k = x.querySelector('[data-role="batch-count"]');
          k && (k.textContent = `${g} ${r("selected")}`);
        }
        e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(r("Selected: {value1}", { value1: b.name || b.type }));
      } else y.dataset.cameraId && e.activateCamera(y.dataset.cameraId);
  };
  e.root.addEventListener("pointerdown", (m) => {
    c(m.composedPath?.()[0] || m.target, m);
  }, { capture: !0, signal: a }), e.root.addEventListener("pointerdown", (m) => {
    const h = m.composedPath?.()[0] || m.target;
    h instanceof HTMLElement && h.closest(".context-menu, [data-role='context-menu']") || (m.stopPropagation(), h instanceof HTMLElement && !h.closest(".toolbar-menu") && e.closeMenus(), h instanceof HTMLElement && !h.closest(".key,.key-editor,canvas") && e.exitKeyEdit(!0), (!(h instanceof HTMLElement) || !h.closest("input,select,textarea,button,[contenteditable=true]")) && e.root.focus({ preventScroll: !0 }));
  }, { signal: a }), document.addEventListener("pointerdown", (m) => {
    const h = m.composedPath?.()[0] || m.target;
    h instanceof HTMLElement && h.closest(".context-menu, [data-role='context-menu']") || (!(h instanceof Node) || !e.root.contains(h)) && (e.closeMenus(), e.exitKeyEdit(!0));
  }, { capture: !0, signal: a }), e.root.addEventListener("mousedown", (m) => m.stopPropagation(), { signal: a }), e.root.addEventListener("contextmenu", (m) => e.onContextMenu(m), { signal: a }), e.interactionElement?.addEventListener("pointerdown", (m) => {
    const h = e.interactionElement.getBoundingClientRect(), y = (m.clientX - h.left) * e.canvas.width / Math.max(1, h.width), b = (m.clientY - h.top) * e.canvas.height / Math.max(1, h.height);
    jm(e, m, y, b) || e.onPointerDown(m);
  }, { signal: a }), e.interactionElement?.addEventListener("pointermove", (m) => {
    const h = e.interactionElement.getBoundingClientRect(), y = (m.clientX - h.left) * e.canvas.width / Math.max(1, h.width), b = (m.clientY - h.top) * e.canvas.height / Math.max(1, h.height);
    Cm(e, m, y, b) || e.onPointerMove(m);
  }, { signal: a }), e.interactionElement?.addEventListener("pointerup", (m) => {
    vo(e) || e.onPointerUp(m);
  }, { signal: a }), e.interactionElement?.addEventListener("pointercancel", (m) => {
    vo(e), e.onPointerUp(m);
  }, { signal: a }), e.interactionElement?.addEventListener("lostpointercapture", (m) => {
    vo(e), e.onPointerUp(m);
  }, { signal: a }), e.interactionElement?.addEventListener("dblclick", (m) => {
    e.insertPathKeyAtCursor?.(m) || e.setTargetAtCursor(m);
  }, { signal: a }), e.interactionElement?.addEventListener("wheel", (m) => {
    const h = e.interactionElement.getBoundingClientRect(), y = (m.clientX - h.left) * e.canvas.width / Math.max(1, h.width), b = (m.clientY - h.top) * e.canvas.height / Math.max(1, h.height);
    _m(e, m, y, b) || e.onWheel(m);
  }, { passive: !1, signal: a }), e.root.addEventListener("wheel", Zc(e.root), { signal: a }), window.addEventListener("pointermove", (m) => {
    e.keyDrag && e.onPointerMove(m);
  }, { capture: !0, signal: a }), window.addEventListener("pointerup", (m) => {
    e.keyDrag && e.onPointerUp(m);
  }, { capture: !0, signal: a }), window.addEventListener("pointercancel", (m) => {
    e.keyDrag && e.onPointerUp(m);
  }, { capture: !0, signal: a });
  const l = t('[data-role="dope-tracks"]');
  l && (l.addEventListener("pointerdown", (m) => e.onTimelinePointerDown(m), { signal: a }), l.addEventListener("pointermove", (m) => e.onTimelinePointerMove(m), { signal: a }), l.addEventListener("pointerup", (m) => e.onTimelinePointerUp(m), { signal: a }), l.addEventListener("pointercancel", (m) => e.onTimelinePointerUp(m), { signal: a }), l.addEventListener("wheel", (m) => Gr(e, m), { passive: !1, signal: a }));
  const d = (m) => {
    const h = Es(m.composedPath?.()[0] || m.target);
    h && (e.lastKeyZone = h);
  };
  e.root.addEventListener("focusin", d, { signal: a }), e.root.addEventListener("pointerdown", d, { capture: !0, signal: a }), e.root.addEventListener("focusout", (m) => {
    e.modalTransform && !e.root.contains(m.relatedTarget) && (js(e), e.render());
  }, { signal: a });
  const p = new ResizeObserver(() => {
    e.scheduleResizeAndRender();
  }), f = e.root.querySelector(".viewport-wrap");
  f && p.observe(f), e.resizeObserver = p;
  const u = $m(e.root);
  a && a.addEventListener("abort", () => {
    for (const m of u) m();
  }), e.updateEditState();
}
const Am = "🔘", Mr = [
  { id: "nav", label: () => r("Navigation & Controls"), icon: "pi-compass" },
  { id: "view", label: () => r("Display & Viewport"), icon: "pi-eye" },
  { id: "time", label: () => r("Timeline & Keys"), icon: "pi-clock" },
  { id: "defaults", label: () => r("Defaults & Pipeline"), icon: "pi-sliders-h" }
];
function Pm(e, t) {
  qo.find((o) => o.id === e)?.onChange?.(t);
}
function Im(e) {
  const t = yi(e.id, e.defaultValue), a = `pref_${e.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
  if (e.type === "boolean")
    return `
      <div class="oc-pref-row toggle-row" title="${e.tooltip || ""}">
        <label for="${a}" class="oc-pref-label">${r(e.name)}</label>
        <input type="checkbox" id="${a}" data-setting-id="${e.id}" ${t ? "checked" : ""}>
      </div>`;
  if (e.type === "combo") {
    const o = (e.options || []).map((n) => {
      const s = typeof n == "object" ? n.value : n, i = typeof n == "object" ? n.text : n, c = String(t) === String(s) ? "selected" : "";
      return `<option value="${s}" ${c}>${r(i)}</option>`;
    }).join("");
    return `
      <div class="oc-pref-row" title="${e.tooltip || ""}">
        <label for="${a}" class="oc-pref-label">${r(e.name)}</label>
        <select id="${a}" data-setting-id="${e.id}">${o}</select>
      </div>`;
  }
  if (e.type === "slider") {
    const o = e.attrs?.min ?? 0, n = e.attrs?.max ?? 100, s = e.attrs?.step ?? 1;
    return `
      <div class="oc-pref-row slider-row" title="${e.tooltip || ""}">
        <label for="${a}" class="oc-pref-label">${r(e.name)}</label>
        <div class="oc-pref-slider-group">
          <input type="range" id="${a}" data-setting-id="${e.id}" min="${o}" max="${n}" step="${s}" value="${t}">
          <span class="oc-pref-val" data-val-for="${e.id}">${t}</span>
        </div>
      </div>`;
  }
  if (e.type === "color") {
    const o = String(t || "121212").startsWith("#") ? String(t) : `#${t}`;
    return `
      <div class="oc-pref-row" title="${e.tooltip || ""}">
        <label for="${a}" class="oc-pref-label">${r(e.name)}</label>
        <input type="color" id="${a}" data-setting-id="${e.id}" value="${o}">
      </div>`;
  }
  return "";
}
function zm(e) {
  const t = new Map(qo.map((o) => [o.id, o]));
  return ({
    nav: [
      li,
      di,
      mi,
      pi,
      fi,
      hi,
      ui,
      bi,
      gi
    ],
    view: [
      Us,
      Gs,
      Xs,
      Ys,
      Zs,
      Js,
      Qs,
      ei,
      ti,
      ai,
      oi,
      ri,
      ni,
      si,
      ii,
      ci
    ],
    time: [
      Rs,
      Ns,
      qs,
      Bs,
      Ws,
      Vs,
      Hs
    ],
    defaults: [
      Ts,
      As,
      Ps,
      Is,
      zs,
      Fs,
      Ls,
      Os,
      Ks,
      Ds
    ]
  }[e] || []).map((o) => t.get(o)).filter(Boolean);
}
function Fm() {
  return `<span class="oc-pref-emoji" aria-hidden="true">${Am}</span> ${r("OmniCam Preferences")}`;
}
function Lm(e) {
  const t = e.root.querySelector(".oc-modal-backdrop");
  if (t) {
    t.querySelector(".oc-pref-dialog")?.focus();
    return;
  }
  const a = document.createElement("div");
  a.className = "oc-modal-backdrop", a.setAttribute("role", "dialog"), a.setAttribute("aria-modal", "true"), a.setAttribute("aria-label", r("OmniCam Preferences")), a.innerHTML = `
    <div class="oc-modal-dialog oc-pref-dialog" tabindex="-1">
      <div class="oc-pref-header">
        <div class="oc-pref-title">${Fm()}</div>
        <button type="button" class="icon-button oc-pref-close" title="${r("Close")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="oc-pref-tabs">
        ${Mr.map((n, s) => `
          <button type="button" class="oc-pref-tab ${s === 0 ? "active" : ""}" data-tab="${n.id}">
            <i class="pi ${n.icon}"></i> <span>${n.label()}</span>
          </button>
        `).join("")}
      </div>
      <div class="oc-pref-content">
        ${Mr.map((n, s) => `
          <div class="oc-pref-pane ${s === 0 ? "active" : ""}" data-pane="${n.id}">
            ${zm(n.id).map(Im).join("")}
          </div>
        `).join("")}
      </div>
      <div class="oc-pref-footer">
        <button type="button" class="secondary" data-pref-act="reset-defaults">
          <i class="pi pi-undo"></i> ${r("Reset to Defaults")}
        </button>
        <span class="oc-pref-spacer"></span>
        <button type="button" class="primary" data-pref-act="close-dialog">${r("Done")}</button>
      </div>
    </div>
  `;
  const o = () => {
    a.remove(), e.root.focus?.();
  };
  a.addEventListener("click", (n) => {
    (n.target === a || n.target.closest(".oc-pref-close, [data-pref-act='close-dialog']")) && o();
  }), a.addEventListener("keydown", (n) => {
    n.key === "Escape" && (n.stopPropagation(), o());
  }), a.querySelectorAll(".oc-pref-tab").forEach((n) => {
    n.addEventListener("click", () => {
      const s = n.dataset.tab;
      a.querySelectorAll(".oc-pref-tab").forEach((i) => i.classList.toggle("active", i === n)), a.querySelectorAll(".oc-pref-pane").forEach((i) => i.classList.toggle("active", i.dataset.pane === s));
    });
  }), a.addEventListener("input", (n) => {
    const s = n.target, i = s.dataset.settingId;
    if (!i) return;
    let c;
    if (s.type === "checkbox")
      c = s.checked;
    else if (s.type === "range" || s.type === "number") {
      c = Number(s.value);
      const l = a.querySelector(`[data-val-for="${i}"]`);
      l && (l.textContent = String(c));
    } else
      c = s.value;
    $s(i, c), Pm(i, c);
  }), a.querySelector('[data-pref-act="reset-defaults"]')?.addEventListener("click", () => {
    Ms();
    for (const n of qo) {
      const s = a.querySelector(`[data-setting-id="${n.id}"]`);
      if (!s) continue;
      const i = n.defaultValue;
      if (s.type === "checkbox")
        s.checked = !!i;
      else {
        s.value = String(i);
        const c = a.querySelector(`[data-val-for="${n.id}"]`);
        c && (c.textContent = String(i));
      }
    }
    e.setStatus?.(r("Preferences reset to defaults"));
  }), e.root.appendChild(a), a.querySelector(".oc-modal-dialog")?.focus();
}
function Om(e, t, a) {
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
    o.addEventListener("change", (n) => {
      e.state.encoder = n.target.value, e.serialize(), e.setStatus(`Encoder: ${n.target.value}`);
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
    o.addEventListener("change", (n) => {
      e.state.snap_frames = Math.max(1, Math.round(Number(n.target.value) || 1)), e.serialize(), e.setStatus(`Snap: ${e.state.snap_frames} frame${e.state.snap_frames === 1 ? "" : "s"}`);
    }, { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="add-camera"]'))
    o.addEventListener("click", () => {
      e.addCamera(), e.closeMenus();
    }, { signal: a });
  for (const o of e.root.querySelectorAll('[data-act="record"]'))
    o.addEventListener("click", () => e.makePlayblast(), { signal: a });
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
      e.closeMenus(), Lm(e);
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
const Km = ["position", "target"], Dm = ["fov", "zoom"], Rm = ["roll"], Nm = ["position", "size"], qm = ["rotation"];
function Fo(e) {
  return ((e + 540) % 360 + 360) % 360 - 180;
}
function Tr(e, t, a, o) {
  const n = [0, 1, 2].map((s) => Number(e[s] || 0) + (Number(a[s] || 0) - Number(e[s] || 0)) * o);
  return Array.isArray(t) ? [0, 1, 2].map((s) => (2 * n[s] + Number(t[s] || 0)) / 3) : n;
}
function Bm(e, t, a, o) {
  const n = Number(e || 0) + (Number(a || 0) - Number(e || 0)) * o;
  return t == null ? n : (2 * n + Number(t || 0)) / 3;
}
function Ar(e, t, a, o) {
  const n = Fo(Number(a || 0) - Number(e || 0)), s = Number(e || 0) + n * o;
  if (t == null) return s;
  const i = Fo(Number(t || 0) - s);
  return s + i / 3;
}
function Pr(e, t, a) {
  return e.map((o, n) => o + (t[n] - o) * a);
}
function Wm(e, t, a) {
  return e + (t - e) * a;
}
function Ir(e, t, a) {
  return e + Fo(t - e) * a;
}
function Vm(e, t) {
  const a = (e || []).map((n) => ({
    ...n,
    ...n.camera ? { camera: { ...n.camera } } : {}
  })), o = Math.min(1, Math.max(0, Number(t) || 0));
  if (o === 0 || a.length < 3) return a;
  for (let n = 1; n < a.length - 1; n++) {
    const s = e[n - 1], i = e[n], c = e[n + 1], l = c.frame - s.frame, d = l !== 0 ? (i.frame - s.frame) / l : 0.5;
    if (i.camera) {
      for (const p of Km) {
        const f = s.camera?.[p], u = i.camera?.[p], m = c.camera?.[p];
        if (Array.isArray(f) && Array.isArray(m) && Array.isArray(u)) {
          const h = Tr(f, u, m, d);
          a[n].camera[p] = Pr(u.map(Number), h, o);
        }
      }
      for (const p of Dm) {
        const f = s.camera?.[p], u = i.camera?.[p], m = c.camera?.[p];
        if (f != null && m != null && u != null) {
          const h = Bm(f, u, m, d);
          a[n].camera[p] = Wm(Number(u), h, o);
        }
      }
      for (const p of Rm) {
        const f = s.camera?.[p], u = i.camera?.[p], m = c.camera?.[p];
        if (f != null && m != null && u != null) {
          const h = Ar(f, u, m, d);
          a[n].camera[p] = Ir(Number(u), h, o);
        }
      }
    }
    if (Array.isArray(i.position) && Array.isArray(s.position) && Array.isArray(c.position)) {
      for (const p of Nm) {
        const f = s[p], u = i[p], m = c[p];
        if (Array.isArray(f) && Array.isArray(m) && Array.isArray(u)) {
          const h = Tr(f, u, m, d);
          a[n][p] = Pr(u.map(Number), h, o);
        }
      }
      for (const p of qm) {
        const f = s[p], u = i[p], m = c[p];
        if (Array.isArray(f) && Array.isArray(m) && Array.isArray(u)) {
          const h = [0, 1, 2].map((y) => Ar(f[y], u[y], m[y], d));
          a[n][p] = u.map((y, b) => Ir(Number(y), h[b], o));
        }
      }
    }
  }
  return a;
}
function Hm(e) {
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
const Um = 0.05, Gm = 5e-3, Xm = 0.5;
function Ym(e, t) {
  const a = e.root;
  if (!a) return;
  const o = (n) => {
    if (n.button !== 0 || n.target.tagName === "INPUT" || n.target.tagName === "SELECT") return;
    const s = n.target.closest(".oc-axis");
    if (!s) return;
    const i = s.querySelector("input[type=number]");
    if (!i || i.disabled || i.readOnly) return;
    n.preventDefault(), n.stopPropagation();
    const c = n.clientX, l = parseFloat(i.value) || 0, d = parseFloat(i.getAttribute("step")) || 0.1, p = i.hasAttribute("min") ? parseFloat(i.getAttribute("min")) : -1 / 0, f = i.hasAttribute("max") ? parseFloat(i.getAttribute("max")) : 1 / 0;
    let u = !1, m = !1;
    if (s.classList.add("scrubbing"), document.body.style.cursor = "ew-resize", s.setPointerCapture)
      try {
        s.setPointerCapture(n.pointerId);
      } catch {
      }
    const h = (b) => {
      const x = b.clientX - c;
      if (Math.abs(x) > 2 && (u = !0), !u) return;
      m || (e.checkpoint?.("Scrub axis"), m = !0);
      let g = Um;
      b.shiftKey ? g = Gm : (b.ctrlKey || b.metaKey) && (g = Xm);
      const k = d * g * 20;
      let v = l + x * k;
      v = Math.max(p, Math.min(f, v));
      const $ = d >= 1 ? 0 : d >= 0.1 ? 1 : 2;
      i.value = v.toFixed($), i.dispatchEvent(new Event("input", { bubbles: !0 })), i.dispatchEvent(new Event("change", { bubbles: !0 }));
    }, y = (b) => {
      if (s.classList.remove("scrubbing"), document.body.style.cursor = "", s.removeEventListener("pointermove", h), s.removeEventListener("pointerup", y), s.removeEventListener("pointercancel", y), s.releasePointerCapture)
        try {
          s.releasePointerCapture(b.pointerId);
        } catch {
        }
      u && (e.serialize?.(), e.render?.());
    };
    s.addEventListener("pointermove", h), s.addEventListener("pointerup", y), s.addEventListener("pointercancel", y);
  };
  a.addEventListener("pointerdown", o, { signal: t });
}
function Zm(e, t) {
  const a = e.root;
  a && a.addEventListener("click", (o) => {
    const n = o.target.closest('[data-act="reset-vector"]');
    if (!n) return;
    o.preventDefault(), o.stopPropagation();
    const s = n.dataset.target, i = n.closest(".oc-vec-row");
    if (!i) return;
    const c = [...i.querySelectorAll("input[type=number]")];
    if (!c.length) return;
    e.checkpoint?.(r("Reset {target}").replace("{target}", s || "vector"));
    let l = [0, 0, 0];
    s === "position" || s === "pos" ? l = [0, 1.5, 0] : s === "camera-pos" ? l = [6, 4, 6] : s === "camera-target" || s === "target" ? l = [0, 1.5, 0] : s === "scale" ? l = [1, 1, 1] : (s === "rotation" || s === "rot") && (l = [0, 0, 0]), c.forEach((d, p) => {
      const f = l[p] !== void 0 ? l[p] : 0;
      d.value = String(f), d.dispatchEvent(new Event("input", { bubbles: !0 })), d.dispatchEvent(new Event("change", { bubbles: !0 }));
    }), e.serialize?.(), e.render?.(), e.setStatus?.(r("Reset {target}").replace("{target}", s || "vector"));
  }, { signal: t });
}
function zn(e) {
  const t = e.root.querySelector('[data-role="camera-hud"]');
  if (!t) return;
  const a = e.state.view_mode === "camera";
  if (t.hidden = !a, !a) return;
  const o = e.viewportCamera ? e.viewportCamera() : e.camera, n = e.activeCameraTrack ? e.activeCameraTrack() : null, s = t.querySelector('[data-role="hud-cam-name"]');
  s && (s.textContent = n?.name || "Camera");
  const i = t.querySelector('[data-role="cam-lock-icon"]'), c = !!e.state.camera_lock;
  if (i) {
    i.className = c ? "pi pi-lock" : "pi pi-lock-open";
    const h = i.closest('[data-act="toggle-camera-lock"]');
    h && (h.classList.toggle("locked", c), h.title = c ? r("Camera View is locked (click to unlock)") : r("Lock Camera View (prevent accidental navigation)"));
  }
  const l = t.querySelector('[data-role="hud-cam-lens"]');
  l && o?.fov != null && (l.textContent = `${Vo(o.fov)}mm`);
  const d = t.querySelector('[data-role="hud-cam-fov"]');
  d && o?.fov != null && (d.textContent = Ec(o.fov));
  const p = t.querySelector('[data-role="hud-cam-dist"]');
  if (p)
    if (o?.target && Array.isArray(o.target) && Array.isArray(o.position)) {
      const h = We($e(o.position, o.target));
      p.textContent = `Tgt: ${h.toFixed(2)}m`;
    } else
      p.textContent = "Free";
  const f = t.querySelector('[data-role="hud-roll-reset"]'), u = t.querySelector('[data-role="hud-roll-val"]'), m = Number(o?.roll || 0);
  f && (Math.abs(m) > 0.05 ? (f.hidden = !1, u && (u.textContent = `${m > 0 ? "+" : ""}${m.toFixed(1)}°`)) : f.hidden = !0);
}
function Jm(e) {
  const t = e.root.querySelector('[data-role="floating-transport"]');
  if (!t) return;
  const a = e.root.classList.contains("oc-fullscreen");
  if (t.hidden = !a, !a) return;
  const o = t.querySelector('[data-role="ft-play-icon"]');
  o && (o.className = e.playing ? "pi pi-pause" : "pi pi-play");
  const n = t.querySelector('[data-role="ft-timecode"]');
  if (n) {
    const i = Math.max(1, Math.round(e.state.fps || 24)), c = Math.floor(e.frame / i), l = e.frame % i;
    n.textContent = `${String(Math.floor(c / 3600)).padStart(2, "0")}:${String(Math.floor(c / 60) % 60).padStart(2, "0")}:${String(c % 60).padStart(2, "0")}:${String(l).padStart(2, "0")}`;
  }
  const s = t.querySelector('[data-role="ft-frame"]');
  s && (s.textContent = `F${e.frame}`);
}
function Ee(e) {
  const t = e.root.querySelector('[data-role="gizmo-space-badge"]');
  if (t) {
    const u = e.state.gizmo_space === "local";
    t.textContent = u ? "L" : "W";
    const m = t.closest('[data-role="gizmo-space-toggle"]');
    m && (m.classList.toggle("active", u), m.title = u ? r("Transform Space: Local (click for World)") : r("Transform Space: World (click for Local)"));
  }
  const a = e.root.querySelector('[data-role="spatial-snap-toggle"]');
  if (a) {
    const u = !!(e.state.spatial_snap_mode && e.state.spatial_snap_mode !== "none");
    a.classList.toggle("active", u), a.setAttribute?.("aria-pressed", String(u)), a.title = u ? r("Snapping: {mode} (click to disable)").replace("{mode}", e.state.spatial_snap_mode) : r("Toggle Snapping (Grid / None)");
  }
  const o = e.root.querySelector('[data-role="overlay-grid-btn"]');
  o && o.classList.toggle("active", e.state.show_grid !== !1);
  const n = e.root.querySelector('[data-role="overlay-wireframe-btn"]');
  n && n.classList.toggle("active", !!e.state.show_wireframe);
  const s = e.root.querySelector('[data-role="overlay-cull-btn"]');
  s && (s.classList.toggle("active", !!e.state.backface_culling), s.title = e.state.backface_culling ? r("Backface culling: On (Single-Sided)") : r("Backface culling: Off (Double-Sided Interior)"));
  const i = e.root.querySelector('[data-role="overlay-gizmo-btn"]');
  i && i.classList.toggle("active", e.state.show_gizmo !== !1);
  const c = e.root.querySelector('[data-role="overlay-guides-btn"]');
  c && c.classList.toggle("active", e.state.guides !== !1);
  const l = e.root.querySelector('[data-role="overlay-safe-btn"]');
  l && l.classList.toggle("active", !!e.state.safe_areas);
  const d = e.root.querySelector('[data-role="overlay-radar-btn"]');
  d && d.classList.toggle("active", !!e.state.show_radar);
  const p = e.root.querySelector('[data-role="shading-mode-select"]'), f = typeof document < "u" && document.activeElement === p;
  p && !f && (p.value = e.state.render_mode || "omni_ref");
}
function Qm(e, t) {
  for (const o of e.root.querySelectorAll('[data-act="toggle-camera-lock"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle camera lock"), e.state.camera_lock = !e.state.camera_lock, e.serialize?.(), zn(e), e.setStatus?.(e.state.camera_lock ? r("Camera View locked") : r("Camera View unlocked"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="reset-camera-roll"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Reset camera roll"), e.camera.roll = 0;
      const s = e.activeCameraTrack?.();
      if (s) {
        const i = s.keyframes?.find((c) => c.frame === e.frame);
        i && i.camera && (i.camera.roll = 0);
      }
      e.serialize?.(), e.updateEditState?.(), e.requestRender?.(), e.setStatus?.(r("Camera roll reset to 0°"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-gizmo-space"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle transform space"), e.state.gizmo_space = e.state.gizmo_space === "local" ? "world" : "local";
      for (const s of e.root.querySelectorAll('[data-role="gizmo-space"]'))
        s.value = e.state.gizmo_space;
      e.serialize?.(), Ee(e), e.requestRender?.(), e.setStatus?.(r("Transform space: {space}").replace("{space}", e.state.gizmo_space));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-spatial-snap"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle snapping");
      const s = e.state.spatial_snap_mode || "none";
      e.state.spatial_snap_mode = s === "none" ? "grid" : "none";
      for (const i of e.root.querySelectorAll('[data-role="spatial-snap-mode"]'))
        i.value = e.state.spatial_snap_mode;
      e.serialize?.(), Ee(e), e.setStatus?.(r("Snapping: {mode}").replace("{mode}", e.state.spatial_snap_mode));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-grid-overlay"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle grid overlay"), e.state.show_grid = e.state.show_grid === !1, e.serialize?.(), Ee(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-wireframe-overlay"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle wireframe overlay"), e.state.show_wireframe = !e.state.show_wireframe;
      for (const s of e.root.querySelectorAll('[data-role="show-wireframe"]')) s.checked = !!e.state.show_wireframe;
      e.serialize?.(), Ee(e), e.requestRender?.(), e.setStatus?.(e.state.show_wireframe ? r("Wireframe overlay: On") : r("Wireframe overlay: Off"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-cull-overlay"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle backface culling"), e.state.backface_culling = !e.state.backface_culling;
      for (const s of e.root.querySelectorAll('[data-role="backface-culling"]')) s.checked = !!e.state.backface_culling;
      e.serialize?.(), Ee(e), e.webgl && (e.webgl.sceneKey = ""), e.requestRender?.(), e.setStatus?.(e.state.backface_culling ? r("Backface culling: On (Single-Sided)") : r("Backface culling: Off (Double-Sided)"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-gizmo-overlay"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle gizmo overlay"), e.state.show_gizmo = e.state.show_gizmo === !1, e.serialize?.(), Ee(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-guides-overlay"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle guides overlay"), e.state.guides = e.state.guides === !1, e.serialize?.(), Ee(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-safe-areas-overlay"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle safe areas overlay"), e.state.safe_areas = !e.state.safe_areas, e.serialize?.(), Ee(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-radar-overlay"]'))
    o.addEventListener("click", (n) => {
      n.stopPropagation(), e.checkpoint?.("Toggle radar overlay"), e.state.show_radar = !e.state.show_radar, e.serialize?.(), Ee(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-role="shading-mode-select"]'))
    o.addEventListener("change", (n) => {
      e.state.render_mode !== n.target.value && e.checkpoint?.("Change shading mode"), e.state.render_mode = n.target.value, e.modeWidget && (e.modeWidget.value = n.target.value);
      for (const s of e.root.querySelectorAll('[data-role="mode"]')) s.value = n.target.value;
      e.serialize?.(), e.render ? e.render() : e.requestRender?.(), e.setStatus?.(r("Shading: {mode}").replace("{mode}", e.state.render_mode));
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
function ep(e, t) {
  const a = e.root.querySelector('[data-role="camera-focal"]'), o = e.root.querySelector('[data-role="camera-fov"]'), n = e.root.querySelector('[data-role="camera-sensor-preset"]');
  !a || !o || (n && n.addEventListener("change", () => {
    const s = $c[n.value];
    if (s && a) {
      const i = fr(a.value, s.height);
      o.value = String(Math.round(i * 100) / 100), o.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
  }, { signal: t }), a.addEventListener("input", () => {
    const s = fr(a.value);
    o.value = String(Math.round(s * 100) / 100), o.dispatchEvent(new Event("input", { bubbles: !0 }));
  }, { signal: t }), o.addEventListener("input", () => {
    document.activeElement !== a && (a.value = Vo(o.value));
  }, { signal: t }));
}
function tp(e, t) {
  const a = e.root.querySelector('[data-role="path-smoothing"]'), o = e.root.querySelector('[data-role="path-smoothing-value"]');
  if (!a) return;
  const n = () => {
    o && (o.textContent = `${a.value}%`);
  }, s = (i) => (e.smoothingBaseline?.cameraId !== i.id && (e.smoothingBaseline = { cameraId: i.id, keys: Hm(i.keyframes) }), e.smoothingBaseline.keys);
  a.addEventListener("input", n, { signal: t }), a.addEventListener("change", () => {
    const i = e.activeCameraTrack();
    if (!i) return;
    e.checkpoint("Path smoothing");
    const c = Number(a.value) / 100, l = Vm(s(i), c);
    i.keyframes = l, e.state.keyframes = l, e.state.path_smoothing = c, e.syncActiveCameraTrack(), e.refreshKeys(), e.setFrame(e.frame, !1, !1), e.setStatus(c > 0 ? r("Path smoothing set to {percent}%").replace("{percent}", String(a.value)) : r("Path smoothing cleared"));
  }, { signal: t }), n();
}
function ap(e, t) {
  const a = e.root.querySelector('[data-role="key-simplify"]'), o = e.root.querySelector('[data-role="key-simplify-value"]'), n = e.root.querySelector('[data-role="key-op-scope"]'), s = () => e.selectedEntity === "object" && e.selectedObjectId ? "object" : "camera", i = () => s() === "object" ? e.selectedObjectId : e.state.active_camera_id, c = () => s() === "object" ? e.state.objects.find((l) => l.id === e.selectedObjectId)?.keyframes || [] : e.activeCameraTrack().keyframes || [];
  if (a) {
    const l = () => {
      o && (o.textContent = Number(a.value) > 0 ? `${a.value}%` : r("Off"));
    }, d = () => {
      const p = `${s()}:${i()}`;
      return e.keySimplifyBaseline?.signature !== p && (e.keySimplifyBaseline = { signature: p, keys: JSON.parse(JSON.stringify(c())) }), e.keySimplifyBaseline.keys;
    };
    a.addEventListener("input", l, { signal: t }), a.addEventListener("change", () => {
      const p = s();
      e.simplifyActiveKeys({
        mode: "simplify",
        tolerance: Number(a.value) / 100,
        scope: p,
        fromKeys: d().map((f) => JSON.parse(JSON.stringify(f)))
      }), Number(a.value) === 0 && (e.keySimplifyBaseline = null);
    }, { signal: t }), l();
  }
  e.root.querySelector('[data-act="keys-reduce"]')?.addEventListener("click", async () => {
    const l = await jt(e, r("Reduce keys"), r("Target number of keys"), "8"), d = Math.round(Number(l));
    Number.isFinite(d) && d >= 2 && (e.simplifyActiveKeys({ mode: "reduce", target: d, scope: n?.value || "camera" }), e.keySimplifyBaseline = null);
  }, { signal: t }), e.root.querySelector('[data-act="keys-clean"]')?.addEventListener("click", () => {
    e.simplifyActiveKeys({ mode: "clean", scope: n?.value || "camera" }), e.keySimplifyBaseline = null;
  }, { signal: t });
}
function op(e, t) {
  const a = e.root.querySelector('[data-role="outliner-search"]');
  a && a.addEventListener("input", () => {
    e.outlinerFilter = a.value.trim().toLowerCase(), e.refreshObjects();
  }, { signal: t });
}
function rp(e, t) {
  const a = [...e.root.querySelectorAll("[data-dope-channel]")];
  if (a.length) {
    e.dopeChannels = new Set(a.filter((o) => o.checked).map((o) => o.dataset.dopeChannel));
    for (const o of a)
      o.addEventListener("change", () => {
        e.dopeChannels = new Set(a.filter((n) => n.checked).map((n) => n.dataset.dopeChannel)), gn(e);
      }, { signal: t });
  }
}
function np(e, t) {
  e.root.querySelector('[data-act="import-extractor-camera"]')?.addEventListener("click", () => {
    Mc(e);
  }, { signal: t }), e.root.querySelector('[data-act="dismiss-extractor-camera"]')?.addEventListener("click", () => {
    Tc(e);
  }, { signal: t });
}
function sp(e, t) {
  e.root.querySelector('[data-act="toggle-fullscreen"]')?.addEventListener("click", () => {
    const a = e.root.classList.toggle("oc-fullscreen");
    e.node?.setDirtyCanvas?.(!0, !0), e.scheduleResizeAndRender?.(), e.setStatus(a ? r("Viewport maximized") : r("Viewport restored"));
  }, { signal: t });
  for (const [a, o] of [
    ["toggle-scene-panel", "oc-scene-open"],
    ["toggle-inspector-panel", "oc-inspector-open"]
  ])
    e.root.querySelector(`[data-act="${a}"]`)?.addEventListener("click", (n) => {
      const s = e.root.classList.toggle(o);
      n.currentTarget.setAttribute("aria-pressed", String(s));
    }, { signal: t });
}
const Ua = () => import("./chunk-8_-z-EBN.js");
function ip(e, t) {
  Ua().then(({ loadExchangeFormats: o }) => o(e, t)), e.root.querySelector('[data-act="import-camera"]')?.addEventListener("click", async () => {
    (await Ua()).pickCameraFile(e);
  }, { signal: t }), e.root.querySelector('[data-act="export-camera"]')?.addEventListener("click", async () => {
    (await Ua()).exportCamera(e);
  }, { signal: t }), e.root.querySelector('[data-role="camera-file"]')?.addEventListener("change", async (o) => {
    const n = o.target.files?.[0];
    o.target.value = "", await (await Ua()).importCameraFile(e, n);
  }, { signal: t });
}
function cp(e, t) {
  const a = e.root.querySelector('[data-role="health-profile"]');
  if (!a) return;
  const o = () => {
    uo(e), e.refreshKeys();
  };
  vi().then((n) => {
    if (e.abortController?.signal.aborted) return;
    if (!Array.isArray(n?.profiles) || n.profiles.length === 0) {
      e.motionProfiles = null, uo(e);
      return;
    }
    e.motionProfiles = n;
    const s = e.state.health_profile;
    a.innerHTML = n.profiles.map((i) => `<option value="${i.id}">${i.display_name}</option>`).join(""), a.value = n.profiles.some((i) => i.id === s) ? s : n.default, o();
  }), a.addEventListener("change", () => {
    e.state.health_profile = a.value, e.serialize(), o();
  }, { signal: t }), e.root.querySelector('[data-role="health-body"]')?.addEventListener("click", (n) => {
    const s = n.target.closest('[data-act="health-smooth-zone"]');
    if (s) {
      const l = Number(s.dataset.zoneStart), d = Number(s.dataset.zoneEnd);
      xi(e, l, d);
      return;
    }
    const i = n.target.closest("[data-zone-start]");
    if (i) {
      e.setFrame(Number(i.dataset.zoneStart), !1, !1);
      return;
    }
    const c = n.target.closest("[data-act]")?.dataset.act;
    c === "health-slow" ? ki(e) : c === "health-smooth" ? wi(e) : c === "health-recenter" ? Si(e) : c === "health-timing" && ym(e);
  }, { signal: t });
  for (const n of e.root.querySelectorAll('[data-tab="health"]'))
    n.addEventListener("click", () => uo(e), { signal: t });
}
function lp(e, t) {
  const a = e.root.querySelector('[data-role="outliner-filter-chips"]');
  a && a.addEventListener("click", (o) => {
    const n = o.target.closest(".oc-chip");
    n && (e.outlinerCategoryFilter = n.dataset.filter || "all", e.refreshObjects());
  }, { signal: t });
}
function dp(e, t) {
  const a = e.root.querySelector('[data-role="key-editor"]');
  if (!a) return;
  a.addEventListener("click", (n) => {
    const s = n.target.closest("[data-tangent]");
    if (s) {
      e.setKeyTangentMode(s.dataset.tangent);
      return;
    }
    const i = n.target.closest("[data-act]");
    i && (i.dataset.act === "shot-prev-frame" ? e.setFrame(Math.max(0, e.frame - 1)) : i.dataset.act === "shot-next-frame" ? e.setFrame(Math.min(e.state.duration_frames - 1, e.frame + 1)) : i.dataset.act === "shot-prev-key" ? e.goToAdjacentKey?.(-1) : i.dataset.act === "shot-next-key" && e.goToAdjacentKey?.(1));
  }, { signal: t });
  const o = a.querySelector('[data-role="key-tangent-mode"]');
  o && o.addEventListener("change", () => {
    e.setKeyTangentMode(o.value);
  }, { signal: t });
}
function mp(e, t) {
  const a = e.root.querySelector('[data-role="outliner-batch-bar"]');
  a && a.addEventListener("click", (o) => {
    const n = o.target.closest("[data-act]");
    n && (n.dataset.act === "batch-toggle-visibility" ? e.toggleSelectedObjects?.() : n.dataset.act === "batch-toggle-lock" ? e.lockSelectedObjects?.() : n.dataset.act === "batch-duplicate" ? e.duplicateSelectedObjects?.() : n.dataset.act === "batch-delete" ? e.deleteSelectedObjects?.() : n.dataset.act === "batch-deselect" && e.deselectAll?.());
  }, { signal: t });
}
function pp(e, t) {
  ip(e, t), ep(e, t), tp(e, t), ap(e, t), op(e, t), lp(e, t), mp(e, t), dp(e, t), Ym(e, t), Zm(e, t), rp(e, t), sp(e, t), Qm(e, t), np(e, t), cp(e, t);
}
const zr = {
  low: { shadows: !0, shadowSize: 1024, toneExposure: 0.9, renderScale: 1 },
  balanced: { shadows: !0, shadowSize: 2048, toneExposure: 0.95, renderScale: 1.25 },
  high: { shadows: !0, shadowSize: 4096, toneExposure: 1, renderScale: 1.5 }
}, Fn = "balanced", xo = "#121212";
function Yo(e) {
  return zr[e] || zr[Fn];
}
function fp(e, t = "#1b1f2b", a = "#151822", o = "#1e2330", n = "#161922", s = "#111319") {
  const i = document.createElement("canvas");
  i.width = 8, i.height = 256;
  const c = i.getContext("2d"), l = c.createLinearGradient(0, 0, 0, i.height);
  l.addColorStop(0, t), l.addColorStop(0.35, a), l.addColorStop(0.48, o), l.addColorStop(0.52, o), l.addColorStop(0.72, n), l.addColorStop(1, s), c.fillStyle = l, c.fillRect(0, 0, i.width, i.height);
  const d = new e.CanvasTexture(i);
  return d.mapping = e.EquirectangularReflectionMapping, d.colorSpace = e.SRGBColorSpace, d.needsUpdate = !0, d;
}
function hp(e) {
  const t = document.createElement("canvas");
  t.width = t.height = 256;
  const a = t.getContext("2d"), o = a.createRadialGradient(128, 128, 0, 128, 128, 128);
  o.addColorStop(0, "rgba(255,255,255,0.22)"), o.addColorStop(0.3, "rgba(255,255,255,0.13)"), o.addColorStop(0.65, "rgba(255,255,255,0.035)"), o.addColorStop(1, "rgba(255,255,255,0)"), a.fillStyle = o, a.fillRect(0, 0, 256, 256);
  const n = new e.CanvasTexture(t);
  return n.colorSpace = e.SRGBColorSpace, n.needsUpdate = !0, n;
}
function Gu(e, t, a = Fn) {
  const o = Yo(a), n = new e.Group();
  n.name = "omnicam-studio";
  const s = new e.DirectionalLight(16774892, 2.2);
  s.position.set(5, 8.5, 4), s.castShadow = !0, s.shadow.mapSize.set(o.shadowSize, o.shadowSize), s.shadow.bias = -8e-4, s.shadow.normalBias = 0.02, s.shadow.radius = 2.4;
  const i = s.shadow.camera;
  i.near = 0.5, i.far = 70, i.left = i.bottom = -14, i.right = i.top = 14, n.add(s, s.target);
  const c = new e.DirectionalLight(10533112, 0.75);
  c.position.set(-6, 4, 3), n.add(c);
  const l = new e.DirectionalLight(14477567, 1.35);
  l.position.set(-3, 6, -8), n.add(l);
  const d = new e.HemisphereLight(2633792, 1184794, 0.55);
  n.add(d);
  const p = hp(e), f = new e.Mesh(
    new e.PlaneGeometry(180, 180),
    new e.MeshStandardMaterial({
      color: 1447970,
      roughness: 0.98,
      metalness: 0,
      alphaMap: p,
      transparent: !0,
      depthWrite: !1
    })
  );
  f.rotation.x = -Math.PI / 2, f.position.y = -3e-3, f.name = "omnicam-studio-floor", n.add(f);
  const u = new e.Mesh(
    new e.PlaneGeometry(180, 180),
    new e.ShadowMaterial({ opacity: 0.38, transparent: !0, depthWrite: !1 })
  );
  u.rotation.x = -Math.PI / 2, u.position.y = -1e-3, u.receiveShadow = !0, u.name = "omnicam-shadow-catcher", n.add(u);
  const m = new e.FogExp2(1250588, 8e-3), h = fp(e), y = new e.PMREMGenerator(t);
  y.compileEquirectangularShader();
  const b = new al(), x = y.fromScene(b, 0.04).texture;
  return b.traverse((g) => {
    g.geometry?.dispose?.();
    const k = Array.isArray(g.material) ? g.material : [g.material];
    for (const v of k) v?.dispose?.();
  }), {
    group: n,
    key: s,
    fill: c,
    rim: l,
    bounce: d,
    catcher: f,
    shadowCatcher: u,
    floorMap: p,
    sky: h,
    environment: x,
    pmrem: y,
    fog: m,
    quality: a,
    dispose() {
      f.geometry.dispose(), f.material.dispose(), u.geometry.dispose(), u.material.dispose(), p.dispose(), h.dispose(), x.dispose(), y.dispose();
      for (const g of [s, c, l, d]) g.dispose?.();
    }
  };
}
function Xu(e, t, a) {
  const o = Yo(a);
  return e.quality = a, e.key.shadow.mapSize.set(o.shadowSize, o.shadowSize), e.key.shadow.map?.dispose(), e.key.shadow.map = null, t.toneMappingExposure = o.toneExposure, o;
}
function Yu(e, t, a, o, n) {
  o.group.visible = n, t.environment = n ? o.environment : null, t.background = n ? o.sky : new e.Color(1184274), t.fog = n ? o.fog : null, a.toneMapping = n ? e.ACESFilmicToneMapping : e.NoToneMapping, a.toneMappingExposure = n ? Yo(o.quality).toneExposure : 1, t.traverse((s) => {
    s.material && (s.material.needsUpdate = !0);
  });
}
function Zo(e, t) {
  t && (e.checkpoint?.("Toggle object lock"), t.locked = !t.locked, e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.render?.());
}
function up(e) {
  if (!e?.reconstruction) return null;
  const t = e.reconstruction.confidence != null ? Number(e.reconstruction.confidence) : 1;
  let a = "low", o = "Low";
  t >= 0.75 ? (a = "high", o = "High") : t >= 0.45 && (a = "medium", o = "Medium");
  const n = e.reconstruction, s = n.provider || "Reconstructed", i = Math.round(t * 100), c = Ac(e), l = c.length ? `
` + c.map(([p, f]) => `${p}: ${f}`).join(`
`) : "", d = `${s} • ${o} (${i}%)${l}`;
  return {
    label: o,
    band: a,
    title: d,
    confidence: t,
    semantic: String(n.semantic || ""),
    role: String(n.role || "")
  };
}
function bp(e) {
  return e?.reconstruction_appearance || "source_texture";
}
function Zu(e, t, a) {
  return e?.reconstruction ? a ? "neutral" : bp(t) === "source_texture" ? "textured" : "neutral" : null;
}
function gp(e, t) {
  e && (e.state || (e.state = {}), e.state.reconstruction_appearance = t === "source_texture" ? "source_texture" : "neutral", e.serialize?.(), e.render?.());
}
function Ga(e, t, a, o = 300) {
  const n = globalThis.performance?.now?.() ?? Date.now();
  e._groupedCheckpointAt ||= {}, (!Number.isFinite(e._groupedCheckpointAt[t]) || n - e._groupedCheckpointAt[t] > o) && e.checkpoint(a), e._groupedCheckpointAt[t] = n;
}
function yp(e, t, a) {
  const o = e.root.querySelector('[data-role="viewport-axis"]');
  if (o) {
    const s = (i) => {
      const c = i.target.closest?.("[data-axis], [data-axis-center]") || i.target, l = c.getAttribute("data-axis"), d = ji(l?.toLowerCase(), e.state.view_mode);
      d ? (i.preventDefault(), e.setViewMode(d)) : c.hasAttribute("data-axis-center") && (i.preventDefault(), e.frameTarget());
    };
    o.addEventListener("click", s, { signal: a }), o.addEventListener("keydown", (i) => {
      (i.key === "Enter" || i.key === " ") && s(i);
    }, { signal: a });
  }
  for (const s of e.root.querySelectorAll('[data-role="mode"]'))
    s.addEventListener("change", (i) => {
      e.state.render_mode !== i.target.value && e.checkpoint("Change render mode"), e.state.render_mode = i.target.value, e.modeWidget && (e.modeWidget.value = i.target.value);
      for (const c of e.root.querySelectorAll('[data-role="mode"]')) c.value = i.target.value;
      e.serialize(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="guide-capture-style"]'))
    s.addEventListener("change", (i) => {
      e.state.guide_capture_style !== i.target.value && e.checkpoint("Change guide capture style"), e.state.guide_capture_style = i.target.value;
      for (const c of e.root.querySelectorAll('[data-role="guide-capture-style"]')) c.value = i.target.value;
      e.serialize();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="frame"]'))
    s.addEventListener("change", (i) => e.setFrame(Number(i.target.value)), { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="scrub"]'))
    s.addEventListener("input", (i) => e.setFrame(Number(i.target.value)), { signal: a });
  for (const s of e.root.querySelectorAll("[data-view]"))
    s.addEventListener("click", () => e.setViewMode(s.dataset.view), { signal: a });
  for (const s of e.root.querySelectorAll("[data-select-mode]"))
    s.addEventListener("click", () => e.setSelectMode(s.dataset.selectMode), { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="select-mode"]'))
    s.addEventListener("change", (i) => e.setSelectMode(i.target.value), { signal: a });
  for (const s of e.root.querySelectorAll("[data-transform-mode]"))
    s.addEventListener("click", () => e.setTransformMode(s.dataset.transformMode), { signal: a });
  t('[data-act="frame-target"]')?.addEventListener("click", () => e.frameTarget(), { signal: a });
  for (const s of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    s.addEventListener("click", () => e.toggleCameraView(), { signal: a });
  for (const s of e.root.querySelectorAll("[data-inspector-mode]"))
    s.addEventListener("click", () => {
      const i = s.dataset.inspectorMode;
      e.setInspectorMode(e.inspectorMode === i ? "entity" : i);
    }, { signal: a });
  const n = e.root.querySelector(".inspector-tabs, .oc-side-tabs");
  n && n.addEventListener("keydown", (s) => {
    if (s.key === "ArrowLeft" || s.key === "ArrowRight") {
      s.preventDefault();
      const i = [...n.querySelectorAll(".inspector-tab")].filter((l) => l.offsetParent !== null), c = i.findIndex((l) => l.classList.contains("active"));
      if (c >= 0 && i.length > 1) {
        const l = s.key === "ArrowRight" ? (c + 1) % i.length : (c - 1 + i.length) % i.length;
        i[l].click(), i[l].focus();
      }
    }
  }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    s.addEventListener("change", (i) => e.activateCamera(i.target.value), { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="camera-color"]'))
    s.addEventListener("input", (i) => {
      const c = e.activeCameraTrack();
      c && (c.color = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="playblast-camera"]'))
    s.addEventListener("change", (i) => e.setPlayblastCamera(i.target.value), { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="camera-type"]'))
    s.addEventListener("change", (i) => {
      e.camera.camera_type !== i.target.value && e.checkpoint("Change camera type"), e.camera.camera_type = i.target.value, ye(e.root, "camera-type", i.target), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="speed"]')) {
    const i = (c) => {
      const l = U(Number(c.target.value), 0.05, 5);
      if (Number.isFinite(l)) {
        e.cameraSpeed = l;
        for (const d of e.root.querySelectorAll('[data-role="speed"]'))
          d !== c.target && (d.value = String(l));
      }
    };
    s.addEventListener("input", i, { signal: a }), s.addEventListener("change", i, { signal: a });
  }
  for (const s of e.root.querySelectorAll('[data-role="interp"]'))
    s.addEventListener("change", (i) => {
      e.activeKeyframe() && (e.activeKeyframe().interpolation !== i.target.value && e.checkpoint("Change interpolation"), e.activeKeyframe().interpolation = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="point-density"]'))
    s.addEventListener("change", (i) => {
      e.state.point_density !== i.target.value && e.checkpoint("Change point density"), e.state.point_density = i.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point density: ${i.target.value}`);
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="point-color"]'))
    s.addEventListener("input", (i) => {
      e.state.point_color !== i.target.value && Ga(e, "point_color", "Change point color"), e.state.point_color = i.target.value, e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="point-spread"]'))
    s.addEventListener("change", (i) => {
      e.state.point_spread !== i.target.value && e.checkpoint("Change point spread"), e.state.point_spread = i.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point spread: ${i.target.value}`);
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="card-fit"]'))
    s.addEventListener("change", (i) => {
      e.state.card_fit !== i.target.value && e.checkpoint("Change card fit"), e.state.card_fit = i.target.value, e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="speed-heatmap"]'))
    s.addEventListener("change", (i) => {
      e.state.speed_heatmap !== i.target.checked && e.checkpoint("Toggle speed heatmap"), e.state.speed_heatmap = i.target.checked, ye(e.root, "speed-heatmap", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="playblast-grid"]'))
    s.addEventListener("change", (i) => {
      e.state.playblast_grid !== i.target.checked && e.checkpoint("Toggle playblast grid"), e.state.playblast_grid = i.target.checked, ye(e.root, "playblast-grid", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="playblast-labels"]'))
    s.addEventListener("change", (i) => {
      e.state.playblast_labels !== i.target.checked && e.checkpoint("Toggle playblast labels"), e.state.playblast_labels = i.target.checked, ye(e.root, "playblast-labels", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="playblast-resolution"]'))
    s.addEventListener("change", (i) => {
      e.state.playblast_resolution !== i.target.value && e.checkpoint("Change playblast resolution"), e.state.playblast_resolution = i.target.value, ye(e.root, "playblast-resolution", i.target), e.scheduleSerialize();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-act="reset-bg-color"]'))
    s.addEventListener("click", () => {
      e.state.viewport_bg_color !== xo && e.checkpoint("Reset background colour"), e.state.viewport_bg_color = xo;
      for (const i of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) i.value = xo;
      e.scheduleSerialize(), e.render(), e.setStatus(r("Background colour reset"));
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="show-grid"]'))
    s.addEventListener("change", (i) => {
      e.state.show_grid = i.target.checked, ye(e.root, "show-grid", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const [s, i] of [
    ["show-camera-paths", "show_camera_paths"],
    ["show-camera-gizmos", "show_camera_gizmos"],
    ["show-look-at", "show_look_at"],
    ["show-helper-axes", "show_helper_axes"]
  ])
    for (const c of e.root.querySelectorAll(`[data-role="${s}"]`))
      c.addEventListener("change", (l) => {
        e.state[i] !== l.target.checked && e.checkpoint("Toggle viewport helper"), e.state[i] = l.target.checked, ye(e.root, s, l.target, "checked"), e.scheduleSerialize(), e.render();
      }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-act="select-look-at"]'))
    s.addEventListener("click", () => {
      const i = e.selectedEntity !== "camera_target";
      e.selectedEntity = i ? "camera_target" : "camera", e.selectedObjectId = null, e.selectedObjectIds?.clear?.();
      for (const c of e.root.querySelectorAll('[data-act="select-look-at"]'))
        c.classList.toggle("active", i), c.setAttribute("aria-pressed", String(i));
      e.refreshInspector?.(), e.render(), e.setStatus?.(i ? r("Look-At target selected") : r("Camera selected"));
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="show-wireframe"]'))
    s.addEventListener("change", (i) => {
      e.state.show_wireframe !== i.target.checked && e.checkpoint("Toggle wireframe"), e.state.show_wireframe = i.target.checked, ye(e.root, "show-wireframe", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="show-vertices"]'))
    s.addEventListener("change", (i) => {
      e.state.show_vertices !== i.target.checked && e.checkpoint("Toggle vertices"), e.state.show_vertices = i.target.checked, ye(e.root, "show-vertices", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="backface-culling"]'))
    s.addEventListener("change", (i) => {
      !!e.state.backface_culling !== i.target.checked && e.checkpoint("Toggle backface culling"), e.state.backface_culling = i.target.checked, ye(e.root, "backface-culling", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render(), e.setStatus(e.state.backface_culling ? r("Backface culling: On (Single-Sided)") : r("Backface culling: Off (Double-Sided)"));
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-act="set-near-preset"]'))
    s.addEventListener("click", (i) => {
      i.stopPropagation();
      const c = Number(s.dataset.near || 0.01);
      e.checkpoint("Set camera near clip"), e.camera.near = c, e.camera.far <= e.camera.near && (e.camera.far = e.camera.near + 100);
      const l = e.activeCameraTrack?.();
      if (l) {
        l.camera.near = c;
        const d = l.keyframes?.find((p) => p.frame === e.frame);
        d && d.camera && (d.camera.near = c);
      }
      for (const d of e.root.querySelectorAll('[data-role="camera-near"]')) d.value = String(c);
      e.scheduleSerialize(), e.render(), e.setStatus(r("Near clip set to {val}m").replace("{val}", String(c)));
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="burn-in"]'))
    s.addEventListener("change", (i) => {
      e.state.burn_in !== i.target.checked && e.checkpoint("Toggle burn-in"), e.state.burn_in = i.target.checked, ye(e.root, "burn-in", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="guides"]'))
    s.addEventListener("change", (i) => {
      e.state.guides !== i.target.checked && e.checkpoint("Toggle guides"), e.state.guides = i.target.checked, ye(e.root, "guides", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="safe-areas"]'))
    s.addEventListener("change", (i) => {
      e.state.safe_areas !== i.target.checked && e.checkpoint("Toggle safe areas"), e.state.safe_areas = i.target.checked, ye(e.root, "safe-areas", i.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="resolution-gate"]'))
    s.addEventListener("change", (i) => {
      e.state.resolution_gate !== i.target.checked && e.checkpoint("Toggle resolution gate"), e.state.resolution_gate = i.target.checked, ye(e.root, "resolution-gate", i.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="aspect-ratio"]'))
    s.addEventListener("change", (i) => {
      e.state.aspect_ratio !== i.target.value && e.checkpoint("Change aspect ratio"), e.state.aspect_ratio = i.target.value, ye(e.root, "aspect-ratio", i.target), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) {
    const i = (c) => {
      e.state.viewport_bg_color !== c.target.value && Ga(e, "viewport_bg_color", "Change background colour"), e.state.viewport_bg_color = c.target.value, ye(e.root, "viewport-bg-color", c.target), e.scheduleSerialize(), e.render();
    };
    s.addEventListener("input", i, { signal: a }), s.addEventListener("change", i, { signal: a });
  }
  for (const s of e.root.querySelectorAll('[data-act="upload-viewport-bg"]'))
    s.addEventListener("click", () => {
      e.closeMenus(), t('[data-role="viewport-bg-file"]')?.click();
    }, { signal: a });
  t('[data-role="viewport-bg-file"]')?.addEventListener("change", (s) => {
    e.loadViewportBgFile(s.target.files?.[0]), s.target.value = "";
  }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-act="upload-viewport-bg-seq"]'))
    s.addEventListener("click", () => {
      e.closeMenus(), t('[data-role="viewport-bg-seq-file"]')?.click();
    }, { signal: a });
  t('[data-role="viewport-bg-seq-file"]')?.addEventListener("change", (s) => {
    e.loadViewportBgSequence(Array.from(s.target.files || [])), s.target.value = "";
  }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-act="clear-viewport-bg"]'))
    s.addEventListener("click", () => {
      e.clearViewportBgImage(), e.closeMenus();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="object-material"]'))
    s.addEventListener("change", (i) => {
      const c = e.selectedObject();
      c && (c.material_mode !== i.target.value && e.checkpoint("Change object material"), c.material_mode = i.target.value, e.serialize(), e.render());
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-act="toggle-object-lock"]'))
    s.addEventListener("click", () => {
      const i = e.selectedObject?.();
      i && Zo(e, i);
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="reconstruction-appearance"]'))
    s.addEventListener("change", (i) => {
      gp(e, i.target.value);
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="object-color"]'))
    s.addEventListener("input", (i) => {
      const c = e.selectedObject();
      c && (c.color !== i.target.value && Ga(e, `object_color:${c.id}`, "Change object color"), c.color = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="object-light-color"]'))
    s.addEventListener("input", (i) => {
      const c = e.selectedObject();
      c && (c.color !== i.target.value && Ga(e, `object_color:${c.id}`, "Change light color"), c.color = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="reference-select"]'))
    s.addEventListener("change", (i) => {
      e.state.reference_index !== Number(i.target.value) && e.checkpoint("Change reference"), e.state.reference_index = Number(i.target.value), e.serialize(), e.loadSelectedReference();
    }, { signal: a });
  for (const s of e.root.querySelectorAll("[data-proxy-preset]"))
    s.addEventListener("click", () => {
      e.applyProxyPreset(s.dataset.proxyPreset), e.closeMenus();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('select[data-role="proxy-preset"]'))
    s.addEventListener("change", (i) => {
      e.applyProxyPreset(i.target.value);
    }, { signal: a });
  for (const s of e.root.querySelectorAll("[data-lens]"))
    s.addEventListener("click", () => {
      Pc(e, Number(s.dataset.lens));
    }, { signal: a });
  for (const s of e.root.querySelectorAll("[data-blocking-scene]"))
    s.addEventListener("click", () => {
      lm(e, s.dataset.blockingScene), e.closeMenus();
    }, { signal: a });
  for (const s of e.root.querySelectorAll('[data-role="show-radar"]'))
    s.addEventListener("change", (i) => {
      e.state.show_radar !== i.target.checked && e.checkpoint("Toggle radar"), e.state.show_radar = i.target.checked, e.scheduleSerialize(), e.render(), e.setStatus(`Radar Mini-Map: ${i.target.checked ? "ON" : "OFF"}`);
    }, { signal: a });
}
const vp = 32, xp = 0.025, kp = 0.05, eo = 1e-6, wp = ["top", "bottom", "front", "back", "left", "right"], Sp = {
  top: "y",
  bottom: "y",
  front: "z",
  back: "z",
  left: "x",
  right: "x"
}, to = { x: 0, y: 1, z: 2 };
function Lo(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
function Jo(e, t) {
  return Math.hypot(
    (t[0] || 0) - (e[0] || 0),
    (t[1] || 0) - (e[1] || 0),
    (t[2] || 0) - (e[2] || 0)
  );
}
function jp(e) {
  let t = 0;
  for (let a = 1; a < e.length; a++) t += Jo(e[a - 1], e[a]);
  return t;
}
function Oo(e) {
  const t = Math.max(0, Math.round(Number(e?.duration_frames) || 1) - 1), a = Array.isArray(e?.playback_range) ? e.playback_range : [0, t], o = Lo(Math.round(Number(a[0]) || 0), 0, t), n = Lo(Math.round(Number(a[1]) || t), 0, t);
  return o <= n ? [o, n] : [n, o];
}
function Cp(e, t) {
  if (t <= 2) return [e[0], e.at(-1)].map((i) => [...i]);
  const a = [0];
  for (let i = 1; i < e.length; i++)
    a[i] = a[i - 1] + Jo(e[i - 1], e[i]);
  const o = a.at(-1) || 0;
  if (o < eo) return [];
  const n = [];
  let s = 1;
  for (let i = 0; i < t; i++) {
    const c = o * i / (t - 1);
    for (; s < a.length - 1 && a[s] < c; ) s += 1;
    const l = a[s - 1], d = a[s], p = Lo((c - l) / Math.max(eo, d - l), 0, 1), f = e[s - 1], u = e[s];
    n.push([
      f[0] + (u[0] - f[0]) * p,
      f[1] + (u[1] - f[1]) * p,
      f[2] + (u[2] - f[2]) * p
    ]);
  }
  return n;
}
function Ln(e, t = [0, 0, -1]) {
  const a = Math.hypot(e?.[0] || 0, e?.[2] || 0);
  return a < eo ? [...t] : [(e[0] || 0) / a, 0, (e[2] || 0) / a];
}
function On(e, t) {
  const a = Math.hypot(e[0] || 0, e[1] || 0, e[2] || 0);
  return a < eo ? [...t] : [e[0] / a, e[1] / a, e[2] / a];
}
function _p(e, t, a, o) {
  const n = e[Math.max(0, t - 1)], s = e[Math.min(e.length - 1, t + 1)], i = [s[0] - n[0], s[1] - n[1], s[2] - n[2]];
  return o === "y" ? Ln(i, a) : On(i, a);
}
function Ep(e, t, a, o) {
  if (o === "y") {
    const s = Math.max(
      0.25,
      Math.hypot(a[0], a[2]) || Math.hypot(...a) || 1
    );
    return [
      e[0] + t[0] * s,
      e[1] + (a[1] || 0),
      e[2] + t[2] * s
    ];
  }
  const n = Math.max(0.25, Math.hypot(...a) || 1);
  return [
    e[0] + t[0] * n,
    e[1] + t[1] * n,
    e[2] + t[2] * n
  ];
}
function $p(e) {
  const [t, a] = e.range, o = a - t;
  if (o < 1) return [];
  const n = e.seedPoint ? [e.seedPoint, ...e.points] : e.points;
  if (n.length < 2) return [];
  const s = Math.min(vp, n.length, o + 1);
  if (s < 2) return [];
  const i = Cp(n, s);
  if (i.length < 2) return [];
  const c = e.sourceCamera, l = [
    c.target[0] - c.position[0],
    c.target[1] - c.position[1],
    c.target[2] - c.position[2]
  ], d = e.planeAxis === "y" ? Ln(l) : On(l, [0, 0, -1]), p = e.seedPoint ? 1 : 0, f = [];
  for (let u = p; u < i.length; u++) {
    const m = i[u], h = _p(i, u, d, e.planeAxis), y = le(c);
    y.position = [...m], y.target = Ep(m, h, l, e.planeAxis), f.push({
      frame: Math.round(t + o * u / (i.length - 1)),
      camera: y,
      interpolation: "smooth"
    });
  }
  return f.filter((u, m, h) => m === 0 || u.frame > h[m - 1].frame);
}
function Mp(e) {
  const t = new Set((e.cameras || []).map((o) => o.name));
  let a = 1;
  for (; t.has(`Drawn Camera ${a}`); ) a += 1;
  return `Drawn Camera ${a}`;
}
function Kn(e, t = e.cameraPathDraw) {
  const a = t?.pointerId;
  if (a != null)
    try {
      e.interactionElement?.hasPointerCapture?.(a) && e.interactionElement.releasePointerCapture(a);
    } catch {
    }
}
function wt(e) {
  const t = e.cameraPathDraw, a = !!t?.active, o = a && t.mode === "extend";
  for (const s of e.root?.querySelectorAll?.('[data-act="draw-camera-path"]') || [])
    s.classList.toggle("active", a && !o), s.setAttribute("aria-pressed", String(a && !o));
  for (const s of e.root?.querySelectorAll?.('[data-act="draw-camera-path-extend"]') || [])
    s.classList.toggle("active", o), s.setAttribute("aria-pressed", String(o));
  const n = e.interactionElement;
  n?.style && (a ? (n.dataset.cameraPathDraw = "true", n.style.cursor = "crosshair") : n.dataset?.cameraPathDraw && (delete n.dataset.cameraPathDraw, n.style.cursor = ""));
}
function Fr(e, t = {}) {
  if (e.cameraPathDraw?.active) return !0;
  const a = t.mode === "extend" ? "extend" : "new", o = e.activeCameraTrack?.(), n = le(e.camera || o?.camera);
  if (!n?.position || !n?.target) return !1;
  let s = null, i = null, c, l = null, d = null;
  if (a === "extend") {
    const u = o?.keyframes;
    if (!o || !Array.isArray(u) || u.length < 1)
      return e.setStatus?.(r("Draw Camera Path: the active camera has no path to continue")), !1;
    e.state.view_mode === "camera" && e.setViewMode?.("top");
    const m = u[u.length - 1];
    s = [...m.camera.position], i = o.id;
    const h = Math.max(0, Math.round(Number(e.state.duration_frames) || 1) - 1), [, y] = Oo(e.state), b = u.length > 1 ? u[u.length - 1].frame - u[0].frame : 24;
    let x = Math.max(y, m.frame + Math.max(6, Math.min(b, 240)));
    x <= m.frame && (x = m.frame + 24), x > h && (l = x + 1), x > y && (d = x), c = [m.frame, x];
  } else
    wp.includes(e.state.view_mode) || e.setViewMode?.("top"), c = Oo(e.state);
  const p = Sp[e.state.view_mode] ?? null, f = s ? [...s] : [...n.position];
  return e.cameraPathDraw = {
    active: !0,
    drawing: !1,
    pointerId: null,
    mode: a,
    appendTrackId: i,
    planeAxis: p,
    anchor: f,
    seedPoint: s,
    range: c,
    wantDuration: l,
    wantRangeEnd: d,
    sourceCamera: n,
    points: []
  }, wt(e), e.setStatus?.(a === "extend" ? r("Continue Camera Path: LMB draw from the last key · RMB or Esc cancel") : r("Draw Camera Path: LMB draw · RMB or Esc cancel")), e.render?.(), !0;
}
function Qo(e, t) {
  const a = e.cameraPathDraw;
  if (!a?.active || !Array.isArray(t) || t.length < 3) return !1;
  const o = [Number(t[0]), Number(t[1]), Number(t[2])];
  if (!o.every(Number.isFinite)) return !1;
  a.planeAxis && (o[to[a.planeAxis]] = a.anchor[to[a.planeAxis]]);
  const n = a.points.at(-1);
  return n && Jo(n, o) < xp ? !1 : (a.points.push(o), !0);
}
function Pe(e) {
  const t = e.cameraPathDraw;
  return t?.active ? (Kn(e, t), e.cameraPathDraw = null, wt(e), e.setStatus?.(r("Draw Camera Path cancelled")), e.render?.(), !0) : !1;
}
function Tp(e) {
  const t = e.cameraPathDraw;
  if (!t?.active) return null;
  Kn(e, t);
  const a = t.seedPoint ? [t.seedPoint, ...t.points] : t.points;
  if (a.length < 2 || jp(a) < kp || t.range[1] <= t.range[0])
    return Pe(e), e.setStatus?.(r("Camera path needs at least two distinct points")), null;
  const o = $p(t);
  if (o.length < (t.mode === "extend" ? 1 : 2))
    return Pe(e), null;
  if (t.mode === "extend") {
    const c = e.state.cameras.find((p) => p.id === t.appendTrackId);
    if (!c)
      return Pe(e), null;
    e.checkpoint?.("Extend camera path"), t.wantDuration && (e.state.duration_frames = Math.max(Number(e.state.duration_frames) || 0, t.wantDuration)), t.wantRangeEnd != null && Array.isArray(e.state.playback_range) && (e.state.playback_range = [e.state.playback_range[0], Math.max(e.state.playback_range[1], t.wantRangeEnd)]);
    const l = new Map((c.keyframes || []).map((p) => [p.frame, p]));
    for (const p of o) l.set(p.frame, p);
    const d = [...l.values()].sort((p, f) => p.frame - f.frame);
    return c.keyframes = d, c.id === e.state.active_camera_id && (e.state.keyframes = d), e.cameraPreviewSignature = "", e.cameraPathDraw = null, wt(e), e.activateCamera?.(c.id), e.setFrame?.(o[0].frame), e.serialize?.(), e.refreshKeys?.(), e.render?.(), e.setStatus?.(r("Camera path extended")), c.id;
  }
  e.checkpoint?.("Draw camera path");
  const n = Ic(e.state), s = e.state.cameras.length, i = {
    id: n,
    name: Mp(e.state),
    color: hr[s % hr.length],
    camera: le(o[0].camera),
    keyframes: o,
    target_object_id: null,
    target_offset: [0, 0, 0]
  };
  return e.state.cameras.push(i), e.cameraPreviewSignature = "", e.cameraPathDraw = null, wt(e), e.activateCamera?.(n), e.setFrame?.(t.range[0]), e.setStatus?.(r("Camera path created")), n;
}
function ao(e) {
  e.preventDefault?.(), e.stopPropagation?.(), e.stopImmediatePropagation?.();
}
function Ap(e, t) {
  const a = e.interactionElement.getBoundingClientRect();
  return [
    (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width),
    (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height)
  ];
}
function er(e, t) {
  const a = e.cameraPathDraw, o = e.viewportCamera?.();
  if (!a || !o) return null;
  const n = Ci(
    Ap(e, t),
    o,
    a.anchor,
    e.canvas.width,
    e.canvas.height
  );
  return n?.every(Number.isFinite) ? (a.planeAxis && (n[to[a.planeAxis]] = a.anchor[to[a.planeAxis]]), n) : null;
}
function Pp(e, t) {
  const a = e.cameraPathDraw;
  return a?.active ? t.button === 2 && !t.altKey ? (ao(t), e.cameraPathSuppressContextMenuUntil = Date.now() + 1e3, Pe(e), !0) : t.button !== 0 || t.altKey || t.ctrlKey || t.metaKey || t.shiftKey ? !1 : (ao(t), e.closeMenus?.(), e.interactionElement.focus?.({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(t.pointerId), a.drawing = !0, a.pointerId = t.pointerId, a.points = [], Qo(e, er(e, t)), wt(e), e.requestRender?.("camera-path-draw"), !0) : !1;
}
function Ip(e, t) {
  const a = e.cameraPathDraw;
  return !a?.active || !a.drawing || a.pointerId !== t.pointerId ? !1 : (ao(t), Qo(e, er(e, t)) && e.requestRender?.("camera-path-draw"), !0);
}
function zp(e, t) {
  const a = e.cameraPathDraw;
  return !a?.active || !a.drawing || a.pointerId !== t.pointerId ? !1 : (ao(t), t.type === "pointercancel" || t.type === "lostpointercapture" ? (Pe(e), !0) : (Qo(e, er(e, t)), a.drawing = !1, Tp(e), !0));
}
function Fp(e) {
  const t = e.cameraPathDraw;
  if (!t?.active || e.recording) return;
  const a = e.viewportCamera?.();
  if (!a || !e.ctx) return;
  const o = t.seedPoint && t.points[0] !== t.seedPoint ? [t.seedPoint, ...t.points] : t.points;
  if (!o.length) return;
  const n = o.map((c) => Ie(c, a, e.canvas.width, e.canvas.height)).filter((c) => c && Number.isFinite(c[0]) && Number.isFinite(c[1]));
  if (!n.length) return;
  const s = globalThis.getComputedStyle?.(e.root)?.getPropertyValue("--oc-accent")?.trim() || "#8b7de3", i = e.ctx;
  i.save(), i.strokeStyle = s, i.fillStyle = s, i.lineWidth = 2, i.setLineDash([7, 5]), i.beginPath(), i.moveTo(n[0][0], n[0][1]);
  for (const c of n.slice(1)) i.lineTo(c[0], c[1]);
  i.stroke(), i.setLineDash([]);
  for (const c of [n[0], n.at(-1)])
    i.beginPath(), i.arc(c[0], c[1], 4, 0, Math.PI * 2), i.fill();
  i.restore();
}
function Lp(e, t) {
  for (const a of e.root.querySelectorAll('[data-act="draw-camera-path"]'))
    a.addEventListener("click", () => {
      e.cameraPathDraw?.active ? Pe(e) : Fr(e);
    }, { signal: t });
  for (const a of e.root.querySelectorAll('[data-act="draw-camera-path-extend"]'))
    a.addEventListener("click", () => {
      e.cameraPathDraw?.active ? Pe(e) : Fr(e, { mode: "extend" });
    }, { signal: t });
  for (const a of e.root.querySelectorAll('[data-act="camera-path-presets"]'))
    a.addEventListener("click", () => e.openCameraPathPresetPicker(), { signal: t });
  e.root.addEventListener("contextmenu", (a) => {
    !(Date.now() <= Number(e.cameraPathSuppressContextMenuUntil || 0)) && !e.cameraPathDraw?.active || (a.preventDefault(), a.stopPropagation(), a.stopImmediatePropagation?.(), e.cameraPathSuppressContextMenuUntil = 0, e.cameraPathDraw?.active && Pe(e));
  }, { capture: !0, signal: t });
}
const Za = "/majoor/omnicam/scenes";
function Dn(e) {
  return e.sceneName || e.state?.metadata?.scene_name || "";
}
function Ja(e, t, a) {
  const o = e.api || (typeof window < "u" ? window.app?.api : null);
  if (!o?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return o.fetchApi(t, a);
}
function tr(e, t, { name: a = "", status: o } = {}) {
  const n = t && typeof t == "object" ? t : cn(), s = { ...n, metadata: { ...n.metadata || {}, scene_name: a || "" } };
  e.stateWidget && (e.stateWidget.value = JSON.stringify(s)), e.widthWidget && s.width != null && (e.widthWidget.value = s.width), e.heightWidget && s.height != null && (e.heightWidget.value = s.height), e.fpsWidget && s.fps != null && (e.fpsWidget.value = s.fps), e.durationWidget && s.fps && s.duration_frames != null && (e.durationWidget.value = s.duration_frames / s.fps), e.modeWidget && s.render_mode != null && (e.modeWidget.value = s.render_mode), e.cardWidget && (e.cardWidget.value = s.card_asset || ""), e.restoreFromWidgets(), e.sceneName = a || "", e.state && (e.state.metadata = { ...e.state.metadata, scene_name: e.sceneName }), e.serialize?.(), e.sceneBaseline = e.stateWidget?.value ?? JSON.stringify(s), e.refreshCameraPreviews?.(), e.syncUpstreamInputs?.(), e.setStatus?.(o || r("Scene loaded"));
}
async function Op(e) {
  await Ct(e, r("New Scene"), r("Start a new scene? Unsaved changes will be lost.")) && tr(e, cn(), { name: "", status: r("New scene") });
}
async function Kp(e) {
  if (!e.sceneBaseline) {
    e.setStatus?.(r("Nothing to revert to"));
    return;
  }
  if (!await Ct(
    e,
    r("Reset Scene"),
    r("Revert to the last saved or opened scene? Unsaved changes will be lost.")
  )) return;
  let a;
  try {
    a = JSON.parse(e.sceneBaseline);
  } catch {
    e.setStatus?.(r("The saved scene could not be read"));
    return;
  }
  const o = a?.metadata?.scene_name || Dn(e);
  tr(e, a, { name: o, status: r("Scene reset to last save") });
}
async function Dp(e) {
  const t = Dn(e) || r("Untitled"), a = await jt(e, r("Save Scene"), r("Scene name"), t);
  if (a == null) return;
  const o = String(a).trim();
  if (!o) {
    e.setStatus?.(r("The scene name cannot be empty"));
    return;
  }
  e.serialize?.();
  let n;
  try {
    n = JSON.parse(e.stateWidget?.value || "null") || e.state;
  } catch {
    n = e.state;
  }
  const s = JSON.parse(JSON.stringify(n));
  e.setStatus?.(r("Saving scene…"));
  try {
    const i = await Ja(e, Za, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: o, state: s })
    });
    if (!i.ok) throw new Error(await i.text());
    const c = await i.json();
    e.sceneName = c.name || o, e.state && (e.state.metadata = { ...e.state.metadata, scene_name: e.sceneName }), s.metadata = { ...s.metadata || {}, scene_name: e.sceneName }, e.sceneBaseline = JSON.stringify(s), e.setStatus?.(r("Scene saved: {name}").replace("{name}", e.sceneName));
  } catch (i) {
    console.error("[OmniCam] scene save failed", i), e.setStatus?.(r("Scene save failed: {error}").replace("{error}", String(i?.message || i).slice(0, 120)));
  }
}
async function Rp(e) {
  let t;
  try {
    const n = await Ja(e, Za);
    if (!n.ok) throw new Error(await n.text());
    t = (await n.json()).scenes || [];
  } catch (n) {
    console.error("[OmniCam] scene list failed", n), e.setStatus?.(r("The scenes could not be listed: {error}").replace("{error}", String(n?.message || n).slice(0, 120)));
    return;
  }
  if (!t.length) {
    e.setStatus?.(r("No saved scenes yet"));
    return;
  }
  const a = await fn({
    title: r("Open Scene"),
    owner: e,
    items: t.map((n) => ({
      id: n.slug,
      label: n.name || n.slug,
      sublabel: Np(n.modified)
    })),
    onDelete: async (n) => {
      const s = await Ja(e, `${Za}/${encodeURIComponent(n)}`, { method: "DELETE" });
      if (!s.ok) throw new Error(await s.text());
    }
  });
  if (!(!a || !await Ct(e, r("Open Scene"), r("Open this scene? Unsaved changes will be lost."))))
    try {
      const n = await Ja(e, `${Za}/${encodeURIComponent(a)}`);
      if (!n.ok) throw new Error(await n.text());
      const s = await n.json();
      tr(e, s.state, {
        name: s.name || a,
        status: r("Scene opened: {name}").replace("{name}", s.name || a)
      });
    } catch (n) {
      console.error("[OmniCam] scene open failed", n), e.setStatus?.(r("Scene open failed: {error}").replace("{error}", String(n?.message || n).slice(0, 120)));
    }
}
function Np(e) {
  if (!Number.isFinite(e)) return "";
  try {
    return new Date(e * 1e3).toLocaleString();
  } catch {
    return "";
  }
}
function Xa(e, t, a, o) {
  for (const n of a)
    n.addEventListener("click", () => {
      e.closeMenus?.(), Promise.resolve(o()).catch((s) => {
        console.error("[OmniCam] scene action failed", s), e.setStatus?.(String(s?.message || s).slice(0, 160));
      });
    }, { signal: t });
}
function qp(e, t) {
  Xa(e, t, e.root.querySelectorAll('[data-act="scene-new"]'), () => Op(e)), Xa(e, t, e.root.querySelectorAll('[data-act="scene-open"]'), () => Rp(e)), Xa(e, t, e.root.querySelectorAll('[data-act="scene-save"]'), () => Dp(e)), Xa(e, t, e.root.querySelectorAll('[data-act="scene-reset"]'), () => Kp(e));
}
const Bp = ["world_point", "object_point", "camera_field"], Lr = 40;
function Wp(e) {
  return (e.keys || []).map((t) => ({ x: t.x, y: t.y, t: t.time_seconds }));
}
function Vp(e, t, a) {
  const o = Math.max(1, Number(e.fps) || 24), n = e.width || 1280, s = e.height || 720, i = [];
  for (let c = 0; c <= Lr; c += 1) {
    const l = a * c / Lr, d = Bo(e, t.source, l * o, n, s);
    d && i.push({ x: d.x, y: d.y, t: l });
  }
  return i;
}
function Hp(e, t) {
  if (!e.length) return null;
  if (t <= e[0].t) return e[0];
  if (t >= e[e.length - 1].t) return e[e.length - 1];
  for (let a = 1; a < e.length; a += 1)
    if (e[a].t >= t) {
      const o = e[a - 1], n = e[a], s = (t - o.t) / Math.max(1e-6, n.t - o.t);
      return { x: o.x + (n.x - o.x) * s, y: o.y + (n.y - o.y) * s };
    }
  return e[e.length - 1];
}
function Rn(e, t, a) {
  const o = t / Math.max(1, a), n = e.width / Math.max(1, e.height);
  let s = e.width, i = e.height;
  return n > o ? s = i * o : i = s / o, { x: (e.width - s) / 2, y: (e.height - i) / 2, w: s, h: i };
}
function Up(e) {
  const t = e.root.querySelector('[data-role="motion-preview"]');
  if (!t || t.closest("[data-tab-panel]")?.hidden) return;
  const o = t.getBoundingClientRect();
  if (!o.width || !o.height) return;
  const n = Math.min(2, window.devicePixelRatio || 1), s = Math.round(o.width * n), i = Math.round(o.height * n);
  t.width !== s && (t.width = s), t.height !== i && (t.height = i);
  const c = t.getContext("2d");
  if (!c) return;
  const l = Rn(t, e.state.width || 1280, e.state.height || 720), d = (b) => l.x + b * l.w, p = (b) => l.y + b * l.h;
  c.save(), c.clearRect(0, 0, t.width, t.height), c.fillStyle = "#0b0b0f", c.fillRect(0, 0, t.width, t.height), c.fillStyle = "#0f0f14", c.fillRect(l.x, l.y, l.w, l.h), c.strokeStyle = "rgba(255,255,255,0.06)", c.lineWidth = 1;
  for (let b = 1; b < 3; b += 1)
    c.beginPath(), c.moveTo(d(b / 3), l.y), c.lineTo(d(b / 3), l.y + l.h), c.stroke(), c.beginPath(), c.moveTo(l.x, p(b / 3)), c.lineTo(l.x + l.w, p(b / 3)), c.stroke();
  const f = Math.max(1, Number(e.state.fps) || 24), u = Math.max(1 / f, (e.state.duration_frames || 120) / f), m = (e.frame || 0) / f;
  let h = 0;
  for (const b of e.state.motion_layers || []) {
    if (b.enabled === !1) continue;
    const x = Bp.includes(b.source_kind), g = x ? Vp(e.state, b, u) : Wp(b);
    if (!g.length) continue;
    h += 1;
    const k = b.id === e.state.selected_motion_layer_id;
    if (c.strokeStyle = k ? "#ffcc4d" : "rgba(65,217,197,0.6)", c.lineWidth = (k ? 2.4 : 1.5) * n, c.beginPath(), g.forEach(($, _) => {
      const I = d($.x), M = p($.y);
      _ ? c.lineTo(I, M) : c.moveTo(I, M);
    }), c.stroke(), !x) {
      c.fillStyle = k ? "#ffcc4d" : "#41d9c5";
      for (const $ of g)
        c.beginPath(), c.arc(d($.x), p($.y), (k ? 3.4 : 2.4) * n, 0, Math.PI * 2), c.fill();
    }
    const v = Hp(g, m);
    v && (c.fillStyle = k ? "#ffcc4d" : "#41d9c5", c.strokeStyle = "#fff", c.lineWidth = 1.4 * n, c.beginPath(), c.arc(d(v.x), p(v.y), 4.4 * n, 0, Math.PI * 2), c.fill(), c.stroke());
  }
  c.strokeStyle = "rgba(255,255,255,0.16)", c.lineWidth = 1, c.strokeRect(l.x + 0.5, l.y + 0.5, l.w - 1, l.h - 1), c.restore();
  const y = e.root.querySelector('[data-role="motion-preview-empty"]');
  y && (y.hidden = h > 0);
}
function Gp(e, t) {
  const a = e.root.querySelector('[data-role="motion-preview"]');
  a && a.addEventListener("click", (o) => {
    const n = a.getBoundingClientRect();
    if (!n.width || !n.height) return;
    const s = Rn(a, e.state.width || 1280, e.state.height || 720), i = a.width / n.width, c = {
      x: ((o.clientX - n.left) * i - s.x) / Math.max(1, s.w),
      y: ((o.clientY - n.top) * i - s.y) / Math.max(1, s.h)
    }, l = _i(e.state.motion_layers, c, 0.09);
    l && (e.state.selected_motion_layer_id = l.id, e.render());
  }, { signal: t });
}
function ye(e, t, a, o = "value") {
  for (const n of e.querySelectorAll(`[data-role="${t}"]`))
    n !== a && (n[o] = a[o]);
}
function Xp(e) {
  e.abortController = new AbortController();
  const t = e.abortController.signal, a = (o) => e.root.querySelector(o);
  Ei(e, t), $i(e, t), Gp(e, t), Om(e, a, t), yp(e, a, t), ol(e, t), Lp(e, t), qp(e, t), Tm(e, a, t), pp(e, t);
}
function Yp(e, t) {
  return Object.defineProperty(e, "omnicamMetrics", { value: Object.freeze({ ...t }), enumerable: !0 }), e;
}
function Zp(e, t) {
  const a = t?.omnicamMetrics || {}, o = Number(a.fps) || Number(e.state.fps), n = Number(a.requestedFrames) || Number(e.state.duration_frames), s = Number(a.width) || Number(e.canvas.width), i = Number(a.height) || Number(e.canvas.height), c = e.state.playblast_camera_id === ln ? Ro(e.state).map((l) => ({ camera_id: l.camera_id, start_frame: l.start, end_frame: l.end })) : [];
  return {
    format: "majoor.omnicam.playblast.v1",
    encoder: String(a.encoder || "unknown"),
    mime_type: String(t?.type || "video/webm"),
    fps: o,
    frame_count: n,
    duration_seconds: n / o,
    width: s,
    height: i,
    aspect_ratio: s / i,
    clean_capture: !0,
    drift_ms: Number(a.driftMs) || 0,
    cuts: c,
    // What Monitor compares its own live recompute against to warn when the
    // edit has moved on since this file was recorded. Computed from `ui.state`
    // as it stands right now -- recording holds the panel locked, so this is
    // the state that produced the pixels above.
    motion_scene_fingerprint: cl(e.state),
    // The material/lighting recipe these pixels were actually recorded with
    // (Guide Capture Style, decoupled from Viewport Shading / render_mode).
    // "auto" is stored as-is: Monitor is the one place "auto" resolution is
    // actually specified (the compiled prompt's semantics), not the Director.
    guide_style: e.state.guide_capture_style || "auto"
  };
}
function Jp(e, t) {
  const a = Zp(e, t);
  return e.state.metadata = { ...e.state.metadata || {}, playblast: a }, a;
}
let ko = null, wo = null;
function Ne(e, t) {
  if (!e || !t) return !1;
  const a = Number(t.videoWidth || t.naturalWidth || t.width) || 0, o = Number(t.videoHeight || t.naturalHeight || t.height) || 0;
  if (!a || !o) return !1;
  const n = a / o, s = Number(e.size?.[1]) || 3, i = Math.round(s * n * 1e3) / 1e3, c = Number(e.size?.[0]) || 2;
  return Math.abs(c - i) > 1e-3 ? (e.size = [i, s, Number(e.size?.[2]) || 0.01], !0) : !1;
}
function Qp(e = 512, t = 768) {
  if (typeof document > "u" || !document.createElement)
    return null;
  const a = document.createElement("canvas");
  a.width = e, a.height = t;
  const o = a.getContext("2d");
  if (!o) return a;
  const n = (A, B, w, E, z) => {
    typeof o.roundRect == "function" ? (o.beginPath(), o.roundRect(A, B, w, E, z)) : (o.beginPath(), o.moveTo(A + z, B), o.lineTo(A + w - z, B), o.quadraticCurveTo(A + w, B, A + w, B + z), o.lineTo(A + w, B + E - z), o.quadraticCurveTo(A + w, B + E, A + w - z, B + E), o.lineTo(A + z, B + E), o.quadraticCurveTo(A, B + E, A, B + E - z), o.lineTo(A, B + z), o.quadraticCurveTo(A, B, A + z, B), o.closePath());
  }, s = o.createLinearGradient(0, 0, e, t);
  s.addColorStop(0, "#0b0f17"), s.addColorStop(0.5, "#141b27"), s.addColorStop(1, "#0a0e16"), o.fillStyle = s, o.fillRect(0, 0, e, t);
  const i = e / 2, c = t * 0.42, l = o.createRadialGradient(i, c, 20, i, c, e * 0.65);
  l.addColorStop(0, "rgba(56, 189, 248, 0.16)"), l.addColorStop(0.45, "rgba(30, 41, 59, 0.35)"), l.addColorStop(1, "rgba(10, 14, 22, 0)"), o.fillStyle = l, o.fillRect(0, 0, e, t), o.save(), o.strokeStyle = "rgba(148, 163, 184, 0.07)", o.lineWidth = 1;
  const d = 32;
  for (let A = d; A < e; A += d)
    o.beginPath(), o.moveTo(A, 0), o.lineTo(A, t), o.stroke();
  for (let A = d; A < t; A += d)
    o.beginPath(), o.moveTo(0, A), o.lineTo(e, A), o.stroke();
  typeof o.setLineDash == "function" && o.setLineDash([4, 6]), o.strokeStyle = "rgba(56, 189, 248, 0.12)", o.beginPath(), o.moveTo(e / 3, 0), o.lineTo(e / 3, t), o.moveTo(e * 2 / 3, 0), o.lineTo(e * 2 / 3, t), o.moveTo(0, t / 3), o.lineTo(e, t / 3), o.moveTo(0, t * 2 / 3), o.lineTo(e, t * 2 / 3), o.stroke(), typeof o.setLineDash == "function" && o.setLineDash([]), o.restore(), o.save(), o.strokeStyle = "#38bdf8", o.lineWidth = 2.5;
  const p = 24, f = 28;
  o.beginPath(), o.moveTo(p, p + f), o.lineTo(p, p), o.lineTo(p + f, p), o.stroke(), o.beginPath(), o.moveTo(e - p - f, p), o.lineTo(e - p, p), o.lineTo(e - p, p + f), o.stroke(), o.beginPath(), o.moveTo(p, t - p - f), o.lineTo(p, t - p), o.lineTo(p + f, t - p), o.stroke(), o.beginPath(), o.moveTo(e - p - f, t - p), o.lineTo(e - p, t - p), o.lineTo(e - p, t - p - f), o.stroke(), o.restore();
  const u = t * 0.44;
  o.save(), o.strokeStyle = "rgba(56, 189, 248, 0.35)", o.lineWidth = 1.5, o.beginPath(), o.arc(i, u, 56, 0, Math.PI * 2), o.stroke(), o.strokeStyle = "rgba(56, 189, 248, 0.18)", o.beginPath(), o.arc(i, u, 82, 0, Math.PI * 2), o.stroke(), o.strokeStyle = "rgba(56, 189, 248, 0.55)", o.beginPath(), o.moveTo(i - 16, u), o.lineTo(i + 16, u), o.moveTo(i, u - 16), o.lineTo(i, u + 16), o.stroke(), o.restore(), o.save();
  const m = t * 0.31, h = 34;
  o.fillStyle = "#182234", o.strokeStyle = "rgba(56, 189, 248, 0.85)", o.lineWidth = 2, o.beginPath(), o.ellipse(i, m, h * 0.82, h, 0, 0, Math.PI * 2), o.fill(), o.stroke(), o.strokeStyle = "rgba(56, 189, 248, 0.4)", o.lineWidth = 1.2, o.beginPath(), o.moveTo(i - 14, m - 2), o.lineTo(i + 14, m - 2), o.stroke();
  const y = m + h, b = y + 22, x = t * 0.63;
  o.fillStyle = "#182234", o.strokeStyle = "rgba(56, 189, 248, 0.85)", o.lineWidth = 2, o.beginPath(), o.moveTo(i - 11, y), o.bezierCurveTo(i - 18, b - 8, i - 60, b, i - 88, b + 24), o.bezierCurveTo(i - 96, b + 50, i - 82, x - 20, i - 66, x), o.lineTo(i + 66, x), o.bezierCurveTo(i + 82, x - 20, i + 96, b + 50, i + 88, b + 24), o.bezierCurveTo(i + 60, b, i + 18, b - 8, i + 11, y), o.closePath(), o.fill(), o.stroke(), o.strokeStyle = "rgba(56, 189, 248, 0.28)", o.lineWidth = 1.2, o.beginPath(), o.moveTo(i, y + 12), o.lineTo(i, x - 10), o.stroke(), o.beginPath(), o.ellipse(i, b + 36, 44, 18, 0, 0, Math.PI), o.stroke(), o.restore(), o.save(), o.fillStyle = "rgba(148, 163, 184, 0.55)", o.font = "10px monospace", o.textAlign = "right";
  const g = e - p - 6, k = [
    { label: "1.8m", y: m - h },
    { label: "1.5m", y: u },
    { label: "1.0m", y: x },
    { label: "0.5m", y: t * 0.82 }
  ];
  for (const A of k)
    o.fillText(A.label, g - 12, A.y + 3), o.strokeStyle = "rgba(148, 163, 184, 0.35)", o.lineWidth = 1, o.beginPath(), o.moveTo(g - 8, A.y), o.lineTo(g, A.y), o.stroke();
  o.restore(), o.save();
  const v = 180, $ = 28, _ = i - v / 2, I = p + 10;
  n(_, I, v, $, 14), o.fillStyle = "rgba(15, 23, 42, 0.9)", o.fill(), o.strokeStyle = "rgba(56, 189, 248, 0.45)", o.lineWidth = 1.2, o.stroke(), o.fillStyle = "#38bdf8", o.beginPath(), o.arc(_ + 18, I + $ / 2, 4, 0, Math.PI * 2), o.fill(), o.fillStyle = "#f1f5f9", o.font = "bold 11px system-ui, -apple-system, sans-serif", o.textAlign = "left", o.fillText("SUBJECT PROXY", _ + 30, I + 18), o.restore(), o.save(), o.textAlign = "center", o.fillStyle = "#f8fafc", o.font = "bold 22px system-ui, -apple-system, sans-serif", o.fillText("SUBJECT CARD", i, t * 0.73), o.fillStyle = "#94a3b8", o.font = "italic 13px system-ui, -apple-system, sans-serif", o.fillText("No input image connected", i, t * 0.775);
  const M = t * 0.85, L = 250, O = 32;
  return n(i - L / 2, M - O / 2, L, O, 6), o.fillStyle = "rgba(30, 41, 59, 0.75)", o.fill(), o.strokeStyle = "rgba(56, 189, 248, 0.3)", o.lineWidth = 1, o.stroke(), o.fillStyle = "#38bdf8", o.font = "12px system-ui, -apple-system, sans-serif", o.fillText("Connect IMAGE node or load file", i, M + 4), o.strokeStyle = "rgba(56, 189, 248, 0.3)", o.lineWidth = 1.5, o.strokeRect(1, 1, e - 2, t - 2), o.restore(), a;
}
function Nn(e = 512, t = 768) {
  return ko || (ko = Qp(e, t)), ko;
}
function Ju(e) {
  if (!e) return null;
  if (wo) return wo;
  const t = Nn();
  if (!t) return null;
  const a = new e.CanvasTexture(t);
  return a.colorSpace = e.SRGBColorSpace, a.needsUpdate = !0, a.userData.omnicamSharedResource = !0, wo = a, a;
}
function Or(e, t, { frameCount: a = 0, fps: o = 0 } = {}) {
  const n = Math.round(Number(t?.videoWidth || t?.naturalWidth) || 0), s = Math.round(Number(t?.videoHeight || t?.naturalHeight) || 0), i = Math.round(Number(o) || Number(e.state?.fps) || Number(e.fpsWidget?.value) || 24), c = Number(t?.duration) > 0 ? Math.round(Number(t.duration) * i) : 0, l = Math.round(Number(a) || c || 0);
  if (!n || !s) return !1;
  const d = t?.currentSrc || t?.src || t;
  e.__lastUpstreamMediaKey !== d && (e.__lastUpstreamMediaKey = d, e.durationManuallySet = !1), e.widthWidget && (e.widthWidget.value = n), e.heightWidget && (e.heightWidget.value = s), i && e.fpsWidget && (e.fpsWidget.value = i), !e.durationManuallySet && l && i && e.durationWidget && (e.durationWidget.value = Math.max(0.25, l / i)), e.syncFromWidgets();
  const p = e.state?.objects?.find((f) => f.id === "subject");
  return p && Ne(p, t), !0;
}
const Be = 1024 * 1024, ef = Object.freeze({
  card: 128 * Be,
  // MAX_CARD_BYTES
  model: 256 * Be,
  // MAX_MODEL_BYTES
  fbx: 64 * Be,
  // MAX_FBX_MODEL_BYTES
  image: 128 * Be,
  // background stills go through the card/asset route
  audio: 128 * Be
  // no upload, but decodeAudioData still buffers it all
}), Kr = 2e3;
function Dr(e) {
  return `${(e / Be).toFixed(e >= 10 * Be ? 0 : 1)} MB`;
}
function _t(e, t) {
  const a = ef[t];
  if (!e || !a) return null;
  const o = Number(e.size);
  return !Number.isFinite(o) || o <= a ? null : `${e.name || "File"} is ${Dr(o)}; the maximum is ${Dr(a)}.`;
}
function tf(e) {
  return Number(e) <= Kr ? null : `${e} frames selected; a background sequence is limited to ${Kr}.`;
}
function af(e) {
  const t = e.audioElement;
  return !t || t.paused || !Number.isFinite(t.currentTime) ? null : Math.round(t.currentTime * Math.max(1, e.state.fps));
}
function So(e, t) {
  const a = e.audioElement;
  if (!a) return;
  const o = Math.max(0, t / Math.max(1, e.state.fps));
  if (!(o >= (e.audioDuration || 0)))
    try {
      a.currentTime = o;
    } catch {
    }
}
function of(e) {
  if (e.playing) return Qa(e);
  e.playing = !0;
  for (const p of e.root.querySelectorAll('[data-act="play"]')) {
    p.classList.add("playing");
    const f = p.querySelector("i");
    f && (f.className = "pi pi-pause");
  }
  const t = e.state.playback_range, a = t ? t[0] : 0, o = t ? t[1] : e.state.duration_frames - 1;
  let n = e.frame >= o || e.frame < a ? a : e.frame, s = null;
  e.audioElement && (So(e, n), Promise.resolve(e.audioElement.play()).catch(() => {
  }));
  const i = 1e3 / e.state.fps;
  let c = performance.now(), l = 0;
  const d = (p) => {
    if (!e.playing) return;
    const f = af(e);
    if (f === null) {
      for (l += p - c, c = p; l >= i; )
        if (l -= i, n += 1, n > o) {
          if (!e.state.loop_playback) return void Qa(e);
          n = a;
        }
    } else if (c = p, l = 0, n = f, n > o) {
      if (!e.state.loop_playback) return void Qa(e);
      n = a, So(e, a);
    } else n < a && (n = a, So(e, a));
    n !== s && (s = n, e.setFrame(n, !0, !1)), e.playTimer = requestAnimationFrame(d);
  };
  e.playTimer = requestAnimationFrame(d);
}
function Qa(e) {
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
function oo(e) {
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
function qn(e) {
  const t = e.audioSamples;
  if (!t || !t.data?.length) {
    e.audioWaveformPeaks = null;
    return;
  }
  const { data: a, sampleRate: o } = t, n = e.state.duration_frames / Math.max(1, e.state.fps), s = Math.min(a.length, Math.floor(n * o)), i = Math.min(600, Math.max(100, e.state.duration_frames * 4)), c = Math.max(1, Math.floor(s / i)), l = [];
  for (let d = 0; d < i; d++) {
    let p = 0;
    const f = d * c, u = Math.min(s, f + c);
    for (let m = f; m < u; m++) {
      const h = Math.abs(a[m] || 0);
      h > p && (p = h);
    }
    l.push(p);
  }
  e.audioWaveformPeaks = l, e.refreshKeys();
}
async function rf(e, { load: t = () => import("./vendor-mediabunny-CZ5VNE-V.js") } = {}) {
  const { ALL_FORMATS: a, AudioSampleSink: o, BlobSource: n, Input: s } = await t(), c = await new s({ formats: a, source: new n(e) }).getPrimaryAudioTrack();
  if (!c) return null;
  const l = [];
  let d = 0, p = 0;
  for await (const m of new o(c).samples())
    try {
      p = p || m.sampleRate;
      const h = { planeIndex: 0, format: "f32-planar" }, y = new Float32Array(m.allocationSize(h) / Float32Array.BYTES_PER_ELEMENT);
      m.copyTo(y, h), l.push(y), d += y.length;
    } finally {
      m.close();
    }
  if (!d || !p) return null;
  const f = new Float32Array(d);
  let u = 0;
  for (const m of l)
    f.set(m, u), u += m.length;
  return { data: f, sampleRate: p };
}
function nf(e) {
  return Number.isFinite(e.duration) && e.duration > 0 ? Promise.resolve() : new Promise((t) => {
    const a = () => {
      e.removeEventListener("loadedmetadata", a), e.removeEventListener("error", a), t();
    };
    e.addEventListener("loadedmetadata", a), e.addEventListener("error", a);
  });
}
async function sf(e, t, { decode: a = rf } = {}) {
  if (!t) return;
  const o = _t(t, "audio");
  if (o) {
    e.setStatus(o);
    return;
  }
  oo(e);
  try {
    const n = URL.createObjectURL(t), s = new Audio();
    s.preload = "auto", s.src = n, e.audioObjectUrl = n, e.audioElement = s, await nf(s), e.audioDuration = Number.isFinite(s.duration) ? s.duration : 0;
    try {
      e.audioSamples = await a(t);
    } catch {
      e.audioSamples = null;
    }
    qn(e), e.setStatus(`Audio loaded: ${t.name || "track"}`);
  } catch (n) {
    oo(e), e.setStatus(`Failed to load audio: ${n.message || n}`);
  }
}
let et = null;
function Bn({ api: e }) {
  et = e;
}
const Wn = /* @__PURE__ */ new WeakSet(), xt = /* @__PURE__ */ new WeakMap();
function ro(e) {
  if (!(typeof HTMLVideoElement > "u" || !(e instanceof HTMLVideoElement)))
    try {
      e.pause(), e.removeAttribute("src"), e.srcObject = null, e.load();
    } catch {
    }
}
function cf(e) {
  e && typeof e == "object" && xt.set(e, (xt.get(e) || 0) + 1);
}
function lf(e) {
  if (!e || typeof e != "object") return;
  const t = xt.get(e) || 0;
  if (t > 1) {
    xt.set(e, t - 1);
    return;
  }
  xt.delete(e), Wn.has(e) && ro(e);
}
function Et(e, t) {
  const a = e.cardMediaById.get(t);
  a && (e.cardMediaById.delete(t), e.cardMediaAssetById?.delete?.(t), t === "subject" && e.cardMedia === a && (e.cardMedia = null), lf(a));
}
function df(e) {
  for (const t of [...e.cardMediaById?.keys?.() || []]) Et(e, t);
}
function qe(e, t, a, o = !1, n = "") {
  const s = e.cardMediaById.get(t);
  if (s === a) {
    e.cardMediaAssetById ||= /* @__PURE__ */ new Map(), e.cardMediaAssetById.set(t, n || a?.__omnicamAsset || "");
    try {
      a.__omnicamAsset = n || a.__omnicamAsset || "";
    } catch {
    }
    t === "subject" && (e.cardMedia = a);
    return;
  }
  s && s !== a && Et(e, t), o && Wn.add(a), cf(a), e.cardMediaAssetById ||= /* @__PURE__ */ new Map(), e.cardMediaById.set(t, a), e.cardMediaAssetById.set(t, n || a?.__omnicamAsset || "");
  try {
    a.__omnicamAsset = n || a.__omnicamAsset || "";
  } catch {
  }
  t === "subject" && (e.cardMedia = a);
}
function Vn(e, t, { signal: a, timeout: o = 15e3 } = {}) {
  return new Promise((n, s) => {
    if (a?.aborted) return s(new DOMException("Operation cancelled", "AbortError"));
    let i = null;
    const c = () => {
      i !== null && clearTimeout(i), a?.removeEventListener?.("abort", l);
      for (const p of t) e.removeEventListener?.(p, d);
    }, l = () => {
      c(), s(new DOMException("Operation cancelled", "AbortError"));
    }, d = (p) => {
      c(), n(p);
    };
    for (const p of t) e.addEventListener?.(p, d, { once: !0 });
    a?.addEventListener?.("abort", l, { once: !0 }), o > 0 && (i = setTimeout(() => {
      c(), s(new Error(`Timed out waiting for ${t.join("/")}`));
    }, o));
  });
}
async function Hn(e, t, a, o = () => !0, n = null) {
  if (!t || !a) return;
  const s = () => !e.disposed && o(), i = String(t.asset || a).toLowerCase();
  if (n ?? /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/.test(i)) {
    const l = document.createElement("video");
    if (l.src = a, l.loop = !0, l.muted = !0, l.playsInline = !0, await Vn(l, ["loadeddata", "error"], { signal: e.abortController?.signal }).catch(() => {
    }), !s()) {
      ro(l);
      return;
    }
    if (await l.play().catch(() => {
    }), !s()) {
      ro(l);
      return;
    }
    qe(e, t.id, l, !0, t.asset || a), Ne(t, l);
  } else {
    const l = new Image();
    if (l.src = a, await l.decode().catch(() => {
    }), !s()) {
      l.src = "";
      return;
    }
    qe(e, t.id, l, !0, t.asset || a), Ne(t, l);
  }
  return e.disposed ? null : (e.render(), e.cardMediaById.get(t.id) || null);
}
async function mf(e, t) {
  if (!et?.fetchApi || !/\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(e)) return null;
  const a = await et.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: { kind: "annotated_input", value: e } }),
    signal: t
  });
  return a.ok && (await a.json())?.info || null;
}
function Xe(e, t = "") {
  const a = String(e || ""), o = a.match(/\s+\[(input|output|temp)\]$/), n = o ? a.slice(0, o.index) : a, s = o?.[1] || "input";
  return `${t && !n.includes("/") && !n.includes("\\") ? `${t}/${n}` : n} [${s}]`;
}
function pf(e) {
  const t = (e.assetRestoreGeneration || 0) + 1;
  e.assetRestoreGeneration = t;
  const a = () => !e.disposed && e.assetRestoreGeneration === t;
  if (e.state.viewport_bg_image) {
    const o = new Image();
    o.src = Re(e.state.viewport_bg_image), o.decode().catch(() => {
    }), e.viewportBgImage = o;
  }
  e.viewportBgSequenceImages = (e.state.viewport_bg_sequence || []).map((o) => {
    const n = new Image();
    return n.src = Re(o), n.decode().catch(() => {
    }), n;
  });
  for (const o of e.state.objects) {
    if (!o.asset) {
      (o.type === "model" || o.type === "glb") && (o.load_error = r("Not saved to the ComfyUI input folder: this model will be missing after a reload.")), o.type === "card" && Et(e, o.id);
      continue;
    }
    const n = Re(o.asset);
    o.type === "glb" || o.type === "model" ? e.modelUrlsById.set(o.id, n) : o.type === "card" && e.cardMediaAssetById?.get?.(o.id) !== o.asset && e.loadMediaUrl(o, n, a);
  }
}
function ff(e, t) {
  e.modelInfoById.set(t.id, t);
  const a = e.state.objects.find((o) => o.id === t.id);
  if (t.error) {
    a && (a.load_error = t.error), e.setStatus(`⚠️ ${t.error}`), e.refreshObjects(), t.id === e.selectedObjectId && e.refreshInspector();
    return;
  }
  a && (a.load_error = null), a?.animation_index && e.webgl?.selectAnimation(t.id, a.animation_index), t.id === e.selectedObjectId && e.refreshInspector(), !t.meshes && !t.points && t.bones ? e.setStatus(r("{value1} animation only: {value2} bones, no mesh · skeleton preview", { value1: t.format.toUpperCase(), value2: t.bones })) : e.setStatus(r("{value1} loaded: {value2} mesh{value3}, {value4} vertices", { value1: t.format.toUpperCase(), value2: t.meshes, value3: t.meshes === 1 ? "" : "es", value4: t.vertices }));
}
async function hf(e, t) {
  if (!t) return;
  const a = t.name.split(".").pop()?.toLowerCase();
  if (!["glb", "obj", "fbx", "stl", "ply"].includes(a)) return e.setStatus(r("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first."));
  const o = _t(t, a === "fbx" ? "fbx" : "model");
  if (o) return e.setStatus(o);
  e.checkpoint?.("Import model");
  const n = `model_${Date.now().toString(36)}`, s = {
    id: n,
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
  e.state.objects.push(s), e.selectedEntity = "object", e.selectedObjectId = n, e.selectedObjectIds = /* @__PURE__ */ new Set([n]), e.selectedKeyFrame = null;
  const i = e.objectUrls.replace(n, t);
  e.modelUrlsById.set(n, i), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(r("Uploading {format}…").replace("{format}", a.toUpperCase()));
  try {
    const c = await Go(et, { route: "/majoor/omnicam/upload_model", field: "asset", file: t });
    if (e.disposed || !e.state.objects.includes(s)) return;
    if (!c?.path) throw new Error("upload returned no managed path");
    s.asset = c.path, s.load_error = null, e.serialize();
    const l = e.modelInfoById.get(n);
    l ? e.onModelLoaded(l) : e.setStatus(r("{format} imported: {name}").replace("{format}", a.toUpperCase()).replace("{name}", c.name || s.name));
  } catch (c) {
    if (e.disposed || !e.state.objects.includes(s)) return;
    console.error("[OmniCam] model upload failed", c), s.load_error = r("Not saved to the ComfyUI input folder: this model will be missing after a reload."), e.serialize(), e.refreshObjects(), e.setStatus(r("{format} shown locally, but the upload failed — it will not survive a reload.").replace("{format}", a.toUpperCase()));
  }
}
async function uf(e, t) {
  if (!t) return;
  const a = _t(t, "card");
  if (a) return e.setStatus(a);
  const o = e.selectedObject()?.type === "card" ? e.selectedObject() : e.state.objects.find((n) => n.id === "subject");
  if (o) {
    if (e.checkpoint?.("Replace card media"), e.cardUrl = e.objectUrls.replace(o.id, t), t.type.startsWith("video/")) {
      const n = document.createElement("video");
      if (n.src = e.cardUrl, n.loop = !0, n.muted = !0, n.playsInline = !0, await n.play().catch(() => {
      }), e.disposed) {
        ro(n);
        return;
      }
      qe(e, o.id, n, !0, e.cardUrl), Ne(o, n);
    } else {
      const n = new Image();
      if (n.src = e.cardUrl, await n.decode().catch(() => {
      }), e.disposed) {
        n.src = "";
        return;
      }
      qe(e, o.id, n, !0, e.cardUrl), Ne(o, n);
    }
    e.render(), e.setStatus(r("Uploading card…"));
    try {
      const n = await Go(et, { route: "/majoor/omnicam/upload_asset", field: "asset", file: t });
      if (e.disposed || !e.state.objects.includes(o)) return;
      o.asset = n.path, e.cardMediaAssetById?.set?.(o.id, n.path), o.id === "subject" && (e.state.card_asset = n.path, e.cardWidget && (e.cardWidget.value = n.path)), e.serialize(), e.setStatus(r("Card: {value1}", { value1: n.name }));
    } catch (n) {
      if (e.disposed || !e.state.objects.includes(o)) return;
      console.error(n), e.setStatus(r("Card loaded locally; backend upload failed"));
    }
  }
}
function bf(e, t) {
  e.executionReferences = Array.isArray(t?.images) ? t.images : [];
  const a = e.root.querySelector('[data-role="reference-select"]');
  if (a.innerHTML = "", e.executionReferences.forEach((o, n) => {
    const s = document.createElement("option");
    s.value = String(n), s.textContent = o.filename || r("Upstream {value1}", { value1: n + 1 }), a.appendChild(s);
  }), !e.executionReferences.length) {
    const o = document.createElement("option");
    o.value = "0", o.textContent = r("No upstream reference"), a.appendChild(o);
    return;
  }
  e.state.reference_index = U(e.state.reference_index || 0, 0, e.executionReferences.length - 1), a.value = String(e.state.reference_index), e.serialize(), e.loadSelectedReference();
}
function gf(e) {
  const t = e.executionReferences[e.state.reference_index];
  if (!t) return;
  const a = new Image();
  a.onload = () => {
    if (e.disposed) return;
    qe(e, "subject", a, !1, a.src);
    const o = e.state.objects.find((n) => n.id === "subject");
    o && Ne(o, a), e.render(), e.setStatus(r("Upstream media refreshed"));
  }, a.src = et.apiURL(`/view?${new URLSearchParams(t).toString()}`);
}
async function yf(e) {
  if (!e.node) return;
  const t = e.node.graph;
  if (!t) return;
  const a = (e.upstreamSyncId || 0) + 1;
  e.upstreamSyncId = a, e.upstreamFetchController?.abort();
  const o = new AbortController();
  e.upstreamFetchController = o;
  const n = () => !e.disposed && e.upstreamSyncId === a;
  let s = !1;
  const i = e.node.inputs || [];
  let c = !1, l = !1;
  const d = /* @__PURE__ */ new Set();
  for (const f of i) {
    const u = String(f.name || "").toLowerCase();
    if (f.link == null) continue;
    const m = Jc(t, f.link);
    if (m) {
      if (u === "image" || u === "video") {
        c = !0;
        const h = m.widgets?.find(
          (y) => ["image", "image_path", "upload", "file", "filename", "video", "video_path"].includes(String(y.name).toLowerCase())
        );
        if (h && h.value) {
          const y = String(h.value), b = /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(y), x = m.widgets?.find((v) => String(v.name).toLowerCase() === "subfolder")?.value || "", g = Re(Xe(y, x)), k = e.state.objects.find((v) => v.id === "subject");
          if (k) {
            const v = await Hn(e, k, g, n, b);
            if (!n()) return;
            k.asset = Xe(y, x);
            let $ = null;
            if (b)
              try {
                $ = await mf(y, o.signal);
              } catch (_) {
                if (_?.name === "AbortError") return;
                console.warn("Failed to describe upstream video:", _);
              }
            n() && Or(e, v, {
              fps: $?.fps,
              frameCount: b ? $?.frame_count : 1
            }), e.upstreamImageConnected = !0, s = !0, e.setStatus(r("Upstream {value1}: {value2}", { value1: b ? "video" : "image", value2: y }));
          }
        } else {
          const y = Qc(m);
          if (y) {
            y instanceof HTMLVideoElement && y.paused && y.play().catch(() => {
            }), qe(e, "subject", y, !1, y.currentSrc || y.src || ""), Or(e, y, { frameCount: y instanceof HTMLVideoElement ? 0 : 1 });
            const b = e.state.objects.find((x) => x.id === "subject");
            b && Ne(b, y), e.upstreamImageConnected = !0, s = !0, e.render(), e.setStatus(y instanceof HTMLVideoElement ? r("Upstream video preview synced") : r("Upstream image preview synced"));
          }
        }
      }
      if (u === "audio") {
        l = !0;
        const h = m.widgets?.find(
          (y) => ["audio", "audio_path", "audio_file", "file", "filename"].includes(String(y.name).toLowerCase())
        );
        if (h && h.value) {
          const y = String(h.value), b = m.widgets?.find((g) => String(g.name).toLowerCase() === "subfolder")?.value || "", x = Re(Xe(y, b));
          try {
            const g = await fetch(x, { signal: o.signal });
            if (g.ok) {
              const k = await g.blob();
              if (!n()) return;
              const v = new File([k], y, { type: k.type || "audio/wav" });
              await e.loadAudioFile(v), e.upstreamAudioConnected = !0, s = !0, e.setStatus(r("Upstream audio: {value1}", { value1: y }));
            }
          } catch (g) {
            if (g?.name === "AbortError") return;
            console.warn("Failed to fetch upstream audio:", g);
          }
        }
      }
      if (u === "scene_3d" || u === "model" || u === "mesh") {
        const h = m.widgets?.find(
          (y) => ["model_file", "model", "file", "filename", "filepath", "mesh", "scene", "3d_file"].includes(String(y.name).toLowerCase())
        );
        if (h && h.value) {
          const y = String(h.value), b = y.split(".").pop()?.toLowerCase();
          if (["glb", "gltf", "obj", "fbx", "stl", "ply"].includes(b)) {
            const x = m.widgets?.find(($) => String($.name).toLowerCase() === "subfolder")?.value || "", g = Re(Xe(y, x)), k = `upstream_scene_${m.id}`;
            d.add(k);
            let v = e.state.objects.find(($) => $.id === k);
            v ? (v.asset = Xe(y, x), v.format = b === "gltf" ? "glb" : b) : (v = {
              id: k,
              type: "model",
              format: b === "gltf" ? "glb" : b,
              name: `Upstream: ${y.replace(/\.[^.]+$/i, "")}`,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              size: [1, 1, 1],
              material_mode: "textured",
              keyframes: [],
              enabled: !0,
              asset: Xe(y, x)
            }, e.state.objects.push(v)), e.modelUrlsById.set(k, g), e.serialize(), e.refreshObjects(), e.render(), s = !0, e.setStatus(r("Upstream 3D model: {value1}", { value1: y }));
          }
        }
      }
    }
  }
  if (!c && e.upstreamImageConnected) {
    Et(e, "subject");
    const f = e.state.objects.find((u) => u.id === "subject");
    f && (f.asset = "", f.size = [2, 3, f.size?.[2] || 0.01]), e.upstreamImageConnected = !1, s = !0, e.setStatus(r("Upstream image disconnected · card reset"));
  }
  !l && e.upstreamAudioConnected && (oo(e), e.upstreamAudioConnected = !1, e.refreshKeys(), s = !0, e.setStatus(r("Upstream audio disconnected · audio track cleared")));
  const p = e.state.objects.filter(
    (f) => f.id.startsWith("upstream_scene_") && !d.has(f.id)
  );
  if (p.length > 0) {
    for (const f of p)
      e.modelUrlsById.delete(f.id), e.modelInfoById.delete(f.id), e.webgl?.removeModel(f.id);
    e.state.objects = e.state.objects.filter(
      (f) => !p.some((u) => u.id === f.id)
    ), e.refreshObjects(), s = !0, e.setStatus(r("Upstream 3D scene disconnected · model removed"));
  }
  zc(e) && (s = !0), s && (e.serialize(), e.render());
}
const vf = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"], Rr = { low: 3e6, balanced: 6e6, high: 12e6 };
function xf(e) {
  return Rr[e] || Rr.balanced;
}
async function kf({
  canvas: e,
  fps: t,
  frameCount: a,
  renderFrame: o,
  quality: n = "balanced",
  mediaRecorder: s = globalThis.MediaRecorder,
  signal: i,
  now: c = () => globalThis.performance?.now?.() ?? Date.now(),
  sleep: l = (p) => new Promise((f) => setTimeout(f, p)),
  onMetrics: d
}) {
  if (!s || !e.captureStream) throw new Error("MediaRecorder unsupported in this browser");
  const p = e.captureStream(t);
  let f;
  try {
    for (const k of vf)
      if (!(s.isTypeSupported && !s.isTypeSupported(k)))
        try {
          f = new s(p, { mimeType: k, videoBitsPerSecond: xf(n) });
          break;
        } catch {
        }
    if (!f) throw new Error("Cannot create MediaRecorder");
    const u = [];
    f.ondataavailable = (k) => {
      k.data.size && u.push(k.data);
    };
    const m = new Promise((k, v) => {
      f.addEventListener("stop", k, { once: !0 }), f.addEventListener("error", () => v(f.error || new Error("MediaRecorder failed")), { once: !0 });
    });
    f.start(100);
    const h = c();
    for (let k = 0; k < a; k++) {
      if (i?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await o(k), await l(1e3 / t);
    }
    f.stop(), await m;
    const y = Math.max(0, c() - h), b = a / t * 1e3, x = {
      encoder: "media_recorder",
      requestedFrames: a,
      expectedDurationMs: b,
      recordedDurationMs: y,
      driftMs: y - b,
      fps: t,
      width: e.width,
      height: e.height
    };
    d?.(x);
    const g = new Blob(u, { type: f.mimeType || "video/webm" });
    return Yp(g, x);
  } finally {
    f?.state === "recording" && f.stop(), p.getTracks().forEach((u) => u.stop());
  }
}
async function wf(e, t) {
  const a = t.type.startsWith("video/mp4") ? "mp4" : "webm", o = new FormData();
  o.append("video", t, `omnicam_playblast.${a}`);
  const n = await e.fetchApi("/majoor/omnicam/upload_playblast", { method: "POST", body: o });
  if (!n.ok) throw new Error(await n.text());
  return n.json();
}
async function Sf(e) {
  await Promise.all([...e].filter((t) => t instanceof HTMLVideoElement && t.seeking).map((t) => Vn(t, ["seeked", "error"], { timeout: 5e3 }).catch(() => {
  })));
}
async function Un(e) {
  await Sf(e.cardMediaById.values());
}
async function Gn(e) {
  return kf({
    canvas: e.canvas,
    fps: e.state.fps,
    frameCount: e.state.duration_frames,
    quality: e.state.playblast_quality,
    renderFrame: (t) => e.setFrame(t, !0),
    signal: e.abortController?.signal
  });
}
async function Xn(e, t) {
  const a = await wf(Ve, t);
  if (Jp(e, t), e.state.playblast_camera_id === ln)
    e.state.sequence = { ...e.state.sequence || {}, recording_path: a.path };
  else {
    const o = e.state.cameras.find((n) => n.id === e.state.playblast_camera_id);
    o && (o.recording_path = a.path);
  }
  e.recordingWidget && (e.recordingWidget.value = a.path), e.serialize(), e.setStatus(r("Playblast ready: {value1}", { value1: a.name }));
}
function jf(e) {
  const t = { width: e.canvas.width, height: e.canvas.height }, a = e.state.playblast_resolution || "output";
  if (a === "viewport") return t;
  const o = a === "half" ? 0.5 : a === "double" ? 2 : 1, n = Math.max(16, Math.round(Number(e.state.width) || t.width)), s = Math.max(16, Math.round(Number(e.state.height) || t.height)), c = Math.min(o, 3840 / Math.max(n * o, s * o)), l = (d) => Math.max(2, Math.round(d * c / 2) * 2);
  return { width: l(n), height: l(s) };
}
async function Cf(e) {
  if (e.recording) return;
  e.stopPlay(), e.recording = !0, e.root.classList.add("recording"), e.setStatus(r("Encoding deterministic proxy…"));
  const t = e.frame, a = e.canvas.width, o = e.canvas.height, n = jf(e);
  (n.width !== e.canvas.width || n.height !== e.canvas.height) && (e.canvas.width = n.width, e.canvas.height = n.height, e.render());
  try {
    let s = null;
    const i = e.root.querySelector('[data-role="encoder"]').value, { encodeDeterministicPlayblast: c, supportsDeterministicEncoding: l } = await import("./chunk-BO_UjN2o.js");
    i !== "realtime" && await l(e.canvas.width, e.canvas.height) && (s = await c(e.canvas, e.state.duration_frames, e.state.fps, async (d) => {
      e.setFrame(d, !0), e.setStatus(r("Encoding frame {value1}/{value2}…", { value1: d + 1, value2: e.state.duration_frames })), await Un(e), await new Promise((p) => requestAnimationFrame(p));
    }, e.abortController?.signal, e.state.playblast_quality)), s || (e.setStatus(r("WebCodecs unavailable; recording realtime fallback…")), s = await Gn(e)), e.setFrame(t), await Xn(e, s);
  } catch (s) {
    console.error(s), e.setStatus(r("Playblast failed: {value1}", { value1: s.message || s }));
  } finally {
    e.recording = !1, e.root.classList.remove("recording"), (e.canvas.width !== a || e.canvas.height !== o) && (e.canvas.width = a, e.canvas.height = o), e.resizeCanvas?.(), e.setFrame(t);
  }
}
let St = null;
function _f({ api: e }) {
  St = e;
}
async function Yn(e) {
  if (!St) throw new Error("ComfyUI API is unavailable");
  return Go(St, { route: "/majoor/omnicam/upload_asset", field: "asset", file: e });
}
async function no(e) {
  const t = e.map((a) => String(a.relative || "").replace(/^omnicam\//, "")).filter(Boolean);
  if (!(!t.length || !St))
    try {
      await St.fetchApi("/majoor/omnicam/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: t })
      });
    } catch {
    }
}
function ar(e) {
  return e.backgroundRequestId = (e.backgroundRequestId || 0) + 1, e.backgroundRequestId;
}
async function Ef(e, t) {
  if (!t) return;
  const a = _t(t, "image");
  if (a) {
    e.setStatus(a);
    return;
  }
  const o = ar(e);
  let n = null;
  try {
    if (e.setStatus(`Uploading background: ${t.name}`), n = await Yn(t), o !== e.backgroundRequestId || e.disposed) {
      await no([n]);
      return;
    }
    const s = Re(n.path);
    e.checkpoint?.("Set background image"), e.state.viewport_bg_image = n.path, e.state.viewport_bg_sequence = [];
    const i = new Image();
    i.src = s, await i.decode().catch(() => {
    }), e.viewportBgImage = i, e.serialize(), e.render(), e.setStatus(`Background image set: ${t.name}`);
  } catch (s) {
    if (n && await no([n]), o !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG image: ${s.message || s}`);
  }
}
async function $f(e, t) {
  if (!t || !t.length) return;
  const a = tf(t.length);
  if (a) {
    e.setStatus(a);
    return;
  }
  const o = Array.from(t).map((i) => _t(i, "image")).find(Boolean);
  if (o) {
    e.setStatus(o);
    return;
  }
  const n = ar(e);
  t.sort((i, c) => i.name.localeCompare(c.name, void 0, { numeric: !0, sensitivity: "base" }));
  const s = [];
  try {
    e.setStatus(`Uploading background sequence: ${t.length} frames`);
    for (const c of t)
      if (s.push(await Yn(c)), n !== e.backgroundRequestId || e.disposed) {
        await no(s);
        return;
      }
    const i = s.map((c) => c.path);
    e.checkpoint?.("Set background sequence"), e.state.viewport_bg_sequence = i, e.state.viewport_bg_image = "", e.viewportBgImage = null, e.viewportBgSequenceImages = i.map((c) => {
      const l = new Image();
      return l.src = Re(c), l.decode().catch(() => {
      }), l;
    }), e.serialize(), e.render(), e.setStatus(`Background sequence loaded: ${t.length} frames`);
  } catch (i) {
    if (await no(s), n !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG sequence: ${i.message || i}`);
  }
}
function Mf(e) {
  ar(e), e.checkpoint?.("Clear background"), e.state.viewport_bg_image = "", e.state.viewport_bg_sequence = [], e.viewportBgImage = null, e.viewportBgSequenceImages = [], e.serialize(), e.render(), e.setStatus("Background cleared");
}
function Tf(e) {
  const t = Mo(e.state?.metadata?.viewport_labels);
  if (t.mode === "off") return;
  const a = Array.isArray(e.state?.objects) ? e.state.objects : [], o = e.viewportCamera(), n = e.ctx, s = e.canvas.width, i = e.canvas.height, c = U(i / 720, 0.75, 4), l = Number(e.frame) || 0, d = e.selectedObjectIds instanceof Set && e.selectedObjectIds.size ? e.selectedObjectIds : new Set([e.selectedObjectId].filter(Boolean));
  n.save(), n.font = `${Math.round(12 * c)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`, n.textBaseline = "alphabetic";
  for (const p of a) {
    if (p.enabled === !1 || !Zr(p, { mode: t.mode, selectedIds: d })) continue;
    const f = Jr(p, t.content);
    if (!f) continue;
    const u = Qr(a, p, l) || { position: p.position, size: p.size }, m = p.annotation?.anchor || "top", h = en(u, p.type, m);
    let y, b;
    if (e.webgl?.projectWorldToScreen && e.webgl.activeCamera) {
      const L = e.webgl.projectWorldToScreen(h, s, i);
      if (!L || L.behind) continue;
      y = L.x, b = L.y;
    } else {
      const L = Ie(h, o, s, i);
      if (!L) continue;
      y = L[0], b = L[1];
    }
    const x = t.content === "annotation" && p.annotation?.color || "", g = 6 * c, k = 4 * c, $ = n.measureText(f).width + g * 2, _ = 12 * c + k * 2, I = Math.round(y - $ / 2), M = Math.round(b - _ - 6 * c);
    n.fillStyle = "rgba(16,17,22,0.88)", Af(n, I, M, $, _, 4 * c), n.fill(), x && (n.strokeStyle = x, n.lineWidth = Math.max(1, 1.5 * c), n.stroke()), n.fillStyle = x ? "#f3f4f6" : "#e6e6ec", n.fillText(f, I + g, M + _ - k - 2 * c);
  }
  n.restore();
}
function Af(e, t, a, o, n, s) {
  if (typeof e.roundRect == "function") {
    e.beginPath(), e.roundRect(t, a, o, n, s);
    return;
  }
  const i = Math.min(s, o / 2, n / 2);
  e.beginPath(), e.moveTo(t + i, a), e.arcTo(t + o, a, t + o, a + n, i), e.arcTo(t + o, a + n, t, a + n, i), e.arcTo(t, a + n, t, a, i), e.arcTo(t, a, t + o, a, i), e.closePath();
}
function ne(e, t, a, o = "#5a5a5a", n = 1) {
  const s = e.viewportCamera(), i = Ie(t, s, e.canvas.width, e.canvas.height), c = Ie(a, s, e.canvas.width, e.canvas.height);
  !i || !c || (e.ctx.strokeStyle = o, e.ctx.lineWidth = n, e.ctx.beginPath(), e.ctx.moveTo(i[0], i[1]), e.ctx.lineTo(c[0], c[1]), e.ctx.stroke());
}
function Pf(e) {
  for (let t = -60; t <= 60; t += 1) {
    const a = t === 0, o = a ? "#6f6f6f" : "#353535";
    ne(e, [t, 0, -60], [t, 0, 60], o, a ? 1.6 : 1), ne(e, [-60, 0, t], [60, 0, t], o, a ? 1.6 : 1);
  }
}
function If(e) {
  const t = e.state.point_density || "balanced", a = e.state.point_spread || "all_views", o = e.state.point_color || null, n = `${t}|${a}|${o}`;
  return e._pointFieldCache?.key !== n && (e._pointFieldCache = { key: n, ...Mi(t, a, o) }), e._pointFieldCache;
}
const zf = 600;
function Ff(e) {
  const { points: t, colors: a } = If(e);
  if (!t.length) return;
  const o = e.viewportCamera(), n = e.canvas.width, s = e.canvas.height, i = t.length / 3, c = 3 * Math.max(1, Math.ceil(i / zf)), l = /* @__PURE__ */ new Map();
  for (let d = 0; d < t.length; d += c) {
    const p = Ie([t[d], t[d + 1], t[d + 2]], o, n, s);
    if (!p) continue;
    const f = U(Math.round(5 / Math.sqrt(p[2])), 1, 4), u = `${Math.round(a[d] * 255)},${Math.round(a[d + 1] * 255)},${Math.round(a[d + 2] * 255)}|${f}`;
    let m = l.get(u);
    m || (m = { fill: `rgb(${u.slice(0, u.indexOf("|"))})`, radius: f, xs: [], ys: [] }, l.set(u, m)), m.xs.push(p[0]), m.ys.push(p[1]);
  }
  for (const d of l.values()) {
    e.ctx.fillStyle = d.fill, e.ctx.beginPath();
    for (let p = 0; p < d.xs.length; p += 1)
      e.ctx.moveTo(d.xs[p] + d.radius, d.ys[p]), e.ctx.arc(d.xs[p], d.ys[p], d.radius, 0, Math.PI * 2);
    e.ctx.fill();
  }
}
function Lf(e, t) {
  const [a, o, n] = t.size || [1, 1, 1], [s, i, c] = t.position || [0, 0, 0], l = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1]
  ].map((p) => [s + p[0] * a / 2, i + p[1] * o / 2, c + p[2] * n / 2]), d = [
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
  for (const [p, f] of d) ne(e, l[p], l[f], "#a0a0a0", 1.4);
}
function Of(e, t) {
  const [a] = t.size || [1.5], [o, n, s] = t.position || [0, 1, 0], i = a / 2;
  for (let c = 0; c < 3; c++) {
    let l = null;
    for (let d = 0; d <= 32; d++) {
      const p = d / 32 * Math.PI * 2;
      let f;
      c === 0 ? f = [o + Math.cos(p) * i, n + Math.sin(p) * i, s] : c === 1 ? f = [o + Math.cos(p) * i, n, s + Math.sin(p) * i] : f = [o, n + Math.cos(p) * i, s + Math.sin(p) * i], l && ne(e, l, f, "#999", 1), l = f;
    }
  }
}
function Kf(e, t) {
  const [a, o, n] = t.position || [0, 0, 0], s = t.size?.[1] || 1.8, i = (t.size?.[0] || 0.7) * 0.5, c = [a, o + s * 0.88, n], l = [a, o + s * 0.76, n], d = [a - i * 0.55, o + s * 0.73, n], p = [a + i * 0.55, o + s * 0.73, n], f = [a - i * 0.72, o + s * 0.52, n], u = [a + i * 0.72, o + s * 0.52, n], m = [a - i * 0.82, o + s * 0.34, n], h = [a + i * 0.82, o + s * 0.34, n], y = [a, o + s * 0.44, n], b = [a - i * 0.28, o + s * 0.44, n], x = [a + i * 0.28, o + s * 0.44, n], g = [a - i * 0.28, o + s * 0.22, n], k = [a + i * 0.28, o + s * 0.22, n], v = [a - i * 0.28, o, n + 0.05], $ = [a + i * 0.28, o, n + 0.05];
  ne(e, c, l, "#aaa", 2), ne(e, l, y, "#aaa", 2), ne(e, d, p, "#aaa", 2), ne(e, d, f, "#aaa", 2), ne(e, f, m, "#aaa", 2), ne(e, p, u, "#aaa", 2), ne(e, u, h, "#aaa", 2), ne(e, b, x, "#aaa", 2), ne(e, b, g, "#aaa", 2), ne(e, g, v, "#aaa", 2), ne(e, x, k, "#aaa", 2), ne(e, k, $, "#aaa", 2);
  const _ = Ie(c, e.viewportCamera(), e.canvas.width, e.canvas.height);
  _ && (e.ctx.strokeStyle = "#aaa", e.ctx.beginPath(), e.ctx.arc(_[0], _[1], U(28 / _[2], 3, 12), 0, Math.PI * 2), e.ctx.stroke());
}
function Df(e, t) {
  const [a, o, n] = t.position || [0, 0, 0], [s, i, c] = t.size || [1.5, 1.5, 1.5], l = s * 0.5, d = (c || s) * 0.5, p = i * 0.5, f = 12, u = [], m = [];
  for (let h = 0; h < f; h++) {
    const y = h / f * Math.PI * 2, b = Math.cos(y) * l, x = Math.sin(y) * d;
    u.push([a + b, o + p, n + x]), m.push([a + b, o - p, n + x]);
  }
  for (let h = 0; h < f; h++) {
    const y = (h + 1) % f;
    ne(e, u[h], u[y], "#aaa", 1.5), ne(e, m[h], m[y], "#aaa", 1.5);
  }
  for (let h = 0; h < f; h += 3)
    ne(e, u[h], m[h], "#aaa", 1.5);
}
function Rf(e, t) {
  const [a, o, n] = t.position || [0, 0, 0], [s, i, c] = t.size || [1.5, 1.5, 1.5], l = s * 0.5, d = s * 0.18, p = 16, f = [], u = [];
  for (let m = 0; m < p; m++) {
    const h = m / p * Math.PI * 2, y = Math.cos(h), b = Math.sin(h);
    f.push([a + y * (l + d), o, n + b * (l + d)]), u.push([a + y * (l - d), o, n + b * (l - d)]);
  }
  for (let m = 0; m < p; m++) {
    const h = (m + 1) % p;
    ne(e, f[m], f[h], "#aaa", 1.5), ne(e, u[m], u[h], "#aaa", 1.5), m % 4 === 0 && ne(e, f[m], u[m], "#888", 1);
  }
}
function Nf(e, t) {
  const a = t.position || [0, 1, 0], o = 0.25;
  ne(e, ve(a, [-o, 0, 0]), ve(a, [o, 0, 0]), "#bbb", 2), ne(e, ve(a, [0, -o, 0]), ve(a, [0, o, 0]), "#bbb", 2), ne(e, ve(a, [0, 0, -o]), ve(a, [0, 0, o]), "#bbb", 2);
}
function qf(e, t) {
  const a = e.cardMediaById.get(t.id) || (t.id === "subject" ? e.cardMedia : null);
  a && Ne(t, a);
  const [o, n, s] = t.position || [0, 1.5, 0], [i, c] = t.size || [2, 3], l = e.viewportCamera(), d = [
    [o - i / 2, n - c / 2, s],
    [o + i / 2, n - c / 2, s],
    [o + i / 2, n + c / 2, s],
    [o - i / 2, n + c / 2, s]
  ].map((b) => Ie(b, l, e.canvas.width, e.canvas.height));
  if (d.some((b) => !b)) return;
  const p = d.map((b) => b[0]), f = d.map((b) => b[1]), u = Math.min(...p), m = Math.max(...p), h = Math.min(...f), y = Math.max(...f);
  if (e.ctx.save(), e.ctx.beginPath(), e.ctx.moveTo(d[0][0], d[0][1]), e.ctx.closePath(), e.ctx.clip(), e.state.render_mode === "graybox") {
    e.ctx.fillStyle = "#3f4654", e.ctx.fill(), e.ctx.restore(), e.ctx.strokeStyle = "#64748b", e.ctx.lineWidth = 1.5, e.ctx.beginPath(), e.ctx.moveTo(d[0][0], d[0][1]);
    for (let b = 1; b < 4; b++) e.ctx.lineTo(d[b][0], d[b][1]);
    e.ctx.closePath(), e.ctx.stroke();
    return;
  }
  if (e.state.render_mode === "wireframe") {
    e.ctx.restore(), e.ctx.strokeStyle = "#8ab4f8", e.ctx.lineWidth = 1.5, e.ctx.beginPath(), e.ctx.moveTo(d[0][0], d[0][1]);
    for (let b = 1; b < 4; b++) e.ctx.lineTo(d[b][0], d[b][1]);
    e.ctx.closePath(), e.ctx.moveTo(d[0][0], d[0][1]), e.ctx.lineTo(d[2][0], d[2][1]), e.ctx.moveTo(d[1][0], d[1][1]), e.ctx.lineTo(d[3][0], d[3][1]), e.ctx.stroke();
    return;
  }
  if (a)
    try {
      const b = Math.max(1, m - u), x = Math.max(1, y - h), g = a.videoWidth || a.naturalWidth || a.width, k = a.videoHeight || a.naturalHeight || a.height, v = e.state.card_fit || "contain";
      if (e.ctx.fillStyle = "#111", e.ctx.fillRect(u, h, b, x), v === "stretch" || !g || !k)
        e.ctx.drawImage(a, u, h, b, x);
      else if (v === "contain") {
        const $ = Math.min(b / g, x / k), _ = g * $, I = k * $;
        e.ctx.drawImage(a, u + (b - _) / 2, h + (x - I) / 2, _, I);
      } else {
        const $ = Math.max(b / g, x / k), _ = b / $, I = x / $;
        e.ctx.drawImage(a, (g - _) / 2, (k - I) / 2, _, I, u, h, b, x);
      }
    } catch {
    }
  else {
    const b = Nn();
    b ? e.ctx.drawImage(b, u, h, m - u, y - h) : (e.ctx.fillStyle = "#1e293b", e.ctx.fillRect(u, h, m - u, y - h), e.ctx.fillStyle = "#d8d8d8", e.ctx.textAlign = "center", e.ctx.font = `${Math.max(12, Math.min(28, (m - u) * 0.08))}px system-ui`, e.ctx.fillText("SUBJECT CARD", (u + m) / 2, (h + y) / 2));
  }
  e.ctx.restore(), e.ctx.strokeStyle = a ? "#b3b8c1" : "#38bdf8", e.ctx.lineWidth = 1.5, e.ctx.beginPath(), e.ctx.moveTo(d[0][0], d[0][1]);
  for (let b = 1; b < 4; b++) e.ctx.lineTo(d[b][0], d[b][1]);
  e.ctx.closePath(), e.ctx.stroke();
}
function Bf(e) {
  const t = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
  (e.state.cameras || []).forEach((a, o) => {
    const n = a.keyframes || [], s = a.color || t[o % t.length], i = a.id === e.state.active_camera_id;
    if (!(i && e.state.view_mode === "camera")) {
      if (n.length >= 2)
        for (let c = 0; c < n.length - 1; c++)
          ne(e, n[c].camera.position, n[c + 1].camera.position, s, i ? 2.2 : 1.2);
      for (const c of n) {
        const l = Ie(c.camera.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        l && (e.ctx.fillStyle = c.frame === e.frame ? "#f2d06b" : s, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], i ? 4.5 : 3.5, 0, Math.PI * 2), e.ctx.fill());
      }
      if (e.state.view_mode !== "camera") {
        const c = xe(a, e.frame, e.state.objects), l = Ie(c.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        l && (e.ctx.fillStyle = i ? "#f2d06b" : s, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], i ? 6.5 : 4.5, 0, Math.PI * 2), e.ctx.fill()), c.target && ne(e, c.position, c.target, `${s}88`, 1);
      }
    }
  });
}
function Wf(e) {
  if (e.state.keyframes.length < 2) return;
  const t = [];
  for (let o = 0; o < e.state.keyframes.length - 1; o++) {
    const n = e.state.keyframes[o], s = e.state.keyframes[o + 1];
    t.push(We($e(s.camera.position, n.camera.position)) * e.state.fps / Math.max(1, s.frame - n.frame));
  }
  const a = Math.max(...t, 1e-6);
  for (let o = 0; o < t.length; o++) {
    const n = 120 * (1 - t[o] / a);
    ne(e, e.state.keyframes[o].camera.position, e.state.keyframes[o + 1].camera.position, `hsl(${n} 85% 55%)`, 5);
  }
}
function Vf(e) {
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  if (!e.recording && e.state.view_mode === "camera" && e.state.guides !== !1) {
    t.save(), t.strokeStyle = "#ffffff33", t.lineWidth = 1, t.beginPath();
    for (const s of [a / 3, 2 * a / 3])
      t.moveTo(s, 0), t.lineTo(s, o);
    for (const s of [o / 3, 2 * o / 3])
      t.moveTo(0, s), t.lineTo(a, s);
    t.moveTo(a / 2 - 14, o / 2), t.lineTo(a / 2 + 14, o / 2), t.moveTo(a / 2, o / 2 - 14), t.lineTo(a / 2, o / 2 + 14), t.stroke(), t.restore();
  }
  if (!e.recording && e.state.view_mode === "camera" && e.state.safe_areas && (t.save(), t.strokeStyle = "#00d2d388", t.lineWidth = 1, t.setLineDash([4, 4]), t.strokeRect(a * 0.05, o * 0.05, a * 0.9, o * 0.9), t.strokeStyle = "#feca5788", t.strokeRect(a * 0.1, o * 0.1, a * 0.8, o * 0.8), t.restore()), !e.recording && e.state.view_mode === "camera" && Fc(t, e.state, a, o), !e.recording && e.state.show_gizmo)
    try {
      e.drawTransformGizmo();
    } catch (s) {
      console.warn("[OmniCam Gizmo Error]", s);
    }
  if (!e.recording && e.boxSelection) {
    const { start: s, current: i } = e.boxSelection;
    t.save(), t.fillStyle = "rgba(74,163,239,.14)", t.strokeStyle = "#4aa3ef", t.lineWidth = 1.5, t.setLineDash([6, 4]), t.fillRect(s[0], s[1], i[0] - s[0], i[1] - s[1]), t.strokeRect(s[0], s[1], i[0] - s[0], i[1] - s[1]), t.restore();
  }
  if (!e.recording && e.state.show_radar)
    try {
      km(e, t, a, o);
    } catch (s) {
      console.error("[OmniCam] radar overlay failed", s), e.radarError = String(s?.message || s);
    }
  if (!e.recording && e.state.view_mode !== "camera" && a > 1 && o > 1) {
    const s = Math.hypot(a, o) / 2, i = t.createRadialGradient(a / 2, o / 2, s * 0.62, a / 2, o / 2, s);
    i.addColorStop(0, "rgba(0,0,0,0)"), i.addColorStop(1, "rgba(0,0,0,0.28)"), t.save(), t.fillStyle = i, t.fillRect(0, 0, a, o), t.restore();
  }
  if (e.state.burn_in) {
    const s = e.viewportCamera();
    t.save(), t.fillStyle = "#000b", t.fillRect(0, o - 34, a, 34), t.fillStyle = "#fff", t.font = `${Math.max(12, Math.round(o * 0.025))}px monospace`, t.fillText(`F ${e.frame}/${e.state.duration_frames - 1}  ${e.state.fps}fps  FOV ${s.fov.toFixed(1)}  ${e.state.render_mode}`, 12, o - 12), t.restore();
  }
  const n = !!e.state.playblast_labels || e.state.view_mode !== "camera" && e.state?.metadata?.viewport_labels?.mode && e.state.metadata.viewport_labels.mode !== "off";
  e.recording && n && Tf(e);
}
async function Hf(e, { signal: t } = {}) {
  if (!e?.fetchApi) throw new TypeError("A ComfyUI API client is required");
  const a = await e.fetchApi("/majoor/omnicam/capabilities", { signal: t });
  if (!a.ok) throw new Error(`Capabilities request failed (${a.status || "unknown"})`);
  return a.json();
}
function Uf(e) {
  const t = Array.isArray(e) ? e : [];
  if (!t.length) return { tone: "ok", label: "Core ready" };
  const a = t.length;
  return {
    tone: t.some((o) => o?.severity === "error") ? "error" : "warn",
    label: a === 1 ? "1 optional adapter issue" : `${a} optional adapter issues`
  };
}
async function Gf(e) {
  const t = e.root.querySelector('[data-role="setup-badge"]'), a = e.root.querySelector('[data-role="setup-issues"]');
  if (!t || !a) return;
  let o;
  try {
    o = await Hf(Ve);
  } catch {
    return;
  }
  e.adapterCapabilities = o;
  const n = o.diagnostic?.issues || [], s = Uf(n);
  if (t.hidden = !1, !n.length) {
    t.className = `setup-badge ${s.tone}`, t.textContent = r("Core ready"), a.innerHTML = "";
    return;
  }
  t.className = `setup-badge ${s.tone}`, t.textContent = n.length === 1 ? r("1 optional adapter issue") : r("{count} optional adapter issues").replace("{count}", String(n.length)), a.innerHTML = "";
  for (const i of n) {
    const c = document.createElement("div");
    c.className = "setup-issue";
    const l = document.createElement("span");
    if (l.textContent = `• ${i.message} `, c.appendChild(l), i.docs) {
      const d = document.createElement("a");
      d.href = i.docs, d.target = "_blank", d.rel = "noopener noreferrer", d.textContent = r("Setup docs"), c.appendChild(d);
    }
    a.appendChild(c);
  }
}
const Xf = 1, Nr = 0.01, Yf = 0.4, Zf = 3, Jf = 120, Qf = 20, eh = 4, th = 0.25, ah = 0.5;
function oh(e, t, a) {
  const o = We($e(t.camera.position, e.camera.position)), n = t.frame - e.frame, s = n / a, i = s > 1e-9 ? o / s : 1 / 0;
  return { distance: o, frames: n, duration: s, speed: i };
}
function rh(e, t = 24) {
  const a = Array.isArray(e) ? [...e].sort((n, s) => n.frame - s.frame) : [], o = [];
  for (let n = 1; n < a.length; n += 1) {
    const s = oh(a[n - 1], a[n], t);
    o.push({ frameStart: a[n - 1].frame, frameEnd: a[n].frame, ...s });
  }
  return o;
}
function qr(e, t, a) {
  return Math.atan2(e[2] - a, e[0] - t) * 180 / Math.PI;
}
function nh({ keys: e, fps: t = 24, objects: a = [] } = {}) {
  const o = Array.isArray(e) ? [...e].sort((c, l) => c.frame - l.frame) : [], n = [];
  if (o.length < 2) return n;
  const s = rh(o, t);
  for (const c of s)
    c.frames <= Xf && n.push({
      code: "NEAR_ZERO_DURATION",
      severity: "warning",
      frameStart: c.frameStart,
      frameEnd: c.frameEnd,
      message: `Keys at F${c.frameStart} and F${c.frameEnd} are only ${c.frames} frame(s) apart`
    }), c.distance < Nr && c.duration >= Yf && n.push({
      code: "STATIC_SEGMENT",
      severity: "info",
      frameStart: c.frameStart,
      frameEnd: c.frameEnd,
      message: `Camera barely moves from F${c.frameStart} to F${c.frameEnd}`
    });
  const i = s.map((c) => c.speed).filter((c) => Number.isFinite(c));
  if (i.length) {
    const c = i.reduce((l, d) => l + d, 0) / i.length;
    if (c > 1e-6)
      for (const l of s)
        Number.isFinite(l.speed) && l.speed > c * Zf && n.push({
          code: "SPEED_SPIKE",
          severity: "warning",
          frameStart: l.frameStart,
          frameEnd: l.frameEnd,
          message: `Speed spike F${l.frameStart}-F${l.frameEnd}`
        });
  }
  for (let c = 1; c < o.length - 1; c += 1) {
    const l = $e(o[c].camera.position, o[c - 1].camera.position), d = $e(o[c + 1].camera.position, o[c].camera.position), p = We(l), f = We(d);
    if (p < 1e-6 || f < 1e-6) continue;
    const u = Math.max(-1, Math.min(1, Ti(l, d) / (p * f))), m = Math.acos(u) * 180 / Math.PI;
    m >= Jf && n.push({
      code: "HARD_DIRECTION_CHANGE",
      severity: "notice",
      frameStart: o[c - 1].frame,
      frameEnd: o[c + 1].frame,
      message: `Sharp direction change at F${o[c].frame} (${Math.round(m)}°)`
    });
  }
  if (o.length >= eh) {
    const c = o.reduce((m, h) => m + h.camera.position[0], 0) / o.length, l = o.reduce((m, h) => m + h.camera.position[2], 0) / o.length, d = o[0].camera.position, p = o[o.length - 1].camera.position;
    let f = Math.abs(qr(p, c, l) - qr(d, c, l)) % 360;
    f > 180 && (f = 360 - f);
    const u = We($e(p, d));
    f <= Qf && u > Nr && n.push({
      code: "ORBIT_NOT_CLOSED",
      severity: "notice",
      frameStart: o[0].frame,
      frameEnd: o[o.length - 1].frame,
      message: `Path nearly returns to its start but does not close (gap ${u.toFixed(2)}m)`
    });
  }
  if (Array.isArray(a) && a.length)
    for (const c of o)
      for (const l of a) {
        if (!l || !Array.isArray(l.position)) continue;
        const d = Number.isFinite(Number(l.radius)) ? Number(l.radius) : ah;
        We($e(c.camera.position, l.position)) < d + th && n.push({
          code: "CAMERA_NEAR_OBJECT",
          severity: "warning",
          frameStart: c.frame,
          frameEnd: c.frame,
          message: `Camera passes near ${l.name || l.id || "an object"} at F${c.frame}`
        });
      }
  return n.sort((c, l) => c.frameStart - l.frameStart);
}
function Zn(e, t, a = null, o = null) {
  const n = Array.isArray(e) ? e : [];
  return n.find((s) => s.frame === t) || (a !== null ? n.find((s) => s.frame === a) : null) || (o !== null ? n.find((s) => s.frame === o) : null) || null;
}
function or(e, t) {
  return (t || e.activeCameraTrack?.())?.target_object_id || e.state.target_object_id || null;
}
function rr(e, t) {
  const a = t || e.activeCameraTrack?.(), o = a?.aim_bone ?? (a?.id === e.state.active_camera_id ? e.state.aim_bone : null);
  return typeof o == "string" && o ? o : null;
}
function sh(e, t = or(e)) {
  if (!t) return [];
  const a = e.state.objects.find((o) => o.id === t);
  return !a || a.type !== "model" && a.type !== "glb" ? [] : e.webgl?.listObjectBones?.(t) || [];
}
function Jn(e, t, a) {
  const o = or(e, t), n = rr(e, t);
  if (!o || !n) return null;
  const s = e.state.objects.find((d) => d.id === o);
  if (!s || s.enabled === !1) return null;
  const i = e.webgl?.sampleModelPoint?.(o, n, a, e.state.fps || 24);
  if (!i) return null;
  const l = (t || e.activeCameraTrack?.())?.target_offset || e.state.target_offset || [0, 0, 0];
  return [i[0] + (l[0] || 0), i[1] + (l[1] || 0), i[2] + (l[2] || 0)];
}
function ih(e, t, a) {
  const o = t.type === "model" || t.type === "glb" ? e.webgl?.sampleModelPoint?.(t.id, null, a, e.state.fps || 24) : null;
  return o || (t.keyframes?.length ? so(t, a).position : t.position || [0, 1.5, 0]);
}
function kt(e, t, a, o) {
  if (!a) return a;
  const n = Jn(e, t, o);
  return n && (a.target = n), a;
}
function ch(e, t) {
  const a = t || null;
  e.checkpoint("Change aim bone");
  const o = e.activeCameraTrack();
  o.aim_bone = a, o.id === e.state.active_camera_id && (e.state.aim_bone = a), e.setFrame(e.frame), e.serialize(), e.refreshInspector(), e.render(), e.setStatus(a ? r("Aiming at bone {bone}").replace("{bone}", a) : r("Aiming at the whole object"));
}
function lh(e, { perFrame: t = !1 } = {}) {
  const a = e.activeCameraTrack(), o = or(e, a), n = rr(e, a);
  if (!o || !n) return e.bakeAimToKeyframes();
  const s = e.state.objects.find((c) => c.id === o);
  if (!s || !a.keyframes?.length) return;
  e.checkpoint(t ? "Bake aim per frame" : "Bake aim to keyframes");
  const i = (c) => Jn(e, a, c) || ih(e, s, c);
  if (t) {
    const c = a.keyframes[0].frame, l = a.keyframes[a.keyframes.length - 1].frame, d = new Map(a.keyframes.map((p) => [p.frame, p]));
    for (let p = c; p <= l; p++) {
      const u = d.get(p) || { frame: p, camera: xe(a, p, e.state.objects), interpolation: "linear" };
      u.camera.target = [...i(p)], d.set(p, u);
    }
    a.keyframes = [...d.values()].sort((p, f) => p.frame - f.frame);
  } else
    for (const c of a.keyframes) c.camera.target = [...i(c.frame)];
  a.id === e.state.active_camera_id && (e.state.keyframes = a.keyframes), e.setFrame(e.frame), e.serialize(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(r("Aim baked on bone {bone} ({count} keys)").replace("{bone}", n).replace("{count}", String(a.keyframes.length)));
}
function dh(e) {
  const t = e.root?.querySelector('[data-role="camera-aim-bone-row"]'), a = e.root?.querySelector('[data-role="camera-aim-bone"]');
  if (!a) return;
  const o = sh(e);
  t && (t.hidden = o.length === 0);
  const n = rr(e) || "";
  a.innerHTML = "";
  const s = document.createElement("option");
  s.value = "", s.textContent = r("Whole object"), a.appendChild(s);
  for (const i of o) {
    const c = document.createElement("option");
    c.value = i, c.textContent = i, a.appendChild(c);
  }
  if (n && !o.includes(n)) {
    const i = document.createElement("option");
    i.value = n, i.textContent = `${n} — ${r("missing")}`, a.appendChild(i);
  }
  a.value = n;
}
function mh(e, t, a) {
  if (a.querySelector("input")) return;
  const o = document.createElement("input");
  o.type = "text", o.className = "oc-inline-rename", o.value = t.name || t.type, o.style.cssText = "width:100%;font:inherit;padding:0 2px;box-sizing:border-box";
  const n = a.textContent;
  a.textContent = "", a.appendChild(o), o.focus(), o.select();
  let s = !1;
  const i = (l) => {
    if (s) return;
    s = !0, o.removeEventListener("blur", c);
    const d = o.value.trim().slice(0, 80);
    l && d && d !== t.name ? (e.checkpoint("Rename object"), t.name = d, e.serialize(), e.refreshObjects(), e.refreshKeys?.(), e.setStatus(r("Object renamed: {name}").replace("{name}", t.name))) : a.textContent = n;
  }, c = () => i(!0);
  o.addEventListener("blur", c), o.addEventListener("keydown", (l) => {
    l.stopPropagation(), l.key === "Enter" ? (l.preventDefault(), i(!0)) : l.key === "Escape" && (l.preventDefault(), i(!1));
  }), o.addEventListener("pointerdown", (l) => l.stopPropagation()), o.addEventListener("dblclick", (l) => l.stopPropagation());
}
function Qn(e) {
  const t = e.root.querySelector('[data-role="objects"]');
  if (!t) return;
  t.innerHTML = "", t.onkeydown = (u) => {
    if (u.key === "ArrowUp" || u.key === "ArrowDown") {
      const m = [...t.querySelectorAll('.scene-item[role="button"]')], h = m.indexOf(document.activeElement);
      if (h >= 0) {
        u.preventDefault();
        const y = u.key === "ArrowDown" ? Math.min(m.length - 1, h + 1) : Math.max(0, h - 1);
        y !== h && (m[y].focus(), m[y].click(), m[y].scrollIntoView?.({ block: "nearest", behavior: "smooth" }));
      }
    }
  };
  const a = e.outlinerCategoryFilter || "all", o = e.root.querySelectorAll('[data-role="outliner-filter-chips"] .oc-chip');
  for (const u of o)
    u.classList.toggle("active", (u.dataset.filter || "all") === a);
  const n = (u, m, h, y, b = "") => {
    const x = document.createElement("button");
    return x.type = "button", x.className = "scene-action-btn", h && (x.style.cssText = b || `color:${ae.warning};border-color:${ae.warning};background:${ae.warningSoft}`), x.title = r(m), x.innerHTML = `<i class="pi ${u}" style="font-size:10px"></i>`, x.addEventListener("click", (g) => {
      g.stopPropagation(), y(g);
    }), x;
  }, s = (e.outlinerFilter || "").trim().toLowerCase(), i = (u) => !s || String(u || "").toLowerCase().includes(s), c = (u, m, h) => {
    const y = !!(e.outlinerCollapsedSections?.has(h) && !s), b = document.createElement("div");
    return b.className = "scene-section-header", b.dataset.section = h, b.innerHTML = `
      <i class="pi ${y ? "pi-chevron-right" : "pi-chevron-down"}" style="font-size:9px;color:var(--oc-text-dim)"></i>
      <span class="scene-section-title">${u}</span>
      <span class="scene-section-count">(${m})</span>
    `, b.addEventListener("click", () => {
      e.outlinerCollapsedSections ||= /* @__PURE__ */ new Set(), e.outlinerCollapsedSections.has(h) ? e.outlinerCollapsedSections.delete(h) : e.outlinerCollapsedSections.add(h), Qn(e);
    }), { header: b, isCollapsed: y };
  }, l = (u) => ["sun_light", "point_light", "spot_light"].includes(u), d = a === "all" || a === "cameras" || a === "hidden" && e.state.cameras.some((u) => u.muted), p = a === "all" || a === "objects" || a === "lights" || a === "hidden" && e.state.objects.some((u) => u.enabled === !1);
  if (d) {
    const u = e.state.cameras.filter((y) => !(!i(y.name) || a === "hidden" && !y.muted)), { header: m, isCollapsed: h } = c(r("Cameras"), u.length, "cameras");
    if (t.appendChild(m), !h)
      for (const y of u) {
        const b = document.createElement("div");
        b.role = "button", b.tabIndex = 0, b.dataset.cameraId = y.id;
        const x = y.id === e.state.active_camera_id, g = y.id === e.state.playblast_camera_id, k = e.selectedEntity === "camera" && x;
        b.setAttribute("aria-selected", String(k)), b.className = `scene-item${k ? " selected" : ""}${x && !k ? " active-view" : ""}`;
        const v = document.createElement("i");
        v.className = "pi pi-video", v.style.cssText = `color:${ae.typeCamera}`;
        const $ = document.createElement("span");
        if ($.className = "scene-item-label", k || x) {
          const M = document.createElement("span");
          M.style.cssText = `color:${k ? ae.warning : ae.success};font-weight:700`, M.textContent = k ? "● " : "○ ", $.appendChild(M);
        }
        if ($.appendChild(document.createTextNode(y.name)), g) {
          const M = document.createElement("span");
          M.style.cssText = `color:${ae.warning};font-size:10px`, M.title = "Playblast Output", M.textContent = " ★", $.appendChild(M);
        }
        if (y.muted) {
          const M = document.createElement("span");
          M.style.opacity = ".6", M.textContent = " (muted)", $.appendChild(M);
        }
        const _ = document.createElement("div");
        _.className = "scene-item-actions", _.appendChild(n("pi-star", "Solo track", y.solo, () => {
          e.checkpoint("Solo track"), y.solo = !y.solo, e.serialize(), e.refreshObjects(), e.renderCameraView();
        }, `color:${ae.warning};border-color:${ae.warning};background:${ae.warningSoft}`)), _.appendChild(n("pi-volume-off", "Mute track", y.muted, () => {
          e.checkpoint("Mute track"), y.muted = !y.muted, e.serialize(), e.refreshObjects(), e.renderCameraView();
        }, `color:${ae.error};border-color:${ae.error};background:${ae.errorSoft}`)), _.appendChild(n("pi-lock", "Lock track", y.locked, () => {
          e.checkpoint("Lock track"), y.locked = !y.locked, e.serialize(), e.refreshObjects(), e.renderCameraView();
        })), (y.keyframes || []).length >= 1 && _.appendChild(n(
          "pi-arrows-alt",
          "Select whole path (move / scale / rotate)",
          e.selectedEntity === "camera_path" && x,
          () => {
            e.activateCamera(y.id), e.selectCameraPath();
          }
        )), _.appendChild(n("pi-ellipsis-v", "Camera actions", !1, (M) => e.openCameraContext(M, y.id, !1))), b.append(v, $, _), b.title = k ? r("Currently selected for editing") : g ? r("Active playblast camera") : r("Click to select & activate this camera");
        const I = () => {
          e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(y.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(r("Camera: {value1}", { value1: y.name }));
        };
        b.addEventListener("contextmenu", (M) => {
          M.preventDefault(), M.stopPropagation(), e.openCameraContext(M, y.id, !1);
        }), b.addEventListener("keydown", (M) => {
          (M.key === "Enter" || M.key === " ") && (M.preventDefault(), I());
        }), t.appendChild(b);
      }
  }
  if (p) {
    const u = new Map(e.state.objects.map((v) => [v.id, v])), m = /* @__PURE__ */ new Map(), h = [];
    for (const v of e.state.objects)
      v.parent_id && u.has(v.parent_id) ? (m.has(v.parent_id) || m.set(v.parent_id, []), m.get(v.parent_id).push(v)) : h.push(v);
    const y = [], b = (v, $) => {
      y.push({ object: v, level: $ });
      const _ = m.get(v.id) || [];
      for (const I of _) b(I, $ + 1);
    };
    for (const v of h) b(v, 0);
    const x = y.filter(({ object: v }) => {
      const $ = [v.name, v.type, ...v.tags || [], v.asset_kind, v.asset_id].filter(Boolean).join(" ");
      return !(!i($) || a === "lights" && !l(v.type) || a === "objects" && l(v.type) || a === "hidden" && v.enabled !== !1);
    }), { header: g, isCollapsed: k } = c(a === "lights" ? r("Lights") : r("Objects"), x.length, "objects");
    if (t.appendChild(g), !k)
      for (const { object: v, level: $ } of x) {
        const _ = document.createElement("div");
        _.role = "button", _.tabIndex = 0, _.dataset.objectId = v.id;
        const I = e.selectedEntity === "object" && (v.id === e.selectedObjectId || e.selectedObjectIds?.has?.(v.id)), M = e.selectedEntity === "object" && v.id === e.selectedObjectId;
        _.setAttribute("aria-selected", String(I)), _.className = `scene-item${I ? " selected" : ""}${M ? " primary" : ""}${$ > 0 && !s ? " scene-item-child" : ""}`, $ > 0 && !s && (_.style.paddingLeft = `${$ * 16 + 6}px`);
        const L = v.type === "card" ? { icon: "pi-image", color: ae.typeReferenceCard } : v.type === "model" || v.type === "glb" ? { icon: "pi-box", color: ae.typePointCloud } : v.type === "ground" ? { icon: "pi-minus", color: ae.typeGroundPlane } : v.type === "sun_light" ? { icon: "pi-sun", color: ae.typeLight } : v.type === "point_light" ? { icon: "pi-bolt", color: ae.typeLight } : v.type === "spot_light" ? { icon: "pi-compass", color: ae.typeLight } : v.type === "human" ? { icon: "pi-user", color: ae.success } : v.type === "cube" ? { icon: "pi-stop", color: ae.typeGeometry } : v.type === "sphere" ? { icon: "pi-circle", color: ae.typeGeometry } : v.type === "cylinder" ? { icon: "pi-database", color: ae.typeGeometry } : v.type === "torus" ? { icon: "pi-circle", color: ae.typeGeometry } : v.type === "pyramid" ? { icon: "pi-play", color: ae.typeGeometry } : { icon: "pi-plus", color: ae.typeGeometry }, O = v.enabled !== !1, A = !!v.load_error, B = document.createElement("i");
        B.className = `pi ${A ? "pi-exclamation-triangle" : L.icon}`, B.style.cssText = A ? `color:${ae.error}` : O ? `color:${L.color}` : "opacity:.4";
        const w = document.createElement("span");
        w.className = "scene-item-label";
        const E = document.createElement("span");
        E.style.cssText = A ? `color:${ae.error}` : O ? "" : "opacity:.5;text-decoration:line-through", E.textContent = v.name || v.type, E.title = r("Double-click to rename"), E.addEventListener("dblclick", (T) => {
          T.preventDefault(), T.stopPropagation(), mh(e, v, E);
        }), w.appendChild(E);
        const z = Array.isArray(v.tags) ? v.tags : [];
        if (z.length) {
          const T = document.createElement("span");
          T.className = "scene-item-tags";
          for (const W of z.slice(0, 2)) {
            const C = document.createElement("span");
            C.className = "scene-item-tag", C.textContent = W, T.appendChild(C);
          }
          if (z.length > 2) {
            const W = document.createElement("span");
            W.className = "scene-item-tag scene-item-tag-more", W.textContent = `+${z.length - 2}`, T.appendChild(W);
          }
          w.appendChild(T);
        }
        if (A) {
          const T = document.createElement("span");
          T.style.cssText = `color:${ae.error};font-size:9px;font-weight:700`, T.textContent = " [Format!]", w.appendChild(T);
        }
        const R = document.createElement("div");
        R.className = "scene-item-actions", R.appendChild(n(O ? "pi-eye" : "pi-eye-slash", O ? "Hide object (Alt+Click to Isolate)" : "Show object (Alt+Click to Isolate)", !O, (T) => {
          if (T?.altKey) {
            if (e.checkpoint("Isolate object"), e._isolatedObjectId === v.id) {
              e._isolatedObjectId = null;
              const C = e._isolationSnapshot;
              for (const N of e.state.objects)
                N.enabled = C && Object.prototype.hasOwnProperty.call(C, N.id) ? C[N.id] : !0;
              e._isolationSnapshot = null, e.setStatus?.(r("Isolation cleared"));
            } else {
              e._isolationSnapshot || (e._isolationSnapshot = Object.fromEntries(e.state.objects.map((C) => [C.id, C.enabled !== !1]))), e._isolatedObjectId = v.id;
              for (const C of e.state.objects) C.enabled = C.id === v.id;
              e.setStatus?.(r("Isolated: {name}").replace("{name}", v.name || v.type));
            }
            e.serialize(), e.refreshObjects(), e.requestRender?.();
          } else
            e.toggleObject(v.id);
        }, `color:${ae.error};opacity:.7`)), R.appendChild(n(v.locked ? "pi-lock" : "pi-lock-open", "Lock object", v.locked, () => Zo(e, v))), R.appendChild(n("pi-copy", "Duplicate object", !1, () => e.duplicateObject?.(v.id))), v.id !== "subject" && R.appendChild(n("pi-trash", "Delete object", !1, () => e.deleteObject?.(v.id))), R.appendChild(n("pi-ellipsis-v", "Object actions", !1, (T) => e.openObjectContext(T, v.id))), _.append(B, w, R), _.title = r("Click to select · Double-click to toggle visibility · Right-click for actions");
        const q = (T = {}) => {
          if (T.altKey && v.id !== "subject") return void e.deleteObject(v.id);
          if (e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectIds ||= /* @__PURE__ */ new Set(), T.ctrlKey || T.metaKey)
            e.selectedObjectIds.has(v.id) ? e.selectedObjectIds.delete(v.id) : e.selectedObjectIds.add(v.id), e.outlinerAnchorId = v.id;
          else if (T.shiftKey && e.outlinerAnchorId && e.state.objects.some((C) => C.id === e.outlinerAnchorId)) {
            const C = e.state.objects.map((te) => te.id), N = C.indexOf(e.outlinerAnchorId), H = C.indexOf(v.id);
            e.selectedObjectIds = new Set(C.slice(Math.min(N, H), Math.max(N, H) + 1));
          } else
            e.selectedObjectIds = /* @__PURE__ */ new Set([v.id]), e.outlinerAnchorId = v.id;
          e.selectedObjectId = e.selectedObjectIds.has(v.id) ? v.id : [...e.selectedObjectIds].at(-1) || null, e.selectedEntity = e.selectedObjectIds.size ? "object" : "camera", e.selectedKeyFrame = e.selectedObjectId ? v.keyframes?.find((C) => C.frame === e.frame)?.frame ?? null : null, e.editingKeyFrame = null;
          for (const C of t.querySelectorAll(".scene-item")) {
            const N = !!(C.dataset.objectId && e.selectedObjectIds.has(C.dataset.objectId)), H = !!(C.dataset.objectId && C.dataset.objectId === e.selectedObjectId);
            C.classList.toggle("selected", N), C.classList.toggle("primary", H), C.dataset.objectId && C.setAttribute("aria-selected", String(N));
          }
          const W = e.root.querySelector('[data-role="outliner-batch-bar"]');
          if (W) {
            const C = e.selectedObjectIds?.size || 0;
            W.hidden = C < 2;
            const N = W.querySelector('[data-role="batch-count"]');
            N && (N.textContent = `${C} ${r("selected")}`);
          }
          e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(r("Selected: {value1}", { value1: v.name || v.type }));
        };
        _.addEventListener("dblclick", () => e.toggleObject(v.id)), _.addEventListener("contextmenu", (T) => {
          T.preventDefault(), T.stopPropagation(), e.openObjectContext(T, v.id);
        }), _.addEventListener("keydown", (T) => {
          (T.key === "Enter" || T.key === " ") && (T.preventDefault(), q(T));
        }), t.appendChild(_);
      }
  }
  const f = e.root.querySelector('[data-role="outliner-batch-bar"]');
  if (f) {
    const u = e.selectedObjectIds?.size || 0;
    f.hidden = u < 2;
    const m = f.querySelector('[data-role="batch-count"]');
    m && (m.textContent = `${u} ${r("selected")}`);
  }
  e.refreshInspector();
}
function jo(e, t, a, o) {
  e && document.activeElement !== e && (e.__omnicamOptionSig !== t && (e.__omnicamOptionSig = t, e.replaceChildren(...a())), e.value = o);
}
function yt(e, t) {
  const a = document.createElement("option");
  return a.value = e, a.textContent = t, a;
}
function ph(e, t) {
  e.checkpoint("Create object");
  const a = `${t}_${Date.now().toString(36)}`, o = t === "ground", n = t === "human", s = t === "card", i = t === "cylinder", c = t === "torus", l = t === "pyramid", d = t === "sun_light", p = t === "point_light", f = t === "spot_light";
  let u;
  n ? u = r("Human Proxy") : s ? u = r("Card") : i ? u = r("Cylinder") : c ? u = r("Torus") : l ? u = r("Pyramide") : d ? u = r("Sun light") : p ? u = r("Point light") : f ? u = r("Spot light") : u = t[0].toUpperCase() + t.slice(1);
  let m;
  o ? m = [12, 0.1, 12] : n ? m = [0.7, 1.8, 0.4] : s ? m = [2, 3] : m = [1.5, 1.5, 1.5];
  let h = [0, 0, 0], y = [0, 0, 0], b = "#8c929b", x, g, k, v;
  d ? (h = [5, 8.5, 4], y = [-55, 35, 0], b = "#fff6ec", x = 2.2, g = !0) : p ? (h = [0, 3, 0], b = "#ffffff", x = 2, g = !1) : f && (h = [0, 4, 0], y = [-60, 0, 0], b = "#ffffff", x = 3, k = 45, v = 0.25, g = !0);
  const $ = {
    id: a,
    type: t,
    name: u,
    position: h,
    rotation: y,
    size: m,
    color: b,
    material_mode: o ? "checker" : "textured",
    ...x !== void 0 ? { intensity: x } : {},
    ...g !== void 0 ? { cast_shadow: g } : {},
    ...k !== void 0 ? { cone_angle: k } : {},
    ...v !== void 0 ? { penumbra: v } : {},
    keyframes: [],
    enabled: !0
  };
  e.state.objects.push($), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedObjectIds = /* @__PURE__ */ new Set([a]), e.selectedKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render();
}
async function fh(e, t) {
  const a = e.state.objects.find((n) => n.id === t);
  if (!a) return;
  const o = (await jt(e, r("Rename object"), r("Object name"), a.name || a.type))?.trim();
  e.disposed || !e.state.objects.includes(a) || !o || o === a.name || (e.checkpoint("Rename object"), a.name = o.slice(0, 80), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(r("Object renamed: {value1}", { value1: a.name })));
}
function es(e, t) {
  const a = e.state.objects.find((n) => n.id === t);
  if (!a) return;
  e.checkpoint("Duplicate object");
  const o = JSON.parse(JSON.stringify(a));
  o.id = `${a.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, o.name = `${a.name || a.type} Copy`, o.position = ve(o.position || [0, 0, 0], [0.35, 0, 0.35]), (o.type === "model" || o.type === "glb") && e.modelUrlsById.has(a.id) ? e.modelUrlsById.set(o.id, e.modelUrlsById.get(a.id)) : o.type === "card" && e.cardMediaById.has(a.id) && qe(e, o.id, e.cardMediaById.get(a.id), !1, o.asset || e.cardMediaAssetById?.get?.(a.id) || ""), e.state.objects.push(o), e.selectedEntity = "object", e.selectedObjectId = o.id, e.selectedObjectIds = /* @__PURE__ */ new Set([o.id]), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(r("{value1} added", { value1: o.name }));
}
function hh(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint(a.enabled === !1 ? "Show object" : "Hide object"), a.enabled = a.enabled === !1, e.serialize(), e.refreshObjects(), e.render(), e.setStatus(r("{value1} {value2}", { value1: a.name || a.type, value2: a.enabled ? "shown" : "hidden" })));
}
async function ts(e, t) {
  if (t === "subject") return e.setStatus(r("The subject card cannot be deleted"));
  const a = e.state.objects.find((o) => o.id === t);
  if (a && await Ct(e, r("Delete object"), r("Delete {value1} and its {value2} keyframe(s)?", { value1: a.name || a.type, value2: (a.keyframes || []).length })) && !(e.disposed || !e.state.objects.includes(a))) {
    e.checkpoint("Delete object");
    for (const o of e.state.objects) o.parent_id === t && (o.parent_id = null);
    e.state.objects = e.state.objects.filter((o) => o.id !== t), e.selectedObjectIds?.delete(t), e.removeObjectResources(t), e.selectedObjectId === t && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = e.state.keyframes.find((o) => o.frame === e.frame)?.frame ?? null), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(r("{value1} deleted", { value1: a.name || a.type }));
  }
}
async function uh(e) {
  const t = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((n) => n && n !== "subject" && e.state.objects.some((s) => s.id === n));
  if (!t.length) {
    e.selectedObjectId === "subject" && e.setStatus(r("The subject card cannot be deleted"));
    return;
  }
  if (t.length === 1) return ts(e, t[0]);
  const a = r("Delete {count} objects and their keyframes?").replace("{count}", String(t.length));
  if (!await Ct(e, r("Delete objects"), a) || e.disposed) return;
  e.checkpoint("Delete objects");
  const o = new Set(t);
  for (const n of e.state.objects) n.parent_id && o.has(n.parent_id) && (n.parent_id = null);
  e.state.objects = e.state.objects.filter((n) => !o.has(n.id));
  for (const n of t) e.removeObjectResources(n);
  e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.selectedKeyFrame = e.state.keyframes.find((n) => n.frame === e.frame)?.frame ?? null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(r("{count} objects deleted").replace("{count}", String(t.length)));
}
function bh(e) {
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
function $t(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function Br(e, t) {
  const a = e('[data-role="curve-group"]');
  if (a)
    for (const o of a.options) {
      const n = t[o.value];
      n && (o.textContent = n);
    }
}
function gh(e) {
  const t = $t(e), a = e.root.querySelector('[data-role="object-panel"]');
  a && (a.hidden = !t);
  const o = (w) => e.root.querySelector(w), n = e.activeCameraTrack(), s = o('[data-role="camera-target-object"]');
  if (s) {
    const w = n.target_object_id || e.state.target_object_id || "", E = `T${mr()}${e.state.objects.map((z) => `${z.id}\0${z.name || z.type}`).join("|")}`;
    jo(s, E, () => [
      yt("", r("Manual Target (No Tracking)")),
      ...e.state.objects.map((z) => yt(z.id, `${r("Track:")} ${z.name || z.type}`))
    ], w);
  }
  dh(e);
  const i = [...e.camera.position, ...e.camera.target, e.camera.fov, e.camera.roll || 0, e.camera.near, e.camera.far, ...Wo(e.camera)];
  ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far", "camera-rx", "camera-ry", "camera-rz"].forEach((w, E) => {
    for (const z of e.root.querySelectorAll(`[data-role="${w}"]`))
      document.activeElement !== z && (z.value = String(Math.round(i[E] * 1e4) / 1e4));
  });
  for (const w of e.root.querySelectorAll('[data-role="camera-type"]'))
    document.activeElement !== w && (w.value = e.camera.camera_type || "perspective");
  for (const w of e.root.querySelectorAll('[data-role="speed"]'))
    document.activeElement !== w && (w.value = String(e.cameraSpeed || 1));
  for (const w of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    document.activeElement !== w && (w.value = e.state.active_camera_id);
  for (const w of e.root.querySelectorAll('[data-role="camera-color"]'))
    document.activeElement !== w && (w.value = n?.color || "#4aa3ef");
  if (!t) {
    const w = o('[data-role="object-recon-badge"]');
    w && (w.hidden = !0);
    const E = o('[data-role="selected-name"]');
    E && (E.textContent = `${n.name} · F${e.frame}`), Br(o, {
      camera: r("Camera (Position, Focal, Roll)"),
      position: r("Position XYZ"),
      target: r("Target XYZ"),
      lens: r("FOV / Roll / Zoom")
    }), e.rigMapper?.sync(), e.poseEditor?.sync(), e.motionEditor?.sync();
    return;
  }
  const c = o('[data-role="object-recon-badge"]');
  if (c) {
    const w = up(t);
    if (w) {
      c.hidden = !1;
      const E = w.semantic ? `${w.semantic} · ` : "";
      c.textContent = `${E}${w.label} (${Math.round(w.confidence * 100)}%)`, c.title = w.title, c.className = `oc-recon-badge oc-badge-${w.band}`;
    } else
      c.hidden = !0;
  }
  const l = o('[data-role="object-lock-toggle"]');
  if (l) {
    l.classList.toggle("locked", !!t.locked), l.title = t.locked ? r("Unlock object") : r("Lock object");
    const w = l.querySelector("i");
    w && (w.className = `pi ${t.locked ? "pi-lock" : "pi-lock-open"}`);
  }
  const d = t.position || [0, 0, 0], p = o('[data-role="selected-name"]');
  p && (p.textContent = t.name || t.type), Br(o, {
    camera: r("Position XYZ"),
    position: r("Position XYZ"),
    target: r("Rotation XYZ"),
    lens: r("Scale XYZ")
  });
  const f = t.rotation || [0, 0, 0], u = t.size || [1, 1, 1], m = {
    "object-x": d[0],
    "object-y": d[1],
    "object-z": d[2],
    "object-rx": f[0],
    "object-ry": f[1],
    "object-rz": f[2],
    "object-sx": u[0] ?? 1,
    "object-sy": u[1] ?? 1,
    "object-sz": u[2] ?? 1
  };
  for (const [w, E] of Object.entries(m))
    for (const z of e.root.querySelectorAll(`[data-role="${w}"]`))
      document.activeElement !== z && (z.value = String(Math.round(E * 1e4) / 1e4));
  for (const w of e.root.querySelectorAll('[data-role="object-material"]'))
    document.activeElement !== w && (w.value = t.material_mode || "textured");
  for (const w of e.root.querySelectorAll('[data-role="object-color"]'))
    document.activeElement !== w && (w.value = t.color || "#8c929b");
  for (const w of e.root.querySelectorAll('[data-role="object-light-color"]'))
    document.activeElement !== w && (w.value = t.color || "#ffffff");
  for (const w of e.root.querySelectorAll("[data-transform-mode]")) w.classList.toggle("active", w.dataset.transformMode === (e.state.gizmo_mode || "translate"));
  const h = o('[data-role="animation-row"]'), y = o('[data-role="animation-select"]'), b = o('[data-role="object-parent"]');
  if (b) {
    const w = t.id, E = /* @__PURE__ */ new Set([w]);
    let z = !0;
    for (; z; ) {
      z = !1;
      for (const T of e.state.objects)
        !E.has(T.id) && T.parent_id && E.has(T.parent_id) && (E.add(T.id), z = !0);
    }
    const R = e.state.objects.filter((T) => !E.has(T.id)), q = `P${mr()}${w}${R.map((T) => `${T.id} ${T.name || T.type}`).join("|")}`;
    jo(b, q, () => [
      yt("", r("No parent")),
      ...R.map((T) => yt(T.id, T.name || T.type))
    ], t.parent_id || "");
  }
  const x = ["sun_light", "point_light", "spot_light"].includes(t.type), g = t.type === "spot_light", k = o('[data-role="light-props-row"]');
  k && (k.hidden = !x);
  const v = o('[data-role="spot-props-row"]');
  v && (v.hidden = !g);
  const $ = o('[data-role="material-row"]');
  $ && ($.hidden = x);
  const _ = o('[data-role="scale-row"]');
  _ && (_.hidden = x);
  const I = o('[data-role="rotation-row"]');
  if (I && (I.hidden = t.type === "point_light"), x) {
    const w = o('[data-role="object-intensity"]');
    w && document.activeElement !== w && (w.value = String(t.intensity ?? (t.type === "sun_light" ? 2.2 : t.type === "spot_light" ? 3 : 2)));
    const E = o('[data-role="object-cast-shadow"]');
    if (E && (E.checked = t.cast_shadow !== !1), g) {
      const z = o('[data-role="object-cone-angle"]');
      z && document.activeElement !== z && (z.value = String(t.cone_angle ?? 45));
      const R = o('[data-role="object-penumbra"]');
      R && document.activeElement !== R && (R.value = String(t.penumbra ?? 0.25));
    }
  }
  const M = e.modelInfoById.get(t.id);
  if (h && (h.hidden = !M?.animations), y) {
    const w = M?.animationNames || [];
    jo(y, `A${w.join("|")}`, () => w.map((E, z) => yt(String(z), E)), String(t.animation_index || 0));
  }
  const L = o('[data-role="object-tags"]');
  L && document.activeElement !== L && (L.value = (t.tags || []).join(", "));
  const O = o('[data-role="object-annotation"]');
  O && document.activeElement !== O && (O.value = t.annotation?.text || "");
  const A = o('[data-role="object-annotation-color"]');
  A && document.activeElement !== A && (A.value = t.annotation?.color || "#8d7ee8");
  const B = o('[data-role="object-annotation-anchor"]');
  B && document.activeElement !== B && (B.value = t.annotation?.anchor || "top"), e.rigMapper?.sync(), e.poseEditor?.sync(), e.motionEditor?.sync();
}
function yh(e) {
  const t = $t(e);
  if (!t) return;
  if (t.locked) {
    e.setStatus?.(r("Object is locked"));
    return;
  }
  const a = (c, l) => {
    const d = e.root.querySelector(`[data-role="${c}"]`);
    if (!d || d.value === "") return l;
    const p = Number(d.value);
    return Number.isFinite(p) ? p : l;
  }, o = t.position || [0, 0, 0], n = t.rotation || [0, 0, 0], s = t.size || [1, 1, 1], i = globalThis.performance?.now?.() ?? Date.now();
  if ((e.lastObjectNumericEditId !== t.id || !Number.isFinite(e.lastObjectNumericEditAt) || i - e.lastObjectNumericEditAt > 300) && e.checkpoint?.("Edit object"), e.lastObjectNumericEditId = t.id, e.lastObjectNumericEditAt = i, t.position = [a("object-x", o[0]), a("object-y", o[1]), a("object-z", o[2])], t.rotation = [a("object-rx", n[0]), a("object-ry", n[1]), a("object-rz", n[2])], t.size = [Math.max(0.01, a("object-sx", s[0])), Math.max(0.01, a("object-sy", s[1])), Math.max(0.01, a("object-sz", s[2]))], ["sun_light", "point_light", "spot_light"].includes(t.type)) {
    const c = e.root.querySelector('[data-role="object-intensity"]');
    c && c.value !== "" && (t.intensity = Math.max(0, Number(c.value) || 0));
    const l = e.root.querySelector('[data-role="object-cast-shadow"]');
    if (l && (t.cast_shadow = l.checked), t.type === "spot_light") {
      const d = e.root.querySelector('[data-role="object-cone-angle"]');
      d && d.value !== "" && (t.cone_angle = U(Number(d.value) || 45, 1, 90));
      const p = e.root.querySelector('[data-role="object-penumbra"]');
      p && p.value !== "" && (t.penumbra = U(Number(p.value) || 0.25, 0, 1));
    }
  }
  e.commitObjectEdit(t), e.refreshObjects(), e.render();
}
function as(e, t) {
  if (!t) return null;
  if (t.locked)
    return e.setStatus(r("{value1} is locked", { value1: t.name || t.type })), null;
  t.keyframes ||= [];
  let a = Zn(
    t.keyframes,
    e.frame,
    e.state.auto_key ? null : e.selectedKeyFrame,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, transform: ze(t), interpolation: e.root.querySelector('[data-role="interp"]')?.value || "ease" }, t.keyframes.push(a), t.keyframes.sort((o, n) => o.frame - n.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame, e.updateKeyVisualState()) : a && (e.selectedKeyFrame = a.frame, e.updateKeyVisualState()), a;
}
function vh(e, t) {
  const a = as(e, t);
  a && (a.transform = ze(t)), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor();
}
function os(e) {
  const t = Wo(e.camera);
  ["camera-rx", "camera-ry", "camera-rz"].forEach((a, o) => {
    for (const n of e.root.querySelectorAll(`[data-role="${a}"]`))
      document.activeElement !== n && (n.value = String(Math.round(t[o] * 1e4) / 1e4));
  });
}
function xh(e) {
  ["camera-tx", "camera-ty", "camera-tz"].forEach((t, a) => {
    for (const o of e.root.querySelectorAll(`[data-role="${t}"]`))
      document.activeElement !== o && (o.value = String(Math.round(e.camera.target[a] * 1e4) / 1e4));
  });
}
function kh(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastCameraHudEditAt) || t - e.lastCameraHudEditAt > 300) && e.checkpoint("Edit camera"), e.lastCameraHudEditAt = t;
  const a = (s, i) => {
    const c = e.root.querySelector(`[data-role="${s}"]`);
    if (!c || c.value === "") return i;
    const l = Number(c.value);
    return Number.isFinite(l) ? l : i;
  }, o = Wo(e.camera), n = [
    U(a("camera-rx", o[0]), -90, 90),
    a("camera-ry", o[1]),
    U(a("camera-rz", o[2]), -180, 180)
  ];
  e.beginCameraEdit(), Ai(e.camera, n), e.commitCameraEdit(), e.finishCameraEdit(), os(e), xh(e), e.render();
}
function wh(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastCameraHudEditAt) || t - e.lastCameraHudEditAt > 300) && e.checkpoint("Edit camera"), e.lastCameraHudEditAt = t;
  const a = (o, n) => {
    const s = e.root.querySelector(`[data-role="${o}"]`);
    if (!s || s.value === "") return n;
    const i = Number(s.value);
    return Number.isFinite(i) ? i : n;
  };
  e.camera.position = [a("camera-px", e.camera.position[0]), a("camera-py", e.camera.position[1]), a("camera-pz", e.camera.position[2])], e.camera.target = [a("camera-tx", e.camera.target[0]), a("camera-ty", e.camera.target[1]), a("camera-tz", e.camera.target[2])], e.camera.fov = U(a("camera-fov", e.camera.fov), 5, 150), e.camera.roll = U(a("camera-roll", e.camera.roll || 0), -180, 180), e.camera.near = Math.max(1e-4, a("camera-near", e.camera.near)), e.camera.far = Math.max(e.camera.near + 1e-4, a("camera-far", e.camera.far)), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), os(e), e.render();
}
function Sh(e, t) {
  const a = $t(e);
  if (!a) return;
  e.checkpoint("Set parent"), a.parent_id = t || null, e.serialize(), e.refreshObjects(), e.render();
  const o = e.state.objects.find((n) => n.id === t);
  e.setStatus(o ? r("{value1} parented to {value2}", { value1: a.name || a.type, value2: o.name || o.type }) : r("{value1} unparented", { value1: a.name || a.type }));
}
function jh(e, t) {
  const a = $t(e);
  a && (e.checkpoint("Select animation"), a.animation_index = Math.max(0, t || 0), e.serialize(), e.webgl?.selectAnimation(a.id, t), e.setStatus(r("Animation: {value1}", { value1: e.modelInfoById.get(a.id)?.animationNames?.[t] || t + 1 })));
}
function Ch(e, t) {
  e.objectUrls.revoke(t), Et(e, t), e.modelUrlsById.delete(t), e.modelInfoById.delete(t), e.webgl?.removeModel(t);
}
function _h(e) {
  const t = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((o) => o && e.state.objects.some((n) => n.id === o));
  if (!t.length) return [];
  if (t.length === 1)
    return es(e, t[0]), e.selectedObjectId ? [e.selectedObjectId] : [];
  e.checkpoint("Duplicate objects");
  const a = [];
  return t.forEach((o, n) => {
    const s = e.state.objects.find((l) => l.id === o);
    if (!s) return;
    const i = JSON.parse(JSON.stringify(s));
    i.id = `${s.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, i.name = `${s.name || s.type} Copy`;
    const c = 0.35 + n * 0.15;
    i.position = ve(i.position || [0, 0, 0], [c, 0, c]), (i.type === "model" || i.type === "glb") && e.modelUrlsById.has(s.id) ? e.modelUrlsById.set(i.id, e.modelUrlsById.get(s.id)) : i.type === "card" && e.cardMediaById.has(s.id) && qe(e, i.id, e.cardMediaById.get(s.id), !1, i.asset || e.cardMediaAssetById?.get?.(s.id) || ""), e.state.objects.push(i), a.push(i.id);
  }), a.length && (e.selectedEntity = "object", e.selectedObjectIds = new Set(a), e.selectedObjectId = a[a.length - 1], e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(r("Duplicated {count} objects").replace("{count}", String(a.length)))), a;
}
function Eh(e, t = null) {
  const a = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((s) => s && e.state.objects.some((i) => i.id === s));
  if (!a.length) return;
  const o = e.state.objects.find((s) => s.id === (e.selectedObjectId || a[0])), n = typeof t == "boolean" ? t : !(o?.enabled ?? !0);
  e.checkpoint("Toggle objects visibility");
  for (const s of a) {
    const i = e.state.objects.find((c) => c.id === s);
    i && (i.enabled = n);
  }
  e.serialize(), e.refreshObjects(), e.render(), e.setStatus(
    n ? r("Show {count} objects").replace("{count}", String(a.length)) : r("Hide {count} objects").replace("{count}", String(a.length))
  );
}
function $h(e, t = null) {
  const a = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((s) => s && e.state.objects.some((i) => i.id === s));
  if (!a.length) return;
  const o = e.state.objects.find((s) => s.id === (e.selectedObjectId || a[0])), n = typeof t == "boolean" ? t : !(o?.locked ?? !1);
  e.checkpoint("Lock objects");
  for (const s of a) {
    const i = e.state.objects.find((c) => c.id === s);
    i && (i.locked = n);
  }
  e.serialize(), e.refreshObjects(), e.refreshInspector(), e.render(), e.setStatus(
    n ? r("Locked {count} objects").replace("{count}", String(a.length)) : r("Unlocked {count} objects").replace("{count}", String(a.length))
  );
}
function Mh(e) {
  const t = (e.state.objects || []).filter((a) => a.id);
  t.length && (e.finishCameraEdit?.(), e.selectedEntity = "object", e.selectedObjectIds = new Set(t.map((a) => a.id)), e.selectedObjectId = t[t.length - 1].id, e.outlinerAnchorId = e.selectedObjectId, e.selectedKeyFrame = null, e.editingKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(r("Selected all {count} objects").replace("{count}", String(t.length))));
}
function rs(e) {
  e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.outlinerAnchorId = null, e.selectedKeyFrame = e.state.keyframes.find((t) => t.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(r("Selection cleared"));
}
function Th(e) {
  const t = e.selectedObjectIds || new Set(e.selectedObjectId ? [e.selectedObjectId] : []), a = (e.state.objects || []).map((o) => o.id).filter((o) => o && !t.has(o));
  if (!a.length) {
    rs(e);
    return;
  }
  e.finishCameraEdit?.(), e.selectedEntity = "object", e.selectedObjectIds = new Set(a), e.selectedObjectId = a[a.length - 1], e.outlinerAnchorId = e.selectedObjectId, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(r("Inverted selection ({count} objects)").replace("{count}", String(a.length)));
}
function Ah(e, t) {
  return t(un(e), e.frame);
}
function we(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function ue(e) {
  const t = we(e);
  return t ? (Array.isArray(t.keyframes) || (t.keyframes = []), t.keyframes) : (e.activeCameraTrack ? e.activeCameraTrack() : null)?.keyframes || e.state.keyframes;
}
function Ph(e, t) {
  for (const a of e.state.objects) {
    if (!a.keyframes?.length) continue;
    const o = t(a, e.frame);
    a.position = o.position, a.rotation = o.rotation, a.size = o.size;
  }
}
function Ih(e) {
  e.checkpoint("Set keyframe");
  const t = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease", a = we(e);
  a && !Array.isArray(a.keyframes) && (a.keyframes = []);
  const o = ue(e), n = a ? { frame: e.frame, transform: ze(a), interpolation: t } : { frame: e.frame, camera: le(e.camera), interpolation: t }, s = o.findIndex((i) => i.frame === e.frame);
  s >= 0 ? o[s] = n : o.push(n), o.sort((i, c) => i.frame - c.frame), !a && e.syncActiveCameraTrack && e.syncActiveCameraTrack(), e.selectedKeyFrame = e.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([e.frame]), e.editingKeyFrame = null, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor(), e.setStatus(r("{value1} {value2} @ {value3}", { value1: a?.name || "Camera", value2: s >= 0 ? "key updated" : "key inserted", value3: e.frame }));
}
function zh(e, t) {
  const a = ue(e), o = e.selectedKeyFrames && e.selectedKeyFrames.size >= 2 ? e.selectedKeyFrames : null, n = o ? a.filter((i) => o.has(i.frame)) : [Fe(e)].filter(Boolean);
  if (!n.length) return;
  e.checkpoint(n.length > 1 ? r("Interpolation on {n} keys").replace("{n}", n.length) : "Change key interpolation");
  for (const i of n)
    i.interpolation = t;
  const s = e.root.querySelector('[data-role="key-interp"]');
  s && (s.value = t);
  for (const i of e.root.querySelectorAll(".key-interp-buttons [data-interp]"))
    i.classList.toggle("active", i.dataset.interp === t);
  for (const i of e.root.querySelectorAll("[data-curve-mode]")) {
    const c = i.dataset.curveMode === t;
    i.classList.toggle("active", c), i.setAttribute("aria-pressed", String(c));
  }
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(n.length > 1 ? r("{mode} interpolation on {n} keys").replace("{mode}", t.replace(/_/g, " ")).replace("{n}", n.length) : r("Key @ {value1} interpolation set to {value2}", { value1: n[0].frame, value2: t }));
}
function Fh(e) {
  const t = we(e), a = ue(e);
  if (!t && a.length <= 1) return e.setStatus(r("Keep at least one camera keyframe"));
  const o = Fe(e) || a.find((i) => i.frame === e.frame);
  if (!o) return e.setStatus(r("Select a keyframe to delete"));
  e.checkpoint("Delete keyframe"), t ? t.keyframes = a.filter((i) => i !== o) : e.state.keyframes = a.filter((i) => i !== o);
  const n = ue(e), s = o.frame;
  e.editingKeyFrame === s && (e.editingKeyFrame = null), e.selectedKeyFrame = n.length ? n.reduce((i, c) => Math.abs(c.frame - s) < Math.abs(i.frame - s) ? c : i).frame : null, e.camera = xe(e.state, e.frame), e.applyObjectAnimationFrame(), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(r("{value1} key deleted @ {value2}", { value1: t?.name || "Camera", value2: s }));
}
function Lh(e) {
  const t = we(e), a = Fe(e) || ue(e).find((o) => o.frame === e.frame);
  e.copiedKeyframe = t ? { kind: "object", transform: ze(a?.transform || t), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" } : { kind: "camera", camera: le(a?.camera || e.camera), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" }, e.setStatus(r("Keyframe copied @ {value1}", { value1: a?.frame ?? e.frame }));
}
function Oh(e) {
  if (!e.copiedKeyframe) return e.setStatus(r("Copy a keyframe first"));
  const t = we(e), a = t ? "object" : "camera";
  if (e.copiedKeyframe.kind !== a) return e.setStatus(r("Copy a {value1} keyframe first", { value1: a }));
  e.checkpoint("Paste keyframe");
  const o = t ? { frame: e.frame, transform: ze(e.copiedKeyframe.transform), interpolation: e.copiedKeyframe.interpolation } : { frame: e.frame, camera: le(e.copiedKeyframe.camera), interpolation: e.copiedKeyframe.interpolation }, n = ue(e), s = n.findIndex((i) => i.frame === e.frame);
  s >= 0 ? n[s] = o : n.push(o), n.sort((i, c) => i.frame - c.frame), e.selectedKeyFrame = o.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([o.frame]), e.editingKeyFrame = null, t ? (t.position = [...o.transform.position], t.rotation = [...o.transform.rotation], t.size = [...o.transform.size]) : e.camera = le(o.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(r("Keyframe pasted @ {value1}", { value1: o.frame }));
}
function Fe(e) {
  return ue(e).find((t) => t.frame === e.selectedKeyFrame) || null;
}
function Kh(e, t) {
  t && (e.selectedKeyFrame = t.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([t.frame]), e.editingKeyFrame = null, we(e) || (e.pathSelection = Pi(e.pathSelection, { cameraId: e.state.active_camera_id, frame: t.frame, additive: !1 })), e.setFrame(t.frame));
}
function Dh(e) {
  const t = e.activeCameraTrack();
  if (t?.locked)
    return e.setStatus(r("{value1} is locked", { value1: t.name })), null;
  let a = Zn(
    e.state.keyframes,
    e.frame,
    !e.state.auto_key && e.selectedEntity === "camera" ? e.selectedKeyFrame : null,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, camera: le(e.camera), interpolation: e.root.querySelector('[data-role="key-interp"]')?.value || "ease" }, e.state.keyframes.push(a), e.state.keyframes.sort((o, n) => o.frame - n.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame) : a && (e.selectedKeyFrame = a.frame), e.cameraEditKey = a || null, e.cameraEditActive = !0, e.updateKeyVisualState(), a;
}
function Rh(e) {
  const t = e.cameraEditKey;
  t && (t.camera = le(e.camera), e.frame = t.frame, e.selectedKeyFrame = t.frame), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.render();
}
function Nh(e) {
  if (e.cameraEditActive) {
    if (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, e.selectedKeyFrame === null) {
      const t = e.state.keyframes.find((a) => a.frame === e.frame);
      t && (e.selectedKeyFrame = t.frame);
    }
    e.refreshKeys();
  }
}
function qh(e, t = !1) {
  e.editingKeyFrame === null && (!t || e.selectedKeyFrame === null && !e.selectedKeyFrames?.size) || (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, t && (e.selectedKeyFrame = null, e.selectedKeyFrames = null), e.refreshKeys());
}
function Bh(e) {
  e.state.auto_key = !e.state.auto_key, e.state.auto_key || e.exitKeyEdit(!1), e.serialize(), e.updateEditState(), e.setStatus(r("Auto Key {value1}", { value1: e.state.auto_key ? "on" : "off" }));
}
const Wh = ["guides", "safe-areas", "resolution-gate", "aspect-ratio"];
function Vh(e) {
  const t = e.root.querySelector(".viewport-wrap"), a = e.editingKeyFrame !== null, o = !!e.state.auto_key;
  t && (t.classList.toggle("edit-mode", a), t.classList.toggle("auto-key", o));
  for (const p of e.root.querySelectorAll('[data-act="auto-key"]'))
    p.classList.toggle("active", o), p.setAttribute("aria-pressed", String(o)), p.title = r("Auto Key {value1}", { value1: o ? "on" : "off" });
  const n = e.state.view_mode === "camera";
  for (const p of Wh)
    for (const f of e.root.querySelectorAll(`[data-role="${p}"]`)) {
      f.disabled = !n;
      const u = f.closest("label");
      u && u.classList.toggle("oc-disabled", !n), f.title = n ? "" : r("Available in Camera View only");
    }
  const s = e.activeCameraTrack(), i = e.selectedObject(), c = e.root.querySelector('[data-role="tally-banner"]'), l = e.root.querySelector('[data-role="tally-text"]');
  if (c && l)
    if (a) {
      c.hidden = !1;
      const p = i ? i.name || i.type : s.name;
      l.textContent = `REC KEY @ F${e.editingKeyFrame} (${p})`;
    } else o ? (c.hidden = !1, l.textContent = `● AUTO-KEY ON (F${e.frame})`) : c.hidden = !0;
  const d = e.root.querySelector('[data-role="viewport-state"]');
  d && (a ? d.textContent = i ? `● EDITING ${i.name || i.type} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : `● EDITING ${s.name} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : o ? d.textContent = i ? `● AUTO KEY · ${i.name || i.type}` : `● AUTO KEY · ${s.name}` : i ? d.textContent = `SELECTED: ${i.name || i.type}` : d.textContent = e.state.view_mode === "camera" ? `CAMERA: ${s.name}` : `VIEW: ${e.state.view_mode.toUpperCase()}`), zn(e), Jm(e), Ee(e);
}
function Hh(e) {
  const t = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const a of e.root.querySelectorAll("[data-key-frame]")) {
    const o = Number(a.dataset.keyFrame);
    a.classList.toggle("selected", t.has(o)), a.classList.toggle("editing", o === e.editingKeyFrame), a.classList.toggle("at-playhead", o === e.frame);
  }
  e.updateEditState();
}
function Uh(e, t) {
  const a = ue(e), o = e.selectedKeyFrames && e.selectedKeyFrames.size >= 2 ? e.selectedKeyFrames : null, n = o ? a.filter((i) => o.has(i.frame)) : [Fe(e)].filter(Boolean);
  if (!n.length) return;
  e.checkpoint(n.length > 1 ? r("Tangents on {n} keys").replace("{n}", n.length) : "Change key tangent mode");
  for (const i of n)
    i.tangents = i.tangents && typeof i.tangents == "object" ? i.tangents : {}, i.tangents.mode = t, i.tangent_mode = t, t !== "auto" && i.interpolation !== "bezier" && (i.interpolation = "bezier");
  const s = e.root.querySelector('[data-role="key-tangent-mode"]');
  s && (s.value = t);
  for (const i of e.root.querySelectorAll("[data-tangent]"))
    i.classList.toggle("active", i.dataset.tangent === t);
  for (const i of e.root.querySelectorAll("[data-tangent-mode]")) {
    const c = i.dataset.tangentMode === t;
    i.classList.toggle("active", c), i.setAttribute("aria-pressed", String(c));
  }
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(n.length > 1 ? r("{mode} tangents on {n} keys").replace("{mode}", t).replace("{n}", n.length) : r("Key @ {frame} tangent mode set to {mode}").replace("{frame}", String(n[0].frame)).replace("{mode}", t));
}
function Gh(e) {
  const t = e.root.querySelector('[data-role="path-diagnostics-list"]');
  if (!t) return;
  t.innerHTML = "";
  const a = e.activeCameraTrack?.()?.keyframes || [];
  if (a.length < 2) {
    t.hidden = !0;
    return;
  }
  t.hidden = !1;
  const o = nh({ keys: a, fps: e.state?.fps || 24, objects: e.state?.objects || [] });
  if (!o.length) {
    const n = document.createElement("div");
    n.className = "oc-diagnostic-ok", n.textContent = r("No path issues detected"), t.appendChild(n);
    return;
  }
  for (const n of o.slice(0, 8)) {
    const s = document.createElement("div");
    s.className = `oc-diagnostic oc-diagnostic-${n.severity}`, s.textContent = `⚠ ${n.message}`, t.appendChild(s);
  }
}
function Xh(e) {
  const t = we(e), a = Fe(e), o = e.root.querySelector('[data-role="key-editor"]');
  o && (o.dataset.empty = String(!a));
  const n = e.root.querySelector('[data-role="selected-key-label"]');
  n && (n.textContent = a ? r("{value1} Key @ {value2}", { value1: t?.name || "Camera", value2: a.frame }) : r("No {value1} key selected", { value1: t ? "object" : "camera" }));
  const s = ["key-frame", "key-interp", "key-tangent-mode", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type", "key-timing-weight"];
  for (const m of s) {
    const h = e.root.querySelector(`[data-role="${m}"]`);
    h && (h.disabled = !a || !!(t && !["key-frame", "key-interp", "key-tangent-mode"].includes(m)));
  }
  const i = e.root.querySelector('[data-act="update-key"]');
  i && (i.disabled = !a || !!t);
  const c = e.root.querySelector('[data-act="view-key"]');
  c && (c.disabled = !a || !!t);
  const l = e.root.querySelector('[data-act="redistribute-key-timing"]');
  l && (l.disabled = !!t || (e.activeCameraTrack?.()?.keyframes?.length || 0) < 2);
  for (const m of e.root.querySelectorAll(".key-interp-buttons [data-interp]"))
    m.classList.toggle("active", !!(a && m.dataset.interp === a.interpolation)), m.disabled = !a;
  const d = a?.tangents?.mode || a?.tangent_mode || "auto", p = e.root.querySelector('[data-role="key-tangent-mode"]');
  p && document.activeElement !== p && (p.value = d);
  for (const m of e.root.querySelectorAll("[data-tangent]"))
    m.classList.toggle("active", !!(a && m.dataset.tangent === d)), m.disabled = !a;
  const f = e.root.querySelector('[data-role="key-timecode"]');
  if (f) {
    const m = Math.max(1, e.state?.fps || 24), h = a ? a.frame : e.frame, y = Math.floor(h / m), b = h % Math.round(m), x = String(Math.floor(y / 3600)).padStart(2, "0"), g = String(Math.floor(y % 3600 / 60)).padStart(2, "0"), k = String(y % 60).padStart(2, "0"), v = String(b).padStart(2, "0");
    f.textContent = `${x}:${g}:${k}:${v} (${h}f)`;
  }
  if (Gh(e), !a) return;
  if (t) {
    const m = e.root.querySelector('[data-role="key-frame"]');
    m && document.activeElement !== m && (m.value = String(a.frame));
    const h = e.root.querySelector('[data-role="key-interp"]');
    h && document.activeElement !== h && (h.value = a.interpolation);
    return;
  }
  const u = {
    "key-frame": a.frame,
    "key-interp": a.interpolation,
    "key-tangent-mode": d,
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
    "key-timing-weight": Ke(a)
  };
  for (const [m, h] of Object.entries(u)) {
    const y = e.root.querySelector(`[data-role="${m}"]`);
    y && document.activeElement !== y && (y.value = String(h));
  }
}
function Yh(e, t, a = !1, o = {}) {
  const n = Fe(e);
  if (!n) return;
  const s = ue(e);
  let i = U(Math.round(t), 0, e.state.duration_frames - 1);
  const c = (d) => s.some((p) => p !== n && p.frame === d);
  if (c(i) && a)
    for (let d = 1; d < e.state.duration_frames; d++) {
      const p = [i - d, i + d].filter((f) => f >= 0 && f < e.state.duration_frames).find((f) => !c(f));
      if (p !== void 0) {
        i = p;
        break;
      }
    }
  if (c(i))
    return e.refreshKeyEditor(), e.setStatus(r("Frame {value1} already has a keyframe", { value1: i }));
  if (i === n.frame) return;
  o.checkpoint !== !1 && e.checkpoint("Move keyframe");
  const l = e.editingKeyFrame === n.frame;
  n.frame = i, e.selectedKeyFrame = i, e.editingKeyFrame = l ? i : null, e.frame = i, s.sort((d, p) => d.frame - p.frame), e.serialize(), e.setFrame(i), e.setStatus(r("Keyframe moved to {value1}", { value1: i }));
}
function Zh(e) {
  const t = Fe(e);
  if (!t) return;
  if (e.checkpoint("Edit keyframe"), e.editingKeyFrame = t.frame, we(e)) {
    t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.transform = ze(we(e)), e.serialize(), e.setFrame(t.frame), e.setStatus(r("Object keyframe updated @ {value1}", { value1: t.frame }));
    return;
  }
  const a = (n, s) => {
    const i = Number(e.root.querySelector(`[data-role="${n}"]`).value);
    return Number.isFinite(i) ? i : s;
  };
  if (t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.camera.position = [a("key-px", t.camera.position[0]), a("key-py", t.camera.position[1]), a("key-pz", t.camera.position[2])], t.camera.target = [a("key-tx", t.camera.target[0]), a("key-ty", t.camera.target[1]), a("key-tz", t.camera.target[2])], t.camera.fov = U(a("key-fov", t.camera.fov), 5, 150), t.camera.roll = U(a("key-roll", t.camera.roll || 0), -180, 180), t.camera.zoom = Math.max(0.01, a("key-zoom", t.camera.zoom || 1)), t.camera.near = Math.max(1e-4, a("key-near", t.camera.near)), t.camera.far = Math.max(t.camera.near + 1e-4, a("key-far", t.camera.far)), t.camera.camera_type = e.root.querySelector('[data-role="key-camera-type"]').value, e.root.querySelector('[data-role="key-timing-weight"]')) {
    const n = Do(t, a("key-timing-weight", Ke(t)));
    n.timing ? t.timing = n.timing : delete t.timing;
  }
  e.camera = le(t.camera), e.frame = t.frame, e.serialize(), e.setFrame(t.frame), e.setStatus(r("Keyframe updated @ {value1}", { value1: t.frame }));
}
function Jh(e) {
  const t = Fe(e);
  t && (e.setFrame(t.frame), e.setStatus(r("Loaded keyframe @ {value1}", { value1: t.frame })));
}
function Qh(e, t) {
  const a = ue(e);
  if (!a.length) return;
  const o = t < 0 ? [...a].reverse().find((n) => n.frame < e.frame) || a[a.length - 1] : a.find((n) => n.frame > e.frame) || a[0];
  e.selectKeyframe(o);
}
function eu(e) {
  switch (e) {
    case "auto":
      return r("Auto Smooth");
    case "aligned":
      return r("Aligned");
    case "free":
      return r("Free");
    case "corner":
      return r("Corner");
    default:
      return e;
  }
}
function Co(e, t, a, o) {
  const n = e.selectedEntity === "object" && o(e) ? "object" : "camera", s = (e.selectedKeyFrames?.size || 0) >= 2 ? ` (${r("Selection")})` : "";
  return [
    { label: `${r("Smooth keys")}${s}`, icon: "pi-wave-pulse", help: r("Smooth motion across selected keys"), run: () => e.smoothSelectedKeyframes() },
    { label: `${r("Simplify keys")}${s}`, icon: "pi-chart-line", help: r("Drop keys that barely change the motion"), run: () => e.simplifyActiveKeys({ mode: "simplify", tolerance: 0.35, scope: n }) },
    {
      label: `${r("Reduce keys…")}${s}`,
      icon: "pi-minus-circle",
      help: r("Decimate down to a target key count"),
      run: async () => {
        const i = await t(a, r("Reduce keys"), r("Target number of keys"), "8"), c = Math.round(Number(i));
        Number.isFinite(c) && c >= 2 && e.simplifyActiveKeys({ mode: "reduce", target: c, scope: n });
      }
    },
    { label: `${r("Clean keys")}${s}`, icon: "pi-filter", help: r("Remove duplicate, too-close and redundant keys"), run: () => e.simplifyActiveKeys({ mode: "clean", scope: n }) }
  ];
}
function _o(e) {
  const t = (e.selectedKeyFrames?.size || 0) >= 2 ? ` (${r("Selection")})` : "";
  return [
    { label: `${r("Handheld")}${t}`, icon: "pi-camera", run: () => e.applyCameraShake("handheld") },
    { label: `${r("Subtle")}${t}`, icon: "pi-compass", run: () => e.applyCameraShake("subtle") },
    { label: `${r("Handheld Shake")}${t}`, icon: "pi-arrows-v", run: () => e.applyCameraShake("handheld_subtle") },
    { label: `${r("Turbulence Shake")}${t}`, icon: "pi-bolt", run: () => e.applyCameraShake("turbulence") },
    { label: `${r("Crash")}${t}`, icon: "pi-exclamation-circle", run: () => e.applyCameraShake("crash") }
  ];
}
function tu(e) {
  const { app: t, promptText: a, timelineObject: o, resetTimelineZoom: n, resetCurveZoom: s, initializeTooltips: i } = e;
  return {
    closeMenus(c = null) {
      for (const l of this.root.querySelectorAll(".toolbar-menu")) l !== c && (l.open = !1);
      this.hideContextMenu();
    },
    initializeTooltips() {
      i(this.root, this.interactionElement);
    },
    hideContextMenu() {
      this.contextMenu?.hide();
    },
    showContextMenu(c, l, d) {
      return this.contextMenu.show(c, l, d);
    },
    onContextMenu(c) {
      if (c.preventDefault(), c.stopPropagation(), c.stopImmediatePropagation?.(), c.altKey) return;
      if (this.state.navigation_profile === "simple" && c.target?.closest?.(".viewport-wrap")) {
        if (this.lastRightClickWasDrag && !c.shiftKey) {
          this.lastRightClickWasDrag = !1;
          return;
        }
        this.lastRightClickWasDrag = !1;
      }
      const l = c.target, d = l.closest?.(".camera-preview-tile"), p = l.closest?.(".scene-item"), f = l.closest?.(".key"), u = l.closest?.(".oc-dope-key");
      if (d) return this.openCameraContext(c, d.dataset.cameraId, !0);
      if (p?.dataset.cameraId) return this.openCameraContext(c, p.dataset.cameraId, !1);
      if (p?.dataset.objectId) return this.openObjectContext(c, p.dataset.objectId);
      if (f || u) {
        const m = Number((f || u).dataset.keyFrame ?? (f || u).dataset.frame), h = this.timelineKeyframes().find((b) => b.frame === m), y = this.selectedKeyFrames?.has(m) && (this.selectedKeyFrames?.size || 0) >= 2;
        return !y && h ? this.selectKeyframe(h) : y && (this.selectedKeyFrame = m), this.openTimelineContext(c, !0);
      }
      if (l.closest?.('[data-role="keys"]'))
        return this.setFrame(this.timelineFrameFromEvent(c, l.closest('[data-role="keys"]'))), this.openTimelineContext(c, !1);
      if (l.closest?.('[data-role="dope-stage"]')) return this.openTimelineContext(c, !1);
      if (l.closest?.(".curve-editor")) {
        const m = l.closest?.("canvas");
        if (m && this.curveHitPoints) {
          const h = m.getBoundingClientRect(), y = c.clientX - h.left, b = c.clientY - h.top, x = this.curveHitPoints.map((g) => ({ point: g, distance: Math.hypot(y - g.x, b - g.y) })).sort((g, k) => g.distance - k.distance)[0];
          if (x && x.distance <= 14) {
            const g = x.point.frame;
            if (this.selectedKeyFrames?.has(g) && (this.selectedKeyFrames?.size || 0) >= 2)
              this.selectedKeyFrame = g;
            else {
              const v = this.timelineKeyframes().find(($) => $.frame === g);
              v && this.selectKeyframe(v);
            }
          }
        }
        return this.openCurveContext(c);
      }
      if (l.closest?.(".viewport-wrap")) {
        const m = this.interactionElement.getBoundingClientRect(), h = (c.clientX - m.left) * this.canvas.width / Math.max(1, m.width), y = (c.clientY - m.top) * this.canvas.height / Math.max(1, m.height), b = this.pickSceneObject([h, y]);
        if (b) {
          if ((b.type === "object" || b.type === "object_keyframe") && b.object)
            return this.selectedEntity = "object", this.selectedObjectId = b.object.id, b.keyframe ? (this.setFrame(b.keyframe.frame), this.selectedKeyFrame = b.keyframe.frame) : this.selectedKeyFrame = b.object.keyframes?.find((x) => x.frame === this.frame)?.frame ?? null, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.openObjectContext(c, b.object.id);
          if (["camera", "camera_target", "camera_keyframe"].includes(b.type) && b.camera)
            return this.selectedEntity = b.type === "camera_target" ? "camera_target" : "camera", this.selectedObjectId = null, this.activateCamera(b.camera.id), b.keyframe && (this.setFrame(b.keyframe.frame), this.selectedKeyFrame = b.keyframe.frame), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), b.type === "camera_keyframe" && b.keyframe ? this.openPathKeyContext(c, b.camera.id, b.keyframe.frame) : this.openCameraContext(c, b.camera.id, !1);
        }
        return this.openViewportContext(c);
      }
    },
    openViewportContext(c) {
      const l = this.selectedObject();
      this.showContextMenu(c, r("Viewport"), [
        {
          label: l ? `${r("Set key")} · ${l.name || l.type}` : `${r("Set key")} · ${this.activeCameraTrack().name}`,
          icon: "pi-key",
          shortcut: "I",
          run: () => this.insertKeyframe()
        },
        { label: r("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        { label: r("Set camera target here"), icon: "pi-bullseye", help: r("Set camera Look-At target to this 3D point in the scene"), run: () => this.setTargetAtCursor(c) },
        null,
        {
          label: r("Add object"),
          icon: "pi-plus-circle",
          items: [
            { label: r("Sphere"), icon: "pi-circle", run: () => this.addPrimitive("sphere") },
            { label: r("Cube"), icon: "pi-stop", run: () => this.addPrimitive("cube") },
            { label: r("Pyramide"), icon: "pi-caret-up", run: () => this.addPrimitive("pyramid") },
            { label: r("Sun light"), icon: "pi-sun", run: () => this.addPrimitive("sun_light") },
            { label: r("Point light"), icon: "pi-bolt", run: () => this.addPrimitive("point_light") },
            { label: r("Spot light"), icon: "pi-forward", run: () => this.addPrimitive("spot_light") },
            { label: r("Camera"), icon: "pi-video", run: () => this.addCamera() },
            null,
            {
              label: r("Assets"),
              icon: "pi-box",
              items: [
                { label: r("Card"), icon: "pi-image", run: () => this.addPrimitive("card") },
                { label: r("Cylinder"), icon: "pi-database", run: () => this.addPrimitive("cylinder") },
                { label: r("Torus"), icon: "pi-circle", run: () => this.addPrimitive("torus") },
                { label: r("Human"), icon: "pi-user", run: () => this.addPrimitive("human") },
                { label: r("Null"), icon: "pi-plus", run: () => this.addPrimitive("null") },
                null,
                { label: r("Import 3D Model (+)"), icon: "pi-upload", run: () => this.root.querySelector('[data-act="load-model"]')?.click() }
              ]
            }
          ]
        },
        {
          label: r("Selection"),
          icon: "pi-check-square",
          items: [
            { label: r("Select all"), icon: "pi-check-square", shortcut: "Ctrl+A", run: () => this.selectAllObjects() },
            { label: r("Deselect all"), icon: "pi-times", shortcut: "Alt+A", run: () => this.deselectAll() },
            { label: r("Invert selection"), icon: "pi-sync", shortcut: "Ctrl+I", run: () => this.invertSelection() },
            null,
            {
              label: r("Box selection tool"),
              icon: "pi-stop",
              shortcut: "B",
              run: () => {
                this.boxSelectMode = !0, this.interactionElement?.style && (this.interactionElement.style.cursor = "crosshair"), this.setStatus(r("Box select mode (drag over objects in viewport)"));
              }
            }
          ]
        },
        {
          label: r("Camera & Views"),
          icon: "pi-eye",
          items: [
            { label: r("Camera View (Active)"), icon: "pi-video", checked: this.state.view_mode === "camera", run: () => this.setViewMode("camera") },
            { label: r("Perspective View"), icon: "pi-compass", checked: this.state.view_mode === "perspective", run: () => this.setViewMode("perspective") },
            { label: r("Top"), icon: "pi-arrow-up", checked: this.state.view_mode === "top", run: () => this.setViewMode("top") },
            { label: r("Front"), icon: "pi-arrow-circle-up", checked: this.state.view_mode === "front", run: () => this.setViewMode("front") },
            { label: r("Right"), icon: "pi-arrow-right", checked: this.state.view_mode === "right", run: () => this.setViewMode("right") },
            { label: r("ISO"), icon: "pi-box", checked: this.state.view_mode === "iso", run: () => this.setViewMode("iso") },
            null,
            { label: r("Show / hide camera previews"), icon: "pi-images", run: () => this.toggleCameraView() }
          ]
        },
        null,
        {
          label: r("Tools & Playblast"),
          icon: "pi-cog",
          items: [
            { label: r("Record primary preview"), icon: "pi-video", run: () => this.makePlayblast() },
            null,
            { label: r("Clear caches & clean memory"), icon: "pi-trash", danger: !0, run: () => this.clearCaches() }
          ]
        }
      ]);
    },
    openObjectContext(c, l) {
      const d = this.state.objects.find((u) => u.id === l);
      if (!d) return;
      this.selectedEntity = "object", this.selectedObjectId = l, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
      const p = ["sun_light", "point_light", "spot_light"].includes(d.type), f = this.selectedObjectIds?.size || 0;
      if (f >= 2 && this.selectedObjectIds.has(l)) {
        this.showContextMenu(c, `${f} ${r("objects selected")}`, [
          { label: r("Duplicate {count} objects").replace("{count}", String(f)), icon: "pi-copy", shortcut: "Shift+D", run: () => this.duplicateSelectedObjects() },
          { label: r("Toggle visibility"), icon: "pi-eye", shortcut: "H", run: () => this.toggleSelectedObjects() },
          { label: r("Toggle lock"), icon: "pi-lock", shortcut: "L", run: () => this.lockSelectedObjects() },
          null,
          {
            label: r("Transform mode"),
            icon: "pi-arrows-alt",
            items: [
              { label: r("Translate"), icon: "pi-arrows-alt", shortcut: "W", checked: (this.state.gizmo_mode || "translate") === "translate", run: () => this.setTransformMode("translate") },
              { label: r("Rotate"), icon: "pi-refresh", shortcut: "E", checked: this.state.gizmo_mode === "rotate", run: () => this.setTransformMode("rotate") },
              { label: r("Scale"), icon: "pi-expand", shortcut: "R", checked: this.state.gizmo_mode === "scale", run: () => this.setTransformMode("scale") }
            ]
          },
          null,
          {
            label: r("Reset entire animation"),
            icon: "pi-replay",
            danger: !0,
            run: () => {
              for (const u of this.selectedObjectIds) this.resetObjectAnimation(u);
            }
          },
          { label: r("Delete {count} objects").replace("{count}", String(f)), icon: "pi-trash", danger: !0, shortcut: "Del", run: () => this.deleteSelectedObjects() },
          null,
          { label: r("Deselect all"), icon: "pi-times", shortcut: "Alt+A", run: () => this.deselectAll() }
        ]);
        return;
      }
      this.showContextMenu(c, d.name || d.type, [
        { label: r("Set key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: r("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        { label: r("Rename object…"), icon: "pi-pencil", run: () => this.renameObject(l) },
        { label: r("Duplicate object"), icon: "pi-copy", run: () => this.duplicateObject(l) },
        { label: d.enabled === !1 ? r("Show object") : r("Hide object"), icon: d.enabled === !1 ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(l) },
        { label: d.locked ? r("Unlock object") : r("Lock object"), icon: d.locked ? "pi-lock" : "pi-lock-open", run: () => Zo(this, d) },
        null,
        {
          label: r("Transform mode"),
          icon: "pi-arrows-alt",
          items: [
            { label: r("Translate"), icon: "pi-arrows-alt", shortcut: "W", checked: (this.state.gizmo_mode || "translate") === "translate", run: () => this.setTransformMode("translate") },
            { label: r("Rotate"), icon: "pi-refresh", shortcut: "E", checked: this.state.gizmo_mode === "rotate", run: () => this.setTransformMode("rotate") },
            { label: r("Scale"), icon: "pi-expand", shortcut: "R", disabled: p, checked: this.state.gizmo_mode === "scale", run: () => this.setTransformMode("scale") }
          ]
        },
        {
          label: r("Tracking & Constraints"),
          icon: "pi-bullseye",
          items: [
            { label: r("Camera tracks this object (Look-At)"), icon: "pi-bullseye", help: r("Lock camera live look-at tracking to this moving object"), run: () => this.aimAtSelectedObject(l) },
            { label: r("Bake tracking to all camera keys"), icon: "pi-check-square", help: r("Write this object's motion into camera target keyframes"), run: () => this.bakeAimToKeyframes() },
            null,
            { label: r("Select hierarchy"), icon: "pi-sitemap", shortcut: "Shift+G", help: r("Select this object and all descendants"), run: () => this.selectHierarchy(l) }
          ]
        },
        ...p ? [
          {
            label: r("Light"),
            icon: "pi-sun",
            items: [
              {
                label: r("Shadow"),
                icon: "pi-circle-fill",
                checked: d.cast_shadow !== !1,
                run: () => {
                  this.checkpoint("Toggle light shadow"), d.cast_shadow = d.cast_shadow === !1, this.serialize(), this.refreshInspector(), this.render();
                }
              }
            ]
          }
        ] : [],
        null,
        { label: r("Reset entire animation"), icon: "pi-replay", danger: !0, help: r("Delete every animation key and return position/rotation to zero"), run: () => this.resetObjectAnimation(l) },
        null,
        { label: r("Delete object"), icon: "pi-trash", danger: !0, disabled: l === "subject", help: l === "subject" ? r("The canonical subject card cannot be deleted") : r("Delete this object and its animation keys"), run: () => this.deleteObject(l) }
      ]);
    },
    openCameraContext(c, l, d = !1) {
      const p = this.state.cameras.find((f) => f.id === l);
      p && (this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(l), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.showContextMenu(c, `${p.name}${d ? " preview" : ""}`, [
        { label: r("Edit this camera"), icon: "pi-video", run: () => this.activateCamera(l) },
        {
          label: r("Select whole path — move / scale / rotate"),
          icon: "pi-arrows-alt",
          disabled: (p.keyframes || []).length < 1,
          run: () => {
            this.activateCamera(l), this.selectCameraPath() && this.setStatus(`${p.name} · ${r("whole path selected — move / scale / rotate")}`);
          }
        },
        { label: r("Set as primary / playblast"), icon: "pi-star", disabled: l === this.state.playblast_camera_id, run: () => this.setPlayblastCamera(l) },
        { label: r("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => {
          this.activateCamera(l), this.insertKeyframe();
        } },
        { label: r("Record this preview"), icon: "pi-circle-fill", run: () => {
          this.setPlayblastCamera(l), this.makePlayblast();
        } },
        { label: this.state.maximized_camera_id === l ? r("Restore preview size") : r("Maximize preview"), icon: "pi-window-maximize", run: () => this.maximizeCameraPreview(l) },
        null,
        {
          label: r("Shot order & handles"),
          icon: "pi-sliders-h",
          items: [
            { label: r("Shot: move earlier"), icon: "pi-arrow-up", disabled: this.state.cameras.findIndex((f) => f.id === l) <= 0, run: () => this.moveShot(l, -1) },
            { label: r("Shot: move later"), icon: "pi-arrow-down", disabled: this.state.cameras.findIndex((f) => f.id === l) >= this.state.cameras.length - 1, run: () => this.moveShot(l, 1) },
            null,
            { label: r("Shot handles…"), icon: "pi-sliders-h", run: () => this.editShotHandles(l) }
          ]
        },
        null,
        { label: r("Rename camera…"), icon: "pi-pencil", run: () => this.renameCamera(l) },
        { label: r("Duplicate camera"), icon: "pi-copy", run: () => this.duplicateCamera(l) },
        { label: r("Create camera from current view"), icon: "pi-plus", run: () => this.addCamera() },
        null,
        { label: r("Reset entire animation"), icon: "pi-replay", danger: !0, help: r("Delete every camera key and return to a static zero pose at frame 0"), run: () => this.resetCameraAnimation(l) },
        null,
        { label: r("Delete camera"), icon: "pi-trash", danger: !0, disabled: this.state.cameras.length <= 1, run: () => this.deleteCamera(l) }
      ]));
    },
    openPathKeyContext(c, l, d) {
      const p = this.state.cameras.find((g) => g.id === l);
      if (!p) return;
      this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(l);
      const f = (p.keyframes || []).find((g) => g.frame === d) || null, u = this.selectedKeyFrames?.has(d) && (this.selectedKeyFrames?.size || 0) >= 2;
      !u && f ? this.selectKeyframe(f) : u && (this.selectedKeyFrame = d), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
      const m = f ? bo(f) : "auto", h = this.selectedKeyFrames?.size || 0, y = this.pathSelection?.component === "target", b = rn(p, this.state.objects), x = h >= 2 ? `${r("Path key")} (${r("{count} keys selected").replace("{count}", String(h))})` : `Path key F${d}`;
      this.showContextMenu(c, x, [
        { label: r("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: r("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        null,
        {
          label: r("Path Component"),
          icon: "pi-bullseye",
          help: b ? r("Driven by Look At -- target editing is disabled") : void 0,
          items: [
            { label: r("Position"), checked: !y, run: () => this.setPathSelectionComponent("position") },
            {
              label: r("Target"),
              checked: y,
              disabled: b,
              help: b ? r("Driven by Look At -- target editing is disabled") : void 0,
              run: () => this.setPathSelectionComponent("target")
            }
          ]
        },
        {
          label: r("Handle Type"),
          icon: "pi-share-alt",
          items: pn.map((g) => ({
            label: eu(g),
            checked: m === g,
            run: () => this.setSpatialHandleMode(g)
          }))
        },
        {
          label: r("Keyframe operations"),
          icon: "pi-sliders-v",
          items: Co(this, a, t, o)
        },
        {
          label: r("Camera Shake"),
          icon: "pi-sparkles",
          items: _o(this)
        },
        null,
        {
          label: h >= 2 ? r("Delete {count} keys").replace("{count}", String(h)) : r("Delete key"),
          icon: "pi-trash",
          danger: !0,
          disabled: (p.keyframes || []).length <= 1,
          run: () => this.deleteSelectedKeyframes()
        }
      ]);
    },
    moveShot(c, l) {
      const d = this.state.cameras.findIndex((u) => u.id === c), p = d + l;
      if (d < 0 || p < 0 || p >= this.state.cameras.length) return;
      this.checkpoint("Reorder shot");
      const [f] = this.state.cameras.splice(d, 1);
      this.state.cameras.splice(p, 0, f), this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${f.name} → #${p + 1}`);
    },
    async editShotHandles(c) {
      const l = this.state.cameras.find((u) => u.id === c);
      if (!l) return;
      const d = l.handles || { in: 0, out: 0 }, p = await a(t, r("Shot handles…"), "Handle frames: in,out", `${d.in},${d.out}`);
      if (p == null) return;
      const f = String(p).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
      if (!f) return this.setStatus("Handles must be two integers: in,out");
      this.checkpoint("Shot handles"), l.handles = { in: Math.min(600, Number(f[1])), out: Math.min(600, Number(f[2])) }, this.serialize(), this.setStatus(`${l.name} handles: ${l.handles.in} / ${l.handles.out}`);
    },
    openTimelineContext(c, l) {
      const d = this.selectedKeyFrames?.size || 0, p = this.selectedKeyframe(), f = p?.interpolation || "ease", u = p && bo(p) || "auto", m = ["ease", "linear", "bezier", "smooth", "ease_in", "ease_out", "sine", "cubic", "quintic", "expo", "back"], h = ["auto", "clamped", "vector", "free", "aligned", "flat"], y = d >= 2 ? r("{count} keys selected").replace("{count}", String(d)) : l ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`;
      this.showContextMenu(c, y, [
        { label: r("Fit timeline view (F)"), icon: "pi-arrows-alt", shortcut: "F", run: () => n(this) },
        { label: r("Set / replace key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: r("Copy selected key"), icon: "pi-copy", shortcut: "Ctrl+C", disabled: !p, run: () => this.copyKeyframe() },
        { label: r("Paste key at playhead"), icon: "pi-clipboard", shortcut: "Ctrl+V", disabled: !this.copiedKeyframe, run: () => this.pasteKeyframe() },
        null,
        {
          label: r("Interpolation"),
          icon: "pi-chart-line",
          disabled: !p && d < 2,
          items: m.map((b) => ({
            label: b.replaceAll("_", " "),
            checked: f === b,
            run: () => this.setSelectedKeysInterpolation(b)
          }))
        },
        {
          label: r("Tangents"),
          icon: "pi-share-alt",
          disabled: !p && d < 2,
          items: h.map((b) => ({
            label: b[0].toUpperCase() + b.slice(1),
            checked: u === b,
            run: () => this.setSelectedKeysTangentMode(b)
          }))
        },
        {
          label: r("Markers"),
          icon: "pi-bookmark",
          items: [
            { label: r("Add marker at playhead"), icon: "pi-bookmark", run: () => this.addMarker() },
            { label: r("Remove nearest marker"), icon: "pi-bookmark-fill", danger: !0, disabled: !(this.state.markers || []).length, run: () => this.removeNearestMarker() }
          ]
        },
        null,
        { label: r("Previous key"), icon: "pi-fast-backward", shortcut: ",", run: () => this.goToAdjacentKey(-1) },
        { label: r("Next key"), icon: "pi-fast-forward", shortcut: ".", run: () => this.goToAdjacentKey(1) },
        { label: this.state.auto_key ? r("Disable Auto Key") : r("Enable Auto Key"), icon: "pi-circle-fill", checked: !!this.state.auto_key, run: () => this.toggleAutoKey() },
        null,
        {
          label: r("Keyframe operations"),
          icon: "pi-sliders-v",
          items: Co(this, a, t, o)
        },
        {
          label: r("Camera Shake"),
          icon: "pi-sparkles",
          items: _o(this)
        },
        null,
        {
          label: d >= 2 ? r("Delete {count} keys").replace("{count}", String(d)) : r("Delete selected key"),
          icon: "pi-trash",
          shortcut: "Delete",
          danger: !0,
          disabled: d < 2 && !p,
          run: () => this.deleteSelectedKeyframes()
        }
      ]);
    },
    addMarker() {
      if ((this.state.markers || []).find((l) => l.frame === this.frame)) return this.setStatus(`Marker already at F${this.frame}`);
      this.checkpoint("Add marker"), this.state.markers = [...this.state.markers || [], { frame: this.frame, name: `Marker ${(this.state.markers || []).length + 1}`, color: "#f2d06b" }].sort((l, d) => l.frame - d.frame), this.serialize(), this.refreshKeys(), this.setStatus(`Marker @ F${this.frame}`);
    },
    removeNearestMarker() {
      const c = this.state.markers || [];
      if (!c.length) return;
      const l = c.reduce((d, p) => Math.abs(p.frame - this.frame) < Math.abs(d.frame - this.frame) ? p : d);
      this.checkpoint("Remove marker"), this.state.markers = c.filter((d) => d !== l), this.serialize(), this.refreshKeys(), this.setStatus(`Marker removed @ F${l.frame}`);
    },
    openCurveContext(c) {
      const l = this.selectedKeyFrames?.size || 0, d = l < 2 && !this.selectedKeyframe(), p = this.selectedKeyframe(), f = p?.interpolation || "ease", u = p && bo(p) || "auto", m = ["bezier", "smooth", "linear", "ease_in", "ease_out", "ease", "sine", "cubic", "quintic", "expo", "back"], h = ["auto", "clamped", "vector", "free", "aligned", "flat"], y = l >= 2 ? `${r("Curve editor")} (${r("{count} keys selected").replace("{count}", String(l))})` : r("Curve editor");
      this.showContextMenu(c, y, [
        { label: r("Fit all curves (Framing)"), icon: "pi-arrows-alt", shortcut: "F", run: () => s(this) },
        { label: r("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: this.showCurveHandles ? r("Hide Bézier handles") : r("Show Bézier handles"), icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
        null,
        {
          label: r("Interpolation"),
          icon: "pi-chart-line",
          disabled: d,
          items: m.map((b) => ({
            label: b.replaceAll("_", " "),
            checked: f === b,
            run: () => this.setSelectedKeysInterpolation(b)
          }))
        },
        {
          label: r("Tangents"),
          icon: "pi-share-alt",
          disabled: d,
          items: h.map((b) => ({
            label: b[0].toUpperCase() + b.slice(1),
            checked: u === b,
            run: () => this.setSelectedKeysTangentMode(b)
          }))
        },
        null,
        {
          label: r("Keyframe operations"),
          icon: "pi-sliders-v",
          items: Co(this, a, t, o)
        },
        {
          label: r("Camera Shake"),
          icon: "pi-sparkles",
          items: _o(this)
        },
        null,
        { label: l >= 2 ? r("Delete {count} keys").replace("{count}", String(l)) : r("Delete selected key"), icon: "pi-trash", danger: !0, disabled: d, run: () => this.deleteSelectedKeyframes() }
      ]);
    }
  };
}
const au = 220;
function Wr(e) {
  return JSON.stringify({
    background: e.viewport_bg_image || "",
    sequence: e.viewport_bg_sequence || [],
    objects: (e.objects || []).map((t) => [t.id, t.type, t.asset || ""])
  });
}
function ou(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: n, initializeTooltips: s, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: d, activeCameraTrack: p, bindWidgetCallbacks: f, playblastCameraTrack: u, restoreFromWidgets: m, serializeEditorState: h, syncActiveCameraTrack: y, syncFromWidgets: b, bindEditorEvents: x, activateCamera: g, addCamera: k, deleteCamera: v, drawPreviewOverlays: $, duplicateCamera: _, maximizeCameraPreview: I, refreshCameraPreviews: M, refreshCameraSelectors: L, renameCamera: O, setPlayblastCamera: A, toggleCameraView: B, captureRealtime: w, makePlayblast: E, uploadDirectorPlayblast: z, waitForMediaFrame: R, computeAudioPeaks: q, loadAudioFile: T, releaseAudio: W, stopPlay: C, togglePlay: N, applyCameraPreset: H, applyCameraShake: te, applyProxyPreset: oe, clearViewportBgImage: J, loadViewportBgFile: se, loadViewportBgSequence: pe, drawCameraPath: de, drawCard: be, drawCube: ge, drawGrid: K, drawHuman: V, drawLine3D: ie, drawNull: ce, drawOverlays: me, drawPointField: re, drawSpeedHeatmap: ke, drawSphere: Mt, curveChannels: Tt, drawCurveEditor: ot, onCurvePointerDown: rt, onCurvePointerMove: nt, onCurvePointerUp: st, onTimelinePointerDown: At, onTimelinePointerMove: Pt, onTimelinePointerUp: It, refreshKeys: it, resetCurveZoom: zt, resetTimelineZoom: ct, setChannelFilter: lt, setCurveInterpolation: dt, setTangentMode: mt, timelineFrameFromEvent: Ft, toggleCurveHandles: pt, zoomCurve: Lt, drawTransformGizmo: Ot, frameTarget: Kt, gizmoAxes: Dt, gizmoGeometry: Rt, onPointerDown: Nt, onPointerMove: qt, onPointerUp: Bt, onWheel: Wt, pickGizmo: Vt, pickSceneObject: Ht, resetCamera: ft, setTransformMode: ht, setViewMode: Ut, viewportCamera: Gt, loadCardFile: lo, loadExecutionPreview: mo, loadMediaUrl: Xt, loadModelFile: Yt, loadSelectedReference: Zt, onModelLoaded: Jt, restoreAssets: Qt, syncUpstreamInputs: ea, configureDomMedia: ta, refreshSetupDiagnostic: ut, addMediaCard: aa, addPrimitive: oa, applyObjectAnimationFrame: ra, beginCameraEdit: na, beginObjectEdit: sa, commitCameraEdit: ia, commitObjectEdit: ca, copyKeyframe: la, deleteKeyframe: da, deleteObject: ma, duplicateObject: pa, exitKeyEdit: fa, finishCameraEdit: ha, goToAdjacentKey: ua, insertKeyframe: ba, loadSelectedKeyView: ga, pasteKeyframe: ya, playblastCameraAtFrame: va, refreshInspector: xa, refreshKeyEditor: ka, refreshObjects: wa, removeObjectResources: Sa, renameObject: ja, retimeSelectedKey: Ca, selectKeyframe: _a, selectedKeyframe: Ea, selectedObject: $a, selectObjectAnimation: Ma, setKeyInterpolation: Ta, setObjectParent: Aa, timelineKeyframes: Pa, timelineObject: Ia, toggleAutoKey: za, toggleObject: Fa, updateCameraFromHud: La, updateEditState: Oa, updateKeyVisualState: Ka, updateSelectedKey: Da, updateSelectedObject: Ra, clamp: bt, cloneCamera: Na, configureCore: qa, defaultCamera: Ba, sampleCamera: Le, sampleObjectTransform: po, sanitizeState: He, worldTransform: Se } = e;
  return {
    ...tu(e),
    setSelectMode(G) {
      if (["object", "vertex", "edge", "face"].includes(G)) {
        this.state.select_mode = G, this.subSelection = null;
        for (const j of this.root.querySelectorAll("[data-select-mode]")) {
          const S = j.dataset.selectMode === G;
          j.classList.toggle("active", S), j.setAttribute("aria-pressed", String(S));
        }
        for (const j of this.root.querySelectorAll('[data-role="select-mode"]'))
          j.value = G;
        this.serialize(), this.syncFromWidgets(), this.render(), this.setStatus(`Select Mode: ${G.toUpperCase()}`);
      }
    },
    refreshSetupDiagnostic() {
      ut(this);
    },
    hideInternalWidgets() {
      for (const G of ["state_json", "recording_path", "card_asset"]) {
        const j = this.node.widgets?.find((S) => S.name === G);
        j && (j.computeSize = () => [0, -4], j.draw = () => {
        }, j.hidden = !0, j.options = { ...j.options || {}, hideInVueNodes: !0 });
      }
    },
    restoreFromWidgets() {
      m(this);
    },
    // Director modal audit Lot 5: extracted from the old inline `capture`
    // closure passed to `new EditorHistory(...)` in director.js, so the
    // persistent runtime (which now owns the EditorHistory instance -- see
    // DirectorRuntime.history) can call it whenever a workbench is attached.
    captureHistorySnapshot() {
      return JSON.stringify({
        state: this.state,
        frame: this.frame,
        selectedEntity: this.selectedEntity,
        selectedObjectId: this.selectedObjectId,
        selectedObjectIds: [...this.selectedObjectIds || []],
        selectedKeyFrame: this.selectedKeyFrame,
        selectedKeyFrames: [...this.selectedKeyFrames || []],
        subSelection: this.subSelection
      });
    },
    restoreHistorySnapshot(G) {
      const j = JSON.parse(G);
      if (this.keyDrag?.badge?.remove?.(), this.boxSelect?.overlay?.remove?.(), this.drag = null, this.gizmoDrag = null, this.targetFreeDrag = null, this.pathDrag = null, this.boxSelection = null, this.keyDrag = null, this.curveDrag = null, this.curvePanDrag = null, this.curveScrub = null, this.curveBoxSelect = null, this.timelineDrag = null, this.timelinePanDrag = null, this.boxSelect = null, this.modalTransform = null, this.activePointerId != null) {
        try {
          this.interactionElement?.releasePointerCapture?.(this.activePointerId);
        } catch {
        }
        this.activePointerId = null;
      }
      const S = Wr(this.state), P = new Set(this.state.objects.map((Q) => Q.id));
      this.state = He(j.state);
      const F = new Set(this.state.objects.map((Q) => Q.id));
      for (const Q of P) F.has(Q) || this.removeObjectResources(Q);
      this.frame = bt(j.frame, 0, this.state.duration_frames - 1);
      const D = new Set(this.state.objects.map((Q) => Q.id)), X = Array.isArray(j.selectedObjectIds) ? j.selectedObjectIds : [j.selectedObjectId].filter(Boolean);
      this.selectedObjectIds = new Set(X.filter((Q) => D.has(Q))), this.selectedObjectId = this.selectedObjectIds.has(j.selectedObjectId) ? j.selectedObjectId : [...this.selectedObjectIds].at(-1) || null, this.selectedEntity = this.selectedObjectIds.size ? "object" : j.selectedEntity || "camera";
      const Z = new Set(this.timelineKeyframes().map((Q) => Q.frame)), he = Array.isArray(j.selectedKeyFrames) ? j.selectedKeyFrames : [j.selectedKeyFrame].filter((Q) => Q != null);
      this.selectedKeyFrames = new Set(he.filter((Q) => Z.has(Q))), this.selectedKeyFrame = this.selectedKeyFrames.has(j.selectedKeyFrame) ? j.selectedKeyFrame : [...this.selectedKeyFrames].at(-1) ?? null, this.pathSelection = Ii(this.pathSelection, this.activeCameraTrack()), this.subSelection = j.subSelection || null, this.camera = Le(this.state, this.frame), kt(this, this.activeCameraTrack(), this.camera, this.frame), this.cameraPreviewSignature = "", this.serialize(), S !== Wr(this.state) && this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
    },
    checkpoint(G) {
      this.history.checkpoint(G);
    },
    undo() {
      const G = this.history.undo();
      G && this.setStatus(`Undo: ${G}`);
    },
    redo() {
      const G = this.history.redo();
      G && this.setStatus(`Redo: ${G}`);
    },
    bindEditorEvents() {
      x(this);
    },
    bindWidgetCallbacks() {
      f(this);
    },
    syncFromWidgets(G = !0) {
      b(this, G);
    },
    serialize() {
      h(this);
    },
    activeCameraTrack() {
      return p(this);
    },
    playblastCameraTrack() {
      return u(this);
    },
    syncActiveCameraTrack() {
      y(this);
    },
    refreshCameraSelectors() {
      L(this);
    },
    refreshCameraPreviews() {
      M(this);
    },
    addCamera() {
      k(this);
    },
    async renameCamera(G) {
      return O(this, G);
    },
    duplicateCamera(G) {
      _(this, G);
    },
    async deleteCamera(G) {
      return v(this, G);
    },
    activateCamera(G) {
      g(this, G);
    },
    setPlayblastCamera(G) {
      A(this, G);
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
    //
    // Hosted in the WorkbenchHost modal, growing the underlying graph node is a
    // pure side effect (the modal's box is independent of node.size) that used
    // to silently resize the saved node from dragging an internal splitter.
    // Skip that part there; the .viewport-wrap ResizeObserver (editor-global.js)
    // already repaints the viewport/canvas for both paths (Lot 4).
    refitNode() {
      if (this.disposed) return;
      const G = this.node;
      if (!this.root?.closest?.(".oc-workbench-content"))
        try {
          if (G && typeof G.computeSize == "function" && typeof G.setSize == "function") {
            const j = G.computeSize();
            Array.isArray(j) && G.setSize([G.size?.[0] ?? j[0], j[1]]);
          }
          G?.graph?.setDirtyCanvas?.(!0, !0);
        } catch {
        }
      this.scheduleResizeAndRender();
    },
    resizeCanvas() {
      const G = this.root.querySelector(".viewport-wrap");
      if (!G) return;
      const j = Math.min(2, window.devicePixelRatio || 1), S = G.clientWidth || 320, P = G.clientHeight || 180, F = Math.max(320, Math.round(S * j)), D = Math.max(180, Math.round(P * j));
      (this.canvas.width !== F || this.canvas.height !== D) && (this.canvas.width = F, this.canvas.height = D);
      for (const X of this.cameraPreviewCanvases.values()) {
        const Z = X.clientWidth || 220, he = X.clientHeight || 124, Q = Math.max(j, au / Math.max(1, Z)), Me = Math.max(1, Math.round(Z * Q)), Ce = Math.max(1, Math.round(he * Q));
        (X.width !== Me || X.height !== Ce) && (X.width = Me, X.height = Ce);
      }
      this.drawCurveEditor();
    }
  };
}
function ns(e) {
  e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshKeyEditor(), e.refreshInspector(), e.drawCurveEditor(), e.render();
}
function ru(e, t) {
  const a = e.state.cameras.find((n) => n.id === t);
  if (!a) return;
  e.checkpoint("Reset camera animation"), e.finishCameraEdit();
  const o = dn();
  o.position = [0, 0, 0], o.target = [0, 0, -1], a.camera = le(o), a.keyframes = [{ frame: 0, camera: le(o), interpolation: "ease" }], e.state.active_camera_id = a.id, e.state.camera = le(o), e.state.keyframes = a.keyframes, e.camera = le(o), e.frame = 0, e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = 0, e.editingKeyFrame = null, e.cameraEditKey = null, e.cameraEditActive = !1, e.cameraPreviewSignature = "", ns(e), e.refreshCameraSelectors(), e.setStatus(r("{value1} animation reset", { value1: a.name }));
}
function nu(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint("Reset object animation"), a.keyframes = [], a.position = [0, 0, 0], a.rotation = [0, 0, 0], e.frame = 0, e.selectedEntity = "object", e.selectedObjectId = a.id, e.selectedKeyFrame = null, e.editingKeyFrame = null, ns(e), e.setStatus(r("{value1} animation reset", { value1: a.name || a.type })));
}
const Vr = { motion: "motion", shot: "display", health: "health" }, su = {
  object: "Object",
  camera: "Camera",
  camera_target: "Look-At Target",
  camera_path: "Camera Path"
}, iu = { motion: "Motion", shot: "Shot", health: "Health" }, cu = ["entity", "motion", "shot", "health"];
function ss(e) {
  return e.inspectorMode && e.inspectorMode !== "entity" ? e.inspectorMode : "entity";
}
function lu(e) {
  const t = ss(e);
  return Vr[t] ? Vr[t] : e.selectedEntity === "object" ? "scene" : "camera";
}
function du(e) {
  return [
    e.selectedEntity || "",
    e.selectedObjectId || "",
    e.selectedKeyFrame ?? "",
    [...e.selectedObjectIds || []].sort().join(",")
  ].join("|");
}
function mu(e) {
  const t = du(e);
  e._lastInspectorSelKey !== void 0 && e._lastInspectorSelKey !== t && (e.inspectorMode = "entity"), e._lastInspectorSelKey = t, is(e);
}
function is(e) {
  const t = lu(e);
  for (const s of e.root.querySelectorAll("[data-tab-panel]"))
    s.hidden = s.dataset.tabPanel !== t;
  const a = t === "motion";
  e.root.classList.toggle("oc-motion-mode", a), !a && (e.state?.motion_tool || "select") !== "select" && (e.state.motion_tool = "select", e.motionTrackDraft = null);
  const o = ss(e);
  for (const s of e.root.querySelectorAll("[data-inspector-mode]")) {
    const i = s.dataset.inspectorMode === o;
    s.classList.toggle("active", i), s.setAttribute("aria-pressed", String(i));
  }
  const n = e.root.querySelector('[data-role="inspector-title"]');
  n && (n.textContent = o === "entity" ? r(su[e.selectedEntity] || "Inspector") : r(iu[o] || "Inspector"));
}
function pu(e, t) {
  e.inspectorMode = cu.includes(t) ? t : "entity", is(e), e.render?.(), e.refitNode?.();
}
function fu(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: n, initializeTooltips: s, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: d, activeCameraTrack: p, bindWidgetCallbacks: f, playblastCameraTrack: u, restoreFromWidgets: m, serializeEditorState: h, syncActiveCameraTrack: y, syncFromWidgets: b, bindEditorEvents: x, activateCamera: g, addCamera: k, deleteCamera: v, drawPreviewOverlays: $, duplicateCamera: _, maximizeCameraPreview: I, refreshCameraPreviews: M, refreshCameraSelectors: L, renameCamera: O, setPlayblastCamera: A, toggleCameraView: B, captureRealtime: w, makePlayblast: E, uploadDirectorPlayblast: z, waitForMediaFrame: R, computeAudioPeaks: q, loadAudioFile: T, releaseAudio: W, stopPlay: C, togglePlay: N, applyCameraPreset: H, applyCameraShake: te, applyProxyPreset: oe, clearViewportBgImage: J, loadViewportBgFile: se, loadViewportBgSequence: pe, drawCameraPath: de, drawCard: be, drawCube: ge, drawGrid: K, drawHuman: V, drawLine3D: ie, drawNull: ce, drawOverlays: me, drawPointField: re, drawSpeedHeatmap: ke, drawSphere: Mt, curveChannels: Tt, drawCurveEditor: ot, onCurvePointerDown: rt, onCurvePointerMove: nt, onCurvePointerUp: st, onTimelinePointerDown: At, onTimelinePointerMove: Pt, onTimelinePointerUp: It, refreshKeys: it, resetCurveZoom: zt, resetTimelineZoom: ct, setChannelFilter: lt, setCurveInterpolation: dt, setTangentMode: mt, timelineFrameFromEvent: Ft, toggleCurveHandles: pt, zoomCurve: Lt, drawTransformGizmo: Ot, frameTarget: Kt, gizmoAxes: Dt, gizmoGeometry: Rt, onPointerDown: Nt, onPointerMove: qt, onPointerUp: Bt, onWheel: Wt, pickGizmo: Vt, pickSceneObject: Ht, resetCamera: ft, setTransformMode: ht, setViewMode: Ut, viewportCamera: Gt, loadCardFile: lo, loadExecutionPreview: mo, loadMediaUrl: Xt, loadModelFile: Yt, loadSelectedReference: Zt, onModelLoaded: Jt, restoreAssets: Qt, syncUpstreamInputs: ea, configureDomMedia: ta, refreshSetupDiagnostic: ut, addMediaCard: aa, addPrimitive: oa, applyObjectAnimationFrame: ra, beginCameraEdit: na, beginObjectEdit: sa, commitCameraEdit: ia, commitObjectEdit: ca, copyKeyframe: la, deleteKeyframe: da, deleteObject: ma, deleteSelectedObjects: pa, duplicateObject: fa, exitKeyEdit: ha, finishCameraEdit: ua, goToAdjacentKey: ba, insertKeyframe: ga, loadSelectedKeyView: ya, pasteKeyframe: va, playblastCameraAtFrame: xa, refreshInspector: ka, refreshKeyEditor: wa, refreshObjects: Sa, removeObjectResources: ja, renameObject: Ca, retimeSelectedKey: _a, selectKeyframe: Ea, selectedKeyframe: $a, selectedObject: Ma, selectObjectAnimation: Ta, setKeyInterpolation: Aa, setKeyTangentMode: Pa, setObjectParent: Ia, timelineKeyframes: za, timelineObject: Fa, toggleAutoKey: La, toggleObject: Oa, updateCameraFromHud: Ka, updateCameraRotationFromHud: Da, updateEditState: Ra, updateKeyVisualState: bt, updateSelectedKey: Na, updateSelectedObject: qa, clamp: Ba, cloneCamera: Le, configureCore: po, defaultCamera: He, sampleCamera: Se, sampleObjectTransform: Ue, sanitizeState: G, worldTransform: j } = e;
  return {
    setChannelFilter(S) {
      lt(this, S);
    },
    setFrame(S, P = !1, F = !0) {
      this.frame = Ba(Math.round(S), 0, this.state.duration_frames - 1), this.editingKeyFrame !== this.frame && (this.editingKeyFrame = null), this.camera = Se(this.activeCameraTrack(), this.frame, this.state.objects), kt(this, this.activeCameraTrack(), this.camera, this.frame), this.applyObjectAnimationFrame();
      const D = this.dom ||= Mn(this.root);
      for (const Y of D.frames) document.activeElement !== Y && (Y.value = String(this.frame));
      for (const Y of D.scrubs) Y.value = String(this.frame);
      for (const Y of D.cameraFov) document.activeElement !== Y && (Y.value = String(Math.round(this.camera.fov * 100) / 100));
      for (const Y of D.cameraRoll) document.activeElement !== Y && (Y.value = String(Math.round((this.camera.roll || 0) * 100) / 100));
      for (const Y of D.cameraFocal) document.activeElement !== Y && (Y.value = Vo(this.camera.fov));
      for (const Y of D.viewportZoom) Y.textContent = `${(Number(this.camera.zoom) || 1).toFixed(2)}x`;
      for (const Y of D.cameraType) document.activeElement !== Y && (Y.value = this.camera.camera_type || "perspective");
      for (const Y of D.cameraNear) document.activeElement !== Y && (Y.value = String(this.camera.near ?? 0.01));
      for (const Y of D.cameraFar) document.activeElement !== Y && (Y.value = String(this.camera.far ?? 1e4));
      const X = this.frame / this.state.fps;
      for (const Y of this.cardMediaById.values()) Y instanceof HTMLVideoElement && Number.isFinite(Y.duration) && Y.duration > 0 && (Y.currentTime = X % Y.duration);
      const Z = Math.floor(X / 60), he = Math.floor(X % 60), Q = Math.floor(X % 1 * 1e3), Me = this.frame % Math.max(1, Math.round(this.state.fps)), Ce = Math.floor(this.frame / this.state.fps);
      if ((D.time || this.root.querySelector('[data-role="time"]')).textContent = this.state.timecode_mode === "timecode" ? `${String(Math.floor(Ce / 3600)).padStart(2, "0")}:${String(Math.floor(Ce / 60) % 60).padStart(2, "0")}:${String(Ce % 60).padStart(2, "0")}:${String(Me).padStart(2, "0")}` : `${String(Z).padStart(2, "0")}:${String(he).padStart(2, "0")}.${String(Q).padStart(3, "0")}`, F) this.refreshKeys();
      else {
        bn(this);
        for (const Y of this.root.querySelectorAll("[data-key-frame]")) {
          const ee = Number(Y.dataset.keyFrame);
          Y.classList.toggle("at-playhead", ee === this.frame), Y.classList.toggle("selected", ee === this.selectedKeyFrame), Y.classList.toggle("editing", ee === this.editingKeyFrame);
        }
        this.refreshKeyEditor(), this.drawCurveEditor();
      }
      P || this.serialize(), this.refreshInspector(), P && this.playing && !this.recording ? this.requestRender("frame") : this.render();
    },
    timelineObject() {
      return Fa(this);
    },
    timelineKeyframes() {
      return za(this);
    },
    // The camera key the playhead is parked on, or null when between keys.
    // The new-key interpolation select branches on this directly; other camera
    // edits go through beginCameraEdit(), which resolves the same auto-key vs.
    // transient-preview question consistently (and always checkpoints/serializes).
    activeKeyframe() {
      return (this.activeCameraTrack()?.keyframes || []).find((P) => P.frame === this.frame) || null;
    },
    applyObjectAnimationFrame() {
      ra(this, Ue);
    },
    insertKeyframe() {
      for (const S of this.root.querySelectorAll('[data-act="key"]'))
        S.classList.remove("key-pulse"), S.offsetWidth, S.classList.add("key-pulse");
      ga(this);
    },
    setKeyInterpolation(S) {
      Aa(this, S);
    },
    setKeyTangentMode(S) {
      Pa(this, S);
    },
    deleteKeyframe() {
      da(this);
    },
    copyKeyframe() {
      la(this);
    },
    pasteKeyframe() {
      va(this);
    },
    resetCamera() {
      ft(this, He);
    },
    resetCameraAnimation(S) {
      ru(this, S);
    },
    resetObjectAnimation(S) {
      nu(this, S);
    },
    selectedKeyframe() {
      return $a(this);
    },
    selectKeyframe(S) {
      Ea(this, S);
    },
    beginCameraEdit() {
      return na(this);
    },
    commitCameraEdit() {
      ia(this);
    },
    finishCameraEdit() {
      ua(this);
    },
    exitKeyEdit(S = !1) {
      ha(this, S);
    },
    toggleAutoKey() {
      La(this);
    },
    updateEditState() {
      Ra(this);
    },
    updateKeyVisualState() {
      bt(this);
    },
    curveChannels() {
      return Tt(this);
    },
    drawCurveEditor() {
      ot(this);
    },
    onCurvePointerDown(S) {
      rt(this, S);
    },
    onCurvePointerMove(S) {
      nt(this, S);
    },
    onCurvePointerUp(S) {
      st(this, S);
    },
    setCurveInterpolation(S) {
      dt(this, S);
    },
    setTangentMode(S) {
      mt(this, S);
    },
    // Spatial Bézier handle mode (Auto Smooth / Aligned / Free / Corner) for the
    // selected camera keyframe -- the viewport curve, not the timeline F-curve.
    setSpatialHandleMode(S) {
      if (!pn.includes(S)) return;
      const F = this.activeCameraTrack()?.keyframes || [], D = F.findIndex((X) => X.frame === this.selectedKeyFrame);
      if (D < 0) {
        this.setStatus(r("Select a camera keyframe first"));
        return;
      }
      this.checkpoint(r("Camera path handle: {mode}").replace("{mode}", S)), hc(F[D], S, {
        prevKey: F[D - 1] || null,
        nextKey: F[D + 1] || null
      }), this.webgl && (this.webgl.pathKey = ""), this.serialize(), this.refreshKeys(), this.setFrame(this.frame, !1, !1), this.render(), this.setStatus(r("Curve handle updated"));
    },
    // Called from the viewport drag loop (viewport-controls/interactions.js) so
    // that eagerly-loaded module needs no static import of the curve maths.
    dragCurveHandle(S, P, F, D) {
      fc(S, P, F, D || {});
    },
    // Position/Target component toggle for the primary selected path key (plan
    // section 12.1). Only ever changes which point a translate gizmo attaches
    // to (see transform-target.js's path_point_target); it never mutates a
    // keyframe, so no checkpoint/undo entry is needed here.
    setPathSelectionComponent(S) {
      this.pathSelection = Fi(this.pathSelection, S), this.refreshInspector(), this.render();
    },
    // Double-click on the rendered path between two keys inserts a new camera
    // key there (plan section 26 Task 8). Returns false (and does nothing) when
    // the cursor isn't over a path segment, so the caller can fall back to its
    // other double-click behaviour (setTargetAtCursor).
    insertPathKeyAtCursor(S) {
      if (!S || !this.webgl?.pickPathSegment) return !1;
      const P = this.interactionElement.getBoundingClientRect(), F = (S.clientX - P.left) * this.canvas.width / Math.max(1, P.width), D = (S.clientY - P.top) * this.canvas.height / Math.max(1, P.height), X = this.webgl.pickPathSegment([F, D]);
      if (!X) return !1;
      const Z = (this.state.cameras || []).find((Q) => Q.id === X.cameraId);
      if (!Z || Z.locked) return !1;
      const he = pc(Z.keyframes || [], {
        leftFrame: X.leftFrame,
        rightFrame: X.rightFrame,
        t: X.t
      });
      return he.ok ? (this.checkpoint(r("Insert camera path key")), Z.id !== this.state.active_camera_id && this.activateCamera(Z.id), Z.keyframes = he.keys, this.state.keyframes = he.keys, this.camera = Se(Z, this.frame, this.state.objects), Z.camera = Le(this.camera), zi(this, { cameraId: Z.id, frame: he.frame, additive: !1 }), this.serialize(), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(r("Camera path key inserted at frame {frame}").replace("{frame}", String(he.frame))), !0) : (this.setStatus(he.reason === "no_free_frame" ? r("No free frame here to insert a key") : r("Could not insert a key here")), !0);
    },
    // Select the active camera's whole path as one transform target. The gizmo
    // only draws in an editor view, so a shot-camera view drops to perspective.
    selectCameraPath() {
      return this.activeCameraTrack()?.keyframes?.length >= 1 ? (this.finishCameraEdit(), this.selectedEntity = "camera_path", this.selectedObjectId = null, this.selectedObjectIds = /* @__PURE__ */ new Set(), this.editingKeyFrame = null, this.state.view_mode === "camera" && this.setViewMode("perspective"), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), !0) : !1;
    },
    // One affine transform applied to every keyframe of the active path at once
    // (options: { mode, delta | factors | rotationDeg }; origin defaults to the
    // path centroid). Backs the path gizmo's numeric / keyboard entry.
    transformCameraPath(S) {
      const P = this.activeCameraTrack();
      if (!P || P.locked || !(P.keyframes?.length >= 1)) return !1;
      this.checkpoint("Transform camera path");
      const F = nn(P.keyframes, { origin: on(P.keyframes), ...S });
      return P.keyframes = F, P.id === this.state.active_camera_id && (this.state.keyframes = F), this.camera = Se(P, this.frame, this.state.objects), P.camera = Le(this.camera), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.renderCameraView?.(), !0;
    },
    // "Redistribute Timing" (plan section 26 Task 10 / spec section 14.3):
    // reflows the active camera's own existing key range using each key's
    // authoring Timing Weight, never touching any other camera or object.
    redistributeActiveCameraTiming() {
      const S = this.activeCameraTrack();
      if (!S || S.locked || !(S.keyframes?.length >= 2))
        return S?.keyframes?.length < 2 && this.setStatus(r("Need at least two keys to redistribute timing")), !1;
      const P = [...S.keyframes].sort((D, X) => D.frame - X.frame), F = sn(P, {
        startFrame: P[0].frame,
        endFrame: P[P.length - 1].frame
      });
      return F.ok ? (this.checkpoint(r("Redistribute camera path timing")), S.keyframes = F.keys, S.id === this.state.active_camera_id && (this.state.keyframes = F.keys), this.camera = Se(S, this.frame, this.state.objects), S.camera = Le(this.camera), this.serialize(), this.refreshKeys(), this.refreshKeyEditor(), this.refreshInspector(), this.render(), this.setStatus(r("Camera path timing redistributed")), !0) : (this.setStatus(F.reason === "insufficient_frame_slots" ? r("Not enough frame slots to redistribute this many keys") : r("Could not redistribute timing")), !1);
    },
    // Camera Path Presets (plan section 26 Task 11 / spec section 17): a
    // single compact picker over every preset type instead of one toolbar
    // button per preset. Generated keys are ordinary camera keyframes -- fully
    // editable afterward by the regular point/curve/timing tools -- covering
    // the active camera's current playback range by default.
    async openCameraPathPresetPicker() {
      const S = this.activeCameraTrack();
      if (!S || S.locked)
        return this.setStatus(r("{name} is locked").replace("{name}", S?.name || r("Camera"))), !1;
      const P = mc.map((D) => ({ id: D, label: r(pr[D] || D) })), F = await fn({ title: r("Camera Path Preset"), items: P, owner: this });
      return F ? this.applyCameraPathPreset(F) : !1;
    },
    applyCameraPathPreset(S, P = {}) {
      const F = this.activeCameraTrack();
      if (!F || F.locked)
        return this.setStatus(r("{name} is locked").replace("{name}", F?.name || r("Camera"))), !1;
      const [D, X] = Oo(this.state), Z = dc({ type: S, camera: this.camera, startFrame: D, endFrame: X, params: P });
      return Z.ok ? (this.checkpoint(r("Apply camera path preset")), F.keyframes = Z.keyframes, F.id === this.state.active_camera_id && (this.state.keyframes = Z.keyframes), this.camera = Se(F, this.frame, this.state.objects), F.camera = Le(this.camera), this.serialize(), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(r("{preset} camera path generated").replace("{preset}", r(pr[S] || S))), !0) : (this.setStatus(Z.reason === "insufficient_frame_slots" ? r("Not enough frames in the playback range for this preset") : r("Could not generate that camera path preset")), !1);
    },
    toggleCurveHandles() {
      pt(this);
    },
    onTimelineWheel(S) {
      onTimelineWheel(this, S);
    },
    resetTimelineZoom() {
      ct(this);
    },
    toggleInspector(S) {
      const P = this.root.querySelector('[data-role="viewport-inspector"]');
      if (!P) return;
      const F = S !== void 0 ? S : P.dataset.collapsed !== "true";
      P.dataset.collapsed = String(F);
      for (const D of this.root.querySelectorAll('[data-act="toggle-inspector"]'))
        D.classList.toggle("active", !F), D.setAttribute("aria-pressed", String(!F));
      this.setStatus(F ? "Inspector hidden (N)" : "Inspector shown");
    },
    refreshKeys() {
      it(this);
    },
    refreshKeyEditor() {
      wa(this);
    },
    retimeSelectedKey(S, P = !1) {
      _a(this, S, P);
    },
    updateSelectedKey() {
      Na(this);
    },
    updateKeyFromView() {
      updateKeyFromView(this);
    },
    loadSelectedKeyView() {
      ya(this);
    },
    goToAdjacentKey(S) {
      ba(this, S);
    },
    addPrimitive(S) {
      oa(this, S);
    },
    async renameObject(S) {
      return Ca(this, S);
    },
    duplicateObject(S) {
      fa(this, S);
    },
    toggleObject(S) {
      Oa(this, S);
    },
    showAllObjects() {
      const S = this.state.objects.filter((P) => P.enabled === !1);
      if (S.length) {
        this.checkpoint("Show all objects");
        for (const P of S) P.enabled = !0;
        this.serialize(), this.refreshObjects(), this.render(), this.setStatus("All objects shown");
      }
    },
    selectHierarchy(S = this.selectedObjectId) {
      if (!S) return;
      const P = /* @__PURE__ */ new Set([S]);
      let F = !0;
      for (; F; ) {
        F = !1;
        for (const D of this.state.objects)
          D.parent_id && P.has(D.parent_id) && !P.has(D.id) && (P.add(D.id), F = !0);
      }
      this.selectedObjectIds = P, this.selectedObjectId = S, this.selectedEntity = "object", this.refreshObjects(), this.refreshInspector(), this.render(), this.setStatus(`Hierarchy selected: ${P.size} object(s)`);
    },
    async deleteObject(S) {
      return ma(this, S);
    },
    async deleteSelectedObjects() {
      return pa(this);
    },
    duplicateSelectedObjects() {
      return _h(this);
    },
    toggleSelectedObjects(S = null) {
      return Eh(this, S);
    },
    lockSelectedObjects(S = null) {
      return $h(this, S);
    },
    selectAllObjects() {
      return Mh(this);
    },
    deselectAll() {
      return rs(this);
    },
    invertSelection() {
      return Th(this);
    },
    addMediaCard() {
      aa(this);
    },
    selectedObject() {
      return Ma(this);
    },
    playblastCameraAtFrame() {
      return kt(this, u(this), xa(this, Se), this.frame);
    },
    viewportCamera() {
      return Gt(this);
    },
    setViewMode(S) {
      Ut(this, S);
    },
    toggleCameraView() {
      B(this);
    },
    setDensity(S) {
      ["basic", "animation", "advanced"].includes(S) || (S = "advanced"), this.state.ui_density = S, this.root.dataset.density = S, this.root.querySelector('[data-role="ui-density"]').value = S;
      const P = this.root.querySelector("[data-inspector-mode].active");
      P && getComputedStyle(P).display === "none" && this.setInspectorMode("entity"), this.serialize(), requestAnimationFrame(() => {
        this.resizeCanvas(), this.render();
      }), this.setStatus(`Interface: ${S}`);
    },
    lookAtObject(S) {
      const P = this.state.objects.find((F) => F.id === S);
      if (P) {
        this.checkpoint("Look-at constraint");
        for (const F of this.state.cameras)
          for (const D of F.keyframes) D.camera.target = [...P.position || [0, 1.5, 0]];
        this.camera = Se(this.state, this.frame), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(`Cameras look at ${P.name || P.type}`);
      }
    },
    setTransformMode(S) {
      ht(this, S);
    },
    refreshInspector() {
      this.perf && (this.perf.inspectorRefreshCount = (this.perf.inspectorRefreshCount || 0) + 1), ka(this), mu(this);
    },
    setInspectorMode(S) {
      pu(this, S);
    },
    updateSelectedObject() {
      qa(this);
    },
    beginObjectEdit(S) {
      return sa(this, S);
    },
    commitObjectEdit(S) {
      ca(this, S);
    },
    updateCameraFromHud() {
      Ka(this);
    },
    updateCameraRotationFromHud() {
      Da(this);
    },
    selectObjectAnimation(S) {
      Ta(this, S);
    },
    setObjectParent(S) {
      Ia(this, S);
    },
    refreshObjects() {
      Sa(this);
    },
    removeObjectResources(S) {
      ja(this, S);
    },
    aimAtSelectedObject(S) {
      this.checkpoint("Aim & track subject");
      const P = this.activeCameraTrack(), F = S && this.state.objects.find((Z) => Z.id === S) || this.selectedObject() || this.state.objects.find((Z) => Z.id === "subject") || this.state.objects[0];
      if (!F) return;
      P.target_object_id !== F.id && (P.aim_bone = null), P.target_object_id = F.id, P.id === this.state.active_camera_id && (this.state.target_object_id = F.id, this.state.aim_bone = P.aim_bone);
      const X = (F.type === "model" || F.type === "glb" ? this.webgl?.getObjectWorldCenter?.(F.id) : null) || (F.keyframes?.length ? Ue(F, this.frame).position : F.position || [0, 1.5, 0]);
      this.camera.target = [...X], this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit(), this.serialize(), this.refreshInspector(), this.updateHudCamera(), this.render(), this.setStatus(`Camera tracking locked to ${F.name || F.id}`);
    },
    setAimBone(S) {
      ch(this, S);
    },
    bakeAimConstraint(S) {
      lh(this, S);
    },
    setCameraTrackingTarget(S) {
      this.checkpoint("Change camera tracking target");
      const P = this.activeCameraTrack();
      P.target_object_id !== (S || null) && (P.aim_bone = null), P.target_object_id = S || null, P.id === this.state.active_camera_id && (this.state.target_object_id = S || null, this.state.aim_bone = P.aim_bone), this.camera = Se(P, this.frame, this.state.objects), kt(this, P, this.camera, this.frame), this.serialize(), this.refreshInspector(), this.render(), this.setStatus(S ? `Camera tracking: ${S}` : "Camera tracking disabled (manual target)");
    },
    bakeAimToKeyframes() {
      this.checkpoint("Bake aim to keyframes");
      const S = this.activeCameraTrack(), P = S.target_object_id || this.state.target_object_id || "subject", F = this.state.objects.find((X) => X.id === P) || this.state.objects[0];
      if (!F || !S.keyframes?.length) return;
      const D = F.type === "model" || F.type === "glb" ? this.webgl?.getObjectWorldCenter?.(F.id) : null;
      for (const X of S.keyframes) {
        const Z = (F.type === "model" || F.type === "glb") && D && !F.keyframes?.length ? D : F.keyframes?.length ? Ue(F, X.frame).position : F.position || [0, 1.5, 0];
        X.camera.target = [...Z];
      }
      S.id === this.state.active_camera_id && (this.state.keyframes = S.keyframes), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(`Aim baked across all keyframes following ${F.name || F.id}`);
    }
  };
}
function hu(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: n, initializeTooltips: s, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: d, activeCameraTrack: p, bindWidgetCallbacks: f, playblastCameraTrack: u, restoreFromWidgets: m, serializeEditorState: h, syncActiveCameraTrack: y, syncFromWidgets: b, bindEditorEvents: x, activateCamera: g, addCamera: k, deleteCamera: v, drawPreviewOverlays: $, duplicateCamera: _, maximizeCameraPreview: I, refreshCameraPreviews: M, refreshCameraSelectors: L, renameCamera: O, setPlayblastCamera: A, toggleCameraView: B, captureRealtime: w, makePlayblast: E, uploadDirectorPlayblast: z, waitForMediaFrame: R, computeAudioPeaks: q, loadAudioFile: T, releaseAudio: W, stopPlay: C, togglePlay: N, applyCameraPreset: H, applyCameraShake: te, applyProxyPreset: oe, clearViewportBgImage: J, loadViewportBgFile: se, loadViewportBgSequence: pe, drawCameraPath: de, drawCard: be, drawCube: ge, drawGrid: K, drawHuman: V, drawLine3D: ie, drawNull: ce, drawOverlays: me, drawPointField: re, drawSpeedHeatmap: ke, drawSphere: Mt, curveChannels: Tt, drawCurveEditor: ot, fitCurveView: rt, onCurveDoubleClick: nt, onCurvePointerDown: st, onCurvePointerMove: At, onCurvePointerUp: Pt, onTimelinePointerDown: It, onTimelinePointerMove: it, onTimelinePointerUp: zt, refreshKeys: ct, resetCurveZoom: lt, resetTimelineZoom: dt, setChannelFilter: mt, setCurveInterpolation: Ft, setTangentMode: pt, timelineFrameFromEvent: Lt, toggleCurveHandles: Ot, zoomCurve: Kt, drawTransformGizmo: Dt, frameTarget: Rt, gizmoAxes: Nt, gizmoGeometry: qt, onPointerDown: Bt, onPointerMove: Wt, onPointerUp: Vt, onWheel: Ht, pickGizmo: ft, pickSceneObject: ht, resetCamera: Ut, setTransformMode: Gt, setViewMode: lo, viewportCamera: mo, loadCardFile: Xt, loadExecutionPreview: Yt, loadMediaUrl: Zt, loadModelFile: Jt, loadSelectedReference: Qt, onModelLoaded: ea, restoreAssets: ta, syncUpstreamInputs: ut, configureDomMedia: aa, refreshSetupDiagnostic: oa, addMediaCard: ra, addPrimitive: na, applyObjectAnimationFrame: sa, beginCameraEdit: ia, beginObjectEdit: ca, commitCameraEdit: la, commitObjectEdit: da, copyKeyframe: ma, deleteKeyframe: pa, deleteObject: fa, duplicateObject: ha, exitKeyEdit: ua, finishCameraEdit: ba, goToAdjacentKey: ga, insertKeyframe: ya, loadSelectedKeyView: va, pasteKeyframe: xa, playblastCameraAtFrame: ka, refreshInspector: wa, refreshKeyEditor: Sa, refreshObjects: ja, removeObjectResources: Ca, renameObject: _a, retimeSelectedKey: Ea, selectKeyframe: $a, selectedKeyframe: Ma, selectedObject: Ta, selectObjectAnimation: Aa, setKeyInterpolation: Pa, setObjectParent: Ia, timelineKeyframes: za, timelineObject: Fa, toggleAutoKey: La, toggleObject: Oa, updateCameraFromHud: Ka, updateEditState: Da, updateKeyVisualState: Ra, updateSelectedKey: bt, updateSelectedObject: Na, clamp: qa, cloneCamera: Ba, configureCore: Le, defaultCamera: po, sampleCamera: He, sampleObjectTransform: Se, sanitizeState: Ue, worldTransform: G } = e;
  return {
    setTargetAtCursor(j) {
      if (!j) return;
      const S = this.interactionElement.getBoundingClientRect(), P = (j.clientX - S.left) * this.canvas.width / Math.max(1, S.width), F = (j.clientY - S.top) * this.canvas.height / Math.max(1, S.height), D = this.webgl?.intersectScenePoint?.(P, F, this.canvas.width, this.canvas.height);
      D && (this.checkpoint("Set camera target"), this.beginCameraEdit(), this.camera.target = [
        Math.round(D[0] * 1e3) / 1e3,
        Math.round(D[1] * 1e3) / 1e3,
        Math.round(D[2] * 1e3) / 1e3
      ], this.commitCameraEdit(), this.finishCameraEdit(), this.updateHudCamera(), this.refreshInspector(), this.render(), this.setStatus(`Target set to [${this.camera.target.join(", ")}]`));
    },
    focusCameraTarget() {
      this.frameTarget();
    },
    updateHudCamera() {
      this.refreshInspector();
    },
    togglePlay() {
      N(this);
    },
    stopPlay() {
      C(this);
    },
    computeAudioPeaks() {
      q(this);
    },
    async loadAudioFile(j) {
      return T(this, j);
    },
    applyCameraPreset(j) {
      H(this, j);
    },
    applyCameraShake(j) {
      te(this, j);
    },
    applyProxyPreset(j) {
      oe(this, j);
    },
    clearCaches() {
      if (this.checkpoint("Clear caches"), this.objectUrls?.clear(), W(this), this.webgl) {
        for (const j of this.webgl.models.values())
          try {
            j.scene && disposeObject(j.scene, !0);
          } catch {
          }
        this.webgl.models.clear(), this.webgl.modelLoads.clear(), this.webgl.sceneKey = "", this.webgl.mediaSignature = "", this.webgl.modelSignature = "", this.webgl.pathKey = "", this.webgl.bgLoadGeneration += 1, this.webgl.bgTextureLoads?.clear();
        for (const j of new Set(this.webgl.bgTextureCache?.values() || []))
          try {
            j.dispose();
          } catch {
          }
        this.webgl.bgTextureCache?.clear(), this.webgl.bgTexture = null, this.webgl.bgImageUrl = "";
      }
      if (this.cameraWebgl) {
        for (const j of this.cameraWebgl.models.values())
          try {
            j.scene && disposeObject(j.scene, !0);
          } catch {
          }
        this.cameraWebgl.models.clear(), this.cameraWebgl.modelLoads.clear(), this.cameraWebgl.sceneKey = "", this.cameraWebgl.mediaSignature = "", this.cameraWebgl.modelSignature = "", this.cameraWebgl.pathKey = "", this.cameraWebgl.bgLoadGeneration += 1, this.cameraWebgl.bgTextureLoads?.clear();
        for (const j of new Set(this.cameraWebgl.bgTextureCache?.values() || []))
          try {
            j.dispose();
          } catch {
          }
        this.cameraWebgl.bgTextureCache?.clear(), this.cameraWebgl.bgTexture = null, this.cameraWebgl.bgImageUrl = "";
      }
      this.upstreamSignature = "", this.cameraPreviewSignature = "", this.cardMediaById.clear(), this.cardMedia = null, this.restoreAssets(), this.syncUpstreamInputs(), this.refreshObjects(), this.refreshKeys(), this.refreshCameraSelectors(), this.renderCameraView(), this.render(), this.setStatus("Caches cleared & memory freed");
    },
    snapFrame(j) {
      return !this.state.snap_enabled || this.state.snap_frames <= 1 ? Math.round(j) : Math.round(Math.round(j) / this.state.snap_frames) * this.state.snap_frames;
    },
    toggleLoop() {
      this.state.loop_playback = !this.state.loop_playback, this.serialize();
      const j = this.root.querySelector('[data-act="loop"]');
      j.classList.toggle("active", this.state.loop_playback), j.setAttribute("aria-pressed", String(this.state.loop_playback)), this.setStatus(`Loop ${this.state.loop_playback ? "on" : "off"}`);
    },
    setPlaybackRange(j) {
      const S = this.state.playback_range || [0, this.state.duration_frames - 1];
      j === "start" ? S[0] = Math.min(this.frame, S[1]) : j === "end" && (S[1] = Math.max(this.frame, S[0])), this.state.playback_range = S, this.serialize(), this.refreshKeys(), this.setStatus(`Range: F${S[0]}–F${S[1]}`);
    },
    clearPlaybackRange() {
      this.state.playback_range = null, this.serialize(), this.refreshKeys(), this.setStatus("Playback range cleared");
    },
    toggleTimecode() {
      this.state.timecode_mode = this.state.timecode_mode === "timecode" ? "time" : "timecode", this.serialize(), this.setFrame(this.frame, !0), this.setStatus(`Time display: ${this.state.timecode_mode}`);
    },
    toggleSnap() {
      this.state.snap_enabled = !this.state.snap_enabled, this.serialize();
      const j = this.root.querySelector('[data-act="toggle-snap"]');
      j.classList.toggle("active", this.state.snap_enabled), j.setAttribute("aria-pressed", String(this.state.snap_enabled)), this.setStatus(`Snap ${this.state.snap_enabled ? "on" : "off"}`);
    },
    scheduleSerialize() {
      this.serializeScheduled || (this.serializeScheduled = !0, this.serializeFrame = requestAnimationFrame(() => {
        this.serializeScheduled = !1, this.disposed || this.serialize();
      }));
    },
    gizmoAxes(j) {
      return Nt(this, j);
    },
    gizmoGeometry(j) {
      return qt(this, j);
    },
    pickGizmo(j) {
      return ft(this, j);
    },
    pickSceneObject(j) {
      return ht(this, j);
    },
    drawTransformGizmo() {
      Dt(this);
    },
    // Routed through the facade so the eagerly-loaded key interceptor
    // (web-src/commands.js) keeps no static import of the Director-only
    // camera-path-draw module -- that edge dragged cameras.js and the panel
    // template string onto ComfyUI's startup path. See production-bundle test.
    cancelCameraPathDraw() {
      return Pe(this);
    },
    onPointerDown(j) {
      Pp(this, j) || Bt(this, j);
    },
    onPointerMove(j) {
      Ip(this, j) || Wt(this, j);
    },
    onPointerUp(j) {
      zp(this, j) || Vt(this, j);
    },
    onWheel(j) {
      Ht(this, j);
    },
    timelineFrameFromEvent(j, S) {
      return Lt(this, j, S);
    },
    onTimelinePointerDown(j) {
      It(this, j);
    },
    onTimelinePointerMove(j) {
      it(this, j);
    },
    onTimelinePointerUp(j) {
      zt(this, j);
    },
    resetTimelineZoom() {
      dt(this);
    },
    refreshKeys() {
      ct(this);
    },
    drawCurveEditor() {
      ot(this);
    },
    toggleCurveHandles() {
      Ot(this);
    },
    setCurveInterpolation(j) {
      Ft(this, j);
    },
    setTangentMode(j) {
      pt(this, j);
    },
    setChannelFilter(j) {
      mt(this, j);
    },
    onCurvePointerDown(j) {
      st(this, j);
    },
    onCurvePointerMove(j) {
      At(this, j);
    },
    onCurvePointerUp(j) {
      Pt(this, j);
    },
    zoomCurve(j) {
      Kt(this, j);
    },
    resetCurveZoom() {
      lt(this);
    },
    fitCurveView(j) {
      rt(this, j);
    },
    onCurveDoubleClick(j) {
      nt(this, j);
    },
    onKey(j) {
      return d(this, j);
    },
    frameTarget(j) {
      Rt(this, j);
    },
    async loadMediaUrl(j, S, P, F) {
      return Zt(this, j, S, P, F);
    },
    restoreAssets() {
      ta(this);
    },
    onModelLoaded(j) {
      ea(this, j);
    },
    async loadModelFile(j) {
      return Jt(this, j);
    },
    async loadCardFile(j) {
      return Xt(this, j);
    },
    loadExecutionPreview(j) {
      Yt(this, j);
    },
    loadSelectedReference() {
      Qt(this);
    },
    drawLine3D(j, S, P = "#5a5a5a", F = 1) {
      ie(this, j, S, P, F);
    },
    drawGrid() {
      K(this);
    },
    drawPointField() {
      re(this);
    },
    drawCube(j) {
      ge(this, j);
    },
    drawSphere(j) {
      Mt(this, j);
    },
    drawHuman(j) {
      V(this, j);
    },
    drawNull(j) {
      ce(this, j);
    },
    drawCard(j) {
      be(this, j);
    },
    drawCameraPath() {
      de(this);
    },
    drawSpeedHeatmap() {
      ke(this);
    },
    drawOverlays() {
      me(this);
    },
    async loadViewportBgFile(j) {
      return se(this, j);
    },
    async loadViewportBgSequence(j) {
      return pe(this, j);
    },
    clearViewportBgImage() {
      J(this);
    }
  };
}
const uu = [
  { id: "x", label: "X", vector: [1, 0, 0], color: "#e5484d" },
  { id: "y", label: "Y", vector: [0, 1, 0], color: "#46a758" },
  { id: "z", label: "Z", vector: [0, 0, 1], color: "#4a8fe7" }
];
function bu(e) {
  const { right: t, up: a, forward: o } = Li(e || {});
  return uu.map((n) => {
    const [s, i, c] = n.vector, l = s * t[0] + i * t[1] + c * t[2], d = s * a[0] + i * a[1] + c * a[2], p = -(s * o[0] + i * o[1] + c * o[2]);
    return { id: n.id, label: n.label, color: n.color, x: l, y: -d, depth: p };
  });
}
function gu(e) {
  return [...e].sort((t, a) => t.depth - a.depth);
}
function yu(e) {
  return 0.45 + 0.55 * ((Math.max(-1, Math.min(1, e)) + 1) / 2);
}
const vu = "http://www.w3.org/2000/svg", Ye = 26, Hr = 17, xu = 5.4;
function Ze(e, t) {
  const a = document.createElementNS(vu, e);
  for (const [o, n] of Object.entries(t)) a.setAttribute(o, String(n));
  return a;
}
function ku(e) {
  const t = e.root?.querySelector('[data-role="viewport-axis"]');
  if (!t) return;
  const a = e.viewportCamera ? e.viewportCamera() : e.camera;
  if (!a) return;
  t.replaceChildren();
  const o = Ze("circle", {
    "data-axis-center": "",
    cx: Ye,
    cy: Ye,
    r: 4,
    fill: "#A78BFA",
    tabindex: "0",
    role: "button",
    "pointer-events": "auto",
    "aria-label": r("Frame selection")
  }), n = Ze("title", {});
  n.textContent = r("Frame selection"), o.appendChild(n), t.appendChild(o);
  for (const s of gu(bu(a))) {
    const i = Ye + s.x * Hr, c = Ye + s.y * Hr, l = yu(s.depth);
    t.appendChild(Ze("line", {
      x1: Ye,
      y1: Ye,
      x2: i,
      y2: c,
      stroke: s.color,
      "stroke-width": 1.8,
      "stroke-linecap": "round",
      opacity: l
    }));
    const d = s.depth >= 0, p = Ze("circle", {
      cx: i,
      cy: c,
      r: xu,
      fill: d ? s.color : "transparent",
      stroke: s.color,
      "stroke-width": 1.4,
      opacity: l,
      "data-axis": s.label.toLowerCase(),
      tabindex: "0",
      role: "button",
      "aria-label": r("View: {axis} axis").replace("{axis}", s.label),
      "pointer-events": "auto"
    }), f = Ze("title", {});
    if (f.textContent = r("View: {axis} axis").replace("{axis}", s.label), p.appendChild(f), t.appendChild(p), d) {
      const u = Ze("text", {
        x: i,
        y: c,
        "text-anchor": "middle",
        "dominant-baseline": "central",
        "font-size": 7,
        "font-weight": 700,
        fill: "#101014"
      });
      u.textContent = s.label, t.appendChild(u);
    }
  }
}
function wu(e, t, a, o, n) {
  if (["world_point", "object_point", "camera_field"].includes(t.source_kind)) {
    const s = Bo(e, t.source, a, o, n);
    return s ? [s] : [];
  }
  return (t.keys || []).map((s) => ({ ...s }));
}
function Su(e) {
  if (e.recording) return;
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  t.save();
  for (const n of e.state.motion_layers || []) {
    if (!n.enabled) continue;
    const s = wu(e.state, n, e.frame, a, o);
    if (s.length) {
      t.strokeStyle = n.id === e.state.selected_motion_layer_id ? "#ffcc4d" : "#41d9c5", t.fillStyle = t.strokeStyle, t.lineWidth = n.id === e.state.selected_motion_layer_id ? 3 : 2, t.beginPath(), s.forEach((i, c) => {
        const l = i.x * a, d = i.y * o;
        c ? t.lineTo(l, d) : t.moveTo(l, d);
      }), t.stroke();
      for (const i of s)
        i.visible !== !1 && (t.beginPath(), t.arc(i.x * a, i.y * o, 5, 0, Math.PI * 2), t.fill());
    }
  }
  t.restore();
}
const ju = ["world_point", "object_point", "camera_field"], cs = {
  manual_2d: "DRAW",
  object_point: "OBJECT",
  world_point: "WORLD",
  static_anchor: "SCREEN",
  camera_field: "FIELD"
};
function Cu(e, t) {
  const a = t.source || {};
  if (t.source_kind === "object_point" && a.object_id) {
    const o = (e.objects || []).find((n) => n.id === a.object_id);
    return o ? o.name || o.id : `${a.object_id} (missing)`;
  }
  return t.source_kind === "world_point" ? "World point" : t.source_kind === "camera_field" ? a.preset ? `${a.preset} field` : "Camera field" : "Screen";
}
function _u(e, t) {
  if (ju.includes(t.source_kind)) {
    const a = Bo(e, t.source, 0, e.width || 1280, e.height || 720);
    return a ? a.visible !== !1 : !1;
  }
  return t.keys?.[0]?.visible !== !1;
}
function Eu(e, t) {
  return (e.keys || []).reduce(
    (a, o) => a && Math.abs(a.time_seconds - t) <= Math.abs(o.time_seconds - t) ? a : o,
    null
  );
}
function $u(e) {
  const t = e.root.querySelector('[data-role="motion-layers"]');
  if (!t) return;
  const a = e.state.motion_layers || [], o = e.state.selected_motion_layer_id;
  t.replaceChildren();
  for (const s of a) {
    const i = document.createElement("button");
    i.type = "button", i.className = "motion-layer-row", i.dataset.motionLayerId = s.id, i.classList.toggle("active", s.id === o), i.innerHTML = `<i class="pi ${s.enabled ? "pi-eye" : "pi-eye-slash"}"></i><span></span><small class="motion-badge"></small>`, i.querySelector("span").textContent = s.label, i.querySelector("small").textContent = cs[s.source_kind] || "TRACK", i.addEventListener("click", () => {
      e.state.selected_motion_layer_id = s.id, e.render();
    }), t.appendChild(i);
  }
  const n = e.root.querySelector('[data-role="motion-layers-empty"]');
  n && (n.hidden = !!a.length), Mu(e), Tu(e);
}
function Mu(e) {
  const t = e.root.querySelector('[data-role="motion-selected"]');
  if (!t) return;
  const a = (e.state.motion_layers || []).find((u) => u.id === e.state.selected_motion_layer_id) || null;
  if (t.hidden = !a, !a) return;
  const o = Math.max(1, Number(e.state.fps) || 24), n = (a.keys || []).map((u) => Math.round(u.time_seconds * o)), s = (u, m) => {
    const h = t.querySelector(`[data-role="${u}"]`);
    h && (h.textContent = m);
  };
  s("motion-sel-name", a.label), s("motion-sel-type", cs[a.source_kind] || "TRACK"), s("motion-sel-binding", Cu(e.state, a)), s("motion-sel-start", n.length ? Math.min(...n) : 0), s("motion-sel-end", n.length ? Math.max(...n) : 0);
  const i = a.source_kind === "object_point" && a.source?.object_id && !(e.state.objects || []).some((u) => u.id === a.source.object_id);
  t.classList.toggle("motion-invalid", !!i);
  const c = !i && !_u(e.state, a);
  t.classList.toggle("motion-warn", c);
  const l = t.querySelector('[data-role="motion-sel-warn"]');
  l && (l.hidden = !c, l.textContent = c ? r("Not visible on the first frame — ATI, Wan Track and LTX Motion drop tracks hidden at frame 0. Move the point into frame at frame 0 or switch to Screen Anchor.") : "");
  const d = t.querySelector('[data-role="motion-interpolation"]');
  d && (d.value = a.keys?.[0]?.interpolation || "linear");
  const p = t.querySelector('[data-role="motion-key-visible"]');
  if (p) {
    const u = Eu(a, (e.frame || 0) / o);
    p.checked = u ? u.visible !== !1 : !0;
  }
  const f = t.querySelector('[data-motion-layer-action="toggle"] i');
  f && (f.className = `pi ${a.enabled ? "pi-eye" : "pi-eye-slash"}`);
}
function Tu(e) {
  const t = e.root.querySelector('[data-role="motion-creating"]');
  if (!t) return;
  const a = e.state.motion_tool && e.state.motion_tool !== "select";
  if (t.hidden = !a, !a) return;
  const o = t.querySelector('[data-role="motion-creating-label"]');
  o && (o.textContent = e.motionCreatingLabel || "Creating motion track");
}
function Au(e) {
  const t = e.root.querySelector('[data-role="motion-timeline"]');
  if (!t) return;
  t.replaceChildren();
  const a = Math.max(1, e.state.duration_frames / e.state.fps);
  for (const o of e.state.motion_layers || []) {
    const n = document.createElement("div");
    n.className = "motion-timeline-rail", n.dataset.motionTimelineId = o.id, n.title = o.label;
    const s = document.createElement("button");
    s.type = "button", s.className = "motion-timeline-label", s.textContent = o.label, s.addEventListener("click", () => {
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
    n.append(s, i), t.appendChild(n);
  }
}
function Pu(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: n, initializeTooltips: s, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: d, activeCameraTrack: p, bindWidgetCallbacks: f, playblastCameraTrack: u, restoreFromWidgets: m, serializeEditorState: h, syncActiveCameraTrack: y, syncFromWidgets: b, bindEditorEvents: x, activateCamera: g, addCamera: k, deleteCamera: v, drawPreviewOverlays: $, duplicateCamera: _, maximizeCameraPreview: I, refreshCameraPreviews: M, refreshCameraSelectors: L, renameCamera: O, setPlayblastCamera: A, toggleCameraView: B, captureRealtime: w, makePlayblast: E, uploadDirectorPlayblast: z, waitForMediaFrame: R, computeAudioPeaks: q, loadAudioFile: T, releaseAudio: W, stopPlay: C, togglePlay: N, applyCameraPreset: H, applyCameraShake: te, applyProxyPreset: oe, clearViewportBgImage: J, loadViewportBgFile: se, loadViewportBgSequence: pe, drawCameraPath: de, drawCard: be, drawCube: ge, drawCylinder: K, drawGrid: V, drawHuman: ie, drawLine3D: ce, drawNull: me, drawOverlays: re, drawPointField: ke, drawSpeedHeatmap: Mt, drawSphere: Tt, drawTorus: ot, curveChannels: rt, drawCurveEditor: nt, onCurvePointerDown: st, onCurvePointerMove: At, onCurvePointerUp: Pt, onTimelinePointerDown: It, onTimelinePointerMove: it, onTimelinePointerUp: zt, refreshKeys: ct, resetCurveZoom: lt, resetTimelineZoom: dt, setChannelFilter: mt, setCurveInterpolation: Ft, setTangentMode: pt, timelineFrameFromEvent: Lt, toggleCurveHandles: Ot, zoomCurve: Kt, drawTransformGizmo: Dt, frameTarget: Rt, gizmoAxes: Nt, gizmoGeometry: qt, onPointerDown: Bt, onPointerMove: Wt, onPointerUp: Vt, onWheel: Ht, pickGizmo: ft, pickSceneObject: ht, resetCamera: Ut, setTransformMode: Gt, setViewMode: lo, viewportCamera: mo, loadCardFile: Xt, loadExecutionPreview: Yt, loadMediaUrl: Zt, loadModelFile: Jt, loadSelectedReference: Qt, onModelLoaded: ea, restoreAssets: ta, syncUpstreamInputs: ut, configureDomMedia: aa, refreshSetupDiagnostic: oa, addMediaCard: ra, addPrimitive: na, applyObjectAnimationFrame: sa, beginCameraEdit: ia, beginObjectEdit: ca, commitCameraEdit: la, commitObjectEdit: da, copyKeyframe: ma, deleteKeyframe: pa, deleteObject: fa, duplicateObject: ha, exitKeyEdit: ua, finishCameraEdit: ba, goToAdjacentKey: ga, insertKeyframe: ya, loadSelectedKeyView: va, pasteKeyframe: xa, playblastCameraAtFrame: ka, refreshInspector: wa, refreshKeyEditor: Sa, refreshObjects: ja, removeObjectResources: Ca, renameObject: _a, retimeSelectedKey: Ea, selectKeyframe: $a, selectedKeyframe: Ma, selectedObject: Ta, selectObjectAnimation: Aa, setKeyInterpolation: Pa, setObjectParent: Ia, timelineKeyframes: za, timelineObject: Fa, toggleAutoKey: La, toggleObject: Oa, updateCameraFromHud: Ka, updateEditState: Da, updateKeyVisualState: Ra, updateSelectedKey: bt, updateSelectedObject: Na, clamp: qa, cloneCamera: Ba, configureCore: Le, defaultCamera: po, sampleCamera: He, sampleObjectTransform: Se, sanitizeState: Ue, worldTransform: G } = e;
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
      $u(this), Up(this), Au(this);
    },
    // The main viewport canvas: WebGL (or the 2D fallback), the overlays and the
    // DOM axis gizmo. No motion panels, no camera preview strip.
    renderViewportOnly() {
      const j = this.ctx, S = this.canvas.width, P = this.canvas.height;
      if (j.fillStyle = this.state.viewport_bg_color || "#121212", j.fillRect(0, 0, S, P), this.viewportBgSequenceImages && this.viewportBgSequenceImages.length) {
        const ee = this.frame % this.viewportBgSequenceImages.length, Oe = this.viewportBgSequenceImages[ee];
        if (Oe?.complete && Oe.naturalWidth)
          try {
            j.drawImage(Oe, 0, 0, S, P);
          } catch {
          }
      } else if (this.viewportBgImage)
        try {
          j.drawImage(this.viewportBgImage, 0, 0, S, P);
        } catch {
        }
      const F = this.state.render_mode, D = this.viewportCamera(), X = this.state.objects.some((ee) => ee.parent_id) ? this.state.objects.map((ee) => ee.parent_id ? { ...ee, ...G(this.state.objects, ee) } : ee) : this.state.objects, Z = (this.viewportBgSequenceImages || []).map((ee) => ee.src), he = this.viewportBgImage?.src || "", Q = this.pendingExtractorImport, Me = Q ? [...this.state.cameras, {
        id: "__extractor_preview__",
        name: Q.label,
        color: "#9ca3af",
        camera: Q.track.keyframes[0]?.camera,
        keyframes: Q.track.keyframes
      }] : this.state.cameras, Ce = {
        ...this.state,
        cameras: Me,
        objects: X,
        viewport_bg_image: he,
        viewport_bg_sequence: Z,
        __selectedObjectIds: [...this.selectedObjectIds || []],
        __omnicamRevision: `${this.renderRevision || 0}:${Q?.fingerprint || ""}`
      };
      let Y = !1;
      if (this.webgl) {
        try {
          const ee = this.recording ? 1 : this.webgl.supersampleFactor?.() ?? 1, Oe = ee > 1 ? Math.min(ee, 4096 / Math.max(1, S, P)) : 1, Wa = Oe > 1 ? Math.round(S * Oe) : S, fo = Oe > 1 ? Math.round(P * Oe) : P;
          this.webgl.activeCamera && this.transformControlsWiring?.sync(), this.webgl.render(Ce, D, this.cardMediaById, Wa, fo, this.modelUrlsById, this.frame, this.recording, this.selectedEntity, this.selectedObjectId, this.subSelection, this.selectedKeyFrame ?? null, this.selectedKeyFrames ? [...this.selectedKeyFrames] : null, this.recording && this.state.guide_capture_style || "auto"), j.imageSmoothingEnabled = !0, j.imageSmoothingQuality = "high", Wa !== S || fo !== P ? j.drawImage(this.webgl.canvas, 0, 0, Wa, fo, 0, 0, S, P) : j.drawImage(this.webgl.canvas, 0, 0, S, P), Y = !0;
        } catch (ee) {
          console.error("[OmniCam WebGL Render Error]", ee);
        }
        this.transformControlsWiring?.sync();
      }
      if (!Y) {
        (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(F) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes(F) && this.drawPointField();
        for (const ee of X)
          ee.enabled !== !1 && (ee.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(F) ? this.drawCard(ee) : ["cube", "ground", "glb", "model"].includes(ee.type) && F !== "grid" && F !== "point_field" ? this.drawCube(ee) : ee.type === "sphere" && F !== "grid" && F !== "point_field" ? this.drawSphere(ee) : ee.type === "cylinder" && F !== "grid" && F !== "point_field" ? this.drawCylinder(ee) : ee.type === "torus" && F !== "grid" && F !== "point_field" ? this.drawTorus(ee) : ee.type === "human" && F !== "grid" && F !== "point_field" ? this.drawHuman(ee) : ee.type === "null" && this.drawNull(ee));
        !this.recording && this.state.show_camera_paths && this.drawCameraPath();
      }
      !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), !this.recording && Fp(this), this.drawOverlays(), Su(this), this.state.show_gizmo && ku(this), this.labelOverlay?.update(), this.rigOverlay?.update(), this.perf && (this.perf.viewportRenderCount = (this.perf.viewportRenderCount || 0) + 1);
    },
    // The single "something changed, repaint soon" entry point. Every
    // high-frequency source (playback tick, viewport drags, wheel/keyboard
    // navigation) funnels through here so at most one render() runs per frame
    // no matter how many events landed between paints. Discrete one-shot
    // actions can still call render() directly for an immediate repaint.
    requestRender(j = "unknown") {
      return this.requestUiUpdate(je.viewport | je.previews | je.motion, j);
    },
    // Targeted invalidation on top of the existing one-RAF coalescing. Each
    // caller marks only the domains it changed; the animation-frame callback
    // repaints just those, once, however many calls landed between frames.
    requestUiUpdate(j = je.viewport, S = "unknown") {
      (this.renderReasons ||= /* @__PURE__ */ new Set()).add(S), this.uiDirtyMask = uc(this.uiDirtyMask, j), this.renderInvalidations = (this.renderInvalidations || 0) + 1, !this.renderScheduled && (this.renderScheduled = !0, this.renderFrame = requestAnimationFrame(() => {
        if (this.renderScheduled = !1, this.disposed) return;
        const P = this.uiDirtyMask || je.viewport;
        this.uiDirtyMask = 0, this.lastRenderReasons = [...this.renderReasons || []], this.renderReasons?.clear(), this.rendersCoalesced = (this.rendersCoalesced || 0) + 1, this.perf && (this.perf.renderCount = (this.perf.renderCount || 0) + 1), Ge(P, je.outliner) && this.refreshObjects(), Ge(P, je.timeline) && this.refreshKeys(), Ge(P, je.inspector) && this.refreshInspector(), Ge(P, je.viewport) && this.renderViewportOnly(), Ge(P, je.previews) && this.renderCameraView(), Ge(P, je.motion) && this.renderMotionUiOnly();
      }));
    },
    renderCameraView() {
      if (this.perf && (this.perf.previewRenderCount = (this.perf.previewRenderCount || 0) + 1), this.state.camera_view_visible) {
        if (this.root.querySelector('[data-role="camera-view-row"]')?.hidden) return;
        this.refreshCameraPreviews(), this.cameraPreviewTick = (this.cameraPreviewTick || 0) + 1;
        const S = this.state.cameras, P = !!this.playing && !this.recording && S.length > 2;
        let F = null;
        if (P) {
          const D = this.state.active_camera_id, X = S.filter((Z) => Z.id !== D);
          F = X.length ? X[this.cameraPreviewTick % X.length] : null;
        }
        for (const D of S) {
          const X = this.cameraPreviewCanvases.get(D.id), Z = this.cameraPreviewContexts.get(D.id);
          if (!X?.width || !Z) continue;
          const he = X.width, Q = X.height, Me = this.root.querySelector(`[data-camera-frame="${D.id}"]`);
          if (Me && (Me.textContent = `F${this.frame}`), P && D.id !== this.state.active_camera_id && D !== F) continue;
          const Ce = kt(this, D, He(D, this.frame, this.state.objects), this.frame);
          if (Z.fillStyle = "#111", Z.fillRect(0, 0, he, Q), this.cameraWebgl)
            try {
              this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: !1, viewport_bg_image: this.viewportBgImage?.src || "", viewport_bg_sequence: (this.viewportBgSequenceImages || []).map((Y) => Y.src), __omnicamRevision: this.renderRevision || 0 }, Ce, this.cardMediaById, he, Q, this.modelUrlsById, this.frame, !0), Z.drawImage(this.cameraWebgl.canvas, 0, 0, he, Q);
            } catch (Y) {
              console.error("[OmniCam Preview Render Error]", Y);
            }
          $(this, Z, he, Q);
        }
      }
    },
    drawPreviewOverlays(j, S, P) {
      $(this, j, S, P);
    },
    maximizeCameraPreview(j) {
      I(this, j);
    },
    setStatus(j) {
      (this.dom?.status || this.root.querySelector('[data-role="status"]')).textContent = j;
    },
    async makePlayblast() {
      return E(this);
    },
    async waitForMediaFrame() {
      return R(this);
    },
    async captureRealtimePlayblast() {
      return w(this);
    },
    async uploadPlayblast(j) {
      return z(this, j);
    },
    async syncUpstreamInputs() {
      return ut(this);
    },
    dispose() {
      this.disposed || (this.disposed = !0, this.agentBridge?.dispose?.(), this.transformControlsWiring?.dispose(), Oi(this), Ki(), Lc(this), this.backgroundRequestId = (this.backgroundRequestId || 0) + 1, this.upstreamSyncId = (this.upstreamSyncId || 0) + 1, this.stopPlay(), clearTimeout(this.previewClickTimer), clearTimeout(this.connectionTimer), cancelAnimationFrame(this.restoreFrame), cancelAnimationFrame(this.serializeFrame), cancelAnimationFrame(this.resizeFrame), cancelAnimationFrame(this.renderFrame), this.abortController?.abort(), this.upstreamFetchController?.abort(), this.resizeObserver?.disconnect(), this.contextMenu?.dispose(), this.webgl?.dispose(), this.cameraWebgl?.dispose(), W(this), df(this), this.objectUrls.clear(), this.cardMediaById.clear(), this.cardMediaAssetById?.clear?.(), this.modelUrlsById.clear(), this.modelInfoById.clear());
    }
  };
}
const Iu = 0.12;
function zu() {
  return {
    /** Selected key frames that still exist on the active track, sorted. */
    resolveSelectedFrames() {
      const e = new Set(ue(this).map((a) => a.frame));
      return (this.selectedKeyFrames?.size ? [...this.selectedKeyFrames] : this.selectedKeyFrame != null ? [this.selectedKeyFrame] : []).filter((a) => e.has(a)).sort((a, o) => a - o);
    },
    _activeTrack() {
      const e = we(this);
      if (e) return { kind: "object", write: (a) => {
        e.keyframes = a;
      } };
      const t = Ao(this);
      return {
        kind: "camera",
        write: (a) => {
          t.keyframes = a, this.state.keyframes = a, Po(this);
        }
      };
    },
    deleteSelectedKeyframes() {
      let e = this.resolveSelectedFrames();
      if (!e.length) {
        const l = ue(this).find((d) => d.frame === this.frame);
        l && (e = [l.frame]);
      }
      if (!e.length) return this.setStatus(r("Select a keyframe to delete"));
      const t = this._activeTrack(), a = ue(this), o = t.kind === "camera" ? 1 : 0, { keys: n, removed: s } = xc(a, e, { minKeys: o });
      if (!s) return this.setStatus(r("Keep at least one camera keyframe"));
      this.checkpoint(s > 1 ? r("Delete {n} keyframes").replace("{n}", s) : "Delete keyframe"), t.write(n);
      const i = ue(this), c = e[0];
      this.selectedKeyFrame = i.length ? i.reduce((l, d) => Math.abs(d.frame - c) < Math.abs(l.frame - c) ? d : l).frame : null, this.selectedKeyFrames = this.selectedKeyFrame != null ? /* @__PURE__ */ new Set([this.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.includes(this.editingKeyFrame) && (this.editingKeyFrame = null), this.camera = xe(this.state, this.frame), this.applyObjectAnimationFrame(), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(s > 1 ? r("{n} keyframes deleted").replace("{n}", s) : r("Keyframe deleted"));
    },
    /** Move every selected key by `delta` frames. Returns false when nothing is selected. */
    nudgeSelectedKeyframes(e) {
      const t = this.resolveSelectedFrames();
      if (!t.length || !e) return !1;
      const a = this._activeTrack(), o = Math.max(0, this.state.duration_frames - 1), n = vc(ue(this), t, e, { lastFrame: o });
      return n.moved ? (this.checkpoint(r("Nudge {n} keyframes").replace("{n}", t.length)), a.write(n.keys), this.selectedKeyFrames = new Set(n.frames), this.selectedKeyFrame = n.frames.at(-1) ?? null, this.editingKeyFrame = null, this.serialize(), this.refreshKeys(), this.setFrame(this.selectedKeyFrame ?? this.frame, !1, !1), this.render(), !0) : (this.setStatus(r("Selected keys cannot move further")), !0);
    },
    setSelectedKeysInterpolation(e) {
      const t = this.resolveSelectedFrames();
      if (t.length < 2) return this.setCurveInterpolation(e);
      const a = this._activeTrack();
      this.checkpoint(r("Interpolation on {n} keys").replace("{n}", t.length)), a.write(yc(ue(this), t, e)), this.serialize(), this.refreshKeys(), this.refreshKeyEditor(), this.render(), this.drawCurveEditor(), this.setStatus(r("{mode} interpolation on {n} keys").replace("{mode}", e.replace(/_/g, " ")).replace("{n}", t.length));
    },
    setSelectedKeysTangentMode(e) {
      const t = this.resolveSelectedFrames();
      if (t.length < 2) return this.setTangentMode(e);
      const a = this._activeTrack(), o = tt(this).map((n) => n.id);
      this.checkpoint(r("Tangents on {n} keys").replace("{n}", t.length)), a.write(gc(ue(this), t, e, o)), this.serialize(), this.refreshKeys(), this.render(), this.drawCurveEditor(), this.setStatus(r("{mode} tangents on {n} keys").replace("{mode}", e).replace("{n}", t.length));
    },
    smoothSelectedKeyframes() {
      const e = this.resolveSelectedFrames();
      if (e.length < 2) return this.setStatus(r("Select at least 2 keyframes to smooth"));
      const t = this._activeTrack();
      this.checkpoint(r("Smooth {n} keys").replace("{n}", e.length)), t.write(bc(ue(this), e, t.kind)), this.serialize(), this.refreshKeys(), this.refreshKeyEditor(), this.render(), this.drawCurveEditor(), this.setStatus(r("Smoothed {n} keyframes").replace("{n}", e.length));
    },
    /**
     * mode: "simplify" (tolerance 0..1) | "reduce" (target key count) | "clean".
     * scope: "camera" | "all_cameras" | "object". When >= 2 keys are selected on
     * a single-track scope the op is confined to that frame range.
     */
    simplifyActiveKeys({ mode: e = "simplify", tolerance: t = 0, target: a = 0, scope: o = "camera", fromKeys: n = null, silent: s = !1 } = {}) {
      const i = o === "object" ? "object" : "camera";
      let c;
      if (o === "object") {
        const h = we(this);
        if (!h) return this.setStatus(r("Select an animated object first"));
        c = [{ get: () => h.keyframes || [], set: (y) => {
          h.keyframes = y;
        }, primary: !0 }];
      } else if (o === "all_cameras")
        c = this.state.cameras.map((h) => ({
          get: () => h.keyframes || [],
          set: (y) => {
            h.keyframes = y, h.id === this.state.active_camera_id && (this.state.keyframes = y);
          },
          primary: h.id === this.state.active_camera_id
        }));
      else {
        const h = Ao(this);
        c = [{
          get: () => h.keyframes || [],
          set: (y) => {
            h.keyframes = y, this.state.keyframes = y;
          },
          primary: !0
        }];
      }
      if (e === "simplify" && t <= 0 && !n) return 0;
      const l = this.resolveSelectedFrames(), d = o !== "all_cameras" && l.length >= 2 ? [l[0], l.at(-1)] : null, p = d ? [] : l, f = (h) => {
        const y = [...h].sort((I, M) => I.frame - M.frame), b = d ? d[0] : -1 / 0, x = d ? d[1] : 1 / 0, g = y.filter((I) => I.frame < b), k = y.filter((I) => I.frame >= b && I.frame <= x), v = y.filter((I) => I.frame > x);
        let $ = k, _ = 0;
        if (k.length > 2) {
          const I = e === "reduce" ? kc(k, i, { target: a || Math.ceil(k.length / 2), keepFrames: p }) : e === "clean" ? wc(k, i, { keepFrames: p }) : Sc(k, i, { tolerance: t * Iu, keepFrames: p });
          $ = I.keys, _ = I.removed;
        }
        return { keys: [...g, ...$, ...v].sort((I, M) => I.frame - M.frame), removed: _ };
      };
      let u = 0;
      const m = c.map((h) => {
        const y = n && h.primary ? n : h.get(), { keys: b, removed: x } = f(y);
        return u += x, { track: h, keys: b };
      });
      s || this.checkpoint(r("Simplify keyframes"));
      for (const { track: h, keys: y } of m) h.set(y);
      return Po(this), this.selectedKeyFrame = null, this.selectedKeyFrames = /* @__PURE__ */ new Set(), this.camera = xe(this.state, this.frame), this.applyObjectAnimationFrame(), this.serialize(), this.refreshKeys(), this.setFrame(this.frame, !1, !1), this.render(), s || this.setStatus(u ? r("Removed {n} keyframes").replace("{n}", u) : r("No keyframes to remove")), u;
    },
    keySimplifyToleranceFor(e) {
      return U(Number(e) || 0, 0, 100) / 100;
    }
  };
}
mn({ api: Ve });
Bn({ api: Ve });
_f({ api: Ve });
class nr {
  // `runtime` is the persistent DirectorRuntime (web-src/director/runtime.js)
  // this workbench renders: it already owns canonical state, widgets and
  // serialization, constructed once by attachDirectorShell() and reused
  // across every open/close cycle. See RUNTIME_ALIASED_FIELDS below for how
  // `this.state`/`this.frame`/etc. read and write through to it.
  constructor(t) {
    this.runtime = t;
    const a = t.node;
    this.disposed = !1, this.app = Ur, this.api = Ve, this.node = a, this.root = En(), this.root.tabIndex = -1, this.dom = Mn(this.root), this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.canvas, this.interactionElement.tabIndex = 0, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 }), this.webgl = null, this.cameraWebgl = null, this.webglReady = this.loadWebGLViewports(), this.transformControlsWiring = nm(this), this.camera = xe(this.state, this.frame), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.pathSelection = Ri(), this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.cardMediaAssetById = /* @__PURE__ */ new Map(), this.objectUrls = new _n(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = null, this.selectedEntity = "camera", this.subSelection = null, this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.uiDirtyMask = 0, this.perf = globalThis.__omnicamPerf === !0 ? { renderCount: 0, viewportRenderCount: 0, previewRenderCount: 0, timelineRefreshCount: 0, inspectorRefreshCount: 0, lastFrameMs: 0 } : null, this.contextMenu = new hn(this.root), this.refreshCameraPreviews(), this.initializeTooltips(), this.bindEditorEvents(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.syncUpstreamInputs(), this.refreshSetupDiagnostic(), // Seed every frame-derived readout (timecode, lens millimetres, viewport
    // zoom, dope rows) instead of waiting for the first scrub.
    this.setFrame(this.frame, !1, !0);
  }
  /** Load the WebGL viewports, then repaint with them. Never rejects. */
  async loadWebGLViewports() {
    let t;
    try {
      ({ OmniWebGLViewport: t } = await import("./chunk-BO_UjN2o.js"));
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
      Ni(this), this.resizeCanvas(), this.render(), this.renderCameraView();
    }
  }
}
const Fu = [
  "state",
  "frame",
  "camera",
  "directorRevision",
  "renderRevision",
  "sceneBaseline",
  "sceneName",
  "stateWidget",
  "recordingWidget",
  "cardWidget",
  "widthWidget",
  "heightWidget",
  "fpsWidget",
  "durationWidget",
  "modeWidget",
  "directorApi",
  "agentBridge",
  "assetBrowser",
  // Director modal audit Lot 5: the undo/redo stack now lives on the
  // persistent runtime (constructed once, outliving every workbench
  // open/close) rather than being recreated empty each time a workbench
  // mounts, so closing and reopening no longer silently drops the user's
  // undo history even though the document itself was always preserved. See
  // DirectorRuntime.history in director/runtime.js.
  "history"
];
for (const e of Fu)
  Object.defineProperty(nr.prototype, e, {
    configurable: !0,
    enumerable: !0,
    get() {
      return this.runtime[e];
    },
    set(t) {
      this.runtime[e] = t;
    }
  });
const Ya = { app: Ur, api: Ve, EditorHistory: jc, ContextMenuController: hn, initializeTooltips: Oc, promptText: jt, ObjectUrlRegistry: _n, buildRoot: En, dispatchDirectorKey: qi, activeCameraTrack: Ao, bindWidgetCallbacks: rl, playblastCameraTrack: un, restoreFromWidgets: nl, serializeEditorState: sl, syncActiveCameraTrack: Po, syncFromWidgets: il, bindEditorEvents: Xp, activateCamera: Kc, addCamera: Dc, deleteCamera: Rc, drawPreviewOverlays: Nc, duplicateCamera: qc, maximizeCameraPreview: Bc, refreshCameraPreviews: Wc, refreshCameraSelectors: Vc, renameCamera: Hc, setPlayblastCamera: Uc, toggleCameraView: Gc, captureRealtime: Gn, makePlayblast: Cf, uploadDirectorPlayblast: Xn, waitForMediaFrame: Un, computeAudioPeaks: qn, loadAudioFile: sf, releaseAudio: oo, stopPlay: Qa, togglePlay: of, applyCameraPreset: sm, applyCameraShake: im, applyProxyPreset: cm, clearViewportBgImage: Mf, loadViewportBgFile: Ef, loadViewportBgSequence: $f, drawCameraPath: Bf, drawCard: qf, drawCube: Lf, drawCylinder: Df, drawGrid: Pf, drawHuman: Kf, drawLine3D: ne, drawNull: Nf, drawOverlays: Vf, drawPointField: Ff, drawSpeedHeatmap: Wf, drawSphere: Of, drawTorus: Rf, curveChannels: tt, drawCurveEditor: Il, fitCurveView: wn, onCurveDoubleClick: Al, onCurvePointerDown: wl, onCurvePointerMove: Sl, onCurvePointerUp: jl, onTimelinePointerDown: Bi, onTimelinePointerMove: Wi, onTimelinePointerUp: Vi, refreshKeys: Wl, resetCurveZoom: Pl, resetTimelineZoom: Hi, setChannelFilter: _l, setCurveInterpolation: Cl, setTangentMode: El, timelineFrameFromEvent: Ko, toggleCurveHandles: $l, zoomCurve: Tl, drawTransformGizmo: Ui, frameTarget: Gi, gizmoAxes: Xi, gizmoGeometry: Yi, onPointerDown: Zi, onPointerMove: Ji, onPointerUp: Qi, onWheel: ec, pickGizmo: tc, pickSceneObject: ac, resetCamera: oc, setTransformMode: rc, setViewMode: nc, viewportCamera: sc, loadCardFile: uf, loadExecutionPreview: bf, loadMediaUrl: Hn, loadModelFile: hf, loadSelectedReference: gf, onModelLoaded: ff, restoreAssets: pf, syncUpstreamInputs: yf, configureDomMedia: Bn, refreshSetupDiagnostic: Gf, addMediaCard: bh, addPrimitive: ph, applyObjectAnimationFrame: Ph, beginCameraEdit: Dh, beginObjectEdit: as, commitCameraEdit: Rh, commitObjectEdit: vh, copyKeyframe: Lh, deleteKeyframe: Fh, deleteObject: ts, deleteSelectedObjects: uh, duplicateObject: es, exitKeyEdit: qh, finishCameraEdit: Nh, goToAdjacentKey: Qh, insertKeyframe: Ih, loadSelectedKeyView: Jh, pasteKeyframe: Oh, playblastCameraAtFrame: Ah, refreshInspector: gh, refreshKeyEditor: Xh, refreshObjects: Qn, removeObjectResources: Ch, renameObject: fh, retimeSelectedKey: Yh, selectKeyframe: Kh, selectedKeyframe: Fe, selectedObject: $t, selectObjectAnimation: jh, setKeyInterpolation: zh, setKeyTangentMode: Uh, setObjectParent: Sh, timelineKeyframes: ue, timelineObject: we, toggleAutoKey: Bh, toggleObject: hh, updateCameraFromHud: wh, updateCameraRotationFromHud: kh, updateEditState: Vh, updateKeyVisualState: Hh, updateSelectedKey: Zh, updateSelectedObject: yh, clamp: U, cloneCamera: le, configureCore: mn, defaultCamera: dn, sampleCamera: xe, sampleObjectTransform: so, sanitizeState: ic, worldTransform: No };
Object.assign(
  nr.prototype,
  ou(Ya),
  fu(Ya),
  hu(Ya),
  Pu(Ya),
  zu()
);
function Eo(e, t) {
  const a = globalThis.__majoorOmniCamCiTrace;
  Array.isArray(a) && a.push({ stage: e, nodeId: t?.id ?? null, nodeClass: t?.comfyClass ?? t?.type ?? null });
}
function Lu(e) {
  const t = e.node;
  Eo("director:workbench:constructor:start", t);
  const a = new nr(e);
  Eo("director:workbench:constructor:complete", t), e.attachWorkbench(a), t.__majoorOmniCam = a, Di(a);
  try {
    a.assetBrowser = Vd(a, {
      // Keeps the Agent module out of the eager chunk (design spec section
      // 32): nothing under web-src/agent/panel.js loads until the AGENT tab
      // is actually opened.
      onAgentFirstOpen: async () => {
        if ($o())
          try {
            const { createDirectorAgentPanel: o } = await import("./chunk-DxbIDfd8.js");
            a.agentPanel = o(a);
          } catch (o) {
            console.warn("[OmniCam] Agent panel unavailable", o);
          }
      }
    });
  } catch (o) {
    console.warn("[OmniCam] Asset Browser unavailable", o);
  }
  try {
    a.labelOverlay = Hd(a);
    const o = a.root.querySelector('[data-role="label-mode"]'), n = a.root.querySelector('[data-role="label-content"]');
    o && (o.value = a.labelOverlay.settings.mode), n && (n.value = a.labelOverlay.settings.content);
  } catch (o) {
    console.warn("[OmniCam] Label overlay unavailable", o);
  }
  try {
    a.characterRuntime = Ud(a), a.rigMapper = Xd(a), a.poseEditor = Jd(a), a.motionEditor = Qd(a);
  } catch (o) {
    console.warn("[OmniCam] Character tools unavailable", o);
  }
  return Eo("director:workbench:ready", t), a;
}
function Ou(e) {
  e.assetBrowser?.dispose?.(), e.agentPanel?.dispose?.(), e.labelOverlay?.dispose?.(), e.rigMapper?.dispose?.(), e.poseEditor?.dispose?.(), e.motionEditor?.dispose?.(), e.dispose(), e.runtime.detachWorkbench(e), e.node.__majoorOmniCam === e && delete e.node.__majoorOmniCam;
}
const Qu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  closeDirectorWorkbench: Ou,
  openDirectorWorkbench: Lu
}, Symbol.toStringTag, { value: "Module" }));
export {
  xo as D,
  Xu as a,
  Yp as b,
  Gu as c,
  Fn as d,
  Ne as e,
  _t as f,
  Ju as g,
  Qu as h,
  Yo as q,
  Zu as r,
  Yu as s
};
