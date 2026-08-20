import { sampleObjectTransform as $, sampleCamera as I, norm as S, sub as P, length as k, add as z, mul as E, rotateEuler as Y, project as w, cross as K, distanceToSegment as X } from "./omnicam-core.js";
import { t as M } from "./omnicam-i18n.js";
import { cameraBasis as F, length as _, sub as j, cloneCamera as L, defaultEditorViews as V, add as h, mul as b, rotateEuler as B, clamp as O } from "./omnicam-core.js";
import { onKeyDragMove as q } from "./omnicam-timeline-interaction.js";
function Z(e, a) {
  if (a.target?.closest?.("button,input,select")) return;
  a.preventDefault?.(), a.stopPropagation?.(), e.closeMenus(), e.interactionElement.focus({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(a.pointerId), e.activePointerId = a.pointerId, e.canvas.classList.add("dragging");
  const c = e.interactionElement.getBoundingClientRect(), n = (a.clientX - c.left) * e.canvas.width / Math.max(1, c.width), s = (a.clientY - c.top) * e.canvas.height / Math.max(1, c.height), o = C(e), m = e.state.view_mode !== "camera", i = G(e, [n, s]);
  if (i) {
    const [l, f] = i.segment, p = Math.max(1, Math.hypot(f[0] - l[0], f[1] - l[1])), D = {
      pointer: [n, s],
      axis: i.axis,
      axisIndex: i.index,
      screen: [(f[0] - l[0]) / p, (f[1] - l[1]) / p],
      worldLength: i.worldLength,
      screenLength: p
    };
    if (i.entity.type === "camera_target") {
      e.beginCameraEdit(), e.gizmoDrag = {
        ...D,
        type: "camera_target",
        target: [...i.entity.position || e.camera.target]
      };
      return;
    }
    if (i.entity.type === "camera") {
      e.beginCameraEdit(), e.gizmoDrag = {
        ...D,
        type: "camera",
        position: [...i.entity.position || e.camera.position],
        target: [...e.camera.target]
      };
      return;
    }
    if (i.entity.type === "object") {
      const x = i.entity.object;
      e.beginObjectEdit(x), e.gizmoDrag = {
        ...D,
        type: "object",
        object: x,
        position: [...i.entity.position],
        rotation: [...i.entity.rotation],
        size: [...i.entity.size]
      };
      return;
    }
  }
  const r = W(e, [n, s]);
  if (e.pointerHit = !!(i || r), r) {
    if (r.type === "camera_keyframe") {
      e.selectedEntity = "camera", e.selectedObjectId = null, e.activateCamera(r.camera.id), e.setFrame(r.keyframe.frame), e.selectKeyframe(r.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(t(`${r.camera.name} · Keyframe @ F${r.keyframe.frame} selected`));
      return;
    }
    if (r.type === "camera_target") {
      e.selectedEntity = "camera_target", e.selectedObjectId = null, e.activateCamera(r.camera.id), e.beginCameraEdit();
      const { right: l, up: f } = F(o), p = [...e.camera.target], D = _(j(o.position, p)), x = (o.fov || 35) * Math.PI / 360;
      e.targetFreeDrag = {
        pointer: [n, s],
        target: p,
        right: l,
        up: f,
        scale: D * (o.camera_type === "orthographic" ? 25e-4 : 2 * Math.tan(x) / e.canvas.height)
      }, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(t(`${r.camera.name} · Target aim selected`));
      return;
    }
    if (r.type === "camera") {
      e.selectedEntity = "camera", e.selectedObjectId = null, e.activateCamera(r.camera.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(t(`${r.camera.name} selected`));
      return;
    }
    if (r.type === "object" && r.object) {
      if (e.selectedEntity = "object", e.selectedObjectId = r.object.id, e.selectedKeyFrame = r.object.keyframes?.find((l) => l.frame === e.frame)?.frame ?? null, e.state.select_mode && e.state.select_mode !== "object") {
        const l = e.webgl?.pickSubElement?.(n, s, e.canvas.width, e.canvas.height, e.state.select_mode);
        if (l) {
          e.subSelection = l;
          const f = l.point.map((D) => Math.round(D * 100) / 100).join(", "), p = l.mode === "vertex" ? "Vertex" : l.mode === "edge" ? "Edge" : "Face";
          e.setStatus(t(`${p} selected at [${f}] · Press F to focus`));
        } else
          e.subSelection = null;
      } else
        e.subSelection = null;
      e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
    }
  }
  const g = e.selectedObject(), d = g ? project(g.position || [0, 0, 0], o, e.canvas.width, e.canvas.height) : null;
  if (a.altKey && !a.shiftKey && d && Math.hypot(n - d[0], s - d[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1)) {
    e.beginObjectEdit(g), e.objectDrag = { x: a.clientX, y: a.clientY, position: [...g.position], camera: L(o), object: g };
    return;
  }
  const y = a.button === 1 || a.altKey && a.button === 1 || a.shiftKey && (a.button === 0 || a.button === 1) || o.camera_type === "orthographic", v = a.button === 2 || a.altKey && a.button === 2;
  m || e.beginCameraEdit(), m && !e.state.editor_views && (e.state.editor_views = V()), e.drag = {
    x: a.clientX,
    y: a.clientY,
    shift: y,
    dolly: v,
    camera: L(o),
    target: m ? e.state.editor_views[e.state.view_mode] || (e.state.editor_views[e.state.view_mode] = V()[e.state.view_mode]) : e.camera,
    editorView: m
  };
}
function u(e, a) {
  if (e.keyDrag) {
    q(e, a);
    return;
  }
  if (e.targetFreeDrag) {
    const o = e.interactionElement.getBoundingClientRect(), m = (a.clientX - o.left) * e.canvas.width / Math.max(1, o.width), i = (a.clientY - o.top) * e.canvas.height / Math.max(1, o.height), r = m - e.targetFreeDrag.pointer[0], g = i - e.targetFreeDrag.pointer[1], d = h(b(e.targetFreeDrag.right, r * e.targetFreeDrag.scale), b(e.targetFreeDrag.up, -g * e.targetFreeDrag.scale));
    e.camera.target = h(e.targetFreeDrag.target, d), e.commitCameraEdit(), e.refreshInspector(), e.render();
    return;
  }
  if (e.gizmoDrag) {
    const o = e.interactionElement.getBoundingClientRect(), m = [
      (a.clientX - o.left) * e.canvas.width / Math.max(1, o.width),
      (a.clientY - o.top) * e.canvas.height / Math.max(1, o.height)
    ], i = (m[0] - e.gizmoDrag.pointer[0]) * e.gizmoDrag.screen[0] + (m[1] - e.gizmoDrag.pointer[1]) * e.gizmoDrag.screen[1];
    if (e.gizmoDrag.type === "camera_target") {
      e.camera.target = h(e.gizmoDrag.target, b(e.gizmoDrag.axis, i * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength)), e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.gizmoDrag.type === "camera") {
      if (e.state.gizmo_mode === "translate")
        e.camera.position = h(e.gizmoDrag.position, b(e.gizmoDrag.axis, i * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
      else {
        const r = i * 0.015, g = j(e.gizmoDrag.target, e.gizmoDrag.position), d = B(g, b(e.gizmoDrag.axis, r * (180 / Math.PI)));
        e.camera.target = h(e.gizmoDrag.position, d);
      }
      e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.state.gizmo_mode === "translate")
      e.gizmoDrag.object.position = h(e.gizmoDrag.position, b(e.gizmoDrag.axis, i * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
    else if (e.state.gizmo_mode === "scale") {
      const r = [...e.gizmoDrag.size];
      r[e.gizmoDrag.axisIndex] = Math.max(0.01, r[e.gizmoDrag.axisIndex] + i * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength), e.gizmoDrag.object.size = r;
    } else {
      const r = [...e.gizmoDrag.rotation];
      r[e.gizmoDrag.axisIndex] += i * 0.75, e.gizmoDrag.object.rotation = r;
    }
    e.commitObjectEdit(e.gizmoDrag.object), e.refreshInspector(), e.render();
    return;
  }
  if (e.objectDrag) {
    const o = a.clientX - e.objectDrag.x, m = a.clientY - e.objectDrag.y, { right: i, up: r } = F(e.objectDrag.camera), g = _(j(e.objectDrag.camera.position, e.objectDrag.position)) * 25e-4;
    e.objectDrag.object.position = h(e.objectDrag.position, h(b(i, o * g), b(r, -m * g))), e.commitObjectEdit(e.objectDrag.object), e.refreshInspector(), e.render();
    return;
  }
  if (!e.drag) return;
  const c = a.clientX - e.drag.x, n = a.clientY - e.drag.y, s = e.drag.camera;
  if (e.drag.dolly) {
    const o = Math.exp(n * 5e-3), m = j(s.position, s.target);
    e.drag.target.position = h(s.target, b(m, o)), e.drag.target.camera_type === "orthographic" && (e.drag.target.zoom = Math.max(0.01, (s.zoom || 1) / o));
  } else if (e.drag.shift) {
    const { right: o, up: m } = F(s), i = _(j(s.position, s.target)) * 25e-4, r = h(b(o, -c * i), b(m, n * i));
    e.drag.target.position = h(s.position, r), e.drag.target.target = h(s.target, r);
  } else {
    const o = j(s.position, s.target), m = _(o);
    let i = Math.atan2(o[0], o[2]), r = Math.asin(O(o[1] / m, -0.999, 0.999));
    i -= c * 8e-3, r = O(r + n * 8e-3, -1.45, 1.45), e.drag.target.position = [
      s.target[0] + m * Math.sin(i) * Math.cos(r),
      s.target[1] + m * Math.sin(r),
      s.target[2] + m * Math.cos(i) * Math.cos(r)
    ];
  }
  e.drag.editorView ? (e.serialize(), e.render()) : e.commitCameraEdit();
}
function tt(e, a) {
  const c = e.keyDrag, n = !!(e.drag && !e.drag.editorView || e.targetFreeDrag), s = !!(e.gizmoDrag || e.objectDrag);
  !e.pointerHit && !e.gizmoDrag && !e.objectDrag && !e.targetFreeDrag && e.drag && a && Math.hypot(a.clientX - e.drag.x, a.clientY - e.drag.y) < 5 && (e.selectedEntity === "object" || e.selectedObjectId !== null || e.selectedEntity === "camera_target") && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(t("Deselected"))), a?.pointerId === e.activePointerId && e.interactionElement.hasPointerCapture?.(a.pointerId) && e.interactionElement.releasePointerCapture(a.pointerId), e.activePointerId = null, e.drag = null, e.objectDrag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.keyDrag = null, e.pointerHit = !1, e.canvas.classList.remove("dragging"), c && (c.badge?.remove(), e.editingKeyFrame = null, e.updateKeyVisualState(), e.root.focus({ preventScroll: !0 })), n && e.finishCameraEdit(), s && (e.editingKeyFrame = null, e.updateKeyVisualState(), e.drawCurveEditor());
}
function et(e, a) {
  if (a.target.closest?.(".viewport-inspector, .scene-tree, .menu-panel, .context-menu, .viewport-quick-bar"))
    return;
  a.preventDefault(), a.stopPropagation(), e.closeMenus();
  const c = e.state.view_mode !== "camera", n = C(e);
  c || e.beginCameraEdit();
  const s = O(a.deltaY * 1e-3, -0.4, 0.4), o = j(n.position, n.target);
  n.position = h(n.target, b(o, Math.exp(s))), n.camera_type === "orthographic" && (n.zoom = Math.max(0.01, (n.zoom || 1) * Math.exp(-s))), c ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit());
}
function C(e) {
  return e.recording ? e.playblastCameraAtFrame() : e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode];
}
function at(e, a) {
  if (["camera", "perspective", "top", "right", "left", "bottom"].includes(a)) {
    e.state.view_mode = a;
    for (const c of e.root.querySelectorAll('[data-role="view-mode"]')) c.value = a;
    e.serialize(), e.render(), e.setStatus(M(`View: ${a[0].toUpperCase()}${a.slice(1)}`));
  }
}
function rt(e, a) {
  if (["translate", "rotate", "scale"].includes(a)) {
    e.state.gizmo_mode = a;
    for (const c of e.root.querySelectorAll("[data-transform-mode]")) {
      const n = c.dataset.transformMode === a;
      c.classList.toggle("active", n), c.setAttribute("aria-pressed", String(n));
    }
    e.serialize(), e.render(), e.setStatus(M(`${a[0].toUpperCase()}${a.slice(1)} · ${a === "translate" ? "W" : a === "rotate" ? "E" : "R"}`));
  }
}
function ot(e, a) {
  e.camera = a();
  const c = e.root.querySelector('[data-role="fov"]');
  c && (c.value = String(e.camera.fov));
  const n = e.root.querySelector('[data-role="roll"]');
  n && (n.value = String(e.camera.roll));
  const s = e.root.querySelector('[data-role="camera-type"]');
  s && (s.value = e.camera.camera_type), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.setStatus(M("Camera reset"));
}
function nt(e) {
  const a = C(e), c = e.state.view_mode !== "camera", n = [...a.target];
  if (e.subSelection?.point) {
    const l = e.subSelection.point, f = S(P(a.position, n)), p = Number.isFinite(f[0]) && k(f) > 0.1 ? f : [0.707, 0.4, 0.707], D = 2;
    a.target = [...l], a.position = z(a.target, E(p, D)), c ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit());
    const x = e.subSelection.mode === "vertex" ? "Vertex" : e.subSelection.mode === "edge" ? "Edge" : "Face";
    e.setStatus(M(`Focused on ${x} at [${l.map((T) => Math.round(T * 100) / 100).join(", ")}]`));
    return;
  }
  const o = e.selectedObject() || e.state.objects.find((l) => l.id === "subject") || e.state.objects[0] || { position: [0, 1.5, 0], size: [2, 3] }, m = o.size || [1, 1, 1], i = Math.max(m[0] || 1, m[1] || 1, m[2] || 1), r = (a.fov || 35) * Math.PI / 360, g = Math.max(2, i / Math.max(0.1, Math.tan(r)) * 0.9), d = S(P(a.position, n)), y = Number.isFinite(d[0]) && k(d) > 0.1 ? d : [0.707, 0.4, 0.707], v = o.keyframes?.length ? $(o, e.frame).position : o.position || [0, 1.5, 0];
  a.target = [...v], a.position = z(a.target, E(y, g)), c ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit()), e.setStatus(M(`Framed: ${o.name || o.type || "Subject"}`));
}
function A(e, a, c) {
  const n = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], s = c?.rotation || a?.rotation || [0, 0, 0];
  return e.state.gizmo_space === "local" ? n.map((o) => Y(o, s)) : n;
}
function H(e) {
  if (e.selectedEntity === "object") {
    const a = e.selectedObject();
    if (!a) return null;
    const c = a.type === "model" || a.type === "glb" ? e.webgl?.getObjectWorldCenter?.(a.id) : null, n = a.keyframes?.length ? $(a, e.frame) : a, s = c || n.position || [0, 0, 0];
    return {
      type: "object",
      object: a,
      position: s,
      rotation: n.rotation || [0, 0, 0],
      size: n.size || [1, 1, 1]
    };
  }
  if (e.state.view_mode !== "camera") {
    if (e.selectedEntity === "camera_target") {
      const a = e.activeCameraTrack();
      return { type: "camera_target", position: I(a, e.frame).target || e.camera.target || [0, 1.5, 0], rotation: [0, 0, 0] };
    }
    if (e.selectedEntity === "camera") {
      const a = e.activeCameraTrack();
      return { type: "camera", position: I(a, e.frame).position || e.camera.position || [6, 4, 6], rotation: [0, 0, 0] };
    }
  }
  return null;
}
function R(e) {
  const a = H(e);
  if (!a) return null;
  const c = C(e), n = a.position, s = w(n, c, e.canvas.width, e.canvas.height);
  if (!s) return null;
  const o = Math.max(0.7, k(P(c.position, n)) * 0.12), m = a.type === "object" ? A(e, a.object, a) : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (e.state.gizmo_mode !== "rotate" || a.type === "camera_target")
    return {
      entity: a,
      center: s,
      worldLength: o,
      handles: m.map((r, g) => ({ index: g, axis: r, points: [s, w(z(n, E(r, o)), c, e.canvas.width, e.canvas.height)] })).filter((r) => r.points[1])
    };
  const i = m.map((r, g) => {
    const d = Math.abs(r[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], y = S(K(r, d)), v = S(K(r, y)), l = [];
    for (let f = 0; f <= 48; f++) {
      const p = f / 48 * Math.PI * 2;
      l.push(w(z(n, z(E(y, Math.cos(p) * o), E(v, Math.sin(p) * o))), c, e.canvas.width, e.canvas.height));
    }
    return { index: g, axis: r, points: l.filter(Boolean) };
  });
  return { entity: a, center: s, worldLength: o, handles: i };
}
function G(e, a) {
  const c = R(e);
  if (!c) return null;
  let n = null;
  for (const s of c.handles)
    for (let o = 0; o < s.points.length - 1; o++) {
      const m = s.points[o], i = s.points[o + 1], r = X(a, m, i);
      (!n || r < n.distance) && (n = { ...s, distance: r, segment: [m, i], worldLength: c.worldLength, entity: c.entity });
    }
  return n?.distance <= 14 * Math.min(2, window.devicePixelRatio || 1) ? n : null;
}
function W(e, a) {
  const c = e.webgl?.pick?.(a[0], a[1], e.canvas.width, e.canvas.height);
  if (c) {
    if (typeof c == "string") {
      const i = e.state.objects.find((r) => r.id === c);
      return i ? { type: "object", object: i } : null;
    }
    if (c.type === "camera" || c.type === "camera_target") {
      const i = e.state.cameras.find((r) => r.id === c.id);
      return i ? { type: c.type, camera: i } : null;
    }
    const m = e.state.objects.find((i) => i.id === c.id);
    return m ? { type: "object", object: m } : null;
  }
  const n = C(e);
  if (e.state.view_mode !== "camera")
    for (const m of e.state.cameras) {
      for (const d of m.keyframes || []) {
        const y = d.camera?.position;
        if (!y) continue;
        const v = w(y, n, e.canvas.width, e.canvas.height);
        if (v && Math.hypot(a[0] - v[0], a[1] - v[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
          return { type: "camera_keyframe", camera: m, keyframe: d };
      }
      const i = I(m, e.frame), r = w(i.target || [0, 1.5, 0], n, e.canvas.width, e.canvas.height);
      if (r && Math.hypot(a[0] - r[0], a[1] - r[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera_target", camera: m };
      const g = w(i.position || [6, 4, 6], n, e.canvas.width, e.canvas.height);
      if (g && Math.hypot(a[0] - g[0], a[1] - g[1]) <= 22 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera", camera: m };
    }
  let o = null;
  for (const m of e.state.objects) {
    if (m.enabled === !1) continue;
    const i = m.keyframes?.length ? $(m, e.frame) : m, r = w(i.position || [0, 0, 0], n, e.canvas.width, e.canvas.height);
    if (!r) continue;
    const g = Math.hypot(a[0] - r[0], a[1] - r[1]);
    (!o || g < o.distance) && (o = { object: m, distance: g });
  }
  return o?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? { type: "object", object: o.object } : null;
}
function st(e) {
  const a = R(e);
  if (!a) return;
  const c = ["#ef5b5b", "#58cc6b", "#5f82ef"];
  e.ctx.save(), e.ctx.lineWidth = 4, e.ctx.lineCap = "round";
  for (const n of a.handles)
    if (e.ctx.strokeStyle = c[n.index], e.ctx.fillStyle = c[n.index], e.ctx.beginPath(), n.points.forEach((s, o) => {
      o ? e.ctx.lineTo(s[0], s[1]) : e.ctx.moveTo(s[0], s[1]);
    }), e.ctx.stroke(), e.state.gizmo_mode !== "rotate" || a.entity.type === "camera_target") {
      const s = n.points[n.points.length - 1];
      e.state.gizmo_mode === "scale" && a.entity.type === "object" ? e.ctx.fillRect(s[0] - 6, s[1] - 6, 12, 12) : (e.ctx.beginPath(), e.ctx.arc(s[0], s[1], 6, 0, Math.PI * 2), e.ctx.fill());
    }
  e.ctx.restore();
}
export {
  H as activeGizmoEntity,
  st as drawTransformGizmo,
  nt as frameTarget,
  A as gizmoAxes,
  R as gizmoGeometry,
  Z as onPointerDown,
  u as onPointerMove,
  tt as onPointerUp,
  et as onWheel,
  G as pickGizmo,
  W as pickSceneObject,
  ot as resetCamera,
  rt as setTransformMode,
  at as setViewMode,
  C as viewportCamera
};
