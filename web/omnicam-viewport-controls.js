import { sampleObjectTransform as $, sampleCamera as P, norm as k, sub as I, length as K, add as C, mul as _, rotateEuler as R, project as w, cross as L, distanceToSegment as T } from "./omnicam-core.js";
import { t as F } from "./omnicam-i18n.js";
import { cameraBasis as O, length as E, sub as D, defaultEditorViews as N, cloneCamera as Y, add as h, mul as p, rotateEuler as X, clamp as M } from "./omnicam-core.js";
import { onKeyDragMove as B } from "./omnicam-timeline-interaction.js";
import { t as z } from "./omnicam-i18n.js";
function u(e, t) {
  if (t.target?.closest?.("button,input,select")) return;
  if (t.button === 2 && !t.altKey) {
    t.preventDefault?.(), t.stopPropagation?.(), t.stopImmediatePropagation?.();
    return;
  }
  t.preventDefault?.(), t.stopPropagation?.(), e.closeMenus(), e.interactionElement.focus({ preventScroll: !0 }), e.interactionElement.setPointerCapture?.(t.pointerId), e.activePointerId = t.pointerId, e.canvas.classList.add("dragging");
  const c = e.interactionElement.getBoundingClientRect(), r = (t.clientX - c.left) * e.canvas.width / Math.max(1, c.width), o = (t.clientY - c.top) * e.canvas.height / Math.max(1, c.height), a = S(e), s = e.state.view_mode !== "camera", i = t.button === 0, l = i && (t.ctrlKey || t.metaKey) && !t.altKey && !t.shiftKey ? A(e, [r, o]) : null;
  if (l) {
    const [g, f] = l.segment, d = Math.max(1, Math.hypot(f[0] - g[0], f[1] - g[1])), j = {
      pointer: [r, o],
      axis: l.axis,
      axisIndex: l.index,
      screen: [(f[0] - g[0]) / d, (f[1] - g[1]) / d],
      worldLength: l.worldLength,
      screenLength: d
    };
    if (l.entity.type === "camera_target") {
      e.beginCameraEdit(), e.gizmoDrag = {
        ...j,
        type: "camera_target",
        target: [...l.entity.position || e.camera.target]
      };
      return;
    }
    if (l.entity.type === "camera") {
      e.beginCameraEdit(), e.gizmoDrag = {
        ...j,
        type: "camera",
        position: [...l.entity.position || e.camera.position],
        target: [...e.camera.target]
      };
      return;
    }
    if (l.entity.type === "object") {
      const x = l.entity.object;
      e.beginObjectEdit(x), e.gizmoDrag = {
        ...j,
        type: "object",
        object: x,
        position: [...l.entity.position],
        rotation: [...l.entity.rotation],
        size: [...l.entity.size]
      };
      return;
    }
  }
  const m = i ? H(e, [r, o]) : null;
  if (e.pointerHit = !!(l || m), m) {
    if (m.type === "camera_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(m.camera.id), e.setFrame(m.keyframe.frame), e.selectKeyframe(m.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(z(`${m.camera.name} · Keyframe @ F${m.keyframe.frame} selected`));
      return;
    }
    if (m.type === "object_keyframe") {
      e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectId = m.object.id, e.editingKeyFrame = null, e.setFrame(m.keyframe.frame), e.selectKeyframe(m.keyframe), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(z(`${m.object.name || m.object.type} · Keyframe @ F${m.keyframe.frame} selected`));
      return;
    }
    if (m.type === "camera_target") {
      e.finishCameraEdit(), e.selectedEntity = "camera_target", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(m.camera.id), e.beginCameraEdit();
      const { right: g, up: f } = O(a), d = [...e.camera.target], j = E(D(a.position, d)), x = (a.fov || 35) * Math.PI / 360;
      e.targetFreeDrag = {
        pointer: [r, o],
        target: d,
        right: g,
        up: f,
        scale: j * (a.camera_type === "orthographic" ? 25e-4 : 2 * Math.tan(x) / e.canvas.height)
      }, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(z(`${m.camera.name} · Target aim selected`));
      return;
    }
    if (m.type === "camera" && (e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(m.camera.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(z(`${m.camera.name} selected`))), m.type === "object" && m.object) {
      if (e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectId = m.object.id, e.selectedKeyFrame = m.object.keyframes?.find((g) => g.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.state.select_mode && e.state.select_mode !== "object") {
        const g = e.webgl?.pickSubElement?.(r, o, e.canvas.width, e.canvas.height, e.state.select_mode);
        if (g) {
          e.subSelection = g;
          const f = g.point.map((j) => Math.round(j * 100) / 100).join(", "), d = g.mode === "vertex" ? "Vertex" : g.mode === "edge" ? "Edge" : "Face";
          e.setStatus(z(`${d} selected at [${f}] · Press F to focus`));
        } else
          e.subSelection = null;
      } else
        e.subSelection = null, e.setStatus(z(`${m.object.name || m.object.type} selected`));
      e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
    }
  }
  const y = t.button === 1 || t.altKey && t.button === 1 || t.shiftKey && (t.button === 0 || t.button === 1) || a.camera_type === "orthographic", b = t.altKey && t.button === 2 || t.button === 2 && !e.isNavigatingFly, v = !!e.isNavigatingFly;
  s || e.beginCameraEdit(), s && !e.state.editor_views && (e.state.editor_views = N()), e.drag = {
    x: t.clientX,
    y: t.clientY,
    shift: y,
    dolly: b,
    fly: v,
    camera: Y(a),
    target: s ? e.state.editor_views[e.state.view_mode] || (e.state.editor_views[e.state.view_mode] = N()[e.state.view_mode]) : e.camera,
    editorView: s
  };
}
function ee(e, t) {
  if (e.keyDrag) {
    B(e, t);
    return;
  }
  if (e.targetFreeDrag) {
    const a = e.interactionElement.getBoundingClientRect(), s = (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width), i = (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height), n = s - e.targetFreeDrag.pointer[0], l = i - e.targetFreeDrag.pointer[1], m = h(p(e.targetFreeDrag.right, n * e.targetFreeDrag.scale), p(e.targetFreeDrag.up, -l * e.targetFreeDrag.scale));
    e.camera.target = h(e.targetFreeDrag.target, m), e.commitCameraEdit(), e.refreshInspector(), e.render();
    return;
  }
  if (e.gizmoDrag) {
    const a = e.interactionElement.getBoundingClientRect(), s = [
      (t.clientX - a.left) * e.canvas.width / Math.max(1, a.width),
      (t.clientY - a.top) * e.canvas.height / Math.max(1, a.height)
    ], i = (s[0] - e.gizmoDrag.pointer[0]) * e.gizmoDrag.screen[0] + (s[1] - e.gizmoDrag.pointer[1]) * e.gizmoDrag.screen[1];
    if (e.gizmoDrag.type === "camera_target") {
      e.camera.target = h(e.gizmoDrag.target, p(e.gizmoDrag.axis, i * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength)), e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.gizmoDrag.type === "camera") {
      if (e.state.gizmo_mode === "translate")
        e.camera.position = h(e.gizmoDrag.position, p(e.gizmoDrag.axis, i * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
      else {
        const n = i * 0.015, l = D(e.gizmoDrag.target, e.gizmoDrag.position), m = X(l, p(e.gizmoDrag.axis, n * (180 / Math.PI)));
        e.camera.target = h(e.gizmoDrag.position, m);
      }
      e.commitCameraEdit(), e.refreshInspector(), e.render();
      return;
    }
    if (e.state.gizmo_mode === "translate")
      e.gizmoDrag.object.position = h(e.gizmoDrag.position, p(e.gizmoDrag.axis, i * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength));
    else if (e.state.gizmo_mode === "scale") {
      const n = [...e.gizmoDrag.size];
      n[e.gizmoDrag.axisIndex] = Math.max(0.01, n[e.gizmoDrag.axisIndex] + i * e.gizmoDrag.worldLength / e.gizmoDrag.screenLength), e.gizmoDrag.object.size = n;
    } else {
      const n = [...e.gizmoDrag.rotation];
      n[e.gizmoDrag.axisIndex] += i * 0.75, e.gizmoDrag.object.rotation = n;
    }
    e.commitObjectEdit(e.gizmoDrag.object), e.refreshInspector(), e.render();
    return;
  }
  if (e.objectDrag) {
    const a = t.clientX - e.objectDrag.x, s = t.clientY - e.objectDrag.y, { right: i, up: n } = O(e.objectDrag.camera), l = E(D(e.objectDrag.camera.position, e.objectDrag.position)) * 25e-4;
    e.objectDrag.object.position = h(e.objectDrag.position, h(p(i, a * l), p(n, -s * l))), e.commitObjectEdit(e.objectDrag.object), e.refreshInspector(), e.render();
    return;
  }
  if (!e.drag) return;
  const c = t.clientX - e.drag.x, r = t.clientY - e.drag.y, o = e.drag.camera;
  if (e.drag.dolly) {
    const a = Math.exp(r * 5e-3), s = D(o.position, o.target);
    e.drag.target.position = h(o.target, p(s, a)), e.drag.target.camera_type === "orthographic" && (e.drag.target.zoom = Math.max(0.01, (o.zoom || 1) / a));
  } else if (e.drag.fly) {
    const a = D(o.target, o.position), s = E(a);
    let i = Math.atan2(a[0], a[2]), n = Math.asin(M(a[1] / s, -0.999, 0.999));
    i -= c * 8e-3, n = M(n - r * 8e-3, -1.45, 1.45), e.drag.target.target = [
      o.position[0] + s * Math.sin(i) * Math.cos(n),
      o.position[1] + s * Math.sin(n),
      o.position[2] + s * Math.cos(i) * Math.cos(n)
    ];
  } else if (e.drag.shift) {
    const { right: a, up: s } = O(o), i = E(D(o.position, o.target)) * 25e-4, n = h(p(a, -c * i), p(s, r * i));
    e.drag.target.position = h(o.position, n), e.drag.target.target = h(o.target, n);
  } else {
    const a = D(o.position, o.target), s = E(a);
    let i = Math.atan2(a[0], a[2]), n = Math.asin(M(a[1] / s, -0.999, 0.999));
    i -= c * 8e-3, n = M(n + r * 8e-3, -1.45, 1.45), e.drag.target.position = [
      o.target[0] + s * Math.sin(i) * Math.cos(n),
      o.target[1] + s * Math.sin(n),
      o.target[2] + s * Math.cos(i) * Math.cos(n)
    ];
  }
  e.drag.editorView ? (e.serialize(), e.render()) : e.commitCameraEdit();
}
function te(e, t) {
  const c = e.keyDrag, r = !!(e.drag && !e.drag.editorView || e.targetFreeDrag), o = !!(e.gizmoDrag || e.objectDrag);
  !e.pointerHit && !e.gizmoDrag && !e.objectDrag && !e.targetFreeDrag && e.drag && t && Math.hypot(t.clientX - e.drag.x, t.clientY - e.drag.y) < 5 && (t.button === 0 || t.button === void 0) && (e.selectedEntity === "object" || e.selectedObjectId !== null || e.selectedEntity === "camera_target") && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = null, e.subSelection = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(z("Deselected"))), t?.pointerId === e.activePointerId && e.interactionElement.hasPointerCapture?.(t.pointerId) && e.interactionElement.releasePointerCapture(t.pointerId), e.activePointerId = null, e.drag = null, e.objectDrag = null, e.gizmoDrag = null, e.targetFreeDrag = null, e.keyDrag = null, e.pointerHit = !1, e.canvas.classList.remove("dragging"), c && (c.badge?.remove(), e.editingKeyFrame = null, e.updateKeyVisualState(), e.root.focus({ preventScroll: !0 })), r && e.finishCameraEdit(), o && (e.editingKeyFrame = null, e.updateKeyVisualState(), e.drawCurveEditor());
}
function ae(e, t) {
  if (t.target.closest?.(".viewport-inspector, .scene-tree, .menu-panel, .context-menu, .viewport-quick-bar"))
    return;
  t.preventDefault(), t.stopPropagation(), e.closeMenus();
  const c = e.state.view_mode !== "camera", r = S(e);
  c || e.beginCameraEdit();
  const o = M(t.deltaY * 1e-3, -0.4, 0.4), a = D(r.position, r.target);
  r.position = h(r.target, p(a, Math.exp(o))), r.camera_type === "orthographic" && (r.zoom = Math.max(0.01, (r.zoom || 1) * Math.exp(-o))), c ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit());
}
function S(e) {
  return e.recording ? e.playblastCameraAtFrame() : e.state.view_mode === "camera" ? e.camera : e.state.editor_views[e.state.view_mode];
}
function re(e, t) {
  if (["camera", "perspective", "top", "right", "left", "bottom"].includes(t)) {
    e.state.view_mode = t;
    for (const c of e.root.querySelectorAll('[data-role="view-mode"]')) c.value = t;
    e.serialize(), e.render(), e.setStatus(F(`View: ${t[0].toUpperCase()}${t.slice(1)}`));
  }
}
function oe(e, t) {
  if (["translate", "rotate", "scale"].includes(t)) {
    e.state.gizmo_mode = t;
    for (const c of e.root.querySelectorAll("[data-transform-mode]")) {
      const r = c.dataset.transformMode === t;
      c.classList.toggle("active", r), c.setAttribute("aria-pressed", String(r));
    }
    e.serialize(), e.render(), e.setStatus(F(`${t[0].toUpperCase()}${t.slice(1)} · ${t === "translate" ? "W" : t === "rotate" ? "E" : "R"}`));
  }
}
function ne(e, t) {
  e.camera = t();
  const c = e.root.querySelector('[data-role="fov"]');
  c && (c.value = String(e.camera.fov));
  const r = e.root.querySelector('[data-role="roll"]');
  r && (r.value = String(e.camera.roll));
  const o = e.root.querySelector('[data-role="camera-type"]');
  o && (o.value = e.camera.camera_type), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.setStatus(F("Camera reset"));
}
function se(e) {
  const t = S(e), c = e.state.view_mode !== "camera", r = [...t.target];
  if (e.subSelection?.point) {
    const v = e.subSelection.point, g = k(I(t.position, r)), f = Number.isFinite(g[0]) && K(g) > 0.1 ? g : [0.707, 0.4, 0.707], d = 2;
    t.target = [...v], t.position = C(t.target, _(f, d)), c ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit());
    const j = e.subSelection.mode === "vertex" ? "Vertex" : e.subSelection.mode === "edge" ? "Edge" : "Face";
    e.setStatus(F(`Focused on ${j} at [${v.map((x) => Math.round(x * 100) / 100).join(", ")}]`));
    return;
  }
  const a = e.selectedObject() || e.state.objects.find((v) => v.id === "subject") || e.state.objects[0] || { position: [0, 1.5, 0], size: [2, 3] }, s = a.size || [1, 1, 1], i = Math.max(s[0] || 1, s[1] || 1, s[2] || 1), n = (t.fov || 35) * Math.PI / 360, l = Math.max(2, i / Math.max(0.1, Math.tan(n)) * 0.9), m = k(I(t.position, r)), y = Number.isFinite(m[0]) && K(m) > 0.1 ? m : [0.707, 0.4, 0.707], b = a.keyframes?.length ? $(a, e.frame).position : a.position || [0, 1.5, 0];
  t.target = [...b], t.position = C(t.target, _(y, l)), c ? (e.serialize(), e.render()) : (e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit()), e.setStatus(F(`Framed: ${a.name || a.type || "Subject"}`));
}
function q(e, t, c) {
  const r = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], o = c?.rotation || t?.rotation || [0, 0, 0];
  return e.state.gizmo_space === "local" ? r.map((a) => R(a, o)) : r;
}
function G(e) {
  if (e.selectedEntity === "object") {
    const t = e.selectedObject();
    if (!t) return null;
    const c = t.type === "model" || t.type === "glb" ? e.webgl?.getObjectWorldCenter?.(t.id) : null, r = t.keyframes?.length ? $(t, e.frame) : t, o = c || r.position || [0, 0, 0];
    return {
      type: "object",
      object: t,
      position: o,
      rotation: r.rotation || [0, 0, 0],
      size: r.size || [1, 1, 1]
    };
  }
  if (e.state.view_mode !== "camera") {
    if (e.selectedEntity === "camera_target") {
      const t = e.activeCameraTrack();
      return { type: "camera_target", position: P(t, e.frame).target || e.camera.target || [0, 1.5, 0], rotation: [0, 0, 0] };
    }
    if (e.selectedEntity === "camera") {
      const t = e.activeCameraTrack();
      return { type: "camera", position: P(t, e.frame).position || e.camera.position || [6, 4, 6], rotation: [0, 0, 0] };
    }
  }
  return null;
}
function V(e) {
  const t = G(e);
  if (!t) return null;
  const c = S(e), r = t.position;
  if (!r || !Number.isFinite(r[0]) || !Number.isFinite(r[1]) || !Number.isFinite(r[2])) return null;
  const o = w(r, c, e.canvas.width, e.canvas.height);
  if (!o || !Number.isFinite(o[0]) || !Number.isFinite(o[1])) return null;
  const a = Math.max(0.7, K(I(c.position, r)) * 0.12), s = t.type === "object" ? q(e, t.object, t) : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (e.state.gizmo_mode !== "rotate" || t.type === "camera_target")
    return {
      entity: t,
      center: o,
      worldLength: a,
      handles: s.map((n, l) => ({ index: l, axis: n, points: [o, w(C(r, _(n, a)), c, e.canvas.width, e.canvas.height)] })).filter((n) => n.points[1] && Number.isFinite(n.points[1][0]) && Number.isFinite(n.points[1][1]))
    };
  const i = s.map((n, l) => {
    const m = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], y = k(L(n, m)), b = k(L(n, y)), v = [];
    for (let g = 0; g <= 48; g++) {
      const f = g / 48 * Math.PI * 2, d = w(C(r, C(_(y, Math.cos(f) * a), _(b, Math.sin(f) * a))), c, e.canvas.width, e.canvas.height);
      d && Number.isFinite(d[0]) && Number.isFinite(d[1]) && v.push(d);
    }
    return { index: l, axis: n, points: v };
  });
  return { entity: t, center: o, worldLength: a, handles: i };
}
function A(e, t) {
  const c = V(e);
  if (!c) return null;
  let r = null;
  for (const o of c.handles)
    for (let a = 0; a < o.points.length - 1; a++) {
      const s = o.points[a], i = o.points[a + 1], n = T(t, s, i);
      (!r || n < r.distance) && (r = { ...o, distance: n, segment: [s, i], worldLength: c.worldLength, entity: c.entity });
    }
  return r?.distance <= 14 * Math.min(2, window.devicePixelRatio || 1) ? r : null;
}
function H(e, t) {
  const c = e.webgl?.pick?.(t[0], t[1], e.canvas.width, e.canvas.height);
  if (c) {
    if (typeof c == "string") {
      const i = e.state.objects.find((n) => n.id === c);
      return i ? { type: "object", object: i } : null;
    }
    if (c.type === "camera" || c.type === "camera_target") {
      const i = e.state.cameras.find((n) => n.id === c.id);
      return i ? { type: c.type, camera: i } : null;
    }
    const s = e.state.objects.find((i) => i.id === c.id);
    return s ? { type: "object", object: s } : null;
  }
  const r = S(e);
  if (e.state.view_mode !== "camera") {
    for (const s of e.state.cameras) {
      for (const m of s.keyframes || []) {
        const y = m.camera?.position;
        if (!y) continue;
        const b = w(y, r, e.canvas.width, e.canvas.height);
        if (b && Math.hypot(t[0] - b[0], t[1] - b[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
          return { type: "camera_keyframe", camera: s, keyframe: m };
      }
      const i = P(s, e.frame), n = w(i.target || [0, 1.5, 0], r, e.canvas.width, e.canvas.height);
      if (n && Math.hypot(t[0] - n[0], t[1] - n[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera_target", camera: s };
      const l = w(i.position || [6, 4, 6], r, e.canvas.width, e.canvas.height);
      if (l && Math.hypot(t[0] - l[0], t[1] - l[1]) <= 22 * Math.min(2, window.devicePixelRatio || 1))
        return { type: "camera", camera: s };
    }
    for (const s of e.state.objects)
      if (s.enabled !== !1)
        for (const i of s.keyframes || []) {
          const n = i.transform?.position;
          if (!n) continue;
          const l = w(n, r, e.canvas.width, e.canvas.height);
          if (l && Math.hypot(t[0] - l[0], t[1] - l[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1))
            return { type: "object_keyframe", object: s, keyframe: i };
        }
  }
  let a = null;
  for (const s of e.state.objects) {
    if (s.enabled === !1) continue;
    const i = s.keyframes?.length ? $(s, e.frame) : s, n = w(i.position || [0, 0, 0], r, e.canvas.width, e.canvas.height);
    if (!n) continue;
    const l = Math.hypot(t[0] - n[0], t[1] - n[1]);
    (!a || l < a.distance) && (a = { object: s, distance: l });
  }
  return a?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? { type: "object", object: a.object } : null;
}
function ce(e) {
  const t = V(e);
  if (!t || !t.handles) return;
  const c = ["#ef5b5b", "#58cc6b", "#5f82ef"];
  e.ctx.save(), e.ctx.lineWidth = 4, e.ctx.lineCap = "round";
  for (const r of t.handles)
    if (r?.points?.length && (e.ctx.strokeStyle = c[r.index] || "#ffffff", e.ctx.fillStyle = c[r.index] || "#ffffff", e.ctx.beginPath(), r.points.forEach((o, a) => {
      o && (a ? e.ctx.lineTo(o[0], o[1]) : e.ctx.moveTo(o[0], o[1]));
    }), e.ctx.stroke(), e.state.gizmo_mode !== "rotate" || t.entity?.type === "camera_target")) {
      const o = r.points.filter((s) => s && Number.isFinite(s[0]) && Number.isFinite(s[1]));
      if (!o.length) continue;
      const a = o[o.length - 1];
      e.state.gizmo_mode === "scale" && t.entity?.type === "object" ? e.ctx.fillRect(a[0] - 6, a[1] - 6, 12, 12) : (e.ctx.beginPath(), e.ctx.arc(a[0], a[1], 6, 0, Math.PI * 2), e.ctx.fill());
    }
  e.ctx.restore();
}
export {
  G as activeGizmoEntity,
  ce as drawTransformGizmo,
  se as frameTarget,
  q as gizmoAxes,
  V as gizmoGeometry,
  u as onPointerDown,
  ee as onPointerMove,
  te as onPointerUp,
  ae as onWheel,
  A as pickGizmo,
  H as pickSceneObject,
  ne as resetCamera,
  oe as setTransformMode,
  re as setViewMode,
  S as viewportCamera
};
