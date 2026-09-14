import { T as ye } from "./chunk-__IQ4xkd.js";
import { V as Fe, a as Ke, O as Ye, b as He, E as Qe, W as Ze, S as be, P as Je, c as Ee, C as ce, H as et, D as tt, G as ie, d as rt, e as ot, f as at, g as ze, F as je, M as he, h as We, i as ve, j as Ie, k as st, l as nt, m as Ne, n as oe, o as it, B as ct, p as Ge, A as lt, q as Me, r as Ce, s as De, t as dt, u as ut, v as mt, w as ht, x as ft } from "./vendor-three-BQUrLQkn.js";
import { bM as pt, bN as wt, bO as gt, b7 as yt, s as Mt, f as xt } from "./chunk-gZOE6xM-.js";
import { s as bt, r as vt, q as Ct, a as Pe, b as Ue, D as Ve, c as Bt, d as Lt, e as St } from "./chunk-L-mTfGmq.js";
import { c as _t } from "./chunk-a2yd8Eqb.js";
import { Output as Gt, BufferTarget as Dt, WebMOutputFormat as Pt, CanvasSource as Vt, QUALITY_HIGH as At, QUALITY_MEDIUM as kt, QUALITY_LOW as Ot, canEncodeVideo as Tt } from "./vendor-mediabunny-CZ5VNE-V.js";
function Ft(r, { position: e, forward: f, up: y, color: D, scale: p = 1, active: v = !0 }) {
  const x = new r.Group(), q = v ? 0.95 : 0.5, j = new r.MeshBasicMaterial({
    color: D,
    transparent: !0,
    opacity: q,
    depthTest: !1
  }), k = new r.Mesh(new r.BoxGeometry(0.34, 0.24, 0.42), j);
  k.renderOrder = 912, x.add(k);
  const N = new r.Mesh(new r.ConeGeometry(0.17, 0.26, 20), j);
  return N.rotation.x = -Math.PI / 2, N.position.z = -0.32, N.renderOrder = 912, x.add(N), x.scale.setScalar(p), x.position.copy(e), x.up.copy(y), x.lookAt(e.clone().add(f)), x;
}
function zt(r, { position: e, color: f = 15903035, radius: y = 0.28, bold: D = !1 }) {
  const p = new r.Group(), v = D ? 16773544 : f, x = new r.LineBasicMaterial({ color: v, transparent: !0, opacity: D ? 1 : 0.95, depthTest: !1 }), q = (N) => {
    const R = [];
    for (let ee = 0; ee <= 48; ee++) {
      const Q = ee / 48 * Math.PI * 2;
      R.push(new r.Vector3(Math.cos(Q) * N, Math.sin(Q) * N, 0));
    }
    const H = new r.Line(new r.BufferGeometry().setFromPoints(R), x);
    return H.renderOrder = 915, H;
  };
  if (p.add(q(y)), D) {
    p.add(q(y * 1.18));
    const N = new r.Mesh(
      new r.RingGeometry(0, y * 0.3, 16),
      new r.MeshBasicMaterial({ color: v, transparent: !0, opacity: 1, depthTest: !1 })
    );
    N.renderOrder = 916, p.add(N);
  }
  const j = y * 1.55, k = new r.LineSegments(
    new r.BufferGeometry().setFromPoints([
      new r.Vector3(-j, 0, 0),
      new r.Vector3(-y * 0.45, 0, 0),
      new r.Vector3(y * 0.45, 0, 0),
      new r.Vector3(j, 0, 0),
      new r.Vector3(0, -j, 0),
      new r.Vector3(0, -y * 0.45, 0),
      new r.Vector3(0, y * 0.45, 0),
      new r.Vector3(0, j, 0)
    ]),
    x
  );
  return k.renderOrder = 915, p.add(k), p.position.copy(e), p.userData.omnicamBillboard = !0, p;
}
const Re = 3718648, jt = 12e3;
function fe(r) {
  return !!(r.isSkinnedMesh && r.skeleton);
}
function qe(r, e) {
  r.position.copy(e.position), r.quaternion.copy(e.quaternion), r.scale.copy(e.scale);
}
function pe(r) {
  return r.frustumCulled = !1, r.raycast = () => {
  }, r.userData.omnicamHelper = !0, r;
}
function Wt(r, e, { color: f = null, opacity: y = null } = {}) {
  const D = f ?? Re, p = y ?? 0.65;
  if (fe(e)) {
    const x = new r.SkinnedMesh(e.geometry.clone(), new r.MeshBasicMaterial({
      color: D,
      wireframe: !0,
      transparent: !0,
      opacity: p,
      depthWrite: !1
    }));
    return x.bindMode = e.bindMode, x.bind(e.skeleton, e.bindMatrix), qe(x, e), { overlay: pe(x), parent: e.parent || e };
  }
  const v = new r.LineSegments(
    new r.WireframeGeometry(e.geometry),
    new r.LineBasicMaterial({ color: D, opacity: p, transparent: !0, depthTest: !0 })
  );
  return { overlay: pe(v), parent: e };
}
function It(r, e) {
  const f = new r.PointsMaterial({ color: Re, size: 0.05, sizeAttenuation: !0 });
  if (!fe(e)) {
    const N = new r.Points(e.geometry, f);
    return { overlay: pe(N), parent: e };
  }
  const y = e.geometry.getAttribute("position")?.count || 0, D = Math.max(1, Math.ceil(y / jt)), p = Math.ceil(y / D), v = new Float32Array(p * 3), x = new r.BufferGeometry();
  x.setAttribute("position", new r.Float32BufferAttribute(v, 3));
  const q = new r.Points(x, f);
  qe(q, e);
  const j = new r.Vector3(), k = x.getAttribute("position");
  return q.onBeforeRender = () => {
    for (let N = 0; N < p; N++)
      e.getVertexPosition(N * D, j), k.setXYZ(N, j.x, j.y, j.z);
    k.needsUpdate = !0;
  }, { overlay: pe(q), parent: e.parent || e };
}
function Nt(r, e, f) {
  const y = fe(e) ? new r.SkinnedMesh(e.geometry.clone(), f) : new r.Mesh(e.geometry.clone(), f);
  return fe(e) && (y.bindMode = e.bindMode, y.bind(e.skeleton, e.bindMatrix)), y.matrixAutoUpdate = !1, y.matrix.copy(e.matrixWorld), y.frustumCulled = !1, y;
}
function Ut(r, e, { wireframe: f = !1, vertices: y = !1, wireframeColor: D = null, wireframeOpacity: p = null } = {}) {
  if (!f && !y) return;
  const v = [];
  e.traverse((x) => {
    x.isMesh && x.geometry && !x.userData.omnicamHelper && v.push(x);
  });
  for (const x of v) {
    if (f) {
      const { overlay: q, parent: j } = Wt(r, x, { color: D, opacity: p });
      j.add(q);
    }
    if (y) {
      const { overlay: q, parent: j } = It(r, x);
      j.add(q);
    }
  }
}
const Rt = 16777215, ne = 0.17, Ae = 3593923, qt = 0.06;
function Xt(r) {
  const { THREE: e, FBXLoader: f, GLTFLoader: y, OBJLoader: D, PLYLoader: p, STLLoader: v, neutral: x, wire: q, checkerMaterial: j, objectMaterial: k, applyModelMaterial: N, disposeObject: R, textureFor: te, cardMesh: H, generatePointField: ee, sampleCamera: Q, sampleObjectTransform: ae } = r;
  return {
    removeModel(G) {
      const w = this.models.get(G);
      w && R(w.scene, !0), this.models.delete(G), this.modelLoads.delete(G), this.sceneKey = "";
    },
    selectAnimation(G, w) {
      const t = this.models.get(G);
      !t?.mixer || !t.clips.length || (t.selectedClip = Math.max(0, Math.min(t.clips.length - 1, Number(w) || 0)), t.duration = t.clips[t.selectedClip].duration || 0, t.motionClipId = null, t.mixer.stopAllAction(), t.mixer.clipAction(t.clips[t.selectedClip]).play(), this.invalidate());
    },
    /** Select the clip a character motion names (by clip name, else index, else
     * the first clip). Idempotent -- re-selecting the same clip is a no-op so the
     * per-frame render loop can call it freely (design spec section 27). */
    applyMotionClip(G, w) {
      const t = this.models.get(G);
      if (!t?.mixer || !t.clips.length) return;
      const o = String(w?.clip_id ?? "");
      if (t.motionClipId === o) return;
      let n = t.clips.findIndex((s) => (s.name || "").toLowerCase() === o.toLowerCase());
      n < 0 && /^\d+$/.test(o) && (n = Number(o)), (n < 0 || n >= t.clips.length) && (n = 0), t.selectedClip = n, t.motionClipId = o, t.duration = t.clips[n].duration || 0, t.mixer.stopAllAction();
      const m = t.mixer.clipAction(t.clips[n]);
      m.reset(), m.play(), this.invalidate();
    },
    rebuild(G, w, t, o = !1) {
      this.content.traverse((a) => {
        for (const L of [...a.children])
          L.userData.omnicamHelper && (a.remove(L), R(L, !0));
      }), R(this.content), this.content.clear(), this.objectNodes.clear(), this.selectionKey = "";
      const n = G.render_mode, m = new e.Group();
      m.userData.omnicamCaptureGuide = !0;
      const s = new e.GridHelper(120, 24, 4081496, 3291463);
      s.userData.omnicamCaptureGuide = !0, s.frustumCulled = !1, s.position.y = 5e-4, m.add(s);
      const i = new e.GridHelper(120, 120, 2238001, 1909035);
      i.userData.omnicamCaptureGuide = !0, i.frustumCulled = !1, m.add(i);
      const C = new e.LineBasicMaterial({ color: 15680580, linewidth: 2, transparent: !0, opacity: 0.85 }), g = new e.BufferGeometry().setFromPoints([new e.Vector3(-60, 1e-3, 0), new e.Vector3(60, 1e-3, 0)]), h = new e.Line(g, C);
      h.userData.omnicamCaptureGuide = !0, m.add(h);
      const M = new e.LineBasicMaterial({ color: 3900150, linewidth: 2, transparent: !0, opacity: 0.85 }), c = new e.BufferGeometry().setFromPoints([new e.Vector3(0, 1e-3, -60), new e.Vector3(0, 1e-3, 60)]), B = new e.Line(c, M);
      if (B.userData.omnicamCaptureGuide = !0, m.add(B), this.content.add(m), ["omni_ref", "point_field"].includes(n)) {
        const { points: a, colors: L } = ee(G.point_density || "balanced", G.point_spread || "all_views", G.point_color || null);
        if (a.length > 0) {
          const u = new e.BufferGeometry();
          u.setAttribute("position", new e.Float32BufferAttribute(a, 3)), u.setAttribute("color", new e.Float32BufferAttribute(L, 3));
          const S = new e.PointsMaterial({
            vertexColors: !0,
            size: 0.065,
            sizeAttenuation: !0
          }), l = new e.Points(u, S);
          l.frustumCulled = !1, this.content.add(l);
        }
      }
      if (!["grid", "point_field"].includes(n))
        for (const a of G.objects) {
          if (a.enabled === !1) continue;
          const L = a.size || [1, 1, 1];
          let u;
          if (a.type === "glb" || a.type === "model") {
            const l = t.get(a.id), _ = this.models.get(a.id), O = a.format || (a.type === "glb" ? "glb" : "");
            l && (_?.url !== l || _?.format !== O) && this.loadModel(a.id, l, O);
            const P = !!G.backface_culling, A = vt(a, G, o) ?? (a.material_mode || "textured");
            _?.url === l && (u = _.scene, N(u, A, a, P));
          } else if (a.type === "sphere")
            u = new e.Mesh(new e.SphereGeometry(0.5, 24, 16), k(a, n, !!G.backface_culling));
          else if (a.type === "cylinder")
            u = new e.Mesh(new e.CylinderGeometry(0.5, 0.5, 1, 24), k(a, n, !!G.backface_culling));
          else if (a.type === "torus") {
            const l = new e.TorusGeometry(0.5, 0.2, 16, 32);
            l.rotateX(Math.PI / 2), u = new e.Mesh(l, k(a, n, !!G.backface_culling));
          } else if (a.type === "pyramid") {
            const l = new e.ConeGeometry(0.7, 1, 4);
            l.rotateY(Math.PI / 4), u = new e.Mesh(l, k(a, n, !!G.backface_culling));
          } else if (a.type === "sun_light") {
            const l = new e.Group(), _ = new e.DirectionalLight(a.color || 16774892, a.intensity ?? 2.2);
            _.castShadow = a.cast_shadow !== !1, _.castShadow && (_.shadow.mapSize.set(1024, 1024), _.shadow.bias = -8e-4, _.shadow.normalBias = 0.02, _.shadow.radius = 2.4, _.shadow.camera.near = 0.5, _.shadow.camera.far = 70, _.shadow.camera.left = _.shadow.camera.bottom = -14, _.shadow.camera.right = _.shadow.camera.top = 14);
            const O = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), P = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(O[0], O[1], O[2], "YXZ"));
            _.target.position.copy(_.position).add(P.multiplyScalar(10)), l.add(_, _.target);
            const A = new e.Mesh(
              new e.SphereGeometry(0.28, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16096779, wireframe: !0 })
            );
            A.userData.omnicamLightHelper = !0, A.visible = !o, l.add(A), u = l;
          } else if (a.type === "point_light") {
            const l = new e.Group(), _ = new e.PointLight(a.color || 16777215, a.intensity ?? 2, 0, 2);
            l.add(_);
            const O = new e.Mesh(
              new e.SphereGeometry(0.2, 12, 8),
              new e.MeshBasicMaterial({ color: a.color || 16498468, wireframe: !0 })
            );
            O.userData.omnicamLightHelper = !0, O.visible = !o, l.add(O), u = l;
          } else if (a.type === "spot_light") {
            const l = new e.Group(), _ = (a.cone_angle ?? 45) * Math.PI / 180, O = a.penumbra ?? 0.25, P = new e.SpotLight(a.color || 16777215, a.intensity ?? 3, 0, _, O, 2), A = (a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad), X = new e.Vector3(0, 0, -1).applyEuler(new e.Euler(A[0], A[1], A[2], "YXZ"));
            P.target.position.copy(P.position).add(X.multiplyScalar(10)), l.add(P, P.target);
            const F = new e.Mesh(
              new e.ConeGeometry(0.25, 0.5, 8),
              new e.MeshBasicMaterial({ color: a.color || 3718648, wireframe: !0 })
            );
            F.userData.omnicamLightHelper = !0, F.visible = !o, l.add(F), u = l;
          } else if (a.type === "human")
            u = new e.Mesh(_t(e), k(a, n, !!G.backface_culling));
          else if (a.type === "ground") u = new e.Mesh(new e.BoxGeometry(1, 1, 1), k(a, n, !!G.backface_culling));
          else if (a.type === "card")
            u = !a.material_mode || ["textured", "wireframe_texture"].includes(a.material_mode) ? H(a, w.get(a.id), G.card_fit || "contain") : new e.Mesh(new e.PlaneGeometry(L[0], L[1]), k(a, n, !!G.backface_culling));
          else if (a.type === "null") {
            const l = new e.AxesHelper(0.5);
            l.position.fromArray(a.position || [0, 0, 0]), l.userData.omnicamId = a.id, l.frustumCulled = !1, this.objectNodes.set(a.id, l), this.content.add(l);
            continue;
          } else
            u = new e.Mesh(new e.BoxGeometry(1, 1, 1), k(a, n, !!G.backface_culling));
          if (!u) continue;
          u.position.fromArray(a.position || [0, 0, 0]), u.rotation.set(...(a.rotation || [0, 0, 0]).map(e.MathUtils.degToRad));
          const S = ["sun_light", "point_light", "spot_light"].includes(a.type);
          if (a.type !== "card" && !S && u.scale.fromArray(L), u.userData.omnicamId = a.id, u.frustumCulled = !1, u.traverse((l) => {
            l.frustumCulled = !1, l.userData.omnicamId = a.id;
          }), !S) {
            const l = !!(G.show_wireframe || G.render_mode === "wireframe_texture" || a.material_mode === "wireframe_texture" || a.material_mode === "wireframe_neutral");
            Ut(e, u, { wireframe: l, vertices: G.show_vertices });
          }
          this.objectNodes.set(a.id, u), this.content.add(u);
        }
    },
    rebuildPath(G, w = "camera", t = null, o = "", n = null) {
      const m = Array.isArray(n) ? new Set(n) : null;
      R(this.path), this.path.clear();
      const s = o === "camera" ? G.active_camera_id : null, i = [
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
      (G.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: G.keyframes || [] }]).forEach((h, M) => {
        const c = h.keyframes || [];
        if (c.length === 0 || h.id === s) return;
        const B = h.color ? { line: new e.Color(h.color), marker: new e.Color(h.color), frustum: new e.Color(h.color) } : i[M % i.length], a = h.id === G.active_camera_id, L = a && w === "camera";
        if (c.length >= 2) {
          const u = c[0].frame, S = c[c.length - 1].frame, l = Math.max(32, Math.min(256, S - u + 1)), _ = { ...h, keyframes: c, objects: G.objects }, O = Array.from({ length: l }, (V, z) => {
            const U = u + (S - u) * z / Math.max(1, l - 1);
            return new e.Vector3().fromArray(Q(_, U, G.objects).position);
          }), P = new e.CatmullRomCurve3(O, !1, "centripetal"), A = L ? 0.06 : a ? 0.045 : 0.025, X = new e.MeshBasicMaterial({
            color: B.line,
            transparent: !0,
            opacity: a ? 1 : 0.55,
            depthTest: !1
          }), F = new e.Mesh(new e.TubeGeometry(P, Math.max(48, l), A, 8, !1), X);
          if (F.renderOrder = 900, F.userData.omnicamWidget = "path", a && !h.locked && (F.userData.omnicamPathSegments = {
            cameraId: h.id,
            firstFrame: u,
            lastFrame: S,
            frames: c.map((V) => V.frame),
            points: O.map((V) => [V.x, V.y, V.z])
          }), this.path.add(F), a) {
            const V = new e.Mesh(
              new e.TubeGeometry(P, Math.max(48, l), A * (L ? 3 : 2.4), 8, !1),
              new e.MeshBasicMaterial({ color: B.line, transparent: !0, opacity: L ? 0.3 : 0.18, depthTest: !1 })
            );
            if (V.renderOrder = 899, V.userData.omnicamWidget = "path", this.path.add(V), O.length >= 8) {
              const z = Math.max(6, Math.floor(l / 8));
              for (let U = Math.floor(z / 2); U < l - 1; U += z) {
                const K = O[U], $ = O[U + 1].clone().sub(K).normalize(), J = new e.ConeGeometry(A * 1.5, A * 3, 8);
                J.rotateX(Math.PI / 2);
                const Z = new e.Quaternion().setFromUnitVectors(new e.Vector3(0, 0, 1), $), d = new e.Mesh(J, new e.MeshBasicMaterial({ color: B.marker, transparent: !0, opacity: 0.85, depthTest: !1 }));
                d.quaternion.copy(Z), d.position.copy(K), d.renderOrder = 901, d.userData.omnicamWidget = "path", this.path.add(d);
              }
            }
          }
        }
        for (const u of c) {
          const S = c.indexOf(u), l = a, _ = new e.Mesh(
            new e.SphereGeometry(l ? ne : 0.085, 16, 12),
            new e.MeshBasicMaterial({ color: l ? Rt : B.marker, depthTest: !1 })
          );
          _.position.fromArray(u.camera.position), _.renderOrder = 910, _.userData.omnicamPathKey = { cameraId: h.id, frame: u.frame }, _.userData.omnicamWidget = "path", this.path.add(_);
          const O = new e.Mesh(
            new e.RingGeometry((l ? ne : 0.085) * 1.3, (l ? ne : 0.085) * 1.7, 24),
            new e.MeshBasicMaterial({ color: l ? 16777215 : B.marker, side: e.DoubleSide, transparent: !0, opacity: 0.65, depthTest: !1 })
          );
          O.position.fromArray(u.camera.position), O.renderOrder = 909, O.userData.omnicamBillboard = !0, O.userData.omnicamWidget = "path", this.path.add(O);
          const P = new e.Vector3().fromArray(u.camera.position), A = new e.Vector3().fromArray(u.camera.target || [0, 0, 0]), X = a && t != null && u.frame === t, F = a && !X && m?.has(u.frame);
          if (X) {
            const V = new e.Mesh(
              new e.RingGeometry(ne * 2.1, ne * 2.6, 24),
              new e.MeshBasicMaterial({ color: 16096779, side: e.DoubleSide, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            V.position.fromArray(u.camera.position), V.renderOrder = 911, V.userData.omnicamBillboard = !0, V.userData.omnicamWidget = "path", this.path.add(V);
          } else if (F) {
            const V = new e.Mesh(
              new e.RingGeometry(ne * 1.9, ne * 2.2, 24),
              new e.MeshBasicMaterial({ color: 3718648, side: e.DoubleSide, transparent: !0, opacity: 0.85, depthTest: !1 })
            );
            V.position.fromArray(u.camera.position), V.renderOrder = 911, V.userData.omnicamBillboard = !0, V.userData.omnicamWidget = "path", this.path.add(V);
          }
          if (X) {
            const V = A.clone().sub(P).normalize();
            let z = new e.Vector3().crossVectors(V, new e.Vector3(0, 1, 0));
            z.lengthSq() < 1e-8 ? z.set(1, 0, 0) : z.normalize();
            const U = new e.Vector3().crossVectors(z, V).normalize(), K = e.MathUtils.clamp(P.distanceTo(A) * 0.08, 0.25, 0.8), $ = u.camera.camera_type === "orthographic" ? K * 0.55 : K * Math.tan(e.MathUtils.degToRad(u.camera.fov || 35) * 0.5), J = $ * (G.width || 16) / Math.max(1, G.height || 9), Z = P.clone().addScaledVector(V, K), d = [
              Z.clone().addScaledVector(z, -J).addScaledVector(U, -$),
              Z.clone().addScaledVector(z, J).addScaledVector(U, -$),
              Z.clone().addScaledVector(z, J).addScaledVector(U, $),
              Z.clone().addScaledVector(z, -J).addScaledVector(U, $)
            ], b = [];
            for (const E of d) b.push(P, E);
            for (let E = 0; E < 4; E++) b.push(d[E], d[(E + 1) % 4]);
            const W = new e.BufferGeometry().setFromPoints(b), I = new e.LineSegments(W, new e.LineBasicMaterial({
              color: B.marker,
              transparent: !0,
              opacity: 1,
              depthTest: !1
            }));
            I.userData.omnicamWidget = "gizmo", this.path.add(I);
            const T = new e.BufferGeometry();
            T.setIndex([0, 1, 2, 0, 2, 3]), T.setAttribute("position", new e.Float32BufferAttribute([
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
            const Y = new e.Mesh(T, new e.MeshBasicMaterial({
              color: B.marker,
              transparent: !0,
              opacity: 0.12,
              depthTest: !1,
              side: e.DoubleSide
            }));
            Y.userData.omnicamWidget = "gizmo", this.path.add(Y);
            const se = Ft(e, {
              position: P,
              forward: V,
              up: U,
              color: B.marker,
              scale: e.MathUtils.clamp(K * 1.15, 0.35, 1.6),
              active: a
            });
            se.userData.omnicamWidget = "gizmo", this.path.add(se);
          }
          if (X) {
            const V = zt(e, {
              position: A,
              radius: e.MathUtils.clamp(P.distanceTo(A) * 0.05, 0.16, 0.5) * 1.4,
              bold: !0
            });
            V.userData.omnicamWidget = "lookat", this.path.add(V);
            const z = new e.Line(
              new e.BufferGeometry().setFromPoints([P.clone(), A.clone()]),
              new e.LineBasicMaterial({ color: 16773544, transparent: !0, opacity: 0.9, depthTest: !1 })
            );
            z.renderOrder = 914, z.userData.omnicamWidget = "lookat", this.path.add(z);
          }
          if (X) {
            const V = bt(u, c[S - 1] || null, c[S + 1] || null);
            for (const z of ["in", "out"]) {
              const U = new e.Vector3().fromArray(V[z]), K = new e.Line(
                new e.BufferGeometry().setFromPoints([P.clone(), U.clone()]),
                new e.LineBasicMaterial({ color: Ae, transparent: !0, opacity: 0.95, depthTest: !1 })
              );
              K.renderOrder = 912, K.userData.omnicamWidget = "gizmo", this.path.add(K);
              const $ = new e.Mesh(
                new e.SphereGeometry(qt, 12, 8),
                new e.MeshBasicMaterial({ color: Ae, depthTest: !1 })
              );
              $.position.copy(U), $.renderOrder = 913, $.userData.omnicamCurveHandle = { cameraId: h.id, frame: u.frame, side: z }, $.userData.omnicamWidget = "gizmo", this.path.add($);
            }
          }
        }
      });
      const g = [16742005, 52937, 16632686, 7101671, 14774357];
      (G.objects || []).forEach((h, M) => {
        const c = h.keyframes || [];
        if (c.length < 2) return;
        const B = h.color ? new e.Color(h.color) : g[M % g.length], a = c.map((S) => new e.Vector3().fromArray(S.transform?.position || [0, 0, 0])), L = new e.CatmullRomCurve3(a, !1, "centripetal"), u = new e.Mesh(
          new e.TubeGeometry(L, Math.max(32, c.length * 16), 0.035, 8, !1),
          new e.MeshBasicMaterial({ color: B, transparent: !0, opacity: 0.9, depthTest: !1 })
        );
        u.renderOrder = 900, u.userData.omnicamWidget = "path", this.path.add(u);
        for (const S of c) {
          const l = new e.Mesh(
            new e.BoxGeometry(0.14, 0.14, 0.14),
            new e.MeshBasicMaterial({ color: B, depthTest: !1 })
          );
          l.position.fromArray(S.transform?.position || [0, 0, 0]), l.renderOrder = 910, l.userData.omnicamWidget = "path", this.path.add(l);
        }
      });
    }
  };
}
function $t(r) {
  const { THREE: e, FBXLoader: f, GLTFLoader: y, OBJLoader: D, PLYLoader: p, STLLoader: v, neutral: x, wire: q, checkerMaterial: j, objectMaterial: k, applyModelMaterial: N, disposeObject: R, textureFor: te, cardMesh: H, generatePointField: ee, sampleCamera: Q, sampleObjectTransform: ae, hasOutlineMesh: G } = r;
  return {
    updateLiveCameras(w, t, o, n, m = "camera", s = null) {
      if (R(this.liveCameras), this.liveCameras.clear(), o) return;
      const i = [
        { line: 4891631, marker: 9090296, frustum: 6269173, body: 2373198 },
        { line: 15903035, marker: 16638023, frustum: 16103247, body: 5127716 },
        { line: 4769652, marker: 8843180, frustum: 6084231, body: 2379314 },
        { line: 11888088, marker: 15235577, frustum: 13139944, body: 4596814 },
        { line: 15485081, marker: 16020150, frustum: 16084144, body: 5121081 }
      ];
      (w.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: w.keyframes || [] }]).forEach((g, h) => {
        const M = g.color ? { line: new e.Color(g.color), marker: new e.Color(g.color), frustum: new e.Color(g.color), body: new e.Color(g.color).multiplyScalar(0.35) } : i[h % i.length], c = g.id === w.active_camera_id, B = c && m === "camera", a = n === "camera" && c, L = Q(g, t, w.objects), u = new e.Vector3().fromArray(L.position || [0, 0, 0]), S = new e.Vector3().fromArray(L.target || [0, 0, 0]), l = S.clone().sub(u), _ = l.length();
        _ < 1e-4 ? l.set(0, 0, -1) : l.normalize();
        let O = new e.Vector3(0, 1, 0), P = new e.Vector3().crossVectors(l, O);
        P.lengthSq() < 1e-6 && (O = new e.Vector3(0, 0, 1), P = new e.Vector3().crossVectors(l, O)), P.normalize();
        let A = new e.Vector3().crossVectors(P, l).normalize();
        if (L.roll) {
          const F = e.MathUtils.degToRad(L.roll);
          P.applyAxisAngle(l, F), A.applyAxisAngle(l, F);
        }
        const X = new e.MeshBasicMaterial({ transparent: !0, opacity: 0, depthWrite: !1 });
        if (!a) {
          const F = new e.Group(), V = new e.Mesh(
            new e.BoxGeometry(0.18, 0.12, 0.22),
            new e.MeshStandardMaterial({ color: M.body, roughness: 0.4, metalness: 0.8 })
          );
          V.position.set(0, 0, -0.11), F.add(V);
          const z = new e.CylinderGeometry(0.05, 0.055, 0.12, 16);
          z.rotateX(Math.PI / 2);
          const U = new e.Mesh(
            z,
            new e.MeshStandardMaterial({ color: M.marker, roughness: 0.2, metalness: 0.9 })
          );
          U.position.set(0, 0, 0.05), F.add(U);
          const K = new e.Mesh(
            new e.BoxGeometry(0.04, 0.03, 0.08),
            new e.MeshBasicMaterial({ color: c ? 16729156 : M.marker })
          );
          K.position.set(0, 0.07, -0.08), F.add(K);
          const $ = new e.Matrix4().makeBasis(P, A, l.clone().negate());
          F.quaternion.setFromRotationMatrix($), F.position.copy(u), F.userData.omnicamWidget = "gizmo", this.liveCameras.add(F);
          const J = new e.SphereGeometry(0.35, 8, 6), Z = new e.Mesh(J, X);
          Z.position.copy(u), Z.userData = { omnicamType: "camera", omnicamId: g.id }, this.liveCameras.add(Z);
          const d = e.MathUtils.clamp(_ * 0.25, 0.5, 2.5), b = L.camera_type === "orthographic" ? 5 / Math.max(0.01, L.zoom || 1) * 0.35 : d * Math.tan(e.MathUtils.degToRad(L.fov || 35) * 0.5), W = b * (w.width || 16) / Math.max(1, w.height || 9), I = u.clone().addScaledVector(l, d), T = [
            I.clone().addScaledVector(P, -W).addScaledVector(A, -b),
            I.clone().addScaledVector(P, W).addScaledVector(A, -b),
            I.clone().addScaledVector(P, W).addScaledVector(A, b),
            I.clone().addScaledVector(P, -W).addScaledVector(A, b)
          ], Y = [];
          for (const le of T) Y.push(u, le);
          for (let le = 0; le < 4; le++) Y.push(T[le], T[(le + 1) % 4]);
          const E = T[2].clone().add(T[3]).multiplyScalar(0.5).clone().addScaledVector(A, b * 0.25);
          Y.push(T[2], E, E, T[3]);
          const re = new e.BufferGeometry().setFromPoints(Y), Se = new e.LineSegments(re, new e.LineBasicMaterial({
            color: B ? M.marker : M.frustum,
            linewidth: c ? 2 : 1,
            transparent: !0,
            opacity: c ? 1 : 0.6
          }));
          Se.userData.omnicamWidget = "gizmo", this.liveCameras.add(Se);
          const we = new e.BufferGeometry();
          we.setIndex([0, 1, 2, 0, 2, 3]), we.setAttribute("position", new e.Float32BufferAttribute([
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
          const _e = new e.Mesh(we, new e.MeshBasicMaterial({
            color: B ? M.marker : M.frustum,
            transparent: !0,
            opacity: 0.12,
            depthTest: !1,
            side: e.DoubleSide
          }));
          _e.userData.omnicamWidget = "gizmo", this.liveCameras.add(_e);
        }
        if (_ > 0.01) {
          const F = c && m === "camera_target", V = new e.BufferGeometry().setFromPoints([u, S]), z = new e.Line(V, new e.LineDashedMaterial({
            color: B || F ? 9133302 : M.marker,
            dashSize: 0.15,
            gapSize: 0.1,
            transparent: !0,
            opacity: B || F ? 1 : c ? 0.75 : 0.4
          }));
          z.userData.omnicamWidget = "lookat", this.liveCameras.add(z);
          const U = F ? 0.12 : B ? 0.11 : 0.08, K = [
            S.clone().add(new e.Vector3(-U, 0, 0)),
            S.clone().add(new e.Vector3(U, 0, 0)),
            S.clone().add(new e.Vector3(0, -U, 0)),
            S.clone().add(new e.Vector3(0, U, 0)),
            S.clone().add(new e.Vector3(0, 0, -U)),
            S.clone().add(new e.Vector3(0, 0, U))
          ], $ = new e.BufferGeometry().setFromPoints(K), J = new e.LineSegments($, new e.LineBasicMaterial({
            color: F || B ? 9133302 : M.marker,
            linewidth: F ? 3 : 1,
            transparent: !0,
            opacity: F || B ? 1 : c ? 0.9 : 0.5
          }));
          J.userData.omnicamWidget = "lookat", this.liveCameras.add(J);
          const Z = new e.SphereGeometry(0.28, 8, 6), d = new e.Mesh(Z, X);
          if (d.position.copy(S), d.userData = { omnicamType: "camera_target", omnicamId: g.id }, this.liveCameras.add(d), (F || B) && n !== "camera") {
            const b = new e.RingGeometry(0.14, 0.18, 24);
            b.rotateX(Math.PI / 2);
            const W = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, transparent: !0, opacity: 0.9 }), I = new e.Mesh(b, W);
            I.position.copy(S), I.userData.omnicamWidget = "lookat", this.liveCameras.add(I);
          }
        }
        if (c && n !== "camera" && m === "camera") {
          const F = new e.RingGeometry(0.19, 0.24, 32);
          F.rotateX(Math.PI / 2);
          const V = new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 1 }), z = new e.Mesh(F, V);
          z.position.copy(u), z.userData.omnicamWidget = "gizmo", this.liveCameras.add(z);
          const U = new e.RingGeometry(0.28, 0.31, 32);
          U.rotateX(Math.PI / 2);
          const K = new e.Mesh(U, new e.MeshBasicMaterial({ color: 15913067, side: e.DoubleSide, transparent: !0, opacity: 0.35 }));
          K.position.copy(u), K.userData.omnicamWidget = "gizmo", this.liveCameras.add(K);
        }
      });
    },
    updateSelection(w, t, o, n = null, m = "", s = !1) {
      const i = n ? `${n.mode || ""}:${n.objectId || ""}:${(n.point || []).join(",")}` : "", C = `${t}:${o || ""}:${(w.__selectedObjectIds || []).join(",")}:${m}:${i}:${s ? "ortho" : "persp"}`;
      if (C !== this.selectionKey) {
        if (this.selectionKey = C, R(this.selectionGroup), this.selectionGroup.clear(), t === "object" && o) {
          const g = this.objectNodes.get(o);
          if (g) {
            g.updateMatrixWorld(!0);
            try {
              const h = new e.Box3(), M = [];
              if (g.traverse((c) => {
                c.isBone && M.push(c);
              }), M.length > 0) {
                const c = new e.Vector3();
                for (const B of M)
                  B.getWorldPosition(c), h.expandByPoint(c);
                h.expandByScalar(0.2);
              } else
                h.setFromObject(g);
              if ((s || !G(g)) && !h.isEmpty() && Number.isFinite(h.min.x) && Number.isFinite(h.max.x) && Number.isFinite(h.min.y) && Number.isFinite(h.max.y) && Number.isFinite(h.min.z) && Number.isFinite(h.max.z)) {
                h.expandByScalar(0.04);
                const c = new e.Box3Helper(h, new e.Color(9133302));
                c.material.transparent = !0, c.material.opacity = 0.95, c.material.depthTest = !1, c.renderOrder = 9999, this.selectionGroup.add(c);
              }
            } catch {
            }
            if (w.show_wireframe) {
              let h = 0;
              g.traverse((M) => {
                if (!M.isMesh || !M.geometry || M.userData.omnicamHelper || h >= 64) return;
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
                c.renderOrder = 9998, this.selectionGroup.add(c), h += 1;
              });
            }
            if (n && n.objectId === o && n.point) {
              if (n.mode === "vertex") {
                const h = new e.SphereGeometry(0.08, 16, 12), M = new e.MeshBasicMaterial({ color: 16096779, depthTest: !1 }), c = new e.Mesh(h, M);
                c.position.fromArray(n.point), c.renderOrder = 1e4, this.selectionGroup.add(c);
                const B = new e.RingGeometry(0.1, 0.15, 24), a = new e.MeshBasicMaterial({ color: 9133302, side: e.DoubleSide, depthTest: !1 }), L = new e.Mesh(B, a);
                L.position.fromArray(n.point), this.activeCamera && L.quaternion.copy(this.activeCamera.quaternion), L.renderOrder = 1e4, this.selectionGroup.add(L);
              } else if (n.mode === "edge" && n.edge) {
                const [h, M] = n.edge, c = new e.BufferGeometry().setFromPoints([new e.Vector3(...h), new e.Vector3(...M)]), B = new e.LineBasicMaterial({ color: 16096779, linewidth: 5, depthTest: !1 }), a = new e.Line(c, B);
                a.renderOrder = 1e4, this.selectionGroup.add(a);
              } else if (n.mode === "face" && n.vertices) {
                const [h, M, c] = n.vertices, B = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...h),
                  new e.Vector3(...M),
                  new e.Vector3(...c)
                ]);
                B.setIndex([0, 1, 2]), B.computeVertexNormals();
                const a = new e.MeshBasicMaterial({
                  color: 9133302,
                  opacity: 0.75,
                  transparent: !0,
                  side: e.DoubleSide,
                  depthTest: !1
                }), L = new e.Mesh(B, a);
                L.renderOrder = 1e4, this.selectionGroup.add(L);
                const u = new e.BufferGeometry().setFromPoints([
                  new e.Vector3(...h),
                  new e.Vector3(...M),
                  new e.Vector3(...c),
                  new e.Vector3(...h)
                ]), S = new e.Line(u, new e.LineBasicMaterial({ color: 16096779, linewidth: 3, depthTest: !1 }));
                S.renderOrder = 10001, this.selectionGroup.add(S);
              }
            }
          }
        }
        if (t === "object")
          for (const g of w.__selectedObjectIds || []) {
            if (g === o) continue;
            const h = this.objectNodes.get(g);
            if (h) {
              h.updateMatrixWorld(!0);
              try {
                const M = new e.Box3().setFromObject(h);
                if ((s || !G(h)) && !M.isEmpty() && Number.isFinite(M.min.x)) {
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
    listObjectBones(w) {
      const t = this.objectNodes.get(w);
      if (!t) return [];
      const o = [], n = /* @__PURE__ */ new Set();
      return t.traverse((m) => {
        const s = m.isBone ? m.name : "";
        !s || n.has(s) || o.length >= 256 || (n.add(s), o.push(s));
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
    sampleModelPoint(w, t, o, n = 24) {
      const m = this.objectNodes.get(w);
      if (!m) return null;
      const s = this.models.get(w), i = s?.mixer && s.duration > 0, C = i ? s.mixer.time : null;
      i && (s.mixer.setTime(Math.max(0, o) / Math.max(1, n) % s.duration), m.updateMatrixWorld(!0));
      let g = null;
      if (t) {
        let h = null;
        if (m.traverse((M) => {
          !h && M.isBone && M.name === t && (h = M);
        }), h) {
          const M = new e.Vector3().setFromMatrixPosition(h.matrixWorld);
          g = [M.x, M.y, M.z];
        }
      } else
        g = this.getObjectWorldCenter(w);
      return i && Number.isFinite(C) && (s.mixer.setTime(C), m.updateMatrixWorld(!0)), g;
    },
    getObjectWorldBounds(w) {
      const t = this.objectNodes.get(w);
      if (!t) return null;
      t.updateWorldMatrix(!0, !0);
      const o = new e.Box3().setFromObject(t, !0), n = o.min.toArray(), m = o.max.toArray();
      return !o.isEmpty() && [...n, ...m].every(Number.isFinite) ? { min: n, max: m } : null;
    },
    getObjectWorldCenter(w) {
      const t = this.objectNodes.get(w);
      if (!t) return null;
      t.updateMatrixWorld(!0);
      const o = [];
      if (t.traverse((s) => {
        s.isBone && o.push(s);
      }), o.length > 0) {
        const s = new e.Vector3(), i = new e.Vector3();
        for (const C of o)
          C.getWorldPosition(i), s.add(i);
        return s.divideScalar(o.length), [s.x, s.y, s.z];
      }
      const n = new e.Box3().setFromObject(t);
      if (!n.isEmpty() && Number.isFinite(n.min.x)) {
        const s = n.getCenter(new e.Vector3());
        return [s.x, s.y, s.z];
      }
      const m = new e.Vector3();
      return t.getWorldPosition(m), [m.x, m.y, m.z];
    },
    /** Every bone name in a loaded model, for the Rig Mapper (design spec 23). */
    getModelBoneNames(w) {
      const t = this.objectNodes.get(w);
      if (!t) return [];
      const o = [];
      return t.traverse((n) => {
        n.isBone && n.name && o.push(n.name);
      }), o;
    },
    /** Resolve one loaded bone by name, plus its world position. */
    resolveModelBone(w, t) {
      const o = this.objectNodes.get(w);
      if (!o || !t) return null;
      let n = null;
      if (o.traverse((s) => {
        !n && s.isBone && s.name === t && (n = s);
      }), !n) return null;
      n.updateWorldMatrix(!0, !1);
      const m = new e.Vector3();
      return n.getWorldPosition(m), { name: t, world: [m.x, m.y, m.z] };
    },
    /**
     * Apply an FK pose to a loaded character (design spec section 29,
     * ui.characterRuntime.applyPose). `boneMap` is canonical joint -> bone name;
     * `joints` is canonical joint -> local quaternion [x,y,z,w]. Bones not named
     * by `joints` are left at their bind rotation, captured once per bone.
     */
    applyCharacterPose(w, t, o) {
      const n = this.objectNodes.get(w);
      if (!n) return !1;
      const m = /* @__PURE__ */ new Map();
      if (n.traverse((i) => {
        i.isBone && i.name && m.set(i.name, i);
      }), !m.size) return !1;
      for (const i of m.values())
        i.userData.omnicamBindQuat || (i.userData.omnicamBindQuat = i.quaternion.clone());
      const s = o && typeof o == "object" ? o : {};
      for (const [i, C] of Object.entries(t || {})) {
        const g = m.get(C);
        if (!g) continue;
        const h = s[i];
        Array.isArray(h) && h.length === 4 && h.every(Number.isFinite) ? g.quaternion.fromArray(h).normalize() : g.userData.omnicamBindQuat && g.quaternion.copy(g.userData.omnicamBindQuat), g.updateMatrixWorld(!0);
      }
      return this.invalidate(), !0;
    },
    /**
     * Read the current local rotation of every mapped canonical joint -- what
     * "Bake current frame to pose" samples off the live mixer (design spec
     * section 27). A joint still at its captured bind rotation is omitted.
     */
    sampleCharacterBonePose(w, t) {
      const o = this.objectNodes.get(w);
      if (!o || !t) return {};
      const n = /* @__PURE__ */ new Map();
      o.traverse((s) => {
        s.isBone && s.name && n.set(s.name, s);
      });
      const m = {};
      for (const [s, i] of Object.entries(t)) {
        const C = n.get(i);
        if (!C) continue;
        const g = C.userData.omnicamBindQuat;
        g && C.quaternion.angleTo(g) < 1e-4 || (m[s] = C.quaternion.toArray());
      }
      return m;
    }
  };
}
function Kt(r) {
  const { THREE: e, FBXLoader: f, GLTFLoader: y, OBJLoader: D, PLYLoader: p, STLLoader: v, neutral: x, wire: q, checkerMaterial: j, objectMaterial: k, applyModelMaterial: N, disposeObject: R, textureFor: te, cardMesh: H, generatePointField: ee, sampleCamera: Q, sampleObjectTransform: ae } = r;
  function G(w) {
    const t = w.supersampleFactor?.() || 1;
    return { w: w.canvas.width / t, h: w.canvas.height / t };
  }
  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(w) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: o } = G(this);
      this.pointer.set(w[0] / t * 2 - 1, -(w[1] / o) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const C = wt(i);
        if (C) return { ...C, position: i.object.position.toArray() };
      }
      const n = 16 * Math.min(2, window.devicePixelRatio || 1);
      let m = null;
      const s = new e.Vector3();
      for (const i of this.path.children) {
        const C = i.userData?.omnicamPathKey;
        if (!C || (s.copy(i.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const g = (s.x * 0.5 + 0.5) * t, h = (1 - (s.y * 0.5 + 0.5)) * o, M = Math.hypot(w[0] - g, w[1] - h);
        M <= n && (!m || M < m.distance) && (m = { key: C, position: i.position.toArray(), distance: M });
      }
      return m ? { ...m.key, position: m.position } : null;
    },
    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(w) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: o } = G(this);
      this.pointer.set(w[0] / t * 2 - 1, -(w[1] / o) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const i of this.raycaster.intersectObjects(this.path.children, !0)) {
        const C = pt(i);
        if (C) return { ...C, position: i.object.position.toArray() };
      }
      const n = 14 * Math.min(2, window.devicePixelRatio || 1);
      let m = null;
      const s = new e.Vector3();
      for (const i of this.path.children) {
        const C = i.userData?.omnicamCurveHandle;
        if (!C || (s.copy(i.position).project(this.activeCamera), s.z < -1 || s.z > 1)) continue;
        const g = (s.x * 0.5 + 0.5) * t, h = (1 - (s.y * 0.5 + 0.5)) * o, M = Math.hypot(w[0] - g, w[1] - h);
        M <= n && (!m || M < m.distance) && (m = { handle: C, position: i.position.toArray(), distance: M });
      }
      return m ? { ...m.handle, position: m.position } : null;
    },
    /**
     * The active camera-path segment (two neighbouring real keyframes, plus
     * a `t` 0..1 between them) nearest the pointer, for double-click-to-
     * insert (Task 8). `null` when the pointer isn't over the path tube.
     */
    pickPathSegment(w) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: t, h: o } = G(this);
      this.pointer.set(w[0] / t * 2 - 1, -(w[1] / o) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const n = this.raycaster.intersectObjects(this.path.children, !0).find((u) => u.object.userData?.omnicamPathSegments);
      if (!n) return null;
      const { cameraId: m, firstFrame: s, lastFrame: i, frames: C, points: g } = n.object.userData.omnicamPathSegments;
      if (!g?.length || C.length < 2) return null;
      let h = 0, M = 1 / 0;
      for (let u = 0; u < g.length; u += 1) {
        const [S, l, _] = g[u], O = S - n.point.x, P = l - n.point.y, A = _ - n.point.z, X = O * O + P * P + A * A;
        X < M && (M = X, h = u);
      }
      const c = s + (i - s) * h / Math.max(1, g.length - 1);
      let B = C[0], a = C[C.length - 1];
      for (let u = 0; u < C.length - 1; u += 1)
        if (C[u] <= c && c <= C[u + 1]) {
          B = C[u], a = C[u + 1];
          break;
        }
      if (B === a) return null;
      const L = Math.min(1, Math.max(0, (c - B) / (a - B)));
      return { cameraId: m, leftFrame: B, rightFrame: a, t: L };
    },
    configureCamera(w, t) {
      const o = w || defaultCamera(), n = Math.max(5e-4, Number(o.near) || 0.01), m = Math.max(n + 1, Number(o.far) || 1e4);
      let s;
      if (o.camera_type === "orthographic") {
        s = this.orthographic;
        const c = 5 / Math.max(0.01, o.zoom || 1);
        s.left = -c * t, s.right = c * t, s.top = c, s.bottom = -c, s.near = n, s.far = m, s.updateProjectionMatrix();
      } else
        s = this.perspective, s.fov = e.MathUtils.clamp(Number(o.fov) || 35, 1, 175), s.aspect = t, s.near = n, s.far = m, s.updateProjectionMatrix();
      const i = new e.Vector3().fromArray(o.position || [6, 4, 6]), C = new e.Vector3().fromArray(o.target || [0, 1.5, 0]), g = C.clone().sub(i);
      g.lengthSq() < 1e-6 ? g.set(0, 0, -1) : g.normalize();
      let h = o.up ? new e.Vector3().fromArray(o.up) : new e.Vector3(0, 1, 0), M = new e.Vector3().crossVectors(g, h);
      if (M.lengthSq() < 1e-6 && (h = Math.abs(g.y) > 0.9 ? new e.Vector3(0, 0, g.y > 0 ? -1 : 1) : new e.Vector3(0, 1, 0), M.crossVectors(g, h)), M.normalize(), h.crossVectors(M, g).normalize(), o.roll) {
        const c = e.MathUtils.degToRad(o.roll);
        M.applyAxisAngle(g, c), h.applyAxisAngle(g, c);
      }
      return s.position.copy(i), s.up.copy(h), s.lookAt(C), s.updateMatrixWorld(), s;
    },
    pick(w, t, o, n) {
      if (!this.activeCamera) return null;
      this.pointer.set(w / Math.max(1, o) * 2 - 1, 1 - t / Math.max(1, n) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const m = [];
      if (this.liveCameras && this.liveCameras.visible)
        for (const s of this.raycaster.intersectObjects(this.liveCameras.children, !0))
          s.object?.userData?.omnicamType && m.push({
            distance: s.distance,
            type: s.object.userData.omnicamType,
            id: s.object.userData.omnicamId
          });
      if (this.content && this.content.visible)
        for (const s of this.raycaster.intersectObjects(this.content.children, !0)) {
          if (s.object?.userData?.omnicamCaptureGuide || s.object?.userData?.omnicamHelper) continue;
          let i = s.object;
          for (; i && !i.userData?.omnicamId; ) i = i.parent;
          i?.userData?.omnicamId && m.push({
            distance: s.distance,
            type: "object",
            id: i.userData.omnicamId
          });
        }
      return m.length ? (m.sort((s, i) => s.distance - i.distance), { type: m[0].type, id: m[0].id }) : null;
    },
    /**
     * World point -> logical viewport pixels, for the DOM label overlay
     * (design spec section 14). `behind` is true when the point is outside the
     * near/far clip and the caller should hide its label.
     */
    projectWorldToScreen(w) {
      if (!this.activeCamera || !Array.isArray(w) || w.length < 3) return null;
      const { w: t, h: o } = G(this), n = new e.Vector3(Number(w[0]) || 0, Number(w[1]) || 0, Number(w[2]) || 0);
      return n.project(this.activeCamera), {
        x: (n.x * 0.5 + 0.5) * t,
        y: (1 - (n.y * 0.5 + 0.5)) * o,
        behind: n.z < -1 || n.z > 1,
        width: t,
        height: o
      };
    },
    pickSubElement(w, t, o, n, m = "vertex") {
      if (!this.activeCamera) return null;
      this.pointer.set(w / Math.max(1, o) * 2 - 1, 1 - t / Math.max(1, n) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const s = this.raycaster.intersectObjects(this.content.children, !0);
      for (const i of s) {
        let C = i.object, g = i.object;
        for (; C && !C.userData.omnicamId; ) C = C.parent;
        if (!C?.userData.omnicamId || !g.geometry) continue;
        const h = C.userData.omnicamId, c = g.geometry.getAttribute("position");
        if (!c) continue;
        g.updateMatrixWorld(!0);
        const B = g.matrixWorld;
        if (m === "vertex") {
          let a = -1, L = 1 / 0, u = null;
          if (i.face) {
            const S = [i.face.a, i.face.b, i.face.c];
            for (const l of S) {
              const _ = new e.Vector3(c.getX(l), c.getY(l), c.getZ(l)).applyMatrix4(B), O = _.distanceTo(i.point);
              O < L && (L = O, a = l, u = [_.x, _.y, _.z]);
            }
          } else
            for (let S = 0; S < c.count; S++) {
              const l = new e.Vector3(c.getX(S), c.getY(S), c.getZ(S)).applyMatrix4(B), _ = l.distanceTo(i.point);
              _ < L && (L = _, a = S, u = [l.x, l.y, l.z]);
            }
          if (u)
            return {
              type: "vertex",
              mode: "vertex",
              objectId: h,
              index: a,
              point: u
            };
        }
        if (m === "edge" && i.face) {
          const a = new e.Vector3(c.getX(i.face.a), c.getY(i.face.a), c.getZ(i.face.a)).applyMatrix4(B), L = new e.Vector3(c.getX(i.face.b), c.getY(i.face.b), c.getZ(i.face.b)).applyMatrix4(B), u = new e.Vector3(c.getX(i.face.c), c.getY(i.face.c), c.getZ(i.face.c)).applyMatrix4(B), S = (A, X, F) => {
            const V = new e.Line3(X, F), z = new e.Vector3();
            return V.closestPointToPoint(A, !0, z), { dist: A.distanceTo(z), point: z, segment: [X, F] };
          }, l = S(i.point, a, L), _ = S(i.point, L, u), O = S(i.point, u, a), P = [l, _, O].reduce((A, X) => X.dist < A.dist ? X : A);
          return {
            type: "edge",
            mode: "edge",
            objectId: h,
            point: [P.point.x, P.point.y, P.point.z],
            edge: [
              [P.segment[0].x, P.segment[0].y, P.segment[0].z],
              [P.segment[1].x, P.segment[1].y, P.segment[1].z]
            ]
          };
        }
        if (m === "face" && i.face) {
          const a = new e.Vector3(c.getX(i.face.a), c.getY(i.face.a), c.getZ(i.face.a)).applyMatrix4(B), L = new e.Vector3(c.getX(i.face.b), c.getY(i.face.b), c.getZ(i.face.b)).applyMatrix4(B), u = new e.Vector3(c.getX(i.face.c), c.getY(i.face.c), c.getZ(i.face.c)).applyMatrix4(B), S = new e.Vector3().add(a).add(L).add(u).divideScalar(3), l = i.face.normal.clone().transformDirection(B);
          return {
            type: "face",
            mode: "face",
            objectId: h,
            faceIndex: i.faceIndex,
            point: [S.x, S.y, S.z],
            normal: [l.x, l.y, l.z],
            vertices: [
              [a.x, a.y, a.z],
              [L.x, L.y, L.z],
              [u.x, u.y, u.z]
            ]
          };
        }
      }
      return null;
    },
    intersectScenePoint(w, t, o, n) {
      if (!this.activeCamera) return null;
      this.pointer.set(w / Math.max(1, o) * 2 - 1, 1 - t / Math.max(1, n) * 2), this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const m = this.raycaster.intersectObjects(this.content.children, !0);
      if (m.length > 0)
        return [m[0].point.x, m[0].point.y, m[0].point.z];
      const s = new e.Plane(new e.Vector3(0, 1, 0), 0), i = new e.Vector3();
      return this.raycaster.ray.intersectPlane(s, i) ? [i.x, i.y, i.z] : null;
    }
  };
}
const ge = ["high", "balanced", "low"], Yt = 25, ke = 30, Ht = 0.6;
function Oe(r = "balanced") {
  return { quality: r, samples: [], downgraded: !1 };
}
function Qt(r) {
  const e = ge.indexOf(r);
  return e < 0 || e >= ge.length - 1 ? null : ge[e + 1];
}
function Zt(r, e) {
  if (!Number.isFinite(e) || e < 0 || (r.samples.push(e), r.samples.length > ke && r.samples.shift(), r.samples.length < ke) || r.samples.filter((D) => D > Yt).length / r.samples.length < Ht) return null;
  const y = Qt(r.quality);
  return y ? (r.quality = y, r.downgraded = !0, r.samples = [], y) : null;
}
function Jt(r, e) {
  return r.quality = e, r.samples = [], r.downgraded = !1, r;
}
function Et(r) {
  const { THREE: e, FBXLoader: f, GLTFLoader: y, OBJLoader: D, PLYLoader: p, STLLoader: v, neutral: x, wire: q, checkerMaterial: j, objectMaterial: k, applyModelMaterial: N, disposeObject: R, textureFor: te, cardMesh: H, generatePointField: ee, sampleCamera: Q, sampleObjectTransform: ae, hasOutlineMesh: G, SelectionOutlineRenderer: w } = r;
  return {
    render(t, o, n, m, s, i = /* @__PURE__ */ new Map(), C = 0, g = !1, h = "camera", M = "subject", c = null, B = null, a = null) {
      const L = !g || (t.render_mode || "") === "beauty";
      if (L !== this.studioEnabled) {
        this.studioEnabled = L, Ue(e, this.scene, this.renderer, this.studio, L);
        for (const d of this.flatLights || []) d.visible = !L;
      }
      const u = !!t.objects?.some((d) => d.type === "sun_light" && d.enabled !== !1);
      if (this.studio?.key && (this.studio.key.visible = !u && L), this.flatLights?.[1] && (this.flatLights[1].visible = !u && !L), this.disposed) return;
      (this.canvas.width !== m || this.canvas.height !== s) && this.renderer.setSize(m, s, !1);
      const S = (o && o.camera_type === "orthographic") === !0;
      this.renderer.setClearColor(0, 1);
      const l = t.viewport_bg_sequence && t.viewport_bg_sequence.length ? t.viewport_bg_sequence[C % t.viewport_bg_sequence.length] : t.viewport_bg_image || "";
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
              const T = [...this.bgTextureCache.keys()].find((se) => se !== this.bgImageUrl);
              if (!T) break;
              const Y = this.bgTextureCache.get(T);
              this.bgTextureCache.delete(T), Y?.dispose?.();
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
        const d = t.viewport_bg_color && t.viewport_bg_color !== Ve;
        this.scene.background = this.studioEnabled && !d && !S ? this.studio.sky : new e.Color(d ? t.viewport_bg_color : this.studioEnabled && S ? 1447709 : Ve);
      }
      const _ = JSON.stringify([
        t.render_mode,
        t.card_fit,
        t.point_density,
        t.point_spread,
        !!t.show_wireframe,
        !!t.show_vertices,
        !!t.backface_culling,
        t.reconstruction_appearance || "neutral",
        !!g,
        t.objects.map((d) => {
          const { position: b, rotation: W, keyframes: I, size: T, ...Y } = d;
          return d.type === "card" && (Y.size = T), Y;
        })
      ]), O = [...n.entries()].map(([d, b]) => `${d}:${b?.src || ""}`).join("|"), P = [...i.entries()].map(([d, b]) => `${d}:${b}`).join("|");
      (_ !== this.sceneKey || O !== this.mediaSignature || P !== this.modelSignature) && (this.sceneKey = _, this.mediaSignature = O, this.modelSignature = P, this.rebuild(t, n, i, g));
      const A = Math.max(1, t.fps || 24), X = /* @__PURE__ */ new Map();
      for (const d of t.objects)
        d.character?.motion && this.models.has(d.id) && X.set(d.id, d.character.motion);
      for (const [d, b] of this.models) {
        if (!b.mixer || !(b.duration > 0)) continue;
        const W = X.get(d);
        W ? (this.applyMotionClip?.(d, W), b.mixer.setTime(gt(W, C, A, b.duration))) : b.mixer.setTime(C / A % b.duration);
      }
      for (const d of t.objects) {
        const b = this.objectNodes.get(d.id);
        if (!b) continue;
        const W = d.keyframes?.length ? ae(d, C) : d;
        b.position.fromArray(W.position || [0, 0, 0]), b.rotation.set(...(W.rotation || [0, 0, 0]).map(e.MathUtils.degToRad)), d.type !== "card" && d.type !== "null" && b.scale.fromArray(W.size || [1, 1, 1]), d.type === "null" && (b.visible = g ? !0 : t.show_helper_axes !== !1);
      }
      this.path.visible = !g;
      const F = t.show_grid !== !1 && t.render_mode !== "point_field";
      this.content.traverse((d) => {
        d.userData.omnicamCaptureGuide && (d.visible = g ? !!t.playblast_grid : F);
      });
      const V = t.view_mode || "camera", z = Array.isArray(a) ? [...a].sort((d, b) => d - b).join(",") : "", U = `${V}:${h}:${B ?? ""}:${z}:${t.__omnicamRevision ?? JSON.stringify([
        t.active_camera_id,
        (t.cameras || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((b) => [b.frame, b.camera?.position, b.camera?.target, b.interpolation, b.tangents])]),
        (t.objects || []).map((d) => [d.id, d.keyframes?.length, d.keyframes?.map((b) => [b.frame, b.transform?.position])])
      ])}`;
      if (U !== this.pathKey && (this.pathKey = U, this.rebuildPath(t, h, B, V, a)), this.updateLiveCameras(t, C, g, V, h, B), this.liveCameras.visible = !g, !g) {
        const d = t.show_camera_paths !== !1, b = t.show_camera_gizmos !== !1, W = t.show_look_at !== !1;
        for (const I of [this.path, this.liveCameras])
          I.traverse((T) => {
            const Y = T.userData.omnicamWidget;
            Y === "path" ? T.visible = d : Y === "gizmo" ? T.visible = b : Y === "lookat" && (T.visible = W);
          });
      }
      const K = m / Math.max(1, s), $ = this.configureCamera(o, K);
      if (this.activeCamera = $, g ? this.selectionGroup.visible = !1 : (this.updateSelection(t, h, M, c, `${t.__omnicamRevision ?? "legacy"}:${C}`, S), this.selectionGroup.visible = !0), this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
        this.contentShadowKey = this.sceneKey;
        const d = new e.Box3();
        this.content.traverse((W) => {
          if (!W.isMesh || W.userData.omnicamCaptureGuide) return;
          W.castShadow = !0, W.receiveShadow = !0, W.updateWorldMatrix(!0, !1);
          const I = new e.Box3().setFromObject(W);
          !I.isEmpty() && Number.isFinite(I.min.x) && d.union(I);
        });
        const b = this.studio?.key;
        if (b) {
          const W = d.isEmpty() ? new e.Vector3() : d.getCenter(new e.Vector3()), I = d.isEmpty() ? new e.Vector3(12, 12, 12) : d.getSize(new e.Vector3()), T = Math.max(1, 0.5 * Math.max(I.x, I.y, I.z) * Math.SQRT2), Y = T * 1.15 + 0.5, se = new e.Vector3(4.5, 7.5, 3.5).normalize(), E = Math.max(12, T * 4);
          b.position.copy(W).addScaledVector(se, E), b.target.position.copy(W), b.target.updateMatrixWorld(!0);
          const re = b.shadow.camera;
          re.left = -Y, re.right = Y, re.top = Y, re.bottom = -Y, re.near = Math.max(0.1, E - T - 1), re.far = E + T + 1, re.updateProjectionMatrix(), b.shadow.map?.dispose(), b.shadow.map = null;
        }
      }
      this.content.visible = !0, this.path.traverse((d) => {
        d.userData.omnicamBillboard && d.quaternion.copy($.quaternion);
      }), this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, m, s);
      const J = performance.now();
      let Z = !1;
      if (!g && !S && h === "object" && (M || t.__selectedObjectIds?.length) && !c) {
        const d = t.__selectedObjectIds?.length ? t.__selectedObjectIds : M ? [M] : [], b = [];
        for (const W of d) {
          const I = this.objectNodes.get(W);
          I && G(I) && b.push(I);
        }
        b.length && (this.outlineRenderer || (this.outlineRenderer = new w(this.renderer, this.scene, void 0, $)), this.outlineRenderer.render($, m, s, b), Z = !0);
      }
      if (Z || this.renderer.render(this.scene, $), !g && this.adaptiveQuality !== !1) {
        this.qualityMonitor ||= Oe(this.studio?.quality);
        const d = Zt(this.qualityMonitor, performance.now() - J);
        d && (Pe(this.studio, this.renderer, d), this.onQualityDowngrade?.(d));
      }
    },
    setViewportQuality(t) {
      Pe(this.studio, this.renderer, t), this.qualityMonitor = Jt(this.qualityMonitor || Oe(t), t);
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
const er = {
  EffectComposer: Qe,
  OutlinePass: He,
  OutputPass: Ye,
  RenderPass: Ke,
  Vector2: Fe
};
function tr(r) {
  let e = !1;
  return r?.traverse?.((f) => {
    e || f.visible === !1 || !f.isMesh || f.userData?.omnicamHelper || f.userData?.omnicamCaptureGuide || (e = !!(f.geometry && f.material));
  }), e;
}
class rr {
  constructor(e, f, y = er, D = null) {
    const { EffectComposer: p, RenderPass: v, OutlinePass: x, OutputPass: q, Vector2: j } = y;
    this.disposed = !1, this.width = 0, this.height = 0, this.composer = new p(e), this.renderPass = new v(f, D), this.outlinePass = new x(new j(1, 1), f, D, []), this.outlinePass.visibleEdgeColor.set(9133302), this.outlinePass.hiddenEdgeColor.set(3223169), this.outlinePass.edgeGlow = 0, this.outlinePass.edgeStrength = 4, this.outlinePass.edgeThickness = 1, this.outputPass = new q(), this.composer.addPass(this.renderPass), this.composer.addPass(this.outlinePass), this.composer.addPass(this.outputPass);
  }
  render(e, f, y, D) {
    this.disposed || ((f !== this.width || y !== this.height) && (this.width = f, this.height = y, this.composer.setSize(f, y)), this.renderPass.camera = e, this.outlinePass.renderCamera = e, this.outlinePass.selectedObjects = [...D], this.composer.render(0));
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.renderPass.dispose?.(), this.outlinePass.dispose?.(), this.outputPass.dispose?.(), this.composer.dispose());
  }
}
const Te = { low: Ot, balanced: kt, high: At }, de = new ve({ color: 10265519, roughness: 0.48, metalness: 0.06, side: oe }), Xe = new ve({ color: 2237998, roughness: 0.95, metalness: 0, side: oe }), Be = new Me({ color: 11449792, wireframe: !0, side: oe });
function Le(r = !1) {
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
  ]), f = new dt(e, 2, 2, ut);
  return f.wrapS = f.wrapT = mt, f.repeat.set(8, 8), f.colorSpace = be, f.needsUpdate = !0, new ve({ map: f, roughness: 0.85, metalness: 0, side: r ? Ce : oe });
}
function or(r, e, f = !1) {
  const y = e === "wireframe" ? "wireframe" : r.material_mode || "textured", D = f ? Ce : oe;
  if (y === "wireframe") {
    const v = Be.clone();
    return v.side = D, r.color && (v.color = new ce(r.color)), v;
  }
  if (y === "checker") return Le(f);
  if (y === "matte") {
    const v = Xe.clone();
    return v.side = D, r.color && (v.color = new ce(r.color)), v;
  }
  const p = de.clone();
  return p.side = D, r.color && (p.color = new ce(r.color)), p;
}
function ar(r, e, f = null, y = !1) {
  const D = y ? Ce : oe;
  r.traverse((p) => {
    if (p.isMesh) {
      if (p.userData.omnicamOriginalMaterial || (p.userData.omnicamOriginalMaterial = p.material), p.userData.omnicamOverrideMaterial) {
        const v = Array.isArray(p.material) ? p.material : [p.material];
        for (const x of v)
          x?.map?.dispose?.(), x?.dispose?.();
        p.userData.omnicamOverrideMaterial = !1;
      }
      if (e === "textured" || e === "wireframe_texture") {
        p.material = p.userData.omnicamOriginalMaterial;
        const v = Array.isArray(p.material) ? p.material : [p.material];
        for (const x of v)
          x && (x.side = D);
      } else if (e === "checker")
        p.material = Le(y), p.userData.omnicamOverrideMaterial = !0;
      else if (e === "wireframe") {
        const v = Be.clone();
        v.side = D, f?.color && (v.color = new ce(f.color)), p.material = v, p.userData.omnicamOverrideMaterial = !0;
      } else if (e === "matte") {
        const v = Xe.clone();
        v.side = D, f?.color && (v.color = new ce(f.color)), p.material = v, p.userData.omnicamOverrideMaterial = !0;
      } else {
        const v = de.clone();
        v.side = D, f?.color && (v.color = new ce(f.color)), p.material = v, p.userData.omnicamOverrideMaterial = !0;
      }
    }
  });
}
function xe(r, e = !1) {
  r.traverse((f) => {
    if (f.userData.omnicamModelResource && !e) return;
    f.geometry?.dispose?.();
    const y = Array.isArray(f.material) ? f.material : [f.material];
    for (const D of y)
      D?.map?.dispose?.(), D?.dispose?.();
  });
}
function $e(r) {
  if (!r) return null;
  const e = r instanceof HTMLVideoElement ? new ht(r) : new ft(r);
  return e.colorSpace = be, e.needsUpdate = !0, e;
}
function sr(r, e, f) {
  const [y, D] = r.size || [2, 3], p = new ie(), v = new he(new De(y, D), new Me({ color: 1448482, side: oe, transparent: !0, opacity: 0.85 }));
  v.frustumCulled = !1, p.add(v);
  const x = $e(e);
  if (!x) return p;
  const q = e.videoWidth || e.naturalWidth || e.width || y, j = e.videoHeight || e.naturalHeight || e.height || D, k = q / Math.max(1, j), N = y / Math.max(0.01, D);
  let R = y, te = D;
  f === "contain" ? k > N ? te = y / k : R = D * k : f === "cover" && (k > N ? (x.repeat.x = N / k, x.offset.x = (1 - x.repeat.x) * 0.5) : (x.repeat.y = k / N, x.offset.y = (1 - x.repeat.y) * 0.5));
  const H = new he(
    new De(R, te),
    new Me({
      color: 16777215,
      map: x,
      side: oe,
      transparent: !0,
      alphaTest: 0.01,
      depthWrite: !0
    })
  );
  return H.frustumCulled = !1, H.position.z = 2e-3, p.add(H), p.frustumCulled = !1, p;
}
class nr {
  constructor(e = () => {
  }, f = () => {
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
    const y = new tt(16777215, 2.4);
    y.position.set(5, 8, 4), this.scene.add(y), this.flatLights = [this.scene.children.at(-2), y], this.studio = Bt(ye, this.renderer, St), this.scene.add(this.studio.group), this.studioEnabled = !0, Ue(ye, this.scene, this.renderer, this.studio, !0), this.content = new ie(), this.scene.add(this.content), this.path = new ie(), this.scene.add(this.path), this.liveCameras = new ie(), this.scene.add(this.liveCameras), this.selectionGroup = new ie(), this.scene.add(this.selectionGroup), this.selectionKey = "", this.perspective = new rt(35, 16 / 9, 0.01, 1e4), this.orthographic = new ot(-5, 5, 2.8125, -2.8125, 0.01, 1e4), this.sceneKey = "", this.mediaSignature = "", this.bgImageUrl = "", this.bgTexture = null, this.bgTextureCache = /* @__PURE__ */ new Map(), this.bgTextureLoads = /* @__PURE__ */ new Map(), this.bgLoadGeneration = 0, this.disposed = !1, this.invalidate = e, this.onModelLoaded = f, this.modelUrls = /* @__PURE__ */ new Map(), this.models = /* @__PURE__ */ new Map(), this.modelLoads = /* @__PURE__ */ new Map(), this.objectNodes = /* @__PURE__ */ new Map(), this.raycaster = new at(), this.pointer = new Fe(), this.activeCamera = this.perspective;
  }
  async loadModel(e, f, y = "glb") {
    const D = `${y}:${f}`;
    if (!(!f || this.modelLoads.get(e) === D)) {
      this.modelLoads.set(e, D);
      try {
        let p, v = [];
        if (y === "obj") p = await new ze().loadAsync(f);
        else if (y === "fbx")
          p = await new je().loadAsync(f), v = p.animations || [];
        else if (y === "stl") p = new he(await new We().loadAsync(f), de.clone());
        else if (y === "ply") {
          const o = await new Ie().loadAsync(f);
          o.index ? (o.getAttribute("normal") || o.computeVertexNormals(), p = new he(o, de.clone())) : p = new st(o, new nt({ color: 11449792, size: 0.025 }));
        } else {
          const o = await new Ne().loadAsync(f);
          p = o.scene, v = o.animations || [];
        }
        if (this.disposed || this.modelLoads.get(e) !== D) {
          xe(p, !0);
          return;
        }
        const x = this.models.get(e);
        x && xe(x.scene, !0), p.traverse((o) => {
          if (o.userData.omnicamModelResource = !0, o.frustumCulled = !1, o.isMesh && (o.frustumCulled = !1, o.material)) {
            const n = Array.isArray(o.material) ? o.material : [o.material];
            for (const m of n)
              m.side = oe;
          }
          o.isPoints && (o.frustumCulled = !1), o.isSkinnedMesh && (o.frustumCulled = !1, o.computeBoundingBox?.(), o.computeBoundingSphere?.());
        });
        let q = 0, j = 0, k = 0, N = 0;
        p.traverse((o) => {
          o.isMesh && (q += 1, N += o.geometry?.getAttribute?.("position")?.count || 0), o.isPoints && (j += 1), o.isBone && (k += 1);
        });
        const R = new ie();
        if (R.frustumCulled = !1, R.add(p), !q && !j && k) {
          const o = new it(p);
          o.material.depthTest = !1, o.material.opacity = 0.9, o.material.transparent = !0, o.renderOrder = 10, o.userData.omnicamModelResource = !0, R.add(o);
        }
        R.updateMatrixWorld(!0);
        const te = new ct().setFromObject(R), H = te.getSize(new Ge()), ee = Math.max(H.x, H.y, H.z), Q = Number.isFinite(ee) && ee > 1e-6 ? 2.5 / ee : 1, ae = te.getCenter(new Ge());
        R.scale.setScalar(Q), R.position.set(-ae.x * Q, -te.min.y * Q, -ae.z * Q);
        const G = new ie();
        G.frustumCulled = !1, G.add(R);
        const w = v.length ? new lt(p) : null;
        w && w.clipAction(v[0]).play();
        const t = { url: f, format: y, scene: G, mixer: w, clips: v, selectedClip: 0, duration: v[0]?.duration || 0, meshes: q, points: j, bones: k, vertices: N, animations: v.length, normalizationScale: Q };
        this.models.set(e, t), this.onModelLoaded({ id: e, format: y, meshes: q, points: j, bones: k, vertices: N, animations: v.length, animationNames: v.map((o, n) => o.name || `Clip ${n + 1}`), duration: t.duration, normalizationScale: Q }), this.sceneKey = "", this.invalidate();
      } catch (p) {
        this.modelLoads.get(e) === D && this.modelLoads.delete(e), console.warn(`OmniCam could not load ${y.toUpperCase()} ${e}`, p);
        const v = p?.message?.includes("FBX version not supported") || p?.message?.includes("6100") || p?.message?.includes("6000"), x = v ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB" : p?.message || "Erreur de format 3D";
        this.onModelLoaded({ id: e, format: y, error: x, isLegacyFBX: v });
      }
    }
  }
}
const ue = { THREE: ye, FBXLoader: je, GLTFLoader: Ne, OBJLoader: ze, PLYLoader: Ie, STLLoader: We, neutral: de, wire: Be, checkerMaterial: Le, objectMaterial: or, applyModelMaterial: ar, disposeObject: xe, textureFor: $e, cardMesh: sr, generatePointField: yt, sampleCamera: Mt, sampleObjectTransform: xt, hasOutlineMesh: tr, SelectionOutlineRenderer: rr };
Object.assign(
  nr.prototype,
  Xt(ue),
  $t(ue),
  Kt(ue),
  Et(ue)
);
async function ir(r, e) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const f of ["vp9", "vp8"])
    try {
      if (await me(Tt(f, { width: r, height: e }), 5e3, `Checking ${f} support`)) return f;
    } catch {
    }
  return null;
}
function me(r, e, f) {
  let y;
  return Promise.race([
    r,
    new Promise((D, p) => {
      y = setTimeout(() => p(new Error(`${f} timed out`)), e);
    })
  ]).finally(() => clearTimeout(y));
}
async function fr(r, e, f, y, D, p = "balanced") {
  const v = await ir(r.width, r.height);
  if (!v) throw new Error("No supported WebCodecs WebM encoder");
  const x = new Gt({ format: new Pt(), target: new Dt() }), q = new Vt(r, { codec: v, quality: Te[p] || Te.balanced, keyFrameInterval: 1 });
  x.addVideoTrack(q, { frameRate: f }), await me(x.start(), 1e4, "Starting deterministic encoder");
  try {
    const j = 1 / f;
    for (let k = 0; k < e; k++) {
      if (D?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await y(k), await me(q.add(k * j, j, { keyFrame: k % f === 0 }), 1e4, `Encoding frame ${k + 1}`);
    }
    await me(x.finalize(), 2e4, "Finalizing deterministic playblast");
  } catch (j) {
    throw x.state !== "finalized" && await x.cancel().catch(() => {
    }), j;
  }
  return Lt(new Blob([x.target.buffer], { type: await x.getMimeType() }), {
    encoder: "webcodecs",
    requestedFrames: e,
    expectedDurationMs: e / f * 1e3,
    recordedDurationMs: e / f * 1e3,
    driftMs: 0,
    fps: f,
    width: r.width,
    height: r.height
  });
}
export {
  nr as OmniWebGLViewport,
  fr as encodeDeterministicPlayblast,
  ir as supportsDeterministicEncoding
};
