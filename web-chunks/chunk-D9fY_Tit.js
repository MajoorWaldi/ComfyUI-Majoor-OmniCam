import { q as N, s as T, i as M, F as g, G as d, o as E, f as O, z as V, I as D, U as q, M as z, X, v as H, L as B, x as R, a2 as W } from "./chunk-B7ZTbDAV.js";
import { s as G } from "./chunk-Bjzezi9A.js";
const p = {
  perspective: { theta: Math.PI * 0.25, phi: Math.PI * 0.32 },
  // Just off the pole: exactly overhead makes the up vector ambiguous and the
  // view flips as soon as the user nudges it.
  top: { theta: 0, phi: 1e-3 },
  front: { theta: 0, phi: Math.PI / 2 },
  side: { theta: Math.PI / 2, phi: Math.PI / 2 }
}, Y = 1e-3, U = Math.PI - 1e-3;
class K {
  constructor(t, { onChange: e = () => {
  } } = {}) {
    this.camera = t, this.onChange = e, this.target = [0, 0, 0], this.distance = 6, this.theta = p.perspective.theta, this.phi = p.perspective.phi, this.drag = null, this.apply();
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
    const e = p[t] || p.perspective;
    return this.theta = e.theta, this.phi = e.phi, this.apply();
  }
  /** Frame a bounding sphere: the "Fit Track" button. */
  fit({ centre: t = [0, 0, 0], extent: e = 1 } = {}) {
    this.target = t.map(Number);
    const s = Number(this.camera?.fov) || 50;
    return this.distance = Math.max(0.2, e * 0.6 / Math.tan(s * Math.PI / 360) + e * 0.15), this.apply();
  }
  orbit(t, e) {
    return this.theta -= t * 5e-3, this.phi = Math.max(Y, Math.min(U, this.phi - e * 5e-3)), this.apply();
  }
  pan(t, e) {
    const s = this.distance * 15e-4, i = [Math.cos(this.theta), 0, -Math.sin(this.theta)], n = [
      -Math.cos(this.phi) * Math.sin(this.theta),
      Math.sin(this.phi),
      -Math.cos(this.phi) * Math.cos(this.theta)
    ];
    return this.target = this.target.map(
      (a, h) => a - i[h] * t * s + n[h] * e * s
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
const j = 24;
function Z(r) {
  const t = (r?.position || [0, 0, 0]).map(Number), e = (r?.target || [0, 0, -1]).map(Number);
  let s = l([
    e[0] - t[0],
    e[1] - t[1],
    e[2] - t[2]
  ], [0, 0, -1]), i = l(b(s, [0, 1, 0]), [1, 0, 0]);
  Math.abs(tt(s, [0, 1, 0])) > 0.9999 && (i = l(b(s, [0, 0, 1]), [1, 0, 0]));
  let n = l(b(i, s), [0, 1, 0]);
  const a = (Number(r?.roll) || 0) * (Math.PI / 180);
  if (a) {
    const h = Math.cos(a), u = Math.sin(a), w = i.map((m, o) => m * h + n[o] * u);
    n = n.map((m, o) => m * h - i[o] * u), i = w;
  }
  return { position: t, right: i, up: n, forward: s };
}
function J(r, { scale: t = 0.35, aspect: e = 16 / 9 } = {}) {
  const { position: s, right: i, up: n, forward: a } = Z(r), h = Math.max(1, Math.min(179, Number(r?.fov) || 53)), u = Math.tan(h * Math.PI / 360) * t, w = u * Math.max(0.05, Number(e) || 1), m = s.map((x, k) => x + a[k] * t), o = (x, k) => m.map((L, _) => L + i[_] * w * x + n[_] * u * k);
  return {
    apex: s,
    corners: [o(-1, 1), o(1, 1), o(1, -1), o(-1, -1)]
  };
}
function Q(r, t) {
  const { apex: e, corners: s } = J(r, t), i = [];
  for (const a of s) i.push(...e, ...a);
  for (let a = 0; a < s.length; a += 1)
    i.push(...s[a], ...s[(a + 1) % s.length]);
  const n = new M();
  return n.setAttribute("position", new g(i, 3)), n;
}
function S(r, { color: t = 9141208, opacity: e = 1, ...s } = {}) {
  const i = new N({ color: t, transparent: e < 1, opacity: e });
  return new T(Q(r, s), i);
}
function $(r, t = j) {
  const e = Array.from(r || []);
  if (e.length <= t) return e;
  const s = (e.length - 1) / Math.max(1, t - 1), i = [];
  for (let n = 0; n < t; n += 1) i.push(e[Math.round(n * s)]);
  return [...new Set(i)];
}
function b(r, t) {
  return [r[1] * t[2] - r[2] * t[1], r[2] * t[0] - r[0] * t[2], r[0] * t[1] - r[1] * t[0]];
}
function tt(r, t) {
  return r[0] * t[0] + r[1] * t[1] + r[2] * t[2];
}
function l(r, t) {
  const e = Math.hypot(r[0], r[1], r[2]);
  return e < 1e-9 ? [...t] : r.map((s) => s / e);
}
const et = 2894904, st = 3816008;
function rt(r) {
  const e = Math.max(1e-6, Number(r) || 0) / 16, s = 10 ** Math.floor(Math.log10(e));
  for (const i of [1, 2, 5, 10])
    if (e <= i * s) return i * s;
  return 10 * s;
}
function A(r = 10) {
  const t = new d();
  t.name = "omnicam-track-grid";
  const e = rt(r), s = Math.max(e * 8, Number(r) * 2 || e * 8), i = Math.max(4, Math.min(80, Math.round(s / e))), n = new E(s, i, st, et);
  n.name = "grid", t.add(n);
  const a = new O(Math.max(e, s * 0.08));
  return a.name = "axes", t.add(a), t;
}
function it(r, t) {
  if (!r) return null;
  const e = A(t);
  for (const s of [...r.children])
    r.remove(s), c(s);
  for (const s of [...e.children]) r.add(s);
  return r;
}
function c(r) {
  r?.traverse?.((e) => {
    e.geometry?.dispose?.();
    const s = e.material;
    Array.isArray(s) ? s.forEach((i) => i?.dispose?.()) : s?.dispose?.();
  }), r?.geometry?.dispose?.();
  const t = r?.material;
  Array.isArray(t) ? t.forEach((e) => e?.dispose?.()) : t?.dispose?.();
}
const I = 8e3;
function nt(r, { limit: t = I, extent: e = 1 } = {}) {
  const s = [];
  for (const a of r || []) {
    const h = [Number(a?.x), Number(a?.y), Number(a?.z)];
    if (h.every(Number.isFinite) && (s.push(h), s.length >= Math.max(0, Math.min(I, Number(t) || 0))))
      break;
  }
  const i = new M();
  i.setAttribute("position", new g(s.flat(), 3));
  const n = Math.max(3e-3, Math.min(0.12, Math.max(1e-3, Number(e) || 1) * 6e-3));
  return new V(i, new D({ color: 7980776, size: n, sizeAttenuation: !0, transparent: !0, opacity: 0.8 }));
}
const v = 9079452, f = 9141208, at = 4630360, ht = 15026253, ot = 2e3;
function ct(r) {
  return (r?.keyframes || []).map((t) => Number(t.frame) || 0).sort((t, e) => t - e);
}
function y(r, t = ot) {
  if (!r?.keyframes?.length) return [];
  const e = Math.max(1, Number(r.duration_frames) || 1), s = Math.max(2, Math.min(t, e)), i = [];
  for (let n = 0; n < s; n += 1) {
    const a = n / (s - 1) * (e - 1), h = G(r, a);
    i.push(h.position.map(Number));
  }
  return i;
}
function F(r) {
  if (!r?.length) return { min: [0, 0, 0], max: [0, 0, 0], centre: [0, 0, 0], extent: 1 };
  const t = [1 / 0, 1 / 0, 1 / 0], e = [-1 / 0, -1 / 0, -1 / 0];
  for (const n of r)
    for (let a = 0; a < 3; a += 1)
      t[a] = Math.min(t[a], n[a]), e[a] = Math.max(e[a], n[a]);
  const s = t.map((n, a) => (n + e[a]) / 2), i = Math.max(1e-3, Math.hypot(e[0] - t[0], e[1] - t[1], e[2] - t[2]));
  return { min: t, max: e, centre: s, extent: i };
}
function P(r, t, { opacity: e = 1 } = {}) {
  const s = new M();
  return s.setAttribute("position", new g(r.flat(), 3)), new B(s, new N({ color: t, transparent: e < 1, opacity: e }));
}
function C(r, t) {
  return new z(new X(t, 12, 8), new H({ color: r }));
}
class ut {
  constructor() {
    this.scene = new q(), this.mode = "refined", this.frame = 0, this.tracks = { raw: null, refined: null }, this.extent = 10, this.gridGroup = A(this.extent), this.pathGroup = new d(), this.frustumGroup = new d(), this.markerGroup = new d(), this.pointGroup = new d(), this.scene.add(this.gridGroup, this.pathGroup, this.frustumGroup, this.markerGroup, this.pointGroup), this.currentFrustum = null, this.currentMarker = C(f, 0.02), this.markerGroup.add(this.currentMarker);
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
  setLandmarks(t) {
    this._clear(this.pointGroup);
    const e = nt(t, { extent: this.extent });
    e.geometry.attributes.position.count && this.pointGroup.add(e);
  }
  activeTrack() {
    return this.mode === "raw" ? this.tracks.raw : this.tracks.refined || this.tracks.raw;
  }
  rebuild() {
    this._clear(this.pathGroup), this._clear(this.frustumGroup);
    const t = this.mode !== "refined" ? y(this.tracks.raw) : [], e = this.mode !== "raw" ? y(this.tracks.refined) : [];
    t.length > 1 && this.pathGroup.add(P(t, v, { opacity: this.mode === "compare" ? 0.75 : 1 })), e.length > 1 && this.pathGroup.add(P(e, f)), this.mode === "compare" && t.length > 1 && e.length > 1 && this.pathGroup.add(this._displacement(t, e));
    const s = e.length ? e : t;
    this.extent = F(s).extent, it(this.gridGroup, this.extent), this._rebuildMarkers(s), this._rebuildFrustums(), this.setFrame(this.frame);
  }
  /** Sampled raw-to-refined offsets: what the cleanup actually changed. */
  _displacement(t, e) {
    const s = Math.min(t.length, e.length), i = Math.max(1, Math.floor(s / 40)), n = [];
    for (let h = 0; h < s; h += i)
      n.push(...t[h], ...e[h]);
    const a = new M();
    return a.setAttribute("position", new g(n, 3)), new T(a, new N({
      color: v,
      transparent: !0,
      opacity: 0.45
    }));
  }
  _rebuildMarkers(t) {
    for (const n of [...this.markerGroup.children])
      n !== this.currentMarker && (this.markerGroup.remove(n), c(n));
    if (t.length < 2) return;
    const e = Math.max(8e-3, this.extent * 0.012), s = C(at, e);
    s.position.set(...t[0]);
    const i = C(ht, e);
    i.position.set(...t[t.length - 1]), this.markerGroup.add(s, i), this.currentMarker.scale.setScalar(Math.max(0.5, e / 0.02));
  }
  _rebuildFrustums() {
    const t = this.activeTrack();
    if (!t) return;
    const e = Math.max(0.05, this.extent * 0.08), s = Math.max(0.05, (Number(t.width) || 16) / Math.max(1, Number(t.height) || 9));
    for (const i of $(ct(t))) {
      const n = S(G(t, i), {
        color: this.mode === "raw" ? v : f,
        opacity: 0.35,
        scale: e,
        aspect: s
      });
      this.frustumGroup.add(n);
    }
  }
  /** Move the current-frame marker and frustum. Never edits the track. */
  setFrame(t) {
    this.frame = Math.max(0, Number(t) || 0);
    const e = this.activeTrack();
    if (!e) return null;
    const s = G(e, this.frame);
    this.currentMarker.position.set(...s.position.map(Number)), this.currentFrustum && (this.scene.remove(this.currentFrustum), c(this.currentFrustum));
    const i = Math.max(0.05, (Number(e.width) || 16) / Math.max(1, Number(e.height) || 9));
    return this.currentFrustum = S(s, {
      color: f,
      scale: Math.max(0.06, this.extent * 0.12),
      aspect: i
    }), this.scene.add(this.currentFrustum), s;
  }
  bounds() {
    const t = y(this.activeTrack());
    return F(t);
  }
  _clear(t) {
    for (const e of [...t.children])
      t.remove(e), c(e);
  }
  dispose() {
    this.currentFrustum && (this.scene.remove(this.currentFrustum), c(this.currentFrustum), this.currentFrustum = null);
    for (const t of [this.pathGroup, this.frustumGroup, this.markerGroup, this.pointGroup, this.gridGroup])
      this._clear(t), this.scene.remove(t);
    c(this.currentMarker), this.tracks = { raw: null, refined: null };
  }
}
class pt {
  constructor(t, { onFrameCamera: e = () => {
  }, rendererFactory: s = (i) => new W(i) } = {}) {
    this.canvas = t, this.onFrameCamera = e, this.disposed = !1, this.pending = 0, this.trackScene = new ut(), this.sceneCamera = new R(50, 16 / 9, 0.01, 1e5), this.solvedCamera = new R(50, 16 / 9, 0.01, 1e5), this.renderCamera = this.sceneCamera, this.inspectionView = "scene", this.frame = 0, this.controls = new K(this.sceneCamera, { onChange: () => this.requestRender() });
    try {
      this.renderer = s({ canvas: t, antialias: !0, alpha: !1 }), this.renderer.setClearColor(1052692, 1);
    } catch (i) {
      console.warn("[OmniCam] track viewer WebGL unavailable", i), this.renderer = null;
    }
    this._bind(), this.resize();
  }
  _bind() {
    if (!this.canvas) return;
    const t = (n) => {
      this.inspectionView !== "camera" && (this.canvas.setPointerCapture?.(n.pointerId), this.controls.beginDrag(n));
    }, e = (n) => {
      this.controls.moveDrag(n) && n.preventDefault();
    }, s = (n) => {
      this.canvas.releasePointerCapture?.(n.pointerId), this.controls.endDrag();
    }, i = (n) => {
      this.inspectionView !== "camera" && (n.preventDefault(), this.controls.wheel(n));
    };
    this.canvas.addEventListener("pointerdown", t), this.canvas.addEventListener("pointermove", e), this.canvas.addEventListener("pointerup", s), this.canvas.addEventListener("pointercancel", s), this.canvas.addEventListener("wheel", i, { passive: !1 }), this.listeners = [
      ["pointerdown", t],
      ["pointermove", e],
      ["pointerup", s],
      ["pointercancel", s],
      ["wheel", i]
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
  setLandmarks(t) {
    this.trackScene.setLandmarks(t), this.requestRender();
  }
  setFrame(t) {
    this.frame = Math.max(0, Number(t) || 0);
    const e = this.trackScene.setFrame(t);
    return e && (this._applySolvedCamera(e), this.onFrameCamera(e)), this.requestRender(), e;
  }
  setView(t) {
    return this.inspectionView === "camera" ? this.inspectionView : (this.controls.setView(t), t);
  }
  fit() {
    const t = this.trackScene.bounds();
    return this.controls.fit(t), t;
  }
  setInspectionView(t) {
    this.inspectionView = t === "camera" ? "camera" : "scene", this.renderCamera = this.inspectionView === "camera" ? this.solvedCamera : this.sceneCamera;
    const e = this.trackScene.setFrame(this.frame);
    return e && this._applySolvedCamera(e), this.requestRender(), this.inspectionView;
  }
  _applySolvedCamera(t) {
    const e = Math.max(0.05, (Number(this.trackScene.activeTrack()?.width) || 16) / Math.max(1, Number(this.trackScene.activeTrack()?.height) || 9));
    this.solvedCamera.aspect = e, this.solvedCamera.fov = Math.max(1, Math.min(179, Number(t.fov) || 50)), this.solvedCamera.position.set(...t.position.map(Number)), this.solvedCamera.up.set(0, 1, 0), this.solvedCamera.lookAt(...t.target.map(Number)), this.solvedCamera.rotateZ((Number(t.roll) || 0) * Math.PI / 180), this.solvedCamera.updateProjectionMatrix?.();
  }
  // -- rendering ---------------------------------------------------------
  resize() {
    const t = this.canvas?.clientWidth || this.canvas?.width || 1, e = this.canvas?.clientHeight || this.canvas?.height || 1;
    for (const s of [this.sceneCamera, this.solvedCamera])
      s.aspect = Math.max(0.05, t / Math.max(1, e)), s.updateProjectionMatrix?.();
    this.renderer?.setSize?.(t, e, !1), this.requestRender();
  }
  requestRender() {
    this.disposed || !this.renderer || this.pending || (this.pending = globalThis.requestAnimationFrame?.(() => {
      this.pending = 0, this.render();
    }) || 0, this.pending || this.render());
  }
  render() {
    this.disposed || !this.renderer || this.renderer.render(this.trackScene.scene, this.renderCamera);
  }
  dispose() {
    this.disposed = !0, this.pending && globalThis.cancelAnimationFrame?.(this.pending), this.pending = 0;
    for (const [t, e] of this.listeners || [])
      this.canvas?.removeEventListener?.(t, e);
    this.listeners = [], this.trackScene.dispose(), this.renderer?.dispose?.(), this.renderer = null, this.canvas = null;
  }
}
export {
  pt as TrackViewer
};
