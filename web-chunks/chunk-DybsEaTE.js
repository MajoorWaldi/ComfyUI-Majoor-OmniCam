import { T as ue } from "./chunk-D_M_mkHf.js";
import { ab as je, ae as Qe, af as Ze, ag as He, ah as Je, W as Ee, s as ve, Z as et, i as tt, u as ie, H as rt, l as ot, G as ae, k as st, Y as nt, a2 as at, ai as We, aj as Ie, M as pe, ak as Ne, n as Ce, al as Ue, P as it, c as ct, e as Re, D as se, a5 as lt, d as dt, V as Se, v as ut, f as Me, J as Be, m as Pe, z as mt, a1 as ht, a3 as ft, ac as pt, a8 as wt } from "./vendor-three-B8JDtKPi.js";
import { T as ye, bR as gt, bS as yt, bT as xt, bh as Mt, a as bt, J as vt } from "./chunk-BKRAgJrc.js";
import { r as Ct, q as Bt, a as De, s as qe, D as Ve, c as _t, b as Lt, d as Gt, e as St, g as Pt } from "./chunk-DyNDdHLh.js";
import { c as Dt } from "./chunk-a2yd8Eqb.js";
import { o as Vt } from "./chunk-CA_Js9vS.js";
import { Output as At, BufferTarget as Ot, WebMOutputFormat as kt, CanvasSource as Tt, QUALITY_HIGH as Ft, QUALITY_MEDIUM as zt, QUALITY_LOW as jt, canEncodeVideo as Wt } from "./vendor-mediabunny-CZ5VNE-V.js";
function Ae(o, e) {
  const d = o && e != null;
  return {
    editing: d,
    pointRadius: d ? 0.065 : 0.17,
    pathOpacity: d ? 0.45 : o ? 1 : 0.55,
    showGlow: o && !d
  };
}
function It(o, { position: e, color: d = 15903035, radius: g = 0.28, bold: L = !1 }) {
  const p = new o.Group(), v = L ? 16773544 : d, C = new o.LineBasicMaterial({ color: v, transparent: !0, opacity: L ? 1 : 0.95, depthTest: !1 }), N = (W) => {
    const F = [];
    for (let Z = 0; Z <= 48; Z++) {
      const E = Z / 48 * Math.PI * 2;
      F.push(new o.Vector3(Math.cos(E) * W, Math.sin(E) * W, 0));
    }
    const te = new o.Line(new o.BufferGeometry().setFromPoints(F), C);
    return te.renderOrder = 915, te;
  };
  if (p.add(N(g)), L) {
    p.add(N(g * 1.18));
    const W = new o.Mesh(
      new o.RingGeometry(0, g * 0.3, 16),
      new o.MeshBasicMaterial({ color: v, transparent: !0, opacity: 1, depthTest: !1 })
    );
    W.renderOrder = 916, p.add(W);
  }
  const T = g * 1.55, q = new o.LineSegments(
    new o.BufferGeometry().setFromPoints([
      new o.Vector3(-T, 0, 0),
      new o.Vector3(-g * 0.45, 0, 0),
      new o.Vector3(g * 0.45, 0, 0),
      new o.Vector3(T, 0, 0),
      new o.Vector3(0, -T, 0),
      new o.Vector3(0, -g * 0.45, 0),
      new o.Vector3(0, g * 0.45, 0),
      new o.Vector3(0, T, 0)
    ]),
    C
  );
  return q.renderOrder = 915, p.add(q), p.position.copy(e), p.userData.omnicamBillboard = !0, p;
}
const Xe = 3718648, Nt = 12e3;
function we(o) {
  return !!(o.isSkinnedMesh && o.skeleton);
}
function $e(o, e) {
  o.position.copy(e.position), o.quaternion.copy(e.quaternion), o.scale.copy(e.scale);
}
function ge(o) {
  return o.frustumCulled = !1, o.raycast = () => {
  }, o.userData.omnicamHelper = !0, o;
}
function Ut(o, e, { color: d = null, opacity: g = null } = {}) {
  const L = d ?? Xe, p = g ?? 0.65;
  if (we(e)) {
    const C = new o.SkinnedMesh(e.geometry.clone(), new o.MeshBasicMaterial({
      color: L,
      wireframe: !0,
      transparent: !0,
      opacity: p,
      depthWrite: !1
    }));
    return C.bindMode = e.bindMode, C.bind(e.skeleton, e.bindMatrix), $e(C, e), { overlay: ge(C), parent: e.parent || e };
  }
  const v = new o.LineSegments(
    new o.WireframeGeometry(e.geometry),
    new o.LineBasicMaterial({ color: L, opacity: p, transparent: !0, depthTest: !0 })
  );
  return { overlay: ge(v), parent: e };
}
function Rt(o, e) {
  const d = new o.PointsMaterial({ color: Xe, size: 0.05, sizeAttenuation: !0 });
  if (!we(e)) {
    const W = new o.Points(e.geometry, d);
    return { overlay: ge(W), parent: e };
  }
  const g = e.geometry.getAttribute("position")?.count || 0, L = Math.max(1, Math.ceil(g / Nt)), p = Math.ceil(g / L), v = new Float32Array(p * 3), C = new o.BufferGeometry();
  C.setAttribute("position", new o.Float32BufferAttribute(v, 3));
  const N = new o.Points(C, d);
  $e(N, e);
  const T = new o.Vector3(), q = C.getAttribute("position");
  return N.onBeforeRender = () => {
    for (let W = 0; W < p; W++)
      e.getVertexPosition(W * L, T), q.setXYZ(W, T.x, T.y, T.z);
    q.needsUpdate = !0;
  }, { overlay: ge(N), parent: e.parent || e };
}
function qt(o, e, d) {
  const g = we(e) ? new o.SkinnedMesh(e.geometry.clone(), d) : new o.Mesh(e.geometry.clone(), d);
  return we(e) && (g.bindMode = e.bindMode, g.bind(e.skeleton, e.bindMatrix)), g.matrixAutoUpdate = !1, g.matrix.copy(e.matrixWorld), g.frustumCulled = !1, g;
}
function Xt(o, e, { wireframe: d = !1, vertices: g = !1, wireframeColor: L = null, wireframeOpacity: p = null } = {}) {
  if (!d && !g) return;
  const v = [];
  e.traverse((C) => {
    C.isMesh && C.geometry && !C.userData.omnicamHelper && v.push(C);
  });
  for (const C of v) {
    if (d) {
      const { overlay: N, parent: T } = Ut(o, C, { color: L, opacity: p });
      T.add(N);
    }
    if (g) {
      const { overlay: N, parent: T } = Rt(o, C);
      T.add(N);
    }
  }
}
const $t = 16777215, Oe = 0.17, ke = 3593923, Kt = 0.06;
function Yt(o) {
  const e = new o.Group();
  e.userData.omnicamCaptureGuide = !0;
  const d = new o.GridHelper(120, 24, 4081496, 3291463);
  d.userData.omnicamCaptureGuide = !0, d.frustumCulled = !1, d.position.y = 5e-4, e.add(d);
  const g = new o.GridHelper(120, 120, 2238001, 1909035);
  g.userData.omnicamCaptureGuide = !0, g.frustumCulled = !1, e.add(g);
  const L = new o.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), p = new o.BufferGeometry().setFromPoints([new o.Vector3(-60, 1e-3, 0), new o.Vector3(60, 1e-3, 0)]), v = new o.Line(p, L);
  v.userData.omnicamCaptureGuide = !0, e.add(v);
  const C = new o.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), N = new o.BufferGeometry().setFromPoints([new o.Vector3(0, 1e-3, -60), new o.Vector3(0, 1e-3, 60)]), T = new o.Line(N, C);
  return T.userData.omnicamCaptureGuide = !0, e.add(T), e;
}
function Qt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: g, OBJLoader: L, PLYLoader: p, STLLoader: v, neutral: C, wire: N, checkerMaterial: T, objectMaterial: q, applyModelMaterial: W, disposeObject: F, textureFor: re, cardMesh: te, generatePointField: Z, sampleCamera: E, sampleObjectTransform: ne } = o;
  return {
    removeModel(G) {
      const y = this.models.get(G);
      y && F(y.scene, !0), this.models.delete(G), this.modelLoads.delete(G), this.sceneKey = "";
    },
    selectAnimation(G, y) {
      const t = this.models.get(G);
      !t?.mixer || !t.clips.length || (t.selectedClip = Math.max(0, Math.min(t.clips.length - 1, Number(y) || 0)), t.duration = t.clips[t.selectedClip].duration || 0, t.motionClipId = null, t.mixer.stopAllAction(), t.mixer.clipAction(t.clips[t.selectedClip]).play(), this.invalidate());
    },
    /** Select the clip a character motion names (by clip name, else index, else
     * the first clip). Idempotent -- re-selecting the same clip is a no-op so the
     * per-frame render loop can call it freely (design spec section 27). */
    applyMotionClip(G, y) {
      const t = this.models.get(G);
      if (!t?.mixer || !t.clips.length) return;
      const s = String(y?.clip_id ?? "");
      if (t.motionClipId === s) return;
      let l = t.clips.findIndex((n) => (n.name || "").toLowerCase() === s.toLowerCase());
      l < 0 && /^\d+$/.test(s) && (l = Number(s)), (l < 0 || l >= t.clips.length) && (l = 0), t.selectedClip = l, t.motionClipId = s, t.duration = t.clips[l].duration || 0, t.mixer.stopAllAction();
      const u = t.mixer.clipAction(t.clips[l]);
      u.reset(), u.play(), this.invalidate();
    },
    rebuild(G, y, t, s = !1, l = "auto") {
      const u = this.content.children.filter((r) => r.userData?.omnicamPersistent);
      for (const r of u) this.content.remove(r);
      this.content.traverse((r) => {
        for (const a of [...r.children])
          a.userData.omnicamHelper && (r.remove(a), F(a, !0));
      }), F(this.content), this.content.clear();
      for (const r of u) this.content.add(r);
      this.objectNodes.clear(), this.selectionKey = "";
      const n = G.render_mode, i = s && ["clay", "motion_proxy", "depth_rich"].includes(l), M = (r, a) => {
        const w = C.clone();
        return w.side = a ? e.FrontSide : e.DoubleSide, r.color && (w.color = new e.Color(r.color)), w;
      }, m = (r) => i || n === "graybox" ? M(r, !!G.backface_culling) : q(r, n, !!G.backface_culling), h = s && l === "depth_rich";
      if (["omni_ref", "point_field"].includes(n) || h) {
        const r = G.objects.filter((f) => f.enabled !== !1 && !["sun_light", "point_light", "spot_light", "null"].includes(f.type)).length, a = h && r <= 1 && (!G.point_density || G.point_density === "none") ? "sparse" : n === "omni_ref" && (!G.point_density || G.point_density === "none") ? "balanced" : G.point_density || "balanced", { points: w, colors: P } = Z(a, G.point_spread || "all_views", G.point_color || null);
        if (w.length > 0) {
          const f = new e.BufferGeometry();
          f.setAttribute("position", new e.Float32BufferAttribute(w, 3)), f.setAttribute("color", new e.Float32BufferAttribute(P, 3));
          const c = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), b = new e.Points(f, c);
          b.frustumCulled = !1, this.content.add(b);
        }
      }
      if (!["grid", "point_field"].includes(n))
        for (const r of G.objects) {
          if (r.enabled === !1) continue;
          const a = r.size || [1, 1, 1];
          let w;
          if (r.type === "glb" || r.type === "model") {
            const f = t.get(r.id), c = this.models.get(r.id), b = r.format || (r.type === "glb" ? "glb" : "");
            f && (c?.url !== f || c?.format !== b) && this.loadModel(r.id, f, b);
            const B = !!G.backface_culling, D = s && l === "clay" || n === "graybox" ? "neutral" : n === "wireframe" ? "wireframe" : Ct(r, G, s) ?? (r.material_mode || "textured");
            c?.url === f && (w = c.scene, W(w, D, r, B));
          } else if (r.type === "sphere")
            w = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), m(r));
          else if (r.type === "cylinder")
            w = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), m(r));
          else if (r.type === "torus") {
            const f = new e.TorusGeometry(0.5, 0.2, 16, 32);
            f.rotateX(Math.PI / 2), w = new e.Mesh(f, m(r));
          } else if (r.type === "pyramid") {
            const f = new e.ConeGeometry(0.7, 1, 4);
            f.rotateY(Math.PI / 4), w = new e.Mesh(f, m(r));
          } else if (r.type === "sun_light") {
            const f = new e.Group(), c = new e.DirectionalLight(r.color || 16774892, r.intensity ?? 2.2);
            c.castShadow = r.cast_shadow !== !1, c.castShadow && (c.shadow.mapSize.set(1024, 1024), c.shadow.bias = -8e-4, c.shadow.normalBias = 0.02, c.shadow.radius = 2.4, c.shadow.camera.near = 0.5, c.shadow.camera.far = 70, c.shadow.camera.left = c.shadow.camera.bottom = -14, c.shadow.camera.right = c.shadow.camera.top = 14);
            const b = (r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), B = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(b[0], b[1], b[2], "YXZ"));
            c.target.position.copy(c.position).add(B.multiplyScalar(10)), f.add(c, c.target);
            const D = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: r.color || 16096779, wireframe: !0 })
            );
            D.userData.omnicamLightHelper = !0, D.visible = !s, f.add(D), w = f;
          } else if (r.type === "point_light") {
            const f = new e.Group(), c = new e.PointLight(r.color || 16777215, r.intensity ?? 2, 0, 2);
            f.add(c);
            const b = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: r.color || 16498468, wireframe: !0 })
            );
            b.userData.omnicamLightHelper = !0, b.visible = !s, f.add(b), w = f;
          } else if (r.type === "spot_light") {
            const f = new e.Group(), c = (r.cone_angle ?? 45) * Math.PI / 180, b = r.penumbra ?? 0.25, B = new e.SpotLight(r.color || 16777215, r.intensity ?? 3, 0, c, b, 2), D = (r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), I = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(D[0], D[1], D[2], "YXZ"));
            B.target.position.copy(B.position).add(I.multiplyScalar(10)), f.add(B, B.target);
            const A = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: r.color || 3718648, wireframe: !0 })
            );
            A.userData.omnicamLightHelper = !0, A.visible = !s, f.add(A), w = f;
          } else if (r.type === "human")
            w = new e.Mesh(Dt(e), m(r));
          else if (r.type === "ground") w = new e.Mesh(new e.BoxGeometry(1, 1, 1), m(r));
          else if (r.type === "card")
            if (!["graybox", "wireframe"].includes(n) && (!r.material_mode || ["textured", "wireframe_texture"].includes(r.material_mode)))
              w = te(r, y.get(r.id), G.card_fit || "contain");
            else {
              const c = n === "wireframe" ? new e.PlaneGeometry(a[0], a[1], 4, 4) : new e.PlaneGeometry(a[0], a[1]);
              w = new e.Mesh(c, m(r));
            }
          else if (r.type === "null") {
            const f = new e.AxesHelper(0.5);
            f.position.fromArray(r.position || [0, 0, 0]), f.userData.omnicamId = r.id, f.frustumCulled = !1, this.objectNodes.set(r.id, f), this.content.add(f);
            continue;
          } else
            w = new e.Mesh(new e.BoxGeometry(1, 1, 1), m(r));
          if (!w) continue;
          w.position.fromArray(r.position || [0, 0, 0]), w.rotation.set(...(r.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const P = ["sun_light", "point_light", "spot_light"].includes(r.type);
          if (r.type !== "card" && !P && w.scale.fromArray(a), w.userData.omnicamId = r.id, w.frustumCulled = !1, w.traverse((f) => {
            f.frustumCulled = !1, f.userData.omnicamId = r.id;
          }), !P) {
            const f = !!(G.show_wireframe || n === "wireframe" || G.render_mode === "wireframe_texture" || r.material_mode === "wireframe_texture" || r.material_mode === "wireframe_neutral");
            Xt(e, w, { wireframe: f, vertices: G.show_vertices });
          }
          this.objectNodes.set(r.id, w), this.content.add(w);
        }
    },
    rebuildPath(G, y = "camera", t = null, s = "", l = null) {
      const u = Array.isArray(l) ? new Set(l) : null;
      F(this.path), this.path.clear();
      const n = s === "camera" ? G.active_camera_id : null, i = [
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
      (G.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: G.keyframes || [] }]).forEach((h, r) => {
        const a = h.keyframes || [];
        if (a.length === 0 || h.id === n) return;
        const w = h.color ? { line: new e.Color(h.color), marker: new e.Color(h.color), frustum: new e.Color(h.color) } : i[r % i.length], P = h.id === G.active_camera_id, f = P && y === "camera";
        if (a.length >= 2) {
          const c = a[0].frame, b = a[a.length - 1].frame, B = Math.max(32, Math.min(256, b - c + 1)), D = { ...h, keyframes: a, objects: G.objects }, I = Array.from({ length: B }, (S, O) => {
            const R = c + (b - c) * O / Math.max(1, B - 1);
            return new e.Vector3().fromArray(E(D, R, G.objects).position);
          }), A = new e.CatmullRomCurve3(I, !1, "centripetal"), j = Ae(P, t), U = f ? 0.06 : P ? 0.045 : 0.025, k = new e.MeshBasicMaterial({
            color: w.line,
            transparent: !0,
            opacity: j.pathOpacity,
            depthTest: !1
          }), Y = new e.Mesh(new e.TubeGeometry(A, Math.max(48, B), U, 8, !1), k);
          if (Y.renderOrder = 900, Y.userData.omnicamWidget = "path", P && !h.locked && (Y.userData.omnicamPathSegments = {
            cameraId: h.id,
            firstFrame: c,
            lastFrame: b,
            frames: a.map((S) => S.frame),
            points: I.map((S) => [S.x, S.y, S.z])
          }), this.path.add(Y), j.showGlow) {
            const S = new e.Mesh(
              new e.TubeGeometry(A, Math.max(48, B), U * (f ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: w.line, transparent: !0, opacity: f ? 0.3 : 0.18, depthTest: !1 })
            );
            if (S.renderOrder = 899, S.userData.omnicamWidget = "path", this.path.add(S), I.length >= 8) {
              const O = Math.max(6, Math.floor(B / 8));
              for (let R = Math.floor(O / 2); R < B - 1; R += O) {
                const Q = I[R], $ = I[R + 1].clone().sub(Q).normalize(), K = new e.ConeGeometry(U * 1.5, U * 3, 8);
                K.rotateX(Math.PI / 2);
                const ee = new e.Quaternion().setFromUnitVectors(new e.Vector3(0, 0, 1), $), X = new e.Mesh(K, new e.MeshBasicMaterial({ color: w.marker, transparent: !0, opacity: 0.85, depthTest: !1 }));
                X.quaternion.copy(ee), X.position.copy(Q), X.renderOrder = 901, X.userData.omnicamWidget = "path", this.path.add(X);
              }
            }
          }
        }
        for (const c of a) {
          const b = a.indexOf(c), B = P, D = B ? Ae(P, t).pointRadius : 0.085, I = new e.Mesh(
            new e.SphereGeometry(D, 16, 12),
            new e.MeshBasicMaterial({ color: B ? $t : w.marker, depthTest: !1 })
          );
          I.position.fromArray(c.camera.position), I.renderOrder = 910, I.userData.omnicamPathKey = { cameraId: h.id, frame: c.frame }, I.userData.omnicamWidget = "path", this.path.add(I);
          const A = new e.Mesh(
            new e.RingGeometry(D * 1.3, D * 1.7, 24),
            new e.MeshBasicMaterial({ color: B ? 16777215 : w.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          A.position.fromArray(c.camera.position), A.visible = !(P && c.frame === t), A.renderOrder = 909, A.userData.omnicamBillboard = !0, A.userData.omnicamWidget = "path", this.path.add(A);
          const j = new e.Vector3().fromArray(c.camera.position), U = new e.Vector3().fromArray(c.camera.target || [0, 0, 0]), k = P && t != null && c.frame === t, Y = P && !k && u?.has(c.frame);
          if (k) {
            const S = new e.Mesh(
              new e.RingGeometry(D * 1.5, D * 1.65, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
            );
            S.position.fromArray(c.camera.position), S.renderOrder = 911, S.userData.omnicamBillboard = !0, S.userData.omnicamWidget = "path", this.path.add(S);
          } else if (Y) {
            const S = new e.Mesh(
              new e.RingGeometry(Oe * 1.9, Oe * 2.2, 24),
              new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.85, depthTest: !1 })
            );
            S.position.fromArray(c.camera.position), S.renderOrder = 911, S.userData.omnicamBillboard = !0, S.userData.omnicamWidget = "path", this.path.add(S);
          }
          if (k) {
            const S = U.clone().sub(j).normalize();
            let O = new e.Vector3().crossVectors(S, new e.Vector3(0, 1, 0));
            O.lengthSq() < 1e-8 ? O.set(1, 0, 0) : O.normalize();
            const R = new e.Vector3().crossVectors(O, S).normalize(), Q = e.MathUtils.clamp(j.distanceTo(U) * 0.08, 0.25, 0.8), $ = c.camera.camera_type === "orthographic" ? Q * 0.55 : Q * Math.tan(e.MathUtils.degToRad(c.camera.fov || 35) * 0.5), K = $ * (G.width || 16) / Math.max(1, G.height || 9), ee = j.clone().addScaledVector(S, Q), X = [
              ee.clone().addScaledVector(O, -K).addScaledVector(R, -$),
              ee.clone().addScaledVector(O, K).addScaledVector(R, -$),
              ee.clone().addScaledVector(O, K).addScaledVector(R, $),
              ee.clone().addScaledVector(O, -K).addScaledVector(R, $)
            ], x = [];
            for (const z of X) x.push(j, z);
            for (let z = 0; z < 4; z++) x.push(X[z], X[(z + 1) % 4]);
            const _ = new e.BufferGeometry().setFromPoints(x), V = new e.LineSegments(_, new e.LineBasicMaterial({
              color: w.marker,
              transparent: !0,
              opacity: 0.25,
              depthTest: !0
            }));
            V.userData.omnicamWidget = "gizmo", this.path.add(V);
          }
          if (k) {
            const S = It(e, {
              position: U,
              radius: e.MathUtils.clamp(j.distanceTo(U) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            S.userData.omnicamWidget = "lookat", this.path.add(S);
            const O = new e.Line(
              new e.BufferGeometry().setFromPoints([j.clone(), U.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.35, depthTest: !0 })
            );
            O.renderOrder = 914, O.userData.omnicamWidget = "lookat", this.path.add(O);
          }
          if (k) {
            const S = Vt(c, a[b - 1] || null, a[b + 1] || null);
            for (const O of ["in", "out"]) {
              const R = new e.Vector3().fromArray(S[O]), Q = new e.Line(
                new e.BufferGeometry().setFromPoints([j.clone(), R.clone()]),
                new e.LineBasicMaterial({ color: ke, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              Q.renderOrder = 912, Q.userData.omnicamWidget = "gizmo", this.path.add(Q);
              const $ = new e.Mesh(
                new e.SphereGeometry(Kt, 12, 8),
                new e.MeshBasicMaterial({ color: ke, depthTest: !1 })
              );
              $.position.copy(R), $.renderOrder = 913, $.userData.omnicamCurveHandle = { cameraId: h.id, frame: c.frame, side: O }, $.userData.omnicamWidget = "gizmo", this.path.add($);
            }
          }
        }
      });
      const m = [16742005, 52937, 16632686, 7101671, 14774357];
      (G.objects || []).forEach((h, r) => {
        const a = h.keyframes || [];
        if (a.length < 2) return;
        const w = h.color ? new e.Color(h.color) : m[r % m.length], P = a.map((b) => new e.Vector3().fromArray(b.transform?.position || [0, 0, 0])), f = new e.CatmullRomCurve3(P, !1, "centripetal"), c = new e.Mesh(
          new e.TubeGeometry(f, Math.max(32, a.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: w, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        c.renderOrder = 900, c.userData.omnicamWidget = "path", this.path.add(c);
        for (const b of a) {
          const B = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: w, depthTest: !1 })
          );
          B.position.fromArray(b.transform?.position || [0, 0, 0]), B.renderOrder = 910, B.userData.omnicamWidget = "path", this.path.add(B);
        }
      });
    }
  };
}
function Zt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: g, OBJLoader: L, PLYLoader: p, STLLoader: v, neutral: C, wire: N, checkerMaterial: T, objectMaterial: q, applyModelMaterial: W, disposeObject: F, textureFor: re, cardMesh: te, generatePointField: Z, sampleCamera: E, sampleObjectTransform: ne, hasOutlineMesh: G } = o;
  return {
    updateLiveCameras(y, t, s, l, u = "camera", n = null) {
      if (F(this.liveCameras), this.liveCameras.clear(), s) return;
      const i = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (y.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: y.keyframes || [] }]).forEach((m, h) => {
        const r = m.color ? { line: new e.Color(m.color), marker: new e.Color(m.color), frustum: new e.Color(m.color), body: new e.Color(m.color).multiplyScalar(0.35) } : i[h % i.length], a = m.id === y.active_camera_id;
        if (a && n != null && l !== "camera") return;
        const w = a && u === "camera", P = l === "camera" && a, f = E(m, t, y.objects), c = new e.Vector3().fromArray(f.position || [0, 0, 0]), b = new e.Vector3().fromArray(f.target || [0, 0, 0]), B = b.clone().sub(c), D = B.length();
        D < 1e-4 ? B.set(0, 0, -1) : B.normalize();
        let I = new e.Vector3(0, 1, 0), A = new e.Vector3().crossVectors(B, I);
        A.lengthSq() < 1e-6 && (I = new e.Vector3(0, 0, 1), A = new e.Vector3().crossVectors(B, I)), A.normalize();
        let j = new e.Vector3().crossVectors(A, B).normalize();
        if (f.roll) {
          const k = e.MathUtils.degToRad(f.roll);
          A.applyAxisAngle(B, k), j.applyAxisAngle(B, k);
        }
        const U = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!P) {
          const k = new e.Group(), Y = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: r.body, roughness: 0.4, metalness: 0.8 })
          );
          Y.position.set(0, 0, -0.11), k.add(Y);
          const S = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          S.rotateX(Math.PI / 2);
          const O = new e.Mesh(
            S,
            new e.MeshStandardMaterial({ color: r.marker, roughness: 0.2, metalness: 0.9 })
          );
          O.position.set(0, 0, 0.05), k.add(O);
          const R = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: a ? 16729156 : r.marker })
          );
          R.position.set(0, 0.07, -0.08), k.add(R);
          const Q = new e.Matrix4().makeBasis(A, j, B.clone().negate());
          k.quaternion.setFromRotationMatrix(Q), k.position.copy(c), k.userData.omnicamWidget = "gizmo", this.liveCameras.add(k);
          const $ = new e.SphereGeometry(0.35, 8, 6), K = new e.Mesh($, U);
          K.position.copy(c), K.userData = { omnicamType: "camera", omnicamId: m.id }, this.liveCameras.add(K);
          const ee = e.MathUtils.clamp(D * 0.25, 0.5, 2.5), X = f.camera_type === "orthographic" ? 5 / Math.max(0.01, f.zoom || 1) * 0.35 : ee * Math.tan(e.MathUtils.degToRad(f.fov || 35) * 0.5), x = X * (y.width || 16) / Math.max(1, y.height || 9), _ = c.clone().addScaledVector(B, ee), V = [
            _.clone().addScaledVector(A, -x).addScaledVector(j, -X),
            _.clone().addScaledVector(A, x).addScaledVector(j, -X),
            _.clone().addScaledVector(A, x).addScaledVector(j, X),
            _.clone().addScaledVector(A, -x).addScaledVector(j, X)
          ], z = [];
          for (const le of V) z.push(c, le);
          for (let le = 0; le < 4; le++) z.push(V[le], V[(le + 1) % 4]);
          const J = V[2].clone().add(V[3]).multiplyScalar(0.5).clone().addScaledVector(j, X * 0.25);
          z.push(V[2], J, J, V[3]);
          const de = new e.BufferGeometry().setFromPoints(z), ce = new e.LineSegments(de, new e.LineBasicMaterial({
            color: w ? r.marker : r.frustum,
            linewidth: a ? 2 : 1,
            transparent: !0,
            opacity: a ? 1 : 0.6
          }));
          ce.userData.omnicamWidget = "gizmo", this.liveCameras.add(ce);
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
            color: w ? r.marker : r.frustum,
            transparent: !0,
            opacity: 0.12,
            depthTest: !1,
            side: e.DoubleSide
          }));
          Ge.userData.omnicamWidget = "gizmo", this.liveCameras.add(Ge);
        }
        if (D > 0.01) {
          const k = a && u === "camera_target", Y = new e.BufferGeometry().setFromPoints([c, b]), S = new e.Line(Y, new e.LineDashedMaterial({
            color: w || k ? 9133302 : r.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: w || k ? 1 : a ? 0.75 : 0.4
          }));
          S.userData.omnicamWidget = "lookat", this.liveCameras.add(S);
          const O = k ? 0.12 : w ? 0.11 : 0.08, R = [
            b.clone().add(new e.Vector3(-O, 0, 0)),
            b.clone().add(new e.Vector3(O, 0, 0)),
            b.clone().add(new e.Vector3(0, -O, 0)),
            b.clone().add(new e.Vector3(0, O, 0)),
            b.clone().add(new e.Vector3(0, 0, -O)),
            b.clone().add(new e.Vector3(0, 0, O))
          ], Q = new e.BufferGeometry().setFromPoints(R), $ = new e.LineSegments(Q, new e.LineBasicMaterial({
            color: k || w ? 9133302 : r.marker,
            linewidth: k ? 3 : 1,
            transparent: !0,
            opacity: k || w ? 1 : a ? 0.9 : 0.5
          }));
          $.userData.omnicamWidget = "lookat", this.liveCameras.add($);
          const K = new e.SphereGeometry(0.28, 8, 6), ee = new e.Mesh(K, U);
          if (ee.position.copy(b), ee.userData = { omnicamType: "camera_target", omnicamId: m.id }, this.liveCameras.add(ee), (k || w) && l !== "camera") {
            const X = new e.RingGeometry(0.14, 0.18, 24);
            X.rotateX(Math.PI / 2);
            const x = new e.MeshBasicMaterial({ color: ye.typeLookAt, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), _ = new e.Mesh(X, x);
            _.position.copy(b), _.userData.omnicamWidget = "lookat", this.liveCameras.add(_);
          }
        }
        if (a && l !== "camera" && u === "camera") {
          const k = new e.RingGeometry(0.19, 0.24, 32);
          k.rotateX(Math.PI / 2);
          const Y = new e.MeshBasicMaterial({ color: ye.accent, side: e.DoubleSide, transparent: !0, opacity: 1 }), S = new e.Mesh(k, Y);
          S.position.copy(c), S.userData.omnicamWidget = "gizmo", this.liveCameras.add(S);
          const O = new e.RingGeometry(0.28, 0.31, 32);
          O.rotateX(Math.PI / 2);
          const R = new e.Mesh(O, new e.MeshBasicMaterial({ color: ye.accent, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          R.position.copy(c), R.userData.omnicamWidget = "gizmo", this.liveCameras.add(R);
        }
      });
    },
    updateSelection(y, t, s, l = null, u = "", n = !1) {
      const i = l ? `${l.mode || ""}:${l.objectId || ""}:${(l.point || []).join(",")}` : "", M = `${t}:${s || ""}:${(y.__selectedObjectIds || []).join(",")}:${u}:${i}:${n ? "ortho" : "persp"}`;
      if (M !== this.selectionKey) {
        if (this.selectionKey = M, F(this.selectionGroup), this.selectionGroup.clear(), t === "object" && s) {
          const m = this.objectNodes.get(s);
          if (m) {
            m.updateMatrixWorld(!0);
            try {
              const h = new e.Box3(), r = [];
              if (m.traverse((a) => {
                a.isBone && r.push(a);
              }), r.length > 0) {
                const a = new e.Vector3();
                for (const w of r)
                  w.getWorldPosition(a), h.expandByPoint(a);
                h.expandByScalar(0.2);
              } else
                h.setFromObject(m);
              if ((n || !G(m)) && !h.isEmpty() && Number.isFinite(h.min.x) && Number.isFinite(h.max.x) && Number.isFinite(h.min.y) && Number.isFinite(h.max.y) && Number.isFinite(h.min.z) && Number.isFinite(h.max.z)) {
                h.expandByScalar(0.04);
                const a = new e.Box3Helper(h, new e.Color(9133302));
                a.material.transparent = !0, a.material.opacity = 0.95, a.material.depthTest = !1, a.renderOrder = 9999, this.selectionGroup.add(a);
              }
            } catch {
            }
            if (y.show_wireframe) {
              let h = 0;
              m.traverse((r) => {
                if (!r.isMesh || !r.geometry || r.userData.omnicamHelper || h >= 64) return;
                const a = qt(e, r, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                a.renderOrder = 9998, this.selectionGroup.add(a), h += 1;
              });
            }
            if (l && l.objectId === s && l.point) {
              if (l.mode === "vertex") {
                const h = new e.SphereGeometry(0.08, 16, 12), r = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), a = new e.Mesh(h, r);
                a.position.fromArray(l.point), a.renderOrder = 1e4, this.selectionGroup.add(a);
                const w = new e.RingGeometry(0.1, 0.15, 24), P = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), f = new e.Mesh(w, P);
                f.position.fromArray(l.point), this.activeCamera && f.quaternion.copy(this.activeCamera.quaternion), f.renderOrder = 1e4, this.selectionGroup.add(f);
              } else if (l.mode === "edge" && l.edge) {
                const [h, r] = l.edge, a = new e.BufferGeometry().setFromPoints([new e.Vector3(...h), new e.Vector3(...r)]), w = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), P = new e.Line(a, w);
                P.renderOrder = 1e4, this.selectionGroup.add(P);
              } else if (l.mode === "face" && l.vertices) {
                const [h, r, a] = l.vertices, w = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...h),
                  new e.Vector3(...r),
                  new e.Vector3(...a)
                ]);
                w.setIndex([0, 1, 2]), w.computeVertexNormals();
                const P = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), f = new e.Mesh(w, P);
                f.renderOrder = 1e4, this.selectionGroup.add(f);
                const c = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...h),
                  new e.Vector3(...r),
                  new e.Vector3(...a),
                  new e.Vector3(...h)
                ]), b = new e.Line(c, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                b.renderOrder = 10001, this.selectionGroup.add(b);
              }
            }
          }
        }
        if (t === "object")
          for (const m of y.__selectedObjectIds || []) {
            if (m === s) continue;
            const h = this.objectNodes.get(m);
            if (h) {
              h.updateMatrixWorld(!0);
              try {
                const r = new e.Box3().setFromObject(h);
                if ((n || !G(h)) && !r.isEmpty() && Number.isFinite(r.min.x)) {
                  r.expandByScalar(0.04);
                  const a = new e.Box3Helper(r, new e.Color(10980346));
                  a.material.transparent = !0, a.material.opacity = 0.6, a.material.depthTest = !1, a.renderOrder = 9997, this.selectionGroup.add(a);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(y) {
      const t = this.objectNodes.get(y);
      if (!t) return [];
      const s = [], l = /* @__PURE__ */ new Set();
      return t.traverse((u) => {
        const n = u.isBone ? u.name : "";
        !n || l.has(n) || s.length >= 256 || (l.add(n), s.push(n));
      }), s;
    },
    /**
     * World position of `boneName` (or the model's animated centre when no bone
     * is named) at an arbitrary frame.
     *
     * The mixer is the only thing that knows where a bone sits at a given time,
     * so the model is posed at `frame`, probed, then posed back: a probe for a
     * frame other than the playhead must not leave the viewport showing it.
     */
    sampleModelPoint(y, t, s, l = 24) {
      const u = this.objectNodes.get(y);
      if (!u) return null;
      const n = this.models.get(y), i = n?.mixer && n.duration > 0, M = i ? n.mixer.time : null;
      i && (n.mixer.setTime(Math.max(0, s) / Math.max(1, l) % n.duration), u.updateMatrixWorld(!0));
      let m = null;
      if (t) {
        let h = null;
        if (u.traverse((r) => {
          !h && r.isBone && r.name === t && (h = r);
        }), h) {
          const r = new e.Vector3().setFromMatrixPosition(h.matrixWorld);
          m = [r.x, r.y, r.z];
        }
      } else
        m = this.getObjectWorldCenter(y);
      return i && Number.isFinite(M) && (n.mixer.setTime(M), u.updateMatrixWorld(!0)), m;
    },
    getObjectWorldBounds(y) {
      const t = this.objectNodes.get(y);
      if (!t) return null;
      t.updateWorldMatrix(!0, !0);
      const s = new e.Box3().setFromObject(t, !0), l = s.min.toArray(), u = s.max.toArray();
      return !s.isEmpty() && [...l, ...u].every(Number.isFinite) ? { min: l, max: u } : null;
    },
    getObjectWorldCenter(y) {
      const t = this.objectNodes.get(y);
      if (!t) return null;
      t.updateMatrixWorld(!0);
      const s = [];
      if (t.traverse((n) => {
        n.isBone && s.push(n);
      }), s.length > 0) {
        const n = new e.Vector3(), i = new e.Vector3();
        for (const M of s)
          M.getWorldPosition(i), n.add(i);
        return n.divideScalar(s.length), [n.x, n.y, n.z];
      }
      const l = new e.Box3().setFromObject(t);
      if (!l.isEmpty() && Number.isFinite(l.min.x)) {
        const n = l.getCenter(new e.Vector3());
        return [n.x, n.y, n.z];
      }
      const u = new e.Vector3();
      return t.getWorldPosition(u), [u.x, u.y, u.z];
    },
    /** Every bone name in a loaded model, for the Rig Mapper (design spec 23). */
    getModelBoneNames(y) {
      const t = this.objectNodes.get(y);
      if (!t) return [];
      const s = [];
      return t.traverse((l) => {
        l.isBone && l.name && s.push(l.name);
      }), s;
    },
    /** Resolve one loaded bone by name, plus its world position. */
    resolveModelBone(y, t) {
      const s = this.objectNodes.get(y);
      if (!s || !t) return null;
      let l = null;
      if (s.traverse((n) => {
        !l && n.isBone && n.name === t && (l = n);
      }), !l) return null;
      l.updateWorldMatrix(!0, !1);
      const u = new e.Vector3();
      return l.getWorldPosition(u), { name: t, world: [u.x, u.y, u.z] };
    },
    /**
     * Apply an FK pose to a loaded character (design spec section 29,
     * ui.characterRuntime.applyPose). `boneMap` is canonical joint -> bone name;
     * `joints` is canonical joint -> local quaternion [x,y,z,w]. Bones not named
     * by `joints` are left at their bind rotation, captured once per bone.
     */
    applyCharacterPose(y, t, s) {
      const l = this.objectNodes.get(y);
      if (!l) return !1;
      const u = /* @__PURE__ */ new Map();
      if (l.traverse((i) => {
        i.isBone && i.name && u.set(i.name, i);
      }), !u.size) return !1;
      for (const i of u.values())
        i.userData.omnicamBindQuat || (i.userData.omnicamBindQuat = i.quaternion.clone());
      const n = s && typeof s == "object" ? s : {};
      for (const [i, M] of Object.entries(t || {})) {
        const m = u.get(M);
        if (!m) continue;
        const h = n[i];
        Array.isArray(h) && h.length === 4 && h.every(Number.isFinite) ? m.quaternion.fromArray(h).normalize() : m.userData.omnicamBindQuat && m.quaternion.copy(m.userData.omnicamBindQuat), m.updateMatrixWorld(!0);
      }
      return this.invalidate(), !0;
    },
    /**
     * Read the current local rotation of every mapped canonical joint -- what
     * "Bake current frame to pose" samples off the live mixer (design spec
     * section 27). A joint still at its captured bind rotation is omitted.
     */
    sampleCharacterBonePose(y, t) {
      const s = this.objectNodes.get(y);
      if (!s || !t) return {};
      const l = /* @__PURE__ */ new Map();
      s.traverse((n) => {
        n.isBone && n.name && l.set(n.name, n);
      });
      const u = {};
      for (const [n, i] of Object.entries(t)) {
        const M = l.get(i);
        if (!M) continue;
        const m = M.userData.omnicamBindQuat;
        m && M.quaternion.angleTo(m) < 1e-4 || (u[n] = M.quaternion.toArray());
      }
      return u;
    }
  };
}
function Ht(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: g, OBJLoader: L, PLYLoader: p, STLLoader: v, neutral: C, wire: N, checkerMaterial: T, objectMaterial: q, applyModelMaterial: W, disposeObject: F, textureFor: re, cardMesh: te, generatePointField: Z, sampleCamera: E, sampleObjectTransform: ne } = o;
  function G(y) {
    const t = y.supersampleFactor?.() || 1;
    return { w: y.canvas.width / t, h: y.canvas.height / t };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(y) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: s } = G(this);
      this.pointer.set(y[0] / t * 2 - 1, -(y[1] / s) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const M = yt(i);
        if (M) return { ...M, position: i.object.position.toArray() };
      }
      const l = 16 * Math.min(2, window.devicePixelRatio || 1);
      let u = null;
      const n = new e.Vector3();
      for (const i of this.path.children) {
        const M = i.userData?.omnicamPathKey;
        if (!M || (n.copy(i.position).project(this.activeCamera), n.z < -1 || n.z > 1)) continue;
        const m = (n.x * 0.5 + 0.5) * t, h = (1 - (n.y * 0.5 + 0.5)) * s, r = Math.hypot(y[0] - m, y[1] - h);
        r <= l && (!u || r < u.distance) && (u = { key: M, position: i.position.toArray(), distance: r });
      }
      return u ? { ...u.key, position: u.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(y) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: s } = G(this);
      this.pointer.set(y[0] / t * 2 - 1, -(y[1] / s) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const M = gt(i);
        if (M) return { ...M, position: i.object.position.toArray() };
      }
      const l = 14 * Math.min(2, window.devicePixelRatio || 1);
      let u = null;
      const n = new e.Vector3();
      for (const i of this.path.children) {
        const M = i.userData?.omnicamCurveHandle;
        if (!M || (n.copy(i.position).project(this.activeCamera), n.z < -1 || n.z > 1)) continue;
        const m = (n.x * 0.5 + 0.5) * t, h = (1 - (n.y * 0.5 + 0.5)) * s, r = Math.hypot(y[0] - m, y[1] - h);
        r <= l && (!u || r < u.distance) && (u = { handle: M, position: i.position.toArray(), distance: r });
      }
      return u ? { ...u.handle, position: u.position } : null;
    },
    /**
     * The active camera-path segment (two neighbouring real keyframes, plus
     * a `t` 0..1 between them) nearest the pointer, for double-click-to-
     * insert (Task 8). `null` when the pointer isn't over the path tube.
     */
    pickPathSegment(y) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: s } = G(this);
      this.pointer.set(y[0] / t * 2 - 1, -(y[1] / s) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const l = this.raycaster.intersectObjects(this.path.children, !0).find((c) => c.object.userData?.omnicamPathSegments);
      if (!l) return null;
      const { cameraId: u, firstFrame: n, lastFrame: i, frames: M, points: m } = l.object.userData.omnicamPathSegments;
      if (!m?.length || M.length < 2) return null;
      let h = 0, r = 1 / 0;
      for (let c = 0; c < m.length; c += 1) {
        const [b, B, D] = m[c], I = b - l.point.x, A = B - l.point.y, j = D - l.point.z, U = I * I + A * A + j * j;
        U < r && (r = U, h = c);
      }
      const a = n + (i - n) * h / Math.max(1, m.length - 1);
      let w = M[0], P = M[M.length - 1];
      for (let c = 0; c < M.length - 1; c += 1)
        if (M[c] <= a && a <= M[c + 1]) {
          w = M[c], P = M[c + 1];
          break;
        }
      if (w === P) return null;
      const f = Math.min(1, Math.max(0, (a - w) / (P - w)));
      return { cameraId: u, leftFrame: w, rightFrame: P, t: f };
    },
    configureCamera(y, t) {
      const s = y || defaultCamera(), l = Math.max(5e-4, Number(s.near) || 0.01), u = Math.max(l + 1, Number(s.far) || 1e4);
      let n;
      if (s.camera_type === "orthographic") {
        n = this.orthographic;
        const a = 5 / Math.max(0.01, s.zoom || 1);
        n.left = -a * t, n.right = a * t, n.top = a, n.bottom = -a, n.near = l, n.far = u, n.updateProjectionMatrix();
      } else
        n = this.perspective, n.fov = e.MathUtils.clamp(Number(s.fov) || 35, 1, 175), n.aspect = t, n.near = l, n.far = u, n.updateProjectionMatrix();
      const i = new e.Vector3().fromArray(s.position || [6, 4, 6]), M = new e.Vector3().fromArray(s.target || [0, 1.5, 0]), m = M.clone().sub(i);
      m.lengthSq() < 1e-6 ? m.set(0, 0, -1) : m.normalize();
      let h = s.up ? new e.Vector3().fromArray(s.up) : new e.Vector3(0, 1, 0), r = new e.Vector3().crossVectors(m, h);
      if (r.lengthSq() < 1e-6 && (h = Math.abs(m.y) > 0.9 ? new e.Vector3(0, 0, m.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), r.crossVectors(m, h)), r.normalize(), h.crossVectors(r, m).normalize(), s.roll) {
        const a = e.MathUtils.degToRad(s.roll);
        r.applyAxisAngle(m, a), h.applyAxisAngle(m, a);
      }
      return n.position.copy(i), n.up.copy(h), n.lookAt(M), n.updateMatrixWorld(), n;
    },
    pick(y, t, s, l) {
      if (!this.activeCamera) return null;
      this.pointer.set(y / Math.max(1, s) * 2 - 1, 1 - t / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const u = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const n of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          n.object?.userData?.omnicamType && u.push({
            distance: n.distance,
            type: n.object.userData.omnicamType,
            id: n.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const n of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (n.object?.userData?.omnicamCaptureGuide || n.object?.userData?.omnicamHelper) continue;
          let i = n.object;
          for (; i && !i.userData?.omnicamId; ) i = i.parent;
          i?.userData?.omnicamId && u.push({
            distance: n.distance,
            type: "object",
            id: i.userData.omnicamId
          });
        }
      return u.length ? (u.sort((n, i) => n.distance - i.distance), { type: u[0].type, id: u[0].id }) : null;
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
    projectWorldToScreen(y, t = null, s = null) {
      if (!this.activeCamera || !Array.isArray(y) || y.length < 3) return null;
      const { w: l, h: u } = G(this), n = t != null && s != null ? t : l, i = t != null && s != null ? s : u, M = new e.Vector3(Number(y[0]) || 0, Number(y[1]) || 0, Number(y[2]) || 0);
      return M.project(this.activeCamera), {
        x: (M.x * 0.5 + 0.5) * n,
        y: (1 - (M.y * 0.5 + 0.5)) * i,
        behind: M.z < -1 || M.z > 1,
        width: n,
        height: i
      };
    },
    pickSubElement(y, t, s, l, u = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(y / Math.max(1, s) * 2 - 1, 1 - t / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const n = this.raycaster.intersectObjects(this.content.children, !0);
      for (const i of n) {
        let M = i.object, m = i.object;
        for (; M && !M.userData.omnicamId; ) M = M.parent;
        if (!M?.userData.omnicamId || !m.geometry) continue;
        const h = M.userData.omnicamId, a = m.geometry.getAttribute("position");
        if (!a) continue;
        m.updateMatrixWorld(!0);
        const w = m.matrixWorld;
        if (u === "vertex") {
          let P = -1, f = 1 / 0, c = null;
          if (i.face) {
            const b = [i.face.a, i.face.b, i.face.c];
            for (const B of b) {
              const D = new e.Vector3(a.getX(B), a.getY(B), a.getZ(B)).applyMatrix4(w), I = D.distanceTo(i.point);
              I < f && (f = I, P = B, c = [D.x, D.y, D.z]);
            }
          } else
            for (let b = 0; b < a.count; b++) {
              const B = new e.Vector3(a.getX(b), a.getY(b), a.getZ(b)).applyMatrix4(w), D = B.distanceTo(i.point);
              D < f && (f = D, P = b, c = [B.x, B.y, B.z]);
            }
          if (c)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: h,
              index: P,
              point: c
            };
        }
        if (u === "edge" && i.face) {
          const P = new e.Vector3(a.getX(i.face.a), a.getY(i.face.a), a.getZ(i.face.a)).applyMatrix4(w), f = new e.Vector3(a.getX(i.face.b), a.getY(i.face.b), a.getZ(i.face.b)).applyMatrix4(w), c = new e.Vector3(a.getX(i.face.c), a.getY(i.face.c), a.getZ(i.face.c)).applyMatrix4(w), b = (j, U, k) => {
            const Y = new e.Line3(U, k), S = new e.Vector3();
            return Y.closestPointToPoint(j, !0, S), { dist: j.distanceTo(S), point: S, segment: [U, k] };
          }, B = b(i.point, P, f), D = b(i.point, f, c), I = b(i.point, c, P), A = [B, D, I].reduce((j, U) => U.dist < j.dist ? U : j);
          return {
            type: "edge",
            mode: "edge",
            objectId: h,
            point: [A.point.x, A.point.y, A.point.z],
            edge: [
              [A.segment[0].x, A.segment[0].y, A.segment[0].z],
              [A.segment[1].x, A.segment[1].y, A.segment[1].z]
            ]
          };
        }
        if (u === "face" && i.face) {
          const P = new e.Vector3(a.getX(i.face.a), a.getY(i.face.a), a.getZ(i.face.a)).applyMatrix4(w), f = new e.Vector3(a.getX(i.face.b), a.getY(i.face.b), a.getZ(i.face.b)).applyMatrix4(w), c = new e.Vector3(a.getX(i.face.c), a.getY(i.face.c), a.getZ(i.face.c)).applyMatrix4(w), b = new e.Vector3().add(P).add(f).add(c).divideScalar(3), B = i.face.normal.clone().transformDirection(w);
          return {
            type: "face",
            mode: "face",
            objectId: h,
            faceIndex: i.faceIndex,
            point: [b.x, b.y, b.z],
            normal: [B.x, B.y, B.z],
            vertices: [
              [P.x, P.y, P.z],
              [f.x, f.y, f.z],
              [c.x, c.y, c.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(y, t, s, l) {
      if (!this.activeCamera) return null;
      this.pointer.set(y / Math.max(1, s) * 2 - 1, 1 - t / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const u = this.raycaster.intersectObjects(this.content.children, !0);
      if (u.length > 0)
        return [u[0].point.x, u[0].point.y, u[0].point.z];
      const n = new e.Plane(new e.Vector3(0, 1, 0), 0), i = new e.Vector3();
      return this.raycaster.ray.intersectPlane(n, i) ? [i.x, i.y, i.z] : null;
    }
  };
}
const xe = ["high", "balanced", "low"], Jt = 25, Te = 30, Et = 0.6;
function Fe(o = "balanced") {
  return { quality: o, samples: [], downgraded: !1 };
}
function er(o) {
  const e = xe.indexOf(o);
  return e < 0 || e >= xe.length - 1 ? null : xe[e + 1];
}
function tr(o, e) {
  if (!Number.isFinite(e) || e < 0 || (o.samples.push(e), o.samples.length > Te && o.samples.shift(), o.samples.length < Te) || o.samples.filter((L) => L > Jt).length / o.samples.length < Et) return null;
  const g = er(o.quality);
  return g ? (o.quality = g, o.downgraded = !0, o.samples = [], g) : null;
}
function rr(o, e) {
  return o.quality = e, o.samples = [], o.downgraded = !1, o;
}
function or(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: g, OBJLoader: L, PLYLoader: p, STLLoader: v, neutral: C, wire: N, checkerMaterial: T, objectMaterial: q, applyModelMaterial: W, disposeObject: F, textureFor: re, cardMesh: te, generatePointField: Z, sampleCamera: E, sampleObjectTransform: ne, hasOutlineMesh: G, SelectionOutlineRenderer: y } = o;
  return {
    render(t, s, l, u, n, i = /* @__PURE__ */ new Map(), M = 0, m = !1, h = "camera", r = "subject", a = null, w = null, P = null, f = "auto") {
      const c = m && f === "clay" ? !0 : m && (f === "motion_proxy" || f === "depth_rich") ? !1 : !m || (t.render_mode || "") === "beauty";
      if (c !== this.studioEnabled) {
        this.studioEnabled = c, qe(e, this.scene, this.renderer, this.studio, c);
        for (const x of this.flatLights || []) x.visible = !c;
      }
      const b = !!t.objects?.some((x) => x.type === "sun_light" && x.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !b && c), this.flatLights?.[1] && (this.flatLights[1].visible = !b && !c), this.disposed) return;
      (this.canvas.width !== u || this.canvas.height !== n) && this.renderer.setSize(u, n, !1);
      const B = (s && s.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const D = t.viewport_bg_sequence && t.viewport_bg_sequence.length ? t.viewport_bg_sequence[M % t.viewport_bg_sequence.length] : t.viewport_bg_image || "";
      if (D) {
        this.bgImageUrl = D;
        const x = this.bgTextureCache.get(D);
        if (x)
          this.bgTextureCache.delete(D), this.bgTextureCache.set(D, x), this.bgTexture = x, this.scene.background = x;
        else if (!this.bgTextureLoads.has(D)) {
          const _ = this.bgLoadGeneration;
          this.bgTextureLoads.set(D, _), new e.TextureLoader().load(D, (z) => {
            if (this.bgTextureLoads.delete(D), this.disposed || _ !== this.bgLoadGeneration) {
              z.dispose();
              return;
            }
            for (z.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(D, z); this.bgTextureCache.size > 8; ) {
              const H = [...this.bgTextureCache.keys()].find((de) => de !== this.bgImageUrl);
              if (!H) break;
              const J = this.bgTextureCache.get(H);
              this.bgTextureCache.delete(H), J?.dispose?.();
            }
            this.bgImageUrl === D && (this.bgTexture = z, this.scene.background = z), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(D);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const _ of new Set(this.bgTextureCache.values())) _.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const x = t.viewport_bg_color && t.viewport_bg_color !== Ve;
        this.scene.background = this.studioEnabled && !x && !B ? this.studio.sky : new e.Color(x ? t.viewport_bg_color : this.studioEnabled && B ? 1447709 : Ve);
      }
      const I = JSON.stringify([
        t.render_mode,
        t.card_fit,
        t.point_density,
        t.point_spread,
        !!t.show_wireframe,
        !!t.show_vertices,
        !!t.backface_culling,
        t.reconstruction_appearance || "neutral",
        !!m,
        f,
        t.objects.map((x) => {
          const { position: _, rotation: V, keyframes: z, size: H, ...J } = x;
          return x.type === "card" && (J.size = H), J;
        })
      ]), A = [...l.entries()].map(([x, _]) => `${x}:${_?.src || ""}`).join("|"), j = [...i.entries()].map(([x, _]) => `${x}:${_}`).join("|");
      (I !== this.sceneKey || A !== this.mediaSignature || j !== this.modelSignature) && (this.sceneKey = I, this.mediaSignature = A, this.modelSignature = j, this.rebuild(t, l, i, m, f));
      const U = Math.max(1, t.fps || 24), k = /* @__PURE__ */ new Map();
      for (const x of t.objects)
        x.character?.motion && this.models.has(x.id) && k.set(x.id, x.character.motion);
      for (const [x, _] of this.models) {
        if (!_.mixer || !(_.duration > 0)) continue;
        const V = k.get(x);
        V ? (this.applyMotionClip?.(x, V), _.mixer.setTime(xt(V, M, U, _.duration))) : _.mixer.setTime(M / U % _.duration);
      }
      for (const x of t.objects) {
        const _ = this.objectNodes.get(x.id);
        if (!_) continue;
        const V = x.keyframes?.length ? ne(x, M) : x;
        _.position.fromArray(V.position || [0, 0, 0]), _.rotation.set(...(V.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), x.type !== "card" && x.type !== "null" && _.scale.fromArray(V.size || [1, 1, 1]), x.type === "null" && (_.visible = m ? !0 : t.show_helper_axes !== !1);
      }
      this.path.visible = !m;
      const Y = t.show_grid !== !1 && t.render_mode !== "point_field", S = f === "depth_rich" || !!t.playblast_grid;
      this.gridGroup.visible = m ? S : Y;
      const O = t.view_mode || "camera", R = Array.isArray(P) ? [...P].sort((x, _) => x - _).join(",") : "", Q = `${O}:${h}:${w ?? ""}:${R}:${t.__omnicamRevision ?? JSON.stringify([
        t.active_camera_id,
        (t.cameras || []).map((x) => [x.id, x.keyframes?.length, x.keyframes?.map((_) => [_.frame, _.camera?.position, _.camera?.target, _.interpolation, _.tangents])]),
        (t.objects || []).map((x) => [x.id, x.keyframes?.length, x.keyframes?.map((_) => [_.frame, _.transform?.position])])
      ])}`;
      if (Q !== this.pathKey && (this.pathKey = Q, this.rebuildPath(t, h, w, O, P)), this.updateLiveCameras(t, M, m, O, h, w), this.liveCameras.visible = !m, !m) {
        const x = t.show_camera_paths !== !1, _ = t.show_camera_gizmos !== !1, V = t.show_look_at !== !1;
        for (const z of [this.path, this.liveCameras])
          z.traverse((H) => {
            const J = H.userData.omnicamWidget;
            J === "path" ? H.visible = x : J === "gizmo" ? H.visible = _ : J === "lookat" && (H.visible = V);
          });
      }
      const $ = u / Math.max(1, n), K = this.configureCamera(s, $);
      if (this.activeCamera = K, m ? this.selectionGroup.visible = !1 : (this.updateSelection(t, h, r, a, `${t.__omnicamRevision ?? "legacy"}:${M}`, B), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const x = new e.Box3();
        this.content.traverse((V) => {
          if (!V.isMesh || V.userData.omnicamCaptureGuide) return;
          V.castShadow = !0, V.receiveShadow = !0, V.updateWorldMatrix(!0, !1);
          const z = new e.Box3().setFromObject(V);
          !z.isEmpty() && Number.isFinite(z.min.x) && x.union(z);
        });
        const _ = this.studio?.key;
        if (_) {
          const V = x.isEmpty() ? new e.Vector3() : x.getCenter(new e.Vector3()), z = x.isEmpty() ? new e.Vector3(12, 12, 12) : x.getSize(new e.Vector3()), H = Math.max(1, 0.5 * Math.max(z.x, z.y, z.z) * Math.SQRT2), J = H * 1.15 + 0.5, de = new e.Vector3(4.5, 7.5, 3.5).normalize(), ce = Math.max(12, H * 4);
          _.position.copy(V).addScaledVector(de, ce), _.target.position.copy(V), _.target.updateMatrixWorld(!0);
          const oe = _.shadow.camera;
          oe.left = -J, oe.right = J, oe.top = J, oe.bottom = -J, oe.near = Math.max(0.1, ce - H - 1), oe.far = ce + H + 1, oe.updateProjectionMatrix(), _.shadow.map?.dispose(), _.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((x) => {
        x.userData.omnicamBillboard && x.quaternion.copy(K.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, u, n);
      const ee = performance.now();
      let X = !1;
      if (!m && !B && h === "object" && (r || t.__selectedObjectIds?.length) && !a) {
        const x = t.__selectedObjectIds?.length ? t.__selectedObjectIds : r ? [r] : [], _ = [];
        for (const V of x) {
          const z = this.objectNodes.get(V);
          z && G(z) && _.push(z);
        }
        _.length && (this.outlineRenderer || (this.outlineRenderer = new y(this.renderer, this.scene, void 0, K)), this.outlineRenderer.render(K, u, n, _), X = !0);
      }
      if (X || this.renderer.render(this.scene, K), !m && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Fe(this.studio?.quality);
        const x = tr(this.qualityMonitor, performance.now() - ee);
        x && (De(this.studio, this.renderer, x), this.onQualityDowngrade?.(x));
      }
    },
    setViewportQuality(t) {
      De(this.studio, this.renderer, t), this.qualityMonitor = rr(this.qualityMonitor || Fe(t), t);
    },
    // Supersample multiple the host blit renders the interactive viewport at
    // before scaling it back down -- the cheapest edge antialiasing there is.
    // 1 while the studio look is off (a neutral capture), and 1 at "low" so a
    // struggling GPU is never asked to draw more pixels.
    supersampleFactor() {
      return this.studioEnabled && Bt(this.studio?.quality).renderScale || 1;
    },
    dispose() {
      if (!this.disposed) {
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), F(this.content), F(this.gridGroup), F(this.path), F(this.liveCameras), F(this.selectionGroup);
        for (const t of new Set(this.bgTextureCache.values())) t.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const t of this.models.values()) F(t.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.outlineRenderer?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
const sr = {
  EffectComposer: Je,
  OutlinePass: He,
  OutputPass: Ze,
  RenderPass: Qe,
  Vector2: je
};
function nr(o) {
  let e = !1;
  return o?.traverse?.((d) => {
    e || d.visible === !1 || !d.isMesh || d.userData?.omnicamHelper || d.userData?.omnicamCaptureGuide || (e = !!(d.geometry && d.material));
  }), e;
}
class ar {
  constructor(e, d, g = sr, L = null) {
    const { EffectComposer: p, RenderPass: v, OutlinePass: C, OutputPass: N, Vector2: T } = g;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new p(e), this.renderPass = new v(d, L), this.outlinePass = new C(new T(1, 1), d, L, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new N(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, d, g, L) {
    this.disposed || ((d !== this.width || g !== this.height) && (this.width = d, this.height = g, this.composer.setSize(d, g)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...L], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const ze = { low: jt, balanced: zt, high: Ft }, me = new Ce({ color: 10265519, roughness: 0.48, metalness: 0.06, side: se }), Ke = new Ce({ color: 2237998, roughness: 0.95, metalness: 0, side: se }), _e = new Me({ color: 11449792, wireframe: !0, side: se });
function Le(o = !1) {
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
  ]), d = new mt(e, 2, 2, ht);
  return d.wrapS = d.wrapT = ft, d.repeat.set(8, 8), d.colorSpace = ve, d.needsUpdate = !0, new Ce({ map: d, roughness: 0.85, metalness: 0, side: o ? Be : se });
}
function ir(o, e, d = !1) {
  const g = e === "wireframe" ? "wireframe" : o.material_mode || "textured", L = d ? Be : se;
  if (g === "wireframe") {
    const v = _e.clone();
    return v.side = L, o.color && (v.color = new ie(o.color)), v;
  }
  if (g === "checker") return Le(d);
  if (g === "matte") {
    const v = Ke.clone();
    return v.side = L, o.color && (v.color = new ie(o.color)), v;
  }
  const p = me.clone();
  return p.side = L, o.color && (p.color = new ie(o.color)), p;
}
function cr(o, e, d = null, g = !1) {
  const L = g ? Be : se;
  o.traverse((p) => {
    if (p.isMesh) {
      if (p.userData.omnicamOriginalMaterial || (p.userData.omnicamOriginalMaterial = p.material), p.userData.omnicamOverrideMaterial) {
        const v = Array.isArray(p.material) ? p.material : [p.material];
        for (const C of v)
          C?.map?.dispose?.(), C?.dispose?.();
        p.userData.omnicamOverrideMaterial = !1;
      }
      if (e === "textured" || e === "wireframe_texture") {
        p.material = p.userData.omnicamOriginalMaterial;
        const v = Array.isArray(p.material) ? p.material : [p.material];
        for (const C of v)
          C && (C.side = L);
      } else if (e === "checker")
        p.material = Le(g), p.userData.omnicamOverrideMaterial = !0;
      else if (e === "wireframe") {
        const v = _e.clone();
        v.side = L, d?.color && (v.color = new ie(d.color)), p.material = v, p.userData.omnicamOverrideMaterial = !0;
      } else if (e === "matte") {
        const v = Ke.clone();
        v.side = L, d?.color && (v.color = new ie(d.color)), p.material = v, p.userData.omnicamOverrideMaterial = !0;
      } else {
        const v = me.clone();
        v.side = L, d?.color && (v.color = new ie(d.color)), p.material = v, p.userData.omnicamOverrideMaterial = !0;
      }
    }
  });
}
function be(o, e = !1) {
  o.traverse((d) => {
    if (d.userData.omnicamModelResource && !e) return;
    d.geometry?.dispose?.();
    const g = Array.isArray(d.material) ? d.material : [d.material];
    for (const L of g)
      L?.map?.userData?.omnicamSharedResource || L?.map?.dispose?.(), L?.dispose?.();
  });
}
function Ye(o) {
  if (!o) return null;
  const e = o instanceof HTMLVideoElement ? new pt(o) : new wt(o);
  return e.colorSpace = ve, e.needsUpdate = !0, e;
}
function lr(o, e, d) {
  e && St(o, e);
  const [g, L] = o.size || [2, 3], p = new ae(), v = new pe(new Pe(g, L), new Me({ color: 1448482, side: se, transparent: !0, opacity: 0.85 }));
  v.frustumCulled = !1, p.add(v);
  let C = e ? Ye(e) : null;
  if (!C && (o.id === "subject" || !o.asset) && (C = Pt(ue)), !C) return p;
  const T = e?.videoWidth || e?.naturalWidth || e?.width || g, q = e?.videoHeight || e?.naturalHeight || e?.height || L, W = T / Math.max(1, q), F = g / Math.max(0.01, L);
  let re = g, te = L;
  d === "contain" ? W > F ? te = g / W : re = L * W : d === "cover" && (W > F ? (C.repeat.x = F / W, C.offset.x = (1 - C.repeat.x) * 0.5) : (C.repeat.y = W / F, C.offset.y = (1 - C.repeat.y) * 0.5));
  const Z = new pe(
    new Pe(re, te),
    new Me({
      color: 16777215,
      map: C,
      side: se,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return Z.frustumCulled = !1, Z.position.z = 2e-3, p.add(Z), p.frustumCulled = !1, p;
}
class dr {
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
    }), this.renderer.setPixelRatio(1), this.renderer.outputColorSpace = ve, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = et, this.scene = new tt(), this.scene.background = new ie(1184274), this.scene.add(new rt(16777215, 3159099, 2.2));
    const g = new ot(16777215, 2.4);
    g.position.set(5, 8, 4), this.scene.add(g), this.flatLights = [this.scene.children.at(-2), g], this.studio = _t(ue, this.renderer, Gt), this.scene.add(this.studio.group), this.studioEnabled = !0, qe(ue, this.scene, this.renderer, this.studio, !0), this.content = new ae(), this.scene.add(this.content), this.gridGroup = Yt(ue), this.gridGroup.userData.omnicamPersistent = !0, this.content.add(this.gridGroup), this.path = new ae(), this.scene.add(this.path), this.liveCameras = new ae(), this.scene.add(this.liveCameras), this.selectionGroup = new ae(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new st(35, 16 / 9, 0.01, 1e4), this.orthographic = new nt(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = d, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new at(), this.pointer = new je(), this.activeCamera = this.perspective;
  }
  async loadModel(e, d, g = "glb") {
    const L = `${g}:${d}`;
    if (!(!d || this.modelLoads.get(e) === L)) {
      this.modelLoads.set(e, L);
      try {
        let p, v = [];
        if (g === "obj") p = await new We().loadAsync(d);
        else if (g === "fbx")
          p = await new Ie().loadAsync(d), v = p.animations || [];
        else if (g === "stl") p = new pe(await new Ne().loadAsync(d), me.clone());
        else if (g === "ply") {
          const s = await new Ue().loadAsync(d);
          s.index ? (s.getAttribute("normal") || s.computeVertexNormals(), p = new pe(s, me.clone())) : p = new it(s, new ct({ color: 11449792, size: 0.025 }));
        } else {
          const s = await new Re().loadAsync(d);
          p = s.scene, v = s.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== L) {
          be(p, !0);
          return;
        }
        const C = this.models.get(e);
        C && be(C.scene, !0), p.traverse((s) => {
          if (s.userData.omnicamModelResource = !0, s.frustumCulled = !1, s.isMesh && (s.frustumCulled = !1, s.material)) {
            const l = Array.isArray(s.material) ? s.material : [s.material];
            for (const u of l)
              u.side = se;
          }
          s.isPoints && (s.frustumCulled = !1), s.isSkinnedMesh && (s.frustumCulled = !1, s.computeBoundingBox?.(), s.computeBoundingSphere?.());
        });
        let N = 0, T = 0, q = 0, W = 0;
        p.traverse((s) => {
          s.isMesh && (N += 1, W += s.geometry?.getAttribute?.("position")?.count || 0), s.isPoints && (T += 1), s.isBone && (q += 1);
        });
        const F = new ae();
        if (F.frustumCulled = !1, F.add(p), !N && !T && q) {
          const s = new lt(p);
          s.material.depthTest = !1, s.material.opacity = 0.9, s.material.transparent = !0, s.renderOrder = 10, s.userData.omnicamModelResource = !0, F.add(s);
        }
        F.updateMatrixWorld(!0);
        const re = new dt().setFromObject(F), te = re.getSize(new Se()), Z = Math.max(te.x, te.y, te.z), E = Number.isFinite(Z) && Z > 1e-6 ? 2.5 / Z : 1, ne = re.getCenter(new Se());
        F.scale.setScalar(E), F.position.set(-ne.x * E, -re.min.y * E, -ne.z * E);
        const G = new ae();
        G.frustumCulled = !1, G.add(F);
        const y = v.length ? new ut(p) : null;
        y && y.clipAction(v[0]).play();
        const t = { url: d, format: g, scene: G, mixer: y, clips: v, selectedClip: 0, duration: v[0]?.duration || 0, meshes: N, points: T, bones: q, vertices: W, animations: v.length, normalizationScale: E };
        this.models.set(e, t), this.onModelLoaded({ id: e, format: g, meshes: N, points: T, bones: q, vertices: W, animations: v.length, animationNames: v.map((s, l) => s.name || `Clip ${l + 1}`), duration: t.duration, normalizationScale: E }), this.sceneKey = "", this.invalidate();
      } catch (p) {
        this.modelLoads.get(e) === L && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${g.toUpperCase()} ${e}`, p);
        const v = p?.message?.includes("FBX version not supported") || p?.message?.includes("6100") || p?.message?.includes("6000"), C = v ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : p?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: g, error: C, isLegacyFBX: v });
      }
    }
  }
}
const he = { THREE: ue, FBXLoader: Ie, GLTFLoader: Re, OBJLoader: We, PLYLoader: Ue, STLLoader: Ne, neutral: me, wire: _e, checkerMaterial: Le, objectMaterial: ir, applyModelMaterial: cr, disposeObject: be, textureFor: Ye, cardMesh: lr, generatePointField: Mt, sampleCamera: bt, sampleObjectTransform: vt, hasOutlineMesh: nr, SelectionOutlineRenderer: ar };
Object.assign(
  dr.prototype,
  Qt(he),
  Zt(he),
  Ht(he),
  or(he)
);
async function ur(o, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const d of ["vp9", "vp8"])
    try {
      if (await fe(Wt(d, { width: o, height: e }), 5e3, `Checking ${d} support`)) return d;
    } catch {
    }
  return null;
}
function fe(o, e, d) {
  let g;
  return Promise.race([
    o,
    new Promise((L, p) => {
      g = setTimeout(() => p(new Error(`${d} timed out`)), e);
    })
  ]).finally(() => clearTimeout(g));
}
async function xr(o, e, d, g, L, p = "balanced") {
  const v = await ur(o.width, o.height);
  if (!v) throw new Error("No supported WebCodecs WebM encoder");
  const C = new At({ format: new kt(), target: new Ot() }), N = new Tt(o, { codec: v, quality: ze[p] || ze.balanced, keyFrameInterval: 1 });
  C.addVideoTrack(N, { frameRate: d }), await fe(C.start(), 1e4, "Starting deterministic encoder");
  try {
    const T = 1 / d;
    for (let q = 0; q < e; q++) {
      if (L?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await g(q), await fe(N.add(q * T, T, { keyFrame: q % d === 0 }), 1e4, `Encoding frame ${q + 1}`);
    }
    await fe(C.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (T) {
    throw C.state !== "finalized" && await C.cancel().catch(() => {
    }), T;
  }
  return Lt(new Blob([C.target.buffer], { type: await C.getMimeType() }), {
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
  dr as OmniWebGLViewport,
  xr as encodeDeterministicPlayblast,
  ur as supportsDeterministicEncoding
};
