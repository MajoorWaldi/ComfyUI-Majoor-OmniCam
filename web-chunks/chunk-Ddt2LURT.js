import { T as me } from "./chunk-D_M_mkHf.js";
import { ab as ze, ae as Ye, af as Qe, ag as Ze, ah as Je, W as He, s as Ce, Z as Ee, i as et, u as ce, H as tt, l as rt, G as ie, k as ot, Y as at, a2 as st, ai as We, aj as je, M as we, ak as Ie, n as Be, al as Ne, P as nt, c as it, e as Ue, D as ae, a5 as ct, d as lt, V as Pe, v as dt, f as be, J as _e, m as De, z as ut, a1 as mt, a3 as ht, ac as ft, a8 as pt } from "./vendor-three-B8JDtKPi.js";
import { T as Me, bR as wt, bS as gt, bT as yt, bh as Mt, a as xt, J as bt } from "./chunk-DF29FYzm.js";
import { r as vt, q as Ct, a as Ae, s as qe, D as Ve, c as Bt, b as _t, d as Lt, e as Gt, g as St } from "./chunk-DOmHE-EJ.js";
import { c as Pt } from "./chunk-a2yd8Eqb.js";
import { o as Dt } from "./chunk-BGttQeoa.js";
import { Output as At, BufferTarget as Vt, WebMOutputFormat as Ot, CanvasSource as kt, QUALITY_HIGH as Ft, QUALITY_MEDIUM as Tt, QUALITY_LOW as zt, canEncodeVideo as Wt } from "./vendor-mediabunny-CZ5VNE-V.js";
function jt(o, { position: e, forward: d, up: p, color: G, scale: h = 1, active: v = !0 }) {
  const b = new o.Group(), U = v ? 0.95 : 0.5, O = new o.MeshBasicMaterial({
    color: G,
    transparent: !0,
    opacity: U,
    depthTest: !1
  }), R = new o.Mesh(new o.BoxGeometry(0.34, 0.24, 0.42), O);
  R.renderOrder = 912, b.add(R);
  const T = new o.Mesh(new o.ConeGeometry(0.17, 0.26, 20), O);
  return T.rotation.x = -Math.PI / 2, T.position.z = -0.32, T.renderOrder = 912, b.add(T), b.scale.setScalar(h), b.position.copy(e), b.up.copy(p), b.lookAt(e.clone().add(d)), b;
}
function It(o, { position: e, color: d = 15903035, radius: p = 0.28, bold: G = !1 }) {
  const h = new o.Group(), v = G ? 16773544 : d, b = new o.LineBasicMaterial({ color: v, transparent: !0, opacity: G ? 1 : 0.95, depthTest: !1 }), U = (T) => {
    const z = [];
    for (let J = 0; J <= 48; J++) {
      const E = J / 48 * Math.PI * 2;
      z.push(new o.Vector3(Math.cos(E) * T, Math.sin(E) * T, 0));
    }
    const ee = new o.Line(new o.BufferGeometry().setFromPoints(z), b);
    return ee.renderOrder = 915, ee;
  };
  if (h.add(U(p)), G) {
    h.add(U(p * 1.18));
    const T = new o.Mesh(
      new o.RingGeometry(0, p * 0.3, 16),
      new o.MeshBasicMaterial({ color: v, transparent: !0, opacity: 1, depthTest: !1 })
    );
    T.renderOrder = 916, h.add(T);
  }
  const O = p * 1.55, R = new o.LineSegments(
    new o.BufferGeometry().setFromPoints([
      new o.Vector3(-O, 0, 0),
      new o.Vector3(-p * 0.45, 0, 0),
      new o.Vector3(p * 0.45, 0, 0),
      new o.Vector3(O, 0, 0),
      new o.Vector3(0, -O, 0),
      new o.Vector3(0, -p * 0.45, 0),
      new o.Vector3(0, p * 0.45, 0),
      new o.Vector3(0, O, 0)
    ]),
    b
  );
  return R.renderOrder = 915, h.add(R), h.position.copy(e), h.userData.omnicamBillboard = !0, h;
}
const Re = 3718648, Nt = 12e3;
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
function Ut(o, e, { color: d = null, opacity: p = null } = {}) {
  const G = d ?? Re, h = p ?? 0.65;
  if (ge(e)) {
    const b = new o.SkinnedMesh(e.geometry.clone(), new o.MeshBasicMaterial({
      color: G,
      wireframe: !0,
      transparent: !0,
      opacity: h,
      depthWrite: !1
    }));
    return b.bindMode = e.bindMode, b.bind(e.skeleton, e.bindMatrix), Xe(b, e), { overlay: ye(b), parent: e.parent || e };
  }
  const v = new o.LineSegments(
    new o.WireframeGeometry(e.geometry),
    new o.LineBasicMaterial({ color: G, opacity: h, transparent: !0, depthTest: !0 })
  );
  return { overlay: ye(v), parent: e };
}
function qt(o, e) {
  const d = new o.PointsMaterial({ color: Re, size: 0.05, sizeAttenuation: !0 });
  if (!ge(e)) {
    const T = new o.Points(e.geometry, d);
    return { overlay: ye(T), parent: e };
  }
  const p = e.geometry.getAttribute("position")?.count || 0, G = Math.max(1, Math.ceil(p / Nt)), h = Math.ceil(p / G), v = new Float32Array(h * 3), b = new o.BufferGeometry();
  b.setAttribute("position", new o.Float32BufferAttribute(v, 3));
  const U = new o.Points(b, d);
  Xe(U, e);
  const O = new o.Vector3(), R = b.getAttribute("position");
  return U.onBeforeRender = () => {
    for (let T = 0; T < h; T++)
      e.getVertexPosition(T * G, O), R.setXYZ(T, O.x, O.y, O.z);
    R.needsUpdate = !0;
  }, { overlay: ye(U), parent: e.parent || e };
}
function Rt(o, e, d) {
  const p = ge(e) ? new o.SkinnedMesh(e.geometry.clone(), d) : new o.Mesh(e.geometry.clone(), d);
  return ge(e) && (p.bindMode = e.bindMode, p.bind(e.skeleton, e.bindMatrix)), p.matrixAutoUpdate = !1, p.matrix.copy(e.matrixWorld), p.frustumCulled = !1, p;
}
function Xt(o, e, { wireframe: d = !1, vertices: p = !1, wireframeColor: G = null, wireframeOpacity: h = null } = {}) {
  if (!d && !p) return;
  const v = [];
  e.traverse((b) => {
    b.isMesh && b.geometry && !b.userData.omnicamHelper && v.push(b);
  });
  for (const b of v) {
    if (d) {
      const { overlay: U, parent: O } = Ut(o, b, { color: G, opacity: h });
      O.add(U);
    }
    if (p) {
      const { overlay: U, parent: O } = qt(o, b);
      O.add(U);
    }
  }
}
const $t = 16777215, ne = 0.17, Oe = 3593923, Kt = 0.06;
function Yt(o) {
  const e = new o.Group();
  e.userData.omnicamCaptureGuide = !0;
  const d = new o.GridHelper(120, 24, 4081496, 3291463);
  d.userData.omnicamCaptureGuide = !0, d.frustumCulled = !1, d.position.y = 5e-4, e.add(d);
  const p = new o.GridHelper(120, 120, 2238001, 1909035);
  p.userData.omnicamCaptureGuide = !0, p.frustumCulled = !1, e.add(p);
  const G = new o.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), h = new o.BufferGeometry().setFromPoints([new o.Vector3(-60, 1e-3, 0), new o.Vector3(60, 1e-3, 0)]), v = new o.Line(h, G);
  v.userData.omnicamCaptureGuide = !0, e.add(v);
  const b = new o.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), U = new o.BufferGeometry().setFromPoints([new o.Vector3(0, 1e-3, -60), new o.Vector3(0, 1e-3, 60)]), O = new o.Line(U, b);
  return O.userData.omnicamCaptureGuide = !0, e.add(O), e;
}
function Qt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: p, OBJLoader: G, PLYLoader: h, STLLoader: v, neutral: b, wire: U, checkerMaterial: O, objectMaterial: R, applyModelMaterial: T, disposeObject: z, textureFor: re, cardMesh: ee, generatePointField: J, sampleCamera: E, sampleObjectTransform: se } = o;
  return {
    removeModel(S) {
      const g = this.models.get(S);
      g && z(g.scene, !0), this.models.delete(S), this.modelLoads.delete(S), this.sceneKey = "";
    },
    selectAnimation(S, g) {
      const r = this.models.get(S);
      !r?.mixer || !r.clips.length || (r.selectedClip = Math.max(0, Math.min(r.clips.length - 1, Number(g) || 0)), r.duration = r.clips[r.selectedClip].duration || 0, r.motionClipId = null, r.mixer.stopAllAction(), r.mixer.clipAction(r.clips[r.selectedClip]).play(), this.invalidate());
    },
    /** Select the clip a character motion names (by clip name, else index, else
     * the first clip). Idempotent -- re-selecting the same clip is a no-op so the
     * per-frame render loop can call it freely (design spec section 27). */
    applyMotionClip(S, g) {
      const r = this.models.get(S);
      if (!r?.mixer || !r.clips.length) return;
      const s = String(g?.clip_id ?? "");
      if (r.motionClipId === s) return;
      let l = r.clips.findIndex((n) => (n.name || "").toLowerCase() === s.toLowerCase());
      l < 0 && /^\d+$/.test(s) && (l = Number(s)), (l < 0 || l >= r.clips.length) && (l = 0), r.selectedClip = l, r.motionClipId = s, r.duration = r.clips[l].duration || 0, r.mixer.stopAllAction();
      const c = r.mixer.clipAction(r.clips[l]);
      c.reset(), c.play(), this.invalidate();
    },
    rebuild(S, g, r, s = !1, l = "auto") {
      this.content.traverse((t) => {
        for (const f of [...t.children])
          f.userData.omnicamHelper && (t.remove(f), z(f, !0));
      }), z(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const c = S.render_mode, n = s && ["clay", "motion_proxy", "depth_rich"].includes(l), i = (t, f) => {
        const a = b.clone();
        return a.side = f ? e.FrontSide : e.DoubleSide, t.color && (a.color = new e.Color(t.color)), a;
      }, x = (t) => n || c === "graybox" ? i(t, !!S.backface_culling) : R(t, c, !!S.backface_culling), w = s && l === "depth_rich";
      if (["omni_ref", "point_field"].includes(c) || w) {
        const t = S.objects.filter((m) => m.enabled !== !1 && !["sun_light", "point_light", "spot_light", "null"].includes(m.type)).length, f = w && t <= 1 && (!S.point_density || S.point_density === "none") ? "sparse" : c === "omni_ref" && (!S.point_density || S.point_density === "none") ? "balanced" : S.point_density || "balanced", { points: a, colors: _ } = J(f, S.point_spread || "all_views", S.point_color || null);
        if (a.length > 0) {
          const m = new e.BufferGeometry();
          m.setAttribute("position", new e.Float32BufferAttribute(a, 3)), m.setAttribute("color", new e.Float32BufferAttribute(_, 3));
          const y = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), u = new e.Points(m, y);
          u.frustumCulled = !1, this.content.add(u);
        }
      }
      if (!["grid", "point_field"].includes(c))
        for (const t of S.objects) {
          if (t.enabled === !1) continue;
          const f = t.size || [1, 1, 1];
          let a;
          if (t.type === "glb" || t.type === "model") {
            const m = r.get(t.id), y = this.models.get(t.id), u = t.format || (t.type === "glb" ? "glb" : "");
            m && (y?.url !== m || y?.format !== u) && this.loadModel(t.id, m, u);
            const L = !!S.backface_culling, C = s && l === "clay" || c === "graybox" ? "neutral" : c === "wireframe" ? "wireframe" : vt(t, S, s) ?? (t.material_mode || "textured");
            y?.url === m && (a = y.scene, T(a, C, t, L));
          } else if (t.type === "sphere")
            a = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), x(t));
          else if (t.type === "cylinder")
            a = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), x(t));
          else if (t.type === "torus") {
            const m = new e.TorusGeometry(0.5, 0.2, 16, 32);
            m.rotateX(Math.PI / 2), a = new e.Mesh(m, x(t));
          } else if (t.type === "pyramid") {
            const m = new e.ConeGeometry(0.7, 1, 4);
            m.rotateY(Math.PI / 4), a = new e.Mesh(m, x(t));
          } else if (t.type === "sun_light") {
            const m = new e.Group(), y = new e.DirectionalLight(t.color || 16774892, t.intensity ?? 2.2);
            y.castShadow = t.cast_shadow !== !1, y.castShadow && (y.shadow.mapSize.set(1024, 1024), y.shadow.bias = -8e-4, y.shadow.normalBias = 0.02, y.shadow.radius = 2.4, y.shadow.camera.near = 0.5, y.shadow.camera.far = 70, y.shadow.camera.left = y.shadow.camera.bottom = -14, y.shadow.camera.right = y.shadow.camera.top = 14);
            const u = (t.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), L = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(u[0], u[1], u[2], "YXZ"));
            y.target.position.copy(y.position).add(L.multiplyScalar(10)), m.add(y, y.target);
            const C = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: t.color || 16096779, wireframe: !0 })
            );
            C.userData.omnicamLightHelper = !0, C.visible = !s, m.add(C), a = m;
          } else if (t.type === "point_light") {
            const m = new e.Group(), y = new e.PointLight(t.color || 16777215, t.intensity ?? 2, 0, 2);
            m.add(y);
            const u = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: t.color || 16498468, wireframe: !0 })
            );
            u.userData.omnicamLightHelper = !0, u.visible = !s, m.add(u), a = m;
          } else if (t.type === "spot_light") {
            const m = new e.Group(), y = (t.cone_angle ?? 45) * Math.PI / 180, u = t.penumbra ?? 0.25, L = new e.SpotLight(t.color || 16777215, t.intensity ?? 3, 0, y, u, 2), C = (t.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), A = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(C[0], C[1], C[2], "YXZ"));
            L.target.position.copy(L.position).add(A.multiplyScalar(10)), m.add(L, L.target);
            const j = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: t.color || 3718648, wireframe: !0 })
            );
            j.userData.omnicamLightHelper = !0, j.visible = !s, m.add(j), a = m;
          } else if (t.type === "human")
            a = new e.Mesh(Pt(e), x(t));
          else if (t.type === "ground") a = new e.Mesh(new e.BoxGeometry(1, 1, 1), x(t));
          else if (t.type === "card")
            if (!["graybox", "wireframe"].includes(c) && (!t.material_mode || ["textured", "wireframe_texture"].includes(t.material_mode)))
              a = ee(t, g.get(t.id), S.card_fit || "contain");
            else {
              const y = c === "wireframe" ? new e.PlaneGeometry(f[0], f[1], 4, 4) : new e.PlaneGeometry(f[0], f[1]);
              a = new e.Mesh(y, x(t));
            }
          else if (t.type === "null") {
            const m = new e.AxesHelper(0.5);
            m.position.fromArray(t.position || [0, 0, 0]), m.userData.omnicamId = t.id, m.frustumCulled = !1, this.objectNodes.set(t.id, m), this.content.add(m);
            continue;
          } else
            a = new e.Mesh(new e.BoxGeometry(1, 1, 1), x(t));
          if (!a) continue;
          a.position.fromArray(t.position || [0, 0, 0]), a.rotation.set(...(t.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const _ = ["sun_light", "point_light", "spot_light"].includes(t.type);
          if (t.type !== "card" && !_ && a.scale.fromArray(f), a.userData.omnicamId = t.id, a.frustumCulled = !1, a.traverse((m) => {
            m.frustumCulled = !1, m.userData.omnicamId = t.id;
          }), !_) {
            const m = !!(S.show_wireframe || c === "wireframe" || S.render_mode === "wireframe_texture" || t.material_mode === "wireframe_texture" || t.material_mode === "wireframe_neutral");
            Xt(e, a, { wireframe: m, vertices: S.show_vertices });
          }
          this.objectNodes.set(t.id, a), this.content.add(a);
        }
    },
    rebuildPath(S, g = "camera", r = null, s = "", l = null) {
      const c = Array.isArray(l) ? new Set(l) : null;
      z(this.path), this.path.clear();
      const n = s === "camera" ? S.active_camera_id : null, i = [
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
      (S.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: S.keyframes || [] }]).forEach((t, f) => {
        const a = t.keyframes || [];
        if (a.length === 0 || t.id === n) return;
        const _ = t.color ? { line: new e.Color(t.color), marker: new e.Color(t.color), frustum: new e.Color(t.color) } : i[f % i.length], m = t.id === S.active_camera_id, y = m && g === "camera";
        if (a.length >= 2) {
          const u = a[0].frame, L = a[a.length - 1].frame, C = Math.max(32, Math.min(256, L - u + 1)), A = { ...t, keyframes: a, objects: S.objects }, j = Array.from({ length: C }, (D, k) => {
            const W = u + (L - u) * k / Math.max(1, C - 1);
            return new e.Vector3().fromArray(E(A, W, S.objects).position);
          }), V = new e.CatmullRomCurve3(j, !1, "centripetal"), I = y ? 0.06 : m ? 0.045 : 0.025, $ = new e.MeshBasicMaterial({
            color: _.line,
            transparent: !0,
            opacity: m ? 1 : 0.55,
            depthTest: !1
          }), F = new e.Mesh(new e.TubeGeometry(V, Math.max(48, C), I, 8, !1), $);
          if (F.renderOrder = 900, F.userData.omnicamWidget = "path", m && !t.locked && (F.userData.omnicamPathSegments = {
            cameraId: t.id,
            firstFrame: u,
            lastFrame: L,
            frames: a.map((D) => D.frame),
            points: j.map((D) => [D.x, D.y, D.z])
          }), this.path.add(F), m) {
            const D = new e.Mesh(
              new e.TubeGeometry(V, Math.max(48, C), I * (y ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: _.line, transparent: !0, opacity: y ? 0.3 : 0.18, depthTest: !1 })
            );
            if (D.renderOrder = 899, D.userData.omnicamWidget = "path", this.path.add(D), j.length >= 8) {
              const k = Math.max(6, Math.floor(C / 8));
              for (let W = Math.floor(k / 2); W < C - 1; W += k) {
                const K = j[W], Y = j[W + 1].clone().sub(K).normalize(), te = new e.ConeGeometry(I * 1.5, I * 3, 8);
                te.rotateX(Math.PI / 2);
                const Z = new e.Quaternion().setFromUnitVectors(new e.Vector3(0, 0, 1), Y), N = new e.Mesh(te, new e.MeshBasicMaterial({ color: _.marker, transparent: !0, opacity: 0.85, depthTest: !1 }));
                N.quaternion.copy(Z), N.position.copy(K), N.renderOrder = 901, N.userData.omnicamWidget = "path", this.path.add(N);
              }
            }
          }
        }
        for (const u of a) {
          const L = a.indexOf(u), C = m, A = new e.Mesh(
            new e.SphereGeometry(C ? ne : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: C ? $t : _.marker, depthTest: !1 })
          );
          A.position.fromArray(u.camera.position), A.renderOrder = 910, A.userData.omnicamPathKey = { cameraId: t.id, frame: u.frame }, A.userData.omnicamWidget = "path", this.path.add(A);
          const j = new e.Mesh(
            new e.RingGeometry((C ? ne : 0.085) * 1.3, (C ? ne : 0.085) * 1.7, 24),
            new e.MeshBasicMaterial({ color: C ? 16777215 : _.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          j.position.fromArray(u.camera.position), j.renderOrder = 909, j.userData.omnicamBillboard = !0, j.userData.omnicamWidget = "path", this.path.add(j);
          const V = new e.Vector3().fromArray(u.camera.position), I = new e.Vector3().fromArray(u.camera.target || [0, 0, 0]), $ = m && r != null && u.frame === r, F = m && !$ && c?.has(u.frame);
          if ($) {
            const D = new e.Mesh(
              new e.RingGeometry(ne * 2.1, ne * 2.6, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            D.position.fromArray(u.camera.position), D.renderOrder = 911, D.userData.omnicamBillboard = !0, D.userData.omnicamWidget = "path", this.path.add(D);
          } else if (F) {
            const D = new e.Mesh(
              new e.RingGeometry(ne * 1.9, ne * 2.2, 24),
              new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.85, depthTest: !1 })
            );
            D.position.fromArray(u.camera.position), D.renderOrder = 911, D.userData.omnicamBillboard = !0, D.userData.omnicamWidget = "path", this.path.add(D);
          }
          if ($) {
            const D = I.clone().sub(V).normalize();
            let k = new e.Vector3().crossVectors(D, new e.Vector3(0, 1, 0));
            k.lengthSq() < 1e-8 ? k.set(1, 0, 0) : k.normalize();
            const W = new e.Vector3().crossVectors(k, D).normalize(), K = e.MathUtils.clamp(V.distanceTo(I) * 0.08, 0.25, 0.8), Y = u.camera.camera_type === "orthographic" ? K * 0.55 : K * Math.tan(e.MathUtils.degToRad(u.camera.fov || 35) * 0.5), te = Y * (S.width || 16) / Math.max(1, S.height || 9), Z = V.clone().addScaledVector(D, K), N = [
              Z.clone().addScaledVector(k, -te).addScaledVector(W, -Y),
              Z.clone().addScaledVector(k, te).addScaledVector(W, -Y),
              Z.clone().addScaledVector(k, te).addScaledVector(W, Y),
              Z.clone().addScaledVector(k, -te).addScaledVector(W, Y)
            ], H = [];
            for (const X of N) H.push(V, X);
            for (let X = 0; X < 4; X++) H.push(N[X], N[(X + 1) % 4]);
            const M = new e.BufferGeometry().setFromPoints(H), B = new e.LineSegments(M, new e.LineBasicMaterial({
              color: _.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            B.userData.omnicamWidget = "gizmo", this.path.add(B);
            const P = new e.BufferGeometry();
            P.setIndex([0, 1, 2, 0, 2, 3]), P.setAttribute("position", new e.Float32BufferAttribute([
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
            const q = new e.Mesh(P, new e.MeshBasicMaterial({
              color: _.marker,
              transparent: !0,
              opacity: 0.12,
              depthTest: !1,
              side: e.DoubleSide
            }));
            q.userData.omnicamWidget = "gizmo", this.path.add(q);
            const Q = jt(e, {
              position: V,
              forward: D,
              up: W,
              color: _.marker,
              scale: e.MathUtils.clamp(K * 1.15, 0.35, 1.6),
              active: m
            });
            Q.userData.omnicamWidget = "gizmo", this.path.add(Q);
          }
          if ($) {
            const D = It(e, {
              position: I,
              radius: e.MathUtils.clamp(V.distanceTo(I) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            D.userData.omnicamWidget = "lookat", this.path.add(D);
            const k = new e.Line(
              new e.BufferGeometry().setFromPoints([V.clone(), I.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            k.renderOrder = 914, k.userData.omnicamWidget = "lookat", this.path.add(k);
          }
          if ($) {
            const D = Dt(u, a[L - 1] || null, a[L + 1] || null);
            for (const k of ["in", "out"]) {
              const W = new e.Vector3().fromArray(D[k]), K = new e.Line(
                new e.BufferGeometry().setFromPoints([V.clone(), W.clone()]),
                new e.LineBasicMaterial({ color: Oe, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              K.renderOrder = 912, K.userData.omnicamWidget = "gizmo", this.path.add(K);
              const Y = new e.Mesh(
                new e.SphereGeometry(Kt, 12, 8),
                new e.MeshBasicMaterial({ color: Oe, depthTest: !1 })
              );
              Y.position.copy(W), Y.renderOrder = 913, Y.userData.omnicamCurveHandle = { cameraId: t.id, frame: u.frame, side: k }, Y.userData.omnicamWidget = "gizmo", this.path.add(Y);
            }
          }
        }
      });
      const w = [16742005, 52937, 16632686, 7101671, 14774357];
      (S.objects || []).forEach((t, f) => {
        const a = t.keyframes || [];
        if (a.length < 2) return;
        const _ = t.color ? new e.Color(t.color) : w[f % w.length], m = a.map((L) => new e.Vector3().fromArray(L.transform?.position || [0, 0, 0])), y = new e.CatmullRomCurve3(m, !1, "centripetal"), u = new e.Mesh(
          new e.TubeGeometry(y, Math.max(32, a.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: _, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        u.renderOrder = 900, u.userData.omnicamWidget = "path", this.path.add(u);
        for (const L of a) {
          const C = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: _, depthTest: !1 })
          );
          C.position.fromArray(L.transform?.position || [0, 0, 0]), C.renderOrder = 910, C.userData.omnicamWidget = "path", this.path.add(C);
        }
      });
    }
  };
}
function Zt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: p, OBJLoader: G, PLYLoader: h, STLLoader: v, neutral: b, wire: U, checkerMaterial: O, objectMaterial: R, applyModelMaterial: T, disposeObject: z, textureFor: re, cardMesh: ee, generatePointField: J, sampleCamera: E, sampleObjectTransform: se, hasOutlineMesh: S } = o;
  return {
    updateLiveCameras(g, r, s, l, c = "camera", n = null) {
      if (z(this.liveCameras), this.liveCameras.clear(), s) return;
      const i = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (g.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: g.keyframes || [] }]).forEach((w, t) => {
        const f = w.color ? { line: new e.Color(w.color), marker: new e.Color(w.color), frustum: new e.Color(w.color), body: new e.Color(w.color).multiplyScalar(0.35) } : i[t % i.length], a = w.id === g.active_camera_id, _ = a && c === "camera", m = l === "camera" && a, y = E(w, r, g.objects), u = new e.Vector3().fromArray(y.position || [0, 0, 0]), L = new e.Vector3().fromArray(y.target || [0, 0, 0]), C = L.clone().sub(u), A = C.length();
        A < 1e-4 ? C.set(0, 0, -1) : C.normalize();
        let j = new e.Vector3(0, 1, 0), V = new e.Vector3().crossVectors(C, j);
        V.lengthSq() < 1e-6 && (j = new e.Vector3(0, 0, 1), V = new e.Vector3().crossVectors(C, j)), V.normalize();
        let I = new e.Vector3().crossVectors(V, C).normalize();
        if (y.roll) {
          const F = e.MathUtils.degToRad(y.roll);
          V.applyAxisAngle(C, F), I.applyAxisAngle(C, F);
        }
        const $ = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!m) {
          const F = new e.Group(), D = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: f.body, roughness: 0.4, metalness: 0.8 })
          );
          D.position.set(0, 0, -0.11), F.add(D);
          const k = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          k.rotateX(Math.PI / 2);
          const W = new e.Mesh(
            k,
            new e.MeshStandardMaterial({ color: f.marker, roughness: 0.2, metalness: 0.9 })
          );
          W.position.set(0, 0, 0.05), F.add(W);
          const K = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: a ? 16729156 : f.marker })
          );
          K.position.set(0, 0.07, -0.08), F.add(K);
          const Y = new e.Matrix4().makeBasis(V, I, C.clone().negate());
          F.quaternion.setFromRotationMatrix(Y), F.position.copy(u), F.userData.omnicamWidget = "gizmo", this.liveCameras.add(F);
          const te = new e.SphereGeometry(0.35, 8, 6), Z = new e.Mesh(te, $);
          Z.position.copy(u), Z.userData = { omnicamType: "camera", omnicamId: w.id }, this.liveCameras.add(Z);
          const N = e.MathUtils.clamp(A * 0.25, 0.5, 2.5), H = y.camera_type === "orthographic" ? 5 / Math.max(0.01, y.zoom || 1) * 0.35 : N * Math.tan(e.MathUtils.degToRad(y.fov || 35) * 0.5), M = H * (g.width || 16) / Math.max(1, g.height || 9), B = u.clone().addScaledVector(C, N), P = [
            B.clone().addScaledVector(V, -M).addScaledVector(I, -H),
            B.clone().addScaledVector(V, M).addScaledVector(I, -H),
            B.clone().addScaledVector(V, M).addScaledVector(I, H),
            B.clone().addScaledVector(V, -M).addScaledVector(I, H)
          ], q = [];
          for (const de of P) q.push(u, de);
          for (let de = 0; de < 4; de++) q.push(P[de], P[(de + 1) % 4]);
          const X = P[2].clone().add(P[3]).multiplyScalar(0.5).clone().addScaledVector(I, H * 0.25);
          q.push(P[2], X, X, P[3]);
          const ue = new e.BufferGeometry().setFromPoints(q), le = new e.LineSegments(ue, new e.LineBasicMaterial({
            color: _ ? f.marker : f.frustum,
            linewidth: a ? 2 : 1,
            transparent: !0,
            opacity: a ? 1 : 0.6
          }));
          le.userData.omnicamWidget = "gizmo", this.liveCameras.add(le);
          const oe = new e.BufferGeometry();
          oe.setIndex([0, 1, 2, 0, 2, 3]), oe.setAttribute("position", new e.Float32BufferAttribute([
            P[0].x,
            P[0].y,
            P[0].z,
            P[1].x,
            P[1].y,
            P[1].z,
            P[2].x,
            P[2].y,
            P[2].z,
            P[3].x,
            P[3].y,
            P[3].z
          ], 3));
          const Se = new e.Mesh(oe, new e.MeshBasicMaterial({
            color: _ ? f.marker : f.frustum,
            transparent: !0,
            opacity: 0.12,
            depthTest: !1,
            side: e.DoubleSide
          }));
          Se.userData.omnicamWidget = "gizmo", this.liveCameras.add(Se);
        }
        if (A > 0.01) {
          const F = a && c === "camera_target", D = new e.BufferGeometry().setFromPoints([u, L]), k = new e.Line(D, new e.LineDashedMaterial({
            color: _ || F ? 9133302 : f.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: _ || F ? 1 : a ? 0.75 : 0.4
          }));
          k.userData.omnicamWidget = "lookat", this.liveCameras.add(k);
          const W = F ? 0.12 : _ ? 0.11 : 0.08, K = [
            L.clone().add(new e.Vector3(-W, 0, 0)),
            L.clone().add(new e.Vector3(W, 0, 0)),
            L.clone().add(new e.Vector3(0, -W, 0)),
            L.clone().add(new e.Vector3(0, W, 0)),
            L.clone().add(new e.Vector3(0, 0, -W)),
            L.clone().add(new e.Vector3(0, 0, W))
          ], Y = new e.BufferGeometry().setFromPoints(K), te = new e.LineSegments(Y, new e.LineBasicMaterial({
            color: F || _ ? 9133302 : f.marker,
            linewidth: F ? 3 : 1,
            transparent: !0,
            opacity: F || _ ? 1 : a ? 0.9 : 0.5
          }));
          te.userData.omnicamWidget = "lookat", this.liveCameras.add(te);
          const Z = new e.SphereGeometry(0.28, 8, 6), N = new e.Mesh(Z, $);
          if (N.position.copy(L), N.userData = { omnicamType: "camera_target", omnicamId: w.id }, this.liveCameras.add(N), (F || _) && l !== "camera") {
            const H = new e.RingGeometry(0.14, 0.18, 24);
            H.rotateX(Math.PI / 2);
            const M = new e.MeshBasicMaterial({ color: Me.typeLookAt, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), B = new e.Mesh(H, M);
            B.position.copy(L), B.userData.omnicamWidget = "lookat", this.liveCameras.add(B);
          }
        }
        if (a && l !== "camera" && c === "camera") {
          const F = new e.RingGeometry(0.19, 0.24, 32);
          F.rotateX(Math.PI / 2);
          const D = new e.MeshBasicMaterial({ color: Me.accent, side: e.DoubleSide, transparent: !0, opacity: 1 }), k = new e.Mesh(F, D);
          k.position.copy(u), k.userData.omnicamWidget = "gizmo", this.liveCameras.add(k);
          const W = new e.RingGeometry(0.28, 0.31, 32);
          W.rotateX(Math.PI / 2);
          const K = new e.Mesh(W, new e.MeshBasicMaterial({ color: Me.accent, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          K.position.copy(u), K.userData.omnicamWidget = "gizmo", this.liveCameras.add(K);
        }
      });
    },
    updateSelection(g, r, s, l = null, c = "", n = !1) {
      const i = l ? `${l.mode || ""}:${l.objectId || ""}:${(l.point || []).join(",")}` : "", x = `${r}:${s || ""}:${(g.__selectedObjectIds || []).join(",")}:${c}:${i}:${n ? "ortho" : "persp"}`;
      if (x !== this.selectionKey) {
        if (this.selectionKey = x, z(this.selectionGroup), this.selectionGroup.clear(), r === "object" && s) {
          const w = this.objectNodes.get(s);
          if (w) {
            w.updateMatrixWorld(!0);
            try {
              const t = new e.Box3(), f = [];
              if (w.traverse((a) => {
                a.isBone && f.push(a);
              }), f.length > 0) {
                const a = new e.Vector3();
                for (const _ of f)
                  _.getWorldPosition(a), t.expandByPoint(a);
                t.expandByScalar(0.2);
              } else
                t.setFromObject(w);
              if ((n || !S(w)) && !t.isEmpty() && Number.isFinite(t.min.x) && Number.isFinite(t.max.x) && Number.isFinite(t.min.y) && Number.isFinite(t.max.y) && Number.isFinite(t.min.z) && Number.isFinite(t.max.z)) {
                t.expandByScalar(0.04);
                const a = new e.Box3Helper(t, new e.Color(9133302));
                a.material.transparent = !0, a.material.opacity = 0.95, a.material.depthTest = !1, a.renderOrder = 9999, this.selectionGroup.add(a);
              }
            } catch {
            }
            if (g.show_wireframe) {
              let t = 0;
              w.traverse((f) => {
                if (!f.isMesh || !f.geometry || f.userData.omnicamHelper || t >= 64) return;
                const a = Rt(e, f, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                a.renderOrder = 9998, this.selectionGroup.add(a), t += 1;
              });
            }
            if (l && l.objectId === s && l.point) {
              if (l.mode === "vertex") {
                const t = new e.SphereGeometry(0.08, 16, 12), f = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), a = new e.Mesh(t, f);
                a.position.fromArray(l.point), a.renderOrder = 1e4, this.selectionGroup.add(a);
                const _ = new e.RingGeometry(0.1, 0.15, 24), m = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), y = new e.Mesh(_, m);
                y.position.fromArray(l.point), this.activeCamera && y.quaternion.copy(this.activeCamera.quaternion), y.renderOrder = 1e4, this.selectionGroup.add(y);
              } else if (l.mode === "edge" && l.edge) {
                const [t, f] = l.edge, a = new e.BufferGeometry().setFromPoints([new e.Vector3(...t), new e.Vector3(...f)]), _ = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), m = new e.Line(a, _);
                m.renderOrder = 1e4, this.selectionGroup.add(m);
              } else if (l.mode === "face" && l.vertices) {
                const [t, f, a] = l.vertices, _ = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...t),
                  new e.Vector3(...f),
                  new e.Vector3(...a)
                ]);
                _.setIndex([0, 1, 2]), _.computeVertexNormals();
                const m = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), y = new e.Mesh(_, m);
                y.renderOrder = 1e4, this.selectionGroup.add(y);
                const u = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...t),
                  new e.Vector3(...f),
                  new e.Vector3(...a),
                  new e.Vector3(...t)
                ]), L = new e.Line(u, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                L.renderOrder = 10001, this.selectionGroup.add(L);
              }
            }
          }
        }
        if (r === "object")
          for (const w of g.__selectedObjectIds || []) {
            if (w === s) continue;
            const t = this.objectNodes.get(w);
            if (t) {
              t.updateMatrixWorld(!0);
              try {
                const f = new e.Box3().setFromObject(t);
                if ((n || !S(t)) && !f.isEmpty() && Number.isFinite(f.min.x)) {
                  f.expandByScalar(0.04);
                  const a = new e.Box3Helper(f, new e.Color(10980346));
                  a.material.transparent = !0, a.material.opacity = 0.6, a.material.depthTest = !1, a.renderOrder = 9997, this.selectionGroup.add(a);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(g) {
      const r = this.objectNodes.get(g);
      if (!r) return [];
      const s = [], l = /* @__PURE__ */ new Set();
      return r.traverse((c) => {
        const n = c.isBone ? c.name : "";
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
    sampleModelPoint(g, r, s, l = 24) {
      const c = this.objectNodes.get(g);
      if (!c) return null;
      const n = this.models.get(g), i = n?.mixer && n.duration > 0, x = i ? n.mixer.time : null;
      i && (n.mixer.setTime(Math.max(0, s) / Math.max(1, l) % n.duration), c.updateMatrixWorld(!0));
      let w = null;
      if (r) {
        let t = null;
        if (c.traverse((f) => {
          !t && f.isBone && f.name === r && (t = f);
        }), t) {
          const f = new e.Vector3().setFromMatrixPosition(t.matrixWorld);
          w = [f.x, f.y, f.z];
        }
      } else
        w = this.getObjectWorldCenter(g);
      return i && Number.isFinite(x) && (n.mixer.setTime(x), c.updateMatrixWorld(!0)), w;
    },
    getObjectWorldBounds(g) {
      const r = this.objectNodes.get(g);
      if (!r) return null;
      r.updateWorldMatrix(!0, !0);
      const s = new e.Box3().setFromObject(r, !0), l = s.min.toArray(), c = s.max.toArray();
      return !s.isEmpty() && [...l, ...c].every(Number.isFinite) ? { min: l, max: c } : null;
    },
    getObjectWorldCenter(g) {
      const r = this.objectNodes.get(g);
      if (!r) return null;
      r.updateMatrixWorld(!0);
      const s = [];
      if (r.traverse((n) => {
        n.isBone && s.push(n);
      }), s.length > 0) {
        const n = new e.Vector3(), i = new e.Vector3();
        for (const x of s)
          x.getWorldPosition(i), n.add(i);
        return n.divideScalar(s.length), [n.x, n.y, n.z];
      }
      const l = new e.Box3().setFromObject(r);
      if (!l.isEmpty() && Number.isFinite(l.min.x)) {
        const n = l.getCenter(new e.Vector3());
        return [n.x, n.y, n.z];
      }
      const c = new e.Vector3();
      return r.getWorldPosition(c), [c.x, c.y, c.z];
    },
    /** Every bone name in a loaded model, for the Rig Mapper (design spec 23). */
    getModelBoneNames(g) {
      const r = this.objectNodes.get(g);
      if (!r) return [];
      const s = [];
      return r.traverse((l) => {
        l.isBone && l.name && s.push(l.name);
      }), s;
    },
    /** Resolve one loaded bone by name, plus its world position. */
    resolveModelBone(g, r) {
      const s = this.objectNodes.get(g);
      if (!s || !r) return null;
      let l = null;
      if (s.traverse((n) => {
        !l && n.isBone && n.name === r && (l = n);
      }), !l) return null;
      l.updateWorldMatrix(!0, !1);
      const c = new e.Vector3();
      return l.getWorldPosition(c), { name: r, world: [c.x, c.y, c.z] };
    },
    /**
     * Apply an FK pose to a loaded character (design spec section 29,
     * ui.characterRuntime.applyPose). `boneMap` is canonical joint -> bone name;
     * `joints` is canonical joint -> local quaternion [x,y,z,w]. Bones not named
     * by `joints` are left at their bind rotation, captured once per bone.
     */
    applyCharacterPose(g, r, s) {
      const l = this.objectNodes.get(g);
      if (!l) return !1;
      const c = /* @__PURE__ */ new Map();
      if (l.traverse((i) => {
        i.isBone && i.name && c.set(i.name, i);
      }), !c.size) return !1;
      for (const i of c.values())
        i.userData.omnicamBindQuat || (i.userData.omnicamBindQuat = i.quaternion.clone());
      const n = s && typeof s == "object" ? s : {};
      for (const [i, x] of Object.entries(r || {})) {
        const w = c.get(x);
        if (!w) continue;
        const t = n[i];
        Array.isArray(t) && t.length === 4 && t.every(Number.isFinite) ? w.quaternion.fromArray(t).normalize() : w.userData.omnicamBindQuat && w.quaternion.copy(w.userData.omnicamBindQuat), w.updateMatrixWorld(!0);
      }
      return this.invalidate(), !0;
    },
    /**
     * Read the current local rotation of every mapped canonical joint -- what
     * "Bake current frame to pose" samples off the live mixer (design spec
     * section 27). A joint still at its captured bind rotation is omitted.
     */
    sampleCharacterBonePose(g, r) {
      const s = this.objectNodes.get(g);
      if (!s || !r) return {};
      const l = /* @__PURE__ */ new Map();
      s.traverse((n) => {
        n.isBone && n.name && l.set(n.name, n);
      });
      const c = {};
      for (const [n, i] of Object.entries(r)) {
        const x = l.get(i);
        if (!x) continue;
        const w = x.userData.omnicamBindQuat;
        w && x.quaternion.angleTo(w) < 1e-4 || (c[n] = x.quaternion.toArray());
      }
      return c;
    }
  };
}
function Jt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: p, OBJLoader: G, PLYLoader: h, STLLoader: v, neutral: b, wire: U, checkerMaterial: O, objectMaterial: R, applyModelMaterial: T, disposeObject: z, textureFor: re, cardMesh: ee, generatePointField: J, sampleCamera: E, sampleObjectTransform: se } = o;
  function S(g) {
    const r = g.supersampleFactor?.() || 1;
    return { w: g.canvas.width / r, h: g.canvas.height / r };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(g) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: r, h: s } = S(this);
      this.pointer.set(g[0] / r * 2 - 1, -(g[1] / s) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const x = gt(i);
        if (x) return { ...x, position: i.object.position.toArray() };
      }
      const l = 16 * Math.min(2, window.devicePixelRatio || 1);
      let c = null;
      const n = new e.Vector3();
      for (const i of this.path.children) {
        const x = i.userData?.omnicamPathKey;
        if (!x || (n.copy(i.position).project(this.activeCamera), n.z < -1 || n.z > 1)) continue;
        const w = (n.x * 0.5 + 0.5) * r, t = (1 - (n.y * 0.5 + 0.5)) * s, f = Math.hypot(g[0] - w, g[1] - t);
        f <= l && (!c || f < c.distance) && (c = { key: x, position: i.position.toArray(), distance: f });
      }
      return c ? { ...c.key, position: c.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(g) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: r, h: s } = S(this);
      this.pointer.set(g[0] / r * 2 - 1, -(g[1] / s) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const x = wt(i);
        if (x) return { ...x, position: i.object.position.toArray() };
      }
      const l = 14 * Math.min(2, window.devicePixelRatio || 1);
      let c = null;
      const n = new e.Vector3();
      for (const i of this.path.children) {
        const x = i.userData?.omnicamCurveHandle;
        if (!x || (n.copy(i.position).project(this.activeCamera), n.z < -1 || n.z > 1)) continue;
        const w = (n.x * 0.5 + 0.5) * r, t = (1 - (n.y * 0.5 + 0.5)) * s, f = Math.hypot(g[0] - w, g[1] - t);
        f <= l && (!c || f < c.distance) && (c = { handle: x, position: i.position.toArray(), distance: f });
      }
      return c ? { ...c.handle, position: c.position } : null;
    },
    /**
     * The active camera-path segment (two neighbouring real keyframes, plus
     * a `t` 0..1 between them) nearest the pointer, for double-click-to-
     * insert (Task 8). `null` when the pointer isn't over the path tube.
     */
    pickPathSegment(g) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: r, h: s } = S(this);
      this.pointer.set(g[0] / r * 2 - 1, -(g[1] / s) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const l = this.raycaster.intersectObjects(this.path.children, !0).find((u) => u.object.userData?.omnicamPathSegments);
      if (!l) return null;
      const { cameraId: c, firstFrame: n, lastFrame: i, frames: x, points: w } = l.object.userData.omnicamPathSegments;
      if (!w?.length || x.length < 2) return null;
      let t = 0, f = 1 / 0;
      for (let u = 0; u < w.length; u += 1) {
        const [L, C, A] = w[u], j = L - l.point.x, V = C - l.point.y, I = A - l.point.z, $ = j * j + V * V + I * I;
        $ < f && (f = $, t = u);
      }
      const a = n + (i - n) * t / Math.max(1, w.length - 1);
      let _ = x[0], m = x[x.length - 1];
      for (let u = 0; u < x.length - 1; u += 1)
        if (x[u] <= a && a <= x[u + 1]) {
          _ = x[u], m = x[u + 1];
          break;
        }
      if (_ === m) return null;
      const y = Math.min(1, Math.max(0, (a - _) / (m - _)));
      return { cameraId: c, leftFrame: _, rightFrame: m, t: y };
    },
    configureCamera(g, r) {
      const s = g || defaultCamera(), l = Math.max(5e-4, Number(s.near) || 0.01), c = Math.max(l + 1, Number(s.far) || 1e4);
      let n;
      if (s.camera_type === "orthographic") {
        n = this.orthographic;
        const a = 5 / Math.max(0.01, s.zoom || 1);
        n.left = -a * r, n.right = a * r, n.top = a, n.bottom = -a, n.near = l, n.far = c, n.updateProjectionMatrix();
      } else
        n = this.perspective, n.fov = e.MathUtils.clamp(Number(s.fov) || 35, 1, 175), n.aspect = r, n.near = l, n.far = c, n.updateProjectionMatrix();
      const i = new e.Vector3().fromArray(s.position || [6, 4, 6]), x = new e.Vector3().fromArray(s.target || [0, 1.5, 0]), w = x.clone().sub(i);
      w.lengthSq() < 1e-6 ? w.set(0, 0, -1) : w.normalize();
      let t = s.up ? new e.Vector3().fromArray(s.up) : new e.Vector3(0, 1, 0), f = new e.Vector3().crossVectors(w, t);
      if (f.lengthSq() < 1e-6 && (t = Math.abs(w.y) > 0.9 ? new e.Vector3(0, 0, w.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), f.crossVectors(w, t)), f.normalize(), t.crossVectors(f, w).normalize(), s.roll) {
        const a = e.MathUtils.degToRad(s.roll);
        f.applyAxisAngle(w, a), t.applyAxisAngle(w, a);
      }
      return n.position.copy(i), n.up.copy(t), n.lookAt(x), n.updateMatrixWorld(), n;
    },
    pick(g, r, s, l) {
      if (!this.activeCamera) return null;
      this.pointer.set(g / Math.max(1, s) * 2 - 1, 1 - r / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const c = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const n of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          n.object?.userData?.omnicamType && c.push({
            distance: n.distance,
            type: n.object.userData.omnicamType,
            id: n.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const n of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (n.object?.userData?.omnicamCaptureGuide || n.object?.userData?.omnicamHelper) continue;
          let i = n.object;
          for (; i && !i.userData?.omnicamId; ) i = i.parent;
          i?.userData?.omnicamId && c.push({
            distance: n.distance,
            type: "object",
            id: i.userData.omnicamId
          });
        }
      return c.length ? (c.sort((n, i) => n.distance - i.distance), { type: c[0].type, id: c[0].id }) : null;
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
    projectWorldToScreen(g, r = null, s = null) {
      if (!this.activeCamera || !Array.isArray(g) || g.length < 3) return null;
      const { w: l, h: c } = S(this), n = r != null && s != null ? r : l, i = r != null && s != null ? s : c, x = new e.Vector3(Number(g[0]) || 0, Number(g[1]) || 0, Number(g[2]) || 0);
      return x.project(this.activeCamera), {
        x: (x.x * 0.5 + 0.5) * n,
        y: (1 - (x.y * 0.5 + 0.5)) * i,
        behind: x.z < -1 || x.z > 1,
        width: n,
        height: i
      };
    },
    pickSubElement(g, r, s, l, c = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(g / Math.max(1, s) * 2 - 1, 1 - r / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const n = this.raycaster.intersectObjects(this.content.children, !0);
      for (const i of n) {
        let x = i.object, w = i.object;
        for (; x && !x.userData.omnicamId; ) x = x.parent;
        if (!x?.userData.omnicamId || !w.geometry) continue;
        const t = x.userData.omnicamId, a = w.geometry.getAttribute("position");
        if (!a) continue;
        w.updateMatrixWorld(!0);
        const _ = w.matrixWorld;
        if (c === "vertex") {
          let m = -1, y = 1 / 0, u = null;
          if (i.face) {
            const L = [i.face.a, i.face.b, i.face.c];
            for (const C of L) {
              const A = new e.Vector3(a.getX(C), a.getY(C), a.getZ(C)).applyMatrix4(_), j = A.distanceTo(i.point);
              j < y && (y = j, m = C, u = [A.x, A.y, A.z]);
            }
          } else
            for (let L = 0; L < a.count; L++) {
              const C = new e.Vector3(a.getX(L), a.getY(L), a.getZ(L)).applyMatrix4(_), A = C.distanceTo(i.point);
              A < y && (y = A, m = L, u = [C.x, C.y, C.z]);
            }
          if (u)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: t,
              index: m,
              point: u
            };
        }
        if (c === "edge" && i.face) {
          const m = new e.Vector3(a.getX(i.face.a), a.getY(i.face.a), a.getZ(i.face.a)).applyMatrix4(_), y = new e.Vector3(a.getX(i.face.b), a.getY(i.face.b), a.getZ(i.face.b)).applyMatrix4(_), u = new e.Vector3(a.getX(i.face.c), a.getY(i.face.c), a.getZ(i.face.c)).applyMatrix4(_), L = (I, $, F) => {
            const D = new e.Line3($, F), k = new e.Vector3();
            return D.closestPointToPoint(I, !0, k), { dist: I.distanceTo(k), point: k, segment: [$, F] };
          }, C = L(i.point, m, y), A = L(i.point, y, u), j = L(i.point, u, m), V = [C, A, j].reduce((I, $) => $.dist < I.dist ? $ : I);
          return {
            type: "edge",
            mode: "edge",
            objectId: t,
            point: [V.point.x, V.point.y, V.point.z],
            edge: [
              [V.segment[0].x, V.segment[0].y, V.segment[0].z],
              [V.segment[1].x, V.segment[1].y, V.segment[1].z]
            ]
          };
        }
        if (c === "face" && i.face) {
          const m = new e.Vector3(a.getX(i.face.a), a.getY(i.face.a), a.getZ(i.face.a)).applyMatrix4(_), y = new e.Vector3(a.getX(i.face.b), a.getY(i.face.b), a.getZ(i.face.b)).applyMatrix4(_), u = new e.Vector3(a.getX(i.face.c), a.getY(i.face.c), a.getZ(i.face.c)).applyMatrix4(_), L = new e.Vector3().add(m).add(y).add(u).divideScalar(3), C = i.face.normal.clone().transformDirection(_);
          return {
            type: "face",
            mode: "face",
            objectId: t,
            faceIndex: i.faceIndex,
            point: [L.x, L.y, L.z],
            normal: [C.x, C.y, C.z],
            vertices: [
              [m.x, m.y, m.z],
              [y.x, y.y, y.z],
              [u.x, u.y, u.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(g, r, s, l) {
      if (!this.activeCamera) return null;
      this.pointer.set(g / Math.max(1, s) * 2 - 1, 1 - r / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const c = this.raycaster.intersectObjects(this.content.children, !0);
      if (c.length > 0)
        return [c[0].point.x, c[0].point.y, c[0].point.z];
      const n = new e.Plane(new e.Vector3(0, 1, 0), 0), i = new e.Vector3();
      return this.raycaster.ray.intersectPlane(n, i) ? [i.x, i.y, i.z] : null;
    }
  };
}
const xe = ["high", "balanced", "low"], Ht = 25, ke = 30, Et = 0.6;
function Fe(o = "balanced") {
  return { quality: o, samples: [], downgraded: !1 };
}
function er(o) {
  const e = xe.indexOf(o);
  return e < 0 || e >= xe.length - 1 ? null : xe[e + 1];
}
function tr(o, e) {
  if (!Number.isFinite(e) || e < 0 || (o.samples.push(e), o.samples.length > ke && o.samples.shift(), o.samples.length < ke) || o.samples.filter((G) => G > Ht).length / o.samples.length < Et) return null;
  const p = er(o.quality);
  return p ? (o.quality = p, o.downgraded = !0, o.samples = [], p) : null;
}
function rr(o, e) {
  return o.quality = e, o.samples = [], o.downgraded = !1, o;
}
function or(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: p, OBJLoader: G, PLYLoader: h, STLLoader: v, neutral: b, wire: U, checkerMaterial: O, objectMaterial: R, applyModelMaterial: T, disposeObject: z, textureFor: re, cardMesh: ee, generatePointField: J, sampleCamera: E, sampleObjectTransform: se, hasOutlineMesh: S, SelectionOutlineRenderer: g } = o;
  return {
    render(r, s, l, c, n, i = /* @__PURE__ */ new Map(), x = 0, w = !1, t = "camera", f = "subject", a = null, _ = null, m = null, y = "auto") {
      const u = w && y === "clay" ? !0 : w && (y === "motion_proxy" || y === "depth_rich") ? !1 : !w || (r.render_mode || "") === "beauty";
      if (u !== this.studioEnabled) {
        this.studioEnabled = u, qe(e, this.scene, this.renderer, this.studio, u);
        for (const M of this.flatLights || []) M.visible = !u;
      }
      const L = !!r.objects?.some((M) => M.type === "sun_light" && M.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !L && u), this.flatLights?.[1] && (this.flatLights[1].visible = !L && !u), this.disposed) return;
      (this.canvas.width !== c || this.canvas.height !== n) && this.renderer.setSize(c, n, !1);
      const C = (s && s.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const A = r.viewport_bg_sequence && r.viewport_bg_sequence.length ? r.viewport_bg_sequence[x % r.viewport_bg_sequence.length] : r.viewport_bg_image || "";
      if (A) {
        this.bgImageUrl = A;
        const M = this.bgTextureCache.get(A);
        if (M)
          this.bgTextureCache.delete(A), this.bgTextureCache.set(A, M), this.bgTexture = M, this.scene.background = M;
        else if (!this.bgTextureLoads.has(A)) {
          const B = this.bgLoadGeneration;
          this.bgTextureLoads.set(A, B), new e.TextureLoader().load(A, (q) => {
            if (this.bgTextureLoads.delete(A), this.disposed || B !== this.bgLoadGeneration) {
              q.dispose();
              return;
            }
            for (q.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(A, q); this.bgTextureCache.size > 8; ) {
              const Q = [...this.bgTextureCache.keys()].find((ue) => ue !== this.bgImageUrl);
              if (!Q) break;
              const X = this.bgTextureCache.get(Q);
              this.bgTextureCache.delete(Q), X?.dispose?.();
            }
            this.bgImageUrl === A && (this.bgTexture = q, this.scene.background = q), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(A);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const B of new Set(this.bgTextureCache.values())) B.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const M = r.viewport_bg_color && r.viewport_bg_color !== Ve;
        this.scene.background = this.studioEnabled && !M && !C ? this.studio.sky : new e.Color(M ? r.viewport_bg_color : this.studioEnabled && C ? 1447709 : Ve);
      }
      const j = JSON.stringify([
        r.render_mode,
        r.card_fit,
        r.point_density,
        r.point_spread,
        !!r.show_wireframe,
        !!r.show_vertices,
        !!r.backface_culling,
        r.reconstruction_appearance || "neutral",
        !!w,
        y,
        r.objects.map((M) => {
          const { position: B, rotation: P, keyframes: q, size: Q, ...X } = M;
          return M.type === "card" && (X.size = Q), X;
        })
      ]), V = [...l.entries()].map(([M, B]) => `${M}:${B?.src || ""}`).join("|"), I = [...i.entries()].map(([M, B]) => `${M}:${B}`).join("|");
      (j !== this.sceneKey || V !== this.mediaSignature || I !== this.modelSignature) && (this.sceneKey = j, this.mediaSignature = V, this.modelSignature = I, this.rebuild(r, l, i, w, y));
      const $ = Math.max(1, r.fps || 24), F = /* @__PURE__ */ new Map();
      for (const M of r.objects)
        M.character?.motion && this.models.has(M.id) && F.set(M.id, M.character.motion);
      for (const [M, B] of this.models) {
        if (!B.mixer || !(B.duration > 0)) continue;
        const P = F.get(M);
        P ? (this.applyMotionClip?.(M, P), B.mixer.setTime(yt(P, x, $, B.duration))) : B.mixer.setTime(x / $ % B.duration);
      }
      for (const M of r.objects) {
        const B = this.objectNodes.get(M.id);
        if (!B) continue;
        const P = M.keyframes?.length ? se(M, x) : M;
        B.position.fromArray(P.position || [0, 0, 0]), B.rotation.set(...(P.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), M.type !== "card" && M.type !== "null" && B.scale.fromArray(P.size || [1, 1, 1]), M.type === "null" && (B.visible = w ? !0 : r.show_helper_axes !== !1);
      }
      this.path.visible = !w;
      const D = r.show_grid !== !1 && r.render_mode !== "point_field", k = y === "depth_rich" || !!r.playblast_grid;
      this.gridGroup.visible = w ? k : D;
      const W = r.view_mode || "camera", K = Array.isArray(m) ? [...m].sort((M, B) => M - B).join(",") : "", Y = `${W}:${t}:${_ ?? ""}:${K}:${r.__omnicamRevision ?? JSON.stringify([
        r.active_camera_id,
        (r.cameras || []).map((M) => [M.id, M.keyframes?.length, M.keyframes?.map((B) => [B.frame, B.camera?.position, B.camera?.target, B.interpolation, B.tangents])]),
        (r.objects || []).map((M) => [M.id, M.keyframes?.length, M.keyframes?.map((B) => [B.frame, B.transform?.position])])
      ])}`;
      if (Y !== this.pathKey && (this.pathKey = Y, this.rebuildPath(r, t, _, W, m)), this.updateLiveCameras(r, x, w, W, t, _), this.liveCameras.visible = !w, !w) {
        const M = r.show_camera_paths !== !1, B = r.show_camera_gizmos !== !1, P = r.show_look_at !== !1;
        for (const q of [this.path, this.liveCameras])
          q.traverse((Q) => {
            const X = Q.userData.omnicamWidget;
            X === "path" ? Q.visible = M : X === "gizmo" ? Q.visible = B : X === "lookat" && (Q.visible = P);
          });
      }
      const te = c / Math.max(1, n), Z = this.configureCamera(s, te);
      if (this.activeCamera = Z, w ? this.selectionGroup.visible = !1 : (this.updateSelection(r, t, f, a, `${r.__omnicamRevision ?? "legacy"}:${x}`, C), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const M = new e.Box3();
        this.content.traverse((P) => {
          if (!P.isMesh || P.userData.omnicamCaptureGuide) return;
          P.castShadow = !0, P.receiveShadow = !0, P.updateWorldMatrix(!0, !1);
          const q = new e.Box3().setFromObject(P);
          !q.isEmpty() && Number.isFinite(q.min.x) && M.union(q);
        });
        const B = this.studio?.key;
        if (B) {
          const P = M.isEmpty() ? new e.Vector3() : M.getCenter(new e.Vector3()), q = M.isEmpty() ? new e.Vector3(12, 12, 12) : M.getSize(new e.Vector3()), Q = Math.max(1, 0.5 * Math.max(q.x, q.y, q.z) * Math.SQRT2), X = Q * 1.15 + 0.5, ue = new e.Vector3(4.5, 7.5, 3.5).normalize(), le = Math.max(12, Q * 4);
          B.position.copy(P).addScaledVector(ue, le), B.target.position.copy(P), B.target.updateMatrixWorld(!0);
          const oe = B.shadow.camera;
          oe.left = -X, oe.right = X, oe.top = X, oe.bottom = -X, oe.near = Math.max(0.1, le - Q - 1), oe.far = le + Q + 1, oe.updateProjectionMatrix(), B.shadow.map?.dispose(), B.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((M) => {
        M.userData.omnicamBillboard && M.quaternion.copy(Z.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, c, n);
      const N = performance.now();
      let H = !1;
      if (!w && !C && t === "object" && (f || r.__selectedObjectIds?.length) && !a) {
        const M = r.__selectedObjectIds?.length ? r.__selectedObjectIds : f ? [f] : [], B = [];
        for (const P of M) {
          const q = this.objectNodes.get(P);
          q && S(q) && B.push(q);
        }
        B.length && (this.outlineRenderer || (this.outlineRenderer = new g(this.renderer, this.scene, void 0, Z)), this.outlineRenderer.render(Z, c, n, B), H = !0);
      }
      if (H || this.renderer.render(this.scene, Z), !w && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Fe(this.studio?.quality);
        const M = tr(this.qualityMonitor, performance.now() - N);
        M && (Ae(this.studio, this.renderer, M), this.onQualityDowngrade?.(M));
      }
    },
    setViewportQuality(r) {
      Ae(this.studio, this.renderer, r), this.qualityMonitor = rr(this.qualityMonitor || Fe(r), r);
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
        this.disposed = !0, this.bgLoadGeneration += 1, this.bgTextureLoads.clear(), z(this.content), z(this.gridGroup), z(this.path), z(this.liveCameras), z(this.selectionGroup);
        for (const r of new Set(this.bgTextureCache.values())) r.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        for (const r of this.models.values()) z(r.scene, !0);
        this.models.clear(), this.modelLoads.clear(), this.studio?.dispose(), this.outlineRenderer?.dispose(), this.renderer.dispose(), this.renderer.forceContextLoss(), this.canvas.width = 1, this.canvas.height = 1;
      }
    }
  };
}
const ar = {
  EffectComposer: Je,
  OutlinePass: Ze,
  OutputPass: Qe,
  RenderPass: Ye,
  Vector2: ze
};
function sr(o) {
  let e = !1;
  return o?.traverse?.((d) => {
    e || d.visible === !1 || !d.isMesh || d.userData?.omnicamHelper || d.userData?.omnicamCaptureGuide || (e = !!(d.geometry && d.material));
  }), e;
}
class nr {
  constructor(e, d, p = ar, G = null) {
    const { EffectComposer: h, RenderPass: v, OutlinePass: b, OutputPass: U, Vector2: O } = p;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new h(e), this.renderPass = new v(d, G), this.outlinePass = new b(new O(1, 1), d, G, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new U(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, d, p, G) {
    this.disposed || ((d !== this.width || p !== this.height) && (this.width = d, this.height = p, this.composer.setSize(d, p)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...G], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const Te = { low: zt, balanced: Tt, high: Ft }, he = new Be({ color: 10265519, roughness: 0.48, metalness: 0.06, side: ae }), $e = new Be({ color: 2237998, roughness: 0.95, metalness: 0, side: ae }), Le = new be({ color: 11449792, wireframe: !0, side: ae });
function Ge(o = !1) {
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
  ]), d = new ut(e, 2, 2, mt);
  return d.wrapS = d.wrapT = ht, d.repeat.set(8, 8), d.colorSpace = Ce, d.needsUpdate = !0, new Be({ map: d, roughness: 0.85, metalness: 0, side: o ? _e : ae });
}
function ir(o, e, d = !1) {
  const p = e === "wireframe" ? "wireframe" : o.material_mode || "textured", G = d ? _e : ae;
  if (p === "wireframe") {
    const v = Le.clone();
    return v.side = G, o.color && (v.color = new ce(o.color)), v;
  }
  if (p === "checker") return Ge(d);
  if (p === "matte") {
    const v = $e.clone();
    return v.side = G, o.color && (v.color = new ce(o.color)), v;
  }
  const h = he.clone();
  return h.side = G, o.color && (h.color = new ce(o.color)), h;
}
function cr(o, e, d = null, p = !1) {
  const G = p ? _e : ae;
  o.traverse((h) => {
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
        h.material = Ge(p), h.userData.omnicamOverrideMaterial = !0;
      else if (e === "wireframe") {
        const v = Le.clone();
        v.side = G, d?.color && (v.color = new ce(d.color)), h.material = v, h.userData.omnicamOverrideMaterial = !0;
      } else if (e === "matte") {
        const v = $e.clone();
        v.side = G, d?.color && (v.color = new ce(d.color)), h.material = v, h.userData.omnicamOverrideMaterial = !0;
      } else {
        const v = he.clone();
        v.side = G, d?.color && (v.color = new ce(d.color)), h.material = v, h.userData.omnicamOverrideMaterial = !0;
      }
    }
  });
}
function ve(o, e = !1) {
  o.traverse((d) => {
    if (d.userData.omnicamModelResource && !e) return;
    d.geometry?.dispose?.();
    const p = Array.isArray(d.material) ? d.material : [d.material];
    for (const G of p)
      G?.map?.userData?.omnicamSharedResource || G?.map?.dispose?.(), G?.dispose?.();
  });
}
function Ke(o) {
  if (!o) return null;
  const e = o instanceof HTMLVideoElement ? new ft(o) : new pt(o);
  return e.colorSpace = Ce, e.needsUpdate = !0, e;
}
function lr(o, e, d) {
  e && Gt(o, e);
  const [p, G] = o.size || [2, 3], h = new ie(), v = new we(new De(p, G), new be({ color: 1448482, side: ae, transparent: !0, opacity: 0.85 }));
  v.frustumCulled = !1, h.add(v);
  let b = e ? Ke(e) : null;
  if (!b && (o.id === "subject" || !o.asset) && (b = St(me)), !b) return h;
  const O = e?.videoWidth || e?.naturalWidth || e?.width || p, R = e?.videoHeight || e?.naturalHeight || e?.height || G, T = O / Math.max(1, R), z = p / Math.max(0.01, G);
  let re = p, ee = G;
  d === "contain" ? T > z ? ee = p / T : re = G * T : d === "cover" && (T > z ? (b.repeat.x = z / T, b.offset.x = (1 - b.repeat.x) * 0.5) : (b.repeat.y = T / z, b.offset.y = (1 - b.repeat.y) * 0.5));
  const J = new we(
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
  return J.frustumCulled = !1, J.position.z = 2e-3, h.add(J), h.frustumCulled = !1, h;
}
class dr {
  constructor(e = () => {
  }, d = () => {
  }) {
    this.canvas = document.createElement("canvas"), this.renderer = new He({
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
    p.position.set(5, 8, 4), this.scene.add(p), this.flatLights = [this.scene.children.at(-2), p], this.studio = Bt(me, this.renderer, Lt), this.scene.add(this.studio.group), this.studioEnabled = !0, qe(me, this.scene, this.renderer, this.studio, !0), this.content = new ie(), this.scene.add(this.content), this.gridGroup = Yt(me), this.scene.add(this.gridGroup), this.path = new ie(), this.scene.add(this.path), this.liveCameras = new ie(), this.scene.add(this.liveCameras), this.selectionGroup = new ie(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ot(35, 16 / 9, 0.01, 1e4), this.orthographic = new at(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = d, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new st(), this.pointer = new ze(), this.activeCamera = this.perspective;
  }
  async loadModel(e, d, p = "glb") {
    const G = `${p}:${d}`;
    if (!(!d || this.modelLoads.get(e) === G)) {
      this.modelLoads.set(e, G);
      try {
        let h, v = [];
        if (p === "obj") h = await new We().loadAsync(d);
        else if (p === "fbx")
          h = await new je().loadAsync(d), v = h.animations || [];
        else if (p === "stl") h = new we(await new Ie().loadAsync(d), he.clone());
        else if (p === "ply") {
          const s = await new Ne().loadAsync(d);
          s.index ? (s.getAttribute("normal") || s.computeVertexNormals(), h = new we(s, he.clone())) : h = new nt(s, new it({ color: 11449792, size: 0.025 }));
        } else {
          const s = await new Ue().loadAsync(d);
          h = s.scene, v = s.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== G) {
          ve(h, !0);
          return;
        }
        const b = this.models.get(e);
        b && ve(b.scene, !0), h.traverse((s) => {
          if (s.userData.omnicamModelResource = !0, s.frustumCulled = !1, s.isMesh && (s.frustumCulled = !1, s.material)) {
            const l = Array.isArray(s.material) ? s.material : [s.material];
            for (const c of l)
              c.side = ae;
          }
          s.isPoints && (s.frustumCulled = !1), s.isSkinnedMesh && (s.frustumCulled = !1, s.computeBoundingBox?.(), s.computeBoundingSphere?.());
        });
        let U = 0, O = 0, R = 0, T = 0;
        h.traverse((s) => {
          s.isMesh && (U += 1, T += s.geometry?.getAttribute?.("position")?.count || 0), s.isPoints && (O += 1), s.isBone && (R += 1);
        });
        const z = new ie();
        if (z.frustumCulled = !1, z.add(h), !U && !O && R) {
          const s = new ct(h);
          s.material.depthTest = !1, s.material.opacity = 0.9, s.material.transparent = !0, s.renderOrder = 10, s.userData.omnicamModelResource = !0, z.add(s);
        }
        z.updateMatrixWorld(!0);
        const re = new lt().setFromObject(z), ee = re.getSize(new Pe()), J = Math.max(ee.x, ee.y, ee.z), E = Number.isFinite(J) && J > 1e-6 ? 2.5 / J : 1, se = re.getCenter(new Pe());
        z.scale.setScalar(E), z.position.set(-se.x * E, -re.min.y * E, -se.z * E);
        const S = new ie();
        S.frustumCulled = !1, S.add(z);
        const g = v.length ? new dt(h) : null;
        g && g.clipAction(v[0]).play();
        const r = { url: d, format: p, scene: S, mixer: g, clips: v, selectedClip: 0, duration: v[0]?.duration || 0, meshes: U, points: O, bones: R, vertices: T, animations: v.length, normalizationScale: E };
        this.models.set(e, r), this.onModelLoaded({ id: e, format: p, meshes: U, points: O, bones: R, vertices: T, animations: v.length, animationNames: v.map((s, l) => s.name || `Clip ${l + 1}`), duration: r.duration, normalizationScale: E }), this.sceneKey = "", this.invalidate();
      } catch (h) {
        this.modelLoads.get(e) === G && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${p.toUpperCase()} ${e}`, h);
        const v = h?.message?.includes("FBX version not supported") || h?.message?.includes("6100") || h?.message?.includes("6000"), b = v ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : h?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: p, error: b, isLegacyFBX: v });
      }
    }
  }
}
const fe = { THREE: me, FBXLoader: je, GLTFLoader: Ue, OBJLoader: We, PLYLoader: Ne, STLLoader: Ie, neutral: he, wire: Le, checkerMaterial: Ge, objectMaterial: ir, applyModelMaterial: cr, disposeObject: ve, textureFor: Ke, cardMesh: lr, generatePointField: Mt, sampleCamera: xt, sampleObjectTransform: bt, hasOutlineMesh: sr, SelectionOutlineRenderer: nr };
Object.assign(
  dr.prototype,
  Qt(fe),
  Zt(fe),
  Jt(fe),
  or(fe)
);
async function ur(o, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const d of ["vp9", "vp8"])
    try {
      if (await pe(Wt(d, { width: o, height: e }), 5e3, `Checking ${d} support`)) return d;
    } catch {
    }
  return null;
}
function pe(o, e, d) {
  let p;
  return Promise.race([
    o,
    new Promise((G, h) => {
      p = setTimeout(() => h(new Error(`${d} timed out`)), e);
    })
  ]).finally(() => clearTimeout(p));
}
async function Mr(o, e, d, p, G, h = "balanced") {
  const v = await ur(o.width, o.height);
  if (!v) throw new Error("No supported WebCodecs WebM encoder");
  const b = new At({ format: new Ot(), target: new Vt() }), U = new kt(o, { codec: v, quality: Te[h] || Te.balanced, keyFrameInterval: 1 });
  b.addVideoTrack(U, { frameRate: d }), await pe(b.start(), 1e4, "Starting deterministic encoder");
  try {
    const O = 1 / d;
    for (let R = 0; R < e; R++) {
      if (G?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await p(R), await pe(U.add(R * O, O, { keyFrame: R % d === 0 }), 1e4, `Encoding frame ${R + 1}`);
    }
    await pe(b.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (O) {
    throw b.state !== "finalized" && await b.cancel().catch(() => {
    }), O;
  }
  return _t(new Blob([b.target.buffer], { type: await b.getMimeType() }), {
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
  Mr as encodeDeterministicPlayblast,
  ur as supportsDeterministicEncoding
};
