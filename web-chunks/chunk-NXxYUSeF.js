import { G as J, D as ze, M as re, P as xe, a as Se, S as ut, b as ht, C as ft, c as pe, E as pt, A as gt, d as le, N as wt, e as je, f as yt, B as We, g as Mt, h as xt, i as bt, j as vt, k as Ct, l as Lt, m as Ne, n as de, F as St, o as Bt, H as Ie, L as Gt, p as Vt, q as Pt, r as _t, s as At, t as kt, u as Dt, v as me, O as Ue, w as $e, x as ue, y as Tt, z as Re, I as qe, Q as Ot, R as Ke, J as Xe, K as Ye, T as Ft, U as Ze, V as Qe, W as zt, X as jt, Y as Je, Z as Wt, _ as Nt, $ as Be, a0 as be, a1 as He, a2 as Ee, a3 as It, a4 as Ut, a5 as $t, a6 as Rt, a7 as et, a8 as tt, a9 as rt, aa as at, ab as st } from "./chunk-8mPWrQgW.js";
import { $ as qt, A as Kt, s as Xt, f as Yt } from "./chunk-DVQY0KQ6.js";
import { a as De, s as ot, D as Te, c as Zt, b as Qt } from "./chunk-Du9MCYKc.js";
import { O as Jt, B as Ht, W as Et, C as er, Q as tr, c as rr } from "./chunk-CcqF7PHi.js";
const ve = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ACESFilmicToneMapping: gt,
  AnimationMixer: je,
  AxesHelper: yt,
  Box3: We,
  Box3Helper: Mt,
  BoxGeometry: xt,
  BufferGeometry: bt,
  CanvasTexture: ft,
  CatmullRomCurve3: vt,
  Color: le,
  ConeGeometry: Ct,
  CylinderGeometry: Lt,
  DataTexture: Ne,
  DirectionalLight: ze,
  DoubleSide: de,
  EquirectangularReflectionMapping: pt,
  Float32BufferAttribute: St,
  GridHelper: Bt,
  Group: J,
  HemisphereLight: Ie,
  Line: Gt,
  Line3: Vt,
  LineBasicMaterial: Pt,
  LineDashedMaterial: _t,
  LineSegments: At,
  MathUtils: kt,
  Matrix4: Dt,
  Mesh: re,
  MeshBasicMaterial: me,
  MeshStandardMaterial: Se,
  NoToneMapping: wt,
  OrthographicCamera: Ue,
  PCFSoftShadowMap: $e,
  PMREMGenerator: ht,
  PerspectiveCamera: ue,
  Plane: Tt,
  PlaneGeometry: xe,
  Points: Re,
  PointsMaterial: qe,
  Quaternion: Ot,
  RGBAFormat: Ke,
  Raycaster: Xe,
  RepeatWrapping: Ye,
  RingGeometry: Ft,
  SRGBColorSpace: pe,
  Scene: Ze,
  ShadowMaterial: ut,
  SkeletonHelper: Qe,
  SkinnedMesh: zt,
  SphereGeometry: jt,
  Texture: Je,
  TextureLoader: Wt,
  TubeGeometry: Nt,
  Vector2: Be,
  Vector3: be,
  VideoTexture: He,
  WebGLRenderer: Ee,
  WireframeGeometry: It
}, Symbol.toStringTag, { value: "Module" }));
function ar(t, { position: e, forward: i, up: l, color: v, scale: f = 1, active: L = !0 }) {
  const C = new t.Group(), O = L ? 0.95 : 0.5, P = new t.MeshBasicMaterial({
    color: v,
    transparent: !0,
    opacity: O,
    depthTest: !1
  }), k = new t.Mesh(new t.BoxGeometry(0.34, 0.24, 0.42), P);
  k.renderOrder = 912, C.add(k);
  const V = new t.Mesh(new t.ConeGeometry(0.17, 0.26, 20), P);
  return V.rotation.x = -Math.PI / 2, V.position.z = -0.32, V.renderOrder = 912, C.add(V), C.scale.setScalar(f), C.position.copy(e), C.up.copy(l), C.lookAt(e.clone().add(i)), C;
}
function sr(t, { position: e, color: i = 15903035, radius: l = 0.28, bold: v = !1 }) {
  const f = new t.Group(), L = v ? 16773544 : i, C = new t.LineBasicMaterial({ color: L, transparent: !0, opacity: v ? 1 : 0.95, depthTest: !1 }), O = (V) => {
    const _ = [];
    for (let R = 0; R <= 48; R++) {
      const I = R / 48 * Math.PI * 2;
      _.push(new t.Vector3(Math.cos(I) * V, Math.sin(I) * V, 0));
    }
    const N = new t.Line(new t.BufferGeometry().setFromPoints(_), C);
    return N.renderOrder = 915, N;
  };
  if (f.add(O(l)), v) {
    f.add(O(l * 1.18));
    const V = new t.Mesh(
      new t.RingGeometry(0, l * 0.3, 16),
      new t.MeshBasicMaterial({ color: L, transparent: !0, opacity: 1, depthTest: !1 })
    );
    V.renderOrder = 916, f.add(V);
  }
  const P = l * 1.55, k = new t.LineSegments(
    new t.BufferGeometry().setFromPoints([
      new t.Vector3(-P, 0, 0),
      new t.Vector3(-l * 0.45, 0, 0),
      new t.Vector3(l * 0.45, 0, 0),
      new t.Vector3(P, 0, 0),
      new t.Vector3(0, -P, 0),
      new t.Vector3(0, -l * 0.45, 0),
      new t.Vector3(0, l * 0.45, 0),
      new t.Vector3(0, P, 0)
    ]),
    C
  );
  return k.renderOrder = 915, f.add(k), f.position.copy(e), f.userData.omnicamBillboard = !0, f;
}
const Ce = 3718648, or = 12e3;
function he(t) {
  return !!(t.isSkinnedMesh && t.skeleton);
}
function nt(t, e) {
  t.position.copy(e.position), t.quaternion.copy(e.quaternion), t.scale.copy(e.scale);
}
function fe(t) {
  return t.frustumCulled = !1, t.raycast = () => {
  }, t.userData.omnicamHelper = !0, t;
}
function nr(t, e) {
  if (he(e)) {
    const l = new t.SkinnedMesh(e.geometry.clone(), new t.MeshBasicMaterial({
      color: Ce,
      wireframe: !0,
      transparent: !0,
      opacity: 0.45,
      depthWrite: !1
    }));
    return l.bindMode = e.bindMode, l.bind(e.skeleton, e.bindMatrix), nt(l, e), { overlay: fe(l), parent: e.parent || e };
  }
  const i = new t.LineSegments(
    new t.WireframeGeometry(e.geometry),
    new t.LineBasicMaterial({ color: Ce, opacity: 0.45, transparent: !0 })
  );
  return { overlay: fe(i), parent: e };
}
function ir(t, e) {
  const i = new t.PointsMaterial({ color: Ce, size: 0.05, sizeAttenuation: !0 });
  if (!he(e)) {
    const V = new t.Points(e.geometry, i);
    return { overlay: fe(V), parent: e };
  }
  const l = e.geometry.getAttribute("position")?.count || 0, v = Math.max(1, Math.ceil(l / or)), f = Math.ceil(l / v), L = new Float32Array(f * 3), C = new t.BufferGeometry();
  C.setAttribute("position", new t.Float32BufferAttribute(L, 3));
  const O = new t.Points(C, i);
  nt(O, e);
  const P = new t.Vector3(), k = C.getAttribute("position");
  return O.onBeforeRender = () => {
    for (let V = 0; V < f; V++)
      e.getVertexPosition(V * v, P), k.setXYZ(V, P.x, P.y, P.z);
    k.needsUpdate = !0;
  }, { overlay: fe(O), parent: e.parent || e };
}
function cr(t, e, i) {
  const l = he(e) ? new t.SkinnedMesh(e.geometry.clone(), i) : new t.Mesh(e.geometry.clone(), i);
  return he(e) && (l.bindMode = e.bindMode, l.bind(e.skeleton, e.bindMatrix)), l.matrixAutoUpdate = !1, l.matrix.copy(e.matrixWorld), l.frustumCulled = !1, l;
}
function lr(t, e, { wireframe: i = !1, vertices: l = !1 } = {}) {
  if (!i && !l) return;
  const v = [];
  e.traverse((f) => {
    f.isMesh && f.geometry && !f.userData.omnicamHelper && v.push(f);
  });
  for (const f of v) {
    if (i) {
      const { overlay: L, parent: C } = nr(t, f);
      C.add(L);
    }
    if (l) {
      const { overlay: L, parent: C } = ir(t, f);
      C.add(L);
    }
  }
}
function dr(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: f, STLLoader: L, neutral: C, wire: O, checkerMaterial: P, objectMaterial: k, applyModelMaterial: V, disposeObject: _, textureFor: K, cardMesh: N, generatePointField: R, sampleCamera: I, sampleObjectTransform: H } = t;
  return {
    removeModel(h) {
      const M = this.models.get(h);
      M && _(M.scene, !0), this.models.delete(h), this.modelLoads.delete(h), this.sceneKey = "";
    },
    selectAnimation(h, M) {
      const a = this.models.get(h);
      !a?.mixer || !a.clips.length || (a.selectedClip = Math.max(0, Math.min(a.clips.length - 1, Number(M) || 0)), a.duration = a.clips[a.selectedClip].duration || 0, a.mixer.stopAllAction(), a.mixer.clipAction(a.clips[a.selectedClip]).play(), this.invalidate());
    },
    rebuild(h, M, a) {
      this.content.traverse((r) => {
        for (const s of [...r.children])
          s.userData.omnicamHelper && (r.remove(s), _(s, !0));
      }), _(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const n = h.render_mode, g = new e.GridHelper(120, 120, 7829367, 3881787);
      if (g.userData.omnicamCaptureGuide = !0, g.frustumCulled = !1, this.content.add(g), ["omni_ref", "point_field"].includes(n)) {
        const { points: r, colors: s } = R(h.point_density || "balanced", h.point_spread || "all_views", h.point_color || null);
        if (r.length > 0) {
          const p = new e.BufferGeometry();
          p.setAttribute("position", new e.Float32BufferAttribute(r, 3)), p.setAttribute("color", new e.Float32BufferAttribute(s, 3));
          const o = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), c = new e.Points(p, o);
          c.frustumCulled = !1, this.content.add(c);
        }
      }
      if (!["grid", "point_field"].includes(n))
        for (const r of h.objects) {
          if (r.enabled === !1) continue;
          const s = r.size || [1, 1, 1];
          let p;
          if (r.type === "glb" || r.type === "model") {
            const o = a.get(r.id), c = this.models.get(r.id), u = r.format || (r.type === "glb" ? "glb" : "");
            o && (c?.url !== o || c?.format !== u) && this.loadModel(r.id, o, u), c?.url === o ? (p = c.scene, V(p, r.material_mode || "textured")) : p = new e.Mesh(new e.BoxGeometry(s[0], s[1], s[2] || 1), O.clone());
          } else if (r.type === "sphere") p = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), k(r, n));
          else if (r.type === "ground") p = new e.Mesh(new e.BoxGeometry(1, 1, 1), k(r, n));
          else if (r.type === "card")
            p = r.material_mode && r.material_mode !== "textured" ? new e.Mesh(new e.PlaneGeometry(s[0], s[1]), k(r, n)) : N(r, M.get(r.id), h.card_fit || "contain");
          else if (r.type === "null") {
            const o = new e.AxesHelper(0.5);
            o.position.fromArray(r.position || [0, 0, 0]), o.userData.omnicamId = r.id, o.frustumCulled = !1, this.objectNodes.set(r.id, o), this.content.add(o);
            continue;
          } else
            p = new e.Mesh(new e.BoxGeometry(1, 1, 1), k(r, n));
          p.position.fromArray(r.position || [0, 0, 0]), p.rotation.set(...(r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), r.type !== "card" && p.scale.fromArray(s), p.userData.omnicamId = r.id, p.frustumCulled = !1, p.traverse((o) => {
            o.frustumCulled = !1, o.userData.omnicamId = r.id;
          }), lr(e, p, { wireframe: h.show_wireframe, vertices: h.show_vertices }), this.objectNodes.set(r.id, p), this.content.add(p);
        }
    },
    rebuildPath(h, M = "camera", a = null) {
      _(this.path), this.path.clear();
      const n = [
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
      (h.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: h.keyframes || [] }]).forEach((s, p) => {
        const o = s.keyframes || [];
        if (o.length === 0) return;
        const c = s.color ? { line: new e.Color(s.color), marker: new e.Color(s.color), frustum: new e.Color(s.color) } : n[p % n.length], u = s.id === h.active_camera_id, m = u && M === "camera";
        if (o.length >= 2) {
          const b = o[0].frame, x = o[o.length - 1].frame, y = Math.max(32, Math.min(256, x - b + 1)), w = { ...s, keyframes: o, objects: h.objects }, S = Array.from({ length: y }, (T, j) => {
            const U = b + (x - b) * j / Math.max(1, y - 1);
            return new e.Vector3().fromArray(I(w, U, h.objects).position);
          }), B = new e.CatmullRomCurve3(S, !1, "centripetal"), G = m ? 0.06 : u ? 0.045 : 0.025, F = new e.MeshBasicMaterial({
            color: c.line,
            transparent: !0,
            opacity: u ? 1 : 0.55,
            depthTest: !1
          }), A = new e.Mesh(new e.TubeGeometry(B, Math.max(48, y), G, 8, !1), F);
          if (A.renderOrder = 900, A.userData.omnicamWidget = "path", this.path.add(A), u) {
            const T = new e.Mesh(
              new e.TubeGeometry(B, Math.max(48, y), G * (m ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: c.line, transparent: !0, opacity: m ? 0.3 : 0.18, depthTest: !1 })
            );
            T.renderOrder = 899, T.userData.omnicamWidget = "path", this.path.add(T);
          }
        }
        for (const b of o) {
          const x = new e.Mesh(
            new e.SphereGeometry(u ? 0.13 : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: c.marker, depthTest: !1 })
          );
          x.position.fromArray(b.camera.position), x.renderOrder = 910, x.userData.omnicamPathKey = { cameraId: s.id, frame: b.frame }, x.userData.omnicamWidget = "path", this.path.add(x);
          const y = new e.Vector3().fromArray(b.camera.position), w = new e.Vector3().fromArray(b.camera.target || [0, 0, 0]), S = u && a != null && b.frame === a;
          if (S) {
            const B = w.clone().sub(y).normalize();
            let G = new e.Vector3().crossVectors(B, new e.Vector3(0, 1, 0));
            G.lengthSq() < 1e-8 ? G.set(1, 0, 0) : G.normalize();
            const F = new e.Vector3().crossVectors(G, B).normalize(), A = e.MathUtils.clamp(y.distanceTo(w) * 0.08, 0.25, 0.8), T = b.camera.camera_type === "orthographic" ? A * 0.55 : A * Math.tan(e.MathUtils.degToRad(b.camera.fov || 35) * 0.5), j = T * (h.width || 16) / Math.max(1, h.height || 9), U = y.clone().addScaledVector(B, A), X = [
              U.clone().addScaledVector(G, -j).addScaledVector(F, -T),
              U.clone().addScaledVector(G, j).addScaledVector(F, -T),
              U.clone().addScaledVector(G, j).addScaledVector(F, T),
              U.clone().addScaledVector(G, -j).addScaledVector(F, T)
            ], d = [];
            for (const z of X) d.push(y, z);
            for (let z = 0; z < 4; z++) d.push(X[z], X[(z + 1) % 4]);
            const D = new e.BufferGeometry().setFromPoints(d), q = new e.LineSegments(D, new e.LineBasicMaterial({
              color: c.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            q.userData.omnicamWidget = "gizmo", this.path.add(q);
            const $ = ar(e, {
              position: y,
              forward: B,
              up: F,
              color: c.marker,
              scale: e.MathUtils.clamp(A * 1.15, 0.35, 1.6),
              active: u
            });
            $.userData.omnicamWidget = "gizmo", this.path.add($);
          }
          if (S) {
            const B = sr(e, {
              position: w,
              radius: e.MathUtils.clamp(y.distanceTo(w) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            B.userData.omnicamWidget = "lookat", this.path.add(B);
            const G = new e.Line(
              new e.BufferGeometry().setFromPoints([y.clone(), w.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            G.renderOrder = 914, G.userData.omnicamWidget = "lookat", this.path.add(G);
          }
        }
      });
      const r = [16742005, 52937, 16632686, 7101671, 14774357];
      (h.objects || []).forEach((s, p) => {
        const o = s.keyframes || [];
        if (o.length < 2) return;
        const c = s.color ? new e.Color(s.color) : r[p % r.length], u = o.map((x) => new e.Vector3().fromArray(x.transform?.position || [0, 0, 0])), m = new e.CatmullRomCurve3(u, !1, "centripetal"), b = new e.Mesh(
          new e.TubeGeometry(m, Math.max(32, o.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: c, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        b.renderOrder = 900, b.userData.omnicamWidget = "path", this.path.add(b);
        for (const x of o) {
          const y = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: c, depthTest: !1 })
          );
          y.position.fromArray(x.transform?.position || [0, 0, 0]), y.renderOrder = 910, y.userData.omnicamWidget = "path", this.path.add(y);
        }
      });
    }
  };
}
function mr(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: f, STLLoader: L, neutral: C, wire: O, checkerMaterial: P, objectMaterial: k, applyModelMaterial: V, disposeObject: _, textureFor: K, cardMesh: N, generatePointField: R, sampleCamera: I, sampleObjectTransform: H } = t;
  return {
    updateLiveCameras(h, M, a, n, g = "camera", r = null) {
      if (_(this.liveCameras), this.liveCameras.clear(), a) return;
      const s = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (h.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: h.keyframes || [] }]).forEach((o, c) => {
        const u = o.color ? { line: new e.Color(o.color), marker: new e.Color(o.color), frustum: new e.Color(o.color), body: new e.Color(o.color).multiplyScalar(0.35) } : s[c % s.length], m = o.id === h.active_camera_id, b = m && g === "camera";
        if (n === "camera" && m) return;
        const x = I(o, M, h.objects), y = new e.Vector3().fromArray(x.position || [0, 0, 0]), w = new e.Vector3().fromArray(x.target || [0, 0, 0]), S = w.clone().sub(y), B = S.length();
        B < 1e-4 ? S.set(0, 0, -1) : S.normalize();
        let G = new e.Vector3(0, 1, 0), F = new e.Vector3().crossVectors(S, G);
        F.lengthSq() < 1e-6 && (G = new e.Vector3(0, 0, 1), F = new e.Vector3().crossVectors(S, G)), F.normalize();
        let A = new e.Vector3().crossVectors(F, S).normalize();
        if (x.roll) {
          const W = e.MathUtils.degToRad(x.roll);
          F.applyAxisAngle(S, W), A.applyAxisAngle(S, W);
        }
        const T = new e.Group(), j = new e.Mesh(
          new e.BoxGeometry(0.18, 0.12, 0.22),
          new e.MeshStandardMaterial({ color: u.body, roughness: 0.4, metalness: 0.8 })
        );
        j.position.set(0, 0, -0.11), T.add(j);
        const U = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
        U.rotateX(Math.PI / 2);
        const X = new e.Mesh(
          U,
          new e.MeshStandardMaterial({ color: u.marker, roughness: 0.2, metalness: 0.9 })
        );
        X.position.set(0, 0, 0.05), T.add(X);
        const d = new e.Mesh(
          new e.BoxGeometry(0.04, 0.03, 0.08),
          new e.MeshBasicMaterial({ color: m ? 16729156 : u.marker })
        );
        d.position.set(0, 0.07, -0.08), T.add(d);
        const D = new e.Matrix4().makeBasis(F, A, S.clone().negate());
        T.quaternion.setFromRotationMatrix(D), T.position.copy(y), T.userData.omnicamWidget = "gizmo", this.liveCameras.add(T);
        const q = new e.SphereGeometry(0.35, 8, 6), $ = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 }), z = new e.Mesh(q, $);
        z.position.copy(y), z.userData = { omnicamType: "camera", omnicamId: o.id }, this.liveCameras.add(z);
        const Y = e.MathUtils.clamp(B * 0.25, 0.5, 2.5), Q = x.camera_type === "orthographic" ? 5 / Math.max(0.01, x.zoom || 1) * 0.35 : Y * Math.tan(e.MathUtils.degToRad(x.fov || 35) * 0.5), se = Q * (h.width || 16) / Math.max(1, h.height || 9), oe = y.clone().addScaledVector(S, Y), E = [
          oe.clone().addScaledVector(F, -se).addScaledVector(A, -Q),
          oe.clone().addScaledVector(F, se).addScaledVector(A, -Q),
          oe.clone().addScaledVector(F, se).addScaledVector(A, Q),
          oe.clone().addScaledVector(F, -se).addScaledVector(A, Q)
        ], ne = [];
        for (const W of E) ne.push(y, W);
        for (let W = 0; W < 4; W++) ne.push(E[W], E[(W + 1) % 4]);
        const Pe = E[2].clone().add(E[3]).multiplyScalar(0.5).clone().addScaledVector(A, Q * 0.25);
        ne.push(E[2], Pe, Pe, E[3]);
        const ct = new e.BufferGeometry().setFromPoints(ne), _e = new e.LineSegments(ct, new e.LineBasicMaterial({
          color: b ? u.marker : u.frustum,
          linewidth: m ? 2 : 1,
          transparent: !0,
          opacity: m ? 1 : 0.6
        }));
        if (_e.userData.omnicamWidget = "gizmo", this.liveCameras.add(_e), B > 0.01) {
          const W = m && g === "camera_target", ge = new e.BufferGeometry().setFromPoints([y, w]), ee = new e.Line(ge, new e.LineDashedMaterial({
            color: b || W ? 3718648 : u.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: b || W ? 1 : m ? 0.75 : 0.4
          }));
          ee.userData.omnicamWidget = "lookat", this.liveCameras.add(ee);
          const Z = W ? 0.12 : b ? 0.11 : 0.08, te = [
            w.clone().add(new e.Vector3(-Z, 0, 0)),
            w.clone().add(new e.Vector3(Z, 0, 0)),
            w.clone().add(new e.Vector3(0, -Z, 0)),
            w.clone().add(new e.Vector3(0, Z, 0)),
            w.clone().add(new e.Vector3(0, 0, -Z)),
            w.clone().add(new e.Vector3(0, 0, Z))
          ], lt = new e.BufferGeometry().setFromPoints(te), Ae = new e.LineSegments(lt, new e.LineBasicMaterial({
            color: W || b ? 3718648 : u.marker,
            linewidth: W ? 3 : 1,
            transparent: !0,
            opacity: W || b ? 1 : m ? 0.9 : 0.5
          }));
          Ae.userData.omnicamWidget = "lookat", this.liveCameras.add(Ae);
          const dt = new e.SphereGeometry(0.28, 8, 6), we = new e.Mesh(dt, $);
          if (we.position.copy(w), we.userData = { omnicamType: "camera_target", omnicamId: o.id }, this.liveCameras.add(we), (W || b) && n !== "camera") {
            const ke = new e.RingGeometry(0.14, 0.18, 24);
            ke.rotateX(Math.PI / 2);
            const mt = new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), ye = new e.Mesh(ke, mt);
            ye.position.copy(w), ye.userData.omnicamWidget = "lookat", this.liveCameras.add(ye);
          }
        }
        if (m && n !== "camera" && g === "camera") {
          const W = new e.RingGeometry(0.19, 0.24, 32);
          W.rotateX(Math.PI / 2);
          const ge = new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 1 }), ee = new e.Mesh(W, ge);
          ee.position.copy(y), ee.userData.omnicamWidget = "gizmo", this.liveCameras.add(ee);
          const Z = new e.RingGeometry(0.28, 0.31, 32);
          Z.rotateX(Math.PI / 2);
          const te = new e.Mesh(Z, new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          te.position.copy(y), te.userData.omnicamWidget = "gizmo", this.liveCameras.add(te);
        }
      });
    },
    updateSelection(h, M, a, n = null, g = "") {
      const r = n ? `${n.mode || ""}:${n.objectId || ""}:${(n.point || []).join(",")}` : "", s = `${M}:${a || ""}:${(h.__selectedObjectIds || []).join(",")}:${g}:${r}`;
      if (s !== this.selectionKey) {
        if (this.selectionKey = s, _(this.selectionGroup), this.selectionGroup.clear(), M === "object" && a) {
          const p = this.objectNodes.get(a);
          if (p) {
            p.updateMatrixWorld(!0);
            try {
              const o = new e.Box3();
              if (p.userData.omnicamHasBones) {
                const c = new e.Vector3(), u = [];
                p.traverse((m) => {
                  m.isBone && u.push(m);
                });
                for (const m of u)
                  m.getWorldPosition(c), o.expandByPoint(c);
                o.expandByScalar(0.2);
              } else
                o.setFromObject(p);
              if (!o.isEmpty() && Number.isFinite(o.min.x) && Number.isFinite(o.max.x) && Number.isFinite(o.min.y) && Number.isFinite(o.max.y) && Number.isFinite(o.min.z) && Number.isFinite(o.max.z) && (o.expandByScalar(0.04), !hasOutlineMesh(p))) {
                const c = new e.Box3Helper(o, new e.Color(9133302));
                c.material.transparent = !0, c.material.opacity = 0.65, c.material.depthTest = !1, c.renderOrder = 9999, this.selectionGroup.add(c);
              }
            } catch {
            }
            if (h.show_wireframe) {
              let o = 0;
              p.traverse((c) => {
                if (!c.isMesh || !c.geometry || c.userData.omnicamHelper || o >= 64) return;
                const u = cr(e, c, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.15,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                u.renderOrder = 9998, this.selectionGroup.add(u), o += 1;
              });
            }
            if (n && n.objectId === a && n.point) {
              if (n.mode === "vertex") {
                const o = new e.SphereGeometry(0.08, 16, 12), c = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), u = new e.Mesh(o, c);
                u.position.fromArray(n.point), u.renderOrder = 1e4, this.selectionGroup.add(u);
                const m = new e.RingGeometry(0.1, 0.15, 24), b = new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, depthTest: !1 }), x = new e.Mesh(m, b);
                x.position.fromArray(n.point), this.activeCamera && x.quaternion.copy(this.activeCamera.quaternion), x.renderOrder = 1e4, this.selectionGroup.add(x);
              } else if (n.mode === "edge" && n.edge) {
                const [o, c] = n.edge, u = new e.BufferGeometry().setFromPoints([new e.Vector3(...o), new e.Vector3(...c)]), m = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), b = new e.Line(u, m);
                b.renderOrder = 1e4, this.selectionGroup.add(b);
              } else if (n.mode === "face" && n.vertices) {
                const [o, c, u] = n.vertices, m = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...o),
                  new e.Vector3(...c),
                  new e.Vector3(...u)
                ]);
                m.setIndex([0, 1, 2]), m.computeVertexNormals();
                const b = new e.MeshBasicMaterial({
                  color: 3718648,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), x = new e.Mesh(m, b);
                x.renderOrder = 1e4, this.selectionGroup.add(x);
                const y = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...o),
                  new e.Vector3(...c),
                  new e.Vector3(...u),
                  new e.Vector3(...o)
                ]), w = new e.Line(y, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                w.renderOrder = 10001, this.selectionGroup.add(w);
              }
            }
          }
        }
        if (M === "object")
          for (const p of h.__selectedObjectIds || []) {
            if (p === a) continue;
            const o = this.objectNodes.get(p);
            if (o) {
              o.updateMatrixWorld(!0);
              try {
                const c = new e.Box3().setFromObject(o);
                if (!c.isEmpty() && Number.isFinite(c.min.x)) {
                  c.expandByScalar(0.04);
                  const u = new e.Box3Helper(c, new e.Color(10980346));
                  u.material.transparent = !0, u.material.opacity = 0.35, u.material.depthTest = !1, u.renderOrder = 9997, this.selectionGroup.add(u);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(h) {
      const M = this.objectNodes.get(h);
      if (!M) return [];
      const a = [], n = /* @__PURE__ */ new Set();
      return M.traverse((g) => {
        const r = g.isBone ? g.name : "";
        !r || n.has(r) || a.length >= 256 || (n.add(r), a.push(r));
      }), a;
    },
    /**
     * World position of `boneName` (or the model's animated centre when no bone
     * is named) at an arbitrary frame.
     *
     * The mixer is the only thing that knows where a bone sits at a given time,
     * so the model is posed at `frame`, probed, then posed back: a probe for a
     * frame other than the playhead must not leave the viewport showing it.
     */
    sampleModelPoint(h, M, a, n = 24) {
      const g = this.objectNodes.get(h);
      if (!g) return null;
      const r = this.models.get(h), s = r?.mixer && r.duration > 0, p = s ? r.mixer.time : null;
      s && (r.mixer.setTime(Math.max(0, a) / Math.max(1, n) % r.duration), g.updateMatrixWorld(!0));
      let o = null;
      if (M) {
        let c = null;
        if (g.traverse((u) => {
          !c && u.isBone && u.name === M && (c = u);
        }), c) {
          const u = new e.Vector3().setFromMatrixPosition(c.matrixWorld);
          o = [u.x, u.y, u.z];
        }
      } else
        o = this.getObjectWorldCenter(h);
      return s && Number.isFinite(p) && (r.mixer.setTime(p), g.updateMatrixWorld(!0)), o;
    },
    getObjectWorldCenter(h) {
      const M = this.objectNodes.get(h);
      if (!M) return null;
      M.updateMatrixWorld(!0);
      const a = [];
      if (M.traverse((r) => {
        r.isBone && a.push(r);
      }), a.length > 0) {
        const r = new e.Vector3(), s = new e.Vector3();
        for (const p of a)
          p.getWorldPosition(s), r.add(s);
        return r.divideScalar(a.length), [r.x, r.y, r.z];
      }
      const n = new e.Box3().setFromObject(M);
      if (!n.isEmpty() && Number.isFinite(n.min.x)) {
        const r = n.getCenter(new e.Vector3());
        return [r.x, r.y, r.z];
      }
      const g = new e.Vector3();
      return M.getWorldPosition(g), [g.x, g.y, g.z];
    }
  };
}
function ur(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: f, STLLoader: L, neutral: C, wire: O, checkerMaterial: P, objectMaterial: k, applyModelMaterial: V, disposeObject: _, textureFor: K, cardMesh: N, generatePointField: R, sampleCamera: I, sampleObjectTransform: H } = t;
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(h) {
      if (!this.path.visible || !this.activeCamera) return null;
      this.pointer.set(h[0] / this.canvas.width * 2 - 1, -(h[1] / this.canvas.height) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const M of this.raycaster.intersectObjects(this.path.children, !0)) {
        const a = qt(M);
        if (a) return { ...a, position: M.object.position.toArray() };
      }
      return null;
    },
    configureCamera(h, M) {
      const a = h || defaultCamera(), n = Math.max(5e-3, Number(a.near) || 0.01), g = Math.max(n + 1, Number(a.far) || 1e4);
      let r;
      if (a.camera_type === "orthographic") {
        r = this.orthographic;
        const m = 5 / Math.max(0.01, a.zoom || 1);
        r.left = -m * M, r.right = m * M, r.top = m, r.bottom = -m, r.near = n, r.far = g, r.updateProjectionMatrix();
      } else
        r = this.perspective, r.fov = e.MathUtils.clamp(Number(a.fov) || 35, 1, 175), r.aspect = M, r.near = n, r.far = g, r.updateProjectionMatrix();
      const s = new e.Vector3().fromArray(a.position || [6, 4, 6]), p = new e.Vector3().fromArray(a.target || [0, 1.5, 0]), o = p.clone().sub(s);
      o.lengthSq() < 1e-6 ? o.set(0, 0, -1) : o.normalize();
      let c = a.up ? new e.Vector3().fromArray(a.up) : new e.Vector3(0, 1, 0), u = new e.Vector3().crossVectors(o, c);
      if (u.lengthSq() < 1e-6 && (c = Math.abs(o.y) > 0.9 ? new e.Vector3(0, 0, o.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), u.crossVectors(o, c)), u.normalize(), c.crossVectors(u, o).normalize(), a.roll) {
        const m = e.MathUtils.degToRad(a.roll);
        u.applyAxisAngle(o, m), c.applyAxisAngle(o, m);
      }
      return r.position.copy(s), r.up.copy(c), r.lookAt(p), r.updateMatrixWorld(), r;
    },
    pick(h, M, a, n) {
      if (!this.activeCamera) return null;
      this.pointer.set(h / Math.max(1, a) * 2 - 1, 1 - M / Math.max(1, n) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const g = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const r of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          r.object?.userData?.omnicamType && g.push({
            distance: r.distance,
            type: r.object.userData.omnicamType,
            id: r.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const r of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (r.object?.userData?.omnicamCaptureGuide || r.object?.userData?.omnicamHelper) continue;
          let s = r.object;
          for (; s && !s.userData?.omnicamId; ) s = s.parent;
          s?.userData?.omnicamId && g.push({
            distance: r.distance,
            type: "object",
            id: s.userData.omnicamId
          });
        }
      return g.length ? (g.sort((r, s) => r.distance - s.distance), { type: g[0].type, id: g[0].id }) : null;
    },
    pickSubElement(h, M, a, n, g = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(h / Math.max(1, a) * 2 - 1, 1 - M / Math.max(1, n) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const r = this.raycaster.intersectObjects(this.content.children, !0);
      for (const s of r) {
        let p = s.object, o = s.object;
        for (; p && !p.userData.omnicamId; ) p = p.parent;
        if (!p?.userData.omnicamId || !o.geometry) continue;
        const c = p.userData.omnicamId, m = o.geometry.getAttribute("position");
        if (!m) continue;
        o.updateMatrixWorld(!0);
        const b = o.matrixWorld;
        if (g === "vertex") {
          let x = -1, y = 1 / 0, w = null;
          if (s.face) {
            const S = [s.face.a, s.face.b, s.face.c];
            for (const B of S) {
              const G = new e.Vector3(m.getX(B), m.getY(B), m.getZ(B)).applyMatrix4(b), F = G.distanceTo(s.point);
              F < y && (y = F, x = B, w = [G.x, G.y, G.z]);
            }
          } else
            for (let S = 0; S < m.count; S++) {
              const B = new e.Vector3(m.getX(S), m.getY(S), m.getZ(S)).applyMatrix4(b), G = B.distanceTo(s.point);
              G < y && (y = G, x = S, w = [B.x, B.y, B.z]);
            }
          if (w)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: c,
              index: x,
              point: w
            };
        }
        if (g === "edge" && s.face) {
          const x = new e.Vector3(m.getX(s.face.a), m.getY(s.face.a), m.getZ(s.face.a)).applyMatrix4(b), y = new e.Vector3(m.getX(s.face.b), m.getY(s.face.b), m.getZ(s.face.b)).applyMatrix4(b), w = new e.Vector3(m.getX(s.face.c), m.getY(s.face.c), m.getZ(s.face.c)).applyMatrix4(b), S = (T, j, U) => {
            const X = new e.Line3(j, U), d = new e.Vector3();
            return X.closestPointToPoint(T, !0, d), { dist: T.distanceTo(d), point: d, segment: [j, U] };
          }, B = S(s.point, x, y), G = S(s.point, y, w), F = S(s.point, w, x), A = [B, G, F].reduce((T, j) => j.dist < T.dist ? j : T);
          return {
            type: "edge",
            mode: "edge",
            objectId: c,
            point: [A.point.x, A.point.y, A.point.z],
            edge: [
              [A.segment[0].x, A.segment[0].y, A.segment[0].z],
              [A.segment[1].x, A.segment[1].y, A.segment[1].z]
            ]
          };
        }
        if (g === "face" && s.face) {
          const x = new e.Vector3(m.getX(s.face.a), m.getY(s.face.a), m.getZ(s.face.a)).applyMatrix4(b), y = new e.Vector3(m.getX(s.face.b), m.getY(s.face.b), m.getZ(s.face.b)).applyMatrix4(b), w = new e.Vector3(m.getX(s.face.c), m.getY(s.face.c), m.getZ(s.face.c)).applyMatrix4(b), S = new e.Vector3().add(x).add(y).add(w).divideScalar(3), B = s.face.normal.clone().transformDirection(b);
          return {
            type: "face",
            mode: "face",
            objectId: c,
            faceIndex: s.faceIndex,
            point: [S.x, S.y, S.z],
            normal: [B.x, B.y, B.z],
            vertices: [
              [x.x, x.y, x.z],
              [y.x, y.y, y.z],
              [w.x, w.y, w.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(h, M, a, n) {
      if (!this.activeCamera) return null;
      this.pointer.set(h / Math.max(1, a) * 2 - 1, 1 - M / Math.max(1, n) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const g = this.raycaster.intersectObjects(this.content.children, !0);
      if (g.length > 0)
        return [g[0].point.x, g[0].point.y, g[0].point.z];
      const r = new e.Plane(new e.Vector3(0, 1, 0), 0), s = new e.Vector3();
      return this.raycaster.ray.intersectPlane(r, s) ? [s.x, s.y, s.z] : null;
    }
  };
}
const Me = ["high", "balanced", "low"], hr = 25, Oe = 30, fr = 0.6;
function Fe(t = "balanced") {
  return { quality: t, samples: [], downgraded: !1 };
}
function pr(t) {
  const e = Me.indexOf(t);
  return e < 0 || e >= Me.length - 1 ? null : Me[e + 1];
}
function gr(t, e) {
  if (!Number.isFinite(e) || e < 0 || (t.samples.push(e), t.samples.length > Oe && t.samples.shift(), t.samples.length < Oe) || t.samples.filter((v) => v > hr).length / t.samples.length < fr) return null;
  const l = pr(t.quality);
  return l ? (t.quality = l, t.downgraded = !0, t.samples = [], l) : null;
}
function wr(t, e) {
  return t.quality = e, t.samples = [], t.downgraded = !1, t;
}
function yr(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: f, STLLoader: L, neutral: C, wire: O, checkerMaterial: P, objectMaterial: k, applyModelMaterial: V, disposeObject: _, textureFor: K, cardMesh: N, generatePointField: R, sampleCamera: I, sampleObjectTransform: H, hasOutlineMesh: h, SelectionOutlineRenderer: M } = t;
  return {
    render(a, n, g, r, s, p = /* @__PURE__ */ new Map(), o = 0, c = !1, u = "camera", m = "subject", b = null, x = null) {
      const y = !c || (a.render_mode || "") === "beauty";
      if (y !== this.studioEnabled) {
        this.studioEnabled = y, ot(e, this.scene, this.renderer, this.studio, y);
        for (const d of this.flatLights || []) d.visible = !y;
      }
      if (this.disposed) return;
      (this.canvas.width !== r || this.canvas.height !== s) && this.renderer.setSize(r, s, !1);
      const w = a.viewport_bg_sequence && a.viewport_bg_sequence.length ? a.viewport_bg_sequence[o % a.viewport_bg_sequence.length] : a.viewport_bg_image || "";
      if (w) {
        this.bgImageUrl = w;
        const d = this.bgTextureCache.get(w);
        if (d)
          this.bgTextureCache.delete(w), this.bgTextureCache.set(w, d), this.bgTexture = d, this.scene.background = d;
        else if (!this.bgTextureLoads.has(w)) {
          const D = this.bgLoadGeneration;
          this.bgTextureLoads.set(w, D), new e.TextureLoader().load(w, ($) => {
            if (this.bgTextureLoads.delete(w), this.disposed || D !== this.bgLoadGeneration) {
              $.dispose();
              return;
            }
            for ($.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(w, $); this.bgTextureCache.size > 8; ) {
              const z = [...this.bgTextureCache.keys()].find((Q) => Q !== this.bgImageUrl);
              if (!z) break;
              const Y = this.bgTextureCache.get(z);
              this.bgTextureCache.delete(z), Y?.dispose?.();
            }
            this.bgImageUrl === w && (this.bgTexture = $, this.scene.background = $), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(w);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const D of new Set(this.bgTextureCache.values())) D.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const d = a.viewport_bg_color && a.viewport_bg_color !== Te;
        this.scene.background = this.studioEnabled && !d ? this.studio.sky : new e.Color(a.viewport_bg_color || Te);
      }
      const S = JSON.stringify([
        a.render_mode,
        a.card_fit,
        a.point_density,
        a.point_spread,
        !!a.show_wireframe,
        !!a.show_vertices,
        a.objects.map((d) => {
          const { position: D, rotation: q, keyframes: $, size: z, ...Y } = d;
          return d.type === "card" && (Y.size = z), Y;
        })
      ]), B = [...g.entries()].map(([d, D]) => `${d}:${D?.src || ""}`).join("|"), G = [...p.entries()].map(([d, D]) => `${d}:${D}`).join("|");
      (S !== this.sceneKey || B !== this.mediaSignature || G !== this.modelSignature) && (this.sceneKey = S, this.mediaSignature = B, this.modelSignature = G, this.rebuild(a, g, p));
      for (const d of this.models.values())
        d.mixer && d.duration > 0 && d.mixer.setTime(o / Math.max(1, a.fps || 24) % d.duration);
      for (const d of a.objects) {
        const D = this.objectNodes.get(d.id);
        if (!D) continue;
        const q = d.keyframes?.length ? H(d, o) : d;
        D.position.fromArray(q.position || [0, 0, 0]), D.rotation.set(...(q.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), d.type !== "card" && d.type !== "null" && D.scale.fromArray(q.size || [1, 1, 1]), d.type === "null" && (D.visible = c ? !0 : a.show_helper_axes !== !1);
      }
      this.path.visible = !c;
      const F = a.show_grid !== !1 && a.render_mode !== "point_field";
      this.content.traverse((d) => {
        d.userData.omnicamCaptureGuide && (d.visible = c ? !!a.playblast_grid : F);
      });
      const A = `${u}:${x ?? ""}:${a.__omnicamRevision ?? JSON.stringify([
        a.active_camera_id,
        (a.cameras || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((D) => [D.frame, D.camera?.position, D.camera?.target])]),
        (a.objects || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((D) => [D.frame, D.transform?.position])])
      ])}`;
      if (A !== this.pathKey && (this.pathKey = A, this.rebuildPath(a, u, x)), this.updateLiveCameras(a, o, c, a.view_mode || "camera", u, x), this.liveCameras.visible = !c, !c) {
        const d = a.show_camera_paths !== !1, D = a.show_camera_gizmos !== !1, q = a.show_look_at !== !1;
        for (const $ of [this.path, this.liveCameras])
          $.traverse((z) => {
            const Y = z.userData.omnicamWidget;
            Y === "path" ? z.visible = d : Y === "gizmo" ? z.visible = D : Y === "lookat" && (z.visible = q);
          });
      }
      c ? this.selectionGroup.visible = !1 : (this.updateSelection(a, u, m, b, `${a.__omnicamRevision ?? "legacy"}:${o}`), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey && (this.contentShadowKey = this.sceneKey, this.content.traverse((d) => {
        !d.isMesh || d.userData.omnicamCaptureGuide || (d.castShadow = !0, d.receiveShadow = !0);
      })), this.content.visible = !0;
      const T = r / Math.max(1, s), j = this.configureCamera(n, T);
      this.activeCamera = j, this.path.traverse((d) => {
        d.userData.omnicamBillboard && d.quaternion.copy(j.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, r, s);
      const U = performance.now();
      let X = !1;
      if (!c && u === "object" && m && !b) {
        const d = this.objectNodes.get(m);
        d && h(d) && (this.outlineRenderer || (this.outlineRenderer = new M(this.renderer, this.scene)), this.outlineRenderer.render(j, r, s, [d]), X = !0);
      }
      if (X || this.renderer.render(this.scene, j), !c && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Fe(this.studio?.quality);
        const d = gr(this.qualityMonitor, performance.now() - U);
        d && (De(this.studio, this.renderer, d), this.onQualityDowngrade?.(d));
      }
    },
    setViewportQuality(a) {
      De(this.studio, this.renderer, a), this.qualityMonitor = wr(this.qualityMonitor || Fe(a), a);
    },
    dispose() {
      if (!this.disposed) {
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), _(this.content), _(this.path), _(this.liveCameras), _(this.selectionGroup);
        for (const a of new Set(this.bgTextureCache.values())) a.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const a of this.models.values()) _(a.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.outlineRenderer?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
function Mr(t) {
  if (!t) return !1;
  let e = !1;
  return t.traverse((i) => {
    i.isMesh && i.geometry && (e = !0);
  }), e;
}
class xr {
  constructor(e, i) {
    this.renderer = e, this.scene = i, this.composer = new Ut(this.renderer), this.renderPass = new $t(this.scene, new ue()), this.composer.addPass(this.renderPass), this.outlinePass = new Rt(
      new Be(window.innerWidth, window.innerHeight),
      this.scene,
      new ue()
    ), this.outlinePass.visibleEdgeColor.set("#A78BFA"), this.outlinePass.hiddenEdgeColor.set("#A78BFA"), this.outlinePass.hiddenEdgeColor.set("#463A6E"), this.outlinePass.edgeGlow = 0.1, this.outlinePass.usePatternTexture = !1, this.outlinePass.edgeThickness = 1, this.outlinePass.edgeStrength = 4, this.composer.addPass(this.outlinePass);
  }
  render(e, i, l, v) {
    this.renderPass.camera !== e && (this.renderPass.camera = e), this.outlinePass.renderCamera !== e && (this.outlinePass.renderCamera = e), this.composer.setSize(i, l), this.outlinePass.selectedObjects = v, this.composer.render();
  }
  dispose() {
    this.composer.dispose(), this.renderPass.dispose?.(), this.outlinePass.dispose();
  }
}
const ae = new Se({ color: 9212571, roughness: 0.9, metalness: 0 }), Ge = new me({ color: 11449792, wireframe: !0 });
function Ve() {
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
  ]), e = new Ne(t, 2, 2, Ke);
  return e.wrapS = e.wrapT = Ye, e.repeat.set(8, 8), e.colorSpace = pe, e.needsUpdate = !0, new Se({ map: e, roughness: 0.85, metalness: 0 });
}
function br(t, e) {
  if (e === "wireframe" || t.material_mode === "wireframe") {
    const l = Ge.clone();
    return t.color && (l.color = new le(t.color)), l;
  }
  if (t.material_mode === "checker") return Ve();
  const i = ae.clone();
  return t.color && (i.color = new le(t.color)), i;
}
function vr(t, e) {
  t.traverse((i) => {
    if (i.isMesh) {
      if (i.userData.omnicamOriginalMaterial || (i.userData.omnicamOriginalMaterial = i.material), i.userData.omnicamOverrideMaterial) {
        const l = Array.isArray(i.material) ? i.material : [i.material];
        for (const v of l)
          v?.map?.dispose?.(), v?.dispose?.();
        i.userData.omnicamOverrideMaterial = !1;
      }
      e === "textured" ? i.material = i.userData.omnicamOriginalMaterial : (i.material = e === "checker" ? Ve() : e === "wireframe" ? Ge.clone() : ae.clone(), i.userData.omnicamOverrideMaterial = !0);
    }
  });
}
function Le(t, e = !1) {
  t.traverse((i) => {
    if (i.userData.omnicamModelResource && !e) return;
    i.geometry?.dispose?.();
    const l = Array.isArray(i.material) ? i.material : [i.material];
    for (const v of l)
      v?.map?.dispose?.(), v?.dispose?.();
  });
}
function it(t) {
  if (!t) return null;
  const e = t instanceof HTMLVideoElement ? new He(t) : new Je(t);
  return e.colorSpace = pe, e.needsUpdate = !0, e;
}
function Cr(t, e, i) {
  const [l, v] = t.size || [2, 3], f = new J(), L = new re(new xe(l, v), new me({ color: 1448482, side: de, transparent: !0, opacity: 0.85 }));
  L.frustumCulled = !1, f.add(L);
  const C = it(e);
  if (!C) return f;
  const O = e.videoWidth || e.naturalWidth || e.width || l, P = e.videoHeight || e.naturalHeight || e.height || v, k = O / Math.max(1, P), V = l / Math.max(0.01, v);
  let _ = l, K = v;
  i === "contain" ? k > V ? K = l / k : _ = v * k : i === "cover" && (k > V ? (C.repeat.x = V / k, C.offset.x = (1 - C.repeat.x) * 0.5) : (C.repeat.y = k / V, C.offset.y = (1 - C.repeat.y) * 0.5));
  const N = new re(
    new xe(_, K),
    new me({
      color: 16777215,
      map: C,
      side: de,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return N.frustumCulled = !1, N.position.z = 2e-3, f.add(N), f.frustumCulled = !1, f;
}
class Lr {
  constructor(e = () => {
  }, i = () => {
  }) {
    this.canvas = document.createElement("canvas"), this.renderer = new Ee({
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
    }), this.renderer.setPixelRatio(1), this.renderer.outputColorSpace = pe, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = $e, this.scene = new Ze(), this.scene.background = new le(1184274), this.scene.add(new Ie(16777215, 3159099, 2.2));
    const l = new ze(16777215, 2.4);
    l.position.set(5, 8, 4), this.scene.add(l), this.flatLights = [this.scene.children.at(-2), l], this.studio = Zt(ve, this.renderer, Qt), this.scene.add(this.studio.group), this.studioEnabled = !0, ot(ve, this.scene, this.renderer, this.studio, !0), this.content = new J(), this.scene.add(this.content), this.path = new J(), this.scene.add(this.path), this.liveCameras = new J(), this.scene.add(this.liveCameras), this.selectionGroup = new J(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ue(35, 16 / 9, 0.01, 1e4), this.orthographic = new Ue(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = i, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new Xe(), this.pointer = new Be(), this.activeCamera = this.perspective;
  }
  async loadModel(e, i, l = "glb") {
    const v = `${l}:${i}`;
    if (!(!i || this.modelLoads.get(e) === v)) {
      this.modelLoads.set(e, v);
      try {
        let f, L = [];
        if (l === "obj") f = await new et().loadAsync(i);
        else if (l === "fbx")
          f = await new tt().loadAsync(i), L = f.animations || [];
        else if (l === "stl") f = new re(await new rt().loadAsync(i), ae.clone());
        else if (l === "ply") {
          const n = await new at().loadAsync(i);
          n.index ? (n.getAttribute("normal") || n.computeVertexNormals(), f = new re(n, ae.clone())) : f = new Re(n, new qe({ color: 11449792, size: 0.025 }));
        } else {
          const n = await new st().loadAsync(i);
          f = n.scene, L = n.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== v) {
          Le(f, !0);
          return;
        }
        const C = this.models.get(e);
        C && Le(C.scene, !0), f.traverse((n) => {
          if (n.userData.omnicamModelResource = !0, n.frustumCulled = !1, n.isMesh && (n.frustumCulled = !1, n.material)) {
            const g = Array.isArray(n.material) ? n.material : [n.material];
            for (const r of g)
              r.side = de;
          }
          n.isPoints && (n.frustumCulled = !1), n.isSkinnedMesh && (n.frustumCulled = !1, n.computeBoundingBox?.(), n.computeBoundingSphere?.());
        });
        let O = 0, P = 0, k = 0, V = 0;
        f.traverse((n) => {
          n.isMesh && (O += 1, V += n.geometry?.getAttribute?.("position")?.count || 0), n.isPoints && (P += 1), n.isBone && (k += 1);
        });
        const _ = new J();
        if (_.frustumCulled = !1, _.add(f), !O && !P && k) {
          const n = new Qe(f);
          n.material.depthTest = !1, n.material.opacity = 0.9, n.material.transparent = !0, n.renderOrder = 10, n.userData.omnicamModelResource = !0, _.add(n);
        }
        _.updateMatrixWorld(!0);
        const K = new We().setFromObject(_), N = K.getSize(new be()), R = Math.max(N.x, N.y, N.z), I = Number.isFinite(R) && R > 1e-6 ? 2.5 / R : 1, H = K.getCenter(new be());
        _.scale.setScalar(I), _.position.set(-H.x * I, -K.min.y * I, -H.z * I);
        const h = new J();
        h.frustumCulled = !1, h.add(_);
        const M = L.length ? new je(f) : null;
        M && M.clipAction(L[0]).play();
        const a = { url: i, format: l, scene: h, mixer: M, clips: L, selectedClip: 0, duration: L[0]?.duration || 0, meshes: O, points: P, bones: k, vertices: V, animations: L.length, normalizationScale: I };
        this.models.set(e, a), this.onModelLoaded({ id: e, format: l, meshes: O, points: P, bones: k, vertices: V, animations: L.length, animationNames: L.map((n, g) => n.name || `Clip ${g + 1}`), duration: a.duration, normalizationScale: I }), this.sceneKey = "", this.invalidate();
      } catch (f) {
        this.modelLoads.get(e) === v && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${l.toUpperCase()} ${e}`, f);
        const L = f?.message?.includes("FBX version not supported") || f?.message?.includes("6100") || f?.message?.includes("6000"), C = L ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : f?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: l, error: C, isLegacyFBX: L });
      }
    }
  }
}
const ie = { THREE: ve, FBXLoader: tt, GLTFLoader: st, OBJLoader: et, PLYLoader: at, STLLoader: rt, neutral: ae, wire: Ge, checkerMaterial: Ve, objectMaterial: br, applyModelMaterial: vr, disposeObject: Le, textureFor: it, cardMesh: Cr, generatePointField: Kt, sampleCamera: Xt, sampleObjectTransform: Yt, hasOutlineMesh: Mr, SelectionOutlineRenderer: xr };
Object.assign(
  Lr.prototype,
  dr(ie),
  mr(ie),
  ur(ie),
  yr(ie)
);
async function Sr(t, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const i of ["vp9", "vp8"])
    try {
      if (await ce(rr(i, { width: t, height: e }), 5e3, `Checking ${i} support`)) return i;
    } catch {
    }
  return null;
}
function ce(t, e, i) {
  let l;
  return Promise.race([
    t,
    new Promise((v, f) => {
      l = setTimeout(() => f(new Error(`${i} timed out`)), e);
    })
  ]).finally(() => clearTimeout(l));
}
async function Ar(t, e, i, l, v) {
  const f = await Sr(t.width, t.height);
  if (!f) throw new Error("No supported WebCodecs WebM encoder");
  const L = new Jt({ format: new Et(), target: new Ht() }), C = new er(t, { codec: f, quality: new tr("high"), keyFrameInterval: 1 });
  L.addVideoTrack(C, { frameRate: i }), await ce(L.start(), 1e4, "Starting deterministic encoder");
  try {
    const O = 1 / i;
    for (let P = 0; P < e; P++) {
      if (v?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await l(P), await ce(C.add(P * O, O, { keyFrame: P % i === 0 }), 1e4, `Encoding frame ${P + 1}`);
    }
    await ce(L.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (O) {
    throw L.state !== "finalized" && await L.cancel().catch(() => {
    }), O;
  }
  return new Blob([L.target.buffer], { type: await L.getMimeType() });
}
export {
  Lr as OmniWebGLViewport,
  Ar as encodeDeterministicPlayblast,
  Sr as supportsDeterministicEncoding
};
