// Viewport navigation, object picking and transform gizmo interaction.

import { add, cameraBasis, clamp, cloneCamera, cross, distanceToSegment, length, mul, norm, project, rotateEuler, sampleCamera, sampleObjectTransform, sub } from "./director/core.js";
import { t } from "./i18n.js";

export function viewportCamera(ui) {
  return ui.recording
    ? ui.playblastCameraAtFrame()
    : ui.state.view_mode === "camera"
      ? ui.camera
      : ui.state.editor_views[ui.state.view_mode];
}

export function setViewMode(ui, mode) {
  if (!["camera", "perspective", "iso", "front", "back", "top", "right", "left", "bottom"].includes(mode)) return;
  ui.state.view_mode = mode;
  for (const vm of ui.root.querySelectorAll('[data-role="view-mode"]')) vm.value = mode;
  for (const button of ui.root.querySelectorAll("[data-view]")) {
    const active = button.dataset.view === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
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
  ui.checkpoint("Reset camera");
  ui.camera = defaultCameraFn();
  for (const el of ui.root.querySelectorAll('[data-role="camera-fov"]')) el.value = String(ui.camera.fov);
  for (const el of ui.root.querySelectorAll('[data-role="camera-roll"]')) el.value = String(ui.camera.roll);
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
    ui.checkpoint("Frame selection");
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
  // A rigged model animates inside its node, so its transform stays at the
  // origin while the character moves. The bone-aware centre is what the gizmo
  // and the aim constraint already use, and it is what F should frame too.
  const modelCentre = (targetObj.type === "model" || targetObj.type === "glb")
    ? ui.webgl?.getObjectWorldCenter?.(targetObj.id)
    : null;
  const targetPos = modelCentre
    || (targetObj.keyframes?.length ? sampleObjectTransform(targetObj, ui.frame).position : (targetObj.position || [0, 1.5, 0]));

  ui.checkpoint("Frame subject");
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
    if (!object || object.locked) return null;
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
      const camData = sampleCamera(activeCam, ui.frame, ui.state.objects);
      return { type: "camera_target", position: camData.target || ui.camera.target || [0, 1.5, 0], rotation: [0, 0, 0] };
    }
    if (ui.selectedEntity === "camera") {
      const activeCam = ui.activeCameraTrack();
      const camData = sampleCamera(activeCam, ui.frame, ui.state.objects);
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
  if (!origin || !Number.isFinite(origin[0]) || !Number.isFinite(origin[1]) || !Number.isFinite(origin[2])) return null;
  const center = project(origin, camera, ui.canvas.width, ui.canvas.height);
  if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) return null;
  const worldLength = Math.max(0.7, length(sub(camera.position, origin)) * 0.12);
  const axes = entity.type === "object" ? gizmoAxes(ui, entity.object, entity) : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (ui.state.gizmo_mode !== "rotate" || entity.type === "camera_target")
    return {
      entity,
      center,
      worldLength,
      handles: axes
        .map((axis, index) => ({ index, axis, points: [center, project(add(origin, mul(axis, worldLength)), camera, ui.canvas.width, ui.canvas.height)] }))
        .filter((handle) => handle.points[1] && Number.isFinite(handle.points[1][0]) && Number.isFinite(handle.points[1][1])),
    };
  const handles = axes.map((normal, index) => {
    const seed = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u = norm(cross(normal, seed));
    const v = norm(cross(normal, u));
    const points = [];
    for (let step = 0; step <= 48; step++) {
      const angle = (step / 48) * Math.PI * 2;
      const pt = project(add(origin, add(mul(u, Math.cos(angle) * worldLength), mul(v, Math.sin(angle) * worldLength))), camera, ui.canvas.width, ui.canvas.height);
      if (pt && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) points.push(pt);
    }
    return { index, axis: normal, points };
  });
  return { entity, center, worldLength, handles };
}

export function pickGizmo(ui, pointer) {
  const geometry = gizmoGeometry(ui);
  if (!geometry) return null;
  const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
  const centerDistance = Math.hypot(pointer[0] - geometry.center[0], pointer[1] - geometry.center[1]);
  // The junction of the three axes is a fourth handle in both modes: in
  // translate it moves freely off-axis, in scale it grows or shrinks every
  // axis together (a homothety) instead of one at a time.
  const hasCenterHandle = geometry.entity.type === "object"
    && (ui.state.gizmo_mode === "translate" || ui.state.gizmo_mode === "scale");
  if (hasCenterHandle && centerDistance <= 11 * pixelRatio) {
    const center = geometry.center;
    return {
      free: true,
      index: -1,
      axis: [0, 0, 0],
      distance: centerDistance,
      segment: [center, [center[0] + 1, center[1]]],
      worldLength: geometry.worldLength,
      entity: geometry.entity,
    };
  }
  let best = null;
  for (const handle of geometry.handles)
    for (let index = 0; index < handle.points.length - 1; index++) {
      const a = handle.points[index];
      const b = handle.points[index + 1];
      const distance = distanceToSegment(pointer, a, b);
      if (!best || distance < best.distance) best = { ...handle, distance, segment: [a, b], worldLength: geometry.worldLength, entity: geometry.entity };
    }
  return best?.distance <= 18 * pixelRatio ? best : null;
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
      const camData = sampleCamera(cam, ui.frame, ui.state.objects);
      const tgtPoint = project(camData.target || [0, 1.5, 0], camera, ui.canvas.width, ui.canvas.height);
      if (tgtPoint && Math.hypot(pointer[0] - tgtPoint[0], pointer[1] - tgtPoint[1]) <= 18 * Math.min(2, window.devicePixelRatio || 1)) {
        return { type: "camera_target", camera: cam };
      }
      const posPoint = project(camData.position || [6, 4, 6], camera, ui.canvas.width, ui.canvas.height);
      if (posPoint && Math.hypot(pointer[0] - posPoint[0], pointer[1] - posPoint[1]) <= 22 * Math.min(2, window.devicePixelRatio || 1)) {
        return { type: "camera", camera: cam };
      }
    }

    for (const obj of ui.state.objects) {
      if (obj.enabled === false) continue;
      for (const key of (obj.keyframes || [])) {
        const keyPos = key.transform?.position;
        if (!keyPos) continue;
        const keyPt = project(keyPos, camera, ui.canvas.width, ui.canvas.height);
        if (keyPt && Math.hypot(pointer[0] - keyPt[0], pointer[1] - keyPt[1]) <= 16 * Math.min(2, window.devicePixelRatio || 1)) {
          return { type: "object_keyframe", object: obj, keyframe: key };
        }
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

/** A Maya-style cone tip pointing from `from` toward `to`, filled with the
 * current fill style. Distinguishes a translate handle from a scale handle's
 * square tip at a glance, the way Maya's own move/scale tools do. */
function drawArrowHead(ctx, from, to, size = 15) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const halfWidth = size * 0.4;
  const backX = to[0] - ux * size;
  const backY = to[1] - uy * size;
  ctx.beginPath();
  ctx.moveTo(to[0], to[1]);
  ctx.lineTo(backX + px * halfWidth, backY + py * halfWidth);
  ctx.lineTo(backX - px * halfWidth, backY - py * halfWidth);
  ctx.closePath();
  ctx.fill();
}

export function drawTransformGizmo(ui) {
  const geometry = gizmoGeometry(ui);
  if (!geometry || !geometry.handles) return;
  const colors = ["#ef5b5b", "#58cc6b", "#5f82ef"];
  ui.ctx.save();
  ui.ctx.lineWidth = 4;
  ui.ctx.lineCap = "round";
  for (const handle of geometry.handles) {
    if (!handle?.points?.length) continue;
    const highlighted = ui.hoveredGizmoHandle === handle.index || ui.gizmoDrag?.axisIndex === handle.index;
    ui.ctx.lineWidth = highlighted ? 7 : 4;
    ui.ctx.strokeStyle = highlighted ? "#ffffff" : (colors[handle.index] || "#ffffff");
    ui.ctx.fillStyle = colors[handle.index] || "#ffffff";
    ui.ctx.beginPath();
    handle.points.forEach((point, index) => {
      if (!point) return;
      if (index) ui.ctx.lineTo(point[0], point[1]);
      else ui.ctx.moveTo(point[0], point[1]);
    });
    ui.ctx.stroke();
    if (ui.state.gizmo_mode !== "rotate" || geometry.entity?.type === "camera_target") {
      const validPoints = handle.points.filter((p) => p && Number.isFinite(p[0]) && Number.isFinite(p[1]));
      if (!validPoints.length) continue;
      const end = validPoints[validPoints.length - 1];
      if (ui.state.gizmo_mode === "scale" && geometry.entity?.type === "object") {
        ui.ctx.fillRect(end[0] - 6, end[1] - 6, 12, 12);
      } else {
        // A cone reads as "translate" the way Maya's move tool does; a bare
        // dot does not distinguish translate from anything else.
        drawArrowHead(ui.ctx, validPoints[0], end);
      }
    }
  }
  const hasCenterHandle = geometry.entity?.type === "object"
    && (ui.state.gizmo_mode === "translate" || ui.state.gizmo_mode === "scale");
  if (hasCenterHandle) {
    const centerHighlighted = ui.hoveredGizmoHandle === "free" || ui.gizmoDrag?.free;
    ui.ctx.fillStyle = centerHighlighted ? "#fbbf24" : "#f4f7fb";
    ui.ctx.strokeStyle = "#15171c";
    ui.ctx.lineWidth = 2;
    ui.ctx.beginPath();
    if (ui.state.gizmo_mode === "scale") {
      // A small cube face, like Maya's uniform-scale manipulator, instead of
      // the round free-move handle -- so the two centre handles read as
      // "move" and "scale" even before you hover them.
      const half = centerHighlighted ? 8 : 6;
      ui.ctx.rect(geometry.center[0] - half, geometry.center[1] - half, half * 2, half * 2);
    } else {
      ui.ctx.arc(geometry.center[0], geometry.center[1], centerHighlighted ? 10 : 7, 0, Math.PI * 2);
    }
    ui.ctx.fill();
    ui.ctx.stroke();
  }
  ui.ctx.restore();
}

export * from "./viewport-controls/interactions.js";
