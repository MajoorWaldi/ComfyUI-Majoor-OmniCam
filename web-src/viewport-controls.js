// Viewport navigation, object picking and transform gizmo interaction.

import { add, cameraBasis, clamp, cloneCamera, cross, distanceToSegment, length, mul, norm, project, rotateEuler, sub } from "./omnicam-core.js";
import { t } from "./omnicam-i18n.js";
import { onKeyDragMove } from "./omnicam-timeline.js";

export function viewportCamera(ui) {
  return ui.recording
    ? ui.playblastCameraAtFrame()
    : ui.state.view_mode === "camera"
      ? ui.camera
      : ui.state.editor_views[ui.state.view_mode];
}

export function setViewMode(ui, mode) {
  if (!["camera", "perspective", "top", "right", "left", "bottom"].includes(mode)) return;
  ui.state.view_mode = mode;
  ui.root.querySelector('[data-role="view-mode"]').value = mode;
  ui.serialize();
  ui.render();
  ui.setStatus(t(`View: ${mode[0].toUpperCase()}${mode.slice(1)}`));
}

export function setTransformMode(ui, mode) {
  if (!["translate", "rotate", "scale"].includes(mode)) return;
  ui.state.gizmo_mode = mode;
  for (const button of ui.root.querySelectorAll("[data-transform-mode]")) button.classList.toggle("active", button.dataset.transformMode === mode);
  ui.serialize();
  ui.render();
  ui.setStatus(t(`${mode[0].toUpperCase()}${mode.slice(1)} · ${mode === "translate" ? "T" : mode === "rotate" ? "R" : "S"}`));
}

export function resetCamera(ui, defaultCameraFn) {
  ui.camera = defaultCameraFn();
  ui.root.querySelector('[data-role="fov"]').value = String(ui.camera.fov);
  ui.root.querySelector('[data-role="roll"]').value = String(ui.camera.roll);
  ui.root.querySelector('[data-role="camera-type"]').value = ui.camera.camera_type;
  ui.beginCameraEdit();
  ui.commitCameraEdit();
  ui.finishCameraEdit();
  ui.setStatus(t("Camera reset"));
}

export function frameTarget(ui) {
  const subject = ui.state.objects.find((object) => object.id === "subject") || { position: [0, 1.5, 0] };
  const camera = viewportCamera(ui);
  const editorView = ui.state.view_mode !== "camera";
  const oldTarget = [...camera.target];
  const distance = Math.max(2.5, length(sub(camera.position, oldTarget)));
  const dir = norm(sub(camera.position, oldTarget));
  camera.target = [...subject.position];
  camera.position = add(camera.target, mul(dir, distance));
  if (editorView) {
    ui.serialize();
    ui.render();
  } else {
    ui.beginCameraEdit();
    ui.commitCameraEdit();
    ui.finishCameraEdit();
  }
}

export function gizmoAxes(ui, object) {
  const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  return ui.state.gizmo_space === "local" ? axes.map((axis) => rotateEuler(axis, object.rotation)) : axes;
}

export function gizmoGeometry(ui, object) {
  const camera = viewportCamera(ui);
  const origin = object.position || [0, 0, 0];
  const center = project(origin, camera, ui.canvas.width, ui.canvas.height);
  if (!center) return null;
  const worldLength = Math.max(0.7, length(sub(camera.position, origin)) * 0.12);
  const axes = gizmoAxes(ui, object);
  if (ui.state.gizmo_mode !== "rotate")
    return {
      center,
      worldLength,
      handles: axes
        .map((axis, index) => ({ index, axis, points: [center, project(add(origin, mul(axis, worldLength)), camera, ui.canvas.width, ui.canvas.height)] }))
        .filter((handle) => handle.points[1]),
    };
  const handles = axes.map((normal, index) => {
    const seed = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u = norm(cross(normal, seed));
    const v = norm(cross(normal, u));
    const points = [];
    for (let step = 0; step <= 48; step++) {
      const angle = (step / 48) * Math.PI * 2;
      points.push(project(add(origin, add(mul(u, Math.cos(angle) * worldLength), mul(v, Math.sin(angle) * worldLength))), camera, ui.canvas.width, ui.canvas.height));
    }
    return { index, axis: normal, points: points.filter(Boolean) };
  });
  return { center, worldLength, handles };
}

export function pickGizmo(ui, pointer) {
  const object = ui.selectedObject();
  const geometry = object && gizmoGeometry(ui, object);
  if (!geometry) return null;
  let best = null;
  for (const handle of geometry.handles)
    for (let index = 0; index < handle.points.length - 1; index++) {
      const a = handle.points[index];
      const b = handle.points[index + 1];
      const distance = distanceToSegment(pointer, a, b);
      if (!best || distance < best.distance) best = { ...handle, distance, segment: [a, b], worldLength: geometry.worldLength };
    }
  return best?.distance <= 14 * Math.min(2, window.devicePixelRatio || 1) ? best : null;
}

export function pickSceneObject(ui, pointer) {
  const raycastId = ui.webgl?.pick?.(pointer[0], pointer[1], ui.canvas.width, ui.canvas.height);
  if (raycastId) return ui.state.objects.find((object) => object.id === raycastId) || null;
  const camera = viewportCamera(ui);
  let best = null;
  for (const object of ui.state.objects) {
    if (object.enabled === false) continue;
    const point = project(object.position || [0, 0, 0], camera, ui.canvas.width, ui.canvas.height);
    if (!point) continue;
    const distance = Math.hypot(pointer[0] - point[0], pointer[1] - point[1]);
    if (!best || distance < best.distance) best = { object, distance };
  }
  return best?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? best.object : null;
}

export function drawTransformGizmo(ui) {
  const object = ui.selectedObject();
  const geometry = object && gizmoGeometry(ui, object);
  if (!geometry) return;
  const colors = ["#ef5b5b", "#58cc6b", "#5f82ef"];
  ui.ctx.save();
  ui.ctx.lineWidth = 4;
  ui.ctx.lineCap = "round";
  for (const handle of geometry.handles) {
    ui.ctx.strokeStyle = colors[handle.index];
    ui.ctx.fillStyle = colors[handle.index];
    ui.ctx.beginPath();
    handle.points.forEach((point, index) => {
      if (index) ui.ctx.lineTo(point[0], point[1]);
      else ui.ctx.moveTo(point[0], point[1]);
    });
    ui.ctx.stroke();
    if (ui.state.gizmo_mode !== "rotate") {
      const end = handle.points[handle.points.length - 1];
      if (ui.state.gizmo_mode === "scale") ui.ctx.fillRect(end[0] - 6, end[1] - 6, 12, 12);
      else {
        ui.ctx.beginPath();
        ui.ctx.arc(end[0], end[1], 6, 0, Math.PI * 2);
        ui.ctx.fill();
      }
    }
  }
  ui.ctx.restore();
}

export function onPointerDown(ui, e) {
  if (e.target?.closest?.("button,input,select")) return;
  e.preventDefault?.();
  e.stopPropagation?.();
  ui.closeMenus();
  ui.interactionElement.focus({ preventScroll: true });
  ui.interactionElement.setPointerCapture?.(e.pointerId);
  ui.activePointerId = e.pointerId;
  ui.canvas.classList.add("dragging");
  const selected = ui.selectedObject();
  const viewCamera = viewportCamera(ui);
  const projected = selected ? project(selected.position || [0, 0, 0], viewCamera, ui.canvas.width, ui.canvas.height) : null;
  const rect = ui.interactionElement.getBoundingClientRect();
  const pointerX = ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width);
  const pointerY = ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height);
  const picked = pickGizmo(ui, [pointerX, pointerY]);
  if (picked && selected) {
    ui.beginObjectEdit(selected);
    const [a, b] = picked.segment;
    const screenLength = Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]));
    ui.gizmoDrag = {
      pointer: [pointerX, pointerY],
      object: selected,
      axis: picked.axis,
      axisIndex: picked.index,
      screen: [(b[0] - a[0]) / screenLength, (b[1] - a[1]) / screenLength],
      worldLength: picked.worldLength,
      screenLength,
      position: [...selected.position],
      rotation: [...(selected.rotation || [0, 0, 0])],
      size: [...(selected.size || [1, 1, 1])],
    };
    return;
  }
  const hit = pickSceneObject(ui, [pointerX, pointerY]);
  if (hit && (ui.selectedEntity !== "object" || hit.id !== ui.selectedObjectId)) {
    ui.selectedEntity = "object";
    ui.selectedObjectId = hit.id;
    ui.selectedKeyFrame = hit.keyframes?.find((key) => key.frame === ui.frame)?.frame ?? null;
    ui.refreshObjects();
    ui.refreshKeys();
    ui.render();
    if (ui.interactionElement.hasPointerCapture?.(e.pointerId)) ui.interactionElement.releasePointerCapture(e.pointerId);
    ui.activePointerId = null;
    ui.canvas.classList.remove("dragging");
    return;
  }
  if (e.altKey && projected && Math.hypot(pointerX - projected[0], pointerY - projected[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1)) {
    ui.beginObjectEdit(selected);
    ui.objectDrag = { x: e.clientX, y: e.clientY, position: [...selected.position], camera: cloneCamera(viewCamera), object: selected };
    return;
  }
  const editorView = ui.state.view_mode !== "camera";
  if (!editorView) ui.beginCameraEdit();
  ui.drag = {
    x: e.clientX,
    y: e.clientY,
    shift: e.shiftKey || e.button === 1 || viewportCamera(ui).camera_type === "orthographic",
    camera: cloneCamera(viewCamera),
    target: editorView ? ui.state.editor_views[ui.state.view_mode] : ui.camera,
    editorView,
  };
}

export function onPointerMove(ui, e) {
  if (ui.keyDrag) {
    onKeyDragMove(ui, e);
    return;
  }
  if (ui.gizmoDrag) {
    const rect = ui.interactionElement.getBoundingClientRect();
    const pointer = [
      ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width),
      ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height),
    ];
    const deltaPixels = (pointer[0] - ui.gizmoDrag.pointer[0]) * ui.gizmoDrag.screen[0] + (pointer[1] - ui.gizmoDrag.pointer[1]) * ui.gizmoDrag.screen[1];
    if (ui.state.gizmo_mode === "translate") {
      ui.gizmoDrag.object.position = add(ui.gizmoDrag.position, mul(ui.gizmoDrag.axis, (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength));
    } else if (ui.state.gizmo_mode === "scale") {
      const size = [...ui.gizmoDrag.size];
      size[ui.gizmoDrag.axisIndex] = Math.max(0.01, size[ui.gizmoDrag.axisIndex] + (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength);
      ui.gizmoDrag.object.size = size;
    } else {
      const rotation = [...ui.gizmoDrag.rotation];
      rotation[ui.gizmoDrag.axisIndex] += deltaPixels * 0.75;
      ui.gizmoDrag.object.rotation = rotation;
    }
    ui.commitObjectEdit(ui.gizmoDrag.object);
    ui.refreshInspector();
    ui.render();
    return;
  }
  if (ui.objectDrag) {
    const dx = e.clientX - ui.objectDrag.x;
    const dy = e.clientY - ui.objectDrag.y;
    const { right, up } = cameraBasis(ui.objectDrag.camera);
    const scale = length(sub(ui.objectDrag.camera.position, ui.objectDrag.position)) * 25e-4;
    ui.objectDrag.object.position = add(ui.objectDrag.position, add(mul(right, dx * scale), mul(up, -dy * scale)));
    ui.commitObjectEdit(ui.objectDrag.object);
    ui.refreshInspector();
    ui.render();
    return;
  }
  if (!ui.drag) return;
  const dx = e.clientX - ui.drag.x;
  const dy = e.clientY - ui.drag.y;
  const base = ui.drag.camera;
  if (ui.drag.shift) {
    const { right, up } = cameraBasis(base);
    const scale = length(sub(base.position, base.target)) * 25e-4;
    const delta = add(mul(right, -dx * scale), mul(up, dy * scale));
    ui.drag.target.position = add(base.position, delta);
    ui.drag.target.target = add(base.target, delta);
  } else {
    const offset = sub(base.position, base.target);
    const r = length(offset);
    let yaw = Math.atan2(offset[0], offset[2]);
    let pitch = Math.asin(clamp(offset[1] / r, -0.999, 0.999));
    yaw -= dx * 8e-3;
    pitch = clamp(pitch + dy * 8e-3, -1.45, 1.45);
    ui.drag.target.position = [
      base.target[0] + r * Math.sin(yaw) * Math.cos(pitch),
      base.target[1] + r * Math.sin(pitch),
      base.target[2] + r * Math.cos(yaw) * Math.cos(pitch),
    ];
  }
  if (ui.drag.editorView) {
    ui.serialize();
    ui.render();
  } else ui.commitCameraEdit();
}

export function onPointerUp(ui, event) {
  const finishedKeyDrag = ui.keyDrag;
  const finishedCameraDrag = Boolean(ui.drag && !ui.drag.editorView);
  const finishedObjectEdit = Boolean(ui.gizmoDrag || ui.objectDrag);
  if (event?.pointerId === ui.activePointerId && ui.interactionElement.hasPointerCapture?.(event.pointerId)) ui.interactionElement.releasePointerCapture(event.pointerId);
  ui.activePointerId = null;
  ui.drag = null;
  ui.objectDrag = null;
  ui.gizmoDrag = null;
  ui.keyDrag = null;
  ui.canvas.classList.remove("dragging");
  if (finishedKeyDrag) {
    ui.editingKeyFrame = null;
    ui.updateKeyVisualState();
    ui.root.focus({ preventScroll: true });
  }
  if (finishedCameraDrag) ui.finishCameraEdit();
  if (finishedObjectEdit) {
    ui.editingKeyFrame = null;
    ui.updateKeyVisualState();
    ui.drawCurveEditor();
  }
}

export function onWheel(ui, e) {
  e.preventDefault();
  e.stopPropagation();
  ui.closeMenus();
  const editorView = ui.state.view_mode !== "camera";
  const camera = viewportCamera(ui);
  if (!editorView) ui.beginCameraEdit();
  const delta = clamp(e.deltaY * 1e-3, -0.4, 0.4);
  const offset = sub(camera.position, camera.target);
  camera.position = add(camera.target, mul(offset, Math.exp(delta)));
  if (camera.camera_type === "orthographic") camera.zoom = Math.max(0.01, (camera.zoom || 1) * Math.exp(-delta));
  if (editorView) {
    ui.serialize();
    ui.render();
  } else {
    ui.commitCameraEdit();
    ui.finishCameraEdit();
  }
}
