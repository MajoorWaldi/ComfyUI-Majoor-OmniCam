import { T as xe } from "./chunk-IMiHbUfz.js";
import { ab as ze, ae as Ye, af as He, ag as Qe, ah as Ze, W as Je, s as Ce, Z as Ee, i as et, u as ce, H as tt, l as rt, G as ie, k as ot, Y as at, a2 as st, ai as We, aj as je, M as pe, ak as Ie, n as Be, al as Ne, P as nt, c as it, e as Ue, D as ae, a5 as ct, d as lt, V as De, v as dt, f as be, J as Le, m as Pe, z as ut, a1 as mt, a3 as ht, ac as ft, a8 as pt } from "./vendor-three-B8JDtKPi.js";
import { T as ye, bR as wt, bS as gt, bT as yt, bf as Mt, a as xt, J as bt } from "./chunk-DVmalmrw.js";
import { r as vt, q as Ct, a as Ae, s as Re, D as Ve, c as Bt, b as Lt, d as _t } from "./chunk-5mR0FIYk.js";
import { c as St } from "./chunk-a2yd8Eqb.js";
import { n as Gt } from "./chunk-DvclxjiH.js";
import { Output as Dt, BufferTarget as Pt, WebMOutputFormat as At, CanvasSource as Vt, QUALITY_HIGH as Ot, QUALITY_MEDIUM as kt, QUALITY_LOW as Tt, canEncodeVideo as Ft } from "./vendor-mediabunny-CZ5VNE-V.js";
function zt(o, { position: e, forward: u, up: p, color: D, scale: h = 1, active: B = !0 }) {
  const v = new o.Group(), q = B ? 0.95 : 0.5, j = new o.MeshBasicMaterial({
    color: D,
    transparent: !0,
    opacity: q,
    depthTest: !1
  }), I = new o.Mesh(new o.BoxGeometry(0.34, 0.24, 0.42), j);
  I.renderOrder = 912, v.add(I);
  const N = new o.Mesh(new o.ConeGeometry(0.17, 0.26, 20), j);
  return N.rotation.x = -Math.PI / 2, N.position.z = -0.32, N.renderOrder = 912, v.add(N), v.scale.setScalar(h), v.position.copy(e), v.up.copy(p), v.lookAt(e.clone().add(u)), v;
}
function Wt(o, { position: e, color: u = 15903035, radius: p = 0.28, bold: D = !1 }) {
  const h = new o.Group(), B = D ? 16773544 : u, v = new o.LineBasicMaterial({ color: B, transparent: !0, opacity: D ? 1 : 0.95, depthTest: !1 }), q = (N) => {
    const R = [];
    for (let te = 0; te <= 48; te++) {
      const E = te / 48 * Math.PI * 2;
      R.push(new o.Vector3(Math.cos(E) * N, Math.sin(E) * N, 0));
    }
    const J = new o.Line(new o.BufferGeometry().setFromPoints(R), v);
    return J.renderOrder = 915, J;
  };
  if (h.add(q(p)), D) {
    h.add(q(p * 1.18));
    const N = new o.Mesh(
      new o.RingGeometry(0, p * 0.3, 16),
      new o.MeshBasicMaterial({ color: B, transparent: !0, opacity: 1, depthTest: !1 })
    );
    N.renderOrder = 916, h.add(N);
  }
  const j = p * 1.55, I = new o.LineSegments(
    new o.BufferGeometry().setFromPoints([
      new o.Vector3(-j, 0, 0),
      new o.Vector3(-p * 0.45, 0, 0),
      new o.Vector3(p * 0.45, 0, 0),
      new o.Vector3(j, 0, 0),
      new o.Vector3(0, -j, 0),
      new o.Vector3(0, -p * 0.45, 0),
      new o.Vector3(0, p * 0.45, 0),
      new o.Vector3(0, j, 0)
    ]),
    v
  );
  return I.renderOrder = 915, h.add(I), h.position.copy(e), h.userData.omnicamBillboard = !0, h;
}
const qe = 3718648, jt = 12e3;
function we(o) {
  return !!(o.isSkinnedMesh && o.skeleton);
}
function Xe(o, e) {
  o.position.copy(e.position), o.quaternion.copy(e.quaternion), o.scale.copy(e.scale);
}
function ge(o) {
  return o.frustumCulled = !1, o.raycast = () => {
  }, o.userData.omnicamHelper = !0, o;
}
function It(o, e, { color: u = null, opacity: p = null } = {}) {
  const D = u ?? qe, h = p ?? 0.65;
  if (we(e)) {
    const v = new o.SkinnedMesh(e.geometry.clone(), new o.MeshBasicMaterial({
      color: D,
      wireframe: !0,
      transparent: !0,
      opacity: h,
      depthWrite: !1
    }));
    return v.bindMode = e.bindMode, v.bind(e.skeleton, e.bindMatrix), Xe(v, e), { overlay: ge(v), parent: e.parent || e };
  }
  const B = new o.LineSegments(
    new o.WireframeGeometry(e.geometry),
    new o.LineBasicMaterial({ color: D, opacity: h, transparent: !0, depthTest: !0 })
  );
  return { overlay: ge(B), parent: e };
}
function Nt(o, e) {
  const u = new o.PointsMaterial({ color: qe, size: 0.05, sizeAttenuation: !0 });
  if (!we(e)) {
    const N = new o.Points(e.geometry, u);
    return { overlay: ge(N), parent: e };
  }
  const p = e.geometry.getAttribute("position")?.count || 0, D = Math.max(1, Math.ceil(p / jt)), h = Math.ceil(p / D), B = new Float32Array(h * 3), v = new o.BufferGeometry();
  v.setAttribute("position", new o.Float32BufferAttribute(B, 3));
  const q = new o.Points(v, u);
  Xe(q, e);
  const j = new o.Vector3(), I = v.getAttribute("position");
  return q.onBeforeRender = () => {
    for (let N = 0; N < h; N++)
      e.getVertexPosition(N * D, j), I.setXYZ(N, j.x, j.y, j.z);
    I.needsUpdate = !0;
  }, { overlay: ge(q), parent: e.parent || e };
}
function Ut(o, e, u) {
  const p = we(e) ? new o.SkinnedMesh(e.geometry.clone(), u) : new o.Mesh(e.geometry.clone(), u);
  return we(e) && (p.bindMode = e.bindMode, p.bind(e.skeleton, e.bindMatrix)), p.matrixAutoUpdate = !1, p.matrix.copy(e.matrixWorld), p.frustumCulled = !1, p;
}
function Rt(o, e, { wireframe: u = !1, vertices: p = !1, wireframeColor: D = null, wireframeOpacity: h = null } = {}) {
  if (!u && !p) return;
  const B = [];
  e.traverse((v) => {
    v.isMesh && v.geometry && !v.userData.omnicamHelper && B.push(v);
  });
  for (const v of B) {
    if (u) {
      const { overlay: q, parent: j } = It(o, v, { color: D, opacity: h });
      j.add(q);
    }
    if (p) {
      const { overlay: q, parent: j } = Nt(o, v);
      j.add(q);
    }
  }
}
const qt = 16777215, ne = 0.17, Oe = 3593923, Xt = 0.06;
function $t(o) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: D, PLYLoader: h, STLLoader: B, neutral: v, wire: q, checkerMaterial: j, objectMaterial: I, applyModelMaterial: N, disposeObject: R, textureFor: re, cardMesh: J, generatePointField: te, sampleCamera: E, sampleObjectTransform: se } = o;
  return {
    removeModel(A) {
      const f = this.models.get(A);
      f && R(f.scene, !0), this.models.delete(A), this.modelLoads.delete(A), this.sceneKey = "";
    },
    selectAnimation(A, f) {
      const t = this.models.get(A);
      !t?.mixer || !t.clips.length || (t.selectedClip = Math.max(0, Math.min(t.clips.length - 1, Number(f) || 0)), t.duration = t.clips[t.selectedClip].duration || 0, t.motionClipId = null, t.mixer.stopAllAction(), t.mixer.clipAction(t.clips[t.selectedClip]).play(), this.invalidate());
    },
    /** Select the clip a character motion names (by clip name, else index, else
     * the first clip). Idempotent -- re-selecting the same clip is a no-op so the
     * per-frame render loop can call it freely (design spec section 27). */
    applyMotionClip(A, f) {
      const t = this.models.get(A);
      if (!t?.mixer || !t.clips.length) return;
      const r = String(f?.clip_id ?? "");
      if (t.motionClipId === r) return;
      let c = t.clips.findIndex((s) => (s.name || "").toLowerCase() === r.toLowerCase());
      c < 0 && /^\d+$/.test(r) && (c = Number(r)), (c < 0 || c >= t.clips.length) && (c = 0), t.selectedClip = c, t.motionClipId = r, t.duration = t.clips[c].duration || 0, t.mixer.stopAllAction();
      const d = t.mixer.clipAction(t.clips[c]);
      d.reset(), d.play(), this.invalidate();
    },
    rebuild(A, f, t, r = !1, c = "auto") {
      this.content.traverse((a) => {
        for (const z of [...a.children])
          z.userData.omnicamHelper && (a.remove(z), R(z, !0));
      }), R(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const d = A.render_mode, s = r && ["clay", "motion_proxy", "depth_rich"].includes(c), i = (a, z) => {
        const M = v.clone();
        return M.side = z ? e.FrontSide : e.DoubleSide, a.color && (M.color = new e.Color(a.color)), M;
      }, x = (a) => s ? i(a, !!A.backface_culling) : I(a, d, !!A.backface_culling), m = new e.Group();
      m.userData.omnicamCaptureGuide = !0;
      const l = new e.GridHelper(120, 24, 4081496, 3291463);
      l.userData.omnicamCaptureGuide = !0, l.frustumCulled = !1, l.position.y = 5e-4, m.add(l);
      const g = new e.GridHelper(120, 120, 2238001, 1909035);
      g.userData.omnicamCaptureGuide = !0, g.frustumCulled = !1, m.add(g);
      const n = new e.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), G = new e.BufferGeometry().setFromPoints([new e.Vector3(-60, 1e-3, 0), new e.Vector3(60, 1e-3, 0)]), T = new e.Line(G, n);
      T.userData.omnicamCaptureGuide = !0, m.add(T);
      const O = new e.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), y = new e.BufferGeometry().setFromPoints([new e.Vector3(0, 1e-3, -60), new e.Vector3(0, 1e-3, 60)]), P = new e.Line(y, O);
      P.userData.omnicamCaptureGuide = !0, m.add(P), this.content.add(m);
      const S = r && c === "depth_rich";
      if (["omni_ref", "point_field"].includes(d) || S) {
        const a = A.objects.filter((b) => b.enabled !== !1 && !["sun_light", "point_light", "spot_light", "null"].includes(b.type)).length, z = S && a <= 1 && (!A.point_density || A.point_density === "none") ? "sparse" : A.point_density || "balanced", { points: M, colors: W } = te(z, A.point_spread || "all_views", A.point_color || null);
        if (M.length > 0) {
          const b = new e.BufferGeometry();
          b.setAttribute("position", new e.Float32BufferAttribute(M, 3)), b.setAttribute("color", new e.Float32BufferAttribute(W, 3));
          const C = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), L = new e.Points(b, C);
          L.frustumCulled = !1, this.content.add(L);
        }
      }
      if (!["grid", "point_field"].includes(d))
        for (const a of A.objects) {
          if (a.enabled === !1) continue;
          const z = a.size || [1, 1, 1];
          let M;
          if (a.type === "glb" || a.type === "model") {
            const b = t.get(a.id), C = this.models.get(a.id), L = a.format || (a.type === "glb" ? "glb" : "");
            b && (C?.url !== b || C?.format !== L) && this.loadModel(a.id, b, L);
            const k = !!A.backface_culling, F = r && c === "clay" ? "neutral" : vt(a, A, r) ?? (a.material_mode || "textured");
            C?.url === b && (M = C.scene, N(M, F, a, k));
          } else if (a.type === "sphere")
            M = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), x(a));
          else if (a.type === "cylinder")
            M = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), x(a));
          else if (a.type === "torus") {
            const b = new e.TorusGeometry(0.5, 0.2, 16, 32);
            b.rotateX(Math.PI / 2), M = new e.Mesh(b, x(a));
          } else if (a.type === "pyramid") {
            const b = new e.ConeGeometry(0.7, 1, 4);
            b.rotateY(Math.PI / 4), M = new e.Mesh(b, x(a));
          } else if (a.type === "sun_light") {
            const b = new e.Group(), C = new e.DirectionalLight(a.color || 16774892, a.intensity ?? 2.2);
            C.castShadow = a.cast_shadow !== !1, C.castShadow && (C.shadow.mapSize.set(1024, 1024), C.shadow.bias = -8e-4, C.shadow.normalBias = 0.02, C.shadow.radius = 2.4, C.shadow.camera.near = 0.5, C.shadow.camera.far = 70, C.shadow.camera.left = C.shadow.camera.bottom = -14, C.shadow.camera.right = C.shadow.camera.top = 14);
            const L = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), k = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(L[0], L[1], L[2], "YXZ"));
            C.target.position.copy(C.position).add(k.multiplyScalar(10)), b.add(C, C.target);
            const F = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16096779, wireframe: !0 })
            );
            F.userData.omnicamLightHelper = !0, F.visible = !r, b.add(F), M = b;
          } else if (a.type === "point_light") {
            const b = new e.Group(), C = new e.PointLight(a.color || 16777215, a.intensity ?? 2, 0, 2);
            b.add(C);
            const L = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16498468, wireframe: !0 })
            );
            L.userData.omnicamLightHelper = !0, L.visible = !r, b.add(L), M = b;
          } else if (a.type === "spot_light") {
            const b = new e.Group(), C = (a.cone_angle ?? 45) * Math.PI / 180, L = a.penumbra ?? 0.25, k = new e.SpotLight(a.color || 16777215, a.intensity ?? 3, 0, C, L, 2), F = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), $ = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(F[0], F[1], F[2], "YXZ"));
            k.target.position.copy(k.position).add($.multiplyScalar(10)), b.add(k, k.target);
            const K = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: a.color || 3718648, wireframe: !0 })
            );
            K.userData.omnicamLightHelper = !0, K.visible = !r, b.add(K), M = b;
          } else if (a.type === "human")
            M = new e.Mesh(St(e), x(a));
          else if (a.type === "ground") M = new e.Mesh(new e.BoxGeometry(1, 1, 1), x(a));
          else if (a.type === "card")
            M = !a.material_mode || ["textured", "wireframe_texture"].includes(a.material_mode) ? J(a, f.get(a.id), A.card_fit || "contain") : new e.Mesh(new e.PlaneGeometry(z[0], z[1]), x(a));
          else if (a.type === "null") {
            const b = new e.AxesHelper(0.5);
            b.position.fromArray(a.position || [0, 0, 0]), b.userData.omnicamId = a.id, b.frustumCulled = !1, this.objectNodes.set(a.id, b), this.content.add(b);
            continue;
          } else
            M = new e.Mesh(new e.BoxGeometry(1, 1, 1), x(a));
          if (!M) continue;
          M.position.fromArray(a.position || [0, 0, 0]), M.rotation.set(...(a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const W = ["sun_light", "point_light", "spot_light"].includes(a.type);
          if (a.type !== "card" && !W && M.scale.fromArray(z), M.userData.omnicamId = a.id, M.frustumCulled = !1, M.traverse((b) => {
            b.frustumCulled = !1, b.userData.omnicamId = a.id;
          }), !W) {
            const b = !!(A.show_wireframe || A.render_mode === "wireframe_texture" || a.material_mode === "wireframe_texture" || a.material_mode === "wireframe_neutral");
            Rt(e, M, { wireframe: b, vertices: A.show_vertices });
          }
          this.objectNodes.set(a.id, M), this.content.add(M);
        }
    },
    rebuildPath(A, f = "camera", t = null, r = "", c = null) {
      const d = Array.isArray(c) ? new Set(c) : null;
      R(this.path), this.path.clear();
      const s = r === "camera" ? A.active_camera_id : null, i = [
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
      (A.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: A.keyframes || [] }]).forEach((l, g) => {
        const n = l.keyframes || [];
        if (n.length === 0 || l.id === s) return;
        const G = l.color ? { line: new e.Color(l.color), marker: new e.Color(l.color), frustum: new e.Color(l.color) } : i[g % i.length], T = l.id === A.active_camera_id, O = T && f === "camera";
        if (n.length >= 2) {
          const y = n[0].frame, P = n[n.length - 1].frame, S = Math.max(32, Math.min(256, P - y + 1)), a = { ...l, keyframes: n, objects: A.objects }, z = Array.from({ length: S }, (L, k) => {
            const F = y + (P - y) * k / Math.max(1, S - 1);
            return new e.Vector3().fromArray(E(a, F, A.objects).position);
          }), M = new e.CatmullRomCurve3(z, !1, "centripetal"), W = O ? 0.06 : T ? 0.045 : 0.025, b = new e.MeshBasicMaterial({
            color: G.line,
            transparent: !0,
            opacity: T ? 1 : 0.55,
            depthTest: !1
          }), C = new e.Mesh(new e.TubeGeometry(M, Math.max(48, S), W, 8, !1), b);
          if (C.renderOrder = 900, C.userData.omnicamWidget = "path", T && !l.locked && (C.userData.omnicamPathSegments = {
            cameraId: l.id,
            firstFrame: y,
            lastFrame: P,
            frames: n.map((L) => L.frame),
            points: z.map((L) => [L.x, L.y, L.z])
          }), this.path.add(C), T) {
            const L = new e.Mesh(
              new e.TubeGeometry(M, Math.max(48, S), W * (O ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: G.line, transparent: !0, opacity: O ? 0.3 : 0.18, depthTest: !1 })
            );
            if (L.renderOrder = 899, L.userData.omnicamWidget = "path", this.path.add(L), z.length >= 8) {
              const k = Math.max(6, Math.floor(S / 8));
              for (let F = Math.floor(k / 2); F < S - 1; F += k) {
                const $ = z[F], K = z[F + 1].clone().sub($).normalize(), ee = new e.ConeGeometry(W * 1.5, W * 3, 8);
                ee.rotateX(Math.PI / 2);
                const Q = new e.Quaternion().setFromUnitVectors(new e.Vector3(0, 0, 1), K), U = new e.Mesh(ee, new e.MeshBasicMaterial({ color: G.marker, transparent: !0, opacity: 0.85, depthTest: !1 }));
                U.quaternion.copy(Q), U.position.copy($), U.renderOrder = 901, U.userData.omnicamWidget = "path", this.path.add(U);
              }
            }
          }
        }
        for (const y of n) {
          const P = n.indexOf(y), S = T, a = new e.Mesh(
            new e.SphereGeometry(S ? ne : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: S ? qt : G.marker, depthTest: !1 })
          );
          a.position.fromArray(y.camera.position), a.renderOrder = 910, a.userData.omnicamPathKey = { cameraId: l.id, frame: y.frame }, a.userData.omnicamWidget = "path", this.path.add(a);
          const z = new e.Mesh(
            new e.RingGeometry((S ? ne : 0.085) * 1.3, (S ? ne : 0.085) * 1.7, 24),
            new e.MeshBasicMaterial({ color: S ? 16777215 : G.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          z.position.fromArray(y.camera.position), z.renderOrder = 909, z.userData.omnicamBillboard = !0, z.userData.omnicamWidget = "path", this.path.add(z);
          const M = new e.Vector3().fromArray(y.camera.position), W = new e.Vector3().fromArray(y.camera.target || [0, 0, 0]), b = T && t != null && y.frame === t, C = T && !b && d?.has(y.frame);
          if (b) {
            const L = new e.Mesh(
              new e.RingGeometry(ne * 2.1, ne * 2.6, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            L.position.fromArray(y.camera.position), L.renderOrder = 911, L.userData.omnicamBillboard = !0, L.userData.omnicamWidget = "path", this.path.add(L);
          } else if (C) {
            const L = new e.Mesh(
              new e.RingGeometry(ne * 1.9, ne * 2.2, 24),
              new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.85, depthTest: !1 })
            );
            L.position.fromArray(y.camera.position), L.renderOrder = 911, L.userData.omnicamBillboard = !0, L.userData.omnicamWidget = "path", this.path.add(L);
          }
          if (b) {
            const L = W.clone().sub(M).normalize();
            let k = new e.Vector3().crossVectors(L, new e.Vector3(0, 1, 0));
            k.lengthSq() < 1e-8 ? k.set(1, 0, 0) : k.normalize();
            const F = new e.Vector3().crossVectors(k, L).normalize(), $ = e.MathUtils.clamp(M.distanceTo(W) * 0.08, 0.25, 0.8), K = y.camera.camera_type === "orthographic" ? $ * 0.55 : $ * Math.tan(e.MathUtils.degToRad(y.camera.fov || 35) * 0.5), ee = K * (A.width || 16) / Math.max(1, A.height || 9), Q = M.clone().addScaledVector(L, $), U = [
              Q.clone().addScaledVector(k, -ee).addScaledVector(F, -K),
              Q.clone().addScaledVector(k, ee).addScaledVector(F, -K),
              Q.clone().addScaledVector(k, ee).addScaledVector(F, K),
              Q.clone().addScaledVector(k, -ee).addScaledVector(F, K)
            ], Z = [];
            for (const Y of U) Z.push(M, Y);
            for (let Y = 0; Y < 4; Y++) Z.push(U[Y], U[(Y + 1) % 4]);
            const w = new e.BufferGeometry().setFromPoints(Z), _ = new e.LineSegments(w, new e.LineBasicMaterial({
              color: G.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            _.userData.omnicamWidget = "gizmo", this.path.add(_);
            const V = new e.BufferGeometry();
            V.setIndex([0, 1, 2, 0, 2, 3]), V.setAttribute("position", new e.Float32BufferAttribute([
              U[0].x,
              U[0].y,
              U[0].z,
              U[1].x,
              U[1].y,
              U[1].z,
              U[2].x,
              U[2].y,
              U[2].z,
              U[3].x,
              U[3].y,
              U[3].z
            ], 3));
            const X = new e.Mesh(V, new e.MeshBasicMaterial({
              color: G.marker,
              transparent: !0,
              opacity: 0.12,
              depthTest: !1,
              side: e.DoubleSide
            }));
            X.userData.omnicamWidget = "gizmo", this.path.add(X);
            const H = zt(e, {
              position: M,
              forward: L,
              up: F,
              color: G.marker,
              scale: e.MathUtils.clamp($ * 1.15, 0.35, 1.6),
              active: T
            });
            H.userData.omnicamWidget = "gizmo", this.path.add(H);
          }
          if (b) {
            const L = Wt(e, {
              position: W,
              radius: e.MathUtils.clamp(M.distanceTo(W) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            L.userData.omnicamWidget = "lookat", this.path.add(L);
            const k = new e.Line(
              new e.BufferGeometry().setFromPoints([M.clone(), W.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            k.renderOrder = 914, k.userData.omnicamWidget = "lookat", this.path.add(k);
          }
          if (b) {
            const L = Gt(y, n[P - 1] || null, n[P + 1] || null);
            for (const k of ["in", "out"]) {
              const F = new e.Vector3().fromArray(L[k]), $ = new e.Line(
                new e.BufferGeometry().setFromPoints([M.clone(), F.clone()]),
                new e.LineBasicMaterial({ color: Oe, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              $.renderOrder = 912, $.userData.omnicamWidget = "gizmo", this.path.add($);
              const K = new e.Mesh(
                new e.SphereGeometry(Xt, 12, 8),
                new e.MeshBasicMaterial({ color: Oe, depthTest: !1 })
              );
              K.position.copy(F), K.renderOrder = 913, K.userData.omnicamCurveHandle = { cameraId: l.id, frame: y.frame, side: k }, K.userData.omnicamWidget = "gizmo", this.path.add(K);
            }
          }
        }
      });
      const m = [16742005, 52937, 16632686, 7101671, 14774357];
      (A.objects || []).forEach((l, g) => {
        const n = l.keyframes || [];
        if (n.length < 2) return;
        const G = l.color ? new e.Color(l.color) : m[g % m.length], T = n.map((P) => new e.Vector3().fromArray(P.transform?.position || [0, 0, 0])), O = new e.CatmullRomCurve3(T, !1, "centripetal"), y = new e.Mesh(
          new e.TubeGeometry(O, Math.max(32, n.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: G, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        y.renderOrder = 900, y.userData.omnicamWidget = "path", this.path.add(y);
        for (const P of n) {
          const S = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: G, depthTest: !1 })
          );
          S.position.fromArray(P.transform?.position || [0, 0, 0]), S.renderOrder = 910, S.userData.omnicamWidget = "path", this.path.add(S);
        }
      });
    }
  };
}
function Kt(o) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: D, PLYLoader: h, STLLoader: B, neutral: v, wire: q, checkerMaterial: j, objectMaterial: I, applyModelMaterial: N, disposeObject: R, textureFor: re, cardMesh: J, generatePointField: te, sampleCamera: E, sampleObjectTransform: se, hasOutlineMesh: A } = o;
  return {
    updateLiveCameras(f, t, r, c, d = "camera", s = null) {
      if (R(this.liveCameras), this.liveCameras.clear(), r) return;
      const i = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (f.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: f.keyframes || [] }]).forEach((m, l) => {
        const g = m.color ? { line: new e.Color(m.color), marker: new e.Color(m.color), frustum: new e.Color(m.color), body: new e.Color(m.color).multiplyScalar(0.35) } : i[l % i.length], n = m.id === f.active_camera_id, G = n && d === "camera", T = c === "camera" && n, O = E(m, t, f.objects), y = new e.Vector3().fromArray(O.position || [0, 0, 0]), P = new e.Vector3().fromArray(O.target || [0, 0, 0]), S = P.clone().sub(y), a = S.length();
        a < 1e-4 ? S.set(0, 0, -1) : S.normalize();
        let z = new e.Vector3(0, 1, 0), M = new e.Vector3().crossVectors(S, z);
        M.lengthSq() < 1e-6 && (z = new e.Vector3(0, 0, 1), M = new e.Vector3().crossVectors(S, z)), M.normalize();
        let W = new e.Vector3().crossVectors(M, S).normalize();
        if (O.roll) {
          const C = e.MathUtils.degToRad(O.roll);
          M.applyAxisAngle(S, C), W.applyAxisAngle(S, C);
        }
        const b = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!T) {
          const C = new e.Group(), L = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: g.body, roughness: 0.4, metalness: 0.8 })
          );
          L.position.set(0, 0, -0.11), C.add(L);
          const k = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          k.rotateX(Math.PI / 2);
          const F = new e.Mesh(
            k,
            new e.MeshStandardMaterial({ color: g.marker, roughness: 0.2, metalness: 0.9 })
          );
          F.position.set(0, 0, 0.05), C.add(F);
          const $ = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: n ? 16729156 : g.marker })
          );
          $.position.set(0, 0.07, -0.08), C.add($);
          const K = new e.Matrix4().makeBasis(M, W, S.clone().negate());
          C.quaternion.setFromRotationMatrix(K), C.position.copy(y), C.userData.omnicamWidget = "gizmo", this.liveCameras.add(C);
          const ee = new e.SphereGeometry(0.35, 8, 6), Q = new e.Mesh(ee, b);
          Q.position.copy(y), Q.userData = { omnicamType: "camera", omnicamId: m.id }, this.liveCameras.add(Q);
          const U = e.MathUtils.clamp(a * 0.25, 0.5, 2.5), Z = O.camera_type === "orthographic" ? 5 / Math.max(0.01, O.zoom || 1) * 0.35 : U * Math.tan(e.MathUtils.degToRad(O.fov || 35) * 0.5), w = Z * (f.width || 16) / Math.max(1, f.height || 9), _ = y.clone().addScaledVector(S, U), V = [
            _.clone().addScaledVector(M, -w).addScaledVector(W, -Z),
            _.clone().addScaledVector(M, w).addScaledVector(W, -Z),
            _.clone().addScaledVector(M, w).addScaledVector(W, Z),
            _.clone().addScaledVector(M, -w).addScaledVector(W, Z)
          ], X = [];
          for (const de of V) X.push(y, de);
          for (let de = 0; de < 4; de++) X.push(V[de], V[(de + 1) % 4]);
          const Y = V[2].clone().add(V[3]).multiplyScalar(0.5).clone().addScaledVector(W, Z * 0.25);
          X.push(V[2], Y, Y, V[3]);
          const ue = new e.BufferGeometry().setFromPoints(X), le = new e.LineSegments(ue, new e.LineBasicMaterial({
            color: G ? g.marker : g.frustum,
            linewidth: n ? 2 : 1,
            transparent: !0,
            opacity: n ? 1 : 0.6
          }));
          le.userData.omnicamWidget = "gizmo", this.liveCameras.add(le);
          const oe = new e.BufferGeometry();
          oe.setIndex([0, 1, 2, 0, 2, 3]), oe.setAttribute("position", new e.Float32BufferAttribute([
            V[0].x,
            V[0].y,
            V[0].z,
            V[1].x,
            V[1].y,
            V[1].z,
            V[2].x,
            V[2].y,
            V[2].z,
            V[3].x,
            V[3].y,
            V[3].z
          ], 3));
          const Ge = new e.Mesh(oe, new e.MeshBasicMaterial({
            color: G ? g.marker : g.frustum,
            transparent: !0,
            opacity: 0.12,
            depthTest: !1,
            side: e.DoubleSide
          }));
          Ge.userData.omnicamWidget = "gizmo", this.liveCameras.add(Ge);
        }
        if (a > 0.01) {
          const C = n && d === "camera_target", L = new e.BufferGeometry().setFromPoints([y, P]), k = new e.Line(L, new e.LineDashedMaterial({
            color: G || C ? 9133302 : g.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: G || C ? 1 : n ? 0.75 : 0.4
          }));
          k.userData.omnicamWidget = "lookat", this.liveCameras.add(k);
          const F = C ? 0.12 : G ? 0.11 : 0.08, $ = [
            P.clone().add(new e.Vector3(-F, 0, 0)),
            P.clone().add(new e.Vector3(F, 0, 0)),
            P.clone().add(new e.Vector3(0, -F, 0)),
            P.clone().add(new e.Vector3(0, F, 0)),
            P.clone().add(new e.Vector3(0, 0, -F)),
            P.clone().add(new e.Vector3(0, 0, F))
          ], K = new e.BufferGeometry().setFromPoints($), ee = new e.LineSegments(K, new e.LineBasicMaterial({
            color: C || G ? 9133302 : g.marker,
            linewidth: C ? 3 : 1,
            transparent: !0,
            opacity: C || G ? 1 : n ? 0.9 : 0.5
          }));
          ee.userData.omnicamWidget = "lookat", this.liveCameras.add(ee);
          const Q = new e.SphereGeometry(0.28, 8, 6), U = new e.Mesh(Q, b);
          if (U.position.copy(P), U.userData = { omnicamType: "camera_target", omnicamId: m.id }, this.liveCameras.add(U), (C || G) && c !== "camera") {
            const Z = new e.RingGeometry(0.14, 0.18, 24);
            Z.rotateX(Math.PI / 2);
            const w = new e.MeshBasicMaterial({ color: ye.typeLookAt, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), _ = new e.Mesh(Z, w);
            _.position.copy(P), _.userData.omnicamWidget = "lookat", this.liveCameras.add(_);
          }
        }
        if (n && c !== "camera" && d === "camera") {
          const C = new e.RingGeometry(0.19, 0.24, 32);
          C.rotateX(Math.PI / 2);
          const L = new e.MeshBasicMaterial({ color: ye.accent, side: e.DoubleSide, transparent: !0, opacity: 1 }), k = new e.Mesh(C, L);
          k.position.copy(y), k.userData.omnicamWidget = "gizmo", this.liveCameras.add(k);
          const F = new e.RingGeometry(0.28, 0.31, 32);
          F.rotateX(Math.PI / 2);
          const $ = new e.Mesh(F, new e.MeshBasicMaterial({ color: ye.accent, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          $.position.copy(y), $.userData.omnicamWidget = "gizmo", this.liveCameras.add($);
        }
      });
    },
    updateSelection(f, t, r, c = null, d = "", s = !1) {
      const i = c ? `${c.mode || ""}:${c.objectId || ""}:${(c.point || []).join(",")}` : "", x = `${t}:${r || ""}:${(f.__selectedObjectIds || []).join(",")}:${d}:${i}:${s ? "ortho" : "persp"}`;
      if (x !== this.selectionKey) {
        if (this.selectionKey = x, R(this.selectionGroup), this.selectionGroup.clear(), t === "object" && r) {
          const m = this.objectNodes.get(r);
          if (m) {
            m.updateMatrixWorld(!0);
            try {
              const l = new e.Box3(), g = [];
              if (m.traverse((n) => {
                n.isBone && g.push(n);
              }), g.length > 0) {
                const n = new e.Vector3();
                for (const G of g)
                  G.getWorldPosition(n), l.expandByPoint(n);
                l.expandByScalar(0.2);
              } else
                l.setFromObject(m);
              if ((s || !A(m)) && !l.isEmpty() && Number.isFinite(l.min.x) && Number.isFinite(l.max.x) && Number.isFinite(l.min.y) && Number.isFinite(l.max.y) && Number.isFinite(l.min.z) && Number.isFinite(l.max.z)) {
                l.expandByScalar(0.04);
                const n = new e.Box3Helper(l, new e.Color(9133302));
                n.material.transparent = !0, n.material.opacity = 0.95, n.material.depthTest = !1, n.renderOrder = 9999, this.selectionGroup.add(n);
              }
            } catch {
            }
            if (f.show_wireframe) {
              let l = 0;
              m.traverse((g) => {
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
            if (c && c.objectId === r && c.point) {
              if (c.mode === "vertex") {
                const l = new e.SphereGeometry(0.08, 16, 12), g = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), n = new e.Mesh(l, g);
                n.position.fromArray(c.point), n.renderOrder = 1e4, this.selectionGroup.add(n);
                const G = new e.RingGeometry(0.1, 0.15, 24), T = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), O = new e.Mesh(G, T);
                O.position.fromArray(c.point), this.activeCamera && O.quaternion.copy(this.activeCamera.quaternion), O.renderOrder = 1e4, this.selectionGroup.add(O);
              } else if (c.mode === "edge" && c.edge) {
                const [l, g] = c.edge, n = new e.BufferGeometry().setFromPoints([new e.Vector3(...l), new e.Vector3(...g)]), G = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), T = new e.Line(n, G);
                T.renderOrder = 1e4, this.selectionGroup.add(T);
              } else if (c.mode === "face" && c.vertices) {
                const [l, g, n] = c.vertices, G = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...l),
                  new e.Vector3(...g),
                  new e.Vector3(...n)
                ]);
                G.setIndex([0, 1, 2]), G.computeVertexNormals();
                const T = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), O = new e.Mesh(G, T);
                O.renderOrder = 1e4, this.selectionGroup.add(O);
                const y = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...l),
                  new e.Vector3(...g),
                  new e.Vector3(...n),
                  new e.Vector3(...l)
                ]), P = new e.Line(y, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                P.renderOrder = 10001, this.selectionGroup.add(P);
              }
            }
          }
        }
        if (t === "object")
          for (const m of f.__selectedObjectIds || []) {
            if (m === r) continue;
            const l = this.objectNodes.get(m);
            if (l) {
              l.updateMatrixWorld(!0);
              try {
                const g = new e.Box3().setFromObject(l);
                if ((s || !A(l)) && !g.isEmpty() && Number.isFinite(g.min.x)) {
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
    listObjectBones(f) {
      const t = this.objectNodes.get(f);
      if (!t) return [];
      const r = [], c = /* @__PURE__ */ new Set();
      return t.traverse((d) => {
        const s = d.isBone ? d.name : "";
        !s || c.has(s) || r.length >= 256 || (c.add(s), r.push(s));
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
    sampleModelPoint(f, t, r, c = 24) {
      const d = this.objectNodes.get(f);
      if (!d) return null;
      const s = this.models.get(f), i = s?.mixer && s.duration > 0, x = i ? s.mixer.time : null;
      i && (s.mixer.setTime(Math.max(0, r) / Math.max(1, c) % s.duration), d.updateMatrixWorld(!0));
      let m = null;
      if (t) {
        let l = null;
        if (d.traverse((g) => {
          !l && g.isBone && g.name === t && (l = g);
        }), l) {
          const g = new e.Vector3().setFromMatrixPosition(l.matrixWorld);
          m = [g.x, g.y, g.z];
        }
      } else
        m = this.getObjectWorldCenter(f);
      return i && Number.isFinite(x) && (s.mixer.setTime(x), d.updateMatrixWorld(!0)), m;
    },
    getObjectWorldBounds(f) {
      const t = this.objectNodes.get(f);
      if (!t) return null;
      t.updateWorldMatrix(!0, !0);
      const r = new e.Box3().setFromObject(t, !0), c = r.min.toArray(), d = r.max.toArray();
      return !r.isEmpty() && [...c, ...d].every(Number.isFinite) ? { min: c, max: d } : null;
    },
    getObjectWorldCenter(f) {
      const t = this.objectNodes.get(f);
      if (!t) return null;
      t.updateMatrixWorld(!0);
      const r = [];
      if (t.traverse((s) => {
        s.isBone && r.push(s);
      }), r.length > 0) {
        const s = new e.Vector3(), i = new e.Vector3();
        for (const x of r)
          x.getWorldPosition(i), s.add(i);
        return s.divideScalar(r.length), [s.x, s.y, s.z];
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
    getModelBoneNames(f) {
      const t = this.objectNodes.get(f);
      if (!t) return [];
      const r = [];
      return t.traverse((c) => {
        c.isBone && c.name && r.push(c.name);
      }), r;
    },
    /** Resolve one loaded bone by name, plus its world position. */
    resolveModelBone(f, t) {
      const r = this.objectNodes.get(f);
      if (!r || !t) return null;
      let c = null;
      if (r.traverse((s) => {
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
    applyCharacterPose(f, t, r) {
      const c = this.objectNodes.get(f);
      if (!c) return !1;
      const d = /* @__PURE__ */ new Map();
      if (c.traverse((i) => {
        i.isBone && i.name && d.set(i.name, i);
      }), !d.size) return !1;
      for (const i of d.values())
        i.userData.omnicamBindQuat || (i.userData.omnicamBindQuat = i.quaternion.clone());
      const s = r && typeof r == "object" ? r : {};
      for (const [i, x] of Object.entries(t || {})) {
        const m = d.get(x);
        if (!m) continue;
        const l = s[i];
        Array.isArray(l) && l.length === 4 && l.every(Number.isFinite) ? m.quaternion.fromArray(l).normalize() : m.userData.omnicamBindQuat && m.quaternion.copy(m.userData.omnicamBindQuat), m.updateMatrixWorld(!0);
      }
      return this.invalidate(), !0;
    },
    /**
     * Read the current local rotation of every mapped canonical joint -- what
     * "Bake current frame to pose" samples off the live mixer (design spec
     * section 27). A joint still at its captured bind rotation is omitted.
     */
    sampleCharacterBonePose(f, t) {
      const r = this.objectNodes.get(f);
      if (!r || !t) return {};
      const c = /* @__PURE__ */ new Map();
      r.traverse((s) => {
        s.isBone && s.name && c.set(s.name, s);
      });
      const d = {};
      for (const [s, i] of Object.entries(t)) {
        const x = c.get(i);
        if (!x) continue;
        const m = x.userData.omnicamBindQuat;
        m && x.quaternion.angleTo(m) < 1e-4 || (d[s] = x.quaternion.toArray());
      }
      return d;
    }
  };
}
function Yt(o) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: D, PLYLoader: h, STLLoader: B, neutral: v, wire: q, checkerMaterial: j, objectMaterial: I, applyModelMaterial: N, disposeObject: R, textureFor: re, cardMesh: J, generatePointField: te, sampleCamera: E, sampleObjectTransform: se } = o;
  function A(f) {
    const t = f.supersampleFactor?.() || 1;
    return { w: f.canvas.width / t, h: f.canvas.height / t };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(f) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = A(this);
      this.pointer.set(f[0] / t * 2 - 1, -(f[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
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
        const m = (s.x * 0.5 + 0.5) * t, l = (1 - (s.y * 0.5 + 0.5)) * r, g = Math.hypot(f[0] - m, f[1] - l);
        g <= c && (!d || g < d.distance) && (d = { key: x, position: i.position.toArray(), distance: g });
      }
      return d ? { ...d.key, position: d.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(f) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = A(this);
      this.pointer.set(f[0] / t * 2 - 1, -(f[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
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
        const m = (s.x * 0.5 + 0.5) * t, l = (1 - (s.y * 0.5 + 0.5)) * r, g = Math.hypot(f[0] - m, f[1] - l);
        g <= c && (!d || g < d.distance) && (d = { handle: x, position: i.position.toArray(), distance: g });
      }
      return d ? { ...d.handle, position: d.position } : null;
    },
    /**
     * The active camera-path segment (two neighbouring real keyframes, plus
     * a `t` 0..1 between them) nearest the pointer, for double-click-to-
     * insert (Task 8). `null` when the pointer isn't over the path tube.
     */
    pickPathSegment(f) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = A(this);
      this.pointer.set(f[0] / t * 2 - 1, -(f[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const c = this.raycaster.intersectObjects(this.path.children, !0).find((y) => y.object.userData?.omnicamPathSegments);
      if (!c) return null;
      const { cameraId: d, firstFrame: s, lastFrame: i, frames: x, points: m } = c.object.userData.omnicamPathSegments;
      if (!m?.length || x.length < 2) return null;
      let l = 0, g = 1 / 0;
      for (let y = 0; y < m.length; y += 1) {
        const [P, S, a] = m[y], z = P - c.point.x, M = S - c.point.y, W = a - c.point.z, b = z * z + M * M + W * W;
        b < g && (g = b, l = y);
      }
      const n = s + (i - s) * l / Math.max(1, m.length - 1);
      let G = x[0], T = x[x.length - 1];
      for (let y = 0; y < x.length - 1; y += 1)
        if (x[y] <= n && n <= x[y + 1]) {
          G = x[y], T = x[y + 1];
          break;
        }
      if (G === T) return null;
      const O = Math.min(1, Math.max(0, (n - G) / (T - G)));
      return { cameraId: d, leftFrame: G, rightFrame: T, t: O };
    },
    configureCamera(f, t) {
      const r = f || defaultCamera(), c = Math.max(5e-4, Number(r.near) || 0.01), d = Math.max(c + 1, Number(r.far) || 1e4);
      let s;
      if (r.camera_type === "orthographic") {
        s = this.orthographic;
        const n = 5 / Math.max(0.01, r.zoom || 1);
        s.left = -n * t, s.right = n * t, s.top = n, s.bottom = -n, s.near = c, s.far = d, s.updateProjectionMatrix();
      } else
        s = this.perspective, s.fov = e.MathUtils.clamp(Number(r.fov) || 35, 1, 175), s.aspect = t, s.near = c, s.far = d, s.updateProjectionMatrix();
      const i = new e.Vector3().fromArray(r.position || [6, 4, 6]), x = new e.Vector3().fromArray(r.target || [0, 1.5, 0]), m = x.clone().sub(i);
      m.lengthSq() < 1e-6 ? m.set(0, 0, -1) : m.normalize();
      let l = r.up ? new e.Vector3().fromArray(r.up) : new e.Vector3(0, 1, 0), g = new e.Vector3().crossVectors(m, l);
      if (g.lengthSq() < 1e-6 && (l = Math.abs(m.y) > 0.9 ? new e.Vector3(0, 0, m.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), g.crossVectors(m, l)), g.normalize(), l.crossVectors(g, m).normalize(), r.roll) {
        const n = e.MathUtils.degToRad(r.roll);
        g.applyAxisAngle(m, n), l.applyAxisAngle(m, n);
      }
      return s.position.copy(i), s.up.copy(l), s.lookAt(x), s.updateMatrixWorld(), s;
    },
    pick(f, t, r, c) {
      if (!this.activeCamera) return null;
      this.pointer.set(f / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
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
    projectWorldToScreen(f) {
      if (!this.activeCamera || !Array.isArray(f) || f.length < 3) return null;
      const { w: t, h: r } = A(this), c = new e.Vector3(Number(f[0]) || 0, Number(f[1]) || 0, Number(f[2]) || 0);
      return c.project(this.activeCamera), {
        x: (c.x * 0.5 + 0.5) * t,
        y: (1 - (c.y * 0.5 + 0.5)) * r,
        behind: c.z < -1 || c.z > 1,
        width: t,
        height: r
      };
    },
    pickSubElement(f, t, r, c, d = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(f / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const s = this.raycaster.intersectObjects(this.content.children, !0);
      for (const i of s) {
        let x = i.object, m = i.object;
        for (; x && !x.userData.omnicamId; ) x = x.parent;
        if (!x?.userData.omnicamId || !m.geometry) continue;
        const l = x.userData.omnicamId, n = m.geometry.getAttribute("position");
        if (!n) continue;
        m.updateMatrixWorld(!0);
        const G = m.matrixWorld;
        if (d === "vertex") {
          let T = -1, O = 1 / 0, y = null;
          if (i.face) {
            const P = [i.face.a, i.face.b, i.face.c];
            for (const S of P) {
              const a = new e.Vector3(n.getX(S), n.getY(S), n.getZ(S)).applyMatrix4(G), z = a.distanceTo(i.point);
              z < O && (O = z, T = S, y = [a.x, a.y, a.z]);
            }
          } else
            for (let P = 0; P < n.count; P++) {
              const S = new e.Vector3(n.getX(P), n.getY(P), n.getZ(P)).applyMatrix4(G), a = S.distanceTo(i.point);
              a < O && (O = a, T = P, y = [S.x, S.y, S.z]);
            }
          if (y)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: l,
              index: T,
              point: y
            };
        }
        if (d === "edge" && i.face) {
          const T = new e.Vector3(n.getX(i.face.a), n.getY(i.face.a), n.getZ(i.face.a)).applyMatrix4(G), O = new e.Vector3(n.getX(i.face.b), n.getY(i.face.b), n.getZ(i.face.b)).applyMatrix4(G), y = new e.Vector3(n.getX(i.face.c), n.getY(i.face.c), n.getZ(i.face.c)).applyMatrix4(G), P = (W, b, C) => {
            const L = new e.Line3(b, C), k = new e.Vector3();
            return L.closestPointToPoint(W, !0, k), { dist: W.distanceTo(k), point: k, segment: [b, C] };
          }, S = P(i.point, T, O), a = P(i.point, O, y), z = P(i.point, y, T), M = [S, a, z].reduce((W, b) => b.dist < W.dist ? b : W);
          return {
            type: "edge",
            mode: "edge",
            objectId: l,
            point: [M.point.x, M.point.y, M.point.z],
            edge: [
              [M.segment[0].x, M.segment[0].y, M.segment[0].z],
              [M.segment[1].x, M.segment[1].y, M.segment[1].z]
            ]
          };
        }
        if (d === "face" && i.face) {
          const T = new e.Vector3(n.getX(i.face.a), n.getY(i.face.a), n.getZ(i.face.a)).applyMatrix4(G), O = new e.Vector3(n.getX(i.face.b), n.getY(i.face.b), n.getZ(i.face.b)).applyMatrix4(G), y = new e.Vector3(n.getX(i.face.c), n.getY(i.face.c), n.getZ(i.face.c)).applyMatrix4(G), P = new e.Vector3().add(T).add(O).add(y).divideScalar(3), S = i.face.normal.clone().transformDirection(G);
          return {
            type: "face",
            mode: "face",
            objectId: l,
            faceIndex: i.faceIndex,
            point: [P.x, P.y, P.z],
            normal: [S.x, S.y, S.z],
            vertices: [
              [T.x, T.y, T.z],
              [O.x, O.y, O.z],
              [y.x, y.y, y.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(f, t, r, c) {
      if (!this.activeCamera) return null;
      this.pointer.set(f / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const d = this.raycaster.intersectObjects(this.content.children, !0);
      if (d.length > 0)
        return [d[0].point.x, d[0].point.y, d[0].point.z];
      const s = new e.Plane(new e.Vector3(0, 1, 0), 0), i = new e.Vector3();
      return this.raycaster.ray.intersectPlane(s, i) ? [i.x, i.y, i.z] : null;
    }
  };
}
const Me = ["high", "balanced", "low"], Ht = 25, ke = 30, Qt = 0.6;
function Te(o = "balanced") {
  return { quality: o, samples: [], downgraded: !1 };
}
function Zt(o) {
  const e = Me.indexOf(o);
  return e < 0 || e >= Me.length - 1 ? null : Me[e + 1];
}
function Jt(o, e) {
  if (!Number.isFinite(e) || e < 0 || (o.samples.push(e), o.samples.length > ke && o.samples.shift(), o.samples.length < ke) || o.samples.filter((D) => D > Ht).length / o.samples.length < Qt) return null;
  const p = Zt(o.quality);
  return p ? (o.quality = p, o.downgraded = !0, o.samples = [], p) : null;
}
function Et(o, e) {
  return o.quality = e, o.samples = [], o.downgraded = !1, o;
}
function er(o) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: D, PLYLoader: h, STLLoader: B, neutral: v, wire: q, checkerMaterial: j, objectMaterial: I, applyModelMaterial: N, disposeObject: R, textureFor: re, cardMesh: J, generatePointField: te, sampleCamera: E, sampleObjectTransform: se, hasOutlineMesh: A, SelectionOutlineRenderer: f } = o;
  return {
    render(t, r, c, d, s, i = /* @__PURE__ */ new Map(), x = 0, m = !1, l = "camera", g = "subject", n = null, G = null, T = null, O = "auto") {
      const y = m && O === "clay" ? !0 : m && (O === "motion_proxy" || O === "depth_rich") ? !1 : !m || (t.render_mode || "") === "beauty";
      if (y !== this.studioEnabled) {
        this.studioEnabled = y, Re(e, this.scene, this.renderer, this.studio, y);
        for (const w of this.flatLights || []) w.visible = !y;
      }
      const P = !!t.objects?.some((w) => w.type === "sun_light" && w.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !P && y), this.flatLights?.[1] && (this.flatLights[1].visible = !P && !y), this.disposed) return;
      (this.canvas.width !== d || this.canvas.height !== s) && this.renderer.setSize(d, s, !1);
      const S = (r && r.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const a = t.viewport_bg_sequence && t.viewport_bg_sequence.length ? t.viewport_bg_sequence[x % t.viewport_bg_sequence.length] : t.viewport_bg_image || "";
      if (a) {
        this.bgImageUrl = a;
        const w = this.bgTextureCache.get(a);
        if (w)
          this.bgTextureCache.delete(a), this.bgTextureCache.set(a, w), this.bgTexture = w, this.scene.background = w;
        else if (!this.bgTextureLoads.has(a)) {
          const _ = this.bgLoadGeneration;
          this.bgTextureLoads.set(a, _), new e.TextureLoader().load(a, (X) => {
            if (this.bgTextureLoads.delete(a), this.disposed || _ !== this.bgLoadGeneration) {
              X.dispose();
              return;
            }
            for (X.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(a, X); this.bgTextureCache.size > 8; ) {
              const H = [...this.bgTextureCache.keys()].find((ue) => ue !== this.bgImageUrl);
              if (!H) break;
              const Y = this.bgTextureCache.get(H);
              this.bgTextureCache.delete(H), Y?.dispose?.();
            }
            this.bgImageUrl === a && (this.bgTexture = X, this.scene.background = X), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(a);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const _ of new Set(this.bgTextureCache.values())) _.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const w = t.viewport_bg_color && t.viewport_bg_color !== Ve;
        this.scene.background = this.studioEnabled && !w && !S ? this.studio.sky : new e.Color(w ? t.viewport_bg_color : this.studioEnabled && S ? 1447709 : Ve);
      }
      const z = JSON.stringify([
        t.render_mode,
        t.card_fit,
        t.point_density,
        t.point_spread,
        !!t.show_wireframe,
        !!t.show_vertices,
        !!t.backface_culling,
        t.reconstruction_appearance || "neutral",
        !!m,
        O,
        t.objects.map((w) => {
          const { position: _, rotation: V, keyframes: X, size: H, ...Y } = w;
          return w.type === "card" && (Y.size = H), Y;
        })
      ]), M = [...c.entries()].map(([w, _]) => `${w}:${_?.src || ""}`).join("|"), W = [...i.entries()].map(([w, _]) => `${w}:${_}`).join("|");
      (z !== this.sceneKey || M !== this.mediaSignature || W !== this.modelSignature) && (this.sceneKey = z, this.mediaSignature = M, this.modelSignature = W, this.rebuild(t, c, i, m, O));
      const b = Math.max(1, t.fps || 24), C = /* @__PURE__ */ new Map();
      for (const w of t.objects)
        w.character?.motion && this.models.has(w.id) && C.set(w.id, w.character.motion);
      for (const [w, _] of this.models) {
        if (!_.mixer || !(_.duration > 0)) continue;
        const V = C.get(w);
        V ? (this.applyMotionClip?.(w, V), _.mixer.setTime(yt(V, x, b, _.duration))) : _.mixer.setTime(x / b % _.duration);
      }
      for (const w of t.objects) {
        const _ = this.objectNodes.get(w.id);
        if (!_) continue;
        const V = w.keyframes?.length ? se(w, x) : w;
        _.position.fromArray(V.position || [0, 0, 0]), _.rotation.set(...(V.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), w.type !== "card" && w.type !== "null" && _.scale.fromArray(V.size || [1, 1, 1]), w.type === "null" && (_.visible = m ? !0 : t.show_helper_axes !== !1);
      }
      this.path.visible = !m;
      const L = t.show_grid !== !1 && t.render_mode !== "point_field", k = O === "depth_rich" || !!t.playblast_grid;
      this.content.traverse((w) => {
        w.userData.omnicamCaptureGuide && (w.visible = m ? k : L);
      });
      const F = t.view_mode || "camera", $ = Array.isArray(T) ? [...T].sort((w, _) => w - _).join(",") : "", K = `${F}:${l}:${G ?? ""}:${$}:${t.__omnicamRevision ?? JSON.stringify([
        t.active_camera_id,
        (t.cameras || []).map((w) => [w.id, w.keyframes?.length, w.keyframes?.map((_) => [_.frame, _.camera?.position, _.camera?.target, _.interpolation, _.tangents])]),
        (t.objects || []).map((w) => [w.id, w.keyframes?.length, w.keyframes?.map((_) => [_.frame, _.transform?.position])])
      ])}`;
      if (K !== this.pathKey && (this.pathKey = K, this.rebuildPath(t, l, G, F, T)), this.updateLiveCameras(t, x, m, F, l, G), this.liveCameras.visible = !m, !m) {
        const w = t.show_camera_paths !== !1, _ = t.show_camera_gizmos !== !1, V = t.show_look_at !== !1;
        for (const X of [this.path, this.liveCameras])
          X.traverse((H) => {
            const Y = H.userData.omnicamWidget;
            Y === "path" ? H.visible = w : Y === "gizmo" ? H.visible = _ : Y === "lookat" && (H.visible = V);
          });
      }
      const ee = d / Math.max(1, s), Q = this.configureCamera(r, ee);
      if (this.activeCamera = Q, m ? this.selectionGroup.visible = !1 : (this.updateSelection(t, l, g, n, `${t.__omnicamRevision ?? "legacy"}:${x}`, S), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const w = new e.Box3();
        this.content.traverse((V) => {
          if (!V.isMesh || V.userData.omnicamCaptureGuide) return;
          V.castShadow = !0, V.receiveShadow = !0, V.updateWorldMatrix(!0, !1);
          const X = new e.Box3().setFromObject(V);
          !X.isEmpty() && Number.isFinite(X.min.x) && w.union(X);
        });
        const _ = this.studio?.key;
        if (_) {
          const V = w.isEmpty() ? new e.Vector3() : w.getCenter(new e.Vector3()), X = w.isEmpty() ? new e.Vector3(12, 12, 12) : w.getSize(new e.Vector3()), H = Math.max(1, 0.5 * Math.max(X.x, X.y, X.z) * Math.SQRT2), Y = H * 1.15 + 0.5, ue = new e.Vector3(4.5, 7.5, 3.5).normalize(), le = Math.max(12, H * 4);
          _.position.copy(V).addScaledVector(ue, le), _.target.position.copy(V), _.target.updateMatrixWorld(!0);
          const oe = _.shadow.camera;
          oe.left = -Y, oe.right = Y, oe.top = Y, oe.bottom = -Y, oe.near = Math.max(0.1, le - H - 1), oe.far = le + H + 1, oe.updateProjectionMatrix(), _.shadow.map?.dispose(), _.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((w) => {
        w.userData.omnicamBillboard && w.quaternion.copy(Q.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, d, s);
      const U = performance.now();
      let Z = !1;
      if (!m && !S && l === "object" && (g || t.__selectedObjectIds?.length) && !n) {
        const w = t.__selectedObjectIds?.length ? t.__selectedObjectIds : g ? [g] : [], _ = [];
        for (const V of w) {
          const X = this.objectNodes.get(V);
          X && A(X) && _.push(X);
        }
        _.length && (this.outlineRenderer || (this.outlineRenderer = new f(this.renderer, this.scene, void 0, Q)), this.outlineRenderer.render(Q, d, s, _), Z = !0);
      }
      if (Z || this.renderer.render(this.scene, Q), !m && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Te(this.studio?.quality);
        const w = Jt(this.qualityMonitor, performance.now() - U);
        w && (Ae(this.studio, this.renderer, w), this.onQualityDowngrade?.(w));
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
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), R(this.content), R(this.path), R(this.liveCameras), R(this.selectionGroup);
        for (const t of new Set(this.bgTextureCache.values())) t.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const t of this.models.values()) R(t.scene, !0);
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
function rr(o) {
  let e = !1;
  return o?.traverse?.((u) => {
    e || u.visible === !1 || !u.isMesh || u.userData?.omnicamHelper || u.userData?.omnicamCaptureGuide || (e = !!(u.geometry && u.material));
  }), e;
}
class or {
  constructor(e, u, p = tr, D = null) {
    const { EffectComposer: h, RenderPass: B, OutlinePass: v, OutputPass: q, Vector2: j } = p;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new h(e), this.renderPass = new B(u, D), this.outlinePass = new v(new j(1, 1), u, D, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new q(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, u, p, D) {
    this.disposed || ((u !== this.width || p !== this.height) && (this.width = u, this.height = p, this.composer.setSize(u, p)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...D], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const Fe = { low: Tt, balanced: kt, high: Ot }, me = new Be({ color: 10265519, roughness: 0.48, metalness: 0.06, side: ae }), $e = new Be({ color: 2237998, roughness: 0.95, metalness: 0, side: ae }), _e = new be({ color: 11449792, wireframe: !0, side: ae });
function Se(o = !1) {
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
  ]), u = new ut(e, 2, 2, mt);
  return u.wrapS = u.wrapT = ht, u.repeat.set(8, 8), u.colorSpace = Ce, u.needsUpdate = !0, new Be({ map: u, roughness: 0.85, metalness: 0, side: o ? Le : ae });
}
function ar(o, e, u = !1) {
  const p = e === "wireframe" ? "wireframe" : o.material_mode || "textured", D = u ? Le : ae;
  if (p === "wireframe") {
    const B = _e.clone();
    return B.side = D, o.color && (B.color = new ce(o.color)), B;
  }
  if (p === "checker") return Se(u);
  if (p === "matte") {
    const B = $e.clone();
    return B.side = D, o.color && (B.color = new ce(o.color)), B;
  }
  const h = me.clone();
  return h.side = D, o.color && (h.color = new ce(o.color)), h;
}
function sr(o, e, u = null, p = !1) {
  const D = p ? Le : ae;
  o.traverse((h) => {
    if (h.isMesh) {
      if (h.userData.omnicamOriginalMaterial || (h.userData.omnicamOriginalMaterial = h.material), h.userData.omnicamOverrideMaterial) {
        const B = Array.isArray(h.material) ? h.material : [h.material];
        for (const v of B)
          v?.map?.dispose?.(), v?.dispose?.();
        h.userData.omnicamOverrideMaterial = !1;
      }
      if (e === "textured" || e === "wireframe_texture") {
        h.material = h.userData.omnicamOriginalMaterial;
        const B = Array.isArray(h.material) ? h.material : [h.material];
        for (const v of B)
          v && (v.side = D);
      } else if (e === "checker")
        h.material = Se(p), h.userData.omnicamOverrideMaterial = !0;
      else if (e === "wireframe") {
        const B = _e.clone();
        B.side = D, u?.color && (B.color = new ce(u.color)), h.material = B, h.userData.omnicamOverrideMaterial = !0;
      } else if (e === "matte") {
        const B = $e.clone();
        B.side = D, u?.color && (B.color = new ce(u.color)), h.material = B, h.userData.omnicamOverrideMaterial = !0;
      } else {
        const B = me.clone();
        B.side = D, u?.color && (B.color = new ce(u.color)), h.material = B, h.userData.omnicamOverrideMaterial = !0;
      }
    }
  });
}
function ve(o, e = !1) {
  o.traverse((u) => {
    if (u.userData.omnicamModelResource && !e) return;
    u.geometry?.dispose?.();
    const p = Array.isArray(u.material) ? u.material : [u.material];
    for (const D of p)
      D?.map?.dispose?.(), D?.dispose?.();
  });
}
function Ke(o) {
  if (!o) return null;
  const e = o instanceof HTMLVideoElement ? new ft(o) : new pt(o);
  return e.colorSpace = Ce, e.needsUpdate = !0, e;
}
function nr(o, e, u) {
  const [p, D] = o.size || [2, 3], h = new ie(), B = new pe(new Pe(p, D), new be({ color: 1448482, side: ae, transparent: !0, opacity: 0.85 }));
  B.frustumCulled = !1, h.add(B);
  const v = Ke(e);
  if (!v) return h;
  const q = e.videoWidth || e.naturalWidth || e.width || p, j = e.videoHeight || e.naturalHeight || e.height || D, I = q / Math.max(1, j), N = p / Math.max(0.01, D);
  let R = p, re = D;
  u === "contain" ? I > N ? re = p / I : R = D * I : u === "cover" && (I > N ? (v.repeat.x = N / I, v.offset.x = (1 - v.repeat.x) * 0.5) : (v.repeat.y = I / N, v.offset.y = (1 - v.repeat.y) * 0.5));
  const J = new pe(
    new Pe(R, re),
    new be({
      color: 16777215,
      map: v,
      side: ae,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return J.frustumCulled = !1, J.position.z = 2e-3, h.add(J), h.frustumCulled = !1, h;
}
class ir {
  constructor(e = () => {
  }, u = () => {
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
    const p = new rt(16777215, 2.4);
    p.position.set(5, 8, 4), this.scene.add(p), this.flatLights = [this.scene.children.at(-2), p], this.studio = Bt(xe, this.renderer, _t), this.scene.add(this.studio.group), this.studioEnabled = !0, Re(xe, this.scene, this.renderer, this.studio, !0), this.content = new ie(), this.scene.add(this.content), this.path = new ie(), this.scene.add(this.path), this.liveCameras = new ie(), this.scene.add(this.liveCameras), this.selectionGroup = new ie(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ot(35, 16 / 9, 0.01, 1e4), this.orthographic = new at(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = u, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new st(), this.pointer = new ze(), this.activeCamera = this.perspective;
  }
  async loadModel(e, u, p = "glb") {
    const D = `${p}:${u}`;
    if (!(!u || this.modelLoads.get(e) === D)) {
      this.modelLoads.set(e, D);
      try {
        let h, B = [];
        if (p === "obj") h = await new We().loadAsync(u);
        else if (p === "fbx")
          h = await new je().loadAsync(u), B = h.animations || [];
        else if (p === "stl") h = new pe(await new Ie().loadAsync(u), me.clone());
        else if (p === "ply") {
          const r = await new Ne().loadAsync(u);
          r.index ? (r.getAttribute("normal") || r.computeVertexNormals(), h = new pe(r, me.clone())) : h = new nt(r, new it({ color: 11449792, size: 0.025 }));
        } else {
          const r = await new Ue().loadAsync(u);
          h = r.scene, B = r.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== D) {
          ve(h, !0);
          return;
        }
        const v = this.models.get(e);
        v && ve(v.scene, !0), h.traverse((r) => {
          if (r.userData.omnicamModelResource = !0, r.frustumCulled = !1, r.isMesh && (r.frustumCulled = !1, r.material)) {
            const c = Array.isArray(r.material) ? r.material : [r.material];
            for (const d of c)
              d.side = ae;
          }
          r.isPoints && (r.frustumCulled = !1), r.isSkinnedMesh && (r.frustumCulled = !1, r.computeBoundingBox?.(), r.computeBoundingSphere?.());
        });
        let q = 0, j = 0, I = 0, N = 0;
        h.traverse((r) => {
          r.isMesh && (q += 1, N += r.geometry?.getAttribute?.("position")?.count || 0), r.isPoints && (j += 1), r.isBone && (I += 1);
        });
        const R = new ie();
        if (R.frustumCulled = !1, R.add(h), !q && !j && I) {
          const r = new ct(h);
          r.material.depthTest = !1, r.material.opacity = 0.9, r.material.transparent = !0, r.renderOrder = 10, r.userData.omnicamModelResource = !0, R.add(r);
        }
        R.updateMatrixWorld(!0);
        const re = new lt().setFromObject(R), J = re.getSize(new De()), te = Math.max(J.x, J.y, J.z), E = Number.isFinite(te) && te > 1e-6 ? 2.5 / te : 1, se = re.getCenter(new De());
        R.scale.setScalar(E), R.position.set(-se.x * E, -re.min.y * E, -se.z * E);
        const A = new ie();
        A.frustumCulled = !1, A.add(R);
        const f = B.length ? new dt(h) : null;
        f && f.clipAction(B[0]).play();
        const t = { url: u, format: p, scene: A, mixer: f, clips: B, selectedClip: 0, duration: B[0]?.duration || 0, meshes: q, points: j, bones: I, vertices: N, animations: B.length, normalizationScale: E };
        this.models.set(e, t), this.onModelLoaded({ id: e, format: p, meshes: q, points: j, bones: I, vertices: N, animations: B.length, animationNames: B.map((r, c) => r.name || `Clip ${c + 1}`), duration: t.duration, normalizationScale: E }), this.sceneKey = "", this.invalidate();
      } catch (h) {
        this.modelLoads.get(e) === D && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${p.toUpperCase()} ${e}`, h);
        const B = h?.message?.includes("FBX version not supported") || h?.message?.includes("6100") || h?.message?.includes("6000"), v = B ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : h?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: p, error: v, isLegacyFBX: B });
      }
    }
  }
}
const he = { THREE: xe, FBXLoader: je, GLTFLoader: Ue, OBJLoader: We, PLYLoader: Ne, STLLoader: Ie, neutral: me, wire: _e, checkerMaterial: Se, objectMaterial: ar, applyModelMaterial: sr, disposeObject: ve, textureFor: Ke, cardMesh: nr, generatePointField: Mt, sampleCamera: xt, sampleObjectTransform: bt, hasOutlineMesh: rr, SelectionOutlineRenderer: or };
Object.assign(
  ir.prototype,
  $t(he),
  Kt(he),
  Yt(he),
  er(he)
);
async function cr(o, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const u of ["vp9", "vp8"])
    try {
      if (await fe(Ft(u, { width: o, height: e }), 5e3, `Checking ${u} support`)) return u;
    } catch {
    }
  return null;
}
function fe(o, e, u) {
  let p;
  return Promise.race([
    o,
    new Promise((D, h) => {
      p = setTimeout(() => h(new Error(`${u} timed out`)), e);
    })
  ]).finally(() => clearTimeout(p));
}
async function wr(o, e, u, p, D, h = "balanced") {
  const B = await cr(o.width, o.height);
  if (!B) throw new Error("No supported WebCodecs WebM encoder");
  const v = new Dt({ format: new At(), target: new Pt() }), q = new Vt(o, { codec: B, quality: Fe[h] || Fe.balanced, keyFrameInterval: 1 });
  v.addVideoTrack(q, { frameRate: u }), await fe(v.start(), 1e4, "Starting deterministic encoder");
  try {
    const j = 1 / u;
    for (let I = 0; I < e; I++) {
      if (D?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await p(I), await fe(q.add(I * j, j, { keyFrame: I % u === 0 }), 1e4, `Encoding frame ${I + 1}`);
    }
    await fe(v.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (j) {
    throw v.state !== "finalized" && await v.cancel().catch(() => {
    }), j;
  }
  return Lt(new Blob([v.target.buffer], { type: await v.getMimeType() }), {
    encoder: "webcodecs",
    requestedFrames: e,
    expectedDurationMs: e / u * 1e3,
    recordedDurationMs: e / u * 1e3,
    driftMs: 0,
    fps: u,
    width: o.width,
    height: o.height
  });
}
export {
  ir as OmniWebGLViewport,
  wr as encodeDeterministicPlayblast,
  cr as supportsDeterministicEncoding
};
