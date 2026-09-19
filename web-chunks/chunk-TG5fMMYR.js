import { T as xe } from "./chunk-__IQ4xkd.js";
import { V as ze, a as Ye, O as He, b as Qe, E as Ze, W as Je, S as Ce, P as Ee, c as et, C as ce, H as tt, D as rt, G as ie, d as ot, e as at, f as st, g as We, F as je, M as fe, h as Ie, i as Be, j as Ne, k as nt, l as it, m as Ue, n as ae, o as ct, B as lt, p as De, A as dt, q as be, r as Le, s as Pe, t as mt, u as ut, v as ht, w as ft, x as pt } from "./vendor-three-BQUrLQkn.js";
import { T as ye, bR as wt, bS as gt, bT as yt, ba as Mt, a as xt, C as bt } from "./chunk-1zyvhFxD.js";
import { r as vt, q as Ct, a as Ae, s as Re, D as Ve, c as Bt, b as Lt, d as St } from "./chunk-DhgpSDjP.js";
import { c as Gt } from "./chunk-a2yd8Eqb.js";
import { n as _t } from "./chunk-Bwz6xzPH.js";
import { Output as Dt, BufferTarget as Pt, WebMOutputFormat as At, CanvasSource as Vt, QUALITY_HIGH as Ot, QUALITY_MEDIUM as kt, QUALITY_LOW as Tt, canEncodeVideo as Ft } from "./vendor-mediabunny-CZ5VNE-V.js";
function zt(a, { position: e, forward: m, up: w, color: G, scale: h = 1, active: v = !0 }) {
  const b = new a.Group(), X = v ? 0.95 : 0.5, j = new a.MeshBasicMaterial({
    color: G,
    transparent: !0,
    opacity: X,
    depthTest: !1
  }), I = new a.Mesh(new a.BoxGeometry(0.34, 0.24, 0.42), j);
  I.renderOrder = 912, b.add(I);
  const U = new a.Mesh(new a.ConeGeometry(0.17, 0.26, 20), j);
  return U.rotation.x = -Math.PI / 2, U.position.z = -0.32, U.renderOrder = 912, b.add(U), b.scale.setScalar(h), b.position.copy(e), b.up.copy(w), b.lookAt(e.clone().add(m)), b;
}
function Wt(a, { position: e, color: m = 15903035, radius: w = 0.28, bold: G = !1 }) {
  const h = new a.Group(), v = G ? 16773544 : m, b = new a.LineBasicMaterial({ color: v, transparent: !0, opacity: G ? 1 : 0.95, depthTest: !1 }), X = (U) => {
    const q = [];
    for (let te = 0; te <= 48; te++) {
      const J = te / 48 * Math.PI * 2;
      q.push(new a.Vector3(Math.cos(J) * U, Math.sin(J) * U, 0));
    }
    const Z = new a.Line(new a.BufferGeometry().setFromPoints(q), b);
    return Z.renderOrder = 915, Z;
  };
  if (h.add(X(w)), G) {
    h.add(X(w * 1.18));
    const U = new a.Mesh(
      new a.RingGeometry(0, w * 0.3, 16),
      new a.MeshBasicMaterial({ color: v, transparent: !0, opacity: 1, depthTest: !1 })
    );
    U.renderOrder = 916, h.add(U);
  }
  const j = w * 1.55, I = new a.LineSegments(
    new a.BufferGeometry().setFromPoints([
      new a.Vector3(-j, 0, 0),
      new a.Vector3(-w * 0.45, 0, 0),
      new a.Vector3(w * 0.45, 0, 0),
      new a.Vector3(j, 0, 0),
      new a.Vector3(0, -j, 0),
      new a.Vector3(0, -w * 0.45, 0),
      new a.Vector3(0, w * 0.45, 0),
      new a.Vector3(0, j, 0)
    ]),
    b
  );
  return I.renderOrder = 915, h.add(I), h.position.copy(e), h.userData.omnicamBillboard = !0, h;
}
const qe = 3718648, jt = 12e3;
function pe(a) {
  return !!(a.isSkinnedMesh && a.skeleton);
}
function Xe(a, e) {
  a.position.copy(e.position), a.quaternion.copy(e.quaternion), a.scale.copy(e.scale);
}
function we(a) {
  return a.frustumCulled = !1, a.raycast = () => {
  }, a.userData.omnicamHelper = !0, a;
}
function It(a, e, { color: m = null, opacity: w = null } = {}) {
  const G = m ?? qe, h = w ?? 0.65;
  if (pe(e)) {
    const b = new a.SkinnedMesh(e.geometry.clone(), new a.MeshBasicMaterial({
      color: G,
      wireframe: !0,
      transparent: !0,
      opacity: h,
      depthWrite: !1
    }));
    return b.bindMode = e.bindMode, b.bind(e.skeleton, e.bindMatrix), Xe(b, e), { overlay: we(b), parent: e.parent || e };
  }
  const v = new a.LineSegments(
    new a.WireframeGeometry(e.geometry),
    new a.LineBasicMaterial({ color: G, opacity: h, transparent: !0, depthTest: !0 })
  );
  return { overlay: we(v), parent: e };
}
function Nt(a, e) {
  const m = new a.PointsMaterial({ color: qe, size: 0.05, sizeAttenuation: !0 });
  if (!pe(e)) {
    const U = new a.Points(e.geometry, m);
    return { overlay: we(U), parent: e };
  }
  const w = e.geometry.getAttribute("position")?.count || 0, G = Math.max(1, Math.ceil(w / jt)), h = Math.ceil(w / G), v = new Float32Array(h * 3), b = new a.BufferGeometry();
  b.setAttribute("position", new a.Float32BufferAttribute(v, 3));
  const X = new a.Points(b, m);
  Xe(X, e);
  const j = new a.Vector3(), I = b.getAttribute("position");
  return X.onBeforeRender = () => {
    for (let U = 0; U < h; U++)
      e.getVertexPosition(U * G, j), I.setXYZ(U, j.x, j.y, j.z);
    I.needsUpdate = !0;
  }, { overlay: we(X), parent: e.parent || e };
}
function Ut(a, e, m) {
  const w = pe(e) ? new a.SkinnedMesh(e.geometry.clone(), m) : new a.Mesh(e.geometry.clone(), m);
  return pe(e) && (w.bindMode = e.bindMode, w.bind(e.skeleton, e.bindMatrix)), w.matrixAutoUpdate = !1, w.matrix.copy(e.matrixWorld), w.frustumCulled = !1, w;
}
function Rt(a, e, { wireframe: m = !1, vertices: w = !1, wireframeColor: G = null, wireframeOpacity: h = null } = {}) {
  if (!m && !w) return;
  const v = [];
  e.traverse((b) => {
    b.isMesh && b.geometry && !b.userData.omnicamHelper && v.push(b);
  });
  for (const b of v) {
    if (m) {
      const { overlay: X, parent: j } = It(a, b, { color: G, opacity: h });
      j.add(X);
    }
    if (w) {
      const { overlay: X, parent: j } = Nt(a, b);
      j.add(X);
    }
  }
}
const qt = 16777215, ne = 0.17, Oe = 3593923, Xt = 0.06;
function $t(a) {
  const { THREE: e, FBXLoader: m, GLTFLoader: w, OBJLoader: G, PLYLoader: h, STLLoader: v, neutral: b, wire: X, checkerMaterial: j, objectMaterial: I, applyModelMaterial: U, disposeObject: q, textureFor: re, cardMesh: Z, generatePointField: te, sampleCamera: J, sampleObjectTransform: se } = a;
  return {
    removeModel(O) {
      const p = this.models.get(O);
      p && q(p.scene, !0), this.models.delete(O), this.modelLoads.delete(O), this.sceneKey = "";
    },
    selectAnimation(O, p) {
      const t = this.models.get(O);
      !t?.mixer || !t.clips.length || (t.selectedClip = Math.max(0, Math.min(t.clips.length - 1, Number(p) || 0)), t.duration = t.clips[t.selectedClip].duration || 0, t.motionClipId = null, t.mixer.stopAllAction(), t.mixer.clipAction(t.clips[t.selectedClip]).play(), this.invalidate());
    },
    /** Select the clip a character motion names (by clip name, else index, else
     * the first clip). Idempotent -- re-selecting the same clip is a no-op so the
     * per-frame render loop can call it freely (design spec section 27). */
    applyMotionClip(O, p) {
      const t = this.models.get(O);
      if (!t?.mixer || !t.clips.length) return;
      const o = String(p?.clip_id ?? "");
      if (t.motionClipId === o) return;
      let c = t.clips.findIndex((s) => (s.name || "").toLowerCase() === o.toLowerCase());
      c < 0 && /^\d+$/.test(o) && (c = Number(o)), (c < 0 || c >= t.clips.length) && (c = 0), t.selectedClip = c, t.motionClipId = o, t.duration = t.clips[c].duration || 0, t.mixer.stopAllAction();
      const d = t.mixer.clipAction(t.clips[c]);
      d.reset(), d.play(), this.invalidate();
    },
    rebuild(O, p, t, o = !1, c = "auto") {
      this.content.traverse((r) => {
        for (const D of [...r.children])
          D.userData.omnicamHelper && (r.remove(D), q(D, !0));
      }), q(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const d = O.render_mode, s = o && (c === "clay" || c === "motion_proxy"), i = (r, D) => {
        const C = b.clone();
        return C.side = D ? e.FrontSide : e.DoubleSide, r.color && (C.color = new e.Color(r.color)), C;
      }, x = (r) => s ? i(r, !!O.backface_culling) : I(r, d, !!O.backface_culling), u = new e.Group();
      u.userData.omnicamCaptureGuide = !0;
      const l = new e.GridHelper(120, 24, 4081496, 3291463);
      l.userData.omnicamCaptureGuide = !0, l.frustumCulled = !1, l.position.y = 5e-4, u.add(l);
      const g = new e.GridHelper(120, 120, 2238001, 1909035);
      g.userData.omnicamCaptureGuide = !0, g.frustumCulled = !1, u.add(g);
      const n = new e.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), L = new e.BufferGeometry().setFromPoints([new e.Vector3(-60, 1e-3, 0), new e.Vector3(60, 1e-3, 0)]), k = new e.Line(L, n);
      k.userData.omnicamCaptureGuide = !0, u.add(k);
      const F = new e.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), y = new e.BufferGeometry().setFromPoints([new e.Vector3(0, 1e-3, -60), new e.Vector3(0, 1e-3, 60)]), _ = new e.Line(y, F);
      if (_.userData.omnicamCaptureGuide = !0, u.add(_), this.content.add(u), ["omni_ref", "point_field"].includes(d)) {
        const { points: r, colors: D } = te(O.point_density || "balanced", O.point_spread || "all_views", O.point_color || null);
        if (r.length > 0) {
          const C = new e.BufferGeometry();
          C.setAttribute("position", new e.Float32BufferAttribute(r, 3)), C.setAttribute("color", new e.Float32BufferAttribute(D, 3));
          const z = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), M = new e.Points(C, z);
          M.frustumCulled = !1, this.content.add(M);
        }
      }
      if (!["grid", "point_field"].includes(d))
        for (const r of O.objects) {
          if (r.enabled === !1) continue;
          const D = r.size || [1, 1, 1];
          let C;
          if (r.type === "glb" || r.type === "model") {
            const M = t.get(r.id), P = this.models.get(r.id), V = r.format || (r.type === "glb" ? "glb" : "");
            M && (P?.url !== M || P?.format !== V) && this.loadModel(r.id, M, V);
            const S = !!O.backface_culling, A = o && c === "clay" ? "neutral" : vt(r, O, o) ?? (r.material_mode || "textured");
            P?.url === M && (C = P.scene, U(C, A, r, S));
          } else if (r.type === "sphere")
            C = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), x(r));
          else if (r.type === "cylinder")
            C = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), x(r));
          else if (r.type === "torus") {
            const M = new e.TorusGeometry(0.5, 0.2, 16, 32);
            M.rotateX(Math.PI / 2), C = new e.Mesh(M, x(r));
          } else if (r.type === "pyramid") {
            const M = new e.ConeGeometry(0.7, 1, 4);
            M.rotateY(Math.PI / 4), C = new e.Mesh(M, x(r));
          } else if (r.type === "sun_light") {
            const M = new e.Group(), P = new e.DirectionalLight(r.color || 16774892, r.intensity ?? 2.2);
            P.castShadow = r.cast_shadow !== !1, P.castShadow && (P.shadow.mapSize.set(1024, 1024), P.shadow.bias = -8e-4, P.shadow.normalBias = 0.02, P.shadow.radius = 2.4, P.shadow.camera.near = 0.5, P.shadow.camera.far = 70, P.shadow.camera.left = P.shadow.camera.bottom = -14, P.shadow.camera.right = P.shadow.camera.top = 14);
            const V = (r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), S = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(V[0], V[1], V[2], "YXZ"));
            P.target.position.copy(P.position).add(S.multiplyScalar(10)), M.add(P, P.target);
            const A = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: r.color || 16096779, wireframe: !0 })
            );
            A.userData.omnicamLightHelper = !0, A.visible = !o, M.add(A), C = M;
          } else if (r.type === "point_light") {
            const M = new e.Group(), P = new e.PointLight(r.color || 16777215, r.intensity ?? 2, 0, 2);
            M.add(P);
            const V = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: r.color || 16498468, wireframe: !0 })
            );
            V.userData.omnicamLightHelper = !0, V.visible = !o, M.add(V), C = M;
          } else if (r.type === "spot_light") {
            const M = new e.Group(), P = (r.cone_angle ?? 45) * Math.PI / 180, V = r.penumbra ?? 0.25, S = new e.SpotLight(r.color || 16777215, r.intensity ?? 3, 0, P, V, 2), A = (r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), N = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(A[0], A[1], A[2], "YXZ"));
            S.target.position.copy(S.position).add(N.multiplyScalar(10)), M.add(S, S.target);
            const $ = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: r.color || 3718648, wireframe: !0 })
            );
            $.userData.omnicamLightHelper = !0, $.visible = !o, M.add($), C = M;
          } else if (r.type === "human")
            C = new e.Mesh(Gt(e), x(r));
          else if (r.type === "ground") C = new e.Mesh(new e.BoxGeometry(1, 1, 1), x(r));
          else if (r.type === "card")
            C = !r.material_mode || ["textured", "wireframe_texture"].includes(r.material_mode) ? Z(r, p.get(r.id), O.card_fit || "contain") : new e.Mesh(new e.PlaneGeometry(D[0], D[1]), x(r));
          else if (r.type === "null") {
            const M = new e.AxesHelper(0.5);
            M.position.fromArray(r.position || [0, 0, 0]), M.userData.omnicamId = r.id, M.frustumCulled = !1, this.objectNodes.set(r.id, M), this.content.add(M);
            continue;
          } else
            C = new e.Mesh(new e.BoxGeometry(1, 1, 1), x(r));
          if (!C) continue;
          C.position.fromArray(r.position || [0, 0, 0]), C.rotation.set(...(r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const z = ["sun_light", "point_light", "spot_light"].includes(r.type);
          if (r.type !== "card" && !z && C.scale.fromArray(D), C.userData.omnicamId = r.id, C.frustumCulled = !1, C.traverse((M) => {
            M.frustumCulled = !1, M.userData.omnicamId = r.id;
          }), !z) {
            const M = !!(O.show_wireframe || O.render_mode === "wireframe_texture" || r.material_mode === "wireframe_texture" || r.material_mode === "wireframe_neutral");
            Rt(e, C, { wireframe: M, vertices: O.show_vertices });
          }
          this.objectNodes.set(r.id, C), this.content.add(C);
        }
    },
    rebuildPath(O, p = "camera", t = null, o = "", c = null) {
      const d = Array.isArray(c) ? new Set(c) : null;
      q(this.path), this.path.clear();
      const s = o === "camera" ? O.active_camera_id : null, i = [
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
      (O.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: O.keyframes || [] }]).forEach((l, g) => {
        const n = l.keyframes || [];
        if (n.length === 0 || l.id === s) return;
        const L = l.color ? { line: new e.Color(l.color), marker: new e.Color(l.color), frustum: new e.Color(l.color) } : i[g % i.length], k = l.id === O.active_camera_id, F = k && p === "camera";
        if (n.length >= 2) {
          const y = n[0].frame, _ = n[n.length - 1].frame, r = Math.max(32, Math.min(256, _ - y + 1)), D = { ...l, keyframes: n, objects: O.objects }, C = Array.from({ length: r }, (S, A) => {
            const N = y + (_ - y) * A / Math.max(1, r - 1);
            return new e.Vector3().fromArray(J(D, N, O.objects).position);
          }), z = new e.CatmullRomCurve3(C, !1, "centripetal"), M = F ? 0.06 : k ? 0.045 : 0.025, P = new e.MeshBasicMaterial({
            color: L.line,
            transparent: !0,
            opacity: k ? 1 : 0.55,
            depthTest: !1
          }), V = new e.Mesh(new e.TubeGeometry(z, Math.max(48, r), M, 8, !1), P);
          if (V.renderOrder = 900, V.userData.omnicamWidget = "path", k && !l.locked && (V.userData.omnicamPathSegments = {
            cameraId: l.id,
            firstFrame: y,
            lastFrame: _,
            frames: n.map((S) => S.frame),
            points: C.map((S) => [S.x, S.y, S.z])
          }), this.path.add(V), k) {
            const S = new e.Mesh(
              new e.TubeGeometry(z, Math.max(48, r), M * (F ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: L.line, transparent: !0, opacity: F ? 0.3 : 0.18, depthTest: !1 })
            );
            if (S.renderOrder = 899, S.userData.omnicamWidget = "path", this.path.add(S), C.length >= 8) {
              const A = Math.max(6, Math.floor(r / 8));
              for (let N = Math.floor(A / 2); N < r - 1; N += A) {
                const $ = C[N], Y = C[N + 1].clone().sub($).normalize(), H = new e.ConeGeometry(M * 1.5, M * 3, 8);
                H.rotateX(Math.PI / 2);
                const E = new e.Quaternion().setFromUnitVectors(new e.Vector3(0, 0, 1), Y), R = new e.Mesh(H, new e.MeshBasicMaterial({ color: L.marker, transparent: !0, opacity: 0.85, depthTest: !1 }));
                R.quaternion.copy(E), R.position.copy($), R.renderOrder = 901, R.userData.omnicamWidget = "path", this.path.add(R);
              }
            }
          }
        }
        for (const y of n) {
          const _ = n.indexOf(y), r = k, D = new e.Mesh(
            new e.SphereGeometry(r ? ne : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: r ? qt : L.marker, depthTest: !1 })
          );
          D.position.fromArray(y.camera.position), D.renderOrder = 910, D.userData.omnicamPathKey = { cameraId: l.id, frame: y.frame }, D.userData.omnicamWidget = "path", this.path.add(D);
          const C = new e.Mesh(
            new e.RingGeometry((r ? ne : 0.085) * 1.3, (r ? ne : 0.085) * 1.7, 24),
            new e.MeshBasicMaterial({ color: r ? 16777215 : L.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          C.position.fromArray(y.camera.position), C.renderOrder = 909, C.userData.omnicamBillboard = !0, C.userData.omnicamWidget = "path", this.path.add(C);
          const z = new e.Vector3().fromArray(y.camera.position), M = new e.Vector3().fromArray(y.camera.target || [0, 0, 0]), P = k && t != null && y.frame === t, V = k && !P && d?.has(y.frame);
          if (P) {
            const S = new e.Mesh(
              new e.RingGeometry(ne * 2.1, ne * 2.6, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            S.position.fromArray(y.camera.position), S.renderOrder = 911, S.userData.omnicamBillboard = !0, S.userData.omnicamWidget = "path", this.path.add(S);
          } else if (V) {
            const S = new e.Mesh(
              new e.RingGeometry(ne * 1.9, ne * 2.2, 24),
              new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.85, depthTest: !1 })
            );
            S.position.fromArray(y.camera.position), S.renderOrder = 911, S.userData.omnicamBillboard = !0, S.userData.omnicamWidget = "path", this.path.add(S);
          }
          if (P) {
            const S = M.clone().sub(z).normalize();
            let A = new e.Vector3().crossVectors(S, new e.Vector3(0, 1, 0));
            A.lengthSq() < 1e-8 ? A.set(1, 0, 0) : A.normalize();
            const N = new e.Vector3().crossVectors(A, S).normalize(), $ = e.MathUtils.clamp(z.distanceTo(M) * 0.08, 0.25, 0.8), Y = y.camera.camera_type === "orthographic" ? $ * 0.55 : $ * Math.tan(e.MathUtils.degToRad(y.camera.fov || 35) * 0.5), H = Y * (O.width || 16) / Math.max(1, O.height || 9), E = z.clone().addScaledVector(S, $), R = [
              E.clone().addScaledVector(A, -H).addScaledVector(N, -Y),
              E.clone().addScaledVector(A, H).addScaledVector(N, -Y),
              E.clone().addScaledVector(A, H).addScaledVector(N, Y),
              E.clone().addScaledVector(A, -H).addScaledVector(N, Y)
            ], f = [];
            for (const ee of R) f.push(z, ee);
            for (let ee = 0; ee < 4; ee++) f.push(R[ee], R[(ee + 1) % 4]);
            const B = new e.BufferGeometry().setFromPoints(f), W = new e.LineSegments(B, new e.LineBasicMaterial({
              color: L.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            W.userData.omnicamWidget = "gizmo", this.path.add(W);
            const T = new e.BufferGeometry();
            T.setIndex([0, 1, 2, 0, 2, 3]), T.setAttribute("position", new e.Float32BufferAttribute([
              R[0].x,
              R[0].y,
              R[0].z,
              R[1].x,
              R[1].y,
              R[1].z,
              R[2].x,
              R[2].y,
              R[2].z,
              R[3].x,
              R[3].y,
              R[3].z
            ], 3));
            const K = new e.Mesh(T, new e.MeshBasicMaterial({
              color: L.marker,
              transparent: !0,
              opacity: 0.12,
              depthTest: !1,
              side: e.DoubleSide
            }));
            K.userData.omnicamWidget = "gizmo", this.path.add(K);
            const Q = zt(e, {
              position: z,
              forward: S,
              up: N,
              color: L.marker,
              scale: e.MathUtils.clamp($ * 1.15, 0.35, 1.6),
              active: k
            });
            Q.userData.omnicamWidget = "gizmo", this.path.add(Q);
          }
          if (P) {
            const S = Wt(e, {
              position: M,
              radius: e.MathUtils.clamp(z.distanceTo(M) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            S.userData.omnicamWidget = "lookat", this.path.add(S);
            const A = new e.Line(
              new e.BufferGeometry().setFromPoints([z.clone(), M.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            A.renderOrder = 914, A.userData.omnicamWidget = "lookat", this.path.add(A);
          }
          if (P) {
            const S = _t(y, n[_ - 1] || null, n[_ + 1] || null);
            for (const A of ["in", "out"]) {
              const N = new e.Vector3().fromArray(S[A]), $ = new e.Line(
                new e.BufferGeometry().setFromPoints([z.clone(), N.clone()]),
                new e.LineBasicMaterial({ color: Oe, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              $.renderOrder = 912, $.userData.omnicamWidget = "gizmo", this.path.add($);
              const Y = new e.Mesh(
                new e.SphereGeometry(Xt, 12, 8),
                new e.MeshBasicMaterial({ color: Oe, depthTest: !1 })
              );
              Y.position.copy(N), Y.renderOrder = 913, Y.userData.omnicamCurveHandle = { cameraId: l.id, frame: y.frame, side: A }, Y.userData.omnicamWidget = "gizmo", this.path.add(Y);
            }
          }
        }
      });
      const u = [16742005, 52937, 16632686, 7101671, 14774357];
      (O.objects || []).forEach((l, g) => {
        const n = l.keyframes || [];
        if (n.length < 2) return;
        const L = l.color ? new e.Color(l.color) : u[g % u.length], k = n.map((_) => new e.Vector3().fromArray(_.transform?.position || [0, 0, 0])), F = new e.CatmullRomCurve3(k, !1, "centripetal"), y = new e.Mesh(
          new e.TubeGeometry(F, Math.max(32, n.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: L, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        y.renderOrder = 900, y.userData.omnicamWidget = "path", this.path.add(y);
        for (const _ of n) {
          const r = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: L, depthTest: !1 })
          );
          r.position.fromArray(_.transform?.position || [0, 0, 0]), r.renderOrder = 910, r.userData.omnicamWidget = "path", this.path.add(r);
        }
      });
    }
  };
}
function Kt(a) {
  const { THREE: e, FBXLoader: m, GLTFLoader: w, OBJLoader: G, PLYLoader: h, STLLoader: v, neutral: b, wire: X, checkerMaterial: j, objectMaterial: I, applyModelMaterial: U, disposeObject: q, textureFor: re, cardMesh: Z, generatePointField: te, sampleCamera: J, sampleObjectTransform: se, hasOutlineMesh: O } = a;
  return {
    updateLiveCameras(p, t, o, c, d = "camera", s = null) {
      if (q(this.liveCameras), this.liveCameras.clear(), o) return;
      const i = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (p.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: p.keyframes || [] }]).forEach((u, l) => {
        const g = u.color ? { line: new e.Color(u.color), marker: new e.Color(u.color), frustum: new e.Color(u.color), body: new e.Color(u.color).multiplyScalar(0.35) } : i[l % i.length], n = u.id === p.active_camera_id, L = n && d === "camera", k = c === "camera" && n, F = J(u, t, p.objects), y = new e.Vector3().fromArray(F.position || [0, 0, 0]), _ = new e.Vector3().fromArray(F.target || [0, 0, 0]), r = _.clone().sub(y), D = r.length();
        D < 1e-4 ? r.set(0, 0, -1) : r.normalize();
        let C = new e.Vector3(0, 1, 0), z = new e.Vector3().crossVectors(r, C);
        z.lengthSq() < 1e-6 && (C = new e.Vector3(0, 0, 1), z = new e.Vector3().crossVectors(r, C)), z.normalize();
        let M = new e.Vector3().crossVectors(z, r).normalize();
        if (F.roll) {
          const V = e.MathUtils.degToRad(F.roll);
          z.applyAxisAngle(r, V), M.applyAxisAngle(r, V);
        }
        const P = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!k) {
          const V = new e.Group(), S = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: g.body, roughness: 0.4, metalness: 0.8 })
          );
          S.position.set(0, 0, -0.11), V.add(S);
          const A = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          A.rotateX(Math.PI / 2);
          const N = new e.Mesh(
            A,
            new e.MeshStandardMaterial({ color: g.marker, roughness: 0.2, metalness: 0.9 })
          );
          N.position.set(0, 0, 0.05), V.add(N);
          const $ = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: n ? 16729156 : g.marker })
          );
          $.position.set(0, 0.07, -0.08), V.add($);
          const Y = new e.Matrix4().makeBasis(z, M, r.clone().negate());
          V.quaternion.setFromRotationMatrix(Y), V.position.copy(y), V.userData.omnicamWidget = "gizmo", this.liveCameras.add(V);
          const H = new e.SphereGeometry(0.35, 8, 6), E = new e.Mesh(H, P);
          E.position.copy(y), E.userData = { omnicamType: "camera", omnicamId: u.id }, this.liveCameras.add(E);
          const R = e.MathUtils.clamp(D * 0.25, 0.5, 2.5), f = F.camera_type === "orthographic" ? 5 / Math.max(0.01, F.zoom || 1) * 0.35 : R * Math.tan(e.MathUtils.degToRad(F.fov || 35) * 0.5), B = f * (p.width || 16) / Math.max(1, p.height || 9), W = y.clone().addScaledVector(r, R), T = [
            W.clone().addScaledVector(z, -B).addScaledVector(M, -f),
            W.clone().addScaledVector(z, B).addScaledVector(M, -f),
            W.clone().addScaledVector(z, B).addScaledVector(M, f),
            W.clone().addScaledVector(z, -B).addScaledVector(M, f)
          ], K = [];
          for (const le of T) K.push(y, le);
          for (let le = 0; le < 4; le++) K.push(T[le], T[(le + 1) % 4]);
          const ee = T[2].clone().add(T[3]).multiplyScalar(0.5).clone().addScaledVector(M, f * 0.25);
          K.push(T[2], ee, ee, T[3]);
          const de = new e.BufferGeometry().setFromPoints(K), oe = new e.LineSegments(de, new e.LineBasicMaterial({
            color: L ? g.marker : g.frustum,
            linewidth: n ? 2 : 1,
            transparent: !0,
            opacity: n ? 1 : 0.6
          }));
          oe.userData.omnicamWidget = "gizmo", this.liveCameras.add(oe);
          const ge = new e.BufferGeometry();
          ge.setIndex([0, 1, 2, 0, 2, 3]), ge.setAttribute("position", new e.Float32BufferAttribute([
            T[0].x,
            T[0].y,
            T[0].z,
            T[1].x,
            T[1].y,
            T[1].z,
            T[2].x,
            T[2].y,
            T[2].z,
            T[3].x,
            T[3].y,
            T[3].z
          ], 3));
          const _e = new e.Mesh(ge, new e.MeshBasicMaterial({
            color: L ? g.marker : g.frustum,
            transparent: !0,
            opacity: 0.12,
            depthTest: !1,
            side: e.DoubleSide
          }));
          _e.userData.omnicamWidget = "gizmo", this.liveCameras.add(_e);
        }
        if (D > 0.01) {
          const V = n && d === "camera_target", S = new e.BufferGeometry().setFromPoints([y, _]), A = new e.Line(S, new e.LineDashedMaterial({
            color: L || V ? 9133302 : g.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: L || V ? 1 : n ? 0.75 : 0.4
          }));
          A.userData.omnicamWidget = "lookat", this.liveCameras.add(A);
          const N = V ? 0.12 : L ? 0.11 : 0.08, $ = [
            _.clone().add(new e.Vector3(-N, 0, 0)),
            _.clone().add(new e.Vector3(N, 0, 0)),
            _.clone().add(new e.Vector3(0, -N, 0)),
            _.clone().add(new e.Vector3(0, N, 0)),
            _.clone().add(new e.Vector3(0, 0, -N)),
            _.clone().add(new e.Vector3(0, 0, N))
          ], Y = new e.BufferGeometry().setFromPoints($), H = new e.LineSegments(Y, new e.LineBasicMaterial({
            color: V || L ? 9133302 : g.marker,
            linewidth: V ? 3 : 1,
            transparent: !0,
            opacity: V || L ? 1 : n ? 0.9 : 0.5
          }));
          H.userData.omnicamWidget = "lookat", this.liveCameras.add(H);
          const E = new e.SphereGeometry(0.28, 8, 6), R = new e.Mesh(E, P);
          if (R.position.copy(_), R.userData = { omnicamType: "camera_target", omnicamId: u.id }, this.liveCameras.add(R), (V || L) && c !== "camera") {
            const f = new e.RingGeometry(0.14, 0.18, 24);
            f.rotateX(Math.PI / 2);
            const B = new e.MeshBasicMaterial({ color: ye.typeLookAt, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), W = new e.Mesh(f, B);
            W.position.copy(_), W.userData.omnicamWidget = "lookat", this.liveCameras.add(W);
          }
        }
        if (n && c !== "camera" && d === "camera") {
          const V = new e.RingGeometry(0.19, 0.24, 32);
          V.rotateX(Math.PI / 2);
          const S = new e.MeshBasicMaterial({ color: ye.accent, side: e.DoubleSide, transparent: !0, opacity: 1 }), A = new e.Mesh(V, S);
          A.position.copy(y), A.userData.omnicamWidget = "gizmo", this.liveCameras.add(A);
          const N = new e.RingGeometry(0.28, 0.31, 32);
          N.rotateX(Math.PI / 2);
          const $ = new e.Mesh(N, new e.MeshBasicMaterial({ color: ye.accent, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          $.position.copy(y), $.userData.omnicamWidget = "gizmo", this.liveCameras.add($);
        }
      });
    },
    updateSelection(p, t, o, c = null, d = "", s = !1) {
      const i = c ? `${c.mode || ""}:${c.objectId || ""}:${(c.point || []).join(",")}` : "", x = `${t}:${o || ""}:${(p.__selectedObjectIds || []).join(",")}:${d}:${i}:${s ? "ortho" : "persp"}`;
      if (x !== this.selectionKey) {
        if (this.selectionKey = x, q(this.selectionGroup), this.selectionGroup.clear(), t === "object" && o) {
          const u = this.objectNodes.get(o);
          if (u) {
            u.updateMatrixWorld(!0);
            try {
              const l = new e.Box3(), g = [];
              if (u.traverse((n) => {
                n.isBone && g.push(n);
              }), g.length > 0) {
                const n = new e.Vector3();
                for (const L of g)
                  L.getWorldPosition(n), l.expandByPoint(n);
                l.expandByScalar(0.2);
              } else
                l.setFromObject(u);
              if ((s || !O(u)) && !l.isEmpty() && Number.isFinite(l.min.x) && Number.isFinite(l.max.x) && Number.isFinite(l.min.y) && Number.isFinite(l.max.y) && Number.isFinite(l.min.z) && Number.isFinite(l.max.z)) {
                l.expandByScalar(0.04);
                const n = new e.Box3Helper(l, new e.Color(9133302));
                n.material.transparent = !0, n.material.opacity = 0.95, n.material.depthTest = !1, n.renderOrder = 9999, this.selectionGroup.add(n);
              }
            } catch {
            }
            if (p.show_wireframe) {
              let l = 0;
              u.traverse((g) => {
                if (!g.isMesh || !g.geometry || g.userData.omnicamHelper || l >= 64) return;
                const n = Ut(e, g, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                n.renderOrder = 9998, this.selectionGroup.add(n), l += 1;
              });
            }
            if (c && c.objectId === o && c.point) {
              if (c.mode === "vertex") {
                const l = new e.SphereGeometry(0.08, 16, 12), g = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), n = new e.Mesh(l, g);
                n.position.fromArray(c.point), n.renderOrder = 1e4, this.selectionGroup.add(n);
                const L = new e.RingGeometry(0.1, 0.15, 24), k = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), F = new e.Mesh(L, k);
                F.position.fromArray(c.point), this.activeCamera && F.quaternion.copy(this.activeCamera.quaternion), F.renderOrder = 1e4, this.selectionGroup.add(F);
              } else if (c.mode === "edge" && c.edge) {
                const [l, g] = c.edge, n = new e.BufferGeometry().setFromPoints([new e.Vector3(...l), new e.Vector3(...g)]), L = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), k = new e.Line(n, L);
                k.renderOrder = 1e4, this.selectionGroup.add(k);
              } else if (c.mode === "face" && c.vertices) {
                const [l, g, n] = c.vertices, L = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...l),
                  new e.Vector3(...g),
                  new e.Vector3(...n)
                ]);
                L.setIndex([0, 1, 2]), L.computeVertexNormals();
                const k = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), F = new e.Mesh(L, k);
                F.renderOrder = 1e4, this.selectionGroup.add(F);
                const y = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...l),
                  new e.Vector3(...g),
                  new e.Vector3(...n),
                  new e.Vector3(...l)
                ]), _ = new e.Line(y, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                _.renderOrder = 10001, this.selectionGroup.add(_);
              }
            }
          }
        }
        if (t === "object")
          for (const u of p.__selectedObjectIds || []) {
            if (u === o) continue;
            const l = this.objectNodes.get(u);
            if (l) {
              l.updateMatrixWorld(!0);
              try {
                const g = new e.Box3().setFromObject(l);
                if ((s || !O(l)) && !g.isEmpty() && Number.isFinite(g.min.x)) {
                  g.expandByScalar(0.04);
                  const n = new e.Box3Helper(g, new e.Color(10980346));
                  n.material.transparent = !0, n.material.opacity = 0.6, n.material.depthTest = !1, n.renderOrder = 9997, this.selectionGroup.add(n);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(p) {
      const t = this.objectNodes.get(p);
      if (!t) return [];
      const o = [], c = /* @__PURE__ */ new Set();
      return t.traverse((d) => {
        const s = d.isBone ? d.name : "";
        !s || c.has(s) || o.length >= 256 || (c.add(s), o.push(s));
      }), o;
    },
    /**
     * World position of `boneName` (or the model's animated centre when no bone
     * is named) at an arbitrary frame.
     *
     * The mixer is the only thing that knows where a bone sits at a given time,
     * so the model is posed at `frame`, probed, then posed back: a probe for a
     * frame other than the playhead must not leave the viewport showing it.
     */
    sampleModelPoint(p, t, o, c = 24) {
      const d = this.objectNodes.get(p);
      if (!d) return null;
      const s = this.models.get(p), i = s?.mixer && s.duration > 0, x = i ? s.mixer.time : null;
      i && (s.mixer.setTime(Math.max(0, o) / Math.max(1, c) % s.duration), d.updateMatrixWorld(!0));
      let u = null;
      if (t) {
        let l = null;
        if (d.traverse((g) => {
          !l && g.isBone && g.name === t && (l = g);
        }), l) {
          const g = new e.Vector3().setFromMatrixPosition(l.matrixWorld);
          u = [g.x, g.y, g.z];
        }
      } else
        u = this.getObjectWorldCenter(p);
      return i && Number.isFinite(x) && (s.mixer.setTime(x), d.updateMatrixWorld(!0)), u;
    },
    getObjectWorldBounds(p) {
      const t = this.objectNodes.get(p);
      if (!t) return null;
      t.updateWorldMatrix(!0, !0);
      const o = new e.Box3().setFromObject(t, !0), c = o.min.toArray(), d = o.max.toArray();
      return !o.isEmpty() && [...c, ...d].every(Number.isFinite) ? { min: c, max: d } : null;
    },
    getObjectWorldCenter(p) {
      const t = this.objectNodes.get(p);
      if (!t) return null;
      t.updateMatrixWorld(!0);
      const o = [];
      if (t.traverse((s) => {
        s.isBone && o.push(s);
      }), o.length > 0) {
        const s = new e.Vector3(), i = new e.Vector3();
        for (const x of o)
          x.getWorldPosition(i), s.add(i);
        return s.divideScalar(o.length), [s.x, s.y, s.z];
      }
      const c = new e.Box3().setFromObject(t);
      if (!c.isEmpty() && Number.isFinite(c.min.x)) {
        const s = c.getCenter(new e.Vector3());
        return [s.x, s.y, s.z];
      }
      const d = new e.Vector3();
      return t.getWorldPosition(d), [d.x, d.y, d.z];
    },
    /** Every bone name in a loaded model, for the Rig Mapper (design spec 23). */
    getModelBoneNames(p) {
      const t = this.objectNodes.get(p);
      if (!t) return [];
      const o = [];
      return t.traverse((c) => {
        c.isBone && c.name && o.push(c.name);
      }), o;
    },
    /** Resolve one loaded bone by name, plus its world position. */
    resolveModelBone(p, t) {
      const o = this.objectNodes.get(p);
      if (!o || !t) return null;
      let c = null;
      if (o.traverse((s) => {
        !c && s.isBone && s.name === t && (c = s);
      }), !c) return null;
      c.updateWorldMatrix(!0, !1);
      const d = new e.Vector3();
      return c.getWorldPosition(d), { name: t, world: [d.x, d.y, d.z] };
    },
    /**
     * Apply an FK pose to a loaded character (design spec section 29,
     * ui.characterRuntime.applyPose). `boneMap` is canonical joint -> bone name;
     * `joints` is canonical joint -> local quaternion [x,y,z,w]. Bones not named
     * by `joints` are left at their bind rotation, captured once per bone.
     */
    applyCharacterPose(p, t, o) {
      const c = this.objectNodes.get(p);
      if (!c) return !1;
      const d = /* @__PURE__ */ new Map();
      if (c.traverse((i) => {
        i.isBone && i.name && d.set(i.name, i);
      }), !d.size) return !1;
      for (const i of d.values())
        i.userData.omnicamBindQuat || (i.userData.omnicamBindQuat = i.quaternion.clone());
      const s = o && typeof o == "object" ? o : {};
      for (const [i, x] of Object.entries(t || {})) {
        const u = d.get(x);
        if (!u) continue;
        const l = s[i];
        Array.isArray(l) && l.length === 4 && l.every(Number.isFinite) ? u.quaternion.fromArray(l).normalize() : u.userData.omnicamBindQuat && u.quaternion.copy(u.userData.omnicamBindQuat), u.updateMatrixWorld(!0);
      }
      return this.invalidate(), !0;
    },
    /**
     * Read the current local rotation of every mapped canonical joint -- what
     * "Bake current frame to pose" samples off the live mixer (design spec
     * section 27). A joint still at its captured bind rotation is omitted.
     */
    sampleCharacterBonePose(p, t) {
      const o = this.objectNodes.get(p);
      if (!o || !t) return {};
      const c = /* @__PURE__ */ new Map();
      o.traverse((s) => {
        s.isBone && s.name && c.set(s.name, s);
      });
      const d = {};
      for (const [s, i] of Object.entries(t)) {
        const x = c.get(i);
        if (!x) continue;
        const u = x.userData.omnicamBindQuat;
        u && x.quaternion.angleTo(u) < 1e-4 || (d[s] = x.quaternion.toArray());
      }
      return d;
    }
  };
}
function Yt(a) {
  const { THREE: e, FBXLoader: m, GLTFLoader: w, OBJLoader: G, PLYLoader: h, STLLoader: v, neutral: b, wire: X, checkerMaterial: j, objectMaterial: I, applyModelMaterial: U, disposeObject: q, textureFor: re, cardMesh: Z, generatePointField: te, sampleCamera: J, sampleObjectTransform: se } = a;
  function O(p) {
    const t = p.supersampleFactor?.() || 1;
    return { w: p.canvas.width / t, h: p.canvas.height / t };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(p) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: o } = O(this);
      this.pointer.set(p[0] / t * 2 - 1, -(p[1] / o) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const x = gt(i);
        if (x) return { ...x, position: i.object.position.toArray() };
      }
      const c = 16 * Math.min(2, window.devicePixelRatio || 1);
      let d = null;
      const s = new e.Vector3();
      for (const i of this.path.children) {
        const x = i.userData?.omnicamPathKey;
        if (!x || (s.copy(i.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const u = (s.x * 0.5 + 0.5) * t, l = (1 - (s.y * 0.5 + 0.5)) * o, g = Math.hypot(p[0] - u, p[1] - l);
        g <= c && (!d || g < d.distance) && (d = { key: x, position: i.position.toArray(), distance: g });
      }
      return d ? { ...d.key, position: d.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(p) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: o } = O(this);
      this.pointer.set(p[0] / t * 2 - 1, -(p[1] / o) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const x = wt(i);
        if (x) return { ...x, position: i.object.position.toArray() };
      }
      const c = 14 * Math.min(2, window.devicePixelRatio || 1);
      let d = null;
      const s = new e.Vector3();
      for (const i of this.path.children) {
        const x = i.userData?.omnicamCurveHandle;
        if (!x || (s.copy(i.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const u = (s.x * 0.5 + 0.5) * t, l = (1 - (s.y * 0.5 + 0.5)) * o, g = Math.hypot(p[0] - u, p[1] - l);
        g <= c && (!d || g < d.distance) && (d = { handle: x, position: i.position.toArray(), distance: g });
      }
      return d ? { ...d.handle, position: d.position } : null;
    },
    /**
     * The active camera-path segment (two neighbouring real keyframes, plus
     * a `t` 0..1 between them) nearest the pointer, for double-click-to-
     * insert (Task 8). `null` when the pointer isn't over the path tube.
     */
    pickPathSegment(p) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: o } = O(this);
      this.pointer.set(p[0] / t * 2 - 1, -(p[1] / o) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const c = this.raycaster.intersectObjects(this.path.children, !0).find((y) => y.object.userData?.omnicamPathSegments);
      if (!c) return null;
      const { cameraId: d, firstFrame: s, lastFrame: i, frames: x, points: u } = c.object.userData.omnicamPathSegments;
      if (!u?.length || x.length < 2) return null;
      let l = 0, g = 1 / 0;
      for (let y = 0; y < u.length; y += 1) {
        const [_, r, D] = u[y], C = _ - c.point.x, z = r - c.point.y, M = D - c.point.z, P = C * C + z * z + M * M;
        P < g && (g = P, l = y);
      }
      const n = s + (i - s) * l / Math.max(1, u.length - 1);
      let L = x[0], k = x[x.length - 1];
      for (let y = 0; y < x.length - 1; y += 1)
        if (x[y] <= n && n <= x[y + 1]) {
          L = x[y], k = x[y + 1];
          break;
        }
      if (L === k) return null;
      const F = Math.min(1, Math.max(0, (n - L) / (k - L)));
      return { cameraId: d, leftFrame: L, rightFrame: k, t: F };
    },
    configureCamera(p, t) {
      const o = p || defaultCamera(), c = Math.max(5e-4, Number(o.near) || 0.01), d = Math.max(c + 1, Number(o.far) || 1e4);
      let s;
      if (o.camera_type === "orthographic") {
        s = this.orthographic;
        const n = 5 / Math.max(0.01, o.zoom || 1);
        s.left = -n * t, s.right = n * t, s.top = n, s.bottom = -n, s.near = c, s.far = d, s.updateProjectionMatrix();
      } else
        s = this.perspective, s.fov = e.MathUtils.clamp(Number(o.fov) || 35, 1, 175), s.aspect = t, s.near = c, s.far = d, s.updateProjectionMatrix();
      const i = new e.Vector3().fromArray(o.position || [6, 4, 6]), x = new e.Vector3().fromArray(o.target || [0, 1.5, 0]), u = x.clone().sub(i);
      u.lengthSq() < 1e-6 ? u.set(0, 0, -1) : u.normalize();
      let l = o.up ? new e.Vector3().fromArray(o.up) : new e.Vector3(0, 1, 0), g = new e.Vector3().crossVectors(u, l);
      if (g.lengthSq() < 1e-6 && (l = Math.abs(u.y) > 0.9 ? new e.Vector3(0, 0, u.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), g.crossVectors(u, l)), g.normalize(), l.crossVectors(g, u).normalize(), o.roll) {
        const n = e.MathUtils.degToRad(o.roll);
        g.applyAxisAngle(u, n), l.applyAxisAngle(u, n);
      }
      return s.position.copy(i), s.up.copy(l), s.lookAt(x), s.updateMatrixWorld(), s;
    },
    pick(p, t, o, c) {
      if (!this.activeCamera) return null;
      this.pointer.set(p / Math.max(1, o) * 2 - 1, 1 - t / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const d = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const s of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          s.object?.userData?.omnicamType && d.push({
            distance: s.distance,
            type: s.object.userData.omnicamType,
            id: s.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const s of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (s.object?.userData?.omnicamCaptureGuide || s.object?.userData?.omnicamHelper) continue;
          let i = s.object;
          for (; i && !i.userData?.omnicamId; ) i = i.parent;
          i?.userData?.omnicamId && d.push({
            distance: s.distance,
            type: "object",
            id: i.userData.omnicamId
          });
        }
      return d.length ? (d.sort((s, i) => s.distance - i.distance), { type: d[0].type, id: d[0].id }) : null;
    },
    /**
     * World point -> logical viewport pixels, for the DOM label overlay
     * (design spec section 14). `behind` is true when the point is outside the
     * near/far clip and the caller should hide its label.
     */
    projectWorldToScreen(p) {
      if (!this.activeCamera || !Array.isArray(p) || p.length < 3) return null;
      const { w: t, h: o } = O(this), c = new e.Vector3(Number(p[0]) || 0, Number(p[1]) || 0, Number(p[2]) || 0);
      return c.project(this.activeCamera), {
        x: (c.x * 0.5 + 0.5) * t,
        y: (1 - (c.y * 0.5 + 0.5)) * o,
        behind: c.z < -1 || c.z > 1,
        width: t,
        height: o
      };
    },
    pickSubElement(p, t, o, c, d = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(p / Math.max(1, o) * 2 - 1, 1 - t / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const s = this.raycaster.intersectObjects(this.content.children, !0);
      for (const i of s) {
        let x = i.object, u = i.object;
        for (; x && !x.userData.omnicamId; ) x = x.parent;
        if (!x?.userData.omnicamId || !u.geometry) continue;
        const l = x.userData.omnicamId, n = u.geometry.getAttribute("position");
        if (!n) continue;
        u.updateMatrixWorld(!0);
        const L = u.matrixWorld;
        if (d === "vertex") {
          let k = -1, F = 1 / 0, y = null;
          if (i.face) {
            const _ = [i.face.a, i.face.b, i.face.c];
            for (const r of _) {
              const D = new e.Vector3(n.getX(r), n.getY(r), n.getZ(r)).applyMatrix4(L), C = D.distanceTo(i.point);
              C < F && (F = C, k = r, y = [D.x, D.y, D.z]);
            }
          } else
            for (let _ = 0; _ < n.count; _++) {
              const r = new e.Vector3(n.getX(_), n.getY(_), n.getZ(_)).applyMatrix4(L), D = r.distanceTo(i.point);
              D < F && (F = D, k = _, y = [r.x, r.y, r.z]);
            }
          if (y)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: l,
              index: k,
              point: y
            };
        }
        if (d === "edge" && i.face) {
          const k = new e.Vector3(n.getX(i.face.a), n.getY(i.face.a), n.getZ(i.face.a)).applyMatrix4(L), F = new e.Vector3(n.getX(i.face.b), n.getY(i.face.b), n.getZ(i.face.b)).applyMatrix4(L), y = new e.Vector3(n.getX(i.face.c), n.getY(i.face.c), n.getZ(i.face.c)).applyMatrix4(L), _ = (M, P, V) => {
            const S = new e.Line3(P, V), A = new e.Vector3();
            return S.closestPointToPoint(M, !0, A), { dist: M.distanceTo(A), point: A, segment: [P, V] };
          }, r = _(i.point, k, F), D = _(i.point, F, y), C = _(i.point, y, k), z = [r, D, C].reduce((M, P) => P.dist < M.dist ? P : M);
          return {
            type: "edge",
            mode: "edge",
            objectId: l,
            point: [z.point.x, z.point.y, z.point.z],
            edge: [
              [z.segment[0].x, z.segment[0].y, z.segment[0].z],
              [z.segment[1].x, z.segment[1].y, z.segment[1].z]
            ]
          };
        }
        if (d === "face" && i.face) {
          const k = new e.Vector3(n.getX(i.face.a), n.getY(i.face.a), n.getZ(i.face.a)).applyMatrix4(L), F = new e.Vector3(n.getX(i.face.b), n.getY(i.face.b), n.getZ(i.face.b)).applyMatrix4(L), y = new e.Vector3(n.getX(i.face.c), n.getY(i.face.c), n.getZ(i.face.c)).applyMatrix4(L), _ = new e.Vector3().add(k).add(F).add(y).divideScalar(3), r = i.face.normal.clone().transformDirection(L);
          return {
            type: "face",
            mode: "face",
            objectId: l,
            faceIndex: i.faceIndex,
            point: [_.x, _.y, _.z],
            normal: [r.x, r.y, r.z],
            vertices: [
              [k.x, k.y, k.z],
              [F.x, F.y, F.z],
              [y.x, y.y, y.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(p, t, o, c) {
      if (!this.activeCamera) return null;
      this.pointer.set(p / Math.max(1, o) * 2 - 1, 1 - t / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const d = this.raycaster.intersectObjects(this.content.children, !0);
      if (d.length > 0)
        return [d[0].point.x, d[0].point.y, d[0].point.z];
      const s = new e.Plane(new e.Vector3(0, 1, 0), 0), i = new e.Vector3();
      return this.raycaster.ray.intersectPlane(s, i) ? [i.x, i.y, i.z] : null;
    }
  };
}
const Me = ["high", "balanced", "low"], Ht = 25, ke = 30, Qt = 0.6;
function Te(a = "balanced") {
  return { quality: a, samples: [], downgraded: !1 };
}
function Zt(a) {
  const e = Me.indexOf(a);
  return e < 0 || e >= Me.length - 1 ? null : Me[e + 1];
}
function Jt(a, e) {
  if (!Number.isFinite(e) || e < 0 || (a.samples.push(e), a.samples.length > ke && a.samples.shift(), a.samples.length < ke) || a.samples.filter((G) => G > Ht).length / a.samples.length < Qt) return null;
  const w = Zt(a.quality);
  return w ? (a.quality = w, a.downgraded = !0, a.samples = [], w) : null;
}
function Et(a, e) {
  return a.quality = e, a.samples = [], a.downgraded = !1, a;
}
function er(a) {
  const { THREE: e, FBXLoader: m, GLTFLoader: w, OBJLoader: G, PLYLoader: h, STLLoader: v, neutral: b, wire: X, checkerMaterial: j, objectMaterial: I, applyModelMaterial: U, disposeObject: q, textureFor: re, cardMesh: Z, generatePointField: te, sampleCamera: J, sampleObjectTransform: se, hasOutlineMesh: O, SelectionOutlineRenderer: p } = a;
  return {
    render(t, o, c, d, s, i = /* @__PURE__ */ new Map(), x = 0, u = !1, l = "camera", g = "subject", n = null, L = null, k = null, F = "auto") {
      const y = u && F === "clay" ? !0 : u && F === "motion_proxy" ? !1 : !u || (t.render_mode || "") === "beauty";
      if (y !== this.studioEnabled) {
        this.studioEnabled = y, Re(e, this.scene, this.renderer, this.studio, y);
        for (const f of this.flatLights || []) f.visible = !y;
      }
      const _ = !!t.objects?.some((f) => f.type === "sun_light" && f.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !_ && y), this.flatLights?.[1] && (this.flatLights[1].visible = !_ && !y), this.disposed) return;
      (this.canvas.width !== d || this.canvas.height !== s) && this.renderer.setSize(d, s, !1);
      const r = (o && o.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const D = t.viewport_bg_sequence && t.viewport_bg_sequence.length ? t.viewport_bg_sequence[x % t.viewport_bg_sequence.length] : t.viewport_bg_image || "";
      if (D) {
        this.bgImageUrl = D;
        const f = this.bgTextureCache.get(D);
        if (f)
          this.bgTextureCache.delete(D), this.bgTextureCache.set(D, f), this.bgTexture = f, this.scene.background = f;
        else if (!this.bgTextureLoads.has(D)) {
          const B = this.bgLoadGeneration;
          this.bgTextureLoads.set(D, B), new e.TextureLoader().load(D, (T) => {
            if (this.bgTextureLoads.delete(D), this.disposed || B !== this.bgLoadGeneration) {
              T.dispose();
              return;
            }
            for (T.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(D, T); this.bgTextureCache.size > 8; ) {
              const K = [...this.bgTextureCache.keys()].find((ee) => ee !== this.bgImageUrl);
              if (!K) break;
              const Q = this.bgTextureCache.get(K);
              this.bgTextureCache.delete(K), Q?.dispose?.();
            }
            this.bgImageUrl === D && (this.bgTexture = T, this.scene.background = T), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(D);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const B of new Set(this.bgTextureCache.values())) B.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const f = t.viewport_bg_color && t.viewport_bg_color !== Ve;
        this.scene.background = this.studioEnabled && !f && !r ? this.studio.sky : new e.Color(f ? t.viewport_bg_color : this.studioEnabled && r ? 1447709 : Ve);
      }
      const C = JSON.stringify([
        t.render_mode,
        t.card_fit,
        t.point_density,
        t.point_spread,
        !!t.show_wireframe,
        !!t.show_vertices,
        !!t.backface_culling,
        t.reconstruction_appearance || "neutral",
        !!u,
        F,
        t.objects.map((f) => {
          const { position: B, rotation: W, keyframes: T, size: K, ...Q } = f;
          return f.type === "card" && (Q.size = K), Q;
        })
      ]), z = [...c.entries()].map(([f, B]) => `${f}:${B?.src || ""}`).join("|"), M = [...i.entries()].map(([f, B]) => `${f}:${B}`).join("|");
      (C !== this.sceneKey || z !== this.mediaSignature || M !== this.modelSignature) && (this.sceneKey = C, this.mediaSignature = z, this.modelSignature = M, this.rebuild(t, c, i, u, F));
      const P = Math.max(1, t.fps || 24), V = /* @__PURE__ */ new Map();
      for (const f of t.objects)
        f.character?.motion && this.models.has(f.id) && V.set(f.id, f.character.motion);
      for (const [f, B] of this.models) {
        if (!B.mixer || !(B.duration > 0)) continue;
        const W = V.get(f);
        W ? (this.applyMotionClip?.(f, W), B.mixer.setTime(yt(W, x, P, B.duration))) : B.mixer.setTime(x / P % B.duration);
      }
      for (const f of t.objects) {
        const B = this.objectNodes.get(f.id);
        if (!B) continue;
        const W = f.keyframes?.length ? se(f, x) : f;
        B.position.fromArray(W.position || [0, 0, 0]), B.rotation.set(...(W.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), f.type !== "card" && f.type !== "null" && B.scale.fromArray(W.size || [1, 1, 1]), f.type === "null" && (B.visible = u ? !0 : t.show_helper_axes !== !1);
      }
      this.path.visible = !u;
      const S = t.show_grid !== !1 && t.render_mode !== "point_field";
      this.content.traverse((f) => {
        f.userData.omnicamCaptureGuide && (f.visible = u ? !!t.playblast_grid : S);
      });
      const A = t.view_mode || "camera", N = Array.isArray(k) ? [...k].sort((f, B) => f - B).join(",") : "", $ = `${A}:${l}:${L ?? ""}:${N}:${t.__omnicamRevision ?? JSON.stringify([
        t.active_camera_id,
        (t.cameras || []).map((f) => [f.id, f.keyframes?.length, f.keyframes?.map((B) => [B.frame, B.camera?.position, B.camera?.target, B.interpolation, B.tangents])]),
        (t.objects || []).map((f) => [f.id, f.keyframes?.length, f.keyframes?.map((B) => [B.frame, B.transform?.position])])
      ])}`;
      if ($ !== this.pathKey && (this.pathKey = $, this.rebuildPath(t, l, L, A, k)), this.updateLiveCameras(t, x, u, A, l, L), this.liveCameras.visible = !u, !u) {
        const f = t.show_camera_paths !== !1, B = t.show_camera_gizmos !== !1, W = t.show_look_at !== !1;
        for (const T of [this.path, this.liveCameras])
          T.traverse((K) => {
            const Q = K.userData.omnicamWidget;
            Q === "path" ? K.visible = f : Q === "gizmo" ? K.visible = B : Q === "lookat" && (K.visible = W);
          });
      }
      const Y = d / Math.max(1, s), H = this.configureCamera(o, Y);
      if (this.activeCamera = H, u ? this.selectionGroup.visible = !1 : (this.updateSelection(t, l, g, n, `${t.__omnicamRevision ?? "legacy"}:${x}`, r), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const f = new e.Box3();
        this.content.traverse((W) => {
          if (!W.isMesh || W.userData.omnicamCaptureGuide) return;
          W.castShadow = !0, W.receiveShadow = !0, W.updateWorldMatrix(!0, !1);
          const T = new e.Box3().setFromObject(W);
          !T.isEmpty() && Number.isFinite(T.min.x) && f.union(T);
        });
        const B = this.studio?.key;
        if (B) {
          const W = f.isEmpty() ? new e.Vector3() : f.getCenter(new e.Vector3()), T = f.isEmpty() ? new e.Vector3(12, 12, 12) : f.getSize(new e.Vector3()), K = Math.max(1, 0.5 * Math.max(T.x, T.y, T.z) * Math.SQRT2), Q = K * 1.15 + 0.5, ee = new e.Vector3(4.5, 7.5, 3.5).normalize(), de = Math.max(12, K * 4);
          B.position.copy(W).addScaledVector(ee, de), B.target.position.copy(W), B.target.updateMatrixWorld(!0);
          const oe = B.shadow.camera;
          oe.left = -Q, oe.right = Q, oe.top = Q, oe.bottom = -Q, oe.near = Math.max(0.1, de - K - 1), oe.far = de + K + 1, oe.updateProjectionMatrix(), B.shadow.map?.dispose(), B.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((f) => {
        f.userData.omnicamBillboard && f.quaternion.copy(H.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, d, s);
      const E = performance.now();
      let R = !1;
      if (!u && !r && l === "object" && (g || t.__selectedObjectIds?.length) && !n) {
        const f = t.__selectedObjectIds?.length ? t.__selectedObjectIds : g ? [g] : [], B = [];
        for (const W of f) {
          const T = this.objectNodes.get(W);
          T && O(T) && B.push(T);
        }
        B.length && (this.outlineRenderer || (this.outlineRenderer = new p(this.renderer, this.scene, void 0, H)), this.outlineRenderer.render(H, d, s, B), R = !0);
      }
      if (R || this.renderer.render(this.scene, H), !u && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Te(this.studio?.quality);
        const f = Jt(this.qualityMonitor, performance.now() - E);
        f && (Ae(this.studio, this.renderer, f), this.onQualityDowngrade?.(f));
      }
    },
    setViewportQuality(t) {
      Ae(this.studio, this.renderer, t), this.qualityMonitor = Et(this.qualityMonitor || Te(t), t);
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
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), q(this.content), q(this.path), q(this.liveCameras), q(this.selectionGroup);
        for (const t of new Set(this.bgTextureCache.values())) t.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const t of this.models.values()) q(t.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.outlineRenderer?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
const tr = {
  EffectComposer: Ze,
  OutlinePass: Qe,
  OutputPass: He,
  RenderPass: Ye,
  Vector2: ze
};
function rr(a) {
  let e = !1;
  return a?.traverse?.((m) => {
    e || m.visible === !1 || !m.isMesh || m.userData?.omnicamHelper || m.userData?.omnicamCaptureGuide || (e = !!(m.geometry && m.material));
  }), e;
}
class or {
  constructor(e, m, w = tr, G = null) {
    const { EffectComposer: h, RenderPass: v, OutlinePass: b, OutputPass: X, Vector2: j } = w;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new h(e), this.renderPass = new v(m, G), this.outlinePass = new b(new j(1, 1), m, G, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new X(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, m, w, G) {
    this.disposed || ((m !== this.width || w !== this.height) && (this.width = m, this.height = w, this.composer.setSize(m, w)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...G], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const Fe = { low: Tt, balanced: kt, high: Ot }, me = new Be({ color: 10265519, roughness: 0.48, metalness: 0.06, side: ae }), $e = new Be({ color: 2237998, roughness: 0.95, metalness: 0, side: ae }), Se = new be({ color: 11449792, wireframe: !0, side: ae });
function Ge(a = !1) {
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
  ]), m = new mt(e, 2, 2, ut);
  return m.wrapS = m.wrapT = ht, m.repeat.set(8, 8), m.colorSpace = Ce, m.needsUpdate = !0, new Be({ map: m, roughness: 0.85, metalness: 0, side: a ? Le : ae });
}
function ar(a, e, m = !1) {
  const w = e === "wireframe" ? "wireframe" : a.material_mode || "textured", G = m ? Le : ae;
  if (w === "wireframe") {
    const v = Se.clone();
    return v.side = G, a.color && (v.color = new ce(a.color)), v;
  }
  if (w === "checker") return Ge(m);
  if (w === "matte") {
    const v = $e.clone();
    return v.side = G, a.color && (v.color = new ce(a.color)), v;
  }
  const h = me.clone();
  return h.side = G, a.color && (h.color = new ce(a.color)), h;
}
function sr(a, e, m = null, w = !1) {
  const G = w ? Le : ae;
  a.traverse((h) => {
    if (h.isMesh) {
      if (h.userData.omnicamOriginalMaterial || (h.userData.omnicamOriginalMaterial = h.material), h.userData.omnicamOverrideMaterial) {
        const v = Array.isArray(h.material) ? h.material : [h.material];
        for (const b of v)
          b?.map?.dispose?.(), b?.dispose?.();
        h.userData.omnicamOverrideMaterial = !1;
      }
      if (e === "textured" || e === "wireframe_texture") {
        h.material = h.userData.omnicamOriginalMaterial;
        const v = Array.isArray(h.material) ? h.material : [h.material];
        for (const b of v)
          b && (b.side = G);
      } else if (e === "checker")
        h.material = Ge(w), h.userData.omnicamOverrideMaterial = !0;
      else if (e === "wireframe") {
        const v = Se.clone();
        v.side = G, m?.color && (v.color = new ce(m.color)), h.material = v, h.userData.omnicamOverrideMaterial = !0;
      } else if (e === "matte") {
        const v = $e.clone();
        v.side = G, m?.color && (v.color = new ce(m.color)), h.material = v, h.userData.omnicamOverrideMaterial = !0;
      } else {
        const v = me.clone();
        v.side = G, m?.color && (v.color = new ce(m.color)), h.material = v, h.userData.omnicamOverrideMaterial = !0;
      }
    }
  });
}
function ve(a, e = !1) {
  a.traverse((m) => {
    if (m.userData.omnicamModelResource && !e) return;
    m.geometry?.dispose?.();
    const w = Array.isArray(m.material) ? m.material : [m.material];
    for (const G of w)
      G?.map?.dispose?.(), G?.dispose?.();
  });
}
function Ke(a) {
  if (!a) return null;
  const e = a instanceof HTMLVideoElement ? new ft(a) : new pt(a);
  return e.colorSpace = Ce, e.needsUpdate = !0, e;
}
function nr(a, e, m) {
  const [w, G] = a.size || [2, 3], h = new ie(), v = new fe(new Pe(w, G), new be({ color: 1448482, side: ae, transparent: !0, opacity: 0.85 }));
  v.frustumCulled = !1, h.add(v);
  const b = Ke(e);
  if (!b) return h;
  const X = e.videoWidth || e.naturalWidth || e.width || w, j = e.videoHeight || e.naturalHeight || e.height || G, I = X / Math.max(1, j), U = w / Math.max(0.01, G);
  let q = w, re = G;
  m === "contain" ? I > U ? re = w / I : q = G * I : m === "cover" && (I > U ? (b.repeat.x = U / I, b.offset.x = (1 - b.repeat.x) * 0.5) : (b.repeat.y = I / U, b.offset.y = (1 - b.repeat.y) * 0.5));
  const Z = new fe(
    new Pe(q, re),
    new be({
      color: 16777215,
      map: b,
      side: ae,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return Z.frustumCulled = !1, Z.position.z = 2e-3, h.add(Z), h.frustumCulled = !1, h;
}
class ir {
  constructor(e = () => {
  }, m = () => {
  }) {
    this.canvas = document.createElement("canvas"), this.renderer = new Je({
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
    }), this.renderer.setPixelRatio(1), this.renderer.outputColorSpace = Ce, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = Ee, this.scene = new et(), this.scene.background = new ce(1184274), this.scene.add(new tt(16777215, 3159099, 2.2));
    const w = new rt(16777215, 2.4);
    w.position.set(5, 8, 4), this.scene.add(w), this.flatLights = [this.scene.children.at(-2), w], this.studio = Bt(xe, this.renderer, St), this.scene.add(this.studio.group), this.studioEnabled = !0, Re(xe, this.scene, this.renderer, this.studio, !0), this.content = new ie(), this.scene.add(this.content), this.path = new ie(), this.scene.add(this.path), this.liveCameras = new ie(), this.scene.add(this.liveCameras), this.selectionGroup = new ie(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ot(35, 16 / 9, 0.01, 1e4), this.orthographic = new at(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = m, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new st(), this.pointer = new ze(), this.activeCamera = this.perspective;
  }
  async loadModel(e, m, w = "glb") {
    const G = `${w}:${m}`;
    if (!(!m || this.modelLoads.get(e) === G)) {
      this.modelLoads.set(e, G);
      try {
        let h, v = [];
        if (w === "obj") h = await new We().loadAsync(m);
        else if (w === "fbx")
          h = await new je().loadAsync(m), v = h.animations || [];
        else if (w === "stl") h = new fe(await new Ie().loadAsync(m), me.clone());
        else if (w === "ply") {
          const o = await new Ne().loadAsync(m);
          o.index ? (o.getAttribute("normal") || o.computeVertexNormals(), h = new fe(o, me.clone())) : h = new nt(o, new it({ color: 11449792, size: 0.025 }));
        } else {
          const o = await new Ue().loadAsync(m);
          h = o.scene, v = o.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== G) {
          ve(h, !0);
          return;
        }
        const b = this.models.get(e);
        b && ve(b.scene, !0), h.traverse((o) => {
          if (o.userData.omnicamModelResource = !0, o.frustumCulled = !1, o.isMesh && (o.frustumCulled = !1, o.material)) {
            const c = Array.isArray(o.material) ? o.material : [o.material];
            for (const d of c)
              d.side = ae;
          }
          o.isPoints && (o.frustumCulled = !1), o.isSkinnedMesh && (o.frustumCulled = !1, o.computeBoundingBox?.(), o.computeBoundingSphere?.());
        });
        let X = 0, j = 0, I = 0, U = 0;
        h.traverse((o) => {
          o.isMesh && (X += 1, U += o.geometry?.getAttribute?.("position")?.count || 0), o.isPoints && (j += 1), o.isBone && (I += 1);
        });
        const q = new ie();
        if (q.frustumCulled = !1, q.add(h), !X && !j && I) {
          const o = new ct(h);
          o.material.depthTest = !1, o.material.opacity = 0.9, o.material.transparent = !0, o.renderOrder = 10, o.userData.omnicamModelResource = !0, q.add(o);
        }
        q.updateMatrixWorld(!0);
        const re = new lt().setFromObject(q), Z = re.getSize(new De()), te = Math.max(Z.x, Z.y, Z.z), J = Number.isFinite(te) && te > 1e-6 ? 2.5 / te : 1, se = re.getCenter(new De());
        q.scale.setScalar(J), q.position.set(-se.x * J, -re.min.y * J, -se.z * J);
        const O = new ie();
        O.frustumCulled = !1, O.add(q);
        const p = v.length ? new dt(h) : null;
        p && p.clipAction(v[0]).play();
        const t = { url: m, format: w, scene: O, mixer: p, clips: v, selectedClip: 0, duration: v[0]?.duration || 0, meshes: X, points: j, bones: I, vertices: U, animations: v.length, normalizationScale: J };
        this.models.set(e, t), this.onModelLoaded({ id: e, format: w, meshes: X, points: j, bones: I, vertices: U, animations: v.length, animationNames: v.map((o, c) => o.name || `Clip ${c + 1}`), duration: t.duration, normalizationScale: J }), this.sceneKey = "", this.invalidate();
      } catch (h) {
        this.modelLoads.get(e) === G && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${w.toUpperCase()} ${e}`, h);
        const v = h?.message?.includes("FBX version not supported") || h?.message?.includes("6100") || h?.message?.includes("6000"), b = v ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : h?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: w, error: b, isLegacyFBX: v });
      }
    }
  }
}
const ue = { THREE: xe, FBXLoader: je, GLTFLoader: Ue, OBJLoader: We, PLYLoader: Ne, STLLoader: Ie, neutral: me, wire: Se, checkerMaterial: Ge, objectMaterial: ar, applyModelMaterial: sr, disposeObject: ve, textureFor: Ke, cardMesh: nr, generatePointField: Mt, sampleCamera: xt, sampleObjectTransform: bt, hasOutlineMesh: rr, SelectionOutlineRenderer: or };
Object.assign(
  ir.prototype,
  $t(ue),
  Kt(ue),
  Yt(ue),
  er(ue)
);
async function cr(a, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const m of ["vp9", "vp8"])
    try {
      if (await he(Ft(m, { width: a, height: e }), 5e3, `Checking ${m} support`)) return m;
    } catch {
    }
  return null;
}
function he(a, e, m) {
  let w;
  return Promise.race([
    a,
    new Promise((G, h) => {
      w = setTimeout(() => h(new Error(`${m} timed out`)), e);
    })
  ]).finally(() => clearTimeout(w));
}
async function wr(a, e, m, w, G, h = "balanced") {
  const v = await cr(a.width, a.height);
  if (!v) throw new Error("No supported WebCodecs WebM encoder");
  const b = new Dt({ format: new At(), target: new Pt() }), X = new Vt(a, { codec: v, quality: Fe[h] || Fe.balanced, keyFrameInterval: 1 });
  b.addVideoTrack(X, { frameRate: m }), await he(b.start(), 1e4, "Starting deterministic encoder");
  try {
    const j = 1 / m;
    for (let I = 0; I < e; I++) {
      if (G?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await w(I), await he(X.add(I * j, j, { keyFrame: I % m === 0 }), 1e4, `Encoding frame ${I + 1}`);
    }
    await he(b.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (j) {
    throw b.state !== "finalized" && await b.cancel().catch(() => {
    }), j;
  }
  return Lt(new Blob([b.target.buffer], { type: await b.getMimeType() }), {
    encoder: "webcodecs",
    requestedFrames: e,
    expectedDurationMs: e / m * 1e3,
    recordedDurationMs: e / m * 1e3,
    driftMs: 0,
    fps: m,
    width: a.width,
    height: a.height
  });
}
export {
  ir as OmniWebGLViewport,
  wr as encodeDeterministicPlayblast,
  cr as supportsDeterministicEncoding
};
