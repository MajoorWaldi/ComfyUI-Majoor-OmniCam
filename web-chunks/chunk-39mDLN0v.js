import { T as we } from "./chunk-CcRb1b12.js";
import { V as Te, a as Ye, O as Ke, b as He, E as Qe, W as Ze, S as Me, P as Je, c as Ee, C as se, H as et, D as tt, G as ae, d as ot, e as rt, f as at, g as Fe, F as ze, M as ue, h as We, i as xe, j as je, k as st, l as nt, m as Ie, n as ee, o as it, B as ct, p as Ge, A as lt, q as ge, r as be, s as Se, t as dt, u as ut, v as mt, w as ht, T as ft } from "./vendor-three-AeKB2-k3.js";
import { br as pt, bs as wt, bt as gt, aU as yt, s as Mt, f as xt } from "./chunk-B56R8UMR.js";
import { s as bt, r as vt, q as Ct, a as Ve, b as Ne, D as Pe, c as Bt, d as Lt, e as _t } from "./chunk-OJjI39uU.js";
import { c as Gt } from "./chunk-a2yd8Eqb.js";
import { Output as St, BufferTarget as Vt, WebMOutputFormat as Pt, CanvasSource as Dt, QUALITY_HIGH as At, QUALITY_MEDIUM as kt, QUALITY_LOW as Ot, canEncodeVideo as Tt } from "./vendor-mediabunny-CZ5VNE-V.js";
function Ft(o, { position: e, forward: d, up: p, color: G, scale: m = 1, active: v = !0 }) {
  const x = new o.Group(), R = v ? 0.95 : 0.5, T = new o.MeshBasicMaterial({
    color: G,
    transparent: !0,
    opacity: R,
    depthTest: !1
  }), A = new o.Mesh(new o.BoxGeometry(0.34, 0.24, 0.42), T);
  A.renderOrder = 912, x.add(A);
  const j = new o.Mesh(new o.ConeGeometry(0.17, 0.26, 20), T);
  return j.rotation.x = -Math.PI / 2, j.position.z = -0.32, j.renderOrder = 912, x.add(j), x.scale.setScalar(m), x.position.copy(e), x.up.copy(p), x.lookAt(e.clone().add(d)), x;
}
function zt(o, { position: e, color: d = 15903035, radius: p = 0.28, bold: G = !1 }) {
  const m = new o.Group(), v = G ? 16773544 : d, x = new o.LineBasicMaterial({ color: v, transparent: !0, opacity: G ? 1 : 0.95, depthTest: !1 }), R = (j) => {
    const U = [];
    for (let J = 0; J <= 48; J++) {
      const Z = J / 48 * Math.PI * 2;
      U.push(new o.Vector3(Math.cos(Z) * j, Math.sin(Z) * j, 0));
    }
    const Q = new o.Line(new o.BufferGeometry().setFromPoints(U), x);
    return Q.renderOrder = 915, Q;
  };
  if (m.add(R(p)), G) {
    m.add(R(p * 1.18));
    const j = new o.Mesh(
      new o.RingGeometry(0, p * 0.3, 16),
      new o.MeshBasicMaterial({ color: v, transparent: !0, opacity: 1, depthTest: !1 })
    );
    j.renderOrder = 916, m.add(j);
  }
  const T = p * 1.55, A = new o.LineSegments(
    new o.BufferGeometry().setFromPoints([
      new o.Vector3(-T, 0, 0),
      new o.Vector3(-p * 0.45, 0, 0),
      new o.Vector3(p * 0.45, 0, 0),
      new o.Vector3(T, 0, 0),
      new o.Vector3(0, -T, 0),
      new o.Vector3(0, -p * 0.45, 0),
      new o.Vector3(0, p * 0.45, 0),
      new o.Vector3(0, T, 0)
    ]),
    x
  );
  return A.renderOrder = 915, m.add(A), m.position.copy(e), m.userData.omnicamBillboard = !0, m;
}
const Ue = 3718648, Wt = 12e3;
function me(o) {
  return !!(o.isSkinnedMesh && o.skeleton);
}
function Re(o, e) {
  o.position.copy(e.position), o.quaternion.copy(e.quaternion), o.scale.copy(e.scale);
}
function he(o) {
  return o.frustumCulled = !1, o.raycast = () => {
  }, o.userData.omnicamHelper = !0, o;
}
function jt(o, e, { color: d = null, opacity: p = null } = {}) {
  const G = d ?? Ue, m = p ?? 0.65;
  if (me(e)) {
    const x = new o.SkinnedMesh(e.geometry.clone(), new o.MeshBasicMaterial({
      color: G,
      wireframe: !0,
      transparent: !0,
      opacity: m,
      depthWrite: !1
    }));
    return x.bindMode = e.bindMode, x.bind(e.skeleton, e.bindMatrix), Re(x, e), { overlay: he(x), parent: e.parent || e };
  }
  const v = new o.LineSegments(
    new o.WireframeGeometry(e.geometry),
    new o.LineBasicMaterial({ color: G, opacity: m, transparent: !0, depthTest: !0 })
  );
  return { overlay: he(v), parent: e };
}
function It(o, e) {
  const d = new o.PointsMaterial({ color: Ue, size: 0.05, sizeAttenuation: !0 });
  if (!me(e)) {
    const j = new o.Points(e.geometry, d);
    return { overlay: he(j), parent: e };
  }
  const p = e.geometry.getAttribute("position")?.count || 0, G = Math.max(1, Math.ceil(p / Wt)), m = Math.ceil(p / G), v = new Float32Array(m * 3), x = new o.BufferGeometry();
  x.setAttribute("position", new o.Float32BufferAttribute(v, 3));
  const R = new o.Points(x, d);
  Re(R, e);
  const T = new o.Vector3(), A = x.getAttribute("position");
  return R.onBeforeRender = () => {
    for (let j = 0; j < m; j++)
      e.getVertexPosition(j * G, T), A.setXYZ(j, T.x, T.y, T.z);
    A.needsUpdate = !0;
  }, { overlay: he(R), parent: e.parent || e };
}
function Nt(o, e, d) {
  const p = me(e) ? new o.SkinnedMesh(e.geometry.clone(), d) : new o.Mesh(e.geometry.clone(), d);
  return me(e) && (p.bindMode = e.bindMode, p.bind(e.skeleton, e.bindMatrix)), p.matrixAutoUpdate = !1, p.matrix.copy(e.matrixWorld), p.frustumCulled = !1, p;
}
function Ut(o, e, { wireframe: d = !1, vertices: p = !1, wireframeColor: G = null, wireframeOpacity: m = null } = {}) {
  if (!d && !p) return;
  const v = [];
  e.traverse((x) => {
    x.isMesh && x.geometry && !x.userData.omnicamHelper && v.push(x);
  });
  for (const x of v) {
    if (d) {
      const { overlay: R, parent: T } = jt(o, x, { color: G, opacity: m });
      T.add(R);
    }
    if (p) {
      const { overlay: R, parent: T } = It(o, x);
      T.add(R);
    }
  }
}
const Rt = 16777215, ie = 0.17, De = 3593923, qt = 0.06;
function Xt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: p, OBJLoader: G, PLYLoader: m, STLLoader: v, neutral: x, wire: R, checkerMaterial: T, objectMaterial: A, applyModelMaterial: j, disposeObject: U, textureFor: E, cardMesh: Q, generatePointField: J, sampleCamera: Z, sampleObjectTransform: re } = o;
  return {
    removeModel(S) {
      const g = this.models.get(S);
      g && U(g.scene, !0), this.models.delete(S), this.modelLoads.delete(S), this.sceneKey = "";
    },
    selectAnimation(S, g) {
      const t = this.models.get(S);
      !t?.mixer || !t.clips.length || (t.selectedClip = Math.max(0, Math.min(t.clips.length - 1, Number(g) || 0)), t.duration = t.clips[t.selectedClip].duration || 0, t.motionClipId = null, t.mixer.stopAllAction(), t.mixer.clipAction(t.clips[t.selectedClip]).play(), this.invalidate());
    },
    /** Select the clip a character motion names (by clip name, else index, else
     * the first clip). Idempotent -- re-selecting the same clip is a no-op so the
     * per-frame render loop can call it freely (design spec section 27). */
    applyMotionClip(S, g) {
      const t = this.models.get(S);
      if (!t?.mixer || !t.clips.length) return;
      const r = String(g?.clip_id ?? "");
      if (t.motionClipId === r) return;
      let i = t.clips.findIndex((s) => (s.name || "").toLowerCase() === r.toLowerCase());
      i < 0 && /^\d+$/.test(r) && (i = Number(r)), (i < 0 || i >= t.clips.length) && (i = 0), t.selectedClip = i, t.motionClipId = r, t.duration = t.clips[i].duration || 0, t.mixer.stopAllAction();
      const l = t.mixer.clipAction(t.clips[i]);
      l.reset(), l.play(), this.invalidate();
    },
    rebuild(S, g, t, r = !1) {
      this.content.traverse((a) => {
        for (const _ of [...a.children])
          _.userData.omnicamHelper && (a.remove(_), U(_, !0));
      }), U(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const i = S.render_mode, l = new e.Group();
      l.userData.omnicamCaptureGuide = !0;
      const s = new e.GridHelper(120, 24, 4081496, 3291463);
      s.userData.omnicamCaptureGuide = !0, s.frustumCulled = !1, s.position.y = 5e-4, l.add(s);
      const n = new e.GridHelper(120, 120, 2238001, 1909035);
      n.userData.omnicamCaptureGuide = !0, n.frustumCulled = !1, l.add(n);
      const b = new e.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), M = new e.BufferGeometry().setFromPoints([new e.Vector3(-60, 1e-3, 0), new e.Vector3(60, 1e-3, 0)]), u = new e.Line(M, b);
      u.userData.omnicamCaptureGuide = !0, l.add(u);
      const y = new e.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), c = new e.BufferGeometry().setFromPoints([new e.Vector3(0, 1e-3, -60), new e.Vector3(0, 1e-3, 60)]), D = new e.Line(c, y);
      if (D.userData.omnicamCaptureGuide = !0, l.add(D), this.content.add(l), ["omni_ref", "point_field"].includes(i)) {
        const { points: a, colors: _ } = J(S.point_density || "balanced", S.point_spread || "all_views", S.point_color || null);
        if (a.length > 0) {
          const w = new e.BufferGeometry();
          w.setAttribute("position", new e.Float32BufferAttribute(a, 3)), w.setAttribute("color", new e.Float32BufferAttribute(_, 3));
          const C = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), h = new e.Points(w, C);
          h.frustumCulled = !1, this.content.add(h);
        }
      }
      if (!["grid", "point_field"].includes(i))
        for (const a of S.objects) {
          if (a.enabled === !1) continue;
          const _ = a.size || [1, 1, 1];
          let w;
          if (a.type === "glb" || a.type === "model") {
            const h = t.get(a.id), B = this.models.get(a.id), O = a.format || (a.type === "glb" ? "glb" : "");
            h && (B?.url !== h || B?.format !== O) && this.loadModel(a.id, h, O);
            const k = !!S.backface_culling, V = vt(a, S, r) ?? (a.material_mode || "textured");
            B?.url === h && (w = B.scene, j(w, V, a, k));
          } else if (a.type === "sphere")
            w = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), A(a, i, !!S.backface_culling));
          else if (a.type === "cylinder")
            w = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), A(a, i, !!S.backface_culling));
          else if (a.type === "torus") {
            const h = new e.TorusGeometry(0.5, 0.2, 16, 32);
            h.rotateX(Math.PI / 2), w = new e.Mesh(h, A(a, i, !!S.backface_culling));
          } else if (a.type === "pyramid") {
            const h = new e.ConeGeometry(0.7, 1, 4);
            h.rotateY(Math.PI / 4), w = new e.Mesh(h, A(a, i, !!S.backface_culling));
          } else if (a.type === "sun_light") {
            const h = new e.Group(), B = new e.DirectionalLight(a.color || 16774892, a.intensity ?? 2.2);
            B.castShadow = a.cast_shadow !== !1, B.castShadow && (B.shadow.mapSize.set(1024, 1024), B.shadow.bias = -8e-4, B.shadow.normalBias = 0.02, B.shadow.radius = 2.4, B.shadow.camera.near = 0.5, B.shadow.camera.far = 70, B.shadow.camera.left = B.shadow.camera.bottom = -14, B.shadow.camera.right = B.shadow.camera.top = 14);
            const O = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), k = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(O[0], O[1], O[2], "YXZ"));
            B.target.position.copy(B.position).add(k.multiplyScalar(10)), h.add(B, B.target);
            const V = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16096779, wireframe: !0 })
            );
            V.userData.omnicamLightHelper = !0, V.visible = !r, h.add(V), w = h;
          } else if (a.type === "point_light") {
            const h = new e.Group(), B = new e.PointLight(a.color || 16777215, a.intensity ?? 2, 0, 2);
            h.add(B);
            const O = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16498468, wireframe: !0 })
            );
            O.userData.omnicamLightHelper = !0, O.visible = !r, h.add(O), w = h;
          } else if (a.type === "spot_light") {
            const h = new e.Group(), B = (a.cone_angle ?? 45) * Math.PI / 180, O = a.penumbra ?? 0.25, k = new e.SpotLight(a.color || 16777215, a.intensity ?? 3, 0, B, O, 2), V = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), z = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(V[0], V[1], V[2], "YXZ"));
            k.target.position.copy(k.position).add(z.multiplyScalar(10)), h.add(k, k.target);
            const P = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: a.color || 3718648, wireframe: !0 })
            );
            P.userData.omnicamLightHelper = !0, P.visible = !r, h.add(P), w = h;
          } else if (a.type === "human")
            w = new e.Mesh(Gt(e), A(a, i, !!S.backface_culling));
          else if (a.type === "ground") w = new e.Mesh(new e.BoxGeometry(1, 1, 1), A(a, i, !!S.backface_culling));
          else if (a.type === "card")
            w = !a.material_mode || ["textured", "wireframe_texture"].includes(a.material_mode) ? Q(a, g.get(a.id), S.card_fit || "contain") : new e.Mesh(new e.PlaneGeometry(_[0], _[1]), A(a, i, !!S.backface_culling));
          else if (a.type === "null") {
            const h = new e.AxesHelper(0.5);
            h.position.fromArray(a.position || [0, 0, 0]), h.userData.omnicamId = a.id, h.frustumCulled = !1, this.objectNodes.set(a.id, h), this.content.add(h);
            continue;
          } else
            w = new e.Mesh(new e.BoxGeometry(1, 1, 1), A(a, i, !!S.backface_culling));
          if (!w) continue;
          w.position.fromArray(a.position || [0, 0, 0]), w.rotation.set(...(a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const C = ["sun_light", "point_light", "spot_light"].includes(a.type);
          if (a.type !== "card" && !C && w.scale.fromArray(_), w.userData.omnicamId = a.id, w.frustumCulled = !1, w.traverse((h) => {
            h.frustumCulled = !1, h.userData.omnicamId = a.id;
          }), !C) {
            const h = !!(S.show_wireframe || S.render_mode === "wireframe_texture" || a.material_mode === "wireframe_texture" || a.material_mode === "wireframe_neutral");
            Ut(e, w, { wireframe: h, vertices: S.show_vertices });
          }
          this.objectNodes.set(a.id, w), this.content.add(w);
        }
    },
    rebuildPath(S, g = "camera", t = null, r = "") {
      U(this.path), this.path.clear();
      const i = r === "camera" ? S.active_camera_id : null, l = [
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
      (S.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: S.keyframes || [] }]).forEach((b, M) => {
        const u = b.keyframes || [];
        if (u.length === 0 || b.id === i) return;
        const y = b.color ? { line: new e.Color(b.color), marker: new e.Color(b.color), frustum: new e.Color(b.color) } : l[M % l.length], c = b.id === S.active_camera_id, D = c && g === "camera";
        if (u.length >= 2) {
          const a = u[0].frame, _ = u[u.length - 1].frame, w = Math.max(32, Math.min(256, _ - a + 1)), C = { ...b, keyframes: u, objects: S.objects }, h = Array.from({ length: w }, (z, P) => {
            const q = a + (_ - a) * P / Math.max(1, w - 1);
            return new e.Vector3().fromArray(Z(C, q, S.objects).position);
          }), B = new e.CatmullRomCurve3(h, !1, "centripetal"), O = D ? 0.06 : c ? 0.045 : 0.025, k = new e.MeshBasicMaterial({
            color: y.line,
            transparent: !0,
            opacity: c ? 1 : 0.55,
            depthTest: !1
          }), V = new e.Mesh(new e.TubeGeometry(B, Math.max(48, w), O, 8, !1), k);
          if (V.renderOrder = 900, V.userData.omnicamWidget = "path", this.path.add(V), c) {
            const z = new e.Mesh(
              new e.TubeGeometry(B, Math.max(48, w), O * (D ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: y.line, transparent: !0, opacity: D ? 0.3 : 0.18, depthTest: !1 })
            );
            if (z.renderOrder = 899, z.userData.omnicamWidget = "path", this.path.add(z), h.length >= 8) {
              const P = Math.max(6, Math.floor(w / 8));
              for (let q = Math.floor(P / 2); q < w - 1; q += P) {
                const I = h[q], X = h[q + 1].clone().sub(I).normalize(), H = new e.ConeGeometry(O * 1.5, O * 3, 8);
                H.rotateX(Math.PI / 2);
                const K = new e.Quaternion().setFromUnitVectors(new e.Vector3(0, 0, 1), X), f = new e.Mesh(H, new e.MeshBasicMaterial({ color: y.marker, transparent: !0, opacity: 0.85, depthTest: !1 }));
                f.quaternion.copy(K), f.position.copy(I), f.renderOrder = 901, f.userData.omnicamWidget = "path", this.path.add(f);
              }
            }
          }
        }
        for (const a of u) {
          const _ = u.indexOf(a), w = c, C = new e.Mesh(
            new e.SphereGeometry(w ? ie : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: w ? Rt : y.marker, depthTest: !1 })
          );
          C.position.fromArray(a.camera.position), C.renderOrder = 910, C.userData.omnicamPathKey = { cameraId: b.id, frame: a.frame }, C.userData.omnicamWidget = "path", this.path.add(C);
          const h = new e.Mesh(
            new e.RingGeometry((w ? ie : 0.085) * 1.3, (w ? ie : 0.085) * 1.7, 24),
            new e.MeshBasicMaterial({ color: w ? 16777215 : y.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          h.position.fromArray(a.camera.position), h.renderOrder = 909, h.userData.omnicamBillboard = !0, h.userData.omnicamWidget = "path", this.path.add(h);
          const B = new e.Vector3().fromArray(a.camera.position), O = new e.Vector3().fromArray(a.camera.target || [0, 0, 0]), k = c && t != null && a.frame === t;
          if (k) {
            const V = new e.Mesh(
              new e.RingGeometry(ie * 2.1, ie * 2.6, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            V.position.fromArray(a.camera.position), V.renderOrder = 911, V.userData.omnicamBillboard = !0, V.userData.omnicamWidget = "path", this.path.add(V);
          }
          if (k) {
            const V = O.clone().sub(B).normalize();
            let z = new e.Vector3().crossVectors(V, new e.Vector3(0, 1, 0));
            z.lengthSq() < 1e-8 ? z.set(1, 0, 0) : z.normalize();
            const P = new e.Vector3().crossVectors(z, V).normalize(), q = e.MathUtils.clamp(B.distanceTo(O) * 0.08, 0.25, 0.8), I = a.camera.camera_type === "orthographic" ? q * 0.55 : q * Math.tan(e.MathUtils.degToRad(a.camera.fov || 35) * 0.5), X = I * (S.width || 16) / Math.max(1, S.height || 9), H = B.clone().addScaledVector(V, q), K = [
              H.clone().addScaledVector(z, -X).addScaledVector(P, -I),
              H.clone().addScaledVector(z, X).addScaledVector(P, -I),
              H.clone().addScaledVector(z, X).addScaledVector(P, I),
              H.clone().addScaledVector(z, -X).addScaledVector(P, I)
            ], f = [];
            for (const N of K) f.push(B, N);
            for (let N = 0; N < 4; N++) f.push(K[N], K[(N + 1) % 4]);
            const L = new e.BufferGeometry().setFromPoints(f), W = new e.LineSegments(L, new e.LineBasicMaterial({
              color: y.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            W.userData.omnicamWidget = "gizmo", this.path.add(W);
            const F = new e.BufferGeometry();
            F.setIndex([0, 1, 2, 0, 2, 3]), F.setAttribute("position", new e.Float32BufferAttribute([
              K[0].x,
              K[0].y,
              K[0].z,
              K[1].x,
              K[1].y,
              K[1].z,
              K[2].x,
              K[2].y,
              K[2].z,
              K[3].x,
              K[3].y,
              K[3].z
            ], 3));
            const $ = new e.Mesh(F, new e.MeshBasicMaterial({
              color: y.marker,
              transparent: !0,
              opacity: 0.12,
              depthTest: !1,
              side: e.DoubleSide
            }));
            $.userData.omnicamWidget = "gizmo", this.path.add($);
            const Y = Ft(e, {
              position: B,
              forward: V,
              up: P,
              color: y.marker,
              scale: e.MathUtils.clamp(q * 1.15, 0.35, 1.6),
              active: c
            });
            Y.userData.omnicamWidget = "gizmo", this.path.add(Y);
          }
          if (k) {
            const V = zt(e, {
              position: O,
              radius: e.MathUtils.clamp(B.distanceTo(O) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            V.userData.omnicamWidget = "lookat", this.path.add(V);
            const z = new e.Line(
              new e.BufferGeometry().setFromPoints([B.clone(), O.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            z.renderOrder = 914, z.userData.omnicamWidget = "lookat", this.path.add(z);
          }
          if (k) {
            const V = bt(a, u[_ - 1] || null, u[_ + 1] || null);
            for (const z of ["in", "out"]) {
              const P = new e.Vector3().fromArray(V[z]), q = new e.Line(
                new e.BufferGeometry().setFromPoints([B.clone(), P.clone()]),
                new e.LineBasicMaterial({ color: De, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              q.renderOrder = 912, q.userData.omnicamWidget = "gizmo", this.path.add(q);
              const I = new e.Mesh(
                new e.SphereGeometry(qt, 12, 8),
                new e.MeshBasicMaterial({ color: De, depthTest: !1 })
              );
              I.position.copy(P), I.renderOrder = 913, I.userData.omnicamCurveHandle = { cameraId: b.id, frame: a.frame, side: z }, I.userData.omnicamWidget = "gizmo", this.path.add(I);
            }
          }
        }
      });
      const n = [16742005, 52937, 16632686, 7101671, 14774357];
      (S.objects || []).forEach((b, M) => {
        const u = b.keyframes || [];
        if (u.length < 2) return;
        const y = b.color ? new e.Color(b.color) : n[M % n.length], c = u.map((_) => new e.Vector3().fromArray(_.transform?.position || [0, 0, 0])), D = new e.CatmullRomCurve3(c, !1, "centripetal"), a = new e.Mesh(
          new e.TubeGeometry(D, Math.max(32, u.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: y, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        a.renderOrder = 900, a.userData.omnicamWidget = "path", this.path.add(a);
        for (const _ of u) {
          const w = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: y, depthTest: !1 })
          );
          w.position.fromArray(_.transform?.position || [0, 0, 0]), w.renderOrder = 910, w.userData.omnicamWidget = "path", this.path.add(w);
        }
      });
    }
  };
}
function $t(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: p, OBJLoader: G, PLYLoader: m, STLLoader: v, neutral: x, wire: R, checkerMaterial: T, objectMaterial: A, applyModelMaterial: j, disposeObject: U, textureFor: E, cardMesh: Q, generatePointField: J, sampleCamera: Z, sampleObjectTransform: re, hasOutlineMesh: S } = o;
  return {
    updateLiveCameras(g, t, r, i, l = "camera", s = null) {
      if (U(this.liveCameras), this.liveCameras.clear(), r) return;
      const n = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (g.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: g.keyframes || [] }]).forEach((M, u) => {
        const y = M.color ? { line: new e.Color(M.color), marker: new e.Color(M.color), frustum: new e.Color(M.color), body: new e.Color(M.color).multiplyScalar(0.35) } : n[u % n.length], c = M.id === g.active_camera_id, D = c && l === "camera", a = i === "camera" && c, _ = Z(M, t, g.objects), w = new e.Vector3().fromArray(_.position || [0, 0, 0]), C = new e.Vector3().fromArray(_.target || [0, 0, 0]), h = C.clone().sub(w), B = h.length();
        B < 1e-4 ? h.set(0, 0, -1) : h.normalize();
        let O = new e.Vector3(0, 1, 0), k = new e.Vector3().crossVectors(h, O);
        k.lengthSq() < 1e-6 && (O = new e.Vector3(0, 0, 1), k = new e.Vector3().crossVectors(h, O)), k.normalize();
        let V = new e.Vector3().crossVectors(k, h).normalize();
        if (_.roll) {
          const P = e.MathUtils.degToRad(_.roll);
          k.applyAxisAngle(h, P), V.applyAxisAngle(h, P);
        }
        const z = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!a) {
          const P = new e.Group(), q = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: y.body, roughness: 0.4, metalness: 0.8 })
          );
          q.position.set(0, 0, -0.11), P.add(q);
          const I = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          I.rotateX(Math.PI / 2);
          const X = new e.Mesh(
            I,
            new e.MeshStandardMaterial({ color: y.marker, roughness: 0.2, metalness: 0.9 })
          );
          X.position.set(0, 0, 0.05), P.add(X);
          const H = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: c ? 16729156 : y.marker })
          );
          H.position.set(0, 0.07, -0.08), P.add(H);
          const K = new e.Matrix4().makeBasis(k, V, h.clone().negate());
          P.quaternion.setFromRotationMatrix(K), P.position.copy(w), P.userData.omnicamWidget = "gizmo", this.liveCameras.add(P);
          const f = new e.SphereGeometry(0.35, 8, 6), L = new e.Mesh(f, z);
          L.position.copy(w), L.userData = { omnicamType: "camera", omnicamId: M.id }, this.liveCameras.add(L);
          const W = e.MathUtils.clamp(B * 0.25, 0.5, 2.5), F = _.camera_type === "orthographic" ? 5 / Math.max(0.01, _.zoom || 1) * 0.35 : W * Math.tan(e.MathUtils.degToRad(_.fov || 35) * 0.5), $ = F * (g.width || 16) / Math.max(1, g.height || 9), Y = w.clone().addScaledVector(h, W), N = [
            Y.clone().addScaledVector(k, -$).addScaledVector(V, -F),
            Y.clone().addScaledVector(k, $).addScaledVector(V, -F),
            Y.clone().addScaledVector(k, $).addScaledVector(V, F),
            Y.clone().addScaledVector(k, -$).addScaledVector(V, F)
          ], te = [];
          for (const ne of N) te.push(w, ne);
          for (let ne = 0; ne < 4; ne++) te.push(N[ne], N[(ne + 1) % 4]);
          const Be = N[2].clone().add(N[3]).multiplyScalar(0.5).clone().addScaledVector(V, F * 0.25);
          te.push(N[2], Be, Be, N[3]);
          const $e = new e.BufferGeometry().setFromPoints(te), Le = new e.LineSegments($e, new e.LineBasicMaterial({
            color: D ? y.marker : y.frustum,
            linewidth: c ? 2 : 1,
            transparent: !0,
            opacity: c ? 1 : 0.6
          }));
          Le.userData.omnicamWidget = "gizmo", this.liveCameras.add(Le);
          const fe = new e.BufferGeometry();
          fe.setIndex([0, 1, 2, 0, 2, 3]), fe.setAttribute("position", new e.Float32BufferAttribute([
            N[0].x,
            N[0].y,
            N[0].z,
            N[1].x,
            N[1].y,
            N[1].z,
            N[2].x,
            N[2].y,
            N[2].z,
            N[3].x,
            N[3].y,
            N[3].z
          ], 3));
          const _e = new e.Mesh(fe, new e.MeshBasicMaterial({
            color: D ? y.marker : y.frustum,
            transparent: !0,
            opacity: 0.12,
            depthTest: !1,
            side: e.DoubleSide
          }));
          _e.userData.omnicamWidget = "gizmo", this.liveCameras.add(_e);
        }
        if (B > 0.01) {
          const P = c && l === "camera_target", q = new e.BufferGeometry().setFromPoints([w, C]), I = new e.Line(q, new e.LineDashedMaterial({
            color: D || P ? 9133302 : y.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: D || P ? 1 : c ? 0.75 : 0.4
          }));
          I.userData.omnicamWidget = "lookat", this.liveCameras.add(I);
          const X = P ? 0.12 : D ? 0.11 : 0.08, H = [
            C.clone().add(new e.Vector3(-X, 0, 0)),
            C.clone().add(new e.Vector3(X, 0, 0)),
            C.clone().add(new e.Vector3(0, -X, 0)),
            C.clone().add(new e.Vector3(0, X, 0)),
            C.clone().add(new e.Vector3(0, 0, -X)),
            C.clone().add(new e.Vector3(0, 0, X))
          ], K = new e.BufferGeometry().setFromPoints(H), f = new e.LineSegments(K, new e.LineBasicMaterial({
            color: P || D ? 9133302 : y.marker,
            linewidth: P ? 3 : 1,
            transparent: !0,
            opacity: P || D ? 1 : c ? 0.9 : 0.5
          }));
          f.userData.omnicamWidget = "lookat", this.liveCameras.add(f);
          const L = new e.SphereGeometry(0.28, 8, 6), W = new e.Mesh(L, z);
          if (W.position.copy(C), W.userData = { omnicamType: "camera_target", omnicamId: M.id }, this.liveCameras.add(W), (P || D) && i !== "camera") {
            const F = new e.RingGeometry(0.14, 0.18, 24);
            F.rotateX(Math.PI / 2);
            const $ = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), Y = new e.Mesh(F, $);
            Y.position.copy(C), Y.userData.omnicamWidget = "lookat", this.liveCameras.add(Y);
          }
        }
        if (c && i !== "camera" && l === "camera") {
          const P = new e.RingGeometry(0.19, 0.24, 32);
          P.rotateX(Math.PI / 2);
          const q = new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 1 }), I = new e.Mesh(P, q);
          I.position.copy(w), I.userData.omnicamWidget = "gizmo", this.liveCameras.add(I);
          const X = new e.RingGeometry(0.28, 0.31, 32);
          X.rotateX(Math.PI / 2);
          const H = new e.Mesh(X, new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          H.position.copy(w), H.userData.omnicamWidget = "gizmo", this.liveCameras.add(H);
        }
      });
    },
    updateSelection(g, t, r, i = null, l = "", s = !1) {
      const n = i ? `${i.mode || ""}:${i.objectId || ""}:${(i.point || []).join(",")}` : "", b = `${t}:${r || ""}:${(g.__selectedObjectIds || []).join(",")}:${l}:${n}:${s ? "ortho" : "persp"}`;
      if (b !== this.selectionKey) {
        if (this.selectionKey = b, U(this.selectionGroup), this.selectionGroup.clear(), t === "object" && r) {
          const M = this.objectNodes.get(r);
          if (M) {
            M.updateMatrixWorld(!0);
            try {
              const u = new e.Box3(), y = [];
              if (M.traverse((c) => {
                c.isBone && y.push(c);
              }), y.length > 0) {
                const c = new e.Vector3();
                for (const D of y)
                  D.getWorldPosition(c), u.expandByPoint(c);
                u.expandByScalar(0.2);
              } else
                u.setFromObject(M);
              if ((s || !S(M)) && !u.isEmpty() && Number.isFinite(u.min.x) && Number.isFinite(u.max.x) && Number.isFinite(u.min.y) && Number.isFinite(u.max.y) && Number.isFinite(u.min.z) && Number.isFinite(u.max.z)) {
                u.expandByScalar(0.04);
                const c = new e.Box3Helper(u, new e.Color(9133302));
                c.material.transparent = !0, c.material.opacity = 0.95, c.material.depthTest = !1, c.renderOrder = 9999, this.selectionGroup.add(c);
              }
            } catch {
            }
            if (g.show_wireframe) {
              let u = 0;
              M.traverse((y) => {
                if (!y.isMesh || !y.geometry || y.userData.omnicamHelper || u >= 64) return;
                const c = Nt(e, y, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                c.renderOrder = 9998, this.selectionGroup.add(c), u += 1;
              });
            }
            if (i && i.objectId === r && i.point) {
              if (i.mode === "vertex") {
                const u = new e.SphereGeometry(0.08, 16, 12), y = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), c = new e.Mesh(u, y);
                c.position.fromArray(i.point), c.renderOrder = 1e4, this.selectionGroup.add(c);
                const D = new e.RingGeometry(0.1, 0.15, 24), a = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), _ = new e.Mesh(D, a);
                _.position.fromArray(i.point), this.activeCamera && _.quaternion.copy(this.activeCamera.quaternion), _.renderOrder = 1e4, this.selectionGroup.add(_);
              } else if (i.mode === "edge" && i.edge) {
                const [u, y] = i.edge, c = new e.BufferGeometry().setFromPoints([new e.Vector3(...u), new e.Vector3(...y)]), D = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), a = new e.Line(c, D);
                a.renderOrder = 1e4, this.selectionGroup.add(a);
              } else if (i.mode === "face" && i.vertices) {
                const [u, y, c] = i.vertices, D = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...u),
                  new e.Vector3(...y),
                  new e.Vector3(...c)
                ]);
                D.setIndex([0, 1, 2]), D.computeVertexNormals();
                const a = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), _ = new e.Mesh(D, a);
                _.renderOrder = 1e4, this.selectionGroup.add(_);
                const w = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...u),
                  new e.Vector3(...y),
                  new e.Vector3(...c),
                  new e.Vector3(...u)
                ]), C = new e.Line(w, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                C.renderOrder = 10001, this.selectionGroup.add(C);
              }
            }
          }
        }
        if (t === "object")
          for (const M of g.__selectedObjectIds || []) {
            if (M === r) continue;
            const u = this.objectNodes.get(M);
            if (u) {
              u.updateMatrixWorld(!0);
              try {
                const y = new e.Box3().setFromObject(u);
                if ((s || !S(u)) && !y.isEmpty() && Number.isFinite(y.min.x)) {
                  y.expandByScalar(0.04);
                  const c = new e.Box3Helper(y, new e.Color(10980346));
                  c.material.transparent = !0, c.material.opacity = 0.6, c.material.depthTest = !1, c.renderOrder = 9997, this.selectionGroup.add(c);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(g) {
      const t = this.objectNodes.get(g);
      if (!t) return [];
      const r = [], i = /* @__PURE__ */ new Set();
      return t.traverse((l) => {
        const s = l.isBone ? l.name : "";
        !s || i.has(s) || r.length >= 256 || (i.add(s), r.push(s));
      }), r;
    },
    /**
     * World position of `boneName` (or the model's animated centre when no bone
     * is named) at an arbitrary frame.
     *
     * The mixer is the only thing that knows where a bone sits at a given time,
     * so the model is posed at `frame`, probed, then posed back: a probe for a
     * frame other than the playhead must not leave the viewport showing it.
     */
    sampleModelPoint(g, t, r, i = 24) {
      const l = this.objectNodes.get(g);
      if (!l) return null;
      const s = this.models.get(g), n = s?.mixer && s.duration > 0, b = n ? s.mixer.time : null;
      n && (s.mixer.setTime(Math.max(0, r) / Math.max(1, i) % s.duration), l.updateMatrixWorld(!0));
      let M = null;
      if (t) {
        let u = null;
        if (l.traverse((y) => {
          !u && y.isBone && y.name === t && (u = y);
        }), u) {
          const y = new e.Vector3().setFromMatrixPosition(u.matrixWorld);
          M = [y.x, y.y, y.z];
        }
      } else
        M = this.getObjectWorldCenter(g);
      return n && Number.isFinite(b) && (s.mixer.setTime(b), l.updateMatrixWorld(!0)), M;
    },
    getObjectWorldBounds(g) {
      const t = this.objectNodes.get(g);
      if (!t) return null;
      t.updateWorldMatrix(!0, !0);
      const r = new e.Box3().setFromObject(t, !0), i = r.min.toArray(), l = r.max.toArray();
      return !r.isEmpty() && [...i, ...l].every(Number.isFinite) ? { min: i, max: l } : null;
    },
    getObjectWorldCenter(g) {
      const t = this.objectNodes.get(g);
      if (!t) return null;
      t.updateMatrixWorld(!0);
      const r = [];
      if (t.traverse((s) => {
        s.isBone && r.push(s);
      }), r.length > 0) {
        const s = new e.Vector3(), n = new e.Vector3();
        for (const b of r)
          b.getWorldPosition(n), s.add(n);
        return s.divideScalar(r.length), [s.x, s.y, s.z];
      }
      const i = new e.Box3().setFromObject(t);
      if (!i.isEmpty() && Number.isFinite(i.min.x)) {
        const s = i.getCenter(new e.Vector3());
        return [s.x, s.y, s.z];
      }
      const l = new e.Vector3();
      return t.getWorldPosition(l), [l.x, l.y, l.z];
    },
    /** Every bone name in a loaded model, for the Rig Mapper (design spec 23). */
    getModelBoneNames(g) {
      const t = this.objectNodes.get(g);
      if (!t) return [];
      const r = [];
      return t.traverse((i) => {
        i.isBone && i.name && r.push(i.name);
      }), r;
    },
    /** Resolve one loaded bone by name, plus its world position. */
    resolveModelBone(g, t) {
      const r = this.objectNodes.get(g);
      if (!r || !t) return null;
      let i = null;
      if (r.traverse((s) => {
        !i && s.isBone && s.name === t && (i = s);
      }), !i) return null;
      i.updateWorldMatrix(!0, !1);
      const l = new e.Vector3();
      return i.getWorldPosition(l), { name: t, world: [l.x, l.y, l.z] };
    },
    /**
     * Apply an FK pose to a loaded character (design spec section 29,
     * ui.characterRuntime.applyPose). `boneMap` is canonical joint -> bone name;
     * `joints` is canonical joint -> local quaternion [x,y,z,w]. Bones not named
     * by `joints` are left at their bind rotation, captured once per bone.
     */
    applyCharacterPose(g, t, r) {
      const i = this.objectNodes.get(g);
      if (!i) return !1;
      const l = /* @__PURE__ */ new Map();
      if (i.traverse((n) => {
        n.isBone && n.name && l.set(n.name, n);
      }), !l.size) return !1;
      for (const n of l.values())
        n.userData.omnicamBindQuat || (n.userData.omnicamBindQuat = n.quaternion.clone());
      const s = r && typeof r == "object" ? r : {};
      for (const [n, b] of Object.entries(t || {})) {
        const M = l.get(b);
        if (!M) continue;
        const u = s[n];
        Array.isArray(u) && u.length === 4 && u.every(Number.isFinite) ? M.quaternion.fromArray(u).normalize() : M.userData.omnicamBindQuat && M.quaternion.copy(M.userData.omnicamBindQuat), M.updateMatrixWorld(!0);
      }
      return this.invalidate(), !0;
    },
    /**
     * Read the current local rotation of every mapped canonical joint -- what
     * "Bake current frame to pose" samples off the live mixer (design spec
     * section 27). A joint still at its captured bind rotation is omitted.
     */
    sampleCharacterBonePose(g, t) {
      const r = this.objectNodes.get(g);
      if (!r || !t) return {};
      const i = /* @__PURE__ */ new Map();
      r.traverse((s) => {
        s.isBone && s.name && i.set(s.name, s);
      });
      const l = {};
      for (const [s, n] of Object.entries(t)) {
        const b = i.get(n);
        if (!b) continue;
        const M = b.userData.omnicamBindQuat;
        M && b.quaternion.angleTo(M) < 1e-4 || (l[s] = b.quaternion.toArray());
      }
      return l;
    }
  };
}
function Yt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: p, OBJLoader: G, PLYLoader: m, STLLoader: v, neutral: x, wire: R, checkerMaterial: T, objectMaterial: A, applyModelMaterial: j, disposeObject: U, textureFor: E, cardMesh: Q, generatePointField: J, sampleCamera: Z, sampleObjectTransform: re } = o;
  function S(g) {
    const t = g.supersampleFactor?.() || 1;
    return { w: g.canvas.width / t, h: g.canvas.height / t };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(g) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = S(this);
      this.pointer.set(g[0] / t * 2 - 1, -(g[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const n of this.raycaster.intersectObjects(this.path.children, !0)) {
        const b = wt(n);
        if (b) return { ...b, position: n.object.position.toArray() };
      }
      const i = 16 * Math.min(2, window.devicePixelRatio || 1);
      let l = null;
      const s = new e.Vector3();
      for (const n of this.path.children) {
        const b = n.userData?.omnicamPathKey;
        if (!b || (s.copy(n.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const M = (s.x * 0.5 + 0.5) * t, u = (1 - (s.y * 0.5 + 0.5)) * r, y = Math.hypot(g[0] - M, g[1] - u);
        y <= i && (!l || y < l.distance) && (l = { key: b, position: n.position.toArray(), distance: y });
      }
      return l ? { ...l.key, position: l.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(g) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = S(this);
      this.pointer.set(g[0] / t * 2 - 1, -(g[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const n of this.raycaster.intersectObjects(this.path.children, !0)) {
        const b = pt(n);
        if (b) return { ...b, position: n.object.position.toArray() };
      }
      const i = 14 * Math.min(2, window.devicePixelRatio || 1);
      let l = null;
      const s = new e.Vector3();
      for (const n of this.path.children) {
        const b = n.userData?.omnicamCurveHandle;
        if (!b || (s.copy(n.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const M = (s.x * 0.5 + 0.5) * t, u = (1 - (s.y * 0.5 + 0.5)) * r, y = Math.hypot(g[0] - M, g[1] - u);
        y <= i && (!l || y < l.distance) && (l = { handle: b, position: n.position.toArray(), distance: y });
      }
      return l ? { ...l.handle, position: l.position } : null;
    },
    configureCamera(g, t) {
      const r = g || defaultCamera(), i = Math.max(5e-4, Number(r.near) || 0.01), l = Math.max(i + 1, Number(r.far) || 1e4);
      let s;
      if (r.camera_type === "orthographic") {
        s = this.orthographic;
        const c = 5 / Math.max(0.01, r.zoom || 1);
        s.left = -c * t, s.right = c * t, s.top = c, s.bottom = -c, s.near = i, s.far = l, s.updateProjectionMatrix();
      } else
        s = this.perspective, s.fov = e.MathUtils.clamp(Number(r.fov) || 35, 1, 175), s.aspect = t, s.near = i, s.far = l, s.updateProjectionMatrix();
      const n = new e.Vector3().fromArray(r.position || [6, 4, 6]), b = new e.Vector3().fromArray(r.target || [0, 1.5, 0]), M = b.clone().sub(n);
      M.lengthSq() < 1e-6 ? M.set(0, 0, -1) : M.normalize();
      let u = r.up ? new e.Vector3().fromArray(r.up) : new e.Vector3(0, 1, 0), y = new e.Vector3().crossVectors(M, u);
      if (y.lengthSq() < 1e-6 && (u = Math.abs(M.y) > 0.9 ? new e.Vector3(0, 0, M.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), y.crossVectors(M, u)), y.normalize(), u.crossVectors(y, M).normalize(), r.roll) {
        const c = e.MathUtils.degToRad(r.roll);
        y.applyAxisAngle(M, c), u.applyAxisAngle(M, c);
      }
      return s.position.copy(n), s.up.copy(u), s.lookAt(b), s.updateMatrixWorld(), s;
    },
    pick(g, t, r, i) {
      if (!this.activeCamera) return null;
      this.pointer.set(g / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const l = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const s of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          s.object?.userData?.omnicamType && l.push({
            distance: s.distance,
            type: s.object.userData.omnicamType,
            id: s.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const s of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (s.object?.userData?.omnicamCaptureGuide || s.object?.userData?.omnicamHelper) continue;
          let n = s.object;
          for (; n && !n.userData?.omnicamId; ) n = n.parent;
          n?.userData?.omnicamId && l.push({
            distance: s.distance,
            type: "object",
            id: n.userData.omnicamId
          });
        }
      return l.length ? (l.sort((s, n) => s.distance - n.distance), { type: l[0].type, id: l[0].id }) : null;
    },
    /**
     * World point -> logical viewport pixels, for the DOM label overlay
     * (design spec section 14). `behind` is true when the point is outside the
     * near/far clip and the caller should hide its label.
     */
    projectWorldToScreen(g) {
      if (!this.activeCamera || !Array.isArray(g) || g.length < 3) return null;
      const { w: t, h: r } = S(this), i = new e.Vector3(Number(g[0]) || 0, Number(g[1]) || 0, Number(g[2]) || 0);
      return i.project(this.activeCamera), {
        x: (i.x * 0.5 + 0.5) * t,
        y: (1 - (i.y * 0.5 + 0.5)) * r,
        behind: i.z < -1 || i.z > 1,
        width: t,
        height: r
      };
    },
    pickSubElement(g, t, r, i, l = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(g / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const s = this.raycaster.intersectObjects(this.content.children, !0);
      for (const n of s) {
        let b = n.object, M = n.object;
        for (; b && !b.userData.omnicamId; ) b = b.parent;
        if (!b?.userData.omnicamId || !M.geometry) continue;
        const u = b.userData.omnicamId, c = M.geometry.getAttribute("position");
        if (!c) continue;
        M.updateMatrixWorld(!0);
        const D = M.matrixWorld;
        if (l === "vertex") {
          let a = -1, _ = 1 / 0, w = null;
          if (n.face) {
            const C = [n.face.a, n.face.b, n.face.c];
            for (const h of C) {
              const B = new e.Vector3(c.getX(h), c.getY(h), c.getZ(h)).applyMatrix4(D), O = B.distanceTo(n.point);
              O < _ && (_ = O, a = h, w = [B.x, B.y, B.z]);
            }
          } else
            for (let C = 0; C < c.count; C++) {
              const h = new e.Vector3(c.getX(C), c.getY(C), c.getZ(C)).applyMatrix4(D), B = h.distanceTo(n.point);
              B < _ && (_ = B, a = C, w = [h.x, h.y, h.z]);
            }
          if (w)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: u,
              index: a,
              point: w
            };
        }
        if (l === "edge" && n.face) {
          const a = new e.Vector3(c.getX(n.face.a), c.getY(n.face.a), c.getZ(n.face.a)).applyMatrix4(D), _ = new e.Vector3(c.getX(n.face.b), c.getY(n.face.b), c.getZ(n.face.b)).applyMatrix4(D), w = new e.Vector3(c.getX(n.face.c), c.getY(n.face.c), c.getZ(n.face.c)).applyMatrix4(D), C = (V, z, P) => {
            const q = new e.Line3(z, P), I = new e.Vector3();
            return q.closestPointToPoint(V, !0, I), { dist: V.distanceTo(I), point: I, segment: [z, P] };
          }, h = C(n.point, a, _), B = C(n.point, _, w), O = C(n.point, w, a), k = [h, B, O].reduce((V, z) => z.dist < V.dist ? z : V);
          return {
            type: "edge",
            mode: "edge",
            objectId: u,
            point: [k.point.x, k.point.y, k.point.z],
            edge: [
              [k.segment[0].x, k.segment[0].y, k.segment[0].z],
              [k.segment[1].x, k.segment[1].y, k.segment[1].z]
            ]
          };
        }
        if (l === "face" && n.face) {
          const a = new e.Vector3(c.getX(n.face.a), c.getY(n.face.a), c.getZ(n.face.a)).applyMatrix4(D), _ = new e.Vector3(c.getX(n.face.b), c.getY(n.face.b), c.getZ(n.face.b)).applyMatrix4(D), w = new e.Vector3(c.getX(n.face.c), c.getY(n.face.c), c.getZ(n.face.c)).applyMatrix4(D), C = new e.Vector3().add(a).add(_).add(w).divideScalar(3), h = n.face.normal.clone().transformDirection(D);
          return {
            type: "face",
            mode: "face",
            objectId: u,
            faceIndex: n.faceIndex,
            point: [C.x, C.y, C.z],
            normal: [h.x, h.y, h.z],
            vertices: [
              [a.x, a.y, a.z],
              [_.x, _.y, _.z],
              [w.x, w.y, w.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(g, t, r, i) {
      if (!this.activeCamera) return null;
      this.pointer.set(g / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const l = this.raycaster.intersectObjects(this.content.children, !0);
      if (l.length > 0)
        return [l[0].point.x, l[0].point.y, l[0].point.z];
      const s = new e.Plane(new e.Vector3(0, 1, 0), 0), n = new e.Vector3();
      return this.raycaster.ray.intersectPlane(s, n) ? [n.x, n.y, n.z] : null;
    }
  };
}
const pe = ["high", "balanced", "low"], Kt = 25, Ae = 30, Ht = 0.6;
function ke(o = "balanced") {
  return { quality: o, samples: [], downgraded: !1 };
}
function Qt(o) {
  const e = pe.indexOf(o);
  return e < 0 || e >= pe.length - 1 ? null : pe[e + 1];
}
function Zt(o, e) {
  if (!Number.isFinite(e) || e < 0 || (o.samples.push(e), o.samples.length > Ae && o.samples.shift(), o.samples.length < Ae) || o.samples.filter((G) => G > Kt).length / o.samples.length < Ht) return null;
  const p = Qt(o.quality);
  return p ? (o.quality = p, o.downgraded = !0, o.samples = [], p) : null;
}
function Jt(o, e) {
  return o.quality = e, o.samples = [], o.downgraded = !1, o;
}
function Et(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: p, OBJLoader: G, PLYLoader: m, STLLoader: v, neutral: x, wire: R, checkerMaterial: T, objectMaterial: A, applyModelMaterial: j, disposeObject: U, textureFor: E, cardMesh: Q, generatePointField: J, sampleCamera: Z, sampleObjectTransform: re, hasOutlineMesh: S, SelectionOutlineRenderer: g } = o;
  return {
    render(t, r, i, l, s, n = /* @__PURE__ */ new Map(), b = 0, M = !1, u = "camera", y = "subject", c = null, D = null) {
      const a = !M || (t.render_mode || "") === "beauty";
      if (a !== this.studioEnabled) {
        this.studioEnabled = a, Ne(e, this.scene, this.renderer, this.studio, a);
        for (const f of this.flatLights || []) f.visible = !a;
      }
      const _ = !!t.objects?.some((f) => f.type === "sun_light" && f.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !_ && a), this.flatLights?.[1] && (this.flatLights[1].visible = !_ && !a), this.disposed) return;
      (this.canvas.width !== l || this.canvas.height !== s) && this.renderer.setSize(l, s, !1);
      const w = (r && r.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const C = t.viewport_bg_sequence && t.viewport_bg_sequence.length ? t.viewport_bg_sequence[b % t.viewport_bg_sequence.length] : t.viewport_bg_image || "";
      if (C) {
        this.bgImageUrl = C;
        const f = this.bgTextureCache.get(C);
        if (f)
          this.bgTextureCache.delete(C), this.bgTextureCache.set(C, f), this.bgTexture = f, this.scene.background = f;
        else if (!this.bgTextureLoads.has(C)) {
          const L = this.bgLoadGeneration;
          this.bgTextureLoads.set(C, L), new e.TextureLoader().load(C, (F) => {
            if (this.bgTextureLoads.delete(C), this.disposed || L !== this.bgLoadGeneration) {
              F.dispose();
              return;
            }
            for (F.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(C, F); this.bgTextureCache.size > 8; ) {
              const $ = [...this.bgTextureCache.keys()].find((N) => N !== this.bgImageUrl);
              if (!$) break;
              const Y = this.bgTextureCache.get($);
              this.bgTextureCache.delete($), Y?.dispose?.();
            }
            this.bgImageUrl === C && (this.bgTexture = F, this.scene.background = F), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(C);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const L of new Set(this.bgTextureCache.values())) L.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const f = t.viewport_bg_color && t.viewport_bg_color !== Pe;
        this.scene.background = this.studioEnabled && !f && !w ? this.studio.sky : new e.Color(f ? t.viewport_bg_color : this.studioEnabled && w ? 1447709 : Pe);
      }
      const h = JSON.stringify([
        t.render_mode,
        t.card_fit,
        t.point_density,
        t.point_spread,
        !!t.show_wireframe,
        !!t.show_vertices,
        !!t.backface_culling,
        t.reconstruction_appearance || "neutral",
        !!M,
        t.objects.map((f) => {
          const { position: L, rotation: W, keyframes: F, size: $, ...Y } = f;
          return f.type === "card" && (Y.size = $), Y;
        })
      ]), B = [...i.entries()].map(([f, L]) => `${f}:${L?.src || ""}`).join("|"), O = [...n.entries()].map(([f, L]) => `${f}:${L}`).join("|");
      (h !== this.sceneKey || B !== this.mediaSignature || O !== this.modelSignature) && (this.sceneKey = h, this.mediaSignature = B, this.modelSignature = O, this.rebuild(t, i, n, M));
      const k = Math.max(1, t.fps || 24), V = /* @__PURE__ */ new Map();
      for (const f of t.objects)
        f.character?.motion && this.models.has(f.id) && V.set(f.id, f.character.motion);
      for (const [f, L] of this.models) {
        if (!L.mixer || !(L.duration > 0)) continue;
        const W = V.get(f);
        W ? (this.applyMotionClip?.(f, W), L.mixer.setTime(gt(W, b, k, L.duration))) : L.mixer.setTime(b / k % L.duration);
      }
      for (const f of t.objects) {
        const L = this.objectNodes.get(f.id);
        if (!L) continue;
        const W = f.keyframes?.length ? re(f, b) : f;
        L.position.fromArray(W.position || [0, 0, 0]), L.rotation.set(...(W.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), f.type !== "card" && f.type !== "null" && L.scale.fromArray(W.size || [1, 1, 1]), f.type === "null" && (L.visible = M ? !0 : t.show_helper_axes !== !1);
      }
      this.path.visible = !M;
      const z = t.show_grid !== !1 && t.render_mode !== "point_field";
      this.content.traverse((f) => {
        f.userData.omnicamCaptureGuide && (f.visible = M ? !!t.playblast_grid : z);
      });
      const P = t.view_mode || "camera", q = `${P}:${u}:${D ?? ""}:${t.__omnicamRevision ?? JSON.stringify([
        t.active_camera_id,
        (t.cameras || []).map((f) => [f.id, f.keyframes?.length, f.keyframes?.map((L) => [L.frame, L.camera?.position, L.camera?.target, L.interpolation, L.tangents])]),
        (t.objects || []).map((f) => [f.id, f.keyframes?.length, f.keyframes?.map((L) => [L.frame, L.transform?.position])])
      ])}`;
      if (q !== this.pathKey && (this.pathKey = q, this.rebuildPath(t, u, D, P)), this.updateLiveCameras(t, b, M, P, u, D), this.liveCameras.visible = !M, !M) {
        const f = t.show_camera_paths !== !1, L = t.show_camera_gizmos !== !1, W = t.show_look_at !== !1;
        for (const F of [this.path, this.liveCameras])
          F.traverse(($) => {
            const Y = $.userData.omnicamWidget;
            Y === "path" ? $.visible = f : Y === "gizmo" ? $.visible = L : Y === "lookat" && ($.visible = W);
          });
      }
      const I = l / Math.max(1, s), X = this.configureCamera(r, I);
      if (this.activeCamera = X, M ? this.selectionGroup.visible = !1 : (this.updateSelection(t, u, y, c, `${t.__omnicamRevision ?? "legacy"}:${b}`, w), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const f = new e.Box3();
        this.content.traverse((W) => {
          if (!W.isMesh || W.userData.omnicamCaptureGuide) return;
          W.castShadow = !0, W.receiveShadow = !0, W.updateWorldMatrix(!0, !1);
          const F = new e.Box3().setFromObject(W);
          !F.isEmpty() && Number.isFinite(F.min.x) && f.union(F);
        });
        const L = this.studio?.key;
        if (L) {
          const W = f.isEmpty() ? new e.Vector3() : f.getCenter(new e.Vector3()), F = f.isEmpty() ? new e.Vector3(12, 12, 12) : f.getSize(new e.Vector3()), $ = Math.max(1, 0.5 * Math.max(F.x, F.y, F.z) * Math.SQRT2), Y = $ * 1.15 + 0.5, N = new e.Vector3(4.5, 7.5, 3.5).normalize(), te = Math.max(12, $ * 4);
          L.position.copy(W).addScaledVector(N, te), L.target.position.copy(W), L.target.updateMatrixWorld(!0);
          const oe = L.shadow.camera;
          oe.left = -Y, oe.right = Y, oe.top = Y, oe.bottom = -Y, oe.near = Math.max(0.1, te - $ - 1), oe.far = te + $ + 1, oe.updateProjectionMatrix(), L.shadow.map?.dispose(), L.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((f) => {
        f.userData.omnicamBillboard && f.quaternion.copy(X.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, l, s);
      const H = performance.now();
      let K = !1;
      if (!M && !w && u === "object" && (y || t.__selectedObjectIds?.length) && !c) {
        const f = t.__selectedObjectIds?.length ? t.__selectedObjectIds : y ? [y] : [], L = [];
        for (const W of f) {
          const F = this.objectNodes.get(W);
          F && S(F) && L.push(F);
        }
        L.length && (this.outlineRenderer || (this.outlineRenderer = new g(this.renderer, this.scene, void 0, X)), this.outlineRenderer.render(X, l, s, L), K = !0);
      }
      if (K || this.renderer.render(this.scene, X), !M && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= ke(this.studio?.quality);
        const f = Zt(this.qualityMonitor, performance.now() - H);
        f && (Ve(this.studio, this.renderer, f), this.onQualityDowngrade?.(f));
      }
    },
    setViewportQuality(t) {
      Ve(this.studio, this.renderer, t), this.qualityMonitor = Jt(this.qualityMonitor || ke(t), t);
    },
    // Supersample multiple the host blit renders the interactive viewport at
    // before scaling it back down -- the cheapest edge antialiasing there is.
    // 1 while the studio look is off (a neutral capture), and 1 at "low" so a
    // struggling GPU is never asked to draw more pixels.
    supersampleFactor() {
      return this.studioEnabled && Ct(this.studio?.quality).renderScale || 1;
    },
    dispose() {
      if (!this.disposed) {
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), U(this.content), U(this.path), U(this.liveCameras), U(this.selectionGroup);
        for (const t of new Set(this.bgTextureCache.values())) t.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const t of this.models.values()) U(t.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.outlineRenderer?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
const eo = {
  EffectComposer: Qe,
  OutlinePass: He,
  OutputPass: Ke,
  RenderPass: Ye,
  Vector2: Te
};
function to(o) {
  let e = !1;
  return o?.traverse?.((d) => {
    e || d.visible === !1 || !d.isMesh || d.userData?.omnicamHelper || d.userData?.omnicamCaptureGuide || (e = !!(d.geometry && d.material));
  }), e;
}
class oo {
  constructor(e, d, p = eo, G = null) {
    const { EffectComposer: m, RenderPass: v, OutlinePass: x, OutputPass: R, Vector2: T } = p;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new m(e), this.renderPass = new v(d, G), this.outlinePass = new x(new T(1, 1), d, G, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new R(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, d, p, G) {
    this.disposed || ((d !== this.width || p !== this.height) && (this.width = d, this.height = p, this.composer.setSize(d, p)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...G], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const Oe = { low: Ot, balanced: kt, high: At }, ce = new xe({ color: 10265519, roughness: 0.48, metalness: 0.06, side: ee }), qe = new xe({ color: 2237998, roughness: 0.95, metalness: 0, side: ee }), ve = new ge({ color: 11449792, wireframe: !0, side: ee });
function Ce(o = !1) {
  const e = new Uint8Array([
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
  ]), d = new dt(e, 2, 2, ut);
  return d.wrapS = d.wrapT = mt, d.repeat.set(8, 8), d.colorSpace = Me, d.needsUpdate = !0, new xe({ map: d, roughness: 0.85, metalness: 0, side: o ? be : ee });
}
function ro(o, e, d = !1) {
  const p = e === "wireframe" ? "wireframe" : o.material_mode || "textured", G = d ? be : ee;
  if (p === "wireframe") {
    const v = ve.clone();
    return v.side = G, o.color && (v.color = new se(o.color)), v;
  }
  if (p === "checker") return Ce(d);
  if (p === "matte") {
    const v = qe.clone();
    return v.side = G, o.color && (v.color = new se(o.color)), v;
  }
  const m = ce.clone();
  return m.side = G, o.color && (m.color = new se(o.color)), m;
}
function ao(o, e, d = null, p = !1) {
  const G = p ? be : ee;
  o.traverse((m) => {
    if (m.isMesh) {
      if (m.userData.omnicamOriginalMaterial || (m.userData.omnicamOriginalMaterial = m.material), m.userData.omnicamOverrideMaterial) {
        const v = Array.isArray(m.material) ? m.material : [m.material];
        for (const x of v)
          x?.map?.dispose?.(), x?.dispose?.();
        m.userData.omnicamOverrideMaterial = !1;
      }
      if (e === "textured" || e === "wireframe_texture") {
        m.material = m.userData.omnicamOriginalMaterial;
        const v = Array.isArray(m.material) ? m.material : [m.material];
        for (const x of v)
          x && (x.side = G);
      } else if (e === "checker")
        m.material = Ce(p), m.userData.omnicamOverrideMaterial = !0;
      else if (e === "wireframe") {
        const v = ve.clone();
        v.side = G, d?.color && (v.color = new se(d.color)), m.material = v, m.userData.omnicamOverrideMaterial = !0;
      } else if (e === "matte") {
        const v = qe.clone();
        v.side = G, d?.color && (v.color = new se(d.color)), m.material = v, m.userData.omnicamOverrideMaterial = !0;
      } else {
        const v = ce.clone();
        v.side = G, d?.color && (v.color = new se(d.color)), m.material = v, m.userData.omnicamOverrideMaterial = !0;
      }
    }
  });
}
function ye(o, e = !1) {
  o.traverse((d) => {
    if (d.userData.omnicamModelResource && !e) return;
    d.geometry?.dispose?.();
    const p = Array.isArray(d.material) ? d.material : [d.material];
    for (const G of p)
      G?.map?.dispose?.(), G?.dispose?.();
  });
}
function Xe(o) {
  if (!o) return null;
  const e = o instanceof HTMLVideoElement ? new ht(o) : new ft(o);
  return e.colorSpace = Me, e.needsUpdate = !0, e;
}
function so(o, e, d) {
  const [p, G] = o.size || [2, 3], m = new ae(), v = new ue(new Se(p, G), new ge({ color: 1448482, side: ee, transparent: !0, opacity: 0.85 }));
  v.frustumCulled = !1, m.add(v);
  const x = Xe(e);
  if (!x) return m;
  const R = e.videoWidth || e.naturalWidth || e.width || p, T = e.videoHeight || e.naturalHeight || e.height || G, A = R / Math.max(1, T), j = p / Math.max(0.01, G);
  let U = p, E = G;
  d === "contain" ? A > j ? E = p / A : U = G * A : d === "cover" && (A > j ? (x.repeat.x = j / A, x.offset.x = (1 - x.repeat.x) * 0.5) : (x.repeat.y = A / j, x.offset.y = (1 - x.repeat.y) * 0.5));
  const Q = new ue(
    new Se(U, E),
    new ge({
      color: 16777215,
      map: x,
      side: ee,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return Q.frustumCulled = !1, Q.position.z = 2e-3, m.add(Q), m.frustumCulled = !1, m;
}
class no {
  constructor(e = () => {
  }, d = () => {
  }) {
    this.canvas = document.createElement("canvas"), this.renderer = new Ze({
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
    }), this.renderer.setPixelRatio(1), this.renderer.outputColorSpace = Me, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = Je, this.scene = new Ee(), this.scene.background = new se(1184274), this.scene.add(new et(16777215, 3159099, 2.2));
    const p = new tt(16777215, 2.4);
    p.position.set(5, 8, 4), this.scene.add(p), this.flatLights = [this.scene.children.at(-2), p], this.studio = Bt(we, this.renderer, _t), this.scene.add(this.studio.group), this.studioEnabled = !0, Ne(we, this.scene, this.renderer, this.studio, !0), this.content = new ae(), this.scene.add(this.content), this.path = new ae(), this.scene.add(this.path), this.liveCameras = new ae(), this.scene.add(this.liveCameras), this.selectionGroup = new ae(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ot(35, 16 / 9, 0.01, 1e4), this.orthographic = new rt(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = d, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new at(), this.pointer = new Te(), this.activeCamera = this.perspective;
  }
  async loadModel(e, d, p = "glb") {
    const G = `${p}:${d}`;
    if (!(!d || this.modelLoads.get(e) === G)) {
      this.modelLoads.set(e, G);
      try {
        let m, v = [];
        if (p === "obj") m = await new Fe().loadAsync(d);
        else if (p === "fbx")
          m = await new ze().loadAsync(d), v = m.animations || [];
        else if (p === "stl") m = new ue(await new We().loadAsync(d), ce.clone());
        else if (p === "ply") {
          const r = await new je().loadAsync(d);
          r.index ? (r.getAttribute("normal") || r.computeVertexNormals(), m = new ue(r, ce.clone())) : m = new st(r, new nt({ color: 11449792, size: 0.025 }));
        } else {
          const r = await new Ie().loadAsync(d);
          m = r.scene, v = r.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== G) {
          ye(m, !0);
          return;
        }
        const x = this.models.get(e);
        x && ye(x.scene, !0), m.traverse((r) => {
          if (r.userData.omnicamModelResource = !0, r.frustumCulled = !1, r.isMesh && (r.frustumCulled = !1, r.material)) {
            const i = Array.isArray(r.material) ? r.material : [r.material];
            for (const l of i)
              l.side = ee;
          }
          r.isPoints && (r.frustumCulled = !1), r.isSkinnedMesh && (r.frustumCulled = !1, r.computeBoundingBox?.(), r.computeBoundingSphere?.());
        });
        let R = 0, T = 0, A = 0, j = 0;
        m.traverse((r) => {
          r.isMesh && (R += 1, j += r.geometry?.getAttribute?.("position")?.count || 0), r.isPoints && (T += 1), r.isBone && (A += 1);
        });
        const U = new ae();
        if (U.frustumCulled = !1, U.add(m), !R && !T && A) {
          const r = new it(m);
          r.material.depthTest = !1, r.material.opacity = 0.9, r.material.transparent = !0, r.renderOrder = 10, r.userData.omnicamModelResource = !0, U.add(r);
        }
        U.updateMatrixWorld(!0);
        const E = new ct().setFromObject(U), Q = E.getSize(new Ge()), J = Math.max(Q.x, Q.y, Q.z), Z = Number.isFinite(J) && J > 1e-6 ? 2.5 / J : 1, re = E.getCenter(new Ge());
        U.scale.setScalar(Z), U.position.set(-re.x * Z, -E.min.y * Z, -re.z * Z);
        const S = new ae();
        S.frustumCulled = !1, S.add(U);
        const g = v.length ? new lt(m) : null;
        g && g.clipAction(v[0]).play();
        const t = { url: d, format: p, scene: S, mixer: g, clips: v, selectedClip: 0, duration: v[0]?.duration || 0, meshes: R, points: T, bones: A, vertices: j, animations: v.length, normalizationScale: Z };
        this.models.set(e, t), this.onModelLoaded({ id: e, format: p, meshes: R, points: T, bones: A, vertices: j, animations: v.length, animationNames: v.map((r, i) => r.name || `Clip ${i + 1}`), duration: t.duration, normalizationScale: Z }), this.sceneKey = "", this.invalidate();
      } catch (m) {
        this.modelLoads.get(e) === G && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${p.toUpperCase()} ${e}`, m);
        const v = m?.message?.includes("FBX version not supported") || m?.message?.includes("6100") || m?.message?.includes("6000"), x = v ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : m?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: p, error: x, isLegacyFBX: v });
      }
    }
  }
}
const le = { THREE: we, FBXLoader: ze, GLTFLoader: Ie, OBJLoader: Fe, PLYLoader: je, STLLoader: We, neutral: ce, wire: ve, checkerMaterial: Ce, objectMaterial: ro, applyModelMaterial: ao, disposeObject: ye, textureFor: Xe, cardMesh: so, generatePointField: yt, sampleCamera: Mt, sampleObjectTransform: xt, hasOutlineMesh: to, SelectionOutlineRenderer: oo };
Object.assign(
  no.prototype,
  Xt(le),
  $t(le),
  Yt(le),
  Et(le)
);
async function io(o, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const d of ["vp9", "vp8"])
    try {
      if (await de(Tt(d, { width: o, height: e }), 5e3, `Checking ${d} support`)) return d;
    } catch {
    }
  return null;
}
function de(o, e, d) {
  let p;
  return Promise.race([
    o,
    new Promise((G, m) => {
      p = setTimeout(() => m(new Error(`${d} timed out`)), e);
    })
  ]).finally(() => clearTimeout(p));
}
async function po(o, e, d, p, G, m = "balanced") {
  const v = await io(o.width, o.height);
  if (!v) throw new Error("No supported WebCodecs WebM encoder");
  const x = new St({ format: new Pt(), target: new Vt() }), R = new Dt(o, { codec: v, quality: Oe[m] || Oe.balanced, keyFrameInterval: 1 });
  x.addVideoTrack(R, { frameRate: d }), await de(x.start(), 1e4, "Starting deterministic encoder");
  try {
    const T = 1 / d;
    for (let A = 0; A < e; A++) {
      if (G?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await p(A), await de(R.add(A * T, T, { keyFrame: A % d === 0 }), 1e4, `Encoding frame ${A + 1}`);
    }
    await de(x.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (T) {
    throw x.state !== "finalized" && await x.cancel().catch(() => {
    }), T;
  }
  return Lt(new Blob([x.target.buffer], { type: await x.getMimeType() }), {
    encoder: "webcodecs",
    requestedFrames: e,
    expectedDurationMs: e / d * 1e3,
    recordedDurationMs: e / d * 1e3,
    driftMs: 0,
    fps: d,
    width: o.width,
    height: o.height
  });
}
export {
  no as OmniWebGLViewport,
  po as encodeDeterministicPlayblast,
  io as supportsDeterministicEncoding
};
