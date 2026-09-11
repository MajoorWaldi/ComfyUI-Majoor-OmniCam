import { app as Sn } from "../../scripts/app.js";
import { api as Xe } from "../../scripts/api.js";
import { s as Ce, c as X, t as ge, a as s, o as jn, b as nr, d as Ve, e as he, f as Co, r as Ds, g as sr, h as _n, i as Bs, j as qs, k as Us, l as Ws, m as ir, n as cr, I as fo, p as lr, q as Vs, w as Hs, u as go, v as Cn, x as Gs, y as dr, z as Ir, A as En, B as Wo, C as An, D as $n, E as Mn, F as Tn, G as Vo, H as Po, J as Or, O as Pr, R as In, K as Ys, L as Xs, M as Zs, N as mr, P as Js, Q as Qs, S as ei, T as ti, U as ai, V as pr, W as oi, X as ri, Y as ni, Z as si, _ as ii, $ as ci, a0 as li, a1 as di, a2 as mi, a3 as pi, a4 as fi, a5 as hi, a6 as ui, a7 as bi, a8 as gi, a9 as yi, aa as vi, ab as xi, ac as wi, ad as ki, ae as Si, af as ji, ag as _i, ah as Ci, ai as Ei, aj as Ai, ak as $i, al as Mi, am as Ti, an as Ii, ao as Oi, ap as Pi, aq as Li, ar as Fi, as as zi, at as Ni, au as Ri, av as Ki, aw as Di, ax as Bi, ay as qi, az as Ui, aA as Wi, aB as On, aC as Pn, aD as Vi, aE as Lo, aF as Hi, aG as Gi, aH as Yi, aI as Xi, aJ as Zi, aK as ze, aL as Ji, aM as Ln, aN as fr, aO as Qi, aP as ec, aQ as tc, aR as Fn, aS as Ue, aT as Be, aU as ac, aV as Lr, aW as hr, aX as oc, aY as rc, aZ as nc, a_ as sc, a$ as ic, b0 as cc, b1 as lc, b2 as zn, b3 as dc, b4 as mc, b5 as pc, b6 as fc, b7 as hc, b8 as uc, b9 as bc, ba as gc, bb as yc, bc as vc, bd as xc, be as wc, bf as kc, bg as Sc, bh as jc, bi as _c, bj as Cc, bk as Ec, bl as Ac } from "./chunk-DD9VrnuU.js";
import { L as $c, a as Mc, p as zt, f as ur, b as Tc, S as Ic, c as Fr, d as Oc, e as Pc, r as Lc, g as Fc, n as zc, C as zr, h as Nt, o as Nc, i as Rc, s as Kc, j as Dc, k as Nn, l as Bc, m as Ho, q as Go, w as qc, t as Rn, u as Uc, v as Wc, x as Vc, y as Hc, z as Gc, A as Yc, B as Xc, D as Zc, E as Jc, F as Qc, G as el, H as tl, I as al, J as ol, K as rl, M as nl } from "./chunk-xLgUQmHK.js";
import { S as sl, b as il, p as cl, m as ll, l as dl, u as ml } from "./chunk-BOI_2OKd.js";
import { R as pl } from "./vendor-three-AeKB2-k3.js";
function Ct(e, t = 0) {
  return Math.sin(e * 1.7 + t * 3.1) * 0.5 + Math.sin(e * 3.3 + t * 5.7) * 0.3 + Math.sin(e * 7.9 + t * 11.3) * 0.2;
}
function fl(e, { type: t = "handheld_subtle", intensity: a = 1, duration_frames: o = null, subdivide: r = !0 } = {}) {
  const n = Array.isArray(e) ? e : e?.keyframes || [];
  if (!n || n.length === 0) return n;
  const i = t === "turbulence", c = t === "handheld_heavy", l = (i ? 0.12 : c ? 0.18 : 0.06) * a, p = (i ? 2 : c ? 2.8 : 0.9) * a, m = i ? 0.45 : c ? 0.22 : 0.12, h = n[n.length - 1]?.frame ?? 119, d = Math.max(h + 1, Number(o || (e?.duration_frames ?? h + 1))), f = i ? 4 : c ? 6 : 8, u = Array.isArray(e) ? { keyframes: n, duration_frames: d } : e, b = new Set(n.map((g) => g.frame));
  if (r && d > f) {
    for (let g = 0; g < d; g += f)
      b.add(g);
    b.add(d - 1);
  }
  return [...b].sort((g, v) => g - v).map((g) => {
    const v = Ce(u, g), S = Ct(g * m, 1) * l, x = Ct(g * m, 2) * l, A = Ct(g * m, 3) * l * 0.5, M = Ct(g * m, 4) * p, K = Ct(g * m, 5) * (p * 0.35), L = [...v.position], Y = [...v.target];
    return L[0] += S, L[1] += x, L[2] += A, Y[0] += S * 0.35, Y[1] += x * 0.35, {
      frame: g,
      camera: {
        ...v,
        position: L,
        target: Y,
        roll: (v.roll || 0) + M,
        fov: X((v.fov || 35) + K, 10, 140)
      },
      interpolation: "smooth"
    };
  });
}
function hl(e, { duration_frames: t = 120, target: a = [0, 1.5, 0], radius: o = 6, height: r = 3.5 } = {}) {
  const n = [], i = Math.max(2, t), [c, l, p] = a;
  if (e === "orbit_360") {
    const m = Math.max(17, Math.min(65, Math.ceil(i / 4) + 1));
    for (let h = 0; h < m; h++) {
      const d = Math.round(h / (m - 1) * (i - 1)), f = h / (m - 1) * Math.PI * 2, u = h === m - 1 ? [c, l + r, p + o] : [c + Math.sin(f) * o, l + r, p + Math.cos(f) * o];
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
const Kn = 1e-4;
function ul(e, t) {
  return !Array.isArray(e) || !Array.isArray(t) ? e !== t : e.some((a, o) => Math.abs(Number(a) - Number(t[o])) > Kn);
}
function Nr(e, t) {
  return Math.abs(Number(e) - Number(t)) > Kn;
}
const Dn = [
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
    changed: (e, t) => ul(e?.target, t?.target),
    read: (e) => e?.target
  },
  {
    id: "focal_length",
    label: "Focal Length",
    color: "#4aa3ef",
    changed: (e, t) => Nr(e?.fov, t?.fov),
    read: (e) => e?.fov
  },
  {
    id: "roll",
    label: "Roll",
    color: "#ec4899",
    changed: (e, t) => Nr(e?.roll, t?.roll),
    read: (e) => e?.roll
  }
];
function bl(e, t) {
  const a = [...e || []].sort((n, i) => n.frame - i.frame), o = [];
  let r = null;
  for (const n of a) {
    const i = n.camera || n.transform || {};
    (r === null || t.changed(r, i)) && o.push(n.frame), r = i;
  }
  return o;
}
function gl(e, t = null) {
  return Dn.filter((a) => !t || t.has(a.id)).map((a) => ({
    id: a.id,
    label: a.label,
    color: a.color,
    frames: bl(e, a)
  }));
}
function yl(e, t) {
  const a = t >= -1 && t <= 101;
  e.style.display = a ? "" : "none", a && (e.style.left = `${t}%`);
}
function yo(e) {
  const t = ge(e, e.frame);
  for (const a of [".oc-playhead-head", '[data-role="dope-playhead"]', ".oc-gdope-playhead", ".oc-sequence-playhead"])
    for (const o of e.root.querySelectorAll(a)) yl(o, t);
}
function vl(e, t, a) {
  if (t.length < 2) return;
  const o = a(t[0]), r = a(t[t.length - 1]), n = document.createElement("span");
  n.className = "oc-dope-rail", n.style.left = `${Math.max(0, Math.min(o, r))}%`, n.style.width = `${Math.max(0, Math.abs(r - o))}%`, e.appendChild(n);
}
function xl(e, t, a, o, r) {
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
      const h = e.timelineKeyframes().filter((d) => e.selectedKeyFrames.has(d.frame));
      e.keyDrag = {
        key: p,
        box: m,
        historyCheckpointed: !1,
        moving: h.map((d) => ({ key: d, startFrame: d.frame })),
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
function wl(e, t) {
  return [
    e.state.duration_frames,
    Number(e.timelineZoom) || 1,
    Number(e.timelinePan) || 0,
    ...t.map((a) => `${a.id}:${a.frames.join(",")}`)
  ].join("\0");
}
function Bn(e) {
  const t = e.root.querySelector('[data-role="dope-rows"]');
  if (!t) return;
  const a = new Set(e.dopeChannels || []);
  a.delete("camera");
  const o = e.timelineKeyframes() || [], r = gl(o, a), n = wl(e, r);
  if (t.dataset.signature !== n) {
    t.dataset.signature = n, t.replaceChildren();
    const i = (c) => ge(e, c);
    for (const c of r) {
      const l = document.createElement("div");
      l.className = "oc-dope-row", l.dataset.channel = c.id, l.style.setProperty("--channel-color", c.color), vl(l, c.frames, i), xl(e, l, c, o, i), t.appendChild(l);
    }
  }
  for (const i of t.querySelectorAll(".oc-dope-key"))
    i.classList.toggle("at-playhead", Number(i.dataset.frame) === e.frame);
  yo(e);
}
const Fo = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1e3, 2e3, 5e3], qn = 46, Rr = 5, Un = 640;
function Wn(e, t) {
  const a = t > 0 ? t : Un, o = Math.max(2, Math.floor(a / qn)), r = Math.max(1e-6, e / o);
  return Fo.find((n) => n >= r) ?? Fo[Fo.length - 1];
}
function kl(e, t) {
  const a = Math.max(1, e.state.duration_frames - 1), o = X(Number(e.timelineZoom) || 1, 0.1, 50), r = Number(e.timelinePan) || 0, n = a / o, i = Wn(n, t), l = (i >= Rr ? i / Rr : 0) || i, p = [], m = Math.max(0, Math.floor(r / l) * l);
  for (let d = m; d <= a + 1e-6; d += l) {
    const f = Math.round(d), u = ge(e, f);
    if (!(u < -1)) {
      if (u > 101) break;
      p.push({ frame: f, percent: u, major: Math.abs(f % i) < 1e-6 });
    }
  }
  const h = ge(e, a);
  if (h <= 101 && !p.some((d) => d.major && d.frame === a)) {
    const d = qn / Math.max(1, t) * 100;
    for (let f = p.length - 1; f >= 0; f -= 1)
      if (p[f].major) {
        if (h - p[f].percent >= d) break;
        p[f].major = !1;
      }
    p.push({ frame: a, percent: h, major: !0 });
  }
  return p;
}
function Sl(e) {
  return e.clientWidth || e.parentElement?.clientWidth || Un;
}
function Vn(e) {
  const t = e.root.querySelector('[data-role="ruler"]');
  if (!t) return;
  t.replaceChildren();
  for (const o of kl(e, Sl(t))) {
    const r = document.createElement("span");
    if (r.className = o.major ? "oc-tick major" : "oc-tick", r.style.left = `${o.percent}%`, t.appendChild(r), !o.major) continue;
    const n = document.createElement("span");
    n.className = "timeline-tick", n.textContent = String(o.frame), n.style.left = `${o.percent}%`, t.appendChild(n);
  }
  const a = ge(e, e.frame);
  if (a >= -1 && a <= 101) {
    const o = document.createElement("span");
    o.className = "oc-playhead-head", o.style.left = `${a}%`, t.appendChild(o);
  }
}
function jl(e, t) {
  const a = e.root.querySelector('[data-role="ruler"]');
  if (!a) return;
  let o = 0;
  const r = new ResizeObserver((c) => {
    const l = Math.round(c[0]?.contentRect.width ?? 0);
    !l || l === o || (o = l, Vn(e));
  });
  r.observe(a), t?.addEventListener("abort", () => r.disconnect(), { once: !0 });
  const n = (c) => {
    const l = nr(e, c, a);
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
  a.addEventListener("pointerup", i, { signal: t }), a.addEventListener("pointercancel", i, { signal: t }), a.addEventListener("wheel", (c) => jn(e, c), { passive: !1, signal: t });
}
const _l = [1, 2, 2.5, 5, 10];
function Cl(e, t = 5) {
  const a = Math.abs(e) / Math.max(1, t);
  if (!(a > 0) || !Number.isFinite(a)) return 1;
  const o = 10 ** Math.floor(Math.log10(a)), r = a / o;
  return (_l.find((n) => n >= r) ?? 10) * o;
}
function El(e, t) {
  const a = Math.max(0, Math.min(4, Math.ceil(-Math.log10(t))));
  return e.toFixed(a);
}
function Al(e, { left: t, right: a, top: o, width: r, graphWidth: n, graphHeight: i, height: c, timeMin: l, timeMax: p, totalDuration: m, xFor: h, frame: d }) {
  const f = Wn(p - l, n);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a", e.textAlign = "center";
  for (let b = Math.ceil(l / f) * f; b <= p; b += f) {
    const y = Math.round(b);
    if (y < 0 || y > m) continue;
    const g = h(y);
    g < t || g > r - a || (e.beginPath(), e.moveTo(g, o), e.lineTo(g, o + i), e.stroke(), e.fillText(String(y), g, c - 6));
  }
  const u = h(d);
  u >= t && u <= r - a && (e.fillStyle = "#a78bfa", e.fillText(String(d), u, c - 6)), e.textAlign = "left";
}
function $l(e, { left: t, right: a, top: o, width: r, graphHeight: n, minimum: i, maximum: c, yFor: l }) {
  const p = Cl(c - i, 4);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a";
  for (let m = Math.ceil(i / p) * p; m <= c; m += p) {
    const h = l(m);
    h < o - 1 || h > o + n + 1 || (e.beginPath(), e.moveTo(t, h), e.lineTo(r - a, h), e.stroke(), e.fillText(El(m, p), 4, h + 3));
  }
}
function br(e, t) {
  const a = e.getBoundingClientRect(), o = e.clientWidth / Math.max(1, a.width), r = (e.clientHeight || 180) / Math.max(1, a.height);
  return {
    x: (t.clientX - a.left) * o,
    y: (t.clientY - a.top) * r
  };
}
function Ml(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.currentTarget;
  a.focus({ preventScroll: !0 }), e.curveHover = null;
  const { x: o, y: r } = br(a, t);
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
      const c = Math.max(1, e.state.duration_frames - 1), l = c / (Number(e.curveZoomX) || 1), p = Number(e.curvePanX) || 0, m = Math.round(X(p + (o - 44) / Math.max(1, a.clientWidth - 58) * l, 0, c));
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
function Tl(e, t) {
  const a = t.currentTarget, { x: o, y: r } = br(a, t);
  if (e.curvePanDrag && t.pointerId === e.curvePanDrag.pointerId) {
    t.preventDefault();
    const h = t.clientX - e.curvePanDrag.startX, d = t.clientY - e.curvePanDrag.startY, u = Math.max(1, e.state.duration_frames - 1) / (Number(e.curveZoomX) || 1), b = Math.max(1, a.clientWidth - 58), y = a.clientHeight || 180, g = Math.max(1, y - 38);
    e.curvePanX = e.curvePanDrag.origPanX - h / b * u, e.curvePanY = e.curvePanDrag.origPanY + d / g * 10 / (Number(e.curveZoom) || 1), e.drawCurveEditor();
    return;
  }
  if (e.curveScrub && t.pointerId === e.curveScrub.pointerId) {
    t.preventDefault();
    const h = Math.max(1, e.state.duration_frames - 1), d = h / (Number(e.curveZoomX) || 1), f = Number(e.curvePanX) || 0, u = Math.round(X(f + (o - 44) / Math.max(1, a.clientWidth - 58) * d, 0, h));
    e.setFrame(u);
    return;
  }
  if (e.curveBoxSelect && t.pointerId === e.curveBoxSelect.pointerId) {
    t.preventDefault(), e.curveBoxSelect.currentX = o, e.curveBoxSelect.currentY = r;
    const h = Math.min(e.curveBoxSelect.startX, o), d = Math.max(e.curveBoxSelect.startX, o), f = Math.min(e.curveBoxSelect.startY, r), u = Math.max(e.curveBoxSelect.startY, r), b = (e.curveHitPoints || []).filter((g) => !g.handle && g.x >= h && g.x <= d && g.y >= f && g.y <= u).map((g) => g.key.frame), y = new Set(e.curveBoxSelect.additive ? e.curveBoxSelect.initial : []);
    for (const g of b) y.add(g);
    e.selectedKeyFrames = y, y.size && (e.selectedKeyFrame = [...y].at(-1)), e.updateKeyVisualState(), e.drawCurveEditor();
    return;
  }
  if (!e.curveDrag || t.pointerId !== e.curveDrag.pointerId) {
    const h = (e.curveHitPoints || []).map((v) => ({ point: v, distance: Math.hypot(o - v.x, r - v.y) })).sort((v, S) => v.distance - S.distance)[0], d = Math.max(1, e.state.duration_frames - 1), f = d / (Number(e.curveZoomX) || 1), u = Number(e.curvePanX) || 0, b = Math.max(1, a.clientWidth - 58), y = X(Math.round(u + (o - 44) / b * f), 0, d);
    let g = null;
    if (h && h.distance <= 14) {
      const v = h.point, S = v.object ? v.key.transform || v.object : v.key.camera || v.key;
      g = {
        x: o,
        y: r,
        frame: v.key.frame,
        channelName: v.channel.name,
        value: v.channel.get(S),
        isHandle: !!v.handle,
        handleSide: v.handle
      };
    } else r >= 20 && r <= 165 && o >= 44 && o <= a.clientWidth - 14 && (g = { x: o, y: r, frame: y });
    (!!e.curveHover != !!g || g && (e.curveHover?.frame !== g.frame || e.curveHover?.channelName !== g.channelName)) && (e.curveHover = g, e.drawCurveEditor());
    return;
  }
  if (e.curveHover = null, t.preventDefault(), t.stopPropagation(), e.curveDrag.historyCheckpointed || (e.checkpoint?.(e.curveDrag.handle ? "Edit curve tangent" : "Edit curve"), e.curveDrag.historyCheckpointed = !0), e.curveDrag.handle) {
    const h = e.curveDrag.key, d = e.curveDrag.channel, f = e.curveDrag.handle, u = e.curveDrag.pixelPerSegment, b = e.curveDrag.valuePerPixel, y = e.curveDrag.keyX, g = e.curveDrag.keyY;
    h.interpolation !== "bezier" && (h.interpolation = "bezier"), h.tangents || (h.tangents = { mode: "auto", channels: {} }), h.tangents.channels || (h.tangents.channels = {});
    const v = h.tangents.channels[d.id] || {}, S = v.mode || (h.tangents.mode === "aligned" ? "aligned" : "free"), x = {
      out_x: e.curveDrag.startHandles.out_x,
      out_y: e.curveDrag.startHandles.out_y,
      in_x: e.curveDrag.startHandles.in_x,
      in_y: e.curveDrag.startHandles.in_y,
      ...v,
      mode: S
    };
    if (f === "in") {
      if (x.in_x = X((o - y) / Math.max(1, u), -0.99, -0.01), x.in_y = (g - r) * b, S === "aligned") {
        const A = Math.hypot(x.in_x, x.in_y) || 1e-6, M = Math.hypot(e.curveDrag.startHandles.out_x, e.curveDrag.startHandles.out_y) || 1e-6;
        x.out_x = -x.in_x / A * M, x.out_y = -x.in_y / A * M;
      }
    } else if (x.out_x = X((o - y) / Math.max(1, u), 0.01, 0.99), x.out_y = (g - r) * b, S === "aligned") {
      const A = Math.hypot(x.out_x, x.out_y) || 1e-6, M = Math.hypot(e.curveDrag.startHandles.in_x, e.curveDrag.startHandles.in_y) || 1e-6;
      x.in_x = -x.out_x / A * M, x.in_y = -x.out_y / A * M;
    }
    h.tangents.channels[d.id] = x, e.scheduleSerialize(), e.camera = Ce(e.state, e.frame), e.applyObjectAnimationFrame(), e.render(), e.drawCurveEditor();
    return;
  }
  const n = e.curveDrag.maximum - (r - e.curveDrag.top) * (e.curveDrag.maximum - e.curveDrag.minimum) / Math.max(1, e.curveDrag.graphHeight), i = e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera, c = e.curveDrag.lastFrame / (Number(e.curveZoomX) || 1), l = Number(e.curvePanX) || 0, p = X(Math.round(l + (o - e.curveDrag.left) / Math.max(1, e.curveDrag.graphWidth) * c), 0, e.curveDrag.lastFrame), m = !t.shiftKey && Math.abs(o - e.curveDrag.startX) > 8;
  if (e.curveDrag.group) {
    const h = n - e.curveDrag.startValue;
    let d = m ? p - e.curveDrag.startFrame : 0;
    const f = new Set(e.timelineKeyframes().filter((u) => !e.selectedKeyFrames.has(u.frame)).map((u) => u.frame));
    if (d) {
      const u = e.curveDrag.group.map((y) => X(Math.round(y.startFrame + d), 0, e.curveDrag.lastFrame));
      u.some((y) => f.has(y)) || new Set(u).size !== u.length ? d = 0 : e.curveDrag.group.forEach((y, g) => {
        y.key.frame = u[g];
      });
    }
    for (const u of e.curveDrag.group)
      e.curveDrag.channel.set(u.backing, u.startValue + h);
    e.timelineKeyframes().sort((u, b) => u.frame - b.frame), e.selectedKeyFrames = new Set(e.curveDrag.group.map((u) => u.key.frame)), e.selectedKeyFrame = e.curveDrag.key.frame, e.editingKeyFrame = m ? null : e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame;
  } else
    e.curveDrag.channel.set(i, n), m && p !== e.curveDrag.key.frame ? (e.curveDrag.key.frame = p, e.selectedKeyFrame = p, e.frame = p) : (e.editingKeyFrame = e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame);
  if (e.curveDrag.object) {
    const h = Ve(e.curveDrag.key.transform);
    e.curveDrag.object.position = h.position, e.curveDrag.object.rotation = h.rotation, e.curveDrag.object.size = h.size;
  } else {
    const h = he(e.curveDrag.key.camera);
    e.camera.position = h.position, e.camera.target = h.target, e.camera.fov = h.fov, e.camera.roll = h.roll, e.camera.zoom = h.zoom;
  }
  e.scheduleSerialize(), e.render(), e.refreshKeyEditor(), e.drawCurveEditor();
}
function Il(e, t) {
  if (t.currentTarget.hasPointerCapture?.(t.pointerId) && t.currentTarget.releasePointerCapture(t.pointerId), e.curvePanDrag = null, e.curveScrub = null, e.curveBoxSelect = null, e.curveDrag) {
    const a = t.type === "pointercancel" || t.type === "lostpointercapture", o = e.curveDrag.historyCheckpointed;
    e.timelineKeyframes().sort((n, i) => n.frame - i.frame), e.editingKeyFrame = null, e.curveDrag = null, a && o && e.undo?.(), e.serialize(), e.refreshKeys(), e.updateKeyVisualState(), e.drawCurveEditor();
  }
}
function Ol(e, t) {
  const a = e.selectedKeyframe() || e.timelineKeyframes().find((o) => o.frame === e.frame);
  if (!a) return e.setStatus(s("Select a keyframe first"));
  e.checkpoint("Change interpolation"), a.interpolation = t;
  for (const o of e.root.querySelectorAll("[data-curve-mode]")) {
    const r = o.dataset.curveMode === t;
    o.classList.toggle("active", r), o.setAttribute("aria-pressed", String(r));
  }
  e.selectedKeyFrame = a.frame, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.render(), e.drawCurveEditor(), e.setStatus(s(`${t.replace("_", " ")} interpolation @ ${a.frame}`));
}
function Pl(e, t) {
  e.curveChannelFilter = t;
  for (const a of e.root.querySelectorAll("[data-channel-filter]")) {
    const o = a.dataset.channelFilter === String(t);
    a.classList.toggle("active", o), a.setAttribute("aria-pressed", String(o));
  }
  e.drawCurveEditor(), e.setStatus(t === "all" ? s("Showing all channels") : s(`Solo channel ${t}`));
}
function Ll(e, t) {
  const a = e.selectedKeyframe();
  if (!a || !["auto", "vector", "free", "aligned", "flat"].includes(t)) return e.setStatus(s("Select a keyframe first"));
  e.checkpoint("Change tangent mode"), t !== "auto" && a.interpolation !== "bezier" && (a.interpolation = "bezier"), a.tangents || (a.tangents = { mode: "auto", channels: {} }), a.tangents.mode = t, a.tangents.channels || (a.tangents.channels = {});
  const o = Ze(e);
  for (const r of o)
    a.tangents.channels[r.id] ? a.tangents.channels[r.id].mode = t : a.tangents.channels[r.id] = { mode: t };
  for (const r of e.root.querySelectorAll("[data-tangent-mode]")) {
    const n = r.dataset.tangentMode === t;
    r.classList.toggle("active", n), r.setAttribute("aria-pressed", String(n));
  }
  e.selectedKeyFrame = a.frame, e.serialize(), e.refreshKeys(), e.render(), e.drawCurveEditor(), e.setStatus(s(`Tangent mode: ${t} @ ${a.frame}`));
}
function Fl(e) {
  e.showCurveHandles = !e.showCurveHandles;
  for (const t of e.root.querySelectorAll('[data-act="curve-handles"]'))
    t.classList.toggle("active", e.showCurveHandles), t.setAttribute("aria-pressed", String(e.showCurveHandles)), t.title = s(`${e.showCurveHandles ? "Hide" : "Show"} Bézier tangent handles`);
  e.drawCurveEditor(), e.setStatus(s(`Bézier handles ${e.showCurveHandles ? "shown" : "hidden"}`));
}
function zl(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey) {
    const o = Math.max(1, e.state.duration_frames - 1);
    e.curvePanX = X((Number(e.curvePanX) || 0) + (t.deltaY > 0 ? 4 : -4), -o * 0.5, o);
  } else t.altKey ? e.curvePanY = (Number(e.curvePanY) || 0) + (t.deltaY > 0 ? -1 : 1) / (Number(e.curveZoom) || 1) : t.ctrlKey ? e.curveZoomX = X((Number(e.curveZoomX) || 1) * a, 0.2, 30) : (e.curveZoom = X((Number(e.curveZoom) || 1) * a, 0.2, 30), e.curveZoomX = X((Number(e.curveZoomX) || 1) * a, 0.2, 30));
  e.drawCurveEditor(), e.setStatus(s(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function Nl(e, t) {
  e.curveZoom = X((Number(e.curveZoom) || 1) * t, 0.2, 30), e.curveZoomX = X((Number(e.curveZoomX) || 1) * t, 0.2, 30), e.drawCurveEditor(), e.setStatus(s(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function Rl(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.currentTarget, { x: o, y: r } = br(a, t);
  if (r < 20) return;
  const n = Math.max(1, e.state.duration_frames - 1), i = n / (Number(e.curveZoomX) || 1), c = Number(e.curvePanX) || 0, l = Math.max(1, a.clientWidth - 58), p = X(Math.round(c + (o - 44) / l * i), 0, n);
  e.checkpoint?.("Insert keyframe"), e.setFrame(p), e.insertKeyframe(), e.selectedKeyFrame = p, e.selectedKeyFrames = /* @__PURE__ */ new Set([p]), e.updateKeyVisualState(), e.refreshKeys(), e.drawCurveEditor(), e.setStatus(s("Keyframe inserted @ F{frame}").replace("{frame}", p));
}
function Hn(e, { selectedOnly: t = !1 } = {}) {
  const a = Math.max(1, (e.state?.duration_frames ?? 120) - 1), o = e.timelineKeyframes() || [], r = e.timelineObject(), n = Ze(e), i = e.selectedKeyFrames?.size ? [...e.selectedKeyFrames] : e.selectedKeyFrame != null ? [e.selectedKeyFrame] : [], c = i.length > 0, l = t || c && i.length < o.length ? o.filter((b) => i.includes(b.frame)) : o;
  if (!l.length) {
    e.curveZoom = 1, e.curveZoomX = 1, e.curvePanX = 0, e.curvePanY = 0, e.drawCurveEditor(), e.setStatus(s("Curve view fitted"));
    return;
  }
  const p = l.map((b) => b.frame), m = Math.min(...p), h = Math.max(...p), d = Math.max(1, h - m);
  if (l.length < o.length && d < a) {
    const b = Math.max(2, Math.round(d * 0.15)), y = Math.max(0, m - b), g = Math.min(a, h + b), v = Math.max(1, g - y);
    e.curveZoomX = X(a / v, 0.2, 30), e.curvePanX = y;
  } else
    e.curveZoomX = 1, e.curvePanX = 0;
  const f = [];
  for (const b of l) {
    const y = r ? b.transform || r : b.camera || b;
    for (const g of n) {
      const v = g.get(y);
      Number.isFinite(v) && f.push(v);
    }
  }
  if (f.length > 0) {
    const b = Math.min(...f), y = Math.max(...f), g = Math.max(1e-4, y - b), v = (b + y) / 2, S = (H) => r ? Co(r, H) : Ce(e.state, H), x = [], A = Math.max(1, Math.floor(a / 40));
    for (let H = 0; H <= a; H += A) {
      const ne = S(H);
      for (const j of n) {
        const F = j.get(ne);
        Number.isFinite(F) && x.push(F);
      }
    }
    let M = Math.min(...x), K = Math.max(...x);
    (!Number.isFinite(M) || !Number.isFinite(K)) && (M = -1, K = 1), Math.abs(K - M) < 1e-6 && (M -= 1, K += 1);
    const L = (K - M) * 0.1;
    M -= L, K += L;
    const Y = K - M, U = (M + K) / 2;
    if (l.length < o.length && g < Y * 0.75) {
      const H = g * 1.35;
      e.curveZoom = X(Y / H, 0.2, 30), e.curvePanY = v - U;
    } else
      e.curveZoom = 1, e.curvePanY = 0;
  } else
    e.curveZoom = 1, e.curvePanY = 0;
  e.drawCurveEditor();
  const u = l.length < o.length ? s("Fitted to {n} selected keys").replace("{n}", l.length) : s("Curve view fitted");
  e.setStatus(u);
}
function Kl(e) {
  Hn(e);
}
function Ze(e) {
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
      r.fov = X(n, 5, 150);
    } },
    { id: "roll", name: "Roll", color: "#ec4899", get: (r) => r.roll || 0, set: (r, n) => {
      r.roll = X(n, -180, 180);
    } }
  ] : t === "lens" ? a = [
    { id: "fov", name: "FOV", color: "#ef8b3e", get: (r) => r.fov ?? 35, set: (r, n) => {
      r.fov = X(n, 5, 150);
    } },
    { id: "roll", name: "Roll", color: "#43c7db", get: (r) => r.roll || 0, set: (r, n) => {
      r.roll = X(n, -180, 180);
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
function Dl(e) {
  const t = e.root.querySelector('[data-role="curve-canvas"]');
  if (!t) return;
  const a = t.clientWidth, o = t.clientHeight || 180;
  if (!a || !o) return;
  const r = Math.min(2, window.devicePixelRatio || 1);
  (t.width !== Math.round(a * r) || t.height !== Math.round(o * r)) && (t.width = Math.round(a * r), t.height = Math.round(o * r));
  const n = t.getContext("2d");
  n.setTransform(r, 0, 0, r, 0, 0), n.clearRect(0, 0, a, o);
  const i = e.timelineObject(), c = e.timelineKeyframes(), l = Ze(e), p = 44, m = 14, h = 16, d = 22, f = Math.max(1, a - p - m), u = Math.max(1, o - h - d), b = Math.max(1, e.state.duration_frames - 1), y = X(Number(e.curveZoomX) || 1, 0.1, 50), g = Number(e.curvePanX) || 0, v = b / y, S = g, x = g + v, A = [], M = Math.max(1, Math.ceil(v / Math.max(80, f))), K = ($) => i ? Co(i, $) : Ce(e.state, $);
  for (let $ = 0; $ <= b; $ += M) A.push({ frame: $, value: K($) });
  A[A.length - 1]?.frame !== b && A.push({ frame: b, value: K(b) });
  const L = A.flatMap(($) => l.map((W) => W.get($.value)));
  let Y = Math.min(...L), U = Math.max(...L);
  (!Number.isFinite(Y) || !Number.isFinite(U)) && (Y = -1, U = 1), Math.abs(U - Y) < 1e-6 && (Y -= 1, U += 1);
  const H = (U - Y) * 0.1;
  Y -= H, U += H;
  const ne = X(Number(e.curveZoom) || 1, 0.1, 50), j = (U + Y) / 2 + (Number(e.curvePanY) || 0), F = (U - Y) / ne;
  Y = j - F / 2, U = j + F / 2;
  const q = ($) => p + ($ - S) / Math.max(1e-6, x - S) * f, G = ($) => h + u * (U - $) / Math.max(1e-6, U - Y);
  if (n.fillStyle = "#111114", n.fillRect(0, 0, a, o), n.strokeStyle = "#222228", n.lineWidth = 1, n.font = "9px system-ui, -apple-system, sans-serif", n.fillStyle = "#6e727a", Al(n, {
    left: p,
    right: m,
    top: h,
    width: a,
    graphWidth: f,
    graphHeight: u,
    height: o,
    timeMin: S,
    timeMax: x,
    totalDuration: b,
    xFor: q,
    frame: e.frame
  }), $l(n, { left: p, right: m, top: h, width: a, graphHeight: u, minimum: Y, maximum: U, yFor: G }), Y <= 0 && U >= 0) {
    const $ = G(0);
    n.strokeStyle = "#383842", n.lineWidth = 1.2, n.beginPath(), n.moveTo(p, $), n.lineTo(a - m, $), n.stroke();
  }
  e.curveHitPoints = [];
  for (const $ of l) {
    n.strokeStyle = $.color, n.lineWidth = 2, n.beginPath();
    let W = !1;
    A.forEach((P) => {
      const V = q(P.frame), Z = G($.get(P.value));
      V >= p - 50 && V <= a - m + 50 && (W ? n.lineTo(V, Z) : (n.moveTo(V, Z), W = !0));
    }), n.stroke();
    for (const P of c) {
      const V = i ? P.transform : P.camera, Z = q(P.frame), de = G($.get(V)), me = P.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(P.frame);
      me && (n.fillStyle = "rgba(242, 208, 107, 0.35)", n.beginPath(), n.arc(Z, de, 8.5, 0, Math.PI * 2), n.fill()), n.fillStyle = me ? "#ffd75e" : $.color, n.strokeStyle = "#0d0d10", n.lineWidth = 1.6, n.beginPath(), n.arc(Z, de, me ? 5.2 : 3.8, 0, Math.PI * 2), n.fill(), n.stroke(), e.curveHitPoints.push({
        x: Z,
        y: de,
        key: P,
        channel: $,
        minimum: Y,
        maximum: U,
        timeMin: S,
        timeMax: x,
        graphHeight: u,
        graphWidth: f,
        lastFrame: b,
        left: p,
        top: h,
        object: i
      });
    }
    if (e.showCurveHandles)
      for (let P = 0; P < c.length; P++) {
        const V = c[P], Z = V.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(V.frame);
        if (!(Z || e.curveChannelFilter !== "all" || c.length <= 4) || V.interpolation !== "bezier") continue;
        const me = i ? V.transform || i : V.camera || V, te = q(V.frame), pe = G($.get(me)), ye = c[P - 1], ue = c[P + 1], xe = Math.max(1, V.frame - (ye?.frame ?? V.frame - 1)), z = Math.max(1, (ue?.frame ?? V.frame + 1) - V.frame), R = Ds(
          V,
          $.id,
          ye,
          ue,
          (re) => $.get(i ? re.transform || i : re.camera || V)
        ), ie = (U - Y) / Math.max(1, u), le = f * z / Math.max(1, v), be = f * xe / Math.max(1, v), fe = [];
        (ye || P > 0) && fe.push({ side: "in", x: te + R.in_x * be, y: pe - R.in_y / ie }), (ue || P < c.length - 1 || c.length === 1) && fe.push({ side: "out", x: te + R.out_x * le, y: pe - R.out_y / ie });
        for (const re of fe) {
          if (n.strokeStyle = $.color, n.lineWidth = Z ? 1.5 : 1, n.beginPath(), n.moveTo(te, pe), n.lineTo(re.x, re.y), n.stroke(), n.fillStyle = Z ? "#2a2233" : "#171720", n.strokeStyle = Z ? "#ffd75e" : $.color, n.lineWidth = Z ? 2 : 1.2, n.beginPath(), re.side === "in")
            n.arc(re.x, re.y, Z ? 5 : 3.8, 0, Math.PI * 2);
          else {
            const _e = Z ? 4.5 : 3.2;
            n.rect(re.x - _e, re.y - _e, _e * 2, _e * 2);
          }
          n.fill(), n.stroke(), e.curveHitPoints.push({
            x: re.x,
            y: re.y,
            key: V,
            keyX: te,
            keyY: pe,
            channel: $,
            minimum: Y,
            maximum: U,
            timeMin: S,
            timeMax: x,
            top: h,
            left: p,
            graphHeight: u,
            graphWidth: f,
            lastFrame: b,
            object: i,
            handle: re.side,
            pixelPerSegment: re.side === "in" ? be : le,
            valuePerPixel: ie,
            startHandles: { ...R }
          });
        }
      }
  }
  if (e.curveBoxSelect) {
    const $ = Math.min(e.curveBoxSelect.startX, e.curveBoxSelect.currentX), W = Math.min(e.curveBoxSelect.startY, e.curveBoxSelect.currentY), P = Math.abs(e.curveBoxSelect.currentX - e.curveBoxSelect.startX), V = Math.abs(e.curveBoxSelect.currentY - e.curveBoxSelect.startY);
    n.fillStyle = "rgba(56, 189, 248, 0.15)", n.fillRect($, W, P, V), n.strokeStyle = "#38bdf8", n.lineWidth = 1, n.setLineDash([4, 4]), n.strokeRect($, W, P, V), n.setLineDash([]);
  }
  const oe = q(e.frame);
  if (oe >= p && oe <= a - m && (n.strokeStyle = "#a78bfa", n.lineWidth = 1.5, n.beginPath(), n.moveTo(oe, h), n.lineTo(oe, h + u), n.stroke(), n.fillStyle = "#a78bfa", n.beginPath(), n.moveTo(oe - 4, h), n.lineTo(oe + 4, h), n.lineTo(oe, h + 6), n.closePath(), n.fill()), e.curveDrag || e.curveHover) {
    let $ = "", W = "";
    if (e.curveDrag)
      if (e.curveDrag.handle) {
        const P = e.curveDrag.handle === "in" ? "In" : "Out";
        $ = `F${e.curveDrag.key.frame} · ${e.curveDrag.channel.name} (${P})`, W = "Tangent edit";
      } else if (e.curveDrag.group && e.curveDrag.group.length > 1) {
        const P = e.curveDrag.key.frame - e.curveDrag.startFrame, V = e.curveDrag.channel.get(e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera), Z = V - e.curveDrag.startValue, de = P >= 0 ? `+${P}` : `${P}`, me = Z >= 0 ? `+${Z.toFixed(2)}` : `${Z.toFixed(2)}`;
        $ = `${e.curveDrag.group.length} keys · ΔF: ${de} · ΔVal: ${me}`, W = `${e.curveDrag.channel.name}: ${V.toFixed(2)}`;
      } else {
        const P = e.curveDrag.key.frame - e.curveDrag.startFrame, V = e.curveDrag.channel.get(e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera), Z = V - e.curveDrag.startValue, de = P >= 0 ? `+${P}` : `${P}`, me = Z >= 0 ? `+${Z.toFixed(2)}` : `${Z.toFixed(2)}`;
        $ = `F${e.curveDrag.key.frame} (${de}) · ${e.curveDrag.channel.name}: ${V.toFixed(2)} (${me})`;
      }
    else if (e.curveHover)
      if (e.curveHover.channelName) {
        const P = Number.isFinite(e.curveHover.value) ? e.curveHover.value.toFixed(2) : "";
        $ = `F${e.curveHover.frame} · ${e.curveHover.channelName}: ${P}`, e.curveHover.isHandle && (W = `Handle ${e.curveHover.handleSide}`);
      } else
        $ = `Frame ${e.curveHover.frame}`;
    if ($) {
      n.save(), n.font = "11px system-ui, -apple-system, sans-serif";
      const P = n.measureText($), V = W ? n.measureText(W) : { width: 0 }, Z = Math.max(P.width, V.width) + 16, de = W ? 32 : 20, me = a - m - Z - 6, te = h + 6;
      n.fillStyle = "rgba(18, 18, 24, 0.88)", n.strokeStyle = "#38384a", n.lineWidth = 1, n.beginPath(), n.roundRect ? n.roundRect(me, te, Z, de, 4) : n.rect(me, te, Z, de), n.fill(), n.stroke(), n.fillStyle = "#e2e8f0", n.fillText($, me + 8, te + (W ? 13 : 14)), W && (n.fillStyle = "#94a3b8", n.font = "9.5px system-ui, -apple-system, sans-serif", n.fillText(W, me + 8, te + 26)), n.restore();
    }
  }
  for (const $ of e.root.querySelectorAll("[data-tangent-mode]")) {
    const W = e.selectedKeyframe(), P = W?.tangents?.channels?.[l[0]?.id]?.mode || W?.tangents?.mode || "auto";
    $.classList.toggle("active", $.dataset.tangentMode === P);
  }
  for (const $ of e.root.querySelectorAll("[data-channel-filter]"))
    $.classList.toggle("active", $.dataset.channelFilter === (e.curveChannelFilter || "all"));
  for (const $ of e.root.querySelectorAll("[data-curve-mode]"))
    $.classList.toggle("active", $.dataset.curveMode === e.selectedKeyframe()?.interpolation);
}
function Kr(e, { filter: t, label: a, color: o, title: r }) {
  const n = document.createElement("button");
  if (n.type = "button", n.className = "curve-mode", n.dataset.channelFilter = t, n.title = r, o) {
    const i = document.createElement("span");
    i.className = "ch-dot", i.style.background = o, n.appendChild(i);
  }
  return n.appendChild(document.createTextNode(a)), n.addEventListener("click", () => e.setChannelFilter(t)), n;
}
function Bl(e) {
  const t = e.curveChannelFilter;
  e.curveChannelFilter = "all";
  try {
    return Ze(e);
  } finally {
    e.curveChannelFilter = t;
  }
}
function Gn(e) {
  const t = e.root.querySelector('[data-role="curve-legend"]');
  if (!t) return;
  const a = e.timelineObject(), o = a ? a.name || a.type : e.activeCameraTrack().name, r = Bl(e), n = `${o}\0${r.map((c) => `${c.id}:${c.color}`).join("|")}`;
  if (t.dataset.signature !== n) {
    t.dataset.signature = n, t.replaceChildren();
    const c = document.createElement("span");
    c.className = "oc-graph-legend-title", c.textContent = o, t.appendChild(c), t.appendChild(Kr(e, {
      filter: "all",
      label: s("All"),
      color: null,
      title: s("Show all curves in group")
    })), r.forEach((l, p) => {
      t.appendChild(Kr(e, {
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
const ql = 1e-4;
function Dr(e, t, a) {
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
    (r === null || !(Math.abs(c - r) <= ql)) && o.push(n.frame), r = c;
  }
  return o;
}
function gr(e) {
  const t = e.root.querySelector('[data-role="graph-dope"]');
  if (!t || t.hidden) return;
  const a = e.timelineKeyframes() || [], o = !!e.timelineObject(), r = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame])), n = Ze(e), i = [
    e.state.duration_frames,
    Number(e.timelineZoom) || 1,
    Number(e.timelinePan) || 0,
    ...n.map((c) => `${c.id}:${Dr(a, c, o).join(",")}`)
  ].join("\0");
  if (t.dataset.signature === i) {
    for (const c of t.querySelectorAll(".oc-dope-key")) {
      const l = Number(c.dataset.frame);
      c.classList.toggle("at-playhead", l === e.frame), c.classList.toggle("selected", r.has(l));
    }
    yo(e);
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
    for (const d of Dr(a, c, o)) {
      const f = ge(e, d);
      if (f < -5 || f > 105) continue;
      const u = document.createElement("button");
      u.type = "button", u.className = `oc-dope-key${d === e.frame ? " at-playhead" : ""}${r.has(d) ? " selected" : ""}`, u.style.left = `${f}%`, u.dataset.frame = String(d), u.title = s("{channel} changes at frame {frame}").replace("{channel}", s(c.name)).replace("{frame}", String(d)), u.addEventListener("click", (b) => {
        b.preventDefault(), b.stopPropagation();
        const y = a.find((g) => g.frame === d);
        y && e.selectKeyframe(y);
      }), m.appendChild(u);
    }
    const h = document.createElement("span");
    h.className = "oc-gdope-playhead", m.appendChild(h), l.appendChild(m), t.appendChild(l);
  }
  yo(e);
}
const Br = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
function Yn(e, t) {
  const a = e.state.cameras.findIndex((r) => r.id === t), o = a >= 0 ? e.state.cameras[a] : null;
  return { camera: o, color: o?.color || Br[Math.max(0, a) % Br.length] };
}
function it(e) {
  e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render();
}
function Xn(e, t) {
  const a = sr(e.state);
  for (const r of t.querySelectorAll(".oc-sequence-shot")) {
    const n = a[Number(r.dataset.cutIndex)];
    if (!n) continue;
    const i = ge(e, n.start), c = ge(e, n.end + 1);
    r.style.left = `${i}%`, r.style.width = `${Math.max(0.4, c - i)}%`;
  }
  const o = t.querySelector(".oc-sequence-playhead");
  o && (o.style.left = `${ge(e, e.frame)}%`);
}
function Ul(e) {
  e.checkpoint("Auto-split shots"), e.state.sequence = {
    ...e.state.sequence || { recording_path: "" },
    enabled: !0,
    cuts: Us(e.state)
  }, it(e), e.setStatus(s("Split into {count} shots").replace("{count}", String(e.state.sequence.cuts.length)));
}
function ao(e, t, a, { disabled: o = !1 } = {}) {
  const r = document.createElement("button");
  return r.type = "button", r.className = "curve-mode", r.title = t, r.textContent = e, r.disabled = o, r.addEventListener("click", a), r;
}
function Wl(e, t) {
  const a = document.createElement("div");
  a.className = "oc-sequence-toolbar";
  const o = e.state.cameras.length < 2;
  if (a.appendChild(ao(
    s("Auto-split shots"),
    s("Split the timeline evenly across every camera"),
    () => Ul(e),
    { disabled: o }
  )), t.length && (a.appendChild(ao(
    s("Split at playhead"),
    s("Cut the current shot in two at the playhead"),
    () => {
      e.checkpoint("Split shot"), _n(e.state, e.frame, null) ? it(e) : e.setStatus(s("Move the playhead inside a shot first"));
    },
    { disabled: o }
  )), a.appendChild(ao(
    s("Clear edit"),
    s("Remove every shot and stop cutting the timeline"),
    () => {
      e.checkpoint("Clear edit"), e.state.sequence = { ...e.state.sequence, enabled: !1, cuts: [] }, it(e), e.setStatus(s("Multi-camera edit cleared"));
    }
  ))), a.appendChild(ao(
    e.audioWaveformPeaks?.length ? s("Replace audio") : s("Load audio"),
    s("Load an audio track to cut against"),
    () => e.root.querySelector('[data-role="audio-file"]')?.click()
  )), t.length) {
    const r = document.createElement("span");
    r.className = "oc-sequence-summary", r.textContent = s("{count} shots · drag a divider to trim · right-click a shot for its camera").replace("{count}", String(t.length)), a.appendChild(r);
  }
  return a;
}
function Vl(e, t, a, o, r) {
  t.preventDefault(), t.stopPropagation();
  try {
    a.setPointerCapture(t.pointerId);
  } catch {
  }
  e.checkpoint("Trim cut"), e.sequenceDrag = !0;
  const n = (c) => {
    if (!(c.buttons & 1)) return i();
    qs(e.state, r, nr(e, c, o)) && Xn(e, o);
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
function Hl(e, t, a, o, r) {
  t.preventDefault(), t.stopPropagation();
  const { camera: n } = Yn(e, a.camera_id);
  e.contextMenu?.show(t, n?.name || s("Shot"), [
    ...e.state.cameras.map((i) => ({
      label: s("Use {name}").replace("{name}", i.name),
      icon: "pi-video",
      disabled: i.id === a.camera_id,
      run: () => {
        e.checkpoint("Change shot camera"), e.state.sequence.cuts[o].camera_id = i.id, it(e);
      }
    })),
    null,
    {
      label: s("Split at playhead"),
      icon: "pi-arrows-h",
      disabled: e.frame <= a.start || e.frame > a.end,
      run: () => {
        e.checkpoint("Split shot"), _n(e.state, e.frame, null) && it(e);
      }
    },
    {
      label: s("Remove shot"),
      icon: "pi-trash",
      danger: !0,
      disabled: r === 1,
      run: () => {
        e.checkpoint("Remove shot"), Bs(e.state, o) && it(e);
      }
    }
  ]);
}
function Gl(e, t, a, o) {
  const { camera: r, color: n } = Yn(e, t.camera_id), i = document.createElement("div");
  i.className = "oc-sequence-shot", i.dataset.cutIndex = String(a), i.style.left = `${ge(e, t.start)}%`, i.style.width = `${Math.max(0.4, ge(e, t.end + 1) - ge(e, t.start))}%`, i.style.setProperty("--shot-color", n), r?.recording_path || i.classList.add("no-proxy"), i.title = s("{name} · F{start}-{end}").replace("{name}", r?.name || t.camera_id).replace("{start}", String(t.start)).replace("{end}", String(t.end));
  const c = document.createElement("span");
  if (c.className = "oc-sequence-name", c.textContent = r?.name || t.camera_id, i.appendChild(c), a > 0) {
    const l = document.createElement("span");
    l.className = "oc-sequence-handle", l.title = s("Drag to trim the cut"), l.addEventListener("pointerdown", (p) => Vl(e, p, l, o, a)), i.appendChild(l);
  }
  return i.addEventListener("contextmenu", (l) => Hl(e, l, t, a, o.__cutCount)), i.addEventListener("pointerdown", () => {
    e.root.querySelector('[data-role="graph-sequence"]')?.focus?.({ preventScroll: !0 });
  }), i;
}
function Yl(e) {
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
    for (let h = 0; h < a.length; h++) {
      const f = (h / (a.length - 1) * c - p) / Math.max(1e-6, m) * r;
      if (f < -4 || f > r + 4) continue;
      const u = a[h] * n * 0.9;
      i.fillRect(f, (n - u) / 2, Math.max(1, r / a.length * l - 0.5), u);
    }
  }), t;
}
function Zn(e, t) {
  if (!t) return;
  const a = t.querySelector('[data-role="sequence-track"]');
  if (e.sequenceDrag && a) {
    Xn(e, a);
    return;
  }
  const o = sr(e.state);
  t.replaceChildren(Wl(e, o));
  const r = document.createElement("div");
  r.className = "oc-sequence-tracks", r.dataset.role = "sequence-track", r.__cutCount = o.length;
  const n = document.createElement("div");
  if (n.className = "oc-sequence-lane", n.dataset.role = "sequence-lane", n.setAttribute("aria-label", s("Multi-camera edit")), o.length)
    for (const [c, l] of o.entries()) {
      const p = ge(e, l.start);
      ge(e, l.end + 1) < -5 || p > 105 || n.appendChild(Gl(e, l, c, r));
    }
  else {
    const c = document.createElement("span");
    c.className = "oc-sequence-empty", c.textContent = e.state.cameras.length > 1 ? s("No shots yet. Auto-split hands each camera a slice of the timeline.") : s("Add a second camera, then Auto-split to cut between them."), n.appendChild(c);
  }
  r.appendChild(n), r.appendChild(Yl(e));
  const i = document.createElement("span");
  i.className = "oc-sequence-playhead", i.style.left = `${ge(e, e.frame)}%`, r.appendChild(i), t.appendChild(r);
}
const Xl = ['[data-act="curve-zoom-in"]', '[data-act="curve-zoom-out"]', '[data-act="curve-fit"]', '[data-act="curve-handles"]'], qr = { curves: "Graph", dope: "Timeline", sequence: "Sequence" };
function Ur(e, t) {
  const a = t in qr ? t : "curves";
  e.graphTab = a;
  for (const i of e.root.querySelectorAll("[data-graph-tab]")) {
    const c = i.dataset.graphTab === a;
    i.classList.toggle("active", c), i.setAttribute("aria-pressed", String(c));
  }
  const o = e.root.querySelector('[data-role="curve-canvas"]'), r = e.root.querySelector('[data-role="graph-dope"]'), n = e.root.querySelector('[data-role="graph-sequence"]');
  o && (o.hidden = a !== "curves"), r && (r.hidden = a !== "dope"), n && (n.hidden = a !== "sequence");
  for (const i of Xl) {
    const c = e.root.querySelector(i);
    c && (c.disabled = a !== "curves");
  }
  a === "dope" ? gr(e) : a === "sequence" ? (Zn(e, n), n?.focus?.({ preventScroll: !0 })) : e.drawCurveEditor(), e.setStatus(s(qr[a]));
}
function Zl(e) {
  e.graphTab === "sequence" && Zn(e, e.root.querySelector('[data-role="graph-sequence"]'));
}
function Jl(e, t) {
  const a = e.root.querySelector('[data-role="graph-tabs"]');
  a && a.addEventListener("keydown", (o) => {
    if (o.key === "ArrowLeft" || o.key === "ArrowRight") {
      o.preventDefault(), o.stopPropagation();
      const r = [...a.querySelectorAll("[data-graph-tab]")], n = r.findIndex((i) => i.classList.contains("active"));
      if (n >= 0 && r.length > 1) {
        const i = o.key === "ArrowRight" ? (n + 1) % r.length : (n - 1 + r.length) % r.length;
        r[i].focus(), Ur(e, r[i].dataset.graphTab);
      }
    }
  }, { signal: t });
  for (const o of e.root.querySelectorAll("[data-graph-tab]"))
    o.addEventListener("click", (r) => {
      r.preventDefault(), r.stopPropagation(), Ur(e, o.dataset.graphTab);
    }, { signal: t });
}
const Ql = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function Jn(e, t) {
  const a = Math.max(0, Math.floor(Number(t) || 0)), o = Array.from({ length: a }, (n, i) => ({ frame: i, state: "unknown", score: null })), r = e?.solve_health_v1;
  if (!r || !Array.isArray(r.frames)) return o;
  for (const n of r.frames) {
    const i = Number(n?.frame);
    if (!Number.isInteger(i) || i < 0 || i >= o.length) continue;
    const c = Ql.has(n?.state) ? n.state : "unknown", l = n?.score;
    let p = null;
    if (l != null) {
      const m = Number(l);
      p = Number.isFinite(m) ? Math.max(0, Math.min(1, m)) : null;
    }
    o[i] = { frame: i, state: c, score: p };
  }
  return o;
}
let Wr = /* @__PURE__ */ new WeakSet();
function ed(e) {
  if (!e) return "";
  const t = e.score === null || e.score === void 0 ? "" : ` · ${Math.round(e.score * 100)}%`;
  return `F${e.frame} · ${e.state}${t}`;
}
function td(e) {
  const t = e.root?.querySelector?.('[data-role="solve-health-strip"]'), a = e.root?.querySelector?.('[data-role="solve-health-cells"]');
  if (!t || !a) return;
  const o = Jn(e.state?.metadata, e.state?.duration_frames), r = o.some((c) => c.state !== "unknown");
  t.classList.toggle("oc-health-strip-empty", !r), a.childElementCount !== o.length && a.replaceChildren(...o.map(() => {
    const c = document.createElement("span");
    return c.className = "oc-health-cell", c;
  }));
  const n = a.children;
  for (let c = 0; c < o.length; c += 1) {
    const l = n[c], p = o[c];
    l.dataset.frame = String(p.frame), l.dataset.state = p.state, l.dataset.score = p.score === null ? "" : String(p.score), l.classList.toggle("at-playhead", p.frame === e.frame);
  }
  if (Wr.has(a)) return;
  Wr.add(a), a.addEventListener("pointerdown", (c) => {
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
      i.textContent = ed({
        frame: Number(l.dataset.frame),
        state: l.dataset.state,
        score: l.dataset.score === "" ? null : Number(l.dataset.score)
      });
    }
  }), a.addEventListener("pointerleave", () => {
    i && (i.textContent = "");
  });
}
function ad(e) {
  const t = e.root.querySelector('[data-role="keys"]');
  if (!t) return;
  t.innerHTML = "";
  const a = e.timelineObject(), o = e.timelineKeyframes(), r = Math.max(1, e.state.duration_frames - 1), n = X(Number(e.timelineZoom) || 1, 0.1, 50), i = Number(e.timelinePan) || 0, c = r / n, l = i;
  if (e.audioWaveformPeaks && e.audioWaveformPeaks.length) {
    const v = document.createElement("canvas");
    v.className = "timeline-waveform", v.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:0.35", v.width = Math.max(1, t.clientWidth || 600), v.height = Math.max(1, t.clientHeight || 68);
    const S = v.getContext("2d"), x = e.audioWaveformPeaks, A = v.width, M = v.height, K = M / 2;
    S.fillStyle = "#f2d06b";
    for (let L = 0; L < x.length; L++) {
      const U = (L / (x.length - 1) * r - l) / Math.max(1e-6, c) * A;
      if (U >= -5 && U <= A + 5) {
        const H = x[L] * (M * 0.85);
        S.fillRect(U, K - H / 2, Math.max(1, A / x.length * n - 0.5), H);
      }
    }
    t.appendChild(v);
  }
  if (e.state.playback_range) {
    const v = document.createElement("div");
    v.className = "playback-range";
    const S = ge(e, e.state.playback_range[0]), x = ge(e, e.state.playback_range[1]);
    v.style.left = `${S}%`, v.style.width = `${Math.max(0, x - S)}%`, t.appendChild(v);
  }
  Ws(e, t);
  for (const v of e.state.markers || []) {
    const S = ge(e, v.frame);
    if (S < -5 || S > 105) continue;
    const x = document.createElement("span");
    x.className = "timeline-marker", x.style.left = `${S}%`, x.style.setProperty("--marker-color", v.color), x.title = v.name, t.appendChild(x);
  }
  if (o.length > 1) {
    const v = ge(e, o[0].frame), S = ge(e, o[o.length - 1].frame), x = document.createElement("span");
    x.className = "oc-dope-rail", x.style.left = `${Math.min(v, S)}%`, x.style.width = `${Math.abs(S - v)}%`, x.style.setProperty("--channel-color", "#a78bfa"), t.appendChild(x);
  }
  const p = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const v of o) {
    const S = ge(e, v.frame);
    if (S < -5 || S > 105) continue;
    const x = document.createElement("button");
    x.type = "button", x.className = `key${v.frame === e.frame ? " at-playhead" : ""}${p.has(v.frame) ? " selected" : ""}${v.frame === e.editingKeyFrame ? " editing" : ""}`, x.dataset.keyFrame = String(v.frame), x.dataset.interp = v.interpolation || "ease", x.setAttribute("aria-label", s(`${a?.name || "Camera"} keyframe at frame ${v.frame}`)), x.title = s(`Frame ${v.frame} · ${v.interpolation} · Drag: Retime · Alt+Drag: Duplicate`), x.style.left = `${S}%`;
    const A = document.createElement("span");
    A.className = "key-label", A.textContent = String(v.frame), x.appendChild(A), x.addEventListener("pointerdown", (M) => {
      if (M.preventDefault(), M.stopPropagation(), x.focus({ preventScroll: !0 }), M.altKey) {
        e.checkpoint("Duplicate keyframe");
        const L = a ? { frame: v.frame, transform: Ve(v.transform), interpolation: v.interpolation } : { frame: v.frame, camera: he(v.camera), interpolation: v.interpolation }, Y = e.timelineKeyframes();
        Y.push(L), Y.sort((U, H) => U.frame - H.frame), e.selectedKeyFrame = L.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([L.frame]), e.keyDrag = { key: L, box: t, isDuplicate: !0, historyCheckpointed: !0, moving: [{ key: L, startFrame: L.frame }], startPointerFrame: v.frame, startClientX: M.clientX, startClientY: M.clientY }, e.setFrame(L.frame, !1, !1), e.setStatus(s(`Duplicating key from ${v.frame}...`));
        return;
      }
      if (M.shiftKey) {
        e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((L) => L !== null)), e.selectedKeyFrames.has(v.frame) ? e.selectedKeyFrames.delete(v.frame) : e.selectedKeyFrames.add(v.frame), e.selectedKeyFrame = e.selectedKeyFrames.has(v.frame) ? v.frame : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(v.frame, !1, !1), e.updateKeyVisualState(), e.refreshKeyEditor();
        return;
      }
      e.selectedKeyFrames?.has(v.frame) || (e.selectedKeyFrames = /* @__PURE__ */ new Set([v.frame])), e.selectedKeyFrame = v.frame;
      const K = e.timelineKeyframes().filter((L) => e.selectedKeyFrames.has(L.frame));
      e.keyDrag = { key: v, box: t, historyCheckpointed: !1, moving: K.map((L) => ({ key: L, startFrame: L.frame })), startPointerFrame: v.frame, startClientX: M.clientX, startClientY: M.clientY }, e.setFrame(v.frame, !1, !1);
    }), x.addEventListener("click", (M) => {
      M.preventDefault(), M.stopPropagation(), !M.shiftKey && (M.shiftKey || (e.selectedKeyFrames = /* @__PURE__ */ new Set([v.frame])), e.selectKeyframe(v));
    }), t.appendChild(x);
  }
  const m = e.activeCameraTrack(), h = e.root.querySelector('[data-role="timeline-summary"]');
  if (h) {
    h.replaceChildren();
    const v = document.createElement("span");
    v.style.fontWeight = "700", e.selectedEntity === "object" && a ? (v.style.color = "#38bdf8", v.textContent = `📦 ${a.name || a.type}`, h.title = s(`Currently animating object: ${a.name || a.type}`)) : (v.style.color = "#f59e0b", v.textContent = `🎥 ${m.name}`, h.title = s(`Currently animating camera: ${m.name}`)), h.append(v, document.createTextNode(` · ${o.length} key${o.length === 1 ? "" : "s"}`));
    const S = e.selectedKeyFrames?.size || 0;
    S > 1 && h.append(document.createTextNode(` · ${S} selected`));
    const x = o.filter((A) => A.frame > e.state.duration_frames - 1).length;
    if (x) {
      const A = document.createElement("span");
      A.className = "oc-dormant-keys", A.textContent = ` · ${x} beyond end`, A.title = s("Keys past the end of the timeline are kept. Lengthen the shot to reach them again."), h.append(A);
    }
  }
  const d = e.root.querySelector('[data-role="key-count"]');
  d && (d.textContent = String(o.length));
  const f = e.root.querySelector('[data-role="camera-summary"]');
  f && (f.textContent = `${m.name} · Key F${e.selectedKeyFrame ?? e.frame}`);
  const u = e.root.querySelector('[data-role="camera-menu-list"]');
  if (u) {
    u.innerHTML = "";
    for (const v of e.state.cameras) {
      const S = document.createElement("button");
      S.type = "button", S.className = v.id === e.state.active_camera_id ? "selected" : "";
      const x = document.createElement("i");
      x.className = "pi pi-video";
      const A = document.createElement("span");
      A.textContent = `${v.name} · ${v.keyframes.length} key${v.keyframes.length === 1 ? "" : "s"}${v.id === e.state.playblast_camera_id ? " · PLAYBLAST" : ""}`, S.append(x, A), S.addEventListener("click", () => {
        e.activateCamera(v.id), e.closeMenus();
      }), u.appendChild(S);
    }
  }
  const b = e.root.querySelector('[data-role="frame-total"]');
  b && (b.textContent = `/ ${Math.max(1, e.state.duration_frames)}`);
  const y = e.root.querySelector('[data-role="preview-title"]');
  y && (y.textContent = `${m.name} · ${s("Frame")} ${e.frame}`);
  const g = e.root.querySelector('[data-role="inspector-camera-name"]');
  g && (g.textContent = m.name), Vn(e), Bn(e), Gn(e), gr(e), Zl(e), e.refreshCameraSelectors(), e.refreshKeyEditor(), e.updateEditState(), e.drawCurveEditor(), e.perf && (e.perf.timelineRefreshCount = (e.perf.timelineRefreshCount || 0) + 1), td(e);
}
class Qn {
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
class es {
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
async function yr(e, { route: t, field: a = "file", file: o }) {
  if (!o) throw new TypeError("A file is required");
  const r = new FormData();
  r.append(a, o, o.name);
  const n = await e.fetchApi(t, { method: "POST", body: r });
  if (!n.ok) throw new Error(await n.text());
  return n.json();
}
const od = `
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
`, rd = `
      .majoor-omnicam .menu-section{display:flex;flex-direction:column;gap:5px}
      .majoor-omnicam[data-density="basic"] [data-density-min="animation"],
      .majoor-omnicam[data-density="basic"] [data-density-min="advanced"],
      .majoor-omnicam[data-density="animation"] [data-density-min="advanced"]{display:none !important}
`, nd = `
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
           -- let the ASSETS grid flex to fill it and scroll, no arbitrary cap */
        .majoor-omnicam .oc-left .oc-asset-grid{max-height:none}
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
`, sd = `
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
`, id = sl + sd + od + $c + rd + nd;
function cd() {
  return `
    <div class="oc-header">
      ${il("OmniCam Director")}
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
function ld() {
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
const dd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>', md = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-9 5-9-5V8l9-5 9 5v8z"/><path d="m3.27 6.96 8.73 4.84 8.73-4.84"/><path d="M12 22V12"/></svg>', pd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 20h20L12 2z"/><path d="M12 2v18"/></svg>', fd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>', hd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>', ud = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 8-4 4-8-8 4-4z"/><path d="M7 11L2 16l6 6 5-5"/><path d="M18 19l4 2"/><path d="M21 16l2 2"/></svg>', bd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>', gd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6H4z"/><circle cx="17" cy="7" r="3"/><path d="m6 3 4 7H2z"/></svg>';
function yd() {
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
        <div class="oc-asset-foot">
          <button type="button" class="oc-btn" data-asset-act="asset-add">${s("Add to scene")}</button>
          <span class="oc-asset-status hint" data-role="asset-status"></span>
        </div>
        <input type="file" data-role="asset-import-file" accept=".glb,.fbx" hidden>
      </div>
    </div>`;
}
function vd() {
  return `
    <aside class="oc-left" data-role="scene-panel" aria-label="${s("Scene")}">
      <div class="oc-left-tabs" data-role="left-tabs" role="tablist">
        <button type="button" class="oc-left-tab active" data-asset-view="scene" role="tab">${s("Scene")}</button>
        <button type="button" class="oc-left-tab" data-asset-view="assets" role="tab">${s("Assets")}</button>
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
              ${dd} <span>${s("Sphere")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="cube">
              ${md} <span>${s("Cube")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="pyramid">
              ${pd} <span>${s("Pyramide")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="sun_light">
              ${fd} <span>${s("Sun light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="point_light">
              ${hd} <span>${s("Point light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="spot_light">
              ${ud} <span>${s("Spot light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-act="add-camera">
              ${bd} <span>${s("Camera")}</span>
            </button>
            <div class="oc-add-menu-item oc-has-submenu" tabindex="0">
              ${gd} <span>${s("Assets")}</span>
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
      ${yd()}
    </aside>`;
}
function xd() {
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
function wd() {
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
function kd() {
  const e = Mc.map((t) => `<button data-lens="${t}">${t}mm</button>`).join("");
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
function Sd() {
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
function jd() {
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
function _d() {
  return `
    <div class="viewport-inspector oc-side" data-role="viewport-inspector">
      <div class="oc-inspector-head oc-side-tabs">
        <strong class="oc-inspector-title" data-role="inspector-title">${s("Inspector")}</strong>
        <span class="oc-panel-spacer"></span>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="motion" data-tab="motion" aria-pressed="false">${s("Motion")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="shot" data-tab="display" aria-pressed="false">${s("Shot")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="health" data-tab="health" data-density-min="animation" aria-pressed="false">${s("Health")}</button>
      </div>
      ${xd()}
      ${wd()}
      ${kd()}
      ${Sd()}
      ${jd()}
    </div>`;
}
function Cd() {
  return `
    <div class="oc-health-strip" data-role="solve-health-strip" data-density-min="animation">
      <span class="oc-health-strip-label">${s("Solve Health")}</span>
      <div class="oc-health-cells" data-role="solve-health-cells"
           role="group" aria-label="${s("Per-frame solve health")}"></div>
      <span class="oc-health-strip-readout" data-role="solve-health-readout" aria-live="polite"></span>
    </div>`;
}
function Ed() {
  return `
    <div class="oc-preview camera-view-row" data-role="camera-view-row">
      <div class="oc-preview-head">
        <span data-role="preview-title">${s("Camera")}</span>
        <button class="camera-strip-close" data-act="toggle-camera-view" title="${s("Hide camera previews")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="camera-preview-strip" data-role="camera-previews"></div>
    </div>`;
}
function Ad() {
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
function $d() {
  return `
    <div class="oc-dope">
      <div class="oc-dope-body">
        <div class="oc-dope-labels">${Dn.map((t) => `
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
function Md() {
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
function Td() {
  return `
    <div class="oc-lower">
      ${Ed()}
      <div class="oc-resize-h" data-role="preview-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${s("Drag to resize the camera view — double-click to reset")}" aria-label="${s("Resize the camera view")}"></div>
      <div class="timeline oc-timeline">
        ${Ad()}
        ${Cd()}
        ${$d()}
        <div class="motion-timeline" data-role="motion-timeline" aria-label="${s("Motion track timeline")}"></div>
      </div>
    </div>
    ${Md()}`;
}
function Id() {
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
function Od() {
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
function Pd() {
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
function Ld() {
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
function Fd() {
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
function zd() {
  return `
    <div class="top">
      <button class="icon-button oc-drawer-toggle" data-act="toggle-scene-panel" title="${s("Scene")}" aria-pressed="false"><i class="pi pi-list"></i></button>
      ${Id()}
      ${Od()}
      ${Pd()}
      ${Ld()}
      ${Fd()}
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
function Nd() {
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
function Rd() {
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
function Kd() {
  return `
    <div class="motion-tools" role="toolbar" aria-label="${s("Motion track tools")}">
      <button class="active" data-motion-tool="select" aria-pressed="true" title="${s("Select motion track")}"><i class="pi pi-arrow-up-left"></i></button>
      <button data-motion-tool="track" aria-pressed="false" title="${s("Draw motion track")}"><i class="pi pi-pencil"></i></button>
      <button data-motion-tool="anchor" aria-pressed="false" title="${s("Add static screen anchor")}"><i class="pi pi-map-marker"></i></button>
      <button data-motion-tool="project" aria-pressed="false" title="${s("Project selected object or world point")}"><i class="pi pi-bullseye"></i></button>
      <button data-motion-tool="erase" aria-pressed="false" title="${s("Erase motion track")}"><i class="pi pi-eraser"></i></button>
    </div>`;
}
function Dd() {
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

      ${Rd()}
      ${Kd()}

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

      ${Nd()}

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
function ts() {
  const e = document.createElement("div");
  e.className = "majoor-omnicam", e.innerHTML = `
    <style>${id}</style>
    ${cd()}
    ${zd()}
    <div class="oc-body">
      ${vd()}
      <div class="oc-resize-h oc-left-resize" data-role="left-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${s("Drag to resize the scene panel — double-click to reset")}" aria-label="${s("Resize scene panel")}"></div>
      <div class="oc-stage">${Dd()}</div>
      <div class="oc-resize-h oc-side-resize" data-role="side-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${s("Drag to resize the side panel — double-click to reset")}" aria-label="${s("Resize side panel")}"></div>
      ${_d()}
    </div>
    ${Td()}
    ${ld()}`;
  const t = document.createElement("div");
  return t.className = "context-menu", t.dataset.role = "context-menu", t.setAttribute("role", "menu"), t.hidden = !0, e.appendChild(t), e;
}
const Ot = 1, Vr = 50, D = Object.freeze({
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
}), Bd = Object.freeze(Object.values(D)), ve = Object.freeze({
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
});
Object.freeze(Object.values(ve));
class I extends Error {
  constructor(t, a, o = null, r = null) {
    super(a), this.name = "DirectorApiError", this.code = t, this.operationIndex = o, this.details = r;
  }
}
const qd = 25, Hr = 100;
function et(e, t) {
  const a = e?.offset === void 0 ? 0 : Number(e.offset), o = e?.limit === void 0 ? qd : Number(e.limit);
  if (!Number.isInteger(a) || a < 0)
    throw new I(
      "BAD_QUERY",
      "offset must be a non-negative integer"
    );
  if (!Number.isInteger(o) || o < 1 || o > Hr)
    throw new I(
      "BAD_QUERY",
      `limit must be between 1 and ${Hr}`
    );
  return {
    offset: a,
    limit: o,
    end: Math.min(t, a + o)
  };
}
function zo(e) {
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
function Ud(e) {
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
function De(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Wd(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function we(e, t) {
  return {
    ...t,
    revision: Wd(e)
  };
}
function Vd(e, t) {
  const a = e.state || {};
  switch (t?.type) {
    case ve.SCENE_GET:
      return we(e, {
        version: 1,
        type: t.type,
        scene: De({
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
    case ve.SCENE_SUMMARY: {
      const o = a.objects || [], r = a.sequence?.cuts || a.cuts || [];
      return we(e, {
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
    case ve.CAMERA_GET: {
      const o = t.cameraId || a.active_camera_id, r = (a.cameras || []).find((n) => n.id === o);
      if (!r) throw new I("UNKNOWN_CAMERA", `Unknown camera: ${o}`);
      return we(e, { version: 1, type: t.type, camera: De(r) });
    }
    case ve.CAMERA_LIST: {
      const o = a.cameras || [], { offset: r, limit: n, end: i } = et(t, o.length);
      return we(e, {
        version: 1,
        type: t.type,
        items: o.slice(r, i).map(Ud),
        total: o.length,
        offset: r,
        limit: n
      });
    }
    case ve.TIMELINE_GET:
      return we(e, {
        version: 1,
        type: t.type,
        timeline: De({
          frame: e.frame ?? 0,
          duration_frames: a.duration_frames,
          fps: a.fps,
          playback_range: Array.isArray(a.playback_range) ? a.playback_range : null
        })
      });
    case ve.SELECTION_GET:
      return we(e, {
        version: 1,
        type: t.type,
        selection: {
          entity: e.selectedEntity ?? null,
          objectId: e.selectedObjectId ?? null,
          objectIds: [...e.selectedObjectIds || []],
          keyFrame: e.selectedKeyFrame ?? null
        }
      });
    case ve.HEALTH_GET:
      return we(e, {
        version: 1,
        type: t.type,
        frames: Jn(a.metadata, a.duration_frames)
      });
    case ve.ASSET_LIST: {
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
      return we(e, { version: 1, type: t.type, items: De(r), total: r.length });
    }
    case ve.ASSET_GET: {
      const o = (a.objects || []).find((r) => r.id === t.objectId);
      if (!o) throw new I("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return we(e, {
        version: 1,
        type: t.type,
        asset: De({
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
    case ve.CHARACTER_GET_RIG: {
      const o = (a.objects || []).find((n) => n.id === t.objectId);
      if (!o) throw new I("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const r = o.character || null;
      return we(e, {
        version: 1,
        type: t.type,
        rig: De({
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
    case ve.CHARACTER_GET_POSE: {
      const o = (a.objects || []).find((n) => n.id === t.objectId);
      if (!o) throw new I("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const r = o.character?.pose || {};
      return we(e, {
        version: 1,
        type: t.type,
        pose: De({
          objectId: o.id,
          preset_id: r.preset_id || "neutral",
          root_offset: Array.isArray(r.root_offset) ? r.root_offset : [0, 0, 0],
          joints: r.joints || {},
          has_motion: !!o.character?.motion
        })
      });
    }
    case ve.OBJECT_LIST: {
      const o = a.objects || [], { offset: r, limit: n, end: i } = et(t, o.length);
      return we(e, {
        version: 1,
        type: t.type,
        items: o.slice(r, i).map(zo),
        total: o.length,
        offset: r,
        limit: n
      });
    }
    case ve.OBJECT_GET: {
      const o = (a.objects || []).find((r) => r.id === t.objectId);
      if (!o) throw new I("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return we(e, {
        version: 1,
        type: t.type,
        object: De({
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
    case ve.OBJECT_SEARCH: {
      const o = String(t.text || "").trim().toLowerCase(), r = Array.isArray(t.tags) ? t.tags.map((f) => String(f).toLowerCase()) : [], n = t.asset_kind !== void 0 ? t.asset_kind : null, i = t.type_ !== void 0 ? t.type_ : t.objectType !== void 0 ? t.objectType : null, c = typeof t.enabled == "boolean" ? t.enabled : null, l = (f) => {
        if (o && ![f.id, f.name || "", ...Array.isArray(f.tags) ? f.tags : []].map((b) => String(b).toLowerCase()).some((b) => b.includes(o)))
          return !1;
        if (r.length) {
          const u = (Array.isArray(f.tags) ? f.tags : []).map((b) => String(b).toLowerCase());
          if (!r.every((b) => u.includes(b))) return !1;
        }
        return !(n !== null && f.asset_kind !== n || i !== null && f.type !== i || c !== null && f.enabled !== !1 !== c);
      }, p = (a.objects || []).filter(l), { offset: m, limit: h, end: d } = et(t, p.length);
      return we(e, {
        version: 1,
        type: t.type,
        items: p.slice(m, d).map(zo),
        total: p.length,
        offset: m,
        limit: h
      });
    }
    case ve.CHARACTER_LIST: {
      const o = (a.objects || []).filter((c) => c.asset_kind === "character"), { offset: r, limit: n, end: i } = et(t, o.length);
      return we(e, {
        version: 1,
        type: t.type,
        items: o.slice(r, i).map((c) => ({
          ...zo(c),
          has_motion: !!c.character?.motion,
          pose_preset: c.character?.pose?.preset_id || null
        })),
        total: o.length,
        offset: r,
        limit: n
      });
    }
    case ve.SHOT_LIST: {
      const o = a.sequence?.cuts || a.cuts || [], r = Math.max(0, (a.duration_frames || 1) - 1), n = o.map((p, m) => ({
        index: m,
        start: p.start,
        end: m + 1 < o.length ? o[m + 1].start - 1 : r,
        camera_id: p.camera_id
      })), { offset: i, limit: c, end: l } = et(t, n.length);
      return we(e, {
        version: 1,
        type: t.type,
        items: n.slice(i, l),
        total: n.length,
        offset: i,
        limit: c
      });
    }
    case ve.KEYFRAME_LIST: {
      const o = t.cameraId || a.active_camera_id, r = (a.cameras || []).find((p) => p.id === o);
      if (!r) throw new I("UNKNOWN_CAMERA", `Unknown camera: ${o}`);
      const n = r.keyframes || [], { offset: i, limit: c, end: l } = et(t, n.length);
      return we(e, {
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
      throw new I("UNKNOWN_QUERY", `Unsupported query: ${t?.type}`);
  }
}
const as = /* @__PURE__ */ new Set([
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
function Eo(e, t, a = "") {
  const o = String(a || "").trim().replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120);
  if (o) {
    if (e.has(o))
      throw new I("DUPLICATE_ID", `${o} already exists`);
    return o;
  }
  let r = 1, n = `${t}_${r}`;
  for (; e.has(n); )
    r += 1, n = `${t}_${r}`;
  return n;
}
function Hd(e) {
  const t = e === "ground", a = e === "human", o = e === "card", r = e === "sun_light", n = e === "point_light", i = e === "spot_light";
  let c;
  t ? c = [12, 0.1, 12] : a ? c = [0.7, 1.8, 0.4] : o ? c = [2, 3] : c = [1.5, 1.5, 1.5];
  let l = [0, 0, 0], p = [0, 0, 0], m = "#8c929b", h, d, f, u;
  return r ? (l = [5, 8.5, 4], p = [-55, 35, 0], m = "#fff6ec", h = 2.2, d = !0) : n ? (l = [0, 3, 0], m = "#ffffff", h = 2, d = !1) : i && (l = [0, 4, 0], p = [-60, 0, 0], m = "#ffffff", h = 3, f = 45, u = 0.25, d = !0), {
    position: l,
    rotation: p,
    size: c,
    color: m,
    material_mode: t ? "checker" : "textured",
    ...h !== void 0 ? { intensity: h } : {},
    ...d !== void 0 ? { cast_shadow: d } : {},
    ...f !== void 0 ? { cone_angle: f } : {},
    ...u !== void 0 ? { penumbra: u } : {}
  };
}
function Gd(e, t) {
  e.cameras ||= [];
  const a = new Set(e.cameras.map((i) => i.id)), o = Eo(a, "camera", t.id), r = { ...cr(), ...t.camera || {} }, n = {
    id: o,
    name: t.name || o,
    color: "#4aa3ef",
    locked: !1,
    muted: !1,
    solo: !1,
    camera: r,
    keyframes: [{ frame: 0, camera: he(r), interpolation: t.interpolation || "ease" }]
  };
  return e.cameras.push(n), { cameraId: o };
}
function Yd(e, t) {
  const a = (e.cameras || []).find((i) => i.id === t.cameraId);
  if (!a) throw new I("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const o = new Set(e.cameras.map((i) => i.id)), r = Eo(o, "camera", t.id), n = JSON.parse(JSON.stringify(a));
  return n.id = r, n.name = t.name || `${a.name || a.id} copy`, e.cameras.push(n), { cameraId: r };
}
function Xd(e, t) {
  const a = e.cameras || [], o = a.findIndex((n) => n.id === t.cameraId);
  if (o === -1) throw new I("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  if (a.length <= 1) throw new I("LAST_CAMERA", "cannot delete the only camera");
  if (a[o].locked) throw new I("ENTITY_LOCKED", `${t.cameraId} is locked`);
  if ((e.sequence?.cuts || []).some((n) => n.camera_id === t.cameraId))
    throw new I("CAMERA_IN_USE", `${t.cameraId} is referenced by a cut`);
  return a.splice(o, 1), e.active_camera_id === t.cameraId && (e.active_camera_id = a[0].id), e.playblast_camera_id === t.cameraId && (e.playblast_camera_id = a[0].id), { cameraId: t.cameraId };
}
function Zd(e, t) {
  const a = (e.cameras || []).find((o) => o.id === t.cameraId);
  if (!a) throw new I("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return a.name = String(t.name || "").trim().slice(0, 80) || a.name, { cameraId: a.id };
}
function Jd(e, t) {
  const a = "__sequence__";
  if (t.cameraId === a) {
    if (!(e.sequence?.cuts || []).length)
      throw new I("NO_CUTS", "the sequence has no cuts to play back");
    return e.playblast_camera_id = a, { cameraId: a };
  }
  const o = (e.cameras || []).find((r) => r.id === t.cameraId);
  if (!o) throw new I("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return e.playblast_camera_id = o.id, { cameraId: o.id };
}
function Qd(e, t) {
  if (!as.has(t.objectType))
    throw new I("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${t.objectType}`);
  e.objects ||= [];
  const a = new Set(e.objects.map((i) => i.id)), o = Eo(a, t.objectType, t.id), r = Hd(t.objectType), n = {
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
function em(e, t) {
  const a = (e.objects || []).find((l) => l.id === t.objectId);
  if (!a) throw new I("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const o = new Set(e.objects.map((l) => l.id)), r = Eo(o, a.type || "object", t.id), n = Array.isArray(t.offset) ? t.offset : [0.35, 0, 0.35], i = JSON.parse(JSON.stringify(a));
  i.id = r, i.name = t.name || `${a.name || a.id} copy`, i.locked = !1;
  const c = Array.isArray(a.position) ? a.position : [0, 0, 0];
  return i.position = [c[0] + n[0], c[1] + n[1], c[2] + n[2]], e.objects.push(i), { objectId: r, resourceRefresh: !!a.asset_id };
}
function tm(e, t) {
  const a = e.objects || [], o = a.findIndex((n) => n.id === t.objectId);
  if (o === -1) throw new I("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const r = a[o];
  if (r.id === "subject") throw new I("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (r.locked) throw new I("ENTITY_LOCKED", `${t.objectId} is locked`);
  for (const n of a)
    n.parent_id === t.objectId && (n.parent_id = null);
  return a.splice(o, 1), { objectId: t.objectId, resourceRefresh: !!r.asset_id };
}
function am(e, t) {
  const a = (e.objects || []).find((o) => o.id === t.objectId);
  if (!a) throw new I("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  return a.name = String(t.name || "").trim().slice(0, 80) || a.name, { objectId: a.id };
}
function om(e, t) {
  const a = (e.objects || []).find((c) => c.id === t.objectId);
  if (!a) throw new I("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  if (t.parentId === null || t.parentId === void 0)
    return a.parent_id = null, { objectId: a.id };
  if (t.parentId === t.objectId)
    throw new I("INVALID_PARENT", "an object cannot be its own parent");
  const o = (e.objects || []).find((c) => c.id === t.parentId);
  if (!o) throw new I("UNKNOWN_OBJECT", `${t.parentId} does not exist`);
  const r = new Map(e.objects.map((c) => [c.id, c]));
  let n = o;
  const i = /* @__PURE__ */ new Set();
  for (; n; ) {
    if (n.id === t.objectId)
      throw new I("INVALID_PARENT", "assigning this parent would create a cycle");
    if (i.has(n.id)) break;
    i.add(n.id), n = n.parent_id ? r.get(n.parent_id) : null;
  }
  return a.parent_id = t.parentId, { objectId: a.id };
}
function rm(e, t) {
  e.sequence ||= ir();
  const a = e.sequence.cuts ||= [], o = Math.max(0, (e.duration_frames || 1) - 1);
  if (!Number.isInteger(t.start) || t.start < 0 || t.start > o)
    throw new I("FRAME_OUT_OF_RANGE", `cut start must be within 0..${o}`);
  if (!(e.cameras || []).find((i) => i.id === t.cameraId)) throw new I("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const n = a.find((i) => i.start === t.start);
  return n ? n.camera_id = t.cameraId : a.push({ start: t.start, camera_id: t.cameraId }), a.sort((i, c) => i.start - c.start), e.sequence.enabled = !0, { start: t.start, cameraId: t.cameraId };
}
function nm(e, t) {
  e.sequence ||= ir();
  const a = e.sequence.cuts || [], o = a.findIndex((r) => r.start === t.start);
  if (o === -1) throw new I("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  return a.splice(o, 1), a.length && (a[0].start = 0), e.sequence.enabled = a.length > 0, { start: t.start };
}
function sm(e, t) {
  e.sequence ||= ir();
  const o = (e.sequence.cuts || []).find((n) => n.start === t.start);
  if (!o) throw new I("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  if (!(e.cameras || []).find((n) => n.id === t.cameraId)) throw new I("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return o.camera_id = t.cameraId, { start: t.start, cameraId: t.cameraId };
}
const nt = (e) => typeof e == "number" && Number.isFinite(e);
function Ee(e, t, a) {
  if (!Array.isArray(e) || e.length !== 3 || !e.every(nt))
    throw new I("BAD_VECTOR", `${t} must be [x,y,z] of finite numbers`, a);
}
function Oe(e, t, a) {
  if (!Number.isInteger(e) || e < 0)
    throw new I("BAD_FRAME", `${t} must be a non-negative integer frame`, a);
}
function ee(e, t, a) {
  if (typeof e != "string" || e.length === 0)
    throw new I("BAD_ID", `${t} must be a non-empty string`, a);
}
function im(e, t) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new I("BAD_OPERATION", "operation must be an object", t);
  const { type: a } = e;
  if (!Bd.includes(a))
    throw new I("UNKNOWN_OPERATION", `Unknown operation type: ${a}`, t);
  switch (a) {
    case D.ASSET_INSTANTIATE: {
      const o = e.asset;
      if (!o || typeof o != "object" || Array.isArray(o))
        throw new I("BAD_VALUE", "asset.instantiate needs a resolved asset object", t);
      if (ee(o.id, "asset.id", t), ee(o.kind, "asset.kind", t), String(o.id).length > 120 || String(o.kind).length > 32)
        throw new I("BAD_VALUE", "asset.id / asset.kind exceed their bounds", t);
      if (o.tags !== void 0 && (!Array.isArray(o.tags) || o.tags.length > 32))
        throw new I("BAD_VALUE", "asset.tags must be a list of at most 32", t);
      if (o.animations !== void 0 && (!Array.isArray(o.animations) || o.animations.length > 256))
        throw new I("BAD_VALUE", "asset.animations must be a list of at most 256", t);
      if (o.rig !== void 0 && o.rig !== null) {
        if (typeof o.rig != "object" || Array.isArray(o.rig))
          throw new I("BAD_VALUE", "asset.rig must be an object", t);
        if (o.rig.bone_map && Object.keys(o.rig.bone_map).length > 128)
          throw new I("BAD_VALUE", "asset.rig.bone_map exceeds 128 entries", t);
      }
      e.point !== void 0 && Ee(e.point, "point", t), e.id !== void 0 && ee(e.id, "id", t);
      break;
    }
    case D.CAMERA_SET_ACTIVE:
      ee(e.cameraId, "cameraId", t);
      break;
    case D.CAMERA_SET_LOCKED:
      if (ee(e.cameraId, "cameraId", t), typeof e.value != "boolean")
        throw new I("BAD_VALUE", "camera.set_locked needs a boolean value", t);
      break;
    case D.CAMERA_CREATE:
      if (e.id !== void 0 && ee(e.id, "id", t), e.name !== void 0 && ee(e.name, "name", t), e.camera !== void 0 && (typeof e.camera != "object" || Array.isArray(e.camera)))
        throw new I("BAD_VALUE", "camera.create camera must be an object", t);
      if (e.interpolation !== void 0 && !fo.includes(e.interpolation))
        throw new I("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case D.CAMERA_DUPLICATE:
      ee(e.cameraId, "cameraId", t), e.id !== void 0 && ee(e.id, "id", t), e.name !== void 0 && ee(e.name, "name", t);
      break;
    case D.CAMERA_DELETE:
    case D.CAMERA_SET_PLAYBLAST:
      ee(e.cameraId, "cameraId", t);
      break;
    case D.CAMERA_RENAME:
      ee(e.cameraId, "cameraId", t), ee(e.name, "name", t);
      break;
    case D.OBJECT_CREATE:
      if (ee(e.objectType, "objectType", t), !as.has(e.objectType))
        throw new I("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`, t);
      if (e.asset !== void 0 || e.url !== void 0 || e.path !== void 0)
        throw new I("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", t);
      e.id !== void 0 && ee(e.id, "id", t), e.name !== void 0 && ee(e.name, "name", t), e.position !== void 0 && Ee(e.position, "position", t), e.rotation !== void 0 && Ee(e.rotation, "rotation", t);
      break;
    case D.OBJECT_DUPLICATE:
      ee(e.objectId, "objectId", t), e.id !== void 0 && ee(e.id, "id", t), e.name !== void 0 && ee(e.name, "name", t), e.offset !== void 0 && Ee(e.offset, "offset", t);
      break;
    case D.OBJECT_DELETE:
      ee(e.objectId, "objectId", t);
      break;
    case D.OBJECT_RENAME:
      ee(e.objectId, "objectId", t), ee(e.name, "name", t);
      break;
    case D.OBJECT_SET_PARENT:
      ee(e.objectId, "objectId", t), e.parentId !== null && e.parentId !== void 0 && ee(e.parentId, "parentId", t);
      break;
    case D.CAMERA_TRANSFORM:
      if (e.cameraId !== void 0 && ee(e.cameraId, "cameraId", t), e.position !== void 0 && Ee(e.position, "position", t), e.target !== void 0 && Ee(e.target, "target", t), e.frame !== void 0 && Oe(e.frame, "frame", t), e.position === void 0 && e.target === void 0)
        throw new I("EMPTY_OPERATION", "camera.transform needs position and/or target", t);
      break;
    case D.CAMERA_LOOK_AT:
      if (e.cameraId !== void 0 && ee(e.cameraId, "cameraId", t), e.point !== void 0 && Ee(e.point, "point", t), e.objectId !== void 0 && e.objectId !== null && ee(e.objectId, "objectId", t), e.point === void 0 && e.objectId === void 0)
        throw new I("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", t);
      break;
    case D.OBJECT_TRANSFORM:
      if (ee(e.objectId, "objectId", t), e.position !== void 0 && Ee(e.position, "position", t), e.rotation !== void 0 && Ee(e.rotation, "rotation", t), e.scale !== void 0 && Ee(e.scale, "scale", t), e.position === void 0 && e.rotation === void 0 && e.scale === void 0)
        throw new I("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", t);
      break;
    case D.OBJECT_SET_ENABLED:
    case D.OBJECT_SET_LOCKED:
      if (ee(e.objectId, "objectId", t), typeof e.value != "boolean")
        throw new I("BAD_VALUE", `${a} needs a boolean value`, t);
      break;
    case D.OBJECT_SET_TAGS:
      if (ee(e.objectId, "objectId", t), !Array.isArray(e.tags) || e.tags.some((o) => typeof o != "string"))
        throw new I("BAD_VALUE", "object.set_tags needs a string array", t);
      if (e.tags.length > 64)
        throw new I("BAD_VALUE", "object.set_tags: too many tags", t);
      break;
    case D.OBJECT_SET_ANNOTATION:
      if (ee(e.objectId, "objectId", t), e.annotation !== null && (typeof e.annotation != "object" || Array.isArray(e.annotation)))
        throw new I("BAD_VALUE", "object.set_annotation needs an object or null", t);
      break;
    case D.CHARACTER_SET_POSE:
      if (ee(e.objectId, "objectId", t), e.pose !== null && (typeof e.pose != "object" || Array.isArray(e.pose)))
        throw new I("BAD_VALUE", "character.set_pose needs a pose object or null", t);
      break;
    case D.CHARACTER_SET_JOINT_ROTATION:
      if (ee(e.objectId, "objectId", t), ee(e.joint, "joint", t), !Array.isArray(e.rotation) || e.rotation.length !== 4 || !e.rotation.every(nt))
        throw new I("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", t);
      break;
    case D.CHARACTER_SET_MOTION: {
      ee(e.objectId, "objectId", t);
      const o = e.motion;
      if (!o || typeof o != "object" || Array.isArray(o))
        throw new I("BAD_VALUE", "character.set_motion needs a motion object", t);
      ee(o.clip_id, "motion.clip_id", t);
      for (const r of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (o[r] !== void 0 && !nt(o[r]))
          throw new I("BAD_VALUE", `motion.${r} must be a finite number`, t);
      if (nt(o.start_frame) && nt(o.end_frame) && o.end_frame > 0 && o.end_frame <= o.start_frame)
        throw new I("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", t);
      break;
    }
    case D.CHARACTER_CLEAR_MOTION:
      ee(e.objectId, "objectId", t);
      break;
    case D.KEYFRAME_UPSERT:
      if (e.cameraId !== void 0 && ee(e.cameraId, "cameraId", t), Oe(e.frame, "frame", t), e.interpolation !== void 0 && !fo.includes(e.interpolation))
        throw new I("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      if (e.camera !== void 0) {
        if (!e.camera || typeof e.camera != "object")
          throw new I("BAD_VALUE", "keyframe.upsert camera must be an object", t);
        e.camera.position !== void 0 && Ee(e.camera.position, "camera.position", t), e.camera.target !== void 0 && Ee(e.camera.target, "camera.target", t);
        for (const o of ["fov", "roll", "zoom", "near", "far"])
          if (e.camera[o] !== void 0 && !nt(e.camera[o]))
            throw new I("BAD_VALUE", `camera.${o} must be finite`, t);
      }
      break;
    case D.KEYFRAME_REMOVE:
      e.cameraId !== void 0 && ee(e.cameraId, "cameraId", t), Oe(e.frame, "frame", t);
      break;
    case D.KEYFRAME_SET_INTERPOLATION:
      if (e.cameraId !== void 0 && ee(e.cameraId, "cameraId", t), Oe(e.frame, "frame", t), !fo.includes(e.interpolation))
        throw new I("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case D.TIMELINE_SET_RANGE:
      if (Oe(e.start, "start", t), Oe(e.end, "end", t), e.end < e.start)
        throw new I("BAD_RANGE", "range end is before start", t);
      break;
    case D.TIMELINE_SET_DURATION:
      if (!Number.isInteger(e.frames) || e.frames < 1)
        throw new I("BAD_VALUE", "timeline.set_duration needs frames >= 1", t);
      break;
    case D.CUT_UPSERT:
      Oe(e.start, "start", t), ee(e.cameraId, "cameraId", t);
      break;
    case D.CUT_REMOVE:
      Oe(e.start, "start", t);
      break;
    case D.CUT_SET_CAMERA:
      Oe(e.start, "start", t), ee(e.cameraId, "cameraId", t);
      break;
    default:
      throw new I("UNKNOWN_OPERATION", `Unknown operation type: ${a}`, t);
  }
}
function cm(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new I("BAD_TRANSACTION", "transaction must be an object");
  if (t.version !== Ot)
    throw new I("UNSUPPORTED_VERSION", `Unsupported API version: ${t.version}`);
  if (typeof t.id != "string" || t.id.length === 0)
    throw new I("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  if ((e._directorApiTxIds ||= /* @__PURE__ */ new Set()).has(t.id))
    throw new I("DUPLICATE_TRANSACTION_ID", `transaction id already used: ${t.id}`);
  if (typeof t.description != "string" || t.description.trim().length === 0)
    throw new I("EMPTY_DESCRIPTION", "transaction description must not be empty");
  if (t.baseRevision !== void 0 && (!Number.isInteger(t.baseRevision) || t.baseRevision < 0))
    throw new I(
      "BAD_REVISION",
      "baseRevision must be a non-negative integer"
    );
  if (!Array.isArray(t.operations))
    throw new I("BAD_OPERATIONS", "operations must be an array");
  if (t.operations.length === 0)
    throw new I("NO_OPERATIONS", "transaction has no operations");
  if (t.operations.length > Vr)
    throw new I(
      "TOO_MANY_OPERATIONS",
      `transaction has ${t.operations.length} operations (max ${Vr})`
    );
  return t.operations.forEach((o, r) => im(o, r)), {
    version: Ot,
    id: t.id,
    baseRevision: t.baseRevision,
    description: t.description.trim(),
    operations: t.operations,
    validateOnly: t.validateOnly === !0
  };
}
const _ = Object.freeze({
  viewport: 1,
  previews: 2,
  timeline: 4,
  inspector: 8,
  outliner: 16,
  motion: 32,
  status: 64,
  all: 127
});
function lm(e = 0, t = 0) {
  return (e | t) >>> 0;
}
function tt(e, t) {
  return (e & t) !== 0;
}
const dm = "omnicam/library", mm = "majoor_omnicam/blockout_library", pm = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null"
});
function fm(e, t) {
  if (!Array.isArray(e) || e.length < 3) return [...t];
  const a = e.slice(0, 3).map((o) => Number(o));
  return a.every((o) => Number.isFinite(o)) ? a : [...t];
}
function os(e) {
  return e.file ? `${e.source === "legacy" ? mm : dm}/${e.file} [input]` : "";
}
function Gr(e, t, a) {
  const o = e || "asset";
  let r = `${o}_${a}`, n = 2;
  for (; t && t.has(r); ) r = `${o}_${a}_${n++}`;
  return r;
}
function hm(e) {
  return {
    rig_profile: !!(e.rig && Object.keys(e.rig.bone_map || {}).length) ? e.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null
  };
}
function um(e, t = {}) {
  if (!e || typeof e != "object" || !e.id)
    throw new Error("compileInstance: an AssetDefinition is required");
  const a = fm(t.point, [0, 0, 0]), o = String(t.idSeed || Date.now().toString(36)), r = String(e.kind || "prop"), n = r === "character", i = pm[e.id];
  if (r === "helper" && !e.file && i && i !== "null")
    return {
      id: Gr(i, t.existingIds, o),
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
    id: Gr(r === "character" ? "character" : r, t.existingIds, o),
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
    asset: os(e),
    asset_id: e.id,
    asset_kind: r,
    tags: [...e.tags || []]
  };
  return n && (c.character = hm(e)), c;
}
function bm({ groundHit: e, orbitTarget: t } = {}) {
  return Array.isArray(e) && e.length >= 3 && e.every((a) => Number.isFinite(a)) ? e.slice(0, 3).map(Number) : Array.isArray(t) && t.length >= 3 && t.every((a) => Number.isFinite(a)) ? [Number(t[0]), 0, Number(t[2])] : [0, 0, 0];
}
function Yo(e, t) {
  const a = t || e.active_camera_id, o = (e.cameras || []).find((r) => r.id === a);
  if (!o) throw new I("UNKNOWN_CAMERA", `${a} does not exist`);
  return o;
}
function Xo(e, t) {
  const a = (e.objects || []).find((o) => o.id === t);
  if (!a) throw new I("UNKNOWN_OBJECT", `${t} does not exist`);
  return a;
}
function oo(e, t) {
  const a = $t(e, t);
  if (a.asset_kind !== "character")
    throw new I("NOT_A_CHARACTER", `${t} is not a character`);
  return a;
}
function Et(e, t) {
  const a = Yo(e, t);
  if (a.locked)
    throw new I("ENTITY_LOCKED", `${a.id} is locked`);
  return a;
}
function $t(e, t) {
  const a = Xo(e, t);
  if (a.locked)
    throw new I("ENTITY_LOCKED", `${a.id} is locked`);
  return a;
}
function Yr(e) {
  return (!e.camera || typeof e.camera != "object") && (e.camera = {}), e.camera;
}
function ro(e, t) {
  return (e.keyframes || []).find((a) => a.frame === t) || null;
}
const gm = {
  [D.ASSET_INSTANTIATE](e, t) {
    const a = new Set((e.objects || []).map((r) => r.id));
    let o;
    try {
      o = um(t.asset, { point: t.point, idSeed: t.id, existingIds: a });
    } catch (r) {
      throw new I("BAD_ASSET", `asset.instantiate could not compile: ${r.message}`);
    }
    return (e.objects ||= []).push(o), {
      dirtyMask: _.viewport | _.previews | _.outliner | _.inspector,
      outcome: { objectId: o.id, assetId: o.asset_id || null }
    };
  },
  [D.CAMERA_SET_ACTIVE](e, t) {
    return Yo(e, t.cameraId), e.active_camera_id = t.cameraId, { dirtyMask: _.viewport | _.previews | _.inspector | _.outliner | _.timeline };
  },
  [D.CAMERA_SET_LOCKED](e, t) {
    return Yo(e, t.cameraId).locked = t.value, { dirtyMask: _.outliner | _.inspector | _.viewport };
  },
  [D.CAMERA_CREATE](e, t) {
    const a = Gd(e, t);
    return { dirtyMask: _.outliner | _.inspector | _.viewport | _.previews | _.timeline, outcome: a };
  },
  [D.CAMERA_DUPLICATE](e, t) {
    const a = Yd(e, t);
    return { dirtyMask: _.outliner | _.inspector | _.viewport | _.previews | _.timeline, outcome: a };
  },
  [D.CAMERA_DELETE](e, t) {
    const a = Xd(e, t);
    return { dirtyMask: _.outliner | _.inspector | _.viewport | _.previews | _.timeline, outcome: a };
  },
  [D.CAMERA_RENAME](e, t) {
    const a = Zd(e, t);
    return { dirtyMask: _.outliner | _.inspector, outcome: a };
  },
  [D.CAMERA_SET_PLAYBLAST](e, t) {
    const a = Jd(e, t);
    return { dirtyMask: _.outliner | _.inspector | _.status, outcome: a };
  },
  [D.CAMERA_TRANSFORM](e, t) {
    const a = Et(e, t.cameraId), o = Yr(a);
    if (t.position && (o.position = [...t.position]), t.target && (o.target = [...t.target]), Number.isInteger(t.frame)) {
      const r = ro(a, t.frame);
      if (!r) throw new I("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
      r.camera = { ...r.camera }, t.position && (r.camera.position = [...t.position]), t.target && (r.camera.target = [...t.target]);
    }
    return { dirtyMask: _.viewport | _.previews | _.inspector | _.timeline };
  },
  [D.CAMERA_LOOK_AT](e, t) {
    const a = Et(e, t.cameraId);
    if (t.objectId !== void 0 && (t.objectId === null || t.objectId === "" ? (a.target_object_id = null, a.id === e.active_camera_id && (e.target_object_id = null)) : (Xo(e, t.objectId), a.target_object_id = t.objectId, a.id === e.active_camera_id && (e.target_object_id = t.objectId))), t.point) {
      const o = Yr(a);
      o.target = [...t.point];
      for (const r of a.keyframes || [])
        r.camera = { ...r.camera, target: [...t.point] };
    }
    return { dirtyMask: _.viewport | _.previews | _.inspector | _.timeline };
  },
  [D.OBJECT_CREATE](e, t) {
    const a = Qd(e, t);
    return { dirtyMask: _.viewport | _.previews | _.outliner | _.inspector, outcome: a };
  },
  [D.OBJECT_DUPLICATE](e, t) {
    const a = em(e, t);
    return { dirtyMask: _.viewport | _.previews | _.outliner | _.inspector, outcome: a };
  },
  [D.OBJECT_DELETE](e, t) {
    const a = tm(e, t);
    return { dirtyMask: _.viewport | _.previews | _.outliner | _.inspector, outcome: a };
  },
  [D.OBJECT_RENAME](e, t) {
    const a = am(e, t);
    return { dirtyMask: _.outliner | _.inspector, outcome: a };
  },
  [D.OBJECT_SET_PARENT](e, t) {
    const a = om(e, t);
    return { dirtyMask: _.viewport | _.outliner | _.inspector, outcome: a };
  },
  [D.OBJECT_TRANSFORM](e, t) {
    const a = $t(e, t.objectId);
    return t.position && (a.position = [...t.position]), t.rotation && (a.rotation = [...t.rotation]), t.scale && (a.size = [...t.scale]), { dirtyMask: _.viewport | _.previews | _.inspector };
  },
  [D.OBJECT_SET_ENABLED](e, t) {
    return $t(e, t.objectId).enabled = t.value, { dirtyMask: _.viewport | _.previews | _.outliner | _.inspector };
  },
  [D.OBJECT_SET_LOCKED](e, t) {
    return Xo(e, t.objectId).locked = t.value, { dirtyMask: _.outliner | _.inspector };
  },
  [D.OBJECT_SET_TAGS](e, t) {
    const a = $t(e, t.objectId), o = Gs(t.tags), r = o.length !== t.tags.length ? "some tags were dropped or normalised" : void 0;
    return o.length ? a.tags = o : delete a.tags, { dirtyMask: _.outliner | _.inspector | _.viewport, warning: r };
  },
  [D.OBJECT_SET_ANNOTATION](e, t) {
    const a = $t(e, t.objectId), o = t.annotation === null ? null : Cn(t.annotation);
    if (t.annotation && !o)
      throw new I("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    return o ? a.annotation = o : delete a.annotation, { dirtyMask: _.viewport | _.outliner | _.inspector };
  },
  [D.CHARACTER_SET_POSE](e, t) {
    const a = oo(e, t.objectId);
    if (a.character?.motion)
      throw new I("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    return a.character = {
      ...a.character || {},
      pose: t.pose === null ? go(null) : go(t.pose)
    }, { dirtyMask: _.viewport | _.previews | _.inspector };
  },
  [D.CHARACTER_SET_JOINT_ROTATION](e, t) {
    const a = oo(e, t.objectId);
    if (a.character?.motion)
      throw new I("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    if (!Vs(t.rotation))
      throw new I("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    return a.character = {
      ...a.character || {},
      pose: Hs(a.character?.pose, t.joint, t.rotation)
    }, { dirtyMask: _.viewport | _.previews | _.inspector };
  },
  [D.CHARACTER_SET_MOTION](e, t) {
    const a = oo(e, t.objectId), o = lr(t.motion);
    if (!o) throw new I("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    const r = a.character?.pose || {};
    return a.character = {
      ...a.character || {},
      pose: { preset_id: r.preset_id || "neutral", root_offset: r.root_offset || [0, 0, 0], joints: {} },
      motion: o
    }, { dirtyMask: _.viewport | _.previews | _.timeline | _.inspector };
  },
  [D.CHARACTER_CLEAR_MOTION](e, t) {
    const a = oo(e, t.objectId);
    return a.character ? (a.character = { ...a.character, motion: null }, { dirtyMask: _.viewport | _.previews | _.timeline | _.inspector }) : { dirtyMask: 0 };
  },
  [D.KEYFRAME_UPSERT](e, t) {
    const a = Et(e, t.cameraId);
    if (t.frame >= (e.duration_frames || 0))
      throw new I("FRAME_OUT_OF_RANGE", `frame ${t.frame} is past the timeline`);
    a.keyframes ||= [];
    let o = ro(a, t.frame);
    if (!o) {
      const r = ro(a, 0)?.camera || a.camera || {};
      o = { frame: t.frame, camera: JSON.parse(JSON.stringify(r)), interpolation: "ease" }, a.keyframes.push(o), a.keyframes.sort((n, i) => n.frame - i.frame);
    }
    return t.camera && (o.camera = { ...o.camera, ...JSON.parse(JSON.stringify(t.camera)) }), t.interpolation && (o.interpolation = t.interpolation), { dirtyMask: _.viewport | _.previews | _.timeline | _.inspector };
  },
  [D.KEYFRAME_REMOVE](e, t) {
    const a = Et(e, t.cameraId), o = (a.keyframes || []).length;
    if (a.keyframes = (a.keyframes || []).filter((n) => n.frame !== t.frame), a.keyframes.length === o)
      throw new I("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    const r = a.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: _.viewport | _.previews | _.timeline | _.inspector, warning: r };
  },
  [D.KEYFRAME_SET_INTERPOLATION](e, t) {
    const a = Et(e, t.cameraId), o = ro(a, t.frame);
    if (!o) throw new I("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    if (!fo.includes(t.interpolation))
      throw new I("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`);
    return o.interpolation = t.interpolation, { dirtyMask: _.timeline | _.viewport | _.previews };
  },
  [D.TIMELINE_SET_RANGE](e, t) {
    const a = Math.max(0, (e.duration_frames || 1) - 1);
    if (t.start > a || t.end > a)
      throw new I("FRAME_OUT_OF_RANGE", `range must stay within 0..${a}`);
    return e.playback_range = [t.start, t.end], { dirtyMask: _.timeline | _.status };
  },
  [D.TIMELINE_SET_DURATION](e, t) {
    if (e.duration_frames = t.frames, Array.isArray(e.playback_range)) {
      const a = t.frames - 1;
      e.playback_range = [
        Math.min(e.playback_range[0], a),
        Math.min(e.playback_range[1], a)
      ];
    }
    return { dirtyMask: _.timeline | _.viewport | _.previews | _.status };
  },
  [D.CUT_UPSERT](e, t) {
    const a = rm(e, t);
    return { dirtyMask: _.timeline | _.viewport | _.previews | _.status, outcome: a };
  },
  [D.CUT_REMOVE](e, t) {
    const a = nm(e, t);
    return { dirtyMask: _.timeline | _.viewport | _.previews | _.status, outcome: a };
  },
  [D.CUT_SET_CAMERA](e, t) {
    const a = sm(e, t);
    return { dirtyMask: _.timeline | _.viewport | _.previews | _.status, outcome: a };
  }
};
function ym({ state: e, operation: t }) {
  const a = gm[t.type];
  if (!a) throw new I("UNKNOWN_OPERATION", `Unknown operation type: ${t.type}`);
  return a(e, t) || { dirtyMask: 0 };
}
function vm(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Zo(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function No(e, t, a) {
  return {
    ok: !1,
    version: Ot,
    revision: Zo(e),
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
function xm(e) {
  const t = (e.state.cameras || []).find(
    (a) => a.id === e.state.active_camera_id
  ) || e.state.cameras?.[0] || null;
  return t ? (e.state.keyframes = t.keyframes, e.state.camera = he(t.camera), e.camera = he(t.camera), t) : null;
}
function wm(e, t) {
  t && (e.camera = Ce(
    t,
    e.frame ?? 0,
    e.state.objects || []
  ));
}
function km(e, t, a) {
  if (typeof e.requestUiUpdate == "function") {
    e.requestUiUpdate(t, a);
    return;
  }
  e.camera = e.sampleCamera?.(e.state, e.frame) ?? e.camera, e.refreshObjects?.(), e.refreshKeys?.(), e.refreshInspector?.(), e.render?.();
}
function Sm(e, t) {
  let a;
  try {
    a = cm(e, t);
  } catch (p) {
    if (p instanceof I) return No(e, t?.id, p);
    throw p;
  }
  const o = Zo(e);
  if (a.baseRevision !== void 0 && a.baseRevision !== o)
    return No(
      e,
      a.id,
      new I(
        "STALE_REVISION",
        "Scene changed since the caller read it",
        null,
        {
          expected: o,
          received: a.baseRevision
        }
      )
    );
  const r = vm(e.state);
  let n = 0;
  const i = [], c = [];
  for (let p = 0; p < a.operations.length; p += 1)
    try {
      const m = ym({ ui: e, state: r, operation: a.operations[p] });
      n |= m?.dirtyMask || 0, m?.warning && i.push(m.warning), m?.outcome && c.push({ index: p, ...m.outcome });
    } catch (m) {
      if (m instanceof I)
        return (m.operationIndex === null || m.operationIndex === void 0) && (m.operationIndex = p), No(e, a.id, m);
      throw m;
    }
  if (a.validateOnly)
    return {
      ok: !0,
      version: Ot,
      revision: o,
      id: a.id,
      applied: a.operations.length,
      warnings: i,
      outcomes: c,
      dirtyMask: n,
      validateOnly: !0
    };
  e.checkpoint?.(a.description), e.state = dr(r);
  const l = xm(e);
  return (e._directorApiTxIds ||= /* @__PURE__ */ new Set()).add(a.id), e.serialize?.(), wm(e, l), km(e, n, `director-api:${a.id}`), {
    ok: !0,
    version: Ot,
    baseRevision: o,
    revision: Zo(e),
    id: a.id,
    applied: a.operations.length,
    warnings: i,
    outcomes: c,
    dirtyMask: n
  };
}
function jm(e) {
  return {
    query: (t) => Vd(e, t),
    execute: (t) => Sm(e, t)
  };
}
function _m(e) {
  return e.directorApi = jm(e), e.directorApi;
}
const $e = "/majoor/omnicam/library";
function Cm(e, t) {
  const a = typeof window < "u" && (window.app?.api || window.__omnicamApi) || null;
  if (!a?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return a.fetchApi(e, t);
}
async function Em(e) {
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
function Xr(e = {}) {
  const t = new URLSearchParams();
  for (const [o, r] of Object.entries(e))
    r == null || r === "" || t.set(o, String(r));
  const a = t.toString();
  return a ? `?${a}` : "";
}
function vr({ fetchApi: e = Cm } = {}) {
  const t = (a, o) => Promise.resolve(e(a, o)).then(Em);
  return {
    list(a = {}) {
      const { kind: o, tag: r, search: n, offset: i, limit: c } = a, l = { tag: r, search: n, offset: i, limit: c };
      return o && o !== "all" && (l.kind = o), t(`${$e}${Xr(l)}`);
    },
    get(a) {
      return t(`${$e}/${encodeURIComponent(a)}`);
    },
    register(a) {
      return t(`${$e}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a)
      });
    },
    patch(a, o) {
      return t(`${$e}/${encodeURIComponent(a)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(o)
      });
    },
    remove(a) {
      return t(`${$e}/${encodeURIComponent(a)}`, { method: "DELETE" });
    },
    importModel(a, o = {}) {
      const r = new FormData();
      return r.append("file", a, o.filename || a.name || "model.glb"), t(`${$e}/import${Xr(o)}`, { method: "POST", body: r });
    },
    importLocalCharacters({ folder: a, licenseNote: o = "", idPrefix: r = "", dryRun: n = !1 } = {}) {
      return t(`${$e}/import-local`, {
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
      return n.append("file", o, r), t(`${$e}/thumbnail/${encodeURIComponent(a)}`, {
        method: "POST",
        body: n
      });
    },
    listPoses() {
      return t(`${$e}/poses`);
    },
    savePose(a) {
      return t(`${$e}/poses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a)
      });
    },
    deletePose(a) {
      return t(`${$e}/poses/${encodeURIComponent(a)}`, { method: "DELETE" });
    }
  };
}
const rs = Object.freeze(["all", "character", "prop", "environment", "vehicle"]);
function Zr(e = {}) {
  const t = String(e.kind || "all").toLowerCase();
  return {
    kind: rs.includes(t) ? t : "all",
    tag: String(e.tag || "").trim().toLowerCase(),
    search: String(e.search || "").trim().toLowerCase()
  };
}
const Am = 60;
function $m(e) {
  const t = /* @__PURE__ */ new Set(), a = {
    items: [],
    byId: /* @__PURE__ */ new Map(),
    kinds: {},
    total: 0,
    offset: 0,
    limit: Am,
    filter: Zr({}),
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
      return a.filter = Zr({ ...a.filter, ...i }), a.offset = 0, this.refresh();
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
function Mm({ max: e = 96 } = {}) {
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
function Tm() {
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
const Im = 256;
function Jr(e = {}) {
  const { THREE: t, GLTFLoader: a, FBXLoader: o, size: r = Im } = e;
  if (!t || !a)
    return { render: async () => null, dispose() {
    } };
  let n = null, i = null, c = null;
  const l = () => {
    if (n) return;
    n = new t.WebGLRenderer({ antialias: !0, alpha: !0, preserveDrawingBuffer: !0 }), n.setSize(r, r, !1), n.setClearColor(0, 0), i = new t.Scene();
    const h = new t.DirectionalLight(16777215, 2.4);
    h.position.set(3, 5, 4);
    const d = new t.HemisphereLight(14673919, 2106412, 1.1);
    i.add(h, d), c = new t.PerspectiveCamera(35, 1, 0.01, 500);
  }, p = (h) => {
    const d = new t.Box3().setFromObject(h);
    if (d.isEmpty()) return;
    const f = d.getCenter(new t.Vector3()), u = d.getSize(new t.Vector3()), y = Math.max(u.length() / 2, 1e-3) / Math.sin(c.fov * Math.PI / 360);
    c.position.set(f.x + y * 0.7, f.y + y * 0.55, f.z + y), c.near = y / 100, c.far = y * 10, c.updateProjectionMatrix(), c.lookAt(f);
  }, m = (h, d) => new Promise((f, u) => {
    const b = d === "fbx" && o ? o : a;
    new b().load(
      h,
      (y) => f(y.scene || y),
      void 0,
      (y) => u(y)
    );
  });
  return {
    async render(h, d = "glb") {
      if (!h) return null;
      try {
        l();
        const f = await m(h, d);
        i.add(f), p(f), n.render(i, c);
        const u = n.domElement.toDataURL("image/webp", 0.82);
        return i.remove(f), f.traverse?.((b) => {
          b.geometry?.dispose?.();
          const y = b.material;
          Array.isArray(y) ? y.forEach((g) => g.dispose?.()) : y?.dispose?.();
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
async function Om() {
  const [e, t, a] = await Promise.all([
    import("./chunk-CcRb1b12.js").then((o) => o.T),
    import("./vendor-three-AeKB2-k3.js").then((o) => o.ak),
    import("./vendor-three-AeKB2-k3.js").then((o) => o.al)
  ]);
  return { THREE: e, GLTFLoader: t.GLTFLoader, FBXLoader: a.FBXLoader };
}
function Pm(e) {
  const [t, a] = String(e).split(","), o = /:(.*?);/.exec(t)?.[1] || "image/webp", r = atob(a || ""), n = new Uint8Array(r.length);
  for (let i = 0; i < r.length; i += 1) n[i] = r.charCodeAt(i);
  return new Blob([n], { type: o });
}
const Lm = Object.freeze({
  character: "pi-user",
  prop: "pi-box",
  environment: "pi-building",
  vehicle: "pi-car",
  helper: "pi-compass"
}), Fm = {
  all: "All",
  character: "Characters",
  prop: "Props",
  environment: "Env",
  vehicle: "Vehicles"
};
function st(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function zm(e, t = {}) {
  return rs.map((a) => {
    const o = s(Fm[a] || a), r = a === "all" ? "" : ` <span class="oc-asset-kind-n">${Number(t[a] || 0)}</span>`;
    return `<button type="button" class="oc-asset-kind${a === (e || "all") ? " active" : ""}" data-asset-kind="${a}">${st(o)}${r}</button>`;
  }).join("");
}
function Nm(e, { selected: t = !1, thumbUrl: a = "" } = {}) {
  const o = Lm[e.kind] || "pi-box", r = e.kind === "character" && En(e.rig) === "rigged" ? `<span class="oc-asset-badge">${s("RIGGED")}</span>` : "", n = a ? `<img class="oc-asset-thumb" src="${st(a)}" alt="" loading="lazy">` : `<span class="oc-asset-thumb oc-asset-thumb--glyph"><i class="pi ${o}"></i></span>`;
  return `<button type="button" class="oc-asset-card${t ? " selected" : ""}" data-asset-id="${st(e.id)}" title="${st(e.name)}">
    ${n}
    <span class="oc-asset-name">${st(e.name)}</span>
    <span class="oc-asset-kind-tag">${st((e.kind || "").toUpperCase())}</span>
    ${r}
  </button>`;
}
function Rm(e, { selectedId: t = "", thumbUrls: a = {} } = {}) {
  return !e || !e.length ? `<p class="oc-asset-empty">${s("No assets match this filter.")}</p>` : e.map((o) => Nm(o, {
    selected: o.id === t,
    thumbUrl: a[o.id] || ""
  })).join("");
}
function Qr(e) {
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
function Km(e, t = {}) {
  const a = e.root, o = t.fetchApi || ((z, R) => (e.api || e.app?.api).fetchApi(z, R)), r = t.apiClient || vr({ fetchApi: o }), n = t.store || $m(r), i = Mm(), c = t.previewQueue || Tm(), l = e.api || e.app?.api || null;
  let p = t.thumbnailRenderer || null, m = null;
  const h = /* @__PURE__ */ new Set();
  function d() {
    return p ? Promise.resolve(p) : (m || (m = Om().then((z) => p = Jr(z)).catch(() => p = Jr({}))), m);
  }
  function f(z) {
    return Ir(l, os(z));
  }
  function u(z) {
    return z.thumbnail ? Ir(l, `omnicam/library/${z.thumbnail} [input]`) : "";
  }
  function b() {
    for (const z of n.state.items) {
      if (z.kind === "helper" || !z.file || i.get(z.id) || z.thumbnail || h.has(z.id)) continue;
      const R = f(z);
      R && c.enqueue(z.id, async () => {
        const le = await (await d()).render(R, z.format || "glb");
        if (!le) {
          h.add(z.id);
          return;
        }
        if (i.set(z.id, le), G(), !(z.source && z.source !== "user"))
          try {
            const be = await r.uploadThumbnail(z.id, Pm(le));
            be?.asset && n.upsert(be.asset);
          } catch {
          }
      });
    }
  }
  const y = (z) => a.querySelector(`[data-role="${z}"]`), g = y("assets-panel"), v = y("asset-grid"), S = y("asset-kinds"), x = y("asset-search"), A = y("asset-status"), M = y("asset-import-file"), K = y("scene-tab"), L = y("assets-tab");
  let Y = "", U = null, H = !0, ne = 0;
  function j(z, { sticky: R = !1 } = {}) {
    A && (!R && ne > Date.now() || (A.textContent = z || "", ne = R ? Date.now() + 9e3 : 0));
  }
  function F(z) {
    if (Y = z, !!v)
      for (const R of v.querySelectorAll(".oc-asset-card"))
        R.classList.toggle("selected", R.dataset.assetId === z);
  }
  let q = !1;
  function G() {
    if (S && (S.innerHTML = zm(n.state.filter.kind, n.state.kinds)), v) {
      const z = {};
      for (const R of n.state.items) {
        const ie = i.get(R.id) || u(R);
        ie && (z[R.id] = ie);
      }
      v.innerHTML = Rm(n.state.items, { selectedId: Y, thumbUrls: z });
    }
    if (!q) {
      q = !0;
      try {
        b();
      } finally {
        q = !1;
      }
    }
    n.state.error ? j(n.state.error.message) : n.state.loading ? j(s("Loading assets...")) : j(s("{n} of {total} assets").replace("{n}", n.state.items.length).replace("{total}", n.state.total));
  }
  function oe(z) {
    if (!z) return;
    const R = bm({
      groundHit: e.webgl?.orbitGroundHit?.(),
      orbitTarget: e.webgl?.getOrbitTarget?.() || e.camera?.target
    }), ie = e.directorApi?.execute({
      version: 1,
      id: `tx_instantiate_${Date.now().toString(36)}`,
      description: s("Add asset"),
      operations: [{ type: "asset.instantiate", asset: z, point: R }]
    });
    if (!ie?.ok) {
      e.setStatus?.(ie?.error?.message || s("Could not add the asset"));
      return;
    }
    const le = ie.outcomes?.[0]?.objectId;
    le && (e.selectedEntity = "object", e.selectedObjectId = le, e.selectedObjectIds = /* @__PURE__ */ new Set([le]), e.selectedKeyFrame = null), e.restoreAssets?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.render?.(), e.setStatus?.(s("{name} added").replace("{name}", z.name));
  }
  async function $(z) {
    if (z) {
      j(s("Importing {name}...").replace("{name}", z.name));
      try {
        const R = await r.importModel(z, { kind: "prop", name: z.name.replace(/\.[^.]+$/, "") });
        R.asset && n.upsert(R.asset), j(s("Imported {name}").replace("{name}", R.asset?.name || z.name));
      } catch (R) {
        j(R.message || s("Import failed"));
      }
    }
  }
  const W = y("asset-local-form"), P = y("asset-local-folder"), V = y("asset-local-note");
  function Z() {
    W && (W.hidden = !W.hidden, W.hidden || P?.focus());
  }
  async function de(z) {
    const R = (P?.value || "").trim();
    if (!R) {
      j(s("Point to the folder you extracted the pack into."), { sticky: !0 });
      return;
    }
    ne = 0, j(z ? s("Scanning {folder}...").replace("{folder}", R) : s("Installing characters from {folder}...").replace("{folder}", R));
    try {
      const ie = await r.importLocalCharacters({
        folder: R,
        licenseNote: (V?.value || "").trim(),
        dryRun: z
      }), le = (ie.skipped || []).length;
      if (z) {
        const re = (ie.candidates || []).map((_e) => _e.name).join(", ");
        j(
          (ie.candidates || []).length ? s("{n} rig-complete character(s): {names}").replace("{n}", ie.candidates.length).replace("{names}", re) : s("No rig-complete .glb/.fbx character found ({n} skipped)").replace("{n}", le),
          { sticky: !0 }
        );
        return;
      }
      const be = (ie.installed || []).filter((re) => re.status !== "conflict").length, fe = (ie.installed || []).filter((re) => re.status === "conflict").length;
      j(
        s("{n} character(s) installed{extra} — no restart needed").replace("{n}", be).replace("{extra}", le || fe ? ` (${le} ${s("skipped")}${fe ? `, ${fe} ${s("unchanged")}` : ""})` : ""),
        { sticky: !0 }
      ), be && (n.refresh(), W && (W.hidden = !0));
    } catch (ie) {
      j(ie.message || s("Import failed"), { sticky: !0 });
    }
  }
  function me(z) {
    const R = z === "assets";
    K && (K.hidden = R), L && (L.hidden = !R);
    for (const ie of a.querySelectorAll("[data-asset-view]"))
      ie.classList.toggle("active", ie.dataset.assetView === z);
    R && H && (H = !1, n.refresh());
  }
  function te(z) {
    const R = Qr(z.target);
    if (R) {
      if (R.action === "switch-view") return me(R.view);
      if (R.action === "filter-kind") return void n.setFilter({ kind: R.kind });
      if (R.action === "asset-add")
        return oe(n.get(Y));
      if (R.action === "asset-import")
        return M?.click();
      if (R.action === "local-toggle") return Z();
      if (R.action === "local-scan") return void de(!0);
      if (R.action === "local-install") return void de(!1);
      R.action === "card" && F(R.assetId);
    }
  }
  function pe(z) {
    const R = Qr(z.target);
    R?.action === "card" && oe(n.get(R.assetId));
  }
  function ye() {
    clearTimeout(U), U = setTimeout(() => n.setFilter({ search: x.value }), 200);
  }
  function ue(z) {
    const R = z.target.files?.[0];
    z.target.value = "", $(R);
  }
  const xe = n.subscribe(G);
  return g?.addEventListener("click", te), g?.addEventListener("dblclick", pe), a.querySelector('[data-role="left-tabs"]')?.addEventListener("click", te), x?.addEventListener("input", ye), M?.addEventListener("change", ue), G(), {
    store: n,
    switchView: me,
    refresh: () => n.refresh(),
    dispose() {
      xe(), clearTimeout(U), g?.removeEventListener("click", te), g?.removeEventListener("dblclick", pe), a.querySelector('[data-role="left-tabs"]')?.removeEventListener("click", te), x?.removeEventListener("input", ye), M?.removeEventListener("change", ue), c.clear(), p?.dispose?.(), i.clear();
    }
  };
}
function Dm(e, t = {}) {
  const a = t.container || e.root?.querySelector(".viewport-wrap") || e.root, o = document.createElement("div");
  o.className = "oc-label-layer", o.setAttribute("aria-hidden", "true"), a?.appendChild(o);
  const r = [];
  let n = Wo(e.state?.metadata?.viewport_labels);
  function i(m) {
    if (!r[m]) {
      const h = document.createElement("div");
      h.className = "oc-label", o.appendChild(h), r[m] = h;
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
    const d = c(), f = Number(e.frame) || 0, u = Array.isArray(e.state?.objects) ? e.state.objects : [];
    let b = 0;
    for (const y of u) {
      if (!An(y, { mode: n.mode, selectedIds: d })) continue;
      const g = $n(y, n.content);
      if (!g) continue;
      const v = Mn(u, y, f) || {
        position: y.position,
        size: y.size
      }, S = e.webgl.projectWorldToScreen(Tn(v, y.type));
      if (!S || S.behind) continue;
      const x = i(b);
      b += 1, x.hidden = !1, x.textContent = g, x.style.transform = `translate(-50%, -100%) translate(${Math.round(S.x)}px, ${Math.round(S.y)}px)`;
      const A = n.content === "annotation" ? y.annotation?.color : "";
      x.style.setProperty("--oc-label-accent", A || ""), x.classList.toggle("is-annotation", n.content === "annotation" && !!A);
    }
    for (let y = b; y < r.length; y += 1) r[y].hidden = !0;
  }
  function p(m) {
    n = Wo({ ...n, ...m }), e.state.metadata = { ...e.state.metadata || {}, viewport_labels: { ...n } }, e.serialize?.(), l();
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
function Bm(e) {
  const t = (a) => e.webgl?.getModelBoneNames?.(a) || [];
  return {
    /** Bones + a best-effort auto-map + completeness for one object. */
    getRigInfo(a) {
      const o = e.state?.objects?.find((i) => i.id === a) || null, r = t(a), n = Vo(r);
      return {
        objectId: a,
        assetId: o?.asset_id || null,
        isCharacter: o?.asset_kind === "character",
        rigProfile: o?.character?.rig_profile || null,
        boneNames: r,
        autoMap: n,
        autoMapStatus: En({ bone_map: n })
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
      return Vo(t(a));
    },
    /** Preview a motion clip on the loaded model (viewport only -- the durable
     * state write goes through the Semantic API). */
    setMotion(a, o) {
      const r = lr(o);
      return r ? !!(e.webgl?.applyMotionClip?.(a, r) ?? !0) : !1;
    },
    /** Sample the live bone rotations at the current frame, mapped to canonical
     * joints -- the input to "Bake current frame to pose". */
    sampleCanonicalPose(a, o) {
      return e.webgl?.sampleCharacterBonePose?.(a, o) || {};
    }
  };
}
function en(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function qm(e, t) {
  const a = (o) => [`<option value="">${s("— unmapped —")}</option>`].concat(
    e.map(
      (r) => `<option value="${en(r)}"${r === o ? " selected" : ""}>${en(r)}</option>`
    )
  ).join("");
  return In.map((o) => {
    const r = t[o] || "", n = r && e.includes(r);
    return `<label class="oc-rig-row${n ? " ok" : ""}" data-joint="${o}">
      <span class="oc-rig-joint">${o}</span>
      <select data-rig-joint="${o}">${a(r)}</select>
      <span class="oc-rig-tick">${n ? "✓" : ""}</span>
    </label>`;
  }).join("");
}
function Um(e, t = {}) {
  const a = e.root, o = t.apiClient || vr({
    fetchApi: (g, v) => (e.api || e.app?.api).fetchApi(g, v)
  }), r = a.querySelector('[data-role="rig-mapper"]');
  if (!r) return { sync() {
  }, dispose() {
  } };
  const n = r.querySelector('[data-role="rig-mapper-grid"]'), i = r.querySelector('[data-role="rig-mapper-status"]');
  let c = null, l = {};
  const p = () => e.state?.objects?.find((g) => g.id === c) || null, m = () => e.webgl?.getModelBoneNames?.(c) || [];
  function h() {
    if (!i) return;
    const g = Or(l);
    Po(l) ? (i.textContent = s("Humanoid v1 ✓ — all 22 joints mapped"), i.dataset.state = "ok") : (i.textContent = s("Incomplete — {n} joint(s) unmapped").replace("{n}", g.length), i.dataset.state = "warn");
  }
  function d() {
    n && (n.innerHTML = qm(m(), l)), h();
  }
  function f() {
    const g = e.selectedObject?.(), v = g?.asset_kind === "character";
    if (r.hidden = !v, !v) {
      c = null;
      return;
    }
    g.id !== c && (c = g.id, r.open = !0, l = {}, g.asset_id ? o.get(g.asset_id).then((S) => {
      c === g.id && (l = { ...S?.asset?.rig?.bone_map || {} }, d());
    }).catch(() => d()) : d());
  }
  function u(g) {
    const v = g.target.closest("[data-rig-joint]");
    if (!v) return;
    const S = v.dataset.rigJoint;
    v.value ? l[S] = v.value : delete l[S], d();
  }
  function b(g) {
    const v = g.target.closest("[data-rig-act]")?.dataset.rigAct;
    v === "auto" ? (l = Vo(m()), d()) : v === "validate" ? (d(), e.setStatus?.(Po(l) ? s("Rig is complete") : s("Rig still missing: {list}").replace("{list}", Or(l).join(", ")))) : v === "save" && y();
  }
  async function y() {
    const g = p();
    if (!g?.asset_id) {
      e.setStatus?.(s("Instantiate this asset from the Asset Browser before mapping its rig"));
      return;
    }
    try {
      const v = await o.patch(g.asset_id, {
        rig: { profile: Pr, bone_map: l }
      });
      g.character = {
        ...g.character || {},
        rig_profile: Po(l) ? Pr : null
      }, e.assetBrowser?.store?.upsert?.(v.asset), e.checkpoint?.("Save rig mapping"), e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.setStatus?.(s("Rig mapping saved"));
    } catch (v) {
      e.setStatus?.(v.message || s("Could not save the rig mapping"));
    }
  }
  return n?.addEventListener("change", u), r.addEventListener("click", b), f(), {
    sync: f,
    get boneMap() {
      return { ...l };
    },
    dispose() {
      n?.removeEventListener("change", u), r.removeEventListener("click", b);
    }
  };
}
function Wm(e, t = {}) {
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
    const { objectId: l, boneMap: p, selectedJoint: m } = c, h = e.characterRuntime, d = /* @__PURE__ */ new Set();
    for (const f of In) {
      const u = p?.[f];
      if (!u) continue;
      const b = h?.getJointWorldTransform?.(l, f, p) || e.webgl.resolveModelBone?.(l, u);
      if (!b?.world) continue;
      const y = e.webgl.projectWorldToScreen(b.world);
      if (!y || y.behind) continue;
      const g = n(f);
      g.hidden = !1, g.classList.toggle("selected", f === m), g.style.transform = `translate(-50%, -50%) translate(${Math.round(y.x)}px, ${Math.round(y.y)}px)`, d.add(f);
    }
    for (const [f, u] of r) d.has(f) || (u.hidden = !0);
  }
  return i(), {
    update: i,
    dispose() {
      o.remove(), r.clear();
    }
  };
}
const Vm = /[^a-z0-9_-]+/g;
function Hm(e, t = {}) {
  const a = e.root, o = t.apiClient || vr({
    fetchApi: (j, F) => (e.api || e.app?.api).fetchApi(j, F)
  }), r = a.querySelector('[data-role="pose-editor"]');
  if (!r) return { sync() {
  }, update() {
  }, dispose() {
  } };
  const n = r.querySelector('[data-role="pose-preset"]'), i = r.querySelector('[data-pose-act="edit"]'), c = r.querySelector('[data-role="pose-joint-row"]'), l = r.querySelector('[data-role="pose-joint-name"]'), p = ["x", "y", "z"].map((j) => r.querySelector(`[data-role="pose-rot-${j}"]`));
  let m = null, h = !1, d = /* @__PURE__ */ new Map();
  const f = () => e.state?.objects?.find((j) => j.id === m) || null, u = () => e.rigMapper?.boneMap && Object.keys(e.rigMapper.boneMap).length ? e.rigMapper.boneMap : null, b = () => e.subSelection?.type === "character_joint" && e.subSelection.objectId === m ? e.subSelection.jointId : null;
  function y(j) {
    const F = go({ ...j, preset_id: j.id });
    return { id: j.id, name: j.name || j.id, root_offset: F.root_offset, joints: F.joints };
  }
  function g(j) {
    const F = d.get(j?.pose?.preset_id) || null;
    return Xs({ preset: F, overrides: j?.pose }).joints;
  }
  function v() {
    const j = f();
    !j?.character || !u() || e.webgl?.applyCharacterPose?.(m, u(), h || j.character.pose?.joints ? g(j.character) : {});
  }
  function S() {
    const j = b(), F = h && !!j;
    if (c && (c.hidden = !F), !F) return;
    l && (l.textContent = j);
    const q = f(), G = g(q?.character)[j] || [0, 0, 0, 1], oe = Zs(G);
    p.forEach(($, W) => {
      $ && document.activeElement !== $ && ($.value = String(Math.round(oe[W] * 100) / 100));
    });
  }
  function x() {
    const j = f(), F = !!j?.character?.motion;
    if (i && (i.classList.toggle("active", h), i.disabled = F, i.title = F ? s("Clear the motion clip to edit the pose") : s("Toggle FK pose editing")), n) {
      const q = [["neutral", s("Standing Neutral")]].concat([...d.values()].filter((oe) => oe.id !== "neutral").map((oe) => [oe.id, oe.name || oe.id])), G = q.map((oe) => oe.join(":")).join("|");
      n.dataset.sig !== G && (n.dataset.sig = G, n.replaceChildren(...q.map(([oe, $]) => {
        const W = document.createElement("option");
        return W.value = oe, W.textContent = $, W;
      }))), document.activeElement !== n && (n.value = j?.character?.pose?.preset_id || "neutral");
    }
    S(), v();
  }
  async function A() {
    try {
      const j = await o.listPoses();
      d = new Map((j.poses || []).filter((F) => F?.id).map((F) => [F.id, y(F)]));
    } catch {
      d = /* @__PURE__ */ new Map();
    }
    d.has("neutral") || d.set("neutral", y({ id: "neutral", name: "Standing Neutral" })), x();
  }
  function M() {
    const j = b();
    if (!j) return;
    const F = p.map((oe) => Number(oe?.value) || 0), q = Ys(F), G = e.directorApi?.execute({
      version: 1,
      id: `tx_pose_${Date.now().toString(36)}`,
      description: "Pose joint",
      operations: [{ type: "character.set_joint_rotation", objectId: m, joint: j, rotation: q }]
    });
    G && !G.ok && e.setStatus?.(G.error?.message || s("Could not set the joint")), x();
  }
  function K() {
    const j = n?.value || "neutral", F = d.get(j) || go({ preset_id: j });
    e.directorApi?.execute({
      version: 1,
      id: `tx_preset_${Date.now().toString(36)}`,
      description: "Pose preset",
      operations: [{ type: "character.set_pose", objectId: m, pose: { preset_id: j, root_offset: F.root_offset, joints: {} } }]
    }), x();
  }
  async function L() {
    const j = f();
    if (!j?.character) return;
    const F = (await zt(e, s("Save Pose"), s("Pose name"), ""))?.trim();
    if (!F || e.disposed) return;
    const q = F.toLowerCase().replace(Vm, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "pose";
    try {
      const G = await o.savePose({
        id: q,
        name: F,
        profile: "omnicam_humanoid_v1",
        root_offset: j.character.pose?.root_offset || [0, 0, 0],
        joints: g(j.character)
      });
      d.set(G.pose.id, y(G.pose)), e.setStatus?.(s("Pose saved: {name}").replace("{name}", F)), x();
    } catch (G) {
      e.setStatus?.(G.message || s("Could not save the pose"));
    }
  }
  function Y() {
    const j = f();
    !j?.character || j.character.motion || (h = !h, !h && e.subSelection?.type === "character_joint" && (e.subSelection = null), x(), e.rigOverlay?.update?.());
  }
  function U(j) {
    h && (e.subSelection = { type: "character_joint", objectId: m, jointId: j }, x(), e.rigOverlay?.update?.());
  }
  const H = Wm(e, {
    onPick: U,
    isActive: () => h && m && u() ? { objectId: m, boneMap: u(), selectedJoint: b() } : null
  });
  e.rigOverlay = H;
  function ne() {
    const j = e.selectedObject?.(), F = j?.asset_kind === "character";
    if (r.hidden = !F, !F) {
      h && (h = !1), m = null, H.update();
      return;
    }
    j.id !== m && (m = j.id, h = !1, e.subSelection?.type === "character_joint" && (e.subSelection = null), d.size || A()), x(), H.update();
  }
  n?.addEventListener("change", K), i?.addEventListener("click", Y), r.querySelector('[data-pose-act="save"]')?.addEventListener("click", L);
  for (const j of p)
    j?.addEventListener("change", M), j?.addEventListener("input", M);
  return A(), {
    sync: ne,
    update() {
      H.update(), v();
    },
    get editing() {
      return h;
    },
    dispose() {
      H.dispose(), n?.removeEventListener("change", K), i?.removeEventListener("click", Y);
      for (const j of p)
        j?.removeEventListener("change", M), j?.removeEventListener("input", M);
    }
  };
}
function tn(e, t) {
  const a = document.createElement("option");
  return a.value = e, a.textContent = t, a;
}
function Ro(e, t) {
  e && document.activeElement !== e && (e.value = String(t));
}
function Gm(e) {
  const t = e.root?.querySelector('[data-role="motion-editor"]');
  if (!t) return { sync() {
  }, dispose() {
  } };
  const a = (g) => t.querySelector(`[data-role="${g}"]`), o = a("motion-clip"), r = a("motion-start"), n = a("motion-end"), i = a("motion-speed"), c = a("motion-loop"), l = t.querySelector('[data-motion-act="bake"]');
  let p = null;
  const m = () => e.state?.objects?.find((g) => g.id === p) || null, h = () => e.modelInfoById?.get(p)?.animationNames || [];
  function d() {
    const g = o?.value || "";
    return g ? lr({
      clip_id: g,
      start_frame: Number(r?.value) || 0,
      end_frame: Number(n?.value) || 0,
      speed: Number(i?.value) || 1,
      loop: c?.checked !== !1,
      offset_seconds: 0
    }) : null;
  }
  function f() {
    const g = d(), v = g ? { type: "character.set_motion", objectId: p, motion: g } : { type: "character.clear_motion", objectId: p }, S = e.directorApi?.execute({
      version: 1,
      id: `tx_motion_${Date.now().toString(36)}`,
      description: "Character motion",
      operations: [v]
    });
    S && !S.ok && e.setStatus?.(S.error?.message || s("Could not set the motion")), e.poseEditor?.sync?.(), u();
  }
  function u() {
    const g = m(), v = h(), S = g?.character?.motion || null;
    if (o) {
      const A = v.join("|");
      o.dataset.sig !== A && (o.dataset.sig = A, o.replaceChildren(
        tn("", v.length ? s("No motion (static)") : s("No clips in this model")),
        ...v.map((M) => tn(M, M))
      )), document.activeElement !== o && (o.value = S?.clip_id || ""), o.disabled = !v.length;
    }
    Ro(r, S?.start_frame ?? 0), Ro(n, S?.end_frame ?? 0), Ro(i, S?.speed ?? 1), c && document.activeElement !== c && (c.checked = S ? S.loop !== !1 : !0);
    const x = !!S;
    for (const A of [r, n, i, c]) A && (A.disabled = !x);
    l && (l.disabled = !x);
  }
  function b() {
    const g = m(), v = e.rigMapper?.boneMap;
    if (!g?.character || !v || !Object.keys(v).length) {
      e.setStatus?.(s("Map the rig before baking a pose"));
      return;
    }
    const S = e.characterRuntime?.sampleCanonicalPose?.(p, v) || {};
    e.directorApi?.execute({
      version: 1,
      id: `tx_bake_${Date.now().toString(36)}`,
      description: "Bake frame to pose",
      operations: [
        { type: "character.clear_motion", objectId: p },
        {
          type: "character.set_pose",
          objectId: p,
          pose: { preset_id: "neutral", root_offset: g.character.pose?.root_offset || [0, 0, 0], joints: S }
        }
      ]
    }), e.setStatus?.(s("Baked current frame to pose")), u(), e.poseEditor?.sync?.();
  }
  function y() {
    const g = e.selectedObject?.(), v = g?.asset_kind === "character";
    if (t.hidden = !v, !v) {
      p = null;
      return;
    }
    p = g.id, u();
  }
  o?.addEventListener("change", f);
  for (const g of [r, n, i, c]) g?.addEventListener("change", f);
  return l?.addEventListener("click", b), {
    sync: y,
    dispose() {
      o?.removeEventListener("change", f);
      for (const g of [r, n, i, c]) g?.removeEventListener("change", f);
      l?.removeEventListener("click", b);
    }
  };
}
function Pe(e, t) {
  return [...e.querySelectorAll(`[data-role="${t}"]`)];
}
function ns(e) {
  return {
    status: e.querySelector('[data-role="status"]'),
    time: e.querySelector('[data-role="time"]'),
    frames: Pe(e, "frame"),
    scrubs: Pe(e, "scrub"),
    cameraFov: Pe(e, "camera-fov"),
    cameraRoll: Pe(e, "camera-roll"),
    cameraFocal: Pe(e, "camera-focal"),
    viewportZoom: Pe(e, "viewport-zoom"),
    cameraType: Pe(e, "camera-type"),
    cameraNear: Pe(e, "camera-near"),
    cameraFar: Pe(e, "camera-far")
  };
}
function Ym(e, t) {
  e.checkpoint(`Apply preset: ${t}`);
  const a = e.activeCameraTrack(), o = hl(t, {
    duration_frames: e.state.duration_frames,
    target: e.camera.target || [0, 1.5, 0]
  });
  a.keyframes = o, a.id === e.state.active_camera_id && (e.state.keyframes = o), e.serialize(), e.refreshKeys(), e.setFrame(0, !0), e.render(), e.setStatus(`Preset applied: ${t}`);
}
function Xm(e, t) {
  e.checkpoint(`Apply camera shake: ${t}`);
  const a = e.activeCameraTrack();
  (!a.keyframes || a.keyframes.length === 0) && (a.keyframes = [
    { frame: 0, camera: he(e.camera), interpolation: "smooth" },
    { frame: e.state.duration_frames - 1, camera: he(e.camera), interpolation: "smooth" }
  ]);
  const o = fl(a, { type: t, intensity: 1, duration_frames: e.state.duration_frames });
  a.keyframes = o, a.id === e.state.active_camera_id && (e.state.keyframes = o), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(`Camera shake applied: ${t}`);
}
function Zm(e, t) {
  const o = {
    clean_proxy: { render_mode: "omni_ref", playblast_grid: !0, burn_in: !1, speed_heatmap: !1, guides: !1, safe_areas: !1 },
    debug_motion: { render_mode: "wireframe", playblast_grid: !0, burn_in: !0, speed_heatmap: !0, guides: !0, safe_areas: !1 },
    cinematic_view: { render_mode: "graybox", playblast_grid: !1, burn_in: !1, speed_heatmap: !1, guides: !0, safe_areas: !0 }
  }[t];
  o && (e.checkpoint(`Apply proxy preset: ${t}`), Object.assign(e.state, o), e.serialize(), e.render(), e.setStatus(`Proxy preset applied: ${t}`));
}
function Jm(e, t) {
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
const an = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"], qe = [4, 8, 12, 20, 35, 60, 100];
function dt(e) {
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
function Qm(e) {
  return e <= -1 ? "#38bdf8" : e <= 0.2 ? "#2dd4bf" : e <= 2.2 ? "#4ade80" : e <= 5 ? "#facc15" : e <= 10 ? "#fb923c" : "#f43f5e";
}
function ep(e) {
  return `${e > 0 ? "+" : ""}${e.toFixed(1)}m`;
}
function Ao(e, t, a) {
  if (!t || !a || t < 80 || a < 80) return null;
  const o = dt(e), r = o.expanded ? 220 : 138, n = Math.min(r, Math.max(80, Math.min(t, a) - 20)), i = 10, c = Math.max(0, t - n - i), l = Math.max(0, a - n - i), p = e.viewportCamera(), m = p?.position || [0, 1.5, 5], h = p?.target || [0, 0, 0], d = e.activeCameraTrack?.(), f = e.state.cameras?.length ? e.state.cameras : d ? [d] : [], u = f.flatMap(
    (A) => (A.keyframes || []).map((M) => M.camera?.position).filter(Boolean)
  );
  let b = 12;
  if (o.rangeIndex >= 0 && o.rangeIndex < qe.length)
    b = qe[o.rangeIndex];
  else {
    const A = Math.max(
      Math.abs(m[0] || 0),
      Math.abs(m[2] || 0),
      Math.abs(h[0] || 0),
      Math.abs(h[2] || 0),
      ...u.flatMap((M) => [Math.abs(M[0] || 0), Math.abs(M[2] || 0)]),
      4
    );
    b = Math.max(6, Math.ceil((A + 1.5) / 4) * 4);
  }
  const y = c + n / 2, g = l + n / 2, v = n / 2 - 12, S = v / b, x = o.centerMode === "camera" ? [m[0] || 0, m[2] || 0] : [0, 0];
  return {
    rx: c,
    ry: l,
    radarSize: n,
    margin: i,
    cx: y,
    cy: g,
    innerRadius: v,
    range: b,
    scale: S,
    worldCenterX: x[0],
    worldCenterZ: x[1],
    camPos: m,
    camTgt: h,
    cameras: f,
    activeTrack: d
  };
}
function ss(e, t, a) {
  const o = t - e.worldCenterX, r = a - e.worldCenterZ;
  return [e.cx + o * e.scale, e.cy + r * e.scale];
}
function Jo(e, t, a) {
  const o = (t - e.cx) / e.scale, r = (a - e.cy) / e.scale;
  return [e.worldCenterX + o, e.worldCenterZ + r];
}
function tp(e, t, a, o) {
  const r = Ao(e, a, o);
  if (!r) return;
  const { rx: n, ry: i, radarSize: c, cx: l, cy: p, innerRadius: m, range: h, scale: d, camPos: f, camTgt: u, cameras: b, activeTrack: y } = r, g = dt(e), v = e.state.active_camera_id || y?.id, S = (te, pe) => ss(r, te, pe);
  t.save(), t.beginPath(), typeof t.roundRect == "function" ? t.roundRect(n, i, c, c, 10) : t.rect(n, i, c, c), t.clip(), t.fillStyle = "rgba(11, 15, 25, 0.90)", t.fillRect(n, i, c, c);
  const x = t.createRadialGradient(l, p, 2, l, p, m);
  x.addColorStop(0, "rgba(0, 210, 211, 0.06)"), x.addColorStop(1, "rgba(0, 0, 0, 0)"), t.fillStyle = x, t.fillRect(n, i, c, c), t.strokeStyle = "rgba(0, 210, 211, 0.38)", t.lineWidth = 1.2, t.strokeRect(n, i, c, c);
  const A = [0.33, 0.66, 1];
  t.strokeStyle = "rgba(0, 210, 211, 0.12)", t.lineWidth = 1;
  for (const te of A) {
    const pe = m * te;
    t.beginPath(), t.arc(l, p, pe, 0, Math.PI * 2), t.stroke(), c >= 120 && (t.font = "8px monospace", t.fillStyle = "rgba(0, 210, 211, 0.35)", t.textAlign = "left", t.fillText(`${Math.round(h * te)}m`, l + pe + 2, p - 2));
  }
  t.strokeStyle = "rgba(255, 255, 255, 0.10)", t.beginPath(), t.moveTo(n + 6, p), t.lineTo(n + c - 6, p), t.moveTo(l, i + 6), t.lineTo(l, i + c - 6), t.stroke(), t.font = "bold 9px sans-serif", t.textAlign = "center", t.textBaseline = "middle", t.fillStyle = "#f43f5e", t.fillText("N", l, i + 9), t.fillStyle = "rgba(255, 255, 255, 0.4)", t.fillText("S", l, i + c - 9), t.fillText("W", n + 9, p), t.fillText("E", n + c - 9, p);
  for (const te of e.state.objects || []) {
    if (te.enabled === !1) continue;
    const pe = mr(e.state.objects, te).position || [0, 0, 0], [ye, ue] = S(pe[0], pe[2]);
    if (ye < n + 3 || ye > n + c - 3 || ue < i + 3 || ue > i + c - 3) continue;
    const xe = e.selectedObjectId === te.id || e.selectedObjectIds?.has?.(te.id);
    if (t.save(), t.translate(ye, ue), te.type === "card") {
      const z = (te.rotation?.[1] || 0) * Math.PI / 180;
      t.rotate(-z), t.fillStyle = xe ? "#a855f7" : "#38bdf8", t.fillRect(-4, -1.2, 8, 2.4), t.strokeStyle = xe ? "#ffffff" : "rgba(255,255,255,0.6)", t.lineWidth = 1, t.strokeRect(-4, -1.2, 8, 2.4);
    } else if (te.type === "light") {
      t.fillStyle = xe ? "#a855f7" : "#fbbf24", t.beginPath(), t.arc(0, 0, 3, 0, Math.PI * 2), t.fill(), t.strokeStyle = "#fbbf24", t.lineWidth = 1;
      for (let z = 0; z < 4; z++) {
        const R = z * Math.PI / 2;
        t.beginPath(), t.moveTo(Math.cos(R) * 4, Math.sin(R) * 4), t.lineTo(Math.cos(R) * 6, Math.sin(R) * 6), t.stroke();
      }
    } else
      t.fillStyle = xe ? "#a855f7" : te.type === "human" ? "#ec4899" : "#f59e0b", t.beginPath(), t.arc(0, 0, 2.8, 0, Math.PI * 2), t.fill();
    xe && (t.strokeStyle = "#a855f7", t.lineWidth = 1.2, t.beginPath(), t.arc(0, 0, 6, 0, Math.PI * 2), t.stroke()), t.restore();
  }
  for (let te = 0; te < b.length; te++) {
    const pe = b[te], ye = pe.keyframes || [], ue = pe.id === v, xe = pe.color || an[te % an.length];
    t.save(), t.strokeStyle = xe, t.globalAlpha = ue ? 0.95 : 0.4, t.lineWidth = ue ? 2 : 1, t.setLineDash(ue ? [] : [2, 2]), t.beginPath();
    let z = !1;
    const R = ye[0]?.frame, ie = ye[ye.length - 1]?.frame;
    for (let le = R; Number.isFinite(le) && le <= ie; le++) {
      const be = Ce(pe, le, e.state.objects)?.position;
      if (!Array.isArray(be)) continue;
      const [fe, re] = S(be[0], be[2]);
      z ? t.lineTo(fe, re) : (t.moveTo(fe, re), z = !0);
    }
    z && t.stroke(), t.restore(), t.save();
    for (const le of ye) {
      const be = le.camera?.position;
      if (!be) continue;
      const [fe, re] = S(be[0], be[2]);
      if (fe < n + 4 || fe > n + c - 4 || re < i + 4 || re > i + c - 4) continue;
      const _e = le.frame === e.frame && ue;
      t.fillStyle = _e ? "#ffffff" : xe, t.globalAlpha = ue ? 0.95 : 0.6, t.beginPath(), t.moveTo(fe, re - 3), t.lineTo(fe + 3, re), t.lineTo(fe, re + 3), t.lineTo(fe - 3, re), t.closePath(), t.fill(), _e && (t.strokeStyle = "#00d2d3", t.lineWidth = 1.2, t.stroke());
    }
    t.restore();
  }
  const [M, K] = S(f[0] || 0, f[2] || 0), [L, Y] = S(u[0] || 0, u[2] || 0), U = 8, H = X(M, n + U, n + c - U), ne = X(K, i + U, i + c - U), j = X(L, n + U, n + c - U), F = X(Y, i + U, i + c - U), q = f[1] || 0, G = Qm(q), oe = ep(q);
  t.strokeStyle = "rgba(255, 255, 255, 0.40)", t.lineWidth = 1, t.setLineDash([3, 3]), t.beginPath(), t.moveTo(H, ne), t.lineTo(j, F), t.stroke(), t.setLineDash([]), t.fillStyle = "#ffffff", t.beginPath(), t.arc(j, F, 2.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "rgba(255, 255, 255, 0.7)", t.lineWidth = 1, t.beginPath(), t.arc(j, F, 4.5, 0, Math.PI * 2), t.stroke();
  const $ = u[0] - f[0], W = u[2] - f[2], P = Math.atan2(W, $), Z = (e.viewportCamera().fov || 35) * Math.PI / 360, de = X(24 * (d / (m / 8)), 16, 38), me = t.createRadialGradient(H, ne, 2, H, ne, de);
  me.addColorStop(0, G + "55"), me.addColorStop(1, G + "08"), t.fillStyle = me, t.strokeStyle = G, t.lineWidth = 1.2, t.beginPath(), t.moveTo(H, ne), t.lineTo(H + Math.cos(P - Z) * de, ne + Math.sin(P - Z) * de), t.arc(H, ne, de, P - Z, P + Z), t.closePath(), t.fill(), t.stroke(), t.fillStyle = G + "44", t.beginPath(), t.arc(H, ne, 6.5, 0, Math.PI * 2), t.fill(), t.fillStyle = G, t.beginPath(), t.arc(H, ne, 3.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "#ffffff", t.lineWidth = 1.5, t.beginPath(), t.moveTo(H, ne), t.lineTo(H + Math.cos(P) * 7, ne + Math.sin(P) * 7), t.stroke(), ap(e, t, r, G, oe, P, Math.hypot($, W)), g.hover && op(t, r, g.hover), t.restore();
}
function ap(e, t, a, o, r, n, i) {
  const { rx: c, ry: l, radarSize: p } = a, m = dt(e);
  t.fillStyle = "rgba(15, 23, 42, 0.75)", t.fillRect(c, l, p, 18), t.strokeStyle = "rgba(0, 210, 211, 0.2)", t.lineWidth = 1, t.beginPath(), t.moveTo(c, l + 18), t.lineTo(c + p, l + 18), t.stroke(), t.font = "bold 9px sans-serif", t.fillStyle = "#00d2d3", t.textAlign = "left", t.textBaseline = "middle", t.fillText("RADAR", c + 6, l + 9);
  const h = l + 3, d = 12;
  no(t, c + 44, h, 12, d, "−", m.hover?.button === "zoom_out"), no(t, c + 58, h, 12, d, "+", m.hover?.button === "zoom_in");
  const f = m.centerMode === "camera" ? "CAM" : "CTR";
  no(t, c + 72, h, 22, d, f, m.hover?.button === "center");
  const u = m.expanded ? "⤡" : "⤢";
  no(t, c + 96, h, 14, d, u, m.hover?.button === "size"), t.font = "bold 8.5px monospace", t.fillStyle = o, t.textAlign = "right", t.fillText(`Y:${r}`, c + p - 5, l + 9), t.fillStyle = "rgba(15, 23, 42, 0.70)", t.fillRect(c, l + p - 15, p, 15), t.strokeStyle = "rgba(0, 210, 211, 0.15)", t.beginPath(), t.moveTo(c, l + p - 15), t.lineTo(c + p, l + p - 15), t.stroke();
  const b = Math.round((n * 180 / Math.PI + 360) % 360);
  t.font = "8px monospace", t.fillStyle = "rgba(255, 255, 255, 0.55)", t.textAlign = "left", t.fillText(`HDG:${b}°`, c + 5, l + p - 7), t.textAlign = "right", t.fillText(`DIST:${i.toFixed(1)}m`, c + p - 5, l + p - 7);
}
function no(e, t, a, o, r, n, i) {
  e.fillStyle = i ? "rgba(0, 210, 211, 0.35)" : "rgba(255, 255, 255, 0.10)", e.fillRect(t, a, o, r), e.strokeStyle = i ? "#00d2d3" : "rgba(255, 255, 255, 0.20)", e.lineWidth = 1, e.strokeRect(t, a, o, r), e.font = "bold 8px sans-serif", e.fillStyle = i ? "#ffffff" : "rgba(255, 255, 255, 0.75)", e.textAlign = "center", e.textBaseline = "middle", e.fillText(n, t + o / 2, a + r / 2);
}
function op(e, t, a) {
  if (!a || !a.text) return;
  const { rx: o, ry: r, radarSize: n } = t;
  e.font = "9px sans-serif";
  const i = e.measureText(a.text).width + 12, c = 16, l = X(a.px - i / 2, o + 4, o + n - i - 4), p = a.pz > t.cy ? a.pz - 22 : a.pz + 8;
  e.fillStyle = "rgba(15, 23, 42, 0.94)", e.fillRect(l, p, i, c), e.strokeStyle = "#00d2d3", e.lineWidth = 1, e.strokeRect(l, p, i, c), e.fillStyle = "#ffffff", e.textAlign = "center", e.textBaseline = "middle", e.fillText(a.text, l + i / 2, p + c / 2);
}
function is(e, t, a) {
  const { rx: o, ry: r } = e, n = r + 3;
  return a < n || a > n + 12 ? null : t >= o + 44 && t <= o + 56 ? "zoom_out" : t >= o + 58 && t <= o + 70 ? "zoom_in" : t >= o + 72 && t <= o + 94 ? "center" : t >= o + 96 && t <= o + 110 ? "size" : null;
}
function cs(e, t, a, o) {
  const { camPos: r, camTgt: n, cameras: i, rx: c, ry: l, radarSize: p } = t, m = (y, g) => ss(t, y, g), [h, d] = m(r[0] || 0, r[2] || 0);
  if (Math.hypot(a - h, o - d) <= 8)
    return { type: "camera", pos: r };
  const [f, u] = m(n[0] || 0, n[2] || 0);
  if (Math.hypot(a - f, o - u) <= 8)
    return { type: "target", pos: n };
  const b = e.activeCameraTrack?.();
  if (b)
    for (const y of b.keyframes || []) {
      const g = y.camera?.position;
      if (!g) continue;
      const [v, S] = m(g[0], g[2]);
      if (Math.hypot(a - v, o - S) <= 6)
        return { type: "keyframe", key: y, frame: y.frame };
    }
  for (const y of e.state.objects || []) {
    if (y.enabled === !1) continue;
    const g = mr(e.state.objects, y).position || [0, 0, 0], [v, S] = m(g[0], g[2]);
    if (Math.hypot(a - v, o - S) <= 7)
      return { type: "object", object: y, id: y.id };
  }
  return null;
}
function rp(e, t, a, o) {
  if (!e.state.show_radar || t.button != null && t.button !== 0 || t.altKey || t.ctrlKey || t.metaKey || e.isNavigatingFly || e.cameraPathDraw) return !1;
  const r = Ao(e, e.canvas.width, e.canvas.height);
  if (!r) return !1;
  const { rx: n, ry: i, radarSize: c } = r;
  if (a < n || a > n + c || o < i || o > i + c)
    return !1;
  t.preventDefault?.(), t.stopPropagation?.();
  const l = dt(e), p = is(r, a, o);
  if (p)
    return p === "zoom_in" ? (l.rangeIndex === -1 && (l.rangeIndex = qe.findIndex((f) => f >= r.range), l.rangeIndex < 0 && (l.rangeIndex = qe.length - 1)), l.rangeIndex = Math.max(0, (l.rangeIndex === -1 ? 2 : l.rangeIndex) - 1)) : p === "zoom_out" ? (l.rangeIndex === -1 && (l.rangeIndex = qe.findIndex((f) => f >= r.range), l.rangeIndex < 0 && (l.rangeIndex = 0)), l.rangeIndex = Math.min(qe.length - 1, l.rangeIndex + 1)) : p === "center" ? l.centerMode = l.centerMode === "camera" ? "origin" : "camera" : p === "size" && (l.expanded = !l.expanded), e.render?.(), !0;
  const m = cs(e, r, a, o);
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
  const [h, d] = Jo(r, a, o);
  if (t.shiftKey) {
    e.checkpoint?.("Set target via radar"), e.beginCameraEdit?.();
    const f = e.viewportCamera();
    f.target = [h, f.target?.[1] || 0, d], e.commitCameraEdit?.();
  } else {
    e.checkpoint?.("Set camera via radar"), e.beginCameraEdit?.();
    const f = e.viewportCamera();
    f.position = [h, f.position?.[1] || 1.5, d], e.commitCameraEdit?.();
  }
  return e.setFrame?.(e.frame, !1, !1), e.render?.(), !0;
}
function np(e, t, a, o) {
  if (!e.state.show_radar || e.drag || e.boxSelection || e.gizmoDrag || e.keyDrag || e.cameraPathDraw || e.pathDrag || e.timelineDrag || e.curveDrag)
    return !1;
  const r = Ao(e, e.canvas.width, e.canvas.height);
  if (!r) return !1;
  const n = dt(e), { rx: i, ry: c, radarSize: l } = r, p = a >= i && a <= i + l && o >= c && o <= c + l;
  if (n.drag) {
    const [b, y] = Jo(r, a, o), g = e.viewportCamera();
    return n.drag.type === "camera" ? g.position = [b, g.position?.[1] || 1.5, y] : n.drag.type === "target" && (g.target = [b, g.target?.[1] || 0, y]), e.setFrame?.(e.frame, !1, !1), e.render?.(), !0;
  }
  if (!p)
    return n.hover && (n.hover = null, e.render?.()), !1;
  const m = is(r, a, o), h = cs(e, r, a, o), [d, f] = Jo(r, a, o);
  let u = `[${d.toFixed(1)}m, ${f.toFixed(1)}m]`;
  return m === "zoom_in" ? u = s("Zoom in (+)") : m === "zoom_out" ? u = s("Zoom out (−)") : m === "center" ? u = n.centerMode === "camera" ? s("Center: Cam") : s("Center: World") : m === "size" ? u = n.expanded ? s("Compact mode") : s("Expand radar") : h?.type === "camera" ? u = s("Camera (drag to move)") : h?.type === "target" ? u = s("Look-At Target (drag to move)") : h?.type === "keyframe" ? u = `${s("Keyframe")} F${h.frame}` : h?.type === "object" && (u = h.object.name || h.object.type || s("Object")), n.hover = {
    button: m,
    hit: h,
    px: a,
    pz: o,
    text: u
  }, e.interactionElement?.style && (e.interactionElement.style.cursor = m || h ? "pointer" : "crosshair"), e.render?.(), !0;
}
function Ko(e, t) {
  const a = e._minimapState;
  return !a || !a.drag ? !1 : (e.commitCameraEdit?.(), a.drag = null, e.interactionElement?.style && (e.interactionElement.style.cursor = "default"), e.render?.(), !0);
}
function sp(e, t, a, o) {
  if (!e.state.show_radar) return !1;
  const r = Ao(e, e.canvas.width, e.canvas.height);
  if (!r) return !1;
  const { rx: n, ry: i, radarSize: c } = r;
  if (a < n || a > n + c || o < i || o > i + c)
    return !1;
  t.preventDefault?.(), t.stopPropagation?.();
  const l = dt(e), p = Math.sign(t.deltaY || 0);
  return l.rangeIndex === -1 && (l.rangeIndex = qe.findIndex((m) => m >= r.range), l.rangeIndex < 0 && (l.rangeIndex = 2)), p > 0 ? l.rangeIndex = Math.min(qe.length - 1, l.rangeIndex + 1) : p < 0 && (l.rangeIndex = Math.max(0, l.rangeIndex - 1)), e.render?.(), !0;
}
function ip(e, t, a) {
  for (const d of ["object-x", "object-y", "object-z", "object-px", "object-py", "object-pz", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz", "object-intensity", "object-cone-angle", "object-penumbra", "object-cast-shadow"])
    for (const f of e.root.querySelectorAll(`[data-role="${d}"]`))
      f.addEventListener("input", () => e.updateSelectedObject(), { signal: a }), f.addEventListener("change", () => e.updateSelectedObject(), { signal: a });
  for (const d of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"])
    for (const f of e.root.querySelectorAll(`[data-role="${d}"]`))
      f.addEventListener("input", () => e.updateCameraFromHud(), { signal: a }), f.addEventListener("change", () => e.updateCameraFromHud(), { signal: a });
  for (const d of ["camera-rx", "camera-ry", "camera-rz"])
    for (const f of e.root.querySelectorAll(`[data-role="${d}"]`))
      f.addEventListener("input", () => e.updateCameraRotationFromHud(), { signal: a }), f.addEventListener("change", () => e.updateCameraRotationFromHud(), { signal: a });
  t('[data-role="animation-select"]')?.addEventListener("change", (d) => e.selectObjectAnimation(Number(d.target.value)), { signal: a }), t('[data-role="object-parent"]')?.addEventListener("change", (d) => e.setObjectParent(d.target.value || null), { signal: a });
  const o = () => {
    const d = e.selectedObject?.();
    if (!d || d.locked) return;
    e.checkpoint?.("Edit labels");
    const f = Qs(t('[data-role="object-tags"]')?.value || "");
    f.length ? d.tags = f : delete d.tags;
    const u = String(t('[data-role="object-annotation"]')?.value || "").trim(), b = u ? Cn({
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
  }, { signal: a }), jl(e, a), Jl(e, a), t('[data-role="curve-group"]')?.addEventListener("change", () => {
    e.setChannelFilter("all"), Gn(e), e.drawCurveEditor(), gr(e);
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
  }, { signal: a }), r.addEventListener("dblclick", (d) => e.onCurveDoubleClick?.(d), { signal: a }), r.addEventListener("wheel", (d) => zl(e, d), { passive: !1, signal: a })), t('[data-act="curve-zoom-in"]')?.addEventListener("click", () => e.zoomCurve(1.25), { signal: a }), t('[data-act="curve-zoom-out"]')?.addEventListener("click", () => e.zoomCurve(0.8), { signal: a }), t('[data-act="curve-fit"]')?.addEventListener("click", () => e.resetCurveZoom(), { signal: a }), t('[data-role="key-frame"]')?.addEventListener("change", (d) => e.retimeSelectedKey(Number(d.target.value)), { signal: a });
  for (const d of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"])
    t(`[data-role="${d}"]`)?.addEventListener("change", () => e.updateSelectedKey(), { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="ui-density"]'))
    d.addEventListener("change", (f) => e.setDensity(f.target.value), { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="preview-layout"]'))
    d.addEventListener("change", (f) => {
      e.state.preview_layout = f.target.value, e.scheduleSerialize(), e.refreshCameraPreviews(), e.renderCameraView(), e.setStatus(`Preview layout: ${f.target.value}`);
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
    d.addEventListener("change", (f) => {
      e.setCameraTrackingTarget(f.target.value);
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="camera-aim-bone"]'))
    d.addEventListener("change", (f) => {
      e.setAimBone(f.target.value);
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-act="focus-target"]'))
    d.addEventListener("click", () => {
      e.focusCameraTarget(), e.closeMenus();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="gizmo-space"]'))
    d.addEventListener("change", (f) => {
      e.state.gizmo_space = f.target.value;
      for (const u of e.root.querySelectorAll('[data-role="gizmo-space"]')) u.value = f.target.value;
      e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="navigation-profile"]'))
    d.addEventListener("change", (f) => {
      e.state.navigation_profile = ["blender", "simple"].includes(f.target.value) ? f.target.value : "maya", e.scheduleSerialize(), e.setStatus(`Navigation: ${e.state.navigation_profile}`);
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="spatial-snap-mode"]'))
    d.addEventListener("change", (f) => {
      e.state.spatial_snap_mode = ["grid", "vertex"].includes(f.target.value) ? f.target.value : "none", e.scheduleSerialize(), e.setStatus(`Spatial Snap: ${e.state.spatial_snap_mode}`);
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="spatial-grid-size"]'))
    d.addEventListener("change", (f) => {
      e.state.spatial_grid_size = Math.max(0.01, Math.min(100, Number(f.target.value) || 0.5)), f.target.value = String(e.state.spatial_grid_size), e.scheduleSerialize();
    }, { signal: a });
  for (const d of e.root.querySelectorAll('[data-role="view-mode"]'))
    d.addEventListener("change", (f) => e.setViewMode(f.target.value), { signal: a });
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
  const c = (d, f) => {
    const u = d instanceof HTMLElement ? d.closest(".scene-item") : null;
    if (!(!u || f.button === 2 || d.closest(".scene-action-btn")))
      if (u.dataset.objectId) {
        const b = e.state.objects.find((g) => g.id === u.dataset.objectId);
        if (!b) return;
        if (e.finishCameraEdit(), e.selectedObjectIds ||= /* @__PURE__ */ new Set(), f.ctrlKey || f.metaKey)
          e.selectedObjectIds.has(b.id) ? e.selectedObjectIds.delete(b.id) : e.selectedObjectIds.add(b.id), e.outlinerAnchorId = b.id;
        else if (f.shiftKey && e.outlinerAnchorId && e.state.objects.some((g) => g.id === e.outlinerAnchorId)) {
          const g = e.state.objects.map((x) => x.id), v = g.indexOf(e.outlinerAnchorId), S = g.indexOf(b.id);
          e.selectedObjectIds = new Set(g.slice(Math.min(v, S), Math.max(v, S) + 1));
        } else
          e.selectedObjectIds = /* @__PURE__ */ new Set([b.id]), e.outlinerAnchorId = b.id;
        e.selectedObjectId = e.selectedObjectIds.has(b.id) ? b.id : [...e.selectedObjectIds].at(-1) || null, e.selectedEntity = e.selectedObjectIds.size ? "object" : "camera", e.selectedKeyFrame = e.selectedObjectId ? b.keyframes?.find((g) => g.frame === e.frame)?.frame ?? null : null, e.editingKeyFrame = null;
        for (const g of e.root.querySelectorAll(".scene-item")) {
          const v = !!(g.dataset.objectId && e.selectedObjectIds.has(g.dataset.objectId)), S = !!(g.dataset.objectId && g.dataset.objectId === e.selectedObjectId);
          g.classList.toggle("selected", v), g.classList.toggle("primary", S), g.setAttribute("aria-selected", String(v));
        }
        const y = e.root.querySelector('[data-role="outliner-batch-bar"]');
        if (y) {
          const g = e.selectedObjectIds?.size || 0;
          y.hidden = g < 2;
          const v = y.querySelector('[data-role="batch-count"]');
          v && (v.textContent = `${g} ${s("selected")}`);
        }
        e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Selected: ${b.name || b.type}`));
      } else u.dataset.cameraId && e.activateCamera(u.dataset.cameraId);
  };
  e.root.addEventListener("pointerdown", (d) => {
    c(d.composedPath?.()[0] || d.target, d);
  }, { capture: !0, signal: a }), e.root.addEventListener("pointerdown", (d) => {
    const f = d.composedPath?.()[0] || d.target;
    f instanceof HTMLElement && f.closest(".context-menu, [data-role='context-menu']") || (d.stopPropagation(), f instanceof HTMLElement && !f.closest(".toolbar-menu") && e.closeMenus(), f instanceof HTMLElement && !f.closest(".key,.key-editor,canvas") && e.exitKeyEdit(!0), (!(f instanceof HTMLElement) || !f.closest("input,select,textarea,button,[contenteditable=true]")) && e.root.focus({ preventScroll: !0 }));
  }, { signal: a }), document.addEventListener("pointerdown", (d) => {
    const f = d.composedPath?.()[0] || d.target;
    f instanceof HTMLElement && f.closest(".context-menu, [data-role='context-menu']") || (!(f instanceof Node) || !e.root.contains(f)) && (e.closeMenus(), e.exitKeyEdit(!0));
  }, { capture: !0, signal: a }), e.root.addEventListener("mousedown", (d) => d.stopPropagation(), { signal: a }), e.root.addEventListener("contextmenu", (d) => e.onContextMenu(d), { signal: a }), e.interactionElement?.addEventListener("pointerdown", (d) => {
    const f = e.interactionElement.getBoundingClientRect(), u = (d.clientX - f.left) * e.canvas.width / Math.max(1, f.width), b = (d.clientY - f.top) * e.canvas.height / Math.max(1, f.height);
    rp(e, d, u, b) || e.onPointerDown(d);
  }, { signal: a }), e.interactionElement?.addEventListener("pointermove", (d) => {
    const f = e.interactionElement.getBoundingClientRect(), u = (d.clientX - f.left) * e.canvas.width / Math.max(1, f.width), b = (d.clientY - f.top) * e.canvas.height / Math.max(1, f.height);
    np(e, d, u, b) || e.onPointerMove(d);
  }, { signal: a }), e.interactionElement?.addEventListener("pointerup", (d) => {
    Ko(e) || e.onPointerUp(d);
  }, { signal: a }), e.interactionElement?.addEventListener("pointercancel", (d) => {
    Ko(e), e.onPointerUp(d);
  }, { signal: a }), e.interactionElement?.addEventListener("lostpointercapture", (d) => {
    Ko(e), e.onPointerUp(d);
  }, { signal: a }), e.interactionElement?.addEventListener("dblclick", (d) => e.setTargetAtCursor(d), { signal: a }), e.interactionElement?.addEventListener("wheel", (d) => {
    const f = e.interactionElement.getBoundingClientRect(), u = (d.clientX - f.left) * e.canvas.width / Math.max(1, f.width), b = (d.clientY - f.top) * e.canvas.height / Math.max(1, f.height);
    sp(e, d, u, b) || e.onWheel(d);
  }, { passive: !1, signal: a }), e.root.addEventListener("wheel", cl(e.root), { signal: a }), window.addEventListener("pointermove", (d) => {
    e.keyDrag && e.onPointerMove(d);
  }, { capture: !0, signal: a }), window.addEventListener("pointerup", (d) => {
    e.keyDrag && e.onPointerUp(d);
  }, { capture: !0, signal: a }), window.addEventListener("pointercancel", (d) => {
    e.keyDrag && e.onPointerUp(d);
  }, { capture: !0, signal: a });
  const l = t('[data-role="dope-tracks"]');
  l && (l.addEventListener("pointerdown", (d) => e.onTimelinePointerDown(d), { signal: a }), l.addEventListener("pointermove", (d) => e.onTimelinePointerMove(d), { signal: a }), l.addEventListener("pointerup", (d) => e.onTimelinePointerUp(d), { signal: a }), l.addEventListener("pointercancel", (d) => e.onTimelinePointerUp(d), { signal: a }), l.addEventListener("wheel", (d) => jn(e, d), { passive: !1, signal: a }));
  const p = (d) => {
    const f = ei(d.composedPath?.()[0] || d.target);
    f && (e.lastKeyZone = f);
  };
  e.root.addEventListener("focusin", p, { signal: a }), e.root.addEventListener("pointerdown", p, { capture: !0, signal: a }), e.root.addEventListener("focusout", (d) => {
    e.modalTransform && !e.root.contains(d.relatedTarget) && (Js(e), e.render());
  }, { signal: a });
  const m = new ResizeObserver(() => {
    e.scheduleResizeAndRender();
  }), h = e.root.querySelector(".viewport-wrap");
  h && m.observe(h), e.resizeObserver = m, e.updateEditState();
}
const cp = "🔘", on = [
  { id: "nav", label: () => s("Navigation & Controls"), icon: "pi-compass" },
  { id: "view", label: () => s("Display & Viewport"), icon: "pi-eye" },
  { id: "time", label: () => s("Timeline & Keys"), icon: "pi-clock" },
  { id: "defaults", label: () => s("Defaults & Pipeline"), icon: "pi-sliders-h" }
];
function lp(e, t) {
  pr.find((o) => o.id === e)?.onChange?.(t);
}
function dp(e) {
  const t = Wi(e.id, e.defaultValue), a = `pref_${e.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
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
function mp(e) {
  const t = new Map(pr.map((o) => [o.id, o]));
  return ({
    nav: [
      Fi,
      zi,
      Ni,
      Ri,
      Ki,
      Di,
      Bi,
      qi,
      Ui
    ],
    view: [
      xi,
      wi,
      ki,
      Si,
      ji,
      _i,
      Ci,
      Ei,
      Ai,
      $i,
      Mi,
      Ti,
      Ii,
      Oi,
      Pi,
      Li
    ],
    time: [
      fi,
      hi,
      ui,
      bi,
      gi,
      yi,
      vi
    ],
    defaults: [
      oi,
      ri,
      ni,
      si,
      ii,
      ci,
      li,
      di,
      mi,
      pi
    ]
  }[e] || []).map((o) => t.get(o)).filter(Boolean);
}
function pp() {
  return `<span class="oc-pref-emoji" aria-hidden="true">${cp}</span> ${s("OmniCam Preferences")}`;
}
function fp(e) {
  const t = e.root.querySelector(".oc-modal-backdrop");
  if (t) {
    t.querySelector(".oc-pref-dialog")?.focus();
    return;
  }
  const a = document.createElement("div");
  a.className = "oc-modal-backdrop", a.setAttribute("role", "dialog"), a.setAttribute("aria-modal", "true"), a.setAttribute("aria-label", s("OmniCam Preferences")), a.innerHTML = `
    <div class="oc-modal-dialog oc-pref-dialog" tabindex="-1">
      <div class="oc-pref-header">
        <div class="oc-pref-title">${pp()}</div>
        <button type="button" class="icon-button oc-pref-close" title="${s("Close")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="oc-pref-tabs">
        ${on.map((r, n) => `
          <button type="button" class="oc-pref-tab ${n === 0 ? "active" : ""}" data-tab="${r.id}">
            <i class="pi ${r.icon}"></i> <span>${r.label()}</span>
          </button>
        `).join("")}
      </div>
      <div class="oc-pref-content">
        ${on.map((r, n) => `
          <div class="oc-pref-pane ${n === 0 ? "active" : ""}" data-pane="${r.id}">
            ${mp(r.id).map(dp).join("")}
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
    ti(i, c), lp(i, c);
  }), a.querySelector('[data-pref-act="reset-defaults"]')?.addEventListener("click", () => {
    ai();
    for (const r of pr) {
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
function hp(e, t, a) {
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
  for (const o of e.root.querySelectorAll("[data-interp]"))
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
      e.closeMenus(), fp(e);
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
const up = ["position", "target"], bp = ["fov", "zoom"], gp = ["roll"], yp = ["position", "size"], vp = ["rotation"];
function Qo(e) {
  return ((e + 540) % 360 + 360) % 360 - 180;
}
function rn(e, t, a, o) {
  const r = [0, 1, 2].map((n) => Number(e[n] || 0) + (Number(a[n] || 0) - Number(e[n] || 0)) * o);
  return Array.isArray(t) ? [0, 1, 2].map((n) => (2 * r[n] + Number(t[n] || 0)) / 3) : r;
}
function xp(e, t, a, o) {
  const r = Number(e || 0) + (Number(a || 0) - Number(e || 0)) * o;
  return t == null ? r : (2 * r + Number(t || 0)) / 3;
}
function nn(e, t, a, o) {
  const r = Qo(Number(a || 0) - Number(e || 0)), n = Number(e || 0) + r * o;
  if (t == null) return n;
  const i = Qo(Number(t || 0) - n);
  return n + i / 3;
}
function sn(e, t, a) {
  return e.map((o, r) => o + (t[r] - o) * a);
}
function wp(e, t, a) {
  return e + (t - e) * a;
}
function cn(e, t, a) {
  return e + Qo(t - e) * a;
}
function kp(e, t) {
  const a = (e || []).map((r) => ({
    ...r,
    ...r.camera ? { camera: { ...r.camera } } : {}
  })), o = Math.min(1, Math.max(0, Number(t) || 0));
  if (o === 0 || a.length < 3) return a;
  for (let r = 1; r < a.length - 1; r++) {
    const n = e[r - 1], i = e[r], c = e[r + 1], l = c.frame - n.frame, p = l !== 0 ? (i.frame - n.frame) / l : 0.5;
    if (i.camera) {
      for (const m of up) {
        const h = n.camera?.[m], d = i.camera?.[m], f = c.camera?.[m];
        if (Array.isArray(h) && Array.isArray(f) && Array.isArray(d)) {
          const u = rn(h, d, f, p);
          a[r].camera[m] = sn(d.map(Number), u, o);
        }
      }
      for (const m of bp) {
        const h = n.camera?.[m], d = i.camera?.[m], f = c.camera?.[m];
        if (h != null && f != null && d != null) {
          const u = xp(h, d, f, p);
          a[r].camera[m] = wp(Number(d), u, o);
        }
      }
      for (const m of gp) {
        const h = n.camera?.[m], d = i.camera?.[m], f = c.camera?.[m];
        if (h != null && f != null && d != null) {
          const u = nn(h, d, f, p);
          a[r].camera[m] = cn(Number(d), u, o);
        }
      }
    }
    if (Array.isArray(i.position) && Array.isArray(n.position) && Array.isArray(c.position)) {
      for (const m of yp) {
        const h = n[m], d = i[m], f = c[m];
        if (Array.isArray(h) && Array.isArray(f) && Array.isArray(d)) {
          const u = rn(h, d, f, p);
          a[r][m] = sn(d.map(Number), u, o);
        }
      }
      for (const m of vp) {
        const h = n[m], d = i[m], f = c[m];
        if (Array.isArray(h) && Array.isArray(f) && Array.isArray(d)) {
          const u = [0, 1, 2].map((b) => nn(h[b], d[b], f[b], p));
          a[r][m] = d.map((b, y) => cn(Number(b), u[y], o));
        }
      }
    }
  }
  return a;
}
function Sp(e) {
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
const jp = 0.05, _p = 5e-3, Cp = 0.5;
function Ep(e, t) {
  const a = e.root;
  if (!a) return;
  const o = (r) => {
    if (r.button !== 0 || r.target.tagName === "INPUT" || r.target.tagName === "SELECT") return;
    const n = r.target.closest(".oc-axis");
    if (!n) return;
    const i = n.querySelector("input[type=number]");
    if (!i || i.disabled || i.readOnly) return;
    r.preventDefault(), r.stopPropagation();
    const c = r.clientX, l = parseFloat(i.value) || 0, p = parseFloat(i.getAttribute("step")) || 0.1, m = i.hasAttribute("min") ? parseFloat(i.getAttribute("min")) : -1 / 0, h = i.hasAttribute("max") ? parseFloat(i.getAttribute("max")) : 1 / 0;
    let d = !1, f = !1;
    if (n.classList.add("scrubbing"), document.body.style.cursor = "ew-resize", n.setPointerCapture)
      try {
        n.setPointerCapture(r.pointerId);
      } catch {
      }
    const u = (y) => {
      const g = y.clientX - c;
      if (Math.abs(g) > 2 && (d = !0), !d) return;
      f || (e.checkpoint?.("Scrub axis"), f = !0);
      let v = jp;
      y.shiftKey ? v = _p : (y.ctrlKey || y.metaKey) && (v = Cp);
      const S = p * v * 20;
      let x = l + g * S;
      x = Math.max(m, Math.min(h, x));
      const A = p >= 1 ? 0 : p >= 0.1 ? 1 : 2;
      i.value = x.toFixed(A), i.dispatchEvent(new Event("input", { bubbles: !0 })), i.dispatchEvent(new Event("change", { bubbles: !0 }));
    }, b = (y) => {
      if (n.classList.remove("scrubbing"), document.body.style.cursor = "", n.removeEventListener("pointermove", u), n.removeEventListener("pointerup", b), n.removeEventListener("pointercancel", b), n.releasePointerCapture)
        try {
          n.releasePointerCapture(y.pointerId);
        } catch {
        }
      d && (e.serialize?.(), e.render?.());
    };
    n.addEventListener("pointermove", u), n.addEventListener("pointerup", b), n.addEventListener("pointercancel", b);
  };
  a.addEventListener("pointerdown", o, { signal: t });
}
function Ap(e, t) {
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
      const h = l[m] !== void 0 ? l[m] : 0;
      p.value = String(h), p.dispatchEvent(new Event("input", { bubbles: !0 })), p.dispatchEvent(new Event("change", { bubbles: !0 }));
    }), e.serialize?.(), e.render?.(), e.setStatus?.(s("Reset {target}").replace("{target}", n || "vector"));
  }, { signal: t });
}
function ls(e) {
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
  l && o?.fov != null && (l.textContent = `${ur(o.fov)}mm`);
  const p = t.querySelector('[data-role="hud-cam-fov"]');
  p && o?.fov != null && (p.textContent = Tc(o.fov));
  const m = t.querySelector('[data-role="hud-cam-dist"]');
  if (m)
    if (o?.target && Array.isArray(o.target) && Array.isArray(o.position)) {
      const u = On(Pn(o.position, o.target));
      m.textContent = `Tgt: ${u.toFixed(2)}m`;
    } else
      m.textContent = "Free";
  const h = t.querySelector('[data-role="hud-roll-reset"]'), d = t.querySelector('[data-role="hud-roll-val"]'), f = Number(o?.roll || 0);
  h && (Math.abs(f) > 0.05 ? (h.hidden = !1, d && (d.textContent = `${f > 0 ? "+" : ""}${f.toFixed(1)}°`)) : h.hidden = !0);
}
function $p(e) {
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
function Te(e) {
  const t = e.root.querySelector('[data-role="gizmo-space-badge"]');
  if (t) {
    const d = e.state.gizmo_space === "local";
    t.textContent = d ? "L" : "W";
    const f = t.closest('[data-role="gizmo-space-toggle"]');
    f && (f.classList.toggle("active", d), f.title = d ? s("Transform Space: Local (click for World)") : s("Transform Space: World (click for Local)"));
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
  const m = e.root.querySelector('[data-role="shading-mode-select"]'), h = typeof document < "u" && document.activeElement === m;
  m && !h && (m.value = e.state.render_mode || "omni_ref");
}
function Mp(e, t) {
  for (const o of e.root.querySelectorAll('[data-act="toggle-camera-lock"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle camera lock"), e.state.camera_lock = !e.state.camera_lock, e.serialize?.(), ls(e), e.setStatus?.(e.state.camera_lock ? s("Camera View locked") : s("Camera View unlocked"));
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
      e.serialize?.(), Te(e), e.requestRender?.(), e.setStatus?.(s("Transform space: {space}").replace("{space}", e.state.gizmo_space));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-spatial-snap"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle snapping");
      const n = e.state.spatial_snap_mode || "none";
      e.state.spatial_snap_mode = n === "none" ? "grid" : "none";
      for (const i of e.root.querySelectorAll('[data-role="spatial-snap-mode"]'))
        i.value = e.state.spatial_snap_mode;
      e.serialize?.(), Te(e), e.setStatus?.(s("Snapping: {mode}").replace("{mode}", e.state.spatial_snap_mode));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-grid-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle grid overlay"), e.state.show_grid = e.state.show_grid === !1, e.serialize?.(), Te(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-wireframe-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle wireframe overlay"), e.state.show_wireframe = !e.state.show_wireframe;
      for (const n of e.root.querySelectorAll('[data-role="show-wireframe"]')) n.checked = !!e.state.show_wireframe;
      e.serialize?.(), Te(e), e.requestRender?.(), e.setStatus?.(e.state.show_wireframe ? s("Wireframe overlay: On") : s("Wireframe overlay: Off"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-cull-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle backface culling"), e.state.backface_culling = !e.state.backface_culling;
      for (const n of e.root.querySelectorAll('[data-role="backface-culling"]')) n.checked = !!e.state.backface_culling;
      e.serialize?.(), Te(e), e.webgl && (e.webgl.sceneKey = ""), e.requestRender?.(), e.setStatus?.(e.state.backface_culling ? s("Backface culling: On (Single-Sided)") : s("Backface culling: Off (Double-Sided)"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-gizmo-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle gizmo overlay"), e.state.show_gizmo = e.state.show_gizmo === !1, e.serialize?.(), Te(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-guides-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle guides overlay"), e.state.guides = e.state.guides === !1, e.serialize?.(), Te(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-safe-areas-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle safe areas overlay"), e.state.safe_areas = !e.state.safe_areas, e.serialize?.(), Te(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-radar-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle radar overlay"), e.state.show_radar = !e.state.show_radar, e.serialize?.(), Te(e), e.requestRender?.();
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
function Tp(e, t) {
  const a = e.root.querySelector('[data-role="camera-focal"]'), o = e.root.querySelector('[data-role="camera-fov"]'), r = e.root.querySelector('[data-role="camera-sensor-preset"]');
  !a || !o || (r && r.addEventListener("change", () => {
    const n = Ic[r.value];
    if (n && a) {
      const i = Fr(a.value, n.height);
      o.value = String(Math.round(i * 100) / 100), o.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
  }, { signal: t }), a.addEventListener("input", () => {
    const n = Fr(a.value);
    o.value = String(Math.round(n * 100) / 100), o.dispatchEvent(new Event("input", { bubbles: !0 }));
  }, { signal: t }), o.addEventListener("input", () => {
    document.activeElement !== a && (a.value = ur(o.value));
  }, { signal: t }));
}
function Ip(e, t) {
  const a = e.root.querySelector('[data-role="path-smoothing"]'), o = e.root.querySelector('[data-role="path-smoothing-value"]');
  if (!a) return;
  const r = () => {
    o && (o.textContent = `${a.value}%`);
  }, n = (i) => (e.smoothingBaseline?.cameraId !== i.id && (e.smoothingBaseline = { cameraId: i.id, keys: Sp(i.keyframes) }), e.smoothingBaseline.keys);
  a.addEventListener("input", r, { signal: t }), a.addEventListener("change", () => {
    const i = e.activeCameraTrack();
    if (!i) return;
    e.checkpoint("Path smoothing");
    const c = Number(a.value) / 100, l = kp(n(i), c);
    i.keyframes = l, e.state.keyframes = l, e.state.path_smoothing = c, e.syncActiveCameraTrack(), e.refreshKeys(), e.setFrame(e.frame, !1, !1), e.setStatus(c > 0 ? s("Path smoothing set to {percent}%").replace("{percent}", String(a.value)) : s("Path smoothing cleared"));
  }, { signal: t }), r();
}
function Op(e, t) {
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
        fromKeys: p().map((h) => JSON.parse(JSON.stringify(h)))
      }), Number(a.value) === 0 && (e.keySimplifyBaseline = null);
    }, { signal: t }), l();
  }
  e.root.querySelector('[data-act="keys-reduce"]')?.addEventListener("click", async () => {
    const l = await zt(e, s("Reduce keys"), s("Target number of keys"), "8"), p = Math.round(Number(l));
    Number.isFinite(p) && p >= 2 && (e.simplifyActiveKeys({ mode: "reduce", target: p, scope: r?.value || "camera" }), e.keySimplifyBaseline = null);
  }, { signal: t }), e.root.querySelector('[data-act="keys-clean"]')?.addEventListener("click", () => {
    e.simplifyActiveKeys({ mode: "clean", scope: r?.value || "camera" }), e.keySimplifyBaseline = null;
  }, { signal: t });
}
function Pp(e, t) {
  const a = e.root.querySelector('[data-role="outliner-search"]');
  a && a.addEventListener("input", () => {
    e.outlinerFilter = a.value.trim().toLowerCase(), e.refreshObjects();
  }, { signal: t });
}
function Lp(e, t) {
  const a = [...e.root.querySelectorAll("[data-dope-channel]")];
  if (a.length) {
    e.dopeChannels = new Set(a.filter((o) => o.checked).map((o) => o.dataset.dopeChannel));
    for (const o of a)
      o.addEventListener("change", () => {
        e.dopeChannels = new Set(a.filter((r) => r.checked).map((r) => r.dataset.dopeChannel)), Bn(e);
      }, { signal: t });
  }
}
function Fp(e, t) {
  e.root.querySelector('[data-act="import-extractor-camera"]')?.addEventListener("click", () => {
    Oc(e);
  }, { signal: t }), e.root.querySelector('[data-act="dismiss-extractor-camera"]')?.addEventListener("click", () => {
    Pc(e);
  }, { signal: t });
}
function zp(e, t) {
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
const so = () => import("./chunk-Bir75_vH.js");
function Np(e, t) {
  so().then(({ loadExchangeFormats: o }) => o(e, t)), e.root.querySelector('[data-act="import-camera"]')?.addEventListener("click", async () => {
    (await so()).pickCameraFile(e);
  }, { signal: t }), e.root.querySelector('[data-act="export-camera"]')?.addEventListener("click", async () => {
    (await so()).exportCamera(e);
  }, { signal: t }), e.root.querySelector('[data-role="camera-file"]')?.addEventListener("change", async (o) => {
    const r = o.target.files?.[0];
    o.target.value = "", await (await so()).importCameraFile(e, r);
  }, { signal: t });
}
function Rp(e, t) {
  const a = e.root.querySelector('[data-role="health-profile"]');
  if (!a) return;
  const o = () => {
    Lo(e), e.refreshKeys();
  };
  Vi().then((r) => {
    if (e.abortController?.signal.aborted) return;
    if (!Array.isArray(r?.profiles) || r.profiles.length === 0) {
      e.motionProfiles = null, Lo(e);
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
      Hi(e, l, p);
      return;
    }
    const i = r.target.closest("[data-zone-start]");
    if (i) {
      e.setFrame(Number(i.dataset.zoneStart), !1, !1);
      return;
    }
    const c = r.target.closest("[data-act]")?.dataset.act;
    c === "health-slow" ? Gi(e) : c === "health-smooth" ? Yi(e) : c === "health-recenter" && Xi(e);
  }, { signal: t });
  for (const r of e.root.querySelectorAll('[data-tab="health"]'))
    r.addEventListener("click", () => Lo(e), { signal: t });
}
function Kp(e, t) {
  const a = e.root.querySelector('[data-role="outliner-filter-chips"]');
  a && a.addEventListener("click", (o) => {
    const r = o.target.closest(".oc-chip");
    r && (e.outlinerCategoryFilter = r.dataset.filter || "all", e.refreshObjects());
  }, { signal: t });
}
function Dp(e, t) {
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
function Bp(e, t) {
  const a = e.root.querySelector('[data-role="outliner-batch-bar"]');
  a && a.addEventListener("click", (o) => {
    const r = o.target.closest("[data-act]");
    r && (r.dataset.act === "batch-toggle-visibility" ? e.toggleSelectedObjects?.() : r.dataset.act === "batch-toggle-lock" ? e.lockSelectedObjects?.() : r.dataset.act === "batch-duplicate" ? e.duplicateSelectedObjects?.() : r.dataset.act === "batch-delete" ? e.deleteSelectedObjects?.() : r.dataset.act === "batch-deselect" && e.deselectAll?.());
  }, { signal: t });
}
function qp(e, t) {
  Np(e, t), Tp(e, t), Ip(e, t), Op(e, t), Pp(e, t), Kp(e, t), Bp(e, t), Dp(e, t), Ep(e, t), Ap(e, t), Lp(e, t), zp(e, t), Mp(e, t), Fp(e, t), Rp(e, t);
}
const ln = {
  low: { shadows: !0, shadowSize: 1024, toneExposure: 0.9, renderScale: 1 },
  balanced: { shadows: !0, shadowSize: 2048, toneExposure: 0.95, renderScale: 1.25 },
  high: { shadows: !0, shadowSize: 4096, toneExposure: 1, renderScale: 1.5 }
}, ds = "balanced", Do = "#121212";
function xr(e) {
  return ln[e] || ln[ds];
}
function Up(e, t = "#1b1f2b", a = "#151822", o = "#1e2330", r = "#161922", n = "#111319") {
  const i = document.createElement("canvas");
  i.width = 8, i.height = 256;
  const c = i.getContext("2d"), l = c.createLinearGradient(0, 0, 0, i.height);
  l.addColorStop(0, t), l.addColorStop(0.35, a), l.addColorStop(0.48, o), l.addColorStop(0.52, o), l.addColorStop(0.72, r), l.addColorStop(1, n), c.fillStyle = l, c.fillRect(0, 0, i.width, i.height);
  const p = new e.CanvasTexture(i);
  return p.mapping = e.EquirectangularReflectionMapping, p.colorSpace = e.SRGBColorSpace, p.needsUpdate = !0, p;
}
function Wp(e) {
  const t = document.createElement("canvas");
  t.width = t.height = 256;
  const a = t.getContext("2d"), o = a.createRadialGradient(128, 128, 0, 128, 128, 128);
  o.addColorStop(0, "rgba(255,255,255,0.22)"), o.addColorStop(0.3, "rgba(255,255,255,0.13)"), o.addColorStop(0.65, "rgba(255,255,255,0.035)"), o.addColorStop(1, "rgba(255,255,255,0)"), a.fillStyle = o, a.fillRect(0, 0, 256, 256);
  const r = new e.CanvasTexture(t);
  return r.colorSpace = e.SRGBColorSpace, r.needsUpdate = !0, r;
}
function vb(e, t, a = ds) {
  const o = xr(a), r = new e.Group();
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
  const m = Wp(e), h = new e.Mesh(
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
  h.rotation.x = -Math.PI / 2, h.position.y = -3e-3, h.name = "omnicam-studio-floor", r.add(h);
  const d = new e.Mesh(
    new e.PlaneGeometry(180, 180),
    new e.ShadowMaterial({ opacity: 0.38, transparent: !0, depthWrite: !1 })
  );
  d.rotation.x = -Math.PI / 2, d.position.y = -1e-3, d.receiveShadow = !0, d.name = "omnicam-shadow-catcher", r.add(d);
  const f = new e.FogExp2(1250588, 8e-3), u = Up(e), b = new e.PMREMGenerator(t);
  b.compileEquirectangularShader();
  const y = new pl(), g = b.fromScene(y, 0.04).texture;
  return y.traverse((v) => {
    v.geometry?.dispose?.();
    const S = Array.isArray(v.material) ? v.material : [v.material];
    for (const x of S) x?.dispose?.();
  }), {
    group: r,
    key: n,
    fill: c,
    rim: l,
    bounce: p,
    catcher: h,
    shadowCatcher: d,
    floorMap: m,
    sky: u,
    environment: g,
    pmrem: b,
    fog: f,
    quality: a,
    dispose() {
      h.geometry.dispose(), h.material.dispose(), d.geometry.dispose(), d.material.dispose(), m.dispose(), u.dispose(), g.dispose(), b.dispose();
      for (const v of [n, c, l, p]) v.dispose?.();
    }
  };
}
function xb(e, t, a) {
  const o = xr(a);
  return e.quality = a, e.key.shadow.mapSize.set(o.shadowSize, o.shadowSize), e.key.shadow.map?.dispose(), e.key.shadow.map = null, t.toneMappingExposure = o.toneExposure, o;
}
function wb(e, t, a, o, r) {
  o.group.visible = r, t.environment = r ? o.environment : null, t.background = r ? o.sky : new e.Color(1184274), t.fog = r ? o.fog : null, a.toneMapping = r ? e.ACESFilmicToneMapping : e.NoToneMapping, a.toneMappingExposure = r ? xr(o.quality).toneExposure : 1, t.traverse((n) => {
    n.material && (n.material.needsUpdate = !0);
  });
}
function wr(e, t) {
  t && (e.checkpoint?.("Toggle object lock"), t.locked = !t.locked, e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.render?.());
}
function Vp(e) {
  if (!e?.reconstruction) return null;
  const t = e.reconstruction.confidence != null ? Number(e.reconstruction.confidence) : 1;
  let a = "low", o = "Low";
  t >= 0.75 ? (a = "high", o = "High") : t >= 0.45 && (a = "medium", o = "Medium");
  const r = e.reconstruction, n = r.provider || "Reconstructed", i = Math.round(t * 100), c = Lc(e), l = c.length ? `
` + c.map(([m, h]) => `${m}: ${h}`).join(`
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
function Hp(e) {
  return e?.reconstruction_appearance || "source_texture";
}
function kb(e, t, a) {
  return e?.reconstruction ? a ? "neutral" : Hp(t) === "source_texture" ? "textured" : "neutral" : null;
}
function Gp(e, t) {
  e && (e.state || (e.state = {}), e.state.reconstruction_appearance = t === "source_texture" ? "source_texture" : "neutral", e.serialize?.(), e.render?.());
}
function io(e, t, a, o = 300) {
  const r = globalThis.performance?.now?.() ?? Date.now();
  e._groupedCheckpointAt ||= {}, (!Number.isFinite(e._groupedCheckpointAt[t]) || r - e._groupedCheckpointAt[t] > o) && e.checkpoint(a), e._groupedCheckpointAt[t] = r;
}
function Yp(e, t, a) {
  const o = e.root.querySelector('[data-role="viewport-axis"]');
  if (o) {
    const n = (i) => {
      const c = i.target.closest?.("[data-axis], [data-axis-center]") || i.target, l = c.getAttribute("data-axis"), p = Zi(l?.toLowerCase(), e.state.view_mode);
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
      e.camera.camera_type !== i.target.value && e.checkpoint("Change camera type"), e.camera.camera_type = i.target.value, ke(e.root, "camera-type", i.target), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="speed"]')) {
    const i = (c) => {
      const l = X(Number(c.target.value), 0.05, 5);
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
      e.state.point_color !== i.target.value && io(e, "point_color", "Change point color"), e.state.point_color = i.target.value, e.scheduleSerialize(), e.render();
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
      e.state.speed_heatmap !== i.target.checked && e.checkpoint("Toggle speed heatmap"), e.state.speed_heatmap = i.target.checked, ke(e.root, "speed-heatmap", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-grid"]'))
    n.addEventListener("change", (i) => {
      e.state.playblast_grid !== i.target.checked && e.checkpoint("Toggle playblast grid"), e.state.playblast_grid = i.target.checked, ke(e.root, "playblast-grid", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-labels"]'))
    n.addEventListener("change", (i) => {
      e.state.playblast_labels !== i.target.checked && e.checkpoint("Toggle playblast labels"), e.state.playblast_labels = i.target.checked, ke(e.root, "playblast-labels", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-resolution"]'))
    n.addEventListener("change", (i) => {
      e.state.playblast_resolution !== i.target.value && e.checkpoint("Change playblast resolution"), e.state.playblast_resolution = i.target.value, ke(e.root, "playblast-resolution", i.target), e.scheduleSerialize();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-act="reset-bg-color"]'))
    n.addEventListener("click", () => {
      e.state.viewport_bg_color !== Do && e.checkpoint("Reset background colour"), e.state.viewport_bg_color = Do;
      for (const i of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) i.value = Do;
      e.scheduleSerialize(), e.render(), e.setStatus(s("Background colour reset"));
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-grid"]'))
    n.addEventListener("change", (i) => {
      e.state.show_grid = i.target.checked, ke(e.root, "show-grid", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const [n, i] of [
    ["show-camera-paths", "show_camera_paths"],
    ["show-camera-gizmos", "show_camera_gizmos"],
    ["show-look-at", "show_look_at"],
    ["show-helper-axes", "show_helper_axes"]
  ])
    for (const c of e.root.querySelectorAll(`[data-role="${n}"]`))
      c.addEventListener("change", (l) => {
        e.state[i] !== l.target.checked && e.checkpoint("Toggle viewport helper"), e.state[i] = l.target.checked, ke(e.root, n, l.target, "checked"), e.scheduleSerialize(), e.render();
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
      e.state.show_wireframe !== i.target.checked && e.checkpoint("Toggle wireframe"), e.state.show_wireframe = i.target.checked, ke(e.root, "show-wireframe", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-vertices"]'))
    n.addEventListener("change", (i) => {
      e.state.show_vertices !== i.target.checked && e.checkpoint("Toggle vertices"), e.state.show_vertices = i.target.checked, ke(e.root, "show-vertices", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="backface-culling"]'))
    n.addEventListener("change", (i) => {
      !!e.state.backface_culling !== i.target.checked && e.checkpoint("Toggle backface culling"), e.state.backface_culling = i.target.checked, ke(e.root, "backface-culling", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render(), e.setStatus(e.state.backface_culling ? s("Backface culling: On (Single-Sided)") : s("Backface culling: Off (Double-Sided)"));
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
      e.state.burn_in !== i.target.checked && e.checkpoint("Toggle burn-in"), e.state.burn_in = i.target.checked, ke(e.root, "burn-in", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="guides"]'))
    n.addEventListener("change", (i) => {
      e.state.guides !== i.target.checked && e.checkpoint("Toggle guides"), e.state.guides = i.target.checked, ke(e.root, "guides", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="safe-areas"]'))
    n.addEventListener("change", (i) => {
      e.state.safe_areas !== i.target.checked && e.checkpoint("Toggle safe areas"), e.state.safe_areas = i.target.checked, ke(e.root, "safe-areas", i.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="resolution-gate"]'))
    n.addEventListener("change", (i) => {
      e.state.resolution_gate !== i.target.checked && e.checkpoint("Toggle resolution gate"), e.state.resolution_gate = i.target.checked, ke(e.root, "resolution-gate", i.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="aspect-ratio"]'))
    n.addEventListener("change", (i) => {
      e.state.aspect_ratio !== i.target.value && e.checkpoint("Change aspect ratio"), e.state.aspect_ratio = i.target.value, ke(e.root, "aspect-ratio", i.target), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) {
    const i = (c) => {
      e.state.viewport_bg_color !== c.target.value && io(e, "viewport_bg_color", "Change background colour"), e.state.viewport_bg_color = c.target.value, ke(e.root, "viewport-bg-color", c.target), e.scheduleSerialize(), e.render();
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
      i && wr(e, i);
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="reconstruction-appearance"]'))
    n.addEventListener("change", (i) => {
      Gp(e, i.target.value);
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="object-color"]'))
    n.addEventListener("input", (i) => {
      const c = e.selectedObject();
      c && (c.color !== i.target.value && io(e, `object_color:${c.id}`, "Change object color"), c.color = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="object-light-color"]'))
    n.addEventListener("input", (i) => {
      const c = e.selectedObject();
      c && (c.color !== i.target.value && io(e, `object_color:${c.id}`, "Change light color"), c.color = i.target.value, e.scheduleSerialize(), e.render());
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
      Fc(e, Number(n.dataset.lens));
    }, { signal: a });
  for (const n of e.root.querySelectorAll("[data-blocking-scene]"))
    n.addEventListener("click", () => {
      Jm(e, n.dataset.blockingScene), e.closeMenus();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-radar"]'))
    n.addEventListener("change", (i) => {
      e.state.show_radar !== i.target.checked && e.checkpoint("Toggle radar"), e.state.show_radar = i.target.checked, e.scheduleSerialize(), e.render(), e.setStatus(`Radar Mini-Map: ${i.target.checked ? "ON" : "OFF"}`);
    }, { signal: a });
}
const Xp = 32, Zp = 0.025, Jp = 0.05, vo = 1e-6, Qp = ["top", "bottom", "front", "back", "left", "right"], ef = {
  top: "y",
  bottom: "y",
  front: "z",
  back: "z",
  left: "x",
  right: "x"
}, xo = { x: 0, y: 1, z: 2 };
function er(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
function kr(e, t) {
  return Math.hypot(
    (t[0] || 0) - (e[0] || 0),
    (t[1] || 0) - (e[1] || 0),
    (t[2] || 0) - (e[2] || 0)
  );
}
function tf(e) {
  let t = 0;
  for (let a = 1; a < e.length; a++) t += kr(e[a - 1], e[a]);
  return t;
}
function dn(e) {
  const t = Math.max(0, Math.round(Number(e?.duration_frames) || 1) - 1), a = Array.isArray(e?.playback_range) ? e.playback_range : [0, t], o = er(Math.round(Number(a[0]) || 0), 0, t), r = er(Math.round(Number(a[1]) || t), 0, t);
  return o <= r ? [o, r] : [r, o];
}
function af(e, t) {
  if (t <= 2) return [e[0], e.at(-1)].map((i) => [...i]);
  const a = [0];
  for (let i = 1; i < e.length; i++)
    a[i] = a[i - 1] + kr(e[i - 1], e[i]);
  const o = a.at(-1) || 0;
  if (o < vo) return [];
  const r = [];
  let n = 1;
  for (let i = 0; i < t; i++) {
    const c = o * i / (t - 1);
    for (; n < a.length - 1 && a[n] < c; ) n += 1;
    const l = a[n - 1], p = a[n], m = er((c - l) / Math.max(vo, p - l), 0, 1), h = e[n - 1], d = e[n];
    r.push([
      h[0] + (d[0] - h[0]) * m,
      h[1] + (d[1] - h[1]) * m,
      h[2] + (d[2] - h[2]) * m
    ]);
  }
  return r;
}
function ms(e, t = [0, 0, -1]) {
  const a = Math.hypot(e?.[0] || 0, e?.[2] || 0);
  return a < vo ? [...t] : [(e[0] || 0) / a, 0, (e[2] || 0) / a];
}
function ps(e, t) {
  const a = Math.hypot(e[0] || 0, e[1] || 0, e[2] || 0);
  return a < vo ? [...t] : [e[0] / a, e[1] / a, e[2] / a];
}
function of(e, t, a, o) {
  const r = e[Math.max(0, t - 1)], n = e[Math.min(e.length - 1, t + 1)], i = [n[0] - r[0], n[1] - r[1], n[2] - r[2]];
  return o === "y" ? ms(i, a) : ps(i, a);
}
function rf(e, t, a, o) {
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
function nf(e) {
  const [t, a] = e.range, o = a - t;
  if (o < 1) return [];
  const r = e.seedPoint ? [e.seedPoint, ...e.points] : e.points;
  if (r.length < 2) return [];
  const n = Math.min(Xp, r.length, o + 1);
  if (n < 2) return [];
  const i = af(r, n);
  if (i.length < 2) return [];
  const c = e.sourceCamera, l = [
    c.target[0] - c.position[0],
    c.target[1] - c.position[1],
    c.target[2] - c.position[2]
  ], p = e.planeAxis === "y" ? ms(l) : ps(l, [0, 0, -1]), m = e.seedPoint ? 1 : 0, h = [];
  for (let d = m; d < i.length; d++) {
    const f = i[d], u = of(i, d, p, e.planeAxis), b = he(c);
    b.position = [...f], b.target = rf(f, u, l, e.planeAxis), h.push({
      frame: Math.round(t + o * d / (i.length - 1)),
      camera: b,
      interpolation: "smooth"
    });
  }
  return h.filter((d, f, u) => f === 0 || d.frame > u[f - 1].frame);
}
function sf(e) {
  const t = new Set((e.cameras || []).map((o) => o.name));
  let a = 1;
  for (; t.has(`Drawn Camera ${a}`); ) a += 1;
  return `Drawn Camera ${a}`;
}
function fs(e, t = e.cameraPathDraw) {
  const a = t?.pointerId;
  if (a != null)
    try {
      e.interactionElement?.hasPointerCapture?.(a) && e.interactionElement.releasePointerCapture(a);
    } catch {
    }
}
function Pt(e) {
  const t = e.cameraPathDraw, a = !!t?.active, o = a && t.mode === "extend";
  for (const n of e.root?.querySelectorAll?.('[data-act="draw-camera-path"]') || [])
    n.classList.toggle("active", a && !o), n.setAttribute("aria-pressed", String(a && !o));
  for (const n of e.root?.querySelectorAll?.('[data-act="draw-camera-path-extend"]') || [])
    n.classList.toggle("active", o), n.setAttribute("aria-pressed", String(o));
  const r = e.interactionElement;
  r?.style && (a ? (r.dataset.cameraPathDraw = "true", r.style.cursor = "crosshair") : r.dataset?.cameraPathDraw && (delete r.dataset.cameraPathDraw, r.style.cursor = ""));
}
function mn(e, t = {}) {
  if (e.cameraPathDraw?.active) return !0;
  const a = t.mode === "extend" ? "extend" : "new", o = e.activeCameraTrack?.(), r = he(e.camera || o?.camera);
  if (!r?.position || !r?.target) return !1;
  let n = null, i = null, c, l = null, p = null;
  if (a === "extend") {
    const d = o?.keyframes;
    if (!o || !Array.isArray(d) || d.length < 1)
      return e.setStatus?.(s("Draw Camera Path: the active camera has no path to continue")), !1;
    e.state.view_mode === "camera" && e.setViewMode?.("top");
    const f = d[d.length - 1];
    n = [...f.camera.position], i = o.id;
    const u = Math.max(0, Math.round(Number(e.state.duration_frames) || 1) - 1), [, b] = dn(e.state), y = d.length > 1 ? d[d.length - 1].frame - d[0].frame : 24;
    let g = Math.max(b, f.frame + Math.max(6, Math.min(y, 240)));
    g <= f.frame && (g = f.frame + 24), g > u && (l = g + 1), g > b && (p = g), c = [f.frame, g];
  } else
    Qp.includes(e.state.view_mode) || e.setViewMode?.("top"), c = dn(e.state);
  const m = ef[e.state.view_mode] ?? null, h = n ? [...n] : [...r.position];
  return e.cameraPathDraw = {
    active: !0,
    drawing: !1,
    pointerId: null,
    mode: a,
    appendTrackId: i,
    planeAxis: m,
    anchor: h,
    seedPoint: n,
    range: c,
    wantDuration: l,
    wantRangeEnd: p,
    sourceCamera: r,
    points: []
  }, Pt(e), e.setStatus?.(a === "extend" ? s("Continue Camera Path: LMB draw from the last key · RMB or Esc cancel") : s("Draw Camera Path: LMB draw · RMB or Esc cancel")), e.render?.(), !0;
}
function Sr(e, t) {
  const a = e.cameraPathDraw;
  if (!a?.active || !Array.isArray(t) || t.length < 3) return !1;
  const o = [Number(t[0]), Number(t[1]), Number(t[2])];
  if (!o.every(Number.isFinite)) return !1;
  a.planeAxis && (o[xo[a.planeAxis]] = a.anchor[xo[a.planeAxis]]);
  const r = a.points.at(-1);
  return r && kr(r, o) < Zp ? !1 : (a.points.push(o), !0);
}
function Le(e) {
  const t = e.cameraPathDraw;
  return t?.active ? (fs(e, t), e.cameraPathDraw = null, Pt(e), e.setStatus?.(s("Draw Camera Path cancelled")), e.render?.(), !0) : !1;
}
function cf(e) {
  const t = e.cameraPathDraw;
  if (!t?.active) return null;
  fs(e, t);
  const a = t.seedPoint ? [t.seedPoint, ...t.points] : t.points;
  if (a.length < 2 || tf(a) < Jp || t.range[1] <= t.range[0])
    return Le(e), e.setStatus?.(s("Camera path needs at least two distinct points")), null;
  const o = nf(t);
  if (o.length < (t.mode === "extend" ? 1 : 2))
    return Le(e), null;
  if (t.mode === "extend") {
    const c = e.state.cameras.find((m) => m.id === t.appendTrackId);
    if (!c)
      return Le(e), null;
    e.checkpoint?.("Extend camera path"), t.wantDuration && (e.state.duration_frames = Math.max(Number(e.state.duration_frames) || 0, t.wantDuration)), t.wantRangeEnd != null && Array.isArray(e.state.playback_range) && (e.state.playback_range = [e.state.playback_range[0], Math.max(e.state.playback_range[1], t.wantRangeEnd)]);
    const l = new Map((c.keyframes || []).map((m) => [m.frame, m]));
    for (const m of o) l.set(m.frame, m);
    const p = [...l.values()].sort((m, h) => m.frame - h.frame);
    return c.keyframes = p, c.id === e.state.active_camera_id && (e.state.keyframes = p), e.cameraPreviewSignature = "", e.cameraPathDraw = null, Pt(e), e.activateCamera?.(c.id), e.setFrame?.(o[0].frame), e.serialize?.(), e.refreshKeys?.(), e.render?.(), e.setStatus?.(s("Camera path extended")), c.id;
  }
  e.checkpoint?.("Draw camera path");
  const r = zc(e.state), n = e.state.cameras.length, i = {
    id: r,
    name: sf(e.state),
    color: zr[n % zr.length],
    camera: he(o[0].camera),
    keyframes: o,
    target_object_id: null,
    target_offset: [0, 0, 0]
  };
  return e.state.cameras.push(i), e.cameraPreviewSignature = "", e.cameraPathDraw = null, Pt(e), e.activateCamera?.(r), e.setFrame?.(t.range[0]), e.setStatus?.(s("Camera path created")), r;
}
function wo(e) {
  e.preventDefault?.(), e.stopPropagation?.(), e.stopImmediatePropagation?.();
}
function lf(e, t) {
  const a = e.interactionElement.getBoundingClientRect();
  return [
    (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width),
    (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height)
  ];
}
function jr(e, t) {
  const a = e.cameraPathDraw, o = e.viewportCamera?.();
  if (!a || !o) return null;
  const r = Ji(
    lf(e, t),
    o,
    a.anchor,
    e.canvas.width,
    e.canvas.height
  );
  return r?.every(Number.isFinite) ? (a.planeAxis && (r[xo[a.planeAxis]] = a.anchor[xo[a.planeAxis]]), r) : null;
}
function df(e, t) {
  const a = e.cameraPathDraw;
  return a?.active ? t.button === 2 && !t.altKey ? (wo(t), e.cameraPathSuppressContextMenuUntil = Date.now() + 1e3, Le(e), !0) : t.button !== 0 || t.altKey || t.ctrlKey || t.metaKey || t.shiftKey ? !1 : (wo(t), e.closeMenus?.(), e.interactionElement.focus?.({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(t.pointerId), a.drawing = !0, a.pointerId = t.pointerId, a.points = [], Sr(e, jr(e, t)), Pt(e), e.requestRender?.("camera-path-draw"), !0) : !1;
}
function mf(e, t) {
  const a = e.cameraPathDraw;
  return !a?.active || !a.drawing || a.pointerId !== t.pointerId ? !1 : (wo(t), Sr(e, jr(e, t)) && e.requestRender?.("camera-path-draw"), !0);
}
function pf(e, t) {
  const a = e.cameraPathDraw;
  return !a?.active || !a.drawing || a.pointerId !== t.pointerId ? !1 : (wo(t), t.type === "pointercancel" || t.type === "lostpointercapture" ? (Le(e), !0) : (Sr(e, jr(e, t)), a.drawing = !1, cf(e), !0));
}
function ff(e) {
  const t = e.cameraPathDraw;
  if (!t?.active || e.recording) return;
  const a = e.viewportCamera?.();
  if (!a || !e.ctx) return;
  const o = t.seedPoint && t.points[0] !== t.seedPoint ? [t.seedPoint, ...t.points] : t.points;
  if (!o.length) return;
  const r = o.map((c) => ze(c, a, e.canvas.width, e.canvas.height)).filter((c) => c && Number.isFinite(c[0]) && Number.isFinite(c[1]));
  if (!r.length) return;
  const n = globalThis.getComputedStyle?.(e.root)?.getPropertyValue("--oc-accent")?.trim() || "#8b7de3", i = e.ctx;
  i.save(), i.strokeStyle = n, i.fillStyle = n, i.lineWidth = 2, i.setLineDash([7, 5]), i.beginPath(), i.moveTo(r[0][0], r[0][1]);
  for (const c of r.slice(1)) i.lineTo(c[0], c[1]);
  i.stroke(), i.setLineDash([]);
  for (const c of [r[0], r.at(-1)])
    i.beginPath(), i.arc(c[0], c[1], 4, 0, Math.PI * 2), i.fill();
  i.restore();
}
function hf(e, t) {
  for (const a of e.root.querySelectorAll('[data-act="draw-camera-path"]'))
    a.addEventListener("click", () => {
      e.cameraPathDraw?.active ? Le(e) : mn(e);
    }, { signal: t });
  for (const a of e.root.querySelectorAll('[data-act="draw-camera-path-extend"]'))
    a.addEventListener("click", () => {
      e.cameraPathDraw?.active ? Le(e) : mn(e, { mode: "extend" });
    }, { signal: t });
  e.root.addEventListener("contextmenu", (a) => {
    !(Date.now() <= Number(e.cameraPathSuppressContextMenuUntil || 0)) && !e.cameraPathDraw?.active || (a.preventDefault(), a.stopPropagation(), a.stopImmediatePropagation?.(), e.cameraPathSuppressContextMenuUntil = 0, e.cameraPathDraw?.active && Le(e));
  }, { capture: !0, signal: t });
}
const ho = "/majoor/omnicam/scenes";
function hs(e) {
  return e.sceneName || e.state?.metadata?.scene_name || "";
}
function uo(e, t, a) {
  const o = e.api || (typeof window < "u" ? window.app?.api : null);
  if (!o?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return o.fetchApi(t, a);
}
function _r(e, t, { name: a = "", status: o } = {}) {
  const r = t && typeof t == "object" ? t : Ln(), n = { ...r, metadata: { ...r.metadata || {}, scene_name: a || "" } };
  e.stateWidget && (e.stateWidget.value = JSON.stringify(n)), e.widthWidget && n.width != null && (e.widthWidget.value = n.width), e.heightWidget && n.height != null && (e.heightWidget.value = n.height), e.fpsWidget && n.fps != null && (e.fpsWidget.value = n.fps), e.durationWidget && n.fps && n.duration_frames != null && (e.durationWidget.value = n.duration_frames / n.fps), e.modeWidget && n.render_mode != null && (e.modeWidget.value = n.render_mode), e.cardWidget && (e.cardWidget.value = n.card_asset || ""), e.restoreFromWidgets(), e.sceneName = a || "", e.state && (e.state.metadata = { ...e.state.metadata, scene_name: e.sceneName }), e.serialize?.(), e.sceneBaseline = e.stateWidget?.value ?? JSON.stringify(n), e.refreshCameraPreviews?.(), e.syncUpstreamInputs?.(), e.setStatus?.(o || s("Scene loaded"));
}
async function uf(e) {
  await Nt(e, s("New Scene"), s("Start a new scene? Unsaved changes will be lost.")) && _r(e, Ln(), { name: "", status: s("New scene") });
}
async function bf(e) {
  if (!e.sceneBaseline) {
    e.setStatus?.(s("Nothing to revert to"));
    return;
  }
  if (!await Nt(
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
  const o = a?.metadata?.scene_name || hs(e);
  _r(e, a, { name: o, status: s("Scene reset to last save") });
}
async function gf(e) {
  const t = hs(e) || s("Untitled"), a = await zt(e, s("Save Scene"), s("Scene name"), t);
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
  e.setStatus?.(s("Saving scene…"));
  try {
    const n = await uo(e, ho, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: o, state: r })
    });
    if (!n.ok) throw new Error(await n.text());
    const i = await n.json();
    e.sceneName = i.name || o, e.state && (e.state.metadata = { ...e.state.metadata, scene_name: e.sceneName }), e.serialize?.(), e.sceneBaseline = e.stateWidget?.value ?? JSON.stringify(r), e.setStatus?.(s("Scene saved: {name}").replace("{name}", e.sceneName));
  } catch (n) {
    console.error("[OmniCam] scene save failed", n), e.setStatus?.(s("Scene save failed: {error}").replace("{error}", String(n?.message || n).slice(0, 120)));
  }
}
async function yf(e) {
  let t;
  try {
    const r = await uo(e, ho);
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
  const a = await Nc({
    title: s("Open Scene"),
    owner: e,
    items: t.map((r) => ({
      id: r.slug,
      label: r.name || r.slug,
      sublabel: vf(r.modified)
    })),
    onDelete: (r) => uo(e, `${ho}/${encodeURIComponent(r)}`, { method: "DELETE" }).catch((n) => console.warn("[OmniCam] scene delete failed", n))
  });
  if (!(!a || !await Nt(e, s("Open Scene"), s("Open this scene? Unsaved changes will be lost."))))
    try {
      const r = await uo(e, `${ho}/${encodeURIComponent(a)}`);
      if (!r.ok) throw new Error(await r.text());
      const n = await r.json();
      _r(e, n.state, {
        name: n.name || a,
        status: s("Scene opened: {name}").replace("{name}", n.name || a)
      });
    } catch (r) {
      console.error("[OmniCam] scene open failed", r), e.setStatus?.(s("Scene open failed: {error}").replace("{error}", String(r?.message || r).slice(0, 120)));
    }
}
function vf(e) {
  if (!Number.isFinite(e)) return "";
  try {
    return new Date(e * 1e3).toLocaleString();
  } catch {
    return "";
  }
}
function co(e, t, a, o) {
  for (const r of a)
    r.addEventListener("click", () => {
      e.closeMenus?.(), Promise.resolve(o()).catch((n) => {
        console.error("[OmniCam] scene action failed", n), e.setStatus?.(String(n?.message || n).slice(0, 160));
      });
    }, { signal: t });
}
function xf(e, t) {
  co(e, t, e.root.querySelectorAll('[data-act="scene-new"]'), () => uf(e)), co(e, t, e.root.querySelectorAll('[data-act="scene-open"]'), () => yf(e)), co(e, t, e.root.querySelectorAll('[data-act="scene-save"]'), () => gf(e)), co(e, t, e.root.querySelectorAll('[data-act="scene-reset"]'), () => bf(e));
}
const wf = ["world_point", "object_point", "camera_field"], pn = 40;
function kf(e) {
  return (e.keys || []).map((t) => ({ x: t.x, y: t.y, t: t.time_seconds }));
}
function Sf(e, t, a) {
  const o = Math.max(1, Number(e.fps) || 24), r = e.width || 1280, n = e.height || 720, i = [];
  for (let c = 0; c <= pn; c += 1) {
    const l = a * c / pn, p = fr(e, t.source, l * o, r, n);
    p && i.push({ x: p.x, y: p.y, t: l });
  }
  return i;
}
function jf(e, t) {
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
function us(e, t, a) {
  const o = t / Math.max(1, a), r = e.width / Math.max(1, e.height);
  let n = e.width, i = e.height;
  return r > o ? n = i * o : i = n / o, { x: (e.width - n) / 2, y: (e.height - i) / 2, w: n, h: i };
}
function _f(e) {
  const t = e.root.querySelector('[data-role="motion-preview"]');
  if (!t || t.closest("[data-tab-panel]")?.hidden) return;
  const o = t.getBoundingClientRect();
  if (!o.width || !o.height) return;
  const r = Math.min(2, window.devicePixelRatio || 1), n = Math.round(o.width * r), i = Math.round(o.height * r);
  t.width !== n && (t.width = n), t.height !== i && (t.height = i);
  const c = t.getContext("2d");
  if (!c) return;
  const l = us(t, e.state.width || 1280, e.state.height || 720), p = (y) => l.x + y * l.w, m = (y) => l.y + y * l.h;
  c.save(), c.clearRect(0, 0, t.width, t.height), c.fillStyle = "#0b0b0f", c.fillRect(0, 0, t.width, t.height), c.fillStyle = "#0f0f14", c.fillRect(l.x, l.y, l.w, l.h), c.strokeStyle = "rgba(255,255,255,0.06)", c.lineWidth = 1;
  for (let y = 1; y < 3; y += 1)
    c.beginPath(), c.moveTo(p(y / 3), l.y), c.lineTo(p(y / 3), l.y + l.h), c.stroke(), c.beginPath(), c.moveTo(l.x, m(y / 3)), c.lineTo(l.x + l.w, m(y / 3)), c.stroke();
  const h = Math.max(1, Number(e.state.fps) || 24), d = Math.max(1 / h, (e.state.duration_frames || 120) / h), f = (e.frame || 0) / h;
  let u = 0;
  for (const y of e.state.motion_layers || []) {
    if (y.enabled === !1) continue;
    const g = wf.includes(y.source_kind), v = g ? Sf(e.state, y, d) : kf(y);
    if (!v.length) continue;
    u += 1;
    const S = y.id === e.state.selected_motion_layer_id;
    if (c.strokeStyle = S ? "#ffcc4d" : "rgba(65,217,197,0.6)", c.lineWidth = (S ? 2.4 : 1.5) * r, c.beginPath(), v.forEach((A, M) => {
      const K = p(A.x), L = m(A.y);
      M ? c.lineTo(K, L) : c.moveTo(K, L);
    }), c.stroke(), !g) {
      c.fillStyle = S ? "#ffcc4d" : "#41d9c5";
      for (const A of v)
        c.beginPath(), c.arc(p(A.x), m(A.y), (S ? 3.4 : 2.4) * r, 0, Math.PI * 2), c.fill();
    }
    const x = jf(v, f);
    x && (c.fillStyle = S ? "#ffcc4d" : "#41d9c5", c.strokeStyle = "#fff", c.lineWidth = 1.4 * r, c.beginPath(), c.arc(p(x.x), m(x.y), 4.4 * r, 0, Math.PI * 2), c.fill(), c.stroke());
  }
  c.strokeStyle = "rgba(255,255,255,0.16)", c.lineWidth = 1, c.strokeRect(l.x + 0.5, l.y + 0.5, l.w - 1, l.h - 1), c.restore();
  const b = e.root.querySelector('[data-role="motion-preview-empty"]');
  b && (b.hidden = u > 0);
}
function Cf(e, t) {
  const a = e.root.querySelector('[data-role="motion-preview"]');
  a && a.addEventListener("click", (o) => {
    const r = a.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const n = us(a, e.state.width || 1280, e.state.height || 720), i = a.width / r.width, c = {
      x: ((o.clientX - r.left) * i - n.x) / Math.max(1, n.w),
      y: ((o.clientY - r.top) * i - n.y) / Math.max(1, n.h)
    }, l = Qi(e.state.motion_layers, c, 0.09);
    l && (e.state.selected_motion_layer_id = l.id, e.render());
  }, { signal: t });
}
function ke(e, t, a, o = "value") {
  for (const r of e.querySelectorAll(`[data-role="${t}"]`))
    r !== a && (r[o] = a[o]);
}
function Ef(e) {
  e.abortController = new AbortController();
  const t = e.abortController.signal, a = (o) => e.root.querySelector(o);
  ec(e, t), tc(e, t), Cf(e, t), hp(e, a, t), Yp(e, a, t), Rc(e, t), hf(e, t), xf(e, t), ip(e, a, t), qp(e, t);
}
function Af(e, t) {
  return Object.defineProperty(e, "omnicamMetrics", { value: Object.freeze({ ...t }), enumerable: !0 }), e;
}
function $f(e, t) {
  const a = t?.omnicamMetrics || {}, o = Number(a.fps) || Number(e.state.fps), r = Number(a.requestedFrames) || Number(e.state.duration_frames), n = Number(a.width) || Number(e.canvas.width), i = Number(a.height) || Number(e.canvas.height), c = e.state.playblast_camera_id === Fn ? sr(e.state).map((l) => ({ camera_id: l.camera_id, start_frame: l.start, end_frame: l.end })) : [];
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
    motion_scene_fingerprint: ll(e.state)
  };
}
function Mf(e, t) {
  const a = $f(e, t);
  return e.state.metadata = { ...e.state.metadata || {}, playblast: a }, a;
}
function fn(e, t, { frameCount: a = 0, fps: o = 0 } = {}) {
  const r = Math.round(Number(t?.videoWidth || t?.naturalWidth) || 0), n = Math.round(Number(t?.videoHeight || t?.naturalHeight) || 0), i = Math.round(Number(o) || Number(e.state?.fps) || Number(e.fpsWidget?.value) || 24), c = Number(t?.duration) > 0 ? Math.round(Number(t.duration) * i) : 0, l = Math.round(Number(a) || c || 0);
  return !r || !n ? !1 : (e.widthWidget && (e.widthWidget.value = r), e.heightWidget && (e.heightWidget.value = n), i && e.fpsWidget && (e.fpsWidget.value = i), l && i && e.durationWidget && (e.durationWidget.value = Math.max(0.25, l / i)), e.syncFromWidgets(), !0);
}
const Ye = 1024 * 1024, Tf = Object.freeze({
  card: 128 * Ye,
  // MAX_CARD_BYTES
  model: 256 * Ye,
  // MAX_MODEL_BYTES
  fbx: 64 * Ye,
  // MAX_FBX_MODEL_BYTES
  image: 128 * Ye,
  // background stills go through the card/asset route
  audio: 128 * Ye
  // no upload, but decodeAudioData still buffers it all
}), hn = 2e3;
function un(e) {
  return `${(e / Ye).toFixed(e >= 10 * Ye ? 0 : 1)} MB`;
}
function Rt(e, t) {
  const a = Tf[t];
  if (!e || !a) return null;
  const o = Number(e.size);
  return !Number.isFinite(o) || o <= a ? null : `${e.name || "File"} is ${un(o)}; the maximum is ${un(a)}.`;
}
function If(e) {
  return Number(e) <= hn ? null : `${e} frames selected; a background sequence is limited to ${hn}.`;
}
function Of(e) {
  const t = e.audioElement;
  return !t || t.paused || !Number.isFinite(t.currentTime) ? null : Math.round(t.currentTime * Math.max(1, e.state.fps));
}
function Bo(e, t) {
  const a = e.audioElement;
  if (!a) return;
  const o = Math.max(0, t / Math.max(1, e.state.fps));
  if (!(o >= (e.audioDuration || 0)))
    try {
      a.currentTime = o;
    } catch {
    }
}
function Pf(e) {
  if (e.playing) return bo(e);
  e.playing = !0;
  for (const m of e.root.querySelectorAll('[data-act="play"]')) {
    m.classList.add("playing");
    const h = m.querySelector("i");
    h && (h.className = "pi pi-pause");
  }
  const t = e.state.playback_range, a = t ? t[0] : 0, o = t ? t[1] : e.state.duration_frames - 1;
  let r = e.frame >= o || e.frame < a ? a : e.frame, n = null;
  e.audioElement && (Bo(e, r), Promise.resolve(e.audioElement.play()).catch(() => {
  }));
  const i = 1e3 / e.state.fps;
  let c = performance.now(), l = 0;
  const p = (m) => {
    if (!e.playing) return;
    const h = Of(e);
    if (h === null) {
      for (l += m - c, c = m; l >= i; )
        if (l -= i, r += 1, r > o) {
          if (!e.state.loop_playback) return void bo(e);
          r = a;
        }
    } else if (c = m, l = 0, r = h, r > o) {
      if (!e.state.loop_playback) return void bo(e);
      r = a, Bo(e, a);
    } else r < a && (r = a, Bo(e, a));
    r !== n && (n = r, e.setFrame(r, !0, !1)), e.playTimer = requestAnimationFrame(p);
  };
  e.playTimer = requestAnimationFrame(p);
}
function bo(e) {
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
function ko(e) {
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
function bs(e) {
  const t = e.audioSamples;
  if (!t || !t.data?.length) {
    e.audioWaveformPeaks = null;
    return;
  }
  const { data: a, sampleRate: o } = t, r = e.state.duration_frames / Math.max(1, e.state.fps), n = Math.min(a.length, Math.floor(r * o)), i = Math.min(600, Math.max(100, e.state.duration_frames * 4)), c = Math.max(1, Math.floor(n / i)), l = [];
  for (let p = 0; p < i; p++) {
    let m = 0;
    const h = p * c, d = Math.min(n, h + c);
    for (let f = h; f < d; f++) {
      const u = Math.abs(a[f] || 0);
      u > m && (m = u);
    }
    l.push(m);
  }
  e.audioWaveformPeaks = l, e.refreshKeys();
}
async function Lf(e, { load: t = () => import("./vendor-mediabunny-CZ5VNE-V.js") } = {}) {
  const { ALL_FORMATS: a, AudioSampleSink: o, BlobSource: r, Input: n } = await t(), c = await new n({ formats: a, source: new r(e) }).getPrimaryAudioTrack();
  if (!c) return null;
  const l = [];
  let p = 0, m = 0;
  for await (const f of new o(c).samples())
    try {
      m = m || f.sampleRate;
      const u = { planeIndex: 0, format: "f32-planar" }, b = new Float32Array(f.allocationSize(u) / Float32Array.BYTES_PER_ELEMENT);
      f.copyTo(b, u), l.push(b), p += b.length;
    } finally {
      f.close();
    }
  if (!p || !m) return null;
  const h = new Float32Array(p);
  let d = 0;
  for (const f of l)
    h.set(f, d), d += f.length;
  return { data: h, sampleRate: m };
}
function Ff(e) {
  return Number.isFinite(e.duration) && e.duration > 0 ? Promise.resolve() : new Promise((t) => {
    const a = () => {
      e.removeEventListener("loadedmetadata", a), e.removeEventListener("error", a), t();
    };
    e.addEventListener("loadedmetadata", a), e.addEventListener("error", a);
  });
}
async function zf(e, t, { decode: a = Lf } = {}) {
  if (!t) return;
  const o = Rt(t, "audio");
  if (o) {
    e.setStatus(o);
    return;
  }
  ko(e);
  try {
    const r = URL.createObjectURL(t), n = new Audio();
    n.preload = "auto", n.src = r, e.audioObjectUrl = r, e.audioElement = n, await Ff(n), e.audioDuration = Number.isFinite(n.duration) ? n.duration : 0;
    try {
      e.audioSamples = await a(t);
    } catch {
      e.audioSamples = null;
    }
    bs(e), e.setStatus(`Audio loaded: ${t.name || "track"}`);
  } catch (r) {
    ko(e), e.setStatus(`Failed to load audio: ${r.message || r}`);
  }
}
let ct = null;
function gs({ api: e }) {
  ct = e;
}
const ys = /* @__PURE__ */ new WeakSet(), Mt = /* @__PURE__ */ new WeakMap();
function So(e) {
  if (!(typeof HTMLVideoElement > "u" || !(e instanceof HTMLVideoElement)))
    try {
      e.pause(), e.removeAttribute("src"), e.srcObject = null, e.load();
    } catch {
    }
}
function Nf(e) {
  e && typeof e == "object" && Mt.set(e, (Mt.get(e) || 0) + 1);
}
function Rf(e) {
  if (!e || typeof e != "object") return;
  const t = Mt.get(e) || 0;
  if (t > 1) {
    Mt.set(e, t - 1);
    return;
  }
  Mt.delete(e), ys.has(e) && So(e);
}
function Kt(e, t) {
  const a = e.cardMediaById.get(t);
  a && (e.cardMediaById.delete(t), e.cardMediaAssetById?.delete?.(t), t === "subject" && e.cardMedia === a && (e.cardMedia = null), Rf(a));
}
function Kf(e) {
  for (const t of [...e.cardMediaById?.keys?.() || []]) Kt(e, t);
}
function We(e, t, a, o = !1, r = "") {
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
  n && n !== a && Kt(e, t), o && ys.add(a), Nf(a), e.cardMediaAssetById ||= /* @__PURE__ */ new Map(), e.cardMediaById.set(t, a), e.cardMediaAssetById.set(t, r || a?.__omnicamAsset || "");
  try {
    a.__omnicamAsset = r || a.__omnicamAsset || "";
  } catch {
  }
  t === "subject" && (e.cardMedia = a);
}
function vs(e, t, { signal: a, timeout: o = 15e3 } = {}) {
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
async function xs(e, t, a, o = () => !0, r = null) {
  if (!t || !a) return;
  const n = () => !e.disposed && o(), i = String(t.asset || a).toLowerCase();
  if (r ?? /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/.test(i)) {
    const l = document.createElement("video");
    if (l.src = a, l.loop = !0, l.muted = !0, l.playsInline = !0, await vs(l, ["loadeddata", "error"], { signal: e.abortController?.signal }).catch(() => {
    }), !n()) {
      So(l);
      return;
    }
    if (await l.play().catch(() => {
    }), !n()) {
      So(l);
      return;
    }
    We(e, t.id, l, !0, t.asset || a);
  } else {
    const l = new Image();
    if (l.src = a, await l.decode().catch(() => {
    }), !n()) {
      l.src = "";
      return;
    }
    We(e, t.id, l, !0, t.asset || a);
  }
  return e.disposed ? null : (e.render(), e.cardMediaById.get(t.id) || null);
}
async function Df(e, t) {
  if (!ct?.fetchApi || !/\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(e)) return null;
  const a = await ct.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: { kind: "annotated_input", value: e } }),
    signal: t
  });
  return a.ok && (await a.json())?.info || null;
}
function at(e, t = "") {
  const a = String(e || ""), o = a.match(/\s+\[(input|output|temp)\]$/), r = o ? a.slice(0, o.index) : a, n = o?.[1] || "input";
  return `${t && !r.includes("/") && !r.includes("\\") ? `${t}/${r}` : r} [${n}]`;
}
function Bf(e) {
  const t = (e.assetRestoreGeneration || 0) + 1;
  e.assetRestoreGeneration = t;
  const a = () => !e.disposed && e.assetRestoreGeneration === t;
  if (e.state.viewport_bg_image) {
    const o = new Image();
    o.src = Ue(e.state.viewport_bg_image), o.decode().catch(() => {
    }), e.viewportBgImage = o;
  }
  e.viewportBgSequenceImages = (e.state.viewport_bg_sequence || []).map((o) => {
    const r = new Image();
    return r.src = Ue(o), r.decode().catch(() => {
    }), r;
  });
  for (const o of e.state.objects) {
    if (!o.asset) {
      (o.type === "model" || o.type === "glb") && (o.load_error = s("Not saved to the ComfyUI input folder: this model will be missing after a reload.")), o.type === "card" && Kt(e, o.id);
      continue;
    }
    const r = Ue(o.asset);
    o.type === "glb" || o.type === "model" ? e.modelUrlsById.set(o.id, r) : o.type === "card" && e.cardMediaAssetById?.get?.(o.id) !== o.asset && e.loadMediaUrl(o, r, a);
  }
}
function qf(e, t) {
  e.modelInfoById.set(t.id, t);
  const a = e.state.objects.find((o) => o.id === t.id);
  if (t.error) {
    a && (a.load_error = t.error), e.setStatus(`⚠️ ${t.error}`), e.refreshObjects(), t.id === e.selectedObjectId && e.refreshInspector();
    return;
  }
  a && (a.load_error = null), a?.animation_index && e.webgl?.selectAnimation(t.id, a.animation_index), t.id === e.selectedObjectId && e.refreshInspector(), !t.meshes && !t.points && t.bones ? e.setStatus(s(`${t.format.toUpperCase()} animation only: ${t.bones} bones, no mesh · skeleton preview`)) : e.setStatus(s(`${t.format.toUpperCase()} loaded: ${t.meshes} mesh${t.meshes === 1 ? "" : "es"}, ${t.vertices} vertices`));
}
async function Uf(e, t) {
  if (!t) return;
  const a = t.name.split(".").pop()?.toLowerCase();
  if (!["glb", "obj", "fbx", "stl", "ply"].includes(a)) return e.setStatus(s("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first."));
  const o = Rt(t, a === "fbx" ? "fbx" : "model");
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
    const c = await yr(ct, { route: "/majoor/omnicam/upload_model", field: "asset", file: t });
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
async function Wf(e, t) {
  if (!t) return;
  const a = Rt(t, "card");
  if (a) return e.setStatus(a);
  const o = e.selectedObject()?.type === "card" ? e.selectedObject() : e.state.objects.find((r) => r.id === "subject");
  if (o) {
    if (e.checkpoint?.("Replace card media"), e.cardUrl = e.objectUrls.replace(o.id, t), t.type.startsWith("video/")) {
      const r = document.createElement("video");
      if (r.src = e.cardUrl, r.loop = !0, r.muted = !0, r.playsInline = !0, await r.play().catch(() => {
      }), e.disposed) {
        So(r);
        return;
      }
      We(e, o.id, r, !0, e.cardUrl);
    } else {
      const r = new Image();
      if (r.src = e.cardUrl, await r.decode().catch(() => {
      }), e.disposed) {
        r.src = "";
        return;
      }
      We(e, o.id, r, !0, e.cardUrl);
    }
    e.render(), e.setStatus(s("Uploading card…"));
    try {
      const r = await yr(ct, { route: "/majoor/omnicam/upload_asset", field: "asset", file: t });
      if (e.disposed || !e.state.objects.includes(o)) return;
      o.asset = r.path, e.cardMediaAssetById?.set?.(o.id, r.path), o.id === "subject" && (e.state.card_asset = r.path, e.cardWidget && (e.cardWidget.value = r.path)), e.serialize(), e.setStatus(s(`Card: ${r.name}`));
    } catch (r) {
      if (e.disposed || !e.state.objects.includes(o)) return;
      console.error(r), e.setStatus(s("Card loaded locally; backend upload failed"));
    }
  }
}
function Vf(e, t) {
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
  e.state.reference_index = X(e.state.reference_index || 0, 0, e.executionReferences.length - 1), a.value = String(e.state.reference_index), e.serialize(), e.loadSelectedReference();
}
function Hf(e) {
  const t = e.executionReferences[e.state.reference_index];
  if (!t) return;
  const a = new Image();
  a.onload = () => {
    e.disposed || (We(e, "subject", a, !1, a.src), e.render(), e.setStatus(s("Upstream media refreshed")));
  }, a.src = ct.apiURL(`/view?${new URLSearchParams(t).toString()}`);
}
async function Gf(e) {
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
  for (const h of i) {
    const d = String(h.name || "").toLowerCase();
    if (h.link == null) continue;
    const f = dl(t, h.link);
    if (f) {
      if (d === "image" || d === "video") {
        c = !0;
        const u = f.widgets?.find(
          (b) => ["image", "image_path", "upload", "file", "filename", "video", "video_path"].includes(String(b.name).toLowerCase())
        );
        if (u && u.value) {
          const b = String(u.value), y = /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(b), g = f.widgets?.find((x) => String(x.name).toLowerCase() === "subfolder")?.value || "", v = Ue(at(b, g)), S = e.state.objects.find((x) => x.id === "subject");
          if (S) {
            const x = await xs(e, S, v, r, y);
            if (!r()) return;
            S.asset = at(b, g);
            let A = null;
            if (y)
              try {
                A = await Df(b, o.signal);
              } catch (M) {
                if (M?.name === "AbortError") return;
                console.warn("Failed to describe upstream video:", M);
              }
            r() && fn(e, x, {
              fps: A?.fps,
              frameCount: y ? A?.frame_count : 1
            }), e.upstreamImageConnected = !0, n = !0, e.setStatus(s(`Upstream ${y ? "video" : "image"}: ${b}`));
          }
        } else {
          const b = ml(f);
          b && (b instanceof HTMLVideoElement && b.paused && b.play().catch(() => {
          }), We(e, "subject", b, !1, b.currentSrc || b.src || ""), fn(e, b, { frameCount: b instanceof HTMLVideoElement ? 0 : 1 }), e.upstreamImageConnected = !0, n = !0, e.render(), e.setStatus(b instanceof HTMLVideoElement ? s("Upstream video preview synced") : s("Upstream image preview synced")));
        }
      }
      if (d === "audio") {
        l = !0;
        const u = f.widgets?.find(
          (b) => ["audio", "audio_path", "audio_file", "file", "filename"].includes(String(b.name).toLowerCase())
        );
        if (u && u.value) {
          const b = String(u.value), y = f.widgets?.find((v) => String(v.name).toLowerCase() === "subfolder")?.value || "", g = Ue(at(b, y));
          try {
            const v = await fetch(g, { signal: o.signal });
            if (v.ok) {
              const S = await v.blob();
              if (!r()) return;
              const x = new File([S], b, { type: S.type || "audio/wav" });
              await e.loadAudioFile(x), e.upstreamAudioConnected = !0, n = !0, e.setStatus(s(`Upstream audio: ${b}`));
            }
          } catch (v) {
            if (v?.name === "AbortError") return;
            console.warn("Failed to fetch upstream audio:", v);
          }
        }
      }
      if (d === "scene_3d" || d === "model" || d === "mesh") {
        const u = f.widgets?.find(
          (b) => ["model_file", "model", "file", "filename", "filepath", "mesh", "scene", "3d_file"].includes(String(b.name).toLowerCase())
        );
        if (u && u.value) {
          const b = String(u.value), y = b.split(".").pop()?.toLowerCase();
          if (["glb", "gltf", "obj", "fbx", "stl", "ply"].includes(y)) {
            const g = f.widgets?.find((A) => String(A.name).toLowerCase() === "subfolder")?.value || "", v = Ue(at(b, g)), S = `upstream_scene_${f.id}`;
            p.add(S);
            let x = e.state.objects.find((A) => A.id === S);
            x ? (x.asset = at(b, g), x.format = y === "gltf" ? "glb" : y) : (x = {
              id: S,
              type: "model",
              format: y === "gltf" ? "glb" : y,
              name: `Upstream: ${b.replace(/\.[^.]+$/i, "")}`,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              size: [1, 1, 1],
              material_mode: "textured",
              keyframes: [],
              enabled: !0,
              asset: at(b, g)
            }, e.state.objects.push(x)), e.modelUrlsById.set(S, v), e.serialize(), e.refreshObjects(), e.render(), n = !0, e.setStatus(s(`Upstream 3D model: ${b}`));
          }
        }
      }
    }
  }
  if (!c && e.upstreamImageConnected) {
    Kt(e, "subject");
    const h = e.state.objects.find((d) => d.id === "subject");
    h && (h.asset = ""), e.upstreamImageConnected = !1, n = !0, e.setStatus(s("Upstream image disconnected · card reset"));
  }
  !l && e.upstreamAudioConnected && (ko(e), e.upstreamAudioConnected = !1, e.refreshKeys(), n = !0, e.setStatus(s("Upstream audio disconnected · audio track cleared")));
  const m = e.state.objects.filter(
    (h) => h.id.startsWith("upstream_scene_") && !p.has(h.id)
  );
  if (m.length > 0) {
    for (const h of m)
      e.modelUrlsById.delete(h.id), e.modelInfoById.delete(h.id), e.webgl?.removeModel(h.id);
    e.state.objects = e.state.objects.filter(
      (h) => !m.some((d) => d.id === h.id)
    ), e.refreshObjects(), n = !0, e.setStatus(s("Upstream 3D scene disconnected · model removed"));
  }
  Kc(e) && (n = !0), n && (e.serialize(), e.render());
}
const Yf = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"], bn = { low: 3e6, balanced: 6e6, high: 12e6 };
function Xf(e) {
  return bn[e] || bn.balanced;
}
async function Zf({
  canvas: e,
  fps: t,
  frameCount: a,
  renderFrame: o,
  quality: r = "balanced",
  mediaRecorder: n = globalThis.MediaRecorder,
  signal: i,
  now: c = () => globalThis.performance?.now?.() ?? Date.now(),
  sleep: l = (m) => new Promise((h) => setTimeout(h, m)),
  onMetrics: p
}) {
  if (!n || !e.captureStream) throw new Error("MediaRecorder unsupported in this browser");
  const m = e.captureStream(t);
  let h;
  try {
    for (const S of Yf)
      if (!(n.isTypeSupported && !n.isTypeSupported(S)))
        try {
          h = new n(m, { mimeType: S, videoBitsPerSecond: Xf(r) });
          break;
        } catch {
        }
    if (!h) throw new Error("Cannot create MediaRecorder");
    const d = [];
    h.ondataavailable = (S) => {
      S.data.size && d.push(S.data);
    };
    const f = new Promise((S, x) => {
      h.addEventListener("stop", S, { once: !0 }), h.addEventListener("error", () => x(h.error || new Error("MediaRecorder failed")), { once: !0 });
    });
    h.start(100);
    const u = c();
    for (let S = 0; S < a; S++) {
      if (i?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await o(S), await l(1e3 / t);
    }
    h.stop(), await f;
    const b = Math.max(0, c() - u), y = a / t * 1e3, g = {
      encoder: "media_recorder",
      requestedFrames: a,
      expectedDurationMs: y,
      recordedDurationMs: b,
      driftMs: b - y,
      fps: t,
      width: e.width,
      height: e.height
    };
    p?.(g);
    const v = new Blob(d, { type: h.mimeType || "video/webm" });
    return Af(v, g);
  } finally {
    h?.state === "recording" && h.stop(), m.getTracks().forEach((d) => d.stop());
  }
}
async function Jf(e, t) {
  const a = t.type.startsWith("video/mp4") ? "mp4" : "webm", o = new FormData();
  o.append("video", t, `omnicam_playblast.${a}`);
  const r = await e.fetchApi("/majoor/omnicam/upload_playblast", { method: "POST", body: o });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function Qf(e) {
  await Promise.all([...e].filter((t) => t instanceof HTMLVideoElement && t.seeking).map((t) => vs(t, ["seeked", "error"], { timeout: 5e3 }).catch(() => {
  })));
}
async function ws(e) {
  await Qf(e.cardMediaById.values());
}
async function ks(e) {
  return Zf({
    canvas: e.canvas,
    fps: e.state.fps,
    frameCount: e.state.duration_frames,
    quality: e.state.playblast_quality,
    renderFrame: (t) => e.setFrame(t, !0),
    signal: e.abortController?.signal
  });
}
async function Ss(e, t) {
  const a = await Jf(Xe, t);
  if (Mf(e, t), e.state.playblast_camera_id === Fn)
    e.state.sequence = { ...e.state.sequence || {}, recording_path: a.path };
  else {
    const o = e.state.cameras.find((r) => r.id === e.state.playblast_camera_id);
    o && (o.recording_path = a.path);
  }
  e.recordingWidget && (e.recordingWidget.value = a.path), e.serialize(), e.setStatus(s(`Playblast ready: ${a.name}`));
}
function eh(e) {
  const t = { width: e.canvas.width, height: e.canvas.height }, a = e.state.playblast_resolution || "output";
  if (a === "viewport") return t;
  const o = a === "half" ? 0.5 : a === "double" ? 2 : 1, r = Math.max(16, Math.round(Number(e.state.width) || t.width)), n = Math.max(16, Math.round(Number(e.state.height) || t.height)), c = Math.min(o, 3840 / Math.max(r * o, n * o)), l = (p) => Math.max(2, Math.round(p * c / 2) * 2);
  return { width: l(r), height: l(n) };
}
async function th(e) {
  if (e.recording) return;
  e.stopPlay(), e.recording = !0, e.root.classList.add("recording"), e.setStatus(s("Encoding deterministic proxy…"));
  const t = e.frame, a = e.canvas.width, o = e.canvas.height, r = eh(e);
  (r.width !== e.canvas.width || r.height !== e.canvas.height) && (e.canvas.width = r.width, e.canvas.height = r.height, e.render());
  try {
    let n = null;
    const i = e.root.querySelector('[data-role="encoder"]').value, { encodeDeterministicPlayblast: c, supportsDeterministicEncoding: l } = await import("./chunk-yKjbGiSp.js");
    i !== "realtime" && await l(e.canvas.width, e.canvas.height) && (n = await c(e.canvas, e.state.duration_frames, e.state.fps, async (p) => {
      e.setFrame(p, !0), e.setStatus(s(`Encoding frame ${p + 1}/${e.state.duration_frames}…`)), await ws(e), await new Promise((m) => requestAnimationFrame(m));
    }, e.abortController?.signal, e.state.playblast_quality)), n || (e.setStatus(s("WebCodecs unavailable; recording realtime fallback…")), n = await ks(e)), e.setFrame(t), await Ss(e, n);
  } catch (n) {
    console.error(n), e.setStatus(s(`Playblast failed: ${n.message || n}`));
  } finally {
    e.recording = !1, e.root.classList.remove("recording"), (e.canvas.width !== a || e.canvas.height !== o) && (e.canvas.width = a, e.canvas.height = o), e.resizeCanvas?.(), e.setFrame(t);
  }
}
let Lt = null;
function ah({ api: e }) {
  Lt = e;
}
async function js(e) {
  if (!Lt) throw new Error("ComfyUI API is unavailable");
  return yr(Lt, { route: "/majoor/omnicam/upload_asset", field: "asset", file: e });
}
async function jo(e) {
  const t = e.map((a) => String(a.relative || "").replace(/^omnicam\//, "")).filter(Boolean);
  if (!(!t.length || !Lt))
    try {
      await Lt.fetchApi("/majoor/omnicam/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: t })
      });
    } catch {
    }
}
function Cr(e) {
  return e.backgroundRequestId = (e.backgroundRequestId || 0) + 1, e.backgroundRequestId;
}
async function oh(e, t) {
  if (!t) return;
  const a = Rt(t, "image");
  if (a) {
    e.setStatus(a);
    return;
  }
  const o = Cr(e);
  let r = null;
  try {
    if (e.setStatus(`Uploading background: ${t.name}`), r = await js(t), o !== e.backgroundRequestId || e.disposed) {
      await jo([r]);
      return;
    }
    const n = Ue(r.path);
    e.checkpoint?.("Set background image"), e.state.viewport_bg_image = r.path, e.state.viewport_bg_sequence = [];
    const i = new Image();
    i.src = n, await i.decode().catch(() => {
    }), e.viewportBgImage = i, e.serialize(), e.render(), e.setStatus(`Background image set: ${t.name}`);
  } catch (n) {
    if (r && await jo([r]), o !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG image: ${n.message || n}`);
  }
}
async function rh(e, t) {
  if (!t || !t.length) return;
  const a = If(t.length);
  if (a) {
    e.setStatus(a);
    return;
  }
  const o = Array.from(t).map((i) => Rt(i, "image")).find(Boolean);
  if (o) {
    e.setStatus(o);
    return;
  }
  const r = Cr(e);
  t.sort((i, c) => i.name.localeCompare(c.name, void 0, { numeric: !0, sensitivity: "base" }));
  const n = [];
  try {
    e.setStatus(`Uploading background sequence: ${t.length} frames`);
    for (const c of t)
      if (n.push(await js(c)), r !== e.backgroundRequestId || e.disposed) {
        await jo(n);
        return;
      }
    const i = n.map((c) => c.path);
    e.checkpoint?.("Set background sequence"), e.state.viewport_bg_sequence = i, e.state.viewport_bg_image = "", e.viewportBgImage = null, e.viewportBgSequenceImages = i.map((c) => {
      const l = new Image();
      return l.src = Ue(c), l.decode().catch(() => {
      }), l;
    }), e.serialize(), e.render(), e.setStatus(`Background sequence loaded: ${t.length} frames`);
  } catch (i) {
    if (await jo(n), r !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG sequence: ${i.message || i}`);
  }
}
function nh(e) {
  Cr(e), e.checkpoint?.("Clear background"), e.state.viewport_bg_image = "", e.state.viewport_bg_sequence = [], e.viewportBgImage = null, e.viewportBgSequenceImages = [], e.serialize(), e.render(), e.setStatus("Background cleared");
}
function sh(e) {
  const t = Wo(e.state?.metadata?.viewport_labels);
  if (t.mode === "off") return;
  const a = Array.isArray(e.state?.objects) ? e.state.objects : [], o = e.viewportCamera(), r = e.ctx, n = e.canvas.width, i = e.canvas.height, c = X(i / 720, 0.75, 4), l = Number(e.frame) || 0, p = e.selectedObjectIds instanceof Set ? e.selectedObjectIds : /* @__PURE__ */ new Set();
  r.save(), r.font = `${Math.round(12 * c)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`, r.textBaseline = "alphabetic";
  for (const m of a) {
    if (m.enabled === !1 || !An(m, { mode: t.mode, selectedIds: p })) continue;
    const h = $n(m, t.content);
    if (!h) continue;
    const d = Mn(a, m, l) || { position: m.position, size: m.size }, f = ze(Tn(d, m.type), o, n, i);
    if (!f) continue;
    const [u, b] = f, y = t.content === "annotation" && m.annotation?.color || "", g = 6 * c, v = 4 * c, x = r.measureText(h).width + g * 2, A = 12 * c + v * 2, M = Math.round(u - x / 2), K = Math.round(b - A - 6 * c);
    r.fillStyle = "rgba(16,17,22,0.82)", ih(r, M, K, x, A, 4 * c), r.fill(), y && (r.strokeStyle = y, r.lineWidth = Math.max(1, c), r.stroke()), r.fillStyle = y || "#e6e6ec", r.fillText(h, M + g, K + A - v - 2 * c);
  }
  r.restore();
}
function ih(e, t, a, o, r, n) {
  if (typeof e.roundRect == "function") {
    e.beginPath(), e.roundRect(t, a, o, r, n);
    return;
  }
  const i = Math.min(n, o / 2, r / 2);
  e.beginPath(), e.moveTo(t + i, a), e.arcTo(t + o, a, t + o, a + r, i), e.arcTo(t + o, a + r, t, a + r, i), e.arcTo(t, a + r, t, a, i), e.arcTo(t, a, t + o, a, i), e.closePath();
}
function ce(e, t, a, o = "#5a5a5a", r = 1) {
  const n = e.viewportCamera(), i = ze(t, n, e.canvas.width, e.canvas.height), c = ze(a, n, e.canvas.width, e.canvas.height);
  !i || !c || (e.ctx.strokeStyle = o, e.ctx.lineWidth = r, e.ctx.beginPath(), e.ctx.moveTo(i[0], i[1]), e.ctx.lineTo(c[0], c[1]), e.ctx.stroke());
}
function ch(e) {
  for (let t = -60; t <= 60; t += 1) {
    const a = t === 0, o = a ? "#6f6f6f" : "#353535";
    ce(e, [t, 0, -60], [t, 0, 60], o, a ? 1.6 : 1), ce(e, [-60, 0, t], [60, 0, t], o, a ? 1.6 : 1);
  }
}
function lh(e) {
  const t = e.state.point_density || "balanced", a = e.state.point_spread || "all_views", o = e.state.point_color || null, r = `${t}|${a}|${o}`;
  return e._pointFieldCache?.key !== r && (e._pointFieldCache = { key: r, ...ac(t, a, o) }), e._pointFieldCache;
}
const dh = 600;
function mh(e) {
  const { points: t, colors: a } = lh(e);
  if (!t.length) return;
  const o = e.viewportCamera(), r = e.canvas.width, n = e.canvas.height, i = t.length / 3, c = 3 * Math.max(1, Math.ceil(i / dh)), l = /* @__PURE__ */ new Map();
  for (let p = 0; p < t.length; p += c) {
    const m = ze([t[p], t[p + 1], t[p + 2]], o, r, n);
    if (!m) continue;
    const h = X(Math.round(5 / Math.sqrt(m[2])), 1, 4), d = `${Math.round(a[p] * 255)},${Math.round(a[p + 1] * 255)},${Math.round(a[p + 2] * 255)}|${h}`;
    let f = l.get(d);
    f || (f = { fill: `rgb(${d.slice(0, d.indexOf("|"))})`, radius: h, xs: [], ys: [] }, l.set(d, f)), f.xs.push(m[0]), f.ys.push(m[1]);
  }
  for (const p of l.values()) {
    e.ctx.fillStyle = p.fill, e.ctx.beginPath();
    for (let m = 0; m < p.xs.length; m += 1)
      e.ctx.moveTo(p.xs[m] + p.radius, p.ys[m]), e.ctx.arc(p.xs[m], p.ys[m], p.radius, 0, Math.PI * 2);
    e.ctx.fill();
  }
}
function ph(e, t) {
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
  for (const [m, h] of p) ce(e, l[m], l[h], "#a0a0a0", 1.4);
}
function fh(e, t) {
  const [a] = t.size || [1.5], [o, r, n] = t.position || [0, 1, 0], i = a / 2;
  for (let c = 0; c < 3; c++) {
    let l = null;
    for (let p = 0; p <= 32; p++) {
      const m = p / 32 * Math.PI * 2;
      let h;
      c === 0 ? h = [o + Math.cos(m) * i, r + Math.sin(m) * i, n] : c === 1 ? h = [o + Math.cos(m) * i, r, n + Math.sin(m) * i] : h = [o, r + Math.cos(m) * i, n + Math.sin(m) * i], l && ce(e, l, h, "#999", 1), l = h;
    }
  }
}
function hh(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], n = t.size?.[1] || 1.8, i = (t.size?.[0] || 0.7) * 0.5, c = [a, o + n * 0.88, r], l = [a, o + n * 0.76, r], p = [a - i * 0.55, o + n * 0.73, r], m = [a + i * 0.55, o + n * 0.73, r], h = [a - i * 0.72, o + n * 0.52, r], d = [a + i * 0.72, o + n * 0.52, r], f = [a - i * 0.82, o + n * 0.34, r], u = [a + i * 0.82, o + n * 0.34, r], b = [a, o + n * 0.44, r], y = [a - i * 0.28, o + n * 0.44, r], g = [a + i * 0.28, o + n * 0.44, r], v = [a - i * 0.28, o + n * 0.22, r], S = [a + i * 0.28, o + n * 0.22, r], x = [a - i * 0.28, o, r + 0.05], A = [a + i * 0.28, o, r + 0.05];
  ce(e, c, l, "#aaa", 2), ce(e, l, b, "#aaa", 2), ce(e, p, m, "#aaa", 2), ce(e, p, h, "#aaa", 2), ce(e, h, f, "#aaa", 2), ce(e, m, d, "#aaa", 2), ce(e, d, u, "#aaa", 2), ce(e, y, g, "#aaa", 2), ce(e, y, v, "#aaa", 2), ce(e, v, x, "#aaa", 2), ce(e, g, S, "#aaa", 2), ce(e, S, A, "#aaa", 2);
  const M = ze(c, e.viewportCamera(), e.canvas.width, e.canvas.height);
  M && (e.ctx.strokeStyle = "#aaa", e.ctx.beginPath(), e.ctx.arc(M[0], M[1], X(28 / M[2], 3, 12), 0, Math.PI * 2), e.ctx.stroke());
}
function uh(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], [n, i, c] = t.size || [1.5, 1.5, 1.5], l = n * 0.5, p = (c || n) * 0.5, m = i * 0.5, h = 12, d = [], f = [];
  for (let u = 0; u < h; u++) {
    const b = u / h * Math.PI * 2, y = Math.cos(b) * l, g = Math.sin(b) * p;
    d.push([a + y, o + m, r + g]), f.push([a + y, o - m, r + g]);
  }
  for (let u = 0; u < h; u++) {
    const b = (u + 1) % h;
    ce(e, d[u], d[b], "#aaa", 1.5), ce(e, f[u], f[b], "#aaa", 1.5);
  }
  for (let u = 0; u < h; u += 3)
    ce(e, d[u], f[u], "#aaa", 1.5);
}
function bh(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], [n, i, c] = t.size || [1.5, 1.5, 1.5], l = n * 0.5, p = n * 0.18, m = 16, h = [], d = [];
  for (let f = 0; f < m; f++) {
    const u = f / m * Math.PI * 2, b = Math.cos(u), y = Math.sin(u);
    h.push([a + b * (l + p), o, r + y * (l + p)]), d.push([a + b * (l - p), o, r + y * (l - p)]);
  }
  for (let f = 0; f < m; f++) {
    const u = (f + 1) % m;
    ce(e, h[f], h[u], "#aaa", 1.5), ce(e, d[f], d[u], "#aaa", 1.5), f % 4 === 0 && ce(e, h[f], d[f], "#888", 1);
  }
}
function gh(e, t) {
  const a = t.position || [0, 1, 0], o = 0.25;
  ce(e, Be(a, [-o, 0, 0]), Be(a, [o, 0, 0]), "#bbb", 2), ce(e, Be(a, [0, -o, 0]), Be(a, [0, o, 0]), "#bbb", 2), ce(e, Be(a, [0, 0, -o]), Be(a, [0, 0, o]), "#bbb", 2);
}
function yh(e, t) {
  const [a, o, r] = t.position || [0, 1.5, 0], [n, i] = t.size || [2, 3], c = e.viewportCamera(), l = [
    [a - n / 2, o - i / 2, r],
    [a + n / 2, o - i / 2, r],
    [a + n / 2, o + i / 2, r],
    [a - n / 2, o + i / 2, r]
  ].map((y) => ze(y, c, e.canvas.width, e.canvas.height));
  if (l.some((y) => !y)) return;
  const p = l.map((y) => y[0]), m = l.map((y) => y[1]), h = Math.min(...p), d = Math.max(...p), f = Math.min(...m), u = Math.max(...m);
  e.ctx.save(), e.ctx.beginPath(), e.ctx.moveTo(l[0][0], l[0][1]);
  for (let y = 1; y < 4; y++) e.ctx.lineTo(l[y][0], l[y][1]);
  e.ctx.closePath(), e.ctx.clip();
  const b = e.cardMediaById.get(t.id) || (t.id === "subject" ? e.cardMedia : null);
  if (b)
    try {
      const y = Math.max(1, d - h), g = Math.max(1, u - f), v = b.videoWidth || b.naturalWidth || b.width, S = b.videoHeight || b.naturalHeight || b.height, x = e.state.card_fit || "contain";
      if (e.ctx.fillStyle = "#111", e.ctx.fillRect(h, f, y, g), x === "stretch" || !v || !S)
        e.ctx.drawImage(b, h, f, y, g);
      else if (x === "contain") {
        const A = Math.min(y / v, g / S), M = v * A, K = S * A;
        e.ctx.drawImage(b, h + (y - M) / 2, f + (g - K) / 2, M, K);
      } else {
        const A = Math.max(y / v, g / S), M = y / A, K = g / A;
        e.ctx.drawImage(b, (v - M) / 2, (S - K) / 2, M, K, h, f, y, g);
      }
    } catch {
    }
  else
    e.ctx.fillStyle = "#3a414b", e.ctx.fillRect(h, f, d - h, u - f), e.ctx.fillStyle = "#d8d8d8", e.ctx.textAlign = "center", e.ctx.font = `${Math.max(12, Math.min(28, (d - h) * 0.08))}px system-ui`, e.ctx.fillText("SUBJECT CARD", (h + d) / 2, (f + u) / 2);
  e.ctx.restore(), e.ctx.strokeStyle = "#b3b8c1", e.ctx.lineWidth = 2, e.ctx.beginPath(), e.ctx.moveTo(l[0][0], l[0][1]);
  for (let y = 1; y < 4; y++) e.ctx.lineTo(l[y][0], l[y][1]);
  e.ctx.closePath(), e.ctx.stroke();
}
function vh(e) {
  const t = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
  (e.state.cameras || []).forEach((a, o) => {
    const r = a.keyframes || [], n = a.color || t[o % t.length], i = a.id === e.state.active_camera_id;
    if (!(i && e.state.view_mode === "camera")) {
      if (r.length >= 2)
        for (let c = 0; c < r.length - 1; c++)
          ce(e, r[c].camera.position, r[c + 1].camera.position, n, i ? 2.2 : 1.2);
      for (const c of r) {
        const l = ze(c.camera.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        l && (e.ctx.fillStyle = c.frame === e.frame ? "#f2d06b" : n, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], i ? 4.5 : 3.5, 0, Math.PI * 2), e.ctx.fill());
      }
      if (e.state.view_mode !== "camera") {
        const c = Ce(a, e.frame, e.state.objects), l = ze(c.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        l && (e.ctx.fillStyle = i ? "#f2d06b" : n, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], i ? 6.5 : 4.5, 0, Math.PI * 2), e.ctx.fill()), c.target && ce(e, c.position, c.target, `${n}88`, 1);
      }
    }
  });
}
function xh(e) {
  if (e.state.keyframes.length < 2) return;
  const t = [];
  for (let o = 0; o < e.state.keyframes.length - 1; o++) {
    const r = e.state.keyframes[o], n = e.state.keyframes[o + 1];
    t.push(On(Pn(n.camera.position, r.camera.position)) * e.state.fps / Math.max(1, n.frame - r.frame));
  }
  const a = Math.max(...t, 1e-6);
  for (let o = 0; o < t.length; o++) {
    const r = 120 * (1 - t[o] / a);
    ce(e, e.state.keyframes[o].camera.position, e.state.keyframes[o + 1].camera.position, `hsl(${r} 85% 55%)`, 5);
  }
}
function wh(e) {
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  if (!e.recording && e.state.view_mode === "camera" && e.state.guides !== !1) {
    t.save(), t.strokeStyle = "#ffffff33", t.lineWidth = 1, t.beginPath();
    for (const r of [a / 3, 2 * a / 3])
      t.moveTo(r, 0), t.lineTo(r, o);
    for (const r of [o / 3, 2 * o / 3])
      t.moveTo(0, r), t.lineTo(a, r);
    t.moveTo(a / 2 - 14, o / 2), t.lineTo(a / 2 + 14, o / 2), t.moveTo(a / 2, o / 2 - 14), t.lineTo(a / 2, o / 2 + 14), t.stroke(), t.restore();
  }
  if (!e.recording && e.state.view_mode === "camera" && e.state.safe_areas && (t.save(), t.strokeStyle = "#00d2d388", t.lineWidth = 1, t.setLineDash([4, 4]), t.strokeRect(a * 0.05, o * 0.05, a * 0.9, o * 0.9), t.strokeStyle = "#feca5788", t.strokeRect(a * 0.1, o * 0.1, a * 0.8, o * 0.8), t.restore()), !e.recording && e.state.view_mode === "camera" && Dc(t, e.state, a, o), !e.recording && e.state.show_gizmo)
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
      tp(e, t, a, o);
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
  e.recording && e.state.playblast_labels && sh(e);
}
async function kh(e, { signal: t } = {}) {
  if (!e?.fetchApi) throw new TypeError("A ComfyUI API client is required");
  const a = await e.fetchApi("/majoor/omnicam/capabilities", { signal: t });
  if (!a.ok) throw new Error(`Capabilities request failed (${a.status || "unknown"})`);
  return a.json();
}
function Sh(e) {
  const t = Array.isArray(e) ? e : [];
  if (!t.length) return { tone: "ok", label: "Core ready" };
  const a = t.length;
  return {
    tone: t.some((o) => o?.severity === "error") ? "error" : "warn",
    label: a === 1 ? "1 optional adapter issue" : `${a} optional adapter issues`
  };
}
async function jh(e) {
  const t = e.root.querySelector('[data-role="setup-badge"]'), a = e.root.querySelector('[data-role="setup-issues"]');
  if (!t || !a) return;
  let o;
  try {
    o = await kh(Xe);
  } catch {
    return;
  }
  e.adapterCapabilities = o;
  const r = o.diagnostic?.issues || [], n = Sh(r);
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
function _s(e, t, a = null, o = null) {
  const r = Array.isArray(e) ? e : [];
  return r.find((n) => n.frame === t) || (a !== null ? r.find((n) => n.frame === a) : null) || (o !== null ? r.find((n) => n.frame === o) : null) || null;
}
function Er(e, t) {
  return (t || e.activeCameraTrack?.())?.target_object_id || e.state.target_object_id || null;
}
function Ar(e, t) {
  const a = t || e.activeCameraTrack?.(), o = a?.aim_bone ?? (a?.id === e.state.active_camera_id ? e.state.aim_bone : null);
  return typeof o == "string" && o ? o : null;
}
function _h(e, t = Er(e)) {
  if (!t) return [];
  const a = e.state.objects.find((o) => o.id === t);
  return !a || a.type !== "model" && a.type !== "glb" ? [] : e.webgl?.listObjectBones?.(t) || [];
}
function Cs(e, t, a) {
  const o = Er(e, t), r = Ar(e, t);
  if (!o || !r) return null;
  const n = e.state.objects.find((p) => p.id === o);
  if (!n || n.enabled === !1) return null;
  const i = e.webgl?.sampleModelPoint?.(o, r, a, e.state.fps || 24);
  if (!i) return null;
  const l = (t || e.activeCameraTrack?.())?.target_offset || e.state.target_offset || [0, 0, 0];
  return [i[0] + (l[0] || 0), i[1] + (l[1] || 0), i[2] + (l[2] || 0)];
}
function Ch(e, t, a) {
  const o = t.type === "model" || t.type === "glb" ? e.webgl?.sampleModelPoint?.(t.id, null, a, e.state.fps || 24) : null;
  return o || (t.keyframes?.length ? Co(t, a).position : t.position || [0, 1.5, 0]);
}
function Tt(e, t, a, o) {
  if (!a) return a;
  const r = Cs(e, t, o);
  return r && (a.target = r), a;
}
function Eh(e, t) {
  const a = t || null;
  e.checkpoint("Change aim bone");
  const o = e.activeCameraTrack();
  o.aim_bone = a, o.id === e.state.active_camera_id && (e.state.aim_bone = a), e.setFrame(e.frame), e.serialize(), e.refreshInspector(), e.render(), e.setStatus(a ? s("Aiming at bone {bone}").replace("{bone}", a) : s("Aiming at the whole object"));
}
function Ah(e, { perFrame: t = !1 } = {}) {
  const a = e.activeCameraTrack(), o = Er(e, a), r = Ar(e, a);
  if (!o || !r) return e.bakeAimToKeyframes();
  const n = e.state.objects.find((c) => c.id === o);
  if (!n || !a.keyframes?.length) return;
  e.checkpoint(t ? "Bake aim per frame" : "Bake aim to keyframes");
  const i = (c) => Cs(e, a, c) || Ch(e, n, c);
  if (t) {
    const c = a.keyframes[0].frame, l = a.keyframes[a.keyframes.length - 1].frame, p = new Map(a.keyframes.map((m) => [m.frame, m]));
    for (let m = c; m <= l; m++) {
      const d = p.get(m) || { frame: m, camera: Ce(a, m, e.state.objects), interpolation: "linear" };
      d.camera.target = [...i(m)], p.set(m, d);
    }
    a.keyframes = [...p.values()].sort((m, h) => m.frame - h.frame);
  } else
    for (const c of a.keyframes) c.camera.target = [...i(c.frame)];
  a.id === e.state.active_camera_id && (e.state.keyframes = a.keyframes), e.setFrame(e.frame), e.serialize(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Aim baked on bone {bone} ({count} keys)").replace("{bone}", r).replace("{count}", String(a.keyframes.length)));
}
function $h(e) {
  const t = e.root?.querySelector('[data-role="camera-aim-bone-row"]'), a = e.root?.querySelector('[data-role="camera-aim-bone"]');
  if (!a) return;
  const o = _h(e);
  t && (t.hidden = o.length === 0);
  const r = Ar(e) || "";
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
function Mh(e, t, a) {
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
function Es(e) {
  const t = e.root.querySelector('[data-role="objects"]');
  if (!t) return;
  t.innerHTML = "", t.onkeydown = (d) => {
    if (d.key === "ArrowUp" || d.key === "ArrowDown") {
      const f = [...t.querySelectorAll('.scene-item[role="button"]')], u = f.indexOf(document.activeElement);
      if (u >= 0) {
        d.preventDefault();
        const b = d.key === "ArrowDown" ? Math.min(f.length - 1, u + 1) : Math.max(0, u - 1);
        b !== u && (f[b].focus(), f[b].click(), f[b].scrollIntoView?.({ block: "nearest", behavior: "smooth" }));
      }
    }
  };
  const a = e.outlinerCategoryFilter || "all", o = e.root.querySelectorAll('[data-role="outliner-filter-chips"] .oc-chip');
  for (const d of o)
    d.classList.toggle("active", (d.dataset.filter || "all") === a);
  const r = (d, f, u, b, y = "") => {
    const g = document.createElement("button");
    return g.type = "button", g.className = "scene-action-btn", u && (g.style.cssText = y || "color:#f59e0b;border-color:#78350f;background:rgba(245,158,11,0.15)"), g.title = s(f), g.innerHTML = `<i class="pi ${d}" style="font-size:10px"></i>`, g.addEventListener("click", (v) => {
      v.stopPropagation(), b(v);
    }), g;
  }, n = (e.outlinerFilter || "").trim().toLowerCase(), i = (d) => !n || String(d || "").toLowerCase().includes(n), c = (d, f, u) => {
    const b = !!(e.outlinerCollapsedSections?.has(u) && !n), y = document.createElement("div");
    return y.className = "scene-section-header", y.dataset.section = u, y.innerHTML = `
      <i class="pi ${b ? "pi-chevron-right" : "pi-chevron-down"}" style="font-size:9px;color:var(--oc-text-dim)"></i>
      <span class="scene-section-title">${d}</span>
      <span class="scene-section-count">(${f})</span>
    `, y.addEventListener("click", () => {
      e.outlinerCollapsedSections ||= /* @__PURE__ */ new Set(), e.outlinerCollapsedSections.has(u) ? e.outlinerCollapsedSections.delete(u) : e.outlinerCollapsedSections.add(u), Es(e);
    }), { header: y, isCollapsed: b };
  }, l = (d) => ["sun_light", "point_light", "spot_light"].includes(d), p = a === "all" || a === "cameras" || a === "hidden" && e.state.cameras.some((d) => d.muted), m = a === "all" || a === "objects" || a === "lights" || a === "hidden" && e.state.objects.some((d) => d.enabled === !1);
  if (p) {
    const d = e.state.cameras.filter((b) => !(!i(b.name) || a === "hidden" && !b.muted)), { header: f, isCollapsed: u } = c(s("Cameras"), d.length, "cameras");
    if (t.appendChild(f), !u)
      for (const b of d) {
        const y = document.createElement("div");
        y.role = "button", y.tabIndex = 0, y.dataset.cameraId = b.id;
        const g = b.id === e.state.active_camera_id, v = b.id === e.state.playblast_camera_id, S = e.selectedEntity === "camera" && g;
        y.setAttribute("aria-selected", String(S)), y.className = `scene-item${S ? " selected" : ""}${g && !S ? " active-view" : ""}`;
        const x = document.createElement("i");
        x.className = "pi pi-video", x.style.cssText = "color:#60a5fa";
        const A = document.createElement("span");
        if (A.className = "scene-item-label", S || g) {
          const L = document.createElement("span");
          L.style.cssText = `color:${S ? "#f59e0b" : "#58cc6b"};font-weight:700`, L.textContent = S ? "● " : "○ ", A.appendChild(L);
        }
        if (A.appendChild(document.createTextNode(b.name)), v) {
          const L = document.createElement("span");
          L.style.cssText = "color:#f2d06b;font-size:10px", L.title = "Playblast Output", L.textContent = " ★", A.appendChild(L);
        }
        if (b.muted) {
          const L = document.createElement("span");
          L.style.opacity = ".6", L.textContent = " (muted)", A.appendChild(L);
        }
        const M = document.createElement("div");
        M.className = "scene-item-actions", M.appendChild(r("pi-star", "Solo track", b.solo, () => {
          e.checkpoint("Solo track"), b.solo = !b.solo, e.serialize(), e.refreshObjects(), e.renderCameraView();
        }, "color:#fbbf24;border-color:#78350f;background:rgba(245,158,11,0.2)")), M.appendChild(r("pi-volume-off", "Mute track", b.muted, () => {
          e.checkpoint("Mute track"), b.muted = !b.muted, e.serialize(), e.refreshObjects(), e.renderCameraView();
        }, "color:#f87171;border-color:#7f1d1d;background:rgba(239,68,68,0.15)")), M.appendChild(r("pi-lock", "Lock track", b.locked, () => {
          e.checkpoint("Lock track"), b.locked = !b.locked, e.serialize(), e.refreshObjects(), e.renderCameraView();
        })), (b.keyframes || []).length >= 1 && M.appendChild(r(
          "pi-arrows-alt",
          "Select whole path (move / scale / rotate)",
          e.selectedEntity === "camera_path" && g,
          () => {
            e.activateCamera(b.id), e.selectCameraPath();
          }
        )), M.appendChild(r("pi-ellipsis-v", "Camera actions", !1, (L) => e.openCameraContext(L, b.id, !1))), y.append(x, A, M), y.title = S ? s("Currently selected for editing") : v ? s("Active playblast camera") : s("Click to select & activate this camera");
        const K = () => {
          e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(b.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Camera: ${b.name}`));
        };
        y.addEventListener("contextmenu", (L) => {
          L.preventDefault(), L.stopPropagation(), e.openCameraContext(L, b.id, !1);
        }), y.addEventListener("keydown", (L) => {
          (L.key === "Enter" || L.key === " ") && (L.preventDefault(), K());
        }), t.appendChild(y);
      }
  }
  if (m) {
    const d = new Map(e.state.objects.map((x) => [x.id, x])), f = /* @__PURE__ */ new Map(), u = [];
    for (const x of e.state.objects)
      x.parent_id && d.has(x.parent_id) ? (f.has(x.parent_id) || f.set(x.parent_id, []), f.get(x.parent_id).push(x)) : u.push(x);
    const b = [], y = (x, A) => {
      b.push({ object: x, level: A });
      const M = f.get(x.id) || [];
      for (const K of M) y(K, A + 1);
    };
    for (const x of u) y(x, 0);
    const g = b.filter(({ object: x }) => {
      const A = [x.name, x.type, ...x.tags || [], x.asset_kind, x.asset_id].filter(Boolean).join(" ");
      return !(!i(A) || a === "lights" && !l(x.type) || a === "objects" && l(x.type) || a === "hidden" && x.enabled !== !1);
    }), { header: v, isCollapsed: S } = c(a === "lights" ? s("Lights") : s("Objects"), g.length, "objects");
    if (t.appendChild(v), !S)
      for (const { object: x, level: A } of g) {
        const M = document.createElement("div");
        M.role = "button", M.tabIndex = 0, M.dataset.objectId = x.id;
        const K = e.selectedEntity === "object" && (x.id === e.selectedObjectId || e.selectedObjectIds?.has?.(x.id)), L = e.selectedEntity === "object" && x.id === e.selectedObjectId;
        M.setAttribute("aria-selected", String(K)), M.className = `scene-item${K ? " selected" : ""}${L ? " primary" : ""}${A > 0 && !n ? " scene-item-child" : ""}`, A > 0 && !n && (M.style.paddingLeft = `${A * 16 + 6}px`);
        const Y = x.type === "card" ? { icon: "pi-image", color: "#38bdf8" } : x.type === "model" || x.type === "glb" ? { icon: "pi-box", color: "#c084fc" } : x.type === "ground" ? { icon: "pi-minus", color: "#fbbf24" } : x.type === "cube" ? { icon: "pi-stop", color: "#fbbf24" } : x.type === "sphere" ? { icon: "pi-circle", color: "#fbbf24" } : x.type === "cylinder" ? { icon: "pi-database", color: "#fbbf24" } : x.type === "torus" ? { icon: "pi-circle", color: "#fbbf24" } : x.type === "pyramid" ? { icon: "pi-play", color: "#fbbf24" } : x.type === "sun_light" ? { icon: "pi-sun", color: "#f59e0b" } : x.type === "point_light" ? { icon: "pi-bolt", color: "#fbbf24" } : x.type === "spot_light" ? { icon: "pi-compass", color: "#38bdf8" } : x.type === "human" ? { icon: "pi-user", color: "#34d399" } : { icon: "pi-plus", color: "#94a3b8" }, U = x.enabled !== !1, H = !!x.load_error, ne = document.createElement("i");
        ne.className = `pi ${H ? "pi-exclamation-triangle" : Y.icon}`, ne.style.cssText = H ? "color:#f87171" : U ? `color:${Y.color}` : "opacity:.4";
        const j = document.createElement("span");
        j.className = "scene-item-label";
        const F = document.createElement("span");
        F.style.cssText = H ? "color:#fca5a5" : U ? "" : "opacity:.5;text-decoration:line-through", F.textContent = x.name || x.type, F.title = s("Double-click to rename"), F.addEventListener("dblclick", ($) => {
          $.preventDefault(), $.stopPropagation(), Mh(e, x, F);
        }), j.appendChild(F);
        const q = Array.isArray(x.tags) ? x.tags : [];
        if (q.length) {
          const $ = document.createElement("span");
          $.className = "scene-item-tags";
          for (const W of q.slice(0, 2)) {
            const P = document.createElement("span");
            P.className = "scene-item-tag", P.textContent = W, $.appendChild(P);
          }
          if (q.length > 2) {
            const W = document.createElement("span");
            W.className = "scene-item-tag scene-item-tag-more", W.textContent = `+${q.length - 2}`, $.appendChild(W);
          }
          j.appendChild($);
        }
        if (H) {
          const $ = document.createElement("span");
          $.style.cssText = "color:#ef4444;font-size:9px;font-weight:700", $.textContent = " [Format!]", j.appendChild($);
        }
        const G = document.createElement("div");
        G.className = "scene-item-actions", G.appendChild(r(U ? "pi-eye" : "pi-eye-slash", U ? "Hide object (Alt+Click to Isolate)" : "Show object (Alt+Click to Isolate)", !U, ($) => {
          if ($?.altKey) {
            if (e.checkpoint("Isolate object"), e._isolatedObjectId === x.id) {
              e._isolatedObjectId = null;
              const P = e._isolationSnapshot;
              for (const V of e.state.objects)
                V.enabled = P && Object.prototype.hasOwnProperty.call(P, V.id) ? P[V.id] : !0;
              e._isolationSnapshot = null, e.setStatus?.(s("Isolation cleared"));
            } else {
              e._isolationSnapshot || (e._isolationSnapshot = Object.fromEntries(e.state.objects.map((P) => [P.id, P.enabled !== !1]))), e._isolatedObjectId = x.id;
              for (const P of e.state.objects) P.enabled = P.id === x.id;
              e.setStatus?.(s("Isolated: {name}").replace("{name}", x.name || x.type));
            }
            e.serialize(), e.refreshObjects(), e.requestRender?.();
          } else
            e.toggleObject(x.id);
        }, "color:#ef4444;opacity:.7")), G.appendChild(r(x.locked ? "pi-lock" : "pi-lock-open", "Lock object", x.locked, () => wr(e, x))), G.appendChild(r("pi-copy", "Duplicate object", !1, () => e.duplicateObject?.(x.id))), x.id !== "subject" && G.appendChild(r("pi-trash", "Delete object", !1, () => e.deleteObject?.(x.id))), G.appendChild(r("pi-ellipsis-v", "Object actions", !1, ($) => e.openObjectContext($, x.id))), M.append(ne, j, G), M.title = s("Click to select · Double-click to toggle visibility · Right-click for actions");
        const oe = ($ = {}) => {
          if ($.altKey && x.id !== "subject") return void e.deleteObject(x.id);
          if (e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectIds ||= /* @__PURE__ */ new Set(), $.ctrlKey || $.metaKey)
            e.selectedObjectIds.has(x.id) ? e.selectedObjectIds.delete(x.id) : e.selectedObjectIds.add(x.id), e.outlinerAnchorId = x.id;
          else if ($.shiftKey && e.outlinerAnchorId && e.state.objects.some((P) => P.id === e.outlinerAnchorId)) {
            const P = e.state.objects.map((de) => de.id), V = P.indexOf(e.outlinerAnchorId), Z = P.indexOf(x.id);
            e.selectedObjectIds = new Set(P.slice(Math.min(V, Z), Math.max(V, Z) + 1));
          } else
            e.selectedObjectIds = /* @__PURE__ */ new Set([x.id]), e.outlinerAnchorId = x.id;
          e.selectedObjectId = e.selectedObjectIds.has(x.id) ? x.id : [...e.selectedObjectIds].at(-1) || null, e.selectedEntity = e.selectedObjectIds.size ? "object" : "camera", e.selectedKeyFrame = e.selectedObjectId ? x.keyframes?.find((P) => P.frame === e.frame)?.frame ?? null : null, e.editingKeyFrame = null;
          for (const P of t.querySelectorAll(".scene-item")) {
            const V = !!(P.dataset.objectId && e.selectedObjectIds.has(P.dataset.objectId)), Z = !!(P.dataset.objectId && P.dataset.objectId === e.selectedObjectId);
            P.classList.toggle("selected", V), P.classList.toggle("primary", Z), P.dataset.objectId && P.setAttribute("aria-selected", String(V));
          }
          const W = e.root.querySelector('[data-role="outliner-batch-bar"]');
          if (W) {
            const P = e.selectedObjectIds?.size || 0;
            W.hidden = P < 2;
            const V = W.querySelector('[data-role="batch-count"]');
            V && (V.textContent = `${P} ${s("selected")}`);
          }
          e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Selected: ${x.name || x.type}`));
        };
        M.addEventListener("dblclick", () => e.toggleObject(x.id)), M.addEventListener("contextmenu", ($) => {
          $.preventDefault(), $.stopPropagation(), e.openObjectContext($, x.id);
        }), M.addEventListener("keydown", ($) => {
          ($.key === "Enter" || $.key === " ") && ($.preventDefault(), oe($));
        }), t.appendChild(M);
      }
  }
  const h = e.root.querySelector('[data-role="outliner-batch-bar"]');
  if (h) {
    const d = e.selectedObjectIds?.size || 0;
    h.hidden = d < 2;
    const f = h.querySelector('[data-role="batch-count"]');
    f && (f.textContent = `${d} ${s("selected")}`);
  }
  e.refreshInspector();
}
function qo(e, t, a, o) {
  e && document.activeElement !== e && (e.__omnicamOptionSig !== t && (e.__omnicamOptionSig = t, e.replaceChildren(...a())), e.value = o);
}
function At(e, t) {
  const a = document.createElement("option");
  return a.value = e, a.textContent = t, a;
}
function Th(e, t) {
  e.checkpoint("Create object");
  const a = `${t}_${Date.now().toString(36)}`, o = t === "ground", r = t === "human", n = t === "card", i = t === "cylinder", c = t === "torus", l = t === "pyramid", p = t === "sun_light", m = t === "point_light", h = t === "spot_light";
  let d;
  r ? d = s("Human Proxy") : n ? d = s("Card") : i ? d = s("Cylinder") : c ? d = s("Torus") : l ? d = s("Pyramide") : p ? d = s("Sun light") : m ? d = s("Point light") : h ? d = s("Spot light") : d = t[0].toUpperCase() + t.slice(1);
  let f;
  o ? f = [12, 0.1, 12] : r ? f = [0.7, 1.8, 0.4] : n ? f = [2, 3] : f = [1.5, 1.5, 1.5];
  let u = [0, 0, 0], b = [0, 0, 0], y = "#8c929b", g, v, S, x;
  p ? (u = [5, 8.5, 4], b = [-55, 35, 0], y = "#fff6ec", g = 2.2, v = !0) : m ? (u = [0, 3, 0], y = "#ffffff", g = 2, v = !1) : h && (u = [0, 4, 0], b = [-60, 0, 0], y = "#ffffff", g = 3, S = 45, x = 0.25, v = !0);
  const A = {
    id: a,
    type: t,
    name: d,
    position: u,
    rotation: b,
    size: f,
    color: y,
    material_mode: o ? "checker" : "textured",
    ...g !== void 0 ? { intensity: g } : {},
    ...v !== void 0 ? { cast_shadow: v } : {},
    ...S !== void 0 ? { cone_angle: S } : {},
    ...x !== void 0 ? { penumbra: x } : {},
    keyframes: [],
    enabled: !0
  };
  e.state.objects.push(A), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedObjectIds = /* @__PURE__ */ new Set([a]), e.selectedKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render();
}
async function Ih(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  if (!a) return;
  const o = (await zt(e, s("Rename object"), s("Object name"), a.name || a.type))?.trim();
  e.disposed || !e.state.objects.includes(a) || !o || o === a.name || (e.checkpoint("Rename object"), a.name = o.slice(0, 80), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(s(`Object renamed: ${a.name}`)));
}
function As(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  if (!a) return;
  e.checkpoint("Duplicate object");
  const o = JSON.parse(JSON.stringify(a));
  o.id = `${a.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, o.name = `${a.name || a.type} Copy`, o.position = Be(o.position || [0, 0, 0], [0.35, 0, 0.35]), (o.type === "model" || o.type === "glb") && e.modelUrlsById.has(a.id) ? e.modelUrlsById.set(o.id, e.modelUrlsById.get(a.id)) : o.type === "card" && e.cardMediaById.has(a.id) && We(e, o.id, e.cardMediaById.get(a.id), !1, o.asset || e.cardMediaAssetById?.get?.(a.id) || ""), e.state.objects.push(o), e.selectedEntity = "object", e.selectedObjectId = o.id, e.selectedObjectIds = /* @__PURE__ */ new Set([o.id]), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s(`${o.name} added`));
}
function Oh(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint(a.enabled === !1 ? "Show object" : "Hide object"), a.enabled = a.enabled === !1, e.serialize(), e.refreshObjects(), e.render(), e.setStatus(s(`${a.name || a.type} ${a.enabled ? "shown" : "hidden"}`)));
}
async function $s(e, t) {
  if (t === "subject") return e.setStatus(s("The subject card cannot be deleted"));
  const a = e.state.objects.find((o) => o.id === t);
  if (a && await Nt(e, s("Delete object"), s(`Delete ${a.name || a.type} and its ${(a.keyframes || []).length} keyframe(s)?`)) && !(e.disposed || !e.state.objects.includes(a))) {
    e.checkpoint("Delete object");
    for (const o of e.state.objects) o.parent_id === t && (o.parent_id = null);
    e.state.objects = e.state.objects.filter((o) => o.id !== t), e.selectedObjectIds?.delete(t), e.removeObjectResources(t), e.selectedObjectId === t && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = e.state.keyframes.find((o) => o.frame === e.frame)?.frame ?? null), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s(`${a.name || a.type} deleted`));
  }
}
async function Ph(e) {
  const t = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((r) => r && r !== "subject" && e.state.objects.some((n) => n.id === r));
  if (!t.length) {
    e.selectedObjectId === "subject" && e.setStatus(s("The subject card cannot be deleted"));
    return;
  }
  if (t.length === 1) return $s(e, t[0]);
  const a = s("Delete {count} objects and their keyframes?").replace("{count}", String(t.length));
  if (!await Nt(e, s("Delete objects"), a) || e.disposed) return;
  e.checkpoint("Delete objects");
  const o = new Set(t);
  for (const r of e.state.objects) r.parent_id && o.has(r.parent_id) && (r.parent_id = null);
  e.state.objects = e.state.objects.filter((r) => !o.has(r.id));
  for (const r of t) e.removeObjectResources(r);
  e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.selectedKeyFrame = e.state.keyframes.find((r) => r.frame === e.frame)?.frame ?? null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s("{count} objects deleted").replace("{count}", String(t.length)));
}
function Lh(e) {
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
function Dt(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function gn(e, t) {
  const a = e('[data-role="curve-group"]');
  if (a)
    for (const o of a.options) {
      const r = t[o.value];
      r && (o.textContent = r);
    }
}
function Fh(e) {
  const t = Dt(e), a = e.root.querySelector('[data-role="object-panel"]');
  a && (a.hidden = !t);
  const o = (j) => e.root.querySelector(j), r = e.activeCameraTrack(), n = o('[data-role="camera-target-object"]');
  if (n) {
    const j = r.target_object_id || e.state.target_object_id || "", F = `T${Lr()}${e.state.objects.map((q) => `${q.id}\0${q.name || q.type}`).join("|")}`;
    qo(n, F, () => [
      At("", s("Manual Target (No Tracking)")),
      ...e.state.objects.map((q) => At(q.id, `${s("Track:")} ${q.name || q.type}`))
    ], j);
  }
  $h(e);
  const i = [...e.camera.position, ...e.camera.target, e.camera.fov, e.camera.roll || 0, e.camera.near, e.camera.far, ...hr(e.camera)];
  ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far", "camera-rx", "camera-ry", "camera-rz"].forEach((j, F) => {
    for (const q of e.root.querySelectorAll(`[data-role="${j}"]`))
      document.activeElement !== q && (q.value = String(Math.round(i[F] * 1e4) / 1e4));
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
    const F = o('[data-role="selected-name"]');
    F && (F.textContent = `${r.name} · F${e.frame}`), gn(o, {
      camera: s("Camera (Position, Focal, Roll)"),
      position: s("Position XYZ"),
      target: s("Target XYZ"),
      lens: s("FOV / Roll / Zoom")
    }), e.rigMapper?.sync(), e.poseEditor?.sync(), e.motionEditor?.sync();
    return;
  }
  const c = o('[data-role="object-recon-badge"]');
  if (c) {
    const j = Vp(t);
    if (j) {
      c.hidden = !1;
      const F = j.semantic ? `${j.semantic} · ` : "";
      c.textContent = `${F}${j.label} (${Math.round(j.confidence * 100)}%)`, c.title = j.title, c.className = `oc-recon-badge oc-badge-${j.band}`;
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
  m && (m.textContent = t.name || t.type), gn(o, {
    camera: s("Position XYZ"),
    position: s("Position XYZ"),
    target: s("Rotation XYZ"),
    lens: s("Scale XYZ")
  });
  const h = t.rotation || [0, 0, 0], d = t.size || [1, 1, 1], f = {
    "object-x": p[0],
    "object-y": p[1],
    "object-z": p[2],
    "object-rx": h[0],
    "object-ry": h[1],
    "object-rz": h[2],
    "object-sx": d[0] ?? 1,
    "object-sy": d[1] ?? 1,
    "object-sz": d[2] ?? 1
  };
  for (const [j, F] of Object.entries(f))
    for (const q of e.root.querySelectorAll(`[data-role="${j}"]`))
      document.activeElement !== q && (q.value = String(Math.round(F * 1e4) / 1e4));
  for (const j of e.root.querySelectorAll('[data-role="object-material"]'))
    document.activeElement !== j && (j.value = t.material_mode || "textured");
  for (const j of e.root.querySelectorAll('[data-role="object-color"]'))
    document.activeElement !== j && (j.value = t.color || "#8c929b");
  for (const j of e.root.querySelectorAll('[data-role="object-light-color"]'))
    document.activeElement !== j && (j.value = t.color || "#ffffff");
  for (const j of e.root.querySelectorAll("[data-transform-mode]")) j.classList.toggle("active", j.dataset.transformMode === (e.state.gizmo_mode || "translate"));
  const u = o('[data-role="animation-row"]'), b = o('[data-role="animation-select"]'), y = o('[data-role="object-parent"]');
  if (y) {
    const j = t.id, F = /* @__PURE__ */ new Set([j]);
    let q = !0;
    for (; q; ) {
      q = !1;
      for (const $ of e.state.objects)
        !F.has($.id) && $.parent_id && F.has($.parent_id) && (F.add($.id), q = !0);
    }
    const G = e.state.objects.filter(($) => !F.has($.id)), oe = `P${Lr()}${j}${G.map(($) => `${$.id} ${$.name || $.type}`).join("|")}`;
    qo(y, oe, () => [
      At("", s("No parent")),
      ...G.map(($) => At($.id, $.name || $.type))
    ], t.parent_id || "");
  }
  const g = ["sun_light", "point_light", "spot_light"].includes(t.type), v = t.type === "spot_light", S = o('[data-role="light-props-row"]');
  S && (S.hidden = !g);
  const x = o('[data-role="spot-props-row"]');
  x && (x.hidden = !v);
  const A = o('[data-role="material-row"]');
  A && (A.hidden = g);
  const M = o('[data-role="scale-row"]');
  M && (M.hidden = g);
  const K = o('[data-role="rotation-row"]');
  if (K && (K.hidden = t.type === "point_light"), g) {
    const j = o('[data-role="object-intensity"]');
    j && document.activeElement !== j && (j.value = String(t.intensity ?? (t.type === "sun_light" ? 2.2 : t.type === "spot_light" ? 3 : 2)));
    const F = o('[data-role="object-cast-shadow"]');
    if (F && (F.checked = t.cast_shadow !== !1), v) {
      const q = o('[data-role="object-cone-angle"]');
      q && document.activeElement !== q && (q.value = String(t.cone_angle ?? 45));
      const G = o('[data-role="object-penumbra"]');
      G && document.activeElement !== G && (G.value = String(t.penumbra ?? 0.25));
    }
  }
  const L = e.modelInfoById.get(t.id);
  if (u && (u.hidden = !L?.animations), b) {
    const j = L?.animationNames || [];
    qo(b, `A${j.join("|")}`, () => j.map((F, q) => At(String(q), F)), String(t.animation_index || 0));
  }
  const Y = o('[data-role="object-tags"]');
  Y && document.activeElement !== Y && (Y.value = (t.tags || []).join(", "));
  const U = o('[data-role="object-annotation"]');
  U && document.activeElement !== U && (U.value = t.annotation?.text || "");
  const H = o('[data-role="object-annotation-color"]');
  H && document.activeElement !== H && (H.value = t.annotation?.color || "#8d7ee8");
  const ne = o('[data-role="object-annotation-anchor"]');
  ne && document.activeElement !== ne && (ne.value = t.annotation?.anchor || "top"), e.rigMapper?.sync(), e.poseEditor?.sync(), e.motionEditor?.sync();
}
function zh(e) {
  const t = Dt(e);
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
      p && p.value !== "" && (t.cone_angle = X(Number(p.value) || 45, 1, 90));
      const m = e.root.querySelector('[data-role="object-penumbra"]');
      m && m.value !== "" && (t.penumbra = X(Number(m.value) || 0.25, 0, 1));
    }
  }
  e.commitObjectEdit(t), e.refreshObjects(), e.render();
}
function Ms(e, t) {
  if (!t) return null;
  if (t.locked)
    return e.setStatus(s(`${t.name || t.type} is locked`)), null;
  t.keyframes ||= [];
  let a = _s(
    t.keyframes,
    e.frame,
    e.state.auto_key ? null : e.selectedKeyFrame,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, transform: Ve(t), interpolation: e.root.querySelector('[data-role="interp"]')?.value || "ease" }, t.keyframes.push(a), t.keyframes.sort((o, r) => o.frame - r.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame, e.updateKeyVisualState()) : a && (e.selectedKeyFrame = a.frame, e.updateKeyVisualState()), a;
}
function Nh(e, t) {
  const a = Ms(e, t);
  a && (a.transform = Ve(t)), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor();
}
function Ts(e) {
  const t = hr(e.camera);
  ["camera-rx", "camera-ry", "camera-rz"].forEach((a, o) => {
    for (const r of e.root.querySelectorAll(`[data-role="${a}"]`))
      document.activeElement !== r && (r.value = String(Math.round(t[o] * 1e4) / 1e4));
  });
}
function Rh(e) {
  ["camera-tx", "camera-ty", "camera-tz"].forEach((t, a) => {
    for (const o of e.root.querySelectorAll(`[data-role="${t}"]`))
      document.activeElement !== o && (o.value = String(Math.round(e.camera.target[a] * 1e4) / 1e4));
  });
}
function Kh(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastCameraHudEditAt) || t - e.lastCameraHudEditAt > 300) && e.checkpoint("Edit camera"), e.lastCameraHudEditAt = t;
  const a = (n, i) => {
    const c = e.root.querySelector(`[data-role="${n}"]`);
    if (!c || c.value === "") return i;
    const l = Number(c.value);
    return Number.isFinite(l) ? l : i;
  }, o = hr(e.camera), r = [
    X(a("camera-rx", o[0]), -90, 90),
    a("camera-ry", o[1]),
    X(a("camera-rz", o[2]), -180, 180)
  ];
  e.beginCameraEdit(), oc(e.camera, r), e.commitCameraEdit(), e.finishCameraEdit(), Ts(e), Rh(e), e.render();
}
function Dh(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastCameraHudEditAt) || t - e.lastCameraHudEditAt > 300) && e.checkpoint("Edit camera"), e.lastCameraHudEditAt = t;
  const a = (o, r) => {
    const n = e.root.querySelector(`[data-role="${o}"]`);
    if (!n || n.value === "") return r;
    const i = Number(n.value);
    return Number.isFinite(i) ? i : r;
  };
  e.camera.position = [a("camera-px", e.camera.position[0]), a("camera-py", e.camera.position[1]), a("camera-pz", e.camera.position[2])], e.camera.target = [a("camera-tx", e.camera.target[0]), a("camera-ty", e.camera.target[1]), a("camera-tz", e.camera.target[2])], e.camera.fov = X(a("camera-fov", e.camera.fov), 5, 150), e.camera.roll = X(a("camera-roll", e.camera.roll || 0), -180, 180), e.camera.near = Math.max(1e-4, a("camera-near", e.camera.near)), e.camera.far = Math.max(e.camera.near + 1e-4, a("camera-far", e.camera.far)), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), Ts(e), e.render();
}
function Bh(e, t) {
  const a = Dt(e);
  if (!a) return;
  e.checkpoint("Set parent"), a.parent_id = t || null, e.serialize(), e.refreshObjects(), e.render();
  const o = e.state.objects.find((r) => r.id === t);
  e.setStatus(o ? s(`${a.name || a.type} parented to ${o.name || o.type}`) : s(`${a.name || a.type} unparented`));
}
function qh(e, t) {
  const a = Dt(e);
  a && (e.checkpoint("Select animation"), a.animation_index = Math.max(0, t || 0), e.serialize(), e.webgl?.selectAnimation(a.id, t), e.setStatus(s(`Animation: ${e.modelInfoById.get(a.id)?.animationNames?.[t] || t + 1}`)));
}
function Uh(e, t) {
  e.objectUrls.revoke(t), Kt(e, t), e.modelUrlsById.delete(t), e.modelInfoById.delete(t), e.webgl?.removeModel(t);
}
function Wh(e) {
  const t = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((o) => o && e.state.objects.some((r) => r.id === o));
  if (!t.length) return [];
  if (t.length === 1)
    return As(e, t[0]), e.selectedObjectId ? [e.selectedObjectId] : [];
  e.checkpoint("Duplicate objects");
  const a = [];
  return t.forEach((o, r) => {
    const n = e.state.objects.find((l) => l.id === o);
    if (!n) return;
    const i = JSON.parse(JSON.stringify(n));
    i.id = `${n.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, i.name = `${n.name || n.type} Copy`;
    const c = 0.35 + r * 0.15;
    i.position = Be(i.position || [0, 0, 0], [c, 0, c]), (i.type === "model" || i.type === "glb") && e.modelUrlsById.has(n.id) ? e.modelUrlsById.set(i.id, e.modelUrlsById.get(n.id)) : i.type === "card" && e.cardMediaById.has(n.id) && We(e, i.id, e.cardMediaById.get(n.id), !1, i.asset || e.cardMediaAssetById?.get?.(n.id) || ""), e.state.objects.push(i), a.push(i.id);
  }), a.length && (e.selectedEntity = "object", e.selectedObjectIds = new Set(a), e.selectedObjectId = a[a.length - 1], e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Duplicated {count} objects").replace("{count}", String(a.length)))), a;
}
function Vh(e, t = null) {
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
function Hh(e, t = null) {
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
function Gh(e) {
  const t = (e.state.objects || []).filter((a) => a.id);
  t.length && (e.finishCameraEdit?.(), e.selectedEntity = "object", e.selectedObjectIds = new Set(t.map((a) => a.id)), e.selectedObjectId = t[t.length - 1].id, e.outlinerAnchorId = e.selectedObjectId, e.selectedKeyFrame = null, e.editingKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Selected all {count} objects").replace("{count}", String(t.length))));
}
function Is(e) {
  e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.outlinerAnchorId = null, e.selectedKeyFrame = e.state.keyframes.find((t) => t.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Selection cleared"));
}
function Yh(e) {
  const t = e.selectedObjectIds || new Set(e.selectedObjectId ? [e.selectedObjectId] : []), a = (e.state.objects || []).map((o) => o.id).filter((o) => o && !t.has(o));
  if (!a.length) {
    Is(e);
    return;
  }
  e.finishCameraEdit?.(), e.selectedEntity = "object", e.selectedObjectIds = new Set(a), e.selectedObjectId = a[a.length - 1], e.outlinerAnchorId = e.selectedObjectId, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Inverted selection ({count} objects)").replace("{count}", String(a.length)));
}
function Xh(e, t) {
  return t(Nn(e), e.frame);
}
function Me(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function Se(e) {
  return Me(e)?.keyframes || e.state.keyframes;
}
function Zh(e, t) {
  for (const a of e.state.objects) {
    if (!a.keyframes?.length) continue;
    const o = t(a, e.frame);
    a.position = o.position, a.rotation = o.rotation, a.size = o.size;
  }
}
function Jh(e) {
  e.checkpoint("Set keyframe");
  const t = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease", a = Me(e), o = Se(e), r = a ? { frame: e.frame, transform: Ve(a), interpolation: t } : { frame: e.frame, camera: he(e.camera), interpolation: t }, n = o.findIndex((i) => i.frame === e.frame);
  n >= 0 ? o[n] = r : o.push(r), o.sort((i, c) => i.frame - c.frame), e.selectedKeyFrame = e.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([e.frame]), e.editingKeyFrame = null, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor(), e.setStatus(s(`${a?.name || "Camera"} ${n >= 0 ? "key updated" : "key inserted"} @ ${e.frame}`));
}
function Qh(e, t) {
  const a = Ne(e);
  if (!a) return;
  e.checkpoint("Change key interpolation"), a.interpolation = t;
  const o = e.root.querySelector('[data-role="key-interp"]');
  o && (o.value = t);
  for (const r of e.root.querySelectorAll("[data-interp]"))
    r.classList.toggle("active", r.dataset.interp === t);
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(s(`Key @ ${a.frame} interpolation set to ${t}`));
}
function eu(e) {
  const t = Me(e), a = Se(e);
  if (!t && a.length <= 1) return e.setStatus(s("Keep at least one camera keyframe"));
  const o = Ne(e) || a.find((i) => i.frame === e.frame);
  if (!o) return e.setStatus(s("Select a keyframe to delete"));
  e.checkpoint("Delete keyframe"), t ? t.keyframes = a.filter((i) => i !== o) : e.state.keyframes = a.filter((i) => i !== o);
  const r = Se(e), n = o.frame;
  e.editingKeyFrame === n && (e.editingKeyFrame = null), e.selectedKeyFrame = r.length ? r.reduce((i, c) => Math.abs(c.frame - n) < Math.abs(i.frame - n) ? c : i).frame : null, e.camera = Ce(e.state, e.frame), e.applyObjectAnimationFrame(), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(s(`${t?.name || "Camera"} key deleted @ ${n}`));
}
function tu(e) {
  const t = Me(e), a = Ne(e) || Se(e).find((o) => o.frame === e.frame);
  e.copiedKeyframe = t ? { kind: "object", transform: Ve(a?.transform || t), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" } : { kind: "camera", camera: he(a?.camera || e.camera), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" }, e.setStatus(s(`Keyframe copied @ ${a?.frame ?? e.frame}`));
}
function au(e) {
  if (!e.copiedKeyframe) return e.setStatus(s("Copy a keyframe first"));
  const t = Me(e), a = t ? "object" : "camera";
  if (e.copiedKeyframe.kind !== a) return e.setStatus(s(`Copy a ${a} keyframe first`));
  e.checkpoint("Paste keyframe");
  const o = t ? { frame: e.frame, transform: Ve(e.copiedKeyframe.transform), interpolation: e.copiedKeyframe.interpolation } : { frame: e.frame, camera: he(e.copiedKeyframe.camera), interpolation: e.copiedKeyframe.interpolation }, r = Se(e), n = r.findIndex((i) => i.frame === e.frame);
  n >= 0 ? r[n] = o : r.push(o), r.sort((i, c) => i.frame - c.frame), e.selectedKeyFrame = o.frame, e.editingKeyFrame = null, t ? (t.position = [...o.transform.position], t.rotation = [...o.transform.rotation], t.size = [...o.transform.size]) : e.camera = he(o.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(s(`Keyframe pasted @ ${o.frame}`));
}
function Ne(e) {
  return Se(e).find((t) => t.frame === e.selectedKeyFrame) || null;
}
function ou(e, t) {
  t && (e.selectedKeyFrame = t.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([t.frame]), e.editingKeyFrame = null, e.setFrame(t.frame));
}
function ru(e) {
  const t = e.activeCameraTrack();
  if (t?.locked)
    return e.setStatus(s(`${t.name} is locked`)), null;
  let a = _s(
    e.state.keyframes,
    e.frame,
    !e.state.auto_key && e.selectedEntity === "camera" ? e.selectedKeyFrame : null,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, camera: he(e.camera), interpolation: e.root.querySelector('[data-role="key-interp"]')?.value || "ease" }, e.state.keyframes.push(a), e.state.keyframes.sort((o, r) => o.frame - r.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame) : a && (e.selectedKeyFrame = a.frame), e.cameraEditKey = a || null, e.cameraEditActive = !0, e.updateKeyVisualState(), a;
}
function nu(e) {
  const t = e.cameraEditKey;
  t && (t.camera = he(e.camera), e.frame = t.frame, e.selectedKeyFrame = t.frame), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.render();
}
function su(e) {
  if (e.cameraEditActive) {
    if (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, e.selectedKeyFrame === null) {
      const t = e.state.keyframes.find((a) => a.frame === e.frame);
      t && (e.selectedKeyFrame = t.frame);
    }
    e.refreshKeys();
  }
}
function iu(e, t = !1) {
  e.editingKeyFrame === null && (!t || e.selectedKeyFrame === null && !e.selectedKeyFrames?.size) || (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, t && (e.selectedKeyFrame = null, e.selectedKeyFrames = null), e.refreshKeys());
}
function cu(e) {
  e.state.auto_key = !e.state.auto_key, e.state.auto_key || e.exitKeyEdit(!1), e.serialize(), e.updateEditState(), e.setStatus(s(`Auto Key ${e.state.auto_key ? "on" : "off"}`));
}
const lu = ["guides", "safe-areas", "resolution-gate", "aspect-ratio"];
function du(e) {
  const t = e.root.querySelector(".viewport-wrap"), a = e.editingKeyFrame !== null, o = !!e.state.auto_key;
  t && (t.classList.toggle("edit-mode", a), t.classList.toggle("auto-key", o));
  for (const m of e.root.querySelectorAll('[data-act="auto-key"]'))
    m.classList.toggle("active", o), m.setAttribute("aria-pressed", String(o)), m.title = s(`Auto Key ${o ? "on" : "off"}`);
  const r = e.state.view_mode === "camera";
  for (const m of lu)
    for (const h of e.root.querySelectorAll(`[data-role="${m}"]`)) {
      h.disabled = !r;
      const d = h.closest("label");
      d && d.classList.toggle("oc-disabled", !r), h.title = r ? "" : s("Available in Camera View only");
    }
  const n = e.activeCameraTrack(), i = e.selectedObject(), c = e.root.querySelector('[data-role="tally-banner"]'), l = e.root.querySelector('[data-role="tally-text"]');
  if (c && l)
    if (a) {
      c.hidden = !1;
      const m = i ? i.name || i.type : n.name;
      l.textContent = `REC KEY @ F${e.editingKeyFrame} (${m})`;
    } else o ? (c.hidden = !1, l.textContent = `● AUTO-KEY ON (F${e.frame})`) : c.hidden = !0;
  const p = e.root.querySelector('[data-role="viewport-state"]');
  p && (a ? p.textContent = i ? `● EDITING ${i.name || i.type} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : `● EDITING ${n.name} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : o ? p.textContent = i ? `● AUTO KEY · ${i.name || i.type}` : `● AUTO KEY · ${n.name}` : i ? p.textContent = `SELECTED: ${i.name || i.type}` : p.textContent = e.state.view_mode === "camera" ? `CAMERA: ${n.name}` : `VIEW: ${e.state.view_mode.toUpperCase()}`), ls(e), $p(e), Te(e);
}
function mu(e) {
  const t = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const a of e.root.querySelectorAll("[data-key-frame]")) {
    const o = Number(a.dataset.keyFrame);
    a.classList.toggle("selected", t.has(o)), a.classList.toggle("editing", o === e.editingKeyFrame), a.classList.toggle("at-playhead", o === e.frame);
  }
  e.updateEditState();
}
function pu(e, t) {
  const a = Ne(e);
  if (!a) return;
  e.checkpoint("Change key tangent mode"), a.tangents = a.tangents && typeof a.tangents == "object" ? a.tangents : {}, a.tangents.mode = t, a.tangent_mode = t, t !== "auto" && a.interpolation !== "bezier" && (a.interpolation = "bezier");
  const o = e.root.querySelector('[data-role="key-tangent-mode"]');
  o && (o.value = t);
  for (const r of e.root.querySelectorAll("[data-tangent]"))
    r.classList.toggle("active", r.dataset.tangent === t);
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(s("Key @ {frame} tangent mode set to {mode}").replace("{frame}", String(a.frame)).replace("{mode}", t));
}
function fu(e) {
  const t = Me(e), a = Ne(e), o = e.root.querySelector('[data-role="key-editor"]');
  o && (o.dataset.empty = String(!a));
  const r = e.root.querySelector('[data-role="selected-key-label"]');
  r && (r.textContent = a ? s(`${t?.name || "Camera"} Key @ ${a.frame}`) : s(`No ${t ? "object" : "camera"} key selected`));
  const n = ["key-frame", "key-interp", "key-tangent-mode", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"];
  for (const d of n) {
    const f = e.root.querySelector(`[data-role="${d}"]`);
    f && (f.disabled = !a || !!(t && !["key-frame", "key-interp", "key-tangent-mode"].includes(d)));
  }
  const i = e.root.querySelector('[data-act="update-key"]');
  i && (i.disabled = !a || !!t);
  const c = e.root.querySelector('[data-act="view-key"]');
  c && (c.disabled = !a || !!t);
  for (const d of e.root.querySelectorAll("[data-interp]"))
    d.classList.toggle("active", !!(a && d.dataset.interp === a.interpolation)), d.disabled = !a;
  const l = a?.tangents?.mode || a?.tangent_mode || "auto", p = e.root.querySelector('[data-role="key-tangent-mode"]');
  p && document.activeElement !== p && (p.value = l);
  for (const d of e.root.querySelectorAll("[data-tangent]"))
    d.classList.toggle("active", !!(a && d.dataset.tangent === l)), d.disabled = !a;
  const m = e.root.querySelector('[data-role="key-timecode"]');
  if (m) {
    const d = Math.max(1, e.state?.fps || 24), f = a ? a.frame : e.frame, u = Math.floor(f / d), b = f % Math.round(d), y = String(Math.floor(u / 3600)).padStart(2, "0"), g = String(Math.floor(u % 3600 / 60)).padStart(2, "0"), v = String(u % 60).padStart(2, "0"), S = String(b).padStart(2, "0");
    m.textContent = `${y}:${g}:${v}:${S} (${f}f)`;
  }
  if (!a) return;
  if (t) {
    const d = e.root.querySelector('[data-role="key-frame"]');
    d && document.activeElement !== d && (d.value = String(a.frame));
    const f = e.root.querySelector('[data-role="key-interp"]');
    f && document.activeElement !== f && (f.value = a.interpolation);
    return;
  }
  const h = {
    "key-frame": a.frame,
    "key-interp": a.interpolation,
    "key-tangent-mode": l,
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
    "key-camera-type": a.camera.camera_type
  };
  for (const [d, f] of Object.entries(h)) {
    const u = e.root.querySelector(`[data-role="${d}"]`);
    u && document.activeElement !== u && (u.value = String(f));
  }
}
function hu(e, t, a = !1, o = {}) {
  const r = Ne(e);
  if (!r) return;
  const n = Se(e);
  let i = X(Math.round(t), 0, e.state.duration_frames - 1);
  const c = (p) => n.some((m) => m !== r && m.frame === p);
  if (c(i) && a)
    for (let p = 1; p < e.state.duration_frames; p++) {
      const m = [i - p, i + p].filter((h) => h >= 0 && h < e.state.duration_frames).find((h) => !c(h));
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
function uu(e) {
  const t = Ne(e);
  if (!t) return;
  if (e.checkpoint("Edit keyframe"), e.editingKeyFrame = t.frame, Me(e)) {
    t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.transform = Ve(Me(e)), e.serialize(), e.setFrame(t.frame), e.setStatus(s(`Object keyframe updated @ ${t.frame}`));
    return;
  }
  const a = (o, r) => {
    const n = Number(e.root.querySelector(`[data-role="${o}"]`).value);
    return Number.isFinite(n) ? n : r;
  };
  t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.camera.position = [a("key-px", t.camera.position[0]), a("key-py", t.camera.position[1]), a("key-pz", t.camera.position[2])], t.camera.target = [a("key-tx", t.camera.target[0]), a("key-ty", t.camera.target[1]), a("key-tz", t.camera.target[2])], t.camera.fov = X(a("key-fov", t.camera.fov), 5, 150), t.camera.roll = X(a("key-roll", t.camera.roll || 0), -180, 180), t.camera.zoom = Math.max(0.01, a("key-zoom", t.camera.zoom || 1)), t.camera.near = Math.max(1e-4, a("key-near", t.camera.near)), t.camera.far = Math.max(t.camera.near + 1e-4, a("key-far", t.camera.far)), t.camera.camera_type = e.root.querySelector('[data-role="key-camera-type"]').value, e.camera = he(t.camera), e.frame = t.frame, e.serialize(), e.setFrame(t.frame), e.setStatus(s(`Keyframe updated @ ${t.frame}`));
}
function bu(e) {
  const t = Ne(e);
  t && (e.setFrame(t.frame), e.setStatus(s(`Loaded keyframe @ ${t.frame}`)));
}
function gu(e, t) {
  const a = Se(e);
  if (!a.length) return;
  const o = t < 0 ? [...a].reverse().find((r) => r.frame < e.frame) || a[a.length - 1] : a.find((r) => r.frame > e.frame) || a[0];
  e.selectKeyframe(o);
}
const $r = ["pos_x", "pos_y", "pos_z"], tr = 1e-9, $o = ["auto", "aligned", "free", "corner"];
function Ae(e, t = 0) {
  const a = Number(e);
  return Number.isFinite(a) ? a : t;
}
function Fe(e) {
  const t = e?.camera?.position;
  return [Ae(t?.[0]), Ae(t?.[1]), Ae(t?.[2])];
}
function Ft(e, t) {
  return [e[0] - t[0], e[1] - t[1], e[2] - t[2]];
}
function yn(e) {
  return Math.hypot(e[0], e[1], e[2]);
}
function _o(e, t) {
  return [e[0] * t, e[1] * t, e[2] * t];
}
function ar(e, t, a) {
  const o = Fe(e), r = t ? Fe(t) : o, n = a ? Fe(a) : o, i = Math.max(tr, Ae(e?.frame) - Ae(t?.frame, Ae(e?.frame) - 1)), c = Math.max(tr, Ae(a?.frame, Ae(e?.frame) + 1) - Ae(e?.frame)), l = [0, 0, 0], p = [0, 0, 0];
  for (let m = 0; m < 3; m += 1) {
    const h = (o[m] - r[m]) / i, d = (n[m] - o[m]) / c;
    let f = (h + d) * 0.5;
    t ? a ? h * d <= 0 && (f = 0) : f = h : f = d, l[m] = f * c * (1 / 3), p[m] = -f * i * (1 / 3);
  }
  return { out: l, in: p };
}
function Os(e, t, a) {
  const o = Fe(e), r = t ? Fe(t) : o, n = a ? Fe(a) : o;
  return {
    out: _o(Ft(n, o), 1 / 3),
    in: _o(Ft(r, o), 1 / 3)
  };
}
function or(e, t) {
  const a = e?.tangents?.channels;
  if (!a) return null;
  const o = t === "out" ? "out_y" : "in_y", r = [0, 0, 0];
  let n = !1;
  for (let i = 0; i < 3; i += 1) {
    const c = a[$r[i]];
    c && Number.isFinite(Number(c[o])) && (r[i] = Number(c[o]), n = !0);
  }
  return n ? r : null;
}
function It(e) {
  const t = e?.tangents?.spatial_mode;
  return $o.includes(t) ? t : "auto";
}
function yu(e, t = null, a = null) {
  const o = It(e), r = Fe(e);
  if (o === "corner") {
    const l = Os(e, t, a);
    return { in: lo(r, l.in), out: lo(r, l.out), mode: o };
  }
  const n = ar(e, t, a), i = (o === "free" || o === "aligned") && or(e, "out") || n.out, c = (o === "free" || o === "aligned") && or(e, "in") || n.in;
  return { in: lo(r, c), out: lo(r, i), mode: o };
}
function lo(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function vu(e) {
  return e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.channels = e.tangents.channels && typeof e.tangents.channels == "object" ? e.tangents.channels : {}, e.tangents.channels;
}
function lt(e, t, a) {
  const o = vu(e);
  for (let r = 0; r < 3; r += 1) {
    const n = $r[r], i = o[n] && typeof o[n] == "object" ? o[n] : {};
    i.mode = "free", i.out_x = 1 / 3, i.in_x = -1 / 3, t === "out" ? i.out_y = a[r] : i.in_y = a[r], i.out_y === void 0 && (i.out_y = 0), i.in_y === void 0 && (i.in_y = 0), o[n] = i;
  }
}
function rr(e) {
  e.interpolation !== "bezier" && (e.interpolation = "bezier");
}
function Ps(e, t, a) {
  const o = Fe(e), r = yu(e, t, a);
  lt(e, "out", Ft(r.out, o)), lt(e, "in", Ft(r.in, o));
}
function xu(e, t, a, { prevKey: o = null, nextKey: r = null } = {}) {
  if (!e || t !== "in" && t !== "out") return e;
  let n = It(e);
  if (n === "corner") return e;
  n === "auto" && (n = "aligned", e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = "aligned", Ps(e, o, r));
  const i = Fe(e), c = Ft([
    Ae(a?.[0]),
    Ae(a?.[1]),
    Ae(a?.[2])
  ], i);
  if (rr(e), lt(e, t, c), n === "aligned") {
    const l = t === "out" ? "in" : "out", p = or(e, l) || (l === "out" ? ar(e, o, r).out : ar(e, o, r).in), m = yn(c), h = yn(p) || m || 1, d = m > tr ? _o(c, -h / m) : _o(p, 1);
    lt(e, l, d);
  }
  return e;
}
function wu(e, t, { prevKey: a = null, nextKey: o = null } = {}) {
  if (!e || !$o.includes(t)) return e;
  if (e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = t, t === "auto") {
    if (e.tangents.channels) {
      for (const r of $r) delete e.tangents.channels[r];
      Object.keys(e.tangents.channels).length || delete e.tangents.channels;
    }
    return e.interpolation === "bezier" && (e.interpolation = "smooth"), e;
  }
  if (t === "corner") {
    const r = Os(e, a, o);
    return rr(e), lt(e, "out", r.out), lt(e, "in", r.in), e;
  }
  return rr(e), Ps(e, a, o), e;
}
function ku(e) {
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
const Su = 220;
function Uo(e, t, a, o) {
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
function vn(e) {
  return JSON.stringify({
    background: e.viewport_bg_image || "",
    sequence: e.viewport_bg_sequence || [],
    objects: (e.objects || []).map((t) => [t.id, t.type, t.asset || ""])
  });
}
function ju(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: h, playblastCameraTrack: d, restoreFromWidgets: f, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: y, bindEditorEvents: g, activateCamera: v, addCamera: S, deleteCamera: x, drawPreviewOverlays: A, duplicateCamera: M, maximizeCameraPreview: K, refreshCameraPreviews: L, refreshCameraSelectors: Y, renameCamera: U, setPlayblastCamera: H, toggleCameraView: ne, captureRealtime: j, makePlayblast: F, uploadDirectorPlayblast: q, waitForMediaFrame: G, computeAudioPeaks: oe, loadAudioFile: $, releaseAudio: W, stopPlay: P, togglePlay: V, applyCameraPreset: Z, applyCameraShake: de, applyProxyPreset: me, clearViewportBgImage: te, loadViewportBgFile: pe, loadViewportBgSequence: ye, drawCameraPath: ue, drawCard: xe, drawCube: z, drawGrid: R, drawHuman: ie, drawLine3D: le, drawNull: be, drawOverlays: fe, drawPointField: re, drawSpeedHeatmap: _e, drawSphere: Bt, curveChannels: qt, drawCurveEditor: mt, onCurvePointerDown: pt, onCurvePointerMove: ft, onCurvePointerUp: ht, onTimelinePointerDown: Ut, onTimelinePointerMove: Wt, onTimelinePointerUp: Vt, refreshKeys: ut, resetCurveZoom: bt, resetTimelineZoom: Je, setChannelFilter: gt, setCurveInterpolation: yt, setTangentMode: vt, timelineFrameFromEvent: Ht, toggleCurveHandles: xt, zoomCurve: Gt, drawTransformGizmo: Yt, frameTarget: Xt, gizmoAxes: Zt, gizmoGeometry: Jt, onPointerDown: Qt, onPointerMove: ea, onPointerUp: ta, onWheel: aa, pickGizmo: oa, pickSceneObject: ra, resetCamera: wt, setTransformMode: kt, setViewMode: na, viewportCamera: sa, loadCardFile: Mo, loadExecutionPreview: To, loadMediaUrl: ia, loadModelFile: ca, loadSelectedReference: la, onModelLoaded: da, restoreAssets: ma, syncUpstreamInputs: pa, configureDomMedia: fa, refreshSetupDiagnostic: St, addMediaCard: ha, addPrimitive: ua, applyObjectAnimationFrame: ba, beginCameraEdit: ga, beginObjectEdit: ya, commitCameraEdit: va, commitObjectEdit: xa, copyKeyframe: wa, deleteKeyframe: ka, deleteObject: Sa, duplicateObject: ja, exitKeyEdit: _a, finishCameraEdit: Ca, goToAdjacentKey: Ea, insertKeyframe: Aa, loadSelectedKeyView: $a, pasteKeyframe: Ma, playblastCameraAtFrame: Ta, refreshInspector: Ia, refreshKeyEditor: Oa, refreshObjects: Pa, removeObjectResources: La, renameObject: Fa, retimeSelectedKey: za, selectKeyframe: Na, selectedKeyframe: Ra, selectedObject: Ka, selectObjectAnimation: Da, setKeyInterpolation: Ba, setObjectParent: qa, timelineKeyframes: Ua, timelineObject: He, toggleAutoKey: Wa, toggleObject: Va, updateCameraFromHud: Ha, updateEditState: Ga, updateKeyVisualState: Ya, updateSelectedKey: Xa, updateSelectedObject: Za, clamp: jt, cloneCamera: Ja, configureCore: Qa, defaultCamera: eo, sampleCamera: _t, sampleObjectTransform: Io, sanitizeState: Qe, worldTransform: Re } = e;
  return {
    setSelectMode(O) {
      if (["object", "vertex", "edge", "face"].includes(O)) {
        this.state.select_mode = O, this.subSelection = null;
        for (const E of this.root.querySelectorAll("[data-select-mode]")) {
          const k = E.dataset.selectMode === O;
          E.classList.toggle("active", k), E.setAttribute("aria-pressed", String(k));
        }
        for (const E of this.root.querySelectorAll('[data-role="select-mode"]'))
          E.value = O;
        this.serialize(), this.syncFromWidgets(), this.render(), this.setStatus(`Select Mode: ${O.toUpperCase()}`);
      }
    },
    refreshSetupDiagnostic() {
      St(this);
    },
    hideInternalWidgets() {
      for (const O of ["state_json", "recording_path", "card_asset"]) {
        const E = this.node.widgets?.find((k) => k.name === O);
        E && (E.computeSize = () => [0, -4], E.draw = () => {
        }, E.hidden = !0, E.options = { ...E.options || {}, hideInVueNodes: !0 });
      }
    },
    restoreFromWidgets() {
      f(this);
    },
    restoreHistorySnapshot(O) {
      const E = JSON.parse(O);
      if (this.keyDrag?.badge?.remove?.(), this.boxSelect?.overlay?.remove?.(), this.drag = null, this.gizmoDrag = null, this.targetFreeDrag = null, this.pathDrag = null, this.boxSelection = null, this.keyDrag = null, this.curveDrag = null, this.curvePanDrag = null, this.curveScrub = null, this.curveBoxSelect = null, this.timelineDrag = null, this.timelinePanDrag = null, this.boxSelect = null, this.modalTransform = null, this.activePointerId != null) {
        try {
          this.interactionElement?.releasePointerCapture?.(this.activePointerId);
        } catch {
        }
        this.activePointerId = null;
      }
      const k = vn(this.state), w = new Set(this.state.objects.map((se) => se.id));
      this.state = Qe(E.state);
      const C = new Set(this.state.objects.map((se) => se.id));
      for (const se of w) C.has(se) || this.removeObjectResources(se);
      this.frame = jt(E.frame, 0, this.state.duration_frames - 1);
      const T = new Set(this.state.objects.map((se) => se.id)), N = Array.isArray(E.selectedObjectIds) ? E.selectedObjectIds : [E.selectedObjectId].filter(Boolean);
      this.selectedObjectIds = new Set(N.filter((se) => T.has(se))), this.selectedObjectId = this.selectedObjectIds.has(E.selectedObjectId) ? E.selectedObjectId : [...this.selectedObjectIds].at(-1) || null, this.selectedEntity = this.selectedObjectIds.size ? "object" : E.selectedEntity || "camera";
      const J = new Set(this.timelineKeyframes().map((se) => se.frame)), B = Array.isArray(E.selectedKeyFrames) ? E.selectedKeyFrames : [E.selectedKeyFrame].filter((se) => se != null);
      this.selectedKeyFrames = new Set(B.filter((se) => J.has(se))), this.selectedKeyFrame = this.selectedKeyFrames.has(E.selectedKeyFrame) ? E.selectedKeyFrame : [...this.selectedKeyFrames].at(-1) ?? null, this.subSelection = E.subSelection || null, this.camera = _t(this.state, this.frame), Tt(this, this.activeCameraTrack(), this.camera, this.frame), this.cameraPreviewSignature = "", this.serialize(), k !== vn(this.state) && this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
    },
    checkpoint(O) {
      this.history.checkpoint(O);
    },
    undo() {
      const O = this.history.undo();
      O && this.setStatus(`Undo: ${O}`);
    },
    redo() {
      const O = this.history.redo();
      O && this.setStatus(`Redo: ${O}`);
    },
    bindEditorEvents() {
      g(this);
    },
    bindWidgetCallbacks() {
      h(this);
    },
    syncFromWidgets(O = !0) {
      y(this, O);
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
      Y(this);
    },
    refreshCameraPreviews() {
      L(this);
    },
    addCamera() {
      S(this);
    },
    async renameCamera(O) {
      return U(this, O);
    },
    duplicateCamera(O) {
      M(this, O);
    },
    async deleteCamera(O) {
      return x(this, O);
    },
    activateCamera(O) {
      v(this, O);
    },
    setPlayblastCamera(O) {
      H(this, O);
    },
    closeMenus(O = null) {
      for (const E of this.root.querySelectorAll(".toolbar-menu")) E !== O && (E.open = !1);
      this.hideContextMenu();
    },
    initializeTooltips() {
      n(this.root, this.interactionElement);
    },
    hideContextMenu() {
      this.contextMenu?.hide();
    },
    showContextMenu(O, E, k) {
      return this.contextMenu.show(O, E, k);
    },
    onContextMenu(O) {
      if (O.preventDefault(), O.stopPropagation(), O.stopImmediatePropagation?.(), O.altKey || this.state.navigation_profile === "simple" && O.target?.closest?.(".viewport-wrap")) return;
      const E = O.target, k = E.closest?.(".camera-preview-tile"), w = E.closest?.(".scene-item"), C = E.closest?.(".key");
      if (k) return this.openCameraContext(O, k.dataset.cameraId, !0);
      if (w?.dataset.cameraId) return this.openCameraContext(O, w.dataset.cameraId, !1);
      if (w?.dataset.objectId) return this.openObjectContext(O, w.dataset.objectId);
      if (C) {
        const T = this.timelineKeyframes().find((N) => N.frame === Number(C.dataset.keyFrame));
        return T && this.selectKeyframe(T), this.openTimelineContext(O, !0);
      }
      if (E.closest?.('[data-role="keys"]'))
        return this.setFrame(this.timelineFrameFromEvent(O, E.closest('[data-role="keys"]'))), this.openTimelineContext(O, !1);
      if (E.closest?.(".curve-editor")) return this.openCurveContext(O);
      if (E.closest?.(".viewport-wrap")) {
        const T = this.interactionElement.getBoundingClientRect(), N = (O.clientX - T.left) * this.canvas.width / Math.max(1, T.width), J = (O.clientY - T.top) * this.canvas.height / Math.max(1, T.height), B = this.pickSceneObject([N, J]);
        if (B) {
          if ((B.type === "object" || B.type === "object_keyframe") && B.object)
            return this.selectedEntity = "object", this.selectedObjectId = B.object.id, B.keyframe ? (this.setFrame(B.keyframe.frame), this.selectedKeyFrame = B.keyframe.frame) : this.selectedKeyFrame = B.object.keyframes?.find((se) => se.frame === this.frame)?.frame ?? null, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.openObjectContext(O, B.object.id);
          if (["camera", "camera_target", "camera_keyframe"].includes(B.type) && B.camera)
            return this.selectedEntity = B.type === "camera_target" ? "camera_target" : "camera", this.selectedObjectId = null, this.activateCamera(B.camera.id), B.keyframe && (this.setFrame(B.keyframe.frame), this.selectedKeyFrame = B.keyframe.frame), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), B.type === "camera_keyframe" && B.keyframe ? this.openPathKeyContext(O, B.camera.id, B.keyframe.frame) : this.openCameraContext(O, B.camera.id, !1);
        }
        return this.openViewportContext(O);
      }
    },
    openViewportContext(O) {
      const E = this.selectedObject();
      this.showContextMenu(O, s("Viewport"), [
        {
          label: E ? `${s("Set key")} · ${E.name || E.type}` : `${s("Set key")} · ${this.activeCameraTrack().name}`,
          icon: "pi-key",
          shortcut: "I",
          run: () => this.insertKeyframe()
        },
        { label: s("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        { label: s("Set camera target here"), icon: "pi-bullseye", help: s("Set camera Look-At target to this 3D point in the scene"), run: () => this.setTargetAtCursor(O) },
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
    openObjectContext(O, E) {
      const k = this.state.objects.find((T) => T.id === E);
      if (!k) return;
      this.selectedEntity = "object", this.selectedObjectId = E, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
      const w = ["sun_light", "point_light", "spot_light"].includes(k.type), C = this.selectedObjectIds?.size || 0;
      if (C >= 2 && this.selectedObjectIds.has(E)) {
        this.showContextMenu(O, `${C} ${s("objects selected")}`, [
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
              for (const T of this.selectedObjectIds) this.resetObjectAnimation(T);
            }
          },
          { label: s("Delete {count} objects").replace("{count}", String(C)), icon: "pi-trash", danger: !0, shortcut: "Del", run: () => this.deleteSelectedObjects() },
          null,
          { label: s("Deselect all"), icon: "pi-times", shortcut: "Alt+A", run: () => this.deselectAll() }
        ]);
        return;
      }
      this.showContextMenu(O, k.name || k.type, [
        { label: s("Set key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: s("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        { label: s("Rename object…"), icon: "pi-pencil", run: () => this.renameObject(E) },
        { label: s("Duplicate object"), icon: "pi-copy", run: () => this.duplicateObject(E) },
        { label: k.enabled === !1 ? s("Show object") : s("Hide object"), icon: k.enabled === !1 ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(E) },
        { label: k.locked ? s("Unlock object") : s("Lock object"), icon: k.locked ? "pi-lock" : "pi-lock-open", run: () => wr(this, k) },
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
            { label: s("Camera tracks this object (Look-At)"), icon: "pi-bullseye", help: s("Lock camera live look-at tracking to this moving object"), run: () => this.aimAtSelectedObject(E) },
            { label: s("Bake tracking to all camera keys"), icon: "pi-check-square", help: s("Write this object's motion into camera target keyframes"), run: () => this.bakeAimToKeyframes() },
            null,
            { label: s("Select hierarchy"), icon: "pi-sitemap", shortcut: "Shift+G", help: s("Select this object and all descendants"), run: () => this.selectHierarchy(E) }
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
                checked: k.cast_shadow !== !1,
                run: () => {
                  this.checkpoint("Toggle light shadow"), k.cast_shadow = k.cast_shadow === !1, this.serialize(), this.refreshInspector(), this.render();
                }
              }
            ]
          }
        ] : [],
        null,
        { label: s("Reset entire animation"), icon: "pi-replay", danger: !0, help: s("Delete every animation key and return position/rotation to zero"), run: () => this.resetObjectAnimation(E) },
        null,
        { label: s("Delete object"), icon: "pi-trash", danger: !0, disabled: E === "subject", help: E === "subject" ? s("The canonical subject card cannot be deleted") : s("Delete this object and its animation keys"), run: () => this.deleteObject(E) }
      ]);
    },
    openCameraContext(O, E, k = !1) {
      const w = this.state.cameras.find((C) => C.id === E);
      w && (this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(E), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.showContextMenu(O, `${w.name}${k ? " preview" : ""}`, [
        { label: s("Edit this camera"), icon: "pi-video", run: () => this.activateCamera(E) },
        {
          label: s("Select whole path — move / scale / rotate"),
          icon: "pi-arrows-alt",
          disabled: (w.keyframes || []).length < 1,
          run: () => {
            this.activateCamera(E), this.selectCameraPath() && this.setStatus(`${w.name} · ${s("whole path selected — move / scale / rotate")}`);
          }
        },
        { label: s("Set as primary / playblast"), icon: "pi-star", disabled: E === this.state.playblast_camera_id, run: () => this.setPlayblastCamera(E) },
        { label: s("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => {
          this.activateCamera(E), this.insertKeyframe();
        } },
        { label: s("Record this preview"), icon: "pi-circle-fill", run: () => {
          this.setPlayblastCamera(E), this.makePlayblast();
        } },
        { label: this.state.maximized_camera_id === E ? s("Restore preview size") : s("Maximize preview"), icon: "pi-window-maximize", run: () => this.maximizeCameraPreview(E) },
        null,
        {
          label: s("Shot order & handles"),
          icon: "pi-sliders-h",
          items: [
            { label: s("Shot: move earlier"), icon: "pi-arrow-up", disabled: this.state.cameras.findIndex((C) => C.id === E) <= 0, run: () => this.moveShot(E, -1) },
            { label: s("Shot: move later"), icon: "pi-arrow-down", disabled: this.state.cameras.findIndex((C) => C.id === E) >= this.state.cameras.length - 1, run: () => this.moveShot(E, 1) },
            null,
            { label: s("Shot handles…"), icon: "pi-sliders-h", run: () => this.editShotHandles(E) }
          ]
        },
        null,
        { label: s("Rename camera…"), icon: "pi-pencil", run: () => this.renameCamera(E) },
        { label: s("Duplicate camera"), icon: "pi-copy", run: () => this.duplicateCamera(E) },
        { label: s("Create camera from current view"), icon: "pi-plus", run: () => this.addCamera() },
        null,
        { label: s("Reset entire animation"), icon: "pi-replay", danger: !0, help: s("Delete every camera key and return to a static zero pose at frame 0"), run: () => this.resetCameraAnimation(E) },
        null,
        { label: s("Delete camera"), icon: "pi-trash", danger: !0, disabled: this.state.cameras.length <= 1, run: () => this.deleteCamera(E) }
      ]));
    },
    openPathKeyContext(O, E, k) {
      const w = this.state.cameras.find((J) => J.id === E);
      if (!w) return;
      this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(E);
      const C = (w.keyframes || []).find((J) => J.frame === k) || null;
      C && this.selectKeyframe(C), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
      const T = C ? It(C) : "auto", N = this.selectedKeyFrames?.size || 0;
      this.showContextMenu(O, `Path key F${k}`, [
        { label: s("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: s("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        null,
        {
          label: s("Handle Type"),
          icon: "pi-share-alt",
          items: $o.map((J) => ({
            label: ku(J),
            checked: T === J,
            run: () => this.setSpatialHandleMode(J)
          }))
        },
        {
          label: s("Keyframe operations"),
          icon: "pi-sliders-v",
          items: Uo(this, i, t, He)
        },
        null,
        {
          label: N >= 2 ? s("Delete {count} keys").replace("{count}", String(N)) : s("Delete key"),
          icon: "pi-trash",
          danger: !0,
          disabled: (w.keyframes || []).length <= 1,
          run: () => this.deleteSelectedKeyframes()
        }
      ]);
    },
    moveShot(O, E) {
      const k = this.state.cameras.findIndex((T) => T.id === O), w = k + E;
      if (k < 0 || w < 0 || w >= this.state.cameras.length) return;
      this.checkpoint("Reorder shot");
      const [C] = this.state.cameras.splice(k, 1);
      this.state.cameras.splice(w, 0, C), this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${C.name} → #${w + 1}`);
    },
    async editShotHandles(O) {
      const E = this.state.cameras.find((T) => T.id === O);
      if (!E) return;
      const k = E.handles || { in: 0, out: 0 }, w = await i(t, s("Shot handles…"), "Handle frames: in,out", `${k.in},${k.out}`);
      if (w == null) return;
      const C = String(w).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
      if (!C) return this.setStatus("Handles must be two integers: in,out");
      this.checkpoint("Shot handles"), E.handles = { in: Math.min(600, Number(C[1])), out: Math.min(600, Number(C[2])) }, this.serialize(), this.setStatus(`${E.name} handles: ${E.handles.in} / ${E.handles.out}`);
    },
    openTimelineContext(O, E) {
      const k = this.selectedKeyFrames?.size || 0, w = this.selectedKeyframe(), C = w?.interpolation || "ease", T = w && It(w) || "auto", N = ["ease", "linear", "bezier", "smooth", "ease_in", "ease_out", "sine", "cubic", "quintic", "expo", "back"], J = ["auto", "clamped", "vector", "free", "aligned", "flat"];
      this.showContextMenu(O, E ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
        { label: s("Fit timeline view (F)"), icon: "pi-arrows-alt", shortcut: "F", run: () => Je(this) },
        { label: s("Set / replace key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: s("Copy selected key"), icon: "pi-copy", shortcut: "Ctrl+C", disabled: !w, run: () => this.copyKeyframe() },
        { label: s("Paste key at playhead"), icon: "pi-clipboard", shortcut: "Ctrl+V", disabled: !this.copiedKeyframe, run: () => this.pasteKeyframe() },
        null,
        {
          label: s("Interpolation"),
          icon: "pi-chart-line",
          disabled: !w && k < 2,
          items: N.map((B) => ({
            label: B.replaceAll("_", " "),
            checked: C === B,
            run: () => this.setSelectedKeysInterpolation(B)
          }))
        },
        {
          label: s("Tangents"),
          icon: "pi-share-alt",
          disabled: !w && k < 2,
          items: J.map((B) => ({
            label: B[0].toUpperCase() + B.slice(1),
            checked: T === B,
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
          items: Uo(this, i, t, He)
        },
        null,
        {
          label: k >= 2 ? s("Delete {count} keys").replace("{count}", String(k)) : s("Delete selected key"),
          icon: "pi-trash",
          shortcut: "Delete",
          danger: !0,
          disabled: k < 2 && !w,
          run: () => this.deleteSelectedKeyframes()
        }
      ]);
    },
    addMarker() {
      if ((this.state.markers || []).find((E) => E.frame === this.frame)) return this.setStatus(`Marker already at F${this.frame}`);
      this.checkpoint("Add marker"), this.state.markers = [...this.state.markers || [], { frame: this.frame, name: `Marker ${(this.state.markers || []).length + 1}`, color: "#f2d06b" }].sort((E, k) => E.frame - k.frame), this.serialize(), this.refreshKeys(), this.setStatus(`Marker @ F${this.frame}`);
    },
    removeNearestMarker() {
      const O = this.state.markers || [];
      if (!O.length) return;
      const E = O.reduce((k, w) => Math.abs(w.frame - this.frame) < Math.abs(k.frame - this.frame) ? w : k);
      this.checkpoint("Remove marker"), this.state.markers = O.filter((k) => k !== E), this.serialize(), this.refreshKeys(), this.setStatus(`Marker removed @ F${E.frame}`);
    },
    openCurveContext(O) {
      const E = this.selectedKeyFrames?.size || 0, k = E < 2 && !this.selectedKeyframe(), w = this.selectedKeyframe(), C = w?.interpolation || "ease", T = w && It(w) || "auto", N = ["bezier", "smooth", "linear", "ease_in", "ease_out", "ease", "sine", "cubic", "quintic", "expo", "back"], J = ["auto", "clamped", "vector", "free", "aligned", "flat"];
      this.showContextMenu(O, s("Curve editor"), [
        { label: s("Fit all curves (Framing)"), icon: "pi-arrows-alt", shortcut: "F", run: () => bt(this) },
        { label: s("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: this.showCurveHandles ? s("Hide Bézier handles") : s("Show Bézier handles"), icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
        null,
        {
          label: s("Interpolation"),
          icon: "pi-chart-line",
          disabled: k,
          items: N.map((B) => ({
            label: B.replaceAll("_", " "),
            checked: C === B,
            run: () => this.setSelectedKeysInterpolation(B)
          }))
        },
        {
          label: s("Tangents"),
          icon: "pi-share-alt",
          disabled: k,
          items: J.map((B) => ({
            label: B[0].toUpperCase() + B.slice(1),
            checked: T === B,
            run: () => this.setSelectedKeysTangentMode(B)
          }))
        },
        null,
        {
          label: s("Keyframe operations"),
          icon: "pi-sliders-v",
          items: Uo(this, i, t, He)
        },
        null,
        { label: E >= 2 ? s("Delete {count} keys").replace("{count}", String(E)) : s("Delete selected key"), icon: "pi-trash", danger: !0, disabled: k, run: () => this.deleteSelectedKeyframes() }
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
      const O = this.node;
      try {
        if (O && typeof O.computeSize == "function" && typeof O.setSize == "function") {
          const E = O.computeSize();
          Array.isArray(E) && O.setSize([O.size?.[0] ?? E[0], E[1]]);
        }
        O?.graph?.setDirtyCanvas?.(!0, !0);
      } catch {
      }
      this.scheduleResizeAndRender();
    },
    resizeCanvas() {
      const O = this.root.querySelector(".viewport-wrap");
      if (!O) return;
      const E = Math.min(2, window.devicePixelRatio || 1), k = O.clientWidth || 320, w = O.clientHeight || 180, C = Math.max(320, Math.round(k * E)), T = Math.max(180, Math.round(w * E));
      (this.canvas.width !== C || this.canvas.height !== T) && (this.canvas.width = C, this.canvas.height = T);
      for (const N of this.cameraPreviewCanvases.values()) {
        const J = N.clientWidth || 220, B = N.clientHeight || 124, se = Math.max(E, Su / Math.max(1, J)), je = Math.max(1, Math.round(J * se)), Ie = Math.max(1, Math.round(B * se));
        (N.width !== je || N.height !== Ie) && (N.width = je, N.height = Ie);
      }
      this.drawCurveEditor();
    }
  };
}
function Ls(e) {
  e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshKeyEditor(), e.refreshInspector(), e.drawCurveEditor(), e.render();
}
function _u(e, t) {
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a) return;
  e.checkpoint("Reset camera animation"), e.finishCameraEdit();
  const o = cr();
  o.position = [0, 0, 0], o.target = [0, 0, -1], a.camera = he(o), a.keyframes = [{ frame: 0, camera: he(o), interpolation: "ease" }], e.state.active_camera_id = a.id, e.state.camera = he(o), e.state.keyframes = a.keyframes, e.camera = he(o), e.frame = 0, e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = 0, e.editingKeyFrame = null, e.cameraEditKey = null, e.cameraEditActive = !1, e.cameraPreviewSignature = "", Ls(e), e.refreshCameraSelectors(), e.setStatus(s(`${a.name} animation reset`));
}
function Cu(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint("Reset object animation"), a.keyframes = [], a.position = [0, 0, 0], a.rotation = [0, 0, 0], e.frame = 0, e.selectedEntity = "object", e.selectedObjectId = a.id, e.selectedKeyFrame = null, e.editingKeyFrame = null, Ls(e), e.setStatus(s(`${a.name || a.type} animation reset`)));
}
const xn = { motion: "motion", shot: "display", health: "health" }, Eu = {
  object: "Object",
  camera: "Camera",
  camera_target: "Look-At Target",
  camera_path: "Camera Path"
}, Au = { motion: "Motion", shot: "Shot", health: "Health" }, $u = ["entity", "motion", "shot", "health"];
function Fs(e) {
  return e.inspectorMode && e.inspectorMode !== "entity" ? e.inspectorMode : "entity";
}
function Mu(e) {
  const t = Fs(e);
  return xn[t] ? xn[t] : e.selectedEntity === "object" ? "scene" : "camera";
}
function Tu(e) {
  return [
    e.selectedEntity || "",
    e.selectedObjectId || "",
    e.selectedKeyFrame ?? "",
    [...e.selectedObjectIds || []].sort().join(",")
  ].join("|");
}
function Iu(e) {
  const t = Tu(e);
  e._lastInspectorSelKey !== void 0 && e._lastInspectorSelKey !== t && (e.inspectorMode = "entity"), e._lastInspectorSelKey = t, zs(e);
}
function zs(e) {
  const t = Mu(e);
  for (const n of e.root.querySelectorAll("[data-tab-panel]"))
    n.hidden = n.dataset.tabPanel !== t;
  const a = t === "motion";
  e.root.classList.toggle("oc-motion-mode", a), !a && (e.state?.motion_tool || "select") !== "select" && (e.state.motion_tool = "select", e.motionTrackDraft = null);
  const o = Fs(e);
  for (const n of e.root.querySelectorAll("[data-inspector-mode]")) {
    const i = n.dataset.inspectorMode === o;
    n.classList.toggle("active", i), n.setAttribute("aria-pressed", String(i));
  }
  const r = e.root.querySelector('[data-role="inspector-title"]');
  r && (r.textContent = o === "entity" ? s(Eu[e.selectedEntity] || "Inspector") : s(Au[o] || "Inspector"));
}
function Ou(e, t) {
  e.inspectorMode = $u.includes(t) ? t : "entity", zs(e), e.render?.(), e.refitNode?.();
}
function Pu(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: h, playblastCameraTrack: d, restoreFromWidgets: f, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: y, bindEditorEvents: g, activateCamera: v, addCamera: S, deleteCamera: x, drawPreviewOverlays: A, duplicateCamera: M, maximizeCameraPreview: K, refreshCameraPreviews: L, refreshCameraSelectors: Y, renameCamera: U, setPlayblastCamera: H, toggleCameraView: ne, captureRealtime: j, makePlayblast: F, uploadDirectorPlayblast: q, waitForMediaFrame: G, computeAudioPeaks: oe, loadAudioFile: $, releaseAudio: W, stopPlay: P, togglePlay: V, applyCameraPreset: Z, applyCameraShake: de, applyProxyPreset: me, clearViewportBgImage: te, loadViewportBgFile: pe, loadViewportBgSequence: ye, drawCameraPath: ue, drawCard: xe, drawCube: z, drawGrid: R, drawHuman: ie, drawLine3D: le, drawNull: be, drawOverlays: fe, drawPointField: re, drawSpeedHeatmap: _e, drawSphere: Bt, curveChannels: qt, drawCurveEditor: mt, onCurvePointerDown: pt, onCurvePointerMove: ft, onCurvePointerUp: ht, onTimelinePointerDown: Ut, onTimelinePointerMove: Wt, onTimelinePointerUp: Vt, refreshKeys: ut, resetCurveZoom: bt, resetTimelineZoom: Je, setChannelFilter: gt, setCurveInterpolation: yt, setTangentMode: vt, timelineFrameFromEvent: Ht, toggleCurveHandles: xt, zoomCurve: Gt, drawTransformGizmo: Yt, frameTarget: Xt, gizmoAxes: Zt, gizmoGeometry: Jt, onPointerDown: Qt, onPointerMove: ea, onPointerUp: ta, onWheel: aa, pickGizmo: oa, pickSceneObject: ra, resetCamera: wt, setTransformMode: kt, setViewMode: na, viewportCamera: sa, loadCardFile: Mo, loadExecutionPreview: To, loadMediaUrl: ia, loadModelFile: ca, loadSelectedReference: la, onModelLoaded: da, restoreAssets: ma, syncUpstreamInputs: pa, configureDomMedia: fa, refreshSetupDiagnostic: St, addMediaCard: ha, addPrimitive: ua, applyObjectAnimationFrame: ba, beginCameraEdit: ga, beginObjectEdit: ya, commitCameraEdit: va, commitObjectEdit: xa, copyKeyframe: wa, deleteKeyframe: ka, deleteObject: Sa, deleteSelectedObjects: ja, duplicateObject: _a, exitKeyEdit: Ca, finishCameraEdit: Ea, goToAdjacentKey: Aa, insertKeyframe: $a, loadSelectedKeyView: Ma, pasteKeyframe: Ta, playblastCameraAtFrame: Ia, refreshInspector: Oa, refreshKeyEditor: Pa, refreshObjects: La, removeObjectResources: Fa, renameObject: za, retimeSelectedKey: Na, selectKeyframe: Ra, selectedKeyframe: Ka, selectedObject: Da, selectObjectAnimation: Ba, setKeyInterpolation: qa, setKeyTangentMode: Ua, setObjectParent: He, timelineKeyframes: Wa, timelineObject: Va, toggleAutoKey: Ha, toggleObject: Ga, updateCameraFromHud: Ya, updateCameraRotationFromHud: Xa, updateEditState: Za, updateKeyVisualState: jt, updateSelectedKey: Ja, updateSelectedObject: Qa, clamp: eo, cloneCamera: _t, configureCore: Io, defaultCamera: Qe, sampleCamera: Re, sampleObjectTransform: O, sanitizeState: E, worldTransform: k } = e;
  return {
    setChannelFilter(w) {
      gt(this, w);
    },
    setFrame(w, C = !1, T = !0) {
      this.frame = eo(Math.round(w), 0, this.state.duration_frames - 1), this.editingKeyFrame !== this.frame && (this.editingKeyFrame = null), this.camera = Re(this.activeCameraTrack(), this.frame, this.state.objects), Tt(this, this.activeCameraTrack(), this.camera, this.frame), this.applyObjectAnimationFrame();
      const N = this.dom ||= ns(this.root);
      for (const Q of N.frames) document.activeElement !== Q && (Q.value = String(this.frame));
      for (const Q of N.scrubs) Q.value = String(this.frame);
      for (const Q of N.cameraFov) document.activeElement !== Q && (Q.value = String(Math.round(this.camera.fov * 100) / 100));
      for (const Q of N.cameraRoll) document.activeElement !== Q && (Q.value = String(Math.round((this.camera.roll || 0) * 100) / 100));
      for (const Q of N.cameraFocal) document.activeElement !== Q && (Q.value = ur(this.camera.fov));
      for (const Q of N.viewportZoom) Q.textContent = `${(Number(this.camera.zoom) || 1).toFixed(2)}x`;
      for (const Q of N.cameraType) document.activeElement !== Q && (Q.value = this.camera.camera_type || "perspective");
      for (const Q of N.cameraNear) document.activeElement !== Q && (Q.value = String(this.camera.near ?? 0.01));
      for (const Q of N.cameraFar) document.activeElement !== Q && (Q.value = String(this.camera.far ?? 1e4));
      const J = this.frame / this.state.fps;
      for (const Q of this.cardMediaById.values()) Q instanceof HTMLVideoElement && Number.isFinite(Q.duration) && Q.duration > 0 && (Q.currentTime = J % Q.duration);
      const B = Math.floor(J / 60), se = Math.floor(J % 60), je = Math.floor(J % 1 * 1e3), Ie = this.frame % Math.max(1, Math.round(this.state.fps)), Ge = Math.floor(this.frame / this.state.fps);
      if ((N.time || this.root.querySelector('[data-role="time"]')).textContent = this.state.timecode_mode === "timecode" ? `${String(Math.floor(Ge / 3600)).padStart(2, "0")}:${String(Math.floor(Ge / 60) % 60).padStart(2, "0")}:${String(Ge % 60).padStart(2, "0")}:${String(Ie).padStart(2, "0")}` : `${String(B).padStart(2, "0")}:${String(se).padStart(2, "0")}.${String(je).padStart(3, "0")}`, T) this.refreshKeys();
      else {
        yo(this);
        for (const Q of this.root.querySelectorAll("[data-key-frame]")) {
          const ae = Number(Q.dataset.keyFrame);
          Q.classList.toggle("at-playhead", ae === this.frame), Q.classList.toggle("selected", ae === this.selectedKeyFrame), Q.classList.toggle("editing", ae === this.editingKeyFrame);
        }
        this.refreshKeyEditor(), this.drawCurveEditor();
      }
      C || this.serialize(), this.refreshInspector(), C && this.playing && !this.recording ? this.requestRender("frame") : this.render();
    },
    timelineObject() {
      return Va(this);
    },
    timelineKeyframes() {
      return Wa(this);
    },
    // The camera key the playhead is parked on, or null when between keys.
    // The new-key interpolation select branches on this directly; other camera
    // edits go through beginCameraEdit(), which resolves the same auto-key vs.
    // transient-preview question consistently (and always checkpoints/serializes).
    activeKeyframe() {
      return (this.activeCameraTrack()?.keyframes || []).find((C) => C.frame === this.frame) || null;
    },
    applyObjectAnimationFrame() {
      ba(this, O);
    },
    insertKeyframe() {
      for (const w of this.root.querySelectorAll('[data-act="key"]'))
        w.classList.remove("key-pulse"), w.offsetWidth, w.classList.add("key-pulse");
      $a(this);
    },
    setKeyInterpolation(w) {
      qa(this, w);
    },
    setKeyTangentMode(w) {
      Ua(this, w);
    },
    deleteKeyframe() {
      ka(this);
    },
    copyKeyframe() {
      wa(this);
    },
    pasteKeyframe() {
      Ta(this);
    },
    resetCamera() {
      wt(this, Qe);
    },
    resetCameraAnimation(w) {
      _u(this, w);
    },
    resetObjectAnimation(w) {
      Cu(this, w);
    },
    selectedKeyframe() {
      return Ka(this);
    },
    selectKeyframe(w) {
      Ra(this, w);
    },
    beginCameraEdit() {
      return ga(this);
    },
    commitCameraEdit() {
      va(this);
    },
    finishCameraEdit() {
      Ea(this);
    },
    exitKeyEdit(w = !1) {
      Ca(this, w);
    },
    toggleAutoKey() {
      Ha(this);
    },
    updateEditState() {
      Za(this);
    },
    updateKeyVisualState() {
      jt(this);
    },
    curveChannels() {
      return qt(this);
    },
    drawCurveEditor() {
      mt(this);
    },
    onCurvePointerDown(w) {
      pt(this, w);
    },
    onCurvePointerMove(w) {
      ft(this, w);
    },
    onCurvePointerUp(w) {
      ht(this, w);
    },
    setCurveInterpolation(w) {
      yt(this, w);
    },
    setTangentMode(w) {
      vt(this, w);
    },
    // Spatial Bézier handle mode (Auto Smooth / Aligned / Free / Corner) for the
    // selected camera keyframe -- the viewport curve, not the timeline F-curve.
    setSpatialHandleMode(w) {
      if (!$o.includes(w)) return;
      const T = this.activeCameraTrack()?.keyframes || [], N = T.findIndex((J) => J.frame === this.selectedKeyFrame);
      if (N < 0) {
        this.setStatus(s("Select a camera keyframe first"));
        return;
      }
      this.checkpoint(s("Camera path handle: {mode}").replace("{mode}", w)), wu(T[N], w, {
        prevKey: T[N - 1] || null,
        nextKey: T[N + 1] || null
      }), this.webgl && (this.webgl.pathKey = ""), this.serialize(), this.refreshKeys(), this.setFrame(this.frame, !1, !1), this.render(), this.setStatus(s("Curve handle updated"));
    },
    // Called from the viewport drag loop (viewport-controls/interactions.js) so
    // that eagerly-loaded module needs no static import of the curve maths.
    dragCurveHandle(w, C, T, N) {
      xu(w, C, T, N || {});
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
      const T = rc(C.keyframes, { origin: nc(C.keyframes), ...w });
      return C.keyframes = T, C.id === this.state.active_camera_id && (this.state.keyframes = T), this.camera = Re(C, this.frame, this.state.objects), C.camera = _t(this.camera), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.renderCameraView?.(), !0;
    },
    toggleCurveHandles() {
      xt(this);
    },
    onTimelineWheel(w) {
      onTimelineWheel(this, w);
    },
    resetTimelineZoom() {
      Je(this);
    },
    toggleInspector(w) {
      const C = this.root.querySelector('[data-role="viewport-inspector"]');
      if (!C) return;
      const T = w !== void 0 ? w : C.dataset.collapsed !== "true";
      C.dataset.collapsed = String(T);
      for (const N of this.root.querySelectorAll('[data-act="toggle-inspector"]'))
        N.classList.toggle("active", !T), N.setAttribute("aria-pressed", String(!T));
      this.setStatus(T ? "Inspector hidden (N)" : "Inspector shown");
    },
    refreshKeys() {
      ut(this);
    },
    refreshKeyEditor() {
      Pa(this);
    },
    retimeSelectedKey(w, C = !1) {
      Na(this, w, C);
    },
    updateSelectedKey() {
      Ja(this);
    },
    updateKeyFromView() {
      updateKeyFromView(this);
    },
    loadSelectedKeyView() {
      Ma(this);
    },
    goToAdjacentKey(w) {
      Aa(this, w);
    },
    addPrimitive(w) {
      ua(this, w);
    },
    async renameObject(w) {
      return za(this, w);
    },
    duplicateObject(w) {
      _a(this, w);
    },
    toggleObject(w) {
      Ga(this, w);
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
      let T = !0;
      for (; T; ) {
        T = !1;
        for (const N of this.state.objects)
          N.parent_id && C.has(N.parent_id) && !C.has(N.id) && (C.add(N.id), T = !0);
      }
      this.selectedObjectIds = C, this.selectedObjectId = w, this.selectedEntity = "object", this.refreshObjects(), this.refreshInspector(), this.render(), this.setStatus(`Hierarchy selected: ${C.size} object(s)`);
    },
    async deleteObject(w) {
      return Sa(this, w);
    },
    async deleteSelectedObjects() {
      return ja(this);
    },
    duplicateSelectedObjects() {
      return Wh(this);
    },
    toggleSelectedObjects(w = null) {
      return Vh(this, w);
    },
    lockSelectedObjects(w = null) {
      return Hh(this, w);
    },
    selectAllObjects() {
      return Gh(this);
    },
    deselectAll() {
      return Is(this);
    },
    invertSelection() {
      return Yh(this);
    },
    addMediaCard() {
      ha(this);
    },
    selectedObject() {
      return Da(this);
    },
    playblastCameraAtFrame() {
      return Tt(this, d(this), Ia(this, Re), this.frame);
    },
    viewportCamera() {
      return sa(this);
    },
    setViewMode(w) {
      na(this, w);
    },
    toggleCameraView() {
      ne(this);
    },
    setDensity(w) {
      ["basic", "animation", "advanced"].includes(w) || (w = "advanced"), this.state.ui_density = w, this.root.dataset.density = w, this.root.querySelector('[data-role="ui-density"]').value = w;
      const C = this.root.querySelector("[data-inspector-mode].active");
      C && getComputedStyle(C).display === "none" && this.setInspectorMode("entity"), this.serialize(), requestAnimationFrame(() => {
        this.resizeCanvas(), this.render();
      }), this.setStatus(`Interface: ${w}`);
    },
    lookAtObject(w) {
      const C = this.state.objects.find((T) => T.id === w);
      if (C) {
        this.checkpoint("Look-at constraint");
        for (const T of this.state.cameras)
          for (const N of T.keyframes) N.camera.target = [...C.position || [0, 1.5, 0]];
        this.camera = Re(this.state, this.frame), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(`Cameras look at ${C.name || C.type}`);
      }
    },
    setTransformMode(w) {
      kt(this, w);
    },
    refreshInspector() {
      this.perf && (this.perf.inspectorRefreshCount = (this.perf.inspectorRefreshCount || 0) + 1), Oa(this), Iu(this);
    },
    setInspectorMode(w) {
      Ou(this, w);
    },
    updateSelectedObject() {
      Qa(this);
    },
    beginObjectEdit(w) {
      return ya(this, w);
    },
    commitObjectEdit(w) {
      xa(this, w);
    },
    updateCameraFromHud() {
      Ya(this);
    },
    updateCameraRotationFromHud() {
      Xa(this);
    },
    selectObjectAnimation(w) {
      Ba(this, w);
    },
    setObjectParent(w) {
      He(this, w);
    },
    applyProxyPreset(w) {
      const C = { balanced: { mode: "omni_ref", burn: !1 }, parallax: { mode: "point_field", burn: !1 }, subject: { mode: "card_grid", burn: !1 }, debug: { mode: "omni_ref", burn: !0 } }, T = C[w] || C.balanced;
      this.state.render_mode = T.mode, this.state.burn_in = T.burn, this.root.querySelector('[data-role="mode"]').value = T.mode, this.root.querySelector('[data-role="burn-in"]').checked = T.burn, this.modeWidget && (this.modeWidget.value = T.mode), this.serialize(), this.render(), this.setStatus(`Proxy preset: ${w}`);
    },
    createH3Setup() {
      this.setStatus("Connect Motion Scene and Playblast Video to OmniCam Monitor");
    },
    refreshObjects() {
      La(this);
    },
    removeObjectResources(w) {
      Fa(this, w);
    },
    aimAtSelectedObject(w) {
      this.checkpoint("Aim & track subject");
      const C = this.activeCameraTrack(), T = w && this.state.objects.find((B) => B.id === w) || this.selectedObject() || this.state.objects.find((B) => B.id === "subject") || this.state.objects[0];
      if (!T) return;
      C.target_object_id !== T.id && (C.aim_bone = null), C.target_object_id = T.id, C.id === this.state.active_camera_id && (this.state.target_object_id = T.id, this.state.aim_bone = C.aim_bone);
      const J = (T.type === "model" || T.type === "glb" ? this.webgl?.getObjectWorldCenter?.(T.id) : null) || (T.keyframes?.length ? O(T, this.frame).position : T.position || [0, 1.5, 0]);
      this.camera.target = [...J], this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit(), this.serialize(), this.refreshInspector(), this.updateHudCamera(), this.render(), this.setStatus(`Camera tracking locked to ${T.name || T.id}`);
    },
    setAimBone(w) {
      Eh(this, w);
    },
    bakeAimConstraint(w) {
      Ah(this, w);
    },
    setCameraTrackingTarget(w) {
      this.checkpoint("Change camera tracking target");
      const C = this.activeCameraTrack();
      C.target_object_id !== (w || null) && (C.aim_bone = null), C.target_object_id = w || null, C.id === this.state.active_camera_id && (this.state.target_object_id = w || null, this.state.aim_bone = C.aim_bone), this.camera = Re(C, this.frame, this.state.objects), Tt(this, C, this.camera, this.frame), this.serialize(), this.refreshInspector(), this.render(), this.setStatus(w ? `Camera tracking: ${w}` : "Camera tracking disabled (manual target)");
    },
    bakeAimToKeyframes() {
      this.checkpoint("Bake aim to keyframes");
      const w = this.activeCameraTrack(), C = w.target_object_id || this.state.target_object_id || "subject", T = this.state.objects.find((J) => J.id === C) || this.state.objects[0];
      if (!T || !w.keyframes?.length) return;
      const N = T.type === "model" || T.type === "glb" ? this.webgl?.getObjectWorldCenter?.(T.id) : null;
      for (const J of w.keyframes) {
        const B = (T.type === "model" || T.type === "glb") && N && !T.keyframes?.length ? N : T.keyframes?.length ? O(T, J.frame).position : T.position || [0, 1.5, 0];
        J.camera.target = [...B];
      }
      w.id === this.state.active_camera_id && (this.state.keyframes = w.keyframes), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(`Aim baked across all keyframes following ${T.name || T.id}`);
    }
  };
}
function Lu(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: h, playblastCameraTrack: d, restoreFromWidgets: f, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: y, bindEditorEvents: g, activateCamera: v, addCamera: S, deleteCamera: x, drawPreviewOverlays: A, duplicateCamera: M, maximizeCameraPreview: K, refreshCameraPreviews: L, refreshCameraSelectors: Y, renameCamera: U, setPlayblastCamera: H, toggleCameraView: ne, captureRealtime: j, makePlayblast: F, uploadDirectorPlayblast: q, waitForMediaFrame: G, computeAudioPeaks: oe, loadAudioFile: $, releaseAudio: W, stopPlay: P, togglePlay: V, applyCameraPreset: Z, applyCameraShake: de, applyProxyPreset: me, clearViewportBgImage: te, loadViewportBgFile: pe, loadViewportBgSequence: ye, drawCameraPath: ue, drawCard: xe, drawCube: z, drawGrid: R, drawHuman: ie, drawLine3D: le, drawNull: be, drawOverlays: fe, drawPointField: re, drawSpeedHeatmap: _e, drawSphere: Bt, curveChannels: qt, drawCurveEditor: mt, fitCurveView: pt, onCurveDoubleClick: ft, onCurvePointerDown: ht, onCurvePointerMove: Ut, onCurvePointerUp: Wt, onTimelinePointerDown: Vt, onTimelinePointerMove: ut, onTimelinePointerUp: bt, refreshKeys: Je, resetCurveZoom: gt, resetTimelineZoom: yt, setChannelFilter: vt, setCurveInterpolation: Ht, setTangentMode: xt, timelineFrameFromEvent: Gt, toggleCurveHandles: Yt, zoomCurve: Xt, drawTransformGizmo: Zt, frameTarget: Jt, gizmoAxes: Qt, gizmoGeometry: ea, onPointerDown: ta, onPointerMove: aa, onPointerUp: oa, onWheel: ra, pickGizmo: wt, pickSceneObject: kt, resetCamera: na, setTransformMode: sa, setViewMode: Mo, viewportCamera: To, loadCardFile: ia, loadExecutionPreview: ca, loadMediaUrl: la, loadModelFile: da, loadSelectedReference: ma, onModelLoaded: pa, restoreAssets: fa, syncUpstreamInputs: St, configureDomMedia: ha, refreshSetupDiagnostic: ua, addMediaCard: ba, addPrimitive: ga, applyObjectAnimationFrame: ya, beginCameraEdit: va, beginObjectEdit: xa, commitCameraEdit: wa, commitObjectEdit: ka, copyKeyframe: Sa, deleteKeyframe: ja, deleteObject: _a, duplicateObject: Ca, exitKeyEdit: Ea, finishCameraEdit: Aa, goToAdjacentKey: $a, insertKeyframe: Ma, loadSelectedKeyView: Ta, pasteKeyframe: Ia, playblastCameraAtFrame: Oa, refreshInspector: Pa, refreshKeyEditor: La, refreshObjects: Fa, removeObjectResources: za, renameObject: Na, retimeSelectedKey: Ra, selectKeyframe: Ka, selectedKeyframe: Da, selectedObject: Ba, selectObjectAnimation: qa, setKeyInterpolation: Ua, setObjectParent: He, timelineKeyframes: Wa, timelineObject: Va, toggleAutoKey: Ha, toggleObject: Ga, updateCameraFromHud: Ya, updateEditState: Xa, updateKeyVisualState: Za, updateSelectedKey: jt, updateSelectedObject: Ja, clamp: Qa, cloneCamera: eo, configureCore: _t, defaultCamera: Io, sampleCamera: Qe, sampleObjectTransform: Re, sanitizeState: O, worldTransform: E } = e;
  return {
    setTargetAtCursor(k) {
      if (!k) return;
      const w = this.interactionElement.getBoundingClientRect(), C = (k.clientX - w.left) * this.canvas.width / Math.max(1, w.width), T = (k.clientY - w.top) * this.canvas.height / Math.max(1, w.height), N = this.webgl?.intersectScenePoint?.(C, T, this.canvas.width, this.canvas.height);
      N && (this.checkpoint("Set camera target"), this.beginCameraEdit(), this.camera.target = [
        Math.round(N[0] * 1e3) / 1e3,
        Math.round(N[1] * 1e3) / 1e3,
        Math.round(N[2] * 1e3) / 1e3
      ], this.commitCameraEdit(), this.finishCameraEdit(), this.updateHudCamera(), this.refreshInspector(), this.render(), this.setStatus(`Target set to [${this.camera.target.join(", ")}]`));
    },
    focusCameraTarget() {
      this.frameTarget();
    },
    updateHudCamera() {
      this.refreshInspector();
    },
    togglePlay() {
      V(this);
    },
    stopPlay() {
      P(this);
    },
    computeAudioPeaks() {
      oe(this);
    },
    async loadAudioFile(k) {
      return $(this, k);
    },
    applyCameraPreset(k) {
      Z(this, k);
    },
    applyCameraShake(k) {
      de(this, k);
    },
    applyProxyPreset(k) {
      me(this, k);
    },
    clearCaches() {
      if (this.checkpoint("Clear caches"), this.objectUrls?.clear(), W(this), this.webgl) {
        for (const k of this.webgl.models.values())
          try {
            k.scene && disposeObject(k.scene, !0);
          } catch {
          }
        this.webgl.models.clear(), this.webgl.modelLoads.clear(), this.webgl.sceneKey = "", this.webgl.mediaSignature = "", this.webgl.modelSignature = "", this.webgl.pathKey = "", this.webgl.bgLoadGeneration += 1, this.webgl.bgTextureLoads?.clear();
        for (const k of new Set(this.webgl.bgTextureCache?.values() || []))
          try {
            k.dispose();
          } catch {
          }
        this.webgl.bgTextureCache?.clear(), this.webgl.bgTexture = null, this.webgl.bgImageUrl = "";
      }
      if (this.cameraWebgl) {
        for (const k of this.cameraWebgl.models.values())
          try {
            k.scene && disposeObject(k.scene, !0);
          } catch {
          }
        this.cameraWebgl.models.clear(), this.cameraWebgl.modelLoads.clear(), this.cameraWebgl.sceneKey = "", this.cameraWebgl.mediaSignature = "", this.cameraWebgl.modelSignature = "", this.cameraWebgl.pathKey = "", this.cameraWebgl.bgLoadGeneration += 1, this.cameraWebgl.bgTextureLoads?.clear();
        for (const k of new Set(this.cameraWebgl.bgTextureCache?.values() || []))
          try {
            k.dispose();
          } catch {
          }
        this.cameraWebgl.bgTextureCache?.clear(), this.cameraWebgl.bgTexture = null, this.cameraWebgl.bgImageUrl = "";
      }
      this.upstreamSignature = "", this.cameraPreviewSignature = "", this.cardMediaById.clear(), this.cardMedia = null, this.restoreAssets(), this.syncUpstreamInputs(), this.refreshObjects(), this.refreshKeys(), this.refreshCameraSelectors(), this.renderCameraView(), this.render(), this.setStatus("Caches cleared & memory freed");
    },
    snapFrame(k) {
      return !this.state.snap_enabled || this.state.snap_frames <= 1 ? Math.round(k) : Math.round(Math.round(k) / this.state.snap_frames) * this.state.snap_frames;
    },
    toggleLoop() {
      this.state.loop_playback = !this.state.loop_playback, this.serialize();
      const k = this.root.querySelector('[data-act="loop"]');
      k.classList.toggle("active", this.state.loop_playback), k.setAttribute("aria-pressed", String(this.state.loop_playback)), this.setStatus(`Loop ${this.state.loop_playback ? "on" : "off"}`);
    },
    setPlaybackRange(k) {
      const w = this.state.playback_range || [0, this.state.duration_frames - 1];
      k === "start" ? w[0] = Math.min(this.frame, w[1]) : k === "end" && (w[1] = Math.max(this.frame, w[0])), this.state.playback_range = w, this.serialize(), this.refreshKeys(), this.setStatus(`Range: F${w[0]}–F${w[1]}`);
    },
    clearPlaybackRange() {
      this.state.playback_range = null, this.serialize(), this.refreshKeys(), this.setStatus("Playback range cleared");
    },
    toggleTimecode() {
      this.state.timecode_mode = this.state.timecode_mode === "timecode" ? "time" : "timecode", this.serialize(), this.setFrame(this.frame, !0), this.setStatus(`Time display: ${this.state.timecode_mode}`);
    },
    toggleSnap() {
      this.state.snap_enabled = !this.state.snap_enabled, this.serialize();
      const k = this.root.querySelector('[data-act="toggle-snap"]');
      k.classList.toggle("active", this.state.snap_enabled), k.setAttribute("aria-pressed", String(this.state.snap_enabled)), this.setStatus(`Snap ${this.state.snap_enabled ? "on" : "off"}`);
    },
    scheduleSerialize() {
      this.serializeScheduled || (this.serializeScheduled = !0, this.serializeFrame = requestAnimationFrame(() => {
        this.serializeScheduled = !1, this.disposed || this.serialize();
      }));
    },
    gizmoAxes(k) {
      return Qt(this, k);
    },
    gizmoGeometry(k) {
      return ea(this, k);
    },
    pickGizmo(k) {
      return wt(this, k);
    },
    pickSceneObject(k) {
      return kt(this, k);
    },
    drawTransformGizmo() {
      Zt(this);
    },
    // Routed through the facade so the eagerly-loaded key interceptor
    // (web-src/commands.js) keeps no static import of the Director-only
    // camera-path-draw module -- that edge dragged cameras.js and the panel
    // template string onto ComfyUI's startup path. See production-bundle test.
    cancelCameraPathDraw() {
      return Le(this);
    },
    onPointerDown(k) {
      df(this, k) || ta(this, k);
    },
    onPointerMove(k) {
      mf(this, k) || aa(this, k);
    },
    onPointerUp(k) {
      pf(this, k) || oa(this, k);
    },
    onWheel(k) {
      ra(this, k);
    },
    timelineFrameFromEvent(k, w) {
      return Gt(this, k, w);
    },
    onTimelinePointerDown(k) {
      Vt(this, k);
    },
    onTimelinePointerMove(k) {
      ut(this, k);
    },
    onTimelinePointerUp(k) {
      bt(this, k);
    },
    resetTimelineZoom() {
      yt(this);
    },
    refreshKeys() {
      Je(this);
    },
    drawCurveEditor() {
      mt(this);
    },
    toggleCurveHandles() {
      Yt(this);
    },
    setCurveInterpolation(k) {
      Ht(this, k);
    },
    setTangentMode(k) {
      xt(this, k);
    },
    setChannelFilter(k) {
      vt(this, k);
    },
    onCurvePointerDown(k) {
      ht(this, k);
    },
    onCurvePointerMove(k) {
      Ut(this, k);
    },
    onCurvePointerUp(k) {
      Wt(this, k);
    },
    zoomCurve(k) {
      Xt(this, k);
    },
    resetCurveZoom() {
      gt(this);
    },
    fitCurveView(k) {
      pt(this, k);
    },
    onCurveDoubleClick(k) {
      ft(this, k);
    },
    onKey(k) {
      return p(this, k);
    },
    frameTarget(k) {
      Jt(this, k);
    },
    async loadMediaUrl(k, w, C, T) {
      return la(this, k, w, C, T);
    },
    restoreAssets() {
      fa(this);
    },
    onModelLoaded(k) {
      pa(this, k);
    },
    async loadModelFile(k) {
      return da(this, k);
    },
    async loadCardFile(k) {
      return ia(this, k);
    },
    loadExecutionPreview(k) {
      ca(this, k);
    },
    loadSelectedReference() {
      ma(this);
    },
    drawLine3D(k, w, C = "#5a5a5a", T = 1) {
      le(this, k, w, C, T);
    },
    drawGrid() {
      R(this);
    },
    drawPointField() {
      re(this);
    },
    drawCube(k) {
      z(this, k);
    },
    drawSphere(k) {
      Bt(this, k);
    },
    drawHuman(k) {
      ie(this, k);
    },
    drawNull(k) {
      be(this, k);
    },
    drawCard(k) {
      xe(this, k);
    },
    drawCameraPath() {
      ue(this);
    },
    drawSpeedHeatmap() {
      _e(this);
    },
    drawOverlays() {
      fe(this);
    },
    async loadViewportBgFile(k) {
      return pe(this, k);
    },
    async loadViewportBgSequence(k) {
      return ye(this, k);
    },
    clearViewportBgImage() {
      te(this);
    }
  };
}
const Fu = [
  { id: "x", label: "X", vector: [1, 0, 0], color: "#e5484d" },
  { id: "y", label: "Y", vector: [0, 1, 0], color: "#46a758" },
  { id: "z", label: "Z", vector: [0, 0, 1], color: "#4a8fe7" }
];
function zu(e) {
  const { right: t, up: a, forward: o } = sc(e || {});
  return Fu.map((r) => {
    const [n, i, c] = r.vector, l = n * t[0] + i * t[1] + c * t[2], p = n * a[0] + i * a[1] + c * a[2], m = -(n * o[0] + i * o[1] + c * o[2]);
    return { id: r.id, label: r.label, color: r.color, x: l, y: -p, depth: m };
  });
}
function Nu(e) {
  return [...e].sort((t, a) => t.depth - a.depth);
}
function Ru(e) {
  return 0.45 + 0.55 * ((Math.max(-1, Math.min(1, e)) + 1) / 2);
}
const Ku = "http://www.w3.org/2000/svg", ot = 26, wn = 17, Du = 5.4;
function rt(e, t) {
  const a = document.createElementNS(Ku, e);
  for (const [o, r] of Object.entries(t)) a.setAttribute(o, String(r));
  return a;
}
function Bu(e) {
  const t = e.root?.querySelector('[data-role="viewport-axis"]');
  if (!t) return;
  const a = e.viewportCamera ? e.viewportCamera() : e.camera;
  if (!a) return;
  t.replaceChildren();
  const o = rt("circle", {
    "data-axis-center": "",
    cx: ot,
    cy: ot,
    r: 4,
    fill: "#A78BFA",
    tabindex: "0",
    role: "button",
    "pointer-events": "auto",
    "aria-label": s("Frame selection")
  }), r = rt("title", {});
  r.textContent = s("Frame selection"), o.appendChild(r), t.appendChild(o);
  for (const n of Nu(zu(a))) {
    const i = ot + n.x * wn, c = ot + n.y * wn, l = Ru(n.depth);
    t.appendChild(rt("line", {
      x1: ot,
      y1: ot,
      x2: i,
      y2: c,
      stroke: n.color,
      "stroke-width": 1.8,
      "stroke-linecap": "round",
      opacity: l
    }));
    const p = n.depth >= 0, m = rt("circle", {
      cx: i,
      cy: c,
      r: Du,
      fill: p ? n.color : "transparent",
      stroke: n.color,
      "stroke-width": 1.4,
      opacity: l,
      "data-axis": n.label.toLowerCase(),
      tabindex: "0",
      role: "button",
      "aria-label": s("View: {axis} axis").replace("{axis}", n.label),
      "pointer-events": "auto"
    }), h = rt("title", {});
    if (h.textContent = s("View: {axis} axis").replace("{axis}", n.label), m.appendChild(h), t.appendChild(m), p) {
      const d = rt("text", {
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
function qu(e, t, a, o, r) {
  if (["world_point", "object_point", "camera_field"].includes(t.source_kind)) {
    const n = fr(e, t.source, a, o, r);
    return n ? [n] : [];
  }
  return (t.keys || []).map((n) => ({ ...n }));
}
function Uu(e) {
  if (e.recording) return;
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  t.save();
  for (const r of e.state.motion_layers || []) {
    if (!r.enabled) continue;
    const n = qu(e.state, r, e.frame, a, o);
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
const Wu = ["world_point", "object_point", "camera_field"], Ns = {
  manual_2d: "DRAW",
  object_point: "OBJECT",
  world_point: "WORLD",
  static_anchor: "SCREEN",
  camera_field: "FIELD"
};
function Vu(e, t) {
  const a = t.source || {};
  if (t.source_kind === "object_point" && a.object_id) {
    const o = (e.objects || []).find((r) => r.id === a.object_id);
    return o ? o.name || o.id : `${a.object_id} (missing)`;
  }
  return t.source_kind === "world_point" ? "World point" : t.source_kind === "camera_field" ? a.preset ? `${a.preset} field` : "Camera field" : "Screen";
}
function Hu(e, t) {
  if (Wu.includes(t.source_kind)) {
    const a = fr(e, t.source, 0, e.width || 1280, e.height || 720);
    return a ? a.visible !== !1 : !1;
  }
  return t.keys?.[0]?.visible !== !1;
}
function Gu(e, t) {
  return (e.keys || []).reduce(
    (a, o) => a && Math.abs(a.time_seconds - t) <= Math.abs(o.time_seconds - t) ? a : o,
    null
  );
}
function Yu(e) {
  const t = e.root.querySelector('[data-role="motion-layers"]');
  if (!t) return;
  const a = e.state.motion_layers || [], o = e.state.selected_motion_layer_id;
  t.replaceChildren();
  for (const n of a) {
    const i = document.createElement("button");
    i.type = "button", i.className = "motion-layer-row", i.dataset.motionLayerId = n.id, i.classList.toggle("active", n.id === o), i.innerHTML = `<i class="pi ${n.enabled ? "pi-eye" : "pi-eye-slash"}"></i><span></span><small class="motion-badge"></small>`, i.querySelector("span").textContent = n.label, i.querySelector("small").textContent = Ns[n.source_kind] || "TRACK", i.addEventListener("click", () => {
      e.state.selected_motion_layer_id = n.id, e.render();
    }), t.appendChild(i);
  }
  const r = e.root.querySelector('[data-role="motion-layers-empty"]');
  r && (r.hidden = !!a.length), Xu(e), Zu(e);
}
function Xu(e) {
  const t = e.root.querySelector('[data-role="motion-selected"]');
  if (!t) return;
  const a = (e.state.motion_layers || []).find((d) => d.id === e.state.selected_motion_layer_id) || null;
  if (t.hidden = !a, !a) return;
  const o = Math.max(1, Number(e.state.fps) || 24), r = (a.keys || []).map((d) => Math.round(d.time_seconds * o)), n = (d, f) => {
    const u = t.querySelector(`[data-role="${d}"]`);
    u && (u.textContent = f);
  };
  n("motion-sel-name", a.label), n("motion-sel-type", Ns[a.source_kind] || "TRACK"), n("motion-sel-binding", Vu(e.state, a)), n("motion-sel-start", r.length ? Math.min(...r) : 0), n("motion-sel-end", r.length ? Math.max(...r) : 0);
  const i = a.source_kind === "object_point" && a.source?.object_id && !(e.state.objects || []).some((d) => d.id === a.source.object_id);
  t.classList.toggle("motion-invalid", !!i);
  const c = !i && !Hu(e.state, a);
  t.classList.toggle("motion-warn", c);
  const l = t.querySelector('[data-role="motion-sel-warn"]');
  l && (l.hidden = !c, l.textContent = c ? s("Not visible on the first frame — ATI, Wan Track and LTX Motion drop tracks hidden at frame 0. Move the point into frame at frame 0 or switch to Screen Anchor.") : "");
  const p = t.querySelector('[data-role="motion-interpolation"]');
  p && (p.value = a.keys?.[0]?.interpolation || "linear");
  const m = t.querySelector('[data-role="motion-key-visible"]');
  if (m) {
    const d = Gu(a, (e.frame || 0) / o);
    m.checked = d ? d.visible !== !1 : !0;
  }
  const h = t.querySelector('[data-motion-layer-action="toggle"] i');
  h && (h.className = `pi ${a.enabled ? "pi-eye" : "pi-eye-slash"}`);
}
function Zu(e) {
  const t = e.root.querySelector('[data-role="motion-creating"]');
  if (!t) return;
  const a = e.state.motion_tool && e.state.motion_tool !== "select";
  if (t.hidden = !a, !a) return;
  const o = t.querySelector('[data-role="motion-creating-label"]');
  o && (o.textContent = e.motionCreatingLabel || "Creating motion track");
}
function Ju(e) {
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
function Qu(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: h, playblastCameraTrack: d, restoreFromWidgets: f, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: y, bindEditorEvents: g, activateCamera: v, addCamera: S, deleteCamera: x, drawPreviewOverlays: A, duplicateCamera: M, maximizeCameraPreview: K, refreshCameraPreviews: L, refreshCameraSelectors: Y, renameCamera: U, setPlayblastCamera: H, toggleCameraView: ne, captureRealtime: j, makePlayblast: F, uploadDirectorPlayblast: q, waitForMediaFrame: G, computeAudioPeaks: oe, loadAudioFile: $, releaseAudio: W, stopPlay: P, togglePlay: V, applyCameraPreset: Z, applyCameraShake: de, applyProxyPreset: me, clearViewportBgImage: te, loadViewportBgFile: pe, loadViewportBgSequence: ye, drawCameraPath: ue, drawCard: xe, drawCube: z, drawCylinder: R, drawGrid: ie, drawHuman: le, drawLine3D: be, drawNull: fe, drawOverlays: re, drawPointField: _e, drawSpeedHeatmap: Bt, drawSphere: qt, drawTorus: mt, curveChannels: pt, drawCurveEditor: ft, onCurvePointerDown: ht, onCurvePointerMove: Ut, onCurvePointerUp: Wt, onTimelinePointerDown: Vt, onTimelinePointerMove: ut, onTimelinePointerUp: bt, refreshKeys: Je, resetCurveZoom: gt, resetTimelineZoom: yt, setChannelFilter: vt, setCurveInterpolation: Ht, setTangentMode: xt, timelineFrameFromEvent: Gt, toggleCurveHandles: Yt, zoomCurve: Xt, drawTransformGizmo: Zt, frameTarget: Jt, gizmoAxes: Qt, gizmoGeometry: ea, onPointerDown: ta, onPointerMove: aa, onPointerUp: oa, onWheel: ra, pickGizmo: wt, pickSceneObject: kt, resetCamera: na, setTransformMode: sa, setViewMode: Mo, viewportCamera: To, loadCardFile: ia, loadExecutionPreview: ca, loadMediaUrl: la, loadModelFile: da, loadSelectedReference: ma, onModelLoaded: pa, restoreAssets: fa, syncUpstreamInputs: St, configureDomMedia: ha, refreshSetupDiagnostic: ua, addMediaCard: ba, addPrimitive: ga, applyObjectAnimationFrame: ya, beginCameraEdit: va, beginObjectEdit: xa, commitCameraEdit: wa, commitObjectEdit: ka, copyKeyframe: Sa, deleteKeyframe: ja, deleteObject: _a, duplicateObject: Ca, exitKeyEdit: Ea, finishCameraEdit: Aa, goToAdjacentKey: $a, insertKeyframe: Ma, loadSelectedKeyView: Ta, pasteKeyframe: Ia, playblastCameraAtFrame: Oa, refreshInspector: Pa, refreshKeyEditor: La, refreshObjects: Fa, removeObjectResources: za, renameObject: Na, retimeSelectedKey: Ra, selectKeyframe: Ka, selectedKeyframe: Da, selectedObject: Ba, selectObjectAnimation: qa, setKeyInterpolation: Ua, setObjectParent: He, timelineKeyframes: Wa, timelineObject: Va, toggleAutoKey: Ha, toggleObject: Ga, updateCameraFromHud: Ya, updateEditState: Xa, updateKeyVisualState: Za, updateSelectedKey: jt, updateSelectedObject: Ja, clamp: Qa, cloneCamera: eo, configureCore: _t, defaultCamera: Io, sampleCamera: Qe, sampleObjectTransform: Re, sanitizeState: O, worldTransform: E } = e;
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
      Yu(this), _f(this), Ju(this);
    },
    // The main viewport canvas: WebGL (or the 2D fallback), the overlays and the
    // DOM axis gizmo. No motion panels, no camera preview strip.
    renderViewportOnly() {
      const k = this.ctx, w = this.canvas.width, C = this.canvas.height;
      if (k.fillStyle = this.state.viewport_bg_color || "#121212", k.fillRect(0, 0, w, C), this.viewportBgSequenceImages && this.viewportBgSequenceImages.length) {
        const ae = this.frame % this.viewportBgSequenceImages.length, Ke = this.viewportBgSequenceImages[ae];
        if (Ke?.complete && Ke.naturalWidth)
          try {
            k.drawImage(Ke, 0, 0, w, C);
          } catch {
          }
      } else if (this.viewportBgImage)
        try {
          k.drawImage(this.viewportBgImage, 0, 0, w, C);
        } catch {
        }
      const T = this.state.render_mode, N = this.viewportCamera(), J = this.state.objects.some((ae) => ae.parent_id) ? this.state.objects.map((ae) => ae.parent_id ? { ...ae, ...E(this.state.objects, ae) } : ae) : this.state.objects, B = (this.viewportBgSequenceImages || []).map((ae) => ae.src), se = this.viewportBgImage?.src || "", je = this.pendingExtractorImport, Ie = je ? [...this.state.cameras, {
        id: "__extractor_preview__",
        name: je.label,
        color: "#9ca3af",
        camera: je.track.keyframes[0]?.camera,
        keyframes: je.track.keyframes
      }] : this.state.cameras, Ge = {
        ...this.state,
        cameras: Ie,
        objects: J,
        viewport_bg_image: se,
        viewport_bg_sequence: B,
        __selectedObjectIds: [...this.selectedObjectIds || []],
        __omnicamRevision: `${this.renderRevision || 0}:${je?.fingerprint || ""}`
      };
      let Q = !1;
      if (this.webgl)
        try {
          const ae = this.recording ? 1 : this.webgl.supersampleFactor?.() ?? 1, Ke = ae > 1 ? Math.min(ae, 4096 / Math.max(1, w, C)) : 1, to = Ke > 1 ? Math.round(w * Ke) : w, Oo = Ke > 1 ? Math.round(C * Ke) : C;
          this.webgl.render(Ge, N, this.cardMediaById, to, Oo, this.modelUrlsById, this.frame, this.recording, this.selectedEntity, this.selectedObjectId, this.subSelection, this.selectedKeyFrame ?? null), k.imageSmoothingEnabled = !0, k.imageSmoothingQuality = "high", to !== w || Oo !== C ? k.drawImage(this.webgl.canvas, 0, 0, to, Oo, 0, 0, w, C) : k.drawImage(this.webgl.canvas, 0, 0, w, C), Q = !0;
        } catch (ae) {
          console.error("[OmniCam WebGL Render Error]", ae);
        }
      if (!Q) {
        (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(T) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes(T) && this.drawPointField();
        for (const ae of J)
          ae.enabled !== !1 && (ae.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(T) ? this.drawCard(ae) : ["cube", "ground", "glb", "model"].includes(ae.type) && T !== "grid" && T !== "point_field" ? this.drawCube(ae) : ae.type === "sphere" && T !== "grid" && T !== "point_field" ? this.drawSphere(ae) : ae.type === "cylinder" && T !== "grid" && T !== "point_field" ? this.drawCylinder(ae) : ae.type === "torus" && T !== "grid" && T !== "point_field" ? this.drawTorus(ae) : ae.type === "human" && T !== "grid" && T !== "point_field" ? this.drawHuman(ae) : ae.type === "null" && this.drawNull(ae));
        !this.recording && this.state.show_camera_paths && this.drawCameraPath();
      }
      !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), !this.recording && ff(this), this.drawOverlays(), Uu(this), this.state.show_gizmo && Bu(this), this.labelOverlay?.update(), this.rigOverlay?.update(), this.perf && (this.perf.viewportRenderCount = (this.perf.viewportRenderCount || 0) + 1);
    },
    // The single "something changed, repaint soon" entry point. Every
    // high-frequency source (playback tick, viewport drags, wheel/keyboard
    // navigation) funnels through here so at most one render() runs per frame
    // no matter how many events landed between paints. Discrete one-shot
    // actions can still call render() directly for an immediate repaint.
    requestRender(k = "unknown") {
      return this.requestUiUpdate(_.viewport | _.previews | _.motion, k);
    },
    // Targeted invalidation on top of the existing one-RAF coalescing. Each
    // caller marks only the domains it changed; the animation-frame callback
    // repaints just those, once, however many calls landed between frames.
    requestUiUpdate(k = _.viewport, w = "unknown") {
      (this.renderReasons ||= /* @__PURE__ */ new Set()).add(w), this.uiDirtyMask = lm(this.uiDirtyMask, k), this.renderInvalidations = (this.renderInvalidations || 0) + 1, !this.renderScheduled && (this.renderScheduled = !0, this.renderFrame = requestAnimationFrame(() => {
        if (this.renderScheduled = !1, this.disposed) return;
        const C = this.uiDirtyMask || _.viewport;
        this.uiDirtyMask = 0, this.lastRenderReasons = [...this.renderReasons || []], this.renderReasons?.clear(), this.rendersCoalesced = (this.rendersCoalesced || 0) + 1, this.perf && (this.perf.renderCount = (this.perf.renderCount || 0) + 1), tt(C, _.outliner) && this.refreshObjects(), tt(C, _.timeline) && this.refreshKeys(), tt(C, _.inspector) && this.refreshInspector(), tt(C, _.viewport) && this.renderViewportOnly(), tt(C, _.previews) && this.renderCameraView(), tt(C, _.motion) && this.renderMotionUiOnly();
      }));
    },
    renderCameraView() {
      if (this.perf && (this.perf.previewRenderCount = (this.perf.previewRenderCount || 0) + 1), this.state.camera_view_visible) {
        if (this.root.querySelector('[data-role="camera-view-row"]')?.hidden) return;
        this.refreshCameraPreviews(), this.cameraPreviewTick = (this.cameraPreviewTick || 0) + 1;
        const w = this.state.cameras, C = !!this.playing && !this.recording && w.length > 2;
        let T = null;
        if (C) {
          const N = this.state.active_camera_id, J = w.filter((B) => B.id !== N);
          T = J.length ? J[this.cameraPreviewTick % J.length] : null;
        }
        for (const N of w) {
          const J = this.cameraPreviewCanvases.get(N.id), B = this.cameraPreviewContexts.get(N.id);
          if (!J?.width || !B) continue;
          const se = J.width, je = J.height, Ie = this.root.querySelector(`[data-camera-frame="${N.id}"]`);
          if (Ie && (Ie.textContent = `F${this.frame}`), C && N.id !== this.state.active_camera_id && N !== T) continue;
          const Ge = Tt(this, N, Qe(N, this.frame, this.state.objects), this.frame);
          if (B.fillStyle = "#111", B.fillRect(0, 0, se, je), this.cameraWebgl)
            try {
              this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: !1, viewport_bg_image: this.viewportBgImage?.src || "", viewport_bg_sequence: (this.viewportBgSequenceImages || []).map((Q) => Q.src), __omnicamRevision: this.renderRevision || 0 }, Ge, this.cardMediaById, se, je, this.modelUrlsById, this.frame, !0), B.drawImage(this.cameraWebgl.canvas, 0, 0, se, je);
            } catch (Q) {
              console.error("[OmniCam Preview Render Error]", Q);
            }
          A(this, B, se, je);
        }
      }
    },
    drawPreviewOverlays(k, w, C) {
      A(this, k, w, C);
    },
    maximizeCameraPreview(k) {
      K(this, k);
    },
    setStatus(k) {
      (this.dom?.status || this.root.querySelector('[data-role="status"]')).textContent = k;
    },
    async makePlayblast() {
      return F(this);
    },
    async waitForMediaFrame() {
      return G(this);
    },
    async captureRealtimePlayblast() {
      return j(this);
    },
    async uploadPlayblast(k) {
      return q(this, k);
    },
    async syncUpstreamInputs() {
      return St(this);
    },
    dispose() {
      this.disposed || (this.disposed = !0, ic(this), cc(), Bc(this), this.backgroundRequestId = (this.backgroundRequestId || 0) + 1, this.upstreamSyncId = (this.upstreamSyncId || 0) + 1, this.stopPlay(), clearTimeout(this.previewClickTimer), clearTimeout(this.connectionTimer), cancelAnimationFrame(this.restoreFrame), cancelAnimationFrame(this.serializeFrame), cancelAnimationFrame(this.resizeFrame), cancelAnimationFrame(this.renderFrame), this.abortController?.abort(), this.upstreamFetchController?.abort(), this.resizeObserver?.disconnect(), this.contextMenu?.dispose(), this.webgl?.dispose(), this.cameraWebgl?.dispose(), W(this), Kf(this), this.objectUrls.clear(), this.cardMediaById.clear(), this.cardMediaAssetById?.clear?.(), this.modelUrlsById.clear(), this.modelInfoById.clear());
    }
  };
}
const Rs = 1e-9;
function eb(e, t) {
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
function tb(e) {
  const t = e[0]?.length || 0, a = new Array(t).fill(1);
  for (let o = 0; o < t; o += 1) {
    let r = 1 / 0, n = -1 / 0;
    for (const c of e) {
      const l = Number.isFinite(c[o]) ? c[o] : 0;
      l < r && (r = l), l > n && (n = l);
    }
    const i = n - r;
    a[o] = i > Rs ? 1 / i : 0;
  }
  return a;
}
function Mr(e, t) {
  const a = e.map((i) => eb(i, t)), o = tb(a), r = e.map((i) => i.frame), n = Math.max(1, r[r.length - 1] - r[0]);
  return a.map((i, c) => [
    (r[c] - r[0]) / n,
    ...i.map((l, p) => (Number.isFinite(l) ? l : 0) * o[p])
  ]);
}
function kn(e, t) {
  let a = 0;
  for (let o = 0; o < e.length; o += 1) a += (e[o] - t[o]) ** 2;
  return Math.sqrt(a);
}
function Tr(e, t, a) {
  let o = 0;
  for (let c = 0; c < t.length; c += 1) o += (a[c] - t[c]) ** 2;
  if (o <= Rs) return kn(e, t);
  let r = 0;
  for (let c = 0; c < t.length; c += 1) r += (e[c] - t[c]) * (a[c] - t[c]);
  const n = Math.max(0, Math.min(1, r / o)), i = t.map((c, l) => c + (a[l] - c) * n);
  return kn(e, i);
}
function ab(e, t, a) {
  const o = /* @__PURE__ */ new Set([0, e.length - 1]), r = [[0, e.length - 1]];
  for (; r.length; ) {
    const [n, i] = r.pop();
    if (i - n < 2) continue;
    let c = -1, l = -1;
    for (let p = n + 1; p < i; p += 1) {
      const m = Tr(e[p], e[n], e[i]);
      m > c && (c = m, l = p);
    }
    l < 0 || (c > t || a.has(l)) && (o.add(l), r.push([n, l], [l, i]));
  }
  return o;
}
function ob(e, t, { tolerance: a = 0.02, keepFrames: o = [] } = {}) {
  const r = [...e].sort((m, h) => m.frame - h.frame);
  if (r.length <= 2 || a <= 0) return { keys: r, removed: 0 };
  const n = Mr(r, t), i = /* @__PURE__ */ new Set(), c = new Set(o);
  r.forEach((m, h) => {
    c.has(m.frame) && i.add(h);
  });
  const l = ab(n, a, i);
  for (const m of i) l.add(m);
  const p = r.filter((m, h) => l.has(h));
  return { keys: p, removed: r.length - p.length };
}
function rb(e, t, { target: a = 2, keepFrames: o = [] } = {}) {
  let r = [...e].sort((l, p) => l.frame - p.frame);
  const n = Math.max(2, Math.round(a));
  if (r.length <= n) return { keys: r, removed: 0 };
  const i = new Set(o), c = r.length;
  for (; r.length > n; ) {
    const l = Mr(r, t);
    let p = -1, m = 1 / 0;
    for (let h = 1; h < r.length - 1; h += 1) {
      if (i.has(r[h].frame)) continue;
      const d = Tr(l[h], l[h - 1], l[h + 1]);
      d < m && (m = d, p = h);
    }
    if (p < 0) break;
    r = r.filter((h, d) => d !== p);
  }
  return { keys: r, removed: c - r.length };
}
function nb(e, t, { mergeWithin: a = 1, epsilon: o = 1e-3, keepFrames: r = [] } = {}) {
  const n = [...e].sort((d, f) => d.frame - f.frame), i = n.length, c = new Set(r), l = [];
  for (const d of n) {
    const f = l[l.length - 1];
    f && d.frame - f.frame <= Math.max(0, a) && !c.has(d.frame) || l.push(d);
  }
  if (l.length <= 2) return { keys: l, removed: i - l.length };
  const p = Mr(l, t), m = /* @__PURE__ */ new Set();
  for (let d = 1; d < l.length - 1; d += 1) {
    if (c.has(l[d].frame)) continue;
    const f = m.has(d - 1) ? null : d - 1;
    if (f === null) continue;
    Tr(p[d], p[f], p[d + 1]) <= o && m.add(d);
  }
  const h = l.filter((d, f) => !m.has(f));
  return { keys: h, removed: i - h.length };
}
function sb(e, t, { minKeys: a = 0 } = {}) {
  const o = new Set(t), r = e.filter((n) => !o.has(n.frame));
  if (r.length < a) {
    const n = e.filter((i) => o.has(i.frame)).sort((i, c) => i.frame - c.frame);
    for (; r.length < a && n.length; ) r.push(n.shift());
    r.sort((i, c) => i.frame - c.frame);
  }
  return { keys: r, removed: e.length - r.length };
}
function ib(e, t, a, { lastFrame: o = 1 / 0 } = {}) {
  const r = [...t].sort((m, h) => m - h);
  if (!a || !r.length)
    return { keys: [...e], moved: 0, frames: r };
  const n = new Set(r), i = new Set(e.filter((m) => !n.has(m.frame)).map((m) => m.frame)), c = r.map((m) => m + a);
  return c.some((m) => m < 0 || m > o || i.has(m)) || new Set(c).size !== c.length ? { keys: [...e], moved: 0, frames: r } : { keys: e.map((m) => n.has(m.frame) ? { ...m, frame: m.frame + a } : m).sort((m, h) => m.frame - h.frame), moved: r.length, frames: c.sort((m, h) => m - h) };
}
function cb(e, t, a) {
  const o = new Set(t);
  return e.map((r) => o.has(r.frame) ? { ...r, interpolation: a } : r);
}
function lb(e, t, a, o = []) {
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
const db = 0.12;
function mb() {
  return {
    /** Selected key frames that still exist on the active track, sorted. */
    resolveSelectedFrames() {
      const e = new Set(Se(this).map((a) => a.frame));
      return (this.selectedKeyFrames?.size ? [...this.selectedKeyFrames] : this.selectedKeyFrame != null ? [this.selectedKeyFrame] : []).filter((a) => e.has(a)).sort((a, o) => a - o);
    },
    _activeTrack() {
      const e = Me(this);
      if (e) return { kind: "object", write: (a) => {
        e.keyframes = a;
      } };
      const t = Ho(this);
      return {
        kind: "camera",
        write: (a) => {
          t.keyframes = a, this.state.keyframes = a, Go(this);
        }
      };
    },
    deleteSelectedKeyframes() {
      let e = this.resolveSelectedFrames();
      if (!e.length) {
        const l = Se(this).find((p) => p.frame === this.frame);
        l && (e = [l.frame]);
      }
      if (!e.length) return this.setStatus(s("Select a keyframe to delete"));
      const t = this._activeTrack(), a = Se(this), o = t.kind === "camera" ? 1 : 0, { keys: r, removed: n } = sb(a, e, { minKeys: o });
      if (!n) return this.setStatus(s("Keep at least one camera keyframe"));
      this.checkpoint(n > 1 ? s("Delete {n} keyframes").replace("{n}", n) : "Delete keyframe"), t.write(r);
      const i = Se(this), c = e[0];
      this.selectedKeyFrame = i.length ? i.reduce((l, p) => Math.abs(p.frame - c) < Math.abs(l.frame - c) ? p : l).frame : null, this.selectedKeyFrames = this.selectedKeyFrame != null ? /* @__PURE__ */ new Set([this.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.includes(this.editingKeyFrame) && (this.editingKeyFrame = null), this.camera = Ce(this.state, this.frame), this.applyObjectAnimationFrame(), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(n > 1 ? s("{n} keyframes deleted").replace("{n}", n) : s("Keyframe deleted"));
    },
    /** Move every selected key by `delta` frames. Returns false when nothing is selected. */
    nudgeSelectedKeyframes(e) {
      const t = this.resolveSelectedFrames();
      if (!t.length || !e) return !1;
      const a = this._activeTrack(), o = Math.max(0, this.state.duration_frames - 1), r = ib(Se(this), t, e, { lastFrame: o });
      return r.moved ? (this.checkpoint(s("Nudge {n} keyframes").replace("{n}", t.length)), a.write(r.keys), this.selectedKeyFrames = new Set(r.frames), this.selectedKeyFrame = r.frames.at(-1) ?? null, this.editingKeyFrame = null, this.serialize(), this.refreshKeys(), this.setFrame(this.selectedKeyFrame ?? this.frame, !1, !1), this.render(), !0) : (this.setStatus(s("Selected keys cannot move further")), !0);
    },
    setSelectedKeysInterpolation(e) {
      const t = this.resolveSelectedFrames();
      if (t.length < 2) return this.setCurveInterpolation(e);
      const a = this._activeTrack();
      this.checkpoint(s("Interpolation on {n} keys").replace("{n}", t.length)), a.write(cb(Se(this), t, e)), this.serialize(), this.refreshKeys(), this.refreshKeyEditor(), this.render(), this.drawCurveEditor(), this.setStatus(s("{mode} interpolation on {n} keys").replace("{mode}", e.replace(/_/g, " ")).replace("{n}", t.length));
    },
    setSelectedKeysTangentMode(e) {
      const t = this.resolveSelectedFrames();
      if (t.length < 2) return this.setTangentMode(e);
      const a = this._activeTrack(), o = Ze(this).map((r) => r.id);
      this.checkpoint(s("Tangents on {n} keys").replace("{n}", t.length)), a.write(lb(Se(this), t, e, o)), this.serialize(), this.refreshKeys(), this.render(), this.drawCurveEditor(), this.setStatus(s("{mode} tangents on {n} keys").replace("{mode}", e).replace("{n}", t.length));
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
        const u = Me(this);
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
        const u = Ho(this);
        c = [{
          get: () => u.keyframes || [],
          set: (b) => {
            u.keyframes = b, this.state.keyframes = b;
          },
          primary: !0
        }];
      }
      if (e === "simplify" && t <= 0 && !r) return 0;
      const l = this.resolveSelectedFrames(), p = o !== "all_cameras" && l.length >= 2 ? [l[0], l.at(-1)] : null, m = p ? [] : l, h = (u) => {
        const b = [...u].sort((K, L) => K.frame - L.frame), y = p ? p[0] : -1 / 0, g = p ? p[1] : 1 / 0, v = b.filter((K) => K.frame < y), S = b.filter((K) => K.frame >= y && K.frame <= g), x = b.filter((K) => K.frame > g);
        let A = S, M = 0;
        if (S.length > 2) {
          const K = e === "reduce" ? rb(S, i, { target: a || Math.ceil(S.length / 2), keepFrames: m }) : e === "clean" ? nb(S, i, { keepFrames: m }) : ob(S, i, { tolerance: t * db, keepFrames: m });
          A = K.keys, M = K.removed;
        }
        return { keys: [...v, ...A, ...x].sort((K, L) => K.frame - L.frame), removed: M };
      };
      let d = 0;
      const f = c.map((u) => {
        const b = r && u.primary ? r : u.get(), { keys: y, removed: g } = h(b);
        return d += g, { track: u, keys: y };
      });
      n || this.checkpoint(s("Simplify keyframes"));
      for (const { track: u, keys: b } of f) u.set(b);
      return Go(this), this.selectedKeyFrame = null, this.selectedKeyFrames = /* @__PURE__ */ new Set(), this.camera = Ce(this.state, this.frame), this.applyObjectAnimationFrame(), this.serialize(), this.refreshKeys(), this.setFrame(this.frame, !1, !1), this.render(), n || this.setStatus(d ? s("Removed {n} keyframes").replace("{n}", d) : s("No keyframes to remove")), d;
    },
    keySimplifyToleranceFor(e) {
      return X(Number(e) || 0, 0, 100) / 100;
    }
  };
}
zn({ api: Xe });
gs({ api: Xe });
ah({ api: Xe });
class Ks {
  constructor(t) {
    this.app = Sn, this.api = Xe, this.node = t, this.root = ts(), this.root.tabIndex = -1, this.dom = ns(this.root), this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.canvas, this.interactionElement.tabIndex = 0, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 }), this.disposed = !1, this.renderRevision = 0, this.directorRevision = 0, this.webgl = null, this.cameraWebgl = null, this.webglReady = this.loadWebGLViewports(), this.stateWidget = t.widgets?.find((o) => o.name === "state_json"), this.recordingWidget = t.widgets?.find((o) => o.name === "recording_path"), this.cardWidget = t.widgets?.find((o) => o.name === "card_asset"), this.widthWidget = t.widgets?.find((o) => o.name === "width"), this.heightWidget = t.widgets?.find((o) => o.name === "height"), this.fpsWidget = t.widgets?.find((o) => o.name === "fps"), this.durationWidget = t.widgets?.find((o) => o.name === "duration_seconds"), this.modeWidget = t.widgets?.find((o) => o.name === "render_mode");
    let a = null;
    try {
      a = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = dr(a), // The scene "Reset" command reverts to whatever was last saved or opened;
    // the state the node mounts with is that baseline until then.
    this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = Ce(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.cardMediaAssetById = /* @__PURE__ */ new Map(), this.objectUrls = new es(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = null, this.selectedEntity = "camera", this.subSelection = null, this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.uiDirtyMask = 0, this.perf = globalThis.__omnicamPerf === !0 ? { renderCount: 0, viewportRenderCount: 0, previewRenderCount: 0, timelineRefreshCount: 0, inspectorRefreshCount: 0, lastFrameMs: 0 } : null, this.contextMenu = new Rn(this.root), this.history = new Qn({ capture: () => JSON.stringify({ state: this.state, frame: this.frame, selectedEntity: this.selectedEntity, selectedObjectId: this.selectedObjectId, selectedObjectIds: [...this.selectedObjectIds || []], selectedKeyFrame: this.selectedKeyFrame, selectedKeyFrames: [...this.selectedKeyFrames || []], subSelection: this.subSelection }), restore: (o) => this.restoreHistorySnapshot(o) }), this.refreshCameraPreviews(), this.initializeTooltips(), this.bindEditorEvents(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.syncUpstreamInputs(), this.refreshSetupDiagnostic(), // Seed every frame-derived readout (timecode, lens millimetres, viewport
    // zoom, dope rows) instead of waiting for the first scrub.
    this.setFrame(this.frame, !1, !0);
  }
  /** Load the WebGL viewports, then repaint with them. Never rejects. */
  async loadWebGLViewports() {
    let t;
    try {
      ({ OmniWebGLViewport: t } = await import("./chunk-yKjbGiSp.js"));
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
      lc(this), this.resizeCanvas(), this.render(), this.renderCameraView();
    }
  }
}
const mo = { app: Sn, api: Xe, EditorHistory: Qn, ContextMenuController: Rn, initializeTooltips: Uc, promptText: zt, ObjectUrlRegistry: es, buildRoot: ts, dispatchDirectorKey: dc, activeCameraTrack: Ho, bindWidgetCallbacks: Wc, playblastCameraTrack: Nn, restoreFromWidgets: Vc, serializeEditorState: Hc, syncActiveCameraTrack: Go, syncFromWidgets: Gc, bindEditorEvents: Ef, activateCamera: Yc, addCamera: Xc, deleteCamera: Zc, drawPreviewOverlays: Jc, duplicateCamera: Qc, maximizeCameraPreview: el, refreshCameraPreviews: tl, refreshCameraSelectors: al, renameCamera: ol, setPlayblastCamera: rl, toggleCameraView: nl, captureRealtime: ks, makePlayblast: th, uploadDirectorPlayblast: Ss, waitForMediaFrame: ws, computeAudioPeaks: bs, loadAudioFile: zf, releaseAudio: ko, stopPlay: bo, togglePlay: Pf, applyCameraPreset: Ym, applyCameraShake: Xm, applyProxyPreset: Zm, clearViewportBgImage: nh, loadViewportBgFile: oh, loadViewportBgSequence: rh, drawCameraPath: vh, drawCard: yh, drawCube: ph, drawCylinder: uh, drawGrid: ch, drawHuman: hh, drawLine3D: ce, drawNull: gh, drawOverlays: wh, drawPointField: mh, drawSpeedHeatmap: xh, drawSphere: fh, drawTorus: bh, curveChannels: Ze, drawCurveEditor: Dl, fitCurveView: Hn, onCurveDoubleClick: Rl, onCurvePointerDown: Ml, onCurvePointerMove: Tl, onCurvePointerUp: Il, onTimelinePointerDown: mc, onTimelinePointerMove: pc, onTimelinePointerUp: fc, refreshKeys: ad, resetCurveZoom: Kl, resetTimelineZoom: hc, setChannelFilter: Pl, setCurveInterpolation: Ol, setTangentMode: Ll, timelineFrameFromEvent: nr, toggleCurveHandles: Fl, zoomCurve: Nl, drawTransformGizmo: uc, frameTarget: bc, gizmoAxes: gc, gizmoGeometry: yc, onPointerDown: vc, onPointerMove: xc, onPointerUp: wc, onWheel: kc, pickGizmo: Sc, pickSceneObject: jc, resetCamera: _c, setTransformMode: Cc, setViewMode: Ec, viewportCamera: Ac, loadCardFile: Wf, loadExecutionPreview: Vf, loadMediaUrl: xs, loadModelFile: Uf, loadSelectedReference: Hf, onModelLoaded: qf, restoreAssets: Bf, syncUpstreamInputs: Gf, configureDomMedia: gs, refreshSetupDiagnostic: jh, addMediaCard: Lh, addPrimitive: Th, applyObjectAnimationFrame: Zh, beginCameraEdit: ru, beginObjectEdit: Ms, commitCameraEdit: nu, commitObjectEdit: Nh, copyKeyframe: tu, deleteKeyframe: eu, deleteObject: $s, deleteSelectedObjects: Ph, duplicateObject: As, exitKeyEdit: iu, finishCameraEdit: su, goToAdjacentKey: gu, insertKeyframe: Jh, loadSelectedKeyView: bu, pasteKeyframe: au, playblastCameraAtFrame: Xh, refreshInspector: Fh, refreshKeyEditor: fu, refreshObjects: Es, removeObjectResources: Uh, renameObject: Ih, retimeSelectedKey: hu, selectKeyframe: ou, selectedKeyframe: Ne, selectedObject: Dt, selectObjectAnimation: qh, setKeyInterpolation: Qh, setKeyTangentMode: pu, setObjectParent: Bh, timelineKeyframes: Se, timelineObject: Me, toggleAutoKey: cu, toggleObject: Oh, updateCameraFromHud: Dh, updateCameraRotationFromHud: Kh, updateEditState: du, updateKeyVisualState: mu, updateSelectedKey: uu, updateSelectedObject: zh, clamp: X, cloneCamera: he, configureCore: zn, defaultCamera: cr, sampleCamera: Ce, sampleObjectTransform: Co, sanitizeState: dr, worldTransform: mr };
Object.assign(
  Ks.prototype,
  ju(mo),
  Pu(mo),
  Lu(mo),
  Qu(mo),
  mb()
);
function po(e, t) {
  const a = globalThis.__majoorOmniCamCiTrace;
  Array.isArray(a) && a.push({ stage: e, nodeId: t?.id ?? null, nodeClass: t?.comfyClass ?? t?.type ?? null });
}
function pb(e) {
  if (e.__majoorOmniCam) return;
  po("director:attach:start", e), po("director:constructor:start", e);
  const t = new Ks(e);
  po("director:constructor:complete", e), _m(t);
  try {
    t.assetBrowser = Km(t);
  } catch (m) {
    console.warn("[OmniCam] Asset Browser unavailable", m);
  }
  try {
    t.labelOverlay = Dm(t);
    const m = t.root.querySelector('[data-role="label-mode"]'), h = t.root.querySelector('[data-role="label-content"]');
    m && (m.value = t.labelOverlay.settings.mode), h && (h.value = t.labelOverlay.settings.content);
  } catch (m) {
    console.warn("[OmniCam] Label overlay unavailable", m);
  }
  try {
    t.characterRuntime = Bm(t), t.rigMapper = Um(t), t.poseEditor = Hm(t), t.motionEditor = Gm(t);
  } catch (m) {
    console.warn("[OmniCam] Character tools unavailable", m);
  }
  e.__majoorOmniCam = t, po("director:marker:assigned", e), t.hideInternalWidgets();
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
  }, t.unwatchGraphConnections = qc(e, i);
  const l = e.onRemoved;
  e.onRemoved = function() {
    t.unwatchGraphConnections?.(), t.assetBrowser?.dispose?.(), t.labelOverlay?.dispose?.(), t.rigMapper?.dispose?.(), t.poseEditor?.dispose?.(), t.motionEditor?.dispose?.(), t.dispose(), l?.apply(this, arguments);
  };
  const p = e.onExecuted;
  e.onExecuted = function(m) {
    p?.apply(this, arguments), t.loadExecutionPreview(m), t.syncUpstreamInputs();
  };
}
const Sb = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirector: pb
}, Symbol.toStringTag, { value: "Module" }));
export {
  Do as D,
  xb as a,
  wb as b,
  vb as c,
  Af as d,
  ds as e,
  Rt as f,
  Sb as g,
  xr as q,
  kb as r,
  yu as s
};
