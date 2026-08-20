// Viewport navigation, object picking and transform gizmo interaction.

import { add, cameraBasis, clamp, cloneCamera, cross, distanceToSegment, length, mul, norm, project, rotateEuler, sampleCamera, sampleObjectTransform, sub } from "./omnicam-core.js";
import { t } from "./omnicam-i18n.js";

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
  for (const vm of ui.root.querySelectorAll('[data-role="view-mode"]')) vm.value = mode;
  ui.serialize();
  ui.render();
  ui.setStatus(t(`View: ${mode[0].toUpperCase()}${mode.slice(1)}`));
}

export function setTransformMode(ui, mode) {
  if (!["translate", "rotate", "scale"].includes(mode)) return;
  ui.state.gizmo_mode = mode;
  for (const button of ui.root.querySelectorAll("[data-transform-mode]")) {
    const isMode = button.dataset.transformMode === mode;
    button.classList.toggle("active", isMode);
    button.setAttribute("aria-pressed", String(isMode));
  }
  ui.serialize();
  ui.render();
  ui.setStatus(t(`${mode[0].toUpperCase()}${mode.slice(1)} · ${mode === "translate" ? "W" : mode === "rotate" ? "E" : "R"}`));
}

export function resetCamera(ui, defaultCameraFn) {
  ui.camera = defaultCameraFn();
  const fovEl = ui.root.querySelector('[data-role="fov"]');
  if (fovEl) fovEl.value = String(ui.camera.fov);
  const rollEl = ui.root.querySelector('[data-role="roll"]');
  if (rollEl) rollEl.value = String(ui.camera.roll);
  const camTypeEl = ui.root.querySelector('[data-role="camera-type"]');
  if (camTypeEl) camTypeEl.value = ui.camera.camera_type;
  ui.beginCameraEdit();
  ui.commitCameraEdit();
  ui.finishCameraEdit();
  ui.setStatus(t("Camera reset"));
}

export function frameTarget(ui) {
  const camera = viewportCamera(ui);
  const editorView = ui.state.view_mode !== "camera";
  const oldTarget = [...camera.target];

  // 1. If a sub-element (vertex, edge, face) is selected, focus directly on it!
  if (ui.subSelection?.point) {
    const pt = ui.subSelection.point;
    const currentDir = norm(sub(camera.position, oldTarget));
    const dir = (Number.isFinite(currentDir[0]) && length(currentDir) > 0.1) ? currentDir : [0.707, 0.4, 0.707];
    const dist = 2.0;

    camera.target = [...pt];
    camera.position = add(camera.target, mul(dir, dist));

    if (editorView) {
      ui.serialize();
      ui.render();
    } else {
      ui.beginCameraEdit();
      ui.commitCameraEdit();
      ui.finishCameraEdit();
    }
    const modeLabel = ui.subSelection.mode === "vertex" ? "Vertex" : (ui.subSelection.mode === "edge" ? "Edge" : "Face");
    ui.setStatus(t(`Focused on ${modeLabel} at [${pt.map((v) => Math.round(v * 100) / 100).join(", ")}]`));
    return;
  }

  // 2. Otherwise frame the selected object / subject:
  const selectedObj = ui.selectedObject();
  const targetObj = selectedObj || ui.state.objects.find((object) => object.id === "subject") || ui.state.objects[0] || { position: [0, 1.5, 0], size: [2, 3] };
  
  const size = targetObj.size || [1, 1, 1];
  const maxDim = Math.max(size[0] || 1, size[1] || 1, size[2] || 1);
  const fovRad = (((camera.fov || 35) * Math.PI) / 360);
  const idealDist = Math.max(2.0, (maxDim / Math.max(0.1, Math.tan(fovRad))) * 0.9);

  const currentDir = norm(sub(camera.position, oldTarget));
  const dir = (Number.isFinite(currentDir[0]) && length(currentDir) > 0.1) ? currentDir : [0.707, 0.4, 0.707];
  const targetPos = targetObj.keyframes?.length ? sampleObjectTransform(targetObj, ui.frame).position : (targetObj.position || [0, 1.5, 0]);

  camera.target = [...targetPos];
  camera.position = add(camera.target, mul(dir, idealDist));

  if (editorView) {
    ui.serialize();
    ui.render();
  } else {
    ui.beginCameraEdit();
    ui.commitCameraEdit();
    ui.finishCameraEdit();
  }
  ui.setStatus(t(`Framed: ${targetObj.name || targetObj.type || "Subject"}`));
}

export function gizmoAxes(ui, object, entity) {
  const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const rot = entity?.rotation || object?.rotation || [0, 0, 0];
  return ui.state.gizmo_space === "local" ? axes.map((axis) => rotateEuler(axis, rot)) : axes;
}

export function activeGizmoEntity(ui) {
  if (ui.selectedEntity === "object") {
    const object = ui.selectedObject();
    if (!object) return null;
    const modelCenter = (object.type === "model" || object.type === "glb") ? ui.webgl?.getObjectWorldCenter?.(object.id) : null;
    const transform = object.keyframes?.length ? sampleObjectTransform(object, ui.frame) : object;
    const position = modelCenter || transform.position || [0, 0, 0];
    return {
      type: "object",
      object,
      position,
      rotation: transform.rotation || [0, 0, 0],
      size: transform.size || [1, 1, 1],
    };
  }
  if (ui.state.view_mode !== "camera") {
    if (ui.selectedEntity === "camera_target") {
      const activeCam = ui.activeCameraTrack();
      const camData = sampleCamera(activeCam, ui.frame);
      return { type: "camera_target", position: camData.target || ui.camera.target || [0, 1.5, 0], rotation: [0, 0, 0] };
    }
    if (ui.selectedEntity === "camera") {
      const activeCam = ui.activeCameraTrack();
      const camData = sampleCamera(activeCam, ui.frame);
      return { type: "camera", position: camData.position || ui.camera.position || [6, 4, 6], rotation: [0, 0, 0] };
    }
  }
  return null;
}

export function gizmoGeometry(ui) {
  const entity = activeGizmoEntity(ui);
  if (!entity) return null;
  const camera = viewportCamera(ui);
  const origin = entity.position;
  const center = project(origin, camera, ui.canvas.width, ui.canvas.height);
  if (!center) return null;
  const worldLength = Math.max(0.7, length(sub(camera.position, origin)) * 0.12);
  const axes = entity.type === "object" ? gizmoAxes(ui, entity.object, entity) : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (ui.state.gizmo_mode !== "rotate" || entity.type === "camera_target")
    return {
      entity,
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
  return { entity, center, worldLength, handles };
}

export function pickGizmo(ui, pointer) {
  const geometry = gizmoGeometry(ui);
  if (!geometry) return null;
  let best = null;
  for (const handle of geometry.handles)
    for (let index = 0; index < handle.points.length - 1; index++) {
      const a = handle.points[index];
      const b = handle.points[index + 1];
      const distance = distanceToSegment(pointer, a, b);
      if (!best || distance < best.distance) best = { ...handle, distance, segment: [a, b], worldLength: geometry.worldLength, entity: geometry.entity };
    }
  return best?.distance <= 14 * Math.min(2, window.devicePixelRatio || 1) ? best : null;
}

export function pickSceneObject(ui, pointer) {
  const raycastHit = ui.webgl?.pick?.(pointer[0], pointer[1], ui.canvas.width, ui.canvas.height);
  if (raycastHit) {
    if (typeof raycastHit === "string") {
      const obj = ui.state.objects.find((o) => o.id === raycastHit);
      return obj ? { type: "object", object: obj } : null;
    }
    if (raycastHit.type === "camera" || raycastHit.type === "camera_target") {
      const cam = ui.state.cameras.find((c) => c.id === raycastHit.id);
      return cam ? { type: raycastHit.type, camera: cam } : null;
    }
    const obj = ui.state.objects.find((o) => o.id === raycastHit.id);
    return obj ? { type: "object", object: obj } : null;
  }

  const camera = viewportCamera(ui);
  const isEditorView = ui.state.view_mode !== "camera";

  if (isEditorView) {
    for (const cam of ui.state.cameras) {
      for (const key of (cam.keyframes || [])) {
        const keyPos = key.camera?.position;
        if (!keyPos) continue;
        const keyPt = project(keyPos, camera, ui.canvas.width, ui.canvas.height);
        if (keyPt && Math.hypot(pointer[0] - keyPt[0], pointer[1] - keyPt[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1)) {
          return { type: "camera_keyframe", camera: cam, keyframe: key };
        }
      }
      const camData = sampleCamera(cam, ui.frame);
      const tgtPoint = project(camData.target || [0, 1.5, 0], camera, ui.canvas.width, ui.canvas.height);
      if (tgtPoint && Math.hypot(pointer[0] - tgtPoint[0], pointer[1] - tgtPoint[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1)) {
        return { type: "camera_target", camera: cam };
      }
      const posPoint = project(camData.position || [6, 4, 6], camera, ui.canvas.width, ui.canvas.height);
      if (posPoint && Math.hypot(pointer[0] - posPoint[0], pointer[1] - posPoint[1]) <= 22 * Math.min(2, window.devicePixelRatio || 1)) {
        return { type: "camera", camera: cam };
      }
    }
  }

  let best = null;
  for (const object of ui.state.objects) {
    if (object.enabled === false) continue;
    const transform = object.keyframes?.length ? sampleObjectTransform(object, ui.frame) : object;
    const point = project(transform.position || [0, 0, 0], camera, ui.canvas.width, ui.canvas.height);
    if (!point) continue;
    const distance = Math.hypot(pointer[0] - point[0], pointer[1] - point[1]);
    if (!best || distance < best.distance) best = { object, distance };
  }
  return best?.distance <= 22 * Math.min(2, window.devicePixelRatio || 1) ? { type: "object", object: best.object } : null;
}

export function drawTransformGizmo(ui) {
  const geometry = gizmoGeometry(ui);
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
    if (ui.state.gizmo_mode !== "rotate" || geometry.entity.type === "camera_target") {
      const end = handle.points[handle.points.length - 1];
      if (ui.state.gizmo_mode === "scale" && geometry.entity.type === "object") ui.ctx.fillRect(end[0] - 6, end[1] - 6, 12, 12);
      else {
        ui.ctx.beginPath();
        ui.ctx.arc(end[0], end[1], 6, 0, Math.PI * 2);
        ui.ctx.fill();
      }
    }
  }
  ui.ctx.restore();
}


export * from "./viewport-controls/interactions.js";
