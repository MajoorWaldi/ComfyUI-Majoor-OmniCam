import { q as G, s as T, i as R, F, G as f, o as C, f as L, U as E, M as O, X as D, v as q, L as X, x as H, a2 as B } from "./chunk-8mPWrQgW.js";
import { s as y } from "./chunk-DVQY0KQ6.js";
const m = {
  perspective: { theta: Math.PI * 0.25, phi: Math.PI * 0.32 },
  // Just off the pole: exactly overhead makes the up vector ambiguous and the
  // view flips as soon as the user nudges it.
  top: { theta: 0, phi: 1e-3 },
  front: { theta: 0, phi: Math.PI / 2 },
  side: { theta: Math.PI / 2, phi: Math.PI / 2 }
}, V = 1e-3, W = Math.PI - 1e-3;
class z {
  constructor(t, { onChange: e = () => {
  } } = {}) {
    this.camera = t, this.onChange = e, this.target = [0, 0, 0], this.distance = 6, this.theta = m.perspective.theta, this.phi = m.perspective.phi, this.drag = null, this.apply();
  }
  /** Place the camera from the current spherical state. */
  apply() {
    const t = Math.sin(this.phi), e = [
      this.target[0] + this.distance * t * Math.sin(this.theta),
      this.target[1] + this.distance * Math.cos(this.phi),
      this.target[2] + this.distance * t * Math.cos(this.theta)
    ];
    return this.camera?.position?.set?.(...e), this.camera?.lookAt?.(...this.target), this.onChange(), e;
  }
  setView(t) {
    const e = m[t] || m.perspective;
    return this.theta = e.theta, this.phi = e.phi, this.apply();
  }
  /** Frame a bounding sphere: the "Fit Track" button. */
  fit({ centre: t = [0, 0, 0], extent: e = 1 } = {}) {
    this.target = t.map(Number);
    const s = Number(this.camera?.fov) || 50;
    return this.distance = Math.max(0.2, e * 0.6 / Math.tan(s * Math.PI / 360) + e * 0.15), this.apply();
  }
  orbit(t, e) {
    return this.theta -= t * 5e-3, this.phi = Math.max(V, Math.min(W, this.phi - e * 5e-3)), this.apply();
  }
  pan(t, e) {
    const s = this.distance * 15e-4, n = [Math.cos(this.theta), 0, -Math.sin(this.theta)], i = [
      -Math.cos(this.phi) * Math.sin(this.theta),
      Math.sin(this.phi),
      -Math.cos(this.phi) * Math.cos(this.theta)
    ];
    return this.target = this.target.map(
      (a, h) => a - n[h] * t * s + i[h] * e * s
    ), this.apply();
  }
  dolly(t) {
    return this.distance = Math.max(0.05, Math.min(1e6, this.distance * (1 + t * 15e-4))), this.apply();
  }
  // -- pointer plumbing --------------------------------------------------
  beginDrag(t) {
    this.drag = {
      x: t.clientX,
      y: t.clientY,
      mode: t.button === 1 || t.shiftKey ? "pan" : "orbit"
    };
  }
  moveDrag(t) {
    if (!this.drag) return !1;
    const e = t.clientX - this.drag.x, s = t.clientY - this.drag.y;
    return this.drag.x = t.clientX, this.drag.y = t.clientY, this.drag.mode === "pan" ? this.pan(e, s) : this.orbit(e, s), !0;
  }
  endDrag() {
    this.drag = null;
  }
  wheel(t) {
    this.dolly(Number(t.deltaY) || 0);
  }
}
const Y = 24;
function U(r) {
  const t = (r?.position || [0, 0, 0]).map(Number), e = (r?.target || [0, 0, -1]).map(Number);
  let s = p([
    e[0] - t[0],
    e[1] - t[1],
    e[2] - t[2]
  ], [0, 0, -1]), n = p(x(s, [0, 1, 0]), [1, 0, 0]);
  Math.abs(Q(s, [0, 1, 0])) > 0.9999 && (n = p(x(s, [0, 0, 1]), [1, 0, 0]));
  let i = p(x(n, s), [0, 1, 0]);
  const a = (Number(r?.roll) || 0) * (Math.PI / 180);
  if (a) {
    const h = Math.cos(a), u = Math.sin(a), M = n.map((d, o) => d * h + i[o] * u);
    i = i.map((d, o) => d * h - n[o] * u), n = M;
  }
  return { position: t, right: n, up: i, forward: s };
}
function K(r, { scale: t = 0.35, aspect: e = 16 / 9 } = {}) {
  const { position: s, right: n, up: i, forward: a } = U(r), h = Math.max(1, Math.min(179, Number(r?.fov) || 53)), u = Math.tan(h * Math.PI / 360) * t, M = u * Math.max(0.05, Number(e) || 1), d = s.map((g, w) => g + a[w] * t), o = (g, w) => d.map((A, _) => A + n[_] * M * g + i[_] * u * w);
  return {
    apex: s,
    corners: [o(-1, 1), o(1, 1), o(1, -1), o(-1, -1)]
  };
}
function j(r, t) {
  const { apex: e, corners: s } = K(r, t), n = [];
  for (const a of s) n.push(...e, ...a);
  for (let a = 0; a < s.length; a += 1)
    n.push(...s[a], ...s[(a + 1) % s.length]);
  const i = new R();
  return i.setAttribute("position", new F(n, 3)), i;
}
function I(r, { color: t = 9141208, opacity: e = 1, ...s } = {}) {
  const n = new G({ color: t, transparent: e < 1, opacity: e });
  return new T(j(r, s), n);
}
function J(r, t = Y) {
  const e = Array.from(r || []);
  if (e.length <= t) return e;
  const s = (e.length - 1) / Math.max(1, t - 1), n = [];
  for (let i = 0; i < t; i += 1) n.push(e[Math.round(i * s)]);
  return [...new Set(n)];
}
function x(r, t) {
  return [r[1] * t[2] - r[2] * t[1], r[2] * t[0] - r[0] * t[2], r[0] * t[1] - r[1] * t[0]];
}
function Q(r, t) {
  return r[0] * t[0] + r[1] * t[1] + r[2] * t[2];
}
function p(r, t) {
  const e = Math.hypot(r[0], r[1], r[2]);
  return e < 1e-9 ? [...t] : r.map((s) => s / e);
}
const Z = 2894904, $ = 3816008;
function tt(r) {
  const e = Math.max(1e-6, Number(r) || 0) / 16, s = 10 ** Math.floor(Math.log10(e));
  for (const n of [1, 2, 5, 10])
    if (e <= n * s) return n * s;
  return 10 * s;
}
function P(r = 10) {
  const t = new f();
  t.name = "omnicam-track-grid";
  const e = tt(r), s = Math.max(e * 8, Number(r) * 2 || e * 8), n = Math.max(4, Math.min(80, Math.round(s / e))), i = new C(s, n, $, Z);
  i.name = "grid", t.add(i);
  const a = new L(Math.max(e, s * 0.08));
  return a.name = "axes", t.add(a), t;
}
function et(r, t) {
  if (!r) return null;
  const e = P(t);
  for (const s of [...r.children])
    r.remove(s), c(s);
  for (const s of [...e.children]) r.add(s);
  return r;
}
function c(r) {
  r?.traverse?.((e) => {
    e.geometry?.dispose?.();
    const s = e.material;
    Array.isArray(s) ? s.forEach((n) => n?.dispose?.()) : s?.dispose?.();
  }), r?.geometry?.dispose?.();
  const t = r?.material;
  Array.isArray(t) ? t.forEach((e) => e?.dispose?.()) : t?.dispose?.();
}
const k = 9079452, l = 9141208, st = 4630360, rt = 15026253, it = 2e3;
function nt(r) {
  return (r?.keyframes || []).map((t) => Number(t.frame) || 0).sort((t, e) => t - e);
}
function b(r, t = it) {
  if (!r?.keyframes?.length) return [];
  const e = Math.max(1, Number(r.duration_frames) || 1), s = Math.max(2, Math.min(t, e)), n = [];
  for (let i = 0; i < s; i += 1) {
    const a = i / (s - 1) * (e - 1), h = y(r, a);
    n.push(h.position.map(Number));
  }
  return n;
}
function N(r) {
  if (!r?.length) return { min: [0, 0, 0], max: [0, 0, 0], centre: [0, 0, 0], extent: 1 };
  const t = [1 / 0, 1 / 0, 1 / 0], e = [-1 / 0, -1 / 0, -1 / 0];
  for (const i of r)
    for (let a = 0; a < 3; a += 1)
      t[a] = Math.min(t[a], i[a]), e[a] = Math.max(e[a], i[a]);
  const s = t.map((i, a) => (i + e[a]) / 2), n = Math.max(1e-3, Math.hypot(e[0] - t[0], e[1] - t[1], e[2] - t[2]));
  return { min: t, max: e, centre: s, extent: n };
}
function S(r, t, { opacity: e = 1 } = {}) {
  const s = new R();
  return s.setAttribute("position", new F(r.flat(), 3)), new X(s, new G({ color: t, transparent: e < 1, opacity: e }));
}
function v(r, t) {
  return new O(new D(t, 12, 8), new q({ color: r }));
}
class at {
  constructor() {
    this.scene = new E(), this.mode = "refined", this.frame = 0, this.tracks = { raw: null, refined: null }, this.extent = 10, this.gridGroup = P(this.extent), this.pathGroup = new f(), this.frustumGroup = new f(), this.markerGroup = new f(), this.scene.add(this.gridGroup, this.pathGroup, this.frustumGroup, this.markerGroup), this.currentFrustum = null, this.currentMarker = v(l, 0.02), this.markerGroup.add(this.currentMarker);
  }
  setRawTrack(t) {
    this.tracks.raw = t || null, this.rebuild();
  }
  setRefinedTrack(t) {
    this.tracks.refined = t || null, this.rebuild();
  }
  setMode(t) {
    this.mode = ["raw", "refined", "compare"].includes(t) ? t : "refined", this.rebuild();
  }
  activeTrack() {
    return this.mode === "raw" ? this.tracks.raw : this.tracks.refined || this.tracks.raw;
  }
  rebuild() {
    this._clear(this.pathGroup), this._clear(this.frustumGroup);
    const t = this.mode !== "refined" ? b(this.tracks.raw) : [], e = this.mode !== "raw" ? b(this.tracks.refined) : [];
    t.length > 1 && this.pathGroup.add(S(t, k, { opacity: this.mode === "compare" ? 0.75 : 1 })), e.length > 1 && this.pathGroup.add(S(e, l)), this.mode === "compare" && t.length > 1 && e.length > 1 && this.pathGroup.add(this._displacement(t, e));
    const s = e.length ? e : t;
    this.extent = N(s).extent, et(this.gridGroup, this.extent), this._rebuildMarkers(s), this._rebuildFrustums(), this.setFrame(this.frame);
  }
  /** Sampled raw-to-refined offsets: what the cleanup actually changed. */
  _displacement(t, e) {
    const s = Math.min(t.length, e.length), n = Math.max(1, Math.floor(s / 40)), i = [];
    for (let h = 0; h < s; h += n)
      i.push(...t[h], ...e[h]);
    const a = new R();
    return a.setAttribute("position", new F(i, 3)), new T(a, new G({
      color: k,
      transparent: !0,
      opacity: 0.45
    }));
  }
  _rebuildMarkers(t) {
    for (const i of [...this.markerGroup.children])
      i !== this.currentMarker && (this.markerGroup.remove(i), c(i));
    if (t.length < 2) return;
    const e = Math.max(8e-3, this.extent * 0.012), s = v(st, e);
    s.position.set(...t[0]);
    const n = v(rt, e);
    n.position.set(...t[t.length - 1]), this.markerGroup.add(s, n), this.currentMarker.scale.setScalar(Math.max(0.5, e / 0.02));
  }
  _rebuildFrustums() {
    const t = this.activeTrack();
    if (!t) return;
    const e = Math.max(0.05, this.extent * 0.08), s = Math.max(0.05, (Number(t.width) || 16) / Math.max(1, Number(t.height) || 9));
    for (const n of J(nt(t))) {
      const i = I(y(t, n), {
        color: this.mode === "raw" ? k : l,
        opacity: 0.35,
        scale: e,
        aspect: s
      });
      this.frustumGroup.add(i);
    }
  }
  /** Move the current-frame marker and frustum. Never edits the track. */
  setFrame(t) {
    this.frame = Math.max(0, Number(t) || 0);
    const e = this.activeTrack();
    if (!e) return null;
    const s = y(e, this.frame);
    this.currentMarker.position.set(...s.position.map(Number)), this.currentFrustum && (this.scene.remove(this.currentFrustum), c(this.currentFrustum));
    const n = Math.max(0.05, (Number(e.width) || 16) / Math.max(1, Number(e.height) || 9));
    return this.currentFrustum = I(s, {
      color: l,
      scale: Math.max(0.06, this.extent * 0.12),
      aspect: n
    }), this.scene.add(this.currentFrustum), s;
  }
  bounds() {
    const t = b(this.activeTrack());
    return N(t);
  }
  _clear(t) {
    for (const e of [...t.children])
      t.remove(e), c(e);
  }
  dispose() {
    this.currentFrustum && (this.scene.remove(this.currentFrustum), c(this.currentFrustum), this.currentFrustum = null);
    for (const t of [this.pathGroup, this.frustumGroup, this.markerGroup, this.gridGroup])
      this._clear(t), this.scene.remove(t);
    c(this.currentMarker), this.tracks = { raw: null, refined: null };
  }
}
class ct {
  constructor(t, { onFrameCamera: e = () => {
  } } = {}) {
    this.canvas = t, this.onFrameCamera = e, this.disposed = !1, this.pending = 0, this.trackScene = new at(), this.camera = new H(50, 16 / 9, 0.01, 1e5), this.controls = new z(this.camera, { onChange: () => this.requestRender() });
    try {
      this.renderer = new B({ canvas: t, antialias: !0, alpha: !1 }), this.renderer.setClearColor(1052692, 1);
    } catch (s) {
      console.warn("[OmniCam] track viewer WebGL unavailable", s), this.renderer = null;
    }
    this._bind(), this.resize();
  }
  _bind() {
    if (!this.canvas) return;
    const t = (i) => {
      this.canvas.setPointerCapture?.(i.pointerId), this.controls.beginDrag(i);
    }, e = (i) => {
      this.controls.moveDrag(i) && i.preventDefault();
    }, s = (i) => {
      this.canvas.releasePointerCapture?.(i.pointerId), this.controls.endDrag();
    }, n = (i) => {
      i.preventDefault(), this.controls.wheel(i);
    };
    this.canvas.addEventListener("pointerdown", t), this.canvas.addEventListener("pointermove", e), this.canvas.addEventListener("pointerup", s), this.canvas.addEventListener("pointercancel", s), this.canvas.addEventListener("wheel", n, { passive: !1 }), this.listeners = [
      ["pointerdown", t],
      ["pointermove", e],
      ["pointerup", s],
      ["pointercancel", s],
      ["wheel", n]
    ];
  }
  // -- read-only API -----------------------------------------------------
  setRawTrack(t) {
    this.trackScene.setRawTrack(t), this.requestRender();
  }
  setRefinedTrack(t) {
    this.trackScene.setRefinedTrack(t), this.requestRender();
  }
  setMode(t) {
    this.trackScene.setMode(t), this.requestRender();
  }
  setFrame(t) {
    const e = this.trackScene.setFrame(t);
    return e && this.onFrameCamera(e), this.requestRender(), e;
  }
  setView(t) {
    return this.controls.setView(t), t;
  }
  fit() {
    const t = this.trackScene.bounds();
    return this.controls.fit(t), t;
  }
  // -- rendering ---------------------------------------------------------
  resize() {
    const t = this.canvas?.clientWidth || this.canvas?.width || 1, e = this.canvas?.clientHeight || this.canvas?.height || 1;
    this.camera.aspect = Math.max(0.05, t / Math.max(1, e)), this.camera.updateProjectionMatrix?.(), this.renderer?.setSize?.(t, e, !1), this.requestRender();
  }
  requestRender() {
    this.disposed || !this.renderer || this.pending || (this.pending = globalThis.requestAnimationFrame?.(() => {
      this.pending = 0, this.render();
    }) || 0, this.pending || this.render());
  }
  render() {
    this.disposed || !this.renderer || this.renderer.render(this.trackScene.scene, this.camera);
  }
  dispose() {
    this.disposed = !0, this.pending && globalThis.cancelAnimationFrame?.(this.pending), this.pending = 0;
    for (const [t, e] of this.listeners || [])
      this.canvas?.removeEventListener?.(t, e);
    this.listeners = [], this.trackScene.dispose(), this.renderer?.dispose?.(), this.renderer = null, this.canvas = null;
  }
}
export {
  ct as TrackViewer
};
