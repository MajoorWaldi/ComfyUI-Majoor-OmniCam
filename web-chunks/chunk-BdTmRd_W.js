import { G as Y, D as Oe, M as te, P as ye, a as Ce, S as ut, b as ht, C as ft, c as he, E as pt, A as gt, d as ce, N as wt, e as Fe, f as yt, B as ze, g as Mt, h as xt, i as bt, j as vt, k as Ct, l as Lt, m as je, n as le, F as St, o as Bt, H as We, L as Gt, p as Vt, q as _t, r as kt, s as At, t as Dt, u as Tt, v as de, O as Ne, w as Ie, x as Ue, y as Pt, z as $e, I as qe, Q as Ot, R as Ke, J as Xe, K as Re, T as Ft, U as Ye, V as Ze, W as zt, X as jt, Y as Qe, Z as Wt, _ as Nt, $ as Je, a0 as Me, a1 as He, a2 as Ee, a3 as It, a4 as et, a5 as tt, a6 as rt, a7 as at, a8 as ot } from "./chunk-DICspFCd.js";
import { $ as Ut, A as $t, s as qt, f as Kt } from "./chunk-DMJgQTTA.js";
import { a as Ae, s as st, D as De, c as Xt, b as Rt } from "./chunk-CBpXDU8d.js";
import { O as Yt, B as Zt, W as Qt, C as Jt, Q as Ht, c as Et } from "./chunk-CcqF7PHi.js";
const xe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ACESFilmicToneMapping: gt,
  AnimationMixer: Fe,
  AxesHelper: yt,
  Box3: ze,
  Box3Helper: Mt,
  BoxGeometry: xt,
  BufferGeometry: bt,
  CanvasTexture: ft,
  CatmullRomCurve3: vt,
  Color: ce,
  ConeGeometry: Ct,
  CylinderGeometry: Lt,
  DataTexture: je,
  DirectionalLight: Oe,
  DoubleSide: le,
  EquirectangularReflectionMapping: pt,
  Float32BufferAttribute: St,
  GridHelper: Bt,
  Group: Y,
  HemisphereLight: We,
  Line: Gt,
  Line3: Vt,
  LineBasicMaterial: _t,
  LineDashedMaterial: kt,
  LineSegments: At,
  MathUtils: Dt,
  Matrix4: Tt,
  Mesh: te,
  MeshBasicMaterial: de,
  MeshStandardMaterial: Ce,
  NoToneMapping: wt,
  OrthographicCamera: Ne,
  PCFSoftShadowMap: Ie,
  PMREMGenerator: ht,
  PerspectiveCamera: Ue,
  Plane: Pt,
  PlaneGeometry: ye,
  Points: $e,
  PointsMaterial: qe,
  Quaternion: Ot,
  RGBAFormat: Ke,
  Raycaster: Xe,
  RepeatWrapping: Re,
  RingGeometry: Ft,
  SRGBColorSpace: he,
  Scene: Ye,
  ShadowMaterial: ut,
  SkeletonHelper: Ze,
  SkinnedMesh: zt,
  SphereGeometry: jt,
  Texture: Qe,
  TextureLoader: Wt,
  TubeGeometry: Nt,
  Vector2: Je,
  Vector3: Me,
  VideoTexture: He,
  WebGLRenderer: Ee,
  WireframeGeometry: It
}, Symbol.toStringTag, { value: "Module" }));
function er(t, { position: e, forward: d, up: i, color: C, scale: p = 1, active: v = !0 }) {
  const b = new t.Group(), O = v ? 0.95 : 0.5, k = new t.MeshBasicMaterial({
    color: C,
    transparent: !0,
    opacity: O,
    depthTest: !1
  }), T = new t.Mesh(new t.BoxGeometry(0.34, 0.24, 0.42), k);
  T.renderOrder = 912, b.add(T);
  const _ = new t.Mesh(new t.ConeGeometry(0.17, 0.26, 20), k);
  return _.rotation.x = -Math.PI / 2, _.position.z = -0.32, _.renderOrder = 912, b.add(_), b.scale.setScalar(p), b.position.copy(e), b.up.copy(i), b.lookAt(e.clone().add(d)), b;
}
function tr(t, { position: e, color: d = 15903035, radius: i = 0.28, bold: C = !1 }) {
  const p = new t.Group(), v = C ? 16773544 : d, b = new t.LineBasicMaterial({ color: v, transparent: !0, opacity: C ? 1 : 0.95, depthTest: !1 }), O = (_) => {
    const D = [];
    for (let q = 0; q <= 48; q++) {
      const I = q / 48 * Math.PI * 2;
      D.push(new t.Vector3(Math.cos(I) * _, Math.sin(I) * _, 0));
    }
    const N = new t.Line(new t.BufferGeometry().setFromPoints(D), b);
    return N.renderOrder = 915, N;
  };
  if (p.add(O(i)), C) {
    p.add(O(i * 1.18));
    const _ = new t.Mesh(
      new t.RingGeometry(0, i * 0.3, 16),
      new t.MeshBasicMaterial({ color: v, transparent: !0, opacity: 1, depthTest: !1 })
    );
    _.renderOrder = 916, p.add(_);
  }
  const k = i * 1.55, T = new t.LineSegments(
    new t.BufferGeometry().setFromPoints([
      new t.Vector3(-k, 0, 0),
      new t.Vector3(-i * 0.45, 0, 0),
      new t.Vector3(i * 0.45, 0, 0),
      new t.Vector3(k, 0, 0),
      new t.Vector3(0, -k, 0),
      new t.Vector3(0, -i * 0.45, 0),
      new t.Vector3(0, i * 0.45, 0),
      new t.Vector3(0, k, 0)
    ]),
    b
  );
  return T.renderOrder = 915, p.add(T), p.position.copy(e), p.userData.omnicamBillboard = !0, p;
}
const be = 3718648, rr = 12e3;
function me(t) {
  return !!(t.isSkinnedMesh && t.skeleton);
}
function nt(t, e) {
  t.position.copy(e.position), t.quaternion.copy(e.quaternion), t.scale.copy(e.scale);
}
function ue(t) {
  return t.frustumCulled = !1, t.raycast = () => {
  }, t.userData.omnicamHelper = !0, t;
}
function ar(t, e) {
  if (me(e)) {
    const i = new t.SkinnedMesh(e.geometry.clone(), new t.MeshBasicMaterial({
      color: be,
      wireframe: !0,
      transparent: !0,
      opacity: 0.45,
      depthWrite: !1
    }));
    return i.bindMode = e.bindMode, i.bind(e.skeleton, e.bindMatrix), nt(i, e), { overlay: ue(i), parent: e.parent || e };
  }
  const d = new t.LineSegments(
    new t.WireframeGeometry(e.geometry),
    new t.LineBasicMaterial({ color: be, opacity: 0.45, transparent: !0 })
  );
  return { overlay: ue(d), parent: e };
}
function or(t, e) {
  const d = new t.PointsMaterial({ color: be, size: 0.05, sizeAttenuation: !0 });
  if (!me(e)) {
    const _ = new t.Points(e.geometry, d);
    return { overlay: ue(_), parent: e };
  }
  const i = e.geometry.getAttribute("position")?.count || 0, C = Math.max(1, Math.ceil(i / rr)), p = Math.ceil(i / C), v = new Float32Array(p * 3), b = new t.BufferGeometry();
  b.setAttribute("position", new t.Float32BufferAttribute(v, 3));
  const O = new t.Points(b, d);
  nt(O, e);
  const k = new t.Vector3(), T = b.getAttribute("position");
  return O.onBeforeRender = () => {
    for (let _ = 0; _ < p; _++)
      e.getVertexPosition(_ * C, k), T.setXYZ(_, k.x, k.y, k.z);
    T.needsUpdate = !0;
  }, { overlay: ue(O), parent: e.parent || e };
}
function sr(t, e, d) {
  const i = me(e) ? new t.SkinnedMesh(e.geometry.clone(), d) : new t.Mesh(e.geometry.clone(), d);
  return me(e) && (i.bindMode = e.bindMode, i.bind(e.skeleton, e.bindMatrix)), i.matrixAutoUpdate = !1, i.matrix.copy(e.matrixWorld), i.frustumCulled = !1, i;
}
function nr(t, e, { wireframe: d = !1, vertices: i = !1 } = {}) {
  if (!d && !i) return;
  const C = [];
  e.traverse((p) => {
    p.isMesh && p.geometry && !p.userData.omnicamHelper && C.push(p);
  });
  for (const p of C) {
    if (d) {
      const { overlay: v, parent: b } = ar(t, p);
      b.add(v);
    }
    if (i) {
      const { overlay: v, parent: b } = or(t, p);
      b.add(v);
    }
  }
}
function ir(t) {
  const { THREE: e, FBXLoader: d, GLTFLoader: i, OBJLoader: C, PLYLoader: p, STLLoader: v, neutral: b, wire: O, checkerMaterial: k, objectMaterial: T, applyModelMaterial: _, disposeObject: D, textureFor: K, cardMesh: N, generatePointField: q, sampleCamera: I, sampleObjectTransform: Z } = t;
  return {
    removeModel(a) {
      const y = this.models.get(a);
      y && D(y.scene, !0), this.models.delete(a), this.modelLoads.delete(a), this.sceneKey = "";
    },
    selectAnimation(a, y) {
      const u = this.models.get(a);
      !u?.mixer || !u.clips.length || (u.selectedClip = Math.max(0, Math.min(u.clips.length - 1, Number(y) || 0)), u.duration = u.clips[u.selectedClip].duration || 0, u.mixer.stopAllAction(), u.mixer.clipAction(u.clips[u.selectedClip]).play(), this.invalidate());
    },
    rebuild(a, y, u) {
      this.content.traverse((r) => {
        for (const o of [...r.children])
          o.userData.omnicamHelper && (r.remove(o), D(o, !0));
      }), D(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const s = a.render_mode, w = new e.GridHelper(120, 120, 7829367, 3881787);
      if (w.userData.omnicamCaptureGuide = !0, w.frustumCulled = !1, this.content.add(w), ["omni_ref", "point_field"].includes(s)) {
        const { points: r, colors: o } = q(a.point_density || "balanced", a.point_spread || "all_views", a.point_color || null);
        if (r.length > 0) {
          const h = new e.BufferGeometry();
          h.setAttribute("position", new e.Float32BufferAttribute(r, 3)), h.setAttribute("color", new e.Float32BufferAttribute(o, 3));
          const n = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), f = new e.Points(h, n);
          f.frustumCulled = !1, this.content.add(f);
        }
      }
      if (!["grid", "point_field"].includes(s))
        for (const r of a.objects) {
          if (r.enabled === !1) continue;
          const o = r.size || [1, 1, 1];
          let h;
          if (r.type === "glb" || r.type === "model") {
            const n = u.get(r.id), f = this.models.get(r.id), l = r.format || (r.type === "glb" ? "glb" : "");
            n && (f?.url !== n || f?.format !== l) && this.loadModel(r.id, n, l), f?.url === n ? (h = f.scene, _(h, r.material_mode || "textured")) : h = new e.Mesh(new e.BoxGeometry(o[0], o[1], o[2] || 1), O.clone());
          } else if (r.type === "sphere") h = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), T(r, s));
          else if (r.type === "ground") h = new e.Mesh(new e.BoxGeometry(1, 1, 1), T(r, s));
          else if (r.type === "card")
            h = r.material_mode && r.material_mode !== "textured" ? new e.Mesh(new e.PlaneGeometry(o[0], o[1]), T(r, s)) : N(r, y.get(r.id), a.card_fit || "contain");
          else if (r.type === "null") {
            const n = new e.AxesHelper(0.5);
            n.position.fromArray(r.position || [0, 0, 0]), n.userData.omnicamId = r.id, n.frustumCulled = !1, this.objectNodes.set(r.id, n), this.content.add(n);
            continue;
          } else
            h = new e.Mesh(new e.BoxGeometry(1, 1, 1), T(r, s));
          h.position.fromArray(r.position || [0, 0, 0]), h.rotation.set(...(r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), r.type !== "card" && h.scale.fromArray(o), h.userData.omnicamId = r.id, h.frustumCulled = !1, h.traverse((n) => {
            n.frustumCulled = !1, n.userData.omnicamId = r.id;
          }), nr(e, h, { wireframe: a.show_wireframe, vertices: a.show_vertices }), this.objectNodes.set(r.id, h), this.content.add(h);
        }
    },
    rebuildPath(a, y = "camera", u = null) {
      D(this.path), this.path.clear();
      const s = [
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
      (a.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: a.keyframes || [] }]).forEach((o, h) => {
        const n = o.keyframes || [];
        if (n.length === 0) return;
        const f = o.color ? { line: new e.Color(o.color), marker: new e.Color(o.color), frustum: new e.Color(o.color) } : s[h % s.length], l = o.id === a.active_camera_id, m = l && y === "camera";
        if (n.length >= 2) {
          const M = n[0].frame, g = n[n.length - 1].frame, x = Math.max(32, Math.min(256, g - M + 1)), L = { ...o, keyframes: n, objects: a.objects }, B = Array.from({ length: x }, (P, c) => {
            const S = M + (g - M) * c / Math.max(1, x - 1);
            return new e.Vector3().fromArray(I(L, S, a.objects).position);
          }), G = new e.CatmullRomCurve3(B, !1, "centripetal"), V = m ? 0.06 : l ? 0.045 : 0.025, F = new e.MeshBasicMaterial({
            color: f.line,
            transparent: !0,
            opacity: l ? 1 : 0.55,
            depthTest: !1
          }), A = new e.Mesh(new e.TubeGeometry(G, Math.max(48, x), V, 8, !1), F);
          if (A.renderOrder = 900, A.userData.omnicamWidget = "path", this.path.add(A), l) {
            const P = new e.Mesh(
              new e.TubeGeometry(G, Math.max(48, x), V * (m ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: f.line, transparent: !0, opacity: m ? 0.3 : 0.18, depthTest: !1 })
            );
            P.renderOrder = 899, P.userData.omnicamWidget = "path", this.path.add(P);
          }
        }
        for (const M of n) {
          const g = new e.Mesh(
            new e.SphereGeometry(l ? 0.13 : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: f.marker, depthTest: !1 })
          );
          g.position.fromArray(M.camera.position), g.renderOrder = 910, g.userData.omnicamPathKey = { cameraId: o.id, frame: M.frame }, g.userData.omnicamWidget = "path", this.path.add(g);
          const x = new e.Vector3().fromArray(M.camera.position), L = new e.Vector3().fromArray(M.camera.target || [0, 0, 0]), B = l && u != null && M.frame === u;
          if (B) {
            const G = L.clone().sub(x).normalize();
            let V = new e.Vector3().crossVectors(G, new e.Vector3(0, 1, 0));
            V.lengthSq() < 1e-8 ? V.set(1, 0, 0) : V.normalize();
            const F = new e.Vector3().crossVectors(V, G).normalize(), A = e.MathUtils.clamp(x.distanceTo(L) * 0.08, 0.25, 0.8), P = M.camera.camera_type === "orthographic" ? A * 0.55 : A * Math.tan(e.MathUtils.degToRad(M.camera.fov || 35) * 0.5), c = P * (a.width || 16) / Math.max(1, a.height || 9), S = x.clone().addScaledVector(G, A), W = [
              S.clone().addScaledVector(V, -c).addScaledVector(F, -P),
              S.clone().addScaledVector(V, c).addScaledVector(F, -P),
              S.clone().addScaledVector(V, c).addScaledVector(F, P),
              S.clone().addScaledVector(V, -c).addScaledVector(F, P)
            ], j = [];
            for (const X of W) j.push(x, X);
            for (let X = 0; X < 4; X++) j.push(W[X], W[(X + 1) % 4]);
            const U = new e.BufferGeometry().setFromPoints(j), $ = new e.LineSegments(U, new e.LineBasicMaterial({
              color: f.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            $.userData.omnicamWidget = "gizmo", this.path.add($);
            const Q = er(e, {
              position: x,
              forward: G,
              up: F,
              color: f.marker,
              scale: e.MathUtils.clamp(A * 1.15, 0.35, 1.6),
              active: l
            });
            Q.userData.omnicamWidget = "gizmo", this.path.add(Q);
          }
          if (B) {
            const G = tr(e, {
              position: L,
              radius: e.MathUtils.clamp(x.distanceTo(L) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            G.userData.omnicamWidget = "lookat", this.path.add(G);
            const V = new e.Line(
              new e.BufferGeometry().setFromPoints([x.clone(), L.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            V.renderOrder = 914, V.userData.omnicamWidget = "lookat", this.path.add(V);
          }
        }
      });
      const r = [16742005, 52937, 16632686, 7101671, 14774357];
      (a.objects || []).forEach((o, h) => {
        const n = o.keyframes || [];
        if (n.length < 2) return;
        const f = o.color ? new e.Color(o.color) : r[h % r.length], l = n.map((g) => new e.Vector3().fromArray(g.transform?.position || [0, 0, 0])), m = new e.CatmullRomCurve3(l, !1, "centripetal"), M = new e.Mesh(
          new e.TubeGeometry(m, Math.max(32, n.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: f, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        M.renderOrder = 900, M.userData.omnicamWidget = "path", this.path.add(M);
        for (const g of n) {
          const x = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: f, depthTest: !1 })
          );
          x.position.fromArray(g.transform?.position || [0, 0, 0]), x.renderOrder = 910, x.userData.omnicamWidget = "path", this.path.add(x);
        }
      });
    }
  };
}
function cr(t) {
  const { THREE: e, FBXLoader: d, GLTFLoader: i, OBJLoader: C, PLYLoader: p, STLLoader: v, neutral: b, wire: O, checkerMaterial: k, objectMaterial: T, applyModelMaterial: _, disposeObject: D, textureFor: K, cardMesh: N, generatePointField: q, sampleCamera: I, sampleObjectTransform: Z } = t;
  return {
    updateLiveCameras(a, y, u, s, w = "camera", r = null) {
      if (D(this.liveCameras), this.liveCameras.clear(), u) return;
      const o = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (a.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: a.keyframes || [] }]).forEach((n, f) => {
        const l = n.color ? { line: new e.Color(n.color), marker: new e.Color(n.color), frustum: new e.Color(n.color), body: new e.Color(n.color).multiplyScalar(0.35) } : o[f % o.length], m = n.id === a.active_camera_id, M = m && w === "camera";
        if (s === "camera" && m) return;
        const g = I(n, y, a.objects), x = new e.Vector3().fromArray(g.position || [0, 0, 0]), L = new e.Vector3().fromArray(g.target || [0, 0, 0]), B = L.clone().sub(x), G = B.length();
        G < 1e-4 ? B.set(0, 0, -1) : B.normalize();
        let V = new e.Vector3(0, 1, 0), F = new e.Vector3().crossVectors(B, V);
        F.lengthSq() < 1e-6 && (V = new e.Vector3(0, 0, 1), F = new e.Vector3().crossVectors(B, V)), F.normalize();
        let A = new e.Vector3().crossVectors(F, B).normalize();
        if (g.roll) {
          const z = e.MathUtils.degToRad(g.roll);
          F.applyAxisAngle(B, z), A.applyAxisAngle(B, z);
        }
        const P = new e.Group(), c = new e.Mesh(
          new e.BoxGeometry(0.18, 0.12, 0.22),
          new e.MeshStandardMaterial({ color: l.body, roughness: 0.4, metalness: 0.8 })
        );
        c.position.set(0, 0, -0.11), P.add(c);
        const S = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
        S.rotateX(Math.PI / 2);
        const W = new e.Mesh(
          S,
          new e.MeshStandardMaterial({ color: l.marker, roughness: 0.2, metalness: 0.9 })
        );
        W.position.set(0, 0, 0.05), P.add(W);
        const j = new e.Mesh(
          new e.BoxGeometry(0.04, 0.03, 0.08),
          new e.MeshBasicMaterial({ color: m ? 16729156 : l.marker })
        );
        j.position.set(0, 0.07, -0.08), P.add(j);
        const U = new e.Matrix4().makeBasis(F, A, B.clone().negate());
        P.quaternion.setFromRotationMatrix(U), P.position.copy(x), P.userData.omnicamWidget = "gizmo", this.liveCameras.add(P);
        const $ = new e.SphereGeometry(0.35, 8, 6), Q = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 }), X = new e.Mesh($, Q);
        X.position.copy(x), X.userData = { omnicamType: "camera", omnicamId: n.id }, this.liveCameras.add(X);
        const Be = e.MathUtils.clamp(G * 0.25, 0.5, 2.5), H = g.camera_type === "orthographic" ? 5 / Math.max(0.01, g.zoom || 1) * 0.35 : Be * Math.tan(e.MathUtils.degToRad(g.fov || 35) * 0.5), ae = H * (a.width || 16) / Math.max(1, a.height || 9), oe = x.clone().addScaledVector(B, Be), J = [
          oe.clone().addScaledVector(F, -ae).addScaledVector(A, -H),
          oe.clone().addScaledVector(F, ae).addScaledVector(A, -H),
          oe.clone().addScaledVector(F, ae).addScaledVector(A, H),
          oe.clone().addScaledVector(F, -ae).addScaledVector(A, H)
        ], se = [];
        for (const z of J) se.push(x, z);
        for (let z = 0; z < 4; z++) se.push(J[z], J[(z + 1) % 4]);
        const Ge = J[2].clone().add(J[3]).multiplyScalar(0.5).clone().addScaledVector(A, H * 0.25);
        se.push(J[2], Ge, Ge, J[3]);
        const ct = new e.BufferGeometry().setFromPoints(se), Ve = new e.LineSegments(ct, new e.LineBasicMaterial({
          color: M ? l.marker : l.frustum,
          linewidth: m ? 2 : 1,
          transparent: !0,
          opacity: m ? 1 : 0.6
        }));
        if (Ve.userData.omnicamWidget = "gizmo", this.liveCameras.add(Ve), G > 0.01) {
          const z = m && w === "camera_target", fe = new e.BufferGeometry().setFromPoints([x, L]), E = new e.Line(fe, new e.LineDashedMaterial({
            color: M || z ? 3718648 : l.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: M || z ? 1 : m ? 0.75 : 0.4
          }));
          E.userData.omnicamWidget = "lookat", this.liveCameras.add(E);
          const R = z ? 0.12 : M ? 0.11 : 0.08, ee = [
            L.clone().add(new e.Vector3(-R, 0, 0)),
            L.clone().add(new e.Vector3(R, 0, 0)),
            L.clone().add(new e.Vector3(0, -R, 0)),
            L.clone().add(new e.Vector3(0, R, 0)),
            L.clone().add(new e.Vector3(0, 0, -R)),
            L.clone().add(new e.Vector3(0, 0, R))
          ], lt = new e.BufferGeometry().setFromPoints(ee), _e = new e.LineSegments(lt, new e.LineBasicMaterial({
            color: z || M ? 3718648 : l.marker,
            linewidth: z ? 3 : 1,
            transparent: !0,
            opacity: z || M ? 1 : m ? 0.9 : 0.5
          }));
          _e.userData.omnicamWidget = "lookat", this.liveCameras.add(_e);
          const dt = new e.SphereGeometry(0.28, 8, 6), pe = new e.Mesh(dt, Q);
          if (pe.position.copy(L), pe.userData = { omnicamType: "camera_target", omnicamId: n.id }, this.liveCameras.add(pe), (z || M) && s !== "camera") {
            const ke = new e.RingGeometry(0.14, 0.18, 24);
            ke.rotateX(Math.PI / 2);
            const mt = new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), ge = new e.Mesh(ke, mt);
            ge.position.copy(L), ge.userData.omnicamWidget = "lookat", this.liveCameras.add(ge);
          }
        }
        if (m && s !== "camera" && w === "camera") {
          const z = new e.RingGeometry(0.19, 0.24, 32);
          z.rotateX(Math.PI / 2);
          const fe = new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 1 }), E = new e.Mesh(z, fe);
          E.position.copy(x), E.userData.omnicamWidget = "gizmo", this.liveCameras.add(E);
          const R = new e.RingGeometry(0.28, 0.31, 32);
          R.rotateX(Math.PI / 2);
          const ee = new e.Mesh(R, new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          ee.position.copy(x), ee.userData.omnicamWidget = "gizmo", this.liveCameras.add(ee);
        }
      });
    },
    updateSelection(a, y, u, s = null, w = "") {
      const r = s ? `${s.mode || ""}:${s.objectId || ""}:${(s.point || []).join(",")}` : "", o = `${y}:${u || ""}:${(a.__selectedObjectIds || []).join(",")}:${w}:${r}`;
      if (o !== this.selectionKey) {
        if (this.selectionKey = o, D(this.selectionGroup), this.selectionGroup.clear(), y === "object" && u) {
          const h = this.objectNodes.get(u);
          if (h) {
            h.updateMatrixWorld(!0);
            try {
              const n = new e.Box3(), f = [];
              if (h.traverse((l) => {
                l.isBone && f.push(l);
              }), f.length > 0) {
                const l = new e.Vector3();
                for (const m of f)
                  m.getWorldPosition(l), n.expandByPoint(l);
                n.expandByScalar(0.2);
              } else
                n.setFromObject(h);
              if (!n.isEmpty() && Number.isFinite(n.min.x) && Number.isFinite(n.max.x) && Number.isFinite(n.min.y) && Number.isFinite(n.max.y) && Number.isFinite(n.min.z) && Number.isFinite(n.max.z)) {
                n.expandByScalar(0.04);
                const l = new e.Box3Helper(n, new e.Color(3718648));
                l.material.transparent = !0, l.material.opacity = 0.95, l.material.depthTest = !1, l.renderOrder = 9999, this.selectionGroup.add(l);
              }
            } catch {
            }
            if (a.show_wireframe) {
              let n = 0;
              h.traverse((f) => {
                if (!f.isMesh || !f.geometry || f.userData.omnicamHelper || n >= 64) return;
                const l = sr(e, f, new e.MeshBasicMaterial({
                  color: 3718648,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                l.renderOrder = 9998, this.selectionGroup.add(l), n += 1;
              });
            }
            if (s && s.objectId === u && s.point) {
              if (s.mode === "vertex") {
                const n = new e.SphereGeometry(0.08, 16, 12), f = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), l = new e.Mesh(n, f);
                l.position.fromArray(s.point), l.renderOrder = 1e4, this.selectionGroup.add(l);
                const m = new e.RingGeometry(0.1, 0.15, 24), M = new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, depthTest: !1 }), g = new e.Mesh(m, M);
                g.position.fromArray(s.point), this.activeCamera && g.quaternion.copy(this.activeCamera.quaternion), g.renderOrder = 1e4, this.selectionGroup.add(g);
              } else if (s.mode === "edge" && s.edge) {
                const [n, f] = s.edge, l = new e.BufferGeometry().setFromPoints([new e.Vector3(...n), new e.Vector3(...f)]), m = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), M = new e.Line(l, m);
                M.renderOrder = 1e4, this.selectionGroup.add(M);
              } else if (s.mode === "face" && s.vertices) {
                const [n, f, l] = s.vertices, m = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...n),
                  new e.Vector3(...f),
                  new e.Vector3(...l)
                ]);
                m.setIndex([0, 1, 2]), m.computeVertexNormals();
                const M = new e.MeshBasicMaterial({
                  color: 3718648,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), g = new e.Mesh(m, M);
                g.renderOrder = 1e4, this.selectionGroup.add(g);
                const x = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...n),
                  new e.Vector3(...f),
                  new e.Vector3(...l),
                  new e.Vector3(...n)
                ]), L = new e.Line(x, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                L.renderOrder = 10001, this.selectionGroup.add(L);
              }
            }
          }
        }
        if (y === "object")
          for (const h of a.__selectedObjectIds || []) {
            if (h === u) continue;
            const n = this.objectNodes.get(h);
            if (n) {
              n.updateMatrixWorld(!0);
              try {
                const f = new e.Box3().setFromObject(n);
                if (!f.isEmpty() && Number.isFinite(f.min.x)) {
                  f.expandByScalar(0.04);
                  const l = new e.Box3Helper(f, new e.Color(16498468));
                  l.material.transparent = !0, l.material.opacity = 0.85, l.material.depthTest = !1, l.renderOrder = 9997, this.selectionGroup.add(l);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(a) {
      const y = this.objectNodes.get(a);
      if (!y) return [];
      const u = [], s = /* @__PURE__ */ new Set();
      return y.traverse((w) => {
        const r = w.isBone ? w.name : "";
        !r || s.has(r) || u.length >= 256 || (s.add(r), u.push(r));
      }), u;
    },
    /**
     * World position of `boneName` (or the model's animated centre when no bone
     * is named) at an arbitrary frame.
     *
     * The mixer is the only thing that knows where a bone sits at a given time,
     * so the model is posed at `frame`, probed, then posed back: a probe for a
     * frame other than the playhead must not leave the viewport showing it.
     */
    sampleModelPoint(a, y, u, s = 24) {
      const w = this.objectNodes.get(a);
      if (!w) return null;
      const r = this.models.get(a), o = r?.mixer && r.duration > 0, h = o ? r.mixer.time : null;
      o && (r.mixer.setTime(Math.max(0, u) / Math.max(1, s) % r.duration), w.updateMatrixWorld(!0));
      let n = null;
      if (y) {
        let f = null;
        if (w.traverse((l) => {
          !f && l.isBone && l.name === y && (f = l);
        }), f) {
          const l = new e.Vector3().setFromMatrixPosition(f.matrixWorld);
          n = [l.x, l.y, l.z];
        }
      } else
        n = this.getObjectWorldCenter(a);
      return o && Number.isFinite(h) && (r.mixer.setTime(h), w.updateMatrixWorld(!0)), n;
    },
    getObjectWorldCenter(a) {
      const y = this.objectNodes.get(a);
      if (!y) return null;
      y.updateMatrixWorld(!0);
      const u = [];
      if (y.traverse((r) => {
        r.isBone && u.push(r);
      }), u.length > 0) {
        const r = new e.Vector3(), o = new e.Vector3();
        for (const h of u)
          h.getWorldPosition(o), r.add(o);
        return r.divideScalar(u.length), [r.x, r.y, r.z];
      }
      const s = new e.Box3().setFromObject(y);
      if (!s.isEmpty() && Number.isFinite(s.min.x)) {
        const r = s.getCenter(new e.Vector3());
        return [r.x, r.y, r.z];
      }
      const w = new e.Vector3();
      return y.getWorldPosition(w), [w.x, w.y, w.z];
    }
  };
}
function lr(t) {
  const { THREE: e, FBXLoader: d, GLTFLoader: i, OBJLoader: C, PLYLoader: p, STLLoader: v, neutral: b, wire: O, checkerMaterial: k, objectMaterial: T, applyModelMaterial: _, disposeObject: D, textureFor: K, cardMesh: N, generatePointField: q, sampleCamera: I, sampleObjectTransform: Z } = t;
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(a) {
      if (!this.path.visible || !this.activeCamera) return null;
      this.pointer.set(a[0] / this.canvas.width * 2 - 1, -(a[1] / this.canvas.height) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const y of this.raycaster.intersectObjects(this.path.children, !0)) {
        const u = Ut(y);
        if (u) return { ...u, position: y.object.position.toArray() };
      }
      return null;
    },
    configureCamera(a, y) {
      const u = a || defaultCamera(), s = Math.max(5e-3, Number(u.near) || 0.01), w = Math.max(s + 1, Number(u.far) || 1e4);
      let r;
      if (u.camera_type === "orthographic") {
        r = this.orthographic;
        const m = 5 / Math.max(0.01, u.zoom || 1);
        r.left = -m * y, r.right = m * y, r.top = m, r.bottom = -m, r.near = s, r.far = w, r.updateProjectionMatrix();
      } else
        r = this.perspective, r.fov = e.MathUtils.clamp(Number(u.fov) || 35, 1, 175), r.aspect = y, r.near = s, r.far = w, r.updateProjectionMatrix();
      const o = new e.Vector3().fromArray(u.position || [6, 4, 6]), h = new e.Vector3().fromArray(u.target || [0, 1.5, 0]), n = h.clone().sub(o);
      n.lengthSq() < 1e-6 ? n.set(0, 0, -1) : n.normalize();
      let f = u.up ? new e.Vector3().fromArray(u.up) : new e.Vector3(0, 1, 0), l = new e.Vector3().crossVectors(n, f);
      if (l.lengthSq() < 1e-6 && (f = Math.abs(n.y) > 0.9 ? new e.Vector3(0, 0, n.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), l.crossVectors(n, f)), l.normalize(), f.crossVectors(l, n).normalize(), u.roll) {
        const m = e.MathUtils.degToRad(u.roll);
        l.applyAxisAngle(n, m), f.applyAxisAngle(n, m);
      }
      return r.position.copy(o), r.up.copy(f), r.lookAt(h), r.updateMatrixWorld(), r;
    },
    pick(a, y, u, s) {
      if (!this.activeCamera) return null;
      this.pointer.set(a / Math.max(1, u) * 2 - 1, 1 - y / Math.max(1, s) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const w = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const r of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          r.object?.userData?.omnicamType && w.push({
            distance: r.distance,
            type: r.object.userData.omnicamType,
            id: r.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const r of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (r.object?.userData?.omnicamCaptureGuide || r.object?.userData?.omnicamHelper) continue;
          let o = r.object;
          for (; o && !o.userData?.omnicamId; ) o = o.parent;
          o?.userData?.omnicamId && w.push({
            distance: r.distance,
            type: "object",
            id: o.userData.omnicamId
          });
        }
      return w.length ? (w.sort((r, o) => r.distance - o.distance), { type: w[0].type, id: w[0].id }) : null;
    },
    pickSubElement(a, y, u, s, w = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(a / Math.max(1, u) * 2 - 1, 1 - y / Math.max(1, s) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const r = this.raycaster.intersectObjects(this.content.children, !0);
      for (const o of r) {
        let h = o.object, n = o.object;
        for (; h && !h.userData.omnicamId; ) h = h.parent;
        if (!h?.userData.omnicamId || !n.geometry) continue;
        const f = h.userData.omnicamId, m = n.geometry.getAttribute("position");
        if (!m) continue;
        n.updateMatrixWorld(!0);
        const M = n.matrixWorld;
        if (w === "vertex") {
          let g = -1, x = 1 / 0, L = null;
          if (o.face) {
            const B = [o.face.a, o.face.b, o.face.c];
            for (const G of B) {
              const V = new e.Vector3(m.getX(G), m.getY(G), m.getZ(G)).applyMatrix4(M), F = V.distanceTo(o.point);
              F < x && (x = F, g = G, L = [V.x, V.y, V.z]);
            }
          } else
            for (let B = 0; B < m.count; B++) {
              const G = new e.Vector3(m.getX(B), m.getY(B), m.getZ(B)).applyMatrix4(M), V = G.distanceTo(o.point);
              V < x && (x = V, g = B, L = [G.x, G.y, G.z]);
            }
          if (L)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: f,
              index: g,
              point: L
            };
        }
        if (w === "edge" && o.face) {
          const g = new e.Vector3(m.getX(o.face.a), m.getY(o.face.a), m.getZ(o.face.a)).applyMatrix4(M), x = new e.Vector3(m.getX(o.face.b), m.getY(o.face.b), m.getZ(o.face.b)).applyMatrix4(M), L = new e.Vector3(m.getX(o.face.c), m.getY(o.face.c), m.getZ(o.face.c)).applyMatrix4(M), B = (P, c, S) => {
            const W = new e.Line3(c, S), j = new e.Vector3();
            return W.closestPointToPoint(P, !0, j), { dist: P.distanceTo(j), point: j, segment: [c, S] };
          }, G = B(o.point, g, x), V = B(o.point, x, L), F = B(o.point, L, g), A = [G, V, F].reduce((P, c) => c.dist < P.dist ? c : P);
          return {
            type: "edge",
            mode: "edge",
            objectId: f,
            point: [A.point.x, A.point.y, A.point.z],
            edge: [
              [A.segment[0].x, A.segment[0].y, A.segment[0].z],
              [A.segment[1].x, A.segment[1].y, A.segment[1].z]
            ]
          };
        }
        if (w === "face" && o.face) {
          const g = new e.Vector3(m.getX(o.face.a), m.getY(o.face.a), m.getZ(o.face.a)).applyMatrix4(M), x = new e.Vector3(m.getX(o.face.b), m.getY(o.face.b), m.getZ(o.face.b)).applyMatrix4(M), L = new e.Vector3(m.getX(o.face.c), m.getY(o.face.c), m.getZ(o.face.c)).applyMatrix4(M), B = new e.Vector3().add(g).add(x).add(L).divideScalar(3), G = o.face.normal.clone().transformDirection(M);
          return {
            type: "face",
            mode: "face",
            objectId: f,
            faceIndex: o.faceIndex,
            point: [B.x, B.y, B.z],
            normal: [G.x, G.y, G.z],
            vertices: [
              [g.x, g.y, g.z],
              [x.x, x.y, x.z],
              [L.x, L.y, L.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(a, y, u, s) {
      if (!this.activeCamera) return null;
      this.pointer.set(a / Math.max(1, u) * 2 - 1, 1 - y / Math.max(1, s) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const w = this.raycaster.intersectObjects(this.content.children, !0);
      if (w.length > 0)
        return [w[0].point.x, w[0].point.y, w[0].point.z];
      const r = new e.Plane(new e.Vector3(0, 1, 0), 0), o = new e.Vector3();
      return this.raycaster.ray.intersectPlane(r, o) ? [o.x, o.y, o.z] : null;
    }
  };
}
const we = ["high", "balanced", "low"], dr = 25, Te = 30, mr = 0.6;
function Pe(t = "balanced") {
  return { quality: t, samples: [], downgraded: !1 };
}
function ur(t) {
  const e = we.indexOf(t);
  return e < 0 || e >= we.length - 1 ? null : we[e + 1];
}
function hr(t, e) {
  if (!Number.isFinite(e) || e < 0 || (t.samples.push(e), t.samples.length > Te && t.samples.shift(), t.samples.length < Te) || t.samples.filter((C) => C > dr).length / t.samples.length < mr) return null;
  const i = ur(t.quality);
  return i ? (t.quality = i, t.downgraded = !0, t.samples = [], i) : null;
}
function fr(t, e) {
  return t.quality = e, t.samples = [], t.downgraded = !1, t;
}
function pr(t) {
  const { THREE: e, FBXLoader: d, GLTFLoader: i, OBJLoader: C, PLYLoader: p, STLLoader: v, neutral: b, wire: O, checkerMaterial: k, objectMaterial: T, applyModelMaterial: _, disposeObject: D, textureFor: K, cardMesh: N, generatePointField: q, sampleCamera: I, sampleObjectTransform: Z } = t;
  return {
    render(a, y, u, s, w, r = /* @__PURE__ */ new Map(), o = 0, h = !1, n = "camera", f = "subject", l = null, m = null) {
      const M = !h || (a.render_mode || "") === "beauty";
      if (M !== this.studioEnabled) {
        this.studioEnabled = M, st(e, this.scene, this.renderer, this.studio, M);
        for (const c of this.flatLights || []) c.visible = !M;
      }
      if (this.disposed) return;
      (this.canvas.width !== s || this.canvas.height !== w) && this.renderer.setSize(s, w, !1);
      const g = a.viewport_bg_sequence && a.viewport_bg_sequence.length ? a.viewport_bg_sequence[o % a.viewport_bg_sequence.length] : a.viewport_bg_image || "";
      if (g) {
        this.bgImageUrl = g;
        const c = this.bgTextureCache.get(g);
        if (c)
          this.bgTextureCache.delete(g), this.bgTextureCache.set(g, c), this.bgTexture = c, this.scene.background = c;
        else if (!this.bgTextureLoads.has(g)) {
          const S = this.bgLoadGeneration;
          this.bgTextureLoads.set(g, S), new e.TextureLoader().load(g, (j) => {
            if (this.bgTextureLoads.delete(g), this.disposed || S !== this.bgLoadGeneration) {
              j.dispose();
              return;
            }
            for (j.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(g, j); this.bgTextureCache.size > 8; ) {
              const U = [...this.bgTextureCache.keys()].find((Q) => Q !== this.bgImageUrl);
              if (!U) break;
              const $ = this.bgTextureCache.get(U);
              this.bgTextureCache.delete(U), $?.dispose?.();
            }
            this.bgImageUrl === g && (this.bgTexture = j, this.scene.background = j), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(g);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const S of new Set(this.bgTextureCache.values())) S.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const c = a.viewport_bg_color && a.viewport_bg_color !== De;
        this.scene.background = this.studioEnabled && !c ? this.studio.sky : new e.Color(a.viewport_bg_color || De);
      }
      const x = JSON.stringify([
        a.render_mode,
        a.card_fit,
        a.point_density,
        a.point_spread,
        !!a.show_wireframe,
        !!a.show_vertices,
        a.objects.map((c) => {
          const { position: S, rotation: W, keyframes: j, size: U, ...$ } = c;
          return c.type === "card" && ($.size = U), $;
        })
      ]), L = [...u.entries()].map(([c, S]) => `${c}:${S?.src || ""}`).join("|"), B = [...r.entries()].map(([c, S]) => `${c}:${S}`).join("|");
      (x !== this.sceneKey || L !== this.mediaSignature || B !== this.modelSignature) && (this.sceneKey = x, this.mediaSignature = L, this.modelSignature = B, this.rebuild(a, u, r));
      for (const c of this.models.values())
        c.mixer && c.duration > 0 && c.mixer.setTime(o / Math.max(1, a.fps || 24) % c.duration);
      for (const c of a.objects) {
        const S = this.objectNodes.get(c.id);
        if (!S) continue;
        const W = c.keyframes?.length ? Z(c, o) : c;
        S.position.fromArray(W.position || [0, 0, 0]), S.rotation.set(...(W.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), c.type !== "card" && c.type !== "null" && S.scale.fromArray(W.size || [1, 1, 1]), c.type === "null" && (S.visible = h ? !0 : a.show_helper_axes !== !1);
      }
      this.path.visible = !h;
      const G = a.show_grid !== !1 && a.render_mode !== "point_field";
      this.content.traverse((c) => {
        c.userData.omnicamCaptureGuide && (c.visible = h ? !!a.playblast_grid : G);
      });
      const V = `${n}:${m ?? ""}:${a.__omnicamRevision ?? JSON.stringify([
        a.active_camera_id,
        (a.cameras || []).map((c) => [c.id, c.keyframes?.length, c.keyframes?.map((S) => [S.frame, S.camera?.position, S.camera?.target])]),
        (a.objects || []).map((c) => [c.id, c.keyframes?.length, c.keyframes?.map((S) => [S.frame, S.transform?.position])])
      ])}`;
      if (V !== this.pathKey && (this.pathKey = V, this.rebuildPath(a, n, m)), this.updateLiveCameras(a, o, h, a.view_mode || "camera", n, m), this.liveCameras.visible = !h, !h) {
        const c = a.show_camera_paths !== !1, S = a.show_camera_gizmos !== !1, W = a.show_look_at !== !1;
        for (const j of [this.path, this.liveCameras])
          j.traverse((U) => {
            const $ = U.userData.omnicamWidget;
            $ === "path" ? U.visible = c : $ === "gizmo" ? U.visible = S : $ === "lookat" && (U.visible = W);
          });
      }
      h ? this.selectionGroup.visible = !1 : (this.updateSelection(a, n, f, l, `${a.__omnicamRevision ?? "legacy"}:${o}`), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey && (this.contentShadowKey = this.sceneKey, this.content.traverse((c) => {
        !c.isMesh || c.userData.omnicamCaptureGuide || (c.castShadow = !0, c.receiveShadow = !0);
      })), this.content.visible = !0;
      const F = s / Math.max(1, w), A = this.configureCamera(y, F);
      this.activeCamera = A, this.path.traverse((c) => {
        c.userData.omnicamBillboard && c.quaternion.copy(A.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, s, w);
      const P = performance.now();
      if (this.renderer.render(this.scene, A), !h && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Pe(this.studio?.quality);
        const c = hr(this.qualityMonitor, performance.now() - P);
        c && (Ae(this.studio, this.renderer, c), this.onQualityDowngrade?.(c));
      }
    },
    setViewportQuality(a) {
      Ae(this.studio, this.renderer, a), this.qualityMonitor = fr(this.qualityMonitor || Pe(a), a);
    },
    dispose() {
      if (!this.disposed) {
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), D(this.content), D(this.path), D(this.liveCameras), D(this.selectionGroup);
        for (const a of new Set(this.bgTextureCache.values())) a.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const a of this.models.values()) D(a.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
const re = new Ce({ color: 9212571, roughness: 0.9, metalness: 0 }), Le = new de({ color: 11449792, wireframe: !0 });
function Se() {
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
  ]), e = new je(t, 2, 2, Ke);
  return e.wrapS = e.wrapT = Re, e.repeat.set(8, 8), e.colorSpace = he, e.needsUpdate = !0, new Ce({ map: e, roughness: 0.85, metalness: 0 });
}
function gr(t, e) {
  if (e === "wireframe" || t.material_mode === "wireframe") {
    const i = Le.clone();
    return t.color && (i.color = new ce(t.color)), i;
  }
  if (t.material_mode === "checker") return Se();
  const d = re.clone();
  return t.color && (d.color = new ce(t.color)), d;
}
function wr(t, e) {
  t.traverse((d) => {
    if (d.isMesh) {
      if (d.userData.omnicamOriginalMaterial || (d.userData.omnicamOriginalMaterial = d.material), d.userData.omnicamOverrideMaterial) {
        const i = Array.isArray(d.material) ? d.material : [d.material];
        for (const C of i)
          C?.map?.dispose?.(), C?.dispose?.();
        d.userData.omnicamOverrideMaterial = !1;
      }
      e === "textured" ? d.material = d.userData.omnicamOriginalMaterial : (d.material = e === "checker" ? Se() : e === "wireframe" ? Le.clone() : re.clone(), d.userData.omnicamOverrideMaterial = !0);
    }
  });
}
function ve(t, e = !1) {
  t.traverse((d) => {
    if (d.userData.omnicamModelResource && !e) return;
    d.geometry?.dispose?.();
    const i = Array.isArray(d.material) ? d.material : [d.material];
    for (const C of i)
      C?.map?.dispose?.(), C?.dispose?.();
  });
}
function it(t) {
  if (!t) return null;
  const e = t instanceof HTMLVideoElement ? new He(t) : new Qe(t);
  return e.colorSpace = he, e.needsUpdate = !0, e;
}
function yr(t, e, d) {
  const [i, C] = t.size || [2, 3], p = new Y(), v = new te(new ye(i, C), new de({ color: 1448482, side: le, transparent: !0, opacity: 0.85 }));
  v.frustumCulled = !1, p.add(v);
  const b = it(e);
  if (!b) return p;
  const O = e.videoWidth || e.naturalWidth || e.width || i, k = e.videoHeight || e.naturalHeight || e.height || C, T = O / Math.max(1, k), _ = i / Math.max(0.01, C);
  let D = i, K = C;
  d === "contain" ? T > _ ? K = i / T : D = C * T : d === "cover" && (T > _ ? (b.repeat.x = _ / T, b.offset.x = (1 - b.repeat.x) * 0.5) : (b.repeat.y = T / _, b.offset.y = (1 - b.repeat.y) * 0.5));
  const N = new te(
    new ye(D, K),
    new de({
      color: 16777215,
      map: b,
      side: le,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return N.frustumCulled = !1, N.position.z = 2e-3, p.add(N), p.frustumCulled = !1, p;
}
class Mr {
  constructor(e = () => {
  }, d = () => {
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
    }), this.renderer.setPixelRatio(1), this.renderer.outputColorSpace = he, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = Ie, this.scene = new Ye(), this.scene.background = new ce(1184274), this.scene.add(new We(16777215, 3159099, 2.2));
    const i = new Oe(16777215, 2.4);
    i.position.set(5, 8, 4), this.scene.add(i), this.flatLights = [this.scene.children.at(-2), i], this.studio = Xt(xe, this.renderer, Rt), this.scene.add(this.studio.group), this.studioEnabled = !0, st(xe, this.scene, this.renderer, this.studio, !0), this.content = new Y(), this.scene.add(this.content), this.path = new Y(), this.scene.add(this.path), this.liveCameras = new Y(), this.scene.add(this.liveCameras), this.selectionGroup = new Y(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new Ue(35, 16 / 9, 0.01, 1e4), this.orthographic = new Ne(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = d, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new Xe(), this.pointer = new Je(), this.activeCamera = this.perspective;
  }
  async loadModel(e, d, i = "glb") {
    const C = `${i}:${d}`;
    if (!(!d || this.modelLoads.get(e) === C)) {
      this.modelLoads.set(e, C);
      try {
        let p, v = [];
        if (i === "obj") p = await new et().loadAsync(d);
        else if (i === "fbx")
          p = await new tt().loadAsync(d), v = p.animations || [];
        else if (i === "stl") p = new te(await new rt().loadAsync(d), re.clone());
        else if (i === "ply") {
          const s = await new at().loadAsync(d);
          s.index ? (s.getAttribute("normal") || s.computeVertexNormals(), p = new te(s, re.clone())) : p = new $e(s, new qe({ color: 11449792, size: 0.025 }));
        } else {
          const s = await new ot().loadAsync(d);
          p = s.scene, v = s.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== C) {
          ve(p, !0);
          return;
        }
        const b = this.models.get(e);
        b && ve(b.scene, !0), p.traverse((s) => {
          if (s.userData.omnicamModelResource = !0, s.frustumCulled = !1, s.isMesh && (s.frustumCulled = !1, s.material)) {
            const w = Array.isArray(s.material) ? s.material : [s.material];
            for (const r of w)
              r.side = le;
          }
          s.isPoints && (s.frustumCulled = !1), s.isSkinnedMesh && (s.frustumCulled = !1, s.computeBoundingBox?.(), s.computeBoundingSphere?.());
        });
        let O = 0, k = 0, T = 0, _ = 0;
        p.traverse((s) => {
          s.isMesh && (O += 1, _ += s.geometry?.getAttribute?.("position")?.count || 0), s.isPoints && (k += 1), s.isBone && (T += 1);
        });
        const D = new Y();
        if (D.frustumCulled = !1, D.add(p), !O && !k && T) {
          const s = new Ze(p);
          s.material.depthTest = !1, s.material.opacity = 0.9, s.material.transparent = !0, s.renderOrder = 10, s.userData.omnicamModelResource = !0, D.add(s);
        }
        D.updateMatrixWorld(!0);
        const K = new ze().setFromObject(D), N = K.getSize(new Me()), q = Math.max(N.x, N.y, N.z), I = Number.isFinite(q) && q > 1e-6 ? 2.5 / q : 1, Z = K.getCenter(new Me());
        D.scale.setScalar(I), D.position.set(-Z.x * I, -K.min.y * I, -Z.z * I);
        const a = new Y();
        a.frustumCulled = !1, a.add(D);
        const y = v.length ? new Fe(p) : null;
        y && y.clipAction(v[0]).play();
        const u = { url: d, format: i, scene: a, mixer: y, clips: v, selectedClip: 0, duration: v[0]?.duration || 0, meshes: O, points: k, bones: T, vertices: _, animations: v.length, normalizationScale: I };
        this.models.set(e, u), this.onModelLoaded({ id: e, format: i, meshes: O, points: k, bones: T, vertices: _, animations: v.length, animationNames: v.map((s, w) => s.name || `Clip ${w + 1}`), duration: u.duration, normalizationScale: I }), this.sceneKey = "", this.invalidate();
      } catch (p) {
        this.modelLoads.get(e) === C && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${i.toUpperCase()} ${e}`, p);
        const v = p?.message?.includes("FBX version not supported") || p?.message?.includes("6100") || p?.message?.includes("6000"), b = v ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : p?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: i, error: b, isLegacyFBX: v });
      }
    }
  }
}
const ne = { THREE: xe, FBXLoader: tt, GLTFLoader: ot, OBJLoader: et, PLYLoader: at, STLLoader: rt, neutral: re, wire: Le, checkerMaterial: Se, objectMaterial: gr, applyModelMaterial: wr, disposeObject: ve, textureFor: it, cardMesh: yr, generatePointField: $t, sampleCamera: qt, sampleObjectTransform: Kt };
Object.assign(
  Mr.prototype,
  ir(ne),
  cr(ne),
  lr(ne),
  pr(ne)
);
async function xr(t, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const d of ["vp9", "vp8"])
    try {
      if (await ie(Et(d, { width: t, height: e }), 5e3, `Checking ${d} support`)) return d;
    } catch {
    }
  return null;
}
function ie(t, e, d) {
  let i;
  return Promise.race([
    t,
    new Promise((C, p) => {
      i = setTimeout(() => p(new Error(`${d} timed out`)), e);
    })
  ]).finally(() => clearTimeout(i));
}
async function Br(t, e, d, i, C) {
  const p = await xr(t.width, t.height);
  if (!p) throw new Error("No supported WebCodecs WebM encoder");
  const v = new Yt({ format: new Qt(), target: new Zt() }), b = new Jt(t, { codec: p, quality: new Ht("high"), keyFrameInterval: 1 });
  v.addVideoTrack(b, { frameRate: d }), await ie(v.start(), 1e4, "Starting deterministic encoder");
  try {
    const O = 1 / d;
    for (let k = 0; k < e; k++) {
      if (C?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await i(k), await ie(b.add(k * O, O, { keyFrame: k % d === 0 }), 1e4, `Encoding frame ${k + 1}`);
    }
    await ie(v.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (O) {
    throw v.state !== "finalized" && await v.cancel().catch(() => {
    }), O;
  }
  return new Blob([v.target.buffer], { type: await v.getMimeType() });
}
export {
  Mr as OmniWebGLViewport,
  Br as encodeDeterministicPlayblast,
  xr as supportsDeterministicEncoding
};
