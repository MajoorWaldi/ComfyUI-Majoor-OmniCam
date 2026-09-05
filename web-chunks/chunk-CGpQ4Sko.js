import { G as E, D as _e, M as oe, P as fe, a as Me, S as ot, b as st, C as at, c as he, E as nt, A as it, d as ce, N as ct, e as ke, f as lt, B as Ae, g as dt, h as ut, i as mt, j as ht, k as pt, l as ft, m as Oe, n as le, F as gt, o as wt, H as De, L as yt, p as xt, q as Mt, r as bt, s as vt, t as Ct, u as Bt, v as de, O as Fe, w as Te, x as ze, y as St, z as je, I as We, Q as Lt, J as Ne, K as Ie, T as Ue, U as Vt, V as qe, W as Re, X as Pt, Y as Gt, Z as $e, _ as _t, $ as kt, a0 as be, a1 as ge, a2 as Ke, a3 as Xe, a4 as At, a5 as Ot, a6 as Dt, a7 as Ft, a8 as Tt, a9 as Ye, aa as Qe, ab as Ze, ac as Je, ad as He } from "./chunk-BNTXm8ZY.js";
import { ad as zt, N as jt, s as Wt, f as Nt } from "./chunk-COnft398.js";
import { q as It, a as Le, s as Ee, D as Ve, c as Ut, b as qt, d as Rt } from "./chunk-D1Oq610x.js";
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
  ConeGeometry: pt,
  CylinderGeometry: ft,
  DataTexture: Oe,
  DirectionalLight: _e,
  DoubleSide: le,
  EquirectangularReflectionMapping: nt,
  Float32BufferAttribute: gt,
  GridHelper: wt,
  Group: E,
  HemisphereLight: De,
  Line: yt,
  Line3: xt,
  LineBasicMaterial: Mt,
  LineDashedMaterial: bt,
  LineSegments: vt,
  MathUtils: Ct,
  Matrix4: Bt,
  Mesh: oe,
  MeshBasicMaterial: de,
  MeshStandardMaterial: Me,
  NoToneMapping: ct,
  OrthographicCamera: Fe,
  PCFSoftShadowMap: Te,
  PMREMGenerator: st,
  PerspectiveCamera: ze,
  Plane: St,
  PlaneGeometry: fe,
  Points: je,
  PointsMaterial: We,
  Quaternion: Lt,
  RGBAFormat: Ne,
  Raycaster: Ie,
  RepeatWrapping: Ue,
  RingGeometry: Vt,
  SRGBColorSpace: he,
  Scene: qe,
  ShadowMaterial: ot,
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
function Jt(t, { position: e, forward: i, up: l, color: v, scale: f = 1, active: S = !0 }) {
  const B = new t.Group(), z = S ? 0.95 : 0.5, G = new t.MeshBasicMaterial({
    color: v,
    transparent: !0,
    opacity: z,
    depthTest: !1
  }), O = new t.Mesh(new t.BoxGeometry(0.34, 0.24, 0.42), G);
  O.renderOrder = 912, B.add(O);
  const _ = new t.Mesh(new t.ConeGeometry(0.17, 0.26, 20), G);
  return _.rotation.x = -Math.PI / 2, _.position.z = -0.32, _.renderOrder = 912, B.add(_), B.scale.setScalar(f), B.position.copy(e), B.up.copy(l), B.lookAt(e.clone().add(i)), B;
}
function Ht(t, { position: e, color: i = 15903035, radius: l = 0.28, bold: v = !1 }) {
  const f = new t.Group(), S = v ? 16773544 : i, B = new t.LineBasicMaterial({ color: S, transparent: !0, opacity: v ? 1 : 0.95, depthTest: !1 }), z = (_) => {
    const A = [];
    for (let Z = 0; Z <= 48; Z++) {
      const Y = Z / 48 * Math.PI * 2;
      A.push(new t.Vector3(Math.cos(Y) * _, Math.sin(Y) * _, 0));
    }
    const X = new t.Line(new t.BufferGeometry().setFromPoints(A), B);
    return X.renderOrder = 915, X;
  };
  if (f.add(z(l)), v) {
    f.add(z(l * 1.18));
    const _ = new t.Mesh(
      new t.RingGeometry(0, l * 0.3, 16),
      new t.MeshBasicMaterial({ color: S, transparent: !0, opacity: 1, depthTest: !1 })
    );
    _.renderOrder = 916, f.add(_);
  }
  const G = l * 1.55, O = new t.LineSegments(
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
    B
  );
  return O.renderOrder = 915, f.add(O), f.position.copy(e), f.userData.omnicamBillboard = !0, f;
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
  const i = new t.LineSegments(
    new t.WireframeGeometry(e.geometry),
    new t.LineBasicMaterial({ color: ye, opacity: 0.45, transparent: !0 })
  );
  return { overlay: me(i), parent: e };
}
function tr(t, e) {
  const i = new t.PointsMaterial({ color: ye, size: 0.05, sizeAttenuation: !0 });
  if (!ue(e)) {
    const _ = new t.Points(e.geometry, i);
    return { overlay: me(_), parent: e };
  }
  const l = e.geometry.getAttribute("position")?.count || 0, v = Math.max(1, Math.ceil(l / Et)), f = Math.ceil(l / v), S = new Float32Array(f * 3), B = new t.BufferGeometry();
  B.setAttribute("position", new t.Float32BufferAttribute(S, 3));
  const z = new t.Points(B, i);
  et(z, e);
  const G = new t.Vector3(), O = B.getAttribute("position");
  return z.onBeforeRender = () => {
    for (let _ = 0; _ < f; _++)
      e.getVertexPosition(_ * v, G), O.setXYZ(_, G.x, G.y, G.z);
    O.needsUpdate = !0;
  }, { overlay: me(z), parent: e.parent || e };
}
function rr(t, e, i) {
  const l = ue(e) ? new t.SkinnedMesh(e.geometry.clone(), i) : new t.Mesh(e.geometry.clone(), i);
  return ue(e) && (l.bindMode = e.bindMode, l.bind(e.skeleton, e.bindMatrix)), l.matrixAutoUpdate = !1, l.matrix.copy(e.matrixWorld), l.frustumCulled = !1, l;
}
function or(t, e, { wireframe: i = !1, vertices: l = !1 } = {}) {
  if (!i && !l) return;
  const v = [];
  e.traverse((f) => {
    f.isMesh && f.geometry && !f.userData.omnicamHelper && v.push(f);
  });
  for (const f of v) {
    if (i) {
      const { overlay: S, parent: B } = er(t, f);
      B.add(S);
    }
    if (l) {
      const { overlay: S, parent: B } = tr(t, f);
      B.add(S);
    }
  }
}
function sr(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: f, STLLoader: S, neutral: B, wire: z, checkerMaterial: G, objectMaterial: O, applyModelMaterial: _, disposeObject: A, textureFor: J, cardMesh: X, generatePointField: Z, sampleCamera: Y, sampleObjectTransform: ee } = t;
  return {
    removeModel(x) {
      const y = this.models.get(x);
      y && A(y.scene, !0), this.models.delete(x), this.modelLoads.delete(x), this.sceneKey = "";
    },
    selectAnimation(x, y) {
      const o = this.models.get(x);
      !o?.mixer || !o.clips.length || (o.selectedClip = Math.max(0, Math.min(o.clips.length - 1, Number(y) || 0)), o.duration = o.clips[o.selectedClip].duration || 0, o.mixer.stopAllAction(), o.mixer.clipAction(o.clips[o.selectedClip]).play(), this.invalidate());
    },
    rebuild(x, y, o) {
      this.content.traverse((r) => {
        for (const s of [...r.children])
          s.userData.omnicamHelper && (r.remove(s), A(s, !0));
      }), A(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const a = x.render_mode, d = new e.GridHelper(120, 120, 7829367, 3881787);
      if (d.userData.omnicamCaptureGuide = !0, d.frustumCulled = !1, this.content.add(d), ["omni_ref", "point_field"].includes(a)) {
        const { points: r, colors: s } = Z(x.point_density || "balanced", x.point_spread || "all_views", x.point_color || null);
        if (r.length > 0) {
          const w = new e.BufferGeometry();
          w.setAttribute("position", new e.Float32BufferAttribute(r, 3)), w.setAttribute("color", new e.Float32BufferAttribute(s, 3));
          const m = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), g = new e.Points(w, m);
          g.frustumCulled = !1, this.content.add(g);
        }
      }
      if (!["grid", "point_field"].includes(a))
        for (const r of x.objects) {
          if (r.enabled === !1) continue;
          const s = r.size || [1, 1, 1];
          let w;
          if (r.type === "glb" || r.type === "model") {
            const m = o.get(r.id), g = this.models.get(r.id), u = r.format || (r.type === "glb" ? "glb" : "");
            m && (g?.url !== m || g?.format !== u) && this.loadModel(r.id, m, u), g?.url === m ? (w = g.scene, _(w, r.material_mode || "textured")) : w = new e.Mesh(new e.BoxGeometry(s[0], s[1], s[2] || 1), z.clone());
          } else if (r.type === "sphere") w = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), O(r, a));
          else if (r.type === "ground") w = new e.Mesh(new e.BoxGeometry(1, 1, 1), O(r, a));
          else if (r.type === "card")
            w = r.material_mode && r.material_mode !== "textured" ? new e.Mesh(new e.PlaneGeometry(s[0], s[1]), O(r, a)) : X(r, y.get(r.id), x.card_fit || "contain");
          else if (r.type === "null") {
            const m = new e.AxesHelper(0.5);
            m.position.fromArray(r.position || [0, 0, 0]), m.userData.omnicamId = r.id, m.frustumCulled = !1, this.objectNodes.set(r.id, m), this.content.add(m);
            continue;
          } else
            w = new e.Mesh(new e.BoxGeometry(1, 1, 1), O(r, a));
          w.position.fromArray(r.position || [0, 0, 0]), w.rotation.set(...(r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), r.type !== "card" && w.scale.fromArray(s), w.userData.omnicamId = r.id, w.frustumCulled = !1, w.traverse((m) => {
            m.frustumCulled = !1, m.userData.omnicamId = r.id;
          }), or(e, w, { wireframe: x.show_wireframe, vertices: x.show_vertices }), this.objectNodes.set(r.id, w), this.content.add(w);
        }
    },
    rebuildPath(x, y = "camera", o = null, a = "") {
      A(this.path), this.path.clear();
      const d = a === "camera" ? x.active_camera_id : null, r = [
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
      (x.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: x.keyframes || [] }]).forEach((m, g) => {
        const u = m.keyframes || [];
        if (u.length === 0 || m.id === d) return;
        const n = m.color ? { line: new e.Color(m.color), marker: new e.Color(m.color), frustum: new e.Color(m.color) } : r[g % r.length], h = m.id === x.active_camera_id, V = h && y === "camera";
        if (u.length >= 2) {
          const C = u[0].frame, M = u[u.length - 1].frame, p = Math.max(32, Math.min(256, M - C + 1)), L = { ...m, keyframes: u, objects: x.objects }, D = Array.from({ length: p }, (R, P) => {
            const q = C + (M - C) * P / Math.max(1, p - 1);
            return new e.Vector3().fromArray(Y(L, q, x.objects).position);
          }), I = new e.CatmullRomCurve3(D, !1, "centripetal"), k = V ? 0.06 : h ? 0.045 : 0.025, F = new e.MeshBasicMaterial({
            color: n.line,
            transparent: !0,
            opacity: h ? 1 : 0.55,
            depthTest: !1
          }), j = new e.Mesh(new e.TubeGeometry(I, Math.max(48, p), k, 8, !1), F);
          if (j.renderOrder = 900, j.userData.omnicamWidget = "path", this.path.add(j), h) {
            const R = new e.Mesh(
              new e.TubeGeometry(I, Math.max(48, p), k * (V ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: n.line, transparent: !0, opacity: V ? 0.3 : 0.18, depthTest: !1 })
            );
            R.renderOrder = 899, R.userData.omnicamWidget = "path", this.path.add(R);
          }
        }
        for (const C of u) {
          const M = new e.Mesh(
            new e.SphereGeometry(h ? 0.13 : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: n.marker, depthTest: !1 })
          );
          M.position.fromArray(C.camera.position), M.renderOrder = 910, M.userData.omnicamPathKey = { cameraId: m.id, frame: C.frame }, M.userData.omnicamWidget = "path", this.path.add(M);
          const p = new e.Vector3().fromArray(C.camera.position), L = new e.Vector3().fromArray(C.camera.target || [0, 0, 0]), D = h && o != null && C.frame === o;
          if (D) {
            const I = L.clone().sub(p).normalize();
            let k = new e.Vector3().crossVectors(I, new e.Vector3(0, 1, 0));
            k.lengthSq() < 1e-8 ? k.set(1, 0, 0) : k.normalize();
            const F = new e.Vector3().crossVectors(k, I).normalize(), j = e.MathUtils.clamp(p.distanceTo(L) * 0.08, 0.25, 0.8), R = C.camera.camera_type === "orthographic" ? j * 0.55 : j * Math.tan(e.MathUtils.degToRad(C.camera.fov || 35) * 0.5), P = R * (x.width || 16) / Math.max(1, x.height || 9), q = p.clone().addScaledVector(I, j), $ = [
              q.clone().addScaledVector(k, -P).addScaledVector(F, -R),
              q.clone().addScaledVector(k, P).addScaledVector(F, -R),
              q.clone().addScaledVector(k, P).addScaledVector(F, R),
              q.clone().addScaledVector(k, -P).addScaledVector(F, R)
            ], c = [];
            for (const T of $) c.push(p, T);
            for (let T = 0; T < 4; T++) c.push($[T], $[(T + 1) % 4]);
            const b = new e.BufferGeometry().setFromPoints(c), W = new e.LineSegments(b, new e.LineBasicMaterial({
              color: n.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            W.userData.omnicamWidget = "gizmo", this.path.add(W);
            const N = Jt(e, {
              position: p,
              forward: I,
              up: F,
              color: n.marker,
              scale: e.MathUtils.clamp(j * 1.15, 0.35, 1.6),
              active: h
            });
            N.userData.omnicamWidget = "gizmo", this.path.add(N);
          }
          if (D) {
            const I = Ht(e, {
              position: L,
              radius: e.MathUtils.clamp(p.distanceTo(L) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            I.userData.omnicamWidget = "lookat", this.path.add(I);
            const k = new e.Line(
              new e.BufferGeometry().setFromPoints([p.clone(), L.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            k.renderOrder = 914, k.userData.omnicamWidget = "lookat", this.path.add(k);
          }
        }
      });
      const w = [16742005, 52937, 16632686, 7101671, 14774357];
      (x.objects || []).forEach((m, g) => {
        const u = m.keyframes || [];
        if (u.length < 2) return;
        const n = m.color ? new e.Color(m.color) : w[g % w.length], h = u.map((M) => new e.Vector3().fromArray(M.transform?.position || [0, 0, 0])), V = new e.CatmullRomCurve3(h, !1, "centripetal"), C = new e.Mesh(
          new e.TubeGeometry(V, Math.max(32, u.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: n, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        C.renderOrder = 900, C.userData.omnicamWidget = "path", this.path.add(C);
        for (const M of u) {
          const p = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: n, depthTest: !1 })
          );
          p.position.fromArray(M.transform?.position || [0, 0, 0]), p.renderOrder = 910, p.userData.omnicamWidget = "path", this.path.add(p);
        }
      });
    }
  };
}
function ar(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: f, STLLoader: S, neutral: B, wire: z, checkerMaterial: G, objectMaterial: O, applyModelMaterial: _, disposeObject: A, textureFor: J, cardMesh: X, generatePointField: Z, sampleCamera: Y, sampleObjectTransform: ee, hasOutlineMesh: x } = t;
  return {
    updateLiveCameras(y, o, a, d, r = "camera", s = null) {
      if (A(this.liveCameras), this.liveCameras.clear(), a) return;
      const w = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (y.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: y.keyframes || [] }]).forEach((g, u) => {
        const n = g.color ? { line: new e.Color(g.color), marker: new e.Color(g.color), frustum: new e.Color(g.color), body: new e.Color(g.color).multiplyScalar(0.35) } : w[u % w.length], h = g.id === y.active_camera_id, V = h && r === "camera", C = d === "camera" && h, M = Y(g, o, y.objects), p = new e.Vector3().fromArray(M.position || [0, 0, 0]), L = new e.Vector3().fromArray(M.target || [0, 0, 0]), D = L.clone().sub(p), I = D.length();
        I < 1e-4 ? D.set(0, 0, -1) : D.normalize();
        let k = new e.Vector3(0, 1, 0), F = new e.Vector3().crossVectors(D, k);
        F.lengthSq() < 1e-6 && (k = new e.Vector3(0, 0, 1), F = new e.Vector3().crossVectors(D, k)), F.normalize();
        let j = new e.Vector3().crossVectors(F, D).normalize();
        if (M.roll) {
          const P = e.MathUtils.degToRad(M.roll);
          F.applyAxisAngle(D, P), j.applyAxisAngle(D, P);
        }
        const R = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!C) {
          const P = new e.Group(), q = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: n.body, roughness: 0.4, metalness: 0.8 })
          );
          q.position.set(0, 0, -0.11), P.add(q);
          const $ = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          $.rotateX(Math.PI / 2);
          const c = new e.Mesh(
            $,
            new e.MeshStandardMaterial({ color: n.marker, roughness: 0.2, metalness: 0.9 })
          );
          c.position.set(0, 0, 0.05), P.add(c);
          const b = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: h ? 16729156 : n.marker })
          );
          b.position.set(0, 0.07, -0.08), P.add(b);
          const W = new e.Matrix4().makeBasis(F, j, D.clone().negate());
          P.quaternion.setFromRotationMatrix(W), P.position.copy(p), P.userData.omnicamWidget = "gizmo", this.liveCameras.add(P);
          const N = new e.SphereGeometry(0.35, 8, 6), T = new e.Mesh(N, R);
          T.position.copy(p), T.userData = { omnicamType: "camera", omnicamId: g.id }, this.liveCameras.add(T);
          const U = e.MathUtils.clamp(I * 0.25, 0.5, 2.5), Q = M.camera_type === "orthographic" ? 5 / Math.max(0.01, M.zoom || 1) * 0.35 : U * Math.tan(e.MathUtils.degToRad(M.fov || 35) * 0.5), H = Q * (y.width || 16) / Math.max(1, y.height || 9), K = p.clone().addScaledVector(D, U), te = [
            K.clone().addScaledVector(F, -H).addScaledVector(j, -Q),
            K.clone().addScaledVector(F, H).addScaledVector(j, -Q),
            K.clone().addScaledVector(F, H).addScaledVector(j, Q),
            K.clone().addScaledVector(F, -H).addScaledVector(j, Q)
          ], ae = [];
          for (const re of te) ae.push(p, re);
          for (let re = 0; re < 4; re++) ae.push(te[re], te[(re + 1) % 4]);
          const Be = te[2].clone().add(te[3]).multiplyScalar(0.5).clone().addScaledVector(j, Q * 0.25);
          ae.push(te[2], Be, Be, te[3]);
          const rt = new e.BufferGeometry().setFromPoints(ae), Se = new e.LineSegments(rt, new e.LineBasicMaterial({
            color: V ? n.marker : n.frustum,
            linewidth: h ? 2 : 1,
            transparent: !0,
            opacity: h ? 1 : 0.6
          }));
          Se.userData.omnicamWidget = "gizmo", this.liveCameras.add(Se);
        }
        if (I > 0.01) {
          const P = h && r === "camera_target", q = new e.BufferGeometry().setFromPoints([p, L]), $ = new e.Line(q, new e.LineDashedMaterial({
            color: V || P ? 9133302 : n.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: V || P ? 1 : h ? 0.75 : 0.4
          }));
          $.userData.omnicamWidget = "lookat", this.liveCameras.add($);
          const c = P ? 0.12 : V ? 0.11 : 0.08, b = [
            L.clone().add(new e.Vector3(-c, 0, 0)),
            L.clone().add(new e.Vector3(c, 0, 0)),
            L.clone().add(new e.Vector3(0, -c, 0)),
            L.clone().add(new e.Vector3(0, c, 0)),
            L.clone().add(new e.Vector3(0, 0, -c)),
            L.clone().add(new e.Vector3(0, 0, c))
          ], W = new e.BufferGeometry().setFromPoints(b), N = new e.LineSegments(W, new e.LineBasicMaterial({
            color: P || V ? 9133302 : n.marker,
            linewidth: P ? 3 : 1,
            transparent: !0,
            opacity: P || V ? 1 : h ? 0.9 : 0.5
          }));
          N.userData.omnicamWidget = "lookat", this.liveCameras.add(N);
          const T = new e.SphereGeometry(0.28, 8, 6), U = new e.Mesh(T, R);
          if (U.position.copy(L), U.userData = { omnicamType: "camera_target", omnicamId: g.id }, this.liveCameras.add(U), (P || V) && d !== "camera") {
            const Q = new e.RingGeometry(0.14, 0.18, 24);
            Q.rotateX(Math.PI / 2);
            const H = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), K = new e.Mesh(Q, H);
            K.position.copy(L), K.userData.omnicamWidget = "lookat", this.liveCameras.add(K);
          }
        }
        if (h && d !== "camera" && r === "camera") {
          const P = new e.RingGeometry(0.19, 0.24, 32);
          P.rotateX(Math.PI / 2);
          const q = new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 1 }), $ = new e.Mesh(P, q);
          $.position.copy(p), $.userData.omnicamWidget = "gizmo", this.liveCameras.add($);
          const c = new e.RingGeometry(0.28, 0.31, 32);
          c.rotateX(Math.PI / 2);
          const b = new e.Mesh(c, new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          b.position.copy(p), b.userData.omnicamWidget = "gizmo", this.liveCameras.add(b);
        }
      });
    },
    updateSelection(y, o, a, d = null, r = "", s = !1) {
      const w = d ? `${d.mode || ""}:${d.objectId || ""}:${(d.point || []).join(",")}` : "", m = `${o}:${a || ""}:${(y.__selectedObjectIds || []).join(",")}:${r}:${w}:${s ? "ortho" : "persp"}`;
      if (m !== this.selectionKey) {
        if (this.selectionKey = m, A(this.selectionGroup), this.selectionGroup.clear(), o === "object" && a) {
          const g = this.objectNodes.get(a);
          if (g) {
            g.updateMatrixWorld(!0);
            try {
              const u = new e.Box3(), n = [];
              if (g.traverse((h) => {
                h.isBone && n.push(h);
              }), n.length > 0) {
                const h = new e.Vector3();
                for (const V of n)
                  V.getWorldPosition(h), u.expandByPoint(h);
                u.expandByScalar(0.2);
              } else
                u.setFromObject(g);
              if ((s || !x(g)) && !u.isEmpty() && Number.isFinite(u.min.x) && Number.isFinite(u.max.x) && Number.isFinite(u.min.y) && Number.isFinite(u.max.y) && Number.isFinite(u.min.z) && Number.isFinite(u.max.z)) {
                u.expandByScalar(0.04);
                const h = new e.Box3Helper(u, new e.Color(9133302));
                h.material.transparent = !0, h.material.opacity = 0.95, h.material.depthTest = !1, h.renderOrder = 9999, this.selectionGroup.add(h);
              }
            } catch {
            }
            if (y.show_wireframe) {
              let u = 0;
              g.traverse((n) => {
                if (!n.isMesh || !n.geometry || n.userData.omnicamHelper || u >= 64) return;
                const h = rr(e, n, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                h.renderOrder = 9998, this.selectionGroup.add(h), u += 1;
              });
            }
            if (d && d.objectId === a && d.point) {
              if (d.mode === "vertex") {
                const u = new e.SphereGeometry(0.08, 16, 12), n = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), h = new e.Mesh(u, n);
                h.position.fromArray(d.point), h.renderOrder = 1e4, this.selectionGroup.add(h);
                const V = new e.RingGeometry(0.1, 0.15, 24), C = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), M = new e.Mesh(V, C);
                M.position.fromArray(d.point), this.activeCamera && M.quaternion.copy(this.activeCamera.quaternion), M.renderOrder = 1e4, this.selectionGroup.add(M);
              } else if (d.mode === "edge" && d.edge) {
                const [u, n] = d.edge, h = new e.BufferGeometry().setFromPoints([new e.Vector3(...u), new e.Vector3(...n)]), V = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), C = new e.Line(h, V);
                C.renderOrder = 1e4, this.selectionGroup.add(C);
              } else if (d.mode === "face" && d.vertices) {
                const [u, n, h] = d.vertices, V = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...u),
                  new e.Vector3(...n),
                  new e.Vector3(...h)
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
                const p = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...u),
                  new e.Vector3(...n),
                  new e.Vector3(...h),
                  new e.Vector3(...u)
                ]), L = new e.Line(p, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                L.renderOrder = 10001, this.selectionGroup.add(L);
              }
            }
          }
        }
        if (o === "object")
          for (const g of y.__selectedObjectIds || []) {
            if (g === a) continue;
            const u = this.objectNodes.get(g);
            if (u) {
              u.updateMatrixWorld(!0);
              try {
                const n = new e.Box3().setFromObject(u);
                if ((s || !x(u)) && !n.isEmpty() && Number.isFinite(n.min.x)) {
                  n.expandByScalar(0.04);
                  const h = new e.Box3Helper(n, new e.Color(10980346));
                  h.material.transparent = !0, h.material.opacity = 0.35, h.material.depthTest = !1, h.renderOrder = 9997, this.selectionGroup.add(h);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(y) {
      const o = this.objectNodes.get(y);
      if (!o) return [];
      const a = [], d = /* @__PURE__ */ new Set();
      return o.traverse((r) => {
        const s = r.isBone ? r.name : "";
        !s || d.has(s) || a.length >= 256 || (d.add(s), a.push(s));
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
    sampleModelPoint(y, o, a, d = 24) {
      const r = this.objectNodes.get(y);
      if (!r) return null;
      const s = this.models.get(y), w = s?.mixer && s.duration > 0, m = w ? s.mixer.time : null;
      w && (s.mixer.setTime(Math.max(0, a) / Math.max(1, d) % s.duration), r.updateMatrixWorld(!0));
      let g = null;
      if (o) {
        let u = null;
        if (r.traverse((n) => {
          !u && n.isBone && n.name === o && (u = n);
        }), u) {
          const n = new e.Vector3().setFromMatrixPosition(u.matrixWorld);
          g = [n.x, n.y, n.z];
        }
      } else
        g = this.getObjectWorldCenter(y);
      return w && Number.isFinite(m) && (s.mixer.setTime(m), r.updateMatrixWorld(!0)), g;
    },
    getObjectWorldBounds(y) {
      const o = this.objectNodes.get(y);
      if (!o) return null;
      o.updateWorldMatrix(!0, !0);
      const a = new e.Box3().setFromObject(o, !0), d = a.min.toArray(), r = a.max.toArray();
      return !a.isEmpty() && [...d, ...r].every(Number.isFinite) ? { min: d, max: r } : null;
    },
    getObjectWorldCenter(y) {
      const o = this.objectNodes.get(y);
      if (!o) return null;
      o.updateMatrixWorld(!0);
      const a = [];
      if (o.traverse((s) => {
        s.isBone && a.push(s);
      }), a.length > 0) {
        const s = new e.Vector3(), w = new e.Vector3();
        for (const m of a)
          m.getWorldPosition(w), s.add(w);
        return s.divideScalar(a.length), [s.x, s.y, s.z];
      }
      const d = new e.Box3().setFromObject(o);
      if (!d.isEmpty() && Number.isFinite(d.min.x)) {
        const s = d.getCenter(new e.Vector3());
        return [s.x, s.y, s.z];
      }
      const r = new e.Vector3();
      return o.getWorldPosition(r), [r.x, r.y, r.z];
    }
  };
}
function nr(t) {
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: f, STLLoader: S, neutral: B, wire: z, checkerMaterial: G, objectMaterial: O, applyModelMaterial: _, disposeObject: A, textureFor: J, cardMesh: X, generatePointField: Z, sampleCamera: Y, sampleObjectTransform: ee } = t;
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(x) {
      if (!this.path.visible || !this.activeCamera) return null;
      this.pointer.set(x[0] / this.canvas.width * 2 - 1, -(x[1] / this.canvas.height) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const d of this.raycaster.intersectObjects(this.path.children, !0)) {
        const r = zt(d);
        if (r) return { ...r, position: d.object.position.toArray() };
      }
      const y = 16 * Math.min(2, window.devicePixelRatio || 1);
      let o = null;
      const a = new e.Vector3();
      for (const d of this.path.children) {
        const r = d.userData?.omnicamPathKey;
        if (!r || (a.copy(d.position).project(this.activeCamera), a.z < -1 || a.z > 1)) continue;
        const s = (a.x * 0.5 + 0.5) * this.canvas.width, w = (1 - (a.y * 0.5 + 0.5)) * this.canvas.height, m = Math.hypot(x[0] - s, x[1] - w);
        m <= y && (!o || m < o.distance) && (o = { key: r, position: d.position.toArray(), distance: m });
      }
      return o ? { ...o.key, position: o.position } : null;
    },
    configureCamera(x, y) {
      const o = x || defaultCamera(), a = Math.max(5e-3, Number(o.near) || 0.01), d = Math.max(a + 1, Number(o.far) || 1e4);
      let r;
      if (o.camera_type === "orthographic") {
        r = this.orthographic;
        const n = 5 / Math.max(0.01, o.zoom || 1);
        r.left = -n * y, r.right = n * y, r.top = n, r.bottom = -n, r.near = a, r.far = d, r.updateProjectionMatrix();
      } else
        r = this.perspective, r.fov = e.MathUtils.clamp(Number(o.fov) || 35, 1, 175), r.aspect = y, r.near = a, r.far = d, r.updateProjectionMatrix();
      const s = new e.Vector3().fromArray(o.position || [6, 4, 6]), w = new e.Vector3().fromArray(o.target || [0, 1.5, 0]), m = w.clone().sub(s);
      m.lengthSq() < 1e-6 ? m.set(0, 0, -1) : m.normalize();
      let g = o.up ? new e.Vector3().fromArray(o.up) : new e.Vector3(0, 1, 0), u = new e.Vector3().crossVectors(m, g);
      if (u.lengthSq() < 1e-6 && (g = Math.abs(m.y) > 0.9 ? new e.Vector3(0, 0, m.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), u.crossVectors(m, g)), u.normalize(), g.crossVectors(u, m).normalize(), o.roll) {
        const n = e.MathUtils.degToRad(o.roll);
        u.applyAxisAngle(m, n), g.applyAxisAngle(m, n);
      }
      return r.position.copy(s), r.up.copy(g), r.lookAt(w), r.updateMatrixWorld(), r;
    },
    pick(x, y, o, a) {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, o) * 2 - 1, 1 - y / Math.max(1, a) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const d = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const r of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          r.object?.userData?.omnicamType && d.push({
            distance: r.distance,
            type: r.object.userData.omnicamType,
            id: r.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const r of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (r.object?.userData?.omnicamCaptureGuide || r.object?.userData?.omnicamHelper) continue;
          let s = r.object;
          for (; s && !s.userData?.omnicamId; ) s = s.parent;
          s?.userData?.omnicamId && d.push({
            distance: r.distance,
            type: "object",
            id: s.userData.omnicamId
          });
        }
      return d.length ? (d.sort((r, s) => r.distance - s.distance), { type: d[0].type, id: d[0].id }) : null;
    },
    pickSubElement(x, y, o, a, d = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, o) * 2 - 1, 1 - y / Math.max(1, a) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const r = this.raycaster.intersectObjects(this.content.children, !0);
      for (const s of r) {
        let w = s.object, m = s.object;
        for (; w && !w.userData.omnicamId; ) w = w.parent;
        if (!w?.userData.omnicamId || !m.geometry) continue;
        const g = w.userData.omnicamId, n = m.geometry.getAttribute("position");
        if (!n) continue;
        m.updateMatrixWorld(!0);
        const h = m.matrixWorld;
        if (d === "vertex") {
          let V = -1, C = 1 / 0, M = null;
          if (s.face) {
            const p = [s.face.a, s.face.b, s.face.c];
            for (const L of p) {
              const D = new e.Vector3(n.getX(L), n.getY(L), n.getZ(L)).applyMatrix4(h), I = D.distanceTo(s.point);
              I < C && (C = I, V = L, M = [D.x, D.y, D.z]);
            }
          } else
            for (let p = 0; p < n.count; p++) {
              const L = new e.Vector3(n.getX(p), n.getY(p), n.getZ(p)).applyMatrix4(h), D = L.distanceTo(s.point);
              D < C && (C = D, V = p, M = [L.x, L.y, L.z]);
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
        if (d === "edge" && s.face) {
          const V = new e.Vector3(n.getX(s.face.a), n.getY(s.face.a), n.getZ(s.face.a)).applyMatrix4(h), C = new e.Vector3(n.getX(s.face.b), n.getY(s.face.b), n.getZ(s.face.b)).applyMatrix4(h), M = new e.Vector3(n.getX(s.face.c), n.getY(s.face.c), n.getZ(s.face.c)).applyMatrix4(h), p = (F, j, R) => {
            const P = new e.Line3(j, R), q = new e.Vector3();
            return P.closestPointToPoint(F, !0, q), { dist: F.distanceTo(q), point: q, segment: [j, R] };
          }, L = p(s.point, V, C), D = p(s.point, C, M), I = p(s.point, M, V), k = [L, D, I].reduce((F, j) => j.dist < F.dist ? j : F);
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
        if (d === "face" && s.face) {
          const V = new e.Vector3(n.getX(s.face.a), n.getY(s.face.a), n.getZ(s.face.a)).applyMatrix4(h), C = new e.Vector3(n.getX(s.face.b), n.getY(s.face.b), n.getZ(s.face.b)).applyMatrix4(h), M = new e.Vector3(n.getX(s.face.c), n.getY(s.face.c), n.getZ(s.face.c)).applyMatrix4(h), p = new e.Vector3().add(V).add(C).add(M).divideScalar(3), L = s.face.normal.clone().transformDirection(h);
          return {
            type: "face",
            mode: "face",
            objectId: g,
            faceIndex: s.faceIndex,
            point: [p.x, p.y, p.z],
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
    intersectScenePoint(x, y, o, a) {
      if (!this.activeCamera) return null;
      this.pointer.set(x / Math.max(1, o) * 2 - 1, 1 - y / Math.max(1, a) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const d = this.raycaster.intersectObjects(this.content.children, !0);
      if (d.length > 0)
        return [d[0].point.x, d[0].point.y, d[0].point.z];
      const r = new e.Plane(new e.Vector3(0, 1, 0), 0), s = new e.Vector3();
      return this.raycaster.ray.intersectPlane(r, s) ? [s.x, s.y, s.z] : null;
    }
  };
}
const pe = ["high", "balanced", "low"], ir = 25, Pe = 30, cr = 0.6;
function Ge(t = "balanced") {
  return { quality: t, samples: [], downgraded: !1 };
}
function lr(t) {
  const e = pe.indexOf(t);
  return e < 0 || e >= pe.length - 1 ? null : pe[e + 1];
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
  const { THREE: e, FBXLoader: i, GLTFLoader: l, OBJLoader: v, PLYLoader: f, STLLoader: S, neutral: B, wire: z, checkerMaterial: G, objectMaterial: O, applyModelMaterial: _, disposeObject: A, textureFor: J, cardMesh: X, generatePointField: Z, sampleCamera: Y, sampleObjectTransform: ee, hasOutlineMesh: x, SelectionOutlineRenderer: y } = t;
  return {
    render(o, a, d, r, s, w = /* @__PURE__ */ new Map(), m = 0, g = !1, u = "camera", n = "subject", h = null, V = null) {
      const C = !g || (o.render_mode || "") === "beauty";
      if (C !== this.studioEnabled) {
        this.studioEnabled = C, Ee(e, this.scene, this.renderer, this.studio, C);
        for (const c of this.flatLights || []) c.visible = !C;
      }
      if (this.disposed) return;
      (this.canvas.width !== r || this.canvas.height !== s) && this.renderer.setSize(r, s, !1);
      const M = (a && a.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const p = o.viewport_bg_sequence && o.viewport_bg_sequence.length ? o.viewport_bg_sequence[m % o.viewport_bg_sequence.length] : o.viewport_bg_image || "";
      if (p) {
        this.bgImageUrl = p;
        const c = this.bgTextureCache.get(p);
        if (c)
          this.bgTextureCache.delete(p), this.bgTextureCache.set(p, c), this.bgTexture = c, this.scene.background = c;
        else if (!this.bgTextureLoads.has(p)) {
          const b = this.bgLoadGeneration;
          this.bgTextureLoads.set(p, b), new e.TextureLoader().load(p, (N) => {
            if (this.bgTextureLoads.delete(p), this.disposed || b !== this.bgLoadGeneration) {
              N.dispose();
              return;
            }
            for (N.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(p, N); this.bgTextureCache.size > 8; ) {
              const T = [...this.bgTextureCache.keys()].find((Q) => Q !== this.bgImageUrl);
              if (!T) break;
              const U = this.bgTextureCache.get(T);
              this.bgTextureCache.delete(T), U?.dispose?.();
            }
            this.bgImageUrl === p && (this.bgTexture = N, this.scene.background = N), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(p);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const b of new Set(this.bgTextureCache.values())) b.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const c = o.viewport_bg_color && o.viewport_bg_color !== Ve;
        this.scene.background = this.studioEnabled && !c && !M ? this.studio.sky : new e.Color(c ? o.viewport_bg_color : this.studioEnabled && M ? 1447709 : Ve);
      }
      const L = JSON.stringify([
        o.render_mode,
        o.card_fit,
        o.point_density,
        o.point_spread,
        !!o.show_wireframe,
        !!o.show_vertices,
        o.objects.map((c) => {
          const { position: b, rotation: W, keyframes: N, size: T, ...U } = c;
          return c.type === "card" && (U.size = T), U;
        })
      ]), D = [...d.entries()].map(([c, b]) => `${c}:${b?.src || ""}`).join("|"), I = [...w.entries()].map(([c, b]) => `${c}:${b}`).join("|");
      (L !== this.sceneKey || D !== this.mediaSignature || I !== this.modelSignature) && (this.sceneKey = L, this.mediaSignature = D, this.modelSignature = I, this.rebuild(o, d, w));
      for (const c of this.models.values())
        c.mixer && c.duration > 0 && c.mixer.setTime(m / Math.max(1, o.fps || 24) % c.duration);
      for (const c of o.objects) {
        const b = this.objectNodes.get(c.id);
        if (!b) continue;
        const W = c.keyframes?.length ? ee(c, m) : c;
        b.position.fromArray(W.position || [0, 0, 0]), b.rotation.set(...(W.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), c.type !== "card" && c.type !== "null" && b.scale.fromArray(W.size || [1, 1, 1]), c.type === "null" && (b.visible = g ? !0 : o.show_helper_axes !== !1);
      }
      this.path.visible = !g;
      const k = o.show_grid !== !1 && o.render_mode !== "point_field";
      this.content.traverse((c) => {
        c.userData.omnicamCaptureGuide && (c.visible = g ? !!o.playblast_grid : k);
      });
      const F = o.view_mode || "camera", j = `${F}:${u}:${V ?? ""}:${o.__omnicamRevision ?? JSON.stringify([
        o.active_camera_id,
        (o.cameras || []).map((c) => [c.id, c.keyframes?.length, c.keyframes?.map((b) => [b.frame, b.camera?.position, b.camera?.target])]),
        (o.objects || []).map((c) => [c.id, c.keyframes?.length, c.keyframes?.map((b) => [b.frame, b.transform?.position])])
      ])}`;
      if (j !== this.pathKey && (this.pathKey = j, this.rebuildPath(o, u, V, F)), this.updateLiveCameras(o, m, g, F, u, V), this.liveCameras.visible = !g, !g) {
        const c = o.show_camera_paths !== !1, b = o.show_camera_gizmos !== !1, W = o.show_look_at !== !1;
        for (const N of [this.path, this.liveCameras])
          N.traverse((T) => {
            const U = T.userData.omnicamWidget;
            U === "path" ? T.visible = c : U === "gizmo" ? T.visible = b : U === "lookat" && (T.visible = W);
          });
      }
      const R = r / Math.max(1, s), P = this.configureCamera(a, R);
      if (this.activeCamera = P, g ? this.selectionGroup.visible = !1 : (this.updateSelection(o, u, n, h, `${o.__omnicamRevision ?? "legacy"}:${m}`, M), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const c = new e.Box3();
        this.content.traverse((W) => {
          if (!W.isMesh || W.userData.omnicamCaptureGuide) return;
          W.castShadow = !0, W.receiveShadow = !0, W.updateWorldMatrix(!0, !1);
          const N = new e.Box3().setFromObject(W);
          !N.isEmpty() && Number.isFinite(N.min.x) && c.union(N);
        });
        const b = this.studio?.key;
        if (b) {
          const W = c.isEmpty() ? new e.Vector3() : c.getCenter(new e.Vector3()), N = c.isEmpty() ? new e.Vector3(12, 12, 12) : c.getSize(new e.Vector3()), T = Math.max(1, 0.5 * Math.max(N.x, N.y, N.z) * Math.SQRT2), U = T * 1.15 + 0.5, Q = new e.Vector3(4.5, 7.5, 3.5).normalize(), H = Math.max(12, T * 4);
          b.position.copy(W).addScaledVector(Q, H), b.target.position.copy(W), b.target.updateMatrixWorld(!0);
          const K = b.shadow.camera;
          K.left = -U, K.right = U, K.top = U, K.bottom = -U, K.near = Math.max(0.1, H - T - 1), K.far = H + T + 1, K.updateProjectionMatrix(), b.shadow.map?.dispose(), b.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((c) => {
        c.userData.omnicamBillboard && c.quaternion.copy(P.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, r, s);
      const q = performance.now();
      let $ = !1;
      if (!g && !M && u === "object" && n && !h) {
        const c = this.objectNodes.get(n);
        c && x(c) && (this.outlineRenderer || (this.outlineRenderer = new y(this.renderer, this.scene, void 0, P)), this.outlineRenderer.render(P, r, s, [c]), $ = !0);
      }
      if ($ || this.renderer.render(this.scene, P), !g && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Ge(this.studio?.quality);
        const c = dr(this.qualityMonitor, performance.now() - q);
        c && (Le(this.studio, this.renderer, c), this.onQualityDowngrade?.(c));
      }
    },
    setViewportQuality(o) {
      Le(this.studio, this.renderer, o), this.qualityMonitor = ur(this.qualityMonitor || Ge(o), o);
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
        for (const o of new Set(this.bgTextureCache.values())) o.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const o of this.models.values()) A(o.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.outlineRenderer?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
const hr = {
  EffectComposer: Tt,
  OutlinePass: Ft,
  OutputPass: Dt,
  RenderPass: Ot,
  Vector2: be
};
function pr(t) {
  let e = !1;
  return t?.traverse?.((i) => {
    e || i.visible === !1 || !i.isMesh || i.userData?.omnicamHelper || i.userData?.omnicamCaptureGuide || (e = !!(i.geometry && i.material));
  }), e;
}
class fr {
  constructor(e, i, l = hr, v = null) {
    const { EffectComposer: f, RenderPass: S, OutlinePass: B, OutputPass: z, Vector2: G } = l;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new f(e), this.renderPass = new S(i, v), this.outlinePass = new B(new G(1, 1), i, v, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new z(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, i, l, v) {
    this.disposed || ((i !== this.width || l !== this.height) && (this.width = i, this.height = l, this.composer.setSize(i, l)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...v], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const se = new Me({ color: 9212571, roughness: 0.9, metalness: 0 }), ve = new de({ color: 11449792, wireframe: !0 });
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
  ]), e = new Oe(t, 2, 2, Ne);
  return e.wrapS = e.wrapT = Ue, e.repeat.set(8, 8), e.colorSpace = he, e.needsUpdate = !0, new Me({ map: e, roughness: 0.85, metalness: 0 });
}
function gr(t, e) {
  if (e === "wireframe" || t.material_mode === "wireframe") {
    const l = ve.clone();
    return t.color && (l.color = new ce(t.color)), l;
  }
  if (t.material_mode === "checker") return Ce();
  const i = se.clone();
  return t.color && (i.color = new ce(t.color)), i;
}
function wr(t, e) {
  t.traverse((i) => {
    if (i.isMesh) {
      if (i.userData.omnicamOriginalMaterial || (i.userData.omnicamOriginalMaterial = i.material), i.userData.omnicamOverrideMaterial) {
        const l = Array.isArray(i.material) ? i.material : [i.material];
        for (const v of l)
          v?.map?.dispose?.(), v?.dispose?.();
        i.userData.omnicamOverrideMaterial = !1;
      }
      e === "textured" ? i.material = i.userData.omnicamOriginalMaterial : (i.material = e === "checker" ? Ce() : e === "wireframe" ? ve.clone() : se.clone(), i.userData.omnicamOverrideMaterial = !0);
    }
  });
}
function xe(t, e = !1) {
  t.traverse((i) => {
    if (i.userData.omnicamModelResource && !e) return;
    i.geometry?.dispose?.();
    const l = Array.isArray(i.material) ? i.material : [i.material];
    for (const v of l)
      v?.map?.dispose?.(), v?.dispose?.();
  });
}
function tt(t) {
  if (!t) return null;
  const e = t instanceof HTMLVideoElement ? new Ke(t) : new $e(t);
  return e.colorSpace = he, e.needsUpdate = !0, e;
}
function yr(t, e, i) {
  const [l, v] = t.size || [2, 3], f = new E(), S = new oe(new fe(l, v), new de({ color: 1448482, side: le, transparent: !0, opacity: 0.85 }));
  S.frustumCulled = !1, f.add(S);
  const B = tt(e);
  if (!B) return f;
  const z = e.videoWidth || e.naturalWidth || e.width || l, G = e.videoHeight || e.naturalHeight || e.height || v, O = z / Math.max(1, G), _ = l / Math.max(0.01, v);
  let A = l, J = v;
  i === "contain" ? O > _ ? J = l / O : A = v * O : i === "cover" && (O > _ ? (B.repeat.x = _ / O, B.offset.x = (1 - B.repeat.x) * 0.5) : (B.repeat.y = O / _, B.offset.y = (1 - B.repeat.y) * 0.5));
  const X = new oe(
    new fe(A, J),
    new de({
      color: 16777215,
      map: B,
      side: le,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return X.frustumCulled = !1, X.position.z = 2e-3, f.add(X), f.frustumCulled = !1, f;
}
class xr {
  constructor(e = () => {
  }, i = () => {
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
    }), this.renderer.setPixelRatio(1), this.renderer.outputColorSpace = he, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = Te, this.scene = new qe(), this.scene.background = new ce(1184274), this.scene.add(new De(16777215, 3159099, 2.2));
    const l = new _e(16777215, 2.4);
    l.position.set(5, 8, 4), this.scene.add(l), this.flatLights = [this.scene.children.at(-2), l], this.studio = Ut(we, this.renderer, Rt), this.scene.add(this.studio.group), this.studioEnabled = !0, Ee(we, this.scene, this.renderer, this.studio, !0), this.content = new E(), this.scene.add(this.content), this.path = new E(), this.scene.add(this.path), this.liveCameras = new E(), this.scene.add(this.liveCameras), this.selectionGroup = new E(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ze(35, 16 / 9, 0.01, 1e4), this.orthographic = new Fe(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = i, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new Ie(), this.pointer = new be(), this.activeCamera = this.perspective;
  }
  async loadModel(e, i, l = "glb") {
    const v = `${l}:${i}`;
    if (!(!i || this.modelLoads.get(e) === v)) {
      this.modelLoads.set(e, v);
      try {
        let f, S = [];
        if (l === "obj") f = await new Ye().loadAsync(i);
        else if (l === "fbx")
          f = await new Qe().loadAsync(i), S = f.animations || [];
        else if (l === "stl") f = new oe(await new Ze().loadAsync(i), se.clone());
        else if (l === "ply") {
          const a = await new Je().loadAsync(i);
          a.index ? (a.getAttribute("normal") || a.computeVertexNormals(), f = new oe(a, se.clone())) : f = new je(a, new We({ color: 11449792, size: 0.025 }));
        } else {
          const a = await new He().loadAsync(i);
          f = a.scene, S = a.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== v) {
          xe(f, !0);
          return;
        }
        const B = this.models.get(e);
        B && xe(B.scene, !0), f.traverse((a) => {
          if (a.userData.omnicamModelResource = !0, a.frustumCulled = !1, a.isMesh && (a.frustumCulled = !1, a.material)) {
            const d = Array.isArray(a.material) ? a.material : [a.material];
            for (const r of d)
              r.side = le;
          }
          a.isPoints && (a.frustumCulled = !1), a.isSkinnedMesh && (a.frustumCulled = !1, a.computeBoundingBox?.(), a.computeBoundingSphere?.());
        });
        let z = 0, G = 0, O = 0, _ = 0;
        f.traverse((a) => {
          a.isMesh && (z += 1, _ += a.geometry?.getAttribute?.("position")?.count || 0), a.isPoints && (G += 1), a.isBone && (O += 1);
        });
        const A = new E();
        if (A.frustumCulled = !1, A.add(f), !z && !G && O) {
          const a = new Re(f);
          a.material.depthTest = !1, a.material.opacity = 0.9, a.material.transparent = !0, a.renderOrder = 10, a.userData.omnicamModelResource = !0, A.add(a);
        }
        A.updateMatrixWorld(!0);
        const J = new Ae().setFromObject(A), X = J.getSize(new ge()), Z = Math.max(X.x, X.y, X.z), Y = Number.isFinite(Z) && Z > 1e-6 ? 2.5 / Z : 1, ee = J.getCenter(new ge());
        A.scale.setScalar(Y), A.position.set(-ee.x * Y, -J.min.y * Y, -ee.z * Y);
        const x = new E();
        x.frustumCulled = !1, x.add(A);
        const y = S.length ? new ke(f) : null;
        y && y.clipAction(S[0]).play();
        const o = { url: i, format: l, scene: x, mixer: y, clips: S, selectedClip: 0, duration: S[0]?.duration || 0, meshes: z, points: G, bones: O, vertices: _, animations: S.length, normalizationScale: Y };
        this.models.set(e, o), this.onModelLoaded({ id: e, format: l, meshes: z, points: G, bones: O, vertices: _, animations: S.length, animationNames: S.map((a, d) => a.name || `Clip ${d + 1}`), duration: o.duration, normalizationScale: Y }), this.sceneKey = "", this.invalidate();
      } catch (f) {
        this.modelLoads.get(e) === v && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${l.toUpperCase()} ${e}`, f);
        const S = f?.message?.includes("FBX version not supported") || f?.message?.includes("6100") || f?.message?.includes("6000"), B = S ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : f?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: l, error: B, isLegacyFBX: S });
      }
    }
  }
}
const ne = { THREE: we, FBXLoader: Qe, GLTFLoader: He, OBJLoader: Ye, PLYLoader: Je, STLLoader: Ze, neutral: se, wire: ve, checkerMaterial: Ce, objectMaterial: gr, applyModelMaterial: wr, disposeObject: xe, textureFor: tt, cardMesh: yr, generatePointField: jt, sampleCamera: Wt, sampleObjectTransform: Nt, hasOutlineMesh: pr, SelectionOutlineRenderer: fr };
Object.assign(
  xr.prototype,
  sr(ne),
  ar(ne),
  nr(ne),
  mr(ne)
);
async function Mr(t, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const i of ["vp9", "vp8"])
    try {
      if (await ie(Zt(i, { width: t, height: e }), 5e3, `Checking ${i} support`)) return i;
    } catch {
    }
  return null;
}
function ie(t, e, i) {
  let l;
  return Promise.race([
    t,
    new Promise((v, f) => {
      l = setTimeout(() => f(new Error(`${i} timed out`)), e);
    })
  ]).finally(() => clearTimeout(l));
}
async function Lr(t, e, i, l, v) {
  const f = await Mr(t.width, t.height);
  if (!f) throw new Error("No supported WebCodecs WebM encoder");
  const S = new $t({ format: new Xt(), target: new Kt() }), B = new Yt(t, { codec: f, quality: new Qt("high"), keyFrameInterval: 1 });
  S.addVideoTrack(B, { frameRate: i }), await ie(S.start(), 1e4, "Starting deterministic encoder");
  try {
    const z = 1 / i;
    for (let G = 0; G < e; G++) {
      if (v?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await l(G), await ie(B.add(G * z, z, { keyFrame: G % i === 0 }), 1e4, `Encoding frame ${G + 1}`);
    }
    await ie(S.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (z) {
    throw S.state !== "finalized" && await S.cancel().catch(() => {
    }), z;
  }
  return qt(new Blob([S.target.buffer], { type: await S.getMimeType() }), {
    encoder: "webcodecs",
    requestedFrames: e,
    expectedDurationMs: e / i * 1e3,
    recordedDurationMs: e / i * 1e3,
    driftMs: 0,
    fps: i,
    width: t.width,
    height: t.height
  });
}
export {
  xr as OmniWebGLViewport,
  Lr as encodeDeterministicPlayblast,
  Mr as supportsDeterministicEncoding
};
