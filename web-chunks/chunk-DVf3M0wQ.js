import { G as E, D as _e, M as ae, P as pe, a as xe, S as at, b as ot, C as st, c as he, E as nt, A as it, d as ce, N as ct, e as ke, f as lt, B as Ae, g as dt, h as ut, i as mt, j as ht, k as ft, l as pt, m as De, n as le, F as gt, o as wt, H as Oe, L as yt, p as Mt, q as xt, r as bt, s as vt, t as Ct, u as St, v as de, O as Te, w as Fe, x as ze, y as Bt, z as We, I as je, Q as Lt, J as Ne, K as Ie, T as Ue, U as Vt, V as qe, W as Re, X as Pt, Y as Gt, Z as $e, _ as _t, $ as kt, a0 as be, a1 as ge, a2 as Ke, a3 as Xe, a4 as At, a5 as Dt, a6 as Ot, a7 as Tt, a8 as Ft, a9 as Ye, aa as Qe, ab as Ze, ac as Je, ad as He } from "./chunk-BNTXm8ZY.js";
import { a3 as zt, D as Wt, s as jt, f as Nt } from "./chunk-BEhDu902.js";
import { q as It, a as Le, s as Ee, D as Ve, c as Ut, b as qt, d as Rt } from "./chunk-B43stmkp.js";
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
  CanvasTexture: st,
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
  Mesh: ae,
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
  ShadowMaterial: at,
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
function Jt(t, { position: e, forward: n, up: l, color: v, scale: h = 1, active: B = !0 }) {
  const S = new t.Group(), F = B ? 0.95 : 0.5, G = new t.MeshBasicMaterial({
    color: v,
    transparent: !0,
    opacity: F,
    depthTest: !1
  }), D = new t.Mesh(new t.BoxGeometry(0.34, 0.24, 0.42), G);
  D.renderOrder = 912, S.add(D);
  const k = new t.Mesh(new t.ConeGeometry(0.17, 0.26, 20), G);
  return k.rotation.x = -Math.PI / 2, k.position.z = -0.32, k.renderOrder = 912, S.add(k), S.scale.setScalar(h), S.position.copy(e), S.up.copy(l), S.lookAt(e.clone().add(n)), S;
}
function Ht(t, { position: e, color: n = 15903035, radius: l = 0.28, bold: v = !1 }) {
  const h = new t.Group(), B = v ? 16773544 : n, S = new t.LineBasicMaterial({ color: B, transparent: !0, opacity: v ? 1 : 0.95, depthTest: !1 }), F = (k) => {
    const A = [];
    for (let Q = 0; Q <= 48; Q++) {
      const K = Q / 48 * Math.PI * 2;
      A.push(new t.Vector3(Math.cos(K) * k, Math.sin(K) * k, 0));
    }
    const $ = new t.Line(new t.BufferGeometry().setFromPoints(A), S);
    return $.renderOrder = 915, $;
  };
  if (h.add(F(l)), v) {
    h.add(F(l * 1.18));
    const k = new t.Mesh(
      new t.RingGeometry(0, l * 0.3, 16),
      new t.MeshBasicMaterial({ color: B, transparent: !0, opacity: 1, depthTest: !1 })
    );
    k.renderOrder = 916, h.add(k);
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
  return D.renderOrder = 915, h.add(D), h.position.copy(e), h.userData.omnicamBillboard = !0, h;
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
    const k = new t.Points(e.geometry, n);
    return { overlay: me(k), parent: e };
  }
  const l = e.geometry.getAttribute("position")?.count || 0, v = Math.max(1, Math.ceil(l / Et)), h = Math.ceil(l / v), B = new Float32Array(h * 3), S = new t.BufferGeometry();
  S.setAttribute("position", new t.Float32BufferAttribute(B, 3));
  const F = new t.Points(S, n);
  et(F, e);
  const G = new t.Vector3(), D = S.getAttribute("position");
  return F.onBeforeRender = () => {
    for (let k = 0; k < h; k++)
      e.getVertexPosition(k * v, G), D.setXYZ(k, G.x, G.y, G.z);
    D.needsUpdate = !0;
  }, { overlay: me(F), parent: e.parent || e };
}
function rr(t, e, n) {
  const l = ue(e) ? new t.SkinnedMesh(e.geometry.clone(), n) : new t.Mesh(e.geometry.clone(), n);
  return ue(e) && (l.bindMode = e.bindMode, l.bind(e.skeleton, e.bindMatrix)), l.matrixAutoUpdate = !1, l.matrix.copy(e.matrixWorld), l.frustumCulled = !1, l;
}
function ar(t, e, { wireframe: n = !1, vertices: l = !1 } = {}) {
  if (!n && !l) return;
  const v = [];
  e.traverse((h) => {
    h.isMesh && h.geometry && !h.userData.omnicamHelper && v.push(h);
  });
  for (const h of v) {
    if (n) {
      const { overlay: B, parent: S } = er(t, h);
      S.add(B);
    }
    if (l) {
      const { overlay: B, parent: S } = tr(t, h);
      S.add(B);
    }
  }
}
function or(t) {
  const { THREE: e, FBXLoader: n, GLTFLoader: l, OBJLoader: v, PLYLoader: h, STLLoader: B, neutral: S, wire: F, checkerMaterial: G, objectMaterial: D, applyModelMaterial: k, disposeObject: A, textureFor: Z, cardMesh: $, generatePointField: Q, sampleCamera: K, sampleObjectTransform: ee } = t;
  return {
    removeModel(x) {
      const M = this.models.get(x);
      M && A(M.scene, !0), this.models.delete(x), this.modelLoads.delete(x), this.sceneKey = "";
    },
    selectAnimation(x, M) {
      const a = this.models.get(x);
      !a?.mixer || !a.clips.length || (a.selectedClip = Math.max(0, Math.min(a.clips.length - 1, Number(M) || 0)), a.duration = a.clips[a.selectedClip].duration || 0, a.mixer.stopAllAction(), a.mixer.clipAction(a.clips[a.selectedClip]).play(), this.invalidate());
    },
    rebuild(x, M, a) {
      this.content.traverse((r) => {
        for (const o of [...r.children])
          o.userData.omnicamHelper && (r.remove(o), A(o, !0));
      }), A(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const i = x.render_mode, m = new e.GridHelper(120, 120, 7829367, 3881787);
      if (m.userData.omnicamCaptureGuide = !0, m.frustumCulled = !1, this.content.add(m), ["omni_ref", "point_field"].includes(i)) {
        const { points: r, colors: o } = Q(x.point_density || "balanced", x.point_spread || "all_views", x.point_color || null);
        if (r.length > 0) {
          const p = new e.BufferGeometry();
          p.setAttribute("position", new e.Float32BufferAttribute(r, 3)), p.setAttribute("color", new e.Float32BufferAttribute(o, 3));
          const u = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), c = new e.Points(p, u);
          c.frustumCulled = !1, this.content.add(c);
        }
      }
      if (!["grid", "point_field"].includes(i))
        for (const r of x.objects) {
          if (r.enabled === !1) continue;
          const o = r.size || [1, 1, 1];
          let p;
          if (r.type === "glb" || r.type === "model") {
            const u = a.get(r.id), c = this.models.get(r.id), f = r.format || (r.type === "glb" ? "glb" : "");
            u && (c?.url !== u || c?.format !== f) && this.loadModel(r.id, u, f), c?.url === u ? (p = c.scene, k(p, r.material_mode || "textured")) : p = new e.Mesh(new e.BoxGeometry(o[0], o[1], o[2] || 1), F.clone());
          } else if (r.type === "sphere") p = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), D(r, i));
          else if (r.type === "ground") p = new e.Mesh(new e.BoxGeometry(1, 1, 1), D(r, i));
          else if (r.type === "card")
            p = r.material_mode && r.material_mode !== "textured" ? new e.Mesh(new e.PlaneGeometry(o[0], o[1]), D(r, i)) : $(r, M.get(r.id), x.card_fit || "contain");
          else if (r.type === "null") {
            const u = new e.AxesHelper(0.5);
            u.position.fromArray(r.position || [0, 0, 0]), u.userData.omnicamId = r.id, u.frustumCulled = !1, this.objectNodes.set(r.id, u), this.content.add(u);
            continue;
          } else
            p = new e.Mesh(new e.BoxGeometry(1, 1, 1), D(r, i));
          p.position.fromArray(r.position || [0, 0, 0]), p.rotation.set(...(r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), r.type !== "card" && p.scale.fromArray(o), p.userData.omnicamId = r.id, p.frustumCulled = !1, p.traverse((u) => {
            u.frustumCulled = !1, u.userData.omnicamId = r.id;
          }), ar(e, p, { wireframe: x.show_wireframe, vertices: x.show_vertices }), this.objectNodes.set(r.id, p), this.content.add(p);
        }
    },
    rebuildPath(x, M = "camera", a = null, i = "") {
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
      (x.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: x.keyframes || [] }]).forEach((u, c) => {
        const f = u.keyframes || [];
        if (f.length === 0 || u.id === m) return;
        const s = u.color ? { line: new e.Color(u.color), marker: new e.Color(u.color), frustum: new e.Color(u.color) } : r[c % r.length], C = u.id === x.active_camera_id, V = C && M === "camera";
        if (f.length >= 2) {
          const b = f[0].frame, y = f[f.length - 1].frame, g = Math.max(32, Math.min(256, y - b + 1)), L = { ...u, keyframes: f, objects: x.objects }, O = Array.from({ length: g }, (U, _) => {
            const R = b + (y - b) * _ / Math.max(1, g - 1);
            return new e.Vector3().fromArray(K(L, R, x.objects).position);
          }), q = new e.CatmullRomCurve3(O, !1, "centripetal"), P = V ? 0.06 : C ? 0.045 : 0.025, z = new e.MeshBasicMaterial({
            color: s.line,
            transparent: !0,
            opacity: C ? 1 : 0.55,
            depthTest: !1
          }), j = new e.Mesh(new e.TubeGeometry(q, Math.max(48, g), P, 8, !1), z);
          if (j.renderOrder = 900, j.userData.omnicamWidget = "path", this.path.add(j), C) {
            const U = new e.Mesh(
              new e.TubeGeometry(q, Math.max(48, g), P * (V ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: s.line, transparent: !0, opacity: V ? 0.3 : 0.18, depthTest: !1 })
            );
            U.renderOrder = 899, U.userData.omnicamWidget = "path", this.path.add(U);
          }
        }
        for (const b of f) {
          const y = new e.Mesh(
            new e.SphereGeometry(C ? 0.13 : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: s.marker, depthTest: !1 })
          );
          y.position.fromArray(b.camera.position), y.renderOrder = 910, y.userData.omnicamPathKey = { cameraId: u.id, frame: b.frame }, y.userData.omnicamWidget = "path", this.path.add(y);
          const g = new e.Vector3().fromArray(b.camera.position), L = new e.Vector3().fromArray(b.camera.target || [0, 0, 0]), O = C && a != null && b.frame === a;
          if (O) {
            const q = L.clone().sub(g).normalize();
            let P = new e.Vector3().crossVectors(q, new e.Vector3(0, 1, 0));
            P.lengthSq() < 1e-8 ? P.set(1, 0, 0) : P.normalize();
            const z = new e.Vector3().crossVectors(P, q).normalize(), j = e.MathUtils.clamp(g.distanceTo(L) * 0.08, 0.25, 0.8), U = b.camera.camera_type === "orthographic" ? j * 0.55 : j * Math.tan(e.MathUtils.degToRad(b.camera.fov || 35) * 0.5), _ = U * (x.width || 16) / Math.max(1, x.height || 9), R = g.clone().addScaledVector(q, j), d = [
              R.clone().addScaledVector(P, -_).addScaledVector(z, -U),
              R.clone().addScaledVector(P, _).addScaledVector(z, -U),
              R.clone().addScaledVector(P, _).addScaledVector(z, U),
              R.clone().addScaledVector(P, -_).addScaledVector(z, U)
            ], w = [];
            for (const W of d) w.push(g, W);
            for (let W = 0; W < 4; W++) w.push(d[W], d[(W + 1) % 4]);
            const T = new e.BufferGeometry().setFromPoints(w), N = new e.LineSegments(T, new e.LineBasicMaterial({
              color: s.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            N.userData.omnicamWidget = "gizmo", this.path.add(N);
            const I = Jt(e, {
              position: g,
              forward: q,
              up: z,
              color: s.marker,
              scale: e.MathUtils.clamp(j * 1.15, 0.35, 1.6),
              active: C
            });
            I.userData.omnicamWidget = "gizmo", this.path.add(I);
          }
          if (O) {
            const q = Ht(e, {
              position: L,
              radius: e.MathUtils.clamp(g.distanceTo(L) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            q.userData.omnicamWidget = "lookat", this.path.add(q);
            const P = new e.Line(
              new e.BufferGeometry().setFromPoints([g.clone(), L.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            P.renderOrder = 914, P.userData.omnicamWidget = "lookat", this.path.add(P);
          }
        }
      });
      const p = [16742005, 52937, 16632686, 7101671, 14774357];
      (x.objects || []).forEach((u, c) => {
        const f = u.keyframes || [];
        if (f.length < 2) return;
        const s = u.color ? new e.Color(u.color) : p[c % p.length], C = f.map((y) => new e.Vector3().fromArray(y.transform?.position || [0, 0, 0])), V = new e.CatmullRomCurve3(C, !1, "centripetal"), b = new e.Mesh(
          new e.TubeGeometry(V, Math.max(32, f.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: s, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        b.renderOrder = 900, b.userData.omnicamWidget = "path", this.path.add(b);
        for (const y of f) {
          const g = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: s, depthTest: !1 })
          );
          g.position.fromArray(y.transform?.position || [0, 0, 0]), g.renderOrder = 910, g.userData.omnicamWidget = "path", this.path.add(g);
        }
      });
    }
  };
}
function sr(t) {
  const { THREE: e, FBXLoader: n, GLTFLoader: l, OBJLoader: v, PLYLoader: h, STLLoader: B, neutral: S, wire: F, checkerMaterial: G, objectMaterial: D, applyModelMaterial: k, disposeObject: A, textureFor: Z, cardMesh: $, generatePointField: Q, sampleCamera: K, sampleObjectTransform: ee, hasOutlineMesh: x } = t;
  return {
    updateLiveCameras(M, a, i, m, r = "camera", o = null) {
      if (A(this.liveCameras), this.liveCameras.clear(), i) return;
      const p = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (M.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: M.keyframes || [] }]).forEach((c, f) => {
        const s = c.color ? { line: new e.Color(c.color), marker: new e.Color(c.color), frustum: new e.Color(c.color), body: new e.Color(c.color).multiplyScalar(0.35) } : p[f % p.length], C = c.id === M.active_camera_id, V = C && r === "camera", b = m === "camera" && C, y = K(c, a, M.objects), g = new e.Vector3().fromArray(y.position || [0, 0, 0]), L = new e.Vector3().fromArray(y.target || [0, 0, 0]), O = L.clone().sub(g), q = O.length();
        q < 1e-4 ? O.set(0, 0, -1) : O.normalize();
        let P = new e.Vector3(0, 1, 0), z = new e.Vector3().crossVectors(O, P);
        z.lengthSq() < 1e-6 && (P = new e.Vector3(0, 0, 1), z = new e.Vector3().crossVectors(O, P)), z.normalize();
        let j = new e.Vector3().crossVectors(z, O).normalize();
        if (y.roll) {
          const _ = e.MathUtils.degToRad(y.roll);
          z.applyAxisAngle(O, _), j.applyAxisAngle(O, _);
        }
        const U = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!b) {
          const _ = new e.Group(), R = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: s.body, roughness: 0.4, metalness: 0.8 })
          );
          R.position.set(0, 0, -0.11), _.add(R);
          const d = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          d.rotateX(Math.PI / 2);
          const w = new e.Mesh(
            d,
            new e.MeshStandardMaterial({ color: s.marker, roughness: 0.2, metalness: 0.9 })
          );
          w.position.set(0, 0, 0.05), _.add(w);
          const T = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: C ? 16729156 : s.marker })
          );
          T.position.set(0, 0.07, -0.08), _.add(T);
          const N = new e.Matrix4().makeBasis(z, j, O.clone().negate());
          _.quaternion.setFromRotationMatrix(N), _.position.copy(g), _.userData.omnicamWidget = "gizmo", this.liveCameras.add(_);
          const I = new e.SphereGeometry(0.35, 8, 6), W = new e.Mesh(I, U);
          W.position.copy(g), W.userData = { omnicamType: "camera", omnicamId: c.id }, this.liveCameras.add(W);
          const J = e.MathUtils.clamp(q * 0.25, 0.5, 2.5), Y = y.camera_type === "orthographic" ? 5 / Math.max(0.01, y.zoom || 1) * 0.35 : J * Math.tan(e.MathUtils.degToRad(y.fov || 35) * 0.5), X = Y * (M.width || 16) / Math.max(1, M.height || 9), H = g.clone().addScaledVector(O, J), te = [
            H.clone().addScaledVector(z, -X).addScaledVector(j, -Y),
            H.clone().addScaledVector(z, X).addScaledVector(j, -Y),
            H.clone().addScaledVector(z, X).addScaledVector(j, Y),
            H.clone().addScaledVector(z, -X).addScaledVector(j, Y)
          ], se = [];
          for (const re of te) se.push(g, re);
          for (let re = 0; re < 4; re++) se.push(te[re], te[(re + 1) % 4]);
          const Se = te[2].clone().add(te[3]).multiplyScalar(0.5).clone().addScaledVector(j, Y * 0.25);
          se.push(te[2], Se, Se, te[3]);
          const rt = new e.BufferGeometry().setFromPoints(se), Be = new e.LineSegments(rt, new e.LineBasicMaterial({
            color: V ? s.marker : s.frustum,
            linewidth: C ? 2 : 1,
            transparent: !0,
            opacity: C ? 1 : 0.6
          }));
          Be.userData.omnicamWidget = "gizmo", this.liveCameras.add(Be);
        }
        if (q > 0.01) {
          const _ = C && r === "camera_target", R = new e.BufferGeometry().setFromPoints([g, L]), d = new e.Line(R, new e.LineDashedMaterial({
            color: V || _ ? 9133302 : s.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: V || _ ? 1 : C ? 0.75 : 0.4
          }));
          d.userData.omnicamWidget = "lookat", this.liveCameras.add(d);
          const w = _ ? 0.12 : V ? 0.11 : 0.08, T = [
            L.clone().add(new e.Vector3(-w, 0, 0)),
            L.clone().add(new e.Vector3(w, 0, 0)),
            L.clone().add(new e.Vector3(0, -w, 0)),
            L.clone().add(new e.Vector3(0, w, 0)),
            L.clone().add(new e.Vector3(0, 0, -w)),
            L.clone().add(new e.Vector3(0, 0, w))
          ], N = new e.BufferGeometry().setFromPoints(T), I = new e.LineSegments(N, new e.LineBasicMaterial({
            color: _ || V ? 9133302 : s.marker,
            linewidth: _ ? 3 : 1,
            transparent: !0,
            opacity: _ || V ? 1 : C ? 0.9 : 0.5
          }));
          I.userData.omnicamWidget = "lookat", this.liveCameras.add(I);
          const W = new e.SphereGeometry(0.28, 8, 6), J = new e.Mesh(W, U);
          if (J.position.copy(L), J.userData = { omnicamType: "camera_target", omnicamId: c.id }, this.liveCameras.add(J), (_ || V) && m !== "camera") {
            const Y = new e.RingGeometry(0.14, 0.18, 24);
            Y.rotateX(Math.PI / 2);
            const X = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), H = new e.Mesh(Y, X);
            H.position.copy(L), H.userData.omnicamWidget = "lookat", this.liveCameras.add(H);
          }
        }
        if (C && m !== "camera" && r === "camera") {
          const _ = new e.RingGeometry(0.19, 0.24, 32);
          _.rotateX(Math.PI / 2);
          const R = new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 1 }), d = new e.Mesh(_, R);
          d.position.copy(g), d.userData.omnicamWidget = "gizmo", this.liveCameras.add(d);
          const w = new e.RingGeometry(0.28, 0.31, 32);
          w.rotateX(Math.PI / 2);
          const T = new e.Mesh(w, new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          T.position.copy(g), T.userData.omnicamWidget = "gizmo", this.liveCameras.add(T);
        }
      });
    },
    updateSelection(M, a, i, m = null, r = "") {
      const o = m ? `${m.mode || ""}:${m.objectId || ""}:${(m.point || []).join(",")}` : "", p = `${a}:${i || ""}:${(M.__selectedObjectIds || []).join(",")}:${r}:${o}`;
      if (p !== this.selectionKey) {
        if (this.selectionKey = p, A(this.selectionGroup), this.selectionGroup.clear(), a === "object" && i) {
          const u = this.objectNodes.get(i);
          if (u) {
            u.updateMatrixWorld(!0);
            try {
              const c = new e.Box3(), f = [];
              if (u.traverse((s) => {
                s.isBone && f.push(s);
              }), f.length > 0) {
                const s = new e.Vector3();
                for (const C of f)
                  C.getWorldPosition(s), c.expandByPoint(s);
                c.expandByScalar(0.2);
              } else
                c.setFromObject(u);
              if (!x(u) && !c.isEmpty() && Number.isFinite(c.min.x) && Number.isFinite(c.max.x) && Number.isFinite(c.min.y) && Number.isFinite(c.max.y) && Number.isFinite(c.min.z) && Number.isFinite(c.max.z)) {
                c.expandByScalar(0.04);
                const s = new e.Box3Helper(c, new e.Color(9133302));
                s.material.transparent = !0, s.material.opacity = 0.95, s.material.depthTest = !1, s.renderOrder = 9999, this.selectionGroup.add(s);
              }
            } catch {
            }
            if (M.show_wireframe) {
              let c = 0;
              u.traverse((f) => {
                if (!f.isMesh || !f.geometry || f.userData.omnicamHelper || c >= 64) return;
                const s = rr(e, f, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                s.renderOrder = 9998, this.selectionGroup.add(s), c += 1;
              });
            }
            if (m && m.objectId === i && m.point) {
              if (m.mode === "vertex") {
                const c = new e.SphereGeometry(0.08, 16, 12), f = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), s = new e.Mesh(c, f);
                s.position.fromArray(m.point), s.renderOrder = 1e4, this.selectionGroup.add(s);
                const C = new e.RingGeometry(0.1, 0.15, 24), V = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), b = new e.Mesh(C, V);
                b.position.fromArray(m.point), this.activeCamera && b.quaternion.copy(this.activeCamera.quaternion), b.renderOrder = 1e4, this.selectionGroup.add(b);
              } else if (m.mode === "edge" && m.edge) {
                const [c, f] = m.edge, s = new e.BufferGeometry().setFromPoints([new e.Vector3(...c), new e.Vector3(...f)]), C = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), V = new e.Line(s, C);
                V.renderOrder = 1e4, this.selectionGroup.add(V);
              } else if (m.mode === "face" && m.vertices) {
                const [c, f, s] = m.vertices, C = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...c),
                  new e.Vector3(...f),
                  new e.Vector3(...s)
                ]);
                C.setIndex([0, 1, 2]), C.computeVertexNormals();
                const V = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), b = new e.Mesh(C, V);
                b.renderOrder = 1e4, this.selectionGroup.add(b);
                const y = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...c),
                  new e.Vector3(...f),
                  new e.Vector3(...s),
                  new e.Vector3(...c)
                ]), g = new e.Line(y, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                g.renderOrder = 10001, this.selectionGroup.add(g);
              }
            }
          }
        }
        if (a === "object")
          for (const u of M.__selectedObjectIds || []) {
            if (u === i) continue;
            const c = this.objectNodes.get(u);
            if (c) {
              c.updateMatrixWorld(!0);
              try {
                const f = new e.Box3().setFromObject(c);
                if (!x(c) && !f.isEmpty() && Number.isFinite(f.min.x)) {
                  f.expandByScalar(0.04);
                  const s = new e.Box3Helper(f, new e.Color(10980346));
                  s.material.transparent = !0, s.material.opacity = 0.35, s.material.depthTest = !1, s.renderOrder = 9997, this.selectionGroup.add(s);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(M) {
      const a = this.objectNodes.get(M);
      if (!a) return [];
      const i = [], m = /* @__PURE__ */ new Set();
      return a.traverse((r) => {
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
    sampleModelPoint(M, a, i, m = 24) {
      const r = this.objectNodes.get(M);
      if (!r) return null;
      const o = this.models.get(M), p = o?.mixer && o.duration > 0, u = p ? o.mixer.time : null;
      p && (o.mixer.setTime(Math.max(0, i) / Math.max(1, m) % o.duration), r.updateMatrixWorld(!0));
      let c = null;
      if (a) {
        let f = null;
        if (r.traverse((s) => {
          !f && s.isBone && s.name === a && (f = s);
        }), f) {
          const s = new e.Vector3().setFromMatrixPosition(f.matrixWorld);
          c = [s.x, s.y, s.z];
        }
      } else
        c = this.getObjectWorldCenter(M);
      return p && Number.isFinite(u) && (o.mixer.setTime(u), r.updateMatrixWorld(!0)), c;
    },
    getObjectWorldCenter(M) {
      const a = this.objectNodes.get(M);
      if (!a) return null;
      a.updateMatrixWorld(!0);
      const i = [];
      if (a.traverse((o) => {
        o.isBone && i.push(o);
      }), i.length > 0) {
        const o = new e.Vector3(), p = new e.Vector3();
        for (const u of i)
          u.getWorldPosition(p), o.add(p);
        return o.divideScalar(i.length), [o.x, o.y, o.z];
      }
      const m = new e.Box3().setFromObject(a);
      if (!m.isEmpty() && Number.isFinite(m.min.x)) {
        const o = m.getCenter(new e.Vector3());
        return [o.x, o.y, o.z];
      }
      const r = new e.Vector3();
      return a.getWorldPosition(r), [r.x, r.y, r.z];
    }
  };
}
function nr(t) {
  const { THREE: e, FBXLoader: n, GLTFLoader: l, OBJLoader: v, PLYLoader: h, STLLoader: B, neutral: S, wire: F, checkerMaterial: G, objectMaterial: D, applyModelMaterial: k, disposeObject: A, textureFor: Z, cardMesh: $, generatePointField: Q, sampleCamera: K, sampleObjectTransform: ee } = t;
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(x) {
      if (!this.path.visible || !this.activeCamera) return null;
      this.pointer.set(x[0] / this.canvas.width * 2 - 1, -(x[1] / this.canvas.height) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const M of this.raycaster.intersectObjects(this.path.children, !0)) {
        const a = zt(M);
        if (a) return { ...a, position: M.object.position.toArray() };
      }
      return null;
    },
    configureCamera(x, M) {
      const a = x || defaultCamera(), i = Math.max(5e-3, Number(a.near) || 0.01), m = Math.max(i + 1, Number(a.far) || 1e4);
      let r;
      if (a.camera_type === "orthographic") {
        r = this.orthographic;
        const s = 5 / Math.max(0.01, a.zoom || 1);
        r.left = -s * M, r.right = s * M, r.top = s, r.bottom = -s, r.near = i, r.far = m, r.updateProjectionMatrix();
      } else
        r = this.perspective, r.fov = e.MathUtils.clamp(Number(a.fov) || 35, 1, 175), r.aspect = M, r.near = i, r.far = m, r.updateProjectionMatrix();
      const o = new e.Vector3().fromArray(a.position || [6, 4, 6]), p = new e.Vector3().fromArray(a.target || [0, 1.5, 0]), u = p.clone().sub(o);
      u.lengthSq() < 1e-6 ? u.set(0, 0, -1) : u.normalize();
      let c = a.up ? new e.Vector3().fromArray(a.up) : new e.Vector3(0, 1, 0), f = new e.Vector3().crossVectors(u, c);
      if (f.lengthSq() < 1e-6 && (c = Math.abs(u.y) > 0.9 ? new e.Vector3(0, 0, u.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), f.crossVectors(u, c)), f.normalize(), c.crossVectors(f, u).normalize(), a.roll) {
        const s = e.MathUtils.degToRad(a.roll);
        f.applyAxisAngle(u, s), c.applyAxisAngle(u, s);
      }
      return r.position.copy(o), r.up.copy(c), r.lookAt(p), r.updateMatrixWorld(), r;
    },
    pick(x, M, a, i) {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, a) * 2 - 1, 1 - M / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
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
    pickSubElement(x, M, a, i, m = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, a) * 2 - 1, 1 - M / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const r = this.raycaster.intersectObjects(this.content.children, !0);
      for (const o of r) {
        let p = o.object, u = o.object;
        for (; p && !p.userData.omnicamId; ) p = p.parent;
        if (!p?.userData.omnicamId || !u.geometry) continue;
        const c = p.userData.omnicamId, s = u.geometry.getAttribute("position");
        if (!s) continue;
        u.updateMatrixWorld(!0);
        const C = u.matrixWorld;
        if (m === "vertex") {
          let V = -1, b = 1 / 0, y = null;
          if (o.face) {
            const g = [o.face.a, o.face.b, o.face.c];
            for (const L of g) {
              const O = new e.Vector3(s.getX(L), s.getY(L), s.getZ(L)).applyMatrix4(C), q = O.distanceTo(o.point);
              q < b && (b = q, V = L, y = [O.x, O.y, O.z]);
            }
          } else
            for (let g = 0; g < s.count; g++) {
              const L = new e.Vector3(s.getX(g), s.getY(g), s.getZ(g)).applyMatrix4(C), O = L.distanceTo(o.point);
              O < b && (b = O, V = g, y = [L.x, L.y, L.z]);
            }
          if (y)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: c,
              index: V,
              point: y
            };
        }
        if (m === "edge" && o.face) {
          const V = new e.Vector3(s.getX(o.face.a), s.getY(o.face.a), s.getZ(o.face.a)).applyMatrix4(C), b = new e.Vector3(s.getX(o.face.b), s.getY(o.face.b), s.getZ(o.face.b)).applyMatrix4(C), y = new e.Vector3(s.getX(o.face.c), s.getY(o.face.c), s.getZ(o.face.c)).applyMatrix4(C), g = (z, j, U) => {
            const _ = new e.Line3(j, U), R = new e.Vector3();
            return _.closestPointToPoint(z, !0, R), { dist: z.distanceTo(R), point: R, segment: [j, U] };
          }, L = g(o.point, V, b), O = g(o.point, b, y), q = g(o.point, y, V), P = [L, O, q].reduce((z, j) => j.dist < z.dist ? j : z);
          return {
            type: "edge",
            mode: "edge",
            objectId: c,
            point: [P.point.x, P.point.y, P.point.z],
            edge: [
              [P.segment[0].x, P.segment[0].y, P.segment[0].z],
              [P.segment[1].x, P.segment[1].y, P.segment[1].z]
            ]
          };
        }
        if (m === "face" && o.face) {
          const V = new e.Vector3(s.getX(o.face.a), s.getY(o.face.a), s.getZ(o.face.a)).applyMatrix4(C), b = new e.Vector3(s.getX(o.face.b), s.getY(o.face.b), s.getZ(o.face.b)).applyMatrix4(C), y = new e.Vector3(s.getX(o.face.c), s.getY(o.face.c), s.getZ(o.face.c)).applyMatrix4(C), g = new e.Vector3().add(V).add(b).add(y).divideScalar(3), L = o.face.normal.clone().transformDirection(C);
          return {
            type: "face",
            mode: "face",
            objectId: c,
            faceIndex: o.faceIndex,
            point: [g.x, g.y, g.z],
            normal: [L.x, L.y, L.z],
            vertices: [
              [V.x, V.y, V.z],
              [b.x, b.y, b.z],
              [y.x, y.y, y.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(x, M, a, i) {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, a) * 2 - 1, 1 - M / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
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
  const { THREE: e, FBXLoader: n, GLTFLoader: l, OBJLoader: v, PLYLoader: h, STLLoader: B, neutral: S, wire: F, checkerMaterial: G, objectMaterial: D, applyModelMaterial: k, disposeObject: A, textureFor: Z, cardMesh: $, generatePointField: Q, sampleCamera: K, sampleObjectTransform: ee, hasOutlineMesh: x, SelectionOutlineRenderer: M } = t;
  return {
    render(a, i, m, r, o, p = /* @__PURE__ */ new Map(), u = 0, c = !1, f = "camera", s = "subject", C = null, V = null) {
      const b = !c || (a.render_mode || "") === "beauty";
      if (b !== this.studioEnabled) {
        this.studioEnabled = b, Ee(e, this.scene, this.renderer, this.studio, b);
        for (const d of this.flatLights || []) d.visible = !b;
      }
      if (this.disposed) return;
      (this.canvas.width !== r || this.canvas.height !== o) && this.renderer.setSize(r, o, !1);
      const y = a.viewport_bg_sequence && a.viewport_bg_sequence.length ? a.viewport_bg_sequence[u % a.viewport_bg_sequence.length] : a.viewport_bg_image || "";
      if (y) {
        this.bgImageUrl = y;
        const d = this.bgTextureCache.get(y);
        if (d)
          this.bgTextureCache.delete(y), this.bgTextureCache.set(y, d), this.bgTexture = d, this.scene.background = d;
        else if (!this.bgTextureLoads.has(y)) {
          const w = this.bgLoadGeneration;
          this.bgTextureLoads.set(y, w), new e.TextureLoader().load(y, (N) => {
            if (this.bgTextureLoads.delete(y), this.disposed || w !== this.bgLoadGeneration) {
              N.dispose();
              return;
            }
            for (N.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(y, N); this.bgTextureCache.size > 8; ) {
              const I = [...this.bgTextureCache.keys()].find((J) => J !== this.bgImageUrl);
              if (!I) break;
              const W = this.bgTextureCache.get(I);
              this.bgTextureCache.delete(I), W?.dispose?.();
            }
            this.bgImageUrl === y && (this.bgTexture = N, this.scene.background = N), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(y);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const w of new Set(this.bgTextureCache.values())) w.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const d = a.viewport_bg_color && a.viewport_bg_color !== Ve;
        this.scene.background = this.studioEnabled && !d ? this.studio.sky : new e.Color(a.viewport_bg_color || Ve);
      }
      const g = JSON.stringify([
        a.render_mode,
        a.card_fit,
        a.point_density,
        a.point_spread,
        !!a.show_wireframe,
        !!a.show_vertices,
        a.objects.map((d) => {
          const { position: w, rotation: T, keyframes: N, size: I, ...W } = d;
          return d.type === "card" && (W.size = I), W;
        })
      ]), L = [...m.entries()].map(([d, w]) => `${d}:${w?.src || ""}`).join("|"), O = [...p.entries()].map(([d, w]) => `${d}:${w}`).join("|");
      (g !== this.sceneKey || L !== this.mediaSignature || O !== this.modelSignature) && (this.sceneKey = g, this.mediaSignature = L, this.modelSignature = O, this.rebuild(a, m, p));
      for (const d of this.models.values())
        d.mixer && d.duration > 0 && d.mixer.setTime(u / Math.max(1, a.fps || 24) % d.duration);
      for (const d of a.objects) {
        const w = this.objectNodes.get(d.id);
        if (!w) continue;
        const T = d.keyframes?.length ? ee(d, u) : d;
        w.position.fromArray(T.position || [0, 0, 0]), w.rotation.set(...(T.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), d.type !== "card" && d.type !== "null" && w.scale.fromArray(T.size || [1, 1, 1]), d.type === "null" && (w.visible = c ? !0 : a.show_helper_axes !== !1);
      }
      this.path.visible = !c;
      const q = a.show_grid !== !1 && a.render_mode !== "point_field";
      this.content.traverse((d) => {
        d.userData.omnicamCaptureGuide && (d.visible = c ? !!a.playblast_grid : q);
      });
      const P = a.view_mode || "camera", z = `${P}:${f}:${V ?? ""}:${a.__omnicamRevision ?? JSON.stringify([
        a.active_camera_id,
        (a.cameras || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((w) => [w.frame, w.camera?.position, w.camera?.target])]),
        (a.objects || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((w) => [w.frame, w.transform?.position])])
      ])}`;
      if (z !== this.pathKey && (this.pathKey = z, this.rebuildPath(a, f, V, P)), this.updateLiveCameras(a, u, c, P, f, V), this.liveCameras.visible = !c, !c) {
        const d = a.show_camera_paths !== !1, w = a.show_camera_gizmos !== !1, T = a.show_look_at !== !1;
        for (const N of [this.path, this.liveCameras])
          N.traverse((I) => {
            const W = I.userData.omnicamWidget;
            W === "path" ? I.visible = d : W === "gizmo" ? I.visible = w : W === "lookat" && (I.visible = T);
          });
      }
      if (c ? this.selectionGroup.visible = !1 : (this.updateSelection(a, f, s, C, `${a.__omnicamRevision ?? "legacy"}:${u}`), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const d = new e.Box3();
        this.content.traverse((T) => {
          if (!T.isMesh || T.userData.omnicamCaptureGuide) return;
          T.castShadow = !0, T.receiveShadow = !0, T.updateWorldMatrix(!0, !1);
          const N = new e.Box3().setFromObject(T);
          !N.isEmpty() && Number.isFinite(N.min.x) && d.union(N);
        });
        const w = this.studio?.key;
        if (w) {
          const T = d.isEmpty() ? new e.Vector3() : d.getCenter(new e.Vector3()), N = d.isEmpty() ? new e.Vector3(12, 12, 12) : d.getSize(new e.Vector3()), I = Math.max(1, 0.5 * Math.max(N.x, N.y, N.z) * Math.SQRT2), W = I * 1.15 + 0.5, J = new e.Vector3(4.5, 7.5, 3.5).normalize(), Y = Math.max(12, I * 4);
          w.position.copy(T).addScaledVector(J, Y), w.target.position.copy(T), w.target.updateMatrixWorld(!0);
          const X = w.shadow.camera;
          X.left = -W, X.right = W, X.top = W, X.bottom = -W, X.near = Math.max(0.1, Y - I - 1), X.far = Y + I + 1, X.updateProjectionMatrix(), w.shadow.map?.dispose(), w.shadow.map = null;
        }
      }
      this.content.visible = !0;
      const j = r / Math.max(1, o), U = this.configureCamera(i, j);
      this.activeCamera = U, this.path.traverse((d) => {
        d.userData.omnicamBillboard && d.quaternion.copy(U.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, r, o);
      const _ = performance.now();
      let R = !1;
      if (!c && f === "object" && s && !C) {
        const d = this.objectNodes.get(s);
        d && x(d) && (this.outlineRenderer || (this.outlineRenderer = new M(this.renderer, this.scene, void 0, U)), this.outlineRenderer.render(U, r, o, [d]), R = !0);
      }
      if (R || this.renderer.render(this.scene, U), !c && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Ge(this.studio?.quality);
        const d = dr(this.qualityMonitor, performance.now() - _);
        d && (Le(this.studio, this.renderer, d), this.onQualityDowngrade?.(d));
      }
    },
    setViewportQuality(a) {
      Le(this.studio, this.renderer, a), this.qualityMonitor = ur(this.qualityMonitor || Ge(a), a);
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
        for (const a of new Set(this.bgTextureCache.values())) a.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const a of this.models.values()) A(a.scene, !0);
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
    const { EffectComposer: h, RenderPass: B, OutlinePass: S, OutputPass: F, Vector2: G } = l;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new h(e), this.renderPass = new B(n, v), this.outlinePass = new S(new G(1, 1), n, v, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new F(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
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
  const [l, v] = t.size || [2, 3], h = new E(), B = new ae(new pe(l, v), new de({ color: 1448482, side: le, transparent: !0, opacity: 0.85 }));
  B.frustumCulled = !1, h.add(B);
  const S = tt(e);
  if (!S) return h;
  const F = e.videoWidth || e.naturalWidth || e.width || l, G = e.videoHeight || e.naturalHeight || e.height || v, D = F / Math.max(1, G), k = l / Math.max(0.01, v);
  let A = l, Z = v;
  n === "contain" ? D > k ? Z = l / D : A = v * D : n === "cover" && (D > k ? (S.repeat.x = k / D, S.offset.x = (1 - S.repeat.x) * 0.5) : (S.repeat.y = D / k, S.offset.y = (1 - S.repeat.y) * 0.5));
  const $ = new ae(
    new pe(A, Z),
    new de({
      color: 16777215,
      map: S,
      side: le,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return $.frustumCulled = !1, $.position.z = 2e-3, h.add($), h.frustumCulled = !1, h;
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
        let h, B = [];
        if (l === "obj") h = await new Ye().loadAsync(n);
        else if (l === "fbx")
          h = await new Qe().loadAsync(n), B = h.animations || [];
        else if (l === "stl") h = new ae(await new Ze().loadAsync(n), oe.clone());
        else if (l === "ply") {
          const i = await new Je().loadAsync(n);
          i.index ? (i.getAttribute("normal") || i.computeVertexNormals(), h = new ae(i, oe.clone())) : h = new We(i, new je({ color: 11449792, size: 0.025 }));
        } else {
          const i = await new He().loadAsync(n);
          h = i.scene, B = i.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== v) {
          Me(h, !0);
          return;
        }
        const S = this.models.get(e);
        S && Me(S.scene, !0), h.traverse((i) => {
          if (i.userData.omnicamModelResource = !0, i.frustumCulled = !1, i.isMesh && (i.frustumCulled = !1, i.material)) {
            const m = Array.isArray(i.material) ? i.material : [i.material];
            for (const r of m)
              r.side = le;
          }
          i.isPoints && (i.frustumCulled = !1), i.isSkinnedMesh && (i.frustumCulled = !1, i.computeBoundingBox?.(), i.computeBoundingSphere?.());
        });
        let F = 0, G = 0, D = 0, k = 0;
        h.traverse((i) => {
          i.isMesh && (F += 1, k += i.geometry?.getAttribute?.("position")?.count || 0), i.isPoints && (G += 1), i.isBone && (D += 1);
        });
        const A = new E();
        if (A.frustumCulled = !1, A.add(h), !F && !G && D) {
          const i = new Re(h);
          i.material.depthTest = !1, i.material.opacity = 0.9, i.material.transparent = !0, i.renderOrder = 10, i.userData.omnicamModelResource = !0, A.add(i);
        }
        A.updateMatrixWorld(!0);
        const Z = new Ae().setFromObject(A), $ = Z.getSize(new ge()), Q = Math.max($.x, $.y, $.z), K = Number.isFinite(Q) && Q > 1e-6 ? 2.5 / Q : 1, ee = Z.getCenter(new ge());
        A.scale.setScalar(K), A.position.set(-ee.x * K, -Z.min.y * K, -ee.z * K);
        const x = new E();
        x.frustumCulled = !1, x.add(A);
        const M = B.length ? new ke(h) : null;
        M && M.clipAction(B[0]).play();
        const a = { url: n, format: l, scene: x, mixer: M, clips: B, selectedClip: 0, duration: B[0]?.duration || 0, meshes: F, points: G, bones: D, vertices: k, animations: B.length, normalizationScale: K };
        this.models.set(e, a), this.onModelLoaded({ id: e, format: l, meshes: F, points: G, bones: D, vertices: k, animations: B.length, animationNames: B.map((i, m) => i.name || `Clip ${m + 1}`), duration: a.duration, normalizationScale: K }), this.sceneKey = "", this.invalidate();
      } catch (h) {
        this.modelLoads.get(e) === v && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${l.toUpperCase()} ${e}`, h);
        const B = h?.message?.includes("FBX version not supported") || h?.message?.includes("6100") || h?.message?.includes("6000"), S = B ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : h?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: l, error: S, isLegacyFBX: B });
      }
    }
  }
}
const ne = { THREE: we, FBXLoader: Qe, GLTFLoader: He, OBJLoader: Ye, PLYLoader: Je, STLLoader: Ze, neutral: oe, wire: ve, checkerMaterial: Ce, objectMaterial: gr, applyModelMaterial: wr, disposeObject: Me, textureFor: tt, cardMesh: yr, generatePointField: Wt, sampleCamera: jt, sampleObjectTransform: Nt, hasOutlineMesh: fr, SelectionOutlineRenderer: pr };
Object.assign(
  Mr.prototype,
  or(ne),
  sr(ne),
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
    new Promise((v, h) => {
      l = setTimeout(() => h(new Error(`${n} timed out`)), e);
    })
  ]).finally(() => clearTimeout(l));
}
async function Lr(t, e, n, l, v) {
  const h = await xr(t.width, t.height);
  if (!h) throw new Error("No supported WebCodecs WebM encoder");
  const B = new $t({ format: new Xt(), target: new Kt() }), S = new Yt(t, { codec: h, quality: new Qt("high"), keyFrameInterval: 1 });
  B.addVideoTrack(S, { frameRate: n }), await ie(B.start(), 1e4, "Starting deterministic encoder");
  try {
    const F = 1 / n;
    for (let G = 0; G < e; G++) {
      if (v?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await l(G), await ie(S.add(G * F, F, { keyFrame: G % n === 0 }), 1e4, `Encoding frame ${G + 1}`);
    }
    await ie(B.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (F) {
    throw B.state !== "finalized" && await B.cancel().catch(() => {
    }), F;
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
