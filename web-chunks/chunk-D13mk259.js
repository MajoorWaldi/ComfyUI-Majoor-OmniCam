import { app as fn } from "../../scripts/app.js";
import { api as Ye } from "../../scripts/api.js";
import { s as Ce, c as Y, t as ue, a as s, o as hn, b as Zo, d as Be, e as ye, f as So, r as Ts, g as Jo, h as un, i as Is, j as Ps, k as Os, l as zs, I as Ko, m as Qo, n as Fs, w as Ls, p as ho, q as bn, u as Ns, v as er, x as kr, y as gn, z as Ro, A as yn, B as vn, C as xn, D as wn, E as Do, F as Ao, G as Sr, O as jr, R as kn, H as Ks, J as Rs, K as Ds, L as tr, M as qs, N as Bs, P as Ws, Q as Vs, S as Us, T as ar, U as Hs, V as Gs, W as Ys, X as Xs, Y as Zs, Z as Js, _ as Qs, $ as ei, a0 as ti, a1 as ai, a2 as oi, a3 as ri, a4 as ni, a5 as si, a6 as ii, a7 as ci, a8 as li, a9 as di, aa as mi, ab as pi, ac as fi, ad as hi, ae as ui, af as bi, ag as gi, ah as yi, ai as vi, aj as xi, ak as wi, al as ki, am as Si, an as ji, ao as Ci, ap as _i, aq as Ei, ar as $i, as as Mi, at as Ai, au as Ti, av as Ii, aw as Pi, ax as Oi, ay as zi, az as Sn, aA as jn, aB as Fi, aC as To, aD as Li, aE as Ni, aF as Ki, aG as Ri, aH as Di, aI as ze, aJ as qi, aK as Cn, aL as or, aM as Bi, aN as Wi, aO as Vi, aP as _n, aQ as De, aR as Ke, aS as Ui, aT as Cr, aU as rr, aV as Hi, aW as En, aX as Gi, aY as Yi, aZ as Xi, a_ as Zi, a$ as Ji, b0 as Qi, b1 as $n, b2 as ec, b3 as tc, b4 as ac, b5 as oc, b6 as rc, b7 as nc, b8 as sc, b9 as ic, ba as cc, bb as lc, bc as dc, bd as mc, be as pc, bf as fc, bg as hc, bh as uc, bi as bc, bj as gc, bk as yc } from "./chunk-kW33UfOk.js";
import { L as vc, a as xc, p as zt, f as nr, b as wc, S as kc, c as _r, d as Sc, e as jc, r as Cc, g as _c, n as Ec, C as Er, h as Ft, o as $c, i as Mc, s as Ac, j as Tc, k as Mn, l as Ic, m as qo, q as Bo, w as Pc, t as An, u as Oc, v as zc, x as Fc, y as Lc, z as Nc, A as Kc, B as Rc, D as Dc, E as qc, F as Bc, G as Wc, H as Vc, I as Uc, J as Hc, K as Gc, M as Yc } from "./chunk-BqJnJnZM.js";
import { S as Xc, b as Zc, p as Jc, m as Qc, l as el, u as tl } from "./chunk-BOI_2OKd.js";
import { R as al } from "./vendor-three-AeKB2-k3.js";
function _t(e, t = 0) {
  return Math.sin(e * 1.7 + t * 3.1) * 0.5 + Math.sin(e * 3.3 + t * 5.7) * 0.3 + Math.sin(e * 7.9 + t * 11.3) * 0.2;
}
function ol(e, { type: t = "handheld_subtle", intensity: a = 1, duration_frames: o = null, subdivide: r = !0 } = {}) {
  const n = Array.isArray(e) ? e : e?.keyframes || [];
  if (!n || n.length === 0) return n;
  const i = t === "turbulence", c = t === "handheld_heavy", l = (i ? 0.12 : c ? 0.18 : 0.06) * a, p = (i ? 2 : c ? 2.8 : 0.9) * a, m = i ? 0.45 : c ? 0.22 : 0.12, f = n[n.length - 1]?.frame ?? 119, d = Math.max(f + 1, Number(o || (e?.duration_frames ?? f + 1))), h = i ? 4 : c ? 6 : 8, u = Array.isArray(e) ? { keyframes: n, duration_frames: d } : e, b = new Set(n.map((g) => g.frame));
  if (r && d > h) {
    for (let g = 0; g < d; g += h)
      b.add(g);
    b.add(d - 1);
  }
  return [...b].sort((g, v) => g - v).map((g) => {
    const v = Ce(u, g), S = _t(g * m, 1) * l, x = _t(g * m, 2) * l, E = _t(g * m, 3) * l * 0.5, M = _t(g * m, 4) * p, K = _t(g * m, 5) * (p * 0.35), P = [...v.position], G = [...v.target];
    return P[0] += S, P[1] += x, P[2] += E, G[0] += S * 0.35, G[1] += x * 0.35, {
      frame: g,
      camera: {
        ...v,
        position: P,
        target: G,
        roll: (v.roll || 0) + M,
        fov: Y((v.fov || 35) + K, 10, 140)
      },
      interpolation: "smooth"
    };
  });
}
function rl(e, { duration_frames: t = 120, target: a = [0, 1.5, 0], radius: o = 6, height: r = 3.5 } = {}) {
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
const Tn = 1e-4;
function nl(e, t) {
  return !Array.isArray(e) || !Array.isArray(t) ? e !== t : e.some((a, o) => Math.abs(Number(a) - Number(t[o])) > Tn);
}
function $r(e, t) {
  return Math.abs(Number(e) - Number(t)) > Tn;
}
const In = [
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
    changed: (e, t) => nl(e?.target, t?.target),
    read: (e) => e?.target
  },
  {
    id: "focal_length",
    label: "Focal Length",
    color: "#4aa3ef",
    changed: (e, t) => $r(e?.fov, t?.fov),
    read: (e) => e?.fov
  },
  {
    id: "roll",
    label: "Roll",
    color: "#ec4899",
    changed: (e, t) => $r(e?.roll, t?.roll),
    read: (e) => e?.roll
  }
];
function sl(e, t) {
  const a = [...e || []].sort((n, i) => n.frame - i.frame), o = [];
  let r = null;
  for (const n of a) {
    const i = n.camera || n.transform || {};
    (r === null || t.changed(r, i)) && o.push(n.frame), r = i;
  }
  return o;
}
function il(e, t = null) {
  return In.filter((a) => !t || t.has(a.id)).map((a) => ({
    id: a.id,
    label: a.label,
    color: a.color,
    frames: sl(e, a)
  }));
}
function cl(e, t) {
  const a = t >= -1 && t <= 101;
  e.style.display = a ? "" : "none", a && (e.style.left = `${t}%`);
}
function uo(e) {
  const t = ue(e, e.frame);
  for (const a of [".oc-playhead-head", '[data-role="dope-playhead"]', ".oc-gdope-playhead", ".oc-sequence-playhead"])
    for (const o of e.root.querySelectorAll(a)) cl(o, t);
}
function ll(e, t, a) {
  if (t.length < 2) return;
  const o = a(t[0]), r = a(t[t.length - 1]), n = document.createElement("span");
  n.className = "oc-dope-rail", n.style.left = `${Math.max(0, Math.min(o, r))}%`, n.style.width = `${Math.max(0, Math.abs(r - o))}%`, e.appendChild(n);
}
function dl(e, t, a, o, r) {
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
function ml(e, t) {
  return [
    e.state.duration_frames,
    Number(e.timelineZoom) || 1,
    Number(e.timelinePan) || 0,
    ...t.map((a) => `${a.id}:${a.frames.join(",")}`)
  ].join("\0");
}
function Pn(e) {
  const t = e.root.querySelector('[data-role="dope-rows"]');
  if (!t) return;
  const a = new Set(e.dopeChannels || []);
  a.delete("camera");
  const o = e.timelineKeyframes() || [], r = il(o, a), n = ml(e, r);
  if (t.dataset.signature !== n) {
    t.dataset.signature = n, t.replaceChildren();
    const i = (c) => ue(e, c);
    for (const c of r) {
      const l = document.createElement("div");
      l.className = "oc-dope-row", l.dataset.channel = c.id, l.style.setProperty("--channel-color", c.color), ll(l, c.frames, i), dl(e, l, c, o, i), t.appendChild(l);
    }
  }
  for (const i of t.querySelectorAll(".oc-dope-key"))
    i.classList.toggle("at-playhead", Number(i.dataset.frame) === e.frame);
  uo(e);
}
const Io = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1e3, 2e3, 5e3], On = 46, Mr = 5, zn = 640;
function Fn(e, t) {
  const a = t > 0 ? t : zn, o = Math.max(2, Math.floor(a / On)), r = Math.max(1e-6, e / o);
  return Io.find((n) => n >= r) ?? Io[Io.length - 1];
}
function pl(e, t) {
  const a = Math.max(1, e.state.duration_frames - 1), o = Y(Number(e.timelineZoom) || 1, 0.1, 50), r = Number(e.timelinePan) || 0, n = a / o, i = Fn(n, t), l = (i >= Mr ? i / Mr : 0) || i, p = [], m = Math.max(0, Math.floor(r / l) * l);
  for (let d = m; d <= a + 1e-6; d += l) {
    const h = Math.round(d), u = ue(e, h);
    if (!(u < -1)) {
      if (u > 101) break;
      p.push({ frame: h, percent: u, major: Math.abs(h % i) < 1e-6 });
    }
  }
  const f = ue(e, a);
  if (f <= 101 && !p.some((d) => d.major && d.frame === a)) {
    const d = On / Math.max(1, t) * 100;
    for (let h = p.length - 1; h >= 0; h -= 1)
      if (p[h].major) {
        if (f - p[h].percent >= d) break;
        p[h].major = !1;
      }
    p.push({ frame: a, percent: f, major: !0 });
  }
  return p;
}
function fl(e) {
  return e.clientWidth || e.parentElement?.clientWidth || zn;
}
function Ln(e) {
  const t = e.root.querySelector('[data-role="ruler"]');
  if (!t) return;
  t.replaceChildren();
  for (const o of pl(e, fl(t))) {
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
function hl(e, t) {
  const a = e.root.querySelector('[data-role="ruler"]');
  if (!a) return;
  let o = 0;
  const r = new ResizeObserver((c) => {
    const l = Math.round(c[0]?.contentRect.width ?? 0);
    !l || l === o || (o = l, Ln(e));
  });
  r.observe(a), t?.addEventListener("abort", () => r.disconnect(), { once: !0 });
  const n = (c) => {
    const l = Zo(e, c, a);
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
  a.addEventListener("pointerup", i, { signal: t }), a.addEventListener("pointercancel", i, { signal: t }), a.addEventListener("wheel", (c) => hn(e, c), { passive: !1, signal: t });
}
const ul = [1, 2, 2.5, 5, 10];
function bl(e, t = 5) {
  const a = Math.abs(e) / Math.max(1, t);
  if (!(a > 0) || !Number.isFinite(a)) return 1;
  const o = 10 ** Math.floor(Math.log10(a)), r = a / o;
  return (ul.find((n) => n >= r) ?? 10) * o;
}
function gl(e, t) {
  const a = Math.max(0, Math.min(4, Math.ceil(-Math.log10(t))));
  return e.toFixed(a);
}
function yl(e, { left: t, right: a, top: o, width: r, graphWidth: n, graphHeight: i, height: c, timeMin: l, timeMax: p, totalDuration: m, xFor: f, frame: d }) {
  const h = Fn(p - l, n);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a", e.textAlign = "center";
  for (let b = Math.ceil(l / h) * h; b <= p; b += h) {
    const y = Math.round(b);
    if (y < 0 || y > m) continue;
    const g = f(y);
    g < t || g > r - a || (e.beginPath(), e.moveTo(g, o), e.lineTo(g, o + i), e.stroke(), e.fillText(String(y), g, c - 6));
  }
  const u = f(d);
  u >= t && u <= r - a && (e.fillStyle = "#a78bfa", e.fillText(String(d), u, c - 6)), e.textAlign = "left";
}
function vl(e, { left: t, right: a, top: o, width: r, graphHeight: n, minimum: i, maximum: c, yFor: l }) {
  const p = bl(c - i, 4);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a";
  for (let m = Math.ceil(i / p) * p; m <= c; m += p) {
    const f = l(m);
    f < o - 1 || f > o + n + 1 || (e.beginPath(), e.moveTo(t, f), e.lineTo(r - a, f), e.stroke(), e.fillText(gl(m, p), 4, f + 3));
  }
}
function sr(e, t) {
  const a = e.getBoundingClientRect(), o = e.clientWidth / Math.max(1, a.width), r = (e.clientHeight || 180) / Math.max(1, a.height);
  return {
    x: (t.clientX - a.left) * o,
    y: (t.clientY - a.top) * r
  };
}
function xl(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.currentTarget;
  a.focus({ preventScroll: !0 }), e.curveHover = null;
  const { x: o, y: r } = sr(a, t);
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
      const c = Math.max(1, e.state.duration_frames - 1), l = c / (Number(e.curveZoomX) || 1), p = Number(e.curvePanX) || 0, m = Math.round(Y(p + (o - 44) / Math.max(1, a.clientWidth - 58) * l, 0, c));
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
function wl(e, t) {
  const a = t.currentTarget, { x: o, y: r } = sr(a, t);
  if (e.curvePanDrag && t.pointerId === e.curvePanDrag.pointerId) {
    t.preventDefault();
    const f = t.clientX - e.curvePanDrag.startX, d = t.clientY - e.curvePanDrag.startY, u = Math.max(1, e.state.duration_frames - 1) / (Number(e.curveZoomX) || 1), b = Math.max(1, a.clientWidth - 58), y = a.clientHeight || 180, g = Math.max(1, y - 38);
    e.curvePanX = e.curvePanDrag.origPanX - f / b * u, e.curvePanY = e.curvePanDrag.origPanY + d / g * 10 / (Number(e.curveZoom) || 1), e.drawCurveEditor();
    return;
  }
  if (e.curveScrub && t.pointerId === e.curveScrub.pointerId) {
    t.preventDefault();
    const f = Math.max(1, e.state.duration_frames - 1), d = f / (Number(e.curveZoomX) || 1), h = Number(e.curvePanX) || 0, u = Math.round(Y(h + (o - 44) / Math.max(1, a.clientWidth - 58) * d, 0, f));
    e.setFrame(u);
    return;
  }
  if (e.curveBoxSelect && t.pointerId === e.curveBoxSelect.pointerId) {
    t.preventDefault(), e.curveBoxSelect.currentX = o, e.curveBoxSelect.currentY = r;
    const f = Math.min(e.curveBoxSelect.startX, o), d = Math.max(e.curveBoxSelect.startX, o), h = Math.min(e.curveBoxSelect.startY, r), u = Math.max(e.curveBoxSelect.startY, r), b = (e.curveHitPoints || []).filter((g) => !g.handle && g.x >= f && g.x <= d && g.y >= h && g.y <= u).map((g) => g.key.frame), y = new Set(e.curveBoxSelect.additive ? e.curveBoxSelect.initial : []);
    for (const g of b) y.add(g);
    e.selectedKeyFrames = y, y.size && (e.selectedKeyFrame = [...y].at(-1)), e.updateKeyVisualState(), e.drawCurveEditor();
    return;
  }
  if (!e.curveDrag || t.pointerId !== e.curveDrag.pointerId) {
    const f = (e.curveHitPoints || []).map((v) => ({ point: v, distance: Math.hypot(o - v.x, r - v.y) })).sort((v, S) => v.distance - S.distance)[0], d = Math.max(1, e.state.duration_frames - 1), h = d / (Number(e.curveZoomX) || 1), u = Number(e.curvePanX) || 0, b = Math.max(1, a.clientWidth - 58), y = Y(Math.round(u + (o - 44) / b * h), 0, d);
    let g = null;
    if (f && f.distance <= 14) {
      const v = f.point, S = v.object ? v.key.transform || v.object : v.key.camera || v.key;
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
    const f = e.curveDrag.key, d = e.curveDrag.channel, h = e.curveDrag.handle, u = e.curveDrag.pixelPerSegment, b = e.curveDrag.valuePerPixel, y = e.curveDrag.keyX, g = e.curveDrag.keyY;
    f.interpolation !== "bezier" && (f.interpolation = "bezier"), f.tangents || (f.tangents = { mode: "auto", channels: {} }), f.tangents.channels || (f.tangents.channels = {});
    const v = f.tangents.channels[d.id] || {}, S = v.mode || (f.tangents.mode === "aligned" ? "aligned" : "free"), x = {
      out_x: e.curveDrag.startHandles.out_x,
      out_y: e.curveDrag.startHandles.out_y,
      in_x: e.curveDrag.startHandles.in_x,
      in_y: e.curveDrag.startHandles.in_y,
      ...v,
      mode: S
    };
    if (h === "in") {
      if (x.in_x = Y((o - y) / Math.max(1, u), -0.99, -0.01), x.in_y = (g - r) * b, S === "aligned") {
        const E = Math.hypot(x.in_x, x.in_y) || 1e-6, M = Math.hypot(e.curveDrag.startHandles.out_x, e.curveDrag.startHandles.out_y) || 1e-6;
        x.out_x = -x.in_x / E * M, x.out_y = -x.in_y / E * M;
      }
    } else if (x.out_x = Y((o - y) / Math.max(1, u), 0.01, 0.99), x.out_y = (g - r) * b, S === "aligned") {
      const E = Math.hypot(x.out_x, x.out_y) || 1e-6, M = Math.hypot(e.curveDrag.startHandles.in_x, e.curveDrag.startHandles.in_y) || 1e-6;
      x.in_x = -x.out_x / E * M, x.in_y = -x.out_y / E * M;
    }
    f.tangents.channels[d.id] = x, e.scheduleSerialize(), e.camera = Ce(e.state, e.frame), e.applyObjectAnimationFrame(), e.render(), e.drawCurveEditor();
    return;
  }
  const n = e.curveDrag.maximum - (r - e.curveDrag.top) * (e.curveDrag.maximum - e.curveDrag.minimum) / Math.max(1, e.curveDrag.graphHeight), i = e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera, c = e.curveDrag.lastFrame / (Number(e.curveZoomX) || 1), l = Number(e.curvePanX) || 0, p = Y(Math.round(l + (o - e.curveDrag.left) / Math.max(1, e.curveDrag.graphWidth) * c), 0, e.curveDrag.lastFrame), m = !t.shiftKey && Math.abs(o - e.curveDrag.startX) > 8;
  if (e.curveDrag.group) {
    const f = n - e.curveDrag.startValue;
    let d = m ? p - e.curveDrag.startFrame : 0;
    const h = new Set(e.timelineKeyframes().filter((u) => !e.selectedKeyFrames.has(u.frame)).map((u) => u.frame));
    if (d) {
      const u = e.curveDrag.group.map((y) => Y(Math.round(y.startFrame + d), 0, e.curveDrag.lastFrame));
      u.some((y) => h.has(y)) || new Set(u).size !== u.length ? d = 0 : e.curveDrag.group.forEach((y, g) => {
        y.key.frame = u[g];
      });
    }
    for (const u of e.curveDrag.group)
      e.curveDrag.channel.set(u.backing, u.startValue + f);
    e.timelineKeyframes().sort((u, b) => u.frame - b.frame), e.selectedKeyFrames = new Set(e.curveDrag.group.map((u) => u.key.frame)), e.selectedKeyFrame = e.curveDrag.key.frame, e.editingKeyFrame = m ? null : e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame;
  } else
    e.curveDrag.channel.set(i, n), m && p !== e.curveDrag.key.frame ? (e.curveDrag.key.frame = p, e.selectedKeyFrame = p, e.frame = p) : (e.editingKeyFrame = e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame);
  if (e.curveDrag.object) {
    const f = Be(e.curveDrag.key.transform);
    e.curveDrag.object.position = f.position, e.curveDrag.object.rotation = f.rotation, e.curveDrag.object.size = f.size;
  } else {
    const f = ye(e.curveDrag.key.camera);
    e.camera.position = f.position, e.camera.target = f.target, e.camera.fov = f.fov, e.camera.roll = f.roll, e.camera.zoom = f.zoom;
  }
  e.scheduleSerialize(), e.render(), e.refreshKeyEditor(), e.drawCurveEditor();
}
function kl(e, t) {
  if (t.currentTarget.hasPointerCapture?.(t.pointerId) && t.currentTarget.releasePointerCapture(t.pointerId), e.curvePanDrag = null, e.curveScrub = null, e.curveBoxSelect = null, e.curveDrag) {
    const a = t.type === "pointercancel" || t.type === "lostpointercapture", o = e.curveDrag.historyCheckpointed;
    e.timelineKeyframes().sort((n, i) => n.frame - i.frame), e.editingKeyFrame = null, e.curveDrag = null, a && o && e.undo?.(), e.serialize(), e.refreshKeys(), e.updateKeyVisualState(), e.drawCurveEditor();
  }
}
function Sl(e, t) {
  const a = e.selectedKeyframe() || e.timelineKeyframes().find((o) => o.frame === e.frame);
  if (!a) return e.setStatus(s("Select a keyframe first"));
  e.checkpoint("Change interpolation"), a.interpolation = t;
  for (const o of e.root.querySelectorAll("[data-curve-mode]")) {
    const r = o.dataset.curveMode === t;
    o.classList.toggle("active", r), o.setAttribute("aria-pressed", String(r));
  }
  e.selectedKeyFrame = a.frame, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.render(), e.drawCurveEditor(), e.setStatus(s(`${t.replace("_", " ")} interpolation @ ${a.frame}`));
}
function jl(e, t) {
  e.curveChannelFilter = t;
  for (const a of e.root.querySelectorAll("[data-channel-filter]")) {
    const o = a.dataset.channelFilter === String(t);
    a.classList.toggle("active", o), a.setAttribute("aria-pressed", String(o));
  }
  e.drawCurveEditor(), e.setStatus(t === "all" ? s("Showing all channels") : s(`Solo channel ${t}`));
}
function Cl(e, t) {
  const a = e.selectedKeyframe();
  if (!a || !["auto", "vector", "free", "aligned", "flat"].includes(t)) return e.setStatus(s("Select a keyframe first"));
  e.checkpoint("Change tangent mode"), t !== "auto" && a.interpolation !== "bezier" && (a.interpolation = "bezier"), a.tangents || (a.tangents = { mode: "auto", channels: {} }), a.tangents.mode = t, a.tangents.channels || (a.tangents.channels = {});
  const o = Xe(e);
  for (const r of o)
    a.tangents.channels[r.id] ? a.tangents.channels[r.id].mode = t : a.tangents.channels[r.id] = { mode: t };
  for (const r of e.root.querySelectorAll("[data-tangent-mode]")) {
    const n = r.dataset.tangentMode === t;
    r.classList.toggle("active", n), r.setAttribute("aria-pressed", String(n));
  }
  e.selectedKeyFrame = a.frame, e.serialize(), e.refreshKeys(), e.render(), e.drawCurveEditor(), e.setStatus(s(`Tangent mode: ${t} @ ${a.frame}`));
}
function _l(e) {
  e.showCurveHandles = !e.showCurveHandles;
  for (const t of e.root.querySelectorAll('[data-act="curve-handles"]'))
    t.classList.toggle("active", e.showCurveHandles), t.setAttribute("aria-pressed", String(e.showCurveHandles)), t.title = s(`${e.showCurveHandles ? "Hide" : "Show"} Bézier tangent handles`);
  e.drawCurveEditor(), e.setStatus(s(`Bézier handles ${e.showCurveHandles ? "shown" : "hidden"}`));
}
function El(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey) {
    const o = Math.max(1, e.state.duration_frames - 1);
    e.curvePanX = Y((Number(e.curvePanX) || 0) + (t.deltaY > 0 ? 4 : -4), -o * 0.5, o);
  } else t.altKey ? e.curvePanY = (Number(e.curvePanY) || 0) + (t.deltaY > 0 ? -1 : 1) / (Number(e.curveZoom) || 1) : t.ctrlKey ? e.curveZoomX = Y((Number(e.curveZoomX) || 1) * a, 0.2, 30) : (e.curveZoom = Y((Number(e.curveZoom) || 1) * a, 0.2, 30), e.curveZoomX = Y((Number(e.curveZoomX) || 1) * a, 0.2, 30));
  e.drawCurveEditor(), e.setStatus(s(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function $l(e, t) {
  e.curveZoom = Y((Number(e.curveZoom) || 1) * t, 0.2, 30), e.curveZoomX = Y((Number(e.curveZoomX) || 1) * t, 0.2, 30), e.drawCurveEditor(), e.setStatus(s(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function Ml(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.currentTarget, { x: o, y: r } = sr(a, t);
  if (r < 20) return;
  const n = Math.max(1, e.state.duration_frames - 1), i = n / (Number(e.curveZoomX) || 1), c = Number(e.curvePanX) || 0, l = Math.max(1, a.clientWidth - 58), p = Y(Math.round(c + (o - 44) / l * i), 0, n);
  e.checkpoint?.("Insert keyframe"), e.setFrame(p), e.insertKeyframe(), e.selectedKeyFrame = p, e.selectedKeyFrames = /* @__PURE__ */ new Set([p]), e.updateKeyVisualState(), e.refreshKeys(), e.drawCurveEditor(), e.setStatus(s("Keyframe inserted @ F{frame}").replace("{frame}", p));
}
function Nn(e, { selectedOnly: t = !1 } = {}) {
  const a = Math.max(1, (e.state?.duration_frames ?? 120) - 1), o = e.timelineKeyframes() || [], r = e.timelineObject(), n = Xe(e), i = e.selectedKeyFrames?.size ? [...e.selectedKeyFrames] : e.selectedKeyFrame != null ? [e.selectedKeyFrame] : [], c = i.length > 0, l = t || c && i.length < o.length ? o.filter((b) => i.includes(b.frame)) : o;
  if (!l.length) {
    e.curveZoom = 1, e.curveZoomX = 1, e.curvePanX = 0, e.curvePanY = 0, e.drawCurveEditor(), e.setStatus(s("Curve view fitted"));
    return;
  }
  const p = l.map((b) => b.frame), m = Math.min(...p), f = Math.max(...p), d = Math.max(1, f - m);
  if (l.length < o.length && d < a) {
    const b = Math.max(2, Math.round(d * 0.15)), y = Math.max(0, m - b), g = Math.min(a, f + b), v = Math.max(1, g - y);
    e.curveZoomX = Y(a / v, 0.2, 30), e.curvePanX = y;
  } else
    e.curveZoomX = 1, e.curvePanX = 0;
  const h = [];
  for (const b of l) {
    const y = r ? b.transform || r : b.camera || b;
    for (const g of n) {
      const v = g.get(y);
      Number.isFinite(v) && h.push(v);
    }
  }
  if (h.length > 0) {
    const b = Math.min(...h), y = Math.max(...h), g = Math.max(1e-4, y - b), v = (b + y) / 2, S = (U) => r ? So(r, U) : Ce(e.state, U), x = [], E = Math.max(1, Math.floor(a / 40));
    for (let U = 0; U <= a; U += E) {
      const re = S(U);
      for (const j of n) {
        const O = j.get(re);
        Number.isFinite(O) && x.push(O);
      }
    }
    let M = Math.min(...x), K = Math.max(...x);
    (!Number.isFinite(M) || !Number.isFinite(K)) && (M = -1, K = 1), Math.abs(K - M) < 1e-6 && (M -= 1, K += 1);
    const P = (K - M) * 0.1;
    M -= P, K += P;
    const G = K - M, B = (M + K) / 2;
    if (l.length < o.length && g < G * 0.75) {
      const U = g * 1.35;
      e.curveZoom = Y(G / U, 0.2, 30), e.curvePanY = v - B;
    } else
      e.curveZoom = 1, e.curvePanY = 0;
  } else
    e.curveZoom = 1, e.curvePanY = 0;
  e.drawCurveEditor();
  const u = l.length < o.length ? s("Fitted to {n} selected keys").replace("{n}", l.length) : s("Curve view fitted");
  e.setStatus(u);
}
function Al(e) {
  Nn(e);
}
function Xe(e) {
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
      r.fov = Y(n, 5, 150);
    } },
    { id: "roll", name: "Roll", color: "#ec4899", get: (r) => r.roll || 0, set: (r, n) => {
      r.roll = Y(n, -180, 180);
    } }
  ] : t === "lens" ? a = [
    { id: "fov", name: "FOV", color: "#ef8b3e", get: (r) => r.fov ?? 35, set: (r, n) => {
      r.fov = Y(n, 5, 150);
    } },
    { id: "roll", name: "Roll", color: "#43c7db", get: (r) => r.roll || 0, set: (r, n) => {
      r.roll = Y(n, -180, 180);
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
function Tl(e) {
  const t = e.root.querySelector('[data-role="curve-canvas"]');
  if (!t) return;
  const a = t.clientWidth, o = t.clientHeight || 180;
  if (!a || !o) return;
  const r = Math.min(2, window.devicePixelRatio || 1);
  (t.width !== Math.round(a * r) || t.height !== Math.round(o * r)) && (t.width = Math.round(a * r), t.height = Math.round(o * r));
  const n = t.getContext("2d");
  n.setTransform(r, 0, 0, r, 0, 0), n.clearRect(0, 0, a, o);
  const i = e.timelineObject(), c = e.timelineKeyframes(), l = Xe(e), p = 44, m = 14, f = 16, d = 22, h = Math.max(1, a - p - m), u = Math.max(1, o - f - d), b = Math.max(1, e.state.duration_frames - 1), y = Y(Number(e.curveZoomX) || 1, 0.1, 50), g = Number(e.curvePanX) || 0, v = b / y, S = g, x = g + v, E = [], M = Math.max(1, Math.ceil(v / Math.max(80, h))), K = ($) => i ? So(i, $) : Ce(e.state, $);
  for (let $ = 0; $ <= b; $ += M) E.push({ frame: $, value: K($) });
  E[E.length - 1]?.frame !== b && E.push({ frame: b, value: K(b) });
  const P = E.flatMap(($) => l.map((W) => W.get($.value)));
  let G = Math.min(...P), B = Math.max(...P);
  (!Number.isFinite(G) || !Number.isFinite(B)) && (G = -1, B = 1), Math.abs(B - G) < 1e-6 && (G -= 1, B += 1);
  const U = (B - G) * 0.1;
  G -= U, B += U;
  const re = Y(Number(e.curveZoom) || 1, 0.1, 50), j = (B + G) / 2 + (Number(e.curvePanY) || 0), O = (B - G) / re;
  G = j - O / 2, B = j + O / 2;
  const q = ($) => p + ($ - S) / Math.max(1e-6, x - S) * h, H = ($) => f + u * (B - $) / Math.max(1e-6, B - G);
  if (n.fillStyle = "#111114", n.fillRect(0, 0, a, o), n.strokeStyle = "#222228", n.lineWidth = 1, n.font = "9px system-ui, -apple-system, sans-serif", n.fillStyle = "#6e727a", yl(n, {
    left: p,
    right: m,
    top: f,
    width: a,
    graphWidth: h,
    graphHeight: u,
    height: o,
    timeMin: S,
    timeMax: x,
    totalDuration: b,
    xFor: q,
    frame: e.frame
  }), vl(n, { left: p, right: m, top: f, width: a, graphHeight: u, minimum: G, maximum: B, yFor: H }), G <= 0 && B >= 0) {
    const $ = H(0);
    n.strokeStyle = "#383842", n.lineWidth = 1.2, n.beginPath(), n.moveTo(p, $), n.lineTo(a - m, $), n.stroke();
  }
  e.curveHitPoints = [];
  for (const $ of l) {
    n.strokeStyle = $.color, n.lineWidth = 2, n.beginPath();
    let W = !1;
    E.forEach((I) => {
      const V = q(I.frame), X = H($.get(I.value));
      V >= p - 50 && V <= a - m + 50 && (W ? n.lineTo(V, X) : (n.moveTo(V, X), W = !0));
    }), n.stroke();
    for (const I of c) {
      const V = i ? I.transform : I.camera, X = q(I.frame), le = H($.get(V)), de = I.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(I.frame);
      de && (n.fillStyle = "rgba(242, 208, 107, 0.35)", n.beginPath(), n.arc(X, le, 8.5, 0, Math.PI * 2), n.fill()), n.fillStyle = de ? "#ffd75e" : $.color, n.strokeStyle = "#0d0d10", n.lineWidth = 1.6, n.beginPath(), n.arc(X, le, de ? 5.2 : 3.8, 0, Math.PI * 2), n.fill(), n.stroke(), e.curveHitPoints.push({
        x: X,
        y: le,
        key: I,
        channel: $,
        minimum: G,
        maximum: B,
        timeMin: S,
        timeMax: x,
        graphHeight: u,
        graphWidth: h,
        lastFrame: b,
        left: p,
        top: f,
        object: i
      });
    }
    if (e.showCurveHandles)
      for (let I = 0; I < c.length; I++) {
        const V = c[I], X = V.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(V.frame);
        if (!(X || e.curveChannelFilter !== "all" || c.length <= 4) || V.interpolation !== "bezier") continue;
        const de = i ? V.transform || i : V.camera || V, Q = q(V.frame), me = H($.get(de)), be = c[I - 1], fe = c[I + 1], ve = Math.max(1, V.frame - (be?.frame ?? V.frame - 1)), F = Math.max(1, (fe?.frame ?? V.frame + 1) - V.frame), N = Ts(
          V,
          $.id,
          be,
          fe,
          (oe) => $.get(i ? oe.transform || i : oe.camera || V)
        ), se = (B - G) / Math.max(1, u), ce = h * F / Math.max(1, v), he = h * ve / Math.max(1, v), pe = [];
        (be || I > 0) && pe.push({ side: "in", x: Q + N.in_x * he, y: me - N.in_y / se }), (fe || I < c.length - 1 || c.length === 1) && pe.push({ side: "out", x: Q + N.out_x * ce, y: me - N.out_y / se });
        for (const oe of pe) {
          if (n.strokeStyle = $.color, n.lineWidth = X ? 1.5 : 1, n.beginPath(), n.moveTo(Q, me), n.lineTo(oe.x, oe.y), n.stroke(), n.fillStyle = X ? "#2a2233" : "#171720", n.strokeStyle = X ? "#ffd75e" : $.color, n.lineWidth = X ? 2 : 1.2, n.beginPath(), oe.side === "in")
            n.arc(oe.x, oe.y, X ? 5 : 3.8, 0, Math.PI * 2);
          else {
            const Se = X ? 4.5 : 3.2;
            n.rect(oe.x - Se, oe.y - Se, Se * 2, Se * 2);
          }
          n.fill(), n.stroke(), e.curveHitPoints.push({
            x: oe.x,
            y: oe.y,
            key: V,
            keyX: Q,
            keyY: me,
            channel: $,
            minimum: G,
            maximum: B,
            timeMin: S,
            timeMax: x,
            top: f,
            left: p,
            graphHeight: u,
            graphWidth: h,
            lastFrame: b,
            object: i,
            handle: oe.side,
            pixelPerSegment: oe.side === "in" ? he : ce,
            valuePerPixel: se,
            startHandles: { ...N }
          });
        }
      }
  }
  if (e.curveBoxSelect) {
    const $ = Math.min(e.curveBoxSelect.startX, e.curveBoxSelect.currentX), W = Math.min(e.curveBoxSelect.startY, e.curveBoxSelect.currentY), I = Math.abs(e.curveBoxSelect.currentX - e.curveBoxSelect.startX), V = Math.abs(e.curveBoxSelect.currentY - e.curveBoxSelect.startY);
    n.fillStyle = "rgba(56, 189, 248, 0.15)", n.fillRect($, W, I, V), n.strokeStyle = "#38bdf8", n.lineWidth = 1, n.setLineDash([4, 4]), n.strokeRect($, W, I, V), n.setLineDash([]);
  }
  const ae = q(e.frame);
  if (ae >= p && ae <= a - m && (n.strokeStyle = "#a78bfa", n.lineWidth = 1.5, n.beginPath(), n.moveTo(ae, f), n.lineTo(ae, f + u), n.stroke(), n.fillStyle = "#a78bfa", n.beginPath(), n.moveTo(ae - 4, f), n.lineTo(ae + 4, f), n.lineTo(ae, f + 6), n.closePath(), n.fill()), e.curveDrag || e.curveHover) {
    let $ = "", W = "";
    if (e.curveDrag)
      if (e.curveDrag.handle) {
        const I = e.curveDrag.handle === "in" ? "In" : "Out";
        $ = `F${e.curveDrag.key.frame} · ${e.curveDrag.channel.name} (${I})`, W = "Tangent edit";
      } else if (e.curveDrag.group && e.curveDrag.group.length > 1) {
        const I = e.curveDrag.key.frame - e.curveDrag.startFrame, V = e.curveDrag.channel.get(e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera), X = V - e.curveDrag.startValue, le = I >= 0 ? `+${I}` : `${I}`, de = X >= 0 ? `+${X.toFixed(2)}` : `${X.toFixed(2)}`;
        $ = `${e.curveDrag.group.length} keys · ΔF: ${le} · ΔVal: ${de}`, W = `${e.curveDrag.channel.name}: ${V.toFixed(2)}`;
      } else {
        const I = e.curveDrag.key.frame - e.curveDrag.startFrame, V = e.curveDrag.channel.get(e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera), X = V - e.curveDrag.startValue, le = I >= 0 ? `+${I}` : `${I}`, de = X >= 0 ? `+${X.toFixed(2)}` : `${X.toFixed(2)}`;
        $ = `F${e.curveDrag.key.frame} (${le}) · ${e.curveDrag.channel.name}: ${V.toFixed(2)} (${de})`;
      }
    else if (e.curveHover)
      if (e.curveHover.channelName) {
        const I = Number.isFinite(e.curveHover.value) ? e.curveHover.value.toFixed(2) : "";
        $ = `F${e.curveHover.frame} · ${e.curveHover.channelName}: ${I}`, e.curveHover.isHandle && (W = `Handle ${e.curveHover.handleSide}`);
      } else
        $ = `Frame ${e.curveHover.frame}`;
    if ($) {
      n.save(), n.font = "11px system-ui, -apple-system, sans-serif";
      const I = n.measureText($), V = W ? n.measureText(W) : { width: 0 }, X = Math.max(I.width, V.width) + 16, le = W ? 32 : 20, de = a - m - X - 6, Q = f + 6;
      n.fillStyle = "rgba(18, 18, 24, 0.88)", n.strokeStyle = "#38384a", n.lineWidth = 1, n.beginPath(), n.roundRect ? n.roundRect(de, Q, X, le, 4) : n.rect(de, Q, X, le), n.fill(), n.stroke(), n.fillStyle = "#e2e8f0", n.fillText($, de + 8, Q + (W ? 13 : 14)), W && (n.fillStyle = "#94a3b8", n.font = "9.5px system-ui, -apple-system, sans-serif", n.fillText(W, de + 8, Q + 26)), n.restore();
    }
  }
  for (const $ of e.root.querySelectorAll("[data-tangent-mode]")) {
    const W = e.selectedKeyframe(), I = W?.tangents?.channels?.[l[0]?.id]?.mode || W?.tangents?.mode || "auto";
    $.classList.toggle("active", $.dataset.tangentMode === I);
  }
  for (const $ of e.root.querySelectorAll("[data-channel-filter]"))
    $.classList.toggle("active", $.dataset.channelFilter === (e.curveChannelFilter || "all"));
  for (const $ of e.root.querySelectorAll("[data-curve-mode]"))
    $.classList.toggle("active", $.dataset.curveMode === e.selectedKeyframe()?.interpolation);
}
function Ar(e, { filter: t, label: a, color: o, title: r }) {
  const n = document.createElement("button");
  if (n.type = "button", n.className = "curve-mode", n.dataset.channelFilter = t, n.title = r, o) {
    const i = document.createElement("span");
    i.className = "ch-dot", i.style.background = o, n.appendChild(i);
  }
  return n.appendChild(document.createTextNode(a)), n.addEventListener("click", () => e.setChannelFilter(t)), n;
}
function Il(e) {
  const t = e.curveChannelFilter;
  e.curveChannelFilter = "all";
  try {
    return Xe(e);
  } finally {
    e.curveChannelFilter = t;
  }
}
function Kn(e) {
  const t = e.root.querySelector('[data-role="curve-legend"]');
  if (!t) return;
  const a = e.timelineObject(), o = a ? a.name || a.type : e.activeCameraTrack().name, r = Il(e), n = `${o}\0${r.map((c) => `${c.id}:${c.color}`).join("|")}`;
  if (t.dataset.signature !== n) {
    t.dataset.signature = n, t.replaceChildren();
    const c = document.createElement("span");
    c.className = "oc-graph-legend-title", c.textContent = o, t.appendChild(c), t.appendChild(Ar(e, {
      filter: "all",
      label: s("All"),
      color: null,
      title: s("Show all curves in group")
    })), r.forEach((l, p) => {
      t.appendChild(Ar(e, {
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
const Pl = 1e-4;
function Tr(e, t, a) {
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
    (r === null || !(Math.abs(c - r) <= Pl)) && o.push(n.frame), r = c;
  }
  return o;
}
function ir(e) {
  const t = e.root.querySelector('[data-role="graph-dope"]');
  if (!t || t.hidden) return;
  const a = e.timelineKeyframes() || [], o = !!e.timelineObject(), r = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame])), n = Xe(e), i = [
    e.state.duration_frames,
    Number(e.timelineZoom) || 1,
    Number(e.timelinePan) || 0,
    ...n.map((c) => `${c.id}:${Tr(a, c, o).join(",")}`)
  ].join("\0");
  if (t.dataset.signature === i) {
    for (const c of t.querySelectorAll(".oc-dope-key")) {
      const l = Number(c.dataset.frame);
      c.classList.toggle("at-playhead", l === e.frame), c.classList.toggle("selected", r.has(l));
    }
    uo(e);
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
    for (const d of Tr(a, c, o)) {
      const h = ue(e, d);
      if (h < -5 || h > 105) continue;
      const u = document.createElement("button");
      u.type = "button", u.className = `oc-dope-key${d === e.frame ? " at-playhead" : ""}${r.has(d) ? " selected" : ""}`, u.style.left = `${h}%`, u.dataset.frame = String(d), u.title = s("{channel} changes at frame {frame}").replace("{channel}", s(c.name)).replace("{frame}", String(d)), u.addEventListener("click", (b) => {
        b.preventDefault(), b.stopPropagation();
        const y = a.find((g) => g.frame === d);
        y && e.selectKeyframe(y);
      }), m.appendChild(u);
    }
    const f = document.createElement("span");
    f.className = "oc-gdope-playhead", m.appendChild(f), l.appendChild(m), t.appendChild(l);
  }
  uo(e);
}
const Ir = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
function Rn(e, t) {
  const a = e.state.cameras.findIndex((r) => r.id === t), o = a >= 0 ? e.state.cameras[a] : null;
  return { camera: o, color: o?.color || Ir[Math.max(0, a) % Ir.length] };
}
function it(e) {
  e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render();
}
function Dn(e, t) {
  const a = Jo(e.state);
  for (const r of t.querySelectorAll(".oc-sequence-shot")) {
    const n = a[Number(r.dataset.cutIndex)];
    if (!n) continue;
    const i = ue(e, n.start), c = ue(e, n.end + 1);
    r.style.left = `${i}%`, r.style.width = `${Math.max(0.4, c - i)}%`;
  }
  const o = t.querySelector(".oc-sequence-playhead");
  o && (o.style.left = `${ue(e, e.frame)}%`);
}
function Ol(e) {
  e.checkpoint("Auto-split shots"), e.state.sequence = {
    ...e.state.sequence || { recording_path: "" },
    enabled: !0,
    cuts: Os(e.state)
  }, it(e), e.setStatus(s("Split into {count} shots").replace("{count}", String(e.state.sequence.cuts.length)));
}
function eo(e, t, a, { disabled: o = !1 } = {}) {
  const r = document.createElement("button");
  return r.type = "button", r.className = "curve-mode", r.title = t, r.textContent = e, r.disabled = o, r.addEventListener("click", a), r;
}
function zl(e, t) {
  const a = document.createElement("div");
  a.className = "oc-sequence-toolbar";
  const o = e.state.cameras.length < 2;
  if (a.appendChild(eo(
    s("Auto-split shots"),
    s("Split the timeline evenly across every camera"),
    () => Ol(e),
    { disabled: o }
  )), t.length && (a.appendChild(eo(
    s("Split at playhead"),
    s("Cut the current shot in two at the playhead"),
    () => {
      e.checkpoint("Split shot"), un(e.state, e.frame, null) ? it(e) : e.setStatus(s("Move the playhead inside a shot first"));
    },
    { disabled: o }
  )), a.appendChild(eo(
    s("Clear edit"),
    s("Remove every shot and stop cutting the timeline"),
    () => {
      e.checkpoint("Clear edit"), e.state.sequence = { ...e.state.sequence, enabled: !1, cuts: [] }, it(e), e.setStatus(s("Multi-camera edit cleared"));
    }
  ))), a.appendChild(eo(
    e.audioWaveformPeaks?.length ? s("Replace audio") : s("Load audio"),
    s("Load an audio track to cut against"),
    () => e.root.querySelector('[data-role="audio-file"]')?.click()
  )), t.length) {
    const r = document.createElement("span");
    r.className = "oc-sequence-summary", r.textContent = s("{count} shots · drag a divider to trim · right-click a shot for its camera").replace("{count}", String(t.length)), a.appendChild(r);
  }
  return a;
}
function Fl(e, t, a, o, r) {
  t.preventDefault(), t.stopPropagation();
  try {
    a.setPointerCapture(t.pointerId);
  } catch {
  }
  e.checkpoint("Trim cut"), e.sequenceDrag = !0;
  const n = (c) => {
    if (!(c.buttons & 1)) return i();
    Ps(e.state, r, Zo(e, c, o)) && Dn(e, o);
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
function Ll(e, t, a, o, r) {
  t.preventDefault(), t.stopPropagation();
  const { camera: n } = Rn(e, a.camera_id);
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
        e.checkpoint("Split shot"), un(e.state, e.frame, null) && it(e);
      }
    },
    {
      label: s("Remove shot"),
      icon: "pi-trash",
      danger: !0,
      disabled: r === 1,
      run: () => {
        e.checkpoint("Remove shot"), Is(e.state, o) && it(e);
      }
    }
  ]);
}
function Nl(e, t, a, o) {
  const { camera: r, color: n } = Rn(e, t.camera_id), i = document.createElement("div");
  i.className = "oc-sequence-shot", i.dataset.cutIndex = String(a), i.style.left = `${ue(e, t.start)}%`, i.style.width = `${Math.max(0.4, ue(e, t.end + 1) - ue(e, t.start))}%`, i.style.setProperty("--shot-color", n), r?.recording_path || i.classList.add("no-proxy"), i.title = s("{name} · F{start}-{end}").replace("{name}", r?.name || t.camera_id).replace("{start}", String(t.start)).replace("{end}", String(t.end));
  const c = document.createElement("span");
  if (c.className = "oc-sequence-name", c.textContent = r?.name || t.camera_id, i.appendChild(c), a > 0) {
    const l = document.createElement("span");
    l.className = "oc-sequence-handle", l.title = s("Drag to trim the cut"), l.addEventListener("pointerdown", (p) => Fl(e, p, l, o, a)), i.appendChild(l);
  }
  return i.addEventListener("contextmenu", (l) => Ll(e, l, t, a, o.__cutCount)), i.addEventListener("pointerdown", () => {
    e.root.querySelector('[data-role="graph-sequence"]')?.focus?.({ preventScroll: !0 });
  }), i;
}
function Kl(e) {
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
function qn(e, t) {
  if (!t) return;
  const a = t.querySelector('[data-role="sequence-track"]');
  if (e.sequenceDrag && a) {
    Dn(e, a);
    return;
  }
  const o = Jo(e.state);
  t.replaceChildren(zl(e, o));
  const r = document.createElement("div");
  r.className = "oc-sequence-tracks", r.dataset.role = "sequence-track", r.__cutCount = o.length;
  const n = document.createElement("div");
  if (n.className = "oc-sequence-lane", n.dataset.role = "sequence-lane", n.setAttribute("aria-label", s("Multi-camera edit")), o.length)
    for (const [c, l] of o.entries()) {
      const p = ue(e, l.start);
      ue(e, l.end + 1) < -5 || p > 105 || n.appendChild(Nl(e, l, c, r));
    }
  else {
    const c = document.createElement("span");
    c.className = "oc-sequence-empty", c.textContent = e.state.cameras.length > 1 ? s("No shots yet. Auto-split hands each camera a slice of the timeline.") : s("Add a second camera, then Auto-split to cut between them."), n.appendChild(c);
  }
  r.appendChild(n), r.appendChild(Kl(e));
  const i = document.createElement("span");
  i.className = "oc-sequence-playhead", i.style.left = `${ue(e, e.frame)}%`, r.appendChild(i), t.appendChild(r);
}
const Rl = ['[data-act="curve-zoom-in"]', '[data-act="curve-zoom-out"]', '[data-act="curve-fit"]', '[data-act="curve-handles"]'], Pr = { curves: "Graph", dope: "Timeline", sequence: "Sequence" };
function Or(e, t) {
  const a = t in Pr ? t : "curves";
  e.graphTab = a;
  for (const i of e.root.querySelectorAll("[data-graph-tab]")) {
    const c = i.dataset.graphTab === a;
    i.classList.toggle("active", c), i.setAttribute("aria-pressed", String(c));
  }
  const o = e.root.querySelector('[data-role="curve-canvas"]'), r = e.root.querySelector('[data-role="graph-dope"]'), n = e.root.querySelector('[data-role="graph-sequence"]');
  o && (o.hidden = a !== "curves"), r && (r.hidden = a !== "dope"), n && (n.hidden = a !== "sequence");
  for (const i of Rl) {
    const c = e.root.querySelector(i);
    c && (c.disabled = a !== "curves");
  }
  a === "dope" ? ir(e) : a === "sequence" ? (qn(e, n), n?.focus?.({ preventScroll: !0 })) : e.drawCurveEditor(), e.setStatus(s(Pr[a]));
}
function Dl(e) {
  e.graphTab === "sequence" && qn(e, e.root.querySelector('[data-role="graph-sequence"]'));
}
function ql(e, t) {
  const a = e.root.querySelector('[data-role="graph-tabs"]');
  a && a.addEventListener("keydown", (o) => {
    if (o.key === "ArrowLeft" || o.key === "ArrowRight") {
      o.preventDefault(), o.stopPropagation();
      const r = [...a.querySelectorAll("[data-graph-tab]")], n = r.findIndex((i) => i.classList.contains("active"));
      if (n >= 0 && r.length > 1) {
        const i = o.key === "ArrowRight" ? (n + 1) % r.length : (n - 1 + r.length) % r.length;
        r[i].focus(), Or(e, r[i].dataset.graphTab);
      }
    }
  }, { signal: t });
  for (const o of e.root.querySelectorAll("[data-graph-tab]"))
    o.addEventListener("click", (r) => {
      r.preventDefault(), r.stopPropagation(), Or(e, o.dataset.graphTab);
    }, { signal: t });
}
const Bl = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function Bn(e, t) {
  const a = Math.max(0, Math.floor(Number(t) || 0)), o = Array.from({ length: a }, (n, i) => ({ frame: i, state: "unknown", score: null })), r = e?.solve_health_v1;
  if (!r || !Array.isArray(r.frames)) return o;
  for (const n of r.frames) {
    const i = Number(n?.frame);
    if (!Number.isInteger(i) || i < 0 || i >= o.length) continue;
    const c = Bl.has(n?.state) ? n.state : "unknown", l = n?.score;
    let p = null;
    if (l != null) {
      const m = Number(l);
      p = Number.isFinite(m) ? Math.max(0, Math.min(1, m)) : null;
    }
    o[i] = { frame: i, state: c, score: p };
  }
  return o;
}
let zr = /* @__PURE__ */ new WeakSet();
function Wl(e) {
  if (!e) return "";
  const t = e.score === null || e.score === void 0 ? "" : ` · ${Math.round(e.score * 100)}%`;
  return `F${e.frame} · ${e.state}${t}`;
}
function Vl(e) {
  const t = e.root?.querySelector?.('[data-role="solve-health-strip"]'), a = e.root?.querySelector?.('[data-role="solve-health-cells"]');
  if (!t || !a) return;
  const o = Bn(e.state?.metadata, e.state?.duration_frames), r = o.some((c) => c.state !== "unknown");
  t.classList.toggle("oc-health-strip-empty", !r), a.childElementCount !== o.length && a.replaceChildren(...o.map(() => {
    const c = document.createElement("span");
    return c.className = "oc-health-cell", c;
  }));
  const n = a.children;
  for (let c = 0; c < o.length; c += 1) {
    const l = n[c], p = o[c];
    l.dataset.frame = String(p.frame), l.dataset.state = p.state, l.dataset.score = p.score === null ? "" : String(p.score), l.classList.toggle("at-playhead", p.frame === e.frame);
  }
  if (zr.has(a)) return;
  zr.add(a), a.addEventListener("pointerdown", (c) => {
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
      i.textContent = Wl({
        frame: Number(l.dataset.frame),
        state: l.dataset.state,
        score: l.dataset.score === "" ? null : Number(l.dataset.score)
      });
    }
  }), a.addEventListener("pointerleave", () => {
    i && (i.textContent = "");
  });
}
function Ul(e) {
  const t = e.root.querySelector('[data-role="keys"]');
  if (!t) return;
  t.innerHTML = "";
  const a = e.timelineObject(), o = e.timelineKeyframes(), r = Math.max(1, e.state.duration_frames - 1), n = Y(Number(e.timelineZoom) || 1, 0.1, 50), i = Number(e.timelinePan) || 0, c = r / n, l = i;
  if (e.audioWaveformPeaks && e.audioWaveformPeaks.length) {
    const v = document.createElement("canvas");
    v.className = "timeline-waveform", v.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:0.35", v.width = Math.max(1, t.clientWidth || 600), v.height = Math.max(1, t.clientHeight || 68);
    const S = v.getContext("2d"), x = e.audioWaveformPeaks, E = v.width, M = v.height, K = M / 2;
    S.fillStyle = "#f2d06b";
    for (let P = 0; P < x.length; P++) {
      const B = (P / (x.length - 1) * r - l) / Math.max(1e-6, c) * E;
      if (B >= -5 && B <= E + 5) {
        const U = x[P] * (M * 0.85);
        S.fillRect(B, K - U / 2, Math.max(1, E / x.length * n - 0.5), U);
      }
    }
    t.appendChild(v);
  }
  if (e.state.playback_range) {
    const v = document.createElement("div");
    v.className = "playback-range";
    const S = ue(e, e.state.playback_range[0]), x = ue(e, e.state.playback_range[1]);
    v.style.left = `${S}%`, v.style.width = `${Math.max(0, x - S)}%`, t.appendChild(v);
  }
  zs(e, t);
  for (const v of e.state.markers || []) {
    const S = ue(e, v.frame);
    if (S < -5 || S > 105) continue;
    const x = document.createElement("span");
    x.className = "timeline-marker", x.style.left = `${S}%`, x.style.setProperty("--marker-color", v.color), x.title = v.name, t.appendChild(x);
  }
  if (o.length > 1) {
    const v = ue(e, o[0].frame), S = ue(e, o[o.length - 1].frame), x = document.createElement("span");
    x.className = "oc-dope-rail", x.style.left = `${Math.min(v, S)}%`, x.style.width = `${Math.abs(S - v)}%`, x.style.setProperty("--channel-color", "#a78bfa"), t.appendChild(x);
  }
  const p = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const v of o) {
    const S = ue(e, v.frame);
    if (S < -5 || S > 105) continue;
    const x = document.createElement("button");
    x.type = "button", x.className = `key${v.frame === e.frame ? " at-playhead" : ""}${p.has(v.frame) ? " selected" : ""}${v.frame === e.editingKeyFrame ? " editing" : ""}`, x.dataset.keyFrame = String(v.frame), x.dataset.interp = v.interpolation || "ease", x.setAttribute("aria-label", s(`${a?.name || "Camera"} keyframe at frame ${v.frame}`)), x.title = s(`Frame ${v.frame} · ${v.interpolation} · Drag: Retime · Alt+Drag: Duplicate`), x.style.left = `${S}%`;
    const E = document.createElement("span");
    E.className = "key-label", E.textContent = String(v.frame), x.appendChild(E), x.addEventListener("pointerdown", (M) => {
      if (M.preventDefault(), M.stopPropagation(), x.focus({ preventScroll: !0 }), M.altKey) {
        e.checkpoint("Duplicate keyframe");
        const P = a ? { frame: v.frame, transform: Be(v.transform), interpolation: v.interpolation } : { frame: v.frame, camera: ye(v.camera), interpolation: v.interpolation }, G = e.timelineKeyframes();
        G.push(P), G.sort((B, U) => B.frame - U.frame), e.selectedKeyFrame = P.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([P.frame]), e.keyDrag = { key: P, box: t, isDuplicate: !0, historyCheckpointed: !0, moving: [{ key: P, startFrame: P.frame }], startPointerFrame: v.frame, startClientX: M.clientX, startClientY: M.clientY }, e.setFrame(P.frame, !1, !1), e.setStatus(s(`Duplicating key from ${v.frame}...`));
        return;
      }
      if (M.shiftKey) {
        e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((P) => P !== null)), e.selectedKeyFrames.has(v.frame) ? e.selectedKeyFrames.delete(v.frame) : e.selectedKeyFrames.add(v.frame), e.selectedKeyFrame = e.selectedKeyFrames.has(v.frame) ? v.frame : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(v.frame, !1, !1), e.updateKeyVisualState(), e.refreshKeyEditor();
        return;
      }
      e.selectedKeyFrames?.has(v.frame) || (e.selectedKeyFrames = /* @__PURE__ */ new Set([v.frame])), e.selectedKeyFrame = v.frame;
      const K = e.timelineKeyframes().filter((P) => e.selectedKeyFrames.has(P.frame));
      e.keyDrag = { key: v, box: t, historyCheckpointed: !1, moving: K.map((P) => ({ key: P, startFrame: P.frame })), startPointerFrame: v.frame, startClientX: M.clientX, startClientY: M.clientY }, e.setFrame(v.frame, !1, !1);
    }), x.addEventListener("click", (M) => {
      M.preventDefault(), M.stopPropagation(), !M.shiftKey && (M.shiftKey || (e.selectedKeyFrames = /* @__PURE__ */ new Set([v.frame])), e.selectKeyframe(v));
    }), t.appendChild(x);
  }
  const m = e.activeCameraTrack(), f = e.root.querySelector('[data-role="timeline-summary"]');
  if (f) {
    f.replaceChildren();
    const v = document.createElement("span");
    v.style.fontWeight = "700", e.selectedEntity === "object" && a ? (v.style.color = "#38bdf8", v.textContent = `📦 ${a.name || a.type}`, f.title = s(`Currently animating object: ${a.name || a.type}`)) : (v.style.color = "#f59e0b", v.textContent = `🎥 ${m.name}`, f.title = s(`Currently animating camera: ${m.name}`)), f.append(v, document.createTextNode(` · ${o.length} key${o.length === 1 ? "" : "s"}`));
    const S = e.selectedKeyFrames?.size || 0;
    S > 1 && f.append(document.createTextNode(` · ${S} selected`));
    const x = o.filter((E) => E.frame > e.state.duration_frames - 1).length;
    if (x) {
      const E = document.createElement("span");
      E.className = "oc-dormant-keys", E.textContent = ` · ${x} beyond end`, E.title = s("Keys past the end of the timeline are kept. Lengthen the shot to reach them again."), f.append(E);
    }
  }
  const d = e.root.querySelector('[data-role="key-count"]');
  d && (d.textContent = String(o.length));
  const h = e.root.querySelector('[data-role="camera-summary"]');
  h && (h.textContent = `${m.name} · Key F${e.selectedKeyFrame ?? e.frame}`);
  const u = e.root.querySelector('[data-role="camera-menu-list"]');
  if (u) {
    u.innerHTML = "";
    for (const v of e.state.cameras) {
      const S = document.createElement("button");
      S.type = "button", S.className = v.id === e.state.active_camera_id ? "selected" : "";
      const x = document.createElement("i");
      x.className = "pi pi-video";
      const E = document.createElement("span");
      E.textContent = `${v.name} · ${v.keyframes.length} key${v.keyframes.length === 1 ? "" : "s"}${v.id === e.state.playblast_camera_id ? " · PLAYBLAST" : ""}`, S.append(x, E), S.addEventListener("click", () => {
        e.activateCamera(v.id), e.closeMenus();
      }), u.appendChild(S);
    }
  }
  const b = e.root.querySelector('[data-role="frame-total"]');
  b && (b.textContent = `/ ${Math.max(1, e.state.duration_frames)}`);
  const y = e.root.querySelector('[data-role="preview-title"]');
  y && (y.textContent = `${m.name} · ${s("Frame")} ${e.frame}`);
  const g = e.root.querySelector('[data-role="inspector-camera-name"]');
  g && (g.textContent = m.name), Ln(e), Pn(e), Kn(e), ir(e), Dl(e), e.refreshCameraSelectors(), e.refreshKeyEditor(), e.updateEditState(), e.drawCurveEditor(), e.perf && (e.perf.timelineRefreshCount = (e.perf.timelineRefreshCount || 0) + 1), Vl(e);
}
class Wn {
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
class Vn {
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
async function cr(e, { route: t, field: a = "file", file: o }) {
  if (!o) throw new TypeError("A file is required");
  const r = new FormData();
  r.append(a, o, o.name);
  const n = await e.fetchApi(t, { method: "POST", body: r });
  if (!n.ok) throw new Error(await n.text());
  return n.json();
}
const Hl = `
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
`, Gl = `
      .majoor-omnicam .menu-section{display:flex;flex-direction:column;gap:5px}
      .majoor-omnicam[data-density="basic"] [data-density-min="animation"],
      .majoor-omnicam[data-density="basic"] [data-density-min="advanced"],
      .majoor-omnicam[data-density="animation"] [data-density-min="advanced"]{display:none !important}
`, Yl = `
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
`, Xl = `
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
`, Zl = Xc + Xl + Hl + vc + Gl + Yl;
function Jl() {
  return `
    <div class="oc-header">
      ${Zc("OmniCam Director")}
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
function Ql() {
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
const ed = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>', td = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-9 5-9-5V8l9-5 9 5v8z"/><path d="m3.27 6.96 8.73 4.84 8.73-4.84"/><path d="M12 22V12"/></svg>', ad = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 20h20L12 2z"/><path d="M12 2v18"/></svg>', od = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>', rd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>', nd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 8-4 4-8-8 4-4z"/><path d="M7 11L2 16l6 6 5-5"/><path d="M18 19l4 2"/><path d="M21 16l2 2"/></svg>', sd = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>', id = '<svg class="oc-add-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6H4z"/><circle cx="17" cy="7" r="3"/><path d="m6 3 4 7H2z"/></svg>';
function cd() {
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
function ld() {
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
              ${ed} <span>${s("Sphere")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="cube">
              ${td} <span>${s("Cube")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="pyramid">
              ${ad} <span>${s("Pyramide")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="sun_light">
              ${od} <span>${s("Sun light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="point_light">
              ${rd} <span>${s("Point light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="spot_light">
              ${nd} <span>${s("Spot light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-act="add-camera">
              ${sd} <span>${s("Camera")}</span>
            </button>
            <div class="oc-add-menu-item oc-has-submenu" tabindex="0">
              ${id} <span>${s("Assets")}</span>
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
      ${cd()}
    </aside>`;
}
function dd() {
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
function md() {
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
function pd() {
  const e = xc.map((t) => `<button data-lens="${t}">${t}mm</button>`).join("");
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
function fd() {
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
function hd() {
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
function ud() {
  return `
    <div class="viewport-inspector oc-side" data-role="viewport-inspector">
      <div class="oc-inspector-head oc-side-tabs">
        <strong class="oc-inspector-title" data-role="inspector-title">${s("Inspector")}</strong>
        <span class="oc-panel-spacer"></span>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="motion" data-tab="motion" aria-pressed="false">${s("Motion")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="shot" data-tab="display" aria-pressed="false">${s("Shot")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="health" data-tab="health" data-density-min="animation" aria-pressed="false">${s("Health")}</button>
      </div>
      ${dd()}
      ${md()}
      ${pd()}
      ${fd()}
      ${hd()}
    </div>`;
}
function bd() {
  return `
    <div class="oc-health-strip" data-role="solve-health-strip" data-density-min="animation">
      <span class="oc-health-strip-label">${s("Solve Health")}</span>
      <div class="oc-health-cells" data-role="solve-health-cells"
           role="group" aria-label="${s("Per-frame solve health")}"></div>
      <span class="oc-health-strip-readout" data-role="solve-health-readout" aria-live="polite"></span>
    </div>`;
}
function gd() {
  return `
    <div class="oc-preview camera-view-row" data-role="camera-view-row">
      <div class="oc-preview-head">
        <span data-role="preview-title">${s("Camera")}</span>
        <button class="camera-strip-close" data-act="toggle-camera-view" title="${s("Hide camera previews")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="camera-preview-strip" data-role="camera-previews"></div>
    </div>`;
}
function yd() {
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
function vd() {
  return `
    <div class="oc-dope">
      <div class="oc-dope-body">
        <div class="oc-dope-labels">${In.map((t) => `
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
function xd() {
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
function wd() {
  return `
    <div class="oc-lower">
      ${gd()}
      <div class="oc-resize-h" data-role="preview-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${s("Drag to resize the camera view — double-click to reset")}" aria-label="${s("Resize the camera view")}"></div>
      <div class="timeline oc-timeline">
        ${yd()}
        ${bd()}
        ${vd()}
        <div class="motion-timeline" data-role="motion-timeline" aria-label="${s("Motion track timeline")}"></div>
      </div>
    </div>
    ${xd()}`;
}
function kd() {
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
function Sd() {
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
function jd() {
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
function Cd() {
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
function _d() {
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
function Ed() {
  return `
    <div class="top">
      <button class="icon-button oc-drawer-toggle" data-act="toggle-scene-panel" title="${s("Scene")}" aria-pressed="false"><i class="pi pi-list"></i></button>
      ${kd()}
      ${Sd()}
      ${jd()}
      ${Cd()}
      ${_d()}
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
function $d() {
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
function Md() {
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
function Ad() {
  return `
    <div class="motion-tools" role="toolbar" aria-label="${s("Motion track tools")}">
      <button class="active" data-motion-tool="select" aria-pressed="true" title="${s("Select motion track")}"><i class="pi pi-arrow-up-left"></i></button>
      <button data-motion-tool="track" aria-pressed="false" title="${s("Draw motion track")}"><i class="pi pi-pencil"></i></button>
      <button data-motion-tool="anchor" aria-pressed="false" title="${s("Add static screen anchor")}"><i class="pi pi-map-marker"></i></button>
      <button data-motion-tool="project" aria-pressed="false" title="${s("Project selected object or world point")}"><i class="pi pi-bullseye"></i></button>
      <button data-motion-tool="erase" aria-pressed="false" title="${s("Erase motion track")}"><i class="pi pi-eraser"></i></button>
    </div>`;
}
function Td() {
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

      ${Md()}
      ${Ad()}

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

      ${$d()}

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
function Un() {
  const e = document.createElement("div");
  e.className = "majoor-omnicam", e.innerHTML = `
    <style>${Zl}</style>
    ${Jl()}
    ${Ed()}
    <div class="oc-body">
      ${ld()}
      <div class="oc-resize-h oc-left-resize" data-role="left-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${s("Drag to resize the scene panel — double-click to reset")}" aria-label="${s("Resize scene panel")}"></div>
      <div class="oc-stage">${Td()}</div>
      <div class="oc-resize-h oc-side-resize" data-role="side-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${s("Drag to resize the side panel — double-click to reset")}" aria-label="${s("Resize side panel")}"></div>
      ${ud()}
    </div>
    ${wd()}
    ${Ql()}`;
  const t = document.createElement("div");
  return t.className = "context-menu", t.dataset.role = "context-menu", t.setAttribute("role", "menu"), t.hidden = !0, e.appendChild(t), e;
}
const Tt = 1, Fr = 50, ee = Object.freeze({
  ASSET_INSTANTIATE: "asset.instantiate",
  CAMERA_SET_ACTIVE: "camera.set_active",
  CAMERA_TRANSFORM: "camera.transform",
  CAMERA_LOOK_AT: "camera.look_at",
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
  TIMELINE_SET_DURATION: "timeline.set_duration"
}), Id = Object.freeze(Object.values(ee)), $e = Object.freeze({
  SCENE_GET: "scene.get",
  ASSET_LIST: "asset.list",
  ASSET_GET: "asset.get",
  CAMERA_GET: "camera.get",
  TIMELINE_GET: "timeline.get",
  SELECTION_GET: "selection.get",
  HEALTH_GET: "health.get",
  CHARACTER_GET_RIG: "character.get_rig",
  CHARACTER_GET_POSE: "character.get_pose"
});
Object.freeze(Object.values($e));
class D extends Error {
  constructor(t, a, o = null) {
    super(a), this.name = "DirectorApiError", this.code = t, this.operationIndex = o;
  }
}
function Ue(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Pd(e, t) {
  const a = e.state || {};
  switch (t?.type) {
    case $e.SCENE_GET:
      return {
        version: 1,
        type: t.type,
        scene: Ue({
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
      };
    case $e.CAMERA_GET: {
      const o = t.cameraId || a.active_camera_id, r = (a.cameras || []).find((n) => n.id === o);
      if (!r) throw new D("UNKNOWN_CAMERA", `Unknown camera: ${o}`);
      return { version: 1, type: t.type, camera: Ue(r) };
    }
    case $e.TIMELINE_GET:
      return {
        version: 1,
        type: t.type,
        timeline: Ue({
          frame: e.frame ?? 0,
          duration_frames: a.duration_frames,
          fps: a.fps,
          playback_range: Array.isArray(a.playback_range) ? a.playback_range : null
        })
      };
    case $e.SELECTION_GET:
      return {
        version: 1,
        type: t.type,
        selection: {
          entity: e.selectedEntity ?? null,
          objectId: e.selectedObjectId ?? null,
          objectIds: [...e.selectedObjectIds || []],
          keyFrame: e.selectedKeyFrame ?? null
        }
      };
    case $e.HEALTH_GET:
      return {
        version: 1,
        type: t.type,
        frames: Bn(a.metadata, a.duration_frames)
      };
    case $e.ASSET_LIST: {
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
      return { version: 1, type: t.type, items: Ue(r), total: r.length };
    }
    case $e.ASSET_GET: {
      const o = (a.objects || []).find((r) => r.id === t.objectId);
      if (!o) throw new D("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return {
        version: 1,
        type: t.type,
        asset: Ue({
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
      };
    }
    case $e.CHARACTER_GET_RIG: {
      const o = (a.objects || []).find((n) => n.id === t.objectId);
      if (!o) throw new D("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const r = o.character || null;
      return {
        version: 1,
        type: t.type,
        rig: Ue({
          objectId: o.id,
          asset_id: o.asset_id || null,
          asset_kind: o.asset_kind || null,
          is_character: o.asset_kind === "character",
          rig_profile: r?.rig_profile || null,
          pose_preset: r?.pose?.preset_id || null,
          has_motion: !!r?.motion
        })
      };
    }
    case $e.CHARACTER_GET_POSE: {
      const o = (a.objects || []).find((n) => n.id === t.objectId);
      if (!o) throw new D("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const r = o.character?.pose || {};
      return {
        version: 1,
        type: t.type,
        pose: Ue({
          objectId: o.id,
          preset_id: r.preset_id || "neutral",
          root_offset: Array.isArray(r.root_offset) ? r.root_offset : [0, 0, 0],
          joints: r.joints || {},
          has_motion: !!o.character?.motion
        })
      };
    }
    default:
      throw new D("UNKNOWN_QUERY", `Unsupported query: ${t?.type}`);
  }
}
const nt = (e) => typeof e == "number" && Number.isFinite(e);
function Te(e, t, a) {
  if (!Array.isArray(e) || e.length !== 3 || !e.every(nt))
    throw new D("BAD_VECTOR", `${t} must be [x,y,z] of finite numbers`, a);
}
function Qe(e, t, a) {
  if (!Number.isInteger(e) || e < 0)
    throw new D("BAD_FRAME", `${t} must be a non-negative integer frame`, a);
}
function ge(e, t, a) {
  if (typeof e != "string" || e.length === 0)
    throw new D("BAD_ID", `${t} must be a non-empty string`, a);
}
function Od(e, t) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new D("BAD_OPERATION", "operation must be an object", t);
  const { type: a } = e;
  if (!Id.includes(a))
    throw new D("UNKNOWN_OPERATION", `Unknown operation type: ${a}`, t);
  switch (a) {
    case ee.ASSET_INSTANTIATE: {
      const o = e.asset;
      if (!o || typeof o != "object" || Array.isArray(o))
        throw new D("BAD_VALUE", "asset.instantiate needs a resolved asset object", t);
      if (ge(o.id, "asset.id", t), ge(o.kind, "asset.kind", t), String(o.id).length > 120 || String(o.kind).length > 32)
        throw new D("BAD_VALUE", "asset.id / asset.kind exceed their bounds", t);
      if (o.tags !== void 0 && (!Array.isArray(o.tags) || o.tags.length > 32))
        throw new D("BAD_VALUE", "asset.tags must be a list of at most 32", t);
      if (o.animations !== void 0 && (!Array.isArray(o.animations) || o.animations.length > 256))
        throw new D("BAD_VALUE", "asset.animations must be a list of at most 256", t);
      if (o.rig !== void 0 && o.rig !== null) {
        if (typeof o.rig != "object" || Array.isArray(o.rig))
          throw new D("BAD_VALUE", "asset.rig must be an object", t);
        if (o.rig.bone_map && Object.keys(o.rig.bone_map).length > 128)
          throw new D("BAD_VALUE", "asset.rig.bone_map exceeds 128 entries", t);
      }
      e.point !== void 0 && Te(e.point, "point", t), e.id !== void 0 && ge(e.id, "id", t);
      break;
    }
    case ee.CAMERA_SET_ACTIVE:
      ge(e.cameraId, "cameraId", t);
      break;
    case ee.CAMERA_TRANSFORM:
      if (e.cameraId !== void 0 && ge(e.cameraId, "cameraId", t), e.position !== void 0 && Te(e.position, "position", t), e.target !== void 0 && Te(e.target, "target", t), e.frame !== void 0 && Qe(e.frame, "frame", t), e.position === void 0 && e.target === void 0)
        throw new D("EMPTY_OPERATION", "camera.transform needs position and/or target", t);
      break;
    case ee.CAMERA_LOOK_AT:
      if (e.cameraId !== void 0 && ge(e.cameraId, "cameraId", t), e.point !== void 0 && Te(e.point, "point", t), e.objectId !== void 0 && e.objectId !== null && ge(e.objectId, "objectId", t), e.point === void 0 && e.objectId === void 0)
        throw new D("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", t);
      break;
    case ee.OBJECT_TRANSFORM:
      if (ge(e.objectId, "objectId", t), e.position !== void 0 && Te(e.position, "position", t), e.rotation !== void 0 && Te(e.rotation, "rotation", t), e.scale !== void 0 && Te(e.scale, "scale", t), e.position === void 0 && e.rotation === void 0 && e.scale === void 0)
        throw new D("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", t);
      break;
    case ee.OBJECT_SET_ENABLED:
    case ee.OBJECT_SET_LOCKED:
      if (ge(e.objectId, "objectId", t), typeof e.value != "boolean")
        throw new D("BAD_VALUE", `${a} needs a boolean value`, t);
      break;
    case ee.OBJECT_SET_TAGS:
      if (ge(e.objectId, "objectId", t), !Array.isArray(e.tags) || e.tags.some((o) => typeof o != "string"))
        throw new D("BAD_VALUE", "object.set_tags needs a string array", t);
      if (e.tags.length > 64)
        throw new D("BAD_VALUE", "object.set_tags: too many tags", t);
      break;
    case ee.OBJECT_SET_ANNOTATION:
      if (ge(e.objectId, "objectId", t), e.annotation !== null && (typeof e.annotation != "object" || Array.isArray(e.annotation)))
        throw new D("BAD_VALUE", "object.set_annotation needs an object or null", t);
      break;
    case ee.CHARACTER_SET_POSE:
      if (ge(e.objectId, "objectId", t), e.pose !== null && (typeof e.pose != "object" || Array.isArray(e.pose)))
        throw new D("BAD_VALUE", "character.set_pose needs a pose object or null", t);
      break;
    case ee.CHARACTER_SET_JOINT_ROTATION:
      if (ge(e.objectId, "objectId", t), ge(e.joint, "joint", t), !Array.isArray(e.rotation) || e.rotation.length !== 4 || !e.rotation.every(nt))
        throw new D("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", t);
      break;
    case ee.CHARACTER_SET_MOTION: {
      ge(e.objectId, "objectId", t);
      const o = e.motion;
      if (!o || typeof o != "object" || Array.isArray(o))
        throw new D("BAD_VALUE", "character.set_motion needs a motion object", t);
      ge(o.clip_id, "motion.clip_id", t);
      for (const r of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (o[r] !== void 0 && !nt(o[r]))
          throw new D("BAD_VALUE", `motion.${r} must be a finite number`, t);
      if (nt(o.start_frame) && nt(o.end_frame) && o.end_frame > 0 && o.end_frame <= o.start_frame)
        throw new D("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", t);
      break;
    }
    case ee.CHARACTER_CLEAR_MOTION:
      ge(e.objectId, "objectId", t);
      break;
    case ee.KEYFRAME_UPSERT:
      if (e.cameraId !== void 0 && ge(e.cameraId, "cameraId", t), Qe(e.frame, "frame", t), e.interpolation !== void 0 && !Ko.includes(e.interpolation))
        throw new D("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      if (e.camera !== void 0) {
        if (!e.camera || typeof e.camera != "object")
          throw new D("BAD_VALUE", "keyframe.upsert camera must be an object", t);
        e.camera.position !== void 0 && Te(e.camera.position, "camera.position", t), e.camera.target !== void 0 && Te(e.camera.target, "camera.target", t);
        for (const o of ["fov", "roll", "zoom", "near", "far"])
          if (e.camera[o] !== void 0 && !nt(e.camera[o]))
            throw new D("BAD_VALUE", `camera.${o} must be finite`, t);
      }
      break;
    case ee.KEYFRAME_REMOVE:
      e.cameraId !== void 0 && ge(e.cameraId, "cameraId", t), Qe(e.frame, "frame", t);
      break;
    case ee.KEYFRAME_SET_INTERPOLATION:
      if (e.cameraId !== void 0 && ge(e.cameraId, "cameraId", t), Qe(e.frame, "frame", t), !Ko.includes(e.interpolation))
        throw new D("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case ee.TIMELINE_SET_RANGE:
      if (Qe(e.start, "start", t), Qe(e.end, "end", t), e.end < e.start)
        throw new D("BAD_RANGE", "range end is before start", t);
      break;
    case ee.TIMELINE_SET_DURATION:
      if (!Number.isInteger(e.frames) || e.frames < 1)
        throw new D("BAD_VALUE", "timeline.set_duration needs frames >= 1", t);
      break;
    default:
      throw new D("UNKNOWN_OPERATION", `Unknown operation type: ${a}`, t);
  }
}
function zd(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new D("BAD_TRANSACTION", "transaction must be an object");
  if (t.version !== Tt)
    throw new D("UNSUPPORTED_VERSION", `Unsupported API version: ${t.version}`);
  if (typeof t.id != "string" || t.id.length === 0)
    throw new D("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  if ((e._directorApiTxIds ||= /* @__PURE__ */ new Set()).has(t.id))
    throw new D("DUPLICATE_TRANSACTION_ID", `transaction id already used: ${t.id}`);
  if (typeof t.description != "string" || t.description.trim().length === 0)
    throw new D("EMPTY_DESCRIPTION", "transaction description must not be empty");
  if (!Array.isArray(t.operations))
    throw new D("BAD_OPERATIONS", "operations must be an array");
  if (t.operations.length === 0)
    throw new D("NO_OPERATIONS", "transaction has no operations");
  if (t.operations.length > Fr)
    throw new D(
      "TOO_MANY_OPERATIONS",
      `transaction has ${t.operations.length} operations (max ${Fr})`
    );
  return t.operations.forEach((o, r) => Od(o, r)), {
    version: Tt,
    id: t.id,
    description: t.description.trim(),
    operations: t.operations,
    validateOnly: t.validateOnly === !0
  };
}
const z = Object.freeze({
  viewport: 1,
  previews: 2,
  timeline: 4,
  inspector: 8,
  outliner: 16,
  motion: 32,
  status: 64,
  all: 127
});
function Fd(e = 0, t = 0) {
  return (e | t) >>> 0;
}
function et(e, t) {
  return (e & t) !== 0;
}
const Ld = "omnicam/library", Nd = "majoor_omnicam/blockout_library", Kd = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null"
});
function Rd(e, t) {
  if (!Array.isArray(e) || e.length < 3) return [...t];
  const a = e.slice(0, 3).map((o) => Number(o));
  return a.every((o) => Number.isFinite(o)) ? a : [...t];
}
function Hn(e) {
  return e.file ? `${e.source === "legacy" ? Nd : Ld}/${e.file} [input]` : "";
}
function Lr(e, t, a) {
  const o = e || "asset";
  let r = `${o}_${a}`, n = 2;
  for (; t && t.has(r); ) r = `${o}_${a}_${n++}`;
  return r;
}
function Dd(e) {
  return {
    rig_profile: !!(e.rig && Object.keys(e.rig.bone_map || {}).length) ? e.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null
  };
}
function qd(e, t = {}) {
  if (!e || typeof e != "object" || !e.id)
    throw new Error("compileInstance: an AssetDefinition is required");
  const a = Rd(t.point, [0, 0, 0]), o = String(t.idSeed || Date.now().toString(36)), r = String(e.kind || "prop"), n = r === "character", i = Kd[e.id];
  if (r === "helper" && !e.file && i && i !== "null")
    return {
      id: Lr(i, t.existingIds, o),
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
    id: Lr(r === "character" ? "character" : r, t.existingIds, o),
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
    asset: Hn(e),
    asset_id: e.id,
    asset_kind: r,
    tags: [...e.tags || []]
  };
  return n && (c.character = Dd(e)), c;
}
function Bd({ groundHit: e, orbitTarget: t } = {}) {
  return Array.isArray(e) && e.length >= 3 && e.every((a) => Number.isFinite(a)) ? e.slice(0, 3).map(Number) : Array.isArray(t) && t.length >= 3 && t.every((a) => Number.isFinite(a)) ? [Number(t[0]), 0, Number(t[2])] : [0, 0, 0];
}
function tt(e, t) {
  const a = t || e.active_camera_id, o = (e.cameras || []).find((r) => r.id === a);
  if (!o) throw new D("UNKNOWN_CAMERA", `${a} does not exist`);
  return o;
}
function He(e, t) {
  const a = (e.objects || []).find((o) => o.id === t);
  if (!a) throw new D("UNKNOWN_OBJECT", `${t} does not exist`);
  return a;
}
function to(e, t) {
  const a = He(e, t);
  if (a.asset_kind !== "character")
    throw new D("NOT_A_CHARACTER", `${t} is not a character`);
  return a;
}
function Nr(e) {
  return (!e.camera || typeof e.camera != "object") && (e.camera = {}), e.camera;
}
function ao(e, t) {
  return (e.keyframes || []).find((a) => a.frame === t) || null;
}
const Wd = {
  [ee.ASSET_INSTANTIATE](e, t) {
    const a = new Set((e.objects || []).map((r) => r.id));
    let o;
    try {
      o = qd(t.asset, { point: t.point, idSeed: t.id, existingIds: a });
    } catch (r) {
      throw new D("BAD_ASSET", `asset.instantiate could not compile: ${r.message}`);
    }
    return (e.objects ||= []).push(o), {
      dirtyMask: z.viewport | z.previews | z.outliner | z.inspector,
      outcome: { objectId: o.id, assetId: o.asset_id || null }
    };
  },
  [ee.CAMERA_SET_ACTIVE](e, t) {
    return tt(e, t.cameraId), e.active_camera_id = t.cameraId, { dirtyMask: z.viewport | z.previews | z.inspector | z.outliner | z.timeline };
  },
  [ee.CAMERA_TRANSFORM](e, t) {
    const a = tt(e, t.cameraId), o = Nr(a);
    if (t.position && (o.position = [...t.position]), t.target && (o.target = [...t.target]), Number.isInteger(t.frame)) {
      const r = ao(a, t.frame);
      if (!r) throw new D("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
      r.camera = { ...r.camera }, t.position && (r.camera.position = [...t.position]), t.target && (r.camera.target = [...t.target]);
    }
    return { dirtyMask: z.viewport | z.previews | z.inspector | z.timeline };
  },
  [ee.CAMERA_LOOK_AT](e, t) {
    const a = tt(e, t.cameraId);
    if (t.objectId !== void 0 && (t.objectId === null || t.objectId === "" ? (a.target_object_id = null, a.id === e.active_camera_id && (e.target_object_id = null)) : (He(e, t.objectId), a.target_object_id = t.objectId, a.id === e.active_camera_id && (e.target_object_id = t.objectId))), t.point) {
      const o = Nr(a);
      o.target = [...t.point];
      for (const r of a.keyframes || [])
        r.camera = { ...r.camera, target: [...t.point] };
    }
    return { dirtyMask: z.viewport | z.previews | z.inspector | z.timeline };
  },
  [ee.OBJECT_TRANSFORM](e, t) {
    const a = He(e, t.objectId);
    return t.position && (a.position = [...t.position]), t.rotation && (a.rotation = [...t.rotation]), t.scale && (a.size = [...t.scale]), { dirtyMask: z.viewport | z.previews | z.inspector };
  },
  [ee.OBJECT_SET_ENABLED](e, t) {
    return He(e, t.objectId).enabled = t.value, { dirtyMask: z.viewport | z.previews | z.outliner | z.inspector };
  },
  [ee.OBJECT_SET_LOCKED](e, t) {
    return He(e, t.objectId).locked = t.value, { dirtyMask: z.outliner | z.inspector };
  },
  [ee.OBJECT_SET_TAGS](e, t) {
    const a = He(e, t.objectId), o = Ns(t.tags), r = o.length !== t.tags.length ? "some tags were dropped or normalised" : void 0;
    return o.length ? a.tags = o : delete a.tags, { dirtyMask: z.outliner | z.inspector | z.viewport, warning: r };
  },
  [ee.OBJECT_SET_ANNOTATION](e, t) {
    const a = He(e, t.objectId), o = t.annotation === null ? null : bn(t.annotation);
    if (t.annotation && !o)
      throw new D("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    return o ? a.annotation = o : delete a.annotation, { dirtyMask: z.viewport | z.outliner | z.inspector };
  },
  [ee.CHARACTER_SET_POSE](e, t) {
    const a = to(e, t.objectId);
    if (a.character?.motion)
      throw new D("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    return a.character = {
      ...a.character || {},
      pose: t.pose === null ? ho(null) : ho(t.pose)
    }, { dirtyMask: z.viewport | z.previews | z.inspector };
  },
  [ee.CHARACTER_SET_JOINT_ROTATION](e, t) {
    const a = to(e, t.objectId);
    if (a.character?.motion)
      throw new D("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    if (!Fs(t.rotation))
      throw new D("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    return a.character = {
      ...a.character || {},
      pose: Ls(a.character?.pose, t.joint, t.rotation)
    }, { dirtyMask: z.viewport | z.previews | z.inspector };
  },
  [ee.CHARACTER_SET_MOTION](e, t) {
    const a = to(e, t.objectId), o = Qo(t.motion);
    if (!o) throw new D("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    const r = a.character?.pose || {};
    return a.character = {
      ...a.character || {},
      pose: { preset_id: r.preset_id || "neutral", root_offset: r.root_offset || [0, 0, 0], joints: {} },
      motion: o
    }, { dirtyMask: z.viewport | z.previews | z.timeline | z.inspector };
  },
  [ee.CHARACTER_CLEAR_MOTION](e, t) {
    const a = to(e, t.objectId);
    return a.character ? (a.character = { ...a.character, motion: null }, { dirtyMask: z.viewport | z.previews | z.timeline | z.inspector }) : { dirtyMask: 0 };
  },
  [ee.KEYFRAME_UPSERT](e, t) {
    const a = tt(e, t.cameraId);
    if (t.frame >= (e.duration_frames || 0))
      throw new D("FRAME_OUT_OF_RANGE", `frame ${t.frame} is past the timeline`);
    a.keyframes ||= [];
    let o = ao(a, t.frame);
    if (!o) {
      const r = ao(a, 0)?.camera || a.camera || {};
      o = { frame: t.frame, camera: JSON.parse(JSON.stringify(r)), interpolation: "ease" }, a.keyframes.push(o), a.keyframes.sort((n, i) => n.frame - i.frame);
    }
    return t.camera && (o.camera = { ...o.camera, ...JSON.parse(JSON.stringify(t.camera)) }), t.interpolation && (o.interpolation = t.interpolation), { dirtyMask: z.viewport | z.previews | z.timeline | z.inspector };
  },
  [ee.KEYFRAME_REMOVE](e, t) {
    const a = tt(e, t.cameraId), o = (a.keyframes || []).length;
    if (a.keyframes = (a.keyframes || []).filter((n) => n.frame !== t.frame), a.keyframes.length === o)
      throw new D("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    const r = a.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: z.viewport | z.previews | z.timeline | z.inspector, warning: r };
  },
  [ee.KEYFRAME_SET_INTERPOLATION](e, t) {
    const a = tt(e, t.cameraId), o = ao(a, t.frame);
    if (!o) throw new D("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    if (!Ko.includes(t.interpolation))
      throw new D("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`);
    return o.interpolation = t.interpolation, { dirtyMask: z.timeline | z.viewport | z.previews };
  },
  [ee.TIMELINE_SET_RANGE](e, t) {
    const a = Math.max(0, (e.duration_frames || 1) - 1);
    if (t.start > a || t.end > a)
      throw new D("FRAME_OUT_OF_RANGE", `range must stay within 0..${a}`);
    return e.playback_range = [t.start, t.end], { dirtyMask: z.timeline | z.status };
  },
  [ee.TIMELINE_SET_DURATION](e, t) {
    if (e.duration_frames = t.frames, Array.isArray(e.playback_range)) {
      const a = t.frames - 1;
      e.playback_range = [
        Math.min(e.playback_range[0], a),
        Math.min(e.playback_range[1], a)
      ];
    }
    return { dirtyMask: z.timeline | z.viewport | z.previews | z.status };
  }
};
function Vd({ state: e, operation: t }) {
  const a = Wd[t.type];
  if (!a) throw new D("UNKNOWN_OPERATION", `Unknown operation type: ${t.type}`);
  return a(e, t) || { dirtyMask: 0 };
}
function Ud(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Kr(e, t) {
  return {
    ok: !1,
    version: Tt,
    id: e ?? null,
    applied: 0,
    error: {
      code: t.code || "INTERNAL",
      operationIndex: t.operationIndex ?? null,
      message: t.message
    }
  };
}
function Hd(e, t, a) {
  if (typeof e.requestUiUpdate == "function") {
    e.requestUiUpdate(t, a);
    return;
  }
  e.camera = e.sampleCamera?.(e.state, e.frame) ?? e.camera, e.refreshObjects?.(), e.refreshKeys?.(), e.refreshInspector?.(), e.render?.();
}
function Gd(e, t) {
  let a;
  try {
    a = zd(e, t);
  } catch (c) {
    if (c instanceof D) return Kr(t?.id, c);
    throw c;
  }
  const o = Ud(e.state);
  let r = 0;
  const n = [], i = [];
  for (let c = 0; c < a.operations.length; c += 1)
    try {
      const l = Vd({ ui: e, state: o, operation: a.operations[c] });
      r |= l?.dirtyMask || 0, l?.warning && n.push(l.warning), l?.outcome && i.push({ index: c, ...l.outcome });
    } catch (l) {
      if (l instanceof D)
        return (l.operationIndex === null || l.operationIndex === void 0) && (l.operationIndex = c), Kr(a.id, l);
      throw l;
    }
  return a.validateOnly ? {
    ok: !0,
    version: Tt,
    id: a.id,
    applied: a.operations.length,
    warnings: n,
    outcomes: i,
    dirtyMask: r,
    validateOnly: !0
  } : (e.checkpoint?.(a.description), e.state = er(o), (e._directorApiTxIds ||= /* @__PURE__ */ new Set()).add(a.id), e.serialize?.(), Hd(e, r, `director-api:${a.id}`), {
    ok: !0,
    version: Tt,
    id: a.id,
    applied: a.operations.length,
    warnings: n,
    outcomes: i,
    dirtyMask: r
  });
}
function Yd(e) {
  return {
    query: (t) => Pd(e, t),
    execute: (t) => Gd(e, t)
  };
}
function Xd(e) {
  return e.directorApi = Yd(e), e.directorApi;
}
const _e = "/majoor/omnicam/library";
function Zd(e, t) {
  const a = typeof window < "u" && (window.app?.api || window.__omnicamApi) || null;
  if (!a?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return a.fetchApi(e, t);
}
async function Jd(e) {
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
function Rr(e = {}) {
  const t = new URLSearchParams();
  for (const [o, r] of Object.entries(e))
    r == null || r === "" || t.set(o, String(r));
  const a = t.toString();
  return a ? `?${a}` : "";
}
function lr({ fetchApi: e = Zd } = {}) {
  const t = (a, o) => Promise.resolve(e(a, o)).then(Jd);
  return {
    list(a = {}) {
      const { kind: o, tag: r, search: n, offset: i, limit: c } = a, l = { tag: r, search: n, offset: i, limit: c };
      return o && o !== "all" && (l.kind = o), t(`${_e}${Rr(l)}`);
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
      const r = new FormData();
      return r.append("file", a, o.filename || a.name || "model.glb"), t(`${_e}/import${Rr(o)}`, { method: "POST", body: r });
    },
    importLocalCharacters({ folder: a, licenseNote: o = "", idPrefix: r = "", dryRun: n = !1 } = {}) {
      return t(`${_e}/import-local`, {
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
      return n.append("file", o, r), t(`${_e}/thumbnail/${encodeURIComponent(a)}`, {
        method: "POST",
        body: n
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
const Gn = Object.freeze(["all", "character", "prop", "environment", "vehicle"]);
function Dr(e = {}) {
  const t = String(e.kind || "all").toLowerCase();
  return {
    kind: Gn.includes(t) ? t : "all",
    tag: String(e.tag || "").trim().toLowerCase(),
    search: String(e.search || "").trim().toLowerCase()
  };
}
const Qd = 60;
function em(e) {
  const t = /* @__PURE__ */ new Set(), a = {
    items: [],
    byId: /* @__PURE__ */ new Map(),
    kinds: {},
    total: 0,
    offset: 0,
    limit: Qd,
    filter: Dr({}),
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
      return a.filter = Dr({ ...a.filter, ...i }), a.offset = 0, this.refresh();
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
function tm({ max: e = 96 } = {}) {
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
function am() {
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
const om = 256;
function qr(e = {}) {
  const { THREE: t, GLTFLoader: a, FBXLoader: o, size: r = om } = e;
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
    const h = d.getCenter(new t.Vector3()), u = d.getSize(new t.Vector3()), y = Math.max(u.length() / 2, 1e-3) / Math.sin(c.fov * Math.PI / 360);
    c.position.set(h.x + y * 0.7, h.y + y * 0.55, h.z + y), c.near = y / 100, c.far = y * 10, c.updateProjectionMatrix(), c.lookAt(h);
  }, m = (f, d) => new Promise((h, u) => {
    const b = d === "fbx" && o ? o : a;
    new b().load(
      f,
      (y) => h(y.scene || y),
      void 0,
      (y) => u(y)
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
async function rm() {
  const [e, t, a] = await Promise.all([
    import("./chunk-CcRb1b12.js").then((o) => o.T),
    import("./vendor-three-AeKB2-k3.js").then((o) => o.ak),
    import("./vendor-three-AeKB2-k3.js").then((o) => o.al)
  ]);
  return { THREE: e, GLTFLoader: t.GLTFLoader, FBXLoader: a.FBXLoader };
}
function nm(e) {
  const [t, a] = String(e).split(","), o = /:(.*?);/.exec(t)?.[1] || "image/webp", r = atob(a || ""), n = new Uint8Array(r.length);
  for (let i = 0; i < r.length; i += 1) n[i] = r.charCodeAt(i);
  return new Blob([n], { type: o });
}
const sm = Object.freeze({
  character: "pi-user",
  prop: "pi-box",
  environment: "pi-building",
  vehicle: "pi-car",
  helper: "pi-compass"
}), im = {
  all: "All",
  character: "Characters",
  prop: "Props",
  environment: "Env",
  vehicle: "Vehicles"
};
function st(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function cm(e, t = {}) {
  return Gn.map((a) => {
    const o = s(im[a] || a), r = a === "all" ? "" : ` <span class="oc-asset-kind-n">${Number(t[a] || 0)}</span>`;
    return `<button type="button" class="oc-asset-kind${a === (e || "all") ? " active" : ""}" data-asset-kind="${a}">${st(o)}${r}</button>`;
  }).join("");
}
function lm(e, { selected: t = !1, thumbUrl: a = "" } = {}) {
  const o = sm[e.kind] || "pi-box", r = e.kind === "character" && gn(e.rig) === "rigged" ? `<span class="oc-asset-badge">${s("RIGGED")}</span>` : "", n = a ? `<img class="oc-asset-thumb" src="${st(a)}" alt="" loading="lazy">` : `<span class="oc-asset-thumb oc-asset-thumb--glyph"><i class="pi ${o}"></i></span>`;
  return `<button type="button" class="oc-asset-card${t ? " selected" : ""}" data-asset-id="${st(e.id)}" title="${st(e.name)}">
    ${n}
    <span class="oc-asset-name">${st(e.name)}</span>
    <span class="oc-asset-kind-tag">${st((e.kind || "").toUpperCase())}</span>
    ${r}
  </button>`;
}
function dm(e, { selectedId: t = "", thumbUrls: a = {} } = {}) {
  return !e || !e.length ? `<p class="oc-asset-empty">${s("No assets match this filter.")}</p>` : e.map((o) => lm(o, {
    selected: o.id === t,
    thumbUrl: a[o.id] || ""
  })).join("");
}
function Br(e) {
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
function mm(e, t = {}) {
  const a = e.root, o = t.fetchApi || ((F, N) => (e.api || e.app?.api).fetchApi(F, N)), r = t.apiClient || lr({ fetchApi: o }), n = t.store || em(r), i = tm(), c = t.previewQueue || am(), l = e.api || e.app?.api || null;
  let p = t.thumbnailRenderer || null, m = null;
  const f = /* @__PURE__ */ new Set();
  function d() {
    return p ? Promise.resolve(p) : (m || (m = rm().then((F) => p = qr(F)).catch(() => p = qr({}))), m);
  }
  function h(F) {
    return kr(l, Hn(F));
  }
  function u(F) {
    return F.thumbnail ? kr(l, `omnicam/library/${F.thumbnail} [input]`) : "";
  }
  function b() {
    for (const F of n.state.items) {
      if (F.kind === "helper" || !F.file || i.get(F.id) || F.thumbnail || f.has(F.id)) continue;
      const N = h(F);
      N && c.enqueue(F.id, async () => {
        const ce = await (await d()).render(N, F.format || "glb");
        if (!ce) {
          f.add(F.id);
          return;
        }
        if (i.set(F.id, ce), H(), !(F.source && F.source !== "user"))
          try {
            const he = await r.uploadThumbnail(F.id, nm(ce));
            he?.asset && n.upsert(he.asset);
          } catch {
          }
      });
    }
  }
  const y = (F) => a.querySelector(`[data-role="${F}"]`), g = y("assets-panel"), v = y("asset-grid"), S = y("asset-kinds"), x = y("asset-search"), E = y("asset-status"), M = y("asset-import-file"), K = y("scene-tab"), P = y("assets-tab");
  let G = "", B = null, U = !0, re = 0;
  function j(F, { sticky: N = !1 } = {}) {
    E && (!N && re > Date.now() || (E.textContent = F || "", re = N ? Date.now() + 9e3 : 0));
  }
  function O(F) {
    if (G = F, !!v)
      for (const N of v.querySelectorAll(".oc-asset-card"))
        N.classList.toggle("selected", N.dataset.assetId === F);
  }
  let q = !1;
  function H() {
    if (S && (S.innerHTML = cm(n.state.filter.kind, n.state.kinds)), v) {
      const F = {};
      for (const N of n.state.items) {
        const se = i.get(N.id) || u(N);
        se && (F[N.id] = se);
      }
      v.innerHTML = dm(n.state.items, { selectedId: G, thumbUrls: F });
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
  function ae(F) {
    if (!F) return;
    const N = Bd({
      groundHit: e.webgl?.orbitGroundHit?.(),
      orbitTarget: e.webgl?.getOrbitTarget?.() || e.camera?.target
    }), se = e.directorApi?.execute({
      version: 1,
      id: `tx_instantiate_${Date.now().toString(36)}`,
      description: s("Add asset"),
      operations: [{ type: "asset.instantiate", asset: F, point: N }]
    });
    if (!se?.ok) {
      e.setStatus?.(se?.error?.message || s("Could not add the asset"));
      return;
    }
    const ce = se.outcomes?.[0]?.objectId;
    ce && (e.selectedEntity = "object", e.selectedObjectId = ce, e.selectedObjectIds = /* @__PURE__ */ new Set([ce]), e.selectedKeyFrame = null), e.restoreAssets?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.render?.(), e.setStatus?.(s("{name} added").replace("{name}", F.name));
  }
  async function $(F) {
    if (F) {
      j(s("Importing {name}...").replace("{name}", F.name));
      try {
        const N = await r.importModel(F, { kind: "prop", name: F.name.replace(/\.[^.]+$/, "") });
        N.asset && n.upsert(N.asset), j(s("Imported {name}").replace("{name}", N.asset?.name || F.name));
      } catch (N) {
        j(N.message || s("Import failed"));
      }
    }
  }
  const W = y("asset-local-form"), I = y("asset-local-folder"), V = y("asset-local-note");
  function X() {
    W && (W.hidden = !W.hidden, W.hidden || I?.focus());
  }
  async function le(F) {
    const N = (I?.value || "").trim();
    if (!N) {
      j(s("Point to the folder you extracted the pack into."), { sticky: !0 });
      return;
    }
    re = 0, j(F ? s("Scanning {folder}...").replace("{folder}", N) : s("Installing characters from {folder}...").replace("{folder}", N));
    try {
      const se = await r.importLocalCharacters({
        folder: N,
        licenseNote: (V?.value || "").trim(),
        dryRun: F
      }), ce = (se.skipped || []).length;
      if (F) {
        const oe = (se.candidates || []).map((Se) => Se.name).join(", ");
        j(
          (se.candidates || []).length ? s("{n} rig-complete character(s): {names}").replace("{n}", se.candidates.length).replace("{names}", oe) : s("No rig-complete .glb/.fbx character found ({n} skipped)").replace("{n}", ce),
          { sticky: !0 }
        );
        return;
      }
      const he = (se.installed || []).filter((oe) => oe.status !== "conflict").length, pe = (se.installed || []).filter((oe) => oe.status === "conflict").length;
      j(
        s("{n} character(s) installed{extra} — no restart needed").replace("{n}", he).replace("{extra}", ce || pe ? ` (${ce} ${s("skipped")}${pe ? `, ${pe} ${s("unchanged")}` : ""})` : ""),
        { sticky: !0 }
      ), he && (n.refresh(), W && (W.hidden = !0));
    } catch (se) {
      j(se.message || s("Import failed"), { sticky: !0 });
    }
  }
  function de(F) {
    const N = F === "assets";
    K && (K.hidden = N), P && (P.hidden = !N);
    for (const se of a.querySelectorAll("[data-asset-view]"))
      se.classList.toggle("active", se.dataset.assetView === F);
    N && U && (U = !1, n.refresh());
  }
  function Q(F) {
    const N = Br(F.target);
    if (N) {
      if (N.action === "switch-view") return de(N.view);
      if (N.action === "filter-kind") return void n.setFilter({ kind: N.kind });
      if (N.action === "asset-add")
        return ae(n.get(G));
      if (N.action === "asset-import")
        return M?.click();
      if (N.action === "local-toggle") return X();
      if (N.action === "local-scan") return void le(!0);
      if (N.action === "local-install") return void le(!1);
      N.action === "card" && O(N.assetId);
    }
  }
  function me(F) {
    const N = Br(F.target);
    N?.action === "card" && ae(n.get(N.assetId));
  }
  function be() {
    clearTimeout(B), B = setTimeout(() => n.setFilter({ search: x.value }), 200);
  }
  function fe(F) {
    const N = F.target.files?.[0];
    F.target.value = "", $(N);
  }
  const ve = n.subscribe(H);
  return g?.addEventListener("click", Q), g?.addEventListener("dblclick", me), a.querySelector('[data-role="left-tabs"]')?.addEventListener("click", Q), x?.addEventListener("input", be), M?.addEventListener("change", fe), H(), {
    store: n,
    switchView: de,
    refresh: () => n.refresh(),
    dispose() {
      ve(), clearTimeout(B), g?.removeEventListener("click", Q), g?.removeEventListener("dblclick", me), a.querySelector('[data-role="left-tabs"]')?.removeEventListener("click", Q), x?.removeEventListener("input", be), M?.removeEventListener("change", fe), c.clear(), p?.dispose?.(), i.clear();
    }
  };
}
function pm(e, t = {}) {
  const a = t.container || e.root?.querySelector(".viewport-wrap") || e.root, o = document.createElement("div");
  o.className = "oc-label-layer", o.setAttribute("aria-hidden", "true"), a?.appendChild(o);
  const r = [];
  let n = Ro(e.state?.metadata?.viewport_labels);
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
    for (const y of u) {
      if (!yn(y, { mode: n.mode, selectedIds: d })) continue;
      const g = vn(y, n.content);
      if (!g) continue;
      const v = xn(u, y, h) || {
        position: y.position,
        size: y.size
      }, S = e.webgl.projectWorldToScreen(wn(v, y.type));
      if (!S || S.behind) continue;
      const x = i(b);
      b += 1, x.hidden = !1, x.textContent = g, x.style.transform = `translate(-50%, -100%) translate(${Math.round(S.x)}px, ${Math.round(S.y)}px)`;
      const E = n.content === "annotation" ? y.annotation?.color : "";
      x.style.setProperty("--oc-label-accent", E || ""), x.classList.toggle("is-annotation", n.content === "annotation" && !!E);
    }
    for (let y = b; y < r.length; y += 1) r[y].hidden = !0;
  }
  function p(m) {
    n = Ro({ ...n, ...m }), e.state.metadata = { ...e.state.metadata || {}, viewport_labels: { ...n } }, e.serialize?.(), l();
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
function fm(e) {
  const t = (a) => e.webgl?.getModelBoneNames?.(a) || [];
  return {
    /** Bones + a best-effort auto-map + completeness for one object. */
    getRigInfo(a) {
      const o = e.state?.objects?.find((i) => i.id === a) || null, r = t(a), n = Do(r);
      return {
        objectId: a,
        assetId: o?.asset_id || null,
        isCharacter: o?.asset_kind === "character",
        rigProfile: o?.character?.rig_profile || null,
        boneNames: r,
        autoMap: n,
        autoMapStatus: gn({ bone_map: n })
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
      return Do(t(a));
    },
    /** Preview a motion clip on the loaded model (viewport only -- the durable
     * state write goes through the Semantic API). */
    setMotion(a, o) {
      const r = Qo(o);
      return r ? !!(e.webgl?.applyMotionClip?.(a, r) ?? !0) : !1;
    },
    /** Sample the live bone rotations at the current frame, mapped to canonical
     * joints -- the input to "Bake current frame to pose". */
    sampleCanonicalPose(a, o) {
      return e.webgl?.sampleCharacterBonePose?.(a, o) || {};
    }
  };
}
function Wr(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function hm(e, t) {
  const a = (o) => [`<option value="">${s("— unmapped —")}</option>`].concat(
    e.map(
      (r) => `<option value="${Wr(r)}"${r === o ? " selected" : ""}>${Wr(r)}</option>`
    )
  ).join("");
  return kn.map((o) => {
    const r = t[o] || "", n = r && e.includes(r);
    return `<label class="oc-rig-row${n ? " ok" : ""}" data-joint="${o}">
      <span class="oc-rig-joint">${o}</span>
      <select data-rig-joint="${o}">${a(r)}</select>
      <span class="oc-rig-tick">${n ? "✓" : ""}</span>
    </label>`;
  }).join("");
}
function um(e, t = {}) {
  const a = e.root, o = t.apiClient || lr({
    fetchApi: (g, v) => (e.api || e.app?.api).fetchApi(g, v)
  }), r = a.querySelector('[data-role="rig-mapper"]');
  if (!r) return { sync() {
  }, dispose() {
  } };
  const n = r.querySelector('[data-role="rig-mapper-grid"]'), i = r.querySelector('[data-role="rig-mapper-status"]');
  let c = null, l = {};
  const p = () => e.state?.objects?.find((g) => g.id === c) || null, m = () => e.webgl?.getModelBoneNames?.(c) || [];
  function f() {
    if (!i) return;
    const g = Sr(l);
    Ao(l) ? (i.textContent = s("Humanoid v1 ✓ — all 22 joints mapped"), i.dataset.state = "ok") : (i.textContent = s("Incomplete — {n} joint(s) unmapped").replace("{n}", g.length), i.dataset.state = "warn");
  }
  function d() {
    n && (n.innerHTML = hm(m(), l)), f();
  }
  function h() {
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
    v === "auto" ? (l = Do(m()), d()) : v === "validate" ? (d(), e.setStatus?.(Ao(l) ? s("Rig is complete") : s("Rig still missing: {list}").replace("{list}", Sr(l).join(", ")))) : v === "save" && y();
  }
  async function y() {
    const g = p();
    if (!g?.asset_id) {
      e.setStatus?.(s("Instantiate this asset from the Asset Browser before mapping its rig"));
      return;
    }
    try {
      const v = await o.patch(g.asset_id, {
        rig: { profile: jr, bone_map: l }
      });
      g.character = {
        ...g.character || {},
        rig_profile: Ao(l) ? jr : null
      }, e.assetBrowser?.store?.upsert?.(v.asset), e.checkpoint?.("Save rig mapping"), e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.setStatus?.(s("Rig mapping saved"));
    } catch (v) {
      e.setStatus?.(v.message || s("Could not save the rig mapping"));
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
function bm(e, t = {}) {
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
    for (const h of kn) {
      const u = p?.[h];
      if (!u) continue;
      const b = f?.getJointWorldTransform?.(l, h, p) || e.webgl.resolveModelBone?.(l, u);
      if (!b?.world) continue;
      const y = e.webgl.projectWorldToScreen(b.world);
      if (!y || y.behind) continue;
      const g = n(h);
      g.hidden = !1, g.classList.toggle("selected", h === m), g.style.transform = `translate(-50%, -50%) translate(${Math.round(y.x)}px, ${Math.round(y.y)}px)`, d.add(h);
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
const gm = /[^a-z0-9_-]+/g;
function ym(e, t = {}) {
  const a = e.root, o = t.apiClient || lr({
    fetchApi: (j, O) => (e.api || e.app?.api).fetchApi(j, O)
  }), r = a.querySelector('[data-role="pose-editor"]');
  if (!r) return { sync() {
  }, update() {
  }, dispose() {
  } };
  const n = r.querySelector('[data-role="pose-preset"]'), i = r.querySelector('[data-pose-act="edit"]'), c = r.querySelector('[data-role="pose-joint-row"]'), l = r.querySelector('[data-role="pose-joint-name"]'), p = ["x", "y", "z"].map((j) => r.querySelector(`[data-role="pose-rot-${j}"]`));
  let m = null, f = !1, d = /* @__PURE__ */ new Map();
  const h = () => e.state?.objects?.find((j) => j.id === m) || null, u = () => e.rigMapper?.boneMap && Object.keys(e.rigMapper.boneMap).length ? e.rigMapper.boneMap : null, b = () => e.subSelection?.type === "character_joint" && e.subSelection.objectId === m ? e.subSelection.jointId : null;
  function y(j) {
    const O = ho({ ...j, preset_id: j.id });
    return { id: j.id, name: j.name || j.id, root_offset: O.root_offset, joints: O.joints };
  }
  function g(j) {
    const O = d.get(j?.pose?.preset_id) || null;
    return Rs({ preset: O, overrides: j?.pose }).joints;
  }
  function v() {
    const j = h();
    !j?.character || !u() || e.webgl?.applyCharacterPose?.(m, u(), f || j.character.pose?.joints ? g(j.character) : {});
  }
  function S() {
    const j = b(), O = f && !!j;
    if (c && (c.hidden = !O), !O) return;
    l && (l.textContent = j);
    const q = h(), H = g(q?.character)[j] || [0, 0, 0, 1], ae = Ds(H);
    p.forEach(($, W) => {
      $ && document.activeElement !== $ && ($.value = String(Math.round(ae[W] * 100) / 100));
    });
  }
  function x() {
    const j = h(), O = !!j?.character?.motion;
    if (i && (i.classList.toggle("active", f), i.disabled = O, i.title = O ? s("Clear the motion clip to edit the pose") : s("Toggle FK pose editing")), n) {
      const q = [["neutral", s("Standing Neutral")]].concat([...d.values()].filter((ae) => ae.id !== "neutral").map((ae) => [ae.id, ae.name || ae.id])), H = q.map((ae) => ae.join(":")).join("|");
      n.dataset.sig !== H && (n.dataset.sig = H, n.replaceChildren(...q.map(([ae, $]) => {
        const W = document.createElement("option");
        return W.value = ae, W.textContent = $, W;
      }))), document.activeElement !== n && (n.value = j?.character?.pose?.preset_id || "neutral");
    }
    S(), v();
  }
  async function E() {
    try {
      const j = await o.listPoses();
      d = new Map((j.poses || []).filter((O) => O?.id).map((O) => [O.id, y(O)]));
    } catch {
      d = /* @__PURE__ */ new Map();
    }
    d.has("neutral") || d.set("neutral", y({ id: "neutral", name: "Standing Neutral" })), x();
  }
  function M() {
    const j = b();
    if (!j) return;
    const O = p.map((ae) => Number(ae?.value) || 0), q = Ks(O), H = e.directorApi?.execute({
      version: 1,
      id: `tx_pose_${Date.now().toString(36)}`,
      description: "Pose joint",
      operations: [{ type: "character.set_joint_rotation", objectId: m, joint: j, rotation: q }]
    });
    H && !H.ok && e.setStatus?.(H.error?.message || s("Could not set the joint")), x();
  }
  function K() {
    const j = n?.value || "neutral", O = d.get(j) || ho({ preset_id: j });
    e.directorApi?.execute({
      version: 1,
      id: `tx_preset_${Date.now().toString(36)}`,
      description: "Pose preset",
      operations: [{ type: "character.set_pose", objectId: m, pose: { preset_id: j, root_offset: O.root_offset, joints: {} } }]
    }), x();
  }
  async function P() {
    const j = h();
    if (!j?.character) return;
    const O = (await zt(e, s("Save Pose"), s("Pose name"), ""))?.trim();
    if (!O || e.disposed) return;
    const q = O.toLowerCase().replace(gm, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "pose";
    try {
      const H = await o.savePose({
        id: q,
        name: O,
        profile: "omnicam_humanoid_v1",
        root_offset: j.character.pose?.root_offset || [0, 0, 0],
        joints: g(j.character)
      });
      d.set(H.pose.id, y(H.pose)), e.setStatus?.(s("Pose saved: {name}").replace("{name}", O)), x();
    } catch (H) {
      e.setStatus?.(H.message || s("Could not save the pose"));
    }
  }
  function G() {
    const j = h();
    !j?.character || j.character.motion || (f = !f, !f && e.subSelection?.type === "character_joint" && (e.subSelection = null), x(), e.rigOverlay?.update?.());
  }
  function B(j) {
    f && (e.subSelection = { type: "character_joint", objectId: m, jointId: j }, x(), e.rigOverlay?.update?.());
  }
  const U = bm(e, {
    onPick: B,
    isActive: () => f && m && u() ? { objectId: m, boneMap: u(), selectedJoint: b() } : null
  });
  e.rigOverlay = U;
  function re() {
    const j = e.selectedObject?.(), O = j?.asset_kind === "character";
    if (r.hidden = !O, !O) {
      f && (f = !1), m = null, U.update();
      return;
    }
    j.id !== m && (m = j.id, f = !1, e.subSelection?.type === "character_joint" && (e.subSelection = null), d.size || E()), x(), U.update();
  }
  n?.addEventListener("change", K), i?.addEventListener("click", G), r.querySelector('[data-pose-act="save"]')?.addEventListener("click", P);
  for (const j of p)
    j?.addEventListener("change", M), j?.addEventListener("input", M);
  return E(), {
    sync: re,
    update() {
      U.update(), v();
    },
    get editing() {
      return f;
    },
    dispose() {
      U.dispose(), n?.removeEventListener("change", K), i?.removeEventListener("click", G);
      for (const j of p)
        j?.removeEventListener("change", M), j?.removeEventListener("input", M);
    }
  };
}
function Vr(e, t) {
  const a = document.createElement("option");
  return a.value = e, a.textContent = t, a;
}
function Po(e, t) {
  e && document.activeElement !== e && (e.value = String(t));
}
function vm(e) {
  const t = e.root?.querySelector('[data-role="motion-editor"]');
  if (!t) return { sync() {
  }, dispose() {
  } };
  const a = (g) => t.querySelector(`[data-role="${g}"]`), o = a("motion-clip"), r = a("motion-start"), n = a("motion-end"), i = a("motion-speed"), c = a("motion-loop"), l = t.querySelector('[data-motion-act="bake"]');
  let p = null;
  const m = () => e.state?.objects?.find((g) => g.id === p) || null, f = () => e.modelInfoById?.get(p)?.animationNames || [];
  function d() {
    const g = o?.value || "";
    return g ? Qo({
      clip_id: g,
      start_frame: Number(r?.value) || 0,
      end_frame: Number(n?.value) || 0,
      speed: Number(i?.value) || 1,
      loop: c?.checked !== !1,
      offset_seconds: 0
    }) : null;
  }
  function h() {
    const g = d(), v = g ? { type: "character.set_motion", objectId: p, motion: g } : { type: "character.clear_motion", objectId: p }, S = e.directorApi?.execute({
      version: 1,
      id: `tx_motion_${Date.now().toString(36)}`,
      description: "Character motion",
      operations: [v]
    });
    S && !S.ok && e.setStatus?.(S.error?.message || s("Could not set the motion")), e.poseEditor?.sync?.(), u();
  }
  function u() {
    const g = m(), v = f(), S = g?.character?.motion || null;
    if (o) {
      const E = v.join("|");
      o.dataset.sig !== E && (o.dataset.sig = E, o.replaceChildren(
        Vr("", v.length ? s("No motion (static)") : s("No clips in this model")),
        ...v.map((M) => Vr(M, M))
      )), document.activeElement !== o && (o.value = S?.clip_id || ""), o.disabled = !v.length;
    }
    Po(r, S?.start_frame ?? 0), Po(n, S?.end_frame ?? 0), Po(i, S?.speed ?? 1), c && document.activeElement !== c && (c.checked = S ? S.loop !== !1 : !0);
    const x = !!S;
    for (const E of [r, n, i, c]) E && (E.disabled = !x);
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
  o?.addEventListener("change", h);
  for (const g of [r, n, i, c]) g?.addEventListener("change", h);
  return l?.addEventListener("click", b), {
    sync: y,
    dispose() {
      o?.removeEventListener("change", h);
      for (const g of [r, n, i, c]) g?.removeEventListener("change", h);
      l?.removeEventListener("click", b);
    }
  };
}
function Ie(e, t) {
  return [...e.querySelectorAll(`[data-role="${t}"]`)];
}
function Yn(e) {
  return {
    status: e.querySelector('[data-role="status"]'),
    time: e.querySelector('[data-role="time"]'),
    frames: Ie(e, "frame"),
    scrubs: Ie(e, "scrub"),
    cameraFov: Ie(e, "camera-fov"),
    cameraRoll: Ie(e, "camera-roll"),
    cameraFocal: Ie(e, "camera-focal"),
    viewportZoom: Ie(e, "viewport-zoom"),
    cameraType: Ie(e, "camera-type"),
    cameraNear: Ie(e, "camera-near"),
    cameraFar: Ie(e, "camera-far")
  };
}
function xm(e, t) {
  e.checkpoint(`Apply preset: ${t}`);
  const a = e.activeCameraTrack(), o = rl(t, {
    duration_frames: e.state.duration_frames,
    target: e.camera.target || [0, 1.5, 0]
  });
  a.keyframes = o, a.id === e.state.active_camera_id && (e.state.keyframes = o), e.serialize(), e.refreshKeys(), e.setFrame(0, !0), e.render(), e.setStatus(`Preset applied: ${t}`);
}
function wm(e, t) {
  e.checkpoint(`Apply camera shake: ${t}`);
  const a = e.activeCameraTrack();
  (!a.keyframes || a.keyframes.length === 0) && (a.keyframes = [
    { frame: 0, camera: ye(e.camera), interpolation: "smooth" },
    { frame: e.state.duration_frames - 1, camera: ye(e.camera), interpolation: "smooth" }
  ]);
  const o = ol(a, { type: t, intensity: 1, duration_frames: e.state.duration_frames });
  a.keyframes = o, a.id === e.state.active_camera_id && (e.state.keyframes = o), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(`Camera shake applied: ${t}`);
}
function km(e, t) {
  const o = {
    clean_proxy: { render_mode: "omni_ref", playblast_grid: !0, burn_in: !1, speed_heatmap: !1, guides: !1, safe_areas: !1 },
    debug_motion: { render_mode: "wireframe", playblast_grid: !0, burn_in: !0, speed_heatmap: !0, guides: !0, safe_areas: !1 },
    cinematic_view: { render_mode: "graybox", playblast_grid: !1, burn_in: !1, speed_heatmap: !1, guides: !0, safe_areas: !0 }
  }[t];
  o && (e.checkpoint(`Apply proxy preset: ${t}`), Object.assign(e.state, o), e.serialize(), e.render(), e.setStatus(`Proxy preset applied: ${t}`));
}
function Sm(e, t) {
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
const Ur = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"], Re = [4, 8, 12, 20, 35, 60, 100];
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
function jm(e) {
  return e <= -1 ? "#38bdf8" : e <= 0.2 ? "#2dd4bf" : e <= 2.2 ? "#4ade80" : e <= 5 ? "#facc15" : e <= 10 ? "#fb923c" : "#f43f5e";
}
function Cm(e) {
  return `${e > 0 ? "+" : ""}${e.toFixed(1)}m`;
}
function jo(e, t, a) {
  if (!t || !a || t < 80 || a < 80) return null;
  const o = dt(e), r = o.expanded ? 220 : 138, n = Math.min(r, Math.max(80, Math.min(t, a) - 20)), i = 10, c = Math.max(0, t - n - i), l = Math.max(0, a - n - i), p = e.viewportCamera(), m = p?.position || [0, 1.5, 5], f = p?.target || [0, 0, 0], d = e.activeCameraTrack?.(), h = e.state.cameras?.length ? e.state.cameras : d ? [d] : [], u = h.flatMap(
    (E) => (E.keyframes || []).map((M) => M.camera?.position).filter(Boolean)
  );
  let b = 12;
  if (o.rangeIndex >= 0 && o.rangeIndex < Re.length)
    b = Re[o.rangeIndex];
  else {
    const E = Math.max(
      Math.abs(m[0] || 0),
      Math.abs(m[2] || 0),
      Math.abs(f[0] || 0),
      Math.abs(f[2] || 0),
      ...u.flatMap((M) => [Math.abs(M[0] || 0), Math.abs(M[2] || 0)]),
      4
    );
    b = Math.max(6, Math.ceil((E + 1.5) / 4) * 4);
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
    camTgt: f,
    cameras: h,
    activeTrack: d
  };
}
function Xn(e, t, a) {
  const o = t - e.worldCenterX, r = a - e.worldCenterZ;
  return [e.cx + o * e.scale, e.cy + r * e.scale];
}
function Wo(e, t, a) {
  const o = (t - e.cx) / e.scale, r = (a - e.cy) / e.scale;
  return [e.worldCenterX + o, e.worldCenterZ + r];
}
function _m(e, t, a, o) {
  const r = jo(e, a, o);
  if (!r) return;
  const { rx: n, ry: i, radarSize: c, cx: l, cy: p, innerRadius: m, range: f, scale: d, camPos: h, camTgt: u, cameras: b, activeTrack: y } = r, g = dt(e), v = e.state.active_camera_id || y?.id, S = (Q, me) => Xn(r, Q, me);
  t.save(), t.beginPath(), typeof t.roundRect == "function" ? t.roundRect(n, i, c, c, 10) : t.rect(n, i, c, c), t.clip(), t.fillStyle = "rgba(11, 15, 25, 0.90)", t.fillRect(n, i, c, c);
  const x = t.createRadialGradient(l, p, 2, l, p, m);
  x.addColorStop(0, "rgba(0, 210, 211, 0.06)"), x.addColorStop(1, "rgba(0, 0, 0, 0)"), t.fillStyle = x, t.fillRect(n, i, c, c), t.strokeStyle = "rgba(0, 210, 211, 0.38)", t.lineWidth = 1.2, t.strokeRect(n, i, c, c);
  const E = [0.33, 0.66, 1];
  t.strokeStyle = "rgba(0, 210, 211, 0.12)", t.lineWidth = 1;
  for (const Q of E) {
    const me = m * Q;
    t.beginPath(), t.arc(l, p, me, 0, Math.PI * 2), t.stroke(), c >= 120 && (t.font = "8px monospace", t.fillStyle = "rgba(0, 210, 211, 0.35)", t.textAlign = "left", t.fillText(`${Math.round(f * Q)}m`, l + me + 2, p - 2));
  }
  t.strokeStyle = "rgba(255, 255, 255, 0.10)", t.beginPath(), t.moveTo(n + 6, p), t.lineTo(n + c - 6, p), t.moveTo(l, i + 6), t.lineTo(l, i + c - 6), t.stroke(), t.font = "bold 9px sans-serif", t.textAlign = "center", t.textBaseline = "middle", t.fillStyle = "#f43f5e", t.fillText("N", l, i + 9), t.fillStyle = "rgba(255, 255, 255, 0.4)", t.fillText("S", l, i + c - 9), t.fillText("W", n + 9, p), t.fillText("E", n + c - 9, p);
  for (const Q of e.state.objects || []) {
    if (Q.enabled === !1) continue;
    const me = tr(e.state.objects, Q).position || [0, 0, 0], [be, fe] = S(me[0], me[2]);
    if (be < n + 3 || be > n + c - 3 || fe < i + 3 || fe > i + c - 3) continue;
    const ve = e.selectedObjectId === Q.id || e.selectedObjectIds?.has?.(Q.id);
    if (t.save(), t.translate(be, fe), Q.type === "card") {
      const F = (Q.rotation?.[1] || 0) * Math.PI / 180;
      t.rotate(-F), t.fillStyle = ve ? "#a855f7" : "#38bdf8", t.fillRect(-4, -1.2, 8, 2.4), t.strokeStyle = ve ? "#ffffff" : "rgba(255,255,255,0.6)", t.lineWidth = 1, t.strokeRect(-4, -1.2, 8, 2.4);
    } else if (Q.type === "light") {
      t.fillStyle = ve ? "#a855f7" : "#fbbf24", t.beginPath(), t.arc(0, 0, 3, 0, Math.PI * 2), t.fill(), t.strokeStyle = "#fbbf24", t.lineWidth = 1;
      for (let F = 0; F < 4; F++) {
        const N = F * Math.PI / 2;
        t.beginPath(), t.moveTo(Math.cos(N) * 4, Math.sin(N) * 4), t.lineTo(Math.cos(N) * 6, Math.sin(N) * 6), t.stroke();
      }
    } else
      t.fillStyle = ve ? "#a855f7" : Q.type === "human" ? "#ec4899" : "#f59e0b", t.beginPath(), t.arc(0, 0, 2.8, 0, Math.PI * 2), t.fill();
    ve && (t.strokeStyle = "#a855f7", t.lineWidth = 1.2, t.beginPath(), t.arc(0, 0, 6, 0, Math.PI * 2), t.stroke()), t.restore();
  }
  for (let Q = 0; Q < b.length; Q++) {
    const me = b[Q], be = me.keyframes || [], fe = me.id === v, ve = me.color || Ur[Q % Ur.length];
    t.save(), t.strokeStyle = ve, t.globalAlpha = fe ? 0.95 : 0.4, t.lineWidth = fe ? 2 : 1, t.setLineDash(fe ? [] : [2, 2]), t.beginPath();
    let F = !1;
    const N = be[0]?.frame, se = be[be.length - 1]?.frame;
    for (let ce = N; Number.isFinite(ce) && ce <= se; ce++) {
      const he = Ce(me, ce, e.state.objects)?.position;
      if (!Array.isArray(he)) continue;
      const [pe, oe] = S(he[0], he[2]);
      F ? t.lineTo(pe, oe) : (t.moveTo(pe, oe), F = !0);
    }
    F && t.stroke(), t.restore(), t.save();
    for (const ce of be) {
      const he = ce.camera?.position;
      if (!he) continue;
      const [pe, oe] = S(he[0], he[2]);
      if (pe < n + 4 || pe > n + c - 4 || oe < i + 4 || oe > i + c - 4) continue;
      const Se = ce.frame === e.frame && fe;
      t.fillStyle = Se ? "#ffffff" : ve, t.globalAlpha = fe ? 0.95 : 0.6, t.beginPath(), t.moveTo(pe, oe - 3), t.lineTo(pe + 3, oe), t.lineTo(pe, oe + 3), t.lineTo(pe - 3, oe), t.closePath(), t.fill(), Se && (t.strokeStyle = "#00d2d3", t.lineWidth = 1.2, t.stroke());
    }
    t.restore();
  }
  const [M, K] = S(h[0] || 0, h[2] || 0), [P, G] = S(u[0] || 0, u[2] || 0), B = 8, U = Y(M, n + B, n + c - B), re = Y(K, i + B, i + c - B), j = Y(P, n + B, n + c - B), O = Y(G, i + B, i + c - B), q = h[1] || 0, H = jm(q), ae = Cm(q);
  t.strokeStyle = "rgba(255, 255, 255, 0.40)", t.lineWidth = 1, t.setLineDash([3, 3]), t.beginPath(), t.moveTo(U, re), t.lineTo(j, O), t.stroke(), t.setLineDash([]), t.fillStyle = "#ffffff", t.beginPath(), t.arc(j, O, 2.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "rgba(255, 255, 255, 0.7)", t.lineWidth = 1, t.beginPath(), t.arc(j, O, 4.5, 0, Math.PI * 2), t.stroke();
  const $ = u[0] - h[0], W = u[2] - h[2], I = Math.atan2(W, $), X = (e.viewportCamera().fov || 35) * Math.PI / 360, le = Y(24 * (d / (m / 8)), 16, 38), de = t.createRadialGradient(U, re, 2, U, re, le);
  de.addColorStop(0, H + "55"), de.addColorStop(1, H + "08"), t.fillStyle = de, t.strokeStyle = H, t.lineWidth = 1.2, t.beginPath(), t.moveTo(U, re), t.lineTo(U + Math.cos(I - X) * le, re + Math.sin(I - X) * le), t.arc(U, re, le, I - X, I + X), t.closePath(), t.fill(), t.stroke(), t.fillStyle = H + "44", t.beginPath(), t.arc(U, re, 6.5, 0, Math.PI * 2), t.fill(), t.fillStyle = H, t.beginPath(), t.arc(U, re, 3.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "#ffffff", t.lineWidth = 1.5, t.beginPath(), t.moveTo(U, re), t.lineTo(U + Math.cos(I) * 7, re + Math.sin(I) * 7), t.stroke(), Em(e, t, r, H, ae, I, Math.hypot($, W)), g.hover && $m(t, r, g.hover), t.restore();
}
function Em(e, t, a, o, r, n, i) {
  const { rx: c, ry: l, radarSize: p } = a, m = dt(e);
  t.fillStyle = "rgba(15, 23, 42, 0.75)", t.fillRect(c, l, p, 18), t.strokeStyle = "rgba(0, 210, 211, 0.2)", t.lineWidth = 1, t.beginPath(), t.moveTo(c, l + 18), t.lineTo(c + p, l + 18), t.stroke(), t.font = "bold 9px sans-serif", t.fillStyle = "#00d2d3", t.textAlign = "left", t.textBaseline = "middle", t.fillText("RADAR", c + 6, l + 9);
  const f = l + 3, d = 12;
  oo(t, c + 44, f, 12, d, "−", m.hover?.button === "zoom_out"), oo(t, c + 58, f, 12, d, "+", m.hover?.button === "zoom_in");
  const h = m.centerMode === "camera" ? "CAM" : "CTR";
  oo(t, c + 72, f, 22, d, h, m.hover?.button === "center");
  const u = m.expanded ? "⤡" : "⤢";
  oo(t, c + 96, f, 14, d, u, m.hover?.button === "size"), t.font = "bold 8.5px monospace", t.fillStyle = o, t.textAlign = "right", t.fillText(`Y:${r}`, c + p - 5, l + 9), t.fillStyle = "rgba(15, 23, 42, 0.70)", t.fillRect(c, l + p - 15, p, 15), t.strokeStyle = "rgba(0, 210, 211, 0.15)", t.beginPath(), t.moveTo(c, l + p - 15), t.lineTo(c + p, l + p - 15), t.stroke();
  const b = Math.round((n * 180 / Math.PI + 360) % 360);
  t.font = "8px monospace", t.fillStyle = "rgba(255, 255, 255, 0.55)", t.textAlign = "left", t.fillText(`HDG:${b}°`, c + 5, l + p - 7), t.textAlign = "right", t.fillText(`DIST:${i.toFixed(1)}m`, c + p - 5, l + p - 7);
}
function oo(e, t, a, o, r, n, i) {
  e.fillStyle = i ? "rgba(0, 210, 211, 0.35)" : "rgba(255, 255, 255, 0.10)", e.fillRect(t, a, o, r), e.strokeStyle = i ? "#00d2d3" : "rgba(255, 255, 255, 0.20)", e.lineWidth = 1, e.strokeRect(t, a, o, r), e.font = "bold 8px sans-serif", e.fillStyle = i ? "#ffffff" : "rgba(255, 255, 255, 0.75)", e.textAlign = "center", e.textBaseline = "middle", e.fillText(n, t + o / 2, a + r / 2);
}
function $m(e, t, a) {
  if (!a || !a.text) return;
  const { rx: o, ry: r, radarSize: n } = t;
  e.font = "9px sans-serif";
  const i = e.measureText(a.text).width + 12, c = 16, l = Y(a.px - i / 2, o + 4, o + n - i - 4), p = a.pz > t.cy ? a.pz - 22 : a.pz + 8;
  e.fillStyle = "rgba(15, 23, 42, 0.94)", e.fillRect(l, p, i, c), e.strokeStyle = "#00d2d3", e.lineWidth = 1, e.strokeRect(l, p, i, c), e.fillStyle = "#ffffff", e.textAlign = "center", e.textBaseline = "middle", e.fillText(a.text, l + i / 2, p + c / 2);
}
function Zn(e, t, a) {
  const { rx: o, ry: r } = e, n = r + 3;
  return a < n || a > n + 12 ? null : t >= o + 44 && t <= o + 56 ? "zoom_out" : t >= o + 58 && t <= o + 70 ? "zoom_in" : t >= o + 72 && t <= o + 94 ? "center" : t >= o + 96 && t <= o + 110 ? "size" : null;
}
function Jn(e, t, a, o) {
  const { camPos: r, camTgt: n, cameras: i, rx: c, ry: l, radarSize: p } = t, m = (y, g) => Xn(t, y, g), [f, d] = m(r[0] || 0, r[2] || 0);
  if (Math.hypot(a - f, o - d) <= 8)
    return { type: "camera", pos: r };
  const [h, u] = m(n[0] || 0, n[2] || 0);
  if (Math.hypot(a - h, o - u) <= 8)
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
    const g = tr(e.state.objects, y).position || [0, 0, 0], [v, S] = m(g[0], g[2]);
    if (Math.hypot(a - v, o - S) <= 7)
      return { type: "object", object: y, id: y.id };
  }
  return null;
}
function Mm(e, t, a, o) {
  if (!e.state.show_radar || t.button != null && t.button !== 0 || t.altKey || t.ctrlKey || t.metaKey || e.isNavigatingFly || e.cameraPathDraw) return !1;
  const r = jo(e, e.canvas.width, e.canvas.height);
  if (!r) return !1;
  const { rx: n, ry: i, radarSize: c } = r;
  if (a < n || a > n + c || o < i || o > i + c)
    return !1;
  t.preventDefault?.(), t.stopPropagation?.();
  const l = dt(e), p = Zn(r, a, o);
  if (p)
    return p === "zoom_in" ? (l.rangeIndex === -1 && (l.rangeIndex = Re.findIndex((h) => h >= r.range), l.rangeIndex < 0 && (l.rangeIndex = Re.length - 1)), l.rangeIndex = Math.max(0, (l.rangeIndex === -1 ? 2 : l.rangeIndex) - 1)) : p === "zoom_out" ? (l.rangeIndex === -1 && (l.rangeIndex = Re.findIndex((h) => h >= r.range), l.rangeIndex < 0 && (l.rangeIndex = 0)), l.rangeIndex = Math.min(Re.length - 1, l.rangeIndex + 1)) : p === "center" ? l.centerMode = l.centerMode === "camera" ? "origin" : "camera" : p === "size" && (l.expanded = !l.expanded), e.render?.(), !0;
  const m = Jn(e, r, a, o);
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
  const [f, d] = Wo(r, a, o);
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
function Am(e, t, a, o) {
  if (!e.state.show_radar || e.drag || e.boxSelection || e.gizmoDrag || e.keyDrag || e.cameraPathDraw || e.pathDrag || e.timelineDrag || e.curveDrag)
    return !1;
  const r = jo(e, e.canvas.width, e.canvas.height);
  if (!r) return !1;
  const n = dt(e), { rx: i, ry: c, radarSize: l } = r, p = a >= i && a <= i + l && o >= c && o <= c + l;
  if (n.drag) {
    const [b, y] = Wo(r, a, o), g = e.viewportCamera();
    return n.drag.type === "camera" ? g.position = [b, g.position?.[1] || 1.5, y] : n.drag.type === "target" && (g.target = [b, g.target?.[1] || 0, y]), e.setFrame?.(e.frame, !1, !1), e.render?.(), !0;
  }
  if (!p)
    return n.hover && (n.hover = null, e.render?.()), !1;
  const m = Zn(r, a, o), f = Jn(e, r, a, o), [d, h] = Wo(r, a, o);
  let u = `[${d.toFixed(1)}m, ${h.toFixed(1)}m]`;
  return m === "zoom_in" ? u = s("Zoom in (+)") : m === "zoom_out" ? u = s("Zoom out (−)") : m === "center" ? u = n.centerMode === "camera" ? s("Center: Cam") : s("Center: World") : m === "size" ? u = n.expanded ? s("Compact mode") : s("Expand radar") : f?.type === "camera" ? u = s("Camera (drag to move)") : f?.type === "target" ? u = s("Look-At Target (drag to move)") : f?.type === "keyframe" ? u = `${s("Keyframe")} F${f.frame}` : f?.type === "object" && (u = f.object.name || f.object.type || s("Object")), n.hover = {
    button: m,
    hit: f,
    px: a,
    pz: o,
    text: u
  }, e.interactionElement?.style && (e.interactionElement.style.cursor = m || f ? "pointer" : "crosshair"), e.render?.(), !0;
}
function Oo(e, t) {
  const a = e._minimapState;
  return !a || !a.drag ? !1 : (e.commitCameraEdit?.(), a.drag = null, e.interactionElement?.style && (e.interactionElement.style.cursor = "default"), e.render?.(), !0);
}
function Tm(e, t, a, o) {
  if (!e.state.show_radar) return !1;
  const r = jo(e, e.canvas.width, e.canvas.height);
  if (!r) return !1;
  const { rx: n, ry: i, radarSize: c } = r;
  if (a < n || a > n + c || o < i || o > i + c)
    return !1;
  t.preventDefault?.(), t.stopPropagation?.();
  const l = dt(e), p = Math.sign(t.deltaY || 0);
  return l.rangeIndex === -1 && (l.rangeIndex = Re.findIndex((m) => m >= r.range), l.rangeIndex < 0 && (l.rangeIndex = 2)), p > 0 ? l.rangeIndex = Math.min(Re.length - 1, l.rangeIndex + 1) : p < 0 && (l.rangeIndex = Math.max(0, l.rangeIndex - 1)), e.render?.(), !0;
}
function Im(e, t, a) {
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
    const h = Bs(t('[data-role="object-tags"]')?.value || "");
    h.length ? d.tags = h : delete d.tags;
    const u = String(t('[data-role="object-annotation"]')?.value || "").trim(), b = u ? bn({
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
  }, { signal: a }), hl(e, a), ql(e, a), t('[data-role="curve-group"]')?.addEventListener("change", () => {
    e.setChannelFilter("all"), Kn(e), e.drawCurveEditor(), ir(e);
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
  }, { signal: a }), r.addEventListener("dblclick", (d) => e.onCurveDoubleClick?.(d), { signal: a }), r.addEventListener("wheel", (d) => El(e, d), { passive: !1, signal: a })), t('[data-act="curve-zoom-in"]')?.addEventListener("click", () => e.zoomCurve(1.25), { signal: a }), t('[data-act="curve-zoom-out"]')?.addEventListener("click", () => e.zoomCurve(0.8), { signal: a }), t('[data-act="curve-fit"]')?.addEventListener("click", () => e.resetCurveZoom(), { signal: a }), t('[data-role="key-frame"]')?.addEventListener("change", (d) => e.retimeSelectedKey(Number(d.target.value)), { signal: a });
  for (const d of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"])
    t(`[data-role="${d}"]`)?.addEventListener("change", () => e.updateSelectedKey(), { signal: a });
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
        const b = e.state.objects.find((g) => g.id === u.dataset.objectId);
        if (!b) return;
        if (e.finishCameraEdit(), e.selectedObjectIds ||= /* @__PURE__ */ new Set(), h.ctrlKey || h.metaKey)
          e.selectedObjectIds.has(b.id) ? e.selectedObjectIds.delete(b.id) : e.selectedObjectIds.add(b.id), e.outlinerAnchorId = b.id;
        else if (h.shiftKey && e.outlinerAnchorId && e.state.objects.some((g) => g.id === e.outlinerAnchorId)) {
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
    const h = d.composedPath?.()[0] || d.target;
    h instanceof HTMLElement && h.closest(".context-menu, [data-role='context-menu']") || (d.stopPropagation(), h instanceof HTMLElement && !h.closest(".toolbar-menu") && e.closeMenus(), h instanceof HTMLElement && !h.closest(".key,.key-editor,canvas") && e.exitKeyEdit(!0), (!(h instanceof HTMLElement) || !h.closest("input,select,textarea,button,[contenteditable=true]")) && e.root.focus({ preventScroll: !0 }));
  }, { signal: a }), document.addEventListener("pointerdown", (d) => {
    const h = d.composedPath?.()[0] || d.target;
    h instanceof HTMLElement && h.closest(".context-menu, [data-role='context-menu']") || (!(h instanceof Node) || !e.root.contains(h)) && (e.closeMenus(), e.exitKeyEdit(!0));
  }, { capture: !0, signal: a }), e.root.addEventListener("mousedown", (d) => d.stopPropagation(), { signal: a }), e.root.addEventListener("contextmenu", (d) => e.onContextMenu(d), { signal: a }), e.interactionElement?.addEventListener("pointerdown", (d) => {
    const h = e.interactionElement.getBoundingClientRect(), u = (d.clientX - h.left) * e.canvas.width / Math.max(1, h.width), b = (d.clientY - h.top) * e.canvas.height / Math.max(1, h.height);
    Mm(e, d, u, b) || e.onPointerDown(d);
  }, { signal: a }), e.interactionElement?.addEventListener("pointermove", (d) => {
    const h = e.interactionElement.getBoundingClientRect(), u = (d.clientX - h.left) * e.canvas.width / Math.max(1, h.width), b = (d.clientY - h.top) * e.canvas.height / Math.max(1, h.height);
    Am(e, d, u, b) || e.onPointerMove(d);
  }, { signal: a }), e.interactionElement?.addEventListener("pointerup", (d) => {
    Oo(e) || e.onPointerUp(d);
  }, { signal: a }), e.interactionElement?.addEventListener("pointercancel", (d) => {
    Oo(e), e.onPointerUp(d);
  }, { signal: a }), e.interactionElement?.addEventListener("lostpointercapture", (d) => {
    Oo(e), e.onPointerUp(d);
  }, { signal: a }), e.interactionElement?.addEventListener("dblclick", (d) => e.setTargetAtCursor(d), { signal: a }), e.interactionElement?.addEventListener("wheel", (d) => {
    const h = e.interactionElement.getBoundingClientRect(), u = (d.clientX - h.left) * e.canvas.width / Math.max(1, h.width), b = (d.clientY - h.top) * e.canvas.height / Math.max(1, h.height);
    Tm(e, d, u, b) || e.onWheel(d);
  }, { passive: !1, signal: a }), e.root.addEventListener("wheel", Jc(e.root), { signal: a }), window.addEventListener("pointermove", (d) => {
    e.keyDrag && e.onPointerMove(d);
  }, { capture: !0, signal: a }), window.addEventListener("pointerup", (d) => {
    e.keyDrag && e.onPointerUp(d);
  }, { capture: !0, signal: a }), window.addEventListener("pointercancel", (d) => {
    e.keyDrag && e.onPointerUp(d);
  }, { capture: !0, signal: a });
  const l = t('[data-role="dope-tracks"]');
  l && (l.addEventListener("pointerdown", (d) => e.onTimelinePointerDown(d), { signal: a }), l.addEventListener("pointermove", (d) => e.onTimelinePointerMove(d), { signal: a }), l.addEventListener("pointerup", (d) => e.onTimelinePointerUp(d), { signal: a }), l.addEventListener("pointercancel", (d) => e.onTimelinePointerUp(d), { signal: a }), l.addEventListener("wheel", (d) => hn(e, d), { passive: !1, signal: a }));
  const p = (d) => {
    const h = Ws(d.composedPath?.()[0] || d.target);
    h && (e.lastKeyZone = h);
  };
  e.root.addEventListener("focusin", p, { signal: a }), e.root.addEventListener("pointerdown", p, { capture: !0, signal: a }), e.root.addEventListener("focusout", (d) => {
    e.modalTransform && !e.root.contains(d.relatedTarget) && (qs(e), e.render());
  }, { signal: a });
  const m = new ResizeObserver(() => {
    e.scheduleResizeAndRender();
  }), f = e.root.querySelector(".viewport-wrap");
  f && m.observe(f), e.resizeObserver = m, e.updateEditState();
}
const Pm = "🔘", Hr = [
  { id: "nav", label: () => s("Navigation & Controls"), icon: "pi-compass" },
  { id: "view", label: () => s("Display & Viewport"), icon: "pi-eye" },
  { id: "time", label: () => s("Timeline & Keys"), icon: "pi-clock" },
  { id: "defaults", label: () => s("Defaults & Pipeline"), icon: "pi-sliders-h" }
];
function Om(e, t) {
  ar.find((o) => o.id === e)?.onChange?.(t);
}
function zm(e) {
  const t = zi(e.id, e.defaultValue), a = `pref_${e.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
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
function Fm(e) {
  const t = new Map(ar.map((o) => [o.id, o]));
  return ({
    nav: [
      _i,
      Ei,
      $i,
      Mi,
      Ai,
      Ti,
      Ii,
      Pi,
      Oi
    ],
    view: [
      di,
      mi,
      pi,
      fi,
      hi,
      ui,
      bi,
      gi,
      yi,
      vi,
      xi,
      wi,
      ki,
      Si,
      ji,
      Ci
    ],
    time: [
      oi,
      ri,
      ni,
      si,
      ii,
      ci,
      li
    ],
    defaults: [
      Hs,
      Gs,
      Ys,
      Xs,
      Zs,
      Js,
      Qs,
      ei,
      ti,
      ai
    ]
  }[e] || []).map((o) => t.get(o)).filter(Boolean);
}
function Lm() {
  return `<span class="oc-pref-emoji" aria-hidden="true">${Pm}</span> ${s("OmniCam Preferences")}`;
}
function Nm(e) {
  const t = e.root.querySelector(".oc-modal-backdrop");
  if (t) {
    t.querySelector(".oc-pref-dialog")?.focus();
    return;
  }
  const a = document.createElement("div");
  a.className = "oc-modal-backdrop", a.setAttribute("role", "dialog"), a.setAttribute("aria-modal", "true"), a.setAttribute("aria-label", s("OmniCam Preferences")), a.innerHTML = `
    <div class="oc-modal-dialog oc-pref-dialog" tabindex="-1">
      <div class="oc-pref-header">
        <div class="oc-pref-title">${Lm()}</div>
        <button type="button" class="icon-button oc-pref-close" title="${s("Close")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="oc-pref-tabs">
        ${Hr.map((r, n) => `
          <button type="button" class="oc-pref-tab ${n === 0 ? "active" : ""}" data-tab="${r.id}">
            <i class="pi ${r.icon}"></i> <span>${r.label()}</span>
          </button>
        `).join("")}
      </div>
      <div class="oc-pref-content">
        ${Hr.map((r, n) => `
          <div class="oc-pref-pane ${n === 0 ? "active" : ""}" data-pane="${r.id}">
            ${Fm(r.id).map(zm).join("")}
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
    Vs(i, c), Om(i, c);
  }), a.querySelector('[data-pref-act="reset-defaults"]')?.addEventListener("click", () => {
    Us();
    for (const r of ar) {
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
function Km(e, t, a) {
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
      e.closeMenus(), Nm(e);
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
const Rm = ["position", "target"], Dm = ["fov", "zoom"], qm = ["roll"], Bm = ["position", "size"], Wm = ["rotation"];
function Vo(e) {
  return ((e + 540) % 360 + 360) % 360 - 180;
}
function Gr(e, t, a, o) {
  const r = [0, 1, 2].map((n) => Number(e[n] || 0) + (Number(a[n] || 0) - Number(e[n] || 0)) * o);
  return Array.isArray(t) ? [0, 1, 2].map((n) => (2 * r[n] + Number(t[n] || 0)) / 3) : r;
}
function Vm(e, t, a, o) {
  const r = Number(e || 0) + (Number(a || 0) - Number(e || 0)) * o;
  return t == null ? r : (2 * r + Number(t || 0)) / 3;
}
function Yr(e, t, a, o) {
  const r = Vo(Number(a || 0) - Number(e || 0)), n = Number(e || 0) + r * o;
  if (t == null) return n;
  const i = Vo(Number(t || 0) - n);
  return n + i / 3;
}
function Xr(e, t, a) {
  return e.map((o, r) => o + (t[r] - o) * a);
}
function Um(e, t, a) {
  return e + (t - e) * a;
}
function Zr(e, t, a) {
  return e + Vo(t - e) * a;
}
function Hm(e, t) {
  const a = (e || []).map((r) => ({
    ...r,
    ...r.camera ? { camera: { ...r.camera } } : {}
  })), o = Math.min(1, Math.max(0, Number(t) || 0));
  if (o === 0 || a.length < 3) return a;
  for (let r = 1; r < a.length - 1; r++) {
    const n = e[r - 1], i = e[r], c = e[r + 1], l = c.frame - n.frame, p = l !== 0 ? (i.frame - n.frame) / l : 0.5;
    if (i.camera) {
      for (const m of Rm) {
        const f = n.camera?.[m], d = i.camera?.[m], h = c.camera?.[m];
        if (Array.isArray(f) && Array.isArray(h) && Array.isArray(d)) {
          const u = Gr(f, d, h, p);
          a[r].camera[m] = Xr(d.map(Number), u, o);
        }
      }
      for (const m of Dm) {
        const f = n.camera?.[m], d = i.camera?.[m], h = c.camera?.[m];
        if (f != null && h != null && d != null) {
          const u = Vm(f, d, h, p);
          a[r].camera[m] = Um(Number(d), u, o);
        }
      }
      for (const m of qm) {
        const f = n.camera?.[m], d = i.camera?.[m], h = c.camera?.[m];
        if (f != null && h != null && d != null) {
          const u = Yr(f, d, h, p);
          a[r].camera[m] = Zr(Number(d), u, o);
        }
      }
    }
    if (Array.isArray(i.position) && Array.isArray(n.position) && Array.isArray(c.position)) {
      for (const m of Bm) {
        const f = n[m], d = i[m], h = c[m];
        if (Array.isArray(f) && Array.isArray(h) && Array.isArray(d)) {
          const u = Gr(f, d, h, p);
          a[r][m] = Xr(d.map(Number), u, o);
        }
      }
      for (const m of Wm) {
        const f = n[m], d = i[m], h = c[m];
        if (Array.isArray(f) && Array.isArray(h) && Array.isArray(d)) {
          const u = [0, 1, 2].map((b) => Yr(f[b], d[b], h[b], p));
          a[r][m] = d.map((b, y) => Zr(Number(b), u[y], o));
        }
      }
    }
  }
  return a;
}
function Gm(e) {
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
const Ym = 0.05, Xm = 5e-3, Zm = 0.5;
function Jm(e, t) {
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
    const u = (y) => {
      const g = y.clientX - c;
      if (Math.abs(g) > 2 && (d = !0), !d) return;
      h || (e.checkpoint?.("Scrub axis"), h = !0);
      let v = Ym;
      y.shiftKey ? v = Xm : (y.ctrlKey || y.metaKey) && (v = Zm);
      const S = p * v * 20;
      let x = l + g * S;
      x = Math.max(m, Math.min(f, x));
      const E = p >= 1 ? 0 : p >= 0.1 ? 1 : 2;
      i.value = x.toFixed(E), i.dispatchEvent(new Event("input", { bubbles: !0 })), i.dispatchEvent(new Event("change", { bubbles: !0 }));
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
function Qm(e, t) {
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
function Qn(e) {
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
  l && o?.fov != null && (l.textContent = `${nr(o.fov)}mm`);
  const p = t.querySelector('[data-role="hud-cam-fov"]');
  p && o?.fov != null && (p.textContent = wc(o.fov));
  const m = t.querySelector('[data-role="hud-cam-dist"]');
  if (m)
    if (o?.target && Array.isArray(o.target) && Array.isArray(o.position)) {
      const u = Sn(jn(o.position, o.target));
      m.textContent = `Tgt: ${u.toFixed(2)}m`;
    } else
      m.textContent = "Free";
  const f = t.querySelector('[data-role="hud-roll-reset"]'), d = t.querySelector('[data-role="hud-roll-val"]'), h = Number(o?.roll || 0);
  f && (Math.abs(h) > 0.05 ? (f.hidden = !1, d && (d.textContent = `${h > 0 ? "+" : ""}${h.toFixed(1)}°`)) : f.hidden = !0);
}
function ep(e) {
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
function Me(e) {
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
function tp(e, t) {
  for (const o of e.root.querySelectorAll('[data-act="toggle-camera-lock"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle camera lock"), e.state.camera_lock = !e.state.camera_lock, e.serialize?.(), Qn(e), e.setStatus?.(e.state.camera_lock ? s("Camera View locked") : s("Camera View unlocked"));
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
      e.serialize?.(), Me(e), e.requestRender?.(), e.setStatus?.(s("Transform space: {space}").replace("{space}", e.state.gizmo_space));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-spatial-snap"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle snapping");
      const n = e.state.spatial_snap_mode || "none";
      e.state.spatial_snap_mode = n === "none" ? "grid" : "none";
      for (const i of e.root.querySelectorAll('[data-role="spatial-snap-mode"]'))
        i.value = e.state.spatial_snap_mode;
      e.serialize?.(), Me(e), e.setStatus?.(s("Snapping: {mode}").replace("{mode}", e.state.spatial_snap_mode));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-grid-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle grid overlay"), e.state.show_grid = e.state.show_grid === !1, e.serialize?.(), Me(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-wireframe-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle wireframe overlay"), e.state.show_wireframe = !e.state.show_wireframe;
      for (const n of e.root.querySelectorAll('[data-role="show-wireframe"]')) n.checked = !!e.state.show_wireframe;
      e.serialize?.(), Me(e), e.requestRender?.(), e.setStatus?.(e.state.show_wireframe ? s("Wireframe overlay: On") : s("Wireframe overlay: Off"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-cull-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle backface culling"), e.state.backface_culling = !e.state.backface_culling;
      for (const n of e.root.querySelectorAll('[data-role="backface-culling"]')) n.checked = !!e.state.backface_culling;
      e.serialize?.(), Me(e), e.webgl && (e.webgl.sceneKey = ""), e.requestRender?.(), e.setStatus?.(e.state.backface_culling ? s("Backface culling: On (Single-Sided)") : s("Backface culling: Off (Double-Sided)"));
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-gizmo-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle gizmo overlay"), e.state.show_gizmo = e.state.show_gizmo === !1, e.serialize?.(), Me(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-guides-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle guides overlay"), e.state.guides = e.state.guides === !1, e.serialize?.(), Me(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-safe-areas-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle safe areas overlay"), e.state.safe_areas = !e.state.safe_areas, e.serialize?.(), Me(e), e.requestRender?.();
    }, { signal: t });
  for (const o of e.root.querySelectorAll('[data-act="toggle-radar-overlay"]'))
    o.addEventListener("click", (r) => {
      r.stopPropagation(), e.checkpoint?.("Toggle radar overlay"), e.state.show_radar = !e.state.show_radar, e.serialize?.(), Me(e), e.requestRender?.();
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
function ap(e, t) {
  const a = e.root.querySelector('[data-role="camera-focal"]'), o = e.root.querySelector('[data-role="camera-fov"]'), r = e.root.querySelector('[data-role="camera-sensor-preset"]');
  !a || !o || (r && r.addEventListener("change", () => {
    const n = kc[r.value];
    if (n && a) {
      const i = _r(a.value, n.height);
      o.value = String(Math.round(i * 100) / 100), o.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
  }, { signal: t }), a.addEventListener("input", () => {
    const n = _r(a.value);
    o.value = String(Math.round(n * 100) / 100), o.dispatchEvent(new Event("input", { bubbles: !0 }));
  }, { signal: t }), o.addEventListener("input", () => {
    document.activeElement !== a && (a.value = nr(o.value));
  }, { signal: t }));
}
function op(e, t) {
  const a = e.root.querySelector('[data-role="path-smoothing"]'), o = e.root.querySelector('[data-role="path-smoothing-value"]');
  if (!a) return;
  const r = () => {
    o && (o.textContent = `${a.value}%`);
  }, n = (i) => (e.smoothingBaseline?.cameraId !== i.id && (e.smoothingBaseline = { cameraId: i.id, keys: Gm(i.keyframes) }), e.smoothingBaseline.keys);
  a.addEventListener("input", r, { signal: t }), a.addEventListener("change", () => {
    const i = e.activeCameraTrack();
    if (!i) return;
    e.checkpoint("Path smoothing");
    const c = Number(a.value) / 100, l = Hm(n(i), c);
    i.keyframes = l, e.state.keyframes = l, e.state.path_smoothing = c, e.syncActiveCameraTrack(), e.refreshKeys(), e.setFrame(e.frame, !1, !1), e.setStatus(c > 0 ? s("Path smoothing set to {percent}%").replace("{percent}", String(a.value)) : s("Path smoothing cleared"));
  }, { signal: t }), r();
}
function rp(e, t) {
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
    const l = await zt(e, s("Reduce keys"), s("Target number of keys"), "8"), p = Math.round(Number(l));
    Number.isFinite(p) && p >= 2 && (e.simplifyActiveKeys({ mode: "reduce", target: p, scope: r?.value || "camera" }), e.keySimplifyBaseline = null);
  }, { signal: t }), e.root.querySelector('[data-act="keys-clean"]')?.addEventListener("click", () => {
    e.simplifyActiveKeys({ mode: "clean", scope: r?.value || "camera" }), e.keySimplifyBaseline = null;
  }, { signal: t });
}
function np(e, t) {
  const a = e.root.querySelector('[data-role="outliner-search"]');
  a && a.addEventListener("input", () => {
    e.outlinerFilter = a.value.trim().toLowerCase(), e.refreshObjects();
  }, { signal: t });
}
function sp(e, t) {
  const a = [...e.root.querySelectorAll("[data-dope-channel]")];
  if (a.length) {
    e.dopeChannels = new Set(a.filter((o) => o.checked).map((o) => o.dataset.dopeChannel));
    for (const o of a)
      o.addEventListener("change", () => {
        e.dopeChannels = new Set(a.filter((r) => r.checked).map((r) => r.dataset.dopeChannel)), Pn(e);
      }, { signal: t });
  }
}
function ip(e, t) {
  e.root.querySelector('[data-act="import-extractor-camera"]')?.addEventListener("click", () => {
    Sc(e);
  }, { signal: t }), e.root.querySelector('[data-act="dismiss-extractor-camera"]')?.addEventListener("click", () => {
    jc(e);
  }, { signal: t });
}
function cp(e, t) {
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
const ro = () => import("./chunk-BXHH4pko.js");
function lp(e, t) {
  ro().then(({ loadExchangeFormats: o }) => o(e, t)), e.root.querySelector('[data-act="import-camera"]')?.addEventListener("click", async () => {
    (await ro()).pickCameraFile(e);
  }, { signal: t }), e.root.querySelector('[data-act="export-camera"]')?.addEventListener("click", async () => {
    (await ro()).exportCamera(e);
  }, { signal: t }), e.root.querySelector('[data-role="camera-file"]')?.addEventListener("change", async (o) => {
    const r = o.target.files?.[0];
    o.target.value = "", await (await ro()).importCameraFile(e, r);
  }, { signal: t });
}
function dp(e, t) {
  const a = e.root.querySelector('[data-role="health-profile"]');
  if (!a) return;
  const o = () => {
    To(e), e.refreshKeys();
  };
  Fi().then((r) => {
    if (e.abortController?.signal.aborted) return;
    if (!Array.isArray(r?.profiles) || r.profiles.length === 0) {
      e.motionProfiles = null, To(e);
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
      Li(e, l, p);
      return;
    }
    const i = r.target.closest("[data-zone-start]");
    if (i) {
      e.setFrame(Number(i.dataset.zoneStart), !1, !1);
      return;
    }
    const c = r.target.closest("[data-act]")?.dataset.act;
    c === "health-slow" ? Ni(e) : c === "health-smooth" ? Ki(e) : c === "health-recenter" && Ri(e);
  }, { signal: t });
  for (const r of e.root.querySelectorAll('[data-tab="health"]'))
    r.addEventListener("click", () => To(e), { signal: t });
}
function mp(e, t) {
  const a = e.root.querySelector('[data-role="outliner-filter-chips"]');
  a && a.addEventListener("click", (o) => {
    const r = o.target.closest(".oc-chip");
    r && (e.outlinerCategoryFilter = r.dataset.filter || "all", e.refreshObjects());
  }, { signal: t });
}
function pp(e, t) {
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
function fp(e, t) {
  const a = e.root.querySelector('[data-role="outliner-batch-bar"]');
  a && a.addEventListener("click", (o) => {
    const r = o.target.closest("[data-act]");
    r && (r.dataset.act === "batch-toggle-visibility" ? e.toggleSelectedObjects?.() : r.dataset.act === "batch-toggle-lock" ? e.lockSelectedObjects?.() : r.dataset.act === "batch-duplicate" ? e.duplicateSelectedObjects?.() : r.dataset.act === "batch-delete" ? e.deleteSelectedObjects?.() : r.dataset.act === "batch-deselect" && e.deselectAll?.());
  }, { signal: t });
}
function hp(e, t) {
  lp(e, t), ap(e, t), op(e, t), rp(e, t), np(e, t), mp(e, t), fp(e, t), pp(e, t), Jm(e, t), Qm(e, t), sp(e, t), cp(e, t), tp(e, t), ip(e, t), dp(e, t);
}
const Jr = {
  low: { shadows: !0, shadowSize: 1024, toneExposure: 0.9, renderScale: 1 },
  balanced: { shadows: !0, shadowSize: 2048, toneExposure: 0.95, renderScale: 1.25 },
  high: { shadows: !0, shadowSize: 4096, toneExposure: 1, renderScale: 1.5 }
}, es = "balanced", zo = "#121212";
function dr(e) {
  return Jr[e] || Jr[es];
}
function up(e, t = "#1b1f2b", a = "#151822", o = "#1e2330", r = "#161922", n = "#111319") {
  const i = document.createElement("canvas");
  i.width = 8, i.height = 256;
  const c = i.getContext("2d"), l = c.createLinearGradient(0, 0, 0, i.height);
  l.addColorStop(0, t), l.addColorStop(0.35, a), l.addColorStop(0.48, o), l.addColorStop(0.52, o), l.addColorStop(0.72, r), l.addColorStop(1, n), c.fillStyle = l, c.fillRect(0, 0, i.width, i.height);
  const p = new e.CanvasTexture(i);
  return p.mapping = e.EquirectangularReflectionMapping, p.colorSpace = e.SRGBColorSpace, p.needsUpdate = !0, p;
}
function bp(e) {
  const t = document.createElement("canvas");
  t.width = t.height = 256;
  const a = t.getContext("2d"), o = a.createRadialGradient(128, 128, 0, 128, 128, 128);
  o.addColorStop(0, "rgba(255,255,255,0.22)"), o.addColorStop(0.3, "rgba(255,255,255,0.13)"), o.addColorStop(0.65, "rgba(255,255,255,0.035)"), o.addColorStop(1, "rgba(255,255,255,0)"), a.fillStyle = o, a.fillRect(0, 0, 256, 256);
  const r = new e.CanvasTexture(t);
  return r.colorSpace = e.SRGBColorSpace, r.needsUpdate = !0, r;
}
function Wu(e, t, a = es) {
  const o = dr(a), r = new e.Group();
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
  const m = bp(e), f = new e.Mesh(
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
  const h = new e.FogExp2(1250588, 8e-3), u = up(e), b = new e.PMREMGenerator(t);
  b.compileEquirectangularShader();
  const y = new al(), g = b.fromScene(y, 0.04).texture;
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
    catcher: f,
    shadowCatcher: d,
    floorMap: m,
    sky: u,
    environment: g,
    pmrem: b,
    fog: h,
    quality: a,
    dispose() {
      f.geometry.dispose(), f.material.dispose(), d.geometry.dispose(), d.material.dispose(), m.dispose(), u.dispose(), g.dispose(), b.dispose();
      for (const v of [n, c, l, p]) v.dispose?.();
    }
  };
}
function Vu(e, t, a) {
  const o = dr(a);
  return e.quality = a, e.key.shadow.mapSize.set(o.shadowSize, o.shadowSize), e.key.shadow.map?.dispose(), e.key.shadow.map = null, t.toneMappingExposure = o.toneExposure, o;
}
function Uu(e, t, a, o, r) {
  o.group.visible = r, t.environment = r ? o.environment : null, t.background = r ? o.sky : new e.Color(1184274), t.fog = r ? o.fog : null, a.toneMapping = r ? e.ACESFilmicToneMapping : e.NoToneMapping, a.toneMappingExposure = r ? dr(o.quality).toneExposure : 1, t.traverse((n) => {
    n.material && (n.material.needsUpdate = !0);
  });
}
function mr(e, t) {
  t && (e.checkpoint?.("Toggle object lock"), t.locked = !t.locked, e.serialize?.(), e.refreshObjects?.(), e.refreshInspector?.(), e.render?.());
}
function gp(e) {
  if (!e?.reconstruction) return null;
  const t = e.reconstruction.confidence != null ? Number(e.reconstruction.confidence) : 1;
  let a = "low", o = "Low";
  t >= 0.75 ? (a = "high", o = "High") : t >= 0.45 && (a = "medium", o = "Medium");
  const r = e.reconstruction, n = r.provider || "Reconstructed", i = Math.round(t * 100), c = Cc(e), l = c.length ? `
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
function yp(e) {
  return e?.reconstruction_appearance || "source_texture";
}
function Hu(e, t, a) {
  return e?.reconstruction ? a ? "neutral" : yp(t) === "source_texture" ? "textured" : "neutral" : null;
}
function vp(e, t) {
  e && (e.state || (e.state = {}), e.state.reconstruction_appearance = t === "source_texture" ? "source_texture" : "neutral", e.serialize?.(), e.render?.());
}
function no(e, t, a, o = 300) {
  const r = globalThis.performance?.now?.() ?? Date.now();
  e._groupedCheckpointAt ||= {}, (!Number.isFinite(e._groupedCheckpointAt[t]) || r - e._groupedCheckpointAt[t] > o) && e.checkpoint(a), e._groupedCheckpointAt[t] = r;
}
function xp(e, t, a) {
  const o = e.root.querySelector('[data-role="viewport-axis"]');
  if (o) {
    const n = (i) => {
      const c = i.target.closest?.("[data-axis], [data-axis-center]") || i.target, l = c.getAttribute("data-axis"), p = Di(l?.toLowerCase(), e.state.view_mode);
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
      e.camera.camera_type !== i.target.value && e.checkpoint("Change camera type"), e.camera.camera_type = i.target.value, xe(e.root, "camera-type", i.target), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="speed"]')) {
    const i = (c) => {
      const l = Y(Number(c.target.value), 0.05, 5);
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
      e.state.point_color !== i.target.value && no(e, "point_color", "Change point color"), e.state.point_color = i.target.value, e.scheduleSerialize(), e.render();
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
      e.state.speed_heatmap !== i.target.checked && e.checkpoint("Toggle speed heatmap"), e.state.speed_heatmap = i.target.checked, xe(e.root, "speed-heatmap", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-grid"]'))
    n.addEventListener("change", (i) => {
      e.state.playblast_grid !== i.target.checked && e.checkpoint("Toggle playblast grid"), e.state.playblast_grid = i.target.checked, xe(e.root, "playblast-grid", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-labels"]'))
    n.addEventListener("change", (i) => {
      e.state.playblast_labels !== i.target.checked && e.checkpoint("Toggle playblast labels"), e.state.playblast_labels = i.target.checked, xe(e.root, "playblast-labels", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="playblast-resolution"]'))
    n.addEventListener("change", (i) => {
      e.state.playblast_resolution !== i.target.value && e.checkpoint("Change playblast resolution"), e.state.playblast_resolution = i.target.value, xe(e.root, "playblast-resolution", i.target), e.scheduleSerialize();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-act="reset-bg-color"]'))
    n.addEventListener("click", () => {
      e.state.viewport_bg_color !== zo && e.checkpoint("Reset background colour"), e.state.viewport_bg_color = zo;
      for (const i of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) i.value = zo;
      e.scheduleSerialize(), e.render(), e.setStatus(s("Background colour reset"));
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-grid"]'))
    n.addEventListener("change", (i) => {
      e.state.show_grid = i.target.checked, xe(e.root, "show-grid", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const [n, i] of [
    ["show-camera-paths", "show_camera_paths"],
    ["show-camera-gizmos", "show_camera_gizmos"],
    ["show-look-at", "show_look_at"],
    ["show-helper-axes", "show_helper_axes"]
  ])
    for (const c of e.root.querySelectorAll(`[data-role="${n}"]`))
      c.addEventListener("change", (l) => {
        e.state[i] !== l.target.checked && e.checkpoint("Toggle viewport helper"), e.state[i] = l.target.checked, xe(e.root, n, l.target, "checked"), e.scheduleSerialize(), e.render();
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
      e.state.show_wireframe !== i.target.checked && e.checkpoint("Toggle wireframe"), e.state.show_wireframe = i.target.checked, xe(e.root, "show-wireframe", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-vertices"]'))
    n.addEventListener("change", (i) => {
      e.state.show_vertices !== i.target.checked && e.checkpoint("Toggle vertices"), e.state.show_vertices = i.target.checked, xe(e.root, "show-vertices", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="backface-culling"]'))
    n.addEventListener("change", (i) => {
      !!e.state.backface_culling !== i.target.checked && e.checkpoint("Toggle backface culling"), e.state.backface_culling = i.target.checked, xe(e.root, "backface-culling", i.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render(), e.setStatus(e.state.backface_culling ? s("Backface culling: On (Single-Sided)") : s("Backface culling: Off (Double-Sided)"));
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
      e.state.burn_in !== i.target.checked && e.checkpoint("Toggle burn-in"), e.state.burn_in = i.target.checked, xe(e.root, "burn-in", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="guides"]'))
    n.addEventListener("change", (i) => {
      e.state.guides !== i.target.checked && e.checkpoint("Toggle guides"), e.state.guides = i.target.checked, xe(e.root, "guides", i.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="safe-areas"]'))
    n.addEventListener("change", (i) => {
      e.state.safe_areas !== i.target.checked && e.checkpoint("Toggle safe areas"), e.state.safe_areas = i.target.checked, xe(e.root, "safe-areas", i.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="resolution-gate"]'))
    n.addEventListener("change", (i) => {
      e.state.resolution_gate !== i.target.checked && e.checkpoint("Toggle resolution gate"), e.state.resolution_gate = i.target.checked, xe(e.root, "resolution-gate", i.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="aspect-ratio"]'))
    n.addEventListener("change", (i) => {
      e.state.aspect_ratio !== i.target.value && e.checkpoint("Change aspect ratio"), e.state.aspect_ratio = i.target.value, xe(e.root, "aspect-ratio", i.target), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) {
    const i = (c) => {
      e.state.viewport_bg_color !== c.target.value && no(e, "viewport_bg_color", "Change background colour"), e.state.viewport_bg_color = c.target.value, xe(e.root, "viewport-bg-color", c.target), e.scheduleSerialize(), e.render();
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
      i && mr(e, i);
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="reconstruction-appearance"]'))
    n.addEventListener("change", (i) => {
      vp(e, i.target.value);
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="object-color"]'))
    n.addEventListener("input", (i) => {
      const c = e.selectedObject();
      c && (c.color !== i.target.value && no(e, `object_color:${c.id}`, "Change object color"), c.color = i.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="object-light-color"]'))
    n.addEventListener("input", (i) => {
      const c = e.selectedObject();
      c && (c.color !== i.target.value && no(e, `object_color:${c.id}`, "Change light color"), c.color = i.target.value, e.scheduleSerialize(), e.render());
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
      _c(e, Number(n.dataset.lens));
    }, { signal: a });
  for (const n of e.root.querySelectorAll("[data-blocking-scene]"))
    n.addEventListener("click", () => {
      Sm(e, n.dataset.blockingScene), e.closeMenus();
    }, { signal: a });
  for (const n of e.root.querySelectorAll('[data-role="show-radar"]'))
    n.addEventListener("change", (i) => {
      e.state.show_radar !== i.target.checked && e.checkpoint("Toggle radar"), e.state.show_radar = i.target.checked, e.scheduleSerialize(), e.render(), e.setStatus(`Radar Mini-Map: ${i.target.checked ? "ON" : "OFF"}`);
    }, { signal: a });
}
const wp = 32, kp = 0.025, Sp = 0.05, bo = 1e-6, jp = ["top", "bottom", "front", "back", "left", "right"], Cp = {
  top: "y",
  bottom: "y",
  front: "z",
  back: "z",
  left: "x",
  right: "x"
}, go = { x: 0, y: 1, z: 2 };
function Uo(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
function pr(e, t) {
  return Math.hypot(
    (t[0] || 0) - (e[0] || 0),
    (t[1] || 0) - (e[1] || 0),
    (t[2] || 0) - (e[2] || 0)
  );
}
function _p(e) {
  let t = 0;
  for (let a = 1; a < e.length; a++) t += pr(e[a - 1], e[a]);
  return t;
}
function Qr(e) {
  const t = Math.max(0, Math.round(Number(e?.duration_frames) || 1) - 1), a = Array.isArray(e?.playback_range) ? e.playback_range : [0, t], o = Uo(Math.round(Number(a[0]) || 0), 0, t), r = Uo(Math.round(Number(a[1]) || t), 0, t);
  return o <= r ? [o, r] : [r, o];
}
function Ep(e, t) {
  if (t <= 2) return [e[0], e.at(-1)].map((i) => [...i]);
  const a = [0];
  for (let i = 1; i < e.length; i++)
    a[i] = a[i - 1] + pr(e[i - 1], e[i]);
  const o = a.at(-1) || 0;
  if (o < bo) return [];
  const r = [];
  let n = 1;
  for (let i = 0; i < t; i++) {
    const c = o * i / (t - 1);
    for (; n < a.length - 1 && a[n] < c; ) n += 1;
    const l = a[n - 1], p = a[n], m = Uo((c - l) / Math.max(bo, p - l), 0, 1), f = e[n - 1], d = e[n];
    r.push([
      f[0] + (d[0] - f[0]) * m,
      f[1] + (d[1] - f[1]) * m,
      f[2] + (d[2] - f[2]) * m
    ]);
  }
  return r;
}
function ts(e, t = [0, 0, -1]) {
  const a = Math.hypot(e?.[0] || 0, e?.[2] || 0);
  return a < bo ? [...t] : [(e[0] || 0) / a, 0, (e[2] || 0) / a];
}
function as(e, t) {
  const a = Math.hypot(e[0] || 0, e[1] || 0, e[2] || 0);
  return a < bo ? [...t] : [e[0] / a, e[1] / a, e[2] / a];
}
function $p(e, t, a, o) {
  const r = e[Math.max(0, t - 1)], n = e[Math.min(e.length - 1, t + 1)], i = [n[0] - r[0], n[1] - r[1], n[2] - r[2]];
  return o === "y" ? ts(i, a) : as(i, a);
}
function Mp(e, t, a, o) {
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
function Ap(e) {
  const [t, a] = e.range, o = a - t;
  if (o < 1) return [];
  const r = e.seedPoint ? [e.seedPoint, ...e.points] : e.points;
  if (r.length < 2) return [];
  const n = Math.min(wp, r.length, o + 1);
  if (n < 2) return [];
  const i = Ep(r, n);
  if (i.length < 2) return [];
  const c = e.sourceCamera, l = [
    c.target[0] - c.position[0],
    c.target[1] - c.position[1],
    c.target[2] - c.position[2]
  ], p = e.planeAxis === "y" ? ts(l) : as(l, [0, 0, -1]), m = e.seedPoint ? 1 : 0, f = [];
  for (let d = m; d < i.length; d++) {
    const h = i[d], u = $p(i, d, p, e.planeAxis), b = ye(c);
    b.position = [...h], b.target = Mp(h, u, l, e.planeAxis), f.push({
      frame: Math.round(t + o * d / (i.length - 1)),
      camera: b,
      interpolation: "smooth"
    });
  }
  return f.filter((d, h, u) => h === 0 || d.frame > u[h - 1].frame);
}
function Tp(e) {
  const t = new Set((e.cameras || []).map((o) => o.name));
  let a = 1;
  for (; t.has(`Drawn Camera ${a}`); ) a += 1;
  return `Drawn Camera ${a}`;
}
function os(e, t = e.cameraPathDraw) {
  const a = t?.pointerId;
  if (a != null)
    try {
      e.interactionElement?.hasPointerCapture?.(a) && e.interactionElement.releasePointerCapture(a);
    } catch {
    }
}
function It(e) {
  const t = e.cameraPathDraw, a = !!t?.active, o = a && t.mode === "extend";
  for (const n of e.root?.querySelectorAll?.('[data-act="draw-camera-path"]') || [])
    n.classList.toggle("active", a && !o), n.setAttribute("aria-pressed", String(a && !o));
  for (const n of e.root?.querySelectorAll?.('[data-act="draw-camera-path-extend"]') || [])
    n.classList.toggle("active", o), n.setAttribute("aria-pressed", String(o));
  const r = e.interactionElement;
  r?.style && (a ? (r.dataset.cameraPathDraw = "true", r.style.cursor = "crosshair") : r.dataset?.cameraPathDraw && (delete r.dataset.cameraPathDraw, r.style.cursor = ""));
}
function en(e, t = {}) {
  if (e.cameraPathDraw?.active) return !0;
  const a = t.mode === "extend" ? "extend" : "new", o = e.activeCameraTrack?.(), r = ye(e.camera || o?.camera);
  if (!r?.position || !r?.target) return !1;
  let n = null, i = null, c, l = null, p = null;
  if (a === "extend") {
    const d = o?.keyframes;
    if (!o || !Array.isArray(d) || d.length < 1)
      return e.setStatus?.(s("Draw Camera Path: the active camera has no path to continue")), !1;
    e.state.view_mode === "camera" && e.setViewMode?.("top");
    const h = d[d.length - 1];
    n = [...h.camera.position], i = o.id;
    const u = Math.max(0, Math.round(Number(e.state.duration_frames) || 1) - 1), [, b] = Qr(e.state), y = d.length > 1 ? d[d.length - 1].frame - d[0].frame : 24;
    let g = Math.max(b, h.frame + Math.max(6, Math.min(y, 240)));
    g <= h.frame && (g = h.frame + 24), g > u && (l = g + 1), g > b && (p = g), c = [h.frame, g];
  } else
    jp.includes(e.state.view_mode) || e.setViewMode?.("top"), c = Qr(e.state);
  const m = Cp[e.state.view_mode] ?? null, f = n ? [...n] : [...r.position];
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
  }, It(e), e.setStatus?.(a === "extend" ? s("Continue Camera Path: LMB draw from the last key · RMB or Esc cancel") : s("Draw Camera Path: LMB draw · RMB or Esc cancel")), e.render?.(), !0;
}
function fr(e, t) {
  const a = e.cameraPathDraw;
  if (!a?.active || !Array.isArray(t) || t.length < 3) return !1;
  const o = [Number(t[0]), Number(t[1]), Number(t[2])];
  if (!o.every(Number.isFinite)) return !1;
  a.planeAxis && (o[go[a.planeAxis]] = a.anchor[go[a.planeAxis]]);
  const r = a.points.at(-1);
  return r && pr(r, o) < kp ? !1 : (a.points.push(o), !0);
}
function Pe(e) {
  const t = e.cameraPathDraw;
  return t?.active ? (os(e, t), e.cameraPathDraw = null, It(e), e.setStatus?.(s("Draw Camera Path cancelled")), e.render?.(), !0) : !1;
}
function Ip(e) {
  const t = e.cameraPathDraw;
  if (!t?.active) return null;
  os(e, t);
  const a = t.seedPoint ? [t.seedPoint, ...t.points] : t.points;
  if (a.length < 2 || _p(a) < Sp || t.range[1] <= t.range[0])
    return Pe(e), e.setStatus?.(s("Camera path needs at least two distinct points")), null;
  const o = Ap(t);
  if (o.length < (t.mode === "extend" ? 1 : 2))
    return Pe(e), null;
  if (t.mode === "extend") {
    const c = e.state.cameras.find((m) => m.id === t.appendTrackId);
    if (!c)
      return Pe(e), null;
    e.checkpoint?.("Extend camera path"), t.wantDuration && (e.state.duration_frames = Math.max(Number(e.state.duration_frames) || 0, t.wantDuration)), t.wantRangeEnd != null && Array.isArray(e.state.playback_range) && (e.state.playback_range = [e.state.playback_range[0], Math.max(e.state.playback_range[1], t.wantRangeEnd)]);
    const l = new Map((c.keyframes || []).map((m) => [m.frame, m]));
    for (const m of o) l.set(m.frame, m);
    const p = [...l.values()].sort((m, f) => m.frame - f.frame);
    return c.keyframes = p, c.id === e.state.active_camera_id && (e.state.keyframes = p), e.cameraPreviewSignature = "", e.cameraPathDraw = null, It(e), e.activateCamera?.(c.id), e.setFrame?.(o[0].frame), e.serialize?.(), e.refreshKeys?.(), e.render?.(), e.setStatus?.(s("Camera path extended")), c.id;
  }
  e.checkpoint?.("Draw camera path");
  const r = Ec(e.state), n = e.state.cameras.length, i = {
    id: r,
    name: Tp(e.state),
    color: Er[n % Er.length],
    camera: ye(o[0].camera),
    keyframes: o,
    target_object_id: null,
    target_offset: [0, 0, 0]
  };
  return e.state.cameras.push(i), e.cameraPreviewSignature = "", e.cameraPathDraw = null, It(e), e.activateCamera?.(r), e.setFrame?.(t.range[0]), e.setStatus?.(s("Camera path created")), r;
}
function yo(e) {
  e.preventDefault?.(), e.stopPropagation?.(), e.stopImmediatePropagation?.();
}
function Pp(e, t) {
  const a = e.interactionElement.getBoundingClientRect();
  return [
    (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width),
    (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height)
  ];
}
function hr(e, t) {
  const a = e.cameraPathDraw, o = e.viewportCamera?.();
  if (!a || !o) return null;
  const r = qi(
    Pp(e, t),
    o,
    a.anchor,
    e.canvas.width,
    e.canvas.height
  );
  return r?.every(Number.isFinite) ? (a.planeAxis && (r[go[a.planeAxis]] = a.anchor[go[a.planeAxis]]), r) : null;
}
function Op(e, t) {
  const a = e.cameraPathDraw;
  return a?.active ? t.button === 2 && !t.altKey ? (yo(t), e.cameraPathSuppressContextMenuUntil = Date.now() + 1e3, Pe(e), !0) : t.button !== 0 || t.altKey || t.ctrlKey || t.metaKey || t.shiftKey ? !1 : (yo(t), e.closeMenus?.(), e.interactionElement.focus?.({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(t.pointerId), a.drawing = !0, a.pointerId = t.pointerId, a.points = [], fr(e, hr(e, t)), It(e), e.requestRender?.("camera-path-draw"), !0) : !1;
}
function zp(e, t) {
  const a = e.cameraPathDraw;
  return !a?.active || !a.drawing || a.pointerId !== t.pointerId ? !1 : (yo(t), fr(e, hr(e, t)) && e.requestRender?.("camera-path-draw"), !0);
}
function Fp(e, t) {
  const a = e.cameraPathDraw;
  return !a?.active || !a.drawing || a.pointerId !== t.pointerId ? !1 : (yo(t), t.type === "pointercancel" || t.type === "lostpointercapture" ? (Pe(e), !0) : (fr(e, hr(e, t)), a.drawing = !1, Ip(e), !0));
}
function Lp(e) {
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
function Np(e, t) {
  for (const a of e.root.querySelectorAll('[data-act="draw-camera-path"]'))
    a.addEventListener("click", () => {
      e.cameraPathDraw?.active ? Pe(e) : en(e);
    }, { signal: t });
  for (const a of e.root.querySelectorAll('[data-act="draw-camera-path-extend"]'))
    a.addEventListener("click", () => {
      e.cameraPathDraw?.active ? Pe(e) : en(e, { mode: "extend" });
    }, { signal: t });
  e.root.addEventListener("contextmenu", (a) => {
    !(Date.now() <= Number(e.cameraPathSuppressContextMenuUntil || 0)) && !e.cameraPathDraw?.active || (a.preventDefault(), a.stopPropagation(), a.stopImmediatePropagation?.(), e.cameraPathSuppressContextMenuUntil = 0, e.cameraPathDraw?.active && Pe(e));
  }, { capture: !0, signal: t });
}
const mo = "/majoor/omnicam/scenes";
function rs(e) {
  return e.sceneName || e.state?.metadata?.scene_name || "";
}
function po(e, t, a) {
  const o = e.api || (typeof window < "u" ? window.app?.api : null);
  if (!o?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return o.fetchApi(t, a);
}
function ur(e, t, { name: a = "", status: o } = {}) {
  const r = t && typeof t == "object" ? t : Cn(), n = { ...r, metadata: { ...r.metadata || {}, scene_name: a || "" } };
  e.stateWidget && (e.stateWidget.value = JSON.stringify(n)), e.widthWidget && n.width != null && (e.widthWidget.value = n.width), e.heightWidget && n.height != null && (e.heightWidget.value = n.height), e.fpsWidget && n.fps != null && (e.fpsWidget.value = n.fps), e.durationWidget && n.fps && n.duration_frames != null && (e.durationWidget.value = n.duration_frames / n.fps), e.modeWidget && n.render_mode != null && (e.modeWidget.value = n.render_mode), e.cardWidget && (e.cardWidget.value = n.card_asset || ""), e.restoreFromWidgets(), e.sceneName = a || "", e.state && (e.state.metadata = { ...e.state.metadata, scene_name: e.sceneName }), e.serialize?.(), e.sceneBaseline = e.stateWidget?.value ?? JSON.stringify(n), e.refreshCameraPreviews?.(), e.syncUpstreamInputs?.(), e.setStatus?.(o || s("Scene loaded"));
}
async function Kp(e) {
  await Ft(e, s("New Scene"), s("Start a new scene? Unsaved changes will be lost.")) && ur(e, Cn(), { name: "", status: s("New scene") });
}
async function Rp(e) {
  if (!e.sceneBaseline) {
    e.setStatus?.(s("Nothing to revert to"));
    return;
  }
  if (!await Ft(
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
  const o = a?.metadata?.scene_name || rs(e);
  ur(e, a, { name: o, status: s("Scene reset to last save") });
}
async function Dp(e) {
  const t = rs(e) || s("Untitled"), a = await zt(e, s("Save Scene"), s("Scene name"), t);
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
    const n = await po(e, mo, {
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
async function qp(e) {
  let t;
  try {
    const r = await po(e, mo);
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
  const a = await $c({
    title: s("Open Scene"),
    owner: e,
    items: t.map((r) => ({
      id: r.slug,
      label: r.name || r.slug,
      sublabel: Bp(r.modified)
    })),
    onDelete: (r) => po(e, `${mo}/${encodeURIComponent(r)}`, { method: "DELETE" }).catch((n) => console.warn("[OmniCam] scene delete failed", n))
  });
  if (!(!a || !await Ft(e, s("Open Scene"), s("Open this scene? Unsaved changes will be lost."))))
    try {
      const r = await po(e, `${mo}/${encodeURIComponent(a)}`);
      if (!r.ok) throw new Error(await r.text());
      const n = await r.json();
      ur(e, n.state, {
        name: n.name || a,
        status: s("Scene opened: {name}").replace("{name}", n.name || a)
      });
    } catch (r) {
      console.error("[OmniCam] scene open failed", r), e.setStatus?.(s("Scene open failed: {error}").replace("{error}", String(r?.message || r).slice(0, 120)));
    }
}
function Bp(e) {
  if (!Number.isFinite(e)) return "";
  try {
    return new Date(e * 1e3).toLocaleString();
  } catch {
    return "";
  }
}
function so(e, t, a, o) {
  for (const r of a)
    r.addEventListener("click", () => {
      e.closeMenus?.(), Promise.resolve(o()).catch((n) => {
        console.error("[OmniCam] scene action failed", n), e.setStatus?.(String(n?.message || n).slice(0, 160));
      });
    }, { signal: t });
}
function Wp(e, t) {
  so(e, t, e.root.querySelectorAll('[data-act="scene-new"]'), () => Kp(e)), so(e, t, e.root.querySelectorAll('[data-act="scene-open"]'), () => qp(e)), so(e, t, e.root.querySelectorAll('[data-act="scene-save"]'), () => Dp(e)), so(e, t, e.root.querySelectorAll('[data-act="scene-reset"]'), () => Rp(e));
}
const Vp = ["world_point", "object_point", "camera_field"], tn = 40;
function Up(e) {
  return (e.keys || []).map((t) => ({ x: t.x, y: t.y, t: t.time_seconds }));
}
function Hp(e, t, a) {
  const o = Math.max(1, Number(e.fps) || 24), r = e.width || 1280, n = e.height || 720, i = [];
  for (let c = 0; c <= tn; c += 1) {
    const l = a * c / tn, p = or(e, t.source, l * o, r, n);
    p && i.push({ x: p.x, y: p.y, t: l });
  }
  return i;
}
function Gp(e, t) {
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
function ns(e, t, a) {
  const o = t / Math.max(1, a), r = e.width / Math.max(1, e.height);
  let n = e.width, i = e.height;
  return r > o ? n = i * o : i = n / o, { x: (e.width - n) / 2, y: (e.height - i) / 2, w: n, h: i };
}
function Yp(e) {
  const t = e.root.querySelector('[data-role="motion-preview"]');
  if (!t || t.closest("[data-tab-panel]")?.hidden) return;
  const o = t.getBoundingClientRect();
  if (!o.width || !o.height) return;
  const r = Math.min(2, window.devicePixelRatio || 1), n = Math.round(o.width * r), i = Math.round(o.height * r);
  t.width !== n && (t.width = n), t.height !== i && (t.height = i);
  const c = t.getContext("2d");
  if (!c) return;
  const l = ns(t, e.state.width || 1280, e.state.height || 720), p = (y) => l.x + y * l.w, m = (y) => l.y + y * l.h;
  c.save(), c.clearRect(0, 0, t.width, t.height), c.fillStyle = "#0b0b0f", c.fillRect(0, 0, t.width, t.height), c.fillStyle = "#0f0f14", c.fillRect(l.x, l.y, l.w, l.h), c.strokeStyle = "rgba(255,255,255,0.06)", c.lineWidth = 1;
  for (let y = 1; y < 3; y += 1)
    c.beginPath(), c.moveTo(p(y / 3), l.y), c.lineTo(p(y / 3), l.y + l.h), c.stroke(), c.beginPath(), c.moveTo(l.x, m(y / 3)), c.lineTo(l.x + l.w, m(y / 3)), c.stroke();
  const f = Math.max(1, Number(e.state.fps) || 24), d = Math.max(1 / f, (e.state.duration_frames || 120) / f), h = (e.frame || 0) / f;
  let u = 0;
  for (const y of e.state.motion_layers || []) {
    if (y.enabled === !1) continue;
    const g = Vp.includes(y.source_kind), v = g ? Hp(e.state, y, d) : Up(y);
    if (!v.length) continue;
    u += 1;
    const S = y.id === e.state.selected_motion_layer_id;
    if (c.strokeStyle = S ? "#ffcc4d" : "rgba(65,217,197,0.6)", c.lineWidth = (S ? 2.4 : 1.5) * r, c.beginPath(), v.forEach((E, M) => {
      const K = p(E.x), P = m(E.y);
      M ? c.lineTo(K, P) : c.moveTo(K, P);
    }), c.stroke(), !g) {
      c.fillStyle = S ? "#ffcc4d" : "#41d9c5";
      for (const E of v)
        c.beginPath(), c.arc(p(E.x), m(E.y), (S ? 3.4 : 2.4) * r, 0, Math.PI * 2), c.fill();
    }
    const x = Gp(v, h);
    x && (c.fillStyle = S ? "#ffcc4d" : "#41d9c5", c.strokeStyle = "#fff", c.lineWidth = 1.4 * r, c.beginPath(), c.arc(p(x.x), m(x.y), 4.4 * r, 0, Math.PI * 2), c.fill(), c.stroke());
  }
  c.strokeStyle = "rgba(255,255,255,0.16)", c.lineWidth = 1, c.strokeRect(l.x + 0.5, l.y + 0.5, l.w - 1, l.h - 1), c.restore();
  const b = e.root.querySelector('[data-role="motion-preview-empty"]');
  b && (b.hidden = u > 0);
}
function Xp(e, t) {
  const a = e.root.querySelector('[data-role="motion-preview"]');
  a && a.addEventListener("click", (o) => {
    const r = a.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const n = ns(a, e.state.width || 1280, e.state.height || 720), i = a.width / r.width, c = {
      x: ((o.clientX - r.left) * i - n.x) / Math.max(1, n.w),
      y: ((o.clientY - r.top) * i - n.y) / Math.max(1, n.h)
    }, l = Bi(e.state.motion_layers, c, 0.09);
    l && (e.state.selected_motion_layer_id = l.id, e.render());
  }, { signal: t });
}
function xe(e, t, a, o = "value") {
  for (const r of e.querySelectorAll(`[data-role="${t}"]`))
    r !== a && (r[o] = a[o]);
}
function Zp(e) {
  e.abortController = new AbortController();
  const t = e.abortController.signal, a = (o) => e.root.querySelector(o);
  Wi(e, t), Vi(e, t), Xp(e, t), Km(e, a, t), xp(e, a, t), Mc(e, t), Np(e, t), Wp(e, t), Im(e, a, t), hp(e, t);
}
function Jp(e, t) {
  return Object.defineProperty(e, "omnicamMetrics", { value: Object.freeze({ ...t }), enumerable: !0 }), e;
}
function Qp(e, t) {
  const a = t?.omnicamMetrics || {}, o = Number(a.fps) || Number(e.state.fps), r = Number(a.requestedFrames) || Number(e.state.duration_frames), n = Number(a.width) || Number(e.canvas.width), i = Number(a.height) || Number(e.canvas.height), c = e.state.playblast_camera_id === _n ? Jo(e.state).map((l) => ({ camera_id: l.camera_id, start_frame: l.start, end_frame: l.end })) : [];
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
    motion_scene_fingerprint: Qc(e.state)
  };
}
function ef(e, t) {
  const a = Qp(e, t);
  return e.state.metadata = { ...e.state.metadata || {}, playblast: a }, a;
}
function an(e, t, { frameCount: a = 0, fps: o = 0 } = {}) {
  const r = Math.round(Number(t?.videoWidth || t?.naturalWidth) || 0), n = Math.round(Number(t?.videoHeight || t?.naturalHeight) || 0), i = Math.round(Number(o) || Number(e.state?.fps) || Number(e.fpsWidget?.value) || 24), c = Number(t?.duration) > 0 ? Math.round(Number(t.duration) * i) : 0, l = Math.round(Number(a) || c || 0);
  return !r || !n ? !1 : (e.widthWidget && (e.widthWidget.value = r), e.heightWidget && (e.heightWidget.value = n), i && e.fpsWidget && (e.fpsWidget.value = i), l && i && e.durationWidget && (e.durationWidget.value = Math.max(0.25, l / i)), e.syncFromWidgets(), !0);
}
const Ge = 1024 * 1024, tf = Object.freeze({
  card: 128 * Ge,
  // MAX_CARD_BYTES
  model: 256 * Ge,
  // MAX_MODEL_BYTES
  fbx: 64 * Ge,
  // MAX_FBX_MODEL_BYTES
  image: 128 * Ge,
  // background stills go through the card/asset route
  audio: 128 * Ge
  // no upload, but decodeAudioData still buffers it all
}), on = 2e3;
function rn(e) {
  return `${(e / Ge).toFixed(e >= 10 * Ge ? 0 : 1)} MB`;
}
function Lt(e, t) {
  const a = tf[t];
  if (!e || !a) return null;
  const o = Number(e.size);
  return !Number.isFinite(o) || o <= a ? null : `${e.name || "File"} is ${rn(o)}; the maximum is ${rn(a)}.`;
}
function af(e) {
  return Number(e) <= on ? null : `${e} frames selected; a background sequence is limited to ${on}.`;
}
function of(e) {
  const t = e.audioElement;
  return !t || t.paused || !Number.isFinite(t.currentTime) ? null : Math.round(t.currentTime * Math.max(1, e.state.fps));
}
function Fo(e, t) {
  const a = e.audioElement;
  if (!a) return;
  const o = Math.max(0, t / Math.max(1, e.state.fps));
  if (!(o >= (e.audioDuration || 0)))
    try {
      a.currentTime = o;
    } catch {
    }
}
function rf(e) {
  if (e.playing) return fo(e);
  e.playing = !0;
  for (const m of e.root.querySelectorAll('[data-act="play"]')) {
    m.classList.add("playing");
    const f = m.querySelector("i");
    f && (f.className = "pi pi-pause");
  }
  const t = e.state.playback_range, a = t ? t[0] : 0, o = t ? t[1] : e.state.duration_frames - 1;
  let r = e.frame >= o || e.frame < a ? a : e.frame, n = null;
  e.audioElement && (Fo(e, r), Promise.resolve(e.audioElement.play()).catch(() => {
  }));
  const i = 1e3 / e.state.fps;
  let c = performance.now(), l = 0;
  const p = (m) => {
    if (!e.playing) return;
    const f = of(e);
    if (f === null) {
      for (l += m - c, c = m; l >= i; )
        if (l -= i, r += 1, r > o) {
          if (!e.state.loop_playback) return void fo(e);
          r = a;
        }
    } else if (c = m, l = 0, r = f, r > o) {
      if (!e.state.loop_playback) return void fo(e);
      r = a, Fo(e, a);
    } else r < a && (r = a, Fo(e, a));
    r !== n && (n = r, e.setFrame(r, !0, !1)), e.playTimer = requestAnimationFrame(p);
  };
  e.playTimer = requestAnimationFrame(p);
}
function fo(e) {
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
function vo(e) {
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
function ss(e) {
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
async function nf(e, { load: t = () => import("./vendor-mediabunny-CZ5VNE-V.js") } = {}) {
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
function sf(e) {
  return Number.isFinite(e.duration) && e.duration > 0 ? Promise.resolve() : new Promise((t) => {
    const a = () => {
      e.removeEventListener("loadedmetadata", a), e.removeEventListener("error", a), t();
    };
    e.addEventListener("loadedmetadata", a), e.addEventListener("error", a);
  });
}
async function cf(e, t, { decode: a = nf } = {}) {
  if (!t) return;
  const o = Lt(t, "audio");
  if (o) {
    e.setStatus(o);
    return;
  }
  vo(e);
  try {
    const r = URL.createObjectURL(t), n = new Audio();
    n.preload = "auto", n.src = r, e.audioObjectUrl = r, e.audioElement = n, await sf(n), e.audioDuration = Number.isFinite(n.duration) ? n.duration : 0;
    try {
      e.audioSamples = await a(t);
    } catch {
      e.audioSamples = null;
    }
    ss(e), e.setStatus(`Audio loaded: ${t.name || "track"}`);
  } catch (r) {
    vo(e), e.setStatus(`Failed to load audio: ${r.message || r}`);
  }
}
let ct = null;
function is({ api: e }) {
  ct = e;
}
const cs = /* @__PURE__ */ new WeakSet(), $t = /* @__PURE__ */ new WeakMap();
function xo(e) {
  if (!(typeof HTMLVideoElement > "u" || !(e instanceof HTMLVideoElement)))
    try {
      e.pause(), e.removeAttribute("src"), e.srcObject = null, e.load();
    } catch {
    }
}
function lf(e) {
  e && typeof e == "object" && $t.set(e, ($t.get(e) || 0) + 1);
}
function df(e) {
  if (!e || typeof e != "object") return;
  const t = $t.get(e) || 0;
  if (t > 1) {
    $t.set(e, t - 1);
    return;
  }
  $t.delete(e), cs.has(e) && xo(e);
}
function Nt(e, t) {
  const a = e.cardMediaById.get(t);
  a && (e.cardMediaById.delete(t), e.cardMediaAssetById?.delete?.(t), t === "subject" && e.cardMedia === a && (e.cardMedia = null), df(a));
}
function mf(e) {
  for (const t of [...e.cardMediaById?.keys?.() || []]) Nt(e, t);
}
function qe(e, t, a, o = !1, r = "") {
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
  n && n !== a && Nt(e, t), o && cs.add(a), lf(a), e.cardMediaAssetById ||= /* @__PURE__ */ new Map(), e.cardMediaById.set(t, a), e.cardMediaAssetById.set(t, r || a?.__omnicamAsset || "");
  try {
    a.__omnicamAsset = r || a.__omnicamAsset || "";
  } catch {
  }
  t === "subject" && (e.cardMedia = a);
}
function ls(e, t, { signal: a, timeout: o = 15e3 } = {}) {
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
async function ds(e, t, a, o = () => !0, r = null) {
  if (!t || !a) return;
  const n = () => !e.disposed && o(), i = String(t.asset || a).toLowerCase();
  if (r ?? /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/.test(i)) {
    const l = document.createElement("video");
    if (l.src = a, l.loop = !0, l.muted = !0, l.playsInline = !0, await ls(l, ["loadeddata", "error"], { signal: e.abortController?.signal }).catch(() => {
    }), !n()) {
      xo(l);
      return;
    }
    if (await l.play().catch(() => {
    }), !n()) {
      xo(l);
      return;
    }
    qe(e, t.id, l, !0, t.asset || a);
  } else {
    const l = new Image();
    if (l.src = a, await l.decode().catch(() => {
    }), !n()) {
      l.src = "";
      return;
    }
    qe(e, t.id, l, !0, t.asset || a);
  }
  return e.disposed ? null : (e.render(), e.cardMediaById.get(t.id) || null);
}
async function pf(e, t) {
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
function ff(e) {
  const t = (e.assetRestoreGeneration || 0) + 1;
  e.assetRestoreGeneration = t;
  const a = () => !e.disposed && e.assetRestoreGeneration === t;
  if (e.state.viewport_bg_image) {
    const o = new Image();
    o.src = De(e.state.viewport_bg_image), o.decode().catch(() => {
    }), e.viewportBgImage = o;
  }
  e.viewportBgSequenceImages = (e.state.viewport_bg_sequence || []).map((o) => {
    const r = new Image();
    return r.src = De(o), r.decode().catch(() => {
    }), r;
  });
  for (const o of e.state.objects) {
    if (!o.asset) {
      (o.type === "model" || o.type === "glb") && (o.load_error = s("Not saved to the ComfyUI input folder: this model will be missing after a reload.")), o.type === "card" && Nt(e, o.id);
      continue;
    }
    const r = De(o.asset);
    o.type === "glb" || o.type === "model" ? e.modelUrlsById.set(o.id, r) : o.type === "card" && e.cardMediaAssetById?.get?.(o.id) !== o.asset && e.loadMediaUrl(o, r, a);
  }
}
function hf(e, t) {
  e.modelInfoById.set(t.id, t);
  const a = e.state.objects.find((o) => o.id === t.id);
  if (t.error) {
    a && (a.load_error = t.error), e.setStatus(`⚠️ ${t.error}`), e.refreshObjects(), t.id === e.selectedObjectId && e.refreshInspector();
    return;
  }
  a && (a.load_error = null), a?.animation_index && e.webgl?.selectAnimation(t.id, a.animation_index), t.id === e.selectedObjectId && e.refreshInspector(), !t.meshes && !t.points && t.bones ? e.setStatus(s(`${t.format.toUpperCase()} animation only: ${t.bones} bones, no mesh · skeleton preview`)) : e.setStatus(s(`${t.format.toUpperCase()} loaded: ${t.meshes} mesh${t.meshes === 1 ? "" : "es"}, ${t.vertices} vertices`));
}
async function uf(e, t) {
  if (!t) return;
  const a = t.name.split(".").pop()?.toLowerCase();
  if (!["glb", "obj", "fbx", "stl", "ply"].includes(a)) return e.setStatus(s("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first."));
  const o = Lt(t, a === "fbx" ? "fbx" : "model");
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
    const c = await cr(ct, { route: "/majoor/omnicam/upload_model", field: "asset", file: t });
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
async function bf(e, t) {
  if (!t) return;
  const a = Lt(t, "card");
  if (a) return e.setStatus(a);
  const o = e.selectedObject()?.type === "card" ? e.selectedObject() : e.state.objects.find((r) => r.id === "subject");
  if (o) {
    if (e.checkpoint?.("Replace card media"), e.cardUrl = e.objectUrls.replace(o.id, t), t.type.startsWith("video/")) {
      const r = document.createElement("video");
      if (r.src = e.cardUrl, r.loop = !0, r.muted = !0, r.playsInline = !0, await r.play().catch(() => {
      }), e.disposed) {
        xo(r);
        return;
      }
      qe(e, o.id, r, !0, e.cardUrl);
    } else {
      const r = new Image();
      if (r.src = e.cardUrl, await r.decode().catch(() => {
      }), e.disposed) {
        r.src = "";
        return;
      }
      qe(e, o.id, r, !0, e.cardUrl);
    }
    e.render(), e.setStatus(s("Uploading card…"));
    try {
      const r = await cr(ct, { route: "/majoor/omnicam/upload_asset", field: "asset", file: t });
      if (e.disposed || !e.state.objects.includes(o)) return;
      o.asset = r.path, e.cardMediaAssetById?.set?.(o.id, r.path), o.id === "subject" && (e.state.card_asset = r.path, e.cardWidget && (e.cardWidget.value = r.path)), e.serialize(), e.setStatus(s(`Card: ${r.name}`));
    } catch (r) {
      if (e.disposed || !e.state.objects.includes(o)) return;
      console.error(r), e.setStatus(s("Card loaded locally; backend upload failed"));
    }
  }
}
function gf(e, t) {
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
  e.state.reference_index = Y(e.state.reference_index || 0, 0, e.executionReferences.length - 1), a.value = String(e.state.reference_index), e.serialize(), e.loadSelectedReference();
}
function yf(e) {
  const t = e.executionReferences[e.state.reference_index];
  if (!t) return;
  const a = new Image();
  a.onload = () => {
    e.disposed || (qe(e, "subject", a, !1, a.src), e.render(), e.setStatus(s("Upstream media refreshed")));
  }, a.src = ct.apiURL(`/view?${new URLSearchParams(t).toString()}`);
}
async function vf(e) {
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
    const h = el(t, f.link);
    if (h) {
      if (d === "image" || d === "video") {
        c = !0;
        const u = h.widgets?.find(
          (b) => ["image", "image_path", "upload", "file", "filename", "video", "video_path"].includes(String(b.name).toLowerCase())
        );
        if (u && u.value) {
          const b = String(u.value), y = /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(b), g = h.widgets?.find((x) => String(x.name).toLowerCase() === "subfolder")?.value || "", v = De(at(b, g)), S = e.state.objects.find((x) => x.id === "subject");
          if (S) {
            const x = await ds(e, S, v, r, y);
            if (!r()) return;
            S.asset = at(b, g);
            let E = null;
            if (y)
              try {
                E = await pf(b, o.signal);
              } catch (M) {
                if (M?.name === "AbortError") return;
                console.warn("Failed to describe upstream video:", M);
              }
            r() && an(e, x, {
              fps: E?.fps,
              frameCount: y ? E?.frame_count : 1
            }), e.upstreamImageConnected = !0, n = !0, e.setStatus(s(`Upstream ${y ? "video" : "image"}: ${b}`));
          }
        } else {
          const b = tl(h);
          b && (b instanceof HTMLVideoElement && b.paused && b.play().catch(() => {
          }), qe(e, "subject", b, !1, b.currentSrc || b.src || ""), an(e, b, { frameCount: b instanceof HTMLVideoElement ? 0 : 1 }), e.upstreamImageConnected = !0, n = !0, e.render(), e.setStatus(b instanceof HTMLVideoElement ? s("Upstream video preview synced") : s("Upstream image preview synced")));
        }
      }
      if (d === "audio") {
        l = !0;
        const u = h.widgets?.find(
          (b) => ["audio", "audio_path", "audio_file", "file", "filename"].includes(String(b.name).toLowerCase())
        );
        if (u && u.value) {
          const b = String(u.value), y = h.widgets?.find((v) => String(v.name).toLowerCase() === "subfolder")?.value || "", g = De(at(b, y));
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
        const u = h.widgets?.find(
          (b) => ["model_file", "model", "file", "filename", "filepath", "mesh", "scene", "3d_file"].includes(String(b.name).toLowerCase())
        );
        if (u && u.value) {
          const b = String(u.value), y = b.split(".").pop()?.toLowerCase();
          if (["glb", "gltf", "obj", "fbx", "stl", "ply"].includes(y)) {
            const g = h.widgets?.find((E) => String(E.name).toLowerCase() === "subfolder")?.value || "", v = De(at(b, g)), S = `upstream_scene_${h.id}`;
            p.add(S);
            let x = e.state.objects.find((E) => E.id === S);
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
    Nt(e, "subject");
    const f = e.state.objects.find((d) => d.id === "subject");
    f && (f.asset = ""), e.upstreamImageConnected = !1, n = !0, e.setStatus(s("Upstream image disconnected · card reset"));
  }
  !l && e.upstreamAudioConnected && (vo(e), e.upstreamAudioConnected = !1, e.refreshKeys(), n = !0, e.setStatus(s("Upstream audio disconnected · audio track cleared")));
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
  Ac(e) && (n = !0), n && (e.serialize(), e.render());
}
const xf = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"], nn = { low: 3e6, balanced: 6e6, high: 12e6 };
function wf(e) {
  return nn[e] || nn.balanced;
}
async function kf({
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
    for (const S of xf)
      if (!(n.isTypeSupported && !n.isTypeSupported(S)))
        try {
          f = new n(m, { mimeType: S, videoBitsPerSecond: wf(r) });
          break;
        } catch {
        }
    if (!f) throw new Error("Cannot create MediaRecorder");
    const d = [];
    f.ondataavailable = (S) => {
      S.data.size && d.push(S.data);
    };
    const h = new Promise((S, x) => {
      f.addEventListener("stop", S, { once: !0 }), f.addEventListener("error", () => x(f.error || new Error("MediaRecorder failed")), { once: !0 });
    });
    f.start(100);
    const u = c();
    for (let S = 0; S < a; S++) {
      if (i?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await o(S), await l(1e3 / t);
    }
    f.stop(), await h;
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
    const v = new Blob(d, { type: f.mimeType || "video/webm" });
    return Jp(v, g);
  } finally {
    f?.state === "recording" && f.stop(), m.getTracks().forEach((d) => d.stop());
  }
}
async function Sf(e, t) {
  const a = t.type.startsWith("video/mp4") ? "mp4" : "webm", o = new FormData();
  o.append("video", t, `omnicam_playblast.${a}`);
  const r = await e.fetchApi("/majoor/omnicam/upload_playblast", { method: "POST", body: o });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function jf(e) {
  await Promise.all([...e].filter((t) => t instanceof HTMLVideoElement && t.seeking).map((t) => ls(t, ["seeked", "error"], { timeout: 5e3 }).catch(() => {
  })));
}
async function ms(e) {
  await jf(e.cardMediaById.values());
}
async function ps(e) {
  return kf({
    canvas: e.canvas,
    fps: e.state.fps,
    frameCount: e.state.duration_frames,
    quality: e.state.playblast_quality,
    renderFrame: (t) => e.setFrame(t, !0),
    signal: e.abortController?.signal
  });
}
async function fs(e, t) {
  const a = await Sf(Ye, t);
  if (ef(e, t), e.state.playblast_camera_id === _n)
    e.state.sequence = { ...e.state.sequence || {}, recording_path: a.path };
  else {
    const o = e.state.cameras.find((r) => r.id === e.state.playblast_camera_id);
    o && (o.recording_path = a.path);
  }
  e.recordingWidget && (e.recordingWidget.value = a.path), e.serialize(), e.setStatus(s(`Playblast ready: ${a.name}`));
}
function Cf(e) {
  const t = { width: e.canvas.width, height: e.canvas.height }, a = e.state.playblast_resolution || "output";
  if (a === "viewport") return t;
  const o = a === "half" ? 0.5 : a === "double" ? 2 : 1, r = Math.max(16, Math.round(Number(e.state.width) || t.width)), n = Math.max(16, Math.round(Number(e.state.height) || t.height)), c = Math.min(o, 3840 / Math.max(r * o, n * o)), l = (p) => Math.max(2, Math.round(p * c / 2) * 2);
  return { width: l(r), height: l(n) };
}
async function _f(e) {
  if (e.recording) return;
  e.stopPlay(), e.recording = !0, e.root.classList.add("recording"), e.setStatus(s("Encoding deterministic proxy…"));
  const t = e.frame, a = e.canvas.width, o = e.canvas.height, r = Cf(e);
  (r.width !== e.canvas.width || r.height !== e.canvas.height) && (e.canvas.width = r.width, e.canvas.height = r.height, e.render());
  try {
    let n = null;
    const i = e.root.querySelector('[data-role="encoder"]').value, { encodeDeterministicPlayblast: c, supportsDeterministicEncoding: l } = await import("./chunk-BzKt9Ia2.js");
    i !== "realtime" && await l(e.canvas.width, e.canvas.height) && (n = await c(e.canvas, e.state.duration_frames, e.state.fps, async (p) => {
      e.setFrame(p, !0), e.setStatus(s(`Encoding frame ${p + 1}/${e.state.duration_frames}…`)), await ms(e), await new Promise((m) => requestAnimationFrame(m));
    }, e.abortController?.signal, e.state.playblast_quality)), n || (e.setStatus(s("WebCodecs unavailable; recording realtime fallback…")), n = await ps(e)), e.setFrame(t), await fs(e, n);
  } catch (n) {
    console.error(n), e.setStatus(s(`Playblast failed: ${n.message || n}`));
  } finally {
    e.recording = !1, e.root.classList.remove("recording"), (e.canvas.width !== a || e.canvas.height !== o) && (e.canvas.width = a, e.canvas.height = o), e.resizeCanvas?.(), e.setFrame(t);
  }
}
let Pt = null;
function Ef({ api: e }) {
  Pt = e;
}
async function hs(e) {
  if (!Pt) throw new Error("ComfyUI API is unavailable");
  return cr(Pt, { route: "/majoor/omnicam/upload_asset", field: "asset", file: e });
}
async function wo(e) {
  const t = e.map((a) => String(a.relative || "").replace(/^omnicam\//, "")).filter(Boolean);
  if (!(!t.length || !Pt))
    try {
      await Pt.fetchApi("/majoor/omnicam/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: t })
      });
    } catch {
    }
}
function br(e) {
  return e.backgroundRequestId = (e.backgroundRequestId || 0) + 1, e.backgroundRequestId;
}
async function $f(e, t) {
  if (!t) return;
  const a = Lt(t, "image");
  if (a) {
    e.setStatus(a);
    return;
  }
  const o = br(e);
  let r = null;
  try {
    if (e.setStatus(`Uploading background: ${t.name}`), r = await hs(t), o !== e.backgroundRequestId || e.disposed) {
      await wo([r]);
      return;
    }
    const n = De(r.path);
    e.checkpoint?.("Set background image"), e.state.viewport_bg_image = r.path, e.state.viewport_bg_sequence = [];
    const i = new Image();
    i.src = n, await i.decode().catch(() => {
    }), e.viewportBgImage = i, e.serialize(), e.render(), e.setStatus(`Background image set: ${t.name}`);
  } catch (n) {
    if (r && await wo([r]), o !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG image: ${n.message || n}`);
  }
}
async function Mf(e, t) {
  if (!t || !t.length) return;
  const a = af(t.length);
  if (a) {
    e.setStatus(a);
    return;
  }
  const o = Array.from(t).map((i) => Lt(i, "image")).find(Boolean);
  if (o) {
    e.setStatus(o);
    return;
  }
  const r = br(e);
  t.sort((i, c) => i.name.localeCompare(c.name, void 0, { numeric: !0, sensitivity: "base" }));
  const n = [];
  try {
    e.setStatus(`Uploading background sequence: ${t.length} frames`);
    for (const c of t)
      if (n.push(await hs(c)), r !== e.backgroundRequestId || e.disposed) {
        await wo(n);
        return;
      }
    const i = n.map((c) => c.path);
    e.checkpoint?.("Set background sequence"), e.state.viewport_bg_sequence = i, e.state.viewport_bg_image = "", e.viewportBgImage = null, e.viewportBgSequenceImages = i.map((c) => {
      const l = new Image();
      return l.src = De(c), l.decode().catch(() => {
      }), l;
    }), e.serialize(), e.render(), e.setStatus(`Background sequence loaded: ${t.length} frames`);
  } catch (i) {
    if (await wo(n), r !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG sequence: ${i.message || i}`);
  }
}
function Af(e) {
  br(e), e.checkpoint?.("Clear background"), e.state.viewport_bg_image = "", e.state.viewport_bg_sequence = [], e.viewportBgImage = null, e.viewportBgSequenceImages = [], e.serialize(), e.render(), e.setStatus("Background cleared");
}
function Tf(e) {
  const t = Ro(e.state?.metadata?.viewport_labels);
  if (t.mode === "off") return;
  const a = Array.isArray(e.state?.objects) ? e.state.objects : [], o = e.viewportCamera(), r = e.ctx, n = e.canvas.width, i = e.canvas.height, c = Y(i / 720, 0.75, 4), l = Number(e.frame) || 0, p = e.selectedObjectIds instanceof Set ? e.selectedObjectIds : /* @__PURE__ */ new Set();
  r.save(), r.font = `${Math.round(12 * c)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`, r.textBaseline = "alphabetic";
  for (const m of a) {
    if (m.enabled === !1 || !yn(m, { mode: t.mode, selectedIds: p })) continue;
    const f = vn(m, t.content);
    if (!f) continue;
    const d = xn(a, m, l) || { position: m.position, size: m.size }, h = ze(wn(d, m.type), o, n, i);
    if (!h) continue;
    const [u, b] = h, y = t.content === "annotation" && m.annotation?.color || "", g = 6 * c, v = 4 * c, x = r.measureText(f).width + g * 2, E = 12 * c + v * 2, M = Math.round(u - x / 2), K = Math.round(b - E - 6 * c);
    r.fillStyle = "rgba(16,17,22,0.82)", If(r, M, K, x, E, 4 * c), r.fill(), y && (r.strokeStyle = y, r.lineWidth = Math.max(1, c), r.stroke()), r.fillStyle = y || "#e6e6ec", r.fillText(f, M + g, K + E - v - 2 * c);
  }
  r.restore();
}
function If(e, t, a, o, r, n) {
  if (typeof e.roundRect == "function") {
    e.beginPath(), e.roundRect(t, a, o, r, n);
    return;
  }
  const i = Math.min(n, o / 2, r / 2);
  e.beginPath(), e.moveTo(t + i, a), e.arcTo(t + o, a, t + o, a + r, i), e.arcTo(t + o, a + r, t, a + r, i), e.arcTo(t, a + r, t, a, i), e.arcTo(t, a, t + o, a, i), e.closePath();
}
function ie(e, t, a, o = "#5a5a5a", r = 1) {
  const n = e.viewportCamera(), i = ze(t, n, e.canvas.width, e.canvas.height), c = ze(a, n, e.canvas.width, e.canvas.height);
  !i || !c || (e.ctx.strokeStyle = o, e.ctx.lineWidth = r, e.ctx.beginPath(), e.ctx.moveTo(i[0], i[1]), e.ctx.lineTo(c[0], c[1]), e.ctx.stroke());
}
function Pf(e) {
  for (let t = -60; t <= 60; t += 1) {
    const a = t === 0, o = a ? "#6f6f6f" : "#353535";
    ie(e, [t, 0, -60], [t, 0, 60], o, a ? 1.6 : 1), ie(e, [-60, 0, t], [60, 0, t], o, a ? 1.6 : 1);
  }
}
function Of(e) {
  const t = e.state.point_density || "balanced", a = e.state.point_spread || "all_views", o = e.state.point_color || null, r = `${t}|${a}|${o}`;
  return e._pointFieldCache?.key !== r && (e._pointFieldCache = { key: r, ...Ui(t, a, o) }), e._pointFieldCache;
}
const zf = 600;
function Ff(e) {
  const { points: t, colors: a } = Of(e);
  if (!t.length) return;
  const o = e.viewportCamera(), r = e.canvas.width, n = e.canvas.height, i = t.length / 3, c = 3 * Math.max(1, Math.ceil(i / zf)), l = /* @__PURE__ */ new Map();
  for (let p = 0; p < t.length; p += c) {
    const m = ze([t[p], t[p + 1], t[p + 2]], o, r, n);
    if (!m) continue;
    const f = Y(Math.round(5 / Math.sqrt(m[2])), 1, 4), d = `${Math.round(a[p] * 255)},${Math.round(a[p + 1] * 255)},${Math.round(a[p + 2] * 255)}|${f}`;
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
function Lf(e, t) {
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
function Nf(e, t) {
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
function Kf(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], n = t.size?.[1] || 1.8, i = (t.size?.[0] || 0.7) * 0.5, c = [a, o + n * 0.88, r], l = [a, o + n * 0.76, r], p = [a - i * 0.55, o + n * 0.73, r], m = [a + i * 0.55, o + n * 0.73, r], f = [a - i * 0.72, o + n * 0.52, r], d = [a + i * 0.72, o + n * 0.52, r], h = [a - i * 0.82, o + n * 0.34, r], u = [a + i * 0.82, o + n * 0.34, r], b = [a, o + n * 0.44, r], y = [a - i * 0.28, o + n * 0.44, r], g = [a + i * 0.28, o + n * 0.44, r], v = [a - i * 0.28, o + n * 0.22, r], S = [a + i * 0.28, o + n * 0.22, r], x = [a - i * 0.28, o, r + 0.05], E = [a + i * 0.28, o, r + 0.05];
  ie(e, c, l, "#aaa", 2), ie(e, l, b, "#aaa", 2), ie(e, p, m, "#aaa", 2), ie(e, p, f, "#aaa", 2), ie(e, f, h, "#aaa", 2), ie(e, m, d, "#aaa", 2), ie(e, d, u, "#aaa", 2), ie(e, y, g, "#aaa", 2), ie(e, y, v, "#aaa", 2), ie(e, v, x, "#aaa", 2), ie(e, g, S, "#aaa", 2), ie(e, S, E, "#aaa", 2);
  const M = ze(c, e.viewportCamera(), e.canvas.width, e.canvas.height);
  M && (e.ctx.strokeStyle = "#aaa", e.ctx.beginPath(), e.ctx.arc(M[0], M[1], Y(28 / M[2], 3, 12), 0, Math.PI * 2), e.ctx.stroke());
}
function Rf(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], [n, i, c] = t.size || [1.5, 1.5, 1.5], l = n * 0.5, p = (c || n) * 0.5, m = i * 0.5, f = 12, d = [], h = [];
  for (let u = 0; u < f; u++) {
    const b = u / f * Math.PI * 2, y = Math.cos(b) * l, g = Math.sin(b) * p;
    d.push([a + y, o + m, r + g]), h.push([a + y, o - m, r + g]);
  }
  for (let u = 0; u < f; u++) {
    const b = (u + 1) % f;
    ie(e, d[u], d[b], "#aaa", 1.5), ie(e, h[u], h[b], "#aaa", 1.5);
  }
  for (let u = 0; u < f; u += 3)
    ie(e, d[u], h[u], "#aaa", 1.5);
}
function Df(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], [n, i, c] = t.size || [1.5, 1.5, 1.5], l = n * 0.5, p = n * 0.18, m = 16, f = [], d = [];
  for (let h = 0; h < m; h++) {
    const u = h / m * Math.PI * 2, b = Math.cos(u), y = Math.sin(u);
    f.push([a + b * (l + p), o, r + y * (l + p)]), d.push([a + b * (l - p), o, r + y * (l - p)]);
  }
  for (let h = 0; h < m; h++) {
    const u = (h + 1) % m;
    ie(e, f[h], f[u], "#aaa", 1.5), ie(e, d[h], d[u], "#aaa", 1.5), h % 4 === 0 && ie(e, f[h], d[h], "#888", 1);
  }
}
function qf(e, t) {
  const a = t.position || [0, 1, 0], o = 0.25;
  ie(e, Ke(a, [-o, 0, 0]), Ke(a, [o, 0, 0]), "#bbb", 2), ie(e, Ke(a, [0, -o, 0]), Ke(a, [0, o, 0]), "#bbb", 2), ie(e, Ke(a, [0, 0, -o]), Ke(a, [0, 0, o]), "#bbb", 2);
}
function Bf(e, t) {
  const [a, o, r] = t.position || [0, 1.5, 0], [n, i] = t.size || [2, 3], c = e.viewportCamera(), l = [
    [a - n / 2, o - i / 2, r],
    [a + n / 2, o - i / 2, r],
    [a + n / 2, o + i / 2, r],
    [a - n / 2, o + i / 2, r]
  ].map((y) => ze(y, c, e.canvas.width, e.canvas.height));
  if (l.some((y) => !y)) return;
  const p = l.map((y) => y[0]), m = l.map((y) => y[1]), f = Math.min(...p), d = Math.max(...p), h = Math.min(...m), u = Math.max(...m);
  e.ctx.save(), e.ctx.beginPath(), e.ctx.moveTo(l[0][0], l[0][1]);
  for (let y = 1; y < 4; y++) e.ctx.lineTo(l[y][0], l[y][1]);
  e.ctx.closePath(), e.ctx.clip();
  const b = e.cardMediaById.get(t.id) || (t.id === "subject" ? e.cardMedia : null);
  if (b)
    try {
      const y = Math.max(1, d - f), g = Math.max(1, u - h), v = b.videoWidth || b.naturalWidth || b.width, S = b.videoHeight || b.naturalHeight || b.height, x = e.state.card_fit || "contain";
      if (e.ctx.fillStyle = "#111", e.ctx.fillRect(f, h, y, g), x === "stretch" || !v || !S)
        e.ctx.drawImage(b, f, h, y, g);
      else if (x === "contain") {
        const E = Math.min(y / v, g / S), M = v * E, K = S * E;
        e.ctx.drawImage(b, f + (y - M) / 2, h + (g - K) / 2, M, K);
      } else {
        const E = Math.max(y / v, g / S), M = y / E, K = g / E;
        e.ctx.drawImage(b, (v - M) / 2, (S - K) / 2, M, K, f, h, y, g);
      }
    } catch {
    }
  else
    e.ctx.fillStyle = "#3a414b", e.ctx.fillRect(f, h, d - f, u - h), e.ctx.fillStyle = "#d8d8d8", e.ctx.textAlign = "center", e.ctx.font = `${Math.max(12, Math.min(28, (d - f) * 0.08))}px system-ui`, e.ctx.fillText("SUBJECT CARD", (f + d) / 2, (h + u) / 2);
  e.ctx.restore(), e.ctx.strokeStyle = "#b3b8c1", e.ctx.lineWidth = 2, e.ctx.beginPath(), e.ctx.moveTo(l[0][0], l[0][1]);
  for (let y = 1; y < 4; y++) e.ctx.lineTo(l[y][0], l[y][1]);
  e.ctx.closePath(), e.ctx.stroke();
}
function Wf(e) {
  const t = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
  (e.state.cameras || []).forEach((a, o) => {
    const r = a.keyframes || [], n = a.color || t[o % t.length], i = a.id === e.state.active_camera_id;
    if (!(i && e.state.view_mode === "camera")) {
      if (r.length >= 2)
        for (let c = 0; c < r.length - 1; c++)
          ie(e, r[c].camera.position, r[c + 1].camera.position, n, i ? 2.2 : 1.2);
      for (const c of r) {
        const l = ze(c.camera.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        l && (e.ctx.fillStyle = c.frame === e.frame ? "#f2d06b" : n, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], i ? 4.5 : 3.5, 0, Math.PI * 2), e.ctx.fill());
      }
      if (e.state.view_mode !== "camera") {
        const c = Ce(a, e.frame, e.state.objects), l = ze(c.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        l && (e.ctx.fillStyle = i ? "#f2d06b" : n, e.ctx.beginPath(), e.ctx.arc(l[0], l[1], i ? 6.5 : 4.5, 0, Math.PI * 2), e.ctx.fill()), c.target && ie(e, c.position, c.target, `${n}88`, 1);
      }
    }
  });
}
function Vf(e) {
  if (e.state.keyframes.length < 2) return;
  const t = [];
  for (let o = 0; o < e.state.keyframes.length - 1; o++) {
    const r = e.state.keyframes[o], n = e.state.keyframes[o + 1];
    t.push(Sn(jn(n.camera.position, r.camera.position)) * e.state.fps / Math.max(1, n.frame - r.frame));
  }
  const a = Math.max(...t, 1e-6);
  for (let o = 0; o < t.length; o++) {
    const r = 120 * (1 - t[o] / a);
    ie(e, e.state.keyframes[o].camera.position, e.state.keyframes[o + 1].camera.position, `hsl(${r} 85% 55%)`, 5);
  }
}
function Uf(e) {
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  if (!e.recording && e.state.view_mode === "camera" && e.state.guides !== !1) {
    t.save(), t.strokeStyle = "#ffffff33", t.lineWidth = 1, t.beginPath();
    for (const r of [a / 3, 2 * a / 3])
      t.moveTo(r, 0), t.lineTo(r, o);
    for (const r of [o / 3, 2 * o / 3])
      t.moveTo(0, r), t.lineTo(a, r);
    t.moveTo(a / 2 - 14, o / 2), t.lineTo(a / 2 + 14, o / 2), t.moveTo(a / 2, o / 2 - 14), t.lineTo(a / 2, o / 2 + 14), t.stroke(), t.restore();
  }
  if (!e.recording && e.state.view_mode === "camera" && e.state.safe_areas && (t.save(), t.strokeStyle = "#00d2d388", t.lineWidth = 1, t.setLineDash([4, 4]), t.strokeRect(a * 0.05, o * 0.05, a * 0.9, o * 0.9), t.strokeStyle = "#feca5788", t.strokeRect(a * 0.1, o * 0.1, a * 0.8, o * 0.8), t.restore()), !e.recording && e.state.view_mode === "camera" && Tc(t, e.state, a, o), !e.recording && e.state.show_gizmo)
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
      _m(e, t, a, o);
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
  e.recording && e.state.playblast_labels && Tf(e);
}
async function Hf(e, { signal: t } = {}) {
  if (!e?.fetchApi) throw new TypeError("A ComfyUI API client is required");
  const a = await e.fetchApi("/majoor/omnicam/capabilities", { signal: t });
  if (!a.ok) throw new Error(`Capabilities request failed (${a.status || "unknown"})`);
  return a.json();
}
function Gf(e) {
  const t = Array.isArray(e) ? e : [];
  if (!t.length) return { tone: "ok", label: "Core ready" };
  const a = t.length;
  return {
    tone: t.some((o) => o?.severity === "error") ? "error" : "warn",
    label: a === 1 ? "1 optional adapter issue" : `${a} optional adapter issues`
  };
}
async function Yf(e) {
  const t = e.root.querySelector('[data-role="setup-badge"]'), a = e.root.querySelector('[data-role="setup-issues"]');
  if (!t || !a) return;
  let o;
  try {
    o = await Hf(Ye);
  } catch {
    return;
  }
  e.adapterCapabilities = o;
  const r = o.diagnostic?.issues || [], n = Gf(r);
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
function us(e, t, a = null, o = null) {
  const r = Array.isArray(e) ? e : [];
  return r.find((n) => n.frame === t) || (a !== null ? r.find((n) => n.frame === a) : null) || (o !== null ? r.find((n) => n.frame === o) : null) || null;
}
function gr(e, t) {
  return (t || e.activeCameraTrack?.())?.target_object_id || e.state.target_object_id || null;
}
function yr(e, t) {
  const a = t || e.activeCameraTrack?.(), o = a?.aim_bone ?? (a?.id === e.state.active_camera_id ? e.state.aim_bone : null);
  return typeof o == "string" && o ? o : null;
}
function Xf(e, t = gr(e)) {
  if (!t) return [];
  const a = e.state.objects.find((o) => o.id === t);
  return !a || a.type !== "model" && a.type !== "glb" ? [] : e.webgl?.listObjectBones?.(t) || [];
}
function bs(e, t, a) {
  const o = gr(e, t), r = yr(e, t);
  if (!o || !r) return null;
  const n = e.state.objects.find((p) => p.id === o);
  if (!n || n.enabled === !1) return null;
  const i = e.webgl?.sampleModelPoint?.(o, r, a, e.state.fps || 24);
  if (!i) return null;
  const l = (t || e.activeCameraTrack?.())?.target_offset || e.state.target_offset || [0, 0, 0];
  return [i[0] + (l[0] || 0), i[1] + (l[1] || 0), i[2] + (l[2] || 0)];
}
function Zf(e, t, a) {
  const o = t.type === "model" || t.type === "glb" ? e.webgl?.sampleModelPoint?.(t.id, null, a, e.state.fps || 24) : null;
  return o || (t.keyframes?.length ? So(t, a).position : t.position || [0, 1.5, 0]);
}
function Mt(e, t, a, o) {
  if (!a) return a;
  const r = bs(e, t, o);
  return r && (a.target = r), a;
}
function Jf(e, t) {
  const a = t || null;
  e.checkpoint("Change aim bone");
  const o = e.activeCameraTrack();
  o.aim_bone = a, o.id === e.state.active_camera_id && (e.state.aim_bone = a), e.setFrame(e.frame), e.serialize(), e.refreshInspector(), e.render(), e.setStatus(a ? s("Aiming at bone {bone}").replace("{bone}", a) : s("Aiming at the whole object"));
}
function Qf(e, { perFrame: t = !1 } = {}) {
  const a = e.activeCameraTrack(), o = gr(e, a), r = yr(e, a);
  if (!o || !r) return e.bakeAimToKeyframes();
  const n = e.state.objects.find((c) => c.id === o);
  if (!n || !a.keyframes?.length) return;
  e.checkpoint(t ? "Bake aim per frame" : "Bake aim to keyframes");
  const i = (c) => bs(e, a, c) || Zf(e, n, c);
  if (t) {
    const c = a.keyframes[0].frame, l = a.keyframes[a.keyframes.length - 1].frame, p = new Map(a.keyframes.map((m) => [m.frame, m]));
    for (let m = c; m <= l; m++) {
      const d = p.get(m) || { frame: m, camera: Ce(a, m, e.state.objects), interpolation: "linear" };
      d.camera.target = [...i(m)], p.set(m, d);
    }
    a.keyframes = [...p.values()].sort((m, f) => m.frame - f.frame);
  } else
    for (const c of a.keyframes) c.camera.target = [...i(c.frame)];
  a.id === e.state.active_camera_id && (e.state.keyframes = a.keyframes), e.setFrame(e.frame), e.serialize(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Aim baked on bone {bone} ({count} keys)").replace("{bone}", r).replace("{count}", String(a.keyframes.length)));
}
function eh(e) {
  const t = e.root?.querySelector('[data-role="camera-aim-bone-row"]'), a = e.root?.querySelector('[data-role="camera-aim-bone"]');
  if (!a) return;
  const o = Xf(e);
  t && (t.hidden = o.length === 0);
  const r = yr(e) || "";
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
function th(e, t, a) {
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
function gs(e) {
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
  const r = (d, h, u, b, y = "") => {
    const g = document.createElement("button");
    return g.type = "button", g.className = "scene-action-btn", u && (g.style.cssText = y || "color:#f59e0b;border-color:#78350f;background:rgba(245,158,11,0.15)"), g.title = s(h), g.innerHTML = `<i class="pi ${d}" style="font-size:10px"></i>`, g.addEventListener("click", (v) => {
      v.stopPropagation(), b(v);
    }), g;
  }, n = (e.outlinerFilter || "").trim().toLowerCase(), i = (d) => !n || String(d || "").toLowerCase().includes(n), c = (d, h, u) => {
    const b = !!(e.outlinerCollapsedSections?.has(u) && !n), y = document.createElement("div");
    return y.className = "scene-section-header", y.dataset.section = u, y.innerHTML = `
      <i class="pi ${b ? "pi-chevron-right" : "pi-chevron-down"}" style="font-size:9px;color:var(--oc-text-dim)"></i>
      <span class="scene-section-title">${d}</span>
      <span class="scene-section-count">(${h})</span>
    `, y.addEventListener("click", () => {
      e.outlinerCollapsedSections ||= /* @__PURE__ */ new Set(), e.outlinerCollapsedSections.has(u) ? e.outlinerCollapsedSections.delete(u) : e.outlinerCollapsedSections.add(u), gs(e);
    }), { header: y, isCollapsed: b };
  }, l = (d) => ["sun_light", "point_light", "spot_light"].includes(d), p = a === "all" || a === "cameras" || a === "hidden" && e.state.cameras.some((d) => d.muted), m = a === "all" || a === "objects" || a === "lights" || a === "hidden" && e.state.objects.some((d) => d.enabled === !1);
  if (p) {
    const d = e.state.cameras.filter((b) => !(!i(b.name) || a === "hidden" && !b.muted)), { header: h, isCollapsed: u } = c(s("Cameras"), d.length, "cameras");
    if (t.appendChild(h), !u)
      for (const b of d) {
        const y = document.createElement("div");
        y.role = "button", y.tabIndex = 0, y.dataset.cameraId = b.id;
        const g = b.id === e.state.active_camera_id, v = b.id === e.state.playblast_camera_id, S = e.selectedEntity === "camera" && g;
        y.setAttribute("aria-selected", String(S)), y.className = `scene-item${S ? " selected" : ""}${g && !S ? " active-view" : ""}`;
        const x = document.createElement("i");
        x.className = "pi pi-video", x.style.cssText = "color:#60a5fa";
        const E = document.createElement("span");
        if (E.className = "scene-item-label", S || g) {
          const P = document.createElement("span");
          P.style.cssText = `color:${S ? "#f59e0b" : "#58cc6b"};font-weight:700`, P.textContent = S ? "● " : "○ ", E.appendChild(P);
        }
        if (E.appendChild(document.createTextNode(b.name)), v) {
          const P = document.createElement("span");
          P.style.cssText = "color:#f2d06b;font-size:10px", P.title = "Playblast Output", P.textContent = " ★", E.appendChild(P);
        }
        if (b.muted) {
          const P = document.createElement("span");
          P.style.opacity = ".6", P.textContent = " (muted)", E.appendChild(P);
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
        )), M.appendChild(r("pi-ellipsis-v", "Camera actions", !1, (P) => e.openCameraContext(P, b.id, !1))), y.append(x, E, M), y.title = S ? s("Currently selected for editing") : v ? s("Active playblast camera") : s("Click to select & activate this camera");
        const K = () => {
          e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(b.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Camera: ${b.name}`));
        };
        y.addEventListener("contextmenu", (P) => {
          P.preventDefault(), P.stopPropagation(), e.openCameraContext(P, b.id, !1);
        }), y.addEventListener("keydown", (P) => {
          (P.key === "Enter" || P.key === " ") && (P.preventDefault(), K());
        }), t.appendChild(y);
      }
  }
  if (m) {
    const d = new Map(e.state.objects.map((x) => [x.id, x])), h = /* @__PURE__ */ new Map(), u = [];
    for (const x of e.state.objects)
      x.parent_id && d.has(x.parent_id) ? (h.has(x.parent_id) || h.set(x.parent_id, []), h.get(x.parent_id).push(x)) : u.push(x);
    const b = [], y = (x, E) => {
      b.push({ object: x, level: E });
      const M = h.get(x.id) || [];
      for (const K of M) y(K, E + 1);
    };
    for (const x of u) y(x, 0);
    const g = b.filter(({ object: x }) => {
      const E = [x.name, x.type, ...x.tags || [], x.asset_kind, x.asset_id].filter(Boolean).join(" ");
      return !(!i(E) || a === "lights" && !l(x.type) || a === "objects" && l(x.type) || a === "hidden" && x.enabled !== !1);
    }), { header: v, isCollapsed: S } = c(a === "lights" ? s("Lights") : s("Objects"), g.length, "objects");
    if (t.appendChild(v), !S)
      for (const { object: x, level: E } of g) {
        const M = document.createElement("div");
        M.role = "button", M.tabIndex = 0, M.dataset.objectId = x.id;
        const K = e.selectedEntity === "object" && (x.id === e.selectedObjectId || e.selectedObjectIds?.has?.(x.id)), P = e.selectedEntity === "object" && x.id === e.selectedObjectId;
        M.setAttribute("aria-selected", String(K)), M.className = `scene-item${K ? " selected" : ""}${P ? " primary" : ""}${E > 0 && !n ? " scene-item-child" : ""}`, E > 0 && !n && (M.style.paddingLeft = `${E * 16 + 6}px`);
        const G = x.type === "card" ? { icon: "pi-image", color: "#38bdf8" } : x.type === "model" || x.type === "glb" ? { icon: "pi-box", color: "#c084fc" } : x.type === "ground" ? { icon: "pi-minus", color: "#fbbf24" } : x.type === "cube" ? { icon: "pi-stop", color: "#fbbf24" } : x.type === "sphere" ? { icon: "pi-circle", color: "#fbbf24" } : x.type === "cylinder" ? { icon: "pi-database", color: "#fbbf24" } : x.type === "torus" ? { icon: "pi-circle", color: "#fbbf24" } : x.type === "pyramid" ? { icon: "pi-play", color: "#fbbf24" } : x.type === "sun_light" ? { icon: "pi-sun", color: "#f59e0b" } : x.type === "point_light" ? { icon: "pi-bolt", color: "#fbbf24" } : x.type === "spot_light" ? { icon: "pi-compass", color: "#38bdf8" } : x.type === "human" ? { icon: "pi-user", color: "#34d399" } : { icon: "pi-plus", color: "#94a3b8" }, B = x.enabled !== !1, U = !!x.load_error, re = document.createElement("i");
        re.className = `pi ${U ? "pi-exclamation-triangle" : G.icon}`, re.style.cssText = U ? "color:#f87171" : B ? `color:${G.color}` : "opacity:.4";
        const j = document.createElement("span");
        j.className = "scene-item-label";
        const O = document.createElement("span");
        O.style.cssText = U ? "color:#fca5a5" : B ? "" : "opacity:.5;text-decoration:line-through", O.textContent = x.name || x.type, O.title = s("Double-click to rename"), O.addEventListener("dblclick", ($) => {
          $.preventDefault(), $.stopPropagation(), th(e, x, O);
        }), j.appendChild(O);
        const q = Array.isArray(x.tags) ? x.tags : [];
        if (q.length) {
          const $ = document.createElement("span");
          $.className = "scene-item-tags";
          for (const W of q.slice(0, 2)) {
            const I = document.createElement("span");
            I.className = "scene-item-tag", I.textContent = W, $.appendChild(I);
          }
          if (q.length > 2) {
            const W = document.createElement("span");
            W.className = "scene-item-tag scene-item-tag-more", W.textContent = `+${q.length - 2}`, $.appendChild(W);
          }
          j.appendChild($);
        }
        if (U) {
          const $ = document.createElement("span");
          $.style.cssText = "color:#ef4444;font-size:9px;font-weight:700", $.textContent = " [Format!]", j.appendChild($);
        }
        const H = document.createElement("div");
        H.className = "scene-item-actions", H.appendChild(r(B ? "pi-eye" : "pi-eye-slash", B ? "Hide object (Alt+Click to Isolate)" : "Show object (Alt+Click to Isolate)", !B, ($) => {
          if ($?.altKey) {
            if (e.checkpoint("Isolate object"), e._isolatedObjectId === x.id) {
              e._isolatedObjectId = null;
              const I = e._isolationSnapshot;
              for (const V of e.state.objects)
                V.enabled = I && Object.prototype.hasOwnProperty.call(I, V.id) ? I[V.id] : !0;
              e._isolationSnapshot = null, e.setStatus?.(s("Isolation cleared"));
            } else {
              e._isolationSnapshot || (e._isolationSnapshot = Object.fromEntries(e.state.objects.map((I) => [I.id, I.enabled !== !1]))), e._isolatedObjectId = x.id;
              for (const I of e.state.objects) I.enabled = I.id === x.id;
              e.setStatus?.(s("Isolated: {name}").replace("{name}", x.name || x.type));
            }
            e.serialize(), e.refreshObjects(), e.requestRender?.();
          } else
            e.toggleObject(x.id);
        }, "color:#ef4444;opacity:.7")), H.appendChild(r(x.locked ? "pi-lock" : "pi-lock-open", "Lock object", x.locked, () => mr(e, x))), H.appendChild(r("pi-copy", "Duplicate object", !1, () => e.duplicateObject?.(x.id))), x.id !== "subject" && H.appendChild(r("pi-trash", "Delete object", !1, () => e.deleteObject?.(x.id))), H.appendChild(r("pi-ellipsis-v", "Object actions", !1, ($) => e.openObjectContext($, x.id))), M.append(re, j, H), M.title = s("Click to select · Double-click to toggle visibility · Right-click for actions");
        const ae = ($ = {}) => {
          if ($.altKey && x.id !== "subject") return void e.deleteObject(x.id);
          if (e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectIds ||= /* @__PURE__ */ new Set(), $.ctrlKey || $.metaKey)
            e.selectedObjectIds.has(x.id) ? e.selectedObjectIds.delete(x.id) : e.selectedObjectIds.add(x.id), e.outlinerAnchorId = x.id;
          else if ($.shiftKey && e.outlinerAnchorId && e.state.objects.some((I) => I.id === e.outlinerAnchorId)) {
            const I = e.state.objects.map((le) => le.id), V = I.indexOf(e.outlinerAnchorId), X = I.indexOf(x.id);
            e.selectedObjectIds = new Set(I.slice(Math.min(V, X), Math.max(V, X) + 1));
          } else
            e.selectedObjectIds = /* @__PURE__ */ new Set([x.id]), e.outlinerAnchorId = x.id;
          e.selectedObjectId = e.selectedObjectIds.has(x.id) ? x.id : [...e.selectedObjectIds].at(-1) || null, e.selectedEntity = e.selectedObjectIds.size ? "object" : "camera", e.selectedKeyFrame = e.selectedObjectId ? x.keyframes?.find((I) => I.frame === e.frame)?.frame ?? null : null, e.editingKeyFrame = null;
          for (const I of t.querySelectorAll(".scene-item")) {
            const V = !!(I.dataset.objectId && e.selectedObjectIds.has(I.dataset.objectId)), X = !!(I.dataset.objectId && I.dataset.objectId === e.selectedObjectId);
            I.classList.toggle("selected", V), I.classList.toggle("primary", X), I.dataset.objectId && I.setAttribute("aria-selected", String(V));
          }
          const W = e.root.querySelector('[data-role="outliner-batch-bar"]');
          if (W) {
            const I = e.selectedObjectIds?.size || 0;
            W.hidden = I < 2;
            const V = W.querySelector('[data-role="batch-count"]');
            V && (V.textContent = `${I} ${s("selected")}`);
          }
          e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Selected: ${x.name || x.type}`));
        };
        M.addEventListener("dblclick", () => e.toggleObject(x.id)), M.addEventListener("contextmenu", ($) => {
          $.preventDefault(), $.stopPropagation(), e.openObjectContext($, x.id);
        }), M.addEventListener("keydown", ($) => {
          ($.key === "Enter" || $.key === " ") && ($.preventDefault(), ae($));
        }), t.appendChild(M);
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
function Lo(e, t, a, o) {
  e && document.activeElement !== e && (e.__omnicamOptionSig !== t && (e.__omnicamOptionSig = t, e.replaceChildren(...a())), e.value = o);
}
function Et(e, t) {
  const a = document.createElement("option");
  return a.value = e, a.textContent = t, a;
}
function ah(e, t) {
  e.checkpoint("Create object");
  const a = `${t}_${Date.now().toString(36)}`, o = t === "ground", r = t === "human", n = t === "card", i = t === "cylinder", c = t === "torus", l = t === "pyramid", p = t === "sun_light", m = t === "point_light", f = t === "spot_light";
  let d;
  r ? d = s("Human Proxy") : n ? d = s("Card") : i ? d = s("Cylinder") : c ? d = s("Torus") : l ? d = s("Pyramide") : p ? d = s("Sun light") : m ? d = s("Point light") : f ? d = s("Spot light") : d = t[0].toUpperCase() + t.slice(1);
  let h;
  o ? h = [12, 0.1, 12] : r ? h = [0.7, 1.8, 0.4] : n ? h = [2, 3] : h = [1.5, 1.5, 1.5];
  let u = [0, 0, 0], b = [0, 0, 0], y = "#8c929b", g, v, S, x;
  p ? (u = [5, 8.5, 4], b = [-55, 35, 0], y = "#fff6ec", g = 2.2, v = !0) : m ? (u = [0, 3, 0], y = "#ffffff", g = 2, v = !1) : f && (u = [0, 4, 0], b = [-60, 0, 0], y = "#ffffff", g = 3, S = 45, x = 0.25, v = !0);
  const E = {
    id: a,
    type: t,
    name: d,
    position: u,
    rotation: b,
    size: h,
    color: y,
    material_mode: o ? "checker" : "textured",
    ...g !== void 0 ? { intensity: g } : {},
    ...v !== void 0 ? { cast_shadow: v } : {},
    ...S !== void 0 ? { cone_angle: S } : {},
    ...x !== void 0 ? { penumbra: x } : {},
    keyframes: [],
    enabled: !0
  };
  e.state.objects.push(E), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedObjectIds = /* @__PURE__ */ new Set([a]), e.selectedKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render();
}
async function oh(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  if (!a) return;
  const o = (await zt(e, s("Rename object"), s("Object name"), a.name || a.type))?.trim();
  e.disposed || !e.state.objects.includes(a) || !o || o === a.name || (e.checkpoint("Rename object"), a.name = o.slice(0, 80), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(s(`Object renamed: ${a.name}`)));
}
function ys(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  if (!a) return;
  e.checkpoint("Duplicate object");
  const o = JSON.parse(JSON.stringify(a));
  o.id = `${a.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, o.name = `${a.name || a.type} Copy`, o.position = Ke(o.position || [0, 0, 0], [0.35, 0, 0.35]), (o.type === "model" || o.type === "glb") && e.modelUrlsById.has(a.id) ? e.modelUrlsById.set(o.id, e.modelUrlsById.get(a.id)) : o.type === "card" && e.cardMediaById.has(a.id) && qe(e, o.id, e.cardMediaById.get(a.id), !1, o.asset || e.cardMediaAssetById?.get?.(a.id) || ""), e.state.objects.push(o), e.selectedEntity = "object", e.selectedObjectId = o.id, e.selectedObjectIds = /* @__PURE__ */ new Set([o.id]), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s(`${o.name} added`));
}
function rh(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint(a.enabled === !1 ? "Show object" : "Hide object"), a.enabled = a.enabled === !1, e.serialize(), e.refreshObjects(), e.render(), e.setStatus(s(`${a.name || a.type} ${a.enabled ? "shown" : "hidden"}`)));
}
async function vs(e, t) {
  if (t === "subject") return e.setStatus(s("The subject card cannot be deleted"));
  const a = e.state.objects.find((o) => o.id === t);
  if (a && await Ft(e, s("Delete object"), s(`Delete ${a.name || a.type} and its ${(a.keyframes || []).length} keyframe(s)?`)) && !(e.disposed || !e.state.objects.includes(a))) {
    e.checkpoint("Delete object");
    for (const o of e.state.objects) o.parent_id === t && (o.parent_id = null);
    e.state.objects = e.state.objects.filter((o) => o.id !== t), e.selectedObjectIds?.delete(t), e.removeObjectResources(t), e.selectedObjectId === t && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = e.state.keyframes.find((o) => o.frame === e.frame)?.frame ?? null), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s(`${a.name || a.type} deleted`));
  }
}
async function nh(e) {
  const t = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((r) => r && r !== "subject" && e.state.objects.some((n) => n.id === r));
  if (!t.length) {
    e.selectedObjectId === "subject" && e.setStatus(s("The subject card cannot be deleted"));
    return;
  }
  if (t.length === 1) return vs(e, t[0]);
  const a = s("Delete {count} objects and their keyframes?").replace("{count}", String(t.length));
  if (!await Ft(e, s("Delete objects"), a) || e.disposed) return;
  e.checkpoint("Delete objects");
  const o = new Set(t);
  for (const r of e.state.objects) r.parent_id && o.has(r.parent_id) && (r.parent_id = null);
  e.state.objects = e.state.objects.filter((r) => !o.has(r.id));
  for (const r of t) e.removeObjectResources(r);
  e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.selectedKeyFrame = e.state.keyframes.find((r) => r.frame === e.frame)?.frame ?? null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s("{count} objects deleted").replace("{count}", String(t.length)));
}
function sh(e) {
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
function Kt(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function sn(e, t) {
  const a = e('[data-role="curve-group"]');
  if (a)
    for (const o of a.options) {
      const r = t[o.value];
      r && (o.textContent = r);
    }
}
function ih(e) {
  const t = Kt(e), a = e.root.querySelector('[data-role="object-panel"]');
  a && (a.hidden = !t);
  const o = (j) => e.root.querySelector(j), r = e.activeCameraTrack(), n = o('[data-role="camera-target-object"]');
  if (n) {
    const j = r.target_object_id || e.state.target_object_id || "", O = `T${Cr()}${e.state.objects.map((q) => `${q.id}\0${q.name || q.type}`).join("|")}`;
    Lo(n, O, () => [
      Et("", s("Manual Target (No Tracking)")),
      ...e.state.objects.map((q) => Et(q.id, `${s("Track:")} ${q.name || q.type}`))
    ], j);
  }
  eh(e);
  const i = [...e.camera.position, ...e.camera.target, e.camera.fov, e.camera.roll || 0, e.camera.near, e.camera.far, ...rr(e.camera)];
  ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far", "camera-rx", "camera-ry", "camera-rz"].forEach((j, O) => {
    for (const q of e.root.querySelectorAll(`[data-role="${j}"]`))
      document.activeElement !== q && (q.value = String(Math.round(i[O] * 1e4) / 1e4));
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
    const O = o('[data-role="selected-name"]');
    O && (O.textContent = `${r.name} · F${e.frame}`), sn(o, {
      camera: s("Camera (Position, Focal, Roll)"),
      position: s("Position XYZ"),
      target: s("Target XYZ"),
      lens: s("FOV / Roll / Zoom")
    }), e.rigMapper?.sync(), e.poseEditor?.sync(), e.motionEditor?.sync();
    return;
  }
  const c = o('[data-role="object-recon-badge"]');
  if (c) {
    const j = gp(t);
    if (j) {
      c.hidden = !1;
      const O = j.semantic ? `${j.semantic} · ` : "";
      c.textContent = `${O}${j.label} (${Math.round(j.confidence * 100)}%)`, c.title = j.title, c.className = `oc-recon-badge oc-badge-${j.band}`;
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
  m && (m.textContent = t.name || t.type), sn(o, {
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
  for (const [j, O] of Object.entries(h))
    for (const q of e.root.querySelectorAll(`[data-role="${j}"]`))
      document.activeElement !== q && (q.value = String(Math.round(O * 1e4) / 1e4));
  for (const j of e.root.querySelectorAll('[data-role="object-material"]'))
    document.activeElement !== j && (j.value = t.material_mode || "textured");
  for (const j of e.root.querySelectorAll('[data-role="object-color"]'))
    document.activeElement !== j && (j.value = t.color || "#8c929b");
  for (const j of e.root.querySelectorAll('[data-role="object-light-color"]'))
    document.activeElement !== j && (j.value = t.color || "#ffffff");
  for (const j of e.root.querySelectorAll("[data-transform-mode]")) j.classList.toggle("active", j.dataset.transformMode === (e.state.gizmo_mode || "translate"));
  const u = o('[data-role="animation-row"]'), b = o('[data-role="animation-select"]'), y = o('[data-role="object-parent"]');
  if (y) {
    const j = t.id, O = /* @__PURE__ */ new Set([j]);
    let q = !0;
    for (; q; ) {
      q = !1;
      for (const $ of e.state.objects)
        !O.has($.id) && $.parent_id && O.has($.parent_id) && (O.add($.id), q = !0);
    }
    const H = e.state.objects.filter(($) => !O.has($.id)), ae = `P${Cr()}${j}${H.map(($) => `${$.id} ${$.name || $.type}`).join("|")}`;
    Lo(y, ae, () => [
      Et("", s("No parent")),
      ...H.map(($) => Et($.id, $.name || $.type))
    ], t.parent_id || "");
  }
  const g = ["sun_light", "point_light", "spot_light"].includes(t.type), v = t.type === "spot_light", S = o('[data-role="light-props-row"]');
  S && (S.hidden = !g);
  const x = o('[data-role="spot-props-row"]');
  x && (x.hidden = !v);
  const E = o('[data-role="material-row"]');
  E && (E.hidden = g);
  const M = o('[data-role="scale-row"]');
  M && (M.hidden = g);
  const K = o('[data-role="rotation-row"]');
  if (K && (K.hidden = t.type === "point_light"), g) {
    const j = o('[data-role="object-intensity"]');
    j && document.activeElement !== j && (j.value = String(t.intensity ?? (t.type === "sun_light" ? 2.2 : t.type === "spot_light" ? 3 : 2)));
    const O = o('[data-role="object-cast-shadow"]');
    if (O && (O.checked = t.cast_shadow !== !1), v) {
      const q = o('[data-role="object-cone-angle"]');
      q && document.activeElement !== q && (q.value = String(t.cone_angle ?? 45));
      const H = o('[data-role="object-penumbra"]');
      H && document.activeElement !== H && (H.value = String(t.penumbra ?? 0.25));
    }
  }
  const P = e.modelInfoById.get(t.id);
  if (u && (u.hidden = !P?.animations), b) {
    const j = P?.animationNames || [];
    Lo(b, `A${j.join("|")}`, () => j.map((O, q) => Et(String(q), O)), String(t.animation_index || 0));
  }
  const G = o('[data-role="object-tags"]');
  G && document.activeElement !== G && (G.value = (t.tags || []).join(", "));
  const B = o('[data-role="object-annotation"]');
  B && document.activeElement !== B && (B.value = t.annotation?.text || "");
  const U = o('[data-role="object-annotation-color"]');
  U && document.activeElement !== U && (U.value = t.annotation?.color || "#8d7ee8");
  const re = o('[data-role="object-annotation-anchor"]');
  re && document.activeElement !== re && (re.value = t.annotation?.anchor || "top"), e.rigMapper?.sync(), e.poseEditor?.sync(), e.motionEditor?.sync();
}
function ch(e) {
  const t = Kt(e);
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
      p && p.value !== "" && (t.cone_angle = Y(Number(p.value) || 45, 1, 90));
      const m = e.root.querySelector('[data-role="object-penumbra"]');
      m && m.value !== "" && (t.penumbra = Y(Number(m.value) || 0.25, 0, 1));
    }
  }
  e.commitObjectEdit(t), e.refreshObjects(), e.render();
}
function xs(e, t) {
  if (!t) return null;
  if (t.locked)
    return e.setStatus(s(`${t.name || t.type} is locked`)), null;
  t.keyframes ||= [];
  let a = us(
    t.keyframes,
    e.frame,
    e.state.auto_key ? null : e.selectedKeyFrame,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, transform: Be(t), interpolation: e.root.querySelector('[data-role="interp"]')?.value || "ease" }, t.keyframes.push(a), t.keyframes.sort((o, r) => o.frame - r.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame, e.updateKeyVisualState()) : a && (e.selectedKeyFrame = a.frame, e.updateKeyVisualState()), a;
}
function lh(e, t) {
  const a = xs(e, t);
  a && (a.transform = Be(t)), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor();
}
function ws(e) {
  const t = rr(e.camera);
  ["camera-rx", "camera-ry", "camera-rz"].forEach((a, o) => {
    for (const r of e.root.querySelectorAll(`[data-role="${a}"]`))
      document.activeElement !== r && (r.value = String(Math.round(t[o] * 1e4) / 1e4));
  });
}
function dh(e) {
  ["camera-tx", "camera-ty", "camera-tz"].forEach((t, a) => {
    for (const o of e.root.querySelectorAll(`[data-role="${t}"]`))
      document.activeElement !== o && (o.value = String(Math.round(e.camera.target[a] * 1e4) / 1e4));
  });
}
function mh(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastCameraHudEditAt) || t - e.lastCameraHudEditAt > 300) && e.checkpoint("Edit camera"), e.lastCameraHudEditAt = t;
  const a = (n, i) => {
    const c = e.root.querySelector(`[data-role="${n}"]`);
    if (!c || c.value === "") return i;
    const l = Number(c.value);
    return Number.isFinite(l) ? l : i;
  }, o = rr(e.camera), r = [
    Y(a("camera-rx", o[0]), -90, 90),
    a("camera-ry", o[1]),
    Y(a("camera-rz", o[2]), -180, 180)
  ];
  e.beginCameraEdit(), Hi(e.camera, r), e.commitCameraEdit(), e.finishCameraEdit(), ws(e), dh(e), e.render();
}
function ph(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastCameraHudEditAt) || t - e.lastCameraHudEditAt > 300) && e.checkpoint("Edit camera"), e.lastCameraHudEditAt = t;
  const a = (o, r) => {
    const n = e.root.querySelector(`[data-role="${o}"]`);
    if (!n || n.value === "") return r;
    const i = Number(n.value);
    return Number.isFinite(i) ? i : r;
  };
  e.camera.position = [a("camera-px", e.camera.position[0]), a("camera-py", e.camera.position[1]), a("camera-pz", e.camera.position[2])], e.camera.target = [a("camera-tx", e.camera.target[0]), a("camera-ty", e.camera.target[1]), a("camera-tz", e.camera.target[2])], e.camera.fov = Y(a("camera-fov", e.camera.fov), 5, 150), e.camera.roll = Y(a("camera-roll", e.camera.roll || 0), -180, 180), e.camera.near = Math.max(1e-4, a("camera-near", e.camera.near)), e.camera.far = Math.max(e.camera.near + 1e-4, a("camera-far", e.camera.far)), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), ws(e), e.render();
}
function fh(e, t) {
  const a = Kt(e);
  if (!a) return;
  e.checkpoint("Set parent"), a.parent_id = t || null, e.serialize(), e.refreshObjects(), e.render();
  const o = e.state.objects.find((r) => r.id === t);
  e.setStatus(o ? s(`${a.name || a.type} parented to ${o.name || o.type}`) : s(`${a.name || a.type} unparented`));
}
function hh(e, t) {
  const a = Kt(e);
  a && (e.checkpoint("Select animation"), a.animation_index = Math.max(0, t || 0), e.serialize(), e.webgl?.selectAnimation(a.id, t), e.setStatus(s(`Animation: ${e.modelInfoById.get(a.id)?.animationNames?.[t] || t + 1}`)));
}
function uh(e, t) {
  e.objectUrls.revoke(t), Nt(e, t), e.modelUrlsById.delete(t), e.modelInfoById.delete(t), e.webgl?.removeModel(t);
}
function bh(e) {
  const t = [...e.selectedObjectIds?.size ? e.selectedObjectIds : [e.selectedObjectId]].filter((o) => o && e.state.objects.some((r) => r.id === o));
  if (!t.length) return [];
  if (t.length === 1)
    return ys(e, t[0]), e.selectedObjectId ? [e.selectedObjectId] : [];
  e.checkpoint("Duplicate objects");
  const a = [];
  return t.forEach((o, r) => {
    const n = e.state.objects.find((l) => l.id === o);
    if (!n) return;
    const i = JSON.parse(JSON.stringify(n));
    i.id = `${n.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, i.name = `${n.name || n.type} Copy`;
    const c = 0.35 + r * 0.15;
    i.position = Ke(i.position || [0, 0, 0], [c, 0, c]), (i.type === "model" || i.type === "glb") && e.modelUrlsById.has(n.id) ? e.modelUrlsById.set(i.id, e.modelUrlsById.get(n.id)) : i.type === "card" && e.cardMediaById.has(n.id) && qe(e, i.id, e.cardMediaById.get(n.id), !1, i.asset || e.cardMediaAssetById?.get?.(n.id) || ""), e.state.objects.push(i), a.push(i.id);
  }), a.length && (e.selectedEntity = "object", e.selectedObjectIds = new Set(a), e.selectedObjectId = a[a.length - 1], e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Duplicated {count} objects").replace("{count}", String(a.length)))), a;
}
function gh(e, t = null) {
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
function yh(e, t = null) {
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
function vh(e) {
  const t = (e.state.objects || []).filter((a) => a.id);
  t.length && (e.finishCameraEdit?.(), e.selectedEntity = "object", e.selectedObjectIds = new Set(t.map((a) => a.id)), e.selectedObjectId = t[t.length - 1].id, e.outlinerAnchorId = e.selectedObjectId, e.selectedKeyFrame = null, e.editingKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Selected all {count} objects").replace("{count}", String(t.length))));
}
function ks(e) {
  e.selectedObjectIds?.clear?.(), e.selectedObjectId = null, e.selectedEntity = "camera", e.outlinerAnchorId = null, e.selectedKeyFrame = e.state.keyframes.find((t) => t.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Selection cleared"));
}
function xh(e) {
  const t = e.selectedObjectIds || new Set(e.selectedObjectId ? [e.selectedObjectId] : []), a = (e.state.objects || []).map((o) => o.id).filter((o) => o && !t.has(o));
  if (!a.length) {
    ks(e);
    return;
  }
  e.finishCameraEdit?.(), e.selectedEntity = "object", e.selectedObjectIds = new Set(a), e.selectedObjectId = a[a.length - 1], e.outlinerAnchorId = e.selectedObjectId, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Inverted selection ({count} objects)").replace("{count}", String(a.length)));
}
function wh(e, t) {
  return t(Mn(e), e.frame);
}
function Ee(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function we(e) {
  return Ee(e)?.keyframes || e.state.keyframes;
}
function kh(e, t) {
  for (const a of e.state.objects) {
    if (!a.keyframes?.length) continue;
    const o = t(a, e.frame);
    a.position = o.position, a.rotation = o.rotation, a.size = o.size;
  }
}
function Sh(e) {
  e.checkpoint("Set keyframe");
  const t = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease", a = Ee(e), o = we(e), r = a ? { frame: e.frame, transform: Be(a), interpolation: t } : { frame: e.frame, camera: ye(e.camera), interpolation: t }, n = o.findIndex((i) => i.frame === e.frame);
  n >= 0 ? o[n] = r : o.push(r), o.sort((i, c) => i.frame - c.frame), e.selectedKeyFrame = e.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([e.frame]), e.editingKeyFrame = null, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor(), e.setStatus(s(`${a?.name || "Camera"} ${n >= 0 ? "key updated" : "key inserted"} @ ${e.frame}`));
}
function jh(e, t) {
  const a = Fe(e);
  if (!a) return;
  e.checkpoint("Change key interpolation"), a.interpolation = t;
  const o = e.root.querySelector('[data-role="key-interp"]');
  o && (o.value = t);
  for (const r of e.root.querySelectorAll("[data-interp]"))
    r.classList.toggle("active", r.dataset.interp === t);
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(s(`Key @ ${a.frame} interpolation set to ${t}`));
}
function Ch(e) {
  const t = Ee(e), a = we(e);
  if (!t && a.length <= 1) return e.setStatus(s("Keep at least one camera keyframe"));
  const o = Fe(e) || a.find((i) => i.frame === e.frame);
  if (!o) return e.setStatus(s("Select a keyframe to delete"));
  e.checkpoint("Delete keyframe"), t ? t.keyframes = a.filter((i) => i !== o) : e.state.keyframes = a.filter((i) => i !== o);
  const r = we(e), n = o.frame;
  e.editingKeyFrame === n && (e.editingKeyFrame = null), e.selectedKeyFrame = r.length ? r.reduce((i, c) => Math.abs(c.frame - n) < Math.abs(i.frame - n) ? c : i).frame : null, e.camera = Ce(e.state, e.frame), e.applyObjectAnimationFrame(), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(s(`${t?.name || "Camera"} key deleted @ ${n}`));
}
function _h(e) {
  const t = Ee(e), a = Fe(e) || we(e).find((o) => o.frame === e.frame);
  e.copiedKeyframe = t ? { kind: "object", transform: Be(a?.transform || t), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" } : { kind: "camera", camera: ye(a?.camera || e.camera), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" }, e.setStatus(s(`Keyframe copied @ ${a?.frame ?? e.frame}`));
}
function Eh(e) {
  if (!e.copiedKeyframe) return e.setStatus(s("Copy a keyframe first"));
  const t = Ee(e), a = t ? "object" : "camera";
  if (e.copiedKeyframe.kind !== a) return e.setStatus(s(`Copy a ${a} keyframe first`));
  e.checkpoint("Paste keyframe");
  const o = t ? { frame: e.frame, transform: Be(e.copiedKeyframe.transform), interpolation: e.copiedKeyframe.interpolation } : { frame: e.frame, camera: ye(e.copiedKeyframe.camera), interpolation: e.copiedKeyframe.interpolation }, r = we(e), n = r.findIndex((i) => i.frame === e.frame);
  n >= 0 ? r[n] = o : r.push(o), r.sort((i, c) => i.frame - c.frame), e.selectedKeyFrame = o.frame, e.editingKeyFrame = null, t ? (t.position = [...o.transform.position], t.rotation = [...o.transform.rotation], t.size = [...o.transform.size]) : e.camera = ye(o.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(s(`Keyframe pasted @ ${o.frame}`));
}
function Fe(e) {
  return we(e).find((t) => t.frame === e.selectedKeyFrame) || null;
}
function $h(e, t) {
  t && (e.selectedKeyFrame = t.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([t.frame]), e.editingKeyFrame = null, e.setFrame(t.frame));
}
function Mh(e) {
  const t = e.activeCameraTrack();
  if (t?.locked)
    return e.setStatus(s(`${t.name} is locked`)), null;
  let a = us(
    e.state.keyframes,
    e.frame,
    !e.state.auto_key && e.selectedEntity === "camera" ? e.selectedKeyFrame : null,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, camera: ye(e.camera), interpolation: e.root.querySelector('[data-role="key-interp"]')?.value || "ease" }, e.state.keyframes.push(a), e.state.keyframes.sort((o, r) => o.frame - r.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame) : a && (e.selectedKeyFrame = a.frame), e.cameraEditKey = a || null, e.cameraEditActive = !0, e.updateKeyVisualState(), a;
}
function Ah(e) {
  const t = e.cameraEditKey;
  t && (t.camera = ye(e.camera), e.frame = t.frame, e.selectedKeyFrame = t.frame), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.render();
}
function Th(e) {
  if (e.cameraEditActive) {
    if (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, e.selectedKeyFrame === null) {
      const t = e.state.keyframes.find((a) => a.frame === e.frame);
      t && (e.selectedKeyFrame = t.frame);
    }
    e.refreshKeys();
  }
}
function Ih(e, t = !1) {
  e.editingKeyFrame === null && (!t || e.selectedKeyFrame === null && !e.selectedKeyFrames?.size) || (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, t && (e.selectedKeyFrame = null, e.selectedKeyFrames = null), e.refreshKeys());
}
function Ph(e) {
  e.state.auto_key = !e.state.auto_key, e.state.auto_key || e.exitKeyEdit(!1), e.serialize(), e.updateEditState(), e.setStatus(s(`Auto Key ${e.state.auto_key ? "on" : "off"}`));
}
const Oh = ["guides", "safe-areas", "resolution-gate", "aspect-ratio"];
function zh(e) {
  const t = e.root.querySelector(".viewport-wrap"), a = e.editingKeyFrame !== null, o = !!e.state.auto_key;
  t && (t.classList.toggle("edit-mode", a), t.classList.toggle("auto-key", o));
  for (const m of e.root.querySelectorAll('[data-act="auto-key"]'))
    m.classList.toggle("active", o), m.setAttribute("aria-pressed", String(o)), m.title = s(`Auto Key ${o ? "on" : "off"}`);
  const r = e.state.view_mode === "camera";
  for (const m of Oh)
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
  p && (a ? p.textContent = i ? `● EDITING ${i.name || i.type} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : `● EDITING ${n.name} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : o ? p.textContent = i ? `● AUTO KEY · ${i.name || i.type}` : `● AUTO KEY · ${n.name}` : i ? p.textContent = `SELECTED: ${i.name || i.type}` : p.textContent = e.state.view_mode === "camera" ? `CAMERA: ${n.name}` : `VIEW: ${e.state.view_mode.toUpperCase()}`), Qn(e), ep(e), Me(e);
}
function Fh(e) {
  const t = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const a of e.root.querySelectorAll("[data-key-frame]")) {
    const o = Number(a.dataset.keyFrame);
    a.classList.toggle("selected", t.has(o)), a.classList.toggle("editing", o === e.editingKeyFrame), a.classList.toggle("at-playhead", o === e.frame);
  }
  e.updateEditState();
}
function Lh(e, t) {
  const a = Fe(e);
  if (!a) return;
  e.checkpoint("Change key tangent mode"), a.tangents = a.tangents && typeof a.tangents == "object" ? a.tangents : {}, a.tangents.mode = t, a.tangent_mode = t, t !== "auto" && a.interpolation !== "bezier" && (a.interpolation = "bezier");
  const o = e.root.querySelector('[data-role="key-tangent-mode"]');
  o && (o.value = t);
  for (const r of e.root.querySelectorAll("[data-tangent]"))
    r.classList.toggle("active", r.dataset.tangent === t);
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(s("Key @ {frame} tangent mode set to {mode}").replace("{frame}", String(a.frame)).replace("{mode}", t));
}
function Nh(e) {
  const t = Ee(e), a = Fe(e), o = e.root.querySelector('[data-role="key-editor"]');
  o && (o.dataset.empty = String(!a));
  const r = e.root.querySelector('[data-role="selected-key-label"]');
  r && (r.textContent = a ? s(`${t?.name || "Camera"} Key @ ${a.frame}`) : s(`No ${t ? "object" : "camera"} key selected`));
  const n = ["key-frame", "key-interp", "key-tangent-mode", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"];
  for (const d of n) {
    const h = e.root.querySelector(`[data-role="${d}"]`);
    h && (h.disabled = !a || !!(t && !["key-frame", "key-interp", "key-tangent-mode"].includes(d)));
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
    const d = Math.max(1, e.state?.fps || 24), h = a ? a.frame : e.frame, u = Math.floor(h / d), b = h % Math.round(d), y = String(Math.floor(u / 3600)).padStart(2, "0"), g = String(Math.floor(u % 3600 / 60)).padStart(2, "0"), v = String(u % 60).padStart(2, "0"), S = String(b).padStart(2, "0");
    m.textContent = `${y}:${g}:${v}:${S} (${h}f)`;
  }
  if (!a) return;
  if (t) {
    const d = e.root.querySelector('[data-role="key-frame"]');
    d && document.activeElement !== d && (d.value = String(a.frame));
    const h = e.root.querySelector('[data-role="key-interp"]');
    h && document.activeElement !== h && (h.value = a.interpolation);
    return;
  }
  const f = {
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
  for (const [d, h] of Object.entries(f)) {
    const u = e.root.querySelector(`[data-role="${d}"]`);
    u && document.activeElement !== u && (u.value = String(h));
  }
}
function Kh(e, t, a = !1, o = {}) {
  const r = Fe(e);
  if (!r) return;
  const n = we(e);
  let i = Y(Math.round(t), 0, e.state.duration_frames - 1);
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
function Rh(e) {
  const t = Fe(e);
  if (!t) return;
  if (e.checkpoint("Edit keyframe"), e.editingKeyFrame = t.frame, Ee(e)) {
    t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.transform = Be(Ee(e)), e.serialize(), e.setFrame(t.frame), e.setStatus(s(`Object keyframe updated @ ${t.frame}`));
    return;
  }
  const a = (o, r) => {
    const n = Number(e.root.querySelector(`[data-role="${o}"]`).value);
    return Number.isFinite(n) ? n : r;
  };
  t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.camera.position = [a("key-px", t.camera.position[0]), a("key-py", t.camera.position[1]), a("key-pz", t.camera.position[2])], t.camera.target = [a("key-tx", t.camera.target[0]), a("key-ty", t.camera.target[1]), a("key-tz", t.camera.target[2])], t.camera.fov = Y(a("key-fov", t.camera.fov), 5, 150), t.camera.roll = Y(a("key-roll", t.camera.roll || 0), -180, 180), t.camera.zoom = Math.max(0.01, a("key-zoom", t.camera.zoom || 1)), t.camera.near = Math.max(1e-4, a("key-near", t.camera.near)), t.camera.far = Math.max(t.camera.near + 1e-4, a("key-far", t.camera.far)), t.camera.camera_type = e.root.querySelector('[data-role="key-camera-type"]').value, e.camera = ye(t.camera), e.frame = t.frame, e.serialize(), e.setFrame(t.frame), e.setStatus(s(`Keyframe updated @ ${t.frame}`));
}
function Dh(e) {
  const t = Fe(e);
  t && (e.setFrame(t.frame), e.setStatus(s(`Loaded keyframe @ ${t.frame}`)));
}
function qh(e, t) {
  const a = we(e);
  if (!a.length) return;
  const o = t < 0 ? [...a].reverse().find((r) => r.frame < e.frame) || a[a.length - 1] : a.find((r) => r.frame > e.frame) || a[0];
  e.selectKeyframe(o);
}
const vr = ["pos_x", "pos_y", "pos_z"], Ho = 1e-9, Co = ["auto", "aligned", "free", "corner"];
function je(e, t = 0) {
  const a = Number(e);
  return Number.isFinite(a) ? a : t;
}
function Oe(e) {
  const t = e?.camera?.position;
  return [je(t?.[0]), je(t?.[1]), je(t?.[2])];
}
function Ot(e, t) {
  return [e[0] - t[0], e[1] - t[1], e[2] - t[2]];
}
function cn(e) {
  return Math.hypot(e[0], e[1], e[2]);
}
function ko(e, t) {
  return [e[0] * t, e[1] * t, e[2] * t];
}
function Go(e, t, a) {
  const o = Oe(e), r = t ? Oe(t) : o, n = a ? Oe(a) : o, i = Math.max(Ho, je(e?.frame) - je(t?.frame, je(e?.frame) - 1)), c = Math.max(Ho, je(a?.frame, je(e?.frame) + 1) - je(e?.frame)), l = [0, 0, 0], p = [0, 0, 0];
  for (let m = 0; m < 3; m += 1) {
    const f = (o[m] - r[m]) / i, d = (n[m] - o[m]) / c;
    let h = (f + d) * 0.5;
    t ? a ? f * d <= 0 && (h = 0) : h = f : h = d, l[m] = h * c * (1 / 3), p[m] = -h * i * (1 / 3);
  }
  return { out: l, in: p };
}
function Ss(e, t, a) {
  const o = Oe(e), r = t ? Oe(t) : o, n = a ? Oe(a) : o;
  return {
    out: ko(Ot(n, o), 1 / 3),
    in: ko(Ot(r, o), 1 / 3)
  };
}
function Yo(e, t) {
  const a = e?.tangents?.channels;
  if (!a) return null;
  const o = t === "out" ? "out_y" : "in_y", r = [0, 0, 0];
  let n = !1;
  for (let i = 0; i < 3; i += 1) {
    const c = a[vr[i]];
    c && Number.isFinite(Number(c[o])) && (r[i] = Number(c[o]), n = !0);
  }
  return n ? r : null;
}
function At(e) {
  const t = e?.tangents?.spatial_mode;
  return Co.includes(t) ? t : "auto";
}
function Bh(e, t = null, a = null) {
  const o = At(e), r = Oe(e);
  if (o === "corner") {
    const l = Ss(e, t, a);
    return { in: io(r, l.in), out: io(r, l.out), mode: o };
  }
  const n = Go(e, t, a), i = (o === "free" || o === "aligned") && Yo(e, "out") || n.out, c = (o === "free" || o === "aligned") && Yo(e, "in") || n.in;
  return { in: io(r, c), out: io(r, i), mode: o };
}
function io(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function Wh(e) {
  return e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.channels = e.tangents.channels && typeof e.tangents.channels == "object" ? e.tangents.channels : {}, e.tangents.channels;
}
function lt(e, t, a) {
  const o = Wh(e);
  for (let r = 0; r < 3; r += 1) {
    const n = vr[r], i = o[n] && typeof o[n] == "object" ? o[n] : {};
    i.mode = "free", i.out_x = 1 / 3, i.in_x = -1 / 3, t === "out" ? i.out_y = a[r] : i.in_y = a[r], i.out_y === void 0 && (i.out_y = 0), i.in_y === void 0 && (i.in_y = 0), o[n] = i;
  }
}
function Xo(e) {
  e.interpolation !== "bezier" && (e.interpolation = "bezier");
}
function js(e, t, a) {
  const o = Oe(e), r = Bh(e, t, a);
  lt(e, "out", Ot(r.out, o)), lt(e, "in", Ot(r.in, o));
}
function Vh(e, t, a, { prevKey: o = null, nextKey: r = null } = {}) {
  if (!e || t !== "in" && t !== "out") return e;
  let n = At(e);
  if (n === "corner") return e;
  n === "auto" && (n = "aligned", e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = "aligned", js(e, o, r));
  const i = Oe(e), c = Ot([
    je(a?.[0]),
    je(a?.[1]),
    je(a?.[2])
  ], i);
  if (Xo(e), lt(e, t, c), n === "aligned") {
    const l = t === "out" ? "in" : "out", p = Yo(e, l) || (l === "out" ? Go(e, o, r).out : Go(e, o, r).in), m = cn(c), f = cn(p) || m || 1, d = m > Ho ? ko(c, -f / m) : ko(p, 1);
    lt(e, l, d);
  }
  return e;
}
function Uh(e, t, { prevKey: a = null, nextKey: o = null } = {}) {
  if (!e || !Co.includes(t)) return e;
  if (e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = t, t === "auto") {
    if (e.tangents.channels) {
      for (const r of vr) delete e.tangents.channels[r];
      Object.keys(e.tangents.channels).length || delete e.tangents.channels;
    }
    return e.interpolation === "bezier" && (e.interpolation = "smooth"), e;
  }
  if (t === "corner") {
    const r = Ss(e, a, o);
    return Xo(e), lt(e, "out", r.out), lt(e, "in", r.in), e;
  }
  return Xo(e), js(e, a, o), e;
}
function Hh(e) {
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
const Gh = 220;
function No(e, t, a, o) {
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
function ln(e) {
  return JSON.stringify({
    background: e.viewport_bg_image || "",
    sequence: e.viewport_bg_sequence || [],
    objects: (e.objects || []).map((t) => [t.id, t.type, t.asset || ""])
  });
}
function Yh(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: f, playblastCameraTrack: d, restoreFromWidgets: h, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: y, bindEditorEvents: g, activateCamera: v, addCamera: S, deleteCamera: x, drawPreviewOverlays: E, duplicateCamera: M, maximizeCameraPreview: K, refreshCameraPreviews: P, refreshCameraSelectors: G, renameCamera: B, setPlayblastCamera: U, toggleCameraView: re, captureRealtime: j, makePlayblast: O, uploadDirectorPlayblast: q, waitForMediaFrame: H, computeAudioPeaks: ae, loadAudioFile: $, releaseAudio: W, stopPlay: I, togglePlay: V, applyCameraPreset: X, applyCameraShake: le, applyProxyPreset: de, clearViewportBgImage: Q, loadViewportBgFile: me, loadViewportBgSequence: be, drawCameraPath: fe, drawCard: ve, drawCube: F, drawGrid: N, drawHuman: se, drawLine3D: ce, drawNull: he, drawOverlays: pe, drawPointField: oe, drawSpeedHeatmap: Se, drawSphere: Rt, curveChannels: Dt, drawCurveEditor: mt, onCurvePointerDown: pt, onCurvePointerMove: ft, onCurvePointerUp: ht, onTimelinePointerDown: qt, onTimelinePointerMove: Bt, onTimelinePointerUp: Wt, refreshKeys: ut, resetCurveZoom: bt, resetTimelineZoom: Ze, setChannelFilter: gt, setCurveInterpolation: yt, setTangentMode: vt, timelineFrameFromEvent: Vt, toggleCurveHandles: xt, zoomCurve: Ut, drawTransformGizmo: Ht, frameTarget: Gt, gizmoAxes: Yt, gizmoGeometry: Xt, onPointerDown: Zt, onPointerMove: Jt, onPointerUp: Qt, onWheel: ea, pickGizmo: ta, pickSceneObject: aa, resetCamera: wt, setTransformMode: kt, setViewMode: oa, viewportCamera: ra, loadCardFile: _o, loadExecutionPreview: Eo, loadMediaUrl: na, loadModelFile: sa, loadSelectedReference: ia, onModelLoaded: ca, restoreAssets: la, syncUpstreamInputs: da, configureDomMedia: ma, refreshSetupDiagnostic: St, addMediaCard: pa, addPrimitive: fa, applyObjectAnimationFrame: ha, beginCameraEdit: ua, beginObjectEdit: ba, commitCameraEdit: ga, commitObjectEdit: ya, copyKeyframe: va, deleteKeyframe: xa, deleteObject: wa, duplicateObject: ka, exitKeyEdit: Sa, finishCameraEdit: ja, goToAdjacentKey: Ca, insertKeyframe: _a, loadSelectedKeyView: Ea, pasteKeyframe: $a, playblastCameraAtFrame: Ma, refreshInspector: Aa, refreshKeyEditor: Ta, refreshObjects: Ia, removeObjectResources: Pa, renameObject: Oa, retimeSelectedKey: za, selectKeyframe: Fa, selectedKeyframe: La, selectedObject: Na, selectObjectAnimation: Ka, setKeyInterpolation: Ra, setObjectParent: Da, timelineKeyframes: qa, timelineObject: We, toggleAutoKey: Ba, toggleObject: Wa, updateCameraFromHud: Va, updateEditState: Ua, updateKeyVisualState: Ha, updateSelectedKey: Ga, updateSelectedObject: Ya, clamp: jt, cloneCamera: Xa, configureCore: Za, defaultCamera: Ja, sampleCamera: Ct, sampleObjectTransform: $o, sanitizeState: Je, worldTransform: Le } = e;
  return {
    setSelectMode(T) {
      if (["object", "vertex", "edge", "face"].includes(T)) {
        this.state.select_mode = T, this.subSelection = null;
        for (const _ of this.root.querySelectorAll("[data-select-mode]")) {
          const k = _.dataset.selectMode === T;
          _.classList.toggle("active", k), _.setAttribute("aria-pressed", String(k));
        }
        for (const _ of this.root.querySelectorAll('[data-role="select-mode"]'))
          _.value = T;
        this.serialize(), this.syncFromWidgets(), this.render(), this.setStatus(`Select Mode: ${T.toUpperCase()}`);
      }
    },
    refreshSetupDiagnostic() {
      St(this);
    },
    hideInternalWidgets() {
      for (const T of ["state_json", "recording_path", "card_asset"]) {
        const _ = this.node.widgets?.find((k) => k.name === T);
        _ && (_.computeSize = () => [0, -4], _.draw = () => {
        }, _.hidden = !0, _.options = { ..._.options || {}, hideInVueNodes: !0 });
      }
    },
    restoreFromWidgets() {
      h(this);
    },
    restoreHistorySnapshot(T) {
      const _ = JSON.parse(T);
      if (this.keyDrag?.badge?.remove?.(), this.boxSelect?.overlay?.remove?.(), this.drag = null, this.gizmoDrag = null, this.targetFreeDrag = null, this.pathDrag = null, this.boxSelection = null, this.keyDrag = null, this.curveDrag = null, this.curvePanDrag = null, this.curveScrub = null, this.curveBoxSelect = null, this.timelineDrag = null, this.timelinePanDrag = null, this.boxSelect = null, this.modalTransform = null, this.activePointerId != null) {
        try {
          this.interactionElement?.releasePointerCapture?.(this.activePointerId);
        } catch {
        }
        this.activePointerId = null;
      }
      const k = ln(this.state), w = new Set(this.state.objects.map((ne) => ne.id));
      this.state = Je(_.state);
      const C = new Set(this.state.objects.map((ne) => ne.id));
      for (const ne of w) C.has(ne) || this.removeObjectResources(ne);
      this.frame = jt(_.frame, 0, this.state.duration_frames - 1);
      const A = new Set(this.state.objects.map((ne) => ne.id)), L = Array.isArray(_.selectedObjectIds) ? _.selectedObjectIds : [_.selectedObjectId].filter(Boolean);
      this.selectedObjectIds = new Set(L.filter((ne) => A.has(ne))), this.selectedObjectId = this.selectedObjectIds.has(_.selectedObjectId) ? _.selectedObjectId : [...this.selectedObjectIds].at(-1) || null, this.selectedEntity = this.selectedObjectIds.size ? "object" : _.selectedEntity || "camera";
      const Z = new Set(this.timelineKeyframes().map((ne) => ne.frame)), R = Array.isArray(_.selectedKeyFrames) ? _.selectedKeyFrames : [_.selectedKeyFrame].filter((ne) => ne != null);
      this.selectedKeyFrames = new Set(R.filter((ne) => Z.has(ne))), this.selectedKeyFrame = this.selectedKeyFrames.has(_.selectedKeyFrame) ? _.selectedKeyFrame : [...this.selectedKeyFrames].at(-1) ?? null, this.subSelection = _.subSelection || null, this.camera = Ct(this.state, this.frame), Mt(this, this.activeCameraTrack(), this.camera, this.frame), this.cameraPreviewSignature = "", this.serialize(), k !== ln(this.state) && this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
    },
    checkpoint(T) {
      this.history.checkpoint(T);
    },
    undo() {
      const T = this.history.undo();
      T && this.setStatus(`Undo: ${T}`);
    },
    redo() {
      const T = this.history.redo();
      T && this.setStatus(`Redo: ${T}`);
    },
    bindEditorEvents() {
      g(this);
    },
    bindWidgetCallbacks() {
      f(this);
    },
    syncFromWidgets(T = !0) {
      y(this, T);
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
      G(this);
    },
    refreshCameraPreviews() {
      P(this);
    },
    addCamera() {
      S(this);
    },
    async renameCamera(T) {
      return B(this, T);
    },
    duplicateCamera(T) {
      M(this, T);
    },
    async deleteCamera(T) {
      return x(this, T);
    },
    activateCamera(T) {
      v(this, T);
    },
    setPlayblastCamera(T) {
      U(this, T);
    },
    closeMenus(T = null) {
      for (const _ of this.root.querySelectorAll(".toolbar-menu")) _ !== T && (_.open = !1);
      this.hideContextMenu();
    },
    initializeTooltips() {
      n(this.root, this.interactionElement);
    },
    hideContextMenu() {
      this.contextMenu?.hide();
    },
    showContextMenu(T, _, k) {
      return this.contextMenu.show(T, _, k);
    },
    onContextMenu(T) {
      if (T.preventDefault(), T.stopPropagation(), T.stopImmediatePropagation?.(), T.altKey || this.state.navigation_profile === "simple" && T.target?.closest?.(".viewport-wrap")) return;
      const _ = T.target, k = _.closest?.(".camera-preview-tile"), w = _.closest?.(".scene-item"), C = _.closest?.(".key");
      if (k) return this.openCameraContext(T, k.dataset.cameraId, !0);
      if (w?.dataset.cameraId) return this.openCameraContext(T, w.dataset.cameraId, !1);
      if (w?.dataset.objectId) return this.openObjectContext(T, w.dataset.objectId);
      if (C) {
        const A = this.timelineKeyframes().find((L) => L.frame === Number(C.dataset.keyFrame));
        return A && this.selectKeyframe(A), this.openTimelineContext(T, !0);
      }
      if (_.closest?.('[data-role="keys"]'))
        return this.setFrame(this.timelineFrameFromEvent(T, _.closest('[data-role="keys"]'))), this.openTimelineContext(T, !1);
      if (_.closest?.(".curve-editor")) return this.openCurveContext(T);
      if (_.closest?.(".viewport-wrap")) {
        const A = this.interactionElement.getBoundingClientRect(), L = (T.clientX - A.left) * this.canvas.width / Math.max(1, A.width), Z = (T.clientY - A.top) * this.canvas.height / Math.max(1, A.height), R = this.pickSceneObject([L, Z]);
        if (R) {
          if ((R.type === "object" || R.type === "object_keyframe") && R.object)
            return this.selectedEntity = "object", this.selectedObjectId = R.object.id, R.keyframe ? (this.setFrame(R.keyframe.frame), this.selectedKeyFrame = R.keyframe.frame) : this.selectedKeyFrame = R.object.keyframes?.find((ne) => ne.frame === this.frame)?.frame ?? null, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.openObjectContext(T, R.object.id);
          if (["camera", "camera_target", "camera_keyframe"].includes(R.type) && R.camera)
            return this.selectedEntity = R.type === "camera_target" ? "camera_target" : "camera", this.selectedObjectId = null, this.activateCamera(R.camera.id), R.keyframe && (this.setFrame(R.keyframe.frame), this.selectedKeyFrame = R.keyframe.frame), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), R.type === "camera_keyframe" && R.keyframe ? this.openPathKeyContext(T, R.camera.id, R.keyframe.frame) : this.openCameraContext(T, R.camera.id, !1);
        }
        return this.openViewportContext(T);
      }
    },
    openViewportContext(T) {
      const _ = this.selectedObject();
      this.showContextMenu(T, s("Viewport"), [
        {
          label: _ ? `${s("Set key")} · ${_.name || _.type}` : `${s("Set key")} · ${this.activeCameraTrack().name}`,
          icon: "pi-key",
          shortcut: "I",
          run: () => this.insertKeyframe()
        },
        { label: s("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        { label: s("Set camera target here"), icon: "pi-bullseye", help: s("Set camera Look-At target to this 3D point in the scene"), run: () => this.setTargetAtCursor(T) },
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
    openObjectContext(T, _) {
      const k = this.state.objects.find((A) => A.id === _);
      if (!k) return;
      this.selectedEntity = "object", this.selectedObjectId = _, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
      const w = ["sun_light", "point_light", "spot_light"].includes(k.type), C = this.selectedObjectIds?.size || 0;
      if (C >= 2 && this.selectedObjectIds.has(_)) {
        this.showContextMenu(T, `${C} ${s("objects selected")}`, [
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
              for (const A of this.selectedObjectIds) this.resetObjectAnimation(A);
            }
          },
          { label: s("Delete {count} objects").replace("{count}", String(C)), icon: "pi-trash", danger: !0, shortcut: "Del", run: () => this.deleteSelectedObjects() },
          null,
          { label: s("Deselect all"), icon: "pi-times", shortcut: "Alt+A", run: () => this.deselectAll() }
        ]);
        return;
      }
      this.showContextMenu(T, k.name || k.type, [
        { label: s("Set key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: s("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        { label: s("Rename object…"), icon: "pi-pencil", run: () => this.renameObject(_) },
        { label: s("Duplicate object"), icon: "pi-copy", run: () => this.duplicateObject(_) },
        { label: k.enabled === !1 ? s("Show object") : s("Hide object"), icon: k.enabled === !1 ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(_) },
        { label: k.locked ? s("Unlock object") : s("Lock object"), icon: k.locked ? "pi-lock" : "pi-lock-open", run: () => mr(this, k) },
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
            { label: s("Camera tracks this object (Look-At)"), icon: "pi-bullseye", help: s("Lock camera live look-at tracking to this moving object"), run: () => this.aimAtSelectedObject(_) },
            { label: s("Bake tracking to all camera keys"), icon: "pi-check-square", help: s("Write this object's motion into camera target keyframes"), run: () => this.bakeAimToKeyframes() },
            null,
            { label: s("Select hierarchy"), icon: "pi-sitemap", shortcut: "Shift+G", help: s("Select this object and all descendants"), run: () => this.selectHierarchy(_) }
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
        { label: s("Reset entire animation"), icon: "pi-replay", danger: !0, help: s("Delete every animation key and return position/rotation to zero"), run: () => this.resetObjectAnimation(_) },
        null,
        { label: s("Delete object"), icon: "pi-trash", danger: !0, disabled: _ === "subject", help: _ === "subject" ? s("The canonical subject card cannot be deleted") : s("Delete this object and its animation keys"), run: () => this.deleteObject(_) }
      ]);
    },
    openCameraContext(T, _, k = !1) {
      const w = this.state.cameras.find((C) => C.id === _);
      w && (this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(_), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.showContextMenu(T, `${w.name}${k ? " preview" : ""}`, [
        { label: s("Edit this camera"), icon: "pi-video", run: () => this.activateCamera(_) },
        {
          label: s("Select whole path — move / scale / rotate"),
          icon: "pi-arrows-alt",
          disabled: (w.keyframes || []).length < 1,
          run: () => {
            this.activateCamera(_), this.selectCameraPath() && this.setStatus(`${w.name} · ${s("whole path selected — move / scale / rotate")}`);
          }
        },
        { label: s("Set as primary / playblast"), icon: "pi-star", disabled: _ === this.state.playblast_camera_id, run: () => this.setPlayblastCamera(_) },
        { label: s("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => {
          this.activateCamera(_), this.insertKeyframe();
        } },
        { label: s("Record this preview"), icon: "pi-circle-fill", run: () => {
          this.setPlayblastCamera(_), this.makePlayblast();
        } },
        { label: this.state.maximized_camera_id === _ ? s("Restore preview size") : s("Maximize preview"), icon: "pi-window-maximize", run: () => this.maximizeCameraPreview(_) },
        null,
        {
          label: s("Shot order & handles"),
          icon: "pi-sliders-h",
          items: [
            { label: s("Shot: move earlier"), icon: "pi-arrow-up", disabled: this.state.cameras.findIndex((C) => C.id === _) <= 0, run: () => this.moveShot(_, -1) },
            { label: s("Shot: move later"), icon: "pi-arrow-down", disabled: this.state.cameras.findIndex((C) => C.id === _) >= this.state.cameras.length - 1, run: () => this.moveShot(_, 1) },
            null,
            { label: s("Shot handles…"), icon: "pi-sliders-h", run: () => this.editShotHandles(_) }
          ]
        },
        null,
        { label: s("Rename camera…"), icon: "pi-pencil", run: () => this.renameCamera(_) },
        { label: s("Duplicate camera"), icon: "pi-copy", run: () => this.duplicateCamera(_) },
        { label: s("Create camera from current view"), icon: "pi-plus", run: () => this.addCamera() },
        null,
        { label: s("Reset entire animation"), icon: "pi-replay", danger: !0, help: s("Delete every camera key and return to a static zero pose at frame 0"), run: () => this.resetCameraAnimation(_) },
        null,
        { label: s("Delete camera"), icon: "pi-trash", danger: !0, disabled: this.state.cameras.length <= 1, run: () => this.deleteCamera(_) }
      ]));
    },
    openPathKeyContext(T, _, k) {
      const w = this.state.cameras.find((Z) => Z.id === _);
      if (!w) return;
      this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(_);
      const C = (w.keyframes || []).find((Z) => Z.frame === k) || null;
      C && this.selectKeyframe(C), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
      const A = C ? At(C) : "auto", L = this.selectedKeyFrames?.size || 0;
      this.showContextMenu(T, `Path key F${k}`, [
        { label: s("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: s("Frame subject"), icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        null,
        {
          label: s("Handle Type"),
          icon: "pi-share-alt",
          items: Co.map((Z) => ({
            label: Hh(Z),
            checked: A === Z,
            run: () => this.setSpatialHandleMode(Z)
          }))
        },
        {
          label: s("Keyframe operations"),
          icon: "pi-sliders-v",
          items: No(this, i, t, We)
        },
        null,
        {
          label: L >= 2 ? s("Delete {count} keys").replace("{count}", String(L)) : s("Delete key"),
          icon: "pi-trash",
          danger: !0,
          disabled: (w.keyframes || []).length <= 1,
          run: () => this.deleteSelectedKeyframes()
        }
      ]);
    },
    moveShot(T, _) {
      const k = this.state.cameras.findIndex((A) => A.id === T), w = k + _;
      if (k < 0 || w < 0 || w >= this.state.cameras.length) return;
      this.checkpoint("Reorder shot");
      const [C] = this.state.cameras.splice(k, 1);
      this.state.cameras.splice(w, 0, C), this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${C.name} → #${w + 1}`);
    },
    async editShotHandles(T) {
      const _ = this.state.cameras.find((A) => A.id === T);
      if (!_) return;
      const k = _.handles || { in: 0, out: 0 }, w = await i(t, s("Shot handles…"), "Handle frames: in,out", `${k.in},${k.out}`);
      if (w == null) return;
      const C = String(w).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
      if (!C) return this.setStatus("Handles must be two integers: in,out");
      this.checkpoint("Shot handles"), _.handles = { in: Math.min(600, Number(C[1])), out: Math.min(600, Number(C[2])) }, this.serialize(), this.setStatus(`${_.name} handles: ${_.handles.in} / ${_.handles.out}`);
    },
    openTimelineContext(T, _) {
      const k = this.selectedKeyFrames?.size || 0, w = this.selectedKeyframe(), C = w?.interpolation || "ease", A = w && At(w) || "auto", L = ["ease", "linear", "bezier", "smooth", "ease_in", "ease_out", "sine", "cubic", "quintic", "expo", "back"], Z = ["auto", "clamped", "vector", "free", "aligned", "flat"];
      this.showContextMenu(T, _ ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
        { label: s("Fit timeline view (F)"), icon: "pi-arrows-alt", shortcut: "F", run: () => Ze(this) },
        { label: s("Set / replace key"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: s("Copy selected key"), icon: "pi-copy", shortcut: "Ctrl+C", disabled: !w, run: () => this.copyKeyframe() },
        { label: s("Paste key at playhead"), icon: "pi-clipboard", shortcut: "Ctrl+V", disabled: !this.copiedKeyframe, run: () => this.pasteKeyframe() },
        null,
        {
          label: s("Interpolation"),
          icon: "pi-chart-line",
          disabled: !w && k < 2,
          items: L.map((R) => ({
            label: R.replaceAll("_", " "),
            checked: C === R,
            run: () => this.setSelectedKeysInterpolation(R)
          }))
        },
        {
          label: s("Tangents"),
          icon: "pi-share-alt",
          disabled: !w && k < 2,
          items: Z.map((R) => ({
            label: R[0].toUpperCase() + R.slice(1),
            checked: A === R,
            run: () => this.setSelectedKeysTangentMode(R)
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
          items: No(this, i, t, We)
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
      if ((this.state.markers || []).find((_) => _.frame === this.frame)) return this.setStatus(`Marker already at F${this.frame}`);
      this.checkpoint("Add marker"), this.state.markers = [...this.state.markers || [], { frame: this.frame, name: `Marker ${(this.state.markers || []).length + 1}`, color: "#f2d06b" }].sort((_, k) => _.frame - k.frame), this.serialize(), this.refreshKeys(), this.setStatus(`Marker @ F${this.frame}`);
    },
    removeNearestMarker() {
      const T = this.state.markers || [];
      if (!T.length) return;
      const _ = T.reduce((k, w) => Math.abs(w.frame - this.frame) < Math.abs(k.frame - this.frame) ? w : k);
      this.checkpoint("Remove marker"), this.state.markers = T.filter((k) => k !== _), this.serialize(), this.refreshKeys(), this.setStatus(`Marker removed @ F${_.frame}`);
    },
    openCurveContext(T) {
      const _ = this.selectedKeyFrames?.size || 0, k = _ < 2 && !this.selectedKeyframe(), w = this.selectedKeyframe(), C = w?.interpolation || "ease", A = w && At(w) || "auto", L = ["bezier", "smooth", "linear", "ease_in", "ease_out", "ease", "sine", "cubic", "quintic", "expo", "back"], Z = ["auto", "clamped", "vector", "free", "aligned", "flat"];
      this.showContextMenu(T, s("Curve editor"), [
        { label: s("Fit all curves (Framing)"), icon: "pi-arrows-alt", shortcut: "F", run: () => bt(this) },
        { label: s("Set key at playhead"), icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: this.showCurveHandles ? s("Hide Bézier handles") : s("Show Bézier handles"), icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
        null,
        {
          label: s("Interpolation"),
          icon: "pi-chart-line",
          disabled: k,
          items: L.map((R) => ({
            label: R.replaceAll("_", " "),
            checked: C === R,
            run: () => this.setSelectedKeysInterpolation(R)
          }))
        },
        {
          label: s("Tangents"),
          icon: "pi-share-alt",
          disabled: k,
          items: Z.map((R) => ({
            label: R[0].toUpperCase() + R.slice(1),
            checked: A === R,
            run: () => this.setSelectedKeysTangentMode(R)
          }))
        },
        null,
        {
          label: s("Keyframe operations"),
          icon: "pi-sliders-v",
          items: No(this, i, t, We)
        },
        null,
        { label: _ >= 2 ? s("Delete {count} keys").replace("{count}", String(_)) : s("Delete selected key"), icon: "pi-trash", danger: !0, disabled: k, run: () => this.deleteSelectedKeyframes() }
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
      const T = this.node;
      try {
        if (T && typeof T.computeSize == "function" && typeof T.setSize == "function") {
          const _ = T.computeSize();
          Array.isArray(_) && T.setSize([T.size?.[0] ?? _[0], _[1]]);
        }
        T?.graph?.setDirtyCanvas?.(!0, !0);
      } catch {
      }
      this.scheduleResizeAndRender();
    },
    resizeCanvas() {
      const T = this.root.querySelector(".viewport-wrap");
      if (!T) return;
      const _ = Math.min(2, window.devicePixelRatio || 1), k = T.clientWidth || 320, w = T.clientHeight || 180, C = Math.max(320, Math.round(k * _)), A = Math.max(180, Math.round(w * _));
      (this.canvas.width !== C || this.canvas.height !== A) && (this.canvas.width = C, this.canvas.height = A);
      for (const L of this.cameraPreviewCanvases.values()) {
        const Z = L.clientWidth || 220, R = L.clientHeight || 124, ne = Math.max(_, Gh / Math.max(1, Z)), ke = Math.max(1, Math.round(Z * ne)), Ae = Math.max(1, Math.round(R * ne));
        (L.width !== ke || L.height !== Ae) && (L.width = ke, L.height = Ae);
      }
      this.drawCurveEditor();
    }
  };
}
function Cs(e) {
  e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshKeyEditor(), e.refreshInspector(), e.drawCurveEditor(), e.render();
}
function Xh(e, t) {
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a) return;
  e.checkpoint("Reset camera animation"), e.finishCameraEdit();
  const o = En();
  o.position = [0, 0, 0], o.target = [0, 0, -1], a.camera = ye(o), a.keyframes = [{ frame: 0, camera: ye(o), interpolation: "ease" }], e.state.active_camera_id = a.id, e.state.camera = ye(o), e.state.keyframes = a.keyframes, e.camera = ye(o), e.frame = 0, e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = 0, e.editingKeyFrame = null, e.cameraEditKey = null, e.cameraEditActive = !1, e.cameraPreviewSignature = "", Cs(e), e.refreshCameraSelectors(), e.setStatus(s(`${a.name} animation reset`));
}
function Zh(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint("Reset object animation"), a.keyframes = [], a.position = [0, 0, 0], a.rotation = [0, 0, 0], e.frame = 0, e.selectedEntity = "object", e.selectedObjectId = a.id, e.selectedKeyFrame = null, e.editingKeyFrame = null, Cs(e), e.setStatus(s(`${a.name || a.type} animation reset`)));
}
const dn = { motion: "motion", shot: "display", health: "health" }, Jh = {
  object: "Object",
  camera: "Camera",
  camera_target: "Look-At Target",
  camera_path: "Camera Path"
}, Qh = { motion: "Motion", shot: "Shot", health: "Health" }, eu = ["entity", "motion", "shot", "health"];
function _s(e) {
  return e.inspectorMode && e.inspectorMode !== "entity" ? e.inspectorMode : "entity";
}
function tu(e) {
  const t = _s(e);
  return dn[t] ? dn[t] : e.selectedEntity === "object" ? "scene" : "camera";
}
function au(e) {
  return [
    e.selectedEntity || "",
    e.selectedObjectId || "",
    e.selectedKeyFrame ?? "",
    [...e.selectedObjectIds || []].sort().join(",")
  ].join("|");
}
function ou(e) {
  const t = au(e);
  e._lastInspectorSelKey !== void 0 && e._lastInspectorSelKey !== t && (e.inspectorMode = "entity"), e._lastInspectorSelKey = t, Es(e);
}
function Es(e) {
  const t = tu(e);
  for (const n of e.root.querySelectorAll("[data-tab-panel]"))
    n.hidden = n.dataset.tabPanel !== t;
  const a = t === "motion";
  e.root.classList.toggle("oc-motion-mode", a), !a && (e.state?.motion_tool || "select") !== "select" && (e.state.motion_tool = "select", e.motionTrackDraft = null);
  const o = _s(e);
  for (const n of e.root.querySelectorAll("[data-inspector-mode]")) {
    const i = n.dataset.inspectorMode === o;
    n.classList.toggle("active", i), n.setAttribute("aria-pressed", String(i));
  }
  const r = e.root.querySelector('[data-role="inspector-title"]');
  r && (r.textContent = o === "entity" ? s(Jh[e.selectedEntity] || "Inspector") : s(Qh[o] || "Inspector"));
}
function ru(e, t) {
  e.inspectorMode = eu.includes(t) ? t : "entity", Es(e), e.render?.(), e.refitNode?.();
}
function nu(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: f, playblastCameraTrack: d, restoreFromWidgets: h, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: y, bindEditorEvents: g, activateCamera: v, addCamera: S, deleteCamera: x, drawPreviewOverlays: E, duplicateCamera: M, maximizeCameraPreview: K, refreshCameraPreviews: P, refreshCameraSelectors: G, renameCamera: B, setPlayblastCamera: U, toggleCameraView: re, captureRealtime: j, makePlayblast: O, uploadDirectorPlayblast: q, waitForMediaFrame: H, computeAudioPeaks: ae, loadAudioFile: $, releaseAudio: W, stopPlay: I, togglePlay: V, applyCameraPreset: X, applyCameraShake: le, applyProxyPreset: de, clearViewportBgImage: Q, loadViewportBgFile: me, loadViewportBgSequence: be, drawCameraPath: fe, drawCard: ve, drawCube: F, drawGrid: N, drawHuman: se, drawLine3D: ce, drawNull: he, drawOverlays: pe, drawPointField: oe, drawSpeedHeatmap: Se, drawSphere: Rt, curveChannels: Dt, drawCurveEditor: mt, onCurvePointerDown: pt, onCurvePointerMove: ft, onCurvePointerUp: ht, onTimelinePointerDown: qt, onTimelinePointerMove: Bt, onTimelinePointerUp: Wt, refreshKeys: ut, resetCurveZoom: bt, resetTimelineZoom: Ze, setChannelFilter: gt, setCurveInterpolation: yt, setTangentMode: vt, timelineFrameFromEvent: Vt, toggleCurveHandles: xt, zoomCurve: Ut, drawTransformGizmo: Ht, frameTarget: Gt, gizmoAxes: Yt, gizmoGeometry: Xt, onPointerDown: Zt, onPointerMove: Jt, onPointerUp: Qt, onWheel: ea, pickGizmo: ta, pickSceneObject: aa, resetCamera: wt, setTransformMode: kt, setViewMode: oa, viewportCamera: ra, loadCardFile: _o, loadExecutionPreview: Eo, loadMediaUrl: na, loadModelFile: sa, loadSelectedReference: ia, onModelLoaded: ca, restoreAssets: la, syncUpstreamInputs: da, configureDomMedia: ma, refreshSetupDiagnostic: St, addMediaCard: pa, addPrimitive: fa, applyObjectAnimationFrame: ha, beginCameraEdit: ua, beginObjectEdit: ba, commitCameraEdit: ga, commitObjectEdit: ya, copyKeyframe: va, deleteKeyframe: xa, deleteObject: wa, deleteSelectedObjects: ka, duplicateObject: Sa, exitKeyEdit: ja, finishCameraEdit: Ca, goToAdjacentKey: _a, insertKeyframe: Ea, loadSelectedKeyView: $a, pasteKeyframe: Ma, playblastCameraAtFrame: Aa, refreshInspector: Ta, refreshKeyEditor: Ia, refreshObjects: Pa, removeObjectResources: Oa, renameObject: za, retimeSelectedKey: Fa, selectKeyframe: La, selectedKeyframe: Na, selectedObject: Ka, selectObjectAnimation: Ra, setKeyInterpolation: Da, setKeyTangentMode: qa, setObjectParent: We, timelineKeyframes: Ba, timelineObject: Wa, toggleAutoKey: Va, toggleObject: Ua, updateCameraFromHud: Ha, updateCameraRotationFromHud: Ga, updateEditState: Ya, updateKeyVisualState: jt, updateSelectedKey: Xa, updateSelectedObject: Za, clamp: Ja, cloneCamera: Ct, configureCore: $o, defaultCamera: Je, sampleCamera: Le, sampleObjectTransform: T, sanitizeState: _, worldTransform: k } = e;
  return {
    setChannelFilter(w) {
      gt(this, w);
    },
    setFrame(w, C = !1, A = !0) {
      this.frame = Ja(Math.round(w), 0, this.state.duration_frames - 1), this.editingKeyFrame !== this.frame && (this.editingKeyFrame = null), this.camera = Le(this.activeCameraTrack(), this.frame, this.state.objects), Mt(this, this.activeCameraTrack(), this.camera, this.frame), this.applyObjectAnimationFrame();
      const L = this.dom ||= Yn(this.root);
      for (const J of L.frames) document.activeElement !== J && (J.value = String(this.frame));
      for (const J of L.scrubs) J.value = String(this.frame);
      for (const J of L.cameraFov) document.activeElement !== J && (J.value = String(Math.round(this.camera.fov * 100) / 100));
      for (const J of L.cameraRoll) document.activeElement !== J && (J.value = String(Math.round((this.camera.roll || 0) * 100) / 100));
      for (const J of L.cameraFocal) document.activeElement !== J && (J.value = nr(this.camera.fov));
      for (const J of L.viewportZoom) J.textContent = `${(Number(this.camera.zoom) || 1).toFixed(2)}x`;
      for (const J of L.cameraType) document.activeElement !== J && (J.value = this.camera.camera_type || "perspective");
      for (const J of L.cameraNear) document.activeElement !== J && (J.value = String(this.camera.near ?? 0.01));
      for (const J of L.cameraFar) document.activeElement !== J && (J.value = String(this.camera.far ?? 1e4));
      const Z = this.frame / this.state.fps;
      for (const J of this.cardMediaById.values()) J instanceof HTMLVideoElement && Number.isFinite(J.duration) && J.duration > 0 && (J.currentTime = Z % J.duration);
      const R = Math.floor(Z / 60), ne = Math.floor(Z % 60), ke = Math.floor(Z % 1 * 1e3), Ae = this.frame % Math.max(1, Math.round(this.state.fps)), Ve = Math.floor(this.frame / this.state.fps);
      if ((L.time || this.root.querySelector('[data-role="time"]')).textContent = this.state.timecode_mode === "timecode" ? `${String(Math.floor(Ve / 3600)).padStart(2, "0")}:${String(Math.floor(Ve / 60) % 60).padStart(2, "0")}:${String(Ve % 60).padStart(2, "0")}:${String(Ae).padStart(2, "0")}` : `${String(R).padStart(2, "0")}:${String(ne).padStart(2, "0")}.${String(ke).padStart(3, "0")}`, A) this.refreshKeys();
      else {
        uo(this);
        for (const J of this.root.querySelectorAll("[data-key-frame]")) {
          const te = Number(J.dataset.keyFrame);
          J.classList.toggle("at-playhead", te === this.frame), J.classList.toggle("selected", te === this.selectedKeyFrame), J.classList.toggle("editing", te === this.editingKeyFrame);
        }
        this.refreshKeyEditor(), this.drawCurveEditor();
      }
      C || this.serialize(), this.refreshInspector(), C && this.playing && !this.recording ? this.requestRender("frame") : this.render();
    },
    timelineObject() {
      return Wa(this);
    },
    timelineKeyframes() {
      return Ba(this);
    },
    // The camera key the playhead is parked on, or null when between keys.
    // The new-key interpolation select branches on this directly; other camera
    // edits go through beginCameraEdit(), which resolves the same auto-key vs.
    // transient-preview question consistently (and always checkpoints/serializes).
    activeKeyframe() {
      return (this.activeCameraTrack()?.keyframes || []).find((C) => C.frame === this.frame) || null;
    },
    applyObjectAnimationFrame() {
      ha(this, T);
    },
    insertKeyframe() {
      for (const w of this.root.querySelectorAll('[data-act="key"]'))
        w.classList.remove("key-pulse"), w.offsetWidth, w.classList.add("key-pulse");
      Ea(this);
    },
    setKeyInterpolation(w) {
      Da(this, w);
    },
    setKeyTangentMode(w) {
      qa(this, w);
    },
    deleteKeyframe() {
      xa(this);
    },
    copyKeyframe() {
      va(this);
    },
    pasteKeyframe() {
      Ma(this);
    },
    resetCamera() {
      wt(this, Je);
    },
    resetCameraAnimation(w) {
      Xh(this, w);
    },
    resetObjectAnimation(w) {
      Zh(this, w);
    },
    selectedKeyframe() {
      return Na(this);
    },
    selectKeyframe(w) {
      La(this, w);
    },
    beginCameraEdit() {
      return ua(this);
    },
    commitCameraEdit() {
      ga(this);
    },
    finishCameraEdit() {
      Ca(this);
    },
    exitKeyEdit(w = !1) {
      ja(this, w);
    },
    toggleAutoKey() {
      Va(this);
    },
    updateEditState() {
      Ya(this);
    },
    updateKeyVisualState() {
      jt(this);
    },
    curveChannels() {
      return Dt(this);
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
      if (!Co.includes(w)) return;
      const A = this.activeCameraTrack()?.keyframes || [], L = A.findIndex((Z) => Z.frame === this.selectedKeyFrame);
      if (L < 0) {
        this.setStatus(s("Select a camera keyframe first"));
        return;
      }
      this.checkpoint(s("Camera path handle: {mode}").replace("{mode}", w)), Uh(A[L], w, {
        prevKey: A[L - 1] || null,
        nextKey: A[L + 1] || null
      }), this.webgl && (this.webgl.pathKey = ""), this.serialize(), this.refreshKeys(), this.setFrame(this.frame, !1, !1), this.render(), this.setStatus(s("Curve handle updated"));
    },
    // Called from the viewport drag loop (viewport-controls/interactions.js) so
    // that eagerly-loaded module needs no static import of the curve maths.
    dragCurveHandle(w, C, A, L) {
      Vh(w, C, A, L || {});
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
      const A = Gi(C.keyframes, { origin: Yi(C.keyframes), ...w });
      return C.keyframes = A, C.id === this.state.active_camera_id && (this.state.keyframes = A), this.camera = Le(C, this.frame, this.state.objects), C.camera = Ct(this.camera), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.renderCameraView?.(), !0;
    },
    toggleCurveHandles() {
      xt(this);
    },
    onTimelineWheel(w) {
      onTimelineWheel(this, w);
    },
    resetTimelineZoom() {
      Ze(this);
    },
    toggleInspector(w) {
      const C = this.root.querySelector('[data-role="viewport-inspector"]');
      if (!C) return;
      const A = w !== void 0 ? w : C.dataset.collapsed !== "true";
      C.dataset.collapsed = String(A);
      for (const L of this.root.querySelectorAll('[data-act="toggle-inspector"]'))
        L.classList.toggle("active", !A), L.setAttribute("aria-pressed", String(!A));
      this.setStatus(A ? "Inspector hidden (N)" : "Inspector shown");
    },
    refreshKeys() {
      ut(this);
    },
    refreshKeyEditor() {
      Ia(this);
    },
    retimeSelectedKey(w, C = !1) {
      Fa(this, w, C);
    },
    updateSelectedKey() {
      Xa(this);
    },
    updateKeyFromView() {
      updateKeyFromView(this);
    },
    loadSelectedKeyView() {
      $a(this);
    },
    goToAdjacentKey(w) {
      _a(this, w);
    },
    addPrimitive(w) {
      fa(this, w);
    },
    async renameObject(w) {
      return za(this, w);
    },
    duplicateObject(w) {
      Sa(this, w);
    },
    toggleObject(w) {
      Ua(this, w);
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
      let A = !0;
      for (; A; ) {
        A = !1;
        for (const L of this.state.objects)
          L.parent_id && C.has(L.parent_id) && !C.has(L.id) && (C.add(L.id), A = !0);
      }
      this.selectedObjectIds = C, this.selectedObjectId = w, this.selectedEntity = "object", this.refreshObjects(), this.refreshInspector(), this.render(), this.setStatus(`Hierarchy selected: ${C.size} object(s)`);
    },
    async deleteObject(w) {
      return wa(this, w);
    },
    async deleteSelectedObjects() {
      return ka(this);
    },
    duplicateSelectedObjects() {
      return bh(this);
    },
    toggleSelectedObjects(w = null) {
      return gh(this, w);
    },
    lockSelectedObjects(w = null) {
      return yh(this, w);
    },
    selectAllObjects() {
      return vh(this);
    },
    deselectAll() {
      return ks(this);
    },
    invertSelection() {
      return xh(this);
    },
    addMediaCard() {
      pa(this);
    },
    selectedObject() {
      return Ka(this);
    },
    playblastCameraAtFrame() {
      return Mt(this, d(this), Aa(this, Le), this.frame);
    },
    viewportCamera() {
      return ra(this);
    },
    setViewMode(w) {
      oa(this, w);
    },
    toggleCameraView() {
      re(this);
    },
    setDensity(w) {
      ["basic", "animation", "advanced"].includes(w) || (w = "advanced"), this.state.ui_density = w, this.root.dataset.density = w, this.root.querySelector('[data-role="ui-density"]').value = w;
      const C = this.root.querySelector("[data-inspector-mode].active");
      C && getComputedStyle(C).display === "none" && this.setInspectorMode("entity"), this.serialize(), requestAnimationFrame(() => {
        this.resizeCanvas(), this.render();
      }), this.setStatus(`Interface: ${w}`);
    },
    lookAtObject(w) {
      const C = this.state.objects.find((A) => A.id === w);
      if (C) {
        this.checkpoint("Look-at constraint");
        for (const A of this.state.cameras)
          for (const L of A.keyframes) L.camera.target = [...C.position || [0, 1.5, 0]];
        this.camera = Le(this.state, this.frame), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(`Cameras look at ${C.name || C.type}`);
      }
    },
    setTransformMode(w) {
      kt(this, w);
    },
    refreshInspector() {
      this.perf && (this.perf.inspectorRefreshCount = (this.perf.inspectorRefreshCount || 0) + 1), Ta(this), ou(this);
    },
    setInspectorMode(w) {
      ru(this, w);
    },
    updateSelectedObject() {
      Za(this);
    },
    beginObjectEdit(w) {
      return ba(this, w);
    },
    commitObjectEdit(w) {
      ya(this, w);
    },
    updateCameraFromHud() {
      Ha(this);
    },
    updateCameraRotationFromHud() {
      Ga(this);
    },
    selectObjectAnimation(w) {
      Ra(this, w);
    },
    setObjectParent(w) {
      We(this, w);
    },
    applyProxyPreset(w) {
      const C = { balanced: { mode: "omni_ref", burn: !1 }, parallax: { mode: "point_field", burn: !1 }, subject: { mode: "card_grid", burn: !1 }, debug: { mode: "omni_ref", burn: !0 } }, A = C[w] || C.balanced;
      this.state.render_mode = A.mode, this.state.burn_in = A.burn, this.root.querySelector('[data-role="mode"]').value = A.mode, this.root.querySelector('[data-role="burn-in"]').checked = A.burn, this.modeWidget && (this.modeWidget.value = A.mode), this.serialize(), this.render(), this.setStatus(`Proxy preset: ${w}`);
    },
    createH3Setup() {
      this.setStatus("Connect Motion Scene and Playblast Video to OmniCam Monitor");
    },
    refreshObjects() {
      Pa(this);
    },
    removeObjectResources(w) {
      Oa(this, w);
    },
    aimAtSelectedObject(w) {
      this.checkpoint("Aim & track subject");
      const C = this.activeCameraTrack(), A = w && this.state.objects.find((R) => R.id === w) || this.selectedObject() || this.state.objects.find((R) => R.id === "subject") || this.state.objects[0];
      if (!A) return;
      C.target_object_id !== A.id && (C.aim_bone = null), C.target_object_id = A.id, C.id === this.state.active_camera_id && (this.state.target_object_id = A.id, this.state.aim_bone = C.aim_bone);
      const Z = (A.type === "model" || A.type === "glb" ? this.webgl?.getObjectWorldCenter?.(A.id) : null) || (A.keyframes?.length ? T(A, this.frame).position : A.position || [0, 1.5, 0]);
      this.camera.target = [...Z], this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit(), this.serialize(), this.refreshInspector(), this.updateHudCamera(), this.render(), this.setStatus(`Camera tracking locked to ${A.name || A.id}`);
    },
    setAimBone(w) {
      Jf(this, w);
    },
    bakeAimConstraint(w) {
      Qf(this, w);
    },
    setCameraTrackingTarget(w) {
      this.checkpoint("Change camera tracking target");
      const C = this.activeCameraTrack();
      C.target_object_id !== (w || null) && (C.aim_bone = null), C.target_object_id = w || null, C.id === this.state.active_camera_id && (this.state.target_object_id = w || null, this.state.aim_bone = C.aim_bone), this.camera = Le(C, this.frame, this.state.objects), Mt(this, C, this.camera, this.frame), this.serialize(), this.refreshInspector(), this.render(), this.setStatus(w ? `Camera tracking: ${w}` : "Camera tracking disabled (manual target)");
    },
    bakeAimToKeyframes() {
      this.checkpoint("Bake aim to keyframes");
      const w = this.activeCameraTrack(), C = w.target_object_id || this.state.target_object_id || "subject", A = this.state.objects.find((Z) => Z.id === C) || this.state.objects[0];
      if (!A || !w.keyframes?.length) return;
      const L = A.type === "model" || A.type === "glb" ? this.webgl?.getObjectWorldCenter?.(A.id) : null;
      for (const Z of w.keyframes) {
        const R = (A.type === "model" || A.type === "glb") && L && !A.keyframes?.length ? L : A.keyframes?.length ? T(A, Z.frame).position : A.position || [0, 1.5, 0];
        Z.camera.target = [...R];
      }
      w.id === this.state.active_camera_id && (this.state.keyframes = w.keyframes), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(`Aim baked across all keyframes following ${A.name || A.id}`);
    }
  };
}
function su(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: f, playblastCameraTrack: d, restoreFromWidgets: h, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: y, bindEditorEvents: g, activateCamera: v, addCamera: S, deleteCamera: x, drawPreviewOverlays: E, duplicateCamera: M, maximizeCameraPreview: K, refreshCameraPreviews: P, refreshCameraSelectors: G, renameCamera: B, setPlayblastCamera: U, toggleCameraView: re, captureRealtime: j, makePlayblast: O, uploadDirectorPlayblast: q, waitForMediaFrame: H, computeAudioPeaks: ae, loadAudioFile: $, releaseAudio: W, stopPlay: I, togglePlay: V, applyCameraPreset: X, applyCameraShake: le, applyProxyPreset: de, clearViewportBgImage: Q, loadViewportBgFile: me, loadViewportBgSequence: be, drawCameraPath: fe, drawCard: ve, drawCube: F, drawGrid: N, drawHuman: se, drawLine3D: ce, drawNull: he, drawOverlays: pe, drawPointField: oe, drawSpeedHeatmap: Se, drawSphere: Rt, curveChannels: Dt, drawCurveEditor: mt, fitCurveView: pt, onCurveDoubleClick: ft, onCurvePointerDown: ht, onCurvePointerMove: qt, onCurvePointerUp: Bt, onTimelinePointerDown: Wt, onTimelinePointerMove: ut, onTimelinePointerUp: bt, refreshKeys: Ze, resetCurveZoom: gt, resetTimelineZoom: yt, setChannelFilter: vt, setCurveInterpolation: Vt, setTangentMode: xt, timelineFrameFromEvent: Ut, toggleCurveHandles: Ht, zoomCurve: Gt, drawTransformGizmo: Yt, frameTarget: Xt, gizmoAxes: Zt, gizmoGeometry: Jt, onPointerDown: Qt, onPointerMove: ea, onPointerUp: ta, onWheel: aa, pickGizmo: wt, pickSceneObject: kt, resetCamera: oa, setTransformMode: ra, setViewMode: _o, viewportCamera: Eo, loadCardFile: na, loadExecutionPreview: sa, loadMediaUrl: ia, loadModelFile: ca, loadSelectedReference: la, onModelLoaded: da, restoreAssets: ma, syncUpstreamInputs: St, configureDomMedia: pa, refreshSetupDiagnostic: fa, addMediaCard: ha, addPrimitive: ua, applyObjectAnimationFrame: ba, beginCameraEdit: ga, beginObjectEdit: ya, commitCameraEdit: va, commitObjectEdit: xa, copyKeyframe: wa, deleteKeyframe: ka, deleteObject: Sa, duplicateObject: ja, exitKeyEdit: Ca, finishCameraEdit: _a, goToAdjacentKey: Ea, insertKeyframe: $a, loadSelectedKeyView: Ma, pasteKeyframe: Aa, playblastCameraAtFrame: Ta, refreshInspector: Ia, refreshKeyEditor: Pa, refreshObjects: Oa, removeObjectResources: za, renameObject: Fa, retimeSelectedKey: La, selectKeyframe: Na, selectedKeyframe: Ka, selectedObject: Ra, selectObjectAnimation: Da, setKeyInterpolation: qa, setObjectParent: We, timelineKeyframes: Ba, timelineObject: Wa, toggleAutoKey: Va, toggleObject: Ua, updateCameraFromHud: Ha, updateEditState: Ga, updateKeyVisualState: Ya, updateSelectedKey: jt, updateSelectedObject: Xa, clamp: Za, cloneCamera: Ja, configureCore: Ct, defaultCamera: $o, sampleCamera: Je, sampleObjectTransform: Le, sanitizeState: T, worldTransform: _ } = e;
  return {
    setTargetAtCursor(k) {
      if (!k) return;
      const w = this.interactionElement.getBoundingClientRect(), C = (k.clientX - w.left) * this.canvas.width / Math.max(1, w.width), A = (k.clientY - w.top) * this.canvas.height / Math.max(1, w.height), L = this.webgl?.intersectScenePoint?.(C, A, this.canvas.width, this.canvas.height);
      L && (this.checkpoint("Set camera target"), this.beginCameraEdit(), this.camera.target = [
        Math.round(L[0] * 1e3) / 1e3,
        Math.round(L[1] * 1e3) / 1e3,
        Math.round(L[2] * 1e3) / 1e3
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
      I(this);
    },
    computeAudioPeaks() {
      ae(this);
    },
    async loadAudioFile(k) {
      return $(this, k);
    },
    applyCameraPreset(k) {
      X(this, k);
    },
    applyCameraShake(k) {
      le(this, k);
    },
    applyProxyPreset(k) {
      de(this, k);
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
      return Zt(this, k);
    },
    gizmoGeometry(k) {
      return Jt(this, k);
    },
    pickGizmo(k) {
      return wt(this, k);
    },
    pickSceneObject(k) {
      return kt(this, k);
    },
    drawTransformGizmo() {
      Yt(this);
    },
    // Routed through the facade so the eagerly-loaded key interceptor
    // (web-src/commands.js) keeps no static import of the Director-only
    // camera-path-draw module -- that edge dragged cameras.js and the panel
    // template string onto ComfyUI's startup path. See production-bundle test.
    cancelCameraPathDraw() {
      return Pe(this);
    },
    onPointerDown(k) {
      Op(this, k) || Qt(this, k);
    },
    onPointerMove(k) {
      zp(this, k) || ea(this, k);
    },
    onPointerUp(k) {
      Fp(this, k) || ta(this, k);
    },
    onWheel(k) {
      aa(this, k);
    },
    timelineFrameFromEvent(k, w) {
      return Ut(this, k, w);
    },
    onTimelinePointerDown(k) {
      Wt(this, k);
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
      Ze(this);
    },
    drawCurveEditor() {
      mt(this);
    },
    toggleCurveHandles() {
      Ht(this);
    },
    setCurveInterpolation(k) {
      Vt(this, k);
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
      qt(this, k);
    },
    onCurvePointerUp(k) {
      Bt(this, k);
    },
    zoomCurve(k) {
      Gt(this, k);
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
      Xt(this, k);
    },
    async loadMediaUrl(k, w, C, A) {
      return ia(this, k, w, C, A);
    },
    restoreAssets() {
      ma(this);
    },
    onModelLoaded(k) {
      da(this, k);
    },
    async loadModelFile(k) {
      return ca(this, k);
    },
    async loadCardFile(k) {
      return na(this, k);
    },
    loadExecutionPreview(k) {
      sa(this, k);
    },
    loadSelectedReference() {
      la(this);
    },
    drawLine3D(k, w, C = "#5a5a5a", A = 1) {
      ce(this, k, w, C, A);
    },
    drawGrid() {
      N(this);
    },
    drawPointField() {
      oe(this);
    },
    drawCube(k) {
      F(this, k);
    },
    drawSphere(k) {
      Rt(this, k);
    },
    drawHuman(k) {
      se(this, k);
    },
    drawNull(k) {
      he(this, k);
    },
    drawCard(k) {
      ve(this, k);
    },
    drawCameraPath() {
      fe(this);
    },
    drawSpeedHeatmap() {
      Se(this);
    },
    drawOverlays() {
      pe(this);
    },
    async loadViewportBgFile(k) {
      return me(this, k);
    },
    async loadViewportBgSequence(k) {
      return be(this, k);
    },
    clearViewportBgImage() {
      Q(this);
    }
  };
}
const iu = [
  { id: "x", label: "X", vector: [1, 0, 0], color: "#e5484d" },
  { id: "y", label: "Y", vector: [0, 1, 0], color: "#46a758" },
  { id: "z", label: "Z", vector: [0, 0, 1], color: "#4a8fe7" }
];
function cu(e) {
  const { right: t, up: a, forward: o } = Xi(e || {});
  return iu.map((r) => {
    const [n, i, c] = r.vector, l = n * t[0] + i * t[1] + c * t[2], p = n * a[0] + i * a[1] + c * a[2], m = -(n * o[0] + i * o[1] + c * o[2]);
    return { id: r.id, label: r.label, color: r.color, x: l, y: -p, depth: m };
  });
}
function lu(e) {
  return [...e].sort((t, a) => t.depth - a.depth);
}
function du(e) {
  return 0.45 + 0.55 * ((Math.max(-1, Math.min(1, e)) + 1) / 2);
}
const mu = "http://www.w3.org/2000/svg", ot = 26, mn = 17, pu = 5.4;
function rt(e, t) {
  const a = document.createElementNS(mu, e);
  for (const [o, r] of Object.entries(t)) a.setAttribute(o, String(r));
  return a;
}
function fu(e) {
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
  for (const n of lu(cu(a))) {
    const i = ot + n.x * mn, c = ot + n.y * mn, l = du(n.depth);
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
      r: pu,
      fill: p ? n.color : "transparent",
      stroke: n.color,
      "stroke-width": 1.4,
      opacity: l,
      "data-axis": n.label.toLowerCase(),
      tabindex: "0",
      role: "button",
      "aria-label": s("View: {axis} axis").replace("{axis}", n.label),
      "pointer-events": "auto"
    }), f = rt("title", {});
    if (f.textContent = s("View: {axis} axis").replace("{axis}", n.label), m.appendChild(f), t.appendChild(m), p) {
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
function hu(e, t, a, o, r) {
  if (["world_point", "object_point", "camera_field"].includes(t.source_kind)) {
    const n = or(e, t.source, a, o, r);
    return n ? [n] : [];
  }
  return (t.keys || []).map((n) => ({ ...n }));
}
function uu(e) {
  if (e.recording) return;
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  t.save();
  for (const r of e.state.motion_layers || []) {
    if (!r.enabled) continue;
    const n = hu(e.state, r, e.frame, a, o);
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
const bu = ["world_point", "object_point", "camera_field"], $s = {
  manual_2d: "DRAW",
  object_point: "OBJECT",
  world_point: "WORLD",
  static_anchor: "SCREEN",
  camera_field: "FIELD"
};
function gu(e, t) {
  const a = t.source || {};
  if (t.source_kind === "object_point" && a.object_id) {
    const o = (e.objects || []).find((r) => r.id === a.object_id);
    return o ? o.name || o.id : `${a.object_id} (missing)`;
  }
  return t.source_kind === "world_point" ? "World point" : t.source_kind === "camera_field" ? a.preset ? `${a.preset} field` : "Camera field" : "Screen";
}
function yu(e, t) {
  if (bu.includes(t.source_kind)) {
    const a = or(e, t.source, 0, e.width || 1280, e.height || 720);
    return a ? a.visible !== !1 : !1;
  }
  return t.keys?.[0]?.visible !== !1;
}
function vu(e, t) {
  return (e.keys || []).reduce(
    (a, o) => a && Math.abs(a.time_seconds - t) <= Math.abs(o.time_seconds - t) ? a : o,
    null
  );
}
function xu(e) {
  const t = e.root.querySelector('[data-role="motion-layers"]');
  if (!t) return;
  const a = e.state.motion_layers || [], o = e.state.selected_motion_layer_id;
  t.replaceChildren();
  for (const n of a) {
    const i = document.createElement("button");
    i.type = "button", i.className = "motion-layer-row", i.dataset.motionLayerId = n.id, i.classList.toggle("active", n.id === o), i.innerHTML = `<i class="pi ${n.enabled ? "pi-eye" : "pi-eye-slash"}"></i><span></span><small class="motion-badge"></small>`, i.querySelector("span").textContent = n.label, i.querySelector("small").textContent = $s[n.source_kind] || "TRACK", i.addEventListener("click", () => {
      e.state.selected_motion_layer_id = n.id, e.render();
    }), t.appendChild(i);
  }
  const r = e.root.querySelector('[data-role="motion-layers-empty"]');
  r && (r.hidden = !!a.length), wu(e), ku(e);
}
function wu(e) {
  const t = e.root.querySelector('[data-role="motion-selected"]');
  if (!t) return;
  const a = (e.state.motion_layers || []).find((d) => d.id === e.state.selected_motion_layer_id) || null;
  if (t.hidden = !a, !a) return;
  const o = Math.max(1, Number(e.state.fps) || 24), r = (a.keys || []).map((d) => Math.round(d.time_seconds * o)), n = (d, h) => {
    const u = t.querySelector(`[data-role="${d}"]`);
    u && (u.textContent = h);
  };
  n("motion-sel-name", a.label), n("motion-sel-type", $s[a.source_kind] || "TRACK"), n("motion-sel-binding", gu(e.state, a)), n("motion-sel-start", r.length ? Math.min(...r) : 0), n("motion-sel-end", r.length ? Math.max(...r) : 0);
  const i = a.source_kind === "object_point" && a.source?.object_id && !(e.state.objects || []).some((d) => d.id === a.source.object_id);
  t.classList.toggle("motion-invalid", !!i);
  const c = !i && !yu(e.state, a);
  t.classList.toggle("motion-warn", c);
  const l = t.querySelector('[data-role="motion-sel-warn"]');
  l && (l.hidden = !c, l.textContent = c ? s("Not visible on the first frame — ATI, Wan Track and LTX Motion drop tracks hidden at frame 0. Move the point into frame at frame 0 or switch to Screen Anchor.") : "");
  const p = t.querySelector('[data-role="motion-interpolation"]');
  p && (p.value = a.keys?.[0]?.interpolation || "linear");
  const m = t.querySelector('[data-role="motion-key-visible"]');
  if (m) {
    const d = vu(a, (e.frame || 0) / o);
    m.checked = d ? d.visible !== !1 : !0;
  }
  const f = t.querySelector('[data-motion-layer-action="toggle"] i');
  f && (f.className = `pi ${a.enabled ? "pi-eye" : "pi-eye-slash"}`);
}
function ku(e) {
  const t = e.root.querySelector('[data-role="motion-creating"]');
  if (!t) return;
  const a = e.state.motion_tool && e.state.motion_tool !== "select";
  if (t.hidden = !a, !a) return;
  const o = t.querySelector('[data-role="motion-creating-label"]');
  o && (o.textContent = e.motionCreatingLabel || "Creating motion track");
}
function Su(e) {
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
function ju(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: l, dispatchDirectorKey: p, activeCameraTrack: m, bindWidgetCallbacks: f, playblastCameraTrack: d, restoreFromWidgets: h, serializeEditorState: u, syncActiveCameraTrack: b, syncFromWidgets: y, bindEditorEvents: g, activateCamera: v, addCamera: S, deleteCamera: x, drawPreviewOverlays: E, duplicateCamera: M, maximizeCameraPreview: K, refreshCameraPreviews: P, refreshCameraSelectors: G, renameCamera: B, setPlayblastCamera: U, toggleCameraView: re, captureRealtime: j, makePlayblast: O, uploadDirectorPlayblast: q, waitForMediaFrame: H, computeAudioPeaks: ae, loadAudioFile: $, releaseAudio: W, stopPlay: I, togglePlay: V, applyCameraPreset: X, applyCameraShake: le, applyProxyPreset: de, clearViewportBgImage: Q, loadViewportBgFile: me, loadViewportBgSequence: be, drawCameraPath: fe, drawCard: ve, drawCube: F, drawCylinder: N, drawGrid: se, drawHuman: ce, drawLine3D: he, drawNull: pe, drawOverlays: oe, drawPointField: Se, drawSpeedHeatmap: Rt, drawSphere: Dt, drawTorus: mt, curveChannels: pt, drawCurveEditor: ft, onCurvePointerDown: ht, onCurvePointerMove: qt, onCurvePointerUp: Bt, onTimelinePointerDown: Wt, onTimelinePointerMove: ut, onTimelinePointerUp: bt, refreshKeys: Ze, resetCurveZoom: gt, resetTimelineZoom: yt, setChannelFilter: vt, setCurveInterpolation: Vt, setTangentMode: xt, timelineFrameFromEvent: Ut, toggleCurveHandles: Ht, zoomCurve: Gt, drawTransformGizmo: Yt, frameTarget: Xt, gizmoAxes: Zt, gizmoGeometry: Jt, onPointerDown: Qt, onPointerMove: ea, onPointerUp: ta, onWheel: aa, pickGizmo: wt, pickSceneObject: kt, resetCamera: oa, setTransformMode: ra, setViewMode: _o, viewportCamera: Eo, loadCardFile: na, loadExecutionPreview: sa, loadMediaUrl: ia, loadModelFile: ca, loadSelectedReference: la, onModelLoaded: da, restoreAssets: ma, syncUpstreamInputs: St, configureDomMedia: pa, refreshSetupDiagnostic: fa, addMediaCard: ha, addPrimitive: ua, applyObjectAnimationFrame: ba, beginCameraEdit: ga, beginObjectEdit: ya, commitCameraEdit: va, commitObjectEdit: xa, copyKeyframe: wa, deleteKeyframe: ka, deleteObject: Sa, duplicateObject: ja, exitKeyEdit: Ca, finishCameraEdit: _a, goToAdjacentKey: Ea, insertKeyframe: $a, loadSelectedKeyView: Ma, pasteKeyframe: Aa, playblastCameraAtFrame: Ta, refreshInspector: Ia, refreshKeyEditor: Pa, refreshObjects: Oa, removeObjectResources: za, renameObject: Fa, retimeSelectedKey: La, selectKeyframe: Na, selectedKeyframe: Ka, selectedObject: Ra, selectObjectAnimation: Da, setKeyInterpolation: qa, setObjectParent: We, timelineKeyframes: Ba, timelineObject: Wa, toggleAutoKey: Va, toggleObject: Ua, updateCameraFromHud: Ha, updateEditState: Ga, updateKeyVisualState: Ya, updateSelectedKey: jt, updateSelectedObject: Xa, clamp: Za, cloneCamera: Ja, configureCore: Ct, defaultCamera: $o, sampleCamera: Je, sampleObjectTransform: Le, sanitizeState: T, worldTransform: _ } = e;
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
      xu(this), Yp(this), Su(this);
    },
    // The main viewport canvas: WebGL (or the 2D fallback), the overlays and the
    // DOM axis gizmo. No motion panels, no camera preview strip.
    renderViewportOnly() {
      const k = this.ctx, w = this.canvas.width, C = this.canvas.height;
      if (k.fillStyle = this.state.viewport_bg_color || "#121212", k.fillRect(0, 0, w, C), this.viewportBgSequenceImages && this.viewportBgSequenceImages.length) {
        const te = this.frame % this.viewportBgSequenceImages.length, Ne = this.viewportBgSequenceImages[te];
        if (Ne?.complete && Ne.naturalWidth)
          try {
            k.drawImage(Ne, 0, 0, w, C);
          } catch {
          }
      } else if (this.viewportBgImage)
        try {
          k.drawImage(this.viewportBgImage, 0, 0, w, C);
        } catch {
        }
      const A = this.state.render_mode, L = this.viewportCamera(), Z = this.state.objects.some((te) => te.parent_id) ? this.state.objects.map((te) => te.parent_id ? { ...te, ..._(this.state.objects, te) } : te) : this.state.objects, R = (this.viewportBgSequenceImages || []).map((te) => te.src), ne = this.viewportBgImage?.src || "", ke = this.pendingExtractorImport, Ae = ke ? [...this.state.cameras, {
        id: "__extractor_preview__",
        name: ke.label,
        color: "#9ca3af",
        camera: ke.track.keyframes[0]?.camera,
        keyframes: ke.track.keyframes
      }] : this.state.cameras, Ve = {
        ...this.state,
        cameras: Ae,
        objects: Z,
        viewport_bg_image: ne,
        viewport_bg_sequence: R,
        __selectedObjectIds: [...this.selectedObjectIds || []],
        __omnicamRevision: `${this.renderRevision || 0}:${ke?.fingerprint || ""}`
      };
      let J = !1;
      if (this.webgl)
        try {
          const te = this.recording ? 1 : this.webgl.supersampleFactor?.() ?? 1, Ne = te > 1 ? Math.min(te, 4096 / Math.max(1, w, C)) : 1, Qa = Ne > 1 ? Math.round(w * Ne) : w, Mo = Ne > 1 ? Math.round(C * Ne) : C;
          this.webgl.render(Ve, L, this.cardMediaById, Qa, Mo, this.modelUrlsById, this.frame, this.recording, this.selectedEntity, this.selectedObjectId, this.subSelection, this.selectedKeyFrame ?? null), k.imageSmoothingEnabled = !0, k.imageSmoothingQuality = "high", Qa !== w || Mo !== C ? k.drawImage(this.webgl.canvas, 0, 0, Qa, Mo, 0, 0, w, C) : k.drawImage(this.webgl.canvas, 0, 0, w, C), J = !0;
        } catch (te) {
          console.error("[OmniCam WebGL Render Error]", te);
        }
      if (!J) {
        (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(A) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes(A) && this.drawPointField();
        for (const te of Z)
          te.enabled !== !1 && (te.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(A) ? this.drawCard(te) : ["cube", "ground", "glb", "model"].includes(te.type) && A !== "grid" && A !== "point_field" ? this.drawCube(te) : te.type === "sphere" && A !== "grid" && A !== "point_field" ? this.drawSphere(te) : te.type === "cylinder" && A !== "grid" && A !== "point_field" ? this.drawCylinder(te) : te.type === "torus" && A !== "grid" && A !== "point_field" ? this.drawTorus(te) : te.type === "human" && A !== "grid" && A !== "point_field" ? this.drawHuman(te) : te.type === "null" && this.drawNull(te));
        !this.recording && this.state.show_camera_paths && this.drawCameraPath();
      }
      !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), !this.recording && Lp(this), this.drawOverlays(), uu(this), this.state.show_gizmo && fu(this), this.labelOverlay?.update(), this.rigOverlay?.update(), this.perf && (this.perf.viewportRenderCount = (this.perf.viewportRenderCount || 0) + 1);
    },
    // The single "something changed, repaint soon" entry point. Every
    // high-frequency source (playback tick, viewport drags, wheel/keyboard
    // navigation) funnels through here so at most one render() runs per frame
    // no matter how many events landed between paints. Discrete one-shot
    // actions can still call render() directly for an immediate repaint.
    requestRender(k = "unknown") {
      return this.requestUiUpdate(z.viewport | z.previews | z.motion, k);
    },
    // Targeted invalidation on top of the existing one-RAF coalescing. Each
    // caller marks only the domains it changed; the animation-frame callback
    // repaints just those, once, however many calls landed between frames.
    requestUiUpdate(k = z.viewport, w = "unknown") {
      (this.renderReasons ||= /* @__PURE__ */ new Set()).add(w), this.uiDirtyMask = Fd(this.uiDirtyMask, k), this.renderInvalidations = (this.renderInvalidations || 0) + 1, !this.renderScheduled && (this.renderScheduled = !0, this.renderFrame = requestAnimationFrame(() => {
        if (this.renderScheduled = !1, this.disposed) return;
        const C = this.uiDirtyMask || z.viewport;
        this.uiDirtyMask = 0, this.lastRenderReasons = [...this.renderReasons || []], this.renderReasons?.clear(), this.rendersCoalesced = (this.rendersCoalesced || 0) + 1, this.perf && (this.perf.renderCount = (this.perf.renderCount || 0) + 1), et(C, z.outliner) && this.refreshObjects(), et(C, z.timeline) && this.refreshKeys(), et(C, z.inspector) && this.refreshInspector(), et(C, z.viewport) && this.renderViewportOnly(), et(C, z.previews) && this.renderCameraView(), et(C, z.motion) && this.renderMotionUiOnly();
      }));
    },
    renderCameraView() {
      if (this.perf && (this.perf.previewRenderCount = (this.perf.previewRenderCount || 0) + 1), this.state.camera_view_visible) {
        if (this.root.querySelector('[data-role="camera-view-row"]')?.hidden) return;
        this.refreshCameraPreviews(), this.cameraPreviewTick = (this.cameraPreviewTick || 0) + 1;
        const w = this.state.cameras, C = !!this.playing && !this.recording && w.length > 2;
        let A = null;
        if (C) {
          const L = this.state.active_camera_id, Z = w.filter((R) => R.id !== L);
          A = Z.length ? Z[this.cameraPreviewTick % Z.length] : null;
        }
        for (const L of w) {
          const Z = this.cameraPreviewCanvases.get(L.id), R = this.cameraPreviewContexts.get(L.id);
          if (!Z?.width || !R) continue;
          const ne = Z.width, ke = Z.height, Ae = this.root.querySelector(`[data-camera-frame="${L.id}"]`);
          if (Ae && (Ae.textContent = `F${this.frame}`), C && L.id !== this.state.active_camera_id && L !== A) continue;
          const Ve = Mt(this, L, Je(L, this.frame, this.state.objects), this.frame);
          if (R.fillStyle = "#111", R.fillRect(0, 0, ne, ke), this.cameraWebgl)
            try {
              this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: !1, viewport_bg_image: this.viewportBgImage?.src || "", viewport_bg_sequence: (this.viewportBgSequenceImages || []).map((J) => J.src), __omnicamRevision: this.renderRevision || 0 }, Ve, this.cardMediaById, ne, ke, this.modelUrlsById, this.frame, !0), R.drawImage(this.cameraWebgl.canvas, 0, 0, ne, ke);
            } catch (J) {
              console.error("[OmniCam Preview Render Error]", J);
            }
          E(this, R, ne, ke);
        }
      }
    },
    drawPreviewOverlays(k, w, C) {
      E(this, k, w, C);
    },
    maximizeCameraPreview(k) {
      K(this, k);
    },
    setStatus(k) {
      (this.dom?.status || this.root.querySelector('[data-role="status"]')).textContent = k;
    },
    async makePlayblast() {
      return O(this);
    },
    async waitForMediaFrame() {
      return H(this);
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
      this.disposed || (this.disposed = !0, Zi(this), Ji(), Ic(this), this.backgroundRequestId = (this.backgroundRequestId || 0) + 1, this.upstreamSyncId = (this.upstreamSyncId || 0) + 1, this.stopPlay(), clearTimeout(this.previewClickTimer), clearTimeout(this.connectionTimer), cancelAnimationFrame(this.restoreFrame), cancelAnimationFrame(this.serializeFrame), cancelAnimationFrame(this.resizeFrame), cancelAnimationFrame(this.renderFrame), this.abortController?.abort(), this.upstreamFetchController?.abort(), this.resizeObserver?.disconnect(), this.contextMenu?.dispose(), this.webgl?.dispose(), this.cameraWebgl?.dispose(), W(this), mf(this), this.objectUrls.clear(), this.cardMediaById.clear(), this.cardMediaAssetById?.clear?.(), this.modelUrlsById.clear(), this.modelInfoById.clear());
    }
  };
}
const Ms = 1e-9;
function Cu(e, t) {
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
function _u(e) {
  const t = e[0]?.length || 0, a = new Array(t).fill(1);
  for (let o = 0; o < t; o += 1) {
    let r = 1 / 0, n = -1 / 0;
    for (const c of e) {
      const l = Number.isFinite(c[o]) ? c[o] : 0;
      l < r && (r = l), l > n && (n = l);
    }
    const i = n - r;
    a[o] = i > Ms ? 1 / i : 0;
  }
  return a;
}
function xr(e, t) {
  const a = e.map((i) => Cu(i, t)), o = _u(a), r = e.map((i) => i.frame), n = Math.max(1, r[r.length - 1] - r[0]);
  return a.map((i, c) => [
    (r[c] - r[0]) / n,
    ...i.map((l, p) => (Number.isFinite(l) ? l : 0) * o[p])
  ]);
}
function pn(e, t) {
  let a = 0;
  for (let o = 0; o < e.length; o += 1) a += (e[o] - t[o]) ** 2;
  return Math.sqrt(a);
}
function wr(e, t, a) {
  let o = 0;
  for (let c = 0; c < t.length; c += 1) o += (a[c] - t[c]) ** 2;
  if (o <= Ms) return pn(e, t);
  let r = 0;
  for (let c = 0; c < t.length; c += 1) r += (e[c] - t[c]) * (a[c] - t[c]);
  const n = Math.max(0, Math.min(1, r / o)), i = t.map((c, l) => c + (a[l] - c) * n);
  return pn(e, i);
}
function Eu(e, t, a) {
  const o = /* @__PURE__ */ new Set([0, e.length - 1]), r = [[0, e.length - 1]];
  for (; r.length; ) {
    const [n, i] = r.pop();
    if (i - n < 2) continue;
    let c = -1, l = -1;
    for (let p = n + 1; p < i; p += 1) {
      const m = wr(e[p], e[n], e[i]);
      m > c && (c = m, l = p);
    }
    l < 0 || (c > t || a.has(l)) && (o.add(l), r.push([n, l], [l, i]));
  }
  return o;
}
function $u(e, t, { tolerance: a = 0.02, keepFrames: o = [] } = {}) {
  const r = [...e].sort((m, f) => m.frame - f.frame);
  if (r.length <= 2 || a <= 0) return { keys: r, removed: 0 };
  const n = xr(r, t), i = /* @__PURE__ */ new Set(), c = new Set(o);
  r.forEach((m, f) => {
    c.has(m.frame) && i.add(f);
  });
  const l = Eu(n, a, i);
  for (const m of i) l.add(m);
  const p = r.filter((m, f) => l.has(f));
  return { keys: p, removed: r.length - p.length };
}
function Mu(e, t, { target: a = 2, keepFrames: o = [] } = {}) {
  let r = [...e].sort((l, p) => l.frame - p.frame);
  const n = Math.max(2, Math.round(a));
  if (r.length <= n) return { keys: r, removed: 0 };
  const i = new Set(o), c = r.length;
  for (; r.length > n; ) {
    const l = xr(r, t);
    let p = -1, m = 1 / 0;
    for (let f = 1; f < r.length - 1; f += 1) {
      if (i.has(r[f].frame)) continue;
      const d = wr(l[f], l[f - 1], l[f + 1]);
      d < m && (m = d, p = f);
    }
    if (p < 0) break;
    r = r.filter((f, d) => d !== p);
  }
  return { keys: r, removed: c - r.length };
}
function Au(e, t, { mergeWithin: a = 1, epsilon: o = 1e-3, keepFrames: r = [] } = {}) {
  const n = [...e].sort((d, h) => d.frame - h.frame), i = n.length, c = new Set(r), l = [];
  for (const d of n) {
    const h = l[l.length - 1];
    h && d.frame - h.frame <= Math.max(0, a) && !c.has(d.frame) || l.push(d);
  }
  if (l.length <= 2) return { keys: l, removed: i - l.length };
  const p = xr(l, t), m = /* @__PURE__ */ new Set();
  for (let d = 1; d < l.length - 1; d += 1) {
    if (c.has(l[d].frame)) continue;
    const h = m.has(d - 1) ? null : d - 1;
    if (h === null) continue;
    wr(p[d], p[h], p[d + 1]) <= o && m.add(d);
  }
  const f = l.filter((d, h) => !m.has(h));
  return { keys: f, removed: i - f.length };
}
function Tu(e, t, { minKeys: a = 0 } = {}) {
  const o = new Set(t), r = e.filter((n) => !o.has(n.frame));
  if (r.length < a) {
    const n = e.filter((i) => o.has(i.frame)).sort((i, c) => i.frame - c.frame);
    for (; r.length < a && n.length; ) r.push(n.shift());
    r.sort((i, c) => i.frame - c.frame);
  }
  return { keys: r, removed: e.length - r.length };
}
function Iu(e, t, a, { lastFrame: o = 1 / 0 } = {}) {
  const r = [...t].sort((m, f) => m - f);
  if (!a || !r.length)
    return { keys: [...e], moved: 0, frames: r };
  const n = new Set(r), i = new Set(e.filter((m) => !n.has(m.frame)).map((m) => m.frame)), c = r.map((m) => m + a);
  return c.some((m) => m < 0 || m > o || i.has(m)) || new Set(c).size !== c.length ? { keys: [...e], moved: 0, frames: r } : { keys: e.map((m) => n.has(m.frame) ? { ...m, frame: m.frame + a } : m).sort((m, f) => m.frame - f.frame), moved: r.length, frames: c.sort((m, f) => m - f) };
}
function Pu(e, t, a) {
  const o = new Set(t);
  return e.map((r) => o.has(r.frame) ? { ...r, interpolation: a } : r);
}
function Ou(e, t, a, o = []) {
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
const zu = 0.12;
function Fu() {
  return {
    /** Selected key frames that still exist on the active track, sorted. */
    resolveSelectedFrames() {
      const e = new Set(we(this).map((a) => a.frame));
      return (this.selectedKeyFrames?.size ? [...this.selectedKeyFrames] : this.selectedKeyFrame != null ? [this.selectedKeyFrame] : []).filter((a) => e.has(a)).sort((a, o) => a - o);
    },
    _activeTrack() {
      const e = Ee(this);
      if (e) return { kind: "object", write: (a) => {
        e.keyframes = a;
      } };
      const t = qo(this);
      return {
        kind: "camera",
        write: (a) => {
          t.keyframes = a, this.state.keyframes = a, Bo(this);
        }
      };
    },
    deleteSelectedKeyframes() {
      let e = this.resolveSelectedFrames();
      if (!e.length) {
        const l = we(this).find((p) => p.frame === this.frame);
        l && (e = [l.frame]);
      }
      if (!e.length) return this.setStatus(s("Select a keyframe to delete"));
      const t = this._activeTrack(), a = we(this), o = t.kind === "camera" ? 1 : 0, { keys: r, removed: n } = Tu(a, e, { minKeys: o });
      if (!n) return this.setStatus(s("Keep at least one camera keyframe"));
      this.checkpoint(n > 1 ? s("Delete {n} keyframes").replace("{n}", n) : "Delete keyframe"), t.write(r);
      const i = we(this), c = e[0];
      this.selectedKeyFrame = i.length ? i.reduce((l, p) => Math.abs(p.frame - c) < Math.abs(l.frame - c) ? p : l).frame : null, this.selectedKeyFrames = this.selectedKeyFrame != null ? /* @__PURE__ */ new Set([this.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.includes(this.editingKeyFrame) && (this.editingKeyFrame = null), this.camera = Ce(this.state, this.frame), this.applyObjectAnimationFrame(), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(n > 1 ? s("{n} keyframes deleted").replace("{n}", n) : s("Keyframe deleted"));
    },
    /** Move every selected key by `delta` frames. Returns false when nothing is selected. */
    nudgeSelectedKeyframes(e) {
      const t = this.resolveSelectedFrames();
      if (!t.length || !e) return !1;
      const a = this._activeTrack(), o = Math.max(0, this.state.duration_frames - 1), r = Iu(we(this), t, e, { lastFrame: o });
      return r.moved ? (this.checkpoint(s("Nudge {n} keyframes").replace("{n}", t.length)), a.write(r.keys), this.selectedKeyFrames = new Set(r.frames), this.selectedKeyFrame = r.frames.at(-1) ?? null, this.editingKeyFrame = null, this.serialize(), this.refreshKeys(), this.setFrame(this.selectedKeyFrame ?? this.frame, !1, !1), this.render(), !0) : (this.setStatus(s("Selected keys cannot move further")), !0);
    },
    setSelectedKeysInterpolation(e) {
      const t = this.resolveSelectedFrames();
      if (t.length < 2) return this.setCurveInterpolation(e);
      const a = this._activeTrack();
      this.checkpoint(s("Interpolation on {n} keys").replace("{n}", t.length)), a.write(Pu(we(this), t, e)), this.serialize(), this.refreshKeys(), this.refreshKeyEditor(), this.render(), this.drawCurveEditor(), this.setStatus(s("{mode} interpolation on {n} keys").replace("{mode}", e.replace(/_/g, " ")).replace("{n}", t.length));
    },
    setSelectedKeysTangentMode(e) {
      const t = this.resolveSelectedFrames();
      if (t.length < 2) return this.setTangentMode(e);
      const a = this._activeTrack(), o = Xe(this).map((r) => r.id);
      this.checkpoint(s("Tangents on {n} keys").replace("{n}", t.length)), a.write(Ou(we(this), t, e, o)), this.serialize(), this.refreshKeys(), this.render(), this.drawCurveEditor(), this.setStatus(s("{mode} tangents on {n} keys").replace("{mode}", e).replace("{n}", t.length));
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
        const u = Ee(this);
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
        const u = qo(this);
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
        const b = [...u].sort((K, P) => K.frame - P.frame), y = p ? p[0] : -1 / 0, g = p ? p[1] : 1 / 0, v = b.filter((K) => K.frame < y), S = b.filter((K) => K.frame >= y && K.frame <= g), x = b.filter((K) => K.frame > g);
        let E = S, M = 0;
        if (S.length > 2) {
          const K = e === "reduce" ? Mu(S, i, { target: a || Math.ceil(S.length / 2), keepFrames: m }) : e === "clean" ? Au(S, i, { keepFrames: m }) : $u(S, i, { tolerance: t * zu, keepFrames: m });
          E = K.keys, M = K.removed;
        }
        return { keys: [...v, ...E, ...x].sort((K, P) => K.frame - P.frame), removed: M };
      };
      let d = 0;
      const h = c.map((u) => {
        const b = r && u.primary ? r : u.get(), { keys: y, removed: g } = f(b);
        return d += g, { track: u, keys: y };
      });
      n || this.checkpoint(s("Simplify keyframes"));
      for (const { track: u, keys: b } of h) u.set(b);
      return Bo(this), this.selectedKeyFrame = null, this.selectedKeyFrames = /* @__PURE__ */ new Set(), this.camera = Ce(this.state, this.frame), this.applyObjectAnimationFrame(), this.serialize(), this.refreshKeys(), this.setFrame(this.frame, !1, !1), this.render(), n || this.setStatus(d ? s("Removed {n} keyframes").replace("{n}", d) : s("No keyframes to remove")), d;
    },
    keySimplifyToleranceFor(e) {
      return Y(Number(e) || 0, 0, 100) / 100;
    }
  };
}
$n({ api: Ye });
is({ api: Ye });
Ef({ api: Ye });
class As {
  constructor(t) {
    this.app = fn, this.api = Ye, this.node = t, this.root = Un(), this.root.tabIndex = -1, this.dom = Yn(this.root), this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.canvas, this.interactionElement.tabIndex = 0, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 }), this.disposed = !1, this.renderRevision = 0, this.webgl = null, this.cameraWebgl = null, this.webglReady = this.loadWebGLViewports(), this.stateWidget = t.widgets?.find((o) => o.name === "state_json"), this.recordingWidget = t.widgets?.find((o) => o.name === "recording_path"), this.cardWidget = t.widgets?.find((o) => o.name === "card_asset"), this.widthWidget = t.widgets?.find((o) => o.name === "width"), this.heightWidget = t.widgets?.find((o) => o.name === "height"), this.fpsWidget = t.widgets?.find((o) => o.name === "fps"), this.durationWidget = t.widgets?.find((o) => o.name === "duration_seconds"), this.modeWidget = t.widgets?.find((o) => o.name === "render_mode");
    let a = null;
    try {
      a = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = er(a), // The scene "Reset" command reverts to whatever was last saved or opened;
    // the state the node mounts with is that baseline until then.
    this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = Ce(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.cardMediaAssetById = /* @__PURE__ */ new Map(), this.objectUrls = new Vn(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = null, this.selectedEntity = "camera", this.subSelection = null, this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.uiDirtyMask = 0, this.perf = globalThis.__omnicamPerf === !0 ? { renderCount: 0, viewportRenderCount: 0, previewRenderCount: 0, timelineRefreshCount: 0, inspectorRefreshCount: 0, lastFrameMs: 0 } : null, this.contextMenu = new An(this.root), this.history = new Wn({ capture: () => JSON.stringify({ state: this.state, frame: this.frame, selectedEntity: this.selectedEntity, selectedObjectId: this.selectedObjectId, selectedObjectIds: [...this.selectedObjectIds || []], selectedKeyFrame: this.selectedKeyFrame, selectedKeyFrames: [...this.selectedKeyFrames || []], subSelection: this.subSelection }), restore: (o) => this.restoreHistorySnapshot(o) }), this.refreshCameraPreviews(), this.initializeTooltips(), this.bindEditorEvents(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.syncUpstreamInputs(), this.refreshSetupDiagnostic(), // Seed every frame-derived readout (timecode, lens millimetres, viewport
    // zoom, dope rows) instead of waiting for the first scrub.
    this.setFrame(this.frame, !1, !0);
  }
  /** Load the WebGL viewports, then repaint with them. Never rejects. */
  async loadWebGLViewports() {
    let t;
    try {
      ({ OmniWebGLViewport: t } = await import("./chunk-BzKt9Ia2.js"));
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
      Qi(this), this.resizeCanvas(), this.render(), this.renderCameraView();
    }
  }
}
const co = { app: fn, api: Ye, EditorHistory: Wn, ContextMenuController: An, initializeTooltips: Oc, promptText: zt, ObjectUrlRegistry: Vn, buildRoot: Un, dispatchDirectorKey: ec, activeCameraTrack: qo, bindWidgetCallbacks: zc, playblastCameraTrack: Mn, restoreFromWidgets: Fc, serializeEditorState: Lc, syncActiveCameraTrack: Bo, syncFromWidgets: Nc, bindEditorEvents: Zp, activateCamera: Kc, addCamera: Rc, deleteCamera: Dc, drawPreviewOverlays: qc, duplicateCamera: Bc, maximizeCameraPreview: Wc, refreshCameraPreviews: Vc, refreshCameraSelectors: Uc, renameCamera: Hc, setPlayblastCamera: Gc, toggleCameraView: Yc, captureRealtime: ps, makePlayblast: _f, uploadDirectorPlayblast: fs, waitForMediaFrame: ms, computeAudioPeaks: ss, loadAudioFile: cf, releaseAudio: vo, stopPlay: fo, togglePlay: rf, applyCameraPreset: xm, applyCameraShake: wm, applyProxyPreset: km, clearViewportBgImage: Af, loadViewportBgFile: $f, loadViewportBgSequence: Mf, drawCameraPath: Wf, drawCard: Bf, drawCube: Lf, drawCylinder: Rf, drawGrid: Pf, drawHuman: Kf, drawLine3D: ie, drawNull: qf, drawOverlays: Uf, drawPointField: Ff, drawSpeedHeatmap: Vf, drawSphere: Nf, drawTorus: Df, curveChannels: Xe, drawCurveEditor: Tl, fitCurveView: Nn, onCurveDoubleClick: Ml, onCurvePointerDown: xl, onCurvePointerMove: wl, onCurvePointerUp: kl, onTimelinePointerDown: tc, onTimelinePointerMove: ac, onTimelinePointerUp: oc, refreshKeys: Ul, resetCurveZoom: Al, resetTimelineZoom: rc, setChannelFilter: jl, setCurveInterpolation: Sl, setTangentMode: Cl, timelineFrameFromEvent: Zo, toggleCurveHandles: _l, zoomCurve: $l, drawTransformGizmo: nc, frameTarget: sc, gizmoAxes: ic, gizmoGeometry: cc, onPointerDown: lc, onPointerMove: dc, onPointerUp: mc, onWheel: pc, pickGizmo: fc, pickSceneObject: hc, resetCamera: uc, setTransformMode: bc, setViewMode: gc, viewportCamera: yc, loadCardFile: bf, loadExecutionPreview: gf, loadMediaUrl: ds, loadModelFile: uf, loadSelectedReference: yf, onModelLoaded: hf, restoreAssets: ff, syncUpstreamInputs: vf, configureDomMedia: is, refreshSetupDiagnostic: Yf, addMediaCard: sh, addPrimitive: ah, applyObjectAnimationFrame: kh, beginCameraEdit: Mh, beginObjectEdit: xs, commitCameraEdit: Ah, commitObjectEdit: lh, copyKeyframe: _h, deleteKeyframe: Ch, deleteObject: vs, deleteSelectedObjects: nh, duplicateObject: ys, exitKeyEdit: Ih, finishCameraEdit: Th, goToAdjacentKey: qh, insertKeyframe: Sh, loadSelectedKeyView: Dh, pasteKeyframe: Eh, playblastCameraAtFrame: wh, refreshInspector: ih, refreshKeyEditor: Nh, refreshObjects: gs, removeObjectResources: uh, renameObject: oh, retimeSelectedKey: Kh, selectKeyframe: $h, selectedKeyframe: Fe, selectedObject: Kt, selectObjectAnimation: hh, setKeyInterpolation: jh, setKeyTangentMode: Lh, setObjectParent: fh, timelineKeyframes: we, timelineObject: Ee, toggleAutoKey: Ph, toggleObject: rh, updateCameraFromHud: ph, updateCameraRotationFromHud: mh, updateEditState: zh, updateKeyVisualState: Fh, updateSelectedKey: Rh, updateSelectedObject: ch, clamp: Y, cloneCamera: ye, configureCore: $n, defaultCamera: En, sampleCamera: Ce, sampleObjectTransform: So, sanitizeState: er, worldTransform: tr };
Object.assign(
  As.prototype,
  Yh(co),
  nu(co),
  su(co),
  ju(co),
  Fu()
);
function lo(e, t) {
  const a = globalThis.__majoorOmniCamCiTrace;
  Array.isArray(a) && a.push({ stage: e, nodeId: t?.id ?? null, nodeClass: t?.comfyClass ?? t?.type ?? null });
}
function Lu(e) {
  if (e.__majoorOmniCam) return;
  lo("director:attach:start", e), lo("director:constructor:start", e);
  const t = new As(e);
  lo("director:constructor:complete", e), Xd(t);
  try {
    t.assetBrowser = mm(t);
  } catch (m) {
    console.warn("[OmniCam] Asset Browser unavailable", m);
  }
  try {
    t.labelOverlay = pm(t);
    const m = t.root.querySelector('[data-role="label-mode"]'), f = t.root.querySelector('[data-role="label-content"]');
    m && (m.value = t.labelOverlay.settings.mode), f && (f.value = t.labelOverlay.settings.content);
  } catch (m) {
    console.warn("[OmniCam] Label overlay unavailable", m);
  }
  try {
    t.characterRuntime = fm(t), t.rigMapper = um(t), t.poseEditor = ym(t), t.motionEditor = vm(t);
  } catch (m) {
    console.warn("[OmniCam] Character tools unavailable", m);
  }
  e.__majoorOmniCam = t, lo("director:marker:assigned", e), t.hideInternalWidgets();
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
  }, t.unwatchGraphConnections = Pc(e, i);
  const l = e.onRemoved;
  e.onRemoved = function() {
    t.unwatchGraphConnections?.(), t.assetBrowser?.dispose?.(), t.labelOverlay?.dispose?.(), t.rigMapper?.dispose?.(), t.poseEditor?.dispose?.(), t.motionEditor?.dispose?.(), t.dispose(), l?.apply(this, arguments);
  };
  const p = e.onExecuted;
  e.onExecuted = function(m) {
    p?.apply(this, arguments), t.loadExecutionPreview(m), t.syncUpstreamInputs();
  };
}
const Gu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirector: Lu
}, Symbol.toStringTag, { value: "Module" }));
export {
  zo as D,
  Vu as a,
  Uu as b,
  Wu as c,
  Jp as d,
  es as e,
  Lt as f,
  Gu as g,
  dr as q,
  Hu as r,
  Bh as s
};
