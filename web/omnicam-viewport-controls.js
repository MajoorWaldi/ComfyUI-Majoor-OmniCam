import { length as x, sub as f, norm as j, add as d, mul as g, rotateEuler as S, project as w, cross as C, cloneCamera as E, cameraBasis as I, clamp as D, distanceToSegment as _ } from "./omnicam-core.js";
import { t as y } from "./omnicam-i18n.js";
import { onKeyDragMove as L } from "./omnicam-timeline.js";
function b(t) {
  return t.recording ? t.playblastCameraAtFrame() : t.state.view_mode === "camera" ? t.camera : t.state.editor_views[t.state.view_mode];
}
function R(t, e) {
  ["camera", "perspective", "top", "right", "left", "bottom"].includes(e) && (t.state.view_mode = e, t.root.querySelector('[data-role="view-mode"]').value = e, t.serialize(), t.render(), t.setStatus(y(`View: ${e[0].toUpperCase()}${e.slice(1)}`)));
}
function X(t, e) {
  if (["translate", "rotate", "scale"].includes(e)) {
    t.state.gizmo_mode = e;
    for (const o of t.root.querySelectorAll("[data-transform-mode]")) o.classList.toggle("active", o.dataset.transformMode === e);
    t.serialize(), t.render(), t.setStatus(y(`${e[0].toUpperCase()}${e.slice(1)} · ${e === "translate" ? "T" : e === "rotate" ? "R" : "S"}`));
  }
}
function B(t, e) {
  t.camera = e(), t.root.querySelector('[data-role="fov"]').value = String(t.camera.fov), t.root.querySelector('[data-role="roll"]').value = String(t.camera.roll), t.root.querySelector('[data-role="camera-type"]').value = t.camera.camera_type, t.beginCameraEdit(), t.commitCameraEdit(), t.finishCameraEdit(), t.setStatus(y("Camera reset"));
}
function q(t) {
  const e = t.state.objects.find((i) => i.id === "subject") || { position: [0, 1.5, 0] }, o = b(t), s = t.state.view_mode !== "camera", n = [...o.target], a = Math.max(2.5, x(f(o.position, n))), c = j(f(o.position, n));
  o.target = [...e.position], o.position = d(o.target, g(c, a)), s ? (t.serialize(), t.render()) : (t.beginCameraEdit(), t.commitCameraEdit(), t.finishCameraEdit());
}
function O(t, e) {
  const o = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  return t.state.gizmo_space === "local" ? o.map((s) => S(s, e.rotation)) : o;
}
function P(t, e) {
  const o = b(t), s = e.position || [0, 0, 0], n = w(s, o, t.canvas.width, t.canvas.height);
  if (!n) return null;
  const a = Math.max(0.7, x(f(o.position, s)) * 0.12), c = O(t, e);
  if (t.state.gizmo_mode !== "rotate")
    return {
      center: n,
      worldLength: a,
      handles: c.map((r, l) => ({ index: l, axis: r, points: [n, w(d(s, g(r, a)), o, t.canvas.width, t.canvas.height)] })).filter((r) => r.points[1])
    };
  const i = c.map((r, l) => {
    const v = Math.abs(r[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], m = j(C(r, v)), h = j(C(r, m)), p = [];
    for (let z = 0; z <= 48; z++) {
      const M = z / 48 * Math.PI * 2;
      p.push(w(d(s, d(g(m, Math.cos(M) * a), g(h, Math.sin(M) * a))), o, t.canvas.width, t.canvas.height));
    }
    return { index: l, axis: r, points: p.filter(Boolean) };
  });
  return { center: n, worldLength: a, handles: i };
}
function k(t, e) {
  const o = t.selectedObject(), s = o && P(t, o);
  if (!s) return null;
  let n = null;
  for (const a of s.handles)
    for (let c = 0; c < a.points.length - 1; c++) {
      const i = a.points[c], r = a.points[c + 1], l = _(e, i, r);
      (!n || l < n.distance) && (n = { ...a, distance: l, segment: [i, r], worldLength: s.worldLength });
    }
  return n?.distance <= 14 * Math.min(2, window.devicePixelRatio || 1) ? n : null;
}
function K(t, e) {
  const o = t.webgl?.pick?.(e[0], e[1], t.canvas.width, t.canvas.height);
  if (o) return t.state.objects.find((a) => a.id === o) || null;
  const s = b(t);
  let n = null;
  for (const a of t.state.objects) {
    if (a.enabled === !1) continue;
    const c = w(a.position || [0, 0, 0], s, t.canvas.width, t.canvas.height);
    if (!c) continue;
    const i = Math.hypot(e[0] - c[0], e[1] - c[1]);
    (!n || i < n.distance) && (n = { object: a, distance: i });
  }
  return n?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? n.object : null;
}
function $(t) {
  const e = t.selectedObject(), o = e && P(t, e);
  if (!o) return;
  const s = ["#ef5b5b", "#58cc6b", "#5f82ef"];
  t.ctx.save(), t.ctx.lineWidth = 4, t.ctx.lineCap = "round";
  for (const n of o.handles)
    if (t.ctx.strokeStyle = s[n.index], t.ctx.fillStyle = s[n.index], t.ctx.beginPath(), n.points.forEach((a, c) => {
      c ? t.ctx.lineTo(a[0], a[1]) : t.ctx.moveTo(a[0], a[1]);
    }), t.ctx.stroke(), t.state.gizmo_mode !== "rotate") {
      const a = n.points[n.points.length - 1];
      t.state.gizmo_mode === "scale" ? t.ctx.fillRect(a[0] - 6, a[1] - 6, 12, 12) : (t.ctx.beginPath(), t.ctx.arc(a[0], a[1], 6, 0, Math.PI * 2), t.ctx.fill());
    }
  t.ctx.restore();
}
function F(t, e) {
  if (e.target?.closest?.("button,input,select")) return;
  e.preventDefault?.(), e.stopPropagation?.(), t.closeMenus(), t.interactionElement.focus({ preventScroll: !0 }), t.interactionElement.setPointerCapture?.(e.pointerId), t.activePointerId = e.pointerId, t.canvas.classList.add("dragging");
  const o = t.selectedObject(), s = b(t), n = o ? w(o.position || [0, 0, 0], s, t.canvas.width, t.canvas.height) : null, a = t.interactionElement.getBoundingClientRect(), c = (e.clientX - a.left) * t.canvas.width / Math.max(1, a.width), i = (e.clientY - a.top) * t.canvas.height / Math.max(1, a.height), r = k(t, [c, i]);
  if (r && o) {
    t.beginObjectEdit(o);
    const [m, h] = r.segment, p = Math.max(1, Math.hypot(h[0] - m[0], h[1] - m[1]));
    t.gizmoDrag = {
      pointer: [c, i],
      object: o,
      axis: r.axis,
      axisIndex: r.index,
      screen: [(h[0] - m[0]) / p, (h[1] - m[1]) / p],
      worldLength: r.worldLength,
      screenLength: p,
      position: [...o.position],
      rotation: [...o.rotation || [0, 0, 0]],
      size: [...o.size || [1, 1, 1]]
    };
    return;
  }
  const l = K(t, [c, i]);
  if (l && (t.selectedEntity !== "object" || l.id !== t.selectedObjectId)) {
    t.selectedEntity = "object", t.selectedObjectId = l.id, t.selectedKeyFrame = l.keyframes?.find((m) => m.frame === t.frame)?.frame ?? null, t.refreshObjects(), t.refreshKeys(), t.render(), t.interactionElement.hasPointerCapture?.(e.pointerId) && t.interactionElement.releasePointerCapture(e.pointerId), t.activePointerId = null, t.canvas.classList.remove("dragging");
    return;
  }
  if (e.altKey && n && Math.hypot(c - n[0], i - n[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1)) {
    t.beginObjectEdit(o), t.objectDrag = { x: e.clientX, y: e.clientY, position: [...o.position], camera: E(s), object: o };
    return;
  }
  const v = t.state.view_mode !== "camera";
  v || t.beginCameraEdit(), t.drag = {
    x: e.clientX,
    y: e.clientY,
    shift: e.shiftKey || e.button === 1 || b(t).camera_type === "orthographic",
    camera: E(s),
    target: v ? t.state.editor_views[t.state.view_mode] : t.camera,
    editorView: v
  };
}
function A(t, e) {
  if (t.keyDrag) {
    L(t, e);
    return;
  }
  if (t.gizmoDrag) {
    const a = t.interactionElement.getBoundingClientRect(), c = [
      (e.clientX - a.left) * t.canvas.width / Math.max(1, a.width),
      (e.clientY - a.top) * t.canvas.height / Math.max(1, a.height)
    ], i = (c[0] - t.gizmoDrag.pointer[0]) * t.gizmoDrag.screen[0] + (c[1] - t.gizmoDrag.pointer[1]) * t.gizmoDrag.screen[1];
    if (t.state.gizmo_mode === "translate")
      t.gizmoDrag.object.position = d(t.gizmoDrag.position, g(t.gizmoDrag.axis, i * t.gizmoDrag.worldLength / t.gizmoDrag.screenLength));
    else if (t.state.gizmo_mode === "scale") {
      const r = [...t.gizmoDrag.size];
      r[t.gizmoDrag.axisIndex] = Math.max(0.01, r[t.gizmoDrag.axisIndex] + i * t.gizmoDrag.worldLength / t.gizmoDrag.screenLength), t.gizmoDrag.object.size = r;
    } else {
      const r = [...t.gizmoDrag.rotation];
      r[t.gizmoDrag.axisIndex] += i * 0.75, t.gizmoDrag.object.rotation = r;
    }
    t.commitObjectEdit(t.gizmoDrag.object), t.refreshInspector(), t.render();
    return;
  }
  if (t.objectDrag) {
    const a = e.clientX - t.objectDrag.x, c = e.clientY - t.objectDrag.y, { right: i, up: r } = I(t.objectDrag.camera), l = x(f(t.objectDrag.camera.position, t.objectDrag.position)) * 25e-4;
    t.objectDrag.object.position = d(t.objectDrag.position, d(g(i, a * l), g(r, -c * l))), t.commitObjectEdit(t.objectDrag.object), t.refreshInspector(), t.render();
    return;
  }
  if (!t.drag) return;
  const o = e.clientX - t.drag.x, s = e.clientY - t.drag.y, n = t.drag.camera;
  if (t.drag.shift) {
    const { right: a, up: c } = I(n), i = x(f(n.position, n.target)) * 25e-4, r = d(g(a, -o * i), g(c, s * i));
    t.drag.target.position = d(n.position, r), t.drag.target.target = d(n.target, r);
  } else {
    const a = f(n.position, n.target), c = x(a);
    let i = Math.atan2(a[0], a[2]), r = Math.asin(D(a[1] / c, -0.999, 0.999));
    i -= o * 8e-3, r = D(r + s * 8e-3, -1.45, 1.45), t.drag.target.position = [
      n.target[0] + c * Math.sin(i) * Math.cos(r),
      n.target[1] + c * Math.sin(r),
      n.target[2] + c * Math.cos(i) * Math.cos(r)
    ];
  }
  t.drag.editorView ? (t.serialize(), t.render()) : t.commitCameraEdit();
}
function G(t, e) {
  const o = t.keyDrag, s = !!(t.drag && !t.drag.editorView), n = !!(t.gizmoDrag || t.objectDrag);
  e?.pointerId === t.activePointerId && t.interactionElement.hasPointerCapture?.(e.pointerId) && t.interactionElement.releasePointerCapture(e.pointerId), t.activePointerId = null, t.drag = null, t.objectDrag = null, t.gizmoDrag = null, t.keyDrag = null, t.canvas.classList.remove("dragging"), o && (t.editingKeyFrame = null, t.updateKeyVisualState(), t.root.focus({ preventScroll: !0 })), s && t.finishCameraEdit(), n && (t.editingKeyFrame = null, t.updateKeyVisualState(), t.drawCurveEditor());
}
function U(t, e) {
  e.preventDefault(), e.stopPropagation(), t.closeMenus();
  const o = t.state.view_mode !== "camera", s = b(t);
  o || t.beginCameraEdit();
  const n = D(e.deltaY * 1e-3, -0.4, 0.4), a = f(s.position, s.target);
  s.position = d(s.target, g(a, Math.exp(n))), s.camera_type === "orthographic" && (s.zoom = Math.max(0.01, (s.zoom || 1) * Math.exp(-n))), o ? (t.serialize(), t.render()) : (t.commitCameraEdit(), t.finishCameraEdit());
}
export {
  $ as drawTransformGizmo,
  q as frameTarget,
  O as gizmoAxes,
  P as gizmoGeometry,
  F as onPointerDown,
  A as onPointerMove,
  G as onPointerUp,
  U as onWheel,
  k as pickGizmo,
  K as pickSceneObject,
  B as resetCamera,
  X as setTransformMode,
  R as setViewMode,
  b as viewportCamera
};
