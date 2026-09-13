import { T as ye } from "./chunk-__IQ4xkd.js";
import { V as Fe, a as Ke, O as Ye, b as He, E as Qe, W as Ze, S as be, P as Je, c as Ee, C as ce, H as et, D as tt, G as ie, d as ot, e as rt, f as at, g as ze, F as We, M as he, h as je, i as ve, j as Ie, k as st, l as nt, m as Ne, n as re, o as it, B as ct, p as Ge, A as lt, q as Me, r as Ce, s as Ae, t as dt, u as ut, v as mt, w as ht, x as ft } from "./vendor-three-BQUrLQkn.js";
import { bz as pt, bA as wt, bB as gt, a_ as yt, s as Mt, f as xt } from "./chunk-CxXyW-I9.js";
import { s as bt, r as vt, q as Ct, a as Ve, b as Ue, D as De, c as Bt, d as Lt, e as _t } from "./chunk-B4YjagC3.js";
import { c as St } from "./chunk-a2yd8Eqb.js";
import { Output as Gt, BufferTarget as At, WebMOutputFormat as Vt, CanvasSource as Dt, QUALITY_HIGH as Pt, QUALITY_MEDIUM as kt, QUALITY_LOW as Ot, canEncodeVideo as Tt } from "./vendor-mediabunny-CZ5VNE-V.js";
function Ft(o, { position: e, forward: m, up: w, color: B, scale: h = 1, active: v = !0 }) {
  const x = new o.Group(), q = v ? 0.95 : 0.5, W = new o.MeshBasicMaterial({
    color: B,
    transparent: !0,
    opacity: q,
    depthTest: !1
  }), D = new o.Mesh(new o.BoxGeometry(0.34, 0.24, 0.42), W);
  D.renderOrder = 912, x.add(D);
  const N = new o.Mesh(new o.ConeGeometry(0.17, 0.26, 20), W);
  return N.rotation.x = -Math.PI / 2, N.position.z = -0.32, N.renderOrder = 912, x.add(N), x.scale.setScalar(h), x.position.copy(e), x.up.copy(w), x.lookAt(e.clone().add(m)), x;
}
function zt(o, { position: e, color: m = 15903035, radius: w = 0.28, bold: B = !1 }) {
  const h = new o.Group(), v = B ? 16773544 : m, x = new o.LineBasicMaterial({ color: v, transparent: !0, opacity: B ? 1 : 0.95, depthTest: !1 }), q = (N) => {
    const R = [];
    for (let ee = 0; ee <= 48; ee++) {
      const Q = ee / 48 * Math.PI * 2;
      R.push(new o.Vector3(Math.cos(Q) * N, Math.sin(Q) * N, 0));
    }
    const H = new o.Line(new o.BufferGeometry().setFromPoints(R), x);
    return H.renderOrder = 915, H;
  };
  if (h.add(q(w)), B) {
    h.add(q(w * 1.18));
    const N = new o.Mesh(
      new o.RingGeometry(0, w * 0.3, 16),
      new o.MeshBasicMaterial({ color: v, transparent: !0, opacity: 1, depthTest: !1 })
    );
    N.renderOrder = 916, h.add(N);
  }
  const W = w * 1.55, D = new o.LineSegments(
    new o.BufferGeometry().setFromPoints([
      new o.Vector3(-W, 0, 0),
      new o.Vector3(-w * 0.45, 0, 0),
      new o.Vector3(w * 0.45, 0, 0),
      new o.Vector3(W, 0, 0),
      new o.Vector3(0, -W, 0),
      new o.Vector3(0, -w * 0.45, 0),
      new o.Vector3(0, w * 0.45, 0),
      new o.Vector3(0, W, 0)
    ]),
    x
  );
  return D.renderOrder = 915, h.add(D), h.position.copy(e), h.userData.omnicamBillboard = !0, h;
}
const Re = 3718648, Wt = 12e3;
function fe(o) {
  return !!(o.isSkinnedMesh && o.skeleton);
}
function qe(o, e) {
  o.position.copy(e.position), o.quaternion.copy(e.quaternion), o.scale.copy(e.scale);
}
function pe(o) {
  return o.frustumCulled = !1, o.raycast = () => {
  }, o.userData.omnicamHelper = !0, o;
}
function jt(o, e, { color: m = null, opacity: w = null } = {}) {
  const B = m ?? Re, h = w ?? 0.65;
  if (fe(e)) {
    const x = new o.SkinnedMesh(e.geometry.clone(), new o.MeshBasicMaterial({
      color: B,
      wireframe: !0,
      transparent: !0,
      opacity: h,
      depthWrite: !1
    }));
    return x.bindMode = e.bindMode, x.bind(e.skeleton, e.bindMatrix), qe(x, e), { overlay: pe(x), parent: e.parent || e };
  }
  const v = new o.LineSegments(
    new o.WireframeGeometry(e.geometry),
    new o.LineBasicMaterial({ color: B, opacity: h, transparent: !0, depthTest: !0 })
  );
  return { overlay: pe(v), parent: e };
}
function It(o, e) {
  const m = new o.PointsMaterial({ color: Re, size: 0.05, sizeAttenuation: !0 });
  if (!fe(e)) {
    const N = new o.Points(e.geometry, m);
    return { overlay: pe(N), parent: e };
  }
  const w = e.geometry.getAttribute("position")?.count || 0, B = Math.max(1, Math.ceil(w / Wt)), h = Math.ceil(w / B), v = new Float32Array(h * 3), x = new o.BufferGeometry();
  x.setAttribute("position", new o.Float32BufferAttribute(v, 3));
  const q = new o.Points(x, m);
  qe(q, e);
  const W = new o.Vector3(), D = x.getAttribute("position");
  return q.onBeforeRender = () => {
    for (let N = 0; N < h; N++)
      e.getVertexPosition(N * B, W), D.setXYZ(N, W.x, W.y, W.z);
    D.needsUpdate = !0;
  }, { overlay: pe(q), parent: e.parent || e };
}
function Nt(o, e, m) {
  const w = fe(e) ? new o.SkinnedMesh(e.geometry.clone(), m) : new o.Mesh(e.geometry.clone(), m);
  return fe(e) && (w.bindMode = e.bindMode, w.bind(e.skeleton, e.bindMatrix)), w.matrixAutoUpdate = !1, w.matrix.copy(e.matrixWorld), w.frustumCulled = !1, w;
}
function Ut(o, e, { wireframe: m = !1, vertices: w = !1, wireframeColor: B = null, wireframeOpacity: h = null } = {}) {
  if (!m && !w) return;
  const v = [];
  e.traverse((x) => {
    x.isMesh && x.geometry && !x.userData.omnicamHelper && v.push(x);
  });
  for (const x of v) {
    if (m) {
      const { overlay: q, parent: W } = jt(o, x, { color: B, opacity: h });
      W.add(q);
    }
    if (w) {
      const { overlay: q, parent: W } = It(o, x);
      W.add(q);
    }
  }
}
const Rt = 16777215, ne = 0.17, Pe = 3593923, qt = 0.06;
function Xt(o) {
  const { THREE: e, FBXLoader: m, GLTFLoader: w, OBJLoader: B, PLYLoader: h, STLLoader: v, neutral: x, wire: q, checkerMaterial: W, objectMaterial: D, applyModelMaterial: N, disposeObject: R, textureFor: te, cardMesh: H, generatePointField: ee, sampleCamera: Q, sampleObjectTransform: ae } = o;
  return {
    removeModel(L) {
      const g = this.models.get(L);
      g && R(g.scene, !0), this.models.delete(L), this.modelLoads.delete(L), this.sceneKey = "";
    },
    selectAnimation(L, g) {
      const t = this.models.get(L);
      !t?.mixer || !t.clips.length || (t.selectedClip = Math.max(0, Math.min(t.clips.length - 1, Number(g) || 0)), t.duration = t.clips[t.selectedClip].duration || 0, t.motionClipId = null, t.mixer.stopAllAction(), t.mixer.clipAction(t.clips[t.selectedClip]).play(), this.invalidate());
    },
    /** Select the clip a character motion names (by clip name, else index, else
     * the first clip). Idempotent -- re-selecting the same clip is a no-op so the
     * per-frame render loop can call it freely (design spec section 27). */
    applyMotionClip(L, g) {
      const t = this.models.get(L);
      if (!t?.mixer || !t.clips.length) return;
      const r = String(g?.clip_id ?? "");
      if (t.motionClipId === r) return;
      let i = t.clips.findIndex((a) => (a.name || "").toLowerCase() === r.toLowerCase());
      i < 0 && /^\d+$/.test(r) && (i = Number(r)), (i < 0 || i >= t.clips.length) && (i = 0), t.selectedClip = i, t.motionClipId = r, t.duration = t.clips[i].duration || 0, t.mixer.stopAllAction();
      const u = t.mixer.clipAction(t.clips[i]);
      u.reset(), u.play(), this.invalidate();
    },
    rebuild(L, g, t, r = !1) {
      this.content.traverse((s) => {
        for (const C of [...s.children])
          C.userData.omnicamHelper && (s.remove(C), R(C, !0));
      }), R(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const i = L.render_mode, u = new e.Group();
      u.userData.omnicamCaptureGuide = !0;
      const a = new e.GridHelper(120, 24, 4081496, 3291463);
      a.userData.omnicamCaptureGuide = !0, a.frustumCulled = !1, a.position.y = 5e-4, u.add(a);
      const n = new e.GridHelper(120, 120, 2238001, 1909035);
      n.userData.omnicamCaptureGuide = !0, n.frustumCulled = !1, u.add(n);
      const G = new e.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), y = new e.BufferGeometry().setFromPoints([new e.Vector3(-60, 1e-3, 0), new e.Vector3(60, 1e-3, 0)]), f = new e.Line(y, G);
      f.userData.omnicamCaptureGuide = !0, u.add(f);
      const M = new e.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), c = new e.BufferGeometry().setFromPoints([new e.Vector3(0, 1e-3, -60), new e.Vector3(0, 1e-3, 60)]), A = new e.Line(c, M);
      if (A.userData.omnicamCaptureGuide = !0, u.add(A), this.content.add(u), ["omni_ref", "point_field"].includes(i)) {
        const { points: s, colors: C } = ee(L.point_density || "balanced", L.point_spread || "all_views", L.point_color || null);
        if (s.length > 0) {
          const p = new e.BufferGeometry();
          p.setAttribute("position", new e.Float32BufferAttribute(s, 3)), p.setAttribute("color", new e.Float32BufferAttribute(C, 3));
          const _ = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), l = new e.Points(p, _);
          l.frustumCulled = !1, this.content.add(l);
        }
      }
      if (!["grid", "point_field"].includes(i))
        for (const s of L.objects) {
          if (s.enabled === !1) continue;
          const C = s.size || [1, 1, 1];
          let p;
          if (s.type === "glb" || s.type === "model") {
            const l = t.get(s.id), S = this.models.get(s.id), z = s.format || (s.type === "glb" ? "glb" : "");
            l && (S?.url !== l || S?.format !== z) && this.loadModel(s.id, l, z);
            const V = !!L.backface_culling, O = vt(s, L, r) ?? (s.material_mode || "textured");
            S?.url === l && (p = S.scene, N(p, O, s, V));
          } else if (s.type === "sphere")
            p = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), D(s, i, !!L.backface_culling));
          else if (s.type === "cylinder")
            p = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), D(s, i, !!L.backface_culling));
          else if (s.type === "torus") {
            const l = new e.TorusGeometry(0.5, 0.2, 16, 32);
            l.rotateX(Math.PI / 2), p = new e.Mesh(l, D(s, i, !!L.backface_culling));
          } else if (s.type === "pyramid") {
            const l = new e.ConeGeometry(0.7, 1, 4);
            l.rotateY(Math.PI / 4), p = new e.Mesh(l, D(s, i, !!L.backface_culling));
          } else if (s.type === "sun_light") {
            const l = new e.Group(), S = new e.DirectionalLight(s.color || 16774892, s.intensity ?? 2.2);
            S.castShadow = s.cast_shadow !== !1, S.castShadow && (S.shadow.mapSize.set(1024, 1024), S.shadow.bias = -8e-4, S.shadow.normalBias = 0.02, S.shadow.radius = 2.4, S.shadow.camera.near = 0.5, S.shadow.camera.far = 70, S.shadow.camera.left = S.shadow.camera.bottom = -14, S.shadow.camera.right = S.shadow.camera.top = 14);
            const z = (s.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), V = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(z[0], z[1], z[2], "YXZ"));
            S.target.position.copy(S.position).add(V.multiplyScalar(10)), l.add(S, S.target);
            const O = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: s.color || 16096779, wireframe: !0 })
            );
            O.userData.omnicamLightHelper = !0, O.visible = !r, l.add(O), p = l;
          } else if (s.type === "point_light") {
            const l = new e.Group(), S = new e.PointLight(s.color || 16777215, s.intensity ?? 2, 0, 2);
            l.add(S);
            const z = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: s.color || 16498468, wireframe: !0 })
            );
            z.userData.omnicamLightHelper = !0, z.visible = !r, l.add(z), p = l;
          } else if (s.type === "spot_light") {
            const l = new e.Group(), S = (s.cone_angle ?? 45) * Math.PI / 180, z = s.penumbra ?? 0.25, V = new e.SpotLight(s.color || 16777215, s.intensity ?? 3, 0, S, z, 2), O = (s.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), K = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(O[0], O[1], O[2], "YXZ"));
            V.target.position.copy(V.position).add(K.multiplyScalar(10)), l.add(V, V.target);
            const T = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: s.color || 3718648, wireframe: !0 })
            );
            T.userData.omnicamLightHelper = !0, T.visible = !r, l.add(T), p = l;
          } else if (s.type === "human")
            p = new e.Mesh(St(e), D(s, i, !!L.backface_culling));
          else if (s.type === "ground") p = new e.Mesh(new e.BoxGeometry(1, 1, 1), D(s, i, !!L.backface_culling));
          else if (s.type === "card")
            p = !s.material_mode || ["textured", "wireframe_texture"].includes(s.material_mode) ? H(s, g.get(s.id), L.card_fit || "contain") : new e.Mesh(new e.PlaneGeometry(C[0], C[1]), D(s, i, !!L.backface_culling));
          else if (s.type === "null") {
            const l = new e.AxesHelper(0.5);
            l.position.fromArray(s.position || [0, 0, 0]), l.userData.omnicamId = s.id, l.frustumCulled = !1, this.objectNodes.set(s.id, l), this.content.add(l);
            continue;
          } else
            p = new e.Mesh(new e.BoxGeometry(1, 1, 1), D(s, i, !!L.backface_culling));
          if (!p) continue;
          p.position.fromArray(s.position || [0, 0, 0]), p.rotation.set(...(s.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const _ = ["sun_light", "point_light", "spot_light"].includes(s.type);
          if (s.type !== "card" && !_ && p.scale.fromArray(C), p.userData.omnicamId = s.id, p.frustumCulled = !1, p.traverse((l) => {
            l.frustumCulled = !1, l.userData.omnicamId = s.id;
          }), !_) {
            const l = !!(L.show_wireframe || L.render_mode === "wireframe_texture" || s.material_mode === "wireframe_texture" || s.material_mode === "wireframe_neutral");
            Ut(e, p, { wireframe: l, vertices: L.show_vertices });
          }
          this.objectNodes.set(s.id, p), this.content.add(p);
        }
    },
    rebuildPath(L, g = "camera", t = null, r = "", i = null) {
      const u = Array.isArray(i) ? new Set(i) : null;
      R(this.path), this.path.clear();
      const a = r === "camera" ? L.active_camera_id : null, n = [
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
      (L.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: L.keyframes || [] }]).forEach((f, M) => {
        const c = f.keyframes || [];
        if (c.length === 0 || f.id === a) return;
        const A = f.color ? { line: new e.Color(f.color), marker: new e.Color(f.color), frustum: new e.Color(f.color) } : n[M % n.length], s = f.id === L.active_camera_id, C = s && g === "camera";
        if (c.length >= 2) {
          const p = c[0].frame, _ = c[c.length - 1].frame, l = Math.max(32, Math.min(256, _ - p + 1)), S = { ...f, keyframes: c, objects: L.objects }, z = Array.from({ length: l }, (P, F) => {
            const U = p + (_ - p) * F / Math.max(1, l - 1);
            return new e.Vector3().fromArray(Q(S, U, L.objects).position);
          }), V = new e.CatmullRomCurve3(z, !1, "centripetal"), O = C ? 0.06 : s ? 0.045 : 0.025, K = new e.MeshBasicMaterial({
            color: A.line,
            transparent: !0,
            opacity: s ? 1 : 0.55,
            depthTest: !1
          }), T = new e.Mesh(new e.TubeGeometry(V, Math.max(48, l), O, 8, !1), K);
          if (T.renderOrder = 900, T.userData.omnicamWidget = "path", this.path.add(T), s) {
            const P = new e.Mesh(
              new e.TubeGeometry(V, Math.max(48, l), O * (C ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: A.line, transparent: !0, opacity: C ? 0.3 : 0.18, depthTest: !1 })
            );
            if (P.renderOrder = 899, P.userData.omnicamWidget = "path", this.path.add(P), z.length >= 8) {
              const F = Math.max(6, Math.floor(l / 8));
              for (let U = Math.floor(F / 2); U < l - 1; U += F) {
                const $ = z[U], X = z[U + 1].clone().sub($).normalize(), J = new e.ConeGeometry(O * 1.5, O * 3, 8);
                J.rotateX(Math.PI / 2);
                const Z = new e.Quaternion().setFromUnitVectors(new e.Vector3(0, 0, 1), X), d = new e.Mesh(J, new e.MeshBasicMaterial({ color: A.marker, transparent: !0, opacity: 0.85, depthTest: !1 }));
                d.quaternion.copy(Z), d.position.copy($), d.renderOrder = 901, d.userData.omnicamWidget = "path", this.path.add(d);
              }
            }
          }
        }
        for (const p of c) {
          const _ = c.indexOf(p), l = s, S = new e.Mesh(
            new e.SphereGeometry(l ? ne : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: l ? Rt : A.marker, depthTest: !1 })
          );
          S.position.fromArray(p.camera.position), S.renderOrder = 910, S.userData.omnicamPathKey = { cameraId: f.id, frame: p.frame }, S.userData.omnicamWidget = "path", this.path.add(S);
          const z = new e.Mesh(
            new e.RingGeometry((l ? ne : 0.085) * 1.3, (l ? ne : 0.085) * 1.7, 24),
            new e.MeshBasicMaterial({ color: l ? 16777215 : A.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          z.position.fromArray(p.camera.position), z.renderOrder = 909, z.userData.omnicamBillboard = !0, z.userData.omnicamWidget = "path", this.path.add(z);
          const V = new e.Vector3().fromArray(p.camera.position), O = new e.Vector3().fromArray(p.camera.target || [0, 0, 0]), K = s && t != null && p.frame === t, T = s && !K && u?.has(p.frame);
          if (K) {
            const P = new e.Mesh(
              new e.RingGeometry(ne * 2.1, ne * 2.6, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            P.position.fromArray(p.camera.position), P.renderOrder = 911, P.userData.omnicamBillboard = !0, P.userData.omnicamWidget = "path", this.path.add(P);
          } else if (T) {
            const P = new e.Mesh(
              new e.RingGeometry(ne * 1.9, ne * 2.2, 24),
              new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.85, depthTest: !1 })
            );
            P.position.fromArray(p.camera.position), P.renderOrder = 911, P.userData.omnicamBillboard = !0, P.userData.omnicamWidget = "path", this.path.add(P);
          }
          if (K) {
            const P = O.clone().sub(V).normalize();
            let F = new e.Vector3().crossVectors(P, new e.Vector3(0, 1, 0));
            F.lengthSq() < 1e-8 ? F.set(1, 0, 0) : F.normalize();
            const U = new e.Vector3().crossVectors(F, P).normalize(), $ = e.MathUtils.clamp(V.distanceTo(O) * 0.08, 0.25, 0.8), X = p.camera.camera_type === "orthographic" ? $ * 0.55 : $ * Math.tan(e.MathUtils.degToRad(p.camera.fov || 35) * 0.5), J = X * (L.width || 16) / Math.max(1, L.height || 9), Z = V.clone().addScaledVector(P, $), d = [
              Z.clone().addScaledVector(F, -J).addScaledVector(U, -X),
              Z.clone().addScaledVector(F, J).addScaledVector(U, -X),
              Z.clone().addScaledVector(F, J).addScaledVector(U, X),
              Z.clone().addScaledVector(F, -J).addScaledVector(U, X)
            ], b = [];
            for (const E of d) b.push(V, E);
            for (let E = 0; E < 4; E++) b.push(d[E], d[(E + 1) % 4]);
            const j = new e.BufferGeometry().setFromPoints(b), I = new e.LineSegments(j, new e.LineBasicMaterial({
              color: A.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            I.userData.omnicamWidget = "gizmo", this.path.add(I);
            const k = new e.BufferGeometry();
            k.setIndex([0, 1, 2, 0, 2, 3]), k.setAttribute("position", new e.Float32BufferAttribute([
              d[0].x,
              d[0].y,
              d[0].z,
              d[1].x,
              d[1].y,
              d[1].z,
              d[2].x,
              d[2].y,
              d[2].z,
              d[3].x,
              d[3].y,
              d[3].z
            ], 3));
            const Y = new e.Mesh(k, new e.MeshBasicMaterial({
              color: A.marker,
              transparent: !0,
              opacity: 0.12,
              depthTest: !1,
              side: e.DoubleSide
            }));
            Y.userData.omnicamWidget = "gizmo", this.path.add(Y);
            const se = Ft(e, {
              position: V,
              forward: P,
              up: U,
              color: A.marker,
              scale: e.MathUtils.clamp($ * 1.15, 0.35, 1.6),
              active: s
            });
            se.userData.omnicamWidget = "gizmo", this.path.add(se);
          }
          if (K) {
            const P = zt(e, {
              position: O,
              radius: e.MathUtils.clamp(V.distanceTo(O) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            P.userData.omnicamWidget = "lookat", this.path.add(P);
            const F = new e.Line(
              new e.BufferGeometry().setFromPoints([V.clone(), O.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            F.renderOrder = 914, F.userData.omnicamWidget = "lookat", this.path.add(F);
          }
          if (K) {
            const P = bt(p, c[_ - 1] || null, c[_ + 1] || null);
            for (const F of ["in", "out"]) {
              const U = new e.Vector3().fromArray(P[F]), $ = new e.Line(
                new e.BufferGeometry().setFromPoints([V.clone(), U.clone()]),
                new e.LineBasicMaterial({ color: Pe, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              $.renderOrder = 912, $.userData.omnicamWidget = "gizmo", this.path.add($);
              const X = new e.Mesh(
                new e.SphereGeometry(qt, 12, 8),
                new e.MeshBasicMaterial({ color: Pe, depthTest: !1 })
              );
              X.position.copy(U), X.renderOrder = 913, X.userData.omnicamCurveHandle = { cameraId: f.id, frame: p.frame, side: F }, X.userData.omnicamWidget = "gizmo", this.path.add(X);
            }
          }
        }
      });
      const y = [16742005, 52937, 16632686, 7101671, 14774357];
      (L.objects || []).forEach((f, M) => {
        const c = f.keyframes || [];
        if (c.length < 2) return;
        const A = f.color ? new e.Color(f.color) : y[M % y.length], s = c.map((_) => new e.Vector3().fromArray(_.transform?.position || [0, 0, 0])), C = new e.CatmullRomCurve3(s, !1, "centripetal"), p = new e.Mesh(
          new e.TubeGeometry(C, Math.max(32, c.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: A, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        p.renderOrder = 900, p.userData.omnicamWidget = "path", this.path.add(p);
        for (const _ of c) {
          const l = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: A, depthTest: !1 })
          );
          l.position.fromArray(_.transform?.position || [0, 0, 0]), l.renderOrder = 910, l.userData.omnicamWidget = "path", this.path.add(l);
        }
      });
    }
  };
}
function $t(o) {
  const { THREE: e, FBXLoader: m, GLTFLoader: w, OBJLoader: B, PLYLoader: h, STLLoader: v, neutral: x, wire: q, checkerMaterial: W, objectMaterial: D, applyModelMaterial: N, disposeObject: R, textureFor: te, cardMesh: H, generatePointField: ee, sampleCamera: Q, sampleObjectTransform: ae, hasOutlineMesh: L } = o;
  return {
    updateLiveCameras(g, t, r, i, u = "camera", a = null) {
      if (R(this.liveCameras), this.liveCameras.clear(), r) return;
      const n = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (g.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: g.keyframes || [] }]).forEach((y, f) => {
        const M = y.color ? { line: new e.Color(y.color), marker: new e.Color(y.color), frustum: new e.Color(y.color), body: new e.Color(y.color).multiplyScalar(0.35) } : n[f % n.length], c = y.id === g.active_camera_id, A = c && u === "camera", s = i === "camera" && c, C = Q(y, t, g.objects), p = new e.Vector3().fromArray(C.position || [0, 0, 0]), _ = new e.Vector3().fromArray(C.target || [0, 0, 0]), l = _.clone().sub(p), S = l.length();
        S < 1e-4 ? l.set(0, 0, -1) : l.normalize();
        let z = new e.Vector3(0, 1, 0), V = new e.Vector3().crossVectors(l, z);
        V.lengthSq() < 1e-6 && (z = new e.Vector3(0, 0, 1), V = new e.Vector3().crossVectors(l, z)), V.normalize();
        let O = new e.Vector3().crossVectors(V, l).normalize();
        if (C.roll) {
          const T = e.MathUtils.degToRad(C.roll);
          V.applyAxisAngle(l, T), O.applyAxisAngle(l, T);
        }
        const K = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!s) {
          const T = new e.Group(), P = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: M.body, roughness: 0.4, metalness: 0.8 })
          );
          P.position.set(0, 0, -0.11), T.add(P);
          const F = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          F.rotateX(Math.PI / 2);
          const U = new e.Mesh(
            F,
            new e.MeshStandardMaterial({ color: M.marker, roughness: 0.2, metalness: 0.9 })
          );
          U.position.set(0, 0, 0.05), T.add(U);
          const $ = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: c ? 16729156 : M.marker })
          );
          $.position.set(0, 0.07, -0.08), T.add($);
          const X = new e.Matrix4().makeBasis(V, O, l.clone().negate());
          T.quaternion.setFromRotationMatrix(X), T.position.copy(p), T.userData.omnicamWidget = "gizmo", this.liveCameras.add(T);
          const J = new e.SphereGeometry(0.35, 8, 6), Z = new e.Mesh(J, K);
          Z.position.copy(p), Z.userData = { omnicamType: "camera", omnicamId: y.id }, this.liveCameras.add(Z);
          const d = e.MathUtils.clamp(S * 0.25, 0.5, 2.5), b = C.camera_type === "orthographic" ? 5 / Math.max(0.01, C.zoom || 1) * 0.35 : d * Math.tan(e.MathUtils.degToRad(C.fov || 35) * 0.5), j = b * (g.width || 16) / Math.max(1, g.height || 9), I = p.clone().addScaledVector(l, d), k = [
            I.clone().addScaledVector(V, -j).addScaledVector(O, -b),
            I.clone().addScaledVector(V, j).addScaledVector(O, -b),
            I.clone().addScaledVector(V, j).addScaledVector(O, b),
            I.clone().addScaledVector(V, -j).addScaledVector(O, b)
          ], Y = [];
          for (const le of k) Y.push(p, le);
          for (let le = 0; le < 4; le++) Y.push(k[le], k[(le + 1) % 4]);
          const E = k[2].clone().add(k[3]).multiplyScalar(0.5).clone().addScaledVector(O, b * 0.25);
          Y.push(k[2], E, E, k[3]);
          const oe = new e.BufferGeometry().setFromPoints(Y), _e = new e.LineSegments(oe, new e.LineBasicMaterial({
            color: A ? M.marker : M.frustum,
            linewidth: c ? 2 : 1,
            transparent: !0,
            opacity: c ? 1 : 0.6
          }));
          _e.userData.omnicamWidget = "gizmo", this.liveCameras.add(_e);
          const we = new e.BufferGeometry();
          we.setIndex([0, 1, 2, 0, 2, 3]), we.setAttribute("position", new e.Float32BufferAttribute([
            k[0].x,
            k[0].y,
            k[0].z,
            k[1].x,
            k[1].y,
            k[1].z,
            k[2].x,
            k[2].y,
            k[2].z,
            k[3].x,
            k[3].y,
            k[3].z
          ], 3));
          const Se = new e.Mesh(we, new e.MeshBasicMaterial({
            color: A ? M.marker : M.frustum,
            transparent: !0,
            opacity: 0.12,
            depthTest: !1,
            side: e.DoubleSide
          }));
          Se.userData.omnicamWidget = "gizmo", this.liveCameras.add(Se);
        }
        if (S > 0.01) {
          const T = c && u === "camera_target", P = new e.BufferGeometry().setFromPoints([p, _]), F = new e.Line(P, new e.LineDashedMaterial({
            color: A || T ? 9133302 : M.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: A || T ? 1 : c ? 0.75 : 0.4
          }));
          F.userData.omnicamWidget = "lookat", this.liveCameras.add(F);
          const U = T ? 0.12 : A ? 0.11 : 0.08, $ = [
            _.clone().add(new e.Vector3(-U, 0, 0)),
            _.clone().add(new e.Vector3(U, 0, 0)),
            _.clone().add(new e.Vector3(0, -U, 0)),
            _.clone().add(new e.Vector3(0, U, 0)),
            _.clone().add(new e.Vector3(0, 0, -U)),
            _.clone().add(new e.Vector3(0, 0, U))
          ], X = new e.BufferGeometry().setFromPoints($), J = new e.LineSegments(X, new e.LineBasicMaterial({
            color: T || A ? 9133302 : M.marker,
            linewidth: T ? 3 : 1,
            transparent: !0,
            opacity: T || A ? 1 : c ? 0.9 : 0.5
          }));
          J.userData.omnicamWidget = "lookat", this.liveCameras.add(J);
          const Z = new e.SphereGeometry(0.28, 8, 6), d = new e.Mesh(Z, K);
          if (d.position.copy(_), d.userData = { omnicamType: "camera_target", omnicamId: y.id }, this.liveCameras.add(d), (T || A) && i !== "camera") {
            const b = new e.RingGeometry(0.14, 0.18, 24);
            b.rotateX(Math.PI / 2);
            const j = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), I = new e.Mesh(b, j);
            I.position.copy(_), I.userData.omnicamWidget = "lookat", this.liveCameras.add(I);
          }
        }
        if (c && i !== "camera" && u === "camera") {
          const T = new e.RingGeometry(0.19, 0.24, 32);
          T.rotateX(Math.PI / 2);
          const P = new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 1 }), F = new e.Mesh(T, P);
          F.position.copy(p), F.userData.omnicamWidget = "gizmo", this.liveCameras.add(F);
          const U = new e.RingGeometry(0.28, 0.31, 32);
          U.rotateX(Math.PI / 2);
          const $ = new e.Mesh(U, new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          $.position.copy(p), $.userData.omnicamWidget = "gizmo", this.liveCameras.add($);
        }
      });
    },
    updateSelection(g, t, r, i = null, u = "", a = !1) {
      const n = i ? `${i.mode || ""}:${i.objectId || ""}:${(i.point || []).join(",")}` : "", G = `${t}:${r || ""}:${(g.__selectedObjectIds || []).join(",")}:${u}:${n}:${a ? "ortho" : "persp"}`;
      if (G !== this.selectionKey) {
        if (this.selectionKey = G, R(this.selectionGroup), this.selectionGroup.clear(), t === "object" && r) {
          const y = this.objectNodes.get(r);
          if (y) {
            y.updateMatrixWorld(!0);
            try {
              const f = new e.Box3(), M = [];
              if (y.traverse((c) => {
                c.isBone && M.push(c);
              }), M.length > 0) {
                const c = new e.Vector3();
                for (const A of M)
                  A.getWorldPosition(c), f.expandByPoint(c);
                f.expandByScalar(0.2);
              } else
                f.setFromObject(y);
              if ((a || !L(y)) && !f.isEmpty() && Number.isFinite(f.min.x) && Number.isFinite(f.max.x) && Number.isFinite(f.min.y) && Number.isFinite(f.max.y) && Number.isFinite(f.min.z) && Number.isFinite(f.max.z)) {
                f.expandByScalar(0.04);
                const c = new e.Box3Helper(f, new e.Color(9133302));
                c.material.transparent = !0, c.material.opacity = 0.95, c.material.depthTest = !1, c.renderOrder = 9999, this.selectionGroup.add(c);
              }
            } catch {
            }
            if (g.show_wireframe) {
              let f = 0;
              y.traverse((M) => {
                if (!M.isMesh || !M.geometry || M.userData.omnicamHelper || f >= 64) return;
                const c = Nt(e, M, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                c.renderOrder = 9998, this.selectionGroup.add(c), f += 1;
              });
            }
            if (i && i.objectId === r && i.point) {
              if (i.mode === "vertex") {
                const f = new e.SphereGeometry(0.08, 16, 12), M = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), c = new e.Mesh(f, M);
                c.position.fromArray(i.point), c.renderOrder = 1e4, this.selectionGroup.add(c);
                const A = new e.RingGeometry(0.1, 0.15, 24), s = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), C = new e.Mesh(A, s);
                C.position.fromArray(i.point), this.activeCamera && C.quaternion.copy(this.activeCamera.quaternion), C.renderOrder = 1e4, this.selectionGroup.add(C);
              } else if (i.mode === "edge" && i.edge) {
                const [f, M] = i.edge, c = new e.BufferGeometry().setFromPoints([new e.Vector3(...f), new e.Vector3(...M)]), A = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), s = new e.Line(c, A);
                s.renderOrder = 1e4, this.selectionGroup.add(s);
              } else if (i.mode === "face" && i.vertices) {
                const [f, M, c] = i.vertices, A = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...f),
                  new e.Vector3(...M),
                  new e.Vector3(...c)
                ]);
                A.setIndex([0, 1, 2]), A.computeVertexNormals();
                const s = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), C = new e.Mesh(A, s);
                C.renderOrder = 1e4, this.selectionGroup.add(C);
                const p = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...f),
                  new e.Vector3(...M),
                  new e.Vector3(...c),
                  new e.Vector3(...f)
                ]), _ = new e.Line(p, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                _.renderOrder = 10001, this.selectionGroup.add(_);
              }
            }
          }
        }
        if (t === "object")
          for (const y of g.__selectedObjectIds || []) {
            if (y === r) continue;
            const f = this.objectNodes.get(y);
            if (f) {
              f.updateMatrixWorld(!0);
              try {
                const M = new e.Box3().setFromObject(f);
                if ((a || !L(f)) && !M.isEmpty() && Number.isFinite(M.min.x)) {
                  M.expandByScalar(0.04);
                  const c = new e.Box3Helper(M, new e.Color(10980346));
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
      return t.traverse((u) => {
        const a = u.isBone ? u.name : "";
        !a || i.has(a) || r.length >= 256 || (i.add(a), r.push(a));
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
      const u = this.objectNodes.get(g);
      if (!u) return null;
      const a = this.models.get(g), n = a?.mixer && a.duration > 0, G = n ? a.mixer.time : null;
      n && (a.mixer.setTime(Math.max(0, r) / Math.max(1, i) % a.duration), u.updateMatrixWorld(!0));
      let y = null;
      if (t) {
        let f = null;
        if (u.traverse((M) => {
          !f && M.isBone && M.name === t && (f = M);
        }), f) {
          const M = new e.Vector3().setFromMatrixPosition(f.matrixWorld);
          y = [M.x, M.y, M.z];
        }
      } else
        y = this.getObjectWorldCenter(g);
      return n && Number.isFinite(G) && (a.mixer.setTime(G), u.updateMatrixWorld(!0)), y;
    },
    getObjectWorldBounds(g) {
      const t = this.objectNodes.get(g);
      if (!t) return null;
      t.updateWorldMatrix(!0, !0);
      const r = new e.Box3().setFromObject(t, !0), i = r.min.toArray(), u = r.max.toArray();
      return !r.isEmpty() && [...i, ...u].every(Number.isFinite) ? { min: i, max: u } : null;
    },
    getObjectWorldCenter(g) {
      const t = this.objectNodes.get(g);
      if (!t) return null;
      t.updateMatrixWorld(!0);
      const r = [];
      if (t.traverse((a) => {
        a.isBone && r.push(a);
      }), r.length > 0) {
        const a = new e.Vector3(), n = new e.Vector3();
        for (const G of r)
          G.getWorldPosition(n), a.add(n);
        return a.divideScalar(r.length), [a.x, a.y, a.z];
      }
      const i = new e.Box3().setFromObject(t);
      if (!i.isEmpty() && Number.isFinite(i.min.x)) {
        const a = i.getCenter(new e.Vector3());
        return [a.x, a.y, a.z];
      }
      const u = new e.Vector3();
      return t.getWorldPosition(u), [u.x, u.y, u.z];
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
      if (r.traverse((a) => {
        !i && a.isBone && a.name === t && (i = a);
      }), !i) return null;
      i.updateWorldMatrix(!0, !1);
      const u = new e.Vector3();
      return i.getWorldPosition(u), { name: t, world: [u.x, u.y, u.z] };
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
      const u = /* @__PURE__ */ new Map();
      if (i.traverse((n) => {
        n.isBone && n.name && u.set(n.name, n);
      }), !u.size) return !1;
      for (const n of u.values())
        n.userData.omnicamBindQuat || (n.userData.omnicamBindQuat = n.quaternion.clone());
      const a = r && typeof r == "object" ? r : {};
      for (const [n, G] of Object.entries(t || {})) {
        const y = u.get(G);
        if (!y) continue;
        const f = a[n];
        Array.isArray(f) && f.length === 4 && f.every(Number.isFinite) ? y.quaternion.fromArray(f).normalize() : y.userData.omnicamBindQuat && y.quaternion.copy(y.userData.omnicamBindQuat), y.updateMatrixWorld(!0);
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
      r.traverse((a) => {
        a.isBone && a.name && i.set(a.name, a);
      });
      const u = {};
      for (const [a, n] of Object.entries(t)) {
        const G = i.get(n);
        if (!G) continue;
        const y = G.userData.omnicamBindQuat;
        y && G.quaternion.angleTo(y) < 1e-4 || (u[a] = G.quaternion.toArray());
      }
      return u;
    }
  };
}
function Kt(o) {
  const { THREE: e, FBXLoader: m, GLTFLoader: w, OBJLoader: B, PLYLoader: h, STLLoader: v, neutral: x, wire: q, checkerMaterial: W, objectMaterial: D, applyModelMaterial: N, disposeObject: R, textureFor: te, cardMesh: H, generatePointField: ee, sampleCamera: Q, sampleObjectTransform: ae } = o;
  function L(g) {
    const t = g.supersampleFactor?.() || 1;
    return { w: g.canvas.width / t, h: g.canvas.height / t };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(g) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = L(this);
      this.pointer.set(g[0] / t * 2 - 1, -(g[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const n of this.raycaster.intersectObjects(this.path.children, !0)) {
        const G = wt(n);
        if (G) return { ...G, position: n.object.position.toArray() };
      }
      const i = 16 * Math.min(2, window.devicePixelRatio || 1);
      let u = null;
      const a = new e.Vector3();
      for (const n of this.path.children) {
        const G = n.userData?.omnicamPathKey;
        if (!G || (a.copy(n.position).project(this.activeCamera), a.z < -1 || a.z > 1)) continue;
        const y = (a.x * 0.5 + 0.5) * t, f = (1 - (a.y * 0.5 + 0.5)) * r, M = Math.hypot(g[0] - y, g[1] - f);
        M <= i && (!u || M < u.distance) && (u = { key: G, position: n.position.toArray(), distance: M });
      }
      return u ? { ...u.key, position: u.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(g) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: r } = L(this);
      this.pointer.set(g[0] / t * 2 - 1, -(g[1] / r) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const n of this.raycaster.intersectObjects(this.path.children, !0)) {
        const G = pt(n);
        if (G) return { ...G, position: n.object.position.toArray() };
      }
      const i = 14 * Math.min(2, window.devicePixelRatio || 1);
      let u = null;
      const a = new e.Vector3();
      for (const n of this.path.children) {
        const G = n.userData?.omnicamCurveHandle;
        if (!G || (a.copy(n.position).project(this.activeCamera), a.z < -1 || a.z > 1)) continue;
        const y = (a.x * 0.5 + 0.5) * t, f = (1 - (a.y * 0.5 + 0.5)) * r, M = Math.hypot(g[0] - y, g[1] - f);
        M <= i && (!u || M < u.distance) && (u = { handle: G, position: n.position.toArray(), distance: M });
      }
      return u ? { ...u.handle, position: u.position } : null;
    },
    configureCamera(g, t) {
      const r = g || defaultCamera(), i = Math.max(5e-4, Number(r.near) || 0.01), u = Math.max(i + 1, Number(r.far) || 1e4);
      let a;
      if (r.camera_type === "orthographic") {
        a = this.orthographic;
        const c = 5 / Math.max(0.01, r.zoom || 1);
        a.left = -c * t, a.right = c * t, a.top = c, a.bottom = -c, a.near = i, a.far = u, a.updateProjectionMatrix();
      } else
        a = this.perspective, a.fov = e.MathUtils.clamp(Number(r.fov) || 35, 1, 175), a.aspect = t, a.near = i, a.far = u, a.updateProjectionMatrix();
      const n = new e.Vector3().fromArray(r.position || [6, 4, 6]), G = new e.Vector3().fromArray(r.target || [0, 1.5, 0]), y = G.clone().sub(n);
      y.lengthSq() < 1e-6 ? y.set(0, 0, -1) : y.normalize();
      let f = r.up ? new e.Vector3().fromArray(r.up) : new e.Vector3(0, 1, 0), M = new e.Vector3().crossVectors(y, f);
      if (M.lengthSq() < 1e-6 && (f = Math.abs(y.y) > 0.9 ? new e.Vector3(0, 0, y.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), M.crossVectors(y, f)), M.normalize(), f.crossVectors(M, y).normalize(), r.roll) {
        const c = e.MathUtils.degToRad(r.roll);
        M.applyAxisAngle(y, c), f.applyAxisAngle(y, c);
      }
      return a.position.copy(n), a.up.copy(f), a.lookAt(G), a.updateMatrixWorld(), a;
    },
    pick(g, t, r, i) {
      if (!this.activeCamera) return null;
      this.pointer.set(g / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const u = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const a of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          a.object?.userData?.omnicamType && u.push({
            distance: a.distance,
            type: a.object.userData.omnicamType,
            id: a.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const a of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (a.object?.userData?.omnicamCaptureGuide || a.object?.userData?.omnicamHelper) continue;
          let n = a.object;
          for (; n && !n.userData?.omnicamId; ) n = n.parent;
          n?.userData?.omnicamId && u.push({
            distance: a.distance,
            type: "object",
            id: n.userData.omnicamId
          });
        }
      return u.length ? (u.sort((a, n) => a.distance - n.distance), { type: u[0].type, id: u[0].id }) : null;
    },
    /**
     * World point -> logical viewport pixels, for the DOM label overlay
     * (design spec section 14). `behind` is true when the point is outside the
     * near/far clip and the caller should hide its label.
     */
    projectWorldToScreen(g) {
      if (!this.activeCamera || !Array.isArray(g) || g.length < 3) return null;
      const { w: t, h: r } = L(this), i = new e.Vector3(Number(g[0]) || 0, Number(g[1]) || 0, Number(g[2]) || 0);
      return i.project(this.activeCamera), {
        x: (i.x * 0.5 + 0.5) * t,
        y: (1 - (i.y * 0.5 + 0.5)) * r,
        behind: i.z < -1 || i.z > 1,
        width: t,
        height: r
      };
    },
    pickSubElement(g, t, r, i, u = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(g / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const a = this.raycaster.intersectObjects(this.content.children, !0);
      for (const n of a) {
        let G = n.object, y = n.object;
        for (; G && !G.userData.omnicamId; ) G = G.parent;
        if (!G?.userData.omnicamId || !y.geometry) continue;
        const f = G.userData.omnicamId, c = y.geometry.getAttribute("position");
        if (!c) continue;
        y.updateMatrixWorld(!0);
        const A = y.matrixWorld;
        if (u === "vertex") {
          let s = -1, C = 1 / 0, p = null;
          if (n.face) {
            const _ = [n.face.a, n.face.b, n.face.c];
            for (const l of _) {
              const S = new e.Vector3(c.getX(l), c.getY(l), c.getZ(l)).applyMatrix4(A), z = S.distanceTo(n.point);
              z < C && (C = z, s = l, p = [S.x, S.y, S.z]);
            }
          } else
            for (let _ = 0; _ < c.count; _++) {
              const l = new e.Vector3(c.getX(_), c.getY(_), c.getZ(_)).applyMatrix4(A), S = l.distanceTo(n.point);
              S < C && (C = S, s = _, p = [l.x, l.y, l.z]);
            }
          if (p)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: f,
              index: s,
              point: p
            };
        }
        if (u === "edge" && n.face) {
          const s = new e.Vector3(c.getX(n.face.a), c.getY(n.face.a), c.getZ(n.face.a)).applyMatrix4(A), C = new e.Vector3(c.getX(n.face.b), c.getY(n.face.b), c.getZ(n.face.b)).applyMatrix4(A), p = new e.Vector3(c.getX(n.face.c), c.getY(n.face.c), c.getZ(n.face.c)).applyMatrix4(A), _ = (O, K, T) => {
            const P = new e.Line3(K, T), F = new e.Vector3();
            return P.closestPointToPoint(O, !0, F), { dist: O.distanceTo(F), point: F, segment: [K, T] };
          }, l = _(n.point, s, C), S = _(n.point, C, p), z = _(n.point, p, s), V = [l, S, z].reduce((O, K) => K.dist < O.dist ? K : O);
          return {
            type: "edge",
            mode: "edge",
            objectId: f,
            point: [V.point.x, V.point.y, V.point.z],
            edge: [
              [V.segment[0].x, V.segment[0].y, V.segment[0].z],
              [V.segment[1].x, V.segment[1].y, V.segment[1].z]
            ]
          };
        }
        if (u === "face" && n.face) {
          const s = new e.Vector3(c.getX(n.face.a), c.getY(n.face.a), c.getZ(n.face.a)).applyMatrix4(A), C = new e.Vector3(c.getX(n.face.b), c.getY(n.face.b), c.getZ(n.face.b)).applyMatrix4(A), p = new e.Vector3(c.getX(n.face.c), c.getY(n.face.c), c.getZ(n.face.c)).applyMatrix4(A), _ = new e.Vector3().add(s).add(C).add(p).divideScalar(3), l = n.face.normal.clone().transformDirection(A);
          return {
            type: "face",
            mode: "face",
            objectId: f,
            faceIndex: n.faceIndex,
            point: [_.x, _.y, _.z],
            normal: [l.x, l.y, l.z],
            vertices: [
              [s.x, s.y, s.z],
              [C.x, C.y, C.z],
              [p.x, p.y, p.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(g, t, r, i) {
      if (!this.activeCamera) return null;
      this.pointer.set(g / Math.max(1, r) * 2 - 1, 1 - t / Math.max(1, i) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const u = this.raycaster.intersectObjects(this.content.children, !0);
      if (u.length > 0)
        return [u[0].point.x, u[0].point.y, u[0].point.z];
      const a = new e.Plane(new e.Vector3(0, 1, 0), 0), n = new e.Vector3();
      return this.raycaster.ray.intersectPlane(a, n) ? [n.x, n.y, n.z] : null;
    }
  };
}
const ge = ["high", "balanced", "low"], Yt = 25, ke = 30, Ht = 0.6;
function Oe(o = "balanced") {
  return { quality: o, samples: [], downgraded: !1 };
}
function Qt(o) {
  const e = ge.indexOf(o);
  return e < 0 || e >= ge.length - 1 ? null : ge[e + 1];
}
function Zt(o, e) {
  if (!Number.isFinite(e) || e < 0 || (o.samples.push(e), o.samples.length > ke && o.samples.shift(), o.samples.length < ke) || o.samples.filter((B) => B > Yt).length / o.samples.length < Ht) return null;
  const w = Qt(o.quality);
  return w ? (o.quality = w, o.downgraded = !0, o.samples = [], w) : null;
}
function Jt(o, e) {
  return o.quality = e, o.samples = [], o.downgraded = !1, o;
}
function Et(o) {
  const { THREE: e, FBXLoader: m, GLTFLoader: w, OBJLoader: B, PLYLoader: h, STLLoader: v, neutral: x, wire: q, checkerMaterial: W, objectMaterial: D, applyModelMaterial: N, disposeObject: R, textureFor: te, cardMesh: H, generatePointField: ee, sampleCamera: Q, sampleObjectTransform: ae, hasOutlineMesh: L, SelectionOutlineRenderer: g } = o;
  return {
    render(t, r, i, u, a, n = /* @__PURE__ */ new Map(), G = 0, y = !1, f = "camera", M = "subject", c = null, A = null, s = null) {
      const C = !y || (t.render_mode || "") === "beauty";
      if (C !== this.studioEnabled) {
        this.studioEnabled = C, Ue(e, this.scene, this.renderer, this.studio, C);
        for (const d of this.flatLights || []) d.visible = !C;
      }
      const p = !!t.objects?.some((d) => d.type === "sun_light" && d.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !p && C), this.flatLights?.[1] && (this.flatLights[1].visible = !p && !C), this.disposed) return;
      (this.canvas.width !== u || this.canvas.height !== a) && this.renderer.setSize(u, a, !1);
      const _ = (r && r.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const l = t.viewport_bg_sequence && t.viewport_bg_sequence.length ? t.viewport_bg_sequence[G % t.viewport_bg_sequence.length] : t.viewport_bg_image || "";
      if (l) {
        this.bgImageUrl = l;
        const d = this.bgTextureCache.get(l);
        if (d)
          this.bgTextureCache.delete(l), this.bgTextureCache.set(l, d), this.bgTexture = d, this.scene.background = d;
        else if (!this.bgTextureLoads.has(l)) {
          const b = this.bgLoadGeneration;
          this.bgTextureLoads.set(l, b), new e.TextureLoader().load(l, (I) => {
            if (this.bgTextureLoads.delete(l), this.disposed || b !== this.bgLoadGeneration) {
              I.dispose();
              return;
            }
            for (I.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(l, I); this.bgTextureCache.size > 8; ) {
              const k = [...this.bgTextureCache.keys()].find((se) => se !== this.bgImageUrl);
              if (!k) break;
              const Y = this.bgTextureCache.get(k);
              this.bgTextureCache.delete(k), Y?.dispose?.();
            }
            this.bgImageUrl === l && (this.bgTexture = I, this.scene.background = I), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(l);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const b of new Set(this.bgTextureCache.values())) b.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const d = t.viewport_bg_color && t.viewport_bg_color !== De;
        this.scene.background = this.studioEnabled && !d && !_ ? this.studio.sky : new e.Color(d ? t.viewport_bg_color : this.studioEnabled && _ ? 1447709 : De);
      }
      const S = JSON.stringify([
        t.render_mode,
        t.card_fit,
        t.point_density,
        t.point_spread,
        !!t.show_wireframe,
        !!t.show_vertices,
        !!t.backface_culling,
        t.reconstruction_appearance || "neutral",
        !!y,
        t.objects.map((d) => {
          const { position: b, rotation: j, keyframes: I, size: k, ...Y } = d;
          return d.type === "card" && (Y.size = k), Y;
        })
      ]), z = [...i.entries()].map(([d, b]) => `${d}:${b?.src || ""}`).join("|"), V = [...n.entries()].map(([d, b]) => `${d}:${b}`).join("|");
      (S !== this.sceneKey || z !== this.mediaSignature || V !== this.modelSignature) && (this.sceneKey = S, this.mediaSignature = z, this.modelSignature = V, this.rebuild(t, i, n, y));
      const O = Math.max(1, t.fps || 24), K = /* @__PURE__ */ new Map();
      for (const d of t.objects)
        d.character?.motion && this.models.has(d.id) && K.set(d.id, d.character.motion);
      for (const [d, b] of this.models) {
        if (!b.mixer || !(b.duration > 0)) continue;
        const j = K.get(d);
        j ? (this.applyMotionClip?.(d, j), b.mixer.setTime(gt(j, G, O, b.duration))) : b.mixer.setTime(G / O % b.duration);
      }
      for (const d of t.objects) {
        const b = this.objectNodes.get(d.id);
        if (!b) continue;
        const j = d.keyframes?.length ? ae(d, G) : d;
        b.position.fromArray(j.position || [0, 0, 0]), b.rotation.set(...(j.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), d.type !== "card" && d.type !== "null" && b.scale.fromArray(j.size || [1, 1, 1]), d.type === "null" && (b.visible = y ? !0 : t.show_helper_axes !== !1);
      }
      this.path.visible = !y;
      const T = t.show_grid !== !1 && t.render_mode !== "point_field";
      this.content.traverse((d) => {
        d.userData.omnicamCaptureGuide && (d.visible = y ? !!t.playblast_grid : T);
      });
      const P = t.view_mode || "camera", F = Array.isArray(s) ? [...s].sort((d, b) => d - b).join(",") : "", U = `${P}:${f}:${A ?? ""}:${F}:${t.__omnicamRevision ?? JSON.stringify([
        t.active_camera_id,
        (t.cameras || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((b) => [b.frame, b.camera?.position, b.camera?.target, b.interpolation, b.tangents])]),
        (t.objects || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((b) => [b.frame, b.transform?.position])])
      ])}`;
      if (U !== this.pathKey && (this.pathKey = U, this.rebuildPath(t, f, A, P, s)), this.updateLiveCameras(t, G, y, P, f, A), this.liveCameras.visible = !y, !y) {
        const d = t.show_camera_paths !== !1, b = t.show_camera_gizmos !== !1, j = t.show_look_at !== !1;
        for (const I of [this.path, this.liveCameras])
          I.traverse((k) => {
            const Y = k.userData.omnicamWidget;
            Y === "path" ? k.visible = d : Y === "gizmo" ? k.visible = b : Y === "lookat" && (k.visible = j);
          });
      }
      const $ = u / Math.max(1, a), X = this.configureCamera(r, $);
      if (this.activeCamera = X, y ? this.selectionGroup.visible = !1 : (this.updateSelection(t, f, M, c, `${t.__omnicamRevision ?? "legacy"}:${G}`, _), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const d = new e.Box3();
        this.content.traverse((j) => {
          if (!j.isMesh || j.userData.omnicamCaptureGuide) return;
          j.castShadow = !0, j.receiveShadow = !0, j.updateWorldMatrix(!0, !1);
          const I = new e.Box3().setFromObject(j);
          !I.isEmpty() && Number.isFinite(I.min.x) && d.union(I);
        });
        const b = this.studio?.key;
        if (b) {
          const j = d.isEmpty() ? new e.Vector3() : d.getCenter(new e.Vector3()), I = d.isEmpty() ? new e.Vector3(12, 12, 12) : d.getSize(new e.Vector3()), k = Math.max(1, 0.5 * Math.max(I.x, I.y, I.z) * Math.SQRT2), Y = k * 1.15 + 0.5, se = new e.Vector3(4.5, 7.5, 3.5).normalize(), E = Math.max(12, k * 4);
          b.position.copy(j).addScaledVector(se, E), b.target.position.copy(j), b.target.updateMatrixWorld(!0);
          const oe = b.shadow.camera;
          oe.left = -Y, oe.right = Y, oe.top = Y, oe.bottom = -Y, oe.near = Math.max(0.1, E - k - 1), oe.far = E + k + 1, oe.updateProjectionMatrix(), b.shadow.map?.dispose(), b.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((d) => {
        d.userData.omnicamBillboard && d.quaternion.copy(X.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, u, a);
      const J = performance.now();
      let Z = !1;
      if (!y && !_ && f === "object" && (M || t.__selectedObjectIds?.length) && !c) {
        const d = t.__selectedObjectIds?.length ? t.__selectedObjectIds : M ? [M] : [], b = [];
        for (const j of d) {
          const I = this.objectNodes.get(j);
          I && L(I) && b.push(I);
        }
        b.length && (this.outlineRenderer || (this.outlineRenderer = new g(this.renderer, this.scene, void 0, X)), this.outlineRenderer.render(X, u, a, b), Z = !0);
      }
      if (Z || this.renderer.render(this.scene, X), !y && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Oe(this.studio?.quality);
        const d = Zt(this.qualityMonitor, performance.now() - J);
        d && (Ve(this.studio, this.renderer, d), this.onQualityDowngrade?.(d));
      }
    },
    setViewportQuality(t) {
      Ve(this.studio, this.renderer, t), this.qualityMonitor = Jt(this.qualityMonitor || Oe(t), t);
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
const eo = {
  EffectComposer: Qe,
  OutlinePass: He,
  OutputPass: Ye,
  RenderPass: Ke,
  Vector2: Fe
};
function to(o) {
  let e = !1;
  return o?.traverse?.((m) => {
    e || m.visible === !1 || !m.isMesh || m.userData?.omnicamHelper || m.userData?.omnicamCaptureGuide || (e = !!(m.geometry && m.material));
  }), e;
}
class oo {
  constructor(e, m, w = eo, B = null) {
    const { EffectComposer: h, RenderPass: v, OutlinePass: x, OutputPass: q, Vector2: W } = w;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new h(e), this.renderPass = new v(m, B), this.outlinePass = new x(new W(1, 1), m, B, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new q(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, m, w, B) {
    this.disposed || ((m !== this.width || w !== this.height) && (this.width = m, this.height = w, this.composer.setSize(m, w)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...B], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const Te = { low: Ot, balanced: kt, high: Pt }, de = new ve({ color: 10265519, roughness: 0.48, metalness: 0.06, side: re }), Xe = new ve({ color: 2237998, roughness: 0.95, metalness: 0, side: re }), Be = new Me({ color: 11449792, wireframe: !0, side: re });
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
  ]), m = new dt(e, 2, 2, ut);
  return m.wrapS = m.wrapT = mt, m.repeat.set(8, 8), m.colorSpace = be, m.needsUpdate = !0, new ve({ map: m, roughness: 0.85, metalness: 0, side: o ? Ce : re });
}
function ro(o, e, m = !1) {
  const w = e === "wireframe" ? "wireframe" : o.material_mode || "textured", B = m ? Ce : re;
  if (w === "wireframe") {
    const v = Be.clone();
    return v.side = B, o.color && (v.color = new ce(o.color)), v;
  }
  if (w === "checker") return Le(m);
  if (w === "matte") {
    const v = Xe.clone();
    return v.side = B, o.color && (v.color = new ce(o.color)), v;
  }
  const h = de.clone();
  return h.side = B, o.color && (h.color = new ce(o.color)), h;
}
function ao(o, e, m = null, w = !1) {
  const B = w ? Ce : re;
  o.traverse((h) => {
    if (h.isMesh) {
      if (h.userData.omnicamOriginalMaterial || (h.userData.omnicamOriginalMaterial = h.material), h.userData.omnicamOverrideMaterial) {
        const v = Array.isArray(h.material) ? h.material : [h.material];
        for (const x of v)
          x?.map?.dispose?.(), x?.dispose?.();
        h.userData.omnicamOverrideMaterial = !1;
      }
      if (e === "textured" || e === "wireframe_texture") {
        h.material = h.userData.omnicamOriginalMaterial;
        const v = Array.isArray(h.material) ? h.material : [h.material];
        for (const x of v)
          x && (x.side = B);
      } else if (e === "checker")
        h.material = Le(w), h.userData.omnicamOverrideMaterial = !0;
      else if (e === "wireframe") {
        const v = Be.clone();
        v.side = B, m?.color && (v.color = new ce(m.color)), h.material = v, h.userData.omnicamOverrideMaterial = !0;
      } else if (e === "matte") {
        const v = Xe.clone();
        v.side = B, m?.color && (v.color = new ce(m.color)), h.material = v, h.userData.omnicamOverrideMaterial = !0;
      } else {
        const v = de.clone();
        v.side = B, m?.color && (v.color = new ce(m.color)), h.material = v, h.userData.omnicamOverrideMaterial = !0;
      }
    }
  });
}
function xe(o, e = !1) {
  o.traverse((m) => {
    if (m.userData.omnicamModelResource && !e) return;
    m.geometry?.dispose?.();
    const w = Array.isArray(m.material) ? m.material : [m.material];
    for (const B of w)
      B?.map?.dispose?.(), B?.dispose?.();
  });
}
function $e(o) {
  if (!o) return null;
  const e = o instanceof HTMLVideoElement ? new ht(o) : new ft(o);
  return e.colorSpace = be, e.needsUpdate = !0, e;
}
function so(o, e, m) {
  const [w, B] = o.size || [2, 3], h = new ie(), v = new he(new Ae(w, B), new Me({ color: 1448482, side: re, transparent: !0, opacity: 0.85 }));
  v.frustumCulled = !1, h.add(v);
  const x = $e(e);
  if (!x) return h;
  const q = e.videoWidth || e.naturalWidth || e.width || w, W = e.videoHeight || e.naturalHeight || e.height || B, D = q / Math.max(1, W), N = w / Math.max(0.01, B);
  let R = w, te = B;
  m === "contain" ? D > N ? te = w / D : R = B * D : m === "cover" && (D > N ? (x.repeat.x = N / D, x.offset.x = (1 - x.repeat.x) * 0.5) : (x.repeat.y = D / N, x.offset.y = (1 - x.repeat.y) * 0.5));
  const H = new he(
    new Ae(R, te),
    new Me({
      color: 16777215,
      map: x,
      side: re,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return H.frustumCulled = !1, H.position.z = 2e-3, h.add(H), h.frustumCulled = !1, h;
}
class no {
  constructor(e = () => {
  }, m = () => {
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
    }), this.renderer.setPixelRatio(1), this.renderer.outputColorSpace = be, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = Je, this.scene = new Ee(), this.scene.background = new ce(1184274), this.scene.add(new et(16777215, 3159099, 2.2));
    const w = new tt(16777215, 2.4);
    w.position.set(5, 8, 4), this.scene.add(w), this.flatLights = [this.scene.children.at(-2), w], this.studio = Bt(ye, this.renderer, _t), this.scene.add(this.studio.group), this.studioEnabled = !0, Ue(ye, this.scene, this.renderer, this.studio, !0), this.content = new ie(), this.scene.add(this.content), this.path = new ie(), this.scene.add(this.path), this.liveCameras = new ie(), this.scene.add(this.liveCameras), this.selectionGroup = new ie(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ot(35, 16 / 9, 0.01, 1e4), this.orthographic = new rt(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = m, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new at(), this.pointer = new Fe(), this.activeCamera = this.perspective;
  }
  async loadModel(e, m, w = "glb") {
    const B = `${w}:${m}`;
    if (!(!m || this.modelLoads.get(e) === B)) {
      this.modelLoads.set(e, B);
      try {
        let h, v = [];
        if (w === "obj") h = await new ze().loadAsync(m);
        else if (w === "fbx")
          h = await new We().loadAsync(m), v = h.animations || [];
        else if (w === "stl") h = new he(await new je().loadAsync(m), de.clone());
        else if (w === "ply") {
          const r = await new Ie().loadAsync(m);
          r.index ? (r.getAttribute("normal") || r.computeVertexNormals(), h = new he(r, de.clone())) : h = new st(r, new nt({ color: 11449792, size: 0.025 }));
        } else {
          const r = await new Ne().loadAsync(m);
          h = r.scene, v = r.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== B) {
          xe(h, !0);
          return;
        }
        const x = this.models.get(e);
        x && xe(x.scene, !0), h.traverse((r) => {
          if (r.userData.omnicamModelResource = !0, r.frustumCulled = !1, r.isMesh && (r.frustumCulled = !1, r.material)) {
            const i = Array.isArray(r.material) ? r.material : [r.material];
            for (const u of i)
              u.side = re;
          }
          r.isPoints && (r.frustumCulled = !1), r.isSkinnedMesh && (r.frustumCulled = !1, r.computeBoundingBox?.(), r.computeBoundingSphere?.());
        });
        let q = 0, W = 0, D = 0, N = 0;
        h.traverse((r) => {
          r.isMesh && (q += 1, N += r.geometry?.getAttribute?.("position")?.count || 0), r.isPoints && (W += 1), r.isBone && (D += 1);
        });
        const R = new ie();
        if (R.frustumCulled = !1, R.add(h), !q && !W && D) {
          const r = new it(h);
          r.material.depthTest = !1, r.material.opacity = 0.9, r.material.transparent = !0, r.renderOrder = 10, r.userData.omnicamModelResource = !0, R.add(r);
        }
        R.updateMatrixWorld(!0);
        const te = new ct().setFromObject(R), H = te.getSize(new Ge()), ee = Math.max(H.x, H.y, H.z), Q = Number.isFinite(ee) && ee > 1e-6 ? 2.5 / ee : 1, ae = te.getCenter(new Ge());
        R.scale.setScalar(Q), R.position.set(-ae.x * Q, -te.min.y * Q, -ae.z * Q);
        const L = new ie();
        L.frustumCulled = !1, L.add(R);
        const g = v.length ? new lt(h) : null;
        g && g.clipAction(v[0]).play();
        const t = { url: m, format: w, scene: L, mixer: g, clips: v, selectedClip: 0, duration: v[0]?.duration || 0, meshes: q, points: W, bones: D, vertices: N, animations: v.length, normalizationScale: Q };
        this.models.set(e, t), this.onModelLoaded({ id: e, format: w, meshes: q, points: W, bones: D, vertices: N, animations: v.length, animationNames: v.map((r, i) => r.name || `Clip ${i + 1}`), duration: t.duration, normalizationScale: Q }), this.sceneKey = "", this.invalidate();
      } catch (h) {
        this.modelLoads.get(e) === B && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${w.toUpperCase()} ${e}`, h);
        const v = h?.message?.includes("FBX version not supported") || h?.message?.includes("6100") || h?.message?.includes("6000"), x = v ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : h?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: w, error: x, isLegacyFBX: v });
      }
    }
  }
}
const ue = { THREE: ye, FBXLoader: We, GLTFLoader: Ne, OBJLoader: ze, PLYLoader: Ie, STLLoader: je, neutral: de, wire: Be, checkerMaterial: Le, objectMaterial: ro, applyModelMaterial: ao, disposeObject: xe, textureFor: $e, cardMesh: so, generatePointField: yt, sampleCamera: Mt, sampleObjectTransform: xt, hasOutlineMesh: to, SelectionOutlineRenderer: oo };
Object.assign(
  no.prototype,
  Xt(ue),
  $t(ue),
  Kt(ue),
  Et(ue)
);
async function io(o, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const m of ["vp9", "vp8"])
    try {
      if (await me(Tt(m, { width: o, height: e }), 5e3, `Checking ${m} support`)) return m;
    } catch {
    }
  return null;
}
function me(o, e, m) {
  let w;
  return Promise.race([
    o,
    new Promise((B, h) => {
      w = setTimeout(() => h(new Error(`${m} timed out`)), e);
    })
  ]).finally(() => clearTimeout(w));
}
async function po(o, e, m, w, B, h = "balanced") {
  const v = await io(o.width, o.height);
  if (!v) throw new Error("No supported WebCodecs WebM encoder");
  const x = new Gt({ format: new Vt(), target: new At() }), q = new Dt(o, { codec: v, quality: Te[h] || Te.balanced, keyFrameInterval: 1 });
  x.addVideoTrack(q, { frameRate: m }), await me(x.start(), 1e4, "Starting deterministic encoder");
  try {
    const W = 1 / m;
    for (let D = 0; D < e; D++) {
      if (B?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await w(D), await me(q.add(D * W, W, { keyFrame: D % m === 0 }), 1e4, `Encoding frame ${D + 1}`);
    }
    await me(x.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (W) {
    throw x.state !== "finalized" && await x.cancel().catch(() => {
    }), W;
  }
  return Lt(new Blob([x.target.buffer], { type: await x.getMimeType() }), {
    encoder: "webcodecs",
    requestedFrames: e,
    expectedDurationMs: e / m * 1e3,
    recordedDurationMs: e / m * 1e3,
    driftMs: 0,
    fps: m,
    width: o.width,
    height: o.height
  });
}
export {
  no as OmniWebGLViewport,
  po as encodeDeterministicPlayblast,
  io as supportsDeterministicEncoding
};
