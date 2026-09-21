import { T as pe } from "./chunk-IMiHbUfz.js";
import { ab as ze, ae as Ye, af as He, ag as Qe, ah as Ze, W as Je, s as Ce, Z as Ee, i as et, u as ce, H as tt, l as rt, G as ie, k as ot, Y as at, a2 as st, ai as We, aj as je, M as we, ak as Ie, n as Be, al as Ne, P as nt, c as it, e as Ue, D as ae, a5 as ct, d as lt, V as Pe, v as dt, f as be, J as _e, m as De, z as ut, a1 as mt, a3 as ht, ac as ft, a8 as pt } from "./vendor-three-B8JDtKPi.js";
import { T as Me, bR as wt, bS as gt, bT as yt, bh as Mt, a as xt, J as bt } from "./chunk-CYDi7sxd.js";
import { r as vt, q as Ct, a as Ae, s as Re, D as Ve, c as Bt, b as _t, d as Lt, e as St, g as Gt } from "./chunk-B1f8prY3.js";
import { c as Pt } from "./chunk-a2yd8Eqb.js";
import { o as Dt } from "./chunk-6djzlmmR.js";
import { Output as At, BufferTarget as Vt, WebMOutputFormat as Ot, CanvasSource as Tt, QUALITY_HIGH as kt, QUALITY_MEDIUM as Ft, QUALITY_LOW as zt, canEncodeVideo as Wt } from "./vendor-mediabunny-CZ5VNE-V.js";
function jt(r, { position: e, forward: u, up: p, color: P, scale: h = 1, active: B = !0 }) {
  const x = new r.Group(), q = B ? 0.95 : 0.5, j = new r.MeshBasicMaterial({
    color: P,
    transparent: !0,
    opacity: q,
    depthTest: !1
  }), X = new r.Mesh(new r.BoxGeometry(0.34, 0.24, 0.42), j);
  X.renderOrder = 912, x.add(X);
  const I = new r.Mesh(new r.ConeGeometry(0.17, 0.26, 20), j);
  return I.rotation.x = -Math.PI / 2, I.position.z = -0.32, I.renderOrder = 912, x.add(I), x.scale.setScalar(h), x.position.copy(e), x.up.copy(p), x.lookAt(e.clone().add(u)), x;
}
function It(r, { position: e, color: u = 15903035, radius: p = 0.28, bold: P = !1 }) {
  const h = new r.Group(), B = P ? 16773544 : u, x = new r.LineBasicMaterial({ color: B, transparent: !0, opacity: P ? 1 : 0.95, depthTest: !1 }), q = (I) => {
    const N = [];
    for (let Z = 0; Z <= 48; Z++) {
      const E = Z / 48 * Math.PI * 2;
      N.push(new r.Vector3(Math.cos(E) * I, Math.sin(E) * I, 0));
    }
    const ee = new r.Line(new r.BufferGeometry().setFromPoints(N), x);
    return ee.renderOrder = 915, ee;
  };
  if (h.add(q(p)), P) {
    h.add(q(p * 1.18));
    const I = new r.Mesh(
      new r.RingGeometry(0, p * 0.3, 16),
      new r.MeshBasicMaterial({ color: B, transparent: !0, opacity: 1, depthTest: !1 })
    );
    I.renderOrder = 916, h.add(I);
  }
  const j = p * 1.55, X = new r.LineSegments(
    new r.BufferGeometry().setFromPoints([
      new r.Vector3(-j, 0, 0),
      new r.Vector3(-p * 0.45, 0, 0),
      new r.Vector3(p * 0.45, 0, 0),
      new r.Vector3(j, 0, 0),
      new r.Vector3(0, -j, 0),
      new r.Vector3(0, -p * 0.45, 0),
      new r.Vector3(0, p * 0.45, 0),
      new r.Vector3(0, j, 0)
    ]),
    x
  );
  return X.renderOrder = 915, h.add(X), h.position.copy(e), h.userData.omnicamBillboard = !0, h;
}
const qe = 3718648, Nt = 12e3;
function ge(r) {
  return !!(r.isSkinnedMesh && r.skeleton);
}
function Xe(r, e) {
  r.position.copy(e.position), r.quaternion.copy(e.quaternion), r.scale.copy(e.scale);
}
function ye(r) {
  return r.frustumCulled = !1, r.raycast = () => {
  }, r.userData.omnicamHelper = !0, r;
}
function Ut(r, e, { color: u = null, opacity: p = null } = {}) {
  const P = u ?? qe, h = p ?? 0.65;
  if (ge(e)) {
    const x = new r.SkinnedMesh(e.geometry.clone(), new r.MeshBasicMaterial({
      color: P,
      wireframe: !0,
      transparent: !0,
      opacity: h,
      depthWrite: !1
    }));
    return x.bindMode = e.bindMode, x.bind(e.skeleton, e.bindMatrix), Xe(x, e), { overlay: ye(x), parent: e.parent || e };
  }
  const B = new r.LineSegments(
    new r.WireframeGeometry(e.geometry),
    new r.LineBasicMaterial({ color: P, opacity: h, transparent: !0, depthTest: !0 })
  );
  return { overlay: ye(B), parent: e };
}
function Rt(r, e) {
  const u = new r.PointsMaterial({ color: qe, size: 0.05, sizeAttenuation: !0 });
  if (!ge(e)) {
    const I = new r.Points(e.geometry, u);
    return { overlay: ye(I), parent: e };
  }
  const p = e.geometry.getAttribute("position")?.count || 0, P = Math.max(1, Math.ceil(p / Nt)), h = Math.ceil(p / P), B = new Float32Array(h * 3), x = new r.BufferGeometry();
  x.setAttribute("position", new r.Float32BufferAttribute(B, 3));
  const q = new r.Points(x, u);
  Xe(q, e);
  const j = new r.Vector3(), X = x.getAttribute("position");
  return q.onBeforeRender = () => {
    for (let I = 0; I < h; I++)
      e.getVertexPosition(I * P, j), X.setXYZ(I, j.x, j.y, j.z);
    X.needsUpdate = !0;
  }, { overlay: ye(q), parent: e.parent || e };
}
function qt(r, e, u) {
  const p = ge(e) ? new r.SkinnedMesh(e.geometry.clone(), u) : new r.Mesh(e.geometry.clone(), u);
  return ge(e) && (p.bindMode = e.bindMode, p.bind(e.skeleton, e.bindMatrix)), p.matrixAutoUpdate = !1, p.matrix.copy(e.matrixWorld), p.frustumCulled = !1, p;
}
function Xt(r, e, { wireframe: u = !1, vertices: p = !1, wireframeColor: P = null, wireframeOpacity: h = null } = {}) {
  if (!u && !p) return;
  const B = [];
  e.traverse((x) => {
    x.isMesh && x.geometry && !x.userData.omnicamHelper && B.push(x);
  });
  for (const x of B) {
    if (u) {
      const { overlay: q, parent: j } = Ut(r, x, { color: P, opacity: h });
      j.add(q);
    }
    if (p) {
      const { overlay: q, parent: j } = Rt(r, x);
      j.add(q);
    }
  }
}
const $t = 16777215, ne = 0.17, Oe = 3593923, Kt = 0.06;
function Yt(r) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: P, PLYLoader: h, STLLoader: B, neutral: x, wire: q, checkerMaterial: j, objectMaterial: X, applyModelMaterial: I, disposeObject: N, textureFor: re, cardMesh: ee, generatePointField: Z, sampleCamera: E, sampleObjectTransform: se } = r;
  return {
    removeModel(D) {
      const f = this.models.get(D);
      f && N(f.scene, !0), this.models.delete(D), this.modelLoads.delete(D), this.sceneKey = "";
    },
    selectAnimation(D, f) {
      const t = this.models.get(D);
      !t?.mixer || !t.clips.length || (t.selectedClip = Math.max(0, Math.min(t.clips.length - 1, Number(f) || 0)), t.duration = t.clips[t.selectedClip].duration || 0, t.motionClipId = null, t.mixer.stopAllAction(), t.mixer.clipAction(t.clips[t.selectedClip]).play(), this.invalidate());
    },
    /** Select the clip a character motion names (by clip name, else index, else
     * the first clip). Idempotent -- re-selecting the same clip is a no-op so the
     * per-frame render loop can call it freely (design spec section 27). */
    applyMotionClip(D, f) {
      const t = this.models.get(D);
      if (!t?.mixer || !t.clips.length) return;
      const o = String(f?.clip_id ?? "");
      if (t.motionClipId === o) return;
      let c = t.clips.findIndex((s) => (s.name || "").toLowerCase() === o.toLowerCase());
      c < 0 && /^\d+$/.test(o) && (c = Number(o)), (c < 0 || c >= t.clips.length) && (c = 0), t.selectedClip = c, t.motionClipId = o, t.duration = t.clips[c].duration || 0, t.mixer.stopAllAction();
      const l = t.mixer.clipAction(t.clips[c]);
      l.reset(), l.play(), this.invalidate();
    },
    rebuild(D, f, t, o = !1, c = "auto") {
      this.content.traverse((a) => {
        for (const z of [...a.children])
          z.userData.omnicamHelper && (a.remove(z), N(z, !0));
      }), N(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const l = D.render_mode, s = o && ["clay", "motion_proxy", "depth_rich"].includes(c), i = (a, z) => {
        const M = x.clone();
        return M.side = z ? e.FrontSide : e.DoubleSide, a.color && (M.color = new e.Color(a.color)), M;
      }, b = (a) => s || l === "graybox" ? i(a, !!D.backface_culling) : X(a, l, !!D.backface_culling), m = new e.Group();
      m.userData.omnicamCaptureGuide = !0;
      const d = new e.GridHelper(120, 24, 4081496, 3291463);
      d.userData.omnicamCaptureGuide = !0, d.frustumCulled = !1, d.position.y = 5e-4, m.add(d);
      const g = new e.GridHelper(120, 120, 2238001, 1909035);
      g.userData.omnicamCaptureGuide = !0, g.frustumCulled = !1, m.add(g);
      const n = new e.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), G = new e.BufferGeometry().setFromPoints([new e.Vector3(-60, 1e-3, 0), new e.Vector3(60, 1e-3, 0)]), k = new e.Line(G, n);
      k.userData.omnicamCaptureGuide = !0, m.add(k);
      const O = new e.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), y = new e.BufferGeometry().setFromPoints([new e.Vector3(0, 1e-3, -60), new e.Vector3(0, 1e-3, 60)]), A = new e.Line(y, O);
      A.userData.omnicamCaptureGuide = !0, m.add(A), this.content.add(m);
      const S = o && c === "depth_rich";
      if (["omni_ref", "point_field"].includes(l) || S) {
        const a = D.objects.filter((v) => v.enabled !== !1 && !["sun_light", "point_light", "spot_light", "null"].includes(v.type)).length, z = S && a <= 1 && (!D.point_density || D.point_density === "none") ? "sparse" : l === "omni_ref" && (!D.point_density || D.point_density === "none") ? "balanced" : D.point_density || "balanced", { points: M, colors: W } = Z(z, D.point_spread || "all_views", D.point_color || null);
        if (M.length > 0) {
          const v = new e.BufferGeometry();
          v.setAttribute("position", new e.Float32BufferAttribute(M, 3)), v.setAttribute("color", new e.Float32BufferAttribute(W, 3));
          const C = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), _ = new e.Points(v, C);
          _.frustumCulled = !1, this.content.add(_);
        }
      }
      if (!["grid", "point_field"].includes(l))
        for (const a of D.objects) {
          if (a.enabled === !1) continue;
          const z = a.size || [1, 1, 1];
          let M;
          if (a.type === "glb" || a.type === "model") {
            const v = t.get(a.id), C = this.models.get(a.id), _ = a.format || (a.type === "glb" ? "glb" : "");
            v && (C?.url !== v || C?.format !== _) && this.loadModel(a.id, v, _);
            const T = !!D.backface_culling, F = o && c === "clay" || l === "graybox" ? "neutral" : l === "wireframe" ? "wireframe" : vt(a, D, o) ?? (a.material_mode || "textured");
            C?.url === v && (M = C.scene, I(M, F, a, T));
          } else if (a.type === "sphere")
            M = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), b(a));
          else if (a.type === "cylinder")
            M = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), b(a));
          else if (a.type === "torus") {
            const v = new e.TorusGeometry(0.5, 0.2, 16, 32);
            v.rotateX(Math.PI / 2), M = new e.Mesh(v, b(a));
          } else if (a.type === "pyramid") {
            const v = new e.ConeGeometry(0.7, 1, 4);
            v.rotateY(Math.PI / 4), M = new e.Mesh(v, b(a));
          } else if (a.type === "sun_light") {
            const v = new e.Group(), C = new e.DirectionalLight(a.color || 16774892, a.intensity ?? 2.2);
            C.castShadow = a.cast_shadow !== !1, C.castShadow && (C.shadow.mapSize.set(1024, 1024), C.shadow.bias = -8e-4, C.shadow.normalBias = 0.02, C.shadow.radius = 2.4, C.shadow.camera.near = 0.5, C.shadow.camera.far = 70, C.shadow.camera.left = C.shadow.camera.bottom = -14, C.shadow.camera.right = C.shadow.camera.top = 14);
            const _ = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), T = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(_[0], _[1], _[2], "YXZ"));
            C.target.position.copy(C.position).add(T.multiplyScalar(10)), v.add(C, C.target);
            const F = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16096779, wireframe: !0 })
            );
            F.userData.omnicamLightHelper = !0, F.visible = !o, v.add(F), M = v;
          } else if (a.type === "point_light") {
            const v = new e.Group(), C = new e.PointLight(a.color || 16777215, a.intensity ?? 2, 0, 2);
            v.add(C);
            const _ = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16498468, wireframe: !0 })
            );
            _.userData.omnicamLightHelper = !0, _.visible = !o, v.add(_), M = v;
          } else if (a.type === "spot_light") {
            const v = new e.Group(), C = (a.cone_angle ?? 45) * Math.PI / 180, _ = a.penumbra ?? 0.25, T = new e.SpotLight(a.color || 16777215, a.intensity ?? 3, 0, C, _, 2), F = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), $ = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(F[0], F[1], F[2], "YXZ"));
            T.target.position.copy(T.position).add($.multiplyScalar(10)), v.add(T, T.target);
            const K = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: a.color || 3718648, wireframe: !0 })
            );
            K.userData.omnicamLightHelper = !0, K.visible = !o, v.add(K), M = v;
          } else if (a.type === "human")
            M = new e.Mesh(Pt(e), b(a));
          else if (a.type === "ground") M = new e.Mesh(new e.BoxGeometry(1, 1, 1), b(a));
          else if (a.type === "card")
            if (!["graybox", "wireframe"].includes(l) && (!a.material_mode || ["textured", "wireframe_texture"].includes(a.material_mode)))
              M = ee(a, f.get(a.id), D.card_fit || "contain");
            else {
              const C = l === "wireframe" ? new e.PlaneGeometry(z[0], z[1], 4, 4) : new e.PlaneGeometry(z[0], z[1]);
              M = new e.Mesh(C, b(a));
            }
          else if (a.type === "null") {
            const v = new e.AxesHelper(0.5);
            v.position.fromArray(a.position || [0, 0, 0]), v.userData.omnicamId = a.id, v.frustumCulled = !1, this.objectNodes.set(a.id, v), this.content.add(v);
            continue;
          } else
            M = new e.Mesh(new e.BoxGeometry(1, 1, 1), b(a));
          if (!M) continue;
          M.position.fromArray(a.position || [0, 0, 0]), M.rotation.set(...(a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const W = ["sun_light", "point_light", "spot_light"].includes(a.type);
          if (a.type !== "card" && !W && M.scale.fromArray(z), M.userData.omnicamId = a.id, M.frustumCulled = !1, M.traverse((v) => {
            v.frustumCulled = !1, v.userData.omnicamId = a.id;
          }), !W) {
            const v = !!(D.show_wireframe || l === "wireframe" || D.render_mode === "wireframe_texture" || a.material_mode === "wireframe_texture" || a.material_mode === "wireframe_neutral");
            Xt(e, M, { wireframe: v, vertices: D.show_vertices });
          }
          this.objectNodes.set(a.id, M), this.content.add(M);
        }
    },
    rebuildPath(D, f = "camera", t = null, o = "", c = null) {
      const l = Array.isArray(c) ? new Set(c) : null;
      N(this.path), this.path.clear();
      const s = o === "camera" ? D.active_camera_id : null, i = [
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
      (D.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: D.keyframes || [] }]).forEach((d, g) => {
        const n = d.keyframes || [];
        if (n.length === 0 || d.id === s) return;
        const G = d.color ? { line: new e.Color(d.color), marker: new e.Color(d.color), frustum: new e.Color(d.color) } : i[g % i.length], k = d.id === D.active_camera_id, O = k && f === "camera";
        if (n.length >= 2) {
          const y = n[0].frame, A = n[n.length - 1].frame, S = Math.max(32, Math.min(256, A - y + 1)), a = { ...d, keyframes: n, objects: D.objects }, z = Array.from({ length: S }, (_, T) => {
            const F = y + (A - y) * T / Math.max(1, S - 1);
            return new e.Vector3().fromArray(E(a, F, D.objects).position);
          }), M = new e.CatmullRomCurve3(z, !1, "centripetal"), W = O ? 0.06 : k ? 0.045 : 0.025, v = new e.MeshBasicMaterial({
            color: G.line,
            transparent: !0,
            opacity: k ? 1 : 0.55,
            depthTest: !1
          }), C = new e.Mesh(new e.TubeGeometry(M, Math.max(48, S), W, 8, !1), v);
          if (C.renderOrder = 900, C.userData.omnicamWidget = "path", k && !d.locked && (C.userData.omnicamPathSegments = {
            cameraId: d.id,
            firstFrame: y,
            lastFrame: A,
            frames: n.map((_) => _.frame),
            points: z.map((_) => [_.x, _.y, _.z])
          }), this.path.add(C), k) {
            const _ = new e.Mesh(
              new e.TubeGeometry(M, Math.max(48, S), W * (O ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: G.line, transparent: !0, opacity: O ? 0.3 : 0.18, depthTest: !1 })
            );
            if (_.renderOrder = 899, _.userData.omnicamWidget = "path", this.path.add(_), z.length >= 8) {
              const T = Math.max(6, Math.floor(S / 8));
              for (let F = Math.floor(T / 2); F < S - 1; F += T) {
                const $ = z[F], K = z[F + 1].clone().sub($).normalize(), te = new e.ConeGeometry(W * 1.5, W * 3, 8);
                te.rotateX(Math.PI / 2);
                const Q = new e.Quaternion().setFromUnitVectors(new e.Vector3(0, 0, 1), K), U = new e.Mesh(te, new e.MeshBasicMaterial({ color: G.marker, transparent: !0, opacity: 0.85, depthTest: !1 }));
                U.quaternion.copy(Q), U.position.copy($), U.renderOrder = 901, U.userData.omnicamWidget = "path", this.path.add(U);
              }
            }
          }
        }
        for (const y of n) {
          const A = n.indexOf(y), S = k, a = new e.Mesh(
            new e.SphereGeometry(S ? ne : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: S ? $t : G.marker, depthTest: !1 })
          );
          a.position.fromArray(y.camera.position), a.renderOrder = 910, a.userData.omnicamPathKey = { cameraId: d.id, frame: y.frame }, a.userData.omnicamWidget = "path", this.path.add(a);
          const z = new e.Mesh(
            new e.RingGeometry((S ? ne : 0.085) * 1.3, (S ? ne : 0.085) * 1.7, 24),
            new e.MeshBasicMaterial({ color: S ? 16777215 : G.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          z.position.fromArray(y.camera.position), z.renderOrder = 909, z.userData.omnicamBillboard = !0, z.userData.omnicamWidget = "path", this.path.add(z);
          const M = new e.Vector3().fromArray(y.camera.position), W = new e.Vector3().fromArray(y.camera.target || [0, 0, 0]), v = k && t != null && y.frame === t, C = k && !v && l?.has(y.frame);
          if (v) {
            const _ = new e.Mesh(
              new e.RingGeometry(ne * 2.1, ne * 2.6, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            _.position.fromArray(y.camera.position), _.renderOrder = 911, _.userData.omnicamBillboard = !0, _.userData.omnicamWidget = "path", this.path.add(_);
          } else if (C) {
            const _ = new e.Mesh(
              new e.RingGeometry(ne * 1.9, ne * 2.2, 24),
              new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.85, depthTest: !1 })
            );
            _.position.fromArray(y.camera.position), _.renderOrder = 911, _.userData.omnicamBillboard = !0, _.userData.omnicamWidget = "path", this.path.add(_);
          }
          if (v) {
            const _ = W.clone().sub(M).normalize();
            let T = new e.Vector3().crossVectors(_, new e.Vector3(0, 1, 0));
            T.lengthSq() < 1e-8 ? T.set(1, 0, 0) : T.normalize();
            const F = new e.Vector3().crossVectors(T, _).normalize(), $ = e.MathUtils.clamp(M.distanceTo(W) * 0.08, 0.25, 0.8), K = y.camera.camera_type === "orthographic" ? $ * 0.55 : $ * Math.tan(e.MathUtils.degToRad(y.camera.fov || 35) * 0.5), te = K * (D.width || 16) / Math.max(1, D.height || 9), Q = M.clone().addScaledVector(_, $), U = [
              Q.clone().addScaledVector(T, -te).addScaledVector(F, -K),
              Q.clone().addScaledVector(T, te).addScaledVector(F, -K),
              Q.clone().addScaledVector(T, te).addScaledVector(F, K),
              Q.clone().addScaledVector(T, -te).addScaledVector(F, K)
            ], J = [];
            for (const Y of U) J.push(M, Y);
            for (let Y = 0; Y < 4; Y++) J.push(U[Y], U[(Y + 1) % 4]);
            const w = new e.BufferGeometry().setFromPoints(J), L = new e.LineSegments(w, new e.LineBasicMaterial({
              color: G.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            L.userData.omnicamWidget = "gizmo", this.path.add(L);
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
            const R = new e.Mesh(V, new e.MeshBasicMaterial({
              color: G.marker,
              transparent: !0,
              opacity: 0.12,
              depthTest: !1,
              side: e.DoubleSide
            }));
            R.userData.omnicamWidget = "gizmo", this.path.add(R);
            const H = jt(e, {
              position: M,
              forward: _,
              up: F,
              color: G.marker,
              scale: e.MathUtils.clamp($ * 1.15, 0.35, 1.6),
              active: k
            });
            H.userData.omnicamWidget = "gizmo", this.path.add(H);
          }
          if (v) {
            const _ = It(e, {
              position: W,
              radius: e.MathUtils.clamp(M.distanceTo(W) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            _.userData.omnicamWidget = "lookat", this.path.add(_);
            const T = new e.Line(
              new e.BufferGeometry().setFromPoints([M.clone(), W.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            T.renderOrder = 914, T.userData.omnicamWidget = "lookat", this.path.add(T);
          }
          if (v) {
            const _ = Dt(y, n[A - 1] || null, n[A + 1] || null);
            for (const T of ["in", "out"]) {
              const F = new e.Vector3().fromArray(_[T]), $ = new e.Line(
                new e.BufferGeometry().setFromPoints([M.clone(), F.clone()]),
                new e.LineBasicMaterial({ color: Oe, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              $.renderOrder = 912, $.userData.omnicamWidget = "gizmo", this.path.add($);
              const K = new e.Mesh(
                new e.SphereGeometry(Kt, 12, 8),
                new e.MeshBasicMaterial({ color: Oe, depthTest: !1 })
              );
              K.position.copy(F), K.renderOrder = 913, K.userData.omnicamCurveHandle = { cameraId: d.id, frame: y.frame, side: T }, K.userData.omnicamWidget = "gizmo", this.path.add(K);
            }
          }
        }
      });
      const m = [16742005, 52937, 16632686, 7101671, 14774357];
      (D.objects || []).forEach((d, g) => {
        const n = d.keyframes || [];
        if (n.length < 2) return;
        const G = d.color ? new e.Color(d.color) : m[g % m.length], k = n.map((A) => new e.Vector3().fromArray(A.transform?.position || [0, 0, 0])), O = new e.CatmullRomCurve3(k, !1, "centripetal"), y = new e.Mesh(
          new e.TubeGeometry(O, Math.max(32, n.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: G, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        y.renderOrder = 900, y.userData.omnicamWidget = "path", this.path.add(y);
        for (const A of n) {
          const S = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: G, depthTest: !1 })
          );
          S.position.fromArray(A.transform?.position || [0, 0, 0]), S.renderOrder = 910, S.userData.omnicamWidget = "path", this.path.add(S);
        }
      });
    }
  };
}
function Ht(r) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: P, PLYLoader: h, STLLoader: B, neutral: x, wire: q, checkerMaterial: j, objectMaterial: X, applyModelMaterial: I, disposeObject: N, textureFor: re, cardMesh: ee, generatePointField: Z, sampleCamera: E, sampleObjectTransform: se, hasOutlineMesh: D } = r;
  return {
    updateLiveCameras(f, t, o, c, l = "camera", s = null) {
      if (N(this.liveCameras), this.liveCameras.clear(), o) return;
      const i = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (f.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: f.keyframes || [] }]).forEach((m, d) => {
        const g = m.color ? { line: new e.Color(m.color), marker: new e.Color(m.color), frustum: new e.Color(m.color), body: new e.Color(m.color).multiplyScalar(0.35) } : i[d % i.length], n = m.id === f.active_camera_id, G = n && l === "camera", k = c === "camera" && n, O = E(m, t, f.objects), y = new e.Vector3().fromArray(O.position || [0, 0, 0]), A = new e.Vector3().fromArray(O.target || [0, 0, 0]), S = A.clone().sub(y), a = S.length();
        a < 1e-4 ? S.set(0, 0, -1) : S.normalize();
        let z = new e.Vector3(0, 1, 0), M = new e.Vector3().crossVectors(S, z);
        M.lengthSq() < 1e-6 && (z = new e.Vector3(0, 0, 1), M = new e.Vector3().crossVectors(S, z)), M.normalize();
        let W = new e.Vector3().crossVectors(M, S).normalize();
        if (O.roll) {
          const C = e.MathUtils.degToRad(O.roll);
          M.applyAxisAngle(S, C), W.applyAxisAngle(S, C);
        }
        const v = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!k) {
          const C = new e.Group(), _ = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: g.body, roughness: 0.4, metalness: 0.8 })
          );
          _.position.set(0, 0, -0.11), C.add(_);
          const T = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          T.rotateX(Math.PI / 2);
          const F = new e.Mesh(
            T,
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
          const te = new e.SphereGeometry(0.35, 8, 6), Q = new e.Mesh(te, v);
          Q.position.copy(y), Q.userData = { omnicamType: "camera", omnicamId: m.id }, this.liveCameras.add(Q);
          const U = e.MathUtils.clamp(a * 0.25, 0.5, 2.5), J = O.camera_type === "orthographic" ? 5 / Math.max(0.01, O.zoom || 1) * 0.35 : U * Math.tan(e.MathUtils.degToRad(O.fov || 35) * 0.5), w = J * (f.width || 16) / Math.max(1, f.height || 9), L = y.clone().addScaledVector(S, U), V = [
            L.clone().addScaledVector(M, -w).addScaledVector(W, -J),
            L.clone().addScaledVector(M, w).addScaledVector(W, -J),
            L.clone().addScaledVector(M, w).addScaledVector(W, J),
            L.clone().addScaledVector(M, -w).addScaledVector(W, J)
          ], R = [];
          for (const de of V) R.push(y, de);
          for (let de = 0; de < 4; de++) R.push(V[de], V[(de + 1) % 4]);
          const Y = V[2].clone().add(V[3]).multiplyScalar(0.5).clone().addScaledVector(W, J * 0.25);
          R.push(V[2], Y, Y, V[3]);
          const ue = new e.BufferGeometry().setFromPoints(R), le = new e.LineSegments(ue, new e.LineBasicMaterial({
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
          const C = n && l === "camera_target", _ = new e.BufferGeometry().setFromPoints([y, A]), T = new e.Line(_, new e.LineDashedMaterial({
            color: G || C ? 9133302 : g.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: G || C ? 1 : n ? 0.75 : 0.4
          }));
          T.userData.omnicamWidget = "lookat", this.liveCameras.add(T);
          const F = C ? 0.12 : G ? 0.11 : 0.08, $ = [
            A.clone().add(new e.Vector3(-F, 0, 0)),
            A.clone().add(new e.Vector3(F, 0, 0)),
            A.clone().add(new e.Vector3(0, -F, 0)),
            A.clone().add(new e.Vector3(0, F, 0)),
            A.clone().add(new e.Vector3(0, 0, -F)),
            A.clone().add(new e.Vector3(0, 0, F))
          ], K = new e.BufferGeometry().setFromPoints($), te = new e.LineSegments(K, new e.LineBasicMaterial({
            color: C || G ? 9133302 : g.marker,
            linewidth: C ? 3 : 1,
            transparent: !0,
            opacity: C || G ? 1 : n ? 0.9 : 0.5
          }));
          te.userData.omnicamWidget = "lookat", this.liveCameras.add(te);
          const Q = new e.SphereGeometry(0.28, 8, 6), U = new e.Mesh(Q, v);
          if (U.position.copy(A), U.userData = { omnicamType: "camera_target", omnicamId: m.id }, this.liveCameras.add(U), (C || G) && c !== "camera") {
            const J = new e.RingGeometry(0.14, 0.18, 24);
            J.rotateX(Math.PI / 2);
            const w = new e.MeshBasicMaterial({ color: Me.typeLookAt, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), L = new e.Mesh(J, w);
            L.position.copy(A), L.userData.omnicamWidget = "lookat", this.liveCameras.add(L);
          }
        }
        if (n && c !== "camera" && l === "camera") {
          const C = new e.RingGeometry(0.19, 0.24, 32);
          C.rotateX(Math.PI / 2);
          const _ = new e.MeshBasicMaterial({ color: Me.accent, side: e.DoubleSide, transparent: !0, opacity: 1 }), T = new e.Mesh(C, _);
          T.position.copy(y), T.userData.omnicamWidget = "gizmo", this.liveCameras.add(T);
          const F = new e.RingGeometry(0.28, 0.31, 32);
          F.rotateX(Math.PI / 2);
          const $ = new e.Mesh(F, new e.MeshBasicMaterial({ color: Me.accent, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          $.position.copy(y), $.userData.omnicamWidget = "gizmo", this.liveCameras.add($);
        }
      });
    },
    updateSelection(f, t, o, c = null, l = "", s = !1) {
      const i = c ? `${c.mode || ""}:${c.objectId || ""}:${(c.point || []).join(",")}` : "", b = `${t}:${o || ""}:${(f.__selectedObjectIds || []).join(",")}:${l}:${i}:${s ? "ortho" : "persp"}`;
      if (b !== this.selectionKey) {
        if (this.selectionKey = b, N(this.selectionGroup), this.selectionGroup.clear(), t === "object" && o) {
          const m = this.objectNodes.get(o);
          if (m) {
            m.updateMatrixWorld(!0);
            try {
              const d = new e.Box3(), g = [];
              if (m.traverse((n) => {
                n.isBone && g.push(n);
              }), g.length > 0) {
                const n = new e.Vector3();
                for (const G of g)
                  G.getWorldPosition(n), d.expandByPoint(n);
                d.expandByScalar(0.2);
              } else
                d.setFromObject(m);
              if ((s || !D(m)) && !d.isEmpty() && Number.isFinite(d.min.x) && Number.isFinite(d.max.x) && Number.isFinite(d.min.y) && Number.isFinite(d.max.y) && Number.isFinite(d.min.z) && Number.isFinite(d.max.z)) {
                d.expandByScalar(0.04);
                const n = new e.Box3Helper(d, new e.Color(9133302));
                n.material.transparent = !0, n.material.opacity = 0.95, n.material.depthTest = !1, n.renderOrder = 9999, this.selectionGroup.add(n);
              }
            } catch {
            }
            if (f.show_wireframe) {
              let d = 0;
              m.traverse((g) => {
                if (!g.isMesh || !g.geometry || g.userData.omnicamHelper || d >= 64) return;
                const n = qt(e, g, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                n.renderOrder = 9998, this.selectionGroup.add(n), d += 1;
              });
            }
            if (c && c.objectId === o && c.point) {
              if (c.mode === "vertex") {
                const d = new e.SphereGeometry(0.08, 16, 12), g = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), n = new e.Mesh(d, g);
                n.position.fromArray(c.point), n.renderOrder = 1e4, this.selectionGroup.add(n);
                const G = new e.RingGeometry(0.1, 0.15, 24), k = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), O = new e.Mesh(G, k);
                O.position.fromArray(c.point), this.activeCamera && O.quaternion.copy(this.activeCamera.quaternion), O.renderOrder = 1e4, this.selectionGroup.add(O);
              } else if (c.mode === "edge" && c.edge) {
                const [d, g] = c.edge, n = new e.BufferGeometry().setFromPoints([new e.Vector3(...d), new e.Vector3(...g)]), G = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), k = new e.Line(n, G);
                k.renderOrder = 1e4, this.selectionGroup.add(k);
              } else if (c.mode === "face" && c.vertices) {
                const [d, g, n] = c.vertices, G = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...d),
                  new e.Vector3(...g),
                  new e.Vector3(...n)
                ]);
                G.setIndex([0, 1, 2]), G.computeVertexNormals();
                const k = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), O = new e.Mesh(G, k);
                O.renderOrder = 1e4, this.selectionGroup.add(O);
                const y = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...d),
                  new e.Vector3(...g),
                  new e.Vector3(...n),
                  new e.Vector3(...d)
                ]), A = new e.Line(y, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                A.renderOrder = 10001, this.selectionGroup.add(A);
              }
            }
          }
        }
        if (t === "object")
          for (const m of f.__selectedObjectIds || []) {
            if (m === o) continue;
            const d = this.objectNodes.get(m);
            if (d) {
              d.updateMatrixWorld(!0);
              try {
                const g = new e.Box3().setFromObject(d);
                if ((s || !D(d)) && !g.isEmpty() && Number.isFinite(g.min.x)) {
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
      const o = [], c = /* @__PURE__ */ new Set();
      return t.traverse((l) => {
        const s = l.isBone ? l.name : "";
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
    sampleModelPoint(f, t, o, c = 24) {
      const l = this.objectNodes.get(f);
      if (!l) return null;
      const s = this.models.get(f), i = s?.mixer && s.duration > 0, b = i ? s.mixer.time : null;
      i && (s.mixer.setTime(Math.max(0, o) / Math.max(1, c) % s.duration), l.updateMatrixWorld(!0));
      let m = null;
      if (t) {
        let d = null;
        if (l.traverse((g) => {
          !d && g.isBone && g.name === t && (d = g);
        }), d) {
          const g = new e.Vector3().setFromMatrixPosition(d.matrixWorld);
          m = [g.x, g.y, g.z];
        }
      } else
        m = this.getObjectWorldCenter(f);
      return i && Number.isFinite(b) && (s.mixer.setTime(b), l.updateMatrixWorld(!0)), m;
    },
    getObjectWorldBounds(f) {
      const t = this.objectNodes.get(f);
      if (!t) return null;
      t.updateWorldMatrix(!0, !0);
      const o = new e.Box3().setFromObject(t, !0), c = o.min.toArray(), l = o.max.toArray();
      return !o.isEmpty() && [...c, ...l].every(Number.isFinite) ? { min: c, max: l } : null;
    },
    getObjectWorldCenter(f) {
      const t = this.objectNodes.get(f);
      if (!t) return null;
      t.updateMatrixWorld(!0);
      const o = [];
      if (t.traverse((s) => {
        s.isBone && o.push(s);
      }), o.length > 0) {
        const s = new e.Vector3(), i = new e.Vector3();
        for (const b of o)
          b.getWorldPosition(i), s.add(i);
        return s.divideScalar(o.length), [s.x, s.y, s.z];
      }
      const c = new e.Box3().setFromObject(t);
      if (!c.isEmpty() && Number.isFinite(c.min.x)) {
        const s = c.getCenter(new e.Vector3());
        return [s.x, s.y, s.z];
      }
      const l = new e.Vector3();
      return t.getWorldPosition(l), [l.x, l.y, l.z];
    },
    /** Every bone name in a loaded model, for the Rig Mapper (design spec 23). */
    getModelBoneNames(f) {
      const t = this.objectNodes.get(f);
      if (!t) return [];
      const o = [];
      return t.traverse((c) => {
        c.isBone && c.name && o.push(c.name);
      }), o;
    },
    /** Resolve one loaded bone by name, plus its world position. */
    resolveModelBone(f, t) {
      const o = this.objectNodes.get(f);
      if (!o || !t) return null;
      let c = null;
      if (o.traverse((s) => {
        !c && s.isBone && s.name === t && (c = s);
      }), !c) return null;
      c.updateWorldMatrix(!0, !1);
      const l = new e.Vector3();
      return c.getWorldPosition(l), { name: t, world: [l.x, l.y, l.z] };
    },
    /**
     * Apply an FK pose to a loaded character (design spec section 29,
     * ui.characterRuntime.applyPose). `boneMap` is canonical joint -> bone name;
     * `joints` is canonical joint -> local quaternion [x,y,z,w]. Bones not named
     * by `joints` are left at their bind rotation, captured once per bone.
     */
    applyCharacterPose(f, t, o) {
      const c = this.objectNodes.get(f);
      if (!c) return !1;
      const l = /* @__PURE__ */ new Map();
      if (c.traverse((i) => {
        i.isBone && i.name && l.set(i.name, i);
      }), !l.size) return !1;
      for (const i of l.values())
        i.userData.omnicamBindQuat || (i.userData.omnicamBindQuat = i.quaternion.clone());
      const s = o && typeof o == "object" ? o : {};
      for (const [i, b] of Object.entries(t || {})) {
        const m = l.get(b);
        if (!m) continue;
        const d = s[i];
        Array.isArray(d) && d.length === 4 && d.every(Number.isFinite) ? m.quaternion.fromArray(d).normalize() : m.userData.omnicamBindQuat && m.quaternion.copy(m.userData.omnicamBindQuat), m.updateMatrixWorld(!0);
      }
      return this.invalidate(), !0;
    },
    /**
     * Read the current local rotation of every mapped canonical joint -- what
     * "Bake current frame to pose" samples off the live mixer (design spec
     * section 27). A joint still at its captured bind rotation is omitted.
     */
    sampleCharacterBonePose(f, t) {
      const o = this.objectNodes.get(f);
      if (!o || !t) return {};
      const c = /* @__PURE__ */ new Map();
      o.traverse((s) => {
        s.isBone && s.name && c.set(s.name, s);
      });
      const l = {};
      for (const [s, i] of Object.entries(t)) {
        const b = c.get(i);
        if (!b) continue;
        const m = b.userData.omnicamBindQuat;
        m && b.quaternion.angleTo(m) < 1e-4 || (l[s] = b.quaternion.toArray());
      }
      return l;
    }
  };
}
function Qt(r) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: P, PLYLoader: h, STLLoader: B, neutral: x, wire: q, checkerMaterial: j, objectMaterial: X, applyModelMaterial: I, disposeObject: N, textureFor: re, cardMesh: ee, generatePointField: Z, sampleCamera: E, sampleObjectTransform: se } = r;
  function D(f) {
    const t = f.supersampleFactor?.() || 1;
    return { w: f.canvas.width / t, h: f.canvas.height / t };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(f) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: o } = D(this);
      this.pointer.set(f[0] / t * 2 - 1, -(f[1] / o) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const b = gt(i);
        if (b) return { ...b, position: i.object.position.toArray() };
      }
      const c = 16 * Math.min(2, window.devicePixelRatio || 1);
      let l = null;
      const s = new e.Vector3();
      for (const i of this.path.children) {
        const b = i.userData?.omnicamPathKey;
        if (!b || (s.copy(i.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const m = (s.x * 0.5 + 0.5) * t, d = (1 - (s.y * 0.5 + 0.5)) * o, g = Math.hypot(f[0] - m, f[1] - d);
        g <= c && (!l || g < l.distance) && (l = { key: b, position: i.position.toArray(), distance: g });
      }
      return l ? { ...l.key, position: l.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(f) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: o } = D(this);
      this.pointer.set(f[0] / t * 2 - 1, -(f[1] / o) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const b = wt(i);
        if (b) return { ...b, position: i.object.position.toArray() };
      }
      const c = 14 * Math.min(2, window.devicePixelRatio || 1);
      let l = null;
      const s = new e.Vector3();
      for (const i of this.path.children) {
        const b = i.userData?.omnicamCurveHandle;
        if (!b || (s.copy(i.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const m = (s.x * 0.5 + 0.5) * t, d = (1 - (s.y * 0.5 + 0.5)) * o, g = Math.hypot(f[0] - m, f[1] - d);
        g <= c && (!l || g < l.distance) && (l = { handle: b, position: i.position.toArray(), distance: g });
      }
      return l ? { ...l.handle, position: l.position } : null;
    },
    /**
     * The active camera-path segment (two neighbouring real keyframes, plus
     * a `t` 0..1 between them) nearest the pointer, for double-click-to-
     * insert (Task 8). `null` when the pointer isn't over the path tube.
     */
    pickPathSegment(f) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: o } = D(this);
      this.pointer.set(f[0] / t * 2 - 1, -(f[1] / o) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const c = this.raycaster.intersectObjects(this.path.children, !0).find((y) => y.object.userData?.omnicamPathSegments);
      if (!c) return null;
      const { cameraId: l, firstFrame: s, lastFrame: i, frames: b, points: m } = c.object.userData.omnicamPathSegments;
      if (!m?.length || b.length < 2) return null;
      let d = 0, g = 1 / 0;
      for (let y = 0; y < m.length; y += 1) {
        const [A, S, a] = m[y], z = A - c.point.x, M = S - c.point.y, W = a - c.point.z, v = z * z + M * M + W * W;
        v < g && (g = v, d = y);
      }
      const n = s + (i - s) * d / Math.max(1, m.length - 1);
      let G = b[0], k = b[b.length - 1];
      for (let y = 0; y < b.length - 1; y += 1)
        if (b[y] <= n && n <= b[y + 1]) {
          G = b[y], k = b[y + 1];
          break;
        }
      if (G === k) return null;
      const O = Math.min(1, Math.max(0, (n - G) / (k - G)));
      return { cameraId: l, leftFrame: G, rightFrame: k, t: O };
    },
    configureCamera(f, t) {
      const o = f || defaultCamera(), c = Math.max(5e-4, Number(o.near) || 0.01), l = Math.max(c + 1, Number(o.far) || 1e4);
      let s;
      if (o.camera_type === "orthographic") {
        s = this.orthographic;
        const n = 5 / Math.max(0.01, o.zoom || 1);
        s.left = -n * t, s.right = n * t, s.top = n, s.bottom = -n, s.near = c, s.far = l, s.updateProjectionMatrix();
      } else
        s = this.perspective, s.fov = e.MathUtils.clamp(Number(o.fov) || 35, 1, 175), s.aspect = t, s.near = c, s.far = l, s.updateProjectionMatrix();
      const i = new e.Vector3().fromArray(o.position || [6, 4, 6]), b = new e.Vector3().fromArray(o.target || [0, 1.5, 0]), m = b.clone().sub(i);
      m.lengthSq() < 1e-6 ? m.set(0, 0, -1) : m.normalize();
      let d = o.up ? new e.Vector3().fromArray(o.up) : new e.Vector3(0, 1, 0), g = new e.Vector3().crossVectors(m, d);
      if (g.lengthSq() < 1e-6 && (d = Math.abs(m.y) > 0.9 ? new e.Vector3(0, 0, m.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), g.crossVectors(m, d)), g.normalize(), d.crossVectors(g, m).normalize(), o.roll) {
        const n = e.MathUtils.degToRad(o.roll);
        g.applyAxisAngle(m, n), d.applyAxisAngle(m, n);
      }
      return s.position.copy(i), s.up.copy(d), s.lookAt(b), s.updateMatrixWorld(), s;
    },
    pick(f, t, o, c) {
      if (!this.activeCamera) return null;
      this.pointer.set(f / Math.max(1, o) * 2 - 1, 1 - t / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
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
          let i = s.object;
          for (; i && !i.userData?.omnicamId; ) i = i.parent;
          i?.userData?.omnicamId && l.push({
            distance: s.distance,
            type: "object",
            id: i.userData.omnicamId
          });
        }
      return l.length ? (l.sort((s, i) => s.distance - i.distance), { type: l[0].type, id: l[0].id }) : null;
    },
    /**
     * World point -> logical viewport pixels, for the DOM label overlay
     * (design spec section 14). `behind` is true when the point is outside the
     * near/far clip and the caller should hide its label.
     */
    projectWorldToScreen(f) {
      if (!this.activeCamera || !Array.isArray(f) || f.length < 3) return null;
      const { w: t, h: o } = D(this), c = new e.Vector3(Number(f[0]) || 0, Number(f[1]) || 0, Number(f[2]) || 0);
      return c.project(this.activeCamera), {
        x: (c.x * 0.5 + 0.5) * t,
        y: (1 - (c.y * 0.5 + 0.5)) * o,
        behind: c.z < -1 || c.z > 1,
        width: t,
        height: o
      };
    },
    pickSubElement(f, t, o, c, l = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(f / Math.max(1, o) * 2 - 1, 1 - t / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const s = this.raycaster.intersectObjects(this.content.children, !0);
      for (const i of s) {
        let b = i.object, m = i.object;
        for (; b && !b.userData.omnicamId; ) b = b.parent;
        if (!b?.userData.omnicamId || !m.geometry) continue;
        const d = b.userData.omnicamId, n = m.geometry.getAttribute("position");
        if (!n) continue;
        m.updateMatrixWorld(!0);
        const G = m.matrixWorld;
        if (l === "vertex") {
          let k = -1, O = 1 / 0, y = null;
          if (i.face) {
            const A = [i.face.a, i.face.b, i.face.c];
            for (const S of A) {
              const a = new e.Vector3(n.getX(S), n.getY(S), n.getZ(S)).applyMatrix4(G), z = a.distanceTo(i.point);
              z < O && (O = z, k = S, y = [a.x, a.y, a.z]);
            }
          } else
            for (let A = 0; A < n.count; A++) {
              const S = new e.Vector3(n.getX(A), n.getY(A), n.getZ(A)).applyMatrix4(G), a = S.distanceTo(i.point);
              a < O && (O = a, k = A, y = [S.x, S.y, S.z]);
            }
          if (y)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: d,
              index: k,
              point: y
            };
        }
        if (l === "edge" && i.face) {
          const k = new e.Vector3(n.getX(i.face.a), n.getY(i.face.a), n.getZ(i.face.a)).applyMatrix4(G), O = new e.Vector3(n.getX(i.face.b), n.getY(i.face.b), n.getZ(i.face.b)).applyMatrix4(G), y = new e.Vector3(n.getX(i.face.c), n.getY(i.face.c), n.getZ(i.face.c)).applyMatrix4(G), A = (W, v, C) => {
            const _ = new e.Line3(v, C), T = new e.Vector3();
            return _.closestPointToPoint(W, !0, T), { dist: W.distanceTo(T), point: T, segment: [v, C] };
          }, S = A(i.point, k, O), a = A(i.point, O, y), z = A(i.point, y, k), M = [S, a, z].reduce((W, v) => v.dist < W.dist ? v : W);
          return {
            type: "edge",
            mode: "edge",
            objectId: d,
            point: [M.point.x, M.point.y, M.point.z],
            edge: [
              [M.segment[0].x, M.segment[0].y, M.segment[0].z],
              [M.segment[1].x, M.segment[1].y, M.segment[1].z]
            ]
          };
        }
        if (l === "face" && i.face) {
          const k = new e.Vector3(n.getX(i.face.a), n.getY(i.face.a), n.getZ(i.face.a)).applyMatrix4(G), O = new e.Vector3(n.getX(i.face.b), n.getY(i.face.b), n.getZ(i.face.b)).applyMatrix4(G), y = new e.Vector3(n.getX(i.face.c), n.getY(i.face.c), n.getZ(i.face.c)).applyMatrix4(G), A = new e.Vector3().add(k).add(O).add(y).divideScalar(3), S = i.face.normal.clone().transformDirection(G);
          return {
            type: "face",
            mode: "face",
            objectId: d,
            faceIndex: i.faceIndex,
            point: [A.x, A.y, A.z],
            normal: [S.x, S.y, S.z],
            vertices: [
              [k.x, k.y, k.z],
              [O.x, O.y, O.z],
              [y.x, y.y, y.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(f, t, o, c) {
      if (!this.activeCamera) return null;
      this.pointer.set(f / Math.max(1, o) * 2 - 1, 1 - t / Math.max(1, c) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const l = this.raycaster.intersectObjects(this.content.children, !0);
      if (l.length > 0)
        return [l[0].point.x, l[0].point.y, l[0].point.z];
      const s = new e.Plane(new e.Vector3(0, 1, 0), 0), i = new e.Vector3();
      return this.raycaster.ray.intersectPlane(s, i) ? [i.x, i.y, i.z] : null;
    }
  };
}
const xe = ["high", "balanced", "low"], Zt = 25, Te = 30, Jt = 0.6;
function ke(r = "balanced") {
  return { quality: r, samples: [], downgraded: !1 };
}
function Et(r) {
  const e = xe.indexOf(r);
  return e < 0 || e >= xe.length - 1 ? null : xe[e + 1];
}
function er(r, e) {
  if (!Number.isFinite(e) || e < 0 || (r.samples.push(e), r.samples.length > Te && r.samples.shift(), r.samples.length < Te) || r.samples.filter((P) => P > Zt).length / r.samples.length < Jt) return null;
  const p = Et(r.quality);
  return p ? (r.quality = p, r.downgraded = !0, r.samples = [], p) : null;
}
function tr(r, e) {
  return r.quality = e, r.samples = [], r.downgraded = !1, r;
}
function rr(r) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: P, PLYLoader: h, STLLoader: B, neutral: x, wire: q, checkerMaterial: j, objectMaterial: X, applyModelMaterial: I, disposeObject: N, textureFor: re, cardMesh: ee, generatePointField: Z, sampleCamera: E, sampleObjectTransform: se, hasOutlineMesh: D, SelectionOutlineRenderer: f } = r;
  return {
    render(t, o, c, l, s, i = /* @__PURE__ */ new Map(), b = 0, m = !1, d = "camera", g = "subject", n = null, G = null, k = null, O = "auto") {
      const y = m && O === "clay" ? !0 : m && (O === "motion_proxy" || O === "depth_rich") ? !1 : !m || (t.render_mode || "") === "beauty";
      if (y !== this.studioEnabled) {
        this.studioEnabled = y, Re(e, this.scene, this.renderer, this.studio, y);
        for (const w of this.flatLights || []) w.visible = !y;
      }
      const A = !!t.objects?.some((w) => w.type === "sun_light" && w.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !A && y), this.flatLights?.[1] && (this.flatLights[1].visible = !A && !y), this.disposed) return;
      (this.canvas.width !== l || this.canvas.height !== s) && this.renderer.setSize(l, s, !1);
      const S = (o && o.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const a = t.viewport_bg_sequence && t.viewport_bg_sequence.length ? t.viewport_bg_sequence[b % t.viewport_bg_sequence.length] : t.viewport_bg_image || "";
      if (a) {
        this.bgImageUrl = a;
        const w = this.bgTextureCache.get(a);
        if (w)
          this.bgTextureCache.delete(a), this.bgTextureCache.set(a, w), this.bgTexture = w, this.scene.background = w;
        else if (!this.bgTextureLoads.has(a)) {
          const L = this.bgLoadGeneration;
          this.bgTextureLoads.set(a, L), new e.TextureLoader().load(a, (R) => {
            if (this.bgTextureLoads.delete(a), this.disposed || L !== this.bgLoadGeneration) {
              R.dispose();
              return;
            }
            for (R.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(a, R); this.bgTextureCache.size > 8; ) {
              const H = [...this.bgTextureCache.keys()].find((ue) => ue !== this.bgImageUrl);
              if (!H) break;
              const Y = this.bgTextureCache.get(H);
              this.bgTextureCache.delete(H), Y?.dispose?.();
            }
            this.bgImageUrl === a && (this.bgTexture = R, this.scene.background = R), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(a);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const L of new Set(this.bgTextureCache.values())) L.dispose();
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
          const { position: L, rotation: V, keyframes: R, size: H, ...Y } = w;
          return w.type === "card" && (Y.size = H), Y;
        })
      ]), M = [...c.entries()].map(([w, L]) => `${w}:${L?.src || ""}`).join("|"), W = [...i.entries()].map(([w, L]) => `${w}:${L}`).join("|");
      (z !== this.sceneKey || M !== this.mediaSignature || W !== this.modelSignature) && (this.sceneKey = z, this.mediaSignature = M, this.modelSignature = W, this.rebuild(t, c, i, m, O));
      const v = Math.max(1, t.fps || 24), C = /* @__PURE__ */ new Map();
      for (const w of t.objects)
        w.character?.motion && this.models.has(w.id) && C.set(w.id, w.character.motion);
      for (const [w, L] of this.models) {
        if (!L.mixer || !(L.duration > 0)) continue;
        const V = C.get(w);
        V ? (this.applyMotionClip?.(w, V), L.mixer.setTime(yt(V, b, v, L.duration))) : L.mixer.setTime(b / v % L.duration);
      }
      for (const w of t.objects) {
        const L = this.objectNodes.get(w.id);
        if (!L) continue;
        const V = w.keyframes?.length ? se(w, b) : w;
        L.position.fromArray(V.position || [0, 0, 0]), L.rotation.set(...(V.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), w.type !== "card" && w.type !== "null" && L.scale.fromArray(V.size || [1, 1, 1]), w.type === "null" && (L.visible = m ? !0 : t.show_helper_axes !== !1);
      }
      this.path.visible = !m;
      const _ = t.show_grid !== !1 && t.render_mode !== "point_field", T = O === "depth_rich" || !!t.playblast_grid;
      this.content.traverse((w) => {
        w.userData.omnicamCaptureGuide && (w.visible = m ? T : _);
      });
      const F = t.view_mode || "camera", $ = Array.isArray(k) ? [...k].sort((w, L) => w - L).join(",") : "", K = `${F}:${d}:${G ?? ""}:${$}:${t.__omnicamRevision ?? JSON.stringify([
        t.active_camera_id,
        (t.cameras || []).map((w) => [w.id, w.keyframes?.length, w.keyframes?.map((L) => [L.frame, L.camera?.position, L.camera?.target, L.interpolation, L.tangents])]),
        (t.objects || []).map((w) => [w.id, w.keyframes?.length, w.keyframes?.map((L) => [L.frame, L.transform?.position])])
      ])}`;
      if (K !== this.pathKey && (this.pathKey = K, this.rebuildPath(t, d, G, F, k)), this.updateLiveCameras(t, b, m, F, d, G), this.liveCameras.visible = !m, !m) {
        const w = t.show_camera_paths !== !1, L = t.show_camera_gizmos !== !1, V = t.show_look_at !== !1;
        for (const R of [this.path, this.liveCameras])
          R.traverse((H) => {
            const Y = H.userData.omnicamWidget;
            Y === "path" ? H.visible = w : Y === "gizmo" ? H.visible = L : Y === "lookat" && (H.visible = V);
          });
      }
      const te = l / Math.max(1, s), Q = this.configureCamera(o, te);
      if (this.activeCamera = Q, m ? this.selectionGroup.visible = !1 : (this.updateSelection(t, d, g, n, `${t.__omnicamRevision ?? "legacy"}:${b}`, S), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const w = new e.Box3();
        this.content.traverse((V) => {
          if (!V.isMesh || V.userData.omnicamCaptureGuide) return;
          V.castShadow = !0, V.receiveShadow = !0, V.updateWorldMatrix(!0, !1);
          const R = new e.Box3().setFromObject(V);
          !R.isEmpty() && Number.isFinite(R.min.x) && w.union(R);
        });
        const L = this.studio?.key;
        if (L) {
          const V = w.isEmpty() ? new e.Vector3() : w.getCenter(new e.Vector3()), R = w.isEmpty() ? new e.Vector3(12, 12, 12) : w.getSize(new e.Vector3()), H = Math.max(1, 0.5 * Math.max(R.x, R.y, R.z) * Math.SQRT2), Y = H * 1.15 + 0.5, ue = new e.Vector3(4.5, 7.5, 3.5).normalize(), le = Math.max(12, H * 4);
          L.position.copy(V).addScaledVector(ue, le), L.target.position.copy(V), L.target.updateMatrixWorld(!0);
          const oe = L.shadow.camera;
          oe.left = -Y, oe.right = Y, oe.top = Y, oe.bottom = -Y, oe.near = Math.max(0.1, le - H - 1), oe.far = le + H + 1, oe.updateProjectionMatrix(), L.shadow.map?.dispose(), L.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((w) => {
        w.userData.omnicamBillboard && w.quaternion.copy(Q.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, l, s);
      const U = performance.now();
      let J = !1;
      if (!m && !S && d === "object" && (g || t.__selectedObjectIds?.length) && !n) {
        const w = t.__selectedObjectIds?.length ? t.__selectedObjectIds : g ? [g] : [], L = [];
        for (const V of w) {
          const R = this.objectNodes.get(V);
          R && D(R) && L.push(R);
        }
        L.length && (this.outlineRenderer || (this.outlineRenderer = new f(this.renderer, this.scene, void 0, Q)), this.outlineRenderer.render(Q, l, s, L), J = !0);
      }
      if (J || this.renderer.render(this.scene, Q), !m && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= ke(this.studio?.quality);
        const w = er(this.qualityMonitor, performance.now() - U);
        w && (Ae(this.studio, this.renderer, w), this.onQualityDowngrade?.(w));
      }
    },
    setViewportQuality(t) {
      Ae(this.studio, this.renderer, t), this.qualityMonitor = tr(this.qualityMonitor || ke(t), t);
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
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), N(this.content), N(this.path), N(this.liveCameras), N(this.selectionGroup);
        for (const t of new Set(this.bgTextureCache.values())) t.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const t of this.models.values()) N(t.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.outlineRenderer?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
const or = {
  EffectComposer: Ze,
  OutlinePass: Qe,
  OutputPass: He,
  RenderPass: Ye,
  Vector2: ze
};
function ar(r) {
  let e = !1;
  return r?.traverse?.((u) => {
    e || u.visible === !1 || !u.isMesh || u.userData?.omnicamHelper || u.userData?.omnicamCaptureGuide || (e = !!(u.geometry && u.material));
  }), e;
}
class sr {
  constructor(e, u, p = or, P = null) {
    const { EffectComposer: h, RenderPass: B, OutlinePass: x, OutputPass: q, Vector2: j } = p;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new h(e), this.renderPass = new B(u, P), this.outlinePass = new x(new j(1, 1), u, P, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new q(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, u, p, P) {
    this.disposed || ((u !== this.width || p !== this.height) && (this.width = u, this.height = p, this.composer.setSize(u, p)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...P], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const Fe = { low: zt, balanced: Ft, high: kt }, me = new Be({ color: 10265519, roughness: 0.48, metalness: 0.06, side: ae }), $e = new Be({ color: 2237998, roughness: 0.95, metalness: 0, side: ae }), Le = new be({ color: 11449792, wireframe: !0, side: ae });
function Se(r = !1) {
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
  return u.wrapS = u.wrapT = ht, u.repeat.set(8, 8), u.colorSpace = Ce, u.needsUpdate = !0, new Be({ map: u, roughness: 0.85, metalness: 0, side: r ? _e : ae });
}
function nr(r, e, u = !1) {
  const p = e === "wireframe" ? "wireframe" : r.material_mode || "textured", P = u ? _e : ae;
  if (p === "wireframe") {
    const B = Le.clone();
    return B.side = P, r.color && (B.color = new ce(r.color)), B;
  }
  if (p === "checker") return Se(u);
  if (p === "matte") {
    const B = $e.clone();
    return B.side = P, r.color && (B.color = new ce(r.color)), B;
  }
  const h = me.clone();
  return h.side = P, r.color && (h.color = new ce(r.color)), h;
}
function ir(r, e, u = null, p = !1) {
  const P = p ? _e : ae;
  r.traverse((h) => {
    if (h.isMesh) {
      if (h.userData.omnicamOriginalMaterial || (h.userData.omnicamOriginalMaterial = h.material), h.userData.omnicamOverrideMaterial) {
        const B = Array.isArray(h.material) ? h.material : [h.material];
        for (const x of B)
          x?.map?.dispose?.(), x?.dispose?.();
        h.userData.omnicamOverrideMaterial = !1;
      }
      if (e === "textured" || e === "wireframe_texture") {
        h.material = h.userData.omnicamOriginalMaterial;
        const B = Array.isArray(h.material) ? h.material : [h.material];
        for (const x of B)
          x && (x.side = P);
      } else if (e === "checker")
        h.material = Se(p), h.userData.omnicamOverrideMaterial = !0;
      else if (e === "wireframe") {
        const B = Le.clone();
        B.side = P, u?.color && (B.color = new ce(u.color)), h.material = B, h.userData.omnicamOverrideMaterial = !0;
      } else if (e === "matte") {
        const B = $e.clone();
        B.side = P, u?.color && (B.color = new ce(u.color)), h.material = B, h.userData.omnicamOverrideMaterial = !0;
      } else {
        const B = me.clone();
        B.side = P, u?.color && (B.color = new ce(u.color)), h.material = B, h.userData.omnicamOverrideMaterial = !0;
      }
    }
  });
}
function ve(r, e = !1) {
  r.traverse((u) => {
    if (u.userData.omnicamModelResource && !e) return;
    u.geometry?.dispose?.();
    const p = Array.isArray(u.material) ? u.material : [u.material];
    for (const P of p)
      P?.map?.dispose?.(), P?.dispose?.();
  });
}
function Ke(r) {
  if (!r) return null;
  const e = r instanceof HTMLVideoElement ? new ft(r) : new pt(r);
  return e.colorSpace = Ce, e.needsUpdate = !0, e;
}
function cr(r, e, u) {
  e && St(r, e);
  const [p, P] = r.size || [2, 3], h = new ie(), B = new we(new De(p, P), new be({ color: 1448482, side: ae, transparent: !0, opacity: 0.85 }));
  B.frustumCulled = !1, h.add(B);
  let x = e ? Ke(e) : null;
  if (!x && (r.id === "subject" || !r.asset) && (x = Gt(pe)), !x) return h;
  const j = e?.videoWidth || e?.naturalWidth || e?.width || p, X = e?.videoHeight || e?.naturalHeight || e?.height || P, I = j / Math.max(1, X), N = p / Math.max(0.01, P);
  let re = p, ee = P;
  u === "contain" ? I > N ? ee = p / I : re = P * I : u === "cover" && (I > N ? (x.repeat.x = N / I, x.offset.x = (1 - x.repeat.x) * 0.5) : (x.repeat.y = I / N, x.offset.y = (1 - x.repeat.y) * 0.5));
  const Z = new we(
    new De(re, ee),
    new be({
      color: 16777215,
      map: x,
      side: ae,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return Z.frustumCulled = !1, Z.position.z = 2e-3, h.add(Z), h.frustumCulled = !1, h;
}
class lr {
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
    p.position.set(5, 8, 4), this.scene.add(p), this.flatLights = [this.scene.children.at(-2), p], this.studio = Bt(pe, this.renderer, Lt), this.scene.add(this.studio.group), this.studioEnabled = !0, Re(pe, this.scene, this.renderer, this.studio, !0), this.content = new ie(), this.scene.add(this.content), this.path = new ie(), this.scene.add(this.path), this.liveCameras = new ie(), this.scene.add(this.liveCameras), this.selectionGroup = new ie(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ot(35, 16 / 9, 0.01, 1e4), this.orthographic = new at(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = u, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new st(), this.pointer = new ze(), this.activeCamera = this.perspective;
  }
  async loadModel(e, u, p = "glb") {
    const P = `${p}:${u}`;
    if (!(!u || this.modelLoads.get(e) === P)) {
      this.modelLoads.set(e, P);
      try {
        let h, B = [];
        if (p === "obj") h = await new We().loadAsync(u);
        else if (p === "fbx")
          h = await new je().loadAsync(u), B = h.animations || [];
        else if (p === "stl") h = new we(await new Ie().loadAsync(u), me.clone());
        else if (p === "ply") {
          const o = await new Ne().loadAsync(u);
          o.index ? (o.getAttribute("normal") || o.computeVertexNormals(), h = new we(o, me.clone())) : h = new nt(o, new it({ color: 11449792, size: 0.025 }));
        } else {
          const o = await new Ue().loadAsync(u);
          h = o.scene, B = o.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== P) {
          ve(h, !0);
          return;
        }
        const x = this.models.get(e);
        x && ve(x.scene, !0), h.traverse((o) => {
          if (o.userData.omnicamModelResource = !0, o.frustumCulled = !1, o.isMesh && (o.frustumCulled = !1, o.material)) {
            const c = Array.isArray(o.material) ? o.material : [o.material];
            for (const l of c)
              l.side = ae;
          }
          o.isPoints && (o.frustumCulled = !1), o.isSkinnedMesh && (o.frustumCulled = !1, o.computeBoundingBox?.(), o.computeBoundingSphere?.());
        });
        let q = 0, j = 0, X = 0, I = 0;
        h.traverse((o) => {
          o.isMesh && (q += 1, I += o.geometry?.getAttribute?.("position")?.count || 0), o.isPoints && (j += 1), o.isBone && (X += 1);
        });
        const N = new ie();
        if (N.frustumCulled = !1, N.add(h), !q && !j && X) {
          const o = new ct(h);
          o.material.depthTest = !1, o.material.opacity = 0.9, o.material.transparent = !0, o.renderOrder = 10, o.userData.omnicamModelResource = !0, N.add(o);
        }
        N.updateMatrixWorld(!0);
        const re = new lt().setFromObject(N), ee = re.getSize(new Pe()), Z = Math.max(ee.x, ee.y, ee.z), E = Number.isFinite(Z) && Z > 1e-6 ? 2.5 / Z : 1, se = re.getCenter(new Pe());
        N.scale.setScalar(E), N.position.set(-se.x * E, -re.min.y * E, -se.z * E);
        const D = new ie();
        D.frustumCulled = !1, D.add(N);
        const f = B.length ? new dt(h) : null;
        f && f.clipAction(B[0]).play();
        const t = { url: u, format: p, scene: D, mixer: f, clips: B, selectedClip: 0, duration: B[0]?.duration || 0, meshes: q, points: j, bones: X, vertices: I, animations: B.length, normalizationScale: E };
        this.models.set(e, t), this.onModelLoaded({ id: e, format: p, meshes: q, points: j, bones: X, vertices: I, animations: B.length, animationNames: B.map((o, c) => o.name || `Clip ${c + 1}`), duration: t.duration, normalizationScale: E }), this.sceneKey = "", this.invalidate();
      } catch (h) {
        this.modelLoads.get(e) === P && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${p.toUpperCase()} ${e}`, h);
        const B = h?.message?.includes("FBX version not supported") || h?.message?.includes("6100") || h?.message?.includes("6000"), x = B ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : h?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: p, error: x, isLegacyFBX: B });
      }
    }
  }
}
const he = { THREE: pe, FBXLoader: je, GLTFLoader: Ue, OBJLoader: We, PLYLoader: Ne, STLLoader: Ie, neutral: me, wire: Le, checkerMaterial: Se, objectMaterial: nr, applyModelMaterial: ir, disposeObject: ve, textureFor: Ke, cardMesh: cr, generatePointField: Mt, sampleCamera: xt, sampleObjectTransform: bt, hasOutlineMesh: ar, SelectionOutlineRenderer: sr };
Object.assign(
  lr.prototype,
  Yt(he),
  Ht(he),
  Qt(he),
  rr(he)
);
async function dr(r, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const u of ["vp9", "vp8"])
    try {
      if (await fe(Wt(u, { width: r, height: e }), 5e3, `Checking ${u} support`)) return u;
    } catch {
    }
  return null;
}
function fe(r, e, u) {
  let p;
  return Promise.race([
    r,
    new Promise((P, h) => {
      p = setTimeout(() => h(new Error(`${u} timed out`)), e);
    })
  ]).finally(() => clearTimeout(p));
}
async function yr(r, e, u, p, P, h = "balanced") {
  const B = await dr(r.width, r.height);
  if (!B) throw new Error("No supported WebCodecs WebM encoder");
  const x = new At({ format: new Ot(), target: new Vt() }), q = new Tt(r, { codec: B, quality: Fe[h] || Fe.balanced, keyFrameInterval: 1 });
  x.addVideoTrack(q, { frameRate: u }), await fe(x.start(), 1e4, "Starting deterministic encoder");
  try {
    const j = 1 / u;
    for (let X = 0; X < e; X++) {
      if (P?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await p(X), await fe(q.add(X * j, j, { keyFrame: X % u === 0 }), 1e4, `Encoding frame ${X + 1}`);
    }
    await fe(x.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (j) {
    throw x.state !== "finalized" && await x.cancel().catch(() => {
    }), j;
  }
  return _t(new Blob([x.target.buffer], { type: await x.getMimeType() }), {
    encoder: "webcodecs",
    requestedFrames: e,
    expectedDurationMs: e / u * 1e3,
    recordedDurationMs: e / u * 1e3,
    driftMs: 0,
    fps: u,
    width: r.width,
    height: r.height
  });
}
export {
  lr as OmniWebGLViewport,
  yr as encodeDeterministicPlayblast,
  dr as supportsDeterministicEncoding
};
