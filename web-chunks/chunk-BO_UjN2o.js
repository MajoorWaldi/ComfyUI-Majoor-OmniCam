import { T as me } from "./chunk-D_M_mkHf.js";
import { ab as ze, ae as Ye, af as Qe, ag as Ze, ah as Je, W as He, s as Ce, Z as Ee, i as et, u as ce, H as tt, l as rt, G as ie, k as ot, Y as st, a2 as at, ai as We, aj as je, M as we, ak as Ie, n as Be, al as Ne, P as nt, c as it, e as Ue, D as se, a5 as ct, d as lt, V as Pe, v as dt, f as be, J as _e, m as De, z as ut, a1 as mt, a3 as ht, ac as ft, a8 as pt } from "./vendor-three-B8JDtKPi.js";
import { T as Me, bR as wt, bS as gt, bT as yt, bh as Mt, a as xt, J as bt } from "./chunk-Cg3_Iw1A.js";
import { r as vt, q as Ct, a as Ae, s as qe, D as Ve, c as Bt, b as _t, d as Lt, e as Gt, g as St } from "./chunk-DEdNyiJv.js";
import { c as Pt } from "./chunk-a2yd8Eqb.js";
import { o as Dt } from "./chunk-BJqdJBK9.js";
import { Output as At, BufferTarget as Vt, WebMOutputFormat as Ot, CanvasSource as kt, QUALITY_HIGH as Ft, QUALITY_MEDIUM as Tt, QUALITY_LOW as zt, canEncodeVideo as Wt } from "./vendor-mediabunny-CZ5VNE-V.js";
function jt(o, { position: e, forward: d, up: g, color: L, scale: p = 1, active: b = !0 }) {
  const x = new o.Group(), N = b ? 0.95 : 0.5, O = new o.MeshBasicMaterial({
    color: L,
    transparent: !0,
    opacity: N,
    depthTest: !1
  }), R = new o.Mesh(new o.BoxGeometry(0.34, 0.24, 0.42), O);
  R.renderOrder = 912, x.add(R);
  const T = new o.Mesh(new o.ConeGeometry(0.17, 0.26, 20), O);
  return T.rotation.x = -Math.PI / 2, T.position.z = -0.32, T.renderOrder = 912, x.add(T), x.scale.setScalar(p), x.position.copy(e), x.up.copy(g), x.lookAt(e.clone().add(d)), x;
}
function It(o, { position: e, color: d = 15903035, radius: g = 0.28, bold: L = !1 }) {
  const p = new o.Group(), b = L ? 16773544 : d, x = new o.LineBasicMaterial({ color: b, transparent: !0, opacity: L ? 1 : 0.95, depthTest: !1 }), N = (T) => {
    const z = [];
    for (let J = 0; J <= 48; J++) {
      const E = J / 48 * Math.PI * 2;
      z.push(new o.Vector3(Math.cos(E) * T, Math.sin(E) * T, 0));
    }
    const ee = new o.Line(new o.BufferGeometry().setFromPoints(z), x);
    return ee.renderOrder = 915, ee;
  };
  if (p.add(N(g)), L) {
    p.add(N(g * 1.18));
    const T = new o.Mesh(
      new o.RingGeometry(0, g * 0.3, 16),
      new o.MeshBasicMaterial({ color: b, transparent: !0, opacity: 1, depthTest: !1 })
    );
    T.renderOrder = 916, p.add(T);
  }
  const O = g * 1.55, R = new o.LineSegments(
    new o.BufferGeometry().setFromPoints([
      new o.Vector3(-O, 0, 0),
      new o.Vector3(-g * 0.45, 0, 0),
      new o.Vector3(g * 0.45, 0, 0),
      new o.Vector3(O, 0, 0),
      new o.Vector3(0, -O, 0),
      new o.Vector3(0, -g * 0.45, 0),
      new o.Vector3(0, g * 0.45, 0),
      new o.Vector3(0, O, 0)
    ]),
    x
  );
  return R.renderOrder = 915, p.add(R), p.position.copy(e), p.userData.omnicamBillboard = !0, p;
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
function Ut(o, e, { color: d = null, opacity: g = null } = {}) {
  const L = d ?? Re, p = g ?? 0.65;
  if (ge(e)) {
    const x = new o.SkinnedMesh(e.geometry.clone(), new o.MeshBasicMaterial({
      color: L,
      wireframe: !0,
      transparent: !0,
      opacity: p,
      depthWrite: !1
    }));
    return x.bindMode = e.bindMode, x.bind(e.skeleton, e.bindMatrix), Xe(x, e), { overlay: ye(x), parent: e.parent || e };
  }
  const b = new o.LineSegments(
    new o.WireframeGeometry(e.geometry),
    new o.LineBasicMaterial({ color: L, opacity: p, transparent: !0, depthTest: !0 })
  );
  return { overlay: ye(b), parent: e };
}
function qt(o, e) {
  const d = new o.PointsMaterial({ color: Re, size: 0.05, sizeAttenuation: !0 });
  if (!ge(e)) {
    const T = new o.Points(e.geometry, d);
    return { overlay: ye(T), parent: e };
  }
  const g = e.geometry.getAttribute("position")?.count || 0, L = Math.max(1, Math.ceil(g / Nt)), p = Math.ceil(g / L), b = new Float32Array(p * 3), x = new o.BufferGeometry();
  x.setAttribute("position", new o.Float32BufferAttribute(b, 3));
  const N = new o.Points(x, d);
  Xe(N, e);
  const O = new o.Vector3(), R = x.getAttribute("position");
  return N.onBeforeRender = () => {
    for (let T = 0; T < p; T++)
      e.getVertexPosition(T * L, O), R.setXYZ(T, O.x, O.y, O.z);
    R.needsUpdate = !0;
  }, { overlay: ye(N), parent: e.parent || e };
}
function Rt(o, e, d) {
  const g = ge(e) ? new o.SkinnedMesh(e.geometry.clone(), d) : new o.Mesh(e.geometry.clone(), d);
  return ge(e) && (g.bindMode = e.bindMode, g.bind(e.skeleton, e.bindMatrix)), g.matrixAutoUpdate = !1, g.matrix.copy(e.matrixWorld), g.frustumCulled = !1, g;
}
function Xt(o, e, { wireframe: d = !1, vertices: g = !1, wireframeColor: L = null, wireframeOpacity: p = null } = {}) {
  if (!d && !g) return;
  const b = [];
  e.traverse((x) => {
    x.isMesh && x.geometry && !x.userData.omnicamHelper && b.push(x);
  });
  for (const x of b) {
    if (d) {
      const { overlay: N, parent: O } = Ut(o, x, { color: L, opacity: p });
      O.add(N);
    }
    if (g) {
      const { overlay: N, parent: O } = qt(o, x);
      O.add(N);
    }
  }
}
const $t = 16777215, ne = 0.17, Oe = 3593923, Kt = 0.06;
function Yt(o) {
  const e = new o.Group();
  e.userData.omnicamCaptureGuide = !0;
  const d = new o.GridHelper(120, 24, 4081496, 3291463);
  d.userData.omnicamCaptureGuide = !0, d.frustumCulled = !1, d.position.y = 5e-4, e.add(d);
  const g = new o.GridHelper(120, 120, 2238001, 1909035);
  g.userData.omnicamCaptureGuide = !0, g.frustumCulled = !1, e.add(g);
  const L = new o.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), p = new o.BufferGeometry().setFromPoints([new o.Vector3(-60, 1e-3, 0), new o.Vector3(60, 1e-3, 0)]), b = new o.Line(p, L);
  b.userData.omnicamCaptureGuide = !0, e.add(b);
  const x = new o.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), N = new o.BufferGeometry().setFromPoints([new o.Vector3(0, 1e-3, -60), new o.Vector3(0, 1e-3, 60)]), O = new o.Line(N, x);
  return O.userData.omnicamCaptureGuide = !0, e.add(O), e;
}
function Qt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: g, OBJLoader: L, PLYLoader: p, STLLoader: b, neutral: x, wire: N, checkerMaterial: O, objectMaterial: R, applyModelMaterial: T, disposeObject: z, textureFor: re, cardMesh: ee, generatePointField: J, sampleCamera: E, sampleObjectTransform: ae } = o;
  return {
    removeModel(G) {
      const y = this.models.get(G);
      y && z(y.scene, !0), this.models.delete(G), this.modelLoads.delete(G), this.sceneKey = "";
    },
    selectAnimation(G, y) {
      const r = this.models.get(G);
      !r?.mixer || !r.clips.length || (r.selectedClip = Math.max(0, Math.min(r.clips.length - 1, Number(y) || 0)), r.duration = r.clips[r.selectedClip].duration || 0, r.motionClipId = null, r.mixer.stopAllAction(), r.mixer.clipAction(r.clips[r.selectedClip]).play(), this.invalidate());
    },
    /** Select the clip a character motion names (by clip name, else index, else
     * the first clip). Idempotent -- re-selecting the same clip is a no-op so the
     * per-frame render loop can call it freely (design spec section 27). */
    applyMotionClip(G, y) {
      const r = this.models.get(G);
      if (!r?.mixer || !r.clips.length) return;
      const s = String(y?.clip_id ?? "");
      if (r.motionClipId === s) return;
      let l = r.clips.findIndex((a) => (a.name || "").toLowerCase() === s.toLowerCase());
      l < 0 && /^\d+$/.test(s) && (l = Number(s)), (l < 0 || l >= r.clips.length) && (l = 0), r.selectedClip = l, r.motionClipId = s, r.duration = r.clips[l].duration || 0, r.mixer.stopAllAction();
      const u = r.mixer.clipAction(r.clips[l]);
      u.reset(), u.play(), this.invalidate();
    },
    rebuild(G, y, r, s = !1, l = "auto") {
      const u = this.content.children.filter((t) => t.userData?.omnicamPersistent);
      for (const t of u) this.content.remove(t);
      this.content.traverse((t) => {
        for (const n of [...t.children])
          n.userData.omnicamHelper && (t.remove(n), z(n, !0));
      }), z(this.content), this.content.clear();
      for (const t of u) this.content.add(t);
      this.objectNodes.clear(), this.selectionKey = "";
      const a = G.render_mode, i = s && ["clay", "motion_proxy", "depth_rich"].includes(l), v = (t, n) => {
        const w = x.clone();
        return w.side = n ? e.FrontSide : e.DoubleSide, t.color && (w.color = new e.Color(t.color)), w;
      }, m = (t) => i || a === "graybox" ? v(t, !!G.backface_culling) : R(t, a, !!G.backface_culling), h = s && l === "depth_rich";
      if (["omni_ref", "point_field"].includes(a) || h) {
        const t = G.objects.filter((f) => f.enabled !== !1 && !["sun_light", "point_light", "spot_light", "null"].includes(f.type)).length, n = h && t <= 1 && (!G.point_density || G.point_density === "none") ? "sparse" : a === "omni_ref" && (!G.point_density || G.point_density === "none") ? "balanced" : G.point_density || "balanced", { points: w, colors: P } = J(n, G.point_spread || "all_views", G.point_color || null);
        if (w.length > 0) {
          const f = new e.BufferGeometry();
          f.setAttribute("position", new e.Float32BufferAttribute(w, 3)), f.setAttribute("color", new e.Float32BufferAttribute(P, 3));
          const c = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), C = new e.Points(f, c);
          C.frustumCulled = !1, this.content.add(C);
        }
      }
      if (!["grid", "point_field"].includes(a))
        for (const t of G.objects) {
          if (t.enabled === !1) continue;
          const n = t.size || [1, 1, 1];
          let w;
          if (t.type === "glb" || t.type === "model") {
            const f = r.get(t.id), c = this.models.get(t.id), C = t.format || (t.type === "glb" ? "glb" : "");
            f && (c?.url !== f || c?.format !== C) && this.loadModel(t.id, f, C);
            const B = !!G.backface_culling, D = s && l === "clay" || a === "graybox" ? "neutral" : a === "wireframe" ? "wireframe" : vt(t, G, s) ?? (t.material_mode || "textured");
            c?.url === f && (w = c.scene, T(w, D, t, B));
          } else if (t.type === "sphere")
            w = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), m(t));
          else if (t.type === "cylinder")
            w = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), m(t));
          else if (t.type === "torus") {
            const f = new e.TorusGeometry(0.5, 0.2, 16, 32);
            f.rotateX(Math.PI / 2), w = new e.Mesh(f, m(t));
          } else if (t.type === "pyramid") {
            const f = new e.ConeGeometry(0.7, 1, 4);
            f.rotateY(Math.PI / 4), w = new e.Mesh(f, m(t));
          } else if (t.type === "sun_light") {
            const f = new e.Group(), c = new e.DirectionalLight(t.color || 16774892, t.intensity ?? 2.2);
            c.castShadow = t.cast_shadow !== !1, c.castShadow && (c.shadow.mapSize.set(1024, 1024), c.shadow.bias = -8e-4, c.shadow.normalBias = 0.02, c.shadow.radius = 2.4, c.shadow.camera.near = 0.5, c.shadow.camera.far = 70, c.shadow.camera.left = c.shadow.camera.bottom = -14, c.shadow.camera.right = c.shadow.camera.top = 14);
            const C = (t.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), B = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(C[0], C[1], C[2], "YXZ"));
            c.target.position.copy(c.position).add(B.multiplyScalar(10)), f.add(c, c.target);
            const D = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: t.color || 16096779, wireframe: !0 })
            );
            D.userData.omnicamLightHelper = !0, D.visible = !s, f.add(D), w = f;
          } else if (t.type === "point_light") {
            const f = new e.Group(), c = new e.PointLight(t.color || 16777215, t.intensity ?? 2, 0, 2);
            f.add(c);
            const C = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: t.color || 16498468, wireframe: !0 })
            );
            C.userData.omnicamLightHelper = !0, C.visible = !s, f.add(C), w = f;
          } else if (t.type === "spot_light") {
            const f = new e.Group(), c = (t.cone_angle ?? 45) * Math.PI / 180, C = t.penumbra ?? 0.25, B = new e.SpotLight(t.color || 16777215, t.intensity ?? 3, 0, c, C, 2), D = (t.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), U = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(D[0], D[1], D[2], "YXZ"));
            B.target.position.copy(B.position).add(U.multiplyScalar(10)), f.add(B, B.target);
            const V = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: t.color || 3718648, wireframe: !0 })
            );
            V.userData.omnicamLightHelper = !0, V.visible = !s, f.add(V), w = f;
          } else if (t.type === "human")
            w = new e.Mesh(Pt(e), m(t));
          else if (t.type === "ground") w = new e.Mesh(new e.BoxGeometry(1, 1, 1), m(t));
          else if (t.type === "card")
            if (!["graybox", "wireframe"].includes(a) && (!t.material_mode || ["textured", "wireframe_texture"].includes(t.material_mode)))
              w = ee(t, y.get(t.id), G.card_fit || "contain");
            else {
              const c = a === "wireframe" ? new e.PlaneGeometry(n[0], n[1], 4, 4) : new e.PlaneGeometry(n[0], n[1]);
              w = new e.Mesh(c, m(t));
            }
          else if (t.type === "null") {
            const f = new e.AxesHelper(0.5);
            f.position.fromArray(t.position || [0, 0, 0]), f.userData.omnicamId = t.id, f.frustumCulled = !1, this.objectNodes.set(t.id, f), this.content.add(f);
            continue;
          } else
            w = new e.Mesh(new e.BoxGeometry(1, 1, 1), m(t));
          if (!w) continue;
          w.position.fromArray(t.position || [0, 0, 0]), w.rotation.set(...(t.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const P = ["sun_light", "point_light", "spot_light"].includes(t.type);
          if (t.type !== "card" && !P && w.scale.fromArray(n), w.userData.omnicamId = t.id, w.frustumCulled = !1, w.traverse((f) => {
            f.frustumCulled = !1, f.userData.omnicamId = t.id;
          }), !P) {
            const f = !!(G.show_wireframe || a === "wireframe" || G.render_mode === "wireframe_texture" || t.material_mode === "wireframe_texture" || t.material_mode === "wireframe_neutral");
            Xt(e, w, { wireframe: f, vertices: G.show_vertices });
          }
          this.objectNodes.set(t.id, w), this.content.add(w);
        }
    },
    rebuildPath(G, y = "camera", r = null, s = "", l = null) {
      const u = Array.isArray(l) ? new Set(l) : null;
      z(this.path), this.path.clear();
      const a = s === "camera" ? G.active_camera_id : null, i = [
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
      (G.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: G.keyframes || [] }]).forEach((h, t) => {
        const n = h.keyframes || [];
        if (n.length === 0 || h.id === a) return;
        const w = h.color ? { line: new e.Color(h.color), marker: new e.Color(h.color), frustum: new e.Color(h.color) } : i[t % i.length], P = h.id === G.active_camera_id, f = P && y === "camera";
        if (n.length >= 2) {
          const c = n[0].frame, C = n[n.length - 1].frame, B = Math.max(32, Math.min(256, C - c + 1)), D = { ...h, keyframes: n, objects: G.objects }, U = Array.from({ length: B }, (A, k) => {
            const W = c + (C - c) * k / Math.max(1, B - 1);
            return new e.Vector3().fromArray(E(D, W, G.objects).position);
          }), V = new e.CatmullRomCurve3(U, !1, "centripetal"), j = f ? 0.06 : P ? 0.045 : 0.025, $ = new e.MeshBasicMaterial({
            color: w.line,
            transparent: !0,
            opacity: P ? 1 : 0.55,
            depthTest: !1
          }), F = new e.Mesh(new e.TubeGeometry(V, Math.max(48, B), j, 8, !1), $);
          if (F.renderOrder = 900, F.userData.omnicamWidget = "path", P && !h.locked && (F.userData.omnicamPathSegments = {
            cameraId: h.id,
            firstFrame: c,
            lastFrame: C,
            frames: n.map((A) => A.frame),
            points: U.map((A) => [A.x, A.y, A.z])
          }), this.path.add(F), P) {
            const A = new e.Mesh(
              new e.TubeGeometry(V, Math.max(48, B), j * (f ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: w.line, transparent: !0, opacity: f ? 0.3 : 0.18, depthTest: !1 })
            );
            if (A.renderOrder = 899, A.userData.omnicamWidget = "path", this.path.add(A), U.length >= 8) {
              const k = Math.max(6, Math.floor(B / 8));
              for (let W = Math.floor(k / 2); W < B - 1; W += k) {
                const K = U[W], Y = U[W + 1].clone().sub(K).normalize(), te = new e.ConeGeometry(j * 1.5, j * 3, 8);
                te.rotateX(Math.PI / 2);
                const Z = new e.Quaternion().setFromUnitVectors(new e.Vector3(0, 0, 1), Y), I = new e.Mesh(te, new e.MeshBasicMaterial({ color: w.marker, transparent: !0, opacity: 0.85, depthTest: !1 }));
                I.quaternion.copy(Z), I.position.copy(K), I.renderOrder = 901, I.userData.omnicamWidget = "path", this.path.add(I);
              }
            }
          }
        }
        for (const c of n) {
          const C = n.indexOf(c), B = P, D = new e.Mesh(
            new e.SphereGeometry(B ? ne : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: B ? $t : w.marker, depthTest: !1 })
          );
          D.position.fromArray(c.camera.position), D.renderOrder = 910, D.userData.omnicamPathKey = { cameraId: h.id, frame: c.frame }, D.userData.omnicamWidget = "path", this.path.add(D);
          const U = new e.Mesh(
            new e.RingGeometry((B ? ne : 0.085) * 1.3, (B ? ne : 0.085) * 1.7, 24),
            new e.MeshBasicMaterial({ color: B ? 16777215 : w.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          U.position.fromArray(c.camera.position), U.renderOrder = 909, U.userData.omnicamBillboard = !0, U.userData.omnicamWidget = "path", this.path.add(U);
          const V = new e.Vector3().fromArray(c.camera.position), j = new e.Vector3().fromArray(c.camera.target || [0, 0, 0]), $ = P && r != null && c.frame === r, F = P && !$ && u?.has(c.frame);
          if ($) {
            const A = new e.Mesh(
              new e.RingGeometry(ne * 2.1, ne * 2.6, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            A.position.fromArray(c.camera.position), A.renderOrder = 911, A.userData.omnicamBillboard = !0, A.userData.omnicamWidget = "path", this.path.add(A);
          } else if (F) {
            const A = new e.Mesh(
              new e.RingGeometry(ne * 1.9, ne * 2.2, 24),
              new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.85, depthTest: !1 })
            );
            A.position.fromArray(c.camera.position), A.renderOrder = 911, A.userData.omnicamBillboard = !0, A.userData.omnicamWidget = "path", this.path.add(A);
          }
          if ($) {
            const A = j.clone().sub(V).normalize();
            let k = new e.Vector3().crossVectors(A, new e.Vector3(0, 1, 0));
            k.lengthSq() < 1e-8 ? k.set(1, 0, 0) : k.normalize();
            const W = new e.Vector3().crossVectors(k, A).normalize(), K = e.MathUtils.clamp(V.distanceTo(j) * 0.08, 0.25, 0.8), Y = c.camera.camera_type === "orthographic" ? K * 0.55 : K * Math.tan(e.MathUtils.degToRad(c.camera.fov || 35) * 0.5), te = Y * (G.width || 16) / Math.max(1, G.height || 9), Z = V.clone().addScaledVector(A, K), I = [
              Z.clone().addScaledVector(k, -te).addScaledVector(W, -Y),
              Z.clone().addScaledVector(k, te).addScaledVector(W, -Y),
              Z.clone().addScaledVector(k, te).addScaledVector(W, Y),
              Z.clone().addScaledVector(k, -te).addScaledVector(W, Y)
            ], H = [];
            for (const X of I) H.push(V, X);
            for (let X = 0; X < 4; X++) H.push(I[X], I[(X + 1) % 4]);
            const M = new e.BufferGeometry().setFromPoints(H), _ = new e.LineSegments(M, new e.LineBasicMaterial({
              color: w.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            _.userData.omnicamWidget = "gizmo", this.path.add(_);
            const S = new e.BufferGeometry();
            S.setIndex([0, 1, 2, 0, 2, 3]), S.setAttribute("position", new e.Float32BufferAttribute([
              I[0].x,
              I[0].y,
              I[0].z,
              I[1].x,
              I[1].y,
              I[1].z,
              I[2].x,
              I[2].y,
              I[2].z,
              I[3].x,
              I[3].y,
              I[3].z
            ], 3));
            const q = new e.Mesh(S, new e.MeshBasicMaterial({
              color: w.marker,
              transparent: !0,
              opacity: 0.12,
              depthTest: !1,
              side: e.DoubleSide
            }));
            q.userData.omnicamWidget = "gizmo", this.path.add(q);
            const Q = jt(e, {
              position: V,
              forward: A,
              up: W,
              color: w.marker,
              scale: e.MathUtils.clamp(K * 1.15, 0.35, 1.6),
              active: P
            });
            Q.userData.omnicamWidget = "gizmo", this.path.add(Q);
          }
          if ($) {
            const A = It(e, {
              position: j,
              radius: e.MathUtils.clamp(V.distanceTo(j) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            A.userData.omnicamWidget = "lookat", this.path.add(A);
            const k = new e.Line(
              new e.BufferGeometry().setFromPoints([V.clone(), j.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            k.renderOrder = 914, k.userData.omnicamWidget = "lookat", this.path.add(k);
          }
          if ($) {
            const A = Dt(c, n[C - 1] || null, n[C + 1] || null);
            for (const k of ["in", "out"]) {
              const W = new e.Vector3().fromArray(A[k]), K = new e.Line(
                new e.BufferGeometry().setFromPoints([V.clone(), W.clone()]),
                new e.LineBasicMaterial({ color: Oe, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              K.renderOrder = 912, K.userData.omnicamWidget = "gizmo", this.path.add(K);
              const Y = new e.Mesh(
                new e.SphereGeometry(Kt, 12, 8),
                new e.MeshBasicMaterial({ color: Oe, depthTest: !1 })
              );
              Y.position.copy(W), Y.renderOrder = 913, Y.userData.omnicamCurveHandle = { cameraId: h.id, frame: c.frame, side: k }, Y.userData.omnicamWidget = "gizmo", this.path.add(Y);
            }
          }
        }
      });
      const m = [16742005, 52937, 16632686, 7101671, 14774357];
      (G.objects || []).forEach((h, t) => {
        const n = h.keyframes || [];
        if (n.length < 2) return;
        const w = h.color ? new e.Color(h.color) : m[t % m.length], P = n.map((C) => new e.Vector3().fromArray(C.transform?.position || [0, 0, 0])), f = new e.CatmullRomCurve3(P, !1, "centripetal"), c = new e.Mesh(
          new e.TubeGeometry(f, Math.max(32, n.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: w, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        c.renderOrder = 900, c.userData.omnicamWidget = "path", this.path.add(c);
        for (const C of n) {
          const B = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: w, depthTest: !1 })
          );
          B.position.fromArray(C.transform?.position || [0, 0, 0]), B.renderOrder = 910, B.userData.omnicamWidget = "path", this.path.add(B);
        }
      });
    }
  };
}
function Zt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: g, OBJLoader: L, PLYLoader: p, STLLoader: b, neutral: x, wire: N, checkerMaterial: O, objectMaterial: R, applyModelMaterial: T, disposeObject: z, textureFor: re, cardMesh: ee, generatePointField: J, sampleCamera: E, sampleObjectTransform: ae, hasOutlineMesh: G } = o;
  return {
    updateLiveCameras(y, r, s, l, u = "camera", a = null) {
      if (z(this.liveCameras), this.liveCameras.clear(), s) return;
      const i = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (y.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: y.keyframes || [] }]).forEach((m, h) => {
        const t = m.color ? { line: new e.Color(m.color), marker: new e.Color(m.color), frustum: new e.Color(m.color), body: new e.Color(m.color).multiplyScalar(0.35) } : i[h % i.length], n = m.id === y.active_camera_id, w = n && u === "camera", P = l === "camera" && n, f = E(m, r, y.objects), c = new e.Vector3().fromArray(f.position || [0, 0, 0]), C = new e.Vector3().fromArray(f.target || [0, 0, 0]), B = C.clone().sub(c), D = B.length();
        D < 1e-4 ? B.set(0, 0, -1) : B.normalize();
        let U = new e.Vector3(0, 1, 0), V = new e.Vector3().crossVectors(B, U);
        V.lengthSq() < 1e-6 && (U = new e.Vector3(0, 0, 1), V = new e.Vector3().crossVectors(B, U)), V.normalize();
        let j = new e.Vector3().crossVectors(V, B).normalize();
        if (f.roll) {
          const F = e.MathUtils.degToRad(f.roll);
          V.applyAxisAngle(B, F), j.applyAxisAngle(B, F);
        }
        const $ = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!P) {
          const F = new e.Group(), A = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: t.body, roughness: 0.4, metalness: 0.8 })
          );
          A.position.set(0, 0, -0.11), F.add(A);
          const k = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          k.rotateX(Math.PI / 2);
          const W = new e.Mesh(
            k,
            new e.MeshStandardMaterial({ color: t.marker, roughness: 0.2, metalness: 0.9 })
          );
          W.position.set(0, 0, 0.05), F.add(W);
          const K = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: n ? 16729156 : t.marker })
          );
          K.position.set(0, 0.07, -0.08), F.add(K);
          const Y = new e.Matrix4().makeBasis(V, j, B.clone().negate());
          F.quaternion.setFromRotationMatrix(Y), F.position.copy(c), F.userData.omnicamWidget = "gizmo", this.liveCameras.add(F);
          const te = new e.SphereGeometry(0.35, 8, 6), Z = new e.Mesh(te, $);
          Z.position.copy(c), Z.userData = { omnicamType: "camera", omnicamId: m.id }, this.liveCameras.add(Z);
          const I = e.MathUtils.clamp(D * 0.25, 0.5, 2.5), H = f.camera_type === "orthographic" ? 5 / Math.max(0.01, f.zoom || 1) * 0.35 : I * Math.tan(e.MathUtils.degToRad(f.fov || 35) * 0.5), M = H * (y.width || 16) / Math.max(1, y.height || 9), _ = c.clone().addScaledVector(B, I), S = [
            _.clone().addScaledVector(V, -M).addScaledVector(j, -H),
            _.clone().addScaledVector(V, M).addScaledVector(j, -H),
            _.clone().addScaledVector(V, M).addScaledVector(j, H),
            _.clone().addScaledVector(V, -M).addScaledVector(j, H)
          ], q = [];
          for (const de of S) q.push(c, de);
          for (let de = 0; de < 4; de++) q.push(S[de], S[(de + 1) % 4]);
          const X = S[2].clone().add(S[3]).multiplyScalar(0.5).clone().addScaledVector(j, H * 0.25);
          q.push(S[2], X, X, S[3]);
          const ue = new e.BufferGeometry().setFromPoints(q), le = new e.LineSegments(ue, new e.LineBasicMaterial({
            color: w ? t.marker : t.frustum,
            linewidth: n ? 2 : 1,
            transparent: !0,
            opacity: n ? 1 : 0.6
          }));
          le.userData.omnicamWidget = "gizmo", this.liveCameras.add(le);
          const oe = new e.BufferGeometry();
          oe.setIndex([0, 1, 2, 0, 2, 3]), oe.setAttribute("position", new e.Float32BufferAttribute([
            S[0].x,
            S[0].y,
            S[0].z,
            S[1].x,
            S[1].y,
            S[1].z,
            S[2].x,
            S[2].y,
            S[2].z,
            S[3].x,
            S[3].y,
            S[3].z
          ], 3));
          const Se = new e.Mesh(oe, new e.MeshBasicMaterial({
            color: w ? t.marker : t.frustum,
            transparent: !0,
            opacity: 0.12,
            depthTest: !1,
            side: e.DoubleSide
          }));
          Se.userData.omnicamWidget = "gizmo", this.liveCameras.add(Se);
        }
        if (D > 0.01) {
          const F = n && u === "camera_target", A = new e.BufferGeometry().setFromPoints([c, C]), k = new e.Line(A, new e.LineDashedMaterial({
            color: w || F ? 9133302 : t.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: w || F ? 1 : n ? 0.75 : 0.4
          }));
          k.userData.omnicamWidget = "lookat", this.liveCameras.add(k);
          const W = F ? 0.12 : w ? 0.11 : 0.08, K = [
            C.clone().add(new e.Vector3(-W, 0, 0)),
            C.clone().add(new e.Vector3(W, 0, 0)),
            C.clone().add(new e.Vector3(0, -W, 0)),
            C.clone().add(new e.Vector3(0, W, 0)),
            C.clone().add(new e.Vector3(0, 0, -W)),
            C.clone().add(new e.Vector3(0, 0, W))
          ], Y = new e.BufferGeometry().setFromPoints(K), te = new e.LineSegments(Y, new e.LineBasicMaterial({
            color: F || w ? 9133302 : t.marker,
            linewidth: F ? 3 : 1,
            transparent: !0,
            opacity: F || w ? 1 : n ? 0.9 : 0.5
          }));
          te.userData.omnicamWidget = "lookat", this.liveCameras.add(te);
          const Z = new e.SphereGeometry(0.28, 8, 6), I = new e.Mesh(Z, $);
          if (I.position.copy(C), I.userData = { omnicamType: "camera_target", omnicamId: m.id }, this.liveCameras.add(I), (F || w) && l !== "camera") {
            const H = new e.RingGeometry(0.14, 0.18, 24);
            H.rotateX(Math.PI / 2);
            const M = new e.MeshBasicMaterial({ color: Me.typeLookAt, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), _ = new e.Mesh(H, M);
            _.position.copy(C), _.userData.omnicamWidget = "lookat", this.liveCameras.add(_);
          }
        }
        if (n && l !== "camera" && u === "camera") {
          const F = new e.RingGeometry(0.19, 0.24, 32);
          F.rotateX(Math.PI / 2);
          const A = new e.MeshBasicMaterial({ color: Me.accent, side: e.DoubleSide, transparent: !0, opacity: 1 }), k = new e.Mesh(F, A);
          k.position.copy(c), k.userData.omnicamWidget = "gizmo", this.liveCameras.add(k);
          const W = new e.RingGeometry(0.28, 0.31, 32);
          W.rotateX(Math.PI / 2);
          const K = new e.Mesh(W, new e.MeshBasicMaterial({ color: Me.accent, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          K.position.copy(c), K.userData.omnicamWidget = "gizmo", this.liveCameras.add(K);
        }
      });
    },
    updateSelection(y, r, s, l = null, u = "", a = !1) {
      const i = l ? `${l.mode || ""}:${l.objectId || ""}:${(l.point || []).join(",")}` : "", v = `${r}:${s || ""}:${(y.__selectedObjectIds || []).join(",")}:${u}:${i}:${a ? "ortho" : "persp"}`;
      if (v !== this.selectionKey) {
        if (this.selectionKey = v, z(this.selectionGroup), this.selectionGroup.clear(), r === "object" && s) {
          const m = this.objectNodes.get(s);
          if (m) {
            m.updateMatrixWorld(!0);
            try {
              const h = new e.Box3(), t = [];
              if (m.traverse((n) => {
                n.isBone && t.push(n);
              }), t.length > 0) {
                const n = new e.Vector3();
                for (const w of t)
                  w.getWorldPosition(n), h.expandByPoint(n);
                h.expandByScalar(0.2);
              } else
                h.setFromObject(m);
              if ((a || !G(m)) && !h.isEmpty() && Number.isFinite(h.min.x) && Number.isFinite(h.max.x) && Number.isFinite(h.min.y) && Number.isFinite(h.max.y) && Number.isFinite(h.min.z) && Number.isFinite(h.max.z)) {
                h.expandByScalar(0.04);
                const n = new e.Box3Helper(h, new e.Color(9133302));
                n.material.transparent = !0, n.material.opacity = 0.95, n.material.depthTest = !1, n.renderOrder = 9999, this.selectionGroup.add(n);
              }
            } catch {
            }
            if (y.show_wireframe) {
              let h = 0;
              m.traverse((t) => {
                if (!t.isMesh || !t.geometry || t.userData.omnicamHelper || h >= 64) return;
                const n = Rt(e, t, new e.MeshBasicMaterial({
                  color: 9133302,
                  transparent: !0,
                  opacity: 0.2,
                  depthTest: !0,
                  depthWrite: !1,
                  side: e.DoubleSide,
                  polygonOffset: !0,
                  polygonOffsetFactor: -1
                }));
                n.renderOrder = 9998, this.selectionGroup.add(n), h += 1;
              });
            }
            if (l && l.objectId === s && l.point) {
              if (l.mode === "vertex") {
                const h = new e.SphereGeometry(0.08, 16, 12), t = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), n = new e.Mesh(h, t);
                n.position.fromArray(l.point), n.renderOrder = 1e4, this.selectionGroup.add(n);
                const w = new e.RingGeometry(0.1, 0.15, 24), P = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), f = new e.Mesh(w, P);
                f.position.fromArray(l.point), this.activeCamera && f.quaternion.copy(this.activeCamera.quaternion), f.renderOrder = 1e4, this.selectionGroup.add(f);
              } else if (l.mode === "edge" && l.edge) {
                const [h, t] = l.edge, n = new e.BufferGeometry().setFromPoints([new e.Vector3(...h), new e.Vector3(...t)]), w = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), P = new e.Line(n, w);
                P.renderOrder = 1e4, this.selectionGroup.add(P);
              } else if (l.mode === "face" && l.vertices) {
                const [h, t, n] = l.vertices, w = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...h),
                  new e.Vector3(...t),
                  new e.Vector3(...n)
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
                  new e.Vector3(...t),
                  new e.Vector3(...n),
                  new e.Vector3(...h)
                ]), C = new e.Line(c, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                C.renderOrder = 10001, this.selectionGroup.add(C);
              }
            }
          }
        }
        if (r === "object")
          for (const m of y.__selectedObjectIds || []) {
            if (m === s) continue;
            const h = this.objectNodes.get(m);
            if (h) {
              h.updateMatrixWorld(!0);
              try {
                const t = new e.Box3().setFromObject(h);
                if ((a || !G(h)) && !t.isEmpty() && Number.isFinite(t.min.x)) {
                  t.expandByScalar(0.04);
                  const n = new e.Box3Helper(t, new e.Color(10980346));
                  n.material.transparent = !0, n.material.opacity = 0.6, n.material.depthTest = !1, n.renderOrder = 9997, this.selectionGroup.add(n);
                }
              } catch {
              }
            }
          }
      }
    },
    /** Bone names of a loaded model, for the aim-constraint picker. */
    listObjectBones(y) {
      const r = this.objectNodes.get(y);
      if (!r) return [];
      const s = [], l = /* @__PURE__ */ new Set();
      return r.traverse((u) => {
        const a = u.isBone ? u.name : "";
        !a || l.has(a) || s.length >= 256 || (l.add(a), s.push(a));
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
    sampleModelPoint(y, r, s, l = 24) {
      const u = this.objectNodes.get(y);
      if (!u) return null;
      const a = this.models.get(y), i = a?.mixer && a.duration > 0, v = i ? a.mixer.time : null;
      i && (a.mixer.setTime(Math.max(0, s) / Math.max(1, l) % a.duration), u.updateMatrixWorld(!0));
      let m = null;
      if (r) {
        let h = null;
        if (u.traverse((t) => {
          !h && t.isBone && t.name === r && (h = t);
        }), h) {
          const t = new e.Vector3().setFromMatrixPosition(h.matrixWorld);
          m = [t.x, t.y, t.z];
        }
      } else
        m = this.getObjectWorldCenter(y);
      return i && Number.isFinite(v) && (a.mixer.setTime(v), u.updateMatrixWorld(!0)), m;
    },
    getObjectWorldBounds(y) {
      const r = this.objectNodes.get(y);
      if (!r) return null;
      r.updateWorldMatrix(!0, !0);
      const s = new e.Box3().setFromObject(r, !0), l = s.min.toArray(), u = s.max.toArray();
      return !s.isEmpty() && [...l, ...u].every(Number.isFinite) ? { min: l, max: u } : null;
    },
    getObjectWorldCenter(y) {
      const r = this.objectNodes.get(y);
      if (!r) return null;
      r.updateMatrixWorld(!0);
      const s = [];
      if (r.traverse((a) => {
        a.isBone && s.push(a);
      }), s.length > 0) {
        const a = new e.Vector3(), i = new e.Vector3();
        for (const v of s)
          v.getWorldPosition(i), a.add(i);
        return a.divideScalar(s.length), [a.x, a.y, a.z];
      }
      const l = new e.Box3().setFromObject(r);
      if (!l.isEmpty() && Number.isFinite(l.min.x)) {
        const a = l.getCenter(new e.Vector3());
        return [a.x, a.y, a.z];
      }
      const u = new e.Vector3();
      return r.getWorldPosition(u), [u.x, u.y, u.z];
    },
    /** Every bone name in a loaded model, for the Rig Mapper (design spec 23). */
    getModelBoneNames(y) {
      const r = this.objectNodes.get(y);
      if (!r) return [];
      const s = [];
      return r.traverse((l) => {
        l.isBone && l.name && s.push(l.name);
      }), s;
    },
    /** Resolve one loaded bone by name, plus its world position. */
    resolveModelBone(y, r) {
      const s = this.objectNodes.get(y);
      if (!s || !r) return null;
      let l = null;
      if (s.traverse((a) => {
        !l && a.isBone && a.name === r && (l = a);
      }), !l) return null;
      l.updateWorldMatrix(!0, !1);
      const u = new e.Vector3();
      return l.getWorldPosition(u), { name: r, world: [u.x, u.y, u.z] };
    },
    /**
     * Apply an FK pose to a loaded character (design spec section 29,
     * ui.characterRuntime.applyPose). `boneMap` is canonical joint -> bone name;
     * `joints` is canonical joint -> local quaternion [x,y,z,w]. Bones not named
     * by `joints` are left at their bind rotation, captured once per bone.
     */
    applyCharacterPose(y, r, s) {
      const l = this.objectNodes.get(y);
      if (!l) return !1;
      const u = /* @__PURE__ */ new Map();
      if (l.traverse((i) => {
        i.isBone && i.name && u.set(i.name, i);
      }), !u.size) return !1;
      for (const i of u.values())
        i.userData.omnicamBindQuat || (i.userData.omnicamBindQuat = i.quaternion.clone());
      const a = s && typeof s == "object" ? s : {};
      for (const [i, v] of Object.entries(r || {})) {
        const m = u.get(v);
        if (!m) continue;
        const h = a[i];
        Array.isArray(h) && h.length === 4 && h.every(Number.isFinite) ? m.quaternion.fromArray(h).normalize() : m.userData.omnicamBindQuat && m.quaternion.copy(m.userData.omnicamBindQuat), m.updateMatrixWorld(!0);
      }
      return this.invalidate(), !0;
    },
    /**
     * Read the current local rotation of every mapped canonical joint -- what
     * "Bake current frame to pose" samples off the live mixer (design spec
     * section 27). A joint still at its captured bind rotation is omitted.
     */
    sampleCharacterBonePose(y, r) {
      const s = this.objectNodes.get(y);
      if (!s || !r) return {};
      const l = /* @__PURE__ */ new Map();
      s.traverse((a) => {
        a.isBone && a.name && l.set(a.name, a);
      });
      const u = {};
      for (const [a, i] of Object.entries(r)) {
        const v = l.get(i);
        if (!v) continue;
        const m = v.userData.omnicamBindQuat;
        m && v.quaternion.angleTo(m) < 1e-4 || (u[a] = v.quaternion.toArray());
      }
      return u;
    }
  };
}
function Jt(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: g, OBJLoader: L, PLYLoader: p, STLLoader: b, neutral: x, wire: N, checkerMaterial: O, objectMaterial: R, applyModelMaterial: T, disposeObject: z, textureFor: re, cardMesh: ee, generatePointField: J, sampleCamera: E, sampleObjectTransform: ae } = o;
  function G(y) {
    const r = y.supersampleFactor?.() || 1;
    return { w: y.canvas.width / r, h: y.canvas.height / r };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(y) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: r, h: s } = G(this);
      this.pointer.set(y[0] / r * 2 - 1, -(y[1] / s) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const v = gt(i);
        if (v) return { ...v, position: i.object.position.toArray() };
      }
      const l = 16 * Math.min(2, window.devicePixelRatio || 1);
      let u = null;
      const a = new e.Vector3();
      for (const i of this.path.children) {
        const v = i.userData?.omnicamPathKey;
        if (!v || (a.copy(i.position).project(this.activeCamera), a.z < -1 || a.z > 1)) continue;
        const m = (a.x * 0.5 + 0.5) * r, h = (1 - (a.y * 0.5 + 0.5)) * s, t = Math.hypot(y[0] - m, y[1] - h);
        t <= l && (!u || t < u.distance) && (u = { key: v, position: i.position.toArray(), distance: t });
      }
      return u ? { ...u.key, position: u.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(y) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: r, h: s } = G(this);
      this.pointer.set(y[0] / r * 2 - 1, -(y[1] / s) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const v = wt(i);
        if (v) return { ...v, position: i.object.position.toArray() };
      }
      const l = 14 * Math.min(2, window.devicePixelRatio || 1);
      let u = null;
      const a = new e.Vector3();
      for (const i of this.path.children) {
        const v = i.userData?.omnicamCurveHandle;
        if (!v || (a.copy(i.position).project(this.activeCamera), a.z < -1 || a.z > 1)) continue;
        const m = (a.x * 0.5 + 0.5) * r, h = (1 - (a.y * 0.5 + 0.5)) * s, t = Math.hypot(y[0] - m, y[1] - h);
        t <= l && (!u || t < u.distance) && (u = { handle: v, position: i.position.toArray(), distance: t });
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
      const { w: r, h: s } = G(this);
      this.pointer.set(y[0] / r * 2 - 1, -(y[1] / s) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const l = this.raycaster.intersectObjects(this.path.children, !0).find((c) => c.object.userData?.omnicamPathSegments);
      if (!l) return null;
      const { cameraId: u, firstFrame: a, lastFrame: i, frames: v, points: m } = l.object.userData.omnicamPathSegments;
      if (!m?.length || v.length < 2) return null;
      let h = 0, t = 1 / 0;
      for (let c = 0; c < m.length; c += 1) {
        const [C, B, D] = m[c], U = C - l.point.x, V = B - l.point.y, j = D - l.point.z, $ = U * U + V * V + j * j;
        $ < t && (t = $, h = c);
      }
      const n = a + (i - a) * h / Math.max(1, m.length - 1);
      let w = v[0], P = v[v.length - 1];
      for (let c = 0; c < v.length - 1; c += 1)
        if (v[c] <= n && n <= v[c + 1]) {
          w = v[c], P = v[c + 1];
          break;
        }
      if (w === P) return null;
      const f = Math.min(1, Math.max(0, (n - w) / (P - w)));
      return { cameraId: u, leftFrame: w, rightFrame: P, t: f };
    },
    configureCamera(y, r) {
      const s = y || defaultCamera(), l = Math.max(5e-4, Number(s.near) || 0.01), u = Math.max(l + 1, Number(s.far) || 1e4);
      let a;
      if (s.camera_type === "orthographic") {
        a = this.orthographic;
        const n = 5 / Math.max(0.01, s.zoom || 1);
        a.left = -n * r, a.right = n * r, a.top = n, a.bottom = -n, a.near = l, a.far = u, a.updateProjectionMatrix();
      } else
        a = this.perspective, a.fov = e.MathUtils.clamp(Number(s.fov) || 35, 1, 175), a.aspect = r, a.near = l, a.far = u, a.updateProjectionMatrix();
      const i = new e.Vector3().fromArray(s.position || [6, 4, 6]), v = new e.Vector3().fromArray(s.target || [0, 1.5, 0]), m = v.clone().sub(i);
      m.lengthSq() < 1e-6 ? m.set(0, 0, -1) : m.normalize();
      let h = s.up ? new e.Vector3().fromArray(s.up) : new e.Vector3(0, 1, 0), t = new e.Vector3().crossVectors(m, h);
      if (t.lengthSq() < 1e-6 && (h = Math.abs(m.y) > 0.9 ? new e.Vector3(0, 0, m.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), t.crossVectors(m, h)), t.normalize(), h.crossVectors(t, m).normalize(), s.roll) {
        const n = e.MathUtils.degToRad(s.roll);
        t.applyAxisAngle(m, n), h.applyAxisAngle(m, n);
      }
      return a.position.copy(i), a.up.copy(h), a.lookAt(v), a.updateMatrixWorld(), a;
    },
    pick(y, r, s, l) {
      if (!this.activeCamera) return null;
      this.pointer.set(y / Math.max(1, s) * 2 - 1, 1 - r / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
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
          let i = a.object;
          for (; i && !i.userData?.omnicamId; ) i = i.parent;
          i?.userData?.omnicamId && u.push({
            distance: a.distance,
            type: "object",
            id: i.userData.omnicamId
          });
        }
      return u.length ? (u.sort((a, i) => a.distance - i.distance), { type: u[0].type, id: u[0].id }) : null;
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
    projectWorldToScreen(y, r = null, s = null) {
      if (!this.activeCamera || !Array.isArray(y) || y.length < 3) return null;
      const { w: l, h: u } = G(this), a = r != null && s != null ? r : l, i = r != null && s != null ? s : u, v = new e.Vector3(Number(y[0]) || 0, Number(y[1]) || 0, Number(y[2]) || 0);
      return v.project(this.activeCamera), {
        x: (v.x * 0.5 + 0.5) * a,
        y: (1 - (v.y * 0.5 + 0.5)) * i,
        behind: v.z < -1 || v.z > 1,
        width: a,
        height: i
      };
    },
    pickSubElement(y, r, s, l, u = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(y / Math.max(1, s) * 2 - 1, 1 - r / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const a = this.raycaster.intersectObjects(this.content.children, !0);
      for (const i of a) {
        let v = i.object, m = i.object;
        for (; v && !v.userData.omnicamId; ) v = v.parent;
        if (!v?.userData.omnicamId || !m.geometry) continue;
        const h = v.userData.omnicamId, n = m.geometry.getAttribute("position");
        if (!n) continue;
        m.updateMatrixWorld(!0);
        const w = m.matrixWorld;
        if (u === "vertex") {
          let P = -1, f = 1 / 0, c = null;
          if (i.face) {
            const C = [i.face.a, i.face.b, i.face.c];
            for (const B of C) {
              const D = new e.Vector3(n.getX(B), n.getY(B), n.getZ(B)).applyMatrix4(w), U = D.distanceTo(i.point);
              U < f && (f = U, P = B, c = [D.x, D.y, D.z]);
            }
          } else
            for (let C = 0; C < n.count; C++) {
              const B = new e.Vector3(n.getX(C), n.getY(C), n.getZ(C)).applyMatrix4(w), D = B.distanceTo(i.point);
              D < f && (f = D, P = C, c = [B.x, B.y, B.z]);
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
          const P = new e.Vector3(n.getX(i.face.a), n.getY(i.face.a), n.getZ(i.face.a)).applyMatrix4(w), f = new e.Vector3(n.getX(i.face.b), n.getY(i.face.b), n.getZ(i.face.b)).applyMatrix4(w), c = new e.Vector3(n.getX(i.face.c), n.getY(i.face.c), n.getZ(i.face.c)).applyMatrix4(w), C = (j, $, F) => {
            const A = new e.Line3($, F), k = new e.Vector3();
            return A.closestPointToPoint(j, !0, k), { dist: j.distanceTo(k), point: k, segment: [$, F] };
          }, B = C(i.point, P, f), D = C(i.point, f, c), U = C(i.point, c, P), V = [B, D, U].reduce((j, $) => $.dist < j.dist ? $ : j);
          return {
            type: "edge",
            mode: "edge",
            objectId: h,
            point: [V.point.x, V.point.y, V.point.z],
            edge: [
              [V.segment[0].x, V.segment[0].y, V.segment[0].z],
              [V.segment[1].x, V.segment[1].y, V.segment[1].z]
            ]
          };
        }
        if (u === "face" && i.face) {
          const P = new e.Vector3(n.getX(i.face.a), n.getY(i.face.a), n.getZ(i.face.a)).applyMatrix4(w), f = new e.Vector3(n.getX(i.face.b), n.getY(i.face.b), n.getZ(i.face.b)).applyMatrix4(w), c = new e.Vector3(n.getX(i.face.c), n.getY(i.face.c), n.getZ(i.face.c)).applyMatrix4(w), C = new e.Vector3().add(P).add(f).add(c).divideScalar(3), B = i.face.normal.clone().transformDirection(w);
          return {
            type: "face",
            mode: "face",
            objectId: h,
            faceIndex: i.faceIndex,
            point: [C.x, C.y, C.z],
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
    intersectScenePoint(y, r, s, l) {
      if (!this.activeCamera) return null;
      this.pointer.set(y / Math.max(1, s) * 2 - 1, 1 - r / Math.max(1, l) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const u = this.raycaster.intersectObjects(this.content.children, !0);
      if (u.length > 0)
        return [u[0].point.x, u[0].point.y, u[0].point.z];
      const a = new e.Plane(new e.Vector3(0, 1, 0), 0), i = new e.Vector3();
      return this.raycaster.ray.intersectPlane(a, i) ? [i.x, i.y, i.z] : null;
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
  if (!Number.isFinite(e) || e < 0 || (o.samples.push(e), o.samples.length > ke && o.samples.shift(), o.samples.length < ke) || o.samples.filter((L) => L > Ht).length / o.samples.length < Et) return null;
  const g = er(o.quality);
  return g ? (o.quality = g, o.downgraded = !0, o.samples = [], g) : null;
}
function rr(o, e) {
  return o.quality = e, o.samples = [], o.downgraded = !1, o;
}
function or(o) {
  const { THREE: e, FBXLoader: d, GLTFLoader: g, OBJLoader: L, PLYLoader: p, STLLoader: b, neutral: x, wire: N, checkerMaterial: O, objectMaterial: R, applyModelMaterial: T, disposeObject: z, textureFor: re, cardMesh: ee, generatePointField: J, sampleCamera: E, sampleObjectTransform: ae, hasOutlineMesh: G, SelectionOutlineRenderer: y } = o;
  return {
    render(r, s, l, u, a, i = /* @__PURE__ */ new Map(), v = 0, m = !1, h = "camera", t = "subject", n = null, w = null, P = null, f = "auto") {
      const c = m && f === "clay" ? !0 : m && (f === "motion_proxy" || f === "depth_rich") ? !1 : !m || (r.render_mode || "") === "beauty";
      if (c !== this.studioEnabled) {
        this.studioEnabled = c, qe(e, this.scene, this.renderer, this.studio, c);
        for (const M of this.flatLights || []) M.visible = !c;
      }
      const C = !!r.objects?.some((M) => M.type === "sun_light" && M.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !C && c), this.flatLights?.[1] && (this.flatLights[1].visible = !C && !c), this.disposed) return;
      (this.canvas.width !== u || this.canvas.height !== a) && this.renderer.setSize(u, a, !1);
      const B = (s && s.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const D = r.viewport_bg_sequence && r.viewport_bg_sequence.length ? r.viewport_bg_sequence[v % r.viewport_bg_sequence.length] : r.viewport_bg_image || "";
      if (D) {
        this.bgImageUrl = D;
        const M = this.bgTextureCache.get(D);
        if (M)
          this.bgTextureCache.delete(D), this.bgTextureCache.set(D, M), this.bgTexture = M, this.scene.background = M;
        else if (!this.bgTextureLoads.has(D)) {
          const _ = this.bgLoadGeneration;
          this.bgTextureLoads.set(D, _), new e.TextureLoader().load(D, (q) => {
            if (this.bgTextureLoads.delete(D), this.disposed || _ !== this.bgLoadGeneration) {
              q.dispose();
              return;
            }
            for (q.colorSpace = e.SRGBColorSpace, this.bgTextureCache.set(D, q); this.bgTextureCache.size > 8; ) {
              const Q = [...this.bgTextureCache.keys()].find((ue) => ue !== this.bgImageUrl);
              if (!Q) break;
              const X = this.bgTextureCache.get(Q);
              this.bgTextureCache.delete(Q), X?.dispose?.();
            }
            this.bgImageUrl === D && (this.bgTexture = q, this.scene.background = q), this.invalidate();
          }, void 0, () => {
            this.bgTextureLoads.delete(D);
          });
        }
      } else {
        this.bgImageUrl = "", this.bgLoadGeneration += 1, this.bgTextureLoads.clear();
        for (const _ of new Set(this.bgTextureCache.values())) _.dispose();
        this.bgTextureCache.clear(), this.bgTexture = null;
        const M = r.viewport_bg_color && r.viewport_bg_color !== Ve;
        this.scene.background = this.studioEnabled && !M && !B ? this.studio.sky : new e.Color(M ? r.viewport_bg_color : this.studioEnabled && B ? 1447709 : Ve);
      }
      const U = JSON.stringify([
        r.render_mode,
        r.card_fit,
        r.point_density,
        r.point_spread,
        !!r.show_wireframe,
        !!r.show_vertices,
        !!r.backface_culling,
        r.reconstruction_appearance || "neutral",
        !!m,
        f,
        r.objects.map((M) => {
          const { position: _, rotation: S, keyframes: q, size: Q, ...X } = M;
          return M.type === "card" && (X.size = Q), X;
        })
      ]), V = [...l.entries()].map(([M, _]) => `${M}:${_?.src || ""}`).join("|"), j = [...i.entries()].map(([M, _]) => `${M}:${_}`).join("|");
      (U !== this.sceneKey || V !== this.mediaSignature || j !== this.modelSignature) && (this.sceneKey = U, this.mediaSignature = V, this.modelSignature = j, this.rebuild(r, l, i, m, f));
      const $ = Math.max(1, r.fps || 24), F = /* @__PURE__ */ new Map();
      for (const M of r.objects)
        M.character?.motion && this.models.has(M.id) && F.set(M.id, M.character.motion);
      for (const [M, _] of this.models) {
        if (!_.mixer || !(_.duration > 0)) continue;
        const S = F.get(M);
        S ? (this.applyMotionClip?.(M, S), _.mixer.setTime(yt(S, v, $, _.duration))) : _.mixer.setTime(v / $ % _.duration);
      }
      for (const M of r.objects) {
        const _ = this.objectNodes.get(M.id);
        if (!_) continue;
        const S = M.keyframes?.length ? ae(M, v) : M;
        _.position.fromArray(S.position || [0, 0, 0]), _.rotation.set(...(S.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), M.type !== "card" && M.type !== "null" && _.scale.fromArray(S.size || [1, 1, 1]), M.type === "null" && (_.visible = m ? !0 : r.show_helper_axes !== !1);
      }
      this.path.visible = !m;
      const A = r.show_grid !== !1 && r.render_mode !== "point_field", k = f === "depth_rich" || !!r.playblast_grid;
      this.gridGroup.visible = m ? k : A;
      const W = r.view_mode || "camera", K = Array.isArray(P) ? [...P].sort((M, _) => M - _).join(",") : "", Y = `${W}:${h}:${w ?? ""}:${K}:${r.__omnicamRevision ?? JSON.stringify([
        r.active_camera_id,
        (r.cameras || []).map((M) => [M.id, M.keyframes?.length, M.keyframes?.map((_) => [_.frame, _.camera?.position, _.camera?.target, _.interpolation, _.tangents])]),
        (r.objects || []).map((M) => [M.id, M.keyframes?.length, M.keyframes?.map((_) => [_.frame, _.transform?.position])])
      ])}`;
      if (Y !== this.pathKey && (this.pathKey = Y, this.rebuildPath(r, h, w, W, P)), this.updateLiveCameras(r, v, m, W, h, w), this.liveCameras.visible = !m, !m) {
        const M = r.show_camera_paths !== !1, _ = r.show_camera_gizmos !== !1, S = r.show_look_at !== !1;
        for (const q of [this.path, this.liveCameras])
          q.traverse((Q) => {
            const X = Q.userData.omnicamWidget;
            X === "path" ? Q.visible = M : X === "gizmo" ? Q.visible = _ : X === "lookat" && (Q.visible = S);
          });
      }
      const te = u / Math.max(1, a), Z = this.configureCamera(s, te);
      if (this.activeCamera = Z, m ? this.selectionGroup.visible = !1 : (this.updateSelection(r, h, t, n, `${r.__omnicamRevision ?? "legacy"}:${v}`, B), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const M = new e.Box3();
        this.content.traverse((S) => {
          if (!S.isMesh || S.userData.omnicamCaptureGuide) return;
          S.castShadow = !0, S.receiveShadow = !0, S.updateWorldMatrix(!0, !1);
          const q = new e.Box3().setFromObject(S);
          !q.isEmpty() && Number.isFinite(q.min.x) && M.union(q);
        });
        const _ = this.studio?.key;
        if (_) {
          const S = M.isEmpty() ? new e.Vector3() : M.getCenter(new e.Vector3()), q = M.isEmpty() ? new e.Vector3(12, 12, 12) : M.getSize(new e.Vector3()), Q = Math.max(1, 0.5 * Math.max(q.x, q.y, q.z) * Math.SQRT2), X = Q * 1.15 + 0.5, ue = new e.Vector3(4.5, 7.5, 3.5).normalize(), le = Math.max(12, Q * 4);
          _.position.copy(S).addScaledVector(ue, le), _.target.position.copy(S), _.target.updateMatrixWorld(!0);
          const oe = _.shadow.camera;
          oe.left = -X, oe.right = X, oe.top = X, oe.bottom = -X, oe.near = Math.max(0.1, le - Q - 1), oe.far = le + Q + 1, oe.updateProjectionMatrix(), _.shadow.map?.dispose(), _.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((M) => {
        M.userData.omnicamBillboard && M.quaternion.copy(Z.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, u, a);
      const I = performance.now();
      let H = !1;
      if (!m && !B && h === "object" && (t || r.__selectedObjectIds?.length) && !n) {
        const M = r.__selectedObjectIds?.length ? r.__selectedObjectIds : t ? [t] : [], _ = [];
        for (const S of M) {
          const q = this.objectNodes.get(S);
          q && G(q) && _.push(q);
        }
        _.length && (this.outlineRenderer || (this.outlineRenderer = new y(this.renderer, this.scene, void 0, Z)), this.outlineRenderer.render(Z, u, a, _), H = !0);
      }
      if (H || this.renderer.render(this.scene, Z), !m && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Fe(this.studio?.quality);
        const M = tr(this.qualityMonitor, performance.now() - I);
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
const sr = {
  EffectComposer: Je,
  OutlinePass: Ze,
  OutputPass: Qe,
  RenderPass: Ye,
  Vector2: ze
};
function ar(o) {
  let e = !1;
  return o?.traverse?.((d) => {
    e || d.visible === !1 || !d.isMesh || d.userData?.omnicamHelper || d.userData?.omnicamCaptureGuide || (e = !!(d.geometry && d.material));
  }), e;
}
class nr {
  constructor(e, d, g = sr, L = null) {
    const { EffectComposer: p, RenderPass: b, OutlinePass: x, OutputPass: N, Vector2: O } = g;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new p(e), this.renderPass = new b(d, L), this.outlinePass = new x(new O(1, 1), d, L, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new N(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, d, g, L) {
    this.disposed || ((d !== this.width || g !== this.height) && (this.width = d, this.height = g, this.composer.setSize(d, g)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...L], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const Te = { low: zt, balanced: Tt, high: Ft }, he = new Be({ color: 10265519, roughness: 0.48, metalness: 0.06, side: se }), $e = new Be({ color: 2237998, roughness: 0.95, metalness: 0, side: se }), Le = new be({ color: 11449792, wireframe: !0, side: se });
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
  return d.wrapS = d.wrapT = ht, d.repeat.set(8, 8), d.colorSpace = Ce, d.needsUpdate = !0, new Be({ map: d, roughness: 0.85, metalness: 0, side: o ? _e : se });
}
function ir(o, e, d = !1) {
  const g = e === "wireframe" ? "wireframe" : o.material_mode || "textured", L = d ? _e : se;
  if (g === "wireframe") {
    const b = Le.clone();
    return b.side = L, o.color && (b.color = new ce(o.color)), b;
  }
  if (g === "checker") return Ge(d);
  if (g === "matte") {
    const b = $e.clone();
    return b.side = L, o.color && (b.color = new ce(o.color)), b;
  }
  const p = he.clone();
  return p.side = L, o.color && (p.color = new ce(o.color)), p;
}
function cr(o, e, d = null, g = !1) {
  const L = g ? _e : se;
  o.traverse((p) => {
    if (p.isMesh) {
      if (p.userData.omnicamOriginalMaterial || (p.userData.omnicamOriginalMaterial = p.material), p.userData.omnicamOverrideMaterial) {
        const b = Array.isArray(p.material) ? p.material : [p.material];
        for (const x of b)
          x?.map?.dispose?.(), x?.dispose?.();
        p.userData.omnicamOverrideMaterial = !1;
      }
      if (e === "textured" || e === "wireframe_texture") {
        p.material = p.userData.omnicamOriginalMaterial;
        const b = Array.isArray(p.material) ? p.material : [p.material];
        for (const x of b)
          x && (x.side = L);
      } else if (e === "checker")
        p.material = Ge(g), p.userData.omnicamOverrideMaterial = !0;
      else if (e === "wireframe") {
        const b = Le.clone();
        b.side = L, d?.color && (b.color = new ce(d.color)), p.material = b, p.userData.omnicamOverrideMaterial = !0;
      } else if (e === "matte") {
        const b = $e.clone();
        b.side = L, d?.color && (b.color = new ce(d.color)), p.material = b, p.userData.omnicamOverrideMaterial = !0;
      } else {
        const b = he.clone();
        b.side = L, d?.color && (b.color = new ce(d.color)), p.material = b, p.userData.omnicamOverrideMaterial = !0;
      }
    }
  });
}
function ve(o, e = !1) {
  o.traverse((d) => {
    if (d.userData.omnicamModelResource && !e) return;
    d.geometry?.dispose?.();
    const g = Array.isArray(d.material) ? d.material : [d.material];
    for (const L of g)
      L?.map?.userData?.omnicamSharedResource || L?.map?.dispose?.(), L?.dispose?.();
  });
}
function Ke(o) {
  if (!o) return null;
  const e = o instanceof HTMLVideoElement ? new ft(o) : new pt(o);
  return e.colorSpace = Ce, e.needsUpdate = !0, e;
}
function lr(o, e, d) {
  e && Gt(o, e);
  const [g, L] = o.size || [2, 3], p = new ie(), b = new we(new De(g, L), new be({ color: 1448482, side: se, transparent: !0, opacity: 0.85 }));
  b.frustumCulled = !1, p.add(b);
  let x = e ? Ke(e) : null;
  if (!x && (o.id === "subject" || !o.asset) && (x = St(me)), !x) return p;
  const O = e?.videoWidth || e?.naturalWidth || e?.width || g, R = e?.videoHeight || e?.naturalHeight || e?.height || L, T = O / Math.max(1, R), z = g / Math.max(0.01, L);
  let re = g, ee = L;
  d === "contain" ? T > z ? ee = g / T : re = L * T : d === "cover" && (T > z ? (x.repeat.x = z / T, x.offset.x = (1 - x.repeat.x) * 0.5) : (x.repeat.y = T / z, x.offset.y = (1 - x.repeat.y) * 0.5));
  const J = new we(
    new De(re, ee),
    new be({
      color: 16777215,
      map: x,
      side: se,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return J.frustumCulled = !1, J.position.z = 2e-3, p.add(J), p.frustumCulled = !1, p;
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
    const g = new rt(16777215, 2.4);
    g.position.set(5, 8, 4), this.scene.add(g), this.flatLights = [this.scene.children.at(-2), g], this.studio = Bt(me, this.renderer, Lt), this.scene.add(this.studio.group), this.studioEnabled = !0, qe(me, this.scene, this.renderer, this.studio, !0), this.content = new ie(), this.scene.add(this.content), this.gridGroup = Yt(me), this.gridGroup.userData.omnicamPersistent = !0, this.content.add(this.gridGroup), this.path = new ie(), this.scene.add(this.path), this.liveCameras = new ie(), this.scene.add(this.liveCameras), this.selectionGroup = new ie(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new ot(35, 16 / 9, 0.01, 1e4), this.orthographic = new st(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = d, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new at(), this.pointer = new ze(), this.activeCamera = this.perspective;
  }
  async loadModel(e, d, g = "glb") {
    const L = `${g}:${d}`;
    if (!(!d || this.modelLoads.get(e) === L)) {
      this.modelLoads.set(e, L);
      try {
        let p, b = [];
        if (g === "obj") p = await new We().loadAsync(d);
        else if (g === "fbx")
          p = await new je().loadAsync(d), b = p.animations || [];
        else if (g === "stl") p = new we(await new Ie().loadAsync(d), he.clone());
        else if (g === "ply") {
          const s = await new Ne().loadAsync(d);
          s.index ? (s.getAttribute("normal") || s.computeVertexNormals(), p = new we(s, he.clone())) : p = new nt(s, new it({ color: 11449792, size: 0.025 }));
        } else {
          const s = await new Ue().loadAsync(d);
          p = s.scene, b = s.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== L) {
          ve(p, !0);
          return;
        }
        const x = this.models.get(e);
        x && ve(x.scene, !0), p.traverse((s) => {
          if (s.userData.omnicamModelResource = !0, s.frustumCulled = !1, s.isMesh && (s.frustumCulled = !1, s.material)) {
            const l = Array.isArray(s.material) ? s.material : [s.material];
            for (const u of l)
              u.side = se;
          }
          s.isPoints && (s.frustumCulled = !1), s.isSkinnedMesh && (s.frustumCulled = !1, s.computeBoundingBox?.(), s.computeBoundingSphere?.());
        });
        let N = 0, O = 0, R = 0, T = 0;
        p.traverse((s) => {
          s.isMesh && (N += 1, T += s.geometry?.getAttribute?.("position")?.count || 0), s.isPoints && (O += 1), s.isBone && (R += 1);
        });
        const z = new ie();
        if (z.frustumCulled = !1, z.add(p), !N && !O && R) {
          const s = new ct(p);
          s.material.depthTest = !1, s.material.opacity = 0.9, s.material.transparent = !0, s.renderOrder = 10, s.userData.omnicamModelResource = !0, z.add(s);
        }
        z.updateMatrixWorld(!0);
        const re = new lt().setFromObject(z), ee = re.getSize(new Pe()), J = Math.max(ee.x, ee.y, ee.z), E = Number.isFinite(J) && J > 1e-6 ? 2.5 / J : 1, ae = re.getCenter(new Pe());
        z.scale.setScalar(E), z.position.set(-ae.x * E, -re.min.y * E, -ae.z * E);
        const G = new ie();
        G.frustumCulled = !1, G.add(z);
        const y = b.length ? new dt(p) : null;
        y && y.clipAction(b[0]).play();
        const r = { url: d, format: g, scene: G, mixer: y, clips: b, selectedClip: 0, duration: b[0]?.duration || 0, meshes: N, points: O, bones: R, vertices: T, animations: b.length, normalizationScale: E };
        this.models.set(e, r), this.onModelLoaded({ id: e, format: g, meshes: N, points: O, bones: R, vertices: T, animations: b.length, animationNames: b.map((s, l) => s.name || `Clip ${l + 1}`), duration: r.duration, normalizationScale: E }), this.sceneKey = "", this.invalidate();
      } catch (p) {
        this.modelLoads.get(e) === L && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${g.toUpperCase()} ${e}`, p);
        const b = p?.message?.includes("FBX version not supported") || p?.message?.includes("6100") || p?.message?.includes("6000"), x = b ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : p?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: g, error: x, isLegacyFBX: b });
      }
    }
  }
}
const fe = { THREE: me, FBXLoader: je, GLTFLoader: Ue, OBJLoader: We, PLYLoader: Ne, STLLoader: Ie, neutral: he, wire: Le, checkerMaterial: Ge, objectMaterial: ir, applyModelMaterial: cr, disposeObject: ve, textureFor: Ke, cardMesh: lr, generatePointField: Mt, sampleCamera: xt, sampleObjectTransform: bt, hasOutlineMesh: ar, SelectionOutlineRenderer: nr };
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
  let g;
  return Promise.race([
    o,
    new Promise((L, p) => {
      g = setTimeout(() => p(new Error(`${d} timed out`)), e);
    })
  ]).finally(() => clearTimeout(g));
}
async function Mr(o, e, d, g, L, p = "balanced") {
  const b = await ur(o.width, o.height);
  if (!b) throw new Error("No supported WebCodecs WebM encoder");
  const x = new At({ format: new Ot(), target: new Vt() }), N = new kt(o, { codec: b, quality: Te[p] || Te.balanced, keyFrameInterval: 1 });
  x.addVideoTrack(N, { frameRate: d }), await pe(x.start(), 1e4, "Starting deterministic encoder");
  try {
    const O = 1 / d;
    for (let R = 0; R < e; R++) {
      if (L?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await g(R), await pe(N.add(R * O, O, { keyFrame: R % d === 0 }), 1e4, `Encoding frame ${R + 1}`);
    }
    await pe(x.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (O) {
    throw x.state !== "finalized" && await x.cancel().catch(() => {
    }), O;
  }
  return _t(new Blob([x.target.buffer], { type: await x.getMimeType() }), {
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
