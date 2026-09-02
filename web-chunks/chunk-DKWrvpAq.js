import { app as xo } from "../../scripts/app.js";
import { api as Oe } from "../../scripts/api.js";
import { s as te, c as P, t as H, a as s, o as wo, b as Ha, d as $e, e as R, r as dr, f as qe, g as at, h as ko, i as mr, j as pr, k as fr, S as _e, l as hr, m as Va, n as br, p as ur, q as Oa, u as yr, v as gr, w as vr, M as xr, x as wr, y as kr, z as Ua, A as Q, B as je, C as he, D as Sr, E as $a, F as Ea, G as Cr, H as Ma, I as Qe, J as jr, K as ro, L as _r, N as So, O as $r, P as Er, Q as Mr, R as Ar, T as Pr, U as Fr, V as zr, W as Lr, X as Tr, Y as Kr, Z as Ir, _ as Or, $ as Co } from "./chunk-CSPoZLSN.js";
import { L as qr, a as Dr, f as Nr, b as jo, c as Rr, d as Br, e as Wr, s as Hr } from "./chunk-nt_Eiok4.js";
import { S as Vr, b as Ur, l as Gr, u as Xr } from "./chunk-DB_YtOm2.js";
import { R as Yr } from "./chunk-BNTXm8ZY.js";
import { m as Zr } from "./chunk-yd7KIc_Q.js";
function Je(e, t = 0) {
  return Math.sin(e * 1.7 + t * 3.1) * 0.5 + Math.sin(e * 3.3 + t * 5.7) * 0.3 + Math.sin(e * 7.9 + t * 11.3) * 0.2;
}
function Jr(e, { type: t = "handheld_subtle", intensity: a = 1, duration_frames: o = null, subdivide: r = !0 } = {}) {
  const n = Array.isArray(e) ? e : e?.keyframes || [];
  if (!n || n.length === 0) return n;
  const i = t === "turbulence", c = t === "handheld_heavy", d = (i ? 0.12 : c ? 0.18 : 0.06) * a, l = (i ? 2 : c ? 2.8 : 0.9) * a, p = i ? 0.45 : c ? 0.22 : 0.12, h = n[n.length - 1]?.frame ?? 119, f = Math.max(h + 1, Number(o || (e?.duration_frames ?? h + 1))), u = i ? 4 : c ? 6 : 8, v = Array.isArray(e) ? { keyframes: n, duration_frames: f } : e, S = new Set(n.map((y) => y.frame));
  if (r && f > u) {
    for (let y = 0; y < f; y += u)
      S.add(y);
    S.add(f - 1);
  }
  return [...S].sort((y, x) => y - x).map((y) => {
    const x = te(v, y), w = Je(y * p, 1) * d, j = Je(y * p, 2) * d, _ = Je(y * p, 3) * d * 0.5, D = Je(y * p, 4) * l, A = Je(y * p, 5) * (l * 0.35), B = [...x.position], z = [...x.target];
    return B[0] += w, B[1] += j, B[2] += _, z[0] += w * 0.35, z[1] += j * 0.35, {
      frame: y,
      camera: {
        ...x,
        position: B,
        target: z,
        roll: (x.roll || 0) + D,
        fov: P((x.fov || 35) + A, 10, 140)
      },
      interpolation: "smooth"
    };
  });
}
function Qr(e, { duration_frames: t = 120, target: a = [0, 1.5, 0], radius: o = 6, height: r = 3.5 } = {}) {
  const n = [], i = Math.max(2, t), [c, d, l] = a;
  if (e === "orbit_360") {
    const p = Math.max(17, Math.min(65, Math.ceil(i / 4) + 1));
    for (let h = 0; h < p; h++) {
      const f = Math.round(h / (p - 1) * (i - 1)), u = h / (p - 1) * Math.PI * 2, v = h === p - 1 ? [c, d + r, l + o] : [c + Math.sin(u) * o, d + r, l + Math.cos(u) * o];
      n.push({
        frame: f,
        camera: {
          position: v,
          target: [c, d, l],
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
      camera: { position: [c, d + r, l + o * 1.6], target: [c, d, l], fov: 42, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: i - 1,
      camera: { position: [c, d + r * 0.5, l + o * 0.6], target: [c, d, l], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : e === "pull_out" ? n.push(
    {
      frame: 0,
      camera: { position: [c, d + r * 0.4, l + o * 0.6], target: [c, d, l], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    },
    {
      frame: i - 1,
      camera: { position: [c, d + r * 1.2, l + o * 1.8], target: [c, d, l], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "ease"
    }
  ) : e === "dolly_zoom" && n.push(
    {
      frame: 0,
      camera: { position: [c, d + r * 0.7, l + o * 1.8], target: [c, d, l], fov: 24, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    },
    {
      frame: i - 1,
      camera: { position: [c, d + r * 0.5, l + o * 0.6], target: [c, d, l], fov: 65, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 },
      interpolation: "bezier"
    }
  );
  return n;
}
const _o = 1e-4;
function en(e, t) {
  return !Array.isArray(e) || !Array.isArray(t) ? e !== t : e.some((a, o) => Math.abs(Number(a) - Number(t[o])) > _o);
}
function no(e, t) {
  return Math.abs(Number(e) - Number(t)) > _o;
}
const $o = [
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
    changed: (e, t) => en(e?.target, t?.target),
    read: (e) => e?.target
  },
  {
    id: "focal_length",
    label: "Focal Length",
    color: "#4aa3ef",
    changed: (e, t) => no(e?.fov, t?.fov),
    read: (e) => e?.fov
  },
  {
    id: "roll",
    label: "Roll",
    color: "#ec4899",
    changed: (e, t) => no(e?.roll, t?.roll),
    read: (e) => e?.roll
  }
];
function tn(e, t) {
  const a = [...e || []].sort((n, i) => n.frame - i.frame), o = [];
  let r = null;
  for (const n of a) {
    const i = n.camera || n.transform || {};
    (r === null || t.changed(r, i)) && o.push(n.frame), r = i;
  }
  return o;
}
function an(e, t = null) {
  return $o.filter((a) => !t || t.has(a.id)).map((a) => ({
    id: a.id,
    label: a.label,
    color: a.color,
    frames: tn(e, a)
  }));
}
function on(e, t) {
  const a = t >= -1 && t <= 101;
  e.style.display = a ? "" : "none", a && (e.style.left = `${t}%`);
}
function Aa(e) {
  const t = H(e, e.frame);
  for (const a of [".oc-playhead-head", '[data-role="dope-playhead"]', ".oc-gdope-playhead", ".oc-sequence-playhead"])
    for (const o of e.root.querySelectorAll(a)) on(o, t);
}
function rn(e, t, a) {
  if (t.length < 2) return;
  const o = a(t[0]), r = a(t[t.length - 1]), n = document.createElement("span");
  n.className = "oc-dope-rail", n.style.left = `${Math.max(0, Math.min(o, r))}%`, n.style.width = `${Math.max(0, Math.abs(r - o))}%`, e.appendChild(n);
}
function nn(e, t, a, o, r) {
  for (const n of a.frames) {
    const i = r(n);
    if (i < -5 || i > 105) continue;
    const c = document.createElement("button");
    c.type = "button", c.className = `oc-dope-key${n === e.frame ? " at-playhead" : ""}`, c.style.left = `${i}%`, c.dataset.frame = String(n), c.title = s("{channel} changes at frame {frame}").replace("{channel}", s(a.label)).replace("{frame}", String(n)), c.addEventListener("click", (d) => {
      d.preventDefault(), d.stopPropagation();
      const l = o.find((p) => p.frame === n);
      if (l) {
        if (d.shiftKey) {
          e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((p) => p !== null)), e.selectedKeyFrames.has(n) ? e.selectedKeyFrames.delete(n) : e.selectedKeyFrames.add(n), e.selectedKeyFrame = e.selectedKeyFrames.has(n) ? n : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(n, !1, !1), e.updateKeyVisualState(), e.refreshKeyEditor();
          return;
        }
        e.selectKeyframe(l);
      }
    }), t.appendChild(c);
  }
}
function sn(e, t) {
  return [
    e.state.duration_frames,
    Number(e.timelineZoom) || 1,
    Number(e.timelinePan) || 0,
    ...t.map((a) => `${a.id}:${a.frames.join(",")}`)
  ].join("\0");
}
function Eo(e) {
  const t = e.root.querySelector('[data-role="dope-rows"]');
  if (!t) return;
  const a = new Set(e.dopeChannels || []);
  a.delete("camera");
  const o = e.timelineKeyframes() || [], r = an(o, a), n = sn(e, r);
  if (t.dataset.signature !== n) {
    t.dataset.signature = n, t.replaceChildren();
    const i = (c) => H(e, c);
    for (const c of r) {
      const d = document.createElement("div");
      d.className = "oc-dope-row", d.dataset.channel = c.id, d.style.setProperty("--channel-color", c.color), rn(d, c.frames, i), nn(e, d, c, o, i), t.appendChild(d);
    }
  }
  for (const i of t.querySelectorAll(".oc-dope-key"))
    i.classList.toggle("at-playhead", Number(i.dataset.frame) === e.frame);
  Aa(e);
}
const qa = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1e3, 2e3, 5e3], Mo = 46, so = 5, Ao = 640;
function Po(e, t) {
  const a = t > 0 ? t : Ao, o = Math.max(2, Math.floor(a / Mo)), r = Math.max(1e-6, e / o);
  return qa.find((n) => n >= r) ?? qa[qa.length - 1];
}
function cn(e, t) {
  const a = Math.max(1, e.state.duration_frames - 1), o = P(Number(e.timelineZoom) || 1, 0.1, 50), r = Number(e.timelinePan) || 0, n = a / o, i = Po(n, t), d = (i >= so ? i / so : 0) || i, l = [], p = Math.max(0, Math.floor(r / d) * d);
  for (let f = p; f <= a + 1e-6; f += d) {
    const u = Math.round(f), v = H(e, u);
    if (!(v < -1)) {
      if (v > 101) break;
      l.push({ frame: u, percent: v, major: Math.abs(u % i) < 1e-6 });
    }
  }
  const h = H(e, a);
  if (h <= 101 && !l.some((f) => f.major && f.frame === a)) {
    const f = Mo / Math.max(1, t) * 100;
    for (let u = l.length - 1; u >= 0; u -= 1)
      if (l[u].major) {
        if (h - l[u].percent >= f) break;
        l[u].major = !1;
      }
    l.push({ frame: a, percent: h, major: !0 });
  }
  return l;
}
function ln(e) {
  return e.clientWidth || e.parentElement?.clientWidth || Ao;
}
function Fo(e) {
  const t = e.root.querySelector('[data-role="ruler"]');
  if (!t) return;
  t.replaceChildren();
  for (const o of cn(e, ln(t))) {
    const r = document.createElement("span");
    if (r.className = o.major ? "oc-tick major" : "oc-tick", r.style.left = `${o.percent}%`, t.appendChild(r), !o.major) continue;
    const n = document.createElement("span");
    n.className = "timeline-tick", n.textContent = String(o.frame), n.style.left = `${o.percent}%`, t.appendChild(n);
  }
  const a = H(e, e.frame);
  if (a >= -1 && a <= 101) {
    const o = document.createElement("span");
    o.className = "oc-playhead-head", o.style.left = `${a}%`, t.appendChild(o);
  }
}
function dn(e, t) {
  const a = e.root.querySelector('[data-role="ruler"]');
  if (!a) return;
  let o = 0;
  const r = new ResizeObserver((c) => {
    const d = Math.round(c[0]?.contentRect.width ?? 0);
    !d || d === o || (o = d, Fo(e));
  });
  r.observe(a), t?.addEventListener("abort", () => r.disconnect(), { once: !0 });
  const n = (c) => {
    const d = Ha(e, c, a);
    Number.isFinite(d) && e.setFrame(d, !1, !1);
  };
  a.addEventListener("pointerdown", (c) => {
    c.button === 0 && (c.preventDefault(), c.stopPropagation(), a.setPointerCapture(c.pointerId), a.dataset.scrubbing = "1", n(c));
  }, { signal: t }), a.addEventListener("pointermove", (c) => {
    a.dataset.scrubbing === "1" && n(c);
  }, { signal: t });
  const i = (c) => {
    a.dataset.scrubbing === "1" && (delete a.dataset.scrubbing, a.hasPointerCapture?.(c.pointerId) && a.releasePointerCapture(c.pointerId));
  };
  a.addEventListener("pointerup", i, { signal: t }), a.addEventListener("pointercancel", i, { signal: t }), a.addEventListener("wheel", (c) => wo(e, c), { passive: !1, signal: t });
}
const mn = [1, 2, 2.5, 5, 10];
function pn(e, t = 5) {
  const a = Math.abs(e) / Math.max(1, t);
  if (!(a > 0) || !Number.isFinite(a)) return 1;
  const o = 10 ** Math.floor(Math.log10(a)), r = a / o;
  return (mn.find((n) => n >= r) ?? 10) * o;
}
function fn(e, t) {
  const a = Math.max(0, Math.min(4, Math.ceil(-Math.log10(t))));
  return e.toFixed(a);
}
function hn(e, { left: t, right: a, top: o, width: r, graphWidth: n, graphHeight: i, height: c, timeMin: d, timeMax: l, totalDuration: p, xFor: h, frame: f }) {
  const u = Po(l - d, n);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a", e.textAlign = "center";
  for (let S = Math.ceil(d / u) * u; S <= l; S += u) {
    const g = Math.round(S);
    if (g < 0 || g > p) continue;
    const y = h(g);
    y < t || y > r - a || (e.beginPath(), e.moveTo(y, o), e.lineTo(y, o + i), e.stroke(), e.fillText(String(g), y, c - 6));
  }
  const v = h(f);
  v >= t && v <= r - a && (e.fillStyle = "#a78bfa", e.fillText(String(f), v, c - 6)), e.textAlign = "left";
}
function bn(e, { left: t, right: a, top: o, width: r, graphHeight: n, minimum: i, maximum: c, yFor: d }) {
  const l = pn(c - i, 4);
  e.strokeStyle = "#222228", e.lineWidth = 1, e.fillStyle = "#6e727a";
  for (let p = Math.ceil(i / l) * l; p <= c; p += l) {
    const h = d(p);
    h < o - 1 || h > o + n + 1 || (e.beginPath(), e.moveTo(t, h), e.lineTo(r - a, h), e.stroke(), e.fillText(fn(p, l), 4, h + 3));
  }
}
function zo(e, t) {
  const a = e.getBoundingClientRect(), o = e.clientWidth / Math.max(1, a.width), r = 180 / Math.max(1, a.height);
  return {
    x: (t.clientX - a.left) * o,
    y: (t.clientY - a.top) * r
  };
}
function un(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.currentTarget, { x: o, y: r } = zo(a, t);
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
  const n = (e.curveHitPoints || []).map((c) => ({ point: c, distance: Math.hypot(o - c.x, r - c.y) })).sort((c, d) => c.distance - d.distance)[0];
  if (!n || n.distance > 12) {
    if (r < 20) {
      const c = Math.max(1, e.state.duration_frames - 1), d = c / (Number(e.curveZoomX) || 1), l = Number(e.curvePanX) || 0, p = Math.round(P(l + (o - 44) / Math.max(1, a.clientWidth - 58) * d, 0, c));
      e.setFrame(p), e.curveScrub = { pointerId: t.pointerId }, a.setPointerCapture?.(t.pointerId);
      return;
    }
    e.curveBoxSelect = { startX: o, startY: r, currentX: o, currentY: r, pointerId: t.pointerId }, a.setPointerCapture?.(t.pointerId);
    return;
  }
  n.point.handle ? (e.selectedKeyFrame = n.point.key.frame, e.editingKeyFrame = null, e.updateKeyVisualState(), e.refreshKeyEditor()) : (e.selectKeyframe(n.point.key), e.setFrame(n.point.key.frame));
  const i = n.point.object ? n.point.key.transform : n.point.key.camera;
  e.curveDrag = {
    ...n.point,
    startY: r,
    startX: o,
    startFrame: n.point.key.frame,
    startValue: n.point.channel.get(i),
    pointerId: t.pointerId
  }, a.setPointerCapture?.(t.pointerId);
}
function yn(e, t) {
  const a = t.currentTarget, { x: o, y: r } = zo(a, t);
  if (e.curvePanDrag && t.pointerId === e.curvePanDrag.pointerId) {
    t.preventDefault();
    const p = t.clientX - e.curvePanDrag.startX, h = t.clientY - e.curvePanDrag.startY, u = Math.max(1, e.state.duration_frames - 1) / (Number(e.curveZoomX) || 1), v = Math.max(1, a.clientWidth - 58), S = 142;
    e.curvePanX = e.curvePanDrag.origPanX - p / v * u, e.curvePanY = e.curvePanDrag.origPanY + h / S * 10 / (Number(e.curveZoom) || 1), e.drawCurveEditor();
    return;
  }
  if (e.curveScrub && t.pointerId === e.curveScrub.pointerId) {
    t.preventDefault();
    const p = Math.max(1, e.state.duration_frames - 1), h = p / (Number(e.curveZoomX) || 1), f = Number(e.curvePanX) || 0, u = Math.round(P(f + (o - 44) / Math.max(1, a.clientWidth - 58) * h, 0, p));
    e.setFrame(u);
    return;
  }
  if (e.curveBoxSelect && t.pointerId === e.curveBoxSelect.pointerId) {
    t.preventDefault(), e.curveBoxSelect.currentX = o, e.curveBoxSelect.currentY = r;
    const p = Math.min(e.curveBoxSelect.startX, o), h = Math.max(e.curveBoxSelect.startX, o), f = Math.min(e.curveBoxSelect.startY, r), u = Math.max(e.curveBoxSelect.startY, r), v = (e.curveHitPoints || []).filter((S) => !S.handle && S.x >= p && S.x <= h && S.y >= f && S.y <= u).map((S) => S.key.frame);
    e.selectedKeyFrames = new Set(v), v.length && (e.selectedKeyFrame = v[0]), e.updateKeyVisualState(), e.drawCurveEditor();
    return;
  }
  if (!e.curveDrag || t.pointerId !== e.curveDrag.pointerId) return;
  if (t.preventDefault(), t.stopPropagation(), e.curveDrag.handle) {
    const p = e.curveDrag.key, h = e.curveDrag.channel, f = e.curveDrag.handle, u = e.curveDrag.pixelPerSegment, v = e.curveDrag.valuePerPixel, S = e.curveDrag.keyX, g = e.curveDrag.keyY;
    p.interpolation !== "bezier" && (p.interpolation = "bezier"), p.tangents || (p.tangents = { mode: "auto", channels: {} }), p.tangents.channels || (p.tangents.channels = {});
    const y = p.tangents.channels[h.id] || {}, x = y.mode || (p.tangents.mode === "aligned" ? "aligned" : "free"), w = {
      out_x: e.curveDrag.startHandles.out_x,
      out_y: e.curveDrag.startHandles.out_y,
      in_x: e.curveDrag.startHandles.in_x,
      in_y: e.curveDrag.startHandles.in_y,
      ...y,
      mode: x
    };
    if (f === "in") {
      if (w.in_x = P((o - S) / Math.max(1, u), -0.99, -0.01), w.in_y = (g - r) * v, x === "aligned") {
        const j = Math.hypot(w.in_x, w.in_y) || 1e-6, _ = Math.hypot(e.curveDrag.startHandles.out_x, e.curveDrag.startHandles.out_y) || 1e-6;
        w.out_x = -w.in_x / j * _, w.out_y = -w.in_y / j * _;
      }
    } else if (w.out_x = P((o - S) / Math.max(1, u), 0.01, 0.99), w.out_y = (g - r) * v, x === "aligned") {
      const j = Math.hypot(w.out_x, w.out_y) || 1e-6, _ = Math.hypot(e.curveDrag.startHandles.in_x, e.curveDrag.startHandles.in_y) || 1e-6;
      w.in_x = -w.out_x / j * _, w.in_y = -w.out_y / j * _;
    }
    p.tangents.channels[h.id] = w, e.scheduleSerialize(), e.camera = te(e.state, e.frame), e.applyObjectAnimationFrame(), e.render(), e.drawCurveEditor();
    return;
  }
  const n = e.curveDrag.maximum - (r - e.curveDrag.top) * (e.curveDrag.maximum - e.curveDrag.minimum) / Math.max(1, e.curveDrag.graphHeight), i = e.curveDrag.object ? e.curveDrag.key.transform : e.curveDrag.key.camera;
  e.curveDrag.channel.set(i, n);
  const c = e.curveDrag.lastFrame / (Number(e.curveZoomX) || 1), d = Number(e.curvePanX) || 0, l = P(Math.round(d + (o - e.curveDrag.left) / Math.max(1, e.curveDrag.graphWidth) * c), 0, e.curveDrag.lastFrame);
  if (!t.shiftKey && Math.abs(o - e.curveDrag.startX) > 8 && l !== e.curveDrag.key.frame ? (e.curveDrag.key.frame = l, e.selectedKeyFrame = l, e.frame = l) : (e.editingKeyFrame = e.curveDrag.key.frame, e.frame = e.curveDrag.key.frame), e.curveDrag.object) {
    const p = $e(e.curveDrag.key.transform);
    e.curveDrag.object.position = p.position, e.curveDrag.object.rotation = p.rotation, e.curveDrag.object.size = p.size;
  } else {
    const p = R(e.curveDrag.key.camera);
    e.camera.position = p.position, e.camera.target = p.target, e.camera.fov = p.fov, e.camera.roll = p.roll, e.camera.zoom = p.zoom;
  }
  e.scheduleSerialize(), e.render(), e.refreshKeyEditor(), e.drawCurveEditor();
}
function gn(e, t) {
  t.currentTarget.hasPointerCapture?.(t.pointerId) && t.currentTarget.releasePointerCapture(t.pointerId), e.curvePanDrag = null, e.curveScrub = null, e.curveBoxSelect = null, e.curveDrag && (e.timelineKeyframes().sort((o, r) => o.frame - r.frame), e.editingKeyFrame = null, e.curveDrag = null, e.serialize(), e.refreshKeys(), e.updateKeyVisualState(), e.drawCurveEditor());
}
function vn(e, t) {
  const a = e.selectedKeyframe() || e.timelineKeyframes().find((o) => o.frame === e.frame);
  if (!a) return e.setStatus(s("Select a keyframe first"));
  e.checkpoint("Change interpolation"), a.interpolation = t;
  for (const o of e.root.querySelectorAll("[data-curve-mode]")) {
    const r = o.dataset.curveMode === t;
    o.classList.toggle("active", r), o.setAttribute("aria-pressed", String(r));
  }
  e.selectedKeyFrame = a.frame, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.render(), e.drawCurveEditor(), e.setStatus(s(`${t.replace("_", " ")} interpolation @ ${a.frame}`));
}
function xn(e, t) {
  e.curveChannelFilter = t;
  for (const a of e.root.querySelectorAll("[data-channel-filter]")) {
    const o = a.dataset.channelFilter === String(t);
    a.classList.toggle("active", o), a.setAttribute("aria-pressed", String(o));
  }
  e.drawCurveEditor(), e.setStatus(t === "all" ? s("Showing all channels") : s(`Solo channel ${t}`));
}
function wn(e, t) {
  const a = e.selectedKeyframe();
  if (!a || !["auto", "vector", "free", "aligned", "flat"].includes(t)) return e.setStatus(s("Select a keyframe first"));
  e.checkpoint("Change tangent mode"), t !== "auto" && a.interpolation !== "bezier" && (a.interpolation = "bezier"), a.tangents || (a.tangents = { mode: "auto", channels: {} }), a.tangents.mode = t, a.tangents.channels || (a.tangents.channels = {});
  const o = ot(e);
  for (const r of o)
    a.tangents.channels[r.id] ? a.tangents.channels[r.id].mode = t : a.tangents.channels[r.id] = { mode: t };
  for (const r of e.root.querySelectorAll("[data-tangent-mode]")) {
    const n = r.dataset.tangentMode === t;
    r.classList.toggle("active", n), r.setAttribute("aria-pressed", String(n));
  }
  e.selectedKeyFrame = a.frame, e.serialize(), e.refreshKeys(), e.render(), e.drawCurveEditor(), e.setStatus(s(`Tangent mode: ${t} @ ${a.frame}`));
}
function kn(e) {
  e.showCurveHandles = !e.showCurveHandles;
  for (const t of e.root.querySelectorAll('[data-act="curve-handles"]'))
    t.classList.toggle("active", e.showCurveHandles), t.setAttribute("aria-pressed", String(e.showCurveHandles)), t.title = s(`${e.showCurveHandles ? "Hide" : "Show"} Bézier tangent handles`);
  e.drawCurveEditor(), e.setStatus(s(`Bézier handles ${e.showCurveHandles ? "shown" : "hidden"}`));
}
function Sn(e, t) {
  t.preventDefault(), t.stopPropagation();
  const a = t.deltaY < 0 ? 1.18 : 0.85;
  if (t.shiftKey) {
    const o = Math.max(1, e.state.duration_frames - 1);
    e.curvePanX = P((Number(e.curvePanX) || 0) + (t.deltaY > 0 ? 4 : -4), -o * 0.5, o);
  } else t.altKey ? e.curvePanY = (Number(e.curvePanY) || 0) + (t.deltaY > 0 ? -1 : 1) / (Number(e.curveZoom) || 1) : t.ctrlKey ? e.curveZoomX = P((Number(e.curveZoomX) || 1) * a, 0.2, 30) : (e.curveZoom = P((Number(e.curveZoom) || 1) * a, 0.2, 30), e.curveZoomX = P((Number(e.curveZoomX) || 1) * a, 0.2, 30));
  e.drawCurveEditor(), e.setStatus(s(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function Cn(e, t) {
  e.curveZoom = P((Number(e.curveZoom) || 1) * t, 0.2, 30), e.curveZoomX = P((Number(e.curveZoomX) || 1) * t, 0.2, 30), e.drawCurveEditor(), e.setStatus(s(`Curve zoom: ${(e.curveZoom * 100).toFixed(0)}%`));
}
function jn(e) {
  e.curveZoom = 1, e.curveZoomX = 1, e.curvePanX = 0, e.curvePanY = 0, e.drawCurveEditor(), e.setStatus(s("Curve view fitted"));
}
function ot(e) {
  const t = e.root.querySelector('[data-role="curve-group"]')?.value || "camera";
  let a = [];
  if (e.timelineObject()) {
    const r = t === "target" ? "rotation" : t === "lens" ? "size" : "position", n = t === "target" ? "rot" : t === "lens" ? "scale" : "pos", i = r === "size" ? "Scale" : r[0].toUpperCase() + r.slice(1);
    a = [0, 1, 2].map((c) => ({
      id: `${n}_${"xyz"[c]}`,
      name: `${i} ${"XYZ"[c]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][c],
      get: (d) => (d[r] || [0, 0, 0])[c],
      set: (d, l) => {
        d[r] || (d[r] = [0, 0, 0]), d[r][c] = r === "size" ? Math.max(0.01, l) : l;
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
      r.fov = P(n, 5, 150);
    } },
    { id: "roll", name: "Roll", color: "#ec4899", get: (r) => r.roll || 0, set: (r, n) => {
      r.roll = P(n, -180, 180);
    } }
  ] : t === "lens" ? a = [
    { id: "fov", name: "FOV", color: "#ef8b3e", get: (r) => r.fov ?? 35, set: (r, n) => {
      r.fov = P(n, 5, 150);
    } },
    { id: "roll", name: "Roll", color: "#43c7db", get: (r) => r.roll || 0, set: (r, n) => {
      r.roll = P(n, -180, 180);
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
function _n(e) {
  const t = e.root.querySelector('[data-role="curve-canvas"]');
  if (!t) return;
  const a = t.clientWidth, o = 180;
  if (!a) return;
  const r = Math.min(2, window.devicePixelRatio || 1);
  (t.width !== Math.round(a * r) || t.height !== Math.round(o * r)) && (t.width = Math.round(a * r), t.height = Math.round(o * r));
  const n = t.getContext("2d");
  n.setTransform(r, 0, 0, r, 0, 0), n.clearRect(0, 0, a, o);
  const i = e.timelineObject(), c = e.timelineKeyframes(), d = ot(e), l = 44, p = 14, h = 16, f = 22, u = Math.max(1, a - l - p), v = Math.max(1, o - h - f), S = Math.max(1, e.state.duration_frames - 1), g = P(Number(e.curveZoomX) || 1, 0.1, 50), y = Number(e.curvePanX) || 0, x = S / g, w = y, j = y + x, _ = [], D = Math.max(1, Math.ceil(x / Math.max(80, u))), A = (E) => i ? qe(i, E) : te(e.state, E);
  for (let E = 0; E <= S; E += D) _.push({ frame: E, value: A(E) });
  _[_.length - 1]?.frame !== S && _.push({ frame: S, value: A(S) });
  const B = _.flatMap((E) => d.map((Y) => Y.get(E.value)));
  let z = Math.min(...B), I = Math.max(...B);
  (!Number.isFinite(z) || !Number.isFinite(I)) && (z = -1, I = 1), Math.abs(I - z) < 1e-6 && (z -= 1, I += 1);
  const ye = (I - z) * 0.1;
  z -= ye, I += ye;
  const ae = P(Number(e.curveZoom) || 1, 0.1, 50), ne = (I + z) / 2 + (Number(e.curvePanY) || 0), se = (I - z) / ae;
  z = ne - se / 2, I = ne + se / 2;
  const me = (E) => l + (E - w) / Math.max(1e-6, j - w) * u, pe = (E) => h + v * (I - E) / Math.max(1e-6, I - z);
  if (n.fillStyle = "#111114", n.fillRect(0, 0, a, o), n.strokeStyle = "#222228", n.lineWidth = 1, n.font = "9px system-ui, -apple-system, sans-serif", n.fillStyle = "#6e727a", hn(n, {
    left: l,
    right: p,
    top: h,
    width: a,
    graphWidth: u,
    graphHeight: v,
    height: o,
    timeMin: w,
    timeMax: j,
    totalDuration: S,
    xFor: me,
    frame: e.frame
  }), bn(n, { left: l, right: p, top: h, width: a, graphHeight: v, minimum: z, maximum: I, yFor: pe }), z <= 0 && I >= 0) {
    const E = pe(0);
    n.strokeStyle = "#383842", n.lineWidth = 1.2, n.beginPath(), n.moveTo(l, E), n.lineTo(a - p, E), n.stroke();
  }
  e.curveHitPoints = [];
  for (const E of d) {
    n.strokeStyle = E.color, n.lineWidth = 2, n.beginPath();
    let Y = !1;
    _.forEach((T) => {
      const F = me(T.frame), N = pe(E.get(T.value));
      F >= l - 50 && F <= a - p + 50 && (Y ? n.lineTo(F, N) : (n.moveTo(F, N), Y = !0));
    }), n.stroke();
    for (const T of c) {
      const F = i ? T.transform : T.camera, N = me(T.frame), ie = pe(E.get(F)), q = T.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(T.frame);
      q && (n.fillStyle = "rgba(242, 208, 107, 0.35)", n.beginPath(), n.arc(N, ie, 8.5, 0, Math.PI * 2), n.fill()), n.fillStyle = q ? "#ffd75e" : E.color, n.strokeStyle = "#0d0d10", n.lineWidth = 1.6, n.beginPath(), n.arc(N, ie, q ? 5.2 : 3.8, 0, Math.PI * 2), n.fill(), n.stroke(), e.curveHitPoints.push({
        x: N,
        y: ie,
        key: T,
        channel: E,
        minimum: z,
        maximum: I,
        timeMin: w,
        timeMax: j,
        graphHeight: v,
        graphWidth: u,
        lastFrame: S,
        left: l,
        top: h,
        object: i
      });
    }
    if (e.showCurveHandles)
      for (let T = 0; T < c.length; T++) {
        const F = c[T], N = F.frame === e.selectedKeyFrame || e.selectedKeyFrames?.has(F.frame);
        if (!(N || e.curveChannelFilter !== "all" || c.length <= 4) || F.interpolation !== "bezier") continue;
        const q = i ? F.transform || i : F.camera || F, W = me(F.frame), X = pe(E.get(q)), V = c[T - 1], be = c[T + 1], ue = Math.max(1, F.frame - (V?.frame ?? F.frame - 1)), we = Math.max(1, (be?.frame ?? F.frame + 1) - F.frame), fe = dr(
          F,
          E.id,
          V,
          be,
          (U) => E.get(i ? U.transform || i : U.camera || F)
        ), J = (I - z) / Math.max(1, v), oe = u * we / Math.max(1, x), ce = u * ue / Math.max(1, x), re = [];
        (V || T > 0) && re.push({ side: "in", x: W + fe.in_x * ce, y: X - fe.in_y / J }), (be || T < c.length - 1 || c.length === 1) && re.push({ side: "out", x: W + fe.out_x * oe, y: X - fe.out_y / J });
        for (const U of re) {
          if (n.strokeStyle = E.color, n.lineWidth = N ? 1.5 : 1, n.beginPath(), n.moveTo(W, X), n.lineTo(U.x, U.y), n.stroke(), n.fillStyle = N ? "#2a2233" : "#171720", n.strokeStyle = N ? "#ffd75e" : E.color, n.lineWidth = N ? 2 : 1.2, n.beginPath(), U.side === "in")
            n.arc(U.x, U.y, N ? 5 : 3.8, 0, Math.PI * 2);
          else {
            const ge = N ? 4.5 : 3.2;
            n.rect(U.x - ge, U.y - ge, ge * 2, ge * 2);
          }
          n.fill(), n.stroke(), e.curveHitPoints.push({
            x: U.x,
            y: U.y,
            key: F,
            keyX: W,
            keyY: X,
            channel: E,
            minimum: z,
            maximum: I,
            timeMin: w,
            timeMax: j,
            top: h,
            left: l,
            graphHeight: v,
            graphWidth: u,
            lastFrame: S,
            object: i,
            handle: U.side,
            pixelPerSegment: U.side === "in" ? ce : oe,
            valuePerPixel: J,
            startHandles: { ...fe }
          });
        }
      }
  }
  if (e.curveBoxSelect) {
    const E = Math.min(e.curveBoxSelect.startX, e.curveBoxSelect.currentX), Y = Math.min(e.curveBoxSelect.startY, e.curveBoxSelect.currentY), T = Math.abs(e.curveBoxSelect.currentX - e.curveBoxSelect.startX), F = Math.abs(e.curveBoxSelect.currentY - e.curveBoxSelect.startY);
    n.fillStyle = "rgba(56, 189, 248, 0.15)", n.fillRect(E, Y, T, F), n.strokeStyle = "#38bdf8", n.lineWidth = 1, n.setLineDash([4, 4]), n.strokeRect(E, Y, T, F), n.setLineDash([]);
  }
  const Z = me(e.frame);
  Z >= l && Z <= a - p && (n.strokeStyle = "#a78bfa", n.lineWidth = 1.5, n.beginPath(), n.moveTo(Z, h), n.lineTo(Z, h + v), n.stroke(), n.fillStyle = "#a78bfa", n.beginPath(), n.moveTo(Z - 4, h), n.lineTo(Z + 4, h), n.lineTo(Z, h + 6), n.closePath(), n.fill());
  for (const E of e.root.querySelectorAll("[data-tangent-mode]")) {
    const Y = e.selectedKeyframe(), T = Y?.tangents?.channels?.[d[0]?.id]?.mode || Y?.tangents?.mode || "auto";
    E.classList.toggle("active", E.dataset.tangentMode === T);
  }
  for (const E of e.root.querySelectorAll("[data-channel-filter]"))
    E.classList.toggle("active", E.dataset.channelFilter === (e.curveChannelFilter || "all"));
  for (const E of e.root.querySelectorAll("[data-curve-mode]"))
    E.classList.toggle("active", E.dataset.curveMode === e.selectedKeyframe()?.interpolation);
}
function io(e, { filter: t, label: a, color: o, title: r }) {
  const n = document.createElement("button");
  if (n.type = "button", n.className = "curve-mode", n.dataset.channelFilter = t, n.title = r, o) {
    const i = document.createElement("span");
    i.className = "ch-dot", i.style.background = o, n.appendChild(i);
  }
  return n.appendChild(document.createTextNode(a)), n.addEventListener("click", () => e.setChannelFilter(t)), n;
}
function $n(e) {
  const t = e.curveChannelFilter;
  e.curveChannelFilter = "all";
  try {
    return ot(e);
  } finally {
    e.curveChannelFilter = t;
  }
}
function Lo(e) {
  const t = e.root.querySelector('[data-role="curve-legend"]');
  if (!t) return;
  const a = e.timelineObject(), o = a ? a.name || a.type : e.activeCameraTrack().name, r = $n(e), n = `${o}\0${r.map((c) => `${c.id}:${c.color}`).join("|")}`;
  if (t.dataset.signature !== n) {
    t.dataset.signature = n, t.replaceChildren();
    const c = document.createElement("span");
    c.className = "oc-graph-legend-title", c.textContent = o, t.appendChild(c), t.appendChild(io(e, {
      filter: "all",
      label: s("All"),
      color: null,
      title: s("Show all curves in group")
    })), r.forEach((d, l) => {
      t.appendChild(io(e, {
        filter: String(l),
        label: s(d.name),
        color: d.color,
        title: s("Show only {channel}").replace("{channel}", s(d.name))
      }));
    });
  }
  const i = String(e.curveChannelFilter ?? "all");
  for (const c of t.querySelectorAll("[data-channel-filter]")) {
    const d = c.dataset.channelFilter === i;
    c.classList.toggle("active", d), c.setAttribute("aria-pressed", String(d));
  }
}
const En = 1e-4;
function co(e, t, a) {
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
    (r === null || !(Math.abs(c - r) <= En)) && o.push(n.frame), r = c;
  }
  return o;
}
function Ga(e) {
  const t = e.root.querySelector('[data-role="graph-dope"]');
  if (!t || t.hidden) return;
  const a = e.timelineKeyframes() || [], o = !!e.timelineObject(), r = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame])), n = ot(e), i = [
    e.state.duration_frames,
    Number(e.timelineZoom) || 1,
    Number(e.timelinePan) || 0,
    ...n.map((c) => `${c.id}:${co(a, c, o).join(",")}`)
  ].join("\0");
  if (t.dataset.signature === i) {
    for (const c of t.querySelectorAll(".oc-dope-key")) {
      const d = Number(c.dataset.frame);
      c.classList.toggle("at-playhead", d === e.frame), c.classList.toggle("selected", r.has(d));
    }
    Aa(e);
    return;
  }
  t.dataset.signature = i, t.replaceChildren();
  for (const c of n) {
    const d = document.createElement("div");
    d.className = "oc-gdope-row", d.style.setProperty("--channel-color", c.color);
    const l = document.createElement("span");
    l.className = "oc-gdope-label", l.textContent = s(c.name), d.appendChild(l);
    const p = document.createElement("div");
    p.className = "oc-gdope-track";
    for (const f of co(a, c, o)) {
      const u = H(e, f);
      if (u < -5 || u > 105) continue;
      const v = document.createElement("button");
      v.type = "button", v.className = `oc-dope-key${f === e.frame ? " at-playhead" : ""}${r.has(f) ? " selected" : ""}`, v.style.left = `${u}%`, v.dataset.frame = String(f), v.title = s("{channel} changes at frame {frame}").replace("{channel}", s(c.name)).replace("{frame}", String(f)), v.addEventListener("click", (S) => {
        S.preventDefault(), S.stopPropagation();
        const g = a.find((y) => y.frame === f);
        g && e.selectKeyframe(g);
      }), p.appendChild(v);
    }
    const h = document.createElement("span");
    h.className = "oc-gdope-playhead", p.appendChild(h), d.appendChild(p), t.appendChild(d);
  }
  Aa(e);
}
const lo = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
function To(e, t) {
  const a = e.state.cameras.findIndex((r) => r.id === t), o = a >= 0 ? e.state.cameras[a] : null;
  return { camera: o, color: o?.color || lo[Math.max(0, a) % lo.length] };
}
function Te(e) {
  e.scheduleSerialize(), e.refreshKeys(), e.refreshCameraSelectors(), e.render();
}
function Ko(e, t) {
  const a = at(e.state);
  for (const r of t.querySelectorAll(".oc-sequence-shot")) {
    const n = a[Number(r.dataset.cutIndex)];
    if (!n) continue;
    const i = H(e, n.start), c = H(e, n.end + 1);
    r.style.left = `${i}%`, r.style.width = `${Math.max(0.4, c - i)}%`;
  }
  const o = t.querySelector(".oc-sequence-playhead");
  o && (o.style.left = `${H(e, e.frame)}%`);
}
function Mn(e) {
  e.checkpoint("Auto-split shots"), e.state.sequence = {
    ...e.state.sequence || { recording_path: "" },
    enabled: !0,
    cuts: fr(e.state)
  }, Te(e), e.setStatus(s("Split into {count} shots").replace("{count}", String(e.state.sequence.cuts.length)));
}
function Sa(e, t, a, { disabled: o = !1 } = {}) {
  const r = document.createElement("button");
  return r.type = "button", r.className = "curve-mode", r.title = t, r.textContent = e, r.disabled = o, r.addEventListener("click", a), r;
}
function An(e, t) {
  const a = document.createElement("div");
  a.className = "oc-sequence-toolbar";
  const o = e.state.cameras.length < 2;
  if (a.appendChild(Sa(
    s("Auto-split shots"),
    s("Split the timeline evenly across every camera"),
    () => Mn(e),
    { disabled: o }
  )), t.length && (a.appendChild(Sa(
    s("Split at playhead"),
    s("Cut the current shot in two at the playhead"),
    () => {
      e.checkpoint("Split shot"), ko(e.state, e.frame, null) ? Te(e) : e.setStatus(s("Move the playhead inside a shot first"));
    },
    { disabled: o }
  )), a.appendChild(Sa(
    s("Clear edit"),
    s("Remove every shot and stop cutting the timeline"),
    () => {
      e.checkpoint("Clear edit"), e.state.sequence = { ...e.state.sequence, enabled: !1, cuts: [] }, Te(e), e.setStatus(s("Multi-camera edit cleared"));
    }
  ))), a.appendChild(Sa(
    e.audioWaveformPeaks?.length ? s("Replace audio") : s("Load audio"),
    s("Load an audio track to cut against"),
    () => e.root.querySelector('[data-role="audio-file"]')?.click()
  )), t.length) {
    const r = document.createElement("span");
    r.className = "oc-sequence-summary", r.textContent = s("{count} shots · drag a divider to trim · right-click a shot for its camera").replace("{count}", String(t.length)), a.appendChild(r);
  }
  return a;
}
function Pn(e, t, a, o, r) {
  t.preventDefault(), t.stopPropagation();
  try {
    a.setPointerCapture(t.pointerId);
  } catch {
  }
  e.checkpoint("Trim cut"), e.sequenceDrag = !0;
  const n = (c) => {
    if (!(c.buttons & 1)) return i();
    pr(e.state, r, Ha(e, c, o)) && Ko(e, o);
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
function Fn(e, t, a, o, r) {
  t.preventDefault(), t.stopPropagation();
  const { camera: n } = To(e, a.camera_id);
  e.contextMenu?.show(t, n?.name || s("Shot"), [
    ...e.state.cameras.map((i) => ({
      label: s("Use {name}").replace("{name}", i.name),
      icon: "pi-video",
      disabled: i.id === a.camera_id,
      run: () => {
        e.checkpoint("Change shot camera"), e.state.sequence.cuts[o].camera_id = i.id, Te(e);
      }
    })),
    null,
    {
      label: s("Split at playhead"),
      icon: "pi-arrows-h",
      disabled: e.frame <= a.start || e.frame > a.end,
      run: () => {
        e.checkpoint("Split shot"), ko(e.state, e.frame, null) && Te(e);
      }
    },
    {
      label: s("Remove shot"),
      icon: "pi-trash",
      danger: !0,
      disabled: r === 1,
      run: () => {
        e.checkpoint("Remove shot"), mr(e.state, o) && Te(e);
      }
    }
  ]);
}
function zn(e, t, a, o) {
  const { camera: r, color: n } = To(e, t.camera_id), i = document.createElement("div");
  i.className = "oc-sequence-shot", i.dataset.cutIndex = String(a), i.style.left = `${H(e, t.start)}%`, i.style.width = `${Math.max(0.4, H(e, t.end + 1) - H(e, t.start))}%`, i.style.setProperty("--shot-color", n), r?.recording_path || i.classList.add("no-proxy"), i.title = s("{name} · F{start}-{end}").replace("{name}", r?.name || t.camera_id).replace("{start}", String(t.start)).replace("{end}", String(t.end));
  const c = document.createElement("span");
  if (c.className = "oc-sequence-name", c.textContent = r?.name || t.camera_id, i.appendChild(c), a > 0) {
    const d = document.createElement("span");
    d.className = "oc-sequence-handle", d.title = s("Drag to trim the cut"), d.addEventListener("pointerdown", (l) => Pn(e, l, d, o, a)), i.appendChild(d);
  }
  return i.addEventListener("contextmenu", (d) => Fn(e, d, t, a, o.__cutCount)), i.addEventListener("pointerdown", () => {
    e.root.querySelector('[data-role="graph-sequence"]')?.focus?.({ preventScroll: !0 });
  }), i;
}
function Ln(e) {
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
    const c = Math.max(1, e.state.duration_frames - 1), d = Math.min(50, Math.max(0.1, Number(e.timelineZoom) || 1)), l = Number(e.timelinePan) || 0, p = c / d;
    i.fillStyle = "#f2d06b";
    for (let h = 0; h < a.length; h++) {
      const u = (h / (a.length - 1) * c - l) / Math.max(1e-6, p) * r;
      if (u < -4 || u > r + 4) continue;
      const v = a[h] * n * 0.9;
      i.fillRect(u, (n - v) / 2, Math.max(1, r / a.length * d - 0.5), v);
    }
  }), t;
}
function Io(e, t) {
  if (!t) return;
  const a = t.querySelector('[data-role="sequence-track"]');
  if (e.sequenceDrag && a) {
    Ko(e, a);
    return;
  }
  const o = at(e.state);
  t.replaceChildren(An(e, o));
  const r = document.createElement("div");
  r.className = "oc-sequence-tracks", r.dataset.role = "sequence-track", r.__cutCount = o.length;
  const n = document.createElement("div");
  if (n.className = "oc-sequence-lane", n.dataset.role = "sequence-lane", n.setAttribute("aria-label", s("Multi-camera edit")), o.length)
    for (const [c, d] of o.entries()) {
      const l = H(e, d.start);
      H(e, d.end + 1) < -5 || l > 105 || n.appendChild(zn(e, d, c, r));
    }
  else {
    const c = document.createElement("span");
    c.className = "oc-sequence-empty", c.textContent = e.state.cameras.length > 1 ? s("No shots yet. Auto-split hands each camera a slice of the timeline.") : s("Add a second camera, then Auto-split to cut between them."), n.appendChild(c);
  }
  r.appendChild(n), r.appendChild(Ln(e));
  const i = document.createElement("span");
  i.className = "oc-sequence-playhead", i.style.left = `${H(e, e.frame)}%`, r.appendChild(i), t.appendChild(r);
}
const Tn = ['[data-act="curve-zoom-in"]', '[data-act="curve-zoom-out"]', '[data-act="curve-fit"]', '[data-act="curve-handles"]'], mo = { curves: "Graph Editor", dope: "Dope Sheet", sequence: "Sequence" };
function Kn(e, t) {
  const a = t in mo ? t : "curves";
  e.graphTab = a;
  for (const i of e.root.querySelectorAll("[data-graph-tab]")) {
    const c = i.dataset.graphTab === a;
    i.classList.toggle("active", c), i.setAttribute("aria-pressed", String(c));
  }
  const o = e.root.querySelector('[data-role="curve-canvas"]'), r = e.root.querySelector('[data-role="graph-dope"]'), n = e.root.querySelector('[data-role="graph-sequence"]');
  o && (o.hidden = a !== "curves"), r && (r.hidden = a !== "dope"), n && (n.hidden = a !== "sequence");
  for (const i of Tn) {
    const c = e.root.querySelector(i);
    c && (c.disabled = a !== "curves");
  }
  a === "dope" ? Ga(e) : a === "sequence" ? (Io(e, n), n?.focus?.({ preventScroll: !0 })) : e.drawCurveEditor(), e.setStatus(s(mo[a]));
}
function In(e) {
  e.graphTab === "sequence" && Io(e, e.root.querySelector('[data-role="graph-sequence"]'));
}
function On(e, t) {
  for (const a of e.root.querySelectorAll("[data-graph-tab]"))
    a.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), Kn(e, a.dataset.graphTab);
    }, { signal: t });
}
class Oo {
  constructor({ capture: t, restore: a, limit: o = 100 }) {
    this.capture = t, this.restore = a, this.limit = o, this.undoStack = [], this.redoStack = [], this.restoring = !1;
  }
  checkpoint(t = "Edit") {
    if (this.restoring) return;
    const a = this.capture();
    this.undoStack.at(-1)?.snapshot !== a && (this.undoStack.push({ label: t, snapshot: a }), this.undoStack.length > this.limit && this.undoStack.shift(), this.redoStack.length = 0);
  }
  undo() {
    if (!this.undoStack.length) return null;
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
    if (!this.redoStack.length) return null;
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
    this.undoStack.length = 0, this.redoStack.length = 0;
  }
  get canUndo() {
    return this.undoStack.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }
}
function qn(e, t) {
  const a = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "h3-setup": "Create and connect the H3 camera-motion reference nodes", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const o of e.querySelectorAll("button,select,input,summary")) {
    if (o.title) continue;
    const r = o.getAttribute("aria-label") || a[o.dataset?.act] || o.closest("label")?.querySelector("span")?.textContent?.trim() || o.closest("label")?.childNodes?.[0]?.textContent?.trim() || o.textContent?.trim();
    r && (o.title = r);
  }
  t.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.", e.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}
class qo {
  constructor(t) {
    this.root = t, this.menu = t.querySelector('[data-role="context-menu"]'), this.returnFocus = null, this.dismissHandler = null, this.dismissTimer = null, this.disposed = !1, this.menu && (this.menu.classList.add("majoor-omnicam"), this.menu.addEventListener("pointerdown", (a) => a.stopPropagation()), this.menu.addEventListener("mousedown", (a) => a.stopPropagation()), this.menu.addEventListener("click", (a) => a.stopPropagation()), this.menu.addEventListener("contextmenu", (a) => {
      a.preventDefault(), a.stopPropagation();
    }), this.menu.addEventListener("keydown", (a) => this.onKey(a)));
  }
  hide({ restoreFocus: t = !1 } = {}) {
    this.dismissTimer !== null && (clearTimeout(this.dismissTimer), this.dismissTimer = null), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0), this.dismissHandler = null), this.menu && (this.menu.hidden = !0, t && this.returnFocus?.focus?.({ preventScroll: !0 }));
  }
  show(t, a, o) {
    if (!this.menu || this.disposed) return;
    t.preventDefault(), t.stopPropagation(), t.stopImmediatePropagation?.(), this.returnFocus = document.activeElement, this.menu.parentElement !== document.body && document.body.appendChild(this.menu), this.menu.classList.add("majoor-omnicam"), this.menu.innerHTML = "";
    const r = document.createElement("div");
    r.className = "context-menu-title", r.textContent = a, this.menu.appendChild(r);
    for (const l of o) {
      if (l === null) {
        const u = document.createElement("div");
        u.className = "context-menu-separator", this.menu.appendChild(u);
        continue;
      }
      const p = document.createElement("button");
      p.type = "button", p.setAttribute("role", "menuitem"), p.disabled = !!l.disabled, p.classList.toggle("danger", !!l.danger), p.title = l.help || l.label;
      const h = document.createElement("i");
      h.className = `pi ${l.icon || "pi-angle-right"}`;
      const f = document.createElement("span");
      if (f.textContent = l.label, p.append(h, f), l.shortcut) {
        const u = document.createElement("span");
        u.className = "shortcut", u.textContent = l.shortcut, p.appendChild(u);
      }
      p.addEventListener("pointerdown", (u) => u.stopPropagation()), p.addEventListener("mousedown", (u) => u.stopPropagation()), p.addEventListener("click", (u) => {
        u.preventDefault(), u.stopPropagation(), this.hide();
        try {
          l.run?.();
        } catch (v) {
          console.error("Context menu action failed:", v);
        }
      }), this.menu.appendChild(p);
    }
    this.menu.hidden = !1;
    const n = 8, i = this.menu.getBoundingClientRect(), c = Math.max(n, Math.min(t.clientX, window.innerWidth - i.width - n)), d = Math.max(n, Math.min(t.clientY, window.innerHeight - i.height - n));
    this.menu.style.left = `${c}px`, this.menu.style.top = `${d}px`, this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 }), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0)), this.dismissHandler = (l) => {
      l.target && this.menu.contains(l.target) || this.hide();
    }, this.dismissTimer = setTimeout(() => {
      this.dismissTimer = null, !this.disposed && (document.addEventListener("pointerdown", this.dismissHandler, !0), document.addEventListener("contextmenu", this.dismissHandler, !0));
    }, 0);
  }
  dispose() {
    this.disposed || (this.hide(), this.disposed = !0, this.menu?.remove(), this.menu = null);
  }
  onKey(t) {
    if (!this.menu || this.menu.hidden) return !1;
    const a = [...this.menu.querySelectorAll("button:not(:disabled)")], o = a.indexOf(document.activeElement);
    if (t.key === "Escape")
      return t.preventDefault(), this.hide({ restoreFocus: !0 }), !0;
    if (["ArrowDown", "ArrowUp"].includes(t.key)) {
      t.preventDefault();
      const r = t.key === "ArrowDown" ? 1 : -1;
      return a[(o + r + a.length) % a.length]?.focus(), !0;
    }
    return !1;
  }
}
async function Xa(e, t, a, o) {
  let r, n, i, c;
  typeof e == "object" && e !== null ? (r = e, n = t, i = a, c = o) : (r = typeof window < "u" ? window.app : null, n = e, i = t, c = a);
  const d = r?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return d?.prompt ? d.prompt({ title: n, message: i, defaultValue: c }) : (console.warn("OmniCam prompt unavailable: ComfyUI dialog API is not present"), null);
}
async function Do(e, t, a) {
  let o, r, n;
  typeof e == "object" && e !== null ? (o = e, r = t, n = a) : (o = typeof window < "u" ? window.app : null, r = e, n = t);
  const i = o?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return i?.confirm ? i.confirm({ title: r, message: n }) : (console.warn("OmniCam confirmation unavailable: ComfyUI dialog API is not present"), !1);
}
class No {
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
async function Ya(e, { route: t, field: a = "file", file: o }) {
  if (!o) throw new TypeError("A file is required");
  const r = new FormData();
  r.append(a, o, o.name);
  const n = await e.fetchApi(t, { method: "POST", body: r });
  if (!n.ok) throw new Error(await n.text());
  return n.json();
}
const Dn = `
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
      .majoor-omnicam .oc-body{display:grid;grid-template-columns:minmax(0,1fr) 268px;gap:8px;padding:8px;background:var(--oc-bg);align-items:start}
      .majoor-omnicam .oc-stage{min-width:0}
      .majoor-omnicam .oc-body .viewport-wrap{border-radius:var(--oc-radius);overflow:hidden;box-shadow:none;border:1px solid var(--oc-line)}
      .majoor-omnicam.oc-fullscreen .oc-body{grid-template-columns:minmax(0,1fr)}
      .majoor-omnicam.oc-fullscreen .oc-side,.majoor-omnicam.oc-fullscreen .oc-lower,.majoor-omnicam.oc-fullscreen .oc-graph{display:none}

      /* ---- viewport chrome ------------------------------------------ */
      .majoor-omnicam .vp-pills{position:absolute;top:9px;left:9px;z-index:6;display:flex;gap:5px}
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
      .majoor-omnicam .vp-axis{position:absolute;top:44px;right:9px;z-index:6;pointer-events:none;overflow:visible;filter:drop-shadow(0 1px 3px rgba(0,0,0,.65))}
      .majoor-omnicam .vp-hint{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);z-index:5;color:var(--oc-text-faint);font-size:10.5px;white-space:nowrap;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.9)}
      .majoor-omnicam .vp-state{position:absolute;bottom:8px;left:9px;z-index:5;color:var(--oc-text-dim);font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace;pointer-events:none}
      .majoor-omnicam .vp-state:empty{display:none}
      /* The legacy HUD anchored top-left, which is now the pills + rail corner.
         It moves to the right edge, clearing the zoom readout and the axis gizmo. */
      .majoor-omnicam .oc-body .hud{left:auto;right:9px;top:104px;max-width:52%;text-align:right}
      .majoor-omnicam .oc-body .viewport-tally-banner{top:44px}

      /* ---- side panel ------------------------------------------------ */
      .majoor-omnicam .oc-side{position:static;width:auto;max-height:none;display:flex;flex-direction:column;gap:8px;background:transparent;border:0;padding:0;box-shadow:none;backdrop-filter:none}
      .majoor-omnicam .oc-side-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:3px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius)}
      .majoor-omnicam .oc-side-tabs .inspector-tab{padding:5px 4px;border-radius:var(--oc-radius-sm);background:transparent;border:1px solid transparent;color:var(--oc-text-dim);font-size:11.5px;font-weight:550}
      .majoor-omnicam .oc-side-tabs .inspector-tab.active{background:var(--oc-panel-2) !important;border-color:var(--oc-line) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam .oc-side-body{display:flex;flex-direction:column;gap:7px;max-height:520px;overflow-y:auto;padding-right:2px}
      .majoor-omnicam .oc-side-toolbar{display:flex;gap:4px;align-items:center}
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
      .majoor-omnicam .oc-lens-presets{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}
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
      .majoor-omnicam .oc-health-metrics{display:flex;flex-direction:column;gap:2px;margin-top:5px}
      .majoor-omnicam .oc-health-metric{display:flex;align-items:center;gap:6px;padding:3px 5px;border-radius:4px;background:var(--oc-sunken);font-size:11px}
      .majoor-omnicam .oc-health-metric-name{flex:1;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-health-metric-value{font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text)}
      .majoor-omnicam .oc-health-dot{flex:0 0 7px;width:7px;height:7px;border-radius:50%;background:var(--oc-health-ok)}
      .majoor-omnicam [data-grade=warn] .oc-health-dot{background:var(--oc-health-warn)}
      .majoor-omnicam [data-grade=over] .oc-health-dot{background:var(--oc-health-over)}
      .majoor-omnicam .oc-health-zones{display:flex;flex-direction:column;gap:2px}
      .majoor-omnicam .oc-health-zone{display:flex;align-items:center;gap:6px;width:100%;padding:3px 5px;background:var(--oc-sunken);border:1px solid transparent;border-radius:4px;color:var(--oc-text);font-size:11px;text-align:left;cursor:pointer}
      .majoor-omnicam .oc-health-zone:hover{border-color:var(--oc-line)}
      .majoor-omnicam .oc-health-zone-range{flex:0 0 auto;font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .oc-health-zone-reason{flex:1;overflow:hidden;color:var(--oc-text-dim);text-overflow:ellipsis;white-space:nowrap}
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
`, Nn = `
      .majoor-omnicam .menu-section{display:flex;flex-direction:column;gap:5px}
      .majoor-omnicam[data-density="basic"] [data-density-min="animation"],
      .majoor-omnicam[data-density="basic"] [data-density-min="advanced"],
      .majoor-omnicam[data-density="animation"] [data-density-min="advanced"]{display:none !important}
`, Rn = `
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
      .majoor-omnicam button.primary{background:linear-gradient(180deg,#2e7d32,#1b5e20);border-color:#4caf50;color:#fff;box-shadow:0 0 10px #2e7d3266,inset 0 1px 0 #ffffff33}
      .majoor-omnicam button.primary:hover{background:linear-gradient(180deg,#388e3c,#256e29);border-color:#81c784;box-shadow:0 0 14px #4caf5088}
      .majoor-omnicam button.active,.majoor-omnicam button[aria-pressed="true"],.majoor-omnicam .icon-button.active,.majoor-omnicam .icon-button[aria-pressed="true"]{background:linear-gradient(180deg,#2563eb,#1d4ed8) !important;border-color:#60a5fa !important;color:#ffffff !important;box-shadow:0 0 10px rgba(59,130,246,0.5),inset 0 1px 0 rgba(255,255,255,0.3) !important}
      .majoor-omnicam .icon-button{display:inline-grid !important;place-items:center !important;width:28px !important;height:28px !important;min-width:28px !important;padding:0 !important;cursor:pointer;color:#9494a8}
      .majoor-omnicam .icon-button .pi{font-size:13px;line-height:1;display:block;margin:0 auto}
      .majoor-omnicam .icon-button:hover{color:#fff;border-color:#5d5d74}
      
      /* Button Specific Active Themes */
      .majoor-omnicam [data-act="play"]{color:#4ade80;border-color:#2e7d32}
      .majoor-omnicam [data-act="play"]:hover{border-color:#4ade80;color:#86efac}
      .majoor-omnicam [data-act="play"].playing,.majoor-omnicam [data-act="play"].active{background:linear-gradient(180deg,#16a34a,#15803d) !important;border-color:#4ade80 !important;color:#fff !important;box-shadow:0 0 12px rgba(34,197,94,0.6),inset 0 1px 0 rgba(255,255,255,0.3) !important}
      
      .majoor-omnicam [data-act="auto-key"]{color:#888}
      .majoor-omnicam [data-act="auto-key"].active,.majoor-omnicam [data-act="auto-key"][aria-pressed="true"]{background:linear-gradient(180deg,#dc2626,#991b1b) !important;border-color:#f87171 !important;color:#fff !important;box-shadow:0 0 12px rgba(239,68,68,0.7),inset 0 1px 0 rgba(255,255,255,0.3) !important;animation:autoKeyBlink 1.6s infinite}
      
      .majoor-omnicam [data-act="toggle-snap"].active,.majoor-omnicam [data-act="toggle-snap"][aria-pressed="true"]{background:linear-gradient(180deg,#d97706,#b45309) !important;border-color:#fbbf24 !important;color:#fff !important;box-shadow:0 0 10px rgba(245,158,11,0.5) !important}
      .majoor-omnicam [data-act="loop"].active,.majoor-omnicam [data-act="loop"][aria-pressed="true"]{background:linear-gradient(180deg,#2563eb,#1d4ed8) !important;border-color:#60a5fa !important;color:#fff !important;box-shadow:0 0 10px rgba(59,130,246,0.5) !important}
      .majoor-omnicam [data-act="toggle-camera-view"].active,.majoor-omnicam [data-act="toggle-inspector"].active{background:linear-gradient(180deg,#0284c7,#0369a1) !important;border-color:#38bdf8 !important;color:#fff !important;box-shadow:0 0 10px rgba(14,165,233,0.5) !important}
      .majoor-omnicam [data-select-mode].active,.majoor-omnicam [data-select-mode][aria-pressed="true"]{background:linear-gradient(180deg,#0284c7,#0369a1) !important;border-color:#38bdf8 !important;color:#fff !important;box-shadow:0 0 10px rgba(56,189,248,0.6),inset 0 1px 0 rgba(255,255,255,0.3) !important}
      .majoor-omnicam [data-transform-mode].active,.majoor-omnicam [data-transform-mode][aria-pressed="true"]{background:linear-gradient(180deg,#2563eb,#1d4ed8) !important;border-color:#60a5fa !important;color:#fff !important;box-shadow:0 0 10px rgba(59,130,246,0.6),inset 0 1px 0 rgba(255,255,255,0.3) !important}
      
      .majoor-omnicam .toolbar-menu{position:relative}.majoor-omnicam .toolbar-menu>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 9px;border:1px solid transparent;border-radius:6px;cursor:pointer;white-space:nowrap;list-style:none}.majoor-omnicam .toolbar-menu>summary::-webkit-details-marker{display:none}.majoor-omnicam .toolbar-menu[open]>summary,.majoor-omnicam .toolbar-menu>summary:hover{background:#30303c;border-color:#484858}
      .majoor-omnicam .menu-panel{position:absolute;z-index:50;top:calc(100% + 5px);left:0;display:flex;flex-direction:column;gap:5px;width:240px;padding:8px;background:#202028;border:1px solid #4a4a5a;border-radius:8px;box-shadow:0 10px 24px #000c}.majoor-omnicam .menu-panel.right{right:0;left:auto}.majoor-omnicam .menu-panel button{display:flex;align-items:center;gap:7px;text-align:left}.majoor-omnicam .menu-panel label{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#bbb}.majoor-omnicam .menu-panel label>select,.majoor-omnicam .menu-panel label>input[type=number]{width:126px}.majoor-omnicam .menu-panel label>input[type=checkbox]{width:auto}.majoor-omnicam .menu-title{color:#888;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.majoor-omnicam .menu-divider{height:1px;margin:4px 0;background:#3a3a48}.majoor-omnicam .camera-menu-list{display:flex;max-height:180px;flex-direction:column;gap:4px;overflow-y:auto}.majoor-omnicam .camera-menu-list button.selected{border-color:#e3c35d;color:#f2d06b}
      
      /* Viewport Wrapper & Prominent Highlights */
      .majoor-omnicam .viewport-wrap{position:relative;width:100%;min-height:280px;aspect-ratio:16/9;background:#0d0d10;touch-action:none;overscroll-behavior:contain;pointer-events:auto;outline:none;box-shadow:inset 0 0 0 2px rgba(255,255,255,0.08);transition:box-shadow .2s ease,border-color .2s ease}
      .majoor-omnicam .viewport-wrap.auto-key{box-shadow:inset 0 0 0 4px #f59e0b,inset 0 0 24px rgba(245,158,11,0.35),0 0 16px rgba(245,158,11,0.45);animation:autoKeyWrapGlow 2s ease-in-out infinite alternate}
      @keyframes autoKeyWrapGlow{0%{box-shadow:inset 0 0 0 3px #f59e0b,inset 0 0 16px rgba(245,158,11,0.25),0 0 10px rgba(245,158,11,0.3)}100%{box-shadow:inset 0 0 0 4px #fbbf24,inset 0 0 28px rgba(245,158,11,0.45),0 0 20px rgba(245,158,11,0.6)}}
      .majoor-omnicam .viewport-wrap.edit-mode{box-shadow:inset 0 0 0 4px #ef4444,inset 0 0 30px rgba(239,68,68,0.45),0 0 22px rgba(239,68,68,0.6) !important;animation:editModeWrapGlow 1s ease-in-out infinite alternate !important}
      @keyframes editModeWrapGlow{0%{box-shadow:inset 0 0 0 4px #ef4444,inset 0 0 20px rgba(239,68,68,0.3),0 0 14px rgba(239,68,68,0.45)}100%{box-shadow:inset 0 0 0 5px #f87171,inset 0 0 36px rgba(239,68,68,0.6),0 0 28px rgba(239,68,68,0.75)}}
      
      /* Prominent Tally / Live Recording Status Banner */
      .majoor-omnicam .viewport-tally-banner{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:8;display:inline-flex;align-items:center;gap:7px;padding:4px 14px;border-radius:20px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;pointer-events:none;backdrop-filter:blur(8px);box-shadow:0 4px 16px rgba(0,0,0,0.6);transition:all .2s ease}
      .majoor-omnicam .viewport-tally-banner[hidden]{display:none}
      .majoor-omnicam .viewport-tally-banner .tally-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner{display:inline-flex;background:rgba(40,25,5,0.92);border:1px solid #f59e0b;color:#fef3c7;box-shadow:0 0 14px rgba(245,158,11,0.5)}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner .tally-dot{background:#f59e0b;box-shadow:0 0 8px #f59e0b;animation:tallyBlink 1.4s infinite}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner{display:inline-flex;background:rgba(50,10,10,0.94);border:1px solid #ef4444;color:#fee2e2;box-shadow:0 0 16px rgba(239,68,68,0.6)}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner .tally-dot{background:#ef4444;box-shadow:0 0 10px #ef4444;animation:tallyBlink .8s infinite}
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
      .majoor-omnicam .scene-tree{display:flex;flex-direction:column;gap:3px;max-height:150px;overflow-y:auto;overscroll-behavior:contain;margin-bottom:8px;background:#141418;padding:4px;border-radius:5px;border:1px solid #2e2e38}
      .majoor-omnicam .scene-item{display:flex;align-items:center;gap:6px;width:100%;min-height:26px;padding:3px 6px;text-align:left;border:1px solid transparent;background:transparent;border-radius:4px;font-size:11px;cursor:pointer;user-select:none;box-sizing:border-box}
      .majoor-omnicam .scene-item:hover{background:rgba(255,255,255,0.05)}
      .majoor-omnicam .scene-item.selected{background:#263c54;border-color:#4a76a8;color:#fff}
      .majoor-omnicam .scene-item.active-view{border-color:#38603c;background:rgba(56,96,60,0.25)}
      .majoor-omnicam .scene-item-label{flex:1;min-width:0;display:inline-flex;align-items:center;gap:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .scene-item-actions{display:inline-flex;align-items:center;justify-content:flex-end;gap:2px;flex-shrink:0;margin-left:auto}
      .majoor-omnicam .scene-action-btn{width:20px !important;height:20px !important;min-width:20px !important;padding:0 !important;display:inline-flex !important;align-items:center;justify-content:center;border-radius:4px;border:1px solid transparent;background:transparent;color:#9494a8;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .scene-action-btn:hover{background:#31313e;border-color:#58586c;color:#fff}
      .majoor-omnicam .scene-item .pi{width:14px;text-align:center;flex-shrink:0}
      .majoor-omnicam .motion-tools{position:absolute;z-index:7;left:50%;top:50px;display:flex;gap:3px;padding:4px;transform:translateX(-50%);background:rgba(20,20,26,.9);border:1px solid #454552;border-radius:6px;backdrop-filter:blur(7px)}
      .majoor-omnicam .motion-tools button{width:28px;height:28px;min-width:28px;padding:0}
      .majoor-omnicam .motion-tools button.active{background:#187b70 !important;border-color:#41d9c5 !important;box-shadow:0 0 8px #41d9c577 !important}
      .majoor-omnicam canvas[data-motion-tool="track"],.majoor-omnicam canvas[data-motion-tool="anchor"],.majoor-omnicam canvas[data-motion-tool="project"],.majoor-omnicam canvas[data-motion-tool="erase"]{cursor:crosshair}
      .majoor-omnicam .motion-section-title{margin-top:8px}.majoor-omnicam .motion-preset-bar{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;margin:4px 0}.majoor-omnicam .motion-preset-bar button{min-width:0;padding:3px 1px;font-size:9px;overflow:hidden}
      .majoor-omnicam .motion-empty{padding:8px;color:#777;text-align:center;background:#141418;border:1px solid #2e2e38;border-radius:5px}.majoor-omnicam .motion-layer-list{display:flex;max-height:110px;flex-direction:column;gap:3px;overflow:auto}.majoor-omnicam .motion-layer-row{display:grid;grid-template-columns:16px minmax(0,1fr) auto;width:100%;gap:5px;padding:4px 6px;text-align:left;background:#17171d}.majoor-omnicam .motion-layer-row span{overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .motion-layer-row small{color:#7f8c9d;font-size:9px}.majoor-omnicam .motion-layer-row.active{border-color:#41d9c5 !important;background:#173b38 !important}.majoor-omnicam .motion-layer-controls{display:grid;grid-template-columns:minmax(0,1fr) auto 28px 28px 28px;gap:3px;align-items:center;margin:4px 0 8px}.majoor-omnicam .motion-layer-controls label{display:flex;align-items:center;gap:3px;font-size:9px}.majoor-omnicam .motion-layer-controls input{width:14px}
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
      .majoor-omnicam .curve-editor{margin-top:6px;border:1px solid #393946;border-radius:6px;background:#15151a}.majoor-omnicam .curve-editor>summary{display:flex;align-items:center;gap:6px;min-height:29px;padding:4px 7px;cursor:pointer;list-style:none}.majoor-omnicam .curve-editor>summary::-webkit-details-marker{display:none}.majoor-omnicam .curve-toolbar{display:flex;align-items:center;gap:4px;padding:0 6px 5px;flex-wrap:wrap}.majoor-omnicam .curve-toolbar select{height:27px;padding:2px 5px}.majoor-omnicam .curve-mode{display:inline-flex;align-items:center;gap:4px;height:27px;padding:2px 6px}.majoor-omnicam .curve-mode.active{background:#644536;border-color:#d18a57}.majoor-omnicam [data-tangent-mode].active{background:#2e4a64;border-color:#6f9bca}.majoor-omnicam [data-channel-filter="0"].active{background:#4d1d1d;border-color:#ef5350;color:#ffc7c7}.majoor-omnicam [data-channel-filter="1"].active{background:#1a4223;border-color:#53d86a;color:#c7ffd2}.majoor-omnicam [data-channel-filter="2"].active{background:#1d354d;border-color:#4aa3ef;color:#c7e6ff}.majoor-omnicam .ch-dot{display:inline-block;width:7px;height:7px;border-radius:50%}.majoor-omnicam .curve-canvas{display:block;width:100%;height:180px;border-top:1px solid #333340;background:#111114;cursor:crosshair;touch-action:none}
      
      /* Context Menu & Panels */
      .majoor-omnicam .context-menu, .context-menu.majoor-omnicam{position:fixed;z-index:100000;display:flex;min-width:220px;max-width:290px;flex-direction:column;gap:2px;padding:6px;background:#202028;border:1px solid #555566;border-radius:8px;box-shadow:0 12px 30px #000e;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}.majoor-omnicam .context-menu[hidden],.context-menu.majoor-omnicam[hidden]{display:none}.majoor-omnicam .context-menu button,.context-menu.majoor-omnicam button{display:flex;align-items:center;gap:8px;width:100%;min-height:28px;text-align:left;border-color:transparent;background:transparent;color:#e2e8f0;font-size:12px;cursor:pointer;border-radius:4px;padding:4px 8px;border:1px solid transparent}.majoor-omnicam .context-menu button:hover,.majoor-omnicam .context-menu button:focus-visible,.context-menu.majoor-omnicam button:hover,.context-menu.majoor-omnicam button:focus-visible{background:#373744;border-color:#555566;color:#fff}.majoor-omnicam .context-menu button:disabled,.context-menu.majoor-omnicam button:disabled{opacity:.4;cursor:not-allowed}.majoor-omnicam .context-menu .danger,.context-menu.majoor-omnicam .danger{color:#ff9995}.majoor-omnicam .context-menu .shortcut,.context-menu.majoor-omnicam .shortcut{margin-left:auto;color:#888;font-size:10px}.majoor-omnicam .context-menu-separator,.context-menu.majoor-omnicam .context-menu-separator{height:1px;margin:3px;background:#414150}.majoor-omnicam .context-menu-title,.context-menu.majoor-omnicam .context-menu-title{padding:3px 7px;color:#999;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
      .majoor-omnicam .compact-panel{margin-top:6px;border:1px solid #353544;border-radius:6px;background:#202028}.majoor-omnicam .compact-panel>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 7px;cursor:pointer;color:#ccc;list-style:none}.majoor-omnicam .compact-panel>summary::-webkit-details-marker{display:none}.majoor-omnicam .compact-panel>summary::after{content:"›";margin-left:auto;transform:rotate(90deg);color:#777}.majoor-omnicam .compact-panel[open]>summary::after{transform:rotate(-90deg)}.majoor-omnicam .panel-body{padding:0 7px 7px}
      .majoor-omnicam .key-editor-header{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:6px}.majoor-omnicam .key-editor-grid,.majoor-omnicam .inspector-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:5px}.majoor-omnicam .key-editor-grid label,.majoor-omnicam .inspector-grid label{display:flex;align-items:center;justify-content:space-between;gap:4px;color:#bbb}.majoor-omnicam .key-editor-grid input,.majoor-omnicam .key-editor-grid select,.majoor-omnicam .inspector-grid input,.majoor-omnicam .inspector-grid select{min-width:0;width:70px}.majoor-omnicam .key-editor[data-empty="true"] .key-editor-grid{opacity:.45}
      .majoor-omnicam .status{margin-left:auto;color:#aaa}.majoor-omnicam .hint{color:#aaa;font-size:11px}
      .majoor-omnicam details.help{padding:7px 10px;background:#181820;color:#c8c8c8}.majoor-omnicam details.help summary{cursor:pointer;color:#f2d06b}.majoor-omnicam details.help p{margin:6px 0}
      @container (max-width:700px){.majoor-omnicam .top{overflow-x:auto;overflow-y:hidden}.majoor-omnicam .viewport-quick-bar{right:10px;max-width:calc(100% - 20px)}.majoor-omnicam .selection-mode-group button span{display:none}.majoor-omnicam .viewport-tally-banner{top:82px;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.majoor-omnicam .hud{top:108px;right:10px;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .viewport-inspector{top:auto;bottom:10px;width:min(250px,calc(100% - 20px));max-height:42%}.majoor-omnicam .timeline-toolbar{overflow-x:auto;flex-wrap:nowrap}.majoor-omnicam .timeline-summary{display:none}}
      @container (max-width:460px){.majoor-omnicam .viewport-wrap{min-height:360px;aspect-ratio:auto}.majoor-omnicam .camera-preview-strip[data-layout="2"],.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr;grid-auto-columns:100%}.majoor-omnicam .menu-panel{width:min(240px,calc(100cqw - 24px))}}
`, Bn = Vr + Rn + Dn + qr + Nn;
function Wn() {
  return `
    <div class="oc-header">
      ${Ur("OmniCam Director")}
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
          </div>
          <div class="menu-divider"></div>
          <div class="setup-badge" data-role="setup-badge" hidden></div>
          <div data-role="setup-issues"></div>
        </div>
      </details>
      <span class="oc-status-pill" data-role="status"><span class="oc-status-dot"></span>${s("Ready")}</span>
    </div>`;
}
function Hn() {
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
function Vn() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="scene">
      <div class="oc-side-toolbar">
        <button class="icon-button" data-act="load-model" title="${s("Import 3D Model (+)")}"><i class="pi pi-plus"></i></button>
        <button class="icon-button" data-act="add-camera" title="${s("Create camera from current view")}"><i class="pi pi-video"></i></button>
        <input class="oc-search" data-role="outliner-search" type="search" placeholder="${s("Search")}" aria-label="${s("Filter the outliner")}">
      </div>
      <div class="outliner-quick-bar">
        <button data-object-type="ground" title="${s("Add Ground (+)")}"><i class="pi pi-minus"></i> ${s("Ground")}</button>
        <button data-object-type="cube" title="${s("Add Cube (+)")}"><i class="pi pi-stop"></i> ${s("Cube")}</button>
        <button data-object-type="sphere" title="${s("Add Sphere (+)")}"><i class="pi pi-circle"></i> ${s("Sphere")}</button>
        <button data-object-type="human" title="${s("Add Human (+)")}"><i class="pi pi-user"></i> ${s("Human")}</button>
        <button data-object-type="null" title="${s("Add Null (+)")}"><i class="pi pi-plus"></i> ${s("Null")}</button>
      </div>
      <div class="scene-tree" data-role="objects"></div>
      <div class="oc-section motion-section-title">${s("Motion Tracks")}</div>
      <div class="motion-preset-bar" aria-label="${s("Camera field presets")}">
        <button data-motion-preset="balanced" title="${s("Balanced camera field")}">${s("Balanced")}</button>
        <button data-motion-preset="foreground" title="${s("Foreground camera field")}">${s("Foreground")}</button>
        <button data-motion-preset="subject" title="${s("Subject camera field")}">${s("Subject")}</button>
        <button data-motion-preset="ground_parallax" title="${s("Ground parallax camera field")}">${s("Ground")}</button>
        <button data-motion-preset="depth_layers" title="${s("Depth layers camera field")}">${s("Depth")}</button>
      </div>
      <div class="motion-empty" data-role="motion-layers-empty">${s("No motion tracks")}</div>
      <div class="motion-layer-list" data-role="motion-layers"></div>
      <div class="motion-layer-controls">
        <select data-role="motion-interpolation" title="${s("Motion interpolation")}">
          <option value="linear">${s("Linear")}</option><option value="smooth">${s("Smooth")}</option><option value="hold">${s("Hold")}</option>
        </select>
        <label title="${s("Motion key visibility")}"><input data-role="motion-key-visible" type="checkbox" checked> ${s("Visible")}</label>
        <button class="icon-button" data-motion-layer-action="retime" title="${s("Retime motion keys to playback range")}"><i class="pi pi-clock"></i></button>
        <button class="icon-button" data-motion-layer-action="toggle" title="${s("Enable or disable motion layer")}"><i class="pi pi-eye"></i></button>
        <button class="icon-button" data-motion-layer-action="delete" title="${s("Delete motion layer")}"><i class="pi pi-trash"></i></button>
      </div>
      <div class="oc-card" data-role="object-panel">
        <div class="oc-card-title" data-role="selected-name">${s("Object Transform")}</div>
        <div class="oc-field-row">
          <span class="oc-field-label">${s("Material")}</span>
          <select data-role="object-material" title="${s("Viewport material")}">
            <option value="textured">${s("Textures")}</option><option value="checker">${s("Checker")}</option>
            <option value="neutral">${s("Neutral")}</option><option value="wireframe">${s("Wireframe")}</option>
          </select>
          <input data-role="object-color" type="color" value="#8c929b" title="${s("Object Color")}">
        </div>
        <div class="oc-field-row">
          <span class="oc-field-label">${s("Parent")}</span>
          <select data-role="object-parent" title="${s("Parent object")}"><option value="">${s("No parent")}</option></select>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Position")}</span>
          <label class="oc-axis x">X<input data-role="object-x" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="object-y" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="object-z" type="number" step="0.1"></label>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Rotation")}</span>
          <label class="oc-axis x">X<input data-role="object-rx" type="number" step="1"></label>
          <label class="oc-axis y">Y<input data-role="object-ry" type="number" step="1"></label>
          <label class="oc-axis z">Z<input data-role="object-rz" type="number" step="1"></label>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Scale")}</span>
          <label class="oc-axis x">X<input data-role="object-sx" type="number" min="0.01" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="object-sy" type="number" min="0.01" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="object-sz" type="number" min="0.01" step="0.1"></label>
        </div>
        <div class="animation-row" data-role="animation-row" hidden><i class="pi pi-play-circle"></i><select data-role="animation-select" title="${s("Animation clip")}"></select></div>
      </div>
      <div class="oc-field-row"><span class="oc-field-label">${s("Upstream reference")}</span>
        <select data-role="reference-select"><option value="0">${s("Upstream 1")}</option></select>
      </div>
    </div>`;
}
function Un() {
  const e = Dr.map((t) => `<button data-lens="${t}">${t}mm</button>`).join("");
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="camera" hidden>
      <div class="oc-card">
        <div class="oc-card-title"><i class="pi pi-video"></i> <span data-role="inspector-camera-name">${s("Camera")}</span>
          <input data-role="camera-color" type="color" value="#4aa3ef" title="${s("Camera Color")}">
        </div>

        <div class="oc-section">${s("Lens")}</div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Focal Length")}</span>
          <input data-role="camera-focal" type="number" min="4" max="800" step="0.5"><span class="oc-unit">mm</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("FOV")}</span>
          <input data-role="camera-fov" type="number" min="5" max="150" step="0.1"><span class="oc-unit">°</span>
        </div>
        <div class="oc-lens-presets">${e}</div>

        <div class="oc-section">${s("Transform")}</div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Position")}</span>
          <label class="oc-axis x">X<input data-role="camera-px" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="camera-py" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="camera-pz" type="number" step="0.1"></label>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Target XYZ")}</span>
          <label class="oc-axis x">X<input data-role="camera-tx" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="camera-ty" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="camera-tz" type="number" step="0.1"></label>
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
        <div class="oc-field-row"><span class="oc-field-label">${s("Far Clip")}</span><input data-role="camera-far" type="number" min="0.0002" step="1"></div>
      </details>
    </div>`;
}
function Gn() {
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
        <div class="oc-field-row"><span class="oc-field-label">${s("Frame")}</span><input data-role="key-frame" type="number" min="0" value="0"></div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Interpolation")}</span>
          <select data-role="key-interp">
            <option value="ease">${s("Ease")}</option><option value="smooth">${s("Smooth")}</option>
            <option value="bezier">${s("Bezier")}</option><option value="linear">${s("Linear")}</option>
            <option value="ease_in">${s("Ease In")}</option><option value="ease_out">${s("Ease Out")}</option>
            <option value="hold">${s("Hold")}</option>
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
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Position")}</span>
          <label class="oc-axis x">X<input data-role="key-px" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="key-py" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="key-pz" type="number" step="0.1"></label>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${s("Target XYZ")}</span>
          <label class="oc-axis x">X<input data-role="key-tx" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="key-ty" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="key-tz" type="number" step="0.1"></label>
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
function Xn() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="health" data-density-min="animation" hidden>
      <div class="oc-card oc-health">
        <div class="oc-card-title"><i class="pi pi-heart"></i> ${s("Camera Health")}
          <span class="oc-health-badge" data-role="health-badge">${s("Checking")}</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${s("Target model")}</span>
          <select data-role="health-profile" title="${s("Grade the shot against this model's recommended limits")}"></select>
        </div>
        <div data-role="health-body"></div>
      </div>
    </div>`;
}
function Yn() {
  return `
    <div class="viewport-inspector oc-side" data-role="viewport-inspector">
      <div class="inspector-tabs oc-side-tabs">
        <button class="inspector-tab active" data-tab="scene">${s("Outliner")}</button>
        <button class="inspector-tab" data-tab="camera">${s("Inspector")}</button>
        <button class="inspector-tab" data-tab="display">${s("Shot")}</button>
        <button class="inspector-tab" data-tab="health" data-density-min="animation">${s("Health")}</button>
      </div>
      ${Vn()}
      ${Un()}
      ${Gn()}
      ${Xn()}
    </div>`;
}
function Zn() {
  return `
    <div class="oc-preview camera-view-row" data-role="camera-view-row">
      <div class="oc-preview-head">
        <span data-role="preview-title">${s("Camera")}</span>
        <button class="camera-strip-close" data-act="toggle-camera-view" title="${s("Hide camera previews")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="camera-preview-strip" data-role="camera-previews"></div>
    </div>`;
}
function Jn() {
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
function Qn() {
  return `
    <div class="oc-dope">
      <div class="oc-dope-body">
        <div class="oc-dope-labels">${$o.map((t) => `
          <label class="oc-dope-label" style="--channel-color:${t.color}">
            <input type="checkbox" data-dope-channel="${t.id}" checked>
            <span>${s(t.label)}</span>
          </label>`).join("")}</div>
        <div class="oc-dope-tracks" data-role="dope-tracks">
          <div class="oc-ruler" data-role="ruler" title="${s("Drag to scrub the timeline")}"></div>
          <div class="keys" data-role="keys" tabindex="0" aria-label="${s("Camera keyframe timeline")}"></div>
          <div class="oc-dope-rows" data-role="dope-rows"></div>
          <span class="oc-playhead-line" data-role="dope-playhead"></span>
        </div>
      </div>
      <input class="oc-scrub oc-sr-only" data-role="scrub" type="range" min="0" max="119" value="0" aria-label="${s("Scrub the timeline")}">
    </div>`;
}
function es() {
  return `
    <details class="curve-editor oc-graph" data-density-min="animation" open>
      <summary>
        <span class="oc-graph-tabs" data-role="graph-tabs">
          <button class="oc-graph-tab active" data-graph-tab="curves" aria-pressed="true" title="${s("Edit animation curves")}"><strong>${s("Graph Editor")}</strong></button>
          <button class="oc-graph-tab" data-graph-tab="dope" aria-pressed="false" title="${s("Per-channel keyframe sheet")}">${s("Dope Sheet")}</button>
          <button class="oc-graph-tab" data-graph-tab="sequence" aria-pressed="false" title="${s("Cut the timeline into shots, one camera per range")}">${s("Sequence")}</button>
        </span>
        <span class="hint">${s("MMB/Alt-drag: Pan · Scroll: Zoom · Box Select: Drag · Drag Point: Retime/Value · Right-click: Menu")}</span>
      </summary>
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
              <button class="curve-mode" data-curve-mode="hold">${s("Hold / Step")}</button>
            </div>
            <div class="menu-divider"></div><div class="menu-title">${s("Tangents")}</div>
            <div class="menu-grid">
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
          <canvas class="curve-canvas" data-role="curve-canvas" title="${s("Drag a key point vertically or drag tangent handles on either side. Scroll to zoom. Right-click for curve actions.")}"></canvas>
          <div class="oc-gdope" data-role="graph-dope" hidden></div>
          <div class="oc-gsequence" data-role="graph-sequence" tabindex="0" hidden></div>
        </div>
      </div>
    </details>`;
}
function ts() {
  return `
    <div class="oc-lower">
      ${Zn()}
      <div class="timeline oc-timeline">
        ${Jn()}
        ${Qn()}
        <div class="motion-timeline" data-role="motion-timeline" aria-label="${s("Motion track timeline")}"></div>
      </div>
    </div>
    ${es()}`;
}
function as() {
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
      <button data-object-type="ground"><i class="pi pi-minus"></i> ${s("Ground Plane")}</button>
      <button data-object-type="cube"><i class="pi pi-stop"></i> ${s("Cube")}</button>
      <button data-object-type="sphere"><i class="pi pi-circle"></i> ${s("Sphere")}</button>
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
function os() {
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
function rs() {
  return `
    <details class="toolbar-menu" data-menu="view"><summary><i class="pi pi-compass"></i> ${s("View")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${s("Navigation & Selection")}</div>
      <label>${s("Navigation profile")} <select data-role="navigation-profile"><option value="maya">Maya</option><option value="blender">Blender</option></select></label>
      <div class="menu-section" data-density-min="advanced">
        <label>${s("Select mode")} <select data-role="select-mode">
          <option value="object" selected>${s("Object (4)")}</option>
          <option value="vertex">${s("Vertex (1)")}</option>
          <option value="edge">${s("Edge (2)")}</option>
          <option value="face">${s("Face (3)")}</option>
        </select></label>
        <label>${s("Transform space")} <select data-role="gizmo-space"><option value="world">${s("World")}</option><option value="local">${s("Local")}</option></select></label>
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
function ns() {
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
function ss() {
  return `
    <div class="top">
      ${as()}
      ${os()}
      ${rs()}
      ${ns()}
      <input data-role="file" type="file" accept="image/*,video/*" hidden>
      <input data-role="model-file" type="file" accept=".glb,.obj,.fbx,.stl,.ply" hidden>
      <input data-role="audio-file" type="file" accept="audio/*,.wav,.mp3,.ogg,.flac" hidden>
      <input data-role="viewport-bg-file" type="file" accept="image/*" hidden>
      <input data-role="viewport-bg-seq-file" type="file" accept="image/*" multiple hidden>
      <span class="oc-toolbar-spacer"></span>
      <button class="oc-playblast" data-act="record" title="${s("Record proxy playblast")}"><span class="oc-playblast-dot"></span>${s("Playblast")}</button>
      <button class="icon-button oc-strip-toggle" data-act="toggle-camera-view" title="${s("Toggle Camera Previews Strip")}"><i class="pi pi-video"></i></button>
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
function is() {
  return `
    <div class="vp-rail" role="toolbar" aria-label="${s("Viewport tools")}">
      <button class="vp-tool" data-act="clear-selection" title="${s("Select Object Tool (Q)")}"><i class="pi pi-arrow-up-left"></i></button>
      <button class="vp-tool" data-transform-mode="translate" title="${s("Translation gizmo (click)")}"><i class="pi pi-arrows-alt"></i></button>
      <button class="vp-tool" data-transform-mode="rotate" title="${s("Rotation gizmo (click)")}"><i class="pi pi-replay"></i></button>
      <button class="vp-tool" data-transform-mode="scale" title="${s("Scale gizmo (click)")}"><i class="pi pi-stop"></i></button>
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
function cs() {
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
function ls() {
  return `
    <div class="motion-tools" role="toolbar" aria-label="${s("Motion track tools")}">
      <button class="active" data-motion-tool="select" aria-pressed="true" title="${s("Select motion track")}"><i class="pi pi-arrow-up-left"></i></button>
      <button data-motion-tool="track" aria-pressed="false" title="${s("Draw motion track")}"><i class="pi pi-pencil"></i></button>
      <button data-motion-tool="anchor" aria-pressed="false" title="${s("Add static screen anchor")}"><i class="pi pi-map-marker"></i></button>
      <button data-motion-tool="project" aria-pressed="false" title="${s("Project selected object or world point")}"><i class="pi pi-bullseye"></i></button>
      <button data-motion-tool="erase" aria-pressed="false" title="${s("Erase motion track")}"><i class="pi pi-eraser"></i></button>
    </div>`;
}
function ds() {
  return `
    <div class="viewport-wrap">
      <canvas tabindex="0"></canvas>

      <div class="viewport-tally-banner" data-role="tally-banner" hidden>
        <span class="tally-dot"></span>
        <span class="tally-text" data-role="tally-text">REC KEY @ F0</span>
      </div>

      <div class="extractor-import-banner" data-role="extractor-import-banner" hidden>
        <i class="pi pi-video"></i>
        <span data-role="extractor-import-text"></span>
        <button type="button" class="ei-import" data-act="import-extractor-camera">${s("Import as Camera")}</button>
        <button type="button" class="ei-dismiss" data-act="dismiss-extractor-camera" title="${s("Dismiss")}" aria-label="${s("Dismiss")}"><i class="pi pi-times"></i></button>
      </div>

      ${cs()}
      ${ls()}

      <div class="vp-corner">
        <span class="vp-zoom" data-role="viewport-zoom" title="${s("Viewport zoom")}">1.00x</span>
        <button class="vp-tool" data-act="toggle-fullscreen" title="${s("Toggle Fullscreen Viewport")}"><i class="pi pi-window-maximize"></i></button>
      </div>

      ${is()}

      <svg class="vp-axis" data-role="viewport-axis" viewBox="0 0 52 52" width="52" height="52"
           aria-label="${s("World axis navigation")}" role="group">
        <circle data-axis-center cx="26" cy="26" r="4" tabindex="0" role="button" aria-label="${s("Frame selection")}"></circle>
      </svg>

      <span class="vp-state" data-role="viewport-state"></span>
      <div class="vp-hint">${s("Orbit: MMB · Pan: Shift+MMB · Dolly: Scroll · Fly: WASD / QE")}</div>
    </div>`;
}
function Ro() {
  const e = document.createElement("div");
  e.className = "majoor-omnicam", e.innerHTML = `
    <style>${Bn}</style>
    ${Wn()}
    ${ss()}
    <div class="oc-body">
      <div class="oc-stage">${ds()}</div>
      ${Yn()}
    </div>
    ${ts()}
    ${Hn()}`;
  const t = document.createElement("div");
  return t.className = "context-menu", t.dataset.role = "context-menu", t.setAttribute("role", "menu"), t.hidden = !0, e.appendChild(t), e;
}
function et(e) {
  return e?.state?.cameras?.length || (e.state.cameras = [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: R(e?.camera), keyframes: e?.state?.keyframes || [] }]), e.state.cameras.find((t) => t.id === e.state.active_camera_id) || e.state.cameras[0];
}
function Za(e) {
  if (!e?.state?.cameras?.length)
    return et(e);
  if (e.state.playblast_camera_id === _e) {
    const t = hr(e.state, e.frame), a = t && e.state.cameras.find((o) => o.id === t.camera_id);
    if (a) return a;
  }
  return e.state.cameras.find((t) => t.id === e.state.playblast_camera_id) || et(e);
}
function Bo(e) {
  const t = et(e);
  t && (t.camera = R(e.camera), t.keyframes = e.state.keyframes, e.state.camera = R(e.camera));
}
function ms(e) {
  if (e.disposed) return;
  e.renderRevision = (e.renderRevision || 0) + 1, Bo(e);
  const t = e.state.playblast_camera_id === _e && br(e.state), a = Za(e);
  e.recordingWidget && (t ? e.recordingWidget.value = e.state.sequence.recording_path || "" : (!e.state.cameras.some((n) => !!n.recording_path) && !a.recording_path && e.recordingWidget.value && (a.recording_path = String(e.recordingWidget.value)), e.recordingWidget.value = a.recording_path || "")), e.state.metadata = {
    ...e.state.metadata,
    playblast_camera_id: t ? _e : a.id,
    playblast_camera_name: t ? "Sequence" : a.name
  };
  const o = { ...e.state, camera: R(a.camera), keyframes: a.keyframes };
  e.stateWidget && (e.stateWidget.value = JSON.stringify(o)), e.widthWidget && (e.widthWidget.value = e.state.width), e.heightWidget && (e.heightWidget.value = e.state.height), e.fpsWidget && (e.fpsWidget.value = e.state.fps), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / e.state.fps), e.modeWidget && (e.modeWidget.value = e.state.render_mode), e.cardWidget && (e.cardWidget.value = e.state.card_asset || ""), e.node.graph?.setDirtyCanvas?.(!0, !0);
}
function ps(e) {
  for (const t of [e.widthWidget, e.heightWidget, e.fpsWidget, e.durationWidget, e.modeWidget]) {
    if (!t || t.__omnicamCallback) continue;
    const a = t.callback;
    t.callback = (...o) => {
      const r = a?.apply(t, o);
      return e.syncFromWidgets(), r;
    }, t.__omnicamCallback = !0;
  }
}
function fs(e, t = !0) {
  const a = e.state.duration_frames, o = e.state.fps;
  e.state.width = Number(e.widthWidget?.value || e.state.width), e.state.height = Number(e.heightWidget?.value || e.state.height), e.state.fps = Number(e.fpsWidget?.value || e.state.fps), e.state.duration_frames = Math.max(1, Math.round(Number(e.durationWidget?.value || 5) * e.state.fps));
  for (const f of e.state.cameras) {
    for (const u of f.keyframes) u.frame = Math.max(0, Math.round(u.frame));
    f.keyframes = [...new Map(f.keyframes.map((u) => [u.frame, u])).values()].sort((u, v) => u.frame - v.frame);
  }
  e.state.keyframes = et(e).keyframes;
  for (const f of e.state.objects)
    f.keyframes = [...new Map((f.keyframes || []).map((u) => {
      const v = Math.max(0, Math.round(u.frame));
      return [v, { ...u, frame: v }];
    })).values()].sort((u, v) => u.frame - v.frame);
  e.timelineKeyframes().some((f) => f.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.state.render_mode = e.modeWidget?.value || e.state.render_mode;
  const r = (f) => e.root.querySelector(f);
  for (const f of e.root.querySelectorAll('[data-role="mode"]')) f.value = e.state.render_mode;
  for (const f of e.root.querySelectorAll('[data-role="guides"]')) f.checked = e.state.guides !== !1;
  for (const f of e.root.querySelectorAll('[data-role="playblast-grid"]')) f.checked = !!e.state.playblast_grid;
  for (const f of e.root.querySelectorAll('[data-role="playblast-resolution"]')) f.value = e.state.playblast_resolution || "output";
  for (const f of e.root.querySelectorAll('[data-role="show-wireframe"]')) f.checked = !!e.state.show_wireframe;
  for (const f of e.root.querySelectorAll('[data-role="show-vertices"]')) f.checked = !!e.state.show_vertices;
  for (const f of e.root.querySelectorAll('[data-role="show-grid"]')) f.checked = e.state.show_grid !== !1;
  for (const f of e.root.querySelectorAll('[data-role="show-camera-paths"]')) f.checked = e.state.show_camera_paths !== !1;
  for (const f of e.root.querySelectorAll('[data-role="show-camera-gizmos"]')) f.checked = e.state.show_camera_gizmos !== !1;
  for (const f of e.root.querySelectorAll('[data-role="show-look-at"]')) f.checked = e.state.show_look_at !== !1;
  for (const f of e.root.querySelectorAll('[data-role="show-helper-axes"]')) f.checked = e.state.show_helper_axes !== !1;
  for (const f of e.root.querySelectorAll('[data-act="select-look-at"]')) {
    const u = e.selectedEntity === "camera_target";
    f.classList.toggle("active", u), f.setAttribute("aria-pressed", String(u));
  }
  for (const f of e.root.querySelectorAll('[data-role="select-mode"]')) f.value = e.state.select_mode || "object";
  for (const f of e.root.querySelectorAll('[data-role="burn-in"]')) f.checked = !!e.state.burn_in;
  for (const f of e.root.querySelectorAll('[data-role="speed-heatmap"]')) f.checked = !!e.state.speed_heatmap;
  for (const f of e.root.querySelectorAll('[data-role="point-density"]')) f.value = e.state.point_density || "balanced";
  for (const f of e.root.querySelectorAll('[data-role="point-color"]')) f.value = e.state.point_color || "#cbd5e1";
  for (const f of e.root.querySelectorAll('[data-role="point-spread"]')) f.value = e.state.point_spread || "all_views";
  for (const f of e.root.querySelectorAll('[data-role="card-fit"]')) f.value = e.state.card_fit || "contain";
  for (const f of e.root.querySelectorAll('[data-role="preview-layout"]')) f.value = e.state.preview_layout || "auto";
  for (const f of e.root.querySelectorAll('[data-role="safe-areas"]')) f.checked = !!e.state.safe_areas;
  for (const f of e.root.querySelectorAll('[data-role="resolution-gate"]')) f.checked = !!e.state.resolution_gate;
  for (const f of e.root.querySelectorAll('[data-role="aspect-ratio"]')) f.value = e.state.aspect_ratio || "auto";
  for (const f of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) f.value = e.state.viewport_bg_color || "#121212";
  for (const f of e.root.querySelectorAll('[data-role="gizmo-space"]')) f.value = e.state.gizmo_space || "world";
  for (const f of e.root.querySelectorAll('[data-role="navigation-profile"]')) f.value = e.state.navigation_profile || "maya";
  for (const f of e.root.querySelectorAll('[data-role="spatial-snap-mode"]')) f.value = e.state.spatial_snap_mode || "none";
  for (const f of e.root.querySelectorAll('[data-role="spatial-grid-size"]')) f.value = String(e.state.spatial_grid_size || 0.5);
  for (const f of e.root.querySelectorAll('[data-role="view-mode"]')) f.value = e.state.view_mode || "camera";
  for (const f of e.root.querySelectorAll('[data-role="ui-density"]')) f.value = e.state.ui_density || "advanced";
  e.root.dataset.density = e.state.ui_density || "advanced";
  for (const f of e.root.querySelectorAll('[data-role="camera-view-row"]')) f.hidden = !e.state.camera_view_visible;
  for (const f of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    f.classList.toggle("active", e.state.camera_view_visible);
  for (const f of e.root.querySelectorAll('[data-role="camera-type"]')) f.value = e.camera.camera_type || "perspective";
  for (const f of e.root.querySelectorAll('[data-role="speed"]')) f.value = String(e.cameraSpeed || 1);
  for (const f of e.root.querySelectorAll('[data-act="loop"]'))
    f.classList.toggle("active", !!e.state.loop_playback), f.setAttribute("aria-pressed", String(!!e.state.loop_playback));
  for (const f of e.root.querySelectorAll('[data-act="toggle-snap"]'))
    f.classList.toggle("active", e.state.snap_enabled !== !1), f.setAttribute("aria-pressed", String(e.state.snap_enabled !== !1));
  for (const f of e.root.querySelectorAll('[data-act="toggle-timecode"]'))
    f.classList.toggle("active", e.state.timecode_mode === "timecode"), f.setAttribute("aria-pressed", String(e.state.timecode_mode === "timecode"));
  for (const f of e.root.querySelectorAll('[data-role="show-radar"]')) f.checked = !!e.state.show_radar;
  for (const f of e.root.querySelectorAll('[data-role="encoder"]')) f.value = e.state.encoder || "auto";
  for (const f of e.root.querySelectorAll('[data-role="proxy-preset"]')) f.value = e.state.proxy_preset || "balanced";
  for (const f of e.root.querySelectorAll('[data-role="snap-frames"]')) f.value = String(e.state.snap_frames || 1);
  for (const f of e.root.querySelectorAll('[data-act="auto-key"]'))
    f.classList.toggle("active", !!e.state.auto_key), f.setAttribute("aria-pressed", String(!!e.state.auto_key));
  for (const f of e.root.querySelectorAll("[data-select-mode]")) {
    const u = f.dataset.selectMode === (e.state.select_mode || "object");
    f.classList.toggle("active", u), f.setAttribute("aria-pressed", String(u));
  }
  for (const f of e.root.querySelectorAll("[data-transform-mode]")) {
    const u = f.dataset.transformMode === (e.state.gizmo_mode || "translate");
    f.classList.toggle("active", u), f.setAttribute("aria-pressed", String(u));
  }
  const n = e.root.querySelector('[data-role="viewport-inspector"]'), i = n && n.dataset.collapsed !== "true";
  for (const f of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    f.classList.toggle("active", !!i), f.setAttribute("aria-pressed", String(!!i));
  e.refreshCameraSelectors();
  const c = r('[data-role="scrub"]');
  c && (c.max = String(e.state.duration_frames - 1));
  const d = r('[data-role="frame"]');
  d && (d.max = String(e.state.duration_frames - 1));
  const l = r('[data-role="key-frame"]');
  l && (l.max = String(e.state.duration_frames - 1));
  const p = r('[data-role="duration-seconds"]');
  p && (p.value = String(e.state.duration_frames / e.state.fps));
  const h = r('[data-role="timeline-fps"]');
  h && (h.value = String(e.state.fps)), e.frame = P(e.frame, 0, e.state.duration_frames - 1), t && e.serialize(), (a !== e.state.duration_frames || o !== e.state.fps) && (e.computeAudioPeaks?.(), e.setFrame(e.frame, !1, !0), e.setStatus(`Timeline: ${e.state.duration_frames} frames · ${(e.state.duration_frames / e.state.fps).toFixed(2)} s`));
}
function hs(e) {
  let t = null;
  try {
    t = JSON.parse(e.stateWidget?.value || "{}");
  } catch {
  }
  const a = new Set(e.state.objects.map((r) => r.id));
  e.state = Va(t);
  const o = new Set(e.state.objects.map((r) => r.id));
  for (const r of a) o.has(r) || e.removeObjectResources(r);
  e.timelineKeyframes().some((r) => r.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.camera = te(e.state, Math.min(e.frame, e.state.duration_frames - 1)), e.syncFromWidgets(!1), e.root.querySelector('[data-role="gizmo-space"]').value = e.state.gizmo_space, e.restoreAssets(), e.refreshKeys(), e.refreshObjects(), e.render(), e.history?.clear();
}
const bs = [
  ["viewport", ".viewport-wrap"],
  ["sequence", '[data-role="graph-sequence"]'],
  ["graph", ".oc-graph"],
  ["timeline", ".oc-timeline"]
];
function us(e) {
  const t = e instanceof HTMLElement ? e : null;
  for (const [a, o] of bs)
    if (t?.closest?.(o)) return a;
  return null;
}
const ys = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };
function gs(e) {
  if (!e) return null;
  const t = ys[e.aspect_ratio];
  if (t) return t;
  if (!e.resolution_gate) return null;
  const a = Number(e.width) || 0, o = Number(e.height) || 0;
  return a > 0 && o > 0 ? a / o : null;
}
function Wo(e, t, a, o) {
  const r = gs(t);
  if (!r || !(a > 0) || !(o > 0)) return;
  const n = a / o;
  if (Math.abs(n - r) < 1e-3) return;
  const i = !!t.resolution_gate;
  if (e.save(), e.fillStyle = "#000000b3", n > r) {
    const c = o * r, d = (a - c) / 2;
    e.fillRect(0, 0, d, o), e.fillRect(a - d, 0, d, o), i && (e.strokeStyle = "#ffffff88", e.strokeRect(d, 0, c, o));
  } else {
    const c = a / r, d = (o - c) / 2;
    e.fillRect(0, 0, a, d), e.fillRect(0, o - d, a, d), i && (e.strokeStyle = "#ffffff88", e.strokeRect(0, d, a, c));
  }
  e.restore();
}
function vs(e, t) {
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
function xs(e, t, a) {
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
const ws = ["position", "target"];
function ks(e, t, a, o) {
  const r = [e, t, a].map((n) => n.camera?.[o]).filter(Array.isArray);
  return r.length ? [0, 1, 2].map((n) => r.reduce((i, c) => i + Number(c[n] || 0), 0) / r.length) : null;
}
function Ss(e, t, a) {
  return e.map((o, r) => o + (t[r] - o) * a);
}
function Cs(e, t) {
  const a = (e || []).map((r) => ({ ...r, camera: { ...r.camera || {} } })), o = Math.min(1, Math.max(0, Number(t) || 0));
  if (o === 0 || a.length < 3) return a;
  for (let r = 1; r < a.length - 1; r++) {
    const n = e[r - 1], i = e[r], c = e[r + 1];
    for (const d of ws) {
      const l = i.camera?.[d], p = ks(n, i, c, d);
      !Array.isArray(l) || !p || (a[r].camera[d] = Ss(l.map(Number), p, o));
    }
  }
  return a;
}
function js(e) {
  return (e || []).map((t) => ({
    ...t,
    camera: { ...t.camera || {}, position: [...t.camera?.position || []], target: [...t.camera?.target || []] }
  }));
}
function _s(e, t) {
  const a = e.root.querySelector('[data-role="camera-focal"]'), o = e.root.querySelector('[data-role="camera-fov"]');
  !a || !o || (a.addEventListener("input", () => {
    const r = Nr(a.value);
    o.value = String(Math.round(r * 100) / 100), o.dispatchEvent(new Event("input", { bubbles: !0 }));
  }, { signal: t }), o.addEventListener("input", () => {
    document.activeElement !== a && (a.value = jo(o.value));
  }, { signal: t }));
}
function $s(e, t) {
  const a = e.root.querySelector('[data-role="path-smoothing"]'), o = e.root.querySelector('[data-role="path-smoothing-value"]');
  if (!a) return;
  const r = () => {
    o && (o.textContent = `${a.value}%`);
  }, n = (i) => (e.smoothingBaseline?.cameraId !== i.id && (e.smoothingBaseline = { cameraId: i.id, keys: js(i.keyframes) }), e.smoothingBaseline.keys);
  a.addEventListener("input", r, { signal: t }), a.addEventListener("change", () => {
    const i = e.activeCameraTrack();
    if (!i) return;
    e.checkpoint("Path smoothing");
    const c = Number(a.value) / 100, d = Cs(n(i), c);
    i.keyframes = d, e.state.keyframes = d, e.state.path_smoothing = c, e.syncActiveCameraTrack(), e.refreshKeys(), e.setFrame(e.frame, !1, !1), e.setStatus(c > 0 ? s("Path smoothing set to {percent}%").replace("{percent}", String(a.value)) : s("Path smoothing cleared"));
  }, { signal: t }), r();
}
function Es(e, t) {
  const a = e.root.querySelector('[data-role="outliner-search"]');
  a && a.addEventListener("input", () => {
    e.outlinerFilter = a.value.trim().toLowerCase(), e.refreshObjects();
  }, { signal: t });
}
function Ms(e, t) {
  const a = [...e.root.querySelectorAll("[data-dope-channel]")];
  if (a.length) {
    e.dopeChannels = new Set(a.filter((o) => o.checked).map((o) => o.dataset.dopeChannel));
    for (const o of a)
      o.addEventListener("change", () => {
        e.dopeChannels = new Set(a.filter((r) => r.checked).map((r) => r.dataset.dopeChannel)), Eo(e);
      }, { signal: t });
  }
}
function As(e, t) {
  e.root.querySelector('[data-act="import-extractor-camera"]')?.addEventListener("click", () => {
    Rr(e);
  }, { signal: t }), e.root.querySelector('[data-act="dismiss-extractor-camera"]')?.addEventListener("click", () => {
    Br(e);
  }, { signal: t });
}
function Ps(e, t) {
  e.root.querySelector('[data-act="toggle-fullscreen"]')?.addEventListener("click", () => {
    const a = e.root.classList.toggle("oc-fullscreen");
    e.node?.setDirtyCanvas?.(!0, !0), e.scheduleResizeAndRender?.(), e.setStatus(a ? s("Viewport maximized") : s("Viewport restored"));
  }, { signal: t }), e.root.querySelector('[data-act="toggle-graph"]')?.addEventListener("click", (a) => {
    const o = e.root.querySelector(".curve-editor");
    o && (o.open = !o.open, a.currentTarget.classList.toggle("active", o.open), o.open && e.drawCurveEditor());
  }, { signal: t });
}
const Ca = () => import("./chunk-zRwJ3pM9.js");
function Fs(e, t) {
  Ca().then(({ loadExchangeFormats: o }) => o(e)), e.root.querySelector('[data-act="import-camera"]')?.addEventListener("click", async () => {
    (await Ca()).pickCameraFile(e);
  }, { signal: t }), e.root.querySelector('[data-act="export-camera"]')?.addEventListener("click", async () => {
    (await Ca()).exportCamera(e);
  }, { signal: t }), e.root.querySelector('[data-role="camera-file"]')?.addEventListener("change", async (o) => {
    const r = o.target.files?.[0];
    o.target.value = "", await (await Ca()).importCameraFile(e, r);
  }, { signal: t });
}
function zs(e, t) {
  const a = e.root.querySelector('[data-role="health-profile"]');
  if (!a) return;
  const o = () => {
    Oa(e), e.refreshKeys();
  };
  ur().then((r) => {
    if (e.abortController?.signal.aborted) return;
    if (!Array.isArray(r?.profiles) || r.profiles.length === 0) {
      e.motionProfiles = null, Oa(e);
      return;
    }
    e.motionProfiles = r;
    const n = e.state.health_profile;
    a.innerHTML = r.profiles.map((i) => `<option value="${i.id}">${i.display_name}</option>`).join(""), a.value = r.profiles.some((i) => i.id === n) ? n : r.default, o();
  }), a.addEventListener("change", () => {
    e.state.health_profile = a.value, e.serialize(), o();
  }, { signal: t }), e.root.querySelector('[data-role="health-body"]')?.addEventListener("click", (r) => {
    const n = r.target.closest("[data-zone-start]");
    if (n) {
      e.setFrame(Number(n.dataset.zoneStart), !1, !1);
      return;
    }
    const i = r.target.closest("[data-act]")?.dataset.act;
    i === "health-slow" ? yr(e) : i === "health-smooth" ? gr(e) : i === "health-recenter" && vr(e);
  }, { signal: t });
  for (const r of e.root.querySelectorAll('[data-tab="health"]'))
    r.addEventListener("click", () => Oa(e), { signal: t });
}
function Ls(e, t) {
  Fs(e, t), _s(e, t), $s(e, t), Es(e, t), Ms(e, t), Ps(e, t), As(e, t), zs(e, t);
}
const po = {
  low: { shadows: !0, shadowSize: 1024, toneExposure: 0.9, renderScale: 1 },
  balanced: { shadows: !0, shadowSize: 2048, toneExposure: 0.95, renderScale: 1.25 },
  high: { shadows: !0, shadowSize: 4096, toneExposure: 1, renderScale: 1.5 }
}, Ho = "balanced", fo = "#121212";
function Ja(e) {
  return po[e] || po[Ho];
}
function Ts(e, t = "#2a2d38", a = "#16171d", o = "#0b0c10") {
  const r = document.createElement("canvas");
  r.width = 8, r.height = 256;
  const n = r.getContext("2d"), i = n.createLinearGradient(0, 0, 0, r.height);
  i.addColorStop(0, t), i.addColorStop(0.55, a), i.addColorStop(1, o), n.fillStyle = i, n.fillRect(0, 0, r.width, r.height);
  const c = new e.CanvasTexture(r);
  return c.mapping = e.EquirectangularReflectionMapping, c.colorSpace = e.SRGBColorSpace, c.needsUpdate = !0, c;
}
function Ks(e) {
  const t = document.createElement("canvas");
  t.width = t.height = 256;
  const a = t.getContext("2d"), o = a.createRadialGradient(128, 128, 10, 128, 128, 128);
  o.addColorStop(0, "rgba(255,255,255,0.85)"), o.addColorStop(0.28, "rgba(255,255,255,0.42)"), o.addColorStop(0.55, "rgba(255,255,255,0.08)"), o.addColorStop(1, "rgba(255,255,255,0)"), a.fillStyle = o, a.fillRect(0, 0, 256, 256);
  const r = new e.CanvasTexture(t);
  return r.colorSpace = e.SRGBColorSpace, r.needsUpdate = !0, r;
}
function gl(e, t, a = Ho) {
  const o = Ja(a), r = new e.Group();
  r.name = "omnicam-studio";
  const n = new e.DirectionalLight(16774374, 1.9);
  n.position.set(4.5, 7.5, 3.5), n.castShadow = !0, n.shadow.mapSize.set(o.shadowSize, o.shadowSize), n.shadow.bias = -9e-4, n.shadow.normalBias = 0.02;
  const i = n.shadow.camera;
  i.near = 0.5, i.far = 60, i.left = i.bottom = -12, i.right = i.top = 12, r.add(n, n.target);
  const c = new e.DirectionalLight(13161727, 0.5);
  c.position.set(-6, 3.5, 4), r.add(c);
  const d = new e.DirectionalLight(14477055, 1.1);
  d.position.set(-3, 5, -7), r.add(d);
  const l = Ks(e), p = new e.Mesh(
    new e.PlaneGeometry(56, 56),
    new e.MeshStandardMaterial({
      color: 3817545,
      roughness: 0.96,
      metalness: 0,
      alphaMap: l,
      transparent: !0,
      depthWrite: !1
    })
  );
  p.rotation.x = -Math.PI / 2, p.position.y = -3e-3, p.name = "omnicam-studio-floor", r.add(p);
  const h = new e.Mesh(
    new e.PlaneGeometry(56, 56),
    new e.ShadowMaterial({ opacity: 0.42, transparent: !0, depthWrite: !1 })
  );
  h.rotation.x = -Math.PI / 2, h.position.y = -1e-3, h.receiveShadow = !0, h.name = "omnicam-shadow-catcher", r.add(h);
  const f = Ts(e), u = new e.PMREMGenerator(t);
  u.compileEquirectangularShader();
  const v = new Yr(), S = u.fromScene(v, 0.04).texture;
  return v.traverse((g) => {
    g.geometry?.dispose?.();
    const y = Array.isArray(g.material) ? g.material : [g.material];
    for (const x of y) x?.dispose?.();
  }), {
    group: r,
    key: n,
    fill: c,
    rim: d,
    catcher: p,
    shadowCatcher: h,
    floorMap: l,
    sky: f,
    environment: S,
    pmrem: u,
    quality: a,
    dispose() {
      p.geometry.dispose(), p.material.dispose(), h.geometry.dispose(), h.material.dispose(), l.dispose(), f.dispose(), S.dispose(), u.dispose();
      for (const g of [n, c, d]) g.dispose?.();
    }
  };
}
function vl(e, t, a) {
  const o = Ja(a);
  return e.quality = a, e.key.shadow.mapSize.set(o.shadowSize, o.shadowSize), e.key.shadow.map?.dispose(), e.key.shadow.map = null, t.toneMappingExposure = o.toneExposure, o;
}
function xl(e, t, a, o, r) {
  o.group.visible = r, t.environment = r ? o.environment : null, t.background = r ? o.sky : new e.Color(1184274), a.toneMapping = r ? e.ACESFilmicToneMapping : e.NoToneMapping, a.toneMappingExposure = r ? Ja(o.quality).toneExposure : 1, t.traverse((n) => {
    n.material && (n.material.needsUpdate = !0);
  });
}
const Is = Object.freeze({
  x: ["right", "left"],
  y: ["top", "bottom"],
  z: ["front", "back"]
});
function Os(e, t) {
  const a = Is[e];
  return a ? t === a[0] ? a[1] : a[0] : null;
}
function qs(e, t, a) {
  const o = e.root.querySelector('[data-role="viewport-axis"]');
  if (o) {
    const r = (n) => {
      const i = n.target.closest?.("[data-axis], [data-axis-center]") || n.target, c = i.getAttribute("data-axis"), d = Os(c?.toLowerCase(), e.state.view_mode);
      d ? (n.preventDefault(), e.setViewMode(d)) : i.hasAttribute("data-axis-center") && (n.preventDefault(), e.frameTarget());
    };
    o.addEventListener("click", r, { signal: a }), o.addEventListener("keydown", (n) => {
      (n.key === "Enter" || n.key === " ") && r(n);
    }, { signal: a });
  }
  for (const r of e.root.querySelectorAll('[data-role="mode"]'))
    r.addEventListener("change", (n) => {
      e.state.render_mode = n.target.value, e.modeWidget && (e.modeWidget.value = n.target.value);
      for (const i of e.root.querySelectorAll('[data-role="mode"]')) i.value = n.target.value;
      e.serialize(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="frame"]'))
    r.addEventListener("change", (n) => e.setFrame(Number(n.target.value)), { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="scrub"]'))
    r.addEventListener("input", (n) => e.setFrame(Number(n.target.value)), { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="camera-fov"]')) {
    const n = (i) => {
      const c = P(Number(i.target.value), 5, 150);
      e.activeCameraTrack().keyframes.length && e.activeKeyframe() ? (e.activeKeyframe().camera.fov = c, e.scheduleSerialize(), e.render(), e.refreshKeyEditor()) : (e.camera.fov = c, e.render());
      for (const d of e.root.querySelectorAll('[data-role="camera-fov"]')) d.value = String(c);
    };
    r.addEventListener("input", n, { signal: a }), r.addEventListener("change", n, { signal: a });
  }
  for (const r of e.root.querySelectorAll('[data-role="camera-roll"]')) {
    const n = (i) => {
      const c = P(Number(i.target.value), -180, 180);
      e.activeCameraTrack().keyframes.length && e.activeKeyframe() ? (e.activeKeyframe().camera.roll = c, e.scheduleSerialize(), e.render(), e.refreshKeyEditor()) : (e.camera.roll = c, e.render());
      for (const d of e.root.querySelectorAll('[data-role="camera-roll"]')) d.value = String(c);
    };
    r.addEventListener("input", n, { signal: a }), r.addEventListener("change", n, { signal: a });
  }
  for (const r of e.root.querySelectorAll("[data-view]"))
    r.addEventListener("click", () => e.setViewMode(r.dataset.view), { signal: a });
  for (const r of e.root.querySelectorAll("[data-select-mode]"))
    r.addEventListener("click", () => e.setSelectMode(r.dataset.selectMode), { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="select-mode"]'))
    r.addEventListener("change", (n) => e.setSelectMode(n.target.value), { signal: a });
  for (const r of e.root.querySelectorAll("[data-transform-mode]"))
    r.addEventListener("click", () => e.setTransformMode(r.dataset.transformMode), { signal: a });
  t('[data-act="frame-target"]')?.addEventListener("click", () => e.frameTarget(), { signal: a });
  for (const r of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    r.addEventListener("click", () => e.toggleCameraView(), { signal: a });
  for (const r of e.root.querySelectorAll(".inspector-tab, [data-tab]"))
    r.addEventListener("click", () => {
      const n = r.dataset.tab;
      for (const i of e.root.querySelectorAll(".inspector-tab, [data-tab]")) i.classList.toggle("active", i === r);
      for (const i of e.root.querySelectorAll(".inspector-tab-content, [data-tab-panel]"))
        i.hidden = i.dataset.tabPanel !== n;
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    r.addEventListener("change", (n) => e.activateCamera(n.target.value), { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="camera-color"]'))
    r.addEventListener("input", (n) => {
      const i = e.activeCameraTrack();
      i && (i.color = n.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="playblast-camera"]'))
    r.addEventListener("change", (n) => e.setPlayblastCamera(n.target.value), { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="camera-type"]'))
    r.addEventListener("change", (n) => {
      e.camera.camera_type = n.target.value, de(e.root, "camera-type", n.target), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="speed"]')) {
    const n = (i) => {
      const c = P(Number(i.target.value), 0.05, 5);
      if (Number.isFinite(c)) {
        e.cameraSpeed = c;
        for (const d of e.root.querySelectorAll('[data-role="speed"]'))
          d !== i.target && (d.value = String(c));
      }
    };
    r.addEventListener("input", n, { signal: a }), r.addEventListener("change", n, { signal: a });
  }
  for (const r of e.root.querySelectorAll('[data-role="interp"]'))
    r.addEventListener("change", (n) => {
      e.activeKeyframe() && (e.activeKeyframe().interpolation = n.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="point-density"]'))
    r.addEventListener("change", (n) => {
      e.state.point_density = n.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point density: ${n.target.value}`);
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="point-color"]'))
    r.addEventListener("input", (n) => {
      e.state.point_color = n.target.value, e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="point-spread"]'))
    r.addEventListener("change", (n) => {
      e.state.point_spread = n.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point spread: ${n.target.value}`);
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="card-fit"]'))
    r.addEventListener("change", (n) => {
      e.state.card_fit = n.target.value, e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="speed-heatmap"]'))
    r.addEventListener("change", (n) => {
      e.state.speed_heatmap = n.target.checked, de(e.root, "speed-heatmap", n.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="playblast-grid"]'))
    r.addEventListener("change", (n) => {
      e.state.playblast_grid = n.target.checked, de(e.root, "playblast-grid", n.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="playblast-resolution"]'))
    r.addEventListener("change", (n) => {
      e.state.playblast_resolution = n.target.value, de(e.root, "playblast-resolution", n.target), e.scheduleSerialize();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-act="reset-bg-color"]'))
    r.addEventListener("click", () => {
      e.state.viewport_bg_color = fo;
      for (const n of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) n.value = fo;
      e.scheduleSerialize(), e.render(), e.setStatus(s("Background colour reset"));
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="show-grid"]'))
    r.addEventListener("change", (n) => {
      e.state.show_grid = n.target.checked, de(e.root, "show-grid", n.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const [r, n] of [
    ["show-camera-paths", "show_camera_paths"],
    ["show-camera-gizmos", "show_camera_gizmos"],
    ["show-look-at", "show_look_at"],
    ["show-helper-axes", "show_helper_axes"]
  ])
    for (const i of e.root.querySelectorAll(`[data-role="${r}"]`))
      i.addEventListener("change", (c) => {
        e.state[n] = c.target.checked, de(e.root, r, c.target, "checked"), e.scheduleSerialize(), e.render();
      }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-act="select-look-at"]'))
    r.addEventListener("click", () => {
      const n = e.selectedEntity !== "camera_target";
      e.selectedEntity = n ? "camera_target" : "camera", e.selectedObjectId = null, e.selectedObjectIds?.clear?.();
      for (const i of e.root.querySelectorAll('[data-act="select-look-at"]'))
        i.classList.toggle("active", n), i.setAttribute("aria-pressed", String(n));
      e.refreshInspector?.(), e.render(), e.setStatus?.(n ? s("Look-At target selected") : s("Camera selected"));
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="show-wireframe"]'))
    r.addEventListener("change", (n) => {
      e.state.show_wireframe = n.target.checked, de(e.root, "show-wireframe", n.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="show-vertices"]'))
    r.addEventListener("change", (n) => {
      e.state.show_vertices = n.target.checked, de(e.root, "show-vertices", n.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="burn-in"]'))
    r.addEventListener("change", (n) => {
      e.state.burn_in = n.target.checked, de(e.root, "burn-in", n.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="guides"]'))
    r.addEventListener("change", (n) => {
      e.state.guides = n.target.checked, de(e.root, "guides", n.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="safe-areas"]'))
    r.addEventListener("change", (n) => {
      e.state.safe_areas = n.target.checked, de(e.root, "safe-areas", n.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="resolution-gate"]'))
    r.addEventListener("change", (n) => {
      e.state.resolution_gate = n.target.checked, de(e.root, "resolution-gate", n.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="aspect-ratio"]'))
    r.addEventListener("change", (n) => {
      e.state.aspect_ratio = n.target.value, de(e.root, "aspect-ratio", n.target), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) {
    const n = (i) => {
      e.state.viewport_bg_color = i.target.value, de(e.root, "viewport-bg-color", i.target), e.scheduleSerialize(), e.render();
    };
    r.addEventListener("input", n, { signal: a }), r.addEventListener("change", n, { signal: a });
  }
  for (const r of e.root.querySelectorAll('[data-act="upload-viewport-bg"]'))
    r.addEventListener("click", () => {
      e.closeMenus(), t('[data-role="viewport-bg-file"]')?.click();
    }, { signal: a });
  t('[data-role="viewport-bg-file"]')?.addEventListener("change", (r) => {
    e.loadViewportBgFile(r.target.files?.[0]), r.target.value = "";
  }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-act="upload-viewport-bg-seq"]'))
    r.addEventListener("click", () => {
      e.closeMenus(), t('[data-role="viewport-bg-seq-file"]')?.click();
    }, { signal: a });
  t('[data-role="viewport-bg-seq-file"]')?.addEventListener("change", (r) => {
    e.loadViewportBgSequence(Array.from(r.target.files || [])), r.target.value = "";
  }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-act="clear-viewport-bg"]'))
    r.addEventListener("click", () => {
      e.clearViewportBgImage(), e.closeMenus();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="object-material"]'))
    r.addEventListener("change", (n) => {
      const i = e.selectedObject();
      i && (i.material_mode = n.target.value, e.serialize(), e.render());
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="object-color"]'))
    r.addEventListener("input", (n) => {
      const i = e.selectedObject();
      i && (i.color = n.target.value, e.scheduleSerialize(), e.render());
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="reference-select"]'))
    r.addEventListener("change", (n) => {
      e.state.reference_index = Number(n.target.value), e.serialize(), e.loadSelectedReference();
    }, { signal: a });
  for (const r of e.root.querySelectorAll("[data-proxy-preset]"))
    r.addEventListener("click", () => {
      e.applyProxyPreset(r.dataset.proxyPreset), e.closeMenus();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('select[data-role="proxy-preset"]'))
    r.addEventListener("change", (n) => {
      e.applyProxyPreset(n.target.value);
    }, { signal: a });
  for (const r of e.root.querySelectorAll("[data-lens]"))
    r.addEventListener("click", () => {
      Wr(e, Number(r.dataset.lens));
    }, { signal: a });
  for (const r of e.root.querySelectorAll("[data-blocking-scene]"))
    r.addEventListener("click", () => {
      vs(e, r.dataset.blockingScene), e.closeMenus();
    }, { signal: a });
  for (const r of e.root.querySelectorAll('[data-role="show-radar"]'))
    r.addEventListener("change", (n) => {
      e.state.show_radar = n.target.checked, e.scheduleSerialize(), e.render(), e.setStatus(`Radar Mini-Map: ${n.target.checked ? "ON" : "OFF"}`);
    }, { signal: a });
}
const Ds = (e) => {
  const t = new Set((e.motion_layers || []).map((o) => o.id));
  let a = t.size + 1;
  for (; t.has(`motion_${a}`); ) a += 1;
  return `motion_${a}`;
};
function Pa(e, { sourceKind: t = "manual_2d", label: a, keys: o, source: r = {} }) {
  if (!wr.includes(t)) throw new Error(`Unsupported motion source: ${t}`);
  const n = Ds(e), i = { id: n, label: a || `Motion ${n.split("_").at(-1)}`, enabled: !0, semantic: "screen_point", source_kind: t, keys: o.map((c) => ({ visible: !0, interpolation: "linear", ...c })), source: { ...r } };
  return e.motion_layers ||= [], e.motion_layers.push(i), e.selected_motion_layer_id = n, i;
}
function Da(e) {
  return (e.motion_layers || []).find((t) => t.id === e.selected_motion_layer_id) || null;
}
function Ns(e, t) {
  return e.motion_tool = xr.includes(t) ? t : "select", e.motion_tool;
}
function Rs(e, t) {
  if (kr.includes(t))
    for (const a of e.keys) a.interpolation = t;
}
function Bs(e, t, a) {
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
function Vo(e, t) {
  e.motion_layers = (e.motion_layers || []).filter((a) => a.id !== t), e.selected_motion_layer_id === t && (e.selected_motion_layer_id = e.motion_layers[0]?.id || null);
}
function Ws(e, t) {
  const a = t.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (e.clientX - a.left) / Math.max(1, a.width))),
    y: Math.max(0, Math.min(1, (e.clientY - a.top) / Math.max(1, a.height)))
  };
}
function Uo(e, t, a, o, r) {
  const n = te(e, a, e.objects);
  let i = t?.point;
  if (t?.object_id) {
    const p = e.objects.find((u) => u.id === t.object_id);
    if (!p) return null;
    const h = Ua(e.objects, p), f = Array.isArray(t.local_point) ? t.local_point : [0, 0, 0];
    i = [h.position[0] + f[0] * h.size[0], h.position[1] + f[1] * h.size[1], h.position[2] + f[2] * h.size[2]];
  }
  if (!Array.isArray(i)) return null;
  const c = Q(i, n, o, r);
  if (!c) return null;
  const d = c[0] / o, l = c[1] / r;
  return { x: d, y: l, visible: d >= 0 && d <= 1 && l >= 0 && l <= 1 };
}
function Hs(e, t = 6e-3) {
  if (e.length < 3) return e;
  const a = [e[0]];
  for (const o of e.slice(1, -1)) {
    const r = a.at(-1);
    Math.hypot(o.x - r.x, o.y - r.y) >= t && a.push(o);
  }
  return a.push(e.at(-1)), a;
}
function Go(e, t, a = 0.035) {
  let o = null, r = a;
  for (const n of e || []) for (const i of n.keys || []) {
    const c = Math.hypot(i.x - t.x, i.y - t.y);
    c <= r && (o = n, r = c);
  }
  return o;
}
function Vs(e, t, a, o) {
  const r = Hs(t);
  if (r.length < 2) return null;
  const n = Math.max(0, o - a);
  return Pa(e, {
    sourceKind: "manual_2d",
    label: `Track ${(e.motion_layers || []).length + 1}`,
    keys: r.map((i, c) => ({ ...i, time_seconds: a + n * c / (r.length - 1) }))
  });
}
function Na(e, t) {
  return Ws(t, e.interactionElement);
}
function Us(e, t) {
  const a = Go(e.motion_layers, t);
  return a ? (Vo(e, a.id), a) : null;
}
const Ra = (e) => {
  e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.();
}, ho = (e) => {
  const t = e.state.playback_range || [e.frame, e.state.duration_frames - 1];
  return [t[0] / e.state.fps, t[1] / e.state.fps];
}, Pe = (e, t) => {
  e.serialize(), e.render(), e.setStatus(t);
};
function bo(e) {
  for (const t of e.root.querySelectorAll("[data-motion-tool]")) {
    const a = t.dataset.motionTool === e.state.motion_tool;
    t.classList.toggle("active", a), t.setAttribute("aria-pressed", String(a));
  }
  e.interactionElement.dataset.motionTool = e.state.motion_tool;
}
function Gs(e, t) {
  const a = e.state.objects.find((i) => i.id === e.selectedObjectId), o = a ? "object_point" : "world_point", r = a ? { object_id: a.id, local_point: [0, 0, 0] } : { point: e.webgl?.intersectScenePoint?.(t.x * e.canvas.width, t.y * e.canvas.height, e.canvas.width, e.canvas.height) || [...e.camera.target] }, n = Uo(e.state, r, e.frame, e.canvas.width, e.canvas.height) || t;
  return Pa(e.state, { sourceKind: o, label: a ? `${a.name || a.id} Track` : "World Anchor", keys: [{ time_seconds: e.frame / e.state.fps, x: n.x, y: n.y, visible: n.visible !== !1 }], source: r });
}
function Xs(e, t) {
  for (const r of e.root.querySelectorAll("[data-motion-tool]"))
    r.addEventListener("click", () => {
      Ns(e.state, r.dataset.motionTool), bo(e), e.render();
    }, { signal: t });
  for (const r of e.root.querySelectorAll("[data-motion-preset]"))
    r.addEventListener("click", () => {
      e.checkpoint("Add camera field"), Pa(e.state, { sourceKind: "camera_field", label: `${r.dataset.motionPreset} Field`, keys: [{ time_seconds: 0, x: 0.5, y: 0.5 }], source: { preset: r.dataset.motionPreset, point: [...e.camera.target] } }), Pe(e, `Camera field: ${r.dataset.motionPreset}`);
    }, { signal: t });
  e.root.querySelector('[data-role="motion-interpolation"]')?.addEventListener("change", (r) => {
    const n = Da(e.state);
    n && (e.checkpoint("Set motion interpolation"), Rs(n, r.target.value), Pe(e, `Motion interpolation: ${r.target.value}`));
  }, { signal: t }), e.root.querySelector('[data-role="motion-key-visible"]')?.addEventListener("change", (r) => {
    const n = Da(e.state);
    if (!n?.keys?.length) return;
    const i = e.frame / e.state.fps, c = n.keys.reduce((d, l) => Math.abs(l.time_seconds - i) < Math.abs(d.time_seconds - i) ? l : d);
    e.checkpoint("Set motion visibility"), c.visible = r.target.checked, Pe(e, `Motion key ${c.visible ? "visible" : "hidden"}`);
  }, { signal: t });
  for (const r of e.root.querySelectorAll("[data-motion-layer-action]"))
    r.addEventListener("click", () => {
      const n = Da(e.state);
      if (!n) return;
      const i = r.dataset.motionLayerAction;
      if (e.checkpoint(i === "delete" ? "Delete motion layer" : i === "retime" ? "Retime motion layer" : "Toggle motion layer"), i === "delete") Vo(e.state, n.id);
      else if (i === "retime") {
        const [c, d] = ho(e);
        Bs(n, c, d);
      } else n.enabled = !n.enabled;
      Pe(e, i === "delete" ? "Motion layer deleted" : i === "retime" ? "Motion layer retimed" : `Motion layer ${n.enabled ? "enabled" : "disabled"}`);
    }, { signal: t });
  const a = e.interactionElement;
  a.addEventListener("pointerdown", (r) => {
    const n = e.state.motion_tool;
    if (n === "select" || r.button !== 0) return;
    Ra(r), a.setPointerCapture?.(r.pointerId);
    const i = Na(e, r);
    if (n === "track") {
      e.checkpoint("Draw motion track"), e.motionTrackDraft = { pointerId: r.pointerId, points: [i] };
      return;
    }
    e.checkpoint(n === "erase" ? "Erase motion track" : "Add motion anchor"), n === "anchor" ? Pa(e.state, { sourceKind: "static_anchor", label: `Anchor ${(e.state.motion_layers || []).length + 1}`, keys: [{ time_seconds: e.frame / e.state.fps, ...i, interpolation: "hold" }] }) : n === "project" ? Gs(e, i) : n === "erase" && Us(e.state, i), Pe(e, `Motion tool: ${n}`);
  }, { capture: !0, signal: t }), a.addEventListener("pointermove", (r) => {
    e.motionTrackDraft?.pointerId === r.pointerId && (Ra(r), e.motionTrackDraft.points.push(Na(e, r)), e.render());
  }, { capture: !0, signal: t });
  const o = (r) => {
    const n = e.motionTrackDraft;
    if (n?.pointerId !== r.pointerId) return;
    Ra(r), e.motionTrackDraft = null;
    const [i, c] = ho(e), d = Vs(e.state, n.points, i, c);
    Pe(e, d ? `Motion track: ${d.label}` : "Motion track needs a longer stroke");
  };
  a.addEventListener("pointerup", o, { capture: !0, signal: t }), a.addEventListener("pointercancel", o, { capture: !0, signal: t }), a.addEventListener("click", (r) => {
    if (e.state.motion_tool !== "select" || r.button !== 0) return;
    const n = Go(e.state.motion_layers, Na(e, r));
    n && (e.state.selected_motion_layer_id = n.id, e.render());
  }, { signal: t }), bo(e);
}
function de(e, t, a, o = "value") {
  for (const r of e.querySelectorAll(`[data-role="${t}"]`))
    r !== a && (r[o] = a[o]);
}
function Ys(e, t, a) {
  for (const l of ["object-x", "object-y", "object-z", "object-px", "object-py", "object-pz", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz"])
    for (const p of e.root.querySelectorAll(`[data-role="${l}"]`))
      p.addEventListener("input", () => e.updateSelectedObject(), { signal: a }), p.addEventListener("change", () => e.updateSelectedObject(), { signal: a });
  for (const l of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-near", "camera-far"])
    for (const p of e.root.querySelectorAll(`[data-role="${l}"]`))
      p.addEventListener("input", () => e.updateCameraFromHud(), { signal: a }), p.addEventListener("change", () => e.updateCameraFromHud(), { signal: a });
  t('[data-role="animation-select"]')?.addEventListener("change", (l) => e.selectObjectAnimation(Number(l.target.value)), { signal: a }), t('[data-role="object-parent"]')?.addEventListener("change", (l) => e.setObjectParent(l.target.value || null), { signal: a }), t('[data-role="duration-seconds"]')?.addEventListener("change", (l) => {
    e.durationWidget && (e.durationWidget.value = Number(l.target.value)), e.syncFromWidgets();
  }, { signal: a }), t('[data-role="timeline-fps"]')?.addEventListener("change", (l) => {
    e.fpsWidget && (e.fpsWidget.value = Number(l.target.value)), e.syncFromWidgets();
  }, { signal: a }), dn(e, a), On(e, a), t('[data-role="curve-group"]')?.addEventListener("change", () => {
    e.setChannelFilter("all"), Lo(e), e.drawCurveEditor(), Ga(e);
  }, { signal: a }), t('[data-act="curve-handles"]')?.addEventListener("click", () => e.toggleCurveHandles(), { signal: a });
  for (const l of e.root.querySelectorAll("[data-curve-mode]"))
    l.addEventListener("click", () => e.setCurveInterpolation(l.dataset.curveMode), { signal: a });
  for (const l of e.root.querySelectorAll("[data-tangent-mode]"))
    l.addEventListener("click", () => e.setTangentMode(l.dataset.tangentMode), { signal: a });
  for (const l of e.root.querySelectorAll("[data-channel-filter]"))
    l.addEventListener("click", () => e.setChannelFilter(l.dataset.channelFilter), { signal: a });
  const o = t('[data-role="curve-canvas"]');
  o && (o.addEventListener("pointerdown", (l) => e.onCurvePointerDown(l), { signal: a }), o.addEventListener("pointermove", (l) => e.onCurvePointerMove(l), { signal: a }), o.addEventListener("pointerup", (l) => e.onCurvePointerUp(l), { signal: a }), o.addEventListener("pointercancel", (l) => e.onCurvePointerUp(l), { signal: a }), o.addEventListener("wheel", (l) => Sn(e, l), { passive: !1, signal: a })), t('[data-act="curve-zoom-in"]')?.addEventListener("click", () => e.zoomCurve(1.25), { signal: a }), t('[data-act="curve-zoom-out"]')?.addEventListener("click", () => e.zoomCurve(0.8), { signal: a }), t('[data-act="curve-fit"]')?.addEventListener("click", () => e.resetCurveZoom(), { signal: a }), t('[data-role="key-frame"]')?.addEventListener("change", (l) => e.retimeSelectedKey(Number(l.target.value)), { signal: a });
  for (const l of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"])
    t(`[data-role="${l}"]`)?.addEventListener("change", () => e.updateSelectedKey(), { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="ui-density"]'))
    l.addEventListener("change", (p) => e.setDensity(p.target.value), { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="preview-layout"]'))
    l.addEventListener("change", (p) => {
      e.state.preview_layout = p.target.value, e.scheduleSerialize(), e.refreshCameraPreviews(), e.renderCameraView(), e.setStatus(`Preview layout: ${p.target.value}`);
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-act="aim-at-object"]'))
    l.addEventListener("click", () => {
      e.aimAtSelectedObject(), e.closeMenus();
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-act="bake-aim-keys"]'))
    l.addEventListener("click", () => {
      e.bakeAimConstraint({ perFrame: !1 }), e.closeMenus();
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-act="bake-aim-per-frame"]'))
    l.addEventListener("click", () => {
      e.bakeAimConstraint({ perFrame: !0 }), e.closeMenus();
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="camera-target-object"]'))
    l.addEventListener("change", (p) => {
      e.setCameraTrackingTarget(p.target.value);
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="camera-aim-bone"]'))
    l.addEventListener("change", (p) => {
      e.setAimBone(p.target.value);
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-act="focus-target"]'))
    l.addEventListener("click", () => {
      e.focusCameraTarget(), e.closeMenus();
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="gizmo-space"]'))
    l.addEventListener("change", (p) => {
      e.state.gizmo_space = p.target.value;
      for (const h of e.root.querySelectorAll('[data-role="gizmo-space"]')) h.value = p.target.value;
      e.scheduleSerialize(), e.render();
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="navigation-profile"]'))
    l.addEventListener("change", (p) => {
      e.state.navigation_profile = p.target.value === "blender" ? "blender" : "maya", e.scheduleSerialize(), e.setStatus(`Navigation: ${e.state.navigation_profile}`);
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="spatial-snap-mode"]'))
    l.addEventListener("change", (p) => {
      e.state.spatial_snap_mode = ["grid", "vertex"].includes(p.target.value) ? p.target.value : "none", e.scheduleSerialize(), e.setStatus(`Spatial Snap: ${e.state.spatial_snap_mode}`);
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="spatial-grid-size"]'))
    l.addEventListener("change", (p) => {
      e.state.spatial_grid_size = Math.max(0.01, Math.min(100, Number(p.target.value) || 0.5)), p.target.value = String(e.state.spatial_grid_size), e.scheduleSerialize();
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="view-mode"]'))
    l.addEventListener("change", (p) => e.setViewMode(p.target.value), { signal: a });
  for (const l of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    l.addEventListener("click", () => e.toggleInspector(), { signal: a });
  for (const l of e.root.querySelectorAll('[data-act="clear-selection"]'))
    l.addEventListener("click", () => {
      e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
    }, { signal: a });
  for (const l of e.root.querySelectorAll('[data-role="timeline-summary"]'))
    l.addEventListener("click", () => {
      e.selectedEntity === "object" && (e.selectedEntity = "camera", e.selectedObjectId = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Editing: ${e.activeCameraTrack().name}`)));
    }, { signal: a });
  for (const l of e.root.querySelectorAll(".toolbar-menu"))
    l.addEventListener("toggle", () => {
      l.open && e.closeMenus(l);
    }, { signal: a });
  const r = (l, p) => {
    const h = l instanceof HTMLElement ? l.closest(".scene-item") : null;
    if (!(!h || p.button === 2 || l.closest(".scene-action-btn")))
      if (h.dataset.objectId) {
        const f = e.state.objects.find((u) => u.id === h.dataset.objectId);
        if (!f) return;
        e.finishCameraEdit(), e.selectedObjectIds ||= /* @__PURE__ */ new Set(), p.shiftKey || p.ctrlKey || p.metaKey ? e.selectedObjectIds.has(f.id) ? e.selectedObjectIds.delete(f.id) : e.selectedObjectIds.add(f.id) : e.selectedObjectIds = /* @__PURE__ */ new Set([f.id]), e.selectedObjectId = e.selectedObjectIds.has(f.id) ? f.id : [...e.selectedObjectIds].at(-1) || null, e.selectedEntity = e.selectedObjectIds.size ? "object" : "camera", e.selectedKeyFrame = e.selectedObjectId ? f.keyframes?.find((u) => u.frame === e.frame)?.frame ?? null : null, e.editingKeyFrame = null;
        for (const u of e.root.querySelectorAll(".scene-item")) {
          const v = !!(u.dataset.objectId && e.selectedObjectIds.has(u.dataset.objectId));
          u.classList.toggle("selected", v), u.setAttribute("aria-selected", String(v));
        }
        e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Selected: ${f.name || f.type}`));
      } else h.dataset.cameraId && e.activateCamera(h.dataset.cameraId);
  };
  e.root.addEventListener("pointerdown", (l) => {
    r(l.composedPath?.()[0] || l.target, l);
  }, { capture: !0, signal: a }), e.root.addEventListener("pointerdown", (l) => {
    const p = l.composedPath?.()[0] || l.target;
    p instanceof HTMLElement && p.closest(".context-menu, [data-role='context-menu']") || (l.stopPropagation(), p instanceof HTMLElement && !p.closest(".toolbar-menu") && e.closeMenus(), p instanceof HTMLElement && !p.closest(".key,.key-editor,canvas") && e.exitKeyEdit(!0), (!(p instanceof HTMLElement) || !p.closest("input,select,textarea,button,[contenteditable=true]")) && e.root.focus({ preventScroll: !0 }));
  }, { signal: a }), document.addEventListener("pointerdown", (l) => {
    const p = l.composedPath?.()[0] || l.target;
    p instanceof HTMLElement && p.closest(".context-menu, [data-role='context-menu']") || (!(p instanceof Node) || !e.root.contains(p)) && (e.closeMenus(), e.exitKeyEdit(!0));
  }, { capture: !0, signal: a }), e.root.addEventListener("mousedown", (l) => l.stopPropagation(), { signal: a }), e.root.addEventListener("contextmenu", (l) => e.onContextMenu(l), { signal: a }), e.interactionElement?.addEventListener("pointerdown", (l) => e.onPointerDown(l), { signal: a }), e.interactionElement?.addEventListener("pointermove", (l) => e.onPointerMove(l), { signal: a }), e.interactionElement?.addEventListener("pointerup", (l) => e.onPointerUp(l), { signal: a }), e.interactionElement?.addEventListener("pointercancel", (l) => e.onPointerUp(l), { signal: a }), e.interactionElement?.addEventListener("dblclick", (l) => e.setTargetAtCursor(l), { signal: a }), e.interactionElement?.addEventListener("wheel", (l) => e.onWheel(l), { passive: !1, signal: a }), window.addEventListener("pointermove", (l) => {
    e.keyDrag && e.onPointerMove(l);
  }, { capture: !0, signal: a }), window.addEventListener("pointerup", (l) => {
    e.keyDrag && e.onPointerUp(l);
  }, { capture: !0, signal: a });
  const n = t('[data-role="dope-tracks"]');
  n && (n.addEventListener("pointerdown", (l) => e.onTimelinePointerDown(l), { signal: a }), n.addEventListener("pointermove", (l) => e.onTimelinePointerMove(l), { signal: a }), n.addEventListener("pointerup", (l) => e.onTimelinePointerUp(l), { signal: a }), n.addEventListener("pointercancel", (l) => e.onTimelinePointerUp(l), { signal: a }), n.addEventListener("wheel", (l) => wo(e, l), { passive: !1, signal: a }));
  const i = (l) => {
    const p = us(l.composedPath?.()[0] || l.target);
    p && (e.lastKeyZone = p);
  };
  e.root.addEventListener("focusin", i, { signal: a }), e.root.addEventListener("pointerdown", i, { capture: !0, signal: a });
  const c = new ResizeObserver(() => {
    e.scheduleResizeAndRender();
  }), d = e.root.querySelector(".viewport-wrap");
  d && c.observe(d), e.resizeObserver = c, e.updateEditState();
}
function Zs(e) {
  e.abortController = new AbortController();
  const t = e.abortController.signal, a = (o) => e.root.querySelector(o);
  Xs(e, t), xs(e, a, t), qs(e, a, t), Ys(e, a, t), Ls(e, t);
}
const Ke = [
  "#4aa3ef",
  // Camera 1 - Blue/Cyan
  "#f2a93b",
  // Camera 2 - Amber/Gold
  "#48c774",
  // Camera 3 - Emerald/Green
  "#b565d8",
  // Camera 4 - Purple
  "#ec4899",
  // Camera 5 - Pink
  "#06b6d4",
  // Camera 6 - Cyan
  "#f97316",
  // Camera 7 - Orange
  "#8b5cf6"
  // Camera 8 - Violet
];
function Xo(e) {
  const t = `camera_${Date.now().toString(36)}`;
  let a = t, o = 2;
  for (; e.cameras.some((r) => r.id === a); ) a = `${t}_${o++}`;
  return a;
}
function Js(e) {
  const t = at(e.state);
  for (const a of e.root.querySelectorAll('[data-role="playblast-camera"]')) {
    a.innerHTML = "";
    for (const r of e.state.cameras) {
      const n = document.createElement("option");
      n.value = r.id, n.textContent = r.name, a.appendChild(n);
    }
    const o = document.createElement("option");
    o.value = _e, o.textContent = t.length ? s("Sequence ({count} shots)").replace("{count}", String(t.length)) : s("Sequence (no shots yet)"), o.disabled = t.length === 0, a.appendChild(o), a.value = e.state.playblast_camera_id;
  }
  for (const a of e.root.querySelectorAll('[data-role="active-camera-select"]')) {
    a.innerHTML = "";
    for (const o of e.state.cameras) {
      const r = document.createElement("option");
      r.value = o.id, r.textContent = o.name, a.appendChild(r);
    }
    a.value = e.state.active_camera_id;
  }
  Qa(e);
}
function Qs(e) {
  const t = e.state.cameras, a = t.filter((r) => r.solo), o = a.length ? a : t.filter((r) => !r.muted);
  return o.length ? o : t;
}
function Qa(e) {
  const t = e.root.querySelector('[data-role="camera-previews"]');
  if (!t) return;
  const a = e.state.preview_layout || "auto";
  t.dataset.layout !== (a === "auto" ? "" : a) && (t.dataset.layout = a === "auto" ? "" : a);
  const o = `${Math.max(1, e.state.width || 16)} / ${Math.max(1, e.state.height || 9)}`, r = t.style.getPropertyValue("--shot-aspect") !== o;
  r && t.style.setProperty("--shot-aspect", o);
  const n = e.root.querySelector('[data-role="camera-view-row"]');
  n && n.classList.toggle("maximized", !!e.state.maximized_camera_id);
  const i = Qs(e), c = i.map((l) => `${l.id}:${l.name}:${l.muted ? 1 : 0}:${l.solo ? 1 : 0}:${l.color || ""}`).join("|");
  let d = !1;
  c !== e.cameraPreviewSignature && (d = !0, e.cameraPreviewSignature = c, t.innerHTML = "", e.cameraPreviewCanvases.clear(), e.cameraPreviewContexts.clear(), i.forEach((l, p) => {
    const h = document.createElement("div");
    h.className = "camera-preview-tile", h.dataset.cameraId = l.id;
    const f = l.color || Ke[p % Ke.length];
    h.style.setProperty("--camera-color", f), h.title = s(`Click: set ${l.name} as primary · Double-click: edit · Right-click: preview actions`);
    const u = document.createElement("div");
    u.className = "camera-preview-head";
    const v = document.createElement("i");
    v.className = "pi pi-video";
    const S = document.createElement("span");
    S.textContent = l.name;
    const g = document.createElement("span");
    g.dataset.cameraFrame = l.id, g.textContent = `F${e.frame}`;
    const y = document.createElement("i");
    y.className = "pi pi-circle-fill output-mark", y.title = s("Playblast camera");
    const x = document.createElement("canvas");
    x.dataset.cameraPreview = l.id;
    const w = document.createElement("span");
    w.className = "camera-view-badge", w.textContent = s("CAMERA PREVIEW"), u.append(v, S, g, y), h.append(x, u, w), t.appendChild(h), h.addEventListener("click", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = setTimeout(() => e.setPlayblastCamera(l.id), 220);
    }), h.addEventListener("dblclick", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = null, e.activateCamera(l.id);
    }), h.addEventListener("auxclick", (j) => {
      j.button === 1 && (j.preventDefault(), Yo(e, l.id));
    }), e.cameraPreviewCanvases.set(l.id, x), e.cameraPreviewContexts.set(l.id, x.getContext("2d", { alpha: !1 }));
  }));
  for (const l of t.querySelectorAll(".camera-preview-tile"))
    l.classList.toggle("playblast", l.dataset.cameraId === e.state.playblast_camera_id), l.classList.toggle("active", l.dataset.cameraId === e.state.active_camera_id), l.classList.toggle("maximized", l.dataset.cameraId === e.state.maximized_camera_id);
  for (const l of t.querySelectorAll(".output-mark")) l.hidden = l.closest(".camera-preview-tile")?.dataset.cameraId !== e.state.playblast_camera_id;
  (d || r) && requestAnimationFrame(() => {
    e.root.isConnected && (e.resizeCanvas(), e.renderCameraView());
  });
}
function ei(e) {
  e.checkpoint("Add camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const t = Xo(e.state), a = e.state.cameras.length, o = `Camera ${a + 1}`, r = R(e.camera), n = [
    (r.target?.[0] ?? 0) - (r.position?.[0] ?? 0),
    (r.target?.[1] ?? 0) - (r.position?.[1] ?? 0),
    (r.target?.[2] ?? -1) - (r.position?.[2] ?? 0)
  ], i = Math.hypot(...n) || 1;
  r.position = [0, 0, 0], r.target = n.map((l) => l / i);
  const c = Ke[a % Ke.length], d = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease";
  e.state.cameras.push({
    id: t,
    name: o,
    color: c,
    camera: r,
    keyframes: [{ frame: 0, camera: R(r), interpolation: d }]
  }), e.cameraPreviewSignature = "", e.activateCamera(t), e.setStatus(s(`${o} added`));
}
async function ti(e, t) {
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a) return;
  const o = (await Xa(s("Rename camera"), s("Camera name"), a.name))?.trim();
  !o || o === a.name || (e.checkpoint("Rename camera"), a.name = o.slice(0, 80), e.cameraPreviewSignature = "", e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(s(`Camera renamed: ${a.name}`)));
}
function ai(e, t) {
  const a = e.state.cameras.find((n) => n.id === t);
  if (!a) return;
  e.checkpoint("Duplicate camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const o = JSON.parse(JSON.stringify(a));
  o.id = Xo(e.state), o.name = `${a.name} Copy`;
  const r = e.state.cameras.length;
  if (o.color = Ke[r % Ke.length], o.camera?.position && (o.camera.position = [
    Math.round((o.camera.position[0] + 0.8) * 100) / 100,
    o.camera.position[1],
    Math.round((o.camera.position[2] + 0.8) * 100) / 100
  ]), o.keyframes)
    for (const n of o.keyframes)
      n.camera?.position && (n.camera.position = [
        Math.round((n.camera.position[0] + 0.8) * 100) / 100,
        n.camera.position[1],
        Math.round((n.camera.position[2] + 0.8) * 100) / 100
      ]);
  e.state.cameras.push(o), e.cameraPreviewSignature = "", e.activateCamera(o.id), e.setStatus(s(`${o.name} added`));
}
async function oi(e, t) {
  if (e.state.cameras.length <= 1) return e.setStatus(s("At least one camera is required"));
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a || !await Do(s("Delete camera"), s(`Delete ${a.name} and its ${a.keyframes.length} keyframe(s)?`))) return;
  e.checkpoint("Delete camera"), e.finishCameraEdit();
  const o = t === e.state.active_camera_id;
  if (e.state.cameras = e.state.cameras.filter((r) => r.id !== t), t === e.state.playblast_camera_id && (e.state.playblast_camera_id = e.state.cameras[0].id), e.cameraPreviewSignature = "", o) {
    const r = e.state.cameras[0];
    e.state.active_camera_id = r.id, e.state.keyframes = r.keyframes, e.state.camera = R(r.camera), e.camera = te(r, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = r.keyframes.find((n) => n.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null;
  }
  e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`${a.name} deleted`));
}
function ri(e, t) {
  const a = e.state.cameras.find((o) => o.id === t);
  a && (e.finishCameraEdit(), e.syncActiveCameraTrack(), e.state.active_camera_id = a.id, e.state.keyframes = a.keyframes, e.state.camera = R(a.camera), e.camera = te(a, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = a.keyframes.find((o) => o.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Camera: ${a.name}`)));
}
function ni(e, t) {
  const a = at(e.state), o = t === _e && a.length > 0, r = o ? null : e.state.cameras.find((n) => n.id === t);
  !o && !r || (e.state.playblast_camera_id = o ? _e : r.id, e.refreshCameraSelectors(), e.serialize(), e.refreshObjects(), e.renderCameraView(), e.setStatus(o ? s("Playblast: sequence ({count} shots)").replace("{count}", String(a.length)) : s(`Playblast: ${r.name}`)));
}
function si(e) {
  e.state.camera_view_visible = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-role="camera-view-row"]')) t.hidden = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    t.classList.toggle("active", e.state.camera_view_visible), t.setAttribute("aria-pressed", String(e.state.camera_view_visible));
  e.serialize(), e.state.camera_view_visible && requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(s(`Camera previews ${e.state.camera_view_visible ? "shown" : "hidden"}`));
}
function Yo(e, t) {
  e.state.maximized_camera_id = e.state.maximized_camera_id === t ? null : t, e.serialize(), Qa(e), requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(e.state.maximized_camera_id ? s("Preview maximized") : s("Preview restored"));
}
function ii(e, t, a, o) {
  if (e.state.guides !== !1) {
    t.save(), t.strokeStyle = "#ffffff55", t.lineWidth = Math.max(1, a / 640), t.beginPath();
    for (const r of [a / 3, 2 * a / 3])
      t.moveTo(r, 0), t.lineTo(r, o);
    for (const r of [o / 3, 2 * o / 3])
      t.moveTo(0, r), t.lineTo(a, r);
    t.stroke(), t.restore();
  }
  if (e.state.safe_areas) {
    t.save(), t.strokeStyle = "#f2d06b99", t.lineWidth = 1;
    for (const r of [0.05, 0.1])
      t.strokeRect(a * r, o * r, a * (1 - 2 * r), o * (1 - 2 * r));
    t.restore();
  }
  Wo(t, e.state, a, o);
}
function ci(e, t) {
  return Object.defineProperty(e, "omnicamMetrics", { value: Object.freeze({ ...t }), enumerable: !0 }), e;
}
function li(e, t) {
  const a = t?.omnicamMetrics || {}, o = Number(a.fps) || Number(e.state.fps), r = Number(a.requestedFrames) || Number(e.state.duration_frames), n = Number(a.width) || Number(e.canvas.width), i = Number(a.height) || Number(e.canvas.height), c = e.state.playblast_camera_id === _e ? at(e.state).map((d) => ({ camera_id: d.camera_id, start_frame: d.start, end_frame: d.end })) : [];
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
    motion_scene_fingerprint: Zr(e.state)
  };
}
function di(e, t) {
  const a = li(e, t);
  return e.state.metadata = { ...e.state.metadata || {}, playblast: a }, a;
}
const mi = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
async function pi({
  canvas: e,
  fps: t,
  frameCount: a,
  renderFrame: o,
  mediaRecorder: r = globalThis.MediaRecorder,
  signal: n,
  now: i = () => globalThis.performance?.now?.() ?? Date.now(),
  sleep: c = (l) => new Promise((p) => setTimeout(p, l)),
  onMetrics: d
}) {
  if (!r || !e.captureStream) throw new Error("MediaRecorder unsupported in this browser");
  const l = e.captureStream(t);
  let p;
  try {
    for (const x of mi)
      if (!(r.isTypeSupported && !r.isTypeSupported(x)))
        try {
          p = new r(l, { mimeType: x, videoBitsPerSecond: 6e6 });
          break;
        } catch {
        }
    if (!p) throw new Error("Cannot create MediaRecorder");
    const h = [];
    p.ondataavailable = (x) => {
      x.data.size && h.push(x.data);
    };
    const f = new Promise((x, w) => {
      p.addEventListener("stop", x, { once: !0 }), p.addEventListener("error", () => w(p.error || new Error("MediaRecorder failed")), { once: !0 });
    });
    p.start(100);
    const u = i();
    for (let x = 0; x < a; x++) {
      if (n?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await o(x), await c(1e3 / t);
    }
    p.stop(), await f;
    const v = Math.max(0, i() - u), S = a / t * 1e3, g = {
      encoder: "media_recorder",
      requestedFrames: a,
      expectedDurationMs: S,
      recordedDurationMs: v,
      driftMs: v - S,
      fps: t,
      width: e.width,
      height: e.height
    };
    d?.(g);
    const y = new Blob(h, { type: p.mimeType || "video/webm" });
    return ci(y, g);
  } finally {
    p?.state === "recording" && p.stop(), l.getTracks().forEach((h) => h.stop());
  }
}
async function fi(e, t) {
  const a = t.type.startsWith("video/mp4") ? "mp4" : "webm", o = new FormData();
  o.append("video", t, `omnicam_playblast.${a}`);
  const r = await e.fetchApi("/majoor/omnicam/upload_playblast", { method: "POST", body: o });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function hi(e) {
  await Promise.all([...e].filter((t) => t instanceof HTMLVideoElement && t.seeking).map((t) => new Promise((a) => {
    t.addEventListener("seeked", a, { once: !0 }), t.addEventListener("error", a, { once: !0 });
  })));
}
async function Zo(e) {
  await hi(e.cardMediaById.values());
}
async function Jo(e) {
  return pi({
    canvas: e.canvas,
    fps: e.state.fps,
    frameCount: e.state.duration_frames,
    renderFrame: (t) => e.setFrame(t, !0),
    signal: e.abortController?.signal
  });
}
async function Qo(e, t) {
  const a = await fi(Oe, t);
  if (di(e, t), e.state.playblast_camera_id === _e)
    e.state.sequence = { ...e.state.sequence || {}, recording_path: a.path };
  else {
    const o = e.state.cameras.find((r) => r.id === e.state.playblast_camera_id);
    o && (o.recording_path = a.path);
  }
  e.recordingWidget && (e.recordingWidget.value = a.path), e.serialize(), e.setStatus(s(`Playblast ready: ${a.name}`));
}
function bi(e) {
  const t = { width: e.canvas.width, height: e.canvas.height }, a = e.state.playblast_resolution || "output";
  if (a === "viewport") return t;
  const o = a === "half" ? 0.5 : a === "double" ? 2 : 1, r = Math.max(16, Math.round(Number(e.state.width) || t.width)), n = Math.max(16, Math.round(Number(e.state.height) || t.height)), c = Math.min(o, 3840 / Math.max(r * o, n * o)), d = (l) => Math.max(2, Math.round(l * c / 2) * 2);
  return { width: d(r), height: d(n) };
}
async function ui(e) {
  if (e.recording) return;
  e.stopPlay(), e.recording = !0, e.root.classList.add("recording"), e.setStatus(s("Encoding deterministic proxy…"));
  const t = e.frame, a = e.canvas.width, o = e.canvas.height, r = bi(e);
  (r.width !== e.canvas.width || r.height !== e.canvas.height) && (e.canvas.width = r.width, e.canvas.height = r.height, e.render());
  try {
    let n = null;
    const i = e.root.querySelector('[data-role="encoder"]').value, { encodeDeterministicPlayblast: c, supportsDeterministicEncoding: d } = await import("./chunk-DlY6yXhd.js");
    i !== "realtime" && await d(e.canvas.width, e.canvas.height) && (n = await c(e.canvas, e.state.duration_frames, e.state.fps, async (l) => {
      e.setFrame(l, !0), e.setStatus(s(`Encoding frame ${l + 1}/${e.state.duration_frames}…`)), await Zo(e), await new Promise((p) => requestAnimationFrame(p));
    }, e.abortController?.signal)), n || (e.setStatus(s("WebCodecs unavailable; recording realtime fallback…")), n = await Jo(e)), e.setFrame(t), await Qo(e, n);
  } catch (n) {
    console.error(n), e.setStatus(s(`Playblast failed: ${n.message || n}`));
  } finally {
    e.recording = !1, e.root.classList.remove("recording"), (e.canvas.width !== a || e.canvas.height !== o) && (e.canvas.width = a, e.canvas.height = o), e.resizeCanvas?.(), e.setFrame(t);
  }
}
function yi(e) {
  if (e.playing) return Ba(e);
  e.playing = !0;
  for (const h of e.root.querySelectorAll('[data-act="play"]')) {
    h.classList.add("playing");
    const f = h.querySelector("i");
    f && (f.className = "pi pi-pause");
  }
  const t = e.state.duration_frames / Math.max(1, e.state.fps), a = e.state.playback_range, o = a ? a[0] : 0, r = a ? a[1] : e.state.duration_frames - 1;
  let n = e.frame >= r || e.frame < o ? o : e.frame, i = null;
  if (e.audioBuffer && (window.AudioContext || window.webkitAudioContext))
    try {
      if (e.audioContext = e.audioContext || new (window.AudioContext || window.webkitAudioContext)(), e.audioContext.state === "suspended" && e.audioContext.resume(), e.audioSource)
        try {
          e.audioSource.stop();
        } catch {
        }
      const h = e.audioContext.createBufferSource();
      h.buffer = e.audioBuffer, h.connect(e.audioContext.destination);
      const f = Math.max(0, n / Math.max(1, e.state.fps)), u = Math.max(0, Math.min(t - f, (r - n) / Math.max(1, e.state.fps)));
      f < t && f < e.audioBuffer.duration && u > 0 && (h.start(0, f, u), e.audioSource = h);
    } catch {
    }
  const c = 1e3 / e.state.fps;
  let d = performance.now(), l = 0;
  const p = (h) => {
    if (e.playing) {
      for (l += h - d, d = h; l >= c; )
        if (l -= c, n += 1, n > r) {
          if (!e.state.loop_playback) return void Ba(e);
          if (n = o, e.audioBuffer && e.audioContext)
            try {
              if (e.audioSource)
                try {
                  e.audioSource.stop();
                } catch {
                }
              const f = e.audioContext.createBufferSource();
              f.buffer = e.audioBuffer, f.connect(e.audioContext.destination);
              const u = o / Math.max(1, e.state.fps), v = Math.max(0, Math.min(t - u, (r - o) / Math.max(1, e.state.fps)));
              u < t && u < e.audioBuffer.duration && v > 0 && (f.start(0, u, v), e.audioSource = f);
            } catch {
            }
        }
      n !== i && (i = n, e.setFrame(n, !0)), e.playTimer = requestAnimationFrame(p);
    }
  };
  e.playTimer = requestAnimationFrame(p);
}
function Ba(e) {
  e.playing = !1, e.playTimer && cancelAnimationFrame(e.playTimer), e.playTimer = null;
  for (const t of e.root.querySelectorAll('[data-act="play"]')) {
    t.classList.remove("playing");
    const a = t.querySelector("i");
    a && (a.className = "pi pi-play");
  }
  if (e.audioSource) {
    try {
      e.audioSource.stop();
    } catch {
    }
    e.audioSource = null;
  }
}
function er(e) {
  if (!e.audioBuffer) {
    e.audioWaveformPeaks = null;
    return;
  }
  const t = e.audioBuffer.getChannelData(0), a = e.audioBuffer.sampleRate, o = e.state.duration_frames / Math.max(1, e.state.fps), r = Math.min(t.length, Math.floor(o * a)), n = Math.min(600, Math.max(100, e.state.duration_frames * 4)), i = Math.max(1, Math.floor(r / n)), c = [];
  for (let d = 0; d < n; d++) {
    let l = 0;
    const p = d * i, h = Math.min(r, p + i);
    for (let f = p; f < h; f++) {
      const u = Math.abs(t[f] || 0);
      u > l && (l = u);
    }
    c.push(l);
  }
  e.audioWaveformPeaks = c, e.refreshKeys();
}
async function gi(e, t) {
  if (t)
    try {
      e.audioContext = e.audioContext || new (window.AudioContext || window.webkitAudioContext)(), e.audioContext.state === "suspended" && await e.audioContext.resume();
      const a = await t.arrayBuffer(), o = await e.audioContext.decodeAudioData(a);
      e.audioBuffer = o, er(e), e.setStatus(`Audio loaded: ${t.name || "track"}`);
    } catch (a) {
      e.setStatus(`Failed to load audio: ${a.message || a}`);
    }
}
function vi(e, t) {
  e.checkpoint(`Apply preset: ${t}`);
  const a = e.activeCameraTrack(), o = Qr(t, {
    duration_frames: e.state.duration_frames,
    target: e.camera.target || [0, 1.5, 0]
  });
  a.keyframes = o, a.id === e.state.active_camera_id && (e.state.keyframes = o), e.serialize(), e.refreshKeys(), e.setFrame(0, !0), e.render(), e.setStatus(`Preset applied: ${t}`);
}
function xi(e, t) {
  e.checkpoint(`Apply camera shake: ${t}`);
  const a = e.activeCameraTrack();
  (!a.keyframes || a.keyframes.length === 0) && (a.keyframes = [
    { frame: 0, camera: R(e.camera), interpolation: "smooth" },
    { frame: e.state.duration_frames - 1, camera: R(e.camera), interpolation: "smooth" }
  ]);
  const o = Jr(a, { type: t, intensity: 1, duration_frames: e.state.duration_frames });
  a.keyframes = o, a.id === e.state.active_camera_id && (e.state.keyframes = o), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(`Camera shake applied: ${t}`);
}
function wi(e, t) {
  const o = {
    clean_proxy: { render_mode: "omni_ref", playblast_grid: !0, burn_in: !1, speed_heatmap: !1, guides: !1, safe_areas: !1 },
    debug_motion: { render_mode: "wireframe", playblast_grid: !0, burn_in: !0, speed_heatmap: !0, guides: !0, safe_areas: !1 },
    cinematic_view: { render_mode: "graybox", playblast_grid: !1, burn_in: !1, speed_heatmap: !1, guides: !0, safe_areas: !0 }
  }[t];
  o && (e.checkpoint(`Apply proxy preset: ${t}`), Object.assign(e.state, o), e.serialize(), e.render(), e.setStatus(`Proxy preset applied: ${t}`));
}
let tt = null;
function ki({ api: e }) {
  tt = e;
}
async function tr(e) {
  if (!tt) throw new Error("ComfyUI API is unavailable");
  return Ya(tt, { route: "/majoor/omnicam/upload_asset", field: "asset", file: e });
}
async function Fa(e) {
  const t = e.map((a) => String(a.relative || "").replace(/^omnicam\//, "")).filter(Boolean);
  if (!(!t.length || !tt))
    try {
      await tt.fetchApi("/majoor/omnicam/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: t })
      });
    } catch {
    }
}
function eo(e) {
  return e.backgroundRequestId = (e.backgroundRequestId || 0) + 1, e.backgroundRequestId;
}
async function Si(e, t) {
  if (!t) return;
  const a = eo(e);
  let o = null;
  try {
    if (e.setStatus(`Uploading background: ${t.name}`), o = await tr(t), a !== e.backgroundRequestId || e.disposed) {
      await Fa([o]);
      return;
    }
    const r = je(o.path);
    e.state.viewport_bg_image = o.path, e.state.viewport_bg_sequence = [];
    const n = new Image();
    n.src = r, await n.decode().catch(() => {
    }), e.viewportBgImage = n, e.serialize(), e.render(), e.setStatus(`Background image set: ${t.name}`);
  } catch (r) {
    if (o && await Fa([o]), a !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG image: ${r.message || r}`);
  }
}
async function Ci(e, t) {
  if (!t || !t.length) return;
  const a = eo(e);
  t.sort((r, n) => r.name.localeCompare(n.name, void 0, { numeric: !0, sensitivity: "base" }));
  const o = [];
  try {
    e.setStatus(`Uploading background sequence: ${t.length} frames`);
    for (const n of t)
      if (o.push(await tr(n)), a !== e.backgroundRequestId || e.disposed) {
        await Fa(o);
        return;
      }
    const r = o.map((n) => n.path);
    e.state.viewport_bg_sequence = r, e.state.viewport_bg_image = "", e.viewportBgImage = null, e.viewportBgSequenceImages = r.map((n) => {
      const i = new Image();
      return i.src = je(n), i.decode().catch(() => {
      }), i;
    }), e.serialize(), e.render(), e.setStatus(`Background sequence loaded: ${t.length} frames`);
  } catch (r) {
    if (await Fa(o), a !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG sequence: ${r.message || r}`);
  }
}
function ji(e) {
  eo(e), e.state.viewport_bg_image = "", e.state.viewport_bg_sequence = [], e.viewportBgImage = null, e.viewportBgSequenceImages = [], e.serialize(), e.render(), e.setStatus("Background cleared");
}
function ee(e, t, a, o = "#5a5a5a", r = 1) {
  const n = e.viewportCamera(), i = Q(t, n, e.canvas.width, e.canvas.height), c = Q(a, n, e.canvas.width, e.canvas.height);
  !i || !c || (e.ctx.strokeStyle = o, e.ctx.lineWidth = r, e.ctx.beginPath(), e.ctx.moveTo(i[0], i[1]), e.ctx.lineTo(c[0], c[1]), e.ctx.stroke());
}
function _i(e) {
  for (let t = -60; t <= 60; t += 1) {
    const a = t === 0, o = a ? "#6f6f6f" : "#353535";
    ee(e, [t, 0, -60], [t, 0, 60], o, a ? 1.6 : 1), ee(e, [-60, 0, t], [60, 0, t], o, a ? 1.6 : 1);
  }
}
function $i(e) {
  const { points: t, colors: a } = Sr(e.state.point_density || "balanced", e.state.point_spread || "all_views", e.state.point_color || null);
  if (!t.length) return;
  const o = e.viewportCamera();
  for (let r = 0; r < t.length; r += 3) {
    const n = Q([t[r], t[r + 1], t[r + 2]], o, e.canvas.width, e.canvas.height);
    if (!n) continue;
    const i = P(5 / Math.sqrt(n[2]), 1, 4), c = Math.round(a[r] * 255), d = Math.round(a[r + 1] * 255), l = Math.round(a[r + 2] * 255);
    e.ctx.fillStyle = `rgb(${c},${d},${l})`, e.ctx.beginPath(), e.ctx.arc(n[0], n[1], i, 0, Math.PI * 2), e.ctx.fill();
  }
}
function Ei(e, t) {
  const [a, o, r] = t.size || [1, 1, 1], [n, i, c] = t.position || [0, 0, 0], d = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1]
  ].map((p) => [n + p[0] * a / 2, i + p[1] * o / 2, c + p[2] * r / 2]), l = [
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
  for (const [p, h] of l) ee(e, d[p], d[h], "#a0a0a0", 1.4);
}
function Mi(e, t) {
  const [a] = t.size || [1.5], [o, r, n] = t.position || [0, 1, 0], i = a / 2;
  for (let c = 0; c < 3; c++) {
    let d = null;
    for (let l = 0; l <= 32; l++) {
      const p = l / 32 * Math.PI * 2;
      let h;
      c === 0 ? h = [o + Math.cos(p) * i, r + Math.sin(p) * i, n] : c === 1 ? h = [o + Math.cos(p) * i, r, n + Math.sin(p) * i] : h = [o, r + Math.cos(p) * i, n + Math.sin(p) * i], d && ee(e, d, h, "#999", 1), d = h;
    }
  }
}
function Ai(e, t) {
  const [a, o, r] = t.position || [0, 0, 0], n = t.size?.[1] || 1.8, i = [a, o + n * 0.88, r], c = [a, o + n * 0.72, r], d = [a, o + n * 0.42, r], l = [a - n * 0.13, o, r], p = [a + n * 0.13, o, r], h = [a - n * 0.28, o + n * 0.48, r], f = [a + n * 0.28, o + n * 0.48, r];
  ee(e, c, d, "#aaa", 2), ee(e, c, h, "#aaa", 2), ee(e, c, f, "#aaa", 2), ee(e, d, l, "#aaa", 2), ee(e, d, p, "#aaa", 2);
  const u = Q(i, e.viewportCamera(), e.canvas.width, e.canvas.height);
  u && (e.ctx.strokeStyle = "#aaa", e.ctx.beginPath(), e.ctx.arc(u[0], u[1], P(28 / u[2], 3, 12), 0, Math.PI * 2), e.ctx.stroke());
}
function Pi(e, t) {
  const a = t.position || [0, 1, 0], o = 0.25;
  ee(e, he(a, [-o, 0, 0]), he(a, [o, 0, 0]), "#bbb", 2), ee(e, he(a, [0, -o, 0]), he(a, [0, o, 0]), "#bbb", 2), ee(e, he(a, [0, 0, -o]), he(a, [0, 0, o]), "#bbb", 2);
}
function Fi(e, t) {
  const [a, o, r] = t.position || [0, 1.5, 0], [n, i] = t.size || [2, 3], c = e.viewportCamera(), d = [
    [a - n / 2, o - i / 2, r],
    [a + n / 2, o - i / 2, r],
    [a + n / 2, o + i / 2, r],
    [a - n / 2, o + i / 2, r]
  ].map((g) => Q(g, c, e.canvas.width, e.canvas.height));
  if (d.some((g) => !g)) return;
  const l = d.map((g) => g[0]), p = d.map((g) => g[1]), h = Math.min(...l), f = Math.max(...l), u = Math.min(...p), v = Math.max(...p);
  e.ctx.save(), e.ctx.beginPath(), e.ctx.moveTo(d[0][0], d[0][1]);
  for (let g = 1; g < 4; g++) e.ctx.lineTo(d[g][0], d[g][1]);
  e.ctx.closePath(), e.ctx.clip();
  const S = e.cardMediaById.get(t.id) || (t.id === "subject" ? e.cardMedia : null);
  if (S)
    try {
      const g = Math.max(1, f - h), y = Math.max(1, v - u), x = S.videoWidth || S.naturalWidth || S.width, w = S.videoHeight || S.naturalHeight || S.height, j = e.state.card_fit || "contain";
      if (e.ctx.fillStyle = "#111", e.ctx.fillRect(h, u, g, y), j === "stretch" || !x || !w)
        e.ctx.drawImage(S, h, u, g, y);
      else if (j === "contain") {
        const _ = Math.min(g / x, y / w), D = x * _, A = w * _;
        e.ctx.drawImage(S, h + (g - D) / 2, u + (y - A) / 2, D, A);
      } else {
        const _ = Math.max(g / x, y / w), D = g / _, A = y / _;
        e.ctx.drawImage(S, (x - D) / 2, (w - A) / 2, D, A, h, u, g, y);
      }
    } catch {
    }
  else
    e.ctx.fillStyle = "#3a414b", e.ctx.fillRect(h, u, f - h, v - u), e.ctx.fillStyle = "#d8d8d8", e.ctx.textAlign = "center", e.ctx.font = `${Math.max(12, Math.min(28, (f - h) * 0.08))}px system-ui`, e.ctx.fillText("SUBJECT CARD", (h + f) / 2, (u + v) / 2);
  e.ctx.restore(), e.ctx.strokeStyle = "#b3b8c1", e.ctx.lineWidth = 2, e.ctx.beginPath(), e.ctx.moveTo(d[0][0], d[0][1]);
  for (let g = 1; g < 4; g++) e.ctx.lineTo(d[g][0], d[g][1]);
  e.ctx.closePath(), e.ctx.stroke();
}
function zi(e) {
  const t = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
  (e.state.cameras || []).forEach((a, o) => {
    const r = a.keyframes || [], n = a.color || t[o % t.length], i = a.id === e.state.active_camera_id;
    if (!(i && e.state.view_mode === "camera")) {
      if (r.length >= 2)
        for (let c = 0; c < r.length - 1; c++)
          ee(e, r[c].camera.position, r[c + 1].camera.position, n, i ? 2.2 : 1.2);
      for (const c of r) {
        const d = Q(c.camera.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        d && (e.ctx.fillStyle = c.frame === e.frame ? "#f2d06b" : n, e.ctx.beginPath(), e.ctx.arc(d[0], d[1], i ? 4.5 : 3.5, 0, Math.PI * 2), e.ctx.fill());
      }
      if (e.state.view_mode !== "camera") {
        const c = te(a, e.frame, e.state.objects), d = Q(c.position, e.viewportCamera(), e.canvas.width, e.canvas.height);
        d && (e.ctx.fillStyle = i ? "#f2d06b" : n, e.ctx.beginPath(), e.ctx.arc(d[0], d[1], i ? 6.5 : 4.5, 0, Math.PI * 2), e.ctx.fill()), c.target && ee(e, c.position, c.target, `${n}88`, 1);
      }
    }
  });
}
function Li(e) {
  if (e.state.keyframes.length < 2) return;
  const t = [];
  for (let o = 0; o < e.state.keyframes.length - 1; o++) {
    const r = e.state.keyframes[o], n = e.state.keyframes[o + 1];
    t.push($a(Ea(n.camera.position, r.camera.position)) * e.state.fps / Math.max(1, n.frame - r.frame));
  }
  const a = Math.max(...t, 1e-6);
  for (let o = 0; o < t.length; o++) {
    const r = 120 * (1 - t[o] / a);
    ee(e, e.state.keyframes[o].camera.position, e.state.keyframes[o + 1].camera.position, `hsl(${r} 85% 55%)`, 5);
  }
}
function Ti(e) {
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  if (!e.recording && e.state.view_mode === "camera" && e.state.guides !== !1) {
    t.save(), t.strokeStyle = "#ffffff33", t.lineWidth = 1, t.beginPath();
    for (const r of [a / 3, 2 * a / 3])
      t.moveTo(r, 0), t.lineTo(r, o);
    for (const r of [o / 3, 2 * o / 3])
      t.moveTo(0, r), t.lineTo(a, r);
    t.moveTo(a / 2 - 14, o / 2), t.lineTo(a / 2 + 14, o / 2), t.moveTo(a / 2, o / 2 - 14), t.lineTo(a / 2, o / 2 + 14), t.stroke(), t.restore();
  }
  if (!e.recording && e.state.view_mode === "camera" && e.state.safe_areas && (t.save(), t.strokeStyle = "#00d2d388", t.lineWidth = 1, t.setLineDash([4, 4]), t.strokeRect(a * 0.05, o * 0.05, a * 0.9, o * 0.9), t.strokeStyle = "#feca5788", t.strokeRect(a * 0.1, o * 0.1, a * 0.8, o * 0.8), t.restore()), !e.recording && e.state.view_mode === "camera" && Wo(t, e.state, a, o), !e.recording && e.state.show_gizmo)
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
      Oi(e, t, a, o);
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
}
function Ki(e) {
  return e <= -1 ? "#38bdf8" : e <= 0.2 ? "#2dd4bf" : e <= 2.2 ? "#4ade80" : e <= 5 ? "#facc15" : e <= 10 ? "#fb923c" : "#f43f5e";
}
function Ii(e) {
  return `${e > 0 ? "+" : ""}${e.toFixed(1)}m`;
}
function Oi(e, t, a, o) {
  if (!a || !o || a < 80 || o < 80) return;
  const r = Math.min(138, Math.max(80, Math.min(a, o) - 20)), n = 10, i = Math.max(0, a - r - n), c = Math.max(0, o - r - n), d = e.viewportCamera(), l = d?.position || [0, 1.5, 5], p = d?.target || [0, 0, 0], h = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"], f = e.activeCameraTrack?.(), u = e.state.cameras?.length ? e.state.cameras : f ? [f] : [], v = e.state.active_camera_id || f?.id, S = u.flatMap(
    (q) => (q.keyframes || []).map((W) => W.camera?.position).filter(Boolean)
  ), g = Math.max(
    Math.abs(l[0] || 0),
    Math.abs(l[2] || 0),
    Math.abs(p[0] || 0),
    Math.abs(p[2] || 0),
    ...S.flatMap((q) => [Math.abs(q[0] || 0), Math.abs(q[2] || 0)]),
    4
  ), y = Math.max(6, Math.ceil((g + 1.5) / 4) * 4), x = i + r / 2, w = c + r / 2, j = r / 2 - 10, _ = j / y, D = (q, W) => [x + q * _, w + W * _];
  t.save(), t.beginPath(), typeof t.roundRect == "function" ? t.roundRect(i, c, r, r, 8) : t.rect(i, c, r, r), t.clip(), t.fillStyle = "rgba(10, 14, 22, 0.88)", t.fillRect(i, c, r, r), t.strokeStyle = "rgba(0, 210, 211, 0.35)", t.lineWidth = 1.2, t.strokeRect(i, c, r, r), t.strokeStyle = "rgba(0, 210, 211, 0.12)", t.lineWidth = 1, t.beginPath(), t.arc(x, w, j * 0.5, 0, Math.PI * 2), t.arc(x, w, j, 0, Math.PI * 2), t.stroke(), t.strokeStyle = "rgba(255, 255, 255, 0.12)", t.beginPath(), t.moveTo(i + 6, w), t.lineTo(i + r - 6, w), t.moveTo(x, c + 6), t.lineTo(x, c + r - 6), t.stroke();
  const A = l[1] || 0, B = Ki(A), z = Ii(A);
  t.font = "bold 9px monospace", t.fillStyle = "#00d2d3", t.fillText("RADAR", i + 7, c + 13), t.fillStyle = B, t.textAlign = "right", t.fillText(`Y:${z}`, i + r - 7, c + 13), t.textAlign = "left", t.font = "8px monospace", t.fillStyle = "rgba(255, 255, 255, 0.35)", t.fillText(`±${y}m`, i + 7, c + r - 6);
  for (const q of e.state.objects || []) {
    if (q.enabled === !1) continue;
    const W = Ua(e.state.objects, q).position || [0, 0, 0], [X, V] = D(W[0], W[2]);
    X < i + 2 || X > i + r - 2 || V < c + 2 || V > c + r - 2 || (t.fillStyle = q.type === "card" ? "#48dbfb" : q.type === "human" ? "#ff9ff3" : "#feca57", t.beginPath(), t.arc(X, V, 2.5, 0, Math.PI * 2), t.fill());
  }
  for (let q = 0; q < u.length; q++) {
    const W = u[q], X = W.keyframes || [], V = W.id === v, be = W.color || h[q % h.length];
    t.save(), t.strokeStyle = be, t.globalAlpha = V ? 0.95 : 0.38, t.lineWidth = V ? 2 : 1, t.setLineDash(V ? [] : [2, 2]), t.beginPath();
    let ue = !1;
    const we = X[0]?.frame, fe = X[X.length - 1]?.frame;
    for (let J = we; Number.isFinite(J) && J <= fe; J++) {
      const oe = te(W, J, e.state.objects)?.position;
      if (!Array.isArray(oe)) continue;
      const [ce, re] = D(oe[0], oe[2]);
      ue ? t.lineTo(ce, re) : (t.moveTo(ce, re), ue = !0);
    }
    ue && t.stroke(), t.restore(), t.save();
    for (const J of X) {
      const oe = J.camera?.position;
      if (!oe) continue;
      const [ce, re] = D(oe[0], oe[2]);
      ce < i + 4 || ce > i + r - 4 || re < c + 4 || re > c + r - 4 || (t.fillStyle = J.frame === e.frame && V ? B : be, t.globalAlpha = V ? 0.9 : 0.5, t.beginPath(), t.arc(ce, re, V ? 1.8 : 1.4, 0, Math.PI * 2), t.fill());
    }
    t.restore();
  }
  const I = x + l[0] * _, ye = w + l[2] * _, ae = 8, ne = P(I, i + ae, i + r - ae), se = P(ye, c + ae, c + r - ae), me = x + p[0] * _, pe = w + p[2] * _, Z = P(me, i + ae, i + r - ae), E = P(pe, c + ae, c + r - ae);
  t.strokeStyle = "rgba(255, 255, 255, 0.35)", t.lineWidth = 1, t.setLineDash([2, 2]), t.beginPath(), t.moveTo(ne, se), t.lineTo(Z, E), t.stroke(), t.setLineDash([]), t.fillStyle = "#ffffff", t.beginPath(), t.arc(Z, E, 2.5, 0, Math.PI * 2), t.fill(), t.strokeStyle = "rgba(255, 255, 255, 0.5)", t.beginPath(), t.arc(Z, E, 4.5, 0, Math.PI * 2), t.stroke();
  const Y = p[0] - l[0], T = p[2] - l[2], F = Math.atan2(T, Y), N = (d.fov || 35) * Math.PI / 360, ie = P(18 * (_ / (j / 8)), 14, 28);
  t.fillStyle = B + "28", t.strokeStyle = B, t.lineWidth = 1.2, t.beginPath(), t.moveTo(ne, se), t.lineTo(ne + Math.cos(F - N) * ie, se + Math.sin(F - N) * ie), t.lineTo(ne + Math.cos(F + N) * ie, se + Math.sin(F + N) * ie), t.closePath(), t.fill(), t.stroke(), t.fillStyle = B + "44", t.beginPath(), t.arc(ne, se, 6, 0, Math.PI * 2), t.fill(), t.fillStyle = B, t.beginPath(), t.arc(ne, se, 3.5, 0, Math.PI * 2), t.fill(), t.restore();
}
function qi(e) {
  const t = e.root.querySelector('[data-role="keys"]');
  if (!t) return;
  t.innerHTML = "";
  const a = e.timelineObject(), o = e.timelineKeyframes(), r = Math.max(1, e.state.duration_frames - 1), n = P(Number(e.timelineZoom) || 1, 0.1, 50), i = Number(e.timelinePan) || 0, c = r / n, d = i;
  if (e.audioWaveformPeaks && e.audioWaveformPeaks.length) {
    const y = document.createElement("canvas");
    y.className = "timeline-waveform", y.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:0.35", y.width = Math.max(1, t.clientWidth || 600), y.height = Math.max(1, t.clientHeight || 68);
    const x = y.getContext("2d"), w = e.audioWaveformPeaks, j = y.width, _ = y.height, D = _ / 2;
    x.fillStyle = "#f2d06b";
    for (let A = 0; A < w.length; A++) {
      const z = (A / (w.length - 1) * r - d) / Math.max(1e-6, c) * j;
      if (z >= -5 && z <= j + 5) {
        const I = w[A] * (_ * 0.85);
        x.fillRect(z, D - I / 2, Math.max(1, j / w.length * n - 0.5), I);
      }
    }
    t.appendChild(y);
  }
  if (e.state.playback_range) {
    const y = document.createElement("div");
    y.className = "playback-range";
    const x = H(e, e.state.playback_range[0]), w = H(e, e.state.playback_range[1]);
    y.style.left = `${x}%`, y.style.width = `${Math.max(0, w - x)}%`, t.appendChild(y);
  }
  Cr(e, t);
  for (const y of e.state.markers || []) {
    const x = H(e, y.frame);
    if (x < -5 || x > 105) continue;
    const w = document.createElement("span");
    w.className = "timeline-marker", w.style.left = `${x}%`, w.style.setProperty("--marker-color", y.color), w.title = y.name, t.appendChild(w);
  }
  if (o.length > 1) {
    const y = H(e, o[0].frame), x = H(e, o[o.length - 1].frame), w = document.createElement("span");
    w.className = "oc-dope-rail", w.style.left = `${Math.min(y, x)}%`, w.style.width = `${Math.abs(x - y)}%`, w.style.setProperty("--channel-color", "#a78bfa"), t.appendChild(w);
  }
  const l = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const y of o) {
    const x = H(e, y.frame);
    if (x < -5 || x > 105) continue;
    const w = document.createElement("button");
    w.type = "button", w.className = `key${y.frame === e.frame ? " at-playhead" : ""}${l.has(y.frame) ? " selected" : ""}${y.frame === e.editingKeyFrame ? " editing" : ""}`, w.dataset.keyFrame = String(y.frame), w.dataset.interp = y.interpolation || "ease", w.setAttribute("aria-label", s(`${a?.name || "Camera"} keyframe at frame ${y.frame}`)), w.title = s(`Frame ${y.frame} · ${y.interpolation} · Drag: Retime · Alt+Drag: Duplicate`), w.style.left = `${x}%`;
    const j = document.createElement("span");
    j.className = "key-label", j.textContent = String(y.frame), w.appendChild(j), w.addEventListener("pointerdown", (_) => {
      if (_.preventDefault(), _.stopPropagation(), w.focus({ preventScroll: !0 }), _.altKey) {
        e.checkpoint("Duplicate keyframe");
        const A = a ? { frame: y.frame, transform: $e(y.transform), interpolation: y.interpolation } : { frame: y.frame, camera: R(y.camera), interpolation: y.interpolation }, B = e.timelineKeyframes();
        B.push(A), B.sort((z, I) => z.frame - I.frame), e.selectedKeyFrame = A.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([A.frame]), e.keyDrag = { key: A, box: t, isDuplicate: !0, moving: [{ key: A, startFrame: A.frame }], startPointerFrame: y.frame, startClientX: _.clientX, startClientY: _.clientY }, e.setFrame(A.frame, !1, !1), e.setStatus(s(`Duplicating key from ${y.frame}...`));
        return;
      }
      if (_.shiftKey) {
        e.selectedKeyFrames = new Set(e.selectedKeyFrames || [e.selectedKeyFrame].filter((A) => A !== null)), e.selectedKeyFrames.has(y.frame) ? e.selectedKeyFrames.delete(y.frame) : e.selectedKeyFrames.add(y.frame), e.selectedKeyFrame = e.selectedKeyFrames.has(y.frame) ? y.frame : [...e.selectedKeyFrames].at(-1) ?? null, e.setFrame(y.frame, !1, !1), e.updateKeyVisualState(), e.refreshKeyEditor();
        return;
      }
      e.selectedKeyFrames?.has(y.frame) || (e.selectedKeyFrames = /* @__PURE__ */ new Set([y.frame])), e.selectedKeyFrame = y.frame;
      const D = e.timelineKeyframes().filter((A) => e.selectedKeyFrames.has(A.frame));
      e.keyDrag = { key: y, box: t, moving: D.map((A) => ({ key: A, startFrame: A.frame })), startPointerFrame: y.frame, startClientX: _.clientX, startClientY: _.clientY }, e.setFrame(y.frame, !1, !1);
    }), w.addEventListener("click", (_) => {
      _.preventDefault(), _.stopPropagation(), !_.shiftKey && (_.shiftKey || (e.selectedKeyFrames = /* @__PURE__ */ new Set([y.frame])), e.selectKeyframe(y));
    }), t.appendChild(w);
  }
  const p = e.activeCameraTrack(), h = e.root.querySelector('[data-role="timeline-summary"]');
  if (h) {
    h.replaceChildren();
    const y = document.createElement("span");
    y.style.fontWeight = "700", e.selectedEntity === "object" && a ? (y.style.color = "#38bdf8", y.textContent = `📦 ${a.name || a.type}`, h.title = s(`Currently animating object: ${a.name || a.type}`)) : (y.style.color = "#f59e0b", y.textContent = `🎥 ${p.name}`, h.title = s(`Currently animating camera: ${p.name}`)), h.append(y, document.createTextNode(` · ${o.length} key${o.length === 1 ? "" : "s"}`));
    const x = o.filter((w) => w.frame > e.state.duration_frames - 1).length;
    if (x) {
      const w = document.createElement("span");
      w.className = "oc-dormant-keys", w.textContent = ` · ${x} beyond end`, w.title = s("Keys past the end of the timeline are kept. Lengthen the shot to reach them again."), h.append(w);
    }
  }
  const f = e.root.querySelector('[data-role="camera-summary"]');
  f && (f.textContent = `${p.name} · Key F${e.selectedKeyFrame ?? e.frame}`);
  const u = e.root.querySelector('[data-role="camera-menu-list"]');
  if (u) {
    u.innerHTML = "";
    for (const y of e.state.cameras) {
      const x = document.createElement("button");
      x.type = "button", x.className = y.id === e.state.active_camera_id ? "selected" : "";
      const w = document.createElement("i");
      w.className = "pi pi-video";
      const j = document.createElement("span");
      j.textContent = `${y.name} · ${y.keyframes.length} key${y.keyframes.length === 1 ? "" : "s"}${y.id === e.state.playblast_camera_id ? " · PLAYBLAST" : ""}`, x.append(w, j), x.addEventListener("click", () => {
        e.activateCamera(y.id), e.closeMenus();
      }), u.appendChild(x);
    }
  }
  const v = e.root.querySelector('[data-role="frame-total"]');
  v && (v.textContent = `/ ${Math.max(1, e.state.duration_frames)}`);
  const S = e.root.querySelector('[data-role="preview-title"]');
  S && (S.textContent = `${p.name} · ${s("Frame")} ${e.frame}`);
  const g = e.root.querySelector('[data-role="inspector-camera-name"]');
  g && (g.textContent = p.name), Fo(e), Eo(e), Lo(e), Ga(e), In(e), e.refreshCameraSelectors(), e.refreshKeyEditor(), e.updateEditState(), e.drawCurveEditor();
}
function za(e) {
  return e.recording ? e.playblastCameraAtFrame() : e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode];
}
function Di(e, t) {
  if (["camera", "perspective", "iso", "front", "back", "top", "right", "left", "bottom"].includes(t)) {
    e.state.view_mode = t;
    for (const a of e.root.querySelectorAll('[data-role="view-mode"]')) a.value = t;
    for (const a of e.root.querySelectorAll("[data-view]")) {
      const o = a.dataset.view === t;
      a.classList.toggle("active", o), a.setAttribute("aria-pressed", String(o));
    }
    e.serialize(), e.render(), e.setStatus(s(`View: ${t[0].toUpperCase()}${t.slice(1)}`));
  }
}
function Ni(e, t) {
  if (["translate", "rotate", "scale"].includes(t)) {
    e.state.gizmo_mode = t;
    for (const a of e.root.querySelectorAll("[data-transform-mode]")) {
      const o = a.dataset.transformMode === t;
      a.classList.toggle("active", o), a.setAttribute("aria-pressed", String(o));
    }
    e.serialize(), e.render(), e.setStatus(s(`${t[0].toUpperCase()}${t.slice(1)} · ${t === "translate" ? "W" : t === "rotate" ? "E" : "R"}`));
  }
}
function Ri(e, t) {
  e.checkpoint("Reset camera"), e.camera = t();
  for (const o of e.root.querySelectorAll('[data-role="camera-fov"]')) o.value = String(e.camera.fov);
  for (const o of e.root.querySelectorAll('[data-role="camera-roll"]')) o.value = String(e.camera.roll);
  const a = e.root.querySelector('[data-role="camera-type"]');
  a && (a.value = e.camera.camera_type), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.setStatus(s("Camera reset"));
}
function Bi(e) {
  const t = za(e), a = e.state.view_mode !== "camera", o = [...t.target];
  if (e.subSelection?.point) {
    e.checkpoint("Frame selection");
    const v = e.subSelection.point, S = Ma(Ea(t.position, o)), g = Number.isFinite(S[0]) && $a(S) > 0.1 ? S : [0.707, 0.4, 0.707], y = 2;
    t.target = [...v], t.position = he(t.target, Qe(g, y)), a ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit());
    const x = e.subSelection.mode === "vertex" ? "Vertex" : e.subSelection.mode === "edge" ? "Edge" : "Face";
    e.setStatus(s(`Focused on ${x} at [${v.map((w) => Math.round(w * 100) / 100).join(", ")}]`));
    return;
  }
  const n = e.selectedObject() || e.state.objects.find((v) => v.id === "subject") || e.state.objects[0] || { position: [0, 1.5, 0], size: [2, 3] }, i = n.size || [1, 1, 1], c = Math.max(i[0] || 1, i[1] || 1, i[2] || 1), d = (t.fov || 35) * Math.PI / 360, l = Math.max(2, c / Math.max(0.1, Math.tan(d)) * 0.9), p = Ma(Ea(t.position, o)), h = Number.isFinite(p[0]) && $a(p) > 0.1 ? p : [0.707, 0.4, 0.707], u = (n.type === "model" || n.type === "glb" ? e.webgl?.getObjectWorldCenter?.(n.id) : null) || (n.keyframes?.length ? qe(n, e.frame).position : n.position || [0, 1.5, 0]);
  e.checkpoint("Frame subject"), t.target = [...u], t.position = he(t.target, Qe(h, l)), a ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit()), e.setStatus(s(`Framed: ${n.name || n.type || "Subject"}`));
}
function ar(e, t, a) {
  const o = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], r = a?.rotation || t?.rotation || [0, 0, 0];
  return e.state.gizmo_space === "local" ? o.map((n) => jr(n, r)) : o;
}
function Wi(e) {
  if (e.selectedEntity === "object") {
    const t = e.selectedObject();
    if (!t || t.locked) return null;
    const a = t.type === "model" || t.type === "glb" ? e.webgl?.getObjectWorldCenter?.(t.id) : null, o = t.keyframes?.length ? qe(t, e.frame) : t, r = a || o.position || [0, 0, 0];
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
      return { type: "camera_target", position: te(t, e.frame, e.state.objects).target || e.camera.target || [0, 1.5, 0], rotation: [0, 0, 0] };
    }
    if (e.selectedEntity === "camera") {
      const t = e.activeCameraTrack();
      return { type: "camera", position: te(t, e.frame, e.state.objects).position || e.camera.position || [6, 4, 6], rotation: [0, 0, 0] };
    }
  }
  return null;
}
function to(e) {
  const t = Wi(e);
  if (!t) return null;
  const a = za(e), o = t.position;
  if (!o || !Number.isFinite(o[0]) || !Number.isFinite(o[1]) || !Number.isFinite(o[2])) return null;
  const r = Q(o, a, e.canvas.width, e.canvas.height);
  if (!r || !Number.isFinite(r[0]) || !Number.isFinite(r[1])) return null;
  const n = Math.max(0.7, $a(Ea(a.position, o)) * 0.12), i = t.type === "object" ? ar(e, t.object, t) : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (e.state.gizmo_mode !== "rotate" || t.type === "camera_target")
    return {
      entity: t,
      center: r,
      worldLength: n,
      handles: i.map((d, l) => ({ index: l, axis: d, points: [r, Q(he(o, Qe(d, n)), a, e.canvas.width, e.canvas.height)] })).filter((d) => d.points[1] && Number.isFinite(d.points[1][0]) && Number.isFinite(d.points[1][1]))
    };
  const c = i.map((d, l) => {
    const p = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], h = Ma(ro(d, p)), f = Ma(ro(d, h)), u = [];
    for (let v = 0; v <= 48; v++) {
      const S = v / 48 * Math.PI * 2, g = Q(he(o, he(Qe(h, Math.cos(S) * n), Qe(f, Math.sin(S) * n))), a, e.canvas.width, e.canvas.height);
      g && Number.isFinite(g[0]) && Number.isFinite(g[1]) && u.push(g);
    }
    return { index: l, axis: d, points: u };
  });
  return { entity: t, center: r, worldLength: n, handles: c };
}
function Hi(e, t) {
  const a = to(e);
  if (!a) return null;
  const o = Math.min(2, window.devicePixelRatio || 1), r = Math.hypot(t[0] - a.center[0], t[1] - a.center[1]);
  if (a.entity.type === "object" && (e.state.gizmo_mode === "translate" || e.state.gizmo_mode === "scale") && r <= 11 * o) {
    const c = a.center;
    return {
      free: !0,
      index: -1,
      axis: [0, 0, 0],
      distance: r,
      segment: [c, [c[0] + 1, c[1]]],
      worldLength: a.worldLength,
      entity: a.entity
    };
  }
  let i = null;
  for (const c of a.handles)
    for (let d = 0; d < c.points.length - 1; d++) {
      const l = c.points[d], p = c.points[d + 1], h = _r(t, l, p);
      (!i || h < i.distance) && (i = { ...c, distance: h, segment: [l, p], worldLength: a.worldLength, entity: a.entity });
    }
  return i?.distance <= 18 * o ? i : null;
}
function Vi(e, t) {
  const a = e.webgl?.pick?.(t[0], t[1], e.canvas.width, e.canvas.height);
  if (a) {
    if (typeof a == "string") {
      const c = e.state.objects.find((d) => d.id === a);
      return c ? { type: "object", object: c } : null;
    }
    if (a.type === "camera" || a.type === "camera_target") {
      const c = e.state.cameras.find((d) => d.id === a.id);
      return c ? { type: a.type, camera: c } : null;
    }
    const i = e.state.objects.find((c) => c.id === a.id);
    return i ? { type: "object", object: i } : null;
  }
  const o = za(e);
  if (e.state.view_mode !== "camera") {
    for (const i of e.state.cameras) {
      for (const p of i.keyframes || []) {
        const h = p.camera?.position;
        if (!h) continue;
        const f = Q(h, o, e.canvas.width, e.canvas.height);
        if (f && Math.hypot(t[0] - f[0], t[1] - f[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
          return { type: "camera_keyframe", camera: i, keyframe: p };
      }
      const c = te(i, e.frame, e.state.objects), d = Q(c.target || [0, 1.5, 0], o, e.canvas.width, e.canvas.height);
      if (d && Math.hypot(t[0] - d[0], t[1] - d[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera_target", camera: i };
      const l = Q(c.position || [6, 4, 6], o, e.canvas.width, e.canvas.height);
      if (l && Math.hypot(t[0] - l[0], t[1] - l[1]) <= 22 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera", camera: i };
    }
    for (const i of e.state.objects)
      if (i.enabled !== !1)
        for (const c of i.keyframes || []) {
          const d = c.transform?.position;
          if (!d) continue;
          const l = Q(d, o, e.canvas.width, e.canvas.height);
          if (l && Math.hypot(t[0] - l[0], t[1] - l[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
            return { type: "object_keyframe", object: i, keyframe: c };
        }
  }
  let n = null;
  for (const i of e.state.objects) {
    if (i.enabled === !1) continue;
    const c = i.keyframes?.length ? qe(i, e.frame) : i, d = Q(c.position || [0, 0, 0], o, e.canvas.width, e.canvas.height);
    if (!d) continue;
    const l = Math.hypot(t[0] - d[0], t[1] - d[1]);
    (!n || l < n.distance) && (n = { object: i, distance: l });
  }
  return n?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? { type: "object", object: n.object } : null;
}
function Ui(e, t, a, o = 15) {
  const r = a[0] - t[0], n = a[1] - t[1], i = Math.hypot(r, n) || 1, c = r / i, d = n / i, l = -d, p = c, h = o * 0.4, f = a[0] - c * o, u = a[1] - d * o;
  e.beginPath(), e.moveTo(a[0], a[1]), e.lineTo(f + l * h, u + p * h), e.lineTo(f - l * h, u - p * h), e.closePath(), e.fill();
}
function Gi(e) {
  const t = to(e);
  if (!t || !t.handles) return;
  const a = ["#ef5b5b", "#58cc6b", "#5f82ef"];
  e.ctx.save(), e.ctx.lineWidth = 4, e.ctx.lineCap = "round";
  for (const r of t.handles) {
    if (!r?.points?.length) continue;
    const n = e.hoveredGizmoHandle === r.index || e.gizmoDrag?.axisIndex === r.index;
    if (e.ctx.lineWidth = n ? 7 : 4, e.ctx.strokeStyle = n ? "#ffffff" : a[r.index] || "#ffffff", e.ctx.fillStyle = a[r.index] || "#ffffff", e.ctx.beginPath(), r.points.forEach((i, c) => {
      i && (c ? e.ctx.lineTo(i[0], i[1]) : e.ctx.moveTo(i[0], i[1]));
    }), e.ctx.stroke(), e.state.gizmo_mode !== "rotate" || t.entity?.type === "camera_target") {
      const i = r.points.filter((d) => d && Number.isFinite(d[0]) && Number.isFinite(d[1]));
      if (!i.length) continue;
      const c = i[i.length - 1];
      e.state.gizmo_mode === "scale" && t.entity?.type === "object" ? e.ctx.fillRect(c[0] - 6, c[1] - 6, 12, 12) : Ui(e.ctx, i[0], c);
    }
  }
  if (t.entity?.type === "object" && (e.state.gizmo_mode === "translate" || e.state.gizmo_mode === "scale")) {
    const r = e.hoveredGizmoHandle === "free" || e.gizmoDrag?.free;
    if (e.ctx.fillStyle = r ? "#fbbf24" : "#f4f7fb", e.ctx.strokeStyle = "#15171c", e.ctx.lineWidth = 2, e.ctx.beginPath(), e.state.gizmo_mode === "scale") {
      const n = r ? 8 : 6;
      e.ctx.rect(t.center[0] - n, t.center[1] - n, n * 2, n * 2);
    } else
      e.ctx.arc(t.center[0], t.center[1], r ? 10 : 7, 0, Math.PI * 2);
    e.ctx.fill(), e.ctx.stroke();
  }
  e.ctx.restore();
}
function uo(e, t, { frameCount: a = 0, fps: o = 0 } = {}) {
  const r = Math.round(Number(t?.videoWidth || t?.naturalWidth) || 0), n = Math.round(Number(t?.videoHeight || t?.naturalHeight) || 0), i = Math.round(Number(o) || Number(e.state?.fps) || Number(e.fpsWidget?.value) || 24), c = Number(t?.duration) > 0 ? Math.round(Number(t.duration) * i) : 0, d = Math.round(Number(a) || c || 0);
  return !r || !n ? !1 : (e.widthWidget && (e.widthWidget.value = r), e.heightWidget && (e.heightWidget.value = n), i && e.fpsWidget && (e.fpsWidget.value = i), d && i && e.durationWidget && (e.durationWidget.value = Math.max(0.25, d / i)), e.syncFromWidgets(), !0);
}
let Ie = null;
function or({ api: e }) {
  Ie = e;
}
async function rr(e, t, a, o = () => !0, r = null) {
  if (!t || !a) return;
  const n = String(t.asset || a).toLowerCase();
  if (r ?? /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/.test(n)) {
    const c = document.createElement("video");
    if (c.src = a, c.loop = !0, c.muted = !0, c.playsInline = !0, await new Promise((d) => {
      c.addEventListener("loadeddata", d, { once: !0 }), c.addEventListener("error", d, { once: !0 });
    }), !o()) {
      c.pause(), c.removeAttribute("src"), c.load();
      return;
    }
    await c.play().catch(() => {
    }), e.cardMediaById.set(t.id, c), t.id === "subject" && (e.cardMedia = c);
  } else {
    const c = new Image();
    if (c.src = a, await c.decode().catch(() => {
    }), !o()) {
      c.src = "";
      return;
    }
    e.cardMediaById.set(t.id, c), t.id === "subject" && (e.cardMedia = c);
  }
  return e.render(), e.cardMediaById.get(t.id) || null;
}
async function Xi(e, t) {
  if (!Ie?.fetchApi || !/\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(e)) return null;
  const a = await Ie.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: { kind: "annotated_input", value: e } }),
    signal: t
  });
  return a.ok && (await a.json())?.info || null;
}
function Fe(e, t = "") {
  const a = String(e || ""), o = a.match(/\s+\[(input|output|temp)\]$/), r = o ? a.slice(0, o.index) : a, n = o?.[1] || "input";
  return `${t && !r.includes("/") && !r.includes("\\") ? `${t}/${r}` : r} [${n}]`;
}
function Yi(e) {
  if (e.state.viewport_bg_image) {
    const t = new Image();
    t.src = je(e.state.viewport_bg_image), t.decode().catch(() => {
    }), e.viewportBgImage = t;
  }
  e.viewportBgSequenceImages = (e.state.viewport_bg_sequence || []).map((t) => {
    const a = new Image();
    return a.src = je(t), a.decode().catch(() => {
    }), a;
  });
  for (const t of e.state.objects) {
    if (!t.asset) {
      (t.type === "model" || t.type === "glb") && (t.load_error = s("Not saved to the ComfyUI input folder: this model will be missing after a reload."));
      continue;
    }
    const a = je(t.asset);
    t.type === "glb" || t.type === "model" ? e.modelUrlsById.set(t.id, a) : t.type === "card" && !e.cardMediaById.has(t.id) && e.loadMediaUrl(t, a);
  }
}
function Zi(e, t) {
  e.modelInfoById.set(t.id, t);
  const a = e.state.objects.find((o) => o.id === t.id);
  if (t.error) {
    a && (a.load_error = t.error), e.setStatus(`⚠️ ${t.error}`), e.refreshObjects(), t.id === e.selectedObjectId && e.refreshInspector();
    return;
  }
  a && (a.load_error = null), a?.animation_index && e.webgl?.selectAnimation(t.id, a.animation_index), t.id === e.selectedObjectId && e.refreshInspector(), !t.meshes && !t.points && t.bones ? e.setStatus(s(`${t.format.toUpperCase()} animation only: ${t.bones} bones, no mesh · skeleton preview`)) : e.setStatus(s(`${t.format.toUpperCase()} loaded: ${t.meshes} mesh${t.meshes === 1 ? "" : "es"}, ${t.vertices} vertices`));
}
async function Ji(e, t) {
  if (!t) return;
  const a = t.name.split(".").pop()?.toLowerCase();
  if (!["glb", "obj", "fbx", "stl", "ply"].includes(a)) return e.setStatus(s("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first."));
  const o = `model_${Date.now().toString(36)}`, r = {
    id: o,
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
  e.state.objects.push(r), e.selectedEntity = "object", e.selectedObjectId = o, e.selectedObjectIds = /* @__PURE__ */ new Set([o]), e.selectedKeyFrame = null;
  const n = e.objectUrls.replace(o, t);
  e.modelUrlsById.set(o, n), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s("Uploading {format}…").replace("{format}", a.toUpperCase()));
  try {
    const i = await Ya(Ie, { route: "/majoor/omnicam/upload_model", field: "asset", file: t });
    if (!i?.path) throw new Error("upload returned no managed path");
    r.asset = i.path, r.load_error = null, e.serialize();
    const c = e.modelInfoById.get(o);
    c ? e.onModelLoaded(c) : e.setStatus(s("{format} imported: {name}").replace("{format}", a.toUpperCase()).replace("{name}", i.name || r.name));
  } catch (i) {
    console.error("[OmniCam] model upload failed", i), r.load_error = s("Not saved to the ComfyUI input folder: this model will be missing after a reload."), e.serialize(), e.refreshObjects(), e.setStatus(s("{format} shown locally, but the upload failed — it will not survive a reload.").replace("{format}", a.toUpperCase()));
  }
}
async function Qi(e, t) {
  if (!t) return;
  const a = e.selectedObject()?.type === "card" ? e.selectedObject() : e.state.objects.find((o) => o.id === "subject");
  if (e.cardUrl = e.objectUrls.replace(a.id, t), t.type.startsWith("video/")) {
    const o = document.createElement("video");
    o.src = e.cardUrl, o.loop = !0, o.muted = !0, o.playsInline = !0, await o.play().catch(() => {
    }), e.cardMediaById.set(a.id, o), a.id === "subject" && (e.cardMedia = o);
  } else {
    const o = new Image();
    o.src = e.cardUrl, await o.decode().catch(() => {
    }), e.cardMediaById.set(a.id, o), a.id === "subject" && (e.cardMedia = o);
  }
  e.render(), e.setStatus(s("Uploading card…"));
  try {
    const o = await Ya(Ie, { route: "/majoor/omnicam/upload_asset", field: "asset", file: t });
    a.asset = o.path, a.id === "subject" && (e.state.card_asset = o.path, e.cardWidget && (e.cardWidget.value = o.path)), e.serialize(), e.setStatus(s(`Card: ${o.name}`));
  } catch (o) {
    console.error(o), e.setStatus(s("Card loaded locally; backend upload failed"));
  }
}
function ec(e, t) {
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
  e.state.reference_index = P(e.state.reference_index || 0, 0, e.executionReferences.length - 1), a.value = String(e.state.reference_index), e.serialize(), e.loadSelectedReference();
}
function tc(e) {
  const t = e.executionReferences[e.state.reference_index];
  if (!t) return;
  const a = new Image();
  a.onload = () => {
    e.cardMedia = a, e.cardMediaById.set("subject", a), e.render(), e.setStatus(s("Upstream media refreshed"));
  }, a.src = Ie.apiURL(`/view?${new URLSearchParams(t).toString()}`);
}
async function ac(e) {
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
  let c = !1, d = !1;
  const l = /* @__PURE__ */ new Set();
  for (const h of i) {
    const f = String(h.name || "").toLowerCase();
    if (h.link == null) continue;
    const u = Gr(t, h.link);
    if (u) {
      if (f === "image" || f === "video") {
        c = !0;
        const v = u.widgets?.find(
          (S) => ["image", "image_path", "upload", "file", "filename", "video", "video_path"].includes(String(S.name).toLowerCase())
        );
        if (v && v.value) {
          const S = String(v.value), g = /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(S), y = u.widgets?.find((j) => String(j.name).toLowerCase() === "subfolder")?.value || "", x = je(Fe(S, y)), w = e.state.objects.find((j) => j.id === "subject");
          if (w) {
            const j = await rr(e, w, x, r, g);
            if (!r()) return;
            w.asset = Fe(S, y);
            let _ = null;
            if (g)
              try {
                _ = await Xi(S, o.signal);
              } catch (D) {
                if (D?.name === "AbortError") return;
                console.warn("Failed to describe upstream video:", D);
              }
            r() && uo(e, j, {
              fps: _?.fps,
              frameCount: g ? _?.frame_count : 1
            }), e.upstreamImageConnected = !0, n = !0, e.setStatus(s(`Upstream ${g ? "video" : "image"}: ${S}`));
          }
        } else {
          const S = Xr(u);
          S && (S instanceof HTMLVideoElement && S.paused && S.play().catch(() => {
          }), e.cardMediaById.set("subject", S), e.cardMedia = S, uo(e, S, { frameCount: S instanceof HTMLVideoElement ? 0 : 1 }), e.upstreamImageConnected = !0, n = !0, e.render(), e.setStatus(S instanceof HTMLVideoElement ? s("Upstream video preview synced") : s("Upstream image preview synced")));
        }
      }
      if (f === "audio") {
        d = !0;
        const v = u.widgets?.find(
          (S) => ["audio", "audio_path", "audio_file", "file", "filename"].includes(String(S.name).toLowerCase())
        );
        if (v && v.value) {
          const S = String(v.value), g = u.widgets?.find((x) => String(x.name).toLowerCase() === "subfolder")?.value || "", y = je(Fe(S, g));
          try {
            const x = await fetch(y, { signal: o.signal });
            if (x.ok) {
              const w = await x.blob();
              if (!r()) return;
              const j = new File([w], S, { type: w.type || "audio/wav" });
              await e.loadAudioFile(j), e.upstreamAudioConnected = !0, n = !0, e.setStatus(s(`Upstream audio: ${S}`));
            }
          } catch (x) {
            if (x?.name === "AbortError") return;
            console.warn("Failed to fetch upstream audio:", x);
          }
        }
      }
      if (f === "scene_3d" || f === "model" || f === "mesh") {
        const v = u.widgets?.find(
          (S) => ["model_file", "model", "file", "filename", "filepath", "mesh", "scene", "3d_file"].includes(String(S.name).toLowerCase())
        );
        if (v && v.value) {
          const S = String(v.value), g = S.split(".").pop()?.toLowerCase();
          if (["glb", "gltf", "obj", "fbx", "stl", "ply"].includes(g)) {
            const y = u.widgets?.find((_) => String(_.name).toLowerCase() === "subfolder")?.value || "", x = je(Fe(S, y)), w = `upstream_scene_${u.id}`;
            l.add(w);
            let j = e.state.objects.find((_) => _.id === w);
            j ? (j.asset = Fe(S, y), j.format = g === "gltf" ? "glb" : g) : (j = {
              id: w,
              type: "model",
              format: g === "gltf" ? "glb" : g,
              name: `Upstream: ${S.replace(/\.[^.]+$/i, "")}`,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              size: [1, 1, 1],
              material_mode: "textured",
              keyframes: [],
              enabled: !0,
              asset: Fe(S, y)
            }, e.state.objects.push(j)), e.modelUrlsById.set(w, x), e.serialize(), e.refreshObjects(), e.render(), n = !0, e.setStatus(s(`Upstream 3D model: ${S}`));
          }
        }
      }
    }
  }
  if (!c && e.upstreamImageConnected) {
    e.cardMedia = null, e.cardMediaById.delete("subject");
    const h = e.state.objects.find((f) => f.id === "subject");
    h && (h.asset = ""), e.upstreamImageConnected = !1, n = !0, e.setStatus(s("Upstream image disconnected · card reset"));
  }
  if (!d && e.upstreamAudioConnected) {
    if (e.audioSource) {
      try {
        e.audioSource.stop();
      } catch {
      }
      e.audioSource = null;
    }
    e.audioBuffer = null, e.audioWaveformPeaks = null, e.upstreamAudioConnected = !1, e.refreshKeys(), n = !0, e.setStatus(s("Upstream audio disconnected · audio track cleared"));
  }
  const p = e.state.objects.filter(
    (h) => h.id.startsWith("upstream_scene_") && !l.has(h.id)
  );
  if (p.length > 0) {
    for (const h of p)
      e.modelUrlsById.delete(h.id), e.modelInfoById.delete(h.id), e.webgl?.removeModel(h.id);
    e.state.objects = e.state.objects.filter(
      (h) => !p.some((f) => f.id === h.id)
    ), e.refreshObjects(), n = !0, e.setStatus(s("Upstream 3D scene disconnected · model removed"));
  }
  Hr(e) && (n = !0), n && (e.serialize(), e.render());
}
async function oc(e, { signal: t } = {}) {
  if (!e?.fetchApi) throw new TypeError("A ComfyUI API client is required");
  const a = await e.fetchApi("/majoor/omnicam/capabilities", { signal: t });
  if (!a.ok) throw new Error(`Capabilities request failed (${a.status || "unknown"})`);
  return a.json();
}
function rc(e) {
  const t = Array.isArray(e) ? e : [];
  if (!t.length) return { tone: "ok", label: "Core ready" };
  const a = t.length;
  return {
    tone: t.some((o) => o?.severity === "error") ? "error" : "warn",
    label: a === 1 ? "1 optional adapter issue" : `${a} optional adapter issues`
  };
}
async function nc(e) {
  const t = e.root.querySelector('[data-role="setup-badge"]'), a = e.root.querySelector('[data-role="setup-issues"]');
  if (!t || !a) return;
  let o;
  try {
    o = await oc(Oe);
  } catch {
    return;
  }
  e.adapterCapabilities = o;
  const r = o.diagnostic?.issues || [], n = rc(r);
  if (t.hidden = !1, !r.length) {
    t.className = `setup-badge ${n.tone}`, t.textContent = s("Core ready"), a.innerHTML = "";
    return;
  }
  t.className = `setup-badge ${n.tone}`, t.textContent = r.length === 1 ? s("1 optional adapter issue") : s("{count} optional adapter issues").replace("{count}", String(r.length)), a.innerHTML = "";
  for (const i of r) {
    const c = document.createElement("div");
    c.className = "setup-issue";
    const d = document.createElement("span");
    if (d.textContent = `• ${i.message} `, c.appendChild(d), i.docs) {
      const l = document.createElement("a");
      l.href = i.docs, l.target = "_blank", l.rel = "noopener noreferrer", l.textContent = s("Setup docs"), c.appendChild(l);
    }
    a.appendChild(c);
  }
}
function nr(e, t, a = null, o = null) {
  const r = Array.isArray(e) ? e : [];
  return r.find((n) => n.frame === t) || (a !== null ? r.find((n) => n.frame === a) : null) || (o !== null ? r.find((n) => n.frame === o) : null) || null;
}
function ao(e, t) {
  return (t || e.activeCameraTrack?.())?.target_object_id || e.state.target_object_id || null;
}
function oo(e, t) {
  const a = t || e.activeCameraTrack?.(), o = a?.aim_bone ?? (a?.id === e.state.active_camera_id ? e.state.aim_bone : null);
  return typeof o == "string" && o ? o : null;
}
function sc(e, t = ao(e)) {
  if (!t) return [];
  const a = e.state.objects.find((o) => o.id === t);
  return !a || a.type !== "model" && a.type !== "glb" ? [] : e.webgl?.listObjectBones?.(t) || [];
}
function sr(e, t, a) {
  const o = ao(e, t), r = oo(e, t);
  if (!o || !r) return null;
  const n = e.state.objects.find((l) => l.id === o);
  if (!n || n.enabled === !1) return null;
  const i = e.webgl?.sampleModelPoint?.(o, r, a, e.state.fps || 24);
  if (!i) return null;
  const d = (t || e.activeCameraTrack?.())?.target_offset || e.state.target_offset || [0, 0, 0];
  return [i[0] + (d[0] || 0), i[1] + (d[1] || 0), i[2] + (d[2] || 0)];
}
function ic(e, t, a) {
  const o = t.type === "model" || t.type === "glb" ? e.webgl?.sampleModelPoint?.(t.id, null, a, e.state.fps || 24) : null;
  return o || (t.keyframes?.length ? qe(t, a).position : t.position || [0, 1.5, 0]);
}
function Wa(e, t, a, o) {
  if (!a) return a;
  const r = sr(e, t, o);
  return r && (a.target = r), a;
}
function cc(e, t) {
  const a = t || null;
  e.checkpoint("Change aim bone");
  const o = e.activeCameraTrack();
  o.aim_bone = a, o.id === e.state.active_camera_id && (e.state.aim_bone = a), e.setFrame(e.frame), e.serialize(), e.refreshInspector(), e.render(), e.setStatus(a ? s("Aiming at bone {bone}").replace("{bone}", a) : s("Aiming at the whole object"));
}
function lc(e, { perFrame: t = !1 } = {}) {
  const a = e.activeCameraTrack(), o = ao(e, a), r = oo(e, a);
  if (!o || !r) return e.bakeAimToKeyframes();
  const n = e.state.objects.find((c) => c.id === o);
  if (!n || !a.keyframes?.length) return;
  e.checkpoint(t ? "Bake aim per frame" : "Bake aim to keyframes");
  const i = (c) => sr(e, a, c) || ic(e, n, c);
  if (t) {
    const c = a.keyframes[0].frame, d = a.keyframes[a.keyframes.length - 1].frame, l = new Map(a.keyframes.map((p) => [p.frame, p]));
    for (let p = c; p <= d; p++) {
      const f = l.get(p) || { frame: p, camera: te(a, p, e.state.objects), interpolation: "linear" };
      f.camera.target = [...i(p)], l.set(p, f);
    }
    a.keyframes = [...l.values()].sort((p, h) => p.frame - h.frame);
  } else
    for (const c of a.keyframes) c.camera.target = [...i(c.frame)];
  a.id === e.state.active_camera_id && (e.state.keyframes = a.keyframes), e.setFrame(e.frame), e.serialize(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s("Aim baked on bone {bone} ({count} keys)").replace("{bone}", r).replace("{count}", String(a.keyframes.length)));
}
function dc(e) {
  const t = e.root?.querySelector('[data-role="camera-aim-bone-row"]'), a = e.root?.querySelector('[data-role="camera-aim-bone"]');
  if (!a) return;
  const o = sc(e);
  t && (t.hidden = o.length === 0);
  const r = oo(e) || "";
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
function mc(e) {
  const t = e.root.querySelector('[data-role="objects"]');
  if (!t) return;
  t.innerHTML = "";
  const a = (n, i, c, d, l = "") => {
    const p = document.createElement("button");
    return p.type = "button", p.className = "scene-action-btn", c && (p.style.cssText = l || "color:#f59e0b;border-color:#78350f;background:rgba(245,158,11,0.15)"), p.title = s(i), p.innerHTML = `<i class="pi ${n}" style="font-size:10px"></i>`, p.addEventListener("click", (h) => {
      h.stopPropagation(), d(h);
    }), p;
  }, o = (e.outlinerFilter || "").trim().toLowerCase(), r = (n) => !o || String(n || "").toLowerCase().includes(o);
  for (const n of e.state.cameras) {
    if (!r(n.name)) continue;
    const i = document.createElement("div");
    i.role = "button", i.tabIndex = 0, i.dataset.cameraId = n.id;
    const c = n.id === e.state.active_camera_id, d = n.id === e.state.playblast_camera_id, l = e.selectedEntity === "camera" && c;
    i.setAttribute("aria-selected", String(l)), i.className = `scene-item${l ? " selected" : ""}${c && !l ? " active-view" : ""}`;
    const p = document.createElement("i");
    p.className = "pi pi-video";
    const h = document.createElement("span");
    if (h.className = "scene-item-label", l || c) {
      const v = document.createElement("span");
      v.style.cssText = `color:${l ? "#f59e0b" : "#58cc6b"};font-weight:700`, v.textContent = l ? "● " : "○ ", h.appendChild(v);
    }
    if (h.appendChild(document.createTextNode(n.name)), d) {
      const v = document.createElement("span");
      v.style.cssText = "color:#f2d06b;font-size:10px", v.title = "Playblast Output", v.textContent = " ★", h.appendChild(v);
    }
    if (n.muted) {
      const v = document.createElement("span");
      v.style.opacity = ".6", v.textContent = " (muted)", h.appendChild(v);
    }
    const f = document.createElement("div");
    f.className = "scene-item-actions", f.appendChild(a("pi-star", "Solo track", n.solo, () => {
      e.checkpoint("Solo track"), n.solo = !n.solo, e.serialize(), e.refreshObjects(), e.renderCameraView();
    }, "color:#fbbf24;border-color:#78350f;background:rgba(245,158,11,0.2)")), f.appendChild(a("pi-volume-off", "Mute track", n.muted, () => {
      e.checkpoint("Mute track"), n.muted = !n.muted, e.serialize(), e.refreshObjects(), e.renderCameraView();
    }, "color:#f87171;border-color:#7f1d1d;background:rgba(239,68,68,0.15)")), f.appendChild(a("pi-lock", "Lock track", n.locked, () => {
      e.checkpoint("Lock track"), n.locked = !n.locked, e.serialize(), e.refreshObjects(), e.renderCameraView();
    })), f.appendChild(a("pi-ellipsis-v", "Camera actions", !1, (v) => e.openCameraContext(v, n.id, !1))), i.append(p, h, f), i.title = l ? s("Currently selected for editing") : d ? s("Active playblast camera") : s("Click to select & activate this camera");
    const u = () => {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(n.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Camera: ${n.name}`));
    };
    i.addEventListener("contextmenu", (v) => {
      v.preventDefault(), v.stopPropagation(), e.openCameraContext(v, n.id, !1);
    }), i.addEventListener("keydown", (v) => {
      (v.key === "Enter" || v.key === " ") && (v.preventDefault(), u());
    }), t.appendChild(i);
  }
  for (const n of e.state.objects) {
    if (!r(n.name || n.type)) continue;
    const i = document.createElement("div");
    i.role = "button", i.tabIndex = 0, i.dataset.objectId = n.id;
    const c = e.selectedEntity === "object" && (n.id === e.selectedObjectId || e.selectedObjectIds?.has?.(n.id));
    i.setAttribute("aria-selected", String(c)), i.className = `scene-item${c ? " selected" : ""}`;
    const d = n.type === "card" ? "pi-image" : n.type === "model" || n.type === "glb" ? "pi-box" : n.type === "ground" ? "pi-minus" : n.type === "cube" ? "pi-stop" : n.type === "sphere" ? "pi-circle" : n.type === "human" ? "pi-user" : "pi-plus", l = n.enabled !== !1, p = !!n.load_error, h = document.createElement("i");
    h.className = `pi ${p ? "pi-exclamation-triangle" : d}`, h.style.cssText = p ? "color:#f87171" : l ? "" : "opacity:.4";
    const f = document.createElement("span");
    f.className = "scene-item-label";
    const u = document.createElement("span");
    if (u.style.cssText = p ? "color:#fca5a5" : l ? "" : "opacity:.5;text-decoration:line-through", u.textContent = n.name || n.type, f.appendChild(u), p) {
      const g = document.createElement("span");
      g.style.cssText = "color:#ef4444;font-size:9px;font-weight:700", g.textContent = " [Format!]", f.appendChild(g);
    }
    const v = document.createElement("div");
    v.className = "scene-item-actions", v.appendChild(a(l ? "pi-eye" : "pi-eye-slash", l ? "Hide object" : "Show object", !l, () => e.toggleObject(n.id), "color:#ef4444;opacity:.7")), v.appendChild(a("pi-lock", "Lock object", n.locked, () => {
      e.checkpoint("Lock object"), n.locked = !n.locked, e.serialize(), e.refreshObjects();
    })), v.appendChild(a("pi-ellipsis-v", "Object actions", !1, (g) => e.openObjectContext(g, n.id))), i.append(h, f, v), i.title = s("Click to select · Double-click to toggle visibility · Right-click for actions");
    const S = (g = {}) => {
      if (g.altKey && n.id !== "subject") return void e.deleteObject(n.id);
      e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectIds ||= /* @__PURE__ */ new Set(), g.shiftKey || g.ctrlKey || g.metaKey ? e.selectedObjectIds.has(n.id) ? e.selectedObjectIds.delete(n.id) : e.selectedObjectIds.add(n.id) : e.selectedObjectIds = /* @__PURE__ */ new Set([n.id]), e.selectedObjectId = e.selectedObjectIds.has(n.id) ? n.id : [...e.selectedObjectIds].at(-1) || null, e.selectedEntity = e.selectedObjectIds.size ? "object" : "camera", e.selectedKeyFrame = e.selectedObjectId ? n.keyframes?.find((y) => y.frame === e.frame)?.frame ?? null : null, e.editingKeyFrame = null;
      for (const y of t.querySelectorAll(".scene-item")) {
        const x = !!(y.dataset.objectId && e.selectedObjectIds.has(y.dataset.objectId));
        y.classList.toggle("selected", x), y.dataset.objectId && y.setAttribute("aria-selected", String(x));
      }
      e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(s(`Selected: ${n.name || n.type}`));
    };
    i.addEventListener("dblclick", () => e.toggleObject(n.id)), i.addEventListener("contextmenu", (g) => {
      g.preventDefault(), g.stopPropagation(), e.openObjectContext(g, n.id);
    }), i.addEventListener("keydown", (g) => {
      (g.key === "Enter" || g.key === " ") && (g.preventDefault(), S(g));
    }), t.appendChild(i);
  }
  e.refreshInspector();
}
function pc(e, t) {
  e.checkpoint("Create object");
  const a = `${t}_${Date.now().toString(36)}`, o = t === "ground", r = {
    id: a,
    type: t,
    name: t === "human" ? s("Human Proxy") : t[0].toUpperCase() + t.slice(1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    size: o ? [12, 0.1, 12] : t === "human" ? [0.7, 1.8, 0.4] : [1.5, 1.5, 1.5],
    material_mode: o ? "checker" : "textured",
    keyframes: [],
    enabled: !0
  };
  e.state.objects.push(r), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedObjectIds = /* @__PURE__ */ new Set([a]), e.selectedKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render();
}
async function fc(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  if (!a) return;
  const o = (await Xa(e.app, s("Rename object"), s("Object name"), a.name || a.type))?.trim();
  !o || o === a.name || (e.checkpoint("Rename object"), a.name = o.slice(0, 80), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(s(`Object renamed: ${a.name}`)));
}
function hc(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  if (!a) return;
  e.checkpoint("Duplicate object");
  const o = JSON.parse(JSON.stringify(a));
  o.id = `${a.type}_${Date.now().toString(36)}`, o.name = `${a.name || a.type} Copy`, o.position = he(o.position || [0, 0, 0], [0.35, 0, 0.35]), o.asset && delete o.asset, e.state.objects.push(o), e.selectedEntity = "object", e.selectedObjectId = o.id, e.selectedObjectIds = /* @__PURE__ */ new Set([o.id]), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s(`${o.name} added`));
}
function bc(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint(a.enabled === !1 ? "Show object" : "Hide object"), a.enabled = a.enabled === !1, e.serialize(), e.refreshObjects(), e.render(), e.setStatus(s(`${a.name || a.type} ${a.enabled ? "shown" : "hidden"}`)));
}
async function uc(e, t) {
  if (t === "subject") return e.setStatus(s("The subject card cannot be deleted"));
  const a = e.state.objects.find((o) => o.id === t);
  if (a && await Do(e.app, s("Delete object"), s(`Delete ${a.name || a.type} and its ${(a.keyframes || []).length} keyframe(s)?`))) {
    e.checkpoint("Delete object");
    for (const o of e.state.objects) o.parent_id === t && (o.parent_id = null);
    e.state.objects = e.state.objects.filter((o) => o.id !== t), e.selectedObjectIds?.delete(t), e.removeObjectResources(t), e.selectedObjectId === t && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = e.state.keyframes.find((o) => o.frame === e.frame)?.frame ?? null), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(s(`${a.name || a.type} deleted`));
  }
}
function yc(e) {
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
function rt(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function yo(e, t) {
  const a = e('[data-role="curve-group"]');
  if (a)
    for (const o of a.options) {
      const r = t[o.value];
      r && (o.textContent = r);
    }
}
function gc(e) {
  const t = rt(e), a = e.root.querySelector('[data-role="object-panel"]');
  a && (a.hidden = !t);
  const o = (g) => e.root.querySelector(g), r = e.activeCameraTrack(), n = o('[data-role="camera-target-object"]');
  if (n) {
    const g = r.target_object_id || e.state.target_object_id || "";
    n.innerHTML = "";
    const y = document.createElement("option");
    y.value = "", y.textContent = s("Manual Target (No Tracking)"), n.appendChild(y);
    for (const x of e.state.objects) {
      const w = document.createElement("option");
      w.value = x.id, w.textContent = `${s("Track:")} ${x.name || x.type}`, n.appendChild(w);
    }
    n.value = g;
  }
  dc(e);
  const i = [...e.camera.position, ...e.camera.target, e.camera.fov, e.camera.roll || 0, e.camera.near, e.camera.far];
  ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"].forEach((g, y) => {
    for (const x of e.root.querySelectorAll(`[data-role="${g}"]`))
      document.activeElement !== x && (x.value = String(Math.round(i[y] * 1e4) / 1e4));
  });
  for (const g of e.root.querySelectorAll('[data-role="camera-type"]'))
    document.activeElement !== g && (g.value = e.camera.camera_type || "perspective");
  for (const g of e.root.querySelectorAll('[data-role="speed"]'))
    document.activeElement !== g && (g.value = String(e.cameraSpeed || 1));
  for (const g of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    document.activeElement !== g && (g.value = e.state.active_camera_id);
  for (const g of e.root.querySelectorAll('[data-role="camera-color"]'))
    document.activeElement !== g && (g.value = r?.color || "#4aa3ef");
  if (!t) {
    const g = o('[data-role="selected-name"]');
    g && (g.textContent = `${r.name} · F${e.frame}`), yo(o, {
      camera: s("Camera (Position, Focal, Roll)"),
      position: s("Position XYZ"),
      target: s("Target XYZ"),
      lens: s("FOV / Roll / Zoom")
    });
    return;
  }
  const c = t.position || [0, 0, 0], d = o('[data-role="selected-name"]');
  d && (d.textContent = t.name || t.type), yo(o, {
    camera: s("Position XYZ"),
    position: s("Position XYZ"),
    target: s("Rotation XYZ"),
    lens: s("Scale XYZ")
  });
  const l = t.rotation || [0, 0, 0], p = t.size || [1, 1, 1], h = {
    "object-x": c[0],
    "object-y": c[1],
    "object-z": c[2],
    "object-rx": l[0],
    "object-ry": l[1],
    "object-rz": l[2],
    "object-sx": p[0] ?? 1,
    "object-sy": p[1] ?? 1,
    "object-sz": p[2] ?? 1
  };
  for (const [g, y] of Object.entries(h))
    for (const x of e.root.querySelectorAll(`[data-role="${g}"]`))
      document.activeElement !== x && (x.value = String(Math.round(y * 1e4) / 1e4));
  for (const g of e.root.querySelectorAll('[data-role="object-material"]'))
    document.activeElement !== g && (g.value = t.material_mode || "textured");
  for (const g of e.root.querySelectorAll('[data-role="object-color"]'))
    document.activeElement !== g && (g.value = t.color || "#8c929b");
  for (const g of e.root.querySelectorAll("[data-transform-mode]")) g.classList.toggle("active", g.dataset.transformMode === (e.state.gizmo_mode || "translate"));
  const f = o('[data-role="animation-row"]'), u = o('[data-role="animation-select"]'), v = o('[data-role="object-parent"]');
  if (v) {
    const g = t.id;
    v.innerHTML = "";
    const y = document.createElement("option");
    y.value = "", y.textContent = s("No parent"), v.appendChild(y);
    const x = /* @__PURE__ */ new Set([g]);
    let w = !0;
    for (; w; ) {
      w = !1;
      for (const j of e.state.objects)
        !x.has(j.id) && j.parent_id && x.has(j.parent_id) && (x.add(j.id), w = !0);
    }
    for (const j of e.state.objects) {
      if (x.has(j.id)) continue;
      const _ = document.createElement("option");
      _.value = j.id, _.textContent = j.name || j.type, v.appendChild(_);
    }
    v.value = t.parent_id || "";
  }
  const S = e.modelInfoById.get(t.id);
  if (f && (f.hidden = !S?.animations), u) {
    u.innerHTML = "";
    for (const [g, y] of (S?.animationNames || []).entries()) {
      const x = document.createElement("option");
      x.value = String(g), x.textContent = y, u.appendChild(x);
    }
    u.value = String(t.animation_index || 0);
  }
}
function vc(e) {
  const t = rt(e);
  if (!t) return;
  const a = (i, c) => {
    const d = e.root.querySelector(`[data-role="${i}"]`);
    if (!d || d.value === "") return c;
    const l = Number(d.value);
    return Number.isFinite(l) ? l : c;
  }, o = t.position || [0, 0, 0], r = t.rotation || [0, 0, 0], n = t.size || [1, 1, 1];
  t.position = [a("object-x", o[0]), a("object-y", o[1]), a("object-z", o[2])], t.rotation = [a("object-rx", r[0]), a("object-ry", r[1]), a("object-rz", r[2])], t.size = [Math.max(0.01, a("object-sx", n[0])), Math.max(0.01, a("object-sy", n[1])), Math.max(0.01, a("object-sz", n[2]))], e.commitObjectEdit(t), e.refreshObjects(), e.render();
}
function ir(e, t) {
  if (!t) return null;
  if (t.locked)
    return e.setStatus(s(`${t.name || t.type} is locked`)), null;
  t.keyframes ||= [];
  let a = nr(
    t.keyframes,
    e.frame,
    e.state.auto_key ? null : e.selectedKeyFrame,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, transform: $e(t), interpolation: e.root.querySelector('[data-role="interp"]')?.value || "ease" }, t.keyframes.push(a), t.keyframes.sort((o, r) => o.frame - r.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame, e.updateKeyVisualState()) : a && (e.selectedKeyFrame = a.frame, e.updateKeyVisualState()), a;
}
function xc(e, t) {
  const a = ir(e, t);
  a && (a.transform = $e(t)), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor();
}
function wc(e) {
  const t = globalThis.performance?.now?.() ?? Date.now();
  (!Number.isFinite(e.lastCameraHudEditAt) || t - e.lastCameraHudEditAt > 300) && e.checkpoint("Edit camera"), e.lastCameraHudEditAt = t;
  const a = (o, r) => {
    const n = e.root.querySelector(`[data-role="${o}"]`);
    if (!n || n.value === "") return r;
    const i = Number(n.value);
    return Number.isFinite(i) ? i : r;
  };
  e.camera.position = [a("camera-px", e.camera.position[0]), a("camera-py", e.camera.position[1]), a("camera-pz", e.camera.position[2])], e.camera.target = [a("camera-tx", e.camera.target[0]), a("camera-ty", e.camera.target[1]), a("camera-tz", e.camera.target[2])], e.camera.fov = P(a("camera-fov", e.camera.fov), 5, 150), e.camera.roll = P(a("camera-roll", e.camera.roll || 0), -180, 180), e.camera.near = Math.max(1e-4, a("camera-near", e.camera.near)), e.camera.far = Math.max(e.camera.near + 1e-4, a("camera-far", e.camera.far)), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
}
function kc(e, t) {
  const a = rt(e);
  if (!a) return;
  e.checkpoint("Set parent"), a.parent_id = t || null, e.serialize(), e.refreshObjects(), e.render();
  const o = e.state.objects.find((r) => r.id === t);
  e.setStatus(o ? s(`${a.name || a.type} parented to ${o.name || o.type}`) : s(`${a.name || a.type} unparented`));
}
function Sc(e, t) {
  const a = rt(e);
  a && (a.animation_index = Math.max(0, t || 0), e.serialize(), e.webgl?.selectAnimation(a.id, t), e.setStatus(s(`Animation: ${e.modelInfoById.get(a.id)?.animationNames?.[t] || t + 1}`)));
}
function Cc(e, t) {
  e.objectUrls.revoke(t), e.cardMediaById.delete(t), e.modelUrlsById.delete(t), e.modelInfoById.delete(t), e.webgl?.removeModel(t);
}
function jc(e, t) {
  return t(Za(e), e.frame);
}
function ve(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function xe(e) {
  return ve(e)?.keyframes || e.state.keyframes;
}
function _c(e, t) {
  for (const a of e.state.objects) {
    if (!a.keyframes?.length) continue;
    const o = t(a, e.frame);
    a.position = o.position, a.rotation = o.rotation, a.size = o.size;
  }
}
function $c(e) {
  e.checkpoint("Set keyframe");
  const t = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease", a = ve(e), o = xe(e), r = a ? { frame: e.frame, transform: $e(a), interpolation: t } : { frame: e.frame, camera: R(e.camera), interpolation: t }, n = o.findIndex((i) => i.frame === e.frame);
  n >= 0 ? o[n] = r : o.push(r), o.sort((i, c) => i.frame - c.frame), e.selectedKeyFrame = e.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([e.frame]), e.editingKeyFrame = null, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor(), e.setStatus(s(`${a?.name || "Camera"} ${n >= 0 ? "key updated" : "key inserted"} @ ${e.frame}`));
}
function Ec(e, t) {
  const a = Ee(e);
  if (!a) return;
  e.checkpoint("Change key interpolation"), a.interpolation = t;
  const o = e.root.querySelector('[data-role="key-interp"]');
  o && (o.value = t);
  for (const r of e.root.querySelectorAll("[data-interp]"))
    r.classList.toggle("active", r.dataset.interp === t);
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(s(`Key @ ${a.frame} interpolation set to ${t}`));
}
function Mc(e) {
  const t = ve(e), a = xe(e);
  if (!t && a.length <= 1) return e.setStatus(s("Keep at least one camera keyframe"));
  const o = Ee(e) || a.find((i) => i.frame === e.frame);
  if (!o) return e.setStatus(s("Select a keyframe to delete"));
  e.checkpoint("Delete keyframe"), t ? t.keyframes = a.filter((i) => i !== o) : e.state.keyframes = a.filter((i) => i !== o);
  const r = xe(e), n = o.frame;
  e.editingKeyFrame === n && (e.editingKeyFrame = null), e.selectedKeyFrame = r.length ? r.reduce((i, c) => Math.abs(c.frame - n) < Math.abs(i.frame - n) ? c : i).frame : null, e.camera = te(e.state, e.frame), e.applyObjectAnimationFrame(), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(s(`${t?.name || "Camera"} key deleted @ ${n}`));
}
function Ac(e) {
  const t = ve(e), a = Ee(e) || xe(e).find((o) => o.frame === e.frame);
  e.copiedKeyframe = t ? { kind: "object", transform: $e(a?.transform || t), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" } : { kind: "camera", camera: R(a?.camera || e.camera), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" }, e.setStatus(s(`Keyframe copied @ ${a?.frame ?? e.frame}`));
}
function Pc(e) {
  if (!e.copiedKeyframe) return e.setStatus(s("Copy a keyframe first"));
  const t = ve(e), a = t ? "object" : "camera";
  if (e.copiedKeyframe.kind !== a) return e.setStatus(s(`Copy a ${a} keyframe first`));
  e.checkpoint("Paste keyframe");
  const o = t ? { frame: e.frame, transform: $e(e.copiedKeyframe.transform), interpolation: e.copiedKeyframe.interpolation } : { frame: e.frame, camera: R(e.copiedKeyframe.camera), interpolation: e.copiedKeyframe.interpolation }, r = xe(e), n = r.findIndex((i) => i.frame === e.frame);
  n >= 0 ? r[n] = o : r.push(o), r.sort((i, c) => i.frame - c.frame), e.selectedKeyFrame = o.frame, e.editingKeyFrame = null, t ? (t.position = [...o.transform.position], t.rotation = [...o.transform.rotation], t.size = [...o.transform.size]) : e.camera = R(o.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(s(`Keyframe pasted @ ${o.frame}`));
}
function Ee(e) {
  return xe(e).find((t) => t.frame === e.selectedKeyFrame) || null;
}
function Fc(e, t) {
  t && (e.selectedKeyFrame = t.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([t.frame]), e.editingKeyFrame = null, e.setFrame(t.frame));
}
function zc(e) {
  const t = e.activeCameraTrack();
  if (t?.locked)
    return e.setStatus(s(`${t.name} is locked`)), null;
  let a = nr(
    e.state.keyframes,
    e.frame,
    !e.state.auto_key && e.selectedEntity === "camera" ? e.selectedKeyFrame : null,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, camera: R(e.camera), interpolation: e.root.querySelector('[data-role="key-interp"]')?.value || "ease" }, e.state.keyframes.push(a), e.state.keyframes.sort((o, r) => o.frame - r.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame) : a && (e.selectedKeyFrame = a.frame), e.cameraEditKey = a || null, e.cameraEditActive = !0, e.updateKeyVisualState(), a;
}
function Lc(e) {
  const t = e.cameraEditKey;
  t && (t.camera = R(e.camera), e.frame = t.frame, e.selectedKeyFrame = t.frame), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.render();
}
function Tc(e) {
  if (e.cameraEditActive) {
    if (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, e.selectedKeyFrame === null) {
      const t = e.state.keyframes.find((a) => a.frame === e.frame);
      t && (e.selectedKeyFrame = t.frame);
    }
    e.refreshKeys();
  }
}
function Kc(e, t = !1) {
  e.editingKeyFrame === null && (!t || e.selectedKeyFrame === null && !e.selectedKeyFrames?.size) || (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, t && (e.selectedKeyFrame = null, e.selectedKeyFrames = null), e.refreshKeys());
}
function Ic(e) {
  e.state.auto_key = !e.state.auto_key, e.state.auto_key || e.exitKeyEdit(!1), e.serialize(), e.updateEditState(), e.setStatus(s(`Auto Key ${e.state.auto_key ? "on" : "off"}`));
}
const Oc = ["guides", "safe-areas", "resolution-gate", "aspect-ratio"];
function qc(e) {
  const t = e.root.querySelector(".viewport-wrap"), a = e.editingKeyFrame !== null, o = !!e.state.auto_key;
  t && (t.classList.toggle("edit-mode", a), t.classList.toggle("auto-key", o));
  for (const p of e.root.querySelectorAll('[data-act="auto-key"]'))
    p.classList.toggle("active", o), p.setAttribute("aria-pressed", String(o)), p.title = s(`Auto Key ${o ? "on" : "off"}`);
  const r = e.state.view_mode === "camera";
  for (const p of Oc)
    for (const h of e.root.querySelectorAll(`[data-role="${p}"]`)) {
      h.disabled = !r;
      const f = h.closest("label");
      f && f.classList.toggle("oc-disabled", !r), h.title = r ? "" : s("Available in Camera View only");
    }
  const n = e.activeCameraTrack(), i = e.selectedObject(), c = e.root.querySelector('[data-role="tally-banner"]'), d = e.root.querySelector('[data-role="tally-text"]');
  if (c && d)
    if (a) {
      c.hidden = !1;
      const p = i ? i.name || i.type : n.name;
      d.textContent = `REC KEY @ F${e.editingKeyFrame} (${p})`;
    } else o ? (c.hidden = !1, d.textContent = `● AUTO-KEY ON (F${e.frame})`) : c.hidden = !0;
  const l = e.root.querySelector('[data-role="viewport-state"]');
  l && (a ? l.textContent = i ? `● EDITING ${i.name || i.type} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : `● EDITING ${n.name} @ F${e.editingKeyFrame}${o ? " · AUTO KEY" : ""}` : o ? l.textContent = i ? `● AUTO KEY · ${i.name || i.type}` : `● AUTO KEY · ${n.name}` : i ? l.textContent = `SELECTED: ${i.name || i.type}` : l.textContent = e.state.view_mode === "camera" ? `CAMERA: ${n.name}` : `VIEW: ${e.state.view_mode.toUpperCase()}`);
}
function Dc(e) {
  const t = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const a of e.root.querySelectorAll("[data-key-frame]")) {
    const o = Number(a.dataset.keyFrame);
    a.classList.toggle("selected", t.has(o)), a.classList.toggle("editing", o === e.editingKeyFrame), a.classList.toggle("at-playhead", o === e.frame);
  }
  e.updateEditState();
}
function Nc(e) {
  const t = ve(e), a = Ee(e), o = e.root.querySelector('[data-role="key-editor"]');
  o && (o.dataset.empty = String(!a));
  const r = e.root.querySelector('[data-role="selected-key-label"]');
  r && (r.textContent = a ? s(`${t?.name || "Camera"} Key @ ${a.frame}`) : s(`No ${t ? "object" : "camera"} key selected`));
  const n = ["key-frame", "key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"];
  for (const l of n) {
    const p = e.root.querySelector(`[data-role="${l}"]`);
    p && (p.disabled = !a || !!(t && !["key-frame", "key-interp"].includes(l)));
  }
  const i = e.root.querySelector('[data-act="update-key"]');
  i && (i.disabled = !a || !!t);
  const c = e.root.querySelector('[data-act="view-key"]');
  c && (c.disabled = !a || !!t);
  for (const l of e.root.querySelectorAll("[data-interp]"))
    l.classList.toggle("active", !!(a && l.dataset.interp === a.interpolation));
  if (!a) return;
  if (t) {
    const l = e.root.querySelector('[data-role="key-frame"]');
    l && document.activeElement !== l && (l.value = String(a.frame));
    const p = e.root.querySelector('[data-role="key-interp"]');
    p && document.activeElement !== p && (p.value = a.interpolation);
    return;
  }
  const d = {
    "key-frame": a.frame,
    "key-interp": a.interpolation,
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
  for (const [l, p] of Object.entries(d)) {
    const h = e.root.querySelector(`[data-role="${l}"]`);
    h && document.activeElement !== h && (h.value = String(p));
  }
}
function Rc(e, t, a = !1) {
  const o = Ee(e);
  if (!o) return;
  const r = xe(e);
  let n = P(Math.round(t), 0, e.state.duration_frames - 1);
  const i = (d) => r.some((l) => l !== o && l.frame === d);
  if (i(n) && a)
    for (let d = 1; d < e.state.duration_frames; d++) {
      const l = [n - d, n + d].filter((p) => p >= 0 && p < e.state.duration_frames).find((p) => !i(p));
      if (l !== void 0) {
        n = l;
        break;
      }
    }
  if (i(n))
    return e.refreshKeyEditor(), e.setStatus(s(`Frame ${n} already has a keyframe`));
  if (n === o.frame) return;
  const c = e.editingKeyFrame === o.frame;
  o.frame = n, e.selectedKeyFrame = n, e.editingKeyFrame = c ? n : null, e.frame = n, r.sort((d, l) => d.frame - l.frame), e.serialize(), e.setFrame(n), e.setStatus(s(`Keyframe moved to ${n}`));
}
function Bc(e) {
  const t = Ee(e);
  if (!t) return;
  if (e.editingKeyFrame = t.frame, ve(e)) {
    t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.transform = $e(ve(e)), e.serialize(), e.setFrame(t.frame), e.setStatus(s(`Object keyframe updated @ ${t.frame}`));
    return;
  }
  const a = (o, r) => {
    const n = Number(e.root.querySelector(`[data-role="${o}"]`).value);
    return Number.isFinite(n) ? n : r;
  };
  t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.camera.position = [a("key-px", t.camera.position[0]), a("key-py", t.camera.position[1]), a("key-pz", t.camera.position[2])], t.camera.target = [a("key-tx", t.camera.target[0]), a("key-ty", t.camera.target[1]), a("key-tz", t.camera.target[2])], t.camera.fov = P(a("key-fov", t.camera.fov), 5, 150), t.camera.roll = P(a("key-roll", t.camera.roll || 0), -180, 180), t.camera.zoom = Math.max(0.01, a("key-zoom", t.camera.zoom || 1)), t.camera.near = Math.max(1e-4, a("key-near", t.camera.near)), t.camera.far = Math.max(t.camera.near + 1e-4, a("key-far", t.camera.far)), t.camera.camera_type = e.root.querySelector('[data-role="key-camera-type"]').value, e.camera = R(t.camera), e.frame = t.frame, e.serialize(), e.setFrame(t.frame), e.setStatus(s(`Keyframe updated @ ${t.frame}`));
}
function Wc(e) {
  const t = Ee(e);
  t && (e.setFrame(t.frame), e.setStatus(s(`Loaded keyframe @ ${t.frame}`)));
}
function Hc(e, t) {
  const a = xe(e);
  if (!a.length) return;
  const o = t < 0 ? [...a].reverse().find((r) => r.frame < e.frame) || a[a.length - 1] : a.find((r) => r.frame > e.frame) || a[0];
  e.selectKeyframe(o);
}
const Vc = 220;
function go(e) {
  return JSON.stringify({
    background: e.viewport_bg_image || "",
    sequence: e.viewport_bg_sequence || [],
    objects: (e.objects || []).map((t) => [t.id, t.type, t.asset || ""])
  });
}
function Uc(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: d, dispatchDirectorKey: l, activeCameraTrack: p, bindWidgetCallbacks: h, playblastCameraTrack: f, restoreFromWidgets: u, serializeEditorState: v, syncActiveCameraTrack: S, syncFromWidgets: g, bind: y, activateCamera: x, addCamera: w, deleteCamera: j, drawPreviewOverlays: _, duplicateCamera: D, maximizeCameraPreview: A, refreshCameraPreviews: B, refreshCameraSelectors: z, renameCamera: I, setPlayblastCamera: ye, toggleCameraView: ae, captureRealtime: ne, makePlayblast: se, uploadDirectorPlayblast: me, waitForMediaFrame: pe, computeAudioPeaks: Z, loadAudioFile: E, stopPlay: Y, togglePlay: T, applyCameraPreset: F, applyCameraShake: N, applyProxyPreset: ie, clearViewportBgImage: q, loadViewportBgFile: W, loadViewportBgSequence: X, drawCameraPath: V, drawCard: be, drawCube: ue, drawGrid: we, drawHuman: fe, drawLine3D: J, drawNull: oe, drawOverlays: ce, drawPointField: re, drawSpeedHeatmap: U, drawSphere: ge, curveChannels: nt, drawCurveEditor: De, onCurvePointerDown: Ne, onCurvePointerMove: Re, onCurvePointerUp: Be, onTimelinePointerDown: st, onTimelinePointerMove: it, onTimelinePointerUp: ct, refreshKeys: We, resetCurveZoom: He, resetTimelineZoom: Ae, setChannelFilter: Ve, setCurveInterpolation: Ue, setTangentMode: Ge, timelineFrameFromEvent: lt, toggleCurveHandles: Xe, zoomCurve: dt, drawTransformGizmo: mt, frameTarget: pt, gizmoAxes: ft, gizmoGeometry: ht, onPointerDown: bt, onPointerMove: ut, onPointerUp: yt, onWheel: gt, pickGizmo: vt, pickSceneObject: xt, resetCamera: wt, setTransformMode: kt, setViewMode: St, viewportCamera: Ct, loadCardFile: jt, loadExecutionPreview: _t, loadMediaUrl: $t, loadModelFile: Et, loadSelectedReference: Mt, onModelLoaded: At, restoreAssets: Pt, syncUpstreamInputs: Ft, configureDomMedia: La, refreshSetupDiagnostic: zt, addMediaCard: Lt, addPrimitive: Tt, applyObjectAnimationFrame: Kt, beginCameraEdit: It, beginObjectEdit: Ot, commitCameraEdit: qt, commitObjectEdit: Dt, copyKeyframe: Nt, deleteKeyframe: Rt, deleteObject: Bt, duplicateObject: Wt, exitKeyEdit: Ht, finishCameraEdit: Vt, goToAdjacentKey: Ut, insertKeyframe: Gt, loadSelectedKeyView: Xt, pasteKeyframe: Yt, playblastCameraAtFrame: Zt, refreshInspector: Jt, refreshKeyEditor: Qt, refreshObjects: ea, removeObjectResources: ta, renameObject: aa, retimeSelectedKey: oa, selectKeyframe: ra, selectedKeyframe: na, selectedObject: sa, selectObjectAnimation: ia, setKeyInterpolation: ca, setObjectParent: la, timelineKeyframes: da, timelineObject: ma, toggleAutoKey: pa, toggleObject: fa, updateCameraFromHud: ha, updateEditState: ba, updateKeyVisualState: ua, updateSelectedKey: ya, updateSelectedObject: ga, clamp: Ye, cloneCamera: Ta, configureCore: Ka, defaultCamera: va, sampleCamera: ke, sampleObjectTransform: Me, sanitizeState: xa, worldTransform: wa } = e;
  return {
    setSelectMode(m) {
      if (["object", "vertex", "edge", "face"].includes(m)) {
        this.state.select_mode = m, this.subSelection = null;
        for (const b of this.root.querySelectorAll("[data-select-mode]")) {
          const k = b.dataset.selectMode === m;
          b.classList.toggle("active", k), b.setAttribute("aria-pressed", String(k));
        }
        for (const b of this.root.querySelectorAll('[data-role="select-mode"]'))
          b.value = m;
        this.serialize(), this.syncFromWidgets(), this.render(), this.setStatus(`Select Mode: ${m.toUpperCase()}`);
      }
    },
    refreshSetupDiagnostic() {
      zt(this);
    },
    hideInternalWidgets() {
      for (const m of ["state_json", "recording_path", "card_asset"]) {
        const b = this.node.widgets?.find((k) => k.name === m);
        b && (b.computeSize = () => [0, -4], b.draw = () => {
        }, b.hidden = !0, b.options = { ...b.options || {}, hideInVueNodes: !0 });
      }
    },
    restoreFromWidgets() {
      u(this);
    },
    restoreHistorySnapshot(m) {
      const b = JSON.parse(m), k = go(this.state), C = new Set(this.state.objects.map(($) => $.id));
      this.state = xa(b.state);
      const M = new Set(this.state.objects.map(($) => $.id));
      for (const $ of C) M.has($) || this.removeObjectResources($);
      this.frame = Ye(b.frame, 0, this.state.duration_frames - 1);
      const K = new Set(this.state.objects.map(($) => $.id)), G = Array.isArray(b.selectedObjectIds) ? b.selectedObjectIds : [b.selectedObjectId].filter(Boolean);
      this.selectedObjectIds = new Set(G.filter(($) => K.has($))), this.selectedObjectId = this.selectedObjectIds.has(b.selectedObjectId) ? b.selectedObjectId : [...this.selectedObjectIds].at(-1) || null, this.selectedEntity = this.selectedObjectIds.size ? "object" : b.selectedEntity || "camera";
      const le = new Set(this.timelineKeyframes().map(($) => $.frame)), L = Array.isArray(b.selectedKeyFrames) ? b.selectedKeyFrames : [b.selectedKeyFrame].filter(($) => $ != null);
      this.selectedKeyFrames = new Set(L.filter(($) => le.has($))), this.selectedKeyFrame = this.selectedKeyFrames.has(b.selectedKeyFrame) ? b.selectedKeyFrame : [...this.selectedKeyFrames].at(-1) ?? null, this.subSelection = b.subSelection || null, this.camera = ke(this.state, this.frame), this.cameraPreviewSignature = "", this.serialize(), k !== go(this.state) && this.restoreAssets(), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render();
    },
    checkpoint(m) {
      this.history.checkpoint(m);
    },
    undo() {
      const m = this.history.undo();
      m && this.setStatus(`Undo: ${m}`);
    },
    redo() {
      const m = this.history.redo();
      m && this.setStatus(`Redo: ${m}`);
    },
    bind() {
      y(this);
    },
    bindWidgetCallbacks() {
      h(this);
    },
    syncFromWidgets(m = !0) {
      g(this, m);
    },
    serialize() {
      v(this);
    },
    activeCameraTrack() {
      return p(this);
    },
    playblastCameraTrack() {
      return f(this);
    },
    syncActiveCameraTrack() {
      S(this);
    },
    refreshCameraSelectors() {
      z(this);
    },
    refreshCameraPreviews() {
      B(this);
    },
    addCamera() {
      w(this);
    },
    async renameCamera(m) {
      return I(this, m);
    },
    duplicateCamera(m) {
      D(this, m);
    },
    async deleteCamera(m) {
      return j(this, m);
    },
    activateCamera(m) {
      x(this, m);
    },
    setPlayblastCamera(m) {
      ye(this, m);
    },
    closeMenus(m = null) {
      for (const b of this.root.querySelectorAll(".toolbar-menu")) b !== m && (b.open = !1);
      this.hideContextMenu();
    },
    initializeTooltips() {
      n(this.root, this.interactionElement);
    },
    hideContextMenu() {
      this.contextMenu?.hide();
    },
    showContextMenu(m, b, k) {
      return this.contextMenu.show(m, b, k);
    },
    onContextMenu(m) {
      m.preventDefault(), m.stopPropagation(), m.stopImmediatePropagation?.();
      const b = m.target, k = b.closest?.(".camera-preview-tile"), C = b.closest?.(".scene-item"), M = b.closest?.(".key");
      if (k) return this.openCameraContext(m, k.dataset.cameraId, !0);
      if (C?.dataset.cameraId) return this.openCameraContext(m, C.dataset.cameraId, !1);
      if (C?.dataset.objectId) return this.openObjectContext(m, C.dataset.objectId);
      if (M) {
        const K = this.timelineKeyframes().find((G) => G.frame === Number(M.dataset.keyFrame));
        return K && this.selectKeyframe(K), this.openTimelineContext(m, !0);
      }
      if (b.closest?.('[data-role="keys"]'))
        return this.setFrame(this.timelineFrameFromEvent(m, b.closest('[data-role="keys"]'))), this.openTimelineContext(m, !1);
      if (b.closest?.(".curve-editor")) return this.openCurveContext(m);
      if (b.closest?.(".viewport-wrap")) {
        const K = this.interactionElement.getBoundingClientRect(), G = (m.clientX - K.left) * this.canvas.width / Math.max(1, K.width), le = (m.clientY - K.top) * this.canvas.height / Math.max(1, K.height), L = this.pickSceneObject([G, le]);
        if (L) {
          if ((L.type === "object" || L.type === "object_keyframe") && L.object)
            return this.selectedEntity = "object", this.selectedObjectId = L.object.id, L.keyframe ? (this.setFrame(L.keyframe.frame), this.selectedKeyFrame = L.keyframe.frame) : this.selectedKeyFrame = L.object.keyframes?.find(($) => $.frame === this.frame)?.frame ?? null, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.openObjectContext(m, L.object.id);
          if (["camera", "camera_target", "camera_keyframe"].includes(L.type) && L.camera)
            return this.selectedEntity = L.type === "camera_target" ? "camera_target" : "camera", this.selectedObjectId = null, this.activateCamera(L.camera.id), L.keyframe && (this.setFrame(L.keyframe.frame), this.selectedKeyFrame = L.keyframe.frame), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.openCameraContext(m, L.camera.id, !1);
        }
        return this.openViewportContext(m);
      }
    },
    openViewportContext(m) {
      const b = this.selectedObject();
      this.showContextMenu(m, "Viewport", [
        { label: b ? `Set key · ${b.name || b.type}` : `Set key · ${this.activeCameraTrack().name}`, icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: "Create camera from view", icon: "pi-video", run: () => this.addCamera() },
        { label: "Set camera target here", icon: "pi-bullseye", help: "Set camera Look-At target to this 3D point in the scene", run: () => this.setTargetAtCursor(m) },
        { label: "Frame subject", icon: "pi-search", shortcut: "F", run: () => this.frameTarget() },
        null,
        { label: "Create cube", icon: "pi-stop", run: () => this.addPrimitive("cube") },
        { label: "Create sphere", icon: "pi-circle", run: () => this.addPrimitive("sphere") },
        { label: "Create human proxy", icon: "pi-user", run: () => this.addPrimitive("human") },
        { label: "Create null", icon: "pi-plus", run: () => this.addPrimitive("null") },
        { label: "Create ground", icon: "pi-minus", run: () => this.addPrimitive("ground") },
        null,
        { label: "Show / hide camera previews", icon: "pi-images", run: () => this.toggleCameraView() },
        { label: "Record primary preview", icon: "pi-video", run: () => this.makePlayblast() },
        null,
        { label: "Clear caches & clean memory", icon: "pi-trash", run: () => this.clearCaches() }
      ]);
    },
    openObjectContext(m, b) {
      const k = this.state.objects.find((C) => C.id === b);
      k && (this.selectedEntity = "object", this.selectedObjectId = b, this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.showContextMenu(m, k.name || k.type, [
        { label: "Set key", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: "Rename object…", icon: "pi-pencil", run: () => this.renameObject(b) },
        { label: "Duplicate object", icon: "pi-copy", run: () => this.duplicateObject(b) },
        { label: k.enabled === !1 ? "Show object" : "Hide object", icon: k.enabled === !1 ? "pi-eye" : "pi-eye-slash", run: () => this.toggleObject(b) },
        null,
        { label: "Camera tracks this object (Look-At)", icon: "pi-bullseye", help: "Lock camera live look-at tracking to this moving object", run: () => this.aimAtSelectedObject(b) },
        { label: "Bake tracking to all camera keys", icon: "pi-check-square", help: "Write this object's motion into camera target keyframes", run: () => this.bakeAimToKeyframes() },
        { label: "Select hierarchy", icon: "pi-sitemap", shortcut: "Shift+G", help: "Select this object and all descendants", run: () => this.selectHierarchy(b) },
        null,
        { label: "Translation gizmo", icon: "pi-arrows-alt", run: () => this.setTransformMode("translate") },
        { label: "Rotation gizmo", icon: "pi-refresh", run: () => this.setTransformMode("rotate") },
        { label: "Scale gizmo", icon: "pi-expand", run: () => this.setTransformMode("scale") },
        null,
        { label: "Reset entire animation", icon: "pi-replay", help: "Delete every animation key and return position/rotation to zero", run: () => this.resetObjectAnimation(b) },
        null,
        { label: "Delete object", icon: "pi-trash", danger: !0, disabled: b === "subject", help: b === "subject" ? "The canonical subject card cannot be deleted" : "Delete this object and its animation keys", run: () => this.deleteObject(b) }
      ]));
    },
    openCameraContext(m, b, k = !1) {
      const C = this.state.cameras.find((M) => M.id === b);
      C && (this.selectedEntity = "camera", this.selectedObjectId = null, this.activateCamera(b), this.refreshObjects(), this.refreshKeys(), this.refreshInspector(), this.render(), this.showContextMenu(m, `${C.name}${k ? " preview" : ""}`, [
        { label: "Edit this camera", icon: "pi-video", run: () => this.activateCamera(b) },
        { label: "Set as primary / playblast", icon: "pi-star", disabled: b === this.state.playblast_camera_id, run: () => this.setPlayblastCamera(b) },
        { label: "Set key at playhead", icon: "pi-key", shortcut: "I", run: () => {
          this.activateCamera(b), this.insertKeyframe();
        } },
        { label: "Record this preview", icon: "pi-circle-fill", run: () => {
          this.setPlayblastCamera(b), this.makePlayblast();
        } },
        { label: this.state.maximized_camera_id === b ? "Restore preview size" : "Maximize preview", icon: "pi-window-maximize", run: () => this.maximizeCameraPreview(b) },
        null,
        { label: "Shot: move earlier", icon: "pi-arrow-up", disabled: this.state.cameras.findIndex((M) => M.id === b) <= 0, run: () => this.moveShot(b, -1) },
        { label: "Shot: move later", icon: "pi-arrow-down", disabled: this.state.cameras.findIndex((M) => M.id === b) >= this.state.cameras.length - 1, run: () => this.moveShot(b, 1) },
        { label: "Shot handles…", icon: "pi-sliders-h", run: () => this.editShotHandles(b) },
        null,
        { label: "Rename camera…", icon: "pi-pencil", run: () => this.renameCamera(b) },
        { label: "Duplicate camera", icon: "pi-copy", run: () => this.duplicateCamera(b) },
        { label: "Create camera from current view", icon: "pi-plus", run: () => this.addCamera() },
        null,
        { label: "Reset entire animation", icon: "pi-replay", help: "Delete every camera key and return to a static zero pose at frame 0", run: () => this.resetCameraAnimation(b) },
        null,
        { label: "Delete camera", icon: "pi-trash", danger: !0, disabled: this.state.cameras.length <= 1, run: () => this.deleteCamera(b) }
      ]));
    },
    moveShot(m, b) {
      const k = this.state.cameras.findIndex((K) => K.id === m), C = k + b;
      if (k < 0 || C < 0 || C >= this.state.cameras.length) return;
      this.checkpoint("Reorder shot");
      const [M] = this.state.cameras.splice(k, 1);
      this.state.cameras.splice(C, 0, M), this.cameraPreviewSignature = "", this.serialize(), this.refreshObjects(), this.refreshKeys(), this.renderCameraView(), this.setStatus(`Shot order: ${M.name} → #${C + 1}`);
    },
    async editShotHandles(m) {
      const b = this.state.cameras.find((K) => K.id === m);
      if (!b) return;
      const k = b.handles || { in: 0, out: 0 }, C = await i(t, "Shot handles", "Handle frames: in,out", `${k.in},${k.out}`);
      if (C == null) return;
      const M = String(C).match(/^\s*(\d+)\s*[,;\s]\s*(\d+)\s*$/);
      if (!M) return this.setStatus("Handles must be two integers: in,out");
      this.checkpoint("Shot handles"), b.handles = { in: Math.min(600, Number(M[1])), out: Math.min(600, Number(M[2])) }, this.serialize(), this.setStatus(`${b.name} handles: ${b.handles.in} / ${b.handles.out}`);
    },
    openTimelineContext(m, b) {
      this.showContextMenu(m, b ? `Keyframe F${this.selectedKeyFrame}` : `Timeline F${this.frame}`, [
        { label: "Fit timeline view (F)", icon: "pi-arrows-alt", shortcut: "F", run: () => Ae(this) },
        { label: "Set / replace key", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: "Delete selected key", icon: "pi-trash", shortcut: "Delete", danger: !0, disabled: !this.selectedKeyframe(), run: () => this.deleteKeyframe() },
        { label: "Copy selected key", icon: "pi-copy", shortcut: "Ctrl+C", disabled: !this.selectedKeyframe(), run: () => this.copyKeyframe() },
        { label: "Paste key at playhead", icon: "pi-clipboard", shortcut: "Ctrl+V", disabled: !this.copiedKeyframe, run: () => this.pasteKeyframe() },
        null,
        { label: "Previous key", icon: "pi-fast-backward", shortcut: ",", run: () => this.goToAdjacentKey(-1) },
        { label: "Next key", icon: "pi-fast-forward", shortcut: ".", run: () => this.goToAdjacentKey(1) },
        { label: this.state.auto_key ? "Disable Auto Key" : "Enable Auto Key", icon: "pi-circle-fill", run: () => this.toggleAutoKey() },
        null,
        { label: "Add marker at playhead", icon: "pi-bookmark", run: () => this.addMarker() },
        ...(this.state.markers || []).length ? [{ label: "Remove nearest marker", icon: "pi-bookmark-fill", danger: !0, run: () => this.removeNearestMarker() }] : []
      ]);
    },
    addMarker() {
      if ((this.state.markers || []).find((b) => b.frame === this.frame)) return this.setStatus(`Marker already at F${this.frame}`);
      this.checkpoint("Add marker"), this.state.markers = [...this.state.markers || [], { frame: this.frame, name: `Marker ${(this.state.markers || []).length + 1}`, color: "#f2d06b" }].sort((b, k) => b.frame - k.frame), this.serialize(), this.refreshKeys(), this.setStatus(`Marker @ F${this.frame}`);
    },
    removeNearestMarker() {
      const m = this.state.markers || [];
      if (!m.length) return;
      const b = m.reduce((k, C) => Math.abs(C.frame - this.frame) < Math.abs(k.frame - this.frame) ? C : k);
      this.checkpoint("Remove marker"), this.state.markers = m.filter((k) => k !== b), this.serialize(), this.refreshKeys(), this.setStatus(`Marker removed @ F${b.frame}`);
    },
    openCurveContext(m) {
      this.showContextMenu(m, "Curve editor", [
        { label: "Fit all curves (Framing)", icon: "pi-arrows-alt", shortcut: "F", run: () => He(this) },
        { label: "Set key at playhead", icon: "pi-key", shortcut: "I", run: () => this.insertKeyframe() },
        { label: this.showCurveHandles ? "Hide Bézier handles" : "Show Bézier handles", icon: "pi-share-alt", run: () => this.toggleCurveHandles() },
        null,
        ...["bezier", "smooth", "linear", "ease_in", "ease_out", "ease"].map((b) => ({ label: `Interpolation: ${b.replaceAll("_", " ")}`, icon: "pi-chart-line", disabled: !this.selectedKeyframe(), run: () => this.setCurveInterpolation(b) })),
        null,
        ...["auto", "vector", "free", "aligned", "flat"].map((b) => ({ label: `Tangents: ${b[0].toUpperCase()}${b.slice(1)}`, icon: "pi-share-alt", disabled: !this.selectedKeyframe(), run: () => this.setTangentMode(b) })),
        null,
        { label: "Delete selected key", icon: "pi-trash", danger: !0, disabled: !this.selectedKeyframe(), run: () => this.deleteKeyframe() }
      ]);
    },
    scheduleResizeAndRender() {
      this.resizeScheduled || (this.resizeScheduled = !0, this.resizeFrame = requestAnimationFrame(() => {
        this.resizeScheduled = !1, !this.disposed && (this.resizeCanvas(), this.render());
      }));
    },
    resizeCanvas() {
      const m = this.root.querySelector(".viewport-wrap");
      if (!m) return;
      const b = Math.min(2, window.devicePixelRatio || 1), k = m.clientWidth || 320, C = m.clientHeight || 180, M = Math.max(320, Math.round(k * b)), K = Math.max(180, Math.round(C * b));
      (this.canvas.width !== M || this.canvas.height !== K) && (this.canvas.width = M, this.canvas.height = K);
      for (const G of this.cameraPreviewCanvases.values()) {
        const le = G.clientWidth || 220, L = G.clientHeight || 124, $ = Math.max(b, Vc / Math.max(1, le)), Se = Math.max(1, Math.round(le * $)), Ze = Math.max(1, Math.round(L * $));
        (G.width !== Se || G.height !== Ze) && (G.width = Se, G.height = Ze);
      }
      this.drawCurveEditor();
    }
  };
}
function cr(e) {
  e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshKeyEditor(), e.refreshInspector(), e.drawCurveEditor(), e.render();
}
function Gc(e, t) {
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a) return;
  e.checkpoint("Reset camera animation"), e.finishCameraEdit();
  const o = So();
  o.position = [0, 0, 0], o.target = [0, 0, -1], a.camera = R(o), a.keyframes = [{ frame: 0, camera: R(o), interpolation: "ease" }], e.state.active_camera_id = a.id, e.state.camera = R(o), e.state.keyframes = a.keyframes, e.camera = R(o), e.frame = 0, e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = 0, e.editingKeyFrame = null, e.cameraEditKey = null, e.cameraEditActive = !1, e.cameraPreviewSignature = "", cr(e), e.refreshCameraSelectors(), e.setStatus(s(`${a.name} animation reset`));
}
function Xc(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  a && (e.checkpoint("Reset object animation"), a.keyframes = [], a.position = [0, 0, 0], a.rotation = [0, 0, 0], e.frame = 0, e.selectedEntity = "object", e.selectedObjectId = a.id, e.selectedKeyFrame = null, e.editingKeyFrame = null, cr(e), e.setStatus(s(`${a.name || a.type} animation reset`)));
}
function Yc(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: d, dispatchDirectorKey: l, activeCameraTrack: p, bindWidgetCallbacks: h, playblastCameraTrack: f, restoreFromWidgets: u, serializeEditorState: v, syncActiveCameraTrack: S, syncFromWidgets: g, bind: y, activateCamera: x, addCamera: w, deleteCamera: j, drawPreviewOverlays: _, duplicateCamera: D, maximizeCameraPreview: A, refreshCameraPreviews: B, refreshCameraSelectors: z, renameCamera: I, setPlayblastCamera: ye, toggleCameraView: ae, captureRealtime: ne, makePlayblast: se, uploadDirectorPlayblast: me, waitForMediaFrame: pe, computeAudioPeaks: Z, loadAudioFile: E, stopPlay: Y, togglePlay: T, applyCameraPreset: F, applyCameraShake: N, applyProxyPreset: ie, clearViewportBgImage: q, loadViewportBgFile: W, loadViewportBgSequence: X, drawCameraPath: V, drawCard: be, drawCube: ue, drawGrid: we, drawHuman: fe, drawLine3D: J, drawNull: oe, drawOverlays: ce, drawPointField: re, drawSpeedHeatmap: U, drawSphere: ge, curveChannels: nt, drawCurveEditor: De, onCurvePointerDown: Ne, onCurvePointerMove: Re, onCurvePointerUp: Be, onTimelinePointerDown: st, onTimelinePointerMove: it, onTimelinePointerUp: ct, refreshKeys: We, resetCurveZoom: He, resetTimelineZoom: Ae, setChannelFilter: Ve, setCurveInterpolation: Ue, setTangentMode: Ge, timelineFrameFromEvent: lt, toggleCurveHandles: Xe, zoomCurve: dt, drawTransformGizmo: mt, frameTarget: pt, gizmoAxes: ft, gizmoGeometry: ht, onPointerDown: bt, onPointerMove: ut, onPointerUp: yt, onWheel: gt, pickGizmo: vt, pickSceneObject: xt, resetCamera: wt, setTransformMode: kt, setViewMode: St, viewportCamera: Ct, loadCardFile: jt, loadExecutionPreview: _t, loadMediaUrl: $t, loadModelFile: Et, loadSelectedReference: Mt, onModelLoaded: At, restoreAssets: Pt, syncUpstreamInputs: Ft, configureDomMedia: La, refreshSetupDiagnostic: zt, addMediaCard: Lt, addPrimitive: Tt, applyObjectAnimationFrame: Kt, beginCameraEdit: It, beginObjectEdit: Ot, commitCameraEdit: qt, commitObjectEdit: Dt, copyKeyframe: Nt, deleteKeyframe: Rt, deleteObject: Bt, duplicateObject: Wt, exitKeyEdit: Ht, finishCameraEdit: Vt, goToAdjacentKey: Ut, insertKeyframe: Gt, loadSelectedKeyView: Xt, pasteKeyframe: Yt, playblastCameraAtFrame: Zt, refreshInspector: Jt, refreshKeyEditor: Qt, refreshObjects: ea, removeObjectResources: ta, renameObject: aa, retimeSelectedKey: oa, selectKeyframe: ra, selectedKeyframe: na, selectedObject: sa, selectObjectAnimation: ia, setKeyInterpolation: ca, setObjectParent: la, timelineKeyframes: da, timelineObject: ma, toggleAutoKey: pa, toggleObject: fa, updateCameraFromHud: ha, updateEditState: ba, updateKeyVisualState: ua, updateSelectedKey: ya, updateSelectedObject: ga, clamp: Ye, cloneCamera: Ta, configureCore: Ka, defaultCamera: va, sampleCamera: ke, sampleObjectTransform: Me, sanitizeState: xa, worldTransform: wa } = e;
  return {
    setChannelFilter(m) {
      Ve(this, m);
    },
    setFrame(m, b = !1, k = !0) {
      this.frame = Ye(Math.round(m), 0, this.state.duration_frames - 1), this.editingKeyFrame !== this.frame && (this.editingKeyFrame = null), this.camera = ke(this.activeCameraTrack(), this.frame, this.state.objects), Wa(this, this.activeCameraTrack(), this.camera, this.frame), this.applyObjectAnimationFrame();
      for (const $ of this.root.querySelectorAll('[data-role="frame"]')) document.activeElement !== $ && ($.value = String(this.frame));
      for (const $ of this.root.querySelectorAll('[data-role="scrub"]')) $.value = String(this.frame);
      for (const $ of this.root.querySelectorAll('[data-role="camera-fov"]')) document.activeElement !== $ && ($.value = String(Math.round(this.camera.fov * 100) / 100));
      for (const $ of this.root.querySelectorAll('[data-role="camera-roll"]')) document.activeElement !== $ && ($.value = String(Math.round((this.camera.roll || 0) * 100) / 100));
      for (const $ of this.root.querySelectorAll('[data-role="camera-focal"]')) document.activeElement !== $ && ($.value = jo(this.camera.fov));
      for (const $ of this.root.querySelectorAll('[data-role="viewport-zoom"]')) $.textContent = `${(Number(this.camera.zoom) || 1).toFixed(2)}x`;
      for (const $ of this.root.querySelectorAll('[data-role="camera-type"]')) document.activeElement !== $ && ($.value = this.camera.camera_type || "perspective");
      const C = this.frame / this.state.fps;
      for (const $ of this.cardMediaById.values()) $ instanceof HTMLVideoElement && Number.isFinite($.duration) && $.duration > 0 && ($.currentTime = C % $.duration);
      const M = Math.floor(C / 60), K = Math.floor(C % 60), G = Math.floor(C % 1 * 1e3), le = this.frame % Math.max(1, Math.round(this.state.fps)), L = Math.floor(this.frame / this.state.fps);
      if (this.root.querySelector('[data-role="time"]').textContent = this.state.timecode_mode === "timecode" ? `${String(Math.floor(L / 3600)).padStart(2, "0")}:${String(Math.floor(L / 60) % 60).padStart(2, "0")}:${String(L % 60).padStart(2, "0")}:${String(le).padStart(2, "0")}` : `${String(M).padStart(2, "0")}:${String(K).padStart(2, "0")}.${String(G).padStart(3, "0")}`, k) this.refreshKeys();
      else {
        Aa(this);
        for (const $ of this.root.querySelectorAll("[data-key-frame]")) {
          const Se = Number($.dataset.keyFrame);
          $.classList.toggle("at-playhead", Se === this.frame), $.classList.toggle("selected", Se === this.selectedKeyFrame), $.classList.toggle("editing", Se === this.editingKeyFrame);
        }
        this.refreshKeyEditor(), this.drawCurveEditor();
      }
      b || this.serialize(), this.refreshInspector(), this.render();
    },
    timelineObject() {
      return ma(this);
    },
    timelineKeyframes() {
      return da(this);
    },
    // The camera key the playhead is parked on, or null when between keys.
    //
    // The Lens presets, the FOV field, the Roll field and the new-key
    // interpolation select all branch on this: sitting on a key edits that key,
    // otherwise the edit lands on the live camera as a transient preview.
    activeKeyframe() {
      return (this.activeCameraTrack()?.keyframes || []).find((b) => b.frame === this.frame) || null;
    },
    applyObjectAnimationFrame() {
      Kt(this, Me);
    },
    insertKeyframe() {
      for (const m of this.root.querySelectorAll('[data-act="key"]'))
        m.classList.remove("key-pulse"), m.offsetWidth, m.classList.add("key-pulse");
      Gt(this);
    },
    setKeyInterpolation(m) {
      ca(this, m);
    },
    deleteKeyframe() {
      Rt(this);
    },
    copyKeyframe() {
      Nt(this);
    },
    pasteKeyframe() {
      Yt(this);
    },
    resetCamera() {
      wt(this, va);
    },
    resetCameraAnimation(m) {
      Gc(this, m);
    },
    resetObjectAnimation(m) {
      Xc(this, m);
    },
    selectedKeyframe() {
      return na(this);
    },
    selectKeyframe(m) {
      ra(this, m);
    },
    beginCameraEdit() {
      return It(this);
    },
    commitCameraEdit() {
      qt(this);
    },
    finishCameraEdit() {
      Vt(this);
    },
    exitKeyEdit(m = !1) {
      Ht(this, m);
    },
    toggleAutoKey() {
      pa(this);
    },
    updateEditState() {
      ba(this);
    },
    updateKeyVisualState() {
      ua(this);
    },
    curveChannels() {
      return nt(this);
    },
    drawCurveEditor() {
      De(this);
    },
    onCurvePointerDown(m) {
      Ne(this, m);
    },
    onCurvePointerMove(m) {
      Re(this, m);
    },
    onCurvePointerUp(m) {
      Be(this, m);
    },
    setCurveInterpolation(m) {
      Ue(this, m);
    },
    setTangentMode(m) {
      Ge(this, m);
    },
    toggleCurveHandles() {
      Xe(this);
    },
    onTimelineWheel(m) {
      onTimelineWheel(this, m);
    },
    resetTimelineZoom() {
      Ae(this);
    },
    toggleInspector(m) {
      const b = this.root.querySelector('[data-role="viewport-inspector"]');
      if (!b) return;
      const k = m !== void 0 ? m : b.dataset.collapsed !== "true";
      b.dataset.collapsed = String(k);
      for (const C of this.root.querySelectorAll('[data-act="toggle-inspector"]'))
        C.classList.toggle("active", !k), C.setAttribute("aria-pressed", String(!k));
      this.setStatus(k ? "Inspector hidden (N)" : "Inspector shown");
    },
    refreshKeys() {
      We(this);
    },
    refreshKeyEditor() {
      Qt(this);
    },
    retimeSelectedKey(m, b = !1) {
      oa(this, m, b);
    },
    updateSelectedKey() {
      ya(this);
    },
    updateKeyFromView() {
      updateKeyFromView(this);
    },
    loadSelectedKeyView() {
      Xt(this);
    },
    goToAdjacentKey(m) {
      Ut(this, m);
    },
    addPrimitive(m) {
      Tt(this, m);
    },
    async renameObject(m) {
      return aa(this, m);
    },
    duplicateObject(m) {
      Wt(this, m);
    },
    toggleObject(m) {
      fa(this, m);
    },
    showAllObjects() {
      const m = this.state.objects.filter((b) => b.enabled === !1);
      if (m.length) {
        this.checkpoint("Show all objects");
        for (const b of m) b.enabled = !0;
        this.serialize(), this.refreshObjects(), this.render(), this.setStatus("All objects shown");
      }
    },
    selectHierarchy(m = this.selectedObjectId) {
      if (!m) return;
      const b = /* @__PURE__ */ new Set([m]);
      let k = !0;
      for (; k; ) {
        k = !1;
        for (const C of this.state.objects)
          C.parent_id && b.has(C.parent_id) && !b.has(C.id) && (b.add(C.id), k = !0);
      }
      this.selectedObjectIds = b, this.selectedObjectId = m, this.selectedEntity = "object", this.refreshObjects(), this.refreshInspector(), this.render(), this.setStatus(`Hierarchy selected: ${b.size} object(s)`);
    },
    async deleteObject(m) {
      return Bt(this, m);
    },
    addMediaCard() {
      Lt(this);
    },
    selectedObject() {
      return sa(this);
    },
    playblastCameraAtFrame() {
      return Wa(this, f(this), Zt(this, ke), this.frame);
    },
    viewportCamera() {
      return Ct(this);
    },
    setViewMode(m) {
      St(this, m);
    },
    toggleCameraView() {
      ae(this);
    },
    setDensity(m) {
      ["basic", "animation", "advanced"].includes(m) || (m = "advanced"), this.state.ui_density = m, this.root.dataset.density = m, this.root.querySelector('[data-role="ui-density"]').value = m;
      const b = this.root.querySelector(".inspector-tab.active");
      b && getComputedStyle(b).display === "none" && this.root.querySelector('[data-tab="scene"]')?.click(), this.serialize(), requestAnimationFrame(() => {
        this.resizeCanvas(), this.render();
      }), this.setStatus(`Interface: ${m}`);
    },
    lookAtObject(m) {
      const b = this.state.objects.find((k) => k.id === m);
      if (b) {
        this.checkpoint("Look-at constraint");
        for (const k of this.state.cameras)
          for (const C of k.keyframes) C.camera.target = [...b.position || [0, 1.5, 0]];
        this.camera = ke(this.state, this.frame), this.serialize(), this.refreshKeys(), this.render(), this.setStatus(`Cameras look at ${b.name || b.type}`);
      }
    },
    setTransformMode(m) {
      kt(this, m);
    },
    refreshInspector() {
      Jt(this);
    },
    updateSelectedObject() {
      ga(this);
    },
    beginObjectEdit(m) {
      return Ot(this, m);
    },
    commitObjectEdit(m) {
      Dt(this, m);
    },
    updateCameraFromHud() {
      ha(this);
    },
    selectObjectAnimation(m) {
      ia(this, m);
    },
    setObjectParent(m) {
      la(this, m);
    },
    applyProxyPreset(m) {
      const b = { balanced: { mode: "omni_ref", burn: !1 }, parallax: { mode: "point_field", burn: !1 }, subject: { mode: "card_grid", burn: !1 }, debug: { mode: "omni_ref", burn: !0 } }, k = b[m] || b.balanced;
      this.state.render_mode = k.mode, this.state.burn_in = k.burn, this.root.querySelector('[data-role="mode"]').value = k.mode, this.root.querySelector('[data-role="burn-in"]').checked = k.burn, this.modeWidget && (this.modeWidget.value = k.mode), this.serialize(), this.render(), this.setStatus(`Proxy preset: ${m}`);
    },
    createH3Setup() {
      this.setStatus("Connect Motion Scene and Playblast Video to OmniCam Monitor");
    },
    refreshObjects() {
      ea(this);
    },
    removeObjectResources(m) {
      ta(this, m);
    },
    aimAtSelectedObject(m) {
      this.checkpoint("Aim & track subject");
      const b = this.activeCameraTrack(), k = m && this.state.objects.find((K) => K.id === m) || this.selectedObject() || this.state.objects.find((K) => K.id === "subject") || this.state.objects[0];
      if (!k) return;
      b.target_object_id !== k.id && (b.aim_bone = null), b.target_object_id = k.id, b.id === this.state.active_camera_id && (this.state.target_object_id = k.id, this.state.aim_bone = b.aim_bone);
      const M = (k.type === "model" || k.type === "glb" ? this.webgl?.getObjectWorldCenter?.(k.id) : null) || (k.keyframes?.length ? Me(k, this.frame).position : k.position || [0, 1.5, 0]);
      this.camera.target = [...M], this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit(), this.serialize(), this.refreshInspector(), this.updateHudCamera(), this.render(), this.setStatus(`Camera tracking locked to ${k.name || k.id}`);
    },
    setAimBone(m) {
      cc(this, m);
    },
    bakeAimConstraint(m) {
      lc(this, m);
    },
    setCameraTrackingTarget(m) {
      this.checkpoint("Change camera tracking target");
      const b = this.activeCameraTrack();
      if (b.target_object_id !== (m || null) && (b.aim_bone = null), b.target_object_id = m || null, b.id === this.state.active_camera_id && (this.state.target_object_id = m || null, this.state.aim_bone = b.aim_bone), m) {
        const k = this.state.objects.find((C) => C.id === m);
        if (k) {
          const M = (k.type === "model" || k.type === "glb" ? this.webgl?.getObjectWorldCenter?.(k.id) : null) || (k.keyframes?.length ? Me(k, this.frame).position : k.position || [0, 1.5, 0]);
          this.camera.target = [...M], this.beginCameraEdit(), this.commitCameraEdit(), this.finishCameraEdit();
        }
      }
      this.serialize(), this.refreshInspector(), this.render(), this.setStatus(m ? `Camera tracking: ${m}` : "Camera tracking disabled (manual target)");
    },
    bakeAimToKeyframes() {
      this.checkpoint("Bake aim to keyframes");
      const m = this.activeCameraTrack(), b = m.target_object_id || this.state.target_object_id || "subject", k = this.state.objects.find((M) => M.id === b) || this.state.objects[0];
      if (!k || !m.keyframes?.length) return;
      const C = k.type === "model" || k.type === "glb" ? this.webgl?.getObjectWorldCenter?.(k.id) : null;
      for (const M of m.keyframes) {
        const K = (k.type === "model" || k.type === "glb") && C && !k.keyframes?.length ? C : k.keyframes?.length ? Me(k, M.frame).position : k.position || [0, 1.5, 0];
        M.camera.target = [...K];
      }
      m.id === this.state.active_camera_id && (this.state.keyframes = m.keyframes), this.serialize(), this.refreshKeys(), this.refreshInspector(), this.render(), this.setStatus(`Aim baked across all keyframes following ${k.name || k.id}`);
    }
  };
}
function Zc(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: d, dispatchDirectorKey: l, activeCameraTrack: p, bindWidgetCallbacks: h, playblastCameraTrack: f, restoreFromWidgets: u, serializeEditorState: v, syncActiveCameraTrack: S, syncFromWidgets: g, bind: y, activateCamera: x, addCamera: w, deleteCamera: j, drawPreviewOverlays: _, duplicateCamera: D, maximizeCameraPreview: A, refreshCameraPreviews: B, refreshCameraSelectors: z, renameCamera: I, setPlayblastCamera: ye, toggleCameraView: ae, captureRealtime: ne, makePlayblast: se, uploadDirectorPlayblast: me, waitForMediaFrame: pe, computeAudioPeaks: Z, loadAudioFile: E, stopPlay: Y, togglePlay: T, applyCameraPreset: F, applyCameraShake: N, applyProxyPreset: ie, clearViewportBgImage: q, loadViewportBgFile: W, loadViewportBgSequence: X, drawCameraPath: V, drawCard: be, drawCube: ue, drawGrid: we, drawHuman: fe, drawLine3D: J, drawNull: oe, drawOverlays: ce, drawPointField: re, drawSpeedHeatmap: U, drawSphere: ge, curveChannels: nt, drawCurveEditor: De, onCurvePointerDown: Ne, onCurvePointerMove: Re, onCurvePointerUp: Be, onTimelinePointerDown: st, onTimelinePointerMove: it, onTimelinePointerUp: ct, refreshKeys: We, resetCurveZoom: He, resetTimelineZoom: Ae, setChannelFilter: Ve, setCurveInterpolation: Ue, setTangentMode: Ge, timelineFrameFromEvent: lt, toggleCurveHandles: Xe, zoomCurve: dt, drawTransformGizmo: mt, frameTarget: pt, gizmoAxes: ft, gizmoGeometry: ht, onPointerDown: bt, onPointerMove: ut, onPointerUp: yt, onWheel: gt, pickGizmo: vt, pickSceneObject: xt, resetCamera: wt, setTransformMode: kt, setViewMode: St, viewportCamera: Ct, loadCardFile: jt, loadExecutionPreview: _t, loadMediaUrl: $t, loadModelFile: Et, loadSelectedReference: Mt, onModelLoaded: At, restoreAssets: Pt, syncUpstreamInputs: Ft, configureDomMedia: La, refreshSetupDiagnostic: zt, addMediaCard: Lt, addPrimitive: Tt, applyObjectAnimationFrame: Kt, beginCameraEdit: It, beginObjectEdit: Ot, commitCameraEdit: qt, commitObjectEdit: Dt, copyKeyframe: Nt, deleteKeyframe: Rt, deleteObject: Bt, duplicateObject: Wt, exitKeyEdit: Ht, finishCameraEdit: Vt, goToAdjacentKey: Ut, insertKeyframe: Gt, loadSelectedKeyView: Xt, pasteKeyframe: Yt, playblastCameraAtFrame: Zt, refreshInspector: Jt, refreshKeyEditor: Qt, refreshObjects: ea, removeObjectResources: ta, renameObject: aa, retimeSelectedKey: oa, selectKeyframe: ra, selectedKeyframe: na, selectedObject: sa, selectObjectAnimation: ia, setKeyInterpolation: ca, setObjectParent: la, timelineKeyframes: da, timelineObject: ma, toggleAutoKey: pa, toggleObject: fa, updateCameraFromHud: ha, updateEditState: ba, updateKeyVisualState: ua, updateSelectedKey: ya, updateSelectedObject: ga, clamp: Ye, cloneCamera: Ta, configureCore: Ka, defaultCamera: va, sampleCamera: ke, sampleObjectTransform: Me, sanitizeState: xa, worldTransform: wa } = e;
  return {
    setTargetAtCursor(m) {
      if (!m) return;
      const b = this.interactionElement.getBoundingClientRect(), k = (m.clientX - b.left) * this.canvas.width / Math.max(1, b.width), C = (m.clientY - b.top) * this.canvas.height / Math.max(1, b.height), M = this.webgl?.intersectScenePoint?.(k, C, this.canvas.width, this.canvas.height);
      M && (this.checkpoint("Set camera target"), this.beginCameraEdit(), this.camera.target = [
        Math.round(M[0] * 1e3) / 1e3,
        Math.round(M[1] * 1e3) / 1e3,
        Math.round(M[2] * 1e3) / 1e3
      ], this.commitCameraEdit(), this.finishCameraEdit(), this.updateHudCamera(), this.refreshInspector(), this.render(), this.setStatus(`Target set to [${this.camera.target.join(", ")}]`));
    },
    focusCameraTarget() {
      this.frameTarget();
    },
    updateHudCamera() {
      this.refreshInspector();
    },
    togglePlay() {
      T(this);
    },
    stopPlay() {
      Y(this);
    },
    computeAudioPeaks() {
      Z(this);
    },
    async loadAudioFile(m) {
      return E(this, m);
    },
    applyCameraPreset(m) {
      F(this, m);
    },
    applyCameraShake(m) {
      N(this, m);
    },
    applyProxyPreset(m) {
      ie(this, m);
    },
    clearCaches() {
      if (this.checkpoint("Clear caches"), this.objectUrls?.clear(), this.audioSource) {
        try {
          this.audioSource.stop();
        } catch {
        }
        this.audioSource = null;
      }
      if (this.audioContext?.close?.().catch?.(() => {
      }), this.audioContext = null, this.webgl) {
        for (const m of this.webgl.models.values())
          try {
            m.scene && disposeObject(m.scene, !0);
          } catch {
          }
        this.webgl.models.clear(), this.webgl.modelLoads.clear(), this.webgl.sceneKey = "", this.webgl.mediaSignature = "", this.webgl.modelSignature = "", this.webgl.pathKey = "", this.webgl.bgLoadGeneration += 1, this.webgl.bgTextureLoads?.clear();
        for (const m of new Set(this.webgl.bgTextureCache?.values() || []))
          try {
            m.dispose();
          } catch {
          }
        this.webgl.bgTextureCache?.clear(), this.webgl.bgTexture = null, this.webgl.bgImageUrl = "";
      }
      if (this.cameraWebgl) {
        for (const m of this.cameraWebgl.models.values())
          try {
            m.scene && disposeObject(m.scene, !0);
          } catch {
          }
        this.cameraWebgl.models.clear(), this.cameraWebgl.modelLoads.clear(), this.cameraWebgl.sceneKey = "", this.cameraWebgl.mediaSignature = "", this.cameraWebgl.modelSignature = "", this.cameraWebgl.pathKey = "", this.cameraWebgl.bgLoadGeneration += 1, this.cameraWebgl.bgTextureLoads?.clear();
        for (const m of new Set(this.cameraWebgl.bgTextureCache?.values() || []))
          try {
            m.dispose();
          } catch {
          }
        this.cameraWebgl.bgTextureCache?.clear(), this.cameraWebgl.bgTexture = null, this.cameraWebgl.bgImageUrl = "";
      }
      this.upstreamSignature = "", this.cameraPreviewSignature = "", this.cardMediaById.clear(), this.cardMedia = null, this.restoreAssets(), this.syncUpstreamInputs(), this.refreshObjects(), this.refreshKeys(), this.refreshCameraSelectors(), this.renderCameraView(), this.render(), this.setStatus("Caches cleared & memory freed");
    },
    snapFrame(m) {
      return !this.state.snap_enabled || this.state.snap_frames <= 1 ? Math.round(m) : Math.round(Math.round(m) / this.state.snap_frames) * this.state.snap_frames;
    },
    toggleLoop() {
      this.state.loop_playback = !this.state.loop_playback, this.serialize();
      const m = this.root.querySelector('[data-act="loop"]');
      m.classList.toggle("active", this.state.loop_playback), m.setAttribute("aria-pressed", String(this.state.loop_playback)), this.setStatus(`Loop ${this.state.loop_playback ? "on" : "off"}`);
    },
    setPlaybackRange(m) {
      const b = this.state.playback_range || [0, this.state.duration_frames - 1];
      m === "start" ? b[0] = Math.min(this.frame, b[1]) : m === "end" && (b[1] = Math.max(this.frame, b[0])), this.state.playback_range = b, this.serialize(), this.refreshKeys(), this.setStatus(`Range: F${b[0]}–F${b[1]}`);
    },
    clearPlaybackRange() {
      this.state.playback_range = null, this.serialize(), this.refreshKeys(), this.setStatus("Playback range cleared");
    },
    toggleTimecode() {
      this.state.timecode_mode = this.state.timecode_mode === "timecode" ? "time" : "timecode", this.serialize(), this.setFrame(this.frame, !0), this.setStatus(`Time display: ${this.state.timecode_mode}`);
    },
    toggleSnap() {
      this.state.snap_enabled = !this.state.snap_enabled, this.serialize();
      const m = this.root.querySelector('[data-act="toggle-snap"]');
      m.classList.toggle("active", this.state.snap_enabled), m.setAttribute("aria-pressed", String(this.state.snap_enabled)), this.setStatus(`Snap ${this.state.snap_enabled ? "on" : "off"}`);
    },
    scheduleSerialize() {
      this.serializeScheduled || (this.serializeScheduled = !0, this.serializeFrame = requestAnimationFrame(() => {
        this.serializeScheduled = !1, this.disposed || this.serialize();
      }));
    },
    gizmoAxes(m) {
      return ft(this, m);
    },
    gizmoGeometry(m) {
      return ht(this, m);
    },
    pickGizmo(m) {
      return vt(this, m);
    },
    pickSceneObject(m) {
      return xt(this, m);
    },
    drawTransformGizmo() {
      mt(this);
    },
    onPointerDown(m) {
      bt(this, m);
    },
    onPointerMove(m) {
      ut(this, m);
    },
    onPointerUp(m) {
      yt(this, m);
    },
    onWheel(m) {
      gt(this, m);
    },
    timelineFrameFromEvent(m, b) {
      return lt(this, m, b);
    },
    onTimelinePointerDown(m) {
      st(this, m);
    },
    onTimelinePointerMove(m) {
      it(this, m);
    },
    onTimelinePointerUp(m) {
      ct(this, m);
    },
    resetTimelineZoom() {
      Ae(this);
    },
    refreshKeys() {
      We(this);
    },
    drawCurveEditor() {
      De(this);
    },
    toggleCurveHandles() {
      Xe(this);
    },
    setCurveInterpolation(m) {
      Ue(this, m);
    },
    setTangentMode(m) {
      Ge(this, m);
    },
    setChannelFilter(m) {
      Ve(this, m);
    },
    onCurvePointerDown(m) {
      Ne(this, m);
    },
    onCurvePointerMove(m) {
      Re(this, m);
    },
    onCurvePointerUp(m) {
      Be(this, m);
    },
    zoomCurve(m) {
      dt(this, m);
    },
    resetCurveZoom() {
      He(this);
    },
    onKey(m) {
      return l(this, m);
    },
    frameTarget() {
      pt(this);
    },
    async loadMediaUrl(m, b) {
      return $t(this, m, b);
    },
    restoreAssets() {
      Pt(this);
    },
    onModelLoaded(m) {
      At(this, m);
    },
    async loadModelFile(m) {
      return Et(this, m);
    },
    async loadCardFile(m) {
      return jt(this, m);
    },
    loadExecutionPreview(m) {
      _t(this, m);
    },
    loadSelectedReference() {
      Mt(this);
    },
    drawLine3D(m, b, k = "#5a5a5a", C = 1) {
      J(this, m, b, k, C);
    },
    drawGrid() {
      we(this);
    },
    drawPointField() {
      re(this);
    },
    drawCube(m) {
      ue(this, m);
    },
    drawSphere(m) {
      ge(this, m);
    },
    drawHuman(m) {
      fe(this, m);
    },
    drawNull(m) {
      oe(this, m);
    },
    drawCard(m) {
      be(this, m);
    },
    drawCameraPath() {
      V(this);
    },
    drawSpeedHeatmap() {
      U(this);
    },
    drawOverlays() {
      ce(this);
    },
    async loadViewportBgFile(m) {
      return W(this, m);
    },
    async loadViewportBgSequence(m) {
      return X(this, m);
    },
    clearViewportBgImage() {
      q(this);
    }
  };
}
const Jc = [
  { id: "x", label: "X", vector: [1, 0, 0], color: "#e5484d" },
  { id: "y", label: "Y", vector: [0, 1, 0], color: "#46a758" },
  { id: "z", label: "Z", vector: [0, 0, 1], color: "#4a8fe7" }
];
function Qc(e) {
  const { right: t, up: a, forward: o } = $r(e || {});
  return Jc.map((r) => {
    const [n, i, c] = r.vector, d = n * t[0] + i * t[1] + c * t[2], l = n * a[0] + i * a[1] + c * a[2], p = -(n * o[0] + i * o[1] + c * o[2]);
    return { id: r.id, label: r.label, color: r.color, x: d, y: -l, depth: p };
  });
}
function el(e) {
  return [...e].sort((t, a) => t.depth - a.depth);
}
function tl(e) {
  return 0.45 + 0.55 * ((Math.max(-1, Math.min(1, e)) + 1) / 2);
}
const al = "http://www.w3.org/2000/svg", ze = 26, vo = 17, ol = 5.4;
function Le(e, t) {
  const a = document.createElementNS(al, e);
  for (const [o, r] of Object.entries(t)) a.setAttribute(o, String(r));
  return a;
}
function rl(e) {
  const t = e.root?.querySelector('[data-role="viewport-axis"]');
  if (!t) return;
  const a = e.viewportCamera ? e.viewportCamera() : e.camera;
  if (!a) return;
  t.replaceChildren();
  const o = Le("circle", {
    "data-axis-center": "",
    cx: ze,
    cy: ze,
    r: 4,
    fill: "#A78BFA",
    tabindex: "0",
    role: "button",
    "pointer-events": "auto",
    "aria-label": s("Frame selection")
  }), r = Le("title", {});
  r.textContent = s("Frame selection"), o.appendChild(r), t.appendChild(o);
  for (const n of el(Qc(a))) {
    const i = ze + n.x * vo, c = ze + n.y * vo, d = tl(n.depth);
    t.appendChild(Le("line", {
      x1: ze,
      y1: ze,
      x2: i,
      y2: c,
      stroke: n.color,
      "stroke-width": 1.8,
      "stroke-linecap": "round",
      opacity: d
    }));
    const l = n.depth >= 0, p = Le("circle", {
      cx: i,
      cy: c,
      r: ol,
      fill: l ? n.color : "transparent",
      stroke: n.color,
      "stroke-width": 1.4,
      opacity: d,
      "data-axis": n.label.toLowerCase(),
      tabindex: "0",
      role: "button",
      "aria-label": s("View: {axis} axis").replace("{axis}", n.label),
      "pointer-events": "auto"
    }), h = Le("title", {});
    if (h.textContent = s("View: {axis} axis").replace("{axis}", n.label), p.appendChild(h), t.appendChild(p), l) {
      const f = Le("text", {
        x: i,
        y: c,
        "text-anchor": "middle",
        "dominant-baseline": "central",
        "font-size": 7,
        "font-weight": 700,
        fill: "#101014"
      });
      f.textContent = n.label, t.appendChild(f);
    }
  }
}
function nl(e, t, a, o, r) {
  if (["world_point", "object_point", "camera_field"].includes(t.source_kind)) {
    const n = Uo(e, t.source, a, o, r);
    return n ? [n] : [];
  }
  return (t.keys || []).map((n) => ({ ...n }));
}
function sl(e) {
  if (e.recording) return;
  const t = e.ctx, a = e.canvas.width, o = e.canvas.height;
  t.save();
  for (const r of e.state.motion_layers || []) {
    if (!r.enabled) continue;
    const n = nl(e.state, r, e.frame, a, o);
    if (n.length) {
      t.strokeStyle = r.id === e.state.selected_motion_layer_id ? "#ffcc4d" : "#41d9c5", t.fillStyle = t.strokeStyle, t.lineWidth = r.id === e.state.selected_motion_layer_id ? 3 : 2, t.beginPath(), n.forEach((i, c) => {
        const d = i.x * a, l = i.y * o;
        c ? t.lineTo(d, l) : t.moveTo(d, l);
      }), t.stroke();
      for (const i of n)
        i.visible !== !1 && (t.beginPath(), t.arc(i.x * a, i.y * o, 5, 0, Math.PI * 2), t.fill());
    }
  }
  t.restore();
}
function il(e) {
  const t = e.root.querySelector('[data-role="motion-layers"]');
  if (!t) return;
  t.replaceChildren();
  for (const o of e.state.motion_layers || []) {
    const r = document.createElement("button");
    r.type = "button", r.className = "motion-layer-row", r.dataset.motionLayerId = o.id, r.classList.toggle("active", o.id === e.state.selected_motion_layer_id), r.innerHTML = `<i class="pi ${o.enabled ? "pi-eye" : "pi-eye-slash"}"></i><span></span><small>${o.source_kind}</small>`, r.querySelector("span").textContent = o.label, r.addEventListener("click", () => {
      e.state.selected_motion_layer_id = o.id, e.render();
    }), t.appendChild(r);
  }
  const a = e.root.querySelector('[data-role="motion-layers-empty"]');
  a && (a.hidden = !!e.state.motion_layers?.length);
}
function cl(e) {
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
      const d = document.createElement("button");
      d.type = "button", d.className = "motion-key", d.style.left = `${Math.max(0, Math.min(100, c.time_seconds / a * 100))}%`, d.title = `${o.label} @ ${c.time_seconds.toFixed(2)}s`, d.addEventListener("click", () => {
        e.state.selected_motion_layer_id = o.id, e.setFrame(Math.round(c.time_seconds * e.state.fps));
      }), i.appendChild(d);
    }
    r.append(n, i), t.appendChild(r);
  }
}
function ll(e) {
  const { app: t, api: a, EditorHistory: o, ContextMenuController: r, initializeTooltips: n, promptText: i, ObjectUrlRegistry: c, buildRoot: d, dispatchDirectorKey: l, activeCameraTrack: p, bindWidgetCallbacks: h, playblastCameraTrack: f, restoreFromWidgets: u, serializeEditorState: v, syncActiveCameraTrack: S, syncFromWidgets: g, bind: y, activateCamera: x, addCamera: w, deleteCamera: j, drawPreviewOverlays: _, duplicateCamera: D, maximizeCameraPreview: A, refreshCameraPreviews: B, refreshCameraSelectors: z, renameCamera: I, setPlayblastCamera: ye, toggleCameraView: ae, captureRealtime: ne, makePlayblast: se, uploadDirectorPlayblast: me, waitForMediaFrame: pe, computeAudioPeaks: Z, loadAudioFile: E, stopPlay: Y, togglePlay: T, applyCameraPreset: F, applyCameraShake: N, applyProxyPreset: ie, clearViewportBgImage: q, loadViewportBgFile: W, loadViewportBgSequence: X, drawCameraPath: V, drawCard: be, drawCube: ue, drawGrid: we, drawHuman: fe, drawLine3D: J, drawNull: oe, drawOverlays: ce, drawPointField: re, drawSpeedHeatmap: U, drawSphere: ge, curveChannels: nt, drawCurveEditor: De, onCurvePointerDown: Ne, onCurvePointerMove: Re, onCurvePointerUp: Be, onTimelinePointerDown: st, onTimelinePointerMove: it, onTimelinePointerUp: ct, refreshKeys: We, resetCurveZoom: He, resetTimelineZoom: Ae, setChannelFilter: Ve, setCurveInterpolation: Ue, setTangentMode: Ge, timelineFrameFromEvent: lt, toggleCurveHandles: Xe, zoomCurve: dt, drawTransformGizmo: mt, frameTarget: pt, gizmoAxes: ft, gizmoGeometry: ht, onPointerDown: bt, onPointerMove: ut, onPointerUp: yt, onWheel: gt, pickGizmo: vt, pickSceneObject: xt, resetCamera: wt, setTransformMode: kt, setViewMode: St, viewportCamera: Ct, loadCardFile: jt, loadExecutionPreview: _t, loadMediaUrl: $t, loadModelFile: Et, loadSelectedReference: Mt, onModelLoaded: At, restoreAssets: Pt, syncUpstreamInputs: Ft, configureDomMedia: La, refreshSetupDiagnostic: zt, addMediaCard: Lt, addPrimitive: Tt, applyObjectAnimationFrame: Kt, beginCameraEdit: It, beginObjectEdit: Ot, commitCameraEdit: qt, commitObjectEdit: Dt, copyKeyframe: Nt, deleteKeyframe: Rt, deleteObject: Bt, duplicateObject: Wt, exitKeyEdit: Ht, finishCameraEdit: Vt, goToAdjacentKey: Ut, insertKeyframe: Gt, loadSelectedKeyView: Xt, pasteKeyframe: Yt, playblastCameraAtFrame: Zt, refreshInspector: Jt, refreshKeyEditor: Qt, refreshObjects: ea, removeObjectResources: ta, renameObject: aa, retimeSelectedKey: oa, selectKeyframe: ra, selectedKeyframe: na, selectedObject: sa, selectObjectAnimation: ia, setKeyInterpolation: ca, setObjectParent: la, timelineKeyframes: da, timelineObject: ma, toggleAutoKey: pa, toggleObject: fa, updateCameraFromHud: ha, updateEditState: ba, updateKeyVisualState: ua, updateSelectedKey: ya, updateSelectedObject: ga, clamp: Ye, cloneCamera: Ta, configureCore: Ka, defaultCamera: va, sampleCamera: ke, sampleObjectTransform: Me, sanitizeState: xa, worldTransform: wa } = e;
  return {
    render() {
      const m = this.ctx, b = this.canvas.width, k = this.canvas.height;
      if (m.fillStyle = this.state.viewport_bg_color || "#121212", m.fillRect(0, 0, b, k), this.viewportBgSequenceImages && this.viewportBgSequenceImages.length) {
        const O = this.frame % this.viewportBgSequenceImages.length, Ce = this.viewportBgSequenceImages[O];
        if (Ce?.complete && Ce.naturalWidth)
          try {
            m.drawImage(Ce, 0, 0, b, k);
          } catch {
          }
      } else if (this.viewportBgImage)
        try {
          m.drawImage(this.viewportBgImage, 0, 0, b, k);
        } catch {
        }
      const C = this.state.render_mode, M = this.viewportCamera(), K = this.state.objects.some((O) => O.parent_id) ? this.state.objects.map((O) => O.parent_id ? { ...O, ...wa(this.state.objects, O) } : O) : this.state.objects, G = (this.viewportBgSequenceImages || []).map((O) => O.src), le = this.viewportBgImage?.src || "", L = this.pendingExtractorImport, $ = L ? [...this.state.cameras, {
        id: "__extractor_preview__",
        name: L.label,
        color: "#9ca3af",
        camera: L.track.keyframes[0]?.camera,
        keyframes: L.track.keyframes
      }] : this.state.cameras, Se = {
        ...this.state,
        cameras: $,
        objects: K,
        viewport_bg_image: le,
        viewport_bg_sequence: G,
        __selectedObjectIds: [...this.selectedObjectIds || []],
        __omnicamRevision: `${this.renderRevision || 0}:${L?.fingerprint || ""}`
      };
      let Ze = !1;
      if (this.webgl)
        try {
          const O = this.recording ? 1 : this.webgl.supersampleFactor?.() ?? 1, Ce = O > 1 ? Math.min(O, 4096 / Math.max(1, b, k)) : 1, ka = Ce > 1 ? Math.round(b * Ce) : b, Ia = Ce > 1 ? Math.round(k * Ce) : k;
          this.webgl.render(Se, M, this.cardMediaById, ka, Ia, this.modelUrlsById, this.frame, this.recording, this.selectedEntity, this.selectedObjectId, this.subSelection, this.selectedKeyFrame ?? null), m.imageSmoothingEnabled = !0, m.imageSmoothingQuality = "high", ka !== b || Ia !== k ? m.drawImage(this.webgl.canvas, 0, 0, ka, Ia, 0, 0, b, k) : m.drawImage(this.webgl.canvas, 0, 0, b, k), Ze = !0;
        } catch (O) {
          console.error("[OmniCam WebGL Render Error]", O);
        }
      if (!Ze) {
        (!this.recording && ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(C) || this.recording && this.state.playblast_grid) && this.drawGrid(), ["omni_ref", "point_field"].includes(C) && this.drawPointField();
        for (const O of K)
          O.enabled !== !1 && (O.type === "card" && ["omni_ref", "card_grid", "graybox", "wireframe"].includes(C) ? this.drawCard(O) : ["cube", "ground", "glb", "model"].includes(O.type) && C !== "grid" && C !== "point_field" ? this.drawCube(O) : O.type === "sphere" && C !== "grid" && C !== "point_field" ? this.drawSphere(O) : O.type === "human" && C !== "grid" && C !== "point_field" ? this.drawHuman(O) : O.type === "null" && this.drawNull(O));
        !this.recording && this.state.show_camera_paths && this.drawCameraPath();
      }
      !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), this.drawOverlays(), sl(this), this.state.show_gizmo && rl(this), il(this), cl(this), this.renderCameraView();
    },
    renderCameraView() {
      if (this.state.camera_view_visible) {
        this.refreshCameraPreviews();
        for (const m of this.state.cameras) {
          const b = this.cameraPreviewCanvases.get(m.id), k = this.cameraPreviewContexts.get(m.id);
          if (!b?.width || !k) continue;
          const C = b.width, M = b.height, K = Wa(this, m, ke(m, this.frame, this.state.objects), this.frame);
          if (k.fillStyle = "#111", k.fillRect(0, 0, C, M), this.cameraWebgl)
            try {
              this.cameraWebgl.render({ ...this.state, keyframes: [], playblast_grid: !1, viewport_bg_image: this.viewportBgImage?.src || "", viewport_bg_sequence: (this.viewportBgSequenceImages || []).map((le) => le.src), __omnicamRevision: this.renderRevision || 0 }, K, this.cardMediaById, C, M, this.modelUrlsById, this.frame, !0), k.drawImage(this.cameraWebgl.canvas, 0, 0, C, M);
            } catch (le) {
              console.error("[OmniCam Preview Render Error]", le);
            }
          _(this, k, C, M);
          const G = this.root.querySelector(`[data-camera-frame="${m.id}"]`);
          G && (G.textContent = `F${this.frame}`);
        }
      }
    },
    drawPreviewOverlays(m, b, k) {
      _(this, m, b, k);
    },
    maximizeCameraPreview(m) {
      A(this, m);
    },
    setStatus(m) {
      this.root.querySelector('[data-role="status"]').textContent = m;
    },
    async makePlayblast() {
      return se(this);
    },
    async waitForMediaFrame() {
      return pe(this);
    },
    async captureRealtimePlayblast() {
      return ne(this);
    },
    async uploadPlayblast(m) {
      return me(this, m);
    },
    async syncUpstreamInputs() {
      return Ft(this);
    },
    dispose() {
      if (!this.disposed) {
        if (this.disposed = !0, Er(this), this.backgroundRequestId = (this.backgroundRequestId || 0) + 1, this.upstreamSyncId = (this.upstreamSyncId || 0) + 1, this.stopPlay(), clearTimeout(this.previewClickTimer), clearTimeout(this.connectionTimer), cancelAnimationFrame(this.restoreFrame), cancelAnimationFrame(this.serializeFrame), cancelAnimationFrame(this.resizeFrame), this.abortController?.abort(), this.upstreamFetchController?.abort(), this.resizeObserver?.disconnect(), this.contextMenu?.dispose(), this.webgl?.dispose(), this.cameraWebgl?.dispose(), this.audioSource) {
          try {
            this.audioSource.stop();
          } catch {
          }
          this.audioSource = null;
        }
        this.audioContext?.close?.().catch?.(() => {
        }), this.audioContext = null, this.objectUrls.clear(), this.cardMediaById.clear(), this.modelUrlsById.clear(), this.modelInfoById.clear();
      }
    }
  };
}
Co({ api: Oe });
or({ api: Oe });
ki({ api: Oe });
class lr {
  constructor(t) {
    this.app = xo, this.node = t, this.root = Ro(), this.root.tabIndex = -1, this.canvas = this.root.querySelector(".viewport-wrap > canvas"), this.cameraPreviewCanvases = /* @__PURE__ */ new Map(), this.cameraPreviewContexts = /* @__PURE__ */ new Map(), this.cameraPreviewSignature = "", this.interactionElement = this.canvas, this.interactionElement.tabIndex = 0, this.interactionElement.dataset.captureWheel = "true", this.ctx = this.canvas.getContext("2d", { alpha: !1 }), this.disposed = !1, this.renderRevision = 0, this.webgl = null, this.cameraWebgl = null, this.webglReady = this.loadWebGLViewports(), this.stateWidget = t.widgets?.find((o) => o.name === "state_json"), this.recordingWidget = t.widgets?.find((o) => o.name === "recording_path"), this.cardWidget = t.widgets?.find((o) => o.name === "card_asset"), this.widthWidget = t.widgets?.find((o) => o.name === "width"), this.heightWidget = t.widgets?.find((o) => o.name === "height"), this.fpsWidget = t.widgets?.find((o) => o.name === "fps"), this.durationWidget = t.widgets?.find((o) => o.name === "duration_seconds"), this.modeWidget = t.widgets?.find((o) => o.name === "render_mode");
    let a = null;
    try {
      a = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = Va(a), this.frame = 0, this.camera = te(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1, this.cameraEditKey = null, this.keyDrag = null, this.timelineDrag = null, this.curveDrag = null, this.selectedKeyFrame = this.state.keyframes[0]?.frame ?? null, this.editingKeyFrame = null, this.copiedKeyframe = null, this.cameraSpeed = 1, this.cardMedia = null, this.cardMediaById = /* @__PURE__ */ new Map(), this.objectUrls = new No(), this.cardUrlsById = this.objectUrls.urls, this.modelUrlsById = /* @__PURE__ */ new Map(), this.modelInfoById = /* @__PURE__ */ new Map(), this.executionReferences = [], this.selectedObjectId = null, this.selectedEntity = "camera", this.subSelection = null, this.cardUrl = null, this.recording = !1, this.gizmoDrag = null, this.playTimer = null, this.previewClickTimer = null, this.showCurveHandles = !0, this.contextMenu = new qo(this.root), this.history = new Oo({ capture: () => JSON.stringify({ state: this.state, frame: this.frame, selectedEntity: this.selectedEntity, selectedObjectId: this.selectedObjectId, selectedObjectIds: [...this.selectedObjectIds || []], selectedKeyFrame: this.selectedKeyFrame, selectedKeyFrames: [...this.selectedKeyFrames || []], subSelection: this.subSelection }), restore: (o) => this.restoreHistorySnapshot(o) }), this.refreshCameraPreviews(), this.initializeTooltips(), this.bind(), this.bindWidgetCallbacks(), this.syncFromWidgets(), this.resizeCanvas(), this.render(), this.refreshKeys(), this.refreshObjects(), this.restoreAssets(), this.syncUpstreamInputs(), this.refreshSetupDiagnostic(), // Seed every frame-derived readout (timecode, lens millimetres, viewport
    // zoom, dope rows) instead of waiting for the first scrub.
    this.setFrame(this.frame, !1, !0);
  }
  /** Load the WebGL viewports, then repaint with them. Never rejects. */
  async loadWebGLViewports() {
    let t;
    try {
      ({ OmniWebGLViewport: t } = await import("./chunk-DlY6yXhd.js"));
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
      Mr(this), this.resizeCanvas(), this.render(), this.renderCameraView();
    }
  }
}
const ja = { app: xo, api: Oe, EditorHistory: Oo, ContextMenuController: qo, initializeTooltips: qn, promptText: Xa, ObjectUrlRegistry: No, buildRoot: Ro, dispatchDirectorKey: Ar, activeCameraTrack: et, bindWidgetCallbacks: ps, playblastCameraTrack: Za, restoreFromWidgets: hs, serializeEditorState: ms, syncActiveCameraTrack: Bo, syncFromWidgets: fs, bind: Zs, activateCamera: ri, addCamera: ei, deleteCamera: oi, drawPreviewOverlays: ii, duplicateCamera: ai, maximizeCameraPreview: Yo, refreshCameraPreviews: Qa, refreshCameraSelectors: Js, renameCamera: ti, setPlayblastCamera: ni, toggleCameraView: si, captureRealtime: Jo, makePlayblast: ui, uploadDirectorPlayblast: Qo, waitForMediaFrame: Zo, computeAudioPeaks: er, loadAudioFile: gi, stopPlay: Ba, togglePlay: yi, applyCameraPreset: vi, applyCameraShake: xi, applyProxyPreset: wi, clearViewportBgImage: ji, loadViewportBgFile: Si, loadViewportBgSequence: Ci, drawCameraPath: zi, drawCard: Fi, drawCube: Ei, drawGrid: _i, drawHuman: Ai, drawLine3D: ee, drawNull: Pi, drawOverlays: Ti, drawPointField: $i, drawSpeedHeatmap: Li, drawSphere: Mi, curveChannels: ot, drawCurveEditor: _n, onCurvePointerDown: un, onCurvePointerMove: yn, onCurvePointerUp: gn, onTimelinePointerDown: Pr, onTimelinePointerMove: Fr, onTimelinePointerUp: zr, refreshKeys: qi, resetCurveZoom: jn, resetTimelineZoom: Lr, setChannelFilter: xn, setCurveInterpolation: vn, setTangentMode: wn, timelineFrameFromEvent: Ha, toggleCurveHandles: kn, zoomCurve: Cn, drawTransformGizmo: Gi, frameTarget: Bi, gizmoAxes: ar, gizmoGeometry: to, onPointerDown: Tr, onPointerMove: Kr, onPointerUp: Ir, onWheel: Or, pickGizmo: Hi, pickSceneObject: Vi, resetCamera: Ri, setTransformMode: Ni, setViewMode: Di, viewportCamera: za, loadCardFile: Qi, loadExecutionPreview: ec, loadMediaUrl: rr, loadModelFile: Ji, loadSelectedReference: tc, onModelLoaded: Zi, restoreAssets: Yi, syncUpstreamInputs: ac, configureDomMedia: or, refreshSetupDiagnostic: nc, addMediaCard: yc, addPrimitive: pc, applyObjectAnimationFrame: _c, beginCameraEdit: zc, beginObjectEdit: ir, commitCameraEdit: Lc, commitObjectEdit: xc, copyKeyframe: Ac, deleteKeyframe: Mc, deleteObject: uc, duplicateObject: hc, exitKeyEdit: Kc, finishCameraEdit: Tc, goToAdjacentKey: Hc, insertKeyframe: $c, loadSelectedKeyView: Wc, pasteKeyframe: Pc, playblastCameraAtFrame: jc, refreshInspector: gc, refreshKeyEditor: Nc, refreshObjects: mc, removeObjectResources: Cc, renameObject: fc, retimeSelectedKey: Rc, selectKeyframe: Fc, selectedKeyframe: Ee, selectedObject: rt, selectObjectAnimation: Sc, setKeyInterpolation: Ec, setObjectParent: kc, timelineKeyframes: xe, timelineObject: ve, toggleAutoKey: Ic, toggleObject: bc, updateCameraFromHud: wc, updateEditState: qc, updateKeyVisualState: Dc, updateSelectedKey: Bc, updateSelectedObject: vc, clamp: P, cloneCamera: R, configureCore: Co, defaultCamera: So, sampleCamera: te, sampleObjectTransform: qe, sanitizeState: Va, worldTransform: Ua };
Object.assign(
  lr.prototype,
  Uc(ja),
  Yc(ja),
  Zc(ja),
  ll(ja)
);
function _a(e, t) {
  const a = globalThis.__majoorOmniCamCiTrace;
  Array.isArray(a) && a.push({ stage: e, nodeId: t?.id ?? null, nodeClass: t?.comfyClass ?? t?.type ?? null });
}
function dl(e) {
  if (e.__majoorOmniCam) return;
  _a("director:attach:start", e), _a("director:constructor:start", e);
  const t = new lr(e);
  _a("director:constructor:complete", e), e.__majoorOmniCam = t, _a("director:marker:assigned", e), t.hideInternalWidgets();
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
  const i = e.onConnectionsChange;
  e.onConnectionsChange = function() {
    i?.apply(this, arguments), clearTimeout(t.connectionTimer), t.connectionTimer = setTimeout(() => {
      t.disposed || t.syncUpstreamInputs();
    }, 60);
  };
  const c = e.onRemoved;
  e.onRemoved = function() {
    t.dispose(), c?.apply(this, arguments);
  };
  const d = e.onExecuted;
  e.onExecuted = function(l) {
    d?.apply(this, arguments), t.loadExecutionPreview(l), t.syncUpstreamInputs();
  };
}
const wl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirector: dl
}, Symbol.toStringTag, { value: "Module" }));
export {
  fo as D,
  vl as a,
  ci as b,
  gl as c,
  Ho as d,
  et as e,
  wl as f,
  Ja as q,
  xl as s
};
