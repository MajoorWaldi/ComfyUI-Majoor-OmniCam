import { T as pe } from "./chunk-IMiHbUfz.js";
import { ab as ze, ae as Ye, af as He, ag as Qe, ah as Ze, W as Je, s as Ce, Z as Ee, i as et, u as ce, H as tt, l as rt, G as ie, k as ot, Y as at, a2 as st, ai as We, aj as je, M as we, ak as Ie, n as Be, al as Ne, P as nt, c as it, e as Ue, D as ae, a5 as ct, d as lt, V as Pe, v as dt, f as be, J as _e, m as De, z as ut, a1 as mt, a3 as ht, ac as ft, a8 as pt } from "./vendor-three-B8JDtKPi.js";
import { T as Me, bR as wt, bS as gt, bT as yt, bh as Mt, a as xt, J as bt } from "./chunk-YG9AoC20.js";
import { r as vt, q as Ct, a as Ae, s as Re, D as Ve, c as Bt, b as _t, d as Lt, e as St, g as Gt } from "./chunk-bw3_SesD.js";
import { c as Pt } from "./chunk-a2yd8Eqb.js";
import { o as Dt } from "./chunk-DlQYqeNs.js";
import { Output as At, BufferTarget as Vt, WebMOutputFormat as Ot, CanvasSource as Tt, QUALITY_HIGH as kt, QUALITY_MEDIUM as Ft, QUALITY_LOW as zt, canEncodeVideo as Wt } from "./vendor-mediabunny-CZ5VNE-V.js";
function jt(o, { position: e, forward: u, up: p, color: P, scale: h = 1, active: B = !0 }) {
  const b = new o.Group(), q = B ? 0.95 : 0.5, j = new o.MeshBasicMaterial({
    color: P,
    transparent: !0,
    opacity: q,
    depthTest: !1
  }), X = new o.Mesh(new o.BoxGeometry(0.34, 0.24, 0.42), j);
  X.renderOrder = 912, b.add(X);
  const I = new o.Mesh(new o.ConeGeometry(0.17, 0.26, 20), j);
  return I.rotation.x = -Math.PI / 2, I.position.z = -0.32, I.renderOrder = 912, b.add(I), b.scale.setScalar(h), b.position.copy(e), b.up.copy(p), b.lookAt(e.clone().add(u)), b;
}
function It(o, { position: e, color: u = 15903035, radius: p = 0.28, bold: P = !1 }) {
  const h = new o.Group(), B = P ? 16773544 : u, b = new o.LineBasicMaterial({ color: B, transparent: !0, opacity: P ? 1 : 0.95, depthTest: !1 }), q = (I) => {
    const N = [];
    for (let Z = 0; Z <= 48; Z++) {
      const E = Z / 48 * Math.PI * 2;
      N.push(new o.Vector3(Math.cos(E) * I, Math.sin(E) * I, 0));
    }
    const ee = new o.Line(new o.BufferGeometry().setFromPoints(N), b);
    return ee.renderOrder = 915, ee;
  };
  if (h.add(q(p)), P) {
    h.add(q(p * 1.18));
    const I = new o.Mesh(
      new o.RingGeometry(0, p * 0.3, 16),
      new o.MeshBasicMaterial({ color: B, transparent: !0, opacity: 1, depthTest: !1 })
    );
    I.renderOrder = 916, h.add(I);
  }
  const j = p * 1.55, X = new o.LineSegments(
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
    b
  );
  return X.renderOrder = 915, h.add(X), h.position.copy(e), h.userData.omnicamBillboard = !0, h;
}
const qe = 3718648, Nt = 12e3;
function ge(o) {
  return !!(o.isSkinnedMesh && o.skeleton);
}
function Xe(o, e) {
  o.position.copy(e.position), o.quaternion.copy(e.quaternion), o.scale.copy(e.scale);
}
function ye(o) {
  return o.frustumCulled = !1, o.raycast = () => {
  }, o.userData.omnicamHelper = !0, o;
}
function Ut(o, e, { color: u = null, opacity: p = null } = {}) {
  const P = u ?? qe, h = p ?? 0.65;
  if (ge(e)) {
    const b = new o.SkinnedMesh(e.geometry.clone(), new o.MeshBasicMaterial({
      color: P,
      wireframe: !0,
      transparent: !0,
      opacity: h,
      depthWrite: !1
    }));
    return b.bindMode = e.bindMode, b.bind(e.skeleton, e.bindMatrix), Xe(b, e), { overlay: ye(b), parent: e.parent || e };
  }
  const B = new o.LineSegments(
    new o.WireframeGeometry(e.geometry),
    new o.LineBasicMaterial({ color: P, opacity: h, transparent: !0, depthTest: !0 })
  );
  return { overlay: ye(B), parent: e };
}
function Rt(o, e) {
  const u = new o.PointsMaterial({ color: qe, size: 0.05, sizeAttenuation: !0 });
  if (!ge(e)) {
    const I = new o.Points(e.geometry, u);
    return { overlay: ye(I), parent: e };
  }
  const p = e.geometry.getAttribute("position")?.count || 0, P = Math.max(1, Math.ceil(p / Nt)), h = Math.ceil(p / P), B = new Float32Array(h * 3), b = new o.BufferGeometry();
  b.setAttribute("position", new o.Float32BufferAttribute(B, 3));
  const q = new o.Points(b, u);
  Xe(q, e);
  const j = new o.Vector3(), X = b.getAttribute("position");
  return q.onBeforeRender = () => {
    for (let I = 0; I < h; I++)
      e.getVertexPosition(I * P, j), X.setXYZ(I, j.x, j.y, j.z);
    X.needsUpdate = !0;
  }, { overlay: ye(q), parent: e.parent || e };
}
function qt(o, e, u) {
  const p = ge(e) ? new o.SkinnedMesh(e.geometry.clone(), u) : new o.Mesh(e.geometry.clone(), u);
  return ge(e) && (p.bindMode = e.bindMode, p.bind(e.skeleton, e.bindMatrix)), p.matrixAutoUpdate = !1, p.matrix.copy(e.matrixWorld), p.frustumCulled = !1, p;
}
function Xt(o, e, { wireframe: u = !1, vertices: p = !1, wireframeColor: P = null, wireframeOpacity: h = null } = {}) {
  if (!u && !p) return;
  const B = [];
  e.traverse((b) => {
    b.isMesh && b.geometry && !b.userData.omnicamHelper && B.push(b);
  });
  for (const b of B) {
    if (u) {
      const { overlay: q, parent: j } = Ut(o, b, { color: P, opacity: h });
      j.add(q);
    }
    if (p) {
      const { overlay: q, parent: j } = Rt(o, b);
      j.add(q);
    }
  }
}
const $t = 16777215, ne = 0.17, Oe = 3593923, Kt = 0.06;
function Yt(o) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: P, PLYLoader: h, STLLoader: B, neutral: b, wire: q, checkerMaterial: j, objectMaterial: X, applyModelMaterial: I, disposeObject: N, textureFor: re, cardMesh: ee, generatePointField: Z, sampleCamera: E, sampleObjectTransform: se } = o;
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
      const r = String(f?.clip_id ?? "");
      if (t.motionClipId === r) return;
      let l = t.clips.findIndex((s) => (s.name || "").toLowerCase() === r.toLowerCase());
      l < 0 && /^\d+$/.test(r) && (l = Number(r)), (l < 0 || l >= t.clips.length) && (l = 0), t.selectedClip = l, t.motionClipId = r, t.duration = t.clips[l].duration || 0, t.mixer.stopAllAction();
      const c = t.mixer.clipAction(t.clips[l]);
      c.reset(), c.play(), this.invalidate();
    },
    rebuild(D, f, t, r = !1, l = "auto") {
      this.content.traverse((a) => {
        for (const z of [...a.children])
          z.userData.omnicamHelper && (a.remove(z), N(z, !0));
      }), N(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const c = D.render_mode, s = r && ["clay", "motion_proxy", "depth_rich"].includes(l), n = (a, z) => {
        const x = b.clone();
        return x.side = z ? e.FrontSide : e.DoubleSide, a.color && (x.color = new e.Color(a.color)), x;
      }, g = (a) => s || c === "graybox" ? n(a, !!D.backface_culling) : X(a, c, !!D.backface_culling), m = new e.Group();
      m.userData.omnicamCaptureGuide = !0;
      const d = new e.GridHelper(120, 24, 4081496, 3291463);
      d.userData.omnicamCaptureGuide = !0, d.frustumCulled = !1, d.position.y = 5e-4, m.add(d);
      const y = new e.GridHelper(120, 120, 2238001, 1909035);
      y.userData.omnicamCaptureGuide = !0, y.frustumCulled = !1, m.add(y);
      const i = new e.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), G = new e.BufferGeometry().setFromPoints([new e.Vector3(-60, 1e-3, 0), new e.Vector3(60, 1e-3, 0)]), k = new e.Line(G, i);
      k.userData.omnicamCaptureGuide = !0, m.add(k);
      const O = new e.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), M = new e.BufferGeometry().setFromPoints([new e.Vector3(0, 1e-3, -60), new e.Vector3(0, 1e-3, 60)]), A = new e.Line(M, O);
      A.userData.omnicamCaptureGuide = !0, m.add(A), this.content.add(m);
      const S = r && l === "depth_rich";
      if (["omni_ref", "point_field"].includes(c) || S) {
        const a = D.objects.filter((v) => v.enabled !== !1 && !["sun_light", "point_light", "spot_light", "null"].includes(v.type)).length, z = S && a <= 1 && (!D.point_density || D.point_density === "none") ? "sparse" : c === "omni_ref" && (!D.point_density || D.point_density === "none") ? "balanced" : D.point_density || "balanced", { points: x, colors: W } = Z(z, D.point_spread || "all_views", D.point_color || null);
        if (x.length > 0) {
          const v = new e.BufferGeometry();
          v.setAttribute("position", new e.Float32BufferAttribute(x, 3)), v.setAttribute("color", new e.Float32BufferAttribute(W, 3));
          const C = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), _ = new e.Points(v, C);
          _.frustumCulled = !1, this.content.add(_);
        }
      }
      if (!["grid", "point_field"].includes(c))
        for (const a of D.objects) {
          if (a.enabled === !1) continue;
          const z = a.size || [1, 1, 1];
          let x;
          if (a.type === "glb" || a.type === "model") {
            const v = t.get(a.id), C = this.models.get(a.id), _ = a.format || (a.type === "glb" ? "glb" : "");
            v && (C?.url !== v || C?.format !== _) && this.loadModel(a.id, v, _);
            const T = !!D.backface_culling, F = r && l === "clay" || c === "graybox" ? "neutral" : c === "wireframe" ? "wireframe" : vt(a, D, r) ?? (a.material_mode || "textured");
            C?.url === v && (x = C.scene, I(x, F, a, T));
          } else if (a.type === "sphere")
            x = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), g(a));
          else if (a.type === "cylinder")
            x = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), g(a));
          else if (a.type === "torus") {
            const v = new e.TorusGeometry(0.5, 0.2, 16, 32);
            v.rotateX(Math.PI / 2), x = new e.Mesh(v, g(a));
          } else if (a.type === "pyramid") {
            const v = new e.ConeGeometry(0.7, 1, 4);
            v.rotateY(Math.PI / 4), x = new e.Mesh(v, g(a));
          } else if (a.type === "sun_light") {
            const v = new e.Group(), C = new e.DirectionalLight(a.color || 16774892, a.intensity ?? 2.2);
            C.castShadow = a.cast_shadow !== !1, C.castShadow && (C.shadow.mapSize.set(1024, 1024), C.shadow.bias = -8e-4, C.shadow.normalBias = 0.02, C.shadow.radius = 2.4, C.shadow.camera.near = 0.5, C.shadow.camera.far = 70, C.shadow.camera.left = C.shadow.camera.bottom = -14, C.shadow.camera.right = C.shadow.camera.top = 14);
            const _ = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), T = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(_[0], _[1], _[2], "YXZ"));
            C.target.position.copy(C.position).add(T.multiplyScalar(10)), v.add(C, C.target);
            const F = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16096779, wireframe: !0 })
            );
            F.userData.omnicamLightHelper = !0, F.visible = !r, v.add(F), x = v;
          } else if (a.type === "point_light") {
            const v = new e.Group(), C = new e.PointLight(a.color || 16777215, a.intensity ?? 2, 0, 2);
            v.add(C);
            const _ = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16498468, wireframe: !0 })
            );
            _.userData.omnicamLightHelper = !0, _.visible = !r, v.add(_), x = v;
          } else if (a.type === "spot_light") {
            const v = new e.Group(), C = (a.cone_angle ?? 45) * Math.PI / 180, _ = a.penumbra ?? 0.25, T = new e.SpotLight(a.color || 16777215, a.intensity ?? 3, 0, C, _, 2), F = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), $ = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(F[0], F[1], F[2], "YXZ"));
            T.target.position.copy(T.position).add($.multiplyScalar(10)), v.add(T, T.target);
            const K = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: a.color || 3718648, wireframe: !0 })
            );
            K.userData.omnicamLightHelper = !0, K.visible = !r, v.add(K), x = v;
          } else if (a.type === "human")
            x = new e.Mesh(Pt(e), g(a));
          else if (a.type === "ground") x = new e.Mesh(new e.BoxGeometry(1, 1, 1), g(a));
          else if (a.type === "card")
            if (!["graybox", "wireframe"].includes(c) && (!a.material_mode || ["textured", "wireframe_texture"].includes(a.material_mode)))
              x = ee(a, f.get(a.id), D.card_fit || "contain");
            else {
              const C = c === "wireframe" ? new e.PlaneGeometry(z[0], z[1], 4, 4) : new e.PlaneGeometry(z[0], z[1]);
              x = new e.Mesh(C, g(a));
            }
          else if (a.type === "null") {
            const v = new e.AxesHelper(0.5);
            v.position.fromArray(a.position || [0, 0, 0]), v.userData.omnicamId = a.id, v.frustumCulled = !1, this.objectNodes.set(a.id, v), this.content.add(v);
            continue;
          } else
            x = new e.Mesh(new e.BoxGeometry(1, 1, 1), g(a));
          if (!x) continue;
          x.position.fromArray(a.position || [0, 0, 0]), x.rotation.set(...(a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const W = ["sun_light", "point_light", "spot_light"].includes(a.type);
          if (a.type !== "card" && !W && x.scale.fromArray(z), x.userData.omnicamId = a.id, x.frustumCulled = !1, x.traverse((v) => {
            v.frustumCulled = !1, v.userData.omnicamId = a.id;
          }), !W) {
            const v = !!(D.show_wireframe || c === "wireframe" || D.render_mode === "wireframe_texture" || a.material_mode === "wireframe_texture" || a.material_mode === "wireframe_neutral");
            Xt(e, x, { wireframe: v, vertices: D.show_vertices });
          }
          this.objectNodes.set(a.id, x), this.content.add(x);
        }
    },
    rebuildPath(D, f = "camera", t = null, r = "", l = null) {
      const c = Array.isArray(l) ? new Set(l) : null;
      N(this.path), this.path.clear();
      const s = r === "camera" ? D.active_camera_id : null, n = [
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
      (D.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: D.keyframes || [] }]).forEach((d, y) => {
        const i = d.keyframes || [];
        if (i.length === 0 || d.id === s) return;
        const G = d.color ? { line: new e.Color(d.color), marker: new e.Color(d.color), frustum: new e.Color(d.color) } : n[y % n.length], k = d.id === D.active_camera_id, O = k && f === "camera";
        if (i.length >= 2) {
          const M = i[0].frame, A = i[i.length - 1].frame, S = Math.max(32, Math.min(256, A - M + 1)), a = { ...d, keyframes: i, objects: D.objects }, z = Array.from({ length: S }, (_, T) => {
            const F = M + (A - M) * T / Math.max(1, S - 1);
            return new e.Vector3().fromArray(E(a, F, D.objects).position);
          }), x = new e.CatmullRomCurve3(z, !1, "centripetal"), W = O ? 0.06 : k ? 0.045 : 0.025, v = new e.MeshBasicMaterial({
            color: G.line,
            transparent: !0,
            opacity: k ? 1 : 0.55,
            depthTest: !1
          }), C = new e.Mesh(new e.TubeGeometry(x, Math.max(48, S), W, 8, !1), v);
          if (C.renderOrder = 900, C.userData.omnicamWidget = "path", k && !d.locked && (C.userData.omnicamPathSegments = {
            cameraId: d.id,
            firstFrame: M,
            lastFrame: A,
            frames: i.map((_) => _.frame),
            points: z.map((_) => [_.x, _.y, _.z])
          }), this.path.add(C), k) {
            const _ = new e.Mesh(
              new e.TubeGeometry(x, Math.max(48, S), W * (O ? 3 : 2.4), 8, !1),
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
        for (const M of i) {
          const A = i.indexOf(M), S = k, a = new e.Mesh(
            new e.SphereGeometry(S ? ne : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: S ? $t : G.marker, depthTest: !1 })
          );
          a.position.fromArray(M.camera.position), a.renderOrder = 910, a.userData.omnicamPathKey = { cameraId: d.id, frame: M.frame }, a.userData.omnicamWidget = "path", this.path.add(a);
          const z = new e.Mesh(
            new e.RingGeometry((S ? ne : 0.085) * 1.3, (S ? ne : 0.085) * 1.7, 24),
            new e.MeshBasicMaterial({ color: S ? 16777215 : G.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          z.position.fromArray(M.camera.position), z.renderOrder = 909, z.userData.omnicamBillboard = !0, z.userData.omnicamWidget = "path", this.path.add(z);
          const x = new e.Vector3().fromArray(M.camera.position), W = new e.Vector3().fromArray(M.camera.target || [0, 0, 0]), v = k && t != null && M.frame === t, C = k && !v && c?.has(M.frame);
          if (v) {
            const _ = new e.Mesh(
              new e.RingGeometry(ne * 2.1, ne * 2.6, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            _.position.fromArray(M.camera.position), _.renderOrder = 911, _.userData.omnicamBillboard = !0, _.userData.omnicamWidget = "path", this.path.add(_);
          } else if (C) {
            const _ = new e.Mesh(
              new e.RingGeometry(ne * 1.9, ne * 2.2, 24),
              new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.85, depthTest: !1 })
            );
            _.position.fromArray(M.camera.position), _.renderOrder = 911, _.userData.omnicamBillboard = !0, _.userData.omnicamWidget = "path", this.path.add(_);
          }
          if (v) {
            const _ = W.clone().sub(x).normalize();
            let T = new e.Vector3().crossVectors(_, new e.Vector3(0, 1, 0));
            T.lengthSq() < 1e-8 ? T.set(1, 0, 0) : T.normalize();
            const F = new e.Vector3().crossVectors(T, _).normalize(), $ = e.MathUtils.clamp(x.distanceTo(W) * 0.08, 0.25, 0.8), K = M.camera.camera_type === "orthographic" ? $ * 0.55 : $ * Math.tan(e.MathUtils.degToRad(M.camera.fov || 35) * 0.5), te = K * (D.width || 16) / Math.max(1, D.height || 9), Q = x.clone().addScaledVector(_, $), U = [
              Q.clone().addScaledVector(T, -te).addScaledVector(F, -K),
              Q.clone().addScaledVector(T, te).addScaledVector(F, -K),
              Q.clone().addScaledVector(T, te).addScaledVector(F, K),
              Q.clone().addScaledVector(T, -te).addScaledVector(F, K)
            ], J = [];
            for (const Y of U) J.push(x, Y);
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
              position: x,
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
              radius: e.MathUtils.clamp(x.distanceTo(W) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            _.userData.omnicamWidget = "lookat", this.path.add(_);
            const T = new e.Line(
              new e.BufferGeometry().setFromPoints([x.clone(), W.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            T.renderOrder = 914, T.userData.omnicamWidget = "lookat", this.path.add(T);
          }
          if (v) {
            const _ = Dt(M, i[A - 1] || null, i[A + 1] || null);
            for (const T of ["in", "out"]) {
              const F = new e.Vector3().fromArray(_[T]), $ = new e.Line(
                new e.BufferGeometry().setFromPoints([x.clone(), F.clone()]),
                new e.LineBasicMaterial({ color: Oe, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              $.renderOrder = 912, $.userData.omnicamWidget = "gizmo", this.path.add($);
              const K = new e.Mesh(
                new e.SphereGeometry(Kt, 12, 8),
                new e.MeshBasicMaterial({ color: Oe, depthTest: !1 })
              );
              K.position.copy(F), K.renderOrder = 913, K.userData.omnicamCurveHandle = { cameraId: d.id, frame: M.frame, side: T }, K.userData.omnicamWidget = "gizmo", this.path.add(K);
            }
          }
        }
      });
      const m = [16742005, 52937, 16632686, 7101671, 14774357];
      (D.objects || []).forEach((d, y) => {
        const i = d.keyframes || [];
        if (i.length < 2) return;
        const G = d.color ? new e.Color(d.color) : m[y % m.length], k = i.map((A) => new e.Vector3().fromArray(A.transform?.position || [0, 0, 0])), O = new e.CatmullRomCurve3(k, !1, "centripetal"), M = new e.Mesh(
          new e.TubeGeometry(O, Math.max(32, i.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: G, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        M.renderOrder = 900, M.userData.omnicamWidget = "path", this.path.add(M);
        for (const A of i) {
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
function Ht(o) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: P, PLYLoader: h, STLLoader: B, neutral: b, wire: q, checkerMaterial: j, objectMaterial: X, applyModelMaterial: I, disposeObject: N, textureFor: re, cardMesh: ee, generatePointField: Z, sampleCamera: E, sampleObjectTransform: se, hasOutlineMesh: D } = o;
  return {
    updateLiveCameras(f, t, r, l, c = "camera", s = null) {
      if (N(this.liveCameras), this.liveCameras.clear(), r) return;
      const n = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (f.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: f.keyframes || [] }]).forEach((m, d) => {
        const y = m.color ? { line: new e.Color(m.color), marker: new e.Color(m.color), frustum: new e.Color(m.color), body: new e.Color(m.color).multiplyScalar(0.35) } : n[d % n.length], i = m.id === f.active_camera_id, G = i && c === "camera", k = l === "camera" && i, O = E(m, t, f.objects), M = new e.Vector3().fromArray(O.position || [0, 0, 0]), A = new e.Vector3().fromArray(O.target || [0, 0, 0]), S = A.clone().sub(M), a = S.length();
        a < 1e-4 ? S.set(0, 0, -1) : S.normalize();
        let z = new e.Vector3(0, 1, 0), x = new e.Vector3().crossVectors(S, z);
        x.lengthSq() < 1e-6 && (z = new e.Vector3(0, 0, 1), x = new e.Vector3().crossVectors(S, z)), x.normalize();
        let W = new e.Vector3().crossVectors(x, S).normalize();
        if (O.roll) {
          const C = e.MathUtils.degToRad(O.roll);
          x.applyAxisAngle(S, C), W.applyAxisAngle(S, C);
        }
        const v = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!k) {
          const C = new e.Group(), _ = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: y.body, roughness: 0.4, metalness: 0.8 })
          );
          _.position.set(0, 0, -0.11), C.add(_);
          const T = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          T.rotateX(Math.PI / 2);
          const F = new e.Mesh(
            T,
            new e.MeshStandardMaterial({ color: y.marker, roughness: 0.2, metalness: 0.9 })
          );
          F.position.set(0, 0, 0.05), C.add(F);
          const $ = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: i ? 16729156 : y.marker })
          );
          $.position.set(0, 0.07, -0.08), C.add($);
          const K = new e.Matrix4().makeBasis(x, W, S.clone().negate());
          C.quaternion.setFromRotationMatrix(K), C.position.copy(M), C.userData.omnicamWidget = "gizmo", this.liveCameras.add(C);
          const te = new e.SphereGeometry(0.35, 8, 6), Q = new e.Mesh(te, v);
          Q.position.copy(M), Q.userData = { omnicamType: "camera", omnicamId: m.id }, this.liveCameras.add(Q);
          const U = e.MathUtils.clamp(a * 0.25, 0.5, 2.5), J = O.camera_type === "orthographic" ? 5 / Math.max(0.01, O.zoom || 1) * 0.35 : U * Math.tan(e.MathUtils.degToRad(O.fov || 35) * 0.5), w = J * (f.width || 16) / Math.max(1, f.height || 9), L = M.clone().addScaledVector(S, U), V = [
            L.clone().addScaledVector(x, -w).addScaledVector(W, -J),
            L.clone().addScaledVector(x, w).addScaledVector(W, -J),
            L.clone().addScaledVector(x, w).addScaledVector(W, J),
            L.clone().addScaledVector(x, -w).addScaledVector(W, J)
          ], R = [];
          for (const de of V) R.push(M, de);
          for (let de = 0; de < 4; de++) R.push(V[de], V[(de + 1) % 4]);
          const Y = V[2].clone().add(V[3]).multiplyScalar(0.5).clone().addScaledVector(W, J * 0.25);
          R.push(V[2], Y, Y, V[3]);
          const ue = new e.BufferGeometry().setFromPoints(R), le = new e.LineSegments(ue, new e.LineBasicMaterial({
            color: G ? y.marker : y.frustum,
            linewidth: i ? 2 : 1,
            transparent: !0,
            opacity: i ? 1 : 0.6
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
            color: G ? y.marker : y.frustum,
            transparent: !0,
            opacity: 0.12,
            depthTest: !1,
            side: e.DoubleSide
          }));
          Ge.userData.omnicamWidget = "gizmo", this.liveCameras.add(Ge);
        }
        if (a > 0.01) {
          const C = i && c === "camera_target", _ = new e.BufferGeometry().setFromPoints([M, A]), T = new e.Line(_, new e.LineDashedMaterial({
            color: G || C ? 9133302 : y.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: G || C ? 1 : i ? 0.75 : 0.4
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
            color: C || G ? 9133302 : y.marker,
            linewidth: C ? 3 : 1,
            transparent: !0,
            opacity: C || G ? 1 : i ? 0.9 : 0.5
          }));
          te.userData.omnicamWidget = "lookat", this.liveCameras.add(te);
          const Q = new e.SphereGeometry(0.28, 8, 6), U = new e.Mesh(Q, v);
          if (U.position.copy(A), U.userData = { omnicamType: "camera_target", omnicamId: m.id }, this.liveCameras.add(U), (C || G) && l !== "camera") {
            const J = new e.RingGeometry(0.14, 0.18, 24);
            J.rotateX(Math.PI / 2);
            const w = new e.MeshBasicMaterial({ color: Me.typeLookAt, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), L = new e.Mesh(J, w);
            L.position.copy(A), L.userData.omnicamWidget = "lookat", this.liveCameras.add(L);
          }
        }
        if (i && l !== "camera" && c === "camera") {
          const C = new e.RingGeometry(0.19, 0.24, 32);
          C.rotateX(Math.PI / 2);
          const _ = new e.MeshBasicMaterial({ color: Me.accent, side: e.DoubleSide, transparent: !0, opacity: 1 }), T = new e.Mesh(C, _);
          T.position.copy(M), T.userData.omnicamWidget = "gizmo", this.liveCameras.add(T);
          const F = new e.RingGeometry(0.28, 0.31, 32);
          F.rotateX(Math.PI / 2);
          const $ = new e.Mesh(F, new e.MeshBasicMaterial({ color: Me.accent, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          $.position.copy(M), $.userData.omnicamWidget = "gizmo", this.liveCameras.add($);
        }
      });
    },
    updateSelection(f, t, r, l = null, c = "", s = !1) {
      const n = l ? `${l.mode || ""}:${l.objectId || ""}:${(l.point || []).join(",")}` : "", g = `${t}:${r || ""}:${(f.__selectedObjectIds || []).join(",")}:${c}:${n}:${s ? "ortho" : "persp"}`;
      if (g !== this.selectionKey) {
        if (this.selectionKey = g, N(this.selectionGroup), this.selectionGroup.clear(), t === "object" && r) {
          const m = this.objectNodes.get(r);
          if (m) {
            m.updateMatrixWorld(!0);
            try {
              const d = new e.Box3(), y = [];
              if (m.traverse((i) => {
                i.isBone && y.push(i);
              }), y.length > 0) {
                const i = new e.Vector3();
                for (const G of y)
                  G.getWorldPosition(i), d.expandByPoint(i);
                d.expandByScalar(0.2);
              } else
                d.setFromObject(m);
              if ((s || !D(m)) && !d.isEmpty() && Number.isFinite(d.min.x) && Number.isFinite(d.max.x) && Number.isFinite(d.min.y) && Number.isFinite(d.max.y) && Number.isFinite(d.min.z) && Number.isFinite(d.max.z)) {
                d.expandByScalar(0.04);
                const i = new e.Box3Helper(d, new e.Color(9133302));
                i.material.transparent = !0, i.material.opacity = 0.95, i.material.depthTest = !1, i.renderOrder = 9999, this.selectionGroup.add(i);
              }
            } catch {
            }
            if (f.show_wireframe) {
              let d = 0;
              m.traverse((y) => {
                if (!y.isMesh || !y.geometry || y.userData.omnicamHelper || d >= 64) return;
                const i = qt(e, y, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                i.renderOrder = 9998, this.selectionGroup.add(i), d += 1;
              });
            }
            if (l && l.objectId === r && l.point) {
              if (l.mode === "vertex") {
                const d = new e.SphereGeometry(0.08, 16, 12), y = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), i = new e.Mesh(d, y);
                i.position.fromArray(l.point), i.renderOrder = 1e4, this.selectionGroup.add(i);
                const G = new e.RingGeometry(0.1, 0.15, 24), k = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), O = new e.Mesh(G, k);
                O.position.fromArray(l.point), this.activeCamera && O.quaternion.copy(this.activeCamera.quaternion), O.renderOrder = 1e4, this.selectionGroup.add(O);
              } else if (l.mode === "edge" && l.edge) {
                const [d, y] = l.edge, i = new e.BufferGeometry().setFromPoints([new e.Vector3(...d), new e.Vector3(...y)]), G = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), k = new e.Line(i, G);
                k.renderOrder = 1e4, this.selectionGroup.add(k);
              } else if (l.mode === "face" && l.vertices) {
                const [d, y, i] = l.vertices, G = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...d),
                  new e.Vector3(...y),
                  new e.Vector3(...i)
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
                const M = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...d),
                  new e.Vector3(...y),
                  new e.Vector3(...i),
                  new e.Vector3(...d)
                ]), A = new e.Line(M, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                A.renderOrder = 10001, this.selectionGroup.add(A);
              }
            }
          }
        }
        if (t === "object")
          for (const m of f.__selectedObjectIds || []) {
            if (m === r) continue;
            const d = this.objectNodes.get(m);
            if (d) {
              d.updateMatrixWorld(!0);
              try {
                const y = new e.Box3().setFromObject(d);
                if ((s || !D(d)) && !y.isEmpty() && Number.isFinite(y.min.x)) {
                  y.expandByScalar(0.04);
                  const i = new e.Box3Helper(y, new e.Color(10980346));
                  i.material.transparent = !0, i.material.opacity = 0.6, i.material.depthTest = !1, i.renderOrder = 9997, this.selectionGroup.add(i);
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
      const r = [], l = /* @__PURE__ */ new Set();
      return t.traverse((c) => {
        const s = c.isBone ? c.name : "";
        !s || l.has(s) || r.length >= 256 || (l.add(s), r.push(s));
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
    sampleModelPoint(f, t, r, l = 24) {
      const c = this.objectNodes.get(f);
      if (!c) return null;
      const s = this.models.get(f), n = s?.mixer && s.duration > 0, g = n ? s.mixer.time : null;
      n && (s.mixer.setTime(Math.max(0, r) / Math.max(1, l) % s.duration), c.updateMatrixWorld(!0));
      let m = null;
      if (t) {
        let d = null;
        if (c.traverse((y) => {
          !d && y.isBone && y.name === t && (d = y);
        }), d) {
          const y = new e.Vector3().setFromMatrixPosition(d.matrixWorld);
          m = [y.x, y.y, y.z];
        }
      } else
        m = this.getObjectWorldCenter(f);
      return n && Number.isFinite(g) && (s.mixer.setTime(g), c.updateMatrixWorld(!0)), m;
    },
    getObjectWorldBounds(f) {
      const t = this.objectNodes.get(f);
      if (!t) return null;
      t.updateWorldMatrix(!0, !0);
      const r = new e.Box3().setFromObject(t, !0), l = r.min.toArray(), c = r.max.toArray();
      return !r.isEmpty() && [...l, ...c].every(Number.isFinite) ? { min: l, max: c } : null;
    },
    getObjectWorldCenter(f) {
      const t = this.objectNodes.get(f);
      if (!t) return null;
      t.updateMatrixWorld(!0);
      const r = [];
      if (t.traverse((s) => {
        s.isBone && r.push(s);
      }), r.length > 0) {
        const s = new e.Vector3(), n = new e.Vector3();
        for (const g of r)
          g.getWorldPosition(n), s.add(n);
        return s.divideScalar(r.length), [s.x, s.y, s.z];
      }
      const l = new e.Box3().setFromObject(t);
      if (!l.isEmpty() && Number.isFinite(l.min.x)) {
        const s = l.getCenter(new e.Vector3());
        return [s.x, s.y, s.z];
      }
      const c = new e.Vector3();
      return t.getWorldPosition(c), [c.x, c.y, c.z];
    },
    /** Every bone name in a loaded model, for the Rig Mapper (design spec 23). */
    getModelBoneNames(f) {
      const t = this.objectNodes.get(f);
      if (!t) return [];
      const r = [];
      return t.traverse((l) => {
        l.isBone && l.name && r.push(l.name);
      }), r;
    },
    /** Resolve one loaded bone by name, plus its world position. */
    resolveModelBone(f, t) {
      const r = this.objectNodes.get(f);
      if (!r || !t) return null;
      let l = null;
      if (r.traverse((s) => {
        !l && s.isBone && s.name === t && (l = s);
      }), !l) return null;
      l.updateWorldMatrix(!0, !1);
      const c = new e.Vector3();
      return l.getWorldPosition(c), { name: t, world: [c.x, c.y, c.z] };
    },
    /**
     * Apply an FK pose to a loaded character (design spec section 29,
     * ui.characterRuntime.applyPose). `boneMap` is canonical joint -> bone name;
     * `joints` is canonical joint -> local quaternion [x,y,z,w]. Bones not named
     * by `joints` are left at their bind rotation, captured once per bone.
     */
    applyCharacterPose(f, t, r) {
      const l = this.objectNodes.get(f);
      if (!l) return !1;
      const c = /* @__PURE__ */ new Map();
      if (l.traverse((n) => {
        n.isBone && n.name && c.set(n.name, n);
      }), !c.size) return !1;
      for (const n of c.values())
        n.userData.omnicamBindQuat || (n.userData.omnicamBindQuat = n.quaternion.clone());
      const s = r && typeof r == "object" ? r : {};
      for (const [n, g] of Object.entries(t || {})) {
        const m = c.get(g);
        if (!m) continue;
        const d = s[n];
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
      const r = this.objectNodes.get(f);
      if (!r || !t) return {};
      const l = /* @__PURE__ */ new Map();
      r.traverse((s) => {
        s.isBone && s.name && l.set(s.name, s);
      });
      const c = {};
      for (const [s, n] of Object.entries(t)) {
        const g = l.get(n);
        if (!g) continue;
        const m = g.userData.omnicamBindQuat;
        m && g.quaternion.angleTo(m) < 1e-4 || (c[s] = g.quaternion.toArray());
      }
      return c;
    }
  };
}
function Qt(o) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: P, PLYLoader: h, STLLoader: B, neutral: b, wire: q, checkerMaterial: j, objectMaterial: X, applyModelMaterial: I, disposeObject: N, textureFor: re, cardMesh: ee, generatePointField: Z, sampleCamera: E, sampleObjectTransform: se } = o;
  function D(f) {
    const t = f.supersampleFactor?.() || 1;
    return { w: f.canvas.width / t, h: f.canvas.height / t };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(f) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = D(this);
      this.pointer.set(f[0] / t * 2 - 1, -(f[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const n of this.raycaster.intersectObjects(this.path.children, !0)) {
        const g = gt(n);
        if (g) return { ...g, position: n.object.position.toArray() };
      }
      const l = 16 * Math.min(2, window.devicePixelRatio || 1);
      let c = null;
      const s = new e.Vector3();
      for (const n of this.path.children) {
        const g = n.userData?.omnicamPathKey;
        if (!g || (s.copy(n.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const m = (s.x * 0.5 + 0.5) * t, d = (1 - (s.y * 0.5 + 0.5)) * r, y = Math.hypot(f[0] - m, f[1] - d);
        y <= l && (!c || y < c.distance) && (c = { key: g, position: n.position.toArray(), distance: y });
      }
      return c ? { ...c.key, position: c.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(f) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = D(this);
      this.pointer.set(f[0] / t * 2 - 1, -(f[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const n of this.raycaster.intersectObjects(this.path.children, !0)) {
        const g = wt(n);
        if (g) return { ...g, position: n.object.position.toArray() };
      }
      const l = 14 * Math.min(2, window.devicePixelRatio || 1);
      let c = null;
      const s = new e.Vector3();
      for (const n of this.path.children) {
        const g = n.userData?.omnicamCurveHandle;
        if (!g || (s.copy(n.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const m = (s.x * 0.5 + 0.5) * t, d = (1 - (s.y * 0.5 + 0.5)) * r, y = Math.hypot(f[0] - m, f[1] - d);
        y <= l && (!c || y < c.distance) && (c = { handle: g, position: n.position.toArray(), distance: y });
      }
      return c ? { ...c.handle, position: c.position } : null;
    },
    /**
     * The active camera-path segment (two neighbouring real keyframes, plus
     * a `t` 0..1 between them) nearest the pointer, for double-click-to-
     * insert (Task 8). `null` when the pointer isn't over the path tube.
     */
    pickPathSegment(f) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = D(this);
      this.pointer.set(f[0] / t * 2 - 1, -(f[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const l = this.raycaster.intersectObjects(this.path.children, !0).find((M) => M.object.userData?.omnicamPathSegments);
      if (!l) return null;
      const { cameraId: c, firstFrame: s, lastFrame: n, frames: g, points: m } = l.object.userData.omnicamPathSegments;
      if (!m?.length || g.length < 2) return null;
      let d = 0, y = 1 / 0;
      for (let M = 0; M < m.length; M += 1) {
        const [A, S, a] = m[M], z = A - l.point.x, x = S - l.point.y, W = a - l.point.z, v = z * z + x * x + W * W;
        v < y && (y = v, d = M);
      }
      const i = s + (n - s) * d / Math.max(1, m.length - 1);
      let G = g[0], k = g[g.length - 1];
      for (let M = 0; M < g.length - 1; M += 1)
        if (g[M] <= i && i <= g[M + 1]) {
          G = g[M], k = g[M + 1];
          break;
        }
      if (G === k) return null;
      const O = Math.min(1, Math.max(0, (i - G) / (k - G)));
      return { cameraId: c, leftFrame: G, rightFrame: k, t: O };
    },
    configureCamera(f, t) {
      const r = f || defaultCamera(), l = Math.max(5e-4, Number(r.near) || 0.01), c = Math.max(l + 1, Number(r.far) || 1e4);
      let s;
      if (r.camera_type === "orthographic") {
        s = this.orthographic;
        const i = 5 / Math.max(0.01, r.zoom || 1);
        s.left = -i * t, s.right = i * t, s.top = i, s.bottom = -i, s.near = l, s.far = c, s.updateProjectionMatrix();
      } else
        s = this.perspective, s.fov = e.MathUtils.clamp(Number(r.fov) || 35, 1, 175), s.aspect = t, s.near = l, s.far = c, s.updateProjectionMatrix();
      const n = new e.Vector3().fromArray(r.position || [6, 4, 6]), g = new e.Vector3().fromArray(r.target || [0, 1.5, 0]), m = g.clone().sub(n);
      m.lengthSq() < 1e-6 ? m.set(0, 0, -1) : m.normalize();
      let d = r.up ? new e.Vector3().fromArray(r.up) : new e.Vector3(0, 1, 0), y = new e.Vector3().crossVectors(m, d);
      if (y.lengthSq() < 1e-6 && (d = Math.abs(m.y) > 0.9 ? new e.Vector3(0, 0, m.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), y.crossVectors(m, d)), y.normalize(), d.crossVectors(y, m).normalize(), r.roll) {
        const i = e.MathUtils.degToRad(r.roll);
        y.applyAxisAngle(m, i), d.applyAxisAngle(m, i);
      }
      return s.position.copy(n), s.up.copy(d), s.lookAt(g), s.updateMatrixWorld(), s;
    },
    pick(f, t, r, l) {
      if (!this.activeCamera) return null;
      this.pointer.set(f / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const c = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const s of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          s.object?.userData?.omnicamType && c.push({
            distance: s.distance,
            type: s.object.userData.omnicamType,
            id: s.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const s of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (s.object?.userData?.omnicamCaptureGuide || s.object?.userData?.omnicamHelper) continue;
          let n = s.object;
          for (; n && !n.userData?.omnicamId; ) n = n.parent;
          n?.userData?.omnicamId && c.push({
            distance: s.distance,
            type: "object",
            id: n.userData.omnicamId
          });
        }
      return c.length ? (c.sort((s, n) => s.distance - n.distance), { type: c[0].type, id: c[0].id }) : null;
    },
    /**
     * World point -> screen pixels, for the DOM label overlay and playblast
     * canvas (design spec section 14). `behind` is true when the point is
     * outside the near/far clip and the caller should hide its label.
     *
     * @param world   - [x, y, z] world-space position
     * @param width   - Optional explicit output width in the caller's pixel
     *                  space. When omitted, logicalSize(this) is used.
     * @param height  - Optional explicit output height in the caller's pixel
     *                  space. When omitted, logicalSize(this) is used.
     *
     * Pass the canvas' CSS clientWidth/clientHeight for DOM overlays so that
     * the returned coordinates are in CSS pixels and can be used directly for
     * element.style.transform positioning.  Pass the 2D canvas buffer width/
     * height for playblast canvas draws so that coordinates match the buffer.
     */
    projectWorldToScreen(f, t = null, r = null) {
      if (!this.activeCamera || !Array.isArray(f) || f.length < 3) return null;
      const { w: l, h: c } = D(this), s = t != null && r != null ? t : l, n = t != null && r != null ? r : c, g = new e.Vector3(Number(f[0]) || 0, Number(f[1]) || 0, Number(f[2]) || 0);
      return g.project(this.activeCamera), {
        x: (g.x * 0.5 + 0.5) * s,
        y: (1 - (g.y * 0.5 + 0.5)) * n,
        behind: g.z < -1 || g.z > 1,
        width: s,
        height: n
      };
    },
    pickSubElement(f, t, r, l, c = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(f / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const s = this.raycaster.intersectObjects(this.content.children, !0);
      for (const n of s) {
        let g = n.object, m = n.object;
        for (; g && !g.userData.omnicamId; ) g = g.parent;
        if (!g?.userData.omnicamId || !m.geometry) continue;
        const d = g.userData.omnicamId, i = m.geometry.getAttribute("position");
        if (!i) continue;
        m.updateMatrixWorld(!0);
        const G = m.matrixWorld;
        if (c === "vertex") {
          let k = -1, O = 1 / 0, M = null;
          if (n.face) {
            const A = [n.face.a, n.face.b, n.face.c];
            for (const S of A) {
              const a = new e.Vector3(i.getX(S), i.getY(S), i.getZ(S)).applyMatrix4(G), z = a.distanceTo(n.point);
              z < O && (O = z, k = S, M = [a.x, a.y, a.z]);
            }
          } else
            for (let A = 0; A < i.count; A++) {
              const S = new e.Vector3(i.getX(A), i.getY(A), i.getZ(A)).applyMatrix4(G), a = S.distanceTo(n.point);
              a < O && (O = a, k = A, M = [S.x, S.y, S.z]);
            }
          if (M)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: d,
              index: k,
              point: M
            };
        }
        if (c === "edge" && n.face) {
          const k = new e.Vector3(i.getX(n.face.a), i.getY(n.face.a), i.getZ(n.face.a)).applyMatrix4(G), O = new e.Vector3(i.getX(n.face.b), i.getY(n.face.b), i.getZ(n.face.b)).applyMatrix4(G), M = new e.Vector3(i.getX(n.face.c), i.getY(n.face.c), i.getZ(n.face.c)).applyMatrix4(G), A = (W, v, C) => {
            const _ = new e.Line3(v, C), T = new e.Vector3();
            return _.closestPointToPoint(W, !0, T), { dist: W.distanceTo(T), point: T, segment: [v, C] };
          }, S = A(n.point, k, O), a = A(n.point, O, M), z = A(n.point, M, k), x = [S, a, z].reduce((W, v) => v.dist < W.dist ? v : W);
          return {
            type: "edge",
            mode: "edge",
            objectId: d,
            point: [x.point.x, x.point.y, x.point.z],
            edge: [
              [x.segment[0].x, x.segment[0].y, x.segment[0].z],
              [x.segment[1].x, x.segment[1].y, x.segment[1].z]
            ]
          };
        }
        if (c === "face" && n.face) {
          const k = new e.Vector3(i.getX(n.face.a), i.getY(n.face.a), i.getZ(n.face.a)).applyMatrix4(G), O = new e.Vector3(i.getX(n.face.b), i.getY(n.face.b), i.getZ(n.face.b)).applyMatrix4(G), M = new e.Vector3(i.getX(n.face.c), i.getY(n.face.c), i.getZ(n.face.c)).applyMatrix4(G), A = new e.Vector3().add(k).add(O).add(M).divideScalar(3), S = n.face.normal.clone().transformDirection(G);
          return {
            type: "face",
            mode: "face",
            objectId: d,
            faceIndex: n.faceIndex,
            point: [A.x, A.y, A.z],
            normal: [S.x, S.y, S.z],
            vertices: [
              [k.x, k.y, k.z],
              [O.x, O.y, O.z],
              [M.x, M.y, M.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(f, t, r, l) {
      if (!this.activeCamera) return null;
      this.pointer.set(f / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const c = this.raycaster.intersectObjects(this.content.children, !0);
      if (c.length > 0)
        return [c[0].point.x, c[0].point.y, c[0].point.z];
      const s = new e.Plane(new e.Vector3(0, 1, 0), 0), n = new e.Vector3();
      return this.raycaster.ray.intersectPlane(s, n) ? [n.x, n.y, n.z] : null;
    }
  };
}
const xe = ["high", "balanced", "low"], Zt = 25, Te = 30, Jt = 0.6;
function ke(o = "balanced") {
  return { quality: o, samples: [], downgraded: !1 };
}
function Et(o) {
  const e = xe.indexOf(o);
  return e < 0 || e >= xe.length - 1 ? null : xe[e + 1];
}
function er(o, e) {
  if (!Number.isFinite(e) || e < 0 || (o.samples.push(e), o.samples.length > Te && o.samples.shift(), o.samples.length < Te) || o.samples.filter((P) => P > Zt).length / o.samples.length < Jt) return null;
  const p = Et(o.quality);
  return p ? (o.quality = p, o.downgraded = !0, o.samples = [], p) : null;
}
function tr(o, e) {
  return o.quality = e, o.samples = [], o.downgraded = !1, o;
}
function rr(o) {
  const { THREE: e, FBXLoader: u, GLTFLoader: p, OBJLoader: P, PLYLoader: h, STLLoader: B, neutral: b, wire: q, checkerMaterial: j, objectMaterial: X, applyModelMaterial: I, disposeObject: N, textureFor: re, cardMesh: ee, generatePointField: Z, sampleCamera: E, sampleObjectTransform: se, hasOutlineMesh: D, SelectionOutlineRenderer: f } = o;
  return {
    render(t, r, l, c, s, n = /* @__PURE__ */ new Map(), g = 0, m = !1, d = "camera", y = "subject", i = null, G = null, k = null, O = "auto") {
      const M = m && O === "clay" ? !0 : m && (O === "motion_proxy" || O === "depth_rich") ? !1 : !m || (t.render_mode || "") === "beauty";
      if (M !== this.studioEnabled) {
        this.studioEnabled = M, Re(e, this.scene, this.renderer, this.studio, M);
        for (const w of this.flatLights || []) w.visible = !M;
      }
      const A = !!t.objects?.some((w) => w.type === "sun_light" && w.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !A && M), this.flatLights?.[1] && (this.flatLights[1].visible = !A && !M), this.disposed) return;
      (this.canvas.width !== c || this.canvas.height !== s) && this.renderer.setSize(c, s, !1);
      const S = (r && r.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const a = t.viewport_bg_sequence && t.viewport_bg_sequence.length ? t.viewport_bg_sequence[g % t.viewport_bg_sequence.length] : t.viewport_bg_image || "";
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
      ]), x = [...l.entries()].map(([w, L]) => `${w}:${L?.src || ""}`).join("|"), W = [...n.entries()].map(([w, L]) => `${w}:${L}`).join("|");
      (z !== this.sceneKey || x !== this.mediaSignature || W !== this.modelSignature) && (this.sceneKey = z, this.mediaSignature = x, this.modelSignature = W, this.rebuild(t, l, n, m, O));
      const v = Math.max(1, t.fps || 24), C = /* @__PURE__ */ new Map();
      for (const w of t.objects)
        w.character?.motion && this.models.has(w.id) && C.set(w.id, w.character.motion);
      for (const [w, L] of this.models) {
        if (!L.mixer || !(L.duration > 0)) continue;
        const V = C.get(w);
        V ? (this.applyMotionClip?.(w, V), L.mixer.setTime(yt(V, g, v, L.duration))) : L.mixer.setTime(g / v % L.duration);
      }
      for (const w of t.objects) {
        const L = this.objectNodes.get(w.id);
        if (!L) continue;
        const V = w.keyframes?.length ? se(w, g) : w;
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
      if (K !== this.pathKey && (this.pathKey = K, this.rebuildPath(t, d, G, F, k)), this.updateLiveCameras(t, g, m, F, d, G), this.liveCameras.visible = !m, !m) {
        const w = t.show_camera_paths !== !1, L = t.show_camera_gizmos !== !1, V = t.show_look_at !== !1;
        for (const R of [this.path, this.liveCameras])
          R.traverse((H) => {
            const Y = H.userData.omnicamWidget;
            Y === "path" ? H.visible = w : Y === "gizmo" ? H.visible = L : Y === "lookat" && (H.visible = V);
          });
      }
      const te = c / Math.max(1, s), Q = this.configureCamera(r, te);
      if (this.activeCamera = Q, m ? this.selectionGroup.visible = !1 : (this.updateSelection(t, d, y, i, `${t.__omnicamRevision ?? "legacy"}:${g}`, S), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
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
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, c, s);
      const U = performance.now();
      let J = !1;
      if (!m && !S && d === "object" && (y || t.__selectedObjectIds?.length) && !i) {
        const w = t.__selectedObjectIds?.length ? t.__selectedObjectIds : y ? [y] : [], L = [];
        for (const V of w) {
          const R = this.objectNodes.get(V);
          R && D(R) && L.push(R);
        }
        L.length && (this.outlineRenderer || (this.outlineRenderer = new f(this.renderer, this.scene, void 0, Q)), this.outlineRenderer.render(Q, c, s, L), J = !0);
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
function ar(o) {
  let e = !1;
  return o?.traverse?.((u) => {
    e || u.visible === !1 || !u.isMesh || u.userData?.omnicamHelper || u.userData?.omnicamCaptureGuide || (e = !!(u.geometry && u.material));
  }), e;
}
class sr {
  constructor(e, u, p = or, P = null) {
    const { EffectComposer: h, RenderPass: B, OutlinePass: b, OutputPass: q, Vector2: j } = p;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new h(e), this.renderPass = new B(u, P), this.outlinePass = new b(new j(1, 1), u, P, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new q(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, u, p, P) {
    this.disposed || ((u !== this.width || p !== this.height) && (this.width = u, this.height = p, this.composer.setSize(u, p)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...P], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const Fe = { low: zt, balanced: Ft, high: kt }, me = new Be({ color: 10265519, roughness: 0.48, metalness: 0.06, side: ae }), $e = new Be({ color: 2237998, roughness: 0.95, metalness: 0, side: ae }), Le = new be({ color: 11449792, wireframe: !0, side: ae });
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
  return u.wrapS = u.wrapT = ht, u.repeat.set(8, 8), u.colorSpace = Ce, u.needsUpdate = !0, new Be({ map: u, roughness: 0.85, metalness: 0, side: o ? _e : ae });
}
function nr(o, e, u = !1) {
  const p = e === "wireframe" ? "wireframe" : o.material_mode || "textured", P = u ? _e : ae;
  if (p === "wireframe") {
    const B = Le.clone();
    return B.side = P, o.color && (B.color = new ce(o.color)), B;
  }
  if (p === "checker") return Se(u);
  if (p === "matte") {
    const B = $e.clone();
    return B.side = P, o.color && (B.color = new ce(o.color)), B;
  }
  const h = me.clone();
  return h.side = P, o.color && (h.color = new ce(o.color)), h;
}
function ir(o, e, u = null, p = !1) {
  const P = p ? _e : ae;
  o.traverse((h) => {
    if (h.isMesh) {
      if (h.userData.omnicamOriginalMaterial || (h.userData.omnicamOriginalMaterial = h.material), h.userData.omnicamOverrideMaterial) {
        const B = Array.isArray(h.material) ? h.material : [h.material];
        for (const b of B)
          b?.map?.dispose?.(), b?.dispose?.();
        h.userData.omnicamOverrideMaterial = !1;
      }
      if (e === "textured" || e === "wireframe_texture") {
        h.material = h.userData.omnicamOriginalMaterial;
        const B = Array.isArray(h.material) ? h.material : [h.material];
        for (const b of B)
          b && (b.side = P);
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
function ve(o, e = !1) {
  o.traverse((u) => {
    if (u.userData.omnicamModelResource && !e) return;
    u.geometry?.dispose?.();
    const p = Array.isArray(u.material) ? u.material : [u.material];
    for (const P of p)
      P?.map?.dispose?.(), P?.dispose?.();
  });
}
function Ke(o) {
  if (!o) return null;
  const e = o instanceof HTMLVideoElement ? new ft(o) : new pt(o);
  return e.colorSpace = Ce, e.needsUpdate = !0, e;
}
function cr(o, e, u) {
  e && St(o, e);
  const [p, P] = o.size || [2, 3], h = new ie(), B = new we(new De(p, P), new be({ color: 1448482, side: ae, transparent: !0, opacity: 0.85 }));
  B.frustumCulled = !1, h.add(B);
  let b = e ? Ke(e) : null;
  if (!b && (o.id === "subject" || !o.asset) && (b = Gt(pe)), !b) return h;
  const j = e?.videoWidth || e?.naturalWidth || e?.width || p, X = e?.videoHeight || e?.naturalHeight || e?.height || P, I = j / Math.max(1, X), N = p / Math.max(0.01, P);
  let re = p, ee = P;
  u === "contain" ? I > N ? ee = p / I : re = P * I : u === "cover" && (I > N ? (b.repeat.x = N / I, b.offset.x = (1 - b.repeat.x) * 0.5) : (b.repeat.y = I / N, b.offset.y = (1 - b.repeat.y) * 0.5));
  const Z = new we(
    new De(re, ee),
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
          const r = await new Ne().loadAsync(u);
          r.index ? (r.getAttribute("normal") || r.computeVertexNormals(), h = new we(r, me.clone())) : h = new nt(r, new it({ color: 11449792, size: 0.025 }));
        } else {
          const r = await new Ue().loadAsync(u);
          h = r.scene, B = r.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== P) {
          ve(h, !0);
          return;
        }
        const b = this.models.get(e);
        b && ve(b.scene, !0), h.traverse((r) => {
          if (r.userData.omnicamModelResource = !0, r.frustumCulled = !1, r.isMesh && (r.frustumCulled = !1, r.material)) {
            const l = Array.isArray(r.material) ? r.material : [r.material];
            for (const c of l)
              c.side = ae;
          }
          r.isPoints && (r.frustumCulled = !1), r.isSkinnedMesh && (r.frustumCulled = !1, r.computeBoundingBox?.(), r.computeBoundingSphere?.());
        });
        let q = 0, j = 0, X = 0, I = 0;
        h.traverse((r) => {
          r.isMesh && (q += 1, I += r.geometry?.getAttribute?.("position")?.count || 0), r.isPoints && (j += 1), r.isBone && (X += 1);
        });
        const N = new ie();
        if (N.frustumCulled = !1, N.add(h), !q && !j && X) {
          const r = new ct(h);
          r.material.depthTest = !1, r.material.opacity = 0.9, r.material.transparent = !0, r.renderOrder = 10, r.userData.omnicamModelResource = !0, N.add(r);
        }
        N.updateMatrixWorld(!0);
        const re = new lt().setFromObject(N), ee = re.getSize(new Pe()), Z = Math.max(ee.x, ee.y, ee.z), E = Number.isFinite(Z) && Z > 1e-6 ? 2.5 / Z : 1, se = re.getCenter(new Pe());
        N.scale.setScalar(E), N.position.set(-se.x * E, -re.min.y * E, -se.z * E);
        const D = new ie();
        D.frustumCulled = !1, D.add(N);
        const f = B.length ? new dt(h) : null;
        f && f.clipAction(B[0]).play();
        const t = { url: u, format: p, scene: D, mixer: f, clips: B, selectedClip: 0, duration: B[0]?.duration || 0, meshes: q, points: j, bones: X, vertices: I, animations: B.length, normalizationScale: E };
        this.models.set(e, t), this.onModelLoaded({ id: e, format: p, meshes: q, points: j, bones: X, vertices: I, animations: B.length, animationNames: B.map((r, l) => r.name || `Clip ${l + 1}`), duration: t.duration, normalizationScale: E }), this.sceneKey = "", this.invalidate();
      } catch (h) {
        this.modelLoads.get(e) === P && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${p.toUpperCase()} ${e}`, h);
        const B = h?.message?.includes("FBX version not supported") || h?.message?.includes("6100") || h?.message?.includes("6000"), b = B ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : h?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: p, error: b, isLegacyFBX: B });
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
async function dr(o, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const u of ["vp9", "vp8"])
    try {
      if (await fe(Wt(u, { width: o, height: e }), 5e3, `Checking ${u} support`)) return u;
    } catch {
    }
  return null;
}
function fe(o, e, u) {
  let p;
  return Promise.race([
    o,
    new Promise((P, h) => {
      p = setTimeout(() => h(new Error(`${u} timed out`)), e);
    })
  ]).finally(() => clearTimeout(p));
}
async function yr(o, e, u, p, P, h = "balanced") {
  const B = await dr(o.width, o.height);
  if (!B) throw new Error("No supported WebCodecs WebM encoder");
  const b = new At({ format: new Ot(), target: new Vt() }), q = new Tt(o, { codec: B, quality: Fe[h] || Fe.balanced, keyFrameInterval: 1 });
  b.addVideoTrack(q, { frameRate: u }), await fe(b.start(), 1e4, "Starting deterministic encoder");
  try {
    const j = 1 / u;
    for (let X = 0; X < e; X++) {
      if (P?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await p(X), await fe(q.add(X * j, j, { keyFrame: X % u === 0 }), 1e4, `Encoding frame ${X + 1}`);
    }
    await fe(b.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (j) {
    throw b.state !== "finalized" && await b.cancel().catch(() => {
    }), j;
  }
  return _t(new Blob([b.target.buffer], { type: await b.getMimeType() }), {
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
  lr as OmniWebGLViewport,
  yr as encodeDeterministicPlayblast,
  dr as supportsDeterministicEncoding
};
