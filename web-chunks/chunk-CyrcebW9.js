import { L as F, x as z, y as v, z as y, G as l, I as B, J as X, k as H, l as W, B as Y, m as j, M as C, q as R, n as U, p as P, K as D, N as K, U as J, X as Z, c as Q, Y as $, d as O, W as tt } from "./vendor-three-AeKB2-k3.js";
import { s as S } from "./chunk-33SHLJAx.js";
import { T as et } from "./chunk-CcRb1b12.js";
import { c as st } from "./chunk-a2yd8Eqb.js";
const x = {
  perspective: { theta: Math.PI * 0.25, phi: Math.PI * 0.32 },
  // Just off the pole: exactly overhead makes the up vector ambiguous and the
  // view flips as soon as the user nudges it.
  top: { theta: 0, phi: 1e-3 },
  front: { theta: 0, phi: Math.PI / 2 },
  side: { theta: Math.PI / 2, phi: Math.PI / 2 }
}, rt = 1e-3, it = Math.PI - 1e-3;
class nt {
  constructor(t, { onChange: e = () => {
  } } = {}) {
    this.camera = t, this.onChange = e, this.target = [0, 0, 0], this.distance = 6, this.theta = x.perspective.theta, this.phi = x.perspective.phi, this.drag = null, this.apply();
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
    const e = x[t] || x.perspective;
    return this.theta = e.theta, this.phi = e.phi, this.apply();
  }
  /** Frame a bounding sphere: the "Fit Track" button. */
  fit({ centre: t = [0, 0, 0], extent: e = 1 } = {}) {
    this.target = t.map(Number);
    const s = Number(this.camera?.fov) || 50;
    return this.distance = Math.max(0.2, e * 0.6 / Math.tan(s * Math.PI / 360) + e * 0.15), this.apply();
  }
  orbit(t, e) {
    return this.theta -= t * 5e-3, this.phi = Math.max(rt, Math.min(it, this.phi - e * 5e-3)), this.apply();
  }
  pan(t, e) {
    const s = this.distance * 15e-4, i = [Math.cos(this.theta), 0, -Math.sin(this.theta)], n = [
      -Math.cos(this.phi) * Math.sin(this.theta),
      Math.sin(this.phi),
      -Math.cos(this.phi) * Math.cos(this.theta)
    ];
    return this.target = this.target.map(
      (a, o) => a - i[o] * t * s + n[o] * e * s
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
const at = 24;
function ot(r) {
  const t = (r?.position || [0, 0, 0]).map(Number), e = (r?.target || [0, 0, -1]).map(Number);
  let s = b([
    e[0] - t[0],
    e[1] - t[1],
    e[2] - t[2]
  ], [0, 0, -1]), i = b(k(s, [0, 1, 0]), [1, 0, 0]);
  Math.abs(mt(s, [0, 1, 0])) > 0.9999 && (i = b(k(s, [0, 0, 1]), [1, 0, 0]));
  let n = b(k(i, s), [0, 1, 0]);
  const a = (Number(r?.roll) || 0) * (Math.PI / 180);
  if (a) {
    const o = Math.cos(a), h = Math.sin(a), c = i.map((p, u) => p * o + n[u] * h);
    n = n.map((p, u) => p * o - i[u] * h), i = c;
  }
  return { position: t, right: i, up: n, forward: s };
}
function ht(r, { scale: t = 0.35, aspect: e = 16 / 9 } = {}) {
  const { position: s, right: i, up: n, forward: a } = ot(r), o = Math.max(1, Math.min(179, Number(r?.fov) || 53)), h = Math.tan(o * Math.PI / 360) * t, c = h * Math.max(0.05, Number(e) || 1), p = s.map((M, m) => M + a[m] * t), u = (M, m) => p.map((g, I) => g + i[I] * c * M + n[I] * h * m);
  return {
    apex: s,
    corners: [u(-1, 1), u(1, 1), u(1, -1), u(-1, -1)]
  };
}
function ct(r, t) {
  const { apex: e, corners: s } = ht(r, t), i = [];
  for (const a of s) i.push(...e, ...a);
  for (let a = 0; a < s.length; a += 1)
    i.push(...s[a], ...s[(a + 1) % s.length]);
  const n = new v();
  return n.setAttribute("position", new y(i, 3)), n;
}
function T(r, { color: t = 9141208, opacity: e = 1, ...s } = {}) {
  const i = new F({ color: t, transparent: e < 1, opacity: e });
  return new z(ct(r, s), i);
}
function ut(r, t = at) {
  const e = Array.from(r || []);
  if (e.length <= t) return e;
  const s = (e.length - 1) / Math.max(1, t - 1), i = [];
  for (let n = 0; n < t; n += 1) i.push(e[Math.round(n * s)]);
  return [...new Set(i)];
}
function k(r, t) {
  return [r[1] * t[2] - r[2] * t[1], r[2] * t[0] - r[0] * t[2], r[0] * t[1] - r[1] * t[0]];
}
function mt(r, t) {
  return r[0] * t[0] + r[1] * t[1] + r[2] * t[2];
}
function b(r, t) {
  const e = Math.hypot(r[0], r[1], r[2]);
  return e < 1e-9 ? [...t] : r.map((s) => s / e);
}
const pt = 2894904, dt = 3816008;
function lt(r) {
  const e = Math.max(1e-6, Number(r) || 0) / 16, s = 10 ** Math.floor(Math.log10(e));
  for (const i of [1, 2, 5, 10])
    if (e <= i * s) return i * s;
  return 10 * s;
}
function q(r = 10) {
  const t = new l();
  t.name = "omnicam-track-grid";
  const e = lt(r), s = Math.max(e * 8, Number(r) * 2 || e * 8), i = Math.max(4, Math.min(80, Math.round(s / e))), n = new B(s, i, dt, pt);
  n.name = "grid", t.add(n);
  const a = new X(Math.max(e, s * 0.08));
  return a.name = "axes", t.add(a), t;
}
function L(r, t) {
  if (!r) return null;
  const e = q(t);
  for (const s of [...r.children])
    r.remove(s), d(s);
  for (const s of [...e.children]) r.add(s);
  return r;
}
function d(r) {
  r?.traverse?.((e) => {
    e.geometry?.dispose?.();
    const s = e.material;
    Array.isArray(s) ? s.forEach((i) => i?.dispose?.()) : s?.dispose?.();
  }), r?.geometry?.dispose?.();
  const t = r?.material;
  Array.isArray(t) ? t.forEach((e) => e?.dispose?.()) : t?.dispose?.();
}
const A = 8e3;
function ft(r, { limit: t = A, extent: e = 1 } = {}) {
  const s = [];
  for (const a of r || []) {
    const o = [Number(a?.x), Number(a?.y), Number(a?.z)];
    if (o.every(Number.isFinite) && (s.push(o), s.length >= Math.max(0, Math.min(A, Number(t) || 0))))
      break;
  }
  const i = new v();
  i.setAttribute("position", new y(s.flat(), 3));
  const n = Math.max(3e-3, Math.min(0.12, Math.max(1e-3, Number(e) || 1) * 6e-3));
  return new H(i, new W({ color: 7980776, size: n, sizeAttenuation: !0, transparent: !0, opacity: 0.8 }));
}
const f = Math.PI / 180, Mt = {
  room: 5989490,
  blockout_object: 9141208,
  asset_proxy: 4630360,
  reference: 3817290
}, gt = 9141208;
function xt(r, t) {
  const [e, s, i] = t.map((n) => Math.max(0.01, Math.abs(Number(n) || 0.01)));
  if (r === "sphere") return new D(Math.max(e, s, i) / 2, 16, 12);
  if (r === "cylinder") return new K(Math.max(e, i) / 2, Math.max(e, i) / 2, s, 16);
  if (r === "torus") {
    const n = Math.max(e, i) / 2, a = new J(n, n * 0.35, 12, 24);
    return a.rotateX(Math.PI / 2), a;
  }
  if (r === "human") {
    const n = st(et);
    return n.scale(e, s, i), n;
  }
  return new Z(e, s, i);
}
class bt {
  constructor() {
    this.group = new l(), this.props = new l(), this.group.add(this.props), this._loader = null, this._loadToken = 0, this._box = new Y();
  }
  loader() {
    return this._loader ||= new j(), this._loader;
  }
  clear() {
    this._loadToken += 1;
    for (const t of [...this.group.children])
      t !== this.props && (this.group.remove(t), d(t));
    for (const t of [...this.props.children])
      this.props.remove(t), d(t);
  }
  /**
   * @param motionScene the reconstruction result (MotionScene v1 dict).
   * @param resolveAssetUrl maps an annotated asset ref to a loadable URL.
   */
  setScene(t, { resolveAssetUrl: e = (i) => i, onPropLoaded: s = () => {
  } } = {}) {
    this.clear();
    const i = Array.isArray(t?.objects) ? t.objects : [], n = this._loadToken;
    for (const o of i) {
      if (!o || o.enabled === !1 || o.type === "null") continue;
      const h = o?.reconstruction?.role || "", c = Mt[h] ?? gt, p = (o.position || [0, 0, 0]).map(Number), u = (o.rotation || [0, 0, 0]).map(Number), M = o.size || [1, 1, 1];
      if ((o.type === "glb" || o.type === "model") && o.asset) {
        this._loadProp(o, e(o.asset), n, s);
        continue;
      }
      const m = new C(
        xt(o.type, M),
        new R({ color: c, wireframe: !0, transparent: !0, opacity: 0.9 })
      );
      m.position.set(p[0], p[1], p[2]), m.rotation.set(u[0] * f, u[1] * f, u[2] * f);
      const g = new C(
        m.geometry,
        new R({ color: c, transparent: !0, opacity: 0.06, side: U, depthWrite: !1 })
      );
      g.position.copy(m.position), g.rotation.copy(m.rotation), this.group.add(m, g);
    }
    const a = t?.cameras?.[0]?.track?.keyframes?.[0]?.camera || t?.cameras?.[0]?.camera;
    if (a?.position && a?.target) {
      const o = Math.max(0.05, Number(t?.canvas?.width || 16) / Math.max(1, Number(t?.canvas?.height || 9))), h = this.bounds().extent || 4, c = T(
        { position: a.position.map(Number), target: a.target.map(Number), fov: Number(a.fov) || 50, roll: Number(a.roll) || 0 },
        { color: 15057019, opacity: 0.7, scale: Math.max(0.1, h * 0.15), aspect: o }
      );
      this.group.add(c);
    }
  }
  _loadProp(t, e, s, i = () => {
  }) {
    if (!e) return;
    const n = (t.position || [0, 0, 0]).map(Number), a = (t.rotation || [0, 0, 0]).map(Number), o = (t.size || [1, 1, 1]).map((h) => Math.max(1e-3, Number(h) || 1e-3));
    this.loader().load(
      e,
      (h) => {
        if (s !== this._loadToken) return;
        const c = h.scene || h.scenes?.[0];
        c && (c.position.set(n[0], n[1], n[2]), c.rotation.set(a[0] * f, a[1] * f, a[2] * f), c.scale.set(o[0], o[1], o[2]), this.props.add(c), i());
      },
      void 0,
      () => {
      }
      // a missing prop is not fatal -- the box stays
    );
  }
  bounds() {
    if (this._box.makeEmpty(), this._box.setFromObject(this.group), this._box.isEmpty()) return { centre: [0, 0, 0], extent: 0 };
    const t = this._box.getCenter(new P()), e = this._box.getSize(new P());
    return {
      centre: [t.x, t.y, t.z],
      extent: Math.max(1e-3, Math.hypot(e.x, e.y, e.z))
    };
  }
  get hasContent() {
    return this.group.children.some((t) => t !== this.props) || this.props.children.length > 0;
  }
  dispose() {
    this.clear(), d(this.group);
  }
}
const G = 9079452, w = 9141208, wt = 4630360, vt = 15026253, yt = 2e3;
function kt(r) {
  return (r?.keyframes || []).map((t) => Number(t.frame) || 0).sort((t, e) => t - e);
}
function N(r, t = yt) {
  if (!r?.keyframes?.length) return [];
  const e = Math.max(1, Number(r.duration_frames) || 1), s = Math.max(2, Math.min(t, e)), i = [];
  for (let n = 0; n < s; n += 1) {
    const a = n / (s - 1) * (e - 1), o = S(r, a);
    i.push(o.position.map(Number));
  }
  return i;
}
function V(r) {
  if (!r?.length) return { min: [0, 0, 0], max: [0, 0, 0], centre: [0, 0, 0], extent: 1 };
  const t = [1 / 0, 1 / 0, 1 / 0], e = [-1 / 0, -1 / 0, -1 / 0];
  for (const n of r)
    for (let a = 0; a < 3; a += 1)
      t[a] = Math.min(t[a], n[a]), e[a] = Math.max(e[a], n[a]);
  const s = t.map((n, a) => (n + e[a]) / 2), i = Math.max(1e-3, Math.hypot(e[0] - t[0], e[1] - t[1], e[2] - t[2]));
  return { min: t, max: e, centre: s, extent: i };
}
function E(r, t, { opacity: e = 1 } = {}) {
  const s = new v();
  return s.setAttribute("position", new y(r.flat(), 3)), new $(s, new F({ color: t, transparent: e < 1, opacity: e }));
}
function _(r, t) {
  return new C(new D(t, 12, 8), new R({ color: r }));
}
class Gt {
  constructor() {
    this.scene = new Q(), this.mode = "refined", this.frame = 0, this.tracks = { raw: null, refined: null }, this.extent = 10, this.inspectionView = "scene", this.gridGroup = q(this.extent), this.pathGroup = new l(), this.frustumGroup = new l(), this.markerGroup = new l(), this.pointGroup = new l(), this.sceneOverlay = new bt(), this.scene.add(
      this.gridGroup,
      this.pathGroup,
      this.frustumGroup,
      this.markerGroup,
      this.pointGroup,
      this.sceneOverlay.group
    ), this.currentFrustum = null, this.currentMarker = _(w, 0.02), this.markerGroup.add(this.currentMarker);
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
  /** Hide the active camera's own path/frustums when looking through its lens. */
  setInspectionView(t) {
    this.inspectionView = t === "camera" ? "camera" : "scene";
    const e = this.inspectionView !== "camera";
    this.pathGroup.visible = e, this.frustumGroup.visible = e, this.markerGroup.visible = e, this.currentFrustum && (this.currentFrustum.visible = e);
  }
  setLandmarks(t) {
    this._clear(this.pointGroup);
    const e = ft(t, { extent: this.extent });
    e.geometry.attributes.position.count && this.pointGroup.add(e);
  }
  /** Draw a reconstructed MotionScene alongside the (usually empty) track. */
  setReconstructedScene(t, e) {
    this.sceneOverlay.setScene(t, e), this.sceneOverlay.hasContent && (this.extent = Math.max(this.extent, this.sceneOverlay.bounds().extent), L(this.gridGroup, this.extent));
  }
  hasReconstructedScene() {
    return this.sceneOverlay.hasContent;
  }
  activeTrack() {
    return this.mode === "raw" ? this.tracks.raw : this.tracks.refined || this.tracks.raw;
  }
  rebuild() {
    this._clear(this.pathGroup), this._clear(this.frustumGroup);
    const t = this.mode !== "refined" ? N(this.tracks.raw) : [], e = this.mode !== "raw" ? N(this.tracks.refined) : [];
    t.length > 1 && this.pathGroup.add(E(t, G, { opacity: this.mode === "compare" ? 0.75 : 1 })), e.length > 1 && this.pathGroup.add(E(e, w)), this.mode === "compare" && t.length > 1 && e.length > 1 && this.pathGroup.add(this._displacement(t, e));
    const s = e.length ? e : t;
    this.extent = V(s).extent, L(this.gridGroup, this.extent), this._rebuildMarkers(s), this._rebuildFrustums(), this.setFrame(this.frame);
  }
  /** Sampled raw-to-refined offsets: what the cleanup actually changed. */
  _displacement(t, e) {
    const s = Math.min(t.length, e.length), i = Math.max(1, Math.floor(s / 40)), n = [];
    for (let o = 0; o < s; o += i)
      n.push(...t[o], ...e[o]);
    const a = new v();
    return a.setAttribute("position", new y(n, 3)), new z(a, new F({
      color: G,
      transparent: !0,
      opacity: 0.45
    }));
  }
  _rebuildMarkers(t) {
    for (const n of [...this.markerGroup.children])
      n !== this.currentMarker && (this.markerGroup.remove(n), d(n));
    if (t.length < 2) return;
    const e = Math.max(8e-3, this.extent * 0.012), s = _(wt, e);
    s.position.set(...t[0]);
    const i = _(vt, e);
    i.position.set(...t[t.length - 1]), this.markerGroup.add(s, i), this.currentMarker.scale.setScalar(Math.max(0.5, e / 0.02));
  }
  _rebuildFrustums() {
    const t = this.activeTrack();
    if (!t) return;
    const e = Math.max(0.05, this.extent * 0.08), s = Math.max(0.05, (Number(t.width) || 16) / Math.max(1, Number(t.height) || 9));
    for (const i of ut(kt(t))) {
      const n = T(S(t, i), {
        color: this.mode === "raw" ? G : w,
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
    const s = S(e, this.frame);
    this.currentMarker.position.set(...s.position.map(Number)), this.currentFrustum && (this.scene.remove(this.currentFrustum), d(this.currentFrustum));
    const i = Math.max(0.05, (Number(e.width) || 16) / Math.max(1, Number(e.height) || 9));
    return this.currentFrustum = T(s, {
      color: w,
      scale: Math.max(0.06, this.extent * 0.12),
      aspect: i
    }), this.currentFrustum.visible = this.inspectionView !== "camera", this.scene.add(this.currentFrustum), s;
  }
  bounds() {
    const t = N(this.activeTrack()), e = V(t);
    if (!this.sceneOverlay.hasContent) return e;
    const s = this.sceneOverlay.bounds();
    if (t.length < 2) return { ...s, min: s.centre, max: s.centre };
    const i = e.centre.map((a, o) => (a + s.centre[o]) / 2), n = Math.hypot(...e.centre.map((a, o) => a - s.centre[o]));
    return { ...e, centre: i, extent: Math.max(e.extent, s.extent) + n };
  }
  _clear(t) {
    for (const e of [...t.children])
      t.remove(e), d(e);
  }
  dispose() {
    this.currentFrustum && (this.scene.remove(this.currentFrustum), d(this.currentFrustum), this.currentFrustum = null);
    for (const t of [this.pathGroup, this.frustumGroup, this.markerGroup, this.pointGroup, this.gridGroup])
      this._clear(t), this.scene.remove(t);
    this.scene.remove(this.sceneOverlay.group), this.sceneOverlay.dispose(), d(this.currentMarker), this.tracks = { raw: null, refined: null };
  }
}
class St {
  constructor(t, { onFrameCamera: e = () => {
  }, rendererFactory: s = (i) => new tt(i) } = {}) {
    this.canvas = t, this.onFrameCamera = e, this.disposed = !1, this.pending = 0, this.trackScene = new Gt(), this.sceneCamera = new O(50, 16 / 9, 0.01, 1e5), this.solvedCamera = new O(50, 16 / 9, 0.01, 1e5), this.renderCamera = this.sceneCamera, this.inspectionView = "scene", this.frame = 0, this.controls = new nt(this.sceneCamera, { onChange: () => this.requestRender() });
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
  /** Draw a reconstructed MotionScene in the same read-only view (Extractor
   * "Scene 3D" preview). Async GLB props stream in and each triggers a redraw. */
  setReconstructedScene(t, e = {}) {
    this.trackScene.setReconstructedScene(t, {
      ...e,
      onPropLoaded: () => this.requestRender()
    }), this.requestRender();
  }
  hasReconstructedScene() {
    return this.trackScene.hasReconstructedScene();
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
    this.inspectionView = t === "camera" ? "camera" : "scene", this.renderCamera = this.inspectionView === "camera" ? this.solvedCamera : this.sceneCamera, this.trackScene.setInspectionView(this.inspectionView);
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
  St as TrackViewer
};
