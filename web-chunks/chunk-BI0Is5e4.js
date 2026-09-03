import { G as E, D as _e, M as se, P as pe, a as xe, S as st, b as ot, C as at, c as he, E as nt, A as it, d as ce, N as ct, e as ke, f as lt, B as Ae, g as dt, h as ut, i as mt, j as ht, k as ft, l as pt, m as De, n as le, F as gt, o as wt, H as Oe, L as yt, p as Mt, q as xt, r as bt, s as vt, t as Ct, u as St, v as de, O as Te, w as Fe, x as ze, y as Bt, z as We, I as je, Q as Lt, J as Ne, K as Ie, T as Ue, U as Vt, V as qe, W as Re, X as Pt, Y as Gt, Z as $e, _ as _t, $ as kt, a0 as be, a1 as ge, a2 as Ke, a3 as Xe, a4 as At, a5 as Dt, a6 as Ot, a7 as Tt, a8 as Ft, a9 as Ye, aa as Qe, ab as Ze, ac as Je, ad as He } from "./chunk-BNTXm8ZY.js";
import { a4 as zt, E as Wt, s as jt, f as Nt } from "./chunk-BPJtqaNk.js";
import { q as It, a as Le, s as Ee, D as Ve, c as Ut, b as qt, d as Rt } from "./chunk-CynrCD75.js";
import { O as $t, B as Kt, W as Xt, C as Yt, Q as Qt, c as Zt } from "./chunk-CcqF7PHi.js";
const we = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ACESFilmicToneMapping: it,
  AnimationMixer: ke,
  AxesHelper: lt,
  Box3: Ae,
  Box3Helper: dt,
  BoxGeometry: ut,
  BufferGeometry: mt,
  CanvasTexture: at,
  CatmullRomCurve3: ht,
  Color: ce,
  ConeGeometry: ft,
  CylinderGeometry: pt,
  DataTexture: De,
  DirectionalLight: _e,
  DoubleSide: le,
  EquirectangularReflectionMapping: nt,
  Float32BufferAttribute: gt,
  GridHelper: wt,
  Group: E,
  HemisphereLight: Oe,
  Line: yt,
  Line3: Mt,
  LineBasicMaterial: xt,
  LineDashedMaterial: bt,
  LineSegments: vt,
  MathUtils: Ct,
  Matrix4: St,
  Mesh: se,
  MeshBasicMaterial: de,
  MeshStandardMaterial: xe,
  NoToneMapping: ct,
  OrthographicCamera: Te,
  PCFSoftShadowMap: Fe,
  PMREMGenerator: ot,
  PerspectiveCamera: ze,
  Plane: Bt,
  PlaneGeometry: pe,
  Points: We,
  PointsMaterial: je,
  Quaternion: Lt,
  RGBAFormat: Ne,
  Raycaster: Ie,
  RepeatWrapping: Ue,
  RingGeometry: Vt,
  SRGBColorSpace: he,
  Scene: qe,
  ShadowMaterial: st,
  SkeletonHelper: Re,
  SkinnedMesh: Pt,
  SphereGeometry: Gt,
  Texture: $e,
  TextureLoader: _t,
  TubeGeometry: kt,
  Vector2: be,
  Vector3: ge,
  VideoTexture: Ke,
  WebGLRenderer: Xe,
  WireframeGeometry: At
}, Symbol.toStringTag, { value: "Module" }));
function Jt(t, { position: e, forward: n, up: l, color: v, scale: p = 1, active: B = !0 }) {
  const S = new t.Group(), z = B ? 0.95 : 0.5, G = new t.MeshBasicMaterial({
    color: v,
    transparent: !0,
    opacity: z,
    depthTest: !1
  }), D = new t.Mesh(new t.BoxGeometry(0.34, 0.24, 0.42), G);
  D.renderOrder = 912, S.add(D);
  const _ = new t.Mesh(new t.ConeGeometry(0.17, 0.26, 20), G);
  return _.rotation.x = -Math.PI / 2, _.position.z = -0.32, _.renderOrder = 912, S.add(_), S.scale.setScalar(p), S.position.copy(e), S.up.copy(l), S.lookAt(e.clone().add(n)), S;
}
function Ht(t, { position: e, color: n = 15903035, radius: l = 0.28, bold: v = !1 }) {
  const p = new t.Group(), B = v ? 16773544 : n, S = new t.LineBasicMaterial({ color: B, transparent: !0, opacity: v ? 1 : 0.95, depthTest: !1 }), z = (_) => {
    const A = [];
    for (let Z = 0; Z <= 48; Z++) {
      const Y = Z / 48 * Math.PI * 2;
      A.push(new t.Vector3(Math.cos(Y) * _, Math.sin(Y) * _, 0));
    }
    const X = new t.Line(new t.BufferGeometry().setFromPoints(A), S);
    return X.renderOrder = 915, X;
  };
  if (p.add(z(l)), v) {
    p.add(z(l * 1.18));
    const _ = new t.Mesh(
      new t.RingGeometry(0, l * 0.3, 16),
      new t.MeshBasicMaterial({ color: B, transparent: !0, opacity: 1, depthTest: !1 })
    );
    _.renderOrder = 916, p.add(_);
  }
  const G = l * 1.55, D = new t.LineSegments(
    new t.BufferGeometry().setFromPoints([
      new t.Vector3(-G, 0, 0),
      new t.Vector3(-l * 0.45, 0, 0),
      new t.Vector3(l * 0.45, 0, 0),
      new t.Vector3(G, 0, 0),
      new t.Vector3(0, -G, 0),
      new t.Vector3(0, -l * 0.45, 0),
      new t.Vector3(0, l * 0.45, 0),
      new t.Vector3(0, G, 0)
    ]),
    S
  );
  return D.renderOrder = 915, p.add(D), p.position.copy(e), p.userData.omnicamBillboard = !0, p;
}
const ye = 3718648, Et = 12e3;
function ue(t) {
  return !!(t.isSkinnedMesh && t.skeleton);
}
function et(t, e) {
  t.position.copy(e.position), t.quaternion.copy(e.quaternion), t.scale.copy(e.scale);
}
function me(t) {
  return t.frustumCulled = !1, t.raycast = () => {
  }, t.userData.omnicamHelper = !0, t;
}
function er(t, e) {
  if (ue(e)) {
    const l = new t.SkinnedMesh(e.geometry.clone(), new t.MeshBasicMaterial({
      color: ye,
      wireframe: !0,
      transparent: !0,
      opacity: 0.45,
      depthWrite: !1
    }));
    return l.bindMode = e.bindMode, l.bind(e.skeleton, e.bindMatrix), et(l, e), { overlay: me(l), parent: e.parent || e };
  }
  const n = new t.LineSegments(
    new t.WireframeGeometry(e.geometry),
    new t.LineBasicMaterial({ color: ye, opacity: 0.45, transparent: !0 })
  );
  return { overlay: me(n), parent: e };
}
function tr(t, e) {
  const n = new t.PointsMaterial({ color: ye, size: 0.05, sizeAttenuation: !0 });
  if (!ue(e)) {
    const _ = new t.Points(e.geometry, n);
    return { overlay: me(_), parent: e };
  }
  const l = e.geometry.getAttribute("position")?.count || 0, v = Math.max(1, Math.ceil(l / Et)), p = Math.ceil(l / v), B = new Float32Array(p * 3), S = new t.BufferGeometry();
  S.setAttribute("position", new t.Float32BufferAttribute(B, 3));
  const z = new t.Points(S, n);
  et(z, e);
  const G = new t.Vector3(), D = S.getAttribute("position");
  return z.onBeforeRender = () => {
    for (let _ = 0; _ < p; _++)
      e.getVertexPosition(_ * v, G), D.setXYZ(_, G.x, G.y, G.z);
    D.needsUpdate = !0;
  }, { overlay: me(z), parent: e.parent || e };
}
function rr(t, e, n) {
  const l = ue(e) ? new t.SkinnedMesh(e.geometry.clone(), n) : new t.Mesh(e.geometry.clone(), n);
  return ue(e) && (l.bindMode = e.bindMode, l.bind(e.skeleton, e.bindMatrix)), l.matrixAutoUpdate = !1, l.matrix.copy(e.matrixWorld), l.frustumCulled = !1, l;
}
function sr(t, e, { wireframe: n = !1, vertices: l = !1 } = {}) {
  if (!n && !l) return;
  const v = [];
  e.traverse((p) => {
    p.isMesh && p.geometry && !p.userData.omnicamHelper && v.push(p);
  });
  for (const p of v) {
    if (n) {
      const { overlay: B, parent: S } = er(t, p);
      S.add(B);
    }
    if (l) {
      const { overlay: B, parent: S } = tr(t, p);
      S.add(B);
    }
  }
}
function or(t) {
  const { THREE: e, FBXLoader: n, GLTFLoader: l, OBJLoader: v, PLYLoader: p, STLLoader: B, neutral: S, wire: z, checkerMaterial: G, objectMaterial: D, applyModelMaterial: _, disposeObject: A, textureFor: J, cardMesh: X, generatePointField: Z, sampleCamera: Y, sampleObjectTransform: ee } = t;
  return {
    removeModel(x) {
      const y = this.models.get(x);
      y && A(y.scene, !0), this.models.delete(x), this.modelLoads.delete(x), this.sceneKey = "";
    },
    selectAnimation(x, y) {
      const s = this.models.get(x);
      !s?.mixer || !s.clips.length || (s.selectedClip = Math.max(0, Math.min(s.clips.length - 1, Number(y) || 0)), s.duration = s.clips[s.selectedClip].duration || 0, s.mixer.stopAllAction(), s.mixer.clipAction(s.clips[s.selectedClip]).play(), this.invalidate());
    },
    rebuild(x, y, s) {
      this.content.traverse((r) => {
        for (const o of [...r.children])
          o.userData.omnicamHelper && (r.remove(o), A(o, !0));
      }), A(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const i = x.render_mode, m = new e.GridHelper(120, 120, 7829367, 3881787);
      if (m.userData.omnicamCaptureGuide = !0, m.frustumCulled = !1, this.content.add(m), ["omni_ref", "point_field"].includes(i)) {
        const { points: r, colors: o } = Z(x.point_density || "balanced", x.point_spread || "all_views", x.point_color || null);
        if (r.length > 0) {
          const w = new e.BufferGeometry();
          w.setAttribute("position", new e.Float32BufferAttribute(r, 3)), w.setAttribute("color", new e.Float32BufferAttribute(o, 3));
          const h = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), g = new e.Points(w, h);
          g.frustumCulled = !1, this.content.add(g);
        }
      }
      if (!["grid", "point_field"].includes(i))
        for (const r of x.objects) {
          if (r.enabled === !1) continue;
          const o = r.size || [1, 1, 1];
          let w;
          if (r.type === "glb" || r.type === "model") {
            const h = s.get(r.id), g = this.models.get(r.id), d = r.format || (r.type === "glb" ? "glb" : "");
            h && (g?.url !== h || g?.format !== d) && this.loadModel(r.id, h, d), g?.url === h ? (w = g.scene, _(w, r.material_mode || "textured")) : w = new e.Mesh(new e.BoxGeometry(o[0], o[1], o[2] || 1), z.clone());
          } else if (r.type === "sphere") w = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), D(r, i));
          else if (r.type === "ground") w = new e.Mesh(new e.BoxGeometry(1, 1, 1), D(r, i));
          else if (r.type === "card")
            w = r.material_mode && r.material_mode !== "textured" ? new e.Mesh(new e.PlaneGeometry(o[0], o[1]), D(r, i)) : X(r, y.get(r.id), x.card_fit || "contain");
          else if (r.type === "null") {
            const h = new e.AxesHelper(0.5);
            h.position.fromArray(r.position || [0, 0, 0]), h.userData.omnicamId = r.id, h.frustumCulled = !1, this.objectNodes.set(r.id, h), this.content.add(h);
            continue;
          } else
            w = new e.Mesh(new e.BoxGeometry(1, 1, 1), D(r, i));
          w.position.fromArray(r.position || [0, 0, 0]), w.rotation.set(...(r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), r.type !== "card" && w.scale.fromArray(o), w.userData.omnicamId = r.id, w.frustumCulled = !1, w.traverse((h) => {
            h.frustumCulled = !1, h.userData.omnicamId = r.id;
          }), sr(e, w, { wireframe: x.show_wireframe, vertices: x.show_vertices }), this.objectNodes.set(r.id, w), this.content.add(w);
        }
    },
    rebuildPath(x, y = "camera", s = null, i = "") {
      A(this.path), this.path.clear();
      const m = i === "camera" ? x.active_camera_id : null, r = [
        { line: 4891631, marker: 9090296, frustum: 4025246 },
        // Camera 1 - Blue/Cyan
        { line: 15903035, marker: 16638023, frustum: 9200158 },
        // Camera 2 - Amber/Gold
        { line: 4769652, marker: 8843180, frustum: 2255676 },
        // Camera 3 - Emerald
        { line: 11888088, marker: 15235577, frustum: 7221132 },
        // Camera 4 - Purple
        { line: 15485081, marker: 16020150, frustum: 9183579 }
        // Camera 5 - Pink
      ];
      (x.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: x.keyframes || [] }]).forEach((h, g) => {
        const d = h.keyframes || [];
        if (d.length === 0 || h.id === m) return;
        const a = h.color ? { line: new e.Color(h.color), marker: new e.Color(h.color), frustum: new e.Color(h.color) } : r[g % r.length], u = h.id === x.active_camera_id, V = u && y === "camera";
        if (d.length >= 2) {
          const C = d[0].frame, M = d[d.length - 1].frame, f = Math.max(32, Math.min(256, M - C + 1)), L = { ...h, keyframes: d, objects: x.objects }, O = Array.from({ length: f }, (R, P) => {
            const q = C + (M - C) * P / Math.max(1, f - 1);
            return new e.Vector3().fromArray(Y(L, q, x.objects).position);
          }), I = new e.CatmullRomCurve3(O, !1, "centripetal"), k = V ? 0.06 : u ? 0.045 : 0.025, T = new e.MeshBasicMaterial({
            color: a.line,
            transparent: !0,
            opacity: u ? 1 : 0.55,
            depthTest: !1
          }), W = new e.Mesh(new e.TubeGeometry(I, Math.max(48, f), k, 8, !1), T);
          if (W.renderOrder = 900, W.userData.omnicamWidget = "path", this.path.add(W), u) {
            const R = new e.Mesh(
              new e.TubeGeometry(I, Math.max(48, f), k * (V ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: a.line, transparent: !0, opacity: V ? 0.3 : 0.18, depthTest: !1 })
            );
            R.renderOrder = 899, R.userData.omnicamWidget = "path", this.path.add(R);
          }
        }
        for (const C of d) {
          const M = new e.Mesh(
            new e.SphereGeometry(u ? 0.13 : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: a.marker, depthTest: !1 })
          );
          M.position.fromArray(C.camera.position), M.renderOrder = 910, M.userData.omnicamPathKey = { cameraId: h.id, frame: C.frame }, M.userData.omnicamWidget = "path", this.path.add(M);
          const f = new e.Vector3().fromArray(C.camera.position), L = new e.Vector3().fromArray(C.camera.target || [0, 0, 0]), O = u && s != null && C.frame === s;
          if (O) {
            const I = L.clone().sub(f).normalize();
            let k = new e.Vector3().crossVectors(I, new e.Vector3(0, 1, 0));
            k.lengthSq() < 1e-8 ? k.set(1, 0, 0) : k.normalize();
            const T = new e.Vector3().crossVectors(k, I).normalize(), W = e.MathUtils.clamp(f.distanceTo(L) * 0.08, 0.25, 0.8), R = C.camera.camera_type === "orthographic" ? W * 0.55 : W * Math.tan(e.MathUtils.degToRad(C.camera.fov || 35) * 0.5), P = R * (x.width || 16) / Math.max(1, x.height || 9), q = f.clone().addScaledVector(I, W), $ = [
              q.clone().addScaledVector(k, -P).addScaledVector(T, -R),
              q.clone().addScaledVector(k, P).addScaledVector(T, -R),
              q.clone().addScaledVector(k, P).addScaledVector(T, R),
              q.clone().addScaledVector(k, -P).addScaledVector(T, R)
            ], c = [];
            for (const F of $) c.push(f, F);
            for (let F = 0; F < 4; F++) c.push($[F], $[(F + 1) % 4]);
            const b = new e.BufferGeometry().setFromPoints(c), j = new e.LineSegments(b, new e.LineBasicMaterial({
              color: a.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            j.userData.omnicamWidget = "gizmo", this.path.add(j);
            const N = Jt(e, {
              position: f,
              forward: I,
              up: T,
              color: a.marker,
              scale: e.MathUtils.clamp(W * 1.15, 0.35, 1.6),
              active: u
            });
            N.userData.omnicamWidget = "gizmo", this.path.add(N);
          }
          if (O) {
            const I = Ht(e, {
              position: L,
              radius: e.MathUtils.clamp(f.distanceTo(L) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            I.userData.omnicamWidget = "lookat", this.path.add(I);
            const k = new e.Line(
              new e.BufferGeometry().setFromPoints([f.clone(), L.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            k.renderOrder = 914, k.userData.omnicamWidget = "lookat", this.path.add(k);
          }
        }
      });
      const w = [16742005, 52937, 16632686, 7101671, 14774357];
      (x.objects || []).forEach((h, g) => {
        const d = h.keyframes || [];
        if (d.length < 2) return;
        const a = h.color ? new e.Color(h.color) : w[g % w.length], u = d.map((M) => new e.Vector3().fromArray(M.transform?.position || [0, 0, 0])), V = new e.CatmullRomCurve3(u, !1, "centripetal"), C = new e.Mesh(
          new e.TubeGeometry(V, Math.max(32, d.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: a, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        C.renderOrder = 900, C.userData.omnicamWidget = "path", this.path.add(C);
        for (const M of d) {
          const f = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: a, depthTest: !1 })
          );
          f.position.fromArray(M.transform?.position || [0, 0, 0]), f.renderOrder = 910, f.userData.omnicamWidget = "path", this.path.add(f);
        }
      });
    }
  };
}
function ar(t) {
  const { THREE: e, FBXLoader: n, GLTFLoader: l, OBJLoader: v, PLYLoader: p, STLLoader: B, neutral: S, wire: z, checkerMaterial: G, objectMaterial: D, applyModelMaterial: _, disposeObject: A, textureFor: J, cardMesh: X, generatePointField: Z, sampleCamera: Y, sampleObjectTransform: ee, hasOutlineMesh: x } = t;
  return {
    updateLiveCameras(y, s, i, m, r = "camera", o = null) {
      if (A(this.liveCameras), this.liveCameras.clear(), i) return;
      const w = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (y.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: y.keyframes || [] }]).forEach((g, d) => {
        const a = g.color ? { line: new e.Color(g.color), marker: new e.Color(g.color), frustum: new e.Color(g.color), body: new e.Color(g.color).multiplyScalar(0.35) } : w[d % w.length], u = g.id === y.active_camera_id, V = u && r === "camera", C = m === "camera" && u, M = Y(g, s, y.objects), f = new e.Vector3().fromArray(M.position || [0, 0, 0]), L = new e.Vector3().fromArray(M.target || [0, 0, 0]), O = L.clone().sub(f), I = O.length();
        I < 1e-4 ? O.set(0, 0, -1) : O.normalize();
        let k = new e.Vector3(0, 1, 0), T = new e.Vector3().crossVectors(O, k);
        T.lengthSq() < 1e-6 && (k = new e.Vector3(0, 0, 1), T = new e.Vector3().crossVectors(O, k)), T.normalize();
        let W = new e.Vector3().crossVectors(T, O).normalize();
        if (M.roll) {
          const P = e.MathUtils.degToRad(M.roll);
          T.applyAxisAngle(O, P), W.applyAxisAngle(O, P);
        }
        const R = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!C) {
          const P = new e.Group(), q = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: a.body, roughness: 0.4, metalness: 0.8 })
          );
          q.position.set(0, 0, -0.11), P.add(q);
          const $ = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          $.rotateX(Math.PI / 2);
          const c = new e.Mesh(
            $,
            new e.MeshStandardMaterial({ color: a.marker, roughness: 0.2, metalness: 0.9 })
          );
          c.position.set(0, 0, 0.05), P.add(c);
          const b = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: u ? 16729156 : a.marker })
          );
          b.position.set(0, 0.07, -0.08), P.add(b);
          const j = new e.Matrix4().makeBasis(T, W, O.clone().negate());
          P.quaternion.setFromRotationMatrix(j), P.position.copy(f), P.userData.omnicamWidget = "gizmo", this.liveCameras.add(P);
          const N = new e.SphereGeometry(0.35, 8, 6), F = new e.Mesh(N, R);
          F.position.copy(f), F.userData = { omnicamType: "camera", omnicamId: g.id }, this.liveCameras.add(F);
          const U = e.MathUtils.clamp(I * 0.25, 0.5, 2.5), Q = M.camera_type === "orthographic" ? 5 / Math.max(0.01, M.zoom || 1) * 0.35 : U * Math.tan(e.MathUtils.degToRad(M.fov || 35) * 0.5), H = Q * (y.width || 16) / Math.max(1, y.height || 9), K = f.clone().addScaledVector(O, U), te = [
            K.clone().addScaledVector(T, -H).addScaledVector(W, -Q),
            K.clone().addScaledVector(T, H).addScaledVector(W, -Q),
            K.clone().addScaledVector(T, H).addScaledVector(W, Q),
            K.clone().addScaledVector(T, -H).addScaledVector(W, Q)
          ], ae = [];
          for (const re of te) ae.push(f, re);
          for (let re = 0; re < 4; re++) ae.push(te[re], te[(re + 1) % 4]);
          const Se = te[2].clone().add(te[3]).multiplyScalar(0.5).clone().addScaledVector(W, Q * 0.25);
          ae.push(te[2], Se, Se, te[3]);
          const rt = new e.BufferGeometry().setFromPoints(ae), Be = new e.LineSegments(rt, new e.LineBasicMaterial({
            color: V ? a.marker : a.frustum,
            linewidth: u ? 2 : 1,
            transparent: !0,
            opacity: u ? 1 : 0.6
          }));
          Be.userData.omnicamWidget = "gizmo", this.liveCameras.add(Be);
        }
        if (I > 0.01) {
          const P = u && r === "camera_target", q = new e.BufferGeometry().setFromPoints([f, L]), $ = new e.Line(q, new e.LineDashedMaterial({
            color: V || P ? 9133302 : a.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: V || P ? 1 : u ? 0.75 : 0.4
          }));
          $.userData.omnicamWidget = "lookat", this.liveCameras.add($);
          const c = P ? 0.12 : V ? 0.11 : 0.08, b = [
            L.clone().add(new e.Vector3(-c, 0, 0)),
            L.clone().add(new e.Vector3(c, 0, 0)),
            L.clone().add(new e.Vector3(0, -c, 0)),
            L.clone().add(new e.Vector3(0, c, 0)),
            L.clone().add(new e.Vector3(0, 0, -c)),
            L.clone().add(new e.Vector3(0, 0, c))
          ], j = new e.BufferGeometry().setFromPoints(b), N = new e.LineSegments(j, new e.LineBasicMaterial({
            color: P || V ? 9133302 : a.marker,
            linewidth: P ? 3 : 1,
            transparent: !0,
            opacity: P || V ? 1 : u ? 0.9 : 0.5
          }));
          N.userData.omnicamWidget = "lookat", this.liveCameras.add(N);
          const F = new e.SphereGeometry(0.28, 8, 6), U = new e.Mesh(F, R);
          if (U.position.copy(L), U.userData = { omnicamType: "camera_target", omnicamId: g.id }, this.liveCameras.add(U), (P || V) && m !== "camera") {
            const Q = new e.RingGeometry(0.14, 0.18, 24);
            Q.rotateX(Math.PI / 2);
            const H = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), K = new e.Mesh(Q, H);
            K.position.copy(L), K.userData.omnicamWidget = "lookat", this.liveCameras.add(K);
          }
        }
        if (u && m !== "camera" && r === "camera") {
          const P = new e.RingGeometry(0.19, 0.24, 32);
          P.rotateX(Math.PI / 2);
          const q = new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 1 }), $ = new e.Mesh(P, q);
          $.position.copy(f), $.userData.omnicamWidget = "gizmo", this.liveCameras.add($);
          const c = new e.RingGeometry(0.28, 0.31, 32);
          c.rotateX(Math.PI / 2);
          const b = new e.Mesh(c, new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          b.position.copy(f), b.userData.omnicamWidget = "gizmo", this.liveCameras.add(b);
        }
      });
    },
    updateSelection(y, s, i, m = null, r = "", o = !1) {
      const w = m ? `${m.mode || ""}:${m.objectId || ""}:${(m.point || []).join(",")}` : "", h = `${s}:${i || ""}:${(y.__selectedObjectIds || []).join(",")}:${r}:${w}:${o ? "ortho" : "persp"}`;
      if (h !== this.selectionKey) {
        if (this.selectionKey = h, A(this.selectionGroup), this.selectionGroup.clear(), s === "object" && i) {
          const g = this.objectNodes.get(i);
          if (g) {
            g.updateMatrixWorld(!0);
            try {
              const d = new e.Box3(), a = [];
              if (g.traverse((u) => {
                u.isBone && a.push(u);
              }), a.length > 0) {
                const u = new e.Vector3();
                for (const V of a)
                  V.getWorldPosition(u), d.expandByPoint(u);
                d.expandByScalar(0.2);
              } else
                d.setFromObject(g);
              if ((o || !x(g)) && !d.isEmpty() && Number.isFinite(d.min.x) && Number.isFinite(d.max.x) && Number.isFinite(d.min.y) && Number.isFinite(d.max.y) && Number.isFinite(d.min.z) && Number.isFinite(d.max.z)) {
                d.expandByScalar(0.04);
                const u = new e.Box3Helper(d, new e.Color(9133302));
                u.material.transparent = !0, u.material.opacity = 0.95, u.material.depthTest = !1, u.renderOrder = 9999, this.selectionGroup.add(u);
              }
            } catch {
            }
            if (y.show_wireframe) {
              let d = 0;
              g.traverse((a) => {
                if (!a.isMesh || !a.geometry || a.userData.omnicamHelper || d >= 64) return;
                const u = rr(e, a, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                u.renderOrder = 9998, this.selectionGroup.add(u), d += 1;
              });
            }
            if (m && m.objectId === i && m.point) {
              if (m.mode === "vertex") {
                const d = new e.SphereGeometry(0.08, 16, 12), a = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), u = new e.Mesh(d, a);
                u.position.fromArray(m.point), u.renderOrder = 1e4, this.selectionGroup.add(u);
                const V = new e.RingGeometry(0.1, 0.15, 24), C = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), M = new e.Mesh(V, C);
                M.position.fromArray(m.point), this.activeCamera && M.quaternion.copy(this.activeCamera.quaternion), M.renderOrder = 1e4, this.selectionGroup.add(M);
              } else if (m.mode === "edge" && m.edge) {
                const [d, a] = m.edge, u = new e.BufferGeometry().setFromPoints([new e.Vector3(...d), new e.Vector3(...a)]), V = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), C = new e.Line(u, V);
                C.renderOrder = 1e4, this.selectionGroup.add(C);
              } else if (m.mode === "face" && m.vertices) {
                const [d, a, u] = m.vertices, V = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...d),
                  new e.Vector3(...a),
                  new e.Vector3(...u)
                ]);
                V.setIndex([0, 1, 2]), V.computeVertexNormals();
                const C = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), M = new e.Mesh(V, C);
                M.renderOrder = 1e4, this.selectionGroup.add(M);
                const f = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...d),
                  new e.Vector3(...a),
                  new e.Vector3(...u),
                  new e.Vector3(...d)
                ]), L = new e.Line(f, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                L.renderOrder = 10001, this.selectionGroup.add(L);
              }
            }
          }
        }
        if (s === "object")
          for (const g of y.__selectedObjectIds || []) {
            if (g === i) continue;
            const d = this.objectNodes.get(g);
            if (d) {
              d.updateMatrixWorld(!0);
              try {
                const a = new e.Box3().setFromObject(d);
                if ((o || !x(d)) && !a.isEmpty() && Number.isFinite(a.min.x)) {
                  a.expandByScalar(0.04);
                  const u = new e.Box3Helper(a, new e.Color(10980346));
                  u.material.transparent = !0, u.material.opacity = 0.35, u.material.depthTest = !1, u.renderOrder = 9997, this.selectionGroup.add(u);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(y) {
      const s = this.objectNodes.get(y);
      if (!s) return [];
      const i = [], m = /* @__PURE__ */ new Set();
      return s.traverse((r) => {
        const o = r.isBone ? r.name : "";
        !o || m.has(o) || i.length >= 256 || (m.add(o), i.push(o));
      }), i;
    },
    /**
     * World position of `boneName` (or the model's animated centre when no bone
     * is named) at an arbitrary frame.
     *
     * The mixer is the only thing that knows where a bone sits at a given time,
     * so the model is posed at `frame`, probed, then posed back: a probe for a
     * frame other than the playhead must not leave the viewport showing it.
     */
    sampleModelPoint(y, s, i, m = 24) {
      const r = this.objectNodes.get(y);
      if (!r) return null;
      const o = this.models.get(y), w = o?.mixer && o.duration > 0, h = w ? o.mixer.time : null;
      w && (o.mixer.setTime(Math.max(0, i) / Math.max(1, m) % o.duration), r.updateMatrixWorld(!0));
      let g = null;
      if (s) {
        let d = null;
        if (r.traverse((a) => {
          !d && a.isBone && a.name === s && (d = a);
        }), d) {
          const a = new e.Vector3().setFromMatrixPosition(d.matrixWorld);
          g = [a.x, a.y, a.z];
        }
      } else
        g = this.getObjectWorldCenter(y);
      return w && Number.isFinite(h) && (o.mixer.setTime(h), r.updateMatrixWorld(!0)), g;
    },
    getObjectWorldCenter(y) {
      const s = this.objectNodes.get(y);
      if (!s) return null;
      s.updateMatrixWorld(!0);
      const i = [];
      if (s.traverse((o) => {
        o.isBone && i.push(o);
      }), i.length > 0) {
        const o = new e.Vector3(), w = new e.Vector3();
        for (const h of i)
          h.getWorldPosition(w), o.add(w);
        return o.divideScalar(i.length), [o.x, o.y, o.z];
      }
      const m = new e.Box3().setFromObject(s);
      if (!m.isEmpty() && Number.isFinite(m.min.x)) {
        const o = m.getCenter(new e.Vector3());
        return [o.x, o.y, o.z];
      }
      const r = new e.Vector3();
      return s.getWorldPosition(r), [r.x, r.y, r.z];
    }
  };
}
function nr(t) {
  const { THREE: e, FBXLoader: n, GLTFLoader: l, OBJLoader: v, PLYLoader: p, STLLoader: B, neutral: S, wire: z, checkerMaterial: G, objectMaterial: D, applyModelMaterial: _, disposeObject: A, textureFor: J, cardMesh: X, generatePointField: Z, sampleCamera: Y, sampleObjectTransform: ee } = t;
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(x) {
      if (!this.path.visible || !this.activeCamera) return null;
      this.pointer.set(x[0] / this.canvas.width * 2 - 1, -(x[1] / this.canvas.height) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const y of this.raycaster.intersectObjects(this.path.children, !0)) {
        const s = zt(y);
        if (s) return { ...s, position: y.object.position.toArray() };
      }
      return null;
    },
    configureCamera(x, y) {
      const s = x || defaultCamera(), i = Math.max(5e-3, Number(s.near) || 0.01), m = Math.max(i + 1, Number(s.far) || 1e4);
      let r;
      if (s.camera_type === "orthographic") {
        r = this.orthographic;
        const a = 5 / Math.max(0.01, s.zoom || 1);
        r.left = -a * y, r.right = a * y, r.top = a, r.bottom = -a, r.near = i, r.far = m, r.updateProjectionMatrix();
      } else
        r = this.perspective, r.fov = e.MathUtils.clamp(Number(s.fov) || 35, 1, 175), r.aspect = y, r.near = i, r.far = m, r.updateProjectionMatrix();
      const o = new e.Vector3().fromArray(s.position || [6, 4, 6]), w = new e.Vector3().fromArray(s.target || [0, 1.5, 0]), h = w.clone().sub(o);
      h.lengthSq() < 1e-6 ? h.set(0, 0, -1) : h.normalize();
      let g = s.up ? new e.Vector3().fromArray(s.up) : new e.Vector3(0, 1, 0), d = new e.Vector3().crossVectors(h, g);
      if (d.lengthSq() < 1e-6 && (g = Math.abs(h.y) > 0.9 ? new e.Vector3(0, 0, h.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), d.crossVectors(h, g)), d.normalize(), g.crossVectors(d, h).normalize(), s.roll) {
        const a = e.MathUtils.degToRad(s.roll);
        d.applyAxisAngle(h, a), g.applyAxisAngle(h, a);
      }
      return r.position.copy(o), r.up.copy(g), r.lookAt(w), r.updateMatrixWorld(), r;
    },
    pick(x, y, s, i) {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, s) * 2 - 1, 1 - y / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const m = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const r of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          r.object?.userData?.omnicamType && m.push({
            distance: r.distance,
            type: r.object.userData.omnicamType,
            id: r.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const r of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (r.object?.userData?.omnicamCaptureGuide || r.object?.userData?.omnicamHelper) continue;
          let o = r.object;
          for (; o && !o.userData?.omnicamId; ) o = o.parent;
          o?.userData?.omnicamId && m.push({
            distance: r.distance,
            type: "object",
            id: o.userData.omnicamId
          });
        }
      return m.length ? (m.sort((r, o) => r.distance - o.distance), { type: m[0].type, id: m[0].id }) : null;
    },
    pickSubElement(x, y, s, i, m = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, s) * 2 - 1, 1 - y / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const r = this.raycaster.intersectObjects(this.content.children, !0);
      for (const o of r) {
        let w = o.object, h = o.object;
        for (; w && !w.userData.omnicamId; ) w = w.parent;
        if (!w?.userData.omnicamId || !h.geometry) continue;
        const g = w.userData.omnicamId, a = h.geometry.getAttribute("position");
        if (!a) continue;
        h.updateMatrixWorld(!0);
        const u = h.matrixWorld;
        if (m === "vertex") {
          let V = -1, C = 1 / 0, M = null;
          if (o.face) {
            const f = [o.face.a, o.face.b, o.face.c];
            for (const L of f) {
              const O = new e.Vector3(a.getX(L), a.getY(L), a.getZ(L)).applyMatrix4(u), I = O.distanceTo(o.point);
              I < C && (C = I, V = L, M = [O.x, O.y, O.z]);
            }
          } else
            for (let f = 0; f < a.count; f++) {
              const L = new e.Vector3(a.getX(f), a.getY(f), a.getZ(f)).applyMatrix4(u), O = L.distanceTo(o.point);
              O < C && (C = O, V = f, M = [L.x, L.y, L.z]);
            }
          if (M)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: g,
              index: V,
              point: M
            };
        }
        if (m === "edge" && o.face) {
          const V = new e.Vector3(a.getX(o.face.a), a.getY(o.face.a), a.getZ(o.face.a)).applyMatrix4(u), C = new e.Vector3(a.getX(o.face.b), a.getY(o.face.b), a.getZ(o.face.b)).applyMatrix4(u), M = new e.Vector3(a.getX(o.face.c), a.getY(o.face.c), a.getZ(o.face.c)).applyMatrix4(u), f = (T, W, R) => {
            const P = new e.Line3(W, R), q = new e.Vector3();
            return P.closestPointToPoint(T, !0, q), { dist: T.distanceTo(q), point: q, segment: [W, R] };
          }, L = f(o.point, V, C), O = f(o.point, C, M), I = f(o.point, M, V), k = [L, O, I].reduce((T, W) => W.dist < T.dist ? W : T);
          return {
            type: "edge",
            mode: "edge",
            objectId: g,
            point: [k.point.x, k.point.y, k.point.z],
            edge: [
              [k.segment[0].x, k.segment[0].y, k.segment[0].z],
              [k.segment[1].x, k.segment[1].y, k.segment[1].z]
            ]
          };
        }
        if (m === "face" && o.face) {
          const V = new e.Vector3(a.getX(o.face.a), a.getY(o.face.a), a.getZ(o.face.a)).applyMatrix4(u), C = new e.Vector3(a.getX(o.face.b), a.getY(o.face.b), a.getZ(o.face.b)).applyMatrix4(u), M = new e.Vector3(a.getX(o.face.c), a.getY(o.face.c), a.getZ(o.face.c)).applyMatrix4(u), f = new e.Vector3().add(V).add(C).add(M).divideScalar(3), L = o.face.normal.clone().transformDirection(u);
          return {
            type: "face",
            mode: "face",
            objectId: g,
            faceIndex: o.faceIndex,
            point: [f.x, f.y, f.z],
            normal: [L.x, L.y, L.z],
            vertices: [
              [V.x, V.y, V.z],
              [C.x, C.y, C.z],
              [M.x, M.y, M.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(x, y, s, i) {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, s) * 2 - 1, 1 - y / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const m = this.raycaster.intersectObjects(this.content.children, !0);
      if (m.length > 0)
        return [m[0].point.x, m[0].point.y, m[0].point.z];
      const r = new e.Plane(new e.Vector3(0, 1, 0), 0), o = new e.Vector3();
      return this.raycaster.ray.intersectPlane(r, o) ? [o.x, o.y, o.z] : null;
    }
  };
}
const fe = ["high", "balanced", "low"], ir = 25, Pe = 30, cr = 0.6;
function Ge(t = "balanced") {
  return { quality: t, samples: [], downgraded: !1 };
}
function lr(t) {
  const e = fe.indexOf(t);
  return e < 0 || e >= fe.length - 1 ? null : fe[e + 1];
}
function dr(t, e) {
  if (!Number.isFinite(e) || e < 0 || (t.samples.push(e), t.samples.length > Pe && t.samples.shift(), t.samples.length < Pe) || t.samples.filter((v) => v > ir).length / t.samples.length < cr) return null;
  const l = lr(t.quality);
  return l ? (t.quality = l, t.downgraded = !0, t.samples = [], l) : null;
}
function ur(t, e) {
  return t.quality = e, t.samples = [], t.downgraded = !1, t;
}
function mr(t) {
  const { THREE: e, FBXLoader: n, GLTFLoader: l, OBJLoader: v, PLYLoader: p, STLLoader: B, neutral: S, wire: z, checkerMaterial: G, objectMaterial: D, applyModelMaterial: _, disposeObject: A, textureFor: J, cardMesh: X, generatePointField: Z, sampleCamera: Y, sampleObjectTransform: ee, hasOutlineMesh: x, SelectionOutlineRenderer: y } = t;
  return {
    render(s, i, m, r, o, w = /* @__PURE__ */ new Map(), h = 0, g = !1, d = "camera", a = "subject", u = null, V = null) {
      const C = !g || (s.render_mode || "") === "beauty";
      if (C !== this.studioEnabled) {
        this.studioEnabled = C, Ee(e, this.scene, this.renderer, this.studio, C);
        for (const c of this.flatLights || []) c.visible = !C;
      }
      if (this.disposed) return;
      (this.canvas.width !== r || this.canvas.height !== o) && this.renderer.setSize(r, o, !1);
      const M = (i && i.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const f = s.viewport_bg_sequence && s.viewport_bg_sequence.length ? s.viewport_bg_sequence[h % s.viewport_bg_sequence.length] : s.viewport_bg_image || "";
      if (f) {
        this.bgImageUrl = f;
        const c = this.bgTextureCache.get(f);
        if (c)
          this.bgTextureCache.delete(f), this.bgTextureCache.set(f, c), this.bgTexture = c, this.scene.background = c;
        else if (!this.bgTextureLoads.has(f)) {
          const b = this.bgLoadGeneration;
          this.bgTextureLoads.set(f, b), new e.TextureLoader().load(f, (N) => {
            if (this.bgTextureLoads.delete(f), this.disposed || b !== this.bgLoadGeneration) {
              N.dispose();
              return;
            }
            for (N.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(f, N); this.bgTextureCache.size > 8; ) {
              const F = [...this.bgTextureCache.keys()].find((Q) => Q !== this.bgImageUrl);
              if (!F) break;
              const U = this.bgTextureCache.get(F);
              this.bgTextureCache.delete(F), U?.dispose?.();
            }
            this.bgImageUrl === f && (this.bgTexture = N, this.scene.background = N), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(f);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const b of new Set(this.bgTextureCache.values())) b.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const c = s.viewport_bg_color && s.viewport_bg_color !== Ve;
        this.scene.background = this.studioEnabled && !c && !M ? this.studio.sky : new e.Color(c ? s.viewport_bg_color : this.studioEnabled && M ? 1447709 : Ve);
      }
      const L = JSON.stringify([
        s.render_mode,
        s.card_fit,
        s.point_density,
        s.point_spread,
        !!s.show_wireframe,
        !!s.show_vertices,
        s.objects.map((c) => {
          const { position: b, rotation: j, keyframes: N, size: F, ...U } = c;
          return c.type === "card" && (U.size = F), U;
        })
      ]), O = [...m.entries()].map(([c, b]) => `${c}:${b?.src || ""}`).join("|"), I = [...w.entries()].map(([c, b]) => `${c}:${b}`).join("|");
      (L !== this.sceneKey || O !== this.mediaSignature || I !== this.modelSignature) && (this.sceneKey = L, this.mediaSignature = O, this.modelSignature = I, this.rebuild(s, m, w));
      for (const c of this.models.values())
        c.mixer && c.duration > 0 && c.mixer.setTime(h / Math.max(1, s.fps || 24) % c.duration);
      for (const c of s.objects) {
        const b = this.objectNodes.get(c.id);
        if (!b) continue;
        const j = c.keyframes?.length ? ee(c, h) : c;
        b.position.fromArray(j.position || [0, 0, 0]), b.rotation.set(...(j.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), c.type !== "card" && c.type !== "null" && b.scale.fromArray(j.size || [1, 1, 1]), c.type === "null" && (b.visible = g ? !0 : s.show_helper_axes !== !1);
      }
      this.path.visible = !g;
      const k = s.show_grid !== !1 && s.render_mode !== "point_field";
      this.content.traverse((c) => {
        c.userData.omnicamCaptureGuide && (c.visible = g ? !!s.playblast_grid : k);
      });
      const T = s.view_mode || "camera", W = `${T}:${d}:${V ?? ""}:${s.__omnicamRevision ?? JSON.stringify([
        s.active_camera_id,
        (s.cameras || []).map((c) => [c.id, c.keyframes?.length, c.keyframes?.map((b) => [b.frame, b.camera?.position, b.camera?.target])]),
        (s.objects || []).map((c) => [c.id, c.keyframes?.length, c.keyframes?.map((b) => [b.frame, b.transform?.position])])
      ])}`;
      if (W !== this.pathKey && (this.pathKey = W, this.rebuildPath(s, d, V, T)), this.updateLiveCameras(s, h, g, T, d, V), this.liveCameras.visible = !g, !g) {
        const c = s.show_camera_paths !== !1, b = s.show_camera_gizmos !== !1, j = s.show_look_at !== !1;
        for (const N of [this.path, this.liveCameras])
          N.traverse((F) => {
            const U = F.userData.omnicamWidget;
            U === "path" ? F.visible = c : U === "gizmo" ? F.visible = b : U === "lookat" && (F.visible = j);
          });
      }
      const R = r / Math.max(1, o), P = this.configureCamera(i, R);
      if (this.activeCamera = P, g ? this.selectionGroup.visible = !1 : (this.updateSelection(s, d, a, u, `${s.__omnicamRevision ?? "legacy"}:${h}`, M), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const c = new e.Box3();
        this.content.traverse((j) => {
          if (!j.isMesh || j.userData.omnicamCaptureGuide) return;
          j.castShadow = !0, j.receiveShadow = !0, j.updateWorldMatrix(!0, !1);
          const N = new e.Box3().setFromObject(j);
          !N.isEmpty() && Number.isFinite(N.min.x) && c.union(N);
        });
        const b = this.studio?.key;
        if (b) {
          const j = c.isEmpty() ? new e.Vector3() : c.getCenter(new e.Vector3()), N = c.isEmpty() ? new e.Vector3(12, 12, 12) : c.getSize(new e.Vector3()), F = Math.max(1, 0.5 * Math.max(N.x, N.y, N.z) * Math.SQRT2), U = F * 1.15 + 0.5, Q = new e.Vector3(4.5, 7.5, 3.5).normalize(), H = Math.max(12, F * 4);
          b.position.copy(j).addScaledVector(Q, H), b.target.position.copy(j), b.target.updateMatrixWorld(!0);
          const K = b.shadow.camera;
          K.left = -U, K.right = U, K.top = U, K.bottom = -U, K.near = Math.max(0.1, H - F - 1), K.far = H + F + 1, K.updateProjectionMatrix(), b.shadow.map?.dispose(), b.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((c) => {
        c.userData.omnicamBillboard && c.quaternion.copy(P.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, r, o);
      const q = performance.now();
      let $ = !1;
      if (!g && !M && d === "object" && a && !u) {
        const c = this.objectNodes.get(a);
        c && x(c) && (this.outlineRenderer || (this.outlineRenderer = new y(this.renderer, this.scene, void 0, P)), this.outlineRenderer.render(P, r, o, [c]), $ = !0);
      }
      if ($ || this.renderer.render(this.scene, P), !g && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Ge(this.studio?.quality);
        const c = dr(this.qualityMonitor, performance.now() - q);
        c && (Le(this.studio, this.renderer, c), this.onQualityDowngrade?.(c));
      }
    },
    setViewportQuality(s) {
      Le(this.studio, this.renderer, s), this.qualityMonitor = ur(this.qualityMonitor || Ge(s), s);
    },
    // Supersample multiple the host blit renders the interactive viewport at
    // before scaling it back down -- the cheapest edge antialiasing there is.
    // 1 while the studio look is off (a neutral capture), and 1 at "low" so a
    // struggling GPU is never asked to draw more pixels.
    supersampleFactor() {
      return this.studioEnabled && It(this.studio?.quality).renderScale || 1;
    },
    dispose() {
      if (!this.disposed) {
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), A(this.content), A(this.path), A(this.liveCameras), A(this.selectionGroup);
        for (const s of new Set(this.bgTextureCache.values())) s.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const s of this.models.values()) A(s.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.outlineRenderer?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
const hr = {
  EffectComposer: Ft,
  OutlinePass: Tt,
  OutputPass: Ot,
  RenderPass: Dt,
  Vector2: be
};
function fr(t) {
  let e = !1;
  return t?.traverse?.((n) => {
    e || n.visible === !1 || !n.isMesh || n.userData?.omnicamHelper || n.userData?.omnicamCaptureGuide || (e = !!(n.geometry && n.material));
  }), e;
}
class pr {
  constructor(e, n, l = hr, v = null) {
    const { EffectComposer: p, RenderPass: B, OutlinePass: S, OutputPass: z, Vector2: G } = l;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new p(e), this.renderPass = new B(n, v), this.outlinePass = new S(new G(1, 1), n, v, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new z(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, n, l, v) {
    this.disposed || ((n !== this.width || l !== this.height) && (this.width = n, this.height = l, this.composer.setSize(n, l)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...v], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const oe = new xe({ color: 9212571, roughness: 0.9, metalness: 0 }), ve = new de({ color: 11449792, wireframe: !0 });
function Ce() {
  const t = new Uint8Array([
    38,
    42,
    48,
    255,
    190,
    195,
    202,
    255,
    190,
    195,
    202,
    255,
    38,
    42,
    48,
    255
  ]), e = new De(t, 2, 2, Ne);
  return e.wrapS = e.wrapT = Ue, e.repeat.set(8, 8), e.colorSpace = he, e.needsUpdate = !0, new xe({ map: e, roughness: 0.85, metalness: 0 });
}
function gr(t, e) {
  if (e === "wireframe" || t.material_mode === "wireframe") {
    const l = ve.clone();
    return t.color && (l.color = new ce(t.color)), l;
  }
  if (t.material_mode === "checker") return Ce();
  const n = oe.clone();
  return t.color && (n.color = new ce(t.color)), n;
}
function wr(t, e) {
  t.traverse((n) => {
    if (n.isMesh) {
      if (n.userData.omnicamOriginalMaterial || (n.userData.omnicamOriginalMaterial = n.material), n.userData.omnicamOverrideMaterial) {
        const l = Array.isArray(n.material) ? n.material : [n.material];
        for (const v of l)
          v?.map?.dispose?.(), v?.dispose?.();
        n.userData.omnicamOverrideMaterial = !1;
      }
      e === "textured" ? n.material = n.userData.omnicamOriginalMaterial : (n.material = e === "checker" ? Ce() : e === "wireframe" ? ve.clone() : oe.clone(), n.userData.omnicamOverrideMaterial = !0);
    }
  });
}
function Me(t, e = !1) {
  t.traverse((n) => {
    if (n.userData.omnicamModelResource && !e) return;
    n.geometry?.dispose?.();
    const l = Array.isArray(n.material) ? n.material : [n.material];
    for (const v of l)
      v?.map?.dispose?.(), v?.dispose?.();
  });
}
function tt(t) {
  if (!t) return null;
  const e = t instanceof HTMLVideoElement ? new Ke(t) : new $e(t);
  return e.colorSpace = he, e.needsUpdate = !0, e;
}
function yr(t, e, n) {
  const [l, v] = t.size || [2, 3], p = new E(), B = new se(new pe(l, v), new de({ color: 1448482, side: le, transparent: !0, opacity: 0.85 }));
  B.frustumCulled = !1, p.add(B);
  const S = tt(e);
  if (!S) return p;
  const z = e.videoWidth || e.naturalWidth || e.width || l, G = e.videoHeight || e.naturalHeight || e.height || v, D = z / Math.max(1, G), _ = l / Math.max(0.01, v);
  let A = l, J = v;
  n === "contain" ? D > _ ? J = l / D : A = v * D : n === "cover" && (D > _ ? (S.repeat.x = _ / D, S.offset.x = (1 - S.repeat.x) * 0.5) : (S.repeat.y = D / _, S.offset.y = (1 - S.repeat.y) * 0.5));
  const X = new se(
    new pe(A, J),
    new de({
      color: 16777215,
      map: S,
      side: le,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return X.frustumCulled = !1, X.position.z = 2e-3, p.add(X), p.frustumCulled = !1, p;
}
class Mr {
  constructor(e = () => {
  }, n = () => {
  }) {
    this.canvas = document.createElement("canvas"), this.renderer = new Xe({
      canvas: this.canvas,
      antialias: !0,
      alpha: !1,
      preserveDrawingBuffer: !0,
      // Off on purpose: three.js shadow mapping does not account for the
      // logarithmic depth encoding, so leaving this on silently produced no
      // shadows at all. A shot-layout scene spans a few units to a few hundred,
      // which the standard 24-bit depth buffer handles; the canonical near/far
      // stay exactly as authored so the viewport and the adapters still agree.
      logarithmicDepthBuffer: !1
    }), this.renderer.setPixelRatio(1), this.renderer.outputColorSpace = he, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = Fe, this.scene = new qe(), this.scene.background = new ce(1184274), this.scene.add(new Oe(16777215, 3159099, 2.2));
    const l = new _e(16777215, 2.4);
    l.position.set(5, 8, 4), this.scene.add(l), this.flatLights = [this.scene.children.at(-2), l], this.studio = Ut(we, this.renderer, Rt), this.scene.add(this.studio.group), this.studioEnabled = !0, Ee(we, this.scene, this.renderer, this.studio, !0), this.content = new E(), this.scene.add(this.content), this.path = new E(), this.scene.add(this.path), this.liveCameras = new E(), this.scene.add(this.liveCameras), this.selectionGroup = new E(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ze(35, 16 / 9, 0.01, 1e4), this.orthographic = new Te(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = n, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new Ie(), this.pointer = new be(), this.activeCamera = this.perspective;
  }
  async loadModel(e, n, l = "glb") {
    const v = `${l}:${n}`;
    if (!(!n || this.modelLoads.get(e) === v)) {
      this.modelLoads.set(e, v);
      try {
        let p, B = [];
        if (l === "obj") p = await new Ye().loadAsync(n);
        else if (l === "fbx")
          p = await new Qe().loadAsync(n), B = p.animations || [];
        else if (l === "stl") p = new se(await new Ze().loadAsync(n), oe.clone());
        else if (l === "ply") {
          const i = await new Je().loadAsync(n);
          i.index ? (i.getAttribute("normal") || i.computeVertexNormals(), p = new se(i, oe.clone())) : p = new We(i, new je({ color: 11449792, size: 0.025 }));
        } else {
          const i = await new He().loadAsync(n);
          p = i.scene, B = i.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== v) {
          Me(p, !0);
          return;
        }
        const S = this.models.get(e);
        S && Me(S.scene, !0), p.traverse((i) => {
          if (i.userData.omnicamModelResource = !0, i.frustumCulled = !1, i.isMesh && (i.frustumCulled = !1, i.material)) {
            const m = Array.isArray(i.material) ? i.material : [i.material];
            for (const r of m)
              r.side = le;
          }
          i.isPoints && (i.frustumCulled = !1), i.isSkinnedMesh && (i.frustumCulled = !1, i.computeBoundingBox?.(), i.computeBoundingSphere?.());
        });
        let z = 0, G = 0, D = 0, _ = 0;
        p.traverse((i) => {
          i.isMesh && (z += 1, _ += i.geometry?.getAttribute?.("position")?.count || 0), i.isPoints && (G += 1), i.isBone && (D += 1);
        });
        const A = new E();
        if (A.frustumCulled = !1, A.add(p), !z && !G && D) {
          const i = new Re(p);
          i.material.depthTest = !1, i.material.opacity = 0.9, i.material.transparent = !0, i.renderOrder = 10, i.userData.omnicamModelResource = !0, A.add(i);
        }
        A.updateMatrixWorld(!0);
        const J = new Ae().setFromObject(A), X = J.getSize(new ge()), Z = Math.max(X.x, X.y, X.z), Y = Number.isFinite(Z) && Z > 1e-6 ? 2.5 / Z : 1, ee = J.getCenter(new ge());
        A.scale.setScalar(Y), A.position.set(-ee.x * Y, -J.min.y * Y, -ee.z * Y);
        const x = new E();
        x.frustumCulled = !1, x.add(A);
        const y = B.length ? new ke(p) : null;
        y && y.clipAction(B[0]).play();
        const s = { url: n, format: l, scene: x, mixer: y, clips: B, selectedClip: 0, duration: B[0]?.duration || 0, meshes: z, points: G, bones: D, vertices: _, animations: B.length, normalizationScale: Y };
        this.models.set(e, s), this.onModelLoaded({ id: e, format: l, meshes: z, points: G, bones: D, vertices: _, animations: B.length, animationNames: B.map((i, m) => i.name || `Clip ${m + 1}`), duration: s.duration, normalizationScale: Y }), this.sceneKey = "", this.invalidate();
      } catch (p) {
        this.modelLoads.get(e) === v && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${l.toUpperCase()} ${e}`, p);
        const B = p?.message?.includes("FBX version not supported") || p?.message?.includes("6100") || p?.message?.includes("6000"), S = B ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : p?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: l, error: S, isLegacyFBX: B });
      }
    }
  }
}
const ne = { THREE: we, FBXLoader: Qe, GLTFLoader: He, OBJLoader: Ye, PLYLoader: Je, STLLoader: Ze, neutral: oe, wire: ve, checkerMaterial: Ce, objectMaterial: gr, applyModelMaterial: wr, disposeObject: Me, textureFor: tt, cardMesh: yr, generatePointField: Wt, sampleCamera: jt, sampleObjectTransform: Nt, hasOutlineMesh: fr, SelectionOutlineRenderer: pr };
Object.assign(
  Mr.prototype,
  or(ne),
  ar(ne),
  nr(ne),
  mr(ne)
);
async function xr(t, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const n of ["vp9", "vp8"])
    try {
      if (await ie(Zt(n, { width: t, height: e }), 5e3, `Checking ${n} support`)) return n;
    } catch {
    }
  return null;
}
function ie(t, e, n) {
  let l;
  return Promise.race([
    t,
    new Promise((v, p) => {
      l = setTimeout(() => p(new Error(`${n} timed out`)), e);
    })
  ]).finally(() => clearTimeout(l));
}
async function Lr(t, e, n, l, v) {
  const p = await xr(t.width, t.height);
  if (!p) throw new Error("No supported WebCodecs WebM encoder");
  const B = new $t({ format: new Xt(), target: new Kt() }), S = new Yt(t, { codec: p, quality: new Qt("high"), keyFrameInterval: 1 });
  B.addVideoTrack(S, { frameRate: n }), await ie(B.start(), 1e4, "Starting deterministic encoder");
  try {
    const z = 1 / n;
    for (let G = 0; G < e; G++) {
      if (v?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await l(G), await ie(S.add(G * z, z, { keyFrame: G % n === 0 }), 1e4, `Encoding frame ${G + 1}`);
    }
    await ie(B.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (z) {
    throw B.state !== "finalized" && await B.cancel().catch(() => {
    }), z;
  }
  return qt(new Blob([B.target.buffer], { type: await B.getMimeType() }), {
    encoder: "webcodecs",
    requestedFrames: e,
    expectedDurationMs: e / n * 1e3,
    recordedDurationMs: e / n * 1e3,
    driftMs: 0,
    fps: n,
    width: t.width,
    height: t.height
  });
}
export {
  Mr as OmniWebGLViewport,
  Lr as encodeDeterministicPlayblast,
  xr as supportsDeterministicEncoding
};
