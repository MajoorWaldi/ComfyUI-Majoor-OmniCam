import { G as Q, D as ze, M as re, P as xe, a as Be, S as ht, b as ft, C as pt, c as pe, E as gt, A as wt, d as de, N as yt, e as We, f as Mt, B as je, g as xt, h as bt, i as vt, j as Ct, k as St, l as Bt, m as Ne, n as ue, F as Lt, o as Gt, H as Ie, L as Pt, p as Vt, q as _t, r as kt, s as At, t as Dt, u as Ot, v as me, O as Ue, w as Re, x as $e, y as Tt, z as qe, I as Ke, Q as Ft, R as Xe, J as Ye, K as Ze, T as zt, U as Qe, V as Je, W as Wt, X as jt, Y as He, Z as Nt, _ as It, $ as Le, a0 as be, a1 as Ee, a2 as et, a3 as Ut, a4 as Rt, a5 as $t, a6 as qt, a7 as Kt, a8 as tt, a9 as rt, aa as st, ab as at, ac as ot } from "./chunk-B7ZTbDAV.js";
import { a0 as Xt, A as Yt, s as Zt, f as Qt } from "./chunk-CE-YeXfn.js";
import { a as De, s as nt, D as Oe, c as Jt, b as Ht } from "./chunk-B-H4D0kM.js";
import { O as Et, B as er, W as tr, C as rr, Q as sr, c as ar } from "./chunk-CcqF7PHi.js";
const ve = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ACESFilmicToneMapping: wt,
  AnimationMixer: We,
  AxesHelper: Mt,
  Box3: je,
  Box3Helper: xt,
  BoxGeometry: bt,
  BufferGeometry: vt,
  CanvasTexture: pt,
  CatmullRomCurve3: Ct,
  Color: de,
  ConeGeometry: St,
  CylinderGeometry: Bt,
  DataTexture: Ne,
  DirectionalLight: ze,
  DoubleSide: ue,
  EquirectangularReflectionMapping: gt,
  Float32BufferAttribute: Lt,
  GridHelper: Gt,
  Group: Q,
  HemisphereLight: Ie,
  Line: Pt,
  Line3: Vt,
  LineBasicMaterial: _t,
  LineDashedMaterial: kt,
  LineSegments: At,
  MathUtils: Dt,
  Matrix4: Ot,
  Mesh: re,
  MeshBasicMaterial: me,
  MeshStandardMaterial: Be,
  NoToneMapping: yt,
  OrthographicCamera: Ue,
  PCFSoftShadowMap: Re,
  PMREMGenerator: ft,
  PerspectiveCamera: $e,
  Plane: Tt,
  PlaneGeometry: xe,
  Points: qe,
  PointsMaterial: Ke,
  Quaternion: Ft,
  RGBAFormat: Xe,
  Raycaster: Ye,
  RepeatWrapping: Ze,
  RingGeometry: zt,
  SRGBColorSpace: pe,
  Scene: Qe,
  ShadowMaterial: ht,
  SkeletonHelper: Je,
  SkinnedMesh: Wt,
  SphereGeometry: jt,
  Texture: He,
  TextureLoader: Nt,
  TubeGeometry: It,
  Vector2: Le,
  Vector3: be,
  VideoTexture: Ee,
  WebGLRenderer: et,
  WireframeGeometry: Ut
}, Symbol.toStringTag, { value: "Module" }));
function or(t, { position: e, forward: i, up: l, color: v, scale: h = 1, active: S = !0 }) {
  const C = new t.Group(), O = S ? 0.95 : 0.5, G = new t.MeshBasicMaterial({
    color: v,
    transparent: !0,
    opacity: O,
    depthTest: !1
  }), D = new t.Mesh(new t.BoxGeometry(0.34, 0.24, 0.42), G);
  D.renderOrder = 912, C.add(D);
  const _ = new t.Mesh(new t.ConeGeometry(0.17, 0.26, 20), G);
  return _.rotation.x = -Math.PI / 2, _.position.z = -0.32, _.renderOrder = 912, C.add(_), C.scale.setScalar(h), C.position.copy(e), C.up.copy(l), C.lookAt(e.clone().add(i)), C;
}
function nr(t, { position: e, color: i = 15903035, radius: l = 0.28, bold: v = !1 }) {
  const h = new t.Group(), S = v ? 16773544 : i, C = new t.LineBasicMaterial({ color: S, transparent: !0, opacity: v ? 1 : 0.95, depthTest: !1 }), O = (_) => {
    const k = [];
    for (let $ = 0; $ <= 48; $++) {
      const I = $ / 48 * Math.PI * 2;
      k.push(new t.Vector3(Math.cos(I) * _, Math.sin(I) * _, 0));
    }
    const N = new t.Line(new t.BufferGeometry().setFromPoints(k), C);
    return N.renderOrder = 915, N;
  };
  if (h.add(O(l)), v) {
    h.add(O(l * 1.18));
    const _ = new t.Mesh(
      new t.RingGeometry(0, l * 0.3, 16),
      new t.MeshBasicMaterial({ color: S, transparent: !0, opacity: 1, depthTest: !1 })
    );
    _.renderOrder = 916, h.add(_);
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
    C
  );
  return D.renderOrder = 915, h.add(D), h.position.copy(e), h.userData.omnicamBillboard = !0, h;
}
const Ce = 3718648, ir = 12e3;
function he(t) {
  return !!(t.isSkinnedMesh && t.skeleton);
}
function it(t, e) {
  t.position.copy(e.position), t.quaternion.copy(e.quaternion), t.scale.copy(e.scale);
}
function fe(t) {
  return t.frustumCulled = !1, t.raycast = () => {
  }, t.userData.omnicamHelper = !0, t;
}
function cr(t, e) {
  if (he(e)) {
    const l = new t.SkinnedMesh(e.geometry.clone(), new t.MeshBasicMaterial({
      color: Ce,
      wireframe: !0,
      transparent: !0,
      opacity: 0.45,
      depthWrite: !1
    }));
    return l.bindMode = e.bindMode, l.bind(e.skeleton, e.bindMatrix), it(l, e), { overlay: fe(l), parent: e.parent || e };
  }
  const i = new t.LineSegments(
    new t.WireframeGeometry(e.geometry),
    new t.LineBasicMaterial({ color: Ce, opacity: 0.45, transparent: !0 })
  );
  return { overlay: fe(i), parent: e };
}
function lr(t, e) {
  const i = new t.PointsMaterial({ color: Ce, size: 0.05, sizeAttenuation: !0 });
  if (!he(e)) {
    const _ = new t.Points(e.geometry, i);
    return { overlay: fe(_), parent: e };
  }
  const l = e.geometry.getAttribute("position")?.count || 0, v = Math.max(1, Math.ceil(l / ir)), h = Math.ceil(l / v), S = new Float32Array(h * 3), C = new t.BufferGeometry();
  C.setAttribute("position", new t.Float32BufferAttribute(S, 3));
  const O = new t.Points(C, i);
  it(O, e);
  const G = new t.Vector3(), D = C.getAttribute("position");
  return O.onBeforeRender = () => {
    for (let _ = 0; _ < h; _++)
      e.getVertexPosition(_ * v, G), D.setXYZ(_, G.x, G.y, G.z);
    D.needsUpdate = !0;
  }, { overlay: fe(O), parent: e.parent || e };
}
function dr(t, e, i) {
  const l = he(e) ? new t.SkinnedMesh(e.geometry.clone(), i) : new t.Mesh(e.geometry.clone(), i);
  return he(e) && (l.bindMode = e.bindMode, l.bind(e.skeleton, e.bindMatrix)), l.matrixAutoUpdate = !1, l.matrix.copy(e.matrixWorld), l.frustumCulled = !1, l;
}
function ur(t, e, { wireframe: i = !1, vertices: l = !1 } = {}) {
  if (!i && !l) return;
  const v = [];
  e.traverse((h) => {
    h.isMesh && h.geometry && !h.userData.omnicamHelper && v.push(h);
  });
  for (const h of v) {
    if (i) {
      const { overlay: S, parent: C } = cr(t, h);
      C.add(S);
    }
    if (l) {
      const { overlay: S, parent: C } = lr(t, h);
      C.add(S);
    }
  }
}
function mr(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: h, STLLoader: S, neutral: C, wire: O, checkerMaterial: G, objectMaterial: D, applyModelMaterial: _, disposeObject: k, textureFor: X, cardMesh: N, generatePointField: $, sampleCamera: I, sampleObjectTransform: J } = t;
  return {
    removeModel(x) {
      const y = this.models.get(x);
      y && k(y.scene, !0), this.models.delete(x), this.modelLoads.delete(x), this.sceneKey = "";
    },
    selectAnimation(x, y) {
      const a = this.models.get(x);
      !a?.mixer || !a.clips.length || (a.selectedClip = Math.max(0, Math.min(a.clips.length - 1, Number(y) || 0)), a.duration = a.clips[a.selectedClip].duration || 0, a.mixer.stopAllAction(), a.mixer.clipAction(a.clips[a.selectedClip]).play(), this.invalidate());
    },
    rebuild(x, y, a) {
      this.content.traverse((s) => {
        for (const r of [...s.children])
          r.userData.omnicamHelper && (s.remove(r), k(r, !0));
      }), k(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const c = x.render_mode, m = new e.GridHelper(120, 120, 7829367, 3881787);
      if (m.userData.omnicamCaptureGuide = !0, m.frustumCulled = !1, this.content.add(m), ["omni_ref", "point_field"].includes(c)) {
        const { points: s, colors: r } = $(x.point_density || "balanced", x.point_spread || "all_views", x.point_color || null);
        if (s.length > 0) {
          const g = new e.BufferGeometry();
          g.setAttribute("position", new e.Float32BufferAttribute(s, 3)), g.setAttribute("color", new e.Float32BufferAttribute(r, 3));
          const u = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), n = new e.Points(g, u);
          n.frustumCulled = !1, this.content.add(n);
        }
      }
      if (!["grid", "point_field"].includes(c))
        for (const s of x.objects) {
          if (s.enabled === !1) continue;
          const r = s.size || [1, 1, 1];
          let g;
          if (s.type === "glb" || s.type === "model") {
            const u = a.get(s.id), n = this.models.get(s.id), f = s.format || (s.type === "glb" ? "glb" : "");
            u && (n?.url !== u || n?.format !== f) && this.loadModel(s.id, u, f), n?.url === u ? (g = n.scene, _(g, s.material_mode || "textured")) : g = new e.Mesh(new e.BoxGeometry(r[0], r[1], r[2] || 1), O.clone());
          } else if (s.type === "sphere") g = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), D(s, c));
          else if (s.type === "ground") g = new e.Mesh(new e.BoxGeometry(1, 1, 1), D(s, c));
          else if (s.type === "card")
            g = s.material_mode && s.material_mode !== "textured" ? new e.Mesh(new e.PlaneGeometry(r[0], r[1]), D(s, c)) : N(s, y.get(s.id), x.card_fit || "contain");
          else if (s.type === "null") {
            const u = new e.AxesHelper(0.5);
            u.position.fromArray(s.position || [0, 0, 0]), u.userData.omnicamId = s.id, u.frustumCulled = !1, this.objectNodes.set(s.id, u), this.content.add(u);
            continue;
          } else
            g = new e.Mesh(new e.BoxGeometry(1, 1, 1), D(s, c));
          g.position.fromArray(s.position || [0, 0, 0]), g.rotation.set(...(s.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), s.type !== "card" && g.scale.fromArray(r), g.userData.omnicamId = s.id, g.frustumCulled = !1, g.traverse((u) => {
            u.frustumCulled = !1, u.userData.omnicamId = s.id;
          }), ur(e, g, { wireframe: x.show_wireframe, vertices: x.show_vertices }), this.objectNodes.set(s.id, g), this.content.add(g);
        }
    },
    rebuildPath(x, y = "camera", a = null) {
      k(this.path), this.path.clear();
      const c = [
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
      (x.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: x.keyframes || [] }]).forEach((r, g) => {
        const u = r.keyframes || [];
        if (u.length === 0) return;
        const n = r.color ? { line: new e.Color(r.color), marker: new e.Color(r.color), frustum: new e.Color(r.color) } : c[g % c.length], f = r.id === x.active_camera_id, o = f && y === "camera";
        if (u.length >= 2) {
          const w = u[0].frame, b = u[u.length - 1].frame, p = Math.max(32, Math.min(256, b - w + 1)), M = { ...r, keyframes: u, objects: x.objects }, L = Array.from({ length: p }, (T, F) => {
            const U = w + (b - w) * F / Math.max(1, p - 1);
            return new e.Vector3().fromArray(I(M, U, x.objects).position);
          }), B = new e.CatmullRomCurve3(L, !1, "centripetal"), P = o ? 0.06 : f ? 0.045 : 0.025, j = new e.MeshBasicMaterial({
            color: n.line,
            transparent: !0,
            opacity: f ? 1 : 0.55,
            depthTest: !1
          }), V = new e.Mesh(new e.TubeGeometry(B, Math.max(48, p), P, 8, !1), j);
          if (V.renderOrder = 900, V.userData.omnicamWidget = "path", this.path.add(V), f) {
            const T = new e.Mesh(
              new e.TubeGeometry(B, Math.max(48, p), P * (o ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: n.line, transparent: !0, opacity: o ? 0.3 : 0.18, depthTest: !1 })
            );
            T.renderOrder = 899, T.userData.omnicamWidget = "path", this.path.add(T);
          }
        }
        for (const w of u) {
          const b = new e.Mesh(
            new e.SphereGeometry(f ? 0.13 : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: n.marker, depthTest: !1 })
          );
          b.position.fromArray(w.camera.position), b.renderOrder = 910, b.userData.omnicamPathKey = { cameraId: r.id, frame: w.frame }, b.userData.omnicamWidget = "path", this.path.add(b);
          const p = new e.Vector3().fromArray(w.camera.position), M = new e.Vector3().fromArray(w.camera.target || [0, 0, 0]), L = f && a != null && w.frame === a;
          if (L) {
            const B = M.clone().sub(p).normalize();
            let P = new e.Vector3().crossVectors(B, new e.Vector3(0, 1, 0));
            P.lengthSq() < 1e-8 ? P.set(1, 0, 0) : P.normalize();
            const j = new e.Vector3().crossVectors(P, B).normalize(), V = e.MathUtils.clamp(p.distanceTo(M) * 0.08, 0.25, 0.8), T = w.camera.camera_type === "orthographic" ? V * 0.55 : V * Math.tan(e.MathUtils.degToRad(w.camera.fov || 35) * 0.5), F = T * (x.width || 16) / Math.max(1, x.height || 9), U = p.clone().addScaledVector(B, V), Y = [
              U.clone().addScaledVector(P, -F).addScaledVector(j, -T),
              U.clone().addScaledVector(P, F).addScaledVector(j, -T),
              U.clone().addScaledVector(P, F).addScaledVector(j, T),
              U.clone().addScaledVector(P, -F).addScaledVector(j, T)
            ], d = [];
            for (const z of Y) d.push(p, z);
            for (let z = 0; z < 4; z++) d.push(Y[z], Y[(z + 1) % 4]);
            const A = new e.BufferGeometry().setFromPoints(d), q = new e.LineSegments(A, new e.LineBasicMaterial({
              color: n.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            q.userData.omnicamWidget = "gizmo", this.path.add(q);
            const R = or(e, {
              position: p,
              forward: B,
              up: j,
              color: n.marker,
              scale: e.MathUtils.clamp(V * 1.15, 0.35, 1.6),
              active: f
            });
            R.userData.omnicamWidget = "gizmo", this.path.add(R);
          }
          if (L) {
            const B = nr(e, {
              position: M,
              radius: e.MathUtils.clamp(p.distanceTo(M) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            B.userData.omnicamWidget = "lookat", this.path.add(B);
            const P = new e.Line(
              new e.BufferGeometry().setFromPoints([p.clone(), M.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            P.renderOrder = 914, P.userData.omnicamWidget = "lookat", this.path.add(P);
          }
        }
      });
      const s = [16742005, 52937, 16632686, 7101671, 14774357];
      (x.objects || []).forEach((r, g) => {
        const u = r.keyframes || [];
        if (u.length < 2) return;
        const n = r.color ? new e.Color(r.color) : s[g % s.length], f = u.map((b) => new e.Vector3().fromArray(b.transform?.position || [0, 0, 0])), o = new e.CatmullRomCurve3(f, !1, "centripetal"), w = new e.Mesh(
          new e.TubeGeometry(o, Math.max(32, u.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: n, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        w.renderOrder = 900, w.userData.omnicamWidget = "path", this.path.add(w);
        for (const b of u) {
          const p = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: n, depthTest: !1 })
          );
          p.position.fromArray(b.transform?.position || [0, 0, 0]), p.renderOrder = 910, p.userData.omnicamWidget = "path", this.path.add(p);
        }
      });
    }
  };
}
function hr(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: h, STLLoader: S, neutral: C, wire: O, checkerMaterial: G, objectMaterial: D, applyModelMaterial: _, disposeObject: k, textureFor: X, cardMesh: N, generatePointField: $, sampleCamera: I, sampleObjectTransform: J, hasOutlineMesh: x } = t;
  return {
    updateLiveCameras(y, a, c, m, s = "camera", r = null) {
      if (k(this.liveCameras), this.liveCameras.clear(), c) return;
      const g = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (y.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: y.keyframes || [] }]).forEach((n, f) => {
        const o = n.color ? { line: new e.Color(n.color), marker: new e.Color(n.color), frustum: new e.Color(n.color), body: new e.Color(n.color).multiplyScalar(0.35) } : g[f % g.length], w = n.id === y.active_camera_id, b = w && s === "camera";
        if (m === "camera" && w) return;
        const p = I(n, a, y.objects), M = new e.Vector3().fromArray(p.position || [0, 0, 0]), L = new e.Vector3().fromArray(p.target || [0, 0, 0]), B = L.clone().sub(M), P = B.length();
        P < 1e-4 ? B.set(0, 0, -1) : B.normalize();
        let j = new e.Vector3(0, 1, 0), V = new e.Vector3().crossVectors(B, j);
        V.lengthSq() < 1e-6 && (j = new e.Vector3(0, 0, 1), V = new e.Vector3().crossVectors(B, j)), V.normalize();
        let T = new e.Vector3().crossVectors(V, B).normalize();
        if (p.roll) {
          const W = e.MathUtils.degToRad(p.roll);
          V.applyAxisAngle(B, W), T.applyAxisAngle(B, W);
        }
        const F = new e.Group(), U = new e.Mesh(
          new e.BoxGeometry(0.18, 0.12, 0.22),
          new e.MeshStandardMaterial({ color: o.body, roughness: 0.4, metalness: 0.8 })
        );
        U.position.set(0, 0, -0.11), F.add(U);
        const Y = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
        Y.rotateX(Math.PI / 2);
        const d = new e.Mesh(
          Y,
          new e.MeshStandardMaterial({ color: o.marker, roughness: 0.2, metalness: 0.9 })
        );
        d.position.set(0, 0, 0.05), F.add(d);
        const A = new e.Mesh(
          new e.BoxGeometry(0.04, 0.03, 0.08),
          new e.MeshBasicMaterial({ color: w ? 16729156 : o.marker })
        );
        A.position.set(0, 0.07, -0.08), F.add(A);
        const q = new e.Matrix4().makeBasis(V, T, B.clone().negate());
        F.quaternion.setFromRotationMatrix(q), F.position.copy(M), F.userData.omnicamWidget = "gizmo", this.liveCameras.add(F);
        const R = new e.SphereGeometry(0.35, 8, 6), z = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 }), K = new e.Mesh(R, z);
        K.position.copy(M), K.userData = { omnicamType: "camera", omnicamId: n.id }, this.liveCameras.add(K);
        const ae = e.MathUtils.clamp(P * 0.25, 0.5, 2.5), E = p.camera_type === "orthographic" ? 5 / Math.max(0.01, p.zoom || 1) * 0.35 : ae * Math.tan(e.MathUtils.degToRad(p.fov || 35) * 0.5), oe = E * (y.width || 16) / Math.max(1, y.height || 9), ne = M.clone().addScaledVector(B, ae), H = [
          ne.clone().addScaledVector(V, -oe).addScaledVector(T, -E),
          ne.clone().addScaledVector(V, oe).addScaledVector(T, -E),
          ne.clone().addScaledVector(V, oe).addScaledVector(T, E),
          ne.clone().addScaledVector(V, -oe).addScaledVector(T, E)
        ], ie = [];
        for (const W of H) ie.push(M, W);
        for (let W = 0; W < 4; W++) ie.push(H[W], H[(W + 1) % 4]);
        const Ve = H[2].clone().add(H[3]).multiplyScalar(0.5).clone().addScaledVector(T, E * 0.25);
        ie.push(H[2], Ve, Ve, H[3]);
        const lt = new e.BufferGeometry().setFromPoints(ie), _e = new e.LineSegments(lt, new e.LineBasicMaterial({
          color: b ? o.marker : o.frustum,
          linewidth: w ? 2 : 1,
          transparent: !0,
          opacity: w ? 1 : 0.6
        }));
        if (_e.userData.omnicamWidget = "gizmo", this.liveCameras.add(_e), P > 0.01) {
          const W = w && s === "camera_target", ge = new e.BufferGeometry().setFromPoints([M, L]), ee = new e.Line(ge, new e.LineDashedMaterial({
            color: b || W ? 9133302 : o.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: b || W ? 1 : w ? 0.75 : 0.4
          }));
          ee.userData.omnicamWidget = "lookat", this.liveCameras.add(ee);
          const Z = W ? 0.12 : b ? 0.11 : 0.08, te = [
            L.clone().add(new e.Vector3(-Z, 0, 0)),
            L.clone().add(new e.Vector3(Z, 0, 0)),
            L.clone().add(new e.Vector3(0, -Z, 0)),
            L.clone().add(new e.Vector3(0, Z, 0)),
            L.clone().add(new e.Vector3(0, 0, -Z)),
            L.clone().add(new e.Vector3(0, 0, Z))
          ], dt = new e.BufferGeometry().setFromPoints(te), ke = new e.LineSegments(dt, new e.LineBasicMaterial({
            color: W || b ? 9133302 : o.marker,
            linewidth: W ? 3 : 1,
            transparent: !0,
            opacity: W || b ? 1 : w ? 0.9 : 0.5
          }));
          ke.userData.omnicamWidget = "lookat", this.liveCameras.add(ke);
          const ut = new e.SphereGeometry(0.28, 8, 6), we = new e.Mesh(ut, z);
          if (we.position.copy(L), we.userData = { omnicamType: "camera_target", omnicamId: n.id }, this.liveCameras.add(we), (W || b) && m !== "camera") {
            const Ae = new e.RingGeometry(0.14, 0.18, 24);
            Ae.rotateX(Math.PI / 2);
            const mt = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), ye = new e.Mesh(Ae, mt);
            ye.position.copy(L), ye.userData.omnicamWidget = "lookat", this.liveCameras.add(ye);
          }
        }
        if (w && m !== "camera" && s === "camera") {
          const W = new e.RingGeometry(0.19, 0.24, 32);
          W.rotateX(Math.PI / 2);
          const ge = new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 1 }), ee = new e.Mesh(W, ge);
          ee.position.copy(M), ee.userData.omnicamWidget = "gizmo", this.liveCameras.add(ee);
          const Z = new e.RingGeometry(0.28, 0.31, 32);
          Z.rotateX(Math.PI / 2);
          const te = new e.Mesh(Z, new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          te.position.copy(M), te.userData.omnicamWidget = "gizmo", this.liveCameras.add(te);
        }
      });
    },
    updateSelection(y, a, c, m = null, s = "") {
      const r = m ? `${m.mode || ""}:${m.objectId || ""}:${(m.point || []).join(",")}` : "", g = `${a}:${c || ""}:${(y.__selectedObjectIds || []).join(",")}:${s}:${r}`;
      if (g !== this.selectionKey) {
        if (this.selectionKey = g, k(this.selectionGroup), this.selectionGroup.clear(), a === "object" && c) {
          const u = this.objectNodes.get(c);
          if (u) {
            u.updateMatrixWorld(!0);
            try {
              const n = new e.Box3(), f = [];
              if (u.traverse((o) => {
                o.isBone && f.push(o);
              }), f.length > 0) {
                const o = new e.Vector3();
                for (const w of f)
                  w.getWorldPosition(o), n.expandByPoint(o);
                n.expandByScalar(0.2);
              } else
                n.setFromObject(u);
              if (!x(u) && !n.isEmpty() && Number.isFinite(n.min.x) && Number.isFinite(n.max.x) && Number.isFinite(n.min.y) && Number.isFinite(n.max.y) && Number.isFinite(n.min.z) && Number.isFinite(n.max.z)) {
                n.expandByScalar(0.04);
                const o = new e.Box3Helper(n, new e.Color(9133302));
                o.material.transparent = !0, o.material.opacity = 0.95, o.material.depthTest = !1, o.renderOrder = 9999, this.selectionGroup.add(o);
              }
            } catch {
            }
            if (y.show_wireframe) {
              let n = 0;
              u.traverse((f) => {
                if (!f.isMesh || !f.geometry || f.userData.omnicamHelper || n >= 64) return;
                const o = dr(e, f, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                o.renderOrder = 9998, this.selectionGroup.add(o), n += 1;
              });
            }
            if (m && m.objectId === c && m.point) {
              if (m.mode === "vertex") {
                const n = new e.SphereGeometry(0.08, 16, 12), f = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), o = new e.Mesh(n, f);
                o.position.fromArray(m.point), o.renderOrder = 1e4, this.selectionGroup.add(o);
                const w = new e.RingGeometry(0.1, 0.15, 24), b = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), p = new e.Mesh(w, b);
                p.position.fromArray(m.point), this.activeCamera && p.quaternion.copy(this.activeCamera.quaternion), p.renderOrder = 1e4, this.selectionGroup.add(p);
              } else if (m.mode === "edge" && m.edge) {
                const [n, f] = m.edge, o = new e.BufferGeometry().setFromPoints([new e.Vector3(...n), new e.Vector3(...f)]), w = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), b = new e.Line(o, w);
                b.renderOrder = 1e4, this.selectionGroup.add(b);
              } else if (m.mode === "face" && m.vertices) {
                const [n, f, o] = m.vertices, w = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...n),
                  new e.Vector3(...f),
                  new e.Vector3(...o)
                ]);
                w.setIndex([0, 1, 2]), w.computeVertexNormals();
                const b = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), p = new e.Mesh(w, b);
                p.renderOrder = 1e4, this.selectionGroup.add(p);
                const M = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...n),
                  new e.Vector3(...f),
                  new e.Vector3(...o),
                  new e.Vector3(...n)
                ]), L = new e.Line(M, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                L.renderOrder = 10001, this.selectionGroup.add(L);
              }
            }
          }
        }
        if (a === "object")
          for (const u of y.__selectedObjectIds || []) {
            if (u === c) continue;
            const n = this.objectNodes.get(u);
            if (n) {
              n.updateMatrixWorld(!0);
              try {
                const f = new e.Box3().setFromObject(n);
                if (!x(n) && !f.isEmpty() && Number.isFinite(f.min.x)) {
                  f.expandByScalar(0.04);
                  const o = new e.Box3Helper(f, new e.Color(10980346));
                  o.material.transparent = !0, o.material.opacity = 0.35, o.material.depthTest = !1, o.renderOrder = 9997, this.selectionGroup.add(o);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(y) {
      const a = this.objectNodes.get(y);
      if (!a) return [];
      const c = [], m = /* @__PURE__ */ new Set();
      return a.traverse((s) => {
        const r = s.isBone ? s.name : "";
        !r || m.has(r) || c.length >= 256 || (m.add(r), c.push(r));
      }), c;
    },
    /**
     * World position of `boneName` (or the model's animated centre when no bone
     * is named) at an arbitrary frame.
     *
     * The mixer is the only thing that knows where a bone sits at a given time,
     * so the model is posed at `frame`, probed, then posed back: a probe for a
     * frame other than the playhead must not leave the viewport showing it.
     */
    sampleModelPoint(y, a, c, m = 24) {
      const s = this.objectNodes.get(y);
      if (!s) return null;
      const r = this.models.get(y), g = r?.mixer && r.duration > 0, u = g ? r.mixer.time : null;
      g && (r.mixer.setTime(Math.max(0, c) / Math.max(1, m) % r.duration), s.updateMatrixWorld(!0));
      let n = null;
      if (a) {
        let f = null;
        if (s.traverse((o) => {
          !f && o.isBone && o.name === a && (f = o);
        }), f) {
          const o = new e.Vector3().setFromMatrixPosition(f.matrixWorld);
          n = [o.x, o.y, o.z];
        }
      } else
        n = this.getObjectWorldCenter(y);
      return g && Number.isFinite(u) && (r.mixer.setTime(u), s.updateMatrixWorld(!0)), n;
    },
    getObjectWorldCenter(y) {
      const a = this.objectNodes.get(y);
      if (!a) return null;
      a.updateMatrixWorld(!0);
      const c = [];
      if (a.traverse((r) => {
        r.isBone && c.push(r);
      }), c.length > 0) {
        const r = new e.Vector3(), g = new e.Vector3();
        for (const u of c)
          u.getWorldPosition(g), r.add(g);
        return r.divideScalar(c.length), [r.x, r.y, r.z];
      }
      const m = new e.Box3().setFromObject(a);
      if (!m.isEmpty() && Number.isFinite(m.min.x)) {
        const r = m.getCenter(new e.Vector3());
        return [r.x, r.y, r.z];
      }
      const s = new e.Vector3();
      return a.getWorldPosition(s), [s.x, s.y, s.z];
    }
  };
}
function fr(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: h, STLLoader: S, neutral: C, wire: O, checkerMaterial: G, objectMaterial: D, applyModelMaterial: _, disposeObject: k, textureFor: X, cardMesh: N, generatePointField: $, sampleCamera: I, sampleObjectTransform: J } = t;
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(x) {
      if (!this.path.visible || !this.activeCamera) return null;
      this.pointer.set(x[0] / this.canvas.width * 2 - 1, -(x[1] / this.canvas.height) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const y of this.raycaster.intersectObjects(this.path.children, !0)) {
        const a = Xt(y);
        if (a) return { ...a, position: y.object.position.toArray() };
      }
      return null;
    },
    configureCamera(x, y) {
      const a = x || defaultCamera(), c = Math.max(5e-3, Number(a.near) || 0.01), m = Math.max(c + 1, Number(a.far) || 1e4);
      let s;
      if (a.camera_type === "orthographic") {
        s = this.orthographic;
        const o = 5 / Math.max(0.01, a.zoom || 1);
        s.left = -o * y, s.right = o * y, s.top = o, s.bottom = -o, s.near = c, s.far = m, s.updateProjectionMatrix();
      } else
        s = this.perspective, s.fov = e.MathUtils.clamp(Number(a.fov) || 35, 1, 175), s.aspect = y, s.near = c, s.far = m, s.updateProjectionMatrix();
      const r = new e.Vector3().fromArray(a.position || [6, 4, 6]), g = new e.Vector3().fromArray(a.target || [0, 1.5, 0]), u = g.clone().sub(r);
      u.lengthSq() < 1e-6 ? u.set(0, 0, -1) : u.normalize();
      let n = a.up ? new e.Vector3().fromArray(a.up) : new e.Vector3(0, 1, 0), f = new e.Vector3().crossVectors(u, n);
      if (f.lengthSq() < 1e-6 && (n = Math.abs(u.y) > 0.9 ? new e.Vector3(0, 0, u.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), f.crossVectors(u, n)), f.normalize(), n.crossVectors(f, u).normalize(), a.roll) {
        const o = e.MathUtils.degToRad(a.roll);
        f.applyAxisAngle(u, o), n.applyAxisAngle(u, o);
      }
      return s.position.copy(r), s.up.copy(n), s.lookAt(g), s.updateMatrixWorld(), s;
    },
    pick(x, y, a, c) {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, a) * 2 - 1, 1 - y / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const m = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const s of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          s.object?.userData?.omnicamType && m.push({
            distance: s.distance,
            type: s.object.userData.omnicamType,
            id: s.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const s of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (s.object?.userData?.omnicamCaptureGuide || s.object?.userData?.omnicamHelper) continue;
          let r = s.object;
          for (; r && !r.userData?.omnicamId; ) r = r.parent;
          r?.userData?.omnicamId && m.push({
            distance: s.distance,
            type: "object",
            id: r.userData.omnicamId
          });
        }
      return m.length ? (m.sort((s, r) => s.distance - r.distance), { type: m[0].type, id: m[0].id }) : null;
    },
    pickSubElement(x, y, a, c, m = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, a) * 2 - 1, 1 - y / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const s = this.raycaster.intersectObjects(this.content.children, !0);
      for (const r of s) {
        let g = r.object, u = r.object;
        for (; g && !g.userData.omnicamId; ) g = g.parent;
        if (!g?.userData.omnicamId || !u.geometry) continue;
        const n = g.userData.omnicamId, o = u.geometry.getAttribute("position");
        if (!o) continue;
        u.updateMatrixWorld(!0);
        const w = u.matrixWorld;
        if (m === "vertex") {
          let b = -1, p = 1 / 0, M = null;
          if (r.face) {
            const L = [r.face.a, r.face.b, r.face.c];
            for (const B of L) {
              const P = new e.Vector3(o.getX(B), o.getY(B), o.getZ(B)).applyMatrix4(w), j = P.distanceTo(r.point);
              j < p && (p = j, b = B, M = [P.x, P.y, P.z]);
            }
          } else
            for (let L = 0; L < o.count; L++) {
              const B = new e.Vector3(o.getX(L), o.getY(L), o.getZ(L)).applyMatrix4(w), P = B.distanceTo(r.point);
              P < p && (p = P, b = L, M = [B.x, B.y, B.z]);
            }
          if (M)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: n,
              index: b,
              point: M
            };
        }
        if (m === "edge" && r.face) {
          const b = new e.Vector3(o.getX(r.face.a), o.getY(r.face.a), o.getZ(r.face.a)).applyMatrix4(w), p = new e.Vector3(o.getX(r.face.b), o.getY(r.face.b), o.getZ(r.face.b)).applyMatrix4(w), M = new e.Vector3(o.getX(r.face.c), o.getY(r.face.c), o.getZ(r.face.c)).applyMatrix4(w), L = (T, F, U) => {
            const Y = new e.Line3(F, U), d = new e.Vector3();
            return Y.closestPointToPoint(T, !0, d), { dist: T.distanceTo(d), point: d, segment: [F, U] };
          }, B = L(r.point, b, p), P = L(r.point, p, M), j = L(r.point, M, b), V = [B, P, j].reduce((T, F) => F.dist < T.dist ? F : T);
          return {
            type: "edge",
            mode: "edge",
            objectId: n,
            point: [V.point.x, V.point.y, V.point.z],
            edge: [
              [V.segment[0].x, V.segment[0].y, V.segment[0].z],
              [V.segment[1].x, V.segment[1].y, V.segment[1].z]
            ]
          };
        }
        if (m === "face" && r.face) {
          const b = new e.Vector3(o.getX(r.face.a), o.getY(r.face.a), o.getZ(r.face.a)).applyMatrix4(w), p = new e.Vector3(o.getX(r.face.b), o.getY(r.face.b), o.getZ(r.face.b)).applyMatrix4(w), M = new e.Vector3(o.getX(r.face.c), o.getY(r.face.c), o.getZ(r.face.c)).applyMatrix4(w), L = new e.Vector3().add(b).add(p).add(M).divideScalar(3), B = r.face.normal.clone().transformDirection(w);
          return {
            type: "face",
            mode: "face",
            objectId: n,
            faceIndex: r.faceIndex,
            point: [L.x, L.y, L.z],
            normal: [B.x, B.y, B.z],
            vertices: [
              [b.x, b.y, b.z],
              [p.x, p.y, p.z],
              [M.x, M.y, M.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(x, y, a, c) {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, a) * 2 - 1, 1 - y / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const m = this.raycaster.intersectObjects(this.content.children, !0);
      if (m.length > 0)
        return [m[0].point.x, m[0].point.y, m[0].point.z];
      const s = new e.Plane(new e.Vector3(0, 1, 0), 0), r = new e.Vector3();
      return this.raycaster.ray.intersectPlane(s, r) ? [r.x, r.y, r.z] : null;
    }
  };
}
const Me = ["high", "balanced", "low"], pr = 25, Te = 30, gr = 0.6;
function Fe(t = "balanced") {
  return { quality: t, samples: [], downgraded: !1 };
}
function wr(t) {
  const e = Me.indexOf(t);
  return e < 0 || e >= Me.length - 1 ? null : Me[e + 1];
}
function yr(t, e) {
  if (!Number.isFinite(e) || e < 0 || (t.samples.push(e), t.samples.length > Te && t.samples.shift(), t.samples.length < Te) || t.samples.filter((v) => v > pr).length / t.samples.length < gr) return null;
  const l = wr(t.quality);
  return l ? (t.quality = l, t.downgraded = !0, t.samples = [], l) : null;
}
function Mr(t, e) {
  return t.quality = e, t.samples = [], t.downgraded = !1, t;
}
function xr(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: h, STLLoader: S, neutral: C, wire: O, checkerMaterial: G, objectMaterial: D, applyModelMaterial: _, disposeObject: k, textureFor: X, cardMesh: N, generatePointField: $, sampleCamera: I, sampleObjectTransform: J, hasOutlineMesh: x, SelectionOutlineRenderer: y } = t;
  return {
    render(a, c, m, s, r, g = /* @__PURE__ */ new Map(), u = 0, n = !1, f = "camera", o = "subject", w = null, b = null) {
      const p = !n || (a.render_mode || "") === "beauty";
      if (p !== this.studioEnabled) {
        this.studioEnabled = p, nt(e, this.scene, this.renderer, this.studio, p);
        for (const d of this.flatLights || []) d.visible = !p;
      }
      if (this.disposed) return;
      (this.canvas.width !== s || this.canvas.height !== r) && this.renderer.setSize(s, r, !1);
      const M = a.viewport_bg_sequence && a.viewport_bg_sequence.length ? a.viewport_bg_sequence[u % a.viewport_bg_sequence.length] : a.viewport_bg_image || "";
      if (M) {
        this.bgImageUrl = M;
        const d = this.bgTextureCache.get(M);
        if (d)
          this.bgTextureCache.delete(M), this.bgTextureCache.set(M, d), this.bgTexture = d, this.scene.background = d;
        else if (!this.bgTextureLoads.has(M)) {
          const A = this.bgLoadGeneration;
          this.bgTextureLoads.set(M, A), new e.TextureLoader().load(M, (R) => {
            if (this.bgTextureLoads.delete(M), this.disposed || A !== this.bgLoadGeneration) {
              R.dispose();
              return;
            }
            for (R.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(M, R); this.bgTextureCache.size > 8; ) {
              const z = [...this.bgTextureCache.keys()].find((ae) => ae !== this.bgImageUrl);
              if (!z) break;
              const K = this.bgTextureCache.get(z);
              this.bgTextureCache.delete(z), K?.dispose?.();
            }
            this.bgImageUrl === M && (this.bgTexture = R, this.scene.background = R), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(M);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const A of new Set(this.bgTextureCache.values())) A.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const d = a.viewport_bg_color && a.viewport_bg_color !== Oe;
        this.scene.background = this.studioEnabled && !d ? this.studio.sky : new e.Color(a.viewport_bg_color || Oe);
      }
      const L = JSON.stringify([
        a.render_mode,
        a.card_fit,
        a.point_density,
        a.point_spread,
        !!a.show_wireframe,
        !!a.show_vertices,
        a.objects.map((d) => {
          const { position: A, rotation: q, keyframes: R, size: z, ...K } = d;
          return d.type === "card" && (K.size = z), K;
        })
      ]), B = [...m.entries()].map(([d, A]) => `${d}:${A?.src || ""}`).join("|"), P = [...g.entries()].map(([d, A]) => `${d}:${A}`).join("|");
      (L !== this.sceneKey || B !== this.mediaSignature || P !== this.modelSignature) && (this.sceneKey = L, this.mediaSignature = B, this.modelSignature = P, this.rebuild(a, m, g));
      for (const d of this.models.values())
        d.mixer && d.duration > 0 && d.mixer.setTime(u / Math.max(1, a.fps || 24) % d.duration);
      for (const d of a.objects) {
        const A = this.objectNodes.get(d.id);
        if (!A) continue;
        const q = d.keyframes?.length ? J(d, u) : d;
        A.position.fromArray(q.position || [0, 0, 0]), A.rotation.set(...(q.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), d.type !== "card" && d.type !== "null" && A.scale.fromArray(q.size || [1, 1, 1]), d.type === "null" && (A.visible = n ? !0 : a.show_helper_axes !== !1);
      }
      this.path.visible = !n;
      const j = a.show_grid !== !1 && a.render_mode !== "point_field";
      this.content.traverse((d) => {
        d.userData.omnicamCaptureGuide && (d.visible = n ? !!a.playblast_grid : j);
      });
      const V = `${f}:${b ?? ""}:${a.__omnicamRevision ?? JSON.stringify([
        a.active_camera_id,
        (a.cameras || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((A) => [A.frame, A.camera?.position, A.camera?.target])]),
        (a.objects || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((A) => [A.frame, A.transform?.position])])
      ])}`;
      if (V !== this.pathKey && (this.pathKey = V, this.rebuildPath(a, f, b)), this.updateLiveCameras(a, u, n, a.view_mode || "camera", f, b), this.liveCameras.visible = !n, !n) {
        const d = a.show_camera_paths !== !1, A = a.show_camera_gizmos !== !1, q = a.show_look_at !== !1;
        for (const R of [this.path, this.liveCameras])
          R.traverse((z) => {
            const K = z.userData.omnicamWidget;
            K === "path" ? z.visible = d : K === "gizmo" ? z.visible = A : K === "lookat" && (z.visible = q);
          });
      }
      n ? this.selectionGroup.visible = !1 : (this.updateSelection(a, f, o, w, `${a.__omnicamRevision ?? "legacy"}:${u}`), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey && (this.contentShadowKey = this.sceneKey, this.content.traverse((d) => {
        !d.isMesh || d.userData.omnicamCaptureGuide || (d.castShadow = !0, d.receiveShadow = !0);
      })), this.content.visible = !0;
      const T = s / Math.max(1, r), F = this.configureCamera(c, T);
      this.activeCamera = F, this.path.traverse((d) => {
        d.userData.omnicamBillboard && d.quaternion.copy(F.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, s, r);
      const U = performance.now();
      let Y = !1;
      if (!n && f === "object" && o && !w) {
        const d = this.objectNodes.get(o);
        d && x(d) && (this.outlineRenderer || (this.outlineRenderer = new y(this.renderer, this.scene, void 0, F)), this.outlineRenderer.render(F, s, r, [d]), Y = !0);
      }
      if (Y || this.renderer.render(this.scene, F), !n && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Fe(this.studio?.quality);
        const d = yr(this.qualityMonitor, performance.now() - U);
        d && (De(this.studio, this.renderer, d), this.onQualityDowngrade?.(d));
      }
    },
    setViewportQuality(a) {
      De(this.studio, this.renderer, a), this.qualityMonitor = Mr(this.qualityMonitor || Fe(a), a);
    },
    dispose() {
      if (!this.disposed) {
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), k(this.content), k(this.path), k(this.liveCameras), k(this.selectionGroup);
        for (const a of new Set(this.bgTextureCache.values())) a.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const a of this.models.values()) k(a.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.outlineRenderer?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
const br = {
  EffectComposer: Kt,
  OutlinePass: qt,
  OutputPass: $t,
  RenderPass: Rt,
  Vector2: Le
};
function vr(t) {
  let e = !1;
  return t?.traverse?.((i) => {
    e || i.visible === !1 || !i.isMesh || i.userData?.omnicamHelper || i.userData?.omnicamCaptureGuide || (e = !!(i.geometry && i.material));
  }), e;
}
class Cr {
  constructor(e, i, l = br, v = null) {
    const { EffectComposer: h, RenderPass: S, OutlinePass: C, OutputPass: O, Vector2: G } = l;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new h(e), this.renderPass = new S(i, v), this.outlinePass = new C(new G(1, 1), i, v, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new O(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, i, l, v) {
    this.disposed || ((i !== this.width || l !== this.height) && (this.width = i, this.height = l, this.composer.setSize(i, l)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...v], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const se = new Be({ color: 9212571, roughness: 0.9, metalness: 0 }), Ge = new me({ color: 11449792, wireframe: !0 });
function Pe() {
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
  ]), e = new Ne(t, 2, 2, Xe);
  return e.wrapS = e.wrapT = Ze, e.repeat.set(8, 8), e.colorSpace = pe, e.needsUpdate = !0, new Be({ map: e, roughness: 0.85, metalness: 0 });
}
function Sr(t, e) {
  if (e === "wireframe" || t.material_mode === "wireframe") {
    const l = Ge.clone();
    return t.color && (l.color = new de(t.color)), l;
  }
  if (t.material_mode === "checker") return Pe();
  const i = se.clone();
  return t.color && (i.color = new de(t.color)), i;
}
function Br(t, e) {
  t.traverse((i) => {
    if (i.isMesh) {
      if (i.userData.omnicamOriginalMaterial || (i.userData.omnicamOriginalMaterial = i.material), i.userData.omnicamOverrideMaterial) {
        const l = Array.isArray(i.material) ? i.material : [i.material];
        for (const v of l)
          v?.map?.dispose?.(), v?.dispose?.();
        i.userData.omnicamOverrideMaterial = !1;
      }
      e === "textured" ? i.material = i.userData.omnicamOriginalMaterial : (i.material = e === "checker" ? Pe() : e === "wireframe" ? Ge.clone() : se.clone(), i.userData.omnicamOverrideMaterial = !0);
    }
  });
}
function Se(t, e = !1) {
  t.traverse((i) => {
    if (i.userData.omnicamModelResource && !e) return;
    i.geometry?.dispose?.();
    const l = Array.isArray(i.material) ? i.material : [i.material];
    for (const v of l)
      v?.map?.dispose?.(), v?.dispose?.();
  });
}
function ct(t) {
  if (!t) return null;
  const e = t instanceof HTMLVideoElement ? new Ee(t) : new He(t);
  return e.colorSpace = pe, e.needsUpdate = !0, e;
}
function Lr(t, e, i) {
  const [l, v] = t.size || [2, 3], h = new Q(), S = new re(new xe(l, v), new me({ color: 1448482, side: ue, transparent: !0, opacity: 0.85 }));
  S.frustumCulled = !1, h.add(S);
  const C = ct(e);
  if (!C) return h;
  const O = e.videoWidth || e.naturalWidth || e.width || l, G = e.videoHeight || e.naturalHeight || e.height || v, D = O / Math.max(1, G), _ = l / Math.max(0.01, v);
  let k = l, X = v;
  i === "contain" ? D > _ ? X = l / D : k = v * D : i === "cover" && (D > _ ? (C.repeat.x = _ / D, C.offset.x = (1 - C.repeat.x) * 0.5) : (C.repeat.y = D / _, C.offset.y = (1 - C.repeat.y) * 0.5));
  const N = new re(
    new xe(k, X),
    new me({
      color: 16777215,
      map: C,
      side: ue,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return N.frustumCulled = !1, N.position.z = 2e-3, h.add(N), h.frustumCulled = !1, h;
}
class Gr {
  constructor(e = () => {
  }, i = () => {
  }) {
    this.canvas = document.createElement("canvas"), this.renderer = new et({
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
    }), this.renderer.setPixelRatio(1), this.renderer.outputColorSpace = pe, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = Re, this.scene = new Qe(), this.scene.background = new de(1184274), this.scene.add(new Ie(16777215, 3159099, 2.2));
    const l = new ze(16777215, 2.4);
    l.position.set(5, 8, 4), this.scene.add(l), this.flatLights = [this.scene.children.at(-2), l], this.studio = Jt(ve, this.renderer, Ht), this.scene.add(this.studio.group), this.studioEnabled = !0, nt(ve, this.scene, this.renderer, this.studio, !0), this.content = new Q(), this.scene.add(this.content), this.path = new Q(), this.scene.add(this.path), this.liveCameras = new Q(), this.scene.add(this.liveCameras), this.selectionGroup = new Q(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new $e(35, 16 / 9, 0.01, 1e4), this.orthographic = new Ue(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = i, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new Ye(), this.pointer = new Le(), this.activeCamera = this.perspective;
  }
  async loadModel(e, i, l = "glb") {
    const v = `${l}:${i}`;
    if (!(!i || this.modelLoads.get(e) === v)) {
      this.modelLoads.set(e, v);
      try {
        let h, S = [];
        if (l === "obj") h = await new tt().loadAsync(i);
        else if (l === "fbx")
          h = await new rt().loadAsync(i), S = h.animations || [];
        else if (l === "stl") h = new re(await new st().loadAsync(i), se.clone());
        else if (l === "ply") {
          const c = await new at().loadAsync(i);
          c.index ? (c.getAttribute("normal") || c.computeVertexNormals(), h = new re(c, se.clone())) : h = new qe(c, new Ke({ color: 11449792, size: 0.025 }));
        } else {
          const c = await new ot().loadAsync(i);
          h = c.scene, S = c.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== v) {
          Se(h, !0);
          return;
        }
        const C = this.models.get(e);
        C && Se(C.scene, !0), h.traverse((c) => {
          if (c.userData.omnicamModelResource = !0, c.frustumCulled = !1, c.isMesh && (c.frustumCulled = !1, c.material)) {
            const m = Array.isArray(c.material) ? c.material : [c.material];
            for (const s of m)
              s.side = ue;
          }
          c.isPoints && (c.frustumCulled = !1), c.isSkinnedMesh && (c.frustumCulled = !1, c.computeBoundingBox?.(), c.computeBoundingSphere?.());
        });
        let O = 0, G = 0, D = 0, _ = 0;
        h.traverse((c) => {
          c.isMesh && (O += 1, _ += c.geometry?.getAttribute?.("position")?.count || 0), c.isPoints && (G += 1), c.isBone && (D += 1);
        });
        const k = new Q();
        if (k.frustumCulled = !1, k.add(h), !O && !G && D) {
          const c = new Je(h);
          c.material.depthTest = !1, c.material.opacity = 0.9, c.material.transparent = !0, c.renderOrder = 10, c.userData.omnicamModelResource = !0, k.add(c);
        }
        k.updateMatrixWorld(!0);
        const X = new je().setFromObject(k), N = X.getSize(new be()), $ = Math.max(N.x, N.y, N.z), I = Number.isFinite($) && $ > 1e-6 ? 2.5 / $ : 1, J = X.getCenter(new be());
        k.scale.setScalar(I), k.position.set(-J.x * I, -X.min.y * I, -J.z * I);
        const x = new Q();
        x.frustumCulled = !1, x.add(k);
        const y = S.length ? new We(h) : null;
        y && y.clipAction(S[0]).play();
        const a = { url: i, format: l, scene: x, mixer: y, clips: S, selectedClip: 0, duration: S[0]?.duration || 0, meshes: O, points: G, bones: D, vertices: _, animations: S.length, normalizationScale: I };
        this.models.set(e, a), this.onModelLoaded({ id: e, format: l, meshes: O, points: G, bones: D, vertices: _, animations: S.length, animationNames: S.map((c, m) => c.name || `Clip ${m + 1}`), duration: a.duration, normalizationScale: I }), this.sceneKey = "", this.invalidate();
      } catch (h) {
        this.modelLoads.get(e) === v && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${l.toUpperCase()} ${e}`, h);
        const S = h?.message?.includes("FBX version not supported") || h?.message?.includes("6100") || h?.message?.includes("6000"), C = S ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : h?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: l, error: C, isLegacyFBX: S });
      }
    }
  }
}
const ce = { THREE: ve, FBXLoader: rt, GLTFLoader: ot, OBJLoader: tt, PLYLoader: at, STLLoader: st, neutral: se, wire: Ge, checkerMaterial: Pe, objectMaterial: Sr, applyModelMaterial: Br, disposeObject: Se, textureFor: ct, cardMesh: Lr, generatePointField: Yt, sampleCamera: Zt, sampleObjectTransform: Qt, hasOutlineMesh: vr, SelectionOutlineRenderer: Cr };
Object.assign(
  Gr.prototype,
  mr(ce),
  hr(ce),
  fr(ce),
  xr(ce)
);
async function Pr(t, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const i of ["vp9", "vp8"])
    try {
      if (await le(ar(i, { width: t, height: e }), 5e3, `Checking ${i} support`)) return i;
    } catch {
    }
  return null;
}
function le(t, e, i) {
  let l;
  return Promise.race([
    t,
    new Promise((v, h) => {
      l = setTimeout(() => h(new Error(`${i} timed out`)), e);
    })
  ]).finally(() => clearTimeout(l));
}
async function Or(t, e, i, l, v) {
  const h = await Pr(t.width, t.height);
  if (!h) throw new Error("No supported WebCodecs WebM encoder");
  const S = new Et({ format: new tr(), target: new er() }), C = new rr(t, { codec: h, quality: new sr("high"), keyFrameInterval: 1 });
  S.addVideoTrack(C, { frameRate: i }), await le(S.start(), 1e4, "Starting deterministic encoder");
  try {
    const O = 1 / i;
    for (let G = 0; G < e; G++) {
      if (v?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await l(G), await le(C.add(G * O, O, { keyFrame: G % i === 0 }), 1e4, `Encoding frame ${G + 1}`);
    }
    await le(S.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (O) {
    throw S.state !== "finalized" && await S.cancel().catch(() => {
    }), O;
  }
  return new Blob([S.target.buffer], { type: await S.getMimeType() });
}
export {
  Gr as OmniWebGLViewport,
  Or as encodeDeterministicPlayblast,
  Pr as supportsDeterministicEncoding
};
